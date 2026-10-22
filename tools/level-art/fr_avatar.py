from common import *

SKIN = '#f8d9c0'
HAIR = '#8b5a3c'
CX = 300

def reindeer():
    B = '#a8754a'
    return ''.join([
        ellipse(110, 458, 80, 10, '#000', 'opacity="0.12"'),
        f'<g stroke="{shade(B,0.7)}" stroke-width="9" stroke-linecap="round">'
        '<line x1="70" y1="400" x2="66" y2="452"/><line x1="92" y1="404" x2="92" y2="454"/>'
        '<line x1="138" y1="404" x2="140" y2="454"/><line x1="156" y1="398" x2="162" y2="450"/></g>',
        ellipse(112, 380, 62, 38, B),
        ellipse(118, 392, 40, 20, shade(B, 1.35)),
        path('M150 370 Q 170 330 176 300', 'none', f'stroke="{B}" stroke-width="26" stroke-linecap="round"'),
        ellipse(186, 290, 30, 26, B),
        ellipse(206, 300, 16, 12, shade(B, 1.3)),
        circle(219, 297, 6, '#3a2a22'),
        circle(186, 284, 5.5, '#2a1d17'), circle(188, 282, 2, '#fff'),
        path('M168 270 q -8 -12 -2 -22', 'none', f'stroke="{B}" stroke-width="9" stroke-linecap="round"'),
        f'<g fill="none" stroke="#7a5230" stroke-width="5" stroke-linecap="round">'
        '<path d="M178 266 q -4 -30 -24 -42 M166 240 q -14 -2 -20 -14 M184 266 q 6 -30 28 -40 M200 238 q 14 -2 18 -14"/></g>',
        ellipse(58, 368, 10, 12, '#f4efe8'),
        path('M160 390 q 10 14 0 26', 'none', 'stroke="#d23b3b" stroke-width="6"'),
    ])

def owl(x, y):
    return ''.join([
        ellipse(x, y, 26, 30, '#f5f7fb', 'stroke="#c9d3e3" stroke-width="2"'),
        circle(x - 9, y - 8, 8, '#fff', 'stroke="#c9d3e3"'), circle(x + 9, y - 8, 8, '#fff', 'stroke="#c9d3e3"'),
        circle(x - 9, y - 8, 4.5, '#f2b632'), circle(x + 9, y - 8, 4.5, '#f2b632'),
        circle(x - 9, y - 8, 2.2, '#222'), circle(x + 9, y - 8, 2.2, '#222'),
        poly([(x - 4, y), (x + 4, y), (x, y + 7)], '#e09a2a'),
        ''.join(circle(x + dx, y + dy, 1.8, '#9aa8bd') for dx, dy in [(-10, 10), (0, 14), (10, 10), (-5, 18), (5, 18)]),
    ])

def dragon():
    c = '#5fc8ff'
    return ''.join([
        path(f'M{CX-58} 330 C {CX-110} 300, {CX-30} 280, {CX-72} 250 C {CX-100} 232, {CX-120} 260, {CX-96} 262',
             'none', f'stroke="{c}" stroke-width="13" stroke-linecap="round"'),
        path(f'M{CX-58} 330 C {CX-110} 300, {CX-30} 280, {CX-72} 250', 'none',
             'stroke="#ffffff" stroke-width="3" stroke-dasharray="4 7" opacity="0.8"'),
        ellipse(CX - 104, 254, 17, 13, c),
        poly([(CX - 112, 244), (CX - 122, 228), (CX - 104, 240)], '#dff6ff'),
        circle(CX - 109, 251, 3, '#1b3a5c'),
        poly([(CX - 80, 262), (CX - 110, 280), (CX - 86, 276)], '#dff6ff', 'opacity="0.9"'),
    ])

def build(L):
    defs = BLUR + radgrad('aur1', [(0, '#5dffb0', 0.75), (1, '#5dffb0', 0)]) + \
        radgrad('aur2', [(0, '#b07dff', 0.7), (1, '#b07dff', 0)]) + \
        radgrad('glow', [(0, '#ffffff', 0.95), (0.4, '#c9f1ff', 0.6), (1, '#c9f1ff', 0)]) + \
        lingrad('dress', [(0, '#c4ecff'), (1, '#7cc4ef')]) + \
        lingrad('coat', [(0, '#4d8de0'), (1, '#2f69bf')]) + \
        lingrad('cape', [(0, '#2557b3'), (1, '#173a80')])
    p = [ellipse(CX, 470, 90, 14, '#000', 'opacity="0.15"')]
    if L >= 12:
        p.append(circle(CX, 260, 240, 'url(#glow)'))
    if L >= 8:
        p.append(ellipse(CX - 70, 220, 150, 190, 'url(#aur1)'))
        p.append(ellipse(CX + 80, 240, 140, 200, 'url(#aur2)'))
    if L >= 6:
        p.append(reindeer())
    # cape / cloak
    if L >= 5:
        p.append(path(f'M{CX-46} 236 Q {CX-120} 340 {CX-122} 452 Q {CX} 470 {CX+122} 452 Q {CX+120} 340 {CX+46} 236 Z', 'url(#cape)'))
        if L >= 9:
            for (dx, dy, r) in [(-90, 400, 11), (-70, 330, 8), (85, 380, 12), (95, 440, 7), (60, 300, 7), (-100, 445, 7), (-40, 440, 8)]:
                p.append(snowflake(CX + dx, dy, r, '#dff3ff', 2))
    # train (L11)
    if L >= 11:
        p.append(path(f'M{CX+30} 330 Q {CX+150} 420 {CX+200} 470 L {CX+40} 472 Z', '#8fd0f2'))
        p.append(path(f'M{CX+30} 330 Q {CX+150} 420 {CX+200} 470', 'none', 'stroke="#ffffff" stroke-width="3" opacity="0.7"'))
    # legs + footwear
    leg_top = 388
    for dx in (-26, 8):
        p.append(rect(CX + dx, leg_top, 18, 58, '#e9eef6' if L >= 4 else '#2d3e63', 'rx="8"'))
        if L >= 4:
            p.append(rect(CX + dx - 4, 432, 28, 22, '#ffffff', 'rx="8" stroke="#c8d3e3" stroke-width="2"'))
            p.append(f'<line x1="{CX+dx-6}" y1="460" x2="{CX+dx+26}" y2="460" stroke="#9aa6b5" stroke-width="4" stroke-linecap="round"/>')
        else:
            p.append(rect(CX + dx - 4, 430, 28, 24, '#f4f0ea', 'rx="9"'))
            p.append(rect(CX + dx - 4, 428, 28, 8, '#ffffff', 'rx="4"'))
    # arms (behind body)
    sleeve = 'url(#coat)' if L < 4 else ('#a9dcf6')
    p.append(path(f'M{CX-44} 248 Q {CX-74} 300 {CX-70} 352', 'none', f'stroke="{sleeve}" stroke-width="26" stroke-linecap="round"'))
    p.append(path(f'M{CX+44} 248 Q {CX+74} 300 {CX+70} 352', 'none', f'stroke="{sleeve}" stroke-width="26" stroke-linecap="round"'))
    hand = '#3f7fd6' if L < 4 else SKIN
    p.append(circle(CX - 70, 360, 14, hand)); p.append(circle(CX + 70, 360, 14, hand))
    # body
    if L < 4:
        p.append(path(f'M{CX-46} 232 Q {CX} 222 {CX+46} 232 L {CX+72} 392 Q {CX} 404 {CX-72} 392 Z', 'url(#coat)'))
        p.append(path(f'M{CX-74} 388 Q {CX} 402 {CX+74} 388', 'none', 'stroke="#ffffff" stroke-width="12" stroke-linecap="round"'))
        p.append(f'<line x1="{CX}" y1="236" x2="{CX}" y2="392" stroke="#ffffff" stroke-width="6"/>')
        for y in (270, 305, 340):
            p.append(circle(CX + 12, y, 5, '#f2c94c'))
    else:
        hem = 455 if L >= 11 else 404
        p.append(path(f'M{CX-36} 232 Q {CX} 222 {CX+36} 232 L {CX+40} 300 L {CX+92} {hem} Q {CX} {hem+14} {CX-92} {hem} L {CX-40} 300 Z', 'url(#dress)'))
        p.append(path(f'M{CX-40} 300 Q {CX} 312 {CX+40} 300', 'none', 'stroke="#ffffff" stroke-width="5" opacity="0.8"'))
        for (dx, dy) in [(-40, 340), (20, 360), (-10, 390), (50, 400), (-60, 410), (30, 330), (0, 270), (-20, 250), (60, 430), (-30, 440)]:
            if dy < hem:
                p.append(star(CX + dx, dy, 5, '#ffffff', 4, 0.35, 'opacity="0.9"'))
    # scarf
    if L >= 2:
        p.append(path(f'M{CX-40} 228 Q {CX} 246 {CX+40} 228', 'none', 'stroke="#eaf4ff" stroke-width="20" stroke-linecap="round"'))
        p.append(rect(CX + 14, 232, 22, 62, '#eaf4ff', 'rx="6" transform="rotate(-8 300 232)"'))
        for k in range(3):
            p.append(snowflake(CX + 25 - k * 2, 248 + k * 18, 5, '#4a84d6', 1.6))
        p.append(path(f'M{CX-40} 228 Q {CX} 246 {CX+40} 228', 'none', 'stroke="#4a84d6" stroke-width="3" stroke-dasharray="6 6"'))
    # head
    p.append(ellipse(CX, 156, 64, 60, HAIR))
    for s_ in (-1, 1):
        p.append(circle(CX + s_ * 60, 196, 19, HAIR))
        p.append(circle(CX + s_ * 66, 222, 15, HAIR))
        p.append(rect(CX + s_ * 58 - 8, 205, 16, 7, '#4a84d6', 'rx="3"'))
    p.append(rect(CX - 10, 210, 20, 22, SKIN))
    p.append(circle(CX, 166, 56, SKIN))
    p.append(path(f'M{CX-58} 160 Q {CX-48} 104 {CX} 108 Q {CX+52} 104 {CX+58} 160 Q {CX+30} 128 {CX} 140 Q {CX-30} 128 {CX-58} 160 Z', HAIR))
    for s in (-1, 1):
        ex = CX + s * 20
        p.append(ellipse(ex, 170, 8, 11, '#2b2140'))
        p.append(circle(ex + 3, 165, 3.2, '#ffffff'))
        p.append(circle(ex - 2, 174, 1.6, '#ffffff'))
        p.append(ellipse(CX + s * 34, 190, 10, 7, '#f6a0a6', 'opacity="0.75"'))
    p.append(path(f'M{CX-12} 194 Q {CX} 206 {CX+12} 194', 'none', 'stroke="#b34b5a" stroke-width="3.5" stroke-linecap="round"'))
    # headwear
    if L <= 2:
        p.append(path(f'M{CX-60} 150 Q {CX-56} 84 {CX} 80 Q {CX+56} 84 {CX+60} 150 Z', '#4a84d6'))
        p.append(rect(CX - 64, 138, 128, 22, '#eaf4ff', 'rx="11"'))
        p.append(circle(CX, 76, 15, '#ffffff'))
        p.append(snowflake(CX + 18, 112, 12, '#ffffff', 2.5))
    elif L <= 9:
        p.append(path(f'M{CX-54} 128 Q {CX} 96 {CX+54} 128', 'none', 'stroke="#d6dde8" stroke-width="7" stroke-linecap="round"'))
        for dx, r in [(-26, 4), (0, 6), (26, 4)]:
            p.append(circle(CX + dx, 106 + abs(dx) * 0.35, r, '#9fe3ff', 'stroke="#ffffff" stroke-width="1.5"'))
    elif L == 10:
        p.append(path(f'M{CX-54} 128 Q {CX} 96 {CX+54} 128', 'none', 'stroke="#e8eef6" stroke-width="8" stroke-linecap="round"'))
        p.append(poly([(CX - 14, 104), (CX, 70), (CX + 14, 104), (CX, 114)], '#aeeaff', 'stroke="#ffffff" stroke-width="2"'))
        for dx in (-30, 30):
            p.append(poly([(CX + dx - 7, 112), (CX + dx, 92), (CX + dx + 7, 112)], '#cdf3ff'))
    else:
        pts = [(CX - 56, 128)]
        for k, h in enumerate([28, 44, 34, 60, 34, 44, 28]):
            x = CX - 48 + k * 16
            pts += [(x - 6, 116), (x, 116 - h), (x + 6, 116)]
        pts += [(CX + 56, 128), (CX, 112)]
        p.append(poly(pts, '#d8f5ff', 'stroke="#ffffff" stroke-width="2"'))
        p.append(circle(CX, 104, 7, '#7fd6ff'))
    # wand + snow swirl
    if L >= 7:
        p.append(f'<line x1="{CX+70}" y1="364" x2="{CX+118}" y2="250" stroke="#e6f6ff" stroke-width="6" stroke-linecap="round"/>')
        p.append(snowflake(CX + 120, 244, 16, '#ffffff', 3))
        p.append(circle(CX + 120, 244, 22, '#bff0ff', 'opacity="0.45" filter="url(#blur8)"'))
        for dx, dy, r in [(40, -60, 7), (66, -20, 5), (30, -10, 6), (86, -70, 5), (56, 10, 4)]:
            p.append(snowflake(CX + 70 + dx, 360 + dy, r, '#ffffff', 1.6, 0.9))
    if L >= 6:
        p.append(path(f'M{CX-70} 360 Q 230 380 206 304', 'none', 'stroke="#c0392b" stroke-width="3"'))
    if L >= 9:
        p.append(owl(CX + 58, 210))
    if L >= 12:
        p.append(dragon())
    return svg(512, 512, ''.join(p), defs)
