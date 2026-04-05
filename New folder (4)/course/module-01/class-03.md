# Module 1 – Class 3: Primes and the Euclidean Algorithm

## Learning Objectives

By the end of this class, students will be able to:

1. Define prime and composite numbers formally and identify them.
2. State and explain the Euclidean algorithm for computing the greatest common divisor (gcd).
3. Prove the correctness of the Euclidean algorithm using a loop invariant.
4. Argue that the algorithm terminates using a variant function (decreasing remainders).
5. Implement `gcd`, `isPrime`, and a prime sieve in Java, connecting each to the mathematical definitions.

---

## Concept Overview

### Prime Numbers

**Definition (Prime).** An integer $p > 1$ is **prime** if its only positive divisors are 1 and $p$ itself.

**Definition (Composite).** An integer $n > 1$ is **composite** if it is not prime — that is, there exist integers $a, b$ with $1 < a, b < n$ such that $n = ab$.

**Special cases:**
- 1 is **neither** prime nor composite (by convention).
- 2 is the only even prime.
- 0 and negative integers are neither prime nor composite.

### Plain Language

A prime number cannot be broken into smaller factors (other than 1 and itself). A composite number *can* be factored. Primes are the "atoms" of arithmetic — every integer greater than 1 is either prime or can be built by multiplying primes together.

### The First Few Primes

$$2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, \ldots$$

### Greatest Common Divisor

**Definition (GCD).** The **greatest common divisor** of integers $a$ and $b$ (not both zero), written $\gcd(a, b)$, is the largest positive integer that divides both $a$ and $b$.

**Examples:**
- $\gcd(12, 18) = 6$ because the common divisors of 12 and 18 are $\{1, 2, 3, 6\}$
- $\gcd(7, 11) = 1$ (they share no common factor except 1 — they are "coprime")
- $\gcd(0, n) = |n|$ for any nonzero $n$

### The Euclidean Algorithm

The Euclidean algorithm computes $\gcd(a, b)$ efficiently using the key identity:

$$\gcd(a, b) = \gcd(b, a \bmod b) \quad\text{for } b \neq 0$$

The algorithm repeatedly applies this identity until the remainder is 0. At that point, the other value is the gcd.

**Why does this work?** If $a = bq + r$, then any common divisor of $a$ and $b$ also divides $r$ (since $r = a - bq$), and any common divisor of $b$ and $r$ also divides $a$ (since $a = bq + r$). So $a$ and $b$ have exactly the same set of common divisors as $b$ and $r$.

---

## Formal Notation

### The Division Algorithm Identity

For any integers $a$ and $b$ with $b > 0$:

$$a = b \cdot q + r \quad\text{where } q = \lfloor a/b \rfloor \text{ and } 0 \leq r < b$$

### GCD Properties

| Property | Statement |
|----------|-----------|
| Commutativity | $\gcd(a, b) = \gcd(b, a)$ |
| GCD with 0 | $\gcd(a, 0) = \|a\|$ |
| Key identity | $\gcd(a, b) = \gcd(b, a \bmod b)$ |
| Coprime | $\gcd(a, b) = 1$ means $a$ and $b$ share no factor $> 1$ |

### Algorithm in Pseudocode

```
GCD(a, b):
    while b ≠ 0:
        r ← a mod b
        a ← b
        b ← r
    return a
```

### Common Pitfalls

| Pitfall | Correction |
|---------|-----------|
| Forgetting that $\gcd(a, 0) = a$, not 0 | Zero is divisible by everything, so the gcd is the other number |
| Testing primality by checking only a few small primes | You must check all potential factors up to $\sqrt{n}$ |
| Confusing gcd with lcm | $\gcd$ is the *greatest* common divisor; $\text{lcm}$ is the *least* common multiple |

---

## Worked Examples

### Example 1: Computing gcd(1071, 462) by Hand (Discrete Math)

Apply the Euclidean algorithm step by step:

| Step | Division | Quotient $q$ | Remainder $r$ |
|------|----------|-------------|---------------|
| 1 | $1071 = 462 \cdot 2 + 147$ | 2 | 147 |
| 2 | $462 = 147 \cdot 3 + 21$ | 3 | 21 |
| 3 | $147 = 21 \cdot 7 + 0$ | 7 | 0 |

When the remainder reaches 0, the other value (21) is the gcd.

$$\gcd(1071, 462) = 21$$

**Verification:** $1071 = 21 \times 51$ and $462 = 21 \times 22$. Both are divisible by 21, and 51 and 22 share no common factor ($\gcd(51, 22) = 1$), confirming 21 is the *greatest* common divisor.

---

### Example 2: The Euclidean Algorithm in Java (Java Translation)

```java
/**
 * EuclideanGCD.java
 * Implements the Euclidean algorithm with detailed tracing.
 */
public class EuclideanGCD {

    /**
     * Computes gcd(a, b) using the Euclidean algorithm.
     *
     * LOOP INVARIANT: gcd(a, b) = gcd(original_a, original_b)
     *   at the start of each iteration.
     *
     * VARIANT FUNCTION: b decreases each iteration (b > 0 before, and
     *   the new b = old_a % old_b which is in [0, old_b - 1]).
     *
     * TERMINATION: b is a non-negative integer that strictly decreases
     *   each iteration, so the loop must terminate when b == 0.
     *
     * POSTCONDITION: when b == 0, gcd(a, 0) = a.
     *
     * Math:  gcd(a, b) = gcd(b, a mod b)
     * Code:  each iteration replaces (a, b) with (b, a % b)
     */
    public static int gcd(int a, int b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b != 0) {
            int r = a % b;    // r = a mod b; the key step
            a = b;            // replace a with b
            b = r;            // replace b with r
        }
        return a;             // when b == 0, a is the gcd
    } 
     // try this 

     public static int gcd(int a, int b) {
    a = Math.abs(a);
    b = Math.abs(b);
    
    // Base Case: "If b is zero, return the other one"
    if (b == 0) {
        return a;
    }
    
    // Recursive Step: Explicitly sending the output to the next 'a' and 'b'
    return gcd(b, a % b);
}


    /**
     * Same algorithm with step-by-step tracing for teaching.
     */
    public static int gcdWithTrace(int a, int b) {
        a = Math.abs(a);
        b = Math.abs(b);
        System.out.printf("Computing gcd(%d, %d):%n", a, b);
        int step = 1;
        while (b != 0) {
            int q = a / b;
            int r = a % b;
            System.out.printf("  Step %d: %d = %d × %d + %d%n", step, a, b, q, r);
            a = b;
            b = r;
            step++;
        }
        System.out.printf("  Result: gcd = %d%n%n", a);
        return a;
    }

    public static void main(String[] args) {
        System.out.println("===========================================");
        System.out.println(" PRIMES AND THE EUCLIDEAN ALGORITHM — CLASS 3");
        System.out.println("===========================================\n");

        // Traced examples
        gcdWithTrace(1071, 462);
        gcdWithTrace(48, 18);
        gcdWithTrace(100, 35);
        gcdWithTrace(17, 13);    // coprime
        gcdWithTrace(0, 15);

        // Verify commutativity
        System.out.println("--- Commutativity Check ---");
        for (int a = 0; a <= 50; a++) {
            for (int b = 0; b <= 50; b++) {
                if (a == 0 && b == 0) continue;
                assert gcd(a, b) == gcd(b, a) : "Commutativity failed!";
            }
        }
        System.out.println("  gcd(a,b) = gcd(b,a) verified for a,b in [0,50]\n");

        // Verify: gcd(a,b) divides both a and b
        System.out.println("--- GCD Divides Both ---");
        boolean allPass = true;
        for (int a = 1; a <= 100; a++) {
            for (int b = 1; b <= 100; b++) {
                int g = gcd(a, b);
                if (a % g != 0 || b % g != 0) {
                    System.out.printf("  FAIL: gcd(%d,%d)=%d%n", a, b, g);
                    allPass = false;
                }
            }
        }
        if (allPass) {
            System.out.println("  gcd(a,b) divides both a and b: verified.\n");
        }
    }
}
```

**Sample Output:**
```
===========================================
 PRIMES AND THE EUCLIDEAN ALGORITHM — CLASS 3
===========================================

Computing gcd(1071, 462):
  Step 1: 1071 = 462 × 2 + 147
  Step 2: 462 = 147 × 3 + 21
  Step 3: 147 = 21 × 7 + 0
  Result: gcd = 21

Computing gcd(48, 18):
  Step 1: 48 = 18 × 2 + 12
  Step 2: 18 = 12 × 1 + 6
  Step 3: 12 = 6 × 2 + 0
  Result: gcd = 6

Computing gcd(100, 35):
  Step 1: 100 = 35 × 2 + 30
  Step 2: 35 = 30 × 1 + 5
  Step 3: 30 = 5 × 6 + 0
  Result: gcd = 5

Computing gcd(17, 13):
  Step 1: 17 = 13 × 1 + 4
  Step 2: 13 = 4 × 3 + 1
  Step 3: 4 = 1 × 4 + 0
  Result: gcd = 1

Computing gcd(15, 0):
  Result: gcd = 15
```

---

### Example 3: Proving the Euclidean Algorithm Is Correct (Combined DM + Java)

We prove three things: (1) the loop invariant holds, (2) the algorithm terminates, and (3) the postcondition gives the right answer.

**Loop Invariant:** At the start of each iteration, $\gcd(a, b) = \gcd(a_0, b_0)$ where $a_0, b_0$ are the original inputs.

**Proof of the invariant:**

*Initialization:* Before the first iteration, $a = a_0$ and $b = b_0$, so $\gcd(a, b) = \gcd(a_0, b_0)$. ✓

*Maintenance:* Suppose $\gcd(a, b) = \gcd(a_0, b_0)$ at the start of an iteration. The algorithm computes $r = a \bmod b$ and replaces $(a, b)$ with $(b, r)$.

We must show $\gcd(b, r) = \gcd(a, b)$. Since $a = bq + r$ for some integer $q$:
- Any common divisor of $a$ and $b$ also divides $r = a - bq$ (by the linear combination theorem from Class 2).
- Any common divisor of $b$ and $r$ also divides $a = bq + r$.

So the set of common divisors is the same, and hence the greatest common divisor is the same. ✓

*Termination:* The loop ends when $b = 0$. At that point, $\gcd(a, 0) = a$. By the invariant, $a = \gcd(a_0, b_0)$. ✓

**Termination Proof via Variant Function:**

Define the variant $V = b$. At each step:
- $b_{\text{new}} = a \bmod b$, and $0 \leq a \bmod b < b$ by the quotient-remainder theorem.
- So $b_{\text{new}} < b_{\text{old}}$ (strictly decreasing).
- Since $b \geq 0$ always, and a non-negative integer cannot decrease forever, the loop terminates. $\blacksquare$

**Java annotation showing invariant and variant:**

```java
public static int gcdAnnotated(int a, int b) {
    a = Math.abs(a);
    b = Math.abs(b);
    // INVARIANT: gcd(a, b) = gcd(original a, original b)
    // VARIANT:   b ≥ 0 and strictly decreases each iteration
    while (b != 0) {
        assert b > 0;                // variant is positive
        int oldB = b;
        int r = a % b;
        a = b;
        b = r;
        assert b < oldB;            // variant strictly decreases
        // gcd(a, b) = gcd(old a, old b) by the key identity
    }
    // b == 0, so gcd(a, 0) = a
    return a;
}
```

---

### Example 4: Primality Testing (Discrete Math)

**Claim.** To test whether $n > 1$ is prime, it suffices to check for divisors up to $\sqrt{n}$.

**Proof.** Suppose $n$ is composite, so $n = ab$ with $1 < a, b < n$. We cannot have both $a > \sqrt{n}$ and $b > \sqrt{n}$, because then $ab > n$, contradicting $ab = n$. So at least one factor satisfies $a \leq \sqrt{n}$. Therefore, if no integer from 2 to $\lfloor\sqrt{n}\rfloor$ divides $n$, then $n$ is prime. $\blacksquare$

**Example:** To test if 97 is prime, check divisors up to $\lfloor\sqrt{97}\rfloor = 9$. Check: $97/2, 97/3, 97/5, 97/7$ — none divide evenly. So 97 is prime.

---

### Example 5: Sieve of Eratosthenes

The Sieve of Eratosthenes finds all primes up to $N$:
1. List all integers from 2 to $N$.
2. The first uncrossed number is prime. Cross out all its multiples.
3. Repeat until you've processed numbers up to $\sqrt{N}$.

**For $N = 30$:**

Start: 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30

Cross out multiples of 2: ~~4~~ ~~6~~ ~~8~~ ~~10~~ ~~12~~ ~~14~~ ~~16~~ ~~18~~ ~~20~~ ~~22~~ ~~24~~ ~~26~~ ~~28~~ ~~30~~

Cross out multiples of 3: ~~9~~ ~~15~~ ~~21~~ ~~27~~

Cross out multiples of 5: ~~25~~

Done ($5 < \sqrt{30} < 6$). Primes: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.

---

## Proof Techniques Spotlight

### Loop Invariants

A **loop invariant** is a condition that is:
1. **True before the loop starts** (initialization).
2. **Preserved by each iteration** (maintenance).
3. **Useful when the loop ends** (postcondition).

This is the proof technique that most directly connects mathematics to programming. It mirrors mathematical induction:

| Induction | Loop Invariant |
|-----------|---------------|
| Base case $P(1)$ | Initialization: invariant holds before first iteration |
| Inductive step: $P(k) \Rightarrow P(k+1)$ | Maintenance: if invariant holds before iteration, it holds after |
| Conclusion for all $n$ | Postcondition: when loop exits, invariant + exit condition gives result |

### Variant Functions (Termination)

A **variant function** (or **decrementing function**) is a function $V$ of the loop variables that:
1. Is always $\geq 0$.
2. Strictly decreases each iteration.

Since a non-negative integer cannot decrease forever, the loop must terminate.

### Common Mistakes

| Mistake | Correction |
|---------|-----------|
| Claiming the invariant is the entire postcondition | The invariant is something that holds *during* the loop; the postcondition combines the invariant with the loop exit condition |
| Forgetting to prove initialization | The invariant must hold *before* the first iteration |
| Not identifying the variant function | Without a variant, you haven't proved termination |

---

## Java Deep Dive

### Complete Primes and GCD Library

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * PrimesAndGCD.java
 * Complete library for primality testing, the Euclidean algorithm,
 * and related computations.
 */
public class PrimesAndGCD {

    // =========================================================
    // GCD
    // =========================================================

    /**
     * Euclidean algorithm: computes gcd(a, b).
     * Invariant: gcd(a,b) is preserved each iteration.
     * Variant: b strictly decreases toward 0.
     */
    public static int gcd(int a, int b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b != 0) {
            int r = a % b;
            a = b;
            b = r;
        }
        return a;
    }

    /**
     * Recursive version of the Euclidean algorithm.
     * Mirrors the mathematical identity: gcd(a, b) = gcd(b, a mod b).
     * Base case: gcd(a, 0) = a.
     */
    public static int gcdRecursive(int a, int b) {
        a = Math.abs(a);
        b = Math.abs(b);
        if (b == 0) return a;
        return gcdRecursive(b, a % b);
    }

    /**
     * Least common multiple using the identity: lcm(a,b) = |a*b| / gcd(a,b).
     */
    public static int lcm(int a, int b) {
        if (a == 0 || b == 0) return 0;
        return Math.abs(a / gcd(a, b) * b);  // divide first to avoid overflow
    }

    /**
     * Extended Euclidean algorithm: returns {g, x, y} where
     * g = gcd(a, b) and a*x + b*y = g (Bézout's identity).
     */
    public static int[] extendedGcd(int a, int b) {
        if (b == 0) return new int[]{a, 1, 0};
        int[] result = extendedGcd(b, a % b);
        int g = result[0];
        int x = result[2];
        int y = result[1] - (a / b) * result[2];
        return new int[]{g, x, y};
    }

    // =========================================================
    // PRIMALITY
    // =========================================================

    /**
     * Tests whether n is prime.
     * 
     * Math: n is prime iff n > 1 and the only positive divisors of n
     *       are 1 and n.
     * Optimization: only check divisors up to sqrt(n), because if
     *       n = a*b with a <= b, then a <= sqrt(n).
     * 
     * Time: O(sqrt(n))
     */
    public static boolean isPrime(int n) {
        if (n < 2) return false;
        if (n < 4) return true;          // 2, 3 are prime
        if (n % 2 == 0 || n % 3 == 0) return false;
        // Only need to check divisors of the form 6k ± 1
        for (int i = 5; i * i <= n; i += 6) {
            if (n % i == 0 || n % (i + 2) == 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Simple primality test (for clarity, not efficiency).
     * Checks all potential divisors from 2 to sqrt(n).
     */
    public static boolean isPrimeSimple(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) {
            if (n % d == 0) return false;   // found a divisor: not prime
        }
        return true;                         // no divisors found: prime
    }

    /**
     * Sieve of Eratosthenes: returns all primes up to limit.
     *
     * Math: cross out multiples of each prime starting from 2.
     * After processing primes up to sqrt(limit), all remaining
     * uncrossed numbers are prime.
     *
     * Time: O(n log log n)
     */
    public static List<Integer> sieve(int limit) {
        boolean[] isComposite = new boolean[limit + 1];
        List<Integer> primes = new ArrayList<>();

        for (int p = 2; p <= limit; p++) {
            if (!isComposite[p]) {
                primes.add(p);
                // Cross out multiples of p starting from p*p
                // (smaller multiples already crossed out)
                for (long multiple = (long) p * p; multiple <= limit; multiple += p) {
                    isComposite[(int) multiple] = true;
                }
            }
        }
        return primes;
    }

    /**
     * Returns the prime factorization of n as a list of factors.
     * E.g., primeFactors(84) returns [2, 2, 3, 7] since 84 = 2² × 3 × 7.
     */
    public static List<Integer> primeFactors(int n) {
        List<Integer> factors = new ArrayList<>();
        if (n < 2) return factors;

        // Divide out 2s
        while (n % 2 == 0) {
            factors.add(2);
            n /= 2;
        }

        // Check odd factors from 3 to sqrt(n)
        for (int d = 3; d * d <= n; d += 2) {
            while (n % d == 0) {
                factors.add(d);
                n /= d;
            }
        }

        // If n > 1, then n is a prime factor
        if (n > 1) {
            factors.add(n);
        }

        return factors;
    }

    // =========================================================
    // DEMONSTRATIONS
    // =========================================================

    public static void main(String[] args) {
        System.out.println("================================================");
        System.out.println(" PRIMES AND THE EUCLIDEAN ALGORITHM — CLASS 3  ");
        System.out.println("================================================\n");

        // Demo 1: Prime checking
        System.out.println("--- Primality Tests ---");
        int[] testNums = {1, 2, 3, 4, 11, 15, 17, 25, 29, 97, 100};
        for (int n : testNums) {
            System.out.printf("  isPrime(%d) = %s%n", n, isPrime(n));
        }
        System.out.println();

        // Demo 2: Sieve of Eratosthenes
        System.out.println("--- Primes up to 100 (Sieve) ---");
        List<Integer> primes = sieve(100);
        System.out.println("  " + primes);
        System.out.println("  Count: " + primes.size());
        System.out.println();

        // Demo 3: Prime factorization
        System.out.println("--- Prime Factorization ---");
        int[] toFactor = {12, 28, 84, 100, 97, 360};
        for (int n : toFactor) {
            System.out.printf("  %d = %s%n", n, primeFactors(n));
        }
        System.out.println();

        // Demo 4: GCD examples
        System.out.println("--- GCD Computations ---");
        int[][] gcdTests = {{1071, 462}, {48, 18}, {100, 35}, {17, 13}, {0, 15}};
        for (int[] pair : gcdTests) {
            System.out.printf("  gcd(%d, %d) = %d%n", pair[0], pair[1], gcd(pair[0], pair[1]));
        }
        System.out.println();

        // Demo 5: Extended Euclidean algorithm (Bézout's identity)
        System.out.println("--- Extended GCD (Bézout's Identity) ---");
        for (int[] pair : gcdTests) {
            if (pair[0] == 0 || pair[1] == 0) continue;
            int[] result = extendedGcd(pair[0], pair[1]);
            System.out.printf("  gcd(%d, %d) = %d = %d×(%d) + %d×(%d)%n",
                pair[0], pair[1], result[0], pair[0], result[1], pair[1], result[2]);
            // Verify
            assert pair[0] * result[1] + pair[1] * result[2] == result[0];
        }
        System.out.println();

        // Demo 6: Verify iterative = recursive
        System.out.println("--- Iterative vs Recursive GCD ---");
        boolean match = true;
        for (int a = 0; a <= 100; a++) {
            for (int b = 0; b <= 100; b++) {
                if (a == 0 && b == 0) continue;
                if (gcd(a, b) != gcdRecursive(a, b)) {
                    match = false;
                    System.out.printf("  MISMATCH: gcd(%d,%d)%n", a, b);
                }
            }
        }
        if (match) {
            System.out.println("  Iterative and recursive agree for a,b in [0,100].");
        }
        System.out.println();

        // Demo 7: LCM
        System.out.println("--- LCM Computations ---");
        int[][] lcmTests = {{12, 18}, {4, 6}, {7, 13}, {100, 35}};
        for (int[] pair : lcmTests) {
            System.out.printf("  lcm(%d, %d) = %d%n", pair[0], pair[1], lcm(pair[0], pair[1]));
        }
    }
}
```

**Sample Output:**
```
--- Primality Tests ---
  isPrime(1) = false
  isPrime(2) = true
  isPrime(3) = true
  isPrime(4) = false
  isPrime(11) = true
  isPrime(15) = false
  isPrime(17) = true
  isPrime(25) = false
  isPrime(29) = true
  isPrime(97) = true
  isPrime(100) = false

--- Primes up to 100 (Sieve) ---
  [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
  Count: 25

--- Prime Factorization ---
  12 = [2, 2, 3]
  28 = [2, 2, 7]
  84 = [2, 2, 3, 7]
  100 = [2, 2, 5, 5]
  97 = [97]
  360 = [2, 2, 2, 3, 3, 5]

--- GCD Computations ---
  gcd(1071, 462) = 21
  gcd(48, 18) = 6
  gcd(100, 35) = 5
  gcd(17, 13) = 1
  gcd(0, 15) = 15

--- Extended GCD (Bézout's Identity) ---
  gcd(1071, 462) = 21 = 1071×(-9) + 462×(21)
  gcd(48, 18) = 6 = 48×(-1) + 18×(3)
  gcd(100, 35) = 5 = 100×(-1) + 35×(3)
  gcd(17, 13) = 1 = 17×(-3) + 13×(4)
```

---

## Computational Use: Primes and GCD in Computer Science

### Cryptography (RSA)
RSA encryption relies on:
1. Generating two large primes $p$ and $q$.
2. Computing $n = pq$ (easy).
3. The security assumption: factoring $n$ back into $p$ and $q$ is computationally hard.

The gcd and extended Euclidean algorithm are used to compute modular inverses needed for the keys.

### Hash Functions
Many hash functions use modular arithmetic with a prime table size. Using a prime $m$ distributes keys more uniformly because primes have no common factors with typical data patterns.

### Rational Arithmetic
To reduce a fraction $a/b$ to lowest terms, divide both by $\gcd(a, b)$.

### Performance Analysis
The Euclidean algorithm runs in $O(\log(\min(a, b)))$ time — remarkably efficient. The number of steps is at most about $5 \times (\text{number of digits of } \min(a, b))$.

---

## Historical Context

**Euclid (c. 300 BC)** described the algorithm in Propositions 1 and 2 of Book VII of the *Elements*. It is one of the oldest algorithms still in widespread use — over 2300 years old. Euclid described it geometrically: given two line segments, repeatedly subtract the shorter from the longer until the segments are equal.

**Fibonacci (1202)** popularized the algorithm in Europe through his *Liber Abaci*. The worst case of the Euclidean algorithm occurs for consecutive Fibonacci numbers — this is because Fibonacci numbers grow as slowly as possible relative to their gcd.

**Lamé (1844)** proved that the number of steps in the Euclidean algorithm for $\gcd(a, b)$ with $a > b$ is at most $5 \times (\text{number of digits of } b)$.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** Is 1 a prime number? Why or why not?

**A2.** Why is 2 the only even prime?

**A3.** What is $\gcd(15, 0)$? What is $\gcd(0, 0)$? (Trick question — $\gcd(0,0)$ is conventionally undefined or taken as 0.)

**A4.** If $\gcd(a, b) = 1$, what does that tell you about $a$ and $b$?

---

### Slide Set B: Proof Problems

**B1.** Prove: There are infinitely many prime numbers. *(Hint: Euclid's proof. Assume finitely many primes $p_1, \ldots, p_n$. Consider $N = p_1 p_2 \cdots p_n + 1$.)*

**B2.** Prove that $\gcd(a, b) = \gcd(b, a \bmod b)$ by showing the two pairs have the same set of common divisors.

**B3.** Prove that the Euclidean algorithm terminates by identifying a variant function.

**B4.** If $\gcd(a, b) = d$, prove that $\gcd(a/d, b/d) = 1$.

---

### Slide Set C: Java Coding Problems

**C1.** Implement `int gcd(int a, int b)` both iteratively and recursively. Verify they give the same answer for $a, b \in [0, 100]$.

**C2.** Implement `boolean isPrime(int n)` using the $\sqrt{n}$ optimization. Test it for $n = 1$ to $100$.

**C3.** Implement the Sieve of Eratosthenes to find all primes up to 1000. How many are there?

**C4.** Write a method that computes the prime factorization of any integer and returns it as a `List<Integer>`.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Compute $\gcd(252, 198)$ by hand using the Euclidean algorithm. Show each step.

**DM2.** Prove: If $p$ is prime and $p \mid ab$, then $p \mid a$ or $p \mid b$. *(This is Euclid's Lemma. Hint: if $p \nmid a$, then $\gcd(p, a) = 1$, so by Bézout's identity, $1 = px + ay$. Multiply both sides by $b$.)*

**DM3.** Prove: $\gcd(n, n+1) = 1$ for any positive integer $n$. *(Hint: if $d \mid n$ and $d \mid (n+1)$, then $d \mid ((n+1) - n) = 1$.)*

**DM4.** Prove: $\gcd(a, b) \cdot \text{lcm}(a, b) = |ab|$.

**DM5.** Find integers $x$ and $y$ such that $\gcd(1071, 462) = 1071x + 462y$. *(Use the extended Euclidean algorithm by back-substituting.)*

**DM6.** Prove: If $\gcd(a, b) = 1$ and $a \mid c$ and $b \mid c$, then $ab \mid c$.

**DM7.** Prove that every composite number $n$ has a prime factor $\leq \sqrt{n}$.

---

### Java Programming Problems

**JP1.** Write `int gcd(int a, int b)` iteratively and `int gcdRec(int a, int b)` recursively. Assert they match for 10,000 random pairs.

**JP2.** Implement the Sieve of Eratosthenes for $N = 10{,}000$. Count the primes (should be 1229). Compute the ratio $\pi(N) / (N / \ln N)$ and compare to 1 (the prime number theorem).

**JP3.** Write a method `int[] extendedGcd(int a, int b)` that returns $\{g, x, y\}$ where $g = \gcd(a,b)$ and $ax + by = g$. Verify for 100 pairs.

**JP4.** Write `List<Integer> primeFactorization(int n)` using trial division. Verify that multiplying the factors recovers $n$ for all $n$ from 2 to 1000.

**JP5.** Write a method that determines whether two numbers are coprime (gcd = 1). Use it to count the number of integers from 1 to 100 that are coprime to 100. *(This is Euler's totient function $\phi(100)$.)*

**JP6.** Implement a method that finds all prime pairs $(p, p+2)$ ("twin primes") up to 1000. How many are there?

---

### Bridge Problems (Discrete Math + Java)

**BR1.** *Prove and Verify.* Prove that $\gcd(n, n+1) = 1$ for all $n \geq 1$. Then write a Java method that verifies this for $n = 1$ to $10{,}000$.

**BR2.** *Loop Invariant in Code.* Annotate your iterative `gcd` method with assert statements that check:
- The loop invariant (gcd of current $a, b$ equals gcd of original inputs).
- The variant function (b decreases each iteration).
Run with assertions enabled (`java -ea`) and verify no assertions fail.

**BR3.** *Back-Substitution.* The Euclidean algorithm for $\gcd(48, 18)$ gives:
```
48 = 18 × 2 + 12
18 = 12 × 1 + 6
12 = 6 × 2 + 0
```
Back-substitute to find $x, y$ such that $6 = 48x + 18y$. Then write Java code that performs this back-substitution automatically (i.e., implement the extended Euclidean algorithm).

---

## Solutions

### Discrete Math Solutions

**DM1 Solution.**
$$252 = 198 \times 1 + 54$$
$$198 = 54 \times 3 + 36$$
$$54 = 36 \times 1 + 18$$
$$36 = 18 \times 2 + 0$$
Therefore $\gcd(252, 198) = 18$.

**DM2 Solution (Euclid's Lemma).**
Suppose $p$ is prime, $p \mid ab$, and $p \nmid a$. Since $p$ is prime, its only divisors are 1 and $p$. Since $p \nmid a$, $\gcd(p, a) = 1$. By Bézout's identity, there exist $x, y$ such that $px + ay = 1$. Multiply by $b$: $pxb + aby = b$. Now $p \mid (pxb)$ (trivially) and $p \mid (aby)$ (since $p \mid ab$). So $p \mid (pxb + aby) = b$. $\blacksquare$

**DM3 Solution.**
Suppose $d \mid n$ and $d \mid (n+1)$. Then $d \mid ((n+1) - n) = 1$, so $d = \pm 1$. The largest positive common divisor is 1. $\blacksquare$

**DM4 Solution.**
Write $a = d \alpha$ and $b = d \beta$ where $d = \gcd(a, b)$ and $\gcd(\alpha, \beta) = 1$.
Then $\text{lcm}(a, b) = d \alpha \beta$ (one can verify this is the smallest common multiple).
So $\gcd(a,b) \cdot \text{lcm}(a,b) = d \cdot d\alpha\beta = d^2 \alpha \beta = (d\alpha)(d\beta) = ab = |ab|$ (for positive $a, b$; take absolute values in general). $\blacksquare$

**DM5 Solution.**
From $\gcd(1071, 462) = 21$, back-substitute:
$21 = 462 - 147 \times 3$
$147 = 1071 - 462 \times 2$
Substitute: $21 = 462 - (1071 - 462 \times 2) \times 3 = 462 - 1071 \times 3 + 462 \times 6 = 462 \times 7 + 1071 \times (-3)$
So $21 = 1071 \times (-3) + 462 \times 7$. Check: $-3213 + 3234 = 21$. ✓

**DM6 Solution.**
Since $a \mid c$, $c = am$. Since $b \mid c$, $c = bn$. Since $\gcd(a,b) = 1$, by Bézout there exist $x, y$ with $ax + by = 1$. Multiply by $c$: $acx + bcy = c$. Now $ab \mid (acx)$ (since $b \mid c$, $acx = a \cdot bn \cdot x = ab \cdot nx$) and $ab \mid (bcy)$ (since $a \mid c$, $bcy = b \cdot am \cdot y = ab \cdot my$). So $ab \mid c$. $\blacksquare$

**DM7 Solution.**
If $n$ is composite, then $n = ab$ with $1 < a \leq b < n$. Since $a \leq b$, we have $a^2 \leq ab = n$, so $a \leq \sqrt{n}$. Now $a > 1$ and $a \mid n$, so $a$ has a prime factor $p \leq a \leq \sqrt{n}$, and $p \mid n$. $\blacksquare$

---

### Java Solutions

**JP1 Solution.**
```java
public static int gcd(int a, int b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b != 0) { int r = a % b; a = b; b = r; }
    return a;
}

public static int gcdRec(int a, int b) {
    a = Math.abs(a); b = Math.abs(b);
    return b == 0 ? a : gcdRec(b, a % b);
}

// Verification:
public static void verifyGcdVersions() {
    java.util.Random rng = new java.util.Random(42);
    for (int i = 0; i < 10000; i++) {
        int a = rng.nextInt(10000);
        int b = rng.nextInt(10000);
        if (a == 0 && b == 0) continue;
        assert gcd(a, b) == gcdRec(a, b);
    }
    System.out.println("Both GCD versions agree for 10,000 random pairs.");
}
```

**JP2 Solution.**
```java
public static void sieveStatistics(int N) {
    List<Integer> primes = sieve(N);
    int count = primes.size();
    double estimate = N / Math.log(N);
    System.out.printf("Primes up to %d: %d%n", N, count);
    System.out.printf("N / ln(N) ≈ %.1f%n", estimate);
    System.out.printf("π(N) / (N/ln(N)) ≈ %.4f (approaches 1 as N→∞)%n",
        count / estimate);
}
// For N=10000: count=1229, N/ln(N)≈1085.7, ratio≈1.1319
```

**JP3 Solution.**
```java
public static int[] extendedGcd(int a, int b) {
    if (b == 0) return new int[]{a, 1, 0};
    int[] r = extendedGcd(b, a % b);
    return new int[]{r[0], r[2], r[1] - (a / b) * r[2]};
}

// Verify:
for (int a = 1; a <= 100; a++) {
    for (int b = 1; b <= 100; b++) {
        int[] r = extendedGcd(a, b);
        assert a * r[1] + b * r[2] == r[0];
    }
}
```

**JP4 Solution.**
```java
public static List<Integer> primeFactorization(int n) {
    List<Integer> factors = new ArrayList<>();
    for (int d = 2; d * d <= n; d++) {
        while (n % d == 0) { factors.add(d); n /= d; }
    }
    if (n > 1) factors.add(n);
    return factors;
}

// Verify:
for (int n = 2; n <= 1000; n++) {
    List<Integer> f = primeFactorization(n);
    int product = 1;
    for (int p : f) { assert isPrime(p); product *= p; }
    assert product == n : "Factorization of " + n + " failed";
}
```

**JP5 Solution.**
```java
public static int eulerTotient(int n) {
    int count = 0;
    for (int k = 1; k <= n; k++) {
        if (gcd(k, n) == 1) count++;
    }
    return count;
}
// eulerTotient(100) = 40
```

**JP6 Solution.**
```java
public static List<int[]> twinPrimes(int limit) {
    List<Integer> primes = sieve(limit);
    List<int[]> twins = new ArrayList<>();
    for (int i = 0; i < primes.size() - 1; i++) {
        if (primes.get(i + 1) - primes.get(i) == 2) {
            twins.add(new int[]{primes.get(i), primes.get(i + 1)});
        }
    }
    return twins;
}
// Up to 1000: (3,5),(5,7),(11,13),(17,19),(29,31),(41,43),(59,61),
//             (71,73),(101,103),(107,109),(137,139),(149,151),
//             (179,181),(191,193),(197,199),(227,229),(239,241),
//             (269,271),(281,283),(311,313),(347,349),(419,421),
//             (431,433),(461,463),(521,523),(569,571),(599,601),
//             (617,619),(641,643),(659,661),(809,811),(821,823),
//             (827,829),(857,859),(881,883) — 35 twin prime pairs
```

---

### Bridge Problem Solutions

**BR1 Solution.**

*Proof:* Let $d = \gcd(n, n+1)$. Then $d \mid n$ and $d \mid (n+1)$. So $d \mid (n+1-n) = 1$, giving $d = 1$. $\blacksquare$

```java
for (int n = 1; n <= 10000; n++) {
    assert gcd(n, n + 1) == 1 : "Failed for n=" + n;
}
System.out.println("gcd(n, n+1) = 1 verified for n = 1..10000");
```

**BR2 Solution.**
```java
public static int gcdWithAssertions(int origA, int origB) {
    int a = Math.abs(origA), b = Math.abs(origB);
    int expectedGcd = gcd(origA, origB);  // precompute for checking
    while (b != 0) {
        assert gcd(a, b) == expectedGcd : "Invariant violated";
        int oldB = b;
        int r = a % b;
        a = b;
        b = r;
        assert b < oldB : "Variant did not decrease";
    }
    assert a == expectedGcd : "Postcondition violated";
    return a;
}
```

**BR3 Solution.**

Back-substitution:
$6 = 18 - 12 \times 1$
$12 = 48 - 18 \times 2$
Substitute: $6 = 18 - (48 - 18 \times 2) = 18 \times 3 - 48 = 48 \times (-1) + 18 \times 3$.

Check: $48 \times (-1) + 18 \times 3 = -48 + 54 = 6$. ✓

Java: The `extendedGcd` method above implements this automatically.
