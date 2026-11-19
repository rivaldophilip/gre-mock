"""Verify every key in content/tests/quant-014.json: each answer is computed here and compared with the key."""
from fractions import Fraction as F
from itertools import combinations
import math
import re

from keys import Keys

t = Keys("quant-014")


def latex_value(text):
    """Float value of a choice like '10\\pi - 16', '\\dfrac{25\\pi}{2} - 16', '16\\pi + 6\\sqrt3', '4\\sqrt3'."""
    s = text.replace(" ", "")
    s = re.sub(r"\\dfrac\{([^}]*)\}\{([^}]*)\}", r"((\1)/(\2))", s)
    s = re.sub(r"\\sqrt(\d)", r"*math.sqrt(\1)", s)
    s = s.replace("\\pi", "*math.pi")
    s = re.sub(r"(^|[(+\-*/])\*", r"\1", s)
    return eval(s)


def pick_float(qid, value):
    vals = [latex_value(c) for c in t.choices(qid)]
    hits = [i for i, v in enumerate(vals) if abs(v - value) < 1e-9]
    assert len(hits) == 1, (qid, vals, value)
    t.sel(qid, hits[0])


def rnd(v):
    return math.floor(v + F(1, 2))


# s1q1: x rounds to 4; A = round(x^2), B = 16
t.qc("s1q1", [(rnd(x * x), 16) for x in (F(350 + k, 100) for k in range(100))])

# s1q2: -1 < x < -1/2; A = x^2, B = x + 1
t.qc("s1q2", [(x * x, x + 1) for x in (F(-1000 + k, 1000) for k in range(1, 500))])

# s1q3: A(0,0), B(0,5), D(12,0), BC = 12, CD = 5; C is an intersection of the two circles; keep convex ABCD
def circle_meet(c1, r1, c2, r2):
    (x1, y1), (x2, y2) = c1, c2
    d = math.dist(c1, c2)
    a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
    h = math.sqrt(max(r1 * r1 - a * a, 0))
    mx, my = x1 + a * (x2 - x1) / d, y1 + a * (y2 - y1) / d
    return [(mx + h * (y2 - y1) / d, my - h * (x2 - x1) / d), (mx - h * (y2 - y1) / d, my + h * (x2 - x1) / d)]

def convex(pts):
    s = [(b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) for a, b, c in zip(pts, pts[1:] + pts[:1], pts[2:] + pts[:2])]
    return all(v > 1e-9 for v in s) or all(v < -1e-9 for v in s)

A, B, D = (0.0, 0.0), (0.0, 5.0), (12.0, 0.0)
cases = [(round(math.dist(A, C), 9), 13) for C in circle_meet(B, 12, D, 5) if convex([A, B, C, D])]
assert cases
t.qc("s1q3", cases)

# s1q4: tens digit of the product of odd numbers 1..99
N = math.prod(range(1, 100, 2))
t.qc("s1q4", [(N // 10 % 10, 5)])

# s1q5: 80 km/h, 16 km/L, $1.80/L, 45 minutes
t.choice("s1q5", F(80) * F(45, 60) / 16 * F(180, 100))

# s1q6: area ratio 1/400 -> linear 1/20 -> volume x 8000; model 0.03 L
k = next(k for k in range(1, 100) if k * k == 400)
t.choice("s1q6", F(3, 100) * k**3)

# s1q7: 4 of 5 candles + 4 soaps + 3 teas with at least one of each kind
items = [("c", i) for i in range(5)] + [("s", i) for i in range(4)] + [("t", i) for i in range(3)]
t.choice("s1q7", sum(1 for c in combinations(items, 4) if {x[0] for x in c} == {"c", "s", "t"}))

# s1q8: x + y, xy rational. Numbers a + b*sqrt(d) as (a, b); test expressions on conjugate pairs.
def must_be_rational():
    ok = [True] * 6
    for s, p in [(4, 1), (5, 2), (3, 1), (6, 4), (3, 2), (10, 7)]:
        disc = F(s * s - 4 * p)
        assert disc > 0
        # x, y = (s +- sqrt(disc))/2 ; represent as (a, b) over sqrt(disc)
        x, y = (F(s, 2), F(1, 2)), (F(s, 2), F(-1, 2))
        mul = lambda u, v: (u[0] * v[0] + u[1] * v[1] * disc, u[0] * v[1] + u[1] * v[0])
        add = lambda u, v: (u[0] + v[0], u[1] + v[1])
        neg = lambda u: (-u[0], -u[1])
        inv = lambda u: (u[0] / (u[0] ** 2 - u[1] ** 2 * disc), -u[1] / (u[0] ** 2 - u[1] ** 2 * disc))
        sq_disc = math.isqrt(disc.numerator) ** 2 == disc.numerator and math.isqrt(disc.denominator) ** 2 == disc.denominator
        rational = lambda u: u[1] == 0 or sq_disc
        xy = mul(x, y)[0]
        sqrt_xy_rational = math.isqrt(xy.numerator) ** 2 == xy.numerator and math.isqrt(xy.denominator) ** 2 == xy.denominator
        exprs = [add(mul(x, x), mul(y, y)), add(x, neg(y)), mul(add(x, neg(y)), add(x, neg(y))),
                 add(inv(x), inv(y)), add(mul(x, x), neg(mul(y, y))), None]
        for i, e in enumerate(exprs):
            r = sqrt_xy_rational if e is None else rational(e)
            ok[i] = ok[i] and r
    return [i for i, v in enumerate(ok) if v]
t.sel("s1q8", must_be_rational())

# s1q9: 8 consecutive integers summing to 10100; greatest
n = next(n for n in range(1, 10100) if sum(range(n, n + 8)) == 10100)
t.value("s1q9", n + 7)

# DI table
table = {1: 10, 2: 12, 3: 8, 4: 6, 5: 4}
assert sum(table.values()) == 40

# s1q10: percent of items in orders of 4+ items; nearest choice
pct = F(100) * sum(v * c for v, c in table.items() if v >= 4) / sum(v * c for v, c in table.items())
nums = [F(re.sub(r"[^\d.]", "", c)) for c in t.choices("s1q10")]
t.sel("s1q10", min(range(len(nums)), key=lambda i: abs(nums[i] - pct)))

# s1q11: two orders without replacement, same number of items
orders = [v for v, c in table.items() for _ in range(c)]
pairs = [(i, j) for i in range(40) for j in range(40) if i != j]
t.choice("s1q11", F(sum(1 for i, j in pairs if orders[i] == orders[j]), len(pairs)))

# s1q12: least k (added 5-item orders) making the median 3
def median(v):
    v = sorted(v); m = len(v)
    return F(v[(m - 1) // 2] + v[m // 2], 2)
t.choice("s1q12", next(k for k in range(0, 100) if median(orders + [5] * k) == 3))

# s2q1: f(x) = 3x - 2; A = f(a+b), B = f(a) + f(b)
f = lambda x: 3 * x - 2
t.qc("s2q1", [(f(a + b), f(a) + f(b)) for a in (F(k, 3) for k in range(-9, 10)) for b in (F(k, 7) for k in range(-9, 10))])

# s2q2: |s - 20| <= 0.5; A = max |s^2 - 400|, B = 20
best = max(abs(s * s - 400) for s in (F(1950 + k, 100) for k in range(101)))
t.qc("s2q2", [(best, 20)])

# s2q3: angles above line l: 3x + x + (2x + 30) = 180 (x's vertical partner sits between m and n above l)
xs = [x for x in (F(k, 10) for k in range(1, 1800)) if 3 * x + x + (2 * x + 30) == 180]
assert len(xs) == 1
x = xs[0]
# figure check: directions 0, 75, 100 degrees give 3x = 75, x = 25, 2x + 30 = 80
assert (3 * x, x, 2 * x + 30) == (75, 25, 80)
t.qc("s2q3", [(180 - x, 150)])

# s2q4: f with unique max at 3 (sample f's); g(x) = -2 f(x + 1); A = argmin g, B = 4
cases = []
for fx in (lambda u: 7 - (u - 3) ** 2, lambda u: 7 - abs(u - 3), lambda u: 7 / (1 + (u - 3) ** 2)):
    grid = [F(k, 100) for k in range(-1000, 1000)]
    g = {xx: -2 * fx(xx + 1) for xx in grid}
    cases.append((min(grid, key=lambda xx: g[xx]), 4))
t.qc("s2q4", cases)

# s2q5: three-digit N with tens digit = hundreds + units; A = N mod 11, B = units digit
t.qc("s2q5", [(N5 % 11, N5 % 10) for N5 in range(100, 1000) if N5 // 10 % 10 == N5 // 100 + N5 % 10])

# s2q6: P = (1 - d) L + s solved for d; the choice that returns d on random samples
import random
random.seed(14)
samples = []
for _ in range(50):
    L_, d_, s_ = F(random.randint(20, 500)), F(random.randint(1, 90), 100), F(random.randint(0, 30))
    samples.append((L_, d_, s_, (1 - d_) * L_ + s_))
def latex_expr(c):
    e = re.sub(r"\\dfrac\{([^}]*)\}\{([^}]*)\}", r"((\1)/(\2))", c.replace(" ", ""))
    return lambda L, s, P: eval(e, {}, {"L": L, "s": s, "P": P})
fns = [latex_expr(c) for c in t.choices("s2q6")]
t.sel("s2q6", [i for i, fn in enumerate(fns) if all(fn(L_, s_, P_) == d_ for L_, d_, s_, P_ in samples)])

# s2q7: square of area 16 on the diameter; semicircle area minus square
side = math.sqrt(16)
r2 = (side / 2) ** 2 + side ** 2
pick_float("s2q7", math.pi * r2 / 2 - 16)

# s2q8: circle radius 4 at origin, chord AB = 4*sqrt3 horizontal below center; C on the far side with CA = CB
r = 4.0
half = 4 * math.sqrt(3) / 2
dist = math.sqrt(r * r - half * half)
Ap, Bp = (-half, -dist), (half, -dist)
Cp = (0.0, r)  # same side of AB as the center, equidistant from A and B
area = abs((Bp[0] - Ap[0]) * (Cp[1] - Ap[1]) - (Cp[0] - Ap[0]) * (Bp[1] - Ap[1])) / 2
pick_float("s2q8", area)

# s2q9: ribbon in whole meters at 1.40/m, need 6.3 m, $4 shipping if total <= $10
costs = []
for meters in range(1, 30):
    if meters >= F(63, 10):
        price = F(140, 100) * meters
        costs.append(price + (4 if price <= 10 else 0))
t.choice("s2q9", min(costs))

# s2q10: length x1.2, area x1.5; percent increase in width
t.choice("s2q10", (F(3, 2) / F(6, 5) - 1) * 100)

# s2q11: horizontal cylinder r = 2, length 6, fuel depth 3 (stem's 120-degree angle must agree): integrate the cross section
assert abs(math.degrees(2 * math.acos((3 - 2) / 2)) - 120) < 1e-9
R, Lg, depth = 2.0, 6.0, 3.0
steps = 200000
area = sum(2 * math.sqrt(max(R * R - (y - R) ** 2, 0)) for y in ((i + 0.5) * depth / steps for i in range(steps))) * depth / steps
vol = area * Lg
vals = [latex_value(c) for c in t.choices("s2q11")]
t.sel("s2q11", min(range(len(vals)), key=lambda i: abs(vals[i] - vol)))
assert abs(vol - (16 * math.pi + 6 * math.sqrt(3))) < 1e-4

# s2q12: B(t)/A(t) for several t; constant 1.21 -> the "21 percent ... every t" choice
ratios = {round(500 * 1.1 ** (2 * tt + 2) / (500 * 1.21 ** tt), 12) for tt in (0, 0.5, 1, 3, 7.25, 20)}
assert len(ratios) == 1
pct = round((ratios.pop() - 1) * 100)
t.sel("s2q12", [i for i, c in enumerate(t.choices("s2q12")) if c.startswith(f"B(t) is {pct} percent greater")])

# s2q13: two-way table, total 50, coupon 30, card 28; coupon-no-card values
possible = set()
for both in range(0, 29):
    card_only, coupon_only, neither = 28 - both, 30 - both, 50 - (30 + 28 - both)
    if min(card_only, coupon_only, neither) >= 0:
        possible.add(coupon_only)
t.where("s2q13", lambda v: v in possible)

# s2q14: P(0,0), Q(10,0), R(x, 6) (altitude 6); QR = v possible iff some x gives it
def qr_possible(v):
    v = float(v)
    if v * v < 36 - 1e-12:
        return False
    xr = 10 + math.sqrt(max(v * v - 36, 0))
    return abs(math.hypot(xr - 10, 6) - v) < 1e-9
t.where("s2q14", qr_possible)

# s2q15: boxplot Q1 = 25, Q3 = 40 (fig5); least whole number above Q3 + 1.5 IQR
q1, q3 = 25, 40
fence = q3 + F(3, 2) * (q3 - q1)
t.value("s2q15", math.floor(fence) + 1)

t.done()
