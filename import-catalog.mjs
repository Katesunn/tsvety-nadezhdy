import fs from 'node:fs/promises';
const decode=s=>s.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&#x([a-f\d]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>');
const all=[];
for(const album of ['965733811399','952972831943']){
 let url='https://m.ok.ru/profile/211714658759/album/'+album;let page=0;const visited=new Set();
 while(url&&!visited.has(url)&&page<30){
   visited.add(url);const res=await fetch(url);if(!res.ok)throw new Error('Album '+res.status);const html=await res.text();
   await fs.writeFile(`source-data/mobile-${album}-${page}.html`,html);
   const rows=[];
   for(const m of html.matchAll(/<a\b[^>]*\bdata-alt="[^"]*"[^>]*>/g)){
     const tag=decode(m[0]);const description=tag.match(/data-alt="([^"]*)"/)?.[1]||'';
     const href=tag.match(/href="([^"]*)"/)?.[1]||'';
     let decoded=decodeURIComponent(decodeURIComponent(href));const id=decoded.match(/\/album\/\d+\/(\d+)/)?.[1];
     const image=tag.match(/background-image:url\('([^']+)'\)/)?.[1];
     if(id)rows.push({album,id,description,thumbnail:image,source:`https://ok.ru/profile/211714658759/album/${album}/${id}`});
   }
   all.push(...rows); console.log(`Album ${album} page ${page+1}: ${rows.length}, total ${all.length}`);
   const next=[...html.matchAll(/<a\b[^>]*class="pager_action"[^>]*>/g)].map(m=>decode(m[0].match(/href="([^"]+)"/)?.[1]||'')).find(x=>x.includes('fr.pt=Next'));
   url=next?new URL(next,'https://m.ok.ru').href:null;page++;
   await new Promise(r=>setTimeout(r,200));
 }
}
const unique=[...new Map(all.map(p=>[p.id,p])).values()];
await fs.writeFile('source-data/catalog-import.json',JSON.stringify(unique,null,2));
await fs.writeFile('source-data/captions.txt',unique.map(p=>`${p.id} | ${p.description}`).join('\n'));
console.log('Imported '+unique.length+' unique photos.');
