"""Generate the Kernel Suite wordmarks from the Kernel Lab wordmark.

Keeps the pomegranate icon and the "kernel" lettering exactly as drawn in
deploy/assets/kernel-lab-wordmark-brass.svg and replaces the "LAB" line with
"SUITE", drawn in the same monoline geometric caps:
  cap height 509.50 -> 562.75 (53.25), stroke 8.4, butt ends,
  starting at x = 680 like LAB, with optical spacing between letters.

Writes:
  deploy/assets/kernel-suite-wordmark-cream.svg  (hero, on maroon)
  deploy/assets/kernel-suite-wordmark-brass.svg  (sticky nav, small use)

Run: python3 scripts/gen_suite_wordmark.py   (deterministic)
"""
import math, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "deploy" / "assets"
src = (ROOT / "kernel-lab-wordmark-brass.svg").read_text()
src = re.sub(r"<metadata>[\s\S]*?</metadata>", "", src)

TOP, BASE, SW = 509.50, 562.75, 8.4
H2 = SW / 2
f = lambda v: f"{v:.2f}"

def rect(x, y, w, h):
    return f"M{f(x)},{f(y)} L{f(x+w)},{f(y)} L{f(x+w)},{f(y+h)} L{f(x)},{f(y+h)}Z"

def ellipse_pts(cx, cy, rx, ry, a0, a1, n=48):
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]

def stroke(pts):
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)

fills, strokes = [], []

# S : two stacked bowls on a centre line, lower bowl a touch wider
x = 680.0; w = 40.0
yT, yB = TOP + H2, BASE - H2
mid = (yT + yB) / 2 - 0.6
cx = x + w / 2
rx1, ry1 = (w - SW) / 2 - 1.0, (mid - yT) / 2
rx2, ry2 = (w - SW) / 2, (yB - mid) / 2
top = ellipse_pts(cx, yT + ry1, rx1, ry1, -28, -270)        # upper right, over the top, round the left
bot = ellipse_pts(cx, mid + ry2, rx2, ry2, -90, 152)        # from the spine, round the right, to lower left
strokes.append(stroke(top + bot[1:]))

# U : stems joined by a half circle
x = 792.0; w = 44.0
r = (w - SW) / 2
cy = yB - r
strokes.append(stroke([(x + H2, TOP)] + ellipse_pts(x + H2 + r, cy, r, r, 180, 0)[0:] + [(x + w - H2, TOP)]))
# replace the first/last point of the arc path with the stems
strokes[-1] = stroke([(x + H2, TOP), (x + H2, cy)] + ellipse_pts(x + H2 + r, cy, r, r, 180, 0) + [(x + w - H2, cy), (x + w - H2, TOP)])

# I
x = 912.0
fills.append(rect(x, TOP, SW, BASE - TOP))

# T
x = 990.4; w = 42.0
fills.append(rect(x, TOP, w, SW))
fills.append(rect(x + (w - SW) / 2, TOP, SW, BASE - TOP))

# E
x = 1102.4; w = 34.0
fills.append(rect(x, TOP, SW, BASE - TOP))
fills.append(rect(x, TOP, w, SW))
fills.append(rect(x, (TOP + BASE) / 2 - H2, w - 3.5, SW))
fills.append(rect(x, BASE - SW, w, SW))

def suite_group(col):
    return (f'<g id="suite"><path fill="{col}" d="{" ".join(fills)}"/>'
            f'<path fill="none" stroke="{col}" stroke-width="{SW}" stroke-linecap="butt" stroke-linejoin="round" d="{" ".join(strokes)}"/></g>')

for name, col in [("cream", "#F4E9D8"), ("brass", "#D2AA5A")]:
    s = re.sub(r'<g id="lab"[\s\S]*?</g>', suite_group(col), src)
    s = s.replace('fill="#D2AA5A"', f'fill="{col}"')
    s = re.sub(r"<title>.*?</title>", f"<title>Kernel Suite wordmark, {name}</title>", s)
    if "<title>" not in s:
        s = s.replace(">", f"><title>Kernel Suite wordmark, {name}</title>", 1)
    out = ROOT / f"kernel-suite-wordmark-{name}.svg"
    out.write_text(s)
    print("wrote", out)

# Icon-only mark (pomegranate), maroon, for light backgrounds
icon = re.search(r'<g id="icon"[\s\S]*?</g>', src).group(0).replace('#D2AA5A', '#4A1A22')
mark = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="212 160 372 452" width="372" height="452">'
        '<title>Kernel Suite mark</title>' + icon + '</svg>\n')
(ROOT / "kernel-suite-mark-maroon.svg").write_text(mark)
print("wrote", ROOT / "kernel-suite-mark-maroon.svg")
