"""Verify every key in content/tests/quant-012.json: each answer is computed here (exact arithmetic or brute force) and compared with the key."""
from fractions import Fraction as F
import itertools
import math
import random
import re

from keys import Keys

t = Keys("quant-012")


def num(text):
    """Value of a simple choice text: $, \\$, {,}, commas, %, degrees, \\dfrac, \\cdot, powers."""
    s = text.replace("\\$", "").replace("{,}", "").replace(",", "").replace("$", "")
    s = s.replace("^\\circ", "").replace("\\%", "").replace("%", "").replace("\\left", "").replace("\\right", "")
    s = s.replace("\\cdot", "*").replace(" ", "")
    s = re.sub(r"\\(?![a-z])", "", s)
    while "\\dfrac" in s:
        s = re.sub(r"\\dfrac\{([^{}]*)\}\{([^{}]*)\}", r"((\1)/(\2))", s)
    s = s.replace("^", "**")
    s = re.sub(r"\d+\.\d+|\d+", lambda m: f'F("{m.group(0)}")', s)
    return eval(s, {"F": F})


def pick(qid, value):
    vals = [num(c) for c in t.choices(qid)]
    hits = [i for i, v in enumerate(vals) if v == value]
    assert len(hits) == 1, (qid, value, vals)
    t.sel(qid, hits)


def nearest(qid, value):
    vals = [num(c) for c in t.choices(qid)]
    d = sorted((abs(float(v) - float(value)), i) for i, v in enumerate(vals))
    assert d[0][0] < d[1][0] / 2, (qid, value, vals)
    t.sel(qid, [d[0][1]])


grid = [F(n, 4) for n in range(-40, 41)]

# s1q1: ab < 0; A = |a - b|, B = |a| + |b|
t.qc("s1q1", [(abs(a - b), abs(a) + abs(b)) for a in grid for b in grid if a * b < 0])

# s1q2: x != y, |x - 4| = |y - 4|; A = x + y, B = 8
t.qc("s1q2", [(x + y, 8) for x in grid for y in grid if x != y and abs(x - 4) == abs(y - 4)])

# s1q3: triangle with A = 50, B != C (AB != AC); bisectors of B and C meet at P; A = angle BPC, B = 115
t.qc("s1q3", [(180 - Bq / 2 - (130 - Bq) / 2, 115) for Bq in (F(k, 4) for k in range(1, 520)) if Bq != 130 - Bq])

# s1q4: 0 < x < 1; A = mean of x and 1/x, B = 1 + x
t.qc("s1q4", [((x + 1 / x) / 2, 1 + x) for x in (F(k, 1000) for k in range(1, 1000))])

# s1q5: 500 dollars -> euros at 0.90, spend 300, back at 1.08
pick("s1q5", (500 * F("0.90") - 300) * F("1.08"))

# s1q6: nickels n, dimes d: 5n + 10d = 410, swapped 10n + 5d = 340; total coins
sols = [(n, d) for n in range(0, 100) for d in range(0, 100) if 5 * n + 10 * d == 410 and 10 * n + 5 * d == 340]
assert len(sols) == 1
pick("s1q6", sum(sols[0]))

# s1q7: sides 10, 17, 21; altitude to side 10 from the Heron area
a, b, c = 10, 17, 21
s = F(a + b + c, 2)
area2 = s * (s - a) * (s - b) * (s - c)
area = F(math.isqrt(int(area2)))
assert area * area == area2
assert a * a + b * b < c * c  # obtuse: the altitude to side 10 lands outside
pick("s1q7", 2 * area / a)


# s1q8: a + b = S and ab = P rational (P != 0): a, b = (S +- sqrt(D))/2 with D = S^2 - 4P
class Q:
    """p + q*sqrt(d) with rational p, q."""
    def __init__(self, p, q, d): self.p, self.q, self.d = F(p), F(q), d
    def c(self, o): return o if isinstance(o, Q) else Q(o, 0, self.d)
    def __add__(self, o): o = self.c(o); return Q(self.p + o.p, self.q + o.q, self.d)
    __radd__ = __add__
    def __neg__(self): return Q(-self.p, -self.q, self.d)
    def __sub__(self, o): return self + (-self.c(o))
    def __rsub__(self, o): return self.c(o) - self
    def __mul__(self, o): o = self.c(o); return Q(self.p * o.p + self.q * o.q * self.d, self.p * o.q + self.q * o.p, self.d)
    __rmul__ = __mul__
    def __pow__(self, k): r = Q(1, 0, self.d); [r := r * self for _ in range(k)]; return r
    def inv(self): n = self.p * self.p - self.q * self.q * self.d; return Q(self.p / n, -self.q / n, self.d)
    def __truediv__(self, o): return self * self.c(o).inv()
    def __rtruediv__(self, o): return self.c(o) * self.inv()


# s1q8: r nonzero rational, s = p + q*sqrt(d) irrational (q != 0); which expressions are never rational.
# A rational instance rejects a choice; the kept ones are irrational by closure (s = (r+s) - r, s = rs/r, s = r*(s/r)).
exprs = [lambda r, s: r + s, lambda r, s: r * s, lambda r, s: s**2, lambda r, s: s / r,
         lambda r, s: s + 1 / s, lambda r, s: (r + s)**2]
assert len(exprs) == len(t.choices("s1q8"))
never = [True] * len(exprs)
halves = [F(k, 2) for k in range(-8, 9)]
for d in (2, 3, 5, 6, 7):
    for p in halves:
        for q in halves:
            if q == 0:
                continue
            S = Q(p, q, d)
            for r in [F(k, 2) for k in range(-6, 7) if k]:
                for i, e in enumerate(exprs):
                    if e(r, S).q == 0:
                        never[i] = False
t.sel("s1q8", [i for i, ok in enumerate(never) if ok])

# s1q9: a1 = 3, a_{n+1} = 2a_n - 1; least n with a_n > 1000
an, n = 3, 1
while an <= 1000:
    an, n = 2 * an - 1, n + 1
t.value("s1q9", n)

# DI table: department -> (share of 400, remote share, on-site days)
dept = {"Engineering": (F(40, 100), F(50, 100), 3), "Sales": (F(25, 100), F(20, 100), 4),
        "Support": (F(20, 100), F(75, 100), 4), "Finance": (F(15, 100), F(20, 100), 5)}
size = {k: 400 * sh for k, (sh, _, _) in dept.items()}
remote = {k: size[k] * r for k, (_, r, _) in dept.items()}
assert sum(size.values()) == 400 and all(v.denominator == 1 for v in list(size.values()) + list(remote.values()))

# s1q10: non-remote Finance employees as a multiple of non-remote Support employees
pick("s1q10", (size["Finance"] - remote["Finance"]) / (size["Support"] - remote["Support"]))

# s1q11: E(X), X = on-site days (0 if remote), employee chosen at random
pick("s1q11", sum((size[k] - remote[k]) * dept[k][2] for k in dept) / 400)

# s1q12: Finance, draws without replacement; first remote is the 3rd draw (brute force over orderings of the first 3)
N, R = int(size["Finance"]), int(remote["Finance"])
people = [1] * R + [0] * (N - R)  # 1 = remote
fav = sum(1 for x, y, z in itertools.permutations(range(N), 3) if people[x] == 0 and people[y] == 0 and people[z] == 1)
tot = N * (N - 1) * (N - 2)
nearest("s1q12", F(fav, tot))

# s2q1: f odd with period 4, f(1) = 3, on the integers mod 4; A = f(3), B = f(2)
pairs = []
for vals in itertools.product(range(-5, 6), repeat=4):
    if vals[1] == 3 and all(vals[(-x) % 4] == -vals[x] for x in range(4)):
        pairs.append((vals[3], vals[2]))
assert pairs
t.qc("s2q1", pairs)

# s2q2: 8 people in a row at random; A = P(Ann, Bob not adjacent and neither at an end), B = 3/8
good = sum(1 for p in itertools.permutations(range(8)) if abs(p[0] - p[1]) > 1 and p[0] not in (0, 7) and p[1] not in (0, 7))
t.qc("s2q2", [(F(good, math.factorial(8)), F(3, 8))])

# s2q3: f even (random even polynomials), g(x) = f(x - 3); A = g(-2), B = g(8)
random.seed(12)
pairs = []
for _ in range(200):
    co = [F(random.randint(-9, 9), random.randint(1, 5)) for _ in range(4)]
    f = lambda x, co=co: co[0] + co[1] * x**2 + co[2] * x**4 + co[3] * x**6
    g = lambda x, f=f: f(x - 3)
    pairs.append((g(-2), g(8)))
t.qc("s2q3", pairs)

# s2q4: normal mean 50, sd 4; A = P(54 < W < 62), B = 0.20 (exact normal and the 68-95-99.7 rule)
Phi = lambda z: 0.5 * (1 + math.erf(z / math.sqrt(2)))
t.qc("s2q4", [(Phi((62 - 50) / 4) - Phi((54 - 50) / 4), 0.20), ((F(997, 1000) - F(68, 100)) / 2, F(20, 100))])

# s2q5: cone r = 6, h = 12, vertex down, water depth 6 -> poured into a cylinder of radius 3; pi cancels
rw = F(6, 12) * 6
vol = F(1, 3) * rw**2 * 6
t.qc("s2q5", [(vol / 3**2, 3)])

# s2q6: line of negative slope m through (2, 3), triangle with the axes of area 12
ms = [m for m in (-F(k, 60) for k in range(1, 1200)) if F(1, 2) * (2 - 3 / m) * (3 - 2 * m) == 12]
assert len(ms) == 1
pick("s2q6", ms[0])

# s2q7: positive integer pairs satisfying both equations
pick("s2q7", sum(1 for x in range(1, 200) for y in range(1, 200) if 4 * x + 6 * y == 90 and 6 * x + 9 * y == 135))

# s2q8: A, B on the unit circle with angle OAB = 25; C on the minor arc (opposite side of AB from O)
def ang(p, v, q):
    a1 = (p[0] - v[0], p[1] - v[1]); a2 = (q[0] - v[0], q[1] - v[1])
    return math.degrees(math.acos((a1[0] * a2[0] + a1[1] * a2[1]) / (math.hypot(*a1) * math.hypot(*a2))))
pt = lambda deg: (math.cos(math.radians(deg)), math.sin(math.radians(deg)))
Ap, Bp, O = pt(0), pt(130), (0.0, 0.0)
assert abs(ang(O, Ap, Bp) - 25) < 1e-9
vals = set()
for th in range(5, 130, 5):
    Cp = pt(th)  # minor arc between A and B: same side as the chord's far side from O
    side = lambda P: (Bp[0] - Ap[0]) * (P[1] - Ap[1]) - (Bp[1] - Ap[1]) * (P[0] - Ap[0])
    assert side(Cp) * side(O) < 0
    vals.add(round(ang(Ap, Cp, Bp), 6))
assert len(vals) == 1
pick("s2q8", F(round(vals.pop())))

# s2q9: plan A = 1500 + 4% of S; plan B = 10% of (S - 15000) above 15000
ss = [S for S in range(0, 300001, 100) if 1500 + F(4, 100) * S == F(10, 100) * max(0, S - 15000)]
assert len(ss) == 1
pick("s2q9", ss[0])

# s2q10: 9.95^2 - 9.05^2 (exact decimals)
nearest("s2q10", F("9.95") ** 2 - F("9.05") ** 2)

# s2q11: compound minus simple over 2 years on 15000 is 54; simple interest at that rate
rs = [r for r in (F(k, 10000) for k in range(1, 3000)) if 15000 * ((1 + r) ** 2 - 1) - 15000 * 2 * r == 54]
assert len(rs) == 1
pick("s2q11", 15000 * 2 * rs[0])

# s2q12: regular hexagon of area 36; area of triangle ABD (shoelace)
H = [pt(60 * k) for k in range(6)]
shoe = lambda P: abs(sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))) / 2
nearest("s2q12", 36 * shoe([H[0], H[1], H[3]]) / shoe(H))

# s2q13: 100 households, groups 90, 80, 70; which counts of all-three are feasible
def feasible(t3, n=100, a=90, b=80, c=70):
    for ab in range(0, a + 1):
        for ac in range(0, a - t3 - ab + 1):
            for bc in range(0, min(b - t3 - ab, c - t3 - ac) + 1):
                ao, bo, co = a - t3 - ab - ac, b - t3 - ab - bc, c - t3 - ac - bc
                if min(ao, bo, co) >= 0 and t3 + ab + ac + bc + ao + bo + co <= n:
                    return True
    return False
t.sel("s2q13", [i for i, ch in enumerate(t.choices("s2q13")) if feasible(int(num(ch)))])

# s2q14: positive k with 12^k dividing 9!
fact9 = math.factorial(9)
t.sel("s2q14", [i for i, ch in enumerate(t.choices("s2q14")) if fact9 % 12 ** int(num(ch)) == 0])

# s2q15: 60 numbers, 75% below v; 20 added, 60% of 80 below v; how many added are below v
below = [k for k in range(0, 21) if F(75, 100) * 60 + k == F(60, 100) * 80]
assert len(below) == 1
t.value("s2q15", below[0])

t.done()
