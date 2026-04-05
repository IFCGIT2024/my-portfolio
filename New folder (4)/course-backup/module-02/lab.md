# Module 2 – Lab: Modular Arithmetic and Factorization

## Lab Overview

**Duration:** ~90 minutes  
**Prerequisites:** Module 2 Classes 1–3  
**Deliverables:** A working Java file `Module2Lab.java` with all methods implemented and tested.

In this lab you will implement modular arithmetic operations, verify the quotient-remainder theorem, build a CRT solver, and create a prime factorization tool — connecting each piece of code to its mathematical foundation.

---

## Part 1: Quotient-Remainder Operations (20 min)

### Exercise 1.1: Mathematical vs. Java Remainder

Write a method `int mathMod(int n, int d)` that always returns the mathematical remainder in $[0, d)$, even for negative $n$.

Test with: $n \in \{-17, -7, 0, 13, 25\}$ and $d \in \{3, 5, 7\}$.

For each test, print: `n`, `d`, Java's `n % d`, your `mathMod(n, d)`, and verify $n = d \cdot q + r$ with $0 \leq r < d$.

### Exercise 1.2: Digit Extraction

Write a method `int[] digits(int n, int base)` that returns the digits of $n$ in the given base (least significant first).

Algorithm: Repeatedly apply the quotient-remainder theorem — divide $n$ by `base`, the remainder is the next digit, the quotient becomes the new $n$.

Test: `digits(255, 2)` should give `{1,1,1,1,1,1,1,1}` (binary), `digits(255, 16)` gives `{15, 15}` (hex).

### Exercise 1.3: Base Conversion

Write `String toBaseString(int n, int base)` that converts $n$ to a string in the given base (using characters `0-9`, `A-Z` for digits above 9).

Test: `toBaseString(255, 16)` → `"FF"`, `toBaseString(42, 2)` → `"101010"`.

---

## Part 2: Congruence and Modular Arithmetic (25 min)

### Exercise 2.1: Congruence Checker

Write `boolean isCongruent(int a, int b, int m)`.

### Exercise 2.2: Modular Arithmetic Table

Write a method that prints the addition and multiplication tables for $\mathbb{Z}_m$. Test with $m = 5$ and $m = 7$.

### Exercise 2.3: Finding Units

Write a method `List<Integer> findUnits(int m)` that returns all invertible elements of $\mathbb{Z}_m$. Verify that the count equals Euler's totient $\phi(m)$ for $m = 2, \ldots, 50$.

### Exercise 2.4: Modular Inverse

Write `int modInverse(int a, int m)` using the extended Euclidean algorithm. Verify: for every unit $a$ in $\mathbb{Z}_m$, `(a * modInverse(a, m)) % m == 1`.

---

## Part 3: Chinese Remainder Theorem (20 min)

### Exercise 3.1: Two-Congruence CRT Solver

Implement `int crt2(int a, int m, int b, int n)` that solves $x \equiv a \pmod{m}$, $x \equiv b \pmod{n}$ when $\gcd(m, n) = 1$. Return $x \in [0, mn)$.

Test cases:
| $a$ | $m$ | $b$ | $n$ | Expected $x \bmod mn$ |
|-----|-----|-----|-----|------------------------|
| 2 | 3 | 3 | 5 | 8 |
| 1 | 4 | 3 | 5 | 13 |
| 0 | 7 | 5 | 11 | 49 |

### Exercise 3.2: Multi-Modulus CRT

Extend to `int crtMultiple(int[] a, int[] m)`. Solve Sunzi's problem: $x \equiv 2 \pmod{3}$, $x \equiv 3 \pmod{5}$, $x \equiv 2 \pmod{7}$. Expected: $x = 23$.

### Exercise 3.3: CRT Verification

For all pairs $(m, n)$ with $\gcd(m, n) = 1$ and $2 \leq m, n \leq 20$, and all $(a, b)$ with $0 \leq a < m, 0 \leq b < n$: verify that `crt2(a, m, b, n)` satisfies both congruences.

---

## Part 4: Prime Factorization (25 min)

### Exercise 4.1: Trial Division Factorizer

Implement `Map<Integer, Integer> factorize(int n)` returning a map from primes to exponents. Verify for $n = 2, \ldots, 10000$ that:
- Every key is prime.
- The product of all $p^e$ equals $n$.

### Exercise 4.2: GCD and LCM from Factorizations

Given two factorization maps, compute GCD (min exponents) and LCM (max exponents). Verify against the direct `gcd` function for 1000 random pairs.

### Exercise 4.3: Perfect Power Detector

Write `boolean isPerfectPower(int n)` — returns true if $n = a^k$ for some $a \geq 2, k \geq 2$. Use the factorization: $n$ is a perfect power iff the GCD of all exponents is $\geq 2$.

Test: $8, 27, 64, 125, 256$ → all true; $12, 18, 20, 100$ → except 100 = $10^2$, so 100 → true and others false.

---

## Extension Challenges

### Challenge A: Modular Exponentiation by Repeated Squaring

Implement `long modPow(long base, long exp, long mod)` using the binary method. Verify Fermat's Little Theorem for all primes $p \leq 100$ and all $1 \leq a < p$.

### Challenge B: Simplified RSA

Choose small primes $p, q$ (e.g., 61, 53). Compute $n = pq$, $\phi(n)$, choose $e$ coprime to $\phi(n)$, compute $d = e^{-1} \bmod \phi(n)$. Encrypt and decrypt a short numeric message.

### Challenge C: Prime Factor Distribution

For each $n$ from 2 to $10^6$, count the number of prime factors (with multiplicity). Compute the average. (Theoretical answer: this approaches $\ln \ln n + M$ where $M \approx 0.2615$ is the Mertens constant.)

---

## Starter Code

```java
import java.util.*;

public class Module2Lab {

    // ========== Part 1: Quotient-Remainder ==========

    public static int mathMod(int n, int d) {
        // TODO: return mathematical remainder in [0, d)
        return -1;
    }

    public static int[] digits(int n, int base) {
        // TODO: return digits of n in given base (least significant first)
        return new int[0];
    }

    public static String toBaseString(int n, int base) {
        // TODO: convert n to string in given base
        return "";
    }

    // ========== Part 2: Congruence ==========

    public static boolean isCongruent(int a, int b, int m) {
        // TODO
        return false;
    }

    public static void printModTable(int m, String op) {
        // TODO: print addition (op="+") or multiplication (op="*") table for Z_m
    }

    public static List<Integer> findUnits(int m) {
        // TODO: return list of invertible elements in Z_m
        return new ArrayList<>();
    }

    public static int modInverse(int a, int m) {
        // TODO: compute modular inverse using extended GCD
        return -1;
    }

    // ========== Part 3: CRT ==========

    public static int crt2(int a, int m, int b, int n) {
        // TODO: solve x ≡ a (mod m), x ≡ b (mod n) with gcd(m,n) = 1
        return -1;
    }

    public static int crtMultiple(int[] remainders, int[] moduli) {
        // TODO: generalize CRT to multiple congruences
        return -1;
    }

    // ========== Part 4: Factorization ==========

    public static Map<Integer, Integer> factorize(int n) {
        // TODO: return prime factorization as map {prime → exponent}
        return new TreeMap<>();
    }

    public static boolean isPerfectPower(int n) {
        // TODO: return true if n = a^k for some a,k >= 2
        return false;
    }

    // ========== Helpers ==========

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

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) if (n % d == 0) return false;
        return true;
    }

    // ========== Main ==========

    public static void main(String[] args) {
        System.out.println("=== Module 2 Lab ===\n");

        // Part 1 tests
        System.out.println("--- Part 1: Quotient-Remainder ---");
        int[] testN = {-17, -7, 0, 13, 25};
        int[] testD = {3, 5, 7};
        for (int n : testN) {
            for (int d : testD) {
                int r = mathMod(n, d);
                int q = (n - r) / d;
                System.out.printf("  %3d = %d × %2d + %d%n", n, d, q, r);
            }
        }
        System.out.println("  digits(255, 2)  = " + Arrays.toString(digits(255, 2)));
        System.out.println("  toBase(255, 16) = " + toBaseString(255, 16));

        // Part 2 tests
        System.out.println("\n--- Part 2: Congruence ---");
        System.out.println("  38 ≡ 14 (mod 8)? " + isCongruent(38, 14, 8));
        printModTable(5, "+");
        System.out.println("  Units of Z_12: " + findUnits(12));

        // Part 3 tests
        System.out.println("\n--- Part 3: CRT ---");
        System.out.println("  x≡2(mod3), x≡3(mod5): x = " + crt2(2, 3, 3, 5));
        System.out.println("  Sunzi: x = " +
            crtMultiple(new int[]{2, 3, 2}, new int[]{3, 5, 7}));

        // Part 4 tests
        System.out.println("\n--- Part 4: Factorization ---");
        for (int n : new int[]{84, 2520, 97, 1000}) {
            System.out.println("  " + n + " = " + factorize(n));
        }
        System.out.println("  isPerfectPower(64) = " + isPerfectPower(64));
        System.out.println("  isPerfectPower(12) = " + isPerfectPower(12));

        System.out.println("\n=== Lab Complete ===");
    }
}
```

---

## Solution Key

```java
import java.util.*;

public class Module2LabSolution {

    // ========== Part 1 ==========

    public static int mathMod(int n, int d) {
        return Math.floorMod(n, d);
    }

    public static int[] digits(int n, int base) {
        if (n == 0) return new int[]{0};
        n = Math.abs(n);
        List<Integer> ds = new ArrayList<>();
        while (n > 0) {
            ds.add(n % base);
            n /= base;
        }
        return ds.stream().mapToInt(Integer::intValue).toArray();
    }

    public static String toBaseString(int n, int base) {
        if (n == 0) return "0";
        boolean neg = n < 0;
        n = Math.abs(n);
        StringBuilder sb = new StringBuilder();
        while (n > 0) {
            int d = n % base;
            sb.append(d < 10 ? (char)('0' + d) : (char)('A' + d - 10));
            n /= base;
        }
        if (neg) sb.append('-');
        return sb.reverse().toString();
    }

    // ========== Part 2 ==========

    public static boolean isCongruent(int a, int b, int m) {
        return Math.floorMod(a - b, m) == 0;
    }

    public static void printModTable(int m, String op) {
        System.out.printf("  %s table for Z_%d:%n", op, m);
        System.out.printf("  %s |", "  ");
        for (int j = 0; j < m; j++) System.out.printf(" %2d", j);
        System.out.println();
        System.out.print("  ---+");
        for (int j = 0; j < m; j++) System.out.print("---");
        System.out.println();
        for (int i = 0; i < m; i++) {
            System.out.printf("  %2d |", i);
            for (int j = 0; j < m; j++) {
                int val = op.equals("+") ? (i + j) % m : (i * j) % m;
                System.out.printf(" %2d", val);
            }
            System.out.println();
        }
    }

    public static List<Integer> findUnits(int m) {
        List<Integer> units = new ArrayList<>();
        for (int a = 1; a < m; a++) {
            if (gcd(a, m) == 1) units.add(a);
        }
        return units;
    }

    public static int modInverse(int a, int m) {
        a = Math.floorMod(a, m);
        int[] r = extendedGcd(a, m);
        if (r[0] != 1) throw new ArithmeticException(a + " not invertible mod " + m);
        return Math.floorMod(r[1], m);
    }

    // ========== Part 3 ==========

    public static int crt2(int a, int m, int b, int n) {
        int[] bez = extendedGcd(m, n);
        if (bez[0] != 1) throw new IllegalArgumentException("Moduli not coprime");
        long x = (long) a * n * bez[2] + (long) b * m * bez[1];
        return (int) Math.floorMod(x, (long) m * n);
    }

    public static int crtMultiple(int[] remainders, int[] moduli) {
        int x = remainders[0], mod = moduli[0];
        for (int i = 1; i < remainders.length; i++) {
            x = crt2(x, mod, remainders[i], moduli[i]);
            mod *= moduli[i];
        }
        return Math.floorMod(x, mod);
    }

    // ========== Part 4 ==========

    public static Map<Integer, Integer> factorize(int n) {
        Map<Integer, Integer> factors = new TreeMap<>();
        for (int d = 2; (long) d * d <= n; d++) {
            while (n % d == 0) { factors.merge(d, 1, Integer::sum); n /= d; }
        }
        if (n > 1) factors.merge(n, 1, Integer::sum);
        return factors;
    }

    public static boolean isPerfectPower(int n) {
        if (n < 4) return false;
        var factors = factorize(n);
        int g = 0;
        for (int e : factors.values()) g = gcd(g, e);
        return g >= 2;
    }

    // ========== Helpers ==========

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

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) if (n % d == 0) return false;
        return true;
    }

    // ========== Verification ==========

    public static void runAllVerifications() {
        // Verify quotient-remainder
        for (int n = -1000; n <= 1000; n++) {
            for (int d = 1; d <= 20; d++) {
                int r = mathMod(n, d);
                int q = (n - r) / d;
                assert n == d * q + r && r >= 0 && r < d;
            }
        }
        System.out.println("  Quotient-remainder verified.");

        // Verify CRT
        for (int m = 2; m <= 15; m++) {
            for (int n = 2; n <= 15; n++) {
                if (gcd(m, n) != 1) continue;
                for (int a = 0; a < m; a++) {
                    for (int b = 0; b < n; b++) {
                        int x = crt2(a, m, b, n);
                        assert x % m == a && x % n == b;
                    }
                }
            }
        }
        System.out.println("  CRT verified.");

        // Verify factorization
        for (int k = 2; k <= 10000; k++) {
            var f = factorize(k);
            int product = 1;
            for (var e : f.entrySet()) {
                assert isPrime(e.getKey());
                for (int i = 0; i < e.getValue(); i++) product *= e.getKey();
            }
            assert product == k;
        }
        System.out.println("  Factorization verified for 2..10000.");

        // Verify units count = totient
        for (int m = 2; m <= 50; m++) {
            int totient = 0;
            for (int a = 1; a < m; a++) if (gcd(a, m) == 1) totient++;
            assert findUnits(m).size() == totient;
        }
        System.out.println("  Units count verified.");
    }

    public static void main(String[] args) {
        System.out.println("=== Module 2 Lab Solution ===\n");

        System.out.println("--- Part 1 ---");
        System.out.println("  toBase(255, 16) = " + toBaseString(255, 16));
        System.out.println("  toBase(42, 2)   = " + toBaseString(42, 2));
        System.out.println("  digits(255, 2)  = " + Arrays.toString(digits(255, 2)));

        System.out.println("\n--- Part 2 ---");
        printModTable(5, "+");
        System.out.println("  Units of Z_12: " + findUnits(12));
        System.out.println("  Inverse of 5 mod 12: " + modInverse(5, 12));

        System.out.println("\n--- Part 3 ---");
        System.out.println("  CRT(2,3,3,5) = " + crt2(2, 3, 3, 5));
        System.out.println("  Sunzi: " + crtMultiple(new int[]{2,3,2}, new int[]{3,5,7}));

        System.out.println("\n--- Part 4 ---");
        System.out.println("  factorize(2520) = " + factorize(2520));
        System.out.println("  isPerfectPower(64) = " + isPerfectPower(64));
        System.out.println("  isPerfectPower(12) = " + isPerfectPower(12));

        System.out.println("\n--- Verification ---");
        runAllVerifications();

        System.out.println("\n=== All Done ===");
    }
}
```

---

## Verification Checklist

- [ ] `mathMod` returns values in $[0, d)$ for all tested inputs including negative $n$
- [ ] `digits` and `toBaseString` produce correct results for bases 2, 8, 10, 16
- [ ] `isCongruent` handles negative inputs correctly
- [ ] Mod tables for $\mathbb{Z}_5$ are correct
- [ ] `findUnits` count matches $\phi(m)$ for $m = 2, \ldots, 50$
- [ ] `modInverse(a, m) * a % m == 1` for all units
- [ ] CRT solver produces correct results for all test cases
- [ ] CRT verification passes for coprime moduli up to 15
- [ ] `factorize` produces valid factorizations for $n = 2, \ldots, 10000$
- [ ] `isPerfectPower` correctly identifies perfect powers
