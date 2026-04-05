# Module 2 – Class 3: Primes, Factorization and Simple Cryptography

## Learning Objectives

- State the Fundamental Theorem of Arithmetic and prove existence by strong induction.
- Implement trial division for prime factorization in Java.
- State and apply the Chinese Remainder Theorem (CRT).
- Implement a constructive CRT solver using Bézout coefficients.
- Explain how prime factorization and CRT apply to RSA and multi-modulus computation.

---

## Concept Overview

### The Fundamental Theorem of Arithmetic

> **Theorem.** Every integer $n > 1$ can be written as a product of primes:
> $$n = p_1^{e_1} \cdot p_2^{e_2} \cdots p_k^{e_k}$$
> and this factorization is unique up to the order of the factors.

The *existence* part follows by strong induction. The *uniqueness* part requires Euclid's Lemma: if $p$ is prime and $p \mid ab$, then $p \mid a$ or $p \mid b$.

### The Chinese Remainder Theorem (CRT)

> **Theorem.** If $m$ and $n$ are coprime (i.e., $\gcd(m, n) = 1$), then the system
> $$x \equiv a \pmod{m}, \qquad x \equiv b \pmod{n}$$
> has a unique solution modulo $mn$.

**Constructive solution:** Find Bézout coefficients $s, t$ with $ms + nt = 1$. Then $x = a \cdot nt + b \cdot ms$.

**Why this matters in CS:**
- **RSA cryptography:** Encryption and decryption rely on modular exponentiation and CRT for efficient computation.
- **Multi-modulus arithmetic:** CRT allows computing with large numbers by splitting into smaller moduli.
- **Error detection:** Residue number systems use CRT for fault-tolerant computation.
- **Hash functions:** Prime factorization analysis helps understand collision behavior.

---

## Formal Notation

| Symbol | Meaning |
|--------|---------|
| $n = p_1^{e_1} \cdots p_k^{e_k}$ | Prime factorization of $n$ |
| $\text{lcm}(a, b)$ | Least common multiple: $ab / \gcd(a,b)$ |
| $x \equiv a \pmod{m}$ | $x$ leaves remainder $a$ when divided by $m$ |
| $ms + nt = 1$ | Bézout's identity (when $\gcd(m,n) = 1$) |

**Relationship between GCD and LCM:**
$$\gcd(a, b) \cdot \text{lcm}(a, b) = a \cdot b$$
$$\text{lcm}(a, b) = \frac{a \cdot b}{\gcd(a, b)}$$

---

## Worked Examples

### Example 1: Prime Factorization by Trial Division — Discrete Math

**Problem:** Factor $n = 2520$ into primes.

**Solution:** Divide by the smallest prime possible at each step:
- $2520 / 2 = 1260$
- $1260 / 2 = 630$
- $630 / 2 = 315$
- $315 / 3 = 105$
- $105 / 3 = 35$
- $35 / 5 = 7$
- $7 / 7 = 1$

So $2520 = 2^3 \cdot 3^2 \cdot 5 \cdot 7$. $\blacksquare$

### Example 2: Java Translation — Prime Factorization

```java
import java.util.*;

public class PrimeFactorizationDemo {

    /**
     * Returns the prime factorization of n as a map: prime -> exponent.
     * E.g., 2520 -> {2:3, 3:2, 5:1, 7:1}
     *
     * Algorithm: trial division.
     * Mathematical basis: every composite n has a factor ≤ sqrt(n).
     */
    public static Map<Integer, Integer> factorize(int n) {
        Map<Integer, Integer> factors = new TreeMap<>();
        // Try each possible divisor d starting from 2.
        // Only need d <= sqrt(n) because if n has no factor ≤ sqrt(n), n is prime.
        for (int d = 2; (long) d * d <= n; d++) {
            while (n % d == 0) {
                factors.merge(d, 1, Integer::sum);  // increment exponent
                n /= d;
            }
        }
        // If n > 1 at this point, n itself is a prime factor.
        if (n > 1) factors.merge(n, 1, Integer::sum);
        return factors;
    }

    /** Converts a factorization map to a readable string like "2^3 × 3^2 × 5 × 7" */
    public static String factorString(Map<Integer, Integer> factors) {
        StringBuilder sb = new StringBuilder();
        for (var entry : factors.entrySet()) {
            if (sb.length() > 0) sb.append(" × ");
            sb.append(entry.getKey());
            if (entry.getValue() > 1) sb.append("^").append(entry.getValue());
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        int[] testNums = {2, 12, 84, 100, 2520, 97, 1000, 7919};
        for (int n : testNums) {
            var factors = factorize(n);
            System.out.printf("  %5d = %s%n", n, factorString(factors));
        }
    }
}
```

**Sample output:**
```
      2 = 2
     12 = 2^2 × 3
     84 = 2^2 × 3 × 7
    100 = 2^2 × 5^2
   2520 = 2^3 × 3^2 × 5 × 7
     97 = 97
   1000 = 2^3 × 5^3
   7919 = 7919
```

### Example 3: Existence Proof by Strong Induction — Combined

**Problem:** Prove that every integer $n > 1$ has a prime factorization.

**Proof (Strong Induction).**

*Base case:* $n = 2$ is prime, so its factorization is just $\{2\}$. ✓

*Inductive step:* Assume every integer $k$ with $2 \leq k < n$ has a prime factorization. Consider $n$:
- **Case 1:** $n$ is prime. Then its factorization is $\{n\}$.
- **Case 2:** $n$ is composite. Then $n = a \cdot b$ with $2 \leq a, b < n$. By the inductive hypothesis, $a = p_1^{e_1} \cdots p_j^{e_j}$ and $b = q_1^{f_1} \cdots q_k^{f_k}$. Combining these gives a prime factorization of $n$.

By strong induction, every $n > 1$ has a prime factorization. $\blacksquare$

### Example 4: CRT — Solving Simultaneous Congruences

**Problem:** Solve $x \equiv 2 \pmod{3}$ and $x \equiv 3 \pmod{5}$.

**Solution:**

Step 1: Verify $\gcd(3, 5) = 1$. ✓

Step 2: Find Bézout coefficients: $3s + 5t = 1$. By inspection (or extended GCD), $s = 2, t = -1$: $3(2) + 5(-1) = 1$. ✓

Step 3: Compute $x = a \cdot nt + b \cdot ms = 2 \cdot 5 \cdot (-1) + 3 \cdot 3 \cdot 2 = -10 + 18 = 8$.

Step 4: Reduce: $x \equiv 8 \pmod{15}$.

**Verification:** $8 \bmod 3 = 2$ ✓ and $8 \bmod 5 = 3$ ✓. $\blacksquare$

### Example 5: CRT Correctness Proof

**Problem:** Prove that $x = a \cdot nt + b \cdot ms$ solves the system when $ms + nt = 1$.

**Proof.** Check the first congruence:
$$x = a \cdot nt + b \cdot ms \equiv a \cdot nt \pmod{m}$$
(since $m \mid ms$, the term $b \cdot ms \equiv 0 \pmod{m}$).

Now $nt = 1 - ms$, so $nt \equiv 1 \pmod{m}$. Therefore $x \equiv a \cdot 1 = a \pmod{m}$. ✓

By symmetry, $x \equiv b \pmod{n}$. ✓

**Uniqueness:** If $x_1$ and $x_2$ both solve the system, then $m \mid (x_1 - x_2)$ and $n \mid (x_1 - x_2)$. Since $\gcd(m, n) = 1$, $mn \mid (x_1 - x_2)$, so $x_1 \equiv x_2 \pmod{mn}$. $\blacksquare$

---

## Proof Techniques Spotlight

### Strong Induction vs. Ordinary Induction

| Feature | Ordinary Induction | Strong Induction |
|---------|--------------------|------------------|
| Hypothesis | Assume $P(k)$ | Assume $P(2), P(3), \ldots, P(k)$ |
| Use | When $P(k+1)$ follows from $P(k)$ alone | When $P(k+1)$ needs earlier values (e.g., factors of $k+1$ may be much smaller than $k$) |
| Template | Base → Assume $P(k)$ → Show $P(k+1)$ | Base → Assume $P(j)$ for all $2 \leq j \leq k$ → Show $P(k+1)$ |

**Why strong induction for FTA:** When $n$ is composite ($n = ab$), the factors $a$ and $b$ may be much less than $n - 1$. Ordinary induction gives us only $P(n-1)$, but strong induction gives us $P(a)$ and $P(b)$.

### Constructive Proofs

The CRT proof is **constructive**: it doesn't just assert a solution exists; it gives an explicit formula. This is directly translatable to code — the mathematical construction *is* the algorithm.

---

## Java Deep Dive

```java
import java.util.*;

public class CRTandFactorization {

    // --- Prime Factorization ---

    public static Map<Integer, Integer> factorize(int n) {
        Map<Integer, Integer> factors = new TreeMap<>();
        for (int d = 2; (long) d * d <= n; d++) {
            while (n % d == 0) { factors.merge(d, 1, Integer::sum); n /= d; }
        }
        if (n > 1) factors.merge(n, 1, Integer::sum);
        return factors;
    }

    /** Reconstructs n from its factorization: product of p^e */
    public static int fromFactors(Map<Integer, Integer> factors) {
        int product = 1;
        for (var entry : factors.entrySet()) {
            for (int i = 0; i < entry.getValue(); i++) product *= entry.getKey();
        }
        return product;
    }

    /**
     * Computes LCM from prime factorizations:
     * lcm(a,b) uses max exponent of each prime.
     */
    public static int lcmFromFactors(int a, int b) {
        var fa = factorize(a);
        var fb = factorize(b);
        Map<Integer, Integer> merged = new TreeMap<>(fa);
        for (var entry : fb.entrySet()) {
            merged.merge(entry.getKey(), entry.getValue(), Math::max);
        }
        return fromFactors(merged);
    }

    // --- GCD and Extended GCD ---

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

    // --- Chinese Remainder Theorem ---

    /**
     * Solves: x ≡ a (mod m) and x ≡ b (mod n), where gcd(m,n) = 1.
     * Returns x in [0, m*n).
     *
     * Algorithm: Find s,t with ms + nt = 1 (Bézout).
     *            x = a*n*t + b*m*s
     */
    public static int crt(int a, int m, int b, int n) {
        if (gcd(m, n) != 1)
            throw new IllegalArgumentException("Moduli must be coprime");
        int[] bezout = extendedGcd(m, n);
        int s = bezout[1]; // m*s + n*t = 1
        int t = bezout[2];
        // x = a*n*t + b*m*s
        long x = (long) a * n * t + (long) b * m * s;
        return Math.floorMod((int) (x % ((long) m * n)), m * n);
    }

    /**
     * Generalized CRT for multiple congruences:
     * x ≡ a[0] (mod m[0]), x ≡ a[1] (mod m[1]), ..., x ≡ a[k-1] (mod m[k-1])
     * All m[i] must be pairwise coprime.
     */
    public static int crtMultiple(int[] remainders, int[] moduli) {
        int x = remainders[0];
        int mod = moduli[0];
        for (int i = 1; i < remainders.length; i++) {
            x = crt(x, mod, remainders[i], moduli[i]);
            mod *= moduli[i];
        }
        return Math.floorMod(x, mod);
    }

    // --- Simple RSA Demo ---

    /** Modular exponentiation: base^exp mod m */
    public static long modPow(long base, long exp, long mod) {
        long result = 1;
        base = ((base % mod) + mod) % mod;
        while (exp > 0) {
            if (exp % 2 == 1) result = (result * base) % mod;
            base = (base * base) % mod;
            exp /= 2;
        }
        return result;
    }

    /**
     * Simplified RSA demonstration with small primes.
     * NOT for real cryptography — uses small numbers for illustration.
     */
    public static void rsaDemo() {
        System.out.println("=== Simplified RSA Demo ===\n");

        // Step 1: Choose two primes
        int p = 61, q = 53;
        int n = p * q;                // n = 3233 (public modulus)
        int phi = (p - 1) * (q - 1); // φ(n) = 3120

        System.out.println("p = " + p + ", q = " + q);
        System.out.println("n = p*q = " + n);
        System.out.println("φ(n) = (p-1)(q-1) = " + phi);

        // Step 2: Choose public exponent e with gcd(e, φ(n)) = 1
        int e = 17;
        assert gcd(e, phi) == 1 : "e must be coprime to φ(n)";
        System.out.println("Public exponent e = " + e);

        // Step 3: Compute private exponent d = e^(-1) mod φ(n)
        int[] bezout = extendedGcd(e, phi);
        int d = Math.floorMod(bezout[1], phi);
        System.out.println("Private exponent d = " + d);
        System.out.println("Check: e*d mod φ(n) = " + ((long) e * d % phi));

        // Step 4: Encrypt and decrypt
        int message = 42;
        long encrypted = modPow(message, e, n);
        long decrypted = modPow(encrypted, d, n);

        System.out.println("\nMessage: " + message);
        System.out.println("Encrypted: " + encrypted);
        System.out.println("Decrypted: " + decrypted);
        assert decrypted == message;
        System.out.println("Decryption successful!");
    }

    // --- Main ---

    public static void main(String[] args) {
        System.out.println("=== Prime Factorization ===\n");
        for (int n : new int[]{84, 360, 2520, 97, 1000}) {
            var f = factorize(n);
            System.out.printf("  %d = %s  (reconstructed: %d)%n", n,
                factorString(f), fromFactors(f));
        }

        System.out.println("\n=== LCM via Factorization ===\n");
        int[][] lcmTests = {{12, 18}, {35, 15}, {100, 75}};
        for (int[] pair : lcmTests) {
            System.out.printf("  lcm(%d, %d) = %d%n", pair[0], pair[1],
                lcmFromFactors(pair[0], pair[1]));
        }

        System.out.println("\n=== Chinese Remainder Theorem ===\n");
        // x ≡ 2 (mod 3) and x ≡ 3 (mod 5)
        int x1 = crt(2, 3, 3, 5);
        System.out.printf("  x ≡ 2 (mod 3), x ≡ 3 (mod 5) → x = %d (mod 15)%n", x1);
        assert x1 % 3 == 2 && x1 % 5 == 3;

        // Sunzi's original problem: x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
        int x2 = crtMultiple(new int[]{2, 3, 2}, new int[]{3, 5, 7});
        System.out.printf("  x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7) → x = %d (mod 105)%n", x2);
        assert x2 % 3 == 2 && x2 % 5 == 3 && x2 % 7 == 2;

        System.out.println();
        rsaDemo();
    }

    static String factorString(Map<Integer, Integer> factors) {
        StringBuilder sb = new StringBuilder();
        for (var entry : factors.entrySet()) {
            if (sb.length() > 0) sb.append(" × ");
            sb.append(entry.getKey());
            if (entry.getValue() > 1) sb.append("^").append(entry.getValue());
        }
        return sb.toString();
    }
}
```

---

## Historical Context

**Euclid** (~300 BC) proved that there are infinitely many primes but did not state the Fundamental Theorem of Arithmetic explicitly. The formal proof of unique factorization was first given by **Carl Friedrich Gauss** in *Disquisitiones Arithmeticae* (1801).

The **Chinese Remainder Theorem** originates from **Sunzi's** *Sunzi Suanjing* (3rd century CE). The classic problem: "Find a number that leaves remainder 2 when divided by 3, remainder 3 when divided by 5, and remainder 2 when divided by 7." The answer is 23 (modulo 105).

**RSA** (Rivest, Shamir, Adleman, 1977) is the most famous public-key cryptosystem. Its security relies on the difficulty of factoring large numbers: given $n = pq$ (product of two large primes), finding $p$ and $q$ is computationally hard. The encryption uses modular exponentiation: $c = m^e \bmod n$, and decryption inverts using the private key: $m = c^d \bmod n$, where $ed \equiv 1 \pmod{\phi(n)}$.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** Factor $360$ into primes.

**A2.** True or false: If $p$ is prime and $p \mid 6n$, then $p \mid n$ or $p \leq 3$.

**A3.** The CRT says the system $x \equiv 1 \pmod{4}$, $x \equiv 2 \pmod{6}$ has a unique solution modulo 24. What's wrong with this claim?

**A4.** In RSA, why is it important that factoring $n = pq$ is hard?

### Slide Set B: Proof Problems

**B1.** Prove by strong induction: every integer $n > 1$ has a prime factor.

**B2.** Prove: $\text{lcm}(a, b) = ab / \gcd(a, b)$ using prime factorization.

**B3.** Prove the CRT for the case $m = 3, n = 5$: the system $x \equiv a \pmod{3}$, $x \equiv b \pmod{5}$ has a unique solution modulo 15.

### Slide Set C: Java Coding Problems

**C1.** Write a method `Map<Integer, Integer> factorize(int n)` returning a prime-to-exponent map. Verify that `fromFactors(factorize(n)) == n` for $n = 2, \ldots, 10000$.

**C2.** Implement a CRT solver for two congruences. Test with Sunzi's original problem.

**C3.** Write a simplified RSA demo that encrypts and decrypts a single integer message.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Factor $n = 13860$ into primes. Verify by reconstructing the product.

**DM2.** Prove: If $p$ is prime and $p \mid a^2$, then $p \mid a$.

**DM3.** Use the CRT to solve: $x \equiv 3 \pmod{7}$ and $x \equiv 5 \pmod{11}$.

**DM4.** Prove that $\text{lcm}(a, b) \cdot \gcd(a, b) = ab$ for all positive integers $a, b$.

**DM5.** Prove: If $n$ has $k$ distinct prime factors, then $n \geq 2^k$.

**DM6.** Prove that $\sqrt{2}$ is irrational using unique prime factorization. *(If $\sqrt{2} = p/q$, then $2q^2 = p^2$; compare the number of 2s in each factorization.)*

**DM7.** Solve the system $x \equiv 1 \pmod{2}$, $x \equiv 2 \pmod{3}$, $x \equiv 3 \pmod{5}$, $x \equiv 4 \pmod{7}$.

### Java Programming Problems

**JP1.** Write `Map<Integer, Integer> factorize(int n)` and verify FTA for $n = 2, \ldots, 100000$: check that all factors are prime and the product equals $n$.

**JP2.** Implement `int lcm(int a, int b)` using the formula $\text{lcm}(a,b) = ab / \gcd(a,b)$. Handle overflow by dividing first: `a / gcd(a,b) * b`.

**JP3.** Implement the generalized CRT for an array of congruences (pairwise coprime moduli). Verify that the solution satisfies all congruences.

**JP4.** Write a simplified RSA key-generation, encryption, and decryption program. Use primes $p$ and $q$ with $pq < 10^6$. Encrypt each letter of a short message individually.

**JP5.** Given two factorizations (as maps), write methods to compute the GCD and LCM by taking min/max exponents of each prime. Verify against the direct GCD/LCM methods.

**JP6.** Write a method that determines whether an integer $n$ is a **perfect power** (i.e., $n = a^k$ for some $a, k \geq 2$) using its prime factorization.

### Bridge Problems

**BR1.** Prove that the trial division algorithm for prime factorization is correct and terminates. Then implement it and verify correctness for $n = 2, \ldots, 50000$.

**BR2.** Implement a CRT-based method for computing large factorials modulo a product of small primes. For example, compute $100! \bmod 105$ where $105 = 3 \times 5 \times 7$, by computing $100! \bmod 3$, $100! \bmod 5$, and $100! \bmod 7$ separately and combining with CRT.

**BR3.** Write a program that empirically measures the distribution of prime factorization lengths (number of prime factors with multiplicity) for all integers from 2 to $10^6$, and print a histogram. What's the average number of prime factors?

---

## Solutions

### Discrete Math Solutions

**DM1.** $13860 = 2^2 \cdot 3^2 \cdot 5 \cdot 7 \cdot 11$. Check: $4 \cdot 9 \cdot 5 \cdot 7 \cdot 11 = 4 \cdot 9 \cdot 385 = 36 \cdot 385 = 13860$. ✓

**DM2.** Write $a = p_1^{e_1} \cdots p_k^{e_k}$. Then $a^2 = p_1^{2e_1} \cdots p_k^{2e_k}$. If $p \mid a^2$, then $p$ appears in the factorization of $a^2$, so $p = p_i$ for some $i$. Then $p \mid a$ (since $e_i \geq 1$). $\blacksquare$

**DM3.** $\gcd(7, 11) = 1$. Extended GCD: $7(-3) + 11(2) = -21 + 22 = 1$, so $s = -3, t = 2$.
$x = 3 \cdot 11 \cdot 2 + 5 \cdot 7 \cdot (-3) = 66 - 105 = -39 \equiv 38 \pmod{77}$.
Check: $38 \bmod 7 = 3$ ✓, $38 \bmod 11 = 5$ ✓.

**DM4.** Write $a = \prod p_i^{a_i}$ and $b = \prod p_i^{b_i}$. Then $\gcd(a,b) = \prod p_i^{\min(a_i, b_i)}$ and $\text{lcm}(a,b) = \prod p_i^{\max(a_i, b_i)}$. So $\gcd(a,b) \cdot \text{lcm}(a,b) = \prod p_i^{\min(a_i,b_i) + \max(a_i,b_i)} = \prod p_i^{a_i + b_i} = ab$. $\blacksquare$

**DM5.** By induction on $k$. Base: $k = 1$, $n \geq 2 = 2^1$. Inductive step: If $n$ has $k + 1$ distinct primes, then $n = p \cdot m$ where $m$ has at least $k$ distinct primes. By hypothesis, $m \geq 2^k$. Since $p \geq 2$, $n = pm \geq 2 \cdot 2^k = 2^{k+1}$. $\blacksquare$

**DM6.** Suppose $\sqrt{2} = p/q$ with $\gcd(p, q) = 1$. Then $p^2 = 2q^2$. The prime 2 appears an even number of times in $p^2$, but an odd number of times in $2q^2$ (one extra 2). This contradicts unique factorization. $\blacksquare$

**DM7.** Solve pairwise:
- $x \equiv 1 \pmod{2}$, $x \equiv 2 \pmod{3}$: $x \equiv 5 \pmod{6}$.
- $x \equiv 5 \pmod{6}$, $x \equiv 3 \pmod{5}$: $x \equiv 23 \pmod{30}$.
- $x \equiv 23 \pmod{30}$, $x \equiv 4 \pmod{7}$: $x \equiv 53 \pmod{210}$.

Check: $53 \bmod 2 = 1$ ✓, $53 \bmod 3 = 2$ ✓, $53 \bmod 5 = 3$ ✓, $53 \bmod 7 = 4$ ✓.

### Java Solutions

**JP1.**
```java
public static void verifyFTA(int limit) {
    for (int n = 2; n <= limit; n++) {
        var factors = factorize(n);
        int product = 1;
        for (var entry : factors.entrySet()) {
            assert isPrime(entry.getKey()) : entry.getKey() + " not prime";
            for (int i = 0; i < entry.getValue(); i++) product *= entry.getKey();
        }
        assert product == n : "Product mismatch for " + n;
    }
}
```

**JP2.**
```java
public static int lcm(int a, int b) {
    return a / gcd(a, b) * b;  // divide first to reduce overflow risk
}
```

**JP3.**
```java
public static int crtMultiple(int[] remainders, int[] moduli) {
    int x = remainders[0], mod = moduli[0];
    for (int i = 1; i < remainders.length; i++) {
        x = crt(x, mod, remainders[i], moduli[i]);
        mod *= moduli[i];
    }
    return Math.floorMod(x, mod);
}
```

**JP4.**
```java
public static void rsaEncryptMessage(String msg, int p, int q) {
    int n = p * q;
    int phi = (p - 1) * (q - 1);
    int e = 17;
    while (gcd(e, phi) != 1) e += 2;
    int d = Math.floorMod(extendedGcd(e, phi)[1], phi);

    System.out.println("Public key: (n=" + n + ", e=" + e + ")");
    System.out.println("Private key: d=" + d);

    StringBuilder encrypted = new StringBuilder();
    StringBuilder decrypted = new StringBuilder();
    for (char c : msg.toCharArray()) {
        long enc = modPow(c, e, n);
        long dec = modPow(enc, d, n);
        encrypted.append(enc).append(" ");
        decrypted.append((char) dec);
    }
    System.out.println("Encrypted: " + encrypted);
    System.out.println("Decrypted: " + decrypted);
}
```

**JP5.**
```java
public static Map<Integer, Integer> gcdFromFactors(
        Map<Integer, Integer> fa, Map<Integer, Integer> fb) {
    Map<Integer, Integer> result = new TreeMap<>();
    for (int p : fa.keySet()) {
        if (fb.containsKey(p)) {
            result.put(p, Math.min(fa.get(p), fb.get(p)));
        }
    }
    return result;
}

public static Map<Integer, Integer> lcmFromFactors(
        Map<Integer, Integer> fa, Map<Integer, Integer> fb) {
    Map<Integer, Integer> result = new TreeMap<>(fa);
    for (var entry : fb.entrySet()) {
        result.merge(entry.getKey(), entry.getValue(), Math::max);
    }
    return result;
}
```

**JP6.**
```java
public static boolean isPerfectPower(int n) {
    var factors = factorize(n);
    if (factors.isEmpty()) return false;
    int g = 0;
    for (int exp : factors.values()) g = gcd(g, exp);
    return g >= 2;
}
// Examples: 8 = 2^3 → gcd(3) = 3 ≥ 2 → true
//           12 = 2^2 × 3 → gcd(2,1) = 1 < 2 → false
//           64 = 2^6 → gcd(6) = 6 ≥ 2 → true
```

### Bridge Solutions

**BR1.** *Correctness:* The loop extracts factor $d$ as many times as it divides $n$. After the inner `while`, $d \nmid n$, so $d$ is fully extracted. After the outer `for` loop, all factors $\leq \sqrt{n_{\text{current}}}$ are extracted. If $n > 1$ remains, it must be prime (if it were composite, it would have a factor $\leq$ its own square root, contradicting the loop's completion).

*Termination:* Each inner `while` iteration strictly reduces $n$. The outer loop's bound $d^2 \leq n$ shrinks each iteration. $\blacksquare$

**BR2.**
```java
public static int factorialModCRT(int n, int[] primes) {
    int[] remainders = new int[primes.length];
    for (int i = 0; i < primes.length; i++) {
        long factMod = 1;
        for (int j = 1; j <= n; j++) {
            factMod = (factMod * j) % primes[i];
        }
        remainders[i] = (int) factMod;
    }
    return crtMultiple(remainders, primes);
}
// For 100! mod 105: 100! mod 3 = 0, 100! mod 5 = 0, 100! mod 7 = 0
// So 100! mod 105 = 0 (since 3, 5, 7 all divide 100!)
```

**BR3.**
```java
public static void primeFactorHistogram(int limit) {
    int[] counts = new int[30]; // counts[k] = how many n have k prime factors
    long totalFactors = 0;
    for (int n = 2; n <= limit; n++) {
        int numFactors = 0;
        int temp = n;
        for (int d = 2; (long) d * d <= temp; d++) {
            while (temp % d == 0) { numFactors++; temp /= d; }
        }
        if (temp > 1) numFactors++;
        counts[numFactors]++;
        totalFactors += numFactors;
    }
    System.out.printf("Average # prime factors (2..%d): %.2f%n",
        limit, (double) totalFactors / (limit - 1));
    for (int k = 1; k < counts.length && counts[k] > 0; k++) {
        System.out.printf("  %2d factors: %d numbers%n", k, counts[k]);
    }
}
```
