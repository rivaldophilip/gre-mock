"""Verify every key in content/bank/quant/qbank-005.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import permutations
import math

from keys import Keys

t = Keys("qbank-005")


def tri_area(p, q, r):
    return abs(F((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1]), 2))


# s1q1: two triangle areas
t.qc("s1q1", [(tri_area((0, 0), (8, 0), (11, 6)), tri_area((1, -2), (9, -2), (4, 4)))])

# s1q2: P = (a, 3a - 2), Q = (3a - 2, a), |PQ| = 6 sqrt 2; product of Q's x-coordinates (search a on a fine grid)
qx = sorted({3 * a - 2 for a in [F(k, 12) for k in range(-1200, 1201)] if 2 * (a - (3 * a - 2)) ** 2 == 72})
t.choice("s1q2", math.prod(qx))

# s1q3: center (h, 0) equidistant from (0, 4) and (6, 2); area / pi
hs = [F(k, 12) for k in range(-1200, 1201) if F(k, 12) ** 2 + 16 == (F(k, 12) - 6) ** 2 + 4]
r2 = hs[0] ** 2 + 16
t.where("s1q3", lambda v: abs(v - float(r2) * math.pi) < 1e-9)

# s1q4: reflect across y = 3 then the x-axis; compare R's y with -b for b > 3
def r4(b):
    y = 6 - b
    return -y
t.qc("s1q4", [(r4(b), -b) for b in [F(k, 4) for k in range(13, 200)]])

# s1q5: three-digit N; first digit moved to the end is N + 216; compare units digit with hundreds digit
cases5 = []
for N in range(100, 1000):
    s = str(N)
    if int(s[1:] + s[0]) == N + 216:
        cases5.append((N % 10, N // 100))
t.qc("s1q5", cases5)

# s1q6: 3m + 5n even; mn mod 2 vs (m + n) mod 2
t.qc("s1q6", [((m * n) % 2, (m + n) % 2) for m in range(0, 30) for n in range(0, 30) if (3 * m + 5 * n) % 2 == 0])

# s1q7: divisors of n(n+1)(2n+1) for every n > 1
vals7 = [n * (n + 1) * (2 * n + 1) for n in range(2, 300)]
t.where("s1q7", lambda d: all(v % d == 0 for v in vals7))

# s1q8: three consecutive integers with product 8 times the sum; sum of possible greatest values
g8 = [k + 1 for k in range(-1000, 1001) if (k - 1) * k * (k + 1) == 8 * 3 * k]
t.choice("s1q8", sum(g8))

# s1q9: square with diagonal 10; area vs 50
t.qc("s1q9", [(F(10 ** 2, 2), 50)])

# s1q10: trapezoid, A = 60 deg, B = 30 deg, AD = 8, CD = 5; AB by coordinates
h = 8 * math.sin(math.radians(60))
xD = 8 * math.cos(math.radians(60))
xC = xD + 5
xB = xC + h / math.tan(math.radians(30))
t.value("s1q10", round(xB, 9))

# s1q11: integer right triangles with perimeter 60; hypotenuses
hyp11 = {c for a in range(1, 60) for b in range(a, 60) for c in [60 - a - b] if c > b and a * a + b * b == c * c}
t.where("s1q11", lambda v: v in hyp11)

# s1q12: 40t north, 80(t - 1) east, 200 apart; second truck's distance
ts = [F(k, 100) for k in range(100, 1000) if (40 * F(k, 100)) ** 2 + (80 * (F(k, 100) - 1)) ** 2 == 200 ** 2]
t.choice("s1q12", 80 * (ts[0] - 1))

# s1q13: zeros of f(2x) when f has zeros -2 and 4
z13 = sorted(F(z, 2) for z in (-2, 4))
t.sel("s1q13", [i for i, c in enumerate(t.choices("s1q13")) if c.replace(" ", "") == f"{z13[0]}and{z13[1]}"])

# s1q14: parabola h = a x (x - p) through (10, 6) and (30, 6) and (0, 0); max height
# general quadratic through (0,0): h = a x^2 + b x; solve from the two points
a14 = F(6 - 6 * F(10, 30), 100 - 900 * F(10, 30))  # from 100a + 10b = 6 and 900a + 30b = 6
b14 = (6 - 100 * a14) / 10
assert 900 * a14 + 30 * b14 == 6
xv = -b14 / (2 * a14)
t.value("s1q14", a14 * xv ** 2 + b14 * xv)

# s1q15: x^2 - 4x + 7 = mx + 3 has two distinct real roots
t.where("s1q15", lambda m: (4 + m) ** 2 - 16 > 0)

# s1q16: x^2 + bx + c with vertex (3, -20): r^2 + s^2
b16, c16 = -6, 9 - 20
disc = b16 * b16 - 4 * c16
r = (-b16 + math.sqrt(disc)) / 2
s = (-b16 - math.sqrt(disc)) / 2
assert abs(r * r + b16 * r + c16) < 1e-9 and abs(3 * 3 + b16 * 3 + c16 + 20) < 1e-12
t.value("s1q16", round(r * r + s * s, 9))

# s1q17: means 120, 150, overall 130; evening fraction (brute force counts)
fr17 = {F(V, M + V) for M in range(1, 60) for V in range(1, 60) if 120 * M + 150 * V == 130 * (M + V)}
assert len(fr17) == 1
t.choice("s1q17", fr17.pop())

# s1q18: (300 + 45n)/(10 + n) a whole number
t.where("s1q18", lambda n: (300 + 45 * n) % (10 + n) == 0)

# s1q19: sprinters S, distance D; means 62, 54, overall 57; 4 sprinters leave, mean 56
sol19 = [D for S in range(5, 200) for D in range(1, 200)
         if 62 * S + 54 * D == 57 * (S + D) and 62 * (S - 4) + 54 * D == 56 * (S - 4 + D)]
assert len(sol19) == 1
t.value("s1q19", sol19[0])

# s1q20: 0.25(40 - x) + 0.7x = 16; x vs 14
x20 = (16 - F(25, 100) * 40) / (F(70, 100) - F(25, 100))
t.qc("s1q20", [(x20, 14)])

# s1q21: last two digits of 2^60
t.choice("s1q21", 2 ** 60 % 100)

# s1q22: n = 7q + 3, q >= 1; which statements hold for all such n
ns = [7 * q + 3 for q in range(1, 200)]
stmts = [
    lambda n: (-n) % 7 == 4,
    lambda n: (-n) % 7 == 3,
    lambda n: (n * n - 5 * n) % 7 == 1,
    lambda n: (n + 4) % 7 == 0,
    lambda n: (n - 3) % 7 == 0 and ((n - 3) // 7) % 2 == 1,
    lambda n: (10 - 4 * n) % 7 == 5,
]
t.sel("s1q22", [i for i, f in enumerate(stmts) if all(f(n) for n in ns)])

# s1q23: two digits before the trailing zeros of 12!
f12 = math.factorial(12)
assert f12 % 100 == 0 and f12 % 1000 != 0
t.value("s1q23", (f12 // 100) % 100)

# s1q24: n - 5 multiple of 6, n - 1 multiple of 4; sum of two least vs 30
sol24 = [n for n in range(1, 500) if (n - 5) % 6 == 0 and (n - 1) % 4 == 0]
t.qc("s1q24", [(sol24[0] + sol24[1], 30)])

# s1q25: 2p(1 - p) = 0.32 with p = k/50, k < 25
k25 = [k for k in range(0, 25) if 2 * F(k, 50) * (1 - F(k, 50)) == F(32, 100)]
assert len(k25) == 1
t.choice("s1q25", k25[0])

# s1q26: 0.30F = 0.45C, F - C = 60; exactly one
sol26 = [(Fk, C) for C in range(1, 1000) for Fk in [C + 60] if F(30, 100) * Fk == F(45, 100) * C]
Fk, C = sol26[0]
both = F(30, 100) * Fk
t.choice("s1q26", Fk + C - 2 * both)

# s1q27: chord of x^2 + y^2 = 169 cut by 3x + 4y = 25 (solve the intersection)
A, B, Cc = 25, -200, -896  # 25y^2 - 200y - 896 = 0 from substituting x = (25 - 4y)/3
ys = [(-B + sg * math.sqrt(B * B - 4 * A * Cc)) / (2 * A) for sg in (1, -1)]
pts = [((25 - 4 * y) / 3, y) for y in ys]
for x, y in pts:
    assert abs(x * x + y * y - 169) < 1e-9
t.choice("s1q27", round(math.dist(*pts), 9))

# s1q28: 4 Red, 4 Blue alternate around 8 seats, rotations equal: fix R0 in seat 0, count the rest
people = ["R1", "R2", "R3", "B0", "B1", "B2", "B3"]
cnt = 0
for p in permutations(people):
    seats = ["R0"] + list(p)
    if all(seats[i][0] != seats[(i + 1) % 8][0] for i in range(8)):
        cnt += 1
t.choice("s1q28", cnt)

t.done()
