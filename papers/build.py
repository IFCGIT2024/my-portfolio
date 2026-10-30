"""Build the Papers hub and paper pages from their Word documents.

Run from any directory: python papers/build.py
Requires python-docx, Pillow and lxml. The registry is papers/papers.json.
"""
from pathlib import Path
from html import escape
import json
import re
from docx import Document
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
BASE = 'https://ifcgit2024.github.io/my-portfolio/'
PAPERS = json.loads((ROOT / 'papers.json').read_text(encoding='utf-8'))


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def text_of(element):
    return ''.join(t.text or '' for t in element.iter(qn('w:t')))


def inline(element, doc):
    parts = []
    for child in element:
        tag = child.tag.rsplit('}', 1)[-1]
        if tag == 'hyperlink':
            rel = doc.part.rels.get(child.get(qn('r:id')))
            value = inline(child, doc)
            if rel and str(rel.target_ref).startswith(('https://', 'http://')):
                parts.append(f'<a href="{escape(str(rel.target_ref), quote=True)}">{value}</a>')
            else:
                parts.append(value)
        elif tag == 'r':
            value = ''
            for node in child:
                kind = node.tag.rsplit('}', 1)[-1]
                if kind == 't':
                    value += escape(node.text or '')
                elif kind == 'tab':
                    value += ' '
                elif kind == 'br':
                    value += '<br>'
            pr = child.find(qn('w:rPr'))
            if pr is not None:
                for xmltag, htmltag in [('i', 'em'), ('b', 'strong')]:
                    setting = pr.find(qn('w:' + xmltag))
                    if setting is not None and setting.get(qn('w:val')) not in ('0', 'false'):
                        value = f'<{htmltag}>{value}</{htmltag}>'
            parts.append(value)
    return ''.join(parts)


def convert(folder, expected_references):
    doc = Document(folder / 'downloads' / 'paper.docx')
    styles = {p._p: p.style.name for p in doc.paragraphs}
    output, toc, source, original = [], [], [], []
    section_open, list_open, table_caption = False, False, None
    started = False
    reference_count = 0
    in_references = False
    current_section = 'overview'
    table_count = 0
    for block in doc.element.body:
        tag = block.tag.rsplit('}', 1)[-1]
        if tag == 'p':
            text = text_of(block)
            if not text.strip():
                continue
            style = styles.get(block, 'Normal')
            if style in ('Title', 'Subtitle'):
                continue
            if style == 'Heading 1':
                started = True
                if list_open:
                    output.append('</ul>'); list_open = False
                if section_open:
                    output.append('</section>')
                anchor = slug(text)
                current_section = anchor
                in_references = text == 'References'
                toc.append((anchor, text))
                output.append(f'<section class="paper-section" id="{anchor}">'
                              f'<div class="section-heading"><h2>{escape(text)}</h2>'
                              f'<a class="permalink" href="#{anchor}" aria-label="Link to {escape(text, quote=True)}">#</a></div>')
                section_open = True
                original.append(text)
                source.append('## ' + text + '\n')
                continue
            if not started:
                continue
            original.append(text)
            source.append(text + '\n')
            value = inline(block, doc)
            if style == 'Heading 2':
                if list_open:
                    output.append('</ul>'); list_open = False
                output.append(f'<h3 id="{current_section}-{slug(text)}">{value}</h3>')
            elif style == 'Caption' or (re.match(r'^Table \d+ ', text) and block.getnext() is not None and block.getnext().tag == qn('w:tbl')):
                table_caption = value
            elif style == 'List Bullet':
                if not list_open:
                    output.append('<ul>'); list_open = True
                output.append(f'<li>{value}</li>')
            else:
                if list_open:
                    output.append('</ul>'); list_open = False
                attrs = ''
                if style == 'Reference' or in_references:
                    reference_count += 1
                    attrs = f' class="reference" id="reference-{reference_count}"'
                elif style == 'Table Text':
                    attrs = ' class="table-note"'
                output.append(f'<p{attrs}>{value}</p>')
        elif tag == 'tbl':
            if list_open:
                output.append('</ul>'); list_open = False
            table_count += 1
            caption = table_caption or 'Evidence table'
            rows = block.findall(qn('w:tr'))
            output.append(f'<div class="table-scroll" role="region" aria-label="{escape(re.sub("<[^>]+>", "", caption), quote=True)}" tabindex="0"><table><caption>{caption}</caption>')
            for row_idx, row in enumerate(rows):
                output.append('<thead><tr>' if row_idx == 0 else '<tr>')
                values = []
                for cell in row.findall(qn('w:tc')):
                    paras = cell.findall(qn('w:p'))
                    value = '<br>'.join(inline(p, doc) for p in paras)
                    plain = ' '.join(text_of(p) for p in paras)
                    if plain.strip(): original.append(plain)
                    values.append(plain.replace('|', '\\|'))
                    output.append(f'<th scope="col">{value}</th>' if row_idx == 0 else f'<td>{value}</td>')
                output.append('</tr></thead><tbody>' if row_idx == 0 else '</tr>')
                source.append('| ' + ' | '.join(values) + ' |')
                if row_idx == 0:
                    source.append('| ' + ' | '.join('---' for _ in values) + ' |')
            output.append('</tbody></table></div>')
            source.append('\n')
            table_caption = None
    if list_open: output.append('</ul>')
    if section_open: output.append('</section>')
    assert reference_count == expected_references, (folder, reference_count)
    return '\n'.join(output), toc, '\n'.join(source), original


def head(title, description, canonical, image, paper=None):
    scholarly = ''
    if paper:
        scholarly = f'''<meta name="citation_title" content="{escape(title, quote=True)}">
<meta name="citation_author" content="Mizel Cluett">
<meta name="citation_publication_date" content="{paper['date'].replace('-', '/')}">
<meta name="citation_pdf_url" content="{canonical}downloads/paper.pdf">'''
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)} | Mizel Cluett</title>
<meta name="description" content="{escape(description, quote=True)}">
<meta name="author" content="Mizel Cluett">
<meta name="theme-color" content="#173b3d">
<meta property="og:type" content="{'article' if paper else 'website'}">
<meta property="og:title" content="{escape(title, quote=True)}">
<meta property="og:description" content="{escape(description, quote=True)}">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="Mizel Cluett · Papers">
<meta property="og:locale" content="en_CA">
<meta property="og:image" content="{image}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="627">
<meta property="og:image:alt" content="{escape(title, quote=True)} — Mizel Cluett">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(title, quote=True)}">
<meta name="twitter:description" content="{escape(description, quote=True)}">
<meta name="twitter:image" content="{image}">
<link rel="canonical" href="{canonical}">
{scholarly}
<link rel="stylesheet" href="/my-portfolio/papers/site.css">
{'<script src="/my-portfolio/papers/reader.js" defer></script>' if paper else ''}
</head>'''


def header(paper=False):
    navigation = ('''<a href="/my-portfolio/papers/">Home</a>
<a href="#references">References</a><a href="downloads/paper.pdf">PDF <span aria-hidden="true">↓</span></a>'''
                  if paper else '''<a href="/my-portfolio/">Portfolio</a>
<a href="/my-portfolio/papers/" aria-current="page">Papers</a>''')
    return f'''<header class="site-header"><div class="header-inner">
<a class="wordmark" href="/my-portfolio/papers/"><span class="monogram" aria-hidden="true">MC</span>
<span>Mizel Cluett<small>Papers</small></span></a>
<nav aria-label="Main navigation">{navigation}</nav></div></header>'''


def footer():
    return '''<footer class="site-footer"><span>Papers by Mizel Cluett</span>
<nav aria-label="Footer navigation"><a href="/my-portfolio/">Portfolio</a><a href="#top">Back to top ↑</a></nav></footer>'''


def paper_page(paper, content, toc):
    canonical = BASE + paper['path'] + '/'
    links = ''.join(f'<li><a href="#{anchor}">{escape(label)}</a></li>' for anchor, label in toc)
    return head(paper['title'], paper['summary'], canonical, canonical + 'assets/paper-preview.png', paper) + f'''
<body id="top"><a class="skip-link" href="#paper">Skip to the paper</a>
<div id="reading-progress" aria-hidden="true"></div>{header(True)}
<main><header class="hero">
<p class="eyebrow">{escape(paper['topics'])}</p>
<h1>{escape(paper['title'])}</h1><p class="dek">{escape(paper['subtitle'])}</p>
<div class="publication-meta"><span>Mizel Cluett</span><time datetime="{paper['date']}">{paper['display_date']}</time><span>{paper['kind']}</span></div>
<div class="hero-actions"><a class="button primary" href="downloads/paper.pdf" download>Download PDF <span aria-hidden="true">↓</span></a>
<a class="button" href="downloads/paper.docx" download>Word document <span aria-hidden="true">↓</span></a>
<button class="text-button" type="button" data-copy>Copy link</button></div></header>
<div class="reading-layout"><aside class="sidebar"><details class="contents" open><summary>On this page</summary>
<nav aria-label="Table of contents"><ol>{links}</ol></nav></details>
<div class="reader-tools"><span class="label">Reading tools</span>
<button type="button" data-font="down" aria-label="Decrease article text size">A−</button>
<button type="button" data-font="up" aria-label="Increase article text size">A+</button>
<button type="button" data-print>Print</button></div></aside>
<article id="paper" aria-label="{escape(paper['title'], quote=True)}">{content}</article></div>
</main>{footer()}<span class="toast" role="status" id="copy-status"></span></body></html>'''


def hub_page():
    entries = []
    for index, paper in enumerate(PAPERS, 1):
        url = '/my-portfolio/' + paper['path'] + '/'
        entries.append(f'''<li class="paper-entry"><span class="entry-number" aria-hidden="true">{index:02}</span>
<div class="entry-content"><p class="eyebrow">{escape(paper['topics'])}</p>
<h2><a href="{url}">{escape(paper['title'])}</a></h2><p class="entry-summary">{escape(paper['summary'])}</p>
<div class="publication-meta"><time datetime="{paper['date']}">{paper['display_date']}</time><span>{paper['kind']}</span></div>
<div class="entry-links"><a href="{url}">Read paper <span aria-hidden="true">↗</span></a><a href="{url}downloads/paper.pdf">PDF <span aria-hidden="true">↓</span></a></div></div></li>''')
    return head('Papers', 'Research papers and overviews by Mizel Cluett.', BASE + 'papers/', BASE + 'papers/preview.png') + f'''
<body class="hub" id="top"><a class="skip-link" href="#papers">Skip to the papers</a>{header()}
<main><header class="hero hub-hero"><p class="eyebrow">Research &amp; writing</p><h1>Papers</h1>
<p class="dek">Research papers and overviews by Mizel Cluett.</p></header>
<section id="papers" aria-label="Papers"><ol class="paper-list">{''.join(entries)}</ol></section></main>{footer()}</body></html>'''


def share_image(paper=None):
    from PIL import Image, ImageDraw, ImageFont
    image = Image.new('RGB', (1200, 627), '#fbfaf6')
    draw = ImageDraw.Draw(image)
    def font(size, serif=False):
        name = 'DejaVuSerif.ttf' if serif else 'DejaVuSans.ttf'
        return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/' + name, size)
    def label(x, y, text, size, color='#173b3d', serif=False):
        draw.text((x, y), text, font=font(size, serif), fill=color)
    draw.rectangle((0, 0, 13, 627), fill='#173b3d')
    label(64, 45, 'MIZEL CLUETT', 23)
    label(64, 85, 'PAPERS', 15, '#566567')
    draw.line((64, 135, 1136, 135), fill='#d6ddd8', width=2)
    title = paper['title'] if paper else 'Papers'
    size = 58 if paper else 100
    face = font(size, True)
    lines, line = [], ''
    for word in title.split():
        trial = (line + ' ' + word).strip()
        if draw.textlength(trial, font=face) > 1060 and line:
            lines.append(line); line = word
        else:
            line = trial
    if line: lines.append(line)
    assert len(lines) <= 4
    for i, line in enumerate(lines): label(64, 185 + i * (size + 21), line, size, serif=True)
    if not paper: label(68, 367, 'Research on governance, technology and education.', 27, '#566567')
    draw.line((64, 536, 1136, 536), fill='#d6ddd8', width=2)
    label(64, 563, paper['kind'] if paper else 'Research papers and overviews', 20)
    if paper: label(910, 563, paper['display_date'], 18, '#566567')
    target = REPO / paper['path'] / 'assets/paper-preview.png' if paper else ROOT / 'preview.png'
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, optimize=True)


def build():
    from lxml import html as lhtml
    for paper in PAPERS:
        folder = REPO / paper['path']
        content, toc, markdown, original = convert(folder, paper['references'])
        page = paper_page(paper, content, toc)
        article = lhtml.fromstring(page).get_element_by_id('paper')
        normalized = re.sub(r'\s+', ' ', article.text_content())
        missing = [t[:100] for t in original if re.sub(r'\s+', ' ', t) not in normalized]
        assert not missing, missing
        (folder / 'index.html').write_text(page, encoding='utf-8')
        (folder / 'paper.md').write_text(f"# {paper['title']}\n\n{paper['subtitle']}\n\nMizel Cluett · {paper['display_date']}\n\n" + markdown, encoding='utf-8')
        share_image(paper)
        print(f"{paper['slug']}: {len(toc)} sections; {len(original)} paragraphs/cells verified")
    (ROOT / 'index.html').write_text(hub_page(), encoding='utf-8')
    share_image()
    print(f'Papers hub: {len(PAPERS)} entries')


if __name__ == '__main__':
    build()


