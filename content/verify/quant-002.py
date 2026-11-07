"""Verify every key in content/tests/quant-002.json (exact arithmetic)."""
from fractions import Fraction as F
from itertools import combinations, product
import math

# s1q1: |x-3| < |x+5|  <=>  x > -1 (grid check)  -> A greater (0)
xs = [F(n, 8) for n in range(-200, 200)]
assert all((abs(x - 3) < abs(x + 5)) == (x > -1) for x in xs)

# s1q2: (3^20 + 3^18) / 3^19 == 10/3 -> equal (2)
assert F(3**20 + 3**18, 3**19) == F(10, 3)

# s1q3: AB=AC=5, BD=3, D on BC: BC in (3,10) valid, DC = BC-3 takes 3 and 5 -> D (3)
def valid_isosceles(bc): return 0 < bc < 10
assert valid_isosceles(6) and valid_isosceles(8) and {6 - 3, 8 - 3} == {3, 5}

# s1q4: k^2 = 1 mod 8  =>  k mod 8 == k^3 mod 8 -> equal (2)
ks = [k for k in range(1, 2000) if k * k % 8 == 1]
assert ks and all(k % 8 == k**3 % 8 for k in ks)

# s1q5: 1.5 L/s for 2 h in m^3 -> 10.8
assert F(3, 2) * 7200 / 1000 == F(108, 10)

# s1q6: r=6, chord 6*sqrt3 -> central angle 120 deg, arc 4*pi
half = math.degrees(math.asin(3 * math.sqrt(3) / 6))
assert abs(2 * half - 120) < 1e-9 and F(120, 360) * 12 == 4  # arc = 4*pi

# s1q7: even 4-digit numbers with strictly decreasing distinct digits -> 130
cnt = sum(1 for n in range(1000, 10000)
          if all(a > b for a, b in zip(str(n), str(n)[1:])) and n % 2 == 0)
assert cnt == 130

# s1q8: x + 1/x = 4 -> integer-valued: x^2+1/x^2=14, x^3+1/x^3=52, (x-1/x)^2=12, (x^2+1)/x=4
for x in (2 + math.sqrt(3), 2 - math.sqrt(3)):
    vals = [x*x + 1/(x*x), x - 1/x, x**3 + 1/x**3, (x - 1/x)**2, x*x - 1/(x*x), (x*x + 1)/x]
    isint = [abs(v - round(v)) < 1e-9 for v in vals]
    assert [i for i, b in enumerate(isint) if b] == [0, 2, 3, 5]

# s1q9: (3k+12)/(5k) = 3/4 -> original total 8k = 128
k = next(k for k in range(1, 100) if F(3*k + 12, 5*k) == F(3, 4))
assert 8 * k == 128

g7 = {0: 12, 1: 20, 2: 28, 3: 22, 4: 12, 5: 6}
g8 = {0: 8, 1: 14, 2: 22, 3: 30, 4: 16, 5: 10}
assert sum(g7.values()) == sum(g8.values()) == 100

# s1q10: at least 3 books -> 96
assert sum(g7[b] + g8[b] for b in (3, 4, 5)) == 96

# s1q11: (30-22)/22 ~ 36%
assert round(100 * F(30 - 22, 22)) == 36

# s1q12: median change for Grade 7 after moving the 0s to 4 -> 1 ("5 or more" coded 5; any value >= 5 gives the same median)
def median(freq):
    data = sorted(v for v, c in freq.items() for _ in range(c))
    n = len(data); return F(data[n//2 - 1] + data[n//2], 2)
moved = dict(g7); moved[4] += moved[0]; moved[0] = 0
for top in (5, 9):
    a = {(top if v == 5 else v): c for v, c in g7.items()}
    b = {(top if v == 5 else v): c for v, c in moved.items()}
    assert median(b) - median(a) == 1

# s2q1: five integers, mean 10, median 12 -> max least value 7 < 8 -> B (1)
best = max(a for a in range(-40, 13) for b in range(a, 13) for d in range(12, 60)
           if (e := 38 - a - b - d) >= d)
assert best == 7

# s2q2: adding one new min and one new max to 10 distinct values increases IQR -> A (0)
import random
random.seed(1)
def iqr(v):
    v = sorted(v); h = len(v) // 2
    def med(u): n = len(u); return F(u[(n-1)//2] + u[n//2], 2)
    return med(v[-h:]) - med(v[:h])
for _ in range(2000):
    L = random.sample(range(-500, 500), 10)
    M = L + [min(L) - random.randint(1, 50), max(L) + random.randint(1, 50)]
    assert iqr(M) > iqr(L)

# s2q3: rhombus side 6, diagonal 6*sqrt3 -> area 18*sqrt3 > 31 -> A (0)
assert (18 * math.sqrt(3) > 31) and (18**2 * 3 > 31**2)

# s2q4: 0.(27) + 0.(72) == 1 -> equal (2)
assert F(27, 99) + F(72, 99) == 1

# s2q5: roots r>0>s: b=-(r+s) vs c=rs can go either way -> D (3)
def bc(r, s): return -(r + s), r * s
b1, c1 = bc(1, -1); b2, c2 = bc(10, F(-1, 10))
assert b1 > c1 and b2 < c2

# s2q6: altitude to hypotenuse splits 4 and 9 -> perimeter 13 + 5*sqrt13
h2 = 4 * 9
leg1, leg2 = math.sqrt(16 + h2), math.sqrt(81 + h2)
assert abs(leg1**2 + leg2**2 - 169) < 1e-9 and abs(leg1 + leg2 + 13 - (13 + 5 * math.sqrt(13))) < 1e-9

# s2q7: a1=3, a_{n+1} = 1/(1-a_n), sum of first 100 -> 215/2
a, total = F(3), F(0)
for _ in range(100):
    total += a; a = 1 / (1 - a)
assert total == F(215, 2)

# s2q8: horizontal cylinder r=3, L=10, depth 1.5 -> 30*pi - 45*sqrt3/2
r, d, L = 3, 1.5, 10
theta = 2 * math.acos((r - d) / r)
vol = L * r * r / 2 * (theta - math.sin(theta))
assert abs(vol - (30 * math.pi - 45 * math.sqrt(3) / 2)) < 1e-9

# s2q9: perpendicular to 3x-4y=12 through (2,5) -> x-intercept 23/4
m = F(-4, 3)
assert F(2) + (0 - 5) / m == F(23, 4)

# s2q10: 1/6 + 1/4 - 1/12 -> 3 hours
assert 1 / (F(1, 6) + F(1, 4) - F(1, 12)) == 3

# s2q11: square with opposite vertices (1,2),(7,6) -> other vertices (2,7),(6,1); only (2,7) among choices
mx, my = F(1 + 7, 2), F(2 + 6, 2); vx, vy = 7 - mx, 6 - my
others = {(mx - vy, my + vx), (mx + vy, my - vx)}
choices = [(1, 6), (7, 2), (2, 7), (3, 8), (6, 0)]
assert [i for i, c in enumerate(choices) if c in others] == [2]

# s2q12: perimeter 34, diagonal 13 -> area 60
assert F(17**2 - 169, 2) == 60

# s2q13: parallel lines, angles 3x+10 and 5x-30 equal or supplementary, both in (0,180), not 90 -> {20, 25}
ok = []
for x in [F(15), F(20), F(45, 2), F(25), F(55, 2), F(40)]:
    p, q = 3*x + 10, 5*x - 30
    if 0 < p < 180 and 0 < q < 180 and (p == q or p + q == 180):
        ok.append(x)
assert ok == [20, 25]

# s2q14: x^2 + kx + 36 = 0 with two distinct integer roots -> k in {-37, 13, 15, 20} among choices
ks = {-(r + 36 // r) for r in range(-36, 37) if r and 36 % r == 0 and r != 36 // r}
choices = [-37, -12, 12, 13, 15, 20]
assert [i for i, k in enumerate(choices) if k in ks] == [0, 3, 4, 5]

# s2q15: kx+3y=6, 12x+ky=12 has no solution only at k=-6 (k=6 gives coincident lines)
def kind(k):
    det = k * k - 36
    if det != 0: return "unique"
    return "infinite" if F(k, 12) == F(6, 12) else "none"
assert [k for k in range(-50, 51) if kind(k) == "none"] == [-6] and kind(6) == "infinite"

print("quant-002: all 27 checks pass")
