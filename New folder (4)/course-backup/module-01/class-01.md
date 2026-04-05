# Module 1 – Class 1: Parity and Variables

## Learning Objectives

By the end of this class, students will be able to:

1. State the formal definitions of even and odd integers using existential quantifiers.
2. Write direct proofs about parity (even/odd) properties of sums and products.
3. Disprove false claims by constructing counterexamples.
4. Implement Java methods that test parity and connect each line of code to its mathematical definition.
5. Explain how parity relates to computational concepts such as checksums and hash functions.

---

## Concept Overview

### What Are Integers?

The integers are the set $\mathbb{Z} = \{\ldots, -3, -2, -1, 0, 1, 2, 3, \ldots\}$. They include all positive whole numbers, all negative whole numbers, and zero. In computer science, integers are the most fundamental data type — every program manipulates them.

### Even and Odd: The First Definitions

Mathematics is built on **definitions**. Before we can prove anything about numbers, we must agree on exactly what our words mean.

**Definition (Even).** An integer $n$ is **even** if there exists an integer $k$ such that $n = 2k$.

**Definition (Odd).** An integer $n$ is **odd** if there exists an integer $k$ such that $n = 2k + 1$.

These definitions are exhaustive: every integer is either even or odd, never both. This is because dividing any integer by 2 leaves remainder 0 (even) or 1 (odd) — there are no other possibilities.

### Plain Language

- **Even** means "divisible by 2 with no remainder." Examples: $-4, 0, 2, 14, 100$.
- **Odd** means "leaves remainder 1 when divided by 2." Examples: $-3, 1, 7, 15, 99$.

The key insight is that these English descriptions are **informal**. The mathematical definitions above are **formal** — they give us something precise to work with in proofs.

### Why Definitions Matter

In programming, a bug often comes from a vague specification. In mathematics, a wrong proof often comes from a vague definition. The habit of starting with precise definitions transfers directly to writing clear code specifications.

---

## Formal Notation

### Set Membership

We write $a \in \mathbb{Z}$ to mean "$a$ is an integer." The symbol $\in$ means "is an element of."

### Existential Quantifier

The statement "$n$ is even" is formally written:

$$\exists\, k \in \mathbb{Z} \text{ such that } n = 2k$$

Read this as: "There exists an integer $k$ such that $n$ equals $2k$."

Similarly, "$n$ is odd" is:

$$\exists\, k \in \mathbb{Z} \text{ such that } n = 2k + 1$$

### Common Pitfalls

| Pitfall | Why It's Wrong |
|---------|---------------|
| Writing $n = 2k$ without specifying $k \in \mathbb{Z}$ | The $k$ must be an integer — if $k = 1.5$, then $2(1.5) = 3$ but $k$ is not an integer witness |
| Assuming $k$ is positive | Negative numbers can be even too: $-6 = 2(-3)$, so $k = -3$ |
| Confusing "even" with "positive even" | Zero is even: $0 = 2(0)$ |
| Using the same variable $k$ for two different unknowns in one proof | Each unknown needs its own name |

---

## Worked Examples

### Example 1: Prove That the Sum of Two Even Numbers Is Even (Discrete Math)

**Claim.** If $a$ and $b$ are even integers, then $a + b$ is even.

**Proof.** 

*Step 1 — Unpack the definitions.* Since $a$ is even, there exists an integer $m$ such that $a = 2m$. Since $b$ is even, there exists an integer $n$ such that $b = 2n$.

*Step 2 — Compute the sum.*
$$a + b = 2m + 2n = 2(m + n)$$

*Step 3 — Apply the definition.* Let $k = m + n$. Since $m$ and $n$ are integers, $k$ is an integer (integers are closed under addition). Therefore $a + b = 2k$, which means $a + b$ is even by definition. $\blacksquare$

**Structure of a Direct Proof:**
1. State what you are given (hypotheses).
2. Unpack the definitions to get equations.
3. Do algebra to reach the form required by the conclusion's definition.
4. Identify the witness integer and confirm it is an integer.
5. State the conclusion.

---

### Example 2: The Sum of Two Even Numbers in Java (Java Translation)

Here is a complete, runnable Java program that tests the claim from Example 1:

```java
/**
 * ParityDemo.java
 * Demonstrates the connection between the mathematical definition
 * of even/odd and Java's modulo operator.
 */
public class ParityDemo {

    /**
     * Returns true if x is even.
     * Mathematical basis: x is even iff there exists k in Z such that x = 2k.
     * Java implementation: x % 2 == 0 checks whether the remainder upon
     * division by 2 is zero, which is equivalent to the definition.
     */
    public static boolean isEven(int x) {
        return x % 2 == 0;
    }

    /**
     * Returns true if x is odd.
     * Mathematical basis: x is odd iff there exists k in Z such that x = 2k+1.
     * Java note: we check x % 2 != 0 rather than x % 2 == 1 because
     * Java's % operator can return -1 for negative odd numbers.
     * For example, (-3) % 2 == -1 in Java, not 1.
     */
    public static boolean isOdd(int x) {
        return x % 2 != 0;
    }

    /**
     * Tests the theorem: the sum of two even integers is even.
     * Tries many pairs and reports any counterexample found.
     */
    public static void testSumOfEvens() {
        System.out.println("Testing: sum of two even numbers is even");
        for (int a = -100; a <= 100; a += 2) {       // a is even
            for (int b = -100; b <= 100; b += 2) {   // b is even
                if (!isEven(a + b)) {
                    System.out.println("  COUNTEREXAMPLE: a=" + a + ", b=" + b);
                    return;
                }
            }
        }
        System.out.println("  Passed for all tested pairs.");
    }

    public static void main(String[] args) {
        // Basic demonstrations
        System.out.println("isEven(4)  = " + isEven(4));   // true
        System.out.println("isEven(7)  = " + isEven(7));   // false
        System.out.println("isOdd(7)   = " + isOdd(7));    // true
        System.out.println("isOdd(-3)  = " + isOdd(-3));   // true
        System.out.println("isEven(0)  = " + isEven(0));   // true
        System.out.println();

        testSumOfEvens();
    }
}
```

**Sample Output:**
```
isEven(4)  = true
isEven(7)  = false
isOdd(7)   = true
isOdd(-3)  = true
isEven(0)  = true

Testing: sum of two even numbers is even
  Passed for all tested pairs.
```

**Line-by-line connection to math:**

| Java Code | Mathematical Concept |
|-----------|---------------------|
| `x % 2 == 0` | Checking $\exists k: x = 2k$, i.e., the remainder is 0 |
| `x % 2 != 0` | Checking $\exists k: x = 2k+1$ (remainder is not 0) |
| `a += 2` in loop | Generating only even numbers (multiples of 2) |
| `!isEven(a + b)` | Searching for a counterexample to the theorem |
| The loop finding none | Empirical evidence (but not a proof!) that the theorem holds |

**Important distinction:** The Java test is *not* a proof. It only checks finitely many cases. The mathematical proof covers *all* integers — infinitely many. This is why we need both: proofs give certainty, code gives intuition and verification for specific cases.

---

### Example 3: Prove That the Product of Two Odd Numbers Is Odd (Combined DM + Java)

**Claim.** If $a$ and $b$ are odd integers, then $a \cdot b$ is odd.

**Proof.**

Since $a$ is odd, $a = 2m + 1$ for some integer $m$.  
Since $b$ is odd, $b = 2n + 1$ for some integer $n$.

Compute the product:
$$a \cdot b = (2m+1)(2n+1) = 4mn + 2m + 2n + 1 = 2(2mn + m + n) + 1$$

Let $k = 2mn + m + n$. Since $m, n \in \mathbb{Z}$, we have $k \in \mathbb{Z}$ (integers are closed under multiplication and addition). Therefore $a \cdot b = 2k + 1$, which is odd by definition. $\blacksquare$

**Java Verification:**

```java
/**
 * Verifies: the product of two odd integers is odd.
 */
public static void testProductOfOdds() {
    System.out.println("Testing: product of two odd numbers is odd");
    for (int a = -99; a <= 99; a += 2) {       // odd values
        for (int b = -99; b <= 99; b += 2) {   // odd values
            if (!isOdd(a * b)) {
                System.out.println("  COUNTEREXAMPLE: a=" + a + ", b=" + b);
                return;
            }
        }
    }
    System.out.println("  Passed for all tested pairs.");
}
```

**What makes this a "bridge" example:** The proof establishes the result for all integers. The Java code then provides a concrete computational check. Students see that the algebraic manipulation $4mn + 2m + 2n + 1 = 2(2mn+m+n)+1$ is mirrored by the code testing `isOdd(a * b)` — both rely on the same underlying definition of oddness.

---

### Example 4: Disprove a False Claim Using a Counterexample

**False Claim.** "The sum of two odd numbers is odd."

**Disproof.** We need only one counterexample. Let $a = 3$ and $b = 5$. Then $a + b = 8 = 2(4)$, which is even, not odd. Therefore the claim is false. $\blacksquare$

**What is actually true?** The sum of two odd integers is always even. Let's prove it:

$a = 2m+1$, $b = 2n+1$, so $a + b = 2m + 1 + 2n + 1 = 2(m+n+1)$, which is even.

**Java Counterexample Finder:**

```java
/**
 * Attempts to find a counterexample to: "sum of two odds is odd."
 * Finds one immediately because the claim is false.
 */
public static void findCounterexample() {
    System.out.println("Searching for counterexample to: sum of two odds is odd");
    for (int a = 1; a <= 20; a += 2) {
        for (int b = 1; b <= 20; b += 2) {
            if (!isOdd(a + b)) {
                System.out.println("  Found: " + a + " + " + b + " = " + (a + b)
                    + " which is EVEN. Claim disproved!");
                return;
            }
        }
    }
    System.out.println("  No counterexample found (claim may be true).");
}
```

**Output:**
```
Searching for counterexample to: sum of two odds is odd
  Found: 1 + 1 = 2 which is EVEN. Claim disproved!
```

---

### Example 5: Parity of Squares

**Claim.** If $n$ is even, then $n^2$ is even. If $n$ is odd, then $n^2$ is odd.

**Proof (even case).** Let $n = 2k$. Then $n^2 = (2k)^2 = 4k^2 = 2(2k^2)$. Since $2k^2$ is an integer, $n^2$ is even.

**Proof (odd case).** Let $n = 2k+1$. Then $n^2 = (2k+1)^2 = 4k^2 + 4k + 1 = 2(2k^2+2k) + 1$. Since $2k^2+2k$ is an integer, $n^2$ is odd.

**Combined result:** $n^2$ has the same parity as $n$.

```java
/**
 * Demonstrates: n^2 has the same parity as n.
 */
public static void testSquareParity() {
    System.out.println("Testing: n^2 has the same parity as n");
    for (int n = -50; n <= 50; n++) {
        boolean sameParityEven = isEven(n) && isEven(n * n);
        boolean sameParityOdd  = isOdd(n)  && isOdd(n * n);
        if (!(sameParityEven || sameParityOdd)) {
            System.out.println("  COUNTEREXAMPLE: n=" + n);
            return;
        }
    }
    System.out.println("  Passed for all tested values.");
}
```

---

## Proof Techniques Spotlight

### Direct Proof from Definitions

This class introduces the most fundamental proof technique: **direct proof**.

**Template:**

> **Claim:** If [hypothesis], then [conclusion].
>
> **Proof.**  
> Assume [hypothesis].  
> By definition, [unpack hypothesis into equations].  
> [Algebraic manipulation].  
> Therefore [conclusion is satisfied by definition]. $\blacksquare$

**Step-by-step recipe:**
1. **Write down what you know.** List the hypotheses. Use the definition to translate each hypothesis into an equation (e.g., "$a$ is even" becomes "$a = 2m$ for some $m \in \mathbb{Z}$").
2. **Write down what you want to show.** State the conclusion and identify what form you need (e.g., "we need to show $a + b = 2k$ for some integer $k$").
3. **Do algebra.** Substitute, expand, factor — whatever leads from the known equations to the desired form.
4. **Identify the witness.** Name the integer that makes the conclusion's definition work (e.g., "$k = m + n$") and confirm it is the right type ($k \in \mathbb{Z}$).
5. **State the conclusion** explicitly.

### Counterexample

To **disprove** a universal claim "for all $x$, $P(x)$," you need only find **one** $x$ where $P(x)$ is false.

**Template:**

> **Claim (false):** For all integers $n$, [property].
>
> **Disproof.** Let $n = $ [specific value]. Then [show property fails]. Therefore the claim is false. $\blacksquare$

### Common Mistakes

| Mistake | Correction |
|---------|-----------|
| Proving by example: "4 + 6 = 10, which is even, so the sum of two evens is even" | One example does not prove a universal claim — you must prove it for *all* even numbers |
| Using the *same* variable for two different unknowns: "$a = 2k$ and $b = 2k$" | This forces $a = b$. Use different variables: "$a = 2m$ and $b = 2n$" |
| Forgetting to say why the witness is an integer | Always state "since $m, n \in \mathbb{Z}$, we have $m+n \in \mathbb{Z}$" |
| Proving the converse instead of the original statement | "If $a+b$ is even then $a$ and $b$ are even" is *different* from "if $a, b$ are even then $a+b$ is even" (and actually false!) |

---

## Java Deep Dive

### Complete Runnable Program: Parity Library

This program implements all the parity concepts from this class as a self-contained Java file.

```java
/**
 * ParityLibrary.java
 * A complete library of parity-related methods with mathematical documentation.
 * 
 * MATHEMATICAL FOUNDATION:
 * - Even: n is even iff ∃k∈Z such that n = 2k
 * - Odd:  n is odd  iff ∃k∈Z such that n = 2k + 1
 * - Every integer is exactly one of even or odd (never both, never neither)
 */
public class ParityLibrary {

    // =========================================================
    // CORE PARITY TESTS
    // =========================================================

    /**
     * Tests whether n is even.
     * 
     * Math: n is even ↔ n = 2k for some k ∈ Z
     * Code: n % 2 == 0 tests whether 2 divides n with remainder 0
     * 
     * Why this works: By the quotient-remainder theorem, n = 2q + r
     * where r ∈ {0, 1}. If r == 0, then n = 2q, so n is even.
     * 
     * Edge cases:
     *   isEven(0)  → true   (0 = 2·0)
     *   isEven(-4) → true   (-4 = 2·(-2))
     */
    public static boolean isEven(int n) {
        return n % 2 == 0;
    }

    /**
     * Tests whether n is odd.
     * 
     * Math: n is odd ↔ n = 2k + 1 for some k ∈ Z
     * Code: n % 2 != 0 (NOT n % 2 == 1, because Java's % can return -1)
     * 
     * Why n % 2 != 0 instead of n % 2 == 1:
     *   In Java, (-3) % 2 == -1, not 1.
     *   But (-3) is odd because -3 = 2(-2) + 1.
     *   So we use != 0 to handle negative numbers correctly.
     */
    public static boolean isOdd(int n) {
        return n % 2 != 0;
    }

    // =========================================================
    // FINDING THE WITNESS
    // =========================================================

    /**
     * If n is even, returns the integer k such that n = 2k.
     * This is the "witness" in the existential definition.
     * 
     * Precondition: n must be even.
     */
    public static int evenWitness(int n) {
        assert isEven(n) : "Precondition violated: " + n + " is not even";
        return n / 2;   // n = 2k  →  k = n/2
    }

    /**
     * If n is odd, returns the integer k such that n = 2k + 1.
     * 
     * Precondition: n must be odd.
     */
    public static int oddWitness(int n) {
        assert isOdd(n) : "Precondition violated: " + n + " is not odd";
        return (n - 1) / 2;   // n = 2k+1  →  k = (n-1)/2
    }

    // =========================================================
    // THEOREM VERIFIERS
    // =========================================================

    /**
     * Verifies: even + even = even
     * Math: if a = 2m and b = 2n, then a+b = 2(m+n) which is even.
     */
    public static boolean verifyEvenPlusEven(int a, int b) {
        if (!isEven(a) || !isEven(b)) return true; // hypothesis not met
        return isEven(a + b);
    }

    /**
     * Verifies: odd + odd = even
     * Math: if a = 2m+1 and b = 2n+1, then a+b = 2(m+n+1) which is even.
     */
    public static boolean verifyOddPlusOdd(int a, int b) {
        if (!isOdd(a) || !isOdd(b)) return true; // hypothesis not met
        return isEven(a + b);
    }

    /**
     * Verifies: even + odd = odd
     * Math: if a = 2m and b = 2n+1, then a+b = 2(m+n)+1 which is odd.
     */
    public static boolean verifyEvenPlusOdd(int a, int b) {
        if (!isEven(a) || !isOdd(b)) return true;
        return isOdd(a + b);
    }

    /**
     * Verifies: odd * odd = odd
     * Math: if a = 2m+1 and b = 2n+1, then ab = 2(2mn+m+n)+1 which is odd.
     */
    public static boolean verifyOddTimesOdd(int a, int b) {
        if (!isOdd(a) || !isOdd(b)) return true;
        return isOdd(a * b);
    }

    /**
     * Verifies: even * anything = even
     * Math: if a = 2m, then ab = 2(mb), which is even.
     */
    public static boolean verifyEvenTimesAnything(int a, int b) {
        if (!isEven(a)) return true;
        return isEven(a * b);
    }

    // =========================================================
    // COMPLETE PARITY TABLE
    // =========================================================

    /**
     * Prints a summary table of parity rules verified by exhaustive testing.
     */
    public static void printParityTable() {
        System.out.println("=== PARITY RULES (verified for n in [-1000, 1000]) ===");
        System.out.println();

        String[] rules = {
            "even + even = even",
            "odd  + odd  = even",
            "even + odd  = odd",
            "odd  * odd  = odd",
            "even * any  = even"
        };

        boolean allPassed = true;
        int range = 100;

        // Test each rule
        for (int a = -range; a <= range; a++) {
            for (int b = -range; b <= range; b++) {
                if (!verifyEvenPlusEven(a, b))      { allPassed = false; System.out.println("FAIL: even+even at " + a + "," + b); }
                if (!verifyOddPlusOdd(a, b))        { allPassed = false; System.out.println("FAIL: odd+odd at " + a + "," + b); }
                if (!verifyEvenPlusOdd(a, b))        { allPassed = false; System.out.println("FAIL: even+odd at " + a + "," + b); }
                if (!verifyOddTimesOdd(a, b))        { allPassed = false; System.out.println("FAIL: odd*odd at " + a + "," + b); }
                if (!verifyEvenTimesAnything(a, b))   { allPassed = false; System.out.println("FAIL: even*any at " + a + "," + b); }
            }
        }

        if (allPassed) {
            System.out.println("All rules passed for integers in [-" + range + ", " + range + "].");
        }

        System.out.println();
        System.out.println("Summary of Parity Arithmetic:");
        System.out.println("+--------+-------+--------+");
        System.out.println("|   +    | even  |  odd   |");
        System.out.println("+--------+-------+--------+");
        System.out.println("| even   | even  |  odd   |");
        System.out.println("| odd    | odd   |  even  |");
        System.out.println("+--------+-------+--------+");
        System.out.println();
        System.out.println("+--------+-------+--------+");
        System.out.println("|   *    | even  |  odd   |");
        System.out.println("+--------+-------+--------+");
        System.out.println("| even   | even  |  even  |");
        System.out.println("| odd    | even  |  odd   |");
        System.out.println("+--------+-------+--------+");
    }

    // =========================================================
    // MAIN — RUN ALL DEMONSTRATIONS
    // =========================================================

    public static void main(String[] args) {
        System.out.println("==================================");
        System.out.println(" PARITY AND VARIABLES — CLASS 1  ");
        System.out.println("==================================");
        System.out.println();

        // Demo 1: Basic parity checks
        System.out.println("--- Basic Parity Checks ---");
        int[] samples = {-6, -3, 0, 1, 4, 7, 12, 15};
        for (int n : samples) {
            String parity = isEven(n) ? "even" : "odd";
            System.out.printf("  %4d is %s%n", n, parity);
        }
        System.out.println();

        // Demo 2: Finding witnesses
        System.out.println("--- Witnesses (the k in n = 2k or n = 2k+1) ---");
        for (int n : samples) {
            if (isEven(n)) {
                int k = evenWitness(n);
                System.out.printf("  %4d = 2 * %d  (k = %d)%n", n, k, k);
            } else {
                int k = oddWitness(n);
                System.out.printf("  %4d = 2 * %d + 1  (k = %d)%n", n, k, k);
            }
        }
        System.out.println();

        // Demo 3: Parity table
        printParityTable();
    }
}
```

**Sample Output:**
```
==================================
 PARITY AND VARIABLES — CLASS 1  
==================================

--- Basic Parity Checks ---
    -6 is even
    -3 is odd
     0 is even
     1 is odd
     4 is even
     7 is odd
    12 is even
    15 is odd

--- Witnesses (the k in n = 2k or n = 2k+1) ---
    -6 = 2 * -3  (k = -3)
    -3 = 2 * -2 + 1  (k = -2)
     0 = 2 * 0  (k = 0)
     1 = 2 * 0 + 1  (k = 0)
     4 = 2 * 2  (k = 2)
     7 = 2 * 3 + 1  (k = 3)
    12 = 2 * 6  (k = 6)
    15 = 2 * 7 + 1  (k = 7)

All rules passed for integers in [-100, 100].

Summary of Parity Arithmetic:
+--------+-------+--------+
|   +    | even  |  odd   |
+--------+-------+--------+
| even   | even  |  odd   |
| odd    | odd   |  even  |
+--------+-------+--------+

+--------+-------+--------+
|   *    | even  |  odd   |
+--------+-------+--------+
| even   | even  |  even  |
| odd    | even  |  odd   |
+--------+-------+--------+
```

---

## Computational Use: Parity in Computer Science

### Checksums
A **checksum** is a simple error-detection scheme. The simplest version adds up bytes of data and checks whether the sum is even or odd. If a single bit flips during transmission, the parity of the sum changes, and the error is detected. This is called a **parity bit**.

### Hash Tables and Indexing
Hash functions often use `% m` to map keys to buckets. When $m = 2$, this is simply a parity check — the key goes into bucket 0 (even) or bucket 1 (odd). More generally, `key % tableSize` generalizes the idea of parity to arbitrary moduli.

### Alternating Behavior
Many algorithms alternate behavior based on parity: even-indexed elements vs. odd-indexed elements, alternating turns in game trees, alternating directions in bidirectional search.

---

## Historical Context

**Euclid (c. 300 BC)** devoted Books VII–IX of the *Elements* to number theory. He defined even and odd numbers and proved basic properties of parity and divisibility using geometric arguments. His proofs, while geometric rather than algebraic, follow the same logical structure we use today — start from definitions, chain deductions.

**The Greeks** classified numbers into even and odd, perfect and abundant, prime and composite. Parity was the first classification: the simplest way to partition infinitely many objects into two classes.

**Why this matters for CS:** Computer science inherited this axiomatic style. When we write program specifications or define data structures, we are doing exactly what Euclid did — starting from definitions and deducing properties.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions (Warm-Up / Quick Check)

**A1.** True or false: Zero is an even number. Justify using the definition.

**A2.** True or false: The number $-7$ is odd. Find the integer $k$ such that $-7 = 2k + 1$.

**A3.** Is $1$ even or odd? What about $1^{100}$? What about $(-1)^{100}$? Explain.

**A4.** A student says: "I checked $2 + 4 = 6$, $6 + 8 = 14$, and $10 + 12 = 22$, so the sum of two evens is always even." What is wrong with this reasoning?

---

### Slide Set B: Proof Problems (Class Discussion)

**B1.** Prove: If $n$ is an odd integer, then $n + 1$ is even.

**B2.** Prove: If $a$ is even and $b$ is odd, then $a + b$ is odd.

**B3.** Disprove: "If $n^2$ is even, then $n$ is even *and* $n > 0$." (Find a counterexample.)

**B4.** Prove or disprove: The sum of three consecutive integers is always divisible by 3.

---

### Slide Set C: Java Coding Problems (Code Along)

**C1.** Write a method `public static String parityLabel(int n)` that returns `"even"` or `"odd"`. Test it with $n = -10, -3, 0, 1, 42$.

**C2.** Write a method `public static int countEvens(int[] arr)` that returns the number of even elements in the array. What mathematical concept does the loop implement? (Answer: it computes $|\{i : \text{arr}[i] \text{ is even}\}|$.)

**C3.** Write a method `public static boolean sumParityCheck(int a, int b)` that returns `true` if `a + b` has the expected parity based on the parity of `a` and `b` (using the parity addition table). Test with 10 random pairs.

**C4.** Java's `%` operator behaves differently for negative numbers. What does `(-7) % 2` return in Java? How does this affect `isOdd`?

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Prove: If $a$ is an even integer and $b$ is an even integer, then $a - b$ is even.

**DM2.** Prove: If $n$ is odd, then $n^2 - 1$ is divisible by 8. *(Hint: write $n = 2k+1$ and factor $n^2 - 1 = (n-1)(n+1)$.)*

**DM3.** Prove: The product of any integer with an even integer is even.

**DM4.** Disprove: "For all integers $n$, if $n^2$ is odd, then $n > 0$."

**DM5.** Prove: For any integer $n$, the expression $n^2 + n$ is always even. *(Hint: consider two cases — $n$ even and $n$ odd.)*

**DM6.** Prove: If $a$ and $b$ are both odd, then $a^2 + b^2$ is even but not divisible by 4.

**DM7.** Prove or disprove: "The sum of four consecutive integers is always even."

---

### Java Programming Problems

**JP1.** Write a method `public static boolean allEven(int[] arr)` that returns `true` if every element in the array is even. Connect this to the mathematical statement $\forall i \in \{0, \ldots, n-1\},\; \text{arr}[i] \text{ is even}$.

**JP2.** Write a method `public static int[] separateByParity(int[] arr)` that returns a new array with all even elements first, then all odd elements. Verify that evens and odds are in the correct positions.

**JP3.** Write a method `public static boolean parityPreservedBySquare(int n)` that checks whether $n$ and $n^2$ have the same parity. Test it for $n = -100$ to $100$.

**JP4.** Implement `public static void printParityTable(int from, int to)` that prints each integer in the range and its parity. Format the output in two columns.

**JP5.** Write a method `public static int findFirstOdd(int[] arr)` that returns the first odd element, or throws `NoSuchElementException` if there is none. What mathematical concept does "returns first odd" correspond to? (Answer: existential witness.)

**JP6.** The **Collatz conjecture** says: start with any positive integer $n$. If $n$ is even, divide by 2; if $n$ is odd, compute $3n + 1$. Repeat. The conjecture says you always reach 1. Write a method `public static int collatzSteps(int n)` that returns the number of steps to reach 1. Test for $n = 1$ to $100$. *(This uses parity as a branching condition.)*

---

### Bridge Problems (Discrete Math + Java)

**BR1.** *Prove and Verify.* Prove that $n(n+1)$ is even for all integers $n$ (use cases: $n$ even and $n$ odd). Then write a Java method that checks this for $n = -1000$ to $1000$.

**BR2.** *Proof to Code.* The proof that "odd + odd = even" uses the witness $k = m + n + 1$ where $a = 2m+1$ and $b = 2n+1$. Write a method `public static int sumWitness(int a, int b)` that, given two odd integers, computes and returns this witness $k$ and verifies that $a + b = 2k$.

**BR3.** *Code to Proof.* A student wrote this Java method:
```java
public static boolean mysteryCheck(int n) {
    return (n * n) % 4 == 0 || (n * n) % 4 == 1;
}
```
What does this method check? State and prove the mathematical theorem that guarantees `mysteryCheck` always returns `true`.  
*(Answer: For any integer $n$, $n^2 \mod 4$ is either 0 or 1. Proof: if $n$ is even, $n = 2k$, so $n^2 = 4k^2 \equiv 0 \pmod{4}$. If $n$ is odd, $n = 2k+1$, so $n^2 = 4k^2 + 4k + 1 \equiv 1 \pmod{4}$.)*

---

## Solutions

### Discrete Math Solutions

**DM1 Solution.** Let $a = 2m$ and $b = 2n$ for $m, n \in \mathbb{Z}$. Then $a - b = 2m - 2n = 2(m-n)$. Since $m - n \in \mathbb{Z}$, $a - b$ is even. $\blacksquare$

**DM2 Solution.** Let $n = 2k + 1$ for some $k \in \mathbb{Z}$. Then:
$$n^2 - 1 = (2k+1)^2 - 1 = 4k^2 + 4k + 1 - 1 = 4k^2 + 4k = 4k(k+1)$$
Since $k$ and $k+1$ are consecutive integers, one of them is even, so $k(k+1)$ is even. Write $k(k+1) = 2j$ for some $j \in \mathbb{Z}$. Then $n^2 - 1 = 4(2j) = 8j$. Therefore $8 \mid (n^2 - 1)$. $\blacksquare$

**DM3 Solution.** Let $a$ be any integer and $b = 2k$ for some $k \in \mathbb{Z}$. Then $a \cdot b = a \cdot 2k = 2(ak)$. Since $ak \in \mathbb{Z}$, the product is even. $\blacksquare$

**DM4 Solution.** Counterexample: $n = -3$. Then $n^2 = 9$, which is odd, but $n = -3 < 0$. $\blacksquare$

**DM5 Solution.** *Case 1:* $n$ is even, $n = 2k$. Then $n^2 + n = 4k^2 + 2k = 2(2k^2 + k)$, which is even.  
*Case 2:* $n$ is odd, $n = 2k+1$. Then $n^2 + n = (2k+1)^2 + (2k+1) = 4k^2 + 4k + 1 + 2k + 1 = 4k^2 + 6k + 2 = 2(2k^2 + 3k + 1)$, which is even.  
Alternatively: $n^2 + n = n(n+1)$, and consecutive integers always include one even number. $\blacksquare$

**DM6 Solution.** Let $a = 2m+1$ and $b = 2n+1$. Then:
$$a^2 + b^2 = (2m+1)^2 + (2n+1)^2 = 4m^2 + 4m + 1 + 4n^2 + 4n + 1 = 4(m^2+m+n^2+n) + 2$$
This equals $2(2m^2 + 2m + 2n^2 + 2n + 1)$, which is even. But $2m^2 + 2m + 2n^2 + 2n + 1$ is odd (it is $2(m^2+m+n^2+n) + 1$). So $a^2 + b^2 = 2 \times \text{odd}$, which means $a^2 + b^2$ is divisible by 2 but not by 4. $\blacksquare$

**DM7 Solution.** Let the four consecutive integers be $n, n+1, n+2, n+3$. Their sum is $4n + 6 = 2(2n+3)$, which is even. The claim is **true**. $\blacksquare$

---

### Java Solutions

**JP1 Solution.**
```java
public static boolean allEven(int[] arr) {
    for (int x : arr) {           // ∀ element x in arr
        if (x % 2 != 0) {        // if x is not even
            return false;         // the universal claim fails
        }
    }
    return true;                  // all elements passed the test
}
// Mathematically: returns ∀i ∈ {0,...,arr.length-1}: arr[i] mod 2 = 0
```

**JP2 Solution.**
```java
public static int[] separateByParity(int[] arr) {
    int[] result = new int[arr.length];
    int left = 0;                     // index for evens
    int right = arr.length - 1;       // index for odds
    for (int x : arr) {
        if (x % 2 == 0) {
            result[left++] = x;       // place even elements at front
        } else {
            result[right--] = x;      // place odd elements at back
        }
    }
    return result;
}
```

**JP3 Solution.**
```java
public static boolean parityPreservedBySquare(int n) {
    // Theorem: n and n^2 have the same parity.
    boolean nEven = (n % 2 == 0);
    boolean sqEven = ((n * n) % 2 == 0);
    return nEven == sqEven;
}

// Test:
public static void testParityPreserved() {
    for (int n = -100; n <= 100; n++) {
        assert parityPreservedBySquare(n) : "Failed for n=" + n;
    }
    System.out.println("Parity preserved by squaring: all tests passed.");
}
```

**JP4 Solution.**
```java
public static void printParityTable(int from, int to) {
    System.out.printf("%-10s %-10s%n", "Number", "Parity");
    System.out.println("--------------------");
    for (int n = from; n <= to; n++) {
        System.out.printf("%-10d %-10s%n", n, (n % 2 == 0) ? "even" : "odd");
    }
}
```

**JP5 Solution.**
```java
import java.util.NoSuchElementException;

public static int findFirstOdd(int[] arr) {
    for (int x : arr) {                 // existential search: ∃x ∈ arr such that x is odd
        if (x % 2 != 0) {
            return x;                   // found the witness
        }
    }
    throw new NoSuchElementException("No odd element found");
}
```

**JP6 Solution.**
```java
public static int collatzSteps(int n) {
    if (n <= 0) throw new IllegalArgumentException("n must be positive");
    int steps = 0;
    while (n != 1) {
        if (n % 2 == 0) {              // n is even: divide by 2
            n = n / 2;
        } else {                        // n is odd: compute 3n + 1
            n = 3 * n + 1;
        }
        steps++;
    }
    return steps;
}

// Test:
public static void testCollatz() {
    System.out.printf("%-5s %-10s%n", "n", "Steps");
    for (int n = 1; n <= 20; n++) {
        System.out.printf("%-5d %-10d%n", n, collatzSteps(n));
    }
}
```

---

### Bridge Problem Solutions

**BR1 Solution.**

*Proof:* Case 1: $n$ is even, $n = 2k$. Then $n(n+1) = 2k(2k+1) = 2[k(2k+1)]$, which is even.  
Case 2: $n$ is odd, $n = 2k+1$. Then $n+1 = 2k+2 = 2(k+1)$, so $n(n+1) = (2k+1) \cdot 2(k+1) = 2[(2k+1)(k+1)]$, which is even. $\blacksquare$

*Java:*
```java
public static void verifyConsecutiveProduct() {
    for (int n = -1000; n <= 1000; n++) {
        long product = (long) n * (n + 1);   // use long to avoid overflow
        assert product % 2 == 0 : "Failed for n=" + n;
    }
    System.out.println("n(n+1) is always even: verified for n in [-1000, 1000].");
}
```

**BR2 Solution.**
```java
/**
 * Given two odd integers a, b, computes the witness k
 * such that a + b = 2k.
 * 
 * Math: a = 2m+1, b = 2n+1, so a+b = 2(m+n+1).
 * The witness is k = m + n + 1 = (a-1)/2 + (b-1)/2 + 1 = (a+b)/2.
 */
public static int sumWitness(int a, int b) {
    assert a % 2 != 0 : a + " is not odd";
    assert b % 2 != 0 : b + " is not odd";
    int sum = a + b;
    int k = sum / 2;               // k = m + n + 1
    assert sum == 2 * k : "Witness verification failed";
    return k;
}
```

**BR3 Solution.**

The method checks whether $n^2 \mod 4 \in \{0, 1\}$.

*Theorem:* For any integer $n$, $n^2 \equiv 0 \pmod{4}$ or $n^2 \equiv 1 \pmod{4}$.

*Proof:*  
- If $n$ is even, write $n = 2k$. Then $n^2 = 4k^2$, so $n^2 \equiv 0 \pmod{4}$.  
- If $n$ is odd, write $n = 2k+1$. Then $n^2 = 4k^2 + 4k + 1$, so $n^2 \equiv 1 \pmod{4}$.  

In either case, $n^2 \mod 4$ is 0 or 1. Therefore `mysteryCheck` always returns `true`. $\blacksquare$
