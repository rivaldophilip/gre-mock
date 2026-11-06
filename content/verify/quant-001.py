#!/usr/bin/env python3
"""Computational check of every key in content/tests/quant-001.json (never shipped to the app)."""
import json, itertools, math
from fractions import Fraction as F

T = json.load(open("content/tests/quant-001.json"))
K = {q["id"]: q["key"] for q in T["questions"]}
ok = []
def check(qid, cond, msg=""):
    assert cond, f"{qid} FAILED {msg}"
    ok.append(qid)
def key(qid): return K[qid].get("sel") or K[qid]["value"]

# QC helper: sample grid -> set of outcomes {0:A>B,1:B>A,2:equal}
def outcomes(pairs):
    s = set()
    for a, b in pairs:
        s.add(0 if a > b else 1 if b > a else 2)
    return s
def qc_key(o): return 3 if len(o) > 1 else next(iter(o))

# s1q1: 0<x<1  A=1/x  B=1+x
o = outcomes((1/F(x, 1000), 1 + F(x, 1000)) for x in range(1, 1000))
check("s1q1", qc_key(o) == key("s1q1")[0] and o == {0, 1})
# s1q2: |x+2|<5, x real  A=x^2 B=49
o = outcomes((F(x, 100)**2, 49) for x in range(-699, 300) if abs(F(x, 100) + 2) < 5)
check("s1q2", qc_key(o) == key("s1q2")[0])
# s1q3: larger square area 64 -> circle d=8 -> inscribed square area d^2/2 = 32 vs 30
check("s1q3", F(8*8,2) == 32 and key("s1q3")[0] == (0 if 32 > 30 else 1))
# s1q4
xs = {x for y in range(1, 100) for x in range(y + 1, 100) if x * x - y * y == 45}
o = outcomes((x, 9) for x in xs)
check("s1q4", xs == {7, 9, 23} and qc_key(o) == key("s1q4")[0])
# s1q5: 10L alcohol, 10/(40+w)=0.2
check("s1q5", [F(10, 40 + w) == F(1, 5) for w in (5, 8, 10, 12, 15)] == [False, False, True, False, False] and key("s1q5") == [2])
# s1q6
r = (17**40 - 2 * 11**25) % 6
check("s1q6", r == 3 and [1, 2, 3, 4, 5][key("s1q6")[0]] == r)
# s1q7 brute force
cnt = 0
for p in itertools.permutations(range(8)):
    a, b = p.index(0), p.index(1)
    if a in (0, 7) or b in (0, 7) or abs(a - b) == 1: continue
    cnt += 1
check("s1q7", cnt == 14400 and ["9,360", "10,800", "12,960", "14,400", "15,120"][key("s1q7")[0]] == "14,400")
# s1q8
prods = {x * y for x in range(-3, 5) for y in range(1, 6)}
ch = [-16, -15, 13, 16, 18, 20]
check("s1q8", [i for i, c in enumerate(ch) if c in prods] == sorted(key("s1q8")))
# s1q9
check("s1q9", F(72 * 12 + 84 * 24, 36) == 80 and key("s1q9") == "24")
# DI table
rev = {"North": (48, 60), "South": (36, 45), "East": (30, 33), "West": (24, 42)}
t19 = sum(v[0] for v in rev.values()); t23 = sum(v[1] for v in rev.values())
assert (t19, t23) == (138, 180)
o19 = sum(v[0] for k, v in rev.items() if k != "North"); o23 = sum(v[1] for k, v in rev.items() if k != "North")
pct = 100 * (o23 - o19) / o19
check("s1q10", round(pct) == 33 and ["25%", "30%", "33%", "40%", "45%"][key("s1q10")[0]] == "33%")
fell = [i for i, (k, v) in enumerate(rev.items()) if F(v[1], t23) < F(v[0], t19)]
check("s1q11", fell == sorted(key("s1q11")))
growth = F(42 - 24, 4)
yr = next(2023 + t for t in range(1, 500) if 42 + growth * t > 138 + 2 * t)
check("s1q12", yr == 2062 and key("s1q12") == "2062")
# s2q1
from math import comb
a = F(comb(5, 4) + comb(5, 5), 32); b = F(comb(5, 2), 32)
check("s2q1", key("s2q1")[0] == (0 if a > b else 1 if b > a else 2) and key("s2q1")[0] == 1)
# s2q2: any n -> same SD. brute force on random-ish sets with mean 50, sd 6
import random, statistics
random.seed(1)
for _ in range(20):
    n = random.randint(3, 12)
    base = [random.uniform(30, 70) for _ in range(n)]
    m = statistics.fmean(base); sd = statistics.pstdev(base)
    base = [50 + (x - m) * 6 / sd for x in base]            # rescale to mean 50, sd 6
    assert abs(statistics.fmean(base) - 50) < 1e-9 and abs(statistics.pstdev(base) - 6) < 1e-9
    new = base + [44, 56]
    assert abs(statistics.pstdev(new) - 6) < 1e-9
check("s2q2", key("s2q2")[0] == 2)
# s2q3: exact enumeration of ordered draws
cards = ["R"] * 5 + ["B"] * 3
draws = [(i, j) for i in range(8) for j in range(8) if i != j]
p2 = F(sum(cards[j] == "R" for i, j in draws), len(draws))
p2g = F(sum(cards[i] == "R" and cards[j] == "R" for i, j in draws), sum(cards[i] == "R" for i, j in draws))
check("s2q3", p2 == F(5, 8) and p2g == F(4, 7) and key("s2q3")[0] == 0)
# s2q4
o = outcomes((x + y, 12) for x in range(1, 37) for y in range(1, 37) if x * y == 36)
check("s2q4", qc_key(o) == key("s2q4")[0])
# s2q5
def d(m): return sum(1 for k in range(1, m + 1) if m % k == 0)
o = outcomes((d(n * n), 3 * d(n)) for n in range(1, 400))
check("s2q5", qc_key(o) == key("s2q5")[0] and d(900) == 27 and d(30) == 8)
# s2q6
balls = ["R"] * 4 + ["B"] * 6
pairs = list(itertools.combinations(range(10), 2))
atleast = [p for p in pairs if "R" in (balls[p[0]], balls[p[1]])]
both = [p for p in pairs if balls[p[0]] == balls[p[1]] == "R"]
pr = F(len(both), len(atleast))
check("s2q6", pr == F(1, 5) and key("s2q6")[0] == 1)
# s2q7: square in semicircle r=5 -> s^2 = 20
s2 = F(100, 5)
check("s2q7", s2 == 20 and (s2 / 4 + s2) == 25 and key("s2q7")[0] == 1)
# s2q8
r = (pow(5, 100, 13) + pow(7, 100, 13)) % 13
check("s2q8", r == 10 and [2, 6, 8, 10, 12][key("s2q8")[0]] == 10)
# s2q9
n = sum(1 for x in range(-100, 100) if abs(x - 3) + abs(x + 2) <= 9)
check("s2q9", n == 10 and [8, 9, 10, 11, 12][key("s2q9")[0]] == 10)
# s2q10: 13-14-15 triangle, altitude to the side of length 15
area = math.sqrt(21 * 8 * 7 * 6)
check("s2q10", abs(area - 84) < 1e-9 and F(2 * 84, 15) == F(56, 5) and key("s2q10")[0] == 1)
# s2q11: min f(f(x)) over reals via fine grid + exact
f = lambda x: x * x - 4 * x + 7
m = min(f(f(F(i, 1000))) for i in range(-5000, 9000))
check("s2q11", m == 4 and key("s2q11")[0] == 0)
# s2q12: max number owning exactly one pet; both >= 30+28-50
best = max((30 - b) + (28 - b) for b in range(0, 29) if 30 + 28 - b <= 50)
check("s2q12", best == 42 and [38, 40, 42, 46, 50][key("s2q12")[0]] == 42)
# s2q13: sample the region; statements must hold for all samples; C and D must fail somewhere
pts = [(F(-i, 20), F(j, 20)) for i in range(1, 20) for j in range(1, 20)]
stm = [lambda a, b: a * b > -1, lambda a, b: a + b > -1, lambda a, b: b - a < 1,
       lambda a, b: a * a > b * b, lambda a, b: a**3 < a * a * b, lambda a, b: 1 / a < 1 / b]
holds = [i for i, s in enumerate(stm) if all(s(a, b) for a, b in pts)]
check("s2q13", holds == sorted(key("s2q13")))
# s2q14
zs = {z for x in range(1, 121) for y in range(x + 1, 121) for z in range(y + 1, 121) if x * y * z == 120}
ch = [6, 9, 12, 16, 24, 45]
check("s2q14", [i for i, c in enumerate(ch) if c in zs] == sorted(key("s2q14")))
# s2q15
n = sum(1 for k in range(1, 201) if (k % 2 == 0 or k % 3 == 0) and k % 5 != 0)
check("s2q15", n == 106 and key("s2q15") == "106")

assert len(set(ok)) == len(T["questions"]) == 27, (len(set(ok)), "questions unchecked: " + str(set(K) - set(ok)))
print(f"quant-001: all {len(ok)} answers verified")
