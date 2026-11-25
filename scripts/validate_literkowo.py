#!/usr/bin/env python3
"""Check that all Polish tracing paths and numbered dots stay in sync."""
import json
import math
from pathlib import Path

from generate_letter_points import distance, sample_path

ROOT = Path(__file__).resolve().parents[1]
POLISH_ALPHABET = list("AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ")


def fail(message):
    raise SystemExit(f"ERROR: {message}")


def finite_points(points, context):
    for index, point in enumerate(points):
        if not isinstance(point, list) or len(point) != 2:
            fail(f"{context}: point {index} must contain x and y")
        if not all(isinstance(value, (int, float)) and math.isfinite(value) for value in point):
            fail(f"{context}: point {index} contains a non-finite coordinate")


def expected_stroke(stroke, spacing):
    source = stroke.get("points", [])
    if len(source) == 1:
        return [[round(source[0][0], 5), round(source[0][1], 5)]], False
    if len(source) < 1:
        fail("Every source stroke must have at least one path coordinate")
    total = sum(distance(source[index - 1], source[index]) for index in range(1, len(source)))
    closed = total > spacing * 2.5 and distance(source[0], source[-1]) <= spacing * 0.5
    dots = sample_path(source, spacing)
    if closed and len(dots) > 2 and distance(dots[0], dots[-1]) <= spacing * 0.5:
        dots.pop()
    return dots, closed


def main():
    paths = json.loads((ROOT / "pwa/letter-paths.json").read_text(encoding="utf-8"))
    points = json.loads((ROOT / "pwa/letter-points.json").read_text(encoding="utf-8"))

    if points.get("format") != "literkowo-letter-points/1":
        fail("Unsupported letter-points format")
    if points.get("spacing", 0) <= 0:
        fail("Point spacing must be greater than zero")

    path_letters = paths.get("letters", {})
    point_letters = points.get("letters", {})
    expected_letters = POLISH_ALPHABET + [letter.lower() for letter in POLISH_ALPHABET]
    expected_keys = set(expected_letters)
    if set(path_letters) != expected_keys:
        fail("letter-paths.json does not contain exactly the 32 Polish letters")
    if set(point_letters) != expected_keys:
        fail("letter-points.json does not contain exactly the 32 Polish letters")

    spacing = points["spacing"]
    stroke_count = 0
    dot_count = 0

    for letter in expected_letters:
        model = path_letters[letter]
        source_strokes = model.get("strokes", [])
        if not isinstance(model.get("aspect"), (int, float)) or not math.isfinite(model["aspect"]) or model["aspect"] <= 0:
            fail(f"{letter}: aspect ratio must be a positive number")
        bounds = model.get("bounds", {})
        if not all(isinstance(bounds.get(key), (int, float)) and math.isfinite(bounds[key])
                   for key in ("minY", "maxY")) or bounds["minY"] >= bounds["maxY"]:
            fail(f"{letter}: invalid vertical bounds")
        for stroke_index, stroke in enumerate(source_strokes, start=1):
            finite_points(stroke.get("points", []), f"{letter}, stroke {stroke_index} source")
        all_y = [point[1] for stroke in source_strokes for point in stroke.get("points", [])]
        if all_y and (min(all_y) < bounds["minY"] - 1e-5 or max(all_y) > bounds["maxY"] + 1e-5):
            fail(f"{letter}: vertical bounds do not contain every path point")
        if letter.islower() and not model.get("outline") and not model.get("handwriting"):
            fail(f"{letter}: missing both vector outline and handwriting silhouette fallback")
        numbered_strokes = point_letters[letter].get("strokes", [])
        if not source_strokes or len(source_strokes) != len(numbered_strokes):
            fail(f"{letter}: source and numbered stroke counts differ")

        for index, (source, numbered) in enumerate(zip(source_strokes, numbered_strokes), start=1):
            context = f"{letter}, stroke {index}"
            finite_points(source.get("points", []), context + " source")
            expected_dots, expected_closed = expected_stroke(source, spacing)
            actual_dots = numbered.get("dots", [])
            finite_points(actual_dots, context + " numbered")
            if len(actual_dots) != len(expected_dots) or any(
                distance(actual, expected) > 1e-5
                for actual, expected in zip(actual_dots, expected_dots)
            ):
                fail(f"{context}: numbered dots are out of sync with the source path")
            if numbered.get("press") is not (len(expected_dots) == 1):
                fail(f"{context}: incorrect press-point flag")
            if numbered.get("closed") is not expected_closed:
                fail(f"{context}: incorrect closed-path flag")
            if len(actual_dots) < 1:
                fail(f"{context}: empty numbered path")
            stroke_count += 1
            dot_count += len(actual_dots)

    # Dots above lowercase i, j and ż are press marks, never short horizontal traces.
    for letter in ("i", "j", "ż"):
        source_dot = path_letters[letter]["strokes"][-1]
        traced_dot = point_letters[letter]["strokes"][-1]
        if len(source_dot.get("points", [])) != 1:
            fail(f"{letter}: lowercase dot must be a single press point")
        if len(traced_dot.get("dots", [])) != 1 or not traced_dot.get("press"):
            fail(f"{letter}: lowercase dot must render as a single press point")

    # Guard the specific connection that previously left visible gaps in E.
    e_strokes = path_letters["E"]["strokes"]
    if len(e_strokes) != 4:
        fail("E must contain one vertical and three horizontal strokes")
    stem = e_strokes[0]["points"]
    stem_x = stem[0][0]
    stem_min_y = min(point[1] for point in stem)
    stem_max_y = max(point[1] for point in stem)
    if any(abs(point[0] - stem_x) > 1e-6 for point in stem):
        fail("E: the main stem must be vertical")
    for index, stroke in enumerate(e_strokes[1:], start=2):
        start = stroke["points"][0]
        if abs(start[0] - stem_x) > 1e-6 or not stem_min_y <= start[1] <= stem_max_y:
            fail(f"E: horizontal stroke {index} does not meet the vertical stem")
        dot_start = point_letters["E"]["strokes"][index - 1]["dots"][0]
        if abs(dot_start[0] - stem_x) > 1e-6:
            fail(f"E: numbered horizontal stroke {index} does not start on the stem")

    print(f"OK: {len(POLISH_ALPHABET)} letters, {stroke_count} strokes, {dot_count} numbered dots")
    print("OK: generator parity and E stroke connections")


if __name__ == "__main__":
    main()
