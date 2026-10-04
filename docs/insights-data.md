# Public insights and data provenance

Open `/insights` without signing in. The page has 28 charts across Nepal water evidence, Lucent business demonstrations and demand scenarios. Official observations, synthetic company records and modeled demand are labelled separately.

## Official sources

- [NSO 2021 census dataset catalogue](https://censusresults.nsonepal.gov.np/downloads/census-dataset): `Hhld06_SourceOfDrinkingWater.csv` and `Indv01_PopulationBySex.csv`. Bundled unchanged under `public/data/nepal-water-sources-2021.csv` and `nepal-population-2021.csv`. Source household counts cover seven provinces, 77 districts and 753 local levels.
- [NSO Housing and Household Dynamics report](https://giwmscdnone.gov.np/media/app/public/36/posts/1710821571_6.pdf): ecological-region source percentages, Table 4.10, printed page 53, PDF page 112. These rounded percentages combine the two piped-source categories. No exact region category counts are reconstructed from rounded shares.
- [NSO / UNICEF MICS 2024–25](https://www.unicef.org/nepal/reports/multiple-indicator-cluster-survey-2024-25), published February 2026: availability from WS.1.5 (printed page 304), safety from WS.1.12S (printed page 320). The exported province table is a manual transcription of these official tables. The safely managed metric includes arsenic ≤10 ppb and reports 47.3% nationally, distinct from the report's E. coli-only indicator of 47.5%.

Retrieved October 2, 2026. These are historical snapshots, not live feeds. Household source type is not certified water safety. Census source-table household denominator is 6,660,841; do not substitute the different population-table household total. Survey percentages are weighted household-population estimates, not household counts. No district safety percentages or district ecological assignments are invented.

Published local-level population rows sum to 28,925,480, below the district/national total of 29,164,578. Source values are preserved. The demand planner uses official district aggregates, not a sum of the local population rows. Local household source counts do reconcile to district source counts.

## Synthetic company records

Fixed seed: `20261002`. Period: January 2023–December 2025. All rows have a synthetic marker and customer/order IDs use a `DEMO-` prefix. No real contact details are included.

| CSV                      | Records |
| ------------------------ | ------: |
| Customers                |   2,310 |
| Orders                   |  32,892 |
| Distribution and service |   2,772 |
| Marketing campaigns      |   1,008 |
| Water ATM operations     |   2,772 |
| Total                    |  41,754 |

Six product categories and four sales channels span every province and district. Revenue and product cost reconcile to the transaction ledger. Revenue excludes tax; gross profit precedes marketing and overhead. Repeat orders follow an earlier order by the same synthetic ID. Marketing funnel counts belong to a separate campaign cohort; cost per converted lead is not company-wide CAC. Delivered/on-time shipments and resolved service tickets are subsets. Installation growth assumes units sold in selected installation categories are installed. Water ATM operations are a separate fictional model, not a real deployment inventory.

The large summary JSON is fetched only when the business tab opens and cached for the session. Only summaries are charted; raw CSV files are downloadable. Public data needs no credentials. Do not replace public demo files with confidential company records: real business analytics require server-enforced authentication.

## Demand planner

Ecological-region populations are transcribed from NSO Housing and Household Dynamics Table 3.1, printed page 31 (PDF page 90). They reconcile to the national population. The region scenario always shows the national Mountain/Hill/Tarai comparison; province filters apply to province/district charts and summary metrics. `nepal-regions-2021.csv` includes published region population, household counts and rounded water-source shares.

`population × litres/person/day × chosen coverage` calculates a scenario target volume. Divide by `station litres/day × assumed uptime` and round up for a capacity equivalent. Population is the 2021 census baseline. Defaults (3 drinking litres/person/day, 10% coverage, 2,000 litres/station/day, 90% uptime) are illustrative assumptions, not Nepal government water-supply standards. Province rounding can exceed the pooled national equivalent. No growth forecast or measured unmet need is claimed.

No comprehensive verified district/national Water ATM inventory was found in the reviewed sources. Validate actual local station locations, demand, affordability, water quality, treatment losses, peak flow and regulatory permissions before deployment.

## Rebuild

Run `python scripts/generate-insights.py` with Python 3. It uses only standard-library modules and reads the two bundled official CSVs. It regenerates JSON summaries and the five demo CSVs deterministically, checking national/province source totals. `scripts/research-nepal-water.py` is an optional research helper requiring pypdf and the original downloads in the ignored research directory; it is not needed to run or rebuild the website.

Verification includes source reconciliation, ledger/summary agreement for every year/province filter, scenario arithmetic, public browser access, chart rendering, filtering, CSV downloads, accessibility, mobile overflow and retry behavior.
