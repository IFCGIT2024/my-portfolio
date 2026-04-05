# Module 6 – Class 2: Strong Induction and Recursive Definitions

## Learning Objectives

- State and apply the principle of strong induction.
- Distinguish strong induction from ordinary induction.
- Write recursive definitions (sequences, sets, functions).
- Prove properties of recursively defined objects.
- Implement recursive functions in Java and prove their correctness/termination.

---

## Concept Overview

### Strong Induction

**Ordinary induction** assumes $P(k)$ to prove $P(k+1)$.

**Strong induction** assumes $P(n_0), P(n_0+1), \ldots, P(k)$ to prove $P(k+1)$.

Formally, to prove $P(n)$ for all $n \geq n_0$:
1. **Base case(s):** Prove $P(n_0)$ (and possibly $P(n_0+1), \ldots, P(n_0 + j)$).
2. **Inductive step:** Assume $P(n_0), P(n_0+1), \ldots, P(k)$ for some $k$. Prove $P(k+1)$.

Strong induction is logically equivalent to ordinary induction but sometimes more natural.

### When to Use Strong Induction

- When the proof of $P(k+1)$ requires $P(j)$ for some $j < k$ (not just $P(k)$).
- Divide-and-conquer algorithms: proving correctness when the problem splits into subproblems of varying size.
- Proving unique factorization: factoring $n$ uses factorizations of divisors less than $n$.

### Recursive Definitions

A **recursive definition** specifies:
1. **Base case(s):** Explicitly define the object for small inputs.
2. **Recursive case:** Define the object in terms of smaller instances.

| Object | Base | Recursive Rule |
|--------|------|---------------|
| $n!$ | $0! = 1$ | $n! = n \cdot (n-1)!$ |
| $F_n$ (Fibonacci) | $F_0 = 0, F_1 = 1$ | $F_n = F_{n-1} + F_{n-2}$ |
| $\sum_{i=1}^n a_i$ | $\sum_{i=1}^{1} a_i = a_1$ | $\sum_{i=1}^{n} a_i = \left(\sum_{i=1}^{n-1} a_i\right) + a_n$ |

---

## Formal Notation

**Strong Induction Principle:**

$$\left[\,P(n_0) \;\wedge\; \bigl(\forall k \geq n_0:\; \bigl(P(n_0) \wedge \cdots \wedge P(k)\bigr) \to P(k+1)\bigr)\,\right] \implies \forall n \geq n_0:\; P(n)$$

---

## Worked Examples

### Example 1: Every Integer $> 1$ Has a Prime Factor

**Claim:** Every integer $n > 1$ has a prime factor.

**Proof by strong induction on $n$.**

*Base case ($n = 2$):* 2 is prime, so it is its own prime factor. ✓

*Inductive step:* Assume every integer $j$ with $2 \leq j \leq k$ has a prime factor.

Consider $k + 1$. If $k + 1$ is prime, it is its own prime factor. ✓

If $k + 1$ is composite, then $k + 1 = ab$ where $2 \leq a, b \leq k$. By the inductive hypothesis, $a$ has a prime factor $p$. Since $p \mid a$ and $a \mid (k+1)$, we have $p \mid (k+1)$ (by transitivity of divisibility, Module 1). ✓ $\blacksquare$

### Example 2: Fundamental Theorem of Arithmetic (Existence)

**Claim:** Every integer $n > 1$ can be written as a product of primes.

**Proof by strong induction.**

*Base case ($n = 2$):* $2$ is prime, so it is a product of one prime. ✓

*Inductive step:* Assume every integer $j$ with $2 \leq j \leq k$ has a prime factorization.

If $k+1$ is prime, it is a product of one prime. ✓

If $k+1$ is composite, then $k+1 = ab$ with $2 \leq a, b \leq k$. By hypothesis, both $a$ and $b$ have prime factorizations. Concatenating them gives a prime factorization of $k+1$. ✓ $\blacksquare$

### Example 3: Fibonacci Numbers

**Claim:** $F_n < 2^n$ for all $n \geq 0$.

*Base cases:* $F_0 = 0 < 1 = 2^0$. $F_1 = 1 < 2 = 2^1$. ✓

*Inductive step:* Assume $F_j < 2^j$ for all $j \leq k$ where $k \geq 1$.

$$F_{k+1} = F_k + F_{k-1} < 2^k + 2^{k-1} = 2^{k-1}(2 + 1) = 3 \cdot 2^{k-1} < 4 \cdot 2^{k-1} = 2^{k+1}$$

✓ $\blacksquare$

### Example 4: Euclidean Algorithm Terminates (Module 1 Connection)

**Claim:** `gcd(a, b)` terminates for all $a \geq 0, b \geq 0$ with $a + b > 0$.

**Proof by strong induction on $b$.**

*Base case ($b = 0$):* The algorithm returns $a$ immediately. ✓

*Inductive step:* Assume the algorithm terminates for all inputs with second argument $< k+1$. The algorithm computes $r = a \bmod (k+1)$, where $0 \leq r < k+1$, then calls `gcd(k+1, r)`. Since $r < k+1$, the inductive hypothesis applies, so this call terminates. ✓ $\blacksquare$

### Example 5: Recursive Definition and Proof — Towers of Hanoi

**Recursive definition:** $T(n) =$ minimum number of moves to transfer $n$ disks.
- $T(1) = 1$
- $T(n) = 2T(n-1) + 1$ for $n > 1$

**Claim:** $T(n) = 2^n - 1$.

*Base ($n = 1$):* $T(1) = 1 = 2^1 - 1$. ✓

*Inductive step:* $T(k+1) = 2T(k) + 1 = 2(2^k - 1) + 1 = 2^{k+1} - 1$. ✓ $\blacksquare$

---

## Proof Techniques Spotlight

### Choosing Between Ordinary and Strong Induction

- **Ordinary induction:** Sufficient when $P(k+1)$ follows from $P(k)$ alone. Simpler.
- **Strong induction:** Necessary when the step requires $P(j)$ for arbitrary $j < k+1$. Common in divisibility, factorization, and divide-and-conquer arguments.

### Verifying Recursive Definitions Are Well-Defined

A recursive definition is well-defined if:
1. Every input eventually reduces to a base case.
2. The recursive cases do not create circular dependencies.

This parallels proving termination of recursive functions.

---

## Java Deep Dive

```java
import java.util.*;

public class StrongInductionLibrary {

    // --- Fibonacci ---

    /**
     * Naive recursive Fibonacci.
     * Correctness: by definition F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).
     * Warning: exponential time! O(2^n).
     */
    public static long fibRecursive(int n) {
        if (n <= 0) return 0;
        if (n == 1) return 1;
        return fibRecursive(n - 1) + fibRecursive(n - 2);
    }

    /**
     * Iterative Fibonacci with loop invariant.
     * Invariant: after iteration i, prev = F(i-1), curr = F(i).
     * O(n) time, O(1) space.
     */
    public static long fibIterative(int n) {
        if (n <= 0) return 0;
        long prev = 0, curr = 1;
        for (int i = 2; i <= n; i++) {
            long next = prev + curr;
            prev = curr;
            curr = next;
            // Invariant: prev == F(i-1), curr == F(i)
        }
        return curr;
    }

    /**
     * Memoized Fibonacci using dynamic programming.
     * O(n) time, O(n) space.
     */
    public static long fibMemoized(int n) {
        if (n <= 0) return 0;
        long[] dp = new long[n + 1];
        dp[0] = 0;
        dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }

    // --- Prime Factorization (Strong Induction) ---

    /**
     * Recursive prime factorization.
     * Base: if n is prime, return [n].
     * Recursive: find smallest factor d > 1, return [d] + factor(n/d).
     *
     * Correctness: By strong induction on n.
     * Termination: n/d < n, so the argument strictly decreases.
     */
    public static List<Integer> primeFactors(int n) {
        List<Integer> factors = new ArrayList<>();
        primeFactorsHelper(n, factors);
        return factors;
    }

    private static void primeFactorsHelper(int n, List<Integer> factors) {
        if (n <= 1) return;
        // Find smallest divisor > 1
        for (int d = 2; d * d <= n; d++) {
            if (n % d == 0) {
                factors.add(d);
                primeFactorsHelper(n / d, factors);
                return;
            }
        }
        // n is prime
        factors.add(n);
    }

    // --- Towers of Hanoi ---

    /**
     * Recursive Hanoi: move n disks from 'from' to 'to' using 'aux'.
     * T(n) = 2^n - 1 moves.
     */
    public static int hanoi(int n, String from, String to, String aux) {
        if (n == 0) return 0;
        int moves = 0;
        moves += hanoi(n - 1, from, aux, to);
        System.out.println("  Move disk " + n + " from " + from + " to " + to);
        moves += 1;
        moves += hanoi(n - 1, aux, to, from);
        return moves;
    }

    // --- Recurrence: T(n) = 2T(n/2) + n ---

    /**
     * Simulates merge sort recurrence.
     * By strong induction / master theorem: T(n) = O(n log n).
     */
    public static int mergeSortWork(int n) {
        if (n <= 1) return 0;
        return 2 * mergeSortWork(n / 2) + n;
    }

    // --- Verification ---

    public static void verifyFibBound(int max) {
        System.out.println("Verifying F(n) < 2^n...");
        for (int n = 0; n <= max; n++) {
            long fib = fibIterative(n);
            long pow = 1L << n;
            assert fib < pow : "F(" + n + ") = " + fib + " >= 2^" + n;
        }
        System.out.println("Verified up to n = " + max);
    }

    public static void main(String[] args) {
        System.out.println("=== Strong Induction Library ===\n");

        // Fibonacci
        System.out.println("Fibonacci:");
        for (int n = 0; n <= 15; n++) {
            System.out.printf("  F(%d) = %d (iter=%d, memo=%d)%n",
                    n, fibRecursive(n), fibIterative(n), fibMemoized(n));
        }

        // Prime factorization
        System.out.println("\nPrime factorization (strong induction):");
        int[] testNums = {2, 12, 60, 97, 360, 1001};
        for (int n : testNums) {
            System.out.println("  " + n + " = " + primeFactors(n));
        }

        // Towers of Hanoi
        System.out.println("\nTowers of Hanoi (n=3):");
        int moves = hanoi(3, "A", "C", "B");
        System.out.println("  Total moves: " + moves + " (expected: " + ((1 << 3) - 1) + ")");

        // Merge sort recurrence
        System.out.println("\nMerge sort work:");
        for (int n : new int[]{1, 2, 4, 8, 16, 32, 64}) {
            System.out.println("  T(" + n + ") = " + mergeSortWork(n));
        }

        System.out.println();
        verifyFibBound(60);
    }
}
```

---

## Historical Context

**Strong induction** appears implicitly in Euclid's proof of the infinitude of primes and his fundamental result that every integer can be factored into primes.

The **Fibonacci sequence** was introduced by Leonardo of Pisa (Fibonacci) in *Liber Abaci* (1202) as a model of rabbit population growth. It appears in countless natural phenomena, and the ratio $F_{n+1}/F_n$ converges to the golden ratio $\phi = \frac{1+\sqrt{5}}{2}$.

The **Towers of Hanoi** puzzle was invented by Édouard Lucas (1883). The recurrence $T(n) = 2T(n-1)+1$ is one of the simplest nontrivial recurrences, and its analysis illustrates the power of induction applied to recursive definitions.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** What is the difference between ordinary induction and strong induction?

**A2.** Why does the proof that "every integer > 1 has a prime factor" require strong induction?

**A3.** Give a recursive definition of $n!$ with base case and recursive case.

**A4.** Why does a recursive function need a base case?

### Slide Set B: Proof Problems

**B1.** Use strong induction to prove: every integer $n \geq 2$ is either prime or a product of primes.

**B2.** Prove by induction: $F_n \geq \phi^{n-2}$ for $n \geq 1$, where $\phi = \frac{1+\sqrt{5}}{2}$.

**B3.** Prove: if $T(1) = 1$ and $T(n) = 2T(n-1) + 1$, then $T(n) = 2^n - 1$.

### Slide Set C: Java Coding Problems

**C1.** Implement Fibonacci iteratively and recursively. Time the naive recursive version for $n = 40$ and the iterative for $n = 40$. Observe the difference.

**C2.** Implement recursive prime factorization. Verify the product of factors equals $n$.

**C3.** Implement Towers of Hanoi. Verify the move count equals $2^n - 1$.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Prove by strong induction: every integer $n \geq 12$ can be expressed as $4a + 5b$ for non-negative integers $a, b$. (Hint: base cases $n = 12, 13, 14, 15$.)

**DM2.** Prove by strong induction: the Euclidean algorithm terminates in at most $2\lfloor\log_2(\min(a,b))\rfloor + 1$ steps.

**DM3.** Prove: $F_1 + F_3 + F_5 + \cdots + F_{2n-1} = F_{2n}$ for all $n \geq 1$.

**DM4.** Define $a_1 = 1, a_2 = 3$, and $a_n = a_{n-1} + 2a_{n-2}$ for $n \geq 3$. Prove by strong induction: $a_n = 2^n + (-1)^n$ divided by 3. (Actually $a_n = \frac{2^n - (-1)^n}{3}$.)

**DM5.** Use strong induction to prove: a binary tree with $n$ nodes has $n - 1$ edges. (Preview of Module 9.)

### Java Programming Problems

**JP1.** Implement three Fibonacci methods: naive recursive, iterative, memoized. Compare timing for $n = 30, 35, 40, 45$.

**JP2.** Implement `primeFactors(n)` recursively. Verify: (a) all factors are prime, (b) their product equals $n$.

**JP3.** Implement the recurrence $a_n = a_{n-1} + 2a_{n-2}$ with $a_1 = 1, a_2 = 3$. Verify the closed form $a_n = \frac{2^n - (-1)^n}{3}$ for $n = 1$ to 30.

**JP4.** Implement Towers of Hanoi. Count moves and verify $= 2^n - 1$. Print the sequence of moves for $n = 4$.

**JP5.** Implement `int stageCoins(int n)` that computes the minimum number of coins (denominations 1, 5, 10, 25) to make change for $n$ cents, using recursion with memoization.

### Bridge Problems

**BR1.** From Module 2: the Fundamental Theorem of Arithmetic says every $n > 1$ has a unique prime factorization. Prove uniqueness by strong induction (harder than existence). Connect to Module 2's factorization code.

**BR2.** From Module 5: prove that the number of functions from an $n$-element set to a 2-element set is $2^n$ using induction. Connect to Module 4's power set result ($|\mathcal{P}(A)| = 2^{|A|}$) by showing a bijection between subsets and characteristic functions.

---

## Solutions

### Discrete Math Solutions

**DM1.** *Base cases:* $12 = 4(3), 13 = 4(2)+5(1), 14 = 4(1)+5(2), 15 = 5(3)$. ✓

*Inductive step:* Assume all integers from 12 to $k$ can be expressed. For $k+1 \geq 16$: since $k+1 - 4 \geq 12$, by hypothesis $k-3 = 4a + 5b$. Then $k+1 = 4(a+1) + 5b$. ✓ $\blacksquare$

**DM3.** *Base ($n=1$):* $F_1 = 1 = F_2$. ✓

*Inductive step:* Assume $F_1 + F_3 + \cdots + F_{2k-1} = F_{2k}$.

$F_1 + F_3 + \cdots + F_{2k+1} = F_{2k} + F_{2k+1} = F_{2k+2} = F_{2(k+1)}$. ✓ $\blacksquare$

**DM5.** A tree with 1 node has 0 edges = $1 - 1$. ✓ For a tree with $k+1$ nodes, removing a leaf gives a tree with $k$ nodes and $k-1$ edges (by hypothesis). Adding the leaf back adds exactly 1 edge. Total: $k - 1 + 1 = k = (k+1) - 1$. ✓ $\blacksquare$
