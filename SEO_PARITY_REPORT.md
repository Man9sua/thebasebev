# SEO parity report

Generated: 2026-09-01T18:06:21.504Z

- Production: `https://thebasebev.com`
- Target: `https://the-base-staging.mansua.workers.dev`
- Canonical public routes: 29
- Critical failures: 0
- Declared h1 changes: 17
- Non-blocking link/alt observations: 58
- Preview transport noindex expected: yes

The target is allowed to return `X-Robots-Tag: noindex, nofollow` on a `workers.dev` preview. Page-level metadata and canonical URLs must still match production and remain oriented to `https://thebasebev.com`.

| Route | Production | Target | Critical parity | Internal links P/T | Target images/missing/empty alt | Notes |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| `/` | 200 | 200 | PASS | 28/31 | 25/0/12 | Critical fields match |
| `/wholesale-strategy` | 200 | 200 | PASS | 28/31 | 20/0/12 | Critical fields match |
| `/contacts` | 200 | 200 | PASS | 28/31 | 0/0/0 | Critical fields match |
| `/about-us` | 200 | 200 | PASS | 28/31 | 21/0/5 | Critical fields match |
| `/resources` | 200 | 200 | PASS | 28/31 | 12/0/5 | Critical fields match |
| `/distributors` | 200 | 200 | PASS | 28/31 | 9/0/0 | Critical fields match |
| `/resources/blog` | 200 | 200 | PASS | 28/31 | 12/0/5 | Critical fields match |
| `/private-labeling` | 200 | 200 | PASS | 28/31 | 16/0/9 | Critical fields match |
| `/sitemap` | 200 | 200 | PASS | 30/32 | 12/0/5 | Critical fields match |
| `/resources/glossary` | 200 | 200 | PASS | 28/31 | 12/0/5 | Critical fields match |
| `/resources/tools` | 200 | 200 | PASS | 28/31 | 12/0/5 | Critical fields match |
| `/rnd` | 200 | 200 | PASS | 28/31 | 5/0/0 | Critical fields match |
| `/raf-coffee` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/cream-latte` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/chai-latte` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/milkshake` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/frappe` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/iced-tea` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/cordial` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/topping` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/matcha` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/chocolate` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/sugar-syrup` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/vending` | 200 | 200 | PASS | 28/31 | 19/0/10 | Critical fields match |
| `/jam` | 200 | 200 | PASS | 28/31 | 18/0/9 | Critical fields match |
| `/garnish` | 200 | 200 | PASS | 28/31 | 18/0/9 | Critical fields match |
| `/sugar-free` | 200 | 200 | PASS | 28/31 | 18/0/9 | Critical fields match |
| `/tea` | 200 | 200 | PASS | 28/31 | 18/0/9 | Critical fields match |
| `/catalog` | 200 | 200 | PASS | 29/31 | 16/0/0 | Critical fields match |

## Critical failures

- None.

## Declared h1 changes

Product pages lead with the product's name and carry production's wording as
the h2 under it; the check still fails if that wording leaves the page. One
route is exempt outright because production's own h1 is wrong -- see
`H1_NOT_PRESERVED` in this script.

- /: h1 is now "Premium Beverage Bases"; production wording kept as h2
- /rnd: production h1 is a stray widget line, deliberately not carried over
- /cream-latte: h1 is now "Cream Latte"; production wording kept as h2
- /chai-latte: h1 is now "Chai Latte"; production wording kept as h2
- /milkshake: h1 is now "Milk­shake"; production wording kept as h2
- /frappe: h1 is now "Frappe"; production wording kept as h2
- /iced-tea: h1 is now "Iced Tea"; production wording kept as h2
- /cordial: h1 is now "Cordial"; production wording kept as h2
- /topping: h1 is now "Toppings"; production wording kept as h2
- /matcha: h1 is now "Matcha"; production wording kept as h2
- /chocolate: h1 is now "Chocolate"; production wording kept as h2
- /sugar-syrup: h1 is now "Sugar Syrup"; production wording kept as h2
- /vending: h1 is now "Vending"; production wording kept as h2
- /jam: h1 is now "Jam & Fillings"; production wording kept as h2
- /garnish: h1 is now "Garnishes"; production wording kept as h2
- /sugar-free: h1 is now "Sugar Free"; production wording kept as h2
- /tea: h1 is now "Tea"; production wording kept as h2

## Non-blocking observations

- /: internal links differ (-0/+3)
- /: image alt stats differ ({"total":39,"missing":0,"empty":10} vs {"total":25,"missing":0,"empty":12})
- /wholesale-strategy: internal links differ (-0/+3)
- /wholesale-strategy: image alt stats differ ({"total":26,"missing":0,"empty":17} vs {"total":20,"missing":0,"empty":12})
- /contacts: internal links differ (-0/+3)
- /contacts: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":0,"missing":0,"empty":0})
- /about-us: internal links differ (-0/+3)
- /about-us: image alt stats differ ({"total":27,"missing":0,"empty":10} vs {"total":21,"missing":0,"empty":5})
- /resources: internal links differ (-0/+3)
- /resources: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":12,"missing":0,"empty":5})
- /distributors: internal links differ (-0/+3)
- /distributors: image alt stats differ ({"total":27,"missing":0,"empty":10} vs {"total":9,"missing":0,"empty":0})
- /resources/blog: internal links differ (-0/+3)
- /resources/blog: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":12,"missing":0,"empty":5})
- /private-labeling: internal links differ (-0/+3)
- /private-labeling: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":16,"missing":0,"empty":9})
- /sitemap: internal links differ (-0/+2)
- /sitemap: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":12,"missing":0,"empty":5})
- /resources/glossary: internal links differ (-0/+3)
- /resources/glossary: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":12,"missing":0,"empty":5})
- /resources/tools: internal links differ (-0/+3)
- /resources/tools: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":12,"missing":0,"empty":5})
- /rnd: internal links differ (-0/+3)
- /rnd: image alt stats differ ({"total":22,"missing":0,"empty":14} vs {"total":5,"missing":0,"empty":0})
- /raf-coffee: internal links differ (-0/+3)
- /raf-coffee: image alt stats differ ({"total":49,"missing":0,"empty":40} vs {"total":19,"missing":0,"empty":10})
- /cream-latte: internal links differ (-0/+3)
- /cream-latte: image alt stats differ ({"total":48,"missing":0,"empty":38} vs {"total":19,"missing":0,"empty":10})
- /chai-latte: internal links differ (-0/+3)
- /chai-latte: image alt stats differ ({"total":47,"missing":0,"empty":37} vs {"total":19,"missing":0,"empty":10})
- /milkshake: internal links differ (-0/+3)
- /milkshake: image alt stats differ ({"total":47,"missing":0,"empty":37} vs {"total":19,"missing":0,"empty":10})
- /frappe: internal links differ (-0/+3)
- /frappe: image alt stats differ ({"total":49,"missing":0,"empty":39} vs {"total":19,"missing":0,"empty":10})
- /iced-tea: internal links differ (-0/+3)
- /iced-tea: image alt stats differ ({"total":46,"missing":0,"empty":36} vs {"total":19,"missing":0,"empty":10})
- /cordial: internal links differ (-0/+3)
- /cordial: image alt stats differ ({"total":46,"missing":0,"empty":36} vs {"total":19,"missing":0,"empty":10})
- /topping: internal links differ (-0/+3)
- /topping: image alt stats differ ({"total":46,"missing":0,"empty":36} vs {"total":19,"missing":0,"empty":10})
- /matcha: internal links differ (-0/+3)
- /matcha: image alt stats differ ({"total":44,"missing":0,"empty":34} vs {"total":19,"missing":0,"empty":10})
- /chocolate: internal links differ (-0/+3)
- /chocolate: image alt stats differ ({"total":45,"missing":0,"empty":35} vs {"total":19,"missing":0,"empty":10})
- /sugar-syrup: internal links differ (-0/+3)
- /sugar-syrup: image alt stats differ ({"total":42,"missing":0,"empty":32} vs {"total":19,"missing":0,"empty":10})
- /vending: internal links differ (-0/+3)
- /vending: image alt stats differ ({"total":44,"missing":0,"empty":34} vs {"total":19,"missing":0,"empty":10})
- /jam: internal links differ (-0/+3)
- /jam: image alt stats differ ({"total":44,"missing":0,"empty":34} vs {"total":18,"missing":0,"empty":9})
- /garnish: internal links differ (-0/+3)
- /garnish: image alt stats differ ({"total":36,"missing":0,"empty":28} vs {"total":18,"missing":0,"empty":9})
- /sugar-free: internal links differ (-0/+3)
- /sugar-free: image alt stats differ ({"total":38,"missing":0,"empty":30} vs {"total":18,"missing":0,"empty":9})
- /tea: internal links differ (-0/+3)
- /tea: image alt stats differ ({"total":32,"missing":0,"empty":23} vs {"total":18,"missing":0,"empty":9})
- /catalog: internal links differ (-1/+3)
- /catalog: image alt stats differ ({"total":34,"missing":0,"empty":10} vs {"total":16,"missing":0,"empty":0})
