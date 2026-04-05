# Module 6 – Class 1: Principle of Mathematical Induction

## Learning Objectives

- State the principle of mathematical induction (PMI).
- Identify and verify the base case and inductive step.
- Use induction to prove summation formulas and divisibility results.
- Connect induction to loops and recursion in Java.
- Implement iterative and recursive versions of the same computation, relating each to the proof structure.

---

## Concept Overview

### The Principle of Mathematical Induction

To prove a statement $P(n)$ for all integers $n \geq n_0$:

1. **Base case:** Prove $P(n_0)$.
2. **Inductive step:** Assume $P(k)$ for some $k \geq n_0$ (**inductive hypothesis**). Prove $P(k+1)$.

If both succeed, then $P(n)$ holds for all $n \geq n_0$.

### The Domino Analogy

Induction is like an infinite row of dominos:
- Push the first domino (base case).
- Show that if any domino falls, the next one falls too (inductive step).
- Conclusion: all dominos fall.

### Why Induction Works

PMI is an axiom of the natural numbers (Peano's fifth axiom). It captures the idea that every natural number can be reached from 0 by repeatedly adding 1.

### Connection to Computation

| Induction Component | Loop Version | Recursion Version |
|---------------------|-------------|-------------------|
| Base case $P(n_0)$ | Initialization before loop | Base case in recursion |
| Inductive hypothesis $P(k)$ | Loop invariant at iteration $k$ | Recursive call result |
| Inductive step $P(k) \to P(k+1)$ | Loop body | Recursive case |
| Conclusion $\forall n \geq n_0, P(n)$ | Postcondition after loop | Correctness for all inputs |

---

## Formal Notation

$$\left[\,P(n_0) \;\wedge\; \bigl(\forall k \geq n_0:\; P(k) \to P(k+1)\bigr)\,\right] \implies \forall n \geq n_0:\; P(n)$$

---

## Worked Examples

### Example 1: Sum of First $n$ Natural Numbers

**Claim:** $\displaystyle\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$ for all $n \geq 1$.

**Proof by induction.**

*Base case ($n = 1$):* $\sum_{i=1}^{1} i = 1 = \frac{1 \cdot 2}{2}$. ✓

*Inductive step:* Assume $\sum_{i=1}^{k} i = \frac{k(k+1)}{2}$ for some $k \geq 1$.

$$\sum_{i=1}^{k+1} i = \left(\sum_{i=1}^{k} i\right) + (k+1) = \frac{k(k+1)}{2} + (k+1) = \frac{k(k+1) + 2(k+1)}{2} = \frac{(k+1)(k+2)}{2}$$

This is $\frac{(k+1)((k+1)+1)}{2}$, which is $P(k+1)$. ✓ $\blacksquare$

### Example 2: Sum of Squares

**Claim:** $\displaystyle\sum_{i=1}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}$ for all $n \geq 1$.

*Base case ($n = 1$):* $1 = \frac{1 \cdot 2 \cdot 3}{6} = 1$. ✓

*Inductive step:* Assume the formula holds for $k$. Then:
$$\sum_{i=1}^{k+1} i^2 = \frac{k(k+1)(2k+1)}{6} + (k+1)^2 = \frac{k(k+1)(2k+1) + 6(k+1)^2}{6}$$
$$= \frac{(k+1)[k(2k+1) + 6(k+1)]}{6} = \frac{(k+1)(2k^2 + 7k + 6)}{6} = \frac{(k+1)(k+2)(2k+3)}{6}$$

This is the formula with $n = k+1$. ✓ $\blacksquare$

### Example 3: Divisibility

**Claim:** $n^3 - n$ is divisible by 3 for all $n \geq 0$.

*Base case ($n = 0$):* $0^3 - 0 = 0$, and $3 \mid 0$. ✓

*Inductive step:* Assume $3 \mid (k^3 - k)$.
$$(k+1)^3 - (k+1) = k^3 + 3k^2 + 3k + 1 - k - 1 = (k^3 - k) + 3k^2 + 3k = (k^3 - k) + 3(k^2 + k)$$

By the inductive hypothesis, $3 \mid (k^3 - k)$. Clearly $3 \mid 3(k^2 + k)$. So $3$ divides their sum. ✓ $\blacksquare$

### Example 4: Power of 2

**Claim:** $2^n > n$ for all $n \geq 1$.

*Base case ($n = 1$):* $2^1 = 2 > 1$. ✓

*Inductive step:* Assume $2^k > k$ for some $k \geq 1$.
$$2^{k+1} = 2 \cdot 2^k > 2k = k + k \geq k + 1$$

(since $k \geq 1$). So $2^{k+1} > k + 1$. ✓ $\blacksquare$

### Example 5: Geometric Sum

**Claim:** $\displaystyle\sum_{i=0}^{n} r^i = \frac{r^{n+1} - 1}{r - 1}$ for $r \neq 1$ and all $n \geq 0$.

*Base case ($n = 0$):* $r^0 = 1 = \frac{r - 1}{r - 1}$. ✓

*Inductive step:* Assume the formula for $k$:
$$\sum_{i=0}^{k+1} r^i = \frac{r^{k+1} - 1}{r-1} + r^{k+1} = \frac{r^{k+1} - 1 + r^{k+1}(r-1)}{r-1} = \frac{r^{k+2} - 1}{r-1}$$

✓ $\blacksquare$

---

## Proof Techniques Spotlight

### The Induction Template

1. **State** the predicate $P(n)$ clearly.
2. **Base case:** Substitute $n = n_0$ and verify directly.
3. **Inductive hypothesis:** "Assume $P(k)$ holds for some $k \geq n_0$."
4. **Inductive step:** Start from $P(k+1)$'s left side, manipulate to use $P(k)$.
5. **Conclude:** By PMI, $P(n)$ holds for all $n \geq n_0$.

### Common Mistakes

- **Forgetting the base case.** The step alone is not enough.
- **Not using the hypothesis.** If you prove $P(k+1)$ without assuming $P(k)$, you have a direct proof, not induction.
- **Wrong base case.** If $P(n)$ is for $n \geq 2$, verify $P(2)$, not $P(1)$.
- **Falling into circularity.** Never assume what you want to prove.

---

## Java Deep Dive

```java
import java.util.*;

public class InductionLibrary {

    // --- Summation Functions ---

    /**
     * Iterative sum: 1 + 2 + ... + n.
     * Loop invariant: after iteration i, sum = i(i+1)/2.
     */
    public static long sumIterative(int n) {
        long sum = 0;
        for (int i = 1; i <= n; i++) {
            sum += i;
            // Invariant: sum == i * (i + 1) / 2
        }
        return sum;
    }

    /**
     * Recursive sum: mirrors the inductive proof.
     * Base case: sum(0) = 0.
     * Recursive case: sum(n) = sum(n-1) + n.
     */
    public static long sumRecursive(int n) {
        if (n <= 0) return 0;       // Base case
        return sumRecursive(n - 1) + n;  // Inductive step
    }

    /**
     * Closed-form formula (direct computation).
     * This is what the proof establishes.
     */
    public static long sumFormula(int n) {
        return (long) n * (n + 1) / 2;
    }

    // --- Sum of Squares ---

    public static long sumSquaresIterative(int n) {
        long sum = 0;
        for (int i = 1; i <= n; i++) {
            sum += (long) i * i;
        }
        return sum;
    }

    public static long sumSquaresFormula(int n) {
        return (long) n * (n + 1) * (2 * n + 1) / 6;
    }

    // --- Divisibility: n^3 - n divisible by 3 ---

    public static boolean cubeMinusNDivisibleBy3(int n) {
        long val = (long) n * n * n - n;
        return val % 3 == 0;
    }

    // --- Geometric Sum ---

    public static double geometricSumIterative(double r, int n) {
        double sum = 0;
        for (int i = 0; i <= n; i++) {
            sum += Math.pow(r, i);
        }
        return sum;
    }

    public static double geometricSumFormula(double r, int n) {
        if (Math.abs(r - 1.0) < 1e-10) return n + 1;
        return (Math.pow(r, n + 1) - 1) / (r - 1);
    }

    // --- Factorial ---

    /**
     * Iterative factorial.
     * Loop invariant: after iteration i, result = i!
     */
    public static long factorialIterative(int n) {
        long result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
            // Invariant: result == i!
        }
        return result;
    }

    /**
     * Recursive factorial: mirrors induction.
     * Base case: 0! = 1.
     * Inductive step: n! = n * (n-1)!
     */
    public static long factorialRecursive(int n) {
        if (n <= 1) return 1;
        return n * factorialRecursive(n - 1);
    }

    // --- Verification: Check formula against computation ---

    /**
     * For each n from 1 to max, verify formula matches iterative sum.
     * This is empirical verification — the proof provides certainty.
     */
    public static void verifyFormulas(int max) {
        System.out.println("Verifying formulas for n = 1 to " + max + "...");
        for (int n = 1; n <= max; n++) {
            // Sum of first n naturals
            assert sumIterative(n) == sumFormula(n)
                    : "Sum formula failed at n=" + n;

            // Sum of squares
            assert sumSquaresIterative(n) == sumSquaresFormula(n)
                    : "Sum-of-squares formula failed at n=" + n;

            // n^3 - n divisible by 3
            assert cubeMinusNDivisibleBy3(n)
                    : "n^3-n not divisible by 3 at n=" + n;

            // Geometric sum (r=2)
            double iterGeo = geometricSumIterative(2.0, n);
            double formGeo = geometricSumFormula(2.0, n);
            assert Math.abs(iterGeo - formGeo) < 1e-6
                    : "Geometric sum failed at n=" + n;
        }
        System.out.println("All formulas verified!");
    }

    // --- Power of 2 > n ---

    public static void verifyPowerOf2(int max) {
        System.out.println("Verifying 2^n > n for n = 1 to " + max + "...");
        for (int n = 1; n <= max; n++) {
            long pow = 1L << n; // 2^n using bit shift
            assert pow > n : "2^n > n failed at n=" + n;
        }
        System.out.println("Verified!");
    }

    // --- Demonstration ---

    public static void main(String[] args) {
        System.out.println("=== Induction Library ===\n");

        System.out.println("Sum of 1..100:");
        System.out.println("  Iterative: " + sumIterative(100));
        System.out.println("  Recursive: " + sumRecursive(100));
        System.out.println("  Formula:   " + sumFormula(100));

        System.out.println("\nSum of squares 1..10:");
        System.out.println("  Iterative: " + sumSquaresIterative(10));
        System.out.println("  Formula:   " + sumSquaresFormula(10));

        System.out.println("\n10! = " + factorialIterative(10));
        System.out.println("10! = " + factorialRecursive(10));

        System.out.println("\nGeometric sum r=2, n=10:");
        System.out.println("  Iterative: " + geometricSumIterative(2.0, 10));
        System.out.println("  Formula:   " + geometricSumFormula(2.0, 10));
        // 2^11 - 1 = 2047

        System.out.println();
        verifyFormulas(1000);
        verifyPowerOf2(60);
    }
}
```

---

## Historical Context

**Blaise Pascal** (1654) and **Pierre de Fermat** used induction implicitly in their study of combinatorial identities and number theory. **Giuseppe Peano** (1889) made induction an explicit axiom in his axiomatization of the natural numbers. The Peano axioms remain the foundation of arithmetic.

The connection between induction and recursion was made rigorous by **Kurt Gödel** (1931) and **Stephen Kleene** (1936) through primitive recursive functions, laying the groundwork for theoretical computer science.

**Gauss** (age ~10, ca. 1787) famously computed $1 + 2 + \cdots + 100 = 5050$ by the pairing trick: write the sum forwards and backwards, pair terms to get $n+1$ each, giving $\frac{n(n+1)}{2}$.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** What are the two components of an induction proof? What role does each play?

**A2.** True or false: "If the inductive step works, the theorem is proved even without a base case."

**A3.** How does a `for` loop from 1 to $n$ mirror an induction proof?

**A4.** What goes wrong if we try to prove "$2^n > n^2$ for all $n \geq 1$" by induction? (Hint: check the base case.)

### Slide Set B: Proof Problems

**B1.** Prove by induction: $\displaystyle\sum_{i=1}^{n} (2i - 1) = n^2$.

**B2.** Prove by induction: $3 \mid (4^n - 1)$ for all $n \geq 1$.

**B3.** Prove by induction: $\displaystyle\sum_{i=0}^{n} 2^i = 2^{n+1} - 1$.

### Slide Set C: Java Coding Problems

**C1.** Write both iterative and recursive methods for $\sum_{i=1}^n i^2$. Verify they agree for $n = 1$ to 100.

**C2.** Write a method that checks $3 \mid (n^3 - n)$ for all $n$ from 0 to 10000.

**C3.** Implement factorial iteratively with a loop invariant comment. Add an assertion checking the invariant.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Prove by induction: $\displaystyle\sum_{i=1}^{n} i^3 = \left(\frac{n(n+1)}{2}\right)^2$.

**DM2.** Prove by induction: $n! > 2^n$ for all $n \geq 4$.

**DM3.** Prove by induction: for all $n \geq 1$, $\displaystyle\sum_{i=1}^{n} \frac{1}{i(i+1)} = \frac{n}{n+1}$.

**DM4.** Prove by induction: $6 \mid n(n+1)(n+2)$ for all $n \geq 0$.

**DM5.** Prove: $1 + 2 + 4 + \cdots + 2^{n-1} = 2^n - 1$ (geometric sum with $r = 2$).

**DM6.** Prove by induction: the number of subsets of a set with $n$ elements is $2^n$. (Connect to Module 4, power sets.)

### Java Programming Problems

**JP1.** Implement `sumFormula(n)`, `sumIterative(n)`, and `sumRecursive(n)`. Verify all three agree for $n = 1$ to 10000.

**JP2.** Implement `factorialIterative(n)` and `factorialRecursive(n)`. Add loop invariant comments and assertions.

**JP3.** Write a method `boolean isDivisibleBy(long n, int d)` and use it to verify $6 \mid n(n+1)(n+2)$ for $n = 0$ to 1000.

**JP4.** Implement iterative and recursive geometric sum. Compare with the formula for various $r$ and $n$.

**JP5.** Write a method that, given $n$, returns the minimum $k$ such that $2^k > n$. Test it and explain the connection to $\lceil \log_2(n+1) \rceil$.

### Bridge Problems

**BR1.** From Module 1: prove that the GCD algorithm terminates using the well-ordering principle (every non-empty set of non-negative integers has a least element). Then show how the well-ordering principle follows from PMI, and vice versa.

**BR2.** From Module 4: prove $|\mathcal{P}(A)| = 2^{|A|}$ by induction on $|A|$. Connect to the bit-mask power set generation from Module 4, Class 3.

---

## Solutions

### Discrete Math Solutions

**DM1.** *Base ($n=1$):* $1^3 = 1 = (1 \cdot 2/2)^2 = 1$. ✓

*Inductive step:* Assume $\sum_{i=1}^k i^3 = \left(\frac{k(k+1)}{2}\right)^2$.

$$\sum_{i=1}^{k+1} i^3 = \frac{k^2(k+1)^2}{4} + (k+1)^3 = \frac{k^2(k+1)^2 + 4(k+1)^3}{4} = \frac{(k+1)^2(k^2 + 4k + 4)}{4} = \frac{(k+1)^2(k+2)^2}{4}$$

$= \left(\frac{(k+1)(k+2)}{2}\right)^2$. ✓ $\blacksquare$

**DM2.** *Base ($n=4$):* $4! = 24 > 16 = 2^4$. ✓

*Inductive step:* Assume $k! > 2^k$ for $k \geq 4$.
$(k+1)! = (k+1) \cdot k! > (k+1) \cdot 2^k \geq 2 \cdot 2^k = 2^{k+1}$ (since $k+1 \geq 5 > 2$). ✓ $\blacksquare$

**DM4.** *Base ($n=0$):* $0 \cdot 1 \cdot 2 = 0$, and $6 \mid 0$. ✓

*Inductive step:* Assume $6 \mid k(k+1)(k+2)$.
$(k+1)(k+2)(k+3) = k(k+1)(k+2) + 3(k+1)(k+2)$.

By hypothesis, $6 \mid k(k+1)(k+2)$. Also, $(k+1)(k+2)$ is the product of two consecutive integers, so one is even, meaning $2 \mid (k+1)(k+2)$. Thus $6 \mid 3(k+1)(k+2)$. So $6$ divides the sum. ✓ $\blacksquare$

**DM6.** *Base ($n=0$):* $|\mathcal{P}(\emptyset)| = |\{\emptyset\}| = 1 = 2^0$. ✓

*Inductive step:* Let $|A| = k$ with $|\mathcal{P}(A)| = 2^k$. Let $A' = A \cup \{x\}$ where $x \notin A$, so $|A'| = k+1$. Every subset of $A'$ either contains $x$ or doesn't. Subsets not containing $x$ are exactly the subsets of $A$: there are $2^k$. Subsets containing $x$ are of the form $S \cup \{x\}$ for $S \subseteq A$: there are $2^k$. Total: $2^k + 2^k = 2^{k+1}$. ✓ $\blacksquare$
