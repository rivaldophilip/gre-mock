#!/usr/bin/env python3
"""Summarize a Claude Code session transcript, to see where a /new-test run spends its calls and tokens.

usage: python3 scripts/session_stats.py [session.jsonl] [--commands]
The default is the newest transcript of this project in ~/.claude/projects/. It prints tool calls by name, tool errors,
how often each authoring command ran (check, blind --check rounds, ...), and token totals; --commands lists every Bash
command in order, with failures marked. Compare runs to find the step that loops most, then fix that tool or doc.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STEPS = [  # (label, pattern over a Bash command), first match wins
    ("brief", r"npm run.* brief\b"),
    ("check", r"npm run.* check\b"),
    ("validate", r"npm run.* validate\b"),
    ("tag", r"npm run.* tag\b"),
    ("blind --check", r"npm run.* blind\b.*--check"),
    ("blind copy", r"npm run.* blind\b"),
    ("verify.py", r"python3? .*content/verify/"),
    ("register", r"npm run.* register\b"),
    ("git", r"^\s*git\b"),
]


def default_transcript():
    project = Path.home() / ".claude" / "projects" / re.sub(r"[^A-Za-z0-9]", "-", str(ROOT))
    files = sorted(project.glob("*.jsonl"), key=lambda p: p.stat().st_mtime)
    if not files:
        sys.exit(f"no transcripts in {project}")
    return files[-1]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    path = Path(args[0]) if args else default_transcript()
    calls, steps, errors = Counter(), Counter(), Counter()
    tokens = Counter()
    bash, names, usage = [], {}, {}
    for line in path.open():
        try:
            d = json.loads(line)
        except json.JSONDecodeError:
            continue
        msg = d.get("message") or {}
        if msg.get("usage") and msg.get("id"):
            usage[msg["id"]] = msg["usage"]  # a streamed message repeats its usage on each content line; keep the last
        content = msg.get("content")
        if not isinstance(content, list):
            continue
        for b in content:
            if b.get("type") == "tool_use":
                calls[b["name"]] += 1
                names[b["id"]] = b["name"]
                if b["name"] == "Bash":
                    cmd = b["input"].get("command", "")
                    step = next((label for label, pat in STEPS if re.search(pat, cmd, re.M)), None)
                    if step:
                        steps[step] += 1
                    bash.append([b["id"], cmd.strip().splitlines()[0][:110] if cmd.strip() else "", False])
            elif b.get("type") == "tool_result" and b.get("is_error"):
                errors[names.get(b.get("tool_use_id"), "?")] += 1
                for row in bash:
                    if row[0] == b.get("tool_use_id"):
                        row[2] = True
    for u in usage.values():
        for k in ("input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens", "output_tokens"):
            tokens[k] += u.get(k) or 0
    print(f"transcript: {path}")
    print(f"tool calls: {sum(calls.values())} ({', '.join(f'{n} {k}' for k, n in calls.most_common())})")
    print(f"tool errors: {sum(errors.values())}" + (f" ({', '.join(f'{n} {k}' for k, n in errors.most_common())})" if errors else ""))
    print("authoring steps: " + (", ".join(f"{k} ×{steps[k]}" for k, _ in STEPS if steps[k]) or "none"))
    print(f"tokens: output {tokens['output_tokens']:,} · input {tokens['input_tokens']:,} · cache read {tokens['cache_read_input_tokens']:,} · cache write {tokens['cache_creation_input_tokens']:,}")
    if "--commands" in sys.argv:
        for _, cmd, failed in bash:
            print(f"  {'✗' if failed else '·'} {cmd}")


if __name__ == "__main__":
    main()
