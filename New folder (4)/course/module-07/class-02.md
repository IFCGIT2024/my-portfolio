# Module 7 – Class 2: Binomial Coefficients, Permutations and Combinations

## Learning Objectives

- Compute permutations $P(n,k)$ and combinations $C(n,k)$.
- State and prove Pascal's identity.
- Apply the binomial theorem.
- Implement factorial, $C(n,k)$, and combination generation in Java.
- Connect combinations to power sets (Module 4) and counting (Module 7 Class 1).

---

## Concept Overview

### Permutations

A **permutation** of $k$ elements from a set of $n$ is an ordered arrangement:

$$P(n,k) = \frac{n!}{(n-k)!} = n \cdot (n-1) \cdots (n-k+1)$$

- $P(n,n) = n!$ — arrange all $n$ elements.
- $P(n,1) = n$ — choose one element.

### Combinations (Binomial Coefficients)

A **combination** of $k$ elements from $n$ is an unordered selection:

$$C(n,k) = \binom{n}{k} = \frac{n!}{k!(n-k)!} = \frac{P(n,k)}{k!}$$

- $\binom{n}{0} = \binom{n}{n} = 1$
- $\binom{n}{k} = \binom{n}{n-k}$ (symmetry)

### Pascal's Identity

$$\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}$$

**Combinatorial proof:** Among the $\binom{n}{k}$ subsets of $\{1,\ldots,n\}$ of size $k$, those containing $n$ number $\binom{n-1}{k-1}$ (choose remaining $k-1$ from $\{1,\ldots,n-1\}$), and those not containing $n$ number $\binom{n-1}{k}$.

### The Binomial Theorem

$$(x + y)^n = \sum_{k=0}^{n} \binom{n}{k} x^k y^{n-k}$$

**Special cases:**
- $(1+1)^n = \sum \binom{n}{k} = 2^n$ (total subsets of an $n$-set — Module 4!)
- $(1-1)^n = \sum (-1)^k \binom{n}{k} = 0$ (equal even- and odd-sized subsets)

### Pascal's Triangle

```
        1
       1 1
      1 2 1
     1 3 3 1
    1 4 6 4 1
   1 5 10 10 5 1
```

Row $n$: $\binom{n}{0}, \binom{n}{1}, \ldots, \binom{n}{n}$.

---

## Formal Notation

| Symbol | Meaning |
|--------|---------|
| $n!$ | $n$ factorial: $1 \cdot 2 \cdots n$ |
| $P(n,k)$ | Permutations: $n!/(n-k)!$ |
| $\binom{n}{k}$ or $C(n,k)$ | Combinations: $n!/(k!(n-k)!)$ |

---

## Worked Examples

### Example 1: Committee Selection

How many ways to choose a 3-person committee from 10 people?

$$\binom{10}{3} = \frac{10!}{3! \cdot 7!} = \frac{10 \cdot 9 \cdot 8}{3 \cdot 2 \cdot 1} = 120$$

### Example 2: Arranging Letters

How many arrangements of the letters in "ABCDE"? $5! = 120$.

How many 3-letter arrangements from "ABCDE"? $P(5,3) = 5 \cdot 4 \cdot 3 = 60$.

### Example 3: Pascal's Identity

$\binom{5}{2} = \binom{4}{1} + \binom{4}{2} = 4 + 6 = 10$. ✓

### Example 4: Subsets of Size $k$

List all 2-element subsets of $\{1,2,3,4\}$:
$\{1,2\}, \{1,3\}, \{1,4\}, \{2,3\}, \{2,4\}, \{3,4\}$ — 6 subsets = $\binom{4}{2} = 6$. ✓

### Example 5: Binomial Theorem Application

$(x + 1)^4 = \binom{4}{0}x^4 + \binom{4}{1}x^3 + \binom{4}{2}x^2 + \binom{4}{3}x + \binom{4}{4} = x^4 + 4x^3 + 6x^2 + 4x + 1$

---

## Proof Techniques Spotlight

### Combinatorial Proofs

Instead of algebraic manipulation, argue by counting the same set two ways.

**Example:** Prove $\sum_{k=0}^{n} \binom{n}{k} = 2^n$.

*Combinatorial proof:* The left side counts all subsets of $\{1,...,n\}$ by size. The right side counts all subsets by the product rule ($2^n$ binary choices). Both count $|\mathcal{P}(\{1,...,n\})|$. $\blacksquare$

### Algebraic Proofs of Binomial Identities

Use factorials and simplify. For Pascal's identity:

$$\binom{n-1}{k-1} + \binom{n-1}{k} = \frac{(n-1)!}{(k-1)!(n-k)!} + \frac{(n-1)!}{k!(n-k-1)!}$$

$$= \frac{(n-1)! \cdot k + (n-1)! \cdot (n-k)}{k!(n-k)!} = \frac{(n-1)! \cdot n}{k!(n-k)!} = \binom{n}{k}$$ $\blacksquare$

---

## Java Deep Dive

```java
import java.util.*;
import java.util.stream.*;

public class CombinatoricsLibrary {

    // --- Factorial ---

    public static long factorial(int n) {
        long result = 1;
        for (int i = 2; i <= n; i++) result *= i;
        return result;
    }

    // --- Binomial Coefficient ---

    /**
     * C(n, k) computed without full factorial to avoid overflow.
     * C(n,k) = n*(n-1)*...*(n-k+1) / k!
     */
    public static long binomial(int n, int k) {
        if (k < 0 || k > n) return 0;
        if (k == 0 || k == n) return 1;
        if (k > n - k) k = n - k; // symmetry: C(n,k) = C(n,n-k)
        long result = 1;
        for (int i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }

    /**
     * C(n, k) via Pascal's triangle (dynamic programming).
     */
    public static long binomialDP(int n, int k) {
        long[][] dp = new long[n + 1][k + 1];
        for (int i = 0; i <= n; i++) {
            dp[i][0] = 1;
            for (int j = 1; j <= Math.min(i, k); j++) {
                dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];
            }
        }
        return dp[n][k];
    }

    // --- Permutations ---

    public static long permutations(int n, int k) {
        long result = 1;
        for (int i = 0; i < k; i++) result *= (n - i);
        return result;
    }

    // --- Pascal's Triangle ---

    public static void printPascalsTriangle(int rows) {
        for (int n = 0; n < rows; n++) {
            // Spacing
            for (int s = 0; s < rows - n - 1; s++) System.out.print("   ");
            for (int k = 0; k <= n; k++) {
                System.out.printf("%5d ", binomial(n, k));
            }
            System.out.println();
        }
    }

    // --- Generate All k-Subsets ---

    /**
     * Generate all subsets of {0,...,n-1} of size k.
     * Count should equal C(n, k).
     */
    public static List<List<Integer>> generateCombinations(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();
        generateCombHelper(n, k, 0, new ArrayList<>(), result);
        return result;
    }

    private static void generateCombHelper(int n, int k, int start,
                                            List<Integer> current,
                                            List<List<Integer>> result) {
        if (current.size() == k) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i < n; i++) {
            current.add(i);
            generateCombHelper(n, k, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    // --- Generate All Permutations ---

    public static List<List<Integer>> generatePermutations(int n) {
        List<List<Integer>> result = new ArrayList<>();
        List<Integer> items = IntStream.range(0, n).boxed()
                .collect(Collectors.toList());
        permuteHelper(items, 0, result);
        return result;
    }

    private static void permuteHelper(List<Integer> items, int idx,
                                       List<List<Integer>> result) {
        if (idx == items.size()) {
            result.add(new ArrayList<>(items));
            return;
        }
        for (int i = idx; i < items.size(); i++) {
            Collections.swap(items, idx, i);
            permuteHelper(items, idx + 1, result);
            Collections.swap(items, idx, i);
        }
    }

    // --- Verify Identities ---

    public static void verifyIdentities(int maxN) {
        for (int n = 0; n <= maxN; n++) {
            // Sum of row = 2^n
            long rowSum = 0;
            for (int k = 0; k <= n; k++) rowSum += binomial(n, k);
            assert rowSum == (1L << n) : "Row sum failed for n=" + n;

            // Pascal's identity
            for (int k = 1; k < n; k++) {
                assert binomial(n, k) == binomial(n - 1, k - 1) + binomial(n - 1, k)
                        : "Pascal failed for n=" + n + ", k=" + k;
            }

            // Symmetry
            for (int k = 0; k <= n; k++) {
                assert binomial(n, k) == binomial(n, n - k);
            }
        }
    }

    // --- Demo ---

    public static void main(String[] args) {
        System.out.println("=== Combinatorics Library ===\n");

        // Binomial coefficients
        System.out.println("C(10,3) = " + binomial(10, 3));       // 120
        System.out.println("C(10,3) DP = " + binomialDP(10, 3));  // 120
        System.out.println("P(5,3) = " + permutations(5, 3));     // 60
        System.out.println("5! = " + factorial(5));                // 120

        // Pascal's triangle
        System.out.println("\nPascal's Triangle (8 rows):");
        printPascalsTriangle(8);

        // Generate combinations
        List<List<Integer>> combs = generateCombinations(5, 2);
        System.out.println("\nAll 2-subsets of {0..4}: " + combs);
        System.out.println("Count: " + combs.size() + " (expected " + binomial(5, 2) + ")");

        // Generate permutations
        List<List<Integer>> perms = generatePermutations(4);
        System.out.println("\nPermutations of {0..3}: " + perms.size()
                + " (expected " + factorial(4) + ")");

        // Verify identities
        verifyIdentities(20);
        System.out.println("\nAll identities verified for n = 0..20!");
    }
}
```

---

## Historical Context

**Blaise Pascal** (1654) published the *Traité du triangle arithmétique*, establishing fundamental properties of binomial coefficients. However, the triangle was known centuries earlier: **Pingala** (India, ~200 BC), **Al-Karaji** (Persia, ~1000 AD), and **Yang Hui** (China, 1261) all studied it.

The **binomial theorem** for positive integers was known to **Isaac Newton** (1665), who extended it to non-integer exponents, creating the generalized binomial series.

**Combinatorial proofs** — proving identities by counting — are preferred by many mathematicians because they provide understanding, not just verification. This philosophy aligns with the course's emphasis on proofs as explanations.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** What is the difference between $P(n,k)$ and $C(n,k)$?

**A2.** How does $\binom{n}{k}$ relate to the number of subsets of size $k$ of an $n$-element set?

**A3.** Explain why $\binom{n}{k} = \binom{n}{n-k}$ without algebra (combinatorial argument).

**A4.** How many rows of Pascal's triangle do you need to compute $\binom{10}{3}$ using only Pascal's identity?

### Slide Set B: Proof Problems

**B1.** Prove Pascal's identity combinatorially and algebraically.

**B2.** Prove: $\sum_{k=0}^n \binom{n}{k} = 2^n$.

**B3.** Prove: $\sum_{k=0}^n (-1)^k \binom{n}{k} = 0$ for $n \geq 1$.

**B4.** Prove by induction: $\binom{n}{k} \leq 2^n / 2$ for $1 \leq k \leq n-1$ and $n \geq 2$.

### Slide Set C: Java Coding Problems

**C1.** Implement `binomial(n, k)` without computing full factorials. Verify against `binomialDP(n, k)`.

**C2.** Generate all 3-element subsets of $\{1,...,7\}$. Verify count = $\binom{7}{3} = 35$.

**C3.** Build Pascal's triangle up to row 15 using dynamic programming.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Compute: (a) $\binom{8}{3}$, (b) $P(8,3)$, (c) $\binom{12}{4}$, (d) $P(6,6)$.

**DM2.** How many 5-card poker hands can be dealt from a 52-card deck?

**DM3.** Prove: $\binom{n}{k} \cdot \binom{k}{j} = \binom{n}{j} \cdot \binom{n-j}{k-j}$ (Vandermonde-like identity).

**DM4.** Prove by induction on $n$: $\sum_{k=0}^{n} \binom{n}{k}^2 = \binom{2n}{n}$.

**DM5.** A committee of 4 is chosen from 6 men and 5 women. How many committees have at least 2 women?

### Java Programming Problems

**JP1.** Implement `factorial`, `permutations`, `binomial`. Test with known values.

**JP2.** Using DP, build Pascal's triangle as a 2D array. Print rows 0–15.

**JP3.** Generate all $k$-element subsets of $\{0,...,n-1\}$ using backtracking. Verify count = $\binom{n}{k}$.

**JP4.** Generate all permutations of a string. For "ABCD", verify count = 24.

**JP5.** Implement the binomial theorem: given $n$, expand $(x+y)^n$ as a list of terms $\binom{n}{k} x^k y^{n-k}$. Evaluate at $x = 1, y = 1$ and verify = $2^n$.

### Bridge Problems

**BR1.** From Module 4: $|\mathcal{P}(A)| = 2^n$. From this class: $\sum_{k=0}^n \binom{n}{k} = 2^n$. These are the same fact from two perspectives. Explain the connection and implement both computations.

**BR2.** From Module 5: the number of injective functions $f: \{1,...,k\} \to \{1,...,n\}$ is $P(n,k)$. The number of $k$-element subsets of $\{1,...,n\}$ is $C(n,k) = P(n,k)/k!$ (quotient by the symmetry group). Verify in Java for small $n, k$.

---

## Solutions

### Discrete Math Solutions

**DM1.** (a) $\binom{8}{3} = 56$. (b) $P(8,3) = 336$. (c) $\binom{12}{4} = 495$. (d) $P(6,6) = 720$.

**DM2.** $\binom{52}{5} = 2{,}598{,}960$.

**DM5.** Exactly 2 women: $\binom{5}{2}\binom{6}{2} = 10 \cdot 15 = 150$. Exactly 3 women: $\binom{5}{3}\binom{6}{1} = 10 \cdot 6 = 60$. Exactly 4 women: $\binom{5}{4}\binom{6}{0} = 5$. Total: $150 + 60 + 5 = 215$.
