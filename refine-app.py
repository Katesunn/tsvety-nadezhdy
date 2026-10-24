from pathlib import Path
p=Path(__file__).parent/'dist/app.js';s=p.read_text(encoding='utf-8')
s=s.replace('`${safe(p.name)} ${p.sku?safe(p.sku):\'не указан\'}`.toLocaleLowerCase', "`${p.name} ${p.sku||''}`.toLocaleLowerCase")
s=s.replace('<strong class="price">${priceLabel(p)}</strong>', '<strong class="price ${p.price===null?\'price-on-request\':\'\'}">${priceLabel(p)}</strong>')
s=s.replace('<img class="detail-photo" src="./assets/${p.image}.webp" alt="${safe(p.name)}" width="600" height="600"><div class="detail-copy">', '<div class="detail-gallery"><img class="detail-photo" src="./assets/${p.image}.webp" alt="${safe(p.name)}" width="600" height="600">${p.images.length>1?`<div class="detail-thumbs">${p.images.map((image,i)=>`<button data-detail-image="${image}" aria-label="Фото ${i+1}" aria-pressed="${i===0}"><img src="./assets/${image}.webp" alt="Фото ${i+1}"></button>`).join(\'\')}</div>`:\'\'}</div><div class="detail-copy">')
s=s.replace("const fav=e.target.closest('[data-favorite]');", "const thumb=e.target.closest('[data-detail-image]');if(thumb){const d=thumb.closest('dialog');$('.detail-photo',d).src='./assets/'+thumb.dataset.detailImage+'.webp';d.querySelectorAll('[data-detail-image]').forEach(b=>b.setAttribute('aria-pressed',String(b===thumb)));return;}\n    const fav=e.target.closest('[data-favorite]');")
p.write_text(s,encoding='utf-8')
