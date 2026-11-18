import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const dir=path.resolve('dist');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dir,'catalog-data.js'),'utf8'),ctx);
const products=ctx.window.FLOWER_PRODUCTS,categories=ctx.window.FLOWER_CATEGORIES;
assert.equal(products.length,452);assert.equal(new Set(products.map(p=>p.id)).size,452);
function articleParts(value){const match=String(value||'').trim().match(/^(\d+)(?:\/(\d+))?/);return match?[Number(match[1]),Number(match[2]||0)]:[Infinity,Infinity];}
for(const category of categories){
 const items=products.filter(product=>product.category===category.id);
 for(let index=1;index<items.length;index++){
  const before=articleParts(items[index-1].sku),after=articleParts(items[index].sku);
  assert(before[0]<after[0]||(before[0]===after[0]&&before[1]<=after[1]),`Articles are not ascending in ${category.id}`);
 }
}
for(const p of products){
 assert(categories.some(c=>c.id===p.category));assert(p.name&&p.description);
 assert(p.price===null||(typeof p.price==='number'&&p.price>0));
 assert(/^https:\/\/ok.ru\/profile\/211714658759\/album\/\d+\/\d+$/.test(p.source));
 assert(fs.existsSync(path.join(dir,'assets',p.image+'.webp')));
 for(const image of p.images)assert(fs.existsSync(path.join(dir,'assets',image+'.webp')));
 if(p.price!==null){const body=p.description;const prices=[...body.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:руб(?:лей|ля|ль)?\.?|р\.?)(?=\s|[),.;]|$)/gi)].map(m=>Number(m[1].replace(',','.')));assert(prices.includes(p.price),`Price not in source for ${p.id}`);}
}
const dipladenia=products.find(p=>p.sku==='301');assert.equal(dipladenia.price,200);assert.equal(dipladenia.category,'other');
assert.equal(products.filter(p=>p.category==='calibrachoa').length,63);
const calibrachoa=products.filter(p=>p.category==='calibrachoa');
const calibrachoaAlbum=path.resolve('source-data/albums/952972831943/photos.json');
if(fs.existsSync(calibrachoaAlbum)){
 const source=JSON.parse(fs.readFileSync(calibrachoaAlbum,'utf8'));
 assert.equal(source.length,63);
 assert.deepEqual(Array.from(calibrachoa,p=>p.photoId).sort(),source.map(p=>p.id).sort());
 for(const photo of source){
  const p=calibrachoa.find(p=>p.photoId===photo.id);
  assert.equal(p.description,photo.description);
  assert.equal(p.preserveSourceDescription,true);
  assert.equal(p.sourcePhotos.length,1);
  assert.equal(p.sourcePhotos[0].description,photo.description);
  assert.equal(p.sourcePhotos[0].source,photo.source);
 }
}
const dahlias=products.filter(p=>p.category==='dahlia');
assert.equal(dahlias.length,83);
assert.equal(products.filter(p=>p.category==='osteospermum').length,0);
assert.equal(dahlias.reduce((n,p)=>n+p.images.length,0),84);
assert.equal(new Set(dahlias.flatMap(p=>p.sourcePhotos.map(photo=>photo.photoId))).size,84);
assert.equal(dahlias.find(p=>p.sku==='51').images.length,2);
for(const p of dahlias){
 assert.equal(p.price,null);assert.equal(p.preserveSourceDescription,true);
 assert.equal(p.images.length,p.sourcePhotos.length);
 assert.equal(p.description,p.sourcePhotos[0].description);
 for(const photo of p.sourcePhotos){
  assert.equal(photo.source,`https://ok.ru/profile/211714658759/album/953213489095/${photo.photoId}`);
  assert(p.images.includes(photo.image));
 }
}
const euroCuttings=products.filter(p=>p.category==='euro-cuttings');
assert.equal(euroCuttings.length,94);
assert.equal(categories[0].id,'euro-cuttings');
const euroAlbum=path.resolve('source-data/albums/978580190919/photos.json');
if(fs.existsSync(euroAlbum)){
 const source=JSON.parse(fs.readFileSync(euroAlbum,'utf8'));
 assert.equal(source.length,94);
 assert.deepEqual([...euroCuttings.map(p=>p.photoId)].sort(),source.map(p=>p.id).sort());
 for(const photo of source){
  const product=euroCuttings.find(p=>p.photoId===photo.id);
  assert(product,`Missing euro cutting photo ${photo.id}`);
  assert.equal(product.description,photo.description);
  assert.equal(product.preserveSourceDescription,true);
 }
}
const importedAlbum=path.resolve('source-data/albums/953213489095/photos.json');
if(fs.existsSync(importedAlbum)){
 const source=JSON.parse(fs.readFileSync(importedAlbum,'utf8'));
 for(const photo of source){
  const record=dahlias.flatMap(p=>p.sourcePhotos).find(p=>p.photoId===photo.id);
  assert(record,`Missing source photo ${photo.id}`);assert.equal(record.description,photo.description);
 }
}
for(const filename of ['index.html','catalog.html','favorites.html','credits.html']){
 const html=fs.readFileSync(path.join(dir,filename),'utf8');
 for(const m of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:[?#][^"]*)?"/g))assert(fs.existsSync(path.join(dir,m[1])),`Missing ${m[1]} in ${filename}`);
}
const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');
for(const m of app.matchAll(/icon\('([^']+)'\)/g))assert(fs.existsSync(path.join(dir,'assets',m[1]+'.svg')),`Missing icon ${m[1]}`);
assert(!/демонстрационн/i.test(app));
const bytes=fs.readdirSync(path.join(dir,'assets/products')).reduce((total,f)=>total+fs.statSync(path.join(dir,'assets/products',f)).size,0);
console.log(JSON.stringify({status:'passed',products:products.length,categories:categories.length,priced:products.filter(p=>p.price!==null).length,productImagesMB:(bytes/1024/1024).toFixed(1)},null,2));
