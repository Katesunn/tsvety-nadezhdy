from pathlib import Path
root=Path('dist')
names={'arrow-right':'arrow-right','arrow-up-right':'arrow-up-right','copy':'copy','flower':'flower','heart':'heart','map-pin':'map-pin','plant-2':'plant','search':'magnifying-glass','truck':'truck','x':'x','menu-2':'list','moon':'moon','sun':'sun'}
for file in [root/'app.js',root/'index.html',root/'catalog.html',root/'favorites.html']:
 text=file.read_text(encoding='utf-8')
 for old,new in names.items():
  text=text.replace(f"icon('{old}')",f"icon('ph-{new}')").replace(f'./assets/{old}.svg',f'./assets/ph-{new}.svg')
 if file.suffix=='.js':
  text='\n'.join(line for line in text.split('\n') if not line.startswith('  const note='))
  text=text.replace('${note}','')
  text=text.replace("${icon('ph-heart')}</button>","${icon(saved.has(p.id)?'ph-heart-fill':'ph-heart')}</button>")
  text=text.replace("${icon('ph-heart')}<span>","${icon(saved.has(p.id)?'ph-heart-fill':'ph-heart')}<span>")
  text=text.replace("function updateCount(){", "function updateCount(){$('.favorites-link>img').src=`./assets/ph-heart${saved.size?'-fill':''}.svg`;")
  text=text.replace("if($('span',b))$('span',b).textContent", "$('img.icon',b).src=`./assets/ph-heart${saved.has(id)?'-fill':''}.svg`;if($('span',b))$('span',b).textContent")
  text=text.replace("${safe(p.name)}`);if", "${p.name}`);if")
  text=text.replace("b.setAttribute('aria-pressed',saved.has(b.dataset.favorite));", "b.setAttribute('aria-pressed',saved.has(b.dataset.favorite));$('img.icon',b).src=`./assets/ph-heart${saved.has(b.dataset.favorite)?'-fill':''}.svg`;const label=$('span',b);if(label)label.textContent=saved.has(b.dataset.favorite)?'В избранном':'В избранное';")
  text=text.replace("./assets/${value==='dark'?'sun':'moon'}.svg", "./assets/ph-${value==='dark'?'sun':'moon'}.svg")
 file.write_text(text,encoding='utf-8')
css=root/'design.css'
text=css.read_text(encoding='utf-8')
for old,new in {'#f4e8ef':'#fff0f5','#ead4e1':'#f9d8e6','#e6dce2':'#eedce4','#eee7eb':'#f6eaf0','#fff6fc':'#fff5f9','#f8dce9':'#ffd4e5','#ffecf4':'#f9bcd5','#fff9fc':'#fff6fa'}.items():
 text=text.replace(old,new)
start=text.index('.favorite-button.is-saved:after{')
end=text.index('}',start)+1
text=text[:start]+text[end:]
text=text.replace('.product-grid{gap:40px 24px}', '.product-grid{gap:40px 24px;margin-top:28px}')
text+='''
/* Fresh petal accents, visible contact actions, and complete interaction states. */
:root{--petal:#ffd4e5;--petal-pressed:#f5aecb;--petal-text:#743048;--contact-fill:#cde6c2;--contact-text:#244f37;--control-hover:#28533f;--control-active:#183e2b}
:root[data-theme=dark]{--petal:#eab1cc;--petal-pressed:#d68cac;--petal-text:#532139;--contact-fill:#cde6c2;--contact-text:#244f37}
.button,.icon-button,.category-tabs a,.category-view,.favorite-button{transition:background-color .2s,color .2s,border-color .2s,transform .2s}
.button.primary:is(:hover,:focus-visible),.hero .button:is(:hover,:focus-visible){background:var(--petal);color:var(--petal-text);border-color:var(--petal)}
.button.primary:active,.hero .button:active{background:var(--petal-pressed);color:#532139;border-color:var(--petal-pressed)}
.hero .button{background:var(--petal);color:#214b36}
.hero .button:is(:hover,:focus-visible){background:var(--control-hover);color:#fff}
.hero .button:active{background:var(--petal-pressed);color:#532139}
.button.secondary:is(:hover,:focus-visible){background:var(--control-hover);color:#fff;border-color:var(--control-hover)}
.button.secondary:active{background:var(--petal-pressed);color:#532139;border-color:var(--petal-pressed)}
.button.primary:is(:hover,:focus-visible,:active)>.icon,.button.secondary:active>.icon{filter:none}
.button.secondary:is(:hover,:focus-visible)>.icon,.hero .button:is(:hover,:focus-visible)>.icon{filter:brightness(0) invert(1)}
.hero .button:active>.icon{filter:none}
.social-buttons>.button.primary,.social-buttons>.button.secondary{background:var(--contact-fill);color:var(--contact-text);border-color:var(--contact-fill)}
.social-buttons>.button:is(:hover,:focus-visible){background:var(--control-hover);color:#fff;border-color:var(--control-hover)}
.social-buttons>.button:active{background:var(--petal-pressed);color:#532139;border-color:var(--petal-pressed)}
.social-buttons>.button>img{filter:none!important}
.social-buttons>.button:is(:hover,:focus-visible)>img{filter:brightness(0) invert(1)!important}
.social-buttons>.button:active>img{filter:none!important}
.icon-button:is(:hover,:focus-visible){background:var(--control-hover);color:#fff}
.icon-button:active{background:var(--petal-pressed);color:#532139}
.icon-button:is(:hover,:focus-visible)>img{filter:brightness(0) invert(1)!important}
.icon-button:active>img{filter:none!important}
.favorite-count{display:grid;place-items:center;width:22px;min-width:22px;height:22px;padding:0;border-radius:50%;line-height:1;font-size:10px;font-variant-numeric:tabular-nums;letter-spacing:0;text-align:center}
.favorite-button,.favorite-button.is-saved{background:#fff6fa}
.favorite-button.is-saved>.icon{filter:none}
.favorite-button:is(:hover,:focus-visible){background:var(--contact-fill)}
.favorite-button:active{background:var(--petal-pressed)}
.category-tabs a:active{background:var(--petal-pressed);color:#532139;border-color:var(--petal-pressed)}
.category-card:is(:hover,:focus-visible) .category-view{background:var(--petal);color:var(--petal-text)}
.category-card:active .category-view{background:var(--control-hover);color:#fff}
.product-name{border-radius:4px;transition:background-color .2s,color .2s}
.product-name:is(:hover,:focus-visible){background:var(--surface);color:var(--petal-text)}
.product-name:active{background:var(--control-hover);color:#fff}
.detail-thumbs button:is(:hover,:focus-visible){border-color:var(--petal-text);background:var(--petal)}
.detail-thumbs button:active{border-color:var(--control-hover);background:var(--control-hover)}
'''
css.write_text(text,encoding='utf-8')
credits=root/'credits.html'
text=credits.read_text(encoding='utf-8').replace('<a href="https://github.com/tabler/tabler-icons">Tabler Icons</a>, MIT License','<a href="https://github.com/phosphor-icons/core">Phosphor Icons</a>, <a href="./assets/licenses/Phosphor-MIT.txt">MIT License</a>')
credits.write_text(text,encoding='utf-8')
