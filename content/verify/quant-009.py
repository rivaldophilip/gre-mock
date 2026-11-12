"""Verify every key in content/tests/quant-009.json: each answer is computed here and compared with the key."""
from fractions import Fraction as F
from itertools import permutations
import math
import random
import statistics

from keys import Keys

t = Keys("quant-009")


def num(c):
    from keys import number
    return number(c.replace("{,}", "").replace("\\%", ""))


def nearest(qid, value):
    """Index of the numeric choice closest to value; the runner-up must be clearly farther."""
    from keys import number
    nums = [float(num(c)) for c in t.choices(qid)]
    d = sorted((abs(n - float(value)), i) for i, n in enumerate(nums))
    assert d[1][0] - d[0][0] > 0.005, (qid, d[:2])
    t.sel(qid, d[0][1])


def pick(qid, values, target):
    """values: choice index -> float value of that choice text; select those equal to target."""
    assert len(values) == len(t.choices(qid))
    t.sel(qid, [i for i, v in enumerate(values) if abs(v - target) < 1e-9])


# s1q1: (sqrt3 + 1)^2 - 2 sqrt3 vs 4
t.qc("s1q1", [(round((math.sqrt(3) + 1) ** 2 - 2 * math.sqrt(3), 9), 4)])

# s1q2: 0.1 < x < 0.2; A = 1/x - x, B = 5
t.qc("s1q2", [(1 / x - x, 5) for x in (F(k, 1000) for k in range(101, 200))])

# s1q3: BD = 2 DC, E midpoint of AD; areas by coordinates over several shapes
def tri(p, q, r):
    return abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2
cases3 = []
for ax, ay in ((0, 5), (2, 3), (-4, 7), (9, 1)):
    A_, B_, C_ = (F(ax), F(ay)), (F(0), F(0)), (F(9), F(0))
    D_ = (F(6), F(0))
    E_ = ((A_[0] + D_[0]) / 2, (A_[1] + D_[1]) / 2)
    cases3.append((tri(A_, B_, E_), tri(A_, D_, C_)))
t.qc("s1q3", cases3)

# s1q4: n/d = 14.36; least d
t.qc("s1q4", [(next(d for d in range(1, 1000) if F(1436, 100) * d == int(F(1436, 100) * d)), 25)])

# s1q5: y = (3x + 2)/(x - 1); which choice gives x back
xs5 = [F(k, 3) for k in range(-12, 13) if F(k, 3) != 1 and 3 * F(k, 3) + 2 != 3 * (F(k, 3) - 1)]
inv = [lambda y: (y + 2) / (y - 3), lambda y: (y - 2) / (y + 3), lambda y: (y + 2) / (3 - y), lambda y: (3 * y + 2) / (y - 1), lambda y: (y - 3) / (y + 2)]
def ok5(f):
    try:
        return all(f((3 * x + 2) / (x - 1)) == x for x in xs5)
    except ZeroDivisionError:
        return False
t.sel("s1q5", [i for i, f in enumerate(inv) if ok5(f)])

# s1q6: d/60 + d/40 = 4.5; average speed over 5 h
d = F(9, 2) / (F(1, 60) + F(1, 40))
t.choice("s1q6", 2 * d / 5)

# s1q7: a + b + c = 6, each 0..3
t.choice("s1q7", sum(1 for a in range(4) for b in range(4) for c_ in range(4) if a + b + c_ == 6))

# s1q8: statements equivalent to -3x + 4 >= 10 on a grid
xs8 = [F(k, 4) for k in range(-40, 41)]
base8 = [x for x in xs8 if -3 * x + 4 >= 10]
forms = [lambda x: x <= -2, lambda x: x >= -2, lambda x: 3 * x + 6 <= 0, lambda x: -x >= 2, lambda x: x + 2 >= 0, lambda x: x / -2 <= 1]
t.sel("s1q8", [i for i, f in enumerate(forms) if [x for x in xs8 if f(x)] == base8])

# s1q9: 2.5 cm = 15 km; park 3 x 2 cm; area km^2
s9 = F(15) / F(25, 10)
t.value("s1q9", 3 * s9 * 2 * s9)

# DI table
T = {"birds": (840, 45, 20, 35), "mammals": (520, 40, 35, 25), "reptiles": (180, 25, 45, 30), "amphibians": (60, 90, 5, 5)}
for n, r, tr, c in T.values():
    assert r + tr + c == 100
rel = {g: F(n * r, 100) for g, (n, r, _, _) in T.items()}
trans = {g: F(n * tr, 100) for g, (n, _, tr, _) in T.items()}
care = {g: F(n * c, 100) for g, (n, _, _, c) in T.items()}
assert all(v.denominator == 1 for d_ in (rel, trans, care) for v in d_.values())

# s1q10: still in care, all groups
nearest("s1q10", sum(care.values()))

# s1q11: median of released percents minus median of transferred percents
r11 = sorted(v[1] for v in T.values())
tr11 = sorted(v[2] for v in T.values())
t.choice("s1q11", F(r11[1] + r11[2], 2) - F(tr11[1] + tr11[2], 2))

# s1q12: bird xor released
total = sum(n for n, *_ in T.values())
xor = T["birds"][0] + sum(rel.values()) - 2 * rel["birds"]
nearest("s1q12", xor / total)

# s2q1: x^(-1/2) = 4; A = x^(3/2), B = 1/64
x1 = F(1, 16)
assert 1 / math.sqrt(x1) == 4
t.qc("s2q1", [(round(float(x1) ** 1.5, 12), round(1 / 64, 12))])

# s2q2: |x-1| + |x+3| = 4; A = x^2 + 2x, B = 3
xs = [F(n, 16) for n in range(-160, 160)]
t.qc("s2q2", [(x * x + 2 * x, 3) for x in xs if abs(x - 1) + abs(x + 3) == 4])

# s2q3: Y = -2X + 30; SD(Y) vs 2 SD(X), both conventions
X = [3, 7, 8, 12, 15]
Y = [-2 * v + 30 for v in X]
t.qc("s2q3", [(round(f(Y), 9), round(2 * f(X), 9)) for f in (statistics.pstdev, statistics.stdev)])

# s2q4: AD = BD = BC, angle A = 36; angle ABC by coordinates
A4 = (0.0, 0.0)
ad = 1.0
D4 = (ad, 0.0)
B4 = (ad - ad * math.cos(math.radians(36)) * 0 + ad / 2 * 0, 0.0)
# B on the ray from A at 36 degrees with BD = AD
bx = 2 * ad * math.cos(math.radians(36))
B4 = (bx * math.cos(math.radians(36)), bx * math.sin(math.radians(36)))
assert math.isclose(math.dist(B4, D4), ad)
# C on ray AD beyond D with BC = BD
dx = B4[0] - D4[0]
C4 = (D4[0] + 2 * dx, 0.0)
assert math.isclose(math.dist(B4, C4), ad)
v1, v2 = (A4[0] - B4[0], A4[1] - B4[1]), (C4[0] - B4[0], C4[1] - B4[1])
abc = math.degrees(math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (math.hypot(*v1) * math.hypot(*v2))))
t.qc("s2q4", [(round(abc, 6), 72)])

# s2q5: random point in a 2 x 2 square within 1 of the center vs 3/4 (Monte Carlo and exact)
rng = random.Random(9)
hits5 = sum(1 for _ in range(200000) if (rng.uniform(-1, 1)) ** 2 + (rng.uniform(-1, 1)) ** 2 < 1)
assert abs(hits5 / 200000 - math.pi / 4) < 0.01
t.qc("s2q5", [(math.pi / 4, 0.75)])

# s2q6: share 40% -> 40*1.5 / (100*1.25); percent increase of the share
share0, share1 = F(40, 100), F(40, 100) * F(3, 2) / F(5, 4)
t.sel("s2q6", [i for i, c in enumerate(t.choices("s2q6")) if num(c) == 100 * (share1 - share0) / share0])

# s2q7: right triangle (0,0), (6,0), (0,8): incenter to circumcenter
A, B, C = (0, 0), (6, 0), (0, 8)
a, b, c = math.dist(B, C), math.dist(A, C), math.dist(A, B)
inc = ((a * A[0] + b * B[0] + c * C[0]) / (a + b + c), (a * A[1] + b * B[1] + c * C[1]) / (a + b + c))
circ = ((B[0] + C[0]) / 2, (B[1] + C[1]) / 2)
assert abs(math.dist(circ, A) - math.dist(circ, B)) < 1e-12
r3 = math.sqrt(3)
pick("s2q7", [math.sqrt(5), 2 * math.sqrt(2), 3, math.sqrt(13), 2 * math.sqrt(5)], math.dist(inc, circ))

# s2q8: 70 adults, 50 children, 45 vaccinated, vaccinated children = (unvaccinated adults) / 2
sols8 = [v for v in range(0, 71) if 0 <= 45 - v <= 50 and 2 * (45 - v) == 70 - v]
assert len(sols8) == 1
t.choice("s2q8", sols8[0])

# s2q9: r = 5, OP = 10; kite minus sector
r, op = 5, 10
ang = math.acos(r / op)              # angle SOP
tang = math.sqrt(op**2 - r**2)
region = r * tang - (2 * ang) / 2 * r * r
pi = math.pi
pick("s2q9", [25 * r3 - 25 * pi / 6, 25 * r3 - 25 * pi / 3, 50 * r3 - 25 * pi / 3, 25 * r3 / 2 - 25 * pi / 6, 25 * r3 - 50 * pi / 3], region)

# s2q10: square 6 + outward semicircle + outward equilateral triangle; perimeter
per10 = 2 * 6 + math.pi * 6 / 2 + 2 * 6
vals10 = [18 + 3 * math.pi, 24 + 3 * math.pi, 24 + 6 * math.pi, 30 + 3 * math.pi, 36 + 3 * math.pi]
t.sel("s2q10", [i for i, v in enumerate(vals10) if math.isclose(v, per10)])

# s2q11: distinct 4-digit strings from tiles 1,1,2,3,4,5
t.choice("s2q11", len(set(permutations("112345", 4))))

# s2q12: ladder 25, foot 7; top slides 4; extra distance
h = math.sqrt(25**2 - 7**2)
t.choice("s2q12", round(math.sqrt(25**2 - (h - 4) ** 2) - 7, 9))

# s2q13: factors of x^4 - 16: every root of the factor is a root of x^4 - 16
import cmath
def roots(coeffs):
    if len(coeffs) == 2:
        return [-coeffs[1] / coeffs[0]]
    a, b, c_ = coeffs
    d = cmath.sqrt(b * b - 4 * a * c_)
    return [(-b + d) / (2 * a), (-b - d) / (2 * a)]
facs = [[1, -2], [1, 2], [1, 0, 4], [1, 0, -4], [1, -4], [1, 0, 2]]
t.sel("s2q13", [i for i, f in enumerate(facs) if all(abs(r**4 - 16) < 1e-9 for r in roots(f))])

# s2q14: P on y = x; attainable distances to (4, 0): from the minimum upward
dists = [math.hypot(x - 4, x) for x in (k / 1000 for k in range(-20000, 20001))]
lo14 = min(dists)
assert abs(lo14 - 2 * math.sqrt(2)) < 1e-3
t.where("s2q14", lambda v: v >= lo14)

# s2q15: divisors of 720 divisible by 6, not by 9
t.value("s2q15", sum(1 for d_ in range(1, 721) if 720 % d_ == 0 and d_ % 6 == 0 and d_ % 9 != 0))

t.done()
