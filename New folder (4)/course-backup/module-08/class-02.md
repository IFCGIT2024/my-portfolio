# Module 8 – Class 2: Loop Invariants in Sorting and Searching

## Learning Objectives

- Define and identify loop invariants for iterative algorithms.
- Prove initialization, maintenance, and termination for loop invariants.
- Apply loop invariants to binary search, selection sort, and insertion sort.
- Annotate Java code with invariant assertions.
- Connect loop invariants to mathematical induction (Module 6).

---

## Concept Overview

### What Is a Loop Invariant?

A **loop invariant** is a condition that:
1. Is **true before the first iteration** (initialization).
2. **Remains true** after each iteration (maintenance).
3. Combined with the loop's exit condition, **implies the postcondition** (termination).

### The Three Steps

| Step | Question | Analogy to Induction |
|------|----------|---------------------|
| **Initialization** | Is $I$ true before the loop starts? | Base case |
| **Maintenance** | If $I$ and the guard are true, is $I$ true after one iteration? | Inductive step |
| **Termination** | When the guard is false, does $I \wedge \neg\text{guard} \Rightarrow Q$? | Final conclusion |

### Why Invariants Matter

Invariants capture *what progress the loop has made*. They are the bridge between the precondition and the postcondition.

---

## Formal Notation

For a loop `while (B) { S; }` with invariant $I$:

$$\frac{\{I \wedge B\}\ S\ \{I\}}{\{I\}\ \texttt{while (B) \{ S; \}}\ \{I \wedge \neg B\}}$$

This is the **Hoare loop rule**.

---

## Worked Examples

### Example 1: Linear Search

```java
public static int linearSearch(int[] a, int key) {
    for (int i = 0; i < a.length; i++) {
        if (a[i] == key) return i;
    }
    return -1;
}
```

**Invariant:** At the start of iteration $i$: $\texttt{key} \notin \{a[0], \ldots, a[i-1]\}$.

- **Initialization:** $i = 0$, the set $\{a[0], \ldots, a[-1]\}$ is empty, so $\texttt{key}$ is trivially not in it. ✓
- **Maintenance:** If $a[i] \neq \texttt{key}$, then $\texttt{key} \notin \{a[0], \ldots, a[i]\}$. ✓
- **Termination:** If the loop ends without returning, $i = a.\text{length}$, so $\texttt{key} \notin a$, and we return $-1$. ✓

### Example 2: Binary Search

```java
public static int binarySearch(int[] a, int key) {
    int lo = 0, hi = a.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;  // avoids overflow
        if (a[mid] == key) return mid;
        else if (a[mid] < key) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
```

**Precondition:** `a` is sorted in non-decreasing order.

**Invariant:** If `key` is in `a`, then `key` is in `a[lo..hi]`.

- **Initialization:** $lo = 0$, $hi = n-1$. If `key` is in `a`, it's in `a[0..n-1]`. ✓
- **Maintenance:** 
  - If `a[mid] < key`, then `key` cannot be in `a[lo..mid]` (array is sorted), so `lo = mid + 1` preserves the invariant.
  - If `a[mid] > key`, then `key` cannot be in `a[mid..hi]`, so `hi = mid - 1` preserves it.
  - If `a[mid] == key`, we return immediately.
- **Termination:** When `lo > hi`, the range is empty. Combined with the invariant: if `key` were in `a`, it would be in an empty range — contradiction. So `key` is not in `a`, and we return $-1$. ✓

**Variant function:** $hi - lo + 1$ (decreases each iteration, bounded below by 0).

### Example 3: Selection Sort

```java
public static void selectionSort(int[] a) {
    for (int i = 0; i < a.length - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < a.length; j++) {
            if (a[j] < a[minIdx]) minIdx = j;
        }
        int temp = a[i]; a[i] = a[minIdx]; a[minIdx] = temp;
    }
}
```

**Outer loop invariant:** At the start of iteration $i$:
1. $a[0..i-1]$ is sorted.
2. Every element in $a[0..i-1]$ is $\leq$ every element in $a[i..n-1]$.
3. $a[0..i-1]$ contains the $i$ smallest elements of the original array.

**Inner loop invariant:** $a[\texttt{minIdx}] = \min(a[i..j-1])$.

- **Initialization (outer):** $i = 0$, $a[0..-1]$ is empty — trivially sorted and minimal. ✓
- **Maintenance (outer):** After finding the minimum of $a[i..n-1]$ and swapping it to position $i$, the invariant extends to $a[0..i]$. ✓
- **Termination (outer):** When $i = n-1$, $a[0..n-2]$ is sorted and contains the $n-1$ smallest elements, so $a[n-1]$ is the largest. The entire array is sorted. ✓

### Example 4: Insertion Sort

```java
public static void insertionSort(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}
```

**Outer loop invariant:** At the start of iteration $i$: $a[0..i-1]$ is a sorted permutation of the original first $i$ elements.

- **Initialization:** $i = 1$, $a[0..0]$ is trivially sorted. ✓
- **Maintenance:** The inner loop shifts elements right to make room, inserting `key` in its correct position. After insertion, $a[0..i]$ is sorted. ✓
- **Termination:** When $i = n$, $a[0..n-1]$ is sorted. ✓

### Example 5: Summation

```java
public static long sum(int[] a) {
    long s = 0;
    for (int i = 0; i < a.length; i++) {
        s += a[i];
    }
    return s;
}
```

**Invariant:** $s = \sum_{j=0}^{i-1} a[j]$.

- **Initialization:** $i = 0$, $s = 0 = \sum_{j=0}^{-1} a[j]$. ✓
- **Maintenance:** $s + a[i] = \sum_{j=0}^{i} a[j]$. ✓
- **Termination:** $i = n$, $s = \sum_{j=0}^{n-1} a[j]$. ✓

---

## Proof Techniques Spotlight

### Finding the Right Invariant

The key insight: the invariant should describe **partial progress** toward the postcondition.

**Strategy:** Replace the constant bound in the postcondition with the loop variable.
- Postcondition: "result = max of a[0..n-1]" → Invariant: "result = max of a[0..i-1]"
- Postcondition: "a is sorted" → Invariant: "a[0..i-1] is sorted and minimal"

### Invariant + Termination = Correctness

This is the **fundamental theorem of loop correctness**:

$$(\text{Initialization} \wedge \text{Maintenance} \wedge \text{Termination}) \Rightarrow \{P\}\ \texttt{loop}\ \{Q\}$$

---

## Java Deep Dive

```java
import java.util.*;

public class LoopInvariantLibrary {

    // --- Linear Search with invariant assertions ---

    public static int linearSearch(int[] a, int key) {
        assert a != null;
        for (int i = 0; i < a.length; i++) {
            // Invariant: key not in a[0..i-1]
            if (a[i] == key) return i;
        }
        // Post: key not in a
        return -1;
    }

    // --- Binary Search with invariant assertions ---

    public static int binarySearch(int[] a, int key) {
        assert a != null;
        assert isSorted(a) : "Pre: array must be sorted";
        int lo = 0, hi = a.length - 1;
        // Invariant: if key is in a, then key is in a[lo..hi]
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            assert lo >= 0 && hi < a.length;
            assert lo <= mid && mid <= hi;
            if (a[mid] == key) return mid;
            else if (a[mid] < key) lo = mid + 1;
            else hi = mid - 1;
        }
        // Post: key not in a
        return -1;
    }

    // --- Selection Sort with invariant assertions ---

    public static void selectionSort(int[] a) {
        assert a != null;
        for (int i = 0; i < a.length - 1; i++) {
            // Invariant: a[0..i-1] sorted and contains smallest i elements
            assert isSortedUpTo(a, i);
            assert allSmallerOrEqual(a, i);

            int minIdx = i;
            for (int j = i + 1; j < a.length; j++) {
                if (a[j] < a[minIdx]) minIdx = j;
            }
            // Inner post: a[minIdx] == min(a[i..n-1])
            int temp = a[i];
            a[i] = a[minIdx];
            a[minIdx] = temp;
        }
        assert isSorted(a) : "Post: array is sorted";
    }

    // --- Insertion Sort with invariant assertions ---

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
        assert isSorted(a) : "Post: array is sorted";
    }

    // --- Invariant checker helpers ---

    public static boolean isSorted(int[] a) {
        for (int i = 1; i < a.length; i++) {
            if (a[i] < a[i - 1]) return false;
        }
        return true;
    }

    private static boolean isSortedUpTo(int[] a, int end) {
        for (int i = 1; i < end; i++) {
            if (a[i] < a[i - 1]) return false;
        }
        return true;
    }

    private static boolean allSmallerOrEqual(int[] a, int boundary) {
        for (int i = 0; i < boundary; i++) {
            for (int j = boundary; j < a.length; j++) {
                if (a[i] > a[j]) return false;
            }
        }
        return true;
    }

    // --- Demo ---

    public static void main(String[] args) {
        System.out.println("=== Loop Invariant Library ===\n");

        // Linear search
        int[] data = {5, 3, 8, 1, 9, 2, 7};
        System.out.println("linearSearch(data, 9) = " + linearSearch(data, 9));
        System.out.println("linearSearch(data, 6) = " + linearSearch(data, 6));

        // Binary search (needs sorted array)
        int[] sorted = {1, 3, 5, 7, 9, 11, 13};
        System.out.println("binarySearch(sorted, 7) = " + binarySearch(sorted, 7));
        System.out.println("binarySearch(sorted, 6) = " + binarySearch(sorted, 6));

        // Selection sort
        int[] arr1 = {64, 25, 12, 22, 11};
        selectionSort(arr1);
        System.out.println("selectionSort: " + Arrays.toString(arr1));

        // Insertion sort
        int[] arr2 = {64, 25, 12, 22, 11};
        insertionSort(arr2);
        System.out.println("insertionSort: " + Arrays.toString(arr2));

        // Timing comparison
        Random rng = new Random(42);
        int n = 5000;
        int[] big1 = rng.ints(n, 0, 100000).toArray();
        int[] big2 = Arrays.copyOf(big1, big1.length);

        long start = System.nanoTime();
        selectionSort(big1);
        long selTime = System.nanoTime() - start;

        start = System.nanoTime();
        insertionSort(big2);
        long insTime = System.nanoTime() - start;

        System.out.printf("\nSorting %d elements:%n", n);
        System.out.printf("Selection sort: %,d ns%n", selTime);
        System.out.printf("Insertion sort: %,d ns%n", insTime);
    }
}
```

---

## Historical Context

**Robert W. Floyd** (1967) introduced the idea of attaching assertions to program points. **Tony Hoare** (1969) formalized loop invariants in his axiomatic approach to program correctness.

The use of loop invariants in algorithm textbooks was popularized by **Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, and Clifford Stein** (CLRS), who systematically present invariants for every sorting and searching algorithm.

**Edsger Dijkstra** emphasized that invariants should be *discovered simultaneously with the algorithm*, not retrofitted: "the invariant is not a property of the loop; it is the core of its design."

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** What are the three properties of a loop invariant?

**A2.** State the invariant for binary search and explain why the array must be sorted.

**A3.** How is the maintenance step of a loop invariant analogous to the inductive step in a proof by induction?

**A4.** Can a loop have more than one invariant? Give an example.

### Slide Set B: Proof Problems

**B1.** Prove the correctness of selection sort using its loop invariant (all three steps).

**B2.** Prove the correctness of insertion sort using its loop invariant.

**B3.** Derive a loop invariant for bubble sort and prove its correctness.

### Slide Set C: Java Coding Problems

**C1.** Implement binary search with `assert` statements checking the invariant at each iteration.

**C2.** Implement insertion sort and add assertion-based invariant checking.

**C3.** Write a method that takes a sorting function and an array, runs the sort, and verifies the postcondition (sorted + permutation of original).

---

## Full Problem Set

### Discrete Math Problems

**DM1.** State the loop invariant for linear search. Prove initialization, maintenance, and that the postcondition follows.

**DM2.** In binary search, the variant function is $V = hi - lo + 1$. Prove: (a) $V \geq 0$ throughout. (b) $V$ decreases each iteration. (c) When $V < 1$, the loop terminates.

**DM3.** Selection sort performs $\sum_{i=0}^{n-2}(n-i-1) = \frac{n(n-1)}{2}$ comparisons. Prove this using the summation formula from Module 6.

**DM4.** Derive the loop invariant for computing the product $\prod_{j=0}^{n-1} a[j]$.

**DM5.** Prove: if a loop maintains an invariant $I$ and terminates with guard $\neg B$, then $I \wedge \neg B$ holds. Explain why this is the postcondition.

**DM6.** State invariants for both the inner and outer loops of bubble sort. Prove that after pass $i$, the last $i$ elements are in their final positions.

### Java Programming Problems

**JP1.** Implement selection sort with full invariant assertions (check after each swap that a[0..i] is sorted and minimal).

**JP2.** Implement binary search. Test with sorted arrays of various sizes. Verify correctness by checking that if `binarySearch` returns `idx >= 0`, then `a[idx] == key`.

**JP3.** Implement bubble sort with assertions. Count the total comparisons and swaps.

**JP4.** Write a generic invariant checker: a method `checkInvariant(int[] a, int i, Predicate)` that asserts the invariant at each step.

**JP5.** Implement a verified `reverseArray` method with loop invariant: at step $i$, `result[0..i-1]` = reverse of `a[n-i..n-1]`.

### Bridge Problems

**BR1.** Module 6: loop invariants mirror induction. Display the parallel explicitly for `sum(int[] a)`: write the induction proof that $s = \sum_{j=0}^{i-1} a[j]$ alongside the loop.

**BR2.** Module 7: selection sort makes $\frac{n(n-1)}{2}$ comparisons (product rule: the inner loop runs $n-1, n-2, \ldots, 1$ times). Prove this count using Module 7's counting principles.

---

## Solutions

### Discrete Math Solutions

**DM1.** Invariant: key $\notin$ a[0..i-1].
- Init: $i = 0$, a[0..-1] = $\emptyset$. ✓
- Maint: If we don't return, $a[i] \neq$ key, so key $\notin$ a[0..i]. ✓
- Term: $i = n$, key $\notin$ a. Return $-1$. ✓

**DM2.** (a) $lo \leq hi + 1$ by loop guard, so $V = hi - lo + 1 \geq 0$. (b) Each iteration either increases $lo$ or decreases $hi$ (or both via return), so $V$ decreases by $\geq 1$. (c) When $V < 1$, $hi < lo$, guard fails. ✓

**DM3.** $\sum_{i=0}^{n-2}(n-1-i) = \sum_{k=1}^{n-1} k = \frac{(n-1)n}{2}$. By Module 6 summation formula. ✓

**DM4.** Invariant: $p = \prod_{j=0}^{i-1} a[j]$. Init: $p = 1$ (empty product). Maint: $p \cdot a[i] = \prod_{j=0}^{i} a[j]$. Term: $p = \prod_{j=0}^{n-1} a[j]$. ✓

**DM6.** After pass $i$ of bubble sort, the largest $i$ elements are in positions $a[n-i..n-1]$ and are sorted. The inner loop compares adjacent elements and bubbles the maximum to the end.
