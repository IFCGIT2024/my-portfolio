# Module 8 – Class 1: Specifications, Preconditions and Postconditions

## Learning Objectives

- Define preconditions, postconditions, and specifications for methods.
- Distinguish partial correctness from total correctness.
- Write Hoare triples $\{P\}\ C\ \{Q\}$.
- Encode pre/postconditions in Java using assertions and documentation.
- Connect specifications to Module 3's logical reasoning and Design by Contract.

---

## Concept Overview

### What Is a Specification?

A **specification** describes *what* a method does without saying *how*. It consists of:

- **Precondition** ($P$): What must be true *before* the method executes.
- **Postcondition** ($Q$): What will be true *after* the method executes (assuming the precondition held).

### Hoare Triples

A **Hoare triple** $\{P\}\ C\ \{Q\}$ means:

> If $P$ holds before executing $C$, and $C$ terminates, then $Q$ holds afterward.

This is **partial correctness**. **Total correctness** additionally requires that $C$ terminates whenever $P$ holds. We write $[P]\ C\ [Q]$ for total correctness (some notations use curly braces for both).

### Examples of Specifications

| Method | Precondition | Postcondition |
|--------|-------------|---------------|
| `max(int[] a)` | `a.length >= 1` | Returns the largest element of `a` |
| `binarySearch(int[] a, int k)` | `a` is sorted | Returns index of `k` or `-1` |
| `sqrt(double x)` | `x >= 0` | Returns $y$ such that $y^2 = x$ |
| `gcd(int a, int b)` | `a >= 0, b > 0` | Returns $\gcd(a,b)$ |

### Partial vs Total Correctness

- **Partial correctness:** *If* the program terminates, the result is correct.
- **Total correctness:** The program *always* terminates and the result is correct.

Total correctness = partial correctness + termination.

### Design by Contract

**Bertrand Meyer** (1986) formalized this as Design by Contract (DbC):
- The **caller** is responsible for satisfying preconditions.
- The **method** is responsible for establishing postconditions.
- **Class invariants** must hold before and after every public method.

---

## Formal Notation

| Symbol | Meaning |
|--------|---------|
| $\{P\}\ C\ \{Q\}$ | Hoare triple: partial correctness |
| $[P]\ C\ [Q]$ | Total correctness |
| `requires` | Precondition annotation |
| `ensures` | Postcondition annotation |
| `invariant` | Class or loop invariant |

---

## Worked Examples

### Example 1: Maximum of an Array

**Specification:**

```
requires: a.length >= 1
ensures:  result == max element of a
```

**Hoare triple:** $\{a.\text{length} \geq 1\}\ \texttt{max(a)}\ \{r = \max(a)\}$

**Java implementation with assertions:**

```java
public static int max(int[] a) {
    assert a.length >= 1 : "Precondition: non-empty array";
    int result = a[0];
    for (int i = 1; i < a.length; i++) {
        if (a[i] > result) result = a[i];
    }
    // Postcondition: result is the maximum
    return result;
}
```

**Correctness argument:** The loop invariant is "result = max(a[0..i-1])." After the loop, $i = a.\text{length}$, so result = max(a[0..n-1]).

### Example 2: Array Contains

**Specification:**

```
requires: a is not null
ensures:  result == true iff x appears in a
```

```java
public static boolean contains(int[] a, int x) {
    assert a != null : "Precondition: array not null";
    for (int i = 0; i < a.length; i++) {
        if (a[i] == x) return true;
    }
    return false;
}
```

**Loop invariant:** At the start of iteration $i$: $x \notin \{a[0], \ldots, a[i-1]\}$.

### Example 3: Count Occurrences

```
requires: a is not null
ensures:  result == |{i : 0 <= i < a.length and a[i] == x}|
```

```java
public static int countOccurrences(int[] a, int x) {
    assert a != null;
    int count = 0;
    for (int i = 0; i < a.length; i++) {
        if (a[i] == x) count++;
    }
    return count;
}
```

**Loop invariant:** count = $|\{j : 0 \leq j < i \text{ and } a[j] = x\}|$.

### Example 4: GCD Specification

```
requires: a >= 0 and b > 0
ensures:  result == gcd(a, b) and result > 0
```

```java
public static int gcd(int a, int b) {
    assert a >= 0 && b > 0 : "Precondition";
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}
```

**Invariant:** $\gcd(\text{original } a, \text{original } b) = \gcd(a, b)$ at each iteration. (From Module 1!)

### Example 5: Factorial

```
requires: n >= 0
ensures:  result == n!
```

```java
public static long factorial(int n) {
    assert n >= 0 : "Precondition: non-negative";
    long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
```

**Loop invariant:** At the start of iteration $i$: result = $(i-1)!$.

---

## Proof Techniques Spotlight

### Proving Partial Correctness with Hoare Logic

To prove $\{P\}\ C\ \{Q\}$:

1. **Identify the invariant** $I$ for each loop.
2. **Initialization:** Show $P \Rightarrow I$ before the loop starts.
3. **Maintenance:** Show $\{I \wedge \text{guard}\}\ \text{body}\ \{I\}$ — the invariant is preserved.
4. **Termination:** When the loop guard is false, show $I \wedge \neg\text{guard} \Rightarrow Q$.

This mirrors **mathematical induction** (Module 6):
- Initialization = base case
- Maintenance = inductive step
- Termination = final conclusion

### Sequential Composition Rule

$$\frac{\{P\}\ C_1\ \{R\} \quad \{R\}\ C_2\ \{Q\}}{\{P\}\ C_1; C_2\ \{Q\}}$$

Chain method calls: the postcondition of the first becomes the precondition of the second.

---

## Java Deep Dive

```java
import java.util.*;

public class SpecificationLibrary {

    // --- max with full specification ---

    /**
     * @requires a.length >= 1
     * @ensures result == maximum element of a
     */
    public static int max(int[] a) {
        assert a != null && a.length >= 1 : "Pre: non-empty array";
        int result = a[0];
        // Invariant: result == max(a[0..i-1])
        for (int i = 1; i < a.length; i++) {
            if (a[i] > result) result = a[i];
            // Invariant maintained: result == max(a[0..i])
        }
        // Post: result == max(a[0..n-1])
        return result;
    }

    // --- contains with specification ---

    /**
     * @requires a != null
     * @ensures result == true iff x is in a
     */
    public static boolean contains(int[] a, int x) {
        assert a != null : "Pre: non-null array";
        // Invariant: x not in a[0..i-1]
        for (int i = 0; i < a.length; i++) {
            if (a[i] == x) return true;
        }
        // Post: x not in a[0..n-1], so result = false
        return false;
    }

    // --- countOccurrences ---

    /**
     * @requires a != null
     * @ensures result == number of times x appears in a
     */
    public static int countOccurrences(int[] a, int x) {
        assert a != null;
        int count = 0;
        // Invariant: count == |{j : 0 <= j < i, a[j] == x}|
        for (int i = 0; i < a.length; i++) {
            if (a[i] == x) count++;
        }
        return count;
    }

    // --- isSorted ---

    /**
     * @requires a != null
     * @ensures result == true iff a is sorted in non-decreasing order
     */
    public static boolean isSorted(int[] a) {
        assert a != null;
        // Invariant: a[0..i-1] is sorted
        for (int i = 1; i < a.length; i++) {
            if (a[i] < a[i - 1]) return false;
        }
        return true;
    }

    // --- sum ---

    /**
     * @requires a != null
     * @ensures result == sum of all elements in a
     */
    public static long sum(int[] a) {
        assert a != null;
        long result = 0;
        // Invariant: result == sum(a[0..i-1])
        for (int i = 0; i < a.length; i++) {
            result += a[i];
        }
        return result;
    }

    // --- indexOf ---

    /**
     * @requires a != null
     * @ensures result == first index where a[result]==x, or -1 if not found
     */
    public static int indexOf(int[] a, int x) {
        assert a != null;
        // Invariant: x not in a[0..i-1]
        for (int i = 0; i < a.length; i++) {
            if (a[i] == x) return i;
        }
        return -1;
    }

    // --- Verification harness: check postconditions at runtime ---

    public static void verifyMax(int[] a) {
        int result = max(a);
        // Check postcondition
        for (int x : a) assert result >= x : "max is not >= all elements";
        boolean found = false;
        for (int x : a) if (x == result) found = true;
        assert found : "max is not in the array";
        System.out.println("max(" + Arrays.toString(a) + ") = " + result + " ✓");
    }

    public static void verifyContains(int[] a, int x, boolean expected) {
        boolean result = contains(a, x);
        assert result == expected : "contains mismatch";
        System.out.println("contains(" + Arrays.toString(a) + ", " + x + ") = "
                + result + " ✓");
    }

    // --- Demo ---

    public static void main(String[] args) {
        System.out.println("=== Specification Library ===\n");

        // Verify max
        verifyMax(new int[]{3, 7, 1, 9, 4});
        verifyMax(new int[]{-5, -2, -8});
        verifyMax(new int[]{42});

        // Verify contains
        verifyContains(new int[]{3, 7, 1, 9, 4}, 7, true);
        verifyContains(new int[]{3, 7, 1, 9, 4}, 5, false);

        // Count occurrences
        int[] data = {1, 2, 3, 2, 1, 2};
        System.out.println("\ncountOccurrences(" + Arrays.toString(data) + ", 2) = "
                + countOccurrences(data, 2));

        // isSorted
        System.out.println("isSorted([1,2,3,4]) = " + isSorted(new int[]{1, 2, 3, 4}));
        System.out.println("isSorted([1,3,2,4]) = " + isSorted(new int[]{1, 3, 2, 4}));

        // sum
        System.out.println("sum([1,2,3,4,5]) = " + sum(new int[]{1, 2, 3, 4, 5}));

        // indexOf
        System.out.println("indexOf([10,20,30], 20) = " + indexOf(new int[]{10, 20, 30}, 20));
        System.out.println("indexOf([10,20,30], 40) = " + indexOf(new int[]{10, 20, 30}, 40));
    }
}
```

---

## Historical Context

**C.A.R. Hoare** (1969) published "An Axiomatic Basis for Computer Programming," introducing **Hoare logic** — a formal system for reasoning about program correctness using triples $\{P\}\ C\ \{Q\}$.

**Edsger W. Dijkstra** later developed **weakest precondition** calculus (1975), which computes the weakest precondition $\text{wp}(C, Q)$ such that executing $C$ establishes $Q$.

**Bertrand Meyer** (1986) coined **Design by Contract** with the Eiffel programming language, embedding preconditions and postconditions directly into code.

Java's `assert` statement (added in Java 1.4) and tools like **JML** (Java Modeling Language) bring these ideas into practice.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** What is the difference between a precondition and a postcondition?

**A2.** Explain partial correctness vs total correctness with an example.

**A3.** Write a Hoare triple for `int abs(int x)`.

**A4.** How does a specification differ from an implementation?

### Slide Set B: Proof Problems

**B1.** Given method `max(int[] a)`, state the loop invariant and prove initialization, maintenance, and termination.

**B2.** Prove partial correctness of `contains(int[] a, int x)` using a loop invariant.

**B3.** Write a Hoare triple for sequential composition: `int m = max(a); boolean b = contains(a, m);`. What does the combined postcondition guarantee?

### Slide Set C: Java Coding Problems

**C1.** Implement `countOccurrences(int[] a, int x)` with documented preconditions, postconditions, and a loop invariant.

**C2.** Implement `isSorted(int[] a)` and write a verification harness that checks the postcondition.

**C3.** Add `assert` statements to an existing method to enforce its preconditions. Test that violations are caught.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Write a Hoare triple for each:
(a) `int min(int[] a)` (b) `boolean allPositive(int[] a)` (c) `int gcd(int a, int b)`

**DM2.** Prove: if $\{P\}\ C_1\ \{R\}$ and $\{R\}\ C_2\ \{Q\}$, then $\{P\}\ C_1; C_2\ \{Q\}$ (sequential composition rule).

**DM3.** A method has precondition $x > 0$ and postcondition $r > 0$. The body is `r = x * x`. Prove the Hoare triple.

**DM4.** Define what it means for a loop invariant to be *inductive*. Explain the analogy with mathematical induction (Module 6).

**DM5.** If a method is partially correct but not totally correct, give a concrete example showing what can go wrong.

### Java Programming Problems

**JP1.** Implement `int min(int[] a)` with `@requires`, `@ensures`, loop invariant, and runtime assertion checks.

**JP2.** Implement `int secondMax(int[] a)` where `a.length >= 2`. State the loop invariant. Verify the postcondition.

**JP3.** Implement `boolean isPalindrome(String s)`. Write the specification and loop invariant.

**JP4.** Write a verification harness that tests `countOccurrences` against a brute-force oracle.

**JP5.** Implement `int[] reverseArray(int[] a)`. Precondition: `a != null`. Postcondition: `result[i] == a[n-1-i]` for all $i$.

### Bridge Problems

**BR1.** Module 3 introduced Hoare triples informally. Now formalize: rewrite three method specs from Module 3's lab using $\{P\}\ C\ \{Q\}$ notation.

**BR2.** Module 1's GCD method has invariant $\gcd(a_{\text{orig}}, b_{\text{orig}}) = \gcd(a, b)$. Show that this is exactly a Hoare-logic loop invariant. State initialization, maintenance, and termination.

---

## Solutions

### Discrete Math Solutions

**DM1.**
(a) $\{a.\text{length} \geq 1\}\ \texttt{min(a)}\ \{r \leq a[i] \text{ for all } i \text{ and } r \in a\}$
(b) $\{a \neq \text{null}\}\ \texttt{allPositive(a)}\ \{r \Leftrightarrow \forall i \in [0, a.\text{length}): a[i] > 0\}$
(c) $\{a \geq 0 \wedge b > 0\}\ \texttt{gcd(a,b)}\ \{r = \gcd(a,b)\}$

**DM3.** Assume $x > 0$. The body sets $r = x^2$. Since $x > 0$, $x^2 > 0$, so $r > 0$. $\blacksquare$

**DM4.** A loop invariant $I$ is *inductive* if:
1. $I$ holds before the first iteration (initialization = base case).
2. If $I$ holds before an iteration and the guard is true, then $I$ holds after (maintenance = inductive step).
3. When the guard becomes false, $I$ implies the postcondition (conclusion).

This exactly mirrors induction: base case, inductive step, and final conclusion.

**DM5.** Consider: `while (true) { }` with precondition `true` and postcondition `true`. Partially correct (vacuously — it never terminates), but not totally correct.

### Java Solutions

**JP2:**
```java
public static int secondMax(int[] a) {
    assert a.length >= 2;
    int max1 = Math.max(a[0], a[1]);
    int max2 = Math.min(a[0], a[1]);
    // Invariant: max1 >= max2, and max1,max2 are the
    // two largest values in a[0..i-1]
    for (int i = 2; i < a.length; i++) {
        if (a[i] > max1) {
            max2 = max1;
            max1 = a[i];
        } else if (a[i] > max2) {
            max2 = a[i];
        }
    }
    return max2;
}
```
