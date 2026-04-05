# Module 3 Assignment: Logic, Quantifiers, and Program Reasoning

**Integrative Assignment — Modules 1–3**

This assignment synthesizes number theory (Modules 1–2) with logic and program reasoning (Module 3). You will specify, code, and prove the correctness of methods that combine mathematical reasoning with Java implementation.

**Due:** End of Module 3

---

## Part A: Mathematical Proofs

### Problem A1: Inference Chains (15 points)

From the following premises, derive the conclusion using named inference rules. Show every step.

**Premises:**
1. If $n$ is a perfect square, then $n$ has an odd number of divisors.
2. If $n$ has an odd number of divisors, then $n$ is not prime (for $n > 1$).
3. $n = 36$ is a perfect square.

**Derive:** $36$ is not prime.

### Problem A2: Quantified Statements and Negation (15 points)

(a) Write the formal negation of: "For every even integer $n > 2$, there exist primes $p$ and $q$ such that $n = p + q$." (Goldbach's conjecture.)

(b) Explain what a counterexample to Goldbach's conjecture would look like, in precise mathematical language.

(c) Prove: $\exists n \in \mathbb{Z}^+ : n \text{ is prime} \wedge n \text{ is even}$. (Provide a witness.)

### Problem A3: Hoare Triple Proofs (20 points)

Prove each Hoare triple correct:

(a) $\{x \geq 0\}\ y = x + 1\ \{y > 0\}$

(b) $\{a > 0 \wedge b > 0\}\ q = a / b;\ r = a \% b\ \{a = b \cdot q + r \wedge 0 \leq r < b\}$
(This is the quotient-remainder theorem as a Hoare triple — connects to Module 2.)

(c) $\{n \geq 2\}$ `isPrime(n)` returns correctly $\{(\text{result} = \text{true}) \leftrightarrow (\forall d \in [2, \sqrt{n}] : d \nmid n)\}$
(Argue informally using the loop structure of a trial-division primality test.)

### Problem A4: Contrapositive and Contradiction (15 points)

(a) Prove by contrapositive: If $n^2$ is divisible by 3, then $n$ is divisible by 3.

(b) Prove by contradiction: $\sqrt{3}$ is irrational.

(c) Express both proofs as inference rule applications. What rule does proof by contrapositive correspond to? What about proof by contradiction?

### Problem A5: Loop Invariant Proof (15 points)

Consider the following algorithm for computing $a^b \mod m$ (modular exponentiation):

```
result = 1
base = a % m
exp = b
while exp > 0:
    if exp is odd:
        result = (result * base) % m
    exp = exp / 2          // integer division
    base = (base * base) % m
return result
```

(a) State the loop invariant: at the start of each iteration, $\text{result} \cdot \text{base}^{\text{exp}} \equiv a^b \pmod{m}$.

(b) Prove **initialization**: the invariant holds before the first iteration.

(c) Prove **maintenance**: if the invariant holds at the start of an iteration, it holds at the start of the next.

(d) Prove **termination**: the loop terminates and the postcondition ($\text{result} = a^b \mod m$) follows.

---

## Part B: Java Programming

### Problem B1: Verified containsPrime (20 points)

Write a Java method with full specification and verification:

```java
/**
 * @requires arr != null
 * @ensures returns true iff arr contains at least one prime number
 */
public static boolean containsPrime(int[] arr)
```

Requirements:
1. Add an `assert` for the precondition.
2. After finding a prime, add an `assert` confirming `isPrime(arr[i])`.
3. Write a separate `verifyContainsPrime(int[] arr, boolean result)` method that independently checks the postcondition (scans the entire array).
4. Write a test harness that calls `containsPrime` on at least 5 different arrays (including edge cases: empty array, all primes, no primes, single element) and verifies with `verifyContainsPrime`.

### Problem B2: GCD with Full Invariant Tracking (20 points)

Implement Euclid's algorithm with complete verification:

```java
/**
 * @requires a >= 0 && b >= 0 && (a > 0 || b > 0)
 * @ensures result == gcd(a, b)
 */
public static int gcdVerified(int a, int b)
```

Requirements:
1. At each iteration, print: current values, invariant status, variant value.
2. Assert the loop invariant: `gcd(a, b) == gcd(origA, origB)`.
3. Assert the variant is strictly decreasing: the new value of `b` is less than the old.
4. After the loop, assert the postcondition: result divides both original inputs, and no larger number does.
5. Write a helper `int gcdNaive(int a, int b)` that computes GCD by checking all divisors, and use it to verify your result.

### Problem B3: Quantifier Library (15 points)

Implement a generic quantifier library:

```java
public static <T> boolean forAll(T[] arr, Predicate<T> p)
public static <T> boolean exists(T[] arr, Predicate<T> p)
public static <T> Optional<T> findWitness(T[] arr, Predicate<T> p)
public static <T> Optional<T> findCounterexample(T[] arr, Predicate<T> p)
```

Demonstrate with:
1. "All elements of `{2, 4, 6, 8}` are even" → true
2. "There exists a prime in `{4, 6, 8, 10}`" → false (with counterexample: none is prime)
3. "For all primes $p$ in `{2, 3, 5, 7, 11}`, $p + 2$ is also prime" → false (witness of failure: find the counterexample)
4. Verify De Morgan for quantifiers: `forAll(arr, p)` equals `!exists(arr, p.negate())`

### Problem B4: Binary Search Verified (15 points)

Implement binary search with full Hoare-style annotations:

```java
/**
 * @requires arr != null && isSorted(arr)
 * @ensures (result == -1 && key not in arr) || (0 <= result < arr.length && arr[result] == key)
 */
public static int binarySearchVerified(int[] arr, int key)
```

Requirements:
1. Assert preconditions.
2. State the loop invariant as a comment: "If key is in arr, then key is in arr[lo..hi]."
3. Assert the invariant at the start of each iteration.
4. Assert postconditions before each `return`.
5. Test with arrays of sizes 0, 1, 10, 1000. Include keys that are present, absent, equal to first/last elements.

### Problem B5: Specification and Proof Essay (15 points)

Write a 300–500 word essay with code examples explaining:

1. How logical inference rules (modus ponens, modus tollens) appear in everyday debugging.
2. How Design by Contract (preconditions + postconditions) connects to Hoare logic.
3. A concrete example where a postcondition violation helped you find a bug (real or constructed).

Include at least one Java code snippet illustrating your points.

---

## Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| **A1** Inference chain | 15 | Every step named, correct application of rules |
| **A2** Quantifier negation | 15 | Correct negation, clear counterexample description, valid witness |
| **A3** Hoare triple proofs | 20 | Correct use of assignment axiom, composition, conditional rule |
| **A4** Contrapositive/contradiction | 15 | Both proofs complete, correct identification of inference rules |
| **A5** Loop invariant | 15 | Init + maintenance + termination, all rigorous |
| **B1** containsPrime | 20 | Correct code, assertions, verification method, 5+ test cases |
| **B2** GCD verified | 20 | Invariant tracking, variant decreasing, naive check, postcondition |
| **B3** Quantifier library | 15 | Generic implementation, 4 demonstrations, De Morgan verified |
| **B4** Binary search | 15 | Full annotations, invariant asserted, edge case tests |
| **B5** Essay | 15 | Depth of insight, code examples, clear connection to theory |
| **Total** | **165** | (Extra credit possible on any part for exceptional depth) |

---

## Solution Key

### Solution A1

1. $P$: "$36$ is a perfect square" — Given (premise 3).
2. $P \rightarrow Q$: "If $n$ is a perfect square, then $n$ has an odd number of divisors" — Premise 1.
3. $Q$: "$36$ has an odd number of divisors" — By **modus ponens** from (1) and (2).
4. $Q \rightarrow R$: "If $n$ has an odd number of divisors, then $n$ is not prime (for $n > 1$)" — Premise 2.
5. $R$: "$36$ is not prime" — By **modus ponens** from (3) and (4).

Alternatively, by **hypothetical syllogism** from (2) and (4): "If $n$ is a perfect square, then $n$ is not prime." Combined with (1) by modus ponens: "$36$ is not prime." $\blacksquare$

### Solution A2

(a) $\exists n \in \mathbb{Z} : n \text{ is even} \wedge n > 2 \wedge \forall p, q \text{ prime} : n \neq p + q$

(b) A counterexample would be an even integer $n > 2$ such that for every pair of primes $p$ and $q$ with $p + q = n$, no such pair exists. In other words, there is no way to write $n$ as a sum of two primes.

(c) Witness: $n = 2$. $2$ is positive, $2$ is even ($2 = 2 \cdot 1$), and $2$ is prime (its only divisors are 1 and 2). $\blacksquare$

### Solution A3

**(a)** Pre: $x \geq 0$. After $y = x + 1$: $y = x + 1 \geq 0 + 1 = 1 > 0$. Post verified. $\blacksquare$

**(b)** This follows from the Quotient-Remainder Theorem (Module 2): for $a > 0, b > 0$, Java's `/` and `%` operators satisfy $a = b \cdot (a/b) + (a \% b)$ and $0 \leq a \% b < b$. Pre guarantees $a > 0, b > 0$, so integer division is well-defined and the QRT holds. $\blacksquare$

**(c)** The loop iterates $d$ from 2 to $\lfloor\sqrt{n}\rfloor$. If any $d | n$, it returns false (found a divisor, so not prime). If no such $d$ exists, returns true. The invariant is: "for all $d'$ in $[2, d-1]$, $d' \nmid n$." At termination ($d > \sqrt{n}$): "for all $d'$ in $[2, \sqrt{n}]$, $d' \nmid n$." This is exactly the postcondition. $\blacksquare$

### Solution A4

**(a)** Contrapositive: "If $3 \nmid n$, then $3 \nmid n^2$." Suppose $3 \nmid n$. Then $n \equiv 1$ or $n \equiv 2 \pmod{3}$. If $n \equiv 1$: $n^2 \equiv 1 \pmod{3}$. If $n \equiv 2$: $n^2 \equiv 4 \equiv 1 \pmod{3}$. In both cases $3 \nmid n^2$. $\blacksquare$ (This corresponds to **modus tollens**: from $P \rightarrow Q$ prove $\neg Q \rightarrow \neg P$.)

**(b)** Assume $\sqrt{3} = a/b$ with $\gcd(a,b) = 1$. Then $3b^2 = a^2$, so $3 | a^2$. By part (a), $3 | a$, so $a = 3k$. Then $3b^2 = 9k^2$, so $b^2 = 3k^2$, so $3 | b^2$, so $3 | b$. But then $3 | \gcd(a,b)$, contradicting $\gcd(a,b) = 1$. $\blacksquare$ (Contradiction corresponds to: assume $P$, derive $\bot$, conclude $\neg P$.)

### Solution A5

**(b) Initialization:** Before the loop: `result = 1`, `base = a % m`, `exp = b`. So $\text{result} \cdot \text{base}^{\text{exp}} = 1 \cdot (a \bmod m)^b \equiv a^b \pmod{m}$. ✓

**(c) Maintenance:** Suppose the invariant holds: $\text{result} \cdot \text{base}^{\text{exp}} \equiv a^b$.

- If `exp` is odd: new `result` $= \text{result} \cdot \text{base}$. Then new `exp` $= (\text{exp}-1)/2$, new `base` $= \text{base}^2$. New product: $(\text{result} \cdot \text{base}) \cdot (\text{base}^2)^{(\text{exp}-1)/2} = \text{result} \cdot \text{base}^{1 + \text{exp} - 1} = \text{result} \cdot \text{base}^{\text{exp}} \equiv a^b$. ✓

- If `exp` is even: result unchanged. New `exp` $= \text{exp}/2$, new `base` $= \text{base}^2$. New product: $\text{result} \cdot (\text{base}^2)^{\text{exp}/2} = \text{result} \cdot \text{base}^{\text{exp}} \equiv a^b$. ✓

**(d) Termination:** `exp` is a non-negative integer, and it is halved (integer division) each iteration. Since $\lfloor exp/2 \rfloor < exp$ for $exp > 0$, `exp` strictly decreases and eventually reaches 0. When `exp = 0`: $\text{result} \cdot \text{base}^0 = \text{result} \equiv a^b \pmod{m}$. $\blacksquare$

### Solution B1

```java
public static boolean containsPrime(int[] arr) {
    assert arr != null : "Precondition: arr must not be null";
    for (int i = 0; i < arr.length; i++) {
        if (isPrime(arr[i])) {
            assert isPrime(arr[i]) : "Should be prime: " + arr[i];
            return true;
        }
    }
    return false;
}

public static void verifyContainsPrime(int[] arr, boolean result) {
    boolean expected = false;
    for (int x : arr) {
        if (isPrime(x)) { expected = true; break; }
    }
    assert result == expected : "Postcondition violated: expected "
            + expected + " but got " + result;
}

// Test harness
public static void testContainsPrime() {
    int[][] tests = {
        {},              // empty
        {4, 6, 8, 10},  // no primes
        {2, 3, 5, 7},   // all primes
        {4, 6, 7, 8},   // one prime
        {1}             // single non-prime
    };
    boolean[] expected = {false, false, true, true, false};

    for (int i = 0; i < tests.length; i++) {
        boolean result = containsPrime(tests[i]);
        verifyContainsPrime(tests[i], result);
        assert result == expected[i]
            : "Test " + i + " failed: expected " + expected[i];
        System.out.println("Test " + i + " passed: " + result);
    }
}
```

### Solution B2

```java
public static int gcdVerified(int a, int b) {
    assert a >= 0 && b >= 0 && (a > 0 || b > 0);
    int origA = a, origB = b;
    
    while (b != 0) {
        int oldB = b;
        System.out.printf("  a=%d, b=%d | gcd(%d,%d)=gcd(%d,%d) | variant=%d%n",
                a, b, a, b, origA, origB, b);
        
        // Invariant: gcd(a,b) == gcd(origA, origB)
        assert gcdNaive(a, b) == gcdNaive(origA, origB)
            : "Invariant broken";
        
        int r = a % b;
        a = b;
        b = r;
        
        // Variant strictly decreasing
        assert b < oldB : "Variant not decreasing";
    }
    
    // Postcondition: a == gcd(origA, origB)
    assert a == gcdNaive(origA, origB) : "Postcondition failed";
    
    // Verify: a divides both origA and origB
    if (a > 0) {
        assert origA % a == 0 && origB % a == 0
            : "Result does not divide both inputs";
        // Verify: no larger common divisor
        for (int d = a + 1; d <= Math.max(origA, origB); d++) {
            assert !(origA % d == 0 && origB % d == 0)
                : d + " is a larger common divisor";
        }
    }
    
    return a;
}

public static int gcdNaive(int a, int b) {
    if (a == 0) return b;
    if (b == 0) return a;
    int g = 1;
    for (int d = 1; d <= Math.min(a, b); d++) {
        if (a % d == 0 && b % d == 0) g = d;
    }
    return g;
}
```

### Solution B3

```java
public static <T> boolean forAll(T[] arr, Predicate<T> p) {
    for (T x : arr) if (!p.test(x)) return false;
    return true;
}

public static <T> boolean exists(T[] arr, Predicate<T> p) {
    for (T x : arr) if (p.test(x)) return true;
    return false;
}

public static <T> Optional<T> findWitness(T[] arr, Predicate<T> p) {
    for (T x : arr) if (p.test(x)) return Optional.of(x);
    return Optional.empty();
}

public static <T> Optional<T> findCounterexample(T[] arr, Predicate<T> p) {
    for (T x : arr) if (!p.test(x)) return Optional.of(x);
    return Optional.empty();
}

// Demonstrations:
Integer[] evens = {2, 4, 6, 8};
Integer[] composites = {4, 6, 8, 10};
Integer[] primes = {2, 3, 5, 7, 11};

// 1. "All evens are even" → true
forAll(evens, n -> n % 2 == 0);

// 2. "Exists prime in composites" → false
exists(composites, Module3Assignment::isPrime);

// 3. "For all primes p, p+2 is also prime" → findCounterexample
// 2→4(no), but actually 2+2=4 not prime. Counterexample: 7 (7+2=9 not prime)
findCounterexample(primes, p -> isPrime(p + 2));
// Returns Optional[2] since 2+2=4 is not prime

// 4. De Morgan
Predicate<Integer> isEven = n -> n % 2 == 0;
boolean a = forAll(evens, isEven);
boolean b = !exists(evens, isEven.negate());
assert a == b;  // De Morgan verified
```

### Solution B4

```java
public static int binarySearchVerified(int[] arr, int key) {
    assert arr != null : "Precondition: arr not null";
    assert isSorted(arr) : "Precondition: arr sorted";
    
    int lo = 0, hi = arr.length - 1;
    
    while (lo <= hi) {
        // Invariant: if key is in arr, then key is in arr[lo..hi]
        assert lo >= 0 && hi < arr.length;
        
        int mid = lo + (hi - lo) / 2;
        
        if (arr[mid] == key) {
            // Postcondition: found
            assert 0 <= mid && mid < arr.length && arr[mid] == key;
            return mid;
        }
        if (arr[mid] < key) lo = mid + 1;
        else hi = mid - 1;
    }
    
    // Postcondition: not found — verify key not in arr
    for (int x : arr) assert x != key : "Key " + key + " exists but was not found";
    return -1;
}

// Tests
int[] empty = {};
int[] single = {42};
int[] medium = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
int[] large = new int[1000];
for (int i = 0; i < 1000; i++) large[i] = i * 2;

assert binarySearchVerified(empty, 5) == -1;
assert binarySearchVerified(single, 42) == 0;
assert binarySearchVerified(single, 41) == -1;
assert binarySearchVerified(medium, 1) == 0;   // first
assert binarySearchVerified(medium, 19) == 9;  // last
assert binarySearchVerified(medium, 11) == 5;  // middle
assert binarySearchVerified(medium, 4) == -1;  // absent
assert binarySearchVerified(large, 0) == 0;
assert binarySearchVerified(large, 1998) == 999;
assert binarySearchVerified(large, 1000) == 500;
assert binarySearchVerified(large, 1) == -1;   // odd, not in array
```
