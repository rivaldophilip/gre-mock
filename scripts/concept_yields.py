#!/usr/bin/env python3
"""Recompute data/concepts.json `officialCount` and `yield` from the official quant items (local corpus).

officialCount: how often the concept is tested in medium-or-harder official items (P+ < 60, or an OG set
labelled medium/hard). The primary concept counts 1, a secondary one 0.5.
yield = 0.5 * hand_yield + 0.5 * officialCount / max(officialCount), i.e. frequency relative to the most-tested concept. hand_yield is the hand-set weight that favours
hard-question drivers (remainders, abs-value inequalities, counting with restrictions, ...).

usage: python3 scripts/concept_yields.py   (after scripts/merge_reference.py)
"""
import json, os, sys

ROOT = os.path.join(os.path.dirname(__file__), "..")
ITEMS = os.path.join(ROOT, "..", "books", "extracted", "reference", "items.jsonl")
CONCEPTS = os.path.join(ROOT, "data", "concepts.json")
QUANT = {"qc", "mc", "mc_multi", "numeric", "di"}


def hard_enough(r):
    if r.get("pplus") is not None:
        return r["pplus"] < 60
    return r.get("difficulty") in ("medium", "hard")


concepts = json.load(open(CONCEPTS))
count = {c["id"]: 0.0 for c in concepts}
n = 0
for line in open(ITEMS):
    r = json.loads(line)
    if r.get("type") not in QUANT or not hard_enough(r):
        continue
    n += 1
    for i, c in enumerate(r.get("concepts") or []):
        if c in count:
            count[c] += 1.0 if i == 0 else 0.5

top_count = max(count.values()) or 1.0
for c in concepts:
    c["officialCount"] = count[c["id"]]
    c["yield"] = round(0.5 * c["hand_yield"] + 0.5 * count[c["id"]] / top_count, 3)
json.dump(concepts, open(CONCEPTS, "w"), indent=1)
open(CONCEPTS, "a").write("\n")
top = sorted(concepts, key=lambda c: -c["officialCount"])[:8]
print(f"{n} medium/hard official quant items; top:", ", ".join(f"{c['id']}={c['officialCount']:g}" for c in top), file=sys.stderr)
