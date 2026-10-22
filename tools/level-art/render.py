import os, sys, importlib
from playwright.sync_api import sync_playwright
from PIL import Image

OUT = '/home/claude/art/out'

def render(items):
    """items: list of (relpath_without_ext, svg_str, w, h, transparent)"""
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        for rel, s, w, h, tr in items:
            os.makedirs(os.path.dirname(f'{OUT}/{rel}'), exist_ok=True)
            open(f'{OUT}/{rel}.svg', 'w').write(s)
            pg.set_viewport_size({'width': w, 'height': h})
            pg.set_content(f'<html><body style="margin:0;background:transparent">{s}</body></html>')
            png = f'{OUT}/{rel}.png'
            pg.screenshot(path=png, omit_background=tr, clip={'x': 0, 'y': 0, 'width': w, 'height': h})
        b.close()

def sheet(paths, cols, tw, th, out):
    im = Image.new('RGBA', (cols * tw, ((len(paths) + cols - 1) // cols) * th), (60, 60, 70, 255))
    for i, pth in enumerate(paths):
        t = Image.open(pth).convert('RGBA')
        t.thumbnail((tw, th))
        bg = Image.new('RGBA', (tw, th), (200, 210, 220, 255) if 'avatar' in pth else (0, 0, 0, 255))
        bg.alpha_composite(t, ((tw - t.width) // 2, (th - t.height) // 2))
        im.paste(bg, ((i % cols) * tw, (i // cols) * th))
    im.save(out)
