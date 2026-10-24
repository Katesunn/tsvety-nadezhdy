import fs from 'node:fs/promises';
import vm from 'node:vm';
const context={window:{}};vm.runInNewContext(await fs.readFile('dist/catalog-data.js','utf8'),context);
const categories=context.window.FLOWER_CATEGORIES.filter(c=>c.id!=='other');
categories.push({id:'other',name:'Другие цветы коллекции',short:'Другие цветы',plant:'Растение',desc:'Бакопа, биденс, лофос, дипладения и другие растения из моей коллекции.'});
const raw=JSON.parse(await fs.readFile('source-data/catalog-import.json','utf8'));
const products=[],unassigned=[],supporting=[];
const cultivarPetunia=/каскади|фанфар|крейз[еи]туни|тумбелин|сурфини|петхоа|bubbles|constellation|альпетуни|designer|виста|sparkling|blue diamond|капелл|sweetsunshine|bonnie|\bray\b|литлтуни|глейсер|circus|famous|baby doll|splash dance|сплэш|capella|amore|аmore/i;
const verbenaSeries=/wicked|empress|vanessa|estrella|voodo|lanai|drums/i;
for(const row of raw){
 let detail;try{detail=JSON.parse(await fs.readFile(`source-data/product-${row.id}.json`,'utf8'));}catch{throw new Error('Missing full product '+row.id);}
 const text=detail.description.replace(/\s+/g,' ').trim();
 const match=text.match(/^(\d+(?:\/\d+)?)\s*/);const sku=match?.[1]||null;
 if(!sku&&!/диасци/i.test(text)){supporting.push(row);continue;}
 let body=match?text.slice(match[0].length).trim():text;
 let category;
 if(/остеосперм/i.test(body))category='osteospermum';
 else if(/георгин/i.test(body))category='dahlia';
 else if(/немези/i.test(body))category='nemesia';
 else if(/вербен/i.test(body)||verbenaSeries.test(body))category='verbena';
 else if(/калибр[ао]х|caliloco|calita|calitastic|calipetite|\blia\b|chameleon|хамелеон|cabaret|tiktok|aloha|eye[ac]|rainbow|lavtastic|mini famous|candy shop|fresh & fruity|omb[rp]e|m\.?\s*f\.?|celebration|smoothie|bloomtastic|volcano|good night|neo/i.test(body)&&row.album==='952972831943')category='calibrachoa';
 else if(/петун|петуни/i.test(body)||cultivarPetunia.test(body))category='petunia';
 else if(/альтернат|каллиз|коллиз|чабер|агростис|будра|вербейник|седум|плектрантус|крестовник|пилея|ипомея|традесканц|бегония грифон/i.test(body))category='coleus';
 else if(row.album==='952972831943')category='calibrachoa';
 else category='other';
 const prices=[...body.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:руб(?:лей|ля|ль)?\.?|р\.?)(?=\s|[),.;]|$)/gi)];
 const price=prices.length?Number(prices.at(-1)[1].replace(',','.')):null;
 let name=body.split(/(?<=[а-яa-z)])\.(?:\s|[А-ЯA-Z])/)[0];
 name=name.replace(/\s*\(?\s*укорен[её]нн[а-я\s]+черен[а-я\s]+.*/i,'').replace(/\s*\(\s*новинк[^)]*\)/i,'').replace(/\s*новинка\s+\d{4}\s*г.*/i,'').replace(/\s*(?:\d+\s*(?:руб(?:лей|ля|ль)?\.?|р\.?))\s*$/i,'').replace(/[,\s.]+$/,'').trim();
 if(category==='petunia'&&!/петун|петуни|петхоа/i.test(name))name='Петуния '+name;
 if(category==='calibrachoa'&&!/калибр/i.test(name))name='Калиброхиа '+name;
 if(category==='verbena'&&!/вербен/i.test(name))name='Вербена '+name;
 const size=(body.match(/(?:в\s*)?\d+\s*гр\s*стаканчи[а-я]*/i)?.[0]||(/укорен[её]н/i.test(body)?'Укоренённый черенок':'')).replace(/\s+/g,' ');
 const id='ok-'+row.id;
 const existing=products.find(p=>sku&&p.sku===sku&&p.category===category);
 const product={id,category,name,sku,price,size,image:'products/'+row.id,description:text,source:row.source,photoId:row.id,images:['products/'+row.id]};
 if(existing){existing.images.push(product.image);if(existing.price===null&&price!==null)existing.price=price;}else products.push(product);
}
await fs.writeFile('dist/catalog-data.js',`// Inventory imported from the owner's public OK albums. Source descriptions retained verbatim.\nwindow.FLOWER_CATEGORIES = ${JSON.stringify(categories,null,2)};\nwindow.FLOWER_PRODUCTS = ${JSON.stringify(products,null,2)};\n`);
const report={photos:raw.length,products:products.length,supportingPhotos:supporting.length,withPrice:products.filter(p=>p.price!==null).length,categories:Object.fromEntries(categories.map(c=>[c.id,products.filter(p=>p.category===c.id).length]))};
await fs.writeFile('source-data/import-report.json',JSON.stringify(report,null,2));console.log(report);
