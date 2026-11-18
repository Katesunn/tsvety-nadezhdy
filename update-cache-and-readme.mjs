import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const catalog=await fs.readFile('dist/catalog-data.js');
const token=crypto.createHash('sha256').update(catalog).digest('hex').slice(0,12);
for(const file of ['dist/index.html','dist/catalog.html','dist/favorites.html','dist/credits.html']){
 let html=await fs.readFile(file,'utf8');
 html=html.replace(/(catalog-data\.js\?v=)[a-f0-9]+/i,`$1${token}`);
 await fs.writeFile(file,html);
}
const readme='README.md';let text=await fs.readFile(readme,'utf8');
text=text.replace('Всего в каталоге 357 товаров. Описание импорта и ретуши — `dahlia-image-processing.md`.','Всего в каталоге 354 товара. Описание импорта и ретуши — `dahlia-image-processing.md`.');
text=text.replace('Общее количество товаров остаётся 357.','Общее количество товаров остаётся 354.');
text += '\n\n15 ноября 2026 заменены 23 прежние карточки вербены на 20 позиций из альбома https://ok.ru/profile/211714658759/album/978540254407. Подписи перенесены дословно, цены оставлены «по запросу», остальные разделы сохранены. Исходные файлы и описание источника хранятся в `source-data/albums/978540254407/`; обработанные webp — в `dist/assets/products/`. Отчёт по изображениям — `verbena-image-processing.md`.\n';
await fs.writeFile(readme,text);
