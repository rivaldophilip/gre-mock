"""Verify every key in content/bank/quant/qbank-001.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations, product
import json
import math
import random
import statistics

from keys import Keys, test_path

t = Keys("qbank-001")
random.seed(7)
grid = [F(n, 24) for n in range(-24 * 6, 24 * 6 + 1)]  # rationals in [-6, 6], step 1/24


def pvar(xs):
    m = F(sum(xs), len(xs))
    return sum((x - m) ** 2 for x in xs) / len(xs)


# s1q1: 3 of 10 cars in a line, no two adjacent
sets = list(combinations(range(10), 3))
good = [s for s in sets if all(b - a > 1 for a, b in zip(s, s[1:]))]
t.choice("s1q1", F(len(good), len(sets)))

# s1q2: scoring chance 1/3 per attempt; least n with P(at least one goal) > 0.9, vs 5
n2 = next(n for n in range(1, 100) if 1 - F(2, 3) ** n > F(9, 10))
t.qc("s1q2", [(n2, 5)])

# s1q3: random point in [0,6]x[0,4]; closer to south edge (distance y) than west edge (distance x)
exact = 1 - F(4 * 4, 2) / 24
n = 600
hits = sum(1 for i in range(n) for j in range(n) if (4 * (j + 0.5) / n) < (6 * (i + 0.5) / n))
assert abs(hits / n**2 - float(exact)) < 1e-2
t.choice("s1q3", exact)

# s1q4: unit square, A=(0,0), B=(1,0); angle APB acute iff P outside circle on diameter AB
n = 800
acute = 0
for i in range(n):
    for j in range(n):
        x, y = (i + 0.5) / n, (j + 0.5) / n
        acute += ((0 - x) * (1 - x) + (0 - y) * (0 - y)) > 0  # dot product of PA and PB
pa = acute / n**2
assert abs(pa - (1 - math.pi / 8)) < 5e-3
t.qc("s1q4", [(1 - math.pi / 8, 0.6)])

# s1q5: x + 2y <= 8, 3x + y <= 9, x, y >= 0; possible totals x + y form [0, max]
pts = [(x, y) for x in grid for y in grid if x >= 0 and y >= 0 and x + 2 * y <= 8 and 3 * x + y <= 9]
lo, hi = min(x + y for x, y in pts), max(x + y for x, y in pts)
t.where("s1q5", lambda v: lo <= v <= hi)

# s1q6: slope -2 through (-4, 3); which quadrant is never entered
quads = set()
for x in grid:
    y = 3 - 2 * (x + 4)
    if x > 0 and y > 0: quads.add(0)
    if x < 0 and y > 0: quads.add(1)
    if x < 0 and y < 0: quads.add(2)
    if x > 0 and y < 0: quads.add(3)
missing = [q for q in range(4) if q not in quads]
t.sel("s1q6", missing if len(missing) == 1 else [4])

# s1q7: line through (p,q),(q,p), p>q, y-intercept 10, distance 6*sqrt2 (squared 72)
sols = set()
g7 = [F(n, 4) for n in range(-80, 81)]
for p in g7:
    for q in g7:
        if p > q:
            m = F(p - q, q - p)
            if p - m * q == 10 and (p - q) ** 2 + (q - p) ** 2 == 72:  # intercept from point (q, p)
                sols.add(p)
assert len(sols) == 1
t.value("s1q7", sols.pop())

# s1q8: kx + 3y = 6 and 3x - ky = 5: angle between them (degrees) vs 90
pairs = []
for k in [F(n, 3) for n in range(-30, 31) if n != 0]:
    m1, m2 = -k / 3, 3 / k
    a = math.degrees(abs(math.atan(float(m1)) - math.atan(float(m2))))
    pairs.append((round(a, 9), 90))
t.qc("s1q8", pairs)

# s1q9: heats with a greater (population) standard deviation than 22, 24, 26, 28, 30
ref = pvar([22, 24, 26, 28, 30])
heats = [[int(v) for v in c.split(",")] for c in t.choices("s1q9")]
t.sel("s1q9", [i for i, h in enumerate(heats) if pvar(h) > ref])

# s1q10: press with the greatest standard deviation of flaws (rows read from the figure)
fig = next(f for f in json.loads(test_path("qbank-001").read_text())["figures"] if f["id"] == "fig1")
var = []
for row in fig["table"]["rows"]:
    counts = [int(c) for c in row[1:]]
    assert sum(counts) == 10
    var.append(pvar([v for v, c in zip(range(1, 6), counts) for _ in range(c)]))
assert var.count(max(var)) == 1
t.sel("s1q10", var.index(max(var)))

# s1q11: 20 values mean 70 SD 3 with 5 values mean 80 SD 8 (example lists), combined SD
X = [67] * 10 + [73] * 10
Y = [68, 76, 80, 84, 92]
assert F(sum(X), 20) == 70 and pvar(X) == 9 and F(sum(Y), 5) == 80 and pvar(Y) == 64
v = pvar(X + Y)
r = math.isqrt(int(v))
assert r * r == v
t.value("s1q11", r)

# s1q12: five integer scores 0..10 with mean 5: greatest SD vs 5 (reals: the extreme points of the box are integer here)
best = max(pvar(s) for s in product(range(11), repeat=5) if sum(s) == 25)
t.qc("s1q12", [(math.sqrt(best), 5)])

# s1q13: -1 < r < 1 (zero included): which statements hold for every r
rs = [x for x in grid if -1 < x < 1]
stmts = [lambda r: r**2 < 1, lambda r: r**3 <= r**2, lambda r: r**2 < abs(r), lambda r: r**3 < r,
         lambda r: r**4 <= r**2, lambda r: r + r**2 >= 0]
t.sel("s1q13", [i for i, s in enumerate(stmts) if all(s(r) for r in rs)])

# s1q14: c != 0, c^2 > c and c > 1/c; match the solution set with each choice on a grid
cs = [x for x in grid if x != 0 and x not in (1, -1)] + [F(1), F(-1)]
truth = {c: c * c > c and c > 1 / c for c in cs}
cands = [lambda c: c > 1, lambda c: c < -1, lambda c: -1 < c < 0, lambda c: -1 < c < 0 or c > 1, lambda c: c < -1 or c > 1]
t.sel("s1q14", [i for i, p in enumerate(cands) if all(p(c) == truth[c] for c in cs)])

# s1q15: 9x^2 + 4 > 12x holds for all integers; the single real failure
assert all(9 * x * x + 4 > 12 * x for x in range(-1000, 1001))
fails = [x for x in (F(n, 360) for n in range(-3600, 3601)) if not 9 * x * x + 4 > 12 * x]
assert len(fails) == 1
t.value("s1q15", fails[0])

# s1q16: -1 < x < 0: median of 1/x, x, x^2, x^3, 1/x^2 vs x
t.qc("s1q16", [(sorted([1 / x, x, x**2, x**3, 1 / x**2])[2], x) for x in grid if -1 < x < 0])

# s1q17: nonzero p, q with |p+q| = |p| - |q|; statements that always hold
pq = [(p, q) for p in range(-30, 31) for q in range(-30, 31) if p and q and abs(p + q) == abs(p) - abs(q)]
st17 = [lambda p, q: p * q < 0, lambda p, q: abs(p) >= abs(q), lambda p, q: p > 0, lambda p, q: p + q != 0,
        lambda p, q: abs(q) < abs(p), lambda p, q: q < 0]
t.sel("s1q17", [i for i, s in enumerate(st17) if all(s(p, q) for p, q in pq)])

# s1q18: |x - 3| = 2|x + 6|; sum of solutions
xs = [x for x in (F(n, 12) for n in range(-12 * 60, 12 * 60 + 1)) if abs(x - 3) == 2 * abs(x + 6)]
t.choice("s1q18", sum(xs))

# s1q19: 3/4 < x < 1: how many of x, x^3, 2x-1, sqrt x, 1/x are below x^2
counts = set()
for i in range(1, 400):
    x = 0.75 + 0.25 * i / 400
    counts.add(sum(v < x * x for v in (x, x**3, 2 * x - 1, math.sqrt(x), 1 / x)))
assert len(counts) == 1
t.value("s1q19", counts.pop())

# s1q20: P < Q < R in (0, 1) carry x, x^2, sqrt x in some order: PQ vs QR
pairs = []
for i in range(1, 1000):
    x = i / 1000
    P, Q, R = sorted([x, x * x, math.sqrt(x)])
    pairs.append((round(Q - P, 12), round(R - Q, 12)))
t.qc("s1q20", pairs)

# s1q21: P=(a,b), a<0<b; Q across y=x, R = Q across x-axis
cases = [(a, b) for a in range(-12, 0) for b in range(1, 13)]
def facts(a, b):
    R = (b, -a)
    return [R[0] > 0 and R[1] > 0,
            (-b, a) == R,  # x-axis first: (a,-b), then y=x: (-b,a)
            R[0] ** 2 + R[1] ** 2 == a * a + b * b,
            (-a, b) == R,
            (-b, -a) == R,
            a * R[0] + b * R[1] == 0]
t.sel("s1q21", [i for i in range(6) if all(facts(a, b)[i] for a, b in cases)])

# s1q22: shoelace area
V = [(0, 1), (5, 0), (7, 4), (2, 7)]
area = abs(sum(V[i][0] * V[(i + 1) % 4][1] - V[(i + 1) % 4][0] * V[i][1] for i in range(4))) / F(2)
# convex and simple: all cross products of consecutive edges share a sign
cr = [(V[(i + 1) % 4][0] - V[i][0]) * (V[(i + 2) % 4][1] - V[(i + 1) % 4][1]) - (V[(i + 1) % 4][1] - V[i][1]) * (V[(i + 2) % 4][0] - V[(i + 1) % 4][0]) for i in range(4)]
assert all(c > 0 for c in cr) or all(c < 0 for c in cr)
t.choice("s1q22", area)

# s1q23: circle through (0,0), (10,0), (0,4); second crossing with y = x
# center (h, k) equidistant from the three points: brute over a grid
cen = [(h, k) for h in grid for k in grid if h * h + k * k == (h - 10) ** 2 + k * k == h * h + (k - 4) ** 2]
assert len(cen) == 1
h, k = cen[0]
r2 = h * h + k * k
ts = [x for x in (F(n, 12) for n in range(-12 * 30, 12 * 30 + 1)) if x != 0 and (x - h) ** 2 + (x - k) ** 2 == r2]
assert len(ts) == 1
t.value("s1q23", ts[0])

# s1q24: triangle (0,0), (k,0), (0,k+2) with area 24: real k (quadratics k^2+2k-48 and k^2+2k+48)
ks = []
for c in (-48, 48):
    disc = 4 - 4 * c
    if disc >= 0:
        ks += [(-2 + s * math.sqrt(disc)) / 2 for s in (1, -1)]
ks = [k for k in ks if abs(abs(k * (k + 2)) / 2 - 24) < 1e-9]
assert sorted(round(k, 9) for k in ks) == [-8, 6]
t.qc("s1q24", [(k, 0) for k in ks])

# s1q25: integer r, h with r^2 h = 36; total surface area 2 pi r (r + h)
areas = [2 * r * (r + 36 // (r * r)) * math.pi for r in range(1, 7) if 36 % (r * r) == 0]
t.where("s1q25", lambda v: any(abs(v - a) < 1e-9 for a in areas))

# s1q26: l^2+w^2 = 13, w^2+h^2 = 45, l^2+w^2+h^2 = 49: the l-by-h face diagonal
sol = [(l, w, hh) for l in range(1, 20) for w in range(1, 20) for hh in range(1, 20)
       if l*l + w*w == 13 and w*w + hh*hh == 45 and l*l + w*w + hh*hh == 49]
assert len(sol) == 1
l, w, hh = sol[0]
t.where("s1q26", lambda v: abs(v - math.sqrt(l * l + hh * hh)) < 1e-9)

# s1q27: cube with n per edge; 96 cubes with exactly one coated face; cubes with none
def faces(n):
    cnt = [0] * 4
    for x, y, z in product(range(n), repeat=3):
        cnt[sum(c in (0, n - 1) for c in (x, y, z))] += 1
    return cnt
ns = [n for n in range(2, 15) if faces(n)[1] == 96]
assert len(ns) == 1
t.value("s1q27", faces(ns[0])[0])

# s1q28: 20*20*9 of water into a cylinder r=6, height 30: depth (capped) vs 31
vol = 20 * 20 * 9
t.qc("s1q28", [(min(vol / (math.pi * 36), 30), 31)])

# s1q29: k = 1 mod 4; k(k+1)(k+2) mod 8 vs 4
t.qc("s1q29", [(k * (k + 1) * (k + 2) % 8, 4) for k in range(1, 400) if k % 4 == 1])

# s1q30: five distinct integers >= 5 summing to 40: greatest second-largest vs 10
best = max(sorted(s)[3] for s in combinations(range(5, 41), 5) if sum(s) == 40)
t.qc("s1q30", [(best, 10)])

# s1q31: die 1-6, spinner 1-8, given different: P(spinner > die) vs 5/8
outs = [(d, s) for d in range(1, 7) for s in range(1, 9) if d != s]
t.qc("s1q31", [(F(sum(s > d for d, s in outs), len(outs)), F(5, 8))])

# s1q32: fare x up 25% then down 25% = 12: original
orig = F(12) / (F(5, 4) * F(3, 4))
t.choice("s1q32", orig)

t.done()
