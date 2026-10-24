from pathlib import Path
import re
root=Path(__file__).parent/'dist'
footer='''<div class="footer-contact footer-socials"><a class="icon-button" href="https://web.max.ru/164013648" target="_blank" rel="noopener noreferrer" aria-label="Открыть MAX"><img class="max-logo" src="./assets/max-logo.svg" alt="" width="24" height="24"></a><a class="icon-button" href="https://ok.ru/profile/211714658759" target="_blank" rel="noopener noreferrer" aria-label="Открыть Одноклассники"><img class="ok-logo" src="./assets/odnoklassniki.svg" alt="" width="19" height="24"></a></div>'''
for name in ['index.html','catalog.html','favorites.html']:
 p=root/name;s=p.read_text(encoding='utf-8')
 s=re.sub(r'<div class="footer-contact">.*?</div>',footer,s)
 p.write_text(s,encoding='utf-8')
p=root/'app.js';s=p.read_text(encoding='utf-8')
s=s.replace('<div class="signature">До встречи среди цветов,<br><b>Надежда</b></div>','')
s=s.replace('<p>Доставка и самовывоз</p></div>${icon(\'truck\')}</div>', '<p>Доставка и самовывоз</p></div></div>')
p.write_text(s,encoding='utf-8')
# Preserve the supplied logo shapes, applying the same brand color to both.
p=root/'assets/max-logo.svg';s=p.read_text(encoding='utf-8').replace('fill="#0a0b0b"','fill="#28533f"');p.write_text(s,encoding='utf-8')
p=root/'assets/odnoklassniki.svg';s=p.read_text(encoding='utf-8').replace('fill:#EB722E','fill:#28533f');p.write_text(s,encoding='utf-8')
p=root/'design.css';s=p.read_text(encoding='utf-8')
s=s.replace('The about photograph alone uses an arch as a botanical portrait frame.', 'The about photograph uses the same rounded square as the product photos.')
s=s.replace('--bg:#ffffff;', '--delivery-panel:#eaf3e7;--delivery-border:#d6e4d0;--delivery-icon:#d9e9d2;--bg:#ffffff;',1)
s=s.replace(':root[data-theme=dark]{', ':root[data-theme=dark]{--delivery-panel:#293e2d;--delivery-border:#405c42;--delivery-icon:#354e39;')
s=s.replace('height:570px;border-radius:240px 240px 24px 24px;', 'height:auto;aspect-ratio:1;border-radius:20px;')
s=s.replace('.about-photo{height:560px}', '').replace('.about-photo{height:570px}', '')
s=s.replace('width:85%;justify-self:center;height:380px;border-radius:190px 190px 20px 20px', 'width:100%;justify-self:stretch;height:auto;aspect-ratio:1;border-radius:16px')
s=s.replace('.delivery-option{background:var(--surface);', '.delivery-option{background:var(--delivery-panel);')
s=s.replace('.delivery-option{background:var(--delivery-panel);padding:34px 32px 36px;border:1px solid var(--border);', '.delivery-option{background:var(--delivery-panel);padding:34px 32px 36px;border:1px solid var(--delivery-border);')
s=s.replace('background:var(--surface);border-radius:12px}.delivery-icon', 'background:var(--delivery-icon);border-radius:12px}.delivery-icon')
s=re.sub(r'\.signature\{[^}]*\}', '', s)
s=re.sub(r'\.signature b\{[^}]*\}', '', s)
s+='''
/* Social marks share one color in every location, with a white variant in dark mode. */
img[src$='/max-logo.svg'],img[src$='/odnoklassniki.svg']{filter:none!important}
:root[data-theme=dark] img[src$='/max-logo.svg'],:root[data-theme=dark] img[src$='/odnoklassniki.svg']{filter:brightness(0) invert(1)!important}
.social-buttons>.button.primary{background:var(--paper);color:var(--text);border-color:var(--border)}
.social-buttons>.button.primary:hover{background:var(--surface)}
.footer-contact.footer-socials{flex-direction:row;justify-content:flex-end;align-items:center;gap:10px}
.footer-contact.footer-socials a{display:inline-flex;align-items:center;justify-content:center;padding:0;min-width:44px;min-height:44px}
.footer-contact.footer-socials .max-logo{width:24px;height:24px}
.footer-contact.footer-socials img[src$='/odnoklassniki.svg']{width:19px;height:26px}
'''
p.write_text(s,encoding='utf-8')
