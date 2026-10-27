"""Build the reading pages from the released Word documents. Requires python-docx."""
from pathlib import Path
from html import escape
import re
from urllib.parse import urlencode
from docx import Document
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parent
REPO = 'https://github.com/IFCGIT2024/my-portfolio'
CANONICAL = 'https://ifcgit2024.github.io/my-portfolio/docs/projects/practice-exams-review/'
TITLE = 'Practice Exams and Assessment Validity in Computer Science'
VERSION = '1.0'
DATE = '27 October 2026'


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


def review_url(section='General review'):
    body = (f'Paper: {TITLE}\nVersion: {VERSION} ({DATE})\n'
            f'Section: {section}\n\nPassage or claim:\n\n'
            'Comment and supporting evidence:\n\nSuggested revision:\n\n'
            'Please include a source link where relevant. Comments here are public.')
    return REPO + '/issues/new?' + urlencode({'title': '[Paper review] ' + section, 'body': body})


def convert(filename, audit=False):
    doc = Document(ROOT / 'downloads' / filename)
    styles = {p._p: p.style.name for p in doc.paragraphs}
    output, toc, source, original = [], [], [], []
    section_open, list_open, table_caption = False, False, None
    started = audit
    reference_count = 0
    for block in doc.element.body:
        tag = block.tag.rsplit('}', 1)[-1]
        if tag == 'p':
            text = text_of(block)
            if not text.strip():
                continue
            style = styles.get(block, 'Normal')
            if style in ('Title', 'Subtitle') or text in ('Critical narrative review and position paper', DATE):
                continue
            if style == 'Heading 1':
                started = True
                if list_open:
                    output.append('</ul>'); list_open = False
                if section_open:
                    output.append('</section>')
                anchor = slug(text)
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
            if style == 'Caption':
                table_caption = value
            elif style == 'List Bullet':
                if not list_open:
                    output.append('<ul>'); list_open = True
                output.append(f'<li>{value}</li>')
            else:
                if list_open:
                    output.append('</ul>'); list_open = False
                attrs = ''
                if style == 'Reference':
                    reference_count += 1
                    attrs = f' class="reference" id="reference-{reference_count}"'
                elif style == 'Table Text':
                    attrs = ' class="table-note"'
                output.append(f'<p{attrs}>{value}</p>')
        elif tag == 'tbl':
            if list_open:
                output.append('</ul>'); list_open = False
            caption = table_caption or ('Source verification register' if audit else 'Evidence table')
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
    if not audit:
        assert reference_count == 21
    return '\n'.join(output), toc, '\n'.join(source), original


def page(content, toc, audit=False):
    page_title = 'Source Verification and Final Review' if audit else TITLE
    canonical = CANONICAL + ('audit.html' if audit else '')
    share_image = CANONICAL + ('assets/audit-preview-v1.png' if audit else 'assets/paper-preview-v1.png')
    description = ('Source verification and internal critical review of the paper’s 21 references, with the checked evidence and its limitations.'
                   if audit else 'When is withholding practice exams in computer science defensible? A critical narrative review of assessment validity, Bloom’s taxonomy and representative preparation.')
    toc_links = ''.join(f'<li><a href="#{anchor}">{escape(label)}</a></li>' for anchor, label in toc)
    hero = ('''<p class="eyebrow">COMPANION DOCUMENT · 27 OCTOBER 2026</p>
      <h1>Source Verification<br>and Final Review</h1>
      <p class="dek">An open record of the checks, corrections and limits behind the paper’s 21 references.</p>'''
      if audit else '''<p class="eyebrow">CRITICAL NARRATIVE REVIEW · 27 OCTOBER 2026</p>
      <h1>Practice Exams and Assessment Validity in Computer Science</h1>
      <p class="dek">Construct irrelevant variance and Bloom taxonomy in examination preparation</p>''')
    intro = '' if audit else '''<div class="question"><span class="label">THE QUESTION</span>
      <p>When is it pedagogically defensible to withhold practice exams in computer science?</p>
      <a href="#conclusion">Go to the conclusion <span aria-hidden="true">↗</span></a></div>'''
    lead_download = 'source-audit' if audit else 'paper'
    lead_label = 'audit' if audit else 'paper'
    review = escape(review_url(), quote=True)
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(page_title)} | Mizel Cluett</title>
<meta name="description" content="{escape(description, quote=True)}">
<meta property="og:type" content="article"><meta property="og:title" content="{escape(page_title, quote=True)}">
<meta property="og:description" content="{escape(description, quote=True)}">
<meta property="og:url" content="{canonical}"><meta name="theme-color" content="#173b3d">
<meta property="og:site_name" content="Mizel Cluett · Research &amp; Education">
<meta property="og:locale" content="en_CA">
<meta property="og:image" content="{share_image}">
<meta property="og:image:secure_url" content="{share_image}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="627">
<meta property="og:image:alt" content="{escape(page_title, quote=True)} — Mizel Cluett. 21 references, October 2026.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(page_title, quote=True)}">
<meta name="twitter:description" content="{escape(description, quote=True)}">
<meta name="twitter:image" content="{share_image}">
<meta name="twitter:image:alt" content="{escape(page_title, quote=True)} — Mizel Cluett.">
<link rel="canonical" href="{canonical}"><link rel="stylesheet" href="style.css"><script src="reader.js" defer></script></head>
<body><a class="skip-link" href="#paper">Skip to the paper</a><div id="reading-progress" aria-hidden="true"></div>
<header class="site-header"><div class="header-inner"><a class="wordmark" href="/my-portfolio/"><span class="monogram" aria-hidden="true">MC</span><span>Mizel Cluett<small>Research &amp; education</small></span></a>
<nav aria-label="Publication navigation"><a href="index.html" {'aria-current="page"' if not audit else ''}>Paper</a><a href="audit.html" {'aria-current="page"' if audit else ''}>Source audit</a><a href="#review">Review</a></nav></div></header>
<main><div class="hero">{hero}<div class="publication-meta"><span>Version {VERSION}</span><span>21 references</span><span class="status">Open for review</span></div>
<div class="hero-actions"><a class="button primary" href="downloads/{lead_download}.pdf" download>Download {lead_label} PDF <span aria-hidden="true">↓</span></a><a class="button" href="downloads/{lead_download}.docx" download>Word document</a><button class="text-button" type="button" data-copy>Copy page link <span aria-hidden="true">↗</span></button></div>{intro}</div>
<div class="reading-layout"><aside class="sidebar"><details class="contents" open><summary>On this page</summary><nav aria-label="Table of contents"><ol>{toc_links}</ol></nav></details><div class="reader-tools"><span class="label">READING TOOLS</span><button type="button" data-font="down" aria-label="Decrease article text size">A−</button><button type="button" data-font="up" aria-label="Increase article text size">A+</button><button type="button" data-print>Print</button></div><p class="sidebar-note">A critical narrative review and position paper. The companion audit records verification limits.</p></aside>
<article id="paper" aria-label="{escape(page_title, quote=True)}">{content}</article></div>
<section class="downloads-panel" id="downloads" aria-labelledby="downloads-title"><div><p class="eyebrow">KEEP A COPY</p><h2 id="downloads-title">Read, download, review.</h2><p>The web paper and downloads share the same released text. Version {VERSION} · {DATE}.</p></div><div class="download-links"><a href="downloads/paper.pdf" download><span>Full paper</span><span>PDF ↓</span></a><a href="downloads/paper.docx" download><span>Editable paper</span><span>Word ↓</span></a><a href="downloads/source-audit.pdf" download><span>Source audit</span><span>PDF ↓</span></a><a href="downloads/source-audit.docx" download><span>Editable audit</span><span>Word ↓</span></a><a href="assets/paper-share-square-v1.png" download><span>Square title card for sharing</span><span>PNG ↓</span></a></div></section>
<section class="review-panel" id="review" aria-labelledby="review-title"><p class="eyebrow">OPEN DISCUSSION</p><h2 id="review-title">Help improve the argument.</h2><p>Comments on the evidence, interpretation, counterarguments and references are welcome. Please identify the section and passage, explain the concern, and include supporting sources where possible.</p><div class="hero-actions"><a class="button primary" href="{review}">Leave a review comment <span aria-hidden="true">↗</span></a><a class="button" href="{REPO}/issues?q=is%3Aissue%20%22%5BPaper%20review%5D%22">Read review comments</a></div><p class="fine-print">Review comments are public and require a GitHub account to post. This paper has received an internal critical review and source audit; it has not undergone external journal peer review.</p></section>
</main><footer class="site-footer"><span>Shared by Mizel Cluett · {DATE}</span><div><a href="{REPO}/tree/main/docs/projects/practice-exams-review">Source &amp; version history</a><a href="#">Back to top ↑</a></div></footer><span class="toast" role="status" id="copy-status"></span></body></html>'''


if __name__ == '__main__':
    for filename, audit, output in [('paper.docx', False, 'index.html'), ('source-audit.docx', True, 'audit.html')]:
        content, toc, markdown, original = convert(filename, audit)
        html = page(content, toc, audit)
        (ROOT / output).write_text(html, encoding='utf-8')
        if not audit:
            (ROOT / 'paper.md').write_text(f'# {TITLE}\n\nCritical narrative review and position paper · Version {VERSION} · {DATE}\n\n' + markdown, encoding='utf-8')
        # Every paragraph/cell from the released body must survive conversion.
        from lxml import html as lhtml
        parsed = lhtml.fromstring(html)
        article = parsed.get_element_by_id('paper')
        normalized = re.sub(r'\s+', ' ', article.text_content())
        missing = [t[:100] for t in original if re.sub(r'\s+', ' ', t) not in normalized]
        assert not missing, missing
        print(f'{output}: {len(toc)} sections; {len(original)} paragraphs/cells verified; {len(html)} characters')
