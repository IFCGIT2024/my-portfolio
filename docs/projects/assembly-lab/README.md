# C → x86 Assembly Lab

A static, browser-only practice app adapted from the uploaded Assembly Learning Tool. It includes **36 translation exercises**, **34 concept questions**, and **102 execution test cases**. No backend, API key, compiler service, database, npm install, or build is needed to run the published app.

## Deployment

Public URL: https://ifcgit2024.github.io/my-portfolio/docs/projects/assembly-lab/index.html

The current live portfolio is served from the repository root. Its card registry is **`/projects.js`**, and its project paths include `docs/projects/…`. This was verified against the live registry rather than inferred from the older repository README. This app stays under `docs/projects/assembly-lab/`; it does not change GitHub Pages configuration.

All assets use relative paths. `index.html` loads `engine.js`, `app.js`, and `styles.css`. The app fetches `data/manifest.json`, then the listed JSON banks. GitHub Pages serves those files directly. There is no server-side execution.

For optional local preview, from the repository root:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/docs/projects/assembly-lab/index.html`. This command only serves files during development; it is not part of deployment. Double-clicking the HTML file is not supported because browsers restrict JSON fetches from `file://` URLs.

## What changed from the upload

- Replaced the unreliable symbolic comparison and syntactic fallback with an explicit parser and bounded IA-32 interpreter.
- Fixed conditional flag handling: the original `cmp` expression could never evaluate and unknown conditions always took the branch.
- Parse commas inside addresses correctly, support base/index/scale/displacement, inline labels, hex/binary constants, and source line errors.
- Preserve case-sensitive symbols and labels; validate duplicate and missing labels before execution.
- Model real address aliasing with little-endian bytes. Pointer and direct accesses see the same memory. The old memory tables were only display data.
- Use 32-bit wrapping arithmetic and the relevant ZF/SF/CF/OF flag rules. Reject other operand sizes explicitly; `movb`, `movw`, and `movq` are not interchangeable with `movl`.
- Reject memory-to-memory instructions, bad destinations, unsupported instructions, uninitialized values, and out-of-bounds memory. No permissive fallback silently accepts code after an interpreter error.
- Replace regex guesses about C declarations and assignments with explicit starting state and expected outputs for every question. The displayed C describes the task; it is not parsed or evaluated.
- Generalize exercises to varying inputs. Conditional questions cover both outcomes and equality boundaries; loop exercises include zero iterations where the precondition allows them. Keep necessary preconditions visible.
- Store progress by stable question ID and a content fingerprint. Editing a question invalidates its old result; adding or reordering questions preserves other progress. Drafts and failed attempts are persisted. Repeating a success cannot inflate the solved total.
- Fix completion/reset behavior, keyboard MCQ input, safe text rendering, storage failure recovery, question navigation, dynamic topics, and useful load errors.
- Move all content into validated JSON banks. New questions do not require edits to the app or interpreter when they use supported instructions.

## Execution contract

Starting memory and any supplied registers already exist. Translate **only the displayed C operations**. Use named input locations rather than baking in the values of the first case. Store requested outputs at their named memory locations (or specified registers). Other memory must keep its initial value. Scratch registers may vary.

The checker runs each case from a fresh state. `expected.memory` and `expected.registers` define the outputs independently of the reference solution. All reference solutions must pass these expectations during validation. Merely matching an answer string or instruction count is never sufficient.

Uninitialized memory is represented by `null`. Reading it is an error; writing it is allowed. Unsupplied registers are uninitialized. The usual `xor %eax, %eax` zeroing idiom is accepted. Named locations receive deterministic nonoverlapping addresses unless `symbols` specifies them. Arrays use keys such as `arr`, `arr+4`, and `arr+8`. A 32-bit `int` occupies four bytes.

## Add a question

1. Copy an entry from `data/example.json` into `data/translation.json`, or create a new JSON bank.
2. Give it a unique lowercase slug ID. IDs must be unique across all loaded banks.
3. Set any descriptive category. Categories are discovered automatically.
4. Write a clear C task, hint, and at least one assembly solution.
5. Define cases with varied initial memory and **independently checked** expected results. Use negative, zero, equal, and boundary inputs where appropriate; respect termination preconditions.
6. Run the tests and try both a correct and an incorrect answer.
7. If you created a new bank, append its filename to `data/manifest.json`. Commit the bank and manifest together. Do not rename a file without updating its manifest entry.

```json
{
  "schemaVersion": 1,
  "questions": [{
    "id": "custom-increment",
    "type": "code",
    "category": "arithmetic",
    "title": "Increment A",
    "cCode": "A = A + 1;",
    "hint": "Read A, add one, and save the result.",
    "solutions": ["addl $1, A"],
    "cases": [
      {"name": "Positive", "memory": {"A": 4}, "expected": {"memory": {"A": 5}}},
      {"name": "Negative", "memory": {"A": -1}, "expected": {"memory": {"A": 0}}}
    ]
  }]
}
```

Optional case fields:

```json
{
  "name": "Pointer input",
  "symbols": {"A": 4096, "B": 4100},
  "registers": {"edx": 4096},
  "memory": {"A": 10, "B": null},
  "expected": {"memory": {"B": 10}}
}
```

For concept questions use `type: "mcq"`, `id`, `category`, `title`, `question`, `options`, `correctAnswer` (zero-based), and `explanation`. See `data/concepts.json`. Avoid equivalent distractors: the original multiplication question contained two options saying the same thing.

The **Add your own questions** panel can import a JSON bank for a session-local trial. It validates the schema, IDs, and reference solutions. It does not upload the file or publish changes. Refreshing removes session-only imports.

## Supported subset and limits

- Registers: `%eax`, `%ebx`, `%ecx`, `%edx`, `%esi`, `%edi`, `%ebp`, `%esp`.
- Data instructions: `mov`, `lea`, `add`, `sub`, two/three operand `imul`, `cmp`, `test`, `and`, `or`, `xor`, `neg`, `inc`, `dec`, `not`, `nop`.
- Branches: `jmp`, `je/jz`, `jne/jnz`, `jg/jnle`, `jge/jnl`, `jl/jnge`, `jle/jng`, `js/jns`, `jo/jno`, `ja/jnbe`, `jae/jnb/jnc`, `jb/jnae/jc`, `jbe/jna`.
- Integer constants: signed decimal, hex, and binary within the 32-bit range. `$symbol+offset` supplies an address.
- Named memory, numeric addresses, register indirect, displacement, and scaled addressing. Index scale is 1, 2, 4, or 8. `%esp` cannot be an index.
- `l` or no suffix means 32-bit in this teaching interpreter. Real assemblers can require a suffix for ambiguous memory-only instructions; explicit `l` is preferred.
- `#` and `//` comments; semicolon-separated instructions; named labels, including an instruction after a label on the same line. Numeric local labels are not supported.
- Maximum 50,000 characters, 1,000 lines/instructions, and 10,000 executed instructions per case. Loops are bounded and cannot freeze the app indefinitely.
- No calls/returns, push/pop, division, shifts, directives, operating-system calls, or mixed-width registers. Unsupported input receives a clear error, not a guessed result.
- `imul` leaves ZF/SF undefined; testing those flags requires a subsequent defining instruction. Parity and auxiliary carry are outside the supported subset.

**Passing is evidence for the listed cases, not a general equivalence proof.** Algebraically equivalent and optimized implementations are allowed when the outputs match. This is not a C compiler or a general-purpose x86 emulator. Assembly arithmetic wraps at 32 bits; ordinary C signed overflow is undefined, and the C exercises avoid it.

## Tests

From the repository root:

```sh
node --test docs/projects/assembly-lab/tests/engine.test.cjs
```

The suite validates every bank and reference solution and tests wrong branches, missing stores, register substitutions, illegal operands, real address aliases, indexed and stack addressing, 32-bit overflow, flag updates, undefined flags, duplicate labels, timeouts, and static asset paths. All 36 reference solutions were also checked with GNU `as --32`.

Browser acceptance checks: loading both modes; wrong/correct answers; distinct solved totals; draft persistence; filtering and navigation; keyboard MCQ selection; reviewed solutions; final-question summary and recovery; reset; failed bank loading; corrupted/unavailable storage; import validation; responsive layout; and portfolio navigation.

## Sources and corrections

The uploaded app, README, styles, question bank, and symbolic checker supplied the starting point. The uploaded **CSCI 1120 Assembly Instructions** (9 March 2026) and **Branching** (11 March 2026) slides supply the subject context. The additional Fall 2026 course files concern other course practice/scheduling and are not published as part of this assembly app. No syllabi, assignments, grades, or school spreadsheet are bundled here.

The Branching slides contain two description errors: the `jne` text on slide 18 reverses the Zero Flag condition; the summary on slide 29 calls `jge` “less than or equal.” Correct semantics are `jne`: ZF = 0, and `jge`: signed greater than or equal. The lesson code and checker use the correct behavior.

Primary technical references:

- [GNU assembler: AT&T syntax](https://sourceware.org/binutils/docs/as/i386_002dVariations.html)
- [GNU assembler: memory references](https://sourceware.org/binutils/docs/as/i386_002dMemory.html)
- [Intel architecture manuals](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)

The localStorage key is scoped to this lab (`mizel:assembly-lab:progress:v1`). No analytics, external scripts, external fonts, or network requests other than the static banks are required. Progress is device/browser-local and is not synchronized between devices.
