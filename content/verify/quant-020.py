"""Verify every key in content/tests/quant-020.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations, permutations
from math import comb, erf, sqrt, isqrt

from keys import Keys

t = Keys("quant-020")

# s1q1: a + b = 4, |a| + |b| = 10, nonzero integers; A = ab, B = -21
cases = [(a * b, -21) for a in range(-40, 41) for b in range(-40, 41) if a and b and a + b == 4 and abs(a) + abs(b) == 10]
assert cases
t.qc("s1q1", cases)

# s1q2: -1 < x < 0; A = 1/x + 1/x^2, B = 0
t.qc("s1q2", [(1 / x + 1 / x**2, 0) for x in (F(-n, 997) for n in range(1, 997))])

# s1q3: symmetric 16% tails at 49.4 and 50.6; A = percent above 51.2 (empirical rule and exact normal), B = 2
mu = (F(494, 10) + F(506, 10)) / 2
sd_rule = F(506, 10) - mu                      # 16% tail = 1 SD under the empirical rule
z = (F(512, 10) - mu) / sd_rule
assert z == 2
tail_rule = F(100 - 95, 2)                     # 2.5 percent
Phi = lambda v: 0.5 * (1 + erf(v / sqrt(2)))
lo, hi = 0.0, 3.0                              # exact z for an upper tail of 16%
for _ in range(100):
    mid = (lo + hi) / 2
    lo, hi = (mid, hi) if 1 - Phi(mid) > 0.16 else (lo, mid)
sd_exact = 0.6 / lo
tail_exact = 100 * (1 - Phi(1.2 / sd_exact))
t.qc("s1q3", [(tail_rule, 2), (tail_exact, 2)])

# s1q4: 0.6^x > (5/3)^(x-4); A = x, B = 2
xs = [k / 100 for k in range(-1000, 1000) if abs(k / 100 - 2) > 1e-9 and 0.6 ** (k / 100) > (5 / 3) ** (k / 100 - 4)]
assert xs
t.qc("s1q4", [(x, 2) for x in xs])

# s1q5: legs f, 2f - 6, (2f - 6) + 2; f = 25% of total; longest leg
f = next(F(n, 4) for n in range(1, 4000) if F(n, 4) == F(1, 4) * (F(n, 4) + (2 * F(n, 4) - 6) + (2 * F(n, 4) - 6 + 2)))
legs = [f, 2 * f - 6, 2 * f - 4]
assert all(leg > 0 for leg in legs)
t.choice("s1q5", max(legs))

# s1q6: shortest A -> x-axis -> B path; reflect B across the x-axis
A, B = (F(-2), F(3)), (F(8), F(5))
Bp = (B[0], -B[1])
xP = A[0] + (Bp[0] - A[0]) * (A[1] - 0) / (A[1] - Bp[1])
dist = lambda x: sqrt((x - float(A[0])) ** 2 + float(A[1]) ** 2) + sqrt((x - float(B[0])) ** 2 + float(B[1]) ** 2)
best = min((k / 10000 for k in range(-20000, 80001)), key=dist)
assert abs(best - float(xP)) < 1e-3
t.choice("s1q6", xP)

# s1q7: lattice routes (0,0) -> (6,4), east/north steps, avoiding (2,2) and (4,3)
blocked = {(2, 2), (4, 3)}
ways = {}
for x in range(7):
    for y in range(5):
        if (x, y) in blocked:
            ways[(x, y)] = 0
        elif x == 0 and y == 0:
            ways[(x, y)] = 1
        else:
            ways[(x, y)] = ways.get((x - 1, y), 0) + ways.get((x, y - 1), 0)
assert comb(10, 4) == 210
t.choice("s1q7", ways[(6, 4)])

# s1q8: 1/n terminates; which expressions must terminate
def term(q):
    d = F(q).denominator
    for p in (2, 5):
        while d % p == 0:
            d //= p
    return d == 1
ns = [n for n in range(1, 20001) if term(F(1, n))]
exprs = [lambda n: F(1, 2 * n), lambda n: F(1, n + 1), lambda n: F(9, 6 * n), lambda n: F(n + 1, n), lambda n: F(1, 3 * n), lambda n: F(n, 12)]
assert len(exprs) == len(t.choices("s1q8"))
t.sel("s1q8", [i for i, e in enumerate(exprs) if all(term(e(n)) for n in ns)])

# s1q9: rows 18, 21, ..., 75
rows = list(range(18, 76, 3))
assert rows[-1] == 75
t.value("s1q9", sum(rows))

# DI table: rows Open, Masters, Veterans; intervals 30-39, 40-49, 50-59, 60-69
tab = {"Open": [36, 84, 60, 20], "Masters": [14, 46, 70, 30], "Veterans": [2, 18, 40, 20]}
tot_row = {k: sum(v) for k, v in tab.items()}
tot_col = [sum(v[i] for v in tab.values()) for i in range(4)]
assert tot_row == {"Open": 200, "Masters": 160, "Veterans": 80} and tot_col == [52, 148, 170, 70] and sum(tot_col) == 440

# s1q10: Masters under 50 as a percent of all under 50
t.choice("s1q10", 100 * F(sum(tab["Masters"][:2]), sum(tot_col[:2])))

# s1q11: greatest possible mean of Veterans with whole-minute times (tops 39, 49, 59, 69)
tops = [39, 49, 59, 69]
t.choice("s1q11", F(sum(c * v for c, v in zip(tab["Veterans"], tops)), tot_row["Veterans"]))

# s1q12: 15% of Masters first-timers; they are 30% of first-timers in Open + Masters; P(first-timer | Open)
ft_m = F(15, 100) * tot_row["Masters"]
ft_all = ft_m / F(30, 100)
ft_o = ft_all - ft_m
assert ft_m.denominator == 1 and ft_all.denominator == 1 and 0 <= ft_o <= tot_row["Open"]
t.choice("s1q12", ft_o / tot_row["Open"])

# s2q1: f on 0..6; p != q with f(p) = f(q) = 4; A = p + q, B = 7
fx = {0: 5, 1: 4, 2: 2, 3: 4, 4: 7, 5: 1, 6: 4}
t.qc("s2q1", [(p + q, 7) for p, q in combinations(fx, 2) if fx[p] == fx[q] == 4])

# s2q2: at least 7 parts checked <=> first 6 are good; A = 0.9^6, B = 1/2
p_at_least_7 = 1 - sum(F(9, 10) ** (k - 1) * F(1, 10) for k in range(1, 7))   # 1 - P(first defective among parts 1..6)
assert p_at_least_7 == F(9, 10) ** 6
t.qc("s2q2", [(p_at_least_7, F(1, 2))])

# s2q3: triangle ABC, AB = 10, AC = 8, AE = 4 on AC, D on AB with angle AED = angle ABC
import math
pairs = []
for deg in (20, 45, 60, 80, 100, 130):
    th = math.radians(deg)
    Av, Bv, Cv = (0.0, 0.0), (10.0, 0.0), (8 * math.cos(th), 8 * math.sin(th))
    Ev = (4 * math.cos(th), 4 * math.sin(th))
    def ang(P, Q, R):  # angle at Q
        v1 = (P[0] - Q[0], P[1] - Q[1]); v2 = (R[0] - Q[0], R[1] - Q[1])
        return math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (math.hypot(*v1) * math.hypot(*v2)))
    target = ang(Av, Bv, Cv)
    # find D = (d, 0) with 0 < d < 10 and angle AED = angle ABC (scan, then refine)
    ds = [k / 1000 for k in range(1, 10000)]
    d = min(ds, key=lambda d: abs(ang(Av, Ev, (d, 0.0)) - target))
    assert abs(d - 3.2) < 2e-3
    area = lambda P, Q, R: abs((Q[0] - P[0]) * (R[1] - P[1]) - (R[0] - P[0]) * (Q[1] - P[1])) / 2
    pairs.append((area(Av, (3.2, 0.0), Ev), area(Av, Bv, Cv) / 6))
t.qc("s2q3", pairs)

# s2q4: (x + 40) * 1.15 = 299; A = x, B = 220
x0 = F(299) / F(115, 100) - 40
assert (x0 + 40) * F(115, 100) == 299
t.qc("s2q4", [(x0, 220)])

# s2q5: monic parabola, roots r and r + 6 with product 7; A = vertex x, B = 0
roots = [F(r) for r in range(-50, 50) if r * (r + 6) == 7]
disc_roots = {(-6 + s * 8) / F(2) for s in (1, -1)}   # r^2 + 6r - 7 = 0
assert set(roots) == disc_roots
t.qc("s2q5", [(r + 3, 0) for r in roots])

# s2q6: chord 12, height above chord 9 through the center: 6^2 + (9 - r)^2 = r^2
r = F(6**2 + 9**2, 2 * 9)
assert 6**2 + (9 - r) ** 2 == r**2 and 9 - r > 0
t.choice("s2q6", r)

# s2q7: three sets 70, 64, 58, everyone in at least one; greatest exactly-one count 33; find N
sizes = (70, 64, 58)
S = sum(sizes)
def max_single(N):
    for tt in range(min(sizes), -1, -1):
        d = S - N - 2 * tt
        if d < 0:
            continue
        for ab in range(d + 1):
            for ac in range(d - ab + 1):
                bc = d - ab - ac
                singles = (sizes[0] - tt - ab - ac, sizes[1] - tt - ab - bc, sizes[2] - tt - ac - bc)
                if min(singles) >= 0:
                    assert sum(singles) + d + tt == N
                    return sum(singles)   # s = 2N - S + t rises with t, so the first feasible t is best
    return None
fits = [N for N in range(max(sizes), S + 1) if max_single(N) == 33]
assert len(fits) == 1
t.choice("s2q7", fits[0])

# s2q8: round table, 8 seats; captain (0) opposite coach (1); rookies (2, 3) adjacent; up to rotation
count = 0
for perm in permutations(range(8)):        # perm[seat] = person
    seat = {p: s for s, p in enumerate(perm)}
    if (seat[0] - seat[1]) % 8 == 4 and (seat[2] - seat[3]) % 8 in (1, 7):
        count += 1
assert count % 8 == 0
t.choice("s2q8", count // 8)

# s2q9: interior = k * exterior -> exterior = 180/(k+1), n = 360/exterior; equal perimeters
def sides(k):
    e = F(180, k + 1); n = F(360) / e
    assert n.denominator == 1
    return int(n)
t.choice("s2q9", F(90 * sides(3), sides(5)))

# s2q10: inlet 9 gal/min, drain 4 gal/min; open-drain fill takes 40 min longer; capacity
caps = [C for C in range(1, 5000) if F(C, 9 - 4) - F(C, 9) == 40]
assert len(caps) == 1
t.choice("s2q10", caps[0])

# s2q11: equilateral triangle side 12 in a circle; square in the same circle
s_tri = F(36, 3)
R2 = s_tri**2 / 3                          # R = s / sqrt(3)
assert abs(sqrt(R2) - (2 / 3) * (float(s_tri) * sqrt(3) / 2)) < 1e-9
t.choice("s2q11", 2 * R2)

# s2q12: perpendicular from (-1, 1) on y = 2x + 3 to y = 2x - 7
px, py = F(-1), F(1)
assert py == 2 * px + 3
# road y - 1 = -1/2 (x + 1); meet 2x - 7
qx = next(x for x in (F(n, 100) for n in range(-1000, 1000)) if py - F(1, 2) * (x - px) == 2 * x - 7)
qy = 2 * qx - 7
t.choice("s2q12", sqrt(float((qx - px) ** 2 + (qy - py) ** 2)))

# s2q13: 360k a perfect square
t.where("s2q13", lambda v: isqrt(360 * int(v)) ** 2 == 360 * int(v))

# s2q14: five integers (ties allowed), min 30, max 30 + 12, sum 5 * 35; possible medians
from itertools import combinations_with_replacement
meds = set()
for mid in combinations_with_replacement(range(30, 43), 3):
    if 30 + 42 + sum(mid) == 5 * 35:
        meds.add(mid[1])
t.where("s2q14", lambda v: v in meds)

# s2q15: cut through two opposite parallel edges of a 9 x 12 x 40 box
dims = (9, 12, 40)
areas = []
for i in range(3):
    a, b = [dims[j] for j in range(3) if j != i]
    areas.append(dims[i] * sqrt(a * a + b * b))
best_area = max(areas)
assert abs(best_area - round(best_area)) < 1e-9
t.value("s2q15", round(best_area))

t.done()
