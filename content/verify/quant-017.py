"""Verify every key in content/tests/quant-017.json: each answer is computed here and compared with the key."""
from fractions import Fraction as F
from functools import lru_cache
from itertools import permutations
from math import comb, gcd, isqrt, pi, sqrt
import random

from keys import Keys

t = Keys("quant-017")
random.seed(17)

# s1q1: symmetric normal, mean 500, P(X > 512) = 12%; P(488 < X < 512) vs 76
t.qc("s1q1", [(100 - 12 - 12, 76)])

# s1q2: x, y > 1: (x+y)^(-1/2) vs x^(-1/2) + y^(-1/2)
pts = [(1 + random.random() * k, 1 + random.random() * k) for k in (0.01, 1, 10, 1000, 1e6) for _ in range(200)]
t.qc("s1q2", [((x + y) ** -0.5, x ** -0.5 + y ** -0.5) for x, y in pts])

# s1q3: x|x| = 3x + 4; solve each sign case of the quadratic
sols = set()
for sgn in (1, -1):  # sgn*x^2 - 3x - 4 = 0
    a, b, c = sgn, -3, -4
    disc = b * b - 4 * a * c
    if disc >= 0:
        for r in ((-b + sqrt(disc)) / (2 * a), (-b - sqrt(disc)) / (2 * a)):
            if (r >= 0) == (sgn == 1) and abs(r * abs(r) - (3 * r + 4)) < 1e-9:
                sols.add(round(r, 9))
assert sols == {4.0}
t.qc("s1q3", [(sum(sols), 3)])

# s1q4: p, q = 5 mod 6; A = (p^10 + q^10) mod 24, B = (p+q)^2 mod 24
vals = [p for p in range(5, 400, 6)]
t.qc("s1q4", [((p**10 + q**10) % 24, (p + q) ** 2 % 24) for p in vals for q in vals])

# s1q5: Q = c sqrt(LK); test each choice formula numerically
forms = [lambda Q, c, L: Q**2 / (c * L), lambda Q, c, L: Q**2 / (c**2 * L), lambda Q, c, L: Q**2 * L / c**2,
         lambda Q, c, L: Q**2 / (c**2 * L**2), lambda Q, c, L: Q / (c * sqrt(L))]
good = []
for i, fn in enumerate(forms):
    ok = True
    for _ in range(50):
        c, L, K = random.uniform(0.5, 5), random.uniform(1, 50), random.uniform(1, 50)
        Q = c * sqrt(L * K)
        ok &= abs(fn(Q, c, L) - K) < 1e-6
    if ok:
        good.append(i)
t.sel("s1q5", good)


# s1q6: strings with each of n letters twice, no two identical adjacent; which n gives 30
@lru_cache(None)
def arr(counts, last):
    if sum(counts) == 0:
        return 1
    return sum(arr(counts[:i] + (counts[i] - 1,) + counts[i + 1:], i) for i in range(len(counts)) if counts[i] and i != last)


cnt = {n: arr((2,) * n, -1) for n in range(2, 7)}
assert cnt[3] == 30 and cnt[2] == 2 and cnt[4] == 864
t.choice("s1q6", next(n for n, v in cnt.items() if v == 30))

# s1q7: box 12 x 5 x h, cut through opposite 12-edges: 12 * sqrt(25 + h^2) = 156
h = sqrt((156 / 12) ** 2 - 25)
assert abs(h - 12) < 1e-12
h = 12
piece = 2 * (F(1, 2) * 5 * h) + 12 * 5 + 12 * h + 156
t.choice("s1q7", piece)

# s1q8: n positive multiple of 5: divisors of n(n+1)(n+2)(n+3) that always hold
prods = [n * (n + 1) * (n + 2) * (n + 3) for n in range(5, 5000, 5)]
g = 0
for p in prods:
    g = gcd(g, p)
assert g == 120
t.where("s1q8", lambda d: g % d == 0)


# s1q9: divisors of 12^3 * 15^2
def ndiv(n):
    return sum(2 if d * d != n else 1 for d in range(1, isqrt(n) + 1) if n % d == 0)


t.value("s1q9", ndiv(12**3 * 15**2))

# DI table
office = {"North": (30, 18, F(6)), "South": (20, 8, F(17, 2)), "East": (5, 3, F(12)), "West": (45, 30, F(15, 2)), "Central": (60, 24, F(7))}

# s1q10: which office joining North raises North's mean most
n0, _, m0 = office["North"]
rise = {k: (n0 * m0 + n * m) / (n0 + n) - m0 for k, (n, _, m) in office.items() if k != "North"}
best = max(rise, key=rise.get)
assert len(set(rise.values())) == 4
t.sel("s1q10", [["South", "East", "West", "Central"].index(best)])

# s1q11: West: 40% of drivers in carpool; they are 75% of the carpool
n, d, _ = office["West"]
both = F(40, 100) * d
carpool = both / F(75, 100)
assert both.denominator == 1 and carpool.denominator == 1
t.choice("s1q11", n - (d + carpool - both))

# s1q12: 3 from South (20, 8 drive): at least one driver and one non-driver
n, d, _ = office["South"]
t.choice("s1q12", F(comb(n, 3) - comb(d, 3) - comb(n - d, 3), comb(n, 3)))

# s2q1: six performers, Tan (2) not first or last; Ruiz (0) and Soto (1) adjacent vs one apart
A = B = 0
for p in permutations(range(6)):
    pos = {v: i for i, v in enumerate(p)}
    if pos[2] in (0, 5):
        continue
    gap = abs(pos[0] - pos[1])
    A += gap == 1
    B += gap == 2
assert (A, B) == (144, 120)
t.qc("s2q1", [(A, B)])


# s2q2: trapezoid AB || CD, M, N midpoints of legs AD, BC; AC meets MN at P; MN = 13, PN - MP = 5; A = CD, B = 9
cases = []
import math
for _ in range(300):
    ab = 18.0; cd = 8.0  # the only bases consistent with MN = 13 and PN - MP = 5 (checked below)
    hgt = random.uniform(1, 30); off = random.uniform(-20, 20)
    Ap, Bp, Dp = (0.0, 0.0), (ab, 0.0), (off, hgt)
    Cp = (off + cd, hgt)
    Mp = ((Ap[0] + Dp[0]) / 2, hgt / 2); Np = ((Bp[0] + Cp[0]) / 2, hgt / 2)
    # P: point of AC at height hgt/2
    Pp = ((Ap[0] + Cp[0]) / 2, hgt / 2)
    MN, MP, PN = Np[0] - Mp[0], Pp[0] - Mp[0], Np[0] - Pp[0]
    assert abs(MN - 13) < 1e-9 and abs(PN - MP - 5) < 1e-9
    cases.append((round(Cp[0] - Dp[0], 9), 9))
# uniqueness: MP = CD/2, PN = AB/2 force CD = 13 - 5 = 8
assert [c for c in range(1, 26) for a_ in range(1, 40) if (c + a_) / 2 == 13 and (a_ - c) / 2 == 5] == [8]
t.qc("s2q2", cases)


# s2q3: 100th digit of 1/14 vs 50th digit of 1/7
def digit(num, den, k):
    r = num % den
    for _ in range(k - 1):
        r = r * 10 % den
    return r * 10 // den


t.qc("s2q3", [(digit(1, 14, 100), digit(1, 7, 50))])

# s2q4: share s > 25 (and s + 5 <= 100): 2025 share 0.8(s + 5) vs s
t.qc("s2q4", [(F(4, 5) * (s_ + 5), s_) for s_ in (F(k, 4) for k in range(101, 381))])

# s2q5: f symmetric about x = 0 and x = 2: f(x) = h(fold(x)), fold maps to [0, 2] with period 4
def fold(x):
    x = x % 4
    x = 4 - x if x > 2 else x
    return x


cases = []
for _ in range(50):
    coeffs = [random.uniform(-5, 5) for _ in range(4)]

    def f(x, c=coeffs):
        u = fold(x)
        return sum(ci * u**i for i, ci in enumerate(c))

    for x in (-3.3, 0.7, 1.9, 5.1):  # check both symmetries hold
        assert abs(f(x) - f(-x)) < 1e-9 and abs(f(2 + x) - f(2 - x)) < 1e-9
    cases.append((round(f(7), 9), round(f(1), 9)))
t.qc("s2q5", cases)

# s2q6: D(n+1) - D(n) = 10; diagonals of the n-gon
D = lambda k: k * (k - 3) // 2
n = next(n for n in range(3, 100) if D(n + 1) - D(n) == 10)
t.choice("s2q6", D(n))

# s2q7: 2600 pages; 40 pages/min single, 25 sheets/min double (50 pages/min); 60 min
ts = [x for x in range(0, 61) if 40 * x + 50 * (60 - x) == 2600]
assert ts == [40]
tt = ts[0]
t.choice("s2q7", 40 * tt + 25 * (60 - tt))

# s2q8: rectangle 2h x h in a semicircle of radius r: corner (h, h) on the arc
r = 1.0
hh = r / sqrt(2)
t.choice("s2q8", (2 * hh * hh) / (pi * r * r / 2))

# s2q9: 8a = 11d, a + d = 190
sol = [(a, 190 - a) for a in range(191) if 8 * a == 11 * (190 - a)]
assert sol == [(110, 80)]
a, d = sol[0]
t.choice("s2q9", 8 * a + 11 * d)

# s2q10: (6e15 - 5e14) / 1.1e-4
val = (F(6) * 10**15 - F(5) * 10**14) / (F(11, 10) / 10**4)
opts = [F(5) * 10**11, F(5) * 10**18, F(91, 10) * 10**18, F(5) * 10**19, F(5) * 10**20]
t.sel("s2q10", [i for i, o in enumerate(opts) if o == val])

# s2q11: arcs 4pi and 10pi with the same angle, radial depth 9
rr = F(9) / (F(10, 4) - 1)
RR = rr + 9
theta = F(4) / rr  # in units of pi radians
area_over_pi = theta / 2 * (RR**2 - rr**2)
t.choice("s2q11", float(area_over_pi) * pi)

# s2q12: angles x..5x around O; angle BOE is min of the two ways round
x = F(360, 15)
way = 2 * x + 3 * x + 4 * x
t.choice("s2q12", min(way, 360 - way))

# s2q13: equal to a - [b - (c - d)] identically
target = lambda a, b, c, d: a - (b - (c - d))
exprs = [lambda a, b, c, d: (a + c) - (b + d), lambda a, b, c, d: a - (b - c - d), lambda a, b, c, d: c - (d - (a - b)),
         lambda a, b, c, d: (a - b) - (c - d), lambda a, b, c, d: -(b - a + d - c), lambda a, b, c, d: -((b + d) - (a - c))]
tests = [tuple(random.randint(-50, 50) for _ in range(4)) for _ in range(200)]
t.sel("s2q13", [i for i, e in enumerate(exprs) if all(e(*v) == target(*v) for v in tests)])

# s2q14: integer points with x^2 + y^2 <= 20
P = [(x, y) for x in range(-5, 6) for y in range(-5, 6) if x * x + y * y <= 20]
truth = [max(x * y for x, y in P) == 10, max(x + 2 * y for x, y in P) == 10, max(x + y for x, y in P) == 6,
         max(x * x - y for x, y in P) == 20, min(x * y for x, y in P) == -9]
t.sel("s2q14", [i for i, v in enumerate(truth) if v])

# s2q15: f((x+3)/2) = 4x - 1; f(k) = 19
xs = [F(v) for v in range(-100, 101) if 4 * v - 1 == 19]
t.value("s2q15", (xs[0] + 3) / 2)

t.done()
