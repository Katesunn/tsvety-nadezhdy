from pathlib import Path
import re
root=Path(__file__).parent/'dist'
p=root/'app.js';s=p.read_text(encoding='utf-8')
s=s.replace('./assets/max-icon.png','./assets/max-logo.svg').replace("icon('brand-ok-ru')","icon('odnoklassniki')")
s=s.replace('Написать в MAX ${icon(\'arrow-up-right\')}', 'Написать в MAX').replace('Одноклассники ${icon(\'arrow-up-right\')}', 'Одноклассники').replace('Уточнить в MAX ${icon(\'arrow-up-right\')}', 'Уточнить в MAX')
s=s.replace('Узнать о поступлении ↗','Узнать о поступлении')
old='const categoryCard=c=>'
start=s.index(old);end=s.index('\n',start)
s=s[:start]+'''const categoryCard=c=>`<a class="category-card" href="./catalog.html?category=${c.id}"><div class="category-photo"><img src="./assets/${c.id}.webp" alt="${c.short}" width="600" height="650" loading="lazy"><span class="category-overlay"><span class="category-view">Смотреть</span></span></div><div class="category-caption"><h3>${c.id==='other'?'Другие цветы':c.name}</h3></div></a>`;'''+s[end:]
s=s.replace('>Подробнее ${icon(\'arrow-up-right\')}</a></div><div class="hero-image">','>Смотреть в каталоге ${icon(\'arrow-up-right\')}</a></div><div class="hero-image">')
s=s.replace('<span class="image-caption">Ваш сад начинается с любви</span>','').replace('<div class="about-photo-note">С любовью к каждому растению</div>','')
start=s.index('<div class="category-grid">');end=s.index('</section>',start)
s=s[:start]+'''<div class="category-grid">${categories.map(categoryCard).join('')}</div>'''+s[end:]
s=s.replace('7 категорий','8 категорий')
s=s.replace("$('#year').textContent=new Date().getFullYear();updateCount();",'updateCount();')
p.write_text(s,encoding='utf-8')
for name in ['index.html','catalog.html','favorites.html']:
 p=root/name;s=p.read_text(encoding='utf-8')
 s=s.replace('./assets/max-icon.png','./assets/max-logo.svg').replace('./assets/brand-ok-ru.svg','./assets/odnoklassniki.svg')
 s=s.replace('href="./assets/manrope-cyrillic.woff2" as="font" type="font/woff2"','href="./assets/onest.ttf" as="font" type="font/ttf"')
 s=s.replace('content="#f8f7f5"','content="#fff8fb"')
 s=re.sub(r'<div class="footer-bottom">.*?</div></footer>', '<div class="footer-bottom"><span>Выращено с заботой. Выбрано с любовью.</span></div></footer>', s)
 s=s.replace('Одноклассники ↗','Одноклассники').replace('Открыть MAX <span>↗</span>','Открыть MAX')
 s=s.replace('src="./assets/odnoklassniki.svg"','class="ok-logo" src="./assets/odnoklassniki.svg"') if name else s
 # The footer already has class="icon"; append the logo class without duplicate attributes.
 s=s.replace('class="icon" class="ok-logo"','class="icon ok-logo"')
 p.write_text(s,encoding='utf-8')
p=root/'catalog-data.js';s=p.read_text(encoding='utf-8').replace('"name": "Другие цветы коллекции"','"name": "Другие цветы"');p.write_text(s,encoding='utf-8')
p=root/'credits.html';s=p.read_text(encoding='utf-8').replace('Шрифт Manrope, SIL Open Font License.','Шрифт Onest, SIL Open Font License.').replace('Значок MAX с официального сайта <a href="https://max.ru">MAX</a>.','Логотипы MAX и Одноклассников предоставлены владельцем сайта.');p.write_text(s,encoding='utf-8')
