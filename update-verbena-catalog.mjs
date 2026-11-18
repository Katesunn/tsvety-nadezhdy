import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const album='978540254407',base=`source-data/albums/${album}`;
const source=JSON.parse(await fs.readFile(`${base}/photos.json`,'utf8'));
const before=JSON.parse(await fs.readFile(`${base}/catalog-before.json`,'utf8'));
const ctx={window:{}};
vm.runInNewContext(await fs.readFile('dist/catalog-data.js','utf8'),ctx);
const products=JSON.parse(JSON.stringify(ctx.window.FLOWER_PRODUCTS));
const categories=JSON.parse(JSON.stringify(ctx.window.FLOWER_CATEGORIES));
const oldVerbena=products.filter(p=>p.category==='verbena');
const others=products.filter(p=>p.category!=='verbena');
assert.equal(source.length,20);
assert.equal(oldVerbena.length,23);
assert.deepEqual(others,before.filter(p=>p.category!=='verbena'));
const added=source.map(photo=>{
  const match=photo.description.match(/^\s*(\d+(?:\/\d+)?)\s+([\s\S]*?)\s*$/u);
  assert(match,`Missing SKU/caption: ${photo.id}`);
  const sku=match[1], sourceName=match[2].trim();
  const name=/^вербена\b/iu.test(sourceName)?sourceName:`Вербена ${sourceName}`;
  const image=`products/${photo.id}`;
  return {id:`ok-${photo.id}`,category:'verbena',name,sku,price:null,size:'',image,description:photo.description,source:photo.source,photoId:photo.id,images:[image],sourcePhotos:[{photoId:photo.id,image,description:photo.description,source:photo.source}],preserveSourceDescription:true};
});
const ids=new Set(others.map(p=>p.id));
for(const p of added){assert(!ids.has(p.id),`Duplicate id ${p.id}`);await fs.access(`dist/assets/${p.image}.webp`);}
const next=[...others,...added];
ctx.window.FLOWER_CATEGORIES=categories;
await fs.writeFile('dist/catalog-data.js',`window.FLOWER_CATEGORIES = ${JSON.stringify(categories,null,2)};\nwindow.FLOWER_PRODUCTS = ${JSON.stringify(next,null,2)};\n`);
console.log(JSON.stringify({replaced:oldVerbena.length,added:added.length,total:next.length,captionsVerbatim:true,otherCategoriesUntouched:true,pricesNotInvented:true},null,2));
