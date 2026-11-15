"""Verze u odkazů na CSS a JS (?v=<hash obsahu>) na všech stránkách webu.

GitHub Pages nechává soubory v mezipaměti prohlížeče 10 minut. Bez verze se po nahrání
může nová stránka potkat se starým skriptem. Spouštět před každým nahráním:
    python tools/bust_cache.py
"""
import hashlib
import re
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]

for page in WEB.rglob("*.html"):
    if ".git" in page.parts:
        continue
    s = page.read_text(encoding="utf8")

    def add_version(m):
        attr, url = m.group(1), m.group(2)
        clean = url.split("?")[0]
        f = (page.parent / clean).resolve()
        if not f.exists():
            return m.group(0)
        v = hashlib.sha1(f.read_bytes()).hexdigest()[:8]
        return f'{attr}="{clean}?v={v}"'

    new = re.sub(r'(src|href)="([^"]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"', add_version, s)
    if new != s:
        page.write_text(new, encoding="utf8")
        print("verze:", page.relative_to(WEB))
