"""Verify every key in content/tests/quant-004.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations, permutations, product
import math
import random

from keys import Keys

t = Keys("quant-004")

grid = [F(n, 4) for n in range(-40, 41)]

# s1q1: ab > 0, a > b; A = 1/a, B = 1/b
t.qc("s1q1", [(1 / a, 1 / b) for a in grid for b in grid if a * b > 0 and a > b])

# s1q2: sqrt(3*3^9) vs (sqrt 27)^(10/3), both exact powers of 3
inner = 3 * 3**9
a2 = math.isqrt(inner)
assert a2 * a2 == inner
b2 = round(27 ** (F(5, 3)))  # (sqrt27)^(10/3) = 27^(5/3)
assert b2**3 == 27**5
t.qc("s1q2", [(a2, b2)])

# s1q3: D=(0,0), B=(-3,0), C=(3,0); A=(x,y) with AD=4, AB=5 -> solve, then AC
pts = []
for y_sign in (1, -1):
    x = F((25 - 16) - 9, 6)  # (x+3)^2 + y^2 = 25 and x^2 + y^2 = 16 -> 6x + 9 = 9
    y2 = 16 - x * x
    ac2 = (x - 3) ** 2 + y2
    pts.append((ac2, 25))  # compare squares of positive lengths
t.qc("s1q3", pts)

# s1q4: |x-y| = |x| + |y|; A = (x+y)^2, B = (x-y)^2
t.qc("s1q4", [((x + y) ** 2, (x - y) ** 2) for x in grid for y in grid if abs(x - y) == abs(x) + abs(y)])

# s1q5: X clover:grass 1:3 (12 kg), Y 3:2; kg of Y for equal clover and grass
y5 = next(y for y in (F(n, 10) for n in range(0, 2000)) if F(1, 4) * 12 + F(3, 5) * y == F(3, 4) * 12 + F(2, 5) * y)
t.choice("s1q5", y5)

# s1q6: round-trip average 48 with outbound 40
v = 1 / (F(2, 48) - F(1, 40))
assert 2 / (F(1, 40) + 1 / v) == 48
t.choice("s1q6", v)

# s1q7: panels of 4 from 6 engineers (E0=Kemal, E1=Lior) and 4 designers
people = [f"E{i}" for i in range(6)] + [f"D{i}" for i in range(4)]
panels = [p for p in combinations(people, 4) if any(x[0] == "D" for x in p) and not ("E0" in p and "E1" in p)]
t.choice("s1q7", len(panels))

# s1q8: (k-1)x < k+2 for every x in [1,3]
xs = [1 + F(i, 200) for i in range(401)]
t.where("s1q8", lambda k: all(k * x - 2 < x + k for x in xs))

# s1q9: +25%, then a cut d of the raised fee leaving 10% below the original
d9 = 1 - F(90, 100) / F(125, 100)
t.value("s1q9", d9 * 100)

zones = ["Harbor", "Market", "Campus", "Uptown", "Riverside"]
d23 = dict(zip(zones, [40, 64, 36, 28, 50]))
d24 = dict(zip(zones, [52, 54, 56, 35, 60]))

# s1q10: percent increase of the totals; pick the choice nearest the exact value
pct = 100 * F(sum(d24.values()) - sum(d23.values()), sum(d23.values()))
nums = [F(c.rstrip("%")) for c in t.choices("s1q10")]
t.sel("s1q10", min(range(len(nums)), key=lambda i: abs(nums[i] - pct)))
assert abs(pct - 18) < 1

# s1q11: sixth value x with median = mean of the six 2024 values
def median(v):
    v = sorted(v); n = len(v)
    return F(v[n // 2 - 1] + v[n // 2], 2) if n % 2 == 0 else F(v[n // 2])
sols = [x for x in (F(n, 2) for n in range(0, 400)) if median(list(d24.values()) + [x]) == F(sum(d24.values()) + x, 6)]
assert len(sols) == 1
t.choice("s1q11", sols[0])

# s1q12: Riverside long = 15%; Uptown is 60% of long trips; P(long) among Uptown+Riverside 2024
r_long = F(15, 100) * d24["Riverside"]
total_long = r_long / (1 - F(60, 100))
u_long = total_long - r_long
assert 0 <= u_long <= d24["Uptown"]
t.value("s1q12", total_long / (d24["Uptown"] + d24["Riverside"]))

# s2q1: isosceles with a 40-degree angle, either vertex or base
cases = []
for angles in ([40, 70, 70], [40, 40, 100]):
    assert sum(angles) == 180
    cases.append((max(angles), 2 * min(angles)))
t.qc("s2q1", cases)

# s2q2: add mean +/- SD to a list with SD 8; compare new SD with 8 (population and sample)
random.seed(4)
pairs = []
for _ in range(500):
    raw = [random.uniform(-1, 1) for _ in range(10)]
    m = sum(raw) / 10
    sd = math.sqrt(sum((r - m) ** 2 for r in raw) / 10)
    S = [50 + 8 * (r - m) / sd for r in raw]
    T = S + [42, 58]
    mT = sum(T) / 12
    pairs.append((round(math.sqrt(sum((x - mT) ** 2 for x in T) / 12), 9), 8))
    # sample convention: rescale S to sample SD 8 and recheck
    sds = math.sqrt(sum((r - m) ** 2 for r in raw) / 9)
    S2 = [50 + 8 * (r - m) / sds for r in raw]
    T2 = S2 + [42, 58]
    m2 = sum(T2) / 12
    pairs.append((round(math.sqrt(sum((x - m2) ** 2 for x in T2) / 11), 9), 8))
t.qc("s2q2", pairs)

# s2q3: units digit of 3^n + 7^n vs units digit of 3^n * 7^n
t.qc("s2q3", [((3**n + 7**n) % 10, (3**n * 7**n) % 10) for n in range(1, 60)])

# s2q4: digits after the decimal point of k/(2^6 5^3), k odd < 10, vs 5
def places(fr):
    d = 0
    while (fr * 10**d).denominator != 1:
        d += 1
    return d
t.qc("s2q4", [(places(F(k, 2**6 * 5**3)), 5) for k in range(1, 10, 2)])

# s2q5: n with exactly 3 divisors; A = d(n^2), B = d(2n)
def ndiv(m):
    return sum(1 for i in range(1, m + 1) if m % i == 0)
t.qc("s2q5", [(ndiv(n * n), ndiv(2 * n)) for n in range(1, 400) if ndiv(n) == 3])

# s2q6: chord of outer circle tangent to inner circle, length 16 -> R^2 - r^2 = 8^2
ring = None
for r in range(1, 20):
    R2 = r * r + 8 * 8
    area = R2 - r * r
    assert ring in (None, area)
    ring = area
t.choice("s2q6", f"{ring}\\pi")

# s2q7: three dice, product divisible by 4
rolls = list(product(range(1, 7), repeat=3))
t.choice("s2q7", F(sum(1 for r in rolls if (r[0] * r[1] * r[2]) % 4 == 0), len(rolls)))

# s2q8: incircle of 6-8-10 right triangle; distance from incenter to the smallest-angle vertex
P = {"R": (0, 0), "X": (8, 0), "Y": (0, 6)}
side = lambda p, q: math.dist(P[p], P[q])
opp = {"R": side("X", "Y"), "X": side("R", "Y"), "Y": side("R", "X")}
per = sum(opp.values())
inc = tuple(sum(opp[v] * P[v][i] for v in P) / per for i in range(2))
smallest = min(opp, key=opp.get)  # smallest angle is opposite the shortest side
dist = math.dist(inc, P[smallest])
vals8 = [2 * math.sqrt(2), 2 * math.sqrt(5), 2 * math.sqrt(10), 6, 4 * math.sqrt(3)]
t.sel("s2q8", [i for i, val in enumerate(vals8) if abs(val - dist) < 1e-9])

# s2q9: integers k for which x+2y=7, 3x+ky=5 has an integer solution (search y directly)
ks = set()
for k in range(-200, 201):
    for y in range(-100, 101):
        x = 7 - 2 * y
        if 3 * x + k * y == 5:
            ks.add(k)
            break
t.choice("s2q9", len(ks))

# s2q10: path width w with path area 152, then outer perimeter
w = next(F(n, 4) for n in range(1, 100) if (24 + 2 * F(n, 4)) * (10 + 2 * F(n, 4)) - 240 == 152)
t.choice("s2q10", 2 * (24 + 2 * w + 10 + 2 * w))

# s2q11: 120 volunteers, sets 90/85/80, everyone in at least one; maximize exactly-one
best = -1
for tr in range(0, 81):
    for dab in range(0, 86):
        for dac in range(0, 81):
            dbc = 135 - 2 * tr - dab - dac
            if dbc < 0:
                continue
            a = 90 - tr - dab - dac
            b = 85 - tr - dab - dbc
            c = 80 - tr - dac - dbc
            if min(a, b, c) < 0:
                continue
            assert a + b + c + dab + dac + dbc + tr == 120
            best = max(best, a + b + c)
t.choice("s2q11", best)

# s2q12: A=30, B=45, BC=6sqrt2; law of sines then area = (1/2) ab sin C
BC = 6 * math.sqrt(2)
AC = BC * math.sin(math.radians(45)) / math.sin(math.radians(30))
area = 0.5 * BC * AC * math.sin(math.radians(105))
vals12 = [18 * math.sqrt(3), 36, 18 + 6 * math.sqrt(3), 18 + 18 * math.sqrt(3), 36 + 18 * math.sqrt(3)]
t.sel("s2q12", [i for i, val in enumerate(vals12) if abs(val - area) < 1e-9])

# s2q13: which expressions are defined and equal to (x^2-9)/(x^2+3x) wherever it is defined
def safe(f, x):
    try:
        return f(x)
    except ZeroDivisionError:
        return None
given = lambda x: (x * x - 9) / (x * x + 3 * x)
exprs = [
    lambda x: 1 - 3 / x,
    lambda x: (x - 9) / (x + 3),
    lambda x: (3 - x) / (-x),
    lambda x: (x * x - 6 * x + 9) / (x * x - 3 * x),
    lambda x: (x * x - 3 * x) / (x * x),
    lambda x: x / (x + 3) - 3 / (x + 3),
]
dom = [x for x in (F(n, 3) for n in range(-60, 61)) if safe(given, x) is not None]
t.sel("s2q13", [i for i, e in enumerate(exprs) if all(safe(e, x) == given(x) for x in dom)])

# s2q14: x in [2,5], y in [-3,1], y != 0: which values can x/y take
ys = [y for y in (F(n, 600) for n in range(-1800, 601)) if y != 0]
t.where("s2q14", lambda v: any(2 <= v * y <= 5 for y in ys))

# s2q15: R R B B G W in a row, reds not adjacent
arr = {p for p in permutations("RRBBGW") if "RR" not in "".join(p)}
t.value("s2q15", len(arr))

t.done()
