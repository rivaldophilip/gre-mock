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

# s1q2: -2 < x < 0; A = x^3 - x, B = x^2 - x^4 (equal at x = -1)
xs = [F(n, 16) for n in range(-31, 0)]
t.qc("s1q2", [(v**3 - v, v**2 - v**4) for v in xs])

# s1q3: JK = 7, KL = 10, angle K in (90, 180): A = JL, B = 12
t.qc("s1q3", [(math.sqrt(49 + 100 - 140 * math.cos(math.radians(a))), 12) for a in range(91, 180)])

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

# s1q6: w + b = 120/30, w - b = 120/120; time standing = 120 / b
b = (F(120, 30) - F(120, 120)) / 2
t.choice("s1q6", 120 / b)

# s1q7: six talks, A before B and not adjacent, C not in slot 1
t.choice("s1q7", sum(1 for p in permutations("ABCDEF")
                     if p.index("A") < p.index("B") - 1 and p[0] != "C"))

# s1q8: |x-1| + |x-5| <= 2x
t.where("s1q8", lambda v: abs(v - 1) + abs(v - 5) <= 2 * v)

# s1q9: profit = 1.6*0.75*c - c = 18 -> list price 1.6c
c = F(18) / (F(16, 10) * F(3, 4) - 1)
t.value("s1q9", F(16, 10) * c)

# DI set: orders (thousands) by warehouse: (Ground, Freight, Express)
wh = {"North": (24, 10, 6), "South": (18, 15, 12), "East": (30, 6, 9), "West": (12, 12, 6)}
tot = {w: sum(v) for w, v in wh.items()}

# s1q10: East Ground share minus West Ground share, percentage points, rounded
t.choice("s1q10", round(100 * (F(wh["East"][0], tot["East"]) - F(wh["West"][0], tot["West"]))))

# s1q11: P(warehouse with Ground > half | Express)
good = [w for w in wh if 2 * wh[w][0] > tot[w]]
t.choice("s1q11", F(sum(wh[w][2] for w in good), sum(v[2] for v in wh.values())))

# s1q12: fifth total x (in thousands; search in single orders) with median == mean; greatest x
base = [tot[w] * 1000 for w in wh]
def med_eq_mean(xv):
    v = sorted(base + [xv]); return F(v[2]) == F(sum(v), 5)
sols = [xv for xv in range(0, 300001) if med_eq_mean(xv)]
t.choice("s1q12", max(sols))

# s2q1: A = 5^(1/5), B = 3^(1/3); compare 15th powers exactly
t.qc("s2q1", [(5**3, 3**5)])

# s2q2: sides 6 and 10, area 24 -> included angle with sin = 0.8 (acute or obtuse); A = third side, B = 9
sides = []
for ang in (math.asin(0.8), math.pi - math.asin(0.8)):
    assert abs(0.5 * 6 * 10 * math.sin(ang) - 24) < 1e-9
    sides.append(math.sqrt(36 + 100 - 120 * math.cos(ang)))
t.qc("s2q2", [(s3, 9) for s3 in sides])

# s2q3: n = 5 mod 6; A = (n^2 + n) mod 12, B = 6
t.qc("s2q3", [((n * n + n) % 12, 6) for n in range(5, 500, 6)])

# s2q4: x + 2y + 3z = 20, 3x + 2y + z = 12; A = x+y+z, B = 2z - 2x (over many solutions)
cases = []
for zz in range(-10, 11):
    for xx in range(-10, 11):
        yy = F(20 - xx - 3 * zz, 2)
        if 3 * xx + 2 * yy + zz == 12:
            cases.append((xx + yy + zz, 2 * zz - 2 * xx))
t.qc("s2q4", cases)

# s2q5: independent, pq = 0.2, p + q - pq = 0.7, p > q; A = p, B = 0.5
roots = []
for pn in range(0, 1001):
    p = F(pn, 1000); q = F(9, 10) - p
    if 0 <= q <= 1 and p * q == F(1, 5) and p > q:
        roots.append(p)
assert len(roots) == 1
t.qc("s2q5", [(roots[0], F(1, 2))])

# s2q6: chord 16 at distance 6 -> r; chord 12 parallel; greatest distance between chords
r = math.hypot(8, 6); d2 = math.sqrt(r * r - 36)
t.choice("s2q6", round(max(abs(6 - d2), 6 + d2)))

# s2q7: 240 nurses, 130/110/90, 20 none, 15 all three; exactly one
solved = [(e1, e2) for e2 in range(0, 241) for e1 in range(0, 241)
          if e1 + e2 + 15 == 240 - 20 and e1 + 2 * e2 + 45 == 130 + 110 + 90]
assert len(solved) == 1
t.choice("s2q7", solved[0][0])

# s2q8: square side 10, circle through A(0,0), B(10,0) tangent to y = 10: center (5, y0), r = 10 - y0
y0 = next(F(n, 100) for n in range(0, 1000) if 25 + F(n, 100) ** 2 == (10 - F(n, 100)) ** 2)
t.choice("s2q8", 10 - y0)

# s2q9: P = 45, Q = 30, PR = 6; PQ by the law of sines, matched to the choice texts by value
R = 180 - 45 - 30
pq = 6 * math.sin(math.radians(R)) / math.sin(math.radians(30))
vals = [6 * math.sqrt(2), 3 * math.sqrt(2) + 3 * math.sqrt(6), 6 + 3 * math.sqrt(2), 6 * math.sqrt(3), 9 * math.sqrt(2)]
assert t.choices("s2q9") == ["6\\sqrt{2}", "3\\sqrt{2} + 3\\sqrt{6}", "6 + 3\\sqrt{2}", "6\\sqrt{3}", "9\\sqrt{2}"]
t.sel("s2q9", [i for i, v in enumerate(vals) if abs(v - pq) < 1e-9])

# s2q10: perimeter of the L-shape (traced on the grid) minus perimeter of the 4x6 piece
cells = {(i, j) for i in range(12) for j in range(10) if not (i >= 8 and j >= 4)}
assert len(cells) == 120 - 24
perim = sum(1 for (i, j) in cells for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)) if (i + di, j + dj) not in cells)
t.choice("s2q10", perim - 2 * (4 + 6))

# s2q11: 7 sprinters, 4 ordered legs; Y runs only if X runs; X not on leg 1
t.choice("s2q11", sum(1 for p in permutations("XYabcde", 4)
                      if not ("Y" in p and "X" not in p) and p[0] != "X"))

# s2q12: a - b = 4, a^2 + b^2 = 40 -> a^3 - b^3 (both real solutions)
outs = set()
for bb in (F(n, 1) for n in range(-20, 21)):
    aa = bb + 4
    if aa * aa + bb * bb == 40:
        outs.add(aa**3 - bb**3)
assert len(outs) == 1
t.choice("s2q12", outs.pop())

# s2q13: (x-2)/(x+3) < 1, undefined at x = -3
t.where("s2q13", lambda v: v != -3 and F(v - 2) / (v + 3) < 1)

# s2q14: 5 distinct positive integers, sum 100, median 18; possible greatest values
greatest = set()
for a, bb in combinations(range(1, 18), 2):
    for d in range(19, 101):
        e = 100 - 18 - a - bb - d
        if e > d:
            greatest.add(e)
t.where("s2q14", lambda v: v in greatest)

# s2q15: n < 200 divisible by 6 or 15, not by 10
t.value("s2q15", sum(1 for n in range(1, 200) if (n % 6 == 0 or n % 15 == 0) and n % 10 != 0))

t.done()
