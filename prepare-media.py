from pathlib import Path
from PIL import Image,ImageOps
import shutil
root=Path(__file__).parent
assets=root/'dist/assets'
originals=root/'source-data/original-products';originals.mkdir(exist_ok=True)
for p in (assets/'products').glob('*.jpg'):
 im=ImageOps.exif_transpose(Image.open(p)).convert('RGB');im.thumbnail((1200,1200))
 im.save(p.with_suffix('.webp'),quality=84,method=6)
 shutil.move(str(p),str(originals/p.name))
def cover(id,name):
 im=Image.open(assets/'products'/f'{id}.webp').convert('RGB')
 im.save(assets/f'{name}.webp',quality=87,method=6)
cover('936595348679','hero-petunia')
cover('973459822023','petunia')
cover('973519318727','calibrachoa')
cover('973745586375','verbena')
cover('955787996615','nemesia')
cover('965757879495','coleus')
for p in assets.glob('*.jpg'):
 shutil.move(str(p),str(originals/p.name))
print('Optimized',len(list((assets/'products').glob('*.webp'))),'photos')
