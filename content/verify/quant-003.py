"""Verify every key in content/tests/quant-003.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import permutations
import math
import re

from keys import Keys, number

t = Keys("quant-003")

# s1q1: n^3 < n; A = n^2, B = |n|
t.qc("s1q1", [(n * n, abs(n)) for n in (F(i, 8) for i in range(-80, 80)) if n**3 < n])

# s1q2: k = 5 mod 6; A = k^100 mod 8, B = k^50 mod 3
t.qc("s1q2", [(pow(k, 100, 8), pow(k, 50, 3)) for k in range(5, 3000, 6)])

# s1q3: isosceles triangle with sides 4 and 9: third side repeats one of them
tri = [(4, 9, x) for x in (4, 9) if max(4, 9, x) < 4 + 9 + x - max(4, 9, x)]
t.qc("s1q3", [(sum(s), 21) for s in tri])

# s1q4: 3 - 2x >= 7 and 5x + 2 > -18; A = x^2, B = -4x
xs = [x for x in (F(i, 50) for i in range(-500, 100)) if 3 - 2 * x >= 7 and 5 * x + 2 > -18]
t.qc("s1q4", [(x * x, -4 * x) for x in xs])

# s1q5: x * 1.4 * 0.75 = 1050; difference 2024 - 2020
x2020 = F(1050) / (F(14, 10) * F(75, 100))
t.choice("s1q5", 1050 - x2020)

# s1q6: 150 at 1.5c, 50 at 0.6 * 1.5c, cost 200c, profit 2100
per_c = 150 * F(3, 2) + 50 * F(6, 10) * F(3, 2) - 200
t.choice("s1q6", F(2100) / per_c)

# s1q7: runners 0=Ana, 1=Ben, 2=Chloe; lanes 0..5
count = 0
for p in permutations(range(6)):  # p[runner] = lane
    if abs(p[1] - p[2]) == 1 and p[0] not in (0, 5):
        count += 1
t.choice("s1q7", count)

# s1q8: 80 students, 50 Spanish, 45 Japanese; exactly-one counts over feasible "both"
exactly_one = {(50 - b) + (45 - b) for b in range(0, 46) if 80 - (50 + 45 - b) >= 0}
t.where("s1q8", lambda v: v in exactly_one)

# s1q9: Dev = e + 12, Fay = 2e, Dev = 30% of total
e = next(e for e in (F(i, 10) for i in range(1, 10000)) if e + 12 == F(3, 10) * (4 * e + 12))
t.value("s1q9", 4 * e + 12)

beaches = {"Coral Point": (250, 110, 20), "Dune Hollow": (400, 100, 15), "Gull Bay": (150, 120, 10), "Reef End": (200, 95, 25)}
eggs = {b: n * m for b, (n, m, s) in beaches.items()}
total_eggs, total_nests = sum(eggs.values()), sum(n for n, m, s in beaches.values())

# s1q10: Dune Hollow's share of eggs, nearest whole percent
t.choice("s1q10", round(100 * F(eggs["Dune Hollow"], total_eggs)))

# s1q11: drop in the weighted mean when Gull Bay is excluded, to one decimal
drop = F(total_eggs, total_nests) - F(total_eggs - eggs["Gull Bay"], total_nests - beaches["Gull Bay"][0])
t.choice("s1q11", F(round(drop * 10), 10))

# s1q12: nests above 130 at Coral Point + Dune Hollow under normal distributions; nearest choice
def above(thr, n, m, s):
    return n * 0.5 * math.erfc((thr - m) / s / math.sqrt(2))
est = above(130, *beaches["Coral Point"]) + above(130, *beaches["Dune Hollow"])
vals = [number(c) for c in t.choices("s1q12")]
t.sel("s1q12", min(range(len(vals)), key=lambda i: abs(float(vals[i]) - est)))

# s2q1: sqrt(3 * 9^x) vs 3^(x + 1/2); compare squares (both positive), exact for rational x = j/2
pairs = []
for j in range(-12, 13):
    xx = F(j, 2)
    a2 = 3 * F(3) ** (2 * xx)          # (sqrt(9^x + 9^x + 9^x))^2 = 3 * 9^x, with 9^x = 3^(2x), 2x integer
    b2 = F(3) ** int(2 * xx + 1)       # (3^(x + 1/2))^2 = 3^(2x + 1)
    pairs.append((a2, b2))
t.qc("s2q1", pairs)

# s2q2: rhombus side 5, diagonal 6; compare area^2 with 25^2
half_other_sq = F(25) - F(6, 2) ** 2
area_sq = (F(1, 2) * 6) ** 2 * 4 * half_other_sq   # area = (1/2) * 6 * (2 * half_other)
t.qc("s2q2", [(area_sq, 625)])

# s2q3
t.qc("s2q3", [(F(10**8 + 1, 10**9 + 1), F(10**9 + 1, 10**10 + 1))])

# s2q4: (a+b)^2 = 49, ab = 10, real a, b: a^3 + b^3 vs 100
cases = []
for s in (7, -7):
    disc = s * s - 4 * 10
    assert disc >= 0
    a_, b_ = (s + math.sqrt(disc)) / 2, (s - math.sqrt(disc)) / 2
    cases.append((round(a_**3 + b_**3, 9), 100))
t.qc("s2q4", cases)

# s2q5: +700% over 12 years at a constant yearly rate g: g^12 = 8; A = percent increase over 4 years (g^4 - 1) * 100
g4 = next(x for x in (F(i, 1000) for i in range(1000, 8000)) if x ** 3 == 1 + F(700, 100))  # (g^4)^3 = g^12
t.qc("s2q5", [((g4 - 1) * 100, 100)])

# s2q6: sqrt(r^2-64) + sqrt(r^2-36) = 14 (opposite sides); solve by bisection, check same side impossible
f = lambda r: math.sqrt(r * r - 64) + math.sqrt(r * r - 36) - 14
lo, hi = 8.0, 100.0
for _ in range(200):
    mid = (lo + hi) / 2
    lo, hi = (mid, hi) if f(mid) < 0 else (lo, mid)
r2 = round(lo * lo)
assert abs(lo * lo - r2) < 1e-9
assert all(math.sqrt(r * r - 36) - math.sqrt(r * r - 64) < 14 for r in (8 + i / 100 for i in range(0, 10000)))
t.choice("s2q6", f"{r2}\\pi")

# s2q7: distinct rows of BBHHJJ (boxwood, holly, juniper) with no two equal neighbours
rows = {p for p in permutations("BBHHJJ") if all(a != b for a, b in zip(p, p[1:]))}
t.choice("s2q7", len(rows))

# s2q8: semicircle square: (s/2)^2 + s^2 = r^2; circle square: diagonal 2r; r = 1
s1_sq = F(1) / (F(1, 4) + 1)
s2_sq = F(2) ** 2 / 2
t.choice("s2q8", s1_sq / s2_sq)

# s2q9: hours after 9:00 when Y is 15 km ahead
hours = next(F(i, 60) for i in range(30, 60 * 12) if 75 * (F(i, 60) - F(1, 2)) - 60 * F(i, 60) == 15)
minutes = 9 * 60 + hours * 60
h, m = divmod(int(minutes), 60)
label = "12:00 noon" if (h, m) == (12, 0) else f"{h if h <= 12 else h - 12}:{m:02d} {'a.m.' if h < 12 else 'p.m.'}"
t.choice("s2q9", label)

# s2q10: nearest choice on a log scale
val = (3.98e-4 * 6.1e7) / (2.02e3) ** 2
vals = [float(number(c)) for c in t.choices("s2q10")]
t.sel("s2q10", min(range(len(vals)), key=lambda i: abs(math.log10(vals[i] / val))))

# s2q11: A = 45, B = 30, BC = a = 8; law of sines, area = (1/2) * AC * AB * sin A
A, B = math.radians(45), math.radians(30)
C = math.pi - A - B
k = 8 / math.sin(A)
AC, AB = k * math.sin(B), k * math.sin(C)
area = 0.5 * AC * AB * math.sin(A)
def ev(txt):
    s = re.sub(r"(\d)\\sqrt(\d)", r"\1*\\sqrt\2", txt)
    s = re.sub(r"\\sqrt\{?(\d+)\}?", r"math.sqrt(\1)", s)
    return eval(s)
vals = [ev(c) for c in t.choices("s2q11")]
best = min(range(len(vals)), key=lambda i: abs(vals[i] - area))
assert abs(vals[best] - area) < 1e-9
t.sel("s2q11", best)

# s2q12: 9c + 4b = 100, c, b >= 1; greatest c + b
t.choice("s2q12", max(c + b for c in range(1, 12) for b in range(1, 26) if 9 * c + 4 * b == 100))

# s2q13: tulips:daffodils = 4:7, daffodils:irises = 3:2, tulips > 20, total < 150
totals = {tu + d + i for tu in range(1, 150) for d in range(1, 150) for i in range(1, 150)
          if 7 * tu == 4 * d and 2 * d == 3 * i and tu > 20 and tu + d + i < 150}
t.where("s2q13", lambda v: v in totals)

# s2q14: rectangle with diagonal 10: perimeter P feasible iff l + w = P/2, l*w = ((P/2)^2 - 100)/2 has positive real roots
def feasible(P):
    s = F(P) / 2
    prod = (s * s - 100) / 2
    return s > 0 and prod > 0 and s * s - 4 * prod >= 0
t.where("s2q14", feasible)

# s2q15: regular polygon with interior = 5 * exterior; number of diagonals
n = next(n for n in range(3, 400) if F(180) - F(360, n) == 5 * F(360, n))
t.value("s2q15", n * (n - 3) // 2)

t.done()
