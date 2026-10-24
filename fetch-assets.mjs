import fs from 'node:fs/promises';
const dir = new URL('./dist/assets/', import.meta.url);
const plants = {dahlia:'Dahlia', petunia:'Petunia', calibrachoa:'Calibrachoa', osteospermum:'Osteospermum ecklonis', verbena:'Glandularia', nemesia:'Nemesia (plant)', coleus:'Coleus scutellarioides'};
const credits=[];
async function json(url){for(let i=0;i<4;i++){const res=await fetch(url);if(res.ok){try{return JSON.parse(await res.text());}catch{}} await new Promise(r=>setTimeout(r,3000*(i+1)));}throw new Error('API unavailable');}
const api=new URL('https://en.wikipedia.org/w/api.php');
api.search=new URLSearchParams({action:'query',format:'json',prop:'pageimages',titles:Object.values(plants).join('|'),pithumbsize:'1600',redirects:'1'});
const data=await json(api);
const pages=Object.values(data.query.pages);
for (const [key,title] of Object.entries(plants)) {
  const page=pages.find(p=>p.title===title)||pages.find(p=>data.query.redirects?.some(r=>r.from===title&&r.to===p.title));
  if(!page.thumbnail) throw new Error('No image: '+title);
  const res=await fetch(page.thumbnail.source);
  if(!res.ok) throw new Error('Download '+res.status);
  await fs.writeFile(new URL(key+'.jpg',dir),Buffer.from(await res.arrayBuffer()));
  credits.push({key,title,file:page.pageimage,url:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(page.pageimage)});
  console.log(key+' downloaded');
}
const c=new URL('https://commons.wikimedia.org/w/api.php');
c.search=new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'extmetadata',titles:credits.map(c=>'File:'+c.file).join('|')});
const cd=await json(c);
for(const credit of credits){const p=Object.values(cd.query.pages).find(p=>p.title==='File:'+credit.file);credit.metadata=p?.imageinfo?.[0].extmetadata;}
await fs.writeFile(new URL('./image-credits.json',import.meta.url),JSON.stringify(credits,null,2));
for (const name of ['heart','arrow-up-right','arrow-right','arrow-left','menu-2','x','map-pin','truck','plant-2','copy','check','search','sun','moon','flower','chevron-down','brand-ok-ru','brand-messenger']) {
  const res=await fetch('https://raw.githubusercontent.com/tabler/tabler-icons/main/icons/outline/'+name+'.svg');
  if(res.ok)await fs.writeFile(new URL(name+'.svg',dir),await res.text());
}
const max=await fetch('https://max.ru');
const html=await max.text();
const logo=html.match(/<link[^>]+href="([^"]+)"[^>]+rel="icon"/)||html.match(/<link[^>]+rel="icon"[^>]+href="([^"]+)"/);
if(logo){const res=await fetch(new URL(logo[1],'https://max.ru'));if(res.ok)await fs.writeFile(new URL('max-icon.png',dir),Buffer.from(await res.arrayBuffer()));}
