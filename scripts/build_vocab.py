#!/usr/bin/env python3
"""Build data/vocab.json from Vince's xlsx + popular_words.txt (+ optional extras). stdlib only.

usage: python3 scripts/build_vocab.py [--xlsx PATH] [--ets reference/*-words.txt ...]

Reads the xlsx directly (zip + xml). Sheet 2 holds the words; columns B..I are the lists;
cell fill: yellow (FFF2CC) = common to other lists, pink (F4CCCC) = probably won't be tested.
"""
import argparse, json, re, sys, unicodedata, zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
LISTS = ["Vince", "GregMat", "Magoosh", "Manhattan", "PrepScholar", "PowerScore", "GreenlightBasic", "GreenlightAdvanced"]
COLS = "BCDEFGHI"
YELLOW, PINK = "FFF2CC", "F4CCCC"


def fold(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z' -]", "", s.lower()).strip()


def split_forms(raw: str):
    raw = raw.strip()
    parts = re.split(r"\s+or\s+|\s*/\s*|,\s*|;\s*", raw)
    return [fold(p) for p in parts if fold(p)]


def read_xlsx(path):
    z = zipfile.ZipFile(path)
    ss = [
        "".join(t.text or "" for t in si.iter("{%s}t" % NS["m"]))
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS)
    ]
    styles = ET.fromstring(z.read("xl/styles.xml"))
    fills = []
    for f in styles.find("m:fills", NS):
        fg = f.find(".//m:fgColor", NS)
        fills.append((fg.get("rgb") or "")[2:] if fg is not None else "")
    xf_fill = [fills[int(x.get("fillId", 0))] for x in styles.find("m:cellXfs", NS)]
    sheet = ET.fromstring(z.read("xl/worksheets/sheet2.xml"))
    cells = defaultdict(dict)  # list name -> [(word, colour)]
    for row in sheet.iter("{%s}row" % NS["m"]):
        if int(row.get("r")) == 1:
            continue
        for c in row.findall("m:c", NS):
            col = re.match(r"[A-Z]+", c.get("r")).group(0)
            if col not in COLS:
                continue
            v = c.find("m:v", NS)
            if v is None or v.text is None:
                continue
            txt = ss[int(v.text)] if c.get("t") == "s" else v.text
            colour = xf_fill[int(c.get("s", 0))] if c.get("s") else ""
            cells[LISTS[COLS.index(col)]][len(cells[LISTS[COLS.index(col)]])] = (txt, colour)
    return cells


def lemma_key(word, universe):
    """Fold simple inflections onto a base form only if the base exists in the universe."""
    for suf, rep in (("ies", "y"), ("es", ""), ("s", ""), ("ed", ""), ("ed", "e"), ("ing", ""), ("ing", "e"), ("ly", "")):
        if word.endswith(suf) and len(word) - len(suf) >= 3:
            base = word[: -len(suf)] + rep
            if base in universe and base != word:
                return base
    return word


def slug(w):
    return re.sub(r"[^a-z0-9]+", "-", w).strip("-")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--xlsx", default=str(ROOT.parent / "Vince's GRE Vocab Compilation and Curation.xlsx"))
    ap.add_argument("--ets", nargs="*", default=[])
    ap.add_argument("--extra", default=str(ROOT / "data" / "extra_words.json"))
    a = ap.parse_args()

    cells = read_xlsx(a.xlsx)
    raw_forms = set()
    for lst, d in cells.items():
        for txt, _ in d.values():
            raw_forms.update(split_forms(txt))

    sources = defaultdict(set)
    pink_votes = defaultdict(lambda: [0, 0])  # [pink cells, total cells]
    yellow = defaultdict(int)
    variants = defaultdict(set)
    for lst, d in cells.items():
        for txt, colour in d.values():
            for f in split_forms(txt):
                k = lemma_key(f, raw_forms)
                sources[k].add(lst)
                if k != f:
                    variants[k].add(f)
                pink_votes[k][1] += 1
                if colour == PINK:
                    pink_votes[k][0] += 1
                if colour == YELLOW:
                    yellow[k] += 1

    groups = {}
    cur = None
    for line in (ROOT / "data" / "yellow_highlighted_words.txt").read_text().splitlines():
        if line.startswith("## "):
            cur = line[3:].strip()
        elif line.strip() and cur:
            for w in re.split(r",\s*", line.strip()):
                groups.setdefault(fold(w), cur)

    popular = [fold(w) for w in (ROOT / "data" / "popular_words.txt").read_text().split() if fold(w)]
    extra = json.loads(Path(a.extra).read_text()) if Path(a.extra).exists() else {}
    ets_hits = defaultdict(int)
    for p in a.ets:
        for line in Path(p).read_text().splitlines():
            parts = line.split("\t")
            w = fold(parts[0])
            if w and re.fullmatch(r"[a-z'-]{3,}", w):
                ets_hits[w] += int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 1

    words = {}

    def add(w, tier):
        k = lemma_key(w, raw_forms | set(popular))
        if k in words:
            if tier == "ets" and words[k]["tier"] not in ("ets",):
                words[k]["tier"] = "ets" if words[k]["tier"] == "extended" else words[k]["tier"]
            return k
        n = len(sources.get(k, ()))
        p = pink_votes[k]
        words[k] = {
            "id": slug(k),
            "lemma": k,
            "variants": sorted(variants.get(k, set())),
            "pos": None,
            "senses": None,
            "isSecondary": False,
            "meaningGroup": groups.get(k),
            "sources": sorted(sources.get(k, ())),
            "sourceCount": n,
            "pink": bool(p[1]) and p[0] / p[1] > 0.5,
            "tier": tier,
            "yield": 0.0,
        }
        return k

    for w in popular:
        add(w, "core")
    for w, meta in extra.items():  # {"afford": {"tier": "secondary"}, ...}
        k = add(fold(w), meta.get("tier", "extended"))
        if meta.get("tier") in ("secondary", "ets", "passage"):
            words[k]["tier"] = meta["tier"]
        if meta.get("secondary"):
            words[k]["isSecondary"] = True
    for w, n in ets_hits.items():
        k = add(w, "ets")
        words[k]["tier"] = "ets" if words[k]["tier"] in ("extended", "ets") else words[k]["tier"]
        words[k]["sources"] = sorted(set(words[k]["sources"]) | {"ets_official"})
    # xlsx words on 3+ lists and not pink join the extended tier
    for k, s in sources.items():
        if len(s) >= 3 and not (pink_votes[k][1] and pink_votes[k][0] / pink_votes[k][1] > 0.5):
            add(k, "extended")

    for k, w in words.items():
        ets = "ets_official" in w["sources"]
        w["sourceCount"] = len([s for s in w["sources"] if s != "ets_official"])
        bonus = 0.2 if (w["isSecondary"] or ets) else 0
        w["yield"] = round(min(1.0, w["sourceCount"] / 5 + bonus + (0.3 if ets else 0)), 3)

    out = sorted(words.values(), key=lambda x: x["lemma"])
    (ROOT / "data" / "vocab.json").write_text(json.dumps(out, indent=0, ensure_ascii=False))
    tiers = defaultdict(int)
    for w in out:
        tiers[w["tier"]] += 1
    print(f"{len(out)} words", dict(tiers), f"pink={sum(w['pink'] for w in out)}", file=sys.stderr)


if __name__ == "__main__":
    main()
