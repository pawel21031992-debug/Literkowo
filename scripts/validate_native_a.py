#!/usr/bin/env python3
"""Check that every native uppercase-letter guide has one instruction per trace stroke."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
template_source = (ROOT / "Literkowo/LetterTraceEvaluator.swift").read_text(encoding="utf-8")
letter_source = (ROOT / "Literkowo/Letter.swift").read_text(encoding="utf-8")

def dictionary_block(source: str, marker: str) -> str:
    start = source.index(marker) + len(marker)
    end = source.index("\n        ]", start)
    return source[start:end]

templates = {}
for line in dictionary_block(template_source, "let templates: [String: [[CGPoint]]] = [").splitlines():
    match = re.match(r'\s*"([^"]+)":\s*\[(.*)\],?\s*$', line)
    if match:
        templates[match.group(1)] = len(re.findall(r'\[p\(', match.group(2)))

guides = {}
for line in dictionary_block(letter_source, "let guides: [String: [String]] = [").splitlines():
    match = re.match(r'\s*"([^"]+)":\s*\[(.*)\],?\s*$', line)
    if match:
        guides[match.group(1)] = len(re.findall(r'"(?:[^"\\]|\\.)*"', match.group(2)))

if set(templates) != set(guides):
    raise SystemExit(f"ERROR: template/guide alphabet mismatch: templates={sorted(templates)}, guides={sorted(guides)}")

mismatches = {letter: (strokes, guides[letter]) for letter, strokes in templates.items() if strokes != guides[letter]}
if mismatches:
    details = ", ".join(f"{letter}: {strokes} ruchów / {steps} instrukcji" for letter, (strokes, steps) in sorted(mismatches.items()))
    raise SystemExit("ERROR: guide instructions do not match native trace strokes: " + details)

print(f"OK: {len(templates)} native uppercase letters have matching stroke and instruction counts")
