# Module 1 – Class 2: Divisibility Relations

## Learning Objectives

By the end of this class, students will be able to:

1. State the formal definition of divisibility and use the notation $a \mid b$.
2. Prove that the divisibility relation is transitive using a direct proof.
3. Prove that if $a$ divides two numbers, then $a$ divides any linear combination of those numbers.
4. Implement a `divides` method in Java and connect it to the mathematical definition.
5. Compose divisibility tests to verify transitivity computationally.

---

## Concept Overview

### What Is Divisibility?

Divisibility is a relationship between two integers that generalizes the idea of "goes into evenly."

**Definition (Divisibility).** Let $a, b \in \mathbb{Z}$ with $a \neq 0$. We say **$a$ divides $b$**, written $a \mid b$, if there exists an integer $k$ such that $b = a \cdot k$.

When $a \mid b$, we also say:
- "$a$ is a divisor of $b$"
- "$a$ is a factor of $b$"
- "$b$ is a multiple of $a$"
- "$b$ is divisible by $a$"

### Plain Language

$a \mid b$ means: when you divide $b$ by $a$, there is no remainder. Equivalently, $b$ is some number of "$a$s."

**Examples:**
- $3 \mid 12$ because $12 = 3 \times 4$ (the witness is $k = 4$)
- $5 \mid 0$ because $0 = 5 \times 0$ (the witness is $k = 0$; zero is divisible by everything)
- $7 \nmid 15$ because there is no integer $k$ with $15 = 7k$ (we get $k = 15/7 \approx 2.14$, not an integer)
- $1 \mid n$ for every integer $n$ because $n = 1 \times n$

### Key Properties of Divisibility

| Property | Statement | Meaning |
|----------|-----------|---------|
| Reflexive | $a \mid a$ (for $a \neq 0$) | Every nonzero integer divides itself |
| Transitive | If $a \mid b$ and $b \mid c$, then $a \mid c$ | Divisibility "chains" |
| Antisymmetric | If $a \mid b$ and $b \mid a$, then $a = \pm b$ | Mutual divisibility forces equality (up to sign) |
| Linear combination | If $a \mid b$ and $a \mid c$, then $a \mid (bx + cy)$ for all $x, y \in \mathbb{Z}$ | Divisibility is preserved by linear combinations |

### Why This Matters in CS

Divisibility is the foundation for:
- **Modular arithmetic** (Module 2): checking $a \mid b$ is equivalent to checking $b \mod a = 0$
- **Hashing**: hash functions use modular reduction, which relies on divisibility
- **Cryptography**: RSA encryption depends on the difficulty of finding divisors of large numbers
- **Loop bounds**: if a loop runs $n$ times and processes items in groups of $k$, divisibility determines whether all items are processed evenly

---

## Formal Notation

### The Divisibility Symbol

$a \mid b$ (read "a divides b") means $\exists k \in \mathbb{Z}$ such that $b = ak$.

**Careful!** The vertical bar in $a \mid b$ is a *relation* symbol — it is either true or false. Do not confuse it with:
- $a / b$ (division, which returns a fraction or quotient)
- $a \mid b$ in set-builder notation $\{x \mid P(x)\}$ (which means "such that")

### Writing Divisibility Proofs

To prove $a \mid b$: find an explicit integer $k$ such that $b = ak$ and verify that $k \in \mathbb{Z}$.

To prove $a \nmid b$: show that $b/a$ is not an integer (often by the quotient-remainder theorem: $b = aq + r$ with $0 < r < a$).

### Common Pitfalls

| Pitfall | Why It's Wrong |
|---------|---------------|
| Writing $a \mid b$ as "$a$ is divisible by $b$" | It's the other way around: $b$ is divisible by $a$ |
| Forgetting that $a \neq 0$ | Division by zero is undefined |
| Assuming $a \mid b$ means $a \leq b$ | False: $3 \mid (-6)$ even though $3 > -6$ |
| Confusing $a \mid b$ with $a / b$ | $a \mid b$ is a true/false relationship; $a/b$ is an arithmetic operation |

---

## Worked Examples

### Example 1: Prove Transitivity of Divisibility (Discrete Math)

**Claim.** If $a \mid b$ and $b \mid c$, then $a \mid c$.

**Proof.**

*Step 1 — Hypotheses.* We are given $a \mid b$ and $b \mid c$.

*Step 2 — Unpack definitions.*
- Since $a \mid b$, there exists an integer $m$ such that $b = am$.
- Since $b \mid c$, there exists an integer $n$ such that $c = bn$.

*Step 3 — Algebra.* Substitute the first equation into the second:
$$c = bn = (am)n = a(mn)$$

*Step 4 — Identify the witness.* Let $k = mn$. Since $m, n \in \mathbb{Z}$, we have $k = mn \in \mathbb{Z}$ (integers are closed under multiplication).

*Step 5 — Conclusion.* Since $c = ak$ with $k \in \mathbb{Z}$, we have $a \mid c$ by definition. $\blacksquare$

**Concrete illustration:** $4 \mid 12$ (because $12 = 4 \times 3$) and $12 \mid 60$ (because $60 = 12 \times 5$). By transitivity, $4 \mid 60$ (because $60 = 4 \times 15$, and indeed $15 = 3 \times 5 = mn$).

---

### Example 2: Divisibility in Java (Java Translation)

```java
/**
 * DivisibilityDemo.java
 * Implements and tests divisibility relations.
 */
public class DivisibilityDemo {

    /**
     * Returns true if a divides b.
     * 
     * Math:  a | b  ↔  ∃k ∈ Z such that b = a·k
     * Code:  b % a == 0 checks whether the remainder is zero.
     * 
     * Precondition: a != 0 (division by zero is undefined)
     * 
     * Connection: b % a computes the remainder r where b = a·q + r.
     * If r == 0, then b = a·q, so the witness is k = q = b/a.
     */
    public static boolean divides(int a, int b) {
        if (a == 0) throw new ArithmeticException("a cannot be zero in a|b");
        return b % a == 0;
    }

    /**
     * If a | b, returns the witness k such that b = a * k.
     */
    public static int witness(int a, int b) {
        assert divides(a, b) : a + " does not divide " + b;
        return b / a;
    }

    /**
     * Tests transitivity: if a|b and b|c, then a|c.
     * Also displays the chain of witnesses.
     */
    public static void demonstrateTransitivity(int a, int b, int c) {
        System.out.printf("Testing transitivity: %d | %d and %d | %d ?%n", a, b, b, c);

        if (divides(a, b) && divides(b, c)) {
            int m = witness(a, b);    // b = a * m
            int n = witness(b, c);    // c = b * n
            int k = m * n;            // c = a * (m * n)

            System.out.printf("  b = %d * %d = %d  (m = %d)%n", a, m, b, m);
            System.out.printf("  c = %d * %d = %d  (n = %d)%n", b, n, c, n);
            System.out.printf("  c = %d * %d = %d  (k = m*n = %d)%n", a, k, a * k, k);
            System.out.printf("  Therefore %d | %d  ✓%n", a, c);
        } else {
            System.out.println("  Hypotheses not satisfied.");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        System.out.println("=== DIVISIBILITY RELATIONS ===\n");

        // Basic examples
        System.out.println("--- Basic Divisibility Tests ---");
        int[][] tests = {{3, 12}, {5, 0}, {7, 15}, {1, 42}, {-3, 9}, {4, -8}};
        for (int[] t : tests) {
            int a = t[0], b = t[1];
            System.out.printf("  %d | %d ? %s%n", a, b, divides(a, b));
        }
        System.out.println();

        // Transitivity demonstrations
        System.out.println("--- Transitivity Demonstrations ---");
        demonstrateTransitivity(4, 12, 60);
        demonstrateTransitivity(3, 6, 18);
        demonstrateTransitivity(2, 10, 50);
    }
}
```

**Sample Output:**
```
=== DIVISIBILITY RELATIONS ===

--- Basic Divisibility Tests ---
  3 | 12 ? true
  5 | 0 ? true
  7 | 15 ? false
  1 | 42 ? true
  -3 | 9 ? true
  4 | -8 ? true

--- Transitivity Demonstrations ---
Testing transitivity: 4 | 12 and 12 | 60 ?
  b = 4 * 3 = 12  (m = 3)
  c = 12 * 5 = 60  (n = 5)
  c = 4 * 15 = 60  (k = m*n = 15)
  Therefore 4 | 60  ✓

Testing transitivity: 3 | 6 and 6 | 18 ?
  b = 3 * 2 = 6  (m = 2)
  c = 6 * 3 = 18  (n = 3)
  c = 3 * 6 = 18  (k = m*n = 6)
  Therefore 3 | 18  ✓

Testing transitivity: 2 | 10 and 10 | 50 ?
  b = 2 * 5 = 10  (m = 5)
  c = 10 * 5 = 50  (n = 5)
  c = 2 * 25 = 50  (k = m*n = 25)
  Therefore 2 | 50  ✓
```

---

### Example 3: Linear Combinations Theorem (Combined DM + Java)

**Claim.** If $a \mid b$ and $a \mid c$, then for any integers $x$ and $y$, $a \mid (bx + cy)$.

**Proof.**

Since $a \mid b$, we have $b = am$ for some $m \in \mathbb{Z}$.  
Since $a \mid c$, we have $c = an$ for some $n \in \mathbb{Z}$.

Then:
$$bx + cy = (am)x + (an)y = a(mx + ny)$$

Let $k = mx + ny$. Since $m, x, n, y \in \mathbb{Z}$, we have $k \in \mathbb{Z}$. Therefore $a \mid (bx + cy)$. $\blacksquare$

**Why this is powerful:** This theorem says that if $a$ divides two numbers, then $a$ divides *any combination* of those numbers. For example, since $5 \mid 15$ and $5 \mid 20$, we know $5 \mid (15 \cdot 7 + 20 \cdot (-3)) = 105 - 60 = 45$.

**Java Implementation:**

```java
/**
 * Verifies the linear combination theorem:
 * if a | b and a | c, then a | (bx + cy) for all x, y.
 */
public static void verifyLinearCombination(int a, int b, int c) {
    if (!divides(a, b) || !divides(a, c)) {
        System.out.printf("  Skipping: %d does not divide both %d and %d%n", a, b, c);
        return;
    }

    System.out.printf("Since %d | %d and %d | %d, testing linear combinations:%n", a, b, a, c);
    boolean allPass = true;

    for (int x = -10; x <= 10; x++) {
        for (int y = -10; y <= 10; y++) {
            int lc = b * x + c * y;
            if (!divides(a, lc)) {
                System.out.printf("  FAIL: %d*%d + %d*%d = %d not divisible by %d%n",
                    b, x, c, y, lc, a);
                allPass = false;
            }
        }
    }

    if (allPass) {
        System.out.printf("  All linear combinations %d*x + %d*y divisible by %d (x,y in [-10,10])%n",
            b, c, a);
    }
}
```

---

### Example 4: Non-Divisibility Proof

**Claim.** $3 \nmid 20$.

**Proof.** By the quotient-remainder theorem, $20 = 3 \times 6 + 2$, so the remainder when dividing 20 by 3 is $r = 2 \neq 0$. Since no integer $k$ satisfies $20 = 3k$ (we would need $k = 20/3 \approx 6.67$), we have $3 \nmid 20$. $\blacksquare$

In Java: `20 % 3 == 2`, which is nonzero, so `divides(3, 20)` returns `false`.

---

### Example 5: Divisibility and Absolute Value

**Claim.** If $a \mid b$, then $|a| \mid |b|$.

**Proof.** Since $a \mid b$, we have $b = ak$ for some $k \in \mathbb{Z}$. Taking absolute values:
$$|b| = |ak| = |a| \cdot |k|$$
Since $|k| \in \mathbb{Z}$ (absolute value of an integer is a non-negative integer), we have $|a| \mid |b|$. $\blacksquare$

---

## Proof Techniques Spotlight

### Direct Proof with Divisibility

Divisibility proofs follow the same "direct proof from definitions" pattern as parity proofs from Class 1:

**Template for Proving $a \mid (\text{expression})$:**

> **Claim:** If [hypotheses involving divisibility], then $a \mid [\text{some expression}]$.
>
> **Proof.**
> 1. From each hypothesis "$d \mid x$," write $x = dk$ for a fresh variable $k \in \mathbb{Z}$.
> 2. Substitute these equations into the target expression.
> 3. Factor out $a$.
> 4. Identify the integer witness.
> 5. Conclude $a$ divides the expression. $\blacksquare$

### Chaining Divisibility

Many divisibility proofs involve chains of substitutions. The key algebraic moves are:
- **Substitution:** Replace $b$ with $am$ (from $a \mid b$)
- **Factoring:** Rewrite $am \cdot n$ as $a(mn)$
- **Closure:** Note that products and sums of integers are integers

### Common Mistakes

| Mistake | Correction |
|---------|-----------|
| "Since $a \mid b$, we have $a = bk$" | Wrong direction! It should be $b = ak$ |
| Forgetting to introduce different variables for different hypotheses | If $a \mid b$ and $a \mid c$, write $b = am$ and $c = an$ with *different* $m, n$ |
| Not verifying the witness is an integer | Always confirm "$k \in \mathbb{Z}$ because integers are closed under [operation]" |

---

## Java Deep Dive

### Complete Divisibility Library

```java
/**
 * DivisibilityLibrary.java
 * Complete library for divisibility operations and verification.
 */
public class DivisibilityLibrary {

    /**
     * Tests a | b.
     * Math: a | b ↔ ∃k∈Z: b = ak ↔ b mod a = 0
     */
    public static boolean divides(int a, int b) {
        if (a == 0) throw new ArithmeticException("Cannot test divisibility by 0");
        return b % a == 0;
    }

    /**
     * Returns all positive divisors of n.
     * A divisor d of n satisfies d | n and 1 ≤ d ≤ |n|.
     */
    public static java.util.List<Integer> getDivisors(int n) {
        java.util.List<Integer> divisors = new java.util.ArrayList<>();
        if (n == 0) return divisors;   // 0 has infinitely many divisors
        int absN = Math.abs(n);
        for (int d = 1; d <= absN; d++) {
            if (absN % d == 0) {
                divisors.add(d);
            }
        }
        return divisors;
    }

    /**
     * Counts the number of positive divisors of n.
     * Notation: τ(n) or d(n) in number theory.
     */
    public static int countDivisors(int n) {
        return getDivisors(n).size();
    }

    /**
     * Tests whether the divisibility relation is transitive
     * for three specific values.
     */
    public static boolean testTransitivity(int a, int b, int c) {
        // If a|b and b|c, then a|c must hold
        if (divides(a, b) && divides(b, c)) {
            return divides(a, c);
        }
        return true; // vacuously true if hypothesis not met
    }

    /**
     * Tests the linear combination property:
     * if a|b and a|c, then a|(bx+cy) for given x, y.
     */
    public static boolean testLinearCombination(int a, int b, int c, int x, int y) {
        if (!divides(a, b) || !divides(a, c)) return true;
        return divides(a, b * x + c * y);
    }

    /**
     * Finds the common divisors of two integers.
     * Common divisors of a and b are all d > 0 such that d|a and d|b.
     */
    public static java.util.List<Integer> commonDivisors(int a, int b) {
        java.util.List<Integer> result = new java.util.ArrayList<>();
        java.util.List<Integer> divA = getDivisors(a);
        for (int d : divA) {
            if (divides(d, b)) {
                result.add(d);
            }
        }
        return result;
    }

    // =========================================================
    // DEMONSTRATIONS
    // =========================================================

    public static void main(String[] args) {
        System.out.println("===================================");
        System.out.println(" DIVISIBILITY RELATIONS — CLASS 2  ");
        System.out.println("===================================\n");

        // Demo 1: Basic divisibility
        System.out.println("--- Divisibility Tests ---");
        int[][] pairs = {{3, 12}, {4, 18}, {5, 0}, {7, 49}, {6, 15}, {1, 100}};
        for (int[] p : pairs) {
            System.out.printf("  %d | %d ? %s", p[0], p[1], divides(p[0], p[1]));
            if (divides(p[0], p[1])) {
                System.out.printf("  (witness k = %d)", p[1] / p[0]);
            }
            System.out.println();
        }
        System.out.println();

        // Demo 2: Listing divisors
        System.out.println("--- Divisors ---");
        for (int n : new int[]{1, 12, 28, 30, 100}) {
            System.out.printf("  Divisors of %d: %s  (count = %d)%n",
                n, getDivisors(n), countDivisors(n));
        }
        System.out.println();

        // Demo 3: Common divisors
        System.out.println("--- Common Divisors ---");
        System.out.println("  Common divisors of 12 and 18: " + commonDivisors(12, 18));
        System.out.println("  Common divisors of 24 and 36: " + commonDivisors(24, 36));
        System.out.println();

        // Demo 4: Transitivity verification
        System.out.println("--- Transitivity Verification ---");
        boolean allTransitive = true;
        for (int a = 1; a <= 10; a++) {
            for (int b = 1; b <= 50; b++) {
                for (int c = 1; c <= 50; c++) {
                    if (!testTransitivity(a, b, c)) {
                        System.out.printf("  FAIL: %d, %d, %d%n", a, b, c);
                        allTransitive = false;
                    }
                }
            }
        }
        if (allTransitive) {
            System.out.println("  Transitivity holds for all tested triples.");
        }
        System.out.println();

        // Demo 5: Linear combination verification
        System.out.println("--- Linear Combination Verification ---");
        boolean allLC = true;
        int a = 6, b = 18, c = 24;
        for (int x = -20; x <= 20; x++) {
            for (int y = -20; y <= 20; y++) {
                if (!testLinearCombination(a, b, c, x, y)) {
                    System.out.printf("  FAIL: %d | (%d*%d + %d*%d)%n", a, b, x, c, y);
                    allLC = false;
                }
            }
        }
        if (allLC) {
            System.out.printf("  %d divides all %d*x + %d*y (x,y in [-20,20]) ✓%n", a, b, c);
        }
    }
}
```

**Sample Output:**
```
===================================
 DIVISIBILITY RELATIONS — CLASS 2  
===================================

--- Divisibility Tests ---
  3 | 12 ? true  (witness k = 4)
  4 | 18 ? false
  5 | 0 ? true  (witness k = 0)
  7 | 49 ? true  (witness k = 7)
  6 | 15 ? false
  1 | 100 ? true  (witness k = 100)

--- Divisors ---
  Divisors of 1: [1]  (count = 1)
  Divisors of 12: [1, 2, 3, 4, 6, 12]  (count = 6)
  Divisors of 28: [1, 2, 4, 7, 14, 28]  (count = 6)
  Divisors of 30: [1, 2, 3, 5, 6, 10, 15, 30]  (count = 8)
  Divisors of 100: [1, 2, 4, 5, 10, 20, 25, 50, 100]  (count = 9)

--- Common Divisors ---
  Common divisors of 12 and 18: [1, 2, 3, 6]
  Common divisors of 24 and 36: [1, 2, 3, 4, 6, 12]

--- Transitivity Verification ---
  Transitivity holds for all tested triples.

--- Linear Combination Verification ---
  6 divides all 18*x + 24*y (x,y in [-20,20]) ✓
```

---

## Computational Use: Divisibility in Computer Science

### Modular Arithmetic
Checking `b % a == 0` is the computational core of divisibility. This operation underlies nearly every area of CS that deals with number properties.

### Cryptography
RSA encryption relies on the fact that given a large number $n = pq$ (product of two primes), it is computationally hard to find $p$ and $q$. The security of RSA is fundamentally about the difficulty of the *divisibility* problem for large numbers.

### Data Alignment
Computer memory is organized in words (4 bytes, 8 bytes). For efficiency, data structures must be aligned — their starting address must be divisible by their alignment requirement. Checking alignment is a divisibility test.

### Cyclic Structures
Circular buffers, round-robin scheduling, and cyclic linked lists all use the pattern `index = (index + 1) % size`. Understanding divisibility helps reason about when indices wrap around and whether every position is visited.

---

## Historical Context

**Euclid (c. 300 BC)** in Book VII of the *Elements* defined divisibility and proved the transitivity of the "measures" relation (his term for divisibility). His proofs were geometric — he represented numbers as line segments and "measuring" meant fitting one segment into another.

**The notation $a \mid b$** was introduced much later, in the 19th century. Before that, mathematicians wrote "a measures b" or "a is contained in b." The compact symbol emerged as algebra became more formal.

**Gauss (1801)** in *Disquisitiones Arithmeticae* elevated divisibility to a central role in number theory, introducing congruence notation $a \equiv b \pmod{m}$ as a shorthand for $m \mid (a - b)$.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** True or false: $5 \mid 0$. Justify using the definition.

**A2.** True or false: $0 \mid 5$. Explain why.

**A3.** If $a \mid b$, does this imply $a \leq b$? Give an example or counterexample.

**A4.** List all positive integers that divide 24.

---

### Slide Set B: Proof Problems

**B1.** Prove: If $6 \mid n$, then $2 \mid n$ and $3 \mid n$.

**B2.** Prove: If $a \mid b$, then $a \mid (-b)$.

**B3.** Prove: If $a \mid b$ and $a \mid c$, then $a \mid (b + c)$.

**B4.** Prove or disprove: If $a \mid (b + c)$, then $a \mid b$ or $a \mid c$.

---

### Slide Set C: Java Coding Problems

**C1.** Write a method `boolean divides(int a, int b)` that returns true when $a \mid b$. Handle the edge case $a = 0$.

**C2.** Write a method `List<Integer> getDivisors(int n)` that returns all positive divisors of $n$. What is the relationship between the number of divisors and whether $n$ is prime?

**C3.** Write a method that takes three integers $a, b, c$ and checks whether $a \mid b$ and $b \mid c$ implies $a \mid c$ for those values.

**C4.** Write a method `boolean isPerfect(int n)` that returns true if $n$ is a perfect number (equal to the sum of its proper divisors). Test: is 28 perfect?

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Prove: If $a \mid b$ and $b \mid c$, then $a \mid c$. (Transitivity — prove from scratch if this is your first time.)

**DM2.** Prove: If $a \mid b$ and $a \mid c$, then $a \mid (b - c)$.

**DM3.** Prove: If $a \mid b$, then $a \mid (b \cdot n)$ for any integer $n$.

**DM4.** Prove: If $a \mid b$ and $c \mid d$, then $ac \mid bd$.

**DM5.** Prove or disprove: If $6 \mid ab$, then $6 \mid a$ or $6 \mid b$.

**DM6.** Prove: If $a \mid b$ and $b \neq 0$, then $|a| \leq |b|$.

**DM7.** Prove: For any integer $n$, the product $n(n+1)(n+2)$ is divisible by 6. *(Hint: among any three consecutive integers, one is divisible by 2 and one by 3.)*

---

### Java Programming Problems

**JP1.** Implement a method `boolean relativelyPrime(int a, int b)` that returns true if $a$ and $b$ share no common positive divisor other than 1. Test with pairs like $(8, 15)$, $(12, 18)$, $(7, 11)$.

**JP2.** Write a method `int sumOfDivisors(int n)` that returns the sum of all positive divisors of $n$. Test with $n = 28$ (answer: 56) and $n = 12$ (answer: 28).

**JP3.** Write a method that finds all "abundant" numbers up to 100. (A number $n$ is abundant if the sum of its proper divisors exceeds $n$.) Example: 12 is abundant because $1+2+3+4+6 = 16 > 12$.

**JP4.** Write a method `void printDivisibilityChain(int a, int b, int c)` that, when $a \mid b$ and $b \mid c$, prints the witnesses $m, n, k$ showing $b = am$, $c = bn$, $c = ak$ with $k = mn$.

**JP5.** Write a method that, given an array of integers and a divisor $d$, returns a new array containing only the elements divisible by $d$. Mathematically, this computes $\{x \in \text{arr} : d \mid x\}$.

**JP6.** Implement a method `int gcd_naive(int a, int b)` that finds the greatest common divisor by checking all common divisors. *(This is a brute-force approach; the Euclidean algorithm in Class 3 is much faster.)*

---

### Bridge Problems (Discrete Math + Java)

**BR1.** *Prove and Verify.* Prove that for any integer $n$, $n(n+1)(n+2)$ is divisible by 6. Then write a Java method that tests this for $n = -100$ to $100$.

**BR2.** *Proof to Code.* The proof of transitivity uses substitution: $c = bn = (am)n = a(mn)$. Write a method `int transitivityWitness(int a, int b, int c)` that computes and returns the combined witness $k = mn$, and asserts that $c == a * k$.

**BR3.** *Code to Proof.* Consider:
```java
public static boolean mysteryDivCheck(int n) {
    return (n * n * n - n) % 6 == 0;
}
```
State the mathematical theorem this checks and prove it. *(Hint: $n^3 - n = n(n-1)(n+1)$, which is a product of three consecutive integers.)*

---

## Solutions

### Discrete Math Solutions

**DM1 Solution.** Let $a \mid b$ and $b \mid c$. Then $b = am$ and $c = bn$ for some $m, n \in \mathbb{Z}$. Substituting: $c = (am)n = a(mn)$. Since $mn \in \mathbb{Z}$, $a \mid c$. $\blacksquare$

**DM2 Solution.** Since $a \mid b$, we have $b = am$. Since $a \mid c$, we have $c = an$. Then $b - c = am - an = a(m - n)$. Since $m - n \in \mathbb{Z}$, $a \mid (b - c)$. $\blacksquare$

**DM3 Solution.** Since $a \mid b$, we have $b = ak$ for some $k \in \mathbb{Z}$. Then $bn = (ak)n = a(kn)$. Since $kn \in \mathbb{Z}$, $a \mid bn$. $\blacksquare$

**DM4 Solution.** Since $a \mid b$, we have $b = am$ for some $m \in \mathbb{Z}$. Since $c \mid d$, we have $d = cn$ for some $n \in \mathbb{Z}$. Then $bd = (am)(cn) = (ac)(mn)$. Since $mn \in \mathbb{Z}$, $ac \mid bd$. $\blacksquare$

**DM5 Solution.** **Disproof.** Let $a = 2$ and $b = 3$. Then $ab = 6$ and $6 \mid 6$, but $6 \nmid 2$ and $6 \nmid 3$. The claim is false. $\blacksquare$

Note: This *would* be true if 6 were prime (Euclid's lemma), but 6 is composite. The correct statement is: if $p$ is prime and $p \mid ab$, then $p \mid a$ or $p \mid b$.

**DM6 Solution.** Since $a \mid b$ and $b \neq 0$, we have $b = ak$ for some $k \in \mathbb{Z}$, $k \neq 0$ (since $b \neq 0$). Taking absolute values: $|b| = |a| \cdot |k|$. Since $|k| \geq 1$, we get $|b| \geq |a|$. $\blacksquare$

**DM7 Solution.** Among three consecutive integers $n, n+1, n+2$:
- At least one is even (divisible by 2).
- At least one is divisible by 3 (since the remainders mod 3 cycle through 0, 1, 2).

So $2 \mid n(n+1)(n+2)$ and $3 \mid n(n+1)(n+2)$. Since $\gcd(2, 3) = 1$, we get $6 \mid n(n+1)(n+2)$. $\blacksquare$

---

### Java Solutions

**JP1 Solution.**
```java
public static boolean relativelyPrime(int a, int b) {
    // Two numbers are relatively prime if their only common positive divisor is 1
    a = Math.abs(a); b = Math.abs(b);
    for (int d = 2; d <= Math.min(a, b); d++) {
        if (a % d == 0 && b % d == 0) {
            return false;   // found a common divisor > 1
        }
    }
    return true;
}
```

**JP2 Solution.**
```java
public static int sumOfDivisors(int n) {
    // σ(n) = sum of all positive divisors of n
    int sum = 0;
    for (int d = 1; d <= Math.abs(n); d++) {
        if (n % d == 0) {
            sum += d;
        }
    }
    return sum;
}
```

**JP3 Solution.**
```java
public static void findAbundant(int limit) {
    System.out.println("Abundant numbers up to " + limit + ":");
    for (int n = 2; n <= limit; n++) {
        int properSum = sumOfDivisors(n) - n;  // subtract n itself
        if (properSum > n) {
            System.out.printf("  %d (proper divisor sum = %d)%n", n, properSum);
        }
    }
}
// Output includes: 12, 18, 20, 24, 30, 36, 40, 42, 48, 54, 56, 60, ...
```

**JP4 Solution.**
```java
public static void printDivisibilityChain(int a, int b, int c) {
    if (b % a != 0 || c % b != 0) {
        System.out.println("Hypotheses not met: a|b and b|c required.");
        return;
    }
    int m = b / a;
    int n = c / b;
    int k = m * n;
    System.out.printf("%d = %d * %d   (m = %d)%n", b, a, m, m);
    System.out.printf("%d = %d * %d   (n = %d)%n", c, b, n, n);
    System.out.printf("%d = %d * %d   (k = m*n = %d*%d = %d)%n", c, a, k, m, n, k);
}
```

**JP5 Solution.**
```java
public static int[] filterDivisible(int[] arr, int d) {
    // Returns {x ∈ arr : d | x}
    return java.util.Arrays.stream(arr)
        .filter(x -> x % d == 0)
        .toArray();
}

// Or without streams:
public static int[] filterDivisibleLoop(int[] arr, int d) {
    int count = 0;
    for (int x : arr) if (x % d == 0) count++;
    int[] result = new int[count];
    int idx = 0;
    for (int x : arr) {
        if (x % d == 0) result[idx++] = x;
    }
    return result;
}
```

**JP6 Solution.**
```java
public static int gcd_naive(int a, int b) {
    a = Math.abs(a); b = Math.abs(b);
    if (a == 0) return b;
    if (b == 0) return a;
    int gcd = 1;
    for (int d = 1; d <= Math.min(a, b); d++) {
        if (a % d == 0 && b % d == 0) {
            gcd = d;
        }
    }
    return gcd;
}
// This is O(min(a, b)) — the Euclidean algorithm in Class 3 is O(log(min(a,b)))
```

---

### Bridge Problem Solutions

**BR1 Solution.**

*Proof:* Among $n, n+1, n+2$, one is divisible by 2 and one by 3 (since they are consecutive, their remainders mod 2 cycle through 0-1, and mod 3 through 0-1-2). So the product is divisible by both 2 and 3, hence by 6. $\blacksquare$

```java
public static void verifyConsecutiveTriple() {
    for (int n = -100; n <= 100; n++) {
        long product = (long) n * (n + 1) * (n + 2);
        assert product % 6 == 0 : "Failed for n=" + n;
    }
    System.out.println("n(n+1)(n+2) is always divisible by 6: verified.");
}
```

**BR2 Solution.**
```java
public static int transitivityWitness(int a, int b, int c) {
    assert b % a == 0 : a + " does not divide " + b;
    assert c % b == 0 : b + " does not divide " + c;
    int m = b / a;       // b = a * m
    int n = c / b;       // c = b * n
    int k = m * n;       // c = a * k
    assert c == a * k : "Witness verification failed";
    return k;
}
```

**BR3 Solution.**

The method checks: $6 \mid (n^3 - n)$ for all $n$.

*Theorem:* For any integer $n$, $n^3 - n$ is divisible by 6.

*Proof:* Factor: $n^3 - n = n(n^2 - 1) = n(n-1)(n+1) = (n-1) \cdot n \cdot (n+1)$. This is the product of three consecutive integers. Among any three consecutive integers, one is divisible by 2 and one by 3. Since $\gcd(2,3) = 1$, the product is divisible by $2 \times 3 = 6$. $\blacksquare$
