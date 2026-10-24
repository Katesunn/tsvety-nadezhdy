import fs from 'node:fs/promises';
const decode=s=>s.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>');
await fs.mkdir('dist/assets/products',{recursive:true});
const list=JSON.parse(await fs.readFile('source-data/catalog-import.json','utf8'));
let index=0,complete=0;const errors=[];
async function worker(){while(index<list.length){const item=list[index++];const out=`source-data/product-${item.id}.json`;
 try { await fs.access(out);complete++;continue; } catch {}
 try {
   const res=await fetch(item.source);if(!res.ok)throw new Error('Photo '+res.status);const html=await res.text();
   let info;
   for(const m of html.matchAll(/data-props="([^"]+)"/g)){try{const d=JSON.parse(decode(m[1]));if(d.entity?.photo?.info?.id===item.id){info=d.entity.photo.info;break;}}catch{}}
   if(!info)throw new Error('Photo information unavailable');
   const image=await fetch(info.imgSrc);if(!image.ok)throw new Error('Image '+image.status);
   await fs.writeFile(`dist/assets/products/${item.id}.jpg`,Buffer.from(await image.arrayBuffer()));
   const product={...item,description:info.description||item.description,width:info.width,height:info.height};
   await fs.writeFile(out,JSON.stringify(product,null,2));complete++;
   if(complete%20===0)console.log(`Downloaded ${complete}/${list.length}`);
 }catch(e){errors.push({id:item.id,error:e.message});console.log(`Failed ${item.id}: ${e.message}`);}
 await new Promise(r=>setTimeout(r,300));
}}
await Promise.all([worker(),worker(),worker()]);
await fs.writeFile('source-data/download-errors.json',JSON.stringify(errors,null,2));
console.log(JSON.stringify({complete,total:list.length,errors}));
