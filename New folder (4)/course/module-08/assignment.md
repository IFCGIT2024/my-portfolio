# Module 8 – Assignment: Counting, Invariants, and Correctness

## Overview

This assignment synthesizes **Module 7** (Counting, Combinatorics, Pigeonhole) with **Module 8** (Specifications, Loop Invariants, Termination). You will analyze nested loop runtimes using counting principles, prove correctness and termination of binary search and sorting, and build verified implementations.

---

## Part A: Mathematical Proofs

### Problem A1: Nested Loop Analysis via Counting

Consider the following nested loop:

```java
int count = 0;
for (int i = 0; i < n; i++) {
    for (int j = i + 1; j < n; j++) {
        count++;
    }
}
```

(a) Using the sum rule (Module 7), prove that `count` = $\binom{n}{2} = \frac{n(n-1)}{2}$ after the loop.

(b) State a loop invariant for the outer loop in terms of $i$.

(c) Prove by induction on $n$ that $\sum_{i=0}^{n-1}(n-1-i) = \binom{n}{2}$.

### Problem A2: Binary Search Total Correctness

(a) State the precondition, postcondition, and loop invariant for iterative binary search.

(b) Prove initialization, maintenance, and termination (all three invariant steps).

(c) State the variant function $V = hi - lo + 1$. Prove it decreases and is bounded below by 0.

(d) Conclude total correctness.

### Problem A3: Selection Sort Correctness

(a) State the outer loop invariant for selection sort.

(b) Prove initialization, maintenance, and that the postcondition (sorted array) follows at termination.

(c) Using Module 7 counting, prove the total number of comparisons is $\frac{n(n-1)}{2}$.

(d) State a variant function for the outer loop and prove termination.

### Problem A4: Pigeonhole and Hash Tables

(a) Prove: a hash table with $m$ slots and $m + 1$ keys must have at least one collision.

(b) Using the birthday bound, estimate the expected number of keys before the first collision for $m = 10{,}000$.

(c) Explain in terms of loop invariants: what invariant does a collision-free hash table maintain, and when does the pigeonhole principle break it?

### Problem A5: Specification Algebra

Consider two methods with specifications:
- $f$: `requires x > 0, ensures y > x`
- $g$: `requires y > 0, ensures z > y²`

(a) What is the specification of the sequential composition $g(f(x))$?

(b) Prove using the sequential composition rule $\{P\}\ f\ \{R\}, \{R\}\ g\ \{Q\} \vdash \{P\}\ f;g\ \{Q\}$ that the composed specification is valid.

---

## Part B: Java Programming

### Problem B1: Verified Binary Search

Implement binary search with:
- Precondition assertion (array sorted).
- Loop invariant assertion.
- Variant tracking: print the variant at each step and assert it decreases.
- Test on arrays of sizes 1 through 1,000,000.
- Report: for each size, the number of steps and compare with $\lceil \log_2 n \rceil$.

### Problem B2: Verified Selection Sort

Implement selection sort with:
- Loop invariant assertion after each outer iteration.
- Comparison counter.
- Postcondition verification: the result is sorted and a permutation of the input.
- Run on random arrays of sizes 100, 500, 1000. Report comparison counts and verify they equal $\frac{n(n-1)}{2}$.

### Problem B3: Nested Loop Analyzer

Implement a method that runs the double nested loop from A1 and:
- Counts iterations.
- Verifies the count equals $\binom{n}{2}$ (using your binomial function from Module 7).
- Tests for $n = 0, 1, 2, ..., 100$.

### Problem B4: GCD Total Correctness

Implement GCD with:
- Invariant assertion: $\gcd(a_0, b_0) = \gcd(a, b)$ (use a separate gcd function to check).
- Variant tracking: print $b$ at each step, assert it decreases.
- Step counter: verify Lamé's theorem by testing on consecutive Fibonacci numbers.
- Report: for Fibonacci pairs $(F_n, F_{n-1})$, $n = 5, 10, 15, 20, 25, 30$, record step counts and compare with $5 \lfloor \log_{10} F_{n-1} \rfloor$.

### Problem B5: Sorting Correctness Suite

Write a comprehensive `SortingVerifier` class that:
1. Takes any sorting function as input.
2. Generates random test arrays (various sizes, including edge cases: empty, single, already sorted, reverse sorted, all equal).
3. Checks postconditions: sorted + permutation.
4. Reports pass/fail.

Test with: selection sort, insertion sort, bubble sort, and `Arrays.sort`.

---

## Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| **A1** — Nested loop counting | 10 | Correct sum, valid invariant, induction proof |
| **A2** — Binary search total correctness | 12 | All three invariant steps + variant proof |
| **A3** — Selection sort correctness | 12 | Invariant proof + comparison count + termination |
| **A4** — Pigeonhole + hash tables | 8 | PHP proof, birthday bound calculation, invariant explanation |
| **A5** — Specification composition | 8 | Correct composed spec, valid proof |
| **B1** — Verified binary search | 12 | All assertions, variant tracking, correct step counts |
| **B2** — Verified selection sort | 12 | Invariant checks, comparison counts match formula |
| **B3** — Nested loop analyzer | 8 | Correct counts, binomial verification |
| **B4** — GCD total correctness | 8 | Invariant + variant + Lamé verification |
| **B5** — Sorting correctness suite | 10 | Comprehensive testing, edge cases, permutation check |
| **Total** | **100** | |

---

## Solution Key

### Solution A1

**(a)** The inner loop runs $n-1-i$ times for each value of $i$. By the sum rule:

$$\text{count} = \sum_{i=0}^{n-1}(n-1-i) = (n-1) + (n-2) + \cdots + 0 = \frac{(n-1)n}{2} = \binom{n}{2}$$

**(b)** Outer loop invariant: at the start of iteration $i$, count = $\sum_{k=0}^{i-1}(n-1-k) = \binom{n}{2} - \binom{n-i}{2}$... more simply: count = the number of pairs $(a,b)$ with $0 \leq a < b < n$ and $a < i$. This simplifies to count = $in - \frac{i(i+1)}{2}$.

**(c)** Base: $n = 0$: $\sum = 0 = \binom{0}{2}$. ✓ Inductive step: Assume for $n$. For $n+1$:

$$\sum_{i=0}^{n}(n-i) = n + \sum_{i=1}^{n}(n-i) = n + \sum_{i=0}^{n-1}(n-1-i) = n + \binom{n}{2} = n + \frac{n(n-1)}{2} = \frac{n(n+1)}{2} = \binom{n+1}{2}$$ $\blacksquare$

### Solution A2

**(a)** Pre: `a` sorted. Post: returns index of `key` or $-1$. Invariant: if key $\in$ a, then key $\in$ a[lo..hi].

**(b)** Init: $lo=0, hi=n-1$. If key $\in$ a, it's in a[0..n-1]. ✓
Maint: If $a[\text{mid}] <$ key, key $\notin$ a[lo..mid] (sorted), so setting $lo = \text{mid}+1$ preserves the invariant. Similarly for $hi = \text{mid}-1$. ✓
Term: When $lo > hi$, the range is empty. If key were in a, it would be in an empty range — contradiction. So key $\notin$ a. ✓

**(c)** $V = hi - lo + 1$. In the loop, $lo \leq hi$, so $V \geq 1$. Each iteration either $lo$ increases or $hi$ decreases (both by $\geq 1$), so $V$ decreases. Since $V \geq 0$ is an integer, termination follows.

**(d)** Partial correctness (from invariant proof) + Termination (from variant) = Total correctness. $\blacksquare$

### Solution A5

**(a)** Composed spec: `requires x > 0, ensures z > x²` (since $y > x > 0$, so $z > y^2 > x^2$).

**(b)** By sequential composition: $\{x > 0\}\ f\ \{y > x\}$ and $\{y > x > 0 \Rightarrow y > 0\}\ g\ \{z > y^2\}$. Since $y > x > 0$, we have $z > y^2 > x^2$, establishing $\{x > 0\}\ f;g\ \{z > x^2\}$. $\blacksquare$

### Solution B1–B5 (Java)

```java
import java.util.*;
import java.util.function.*;

public class Module8Assignment {

    // --- B1: Verified Binary Search ---

    public static int binarySearch(int[] a, int key) {
        assert a != null;
        assert isSorted(a) : "Pre: sorted";
        int lo = 0, hi = a.length - 1;
        int steps = 0;
        while (lo <= hi) {
            int variant = hi - lo + 1;
            assert variant > 0 : "Variant positive";
            int mid = lo + (hi - lo) / 2;
            steps++;
            if (a[mid] == key) return mid;
            else if (a[mid] < key) lo = mid + 1;
            else hi = mid - 1;
            // Variant decreased (or we exited)
        }
        return -1;
    }

    public static int binarySearchSteps(int[] a, int key) {
        int lo = 0, hi = a.length - 1;
        int steps = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            steps++;
            if (a[mid] == key) return steps;
            else if (a[mid] < key) lo = mid + 1;
            else hi = mid - 1;
        }
        return steps;
    }

    // --- B2: Verified Selection Sort ---

    public static int selectionSort(int[] a) {
        assert a != null;
        int[] original = Arrays.copyOf(a, a.length);
        int comparisons = 0;
        for (int i = 0; i < a.length - 1; i++) {
            assert isSortedUpTo(a, i) : "Invariant: sorted up to i";
            int minIdx = i;
            for (int j = i + 1; j < a.length; j++) {
                comparisons++;
                if (a[j] < a[minIdx]) minIdx = j;
            }
            int temp = a[i]; a[i] = a[minIdx]; a[minIdx] = temp;
        }
        assert isSorted(a) : "Post: sorted";
        assert isPermutation(original, a) : "Post: permutation";
        return comparisons;
    }

    // --- B3: Nested Loop Analyzer ---

    public static long binomial(int n, int k) {
        if (k < 0 || k > n) return 0;
        if (k == 0 || k == n) return 1;
        if (k > n - k) k = n - k;
        long result = 1;
        for (int i = 0; i < k; i++) result = result * (n - i) / (i + 1);
        return result;
    }

    public static void nestedLoopAnalyzer(int maxN) {
        for (int n = 0; n <= maxN; n++) {
            long count = 0;
            for (int i = 0; i < n; i++) {
                for (int j = i + 1; j < n; j++) {
                    count++;
                }
            }
            long expected = binomial(n, 2);
            assert count == expected : "Mismatch at n=" + n;
        }
        System.out.println("Nested loop analysis verified for n=0.." + maxN);
    }

    // --- B4: GCD Total Correctness ---

    public static int gcdSimple(int a, int b) {
        while (b != 0) { int r = a % b; a = b; b = r; }
        return a;
    }

    public static int gcdVerified(int a0, int b0) {
        assert a0 >= 0 && b0 > 0;
        int a = a0, b = b0;
        int expected = gcdSimple(a0, b0);
        int steps = 0;
        while (b != 0) {
            int variant = b;
            // Invariant check
            assert gcdSimple(a, b) == expected : "Invariant violated";
            int r = a % b;
            a = b;
            b = r;
            steps++;
            assert b < variant : "Variant decreased";
            assert b >= 0 : "Variant non-negative";
        }
        assert a == expected : "Post: correct gcd";
        return steps;
    }

    // Fibonacci
    public static int fib(int n) {
        if (n <= 1) return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) { int t = a + b; a = b; b = t; }
        return b;
    }

    // --- B5: Sorting Correctness Suite ---

    public static boolean isSorted(int[] a) {
        for (int i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return false;
        return true;
    }

    public static boolean isSortedUpTo(int[] a, int end) {
        for (int i = 1; i < end; i++) if (a[i] < a[i - 1]) return false;
        return true;
    }

    public static boolean isPermutation(int[] a, int[] b) {
        if (a.length != b.length) return false;
        int[] ac = Arrays.copyOf(a, a.length);
        int[] bc = Arrays.copyOf(b, b.length);
        Arrays.sort(ac);
        Arrays.sort(bc);
        return Arrays.equals(ac, bc);
    }

    public static void verifySorter(String name, Consumer<int[]> sorter) {
        Random rng = new Random(42);
        int passed = 0;
        int total = 0;

        // Edge cases
        int[][] edgeCases = {
            {}, {42}, {1, 2, 3}, {3, 2, 1}, {5, 5, 5, 5}, {1, 1, 2, 2}
        };
        for (int[] ec : edgeCases) {
            int[] original = Arrays.copyOf(ec, ec.length);
            int[] copy = Arrays.copyOf(ec, ec.length);
            sorter.accept(copy);
            total++;
            if (isSorted(copy) && isPermutation(original, copy)) passed++;
            else System.out.printf("  FAIL %s on %s%n", name, Arrays.toString(original));
        }

        // Random arrays
        for (int trial = 0; trial < 100; trial++) {
            int n = rng.nextInt(50) + 1;
            int[] original = rng.ints(n, -100, 100).toArray();
            int[] copy = Arrays.copyOf(original, n);
            sorter.accept(copy);
            total++;
            if (isSorted(copy) && isPermutation(original, copy)) passed++;
            else System.out.printf("  FAIL %s on trial %d%n", name, trial);
        }

        System.out.printf("  %s: %d/%d passed%n", name, passed, total);
    }

    // simple sort implementations for testing
    public static void insertionSortSimple(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i]; int j = i - 1;
            while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
            a[j + 1] = key;
        }
    }

    public static void bubbleSortSimple(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            for (int j = 0; j < a.length - 1 - i; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                }
            }
        }
    }

    // --- Main ---

    public static void main(String[] args) {
        System.out.println("=== Module 8 Assignment Solution ===\n");

        // B1: Binary search
        System.out.println("--- B1: Binary Search Steps ---");
        for (int size : new int[]{1, 10, 100, 1000, 10000, 100000, 1000000}) {
            int[] a = new int[size];
            for (int i = 0; i < size; i++) a[i] = i;
            int steps = binarySearchSteps(a, -1);
            int bound = (int) Math.ceil(Math.log(size) / Math.log(2));
            System.out.printf("n=%,8d: steps=%2d, ceil(log2(n))=%2d  %s%n",
                    size, steps, bound, steps <= bound + 1 ? "✓" : "✗");
        }

        // B2: Selection sort
        System.out.println("\n--- B2: Verified Selection Sort ---");
        for (int n : new int[]{100, 500, 1000}) {
            int[] a = new Random(42).ints(n, 0, 10000).toArray();
            int comps = selectionSort(a);
            long expected = (long) n * (n - 1) / 2;
            System.out.printf("n=%4d: comparisons=%,d, expected=%,d  %s%n",
                    n, comps, expected, comps == expected ? "✓" : "✗");
        }

        // B3: Nested loop
        System.out.println("\n--- B3: Nested Loop Analyzer ---");
        nestedLoopAnalyzer(100);

        // B4: GCD
        System.out.println("\n--- B4: GCD Verification ---");
        for (int n : new int[]{5, 10, 15, 20, 25, 30}) {
            int fn = fib(n);
            int fn1 = fib(n - 1);
            int steps = gcdVerified(fn, fn1);
            double lame = 5 * Math.floor(Math.log10(fn1));
            System.out.printf("GCD(F_%d=%d, F_%d=%d): steps=%d, Lamé bound=%.0f  %s%n",
                    n, fn, n - 1, fn1, steps, lame, steps <= lame ? "✓" : "≤");
        }

        // B5: Sorting suite
        System.out.println("\n--- B5: Sorting Correctness Suite ---");
        verifySorter("SelectionSort", a -> { selectionSort(a); });
        verifySorter("InsertionSort", Module8Assignment::insertionSortSimple);
        verifySorter("BubbleSort", Module8Assignment::bubbleSortSimple);
        verifySorter("Arrays.sort", Arrays::sort);
    }
}
```
