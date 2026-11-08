"""Verify every key in content/tests/quant-006.json: each answer is computed here and compared with the key."""
from fractions import Fraction as F
from itertools import product
import math
import random

from keys import Keys

t = Keys("quant-006")

# s1q1: x < 0 < y, x + y > 0; A = x/y, B = y/x
t.qc("s1q1", [(F(x, 1) / y, F(y, 1) / x) for x in range(-30, 0) for y in range(1, 40) if x + y > 0])

# s1q2: 2^50 mod 7 vs 3^50 mod 7
t.qc("s1q2", [(pow(2, 50, 7), pow(3, 50, 7))])

# s1q3: PQ=6, QR=8, area 20 -> height 5, P = (+-sqrt(11), 5) with Q at the origin, R at (8, 0); A = PR, B = 10
h = 2 * 20 / 8
off = math.sqrt(36 - h * h)
t.qc("s1q3", [(math.hypot(8 - px, h), 10) for px in (off, -off)])

# s1q4: 24 values, mean 70, SD 5; add 65 and 75. Random data sets rescaled to exact mean/SD (population and sample SD)
random.seed(6)
pairs = []
for _ in range(200):
    raw = [random.gauss(0, 1) for _ in range(24)]
    m = sum(raw) / 24
    for ddof in (0, 1):
        sd = math.sqrt(sum((v - m) ** 2 for v in raw) / (24 - ddof))
        S = [70 + 5 * (v - m) / sd for v in raw]
        T = S + [65, 75]
        mt = sum(T) / len(T)
        sdt = math.sqrt(sum((v - mt) ** 2 for v in T) / (len(T) - ddof))
        pairs.append((round(sdt, 9), 5))
t.qc("s1q4", pairs)

# s1q5: 1.2 * 0.8 * (1 + p/100) = 1, p to the nearest tenth
p = (1 / (F(12, 10) * F(8, 10)) - 1) * 100
t.choice("s1q5", F(round(p * 10), 10))

# s1q6: 12/(v-2) + 12/(v+2) = 4.5 -> v; difference of legs in minutes
v = next(F(n, 100) for n in range(201, 5000) if F(12) / (F(n, 100) - 2) + F(12) / (F(n, 100) + 2) == F(9, 2))
t.choice("s1q6", (12 / (v - 2) - 12 / (v + 2)) * 60)

# s1q7: four-digit integers with digit product 24
t.choice("s1q7", sum(1 for n in range(1000, 10000) if math.prod(int(d) for d in str(n)) == 24))

# s1q8: -2 <= 3 - 5x < 18; which values can x^2 take (x on a fine grid plus exact roots)
def x_ok(x):
    return -2 <= 3 - 5 * x < 18
def square_possible(val):
    if val < 0:
        return False
    r = math.sqrt(val)
    return any(x_ok(c) for c in (r, -r))
t.where("s1q8", lambda c: square_possible(float(c)))

# s1q9: prod_{k=2}^{10} (1 - 1/k^2)
t.value("s1q9", math.prod(1 - F(1, k * k) for k in range(2, 11)))

years = [2019, 2020, 2021, 2022, 2023, 2024]
spanish = dict(zip(years, [860, 820, 800, 740, 720, 700]))
french = dict(zip(years, [480, 500, 490, 460, 450, 440]))
mandarin = dict(zip(years, [120, 150, 200, 240, 270, 300]))

# s1q10: Mandarin % increase 2021->2024 over Spanish % decrease 2021->2024
inc = F(mandarin[2024] - mandarin[2021], mandarin[2021])
dec = F(spanish[2021] - spanish[2024], spanish[2021])
t.choice("s1q10", inc / dec)

# s1q11: 2023, 60 in both French and Mandarin, nobody else in two courses; P(both | not Spanish)
both = 60
t.choice("s1q11", F(both, french[2023] + mandarin[2023] - both))

# s1q12: French 2019-2025 with x in 2025: median = mean; sum of all possible x (search integers and halves)
def med(vals):
    s = sorted(vals); return s[len(s) // 2]
fr = list(french.values())
sols = [x for x in (F(n, 2) for n in range(0, 4000)) if med(fr + [x]) == F(sum(fr) + x, 7)]
assert all(s.denominator == 1 for s in sols)
t.choice("s1q12", sum(sols))

# s2q1: sqrt17 - sqrt15 vs sqrt15 - sqrt13
t.qc("s2q1", [(math.sqrt(17) - math.sqrt(15), math.sqrt(15) - math.sqrt(13))])

# s2q2: number of integers with |x+3| > 2|x-1| vs 4
t.qc("s2q2", [(sum(1 for x in range(-1000, 1000) if abs(x + 3) > 2 * abs(x - 1)), 4)])

# s2q3: P(more heads than tails) in 5 vs 6 fair tosses
def more_heads(n):
    return F(sum(1 for seq in product((0, 1), repeat=n) if 2 * sum(seq) > n), 2 ** n)
t.qc("s2q3", [(more_heads(5), more_heads(6))])

# s2q4: greatest integer dividing every k with 72 | k^2, vs 12
g = 0
for k in range(1, 20000):
    if k * k % 72 == 0:
        g = math.gcd(g, k)
t.qc("s2q4", [(g, 12)])

# s2q5: a^2 + b^2 = 14, ab = 5: a, b roots of u^2 - s u + 5 with s^2 = 24; A = |a| + |b|, B = 5
cases = []
for s in (math.sqrt(24), -math.sqrt(24)):
    d = math.sqrt(s * s - 20)
    a, b = (s + d) / 2, (s - d) / 2
    assert abs(a * a + b * b - 14) < 1e-9 and abs(a * b - 5) < 1e-9
    cases.append((abs(a) + abs(b), 5))
t.qc("s2q5", cases)

# s2q6: (5k + 20) / (3k - 40) = 3; total now
k = next(k for k in range(14, 1000) if 5 * k + 20 == 3 * (3 * k - 40))
t.choice("s2q6", 5 * k + 20 + 3 * k - 40)

# s2q7: two circles r = 6, centers 6*sqrt2 apart: lens area (numeric) matched to the choice 18pi - 36
r, d = 6, 6 * math.sqrt(2)
lens = 2 * r * r * math.acos(d / (2 * r)) - d / 2 * math.sqrt(4 * r * r - d * d)
vals = [9 * math.pi - 18, 18 * math.pi - 36, 18 * math.pi - 18, 24 * math.pi - 18 * math.sqrt(3), 36 * math.pi - 36]
t.sel("s2q7", [i for i, val in enumerate(vals) if abs(val - lens) < 1e-9])

# s2q8: pairings of 8 players into 4 unlabelled pairs with neither sibling pair (0,1), (2,3) together
def pairings(people):
    if not people:
        yield []
        return
    a = people[0]
    for i in range(1, len(people)):
        rest = people[1:i] + people[i + 1:]
        for p in pairings(rest):
            yield [(a, people[i])] + p
t.choice("s2q8", sum(1 for p in pairings(list(range(8))) if (0, 1) not in p and (2, 3) not in p))

# s2q9: 2x+3y+4z=29, 4x+3y+2z=25, positive integers; greatest z
t.choice("s2q9", max(z for x in range(1, 30) for y in range(1, 30) for z in range(1, 30)
                    if 2 * x + 3 * y + 4 * z == 29 and 4 * x + 3 * y + 2 * z == 25))

# s2q10: (4+2w)(6+2w) = 48 -> outer perimeter
w = next(F(n, 100) for n in range(1, 1000) if (4 + 2 * F(n, 100)) * (6 + 2 * F(n, 100)) == 48)
t.choice("s2q10", 2 * ((4 + 2 * w) + (6 + 2 * w)))

# s2q11: square in semicircle r=5: s^2/4 + s^2 = 25; circle inscribed in square; semicircle minus circle
s2 = F(25) / F(5, 4)
region = F(25, 2) - s2 / 4  # coefficient of pi
vals = [F(5), F(15, 2), None, F(10), F(25, 4)]
t.sel("s2q11", [i for i, val in enumerate(vals) if val == region])

# s2q12: AC = 6*sqrt2, right angle at C, angle CAD = 30 -> AD = AC / cos 30
ad = 6 * math.sqrt(2) / math.cos(math.radians(30))
vals = [6 * math.sqrt(2), 4 * math.sqrt(6), 6 * math.sqrt(3), 12, 12 * math.sqrt(2)]
t.sel("s2q12", [i for i, val in enumerate(vals) if abs(val - ad) < 1e-9])

# s2q13: 80 members, 52 ridge, 41 canyon, at least 10 neither: possible "exactly one" counts
exactly_one = {52 + 41 - 2 * b for b in range(0, 42) if 52 + 41 - b <= 80 - 10}
t.where("s2q13", lambda c: c in exactly_one)

# s2q14: distinct integers a<b<c, sum 30, triangle: possible longest
longest = {c for a in range(1, 30) for b in range(a + 1, 30) for c in range(b + 1, 30) if a + b + c == 30 and a + b > c}
t.where("s2q14", lambda c: c in longest)

# s2q15: AB=7, BC=11, integer AC < 11, obtuse triangles
def obtuse(x, y, z):
    a, b, c = sorted((x, y, z))
    return a + b > c and a * a + b * b < c * c
t.value("s2q15", sum(1 for ac in range(1, 11) if obtuse(7, 11, ac)))

t.done()
