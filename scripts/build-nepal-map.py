"""Render a local, projected SVG from sourced Nepal province polygons."""
import json
import math
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'public/data/nepal-provinces.geojson').read_text())
names = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim']

def project(point):
    lon, lat = point[:2]
    return math.radians(lon), -math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))

points = [project(p) for f in data['features'] for ring in f['geometry']['coordinates'] for p in ring]
x0, x1 = min(p[0] for p in points), max(p[0] for p in points)
y0, y1 = min(p[1] for p in points), max(p[1] for p in points)
scale = min(830 / (x1-x0), 350 / (y1-y0))
left = (900-(x1-x0)*scale)/2
top = (420-(y1-y0)*scale)/2

def screen(point):
    x,y = project(point)
    return (left+(x-x0)*scale, top+(y-y0)*scale)

parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 420" role="img" aria-labelledby="title desc">',
    '<title id="title">Nepal and its seven provinces</title>',
    '<desc id="desc">Geographic province polygons from Survey Department of Nepal and OCHA FISS via geoBoundaries, boundary year 2020. Province labels use current names. This map does not mark installations or confirm service availability.</desc>']
labels = []
interactive = []
for index,f in enumerate(data['features']):
    assert f['geometry']['type'] == 'Polygon'
    province = int(f['properties']['shapeISO'].split('P')[-1])-1
    paths = []
    for ring in f['geometry']['coordinates']:
        coords = [screen(p) for p in ring]
        paths.append('M'+'L'.join(f'{x:.1f},{y:.1f}' for x,y in coords)+'Z')
    parts.append(f'<path d="{"".join(paths)}" fill="{["#cfe8fa","#b4ddf4","#daeefa","#c2e2f6","#a9d5ef","#cbe5f7","#b8dcf2"][province]}" stroke="#4b94c1" stroke-width="1.4" stroke-linejoin="round" fill-rule="evenodd"><title>{names[province]}</title></path>')
    ring = [screen(p) for p in f['geometry']['coordinates'][0]]
    pairs = list(zip(ring, ring[1:]))
    area2 = sum(x*v-u*y for (x,y),(u,v) in pairs)
    cx = sum((x+u)*(x*v-u*y) for (x,y),(u,v) in pairs)/(3*area2)
    cy = sum((y+v)*(x*v-u*y) for (x,y),(u,v) in pairs)/(3*area2)
    interactive.append(dict(id=province+1, name=names[province], path=''.join(paths), fill=["#cfe8fa","#b4ddf4","#daeefa","#c2e2f6","#a9d5ef","#cbe5f7","#b8dcf2"][province], x=round(cx,1), y=round(cy,1)))
    labels.append(f'<text x="{cx:.1f}" y="{cy:.1f}" text-anchor="middle" dominant-baseline="middle" fill="#12476b" font-family="Arial,sans-serif" font-size="16" font-weight="600" stroke="#f1f9ff" stroke-width="3" paint-order="stroke">{names[province]}</text>')
parts.extend(labels)
parts.append('</svg>')
(root / 'public/images/nepal-provinces.svg').write_text('\n'.join(parts), encoding='utf-8')
(root / 'src/data/nepal-map.json').write_text(json.dumps(interactive, separators=(',', ':')), encoding='utf-8')
print('Rendered seven geographic province polygons to public/images/nepal-provinces.svg')
