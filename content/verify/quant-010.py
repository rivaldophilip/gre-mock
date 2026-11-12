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

# s1q3: PQ = 7, QR = 9, PR = 10; angle P (opposite QR) vs angle R (opposite PQ) by the law of cosines
ang = lambda opp, s1, s2: math.degrees(math.acos((s1 * s1 + s2 * s2 - opp * opp) / (2 * s1 * s2)))
t.qc("s1q3", [(ang(9, 7, 10), ang(7, 9, 10))])  # A opposite 9; B between 9 and 10 = opposite 7

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

# s1q5: 40% of the 30% dog owners
t.choice("s1q5", F(40, 100) * 30)

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

# s1q7: exactly 2 electricians; Kim only if Lee
people7 = ["Kim", "Lee", "c3", "c4", "c5", "c6", "e1", "e2", "e3", "e4"]
t.choice("s1q7", sum(1 for crew in combinations(people7, 4)
                     if sum(p.startswith("e") for p in crew) == 2 and ("Kim" not in crew or "Lee" in crew)))

# s1q8: statements true for every real x (grid including negatives and non-integers)
xs8 = [F(k, 4) for k in range(-40, 41)]
st8 = [lambda x: abs(x) >= x, lambda x: abs(x) >= -x, lambda x: abs(x - 1) >= abs(x) - 1, lambda x: abs(x) ** 2 == x * x, lambda x: abs(-x) == x, lambda x: math.sqrt(x * x) == x]
t.sel("s1q8", [i for i, f in enumerate(st8) if all(f(x) for x in xs8)])

# s1q9: 6 painters x 10 hours; 4 painters
t.value("s1q9", F(6 * 10, 4))

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

# s1q10: groups whose IQR is at least 15
t.sel("s1q10", [sum(1 for _, f in groups.values() if f[3] - f[1] >= 15)])

# s1q11: range of all runners minus range of the 30-49 group
lo11 = min(f[0] for _, f in groups.values())
hi11 = max(f[4] for _, f in groups.values())
t.choice("s1q11", (hi11 - lo11) - (groups["30-49"][1][4] - groups["30-49"][1][0]))

# s1q12: greatest P(30-49 group and time < 55 | time < 60)
base = sum(below(g, 60)[0] for g in groups)
t.choice("s1q12", F(below("30-49", 55)[1], base))

# s2q1: last digit of 3^n + 7^n is 0; A = last digit of 9^n, B = 9
t.qc("s2q1", [(pow(9, n, 10), 9) for n in range(1, 200) if (pow(3, n, 10) + pow(7, n, 10)) % 10 == 0])

# s2q2: exterior angle at C = 130, A = B + 20; A = angle A, B = angle C
b2 = next(b for b in range(1, 180) if (b + 20) + b == 130)
t.qc("s2q2", [(b2 + 20, 180 - 130)])

# s2q3: 10 tickets, 4 winners; 3 draws with replacement (A) vs without (B); P(at least one winner)
tickets = [1] * 4 + [0] * 6
withr = [(a, b, c) for a in range(10) for b in range(10) for c in range(10)]
without = list(permutations(range(10), 3))
pa = F(sum(1 for d in withr if any(tickets[i] for i in d)), len(withr))
pb = F(sum(1 for d in without if any(tickets[i] for i in d)), len(without))
t.qc("s2q3", [(pa, pb)])

# s2q4: x^2 + 6x + k = (x + 3)^2 - 4 for all x; A = k, B = 5
xx = sp.Symbol("x")
k4 = sp.expand((xx + 3) ** 2 - 4 - xx**2 - 6 * xx)
t.qc("s2q4", [(k4, 5)])

# s2q5: -2<=x<=3, -4<=y<=1; A = max x^2-y^2, B = max xy (grid step 1/4)
xs = [F(i, 4) for i in range(-8, 13)]
ys = [F(i, 4) for i in range(-16, 5)]
t.qc("s2q5", [(max(x * x - y * y for x in xs for y in ys), max(x * y for x in xs for y in ys))])

# s2q6: lanes differ by 1.5 m in radius; extra distance over 2 laps
t.choice("s2q6", round(2 * 2 * math.pi * 1.5, 1))

# s2q7: 150 = 90 + 70 - both + neither, both = 2 neither
t.choice("s2q7", next(n for n in range(0, 151) if 90 + 70 - 2 * n + n == 150))

# s2q8: four unit circles in a 4 x 4 square; central region (grid count inside the centers' square, outside all circles)
cs = [(1, 1), (3, 1), (3, 3), (1, 3)]
N8 = 1000
inside = sum(1 for i in range(N8) for j in range(N8)
             if all((1 + 2 * (i + 0.5) / N8 - a) ** 2 + (1 + 2 * (j + 0.5) / N8 - b) ** 2 > 1 for a, b in cs))
est = inside * 4 / N8**2
assert abs(est - (4 - math.pi)) < 0.01, est
vals8 = [4 - math.pi, 16 - 4 * math.pi, 2 - math.pi / 2, 4 * math.pi - 4, math.pi - 2]
t.sel("s2q8", [i for i, v in enumerate(vals8) if abs(v - est) < 0.01])

# s2q9: x + y = 24 = 3(x - y); larger
t.choice("s2q9", max((24 + d) / 2 for d in (F(24, 3),)))

# s2q10: terminating decimal: reduced denominator has only 2s and 5s
def terminates(fr):
    d = fr.denominator
    for p in (2, 5):
        while d % p == 0:
            d //= p
    return d == 1
fr10 = [F(7, 12), F(5, 14), F(11, 24), F(21, 56), F(13, 30)]
t.sel("s2q10", [i for i, fr in enumerate(fr10) if terminates(fr)])

# s2q11: president, vice president, then a 3-member committee from the other 8
t.choice("s2q11", sum(1 for p in range(10) for v in range(10) if v != p for _ in combinations([m for m in range(10) if m not in (p, v)], 3)))

# s2q12: s sqrt2 = s + 1
s12 = 1 / (math.sqrt(2) - 1)
vals12 = [math.sqrt(2) - 1, 1, math.sqrt(2), math.sqrt(2) + 1, 2 * math.sqrt(2)]
t.sel("s2q12", [i for i, v in enumerate(vals12) if math.isclose(v, s12)])

# s2q13: x^2 + kx + 9 < 0 has a real solution: check the vertex value exactly
t.where("s2q13", lambda k: 9 - k * k / 4 < 0)

# s2q14: sums of 5 consecutive integers
sums14 = {sum(range(m, m + 5)) for m in range(-100, 100)}
t.where("s2q14", lambda v: v in sums14)

# s2q15: pieces 12 (w x h), 18 (shares h), 30 (shares w), all integer sides; least perimeter
per = [2 * (w + 18 // h + h + 30 // w) for w in range(1, 13) for h in range(1, 13)
       if w * h == 12 and 18 % h == 0 and 30 % w == 0]
t.value("s2q15", min(per))

t.done()
