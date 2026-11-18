import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const album='978580190919';
const base=`source-data/albums/${album}`;
const source=JSON.parse(await fs.readFile(`${base}/photos.json`,'utf8'));
const context={window:{}};
vm.runInNewContext(await fs.readFile('dist/catalog-data.js','utf8'),context);
const current=JSON.parse(JSON.stringify(context.window.FLOWER_PRODUCTS));
const categories=JSON.parse(JSON.stringify(context.window.FLOWER_CATEGORIES));
const category={
  id:'euro-cuttings',
  name:'Укорененные евро черенки',
  short:'Евро черенки',
  plant:'Евро черенки',
  desc:'Укорененные черенки из европейского посадочного материала для сада, балкона и кашпо.'
};
const nextCategories=[category,...categories.filter(item=>item.id!==category.id)];
const others=current.filter(item=>item.category!==category.id);
const added=source.map((photo,sourceIndex)=>{
  const match=photo.description.match(/^\s*(\d+(?:\/\d+)?)\s+([\s\S]*?)\s*$/u);
  assert(match,`Missing article or description: ${photo.id}`);
  const sku=match[1], sourceName=match[2].trim();
  // The supplier caption for this item contains a full care note after the name.
  // Keep that useful text in the description rather than turning it into a heading.
  const name=(sourceName.match(/^(.+?)\s*\.\s+(?=Эта сортосерия(?:\s|$))/iu)?.[1]||sourceName).trim(), image=`products/euro-${photo.id}`;
  return {id:`ok-euro-${photo.id}`,category:category.id,name,sku,price:null,size:'',image,description:photo.description,source:photo.source,photoId:photo.id,images:[image],sourcePhotos:[{photoId:photo.id,image,description:photo.description,source:photo.source}],preserveSourceDescription:true,sourceIndex};
}).sort((a,b)=>Number(a.sku)-Number(b.sku)||a.sourceIndex-b.sourceIndex).map(({sourceIndex,...item})=>item);
for(const item of added) await fs.access(`dist/assets/${item.image}.webp`);
context.window.FLOWER_CATEGORIES=nextCategories;
context.window.FLOWER_PRODUCTS=[...others,...added];
await fs.writeFile('dist/catalog-data.js',`window.FLOWER_CATEGORIES = ${JSON.stringify(nextCategories,null,2)};\nwindow.FLOWER_PRODUCTS = ${JSON.stringify(context.window.FLOWER_PRODUCTS,null,2)};\n`);
const duplicateSourceArticles=[...new Set(added.map(item=>item.sku).filter((sku,_,items)=>items.filter(item=>item===sku).length>1))];
console.log(JSON.stringify({added:added.length,total:context.window.FLOWER_PRODUCTS.length,category:category.name,captionsVerbatim:true,duplicateSourceArticles},null,2));
