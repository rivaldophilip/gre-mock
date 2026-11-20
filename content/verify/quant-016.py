"""Verify every key in content/tests/quant-016.json: each answer is computed here and compared with the key."""
from fractions import Fraction as F
import json
import math
import random
import re
from pathlib import Path

from keys import Keys

t = Keys("quant-016")
test = json.loads((Path(__file__).resolve().parents[2] / "content" / "tests" / "quant-016.json").read_text())
figs = {f["id"]: f for f in test["figures"]}
random.seed(16)

# s1q1: |x-2| = 5, |y-2| = 3; A = |x - y|, B = 2
t.qc("s1q1", [(abs(x - y), 2) for x in (7, -3) for y in (5, -1)])

# s1q2: -1 < x < 0; A = x^3 - x, B = x^2 - x^4
t.qc("s1q2", [(x**3 - x, x**2 - x**4) for x in (F(-n, 1000) for n in range(1, 1000))])

# s1q3: quadrilateral with angles 85, 97, x, y -> x + y = 360 - 182
t.qc("s1q3", [(360 - 85 - 97, 180)])

# s1q4: count integers n with n^4 < 10 n^2, against 7
t.qc("s1q4", [(sum(1 for n in range(-100, 101) if n**4 < 10 * n**2), 7)])

# s1q5: 2.5 cm on 3 ha -> metric tons
t.choice("s1q5", F(25, 1000) * 3 * 10000 * 1000 / 1000)

# s1q6: five consecutive odd integers; sum of 3 smallest = sum of 2 largest + 31
a = next(a for a in range(-201, 201, 2) if sum(a + 2 * i for i in range(3)) == sum(a + 2 * i for i in (3, 4)) + 31)
t.choice("s1q6", a + 8)

# s1q7: convex PQRS, P(0,0) Q(8,2) R(6,8) S(k,6), area 40
def area(poly):
    return abs(sum(F(x1) * y2 - F(x2) * y1 for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]))) / 2
def convex(poly):
    n = len(poly); signs = set()
    for i in range(n):
        (x1, y1), (x2, y2), (x3, y3) = poly[i], poly[(i + 1) % n], poly[(i + 2) % n]
        signs.add((x2 - x1) * (y3 - y2) - (y2 - y1) * (x3 - x2) > 0)
    return len(signs) == 1
ks = [k for k in (F(n, 4) for n in range(-200, 200)) if convex([(0, 0), (8, 2), (6, 8), (k, 6)]) and area([(0, 0), (8, 2), (6, 8), (k, 6)]) == 40]
assert len(ks) == 1, ks
t.choice("s1q7", ks[0])

# s1q8: x^2 + 1/x^2 = 14 -> possible x + 1/x (both real roots of x^2 - s x + 1 for each s)
vals = set()
for s in (4, -4):
    for x in ((s + math.sqrt(s * s - 4)) / 2, (s - math.sqrt(s * s - 4)) / 2):
        assert abs(x * x + 1 / (x * x) - 14) < 1e-9
        vals.add(round(x + 1 / x, 9))
cands = [-4, -2 * math.sqrt(3), 2 * math.sqrt(3), math.sqrt(14), 4, 12]
t.sel("s1q8", [i for i, c in enumerate(cands) if round(c, 9) in vals])

# s1q9: faces 24, 32, 48 -> volume
v = next(a * b * c for a in range(1, 50) for b in range(1, 50) for c in range(1, 50) if a * b == 24 and b * c == 32 and c * a == 48)
t.value("s1q9", v)

# DI: read the table
rows = {int(r[0]): (int(r[1]), int(r[2])) for r in figs["fig1"]["table"]["rows"]}
R = {e: c[0] for e, c in rows.items()}; T = {e: c[1] for e, c in rows.items()}
# s1q10: R4 is what percent less than T4
t.value("s1q10", F(T[4] - R[4], T[4]) * 100)
# s1q11: median eggs in T nests
data = sorted(e for e, c in T.items() for _ in range(c))
n = len(data)
t.choice("s1q11", F(data[n // 2 - 1] + data[n // 2], 2))
# s1q12: pool 3 or 4 eggs; P(species R or 3 eggs)
pool = [(sp, e) for e in (3, 4) for sp, d in (("R", R), ("T", T)) for _ in range(d[e])]
t.choice("s1q12", F(sum(1 for sp, e in pool if sp == "R" or e == 3), len(pool)))

# s2q1: n > 1 integer; A = (-2)^n + (-3)^n, B = (-5)^n
t.qc("s2q1", [((-2) ** n + (-3) ** n, (-5) ** n) for n in range(2, 40)])

# s2q2: P ~ N(42, 3); Q ~ N(50, 5)
Phi = lambda z: 0.5 * (1 + math.erf(z / math.sqrt(2)))
t.qc("s2q2", [(1 - Phi((46.5 - 42) / 3), 1 - Phi((57 - 50) / 5))])

# s2q3: 10 distinct masses + 2 heavier than all; A = IQR(12), B = IQR(10)
def iqr(v):
    v = sorted(v); h = len(v) // 2
    def med(u): m = len(u); return F(u[(m - 1) // 2] + u[m // 2], 2)
    return med(v[-h:]) - med(v[:h])
pairs = []
for _ in range(3000):
    Ls = random.sample(range(-500, 500), 10)
    Ms = Ls + [max(Ls) + random.randint(1, 50), max(Ls) + random.randint(51, 100)]
    pairs.append((iqr(Ms), iqr(Ls)))
pairs.append((iqr(list(range(1, 11)) + [11, 12]), iqr(range(1, 11))))
pairs.append((iqr([1, 2, 3] + list(range(100, 109))), iqr([1, 2, 3] + list(range(100, 107)))))
t.qc("s2q3", pairs)

# s2q4: exterior A > 130, exterior B > 110; A = angle C, B = 60  (grid of triangles)
cs = [180 - A - B for A in (F(i, 4) for i in range(1, 720)) for B in (F(j, 4) for j in range(1, 720))
      if A + B < 180 and 180 - A > 130 and 180 - B > 110]
t.qc("s2q4", [(c, 60) for c in cs[::50]] + [(min(cs), 60)])

# s2q5: s uniform on [2, 6]; A = P(s^2 < 16), B = P(s^2 > 20)  (exact by lengths, checked by sampling)
A = (4 - 2) / 4; B = (6 - math.sqrt(20)) / 4
smp = [random.uniform(2, 6) for _ in range(200000)]
assert abs(sum(x * x < 16 for x in smp) / len(smp) - A) < 0.01 and abs(sum(x * x > 20 for x in smp) / len(smp) - B) < 0.01
t.qc("s2q5", [(A, B)])

# s2q6: n < 30, sum n..30 = 30 -> number of terms
ns = [n for n in range(-1000, 30) if sum(range(n, 31)) == 30]
assert len(ns) == 1
t.choice("s2q6", 30 - ns[0] + 1)

# s2q7: ax + 2y = 8, 18x + ay = 24 with no common point; area of quadrilateral of the axis intercepts
def solutions(a):
    det = a * a - 36
    if det != 0: return "one"
    # parallel: same line iff (a, 2, 8) proportional to (18, a, 24)
    return "many" if F(a, 18) == F(2, a) == F(8, 24) else "none"
As = [a for a in range(-50, 51) if a != 0 and solutions(a) == "none"]
assert As == [-6], As
a = As[0]
pts = [(F(8, a), 0), (0, F(8, 2)), (F(24, 18), 0), (0, F(24, a))]
quad = sorted(pts, key=lambda p: math.atan2(p[1], p[0]))
t.choice("s2q7", area(quad))

# s2q8: regular hexagon area 48; midpoint hexagon area
hexv = [(math.cos(math.pi * k / 3), math.sin(math.pi * k / 3)) for k in range(6)]
mids = [((hexv[k][0] + hexv[(k + 1) % 6][0]) / 2, (hexv[k][1] + hexv[(k + 1) % 6][1]) / 2) for k in range(6)]
fa = lambda poly: abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]))) / 2
t.choice("s2q8", round(48 * fa(mids) / fa(hexv), 9))

# s2q9: P: 50 (day 2) -> 200 (day 6); Q: 20 -> 180. Ratio P/Q on day 0
gP = F(200, 50); gQ = F(180, 20)  # 4-day factors; 2-day factors are their square roots
rP = next(F(k) for k in range(1, 10) if k * k == gP); rQ = next(F(k) for k in range(1, 10) if k * k == gQ)
t.choice("s2q9", (50 / rP) / (20 / rQ))

# s2q10: count scatter points above y = x, read from the SVG
svg = figs["fig3"]["svg"]
circ = [(int(x), int(y)) for x, y in re.findall(r"<circle cx='(\d+)' cy='(\d+)'", svg)]
assert len(circ) == 12
data_pts = [(18 + (cx - 50) / 20, 18 + (290 - cy) / 20) for cx, cy in circ]
t.choice("s2q10", sum(1 for x, y in data_pts if y > x))

# s2q11: years 100..500 in both 3 + 7i and 5 + 4j
comet = {3 + 7 * i for i in range(100)}; shower = {5 + 4 * j for j in range(200)}
t.choice("s2q11", sum(1 for yr in range(100, 501) if yr in comet and yr in shower))

# s2q12: lattice points with 2|x| <= y <= 6
t.choice("s2q12", sum(1 for x in range(-10, 11) for y in range(-10, 11) if 2 * abs(x) <= y <= 6))

# s2q13: 0 < a < b; which must exceed a/b
exprs = [lambda a, b: (a + 1) / (b + 1), lambda a, b: (a / b) ** 2, lambda a, b: (a - 1) / (b - 1) if b != 1 else None,
         lambda a, b: math.sqrt(a / b), lambda a, b: 2 * a / (a + b), lambda a, b: a / (b + 1)]
must = []
samples = [(a, b) for a, b in ((random.uniform(0.001, 20), random.uniform(0.001, 20)) for _ in range(20000)) if a < b] + [(0.25, 0.5), (2, 3)]
for i, f in enumerate(exprs):
    if all((v := f(a, b)) is not None and v > a / b for a, b in samples):
        must.append(i)
t.sel("s2q13", must)

# s2q14: sides 10 -> 15, other sides W -> W - 5 (W > 5); percent change in area.
# change(W) = 50 - 750/W is continuous and increasing on (5, inf) with limits -100 and 50:
# a percent p is reachable iff W = 750/(50 - p) > 5.
pcts = [-90, -20, 0, 25, 50, 75]
reach = []
for i, p in enumerate(pcts):
    if p < 50:
        W = F(750, 50 - p)
        if W > 5:
            assert (15 * (W - 5) - 10 * W) * 100 / (10 * W) == p
            reach.append(i)
t.sel("s2q14", reach)

# s2q15: counts 3,6,6,9,x and 4,8,8,12 (x positive integer); only mode 8, range 9 -> x
from collections import Counter
xs = []
for x in range(1, 200):
    vals2 = [3, 6, 6, 9, x, 4, 8, 8, 12]
    c = Counter(vals2); top = max(c.values())
    if [k for k, v in c.items() if v == top] == [8] and max(vals2) - min(vals2) == 9:
        xs.append(x)
assert len(xs) == 1, xs
t.value("s2q15", xs[0])

t.done()
