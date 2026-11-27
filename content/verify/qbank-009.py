"""Verify every key in content/bank/quant/qbank-009.json: each answer is computed here (brute force or exact arithmetic) and compared with the key."""
from fractions import Fraction as F
import math

from keys import Keys

t = Keys("qbank-009")


def venn(sizes, total):
    """Every feasible three-set split: yields (exactly one, exactly two, all three, none)."""
    A, B, C = sizes
    for t3 in range(min(sizes) + 1):
        for ab in range(min(A, B) - t3 + 1):
            for ac in range(min(A, C) - t3 + 1):
                a = A - ab - ac - t3
                if a < 0:
                    continue
                for bc in range(min(B, C) - t3 + 1):
                    b = B - ab - bc - t3
                    c = C - ac - bc - t3
                    if b < 0 or c < 0:
                        continue
                    none = total - (a + b + c + ab + ac + bc + t3)
                    if none < 0:
                        continue
                    yield a + b + c, ab + ac + bc, t3, none


# s1q1: drivers 90, certifications 40/35/45, none allowed; most with exactly two
t.choice("s1q1", max(e2 for _, e2, _, _ in venn((40, 35, 45), 90)))

# s1q2: patrons 100, none 10, uses 80/70/20; most using exactly one vs 40
t.qc("s1q2", [(max(e1 for e1, _, _, z in venn((80, 70, 20), 100) if z == 10), 40)])

# s1q3: 2 h at 45, then 120 mi at 40
t.value("s1q3", F(2 * 45 + 120, 2 + F(120, 40)))

# s1q4: 120 m^2; 1.5 h at 24 m^2/h; then 2000 cm^2/min
mach = F(2000, 100 ** 2) * 60  # m^2 per hour
t.choice("s1q4", F(3, 2) + (120 - F(3, 2) * 24) / mach)

# s1q5: line through (-4, 6) and (2, -3): sample points, collect quadrants
m = F(-3 - 6, 2 + 4)
b = 6 - m * (-4)
quads = set()
for k in range(-400, 401):
    x = F(k, 10)
    y = m * x + b
    if x > 0 and y > 0: quads.add("I")
    if x < 0 and y > 0: quads.add("II")
    if x < 0 and y < 0: quads.add("III")
    if x > 0 and y < 0: quads.add("IV")
opts = [{"II", "IV"}, {"I", "II", "IV"}, {"II", "III", "IV"}, {"I", "III"}, {"I", "II", "III", "IV"}]
t.sel("s1q5", [i for i, o in enumerate(opts) if o == quads])

# s1q6: M(1,1) midpoint, P(-3,4)
Qx, Qy = 2 * 1 - (-3), 2 * 1 - 4
t.qc("s1q6", [(round(math.hypot(Qx + 3, Qy - 4), 9), 10)])

# s1q7: a < b < c; (a - b)(c - b) vs 0
vals = [F(k, 2) for k in range(-8, 9)]
t.qc("s1q7", [((a - b) * (c - b), 0) for a in vals for b in vals for c in vals if a < b < c])

# s1q8: -3 < x < -2, 1 < y < 2; must-be-true statements
xs = [F(-3) + F(k, 40) for k in range(1, 40)]
ys = [F(1) + F(k, 40) for k in range(1, 40)]
preds = [
    lambda x, y: x * y < x < x / y,
    lambda x, y: x / y < x < x * y,
    lambda x, y: x + y < 0 < x * x - y * y,
    lambda x, y: x - y < x * y,
    lambda x, y: x * y < -3,
    lambda x, y: y - x > 3,
]
t.sel("s1q8", [i for i, p in enumerate(preds) if all(p(x, y) for x in xs for y in ys)])

# s1q9: ones digit of 18^42
t.choice("s1q9", pow(18, 42, 10))

# s1q10: n/d = 8.35, d < 100; possible remainders
rems = {(F(835, 100) * d).numerator % d for d in range(1, 100) if (F(835, 100) * d).denominator == 1}
t.where("s1q10", lambda v: v in rems)

# s1q11: product 2160, gcd 6; lcm over all such pairs vs 360
pairs = [(a, 2160 // a) for a in range(1, 2161) if 2160 % a == 0 and math.gcd(a, 2160 // a) == 6]
t.qc("s1q11", [(a * b // math.gcd(a, b), 360) for a, b in pairs])

# s1q12: divisors of 360 strictly between 10 and 30
t.choice("s1q12", sum(1 for r in range(11, 30) if 360 % r == 0))

# s1q13: |4w - 30| <= 2 on a fine grid; max - min vs 1
ws = [F(k, 100) for k in range(0, 2001) if abs(4 * F(k, 100) - 30) <= 2]
t.qc("s1q13", [(max(ws) - min(ws), 1)])

# s1q14: |x - 6| = |2x - 3| with x >= 0 (markers start at 0); scan a fine grid
grid14 = [F(k, 8) for k in range(-800, 801)]
sols = {x for x in grid14 if abs(x - 6) == abs(2 * x - 3) and x >= 0}
opts14 = [{F(3)}, {F(-3)}, {F(-3), F(3)}, {F(1), F(3)}, {F(3), F(9)}]
t.sel("s1q14", [i for i, o in enumerate(opts14) if o == sols])

# s1q15: regular n-gon with interior angle 156
t.qc("s1q15", [(n, 15) for n in range(3, 400) if F(180 * (n - 2), n) == 156])

# s1q16: regular hexagon of area 180; AC and BD meet at P; area of BPC
pts = [(math.cos(math.pi / 3 * k), math.sin(math.pi / 3 * k)) for k in range(6)]
A_, B_, C_, D_ = pts[0], pts[1], pts[2], pts[3]


def inter(p1, p2, p3, p4):
    (x1, y1), (x2, y2), (x3, y3), (x4, y4) = p1, p2, p3, p4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    u = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    return x1 + u * (x2 - x1), y1 + u * (y2 - y1)


def area(poly):
    return abs(sum(poly[i][0] * poly[i - 1][1] - poly[i - 1][0] * poly[i][1] for i in range(len(poly)))) / 2


P_ = inter(A_, C_, B_, D_)
t.value("s1q16", round(180 * area([B_, P_, C_]) / area(pts), 9))

# s1q17
t.qc("s1q17", [(F(10 ** 50 - 10 ** 48, 10 ** 25 + 10 ** 24), 9 * 10 ** 24)])


# s1q18: round half up to hundreds
def r100(v):
    return (v + 50) // 100 * 100


cnt = [1449, 2351, 1849, 3248]
t.qc("s1q18", [(sum(r100(v) for v in cnt), r100(sum(cnt)))])

# s1q19
g = [F(k, 50) for k in range(-500, 501)]
t.qc("s1q19", [((x - 4) ** 2, 1) for x in g if (x - 1) * (x - 5) < 0 and (x - 3) * (x - 7) < 0])

# s1q20: x^3 > x and x^2 < 4
t.where("s1q20", lambda x: x ** 3 > x and x * x < 4)

# s1q21: probability of a qualifying depot among Express parcels is 3/5
rows = lambda x: [("North", 30, 10), ("South", 20, 20), ("East", 45, x)]
sol21 = []
for k in range(0, 2001):
    x = F(k, 10)
    rs = rows(x)
    expr = sum(e for _, s, e in rs)
    qual = sum(e for _, s, e in rs if s > F(1, 2) * (s + e))
    if expr and F(qual) / expr == F(3, 5):
        sol21.append(x)
assert len(sol21) == 1
t.choice("s1q21", sol21[0])

# s1q22: adults a, children a + 4, 90 <= 9a + 5(a + 4) <= 140; most people vs 20
t.qc("s1q22", [(max(2 * a + 4 for a in range(0, 100) if 90 <= 9 * a + 5 * (a + 4) <= 140), 20)])

# s1q23: 120 volunteers, 60/50/40, none 10, all three 15; P(exactly one | at least one)
outs = {(e1, e2) for e1, e2, e3, z in venn((60, 50, 40), 120) if z == 10 and e3 == 15}
assert len(outs) == 1
e1, _ = outs.pop()
t.choice("s1q23", F(e1, 120 - 10))

# s1q24: corner rectangle in right triangle with legs 12 and 6; attainable areas
areas = [F(k, 1000) * (6 - F(k, 2000)) for k in range(1, 12000)]
mx = max(areas)
t.where("s1q24", lambda v: 0 < v <= mx and (v == mx or any(a >= v for a in areas)))

# s1q25: first-time neither
t.value("s1q25", 240 - (150 + 120 - 60))

# s1q26: returning neither as the unrecorded overlap varies
neith = {160 - (90 + 100 - b) for b in range(0, 91) if 160 - (90 + 100 - b) >= 0}
t.where("s1q26", lambda v: v in neith)

# s1q27: returning photography-only equals first-time photography-only
ft_photo_only = 120 - 60
bs = [b for b in range(0, 91) if 100 - b == ft_photo_only and 160 - (90 + 100 - b) >= 0]
assert len(bs) == 1
t.choice("s1q27", 160 - (90 + 100 - bs[0]))

t.done()
