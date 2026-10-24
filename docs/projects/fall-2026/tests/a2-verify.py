"""Independently verify the self-contained C models and worked values.

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


def packed(fields):
    # Widths are supplied by each test case; no hidden framing or headers.
    stream = "".join(f"{value % 2 ** width:0{width}b}" for width, value in fields)
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

# The bank's range questions are also checked against independent powers.
for qid, expected in [("A2-SIGNED-08", -(2 ** 30)),
                      ("A2-SIGNED-13", 2 ** 30 - 1)]:
    assert int(QUESTIONS[qid]["answer"]) == expected, qid

# Repeated fixed-width reads use explicit widths and independent signed values.
# Include a long buffer and fields crossing byte boundaries at every width.
field_groups = [
    [(1, 0), (1, -1), (2, 1), (2, -2)],
    [(8, 123), (12, 1234), (25, 12345678)],
    [(4, (i % 16) - 8) for i in range(60)],
    [(31, -1073741824), (31, 1073741823), (1, -1), (1, 0)],
    [(width, -(2 ** (width - 1))) for width in range(1, 32)],
]
assert len(packed(field_groups[2])) > 16
checks.extend(["    size_t pos;", "    int decoded;"])
for index, fields in enumerate(field_groups):
    data = packed(fields)
    total = sum(width for width, _ in fields)
    checks.append(f"    unsigned char fields_{index}[] = {cbytes(data)};")
    checks.append("    pos = 0; decoded = 77;")
    end = 0
    for width, expected in fields:
        assert signed(bits(data)[end:end + width]) == expected
        end += width
        check(f"nextValue(fields_{index}, {total}, &pos, {width}, &decoded) == 1")
        check(f"decoded == {expected} && pos == {end}")
    checks.append("    decoded = 77;")
    check(f"nextValue(fields_{index}, {total}, &pos, 1, &decoded) == 0")
    check(f"decoded == 77 && pos == {end}")

checks.extend([
    "    unsigned char zero[] = {0};",
    "    pos = 0; decoded = 77;",
    "    assert(nextValue(zero, 0, &pos, 1, &decoded) == 0 && pos == 0 && decoded == 77);",
    "    assert(nextValue(zero, 8, &pos, 9, &decoded) == -1 && pos == 0 && decoded == 77);",
    "    assert(nextValue(zero, 8, &pos, 0, &decoded) == -1 && pos == 0 && decoded == 77);",
    "    assert(nextValue(zero, 8, &pos, 32, &decoded) == -1 && pos == 0 && decoded == 77);",
    "    assert(nextValue(zero, 0, &pos, 0, &decoded) == -1 && pos == 0 && decoded == 77);",
    "    for (size_t total = 1; total <= 7; ++total) {",
    "        assert(nextValue(zero, total, &pos, 8, &decoded) == -1 && pos == 0 && decoded == 77);",
    "    }",
    "    pos = SIZE_MAX;",
    "    assert(nextValue(zero, 8, &pos, 1, &decoded) == -1 && pos == SIZE_MAX && decoded == 77);",
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
# Execute the actual standalone numeric snippets, rather than keeping old
# answers from superficially similar exercises. Only defined snippets are here.
snippet_targets = {
    "A2-FORMAT-11": "x", "A2-FORMAT-12": "x",
    "A2-POINTERS-03": "x", "A2-POINTERS-04": "data[0]",
    "A2-POINTERS-07": "sizeof data",
    "A2-POINTERS-08": "sizeof values / sizeof values[0]",
    "A2-MEMORY-08": "data[3]", "A2-MEMORY-10": "data[0]",
    "A2-MASKS-02": "x", "A2-MASKS-06": "x",
    "A2-MASKS-08": "x", "A2-MASKS-10": "x",
    "A2-FIELDS-07": "pos", "A2-FIELDS-08": "pos",
    "A2-CURSOR-01": "steps", "A2-CURSOR-02": "count",
    "A2-CURSOR-05": "pos", "A2-CURSOR-06": "pos",
    "A2-CURSOR-07": "count", "A2-CURSOR-08": "count",
    "A2-CURSOR-09": "final", "A2-CURSOR-10": "count",
    "A2-TRACES-01": "result", "A2-TRACES-02": "result",
    "A2-TRACES-03": "value", "A2-TRACES-04": "value",
    "A2-TRACES-05": "raw", "A2-TRACES-06": "raw",
}
for qid, target in snippet_targets.items():
    question = QUESTIONS[qid]
    assert question["type"] == "number", qid
    code = question["code"]
    if "/* In the caller: */" in code:
        function, code = code.split("/* In the caller: */", 1)
        models += "\n" + function
    checks.append("    { /* " + qid + " */\n" + code)
    check(f"({target}) == {int(question['answer'])}")
    checks.append("    }")
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
print(f"PASS: {len(QUESTIONS)} prompts; 8 C17 method models; {len(snippet_targets)} standalone C snippets; {sum('assert(' in line for line in checks)} independent assertions, including all widths and boundary failures.")
