# Staging lead relay

the-base-staging-leads is the staging-only relay between the public
/api/leads endpoint and Odoo. It is separate from the Worker supporting live
Tilda traffic.

It needs two Worker secrets, never committed to this repository:

- ODOO_WEBHOOK — the Odoo webhook URL.
- LEAD_RELAY_AUTH_TOKEN — a high-entropy value shared with the staging site's
  LEAD_API_KEY secret.

The staging site needs these secrets:

- LEAD_API_URL — the the-base-staging-leads Worker URL.
- LEAD_API_KEY — exactly the same value as LEAD_RELAY_AUTH_TOKEN.

Deployment and secret provisioning are intentionally separate: configuration is
applied in Cloudflare, while the repository contains no endpoint or token.
