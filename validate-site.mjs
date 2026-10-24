import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const dir=path.resolve('dist');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dir,'catalog-data.js'),'utf8'),ctx);
const products=ctx.window.FLOWER_PRODUCTS,categories=ctx.window.FLOWER_CATEGORIES;
assert.equal(products.length,274);assert.equal(new Set(products.map(p=>p.id)).size,274);
for(const p of products){
 assert(categories.some(c=>c.id===p.category));assert(p.name&&p.description);
 assert(p.price===null||(typeof p.price==='number'&&p.price>0));
 assert(/^https:\/\/ok.ru\/profile\/211714658759\/album\/\d+\/\d+$/.test(p.source));
 assert(fs.existsSync(path.join(dir,'assets',p.image+'.webp')));
 for(const image of p.images)assert(fs.existsSync(path.join(dir,'assets',image+'.webp')));
 if(p.price!==null){const body=p.description;const prices=[...body.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:руб(?:лей|ля|ль)?\.?|р\.?)(?=\s|[),.;]|$)/gi)].map(m=>Number(m[1].replace(',','.')));assert(prices.includes(p.price),`Price not in source for ${p.id}`);}
}
const dipladenia=products.find(p=>p.sku==='301');assert.equal(dipladenia.price,200);assert.equal(dipladenia.category,'other');
assert.equal(products.filter(p=>p.category==='calibrachoa').length,63);
assert.equal(products.filter(p=>p.category==='dahlia'||p.category==='osteospermum').length,0);
for(const filename of ['index.html','catalog.html','favorites.html','credits.html']){
 const html=fs.readFileSync(path.join(dir,filename),'utf8');
 for(const m of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:[?#][^"]*)?"/g))assert(fs.existsSync(path.join(dir,m[1])),`Missing ${m[1]} in ${filename}`);
}
const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');
for(const m of app.matchAll(/icon\('([^']+)'\)/g))assert(fs.existsSync(path.join(dir,'assets',m[1]+'.svg')),`Missing icon ${m[1]}`);
assert(!/демонстрационн/i.test(app));
const bytes=fs.readdirSync(path.join(dir,'assets/products')).reduce((total,f)=>total+fs.statSync(path.join(dir,'assets/products',f)).size,0);
console.log(JSON.stringify({status:'passed',products:products.length,categories:categories.length,priced:products.filter(p=>p.price!==null).length,productImagesMB:(bytes/1024/1024).toFixed(1)},null,2));
