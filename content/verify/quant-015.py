"""Verify every key in content/tests/quant-015.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations
import math
import random

from keys import Keys

t = Keys("quant-015")
random.seed(15)

# s1q1: |3 - x| = |x + 11|; A = x, B = -4
t.qc("s1q1", [(x, -4) for x in (F(n, 4) for n in range(-200, 200)) if abs(3 - x) == abs(x + 11)])

# s1q2: swim = 1.25 * track; A = 16% of swim, B = 20% of track
t.qc("s1q2", [(F(16, 100) * F(5, 4) * tr, F(20, 100) * tr) for tr in range(20, 400, 20)])

# s1q3: D at origin, A = (0, 12); B and C on the x-axis at distance 5 and 9 from D (either side)
pairs = []
for bx in (5, -5):
    for cx in (9, -9):
        A, B, C = (0, 12), (bx, 0), (cx, 0)
        assert math.dist(A, B) == 13 and math.dist(A, C) == 15
        pairs.append((F(abs(bx - cx)), 14))
t.qc("s1q3", pairs)

# s1q4: m divisible by 3, m = 5 mod 14; A = remainder of m/3 mod 14, B = remainder of m mod 14
t.qc("s1q4", [((m // 3) % 14, m % 14) for m in range(3, 5000, 3) if m % 14 == 5])

# s1q5: 0.0198 g/mL * 61,200 mL / 0.398 g per dose; nearest choice
doses = F(198, 10000) * 61200 / F(398, 1000)
vals = [300, 2700, 3000, 3300, 30000]
t.sel("s1q5", min(range(5), key=lambda i: abs(vals[i] - doses)))

# s1q6: price 100, profit 25% of price; price up 10%; profit as % of cost
cost = 100 - 25
pct = F(110 - cost, cost) * 100
opts = [F(100, 3), 35, F(75, 2), F(140, 3), 50]
t.sel("s1q6", opts.index(pct))

# s1q7: even integers 501..999 with three different digits
t.choice("s1q7", sum(1 for n in range(501, 1000) if n % 2 == 0 and len(set(str(n))) == 3))

# s1q8: k with exactly 120 descending k-digit positive integers (brute force via digit sets)
def descending_count(k):
    return sum(1 for s in combinations("9876543210", k) if s[0] != "0")
t.where("s1q8", lambda k: descending_count(int(k)) == 120)

# s1q9: inlet 1/6, drain 1/10 open for 5 hours, then inlet alone
filled = 5 * (F(1, 6) - F(1, 10))
t.value("s1q9", 5 + (1 - filled) / F(1, 6))

# DI: scores 1..5
P = {1: 2, 2: 3, 3: 5, 4: 6, 5: 4}
Q = {1: 4, 2: 6, 3: 5, 4: 3, 5: 2}
def lst(d): return [s for s, c in d.items() for _ in range(c)]
def mean(v): return F(sum(v), len(v))
def var(v): m = mean(v); return sum((x - m) ** 2 for x in v) / len(v)

# s1q10: four 5s join P; increase in mean
t.choice("s1q10", mean(lst(P) + [5] * 4) - mean(lst(P)))

# s1q11: compare means and SDs (choices in order)
mp, mq, vp, vq = mean(lst(P)), mean(lst(Q)), var(lst(P)), var(lst(Q))
truth = [mp > mq and vp > vq, mp > mq and vp == vq, mp > mq and vq > vp, mp == mq and vp == vq, mq > mp and vq > vp]
t.sel("s1q11", [i for i, ok in enumerate(truth) if ok])

# s1q12: least overlap of (score 4 or 5) and (yes) in each section, summed; brute force over feasible overlaps
def least(high, yes, n):
    return min(o for o in range(0, min(high, yes) + 1) if high + yes - o <= n)
t.choice("s1q12", least(P[4] + P[5], 15, 20) + least(Q[4] + Q[5], 6, 20))

# s2q1: juniors 2m, seniors 5m; (2m + 15) / 5m = 1/2; A = seniors, B = 120
m = next(m for m in range(1, 1000) if F(2 * m + 15, 5 * m) == F(1, 2))
t.qc("s2q1", [(5 * m, 120)])

# s2q2: integers where sqrt(6 - x) / (sqrt(x + 3) - 2) is defined
dom = [x for x in range(-50, 50) if 6 - x >= 0 and x + 3 >= 0 and math.isqrt(x + 3) ** 2 != 4]
dom = [x for x in range(-50, 50) if 6 - x >= 0 and x + 3 >= 0 and abs(math.sqrt(x + 3) - 2) > 1e-12]
t.qc("s2q2", [(len(dom), 9)])

# s2q3: intersections of y = x^2 - 4x and y = |x| (roots of each piece, filtered by the piece's domain)
pts = set()
for sign in (1, -1):  # |x| = sign * x on the piece
    # x^2 - 4x - sign*x = 0 -> x (x - (4 + sign)) = 0
    for x in (0, 4 + sign):
        if (sign == 1 and x >= 0) or (sign == -1 and x < 0):
            pts.add(x)
assert all(x * x - 4 * x == abs(x) for x in pts)
t.qc("s2q3", [(len(pts), 3)])

# s2q4: primes in (80, 100) vs (100, 110)
def two_divisors(n): return sum(1 for d in range(1, n + 1) if n % d == 0) == 2
t.qc("s2q4", [(sum(two_divisors(n) for n in range(81, 100)), sum(two_divisors(n) for n in range(101, 110)))])

# s2q5: P(|s - t| < 15) for s, t uniform on [0, 60] (exact by area), check by grid
exact = 1 - F(45 * 45, 60 * 60)
N = 600
grid = F(sum(1 for i in range(N) for j in range(N) if abs(i - j) * 60 < 15 * N), N * N)
assert abs(grid - exact) < F(1, 50)
t.qc("s2q5", [(exact, F(1, 2))])

# s2q6: five-pointed star; build an irregular star and check the point angles sum to 180
def ang(p, q, r):
    v1 = (q[0] - p[0], q[1] - p[1]); v2 = (r[0] - p[0], r[1] - p[1])
    return math.degrees(math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (math.hypot(*v1) * math.hypot(*v2))))
for _ in range(50):
    th = sorted(random.uniform(0, 2 * math.pi) for _ in range(5))
    pts5 = [(math.cos(a), math.sin(a)) for a in th]
    s = sum(ang(pts5[i], pts5[(i + 2) % 5], pts5[(i + 3) % 5]) for i in range(5))
    assert abs(s - 180) < 1e-6
t.choice("s2q6", 180 - (28 + 36 + 40 + 44))

# s2q7: AB = 13, CD = 6: AC * CB = 36, AC + CB = 13; area = pi/8 (AB^2 - AC^2 - CB^2)
a = next(F(a) for a in range(1, 13) if a * (13 - a) == 36)
coef = F(1, 8) * (13 ** 2 - a ** 2 - (13 - a) ** 2)
assert coef.denominator == 1
t.choice("s2q7", f"{coef.numerator}\\pi")

# s2q8: square with adjacent vertices P(6, 0), Q(0, 4); which choice is another vertex
vx, vy = 0 - 6, 4 - 0
verts = set()
for rx, ry in [(-vy, vx), (vy, -vx)]:
    verts |= {(F(6 + rx), F(0 + ry)), (F(0 + rx), F(4 + ry))}
ch = [tuple(F(v) for v in c.strip("()").split(",")) for c in t.choices("s2q8")]
t.sel("s2q8", [i for i, c in enumerate(ch) if c in verts])

# s2q9: wheel diameter 0.5, 400 turns -> circumference; area / pi
circ_over_pi = 400 * F(1, 2)
r = circ_over_pi / 2
area = r * r
opts = [F(c.replace("{,}", "").replace("\\pi", "")) for c in t.choices("s2q9")]
t.sel("s2q9", opts.index(area))

# s2q10: line through (-2, 7), (4, -2): x-intercept + y-intercept
sl = F(-2 - 7, 4 + 2)
b = 7 - sl * (-2)
t.choice("s2q10", b + (-b / sl))

# s2q11: least of x^2 - 7x + y^2 + 3y over integer ranges
t.choice("s2q11", min(x * x - 7 * x + y * y + 3 * y for x in range(-4, 2) for y in range(-5, 6)))

# s2q12: regular hexagon side 6; triangle on alternate vertices; area / sqrt3
R = 6
tri = [(R * math.cos(math.radians(a)), R * math.sin(math.radians(a))) for a in (0, 120, 240)]
area = abs((tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1]) - (tri[2][0] - tri[0][0]) * (tri[1][1] - tri[0][1])) / 2
k = area / math.sqrt(3)
coefs = [int(c.split("\\sqrt")[0]) for c in t.choices("s2q12")]
t.sel("s2q12", [i for i, c in enumerate(coefs) if abs(c - k) < 1e-9])

# s2q13: x^3 + 30x = kx^2 has exactly three distinct solutions, all nonnegative integers
def ok13(k):
    sols = [x for x in range(-200, 201) if x ** 3 + 30 * x == k * x * x]
    # cubic has at most 3 roots; require 3 distinct integer roots, all >= 0
    return len(sols) == 3 and all(x >= 0 for x in sols)
t.where("s2q13", lambda k: ok13(int(k)))

# s2q14: a < b < c; statements that hold for every sampled triple
stmts = [
    lambda a, b, c: a + b < 2 * c,
    lambda a, b, c: a + c > b,
    lambda a, b, c: c - b < c - a,
    lambda a, b, c: b - a < c - b,
    lambda a, b, c: a * b < b * c,
    lambda a, b, c: c - a > c - b and c - a > b - a,
]
triples = [(a, b, c) for a in range(-6, 7) for b in range(a + 1, 8) for c in range(b + 1, 9)]
triples += [tuple(sorted(F(random.randint(-99, 99), random.randint(1, 9)) for _ in range(3))) for _ in range(3000)]
triples = [tr for tr in triples if tr[0] < tr[1] < tr[2]]
t.sel("s2q14", [i for i, s in enumerate(stmts) if all(s(*tr) for tr in triples)])

# s2q15: sum of (-1)^n n^2 for n = 1..25
t.value("s2q15", sum((-1) ** n * n * n for n in range(1, 26)))

t.done()
