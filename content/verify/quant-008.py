"""Verify every key in content/tests/quant-008.json: each answer is computed here and compared with the key."""
from fractions import Fraction as F
from itertools import combinations, permutations
from statistics import NormalDist
import math

from keys import Keys

t = Keys("quant-008")

# s1q1: x = 0.(36) = 36/99; A = 1/x, B = 2.75
x = F(36, 99)
t.qc("s1q1", [(1 / x, F(11, 4))])

# s1q2: 2 < x < 3; A = x^2 - 5x, B = -6
t.qc("s1q2", [(x * x - 5 * x, -6) for x in (F(k, 50) for k in range(101, 150))])

# s1q3: kite PQ = QR = 5, RS = SP = 8; angle QPS vs angle QRS over every diagonal QS
def angle(a, b, c):  # angle between sides a and b, opposite c
    return math.degrees(math.acos((a * a + b * b - c * c) / (2 * a * b)))
t.qc("s1q3", [(round(angle(5, 8, qs), 9), round(angle(5, 8, qs), 9)) for qs in (3.1 + 0.2 * k for k in range(49))])

# s1q4: normal; 2.5% above 90, 16% below 60. A = P(X > 80), B = P(50 < X < 60)
pairs = []
for z_hi, z_lo in [(2, -1), (NormalDist().inv_cdf(0.975), NormalDist().inv_cdf(0.16))]:
    s = (90 - 60) / (z_hi - z_lo); m = 60 - z_lo * s
    d = NormalDist(m, s)
    pairs.append((1 - d.cdf(80), d.cdf(60) - d.cdf(50)))
t.qc("s1q4", pairs)

# s1q5: h:p = 3:5, p:a = 4:7, a - h = 46; paperbacks (brute force over integer counts)
pb = [p for h in range(1, 500) for p in range(1, 500) for a in range(1, 500)
      if 5 * h == 3 * p and 7 * p == 4 * a and a - h == 46]
assert len(pb) == 1
t.choice("s1q5", pb[0])

# s1q6: 1/b + 1/(b + 5) = 1/6
t.choice("s1q6", next(b for b in range(1, 100) if F(1, b) + F(1, b + 5) == F(1, 6)))

# s1q7: six talks, A before B and not adjacent, C not in slot 1
t.choice("s1q7", sum(1 for p in permutations("ABCDEF")
                     if p.index("A") < p.index("B") - 1 and p[0] != "C"))

# s1q8: |a - b| = 5, |b - c| = 3; possible |a - c|
t.where("s1q8", lambda v: v in {abs(5 * s1 - 3 * s2) for s1 in (1, -1) for s2 in (1, -1)})

# s1q9: 0.85 p = 68
t.value("s1q9", F(68) / F(85, 100))

# DI set: orders (thousands) by warehouse: (Ground, Freight, Express)
wh = {"North": (24, 10, 6), "South": (18, 15, 12), "East": (30, 6, 9), "West": (12, 12, 6)}
tot = {w: sum(v) for w, v in wh.items()}

# s1q10: East Ground share minus West Ground share, percentage points, rounded
t.choice("s1q10", round(100 * (F(wh["East"][0], tot["East"]) - F(wh["West"][0], tot["West"]))))

# s1q11: P(warehouse with Ground > half | Express)
good = [w for w in wh if 2 * wh[w][0] > tot[w]]
t.choice("s1q11", F(sum(wh[w][2] for w in good), sum(v[2] for v in wh.values())))

# s1q12: 2026 Express: most-Express warehouse -6, others +2; mean minus median, in orders
top = max(wh, key=lambda w: wh[w][2])
ex = sorted(wh[w][2] + (-6 if w == top else 2) for w in wh)
t.choice("s1q12", (F(sum(ex), 4) - F(ex[1] + ex[2], 2)) * 1000)

# s2q1: A = 5^(1/5), B = 3^(1/3); compare 15th powers exactly
t.qc("s2q1", [(5**3, 3**5)])

# s2q2: AD = 4, DB = 2, DE || BC; A = area DBCE, B = area ADE (fractions of ABC)
k = F(4, 6) ** 2
t.qc("s2q2", [(1 - k, k)])

# s2q3: n = 5 mod 6; A = (n^2 + n) mod 12, B = 6
t.qc("s2q3", [((n * n + n) % 12, 6) for n in range(5, 500, 6)])

# s2q4: 1/a + 1/b = 1/c, positive; A = c, B = a
t.qc("s2q4", [(1 / (1 / a + 1 / b), a) for a in (F(k, 3) for k in range(1, 30)) for b in (F(k, 3) for k in range(1, 30))])

# s2q5: independent, P(train) = 0.5, P(at least one) = 0.7; A = P(bus), B = 0.4
roots = [q for q in (F(n, 1000) for n in range(0, 1001)) if F(1, 2) + q - F(1, 2) * q == F(7, 10)]
assert len(roots) == 1
t.qc("s2q5", [(roots[0], F(2, 5))])

# s2q6: front 50 cm x 120 turns; rear 30 cm; extra turns
t.choice("s2q6", F(120 * 50, 30) - 120)

# s2q7: 200 members, 120/90/75, 25 none, exactly two = 40; all three
solved = [e3 for e3 in range(0, 201) for e1 in range(0, 201) if e1 + 40 + e3 == 175 and e1 + 2 * 40 + 3 * e3 == 285]
assert len(solved) == 1
t.choice("s2q7", solved[0])

# s2q8: square side 10, circle through A(0,0), B(10,0) tangent to y = 10: center (5, y0), r = 10 - y0
y0 = next(F(n, 100) for n in range(0, 1000) if 25 + F(n, 100) ** 2 == (10 - F(n, 100)) ** 2)
t.choice("s2q8", 10 - y0)

# s2q9: AD = BD = 6, DC = 2 sqrt 3, BD perpendicular to AC; angle ABC
abc = math.degrees(math.atan2(6, 6)) + math.degrees(math.atan2(2 * math.sqrt(3), 6))
t.sel("s2q9", [[60, 75, 90, 105, 120].index(round(abc))])

# s2q10: perimeter of the L-shape (traced on the grid) minus perimeter of the 4x6 piece
cells = {(i, j) for i in range(12) for j in range(10) if not (i >= 8 and j >= 4)}
assert len(cells) == 120 - 24
perim = sum(1 for (i, j) in cells for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)) if (i + di, j + dj) not in cells)
t.choice("s2q10", perim - 2 * (4 + 6))

# s2q11: subsets of 1..10 with more evens than odds
t.choice("s2q11", sum(1 for k in range(11) for s in combinations(range(1, 11), k) if sum(x % 2 == 0 for x in s) > sum(x % 2 for x in s)))

# s2q12: -(a - b) - [b - (a - c)] - c, compared with each choice at many points
expr = lambda a, b, c: -(a - b) - (b - (a - c)) - c
opts = [lambda a, b, c: -2 * c, lambda a, b, c: 0, lambda a, b, c: 2 * a - 2 * b, lambda a, b, c: 2 * a - 2 * c, lambda a, b, c: -2 * b]
pts = [(a, b, c) for a in range(-3, 4) for b in range(-3, 4) for c in range(-3, 4)]
t.sel("s2q12", [i for i, f in enumerate(opts) if all(f(*p) == expr(*p) for p in pts)])

# s2q13: 12a + 7(a + 3) between 100 and 150
t.where("s2q13", lambda a: 100 <= 12 * a + 7 * (a + 3) <= 150)

# s2q14: rectangle in the corner of a 6-8 right triangle; attainable areas
areas14 = [x * (6 - F(3, 4) * x) for x in (F(k, 100) for k in range(1, 800))]
hi14 = max(areas14)
t.where("s2q14", lambda v: 0 < v <= hi14)

# s2q15: pairs 1..10 with ab + a + b odd
t.value("s2q15", sum(1 for a in range(1, 11) for b in range(1, 11) if (a * b + a + b) % 2))

t.done()
