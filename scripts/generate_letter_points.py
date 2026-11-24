#!/usr/bin/env python3
"""Generate evenly spaced, ordered tracing dots from each letter's stroke paths."""
import argparse
import json
import math
from pathlib import Path


def distance(a, b):
    return math.hypot(b[0] - a[0], b[1] - a[1])


def sample_path(points, spacing):
    if len(points) < 2:
        raise ValueError("Every stroke must contain at least two points")

    lengths = [0.0]
    for index in range(1, len(points)):
        lengths.append(lengths[-1] + distance(points[index - 1], points[index]))

    total = lengths[-1]
    if total <= 1e-9:
        return [points[0], points[-1]]

    intervals = max(1, math.ceil(total / spacing))
    targets = [total * index / intervals for index in range(intervals + 1)]

    result = []
    segment = 1
    for target in targets:
        while segment < len(lengths) - 1 and lengths[segment] < target:
            segment += 1
        span = lengths[segment] - lengths[segment - 1]
        fraction = (target - lengths[segment - 1]) / span if span > 1e-9 else 0.0
        a, b = points[segment - 1], points[segment]
        result.append([
            round(a[0] + (b[0] - a[0]) * fraction, 5),
            round(a[1] + (b[1] - a[1]) * fraction, 5),
        ])
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
        letters[letter] = {
            "strokes": [
                {"dots": sample_path(stroke["points"], args.spacing)}
                for stroke in model["strokes"]
            ]
        }

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
