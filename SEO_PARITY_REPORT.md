# SEO parity report

Generated: 2026-09-01T17:29:38.404Z

- Production: `https://thebasebev.com`
- Target: `https://the-base-staging.mansua.workers.dev`
- Canonical public routes: 29
- Critical failures: 2
- Non-blocking link/alt observations: 58
- Preview transport noindex expected: yes

The target is allowed to return `X-Robots-Tag: noindex, nofollow` on a `workers.dev` preview. Page-level metadata and canonical URLs must still match production and remain oriented to `https://thebasebev.com`.

| Route | Production | Target | Critical parity | Internal links P/T | Target images/missing/empty alt | Notes |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| `/` | 200 | 200 | FAIL | 28/31 | 25/0/12 | h1 mismatch |
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
| `/rnd` | 200 | 200 | FAIL | 28/31 | 5/0/0 | h1 mismatch |
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

- /: h1 mismatch
- /rnd: h1 mismatch

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
