#!/usr/bin/env python3
"""Merge the per-assignment parse outputs into ../books/extracted/reference/items.jsonl (local only)."""
import glob, json, os, sys
ref = os.path.join(os.path.dirname(__file__), "..", "..", "books", "extracted", "reference")
out, n, types = [], 0, {}
for f in sorted(glob.glob(os.path.join(ref, "*.jsonl"))):
    if os.path.basename(f) == "items.jsonl" or "explanations" in f:
        continue
    for line in open(f):
        line = line.strip()
        if not line:
            continue
        r = json.loads(line)
        r.setdefault("pplus", None); r.setdefault("difficulty", None)
        out.append(r); n += 1
        types[r.get("type")] = types.get(r.get("type"), 0) + 1
with open(os.path.join(ref, "items.jsonl"), "w") as fh:
    for r in out:
        fh.write(json.dumps(r, ensure_ascii=False) + "\n")
print(n, "records", types, file=sys.stderr)
