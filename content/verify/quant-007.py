"""Verify every key in content/tests/quant-007.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
from itertools import permutations, product, combinations
from math import comb, erf, sqrt, isclose
import re

from keys import Keys

t = Keys("quant-007")


def ev(text):
    """Numeric value of a choice like 16+8\\sqrt{3}, 4\\sqrt{5}, 18."""
    s = re.sub(r"(\d)\\sqrt\{(\d+)\}", r"\1*sqrt(\2)", text)
    s = re.sub(r"\\sqrt\{(\d+)\}", r"sqrt(\1)", s)
    return eval(s, {"sqrt": sqrt})


def pick(qid, value):
    hits = [i for i, c in enumerate(t.choices(qid)) if isclose(ev(c), value, rel_tol=1e-12)]
    assert len(hits) == 1, (qid, hits)
    t.sel(qid, hits)


# s1q1: integer n with n^2 < 5; A = n^3, B = n^2
t.qc("s1q1", [(n**3, n**2) for n in range(-5, 6) if n * n < 5])

# s1q2: 0 < x < 1; A = x^(-1/2), B = x^(-1/3)
t.qc("s1q2", [(x ** -0.5, x ** (-1 / 3)) for x in (k / 100 for k in range(1, 100))])

# s1q3: points on a line, AB=6, BC=4, CD=3, C not between A and B; A = AD, B = 8
cases = []
for b, dc, dd in product((6, -6), (4, -4), (3, -3)):
    c = b + dc
    if min(0, b) < c < max(0, b):
        continue
    cases.append((abs(c + dd), 8))
t.qc("s1q3", cases)

# s1q4: normal(150, 20): P(>190 | >170) vs 0.1, by the exact normal curve and by the 68-95 rule
tail = lambda z: (1 - erf(z / sqrt(2))) / 2
t.qc("s1q4", [(tail(2) / tail(1), 0.1), (F(25, 10) / 16, F(1, 10))])

# s1q5: budget 3k:5k:8k; 3(5k + 600) = 16k + 600
k = next(k for k in range(1, 10000) if 3 * (5 * k + 600) == 16 * k + 600)
t.choice("s1q5", 16 * k + 600)

# s1q6: r = 10, chord 16, C = midpoint of the minor arc
om = sqrt(10**2 - 8**2)
pick("s1q6", sqrt(8**2 + (10 - om) ** 2))

# s1q7: 4 adults (F = Mia's father) + 3 children (M = Mia), no two children adjacent, M next to F
kids = set("Mxy")
t.choice("s1q7", sum(
    1 for p in permutations("FBCDMxy")
    if not any(p[i] in kids and p[i + 1] in kids for i in range(6)) and abs(p.index("M") - p.index("F")) == 1))

# s1q8: |x - 4| = 2x + 1
t.where("s1q8", lambda x: abs(x - 4) == 2 * x + 1)

# s1q9: rate 8.0% -> 6.8%; percent decrease
t.value("s1q9", (F(80, 10) - F(68, 10)) / F(80, 10) * 100)

north = [20, 36, 28, 16, 10]
lake = [10, 34, 24, 15, 7]
assert sum(north) == 110 and sum(lake) == 90

# s1q10: one-third of Northside >= 20 hours are students; percent of all Northside
t.choice("s1q10", round(100 * F(sum(north[2:]), 3) / sum(north)))

# s1q11: one from each food bank; exactly one logged >= 30 hours (enumerate the pairs)
hi = lambda counts: [i >= 3 for i, n in enumerate(counts) for _ in range(n)]
pn, pl = hi(north), hi(lake)
t.choice("s1q11", round(F(sum(1 for a in pn for b in pl if a != b), len(pn) * len(pl)), 2))

# s1q12: possible medians of the 200 combined values (whole numbers within their groups)
groups = [(0, 9), (10, 19), (20, 29), (30, 39), (40, 49)]
counts = [n + l for n, l in zip(north, lake)]
cum = [sum(counts[:i + 1]) for i in range(5)]
g100 = next(i for i in range(5) if cum[i] >= 100)
g101 = next(i for i in range(5) if cum[i] >= 101)
lo100, hi100 = groups[g100]
lo101, hi101 = groups[g101]
if g100 == g101:
    medians = {F(x + y, 2) for x in range(lo100, hi100 + 1) for y in range(x, hi100 + 1)}
else:
    medians = {F(x + y, 2) for x in range(lo100, hi100 + 1) for y in range(lo101, hi101 + 1)}
t.where("s1q12", lambda v: v in medians)

# s2q1: two-digit n, reversed is 27 more; A = count, B = 6
t.qc("s2q1", [(sum(1 for n in range(10, 100) if int(str(n)[::-1]) - n == 27), 6)])

# s2q2: PQ = 7 longest, QR = 4, some angle obtuse; A = PR, B = 6
def obtuse(a, b, c):
    s = sorted((a, b, c))
    return s[0] + s[1] > s[2] and s[2] ** 2 > s[0] ** 2 + s[1] ** 2
t.qc("s2q2", [(F(x, 100), 6) for x in range(301, 700) if obtuse(7, 4, F(x, 100))])

# s2q3: n < 100, n % 6 == 2 and n % 8 == 3; A = count, B = 1
t.qc("s2q3", [(sum(1 for n in range(1, 100) if n % 6 == 2 and n % 8 == 3), 1)])

# s2q4: (x^3 - x)/(x^2 - x) - (x^2 - 1)/(x + 1) vs 2, x not 0, 1, -1
t.qc("s2q4", [(F(x**3 - x, x**2 - x) - F(x**2 - 1, x + 1), 2) for x in (F(k, 3) for k in range(-30, 31)) if x not in (0, 1, -1)])

# s2q5: 0.6 C = 0.4 G with an overlap of at least one; A = C, B = G
t.qc("s2q5", [(C, G) for C in range(1, 200) for G in range(1, 200) if F(6, 10) * C == F(4, 10) * G and F(6, 10) * C >= 1 and (F(6, 10) * C).denominator == 1])

# s2q6: square base s, height 7, space diagonal 9; base area s^2
t.choice("s2q6", next(F(a, 4) for a in range(1, 4000) if 2 * F(a, 4) + 49 == 81))

# s2q7: legs 6, 8 inscribed; crescents = semicircles on legs + triangle - half circle on hypotenuse
from math import pi
crescents = pi / 2 * (3**2 + 4**2) + 24 - pi / 2 * 5**2
# grid check: points inside a leg semicircle and outside the circle (triangle at (0,0), (6,0), (0,8))
n, h, hits = 1200, 0, 0
for i in range(n):
    for j in range(n):
        x, y = -5 + 16 * (i + 0.5) / n, -5 + 18 * (j + 0.5) / n
        in_semi = ((x - 3) ** 2 + y**2 <= 9 and y <= 0) or (x**2 + (y - 4) ** 2 <= 16 and x <= 0)
        hits += in_semi and (x - 3) ** 2 + (y - 4) ** 2 > 25
assert abs(hits * 16 * 18 / n**2 - crescents) < 0.2, hits * 16 * 18 / n**2
vals = [24, 48, 25 * pi / 2 - 24, 25 * pi / 2, 25 * pi - 24]
t.sel("s2q7", [i for i, v in enumerate(vals) if isclose(v, crescents)])

# s2q8: three hikers, 4 trails, exactly one trail unused
outcomes = list(product(range(4), repeat=3))
t.choice("s2q8", F(sum(1 for o in outcomes if 4 - len(set(o)) == 1), len(outcomes)))

# s2q9: 12 km at 18 km/h, 9 km at 6 m/s; total minutes
t.choice("s2q9", F(12, 18) * 60 + F(9000, 6) / 60)

# s2q10: fraction strictly between 5/8 and 7/11
t.where("s2q10", lambda v: F(5, 8) < v < F(7, 11))

# s2q11: 8 around a table (rotations equal), couples (0,1) and (2,3) not adjacent; fix person 7 in seat 0
def apart(seat, a, b):
    return (seat[a] - seat[b]) % 8 not in (1, 7)
count = 0
for p in permutations(range(7)):
    seat = {person: i + 1 for i, person in enumerate(p)}
    seat[7] = 0
    count += apart(seat, 0, 1) and apart(seat, 2, 3)
t.choice("s2q11", count)

# s2q12: 3x+5y+7z = 41, x+3y+5z = 25; x+2y+3z over the whole (positive) solution line
vals = set()
for zz in (F(n, 4) for n in range(1, 40)):
    # solve for x, y given z
    # 3x + 5y = 41 - 7z ; x + 3y = 25 - 5z
    y = ((25 - 5 * zz) * 3 - (41 - 7 * zz)) / 4
    x = 25 - 5 * zz - 3 * y
    assert 3 * x + 5 * y + 7 * zz == 41 and x + 3 * y + 5 * zz == 25
    if x > 0 and y > 0:
        vals.add(x + 2 * y + 3 * zz)
assert len(vals) == 1
t.choice("s2q12", vals.pop())

# s2q13: a < b < c, a + b + c = 0; statements that hold in every case
trip = [(a, b, -a - b) for a in (F(k, 2) for k in range(-12, 13)) for b in (F(k, 2) for k in range(-12, 13)) if a < b < -a - b]
tests = [lambda a, b, c: a < 0, lambda a, b, c: b < 0, lambda a, b, c: c > 0, lambda a, b, c: a + c < 0, lambda a, b, c: a * c < 0, lambda a, b, c: c > abs(a)]
t.sel("s2q13", [i for i, f in enumerate(tests) if all(f(*x) for x in trip)])

# s2q14: socks 10 red, 8 blue, 6 green; least draws guaranteeing each goal = 1 + largest miss
draws = [(r, b, g) for r in range(11) for b in range(9) for g in range(7)]
goals = [lambda r, b, g: max(r, b, g) >= 2, lambda r, b, g: r >= 3, lambda r, b, g: g >= 2, lambda r, b, g: b >= 1, lambda r, b, g: b >= 2]
need = [1 + max(sum(d) for d in draws if not goal(*d)) for goal in goals]
shown = [4, 17, 19, 17, 17]
t.sel("s2q14", [i for i in range(5) if need[i] == shown[i]])

# s2q15: L = 2W, L - 6 = W + 6 -> square; area increase
w = next(w for w in range(1, 100) if 2 * w - 6 == w + 6)
t.value("s2q15", (w + 6) ** 2 - 2 * w * w)

t.done()
