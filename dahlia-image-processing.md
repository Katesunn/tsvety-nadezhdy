# Георгины из альбома 953213489095

Источник: https://ok.ru/profile/211714658759/album/953213489095 . Владелец подтвердил, что альбом нужно добавить в раздел «Вегетативные георгины».

Перенесены 84 фотографии и точные исходные подписи. Два снимка с одинаковым артикулом 51 и подписью Darlin Scarlet объединены в одну карточку с галереей: всего 83 товара. Цены в альбоме отсутствуют и не назначались.

Итоговые файлы: `dist/assets/products/<photoId>.webp`. Все 84 идентификатора и описания сохранены в `sourcePhotos` товаров в `dist/catalog-data.js`. Копии исходников, подписи и отчёты обработки находятся в игнорируемой папке `source-data/albums/953213489095/`.

Надписи и водяные знаки обработаны встроенным imagegen. Для небольших элементов используются только отретушированные участки, остальная фотография сохраняется из оригинала. На двух снимках с диагональными водяными знаками применяется целиком отретушированная версия. Белые углы круглых вырезок заполнены продолжением фона с сохранением исходного центрального цветка. Скриншоты и подписи по краям кадрированы. Чистые снимки не подвергались генеративной ретуши. Финальная подготовка — `process-dahlia-images.mjs`, WebP quality 90, максимум 1200 px, без увеличения исходного разрешения.

Общий запрос imagegen:

> Precise local photographic retouching, using this exact photograph as the edit target. Remove only overlaid writing, labels, watermarks, screenshot controls or accidental edge padding. Preserve original framing, flower variety, petal colors and shapes, leaves, exposure and photographic texture. Do not beautify, sharpen, recompose, add or remove flowers, or introduce new labels. Return one individual photograph with no added text or watermark.

Для круглых вырезок дополнительно: replace only the white outside-the-circle padding with a natural continuation of the existing dark foliage/background; keep the central flower unchanged. Для NEW 24 — также remove the badge and its shadow. Для двух диагональных водяных знаков — reconstruct the covered petal detail while preserving the red/yellow cultivar markings. Подробные запросы по каждому обработанному снимку сохранены в `source-data/albums/953213489095/retouch-results.json`.

Команды повторного импорта: `python import-dahlia-album.py`, `node process-dahlia-images.mjs`, `node build-dahlia-catalog.mjs`, `node validate-site.mjs`. Перед публикацией обновить хеши ресурсов в HTML. Повторный запуск сохраняет идентификаторы товаров и не добавляет дубликаты.

Опубликовано на Vercel 3 ноября 2026: `dpl_DiacYosuw3RDfkkxzLWX37QRckzQ`, production, READY. Адрес раздела: https://tsvety-nadezhdy.vercel.app/catalog.html?category=dahlia . Подтверждены 83 карточки на опубликованной странице, точная подпись и две фотографии артикула 51. Локально также проверены мобильная сетка, поиск, избранное и отсутствие изменений всех 274 прежних товаров.
