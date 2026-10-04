from pathlib import Path
from html.parser import HTMLParser
from pypdf import PdfReader
import json

class Links(HTMLParser):
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            href = dict(attrs).get('href', '')
            if 'csv' in href or 'zip' in href:
                print(href)

Links().feed(Path('output/research/census-dataset.html').read_text(encoding='utf-8'))
reader = PdfReader('output/research/nepal-mics-2024-25.pdf')
for index in [309,310,320,323,325,327,328,336]:
    text = reader.pages[index].extract_text(extraction_mode='layout')
    Path(f'output/research/mics-page-{index}.txt').write_text(text,encoding='utf-8')
    print('PAGE',index, text[:100].replace('\n',' '))
