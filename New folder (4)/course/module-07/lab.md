# Module 7 – Lab: Counting, Combinatorics, and the Pigeonhole Principle

## Overview

In this lab you will implement combinatorial functions, generate permutations and combinations, build a combinatorics toolkit, and empirically demonstrate the pigeonhole principle through hash table collision experiments.

**Prerequisites:** Module 7 Classes 1–3 (Sum/Product Principles, Binomial Coefficients, Pigeonhole Principle)

---

## Part 1: Counting Principles (Sum and Product Rules)

### Exercise 1.1: Password Space Calculator

Write a method that computes the number of passwords of length $\ell$ from an alphabet of size $a$ using the product rule ($a^\ell$). Then compute using the sum rule how many passwords of length 1 through $\ell$ exist total.

```java
public static long passwordCount(int alphabetSize, int length)
public static long totalPasswordsUpTo(int alphabetSize, int maxLength)
```

### Exercise 1.2: Inclusion-Exclusion Counter

Given a universal set of integers $\{1,...,n\}$, count how many are divisible by $a$ **or** $b$:

$$|A \cup B| = |A| + |B| - |A \cap B|$$

where $A$ = multiples of $a$, $B$ = multiples of $b$, $A \cap B$ = multiples of $\text{lcm}(a,b)$.

```java
public static int countDivisibleByEither(int n, int a, int b)
```

Test: among $\{1,...,100\}$, how many are divisible by 3 or 5?

### Exercise 1.3: Nested Loop Counter

Implement a method that counts the total iterations of nested loops with given bounds. Connect to the product rule.

```java
// Count iterations: for i in [0,a) for j in [0,b) for k in [0,c)
public static long nestedLoopCount(int a, int b, int c)
```

---

## Part 2: Combinations and Permutations

### Exercise 2.1: Binomial Coefficient Three Ways

Implement $\binom{n}{k}$ using:
1. Direct formula (loop, no full factorial)
2. Pascal's triangle (DP)
3. Recursive with memoization

Verify all three agree for $0 \leq k \leq n \leq 20$.

### Exercise 2.2: Generate All k-Subsets

Write a backtracking method to generate all $k$-element subsets of $\{0, ..., n-1\}$. Verify the count equals $\binom{n}{k}$.

### Exercise 2.3: Generate Permutations

Write a method to generate all permutations of $\{0, ..., n-1\}$. Verify the count equals $n!$.

### Exercise 2.4: Verify Identities

Write a verification method that checks:
- $\sum_{k=0}^n \binom{n}{k} = 2^n$ (for $n = 0, ..., 20$)
- Pascal's identity: $\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}$
- Symmetry: $\binom{n}{k} = \binom{n}{n-k}$
- Vandermonde: $\sum_{k=0}^r \binom{m}{k}\binom{n}{r-k} = \binom{m+n}{r}$

---

## Part 3: Pigeonhole Principle Experiments

### Exercise 3.1: Hash Table Collision Detector

Implement a hash table (array of booleans) of size $m$. Insert random keys and track:
- The key index at which the first collision occurs
- The total number of collisions after inserting all keys

```java
public static int firstCollisionIndex(int[] keys, int tableSize)
public static int totalCollisions(int[] keys, int tableSize)
```

### Exercise 3.2: Birthday Paradox Simulator

Simulate the birthday problem:
1. For $k = 1, ..., 60$, estimate $P(\text{collision})$ over 100,000 trials.
2. Compare with the exact formula.
3. Find the smallest $k$ where $P > 0.5$ both exactly and empirically.

### Exercise 3.3: Generalized PHP Load Balancing

Distribute $n$ balls into $m$ bins randomly. Repeat 10,000 times. Report:
- Average max-load
- Observed max-load across all trials
- PHP lower bound: $\lceil n/m \rceil$

Test with $(n,m) \in \{(10,3), (100,10), (1000,100)\}$.

---

## Part 4: Combinatorics Toolkit (Integration)

### Exercise 4.1: Unified Toolkit

Combine all functions into a single `CombinatoricsToolkit` class:
- `factorial(n)`
- `binomial(n, k)`
- `permutations(n, k)`
- `inclusionExclusion(a, b, both)`
- `birthdayProbability(k, days)`
- `birthdayBound(m)`
- `generateCombinations(n, k)`
- `generatePermutations(n)`

### Exercise 4.2: Application — Lottery Odds

Use your toolkit to compute:
- Probability of matching all 6 numbers from 49 ($1/\binom{49}{6}$)
- Probability of matching exactly 3 of 6 from 49
- Expected trials to first repeat in a sequence of random values from $\{1,...,m\}$

---

## Extension Challenges

**E1.** Implement the inclusion-exclusion formula for 3 sets. Count integers in $\{1,...,1000\}$ divisible by 2, 3, or 5.

**E2.** Generate all permutations of a string with repeated characters (e.g., "AABB" has $4!/(2!2!) = 6$ distinct permutations). Handle duplicates.

**E3.** Implement a combinations iterator that generates the *next* combination lexicographically without storing all combinations in memory.

---

## Starter Code

```java
import java.util.*;
import java.util.stream.*;

public class Module7Lab {

    // ==================== Part 1: Counting ====================

    public static long passwordCount(int alphabetSize, int length) {
        // TODO: product rule: alphabetSize^length
        return -1;
    }

    public static long totalPasswordsUpTo(int alphabetSize, int maxLength) {
        // TODO: sum of passwordCount for lengths 1..maxLength
        return -1;
    }

    public static int countDivisibleByEither(int n, int a, int b) {
        // TODO: inclusion-exclusion: |A| + |B| - |A ∩ B|
        // |A| = n/a, |B| = n/b, |A ∩ B| = n/lcm(a,b)
        return -1;
    }

    public static int gcd(int a, int b) {
        // TODO: Euclidean algorithm (from Module 1!)
        return -1;
    }

    public static long nestedLoopCount(int a, int b, int c) {
        // TODO: product rule
        return -1;
    }

    // ==================== Part 2: Combinations & Permutations ====================

    public static long factorial(int n) {
        // TODO
        return -1;
    }

    public static long binomialDirect(int n, int k) {
        // TODO: loop-based, no full factorial
        return -1;
    }

    public static long binomialDP(int n, int k) {
        // TODO: Pascal's triangle DP
        return -1;
    }

    public static long binomialMemo(int n, int k, Map<Long, Long> memo) {
        // TODO: recursive with memoization
        // Key: encode (n,k) as n * 100000L + k or similar
        return -1;
    }

    public static long permutations(int n, int k) {
        // TODO
        return -1;
    }

    public static List<List<Integer>> generateCombinations(int n, int k) {
        // TODO: backtracking
        List<List<Integer>> result = new ArrayList<>();
        return result;
    }

    public static List<List<Integer>> generatePermutations(int n) {
        // TODO: swap-based
        List<List<Integer>> result = new ArrayList<>();
        return result;
    }

    public static void verifyIdentities(int maxN) {
        // TODO: check row sum, Pascal's identity, symmetry, Vandermonde
    }

    // ==================== Part 3: Pigeonhole ====================

    public static int firstCollisionIndex(int[] keys, int tableSize) {
        // TODO: return 1-based index of key causing first collision, or -1
        return -1;
    }

    public static int totalCollisions(int[] keys, int tableSize) {
        // TODO: count how many keys collide with an already-occupied slot
        return -1;
    }

    public static double birthdayProbExact(int k, int days) {
        // TODO: exact formula
        return -1;
    }

    public static double birthdayProbMonteCarlo(int k, int days, int trials) {
        // TODO: Monte Carlo simulation
        return -1;
    }

    public static int[] simulateLoadBalancing(int n, int m, Random rng) {
        // TODO: return array of bin counts
        return new int[m];
    }

    // ==================== Part 4: Toolkit ====================

    public static double birthdayBound(int m) {
        // TODO: sqrt(pi * m / 2)
        return -1;
    }

    // ==================== Main ====================

    public static void main(String[] args) {
        System.out.println("=== Module 7 Lab ===\n");

        // Part 1
        System.out.println("--- Part 1: Counting ---");
        System.out.println("Passwords (26 letters, length 4): " + passwordCount(26, 4));
        System.out.println("Total passwords length 1-4: " + totalPasswordsUpTo(26, 4));
        System.out.println("Divisible by 3 or 5 in {1..100}: " + countDivisibleByEither(100, 3, 5));
        System.out.println("Nested loops (5,4,3): " + nestedLoopCount(5, 4, 3));

        // Part 2
        System.out.println("\n--- Part 2: Combinations ---");
        System.out.println("C(10,3) direct: " + binomialDirect(10, 3));
        System.out.println("C(10,3) DP: " + binomialDP(10, 3));
        System.out.println("C(10,3) memo: " + binomialMemo(10, 3, new HashMap<>()));
        System.out.println("P(5,3): " + permutations(5, 3));

        List<List<Integer>> combs = generateCombinations(5, 3);
        System.out.println("3-subsets of {0..4}: count=" + combs.size()
                + " (expected " + binomialDirect(5, 3) + ")");

        List<List<Integer>> perms = generatePermutations(4);
        System.out.println("Permutations of {0..3}: count=" + perms.size()
                + " (expected " + factorial(4) + ")");

        verifyIdentities(20);
        System.out.println("All identities verified!");

        // Part 3
        System.out.println("\n--- Part 3: Pigeonhole ---");
        int m = 1000;
        int[] randomKeys = new Random(42).ints(2000, 0, 1_000_000).toArray();
        System.out.println("First collision at key #" + firstCollisionIndex(randomKeys, m));
        System.out.println("Total collisions (2000 keys, 1000 slots): " + totalCollisions(randomKeys, m));

        System.out.println("\nBirthday problem (365 days):");
        for (int k : new int[]{10, 20, 23, 30, 50}) {
            System.out.printf("k=%2d: exact=%.4f, MC=%.4f%n",
                    k, birthdayProbExact(k, 365),
                    birthdayProbMonteCarlo(k, 365, 100_000));
        }

        System.out.println("\nLoad balancing (100 tasks, 10 bins):");
        Random rng = new Random(42);
        int[] bins = simulateLoadBalancing(100, 10, rng);
        System.out.println("Bin loads: " + Arrays.toString(bins));
        System.out.println("Max load: " + Arrays.stream(bins).max().orElse(0)
                + " (PHP bound: " + ((100 + 9) / 10) + ")");

        // Part 4
        System.out.println("\n--- Part 4: Toolkit ---");
        System.out.printf("Birthday bound (m=1000): %.1f%n", birthdayBound(1000));
        System.out.printf("Lottery 6/49: 1 in %,d%n", binomialDirect(49, 6));
    }
}
```

---

## Solution Key

```java
import java.util.*;
import java.util.stream.*;

public class Module7LabSolution {

    // ==================== Part 1: Counting ====================

    public static long passwordCount(int alphabetSize, int length) {
        long result = 1;
        for (int i = 0; i < length; i++) result *= alphabetSize;
        return result;
    }

    public static long totalPasswordsUpTo(int alphabetSize, int maxLength) {
        long total = 0;
        for (int len = 1; len <= maxLength; len++) {
            total += passwordCount(alphabetSize, len);
        }
        return total;
    }

    public static int gcd(int a, int b) {
        while (b != 0) { int t = b; b = a % b; a = t; }
        return a;
    }

    public static int countDivisibleByEither(int n, int a, int b) {
        int lcm = a / gcd(a, b) * b;
        return n / a + n / b - n / lcm;
    }

    public static long nestedLoopCount(int a, int b, int c) {
        return (long) a * b * c;
    }

    // ==================== Part 2: Combinations & Permutations ====================

    public static long factorial(int n) {
        long result = 1;
        for (int i = 2; i <= n; i++) result *= i;
        return result;
    }

    public static long binomialDirect(int n, int k) {
        if (k < 0 || k > n) return 0;
        if (k == 0 || k == n) return 1;
        if (k > n - k) k = n - k;
        long result = 1;
        for (int i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
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

    public static long binomialMemo(int n, int k, Map<Long, Long> memo) {
        if (k < 0 || k > n) return 0;
        if (k == 0 || k == n) return 1;
        long key = (long) n * 100000 + k;
        if (memo.containsKey(key)) return memo.get(key);
        long result = binomialMemo(n - 1, k - 1, memo) + binomialMemo(n - 1, k, memo);
        memo.put(key, result);
        return result;
    }

    public static long permutations(int n, int k) {
        long result = 1;
        for (int i = 0; i < k; i++) result *= (n - i);
        return result;
    }

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
        for (int i = start; i < n; i++) {
            current.add(i);
            combHelper(n, k, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    public static List<List<Integer>> generatePermutations(int n) {
        List<List<Integer>> result = new ArrayList<>();
        List<Integer> items = IntStream.range(0, n).boxed().collect(Collectors.toList());
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

    public static void verifyIdentities(int maxN) {
        for (int n = 0; n <= maxN; n++) {
            // Row sum = 2^n
            long rowSum = 0;
            for (int k = 0; k <= n; k++) rowSum += binomialDirect(n, k);
            assert rowSum == (1L << n) : "Row sum failed for n=" + n;

            // Pascal's identity
            for (int k = 1; k < n; k++) {
                assert binomialDirect(n, k) ==
                        binomialDirect(n - 1, k - 1) + binomialDirect(n - 1, k);
            }

            // Symmetry
            for (int k = 0; k <= n; k++) {
                assert binomialDirect(n, k) == binomialDirect(n, n - k);
            }
        }

        // Vandermonde: sum_{k=0}^{r} C(m,k)*C(n,r-k) = C(m+n,r)
        for (int m = 0; m <= 10; m++) {
            for (int nn = 0; nn <= 10; nn++) {
                for (int r = 0; r <= m + nn && r <= 10; r++) {
                    long lhs = 0;
                    for (int k = 0; k <= r; k++) {
                        lhs += binomialDirect(m, k) * binomialDirect(nn, r - k);
                    }
                    assert lhs == binomialDirect(m + nn, r)
                            : "Vandermonde failed for m=" + m + " n=" + nn + " r=" + r;
                }
            }
        }
    }

    // ==================== Part 3: Pigeonhole ====================

    public static int firstCollisionIndex(int[] keys, int tableSize) {
        boolean[] occupied = new boolean[tableSize];
        for (int i = 0; i < keys.length; i++) {
            int slot = Math.floorMod(keys[i], tableSize);
            if (occupied[slot]) return i + 1;
            occupied[slot] = true;
        }
        return -1;
    }

    public static int totalCollisions(int[] keys, int tableSize) {
        boolean[] occupied = new boolean[tableSize];
        int collisions = 0;
        for (int key : keys) {
            int slot = Math.floorMod(key, tableSize);
            if (occupied[slot]) collisions++;
            else occupied[slot] = true;
        }
        return collisions;
    }

    public static double birthdayProbExact(int k, int days) {
        if (k > days) return 1.0;
        double pNoMatch = 1.0;
        for (int i = 1; i < k; i++) {
            pNoMatch *= (days - i) / (double) days;
        }
        return 1.0 - pNoMatch;
    }

    public static double birthdayProbMonteCarlo(int k, int days, int trials) {
        Random rng = new Random(42);
        int hits = 0;
        for (int t = 0; t < trials; t++) {
            Set<Integer> seen = new HashSet<>();
            boolean collision = false;
            for (int i = 0; i < k; i++) {
                if (!seen.add(rng.nextInt(days))) {
                    collision = true;
                    break;
                }
            }
            if (collision) hits++;
        }
        return (double) hits / trials;
    }

    public static int[] simulateLoadBalancing(int n, int m, Random rng) {
        int[] bins = new int[m];
        for (int i = 0; i < n; i++) bins[rng.nextInt(m)]++;
        return bins;
    }

    // ==================== Part 4: Toolkit ====================

    public static double birthdayBound(int m) {
        return Math.sqrt(Math.PI * m / 2.0);
    }

    // ==================== Main ====================

    public static void main(String[] args) {
        System.out.println("=== Module 7 Lab Solution ===\n");

        // Part 1
        System.out.println("--- Part 1: Counting ---");
        System.out.println("Passwords (26 letters, length 4): " + passwordCount(26, 4));
        // 456976
        System.out.println("Total passwords length 1-4: " + totalPasswordsUpTo(26, 4));
        // 26 + 676 + 17576 + 456976 = 475254
        System.out.println("Divisible by 3 or 5 in {1..100}: " + countDivisibleByEither(100, 3, 5));
        // 33 + 20 - 6 = 47
        System.out.println("Nested loops (5,4,3): " + nestedLoopCount(5, 4, 3));
        // 60

        // Part 2
        System.out.println("\n--- Part 2: Combinations ---");
        System.out.println("C(10,3) direct: " + binomialDirect(10, 3));  // 120
        System.out.println("C(10,3) DP: " + binomialDP(10, 3));          // 120
        System.out.println("C(10,3) memo: " + binomialMemo(10, 3, new HashMap<>())); // 120
        System.out.println("P(5,3): " + permutations(5, 3));             // 60

        List<List<Integer>> combs = generateCombinations(5, 3);
        System.out.println("3-subsets of {0..4}: count=" + combs.size()
                + " (expected " + binomialDirect(5, 3) + ")");

        List<List<Integer>> perms = generatePermutations(4);
        System.out.println("Permutations of {0..3}: count=" + perms.size()
                + " (expected " + factorial(4) + ")");

        verifyIdentities(20);
        System.out.println("All identities verified (including Vandermonde)!");

        // Part 3
        System.out.println("\n--- Part 3: Pigeonhole ---");
        int m = 1000;
        int[] randomKeys = new Random(42).ints(2000, 0, 1_000_000).toArray();
        System.out.println("First collision at key #" + firstCollisionIndex(randomKeys, m));
        System.out.println("Total collisions (2000 keys, 1000 slots): " + totalCollisions(randomKeys, m));

        System.out.println("\nBirthday problem (365 days):");
        for (int k : new int[]{10, 20, 23, 30, 50}) {
            System.out.printf("k=%2d: exact=%.4f, MC=%.4f%n",
                    k, birthdayProbExact(k, 365),
                    birthdayProbMonteCarlo(k, 365, 100_000));
        }

        System.out.println("\nLoad balancing (100 tasks, 10 bins):");
        Random rng = new Random(42);
        int[] bins = simulateLoadBalancing(100, 10, rng);
        System.out.println("Bin loads: " + Arrays.toString(bins));
        int maxLoad = Arrays.stream(bins).max().orElse(0);
        System.out.println("Max load: " + maxLoad + " (PHP bound: " + ((100 + 9) / 10) + ")");

        // Part 4
        System.out.println("\n--- Part 4: Toolkit ---");
        System.out.printf("Birthday bound (m=1000): %.1f%n", birthdayBound(1000));
        System.out.printf("Lottery 6/49: 1 in %,d%n", binomialDirect(49, 6));
        // 1 in 13,983,816
    }
}
```

---

## Verification Checklist

| Task | Expected Output | ✓ |
|------|----------------|---|
| `passwordCount(26, 4)` | 456976 | |
| `totalPasswordsUpTo(26, 4)` | 475254 | |
| `countDivisibleByEither(100, 3, 5)` | 47 | |
| `nestedLoopCount(5, 4, 3)` | 60 | |
| `binomialDirect(10, 3)` | 120 | |
| `binomialDP(10, 3)` | 120 | |
| `binomialMemo(10, 3, ...)` | 120 | |
| `permutations(5, 3)` | 60 | |
| `generateCombinations(5, 3).size()` | 10 | |
| `generatePermutations(4).size()` | 24 | |
| Identity verification passes | No assertion errors | |
| First collision found | < 1000 (likely ~40) | |
| Birthday k=23 exact | ≈ 0.5073 | |
| Max load (100, 10) | ≥ 10 | |
| `birthdayBound(1000)` | ≈ 39.6 | |
| `binomialDirect(49, 6)` | 13983816 | |
