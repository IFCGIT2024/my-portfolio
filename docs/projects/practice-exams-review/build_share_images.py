"""Build the sharing image with the shared Papers image generator."""
from pathlib import Path
import runpy

if __name__ == '__main__':
    scope = runpy.run_path(str(Path(__file__).resolve().parents[3] / 'papers' / 'build.py'))
    paper = next(p for p in scope['PAPERS'] if p['slug'] == Path(__file__).resolve().parent.name)
    scope['share_image'](paper)
