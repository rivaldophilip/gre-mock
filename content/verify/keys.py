"""Check a quant test's keys against answers computed independently, so a key in the JSON cannot drift from the math.

Use in content/verify/<id>.py (run by `npm run -s check -- <id>`; example: quant-002.py):

    from keys import Keys
    t = Keys("quant-003")
    t.qc("s1q1", [(a, b) for ...])     # QC: (Quantity A, Quantity B) over the cases tried; one outcome -> A/B/C, several -> D
    t.choice("s1q5", F(108, 10))       # MC: the choice whose number (or exact text) equals the computed answer
    t.where("s2q13", lambda x: x in ok) # MC multi: every choice whose number satisfies the predicate
    t.sel("s1q8", [0, 2, 3, 5])        # any choice type: computed indices, or letters ("C", "A C")
    t.value("s1q9", 8 * k)             # numeric entry: int, Fraction or float
    t.choices("s2q11")                 # the choice texts, $ stripped, to parse yourself
    t.done()                           # lists unchecked questions; prints "27/27 keys verified"
"""
import json
import re
import sys
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
L = "ABCDEFGHI"
QC = "ABCD"  # A greater, B greater, equal, cannot be determined


def number(text):
    """A choice's value as a Fraction, or None: 10.8, -37, 36%, 3/8, \\dfrac{23}{4}, \\dfrac74."""
    s = re.sub(r"\\[,!;]|\$|\s|\\left|\\right", "", str(text)).replace("−", "-").rstrip("%")
    m = re.fullmatch(r"(-?)\\[dt]?frac\{?(-?\d+)\}?\{?(\d+)\}?", s)
    if m:
        return Fraction(int(m[2]), int(m[3])) * (-1 if m[1] else 1)
    try:
        return Fraction(s.replace(",", ""))
    except (ValueError, ZeroDivisionError):
        return None


def close(a, b):
    return abs(Fraction(a) - Fraction(b)) < Fraction(1, 10**9) if isinstance(a, float) or isinstance(b, float) else a == b


class Keys:
    def __init__(self, test_id):
        self.test_id = test_id
        test = json.loads((ROOT / "content" / "tests" / f"{test_id}.json").read_text())
        self.q = {q["id"]: q for q in test["questions"]}
        self.checked, self.failed = set(), []

    def _q(self, qid):
        if qid not in self.q:
            raise KeyError(f"{qid} is not a question of {self.test_id} (ids: s1q1..s1q12, s2q1..s2q15)")
        return self.q[qid]

    def choices(self, qid):
        return [c.replace("$", "").strip() for c in self._q(qid).get("choices") or []]

    def _record(self, qid, ok, computed, key):
        self.checked.add(qid)
        if not ok:
            self.failed.append(f"MISMATCH {qid}: computed {computed}, key {key}")

    def _letters(self, idx):
        return " ".join(L[i] for i in sorted(idx))

    def sel(self, qid, computed):
        q = self._q(qid)
        if isinstance(computed, str):
            computed = [L.index(c) for c in computed.replace(",", " ").split()]
        idx = sorted([computed] if isinstance(computed, int) else computed)
        key = sorted(q["key"]["sel"])
        self._record(qid, idx == key, self._letters(idx), self._letters(key))

    def choice(self, qid, value):
        texts = self.choices(qid)
        hits = [i for i, c in enumerate(texts) if (c == value if isinstance(value, str) else number(c) is not None and close(number(c), value))]
        if len(hits) != 1:
            self.checked.add(qid)
            self.failed.append(f"MISMATCH {qid}: computed {value} matches {len(hits)} choices ({', '.join(texts)}); use t.sel with an index")
            return
        self.sel(qid, hits[0])

    def where(self, qid, pred):
        texts = self.choices(qid)
        vals = [number(c) for c in texts]
        if any(v is None for v in vals):
            raise ValueError(f"{qid}: choices are not all numbers ({', '.join(texts)}); use t.sel with computed indices")
        self.sel(qid, [i for i, v in enumerate(vals) if pred(v)])

    def value(self, qid, computed):
        key = self._q(qid)["key"]["value"]
        self._record(qid, close(number(key), computed), computed, key)

    def qc(self, qid, pairs):
        outcomes = {0 if a > b else 1 if b > a else 2 for a, b in pairs}
        if not outcomes:
            raise ValueError(f"{qid}: no (A, B) cases given")
        got = 3 if len(outcomes) > 1 else outcomes.pop()
        key = self._q(qid)["key"]["sel"][0]
        self._record(qid, got == key, QC[got], QC[key])

    def done(self):
        missing = [qid for qid in self.q if qid not in self.checked]
        for f in self.failed:
            print(f)
        if missing:
            print(f"not checked: {', '.join(missing)}")
        ok = len(self.checked) - len({f.split()[1].rstrip(':') for f in self.failed})
        print(f"{ok}/{len(self.q)} keys verified")
        if self.failed or missing:
            sys.exit(1)
