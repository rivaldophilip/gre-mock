"""Verify every key in content/bank/quant/qbank-008.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import combinations
import math

from keys import Keys, number

t = Keys("qbank-008")

# s1q1: 2x^2 - 9x + 6 = 0; 1/r + 1/s from the actual roots
disc = 81 - 48
r1, r2 = (9 + math.sqrt(disc)) / 4, (9 - math.sqrt(disc)) / 4
v1 = 1 / r1 + 1 / r2
assert abs(v1 - 1.5) < 1e-12
t.choice("s1q1", F(3, 2))

# s1q2: (x - 3)(x + 4) = 2(x - 3); brute force over a grid of rationals
sols2 = {x for x in (F(n, 4) for n in range(-400, 401)) if (x - 3) * (x + 4) == 2 * (x - 3)}
assert len(sols2) == 2
t.value("s1q2", sum(sols2))

# s1q3: angles P = 40, Q = 70 -> R = 70; PQ (opposite R) = PR (opposite Q): 3x - 1 = 2x + 4
P, Q = 40, 70
R = 180 - P - Q
assert R == Q
xs = [x for x in (F(n, 2) for n in range(-100, 101)) if 3 * x - 1 == 2 * x + 4]
t.value("s1q3", 3 * xs[0] - 1)

# s1q4: exterior angles 110 and 135
t.choice("s1q4", 180 - (180 - 110) - (180 - 135))

# s1q5: PQ = PR = 1, base angles 62 -> QR by law of cosines
apex = 180 - 2 * 62
qr = math.sqrt(2 - 2 * math.cos(math.radians(apex)))
t.qc("s1q5", [(round(qr * L, 9), round(L, 9)) for L in (1, 3.5, 10)])

# s1q6: a3 = 72, a6 = 243, geometric
r6 = None
for num in range(1, 20):
    for den in range(1, 20):
        rr = F(num, den)
        if 72 * rr ** 3 == 243:
            r6 = rr
t.value("s1q6", F(72) / r6 ** 2)

# s1q7: S_n = sum 1/(k(k+2))
def S7(n):
    return sum(F(1, k * (k + 2)) for k in range(1, n + 1))
truth7 = [
    S7(10) > F(68, 100),
    all(S7(n) < F(3, 4) for n in range(1, 300)) and all(F(3, 4) - F(1, 2) * (F(1, n + 1) + F(1, n + 2)) == S7(n) for n in range(1, 40)),
    all(S7(n) < F(1, 2) for n in range(1, 300)),
    S7(20) > F(7, 10),
    S7(40) > F(74, 100),
    S7(6) > F(6, 10),
]
t.sel("s1q7", [i for i, v in enumerate(truth7) if v])

# s1q8: sum_{k=1}^{9} (2k+1)/(k^2 (k+1)^2) vs 0.99
T8 = sum(F(2 * k + 1, k * k * (k + 1) ** 2) for k in range(1, 10))
assert F(19, 81 * 100) == F(2 * 9 + 1, 81 * 100)
t.qc("s1q8", [(T8, F(99, 100))])

# s1q9: halve if even, +5 if odd, start 12; sum of first 20
seq = [12]
while len(seq) < 20:
    a = seq[-1]
    seq.append(a // 2 if a % 2 == 0 else a + 5)
t.value("s1q9", sum(seq))

# s1q10: pattern A A B C A B, first 100 slots
pat = "AABCAB"
t.choice("s1q10", sum(1 for i in range(100) if pat[i % 6] == "A"))

# s1q11: mean of first n terms = n + 4
Sn = lambda n: n * (n + 4)
t.choice("s1q11", Sn(30) - Sn(29))

# s1q12: missing Pediatrics, percent of total
ped = 1850 - (420 + 310 + 565)
t.value("s1q12", F(ped * 100, 1850))

# s1q13: print subscribers > 8000
regions = [("North", F(30, 100), F(40, 100)), ("South", F(25, 100), F(52, 100)), ("East", F(16, 100), F(375, 1000)),
           ("West", F(20, 100), F(55, 100)), ("Central", F(9, 100), F(30, 100))]
assert sum(r[1] for r in regions) == 1
t.sel("s1q13", [i for i, (_, sh, dg) in enumerate(regions) if 80000 * sh * (1 - dg) > 8000])

# s1q14: revenue per member, 2022 -> 2024
pm22, pm24 = F(4800000, 12000), F(6300000, 14000)
inc14 = float((pm24 / pm22 - 1) * 100)
ch = [number(c) for c in t.choices("s1q14")]
t.sel("s1q14", [min(range(5), key=lambda i: abs(ch[i] - inc14))])

# s1q15: total revenue, nearest choice
rev = 41800 * F("7.99") + 28350 * F("12.49") + 9870 * F("17.99")
ch = [number(c) for c in t.choices("s1q15")]
t.sel("s1q15", [min(range(5), key=lambda i: abs(ch[i] - float(rev)))])

# s1q16: 3x - ky = 6 and 6x + 4y = c the same line: (6, 4, c) = m (3, -k, 6)
found = [(k, c) for k in range(-20, 21) for c in range(-100, 101) if 6 * (-k) == 4 * 3 and 6 * 6 == c * 3]
assert len(found) == 1
k16, c16 = found[0]
t.qc("s1q16", [(k16 + c16, 10)])

# s1q17: 3s + 5b = 34, 5s + 3b = 30
for s_ in range(0, 1001):
    for b_ in range(0, 1001):
        if 3 * s_ + 5 * b_ == 3400 and 5 * s_ + 3 * b_ == 3000:  # in cents
            s17, b17 = s_, b_
t.choice("s1q17", F(4 * s17 + 4 * b17, 100))

# s1q18: test each choice on random (n, a, d)
cands18 = [
    lambda S, n, d: (2 * S - (n - 1) * d) / (2 * n),
    lambda S, n, d: (2 * S - n * (n - 1) * d) / (2 * n),
    lambda S, n, d: (S - n * (n - 1) * d) / (2 * n),
    lambda S, n, d: 2 * S / n - (n - 1) * d,
    lambda S, n, d: (S - (n - 1) * d) / n,
]
cases = [(n, a, d) for n in (2, 3, 5, 8) for a in (F(1), F(7, 2), F(10)) for d in (F(1), F(2), F(-3, 2))]
ok18 = [i for i, f in enumerate(cands18) if all(f(F(n, 2) * (2 * a + (n - 1) * d), F(n), d) == a for n, a, d in cases)]
t.sel("s1q18", ok18)

# s1q19: simple 10% vs compound 9.5%, 2 years, $1000
simple = F(1000) * (1 + 2 * F(10, 100))
comp = F(1000) * (1 + F(95, 1000)) ** 2
t.qc("s1q19", [(simple, comp)])

# s1q20: doubling every 8 months
g = lambda tm: 2 ** (tm / 8)
truth20 = [
    abs(g(24) - 6) < 1e-12,
    abs(g(4) - 1.5) < 1e-12,
    g(13) > 3,
    abs((2 ** (1 / 8) - 1) - 0.125) < 1e-12,
    g(20) > 5,
    g(12) < 3,
]
t.sel("s1q20", [i for i, v in enumerate(truth20) if v])

# s1q21: m seniors, m juniors; count nonempty groups with more seniors (brute force), find 2m with count 93
def more_seniors(m):
    people = [("S", i) for i in range(m)] + [("J", i) for i in range(m)]
    c = 0
    for r in range(1, 2 * m + 1):
        for grp in combinations(people, r):
            s_ = sum(1 for p in grp if p[0] == "S")
            if s_ > r - s_:
                c += 1
    return c
ms = [m for m in range(1, 7) if more_seniors(m) == 93]
assert len(ms) == 1
t.choice("s1q21", 2 * ms[0])

# s1q22: |a - b| = 5, |c - b| < 3; compare |a - c| with 2
pairs22 = []
b = F(0)
for a in (b + 5, b - 5):
    for n in range(-299, 300):
        c = b + F(n, 100)  # c in (-3, 3)
        pairs22.append((abs(a - c), F(2)))
t.qc("s1q22", pairs22)

# s1q23: (1 - p)(1 - 2p) = 0.72, 0 <= p, 2p <= 1
roots23 = [x for x in ((3 + math.sqrt(9 - 8 * 0.28)) / 4, (3 - math.sqrt(9 - 8 * 0.28)) / 4) if 0 <= x and 2 * x <= 1]
assert len(roots23) == 1
t.qc("s1q23", [(round(roots23[0], 9), 0.1)])

# s1q24: x = 36/99; 15th digit after the point of 3x and of x
def digit(fr, k):
    fr = fr - (fr.numerator // fr.denominator)
    return int(fr * 10 ** k) % 10
x24 = F(36, 99)
t.qc("s1q24", [(digit(3 * x24, 15), digit(x24, 15))])

# DI d1
ports = ["Arlo", "Kestrel Bay", "Marenne", "Sutton Quay", "Velport"]
y22 = [820, 1140, 655, 480, 905]
y24 = [1015, 1210, 790, 610, 870]
ref = [12, 8, 20, 15, 10]
# s1q25: refrigerated 2024 closest to 100
rf = [F(y24[i] * ref[i], 100) for i in range(5)]
best = min(range(5), key=lambda i: abs(rf[i] - 100))
t.choice("s1q25", ports[best])
# s1q26: Arlo refrigerated / Sutton non-refrigerated, as percent
v26 = float(rf[0] / (y24[3] * F(100 - ref[3], 100)) * 100)
ch = [number(c) for c in t.choices("s1q26")]
t.sel("s1q26", [min(range(5), key=lambda i: abs(ch[i] - v26))])
# s1q27: Marenne 2022 share 16%
v27 = float((rf[2] / (y22[2] * F(16, 100)) - 1) * 100)
ch = [number(c) for c in t.choices("s1q27")]
t.sel("s1q27", [min(range(5), key=lambda i: abs(ch[i] - v27))])

t.done()
