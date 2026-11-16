"""Verify every key in content/tests/quant-013.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations, combinations_with_replacement
from statistics import NormalDist, pstdev, stdev
import math

from keys import Keys

t = Keys("quant-013")

# s1q1: x^3 < x; A = x^2, B = x
xs = [F(n, 16) for n in range(-80, 80)]
t.qc("s1q1", [(x * x, x) for x in xs if x**3 < x])

# s1q2: sqrt(9e-5) vs 0.01 (compare squares exactly)
t.qc("s1q2", [(math.sqrt(9e-5), 0.01)])
assert F(9, 10**5) < F(1, 100) ** 2

# s1q3: 0.15R = 0.24S; A = 1.15R, B = 1.8S
pairs = []
for s in range(25, 2000, 25):
    r = F(24, 100) * s / F(15, 100)
    assert F(15, 100) * r == F(24, 100) * s
    pairs.append((F(115, 100) * r, F(18, 10) * s))
t.qc("s1q3", pairs)

# s1q4: L = nine 10s and a 0; M = L + [11]; both population and sample SD
L = [10] * 9 + [0]
M = L + [11]
t.qc("s1q4", [(pstdev(M), pstdev(L)), (stdev(M), stdev(L))])

# s1q5: 20 L at 40%; drain x and refill with pure to reach 55%
x5 = [x for x in (F(n, 4) for n in range(0, 81)) if F(40, 100) * (20 - x) + x == F(55, 100) * 20]
assert len(x5) == 1
t.choice("s1q5", x5[0])

# s1q6: circle centered (3,-2) through (7,1); chord on the y-axis
r2 = (7 - 3) ** 2 + (1 + 2) ** 2
ys = [y for y in range(-50, 50) if (0 - 3) ** 2 + (y + 2) ** 2 == r2]
assert len(ys) == 2
t.choice("s1q6", max(ys) - min(ys))

# s1q7: 5 points on y=0, 6 points on y=1; non-collinear triples
pts = [(i, 0) for i in range(5)] + [(i, 1) for i in range(6)]
def area2(a, b, c):
    return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])
t.choice("s1q7", sum(1 for a, b, c in combinations(pts, 3) if area2(a, b, c) != 0))

# s1q8: x < 1/x < x^2
vals8c = [F(-3), F(-3, 2), F(-1), F(-1, 2), F(1, 2), F(2)]
t.sel("s1q8", [i for i, x in enumerate(vals8c) if x < 1 / x < x * x])

# s1q9: perimeters 20 and 50, larger area 150
t.value("s1q9", 150 / (F(50, 20) ** 2))

# DI table
freq = {0: 36, 1: 54, 2: 48, 3: 42, 4: 24, "5+": 36}
total_n = sum(freq.values())
assert total_n == 240

# s1q10: least d with at least 75% absent on d or fewer days
cum, d10 = 0, None
for k in (0, 1, 2, 3, 4):
    cum += freq[k]
    if d10 is None and F(cum, total_n) >= F(3, 4):
        d10 = k
t.choice("s1q10", d10)

# s1q11: circle graph of the students absent at least 1 day; 2-day sector
angle = F(freq[2], total_n - freq[0]) * 360
opts = [72, 78, 85, 90, 96]
t.sel("s1q11", [min(range(len(opts)), key=lambda i: abs(opts[i] - angle))])

# s1q12: overall mean 2.6 -> mean of "5 or more"
known = sum(k * v for k, v in freq.items() if k != "5+")
t.choice("s1q12", (F(26, 10) * total_n - known) / freq["5+"])

# s2q1: normal, mean 50, P(X > 62) = 0.2; A = P(X < 40), B = 0.2
sigma = 12 / NormalDist().inv_cdf(0.8)
X = NormalDist(50, sigma)
assert abs((1 - X.cdf(62)) - 0.2) < 1e-12
t.qc("s2q1", [(X.cdf(40), 0.2)])

# s2q2: divisors of 3600 below 60 vs 22
def d(m):
    return sum(1 for k in range(1, m + 1) if m % k == 0)
t.qc("s2q2", [(sum(1 for k in range(1, 60) if 3600 % k == 0), 22)])

# s2q3: density on [0,2] peaking at (1,1); A = P(X > 3/2), B = 1/4
def dens(x):
    return x if x <= 1 else 2 - x
assert (dens(F(0)) + dens(F(1))) / 2 * 1 + (dens(F(1)) + dens(F(2))) / 2 * 1 == 1  # total area 1
# area of the linear piece from 3/2 to 2 (trapezoid rule is exact on a line)
t.qc("s2q3", [((dens(F(3, 2)) + dens(F(2))) / 2 * F(1, 2), F(1, 4))])

# s2q4: p > q students, means 75 and 81; A = combined mean, B = 78
t.qc("s2q4", [(F(75 * p + 81 * q, p + q), 78) for p in range(2, 60) for q in range(1, p)])

# s2q5: AB = 8, AC = 11, BC in (3, 19); perimeter of the midpoint triangle vs 11
t.qc("s2q5", [((8 + 11 + bc) / 2, 11) for bc in (F(3) + F(k, 100) for k in range(1, 1600))])

# s2q6: P(2,6), Q(q,0) with q > 0 and PQ = 10; l perpendicular to 4x + ky = 12
qs = [q for q in range(-50, 50) if (q - 2) ** 2 + 36 == 100 and q > 0]
assert len(qs) == 1
m_l = F(0 - 6, qs[0] - 2)
# slope of 4x + ky = 12 is -4/k; need (-4/k) * m_l = -1
ks = [k for k in (F(n, 12) for n in range(-200, 201)) if k != 0 and (-4 / k) * m_l == -1]
assert len(ks) == 1
t.choice("s2q6", ks[0])

# s2q7: 5 pairs of gloves, draw 4, exactly one complete pair
gloves = [(c, s) for c in range(5) for s in range(2)]
draws = list(combinations(gloves, 4))
def pairs_in(dr):
    cols = [g[0] for g in dr]
    return sum(1 for c in set(cols) if cols.count(c) == 2)
t.choice("s2q7", F(sum(1 for dr in draws if pairs_in(dr) == 1), len(draws)))

# s2q8: x + 1/x = 3; x^3 - 2x^2 - 2x
vals8 = set()
for x in ((3 + math.sqrt(5)) / 2, (3 - math.sqrt(5)) / 2):
    assert abs(x + 1 / x - 3) < 1e-9
    v = x**3 - 2 * x * x - 2 * x
    vals8.add(F(v).limit_denominator(1000))
assert len(vals8) == 1
t.choice("s2q8", vals8.pop())

# s2q9: trapezoid with AB = 2 DC; scale so [ABE] = 36
def shoelace(*p):
    return abs(sum(p[i][0] * p[(i + 1) % len(p)][1] - p[(i + 1) % len(p)][0] * p[i][1] for i in range(len(p)))) / 2
D9, C9, A9, B9 = (F(0), F(0)), (F(3), F(0)), (F(-1), F(1)), (F(5), F(1))
# intersection E of AC and BD
def inter(p1, p2, p3, p4):
    x1, y1 = p1; x2, y2 = p2; x3, y3 = p3; x4, y4 = p4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    tt = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    return (x1 + tt * (x2 - x1), y1 + tt * (y2 - y1))
E9 = inter(A9, C9, B9, D9)
abe, cde = shoelace(A9, B9, E9), shoelace(C9, D9, E9)
assert abe / cde == 4
t.choice("s2q9", shoelace(A9, B9, C9, D9) * 36 / abe)

# s2q10: 5 N, 8 E, 11 S
dx, dy = 8, 5 - 11
t.choice("s2q10", math.isqrt(dx * dx + dy * dy))
assert math.isqrt(dx * dx + dy * dy) ** 2 == dx * dx + dy * dy

# s2q11: 3x - 5 sqrt(x) - 2 = 0; u = sqrt x >= 0
us = [u for u in (F(n, 6) for n in range(-60, 61)) if 3 * u * u - 5 * u - 2 == 0]
assert len(us) == 2
sols = {u * u for u in us if u >= 0}
for s in sols:
    assert abs(3 * float(s) - 5 * math.sqrt(s) - 2) < 1e-12
t.choice("s2q11", sum(sols))

# s2q12: a+b odd, ab+c odd; which must be odd
exprs12 = [lambda a, b, c: a + c, lambda a, b, c: b * c, lambda a, b, c: a + b + c, lambda a, b, c: a * b + b * c, lambda a, b, c: c * c + a * b]
triples = [(a, b, c) for a in range(-4, 5) for b in range(-4, 5) for c in range(-4, 5) if (a + b) % 2 == 1 and (a * b + c) % 2 == 1]
t.sel("s2q12", [i for i, f in enumerate(exprs12) if all(f(*tr) % 2 == 1 for tr in triples)])

# s2q13: five integer scores 0..10 with median 5; possible means
means = {F(sum(s), 5) for s in combinations_with_replacement(range(11), 5) if s[2] == 5}
t.where("s2q13", lambda m: F(m).limit_denominator(1000) in means)

# s2q14: S_n integer?
def S(n):
    return sum(1 / (math.sqrt(k) + math.sqrt(k + 1)) for k in range(1, n + 1))
ns = [int(c) for c in t.choices("s2q14")]
t.sel("s2q14", [i for i, n in enumerate(ns) if abs(S(n) - round(S(n))) < 1e-9])

# s2q15: t1 = 3, t_{k+1} = (t_k - 1)/(t_k + 1); t_3 + t_6 + ... + t_24
a, tot = F(3), F(0)
for n in range(1, 25):
    if n % 3 == 0:
        tot += a
    a = (a - 1) / (a + 1)
t.value("s2q15", tot)

t.done()
