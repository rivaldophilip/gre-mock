"""Verify every key in content/tests/quant-011.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
import math
import random

from keys import Keys

t = Keys("quant-011")
random.seed(11)

# s1q1: 5 cents per square inch; dollars for 2 square yards vs 120 (count unit squares of 1 inch)
in_per_yd = 3 * 12
sq_in = 2 * sum(1 for _ in range(in_per_yd) for _ in range(in_per_yd))
t.qc("s1q1", [(F(sq_in * 5, 100), 120)])

# s1q2: ticks 0..9 equally spaced, tick 2 = -1/3, tick 7 = 1/2; P at tick 0, Q at tick 9
step = (F(1, 2) - F(-1, 3)) / (7 - 2)
pos = lambda i: F(-1, 3) + (i - 2) * step
t.qc("s1q2", [(pos(0) + pos(9), step)])

# s1q3: ray direction phi, line k at 0 deg, line m at alpha; smaller ray-line angles 25 and 40
def ray_line(phi, alpha):
    d = (phi - alpha) % 180
    return min(d, 180 - d)
acute = {min(a, 180 - a) for phi in range(360) for a in range(1, 180) if ray_line(phi, 0) == 25 and ray_line(phi, a) == 40}
t.qc("s1q3", [(a, 65) for a in acute])

# s1q4: nonzero x with 6/x > x - 1; A = x, B = -2
xs = [F(n, 7) for n in range(-200, 200) if n != 0]
t.qc("s1q4", [(x, -2) for x in xs if F(6) / x > x - 1])

# s1q5: xy constant; x up 25% -> percent decrease in y
x0, y0 = F(4), F(5)
y1 = x0 * y0 / (x0 * F(125, 100))
t.choice("s1q5", (y0 - y1) / y0 * 100)

# s1q6: X(t) = m 2^(-t/6), Y(t) = 4m 2^(-t/3): equal when exponents match
t.choice("s1q6", next(h for h in (F(n, 4) for n in range(1, 400)) if 2 - h / 3 == -h / 6))

# s1q7: remainder of -(2^100) on division by 7 (Python's % gives the nonnegative remainder)
t.choice("s1q7", (-(2**100)) % 7)

# s1q8: ax + by = c with ab < 0, bc > 0; which of I, II, III, IV, origin, positive x-axis it must pass through
def visits(a, b, c):
    xs = [F(s * 10**e) for s in (1, -1) for e in range(-6, 7)]
    pts = [(x, (c - a * x) / b) for x in xs]
    q = [any(x > 0 and y > 0 for x, y in pts), any(x < 0 and y > 0 for x, y in pts),
         any(x < 0 and y < 0 for x, y in pts), any(x > 0 and y < 0 for x, y in pts)]
    return q + [c == 0, a != 0 and F(c, 1) / a > 0]
must = None
for _ in range(3000):
    a, b, c = (F(random.choice([-1, 1]) * random.randint(1, 50), random.randint(1, 9)) for _ in range(3))
    if a * b < 0 and b * c > 0:
        v = visits(a, b, c)
        must = v if must is None else [m and x for m, x in zip(must, v)]
t.sel("s1q8", [i for i, m in enumerate(must) if m])

# s1q9: 3000 for 10 months (Mar-Dec) + 1500 for 4 months (Sep-Dec) at 4%/yr simple
months = lambda start: 12 - start + 1
t.value("s1q9", F(3000) * F(4, 100) * F(months(3), 12) + F(1500) * F(4, 100) * F(months(9), 12))

# DI: under-30 (bottom) and 30+ (top) counts per interval [0,4), [4,8), [8,12), [12,16)
under = [25, 30, 15, 10]
older = [35, 40, 35, 10]
assert sum(under) + sum(older) == 200
ratios = [F(o, u) for o, u in zip(older, under)]
best = max(ratios)
t.sel("s1q10", 4 if ratios.count(best) > 1 else ratios.index(best))
mids = [2, 6, 10, 14]
t.choice("s1q11", F(sum(m * u for m, u in zip(mids, under)), sum(under)))
core_all = sum(under[2:]) + sum(older[2:])
target = F(sum(under[2:]), sum(under))
t.choice("s1q12", next(n for n in range(0, 1000) if F(core_all, 200 + n) == target))

# s2q1: 40 amounts in cents, each rounded half-up to whole dollars; rounded total 1000; A = actual total, B = 1020
pairs = []
for trial in range(3000):
    r = [25] * 40
    off = [49] * 40 if trial == 0 else [random.randint(-50, 49) for _ in range(40)]
    amounts = [F(100 * ri + o, 100) for ri, o in zip(r, off)]
    assert all(math.floor(a + F(1, 2)) == ri for a, ri in zip(amounts, r))
    pairs.append((sum(amounts), 1020))
t.qc("s2q1", pairs)

# s2q2: N(70, variance 36); percent below 82 vs 95
sd = math.sqrt(36)
pct = 50 * (1 + math.erf((82 - 70) / sd / math.sqrt(2)))
t.qc("s2q2", [(pct, 95)])

# s2q3: a1 = 1, a_{n+1} = a_n + 1/(n(n+1)); a_50 vs 1.98
a = F(1)
for n in range(1, 50):
    a += F(1, n * (n + 1))
t.qc("s2q3", [(a, F(198, 100))])

# s2q4: f from the table; k with f(f(k)) = k vs 3
f = {1: 3, 2: 5, 3: 4, 4: 1, 5: 2}
t.qc("s2q4", [(k, 3) for k in f if f[f[k]] == k])

# s2q5: piecewise-linear f through the vertices; g(x) = f(1 - x); A = g(4), B = 2 g(0)
V = [(-4, 1), (-2, 4), (0, 0), (2, 2), (4, -2)]
def fv(x):
    for (x0, y0), (x1, y1) in zip(V, V[1:]):
        if x0 <= x <= x1:
            return F(y0) + F(y1 - y0, x1 - x0) * (x - x0)
g = lambda x: fv(1 - x)
t.qc("s2q5", [(g(4), 2 * g(0))])

# s2q6: ages: j - (m - j) = 4 and m + (m - j) = 25
t.choice("s2q6", next(m for m in range(1, 100) for j in range(1, m + 1) if j - (m - j) == 4 and m + (m - j) == 25))

# s2q7: outer hexagon area 96; circle radius r = outer apothem = inner side
hexarea = lambda s: 3 * math.sqrt(3) / 2 * s * s
s_out = math.sqrt(96 / (3 * math.sqrt(3) / 2))
r = s_out * math.sqrt(3) / 2
t.choice("s2q7", F(round(hexarea(r), 9)))

# s2q8: AB = AC = 5, BD = 3, D strictly between B and C; sweep BC over (3, 10); which statements always hold
def stmts(bc):
    h2 = 25 - bc * bc / 4
    bx, cx = -bc / 2, bc / 2
    dx = bx + 3
    ad2 = dx * dx + h2
    return [bc - 3 == 3, ad2 == 16, dx == 0, ad2 < 25, bc > 6]
cases = [stmts(F(n, 100)) for n in range(301, 1000)]
t.sel("s2q8", [i for i in range(5) if all(c[i] for c in cases)])

# s2q9: P(3,7), Q = reflection across y = x, R = reflection across the x-axis; shoelace area
P = (3, 7); Q = (P[1], P[0]); R = (P[0], -P[1])
area = F(abs(P[0] * (Q[1] - R[1]) + Q[0] * (R[1] - P[1]) + R[0] * (P[1] - Q[1])), 2)
t.choice("s2q9", area)

# s2q10: (a+b)^2 = 64, (a-b)^2 = 16: ab over every sign choice
prods = {F(s + d, 2) * F(s - d, 2) for s in (8, -8) for d in (4, -4)}
assert len(prods) == 1
t.choice("s2q10", prods.pop())

# s2q11: regular 12-gon: diagonals whose segment contains the center
n = 12
pts = [(math.cos(2 * math.pi * i / n), math.sin(2 * math.pi * i / n)) for i in range(n)]
diag = [(i, j) for i in range(n) for j in range(i + 2, n) if not (i == 0 and j == n - 1)]
through = [(i, j) for i, j in diag if abs(pts[i][0] + pts[j][0]) < 1e-9 and abs(pts[i][1] + pts[j][1]) < 1e-9]
t.choice("s2q11", len(diag) - len(through))

# s2q12: mean minus median of X
dist = {1: F(35, 100), 2: F(20, 100), 3: F(10, 100), 4: F(15, 100), 5: F(20, 100)}
mean = sum(x * p for x, p in dist.items())
med = next(x for x in dist if sum(p for y, p in dist.items() if y <= x) >= F(1, 2) and sum(p for y, p in dist.items() if y >= x) >= F(1, 2))
t.choice("s2q12", mean - med)

# s2q13: random 40-number data sets matching each five-number summary (median of halves for quartiles)
def median(v):
    v = sorted(v); n = len(v)
    return (v[(n - 1) // 2] + v[n // 2]) / 2
def summary(v):
    v = sorted(v)
    return (v[0], median(v[:20]), median(v), median(v[20:]), v[-1])
def make(mn, q1, md, q3, mx):
    while True:
        e1 = random.choice([0, random.uniform(0, 10)]); e2 = random.choice([0, random.uniform(0, 10)]); e3 = random.choice([0, random.uniform(0, 10)])
        x9, x10, x19, x20, x29, x30 = q1 - e1, q1 + e1, md - e2, md + e2, q3 - e3, q3 + e3
        if not (mn <= x9 <= x10 <= x19 <= x20 <= x29 <= x30 <= mx):
            continue
        def fill(lo, hi, k):
            mode = random.choice(["lo", "hi", "mid"])
            return [lo if mode == "lo" else hi if mode == "hi" else random.uniform(lo, hi) for _ in range(k)]
        v = [mn] + fill(mn, x9, 8) + [x9, x10] + fill(x10, x19, 8) + [x19, x20] + fill(x20, x29, 8) + [x29, x30] + fill(x30, mx, 8) + [mx]
        s = summary(v)
        if all(abs(a - b) < 1e-9 for a, b in zip(s, (mn, q1, md, q3, mx))):
            return v
SP, SQ = (10, 20, 30, 45, 60), (15, 25, 35, 40, 70)
def check(P, Q):
    rng = lambda v: max(v) - min(v)
    iqr = lambda v: summary(v)[3] - summary(v)[1]
    return [rng(Q) > rng(P), iqr(P) > iqr(Q), sum(Q) / 40 > sum(P) / 40,
            sum(1 for x in Q if x > median(P)) >= 20,
            sum(1 for x in Q if x > 40) > sum(1 for x in P if x > 45),
            median(Q) - min(Q) > median(P) - min(P)]
res = [check(make(*SP), make(*SQ)) for _ in range(4000)]
t.sel("s2q13", [i for i in range(6) if all(r[i] for r in res)])

# s2q14: d(n^2) = 3 d(n)
def d(m):
    return sum(1 for i in range(1, m + 1) if m % i == 0)
t.where("s2q14", lambda n: d(int(n) ** 2) == 3 * d(int(n)))

# s2q15: 4 x 5 x 6 block, bottom (z = 0) unpainted; unit cubes with exactly 2 painted faces
cnt = sum(1 for i in range(4) for j in range(5) for k in range(6) if (i == 0) + (i == 3) + (j == 0) + (j == 4) + (k == 5) == 2)
t.value("s2q15", cnt)

t.done()
