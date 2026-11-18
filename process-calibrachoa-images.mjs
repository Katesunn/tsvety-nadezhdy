import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let sharp;
try{sharp=require('sharp');}catch{sharp=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}
const album='952972831943',base=`source-data/albums/${album}`;
const photos=JSON.parse(await fs.readFile(`${base}/photos.json`,'utf8'));
const edits=JSON.parse(await fs.readFile(`${base}/retouch-results.json`,'utf8'));
await fs.mkdir(`${base}/retouched`,{recursive:true});
for(const edit of edits)await fs.copyFile(edit.path,`${base}/retouched/${edit.id}.png`);
const rect=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white"/>`;
const ellipse=(x,y,rx,ry)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="white"/>`;
const polygon=points=>`<polygon points="${points}" fill="white"/>`;
const outsideCircle=(cx,cy,r)=>`<defs><mask id="outer"><rect width="100%" height="100%" fill="white"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="black"/></mask></defs><rect width="100%" height="100%" fill="white" mask="url(#outer)"/>`;
const crop=(width,height,left=0,top=0)=>({left,top,width,height});
const recipes={
 '973394733511':{mask:()=>outsideCircle(540,477,600)+rect(0,125,53,156),crop:crop(1076,1010,2,2)},
 '973394713287':{mask:()=>rect(515,563,200,97),crop:crop(756,668,1,1)},
 '973394605255':{crop:crop(1035,858)},
 '973394571463':{mask:()=>ellipse(362,169,238,170),crop:crop(1038,993,1,1)},
 '973394511047':{crop:crop(1003,810,1,1)},
 '973174036423':{mask:()=>rect(358,635,220,141)},
 '973173753287':{mask:()=>rect(813,31,96,98)+rect(263,737,264,164),crop:crop(921,962)},
 '973111848647':{full:true},
 '973111752647':{full:true},
 '973073430727':{mask:()=>ellipse(911,750,131,136),crop:crop(1030,810,1,1)},
 '973027263431':{mask:()=>rect(0,29,239,83)},
 '973027157191':{full:true},
 '973004838087':{mask:()=>rect(0,0,185,139)+rect(0,819,224,116)+rect(648,784,277,151)},
 '965805981895':{mask:()=>rect(414,858,231,151)},
 '965727601863':{crop:crop(885,715)},
 '965727517639':{mask:()=>ellipse(150,170,156,157),crop:crop(994,904,3,3)},
 '965627277255':{mask:()=>rect(854,0,68,53)},
 '965627021767':{mask:()=>rect(339,678,420,325),feather:18},
 '952977025223':{mask:()=>polygon('301,460 338,460 338,505 379,522 414,526 424,555 310,550')}
};
const report=[];
for(const photo of photos){
 const {width:w,height:h}=await sharp(photo.original).metadata();
 const recipe=recipes[photo.id]||{};
 let buffer=await sharp(photo.original).rotate().png().toBuffer();
 if(recipe.full){
  buffer=await sharp(`${base}/retouched/${photo.id}.png`).resize(w,h,{fit:'fill'}).png().toBuffer();
 }else if(recipe.mask){
  // Composite only the edited overlay regions; original plant pixels elsewhere remain unchanged.
  const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${recipe.mask(w,h)}</svg>`);
  const alpha=await sharp(svg).blur(recipe.feather||2).png().toBuffer();
  const overlay=await sharp(`${base}/retouched/${photo.id}.png`).resize(w,h,{fit:'fill'}).ensureAlpha().composite([{input:alpha,blend:'dest-in'}]).png().toBuffer();
  buffer=await sharp(buffer).composite([{input:overlay}]).png().toBuffer();
 }
 if(recipe.crop)buffer=await sharp(buffer).extract(recipe.crop).png().toBuffer();
 // Remove exterior padding only, retaining genuine white backgrounds around isolated potted plants.
 buffer=await sharp(buffer).trim({background:'#ffffff',threshold:10}).png().toBuffer();
 const output=`dist/assets/products/${photo.id}.webp`;
 const info=await sharp(buffer).resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:90,effort:6}).toFile(output);
 report.push({photoId:photo.id,file:output,width:info.width,height:info.height,bytes:info.size,
  treatment:recipe.full?'imagegen restoration of overlaid graphics / watermarks':recipe.mask?'local imagegen retouch, original pixels retained elsewhere':recipe.crop?'crop exterior cultivar labels':'original photo, exterior white padding trimmed'});
}
await fs.writeFile(`${base}/image-report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({photos:report.length,retouched:edits.length,croppedLabels:report.filter(p=>p.treatment.startsWith('crop')).length,totalMB:(report.reduce((n,p)=>n+p.bytes,0)/1048576).toFixed(2)},null,2));
