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
import wave
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
    match = re.search(r"const DATA = (\{.*?\});", source, re.S)
    if not match:
        raise RuntimeError("Could not extract DATA from pwa/app.js")
    data = json.loads(match.group(1))
    paths_file = app_js.with_name('letter-paths.json')
    path_data = json.loads(paths_file.read_text(encoding='utf-8'))
    points_file = app_js.with_name('letter-points.json')
    point_data = json.loads(points_file.read_text(encoding='utf-8'))
    return data, path_data, point_data


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


GUIDE_OVERRIDES = {
    "A": [
        "Ruch 1: zacznij na szczycie i poprowadź ukośną kreskę w dół po lewej stronie.",
        "Ruch 2: zacznij ponownie na szczycie i poprowadź drugą ukośną kreskę w dół po prawej stronie.",
        "Ruch 3: narysuj poprzeczną kreskę od lewej do prawej.",
    ],
    "Ą": [
        "Ruch 1: od szczytu poprowadź lewą ukośną kreskę w dół.",
        "Ruch 2: od szczytu poprowadź prawą ukośną kreskę w dół.",
        "Ruch 3: narysuj poprzeczną kreskę od lewej do prawej.",
        "Ruch 4: dodaj ogonek przy prawej dolnej części litery.",
    ],
    "B": [
        "Ruch 1: narysuj pionową kreskę od góry do dołu.",
        "Ruch 2: od góry poprowadź łuk górnej części w prawo i wróć do środka.",
        "Ruch 3: od środka poprowadź dolny łuk w prawo i zakończ na dole przy pionowej kresce.",
    ],
    "M": [
        "Ruch 1: narysuj lewą pionową kreskę z góry na dół.",
        "Ruch 2: od górnej części lewej strony poprowadź ukośną kreskę do środkowego dołka.",
        "Ruch 3: od środkowego dołka poprowadź ukośną kreskę do góry po prawej.",
        "Ruch 4: narysuj prawą pionową kreskę z góry na dół.",
    ],
    "N": [
        "Ruch 1: narysuj lewą pionową kreskę z góry na dół.",
        "Ruch 2: połącz górę lewej strony z dołem prawej strony jedną ukośną kreską.",
        "Ruch 3: narysuj prawą pionową kreskę z góry na dół.",
    ],
    "Ń": [
        "Ruch 1: narysuj lewą pionową kreskę z góry na dół.",
        "Ruch 2: poprowadź ukośną kreskę od góry po lewej do dołu po prawej.",
        "Ruch 3: narysuj prawą pionową kreskę z góry na dół.",
        "Ruch 4: dodaj kreskę nad literą.",
    ],
    "Ł": [
        "Ruch 1: narysuj pionową kreskę z góry na dół.",
        "Ruch 2: dodaj dolną poziomą kreskę.",
        "Ruch 3: narysuj ukośną kreskę przechodzącą przez literę.",
    ],
    "Ę": [
        "Ruch 1: narysuj pionową kreskę z góry na dół.",
        "Ruch 2: dodaj górną poziomą kreskę.",
        "Ruch 3: dodaj środkową poziomą kreskę.",
        "Ruch 4: dodaj dolną poziomą kreskę.",
        "Ruch 5: dorysuj ogonek przy prawej dolnej części litery.",
    ],
    "Z": [
        "Ruch 1: jednym ciągłym ruchem narysuj górną kreskę, ukośną część i dolną kreskę.",
    ],
    "Ź": [
        "Ruch 1: jednym ruchem narysuj kształt litery Z.",
        "Ruch 2: dodaj kreskę nad literą.",
    ],
    "Ż": [
        "Ruch 1: jednym ruchem narysuj kształt litery Z.",
        "Ruch 2: dodaj kropkę nad literą.",
    ],
}


def phrases_for(data, path_data, point_data):
    phrases = set()
    letters = point_data["letters"]
    for letter in data["alphabet"]:
        phrases.add(f"Litera {letter}")
        model = letters[letter]
        steps = GUIDE_OVERRIDES.get(letter)
        if steps is None:
            steps = []
            for index, stroke in enumerate(model["strokes"]):
                if stroke.get("press"):
                    steps.append(
                        f"Ruch {index + 1}: dotknij pomarańczowego punktu 1 i oderwij palec."
                    )
                else:
                    ending = (
                        " Na końcu wróć do punktu 1, aby zamknąć kształt."
                        if stroke.get("closed") else ""
                    )
                    steps.append(
                        f"Ruch {index + 1}: zacznij w pomarańczowym punkcie 1 i prowadź "
                        "palec przez kolejne ponumerowane punkty aż do ostatniego."
                        + ending
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

    data, path_data, point_data = load_data(args.app)
    phrases = phrases_for(data, path_data, point_data)
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
            with wave.open(str(wav_path), "wb") as wav_file:
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
        "Polish speech audio generated for Literkowo with Piper TTS.\n"
        "Voice: pl_PL-gosia-medium (rhasspy/piper-voices).\n"
        "Voice model card and dataset information: "
        "https://huggingface.co/rhasspy/piper-voices/tree/main/pl/pl_PL/gosia/medium\n"
        "Piper TTS: https://github.com/OHF-Voice/piper1-gpl\n",
        encoding="utf-8",
    )
    print(f"Done: {len(phrases)} phrases prepared in {args.output}", flush=True)


if __name__ == "__main__":
    main()
