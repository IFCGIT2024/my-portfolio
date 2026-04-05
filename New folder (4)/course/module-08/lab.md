# Module 8 – Lab: Algorithm Correctness and Verification

## Overview

In this lab you will implement searching and sorting algorithms, annotate them with loop invariants and variant functions, and build verification harnesses that check correctness at runtime.

**Prerequisites:** Module 8 Classes 1–3 (Specifications, Loop Invariants, Termination)

---

## Part 1: Specifications and Assertions

### Exercise 1.1: Annotated Linear Search

Implement `linearSearch(int[] a, int key)` with:
- `@requires` and `@ensures` comments
- A loop invariant comment
- `assert` statements checking the precondition

### Exercise 1.2: Annotated max and min

Implement `max(int[] a)` and `min(int[] a)` with:
- Full specifications
- Loop invariants
- Postcondition verification: after computing `max`, assert it is $\geq$ all elements and exists in the array.

### Exercise 1.3: countOccurrences with Invariant

Implement `countOccurrences(int[] a, int x)` with invariant: count = number of occurrences of $x$ in $a[0..i-1]$.

---

## Part 2: Loop Invariants for Sorting

### Exercise 2.1: Selection Sort

Implement selection sort with:
- Outer loop invariant: `a[0..i-1]` is sorted and contains the smallest $i$ elements.
- Inner loop invariant: `minIdx` indexes the minimum of `a[i..j-1]`.
- `assert` checks after each outer iteration.

### Exercise 2.2: Insertion Sort

Implement insertion sort with:
- Outer loop invariant: `a[0..i-1]` is sorted.
- `assert isSortedUpTo(a, i)` at the start of each outer iteration.

### Exercise 2.3: Bubble Sort

Implement bubble sort with:
- Outer loop invariant: after pass $i$, the last $i$ elements are in their final sorted positions.
- Count comparisons and swaps.

---

## Part 3: Binary Search Correctness

### Exercise 3.1: Binary Search with Invariant

Implement binary search with:
- Precondition assertion: array is sorted.
- Invariant: if key exists, it is in `a[lo..hi]`.
- Variant: `hi - lo + 1` — print and assert it decreases.

### Exercise 3.2: Off-by-One Analysis

Test binary search on arrays of sizes 0, 1, 2, 3 with keys present and absent. Verify no off-by-one errors by checking all boundary cases.

### Exercise 3.3: Step Counter

Count the number of comparisons in binary search for arrays of size $n = 1, 2, 4, 8, ..., 1{,}048{,}576$. Verify the count is $\leq \lfloor \log_2 n \rfloor + 1$.

---

## Part 4: Termination and Variant Functions

### Exercise 4.1: GCD Variant Tracking

Implement GCD with variant-tracking output:
- Print $a$, $b$, and $V = b$ at each step.
- Test on Fibonacci pairs: $(F_{10}, F_9)$, $(F_{20}, F_{19})$, $(F_{30}, F_{29})$.
- Verify Lamé's theorem: steps $\leq 5 \cdot \lfloor \log_{10} \min(a,b) \rfloor$.

### Exercise 4.2: Total Correctness Verifier

Write a `verifySortingAlgorithm` method that takes a sorting function (as a lambda or method reference), applies it to random arrays, and checks:
1. Output is sorted.
2. Output is a permutation of the input.
3. The function returned (i.e., terminated).

### Exercise 4.3: Collatz Exploration

Implement the Collatz sequence for $n = 1, ..., 1000$. Track:
- Maximum sequence length.
- Which starting value produces the longest sequence.
- (Observe: no variant function is known — termination is conjectured but unproven!)

---

## Extension Challenges

**E1.** Implement merge sort. State invariants for the merge step: "the output array is sorted and contains exactly the elements of the two input halves." Prove correctness.

**E2.** Implement repeated squaring `power(base, exp)`. State the invariant: `result * b^e == base^exp`. Assert it holds. Prove termination via variant $V = e$.

**E3.** Implement a generic "loop verifier" that wraps any iterative algorithm, checks its invariant at each step, and reports whether the invariant was ever violated.

---

## Starter Code

```java
import java.util.*;
import java.util.function.*;

public class Module8Lab {

    // ==================== Part 1: Specifications ====================

    /**
     * @requires a != null
     * @ensures result == index of key in a, or -1
     */
    public static int linearSearch(int[] a, int key) {
        // TODO: implement with invariant assertions
        return -1;
    }

    /**
     * @requires a != null and a.length >= 1
     * @ensures result == maximum element of a
     */
    public static int max(int[] a) {
        // TODO: implement with invariant and postcondition check
        return -1;
    }

    /**
     * @requires a != null and a.length >= 1
     * @ensures result == minimum element of a
     */
    public static int min(int[] a) {
        // TODO
        return -1;
    }

    /**
     * @requires a != null
     * @ensures result == count of x in a
     */
    public static int countOccurrences(int[] a, int x) {
        // TODO: invariant: count == occurrences of x in a[0..i-1]
        return -1;
    }

    // ==================== Part 2: Sorting ====================

    public static void selectionSort(int[] a) {
        // TODO: with invariant assertions
    }

    public static void insertionSort(int[] a) {
        // TODO: with invariant assertions
    }

    public static void bubbleSort(int[] a) {
        // TODO: with comparison and swap counting
    }

    // ==================== Part 3: Binary Search ====================

    public static int binarySearch(int[] a, int key) {
        // TODO: with invariant and variant assertions
        return -1;
    }

    public static int binarySearchSteps(int[] a, int key) {
        // TODO: return the number of comparisons made
        return -1;
    }

    // ==================== Part 4: Termination ====================

    public static int gcdWithTracking(int a, int b) {
        // TODO: print variant at each step
        return -1;
    }

    public static int collatzLength(int n) {
        // TODO: return sequence length
        return -1;
    }

    // ==================== Helpers ====================

    public static boolean isSorted(int[] a) {
        // TODO
        return false;
    }

    public static boolean isPermutation(int[] original, int[] sorted) {
        // TODO: check sorted is a permutation of original
        return false;
    }

    public static boolean isSortedUpTo(int[] a, int end) {
        // TODO
        return false;
    }

    // ==================== Main ====================

    public static void main(String[] args) {
        System.out.println("=== Module 8 Lab ===\n");

        // Part 1
        System.out.println("--- Part 1: Specifications ---");
        int[] data = {5, 3, 8, 1, 9, 2, 7};
        System.out.println("linearSearch(data, 9) = " + linearSearch(data, 9));
        System.out.println("max(data) = " + max(data));
        System.out.println("min(data) = " + min(data));
        System.out.println("countOccurrences([1,2,3,2,1,2], 2) = "
                + countOccurrences(new int[]{1, 2, 3, 2, 1, 2}, 2));

        // Part 2
        System.out.println("\n--- Part 2: Sorting ---");
        int[] arr1 = {64, 25, 12, 22, 11};
        selectionSort(arr1);
        System.out.println("Selection sort: " + Arrays.toString(arr1));

        int[] arr2 = {64, 25, 12, 22, 11};
        insertionSort(arr2);
        System.out.println("Insertion sort: " + Arrays.toString(arr2));

        int[] arr3 = {64, 25, 12, 22, 11};
        bubbleSort(arr3);
        System.out.println("Bubble sort: " + Arrays.toString(arr3));

        // Part 3
        System.out.println("\n--- Part 3: Binary Search ---");
        int[] sorted = {1, 3, 5, 7, 9, 11, 13, 15};
        System.out.println("binarySearch(sorted, 7) = " + binarySearch(sorted, 7));
        System.out.println("binarySearch(sorted, 6) = " + binarySearch(sorted, 6));

        System.out.println("\nBinary search step counts:");
        for (int size = 1; size <= 1_048_576; size *= 2) {
            int[] big = new int[size];
            for (int i = 0; i < size; i++) big[i] = i;
            int steps = binarySearchSteps(big, -1); // worst case: not found
            int bound = (int) (Math.log(size) / Math.log(2)) + 1;
            System.out.printf("n=%,8d: steps=%2d, bound=%2d%n", size, steps, bound);
        }

        // Part 4
        System.out.println("\n--- Part 4: Termination ---");
        System.out.println("GCD(1071, 462):");
        System.out.println("Result: " + gcdWithTracking(1071, 462));

        System.out.println("\nCollatz sequence lengths (1-20):");
        for (int n = 1; n <= 20; n++) {
            System.out.printf("n=%2d: length=%d%n", n, collatzLength(n));
        }
    }
}
```

---

## Solution Key

```java
import java.util.*;
import java.util.function.*;

public class Module8LabSolution {

    // ==================== Part 1: Specifications ====================

    public static int linearSearch(int[] a, int key) {
        assert a != null : "Pre: non-null array";
        // Invariant: key not in a[0..i-1]
        for (int i = 0; i < a.length; i++) {
            if (a[i] == key) return i;
        }
        return -1;
    }

    public static int max(int[] a) {
        assert a != null && a.length >= 1 : "Pre: non-empty array";
        int result = a[0];
        // Invariant: result == max(a[0..i-1])
        for (int i = 1; i < a.length; i++) {
            if (a[i] > result) result = a[i];
        }
        // Postcondition check
        for (int x : a) assert result >= x;
        return result;
    }

    public static int min(int[] a) {
        assert a != null && a.length >= 1 : "Pre: non-empty array";
        int result = a[0];
        // Invariant: result == min(a[0..i-1])
        for (int i = 1; i < a.length; i++) {
            if (a[i] < result) result = a[i];
        }
        for (int x : a) assert result <= x;
        return result;
    }

    public static int countOccurrences(int[] a, int x) {
        assert a != null;
        int count = 0;
        // Invariant: count == |{j : 0 <= j < i, a[j] == x}|
        for (int i = 0; i < a.length; i++) {
            if (a[i] == x) count++;
        }
        return count;
    }

    // ==================== Part 2: Sorting ====================

    public static void selectionSort(int[] a) {
        assert a != null;
        for (int i = 0; i < a.length - 1; i++) {
            // Invariant: a[0..i-1] sorted, contains smallest i elements
            assert isSortedUpTo(a, i);
            int minIdx = i;
            for (int j = i + 1; j < a.length; j++) {
                if (a[j] < a[minIdx]) minIdx = j;
            }
            int temp = a[i]; a[i] = a[minIdx]; a[minIdx] = temp;
        }
        assert isSorted(a);
    }

    public static void insertionSort(int[] a) {
        assert a != null;
        for (int i = 1; i < a.length; i++) {
            // Invariant: a[0..i-1] is sorted
            assert isSortedUpTo(a, i);
            int key = a[i];
            int j = i - 1;
            while (j >= 0 && a[j] > key) {
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;
        }
        assert isSorted(a);
    }

    static int bubbleComparisons = 0;
    static int bubbleSwaps = 0;

    public static void bubbleSort(int[] a) {
        assert a != null;
        bubbleComparisons = 0;
        bubbleSwaps = 0;
        for (int i = 0; i < a.length - 1; i++) {
            // Invariant: a[n-i..n-1] contains the i largest elements, sorted
            boolean swapped = false;
            for (int j = 0; j < a.length - 1 - i; j++) {
                bubbleComparisons++;
                if (a[j] > a[j + 1]) {
                    int temp = a[j]; a[j] = a[j + 1]; a[j + 1] = temp;
                    bubbleSwaps++;
                    swapped = true;
                }
            }
            if (!swapped) break; // early termination
        }
        assert isSorted(a);
        System.out.printf("  Bubble sort: %d comparisons, %d swaps%n",
                bubbleComparisons, bubbleSwaps);
    }

    // ==================== Part 3: Binary Search ====================

    public static int binarySearch(int[] a, int key) {
        assert a != null;
        assert isSorted(a) : "Pre: sorted array";
        int lo = 0, hi = a.length - 1;
        // Invariant: if key in a, then key in a[lo..hi]
        while (lo <= hi) {
            int variant = hi - lo + 1;
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == key) return mid;
            else if (a[mid] < key) lo = mid + 1;
            else hi = mid - 1;
            assert hi - lo + 1 < variant || lo > hi : "Variant must decrease";
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

    // ==================== Part 4: Termination ====================

    public static int gcdWithTracking(int a, int b) {
        assert a >= 0 && b > 0;
        int steps = 0;
        while (b != 0) {
            int variant = b;
            int r = a % b;
            steps++;
            System.out.printf("  Step %d: a=%d, b=%d, r=%d, V=%d%n",
                    steps, a, b, r, variant);
            a = b;
            b = r;
            assert b < variant : "Variant decreased";
        }
        System.out.printf("  Terminated in %d steps%n", steps);
        return a;
    }

    public static int collatzLength(int n) {
        assert n >= 1;
        int steps = 0;
        while (n != 1) {
            if (n % 2 == 0) n = n / 2;
            else n = 3 * n + 1;
            steps++;
        }
        return steps;
    }

    // ==================== Helpers ====================

    public static boolean isSorted(int[] a) {
        for (int i = 1; i < a.length; i++) {
            if (a[i] < a[i - 1]) return false;
        }
        return true;
    }

    public static boolean isPermutation(int[] original, int[] sorted) {
        if (original.length != sorted.length) return false;
        int[] a = Arrays.copyOf(original, original.length);
        int[] b = Arrays.copyOf(sorted, sorted.length);
        Arrays.sort(a);
        Arrays.sort(b);
        return Arrays.equals(a, b);
    }

    public static boolean isSortedUpTo(int[] a, int end) {
        for (int i = 1; i < end; i++) {
            if (a[i] < a[i - 1]) return false;
        }
        return true;
    }

    // ==================== Main ====================

    public static void main(String[] args) {
        System.out.println("=== Module 8 Lab Solution ===\n");

        // Part 1
        System.out.println("--- Part 1: Specifications ---");
        int[] data = {5, 3, 8, 1, 9, 2, 7};
        System.out.println("linearSearch(data, 9) = " + linearSearch(data, 9));   // 4
        System.out.println("max(data) = " + max(data));                            // 9
        System.out.println("min(data) = " + min(data));                            // 1
        System.out.println("countOccurrences([1,2,3,2,1,2], 2) = "
                + countOccurrences(new int[]{1, 2, 3, 2, 1, 2}, 2));              // 3

        // Part 2
        System.out.println("\n--- Part 2: Sorting ---");
        int[] arr1 = {64, 25, 12, 22, 11};
        selectionSort(arr1);
        System.out.println("Selection sort: " + Arrays.toString(arr1));

        int[] arr2 = {64, 25, 12, 22, 11};
        insertionSort(arr2);
        System.out.println("Insertion sort: " + Arrays.toString(arr2));

        int[] arr3 = {64, 25, 12, 22, 11};
        bubbleSort(arr3);
        System.out.println("Bubble sort: " + Arrays.toString(arr3));

        // Part 3
        System.out.println("\n--- Part 3: Binary Search ---");
        int[] sorted = {1, 3, 5, 7, 9, 11, 13, 15};
        System.out.println("binarySearch(sorted, 7) = " + binarySearch(sorted, 7));
        System.out.println("binarySearch(sorted, 6) = " + binarySearch(sorted, 6));

        System.out.println("\nBinary search step counts:");
        for (int size = 1; size <= 1_048_576; size *= 2) {
            int[] big = new int[size];
            for (int i = 0; i < size; i++) big[i] = i;
            int steps = binarySearchSteps(big, -1);
            int bound = (int) (Math.log(size) / Math.log(2)) + 1;
            System.out.printf("n=%,8d: steps=%2d, bound=%2d  %s%n",
                    size, steps, bound, steps <= bound ? "✓" : "✗");
        }

        // Part 4
        System.out.println("\n--- Part 4: Termination ---");
        System.out.println("GCD(1071, 462):");
        System.out.println("Result: " + gcdWithTracking(1071, 462));

        System.out.println("\nCollatz sequence lengths (1-20):");
        int maxLen = 0;
        int maxN = 0;
        for (int n = 1; n <= 1000; n++) {
            int len = collatzLength(n);
            if (len > maxLen) { maxLen = len; maxN = n; }
        }
        for (int n = 1; n <= 20; n++) {
            System.out.printf("n=%2d: length=%d%n", n, collatzLength(n));
        }
        System.out.printf("\nLongest Collatz sequence (1-1000): n=%d, length=%d%n",
                maxN, maxLen);

        // Verification
        System.out.println("\n--- Sorting Verification ---");
        Random rng = new Random(42);
        for (int trial = 0; trial < 100; trial++) {
            int n = rng.nextInt(50) + 1;
            int[] original = rng.ints(n, -100, 100).toArray();
            int[] copy = Arrays.copyOf(original, n);
            insertionSort(copy);
            assert isSorted(copy) : "Not sorted!";
            assert isPermutation(original, copy) : "Not a permutation!";
        }
        System.out.println("100 random insertion sort verifications passed!");
    }
}
```

---

## Verification Checklist

| Task | Expected Output | ✓ |
|------|----------------|---|
| `linearSearch(data, 9)` | 4 | |
| `max(data)` | 9 | |
| `min(data)` | 1 | |
| `countOccurrences(..., 2)` | 3 | |
| Selection sort produces sorted output | All assertions pass | |
| Insertion sort produces sorted output | All assertions pass | |
| Bubble sort produces sorted output | All assertions pass | |
| Binary search finds present keys | Correct index | |
| Binary search returns -1 for absent keys | -1 | |
| Binary search steps ≤ log₂(n) + 1 | All sizes verified | |
| GCD terminates with correct result | 21 for (1071, 462) | |
| Collatz sequences computed | All terminate for n ≤ 1000 | |
| Sorting verification (100 trials) | All pass | |
