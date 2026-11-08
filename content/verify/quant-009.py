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


# s1q1: 0.(12)/0.(3) vs 0.12/0.3
t.qc("s1q1", [(F(12, 99) / F(3, 9), F(12, 100) / F(3, 10))])

# s1q2: a^3 < a; A = a^2, B = -a
grid = [F(n, 16) for n in range(-200, 200)]
t.qc("s1q2", [(a * a, -a) for a in grid if a**3 < a])

# s1q3: A on circle with diameter BC (D the centre, radius 1); A = AB + AC, B = sqrt2 * BC
pairs = []
for deg in range(1, 180):
    th = math.radians(deg)
    ax, ay = math.cos(th), math.sin(th)
    ab, ac = math.hypot(ax + 1, ay), math.hypot(ax - 1, ay)
    pairs.append((round(ab + ac, 9), round(math.sqrt(2) * 2, 9)))
t.qc("s1q3", pairs)

# s1q4: (2^100 + 3^100) mod 7 vs 5^100 mod 7
t.qc("s1q4", [((2**100 + 3**100) % 7, 5**100 % 7)])

# s1q5: s+m+l = 120, 2s+3m+4l = 340 over nonnegative integers; s - l must be fixed
diffs = {s_ - l for s_ in range(121) for l in range(121 - s_) if 2*s_ + 3*(120 - s_ - l) + 4*l == 340}
assert len(diffs) == 1
t.choice("s1q5", diffs.pop())

# s1q6: d/60 + d/40 = 4.5; average speed over 5 h
d = F(9, 2) / (F(1, 60) + F(1, 40))
t.choice("s1q6", 2 * d / 5)

# s1q7: 7 speakers, K not first/last, A before B, A and B not adjacent
count = 0
for p in permutations("KAB1234"):
    k, a, b = p.index("K"), p.index("A"), p.index("B")
    if k not in (0, 6) and a < b and b - a >= 2:
        count += 1
t.sel("s1q7", [i for i, c in enumerate(t.choices("s1q7")) if num(c) == count])

# s1q8: -2 < (6-3x)/2 <= 9 and x^2 > 4
t.where("s1q8", lambda x: -2 < (6 - 3 * x) / 2 <= 9 and x * x > 4)

# s1q9: 7k / (4k + 15) = 7/5, total after
k = next(k for k in range(1, 200) if F(7 * k, 4 * k + 15) == F(7, 5))
t.value("s1q9", 7 * k + 4 * k + 15)

# DI table
T = {"birds": (840, 45, 20, 35), "mammals": (520, 40, 35, 25), "reptiles": (180, 25, 45, 30), "amphibians": (60, 90, 5, 5)}
for n, r, tr, c in T.values():
    assert r + tr + c == 100
rel = {g: F(n * r, 100) for g, (n, r, _, _) in T.items()}
trans = {g: F(n * tr, 100) for g, (n, _, tr, _) in T.items()}
care = {g: F(n * c, 100) for g, (n, _, _, c) in T.items()}
assert all(v.denominator == 1 for d_ in (rel, trans, care) for v in d_.values())

# s1q10: mammals transferred vs reptiles transferred, percent greater
nearest("s1q10", 100 * (trans["mammals"] - trans["reptiles"]) / trans["reptiles"])

# s1q11: mammal release percent so the overall rate is 50%
total = sum(n for n, *_ in T.values())
need = (F(total, 2) - sum(v for g, v in rel.items() if g != "mammals")) / T["mammals"][0]
nearest("s1q11", 100 * need)

# s1q12: January releases: half of birds in care, one-fifth of mammals in care
jan = {"birds": care["birds"] / 2, "mammals": care["mammals"] / 5}
assert all(v.denominator == 1 for v in jan.values())
released = sum(rel.values()) + sum(jan.values())
nearest("s1q12", (rel["mammals"] + jan["mammals"]) / released)

# s2q1: compare squares (both positive)
t.qc("s2q1", [(3 * 9**5, F(3**12, 3))])

# s2q2: |x-1| + |x+3| = 4; A = x^2 + 2x, B = 3
xs = [F(n, 16) for n in range(-160, 160)]
t.qc("s2q2", [(x * x + 2 * x, 3) for x in xs if abs(x - 1) + abs(x + 3) == 4])

# s2q3: SD of L (20 numbers, mean 50, SD 8) vs L plus 42 and 58; both conventions, several lists
random.seed(9)
pairs = []
lists = [[42] * 10 + [58] * 10]
for _ in range(200):
    raw = [random.gauss(0, 1) for _ in range(20)]
    m, s = statistics.mean(raw), statistics.pstdev(raw)
    lists.append([50 + 8 * (v - m) / s for v in raw])
for Lst in lists:
    assert abs(statistics.mean(Lst) - 50) < 1e-9 and abs(statistics.pstdev(Lst) - 8) < 1e-9
    M = Lst + [42, 58]
    pairs.append((round(statistics.pstdev(M), 9), round(statistics.pstdev(Lst), 9)))
    # with the n-1 divisor, rescale L to sample SD 8 and compare too
    Ls = [50 + (v - 50) * 8 / statistics.stdev(Lst) for v in Lst]
    pairs.append((round(statistics.stdev(Ls + [42, 58]), 9), round(statistics.stdev(Ls), 9)))
t.qc("s2q3", pairs)

# s2q4: integer x with sides 6, 8, x forming an obtuse triangle
def obtuse(x):
    s = sorted([6, 8, x])
    return s[0] + s[1] > s[2] and s[2] ** 2 > s[0] ** 2 + s[1] ** 2
t.qc("s2q4", [(sum(1 for x in range(1, 30) if obtuse(x)), 6)])

# s2q5: P(at least 1 late in 3) vs P(at least 2 late in 6), p = 1/2
def at_least(k, n):
    return sum(F(math.comb(n, j), 2**n) for j in range(k, n + 1))
t.qc("s2q5", [(at_least(1, 3), at_least(2, 6))])

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

# s2q8: 200 people, |F|=170, |Sa|=160, |Su|=150, everyone in at least one, 20 in exactly one: number in exactly two
twos = set()
for t3 in range(0, 151):
    for fs in range(0, 171 - t3):
        for fu in range(0, 171 - t3 - fs):
            ss = 280 - 2 * t3 - fs - fu  # forced by the head count of 200
            regions = [170 - t3 - fs - fu, 160 - t3 - fs - ss, 150 - t3 - fu - ss, fs, fu, ss, t3]
            if min(regions) >= 0 and sum(regions[:3]) == 20:
                assert sum(regions) == 200
                twos.add(fs + fu + ss)
assert len(twos) == 1
t.choice("s2q8", twos.pop())

# s2q9: r = 5, OP = 10; kite minus sector
r, op = 5, 10
ang = math.acos(r / op)              # angle SOP
tang = math.sqrt(op**2 - r**2)
region = r * tang - (2 * ang) / 2 * r * r
pi = math.pi
pick("s2q9", [25 * r3 - 25 * pi / 6, 25 * r3 - 25 * pi / 3, 50 * r3 - 25 * pi / 3, 25 * r3 / 2 - 25 * pi / 6, 25 * r3 - 50 * pi / 3], region)

# s2q10: (1.5w+4)(w+4) - 1.5w^2 = 136
w = next(w for w in (F(n, 2) for n in range(1, 200)) if (F(3, 2) * w + 4) * (w + 4) - F(3, 2) * w * w == 136)
t.choice("s2q10", 2 * (w + F(3, 2) * w))

# s2q11: distinct 4-digit strings from tiles 1,1,2,3,4,5
t.choice("s2q11", len(set(permutations("112345", 4))))

# s2q12: angle B 45, C 30, AC 8; law of sines then area
Bang, Cang = math.radians(45), math.radians(30)
Aang = math.pi - Bang - Cang
ACl = 8
ABl = ACl * math.sin(Cang) / math.sin(Bang)
area = 0.5 * ABl * ACl * math.sin(Aang)
pick("s2q12", [8 + 4 * r3, 8 + 8 * r3, 16 * r3, 16 + 16 * r3, 32], area)

# s2q13: a, b = 3 +- sqrt5 (both orders); integer-valued expressions
ints = None
for a_, b_ in ((3 + math.sqrt(5), 3 - math.sqrt(5)), (3 - math.sqrt(5), 3 + math.sqrt(5))):
    assert abs(a_ + b_ - 6) < 1e-12 and abs(a_ * b_ - 4) < 1e-9
    vals = [a_**2 + b_**2, a_**2 - b_**2, a_**3 + b_**3, 1 / a_ + 1 / b_, math.sqrt(a_) + math.sqrt(b_), (a_ - b_) ** 2]
    got = {i for i, v in enumerate(vals) if abs(v - round(v)) < 1e-9}
    assert ints is None or got == ints
    ints = got
t.sel("s2q13", sorted(ints))

# s2q14: range of xy on 1<=x<=4, 2<=y<=6, x+y<=7 (grid step 1/20; region connected so the range is an interval)
prods = [x * y for x in (F(n, 20) for n in range(20, 81)) for y in (F(n, 20) for n in range(40, 121)) if x + y <= 7]
lo, hi = min(prods), max(prods)
t.where("s2q14", lambda v: lo <= v <= hi)

# s2q15: divisors of 720 divisible by 6, not by 9
t.value("s2q15", sum(1 for d_ in range(1, 721) if 720 % d_ == 0 and d_ % 6 == 0 and d_ % 9 != 0))

t.done()
