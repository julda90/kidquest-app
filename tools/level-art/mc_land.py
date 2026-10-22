from common import *
import random

W, H = 1600, 900
B = 40
GY = 600  # grass line

def sky(top, bottom, id_='sky'):
    return lingrad(id_, [(0, top), (1, bottom)]), rect(0, 0, W, H, f'url(#{id_})')

def cloud(x, y, s=1.0, c='#ffffff', op=0.95):
    blocks = [(0, 20, 160, 40), (30, 0, 90, 20), (140, 30, 60, 30)]
    return f'<g opacity="{op}">' + ''.join(rect(x + bx * s, y + by * s, bw * s, bh * s, c) for bx, by, bw, bh in blocks) + '</g>'

def ground(grass='#5fb33b', dirt='#8a5a32', water=None):
    out = [rect(0, GY, W, B, grass), rect(0, GY, W, 10, shade(grass, 1.25)), rect(0, GY + B, W, H - GY - B, dirt)]
    rnd = random.Random(3)
    for i in range(70):
        x = rnd.randrange(0, W // 20) * 20; y = rnd.randrange((GY + B) // 20, H // 20) * 20
        out.append(rect(x, y, 20, 20, shade(dirt, rnd.choice([0.85, 1.12]))))
    for i in range(40):
        x = rnd.randrange(0, W // 20) * 20
        out.append(rect(x, GY + 10, 20, 10, shade(grass, 0.88)))
    if water:
        x0, x1 = water
        out.append(rect(x0, GY, x1 - x0, B + 20, '#3a8ee6'))
        out.append(rect(x0, GY, x1 - x0, 8, '#7cc0ff'))
    return ''.join(out)

def hills(c, heights, base=GY, w=80, op=1):
    out = []
    for i, h in enumerate(heights):
        out.append(rect(i * w, base - h, w + 1, h + 2, c))
        out.append(rect(i * w, base - h, w + 1, 10, shade(c, 1.15)))
    return f'<g opacity="{op}">' + ''.join(out) + '</g>'

def tree(x, y0=GY, s=1.0, leaf='#3f9b2f', trunk='#7a5230'):
    t = B * s
    out = [rect(x + t, y0 - 3 * t, t, 3 * t, trunk), rect(x + t * 1.7, y0 - 3 * t, t * 0.3, 3 * t, shade(trunk, 0.8))]
    out.append(rect(x, y0 - 5.4 * t, 3 * t, 2.6 * t, leaf))
    out.append(rect(x + t * 0.5, y0 - 6.2 * t, 2 * t, 1 * t, shade(leaf, 1.1)))
    out.append(rect(x, y0 - 5.4 * t, 3 * t, t * 0.4, shade(leaf, 1.2)))
    out.append(rect(x + 2.2 * t, y0 - 4.6 * t, 0.8 * t, 1.8 * t, shade(leaf, 0.8)))
    return ''.join(out)

def house(x, w, h, wall='#c9a46a', roof='#8b3a2b', y0=GY):
    out = [rect(x, y0 - h, w, h, wall), rect(x + w - 12, y0 - h, 12, h, shade(wall, 0.8))]
    for i in range(0, int(w + 40), 20):
        pass
    out.append(poly([(x - 20, y0 - h), (x + w / 2, y0 - h - w * 0.45), (x + w + 20, y0 - h)], roof))
    out.append(poly([(x + w / 2, y0 - h - w * 0.45), (x + w + 20, y0 - h), (x + w / 2 + 8, y0 - h)], shade(roof, 0.8)))
    out.append(rect(x + w / 2 - 15, y0 - 60, 30, 60, '#5a3a20'))
    out.append(rect(x + 14, y0 - h + 24, 28, 28, '#9fd6ff')); out.append(rect(x + 14, y0 - h + 36, 28, 4, wall))
    return ''.join(out)

def cabin(x):
    out = []
    for i in range(5):
        out.append(rect(x, GY - 40 - i * 32, 170, 32, '#8a5a2e' if i % 2 else '#7a4e26'))
    out.append(poly([(x - 20, GY - 200), (x + 85, GY - 270), (x + 190, GY - 200)], '#5a3a20'))
    out.append(rect(x + 120, GY - 290, 30, 60, '#7d7d7d'))
    for i, (dx, dy, s) in enumerate([(0, -330, 20), (14, -370, 26), (-6, -420, 32)]):
        out.append(rect(x + 125 + dx, GY + dy, s, s, '#dddddd', f'opacity="{0.8 - i*0.2}"'))
    out.append(rect(x + 65, GY - 80, 40, 80, '#4a2e15'))
    out.append(rect(x + 18, GY - 140, 32, 32, '#ffd27a'))
    return ''.join(out)

def torch(x, y, glow=True):
    out = [rect(x, y, 10, 36, '#7a4a1f'), rect(x - 3, y - 12, 16, 14, '#ffb52e'), rect(x + 1, y - 8, 8, 6, '#fff2a8')]
    if glow:
        out.insert(0, circle(x + 5, y - 6, 40, '#ffcc55', 'opacity="0.35" filter="url(#blur8)"'))
    return ''.join(out)

def cave(x):
    hs = [80, 140, 200, 240, 260, 260, 250, 230]
    out = [hills('#8c8c8c', [0] * 0 + hs, base=GY, w=40)]
    out = []
    for i, h in enumerate(hs):
        out.append(rect(x + i * 40, GY - h, 41, h, '#8f8f8f'))
        out.append(rect(x + i * 40, GY - h, 41, 12, '#5fb33b'))
        out.append(rect(x + i * 40 + 8, GY - h + 40, 14, 14, '#7a7a7a'))
    out.append(rect(x + 100, GY - 150, 120, 150, '#1c1c22'))
    out.append(rect(x + 120, GY - 170, 80, 20, '#1c1c22'))
    out.append(torch(x + 76, GY - 120)); out.append(torch(x + 234, GY - 120))
    return ''.join(out)

def watermill(x):
    out = [rect(x, GY - 170, 150, 170, '#b8956a'), rect(x + 130, GY - 170, 20, 170, '#8f7150')]
    out.append(poly([(x - 20, GY - 170), (x + 75, GY - 240), (x + 170, GY - 170)], '#6b4a2a'))
    out.append(rect(x + 50, GY - 70, 40, 70, '#4a2e15'))
    cx, cy = x + 205, GY - 40
    out.append(circle(cx, cy, 70, 'none', 'stroke="#6b4a2a" stroke-width="14"'))
    for k in range(8):
        import math
        a = math.pi / 4 * k
        out.append(f'<line x1="{cx}" y1="{cy}" x2="{cx + 70*math.cos(a):.0f}" y2="{cy + 70*math.sin(a):.0f}" stroke="#7a5432" stroke-width="10"/>')
        out.append(rect(cx + 68 * math.cos(a) - 12, cy + 68 * math.sin(a) - 12, 24, 24, '#8a6440'))
    out.append(circle(cx, cy, 14, '#5a3a20'))
    out.append(rect(cx - 90, GY - 10, 180, 30, '#7cc0ff', 'opacity="0.6"'))
    return ''.join(out)

def wheat(x0, x1):
    out = []
    for x in range(x0, x1, 20):
        out.append(rect(x + 4, GY - 34, 8, 34, '#d9b83a'))
        out.append(rect(x + 2, GY - 44, 12, 14, '#f0d264'))
    return ''.join(out)

def castle(x, y):
    out = [rect(x - 60, y, 420, 260, '#6f9b3a')]  # hill
    out = [path(f'M{x-120} {GY} Q {x+150} {y-10} {x+420} {GY} Z', '#5a9a34')]
    sc = '#a7a7a7'
    out.append(rect(x, y - 150, 300, 150, sc))
    for i in range(0, 300, 40):
        out.append(rect(x + i, y - 175, 24, 25, sc))
    for tx in (x - 30, x + 270):
        out.append(rect(tx, y - 230, 60, 230, shade(sc, 0.92)))
        for i in range(0, 60, 24):
            out.append(rect(tx + i, y - 252, 16, 22, shade(sc, 0.92)))
        out.append(rect(tx + 28, y - 300, 4, 50, '#5a3a20'))
        out.append(poly([(tx + 32, y - 300), (tx + 70, y - 288), (tx + 32, y - 276)], '#d23b3b'))
    out.append(rect(x + 120, y - 80, 60, 80, '#3a2a1a'))
    for wx in (x + 40, x + 220):
        out.append(rect(wx, y - 120, 24, 36, '#2a2a33'))
    return ''.join(out)

def fireflies(n, y0, y1, seed=5):
    rnd = random.Random(seed)
    return ''.join(circle(rnd.randrange(0, W), rnd.randrange(y0, y1), 4, '#fff59a', 'opacity="0.9"') +
                   circle(0, 0, 0, 'none') for _ in range(n)).replace('<circle cx="0.0" cy="0.0" r="0.0" fill="none" />', '') + \
        ''.join(circle(random.Random(seed + i).randrange(0, W), random.Random(seed * 3 + i).randrange(y0, y1), 14, '#fff59a', 'opacity="0.25" filter="url(#blur8)"') for i in range(n))

def plains(L, dusk=False):
    d, sk = sky('#ffb36b', '#6b4fa0') if dusk else sky('#5fb4f0', '#bfe6ff')
    defs = d + BLUR
    out = [sk]
    if dusk:
        out.append(rect(1250, 150, 80, 80, '#ffd27a'))
    else:
        out.append(rect(1300, 90, 90, 90, '#fff3a0')); out.append(rect(1290, 80, 110, 110, '#fff3a0', 'opacity="0.3"'))
        out += [cloud(120, 110), cloud(560, 70, 1.3), cloud(980, 150, 0.9), cloud(1420, 220, 0.8)]
    hill_c = '#4f8f43' if not dusk else '#3d5e4a'
    out.append(hills(shade(hill_c, 1.25), [60, 80, 120, 120, 100, 80, 60, 60, 90, 140, 160, 140, 110, 80, 60, 50, 70, 90, 70, 60], op=0.8))
    if L >= 8:
        out.append(castle(330, 420))
    if L >= 6:
        rnd = random.Random(9)
        for i in range(14):
            x = 1000 + i * 45 + rnd.randrange(-10, 10)
            out.append(tree(x, GY - 30 + rnd.randrange(0, 20), 0.75, '#2f7a28' if not dusk else '#244d2a'))
    out.append(ground(water=(1150, 1270) if L >= 5 else None))
    out.append(tree(480, GY, 1.0)); out.append(tree(1440, GY, 0.9))
    if L >= 2: out.append(cabin(90))
    if L >= 4:
        out.append(house(640, 120, 120)); out.append(house(810, 100, 100, '#d8c08a', '#6b4a8b')); out.append(wheat(940, 1100))
    if L >= 5: out.append(watermill(980 if L < 8 else 980))
    if L >= 3: out.append(cave(1270))
    if dusk:
        out.append(rect(0, 0, W, H, '#2a1a4a', 'opacity="0.18"'))
        out.append(fireflies(26, 380, 590))
    return svg(W, H, ''.join(out), defs)

def mine():
    defs = BLUR + lingrad('m', [(0, '#2a2a33'), (1, '#45454f')])
    out = [rect(0, 0, W, H, 'url(#m)')]
    rnd = random.Random(7)
    for y in range(0, H, 40):
        for x in range(0, W, 40):
            if rnd.random() < 0.35:
                out.append(rect(x, y, 40, 40, rnd.choice(['#3a3a44', '#4c4c57', '#32323b'])))
    for i in range(16):
        x, y = rnd.randrange(60, W - 60), rnd.randrange(60, 540)
        out.append(circle(x + 20, y + 20, 50, '#4ff0ff', 'opacity="0.3" filter="url(#blur20)"'))
        out.append(rect(x, y, 40, 40, '#2a2a33'))
        for (dx, dy) in [(8, 8), (22, 14), (12, 24)]:
            out.append(rect(x + dx, y + dy, 10, 10, '#5ff6ff'))
    out.append(rect(0, 640, W, 260, '#3a332e'))
    out.append(rect(0, 640, W, 10, '#57504a'))
    for x in range(0, W, 60):
        out.append(rect(x, 676, 30, 14, '#6b4a2a'))
    out.append(rect(0, 668, W, 6, '#9a9aa6')); out.append(rect(0, 690, W, 6, '#9a9aa6'))
    cx = 980
    out.append(cube(cx, 600, 150, 70, '#7a7a86', d=20))
    out.append(rect(cx, 600, 150, 12, '#5a5a66'))
    out.append(''.join(rect(cx + 20 + i * 36, 586, 26, 18, '#5ff6ff') for i in range(3)))
    out.append(circle(cx + 30, 676, 14, '#222')); out.append(circle(cx + 120, 676, 14, '#222'))
    for x in (300, 700, 1300):
        out.append(rect(x, 300, 30, 340, '#6b4a2a')); out.append(rect(x - 60, 300, 150, 26, '#7a5432'))
        out.append(torch(x + 10, 360))
    return svg(W, H, ''.join(out), defs)

def jungle():
    d, sk = sky('#7fd0ff', '#d9f6c8')
    defs = d + BLUR
    out = [sk, hills('#3c8f3a', [200, 240, 280, 260, 300, 320, 280, 240, 260, 300, 340, 300, 260, 240, 220, 260, 300, 280, 240, 220], op=0.7)]
    out.append(ground('#3fa53a', '#6b4a2a'))
    tx = 620
    st = '#8f9a7a'
    for i, (w, h) in enumerate([(420, 80), (340, 80), (260, 80), (180, 80)]):
        x = tx + (420 - w) / 2
        y = GY - 80 * (i + 1)
        out.append(rect(x, y, w, h, shade(st, 1 - i * 0.04)))
        out.append(rect(x, y, w, 10, shade(st, 1.15)))
        for k in range(0, int(w), 40):
            if (k // 40 + i) % 3 == 0:
                out.append(rect(x + k, y + 30, 40, 40, '#6f9a5a'))
    out.append(rect(tx + 175, GY - 120, 70, 120, '#1c1c1c'))
    for x in (tx + 140, tx + 266):
        out.append(torch(x, GY - 110))
    for vx in (tx + 60, tx + 120, tx + 300, tx + 360, tx + 200):
        out.append(rect(vx, GY - 300, 10, 160 + (vx % 70), '#2f8a2f'))
    for x, s in [(60, 1.4), (280, 1.2), (1200, 1.4), (1420, 1.1)]:
        out.append(tree(x, GY, s, '#2f8f2a', '#5a4020'))
        out.append(rect(x + 30 * s, GY - 220 * s, 8, 160 * s, '#2a7a2a'))
    return svg(W, H, ''.join(out), defs)

def lava():
    defs = BLUR + lingrad('lv', [(0, '#1a0a0a'), (1, '#5a1a10')])
    out = [rect(0, 0, W, H, 'url(#lv)')]
    rnd = random.Random(11)
    for y in range(0, 560, 40):
        for x in range(0, W, 40):
            if rnd.random() < 0.3:
                out.append(rect(x, y, 40, 40, rnd.choice(['#3a1414', '#4a1a14', '#2a0e0e'])))
    out.append(rect(0, 560, W, 340, '#3a1410'))
    out.append(path('M0 700 Q 400 640 800 700 T 1600 690 L 1600 760 Q 1200 740 800 770 T 0 770 Z', '#ff6a00'))
    out.append(path('M0 700 Q 400 640 800 700 T 1600 690', 'none', 'stroke="#ffd04a" stroke-width="10"'))
    out.append(ellipse(800, 720, 900, 80, '#ff8a1a', 'opacity="0.35" filter="url(#blur20)"'))
    for x in (200, 1350):
        out.append(rect(x, 0, 60, 420, '#ff6a00')); out.append(rect(x + 16, 0, 20, 420, '#ffd04a'))
        out.append(ellipse(x + 30, 200, 80, 220, '#ff8a1a', 'opacity="0.3" filter="url(#blur20)"'))
    px, py = 640, 220
    out.append(ellipse(px + 160, py + 170, 260, 260, '#b04aff', 'opacity="0.4" filter="url(#blur20)"'))
    for i in range(0, 320, 40):
        out.append(rect(px + i, py, 40, 40, '#1a1024')); out.append(rect(px + i, py + 320, 40, 40, '#1a1024'))
    for j in range(40, 320, 40):
        out.append(rect(px, py + j, 40, 40, '#1a1024')); out.append(rect(px + 280, py + j, 40, 40, '#1a1024'))
    out.append(rect(px + 40, py + 40, 240, 280, '#8a2be2'))
    for k in range(12):
        out.append(rect(px + 40 + rnd.randrange(0, 220), py + 40 + rnd.randrange(0, 260), 20, 20, rnd.choice(['#b06aff', '#6a1ac2', '#d9a6ff'])))
    return svg(W, H, ''.join(out), defs)

def island(x, y, w, grass='#5fb33b'):
    out = [rect(x, y, w, 24, grass), rect(x, y, w, 8, shade(grass, 1.25))]
    rows = [(0, w, 40), (40, w - 80, 40), (80, w - 160, 40), (120, w - 240, 40)]
    for i, (dx, ww, hh) in enumerate(rows):
        if ww <= 0: break
        out.append(rect(x + dx, y + 24 + i * 40, ww, 40, shade('#8a5a32', 1 - i * 0.08)))
    return ''.join(out)

def sky_islands():
    d, sk = sky('#7cc6ff', '#eaf7ff')
    defs = d + BLUR
    out = [sk, cloud(80, 640, 2.0), cloud(900, 700, 2.4), cloud(500, 760, 1.6), cloud(1300, 620, 1.8)]
    for (x, y, w) in [(120, 360, 360), (620, 240, 420), (1150, 380, 320)]:
        out.append(island(x, y, w))
        out.append(tree(x + w / 2 - 60, y, 0.8))
        out.append(rect(x + w - 60, y + 24, 30, 260, '#7cc0ff', 'opacity="0.85"'))
        out.append(rect(x + w - 54, y + 24, 8, 260, '#ffffff', 'opacity="0.6"'))
    out += [cloud(300, 120, 1.0), cloud(1100, 90, 1.2)]
    for (x, y) in [(560, 150), (600, 170), (1400, 220)]:
        out.append(rect(x, y, 20, 6, '#333')); out.append(rect(x + 20, y - 6, 20, 6, '#333')); out.append(rect(x - 20, y - 6, 20, 6, '#333'))
    return svg(W, H, ''.join(out), defs)

def night_island():
    defs = BLUR + lingrad('n', [(0, '#060818'), (1, '#1c2350')]) + radgrad('neb', [(0, '#b06aff', 0.5), (1, '#b06aff', 0)]) + radgrad('neb2', [(0, '#4fc3ff', 0.4), (1, '#4fc3ff', 0)])
    out = [rect(0, 0, W, H, 'url(#n)'), ellipse(400, 250, 500, 220, 'url(#neb)'), ellipse(1150, 300, 520, 240, 'url(#neb2)')]
    rnd = random.Random(21)
    for i in range(160):
        s = rnd.choice([4, 4, 6, 8])
        out.append(rect(rnd.randrange(0, W), rnd.randrange(0, 760), s, s, '#ffffff', f'opacity="{rnd.uniform(0.4, 1):.2f}"'))
    out.append(island(520, 470, 560))
    gx = 700
    out.append(ellipse(gx + 100, 380, 260, 200, '#ffd34d', 'opacity="0.35" filter="url(#blur20)"'))
    out.append(rect(gx, 330, 200, 140, '#f5c542')); out.append(rect(gx + 170, 330, 30, 140, '#c99a12'))
    out.append(poly([(gx - 20, 330), (gx + 100, 240), (gx + 220, 330)], '#ffd84d'))
    out.append(rect(gx + 80, 400, 40, 70, '#7a5a12'))
    for tx in (gx - 50, gx + 230):
        out.append(rect(tx, 300, 30, 170, '#f5c542')); out.append(rect(tx - 5, 280, 40, 24, '#ffd84d'))
    out.append(cloud(60, 700, 2.2, '#3a4070', 0.8)); out.append(cloud(1100, 740, 2.4, '#3a4070', 0.8))
    return svg(W, H, ''.join(out), defs)

def build(L):
    if L <= 5: return plains(L)
    if L == 6: return plains(6, dusk=True)
    if L == 7: return mine()
    if L == 8: return plains(8)
    if L == 9: return jungle()
    if L == 10: return lava()
    if L == 11: return sky_islands()
    return night_island()
