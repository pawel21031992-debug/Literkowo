#!/usr/bin/env python3
"""Generate evenly spaced, ordered tracing dots from each letter's stroke paths."""
import argparse
import json
import math
from pathlib import Path


def distance(a, b):
    return math.hypot(b[0] - a[0], b[1] - a[1])


def sample_path(points, spacing):
    if len(points) == 1:
        return [[round(points[0][0], 5), round(points[0][1], 5)]]
    if len(points) < 1:
        raise ValueError("Every stroke must contain at least one point")

    lengths = [0.0]
    for index in range(1, len(points)):
        lengths.append(lengths[-1] + distance(points[index - 1], points[index]))

    total = lengths[-1]
    if total <= 1e-9:
        return [[round(points[0][0], 5), round(points[0][1], 5)]]

    # A tiny closed loop used for a diacritic dot should be a press point,
    # not two overlapping endpoints that look like a broken tracing path.
    if total <= spacing * 2.5 and distance(points[0], points[-1]) < 1e-4:
        ring = points[:-1] if len(points) > 2 else points
        center = [
            sum(p[0] for p in ring) / len(ring),
            sum(p[1] for p in ring) / len(ring),
        ]
        return [[round(center[0], 5), round(center[1], 5)]]

    intervals = max(1, math.ceil(total / spacing))
    targets = [total * index / intervals for index in range(intervals + 1)]

    candidates = []
    segment = 1
    for target in targets:
        while segment < len(lengths) - 1 and lengths[segment] < target:
            segment += 1
        span = lengths[segment] - lengths[segment - 1]
        fraction = (target - lengths[segment - 1]) / span if span > 1e-9 else 0.0
        a, b = points[segment - 1], points[segment]
        candidates.append([
            a[0] + (b[0] - a[0]) * fraction,
            a[1] + (b[1] - a[1]) * fraction,
        ])

    # Sharp corners can bring two consecutive samples too close on screen.
    # Skip such a sample, but always preserve the exact start and end.
    result = [candidates[0]]
    minimum_gap = spacing * 0.80
    for candidate in candidates[1:-1]:
        if distance(result[-1], candidate) >= minimum_gap:
            result.append(candidate)
    endpoint = candidates[-1]
    if len(result) > 1 and distance(result[-1], endpoint) < minimum_gap:
        result[-1] = endpoint
    else:
        result.append(endpoint)
    result = [[round(p[0], 5), round(p[1], 5)] for p in result]
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=Path("pwa/letter-paths.json"))
    parser.add_argument("--output", type=Path, default=Path("pwa/letter-points.json"))
    parser.add_argument("--spacing", type=float, default=0.035)
    args = parser.parse_args()

    if args.spacing <= 0:
        raise SystemExit("--spacing must be greater than zero")

    source = json.loads(args.input.read_text(encoding="utf-8"))
    letters = {}
    for letter, model in source["letters"].items():
        strokes = []
        for stroke in model["strokes"]:
            source_points = stroke["points"]
            source_length = sum(
                distance(source_points[i - 1], source_points[i])
                for i in range(1, len(source_points))
            )
            closed = (
                source_length > args.spacing * 2.5
                and distance(source_points[0], source_points[-1]) <= args.spacing * 0.5
            )
            dots = sample_path(source_points, args.spacing)
            if closed and len(dots) > 2 and distance(dots[0], dots[-1]) <= args.spacing * 0.5:
                dots.pop()
            strokes.append({
                "dots": dots,
                "press": len(dots) == 1,
                "closed": closed,
            })
        letters[letter] = {"strokes": strokes}

    output = {
        "format": "literkowo-letter-points/1",
        "source": "Derived from letter-paths.json using equal arc-length spacing",
        "spacing": args.spacing,
        "letters": letters,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"Generated {len(letters)} letters and "
          f"{sum(len(s['dots']) for m in letters.values() for s in m['strokes'])} dots")


if __name__ == "__main__":
    main()
