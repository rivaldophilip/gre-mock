"""Verify every key in content/bank/quant/qbank-011.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import product
from collections import Counter
import math
import random

from keys import Keys, number

t = Keys("qbank-011")
random.seed(11)

# s1q1: cumulative percents for squads of 40 and 60; pooled percent at exactly 12 laps vs 27
X = {10: 10, 11: 30, 12: 65, 13: 90, 14: 100}
Y = {10: 5, 11: 25, 12: 45, 13: 80, 14: 100}
cnt12 = F(X[12] - X[11], 100) * 40 + F(Y[12] - Y[11], 100) * 60
t.qc("s1q1", [(cnt12 / 100 * 100, 27)])

# s1q2: median of the 50 games, rows given in frequency order
rows2 = {1: 30, 2: 26, 0: 20, 3: 16, 4: 8}
games = sorted(sum(([g] * (p * 50 // 100) for g, p in rows2.items()), []))
assert len(games) == 50
t.choice("s1q2", F(games[24] + games[25], 2))

# s1q3: one bar missing; midpoint mean of all cyclists is 20; find the missing count
shown = [(10, 15, 10), (15, 20, 18), (20, 25, 12)]
ks = [k for k in range(0, 200)
      if (sum(F(a + b, 2) * c for a, b, c in shown) + F(55, 2) * k) / (sum(c for *_, c in shown) + k) == 20]
assert len(ks) == 1
t.choice("s1q3", ks[0])

# s1q4: integer right triangles with hypotenuse 25; least area
areas4 = [F(a * b, 2) for a in range(1, 25) for b in range(a, 25) if a * a + b * b == 625]
t.choice("s1q4", min(areas4))

# s1q5: lattice points at distance 5 from (2, -1)
pads = [(x, y) for x in range(-10, 15) for y in range(-12, 12) if (x - 2) ** 2 + (y + 1) ** 2 == 25]
t.qc("s1q5", [(len(pads), 8)])

# s1q6: right angle at C, CA = 15, CB = 20; foot D of the altitude
Cp, Ap, Bp = (0.0, 0.0), (15.0, 0.0), (0.0, 20.0)
AB = math.dist(Ap, Bp)
u = ((Bp[0] - Ap[0]) / AB, (Bp[1] - Ap[1]) / AB)
tproj = (Cp[0] - Ap[0]) * u[0] + (Cp[1] - Ap[1]) * u[1]
Dp = (Ap[0] + tproj * u[0], Ap[1] + tproj * u[1])
CD, AD, DB = math.dist(Cp, Dp), math.dist(Ap, Dp), math.dist(Dp, Bp)
area = lambda p, q, r: abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2
close = lambda a, b: abs(a - b) < 1e-9
truth6 = [close(CD, 12), close(AD, 9), close(area(Ap, Cp, Dp) / area(Cp, Bp, Dp), 0.75),
          close(AD + CD + 15, 36), close(CD, 12.5), close(area(Cp, Bp, Dp), 120)]
t.sel("s1q6", [i for i, v in enumerate(truth6) if v])

# s1q7: square in the corner of a right triangle with legs 6 and 12: largest s with (s, s) under the hypotenuse
s7 = max(F(k, 100) for k in range(0, 601) if F(k, 100) / 12 + F(k, 100) / 6 <= 1)
t.value("s1q7", F(6 * 12, 2) - s7 * s7)

# s1q8: hexagon width across flats 6 = sqrt(3) r; circle area vs 36
r8 = 6 / math.sqrt(3)
t.qc("s1q8", [(round(math.pi * r8 * r8, 9), 36)])

# s1q9: x < 0, 0 < y < 1; which expression is always least
exprs9 = [lambda x, y: x, lambda x, y: x * y, lambda x, y: x / y, lambda x, y: x * y * y, lambda x, y: x + y]
least = set()
for x in [F(-k, 7) for k in range(1, 60)]:
    for y in [F(k, 13) for k in range(1, 13)]:
        vals = [f(x, y) for f in exprs9]
        least.add(vals.index(min(vals)))
assert len(least) == 1
t.sel("s1q9", sorted(least))

# s1q10: x/y > 1, xz < 0; statements that hold in every case
nz = [F(k, 4) for k in range(-16, 17) if k != 0]
st10 = [lambda x, y, z: x > y, lambda x, y, z: y * z < 0, lambda x, y, z: x * x > y * y,
        lambda x, y, z: x * (x - y) > 0, lambda x, y, z: x * y * z > 0, lambda x, y, z: x + z > 0]
cases10 = [(x, y, z) for x, y, z in product(nz, nz, nz) if x / y > 1 and x * z < 0]
t.sel("s1q10", [i for i, s in enumerate(st10) if all(s(*c) for c in cases10)])

# s1q11: mean 52 of 8, mean 50 of 7 after removing one
t.choice("s1q11", 8 * 52 - 7 * 50)

# s1q12: shift k > 0 (try many rational shifts); combined list with exactly one mode; its range
last = [23, 26, 26, 29, 33]
ranges12 = set()
for k in [F(n, 4) for n in range(1, 400)]:
    allt = last + [v + k for v in last]
    c = Counter(allt)
    m = max(c.values())
    if sum(1 for v in c.values() if v == m) == 1:
        ranges12.add(max(allt) - min(allt))
assert len(ranges12) == 1
t.value("s1q12", ranges12.pop())

# s1q13: bottle r 4 h 15 into jug r 8 (tall enough)
depth13 = F(4 * 4 * 15, 8 * 8)
assert depth13 <= 20
t.qc("s1q13", [(depth13, 4)])

# s1q14: blocks a <= b <= c with 12 unpainted cubes; one-face counts by direct cube count
ones14 = set()
for a in range(1, 20):
    for b in range(a, 20):
        for c in range(b, 20):
            if (a - 2) * (b - 2) * (c - 2) != 12 or min(a, b, c) < 3:
                continue
            one = 0
            for i, j, k in product(range(a), range(b), range(c)):
                faces = (i in (0, a - 1)) + (j in (0, b - 1)) + (k in (0, c - 1))
                one += faces == 1
            ones14.add(one)
t.where("s1q14", lambda v: v in ones14)

# s1q15: best of three with state-dependent win probability
def win(sets_w, sets_l, last_won, p):
    if sets_w == 2:
        return p
    if sets_l == 2:
        return F(0)
    q = F(6, 10) if last_won is None else (F(7, 10) if last_won else F(4, 10))
    return win(sets_w + 1, sets_l, True, p * q) + win(sets_w, sets_l + 1, False, p * (1 - q))
t.value("s1q15", win(0, 0, None, F(1)))

# s1q16: 6 red, 4 white, two draws without replacement; enumerate ordered pairs
bibs = ["r"] * 6 + ["w"] * 4
pairs = [(i, j) for i in range(10) for j in range(10) if i != j]
same = F(sum(bibs[i] == bibs[j] for i, j in pairs), len(pairs))
t.qc("s1q16", [(same, 1 - same)])

# s1q17: deck 2 m on long sides, 3 m on short sides; (L+6)(W+4) - LW = 200, L >= W > 0; perimeters
per17 = []
for Wk in range(1, 30000):
    W = F(Wk, 1000)
    L = (200 - 24 - 6 * W) / 4
    if L >= W:
        per17.append(2 * (L + W))
lo17, hi17 = min(per17), max(per17)
t.where("s1q17", lambda v: lo17 <= v <= hi17 and v < 88)

# s1q18: staircase with 4 square steps; perimeter 80 fixes s; shoelace area
def stair(s):
    pts = [(0, 0), (4 * s, 0)]
    for k in range(4, 0, -1):
        pts += [(k * s, (4 - k + 1) * s), ((k - 1) * s, (4 - k + 1) * s)]
    pts = pts[:-1] + [(0, 4 * s)]
    per = sum(math.dist(pts[i], pts[(i + 1) % len(pts)]) for i in range(len(pts)))
    ar = abs(sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))) / 2
    return per, ar
s18 = [s for s in [k / 10 for k in range(1, 200)] if abs(stair(s)[0] - 80) < 1e-9]
assert len(s18) == 1
t.choice("s1q18", round(stair(s18[0])[1], 9))

# s1q19: x + 1/x = 4, x = 2 + sqrt 3; value of x^2 / (x^4 - x^2 + 1), as the nearest fraction
x19 = 2 + math.sqrt(3)
v19 = x19 ** 2 / (x19 ** 4 - x19 ** 2 + 1)
t.value("s1q19", F(v19).limit_denominator(1000))

# s1q20: integer grid search for (a, b, c) satisfying both bracketed equations
diffs20 = set()
for a, b, c in product(range(-30, 31), repeat=3):
    if 2 * a - (b - (a - c)) == 13 and a - (b - c) == 5:
        diffs20.add(a - c)
t.qc("s1q20", [(d, 4) for d in diffs20])

# s1q21: 1/x - x = 15/4 with x < 1: roots of 4x^2 + 15x - 4 = 0
disc = 15 * 15 + 4 * 4 * 4
sq = math.isqrt(disc)
assert sq * sq == disc
roots21 = [F(-15 + sq, 8), F(-15 - sq, 8)]
roots21 = [x for x in roots21 if x < 1 and 1 / x - x == F(15, 4)]
t.qc("s1q21", [(x, F(1, 4)) for x in roots21])

# s1q22: coordinates; BD:DC = 3:2, ED = 2 AE; which triangle matches EBD
A22, B22, C22 = (F(1), F(7)), (F(0), F(0)), (F(10), F(0))
D22 = (B22[0] + F(3, 5) * (C22[0] - B22[0]), F(0))
E22 = (A22[0] + F(1, 3) * (D22[0] - A22[0]), A22[1] + F(1, 3) * (D22[1] - A22[1]))
ar = lambda p, q, r: abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2
target = ar(E22, B22, D22)
cands = [ar(A22, B22, E22), ar(A22, E22, C22), ar(E22, D22, C22), ar(A22, D22, C22), ar(B22, E22, C22)]
t.sel("s1q22", [i for i, v in enumerate(cands) if v == target])

# s1q23: unlit share of a 20 x 30 rectangle with radius-10 quarter disks at the corners (grid estimate), squared
N = 600
unlit = 0
for i in range(N):
    for j in range(N):
        x, y = (i + 0.5) * 30 / N, (j + 0.5) * 20 / N
        if all((x - cx) ** 2 + (y - cy) ** 2 > 100 for cx in (0, 30) for cy in (0, 20)):
            unlit += 1
p23 = unlit / (N * N)
assert abs(p23 - (1 - math.pi / 6)) < 1e-3
t.qc("s1q23", [(round(p23 ** 2, 4), 0.25)])

# s1q24: n/d = 6.35 with 30 < d < 50; remainder
rem24 = set()
for d in range(31, 50):
    for n in range(1, 400):
        if F(n, d) == F(635, 100):
            rem24.add(n % d)
t.qc("s1q24", [(r, 14) for r in rem24])

# d1 table
y23 = [12, 28, 45, 60, 55]
y24 = [10, 24, 52, 64, 70]

def interval_of(counts, pos):
    """0-based interval index holding the pos-th (1-based) value."""
    c = 0
    for i, n in enumerate(counts):
        c += n
        if pos <= c:
            return i

# s1q25: median of 2023 (100th and 101st)
n25 = sum(y23)
iv = {interval_of(y23, n25 // 2), interval_of(y23, n25 // 2 + 1)}
assert len(iv) == 1
t.sel("s1q25", sorted(iv))

# s1q26: percent below 80 in each year
p23b = F(sum(y23[:3]), sum(y23)) * 100
p24b = F(sum(y24[:3]), sum(y24)) * 100
diff = p23b - p24b
opts26 = [("2023", 1), ("2023", 3), ("2024", 1), ("2024", 3), ("2023", 10)]
yr = "2023" if diff > 0 else "2024"
best = min((abs(abs(diff) - pts), i) for i, (y, pts) in enumerate(opts26) if y == yr)
t.sel("s1q26", [best[1]])

# s1q27: replace the below-70 scores by 90+; 25th percentile under nearby position conventions
rev = [0, 0, y24[2], y24[3], y24[4] + y24[0] + y24[1]]
n27 = sum(rev)
pos = n27 * F(25, 100)
iv27 = {interval_of(rev, p) for p in (math.floor(pos), math.ceil(pos), math.ceil(pos) + 1)}
assert len(iv27) == 1
t.sel("s1q27", sorted(iv27))

t.done()
