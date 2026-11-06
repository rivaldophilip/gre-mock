#!/usr/bin/env python3
"""Merge the per-assignment parse outputs into ../books/extracted/reference/items.jsonl (local only).

Then apply the image-based repairs in reference/fixes/*.jsonl. The text extraction lost most quant math
and every figure, so those items were re-transcribed from the page images. A repair line holds
{id, stem, qa, qb, choices, figure, answer, answer_check, concepts, hard_driver, page} and overrides
those fields on the record with the same id.

Reading items get their skill tags (data/rc_skills.json ids, primary first) from reference/rc_skills.jsonl,
stored in the same `concepts` field the quant items use.
"""
import glob, json, os, sys

ref = os.path.join(os.path.dirname(__file__), "..", "..", "books", "extracted", "reference")
concepts_file = os.path.join(os.path.dirname(__file__), "..", "data", "concepts.json")
skills_file = os.path.join(os.path.dirname(__file__), "..", "data", "rc_skills.json")
VALID = {c["id"] for c in json.load(open(concepts_file))} | {c["id"] for c in json.load(open(skills_file))}
ALIAS = {"qc-hidden-cases": "number-sense-qc"}  # early spec name for the QC hidden-case concept

out, n, types = [], 0, {}
for f in sorted(glob.glob(os.path.join(ref, "*.jsonl"))):
    if os.path.basename(f) in ("items.jsonl", "rc_skills.jsonl") or "explanations" in f:
        continue
    for line in open(f):
        line = line.strip()
        if not line:
            continue
        r = json.loads(line)
        r.setdefault("pplus", None); r.setdefault("difficulty", None)
        out.append(r); n += 1
        types[r.get("type")] = types.get(r.get("type"), 0) + 1

by_id = {r["id"]: r for r in out}
fixed = checks = 0
check_counts = {}
for f in sorted(glob.glob(os.path.join(ref, "fixes", "*.jsonl"))):
    for line in open(f):
        line = line.strip()
        if not line:
            continue
        p = json.loads(line)
        r = by_id.get(p["id"])
        if r is None or p.get("answer_check") == "not_found":
            continue
        for k in ("stem", "qa", "qb", "choices", "figure", "hard_driver", "page"):
            if p.get(k) not in (None, "", []) or k in ("qa", "qb", "figure"):
                r[k] = p.get(k)
        if p.get("answer") not in (None, ""):
            r["answer"] = p["answer"]
        cs = []
        for c in p.get("concepts") or []:
            c = ALIAS.get(c, c)
            if c in VALID and c not in cs:
                cs.append(c)
        if cs:
            r["concepts"] = cs
        r["has_figure"] = bool(p.get("figure")) or r.get("has_figure", False)
        r["answer_check"] = p.get("answer_check")
        r["repaired"] = True
        r.pop("ocr_note", None)
        fixed += 1
        check_counts[p.get("answer_check")] = check_counts.get(p.get("answer_check"), 0) + 1

skilled = 0
skills_path = os.path.join(ref, "rc_skills.jsonl")
if os.path.exists(skills_path):
    for line in open(skills_path):
        p = json.loads(line)
        r = by_id.get(p["id"])
        if r is not None and all(s in VALID for s in p["skills"]):
            r["concepts"] = p["skills"]
            skilled += 1

with open(os.path.join(ref, "items.jsonl"), "w") as fh:
    for r in out:
        fh.write(json.dumps(r, ensure_ascii=False) + "\n")
print(n, "records", types, file=sys.stderr)
print(fixed, "repaired from page images", check_counts, file=sys.stderr)
print(skilled, "reading items tagged with skills", file=sys.stderr)
