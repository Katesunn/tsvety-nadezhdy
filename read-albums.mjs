import fs from 'node:fs/promises';
await fs.mkdir('source-data',{recursive:true});
for(const id of ['965733811399','976415988935','952972831943']){
 const res=await fetch('https://ok.ru/profile/211714658759/album/'+id,{headers:{'User-Agent':'Mozilla/5.0'}});
 const html=await res.text();await fs.writeFile('source-data/album-'+id+'.html',html);
 console.log(JSON.stringify({id,status:res.status,length:html.length,title:html.match(/<title>(.*?)<\/title>/s)?.[1],sample:html.slice(0,180)}));
}
const res=await fetch('https://web.max.ru/164013648'); const html=await res.text();await fs.writeFile('source-data/max.html',html);console.log(JSON.stringify({max:res.status,length:html.length,title:html.match(/<title>(.*?)<\/title>/s)?.[1]}));
