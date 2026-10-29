"""docs/privacy-policy.md + site_template.html → index.html: build_site.py <md> <template> <out.html>"""
import sys, re, html
md = open(sys.argv[1], encoding='utf-8').read()
md = '\n'.join(l for l in md.split('\n') if not l.startswith('>'))


def inline(t):
    t = html.escape(t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'`(.+?)`', r'<code>\1</code>', t)
    t = re.sub(r'(https?://[^\s<,;)]+[^\s<,;).])', r'<a href="\1">\1</a>', t)
    t = re.sub(r'([\w.]+@[\w.]+\.\w+)', r'<a href="mailto:\1">\1</a>', t)
    return t


meta = []          # řádky pod nadpisem (Effective date, App, Contact)
parts = {}         # 'en' / 'cs' → html
cur_lang = None
para, items, cur = [], [], None


def out(s):
    if cur_lang:
        parts[cur_lang] = parts.get(cur_lang, '') + s


def flush_p():
    global para
    if para:
        if cur_lang is None:
            meta.extend(para)
        else:
            out('<p>' + inline(' '.join(para)) + '</p>')
        para = []


def flush_l():
    global items, cur
    if cur is not None:
        items.append(cur)
        cur = None
    if items:
        out('<ul>' + ''.join('<li>' + inline(i) + '</li>' for i in items) + '</ul>')
        items = []


for line in md.split('\n'):
    if line.startswith('# '):
        flush_p(); flush_l()
    elif line.startswith('## '):
        flush_p(); flush_l()
        cur_lang = 'en' if 'English' in line else 'cs'
    elif line.startswith('### '):
        flush_p(); flush_l()
        out('<h3>' + inline(line[4:]) + '</h3>')
    elif line.startswith('- '):
        flush_p()
        if cur is not None:
            items.append(cur)
        cur = line[2:]
    elif line.startswith('  ') and cur is not None:
        cur += ' ' + line.strip()
    elif line.strip() in ('', '---'):
        flush_p(); flush_l()
    else:
        flush_l(); para.append(line.strip())
flush_p(); flush_l()

eff = next(m for m in meta if m.startswith('Effective')).split(':', 1)[1].strip()
page = open(sys.argv[2], encoding='utf-8').read()
page = (page.replace('{{POLICY_EN}}', parts['en']).replace('{{POLICY_CS}}', parts['cs'])
        .replace('{{EFFECTIVE}}', html.escape(eff)))
assert '{{' not in page
open(sys.argv[3], 'w', encoding='utf-8', newline='\n').write(page)
print('ok', len(page))
