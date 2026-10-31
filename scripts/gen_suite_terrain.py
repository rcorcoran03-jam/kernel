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

r = np.hypot(uu - CU, (vv - CV) * 1.08)
ring = r + 0.9 * hills
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
minor, index = [], []
for li, segs in enumerate(cs.allsegs):
    for seg in segs:
        if len(seg) < 4:
            continue
        z = elev_at(seg[:, 0], seg[:, 1])
        sx, sy = project(seg[:, 0], seg[:, 1], z)
        pts = np.column_stack([sx, sy])
        keep = (pts[:, 0] > -200) & (pts[:, 0] < W + 200) & (pts[:, 1] > -200) & (pts[:, 1] < H + 200)
        if keep.sum() < 4:
            continue
        pts = simplify(pts)
        d = "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts)
        (index if li % 5 == 2 else minor).append(f'<path d="{d}"/>')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice">
<title>Kernel Suite terrain: concentric contour lines over soft relief</title>
<g fill="none" stroke="#D2AA5A" stroke-linecap="round" stroke-linejoin="round">
<g stroke-width="1.1" stroke-opacity="0.55">{"".join(minor)}</g>
<g stroke-width="2.1" stroke-opacity="0.95">{"".join(index)}</g>
</g>
</svg>
'''
out = Path(__file__).resolve().parent.parent / "deploy" / "assets" / "suite-terrain.svg"
out.write_text(svg)
print(f"wrote {out} ({len(svg)//1024} KB, {len(minor)} minor + {len(index)} index lines)")
