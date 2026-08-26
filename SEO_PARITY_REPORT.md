# SEO parity report

Generated: 2026-08-26T18:07:58.913Z

- Production: `https://thebasebev.com`
- Target: `https://the-base-staging.mansua.workers.dev`
- Canonical public routes: 29
- Critical failures: 2
- Non-blocking link/alt observations: 58
- Preview transport noindex expected: yes

The target is allowed to return `X-Robots-Tag: noindex, nofollow` on a `workers.dev` preview. Page-level metadata and canonical URLs must still match production and remain oriented to `https://thebasebev.com`.

| Route | Production | Target | Critical parity | Internal links P/T | Target images/missing/empty alt | Notes |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| `/` | 200 | 200 | FAIL | 28/32 | 22/0/8 | h1 mismatch |
| `/wholesale-strategy` | 200 | 200 | PASS | 28/32 | 21/0/12 | Critical fields match |
| `/contacts` | 200 | 200 | PASS | 28/32 | 13/0/5 | Critical fields match |
| `/about-us` | 200 | 200 | PASS | 28/32 | 22/0/5 | Critical fields match |
| `/resources` | 200 | 200 | PASS | 28/32 | 13/0/5 | Critical fields match |
| `/distributors` | 200 | 200 | PASS | 28/32 | 22/0/5 | Critical fields match |
| `/resources/blog` | 200 | 200 | PASS | 28/32 | 13/0/5 | Critical fields match |
| `/private-labeling` | 200 | 200 | PASS | 28/32 | 13/0/5 | Critical fields match |
| `/sitemap` | 200 | 200 | PASS | 30/33 | 13/0/5 | Critical fields match |
| `/resources/glossary` | 200 | 200 | PASS | 28/32 | 13/0/5 | Critical fields match |
| `/resources/tools` | 200 | 200 | PASS | 28/32 | 13/0/5 | Critical fields match |
| `/rnd` | 200 | 200 | FAIL | 28/32 | 17/0/9 | h1 mismatch |
| `/raf-coffee` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/cream-latte` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/chai-latte` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/milkshake` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/frappe` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/iced-tea` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/cordial` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/topping` | 200 | 200 | PASS | 28/32 | 19/0/9 | Critical fields match |
| `/matcha` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/chocolate` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/sugar-syrup` | 200 | 200 | PASS | 28/32 | 19/0/9 | Critical fields match |
| `/vending` | 200 | 200 | PASS | 28/32 | 19/0/9 | Critical fields match |
| `/jam` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/garnish` | 200 | 200 | PASS | 28/32 | 19/0/9 | Critical fields match |
| `/sugar-free` | 200 | 200 | PASS | 28/32 | 19/0/9 | Critical fields match |
| `/tea` | 200 | 200 | PASS | 28/32 | 19/0/10 | Critical fields match |
| `/catalog` | 200 | 200 | PASS | 29/32 | 29/0/5 | Critical fields match |

## Critical failures

- /: h1 mismatch
- /rnd: h1 mismatch

## Non-blocking observations

- /: internal links differ (-0/+4)
- /: image alt stats differ ({"total":39,"missing":0,"empty":10} vs {"total":22,"missing":0,"empty":8})
- /wholesale-strategy: internal links differ (-0/+4)
- /wholesale-strategy: image alt stats differ ({"total":26,"missing":0,"empty":17} vs {"total":21,"missing":0,"empty":12})
- /contacts: internal links differ (-0/+4)
- /contacts: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":13,"missing":0,"empty":5})
- /about-us: internal links differ (-0/+4)
- /about-us: image alt stats differ ({"total":27,"missing":0,"empty":10} vs {"total":22,"missing":0,"empty":5})
- /resources: internal links differ (-0/+4)
- /resources: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":13,"missing":0,"empty":5})
- /distributors: internal links differ (-0/+4)
- /distributors: image alt stats differ ({"total":27,"missing":0,"empty":10} vs {"total":22,"missing":0,"empty":5})
- /resources/blog: internal links differ (-0/+4)
- /resources/blog: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":13,"missing":0,"empty":5})
- /private-labeling: internal links differ (-0/+4)
- /private-labeling: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":13,"missing":0,"empty":5})
- /sitemap: internal links differ (-0/+3)
- /sitemap: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":13,"missing":0,"empty":5})
- /resources/glossary: internal links differ (-0/+4)
- /resources/glossary: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":13,"missing":0,"empty":5})
- /resources/tools: internal links differ (-0/+4)
- /resources/tools: image alt stats differ ({"total":18,"missing":0,"empty":10} vs {"total":13,"missing":0,"empty":5})
- /rnd: internal links differ (-0/+4)
- /rnd: image alt stats differ ({"total":22,"missing":0,"empty":14} vs {"total":17,"missing":0,"empty":9})
- /raf-coffee: internal links differ (-0/+4)
- /raf-coffee: image alt stats differ ({"total":49,"missing":0,"empty":40} vs {"total":19,"missing":0,"empty":10})
- /cream-latte: internal links differ (-0/+4)
- /cream-latte: image alt stats differ ({"total":48,"missing":0,"empty":38} vs {"total":19,"missing":0,"empty":10})
- /chai-latte: internal links differ (-0/+4)
- /chai-latte: image alt stats differ ({"total":47,"missing":0,"empty":37} vs {"total":19,"missing":0,"empty":10})
- /milkshake: internal links differ (-0/+4)
- /milkshake: image alt stats differ ({"total":47,"missing":0,"empty":37} vs {"total":19,"missing":0,"empty":10})
- /frappe: internal links differ (-0/+4)
- /frappe: image alt stats differ ({"total":49,"missing":0,"empty":39} vs {"total":19,"missing":0,"empty":10})
- /iced-tea: internal links differ (-0/+4)
- /iced-tea: image alt stats differ ({"total":46,"missing":0,"empty":36} vs {"total":19,"missing":0,"empty":10})
- /cordial: internal links differ (-0/+4)
- /cordial: image alt stats differ ({"total":46,"missing":0,"empty":36} vs {"total":19,"missing":0,"empty":10})
- /topping: internal links differ (-0/+4)
- /topping: image alt stats differ ({"total":46,"missing":0,"empty":36} vs {"total":19,"missing":0,"empty":9})
- /matcha: internal links differ (-0/+4)
- /matcha: image alt stats differ ({"total":44,"missing":0,"empty":34} vs {"total":19,"missing":0,"empty":10})
- /chocolate: internal links differ (-0/+4)
- /chocolate: image alt stats differ ({"total":45,"missing":0,"empty":35} vs {"total":19,"missing":0,"empty":10})
- /sugar-syrup: internal links differ (-0/+4)
- /sugar-syrup: image alt stats differ ({"total":42,"missing":0,"empty":32} vs {"total":19,"missing":0,"empty":9})
- /vending: internal links differ (-0/+4)
- /vending: image alt stats differ ({"total":44,"missing":0,"empty":34} vs {"total":19,"missing":0,"empty":9})
- /jam: internal links differ (-0/+4)
- /jam: image alt stats differ ({"total":44,"missing":0,"empty":34} vs {"total":19,"missing":0,"empty":10})
- /garnish: internal links differ (-0/+4)
- /garnish: image alt stats differ ({"total":36,"missing":0,"empty":28} vs {"total":19,"missing":0,"empty":9})
- /sugar-free: internal links differ (-0/+4)
- /sugar-free: image alt stats differ ({"total":38,"missing":0,"empty":30} vs {"total":19,"missing":0,"empty":9})
- /tea: internal links differ (-0/+4)
- /tea: image alt stats differ ({"total":32,"missing":0,"empty":23} vs {"total":19,"missing":0,"empty":10})
- /catalog: internal links differ (-1/+4)
- /catalog: image alt stats differ ({"total":34,"missing":0,"empty":10} vs {"total":29,"missing":0,"empty":5})
