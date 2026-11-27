"""Verify every key in content/bank/quant/qbank-002.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import permutations
import json
import math
import random

from keys import Keys, test_path


t = Keys("qbank-002")
t.figures = {f["id"]: f for f in json.loads(test_path("qbank-002").read_text())["figures"]}
random.seed(2)


def must(preds, cases):
    """Indices of the statements that hold in every case."""
    return [i for i, p in enumerate(preds) if all(p(*c) for c in cases)]


def heron(a, b, c):
    s = (a + b + c) / 2
    return math.sqrt(max(0.0, s * (s - a) * (s - b) * (s - c)))


# s1q1: point inside a rectangle 4, 7, 8 from A, B, C (A, C opposite); distance to D, for several shapes
wds = set()
for x in (1.0, 2.0, 2.5, 3.0):
    y = math.sqrt(16 - x * x)
    qx = math.sqrt(49 - y * y)              # distance to side BC
    s = math.sqrt(64 - qx * qx)             # distance to side DC
    assert x > 0 and y > 0 and qx > 0 and s > 0  # strictly inside
    wds.add(round(math.hypot(x, s), 9))
assert len(wds) == 1
t.choice("s1q1", wds.pop())

# s1q2: side of a square with diagonal 6 vs diagonal of a square with side 3
t.qc("s1q2", [(F(36, 2), F(9 * 2))])  # squares of both lengths: (6/sqrt2)^2 = 18, (3 sqrt2)^2 = 18

# s1q3: h^2 = 13^2 - x^2 = 15^2 - (x+4)^2, x > 0
xs = [x for x in (F(n, 4) for n in range(1, 60)) if 13**2 - x * x == 15**2 - (x + 4) ** 2]
assert len(xs) == 1
h = math.isqrt(int(169 - xs[0] ** 2))
assert h * h == 169 - xs[0] ** 2
t.choice("s1q3", h)

# s1q4: face diagonals^2 13, 40, 45 at one corner -> edges, space diagonal vs 7
sq = [(a, b, c) for a in range(1, 10) for b in range(1, 10) for c in range(1, 10) if (a*a + b*b, a*a + c*c, b*b + c*c) == (13, 40, 45)]
assert sq
t.qc("s1q4", [(math.sqrt(a*a + b*b + c*c), 7) for a, b, c in sq])

# s1q5: parallelogram area 4800, E strictly inside CD; statements in choice order
def para_cases():
    out = []
    for _ in range(3000):
        b = random.uniform(20, 200); h = 4800 / b; s = random.uniform(-150, 150); tt = random.uniform(0.01, 0.99)
        out.append((b, h, s, tt))
    out.append((80, 60, 30, 0.5))
    return out
def tri(p, q, r):
    return abs((q[0]-p[0])*(r[1]-p[1]) - (r[0]-p[0])*(q[1]-p[1])) / 2
def pts(b, h, s, tt):
    A, B, D = (0, 0), (b, 0), (s, h); C = (s + b, h); E = (D[0] + tt * b, h)
    return A, B, C, D, E
close = lambda u, v: abs(u - v) < 1e-6
preds5 = [
    lambda *c: close(tri(*[pts(*c)[i] for i in (0, 1, 4)]), 2400),
    lambda *c: close(tri(*[pts(*c)[i] for i in (0, 3, 4)]), tri(*[pts(*c)[i] for i in (1, 2, 4)])),
    lambda *c: close(tri(*[pts(*c)[i] for i in (0, 3, 4)]) + tri(*[pts(*c)[i] for i in (1, 2, 4)]), 2400),
    lambda *c: close(math.dist(pts(*c)[0], pts(*c)[4]), math.dist(pts(*c)[1], pts(*c)[4])),
    # conditional statement: wherever DE = 2 EC holds, BCE = 800
    lambda b, h, s, tt: close(tri(*[pts(b, h, s, 2/3)[i] for i in (1, 2, 4)]), 800),
]
t.sel("s1q5", must(preds5, para_cases()))

# s1q6: rectangle A(0,0) B(12,0) C(12,8) D(0,8); P on BC with BP=5, Q on CD with DQ=9
def shoelace(P):
    return abs(sum(P[i][0] * P[(i+1) % len(P)][1] - P[(i+1) % len(P)][0] * P[i][1] for i in range(len(P)))) / F(2)
A, B, C, D = (0, 0), (12, 0), (12, 8), (0, 8)
P, Q = (12, 5), (9, 8)
pieces = [shoelace([A, B, P]), shoelace([A, P, C, Q]), shoelace([A, Q, D])]
assert sum(pieces) == 96
t.choice("s1q6", max(pieces) - min(pieces))

# s1q7: triangle with AB = 60, AC = 80, area 720; D on AB (AD 40), E on AC (AE 30); area of DBCE
sinA = 720 / (0.5 * 60 * 80)
for ang in (math.asin(sinA), math.pi - math.asin(sinA)):
    A7, B7, C7 = (0, 0), (60, 0), (80 * math.cos(ang), 80 * math.sin(ang))
    D7, E7 = (40, 0), (30 * math.cos(ang), 30 * math.sin(ang))
    quad = shoelace([D7, B7, C7, E7])
    assert abs(shoelace([A7, B7, C7]) - 720) < 1e-6
t.value("s1q7", round(float(quad), 6))

# s1q8: sides 30, 40, 50; distance from B to line AC = 2*area/AC vs 20
t.qc("s1q8", [(2 * heron(30, 40, 50) / 50, 20)])

# s1q9: one $400 sale and ten sales in [20, 40]; statements in choice order
def med(v):
    v = sorted(v); n = len(v)
    return F(v[(n - 1) // 2] + v[n // 2], 2)
def mean(v):
    return F(sum(v), len(v))
lists = [[20] * 10, [40] * 10, [20] * 5 + [40] * 5, [20] * 4 + [30] * 2 + [40] * 4] + [[random.randint(20, 40) for _ in range(10)] for _ in range(4000)]
cases9 = [(small + [400],) for small in lists]
preds9 = [
    lambda v: mean(v) > med(v),
    lambda v: mean(v) > 60,
    lambda v: med([x for x in v if x != 400]) < med(v),
    lambda v: mean(v) - mean([x for x in v if x != 400]) > 30,
    lambda v: mean(v) - mean([x for x in v if x != 400]) > 35,
    lambda v: sum(1 for x in v if x < mean(v)) >= 10,
]
t.sel("s1q9", must(preds9, cases9))

# s1q10: 11 scores with median 70 and 15 with median 80; pooled median M; statements in choice order
def section(n, m):
    k = n // 2
    return [random.randint(0, m) for _ in range(k)] + [m] + [random.randint(m, 100) for _ in range(k)]
Ms = [med([70] * 11 + [80] * 15), med([70] * 11 + [0] * 7 + [80] * 8)]
Ms += [med(section(11, 70) + section(15, 80)) for _ in range(20000)]
preds10 = [
    lambda m: m == 75,
    lambda m: m == F(11 * 70 + 15 * 80, 26),
    lambda m: 70 <= m <= 80,
    lambda m: 70 < m < 80,
    lambda m: 75 <= m <= 80,
]
assert min(Ms) == 70 and max(Ms) == 80
keys10 = must(preds10, [(m,) for m in Ms])
assert len(keys10) == 1
t.sel("s1q10", keys10)

# s1q11: 4, 9, 11, 15, x, x+6 with median 12; the larger unknown
sol = [x for x in (F(n, 4) for n in range(-200, 400)) if med([4, 9, 11, 15, x, x + 6]) == 12]
assert len(sol) == 1
t.value("s1q11", sol[0] + 6)

# s1q12: 9 values each; P mode 40 range 12, Q mode 46 range 15; combined range vs 30
pairs12 = []
for a in range(28, 41):
    for b in range(31, 47):
        Pl = [a, a + 12] + [40] * 7
        Ql = [b, b + 15] + [46] * 7
        assert max(Pl) - min(Pl) == 12 and max(Ql) - min(Ql) == 15
        both = Pl + Ql
        pairs12.append((max(both) - min(both), 30))
t.qc("s1q12", pairs12)

# s1q13: x liters of 10% plus 30 - x of 25%, concentration in [16%, 20%], x <= 16 on hand
def ok13(x):
    if not (0 <= x <= 16):
        return False
    c = (F(10, 100) * x + F(25, 100) * (30 - x)) / 30
    return F(16, 100) <= c <= F(20, 100)
t.where("s1q13", ok13)

# s1q14: speeds 30 and 50, overall average 40; fraction of the distance at 30 (search over distance splits)
fr = [f for f in (F(n, 400) for n in range(1, 400)) if 1 / (f / 30 + (1 - f) / 50) == 40]
assert len(fr) == 1
t.choice("s1q14", fr[0])

# s1q15: 80 x 40 base, fill to 45 cm; 4 L/min to 30 cm, then 36 L/h
base = 80 * 40
v1, v2 = F(base * 30, 1000), F(base * (45 - 30), 1000)
t.value("s1q15", v1 / 4 + v2 / (F(36) / 60))

# s1q16: tap fills in 20 min, tap with customers drawing fills in 60; customers alone empty a full urn in d min, vs 40
ds = [d for d in range(1, 500) if F(1, 20) - F(1, d) == F(1, 60)]
assert len(ds) == 1
t.qc("s1q16", [(ds[0], 40)])

# s1q17: empirical-rule cdf at whole SDs; mean 58, SD 4; events in choice order, threshold 0.15
cdf = {-3: F(15, 10000), -2: F(25, 1000), -1: F(16, 100), 0: F(1, 2), 1: F(84, 100), 2: F(975, 1000), 3: F(9985, 10000)}
z = lambda g: (g - 58) // 4
Pr = lambda lo, hi: (cdf[z(hi)] if hi is not None else 1) - (cdf[z(lo)] if lo is not None else 0)
events = [
    Pr(62, None),
    Pr(50, 54),
    Pr(None, 54) + Pr(66, None),
    Pr(None, 50) + Pr(66, None),
    Pr(None, 50) + Pr(62, 66),
]
Phi = lambda v: 0.5 * (1 + math.erf(v / math.sqrt(2)))
exact = [1 - Phi(1), Phi(-1) - Phi(-2), Phi(-1) + 1 - Phi(2), 2 * Phi(-2), Phi(-2) + Phi(2) - Phi(1)]
assert [e > F(15, 100) for e in events] == [e > 0.15 for e in exact]  # the rule and the true normal agree
t.sel("s1q17", [i for i, e in enumerate(events) if e > F(15, 100)])

# s1q18: S ~ N(76, sd), P(S < 70) = 0.18; R ~ N(64, sd); P(64 < R < 70) in percent
lo, hi = 0.1, 100.0
for _ in range(200):
    sd = (lo + hi) / 2
    if Phi((70 - 76) / sd) < 0.18:
        lo = sd
    else:
        hi = sd
pct = 100 * (Phi((70 - 64) / sd) - 0.5)
t.choice("s1q18", round(pct))

# s1q19: mean 149 F, SD 5 Celsius degrees = 9 F; percentile of 131 F by the 95% rule
sd_f = F(9, 5) * 5
zz = (131 - 149) / sd_f
assert zz == -2
t.value("s1q19", (100 - 95) * F(1, 2))

# s1q20: both of two independent picks within 1 SD vs 1/2
t.qc("s1q20", [(F(68, 100) ** 2, F(1, 2))])

# s1q21: PQ = 6, QR = 8, 9 < PR < 14; area vs 20
t.qc("s1q21", [(heron(6, 8, pr / 100), 20) for pr in range(901, 1400, 7)])

# s1q22: -2 < x <= 2, -1 < y <= 4 from the double inequalities; statements in choice order
def xs22():
    return [x for x in (F(n, 20) for n in range(-60, 61)) if -3 <= 1 - 2 * x < 5]
def ys22():
    return [y for y in (F(n, 20) for n in range(-60, 121)) if 1 < y + 2 <= 6]
cases22 = [(x, y) for x in xs22() for y in ys22()]
preds22 = [
    lambda x, y: x - y < 3,
    lambda x, y: x - y > -6,
    lambda x, y: x - y >= -5,
    lambda x, y: x + y <= 6,
    lambda x, y: x + y < 6,
    lambda x, y: x - y > -1,
]
t.sel("s1q22", must(preds22, cases22))

# s1q23: three-digit integers with digit product 48; P(even and > 500)
codes = [n for n in range(100, 1000) if math.prod(int(d) for d in str(n)) == 48]
good = [n for n in codes if n % 2 == 0 and n > 500]
t.choice("s1q23", F(len(good), len(codes)))

# s1q24: table from the figure; P(pastry | not a large cake)
rows = {r[0]: [int(v) for v in r[1:]] for r in t.figures["fig6"]["table"]["rows"]}
head = t.figures["fig6"]["table"]["head"][1:]
assert rows["Total"] == [rows["Small"][i] + rows["Large"][i] for i in range(4)]
cells = {(size, item): rows[size][head.index(item)] for size in ("Small", "Large") for item in ("Bread", "Pastry", "Cake")}
base24 = sum(v for k, v in cells.items() if k != ("Large", "Cake"))
t.choice("s1q24", F(cells[("Small", "Pastry")] + cells[("Large", "Pastry")], base24))

t.done()
