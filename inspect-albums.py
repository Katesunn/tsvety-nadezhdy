import re,html
from pathlib import Path
import sys
for p in Path('source-data').glob(sys.argv[1] if len(sys.argv)>1 else 'album-*.html'):
 s=p.read_text(encoding='utf-8')
 t=re.sub(r'<(script|style)\b[^>]*>.*?</\1>','',s,flags=re.S|re.I)
 t=html.unescape(re.sub('<[^>]+>',' ',t))
 print(p.name,re.sub(r'\s+',' ',t)[-12000:])
 print('PHOTO LINKS:',re.findall(r'href="([^"]*(?:photo|album)[^"]*)"',s)[-50:])
 print('IMAGES:',re.findall(r'<img[^>]+>',s)[-15:])
