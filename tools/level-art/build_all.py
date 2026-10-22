"""Regenerate KidQuest level art (avatars + landscapes) from code.

Usage (from repo root):
    pip install playwright pillow && python -m playwright install chromium
    python tools/level-art/build_all.py

Writes PNG avatars (512x512, transparent), WebP landscapes (1600x900) and
WebP thumbnails (400x225) to frontend/src/assets/themes/<theme>/...
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import mc_avatar, fr_avatar, un_avatar, mc_land, fr_land, un_land, render
from PIL import Image

ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
render.OUT = os.path.join(HERE, '_render')
DEST = os.path.join(ROOT, 'frontend', 'src', 'assets', 'themes')
THEMES = {'minecraft': (mc_avatar, mc_land), 'frozen': (fr_avatar, fr_land), 'unicorn': (un_avatar, un_land)}

items = []
for t, (av, la) in THEMES.items():
    for L in range(1, 13):
        items.append((f'{t}/avatar/L{L:02d}', av.build(L), 512, 512, True))
        items.append((f'{t}/landscape/L{L:02d}', la.build(L), 1600, 900, False))
render.render(items)
for t in THEMES:
    for L in range(1, 13):
        n = f'L{L:02d}'
        os.makedirs(f'{DEST}/{t}/avatar', exist_ok=True)
        os.makedirs(f'{DEST}/{t}/landscape/thumb', exist_ok=True)
        Image.open(f'{render.OUT}/{t}/avatar/{n}.png').save(f'{DEST}/{t}/avatar/{n}.png', optimize=True)
        im = Image.open(f'{render.OUT}/{t}/landscape/{n}.png').convert('RGB')
        im.save(f'{DEST}/{t}/landscape/{n}.webp', 'WEBP', quality=86)
        im.resize((400, 225), Image.LANCZOS).save(f'{DEST}/{t}/landscape/thumb/{n}.webp', 'WEBP', quality=82)
print('done ->', DEST)
