import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
let sharp;
try { sharp=require('sharp'); } catch { sharp=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')); }

const album='978580190919';
const base=`source-data/albums/${album}`;
const photos=JSON.parse(await fs.readFile(`${base}/photos.json`,'utf8'));
await fs.mkdir(`${base}/retouched`,{recursive:true});
await fs.mkdir('dist/assets/products',{recursive:true});

// Supplier labels are only in the outer white margin on these nine source photos.
// Cropping that margin preserves the plant itself and avoids inventing image content.
const crops=new Map([
  ['978580785351',{bottom:170}], ['965770135239',{bottom:145}],
  ['972810236359',{bottom:150}], ['972810391239',{bottom:155}],
  ['972810778055',{bottom:155}], ['978580347591',{top:90}],
  ['978580255431',{top:80}], ['978580217031',{top:80}],
  ['978580195015',{bottom:85}]
]);
const report=[];
async function processPhoto(photo){
  const source=photo.original;
  const meta=await sharp(source).rotate().metadata();
  const crop=crops.get(photo.id);
  let image=sharp(source).rotate();
  if(crop){
    const top=crop.top||0, bottom=crop.bottom||0;
    const width=meta.width;
    const height=meta.height;
    // Keep the crop inside the decoded image even when an EXIF orientation is present.
    image=image.extract({left:0,top:Math.min(top,height-1),width,height:Math.max(1,height-top-bottom)});
  }
  // Decode any crop before trim; this avoids libvips applying trim coordinates to
  // the dimensions of the original image.
  const cropped=await image.png().toBuffer();
  const trimmed=await sharp(cropped).trim({background:'#ffffff',threshold:12}).png().toBuffer();
  await sharp(trimmed).png().toFile(`${base}/retouched/${photo.id}.png`);
  const output=`dist/assets/products/euro-${photo.id}.webp`;
  const info=await sharp(trimmed).resize({width:900,height:900,fit:'inside',withoutEnlargement:true}).webp({quality:86,effort:6}).toFile(output);
  return {photoId:photo.id,file:output,width:info.width,height:info.height,bytes:info.size,treatment:crop?'removed supplier label from the exterior margin; trimmed white exterior edge':'trimmed white exterior edge where present'};
}
for(let start=0;start<photos.length;start+=12){
  report.push(...await Promise.all(photos.slice(start,start+12).map(async photo=>{
    try { return await processPhoto(photo); }
    catch(error) { throw new Error(`${photo.id}: ${error.message}`); }
  })));
}
await fs.writeFile(`${base}/image-report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({photos:report.length,labelMarginsRemoved:crops.size,totalMB:(report.reduce((total,item)=>total+item.bytes,0)/1048576).toFixed(2)},null,2));
