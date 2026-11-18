import fs from 'node:fs/promises';
import vm from 'node:vm';

const context={window:{}};
vm.runInNewContext(await fs.readFile('dist/catalog-data.js','utf8'),context);
const categories=JSON.parse(JSON.stringify(context.window.FLOWER_CATEGORIES));
const products=JSON.parse(JSON.stringify(context.window.FLOWER_PRODUCTS));

function articleParts(value){
  const match=String(value||'').trim().match(/^(\d+)(?:\/(\d+))?/);
  return match?[Number(match[1]),Number(match[2]||0)]:[Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY];
}
function byArticle(a,b){
  const [aMain,aSub]=articleParts(a.product.sku);
  const [bMain,bSub]=articleParts(b.product.sku);
  return aMain-bMain||aSub-bSub||a.index-b.index;
}

const sorted=[];
for(const category of categories){
  sorted.push(...products.filter(product=>product.category===category.id).map((product,index)=>({product,index})).sort(byArticle).map(item=>item.product));
}
// Keep any legacy item with a removed category rather than silently losing it.
sorted.push(...products.filter(product=>!categories.some(category=>category.id===product.category)));
await fs.writeFile('dist/catalog-data.js',`window.FLOWER_CATEGORIES = ${JSON.stringify(categories,null,2)};\nwindow.FLOWER_PRODUCTS = ${JSON.stringify(sorted,null,2)};\n`);
console.log(JSON.stringify({products:sorted.length,categories:categories.length,firstArticles:Object.fromEntries(categories.map(category=>[category.id,sorted.filter(product=>product.category===category.id).slice(0,3).map(product=>product.sku)]))},null,2));
