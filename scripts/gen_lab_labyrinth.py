"""Generate deploy/assets/lab-labyrinth.svg, the Kernel Lab hero background.

Drawn from three references Ryan shared: a classical circular labyrinth
(walls split by a cross, paths doubling back in hairpin turns), an Art Deco
gold lattice (stepped square frames, double-line bands along the axes), and a
nested-diamond labyrinth panel.

Layers, back to front:
- Deco lattice: thin vertical/horizontal rules near the edges.
- Diamond frame: double-line rotated square crossing the outer rings.
- Stepped square frame: double line with notched (ziggurat) corners.
- Axis bands: double rules continuing the labyrinth's cross out to the edge.
- Labyrinth: concentric walls split into quadrants by a cross corridor.
  At each axis, most walls pair up into hairpin U-turns; two or three
  cross straight through, which is what makes it a maze.
- Fine sunburst ticks just outside the outer wall.
- Six connection points: small gold diamonds with a soft glow on six of the
  hairpin turns, spread around the rings.

Lightness and fading are handled in lab.css (opacity, radial mask, and a
bottom fade), so this file is drawn at full strength.

Run: python3 scripts/gen_lab_labyrinth.py   (deterministic)
"""
import math, random
from pathlib import Path

random.seed(5)
S = 1800
CX = CY = S / 2
f = lambda v: f"{v:.1f}"

def pol(r, a):
    t = math.radians(a)
    return CX + r * math.cos(t), CY + r * math.sin(t)

def arc(r, a0, a1, sw, op):
    x0, y0 = pol(r, a0); x1, y1 = pol(r, a1)
    large = 1 if (a1 - a0) > 180 else 0
    return (f'<path d="M{f(x0)} {f(y0)} A{f(r)} {f(r)} 0 {large} 1 {f(x1)} {f(y1)}" '
            f'stroke-width="{sw}" stroke-opacity="{op:.2f}"/>')

def seg(x0, y0, x1, y1, sw, op):
    return (f'<line x1="{f(x0)}" y1="{f(y0)}" x2="{f(x1)}" y2="{f(y1)}" '
            f'stroke-width="{sw}" stroke-opacity="{op:.2f}"/>')

def poly(pts, sw, op, close=True):
    d = "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + ("Z" if close else "")
    return f'<path d="{d}" stroke-width="{sw}" stroke-opacity="{op:.2f}"/>'

def diamond(x, y, s, op=1.0):
    return (f'<path d="M{f(x)} {f(y-s)} L{f(x+s*0.62)} {f(y)} L{f(x)} {f(y+s)} '
            f'L{f(x-s*0.62)} {f(y)}Z" fill-opacity="{op:.2f}"/>')

deco, maze, nodes, glows = [], [], [], []

# ---------------------------------------------------------------- deco lattice
for d, sw, op in [(800, 0.6, 0.35), (836, 1.1, 0.5), (848, 0.5, 0.3)]:
    for s in (-1, 1):
        deco.append(seg(CX + s * d, 0, CX + s * d, S, sw, op))
        deco.append(seg(0, CY + s * d, S, CY + s * d, sw, op))

# ---------------------------------------------------------------- diamond frame
for hd, sw, op in [(880, 1.3, 0.75), (900, 0.6, 0.45), (620, 0.6, 0.3)]:
    pts = [(CX + hd, CY), (CX, CY + hd), (CX - hd, CY), (CX, CY - hd)]
    deco.append(poly(pts, sw, op))

# ---------------------------------------------------------------- stepped square frame
def stepped_square(h, step, n, sw, op):
    """Square with ziggurat (stepped) corners, Art Deco style."""
    tr = [(h - n * step, -h)]
    for k in range(n):
        x = h - (n - k) * step
        tr += [(x, -h + (k + 1) * step), (x + step, -h + (k + 1) * step)]
    pts = []
    for q in range(4):                      # rotate the corner 90 deg each time
        for x, y in tr:
            for _ in range(q):
                x, y = -y, x
            pts.append((x, y))
    return poly([(CX + x, CY + y) for x, y in pts], sw, op)

deco.append(stepped_square(742, 16, 3, 1.5, 0.8))
deco.append(stepped_square(756, 16, 3, 0.6, 0.5))
deco.append(stepped_square(712, 0.001, 0, 0.5, 0.25))

# ---------------------------------------------------------------- axis bands
CORR = 24                                            # half-width of the cross
for a in (0, 90, 180, 270):
    for off, sw, op in [(CORR, 1.2, 0.75), (CORR + 12, 0.6, 0.45)]:
        for s in (-1, 1):
            # parallel to the axis, offset sideways
            r0, r1 = 712, 900
            t = math.radians(a); nx, ny = -math.sin(t) * s * off, math.cos(t) * s * off
            x0, y0 = pol(r0, a); x1, y1 = pol(r1, a)
            deco.append(seg(x0 + nx, y0 + ny, x1 + nx, y1 + ny, sw, op))
    # stepped terminal box where the band meets the frame
    t = math.radians(a)
    for k, (w, rr) in enumerate([(CORR + 30, 770), (CORR + 20, 790)]):
        ux, uy = math.cos(t), math.sin(t); vx, vy = -uy, ux
        cx, cy = CX + ux * rr, CY + uy * rr
        pts = [(cx + vx * w - ux * 10, cy + vy * w - uy * 10), (cx + vx * w + ux * 10, cy + vy * w + uy * 10),
               (cx - vx * w + ux * 10, cy - vy * w + uy * 10), (cx - vx * w - ux * 10, cy - vy * w - uy * 10)]
        deco.append(poly(pts, 0.9 if k == 0 else 0.6, 0.6 if k == 0 else 0.4))

# ---------------------------------------------------------------- labyrinth
WALLS = list(range(180, 691, 30))                    # 180 .. 690
AXES = (0, 90, 180, 270)
g = lambda r: math.degrees(CORR / r)

crosses = {}
pairs = {}
for k, a in enumerate(AXES):
    idx = list(range(len(WALLS)))
    cross = set(random.sample(idx[2:], 3))
    crosses[a] = cross
    rest = [i for i in idx if i not in cross]
    ps, i = [], (k % 2)
    while i < len(rest) - 1:
        if rest[i + 1] == rest[i] + 1:
            ps.append((rest[i], rest[i + 1])); i += 2
        else:
            i += 1
    pairs[a] = ps

def weight(i):
    r = WALLS[i]
    if r in (330, 510, 690):
        return 1.8, 0.8
    return 0.9, 0.62

# smooth per-ring noise: each wall shimmers, thins and dissolves in places
NOISE = {}
for i in range(len(WALLS)):
    NOISE[i] = [(random.uniform(0.6, 1.0), random.randint(2, 5), random.uniform(0, 360)) for _ in range(3)]

def noise(i, a):
    v = sum(amp * math.cos(math.radians(a * fr + ph)) for amp, fr, ph in NOISE[i])
    return 0.5 + v / 5.2                               # roughly 0..1

def wall_arc(i, r, a0, a1, sw, op):
    """Arc split into short pieces; opacity/width follow the noise and the
    faintest stretches drop out entirely."""
    out, step = [], 2.5
    n = max(1, int((a1 - a0) / step))
    for k in range(n):
        b0 = a0 + (a1 - a0) * k / n; b1 = a0 + (a1 - a0) * (k + 1) / n
        v = noise(i, (b0 + b1) / 2)
        if v < 0.38:
            continue
        o = op * min(1.0, 0.15 + v * 0.85)
        out.append(arc(r, b0, b1 + 0.15, round(sw * (0.55 + v * 0.7), 2), o))
    return out

JIT = {(i, a): random.uniform(-12, 12) / WALLS[i] * 57.3 for i in range(len(WALLS)) for a in AXES}

for i, r in enumerate(WALLS):
    sw, op = weight(i)
    for q in range(4):
        a0 = AXES[q] + JIT[(i, AXES[q])]
        a1 = AXES[q] + 90 + JIT[(i, AXES[(q + 1) % 4])]
        s0 = 0 if i in crosses[AXES[q]] else g(r)
        s1 = 0 if i in crosses[AXES[(q + 1) % 4]] else g(r)
        maze += wall_arc(i, r, a0 + s0, a1 - s1, sw, op)
    if r in (330, 510, 690):                         # deco pinstripe
        for q in range(4):
            maze += wall_arc(i, r + 7, AXES[q] + g(r) + 1.5, AXES[q] + 90 - g(r) - 1.5, 0.5, 0.45)

caps = []
for a in AXES:
    t = math.radians(a)
    for i, j in pairs[a]:
        r0, r1 = WALLS[i], WALLS[j]
        for s in (-1, 1):
            if random.random() < 0.3:                 # some turns simply fade away
                continue
            A = pol(r0, a + JIT[(i, a)] + s * g(r0)); B = pol(r1, a + JIT[(j, a)] + s * g(r1))
            dx, dy = -(-math.sin(t)) * s, -(math.cos(t)) * s   # toward the axis
            k = 20
            sw = max(weight(i)[0], weight(j)[0]) * 0.9
            v = (noise(i, a + s * g(r0)) + noise(j, a + s * g(r1))) / 2
            if v < 0.32:
                continue
            cop = 0.85 * min(1.0, 0.2 + v)
            maze.append(f'<path d="M{f(A[0])} {f(A[1])} C{f(A[0]+dx*k)} {f(A[1]+dy*k)} '
                        f'{f(B[0]+dx*k)} {f(B[1]+dy*k)} {f(B[0])} {f(B[1])}" '
                        f'stroke-width="{sw:.2f}" stroke-opacity="{cop:.2f}"/>')
            apex = ((A[0] + B[0]) / 2 + dx * 15, (A[1] + B[1]) / 2 + dy * 15)
            caps.append((a, s, (r0 + r1) / 2, apex))

# fine sunburst ticks just outside the outer wall
for k in range(120):
    a = k * 3
    if any(abs(((a - ax + 180) % 360) - 180) < 5 for ax in AXES):
        continue
    long_ = k % 3 == 0
    x0, y0 = pol(697, a); x1, y1 = pol(712 if long_ else 704, a)
    deco.append(seg(x0, y0, x1, y1, 0.7 if long_ else 0.5, 0.6 if long_ else 0.4))


# ---------------------------------------------------------------- deco woven into the rings
weave = []
# nested stepped squares and diamonds inside the labyrinth, fainter as they shrink
for h, op in [(600, 0.55), (520, 0.42), (440, 0.28), (360, 0.15)]:
    sq = stepped_square(h, 14, 2, 0.7, op)
    weave.append(sq)
for hd, op in [(560, 0.42), (470, 0.28), (380, 0.14)]:
    weave.append(poly([(CX + hd, CY), (CX, CY + hd), (CX - hd, CY), (CX, CY - hd)], 0.6, op))
# diagonal double bands (the deco cross, turned 45 deg), fading inward
grads = []
for n, a in enumerate((45, 135, 225, 315)):
    t = math.radians(a)
    for off, sw in [(10, 0.9), (20, 0.5), (-10, 0.9), (-20, 0.5)]:
        nx, ny = -math.sin(t) * off, math.cos(t) * off
        x0, y0 = pol(250, a); x1, y1 = pol(1000, a)
        gid = f"dg{n}"
        weave.append(f'<line x1="{f(x0+nx)}" y1="{f(y0+ny)}" x2="{f(x1+nx)}" y2="{f(y1+ny)}" '
                     f'stroke="url(#{gid})" stroke-width="{sw}"/>')
    gx0, gy0 = pol(250, a); gx1, gy1 = pol(760, a)
    grads.append(f'<linearGradient id="dg{n}" gradientUnits="userSpaceOnUse" x1="{f(gx0)}" y1="{f(gy0)}" '
                 f'x2="{f(gx1)}" y2="{f(gy1)}"><stop offset="0" stop-color="#D2AA5A" stop-opacity="0"/>'
                 f'<stop offset="1" stop-color="#E2BD72" stop-opacity="0.75"/></linearGradient>')
# stepped chevrons riding the diagonals, like a deco fan, smaller toward centre
for a in (45, 135, 225, 315):
    for rr in (420, 500, 580, 660):
        w = rr * 0.06; op = 0.12 + (rr - 420) / 240 * 0.3
        t = math.radians(a); ux, uy = math.cos(t), math.sin(t); vx, vy = -uy, ux
        cx, cy = CX + ux * rr, CY + uy * rr
        pts = [(cx + vx * w - ux * w * 0.7, cy + vy * w - uy * w * 0.7), (cx, cy),
               (cx - vx * w - ux * w * 0.7, cy - vy * w - uy * w * 0.7)]
        weave.append(poly(pts, 0.7, op, close=False))
# fine radial ticks on a middle ring
for k in range(72):
    a = k * 5
    if any(abs(((a - ax + 180) % 360) - 180) < 6 for ax in AXES):
        continue
    x0, y0 = pol(436, a); x1, y1 = pol(446 if k % 2 else 452, a)
    weave.append(seg(x0, y0, x1, y1, 0.5, 0.25))

# ---------------------------------------------------------------- six connection points
# six hairpins spread around: each (axis, side, ring band) chosen by hand
want = [(0, -1, 600), (90, 1, 450), (180, 1, 660), (270, -1, 420), (270, 1, 570), (90, -1, 630)]
chosen = []
for wa, ws, wr in want:
    opts = [c for c in caps if c[0] == wa and c[1] == ws]
    if opts:
        chosen.append(min(opts, key=lambda c: abs(c[2] - wr))[3])
for x, y in chosen:
    glows.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="40" fill="url(#glow)"/>')
    nodes.append(diamond(x, y, 4.4, 0.95))

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}">
<defs>
  <linearGradient id="gold" gradientUnits="userSpaceOnUse" x1="0" y1="{S}" x2="{S}" y2="0">
    <stop offset="0" stop-color="#A97F38"/><stop offset="0.26" stop-color="#D2AA5A"/>
    <stop offset="0.45" stop-color="#F3D58C"/><stop offset="0.6" stop-color="#C7963F"/>
    <stop offset="0.78" stop-color="#EBC677"/><stop offset="1" stop-color="#B58A3C"/>
  </linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#F6DC98" stop-opacity="0.4"/>
    <stop offset="0.4" stop-color="#E2BD72" stop-opacity="0.12"/><stop offset="1" stop-color="#E2BD72" stop-opacity="0"/></radialGradient>
  {''.join(grads)}
</defs>
<g fill="none" stroke="url(#gold)" stroke-linecap="square">{''.join(deco)}</g>
<g fill="none" stroke="url(#gold)" stroke-linecap="square">{''.join(weave)}</g>
<g>{''.join(glows)}</g>
<g fill="none" stroke="url(#gold)" stroke-linecap="round">{''.join(maze)}</g>
<g fill="url(#gold)">{''.join(nodes)}</g>
</svg>
'''
dst = Path(__file__).resolve().parent.parent / "deploy/assets/lab-labyrinth.svg"
dst.write_text(svg)
print(dst, len(svg) // 1024, "KB")
