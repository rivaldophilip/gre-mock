"""Verify every key in content/bank/quant/qbank-006.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import permutations
import math
import random

from keys import Keys

t = Keys("qbank-006")
random.seed(6)

# s1q1: regular polygon with interior angle sum 2340
n1 = next(n for n in range(3, 100) if (n - 2) * 180 == 2340)
t.value("s1q1", F(2340, n1))

# s1q2: rhombus, one angle 120, shorter diagonal 6 -> area
best = None
for s in [k / 1000 for k in range(1, 20000)]:
    d60 = 2 * s * math.sin(math.radians(30))   # diagonal across the 60-degree corner... (joins the 120 corners)
    d120 = 2 * s * math.sin(math.radians(60))
    if abs(min(d60, d120) - 6) < 1e-9:
        best = s * s * math.sin(math.radians(120))
t.choice("s1q2", best)


# s1q3: random interior points of a regular hexagon; compare alternating triangle sums
def tri(p, q, r):
    return abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2


V = [(math.cos(math.pi / 3 * k), math.sin(math.pi / 3 * k)) for k in range(6)]


def inside(p):
    for k in range(6):
        a, b = V[k], V[(k + 1) % 6]
        if (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) <= 0:
            return False
    return True


pairs3 = []
while len(pairs3) < 2000:
    p = (random.uniform(-1, 1), random.uniform(-1, 1))
    if inside(p):
        a = sum(tri(p, V[k], V[k + 1]) for k in (0, 2, 4))
        b = sum(tri(p, V[k], V[(k + 1) % 6]) for k in (1, 3, 5))
        pairs3.append((round(a, 9), round(b, 9)))
t.qc("s1q3", pairs3)

# s1q4: right trapezoid, D at origin, C=(c,0), B=(c,12), A=(c-ab,12); AD=13, DB bisects angle ADC, DC > AB
areas = set()
for ax in (5, -5):  # A = (ax, 12), |AD| = 13
    for c10 in range(1, 1000):
        c = c10 / 10
        ab = c - ax
        if ab <= 0 or not c > ab:
            continue
        ang_adb = math.atan2(12, c) - 0  # angle BDC
        u = (ax / 13, 12 / 13); w = (c, 12); wl = math.hypot(*w)
        ang_a = math.acos((u[0] * w[0] + u[1] * w[1]) / wl)
        if abs(ang_a - math.atan2(12, c)) < 1e-9:
            areas.add(round((ab + c) / 2 * 12, 6))
assert len(areas) == 1, areas
t.choice("s1q4", F(areas.pop()).limit_denominator())

# s1q5: f(x)=3x^2, f(a+b)-f(a)-f(b)=60 -> ab, for many (a, b) on that curve
vals5 = set()
for a in range(1, 30):
    b = F(10 * 1, 1) / a  # candidate; check the condition holds and record ab
    f = lambda x: 3 * x * x
    if f(a + b) - f(a) - f(b) == 60:
        vals5.add(a * b)
assert len(vals5) == 1
t.value("s1q5", vals5.pop())


# s1q6: f periodic with period 2, f = x^2 on [0, 2); count solutions of f(x) = 2 on [-3, 3]
def f6(x):
    return (x % 2) ** 2


sols6 = [math.sqrt(2) + 2 * k for k in range(-10, 10) if -3 <= math.sqrt(2) + 2 * k <= 3]
assert all(abs(f6(x) - 2) < 1e-9 for x in sols6)
# scan for sign changes to make sure no other roots exist
grid = [-3 + i * 6 / 600000 for i in range(600001)]
roots = sum(1 for x0, x1 in zip(grid, grid[1:]) if (f6(x0) - 2) * (f6(x1) - 2) < 0 and abs(f6(x1) - f6(x0)) < 1)
assert roots == len(sols6), (roots, sols6)
t.choice("s1q6", len(sols6))

# s1q7: f(g(x)) = g(f(x)); coefficients of the difference polynomial
f7 = lambda x: x * x - 2 * x
g7 = lambda x: 2 * x + 1
d = lambda x: f7(g7(x)) - g7(f7(x))  # quadratic: fit a x^2 + b x + c
c0, c1, c2 = d(0), d(1), d(2)
A = F(c2 - 2 * c1 + c0, 2); B = c1 - c0 - A; Cc = c0
assert B * B - 4 * A * Cc > 0
t.choice("s1q7", -F(B) / A)

# s1q8: x <> y = (x + y)/(xy)
op = lambda x, y: F(x + y) / (F(x) * y)
t.qc("s1q8", [(op(op(2, 3), 6), op(2, op(3, 6)))])

# s1q9: integer pairs (a, b) with x + a y = 3, b x + 4 y = 6 having no solution
cnt9 = 0
for a in range(-60, 61):
    for b in range(-60, 61):
        det = 1 * 4 - a * b
        if det != 0:
            continue
        # singular: consistent iff the augmented rows are proportional too
        consistent = (1 * 6 - 3 * b == 0) and (a * 6 - 3 * 4 == 0)
        if not consistent:
            cnt9 += 1
t.choice("s1q9", cnt9)

# s1q10: G = (wE + (100 - w)H)/100; which expressions equal w
forms10 = [
    lambda G, E, H: 100 * (G - H) / (E - H),
    lambda G, E, H: 100 * (H - G) / (H - E),
    lambda G, E, H: 100 * (G - H) / (E + H),
    lambda G, E, H: 100 - 100 * (E - G) / (E - H),
    lambda G, E, H: (100 * G - H) / (E - H),
    lambda G, E, H: 100 * (E - G) / (E - H),
]
ok10 = [True] * 6
for _ in range(200):
    E, H, w = F(random.randint(0, 100)), F(random.randint(0, 100)), F(random.randint(1, 99))
    if E == H:
        continue
    G = (w * E + (100 - w) * H) / 100
    for i, fm in enumerate(forms10):
        if fm(G, E, H) != w:
            ok10[i] = False
t.sel("s1q10", [i for i in range(6) if ok10[i]])

# s1q11: 6x - 4y = 10 and kx - 2y = m never meet: k must be 3, m any value but 5
pairs11 = []
for k in [F(n, 4) for n in range(-40, 41)]:
    for m in [F(n, 2) for n in range(-40, 41)]:
        det = 6 * (-2) - (-4) * k
        if det == 0:
            same = (6 * m - 10 * k == 0) and (-4 * m - 10 * (-2) == 0)
            if not same:
                pairs11.append((k, m))
assert {k for k, _ in pairs11} == {3}
t.qc("s1q11", pairs11)

# s1q12: 4(x + 2y) - 2(x + 3y) = 18; which quantities are constant on the solution line
exprs12 = [
    lambda x, y: (x + y) / 2,
    lambda x, y: x - y,
    lambda x, y: x * y,
    lambda x, y: x * x + 2 * x * y + y * y,
    lambda x, y: (x + y) ** 2 - 2 * x * y,
    lambda x, y: F(5) ** int(x) * F(5) ** int(y),
]
pts12 = []
for x in range(-20, 21):
    y = F(18 - 2 * x, 2)  # from 2x + 2y = 18
    assert 4 * (x + 2 * y) - 2 * (x + 3 * y) == 18
    pts12.append((F(x), y))
t.sel("s1q12", [i for i, e in enumerate(exprs12) if len({e(x, y) for x, y in pts12}) == 1])

# s1q13: percentile rank of 74
scores13 = [81, 66, 74, 93, 59, 72, 88, 74, 65, 70, 96, 77, 62, 74, 85, 68, 90, 73, 79, 71]
assert len(scores13) == 20
t.value("s1q13", F(100 * sum(1 for s in scores13 if s < 74), len(scores13)))


# s1q14: IQR of the 12 numbers over every k
def med(v):
    v = sorted(v)
    n = len(v)
    return F(v[n // 2]) if n % 2 else F(v[n // 2 - 1] + v[n // 2], 2)


base14 = [2, 4, 4, 7, 9, 10, 13, 15, 15, 18, 21]
pairs14 = []
for k in range(0, 200):
    v = sorted(base14 + [k])
    pairs14.append((med(v[6:]) - med(v[:6]), 11))
t.qc("s1q14", pairs14)


# helpers for lists with a given five-number summary (even n, halves by median)
def build(n, mn, q1, md, q3, mx, mode):
    """A sorted list of n values with the given summary; mode 'low' packs values low within each quarter, 'high' high, 'rand' random."""
    h, q = n // 2, n // 4
    # positions: q1 = avg(v[q-1], v[q]) for n = 4q; median avg(v[h-1], v[h]); q3 avg(v[h+q-1], v[h+q])
    assert n % 4 == 0
    v = [None] * n
    v[0], v[-1] = F(mn), F(mx)
    for (i, j, c, lo, hi) in [(q - 1, q, q1, mn, md), (h - 1, h, md, q1, q3), (h + q - 1, h + q, q3, md, mx)]:
        dmax = min(F(c) - lo, hi - F(c)) / 2
        dd = {"low": 0, "high": 0, "rand": F(random.randint(0, 100), 100) * dmax}[mode]
        v[i], v[j] = F(c) - dd, F(c) + dd
    # fill gaps
    filled = [i for i in range(n) if v[i] is not None]
    for a, b in zip(filled, filled[1:]):
        for i in range(a + 1, b):
            lo, hi = v[a], v[b]
            v[i] = {"low": lo, "high": hi, "rand": lo + F(random.randint(0, 100), 100) * (hi - lo)}[mode]
        seg = sorted(v[a + 1:b])
        v[a + 1:b] = seg
    assert v == sorted(v)
    return v


def summary(v):
    n = len(v)
    return (v[0], med(v[: n // 2]), med(v), med(v[n // 2:]), v[-1])


# s1q15: 40 sparrows: 60, 66, 70, 78, 96
S15 = (60, 66, 70, 78, 96)
lists15 = [build(40, *S15, m) for m in ["low", "high"] + ["rand"] * 300]
for v in lists15:
    assert summary(v) == tuple(F(x) for x in S15)
truth15 = []
truth15.append(all(med(v[20:]) - med(v[:20]) == 12 for v in lists15))
truth15.append(all(v[-1] - v[0] >= 3 * (med(v[20:]) - med(v[:20])) for v in lists15))
truth15.append(all(sum(v) / 40 > 70 for v in lists15))
truth15.append(all(sum(1 for x in v if x >= 66) >= 30 for v in lists15))


def bigger_max(v):
    w = v[:-1] + [F(110)]
    return med(w[20:]) - med(w[:20]) > med(v[20:]) - med(v[:20])


truth15.append(all(bigger_max(v) for v in lists15))
truth15.append(all(v and (med(v) - v[0]) < (med(v[20:]) - med(v)) for v in lists15))
t.sel("s1q15", [i for i, ok in enumerate(truth15) if ok])

# s1q16: X (8, 12, 18, 22, 28), Y (32, 36, 42, 46, 54), 20 each; combined IQR against medY - medX
pairs16 = []
for _ in range(500):
    m = random.choice(["low", "high", "rand", "rand"])
    X = build(20, 8, 12, 18, 22, 28, m)
    Y = build(20, 32, 36, 42, 46, 54, random.choice(["low", "high", "rand"]))
    allv = sorted(X + Y)
    pairs16.append((med(allv[20:]) - med(allv[:20]), med(Y) - med(X)))
t.qc("s1q16", pairs16)

# s1q17: 135 = 3600 * r * 9/12
t.choice("s1q17", F(135) / (3600 * F(9, 12)) * 100)

# s1q18: commission 5% of s if s <= 40000, 8% of s if s > 40000; possible amounts
def possible18(c):
    return (c / F(5, 100) <= 40000) or (c / F(8, 100) > 40000)


t.where("s1q18", possible18)

# s1q19: x in 5%, 10000 - x in 3%, 9 months, total 285
x19 = next(x for x in range(0, 10001) if F(3, 4) * (F(5, 100) * x + F(3, 100) * (10000 - x)) == 285)
t.value("s1q19", x19)


# s1q20: three-tier payback vs 5% of spending, s > 2000
def pay20(s):
    return F(2, 100) * min(s, 500) + F(5, 100) * max(0, min(s, 2000) - 500) + F(8, 100) * max(0, s - 2000)


t.qc("s1q20", [(pay20(F(s)), F(5, 100) * s) for s in range(2001, 10000, 7)])

# s1q21: simple vs annually compounded, 2000 at 10%
S = [2000 + 200 * y for y in range(4)]
Cb = [F(2000) * F(11, 10) ** y for y in range(4)]
truth21 = [S[1] == Cb[1], Cb[3] == 2662, Cb[3] - S[3] == 60, Cb[3] - Cb[2] == 242,
           Cb[3] == F(2000) * F(130, 100), (Cb[3] - 2000) == F(11, 10) * (S[3] - 2000)]
t.sel("s1q21", [i for i, ok in enumerate(truth21) if ok])

# s1q22: days for a factor of 32 at a factor of 4 per 6 days
t.choice("s1q22", round(6 * math.log(32) / math.log(4), 9))

# s1q23: A = 1000 * 3^(36/4); B = 9000 * (1 + 2)^(36/6)
t.value("s1q23", F(1000 * 3 ** 9, 9000 * 3 ** 6))

# s1q24: amount * 0.8^t = 0.5; compare t with 2.5
t.qc("s1q24", [(math.log(0.5) / math.log(0.8), 2.5)])


# s1q25: brute force small n to confirm the together/apart counts, then solve the ratio
def counts(n):
    together = sum(1 for p in permutations(range(n)) if abs(p.index(0) - p.index(1)) == 1)
    return together, math.factorial(n) - together


for n in range(3, 8):
    tg, ap = counts(n)
    assert tg == 2 * math.factorial(n - 1) and ap == math.factorial(n) - tg
n25 = [n for n in range(3, 40) if math.factorial(n) - 2 * math.factorial(n - 1) == 5 * 2 * math.factorial(n - 1)]
assert len(n25) == 1
t.choice("s1q25", n25[0])

# s1q26: triangle KLM, KL = 5, KM = 12; angle K is the largest and acute
ok26 = []
for c in [number for number in [F(23, 2), F(25, 2), F(13), F(27, 2), F(14)]]:
    a, b = F(5), F(12)
    if not (abs(a - b) < c < a + b):
        continue
    largest_at_K = c > a and c > b
    acute_K = c * c < a * a + b * b
    if largest_at_K and acute_K:
        ok26.append(c)
assert len(ok26) == 1
t.choice("s1q26", ok26[0])

# s1q27: worst case = (largest set avoiding the goal) + 1, computed per goal from the structure of 1..40
T = range(1, 41)


def max_avoid_same_class(mod, k):
    """largest set with fewer than k tickets in each remainder class"""
    return sum(min(k - 1, sum(1 for x in T if x % mod == r)) for r in range(mod))


def max_avoid_pairs(pair_of):
    """largest set containing no pair {x, pair_of(x)}: greedy on a perfect matching of disjoint pairs"""
    chosen = set()
    for x in T:
        y = pair_of(x)
        if y not in chosen:
            chosen.add(x)
    assert all(pair_of(x) not in chosen for x in chosen)
    return len(chosen)


need27 = [
    max_avoid_same_class(6, 2) + 1,
    sum(1 for x in T if x % 4) + 1,
    max_avoid_pairs(lambda x: 41 - x) + 1,
    max_avoid_same_class(4, 3) + 1,
    max_avoid_pairs(lambda x: x + 20 if x <= 20 else x - 20) + 1,
    max(sum(1 for x in T if x % 2 == 0), sum(1 for x in T if x % 2)) + 1,
]
shown27 = [7, 30, 21, 9, 20, 3]
t.sel("s1q27", [i for i in range(6) if need27[i] == shown27[i]])

# s1q28: 4b + 7n + 10p = 61, 2b + 3n + 4p = 27; b + n + p over the solution family
tot28 = set()
for p in [F(k, 4) for k in range(-20, 21)]:
    # solve the 2x2 in b, n for this p
    r1, r2 = 61 - 10 * p, 27 - 4 * p
    det = 4 * 3 - 7 * 2
    b = (r1 * 3 - 7 * r2) / det
    n = (4 * r2 - 2 * r1) / det
    assert 4 * b + 7 * n + 10 * p == 61 and 2 * b + 3 * n + 4 * p == 27
    tot28.add(b + n + p)
assert len(tot28) == 1
t.choice("s1q28", tot28.pop())

t.done()
