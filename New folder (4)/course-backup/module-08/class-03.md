# Module 8 – Class 3: Termination and Variant Functions

## Learning Objectives

- Define variant functions (decrementing functions) for loops and recursion.
- Prove termination of iterative and recursive algorithms.
- Combine loop invariants with variant functions to achieve total correctness.
- Apply variant functions to binary search, Euclidean algorithm, and sorting.
- Connect termination to Module 6's well-ordering and recursive descent.

---

## Concept Overview

### The Termination Problem

Partial correctness tells us: *if* the program terminates, the result is correct. But how do we know it terminates? We need a **variant function**.

### Variant Functions

A **variant function** (or **decrementing function**, or **bound function**) is a function $V$ from the program state to the integers such that:

1. $V \geq 0$ whenever the loop guard is true.
2. $V$ decreases by at least 1 with each iteration.

Since $V$ is a non-negative integer that strictly decreases, the loop must terminate in at most $V_0$ iterations (where $V_0$ is the initial value).

### Total Correctness

$$\text{Total correctness} = \text{Partial correctness} + \text{Termination}$$

$$[\text{Pre}]\ C\ [\text{Post}] \iff \{Pre\}\ C\ \{Post\} + C \text{ terminates when Pre holds}$$

### Finding Variant Functions

| Algorithm | Variant Function | Why It Works |
|-----------|-----------------|--------------|
| Linear search | $n - i$ | $i$ increases by 1 each step |
| Binary search | $hi - lo + 1$ | Range shrinks each step |
| Euclidean algorithm | $b$ | Remainder $<$ divisor |
| Selection sort | $n - i$ | Outer index increases |
| Insertion sort | $n - i$ | Outer index increases |
| Fibonacci recursion | $n$ | Argument decreases |

---

## Formal Notation

| Symbol | Meaning |
|--------|---------|
| $V$ | Variant function |
| $V(\sigma)$ | Value of variant in state $\sigma$ |
| $V(\sigma) \geq 0$ | Non-negativity condition |
| $V(\sigma') < V(\sigma)$ | Strict decrease after one step |

**Hoare loop rule with termination:**

$$\frac{\{I \wedge B \wedge V = v\}\ S\ \{I \wedge V < v\} \quad I \wedge B \Rightarrow V \geq 0}{\{I\}\ \texttt{while (B) \{ S; \}}\ \{I \wedge \neg B\}} \text{ (total)}$$

---

## Worked Examples

### Example 1: Euclidean Algorithm Termination

```java
public static int gcd(int a, int b) {
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}
```

**Variant:** $V = b$.

**Proof:**
1. **$V \geq 0$:** The loop guard ensures $b \neq 0$, and since we start with $b > 0$ (precondition) and the remainder $r = a \bmod b$ satisfies $0 \leq r < b$, after the swap $b_{\text{new}} = r \geq 0$. Actually when $r = 0$, the loop exits on the next check.
2. **$V$ decreases:** $b_{\text{new}} = r = a \bmod b < b = V_{\text{old}}$. So $V$ strictly decreases.
3. **Bounded below:** $V \geq 0$ always (remainders are non-negative).

Therefore the loop terminates. Combined with the invariant $\gcd(a_0, b_0) = \gcd(a, b)$:

$$\text{Total correctness of GCD.}\ \blacksquare$$

### Example 2: Binary Search Termination

**Variant:** $V = hi - lo + 1$.

1. **$V \geq 0$:** The loop guard is $lo \leq hi$, so $V = hi - lo + 1 \geq 1 > 0$.
2. **$V$ decreases:** In each iteration:
   - If $a[\text{mid}] <$ key: $lo_{\text{new}} = \text{mid} + 1 > lo$, so $V$ decreases.
   - If $a[\text{mid}] >$ key: $hi_{\text{new}} = \text{mid} - 1 < hi$, so $V$ decreases.
   - If $a[\text{mid}] =$ key: we return (loop exits).
3. **Bounded below:** $V$ is an integer $\geq 1$ during the loop.

Maximum iterations: $\lfloor \log_2 n \rfloor + 1$, since $V$ halves (approximately) each iteration. $\blacksquare$

### Example 3: Selection Sort Termination

**Outer variant:** $V_{\text{outer}} = n - 1 - i$. Starts at $n - 2$, decreases by 1 each outer iteration.

**Inner variant:** $V_{\text{inner}} = n - j$. Starts at $n - (i+1)$, decreases by 1 each inner iteration.

Both are non-negative integers that decrease. Total comparisons:

$$\sum_{i=0}^{n-2} (n-1-i) = \frac{n(n-1)}{2} = O(n^2)$$

### Example 4: Recursive Fibonacci Termination

```java
public static long fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
```

**Variant:** $V(n) = n$.

1. Base case: $n \leq 1$ — no recursive call.
2. Recursive case: calls $\text{fib}(n-1)$ and $\text{fib}(n-2)$. Both arguments are $< n$ and $\geq 0$.
3. By well-ordering of natural numbers, the recursion terminates.

(Note: this proves *termination*, not efficiency. The time complexity is $O(2^n)$ — exponential!)

### Example 5: While Loop with Non-Obvious Variant

```java
public static int mysteryLoop(int n) {
    int x = n;
    int y = 0;
    while (x > 0) {
        x = x - 1;
        y = y + x;
    }
    return y;
}
```

**Variant:** $V = x$. Starts at $n$, decreases by 1 each iteration, bounded below by 0.

**Invariant:** $y = \sum_{k=x}^{n-1} k = \frac{n(n-1)}{2} - \frac{x(x-1)}{2}$.

At termination ($x = 0$): $y = \frac{n(n-1)}{2}$.

---

## Proof Techniques Spotlight

### Well-Ordering and Termination

The **well-ordering principle** (every non-empty set of natural numbers has a least element) is the foundation of termination proofs. A variant function maps program states to $\mathbb{N}$ and establishes that the sequence of states is well-ordered and decreasing — hence finite.

### Recursive Termination

For recursive functions, the variant is typically the argument(s):
- **Structural recursion on trees:** size or height decreases.
- **Numerical recursion:** argument decreases toward the base case.
- **Mutual recursion:** use a *joint* variant function.

### Non-Termination Detection

If no variant function exists, the program may not terminate. The classic non-terminating program:

```java
while (true) { } // V = ??? No bounded decreasing quantity
```

The **Halting Problem** (Turing, 1936) shows that no algorithm can determine termination for all programs. But for *specific* programs, we can often find variant functions.

---

## Java Deep Dive

```java
import java.util.*;

public class TerminationLibrary {

    // --- GCD with variant tracking ---

    public static int gcd(int a, int b) {
        assert a >= 0 && b > 0 : "Pre: a >= 0, b > 0";
        int steps = 0;
        System.out.printf("GCD(%d, %d):%n", a, b);
        while (b != 0) {
            int variant = b; // variant function value
            int r = a % b;
            System.out.printf("  step %d: a=%d, b=%d, r=%d, V=%d%n",
                    ++steps, a, b, r, variant);
            a = b;
            b = r;
            assert b < variant : "Variant must decrease";
            assert b >= 0 : "Variant must be non-negative";
        }
        System.out.printf("  Terminated after %d steps. gcd = %d%n", steps, a);
        return a;
    }

    // --- Binary search with variant tracking ---

    public static int binarySearch(int[] arr, int key) {
        assert arr != null;
        int lo = 0, hi = arr.length - 1;
        int steps = 0;
        while (lo <= hi) {
            int variant = hi - lo + 1;
            int mid = lo + (hi - lo) / 2;
            steps++;
            System.out.printf("  step %d: lo=%d, hi=%d, mid=%d, V=%d%n",
                    steps, lo, hi, mid, variant);
            if (arr[mid] == key) {
                System.out.printf("  Found at index %d after %d steps%n", mid, steps);
                return mid;
            } else if (arr[mid] < key) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
            int newVariant = hi - lo + 1;
            assert newVariant < variant : "Variant must decrease";
        }
        System.out.printf("  Not found after %d steps%n", steps);
        return -1;
    }

    // --- Insertion sort with step counting ---

    public static int[] insertionSort(int[] a) {
        int[] arr = Arrays.copyOf(a, a.length);
        int comparisons = 0;
        int shifts = 0;
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            // Inner variant: j + 1 (decreases each inner step)
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
                comparisons++;
                shifts++;
            }
            comparisons++; // the failing comparison
            arr[j + 1] = key;
        }
        System.out.printf("Insertion sort (%d elements): %d comparisons, %d shifts%n",
                a.length, comparisons, shifts);
        return arr;
    }

    // --- Recursive function with variant ---

    /**
     * Compute n! recursively.
     * Variant: n. Decreases by 1 each call. Base: n <= 1.
     */
    public static long factorialRecursive(int n, int depth) {
        assert n >= 0 : "Variant non-negative";
        System.out.printf("%sV=%d: factorial(%d)%n",
                "  ".repeat(depth), n, n);
        if (n <= 1) return 1;
        return n * factorialRecursive(n - 1, depth + 1);
    }

    // --- Collatz conjecture: no proven variant! ---

    /**
     * Collatz sequence: n -> n/2 if even, 3n+1 if odd.
     * Conjectured to always reach 1, but NOT PROVEN.
     * We cannot give a variant function!
     */
    public static int collatzSteps(int n) {
        assert n >= 1;
        int steps = 0;
        System.out.printf("Collatz(%d): ", n);
        while (n != 1) {
            System.out.printf("%d -> ", n);
            if (n % 2 == 0) n = n / 2;
            else n = 3 * n + 1;
            steps++;
        }
        System.out.printf("1 (%d steps)%n", steps);
        return steps;
    }

    // --- Total correctness proof template ---

    /**
     * Exponentiation by repeated squaring.
     * Pre: n >= 0
     * Post: result == base^exp
     * Invariant: result * base^exp == base_orig^exp_orig
     * Variant: exp
     */
    public static long power(long base, int exp) {
        assert exp >= 0;
        long result = 1;
        long b = base;
        int e = exp;
        // Invariant: result * b^e == base^exp
        while (e > 0) {
            assert e >= 0 : "Variant non-negative";
            if (e % 2 == 1) {
                result *= b;
            }
            b *= b;
            e /= 2;
            // Variant e has decreased (integer division by 2)
        }
        // Post: e == 0, so result * b^0 = result = base^exp
        return result;
    }

    // --- Demo ---

    public static void main(String[] args) {
        System.out.println("=== Termination Library ===\n");

        // GCD with variant tracking
        gcd(1071, 462);    // 5 steps
        System.out.println();
        gcd(610, 377);     // Fibonacci numbers: many steps

        // Binary search with variant
        System.out.println("\n--- Binary Search ---");
        int[] sorted = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
        binarySearch(sorted, 23);
        binarySearch(sorted, 50);

        // Insertion sort with step counting
        System.out.println("\n--- Insertion Sort ---");
        int[] data = {64, 25, 12, 22, 11, 90, 45};
        int[] result = insertionSort(data);
        System.out.println("Sorted: " + Arrays.toString(result));

        // Recursive factorial with variant
        System.out.println("\n--- Recursive Factorial ---");
        long fact = factorialRecursive(6, 0);
        System.out.println("6! = " + fact);

        // Collatz: no variant function known!
        System.out.println("\n--- Collatz (no proven termination!) ---");
        collatzSteps(27);

        // Power with variant
        System.out.println("\n--- Power (repeated squaring) ---");
        System.out.println("2^10 = " + power(2, 10));
        System.out.println("3^7 = " + power(3, 7));
    }
}
```

---

## Historical Context

**Alan Turing** (1936) proved the **Halting Problem** is undecidable: no algorithm can determine, for every program and input, whether the program terminates. This means we cannot automate termination proofs in general.

**Robert W. Floyd** (1967) introduced the use of **well-founded orderings** (a generalization of variant functions) for proving termination.

**Edsger Dijkstra** (1976) systematized **variant functions** (which he called "bound functions") in *A Discipline of Programming*. His approach: design the invariant and the variant together with the loop.

The **Collatz conjecture** (1937) — that the sequence $n \to n/2$ (even) or $n \to 3n+1$ (odd) always reaches 1 — remains one of the most famous open problems. No variant function is known!

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** What is a variant function? What two properties must it have?

**A2.** Why can't `while (true) { }` have a variant function?

**A3.** What is the variant function for binary search? How does it relate to $O(\log n)$ complexity?

**A4.** Explain the difference between partial correctness and total correctness.

### Slide Set B: Proof Problems

**B1.** Prove that the Euclidean algorithm terminates using $V = b$ as the variant.

**B2.** Prove termination of insertion sort using appropriate variant functions for both loops.

**B3.** Provide a variant function for `power(base, exp)` (repeated squaring). Prove it terminates.

### Slide Set C: Java Coding Problems

**C1.** Add variant-tracking print statements to the GCD algorithm. Run on Fibonacci pairs ($F_{n+1}, F_n$) and observe the number of steps.

**C2.** Implement the Collatz sequence. Print each step. Try to find a variant function (you won't succeed — this is an open problem!).

**C3.** Implement repeated squaring for `power(base, exp)`. Assert the variant decreases.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Define "variant function." State the two conditions it must satisfy.

**DM2.** Prove the Euclidean algorithm terminates. What is the maximum number of steps for inputs $<n$? (Answer: $O(\log n)$ — the number of steps is at most $5 \cdot \lfloor \log_{10} \min(a,b) \rfloor$, Lamé's theorem.)

**DM3.** For a while loop with guard $i < n$ and body $i = i + 2$, state a variant function and prove termination. For which starting values of $i$ does it actually terminate?

**DM4.** Explain why the Halting Problem means we can never have a universal variant-function finder.

**DM5.** Give an example of a partial correctness proof where the program does not terminate. Is the Hoare triple still valid?

**DM6.** For repeated squaring: if $e_0$ is the initial exponent, how many iterations until termination? Prove: $\lfloor \log_2 e_0 \rfloor + 1$.

### Java Programming Problems

**JP1.** Implement GCD with step-counting. Test on Fibonacci consecutive pairs ($F_n, F_{n-1}$) for $n = 5, 10, 20, 30$. Report step counts.

**JP2.** Implement binary search with variant tracking. For an array of size 1,000,000, verify the search takes at most $\lceil \log_2 1{,}000{,}000 \rceil = 20$ steps.

**JP3.** Implement the Collatz conjecture: print the sequence for $n = 1, ..., 100$. Track the maximum sequence length.

**JP4.** Write a `totalCorrectnessChecker` method that, given a sorting function, verifies:
   (a) The output is sorted (partial correctness).
   (b) The output is a permutation of the input.
   (c) The function terminated (trivially true if we got a result).

**JP5.** Implement repeated squaring with variant assertion. Compute $2^{32}$, $3^{20}$, $7^{15}$ and verify against `Math.pow`.

### Bridge Problems

**BR1.** Module 6: Prove by strong induction that the Euclidean algorithm terminates. Frame the proof using the well-ordering of $\mathbb{N}$ and connect to the variant function.

**BR2.** Module 7: The number of iterations of binary search is $\leq \lfloor \log_2 n \rfloor + 1$. This is a counting argument: the range $[lo, hi]$ halves each time. Connect this to the product rule: after $k$ halvings, $n / 2^k \leq 1$, so $k \geq \log_2 n$.

**BR3.** Module 1: The GCD loop maintains the invariant $\gcd(a_0, b_0) = \gcd(a, b)$ (Module 1, Class 3). The variant $V = b$ proves termination. Together, these give total correctness.

---

## Solutions

### Discrete Math Solutions

**DM1.** A variant function $V: \text{State} \to \mathbb{Z}$ satisfies:
(i) $V \geq 0$ whenever the loop guard is true.
(ii) $V$ strictly decreases each iteration ($V_{\text{after}} < V_{\text{before}}$).

**DM2.** Variant: $V = b$. $b_{\text{new}} = a \bmod b < b$, so $V$ decreases. Since $V \geq 0$ and is an integer, termination follows. By Lamé's theorem (1844), the Euclidean algorithm on inputs $< n$ takes at most $\lfloor 2.078 \ln n + 0.6723 \rfloor \approx 5 \log_{10} n$ steps. The worst case is consecutive Fibonacci numbers. $\blacksquare$

**DM3.** Variant: $V = n - i$ (for even $n - i$). The loop increments $i$ by 2 each time. If $(n - i_0)$ is positive and even, the loop terminates in $(n - i_0)/2$ steps. If $(n - i_0)$ is odd, it may skip past (depends on comparison type).

Strictly: for `int i = 0; while (i < n) { i += 2; }`, the variant is $\lceil (n - i) / 2 \rceil$. The loop terminates for all $n \geq 0$. $\blacksquare$

**DM5.** The Hoare triple $\{x > 0\}\ \texttt{while(true)\{\}}\ \{x < 0\}$ is valid! Partial correctness is vacuously true: the program never terminates, so the postcondition "holds" trivially (there's no terminating execution to violate it).

**DM6.** The variant is $e$. Each iteration: $e_{\text{new}} = \lfloor e / 2 \rfloor$. After $k$ iterations: $e_k = \lfloor e_0 / 2^k \rfloor$. The loop exits when $e = 0$: $\lfloor e_0 / 2^k \rfloor = 0 \Leftrightarrow 2^k > e_0 \Leftrightarrow k > \log_2 e_0$. So iterations $= \lfloor \log_2 e_0 \rfloor + 1$. $\blacksquare$
