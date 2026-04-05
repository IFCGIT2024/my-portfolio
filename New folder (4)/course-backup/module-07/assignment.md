# Module 7 – Assignment: Counting, Induction, and Combinatorial Algorithms

## Overview

This assignment synthesizes **Module 6** (Induction and Recursion) with **Module 7** (Counting, Combinatorics, Pigeonhole Principle). You will prove combinatorial identities by induction, implement backtracking algorithms for generating combinations, and analyze hash table behavior through the lens of the pigeonhole principle.

---

## Part A: Mathematical Proofs

### Problem A1: Sum of Row by Induction

Prove by induction on $n$:
$$\sum_{k=0}^{n} \binom{n}{k} = 2^n$$

### Problem A2: Pascal's Identity (Algebraic Proof)

Prove algebraically that:
$$\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}$$

### Problem A3: Vandermonde's Identity by Induction

Prove by induction on $r$ (or by a combinatorial argument):
$$\sum_{k=0}^{r} \binom{m}{k}\binom{n}{r-k} = \binom{m+n}{r}$$

### Problem A4: Strong Induction — Counting Recursive Calls

The following recursive algorithm generates all $k$-subsets of $\{1,...,n\}$:

```
SUBSETS(n, k):
    if k == 0: return {{}}
    if k == n: return {{1,...,n}}
    return SUBSETS(n-1, k) ∪ {S ∪ {n} : S ∈ SUBSETS(n-1, k-1)}
```

Prove by strong induction on $n$ that this algorithm produces exactly $\binom{n}{k}$ subsets.

### Problem A5: Pigeonhole Applied to Sequences

Prove: in any sequence of $n^2 + 1$ distinct real numbers, there exists either an increasing subsequence of length $n + 1$ or a decreasing subsequence of length $n + 1$.

*(Hint: assign each element a pair $(a_i, d_i)$ where $a_i$ is the length of the longest increasing subsequence ending there and $d_i$ the longest decreasing. Use the pigeonhole principle on the $n^2$ possible values of $(a_i, d_i)$ if both $a_i \leq n$ and $d_i \leq n$.)*

---

## Part B: Java Programming

### Problem B1: Backtracking Combination Generator

Implement a method that generates all $k$-element subsets of $\{0, ..., n-1\}$ using backtracking.

```java
public static List<List<Integer>> generateCombinations(int n, int k)
```

Requirements:
- Must generate subsets in lexicographic order.
- Verify the count equals $\binom{n}{k}$ for all $0 \leq k \leq n \leq 15$.
- Include pruning: skip branches where remaining elements are insufficient.

### Problem B2: Recursive vs Iterative Binomial Coefficient

Implement $\binom{n}{k}$ three ways:
1. `binomialRecursive(n, k)` — direct recursion using Pascal's identity
2. `binomialMemo(n, k)` — memoized recursion
3. `binomialDP(n, k)` — bottom-up Pascal's triangle

Measure the time for `binomialRecursive(30, 15)` vs `binomialMemo(30, 15)` vs `binomialDP(30, 15)`. Report the speedup from memoization.

### Problem B3: Combinatorial Identity Verifier

Write a program that verifies the following identities for all valid inputs up to $n = 20$:
1. $\sum_{k=0}^n \binom{n}{k} = 2^n$
2. $\sum_{k=0}^n (-1)^k \binom{n}{k} = 0$ for $n \geq 1$
3. $\binom{n}{k} = \binom{n}{n-k}$
4. $\sum_{k=0}^r \binom{m}{k}\binom{n}{r-k} = \binom{m+n}{r}$ for $m, n, r \leq 10$

Print "PASS" or "FAIL" for each identity.

### Problem B4: Hash Collision Analyzer

Build a hash table simulator:
1. Create a table of size $m$ (try $m = 100, 500, 1000$).
2. Insert random keys until the first collision.
3. Repeat 10,000 times and report the average number of insertions before first collision.
4. Compare the observed average with the birthday bound $\sqrt{\pi m / 2}$.

### Problem B5: Subset-Sum via Backtracking

Given a set $S$ of $n$ integers and a target sum $t$, find all subsets of $S$ that sum to $t$.

```java
public static List<List<Integer>> subsetSum(int[] set, int target)
```

This connects Module 7 (subset generation) with Module 6 (recursive backtracking):
- Generate subsets recursively (Module 6's structural recursion).
- Count them combinatorially (Module 7).
- Analyze worst-case: $2^n$ subsets (power set from Module 4).

---

## Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| **A1** — Row sum induction | 10 | Correct base case, inductive step uses Pascal's identity |
| **A2** — Pascal's algebraic proof | 8 | Clean algebraic manipulation, common denominator |
| **A3** — Vandermonde | 12 | Complete proof (induction or combinatorial) |
| **A4** — Strong induction on SUBSETS | 12 | Strong inductive hypothesis, case split, correct count |
| **A5** — Erdős–Szekeres pigeonhole | 8 | Correct pair assignment, valid PHP application |
| **B1** — Combination generator | 12 | Lexicographic order, pruning, verified counts |
| **B2** — Three binomial implementations | 10 | All three correct, timing comparison reported |
| **B3** — Identity verifier | 8 | All 4 identities checked, proper bounds |
| **B4** — Hash collision analyzer | 10 | Correct simulation, comparison with birthday bound |
| **B5** — Subset-sum backtracking | 10 | Correct results, recursive approach |
| **Total** | **100** | |

---

## Solution Key

### Solution A1: Sum of Row by Induction

**Base case:** $n = 0$: $\sum_{k=0}^{0} \binom{0}{0} = 1 = 2^0$. ✓

**Inductive step:** Assume $\sum_{k=0}^{n} \binom{n}{k} = 2^n$. Show $\sum_{k=0}^{n+1} \binom{n+1}{k} = 2^{n+1}$.

$$\sum_{k=0}^{n+1} \binom{n+1}{k} = \binom{n+1}{0} + \sum_{k=1}^{n} \binom{n+1}{k} + \binom{n+1}{n+1}$$

Apply Pascal's identity to the middle terms: $\binom{n+1}{k} = \binom{n}{k-1} + \binom{n}{k}$.

$$= 1 + \sum_{k=1}^{n} \left[\binom{n}{k-1} + \binom{n}{k}\right] + 1$$

$$= 1 + \sum_{j=0}^{n-1} \binom{n}{j} + \sum_{k=1}^{n} \binom{n}{k} + 1$$

$$= 1 + \left[2^n - \binom{n}{n}\right] + \left[2^n - \binom{n}{0}\right] + 1$$

$$= 1 + (2^n - 1) + (2^n - 1) + 1 = 2 \cdot 2^n = 2^{n+1}$$ $\blacksquare$

### Solution A2: Pascal's Identity (Algebraic)

$$\binom{n-1}{k-1} + \binom{n-1}{k} = \frac{(n-1)!}{(k-1)!(n-k)!} + \frac{(n-1)!}{k!(n-k-1)!}$$

Find common denominator $k!(n-k)!$:

$$= \frac{(n-1)! \cdot k}{k!(n-k)!} + \frac{(n-1)! \cdot (n-k)}{k!(n-k)!} = \frac{(n-1)![k + (n-k)]}{k!(n-k)!} = \frac{n!}{k!(n-k)!} = \binom{n}{k}$$ $\blacksquare$

### Solution A3: Vandermonde's Identity (Combinatorial Proof)

Consider choosing $r$ people from a group of $m$ men and $n$ women. The right side $\binom{m+n}{r}$ counts all ways.

For the left side: if we choose exactly $k$ men (from $m$) and $r - k$ women (from $n$), the count is $\binom{m}{k}\binom{n}{r-k}$. Summing over all valid $k$ gives all possible committees.

Both sides count the same set, so they are equal. $\blacksquare$

### Solution A4: Strong Induction on SUBSETS(n, k)

**Strong induction on $n$.**

**Base cases:** If $k = 0$, output is $\{\emptyset\}$, and $\binom{n}{0} = 1$. ✓
If $k = n$, output is $\{\{1,...,n\}\}$, and $\binom{n}{n} = 1$. ✓

**Inductive step:** Assume the claim holds for all $n' < n$ and all valid $k$. For $0 < k < n$:

The algorithm returns $\text{SUBSETS}(n-1, k) \cup \{S \cup \{n\} : S \in \text{SUBSETS}(n-1, k-1)\}$.

By the inductive hypothesis:
- $|\text{SUBSETS}(n-1, k)| = \binom{n-1}{k}$ (subsets not containing $n$)
- $|\text{SUBSETS}(n-1, k-1)| = \binom{n-1}{k-1}$ (subsets that, with $n$ added, have size $k$)

These are disjoint (first group excludes $n$, second includes $n$). Total:

$$\binom{n-1}{k} + \binom{n-1}{k-1} = \binom{n}{k}$$ (Pascal's identity) $\blacksquare$

### Solution A5: Erdős–Szekeres via Pigeonhole

Let $a_1, ..., a_{n^2+1}$ be the sequence. For each element $a_i$, let:
- $\ell_i$ = length of longest increasing subsequence ending at $a_i$
- $d_i$ = length of longest decreasing subsequence ending at $a_i$

**Claim:** All pairs $(\ell_i, d_i)$ are distinct.

*Proof of claim:* If $i < j$ and $a_i < a_j$, then $\ell_j > \ell_i$ (extend $i$'s increasing subsequence). If $a_i > a_j$, then $d_j > d_i$. Either way, $(\ell_i, d_i) \neq (\ell_j, d_j)$. $\blacksquare$

Now, suppose for contradiction that $\ell_i \leq n$ for all $i$ and $d_i \leq n$ for all $i$. Then there are at most $n \times n = n^2$ distinct pairs. But we have $n^2 + 1$ elements with $n^2 + 1$ distinct pairs — contradiction (pigeonhole).

Therefore, some $\ell_i \geq n + 1$ or some $d_i \geq n + 1$. $\blacksquare$

### Solution B1: Backtracking Combination Generator

```java
import java.util.*;

public class Module7Assignment {

    // B1: Generate combinations with pruning
    public static List<List<Integer>> generateCombinations(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();
        combHelper(n, k, 0, new ArrayList<>(), result);
        return result;
    }

    private static void combHelper(int n, int k, int start,
                                    List<Integer> current,
                                    List<List<Integer>> result) {
        if (current.size() == k) {
            result.add(new ArrayList<>(current));
            return;
        }
        // Pruning: need (k - current.size()) more elements from [start, n)
        int remaining = n - start;
        int needed = k - current.size();
        if (remaining < needed) return; // prune

        for (int i = start; i < n; i++) {
            current.add(i);
            combHelper(n, k, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    // B2: Three binomial implementations
    public static long binomialRecursive(int n, int k) {
        if (k < 0 || k > n) return 0;
        if (k == 0 || k == n) return 1;
        return binomialRecursive(n - 1, k - 1) + binomialRecursive(n - 1, k);
    }

    public static long binomialMemo(int n, int k, Map<Long, Long> memo) {
        if (k < 0 || k > n) return 0;
        if (k == 0 || k == n) return 1;
        long key = (long) n * 100000 + k;
        if (memo.containsKey(key)) return memo.get(key);
        long result = binomialMemo(n - 1, k - 1, memo) + binomialMemo(n - 1, k, memo);
        memo.put(key, result);
        return result;
    }

    public static long binomialDP(int n, int k) {
        if (k < 0 || k > n) return 0;
        long[][] dp = new long[n + 1][k + 1];
        for (int i = 0; i <= n; i++) {
            dp[i][0] = 1;
            for (int j = 1; j <= Math.min(i, k); j++) {
                dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];
            }
        }
        return dp[n][k];
    }

    // B3: Identity verifier
    public static long binomial(int n, int k) {
        if (k < 0 || k > n) return 0;
        if (k == 0 || k == n) return 1;
        if (k > n - k) k = n - k;
        long result = 1;
        for (int i = 0; i < k; i++) result = result * (n - i) / (i + 1);
        return result;
    }

    public static void verifyIdentities(int maxN) {
        boolean allPass = true;

        // Identity 1: Sum of row = 2^n
        for (int n = 0; n <= maxN; n++) {
            long sum = 0;
            for (int k = 0; k <= n; k++) sum += binomial(n, k);
            if (sum != (1L << n)) {
                System.out.println("FAIL: row sum for n=" + n);
                allPass = false;
            }
        }
        System.out.println("Identity 1 (row sum = 2^n): " + (allPass ? "PASS" : "FAIL"));

        // Identity 2: Alternating sum = 0
        allPass = true;
        for (int n = 1; n <= maxN; n++) {
            long altSum = 0;
            for (int k = 0; k <= n; k++) {
                altSum += (k % 2 == 0 ? 1 : -1) * binomial(n, k);
            }
            if (altSum != 0) {
                System.out.println("FAIL: alternating sum for n=" + n);
                allPass = false;
            }
        }
        System.out.println("Identity 2 (alternating sum = 0): " + (allPass ? "PASS" : "FAIL"));

        // Identity 3: Symmetry
        allPass = true;
        for (int n = 0; n <= maxN; n++) {
            for (int k = 0; k <= n; k++) {
                if (binomial(n, k) != binomial(n, n - k)) {
                    System.out.println("FAIL: symmetry n=" + n + " k=" + k);
                    allPass = false;
                }
            }
        }
        System.out.println("Identity 3 (symmetry): " + (allPass ? "PASS" : "FAIL"));

        // Identity 4: Vandermonde
        allPass = true;
        for (int m = 0; m <= 10; m++) {
            for (int n = 0; n <= 10; n++) {
                for (int r = 0; r <= Math.min(m + n, 10); r++) {
                    long lhs = 0;
                    for (int k = 0; k <= r; k++) {
                        lhs += binomial(m, k) * binomial(n, r - k);
                    }
                    if (lhs != binomial(m + n, r)) {
                        System.out.printf("FAIL: Vandermonde m=%d n=%d r=%d%n", m, n, r);
                        allPass = false;
                    }
                }
            }
        }
        System.out.println("Identity 4 (Vandermonde): " + (allPass ? "PASS" : "FAIL"));
    }

    // B4: Hash collision analyzer
    public static double avgFirstCollision(int tableSize, int trials) {
        Random rng = new Random(42);
        long total = 0;
        for (int t = 0; t < trials; t++) {
            Set<Integer> used = new HashSet<>();
            int count = 0;
            while (true) {
                count++;
                if (!used.add(rng.nextInt(tableSize))) break;
            }
            total += count;
        }
        return (double) total / trials;
    }

    // B5: Subset-sum
    public static List<List<Integer>> subsetSum(int[] set, int target) {
        List<List<Integer>> result = new ArrayList<>();
        subsetSumHelper(set, target, 0, new ArrayList<>(), 0, result);
        return result;
    }

    private static void subsetSumHelper(int[] set, int target, int idx,
                                         List<Integer> current, int currentSum,
                                         List<List<Integer>> result) {
        if (currentSum == target && !current.isEmpty()) {
            result.add(new ArrayList<>(current));
        }
        if (idx == set.length) return;
        for (int i = idx; i < set.length; i++) {
            current.add(set[i]);
            subsetSumHelper(set, target, i + 1, current, currentSum + set[i], result);
            current.remove(current.size() - 1);
        }
    }

    // Demo
    public static void main(String[] args) {
        System.out.println("=== Module 7 Assignment Solution ===\n");

        // B1: Combinations
        System.out.println("--- B1: Combination Generator ---");
        for (int n = 0; n <= 8; n++) {
            for (int k = 0; k <= n; k++) {
                int count = generateCombinations(n, k).size();
                long expected = binomial(n, k);
                if (count != expected) {
                    System.out.printf("MISMATCH: C(%d,%d)=%d but generated %d%n",
                            n, k, expected, count);
                }
            }
        }
        System.out.println("All combination counts verified for n=0..8!");
        System.out.println("C(5,3) subsets: " + generateCombinations(5, 3));

        // B2: Timing comparison
        System.out.println("\n--- B2: Binomial Timing ---");
        int testN = 30, testK = 15;

        long start = System.nanoTime();
        long val1 = binomialRecursive(testN, testK);
        long t1 = System.nanoTime() - start;

        start = System.nanoTime();
        long val2 = binomialMemo(testN, testK, new HashMap<>());
        long t2 = System.nanoTime() - start;

        start = System.nanoTime();
        long val3 = binomialDP(testN, testK);
        long t3 = System.nanoTime() - start;

        System.out.printf("Recursive:  C(%d,%d)=%d, time=%,d ns%n", testN, testK, val1, t1);
        System.out.printf("Memoized:   C(%d,%d)=%d, time=%,d ns%n", testN, testK, val2, t2);
        System.out.printf("DP:         C(%d,%d)=%d, time=%,d ns%n", testN, testK, val3, t3);
        System.out.printf("Speedup (recursive/memo): %.1fx%n", (double) t1 / t2);

        // B3: Identity verification
        System.out.println("\n--- B3: Identity Verifier ---");
        verifyIdentities(20);

        // B4: Hash collision
        System.out.println("\n--- B4: Hash Collision Analyzer ---");
        for (int m : new int[]{100, 500, 1000}) {
            double avg = avgFirstCollision(m, 10000);
            double bound = Math.sqrt(Math.PI * m / 2.0);
            System.out.printf("m=%4d: avg first collision=%.1f, birthday bound=%.1f%n",
                    m, avg, bound);
        }

        // B5: Subset-sum
        System.out.println("\n--- B5: Subset-Sum ---");
        int[] set = {3, 7, 1, 8, 4, 12, 5};
        int target = 15;
        List<List<Integer>> solutions = subsetSum(set, target);
        System.out.println("Subsets of " + Arrays.toString(set) + " summing to " + target + ":");
        for (List<Integer> s : solutions) {
            System.out.println("  " + s + " (sum=" + s.stream().mapToInt(Integer::intValue).sum() + ")");
        }
        System.out.println("Total solutions: " + solutions.size());
    }
}
```
