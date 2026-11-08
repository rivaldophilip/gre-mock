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


# s1q1: nonzero x with x^3 < x; A = x^2, B = |x|
t.qc("s1q1", [(x * x, abs(x)) for x in (F(n, 8) for n in range(-40, 41)) if x != 0 and x**3 < x])

# s1q2: (3^40 - 3^38)/(3^39 + 3^37) vs 12/5
t.qc("s1q2", [(F(3**40 - 3**38, 3**39 + 3**37), F(12, 5))])

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

# s1q8: |x-2| + |x+3| < 9
t.where("s1q8", lambda x: abs(x - 2) + abs(x + 3) < 9)

# s1q9: 1.2 (1 - p/100) = 0.96
t.value("s1q9", next(p for p in range(0, 101) if F(12, 10) * (1 - F(p, 100)) == F(96, 100)))

north = [20, 36, 28, 16, 10]
lake = [10, 34, 24, 15, 7]
assert sum(north) == 110 and sum(lake) == 90

# s1q10: share of the >= 30-hour volunteers who are at Lakeview
t.choice("s1q10", round(100 * F(sum(lake[3:]), sum(lake[3:]) + sum(north[3:]))))

# s1q11: two from the 0-9 group without replacement; P(both N | at least one N)
pool = ["N"] * north[0] + ["L"] * lake[0]
pairs = list(combinations(range(len(pool)), 2))
given = [p for p in pairs if "N" in (pool[p[0]], pool[p[1]])]
t.choice("s1q11", F(sum(1 for p in given if pool[p[0]] == pool[p[1]] == "N"), len(given)))

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

# s2q1: ordered pairs of positive integers with m^2 - n^2 = 48; B = 4
t.qc("s2q1", [(sum(1 for m in range(1, 100) for n in range(1, m) if m * m - n * n == 48), 4)])

# s2q2: PQ = 7, QR = 4, some angle obtuse; A = PR, B = 8
def obtuse(a, b, c):
    s = sorted((a, b, c))
    return s[0] + s[1] > s[2] and s[2] ** 2 > s[0] ** 2 + s[1] ** 2
t.qc("s2q2", [(F(x, 10), 8) for x in range(31, 110) if obtuse(7, 4, F(x, 10))])

# s2q3: units digit of 3^n is 7; A = units digit of 7^n, B = n mod 8
t.qc("s2q3", [(pow(7, n, 10), n % 8) for n in range(1, 400) if pow(3, n, 10) == 7])

# s2q4: a - b = 4, ab = 5 -> (a, b) = (5, 1) or (-1, -5)
sols = [(b + 4, b) for b in range(-20, 21) if (b + 4) * b == 5]
assert len(sols) == 2
t.qc("s2q4", [(a**3 - b**3, (a + b) ** 3) for a, b in sols])

# s2q5: 60 students, 38 Spanish, 41 Mandarin; A = both - neither, B = 19
t.qc("s2q5", [(both - (60 - (38 + 41 - both)), 19) for both in range(0, 39) if 0 <= 60 - (38 + 41 - both) and both <= 38])

# s2q6: ACD is 30-60-90 with CD = 4 opposite 30 deg; ABC right isosceles on hypotenuse AC
ac = 4 * 2
ad = sqrt(ac**2 - 4**2)
pick("s2q6", 0.5 * 4 * ad + (ac / sqrt(2)) ** 2 / 2)

# s2q7: equilateral triangle, R = 2r, pi(R^2 - r^2) = 27 pi
r = next(r for r in range(1, 50) if (2 * r) ** 2 - r**2 == 27)
side = 2 * r * sqrt(3)
pick("s2q7", 3 * side)

# s2q8: four hikers, 4 trails, exactly one trail unused
outcomes = list(product(range(4), repeat=4))
t.choice("s2q8", F(sum(1 for o in outcomes if len(set(o)) == 3), len(outcomes)))

# s2q9: drones 40t and 60(t - 1/2), t hours after 9:00; second 10 km ahead
tt = next(F(m, 60) for m in range(30, 600) if 60 * (F(m, 60) - F(1, 2)) - 40 * F(m, 60) == 10)
mins = 9 * 60 + int(tt * 60)
t.choice("s2q9", f"{mins // 60}:{mins % 60:02d} a.m.")

# s2q10: fraction strictly between 5/8 and 7/11
t.where("s2q10", lambda v: F(5, 8) < v < F(7, 11))

# s2q11: relay, 7 runners (X = Xia, Y = Yusuf); Y only with X; X not on leg 1
t.choice("s2q11", sum(
    1 for p in permutations("XYabcde", 4)
    if ("Y" not in p or "X" in p) and p[0] != "X"))

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

# s2q13: (6 - x)/(-2) < x + 3 <= 15 - 2x
t.where("s2q13", lambda x: (6 - x) / F(-2) < x + 3 <= 15 - 2 * x)

# s2q14: 7 distinct positive integers summing to 50; possible medians
def parts(total, count, least):
    if count == 0:
        if total == 0:
            yield ()
        return
    for v in range(least, total + 1):
        if v * count + count * (count - 1) // 2 > total:
            break
        for rest in parts(total - v, count - 1, v + 1):
            yield (v,) + rest
meds = {p[3] for p in parts(50, 7, 1)}
t.where("s2q14", lambda v: v in meds)

# s2q15: perimeter 66, border 3 wide; border area for every split L + W = 33
areas = {(L + 6) * (33 - L + 6) - L * (33 - L) for L in (F(n, 2) for n in range(1, 66))}
assert len(areas) == 1
t.value("s2q15", areas.pop())

t.done()
