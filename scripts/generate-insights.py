"""Rebuild bundled analytics from official source CSVs and deterministic synthetic records.
No network calls. Run: python scripts/generate-insights.py
"""
import csv
import json
import random
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/data'
DATA = ROOT / 'src/data/insights'
OUT.mkdir(parents=True, exist_ok=True)
DATA.mkdir(parents=True, exist_ok=True)

def read(name):
    with (OUT / name).open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

def write_csv(name, rows):
    with (OUT / name).open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

def write_json(name, obj):
    (DATA / name).write_text(json.dumps(obj, separators=(',', ':')), encoding='utf-8')

names = ['Nepal', 'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim']
keys = ['a_TapPiped1', 'b_TapPiped2', 'c_Tubewell', 'd_CoveredWell', 'e_UncoverWell', 'f_Spoutwater', 'g_RiverStream', 'h_JarBottle', 'i_Others']
labels = ['Tap/piped inside premises', 'Tap/piped outside premises', 'Tubewell / handpump', 'Covered well', 'Uncovered well', 'Spout water', 'River / stream', 'Jar / bottled water', 'Other']
pop = {(int(r['prov']), int(r['dist']), int(r['gapa'])): int(r['total']) for r in read('nepal-population-2021.csv')}
geo = []
for r in read('nepal-water-sources-2021.csv'):
    p, d, g = (int(r[k]) for k in ['prov', 'dist', 'gapa'])
    counts = [int(r[k]) for k in keys]
    assert sum(counts) == int(r['rowtotal']), (p, d, g)
    geo.append(dict(province=p, district=d, local=g, name=r['gapaname'] if g else r['dname'].title() if d else names[p], households=int(r['rowtotal']), population=pop[p, d, g], sources=counts))
national = next(r for r in geo if r['province'] == 0)
provinces = [r for r in geo if r['province'] and not r['district']]
districts = [r for r in geo if r['district'] and not r['local']]
locals_ = [r for r in geo if r['local']]
assert len(provinces) == 7 and len(districts) == 77 and len(locals_) == 753
assert sum(r['households'] for r in districts) == national['households'] == 6660841
assert sum(r['population'] for r in districts) == national['population'] == 29164578
for p in provinces:
    children = [d for d in districts if d['province'] == p['province']]
    assert sum(d['households'] for d in children) == p['households']
    for i in range(9):
        assert sum(d['sources'][i] for d in children) == p['sources'][i]

# NSO Housing and Household Dynamics, Table 4.10, printed p.53. Published rounded
# percentages: do not back-calculate fabricated exact counts or district belt assignments.
regions = [
    dict(name='Mountain', households=409260, population=1772948, shares=[87.0, 0.0, 0.5, 1.2, 10.4, 0.7, 0.0, 0.2]),
    dict(name='Hill', households=2945030, population=11757624, shares=[76.5, 2.1, 1.8, 2.7, 6.0, 0.5, 9.7, 0.7]),
    dict(name='Tarai', households=3306551, population=15634006, shares=[35.9, 58.1, 1.4, 1.8, 1.3, 0.2, 0.7, 0.7]),
]
assert sum(r['population'] for r in regions) == national['population']
write_csv('nepal-regions-2021.csv', [dict(region=r['name'], households=r['households'], population=r['population'], **dict(zip(['tapPipedPercent','tubewellPercent','coveredWellPercent','uncoveredWellPercent','spoutPercent','riverStreamPercent','jarBottlePercent','otherPercent'], r['shares']))) for r in regions])
# UNICEF / NSO MICS 2024-25, WS.1.12S (p.320) and WS.1.5 (p.304).
# Safely managed uses E. coli-free, arsenic <=10 ppb, on-premises, available.
survey_values = [
    [54.3, 98.3, 89.4, 89.7, 47.3, 10081, 90.8, 78.3],
    [42.4, 98.7, 89.7, 93.6, 39.0, 1691, 90.2, 79.1],
    [72.1, 99.1, 95.3, 92.1, 66.0, 2061, 95.8, 88.5],
    [57.0, 99.1, 89.5, 88.0, 47.8, 2119, 89.9, 73.1],
    [32.0, 97.7, 81.0, 90.8, 28.2, 898, 85.7, 68.9],
    [60.3, 97.8, 93.6, 91.7, 53.6, 1735, 94.6, 87.3],
    [28.9, 93.8, 76.2, 79.5, 21.9, 599, 80.7, 54.5],
    [56.7, 97.9, 84.8, 83.1, 43.6, 979, 87.3, 73.3],
]
survey = [dict(province=i, name=names[i], ecoliFree=v[0], arsenicCompliant=v[1], availableImproved=v[2], onPremises=v[3], safelyManaged=v[4], testedMembers=v[5], availableMonth=v[6], availableYear=v[7]) for i, v in enumerate(survey_values)]
write_csv('nepal-mics-provinces-2024-25.csv', survey)
write_json('nepal.json', dict(national=national, provinces=provinces, districts=districts, locals=locals_, regions=regions, survey=survey, sourceLabels=labels, regionLabels=['Tap/piped', *labels[2:]], residence=[dict(name='Urban', safelyManaged=53.2, ecoliFree=60.6), dict(name='Rural', safelyManaged=35.8, ecoliFree=41.7)]))

rng = random.Random(20261002)
products = ['RO treatment plant', 'Water ATM', 'Ultrafiltration', 'Storage tank', 'Media filtration', 'AMC / maintenance']
prices = [480000, 230000, 140000, 42000, 78000, 18000]
channels = ['Direct sales', 'Dealer network', 'Website', 'Institutional']
customers = [dict(customer=f'DEMO-C{n:05}', district=d['district'], province=d['province'], segment=['Business', 'Community', 'Institution', 'Household'][n % 4], synthetic=True) for n, d in enumerate([d for d in districts for _ in range(30)], 1)]
by_district = defaultdict(list)
for c in customers:
    by_district[c['district']].append(c['customer'])
orders, distribution, marketing, atm = [], [], [], []
monthly = defaultdict(lambda: dict(revenue=0, cost=0, orders=0, units=0, repeatOrders=0, installations=0))
product_totals, channel_totals = defaultdict(lambda: dict(revenue=0, units=0)), defaultdict(lambda: dict(revenue=0, orders=0))
seen = set()
for month in range(36):
    date = f'{2023 + month // 12}-{month % 12 + 1:02}'
    for d in districts:
        district, province = d['district'], d['province']
        bucket = monthly[date, province, district]
        count = rng.randint(5, 12) + month // 6 + (5 if province == 3 else 0)
        for _ in range(count):
            product, channel = rng.randrange(6), rng.randrange(4)
            customer = rng.choice(by_district[district])
            units = rng.randint(1, 3)
            revenue = int(prices[product] * units * rng.uniform(.85, 1.12))
            cost = int(revenue * rng.uniform(.53, .76))
            repeat = customer in seen
            seen.add(customer)
            orders.append(dict(order=f'DEMO-O{len(orders)+1:06}', date=f'{date}-{rng.randint(1,28):02}', customer=customer, province=province, district=district, product=products[product], channel=channels[channel], units=units, revenueNpr=revenue, costNpr=cost, repeatOrder=repeat, synthetic=True))
            bucket['revenue'] += revenue
            bucket['cost'] += cost
            bucket['orders'] += 1
            bucket['units'] += units
            bucket['repeatOrders'] += int(repeat)
            bucket['installations'] += units if product in [0, 1, 2, 4] else 0
            pb = product_totals[date, province, product]
            pb['revenue'] += revenue
            pb['units'] += units
            cb = channel_totals[date, province, channel]
            cb['revenue'] += revenue
            cb['orders'] += 1
        delivered = count - rng.randint(0, min(2, count))
        on_time = max(0, delivered - rng.randint(0, 2))
        tickets = rng.randint(1, 8)
        distribution.append(dict(month=date, province=province, district=district, shipments=count, delivered=delivered, onTime=on_time, deliveryDays=rng.randint(2, 10), serviceTickets=tickets, resolved=tickets-rng.randint(0, min(2, tickets)), inventoryUnits=rng.randint(5, 35), synthetic=True))
        sites = 1 + month // 12 + (district % 3 == 0)
        atm.append(dict(month=date, province=province, district=district, sites=sites, dispensedLitres=sites*rng.randint(12000, 39000), operatingHours=sites*720, downtimeHours=sites*rng.randint(5, 48), transactions=sites*rng.randint(1100, 3900), synthetic=True))
    for p in range(1, 8):
        for channel in channels:
            leads = rng.randint(70, 250) + month * 3
            qualified = int(leads * rng.uniform(.35, .65))
            converted = int(qualified * rng.uniform(.15, .4))
            marketing.append(dict(month=date, province=p, channel=channel, spendNpr=rng.randint(15000, 85000), impressions=leads*rng.randint(80, 150), leads=leads, qualified=qualified, converted=converted, synthetic=True))

# Repeat flags refer to earlier chronological ledger rows, not generation order.
orders.sort(key=lambda r: (r['date'], r['order']))
seen.clear()
for order in orders:
    order['repeatOrder'] = order['customer'] in seen
    seen.add(order['customer'])
files = [('lucent-demo-customers.csv', customers), ('lucent-demo-orders.csv', orders), ('lucent-demo-distribution-service.csv', distribution), ('lucent-demo-marketing.csv', marketing), ('lucent-demo-water-atm.csv', atm)]
for name, rows in files:
    write_csv(name, rows)
summary = dict(seed=20261002, synthetic=True, period='January 2023 – December 2025', products=products, channels=channels,
    counts={name:len(rows) for name, rows in files},
    monthly=[dict(month=m, province=p, district=d, **v) for (m, p, d), v in monthly.items()],
    productsMonthly=[dict(month=m, province=p, product=k, **v) for (m, p, k), v in product_totals.items()],
    channelsMonthly=[dict(month=m, province=p, channel=k, **v) for (m, p, k), v in channel_totals.items()],
    distribution=distribution, marketing=marketing, atm=atm)
assert sum(r['revenueNpr'] for r in orders) == sum(r['revenue'] for r in summary['monthly'])
(OUT / 'lucent-demo-summary.json').write_text(json.dumps(summary, separators=(',', ':')), encoding='utf-8')
write_json('manifest.json', dict(censusDistricts=len(districts), censusLocalLevels=len(locals_), syntheticRows=sum(len(rows) for _, rows in files), files=summary['counts']))
print(json.dumps({'officialDistricts':len(districts), 'localLevels':len(locals_), 'syntheticRows':sum(len(rows) for _, rows in files), 'files':summary['counts']}, indent=2))
