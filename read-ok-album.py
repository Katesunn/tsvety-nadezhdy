"""Refresh a public OK album, retaining every photo and its exact caption."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin
import json
import re
import sys
import time
import urllib.request

ROOT=Path(__file__).parent
ALBUM=sys.argv[1]
assert re.fullmatch(r'\d+', ALBUM)
BASE=ROOT/'source-data'/'albums'/ALBUM
BASE.mkdir(parents=True,exist_ok=True)
(BASE/'originals').mkdir(exist_ok=True)

class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.rows=[];self.next=None;self.title='';self.in_title=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='title':self.in_title=True
        if tag=='a' and 'data-alt' in a:
            link=unquote(unquote(a.get('href','')))
            match=re.search(r'/album/\d+/(\d+)',link)
            if match:
                self.rows.append({'id':match[1],'description':a['data-alt'],
                  'source':f'https://ok.ru/profile/211714658759/album/{ALBUM}/{match[1]}'})
        if tag=='a' and 'pager' in a.get('class','') and 'fr.pt=Next' in a.get('href',''):
            self.next=urljoin('https://m.ok.ru',a['href'])
    def handle_endtag(self,tag):
        if tag=='title':self.in_title=False
    def handle_data(self,text):
        if self.in_title:self.title+=text

def fetch(url):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url,timeout=30) as response:return response.read()
        except Exception:
            if attempt==2:raise
            time.sleep(attempt+1)

url=f'https://m.ok.ru/profile/211714658759/album/{ALBUM}'
visited=set();rows=[];titles=[];pages=0
while url and url not in visited and pages<30:
    visited.add(url);body=fetch(url).decode('utf-8')
    (BASE/f'page-{pages}.html').write_text(body,encoding='utf-8')
    page=Page();page.feed(body);titles.append(page.title)
    rows+=page.rows;pages+=1;url=page.next
    print(json.dumps({'page':pages,'photos':len(page.rows)}),flush=True)
if url and pages>=30:raise RuntimeError('Pagination limit reached')
rows=list({p['id']:p for p in rows}.values())
(BASE/'index.json').write_text(json.dumps({'pages':pages,'titles':titles,'photos':rows},ensure_ascii=False,indent=2),encoding='utf-8')
if '--download' not in sys.argv:
    print(json.dumps({'pages':pages,'photos':len(rows),'title':titles[0] if titles else '',
                     'captions':[p['description'] for p in rows]},ensure_ascii=True),flush=True)
    sys.exit()

class PhotoProps(HTMLParser):
    def __init__(self,photo_id):
        super().__init__();self.photo_id=photo_id;self.info=None
    def handle_starttag(self,tag,attrs):
        props=dict(attrs).get('data-props')
        if props:
            try:
                info=json.loads(props).get('entity',{}).get('photo',{}).get('info')
                if info and str(info.get('id'))==self.photo_id:self.info=info
            except (ValueError,AttributeError):pass

def download(row):
    body=fetch(row['source']).decode('utf-8');parser=PhotoProps(row['id']);parser.feed(body)
    if not parser.info:raise RuntimeError('Missing photo metadata: '+row['id'])
    info=parser.info;original=BASE/'originals'/(row['id']+'.jpg')
    original.write_bytes(fetch(info['imgSrc']))
    data={**row,'album':ALBUM,'description':info.get('description',row['description']),
          'width':info.get('width'),'height':info.get('height'),'original':str(original.relative_to(ROOT))}
    (BASE/(row['id']+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    return data

completed={}
with ThreadPoolExecutor(max_workers=4) as pool:
    for future in as_completed([pool.submit(download,row) for row in rows]):
        item=future.result();completed[item['id']]=item
        if len(completed)%10==0 or len(completed)==len(rows):print(f'Downloaded {len(completed)}/{len(rows)}',flush=True)
ordered=[completed[p['id']] for p in rows]
(BASE/'photos.json').write_text(json.dumps(ordered,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'photos':len(ordered),'metadata':str(BASE/'photos.json')}),flush=True)
