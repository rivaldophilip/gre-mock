"""Verify every key in content/tests/quant-010.json: each answer is computed here and compared with the key."""
from fractions import Fraction as F
from itertools import permutations, combinations
import math
import random

import sympy as sp

from keys import Keys

t = Keys("quant-010")
random.seed(10)

# s1q1: x/y > 1 with x, y nonzero; A = x, B = y
t.qc("s1q1", [(F(x), F(y)) for x in range(-20, 21) for y in range(-20, 21) if x and y and F(x, y) > 1])

# s1q2: A = sqrt(8+2sqrt15) - sqrt(8-2sqrt15), B = sqrt12 (both positive: compare squares exactly)
A = sp.sqrt(8 + 2 * sp.sqrt(15)) - sp.sqrt(8 - 2 * sp.sqrt(15))
assert A.evalf() > 0
t.qc("s1q2", [(sp.nsimplify(sp.expand(A**2)), 12)])

# s1q3: sides 5 and 8 with included angle x < 60; A = third side, B = 7 (compare squares)
t.qc("s1q3", [(25 + 64 - 80 * math.cos(math.radians(x / 10)), 49) for x in range(1, 600)])

# s1q4: two sections of 10 scores, means 70 and 80, each SD 5; A = SD of all 20, B = 5.
# Sections built exactly (sympy) from random integer lists rescaled to the given mean and SD, both SD definitions.
def var(v, sample):
    m = sum(v) / sp.Integer(len(v))
    return sp.nsimplify(sp.expand(sum((x - m) ** 2 for x in v) / (len(v) - (1 if sample else 0))))
def rational_sqrt(q):
    n, d = math.isqrt(q.numerator), math.isqrt(q.denominator)
    return F(n, d) if n * n == q.numerator and d * d == q.denominator else None
def section(mean, sd, sample):
    while True:
        z = [sp.Integer(random.randint(-20, 20)) for _ in range(10)]
        v = var(z, sample)
        if v != 0:
            break
    m = sum(z) / sp.Integer(10)
    out = [mean + sd * (x - m) / sp.sqrt(v) for x in z]
    assert sp.simplify(sum(out) / 10 - mean) == 0 and sp.simplify(var(out, sample) - sd**2) == 0
    return out
pairs4 = []
for sample in (False, True):
    for _ in range(4):
        both = section(70, 5, sample) + section(80, 5, sample)
        pairs4.append((float(var(both, sample)), 25))
t.qc("s1q4", pairs4)

# s1q5: +25% then -30%, final is 1.05 below original; price after the raise
p = next(F(c, 100) for c in range(1, 100000) if F(c, 100) - F(c, 100) * F(5, 4) * F(7, 10) == F(105, 100))
t.choice("s1q5", p * F(5, 4))

# s1q6: swimmers from opposite ends of a 50 m pool at 5/4 and 1 m/s; time of the second meeting
L = 50
def pos(start, speed, tm):
    d = (speed * tm) % (2 * L)
    x = d if d <= L else 2 * L - d
    return x if start == 0 else L - x
v1, v2 = F(5, 4), F(1)
breaks = sorted({F(k * L) / v for v in (v1, v2) for k in range(0, 20)})
meets = []
for a, b in zip(breaks, breaks[1:]):
    fa, fb = pos(0, v1, a) - pos(L, v2, a), pos(0, v1, b) - pos(L, v2, b)
    if fa == 0 and a > 0 and (not meets or meets[-1] != a):
        meets.append(a)
    elif fa * fb < 0:
        meets.append(a + (b - a) * fa / (fa - fb))
t.choice("s1q6", meets[1])

# s1q7: 4 from 6 carpenters (Kim, Lee among them) and 4 electricians; >= 1 electrician; not both Kim and Lee
people = ["Kim", "Lee", "c3", "c4", "c5", "c6", "e1", "e2", "e3", "e4"]
t.choice("s1q7", sum(1 for c in combinations(people, 4) if any(x[0] == "e" for x in c) and not ("Kim" in c and "Lee" in c)))

# s1q8: |2x-5| <= 7 and |x+1| > 3
t.where("s1q8", lambda x: abs(2 * x - 5) <= 7 and abs(x + 1) > 3)

# s1q9: sopranos:altos = 5:3, 2 sopranos leave and 6 altos join -> equal; total now
k = next(k for k in range(1, 1000) if 5 * k - 2 == 3 * k + 6)
t.value("s1q9", (5 * k - 2) + (3 * k + 6))

# DI: five-number summaries; one-fourth of each group in each interval, all times distinct
groups = {"u30": (80, (35, 45, 50, 60, 75)), "30-49": (120, (40, 50, 60, 65, 85)), "50+": (60, (45, 60, 65, 75, 90))}
def below(g, x):
    """(least, greatest) possible number of runners in group g with time < x."""
    n, f = groups[g]
    c = n // 4
    lo = hi = 0
    for i in range(4):
        a, b = f[i], f[i + 1]
        if b <= x:
            lo += c; hi += c
        elif a < x:
            # the interval's runners straddle x (the group minimum, at a, is always below x)
            lo += 1 if i == 0 else 0
            hi += c - (1 if i == 3 else 0)
    return lo, hi

# s1q10: percent of all 260 under 60 minutes (each count must be determined)
counts = [below(g, 60) for g in groups]
assert all(lo == hi for lo, hi in counts)
total = sum(n for n, _ in groups.values())
t.choice("s1q10", round(100 * F(sum(lo for lo, _ in counts), total)))

# s1q11: possible mean of the under-30 group lies strictly between the quarter-lower-end and quarter-upper-end averages
n, f = groups["u30"]
mean_lo = F(sum(f[i] for i in range(4)), 4)
mean_hi = F(sum(f[i + 1] for i in range(4)), 4)
t.where("s1q11", lambda v: mean_lo < v < mean_hi)

# s1q12: greatest P(30-49 group and time < 55 | time < 60)
base = sum(below(g, 60)[0] for g in groups)
t.choice("s1q12", F(below("30-49", 55)[1], base))

# s2q1: A = units digit of 7^n * 3^n, B = units digit of 7^n + 3^n
t.qc("s2q1", [((7**n * 3**n) % 10, (7**n + 3**n) % 10) for n in range(1, 60)])

# s2q2: JK = 5, KL = 8, area 12 -> sin K = 3/5, cos K = +-4/5; A = JL, B = 8 (compare squares)
sin = F(2 * 12, 5 * 8)
cos_abs = rational_sqrt(1 - sin * sin)
t.qc("s2q2", [(25 + 64 - 2 * 5 * 8 * c, 64) for c in (cos_abs, -cos_abs)])

# s2q3: 10 tickets, 4 winners; 3 draws with replacement (A) vs without (B); P(at least one winner)
tickets = [1] * 4 + [0] * 6
withr = [(a, b, c) for a in range(10) for b in range(10) for c in range(10)]
without = list(permutations(range(10), 3))
pa = F(sum(1 for d in withr if any(tickets[i] for i in d)), len(withr))
pb = F(sum(1 for d in without if any(tickets[i] for i in d)), len(without))
t.qc("s2q3", [(pa, pb)])

# s2q4: (p+q)^2 = 49, (p-q)^2 = 9; A = p^2+q^2, B = 3pq over all real solutions
sols = [(F(s + d, 2), F(s - d, 2)) for s in (7, -7) for d in (3, -3)]
t.qc("s2q4", [(p * p + q * q, 3 * p * q) for p, q in sols])

# s2q5: -2<=x<=3, -4<=y<=1; A = max x^2-y^2, B = max xy (grid step 1/4)
xs = [F(i, 4) for i in range(-8, 13)]
ys = [F(i, 4) for i in range(-16, 5)]
t.qc("s2q5", [(max(x * x - y * y for x in xs for y in ys), max(x * y for x in xs for y in ys))])

# s2q6: radius 6, inscribed angle 45 -> segment area; find the central angle by placing C on the major arc
r = 6
def inscribed(theta):
    A_, B_ = (r, 0), (r * math.cos(theta), r * math.sin(theta))
    C_ = (r * math.cos(theta / 2 + math.pi), r * math.sin(theta / 2 + math.pi))
    u = (A_[0] - C_[0], A_[1] - C_[1]); w = (B_[0] - C_[0], B_[1] - C_[1])
    return math.degrees(math.acos((u[0] * w[0] + u[1] * w[1]) / math.hypot(*u) / math.hypot(*w)))
lo_, hi_ = 1e-6, math.pi
for _ in range(200):
    mid = (lo_ + hi_) / 2
    lo_, hi_ = (mid, hi_) if inscribed(mid) < 45 else (lo_, mid)
theta = lo_
seg = r * r / 2 * (theta - math.sin(theta))
pi, s3, s2 = math.pi, math.sqrt(3), math.sqrt(2)
vals6 = [9 * pi - 18, 9 * pi - 36, 9 * pi / 2 - 9 * s2, 18 * pi - 18, 27 * pi + 18]
t.sel("s2q6", [i for i, v in enumerate(vals6) if abs(v - seg) < 1e-6])

# s2q7: 120 people, sessions 70, 85, 40, everyone at >= 1; greatest number at all three
def feasible(x):
    for ab in range(0, 76):
        for ac in range(0, 76):
            bc = 75 - 2 * x - ab - ac
            if bc < 0:
                continue
            a, b, c = 70 - x - ab - ac, 85 - x - ab - bc, 40 - x - ac - bc
            if min(a, b, c) >= 0 and a + b + c + ab + ac + bc + x == 120:
                return True
    return False
t.choice("s2q7", max(x for x in range(0, 41) if feasible(x)))

# s2q8: hexagon in circle R = 6, circle inscribed in hexagon; (circle - hexagon) + (hexagon - small circle)
R = 6
V = [(R * math.cos(k * math.pi / 3), R * math.sin(k * math.pi / 3)) for k in range(6)]
hexa = abs(sum(V[i][0] * V[(i + 1) % 6][1] - V[(i + 1) % 6][0] * V[i][1] for i in range(6))) / 2
apo = math.hypot((V[0][0] + V[1][0]) / 2, (V[0][1] + V[1][1]) / 2)
region = (pi * R * R - hexa) + (hexa - pi * apo * apo)
vals8 = [9 * pi, 27 * pi, 54 * s3 - 27 * pi, 36 * pi - 54 * s3, 63 * pi - 108 * s3]
t.sel("s2q8", [i for i, v in enumerate(vals8) if abs(v - region) < 1e-6])

# s2q9: p + 2n + 3f = 26, 3p + 2n + f = 22; p + n + f over the whole solution family (f free)
sums = set()
for f in [F(i, 4) for i in range(0, 40)]:
    # solve the 2x2 system in p, n
    a1, b1, c1 = 1, 2, 26 - 3 * f
    a2, b2, c2 = 3, 2, 22 - f
    det = a1 * b2 - a2 * b1
    p_, n_ = (c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det
    sums.add(p_ + n_ + f)
assert len(sums) == 1
t.choice("s2q9", sums.pop())

# s2q10: (0.666... - 0.25) / (0.2 - 0.0333...); repeating decimals as limits of geometric series
def repeating(prefix_digits, rep, places):
    """0.<prefix><rep><rep>... where the prefix has `places` digits."""
    return F(prefix_digits, 10**places) + F(rep, 9 * 10**places)
t.choice("s2q10", (repeating(0, 6, 0) - F(1, 4)) / (F(1, 5) - repeating(0, 3, 1)))

# s2q11: 3-letter sequences from tiles KKKLLM
t.choice("s2q11", len(set(permutations("KKKLLM", 3))))

# s2q12: rectangle ABCD, AC = 12, angle CAB = 30, E on AB with angle ADE = 45; area of EBCD
ab, bc = 12 * math.cos(math.radians(30)), 12 * math.sin(math.radians(30))
Dp = (0, bc)
ex = next(i / 10**5 * ab for i in range(10**5) if math.degrees(math.atan2(i / 10**5 * ab, bc)) >= 45)
assert ex < ab
poly = [(ex, 0), (ab, 0), (ab, bc), Dp]
area12 = abs(sum(poly[i][0] * poly[(i + 1) % 4][1] - poly[(i + 1) % 4][0] * poly[i][1] for i in range(4))) / 2
vals12 = [36 * s3 - 18, 36 * s3 - 36, 18 * s3, 18 * s3 + 18, 54 - 18 * s3]
t.sel("s2q12", [i for i, v in enumerate(vals12) if abs(v - area12) < 1e-3])

# s2q13: -3 < a < 2, 1 < b < 4; which must be true (dense interior grid)
grid = [(F(i, 100), F(j, 100)) for i in range(-299, 200, 3) for j in range(101, 400, 3)]
stmts = [lambda a, b: a - b < 1, lambda a, b: a * b > -8, lambda a, b: a + b > -1,
         lambda a, b: a * a < 9, lambda a, b: a / b > -1, lambda a, b: b - a < 6]
t.sel("s2q13", [i for i, s in enumerate(stmts) if all(s(a, b) for a, b in grid)])

# s2q14: p^2 - q^2 = 72 with p, q positive integers; possible q
qs = {q for q in range(1, 200) if (s := math.isqrt(q * q + 72)) ** 2 == q * q + 72}
t.where("s2q14", lambda q: q in qs)

# s2q15: pieces 12 (w x h), 18 (shares h), 30 (shares w), all integer sides; least perimeter
per = [2 * (w + 18 // h + h + 30 // w) for w in range(1, 13) for h in range(1, 13)
       if w * h == 12 and 18 % h == 0 and 30 % w == 0]
t.value("s2q15", min(per))

t.done()
