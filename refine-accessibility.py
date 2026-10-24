from pathlib import Path
p=Path(__file__).parent/'dist/app.js';s=p.read_text(encoding='utf-8')
s=s.replace("const card=fav.closest('.product-card');if(card)card.remove();$('.section-meta').textContent=`${next.length} ${plural(next.length)}`;", "favorites();")
s=s.replace("dialog.className='product-dialog';dialog.innerHTML=", "dialog.className='product-dialog';dialog.setAttribute('aria-labelledby','product-title');dialog.innerHTML=")
s=s.replace('<h2>${safe(p.name)}</h2>', '<h2 id="product-title">${safe(p.name)}</h2>')
s=s.replace("$('#mobile-menu').addEventListener('click'", "document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#mobile-menu').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');}});\n  $('#mobile-menu').addEventListener('click'")
p.write_text(s,encoding='utf-8')
