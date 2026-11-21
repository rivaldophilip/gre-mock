"""Verify every key in content/tests/quant-019.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
import itertools
import math
import random

from keys import Keys

t = Keys("quant-019")
random.seed(19)

# s1q1: |x| + x = 0; A = |x| - x, B = 0
t.qc("s1q1", [(abs(x) - x, 0) for x in (F(n, 4) for n in range(-40, 41)) if abs(x) + x == 0])

# s1q2: A(-5,0), B(5,0), O origin; OC = 4, AC = 6 -> C fixed up to reflection; A = BC, B = 8
cx = F(36 - 16 - 25, 10)  # (x+5)^2 + y^2 = 36 minus x^2 + y^2 = 16
cy2 = 16 - cx * cx
assert cy2 > 0 and (cx + 5) ** 2 + cy2 == 36
t.qc("s1q2", [(math.sqrt((5 - cx) ** 2 + cy2), 8)])

# s1q3: x + 2y + 3z = 20, 2x + 4y + 5z = 37; A = z, B = x + 2y - 8
pairs = []
for x in (F(n, 3) for n in range(-30, 31)):
    for y in (F(n, 2) for n in range(-20, 21)):
        z = (20 - x - 2 * y) / 3
        if 2 * x + 4 * y + 5 * z == 37:
            pairs.append((z, x + 2 * y - 8))
assert pairs
t.qc("s1q3", pairs)

# s1q4: x^2 y = 9y and xy = -3y; A = x, B = -3
grid = [F(n, 2) for n in range(-20, 21)]
t.qc("s1q4", [(x, -3) for x in grid for y in grid if x * x * y == 9 * y and x * y == -3 * y])

# s1q5: 18 kg of R (bark:compost 1:2) + 12 kg of S -> equal weights; bark share of S
bark_r = F(18) * F(1, 3)
t.choice("s1q5", (F(18 + 12, 2) - bark_r) / 12)

# s1q6: 1.4C = 84; new price P with P - C = 0.4P; the increase
cost = F(84) / F(14, 10)
t.choice("s1q6", cost / (1 - F(4, 10)) - 84)

# s1q7: n % 6 == 4 and n % 9 == 7, least three-digit
t.choice("s1q7", next(n for n in range(100, 1000) if n % 6 == 4 and n % 9 == 7))

# s1q8: c < 0 and a/c > b/c; which statements hold in every sampled case
stmts = [lambda a, b, c: a > b, lambda a, b, c: a * c * c < b * c * c, lambda a, b, c: -a > -b,
         lambda a, b, c: a * c > b * c, lambda a, b, c: a * a < b * b, lambda a, b, c: 1 / a > 1 / b]
ok = [True] * len(stmts)
vals = [F(n, 2) for n in range(-12, 13) if n != 0]
for a in vals:
    for b in vals:
        for c in (F(-1, 3), F(-2), F(-7, 2)):
            if a / c > b / c:
                for i, s in enumerate(stmts):
                    ok[i] = ok[i] and s(a, b, c)
t.sel("s1q8", [i for i, v in enumerate(ok) if v])

# s1q9: 18 m^2 / (30 cm)^2
area_cm2 = 18 * 100 ** 2
assert area_cm2 % (30 ** 2) == 0
t.value("s1q9", area_cm2 // 30 ** 2)

# DI set: block -> (trees, mean yield per tree)
blocks = {"North": (10, 70), "East": (25, 52), "South": (60, 45), "West": (35, 58)}
total = {k: n * m for k, (n, m) in blocks.items()}
trees = {k: n for k, (n, _) in blocks.items()}

# s1q10: West total vs East total, percent greater (rounded)
t.choice("s1q10", round(100 * (F(total["West"], total["East"]) - 1)))

# s1q11: combined mean of East+West minus that of North+South, to one decimal
def combined(*names):
    return F(sum(total[n] for n in names), sum(trees[n] for n in names))
diff = combined("East", "West") - combined("North", "South")
t.choice("s1q11", F(str(round(float(diff), 1))))

# s1q12: k trees at 70 kg added so the overall mean is 55
T, N = sum(total.values()), sum(trees.values())
k = F(55 * N - T, 70 - 55)
assert k.denominator == 1 and (T + 70 * k) / (N + k) == 55
t.value("s1q12", k)

# s2q1: 8^11 vs 10^10
t.qc("s2q1", [(8 ** 11, 10 ** 10)])

# s2q2: least SD of 6 integers with sum 21 vs with sum 20 (population SD; same n, so either definition orders them alike)
def least_sd(total_sum, n=6):
    best = None
    for combo in itertools.combinations_with_replacement(range(-2, 10), n):
        if sum(combo) == total_sum:
            m = F(total_sum, n)
            ss = sum((v - m) ** 2 for v in combo)
            best = ss if best is None else min(best, ss)
    return math.sqrt(best / n)
t.qc("s2q2", [(least_sd(21), least_sd(20))])

# s2q3: X uniform on [10, 20], N uniform on integers 10..20; P(X <= 13) vs P(N <= 13)
t.qc("s2q3", [(F(13 - 10, 20 - 10), F(sum(1 for n in range(10, 21) if n <= 13), 11))])

# s2q4: box plots (P: 20 scores, Q: 200 scores; quartiles as medians of the lower and upper halves)
# A = number of P scores above 60, B = number of Q scores above 60, over lists matching each plot
def five(v):
    v = sorted(v); n = len(v); h = n // 2
    def med(u):
        m = len(u); return F(u[(m - 1) // 2] + u[m // 2], 2)
    return (v[0], med(v[:h]), med(v), med(v[-h:]), v[-1])
P_SUM, Q_SUM = (62, 70, 78, 86, 96), (30, 46, 56, 66, 90)
p_list = [62] + [70] * 5 + [78] * 5 + [86] * 8 + [96]
q_few = [30] + [46] * 50 + [56] * 99 + [76] * 49 + [90]   # as few above 60 as the plot allows
q_many = [30] + [46] * 50 + [56] * 50 + [66] * 98 + [90]
assert len(p_list) == 20 and five(p_list) == P_SUM
for lst in (q_few, q_many):
    assert len(lst) == 200 and five(lst) == Q_SUM, five(lst)
# any 200-list with Q3 = 66 has its 151st value >= 66 > 60, so at least 50 above 60; every P score is >= 62
above = lambda v: sum(1 for x in v if x > 60)
assert above(q_few) == 50
t.qc("s2q4", [(above(p_list), above(q)) for q in (q_few, q_many)])

# s2q5: factor 4 over 10 years; value after 5 years vs average of start and end (start = 1)
r = 4 ** (1 / 10)
t.qc("s2q5", [(r ** 5, F(1 + 4, 2))])

# s2q6: midpoint (4, 3) of P on the x-axis and Q on the y-axis
px, qy = 2 * 4, 2 * 3
d2 = px ** 2 + qy ** 2
assert math.isqrt(d2) ** 2 == d2
t.choice("s2q6", math.isqrt(d2))

# s2q7: O center, A, B, C on the circle, angle BAO = 20, angle BCO = 30; angle AOC
# place B at 90 degrees; isosceles OAB has apex 180 - 2*20, OCB apex 180 - 2*30 (A and C on either side of OB)
def pt(deg):
    return (math.cos(math.radians(deg)), math.sin(math.radians(deg)))
def ang(p, v, q):  # angle at v
    a = (p[0] - v[0], p[1] - v[1]); b = (q[0] - v[0], q[1] - v[1])
    return math.degrees(math.acos((a[0] * b[0] + a[1] * b[1]) / math.hypot(*a) / math.hypot(*b)))
O, B = (0.0, 0.0), pt(90)
A, C = pt(90 + (180 - 40)), pt(90 - (180 - 60))
assert abs(ang(B, A, O) - 20) < 1e-9 and abs(ang(B, C, O) - 30) < 1e-9
t.choice("s2q7", round(ang(A, O, C), 6))

# s2q8: 0.4T = 0.3(T + 10); 0.2x + 0.5(T - x) = 0.4T
Tm = F(3, 10) * 10 / (F(4, 10) - F(3, 10))
x20 = (F(5, 10) * Tm - F(4, 10) * Tm) / (F(5, 10) - F(2, 10))
t.choice("s2q8", x20)

# s2q9: OC bisects AOB (halves a); COD = 12, D inside COB; AOD = 3 DOB
a = next(F(n, 2) for n in range(1, 360) if F(n, 2) + 12 == 3 * (F(n, 2) - 12) and F(n, 2) > 12)
t.choice("s2q9", 2 * a)

# s2q10: x - 2y = 5; value of x - [2y - (x - 3y)] - (-y)
vals10 = set()
for _ in range(50):
    y = F(random.randint(-50, 50), random.randint(1, 9)); x = 5 + 2 * y
    vals10.add(x - (2 * y - (x - 3 * y)) - (-y))
assert len(vals10) == 1
t.choice("s2q10", vals10.pop())

# s2q11: 5 positive whole-thousand bonuses summing to 100, max <= 2 * min; greatest max
best = max(L for s in range(1, 101) for L in range(s, 2 * s + 1)
           if 3 * s <= 100 - s - L <= 3 * L)
t.choice("s2q11", best * 1000)

# s2q12: seven integers, odd sum, even product; greatest number of odd integers
t.choice("s2q12", max(sum(p) for p in itertools.product((0, 1), repeat=7) if sum(p) % 2 == 1 and sum(p) < 7))

# s2q13: perimeter 28 -> diagonal d with d^2 = 196 - 2ab, a + b = 14, a, b > 0
t.where("s2q13", lambda d: 98 <= d * d < 196)
for d in (10, 12, 13):  # spot-check: real positive sides exist for each admissible d
    disc = 196 - 2 * (196 - d * d)
    assert disc >= 0 and 14 - math.sqrt(disc) > 0

# s2q14: integer right triangles with a leg 12: possible hypotenuses
hyps = {c for b in range(1, 200) for c in range(b + 1, 400) if 144 + b * b == c * c}
t.where("s2q14", lambda c: c in hyps)

# s2q15: integers with 12 < n^2 <= 81
t.value("s2q15", sum(1 for n in range(-100, 101) if 12 < n * n <= 81))

t.done()
