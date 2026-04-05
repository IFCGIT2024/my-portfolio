# Module 3 – Class 3: Logical Reasoning in Programs

## Learning Objectives

- Apply inference rules (modus ponens, modus tollens) to reason about program behavior.
- Use `assert` statements to encode preconditions and postconditions.
- Annotate methods with `@requires` and `@ensures` comments.
- Reason about program correctness using Hoare-style triples {P} C {Q}.
- Combine assertions with logical reasoning to debug and verify programs.

---

## Concept Overview

### Inference Rules

**Modus Ponens:** If $P$ is true and $P \rightarrow Q$ is true, then $Q$ is true.
$$\frac{P \qquad P \rightarrow Q}{Q}$$

**Modus Tollens:** If $\neg Q$ is true and $P \rightarrow Q$ is true, then $\neg P$ is true.
$$\frac{\neg Q \qquad P \rightarrow Q}{\neg P}$$

**Hypothetical Syllogism:** If $P \rightarrow Q$ and $Q \rightarrow R$, then $P \rightarrow R$.

### Predicates and Assertions

A **predicate** is a Boolean-valued function: $P(x)$ returns true or false depending on $x$. In Java, this is a method returning `boolean` or a `Predicate<T>`.

An **assertion** is a predicate that we expect to be true at a specific point in the program:
```java
assert condition : "error message";
```
If `condition` is false and assertions are enabled (`-ea`), the program throws `AssertionError`.

### Hoare Triples (Informal)

A **Hoare triple** $\{P\}\ C\ \{Q\}$ means: "If precondition $P$ holds before executing code $C$, and $C$ terminates, then postcondition $Q$ holds after."

Example: $\{\text{arr is sorted}\}\ \text{binarySearch(arr, key)}\ \{\text{returns correct index or -1}\}$

**Why this matters in CS:**
- **Design by Contract:** Methods have preconditions (what the caller guarantees) and postconditions (what the method guarantees).
- **Debugging:** Assertions catch bugs early by checking expected conditions at runtime.
- **Verification:** Formal reasoning about program correctness uses Hoare logic.
- **Documentation:** `@requires` and `@ensures` comments serve as executable documentation.

---

## Formal Notation

| Notation | Meaning |
|----------|---------|
| $\{P\}\ C\ \{Q\}$ | Hoare triple: if P holds before C, then Q holds after C |
| `@requires P` | Precondition: must be true when method is called |
| `@ensures Q` | Postcondition: guaranteed true when method returns |
| `@invariant I` | Loop invariant: true before and after each iteration |

---

## Worked Examples

### Example 1: Modus Ponens in Code — Discrete Math + Java

**Problem:** A method specifies: "If the input array is sorted, then the output is the correct index of the key." The caller verifies the array is sorted. Conclude the output is correct.

**Formal reasoning:**
- $P$: array is sorted (verified by caller)
- $P \rightarrow Q$: method specification
- By modus ponens, $Q$: output is correct.

```java
/**
 * @requires arr is sorted in non-decreasing order
 * @ensures returns index i where arr[i] == key, or -1 if not found
 */
public static int binarySearch(int[] arr, int key) {
    assert isSorted(arr) : "Precondition violated: array not sorted";

    int lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;  // avoid overflow
        if (arr[mid] == key) return mid;
        else if (arr[mid] < key) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

private static boolean isSorted(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) return false;
    }
    return true;
}
```

### Example 2: Modus Tollens for Debugging

**Problem:** A method's postcondition guarantees "the returned value is non-negative." The caller observes a negative return value. Conclude the precondition was violated.

**Formal reasoning:**
- Specification: $P \rightarrow Q$ where $Q$ is "return ≥ 0"
- Observed: $\neg Q$ (return < 0)
- By modus tollens: $\neg P$ (precondition violated)

```java
/**
 * @requires n >= 0
 * @ensures result >= 0 and result * result <= n < (result + 1) * (result + 1)
 */
public static int intSqrt(int n) {
    assert n >= 0 : "Precondition: n must be non-negative";
    int r = (int) Math.sqrt(n);
    // Postcondition check
    assert r >= 0 : "Postcondition: result must be non-negative";
    assert (long) r * r <= n : "Postcondition: r*r <= n";
    assert (long) (r + 1) * (r + 1) > n : "Postcondition: (r+1)^2 > n";
    return r;
}
```

### Example 3: Hoare Triple for Assignment — Combined

**Problem:** Prove $\{x = 5\}\ y = x + 3\ \{y = 8\}$.

**Proof.** Given: $x = 5$ (precondition). After executing $y = x + 3$: $y = 5 + 3 = 8$. So postcondition $y = 8$ holds. $\blacksquare$

**Hoare's assignment axiom:** $\{Q[x/E]\}\ x = E\ \{Q\}$.
To establish $\{?\}\ y = x + 3\ \{y = 8\}$: substitute $y$ with $x + 3$ in postcondition: $x + 3 = 8$, i.e., $x = 5$. ✓

```java
public static void demonstrateHoareAssignment() {
    int x = 5;
    assert x == 5;     // Precondition
    int y = x + 3;
    assert y == 8;     // Postcondition
    System.out.println("Hoare triple verified: {x=5} y=x+3 {y=8}");
}
```

### Example 4: Sequential Composition

**Problem:** Prove $\{x = 3\}\ x = x + 1;\ y = x * 2\ \{y = 8\}$.

**Proof.** After $x = x + 1$: $x = 4$. After $y = x \times 2$: $y = 8$. $\blacksquare$

Using the composition rule: find a midcondition $R$ such that $\{P\}\ C_1\ \{R\}$ and $\{R\}\ C_2\ \{Q\}$.
- $\{x = 3\}\ x = x+1\ \{x = 4\}$
- $\{x = 4\}\ y = x*2\ \{y = 8\}$

### Example 5: Conditional Reasoning

**Problem:** Verify the correctness of `max(a, b)`:

```java
/**
 * @requires true (no precondition)
 * @ensures result >= a && result >= b && (result == a || result == b)
 */
public static int max(int a, int b) {
    int result;
    if (a >= b) {
        // Here: a >= b
        result = a;
        // Here: result >= a && result >= b && result == a
    } else {
        // Here: a < b, so b > a
        result = b;
        // Here: result >= a && result >= b && result == b
    }
    // In both cases: result >= a && result >= b && (result == a || result == b)
    assert result >= a && result >= b;
    assert result == a || result == b;
    return result;
}
```

---

## Proof Techniques Spotlight

### Reasoning About Code with Logic

The key insight: **every line of code transforms a logical state**.

| Code Pattern | Logical Rule |
|-------------|-------------|
| `x = expr;` | Assignment axiom: postcondition with `x` replaced by `expr` |
| `if (P) { A } else { B }` | Split into two cases: $\{Q \wedge P\}\ A\ \{R\}$ and $\{Q \wedge \neg P\}\ B\ \{R\}$ |
| `while (B) { S }` | Loop invariant: $\{I \wedge B\}\ S\ \{I\}$; after loop: $I \wedge \neg B$ |
| `assert P;` | Assume $P$ holds (or crash) |
| `return v;` | Postcondition holds for return value $v$ |

**Template for method verification:**
1. State precondition $P$.
2. For each statement, compute the resulting condition.
3. At the end, show the postcondition $Q$ follows from the final condition.

---

## Java Deep Dive

```java
import java.util.*;

public class ProgramReasoningLibrary {

    // --- Design by Contract ---

    /**
     * Binary search with full contract.
     * @requires arr != null && arr is sorted (non-decreasing)
     * @ensures result == -1 implies key not in arr
     *          result >= 0 implies arr[result] == key
     */
    public static int binarySearch(int[] arr, int key) {
        // Check precondition
        assert arr != null : "Precondition: arr must not be null";
        assert isSorted(arr) : "Precondition: arr must be sorted";

        int lo = 0, hi = arr.length - 1;

        // Loop invariant: if key is in arr, then key is in arr[lo..hi]
        while (lo <= hi) {
            // Invariant check
            assert lo >= 0 && hi < arr.length;

            int mid = lo + (hi - lo) / 2;
            if (arr[mid] == key) {
                assert arr[mid] == key;  // postcondition for found case
                return mid;
            }
            if (arr[mid] < key) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }

        // Loop terminated: lo > hi
        // By invariant and loop exit: key is not in arr
        return -1;
    }

    /**
     * Selection sort with invariant annotations.
     * @requires arr != null
     * @ensures arr is sorted and arr is a permutation of original arr
     */
    public static void selectionSort(int[] arr) {
        assert arr != null;

        for (int i = 0; i < arr.length - 1; i++) {
            // Invariant: arr[0..i-1] is sorted and contains
            //            the i smallest elements of the original array

            // Find minimum in arr[i..n-1]
            int minIdx = i;
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }

            // Swap arr[i] and arr[minIdx]
            int temp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = temp;

            // After swap: arr[0..i] is sorted and contains the i+1 smallest elements
            assert isSorted(arr, 0, i + 1) : "Invariant broken at i=" + i;
        }

        // Postcondition: arr is fully sorted
        assert isSorted(arr) : "Postcondition: arr should be sorted";
    }

    /**
     * Safe division with precondition.
     * @requires divisor != 0
     * @ensures result * divisor == dividend (for exact division)
     */
    public static int safeDivide(int dividend, int divisor) {
        if (divisor == 0) throw new ArithmeticException("Division by zero");
        return dividend / divisor;
    }

    /**
     * Array maximum with full reasoning.
     * @requires arr != null && arr.length >= 1
     * @ensures result >= arr[i] for all i, and result == arr[j] for some j
     */
    public static int max(int[] arr) {
        assert arr != null && arr.length >= 1 : "Precondition: non-empty array";

        int result = arr[0];
        // Invariant: result = max(arr[0..0])

        for (int i = 1; i < arr.length; i++) {
            // Invariant: result = max(arr[0..i-1])
            if (arr[i] > result) {
                result = arr[i];
            }
            // Invariant maintained: result = max(arr[0..i])
        }

        // Postcondition: result = max(arr[0..n-1])
        return result;
    }

    // --- Helper Methods ---

    static boolean isSorted(int[] arr) {
        return isSorted(arr, 0, arr.length);
    }

    static boolean isSorted(int[] arr, int from, int to) {
        for (int i = from; i < to - 1; i++) {
            if (arr[i] > arr[i + 1]) return false;
        }
        return true;
    }

    // --- Demonstration ---

    public static void main(String[] args) {
        System.out.println("=== Program Reasoning Library ===\n");

        // Binary search with contract
        int[] sorted = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
        System.out.println("Search for 23: index " + binarySearch(sorted, 23));
        System.out.println("Search for 50: index " + binarySearch(sorted, 50));

        // Selection sort with invariants
        int[] unsorted = {64, 25, 12, 22, 11};
        System.out.println("\nBefore sort: " + Arrays.toString(unsorted));
        selectionSort(unsorted);
        System.out.println("After sort:  " + Arrays.toString(unsorted));

        // Max with postcondition verification
        int[] data = {3, 7, 2, 9, 4, 6, 1};
        int m = max(data);
        System.out.println("\nMax of " + Arrays.toString(data) + " = " + m);

        // Verify postcondition explicitly
        boolean atLeastAsLarge = true, existsEqual = false;
        for (int x : data) {
            if (m < x) atLeastAsLarge = false;
            if (m == x) existsEqual = true;
        }
        System.out.println("Postcondition (>= all): " + atLeastAsLarge);
        System.out.println("Postcondition (in arr): " + existsEqual);
    }
}
```

---

## Historical Context

**C.A.R. Hoare** published "An Axiomatic Basis for Computer Programming" in 1969, introducing what we now call **Hoare logic**. His notation $\{P\}\ C\ \{Q\}$ gave programmers a mathematical framework for proving programs correct.

**Edsger Dijkstra** extended this work with **weakest precondition** calculus in his 1976 book *A Discipline of Programming*. Given a postcondition $Q$ and a program $C$, the weakest precondition $\text{wp}(C, Q)$ is the weakest condition that guarantees $Q$ after executing $C$.

**Bertrand Meyer** popularized **Design by Contract** in the 1980s with the Eiffel programming language, which had built-in support for preconditions, postconditions, and class invariants. Java's `assert` keyword (added in Java 1.4) provides a lighter-weight version of this concept.

Modern verification tools like **JML** (Java Modeling Language), **Dafny**, **Coq**, and **Isabelle** allow machine-checked proofs of program correctness.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** In the Hoare triple $\{x > 0\}\ y = x * 2\ \{y > 0\}$, what is the precondition? The postcondition?

**A2.** A method's postcondition says "return value ≥ 0." You observe a return of -3. What can you conclude?

**A3.** What does `assert false` do? When would you use it?

**A4.** Explain the difference between partial correctness and total correctness.

### Slide Set B: Proof Problems

**B1.** Prove $\{x = 10\}\ x = x - 3\ \{x = 7\}$ using the assignment axiom.

**B2.** Prove $\{a \geq 0 \wedge b \geq 0\}\ c = a + b\ \{c \geq 0\}$.

**B3.** Write the Hoare triple for `int max = (a > b) ? a : b;` and prove it correct.

### Slide Set C: Java Coding Problems

**C1.** Annotate a `linearSearch` method with `@requires` and `@ensures` comments, then add `assert` statements.

**C2.** Write a method `insertSorted(int[] arr, int len, int key)` that inserts into a sorted array, and annotate with invariants.

**C3.** Add postcondition assertions to a `swap(int[] arr, int i, int j)` method.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Using modus ponens, derive a conclusion from: (1) "If it rains, the ground is wet." (2) "It is raining."

**DM2.** Using modus tollens, derive a conclusion from: (1) "If the program has no bugs, all tests pass." (2) "Test 3 failed."

**DM3.** From the premises: $P \rightarrow Q$, $Q \rightarrow R$, $P$, derive $R$ using inference rules. Name each step.

**DM4.** Prove using logical reasoning: if a method satisfies $\{P\}\ C_1\ \{R\}$ and $\{R\}\ C_2\ \{Q\}$, then $\{P\}\ C_1; C_2\ \{Q\}$ (composition rule).

**DM5.** Is the following argument valid? "If $n$ is prime, then $n$ is odd or $n = 2$. $n$ is even and $n \neq 2$. Therefore $n$ is not prime." Formalize and check.

**DM6.** Prove: If a function satisfies $\{\text{true}\}\ f()\ \{Q\}$, then $Q$ holds unconditionally after $f$ terminates (regardless of inputs).

**DM7.** Explain why $\{\text{false}\}\ C\ \{Q\}$ is trivially true for any $C$ and $Q$.

### Java Programming Problems

**JP1.** Write a method `int linearSearch(int[] arr, int key)` with `@requires`, `@ensures`, and assertions for both the found and not-found cases.

**JP2.** Write `void insertionSort(int[] arr)` with a loop invariant: "after iteration $i$, `arr[0..i]` is sorted." Verify the invariant with assertions.

**JP3.** Write a `Stack` class with `push`, `pop`, `peek`, `isEmpty` methods. Add preconditions (e.g., `pop` requires `!isEmpty()`) and postconditions using assertions.

**JP4.** Write a method that computes the GCD and annotates every step with the loop invariant: "gcd(original\_a, original\_b) = gcd(current\_a, current\_b)". Verify at each iteration.

**JP5.** Implement a `BankAccount` class with `deposit(amount)` and `withdraw(amount)`. Add preconditions (positive amounts, sufficient balance) and postconditions (balance updated correctly). Use assertions.

**JP6.** Write a method `int[] merge(int[] a, int[] b)` that merges two sorted arrays into one sorted array. Annotate with invariants and verify postcondition (result is sorted and has correct length).

### Bridge Problems

**BR1.** Take the binary search code from Example 1. Formally state the loop invariant, prove initialization (it holds before the loop), maintenance (it is preserved by each iteration), and termination (when the loop exits, the postcondition follows).

**BR2.** Write a Java method that implements Euclid's algorithm and at every iteration prints: (a) the current values of $a, b$, (b) the loop invariant ("gcd(a,b) = gcd(original\_a, original\_b)"), and (c) the variant function value ($b$). Verify all three.

**BR3.** Implement a method `boolean containsPrime(int[] arr)` with specification: "returns true if and only if arr contains at least one prime number." Use modus ponens to argue: if the array `{4, 6, 7, 8}` is passed, the method returns true (because 7 is prime, and the specification guarantees correct behavior).

---

## Solutions

### Discrete Math Solutions

**DM1.** Premises: $P$ ("raining") and $P \rightarrow Q$ ("raining → ground wet"). By modus ponens: $Q$ ("ground is wet"). $\blacksquare$

**DM2.** Premises: $P \rightarrow Q$ ("no bugs → all tests pass") and $\neg Q$ ("test 3 failed" → "not all tests pass"). By modus tollens: $\neg P$ ("the program has bugs"). $\blacksquare$

**DM3.** 1. $P$ (given). 2. $P \rightarrow Q$ (given). 3. $Q$ (modus ponens from 1, 2). 4. $Q \rightarrow R$ (given). 5. $R$ (modus ponens from 3, 4). $\blacksquare$

**DM5.** Formalize: $P$: "$n$ is prime." $Q$: "$n$ is odd or $n = 2$." Premise 1: $P \rightarrow Q$. Premise 2: $\neg Q$ (i.e., "$n$ is even and $n \neq 2$", which means $\neg(n \text{ odd or } n = 2)$). By modus tollens: $\neg P$. The argument is valid. $\blacksquare$

**DM7.** $\{\text{false}\}\ C\ \{Q\}$ says "if false holds before $C$, then $Q$ holds after." Since the precondition is never satisfied (false is never true), the triple is vacuously true. $\blacksquare$

### Java Solutions

**JP1.**
```java
/**
 * @requires arr != null
 * @ensures returns i >= 0 with arr[i] == key, or -1 if key not in arr
 */
public static int linearSearch(int[] arr, int key) {
    assert arr != null : "Precondition: arr must not be null";
    for (int i = 0; i < arr.length; i++) {
        // Invariant: key not in arr[0..i-1]
        if (arr[i] == key) {
            assert arr[i] == key;  // postcondition for found case
            return i;
        }
    }
    // Postcondition for not-found: key not in arr[0..n-1]
    return -1;
}
```

**JP2.**
```java
public static void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        // Invariant: arr[0..i-1] is sorted
        assert isSorted(arr, 0, i);
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
        // Invariant maintained: arr[0..i] is sorted
        assert isSorted(arr, 0, i + 1);
    }
    assert isSorted(arr);
}
```

**JP4.**
```java
public static int gcdWithInvariant(int a, int b) {
    int origA = a, origB = b;
    while (b != 0) {
        // Invariant: gcd(a, b) == gcd(origA, origB)
        assert gcd(a, b) == gcd(origA, origB)
            : "Invariant failed: gcd(" + a + "," + b + ")";
        // Variant: b (strictly decreasing, non-negative)
        int oldB = b;
        int r = a % b;
        a = b;
        b = r;
        assert b < oldB : "Variant not decreasing";
    }
    assert a == gcd(origA, origB) : "Postcondition failed";
    return a;
}
```

**JP6.**
```java
/**
 * @requires a is sorted, b is sorted
 * @ensures result is sorted and result.length == a.length + b.length
 */
public static int[] merge(int[] a, int[] b) {
    assert isSorted(a) && isSorted(b);
    int[] result = new int[a.length + b.length];
    int i = 0, j = 0, k = 0;
    while (i < a.length && j < b.length) {
        // Invariant: result[0..k-1] is sorted, contains a[0..i-1] and b[0..j-1]
        if (a[i] <= b[j]) result[k++] = a[i++];
        else result[k++] = b[j++];
    }
    while (i < a.length) result[k++] = a[i++];
    while (j < b.length) result[k++] = b[j++];
    assert isSorted(result);
    assert result.length == a.length + b.length;
    return result;
}
```
