import fs from 'node:fs/promises';
const names=['arrow-right','arrow-up-right','copy','flower','heart','map-pin','plant','magnifying-glass','truck','x','list','moon','sun'];
await Promise.all([...names.map(name=>({name,style:'regular',remote:name})),{name:'heart-fill',style:'fill',remote:'heart-fill'}].map(async({name,style,remote})=>{
 const response=await fetch(`https://raw.githubusercontent.com/phosphor-icons/core/main/assets/${style}/${remote}.svg`);
 if(!response.ok)throw new Error(`${name}: ${response.status}`);
 const svg=(await response.text()).replace(/currentColor|#000000/g,'#28533f');
 if(!svg.includes('<svg'))throw new Error(`Invalid SVG: ${name}`);
 await fs.writeFile(`dist/assets/ph-${name}.svg`,svg);
}));
const license=await fetch('https://raw.githubusercontent.com/phosphor-icons/core/main/LICENSE');
if(!license.ok)throw new Error('License download failed');
await fs.writeFile('dist/assets/licenses/Phosphor-MIT.txt',await license.text());
console.log('Downloaded 14 Phosphor icons and MIT license.');
