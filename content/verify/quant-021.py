"""Verify every key in content/tests/quant-021.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations
import math

from keys import Keys, number

t = Keys("quant-021")


def factor(n):
    f, p = {}, 2
    while p * p <= n:
        while n % p == 0:
            f[p] = f.get(p, 0) + 1
            n //= p
        p += 1
    if n > 1:
        f[n] = f.get(n, 0) + 1
    return f


def ndiv(f):
    r = 1
    for e in f.values():
        r *= e + 1
    return r


# s1q1: 5^30 vs 10^22
t.qc("s1q1", [(5**30, 10**22)])

# s1q2: 240 <= w <= 260; greatest percent one bag exceeds another, vs 8
ws = [F(240) + F(k, 10) for k in range(0, 201)]
assert all(abs(w - 250) <= 10 for w in ws)
t.qc("s1q2", [(max((a - b) / b * 100 for a in (ws[0], ws[-1]) for b in (ws[0], ws[-1])), 8)])

# s1q3: x < -1: 1/(1 + 1/x) vs 1
xs = [F(-n, 7) for n in range(8, 400)]
t.qc("s1q3", [(1 / (1 + 1 / x), 1) for x in xs])

# s1q4: n^2 has 9 divisors and 2n has 6; A = divisors of n, B = 4
cases = []
for n in range(1, 20000):
    f = factor(n)
    sq = {p: 2 * e for p, e in f.items()}
    tw = dict(f); tw[2] = tw.get(2, 0) + 1
    if ndiv(sq) == 9 and ndiv(tw) == 6:
        cases.append((ndiv(f), 4))
t.qc("s1q4", cases)

# s1q5: 162,000 yen -> dollars at 150 -> euros at 1.08
t.choice("s1q5", F(162000) / 150 / F(108, 100))

# s1q6: rate ~ C / D^2; C x1.5, D x1.25: percent change
change = (F(3, 2) / F(5, 4) ** 2 - 1) * 100
def signed(c):
    v = number(c.split("by ")[1].rstrip(".")) if "by " in c else F(0)
    return -v if "decreases" in c else v
t.sel("s1q6", [i for i, c in enumerate(t.choices("s1q6")) if signed(c) == change])

# s1q7: 4 of 5 shirts (<=2), 4 hats, 3 scarves (<=1)
kinds = "s" * 5 + "h" * 4 + "c" * 3
t.choice("s1q7", sum(1 for cmb in combinations(range(12), 4)
                     if sum(kinds[i] == "s" for i in cmb) <= 2 and sum(kinds[i] == "c" for i in cmb) <= 1))

# s1q8: strictly inside x^2 + y^2 - 6x + 4y = 12
pts = [(0, 2), (-1, -2), (6, -5), (8, -2), (-2, 1), (2, 2)]
assert [str(p).replace(" ", "") for p in pts] == [c.replace(" ", "") for c in t.choices("s1q8")]
t.sel("s1q8", [i for i, (x, y) in enumerate(pts) if x * x + y * y - 6 * x + 4 * y < 12])

# s1q9: 300 mL at 12% + 200 mL at 4% + 100 mL at c% = 600 mL at 10%: c
c = (F(10, 100) * 600 - F(12, 100) * 300 - F(4, 100) * 200) / 100 * 100
t.value("s1q9", c)

# DI: 800 students; grade shares and within-grade hour distributions
size = {9: 240, 10: 200, 11: 200, 12: 160}
assert sum(size.values()) == 800 and [F(size[g], 800) * 100 for g in size] == [30, 25, 25, 20]
pct = {9: [45, 25, 15, 10, 5], 10: [30, 25, 20, 15, 10], 11: [15, 25, 25, 20, 15], 12: [10, 20, 25, 25, 20]}
assert all(sum(v) == 100 for v in pct.values())
cnt = {g: [F(size[g] * p, 100) for p in pct[g]] for g in size}

# s1q10: grade 12 with 30+ hours as a percent of all 800
t.choice("s1q10", (cnt[12][3] + cnt[12][4]) / 800 * 100)

# s1q11: grade 10: club 84, 4/5 of the 30+ group in the club; neither
hi = cnt[10][3] + cnt[10][4]
both = F(4, 5) * hi
t.choice("s1q11", size[10] - (84 + hi - both))

# s1q12: grade 11, students with at least 10 hours: interval of the 60th percentile
sub = [F(0)] + cnt[11][1:]
pos = F(60, 100) * sum(sub)
def row_of(k):
    run = 0
    for r, c in enumerate(sub):
        run += c
        if k <= run:
            return r
assert row_of(pos) == row_of(math.floor(pos)) == row_of(math.ceil(pos) + 1)
t.sel("s1q12", [row_of(pos)])

# s2q1: box plot Q1 18, Q3 34; each price * 1.2 + 3; new IQR vs 20
q1, q3 = 18, 34
t.qc("s2q1", [((F(6, 5) * q3 + 3) - (F(6, 5) * q1 + 3), 20)])

# s2q2: (x^2 - 5)^2 = (x + 1)^2: sum of distinct real roots vs 1
roots = set()
for b, c in ((-1, -6), (1, -4)):  # x^2 - x - 6 and x^2 + x - 4
    disc = b * b - 4 * c
    assert disc > 0
    for s in (1, -1):
        roots.add(round((-b + s * math.sqrt(disc)) / 2, 12))
assert all(abs((r * r - 5) ** 2 - (r + 1) ** 2) < 1e-6 for r in roots) and len(roots) == 4
t.qc("s2q2", [(F(round(sum(roots), 9)), 1)])

# s2q3: arcs AB = 100, CD = 40, O inside ABCD (every arc < 180); angle AEB
def pt(deg):
    return math.cos(math.radians(deg)), math.sin(math.radians(deg))
def meet(p1, p2, p3, p4):
    (x1, y1), (x2, y2), (x3, y3), (x4, y4) = p1, p2, p3, p4
    d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    a, b = x1 * y2 - y1 * x2, x3 * y4 - y3 * x4
    return (a * (x3 - x4) - (x1 - x2) * b) / d, (a * (y3 - y4) - (y1 - y2) * b) / d
def ang(v, p, q):
    a = (p[0] - v[0], p[1] - v[1]); b = (q[0] - v[0], q[1] - v[1])
    return math.degrees(math.acos((a[0] * b[0] + a[1] * b[1]) / math.hypot(*a) / math.hypot(*b)))
vals = []
for bc in range(41, 180):
    da = 360 - 100 - 40 - bc
    assert 0 < da < 180
    A, B, C, D = pt(0), pt(100), pt(100 + bc), pt(140 + bc)
    E = meet(A, C, B, D)
    vals.append((F(round(ang(E, A, B), 9)), 70))
t.qc("s2q3", vals)

# s2q4: radius x1.2, height x0.7
t.qc("s2q4", [(F(6, 5) ** 2 * F(7, 10), 1)])

# s2q5: f(x + 1) = x^2 + 2x - 3; t with f(t) = 0; f(t+1) vs f(t-1)
def f(u):
    x = F(u) - 1
    return x * x + 2 * x - 3
zeros = [F(k, 4) for k in range(-400, 401) if f(F(k, 4)) == 0]
assert len(zeros) == 2
t.qc("s2q5", [(f(z + 1), f(z - 1)) for z in zeros])

# s2q6: y = kx - 1 strictly below the segment from (2,3) to (6,1); which description fits all k on a grid
def ok(k):
    return all(k * x - 1 < 3 - F(x - 2, 2) for x in [F(2) + F(j, 50) * 4 for j in range(51)])
grid = [F(j, 60) for j in range(-300, 300)]
good = {k for k in grid if ok(k)}
descr = [lambda k: k < F(1, 3), lambda k: k < F(3, 4), lambda k: k < 2, lambda k: F(1, 3) < k < 2, lambda k: k > F(1, 3)]
t.sel("s2q6", [i for i, d in enumerate(descr) if all(d(k) == (k in good) for k in grid)])

# s2q7: 1000 at t=0, 3000 at t=8, doubling every 8 years; first t with balance >= 40000
def bal(tt):
    return 1000 * 2 ** (tt / 8) + (3000 * 2 ** ((tt - 8) / 8) if tt >= 8 else 0)
lo, hi_ = 8.0, 80.0
for _ in range(200):
    mid = (lo + hi_) / 2
    lo, hi_ = (mid, hi_) if bal(mid) < 40000 else (lo, mid)
assert abs(hi_ - round(hi_)) < 1e-9
t.choice("s2q7", round(hi_))

# s2q8: P(Theo only | exactly one)
r, th = F(2, 3), F(1, 4)
t.choice("s2q8", (1 - r) * th / ((1 - r) * th + r * (1 - th)))

# s2q9: last two digits
t.choice("s2q9", 1996 * 2997 * 3998 % 100)

# s2q10: n(n-3)/2 = 5n; diagonals from one vertex
n = next(n for n in range(4, 200) if n * (n - 3) == 10 * n)
t.choice("s2q10", n - 3)

# s2q11: acute triangle, B = 70, angle between bisector and altitude from A is 12; find A
sols = []
for a10 in range(1, 1100):
    Aang = F(a10, 10); Cang = 110 - Aang
    if not (0 < Cang < 90 and Aang < 90):
        continue
    # place B at origin, C on the x-axis; A above
    Bp = (0.0, 0.0); Cp = (1.0, 0.0)
    ab = math.sin(math.radians(float(Cang))) / math.sin(math.radians(float(Aang)))
    Ap = (ab * math.cos(math.radians(70)), ab * math.sin(math.radians(70)))
    foot = (Ap[0], 0.0)
    # bisector direction from A: unit(AB) + unit(AC)
    u = [(Bp[i] - Ap[i]) / math.dist(Ap, Bp) + (Cp[i] - Ap[i]) / math.dist(Ap, Cp) for i in range(2)]
    q = (Ap[0] + u[0], Ap[1] + u[1])
    if abs(ang(Ap, q, foot) - 12) < 1e-6:
        sols.append(Aang)
assert len(sols) == 1
t.choice("s2q11", sols[0])

# s2q12: floor plan: 24 x 14 rectangle minus a 6-6 right triangle plus a half-disk of radius 4
leg = 24 - 18
height = 8 + leg
diam = height - 3 - 3
area = 24 * height - leg * leg / 2 + math.pi * (diam / 2) ** 2 / 2
t.where("s2q12", lambda v: abs(v - area) < 1e-9)

# s2q13: expressions equal to R(x) = (9 - x^2)/(x^2 - 3x) wherever R is defined (and defined there)
exprs = [lambda x: (x + 3) / x, lambda x: -1 - 3 / x, lambda x: (x * x + 6 * x + 9) / (-x * x - 3 * x),
         lambda x: (3 + x) / (-x), lambda x: (x * x - 9) / (3 * x - x * x)]
def R(x):
    return (9 - x * x) / (x * x - 3 * x)
test_x = [F(k, 4) for k in range(-40, 41) if k not in (0, 12)]
def same(e):
    for x in test_x:
        try:
            if e(x) != R(x):
                return False
        except ZeroDivisionError:
            return False
    return True
t.sel("s2q13", [i for i, e in enumerate(exprs) if same(e)])

# s2q14: possible sums of the multiples of 3 from 1 to N
sums = {sum(range(3, N + 1, 3)) for N in range(3, 2000)}
t.where("s2q14", lambda v: v in sums)

# s2q15: negative integer k, integers x, y with 4x + y = 9 and kx + 2y = 3; x + y (must be unique)
vals = {x + (9 - 4 * x) for k in range(-500, 0) for x in range(-500, 501) if k * x + 2 * (9 - 4 * x) == 3}
assert len(vals) == 1
t.value("s2q15", vals.pop())

t.done()
