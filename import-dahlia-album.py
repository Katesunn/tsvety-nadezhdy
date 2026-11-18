"""Download the owner's public dahlia album without changing inventory or images."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
import json
import time
import urllib.request

ROOT = Path(__file__).parent
ALBUM = '953213489095'
BASE = ROOT / 'source-data' / 'albums' / ALBUM

class PhotoProps(HTMLParser):
    def __init__(self, photo_id):
        super().__init__()
        self.photo_id = photo_id
        self.info = None

    def handle_starttag(self, tag, attrs):
        props = dict(attrs).get('data-props')
        if props:
            try:
                info = json.loads(props).get('entity', {}).get('photo', {}).get('info')
                if info and str(info.get('id')) == self.photo_id:
                    self.info = info
            except (ValueError, AttributeError):
                pass

def download(row):
    metadata_path = BASE / (row['id'] + '.json')
    original_path = BASE / 'originals' / (row['id'] + '.jpg')
    if metadata_path.exists() and original_path.exists():
        return json.loads(metadata_path.read_text(encoding='utf-8'))
    for attempt in range(3):
        try:
            with urllib.request.urlopen(row['source'], timeout=30) as response:
                body = response.read().decode('utf-8')
            parser = PhotoProps(row['id'])
            parser.feed(body)
            info = parser.info
            if not info:
                raise RuntimeError('Full photo metadata unavailable: ' + row['id'])
            with urllib.request.urlopen(info['imgSrc'], timeout=30) as response:
                image = response.read()
            original_path.write_bytes(image)
            data = {**row, 'album': ALBUM, 'description': info.get('description', row['description']),
                    'width': info.get('width'), 'height': info.get('height'),
                    'original': str(original_path.relative_to(ROOT))}
            metadata_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
            return data
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)

if __name__ == '__main__':
    (BASE / 'originals').mkdir(parents=True, exist_ok=True)
    rows = json.loads((ROOT / 'source-data' / ('album-' + ALBUM + '.json')).read_text(encoding='utf-8'))
    completed = {}
    with ThreadPoolExecutor(max_workers=4) as pool:
        pending = {pool.submit(download, row): row['id'] for row in rows}
        for future in as_completed(pending):
            item = future.result()
            completed[item['id']] = item
            if len(completed) % 10 == 0 or len(completed) == len(rows):
                print(f'Downloaded {len(completed)}/{len(rows)}', flush=True)
    ordered = [completed[row['id']] for row in rows]
    (BASE / 'photos.json').write_text(json.dumps(ordered, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'photos': len(ordered), 'metadata': str(BASE / 'photos.json')}), flush=True)
