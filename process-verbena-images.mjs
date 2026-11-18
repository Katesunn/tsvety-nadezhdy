import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let sharp;
try { sharp=require('sharp'); } catch { sharp=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')); }
const album='978540254407', base=`source-data/albums/${album}`;
const photos=JSON.parse(await fs.readFile(`${base}/photos.json`,'utf8'));
await fs.mkdir(`${base}/retouched`,{recursive:true});
// These five source pictures contained a label, watermark or clipped graphic.
// Their cleaned, manually reviewed versions are kept alongside the album source.
const cleaned=new Set(['973745536455','973745401031','973743273671','973394984647','973174763463']);
const report=[];
for(const photo of photos){
  const source=cleaned.has(photo.id)
    ? `${base}/retouched/${photo.id}.png`
    : photo.original;
  let pipeline=sharp(source).rotate();
  const buffer=await pipeline.trim({background:'#ffffff',threshold:10}).png().toBuffer();
  await sharp(buffer).png().toFile(`${base}/retouched/${photo.id}.png`);
  const output=`dist/assets/products/${photo.id}.webp`;
  // 900 px is ample for the responsive catalogue and keeps the image payloads fast.
  const info=await sharp(buffer).resize({width:900,height:900,fit:'inside',withoutEnlargement:true}).webp({quality:86,effort:6}).toFile(output);
  report.push({photoId:photo.id,file:output,width:info.width,height:info.height,bytes:info.size,treatment:cleaned.has(photo.id)?'cleaned supplier mark or watermark; trimmed white exterior edge if present':'original photo; trimmed white exterior edge if present'});
}
await fs.writeFile(`${base}/image-report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({photos:report.length,cleaned: cleaned.size,totalMB:(report.reduce((n,p)=>n+p.bytes,0)/1048576).toFixed(2)},null,2));

