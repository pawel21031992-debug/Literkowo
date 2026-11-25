#!/usr/bin/env python3
"""Validate native guide counts against the shared PWA tracing data."""
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
POLISH_ALPHABET = list("AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ")
points = json.loads((ROOT / "pwa/letter-points.json").read_text(encoding="utf-8"))
letter_source = (ROOT / "Literkowo/Letter.swift").read_text(encoding="utf-8")
project_source = (ROOT / "Literkowo.xcodeproj/project.pbxproj").read_text(encoding="utf-8")


def fail(message):
    raise SystemExit(f"ERROR: {message}")


def dictionary_block(source, marker):
    start = source.index(marker) + len(marker)
    end = source.index("\n        ]", start)
    return source[start:end]


guides = {}
for line in dictionary_block(letter_source, "let guides: [String: [String]] = [").splitlines():
    match = re.match(r'\s*"([^"]+)":\s*\[(.*)\],?\s*$', line)
    if match:
        guides[match.group(1)] = len(re.findall(r'"(?:[^"\\]|\\.)*"', match.group(2)))

if points.get("format") != "literkowo-letter-points/1":
    fail("Unsupported shared letter-points format")
if set(guides) != set(POLISH_ALPHABET):
    fail("Native guides do not contain exactly the 32 uppercase Polish letters")

mismatches = {}
for letter in POLISH_ALPHABET:
    model = points.get("letters", {}).get(letter)
    lowercase = letter.lower()
    if not model or not points.get("letters", {}).get(lowercase):
        fail(f"{letter}: shared data is missing uppercase or lowercase geometry")
    strokes = len(model.get("strokes", []))
    # Native A intentionally joins the two diagonal strokes into one continuous movement.
    expected = strokes - 1 if letter == "A" else strokes
    if guides[letter] != expected:
        mismatches[letter] = (expected, guides[letter])

if mismatches:
    details = ", ".join(
        f"{letter}: {expected} ruchów / {actual} instrukcji"
        for letter, (expected, actual) in sorted(mismatches.items())
    )
    fail("Guide instructions do not match shared geometry: " + details)

for filename in ("letter-points.json", "letter-paths.json"):
    if f"path = pwa/{filename}" not in project_source:
        fail(f"{filename} is not registered in the native Xcode project resources")

print(f"OK: {len(POLISH_ALPHABET)} native guides match shared geometry")
print("OK: uppercase and lowercase source data are present and both JSON files are bundled for iOS")
