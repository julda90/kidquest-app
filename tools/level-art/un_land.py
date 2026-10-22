from common import *
from un_avatar import butterfly, RAINBOW
import random, math

W, H = 1600, 900
GY = 620

def defs():
    return BLUR + lingrad('grass', [(0, '#b9ef9f'), (1, '#8fdc84')]) + \
        lingrad('water', [(0, '#bfe8ff'), (1, '#8fd0f5')]) + \
        lingrad('castle', [(0, '#fff0fb'), (1, '#e7d3ff')])

def sky(top, bottom, id_='sk'):
    return lingrad(id_, [(0, top), (1, bottom)]), rect(0, 0, W, H, f'url(#{id_})')

def cloud(x, y, s=1.0, c='#ffffff', op=1):
    return f'<g opacity="{op}">' + ''.join(circle(x + dx * s, y + dy * s, r * s, c) for dx, dy, r in
                                          [(0, 0, 50), (55, -25, 60), (115, 0, 50), (60, 20, 45), (-40, 20, 35), (160, 20, 35)]) + '</g>'

def hills(c1='#a8e391', c2='#c6f0b0'):
    return path(f'M0 500 Q 260 400 560 480 T 1100 460 T 1600 470 L 1600 {GY} L 0 {GY} Z', c2) + \
        path(f'M0 560 Q 300 480 640 545 T 1260 520 T 1600 540 L 1600 {GY} L 0 {GY} Z', c1)

def ground():
    return rect(0, GY - 10, W, H - GY + 10, 'url(#grass)') + path(f'M0 {GY} Q 400 {GY-16} 800 {GY} T 1600 {GY}', '#c6f0b0')

def flowers(n=70, seed=2, y0=GY - 70, y1=GY + 20, big=False):
    r = random.Random(seed)
    out = []
    for _ in range(n):
        x, y = r.randrange(0, W), r.randrange(y0, y1)
        c = r.choice(['#ff9ad5', '#ffd84d', '#ffffff', '#c7b0ff', '#ff9aa2'])
        rr = r.choice([5, 6, 7]) * (1.4 if big else 1)
        for k in range(5):
            a = 2 * math.pi / 5 * k
            out.append(circle(x + rr * math.cos(a), y + rr * math.sin(a), rr * 0.7, c))
        out.append(circle(x, y, rr * 0.5, '#ffb84d'))
    return ''.join(out)

def rainbow(cx=800, cy=640, r0=420, op=0.75):
    return ''.join(path(f'M{cx - (r0 - i*22)} {cy} A {r0 - i*22} {r0 - i*22} 0 0 1 {cx + r0 - i*22} {cy}', 'none',
                        f'stroke="{c}" stroke-width="22" opacity="{op}"') for i, c in enumerate(RAINBOW))

def stream():
    d = f'M1600 560 C 1300 580, 1200 620, 1000 615 S 600 600, 380 640 S 120 720, -20 760'
    return path(d, 'none', 'stroke="url(#water)" stroke-width="56" stroke-linecap="round"') + \
        path(d, 'none', 'stroke="#ffffff" stroke-width="4" stroke-dasharray="20 30" opacity="0.7"') + \
        ''.join(ellipse(x, y, 18, 10, '#d8d0e8', 'stroke="#b8acd0" stroke-width="2"') for x, y in [(700, 606), (760, 610), (820, 612)])

def mushroom(x, y, s, cap='#ff6f7a'):
    return rect(x - 10 * s, y - 34 * s, 20 * s, 34 * s, '#fff6ea', 'rx="6"') + \
        path(f'M{x-34*s} {y-30*s} Q {x} {y-80*s} {x+34*s} {y-30*s} Z', cap) + \
        ''.join(circle(x + dx * s, y + dy * s, 5 * s, '#ffffff') for dx, dy in [(-14, -42), (8, -52), (18, -38)])

def garden():
    return ''.join(mushroom(x, y, s, c) for x, y, s, c in
                   [(240, GY - 6, 1.3, '#ff6f7a'), (300, GY + 4, 0.9, '#ff9ad5'), (1380, GY - 8, 1.4, '#c7b0ff'), (1440, GY, 0.9, '#ff6f7a'), (190, GY + 8, 0.7, '#ffd84d')])

def rb_bridge():
    out = []
    for i, c in enumerate(RAINBOW):
        out.append(path(f'M{640 + i*0} {620 - i*0} Q 790 {480 - i*10} 940 615', 'none', f'stroke="{c}" stroke-width="10" transform="translate(0,{i*9})"'))
    return ''.join(out)

def castle(cx, base, s, glow=False):
    out = []
    if glow:
        out.append(ellipse(cx, base - 150 * s, 320 * s, 220 * s, '#ffe8a6', 'opacity="0.5" filter="url(#blur20)"'))
    for dx, h, w, roof in [(-150, 200, 60, '#ff9ad5'), (150, 200, 60, '#9fd8ff'), (-70, 270, 70, '#c7b0ff'), (70, 270, 70, '#ffd84d'), (0, 340, 84, '#ff9aa2')]:
        x = cx + dx * s
        out.append(rect(x - w * s / 2, base - h * s, w * s, h * s, 'url(#castle)'))
        out.append(poly([(x - w * s / 2 - 8 * s, base - h * s), (x, base - (h + 90) * s), (x + w * s / 2 + 8 * s, base - h * s)], roof))
        out.append(path(f'M{x} {base-(h+90)*s} l 0 {-24*s} l {18*s} {8*s} l {-18*s} {8*s}', '#ff6fb3'))
        out.append(rect(x - 7 * s, base - h * s + 30 * s, 14 * s, 26 * s, '#b8a0e8', 'rx="7"'))
    out.append(rect(cx - 190 * s, base - 120 * s, 380 * s, 120 * s, 'url(#castle)'))
    out.append(path(f'M{cx-36*s} {base} L {cx-36*s} {base-60*s} Q {cx} {base-100*s} {cx+36*s} {base-60*s} L {cx+36*s} {base} Z', '#c7a0ff'))
    return ''.join(out)

def fireworks():
    out = []
    for cx, cy, c, r in [(380, 180, '#ff9ad5', 90), (1180, 140, '#ffd84d', 110), (800, 90, '#9fd8ff', 70), (1450, 260, '#c7b0ff', 70), (180, 320, '#b5f2a6', 60)]:
        for k in range(14):
            a = 2 * math.pi / 14 * k
            out.append(f'<line x1="{cx + r*0.3*math.cos(a):.0f}" y1="{cy + r*0.3*math.sin(a):.0f}" x2="{cx + r*math.cos(a):.0f}" y2="{cy + r*math.sin(a):.0f}" stroke="{c}" stroke-width="4" stroke-linecap="round"/>')
            out.append(circle(cx + r * 1.08 * math.cos(a), cy + r * 1.08 * math.sin(a), 4, '#ffffff'))
        out.append(circle(cx, cy, r, c, 'opacity="0.18" filter="url(#blur20)"'))
    return ''.join(out)

def stars(n, seed, y1=500, color='#ffffff'):
    r = random.Random(seed)
    return ''.join(star(r.randrange(0, W), r.randrange(0, y1), r.choice([3, 4, 6]), color, 4, 0.4, f'opacity="{r.uniform(0.5, 1):.2f}"') for _ in range(n))

def fireflies(n, seed):
    r = random.Random(seed)
    out = []
    for _ in range(n):
        x, y = r.randrange(0, W), r.randrange(380, 640)
        out.append(circle(x, y, 14, '#fff59a', 'opacity="0.3" filter="url(#blur8)"')); out.append(circle(x, y, 3.5, '#fffbd0'))
    return ''.join(out)

def meadow(L):
    dusk = L == 7
    d, sk = sky('#8a6fd0', '#ffc2a8') if dusk else sky('#9fd6ff', '#eaf6ff')
    out = [sk]
    if dusk:
        out.append(stars(60, 3, 380))
        out.append(circle(1260, 420, 80, '#ffd8a8', 'opacity="0.8"'))
    else:
        out += [cloud(200, 140, 1.0), cloud(700, 90, 1.2), cloud(1250, 170, 0.9)]
        out.append(circle(1380, 120, 60, '#fff3a6')); out.append(circle(1380, 120, 110, '#fff3a6', 'opacity="0.3" filter="url(#blur20)"'))
    if L >= 2:
        out.append(rainbow(op=0.5 if dusk else 0.75))
    out.append(hills('#9fdc8a' if not dusk else '#8bb98a', '#bfe9a8' if not dusk else '#a5c7a0'))
    out.append(ground())
    out.append(flowers(80 if L < 6 else 160, 2, big=L >= 6))
    if L >= 3: out.append(stream())
    if L >= 4: out.append(garden())
    if L >= 5: out.append(rb_bridge())
    if L >= 6:
        r = random.Random(4)
        cols = [('#ff9ad5', '#9fd8ff'), ('#ffd84d', '#c7b0ff'), ('#b5f2a6', '#ff9aa2')]
        for i in range(12):
            c1, c2 = cols[i % 3]
            out.append(butterfly(r.randrange(80, W - 80), r.randrange(260, 560), r.uniform(0.7, 1.2), c1, c2))
    if dusk:
        out.append(rect(0, 0, W, H, '#4a2f80', 'opacity="0.18"'))
        out.append(fireflies(30, 7))
    return svg(W, H, ''.join(out), defs() + d)

def cloudland(L):
    night = L == 9
    d, sk = sky('#141a4a', '#4a4f9a') if night else sky('#c9b8ff', '#ffe3f2')
    out = [sk]
    if night:
        out.append(stars(140, 9, 600))
        out.append(circle(1100, 280, 170, '#fff8e0'))
        out.append(circle(1100, 280, 260, '#fff8e0', 'opacity="0.25" filter="url(#blur20)"'))
        for k in range(5):
            out.append(poly([(1100, 280), (700 + k * 140, H), (780 + k * 140, H)], '#fff8e0', 'opacity="0.07"'))
    else:
        out.append(stars(30, 8, 400, '#ffffff'))
    if L >= 10:
        cx, base, s = (1150, 470, 0.6) if L == 10 else (800, 560, 1.1)
        if L == 12:
            d, sk = sky('#ff9f6b', '#ffd9a0')
            out = [sk, fireworks()]
        out.append(cloud(cx - 230 * s, base + 10, 1.6 * s)); out.append(cloud(cx + 40 * s, base + 10, 1.6 * s))
        out.append(castle(cx, base, s, glow=L == 12))
    for x, y, s in [(-60, 640, 2.4), (400, 700, 2.2), (900, 660, 2.6), (1350, 700, 2.3), (200, 520, 1.3), (1250, 540, 1.2)]:
        out.append(cloud(x, y, s, '#ffffff' if not night else '#d0d4f5'))
    if L >= 11:
        out.append(flowers(90, 11, 660, 760, big=True))
    if L == 8:
        out.append(ellipse(800, 600, 260, 40, '#b9ef9f'))
        out.append(flowers(30, 12, 575, 620))
    return svg(W, H, ''.join(out), defs() + d)

def build(L):
    if L <= 7: return meadow(L)
    return cloudland(L)
