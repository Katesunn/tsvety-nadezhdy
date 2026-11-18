import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let sharp;
try{sharp=require('sharp');}catch{sharp=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}
const album='953213489095',base=`source-data/albums/${album}`;
const photos=JSON.parse(await fs.readFile(`${base}/photos.json`,'utf8'));
const edits=JSON.parse(await fs.readFile(`${base}/retouch-results.json`,'utf8'));
await fs.mkdir(`${base}/retouched`,{recursive:true});
for(const edit of edits){await fs.copyFile(edit.path,`${base}/retouched/${edit.id}.png`);}
const rect=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white"/>`;
const outsideCircle=(cx,cy,r,w,h)=>`<defs><mask id="outer"><rect width="100%" height="100%" fill="white"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="black"/></mask></defs><rect width="${w}" height="${h}" fill="white" mask="url(#outer)"/>`;
const recipes={
 '972770072775':{mask:()=>rect(782,57,91,92)},
 '972769854151':{mask:()=>rect(410,780,113,61)+rect(427,891,80,27)},
 '972768771271':{mask:()=>rect(355,889,169,56)},
 '972768247495':{full:true},
 '972768041159':{full:true},
 '972768111815':{mask:()=>rect(17,29,247,82)+rect(947,39,33,69)},
 '972768351943':{mask:(w,h)=>outsideCircle(540,477,490,w,h),crop:{left:0,top:0,width:1052,height:948}},
 '972767605703':{mask:(w,h)=>outsideCircle(421,420,414,w,h)+'<circle cx="133" cy="133" r="145" fill="white"/>'},
 '978484797383':{mask:(w,h)=>outsideCircle(539,568,520,w,h)},
 '972768149447':{crop:{left:0,top:0,width:920,height:729}},
 '972767882951':{crop:{left:0,top:0,width:940,height:1003}},
 '965702653127':{mask:()=>rect(0,1475,145,133)+rect(944,1475,109,133)},
 '965702571975':{crop:{left:0,top:0,width:1024,height:650}},
 '953214670279':{crop:{left:0,top:120,width:720,height:1320}},
 '953214542535':{crop:{left:0,top:120,width:720,height:1320}},
 '953214437319':{crop:{left:0,top:420,width:720,height:540}},
 '953214189511':{crop:{left:0,top:161,width:720,height:670}},
 '953213861063':{crop:{left:0,top:405,width:720,height:721}},
 '967253297607':{crop:{left:0,top:0,width:818,height:800}},
 '978484706503':{crop:{left:0,top:60,width:1040,height:980}},
 '978484811207':{crop:{left:0,top:0,width:847,height:740}}
};
const report=[];
for(const photo of photos){
 const input=photo.original;
 const {width:w,height:h}=await sharp(input).metadata();
 const recipe=recipes[photo.id]||{};
 let image=await sharp(input).rotate().png().toBuffer();
 if(recipe.full){image=await sharp(`${base}/retouched/${photo.id}.png`).resize(w,h,{fit:'fill'}).png().toBuffer();}
 else if(recipe.mask){
   // Use imagegen only in the affected regions, retaining the original photograph elsewhere.
   const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${recipe.mask(w,h)}</svg>`);
   const alpha=await sharp(svg).blur(2).png().toBuffer();
   const overlay=await sharp(`${base}/retouched/${photo.id}.png`).resize(w,h,{fit:'fill'}).ensureAlpha().composite([{input:alpha,blend:'dest-in'}]).png().toBuffer();
   image=await sharp(image).composite([{input:overlay}]).png().toBuffer();
 }
 if(recipe.crop)image=await sharp(image).extract(recipe.crop).png().toBuffer();
 // Trim exterior blank padding; genuine photographic white backgrounds remain inside the image.
 image=await sharp(image).trim({background:'#ffffff',threshold:10}).png().toBuffer();
 const output=`dist/assets/products/${photo.id}.webp`;
 const info=await sharp(image).resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:90,effort:6}).toFile(output);
 report.push({photoId:photo.id,file:output,width:info.width,height:info.height,bytes:info.size,
   treatment:recipe.full?'imagegen watermark restoration':recipe.mask?'local imagegen retouch with original pixels retained':recipe.crop?'crop screenshot controls / edge labels':'original photograph, exterior padding trimmed'});
}
await fs.writeFile(`${base}/image-report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({photos:report.length,edited:report.filter(p=>!p.treatment.startsWith('original')).length,totalMB:(report.reduce((n,p)=>n+p.bytes,0)/1048576).toFixed(2)},null,2));
