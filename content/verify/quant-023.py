"""Verify every key in content/tests/quant-023.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations, permutations, product
import math
import random

from keys import Keys, number

t = Keys("quant-023")
random.seed(23)

# s1q1: a rise of 4 points is a 25% increase: 0.25 s = 4; A = new share, B = 20
s = F(4) / F(1, 4)
t.qc("s1q1", [(s + 4, 20)])

# s1q2: -2 < x < -1; A = x/(x+1), B = (x+1)/(x+2)
xs = [F(-2) + F(k, 200) for k in range(1, 200)]
t.qc("s1q2", [(x / (x + 1), (x + 1) / (x + 2)) for x in xs])

# s1q3: AB || DC, AD = BC, angle DAB = 70: isosceles trapezoid or parallelogram
def angle_abc(shape, top=3.0, leg=2.0):
    a = math.radians(70)
    A = (0.0, 0.0)
    D = (leg * math.cos(a), leg * math.sin(a))
    if shape == "trap":     # mirror image of D across the perpendicular bisector of AB
        B = (2 * D[0] + top, 0.0)
        C = (D[0] + top, D[1])
    else:                   # parallelogram: C = D + (B - A)
        B = (top + 1.0, 0.0)
        C = (D[0] + B[0], D[1])
    ad = math.dist(A, D); bc = math.dist(B, C)
    assert abs(ad - bc) < 1e-9 and abs(C[1] - D[1]) < 1e-12  # AD = BC, DC parallel to AB
    v1 = (A[0] - B[0], A[1] - B[1]); v2 = (C[0] - B[0], C[1] - B[1])
    return round(math.degrees(math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (math.hypot(*v1) * math.hypot(*v2)))), 6)
t.qc("s1q3", [(angle_abc("trap"), 70), (angle_abc("para"), 70)])

# s1q4: no real root of x^2-4x+c=0 (c > 4); A = number of real roots of x^2-4x+(c-5)=0, B = 1
def nroots(b, c):
    d = b * b - 4 * c
    return 2 if d > 0 else (1 if d == 0 else 0)
cs = [F(4) + F(k, 4) for k in range(1, 80) if nroots(-4, F(4) + F(k, 4)) == 0]
t.qc("s1q4", [(nroots(-4, c - 5), 1) for c in cs])

# s1q5: wall = 14 * 2.5 m; second drawing 20 cm -> n = (wall in cm) / 20
t.choice("s1q5", F(14) * F(5, 2) * 100 / 20)

# s1q6: 0.3(1-q) + 0.7 q = 0.46
p = F(3, 10)
q = next(F(k, 100) for k in range(101) if p * (1 - F(k, 100)) + (1 - p) * F(k, 100) == F(46, 100))
t.choice("s1q6", q)

# s1q7: brute force over all distinct orders of GGG SS TT; both stones strictly between the two steels
orders = set(permutations("GGGSSTT"))
def ok7(o):
    st = [i for i, c in enumerate(o) if c == "S"]; tt = [i for i, c in enumerate(o) if c == "T"]
    return all(st[0] < i < st[1] for i in tt)
t.choice("s1q7", sum(1 for o in orders if ok7(o)))

# s1q8: which chains hold for every x in (1, 2)
chains = [
    lambda x: math.sqrt(x) < x < x * x,
    lambda x: 1 / x < x / 2 < 1,
    lambda x: 2 - x < 1 / x < 1,
    lambda x: x * x < 2 * x < x ** 3,
    lambda x: 1 / x ** 2 < x / 2 < math.sqrt(x),
    lambda x: x - 1 < x / 2 < x * x / 2,
]
grid = [1 + k / 1000 for k in range(1, 1000)]
t.sel("s1q8", [i for i, f in enumerate(chains) if all(f(x) for x in grid)])

# s1q9: t = 2m - 14 and t = m + 23
m = next(m for m in range(200) if 2 * m - 14 == m + 23)
t.value("s1q9", m + (m + 23))

# DI: stacked bars (print bottom, e-book middle, audiobook top)
years = [2019, 2020, 2021, 2022, 2023]
prt = [70, 60, 50, 35, 40]; ebk = [25, 35, 40, 50, 45]; aud = [15, 15, 20, 20, 30]

# s1q10: year with the most e-book titles
t.choice("s1q10", years[max(range(5), key=lambda i: ebk[i])])

# s1q11: e-book total as a percent of the print total; nearest choice
pct = F(100 * sum(ebk), sum(prt))
vals = [number(c) for c in t.choices("s1q11")]
t.sel("s1q11", [min(range(len(vals)), key=lambda i: abs(vals[i] - pct))])

# s1q12: median of the 10 pooled values
pool = sorted(ebk + aud)
t.choice("s1q12", F(pool[4] + pool[5], 2))

# s2q1: A = 4e31 + 6e30, B = (7e15)^2
t.qc("s2q1", [(4 * 10**31 + 6 * 10**30, (7 * 10**15) ** 2)])

# s2q2: AB=5, BC=9, CD=4, DA=7, no three collinear; AC must satisfy both triangle inequalities
acs = [F(k, 100) for k in range(1, 2000) if abs(5 - 9) < F(k, 100) < 5 + 9 and abs(7 - 4) < F(k, 100) < 7 + 4]
t.qc("s2q2", [(25, 5 + 9 + ac) for ac in acs])

# s2q3: N = 3^10; A = (N-1)^2 (N+1)^2, B = 81^5 (81^5 - 2) + 2
N = 3**10
t.qc("s2q3", [((N - 1) ** 2 * (N + 1) ** 2, 81**5 * (81**5 - 2) + 2)])

# s2q4: (2^(n+2) - 2^n) / (4^6 + 2^11) = 16
ns = [n for n in range(-10, 60) if F(2 ** (n + 2) - 2**n if n >= 0 else F(2) ** (n + 2) - F(2) ** n) / (4**6 + 2**11) == 16]
assert len(ns) == 1
t.qc("s2q4", [(ns[0], 15)])

# s2q5: gcd(m, n) = 6, lcm(m, n) = 180; A = m + n, B = 66
pairs = [(a, b) for a in range(1, 181) for b in range(a, 181) if math.gcd(a, b) == 6 and a * b // math.gcd(a, b) == 180]
t.qc("s2q5", [(a + b, 66) for a, b in pairs])

# s2q6: |x| + y = 5, x + |y| = 3: solve each sign case, keep consistent ones
sols = set()
for sx, sy in product((1, -1), repeat=2):
    # sx*x + y = 5, x + sy*y = 3
    det = sx * sy - 1
    if det == 0:
        continue
    x = F(5 * sy - 3, det); y = F(sx * 3 - 5, det)
    if (x >= 0) == (sx == 1) and (y >= 0) == (sy == 1) and abs(x) + y == 5 and x + abs(y) == 3:
        sols.add((x, y))
assert len(sols) == 1
x, y = sols.pop()
t.choice("s2q6", x * y)

# s2q7: area of points outside a 50x30 rectangle within 4 of it, by Monte Carlo against the choices
L, W, d = 50, 30, 4
exact = 2 * (L + W) * d + math.pi * d * d
random.seed(7)
hits = 0; n_mc = 400000
for _ in range(n_mc):
    px = random.uniform(-d, L + d); py = random.uniform(-d, W + d)
    if 0 <= px <= L and 0 <= py <= W:
        continue
    dx = max(0 - px, 0, px - L); dy = max(0 - py, 0, py - W)
    if dx * dx + dy * dy <= d * d:
        hits += 1
mc = hits / n_mc * (L + 2 * d) * (W + 2 * d)
assert abs(mc - exact) < 5
t.where("s2q7", lambda v: abs(v - exact) < 1e-9)

# s2q8: greatest triple overlap over all Venn region assignments (sizes 20, 25, 30; 50 people, none outside)
best = -1
for abc in range(0, 21):
    for ab in range(0, 21 - abc):
        for ac in range(0, 21 - abc - ab):
            a_only = 20 - abc - ab - ac
            for bc in range(0, 26 - abc - ab):
                b_only = 25 - abc - ab - bc
                c_only = 30 - abc - ac - bc
                if b_only < 0 or c_only < 0:
                    continue
                if a_only + b_only + c_only + ab + ac + bc + abc == 50:
                    best = max(best, abc)
t.choice("s2q8", best)

# s2q9: 1 + 0.06 * 8/12 times P = 15600 (Feb 1 to Oct 1 = 8 months)
months = 10 - 2
t.choice("s2q9", F(15600) / (1 + F(6, 100) * F(months, 12)))

# s2q10: (135/360) 2 pi r = 3 pi -> r; area (135/360) pi r^2
frac = F(135, 360)
r = F(3) / (2 * frac)
t.choice("s2q10", f"{frac * r * r}\\pi")

# s2q11: equilateral triangle, R - r = 3 with R = 2r (check R/r numerically from a side)
side0 = 1.0
r0 = side0 / (2 * math.sqrt(3)); R0 = side0 / math.sqrt(3)
k = 3 / (R0 - r0)                     # scale so that the ring is 3 wide
s11 = side0 * k
t.choice("s2q11", math.sqrt(3) / 4 * s11 * s11)

# s2q12: top = legs = a, 60-degree base angles; perimeter 40
def trap_perim(a):
    return a + 2 * a + (a + 2 * a * math.cos(math.radians(60)))
a = 40 / trap_perim(1)
h = a * math.sin(math.radians(60)); base = a + 2 * a * math.cos(math.radians(60))
t.choice("s2q12", (a + base) / 2 * h)

# s2q13: a1 = 3, a2 = 5, a_n = a_{n-1} - a_{n-2}; which sums are 0
sq = [None, 3, 5]
while len(sq) <= 60:
    sq.append(sq[-1] - sq[-2])
sums = [sum(sq[1:21]), sum(sq[1:31]), sum(sq[1:41]), sum(sq[4:16]), sum(sq[10:21]), sum(sq[1:46])]
t.sel("s2q13", [i for i, v in enumerate(sums) if v == 0])

# s2q14: brute-force each situation, keep those equal to C(8,3)
stories = range(8)
cnt = [
    sum(1 for _ in combinations(stories, 3)),                                   # unordered pick
    sum(1 for _ in permutations(stories, 3)),                                   # March, April, May
    len({tuple(sorted(p)) for p in permutations(stories, 3)}),                  # printed in date order: one order per set
    len(set(permutations("RRRBBBBB"))),                                          # identical covers in a row
    len({min(p[i:] + p[:i] for i in range(3)) for p in permutations(stories, 3)}),  # round stand, rotations merged
]
t.sel("s2q14", [i for i, v in enumerate(cnt) if v == math.comb(8, 3)])

# s2q15: 30/(16+c) = 18/(16-c)
c = next(F(k, 100) for k in range(1, 1600) if F(30) / (16 + F(k, 100)) == F(18) / (16 - F(k, 100)))
t.value("s2q15", c)

t.done()
