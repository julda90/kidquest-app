from common import *
import random, math

W, H = 1600, 900
GY = 620

def base_defs():
    return BLUR + lingrad('snowg', [(0, '#ffffff'), (1, '#dbe9f7')]) + \
        lingrad('ice', [(0, '#e6f7ff'), (1, '#9fd4f2')]) + \
        lingrad('aurA', [(0, '#5dffb0', 0), (0.5, '#5dffb0', 0.75), (1, '#5dffb0', 0)], 0, 0, 1, 0) + \
        lingrad('aurB', [(0, '#b07dff', 0), (0.5, '#b07dff', 0.65), (1, '#b07dff', 0)], 0, 0, 1, 0)

def sky(top, bottom, id_):
    return lingrad(id_, [(0, top), (1, bottom)]), rect(0, 0, W, H, f'url(#{id_})')

def snowfall(n=120, seed=1, y1=H):
    r = random.Random(seed)
    return ''.join(circle(r.randrange(0, W), r.randrange(0, y1), r.choice([2, 2.5, 3, 4]), '#ffffff', f'opacity="{r.uniform(0.5, 0.95):.2f}"') for _ in range(n))

def stars(n=140, seed=3, y1=520):
    r = random.Random(seed)
    return ''.join(circle(r.randrange(0, W), r.randrange(0, y1), r.choice([1.2, 1.6, 2.2]), '#ffffff', f'opacity="{r.uniform(0.4, 1):.2f}"') for _ in range(n))

def far_hills(c='#eef5fc', c2='#dde9f5'):
    return path(f'M0 520 Q 200 440 420 500 T 820 480 T 1220 470 T 1600 500 L 1600 {GY} L 0 {GY} Z', c2) + \
        path(f'M0 560 Q 260 500 520 550 T 1060 540 T 1600 545 L 1600 {GY} L 0 {GY} Z', c)

def ground():
    return rect(0, GY - 10, W, H - GY + 10, 'url(#snowg)') + path(f'M0 {GY} Q 400 {GY-18} 800 {GY} T 1600 {GY}', '#ffffff')

def house(x, w, h, wall, night=False):
    y0 = GY + 4
    win = '#ffd27a' if not night else '#ffc24a'
    out = [rect(x, y0 - h, w, h, wall, 'rx="4"')]
    out.append(rect(x + w * 0.66, y0 - h - w * 0.55, 22, 50, '#8a6a5a'))
    out.append(path(f'M{x-18} {y0-h+6} L {x+w/2} {y0-h-w*0.5} L {x+w+18} {y0-h+6} Z', '#7a4a52'))
    out.append(path(f'M{x-22} {y0-h+8} L {x+w/2} {y0-h-w*0.5-6} L {x+w+22} {y0-h+8} Q {x+w/2} {y0-h-4} {x-22} {y0-h+8} Z', '#ffffff'))
    out.append(rect(x + 16, y0 - h + 22, 26, 26, win, 'rx="3"'))
    out.append(rect(x + w - 42, y0 - h + 22, 26, 26, win, 'rx="3"'))
    out.append(circle(x + 29, y0 - h + 35, 26, win, 'opacity="0.35" filter="url(#blur8)"'))
    out.append(rect(x + w / 2 - 14, y0 - 44, 28, 44, '#6a4a3a', 'rx="12"'))
    sx = x + w * 0.66 + 11
    sy = y0 - h - w * 0.55
    for i, r in enumerate([12, 16, 20]):
        out.append(circle(sx + i * 10, sy - 20 - i * 28, r, '#ffffff', f'opacity="{0.7 - i*0.18}"'))
    return ''.join(out)

def village(night=False):
    walls = ['#e9b7a0', '#c9d8ef', '#f2d7a6', '#d9c2e8']
    out = []
    for i, (x, w, h) in enumerate([(160, 150, 120), (360, 120, 100), (540, 170, 135), (760, 130, 105)]):
        out.append(house(x, w, h, walls[i], night))
    # snowman
    out.append(circle(930, GY + 6, 34, '#ffffff', 'stroke="#d6e2ef" stroke-width="2"'))
    out.append(circle(930, GY - 44, 24, '#ffffff', 'stroke="#d6e2ef" stroke-width="2"'))
    out.append(poly([(930, GY - 46), (956, GY - 42), (930, GY - 38)], '#f08a24'))
    out.append(rect(914, GY - 76, 32, 12, '#c0392b', 'rx="4"'))
    return ''.join(out)

def pine(x, y, s, c='#cfe3f2', snow='#ffffff'):
    out = []
    for i in range(3):
        w = (90 - i * 22) * s
        top = y - (60 + i * 50) * s
        out.append(poly([(x - w, top + 70 * s), (x, top), (x + w, top + 70 * s)], shade(c, 1 - i * 0.03)))
        out.append(poly([(x - w * 0.5, top + 35 * s), (x, top), (x + w * 0.5, top + 35 * s)], snow))
    out.append(rect(x - 8 * s, y - 10 * s, 16 * s, 24 * s, '#8a9aa8'))
    return ''.join(out)

def lake():
    return ellipse(1270, 650, 290, 52, 'url(#ice)') + ellipse(1270, 640, 230, 30, '#ffffff', 'opacity="0.35"')

def lanterns():
    out = [path('M860 470 Q 1180 560 1500 470', 'none', 'stroke="#6a5a6a" stroke-width="3"')]
    cols = ['#ff7a7a', '#ffd36b', '#7ad6ff', '#b58cff', '#7affb2']
    for k in range(11):
        t = k / 10
        x = 860 + 640 * t
        y = 470 + 4 * 90 * t * (1 - t) * 0.5 * 2
        out.append(f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{x:.0f}" y2="{y+14:.0f}" stroke="#6a5a6a" stroke-width="2"/>')
        out.append(ellipse(x, y + 28, 12, 16, cols[k % 5]))
        out.append(circle(x, y + 28, 22, cols[k % 5], 'opacity="0.35" filter="url(#blur8)"'))
    out.append(path('M980 655 q 80 -18 160 0 M1160 668 q 90 -16 180 2', 'none', 'stroke="#ffffff" stroke-width="3" opacity="0.8"'))
    return ''.join(out)

def aurora(full=False):
    out = []
    bands = [('aurA', 'M-50 200 C 300 80, 600 300, 900 150 S 1400 120, 1700 220'),
             ('aurB', 'M-50 300 C 350 200, 700 360, 1000 240 S 1450 260, 1700 320')]
    if full:
        bands.append(('aurA', 'M-50 120 C 400 40, 800 220, 1200 90 S 1500 60, 1700 140'))
    for g, d in bands:
        out.append(path(d, 'none', f'stroke="url(#{g})" stroke-width="{110 if full else 90}" stroke-linecap="round" filter="url(#blur20)" opacity="0.9"'))
    return ''.join(out)

def village_scene(L):
    night = L == 8
    d, sk = sky('#0b1640', '#2a3f7a', 'sk') if night else sky('#9db6cf', '#e4eef7', 'sk')
    out = [sk]
    if night:
        out += [stars(), aurora()]
    out.append(far_hills('#e3edf7' if not night else '#9db0d0', '#d2e1f0' if not night else '#7f95bd'))
    if L >= 3:
        for x, s in [(60, 1.0), (1000, 0.8), (1100, 1.1), (1230, 0.85), (1380, 1.15), (1520, 0.9)]:
            out.append(pine(x, GY - 20, s, '#bcd6ea' if not night else '#8aa3c8'))
    out.append(ground())
    if L >= 2: out.append(lake())
    out.append(village(night))
    if L >= 4: out.append(lanterns())
    out.append(snowfall(110, L))
    if night:
        out.append(rect(0, GY, W, H - GY, '#0b1640', 'opacity="0.35"'))
    return svg(W, H, ''.join(out), base_defs() + d)

def mountains():
    d, sk = sky('#8fb3d6', '#e8f1f9', 'sk')
    out = [sk]
    peaks = [(-100, 620, 300, 200), (250, 620, 520, 120), (700, 620, 980, 180), (1100, 620, 1350, 140), (1400, 620, 1700, 220)]
    for (x0, y0, xp, yp) in peaks:
        x1 = xp + (xp - x0)
        out.append(poly([(x0, y0), (xp, yp), (x1, y0)], '#8fa6c4'))
        out.append(poly([(xp - (xp - x0) * 0.32, yp + (y0 - yp) * 0.32), (xp, yp), (xp + (xp - x0) * 0.32, yp + (y0 - yp) * 0.32),
                         (xp + 10, yp + (y0 - yp) * 0.24), (xp - 14, yp + (y0 - yp) * 0.3)], '#ffffff'))
    for y, op in [(470, 0.6), (540, 0.7)]:
        out.append(ellipse(800, y, 900, 60, '#ffffff', f'opacity="{op}" filter="url(#blur20)"'))
    out.append(ground())
    out.append(snowfall(80, 5))
    return svg(W, H, ''.join(out), base_defs() + d)

def forest_path():
    d, sk = sky('#a9c3dc', '#eef4fa', 'sk')
    out = [sk, far_hills()]
    for x, s in [(-20, 1.6), (150, 1.3), (300, 1.0), (1280, 1.0), (1420, 1.35), (1590, 1.6), (430, 0.7), (1150, 0.7), (540, 0.5), (1050, 0.5)]:
        out.append(pine(x, GY + (20 if s > 1.2 else 0), s, '#a9c6de'))
    out.append(ground())
    out.append(path(f'M560 {H} Q 760 {GY+80} 800 {GY-6} Q 840 {GY+80} 1040 {H} Z', '#e6eef7'))
    sx, sy = 760, 600
    out.append(rect(sx, sy - 22, 70, 26, '#c0392b', 'rx="8"'))
    out.append(path(f'M{sx-6} {sy+8} H {sx+80}', 'none', 'stroke="#f2c94c" stroke-width="4"'))
    out.append(ellipse(sx + 120, sy - 18, 30, 16, '#8a5a3a'))
    out.append(circle(sx + 148, sy - 36, 11, '#8a5a3a'))
    out.append(path(f'M{sx+146} {sy-46} l -6 -16 M{sx+152} {sy-46} l 8 -16', 'none', 'stroke="#6a4a2a" stroke-width="3"'))
    for lx in (sx + 104, sx + 136):
        out.append(f'<line x1="{lx}" y1="{sy-6}" x2="{lx}" y2="{sy+10}" stroke="#6a4a2a" stroke-width="4"/>')
    out.append(f'<line x1="{sx+70}" y1="{sy-12}" x2="{sx+100}" y2="{sy-18}" stroke="#6a4a2a" stroke-width="2"/>')
    out.append(snowfall(100, 6))
    return svg(W, H, ''.join(out), base_defs() + d)

def sculpture_garden():
    d, sk = sky('#a7c4e0', '#eef5fb', 'sk')
    out = [sk, far_hills()]
    out.append(ground())
    for x in (200, 700, 1200):
        out.append(path(f'M{x} {GY} L {x} {GY-200} Q {x+100} {GY-330} {x+200} {GY-200} L {x+200} {GY}', 'none',
                        'stroke="url(#ice)" stroke-width="30"'))
        out.append(path(f'M{x} {GY-200} Q {x+100} {GY-330} {x+200} {GY-200}', 'none', 'stroke="#ffffff" stroke-width="6" opacity="0.8"'))
    for x, kind in [(470, 'star'), (980, 'crystal'), (1460, 'swan'), (80, 'crystal')]:
        out.append(rect(x - 36, GY - 60, 72, 60, '#dbe9f7', 'rx="6"'))
        if kind == 'star':
            out.append(star(x, GY - 120, 50, '#bfe8ff', 5, 0.45, 'stroke="#ffffff" stroke-width="4"'))
        elif kind == 'crystal':
            out.append(poly([(x - 30, GY - 60), (x - 12, GY - 190), (x + 6, GY - 140), (x + 22, GY - 210), (x + 34, GY - 60)], 'url(#ice)', 'stroke="#ffffff" stroke-width="4"'))
        else:
            out.append(path(f'M{x-50} {GY-70} Q {x-50} {GY-120} {x} {GY-110} Q {x+30} {GY-108} {x+20} {GY-160} Q {x+14} {GY-200} {x+44} {GY-196}', 'none', 'stroke="#bfe8ff" stroke-width="22" stroke-linecap="round"'))
            out.append(ellipse(x - 10, GY - 92, 50, 26, '#bfe8ff'))
    for x in range(0, W, 120):
        out.append(ellipse(x + 60, GY + 10, 70, 24, '#ffffff'))
    out.append(snowfall(80, 7))
    return svg(W, H, ''.join(out), base_defs() + d)

def ice_bridge():
    d, sk = sky('#8fb0d4', '#e6f0f9', 'sk')
    out = [sk]
    out.append(path(f'M0 {GY-120} L 520 {GY-120} L 600 {H} L 0 {H} Z', '#eef5fc'))
    out.append(path(f'M1600 {GY-120} L 1080 {GY-120} L 1000 {H} L 1600 {H} Z', '#eef5fc'))
    out.append(path(f'M520 {GY-120} L 600 {H} L 1000 {H} L 1080 {GY-120} Z', '#4f6f9a'))
    out.append(path(f'M560 {GY+40} L 640 {H} L 960 {H} L 1040 {GY+40} Z', '#2f4a70'))
    out.append(path(f'M480 {GY-120} Q 800 {GY-210} 1120 {GY-120}', 'none', 'stroke="url(#ice)" stroke-width="34"'))
    out.append(path(f'M480 {GY-140} Q 800 {GY-230} 1120 {GY-140}', 'none', 'stroke="#ffffff" stroke-width="5" opacity="0.8"'))
    out.append(path(f'M560 {GY-150} Q 800 {GY-520} 1040 {GY-150}', 'none', 'stroke="url(#ice)" stroke-width="22" opacity="0.85"'))
    for x in range(500, 1100, 70):
        out.append(poly([(x, GY - 120 - 30), (x + 8, GY - 120 + 6), (x + 16, GY - 120 - 30)], '#ffffff', 'opacity="0.7"'))
    for x, s in [(80, 1.0), (300, 0.8), (1300, 0.9), (1500, 1.1)]:
        out.append(pine(x, GY - 120, s))
    out.append(snowfall(90, 8))
    return svg(W, H, ''.join(out), base_defs() + d)

def palace(cx, base, s=1.0):
    out = []
    out.append(ellipse(cx, base - 200 * s, 360 * s, 260 * s, '#c9f1ff', 'opacity="0.35" filter="url(#blur20)"'))
    for dx, h, w in [(-220, 260, 70), (220, 260, 70), (-120, 340, 80), (120, 340, 80), (0, 470, 110)]:
        x = cx + dx * s
        out.append(rect(x - w * s / 2, base - h * s, w * s, h * s, 'url(#ice)'))
        out.append(poly([(x - w * s / 2 - 6, base - h * s), (x, base - (h + 120) * s), (x + w * s / 2 + 6, base - h * s)], '#e6f7ff', 'stroke="#ffffff" stroke-width="3"'))
        out.append(rect(x - 8 * s, base - h * s + 40 * s, 16 * s, 40 * s, '#7fc8f0', 'rx="6"'))
    out.append(rect(cx - 260 * s, base - 160 * s, 520 * s, 160 * s, 'url(#ice)'))
    out.append(path(f'M{cx-50*s} {base} L {cx-50*s} {base-80*s} Q {cx} {base-130*s} {cx+50*s} {base-80*s} L {cx+50*s} {base} Z', '#6fb6e6'))
    return ''.join(out)

def palace_scene(full):
    d, sk = sky('#060c2a', '#24366e', 'sk')
    out = [sk, stars(220 if full else 140)]
    if full:
        out.append(aurora(True))
    else:
        out.append(circle(1300, 170, 70, '#f4f7ff'))
        out.append(circle(1300, 170, 130, '#f4f7ff', 'opacity="0.2" filter="url(#blur20)"'))
    out.append(path(f'M150 {GY} L 620 420 Q 800 380 980 420 L 1450 {GY} Z', '#8aa0c8'))
    out.append(path(f'M520 470 L 620 420 Q 800 380 980 420 L 1080 470 L 1000 460 L 940 485 L 860 455 L 780 488 L 700 456 L 620 482 Z', '#eef5ff'))
    out.append(palace(800, 420, 0.72))
    out.append(rect(0, GY - 10, W, H - GY + 10, '#c9d8ee'))
    out.append(path(f'M0 {GY} Q 400 {GY-18} 800 {GY} T 1600 {GY}', '#dfe9f6'))
    out.append(rect(0, GY, W, H - GY, '#0b1640', 'opacity="0.3"'))
    out.append(snowfall(60, 9, 600))
    return svg(W, H, ''.join(out), base_defs() + d)

def throne_room():
    defs = base_defs() + lingrad('wall', [(0, '#7fb6e6'), (1, '#d9efff')]) + lingrad('floor', [(0, '#bfe3fb'), (1, '#e9f6ff')])
    out = [rect(0, 0, W, H, 'url(#wall)')]
    for x in range(0, W, 200):
        out.append(path(f'M{x} 0 L {x+100} 140 L {x+200} 0 Z', '#e6f7ff', 'opacity="0.35"'))
    out.append(ellipse(800, 300, 280, 240, '#ffffff', 'opacity="0.35" filter="url(#blur20)"'))
    out.append(rect(0, GY, W, H - GY, 'url(#floor)'))
    for x in range(0, W, 160):
        out.append(f'<line x1="{x}" y1="{GY}" x2="{(x-800)*1.6+800:.0f}" y2="{H}" stroke="#ffffff" stroke-width="2" opacity="0.6"/>')
    for x in (180, 430, 1170, 1420):
        out.append(rect(x - 40, 60, 80, GY - 60, 'url(#ice)'))
        out.append(rect(x - 26, 60, 12, GY - 60, '#ffffff', 'opacity="0.6"'))
        out.append(poly([(x - 56, GY), (x, GY - 40), (x + 56, GY)], '#e6f7ff'))
        out.append(poly([(x - 56, 60), (x, 100), (x + 56, 60)], '#e6f7ff'))
    out.append(rect(600, GY - 30, 400, 30, '#cfeaff')); out.append(rect(640, GY - 60, 320, 30, '#dff2ff'))
    out.append(path(f'M690 {GY-60} L 690 {GY-260} Q 800 {GY-420} 910 {GY-260} L 910 {GY-60} Z', '#9fd4f2', 'stroke="#ffffff" stroke-width="6"'))
    out.append(rect(720, GY - 150, 160, 90, '#6fb6e6', 'rx="10"'))
    out.append(star(800, GY - 300, 34, '#ffffff', 6, 0.5))
    out.append(snowfall(40, 10, 600))
    return svg(W, H, ''.join(out), defs)

def build(L):
    if L <= 4: return village_scene(L)
    if L == 5: return mountains()
    if L == 6: return forest_path()
    if L == 7: return sculpture_garden()
    if L == 8: return village_scene(8)
    if L == 9: return ice_bridge()
    if L == 10: return palace_scene(False)
    if L == 11: return throne_room()
    return palace_scene(True)
