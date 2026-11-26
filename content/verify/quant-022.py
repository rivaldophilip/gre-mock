"""Verify every key in content/tests/quant-022.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
import math
import random

from keys import Keys

t = Keys("quant-022")
random.seed(22)
R = lambda x: round(x, 9)

# s1q1: -2 < a < -1, 0 < b < 1; A = ab, B = a
t.qc("s1q1", [(a * b, a) for a in (F(-n, 7) for n in range(8, 14)) for b in (F(m, 9) for m in range(1, 9))])

# s1q2: true count n rounds to 4450 at the tens; A = n rounded to the hundreds, B = 4500
ns = [n for n in range(4000, 5000) if (n + 5) // 10 * 10 == 4450]
t.qc("s1q2", [((n + 50) // 100 * 100, 4500) for n in ns])

# s1q3: right angle at B, D on AC with BD = DC; A = AD, B = DC
pairs = []
for _ in range(500):
    p, q = random.uniform(0.5, 9), random.uniform(0.5, 9)
    A, C = (0.0, p), (q, 0.0)  # B at the origin
    # D = C + s(A - C); |D|^2 = |D - C|^2  ->  solve for s
    dx, dy = A[0] - C[0], A[1] - C[1]
    s = -(C[0] ** 2 + C[1] ** 2) / (2 * (C[0] * dx + C[1] * dy))
    assert 0 < s < 1
    D = (C[0] + s * dx, C[1] + s * dy)
    pairs.append((R(math.dist(A, D)), R(math.dist(D, C))))
t.qc("s1q3", pairs)

# s1q4: x^2 < 6x - 8; A = |x - 5| - |1 - x|, B = |2x - 9| - 3
xs = [F(n, 64) for n in range(-640, 640) if F(n, 64) ** 2 < 6 * F(n, 64) - 8]
assert min(xs) > 2 and max(xs) < 4
t.qc("s1q4", [(abs(x - 5) - abs(1 - x), abs(2 * x - 9) - 3) for x in xs])

# s1q5: 0.35 of 60% + 0.50 of 40%
t.choice("s1q5", F(35, 100) * 60 + F(50, 100) * 40)

# s1q6: pair rates 1/6, 1/8, 1/12
trio = (F(1, 6) + F(1, 8) + F(1, 12)) / 2
for pair in (F(1, 6), F(1, 8), F(1, 12)):
    assert trio - pair > 0
t.choice("s1q6", 1 / trio)

# s1q7: exponent of 3 in 2*4*...*40
P = math.prod(range(2, 41, 2))
k = 0
while P % 3 ** (k + 1) == 0:
    k += 1
t.choice("s1q7", k)

# s1q8: run of n consecutive days with exactly 3 Sundays (day d is a Sunday when d % 7 == 0)
def possible(n):
    return any(sum(1 for d in range(s, s + n) if d % 7 == 0) == 3 for s in range(7))
t.where("s1q8", lambda n: possible(int(n)))

# s1q9: owner o, nephew n: o + n = 62, o - 5 = 3(n - 5); years until o + t = 2(n + t)
(o, n), = [(62 - n, n) for n in range(1, 62) if 62 - n - 5 == 3 * (n - 5)]
t.value("s1q9", next(y for y in range(0, 100) if o + y == 2 * (n + y)))

# DI: orchards (water in thousand liters per tree, yield in kg per tree); trend line through (0, 10) and (12, 40)
orch = {"A": (2.5, 19), "B": (1, 12), "C": (6, 27), "D": (3, 15), "E": (7.5, 32),
        "F": (4, 22), "G": (11, 38), "H": (5.5, 23), "I": (8.5, 28), "J": (1.5, 14)}
yields = [y for _, y in orch.values()]

# s1q10: slope of the trend line
t.choice("s1q10", F(40 - 10, 12 - 0))

# s1q11: group with the greatest standard deviation of yields
def sd(vals):
    m = F(sum(vals), len(vals))
    return sum((v - m) ** 2 for v in vals) / len(vals)  # variance orders the same as SD
groups = [[orch[c.strip()][1] for c in ch.replace(" and ", ",").split(",")] for ch in t.choices("s1q11")]
assert all(len(g) == 3 for g in groups)
v = [sd(g) for g in groups]
assert sorted(v)[-1] > sorted(v)[-2]
t.sel("s1q11", [v.index(max(v))])

# s1q12: drop one orchard so the mean of the other nine equals their median
def med(vals):
    s = sorted(vals); return s[len(s) // 2]
drops = [y for i, y in enumerate(yields) if F(sum(yields) - y, 9) == med(yields[:i] + yields[i + 1:])]
assert len(drops) == 1
t.value("s1q12", drops[0])

# s2q1: same z in Q as 7.2 in P; A = that value, B = 7.2
z = (F(72, 10) - 6) / F(8, 10)
t.qc("s2q1", [(5 + z * F(15, 10), F(72, 10))])

# s2q2: integers x with (x - 3)/(x + 2) >= 2; A = count, B = 5
S = [x for x in range(-1000, 1000) if x != -2 and F(x - 3, x + 2) >= 2]
t.qc("s2q2", [(len(S), 5)])

# s2q3: density the segment (0, 0.1)-(4, 0.4); A = P(X < 2) by exact trapezoid integration, B = 0.4
dens = lambda x: F(1, 10) + F(3, 40) * x
assert (dens(0) + dens(4)) / 2 * 4 == 1
t.qc("s2q3", [((dens(0) + dens(2)) / 2 * 2, F(4, 10))])

# s2q4: trapezoid AB || DC, AB = 4, DC = 10, height h; A = area ABC, B = 30% of the trapezoid
t.qc("s2q4", [(F(1, 2) * 4 * h, F(3, 10) * F(1, 2) * (4 + 10) * h) for h in (F(1, 3), 1, 5, 17)])

# s2q5: area under g(x) = 3 f(2x - 5), f the tent (-2,0)-(1,4)-(4,0); numeric integration (exact for piecewise linear on a fine grid)
def f(u):
    if -2 <= u <= 1: return F(4) * (u + 2) / 3
    if 1 < u <= 4: return F(4) * (4 - u) / 3
    return F(0)
lo, hi, N = F(3, 2), F(9, 2), 600
h = (hi - lo) / N
area = sum((3 * f(2 * (lo + i * h) - 5) + 3 * f(2 * (lo + (i + 1) * h) - 5)) / 2 * h for i in range(N))
t.qc("s2q5", [(area, 20)])

# s2q6: slope (0 - 2k)/4 = -3; y-intercept
k6 = next(k for k in range(-100, 100) if F(0 - 2 * k, 4) == -3)
t.choice("s2q6", 0 - (-3) * (k6 + 4))

# s2q7: three dice, product a multiple of 12
outs = [(a, b, c) for a in range(1, 7) for b in range(1, 7) for c in range(1, 7)]
t.choice("s2q7", F(sum(1 for o in outs if math.prod(o) % 12 == 0), len(outs)))

# s2q8: right triangle, hypotenuse 20, inradius 3; legs from a + b = 26, a^2 + b^2 = 400
s_ab = 20 + 2 * 3
ab = F(s_ab ** 2 - 400, 2)
disc = s_ab ** 2 - 4 * ab
assert disc > 0
a = (s_ab + math.sqrt(disc)) / 2; b = s_ab - a
assert abs(a * a + b * b - 400) < 1e-9 and abs((a + b - 20) / 2 - 3) < 1e-12
t.choice("s2q8", ab / 2)

# s2q9: 0.85 (c + 12) = c + 3
t.choice("s2q9", next(F(c, 100) for c in range(1, 100000) if F(85, 100) * (F(c, 100) + 12) == F(c, 100) + 3))

# s2q10: edges 3, 4, 12
t.choice("s2q10", 3 + 4 + 12 - math.isqrt(3 * 3 + 4 * 4 + 12 * 12))

# s2q11: (6^41 + 8^41) mod 20
t.choice("s2q11", (6 ** 41 + 8 ** 41) % 20)

# s2q12: 8:24
hour, minute = 8 * 30 + F(24, 2), 24 * 6
ang = abs(hour - minute); ang = min(ang, 360 - ang)
t.choice("s2q12", ang)

# s2q13: (-4,0), (6,0), (0,k) isosceles
def iso(k):
    s = sorted([math.dist((-4, 0), (6, 0)), math.dist((-4, 0), (0, k)), math.dist((6, 0), (0, k))])
    return abs(s[0] - s[1]) < 1e-9 or abs(s[1] - s[2]) < 1e-9
t.where("s2q13", lambda k: k != 0 and iso(float(k)))

# s2q14: distances from (4, -6) to the upper semicircle of radius 5
ds = [math.dist((5 * math.cos(th), 5 * math.sin(th)), (4, -6)) for th in (math.pi * i / 200000 for i in range(200001))]
dmin, dmax = min(ds), max(ds)
assert abs(dmin - math.sqrt(37)) < 1e-9 and abs(dmax - (5 + math.sqrt(52))) < 1e-6
t.where("s2q14", lambda d: math.sqrt(37) - 1e-9 <= float(d) <= 5 + math.sqrt(52) + 1e-9)

# s2q15: 9 distinct fields, each wheat or barley, each crop on at least 3
t.value("s2q15", sum(1 for m in range(2 ** 9) if 3 <= bin(m).count("1") <= 6))

t.done()
