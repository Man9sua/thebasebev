# Shop pricing and UAE delivery

Approved by the owner on 2026-11-01.

Source: `BaseBev_Master_Price_List_to_01.09.2026 (1).xlsx`, sheet `PRICE LIST`, columns B (name), C (SKU), D (UAE AED).
SHA-256: `8fd054d675414286f21a2e0e21d8fa6f6a233e130d36eccfb39af2df979b2c1c`.

The workbook has 247 price rows. `src/data/shop-prices.json` maps 89 of the 132 current product/flavour combinations to a specific source SKU and pack size. Amounts are integer AED fils; all source amounts are before VAT. The 43 unresolved combinations below remain available for quotation. Never substitute a neighbouring flavour, regional recipe, pack size or price.

## Confirmed calculation rules

| Selection | Delivery before VAT |
| --- | ---: |
| Paid goods below AED 500 before VAT, with or without samples | AED 30 |
| Paid goods at or above AED 500 before VAT, with or without samples | Free |
| Samples only, known parcel weight up to 5 kg inclusive | AED 30 |
| Samples only, unknown weight or above 5 kg | Quote required |
| Outside UAE or an unapproved express method | Quote required |

VAT is 5% additional on paid goods and non-free delivery. Free samples contribute zero to the subtotal and to the free-delivery threshold. A mixed order has one delivery charge. VAT rounds per order line and delivery in integer fils. Sample weights come from the matching Odoo sample SKU where unambiguous; unknown weights stay on quotation. Tea and Sugar Free sale SKUs ending `s1-dp100` are packs of 100 one-gram sachets.

Orders placed on weekdays are delivered the next day. Weekend orders are delivered in 1–2 days. No calendar date, cutoff time or weekend definition is inferred.

Examples: AED 480 in goods + AED 30 delivery + AED 25.50 VAT = AED 535.50. AED 500 in goods + free delivery + AED 25 VAT = AED 525. A sample-only parcel within 5 kg is AED 31.50 including VAT.

## Payment readiness

VAT labels and the tax breakdown appear only on the checkout page. Shop cards,
flavour selection, the floating cart control and the basket drawer show no VAT
annotation. Their prices remain the source net prices; the final tax-inclusive
total is presented at checkout.

Price calculation does not enable card payments. Stripe tax setup, verified events, durable idempotency and delivery to an Odoo Sales draft quotation must be complete before `SHOP_ORDER_PAYMENTS_READY` can be enabled. No invoice, order confirmation or accounting payment is created by the pricing step.

## Unresolved variants

| Range | Flavour | Missing information |
| --- | --- | --- |
| matcha | Pecan Kumquat | No unambiguous matching price and pack size in this workbook. |
| matcha | No Added Sugar | MT-000-f500 Base (65.70 AED) and MT-019-f500 Classic (116.90 AED). Confirm product. |
| chocolate | Hot Chocolate Pudding | No unambiguous matching price and pack size in this workbook. |
| cordial | Sweet and Sour Mix | No unambiguous matching price and pack size in this workbook. |
| iced-tea | Mango | Only regional SKU IT-099/RU-f500 (25.77 AED). Confirm that this is the UAE shop variant. |
| raf-coffee | Banana Ice Cream | Two 500 g variants: RF-007-f500 (28.50 AED), RF-023-f500 (28.95 AED). Confirm SKU. |
| raf-coffee | Ptichye Moloko | Two 500 g variants: RF-002-f500 (33.55 AED), RF-024-f500 (31.22 AED). Confirm SKU. |
| cream-latte | Blueberry | No unambiguous matching price and pack size in this workbook. |
| cream-latte | Cheesy Cream | No unambiguous matching price and pack size in this workbook. |
| topping | Cherry | No unambiguous matching price and pack size in this workbook. |
| topping | Hibiscus | No unambiguous matching price and pack size in this workbook. |
| jam | Lemon Ginger Honey | No unambiguous matching price and pack size in this workbook. |
| jam | Pomegranate Rose | No unambiguous matching price and pack size in this workbook. |
| jam | Mango Passion Fruit | No unambiguous matching price and pack size in this workbook. |
| jam | Sea Buckthorn Orange | No unambiguous matching price and pack size in this workbook. |
| jam | Apple Cinnamon Cardamom | No unambiguous matching price and pack size in this workbook. |
| vending | Matcha | Available codes are in the R&D / recipe not approved section. Requires product approval. |
| puree | Raspberry | No unambiguous matching price and pack size in this workbook. |
| puree | Peach | No unambiguous matching price and pack size in this workbook. |
| puree | Strawberry | No unambiguous matching price and pack size in this workbook. |
| puree | Blueberry | No unambiguous matching price and pack size in this workbook. |
| puree | Passion fruit | No unambiguous matching price and pack size in this workbook. |
| puree | Mango | No unambiguous matching price and pack size in this workbook. |
| sauce | Caramel | No unambiguous matching price and pack size in this workbook. |
| sauce | Chocolate | No unambiguous matching price and pack size in this workbook. |
| sauce | White chocolate | No unambiguous matching price and pack size in this workbook. |
| add-ons | Electrolyte | No unambiguous matching price and pack size in this workbook. |
| add-ons | Prebiotic fiber | No unambiguous matching price and pack size in this workbook. |
| add-ons | Immunity | No unambiguous matching price and pack size in this workbook. |
| add-ons | Glycine | No unambiguous matching price and pack size in this workbook. |
| add-ons | Magnesium | No unambiguous matching price and pack size in this workbook. |
| add-ons | Collagen | No unambiguous matching price and pack size in this workbook. |
| add-ons | Creatine | No unambiguous matching price and pack size in this workbook. |
| colour-collection | Matcha | No matching 100 g tin price in the source. Do not scale a 500 g price. |
| colour-collection | Hojicha | No matching 100 g tin price in the source. Do not scale a 500 g price. |
| colour-collection | Butterfly Pea | No matching 100 g tin price in the source. Do not scale a 500 g price. |
| colour-collection | Dragon Fruit | No matching 100 g tin price in the source. Do not scale a 500 g price. |
| colour-collection | Ube | No matching 100 g tin price in the source. Do not scale a 500 g price. |
| electrolyte | Orange | Five generic EPD stick codes lack flavour labels. Confirm flavour-to-SKU mapping. |
| electrolyte | Pomegranate | Five generic EPD stick codes lack flavour labels. Confirm flavour-to-SKU mapping. |
| electrolyte | Lemon mint | Five generic EPD stick codes lack flavour labels. Confirm flavour-to-SKU mapping. |
| electrolyte | Lemon | Five generic EPD stick codes lack flavour labels. Confirm flavour-to-SKU mapping. |
| electrolyte | Mango | Five generic EPD stick codes lack flavour labels. Confirm flavour-to-SKU mapping. |
