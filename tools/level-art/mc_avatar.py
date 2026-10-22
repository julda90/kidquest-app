from common import *

SKIN = '#f1c27d'
HAIR = '#6b3e1f'
TUNIC = '#8b5a2b'
TROUSERS = '#5c3b1e'
PICK = {1: '#a0703c', 2: '#8e8e8e', 3: '#dcdcdc', 4: '#dcdcdc', 5: '#f5c542', 6: '#f5c542',
        7: '#4fe3ec', 8: '#4fe3ec', 9: '#4fe3ec', 10: '#4a3f4a', 11: '#4a3f4a', 12: '#4a3f4a'}

def armor(L):
    if L >= 12: return dict(body='#f2d675', trim='#ffffff', helm='#f2d675', full=True)
    if L >= 10: return dict(body='#3a3340', trim='#ff7a1a', helm='#3a3340', full=True)
    if L >= 6:
        return dict(body='#cfd4da', trim='#3fe0e8' if L >= 7 else None,
                    helm='#4fe3ec' if L >= 8 else '#cfd4da', full=True)
    if L >= 4: return dict(body=None, vest='#8a4f22', helm='#a0612b', full=False)
    return None

def pickaxe(L, hx_, hy):
    c = PICK[L]
    blocks = [(-63, -132), (-45, -148), (-27, -158), (-9, -162), (9, -158), (27, -148), (45, -132)]
    head = ''.join(cube(x, y, 18, 18, c, d=6) for x, y in blocks)
    glow = ''
    if L >= 10:
        glow = ellipse(-9, -150, 80, 40, '#ff6a00', 'opacity="0.55" filter="url(#blur20)"')
        head += ''.join(rect(x + 5, y + 6, 7, 6, '#ff8a1a') for x, y in blocks[1::2])
    if L in (5, 6):
        head += star(30, -165, 9, '#ffffff')
    if L in (7, 8, 9):
        head += star(-40, -165, 8, '#ffffff', extra='opacity="0.9"')
    handle = cube(-7, -150, 14, 175, '#7a4a1f', d=6)
    return f'<g transform="translate({hx_},{hy}) rotate(28)">{glow}{handle}{head}</g>'

def face():
    rows = ["HHHHHHHH", "HHHHHHHH", "HSSSSSSH", "SSSSSSSS", "SWESSEWS", "SSSSSSSS", "SSMSSMSS", "SSSMMSSS"]
    return rows

def wolf():
    W = '#e4e4e4'
    p = [
        cube(42, 392, 34, 56, W, d=10),          # back leg
        cube(110, 392, 26, 56, W, d=10),         # front leg
        cube(30, 352, 112, 46, W, d=18),         # body
        cube(12, 330, 20, 46, W, d=8),           # tail (up)
        cube(128, 318, 52, 50, W, d=16),         # head
        cube(134, 300, 12, 18, W, d=6), cube(162, 300, 12, 18, W, d=6),  # ears
        cube(176, 340, 22, 22, '#cfcfcf', d=6),  # snout
        rect(194, 343, 7, 7, '#222'),            # nose
        rect(146, 330, 8, 8, '#222'), rect(166, 330, 8, 8, '#222'),
        rect(128, 362, 52, 8, '#d23b3b'),        # collar
        ellipse(100, 456, 80, 10, '#000', 'opacity="0.15"'),
    ]
    return ''.join(p)

def parrot(x, y):
    return ''.join([
        cube(x, y, 30, 34, '#e23c2f', d=8),
        cube(x + 4, y + 14, 22, 18, '#2f6fe2', d=6),
        cube(x + 22, y + 4, 12, 10, '#f5c542', d=4),
        rect(x + 8, y + 6, 6, 6, '#111'),
        cube(x - 8, y + 30, 14, 20, '#2fb34f', d=4),
    ])

def dragon(x, y):
    P = '#8a5cd6'
    return ''.join([
        poly([(x + 8, y + 10), (x - 30, y - 22), (x - 16, y + 4), (x - 36, y + 2), (x + 4, y + 24)], shade(P, 1.3)),
        cube(x, y, 40, 34, P, d=10),
        cube(x + 30, y - 22, 30, 28, P, d=8),
        cube(x + 34, y - 34, 8, 12, '#f5c542', d=3), cube(x + 48, y - 34, 8, 12, '#f5c542', d=3),
        rect(x + 46, y - 14, 6, 6, '#111'),
        rect(x + 4, y + 22, 32, 8, shade(P, 1.5)),
        cube(x - 18, y + 22, 20, 10, P, d=4),
    ])

def wings(c='#bfe2ff'):
    out = []
    cols = [(0, 150, 300), (34, 118, 284), (68, 92, 256), (102, 76, 222), (136, 70, 186), (170, 78, 146)]
    for side in (-1, 1):
        for i, (dx, top, bot) in enumerate(cols):
            x = (206 - 40 - dx - 34) if side < 0 else (306 + 40 + dx)
            col = shade(c, 1 - i * 0.05)
            out.append(cube(x, top, 34, bot - top, col, d=8))
            out.append(rect(x, bot - 22, 34, 22, shade(col, 1.35)))
    return ''.join(out)

def build(L):
    a = armor(L)
    lift = -24 if L >= 11 else 0
    p = []
    defs = BLUR + radgrad('gold', [(0, '#fff3b0', 0.95), (0.5, '#ffd34d', 0.45), (1, '#ffd34d', 0)])
    p.append(ellipse(256, 478, 120 if lift == 0 else 80, 16, '#000', f'opacity="{0.18 if lift == 0 else 0.1}"'))
    g = []
    if L >= 12:
        g.append(circle(256, 230, 230, 'url(#gold)'))
    if L >= 11:
        g.append(wings())
    if L >= 9:
        # bow behind the back + backpack + map roll
        g.append(path('M150 110 Q 70 260 190 420', 'none', 'stroke="#7a4a1f" stroke-width="12" stroke-linecap="round"'))
        g.append('<line x1="150" y1="110" x2="190" y2="420" stroke="#eee" stroke-width="3"/>')
        g.append(cube(318, 178, 30, 90, '#7b5a35', d=10))
        g.append(cube(322, 120, 22, 70, '#efe3c2', d=8))
        g.append(rect(322, 140, 22, 8, '#c0392b'))

    body_c = a['body'] if a and a.get('body') else TUNIC
    leg_c = a['body'] if a and a.get('full') else TROUSERS
    arm_c = body_c
    X, Y = 206, 170
    # legs
    g.append(cube(X, 290, 50, 115, leg_c, d=16))
    g.append(cube(X + 50, 290, 50, 115, shade(leg_c, 0.95), d=16))
    g.append(rect(X, 385, 100, 20, '#3b2a1a'))  # boots
    # left arm (viewer left)
    g.append(cube(X - 46, Y, 46, 120, arm_c, d=14))
    g.append(rect(X - 46, Y + 98, 46, 22, SKIN))
    # body
    g.append(cube(X, Y, 100, 120, body_c, d=16))
    g.append(rect(X, Y + 96, 100, 12, '#3b2a1a'))  # belt
    g.append(rect(X + 42, Y + 96, 16, 12, '#c9a227'))
    if a and a.get('vest'):
        g.append(rect(X + 6, Y + 6, 30, 88, a['vest']))
        g.append(rect(X + 64, Y + 6, 30, 88, a['vest']))
    if a and a.get('trim'):
        t = a['trim']
        g.append(rect(X, Y, 100, 8, t)); g.append(rect(X + 46, Y + 8, 8, 88, t))
        g.append(rect(X, 290, 100, 6, t))
    if L >= 9:
        g.append(rect(X + 14, Y, 12, 96, '#5a3d22')); g.append(rect(X + 74, Y, 12, 96, '#5a3d22'))
    # right arm
    g.append(cube(X + 100, Y, 46, 120, shade(arm_c, 0.93), d=14))
    g.append(rect(X + 100, Y + 98, 46, 22, SKIN))
    # head
    HX, HY = 206, 64
    g.append(cube(HX, HY, 100, 100, SKIN, d=18, top=HAIR, side=shade(SKIN, 0.75)))
    g.append(pix(HX, HY, 12.5, face(), {'H': HAIR, 'S': None, 'W': '#ffffff', 'E': '#2e8b57', 'M': '#8a4a3a'}))
    g.append(poly([(HX + 100, HY), (HX + 118, HY - 11.7), (HX + 118, HY + 14), (HX + 100, HY + 25)], shade(HAIR, 0.8)))
    if a:
        hc = a['helm']
        g.append(cube(HX - 6, HY - 10, 112, 34, hc, d=20))
        g.append(rect(HX - 6, HY + 24, 12, 30, hc)); g.append(rect(HX + 94, HY + 24, 12, 30, hc))
        if L >= 10 and L < 12:
            g.append(rect(HX - 6, HY + 14, 112, 6, '#ff7a1a'))
    if L >= 12:
        crown = [(HX + 4, HY - 12), (HX + 4, HY - 46), (HX + 26, HY - 28), (HX + 50, HY - 56), (HX + 74, HY - 28), (HX + 96, HY - 46), (HX + 96, HY - 12)]
        g.append(poly(crown, '#f5c542', 'stroke="#c99a12" stroke-width="3"'))
        g.append(circle(HX + 50, HY - 30, 7, '#e23c2f'))
    if L >= 3:
        # torch on belt
        g.append(cube(X + 4, Y + 70, 10, 46, '#7a4a1f', d=4))
        g.append(cube(X + 1, Y + 58, 16, 14, '#ffb52e', d=5))
        g.append(ellipse(X + 9, Y + 60, 18, 18, '#ffd36b', 'opacity="0.45" filter="url(#blur8)"'))
    if L >= 8:
        sc = '#3fb6c8' if L < 10 else ('#5a4a60' if L < 12 else '#f5d77a')
        g.append(cube(X - 74, Y + 30, 62, 84, sc, d=10))
        g.append(rect(X - 74, Y + 30, 62, 84, 'none', 'stroke="#9aa3ad" stroke-width="5"'))
        g.append(pix(X - 56, Y + 54, 9, ["..D..", ".DDD.", "DDDDD", ".DDD.", "..D.."], {'D': '#ffffff'}))
    g.append(pickaxe(L, X + 123, Y + 112))
    if L >= 9:
        g.append(parrot(X + 104, Y - 34))
    if L >= 12:
        g.append(dragon(X - 70, Y - 26))
    if L >= 6:
        p.append(wolf())
    p.append(f'<g transform="translate(0,{lift})">' + ''.join(g) + '</g>')
    return svg(512, 512, ''.join(p), defs)
