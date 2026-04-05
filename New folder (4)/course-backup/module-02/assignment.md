# Module 2 – Assignment: Remainders, Modular Arithmetic and Factorization

## Assignment Overview

**Due:** End of Module 2  
**Weight:** Integrative assignment (synthesizes Modules 1–2)  
**Format:** PDF for proofs + `Module2Assignment.java` for code  

This integrative assignment synthesizes Modules 1 and 2. You will prove divisibility theorems, implement modular arithmetic functions, connect the quotient-remainder theorem to hashing, and write an essay on how modular arithmetic is used in real systems.

---

## Part A: Mathematical Proofs (50 points)

### Problem A1 (10 points) — Quotient-Remainder Applications

**(a)** Prove: For any integer $n$, $n^2 \bmod 3 \in \{0, 1\}$.

**(b)** Prove: For any odd integer $n$, $n^2 \equiv 1 \pmod{8}$.

### Problem A2 (10 points) — Divisibility and Congruence

**(a)** Prove the cancellation law: if $\gcd(c, m) = 1$ and $ac \equiv bc \pmod{m}$, then $a \equiv b \pmod{m}$.

**(b)** Give a counterexample showing that cancellation can fail when $\gcd(c, m) > 1$.

### Problem A3 (10 points) — Modular Arithmetic Properties

**(a)** Prove: $(a + b) \bmod m = ((a \bmod m) + (b \bmod m)) \bmod m$.

**(b)** Prove: $(a \cdot b) \bmod m = ((a \bmod m) \cdot (b \bmod m)) \bmod m$.

**(c)** Use these properties to compute $17^{50} \bmod 7$ by hand (reduce $17 \bmod 7$ first, then use patterns).

### Problem A4 (10 points) — Chinese Remainder Theorem

**(a)** Prove the CRT for the general case: if $\gcd(m, n) = 1$, the system $x \equiv a \pmod{m}$, $x \equiv b \pmod{n}$ has a unique solution modulo $mn$.

**(b)** Solve: $x \equiv 5 \pmod{7}$, $x \equiv 3 \pmod{11}$, $x \equiv 8 \pmod{13}$.

### Problem A5 (10 points) — Synthesis: Irrationality via FTA

Prove that $\sqrt{6}$ is irrational using the Fundamental Theorem of Arithmetic.

*(Hint: If $\sqrt{6} = p/q$, then $6q^2 = p^2$. Count the number of times primes 2 and 3 appear in each side.)*

---

## Part B: Java Programming (50 points)

### Problem B1 (10 points) — Modular Arithmetic Library

Implement a class with the following static methods:
- `int mod(int a, int m)` — mathematical mod (always in $[0, m)$).
- `int modAdd(int a, int b, int m)` — modular addition.
- `int modMul(int a, int b, int m)` — modular multiplication (use `long` to avoid overflow).
- `int modPow(int base, int exp, int m)` — modular exponentiation by repeated squaring.
- `int modInverse(int a, int m)` — modular inverse via extended GCD.

Verify: for $m = 7$ and all $1 \leq a < 7$, `modMul(a, modInverse(a, 7), 7) == 1`.

### Problem B2 (10 points) — Hashing Analysis

Implement a hash function `int hash(String key, int tableSize)` that sums the character values modulo `tableSize`.

Test with these 30 words:
```
apple banana cherry date elderberry fig grape honeydew kiwi lemon
mango nectarine orange papaya quince raspberry strawberry tangerine
ugli vanilla watermelon xigua yakifruit zucchini almond blueberry
cashew dragonfruit eggplant fennel
```

1. Hash all 30 words into a table of size 7 (prime). Print each bucket.
2. Hash all 30 words into a table of size 8 (non-prime). Print each bucket.
3. For each table size, count: total collisions, max bucket size, number of empty buckets.
4. Repeat for table sizes 11, 13, 16, 20.

### Problem B3 (10 points) — CRT Application: Secret Splitting

Implement a simple secret-sharing scheme using CRT:
1. Choose a secret integer $S$ (e.g., $S = 42$).
2. Choose three pairwise coprime moduli (e.g., $m_1 = 7, m_2 = 11, m_3 = 13$).
3. Compute shares: $s_1 = S \bmod m_1$, $s_2 = S \bmod m_2$, $s_3 = S \bmod m_3$.
4. Reconstruct $S$ from the three shares using CRT.
5. Verify that removing any one share makes reconstruction impossible (there are multiple solutions modulo $m_i \cdot m_j$ for any two moduli).

### Problem B4 (10 points) — Prime Factorization and Number-Theoretic Functions

Implement:
- `Map<Integer, Integer> factorize(int n)` — prime factorization.
- `int numDivisors(int n)` — number of divisors using the formula $\tau(n) = \prod (e_i + 1)$.
- `int sumDivisors(int n)` — sum of divisors using the formula $\sigma(n) = \prod \frac{p_i^{e_i+1} - 1}{p_i - 1}$.
- `boolean isPerfect(int n)` — checks if $\sigma(n) = 2n$ (perfect number).

Find all perfect numbers up to 10000. Print each along with its factorization and divisor sum.

### Problem B5 (10 points) — Essay: Modular Arithmetic in Computing

Write a short essay (15–25 sentences) explaining how modular arithmetic is used in three of the following areas. For each area, describe the mathematical principle, give a concrete example, and explain why it works.

1. **Hash tables** — how `key % tableSize` distributes keys; why prime sizes help.
2. **Checksums** — ISBN-13, Luhn algorithm, or CRC.
3. **Cryptography** — RSA key generation, encryption, and decryption.
4. **Circular data structures** — ring buffers, round-robin scheduling.
5. **Calendar calculations** — Zeller's congruence, day-of-week algorithms.

---

## Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| **A1** QR applications | 10 | Correct case analysis, valid proof structure |
| **A2** Cancellation law | 10 | Correct proof using Euclid's Lemma; valid counterexample |
| **A3** Modular properties | 10 | Complete proofs; correct hand computation |
| **A4** CRT | 10 | Rigorous existence/uniqueness proof; correct solution to system |
| **A5** Irrationality | 10 | Correct use of FTA; clear contradiction argument |
| **B1** Mod library | 10 | All methods correct; overflow handled; verification passes |
| **B2** Hashing | 10 | Correct implementation; complete analysis; thoughtful comparison |
| **B3** Secret splitting | 10 | CRT reconstruction works; non-reconstructability demonstrated |
| **B4** Factorization | 10 | Correct formulas; perfect numbers found; clean output |
| **B5** Essay | 10 | Three areas covered; mathematical connection clear; concrete examples |

---

## Solution Key

### Part A Solutions

**A1(a).** Any integer $n$ has $n \bmod 3 \in \{0, 1, 2\}$. Compute $n^2 \bmod 3$ for each:
- $n \equiv 0$: $n^2 \equiv 0$.
- $n \equiv 1$: $n^2 \equiv 1$.
- $n \equiv 2$: $n^2 \equiv 4 \equiv 1$.
So $n^2 \bmod 3 \in \{0, 1\}$. $\blacksquare$

**A1(b).** Let $n = 2k + 1$ (odd). Then $n^2 = 4k^2 + 4k + 1 = 4k(k+1) + 1$. Since one of $k, k+1$ is even, $k(k+1)$ is even, say $k(k+1) = 2j$. So $n^2 = 8j + 1 \equiv 1 \pmod{8}$. $\blacksquare$

**A2(a).** $ac \equiv bc \pmod{m}$ means $m \mid c(a - b)$. Since $\gcd(c, m) = 1$, by Euclid's Lemma $m \mid (a - b)$, so $a \equiv b \pmod{m}$. $\blacksquare$

**A2(b).** $2 \cdot 3 \equiv 2 \cdot 6 \pmod{6}$ (both are $\equiv 0$), but $3 \not\equiv 6 \pmod{6}$ since $6 - 3 = 3$ and $6 \nmid 3$. Here $\gcd(2, 6) = 2 \neq 1$.

**A3(a).** Write $a = mq_1 + r_1$ and $b = mq_2 + r_2$ where $r_1 = a \bmod m, r_2 = b \bmod m$. Then $a + b = m(q_1 + q_2) + (r_1 + r_2)$. The remainder of $a + b$ divided by $m$ equals $(r_1 + r_2) \bmod m$. $\blacksquare$

**A3(b).** Similarly, $ab = (mq_1 + r_1)(mq_2 + r_2) = m(mq_1 q_2 + q_1 r_2 + q_2 r_1) + r_1 r_2$, so $ab \bmod m = (r_1 r_2) \bmod m$. $\blacksquare$

**A3(c).** $17 \equiv 3 \pmod{7}$. Powers of 3 mod 7: $3^1 = 3$, $3^2 = 2$, $3^3 = 6$, $3^4 = 4$, $3^5 = 5$, $3^6 = 1$. Period is 6. $50 = 6 \times 8 + 2$, so $3^{50} \equiv 3^2 = 2 \pmod{7}$. $\blacksquare$

**A4(a).** *Existence:* Let $ms + nt = 1$ (Bézout). Set $x = ant + bms$. Then $x \equiv a \cdot nt \equiv a \cdot 1 = a \pmod{m}$ (since $ms \equiv 0$, $nt \equiv 1 \pmod{m}$). Similarly $x \equiv b \pmod{n}$.
*Uniqueness:* If $x_1, x_2$ both satisfy the system, then $m \mid (x_1 - x_2)$ and $n \mid (x_1 - x_2)$. Since $\gcd(m,n) = 1$, $mn \mid (x_1 - x_2)$. $\blacksquare$

**A4(b).** Solve pairwise:
- $x \equiv 5 \pmod{7}$, $x \equiv 3 \pmod{11}$: $7s + 11t = 1$ gives $s = -3, t = 2$. $x = 5 \cdot 11 \cdot 2 + 3 \cdot 7 \cdot (-3) = 110 - 63 = 47 \pmod{77}$.
- $x \equiv 47 \pmod{77}$, $x \equiv 8 \pmod{13}$: $77s + 13t = 1$ gives $s = -1, t = 6$. $x = 47 \cdot 13 \cdot 6 + 8 \cdot 77 \cdot (-1) = 3666 - 616 = 3050 \equiv 47 \pmod{1001}$. Wait, let me recompute: $3050 \bmod 1001 = 3050 - 3 \times 1001 = 3050 - 3003 = 47$.
Check: $47 \bmod 7 = 5$ ✓, $47 \bmod 11 = 3$ ✓, $47 \bmod 13 = 8$ ✓.

Answer: $x \equiv 47 \pmod{1001}$.

**A5.** Suppose $\sqrt{6} = p/q$ with $\gcd(p, q) = 1$. Then $6q^2 = p^2$.

Consider the exponent of 2 in each side's prime factorization:
- Left: $6 = 2 \cdot 3$, so the exponent of 2 in $6q^2$ is $1 + 2v_2(q)$ (odd).
- Right: the exponent of 2 in $p^2$ is $2v_2(p)$ (even).

An odd number cannot equal an even number. Contradiction. $\blacksquare$

### Part B Solutions

**B1.**
```java
public class ModArithmetic {
    public static int mod(int a, int m) { return Math.floorMod(a, m); }

    public static int modAdd(int a, int b, int m) {
        return mod(mod(a, m) + mod(b, m), m);
    }

    public static int modMul(int a, int b, int m) {
        return (int)(((long) mod(a,m) * mod(b,m)) % m);
    }

    public static int modPow(int base, int exp, int m) {
        long result = 1, b = mod(base, m);
        while (exp > 0) {
            if (exp % 2 == 1) result = (result * b) % m;
            b = (b * b) % m;
            exp /= 2;
        }
        return (int) result;
    }

    public static int modInverse(int a, int m) {
        int[] r = extendedGcd(mod(a, m), m);
        if (r[0] != 1) throw new ArithmeticException("No inverse");
        return mod(r[1], m);
    }

    static int[] extendedGcd(int a, int b) {
        if (b == 0) return new int[]{a, 1, 0};
        int[] r = extendedGcd(b, a % b);
        return new int[]{r[0], r[2], r[1] - (a/b)*r[2]};
    }
}
```

**B2.**
```java
public static void hashAnalysis() {
    String[] words = {"apple","banana","cherry","date","elderberry",
        "fig","grape","honeydew","kiwi","lemon","mango","nectarine",
        "orange","papaya","quince","raspberry","strawberry","tangerine",
        "ugli","vanilla","watermelon","xigua","yakifruit","zucchini",
        "almond","blueberry","cashew","dragonfruit","eggplant","fennel"};

    for (int tableSize : new int[]{7, 8, 11, 13, 16, 20}) {
        Map<Integer, List<String>> buckets = new TreeMap<>();
        for (String w : words) {
            int h = 0;
            for (char c : w.toCharArray()) h = (h + c) % tableSize;
            buckets.computeIfAbsent(h, k -> new ArrayList<>()).add(w);
        }
        int collisions = 0, maxBucket = 0, empty = tableSize - buckets.size();
        for (var entry : buckets.values()) {
            if (entry.size() > 1) collisions += entry.size() - 1;
            maxBucket = Math.max(maxBucket, entry.size());
        }
        System.out.printf("Table size %d: collisions=%d, max=%d, empty=%d%n",
            tableSize, collisions, maxBucket, empty);
    }
}
```

**B3.**
```java
public static void secretSplitting() {
    int secret = 42;
    int[] moduli = {7, 11, 13};  // pairwise coprime, product = 1001
    int[] shares = new int[3];
    for (int i = 0; i < 3; i++) shares[i] = secret % moduli[i];
    System.out.printf("Secret: %d, Shares: %d, %d, %d%n",
        secret, shares[0], shares[1], shares[2]);

    // Reconstruct from all 3
    int recovered = crtMultiple(shares, moduli);
    System.out.println("Recovered: " + recovered);
    assert recovered == secret;

    // Show that 2 shares are insufficient (multiple solutions)
    System.out.println("With only shares 1,2 (mod 7,11):");
    int x = crt2(shares[0], 7, shares[1], 11);  // solution mod 77
    System.out.printf("  x ≡ %d (mod 77) — but %d and %d both satisfy this%n",
        x, x, x + 77);
    // Both x and x+77 satisfy the first two congruences but may differ mod 13
}
```

**B4.**
```java
public static int numDivisors(int n) {
    var f = factorize(n);
    int count = 1;
    for (int e : f.values()) count *= (e + 1);
    return count;
}

public static int sumDivisors(int n) {
    var f = factorize(n);
    int sum = 1;
    for (var entry : f.entrySet()) {
        int p = entry.getKey(), e = entry.getValue();
        int term = 0;
        for (int i = 0; i <= e; i++) term += (int) Math.pow(p, i);
        sum *= term;
    }
    return sum;
}

public static void findPerfectNumbers() {
    for (int n = 2; n <= 10000; n++) {
        if (sumDivisors(n) == 2 * n) {
            System.out.printf("  %d = %s, σ(%d) = %d%n",
                n, factorize(n), n, sumDivisors(n));
        }
    }
    // Expected: 6, 28, 496, 8128
}
```
