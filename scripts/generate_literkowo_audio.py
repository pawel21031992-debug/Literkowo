#!/usr/bin/env python3
"""Build deterministic Polish MP3 assets for Literkowo using Piper TTS."""
import argparse
import hashlib
import json
import math
import re
import subprocess
import tempfile
import unicodedata
from pathlib import Path

from piper import PiperVoice


def clean(text: str) -> str:
    return " ".join(unicodedata.normalize("NFC", text).strip().split())


def audio_key(text: str) -> str:
    # Must stay byte-for-byte compatible with audioKey() in pwa/app.js (FNV-1a 64).
    value = 0xCBF29CE484222325
    for byte in clean(text).encode("utf-8"):
        value ^= byte
        value = (value * 0x100000001B3) & 0xFFFFFFFFFFFFFFFF
    return f"{value:016x}"


def load_data(app_js: Path):
    source = app_js.read_text(encoding="utf-8")
    match = re.search(r"const DATA = (\\{.*?\\});\\s*\\nconst \\$", source, re.S)
    if not match:
        raise RuntimeError("Could not extract DATA from pwa/app.js")
    return json.loads(match.group(1))


def position(point):
    x, y = point
    vertical = "u góry" if y < .34 else "na dole" if y > .66 else "na środku"
    horizontal = "po lewej" if x < .34 else "po prawej" if x > .66 else ""
    return (vertical + " " + horizontal).strip()


def direction(stroke):
    a, b = stroke[0], stroke[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    if abs(dx) > abs(dy) * 1.25:
        return "w prawo" if dx > 0 else "w lewo"
    if abs(dy) > abs(dx) * 1.25:
        return "w dół" if dy > 0 else "w górę"
    if dx >= 0:
        return "ukośnie w dół i w prawo" if dy >= 0 else "ukośnie w górę i w prawo"
    return "ukośnie w dół i w lewo" if dy >= 0 else "ukośnie w górę i w lewo"


def phrases_for(data):
    phrases = set()
    for letter in data["alphabet"]:
        phrases.add(f"Litera {letter}")
        template = data["templates"][letter]
        steps = []
        for index, stroke in enumerate(template):
            curved = len(stroke) > 4
            closed = math.hypot(stroke[0][0] - stroke[-1][0], stroke[0][1] - stroke[-1][1]) < .12
            motion = ("płynnym łukiem " if curved else "po obwodzie " if closed else "")
            steps.append(
                f"Ruch {index + 1}: zacznij {position(stroke[0])}, prowadź palec "
                f"{motion}{direction(stroke)} i zakończ w oznaczonym miejscu."
            )
        guide = ". ".join(steps)
        phrases.add(f"Jak napisać literę {letter}. {guide}")

        is_vowel = letter in "AĄEĘIOÓUY"
        syllables = [letter.lower(), "ma", "me", "mi", "mo", "mu"] if is_vowel else [
            letter.lower() + vowel for vowel in "aeiouy"
        ]
        phrases.update(syllables)
        phrases.update(data["words"].get(letter, []))
    return sorted(clean(item) for item in phrases if clean(item))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--app", default=Path("pwa/app.js"), type=Path)
    parser.add_argument("--output", default=Path("pwa/audio"), type=Path)
    args = parser.parse_args()

    data = load_data(args.app)
    phrases = phrases_for(data)
    args.output.mkdir(parents=True, exist_ok=True)
    voice = PiperVoice.load(str(args.model))

    with tempfile.TemporaryDirectory(prefix="literkowo-tts-") as temp_dir:
        temp = Path(temp_dir)
        for index, phrase in enumerate(phrases, 1):
            key = audio_key(phrase)
            wav_path = temp / f"{key}.wav"
            mp3_path = args.output / f"{key}.mp3"
            if mp3_path.exists() and mp3_path.stat().st_size > 500:
                continue
            with wav_path.open("wb") as wav_file:
                voice.synthesize_wav(phrase, wav_file)
            subprocess.run(
                ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                 "-i", str(wav_path), "-codec:a", "libmp3lame",
                 "-b:a", "64k", "-ar", "22050", "-ac", "1", str(mp3_path)],
                check=True,
            )
            if index % 25 == 0 or index == len(phrases):
                print(f"Generated {index}/{len(phrases)} Polish clips", flush=True)

    (args.output / "VOICE.txt").write_text(
        "Polish speech audio generated for Literkowo with Piper TTS.\\n"
        "Voice: pl_PL-gosia-medium (rhasspy/piper-voices).\\n"
        "Voice model card and dataset information: "
        "https://huggingface.co/rhasspy/piper-voices/tree/main/pl/pl_PL/gosia/medium\\n"
        "Piper TTS: https://github.com/OHF-Voice/piper1-gpl\\n",
        encoding="utf-8",
    )
    print(f"Done: {len(phrases)} phrases prepared in {args.output}", flush=True)


if __name__ == "__main__":
    main()
