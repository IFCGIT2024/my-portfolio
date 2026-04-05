# Module 1 – Lab: Integers, Definitions and Proofs

## Lab Overview

**Duration:** 1 class period (plus take-home completion)  
**Prerequisites:** Module 1 Classes 1–3  
**Tools:** Java (JDK 11+), any IDE or text editor, terminal/command line  

In this lab you will implement the core number-theory methods from Module 1 — parity checks, divisibility tests, and the Euclidean algorithm — and write unit tests for each. You will also explore edge cases involving negative numbers and zero.

---

## Learning Objectives

1. Translate mathematical definitions (even, odd, divides, gcd) into working Java methods.
2. Write test harnesses that verify mathematical theorems computationally.
3. Handle edge cases (negative numbers, zero) that the mathematical definitions cover but programmers often overlook.
4. Practice connecting code back to formal definitions by writing documentation comments.

---

## Setup

Create a file called `Module1Lab.java`. All methods go in this single class. Compile and run with:

```
javac Module1Lab.java
java -ea Module1Lab
```

The `-ea` flag enables assertions so your checks will run.

---

## Part 1: Parity Methods (from Class 1)

### Exercise 1.1 — Implement `isEven` and `isOdd`

Write two methods:

```java
public static boolean isEven(int n) {
    // TODO: return true if n is even
    // Math definition: n is even iff ∃k∈Z: n = 2k
    // Java translation: n % 2 == 0
}

public static boolean isOdd(int n) {
    // TODO: return true if n is odd
    // CAUTION: use n % 2 != 0, not n % 2 == 1 (think about negative numbers)
}
```

### Exercise 1.2 — Test Parity

Write a test method that verifies:

1. `isEven(0)` returns `true` (0 = 2·0).
2. `isEven(-4)` returns `true` (-4 = 2·(-2)).
3. `isOdd(-7)` returns `true` (-7 = 2·(-4) + 1).
4. Every integer from -100 to 100 is either even or odd (never both, never neither).
5. `isEven(n) != isOdd(n)` for all tested values.

```java
public static void testParity() {
    // TODO: implement the five checks above
    // Use assert for each check
    System.out.println("Parity tests passed.");
}
```

### Exercise 1.3 — Verify Parity Theorems

Write methods that verify these theorems for all pairs $(a, b)$ with $-50 \leq a, b \leq 50$:

| Theorem | Expected Result |
|---------|----------------|
| even + even | even |
| odd + odd | even |
| even + odd | odd |
| odd × odd | odd |
| even × any | even |

```java
public static void verifyParityRules() {
    for (int a = -50; a <= 50; a++) {
        for (int b = -50; b <= 50; b++) {
            // TODO: check each rule, assert on failure
        }
    }
    System.out.println("All parity rules verified.");
}
```

---

## Part 2: Divisibility Methods (from Class 2)

### Exercise 2.1 — Implement `divides`

```java
/**
 * Returns true if a divides b (a | b).
 * Math: a | b iff ∃k∈Z: b = ak
 * 
 * @throws ArithmeticException if a is 0
 */
public static boolean divides(int a, int b) {
    // TODO
}
```

### Exercise 2.2 — Test Divisibility Edge Cases

Test and explain each case:

| Expression | Expected | Why |
|-----------|----------|-----|
| `divides(3, 12)` | `true` | 12 = 3×4 |
| `divides(5, 0)` | `true` | 0 = 5×0 |
| `divides(7, 15)` | `false` | 15/7 is not an integer |
| `divides(-3, 9)` | `true` | 9 = (-3)×(-3) |
| `divides(4, -8)` | `true` | -8 = 4×(-2) |
| `divides(0, 5)` | exception | division by 0 undefined |

```java
public static void testDivides() {
    assert divides(3, 12);
    assert divides(5, 0);
    assert !divides(7, 15);
    assert divides(-3, 9);
    assert divides(4, -8);

    try {
        divides(0, 5);
        assert false : "Should have thrown exception";
    } catch (ArithmeticException e) {
        // expected
    }

    System.out.println("Divisibility tests passed.");
}
```

### Exercise 2.3 — Verify Transitivity

Write a method that tests: for all triples $(a, b, c)$ with $1 \leq a, b, c \leq 30$, if $a \mid b$ and $b \mid c$ then $a \mid c$.

```java
public static void verifyTransitivity() {
    for (int a = 1; a <= 30; a++) {
        for (int b = 1; b <= 30; b++) {
            for (int c = 1; c <= 30; c++) {
                if (divides(a, b) && divides(b, c)) {
                    assert divides(a, c) :
                        "Transitivity failed: " + a + "|" + b + " and " + b + "|" + c
                        + " but not " + a + "|" + c;
                }
            }
        }
    }
    System.out.println("Transitivity verified for a,b,c in [1,30].");
}
```

### Exercise 2.4 — List Divisors

Write `List<Integer> getDivisors(int n)` that returns all positive divisors of $n$. Test:
- `getDivisors(12)` → `[1, 2, 3, 4, 6, 12]`
- `getDivisors(1)` → `[1]`
- `getDivisors(28)` → `[1, 2, 4, 7, 14, 28]` (28 is a perfect number: $1+2+4+7+14 = 28$)

---

## Part 3: GCD and Primes (from Class 3)

### Exercise 3.1 — Implement `gcd`

```java
/**
 * Computes gcd(a, b) using the Euclidean algorithm.
 * 
 * Loop invariant: gcd(a, b) = gcd(original_a, original_b)
 * Variant function: b strictly decreases each iteration
 */
public static int gcd(int a, int b) {
    a = Math.abs(a);
    b = Math.abs(b);
    // TODO: implement the Euclidean algorithm
}
```

### Exercise 3.2 — Traced GCD

Write a version `gcdWithTrace(int a, int b)` that prints each step of the algorithm.

Test with:
- `gcdWithTrace(1071, 462)` — should produce 3 steps, result 21
- `gcdWithTrace(48, 18)` — should produce 3 steps, result 6
- `gcdWithTrace(17, 13)` — coprime, result 1

### Exercise 3.3 — Implement `isPrime`

```java
/**
 * Returns true if n is prime.
 * Checks divisors from 2 to sqrt(n).
 */
public static boolean isPrime(int n) {
    // TODO
}
```

Test: primes up to 30 are 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.

### Exercise 3.4 — Sieve of Eratosthenes

Implement a method `List<Integer> sieve(int limit)` that returns all primes up to `limit`.

Test:
- `sieve(100)` should return 25 primes
- `sieve(1000)` should return 168 primes

### Exercise 3.5 — Prime Factorization

Implement `List<Integer> primeFactors(int n)`.

Test:
- `primeFactors(84)` → `[2, 2, 3, 7]`
- `primeFactors(100)` → `[2, 2, 5, 5]`
- Verify that the product of the factors equals $n$ for all $n$ from 2 to 100.

---

## Part 4: Exploration and Edge Cases

### Exercise 4.1 — Negative Numbers and Zero

For each method, answer: what happens with negative inputs? With zero?

| Method | Negative input | Zero input | Your explanation |
|--------|---------------|------------|-----------------|
| `isEven(-6)` | ??? | `isEven(0)` = ??? | |
| `isOdd(-7)` | ??? | `isOdd(0)` = ??? | |
| `divides(-3, 9)` | ??? | `divides(5, 0)` = ??? | |
| `gcd(-12, 18)` | ??? | `gcd(0, 15)` = ??? | |
| `isPrime(-5)` | ??? | `isPrime(0)` = ??? | |

### Exercise 4.2 — The `%` Operator Pitfall

Java's `%` operator returns negative values for negative dividends:
- `(-7) % 2` returns `-1` (not `1`)
- `(-7) % 3` returns `-1` (not `2`)

Explain why `isOdd` should use `n % 2 != 0` rather than `n % 2 == 1`. Give a specific input where the two conditions give different results.

### Exercise 4.3 — Perfect Numbers

A **perfect number** equals the sum of its proper divisors ($1, 2, 3, \ldots$ but not $n$ itself). The first few perfect numbers are 6 and 28.

Using your `getDivisors` method, find all perfect numbers up to 10,000.

*(Expected: 6, 28, 496, 8128.)*

---

## Extension Challenges

### Challenge 1: Coprime Pairs
Write a method that counts how many integers from 1 to $n$ are coprime to $n$ (this is Euler's totient function $\phi(n)$). Compute $\phi(n)$ for $n = 1$ to $30$.

### Challenge 2: Goldbach's Conjecture (Empirical)
Goldbach's conjecture states that every even integer greater than 2 can be written as the sum of two primes. Write a program that verifies this for all even numbers from 4 to 10,000.

### Challenge 3: GCD and Fibonacci
Compute $\gcd(F_n, F_{n+1})$ for Fibonacci numbers $F_1$ through $F_{20}$. What do you notice? Can you explain why?

---

## Expected Outputs / Verification Criteria

Your lab is complete when:

- [ ] `isEven` and `isOdd` pass all tests including negatives and zero
- [ ] `divides` handles all cases including the $a = 0$ exception
- [ ] Transitivity of divisibility verified for range [1, 30]
- [ ] `getDivisors` produces correct results and identifies perfect numbers 6 and 28
- [ ] `gcd` matches hand-computed results (1071,462)→21, (48,18)→6
- [ ] `gcdWithTrace` prints correct steps
- [ ] `isPrime` correctly identifies all primes up to 100
- [ ] `sieve(100)` returns exactly 25 primes
- [ ] `primeFactors` produces factors whose product equals $n$ for all $n$ from 2 to 100
- [ ] Edge case table is filled in correctly
- [ ] `%` operator pitfall is explained with a concrete example

---

## Complete Starter Code

```java
import java.util.ArrayList;
import java.util.List;

/**
 * Module1Lab.java — Integers, Definitions and Proofs
 * 
 * Compile: javac Module1Lab.java
 * Run:     java -ea Module1Lab
 */
public class Module1Lab {

    // ==================== PART 1: PARITY ====================

    public static boolean isEven(int n) {
        // YOUR CODE HERE
        return false;
    }

    public static boolean isOdd(int n) {
        // YOUR CODE HERE
        return false;
    }

    public static void testParity() {
        // YOUR CODE HERE
    }

    public static void verifyParityRules() {
        // YOUR CODE HERE
    }

    // ==================== PART 2: DIVISIBILITY ====================

    public static boolean divides(int a, int b) {
        // YOUR CODE HERE
        return false;
    }

    public static List<Integer> getDivisors(int n) {
        // YOUR CODE HERE
        return new ArrayList<>();
    }

    public static void testDivides() {
        // YOUR CODE HERE
    }

    public static void verifyTransitivity() {
        // YOUR CODE HERE
    }

    // ==================== PART 3: GCD AND PRIMES ====================

    public static int gcd(int a, int b) {
        // YOUR CODE HERE
        return 0;
    }

    public static int gcdWithTrace(int a, int b) {
        // YOUR CODE HERE
        return 0;
    }

    public static boolean isPrime(int n) {
        // YOUR CODE HERE
        return false;
    }

    public static List<Integer> sieve(int limit) {
        // YOUR CODE HERE
        return new ArrayList<>();
    }

    public static List<Integer> primeFactors(int n) {
        // YOUR CODE HERE
        return new ArrayList<>();
    }

    // ==================== MAIN ====================

    public static void main(String[] args) {
        System.out.println("=== MODULE 1 LAB ===\n");

        System.out.println("--- Part 1: Parity ---");
        testParity();
        verifyParityRules();

        System.out.println("\n--- Part 2: Divisibility ---");
        testDivides();
        verifyTransitivity();
        System.out.println("Divisors of 12: " + getDivisors(12));
        System.out.println("Divisors of 28: " + getDivisors(28));

        System.out.println("\n--- Part 3: GCD and Primes ---");
        gcdWithTrace(1071, 462);
        gcdWithTrace(48, 18);
        System.out.println("Primes up to 100: " + sieve(100));
        System.out.println("Prime factorization of 84: " + primeFactors(84));

        // Verify factorization for 2..100
        for (int n = 2; n <= 100; n++) {
            List<Integer> factors = primeFactors(n);
            int product = 1;
            for (int f : factors) product *= f;
            assert product == n : "Factorization failed for " + n;
        }
        System.out.println("Factorization verified for 2..100");

        System.out.println("\n=== ALL TESTS PASSED ===");
    }
}
```

---

## Solution Key

```java
import java.util.ArrayList;
import java.util.List;

public class Module1LabSolution {

    // ==================== PART 1: PARITY ====================

    public static boolean isEven(int n) {
        return n % 2 == 0;
    }

    public static boolean isOdd(int n) {
        return n % 2 != 0;  // NOT n % 2 == 1 (fails for negatives in Java)
    }

    public static void testParity() {
        assert isEven(0)  : "0 should be even";
        assert isEven(-4) : "-4 should be even";
        assert isOdd(-7)  : "-7 should be odd";

        for (int n = -100; n <= 100; n++) {
            assert isEven(n) || isOdd(n)   : n + " is neither even nor odd";
            assert isEven(n) != isOdd(n)   : n + " is both even and odd";
        }
        System.out.println("Parity tests passed.");
    }

    public static void verifyParityRules() {
        for (int a = -50; a <= 50; a++) {
            for (int b = -50; b <= 50; b++) {
                if (isEven(a) && isEven(b)) assert isEven(a + b);
                if (isOdd(a)  && isOdd(b))  assert isEven(a + b);
                if (isEven(a) && isOdd(b))  assert isOdd(a + b);
                if (isOdd(a)  && isOdd(b))  assert isOdd(a * b);
                if (isEven(a))              assert isEven(a * b);
            }
        }
        System.out.println("All parity rules verified.");
    }

    // ==================== PART 2: DIVISIBILITY ====================

    public static boolean divides(int a, int b) {
        if (a == 0) throw new ArithmeticException("Cannot divide by zero");
        return b % a == 0;
    }

    public static List<Integer> getDivisors(int n) {
        List<Integer> result = new ArrayList<>();
        int absN = Math.abs(n);
        for (int d = 1; d <= absN; d++) {
            if (absN % d == 0) result.add(d);
        }
        return result;
    }

    public static void testDivides() {
        assert divides(3, 12);
        assert divides(5, 0);
        assert !divides(7, 15);
        assert divides(-3, 9);
        assert divides(4, -8);
        try {
            divides(0, 5);
            assert false : "Should have thrown";
        } catch (ArithmeticException e) { /* expected */ }
        System.out.println("Divisibility tests passed.");
    }

    public static void verifyTransitivity() {
        for (int a = 1; a <= 30; a++)
            for (int b = 1; b <= 30; b++)
                for (int c = 1; c <= 30; c++)
                    if (divides(a, b) && divides(b, c))
                        assert divides(a, c);
        System.out.println("Transitivity verified.");
    }

    // ==================== PART 3: GCD AND PRIMES ====================

    public static int gcd(int a, int b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b != 0) { int r = a % b; a = b; b = r; }
        return a;
    }

    public static int gcdWithTrace(int a, int b) {
        a = Math.abs(a); b = Math.abs(b);
        System.out.printf("gcd(%d, %d):%n", a, b);
        while (b != 0) {
            int q = a / b, r = a % b;
            System.out.printf("  %d = %d × %d + %d%n", a, b, q, r);
            a = b; b = r;
        }
        System.out.printf("  gcd = %d%n", a);
        return a;
    }

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) {
            if (n % d == 0) return false;
        }
        return true;
    }

    public static List<Integer> sieve(int limit) {
        boolean[] composite = new boolean[limit + 1];
        List<Integer> primes = new ArrayList<>();
        for (int p = 2; p <= limit; p++) {
            if (!composite[p]) {
                primes.add(p);
                for (long m = (long) p * p; m <= limit; m += p)
                    composite[(int) m] = true;
            }
        }
        return primes;
    }

    public static List<Integer> primeFactors(int n) {
        List<Integer> factors = new ArrayList<>();
        for (int d = 2; d * d <= n; d++) {
            while (n % d == 0) { factors.add(d); n /= d; }
        }
        if (n > 1) factors.add(n);
        return factors;
    }

    public static void main(String[] args) {
        System.out.println("=== MODULE 1 LAB — SOLUTION ===\n");

        testParity();
        verifyParityRules();
        testDivides();
        verifyTransitivity();

        System.out.println("Divisors of 12: " + getDivisors(12));
        System.out.println("Divisors of 28: " + getDivisors(28));

        gcdWithTrace(1071, 462);
        gcdWithTrace(48, 18);

        System.out.println("Primes to 100: " + sieve(100));
        System.out.println("Count: " + sieve(100).size());
        System.out.println("Factors of 84: " + primeFactors(84));

        // Verify factorization
        for (int n = 2; n <= 100; n++) {
            int product = 1;
            for (int f : primeFactors(n)) product *= f;
            assert product == n;
        }
        System.out.println("Factorization verified for 2..100");

        // Perfect numbers
        System.out.println("\nPerfect numbers up to 10000:");
        for (int n = 2; n <= 10000; n++) {
            int sum = 0;
            for (int d : getDivisors(n)) sum += d;
            sum -= n;  // exclude n itself
            if (sum == n) System.out.println("  " + n);
        }

        System.out.println("\n=== ALL TESTS PASSED ===");
    }
}
```
