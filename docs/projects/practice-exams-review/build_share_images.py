"""Generate the publication's exact-text sharing cards. Requires Pillow."""
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


def font(size, serif=False, bold=False):
    name = ('DejaVuSerif' if serif else 'DejaVuSans') + ('-Bold' if bold else '') + '.ttf'
    family = 'dejavu'
    return ImageFont.truetype(f'/usr/share/fonts/truetype/{family}/{name}', size)


def text(draw, xy, value, size, serif=False, bold=False, color=INK):
    face = font(size, serif, bold)
    box = draw.textbbox(xy, value, font=face)
    assert box[0] >= 0 and box[1] >= 0 and box[2] < draw._image.width and box[3] < draw._image.height, (value, box)
    draw.text(xy, value, font=face, fill=color)


def wide(audit=False):
    im = Image.new('RGB', (1200, 627), PAPER)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 14, 627), fill=INK)
    text(d, (64, 45), 'MIZEL CLUETT', 21, bold=True)
    text(d, (64, 79), 'RESEARCH & EDUCATION', 14, color=MUTED)
    d.line((64, 127, 1136, 127), fill=LINE, width=2)
    if audit:
        text(d, (64, 173), 'Source Verification', 68, serif=True)
        text(d, (64, 265), 'and Final Review', 68, serif=True)
        text(d, (68, 397), 'Practice exams and assessment validity', 29, color=MUTED)
        text(d, (68, 440), 'in computer science', 29, color=MUTED)
    else:
        text(d, (64, 158), 'Practice Exams', 79, serif=True)
        text(d, (64, 256), 'and Assessment Validity', 69, serif=True)
        text(d, (64, 346), 'in Computer Science', 69, serif=True)
        text(d, (68, 456), 'Preparation · Fairness · Bloom’s taxonomy', 26, color=MUTED)
    d.line((64, 531, 1136, 531), fill=LINE, width=2)
    d.rectangle((64, 531, 194, 534), fill=RUST)
    text(d, (64, 558), '21 references · Full paper & source audit', 20)
    text(d, (934, 559), 'OCTOBER 2026', 18, color=MUTED)
    im.save(OUT / ('audit-preview-v1.png' if audit else 'paper-preview-v1.png'), optimize=True)


def square():
    im = Image.new('RGB', (1080, 1080), PAPER)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 16, 1080), fill=INK)
    text(d, (72, 62), 'MIZEL CLUETT', 24, bold=True)
    text(d, (72, 105), 'RESEARCH & EDUCATION', 17, color=MUTED)
    d.line((72, 168, 1008, 168), fill=LINE, width=2)
    text(d, (72, 232), 'Practice Exams', 83, serif=True)
    text(d, (72, 338), 'and Assessment', 83, serif=True)
    text(d, (72, 444), 'Validity in', 83, serif=True)
    text(d, (72, 550), 'Computer Science', 83, serif=True)
    d.rectangle((75, 703, 210, 708), fill=RUST)
    text(d, (72, 749), 'Preparation. Fairness. Cognitive demand.', 29, color=MUTED)
    text(d, (72, 801), 'When is withholding practice defensible?', 29, color=MUTED)
    d.line((72, 934, 1008, 934), fill=LINE, width=2)
    text(d, (72, 961), 'Critical narrative review · 21 references', 22)
    text(d, (72, 1000), 'Full paper & source audit · October 2026', 20, color=MUTED)
    im.save(OUT / 'paper-share-square-v1.png', optimize=True)


if __name__ == '__main__':
    wide()
    wide(audit=True)
    square()
    for p in sorted(OUT.glob('*.png')):
        with Image.open(p) as im:
            print(f'{p.name}: {im.width} × {im.height}, {p.stat().st_size:,} bytes')
