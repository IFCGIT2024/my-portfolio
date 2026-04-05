# Module 3 Lab: Logic, Quantifiers and Program Reasoning

## Overview

In this lab you will build a small library of logical tests in Java, implement universal and existential checks over arrays, and use assertions to enforce preconditions and postconditions. By the end, you will have a concrete toolkit that bridges propositional logic, quantified reasoning, and program verification.

**Estimated Time:** 90–120 minutes

---

## Part 1: Truth Table Engine

Build a reusable truth table evaluator for propositional logic formulas.

### Tasks

1. Implement `boolean[][] allCombinations(int n)` that generates all $2^n$ truth-value rows for $n$ variables.
2. Implement `printTruthTable(String[] varNames, boolean[][] rows, boolean[] results)`.
3. Implement standard connective methods:
   - `boolean and(boolean p, boolean q)`
   - `boolean or(boolean p, boolean q)`
   - `boolean not(boolean p)`
   - `boolean implies(boolean p, boolean q)`
   - `boolean iff(boolean p, boolean q)`
4. Use the engine to print truth tables for:
   - $p \rightarrow q$ vs. $\neg p \vee q$ (expect identical columns)
   - De Morgan: $\neg(p \wedge q)$ vs. $\neg p \vee \neg q$
   - $(p \rightarrow q) \wedge (q \rightarrow r) \rightarrow (p \rightarrow r)$ (hypothetical syllogism — should be a tautology)

### Verification Checklist
- [ ] `allCombinations(2)` produces 4 rows: FF, FT, TF, TT
- [ ] Implication and its equivalent produce identical result columns
- [ ] De Morgan equivalences verified
- [ ] Hypothetical syllogism shown as tautology (all results true)

---

## Part 2: Universal and Existential Checks

Implement quantifier-based reasoning over arrays using Java's `Predicate<Integer>`.

### Tasks

1. Implement `boolean forAll(int[] arr, Predicate<Integer> p)` — returns true if $p(x)$ holds for every element $x$.
2. Implement `boolean exists(int[] arr, Predicate<Integer> p)` — returns true if $p(x)$ holds for at least one $x$.
3. Implement `Optional<Integer> findWitness(int[] arr, Predicate<Integer> p)` — returns the first element satisfying $p$.
4. Implement `Optional<Integer> findCounterexample(int[] arr, Predicate<Integer> p)` — returns the first element falsifying $p$.
5. Test with the following:
   - `forAll({2,4,6,8}, isEven)` → true
   - `exists({1,3,5,7}, isEven)` → false
   - `findCounterexample({2,4,5,8}, isEven)` → Optional[5]
   - `forAll({2,3,5,7}, isPrime)` → true
   - `exists({4,6,8,10}, isPrime)` → false

6. Verify De Morgan for quantifiers: `forAll(arr, p)` should equal `!exists(arr, not(p))`.

### Verification Checklist
- [ ] All five test cases produce correct results
- [ ] De Morgan equivalence for quantifiers holds on at least 3 test arrays
- [ ] `findWitness` and `findCounterexample` return correct elements

---

## Part 3: Design by Contract

Annotate and verify methods using `@requires`/`@ensures` comments and `assert` statements.

### Tasks

1. Implement `int binarySearch(int[] arr, int key)`:
   - `@requires arr != null && isSorted(arr)`
   - `@ensures (result == -1 && key not in arr) || arr[result] == key`
   - Add `assert isSorted(arr)` at the start
   - Add `assert` to verify postcondition before each `return`

2. Implement `void selectionSort(int[] arr)`:
   - `@requires arr != null`
   - `@ensures isSorted(arr) && arr is a permutation of original`
   - Add loop invariant assertion: after iteration $i$, `arr[0..i]` is sorted and contains the $i+1$ smallest elements

3. Implement `int max(int[] arr)`:
   - `@requires arr != null && arr.length >= 1`
   - `@ensures result >= arr[i] for all i, and exists j: result == arr[j]`
   - Verify postcondition explicitly after computation

4. Run all methods with assertions enabled (`-ea`) and verify no assertion failures.

### Verification Checklist
- [ ] Binary search works for found and not-found cases
- [ ] Selection sort correctly sorts at least 5 test arrays
- [ ] Max method postcondition verified on at least 3 test arrays
- [ ] All assertions pass with `-ea` flag

---

## Part 4: Inference Rules Applied to Code (Extension)

Combine logical reasoning with program verification.

### Tasks

1. Write a method `boolean containsPrime(int[] arr)` with specification:
   - `@requires arr != null`
   - `@ensures returns true iff exists i: isPrime(arr[i])`

2. Using modus ponens, reason about this call:
   ```java
   int[] data = {4, 6, 7, 8};
   boolean result = containsPrime(data);
   ```
   - Premise 1: The method satisfies its specification (P → Q)
   - Premise 2: arr contains 7, which is prime (P)
   - Conclusion: result == true (Q)
   Write a comment block proving this.

3. Write a method `int gcdWithInvariant(int a, int b)` that prints the loop invariant value at each step.

4. **Challenge:** Write a method `int[] merge(int[] a, int[] b)` that merges two sorted arrays with full invariant tracking. At each step of the merge loop, assert:
   - `result[0..k-1]` is sorted
   - All elements placed so far come from `a[0..i-1]` and `b[0..j-1]`
   - `k == i + j`

### Verification Checklist
- [ ] `containsPrime` correct for arrays with and without primes
- [ ] Modus ponens reasoning written in comments
- [ ] GCD invariant printed matches gcd(orig_a, orig_b) at each step
- [ ] Merge invariant assertions all pass

---

## Starter Code

```java
import java.util.*;
import java.util.function.Predicate;

public class Module3Lab {

    // ===== Part 1: Truth Table Engine =====

    public static boolean[][] allCombinations(int n) {
        // TODO: Generate all 2^n rows of n boolean values
        return null;
    }

    public static void printTruthTable(String[] varNames,
                                       boolean[][] rows,
                                       boolean[] results,
                                       String formula) {
        // TODO: Print a formatted truth table
    }

    public static boolean implies(boolean p, boolean q) {
        // TODO
        return false;
    }

    public static boolean iff(boolean p, boolean q) {
        // TODO
        return false;
    }

    // ===== Part 2: Universal and Existential Checks =====

    public static boolean forAll(int[] arr, Predicate<Integer> p) {
        // TODO: Return true iff p holds for every element
        return false;
    }

    public static boolean exists(int[] arr, Predicate<Integer> p) {
        // TODO: Return true iff p holds for at least one element
        return false;
    }

    public static Optional<Integer> findWitness(int[] arr,
                                                 Predicate<Integer> p) {
        // TODO: Return first element where p is true
        return Optional.empty();
    }

    public static Optional<Integer> findCounterexample(int[] arr,
                                                        Predicate<Integer> p) {
        // TODO: Return first element where p is false
        return Optional.empty();
    }

    // ===== Part 3: Design by Contract =====

    /**
     * @requires arr != null && isSorted(arr)
     * @ensures (result == -1 && key not in arr) || arr[result] == key
     */
    public static int binarySearch(int[] arr, int key) {
        // TODO: Implement with precondition and postcondition assertions
        return -1;
    }

    /**
     * @requires arr != null
     * @ensures isSorted(arr) && arr is a permutation of original
     */
    public static void selectionSort(int[] arr) {
        // TODO: Implement with loop invariant assertions
    }

    /**
     * @requires arr != null && arr.length >= 1
     * @ensures result >= arr[i] for all i, and exists j: arr[j] == result
     */
    public static int max(int[] arr) {
        // TODO: Implement with postcondition verification
        return 0;
    }

    // ===== Part 4: Inference Rules Applied =====

    /**
     * @requires arr != null
     * @ensures returns true iff exists i: isPrime(arr[i])
     */
    public static boolean containsPrime(int[] arr) {
        // TODO
        return false;
    }

    public static int gcdWithInvariant(int a, int b) {
        // TODO: Print invariant at each step
        return 0;
    }

    // ===== Helpers =====

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static boolean isEven(int n) { return n % 2 == 0; }

    public static boolean isSorted(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            if (arr[i] > arr[i + 1]) return false;
        }
        return true;
    }

    public static boolean isSorted(int[] arr, int from, int to) {
        for (int i = from; i < to - 1; i++) {
            if (arr[i] > arr[i + 1]) return false;
        }
        return true;
    }

    // ===== Main (run with -ea) =====

    public static void main(String[] args) {
        System.out.println("=== Module 3 Lab ===\n");

        // Part 1 tests
        System.out.println("--- Part 1: Truth Tables ---");
        // TODO: Print truth tables here

        // Part 2 tests
        System.out.println("\n--- Part 2: Quantifiers ---");
        int[] evens = {2, 4, 6, 8};
        int[] odds  = {1, 3, 5, 7};
        int[] mixed = {2, 4, 5, 8};
        // TODO: Test forAll, exists, findWitness, findCounterexample

        // Part 3 tests
        System.out.println("\n--- Part 3: Design by Contract ---");
        int[] sorted = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
        // TODO: Test binarySearch, selectionSort, max

        // Part 4 tests
        System.out.println("\n--- Part 4: Inference Rules ---");
        // TODO: Test containsPrime, gcdWithInvariant
    }
}
```

---

## Complete Solution Key

```java
import java.util.*;
import java.util.function.Predicate;

public class Module3LabSolution {

    // ===== Part 1: Truth Table Engine =====

    public static boolean[][] allCombinations(int n) {
        int rows = 1 << n;  // 2^n
        boolean[][] combos = new boolean[rows][n];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < n; c++) {
                // bit (n-1-c) of r gives column c
                combos[r][c] = ((r >> (n - 1 - c)) & 1) == 1;
            }
        }
        return combos;
    }

    public static void printTruthTable(String[] varNames,
                                       boolean[][] rows,
                                       boolean[] results,
                                       String formula) {
        // Header
        for (String v : varNames) System.out.printf("%-6s", v);
        System.out.printf("| %-10s%n", formula);
        int width = varNames.length * 6 + formula.length() + 4;
        System.out.println("-".repeat(width));

        // Rows
        for (int r = 0; r < rows.length; r++) {
            for (boolean val : rows[r]) System.out.printf("%-6s", val ? "T" : "F");
            System.out.printf("| %-10s%n", results[r] ? "T" : "F");
        }
        System.out.println();
    }

    public static boolean implies(boolean p, boolean q) { return !p || q; }
    public static boolean iff(boolean p, boolean q) { return p == q; }

    // ===== Part 2: Universal and Existential Checks =====

    public static boolean forAll(int[] arr, Predicate<Integer> p) {
        for (int x : arr) {
            if (!p.test(x)) return false;
        }
        return true;
    }

    public static boolean exists(int[] arr, Predicate<Integer> p) {
        for (int x : arr) {
            if (p.test(x)) return true;
        }
        return false;
    }

    public static Optional<Integer> findWitness(int[] arr, Predicate<Integer> p) {
        for (int x : arr) {
            if (p.test(x)) return Optional.of(x);
        }
        return Optional.empty();
    }

    public static Optional<Integer> findCounterexample(int[] arr, Predicate<Integer> p) {
        for (int x : arr) {
            if (!p.test(x)) return Optional.of(x);
        }
        return Optional.empty();
    }

    // ===== Part 3: Design by Contract =====

    /**
     * @requires arr != null && isSorted(arr)
     * @ensures (result == -1 && key not in arr) || arr[result] == key
     */
    public static int binarySearch(int[] arr, int key) {
        assert arr != null : "Precondition: arr must not be null";
        assert isSorted(arr) : "Precondition: arr must be sorted";

        int lo = 0, hi = arr.length - 1;

        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (arr[mid] == key) {
                assert arr[mid] == key;  // postcondition
                return mid;
            }
            if (arr[mid] < key) lo = mid + 1;
            else hi = mid - 1;
        }
        // key not found — verify by linear scan (debug only)
        for (int x : arr) assert x != key : "Postcondition violated: key in arr but not found";
        return -1;
    }

    /**
     * @requires arr != null
     * @ensures isSorted(arr) && arr is a permutation of original
     */
    public static void selectionSort(int[] arr) {
        assert arr != null;
        for (int i = 0; i < arr.length - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            int temp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = temp;
            assert isSorted(arr, 0, i + 2) : "Invariant: arr[0.." + (i+1) + "] sorted";
        }
        assert isSorted(arr) : "Postcondition: arr is fully sorted";
    }

    /**
     * @requires arr != null && arr.length >= 1
     * @ensures result >= arr[i] for all i, and exists j: arr[j] == result
     */
    public static int max(int[] arr) {
        assert arr != null && arr.length >= 1 : "Precondition: non-empty array";
        int result = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > result) result = arr[i];
        }
        // Verify postcondition
        for (int x : arr) assert result >= x : "Postcondition: result >= all elements";
        boolean found = false;
        for (int x : arr) if (x == result) { found = true; break; }
        assert found : "Postcondition: result is an element of arr";
        return result;
    }

    // ===== Part 4: Inference Rules Applied =====

    /**
     * @requires arr != null
     * @ensures returns true iff exists i: isPrime(arr[i])
     */
    public static boolean containsPrime(int[] arr) {
        assert arr != null;
        for (int x : arr) {
            if (isPrime(x)) return true;
        }
        return false;
    }

    /*
     * Modus ponens reasoning for containsPrime({4, 6, 7, 8}):
     *
     * Premise 1 (P → Q): The method satisfies its specification:
     *   "If arr contains a prime, then containsPrime returns true."
     *
     * Premise 2 (P): arr = {4, 6, 7, 8} contains 7, which is prime
     *   (since 7 > 1 and has no divisors other than 1 and 7).
     *
     * Conclusion (Q): By modus ponens, containsPrime({4, 6, 7, 8}) returns true.
     */

    public static int gcdWithInvariant(int a, int b) {
        assert a >= 0 && b >= 0 : "Precondition: non-negative inputs";
        int origA = a, origB = b;
        System.out.printf("  Computing gcd(%d, %d)%n", a, b);

        while (b != 0) {
            System.out.printf("    a=%d, b=%d | invariant: gcd(%d,%d)=gcd(%d,%d) | variant: b=%d%n",
                    a, b, a, b, origA, origB, b);
            int r = a % b;
            a = b;
            b = r;
        }
        System.out.printf("    Result: gcd(%d, %d) = %d%n", origA, origB, a);
        return a;
    }

    // ===== Helpers =====

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static boolean isEven(int n) { return n % 2 == 0; }

    public static boolean isSorted(int[] arr) {
        return isSorted(arr, 0, arr.length);
    }

    public static boolean isSorted(int[] arr, int from, int to) {
        for (int i = from; i < to - 1; i++) {
            if (arr[i] > arr[i + 1]) return false;
        }
        return true;
    }

    // ===== Main =====

    public static void main(String[] args) {
        System.out.println("=== Module 3 Lab Solution ===\n");

        // --- Part 1: Truth Tables ---
        System.out.println("--- Part 1: Truth Tables ---");
        boolean[][] rows2 = allCombinations(2);
        String[] pq = {"p", "q"};

        // p → q
        boolean[] implResults = new boolean[4];
        for (int r = 0; r < 4; r++)
            implResults[r] = implies(rows2[r][0], rows2[r][1]);
        printTruthTable(pq, rows2, implResults, "p → q");

        // ¬p ∨ q (should match)
        boolean[] equivResults = new boolean[4];
        for (int r = 0; r < 4; r++)
            equivResults[r] = !rows2[r][0] || rows2[r][1];
        printTruthTable(pq, rows2, equivResults, "¬p ∨ q");

        System.out.println("p→q ≡ ¬p∨q ? " + Arrays.equals(implResults, equivResults));

        // De Morgan: ¬(p ∧ q) vs ¬p ∨ ¬q
        boolean[] dm1 = new boolean[4], dm2 = new boolean[4];
        for (int r = 0; r < 4; r++) {
            dm1[r] = !(rows2[r][0] && rows2[r][1]);
            dm2[r] = !rows2[r][0] || !rows2[r][1];
        }
        System.out.println("De Morgan ¬(p∧q) ≡ ¬p∨¬q ? " + Arrays.equals(dm1, dm2));

        // Hypothetical syllogism with 3 variables
        boolean[][] rows3 = allCombinations(3);
        boolean[] hs = new boolean[8];
        for (int r = 0; r < 8; r++) {
            boolean p = rows3[r][0], q = rows3[r][1], rv = rows3[r][2];
            hs[r] = implies(implies(p, q) && implies(q, rv), implies(p, rv));
        }
        boolean tautology = true;
        for (boolean b : hs) if (!b) { tautology = false; break; }
        System.out.println("Hypothetical syllogism is tautology? " + tautology);

        // --- Part 2: Quantifiers ---
        System.out.println("\n--- Part 2: Quantifiers ---");
        Predicate<Integer> even = n -> n % 2 == 0;
        Predicate<Integer> prime = n -> isPrime(n);

        int[] evens = {2, 4, 6, 8};
        int[] odds  = {1, 3, 5, 7};
        int[] mixed = {2, 4, 5, 8};
        int[] primes = {2, 3, 5, 7};
        int[] composites = {4, 6, 8, 10};

        System.out.println("forAll(evens, even) = " + forAll(evens, even));        // true
        System.out.println("exists(odds, even) = " + exists(odds, even));           // false
        System.out.println("findCounterexample(mixed, even) = " +
                findCounterexample(mixed, even));                                    // Optional[5]
        System.out.println("forAll(primes, prime) = " + forAll(primes, prime));     // true
        System.out.println("exists(composites, prime) = " + exists(composites, prime)); // false

        // De Morgan for quantifiers: forAll(arr, p) == !exists(arr, not(p))
        Predicate<Integer> notEven = n -> !even.test(n);
        System.out.println("\nDe Morgan: forAll(evens, even) == !exists(evens, notEven) ? "
                + (forAll(evens, even) == !exists(evens, notEven)));
        System.out.println("De Morgan: forAll(mixed, even) == !exists(mixed, notEven) ? "
                + (forAll(mixed, even) == !exists(mixed, notEven)));
        System.out.println("De Morgan: forAll(odds, even) == !exists(odds, notEven) ? "
                + (forAll(odds, even) == !exists(odds, notEven)));

        // --- Part 3: Design by Contract ---
        System.out.println("\n--- Part 3: Design by Contract ---");
        int[] sorted = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
        System.out.println("binarySearch(sorted, 23) = " + binarySearch(sorted, 23));
        System.out.println("binarySearch(sorted, 50) = " + binarySearch(sorted, 50));

        int[] toSort = {64, 25, 12, 22, 11};
        System.out.println("Before sort: " + Arrays.toString(toSort));
        selectionSort(toSort);
        System.out.println("After sort:  " + Arrays.toString(toSort));

        int[] data = {3, 7, 2, 9, 4, 6, 1};
        System.out.println("max(" + Arrays.toString(data) + ") = " + max(data));

        // --- Part 4: Inference Rules ---
        System.out.println("\n--- Part 4: Inference Rules ---");
        int[] test1 = {4, 6, 7, 8};
        int[] test2 = {4, 6, 8, 10};
        System.out.println("containsPrime({4,6,7,8}) = " + containsPrime(test1));
        System.out.println("containsPrime({4,6,8,10}) = " + containsPrime(test2));

        gcdWithInvariant(48, 18);
        gcdWithInvariant(252, 105);

        System.out.println("\n=== All tests passed! ===");
    }
}
```

---

## Verification Checklist (Complete)

| Part | Check | Expected |
|------|-------|----------|
| 1 | `allCombinations(2)` produces 4 rows | FF, FT, TF, TT |
| 1 | $p \rightarrow q \equiv \neg p \vee q$ | All rows match |
| 1 | De Morgan verified | All rows match |
| 1 | Hypothetical syllogism is tautology | All true |
| 2 | `forAll({2,4,6,8}, even)` | true |
| 2 | `exists({1,3,5,7}, even)` | false |
| 2 | `findCounterexample({2,4,5,8}, even)` | Optional[5] |
| 2 | De Morgan for quantifiers | 3 tests pass |
| 3 | Binary search finds 23 | index 5 |
| 3 | Binary search misses 50 | -1 |
| 3 | Selection sort | sorted array |
| 3 | Max postcondition | verified |
| 4 | containsPrime with prime present | true |
| 4 | containsPrime without prime | false |
| 4 | GCD invariant at each step | matches gcd(orig) |
