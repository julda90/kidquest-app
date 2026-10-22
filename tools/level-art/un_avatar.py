from common import *

COAT = '#ece2ff'
HOOF = '#c7a6e8'
PINK = '#ffb3d9'
RAINBOW = ['#ff9aa2', '#ffc48c', '#fff09a', '#b5f2a6', '#9fd8ff', '#c7b0ff']

def butterfly(x, y, s=1.0, c1='#ff9ad5', c2='#9fd8ff'):
    return (f'<g transform="translate({x},{y}) scale({s})">'
            + ellipse(-14, -10, 16, 13, c1, 'transform="rotate(-20 -14 -10)"')
            + ellipse(14, -10, 16, 13, c2, 'transform="rotate(20 14 -10)"')
            + ellipse(-10, 9, 10, 8, c2) + ellipse(10, 9, 10, 8, c1)
            + ellipse(0, 0, 3.5, 14, '#5b4a7a')
            + '<path d="M-2 -13 q -6 -10 -10 -12 M2 -13 q 6 -10 10 -12" stroke="#5b4a7a" stroke-width="2" fill="none"/>'
            + '</g>')

def wing(x, y, scale, rainbow):
    fe = []
    for i in range(5):
        c = RAINBOW[i] if rainbow else ['#ffffff', '#f6f0ff', '#efe6ff', '#f6f0ff', '#ffffff'][i]
        a = -70 + i * 22
        fe.append(ellipse(0, -60, 22, 70, c, f'transform="rotate({a} 0 0)" stroke="#d9c8f5" stroke-width="2"'))
    return f'<g transform="translate({x},{y}) scale({scale})">' + ''.join(fe[::-1]) + '</g>'

def pegasus_foal():
    return ('<g transform="translate(14,300) scale(0.42)">'
            + wing(170, 230, 0.8, False)
            + ''.join(rect(x, 300, 24, 120, '#f3eeff', 'rx="10"') for x in (140, 180, 280, 310))
            + ellipse(230, 300, 105, 66, '#ffffff', 'stroke="#e6dcfa" stroke-width="3"')
            + path('M290 290 L 330 210', 'none', 'stroke="#ffffff" stroke-width="56" stroke-linecap="round"')
            + ellipse(345, 205, 60, 54, '#ffffff', 'stroke="#e6dcfa" stroke-width="3"')
            + ellipse(352, 198, 13, 17, '#3a2b5c') + circle(357, 192, 5, '#fff')
            + ''.join(circle(300 - i * 8, 160 + i * 24, 22, '#ffd1ea') for i in range(5))
            + '</g>')

def build(L):
    defs = BLUR + radgrad('aura', [(0, '#ffffff', 0.95), (0.45, '#ffd6f2', 0.6), (1, '#c7b0ff', 0)]) + \
        radgrad('moon', [(0, '#e8f2ff', 0.8), (1, '#e8f2ff', 0)]) + \
        lingrad('horn', [(0, '#ffe08a'), (0.5, '#ffb3d9'), (1, '#b5d8ff')], 0, 1, 0, 0)
    s = 0.78 + (L - 1) * 0.02
    out = [ellipse(250, 470, 120 * s, 13, '#000', 'opacity="0.13"')]
    if L >= 12:
        out.append(circle(256, 270, 240, 'url(#aura)'))
    if L >= 9:
        out.append(circle(250, 270, 210, 'url(#moon)'))
    g = []
    if L >= 10:
        g.append(wing(220, 270, 1.35, True))
    # tail
    if L >= 5:
        for i, c in enumerate(RAINBOW):
            g.append(path(f'M135 {290 + i*4} C 60 {300 + i*6}, 110 {380 + i*8}, {60 + i*6} {430 + i*4}', 'none',
                          f'stroke="{c}" stroke-width="13" stroke-linecap="round"'))
    else:
        for (x, y, r) in [(128, 292, 22), (110, 316, 20), (104, 344, 18), (112, 368, 15)]:
            g.append(circle(x, y, r, PINK))
    # far legs
    g.append(rect(160, 330, 30, 125, shade(COAT, 0.9), 'rx="13"'))
    g.append(rect(290, 330, 30, 125, shade(COAT, 0.9), 'rx="13"'))
    g.append(rect(160, 438, 30, 18, shade(HOOF, 0.9), 'rx="7"'))
    g.append(rect(290, 438, 30, 18, shade(HOOF, 0.9), 'rx="7"'))
    # body
    g.append(ellipse(230, 315, 108, 72, COAT, 'stroke="#d9c8f5" stroke-width="3"'))
    g.append(ellipse(210, 295, 60, 22, '#ffffff', 'opacity="0.5"'))
    # near legs
    for x in (190, 318):
        g.append(rect(x, 340, 32, 118, COAT, 'rx="14" stroke="#d9c8f5" stroke-width="3"'))
        g.append(rect(x, 440, 32, 20, HOOF, 'rx="8"'))
    if 8 <= L < 10:
        g.append(wing(225, 268, 0.75, False))
    if L >= 9:
        g.append(path('M170 262 Q 230 240 290 262 L 282 318 Q 230 334 178 318 Z', '#5b6fd6'))
        g.append(path('M170 262 Q 230 240 290 262', 'none', 'stroke="#f2c94c" stroke-width="5"'))
        g.append(path('M238 272 a 20 20 0 1 0 6 34 a 15 15 0 1 1 -6 -34 Z', '#ffe08a'))
    # neck + head
    g.append(path('M300 300 L 336 214', 'none', f'stroke="{COAT}" stroke-width="70" stroke-linecap="round"'))
    g.append(ellipse(350, 200, 64, 58, COAT, 'stroke="#d9c8f5" stroke-width="3"'))
    g.append(ellipse(400, 228, 36, 29, '#f8f2ff', 'stroke="#d9c8f5" stroke-width="3"'))
    g.append(ellipse(414, 226, 4, 3, '#b49ad6'))
    g.append(path('M398 246 q 10 6 20 0', 'none', 'stroke="#b0739a" stroke-width="3" stroke-linecap="round"'))
    g.append(ellipse(375, 228, 11, 7, '#ffb3c8', 'opacity="0.8"'))
    g.append(ellipse(356, 196, 15, 19, '#3a2b5c'))
    g.append(circle(361, 189, 6, '#ffffff')); g.append(circle(351, 204, 3, '#ffffff'))
    g.append(path('M342 180 l -8 -8 M350 176 l -4 -10 M359 176 l 0 -10', 'none', 'stroke="#3a2b5c" stroke-width="3" stroke-linecap="round"'))
    g.append(poly([(312, 160), (318, 118), (340, 150)], COAT, 'stroke="#d9c8f5" stroke-width="3"'))
    g.append(poly([(318, 154), (320, 128), (333, 150)], '#ffd1ea'))
    # mane
    n = 9 if L >= 11 else 7
    for i in range(n):
        c = RAINBOW[i % 6] if L >= 4 else PINK
        g.append(circle(306 - i * 7, 146 + i * 24, 24 - i * 0.6, c))
    g.append(circle(338, 140, 20, RAINBOW[0] if L >= 4 else PINK))
    if L >= 2:
        g.append(poly([(300, 150), (276, 136), (278, 166)], '#ff6fb3'))
        g.append(poly([(300, 150), (322, 132), (324, 164)], '#ff6fb3'))
        g.append(circle(300, 150, 7, '#ff3f9a'))
    if L >= 3:
        hl = 52 + (L - 3) * 2
        g.append(poly([(352, 146), (372 + hl * 0.3, 146 - hl), (374, 150)], 'url(#horn)', 'stroke="#f2c94c" stroke-width="2"'))
        for k in range(1, 4):
            yy = 146 - hl * k / 4
            g.append(f'<line x1="{354 + k*5}" y1="{yy + 6:.1f}" x2="{366 + k*4}" y2="{yy:.1f}" stroke="#ffffff" stroke-width="2"/>')
    if L >= 7:
        g.append(circle(352, 166, 14, '#fff3a6', 'opacity="0.6" filter="url(#blur3)"'))
        g.append(star(352, 166, 9, '#ffd84d'))
    if L >= 11:
        g.append(poly([(318, 132), (318, 110), (328, 120), (338, 104), (348, 120), (358, 110), (358, 132)], '#ffd84d', 'stroke="#d4a017" stroke-width="2"'))
    body = f'<g transform="translate(256,470) scale({s}) translate(-256,-470)">' + ''.join(g) + '</g>'
    out.append(body)
    if L >= 6:
        out.append(butterfly(110, 130, 1.2))
    if L >= 12:
        out.append(pegasus_foal())
    return svg(512, 512, ''.join(out), defs)
