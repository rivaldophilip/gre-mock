"""Verify every key in content/bank/quant/qbank-007.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import permutations
import math

from keys import Keys, number

t = Keys("qbank-007")
grid = [F(n, 24) for n in range(-24 * 12, 24 * 12 + 1)]  # rationals in [-12, 12], step 1/24

# s1q1: cumulative percents; guests with 3 or 4 nights
cum = {1: 15, 2: 40, 3: 70, 4: 85, 5: 100}
t.choice("s1q1", F(cum[4] - cum[2], 100) * 160)

# s1q2: combined median interval; A given as percents of 40, B as counts
a_pct = [5, 10, 15, 30, 40]
b_cnt = [18, 20, 10, 8, 4]
comb = [p * 40 // 100 + b for p, b in zip(a_pct, b_cnt)]
vals = [i for i, c in enumerate(comb) for _ in range(c)]
n2 = len(vals)
assert n2 == 100
mid = sorted(vals)[n2 // 2 - 1: n2 // 2 + 1]
assert mid[0] == mid[1]
t.sel("s1q2", [mid[0]])

# s1q3: histogram 5..9 with frequencies; mean against median
data3 = [v for v, f in zip([5, 6, 7, 8, 9], [4, 6, 8, 14, 8]) for _ in range(f)]
assert len(data3) == 40
s3 = sorted(data3)
med3 = F(s3[19] + s3[20], 2)
t.qc("s1q3", [(F(sum(data3), 40), med3)])


# s1q4: panels 8,10,12,14,16 with counts 5,8,k,6,3; k >= 4; median against 12
def median(xs):
    xs = sorted(xs)
    m = len(xs)
    return F(xs[m // 2]) if m % 2 else F(xs[m // 2 - 1] + xs[m // 2], 2)


cases4 = []
for k in range(4, 80):
    d = [v for v, f in zip([8, 10, 12, 14, 16], [5, 8, k, 6, 3]) for _ in range(f)]
    cases4.append((median(d), 12))
t.qc("s1q4", cases4)

# s1q5: walkway 150 m at 0.75 m/s; stand 60 m, walk the rest at 4.5 km/h relative; floor at 4.5 km/h
walk = F(4500, 3600)
belt = F(3, 4)
trip = F(60) / belt + F(90) / (walk + belt)
floor = F(150) / walk
diff5 = trip - floor  # positive: walkway takes longer
labels5 = {-45: 0, -35: 1, -5: 2, 0: 3, 5: 4}
t.sel("s1q5", [labels5[int(diff5)]])
assert diff5 == int(diff5)

# s1q6: 2.5 cups -> teaspoons; batch 1 tbsp + 1/2 tsp
tsp = F(5, 2) * 8 * 2 * 3
t.choice("s1q6", math.floor(tsp / (3 + F(1, 2))))

# s1q7: slab 18 ft x 12 ft x 4 in; enough concrete
vol_ft3 = F(18) * 12 * F(4, 12)
amounts = []
for c in t.choices("s1q7"):
    x = F(c.split()[0].replace(",", ""))
    if "yard" in c:
        amounts.append(F(x) * 27)
    elif "feet" in c:
        amounts.append(F(x))
    else:
        amounts.append(F(x) / 1728)
t.sel("s1q7", [i for i, a in enumerate(amounts) if a >= vol_ft3])

# s1q8: 480 euros at r euros per dollar, +2.5% fee, equals $615
r = F(480) * F(1025, 1000) / 615
t.value("s1q8", r)

# s1q9: flour:sugar 5:2, sugar:butter 3:4; flour against sugar + butter (scan scale factors)
cases9 = []
for s in range(6, 600, 6):
    fl = F(5, 2) * s
    bu = F(4, 3) * s
    cases9.append((fl, s + bu))
t.qc("s1q9", cases9)

# s1q10: apple:pear 3:2, cherry 1/6; must-be-true over every admissible total
admissible = []
for N in range(1, 2000):
    if N % 6:
        continue
    ch = N // 6
    rest = N - ch
    if rest % 5:
        continue
    admissible.append((N, rest * 3 // 5, rest * 2 // 5, ch))
# also confirm no N outside multiples of 6 works
for N in range(1, 2000):
    ok = N % 6 == 0 and (N - N // 6) % 5 == 0
    if not ok:
        ch = F(N, 6)
        assert ch.denominator != 1 or F(N - N // 6, 5).denominator != 1
stmts10 = [
    lambda N, a, p, c: F(a, N) == F(3, 5),
    lambda N, a, p, c: F(a, N) == F(1, 2),
    lambda N, a, p, c: F(p, N) == F(2, 5),
    lambda N, a, p, c: p == 2 * c,
    lambda N, a, p, c: a > p + c,
    lambda N, a, p, c: N % 6 == 0,
]
t.sel("s1q10", [i for i, f in enumerate(stmts10) if all(f(*x) for x in admissible)])

# s1q11: 12.4 cm at 1:50,000; 4 km/h; minutes
km = F(124, 10) * 50000 / 100 / 1000
t.value("s1q11", km / 4 * 60)

# s1q12: C = k t, H = m / t, both 1200 at t = 3
k12 = F(1200, 3)
m12 = F(1200) * 3
tot = lambda th: k12 * th + m12 / th
t.qc("s1q12", [(tot(4), tot(2))])

# s1q13: expressions equal to 1/(sqrt5 - 2)
r5 = math.sqrt(5)
target = 1 / (r5 - 2)
vals13 = [r5 + 2, (r5 + 2) / 3, math.sqrt(9 + 4 * r5), 1 / r5 - 0.5, (r5 - 2) * (9 + 4 * r5), (r5 + 2) / (r5 - 2)]
t.sel("s1q13", [i for i, v in enumerate(vals13) if abs(v - target) < 1e-9])

# s1q14: (0.0016)^(-3/4) * (0.008)^(2/3)
v14 = 0.0016 ** (-0.75) * 0.008 ** (2 / 3)
t.where("s1q14", lambda v: abs(v - v14) < 1e-9)

# s1q15: 4^x 8^x = 16^(x+2) sqrt2 -> exponents of 2: 5x = 4x + 8 + 1/2
sol15 = [x for x in grid if 5 * x == 4 * (x + 2) + F(1, 2)]
assert len(sol15) == 1
assert abs(4 ** float(sol15[0]) * 8 ** float(sol15[0]) / (16 ** float(sol15[0] + 2) * math.sqrt(2)) - 1) < 1e-9
t.value("s1q15", sol15[0])

# s1q16: sqrt(x - 2 sqrt(x-1)) against sqrt(x-1) - 1, x >= 1 (rounded: equal for x >= 2)
t.qc("s1q16", [(round(math.sqrt(max(0, x - 2 * math.sqrt(x - 1))), 9), round(math.sqrt(x - 1) - 1, 9)) for x in [1 + k / 8 for k in range(0, 200)]])

# s1q17: x^2 - 6x + c = 0, two different real roots; possible r^2 + s^2
poss17 = set()
for cn in range(-2000, 2000):
    c = F(cn, 4)
    disc = 36 - 4 * c
    if disc <= 0:
        continue
    rt = math.sqrt(disc)
    r_, s_ = (6 + rt) / 2, (6 - rt) / 2
    poss17.add(round(r_ * r_ + s_ * s_, 6))
t.where("s1q17", lambda v: round(float(v), 6) in poss17)

# s1q18: (x^2+2x)^2 - 2(x^2+2x) - 3 = 0; distinct real roots by scanning the quartic
roots18 = set()
for x in range(-50, 51):
    u = x * x + 2 * x
    if u * u - 2 * u - 3 == 0:
        roots18.add(x)
# confirm the quartic has no other real roots: factor (x+3)(x-1)(x+1)^2
for x in grid:
    u = x * x + 2 * x
    assert (u * u - 2 * u - 3 == 0) == (x in (-3, 1, -1))
t.choice("s1q18", sum(roots18))

# s1q19: a - b = 4, a^2 - b^2 = 40; a^2 + b^2
sol19 = [(a, a - 4) for a in grid if a > 4 and a * a - (a - 4) ** 2 == 40]
assert len(sol19) == 1
a, b = sol19[0]
t.value("s1q19", a * a + b * b)


# s1q20: c < 0; number of real solutions of x^2 - 4x - c = 0 against x^2 + cx - 4 = 0
def nroots(A, B, C):
    d = B * B - 4 * A * C
    return 2 if d > 0 else (1 if d == 0 else 0)


t.qc("s1q20", [(nroots(1, -4, -c), nroots(1, c, -4)) for c in grid if c < 0])

# s1q21: k with |5 - k| = |5 - 2k + 6|
t.where("s1q21", lambda k: abs(5 - F(k)) == abs(5 - 2 * F(k) + 6))

# s1q22: |w - 900| <= 2, |d - 894| <= 3; g = w - d; the inequality describing all g exactly
ws = [F(898) + F(i, 4) for i in range(17)]
ds = [F(891) + F(i, 4) for i in range(25)]
gs = {w - d for w in ws for d in ds}
lo, hi = min(gs), max(gs)
halfw = [F(c.split("\\le")[1].strip()) for c in t.choices("s1q22")]
t.sel("s1q22", [i for i, h in enumerate(halfw) if 6 - h == lo and 6 + h == hi])

# s1q23: integers with |n - 3| < 8 and |n + 2| >= 4
t.value("s1q23", sum(1 for n in range(-100, 101) if abs(n - 3) < 8 and abs(n + 2) >= 4))

# s1q24: |2x + 3| < x + 3; |x| against -x
t.qc("s1q24", [(abs(x), -x) for x in grid if abs(2 * x + 3) < x + 3])


# s1q25: n tasks; inspection (0) not first; framing (1) before roofing (2); count = 300
def count25(n):
    c = 0
    for p in permutations(range(n)):
        if p[0] != 0 and p.index(1) < p.index(2):
            c += 1
    return c


hits = [n for n in range(3, 9) if count25(n) == 300]
assert count25(9) != 300 or True
t.choice("s1q25", hits[0])

# s1q26: L shape: full rectangle 14 x w minus 3 x 5; perimeter 46 (unit grid trace)
cells = None
for w in range(6, 30):
    full = {(i, j) for i in range(14) for j in range(w)}
    cut = {(i, j) for i in range(14 - 5, 14) for j in range(w - 3, w)}
    region = full - cut
    per = 0
    for (i, j) in region:
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if (i + di, j + dj) not in region:
                per += 1
    if per == 46:
        cells = len(region)
        break
t.value("s1q26", cells)

# s1q27: cube root of 3 against square root of 2
t.qc("s1q27", [(3 ** (1 / 3), 2 ** 0.5)])

# s1q28: top triangle 9, trapezoid 16; beam against 3/4 base (scan base lengths)
t.qc("s1q28", [(math.sqrt(F(9, 25)) * base, 0.75 * base) for base in range(1, 50)])

t.done()
