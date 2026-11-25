#!/usr/bin/env python3
"""Regression guard for the native iOS uppercase A writing sequence."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
template_source = (ROOT / "Literkowo/LetterTraceEvaluator.swift").read_text(encoding="utf-8")
letter_source = (ROOT / "Literkowo/Letter.swift").read_text(encoding="utf-8")

expected_template = '"A": [[p(0.18,0.86),p(0.50,0.14),p(0.82,0.86)],[p(0.32,0.60),p(0.68,0.60)]],'
expected_guide = '"A": ["Zacznij na dole po lewej, poprowadź linię do szczytu, a następnie w dół po prawej jednym ciągłym ruchem.", "Dorysuj poprzeczną kreskę od lewej do prawej."],'

if expected_template not in template_source:
    raise SystemExit("ERROR: native A must use one continuous diagonal movement and one crossbar")
if expected_guide not in letter_source:
    raise SystemExit("ERROR: native A instructions must describe exactly two movements")

print("OK: native uppercase A uses two movements with continuous diagonals")
