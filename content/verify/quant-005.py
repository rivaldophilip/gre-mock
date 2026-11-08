"""Verify every key in content/tests/quant-005.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
from itertools import permutations, combinations
import math
import random

from keys import Keys

t = Keys("quant-005")
random.seed(5)

# s1q1: x > y and 1/x > 1/y (nonzero); A = x - y, B = |x + y|
pairs = []
for _ in range(20000):
    x, y = F(random.randint(-500, 500), random.randint(1, 50)), F(random.randint(-500, 500), random.randint(1, 50))
    if x != 0 and y != 0 and x > y and 1 / x > 1 / y:
        pairs.append((x - y, abs(x + y)))
assert len(pairs) > 100
t.qc("s1q1", pairs)

# s1q2: (2^40 + 2^38)/(2^39 + 2^37) vs cube root of 9 (compare cubes: A^3 vs 9)
A = F(2**40 + 2**38, 2**39 + 2**37)
t.qc("s1q2", [(A**3, 9)])

# s1q3: D midpoint of AC with BD = AD: B on the circle with diameter AC = 2; A = AB + BC, B = sqrt2 * AC
cases = []
for deg in list(range(1, 180)):
    th = math.radians(deg)
    B = (math.cos(th), math.sin(th))  # A = (-1, 0), C = (1, 0), D = (0, 0)
    ab = math.dist(B, (-1, 0)); bc = math.dist(B, (1, 0))
    assert abs(math.dist(B, (0, 0)) - 1) < 1e-12
    cases.append((round(ab + bc, 9), round(math.sqrt(2) * 2, 9)))
t.qc("s1q3", cases)

# s1q4: 20 values with mean 40, population sd 6; add 34 and 46
base = [random.gauss(0, 1) for _ in range(20)]
m = sum(base) / 20; s = math.sqrt(sum((v - m) ** 2 for v in base) / 20)
data = [40 + 6 * (v - m) / s for v in base]
new = data + [34, 46]
mu = sum(new) / 22
sd = math.sqrt(sum((v - mu) ** 2 for v in new) / 22)
# exact version: sum of squared deviations 20*36 + 2*36 over 22
exact = F(20 * 36 + (34 - 40) ** 2 + (46 - 40) ** 2, 22)
assert abs(sd ** 2 - float(exact)) < 1e-9
t.qc("s1q4", [(exact, 36)])

# s1q5: 5k / (3k + 24) = 5/4; total after = 5k + 3k + 24
k = next(k for k in range(1, 1000) if F(5 * k, 3 * k + 24) == F(5, 4))
t.choice("s1q5", 8 * k + 24)

# s1q6: (7^83 + 3^83) mod 20
t.choice("s1q6", (pow(7, 83) + pow(3, 83)) % 20)

# s1q7: 3 band songs (B0..B2), 4 others; no two band songs adjacent, first song not a band song
songs = ["B0", "B1", "B2", "O0", "O1", "O2", "O3"]
cnt = 0
for p in permutations(songs):
    if p[0][0] == "B":
        continue
    if any(p[i][0] == "B" and p[i + 1][0] == "B" for i in range(6)):
        continue
    cnt += 1
t.choice("s1q7", cnt)

# s1q8: |x-3| + |x+1| <= 6 and |2x| > 3
t.where("s1q8", lambda x: abs(x - 3) + abs(x + 1) <= 6 and abs(2 * x) > 3)

# s1q9: 2/5 c - 18 = 1/4 c; amount to add = 3/4 c
c = F(18) / (F(2, 5) - F(1, 4))
t.value("s1q9", c - (F(2, 5) * c - 18))

share = {"print": (55, 46), "ebook": (18, 24), "audio": (12, 16), "dvd": (10, 6), "mag": (5, 8)}
total = (840, 1050)
assert all(sum(v[i] for v in share.values()) == 100 for i in (0, 1))
count = {f: (F(p0, 100) * total[0], F(p1, 100) * total[1]) for f, (p0, p1) in share.items()}

# s1q10: percent change in print loans, closest choice
chg = 100 * (count["print"][1] - count["print"][0]) / count["print"][0]
vals = [F(c.replace("\\%", "").replace("+", "")) for c in t.choices("s1q10")]
t.sel("s1q10", min(range(len(vals)), key=lambda i: abs(vals[i] - chg)))

# s1q11: weighted mean of 14 (e-books) and 21 (audiobooks) by 2024 counts
e, a = count["ebook"][1], count["audio"][1]
t.choice("s1q11", (14 * e + 21 * a) / (e + a))

# s1q12: late DVD loans: 20% in 2022, 40% in 2024; P(2024 | late)
late22, late24 = F(20, 100) * count["dvd"][0], F(40, 100) * count["dvd"][1]
t.choice("s1q12", late24 / (late22 + late24))

# s2q1: k(k+1)(k+2) not divisible by 4; A = k mod 4, B = 1
t.qc("s2q1", [(k % 4, 1) for k in range(1, 5000) if k * (k + 1) * (k + 2) % 4 != 0])

# s2q2: arc 4pi, sector area 24pi: r = 2*area/arc; central angle fraction = arc / (2 pi r)
r = 2 * F(24) / F(4)
frac = F(4) / (2 * r)          # fraction of the circumference
deg = 360 * frac
assert deg == 60               # equilateral triangle AOB, chord = r
chord = 2 * float(r) * math.sin(math.radians(float(deg)) / 2)
t.qc("s2q2", [(round(chord, 9), 12)])

# s2q3: distinct positive integers a<b<c<d<=10 summing to 30; A = least c, B = 7
cs = [q[2] for q in combinations(range(1, 11), 4) if sum(q) == 30]
t.qc("s2q3", [(min(cs), 7)])

# s2q4: 6/x < 2 and x^2 - 2x < 3, x != 0; A = x, B = 0
xs = [F(n, 100) for n in range(-1000, 1001) if n != 0]
t.qc("s2q4", [(x, 0) for x in xs if 6 / x < 2 and x * x - 2 * x < 3])

# s2q5: Kim uniform 1..10, Lee uniform 1..12; A = P(Kim > Lee), B = 2/5
pk = F(sum(1 for k in range(1, 11) for l in range(1, 13) if k > l), 120)
t.qc("s2q5", [(pk, F(2, 5))])

# s2q6: list price L with L * 0.75 * 0.9 = 54; percent above cost 50
L = F(54) / (F(3, 4) * F(9, 10))
t.choice("s2q6", 100 * (L - 50) / 50)

# s2q7: equilateral triangle side s: R = s/sqrt3, r = s/(2 sqrt3); pi(R^2 - r^2) = 12 pi
s2 = next(F(n, 1) for n in range(1, 1000) if F(n, 3) - F(n, 12) == 12)   # s^2
assert s2 == 48
s = math.sqrt(s2)
assert abs(s - 4 * math.sqrt(3)) < 1e-12
t.choice("s2q7", "4\\sqrt3")

# s2q8: 4 ordered legs from 9 runners; P and Q both or neither; if both, consecutive legs
runners = ["P", "Q"] + [f"R{i}" for i in range(7)]
n = 0
for legs in permutations(runners, 4):
    hasP, hasQ = "P" in legs, "Q" in legs
    if hasP != hasQ:
        continue
    if hasP and abs(legs.index("P") - legs.index("Q")) != 1:
        continue
    n += 1
t.choice("s2q8", n)

# s2q9: A works all 3 hours at 1/6; B works tB hours at 1/4; A alone = 3 - tB
tB = (1 - F(3, 6)) / F(1, 4)
t.choice("s2q9", 3 - tB)

# s2q10: c + m = 150, 12c + 7m = 1450; cars minus motorcycles
sol = [(c, 150 - c) for c in range(0, 151) if 12 * c + 7 * (150 - c) == 1450]
assert len(sol) == 1
t.choice("s2q10", sol[0][0] - sol[0][1])

# s2q11: E1 + E2 + E3 = 75, E1 + 2E2 + 3E3 = 120, E3 = 10; also confirm a Venn configuration exists
E3 = 10
E2 = (45 + 40 + 35) - 3 * E3 - (80 - 5 - E3)
E1 = 80 - 5 - E3 - E2
ok = any(45 - x - y - E3 >= 0 and 40 - x - z - E3 >= 0 and 35 - y - z - E3 >= 0
         for x in range(E2 + 1) for y in range(E2 + 1 - x) for z in [E2 - x - y])
assert ok
t.choice("s2q11", E1)

# s2q12: 30-60-90 legs a, a*sqrt3, hyp 2a; altitude a*a*sqrt3/(2a) = 6 -> hyp = 2a
a = 12 / math.sqrt(3)
assert abs(a * a * math.sqrt(3) / (2 * a) - 6) < 1e-12
assert abs(2 * a - 8 * math.sqrt(3)) < 1e-12
t.choice("s2q12", "8\\sqrt3")

# s2q13: which expressions equal (a-b)^2 (a+b)^2 for all a, b (exact random tests)
exprs = [
    lambda a, b: a**4 - b**4,
    lambda a, b: (b * b - a * a) ** 2,
    lambda a, b: (a * a + b * b) ** 2 - 4 * a * a * b * b,
    lambda a, b: a**4 - 2 * a * a * b * b - b**4,
    lambda a, b: (a + b) ** 4 - 4 * a * b * (a + b) ** 2,
    lambda a, b: (a * a - b * b) * (b * b - a * a),
]
tests = [(F(random.randint(-30, 30), random.randint(1, 9)), F(random.randint(-30, 30), random.randint(1, 9))) for _ in range(200)]
t.sel("s2q13", [i for i, f in enumerate(exprs) if all(f(a, b) == (a - b) ** 2 * (a + b) ** 2 for a, b in tests)])

# s2q14: sides 6, 10, x form an obtuse triangle
def obtuse(x):
    sides = sorted([F(6), F(10), F(x)])
    return sides[0] + sides[1] > sides[2] and sides[2] ** 2 > sides[0] ** 2 + sides[1] ** 2
t.where("s2q14", obtuse)

# s2q15: (12 + 2w)(8 + 2w) = 2 * 96, w > 0; outer perimeter
w = next(F(n, 100) for n in range(1, 10000) if (12 + 2 * F(n, 100)) * (8 + 2 * F(n, 100)) == 192)
t.value("s2q15", 2 * ((12 + 2 * w) + (8 + 2 * w)))

t.done()
