"""Independently verify A2 model helpers and worked values.

Run: python docs/projects/fall-2026/tests/a2-verify.py
Requires gcc. Only complete, defined model answers are executed; intentional
undefined-behavior prompts are never compiled or run. Expected values come from
Python bit strings and signed-place-value arithmetic, not from the C helpers.
"""
import collections
import json
from pathlib import Path
import random
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BANK = json.loads((ROOT / "data/2122-a2-recall.json").read_text())
QUESTIONS = {q["id"]: q for q in BANK["questions"]}
assert len(QUESTIONS) == len(BANK["questions"]), "Duplicate question identifiers"
assert len(BANK["topics"]) == 12
assert all(q["type"] == "self" and q.get("rubric")
           for q in QUESTIONS.values() if q["stage"] == 4)
assert all(q["source"] and q["hint"] and q["explanation"] for q in QUESTIONS.values())
assert set(collections.Counter(q["stage"] for q in QUESTIONS.values())) == {1, 2, 3, 4}


def bits(data):
    return "".join(f"{value:08b}" for value in data)


def signed(field):
    # Negative sign-bit weight plus the remaining positive weights.
    return -int(field[0]) * 2 ** (len(field) - 1) + int("0" + field[1:], 2)


def decode(data):
    stream, pos, result = bits(data), 0, []
    while len(stream) - pos >= 6:
        width = int(stream[pos:pos + 5], 2)
        if not width:
            break
        assert pos + 5 + width <= len(stream), "Malformed oracle fixture"
        pos += 5
        value = signed(stream[pos:pos + width])
        pos += width
        result.append((value, pos))
    return result


def packed(fields):
    stream = "".join(f"{width:05b}" + f"{value % 2 ** width:0{width}b}"
                     for width, value in fields)
    stream += "0" * (-len(stream) % 8)
    return bytes(int(stream[i:i + 8], 2) for i in range(0, len(stream), 8))


checks = []


def check(expression):
    checks.append(f"    assert({expression});")


def cbytes(data):
    return "{" + ",".join(str(value) for value in data) + "}"


# Exhaust every one-byte bit extraction, including the byte's first/last bit.
checks.append("    unsigned char byte[1];")
for value in range(256):
    checks.append(f"    byte[0] = {value};")
    for position, expected in enumerate(bits([value])):
        check(f"getBit(byte, {position}) == {expected}u")

# Cross-byte fields at varied positions and every permitted width, including 0.
rng = random.Random(2122)
data = bytes(rng.randrange(256) for _ in range(64))
stream = bits(data)
checks.append(f"    unsigned char data[] = {cbytes(data)};")
for start in range(40):
    for width in range(32):
        expected = int("0" + stream[start:start + width], 2)
        check(f"getBits(data, {start}, {width}) == {expected}u")
        if width:
            expected_signed = signed(stream[start:start + width])
            check(f"decodeSigned(getBits(data, {start}, {width}), {width}) == {expected_signed}")

# Exercise the sign boundary at all widths, including both actual L=31 extremes.
for width in range(1, 32):
    for raw in {0, 2 ** (width - 1) - 1, 2 ** (width - 1), 2 ** width - 1}:
        expected = signed(f"{raw:0{width}b}")
        check(f"decodeSigned({raw}u, {width}) == {expected}")
for width in range(32):
    check(f"lowMask({width}) == {2 ** width - 1}u")

# Checked methods must preserve outputs on errors and accept valid empty reads.
checks.extend([
    "    unsigned int out = 77;",
    "    assert(getBitChecked(data, sizeof data, 511, &out) == 1);",
    f"    assert(out == {stream[-1]}u);",
    "    out = 77;",
    "    assert(getBitChecked(data, sizeof data, 512, &out) == 0 && out == 77);",
    "    assert(getBitChecked(NULL, 0, 0, &out) == 0 && out == 77);",
    "    assert(readField(data, 512, 512, 0, &out) == 1 && out == 0);",
    "    out = 77;",
    "    assert(readField(data, 512, 512, 1, &out) == 0 && out == 77);",
    "    assert(readField(data, 512, SIZE_MAX, 1, &out) == 0 && out == 77);",
    "    assert(readField(data, 512, 0, 32, &out) == 0 && out == 77);",
    "    assert(readField(NULL, 0, 0, 0, &out) == 1 && out == 0);",
])

# PDF P1 examples: its first field is decoded even when trailing bits remain.
p1 = ["08", "0c", "12", "43 d8", "62 69 00", "ca f1 85 38",
      "fb ff ff ff f0", "fc 00 00 00 10"]
p1_values = [0, -1, 1, 123, 1234, 12345678, 1073741823, -1073741823]
for index, (hexdata, expected) in enumerate(zip(p1, p1_values)):
    data = bytes.fromhex(hexdata)
    stream = bits(data)
    width = int(stream[:5], 2)
    assert signed(stream[5:5 + width]) == expected
    checks.append(f"    unsigned char p1_{index}[] = {cbytes(data)};")
    check(f"decodeSigned(getBits(p1_{index}, 5, {width}), {width}) == {expected}")
for qid, expected in [("A2-TRACES-01", 0), ("A2-TRACES-02", -1),
                      ("A2-TRACES-03", 1), ("A2-TRACES-04", 123),
                      ("A2-TRACES-05", 12345678),
                      ("A2-SIGNED-08", -1073741824),
                      ("A2-SIGNED-13", 1073741823)]:
    assert int(QUESTIONS[qid]["answer"]) == expected, qid

# P2 examples, plus a long stream exceeding both 9 and 16 bytes. PDF page 3
# omits its fourth output block; derive that block independently here.
p2 = [bytes.fromhex(s) for s in ["08 30", "12 28 6c 70",
       "43 db 13 4b 2b c6 14 e0", "fb ff ff ff ff c0 00 00 01"]]
p2.append(packed([(4, (i % 16) - 8) for i in range(60)]))
p2.append(packed([(31, -1073741824), (31, 1073741823), (1, -1), (1, 0)]))
assert [value for value, _ in decode(p2[3])] == [1073741823, -1073741823]
assert len(p2[4]) > 16
checks.extend(["    size_t pos;", "    int decoded;"])
for index, data in enumerate(p2):
    checks.append(f"    unsigned char p2_{index}[] = {cbytes(data)};")
    checks.append("    pos = 0; decoded = 77;")
    end = 0
    for expected, end in decode(data):
        check(f"nextValue(p2_{index}, sizeof p2_{index} * 8, &pos, &decoded) == 1")
        check(f"decoded == {expected} && pos == {end}")
    checks.append("    decoded = 77;")
    check(f"nextValue(p2_{index}, sizeof p2_{index} * 8, &pos, &decoded) == 0")
    check(f"decoded == 77 && pos == {end}")

checks.extend([
    "    unsigned char zero[] = {0};",
    "    unsigned char incomplete[] = {0xf8};",
    "    pos = 0; decoded = 77;",
    "    assert(nextValue(zero, 8, &pos, &decoded) == 0 && pos == 0 && decoded == 77);",
    "    assert(nextValue(incomplete, 8, &pos, &decoded) == -1 && pos == 0 && decoded == 77);",
    "    for (size_t total = 0; total <= 5; ++total) {",
    "        assert(nextValue(zero, total, &pos, &decoded) == 0 && pos == 0 && decoded == 77);",
    "    }",
    "    pos = SIZE_MAX;",
    "    assert(nextValue(zero, 8, &pos, &decoded) == -1 && pos == SIZE_MAX && decoded == 77);",
    "    unsigned char input = 77;",
    "    assert(readByte(&input) == 1 && input == 255);",
    "    assert(readByte(&input) == 1 && input == 255);",
    "    input = 77;",
    "    assert(readByte(&input) == 0 && input == 77);",
    "    assert(readByte(&input) == 1 && input == 1);",
    "    input = 77;",
    "    assert(readByte(&input) == 0 && input == 77);",
])

headers = """#include <assert.h>
#include <limits.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
_Static_assert(CHAR_BIT == 8, "8-bit byte assumption");
_Static_assert(UINT_MAX == 4294967295u && INT_MAX == 2147483647, "32-bit int assumption");
"""
models = "\n\n".join(QUESTIONS[f"A2-METHODS-{i:02d}"]["answer"] for i in range(1, 9))
program = headers + models + "\nint main(void) {\n" + "\n".join(checks) + "\n    return 0;\n}\n"
with tempfile.TemporaryDirectory() as tmp:
    source, binary = Path(tmp) / "a2-models.c", Path(tmp) / "a2-models"
    source.write_text(program)
    subprocess.run(["gcc", "-std=c17", "-pedantic-errors", "-Wall", "-Wextra", "-Werror",
                    "-fsanitize=undefined", "-fno-sanitize-recover=all", str(source), "-o", str(binary)],
                   check=True, capture_output=True, text=True)
    run = subprocess.run([str(binary)], input="0xff ff 100 1 invalid\n", check=True,
                         capture_output=True, text=True, timeout=10)
    assert not run.stdout and not run.stderr
print(f"PASS: {len(QUESTIONS)} prompts; 8 C17 method models; {sum('assert(' in line for line in checks)} independent assertions, including PDF samples, all widths and boundary failures.")
