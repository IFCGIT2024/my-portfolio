# Module 1 – Assignment: Integers, Definitions and Proofs

## Assignment Overview

**Due:** End of Module 1  
**Weight:** Module assignment (combined math + programming)  
**Format:** Submit a single PDF for proofs and a `.java` file for code  

This assignment tests your ability to write direct proofs, construct counterexamples, implement number-theoretic algorithms in Java, and connect the two. You will prove properties of parity, divisibility, and the Euclidean algorithm, and you will write Java code that verifies and applies these results.

---

## Part A: Mathematical Proofs (50 points)

Write clean, formal proofs for each problem. Follow the direct proof template from class:
1. State what is given (hypotheses).
2. Unpack definitions into equations.
3. Perform algebraic manipulation.
4. Identify the integer witness.
5. State the conclusion.

### Problem A1 (8 points) — Parity Proofs

**(a)** Prove: If $a$ is odd and $b$ is even, then $a \cdot b$ is even.

**(b)** Prove: For any integer $n$, the expression $n^2 + 3n + 6$ is even.  
*(Hint: consider two cases — $n$ even and $n$ odd. Or factor cleverly.)*

### Problem A2 (8 points) — Counterexamples

For each false claim, provide a specific counterexample and explain why it disproves the claim.

**(a)** "If $a + b$ is even, then $a$ and $b$ are both even."

**(b)** "If $n^2$ is divisible by 4, then $n$ is divisible by 4."

**(c)** "If $a \mid bc$, then $a \mid b$ or $a \mid c$."

### Problem A3 (10 points) — Divisibility Proofs

**(a)** Prove: If $a \mid b$ and $a \mid c$, then $a \mid (3b - 7c)$.

**(b)** Prove: For any integer $n$, the product $n(n+1)(2n+1)$ is divisible by 6.  
*(Hint: among $n, n+1, 2n+1$, analyze divisibility by 2 and 3 separately.)*

### Problem A4 (12 points) — Euclidean Algorithm

**(a)** Compute $\gcd(546, 234)$ by hand, showing each step of the Euclidean algorithm.

**(b)** Using back-substitution on your steps from (a), find integers $x$ and $y$ such that $\gcd(546, 234) = 546x + 234y$. Verify your answer.

**(c)** Prove that the Euclidean algorithm terminates for any inputs $a > 0, b \geq 0$. Identify the variant function and explain why it guarantees termination.

### Problem A5 (12 points) — Fundamental Theorem of Arithmetic (Small Case)

The **Fundamental Theorem of Arithmetic** states: every integer $n > 1$ can be written as a product of prime numbers, and this factorization is unique (up to the order of primes).

**(a)** Prove the *existence* part for $n \leq 100$ using strong induction:  
- Base case: 2 is prime, so it is its own factorization.  
- Inductive step: assume every integer $k$ with $2 \leq k < n$ has a prime factorization. Show that $n$ does too, by considering whether $n$ is prime or composite.

**(b)** Sketch the proof of *uniqueness* for the case $n = 120 = 2^3 \times 3 \times 5$. Suppose $120 = p_1^{e_1} \cdots p_k^{e_k}$ is another prime factorization. Use Euclid's Lemma ($p \mid ab \Rightarrow p \mid a \text{ or } p \mid b$) to argue that the primes must be the same.

---

## Part B: Java Programming (50 points)

All code should be in a file called `Module1Assignment.java`. Include comments that reference the mathematical definitions and theorems.

### Problem B1 (10 points) — Prime Factorization Verifier

Write a method `List<Integer> primeFactors(int n)` that returns the prime factorization of $n$ as a list of prime factors (with repetition).

Write a test method `verifyFTA()` that:
1. For each $n$ from 2 to 100, computes `primeFactors(n)`.
2. Asserts that every factor in the list is prime.
3. Asserts that the product of all factors equals $n$.
4. Prints the factorization: e.g., `84 = 2 × 2 × 3 × 7`.

### Problem B2 (10 points) — GCD with Correctness Checks

Implement:

```java
public static int gcd(int a, int b)
```

Then write a verification method that for all $a, b$ with $1 \leq a, b \leq 200$:
1. Asserts $\gcd(a, b) \mid a$ and $\gcd(a, b) \mid b$.
2. Asserts there is no larger common divisor (i.e., for every $d > \gcd(a,b)$, either $d \nmid a$ or $d \nmid b$).
3. Asserts $\gcd(a, b) = \gcd(b, a)$ (commutativity).

### Problem B3 (10 points) — Bézout's Identity

Implement the extended Euclidean algorithm:

```java
public static int[] extendedGcd(int a, int b)
// Returns {gcd, x, y} where a*x + b*y = gcd
```

Verify for all pairs $(a, b)$ with $1 \leq a, b \leq 100$ that:
$$a \cdot x + b \cdot y = \gcd(a, b)$$

### Problem B4 (10 points) — Essay + Code: Modular Arithmetic and Hashing

Write a Java method that implements a simple hash function:

```java
public static int simpleHash(String key, int tableSize) {
    int hash = 0;
    for (char c : key.toCharArray()) {
        hash = (hash + c) % tableSize;
    }
    return hash;
}
```

Then:
1. Hash 20 different words into a table of size 7. Print the bucket for each word.
2. Count how many collisions occur (different keys mapping to the same bucket).
3. Repeat with a prime table size (7) and a non-prime table size (8). Which produces fewer collisions?

Write a short paragraph (5–8 sentences) explaining:
- How hashing uses the remainder operator (connecting to divisibility).
- Why prime table sizes tend to distribute keys more evenly.
- What the pigeonhole principle tells us about collisions when the number of keys exceeds the table size.

### Problem B5 (10 points) — Comprehensive Integration

Write a program that:
1. Finds all **twin prime** pairs $(p, p+2)$ up to 1000.
2. For each pair, computes $\gcd(p, p+2)$ and asserts it equals 1.
3. For each pair, verifies Bézout's identity: finds $x, y$ such that $px + (p+2)y = 1$.
4. Prints each pair along with the Bézout coefficients.

---

## Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| **A1** Parity proofs | 8 | Correct proof structure, proper use of definitions, valid algebra |
| **A2** Counterexamples | 8 | Specific examples given, clear explanation of why they disprove the claim |
| **A3** Divisibility proofs | 10 | Complete direct proofs with all witnesses identified as integers |
| **A4** Euclidean algorithm | 12 | Correct hand computation, valid back-substitution, clear termination argument |
| **A5** FTA proof | 12 | Strong induction structure, correct base/inductive cases, uniqueness sketch |
| **B1** Prime factorization | 10 | Correct implementation, all assertions pass, output formatted |
| **B2** GCD verification | 10 | All three properties verified, no assertion failures |
| **B3** Extended GCD | 10 | Correct implementation, Bézout identity verified for all pairs |
| **B4** Hashing essay | 10 | Working hash code, collision counts, thoughtful essay connecting math to code |
| **B5** Integration | 10 | Correct twin prime finder, gcd and Bézout verified, clean output |

---

## Solution Key

### Part A Solutions

**A1(a) Solution.** Let $a = 2m+1$ and $b = 2n$. Then $ab = (2m+1)(2n) = 2n(2m+1) = 2(n(2m+1))$. Since $n(2m+1) \in \mathbb{Z}$, $ab$ is even. $\blacksquare$

**A1(b) Solution.** *Case 1:* $n = 2k$ (even). Then $n^2 + 3n + 6 = 4k^2 + 6k + 6 = 2(2k^2 + 3k + 3)$, which is even.  
*Case 2:* $n = 2k+1$ (odd). Then $n^2 + 3n + 6 = (2k+1)^2 + 3(2k+1) + 6 = 4k^2 + 4k + 1 + 6k + 3 + 6 = 4k^2 + 10k + 10 = 2(2k^2 + 5k + 5)$, which is even.   $\blacksquare$

**A2(a) Solution.** Counterexample: $a = 3, b = 5$. Then $a + b = 8$ is even, but neither 3 nor 5 is even. $\blacksquare$

**A2(b) Solution.** Counterexample: $n = 2$. Then $n^2 = 4$ and $4 \mid 4$, but $4 \nmid 2$. $\blacksquare$

**A2(c) Solution.** Counterexample: $a = 6, b = 2, c = 3$. Then $bc = 6$ and $6 \mid 6$, but $6 \nmid 2$ and $6 \nmid 3$. $\blacksquare$

**A3(a) Solution.** Since $a \mid b$, write $b = am$. Since $a \mid c$, write $c = an$. Then $3b - 7c = 3am - 7an = a(3m - 7n)$. Since $3m - 7n \in \mathbb{Z}$, $a \mid (3b - 7c)$. $\blacksquare$

**A3(b) Solution.** *Divisibility by 2:* Among $n$ and $n+1$, one is even, so $2 \mid n(n+1)$, hence $2 \mid n(n+1)(2n+1)$.  
*Divisibility by 3:* Consider $n \bmod 3$:
- If $n \equiv 0$: $3 \mid n$.
- If $n \equiv 1$: $2n+1 = 2(1)+1 = 3$, so $3 \mid (2n+1)$.
- If $n \equiv 2$: $n+1 \equiv 0$, so $3 \mid (n+1)$.

In all cases, $3 \mid n(n+1)(2n+1)$. Since $\gcd(2,3) = 1$ and both divide the product, $6 \mid n(n+1)(2n+1)$. $\blacksquare$

**A4(a) Solution.**
$$546 = 234 \times 2 + 78$$
$$234 = 78 \times 3 + 0$$
$\gcd(546, 234) = 78$.

**A4(b) Solution.** From step 1: $78 = 546 - 234 \times 2$. So $x = 1, y = -2$.  
Check: $546(1) + 234(-2) = 546 - 468 = 78$. ✓

**A4(c) Solution.** The variant function is $b$ (the second argument). At each step, $b_{\text{new}} = a \bmod b$, and $0 \leq a \bmod b < b$, so $b$ strictly decreases. Since $b$ is a non-negative integer that strictly decreases each iteration, it must eventually reach 0, and the loop terminates. $\blacksquare$

**A5(a) Solution.** *Base case:* $n = 2$ is prime, so its prime factorization is just $\{2\}$.  
*Inductive step:* Assume every integer $k$ with $2 \leq k < n$ has a prime factorization. Consider $n$:
- If $n$ is prime, its factorization is $\{n\}$.
- If $n$ is composite, then $n = ab$ with $2 \leq a, b < n$. By the inductive hypothesis, $a$ and $b$ have prime factorizations. Combining them gives a prime factorization of $n$. $\blacksquare$

**A5(b) Solution.** Suppose $120 = p_1^{e_1} \cdots p_k^{e_k}$. Since $2 \mid 120$, by Euclid's Lemma, $2$ must divide some $p_i^{e_i}$, and since $p_i$ is prime, $p_i = 2$. Dividing out all factors of 2 leaves $15 = 3 \times 5$. Similarly, 3 must appear, and 5 must appear. The exponents are forced by how many times each prime divides 120.

### Part B Solutions

**B1 Solution.**
```java
import java.util.*;

public class Module1Assignment {

    public static List<Integer> primeFactors(int n) {
        List<Integer> factors = new ArrayList<>();
        for (int d = 2; d * d <= n; d++) {
            while (n % d == 0) { factors.add(d); n /= d; }
        }
        if (n > 1) factors.add(n);
        return factors;
    }

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) {
            if (n % d == 0) return false;
        }
        return true;
    }

    public static int gcd(int a, int b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b != 0) { int r = a % b; a = b; b = r; }
        return a;
    }

    public static int[] extendedGcd(int a, int b) {
        if (b == 0) return new int[]{a, 1, 0};
        int[] r = extendedGcd(b, a % b);
        return new int[]{r[0], r[2], r[1] - (a / b) * r[2]};
    }

    public static void verifyFTA() {
        System.out.println("--- B1: Prime Factorization ---");
        for (int n = 2; n <= 100; n++) {
            List<Integer> factors = primeFactors(n);
            int product = 1;
            for (int f : factors) {
                assert isPrime(f) : f + " is not prime";
                product *= f;
            }
            assert product == n : "Product mismatch for " + n;

            // Pretty print
            StringBuilder sb = new StringBuilder();
            sb.append(n).append(" = ");
            for (int i = 0; i < factors.size(); i++) {
                if (i > 0) sb.append(" × ");
                sb.append(factors.get(i));
            }
            System.out.println("  " + sb);
        }
        System.out.println("  FTA verified for 2..100\n");
    }

    public static void verifyGCD() {
        System.out.println("--- B2: GCD Verification ---");
        for (int a = 1; a <= 200; a++) {
            for (int b = 1; b <= 200; b++) {
                int g = gcd(a, b);
                assert a % g == 0 : "gcd doesn't divide a";
                assert b % g == 0 : "gcd doesn't divide b";
                assert gcd(a, b) == gcd(b, a) : "not commutative";
                // No larger common divisor
                for (int d = g + 1; d <= Math.min(a, b); d++) {
                    assert !(a % d == 0 && b % d == 0) :
                        d + " is a larger common divisor of " + a + "," + b;
                }
            }
        }
        System.out.println("  GCD properties verified for 1..200\n");
    }

    public static void verifyBezout() {
        System.out.println("--- B3: Bézout's Identity ---");
        for (int a = 1; a <= 100; a++) {
            for (int b = 1; b <= 100; b++) {
                int[] r = extendedGcd(a, b);
                assert a * r[1] + b * r[2] == r[0] :
                    "Bézout failed for " + a + "," + b;
            }
        }
        System.out.println("  Bézout verified for a,b in [1,100]\n");
    }

    public static int simpleHash(String key, int tableSize) {
        int hash = 0;
        for (char c : key.toCharArray()) {
            hash = (hash + c) % tableSize;
        }
        return hash;
    }

    public static void hashExperiment() {
        System.out.println("--- B4: Hash Experiment ---");
        String[] words = {"apple", "banana", "cherry", "date", "elderberry",
            "fig", "grape", "honeydew", "kiwi", "lemon", "mango", "nectarine",
            "orange", "papaya", "quince", "raspberry", "strawberry", "tangerine",
            "ugli", "vanilla"};

        for (int tableSize : new int[]{7, 8}) {
            Map<Integer, List<String>> buckets = new HashMap<>();
            for (String w : words) {
                int h = simpleHash(w, tableSize);
                buckets.computeIfAbsent(h, k -> new ArrayList<>()).add(w);
            }
            int collisions = 0;
            for (var entry : buckets.entrySet()) {
                if (entry.getValue().size() > 1)
                    collisions += entry.getValue().size() - 1;
            }
            System.out.printf("  Table size %d (%s): %d collisions%n",
                tableSize, isPrime(tableSize) ? "prime" : "non-prime", collisions);
            for (var entry : buckets.entrySet()) {
                System.out.printf("    Bucket %d: %s%n",
                    entry.getKey(), entry.getValue());
            }
        }
        System.out.println();
    }

    public static void twinPrimesAndBezout() {
        System.out.println("--- B5: Twin Primes + Bézout ---");
        List<Integer> primes = new ArrayList<>();
        for (int n = 2; n <= 1000; n++) {
            if (isPrime(n)) primes.add(n);
        }

        int count = 0;
        for (int i = 0; i < primes.size() - 1; i++) {
            int p = primes.get(i);
            int q = primes.get(i + 1);
            if (q - p == 2) {
                assert gcd(p, q) == 1 : "Twin primes not coprime!";
                int[] r = extendedGcd(p, q);
                assert p * r[1] + q * r[2] == 1;
                System.out.printf("  (%d, %d): %d×(%d) + %d×(%d) = 1%n",
                    p, q, p, r[1], q, r[2]);
                count++;
            }
        }
        System.out.println("  Twin prime pairs found: " + count + "\n");
    }

    public static void main(String[] args) {
        System.out.println("==============================");
        System.out.println(" MODULE 1 ASSIGNMENT SOLUTION ");
        System.out.println("==============================\n");

        verifyFTA();
        verifyGCD();
        verifyBezout();
        hashExperiment();
        twinPrimesAndBezout();

        System.out.println("=== ALL CHECKS PASSED ===");
    }
}
```
