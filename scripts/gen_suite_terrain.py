"""Generate deploy/assets/suite-terrain.svg, the Kernel Suite hero background.

Drawn from three references Ryan shared: deep red concentric rings, a dotted
wireframe landscape seen at an angle, and soft blush topographic relief.

How it is built:
- A ring field: distance from a core point, warped by a few slow sine
  "hills" so the circles bend like contour lines around terrain.
- An elevation field: a gentle rise toward the core plus the same hills,
  used to lift each line off the ground plane (the relief).
- Contours of the ring field are traced on a grid, then projected through a
  tilted camera, so near rings open wide and far rings compress toward the
  horizon (the perspective skew).
- Every fifth contour is an index line, drawn heavier, as on a topo map.
- Like the Lab labyrinth, each line is broken into short runs whose opacity
  and weight follow a smooth 2D noise: lines thin, shimmer, turn to dotted
  stretches and dissolve entirely in places, so the field reads as natural
  terrain rather than a clean diagram. Small high-frequency wobble and
  uneven contour spacing loosen it further.

Colour, fading and the halo behind the text are handled in suite.css, so this
file is drawn at full strength in a single gold.

Run: python3 scripts/gen_suite_terrain.py   (deterministic)
"""
import math
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

rng = np.random.default_rng(11)
W, H = 2400, 1500                     # output viewBox
N = 1100                              # grid resolution
U = np.linspace(-5.0, 5.0, N)         # across
V = np.linspace(-3.0, 8.0, N)         # into the distance
uu, vv = np.meshgrid(U, V)

CU, CV = 0.05, 0.95                   # the core, slightly behind centre

# slow hills shared by the ring warp and the elevation
hills = np.zeros_like(uu)
for _ in range(6):
    k = rng.uniform(0.55, 1.6)
    a = rng.uniform(0, math.pi)
    ph = rng.uniform(0, 2 * math.pi)
    amp = rng.uniform(0.05, 0.11) / k
    hills += amp * np.sin(k * (uu * math.cos(a) + vv * math.sin(a)) * 2.2 + ph)
# a few soft mounds and hollows
for _ in range(5):
    mu, mv = rng.uniform(-2.6, 2.6), rng.uniform(-1.6, 3.6)
    s = rng.uniform(0.35, 0.8)
    hills += rng.choice([-1, 1]) * rng.uniform(0.06, 0.13) * np.exp(-((uu - mu) ** 2 + (vv - mv) ** 2) / (2 * s * s))

# fine wobble: short, irregular wiggles so contours aren't perfectly smooth
wob = np.zeros_like(uu)
for _ in range(7):
    k = rng.uniform(3.5, 8.0)
    a = rng.uniform(0, math.pi)
    ph = rng.uniform(0, 2 * math.pi)
    wob += rng.uniform(0.004, 0.011) * np.sin(k * (uu * math.cos(a) + vv * math.sin(a)) + ph)

r = np.hypot(uu - CU, (vv - CV) * 1.08)
ring = r + 0.9 * hills + wob
elev = 0.34 * np.exp(-r ** 2 / 1.6) + 0.55 * hills   # rise at the core + relief

# camera
tilt = math.radians(52)               # angle looking down onto the plane
D0, F = 3.1, 1180.0
def project(u, v, z):
    y = v * math.sin(tilt) + z * math.cos(tilt)
    d = D0 + v * math.cos(tilt) - z * math.sin(tilt)
    return W / 2 + F * u / d, H * 0.57 - F * y / d

# trace contours of the ring field
step = 0.052
levels = np.arange(0.06, 8.5, step)
levels = np.sort(levels + rng.uniform(-0.32, 0.32, len(levels)) * step)   # uneven spacing
cs = plt.contour(uu, vv, ring, levels=levels)
elev_at = lambda u, v: elev[
    np.clip(((v - V[0]) / (V[-1] - V[0]) * (N - 1)).round().astype(int), 0, N - 1),
    np.clip(((u - U[0]) / (U[-1] - U[0]) * (N - 1)).round().astype(int), 0, N - 1)]

def simplify(pts, tol=0.7):
    """Ramer-Douglas-Peucker on an (n,2) array."""
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    ab = b - a
    n = np.hypot(*ab)
    if n == 0:
        dist = np.hypot(*(pts - a).T)
    else:
        dist = np.abs(ab[0] * (pts[:, 1] - a[1]) - ab[1] * (pts[:, 0] - a[0])) / n
    i = int(np.argmax(dist))
    if dist[i] > tol:
        return np.vstack([simplify(pts[: i + 1], tol)[:-1], simplify(pts[i:], tol)])
    return np.vstack([a, b])

f = lambda x: f"{x:.1f}"

# smooth 2D dissolve field over the ground plane (like the Lab NOISE rings)
DIS = [(rng.uniform(0.6, 1.0), rng.uniform(0.9, 3.2), rng.uniform(0, math.pi), rng.uniform(0, 2 * math.pi)) for _ in range(5)]
DOT = [(rng.uniform(1.2, 2.6), rng.uniform(0, math.pi), rng.uniform(0, 2 * math.pi)) for _ in range(2)]
def dissolve(u, v, li):
    t = sum(amp * np.cos(k * (u * math.cos(a) + v * math.sin(a)) + ph + li * 0.37) for amp, k, a, ph in DIS)
    return 0.5 + t / 6.0                                   # roughly 0..1
def dotted(u, v):
    return sum(np.cos(k * (u * math.cos(a) + v * math.sin(a)) + ph) for k, a, ph in DOT) / 2.0

# opacity / width buckets: faint stretches drop out, strong ones carry weight
BUCKETS = [(0.40, None), (0.52, (0.35, 0.55)), (0.64, (0.6, 0.8)), (0.78, (0.85, 1.0)), (9.0, (1.0, 1.15))]
def bucket(x):
    for i, (hi, _) in enumerate(BUCKETS):
        if x < hi:
            return i
    return len(BUCKETS) - 1

paths = []
for li, segs in enumerate(cs.allsegs):
    is_index = li % 5 == 2
    base_w, base_o = (2.0, 0.9) if is_index else (1.05, 0.55)
    for seg in segs:
        if len(seg) < 4:
            continue
        z = elev_at(seg[:, 0], seg[:, 1])
        sx, sy = project(seg[:, 0], seg[:, 1], z)
        pts = np.column_stack([sx, sy])
        inside = (pts[:, 0] > -150) & (pts[:, 0] < W + 150) & (pts[:, 1] > -150) & (pts[:, 1] < H + 150)
        dv = dissolve(seg[:, 0], seg[:, 1], li)
        dt = dotted(seg[:, 0], seg[:, 1])
        bk = np.array([bucket(x) for x in dv])
        bk[~inside] = 0
        # mid-strength stretches in the dotted zone become dotted runs
        style = np.where((bk >= 1) & (bk <= 2) & (dt > 0.55), 1, 0)
        key = bk * 2 + style
        start = 0
        for i in range(1, len(pts) + 1):
            if i == len(pts) or key[i] != key[start]:
                if bk[start] > 0 and i - start >= 3:
                    run = simplify(pts[start:i])
                    ow, oo = BUCKETS[bk[start]][1]
                    d = "M" + " L".join(f"{f(x)} {f(y)}" for x, y in run)
                    if style[start]:
                        paths.append(f'<path d="{d}" stroke-width="{base_w*1.5:.2f}" stroke-opacity="{base_o*oo*1.1:.2f}" stroke-dasharray="0.1 7"/>')
                    else:
                        paths.append(f'<path d="{d}" stroke-width="{base_w*ow:.2f}" stroke-opacity="{base_o*oo:.2f}"/>')
                start = i

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice">
<title>Kernel Suite terrain: concentric contour lines over soft relief</title>
<g fill="none" stroke="#D2AA5A" stroke-linecap="round" stroke-linejoin="round">
{"".join(paths)}
</g>
</svg>
'''
out = Path(__file__).resolve().parent.parent / "deploy" / "assets" / "suite-terrain.svg"
out.write_text(svg)
print(f"wrote {out} ({len(svg)//1024} KB, {len(paths)} runs)")
