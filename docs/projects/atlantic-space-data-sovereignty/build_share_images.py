"""Generate exact-text sharing cards in the portfolio's publication style.

Requires Pillow and DejaVu fonts. No imagery or unverified research claims.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'assets'
OUT.mkdir(exist_ok=True)
INK = '#173b3d'
MUTED = '#516866'
PAPER = '#fbfaf6'
LINE = '#cdd8d1'
RUST = '#ad6038'
TITLE = 'Indigenous data sovereignty and the East Coast space sector'
SUBTITLE = 'A grounded overview of the questions that need to be answered'


def font(size, serif=False, bold=False):
    name = ('DejaVuSerif' if serif else 'DejaVuSans') + ('-Bold' if bold else '') + '.ttf'
    return ImageFont.truetype(f'/usr/share/fonts/truetype/dejavu/{name}', size)


def text(draw, xy, value, size, serif=False, bold=False, color=INK):
    face = font(size, serif, bold)
    box = draw.textbbox(xy, value, font=face)
    margin = 64 if draw._image.width == 1200 else 72
    assert box[0] >= margin - 2 and box[1] >= 0, (value, box)
    assert box[2] <= draw._image.width - margin and box[3] < draw._image.height, (value, box)
    draw.text(xy, value, font=face, fill=color)


def wide(audit=False):
    im = Image.new('RGB', (1200, 627), PAPER)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 14, 627), fill=INK)
    text(d, (64, 45), 'MIZEL CLUETT', 21, bold=True)
    text(d, (64, 79), 'RESEARCH & EDUCATION', 14, color=MUTED)
    d.line((64, 127, 1136, 127), fill=LINE, width=2)
    if audit:
        text(d, (64, 169), 'Source Verification', 62, serif=True)
        text(d, (64, 260), 'and Review Record', 62, serif=True)
        lines = ['Indigenous data sovereignty and the', 'East Coast space sector']
        assert ' '.join(lines) == TITLE
        for index, value in enumerate(lines):
            text(d, (68, 391 + index * 39), value, 27, color=MUTED)
        footer = 'Internal review · 47 review units · 13 references'
    else:
        lines = ['Indigenous data sovereignty', 'and the East Coast', 'space sector']
        assert ' '.join(lines) == TITLE
        for index, value in enumerate(lines):
            text(d, (64, 155 + index * 92), value, 64, serif=True)
        text(d, (68, 467), SUBTITLE, 23, color=MUTED)
        footer = 'Working paper · Edition 2.0 · 13 references · Internal review'
    d.line((64, 531, 1136, 531), fill=LINE, width=2)
    d.rectangle((64, 531, 194, 534), fill=RUST)
    text(d, (64, 559), footer, 18)
    text(d, (974, 559), '29 OCT 2026', 18, color=MUTED)
    im.save(OUT / ('audit-preview-v2.png' if audit else 'paper-preview-v2.png'), optimize=True)


def square():
    im = Image.new('RGB', (1080, 1080), PAPER)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 16, 1080), fill=INK)
    text(d, (72, 62), 'MIZEL CLUETT', 24, bold=True)
    text(d, (72, 105), 'RESEARCH & EDUCATION', 17, color=MUTED)
    d.line((72, 168, 1008, 168), fill=LINE, width=2)
    lines = ['Indigenous data', 'sovereignty and', 'the East Coast', 'space sector']
    assert ' '.join(lines) == TITLE
    for index, value in enumerate(lines):
        text(d, (72, 232 + index * 106), value, 76, serif=True)
    d.rectangle((75, 739, 210, 744), fill=RUST)
    subtitle_lines = ['A grounded overview of the questions', 'that need to be answered']
    assert ' '.join(subtitle_lines) == SUBTITLE
    for index, value in enumerate(subtitle_lines):
        text(d, (72, 782 + index * 48), value, 27, color=MUTED)
    d.line((72, 934, 1008, 934), fill=LINE, width=2)
    text(d, (72, 961), 'Working paper · Edition 2.0 · 13 references', 22)
    text(d, (72, 1000), 'Internal review · 47 review units · 29 October 2026', 20, color=MUTED)
    im.save(OUT / 'paper-share-square-v2.png', optimize=True)


if __name__ == '__main__':
    wide()
    wide(audit=True)
    square()
    for path in sorted(OUT.glob('*v2.png')):
        with Image.open(path) as im:
            print(f'{path.name}: {im.width} × {im.height}, {path.stat().st_size:,} bytes')
