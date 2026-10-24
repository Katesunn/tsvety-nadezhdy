import fs from 'node:fs/promises';
const src=await fs.readFile('source-data/album-965733811399.html','utf8');
const link=src.match(/href="([^"]*st.layer.photoId=973460856263[^"]*)"/)[1].replaceAll('&amp;','&');
const urls=['https://m.ok.ru/profile/211714658759/album/965733811399','https://ok.ru'+link,'https://ok.ru/profile/211714658759/album/965733811399?st.page=2'];
await Promise.all(urls.map(async(u,i)=>{const r=await fetch(u);const s=await r.text();await fs.writeFile('source-data/probe-'+i+'.html',s);console.log({i,status:r.status,length:s.length,images:(s.match(/img_\d+/g)||[]).length,title:s.match(/<title>(.*?)<\/title>/s)?.[1]});}));
