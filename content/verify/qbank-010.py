"""Verify every key in content/bank/quant/qbank-010.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
from itertools import permutations, product
import math

from keys import Keys, number

t = Keys("qbank-010")

# s1q1: missing probability, then E(X)
p1 = {0: F(10, 100), 1: F(25, 100), 3: F(20, 100), 4: F(15, 100)}
p1[2] = 1 - sum(p1.values())
t.choice("s1q1", sum(k * v for k, v in p1.items()))


def median(dist):
    acc = F(0)
    for k in sorted(dist):
        acc += dist[k]
        if acc >= F(1, 2):
            assert acc > F(1, 2), "median not unique"
            return k


# s1q2: a + b = 0.55, mean 3.05; median against 2.5
sols = []
for a100 in range(1, 55):
    a, b = F(a100, 100), F(55 - a100, 100)
    dist = {1: F(20, 100), 2: a, 3: b, 5: F(15, 100), 8: F(10, 100)}
    if sum(k * v for k, v in dist.items()) == F(305, 100):
        sols.append(dist)
assert len(sols) == 1
t.qc("s1q2", [(median(sols[0]), F(5, 2))])

# s1q3: ordered recitals of 4 from 9 with at least one of 3 Bach pieces
t.choice("s1q3", sum(1 for p in permutations(range(9), 4) if any(x < 3 for x in p)))

# s1q4: three-digit codes, all digits even, distinct, > 500
t.choice("s1q4", sum(1 for n in range(501, 1000)
                     if len(set(str(n))) == 3 and all(int(c) % 2 == 0 for c in str(n))))

# s1q5: piecewise-linear graph
V5 = [(-4, 1), (-1, 4), (1, 0), (5, 2)]


def f5(x):
    for (x0, y0), (x1, y1) in zip(V5, V5[1:]):
        if x0 <= x <= x1:
            return F(y0) + F(y1 - y0, x1 - x0) * (x - x0)


t.qc("s1q5", [(f5(-2), f5(0) + f5(3))])

# s1q6: x^2 shifted right 2, then (x, y) -> (2x, y)
final6 = lambda x: (x / 2 - 2) ** 2
cands6 = [lambda x: (x / 2 - 2) ** 2, lambda x: F(1, 4) * (x - 4) ** 2, lambda x: (2 - x / 2) ** 2,
          lambda x: (x / 2 - 1) ** 2, lambda x: F(1, 4) * (x - 2) ** 2, lambda x: F(1, 2) * (x - 4) ** 2]
# check the transformation pointwise: (u, u^2) -> (2(u + 2), u^2)
for u in range(-10, 11):
    assert final6(F(2 * (u + 2))) == u * u
xs6 = [F(k, 3) for k in range(-30, 31)]
t.sel("s1q6", [i for i, g in enumerate(cands6) if all(g(x) == final6(x) for x in xs6)])

# s1q7: l: y = 1, m: y = 0, P = (0, 1); t at 70 degrees through P; R = (r, 0), r != q
q7 = -1 / math.tan(math.radians(70))  # Q's x-coordinate
angs7 = []
for k in range(1, 200001):
    for sgn in (1, -1):
        r = q7 + sgn * k * 0.0005
        v1 = (0 - r, 1.0)
        v2 = (q7 - r, 0.0)
        c = (v1[0] * v2[0] + v1[1] * v2[1]) / math.hypot(*v1) / math.hypot(*v2)
        angs7.append(math.degrees(math.acos(max(-1, min(1, c)))))
lo7, hi7 = min(angs7), max(angs7)
assert lo7 < 1 and 109.9 < hi7 < 110
t.where("s1q7", lambda v: 0 < v < 110)

# s1q8: vertical angle 40 at P, exterior 120 at Q
t.choice("s1q8", 180 - 40 - (180 - 120))

# s1q9: directions +-40 +-70 +-50 from OA; angle AOD is the smaller angle
poss9 = set()
for s in product((1, -1), repeat=3):
    d = (s[0] * 40 + s[1] * 70 + s[2] * 50) % 360
    poss9.add(min(d, 360 - d))
assert poss9 == {20, 60, 80, 160}
t.where("s1q9", lambda v: v in poss9)

# s1q10: angle between l2 and l3 is 35, exterior angle at Q 130; x = angle ORP
oqr = 180 - 130
orq = 180 - 35 - oqr
t.choice("s1q10", 180 - orq)

# s1q11: MON = AON - AOM = AOC/2 - AOB/2
sol11 = [c for c in range(49, 180) if F(c, 2) - F(48, 2) == 17]
assert len(sol11) == 1
t.value("s1q11", sol11[0])

# s1q12: old = 1.18 new, old - new = 36
new12 = F(36) / F(18, 100)
t.qc("s1q12", [(new12 + 36, 230)])

# s1q13: out of 100: 25 out of town, 15 out-of-town campers, 10 local campers
t.qc("s1q13", [(F(15, 15 + 10) * 100, F(15, 25) * 100)])

# s1q14: side x1.5
t.choice("s1q14", (F(3, 2) ** 2 - 1) * 100)

# s1q15: x(60 - 2x), greatest over a fine grid
t.choice("s1q15", max(F(k, 100) * (60 - 2 * F(k, 100)) for k in range(0, 3001)))


# s1q16: x = +-sqrt(d), d a positive non-square rational; numbers p + q sqrt(d)
class S:
    def __init__(s, p, q, d):
        s.p, s.q, s.d = F(p), F(q), d

    def __add__(s, o):
        o = o if isinstance(o, S) else S(o, 0, s.d)
        return S(s.p + o.p, s.q + o.q, s.d)

    __radd__ = __add__

    def __mul__(s, o):
        o = o if isinstance(o, S) else S(o, 0, s.d)
        return S(s.p * o.p + s.q * o.q * s.d, s.p * o.q + s.q * o.p, s.d)

    __rmul__ = __mul__

    def inv(s):
        n = s.p * s.p - s.q * s.q * s.d
        return S(s.p / n, -s.q / n, s.d)


exprs16 = [lambda x: x * x * x, lambda x: (x + 1) * (x + 1), lambda x: x + x.inv(),
           lambda x: (x + x.inv()) * (x + x.inv()), lambda x: x * x * x + x]
ds16 = [F(2), F(3), F(1, 2), F(5, 9), F(7), F(8, 3)]
t.sel("s1q16", [i for i, e in enumerate(exprs16)
                if all(e(S(0, sg, d)).q == 0 for d in ds16 for sg in (1, -1))])


# s1q17: E = 1/(1 - 1/(1 - 1/x)); a value v is possible if some x gives it
def E17(x):
    try:
        return 1 / (1 - 1 / (1 - 1 / x))
    except ZeroDivisionError:
        return None


grid17 = [F(n, 12) for n in range(-12 * 12, 12 * 12 + 1)]
vals17 = {E17(x) for x in grid17} - {None}
t.where("s1q17", lambda v: F(v).limit_denominator(1000) in vals17)


# s1q18: a sum terminates when its reduced denominator has only 2s and 5s
def term(fr):
    d = fr.denominator
    for p in (2, 5):
        while d % p == 0:
            d //= p
    return d == 1


sums18 = [F(1, 6) + F(1, 3), F(1, 3) + F(1, 12), F(1, 15) + F(1, 10), F(2, 7) + F(3, 14),
          F(1, 6) + F(1, 30), F(1, 12) + F(1, 20)]
t.sel("s1q18", [i for i, s in enumerate(sums18) if term(s)])

# s1q19: domain of sqrt(6 - 2x)/(x + 1) on a grid
grid19 = [F(n, 8) for n in range(-80, 81)]
dom19 = lambda x: 6 - 2 * x >= 0 and x != -1
preds19 = [lambda x: x <= 3 and x != -1, lambda x: x < 3 and x != -1, lambda x: x <= 3,
           lambda x: x >= 3, lambda x: -1 < x <= 3]
t.sel("s1q19", [i for i, p in enumerate(preds19) if all(p(x) == dom19(x) for x in grid19)])

# s1q20: integers in [-6, 6] with (x^2 - 4)/(x - 5) >= 0
t.value("s1q20", sum(1 for x in range(-6, 7) if x != 5 and F(x * x - 4, x - 5) >= 0))

# s1q21: circle radius 5 centered at origin; chord side at height h, tangent side at y = -5; side s = h + 5
sols21 = []
for k in range(1, 100001):
    s = k * 0.0001
    h = s - 5
    if s > 1 and abs(h) <= 5 and abs((s / 2) ** 2 + h * h - 25) < 2e-3:
        sols21.append(s)
# also the square on the far side: tangent at y = 5 above, chord at 5 - s ... symmetric; outward squares fail
assert all(abs(x - 8) < 0.01 for x in sols21) and sols21
t.where("s1q21", lambda v: abs(v - 8) < 1e-9)

# s1q22: mn + m + n even; compare (-1)^m with (-1)^(n + 1)
t.qc("s1q22", [(F(-1) ** m, F(-1) ** (n + 1)) for m in range(-20, 21) for n in range(-20, 21) if (m * n + m + n) % 2 == 0])

# s1q23: construct with AD = BD = BC = 1, angle A = 40; check D strictly between A and C; compare AB, AC
A = (0.0, 0.0)
AB = 2 * math.cos(math.radians(40))  # isosceles ABD with apex D, base angles 40
B = (AB * math.cos(math.radians(40)), AB * math.sin(math.radians(40)))
D = (1.0, 0.0)
# C on the x-axis beyond D with BC = 1
cx = B[0] + math.sqrt(1 - B[1] ** 2)
C = (cx, 0.0)
assert abs(math.dist(B, D) - 1) < 1e-12 and abs(math.dist(B, C) - 1) < 1e-12 and 0 < D[0] < C[0]
t.qc("s1q23", [(round(math.dist(A, B), 9), round(math.dist(A, C), 9))])

# s1q24: real area 192 m^2, scale 1:40, answer in cm^2
t.value("s1q24", F(192) / 40 ** 2 * 100 ** 2)

# DI d1: claims per policyholder
pX = {0: F(40, 100), 1: F(25, 100), 2: F(20, 100), 3: F(10, 100), 4: F(5, 100)}

# s1q25: uniform on [5, 25], P(T > mean + 4)
lo, hi = 5, 25
t.choice("s1q25", F(hi - (F(lo + hi, 2) + 4), hi - lo))

# s1q26: Y = X given X >= 1: mean (nearest hundredth) and median
pos = sum(v for k, v in pX.items() if k >= 1)
pY = {k: v / pos for k, v in pX.items() if k >= 1}
meanY = sum(k * v for k, v in pY.items())
want26 = f"Mean ${round(float(meanY), 2):.2f}$, median ${median(pY)}$"
t.sel("s1q26", [i for i, c in enumerate(t.choices("s1q26")) if c.replace("$", "") == want26.replace("$", "")])

# s1q27: pay 1200 per claim, minus 400 once if X >= 1
t.choice("s1q27", sum(v * (1200 * k - (400 if k >= 1 else 0)) for k, v in pX.items()))

t.done()
