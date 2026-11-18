import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const album='952972831943',base=`source-data/albums/${album}`;
const source=JSON.parse(await fs.readFile(`${base}/photos.json`,'utf8'));
const before=JSON.parse(await fs.readFile(`${base}/catalog-before.json`,'utf8'));
const ctx={window:{}};
vm.runInNewContext(await fs.readFile('dist/catalog-data.js','utf8'),ctx);
const products=JSON.parse(JSON.stringify(ctx.window.FLOWER_PRODUCTS));
assert.equal(source.length,63);
const cards=products.filter(p=>p.category==='calibrachoa');
assert.equal(cards.length,source.length);
assert.deepEqual(cards.map(p=>p.photoId).sort(),source.map(p=>p.id).sort());
for(const photo of source){
 const product=products.find(p=>p.id==='ok-'+photo.id);
 assert(product&&product.category==='calibrachoa');
 assert.equal(photo.description.trim().match(/^\d+/u)?.[0],product.sku);
 // Retain stable IDs, names, SKU and prices. The album captions are the authoritative descriptions.
 product.description=photo.description;
 product.preserveSourceDescription=true;
 product.source=photo.source;
 product.sourcePhotos=[{photoId:photo.id,image:product.image,description:photo.description,source:photo.source}];
 assert.equal(product.images.length,1);
 await fs.access(`dist/assets/${product.image}.webp`);
}
assert.deepEqual(products.filter(p=>p.category!=='calibrachoa'),before.filter(p=>p.category!=='calibrachoa'));
assert.equal(products.length,before.length);
await fs.writeFile('dist/catalog-data.js',`window.FLOWER_CATEGORIES = ${JSON.stringify(ctx.window.FLOWER_CATEGORIES,null,2)};\nwindow.FLOWER_PRODUCTS = ${JSON.stringify(products,null,2)};\n`);
console.log(JSON.stringify({updated:cards.length,total:products.length,idsUnchanged:true,nonCalibrachoaUnchanged:true,captionsVerbatim:true},null,2));
