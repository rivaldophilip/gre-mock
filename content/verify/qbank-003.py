"""Verify every key in content/bank/quant/qbank-003.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations, combinations_with_replacement, product
from math import gcd, isqrt

from keys import Keys

t = Keys("qbank-003")


def lin(verts, x):
    """Piecewise-linear function through verts, exact."""
    x = F(x)
    for (x0, y0), (x1, y1) in zip(verts, verts[1:]):
        if x0 <= x <= x1:
            return F(y0) + F(y1 - y0, x1 - x0) * (x - x0)
    raise ValueError(x)


# s1q1: tickets 1..25; largest set with no two summing to 26, plus one
best = 0
nums = range(1, 26)
# the "sum to 26" graph is a matching plus isolated vertices: take one from each edge, all isolated
edges = {frozenset((a, 26 - a)) for a in nums if a != 26 - a and 1 <= 26 - a <= 25}
isolated = [a for a in nums if not any(a in e for e in edges)]
best = len(edges) + len(isolated)
# confirm by greedy check that such a set really has no pair
S = [min(e) for e in edges] + isolated
assert all(a + b != 26 for a in S for b in S if a < b)
t.choice("s1q1", best + 1)

# s1q2: 7 whole scores 0..10, drop one max and one min, kept mean 8.4; greatest mean of all 7
mx = None
for c in combinations_with_replacement(range(11), 7):
    if sum(c[1:-1]) == 42:
        m = F(sum(c), 7)
        mx = m if mx is None or m > mx else mx
t.qc("s1q2", [(mx, F(86, 10))])

# s1q3: r in [-4,3], b in [-2,5] integers; max r^2 + r b
t.choice("s1q3", max(r * r + r * b for r in range(-4, 4) for b in range(-2, 6)))

# s1q4: four distinct whole-minute songs totaling 50, longest < two shortest combined; greatest longest vs 17
longest = max(d for a, b, c, d in combinations(range(1, 50), 4) if a + b + c + d == 50 and d < a + b)
t.qc("s1q4", [(longest, 17)])


# s1q5: two bookings totaling 180 minutes (quarter-minute grid); charge rule
def charge(m):
    if m <= 60:
        return 10
    return 14 * -(-m // 60)


totals = {charge(F(k, 4)) + charge(180 - F(k, 4)) for k in range(1, 180 * 4)}
t.where("s1q5", lambda v: v in totals)

# s1q6: markup 40%, $21 = 25% off regular
reg = F(21) / F(1, 4)
cost = reg / F(14, 10)
t.choice("s1q6", (reg - 21) - cost)

# s1q7: two prints at 600; profit 20% of price; loss 20% of cost
c1 = 600 - F(2, 10) * 600
c2 = F(600) / F(8, 10)
t.value("s1q7", (c1 + c2) - 1200)

# s1q8: 75 inches; yards at 1.80, feet at 0.65
yd = -(-75 // 36)
ft = -(-75 // 12)
t.qc("s1q8", [(yd * F(180, 100), ft * F(65, 100))])


# s1q9: 12x a perfect square and 18x a perfect cube
def is_sq(n):
    return isqrt(n) ** 2 == n


def is_cube(n):
    r = round(n ** (1 / 3))
    return any((r + d) ** 3 == n for d in (-1, 0, 1))


t.where("s1q9", lambda v: v == int(v) and is_sq(12 * int(v)) and is_cube(18 * int(v)))

# s1q10: trailing zeros of 26*27*...*75
p = 1
for k in range(26, 76):
    p *= k
s = str(p)
t.choice("s1q10", len(s) - len(s.rstrip("0")))

# s1q11: 3600 chairs, at least 2 equal blocks, each an s-by-s square with s >= 2
t.value("s1q11", sum(1 for s_ in range(2, 61) if 3600 % (s_ * s_) == 0 and 3600 // (s_ * s_) >= 2))


# s1q12: numbers 1..49 with exactly four divisors, vs 14
def d(n):
    return sum(1 for k in range(1, n + 1) if n % k == 0)


t.qc("s1q12", [(sum(1 for n in range(1, 50) if d(n) == 4), 14)])

# s1q13: f(f(x)) < 0 on the fig1 graph
F1 = [(-4, 0), (-2, 4), (0, 2), (2, -2), (4, 0)]
t.where("s1q13", lambda v: lin(F1, lin(F1, v)) < 0)

# s1q14: circle x^2 + y^2 = 25 and y = x^2 - 5: real roots of x^2 + (x^2 - 5)^2 - 25 = x^4 - 9x^2
# polynomial coefficients by expansion, then distinct real roots (multiplicity merged)
coef = [1, 0, -10 + 1, 0, 25 - 25]  # x^4 + (1 - 10) x^2 + 0
import numpy as np  # noqa: E402

roots = np.roots(coef)
real = sorted({round(float(r.real), 6) for r in roots if abs(r.imag) < 1e-7})
for x in real:  # each real x gives the point (x, x^2 - 5); check it lies on the circle
    assert abs(x * x + (x * x - 5) ** 2 - 25) < 1e-6
t.choice("s1q14", len(real))

# s1q15: odd function, f(x) = x^2 + kx for x > 0, f(-2) = 8; f(3)
k15 = next(F(k, 2) for k in range(-40, 41) if -(4 + 2 * F(k, 2)) == 8)
t.value("s1q15", 9 + 3 * k15)

# s1q16: g on fig2, k < 0 with g(k) = 2; compare g(k + 1) with 2
F2 = [(-4, 1), (-2, 3), (0, -1), (2, 1), (4, 3)]
ks = [F(n, 100) for n in range(-400, 0) if lin(F2, F(n, 100)) == 2]
assert len(ks) == 2
t.qc("s1q16", [(lin(F2, k + 1), 2) for k in ks])


# s1q17: prizes 0,1,2,5 with probs .4, p, q, .1; p, q > 0
def ev(p):
    q = 1 - F(4, 10) - F(1, 10) - p
    return 0 * F(4, 10) + 1 * p + 2 * q + 5 * F(1, 10)


ps = [F(n, 1000) for n in range(1, 500)]  # 0 < p < 0.5 (q > 0)
evs = {ev(p) for p in ps}
t.where("s1q17", lambda v: F(v).limit_denominator(1000) in evs)

# s1q18: act sizes 1..4 with 20, 30, 30, 20 acts; performer picked at random
acts = {1: 20, 2: 30, 3: 30, 4: 20}
people = []
for size, n in acts.items():
    people += [size] * (size * n)
mean18 = F(sum(people), len(people))
srt = sorted(people)
med18 = F(srt[len(srt) // 2 - 1] + srt[len(srt) // 2], 2)
want = f"Mean ${float(mean18):g}$, median ${float(med18):g}$"
t.sel("s1q18", [t.choices("s1q18").index(want.replace("$", ""))])

# s1q19: density h on [0,20), 2h on [20,50]; P(10 <= X <= 30)
h = 1 / (20 * F(1) + 30 * F(2))
dens = lambda x: h if x < 20 else 2 * h
n = 1000
t.value("s1q19", sum(dens(10 + (k + F(1, 2)) * F(20, n)) * F(20, n) for k in range(n)))

# s1q20: T uniform on [2, 8]; P(T <= 6 | T > 4) vs P(T <= 5)
P = lambda a, b: (min(b, 8) - max(a, 2)) / F(6)
t.qc("s1q20", [(P(4, 6) / P(4, 8), P(2, 5))])

# s1q21: reading fell 20% to a value in [160, 176]
t.where("s1q21", lambda v: 160 <= F(v) * F(8, 10) <= 176)

# s1q22: team +20%; top scorer was 40% of the old total and fell 10%; rest's percent increase
T0 = F(100)
star0 = F(40, 100) * T0
rest0, rest1 = T0 - star0, F(12, 10) * T0 - F(9, 10) * star0
t.choice("s1q22", (rest1 - rest0) / rest0 * 100)

# s1q23: 75% of N serves landed, then 80% of 0.9N; percent decrease of landed serves
N = F(100)
t.value("s1q23", (F(75, 100) * N - F(80, 100) * F(9, 10) * N) / (F(75, 100) * N) * 100)

# s1q24: live:dead ratio up 50%; percent rise of the live share, vs 50, across many starting ratios
cases = []
for live, dead in product(range(1, 40), range(1, 40)):
    r0 = F(live, dead)
    s0, s1 = r0 / (1 + r0), F(3, 2) * r0 / (1 + F(3, 2) * r0)
    cases.append(((s1 - s0) / s0 * 100, 50))
t.qc("s1q24", cases)

# s1q25: scores 41, 45, 52, 60, 66, n and 50; median = mean
sols = []
for n_ in range(0, 181):
    v = sorted([41, 45, 52, 60, 66, n_, 50])
    if F(sum(v), 7) == v[3]:
        sols.append(n_)
assert len(sols) == 1
t.choice("s1q25", sols[0])

# s1q26: rectangle in a semicircle of radius 5, base on the diameter, perimeter 20; area
# half-width a, height h = 10 - 2a > 0, corner (a, h) on the arc: scan a finely for sign changes / zeros of a^2 + h^2 - 25
R, P = 5, 20
g = lambda a: a * a + (F(P, 2) - 2 * a) ** 2 - R * R
cands = []
grid26 = [F(k, 1000) for k in range(1, 5000)]  # 0 < a < 5 (h > 0 needs a < 5)
for a0, a1 in zip(grid26, grid26[1:]):
    if g(a0) == 0:
        cands.append(a0)
    elif g(a0) * g(a1) < 0:
        cands.append(None)  # an irrational root would show up here
assert cands == [3], cands
a26 = cands[0]
t.value("s1q26", 2 * a26 * (F(P, 2) - 2 * a26))

# s1q27: P(two-dice sum > 7) vs P(more heads than tails in 4 tosses)
pa = F(sum(1 for a, b in product(range(1, 7), repeat=2) if a + b > 7), 36)
pb = F(sum(1 for c in product((0, 1), repeat=4) if sum(c) > 2), 16)
t.qc("s1q27", [(pa, pb)])

# s1q28: k^2 a multiple of 50 and k a multiple of 4; greatest integer that must divide k
valid = [k for k in range(1, 5001) if (k * k) % 50 == 0 and k % 4 == 0]
g = 0
for k in valid:
    g = gcd(g, k)
t.qc("s1q28", [(g, 20)])

t.done()
