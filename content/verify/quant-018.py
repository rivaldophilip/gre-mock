"""Verify every key in content/tests/quant-018.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations
from math import comb, erf, sqrt, cos, sin, radians, degrees, acos, pi
import random

from keys import Keys, number

t = Keys("quant-018")
random.seed(18)

# s1q1: 1/2 < x < 1; A = 1/x - 1, B = 1 - x
xs = [F(1, 2) + F(k, 1000) for k in range(1, 500)]
t.qc("s1q1", [(1 / x - 1, 1 - x) for x in xs])

# s1q2: girls = 1.25 * boys; A = percent boys, B = 45
t.qc("s1q2", [(F(100) * b / (b + F(5, 4) * b), 45) for b in (4, 8, 40, 400)])

# s1q3: bowtie, AD and BC cross at E; triangle ABE has 48 and 75, triangle CDE has 62 and y; vertical angles at E
aeb = 180 - 48 - 75
ced = aeb  # vertical angles
t.qc("s1q3", [(180 - ced - 62, 62)])

# s1q4: n/12 has decimal part exactly .75; A = n mod 4, B = 3
t.qc("s1q4", [(n % 4, 3) for n in range(1, 3000) if F(n, 12) - n // 12 == F(3, 4)])

# s1q5: fiction:non = 4:3, reference:non = 1:2 -> reference share
for k in range(1, 100):
    non = 6 * k
    fic, ref = F(4, 3) * non, F(1, 2) * non
    share = ref / (fic + non + ref)
t.choice("s1q5", share)

# s1q6: circles (x-r)^2 + (y-r)^2 = r^2 through (2,1); distance between the centers
rs = [r for r in (F(n, 100) for n in range(1, 2000)) if (2 - r) ** 2 + (1 - r) ** 2 == r * r]
assert len(rs) == 2
t.choice("s1q6", sqrt(2) * float(rs[1] - rs[0]))

# s1q7: panels of 5 from 4 chemists, 5 physicists, 3 biologists, at most 2 per field
people = ["c"] * 4 + ["p"] * 5 + ["b"] * 3
t.choice("s1q7", sum(1 for s in combinations(range(12), 5) if all([people[i] for i in s].count(f) <= 2 for f in "cpb")))

# s1q8: 150 employees, train 70, cycle 64, neither >= 2 * both; possible exactly-one counts
ok = set()
for both in range(0, 65):
    union = 70 + 64 - both
    neither = 150 - union
    if union <= 150 and neither >= 0 and neither >= 2 * both:
        ok.add(70 + 64 - 2 * both)
t.where("s1q8", lambda v: v in ok)

# s1q9: bill = 6 + 0.12 * min(u, 200) + 0.18 * max(u - 200, 0) = 57
def bill(u):
    return 6 + F(12, 100) * min(u, 200) + F(18, 100) * max(u - 200, 0)
us = [u for u in range(0, 2000) if bill(u) == 57]
assert len(us) == 1
t.value("s1q9", us[0])

# DI: fig1 table
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
rows = {0: [14, 12, 8, 20, 10, 6], 1: [18, 15, 12, 22, 16, 12], 2: [22, 18, 18, 14, 17, 18],
        3: [16, 20, 24, 14, 21, 26], 4: [10, 15, 18, 10, 16, 18]}  # 4 = "4 or more"
assert all(sum(rows[v][i] for v in rows) == 80 for i in range(6))

# s1q10: largest |change| in members with at least 3 outings between consecutive months
at3 = [rows[3][i] + rows[4][i] for i in range(6)]
changes = [abs(at3[i + 1] - at3[i]) for i in range(5)]
assert changes.count(max(changes)) == 1
t.sel("s1q10", [changes.index(max(changes))])

# s1q11: months whose median is exactly 2 ("4 or more" coded 4 or 9: same medians)
def median(i, top):
    data = sorted(v if v < 4 else top for v in rows for _ in range(rows[v][i]))
    return F(data[39] + data[40], 2)
meds = [{median(i, top) for top in (4, 9)} for i in range(6)]
assert all(len(m) == 1 for m in meds)
t.choice("s1q11", sum(1 for m in meds if m == {2}))

# s1q12: least P(at least 3 in June and regatta), regatta = 75% of 80 = 60 members
A = at3[5]; Bn = 60
least = min(both for both in range(0, 81) if both <= min(A, Bn) and A + Bn - both <= 80)
t.choice("s1q12", F(least, 80))

# s2q1: x + y = 5, positive; A = xy, B = 6.2
t.qc("s2q1", [(x * (5 - x), F(62, 10)) for x in (F(k, 10) for k in range(1, 50))])

# s2q2: number of distinct real roots of (x-a)(x-b) = k, k > 0
def nroots(a, b, k):
    d = (a + b) ** 2 - 4 * (a * b - k)
    return 2 if d > 0 else (1 if d == 0 else 0)
cases = [(F(random.randint(-20, 20)), F(random.randint(-20, 20)), F(random.randint(1, 40), random.randint(1, 9))) for _ in range(3000)]
cases += [(F(3), F(3), F(1, 100)), (F(0), F(0), F(5))]
t.qc("s2q2", [(nroots(a, b, k), 2) for a, b, k in cases])

# s2q3: 4x + 9 < 1, 3x + 15 >= 3, |y - 2| <= 1; A = xy, B = -2
grid = [F(k, 40) for k in range(-400, 400)]
X = [x for x in grid if 4 * x + 9 < 1 and 3 * x + 15 >= 3]
Y = [y for y in grid if abs(y - 2) <= 1]
t.qc("s2q3", [(x * y, -2) for x in X for y in Y[::5]])

# s2q4: zigzag between parallels: angles x at A, 2x at B; check angle APB = 3x for each x, then A = x, B = 30
pairs = []
for x in range(5, 45, 5):  # 2x acute
    ax, ay = 0.0, 0.0
    px, py = cos(radians(-x)), sin(radians(-x))   # P below line l (y = 0)
    tlen = 1 / sin(radians(2 * x))                 # B on m: y = py - 1
    bx, by = px - tlen * cos(radians(2 * x)), py - tlen * sin(radians(2 * x))
    assert abs(by - (py - 1)) < 1e-9
    v1, v2 = (ax - px, ay - py), (bx - px, by - py)
    apb = degrees(acos((v1[0] * v2[0] + v1[1] * v2[1]) / sqrt(v1[0] ** 2 + v1[1] ** 2) / sqrt(v2[0] ** 2 + v2[1] ** 2)))
    if abs(apb - 3 * x) < 1e-6:
        pairs.append((x, 30))
assert len(pairs) >= 5
t.qc("s2q4", pairs)

# s2q5: a < b < c, (x-a)(x-c) < 0 and (x-b)(x-c) > 0; A = (x-a)(x-b), B = 0
pairs = []
for _ in range(3000):
    a, b, c = sorted(random.sample(range(-30, 30), 3))
    x = F(random.randint(-400, 400), 10)
    if (x - a) * (x - c) < 0 and (x - b) * (x - c) > 0:
        pairs.append(((x - a) * (x - b), 0))
assert len(pairs) > 100
t.qc("s2q5", pairs)

# s2q6: P: 500 bolts N(40, 2); Q: N bolts N(41, 1); about 1180 in [38, 42]; nearest choice to N
Phi = lambda z: (1 + erf(z / sqrt(2))) / 2
p_in = 500 * (Phi(1) - Phi(-1))
q_frac = Phi(1) - Phi(-3)
N = (1180 - p_in) / q_frac
vals = [float(number(c)) for c in t.choices("s2q6")]
best = min(range(len(vals)), key=lambda i: abs(vals[i] - N))
assert abs(vals[best] - N) < 20
t.sel("s2q6", [best])

# s2q7: perimeter 36 -> side 6 = r; segment = 60-degree sector minus equilateral triangle
side = 36 / 6
r = side
t.choice("s2q7", pi * r * r * 60 / 360 - sqrt(3) / 4 * side * side)

# s2q8: (r + 8)^2 = r^2 + 12^2
rs = [r for r in (F(k, 100) for k in range(1, 5000)) if (r + 8) ** 2 == r * r + 144]
assert len(rs) == 1
t.choice("s2q8", rs[0])

# s2q9: a <> b = a^2 - 2b; (3 <> k) <> 1 = 47
op = lambda a, b: a * a - 2 * b
t.where("s2q9", lambda k: op(op(3, k), 1) == 47)

# s2q10: largest whole-inch square tile for 84 x 120; number of tiles
side = max(s for s in range(1, 85) if 84 % s == 0 and 120 % s == 0)
t.choice("s2q10", (84 // side) * (120 // side))

# s2q11: C(n,3) = C(n,5); sets of size <= 2
ns = [n for n in range(5, 60) if comb(n, 3) == comb(n, 5)]
assert len(ns) == 1
t.choice("s2q11", sum(comb(ns[0], k) for k in range(3)))

# s2q12: exactly 2 of 4 with p = 1/3 (enumerate all outcomes)
from itertools import product
p = F(1, 3)
tot = F(0)
for pattern in product([0, 1], repeat=4):
    if sum(pattern) == 2:
        pr = F(1)
        for d in pattern:
            pr *= p if d else 1 - p
        tot += pr
t.choice("s2q12", tot)

# s2q13: a_{n+2} = a_{n+1} + a_n, a_5 = 19, a_7 = 50
sols = []
for a1 in range(-100, 101):
    for a2 in range(-100, 101):
        s = [a1, a2]
        while len(s) < 8:
            s.append(s[-1] + s[-2])
        if s[4] == 19 and s[6] == 50:
            sols.append(s)
assert len(sols) == 1
s = sols[0]
stmts = [s[0] == 2, s[1] == 7, s[3] == 12, s[7] == 79, sum(s[:6]) == 76]
t.sel("s2q13", [i for i, v in enumerate(stmts) if v])

# s2q14: number of intersections of y = mx and y = |x - 2|
def meets(m):
    pts = set()
    if m != -1:                     # left arm: 2 - x = mx, x <= 2
        x = F(2) / (1 + m)
        if x <= 2: pts.add(x)
    if m != 1:                      # right arm: x - 2 = mx, x >= 2
        x = F(-2) / (m - 1)
        if x >= 2: pts.add(x)
    return len(pts)
t.where("s2q14", lambda m: meets(F(m)) == 2)

# s2q15: right angle at K, altitude KM = 6, JM = 3; coordinates M = (0,0), K = (0,6), J = (-3,0), L = (l,0) with KJ . KL = 0
ls = [l for l in (F(k, 10) for k in range(1, 1000)) if (-3) * l + 36 == 0]
assert len(ls) == 1
J, K, L = (F(-3), F(0)), (F(0), F(6)), (ls[0], F(0))
area = abs((K[0] - J[0]) * (L[1] - J[1]) - (L[0] - J[0]) * (K[1] - J[1])) / 2
t.value("s2q15", area)

t.done()
