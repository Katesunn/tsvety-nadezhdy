import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const album='978540279239';
const base=`source-data/albums/${album}`;
const source=JSON.parse(await fs.readFile(`${base}/photos.json`,'utf8'));
const before={window:{}};
vm.runInNewContext(await fs.readFile(`${base}/catalog-before.js`,'utf8'),before);
const current={window:{}};
vm.runInNewContext(await fs.readFile('dist/catalog-data.js','utf8'),current);
const products=JSON.parse(JSON.stringify(current.window.FLOWER_PRODUCTS));
const categories=JSON.parse(JSON.stringify(current.window.FLOWER_CATEGORIES));
const oldNemesias=products.filter(p=>p.category==='nemesia');
const others=products.filter(p=>p.category!=='nemesia');
const beforeOthers=JSON.parse(JSON.stringify(before.window.FLOWER_PRODUCTS.filter(p=>p.category!=='nemesia')));

assert.equal(source.length,13);
assert([9,13].includes(oldNemesias.length),`Unexpected nemesia count: ${oldNemesias.length}`);
assert.deepEqual(others,beforeOthers);

const nemesias=source.map(photo=>{
  const match=photo.description.match(/^\s*(\d+(?:\/\d+)?)\s+([\s\S]*?)\s*$/u);
  assert(match,`Missing item number or caption: ${photo.id}`);
  const sku=match[1];
  const name=match[2].trim();
  const image=`products/${photo.id}`;
  return {
    id:`ok-${photo.id}`,
    category:'nemesia',
    name,
    sku,
    price:null,
    size:'',
    image,
    description:photo.description,
    source:photo.source,
    photoId:photo.id,
    images:[image],
    sourcePhotos:[{photoId:photo.id,image,description:photo.description,source:photo.source}],
    preserveSourceDescription:true
  };
}).sort((a,b)=>{
  const [aWhole,aPart='0']=a.sku.split('/').map(Number);
  const [bWhole,bPart='0']=b.sku.split('/').map(Number);
  return aWhole-bWhole||aPart-bPart;
});

const ids=new Set(others.map(p=>p.id));
for(const p of nemesias){
  assert(!ids.has(p.id),`Duplicate ID: ${p.id}`);
  await fs.access(`dist/assets/${p.image}.webp`);
}

const next=[...others,...nemesias];
await fs.writeFile('dist/catalog-data.js',`window.FLOWER_CATEGORIES = ${JSON.stringify(categories,null,2)};\nwindow.FLOWER_PRODUCTS = ${JSON.stringify(next,null,2)};\n`);
console.log(JSON.stringify({replaced:oldNemesias.length,added:nemesias.length,total:next.length,captionsVerbatim:true,otherCategoriesUntouched:true,pricesNotInvented:true},null,2));
