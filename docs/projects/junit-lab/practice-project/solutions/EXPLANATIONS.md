# Defect explanations

Try the exercises before reading this file. These are diagnoses of the supplied faulty code, not claims about every possible implementation.

| Operation | Revealing case | Contract / observation | Cause and correction |
| --- | --- | --- | --- |
| `countPositive` | `new int[]{3}` | Expected 1, actual 0 | `i < values.length - 1` skips the final element. Use `i < values.length`. |
| `contains` | Two distinct `new String("tea")` objects | Expected true, actual false | `==` compares identity. Since target is checked non-null, use `target.equals(name)`, which also safely returns false for a null element. |
| `hasDiscount` | age 65 | Expected true, actual false | `>` excludes the documented inclusive threshold. Use `age >= 65`. |
| `validName` | null | Expected false, actual NPE | `isEmpty` dereferences before the null check. Use `name != null && !name.isEmpty()`. |
| `Counter.set` | set 3, then set 5 | Expected 5, actual 8 | `+=` accumulates. Use `count = value` after validation. A single set from zero would miss this defect. |
| `Buffer.take` | put "tea", then take | Returned item is right, but size is 1 instead of 0 | The item is removed without updating the size invariant. Set `size = 0` when clearing the item. |

After applying the corrections, the six fault-finding tests pass. Add further cases before concluding the methods are sufficiently tested: empty and multiple elements, absent Strings, the value below and above a threshold, normal inputs after guard changes, repeated setters, and repeated empty takes.

The corrections are small, but the reason matters. A precise explanation contains the input, expected result, actual result, and the expression that causes the difference.

## Example report

**Title:** `Counter.set` adds instead of replacing.

**Contract:** `set(int value)` replaces the old nonnegative count. A negative input is rejected without changing state.

**Reproduction:** Construct `BrokenUtilities.Counter`, call `set(3)`, then `set(5)`, then `get()`.

**Expected:** 5.

**Actual:** 8. JUnit reports `expected: <5> but was: <8>`.

**Cause:** `count += value` adds the argument to the previous state. The second call evaluates 3 + 5.

**Correction:** Replace the accumulation with `count = value`, preserving the negative-input guard.

**Regression:** Keep `set_replacesInsteadOfAccumulating`; also check zero replacement and unchanged state after rejected negative input.

**Verification:** Fill in the result of your actual rerun. Writing this proposed correction does not by itself verify it.
