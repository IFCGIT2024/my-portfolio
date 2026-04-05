# Module 2 – Class 2: Modular Arithmetic and Congruence Classes

## Learning Objectives

- Define congruence modulo $m$ and explain its meaning as an equivalence relation.
- Prove that congruence is reflexive, symmetric, and transitive.
- Prove that addition and multiplication respect congruence.
- Translate congruence operations into Java using `%` and `Math.floorMod`.
- Apply modular arithmetic to cyclic structures, hashing, and cryptography.

---

## Concept Overview

**Congruence modulo $m$** captures the idea that two integers "behave the same" with respect to division by $m$.

> **Definition.** Let $m$ be a positive integer. We say $a$ is **congruent** to $b$ **modulo** $m$, written
> $$a \equiv b \pmod{m},$$
> if $m \mid (a - b)$, i.e., there exists $k \in \mathbb{Z}$ such that $a - b = mk$.

Equivalently: $a$ and $b$ leave the same remainder when divided by $m$.

**Congruence classes (equivalence classes):** The set of all integers congruent to $a$ modulo $m$ is denoted $[a]_m$:
$$[a]_m = \{a + km \mid k \in \mathbb{Z}\} = \{\ldots, a - 2m, a - m, a, a + m, a + 2m, \ldots\}$$

The integers modulo $m$ partition into exactly $m$ congruence classes: $[0]_m, [1]_m, \ldots, [m-1]_m$.

**Why this matters in CS:**
- **Hashing:** Keys mapped to buckets via `key % tableSize` — all keys in the same congruence class collide.
- **Cyclic data structures:** Circular buffers, ring buffers, round-robin schedulers.
- **Cryptography:** RSA, Diffie-Hellman, and other protocols operate in $\mathbb{Z}_n$.
- **Checksums:** ISBN, credit card (Luhn), and network checksums use modular arithmetic.

---

## Formal Notation

| Symbol | Meaning |
|--------|---------|
| $a \equiv b \pmod{m}$ | $m \mid (a - b)$ |
| $[a]_m$ | Congruence class of $a$ modulo $m$: $\{a + km : k \in \mathbb{Z}\}$ |
| $\mathbb{Z}_m$ or $\mathbb{Z}/m\mathbb{Z}$ | The set of congruence classes $\{[0]_m, [1]_m, \ldots, [m-1]_m\}$ |
| $a \bmod m$ | The unique $r \in \{0, 1, \ldots, m-1\}$ with $a \equiv r \pmod{m}$ |

**Key properties of congruence:**

1. **Reflexive:** $a \equiv a \pmod{m}$ because $m \mid 0$.
2. **Symmetric:** If $a \equiv b \pmod{m}$, then $b \equiv a \pmod{m}$.
3. **Transitive:** If $a \equiv b \pmod{m}$ and $b \equiv c \pmod{m}$, then $a \equiv c \pmod{m}$.

Together these make congruence an **equivalence relation**.

**Arithmetic compatibility:**

4. **Addition:** If $a \equiv b \pmod{m}$ and $c \equiv d \pmod{m}$, then $a + c \equiv b + d \pmod{m}$.
5. **Multiplication:** If $a \equiv b \pmod{m}$ and $c \equiv d \pmod{m}$, then $ac \equiv bd \pmod{m}$.

---

## Worked Examples

### Example 1: Verifying Congruences — Discrete Math

**Problem:** Show that $38 \equiv 14 \pmod{8}$ and that $38 \not\equiv 14 \pmod{5}$.

**Solution:**
- $38 - 14 = 24 = 8 \times 3$. Since $8 \mid 24$, $38 \equiv 14 \pmod{8}$. ✓
- $38 - 14 = 24$. Is $5 \mid 24$? No ($24 / 5 = 4.8$). So $38 \not\equiv 14 \pmod{5}$. ✓

### Example 2: Java Translation — Congruence Checker

```java
public class CongruenceDemo {

    /** Checks whether a ≡ b (mod m), i.e., m | (a - b) */
    public static boolean isCongruent(int a, int b, int m) {
        // (a - b) is divisible by m iff (a - b) % m == 0
        // Use Math.floorMod to handle negative differences correctly
        return Math.floorMod(a - b, m) == 0;
    }

    /** Returns the canonical representative of [a]_m, i.e., a mod m in [0, m) */
    public static int canonical(int a, int m) {
        return Math.floorMod(a, m);
    }

    /** Groups integers by their congruence class mod m */
    public static Map<Integer, List<Integer>> groupByClass(int[] nums, int m) {
        Map<Integer, List<Integer>> classes = new TreeMap<>();
        for (int n : nums) {
            int rep = canonical(n, m);
            classes.computeIfAbsent(rep, k -> new ArrayList<>()).add(n);
        }
        return classes;
    }

    public static void main(String[] args) {
        // Check congruences
        System.out.println("38 ≡ 14 (mod 8)? " + isCongruent(38, 14, 8));
        System.out.println("38 ≡ 14 (mod 5)? " + isCongruent(38, 14, 5));

        // Group numbers by congruence class mod 4
        int[] nums = {-7, -3, 0, 1, 4, 5, 8, 9, 12, 13, 16, 17};
        var classes = groupByClass(nums, 4);
        for (var entry : classes.entrySet()) {
            System.out.printf("  [%d]_4 = %s%n", entry.getKey(), entry.getValue());
        }
    }
}
```

**Sample output:**
```
38 ≡ 14 (mod 8)? true
38 ≡ 14 (mod 5)? false
  [0]_4 = [0, 4, 8, 12, 16]
  [1]_4 = [1, 5, 9, 13, 17]
  [2]_4 = [-7, -3]       (since floorMod(-7,4) = 1... wait)
```

Actually, let's be precise: `Math.floorMod(-7, 4) = 1` and `Math.floorMod(-3, 4) = 1`. So $-7$ and $-3$ go into class $[1]_4$. This is correct: $-7 \equiv 1 \pmod{4}$ because $-7 - 1 = -8 = 4 \times (-2)$.

### Example 3: Proving Addition Respects Congruence — Combined

**Problem:** Prove: If $a \equiv b \pmod{m}$ and $c \equiv d \pmod{m}$, then $a + c \equiv b + d \pmod{m}$.

**Proof.** By hypothesis, $m \mid (a - b)$ and $m \mid (c - d)$. Write $a - b = mk_1$ and $c - d = mk_2$.

Then $(a + c) - (b + d) = (a - b) + (c - d) = mk_1 + mk_2 = m(k_1 + k_2)$.

Since $k_1 + k_2 \in \mathbb{Z}$, $m \mid ((a+c) - (b+d))$, so $a + c \equiv b + d \pmod{m}$. $\blacksquare$

**Java verification:**
```java
public static void verifyAdditionCompat() {
    for (int m = 2; m <= 20; m++) {
        for (int a = -50; a <= 50; a++) {
            for (int c = -50; c <= 50; c++) {
                int b = canonical(a, m);  // b ≡ a (mod m)
                int d = canonical(c, m);  // d ≡ c (mod m)
                // (a + c) mod m should equal (b + d) mod m
                assert canonical(a + c, m) == canonical(b + d, m);
            }
        }
    }
    System.out.println("Addition compatibility verified.");
}
```

### Example 4: Proving Multiplication Respects Congruence

**Problem:** Prove: If $a \equiv b \pmod{m}$ and $c \equiv d \pmod{m}$, then $ac \equiv bd \pmod{m}$.

**Proof.** Write $a = b + mk_1$ and $c = d + mk_2$. Then:
$$ac = (b + mk_1)(d + mk_2) = bd + bmk_2 + mk_1 d + m^2 k_1 k_2 = bd + m(bk_2 + k_1 d + mk_1 k_2)$$

So $ac - bd = m(bk_2 + k_1 d + mk_1 k_2)$, and since the expression in parentheses is an integer, $m \mid (ac - bd)$. $\blacksquare$

### Example 5: Circular Buffer Index Cycling

**Problem:** Prove that starting from index 0 and repeatedly computing $(i + 1) \bmod n$ visits every index $0, 1, \ldots, n-1$ exactly once before returning to 0.

**Proof.** After $k$ steps, the index is $k \bmod n$. For $0 \leq k < n$, these are $0, 1, \ldots, n-1$ — all distinct (since $0 \leq k_1 < k_2 < n$ implies $k_2 - k_1 < n$, so $k_1 \not\equiv k_2 \pmod{n}$). After $n$ steps, the index is $n \bmod n = 0$. $\blacksquare$

---

## Proof Techniques Spotlight

### Equivalence Relation Proofs

To prove congruence is an equivalence relation, verify three properties:

**Template for reflexivity:** "$a - a = 0 = m \cdot 0$, so $m \mid (a - a)$."

**Template for symmetry:** "If $a - b = mk$, then $b - a = m(-k)$, and $-k \in \mathbb{Z}$."

**Template for transitivity:** "If $a - b = mk_1$ and $b - c = mk_2$, add: $a - c = m(k_1 + k_2)$."

### Modular Arithmetic in Proofs

A powerful technique: **reduce expressions modulo $m$** to simplify.

To find the last digit of $7^{100}$:
- $7^1 \equiv 7 \pmod{10}$
- $7^2 \equiv 49 \equiv 9 \pmod{10}$
- $7^3 \equiv 63 \equiv 3 \pmod{10}$
- $7^4 \equiv 21 \equiv 1 \pmod{10}$
- The pattern repeats with period 4. Since $100 = 4 \times 25$, $7^{100} \equiv 1 \pmod{10}$.

---

## Java Deep Dive

```java
import java.util.*;

public class ModularArithmeticLibrary {

    // --- Core Modular Operations ---

    /** Canonical representative: a mod m, always in [0, m) */
    public static int mod(int a, int m) {
        return Math.floorMod(a, m);
    }

    /** Modular addition: (a + b) mod m */
    public static int modAdd(int a, int b, int m) {
        return mod(mod(a, m) + mod(b, m), m);
    }

    /** Modular multiplication: (a * b) mod m */
    public static int modMul(int a, int b, int m) {
        // Use long to avoid overflow for large a, b
        return (int) (((long) mod(a, m) * mod(b, m)) % m);
    }

    /** Modular exponentiation: a^exp mod m (fast, using repeated squaring) */
    public static int modPow(int base, int exp, int m) {
        long result = 1;
        long b = mod(base, m);
        while (exp > 0) {
            if (exp % 2 == 1) {
                result = (result * b) % m;
            }
            b = (b * b) % m;
            exp /= 2;
        }
        return (int) result;
    }

    // --- Congruence Checks ---

    /** Returns true if a ≡ b (mod m) */
    public static boolean congruent(int a, int b, int m) {
        return mod(a - b, m) == 0;
    }

    /**
     * Builds the addition table for Z_m.
     * Entry [i][j] = (i + j) mod m.
     */
    public static int[][] additionTable(int m) {
        int[][] table = new int[m][m];
        for (int i = 0; i < m; i++)
            for (int j = 0; j < m; j++)
                table[i][j] = (i + j) % m;
        return table;
    }

    /**
     * Builds the multiplication table for Z_m.
     * Entry [i][j] = (i * j) mod m.
     */
    public static int[][] multiplicationTable(int m) {
        int[][] table = new int[m][m];
        for (int i = 0; i < m; i++)
            for (int j = 0; j < m; j++)
                table[i][j] = (i * j) % m;
        return table;
    }

    /**
     * Finds all units (invertible elements) in Z_m.
     * a is a unit if gcd(a, m) = 1.
     */
    public static List<Integer> units(int m) {
        List<Integer> result = new ArrayList<>();
        for (int a = 1; a < m; a++) {
            if (gcd(a, m) == 1) result.add(a);
        }
        return result;
    }

    /** Finds the multiplicative inverse of a mod m, if it exists. */
    public static int modInverse(int a, int m) {
        int[] r = extendedGcd(mod(a, m), m);
        if (r[0] != 1) throw new ArithmeticException(a + " has no inverse mod " + m);
        return mod(r[1], m);
    }

    // --- Helper: GCD ---

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

    // --- Printing ---

    public static void printTable(int[][] table, String label) {
        int m = table.length;
        System.out.println(label + " table for Z_" + m + ":");
        System.out.printf("  %s |", "");
        for (int j = 0; j < m; j++) System.out.printf(" %2d", j);
        System.out.println();
        System.out.print("  ---+");
        for (int j = 0; j < m; j++) System.out.print("---");
        System.out.println();
        for (int i = 0; i < m; i++) {
            System.out.printf("  %2d |", i);
            for (int j = 0; j < m; j++) System.out.printf(" %2d", table[i][j]);
            System.out.println();
        }
        System.out.println();
    }

    public static void main(String[] args) {
        System.out.println("=== Modular Arithmetic Library ===\n");

        // Addition and multiplication tables for Z_5
        printTable(additionTable(5), "Addition");
        printTable(multiplicationTable(5), "Multiplication");

        // Units of Z_12
        System.out.println("Units of Z_12: " + units(12));
        // Expected: [1, 5, 7, 11] — those coprime to 12

        // Modular inverse
        System.out.println("Inverse of 5 mod 12 = " + modInverse(5, 12));
        // 5 * 5 = 25 ≡ 1 (mod 12) ✓

        // Modular exponentiation: last digit of 7^100
        System.out.println("7^100 mod 10 = " + modPow(7, 100, 10));
        // Expected: 1

        // Verify: (a+b) mod m = ((a mod m) + (b mod m)) mod m
        System.out.println("\nVerifying modular arithmetic properties...");
        for (int m = 2; m <= 15; m++) {
            for (int a = -50; a <= 50; a++) {
                for (int b = -50; b <= 50; b++) {
                    assert mod(a + b, m) == modAdd(a, b, m);
                    assert mod(a * b, m) == modMul(a, b, m);
                }
            }
        }
        System.out.println("All properties verified.");
    }
}
```

---

## Historical Context

**Carl Friedrich Gauss** (1777–1855) formalized modular arithmetic in his *Disquisitiones Arithmeticae* (1801), introducing the notation $a \equiv b \pmod{m}$. He showed that congruence classes form a consistent arithmetic system — you can add, subtract, and multiply congruence classes and get well-defined results.

The **Chinese Remainder Theorem** (next class) was discovered by **Sunzi** in the 3rd century CE. It states that a system of simultaneous congruences with pairwise coprime moduli has a unique solution. This was used for calendar calculations and later became foundational in cryptography.

**Euler's theorem** ($a^{\phi(m)} \equiv 1 \pmod{m}$ for $\gcd(a,m) = 1$) and **Fermat's little theorem** ($a^{p-1} \equiv 1 \pmod{p}$ for prime $p$) are key results that power modern cryptography, including RSA.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** True or false: $25 \equiv 4 \pmod{7}$.

**A2.** List all elements of the congruence class $[3]_5$ that lie between $-15$ and $20$.

**A3.** How many distinct congruence classes are there modulo $m$?

**A4.** If today is Wednesday (day 3), what day will it be 100 days from now? Express using congruence.

### Slide Set B: Proof Problems

**B1.** Prove that congruence modulo $m$ is transitive.

**B2.** Prove that if $a \equiv b \pmod{m}$, then $a^2 \equiv b^2 \pmod{m}$.

**B3.** Prove or disprove: If $ac \equiv bc \pmod{m}$, then $a \equiv b \pmod{m}$.

### Slide Set C: Java Coding Problems

**C1.** Write a method that builds and prints the multiplication table for $\mathbb{Z}_m$.

**C2.** Write a method `List<Integer> congruenceClass(int a, int m, int lo, int hi)` that returns all integers in $[a]_m$ between `lo` and `hi`.

**C3.** Write a method that finds all elements in $\mathbb{Z}_m$ that are their own multiplicative inverse (i.e., $a^2 \equiv 1 \pmod{m}$).

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Determine whether $123 \equiv 42 \pmod{9}$.

**DM2.** Prove that $a \equiv b \pmod{m}$ if and only if $a \bmod m = b \bmod m$.

**DM3.** Prove: For any integer $n$, $n^2 \equiv 0$ or $1 \pmod{3}$.

**DM4.** Find the last two digits of $3^{100}$ (i.e., compute $3^{100} \bmod 100$).

**DM5.** Prove that if $\gcd(c, m) = 1$ and $ac \equiv bc \pmod{m}$, then $a \equiv b \pmod{m}$. (This is the **cancellation law**.)

**DM6.** Prove that $[a]_m$ has a multiplicative inverse in $\mathbb{Z}_m$ if and only if $\gcd(a, m) = 1$.

**DM7.** How many units (invertible elements) are there in $\mathbb{Z}_{30}$? List them.

### Java Programming Problems

**JP1.** Write a method `boolean isCongruent(int a, int b, int m)` that correctly handles negative inputs.

**JP2.** Implement modular exponentiation using repeated squaring: `int modPow(int base, int exp, int mod)`.

**JP3.** Write a method that reads a list of integers and partitions them into congruence classes modulo $m$, printing each class.

**JP4.** Implement a method `int modInverse(int a, int m)` that returns the modular inverse using the extended Euclidean algorithm. Throw an exception if the inverse doesn't exist.

**JP5.** Write a program that verifies Fermat's Little Theorem: for prime $p$ and $1 \leq a < p$, $a^{p-1} \equiv 1 \pmod{p}$. Test for all primes $p \leq 50$.

**JP6.** Implement a simple clock class where the time wraps around using modular arithmetic. Support `advance(int hours)`, `retreat(int hours)`, and `toString()`.

### Bridge Problems

**BR1.** Prove that in $\mathbb{Z}_m$, the number of units equals Euler's totient $\phi(m)$. Write a Java method `int eulerTotient(int m)` and verify that `units(m).size() == eulerTotient(m)` for $m = 1, \ldots, 100$.

**BR2.** A circular array of size $n$ starts at index 0. Prove that after $n$ increments of $(i + 1) \bmod n$, the index returns to 0 and every position has been visited exactly once. Write Java code that verifies this for $n = 1, \ldots, 1000$.

**BR3.** Implement a Luhn checksum verifier for credit card numbers using modular arithmetic. Explain how each step relates to congruence modulo 10.

---

## Solutions

### Discrete Math Solutions

**DM1.** $123 - 42 = 81 = 9 \times 9$. Since $9 \mid 81$, $123 \equiv 42 \pmod{9}$. ✓

**DM2.** ($\Rightarrow$) If $a \equiv b \pmod{m}$, then $m \mid (a - b)$. Write $a = mq_1 + r$ and $b = mq_2 + r'$ with $0 \leq r, r' < m$. Then $a - b = m(q_1 - q_2) + (r - r')$. Since $m \mid (a - b)$, $m \mid (r - r')$. But $|r - r'| < m$, so $r = r'$.
($\Leftarrow$) If $a \bmod m = b \bmod m = r$, then $a = mq_1 + r$ and $b = mq_2 + r$, so $a - b = m(q_1 - q_2)$, giving $m \mid (a - b)$. $\blacksquare$

**DM3.** Any integer $n$ satisfies $n \equiv 0, 1, \text{ or } 2 \pmod{3}$.
- $n \equiv 0$: $n^2 \equiv 0 \pmod{3}$.
- $n \equiv 1$: $n^2 \equiv 1 \pmod{3}$.
- $n \equiv 2$: $n^2 \equiv 4 \equiv 1 \pmod{3}$. $\blacksquare$

**DM4.** Using repeated squaring modulo 100:
- $3^1 = 3$
- $3^2 = 9$
- $3^4 = 81$
- $3^8 = 6561 \equiv 61$
- $3^{16} \equiv 61^2 = 3721 \equiv 21$
- $3^{32} \equiv 21^2 = 441 \equiv 41$
- $3^{64} \equiv 41^2 = 1681 \equiv 81$
- $3^{100} = 3^{64} \cdot 3^{32} \cdot 3^{4} \equiv 81 \cdot 41 \cdot 81 \pmod{100}$
- $81 \cdot 41 = 3321 \equiv 21$
- $21 \cdot 81 = 1701 \equiv 1$

So $3^{100} \equiv 1 \pmod{100}$.

**DM5.** If $ac \equiv bc \pmod{m}$, then $m \mid c(a - b)$. Since $\gcd(c, m) = 1$, by Euclid's Lemma, $m \mid (a - b)$, so $a \equiv b \pmod{m}$. $\blacksquare$

**DM6.** ($\Rightarrow$) If $[a]_m$ has an inverse $[b]_m$, then $ab \equiv 1 \pmod{m}$, so $ab = 1 + mk$ for some $k$. Then $ab - mk = 1$, which is a Bézout expression, so $\gcd(a, m) = 1$.
($\Leftarrow$) If $\gcd(a, m) = 1$, by the extended Euclidean algorithm, find $x, y$ with $ax + my = 1$. Then $ax \equiv 1 \pmod{m}$, so $[x]_m$ is the inverse. $\blacksquare$

**DM7.** The units of $\mathbb{Z}_{30}$ are those $a$ with $\gcd(a, 30) = 1$: $\{1, 7, 11, 13, 17, 19, 23, 29\}$. There are 8 units. (This equals $\phi(30) = 30 \cdot (1 - 1/2)(1 - 1/3)(1 - 1/5) = 8$.)

### Java Solutions

**JP1.**
```java
public static boolean isCongruent(int a, int b, int m) {
    return Math.floorMod(a - b, m) == 0;
}
```

**JP2.**
```java
public static int modPow(int base, int exp, int mod) {
    long result = 1;
    long b = Math.floorMod(base, mod);
    while (exp > 0) {
        if (exp % 2 == 1) result = (result * b) % mod;
        b = (b * b) % mod;
        exp /= 2;
    }
    return (int) result;
}
```

**JP3.**
```java
public static void partitionByCongruence(int[] nums, int m) {
    Map<Integer, List<Integer>> classes = new TreeMap<>();
    for (int n : nums) {
        int r = Math.floorMod(n, m);
        classes.computeIfAbsent(r, k -> new ArrayList<>()).add(n);
    }
    for (var entry : classes.entrySet()) {
        System.out.printf("  [%d]_%d = %s%n", entry.getKey(), m, entry.getValue());
    }
}
```

**JP4.**
```java
public static int modInverse(int a, int m) {
    a = Math.floorMod(a, m);
    int[] r = extendedGcd(a, m);
    if (r[0] != 1) throw new ArithmeticException(a + " not invertible mod " + m);
    return Math.floorMod(r[1], m);
}
```

**JP5.**
```java
public static void verifyFermatsLittle() {
    for (int p = 2; p <= 50; p++) {
        if (!isPrime(p)) continue;
        for (int a = 1; a < p; a++) {
            assert modPow(a, p - 1, p) == 1 :
                "Fermat failed for a=" + a + ", p=" + p;
        }
    }
    System.out.println("Fermat's Little Theorem verified for primes ≤ 50.");
}
```

**JP6.**
```java
public class ModularClock {
    private int hour;  // 0..23

    public ModularClock(int hour) { this.hour = Math.floorMod(hour, 24); }

    public void advance(int hours) { hour = Math.floorMod(hour + hours, 24); }
    public void retreat(int hours) { advance(-hours); }

    public String toString() { return String.format("%02d:00", hour); }
}
```

### Bridge Solutions

**BR1.**
```java
public static int eulerTotient(int m) {
    int count = 0;
    for (int a = 1; a < m; a++) {
        if (gcd(a, m) == 1) count++;
    }
    return count;
}

public static void verifyTotient() {
    for (int m = 1; m <= 100; m++) {
        assert units(m).size() == eulerTotient(m);
    }
    System.out.println("Totient = #units verified for m=1..100");
}
```

**BR2.**
```java
public static void verifyCyclicTraversal() {
    for (int n = 1; n <= 1000; n++) {
        boolean[] visited = new boolean[n];
        int idx = 0;
        for (int step = 0; step < n; step++) {
            assert !visited[idx] : "Revisited index " + idx;
            visited[idx] = true;
            idx = (idx + 1) % n;
        }
        assert idx == 0 : "Did not return to 0";
        for (int i = 0; i < n; i++) assert visited[i];
    }
    System.out.println("Cyclic traversal verified for n=1..1000");
}
```

**BR3.**
```java
public static boolean luhnCheck(String cardNumber) {
    // Luhn: from right, double every second digit.
    // If doubled > 9, subtract 9. Sum all. Valid if sum ≡ 0 (mod 10).
    int sum = 0;
    boolean doubleNext = false;
    for (int i = cardNumber.length() - 1; i >= 0; i--) {
        int d = cardNumber.charAt(i) - '0';
        if (doubleNext) {
            d *= 2;
            if (d > 9) d -= 9;  // equivalent to d mod 9 for d in [10,18]
        }
        sum += d;
        doubleNext = !doubleNext;
    }
    return sum % 10 == 0;  // congruence check: sum ≡ 0 (mod 10)
}
```
