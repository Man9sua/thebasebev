# Runs as one Odoo transaction. The transaction lock also covers retries after
# a network timeout, so two deliveries cannot create two quotations.
# The installer fixes this literal per action; the payload cannot select a mode.
receiver_test_mode = True
payload = env.context.get('tb_stripe_order') or {}
session = payload.get('session_id', '')
payment = payload.get('payment_intent', '')
digest = payload.get('snapshot_hash', '')
if payload.get('test_mode') is not receiver_test_mode or not session.startswith('cs_test_' if receiver_test_mode else 'cs_live_') or not payment.startswith('pi_'):
    raise UserError('A verified Stripe payment in the receiver mode is required.')
if not all(c in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_' for c in session + payment):
    raise UserError('Invalid payment reference.')
if len(digest) != 64 or not all(c in '0123456789abcdef' for c in digest):
    raise UserError('Invalid order snapshot.')
lock_key = payload.get('lock_key')
if not isinstance(lock_key, int) or lock_key <= 0 or lock_key > 9007199254740991:
    raise UserError('Invalid transaction key.')
env.cr.execute('SELECT pg_advisory_xact_lock(%s)', [lock_key])
reference = ('TB-STRIPE-TEST:' if receiver_test_mode else 'TB-STRIPE-LIVE:') + session
Sale = env['sale.order'].with_company(1).with_context(tracking_disable=True, mail_create_nosubscribe=True, mail_notrack=True)
existing = Sale.search([('client_order_ref', '=', reference), ('company_id', '=', 1)])
if len(existing) > 1:
    raise UserError('Duplicate payment references need review.')
expected = payload.get('amounts') or {}
total = expected.get('total')
if not isinstance(total, int) or total <= 0 or payload.get('currency') != 'AED':
    raise UserError('Invalid paid amount.')
if existing:
    order = existing
    annotation = env['mail.message'].search([('model', '=', 'sale.order'), ('res_id', '=', order.id), ('body', 'ilike', digest), ('subtype_id', '=', env.ref('mail.mt_note').id)], limit=1)
    if order.origin != payment or not annotation or int(round(order.amount_total * 100)) != total:
        raise UserError('The stored quotation does not match this payment.')
else:
    tax = env['account.tax'].browse(3).exists()
    pricelist = env['product.pricelist'].browse(11).exists()
    if not tax or tax.amount != 5 or tax.price_include or tax.amount_type != 'percent' or tax.company_id.id != 1:
        raise UserError('The approved exclusive UAE VAT rate is unavailable.')
    if not pricelist or pricelist.currency_id.name != 'AED' or pricelist.company_id.id != 1:
        raise UserError('The approved AED pricelist is unavailable.')
    rows = payload.get('lines') or []
    if not rows or len(rows) > 100:
        raise UserError('Invalid order lines.')
    commands = []
    for row in rows:
        product = env['product.product'].browse(row.get('product_id')).exists()
        quantity = row.get('quantity')
        unit = row.get('unit_amount')
        if not product or not product.active or not product.sale_ok or product.default_code != row.get('sku'):
            raise UserError('An approved product variant is unavailable.')
        if not isinstance(quantity, int) or quantity < 1 or quantity > 999999 or not isinstance(unit, int) or unit < 0:
            raise UserError('Invalid quantity or price.')
        kind = row.get('kind')
        if kind not in ['products', 'samples', 'delivery'] or (kind == 'samples' and unit != 0):
            raise UserError('Invalid line type.')
        commands.append((0, 0, {'product_id': product.id, 'name': row.get('name') or product.display_name,
            'product_uom_qty': quantity, 'product_uom_id': product.uom_id.id,
            'price_unit': unit / 100.0, 'discount': 0,
            'tax_ids': [(6, 0, [] if kind == 'samples' else [tax.id])]}))
    buyer = payload.get('buyer') or {}
    billing = payload.get('billing') or {}
    shipping = payload.get('shipping') or {}
    if not buyer.get('name') or not buyer.get('email') or not shipping.get('line1') or shipping.get('country') != 'AE' or not billing.get('line1'):
        raise UserError('Buyer, billing and UAE delivery addresses are required.')
    billing_country = env['res.country'].search([('code', '=', billing.get('country'))], limit=1)
    if not billing_country:
        raise UserError('A valid billing country is required.')
    billing_state = env['res.country.state'].search([('country_id', '=', billing_country.id), '|', ('code', '=ilike', billing.get('state') or ''), ('name', '=ilike', billing.get('state') or '')], limit=1)
    shipping_state = env['res.country.state'].search([('country_id', '=', 2), '|', ('code', '=ilike', shipping.get('state') or ''), ('name', '=ilike', shipping.get('state') or '')], limit=1)
    Partner = env['res.partner'].with_context(tracking_disable=True, mail_create_nosubscribe=True, mail_notrack=True)
    partner = Partner.create({'name': ('[STRIPE TEST] ' if receiver_test_mode else '') + buyer['name'], 'email': buyer['email'],
        'phone': buyer.get('phone') or False, 'company_name': buyer.get('company') or False,
        'ref': reference, 'country_id': billing_country.id, 'street': billing.get('line1') or False,
        'street2': billing.get('line2') or False, 'city': billing.get('city') or billing_state.name or billing.get('state') or False, 'state_id': billing_state.id or False,
        'zip': billing.get('postal_code') or False, 'company_id': 1})
    delivery = Partner.create({'parent_id': partner.id, 'name': shipping.get('name') or buyer['name'],
        'type': 'delivery', 'country_id': 2, 'street': shipping['line1'], 'street2': shipping.get('line2') or False,
        'city': shipping.get('city') or shipping_state.name or shipping.get('state') or buyer.get('city') or False,
        'state_id': shipping_state.id or False, 'zip': shipping.get('postal_code') or False, 'company_id': 1})
    note = ('<p>STRIPE TEST — payment verified; no real charge.</p>' if receiver_test_mode else '<p>Stripe payment verified.</p>') + '<p>Session: ' + session + '</p><p>Payment: ' + payment + '</p><p>Snapshot: ' + digest + '</p><p>Paid AED: ' + str(total / 100.0) + '</p>'
    note += '<p>Attribution: ' + (payload.get('attribution_note') or '') + '</p><p>Customer note: ' + (payload.get('customer_note') or '') + '</p>'
    values = {'partner_id': partner.id, 'partner_invoice_id': partner.id,
        'partner_shipping_id': delivery.id, 'company_id': 1, 'pricelist_id': pricelist.id,
        'currency_id': pricelist.currency_id.id, 'client_order_ref': reference, 'origin': payment,
        'state': 'draft', 'order_line': commands}
    if receiver_test_mode:
        values['name'] = 'STRIPE TEST / ' + session[-16:]
    order = Sale.create(values)
    if order.state != 'draft' or order.invoice_ids or order.picking_ids:
        raise UserError('Paid website orders must remain draft quotations without invoices or transfers.')
    if int(round(order.amount_untaxed * 100)) != expected.get('subtotal') + expected.get('shipping') or int(round(order.amount_tax * 100)) != expected.get('vat') or int(round(order.amount_total * 100)) != total:
        raise UserError('Odoo totals differ from the verified Stripe payment. Transaction rolled back.')
    # Record the internal annotation directly, without an email/recipient fan-out.
    env['mail.message'].create({'model': 'sale.order', 'res_id': order.id, 'body': note,
        'subject': 'STRIPE TEST — verified payment' if receiver_test_mode else 'Stripe — verified payment', 'message_type': 'comment',
        'subtype_id': env.ref('mail.mt_note').id, 'author_id': env.user.partner_id.id,
        'partner_ids': [(6, 0, [])]})
action = {'type': 'ir.actions.act_window', 'res_model': 'sale.order', 'res_id': order.id,
    'view_mode': 'form', 'tb_state': order.state, 'tb_name': order.name,
    'tb_total': int(round(order.amount_total * 100)), 'tb_duplicate': bool(existing)}
