import random

def hx(c):
    c = c.lstrip('#')
    return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))

def shade(c, f):
    r, g, b = hx(c)
    if f >= 1:
        t = f - 1
        r, g, b = [int(v + (255 - v) * t) for v in (r, g, b)]
    else:
        r, g, b = [int(v * f) for v in (r, g, b)]
    return '#%02x%02x%02x' % (max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b)))

def rect(x, y, w, h, fill, extra=''):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" {extra}/>'

def poly(pts, fill, extra=''):
    p = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    return f'<polygon points="{p}" fill="{fill}" {extra}/>'

def circle(cx, cy, r, fill, extra=''):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" {extra}/>'

def ellipse(cx, cy, rx, ry, fill, extra=''):
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" {extra}/>'

def path(d, fill, extra=''):
    return f'<path d="{d}" fill="{fill}" {extra}/>'

def cube(x, y, w, h, fill, d=14, top=None, side=None):
    """Pseudo-isometric block: front face + top + right side."""
    dx, dy = d, d * 0.65
    t = top or shade(fill, 1.25)
    s = side or shade(fill, 0.72)
    return ''.join([
        poly([(x, y), (x + dx, y - dy), (x + w + dx, y - dy), (x + w, y)], t),
        poly([(x + w, y), (x + w + dx, y - dy), (x + w + dx, y + h - dy), (x + w, y + h)], s),
        rect(x, y, w, h, fill),
    ])

def pix(x0, y0, size, rows, pal):
    out = []
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch in pal and pal[ch]:
                out.append(rect(x0 + i * size, y0 + j * size, size + 0.4, size + 0.4, pal[ch]))
    return ''.join(out)

def svg(w, h, body, defs=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<defs>{defs}</defs>{body}</svg>')

def lingrad(id_, stops, x1=0, y1=0, x2=0, y2=1):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in
                [(st + (1,))[:3] if len(st) == 2 else st for st in stops])
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'

def radgrad(id_, stops):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in
                [(st + (1,))[:3] if len(st) == 2 else st for st in stops])
    return f'<radialGradient id="{id_}">{s}</radialGradient>'

BLUR = ('<filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>'
        '<filter id="blur20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>'
        '<filter id="blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>')

def snowflake(cx, cy, r, color='#ffffff', sw=2.5, opacity=1):
    out = []
    import math
    for k in range(6):
        a = math.pi / 3 * k
        x2, y2 = cx + r * math.cos(a), cy + r * math.sin(a)
        out.append(f'<line x1="{cx:.1f}" y1="{cy:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/>')
        bx, by = cx + r * 0.6 * math.cos(a), cy + r * 0.6 * math.sin(a)
        for s in (-1, 1):
            a2 = a + s * 0.6
            out.append(f'<line x1="{bx:.1f}" y1="{by:.1f}" x2="{bx + r*0.3*math.cos(a2):.1f}" y2="{by + r*0.3*math.sin(a2):.1f}" stroke="{color}" stroke-width="{sw*0.8}" stroke-linecap="round"/>')
    return f'<g opacity="{opacity}">' + ''.join(out) + '</g>'

def star(cx, cy, r, fill, points=5, inner=0.45, extra=''):
    import math
    pts = []
    for k in range(points * 2):
        rr = r if k % 2 == 0 else r * inner
        a = -math.pi / 2 + math.pi / points * k
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return poly(pts, fill, extra)
