import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
let sharp;
try { sharp=require('sharp'); } catch { sharp=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')); }

const album='978540279239';
const base=`source-data/albums/${album}`;
const photos=JSON.parse(await fs.readFile(`${base}/photos.json`,'utf8'));
const cleaned=new Set(['978697875399','978697801159','978697766599','955787764167','978697936071']);
const report=[];

for(const photo of photos){
  const source=cleaned.has(photo.id) ? `${base}/retouched/${photo.id}.png` : photo.original;
  const buffer=await sharp(source).rotate().trim({background:'#ffffff',threshold:10}).png().toBuffer();
  const output=`dist/assets/products/${photo.id}.webp`;
  const info=await sharp(buffer)
    .resize({width:900,height:900,fit:'inside',withoutEnlargement:true})
    .webp({quality:86,effort:6})
    .toFile(output);
  report.push({photoId:photo.id,file:output,width:info.width,height:info.height,bytes:info.size,treatment:cleaned.has(photo.id)?'cleaned watermark, label or screenshot edge; trimmed white exterior edge if present':'original photo; trimmed white exterior edge if present'});
}

await fs.writeFile(`${base}/image-report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({photos:report.length,cleaned:cleaned.size,totalMB:(report.reduce((total,p)=>total+p.bytes,0)/1048576).toFixed(2)},null,2));
