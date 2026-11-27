"""Verify every key in content/bank/quant/qbank-004.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations
import math
import random

from keys import Keys, number

t = Keys("qbank-004")
random.seed(4)
grid = [F(n, 24) for n in range(-24 * 8, 24 * 8 + 1)]  # rationals in [-8, 8], step 1/24


def match_interval(qid, cond, preds):
    """Select the choices whose predicate agrees with cond on every grid point."""
    pts = [x for x in grid]
    t.sel(qid, [i for i, p in enumerate(preds) if all(p(x) == cond(x) for x in pts)])


# s1q1: (4 - x)(2x + 6) < 0
match_interval("s1q1", lambda x: (4 - x) * (2 * x + 6) < 0, [
    lambda x: -3 < x < 4, lambda x: x < -3 or x > 4, lambda x: -4 < x < 3,
    lambda x: x < -4 or x > 3, lambda x: x > 4])

# s1q2: x^2 > x and x^3 < x^2; compare x^3 with x
t.qc("s1q2", [(x ** 3, x) for x in grid if x * x > x and x ** 3 < x * x])

# s1q3: 3/(x - 2) < -1, x != 2
cond3 = lambda x: x != 2 and F(3) / (x - 2) < -1
match_interval("s1q3", cond3, [
    lambda x: x < -1, lambda x: -1 < x < 2, lambda x: x > 2,
    lambda x: x < -1 or x > 2, lambda x: x < 2])

# s1q4: integers with n^2 <= 2|n| + 8, against 8
cnt4 = sum(1 for n in range(-100, 101) if n * n <= 2 * abs(n) + 8)
t.qc("s1q4", [(cnt4, 8)])

# s1q5: d in [345, 355), t in [4.95, 5.05); possible speeds d/t form the open interval (345/5.05, 355/4.95)
ds = [F(345) + F(k, 10) for k in range(0, 100)]
ts = [F(495, 100) + F(k, 1000) for k in range(0, 100)]
lo5, hi5 = F(345) / F(505, 100), F(355) / F(495, 100)
assert min(d / u for d in ds for u in ts) > lo5 and max(d / u for d in ds for u in ts) < hi5
t.where("s1q5", lambda v: lo5 < v < hi5)

# s1q6: 7.7 km/s against 300 km/h; nearest choice (ratio scale)
r6 = F(77, 10) * 3600 / 300
ch6 = [number(c) for c in t.choices("s1q6")]
t.choice("s1q6", min(ch6, key=lambda c: abs(math.log(float(c) / float(r6)))))

# s1q7: digits of 4^23 * 25^21
t.value("s1q7", len(str(4 ** 23 * 25 ** 21)))

# s1q8: seconds in 30 years of 365 days against 10^9
t.qc("s1q8", [(30 * 365 * 24 * 3600, 10 ** 9)])

# s1q9: circle graph, 480 ha: wheat 35%, corn 72 deg, soy 25%, fallow 18 deg, barley the rest
tot = 480
pct = {"wheat": F(35, 100), "corn": F(72, 360), "soy": F(25, 100), "fallow": F(18, 360)}
pct["barley"] = 1 - sum(pct.values())
ha = {k: v * tot for k, v in pct.items()}
deg = {k: v * 360 for k, v in pct.items()}
s9 = [deg["barley"] == 54, ha["corn"] + ha["fallow"] == 120, ha["wheat"] > ha["corn"] + ha["barley"],
      deg["soy"] > F(3, 2) * deg["corn"], ha["fallow"] == 18, ha["barley"] == 72]
t.sel("s1q9", [i for i, ok in enumerate(s9) if ok])

# s1q10: readings (year, turbines); greatest average increase per year between consecutive readings
turb = [(2000, 20), (2010, 44), (2015, 58), (2018, 67), (2020, 74), (2026, 92)]
rate = [F(b[1] - a[1], b[0] - a[0]) for a, b in zip(turb, turb[1:])]
t.sel("s1q10", [rate.index(max(rate))])

# s1q11: stacked bars; segment lengths per line
bars = {"A": [30, 25, 35, 20], "B": [20, 30, 25, 40], "C": [15, 10, 20, 15]}
t.value("s1q11", sum(bars["B"]) - sum(bars["A"]))

# s1q12: plots (fertilizer, harvest); fertilizer of the plot with the greatest ratio, against 30
plots = [(20, 50), (25, 70), (30, 70), (35, 90), (40, 80), (45, 100), (50, 90)]
best = max(plots, key=lambda p: F(p[1], p[0]))
assert sum(1 for p in plots if F(p[1], p[0]) == F(best[1], best[0])) == 1
t.qc("s1q12", [(best[0], 30)])

# s1q13: principal = s + 30, s + 36 = 3(s + 6)
sol = [(s, s + 30) for s in range(1, 100) if s + 36 == 3 * (s + 6)]
assert len(sol) == 1
s, p = sol[0]
s13 = [p - 3 == 6 * (s - 3), p == 3 * s, 30 + (p - s) == 2 * 30,
       s + p == 48, s + 6 == 21, p - 6 == 12 * (s - 6)]
t.sel("s1q13", [i for i, ok in enumerate(s13) if ok])

# s1q14: 18c + 7f = 500, c < f < 3c; total tickets
sol14 = [(c, f) for c in range(0, 60) for f in range(0, 80) if 18 * c + 7 * f == 500 and c < f < 3 * c]
assert len(sol14) == 1
t.choice("s1q14", sum(sol14[0]))

# s1q15: 1..n with one page counted twice totals 1000
sol15 = [(n, 1000 - n * (n + 1) // 2) for n in range(1, 100) if 1 <= 1000 - n * (n + 1) // 2 <= n]
assert len(sol15) == 1
t.value("s1q15", sol15[0][1])

# s1q16: 5q + 8p = 6.2(q + p); compare off-peak revenue 5q with peak revenue 8p
cases16 = [(5 * q, 8 * p) for p in range(1, 200) for q in range(1, 400) if 10 * (5 * q + 8 * p) == 62 * (q + p)]
assert cases16
t.qc("s1q16", cases16)

# s1q17: powers with units digit 1
pw = [(3, 20), (7, 30), (9, 15), (13, 40), (17, 22), (19, 24)]
t.sel("s1q17", [i for i, (b, e) in enumerate(pw) if pow(b, e, 10) == 1])

# s1q18: 3n leaves 5 mod 8; station after n clicks backward = (-n) mod 8
st = {(-n) % 8 for n in range(1, 2000) if (3 * n) % 8 == 5}
assert len(st) == 1
t.choice("s1q18", st.pop())

# s1q19: n/d = 14.25, quotient 14, remainder 9
sol19 = [n for d in range(10, 1000) for n in [14 * d + 9] if F(n, d) == F(57, 4)]
assert len(sol19) == 1
t.value("s1q19", sol19[0])

# s1q20: 158 leaves 8 and 101 leaves 11 on division by d; least d against 15
ds20 = [d for d in range(1, 200) if 158 % d == 8 and 101 % d == 11]
t.qc("s1q20", [(min(ds20), 15)])

# s1q21: 40b + 12v >= 150, b + v <= 6, v >= 1, 300b + 90v <= 1350; possible v
vs = {v for b in range(0, 7) for v in range(1, 7)
      if 40 * b + 12 * v >= 150 and b + v <= 6 and 300 * b + 90 * v <= 1350}
t.where("s1q21", lambda v: v in vs)

# s1q22: a < b < c with b - a > c - b; which statements hold for every sample
smp = []
while len(smp) < 20000:
    a, b, c = sorted(random.uniform(-10, 10) for _ in range(3))
    if a < b < c and b - a > c - b:
        smp.append((a, b, c))
smp += [(-9, -3, -1), (0, 3, 5)]
st22 = [lambda a, b, c: a + b + c > 0, lambda a, b, c: (a + b + c) / 3 > b, lambda a, b, c: (a + b + c) / 3 < b,
        lambda a, b, c: c - b > (c - a) / 2, lambda a, b, c: b - a > 2 * (c - b)]
assert all(b - a > c - b for a, b, c in smp)
t.sel("s1q22", [i for i, f in enumerate(st22) if all(f(*xs) for xs in smp)])

# s1q23: x > 3 from 7 - 2x < 1 and x <= (k + 5)/4; least integer k with a solution
def has_sol(k):
    return any(7 - 2 * x < 1 and 4 * x - k <= 5 for x in grid)


k23 = min(k for k in range(-20, 21) if has_sol(k))
assert not has_sol(k23 - 1)
t.value("s1q23", k23)

# s1q24: 100 + 45n < 1000, n >= 4; count against 16
t.qc("s1q24", [(sum(1 for n in range(4, 100) if 100 + 45 * n < 1000), 16)])

# s1q25: two circles of radius 6 with lens area 24pi - 18sqrt3: center distance
def lens(r, d):
    return 2 * r * r * math.acos(d / (2 * r)) - (d / 2) * math.sqrt(4 * r * r - d * d)


target = 24 * math.pi - 18 * math.sqrt(3)
t.where("s1q25", lambda v: abs(lens(6, v) - target) < 1e-9)

# s1q26: perfect matchings of 8 people with exactly one of two twin pairs together
def matchings(people):
    if not people:
        yield []
        return
    a = people[0]
    for i in range(1, len(people)):
        rest = people[1:i] + people[i + 1:]
        for m in matchings(rest):
            yield [(a, people[i])] + m


ms = list(matchings(list(range(8))))
assert len(ms) == 105
together = lambda m, x, y: (x, y) in m or (y, x) in m
t.value("s1q26", sum(1 for m in ms if together(m, 0, 1) + together(m, 2, 3) == 1))

# s1q27: sides 8, 15, x integer forming a triangle; P(obtuse)
xs27 = [x for x in range(1, 100) if x + 8 > 15 and x < 23 and x + 15 > 8]
obt = [x for x in xs27 if max(8, 15, x) ** 2 > sum(v * v for v in (8, 15, x)) - max(8, 15, x) ** 2]
t.value("s1q27", F(len(obt), len(xs27)))

# s1q28: (4 - x^2)/(x^2 - 2x) + 2/x against 0
t.qc("s1q28", [((F(4) - x * x) / (x * x - 2 * x) + F(2) / x, 0) for x in grid if x not in (0, 2)])

t.done()
