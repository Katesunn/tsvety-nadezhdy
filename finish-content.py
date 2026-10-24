from pathlib import Path
import re,json
root=Path(__file__).parent
p=root/'dist/app.js';s=p.read_text(encoding='utf-8')
s=s.replace("const categories=window.FLOWER_CATEGORIES,products=window.FLOWER_PRODUCTS;", "const categories=window.FLOWER_CATEGORIES,products=window.FLOWER_PRODUCTS;\n  const safe=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\n  const priceLabel=p=>p.price===null?'Цена по запросу':p.price.toLocaleString('ru-RU')+' ₽';\n  const stockNote='Наличие, размер растения и актуальную стоимость уточняйте при заказе.';")
s=s.replace('${p.name}', '${safe(p.name)}').replace('${p.sku}', "${p.sku?safe(p.sku):'не указан'}").replace('${p.size}', '${safe(p.size)}')
s=s.replace("${p.price.toLocaleString('ru-RU')} ₽", '${priceLabel(p)}').replace('${p.price} ₽', '${priceLabel(p)}')
s=s.replace('Демонстрационные карточки: фотографии иллюстрируют категории, цены и ассортимент приведены для примера. Наличие и стоимость уточняйте у Надежды.', 'Фотографии, названия и цены из моей коллекции в Одноклассниках. Если цена не указана, уточните её в переписке. Наличие и размер растения согласуем при заказе.')
s=s.replace("${categories.map(categoryCard).join('')}", "${categories.filter(c=>c.id!=='other').map(categoryCard).join('')}")
s=s.replace('Помочь с выбором ${icon(\'arrow-up-right\')}</button></div></div></section>', 'Помочь с выбором ${icon(\'arrow-up-right\')}</button></div></div><a class="other-flowers-link" href="./catalog.html?category=other">Бакопа, биденс, дипладения и другие цветы коллекции ${icon(\'arrow-up-right\')}</a></section>')
s=s.replace('4 растения</span>', "${products.filter(p=>p.category===id).length} ${plural(products.filter(p=>p.category===id).length)}</span>")
s=s.replace("list.sort((a,b)=>a.price-b.price)", "list.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity))")
s=s.replace("list.sort((a,b)=>b.price-a.price)", "list.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity))")
s=s.replace('${p.name} ${p.sku}', '${p.name} ${p.sku||\'\'}')
s=s.replace('<h2>Ничего не нашлось</h2><p>Попробуйте другое название или артикул.</p><button class="button secondary" id="reset-search">Сбросить поиск</button>', '${products.some(p=>p.category===id)?\'<h2>Ничего не нашлось</h2><p>Попробуйте другое название или артикул.</p><button class="button secondary" id="reset-search">Сбросить поиск</button>\':\'<h2>Здесь скоро появятся цветы</h2><p>Карточки этой категории ещё не добавлены.<br>Напишите Надежде, чтобы узнать о поступлении.</p><button class="button primary max-trigger">Узнать о поступлении ↗</button>\'}')
s=s.replace('Демонстрационная карточка. Фотография иллюстрирует категорию. Стоимость, сорт и наличие уточняйте при обращении.', '${stockNote}')
s=s.replace('<p>${safe(p.size)}</p><strong', '<p>${safe(p.size)}</p><p class="original-description">${safe(p.description)}</p><a class="source-link" href="${p.source}" target="_blank" rel="noopener noreferrer">Фото и описание в Одноклассниках ↗</a><strong')
s=s.replace('${p.price} руб., демонстрационная цена', "${p.price===null?'цена по запросу':p.price+' руб.'}")
# Copy text is plain text: avoid HTML entities in the message to the owner.
s=s.replace('Арт. ${p.sku?safe(p.sku):\'не указан\'}: ${safe(p.name)}', 'Арт. ${p.sku||\'не указан\'}: ${p.name}')
s=s.replace('Новое в коллекции', 'Коллекция нового сезона')
s=s.replace('<h1>Вегетативные<br>георгины</h1>', '<h1>Вегетативные<br>петунии</h1>')
s=s.replace('href="./catalog.html?category=dahlia">Подробнее', 'href="./catalog.html?category=petunia">Подробнее')
s=s.replace('src="./assets/dahlia.webp" alt="Пышное соцветие георгины в саду"', 'src="./assets/hero-petunia.webp" alt="Петунии из коллекции Надежды"')
p.write_text(s,encoding='utf-8')
for name in ['index.html','catalog.html','favorites.html']:
 p=root/'dist'/name;s=p.read_text(encoding='utf-8').replace('./assets/dahlia.webp','./assets/hero-petunia.webp').replace('href="https://max.ru"','href="https://web.max.ru/164013648"')
 p.write_text(s,encoding='utf-8')
