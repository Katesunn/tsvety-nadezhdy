import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const album='953213489095';
const source=JSON.parse(await fs.readFile(`source-data/albums/${album}/photos.json`,'utf8'));
assert.equal(source.length,84);
const context={window:{}};
vm.runInNewContext(await fs.readFile('dist/catalog-data.js','utf8'),context);
const categories=context.window.FLOWER_CATEGORIES;
const original=context.window.FLOWER_PRODUCTS;
const importedIds=new Set(source.map(p=>'ok-'+p.id));
const retained=original.filter(p=>!importedIds.has(p.id));
const grouped=new Map();
for(const photo of source){
  const match=photo.description.match(/^\s*(\d+(?:\/\d+)?)\s+([\s\S]*)$/u);
  assert(match,'Missing source article: '+photo.id);
  const sku=match[1],cultivar=match[2].trim();
  const key=sku+' '+cultivar.replace(/\s+/gu,' ');
  const image='products/'+photo.id;
  const sourcePhoto={photoId:photo.id,image,description:photo.description,source:photo.source};
  if(grouped.has(key)){
    const existing=grouped.get(key);
    existing.images.push(image);
    existing.sourcePhotos.push(sourcePhoto);
  }else{
    grouped.set(key,{id:'ok-'+photo.id,category:'dahlia',name:'Георгина '+cultivar,
      sku,price:null,size:'',image,description:photo.description,preserveSourceDescription:true,
      source:photo.source,photoId:photo.id,images:[image],sourcePhotos:[sourcePhoto]});
  }
}
const added=[...grouped.values()];
assert.equal(added.length,83);
assert.equal(added.reduce((n,p)=>n+p.images.length,0),84);
assert.equal(new Set(added.map(p=>p.sku)).size,added.length,'Resulting dahlia product articles must be unique');
for(const p of added){
  for(const image of p.images)await fs.access('dist/assets/'+image+'.webp');
}
const products=[...retained,...added];
await fs.writeFile('dist/catalog-data.js',`window.FLOWER_CATEGORIES = ${JSON.stringify(categories,null,2)};\nwindow.FLOWER_PRODUCTS = ${JSON.stringify(products,null,2)};\n`);
const duplicateSourceArticles=[...grouped.values()].filter(p=>p.images.length>1).map(p=>({
  sku:p.sku,name:p.name,photos:p.sourcePhotos.map(photo=>({photoId:photo.photoId,description:photo.description,source:photo.source}))
}));
const report={album,sourcePhotos:84,resultingCards:83,totalProducts:products.length,
  uniqueResultingArticles:added.length,
  duplicateSourceArticles,
  cards:added.map(p=>({sku:p.sku,name:p.name,photoIds:p.sourcePhotos.map(photo=>photo.photoId),captions:p.sourcePhotos.map(photo=>photo.description)})),
  captionsRetainedVerbatim:true,pricesAbsentInSource:true};
await fs.writeFile(`source-data/albums/${album}/import-report.json`,JSON.stringify(report,null,2));
await fs.writeFile(`source-data/albums/${album}/article-report.md`,[
  '# Отчёт по артикулам георгин',
  '',
  `Источник: ${album}.`,
  '',
  `- Фотографий в альбоме: ${report.sourcePhotos}.`,
  `- Карточек в каталоге: ${report.resultingCards}.`,
  `- Уникальных артикулов карточек: ${report.uniqueResultingArticles}.`,
  '- Повторов артикулов среди карточек нет.',
  '',
  '## Объединённая карточка',
  '',
  'Артикул 51 «Георгина Darlin Scarlet» содержит две фотографии из альбома и остаётся одной карточкой по согласованию с владельцем каталога.',
  '',
  'Фото: '+duplicateSourceArticles[0].photos.map(photo=>photo.photoId).join(', ')+'.'
].join('\n')+'\n');
console.log(JSON.stringify(report,null,2));
