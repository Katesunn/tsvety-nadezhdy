from pathlib import Path
p=Path(__file__).parent/'dist/app.js';s=p.read_text(encoding='utf-8')
s=s.replace('<strong>+7 950 438 80 77</strong>${icon(\'arrow-up-right\')}', '<strong>+7 950 438 80 77</strong>')
s=s.replace('<strong>Одноклассники</strong>${icon(\'arrow-up-right\')}', '<strong>Одноклассники</strong>')
p.write_text(s,encoding='utf-8')
p=Path(__file__).parent/'dist/design.css';s=p.read_text(encoding='utf-8').replace('.hero h1{font-size:39px}', '.hero h1{font-size:38px}');p.write_text(s,encoding='utf-8')
