"""Verify every key in content/tests/quant-002.json: each answer is computed here (exact arithmetic) and compared with the key."""
from fractions import Fraction as F
import ast
import math
import random

from keys import Keys

t = Keys("quant-002")

# s1q1: |x-3| < |x+5|  <=>  x > -1; A = x, B = -1
t.qc("s1q1", [(x, -1) for x in (F(n, 8) for n in range(-200, 200)) if abs(x - 3) < abs(x + 5)])

# s1q2: (3^20 + 3^18) / 3^19 vs 10/3
t.qc("s1q2", [(F(3**20 + 3**18, 3**19), F(10, 3))])

# s1q3: AB=AC=5, BD=3, D on BC: BC in (3, 10), so A = DC = BC - 3 ranges over (0, 7); B = 3
t.qc("s1q3", [(F(bc, 2) - 3, 3) for bc in range(7, 20)])

# s1q4: k^2 = 1 mod 8; A = k mod 8, B = k^3 mod 8
t.qc("s1q4", [(k % 8, k**3 % 8) for k in range(1, 2000) if k * k % 8 == 1])

# s1q5: 1.5 L/s for 2 h in m^3
t.choice("s1q5", F(3, 2) * 7200 / 1000)

# s1q6: r=6, chord 6*sqrt3 -> central angle 120 deg, arc 4*pi
half = math.degrees(math.asin(3 * math.sqrt(3) / 6))
assert abs(2 * half - 120) < 1e-9
t.choice("s1q6", f"{F(round(2 * half), 360) * 12}\\pi")

# s1q7: even 4-digit numbers with strictly decreasing distinct digits
t.choice("s1q7", sum(1 for n in range(1000, 10000) if all(a > b for a, b in zip(str(n), str(n)[1:])) and n % 2 == 0))

# s1q8: x + 1/x = 4; which expressions are integers (choices in order)
for x in (2 + math.sqrt(3), 2 - math.sqrt(3)):
    vals = [x*x + 1/(x*x), x - 1/x, x**3 + 1/x**3, (x - 1/x)**2, x*x - 1/(x*x), (x*x + 1)/x]
    t.sel("s1q8", [i for i, v in enumerate(vals) if abs(v - round(v)) < 1e-9])

# s1q9: (3k+12)/(5k) = 3/4 -> original total 8k
k = next(k for k in range(1, 100) if F(3*k + 12, 5*k) == F(3, 4))
t.value("s1q9", 8 * k)

g7 = {0: 12, 1: 20, 2: 28, 3: 22, 4: 12, 5: 6}
g8 = {0: 8, 1: 14, 2: 22, 3: 30, 4: 16, 5: 10}
assert sum(g7.values()) == sum(g8.values()) == 100

# s1q10: at least 3 books
t.choice("s1q10", sum(g7[b] + g8[b] for b in (3, 4, 5)))

# s1q11: (30-22)/22 as a rounded percent
t.choice("s1q11", round(100 * F(30 - 22, 22)))

# s1q12: median change for Grade 7 after moving the 0s to 4 ("5 or more" coded 5; any value >= 5 gives the same median)
def median(freq):
    data = sorted(v for v, c in freq.items() for _ in range(c))
    n = len(data); return F(data[n//2 - 1] + data[n//2], 2)
moved = dict(g7); moved[4] += moved[0]; moved[0] = 0
changes = {median({(top if v == 5 else v): c for v, c in moved.items()}) - median({(top if v == 5 else v): c for v, c in g7.items()}) for top in (5, 9)}
assert len(changes) == 1
t.choice("s1q12", changes.pop())

# s2q1: five integers, mean 10, median 12; A = greatest possible least value, B = 8
best = max(a for a in range(-40, 13) for b in range(a, 13) for d in range(12, 60) if (e := 38 - a - b - d) >= d)
t.qc("s2q1", [(best, 8)])

# s2q2: adding a new min and a new max to 10 distinct values; A = IQR of M, B = IQR of L
random.seed(1)
def iqr(v):
    v = sorted(v); h = len(v) // 2
    def med(u): n = len(u); return F(u[(n-1)//2] + u[n//2], 2)
    return med(v[-h:]) - med(v[:h])
pairs = []
for _ in range(2000):
    Ls = random.sample(range(-500, 500), 10)
    Ms = Ls + [min(Ls) - random.randint(1, 50), max(Ls) + random.randint(1, 50)]
    pairs.append((iqr(Ms), iqr(Ls)))
t.qc("s2q2", pairs)

# s2q3: rhombus side 6, diagonal 6*sqrt3 -> area 18*sqrt3 vs 31
t.qc("s2q3", [(18 * math.sqrt(3), 31)])

# s2q4: 0.(27) + 0.(72) vs 1
t.qc("s2q4", [(F(27, 99) + F(72, 99), 1)])

# s2q5: roots r > 0 > s: A = b = -(r+s), B = c = rs
t.qc("s2q5", [(-(r + s), r * s) for r, s in [(1, -1), (10, F(-1, 10)), (3, -2), (F(1, 2), -5)]])

# s2q6: altitude to hypotenuse splits it into 4 and 9 -> perimeter 13 + 5*sqrt13
h2 = 4 * 9
leg1, leg2 = math.sqrt(16 + h2), math.sqrt(81 + h2)
assert abs(leg1**2 + leg2**2 - 169) < 1e-9 and abs(leg1 + leg2 - 5 * math.sqrt(13)) < 1e-9
t.choice("s2q6", "13+5\\sqrt{13}")

# s2q7: a1=3, a_{n+1} = 1/(1-a_n), sum of the first 100 terms
a, total = F(3), F(0)
for _ in range(100):
    total += a; a = 1 / (1 - a)
t.choice("s2q7", total)

# s2q8: horizontal cylinder r=3, L=10, filled to depth 1.5 -> 30*pi - 45*sqrt3/2
r, d, Lc = 3, 1.5, 10
theta = 2 * math.acos((r - d) / r)
vol = Lc * r * r / 2 * (theta - math.sin(theta))
assert abs(vol - (30 * math.pi - 45 * math.sqrt(3) / 2)) < 1e-9
t.choice("s2q8", "30\\pi-\\dfrac{45\\sqrt3}{2}")

# s2q9: line perpendicular to 3x-4y=12 through (2,5): x-intercept
m = F(-4, 3)
x0 = F(2) + (0 - 5) / m
t.choice("s2q9", f"\\left(\\dfrac{{{x0.numerator}}}{{{x0.denominator}}}, 0\\right)")

# s2q10: 1/6 + 1/4 - 1/12 of the job per hour
t.choice("s2q10", 1 / (F(1, 6) + F(1, 4) - F(1, 12)))

# s2q11: square with opposite vertices (1,2),(7,6): the other two vertices; which choice is one
mx, my = F(1 + 7, 2), F(2 + 6, 2); vx, vy = 7 - mx, 6 - my
others = {(mx - vy, my + vx), (mx + vy, my - vx)}
t.sel("s2q11", [i for i, c in enumerate(t.choices("s2q11")) if ast.literal_eval(c) in others])

# s2q12: perimeter 34, diagonal 13 -> area = ((a+b)^2 - (a^2+b^2)) / 2
t.choice("s2q12", F(17**2 - 169, 2))

# s2q13: parallel lines, angles 3x+10 and 5x-30 equal or supplementary, both in (0, 180)
def fits(x):
    p, q = 3*x + 10, 5*x - 30
    return 0 < p < 180 and 0 < q < 180 and (p == q or p + q == 180)
t.where("s2q13", fits)

# s2q14: x^2 + kx + 36 = 0 with two distinct integer roots
ks = {-(r + 36 // r) for r in range(-36, 37) if r and 36 % r == 0 and r != 36 // r}
t.where("s2q14", lambda k: k in ks)

# s2q15: kx+3y=6, 12x+ky=12 has no solution only at k=-6 (k=6 gives coincident lines)
def kind(k):
    if k * k - 36 != 0: return "unique"
    return "infinite" if F(k, 12) == F(6, 12) else "none"
none = [k for k in range(-50, 51) if kind(k) == "none"]
assert len(none) == 1 and kind(6) == "infinite"
t.value("s2q15", none[0])

t.done()
