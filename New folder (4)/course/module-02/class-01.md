# Module 2 – Class 1: Quotient–Remainder Theorem

## Learning Objectives

- State the Quotient–Remainder Theorem and explain its uniqueness.
- Compute quotients and remainders by hand and in Java.
- Connect Java's `/` and `%` operators to the mathematical definitions.
- Prove the existence and uniqueness of $q$ and $r$.
- Identify how remainder arithmetic appears in hashing, cyclic buffers and indexing.

---

## Concept Overview

The **Quotient–Remainder Theorem** (also called the Division Algorithm, though it is a theorem, not an algorithm) is one of the foundational results in number theory:

> **Theorem.** For any integers $n$ and $d$ with $d > 0$, there exist **unique** integers $q$ (the quotient) and $r$ (the remainder) such that
> $$n = d \cdot q + r \qquad \text{and} \qquad 0 \leq r < d.$$

This simple result is the engine behind modular arithmetic, hashing, cyclic structures, and much of what programmers do with the `%` operator.

**Why this matters in CS:**
- **Hashing:** `hash(key) % tableSize` maps keys to buckets.
- **Cyclic buffers:** `(index + 1) % capacity` wraps around.
- **Round-robin scheduling:** task assignment cycles through processors.
- **Clock arithmetic:** hours, minutes, and seconds all wrap around.

---

## Formal Notation

- $n$ is the **dividend**, $d$ is the **divisor** (with $d > 0$).
- $q = \lfloor n / d \rfloor$ is the **quotient**.
- $r = n \bmod d = n - d \cdot q$ is the **remainder**, satisfying $0 \leq r < d$.
- We write $n \bmod d$ (or $n \mod d$) for the remainder.
- The **congruence** $a \equiv b \pmod{m}$ means $m \mid (a - b)$, i.e., $a$ and $b$ leave the same remainder when divided by $m$.

**Common pitfall:** In Java, `n % d` can return a negative value when `n` is negative (e.g., `(-7) % 3 == -1` in Java, but mathematically $-7 \bmod 3 = 2$). To get the mathematical remainder:

```java
int mathMod(int n, int d) {
    int r = n % d;
    return (r < 0) ? r + d : r;
}
```

---

## Worked Examples

### Example 1: Basic Computation — Discrete Math

**Problem:** Find $q$ and $r$ when $n = 137$ and $d = 5$.

**Solution:**
$$137 = 5 \cdot 27 + 2$$

Check: $5 \cdot 27 = 135$, and $137 - 135 = 2$. Since $0 \leq 2 < 5$, we have $q = 27$ and $r = 2$. $\blacksquare$

### Example 2: Java Translation — QuotientRemainder Demo

**Problem:** Implement a method that returns the quotient and remainder as a pair.

```java
public class QuotRemDemo {

    /**
     * Returns {quotient, remainder} for n divided by d.
     * Mathematical definition: n = d*q + r, 0 <= r < d.
     */
    public static int[] quotRem(int n, int d) {
        if (d <= 0) throw new IllegalArgumentException("d must be positive");
        // Java's / truncates toward zero, not toward negative infinity.
        // For non-negative n, this matches floor division.
        int q = Math.floorDiv(n, d);   // floor(n / d)
        int r = Math.floorMod(n, d);   // n - d * floor(n / d), always in [0, d)
        return new int[]{q, r};
    }

    public static void main(String[] args) {
        int[][] tests = {{137, 5}, {13, 5}, {0, 7}, {-7, 3}, {-20, 6}, {100, 10}};
        for (int[] t : tests) {
            int[] qr = quotRem(t[0], t[1]);
            System.out.printf("%4d = %d × %d + %d   (0 ≤ %d < %d)%n",
                t[0], t[1], qr[0], qr[1], qr[1], t[1]);
        }
    }
}
```

**Sample output:**
```
 137 = 5 × 27 + 2   (0 ≤ 2 < 5)
  13 = 5 × 2 + 3   (0 ≤ 3 < 5)
   0 = 7 × 0 + 0   (0 ≤ 0 < 7)
  -7 = 3 × -3 + 2   (0 ≤ 2 < 3)
 -20 = 6 × -4 + 4   (0 ≤ 4 < 6)
 100 = 10 × 10 + 0   (0 ≤ 0 < 10)
```

**Key code ↔ math connection:**
| Java | Math |
|------|------|
| `Math.floorDiv(n, d)` | $q = \lfloor n/d \rfloor$ |
| `Math.floorMod(n, d)` | $r = n - d\lfloor n/d \rfloor$, guaranteed $0 \leq r < d$ |
| `n / d` (integer division) | Truncation toward zero — differs from $\lfloor n/d \rfloor$ for negative $n$ |
| `n % d` | May be negative for negative $n$ — not the mathematical remainder |

### Example 3: Combined — Proving and Verifying Negative Operands

**Problem:** Show that `Math.floorMod(n, d)` always satisfies $0 \leq r < d$ and $n = d \cdot q + r$.

**Proof sketch:** `Math.floorDiv(n, d)` computes $\lfloor n/d \rfloor$. Setting $r = n - d \cdot \lfloor n/d \rfloor$:
- By definition, $n/d - 1 < \lfloor n/d \rfloor \leq n/d$.
- Multiply by $-d$: $-n \leq -d \cdot \lfloor n/d \rfloor < -n + d$.
- Add $n$: $0 \leq n - d \cdot \lfloor n/d \rfloor < d$.
- So $0 \leq r < d$. $\blacksquare$

**Java verification:**
```java
public static void verifyFloorMod() {
    for (int n = -1000; n <= 1000; n++) {
        for (int d = 1; d <= 20; d++) {
            int q = Math.floorDiv(n, d);
            int r = Math.floorMod(n, d);
            assert n == d * q + r : "Equation failed for n=" + n + ", d=" + d;
            assert r >= 0 && r < d : "Range failed for n=" + n + ", d=" + d;
        }
    }
    System.out.println("FloorMod verified for n in [-1000,1000], d in [1,20]");
}
```

### Example 4: Existence Proof

**Problem:** Prove that for any $n \in \mathbb{Z}$ and $d > 0$, there exist $q, r \in \mathbb{Z}$ with $n = dq + r$ and $0 \leq r < d$.

**Proof.** Consider the set $S = \{n - dk \mid k \in \mathbb{Z},\, n - dk \geq 0\}$.

*$S$ is non-empty:* If $n \geq 0$, take $k = 0$ to get $n \in S$. If $n < 0$, take $k = n$ (note $n - dn = n(1 - d) \geq 0$ since $n < 0$ and $1 - d \leq 0$).

By the Well-Ordering Principle, $S$ has a smallest element. Call it $r = n - dq$ for some $q$.

*$r < d$:* Suppose for contradiction that $r \geq d$. Then $r - d = n - d(q + 1) \geq 0$, so $r - d \in S$. But $r - d < r$, contradicting the minimality of $r$.

So $0 \leq r < d$ and $n = dq + r$. $\blacksquare$

### Example 5: Uniqueness Proof

**Problem:** Prove that $q$ and $r$ are unique.

**Proof.** Suppose $n = dq_1 + r_1 = dq_2 + r_2$ with $0 \leq r_1, r_2 < d$.

Then $d(q_1 - q_2) = r_2 - r_1$. Since $|r_2 - r_1| < d$ (both remainders are in $[0, d)$), and $d \mid (r_2 - r_1)$, we must have $r_2 - r_1 = 0$, so $r_1 = r_2$.

Then $d(q_1 - q_2) = 0$, and since $d > 0$, $q_1 = q_2$. $\blacksquare$

---

## Proof Techniques Spotlight

### The Well-Ordering Principle in Existence Proofs

The existence proof above uses a powerful technique:
1. Define a set of "candidate" values.
2. Show the set is non-empty.
3. Invoke the Well-Ordering Principle (every non-empty set of non-negative integers has a least element).
4. Show the least element satisfies the required bounds.

**Template:**
```
Proof. Define S = { [expression involving unknowns] : [conditions] }.
1. S is non-empty because [specific element is in S].
2. By the Well-Ordering Principle, S has a minimum element r.
3. r satisfies [lower bound] because [definition of S].
4. r satisfies [upper bound] because [contradiction if not].
Therefore q and r exist. □
```

**Common mistakes:**
- Forgetting to prove $S$ is non-empty (especially for negative $n$).
- Confusing "least element" arguments with induction.
- Not handling the edge case $n = 0$ (where $q = 0, r = 0$).

---

## Java Deep Dive

```java
import java.util.*;

public class QuotientRemainderLibrary {

    // --- Core Methods ---

    /** Mathematical floor division: q = floor(n / d) */
    public static int floorDiv(int n, int d) {
        return Math.floorDiv(n, d);
    }

    /** Mathematical mod: r in [0, d), satisfying n = d*q + r */
    public static int mathMod(int n, int d) {
        return Math.floorMod(n, d);
    }

    /** Returns {quotient, remainder} satisfying n = d*q + r, 0 <= r < d */
    public static int[] divMod(int n, int d) {
        return new int[]{floorDiv(n, d), mathMod(n, d)};
    }

    // --- Applications ---

    /** Cyclic increment: wraps index around a buffer of given capacity */
    public static int cyclicNext(int index, int capacity) {
        // (index + 1) mod capacity — always in [0, capacity)
        return (index + 1) % capacity;
    }

    /** Maps a value to a bucket in a hash table */
    public static int hashBucket(int value, int numBuckets) {
        // Ensure non-negative bucket index
        return Math.floorMod(value, numBuckets);
    }

    /**
     * Converts total seconds to hours:minutes:seconds.
     * Uses repeated application of the quotient-remainder theorem.
     */
    public static String toHMS(int totalSeconds) {
        int hours = totalSeconds / 3600;
        int remaining = totalSeconds % 3600;
        int minutes = remaining / 60;
        int seconds = remaining % 60;
        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }

    /**
     * Extracts the k-th digit (from the right, 0-indexed) of n in base b.
     * digit_k = (n / b^k) mod b
     */
    public static int digit(int n, int base, int k) {
        n = Math.abs(n);
        for (int i = 0; i < k; i++) n /= base;
        return n % base;
    }

    /**
     * Converts n to its representation in the given base.
     * Repeatedly applies the quotient-remainder theorem.
     */
    public static String toBase(int n, int base) {
        if (n == 0) return "0";
        StringBuilder sb = new StringBuilder();
        boolean negative = n < 0;
        n = Math.abs(n);
        while (n > 0) {
            sb.append(n % base);
            n /= base;
        }
        if (negative) sb.append('-');
        return sb.reverse().toString();
    }

    // --- Demonstration ---

    public static void main(String[] args) {
        System.out.println("=== Quotient-Remainder Theorem ===\n");

        // Basic division
        int[][] tests = {{137, 5}, {13, 5}, {0, 7}, {-7, 3}, {-20, 6}};
        System.out.println("Division with mathematical remainder:");
        for (int[] t : tests) {
            int[] qr = divMod(t[0], t[1]);
            System.out.printf("  %4d = %d × %2d + %d%n", t[0], t[1], qr[0], qr[1]);
        }

        // Java % vs mathematical mod for negative numbers
        System.out.println("\nJava % vs Math.floorMod for negative n:");
        for (int n : new int[]{-7, -13, -20}) {
            System.out.printf("  n=%3d, d=5: Java %% → %2d,  floorMod → %d%n",
                n, n % 5, Math.floorMod(n, 5));
        }

        // Cyclic buffer demo
        System.out.println("\nCyclic buffer (capacity 5):");
        int idx = 0;
        for (int i = 0; i < 12; i++) {
            System.out.printf("  step %2d: index = %d%n", i, idx);
            idx = cyclicNext(idx, 5);
        }

        // Time conversion
        System.out.println("\nTime conversion:");
        for (int sec : new int[]{0, 3661, 86399, 7200}) {
            System.out.printf("  %6d seconds = %s%n", sec, toHMS(sec));
        }

        // Base conversion
        System.out.println("\nBase conversion:");
        for (int n : new int[]{42, 255, 1000}) {
            System.out.printf("  %4d in base 2:  %s%n", n, toBase(n, 2));
            System.out.printf("  %4d in base 16: %s%n", n, toBase(n, 16));
        }
    }
}
```

**Sample output:**
```
=== Quotient-Remainder Theorem ===

Division with mathematical remainder:
   137 = 5 × 27 + 2
    13 = 5 ×  2 + 3
     0 = 7 ×  0 + 0
    -7 = 3 × -3 + 2
   -20 = 6 × -4 + 4

Java % vs Math.floorMod for negative n:
  n= -7, d=5: Java % → -2,  floorMod → 3
  n=-13, d=5: Java % → -3,  floorMod → 2
  n=-20, d=5: Java % →  0,  floorMod → 0

Cyclic buffer (capacity 5):
  step  0: index = 0
  step  1: index = 1
  step  2: index = 2
  step  3: index = 3
  step  4: index = 4
  step  5: index = 0
  ...

Time conversion:
       0 seconds = 00:00:00
    3661 seconds = 01:01:01
   86399 seconds = 23:59:59
    7200 seconds = 02:00:00

Base conversion:
    42 in base 2:  101010
    42 in base 16: 2a
   255 in base 2:  11111111
   255 in base 16: ff
  1000 in base 2:  1111101000
  1000 in base 16: 3e8
```

---

## Historical Context

The idea of dividing with remainder is ancient — Euclid described it implicitly in his algorithm for computing the GCD. The formal statement of the Division Algorithm as a theorem (existence and uniqueness) was sharpened during the 19th century as mathematicians sought rigorous foundations for number theory.

The notation $a \bmod m$ and the systematic study of **modular arithmetic** were formalized by **Carl Friedrich Gauss** in his 1801 masterwork *Disquisitiones Arithmeticae*. Gauss introduced the congruence notation $a \equiv b \pmod{m}$ and showed that arithmetic within equivalence classes is consistent — a result that underlies everything from clock arithmetic to RSA encryption.

The **Chinese Remainder Theorem**, which concerns simultaneous congruences, dates back to the 3rd-century Chinese mathematician **Sunzi**. His original problem: "Find a number that leaves remainder 2 when divided by 3, remainder 3 when divided by 5, and remainder 2 when divided by 7."

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** True or false: For any integer $n$ and positive integer $d$, the remainder $r = n \bmod d$ satisfies $0 \leq r \leq d$.

**A2.** What are the quotient and remainder when $n = -17$ is divided by $d = 5$? (Use the mathematical definition where $r \geq 0$.)

**A3.** In Java, what is the value of `(-17) % 5`? How does this differ from the mathematical remainder?

**A4.** A circular buffer has capacity 8. If the current index is 6, what is the next index? What about after 5 more steps?

### Slide Set B: Proof Problems

**B1.** Prove: If $a = dq_1 + r_1$ and $a = dq_2 + r_2$ with $0 \leq r_1, r_2 < d$, then $q_1 = q_2$ and $r_1 = r_2$.

**B2.** Prove: For any positive integers $a$ and $b$, $a \bmod b < a$ if and only if $a \geq b$.

**B3.** Prove: For any integers $a, b$ and positive integer $d$, $(a + b) \bmod d = ((a \bmod d) + (b \bmod d)) \bmod d$.

### Slide Set C: Java Coding Problems

**C1.** Write a method `boolean isLeapYear(int year)` using the quotient-remainder theorem (a year is a leap year if divisible by 4, except centuries, except centuries divisible by 400).

**C2.** Write a method `int dayOfWeek(int dayNumber)` that takes a day number (0 = Sunday) and returns the day of the week after advancing by any number of days (including negative).

**C3.** Write a method `String toBaseN(int n, int base)` that converts a non-negative integer $n$ to its string representation in the given base (2 through 36).

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Find the quotient and remainder when $n = 2023$ is divided by $d = 17$.

**DM2.** Prove that for any integer $n$, $n^2 \bmod 4 \in \{0, 1\}$. *(That is, perfect squares leave remainder 0 or 1 when divided by 4.)*

**DM3.** Prove: If $a \bmod d = 0$ and $b \bmod d = 0$, then $(a + b) \bmod d = 0$.

**DM4.** Prove the existence of $q$ and $r$ in the quotient-remainder theorem using the Well-Ordering Principle.

**DM5.** Prove: For any positive integers $a, b, c$ with $c > 0$, $\lfloor \lfloor a/b \rfloor / c \rfloor = \lfloor a / (bc) \rfloor$.

**DM6.** Let $n$ be a positive integer. Prove that among any $n + 1$ integers from $\{1, 2, \ldots, 2n\}$, at least two have the same remainder when divided by $n$.

**DM7.** Prove that the last digit of $n^2$ (i.e., $n^2 \bmod 10$) can only be one of $\{0, 1, 4, 5, 6, 9\}$.

### Java Programming Problems

**JP1.** Write a method `int[] quotRem(int n, int d)` that returns the mathematical quotient and remainder (not Java's truncation-toward-zero). Test with positive and negative inputs.

**JP2.** Write a method `int extractDigit(int n, int position)` that returns the digit at the given position (0 = ones, 1 = tens, etc.).

**JP3.** Write a method `int sumOfDigits(int n)` that computes the sum of digits of $n$ using repeated division. Prove (informally) that the loop terminates.

**JP4.** Implement a circular buffer class with methods `add(int item)`, `get(int index)`, and `isFull()`. Use `%` for wrap-around.

**JP5.** Write a method `boolean isPerfectSquare(int n)` that uses the fact that $n^2 \bmod 4 \in \{0, 1\}$ to quickly reject non-squares before checking with `Math.sqrt`.

**JP6.** Write a program that reads integers from the user and groups them by their remainder modulo 7. Print each group.

### Bridge Problems

**BR1.** Prove that the sum of digits of a number $n$ has the same remainder as $n$ when divided by 9 (i.e., $n \equiv \text{digitSum}(n) \pmod{9}$). Then write a Java method that verifies this for all $n$ from 1 to 10000.

**BR2.** A hash table uses `h(key) = key % tableSize`. Prove that if `tableSize` divides `key1 - key2`, then `key1` and `key2` collide. Write Java code that demonstrates this.

**BR3.** Write a Java method `int[] toMixedRadix(int seconds)` that converts a number of seconds to days, hours, minutes, seconds. This uses the quotient-remainder theorem three times in sequence. State and prove the invariant at each step.

---

## Solutions

### Discrete Math Solutions

**DM1.** $2023 = 17 \times 119 + 0$. Check: $17 \times 119 = 2023$. So $q = 119, r = 0$.

**DM2.** Any integer $n$ satisfies $n \bmod 2 \in \{0, 1\}$.
- If $n = 2k$: $n^2 = 4k^2$, so $n^2 \bmod 4 = 0$.
- If $n = 2k + 1$: $n^2 = 4k^2 + 4k + 1 = 4(k^2 + k) + 1$, so $n^2 \bmod 4 = 1$. $\blacksquare$

**DM3.** If $a = dq_1$ and $b = dq_2$, then $a + b = d(q_1 + q_2)$. Since $q_1 + q_2 \in \mathbb{Z}$, $d \mid (a + b)$. $\blacksquare$

**DM4.** (See Example 4 above for the full proof using the Well-Ordering Principle.)

**DM5.** Let $a = bq_1 + r_1$ with $0 \leq r_1 < b$, and $q_1 = cq_2 + r_2$ with $0 \leq r_2 < c$. Then $a = b(cq_2 + r_2) + r_1 = bcq_2 + (br_2 + r_1)$. We need $0 \leq br_2 + r_1 < bc$: since $r_2 < c$ and $r_1 < b$, $br_2 + r_1 < bc$, and both are non-negative. So $\lfloor a/(bc) \rfloor = q_2 = \lfloor q_1/c \rfloor = \lfloor \lfloor a/b \rfloor / c \rfloor$. $\blacksquare$

**DM6.** By the Pigeonhole Principle: there are $n$ possible remainders modulo $n$ (namely $0, 1, \ldots, n-1$). With $n + 1$ integers, at least two must share the same remainder. $\blacksquare$

**DM7.** Compute $k^2 \bmod 10$ for $k = 0, 1, \ldots, 9$: $0, 1, 4, 9, 6, 5, 6, 9, 4, 1$. Since $n \bmod 10 \in \{0,\ldots,9\}$, $n^2 \bmod 10$ is determined by $n \bmod 10$, and the only possible values are $\{0, 1, 4, 5, 6, 9\}$. $\blacksquare$

### Java Solutions

**JP1.**
```java
public static int[] quotRem(int n, int d) {
    int q = Math.floorDiv(n, d);
    int r = Math.floorMod(n, d);
    return new int[]{q, r};
}
```

**JP2.**
```java
public static int extractDigit(int n, int position) {
    n = Math.abs(n);
    for (int i = 0; i < position; i++) n /= 10;
    return n % 10;
}
```

**JP3.**
```java
public static int sumOfDigits(int n) {
    n = Math.abs(n);
    int sum = 0;
    // Variant function: n (decreases by factor of 10 each iteration)
    while (n > 0) {
        sum += n % 10;   // extract last digit
        n /= 10;         // remove last digit
    }
    return sum;
}
// Termination: n is non-negative and n /= 10 strictly decreases n
// toward 0 (since n >= 1 implies n/10 < n for integer division).
```

**JP4.**
```java
public class CircularBuffer {
    private int[] data;
    private int head, size, capacity;

    public CircularBuffer(int capacity) {
        this.capacity = capacity;
        data = new int[capacity];
        head = 0;
        size = 0;
    }

    public void add(int item) {
        if (size == capacity) throw new IllegalStateException("Buffer full");
        data[(head + size) % capacity] = item;  // wrap-around
        size++;
    }

    public int get(int index) {
        if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
        return data[(head + index) % capacity];  // wrap-around
    }

    public boolean isFull() { return size == capacity; }
}
```

**JP5.**
```java
public static boolean isPerfectSquare(int n) {
    if (n < 0) return false;
    // Quick reject: n^2 mod 4 ∈ {0,1}, so if n mod 4 ∈ {2,3}, not a square
    int r = n % 4;
    if (r == 2 || r == 3) return false;
    // Full check
    int s = (int) Math.round(Math.sqrt(n));
    return s * s == n;
}
```

**JP6.**
```java
public static void groupByRemainder(int[] nums, int mod) {
    Map<Integer, List<Integer>> groups = new TreeMap<>();
    for (int n : nums) {
        int r = Math.floorMod(n, mod);
        groups.computeIfAbsent(r, k -> new ArrayList<>()).add(n);
    }
    for (var entry : groups.entrySet()) {
        System.out.printf("  Remainder %d: %s%n", entry.getKey(), entry.getValue());
    }
}
```

### Bridge Solutions

**BR1.** Write $n$ in decimal: $n = a_k \cdot 10^k + \cdots + a_1 \cdot 10 + a_0$. Since $10 \equiv 1 \pmod{9}$, we have $10^i \equiv 1 \pmod{9}$ for all $i$. So $n \equiv a_k + \cdots + a_1 + a_0 \pmod{9}$.

```java
public static void verifyCastingOutNines() {
    for (int n = 1; n <= 10000; n++) {
        assert Math.floorMod(n, 9) == Math.floorMod(sumOfDigits(n), 9)
            : "Failed for n=" + n;
    }
    System.out.println("Casting out nines verified for 1..10000");
}
```

**BR2.** If $\text{tableSize} \mid (k_1 - k_2)$, then $k_1 \equiv k_2 \pmod{\text{tableSize}}$, so $k_1 \bmod \text{tableSize} = k_2 \bmod \text{tableSize}$, meaning they hash to the same bucket.

```java
public static void demonstrateCollisions() {
    int tableSize = 7;
    // keys that differ by multiples of 7 collide
    int[] keys = {3, 10, 17, 24, 31};
    for (int k : keys) {
        System.out.printf("  hash(%d) = %d%n", k, k % tableSize);
    }
    // All print 3, confirming collisions
}
```

**BR3.**
```java
public static int[] toMixedRadix(int totalSeconds) {
    // Step 1: totalSeconds = 86400*days + rem1,  0 <= rem1 < 86400
    int days = totalSeconds / 86400;
    int rem1 = totalSeconds % 86400;
    // Invariant: totalSeconds = 86400*days + rem1

    // Step 2: rem1 = 3600*hours + rem2,  0 <= rem2 < 3600
    int hours = rem1 / 3600;
    int rem2 = rem1 % 3600;
    // Invariant: totalSeconds = 86400*days + 3600*hours + rem2

    // Step 3: rem2 = 60*minutes + seconds,  0 <= seconds < 60
    int minutes = rem2 / 60;
    int seconds = rem2 % 60;
    // Invariant: totalSeconds = 86400*days + 3600*hours + 60*minutes + seconds

    return new int[]{days, hours, minutes, seconds};
}
```
