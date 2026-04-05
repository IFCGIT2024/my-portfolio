# Module 3 – Class 2: Implication, Contraposition and Quantifiers

## Learning Objectives

- Distinguish between an implication, its converse, inverse, and contrapositive.
- Prove statements using contraposition and contradiction.
- Define universal ($\forall$) and existential ($\exists$) quantifiers and negate quantified statements.
- Translate quantified statements into Java loops and search patterns.
- Use quantifiers to express preconditions, postconditions, and loop invariants.

---

## Concept Overview

### Implication and Its Variants

Given the implication $P \rightarrow Q$ ("if P then Q"):

| Name | Form | Relation to Original |
|------|------|---------------------|
| **Original** | $P \rightarrow Q$ | — |
| **Converse** | $Q \rightarrow P$ | Not equivalent |
| **Inverse** | $\neg P \rightarrow \neg Q$ | Not equivalent (= converse of contrapositive) |
| **Contrapositive** | $\neg Q \rightarrow \neg P$ | **Logically equivalent** to original |

The contrapositive is the key tool: to prove "$P \rightarrow Q$", it is often easier to prove "$\neg Q \rightarrow \neg P$".

### Proof by Contradiction

To prove a statement $S$:
1. Assume $\neg S$.
2. Derive a contradiction (something that is always false).
3. Conclude $S$ must be true.

### Quantifiers

| Quantifier | Symbol | Meaning | Java Pattern |
|-----------|--------|---------|-------------|
| Universal | $\forall x \in S,\, P(x)$ | "For all $x$ in $S$, $P(x)$ is true" | `for` loop checking all elements |
| Existential | $\exists x \in S,\, P(x)$ | "There exists $x$ in $S$ such that $P(x)$ is true" | `for` loop with early `return true` |

**Negation of quantifiers:**
$$\neg(\forall x,\, P(x)) \equiv \exists x,\, \neg P(x)$$
$$\neg(\exists x,\, P(x)) \equiv \forall x,\, \neg P(x)$$

---

## Formal Notation

**Nested quantifiers** appear frequently:
- $\forall x,\, \exists y,\, P(x, y)$: "For every $x$, there is some $y$ making $P$ true."
- $\exists x,\, \forall y,\, P(x, y)$: "There is some $x$ that makes $P$ true for every $y$."

Order matters! These are generally not equivalent.

**Negation of nested quantifiers:**
$$\neg(\forall x,\, \exists y,\, P(x, y)) \equiv \exists x,\, \forall y,\, \neg P(x, y)$$

---

## Worked Examples

### Example 1: Proof by Contrapositive — Discrete Math

**Problem:** Prove: If $n^2$ is even, then $n$ is even.

**Proof (by contrapositive).** We prove the contrapositive: if $n$ is odd, then $n^2$ is odd.

Assume $n$ is odd. Then $n = 2k + 1$ for some integer $k$. So:
$$n^2 = (2k+1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$$

Since $2k^2 + 2k \in \mathbb{Z}$, $n^2$ is odd. $\blacksquare$

### Example 2: Java Translation — Universal and Existential Checks

```java
public class QuantifierDemo {

    /**
     * Universal quantifier: ∀x ∈ arr, predicate(x) is true.
     * Java pattern: loop through all, return false on failure.
     */
    public static boolean forAll(int[] arr,
            java.util.function.IntPredicate predicate) {
        for (int x : arr) {
            if (!predicate.test(x)) return false;  // found counterexample
        }
        return true;  // no counterexample found
    }

    /**
     * Existential quantifier: ∃x ∈ arr, predicate(x) is true.
     * Java pattern: loop through all, return true on success (witness found).
     */
    public static boolean exists(int[] arr,
            java.util.function.IntPredicate predicate) {
        for (int x : arr) {
            if (predicate.test(x)) return true;  // found witness
        }
        return false;  // no witness found
    }

    /** Find a witness (the actual x) for an existential claim */
    public static java.util.OptionalInt findWitness(int[] arr,
            java.util.function.IntPredicate predicate) {
        for (int x : arr) {
            if (predicate.test(x)) return java.util.OptionalInt.of(x);
        }
        return java.util.OptionalInt.empty();
    }

    public static void main(String[] args) {
        int[] data = {2, 4, 6, 8, 10};

        // ∀x ∈ data, x is even
        System.out.println("All even? " + forAll(data, x -> x % 2 == 0));

        // ∃x ∈ data, x > 7
        System.out.println("Exists > 7? " + exists(data, x -> x > 7));

        // Find witness
        var witness = findWitness(data, x -> x > 7);
        System.out.println("Witness > 7: " + witness);

        // Mixed: ∀x ∈ {1..100}, ∃y ∈ {1..100}, y = 2x  (only for x ≤ 50)
        int[] range = new int[100];
        for (int i = 0; i < 100; i++) range[i] = i + 1;
        boolean result = forAll(range,
            x -> x > 50 || exists(range, y -> y == 2 * x));
        System.out.println("∀x≤50, ∃y=2x in {1..100}: " + result);
    }
}
```

### Example 3: Proof by Contradiction — Combined

**Problem:** Prove that $\sqrt{2}$ is irrational.

**Proof (by contradiction).** Assume $\sqrt{2}$ is rational. Then $\sqrt{2} = p/q$ with $p, q \in \mathbb{Z}$, $q \neq 0$, and $\gcd(p, q) = 1$.

Squaring: $2 = p^2/q^2$, so $p^2 = 2q^2$.

Since $p^2$ is even, by Example 1 (contrapositive), $p$ is even. Write $p = 2m$.

Then $4m^2 = 2q^2$, so $q^2 = 2m^2$. By the same argument, $q$ is even.

But then both $p$ and $q$ are even, contradicting $\gcd(p, q) = 1$. $\blacksquare$

**Java illustration:** We can't prove irrationality in Java, but we can show that $\sqrt{2}$ is not equal to any fraction with a small denominator:
```java
public static void approximateSqrt2() {
    for (int q = 1; q <= 1000; q++) {
        int p = (int) Math.round(q * Math.sqrt(2));
        double approx = (double) p / q;
        double error = Math.abs(approx * approx - 2);
        if (error < 1e-10)
            System.out.printf("  %d/%d ≈ %.10f, error = %.2e%n", p, q, approx, error);
    }
    // None will have error exactly 0 — illustrating irrationality
}
```

### Example 4: Negating Quantified Statements

**Problem:** Write the negation of: "For all integers $x$, if $x^2$ is even then $x$ is even."

**Solution:**
Original: $\forall x \in \mathbb{Z},\, (x^2 \text{ is even} \rightarrow x \text{ is even})$

Negation: $\exists x \in \mathbb{Z},\, \neg(x^2 \text{ is even} \rightarrow x \text{ is even})$

Since $\neg(P \rightarrow Q) \equiv P \wedge \neg Q$:

$\exists x \in \mathbb{Z},\, (x^2 \text{ is even} \wedge x \text{ is odd})$

In English: "There exists an integer $x$ such that $x^2$ is even but $x$ is odd."

The original statement is true, so this negation is false — no such $x$ exists.

### Example 5: Quantifiers in Specifications

**Problem:** Express the loop invariant "all elements examined so far are positive" using quantifiers, then implement it as a Java assertion.

**Formal statement:** After $k$ iterations, $\forall i \in \{0, 1, \ldots, k-1\},\, \text{arr}[i] > 0$.

```java
public static boolean allPositive(int[] arr) {
    for (int k = 0; k < arr.length; k++) {
        // Loop invariant: ∀i ∈ {0,...,k-1}, arr[i] > 0
        // Check the invariant:
        for (int i = 0; i < k; i++) {
            assert arr[i] > 0 : "Invariant violated at i=" + i;
        }
        if (arr[k] <= 0) return false;
    }
    // Postcondition: ∀i ∈ {0,...,n-1}, arr[i] > 0
    return true;
}
```

---

## Proof Techniques Spotlight

### When to Use Each Proof Method

| Method | Use When | Template |
|--------|----------|---------|
| **Direct** | The hypothesis leads naturally to the conclusion | Assume P, derive Q |
| **Contrapositive** | The conclusion's negation gives you something concrete to work with | Assume ¬Q, derive ¬P |
| **Contradiction** | Neither direct nor contrapositive works easily; negating the entire statement gives a useful assumption | Assume ¬S, derive a contradiction |

**Example decision:** "If $3n + 2$ is odd, then $n$ is odd."
- Direct: Assume $3n + 2$ is odd → $3n + 2 = 2k + 1$ → $3n = 2k - 1$ → $n = (2k-1)/3$ → hard to show $n$ is odd.
- **Contrapositive:** Assume $n$ is even → $n = 2m$ → $3(2m) + 2 = 6m + 2 = 2(3m+1)$ → even. ✓ Much easier!

---

## Java Deep Dive

```java
import java.util.*;
import java.util.function.*;

public class QuantifierLibrary {

    // --- Generic Quantifiers ---

    /** ∀x ∈ collection, predicate(x) */
    public static <T> boolean forAll(Collection<T> items, Predicate<T> pred) {
        for (T item : items) {
            if (!pred.test(item)) return false;
        }
        return true;
    }

    /** ∃x ∈ collection, predicate(x) */
    public static <T> boolean exists(Collection<T> items, Predicate<T> pred) {
        for (T item : items) {
            if (pred.test(item)) return true;
        }
        return false;
    }

    /** Find witness for ∃x, predicate(x) */
    public static <T> Optional<T> findWitness(Collection<T> items, Predicate<T> pred) {
        for (T item : items) {
            if (pred.test(item)) return Optional.of(item);
        }
        return Optional.empty();
    }

    /** Find counterexample for ∀x, predicate(x) — i.e., find x where ¬predicate(x) */
    public static <T> Optional<T> findCounterexample(Collection<T> items, Predicate<T> pred) {
        return findWitness(items, pred.negate());
    }

    // --- Nested Quantifiers ---

    /** ∀x ∈ xs, ∃y ∈ ys, relation(x, y) */
    public static <S, T> boolean forAllExists(Collection<S> xs, Collection<T> ys,
            BiPredicate<S, T> relation) {
        for (S x : xs) {
            boolean found = false;
            for (T y : ys) {
                if (relation.test(x, y)) { found = true; break; }
            }
            if (!found) return false;
        }
        return true;
    }

    /** ∃x ∈ xs, ∀y ∈ ys, relation(x, y) */
    public static <S, T> boolean existsForAll(Collection<S> xs, Collection<T> ys,
            BiPredicate<S, T> relation) {
        for (S x : xs) {
            boolean allTrue = true;
            for (T y : ys) {
                if (!relation.test(x, y)) { allTrue = false; break; }
            }
            if (allTrue) return true;
        }
        return false;
    }

    // --- Proof Methods Demonstrated ---

    /** Direct proof check: if n is even, then n^2 is even */
    public static void demonstrateDirectProof() {
        System.out.println("Direct proof: if n is even, n^2 is even");
        List<Integer> evens = new ArrayList<>();
        for (int n = -100; n <= 100; n += 2) evens.add(n);
        boolean holds = forAll(evens, n -> (n * n) % 2 == 0);
        System.out.println("  Verified for evens in [-100,100]: " + holds);
    }

    /** Contrapositive check: if n^2 is even, then n is even */
    public static void demonstrateContrapositive() {
        System.out.println("Contrapositive: if n is odd, n^2 is odd");
        List<Integer> odds = new ArrayList<>();
        for (int n = -99; n <= 99; n += 2) odds.add(n);
        boolean holds = forAll(odds, n -> (n * n) % 2 != 0);
        System.out.println("  Verified for odds in [-99,99]: " + holds);
    }

    public static void main(String[] args) {
        System.out.println("=== Quantifier Library ===\n");

        List<Integer> numbers = new ArrayList<>();
        for (int i = 1; i <= 20; i++) numbers.add(i);

        // ∀x ∈ {1..20}, x > 0
        System.out.println("All positive: " + forAll(numbers, x -> x > 0));

        // ∃x ∈ {1..20}, x is prime
        System.out.println("Exists prime: " + exists(numbers, QuantifierLibrary::isPrime));

        // Find counterexample: ∀x, x < 15
        System.out.println("Counterexample for all < 15: " +
            findCounterexample(numbers, x -> x < 15));

        // Nested: ∀x ∈ {1..10}, ∃y ∈ {1..10}, x + y = 11
        List<Integer> small = numbers.subList(0, 10);
        System.out.println("∀x, ∃y, x+y=11: " +
            forAllExists(small, small, (x, y) -> x + y == 11));

        System.out.println();
        demonstrateDirectProof();
        demonstrateContrapositive();
    }

    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) if (n % d == 0) return false;
        return true;
    }
}
```

---

## Historical Context

**Gottlob Frege** (1848–1925) invented the formal notation for quantifiers in his *Begriffsschrift* (1879), creating the first complete system of predicate logic. His notation was different from what we use today but captured the same ideas.

**David Hilbert** (1862–1943) refined and popularized the $\forall$ and $\exists$ notation and made predicate logic central to his program for formalizing mathematics.

**Proof by contradiction** dates back to the ancient Greeks. Euclid's proof that there are infinitely many primes (c. 300 BC) is a famous example: assume finitely many primes $p_1, \ldots, p_n$; consider $N = p_1 \cdots p_n + 1$; $N$ is not divisible by any $p_i$, contradiction.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** State the contrapositive of: "If a function is differentiable, then it is continuous."

**A2.** Negate: $\forall \epsilon > 0,\, \exists \delta > 0,\, (|x - a| < \delta \rightarrow |f(x) - L| < \epsilon)$.

**A3.** Which Java loop pattern corresponds to $\forall$? Which to $\exists$?

**A4.** True or false: "If $P \rightarrow Q$ is true and $Q$ is true, then $P$ must be true."

### Slide Set B: Proof Problems

**B1.** Prove by contrapositive: If $3n + 2$ is odd, then $n$ is odd.

**B2.** Prove by contradiction: There is no largest prime number.

**B3.** Negate and simplify: "For all arrays $A$, if $A$ is sorted, then binary search on $A$ returns the correct result."

### Slide Set C: Java Coding Problems

**C1.** Write `boolean forAll(int[] arr, IntPredicate p)` and `boolean exists(int[] arr, IntPredicate p)`.

**C2.** Write a method that finds a counterexample to a universal claim over {1,...,1000}.

**C3.** Express the loop invariant "the current maximum is at least as large as all elements seen so far" using `forAll`, and check it at each iteration.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** For each statement, write its converse, inverse, and contrapositive:
(a) If $n$ is prime, then $n$ is odd or $n = 2$.
(b) If $a \mid b$ and $b \mid c$, then $a \mid c$.

**DM2.** Prove by contrapositive: If $n^3$ is odd, then $n$ is odd.

**DM3.** Prove by contradiction: $\sqrt{3}$ is irrational.

**DM4.** Negate each statement and determine whether the original or its negation is true:
(a) $\forall n \in \mathbb{Z},\, n^2 \geq 0$.
(b) $\exists n \in \mathbb{Z},\, n^2 + n + 1 = 0$.
(c) $\forall n \in \mathbb{N},\, \exists m \in \mathbb{N},\, m > n$.

**DM5.** Prove: For all integers $a$ and $b$, if $a + b \geq 15$, then $a \geq 8$ or $b \geq 8$.

**DM6.** Let $P(x, y)$ mean "$x + y$ is even." Determine the truth values of:
(a) $\forall x \in \mathbb{Z},\, P(x, x)$.
(b) $\forall x \in \mathbb{Z},\, \exists y \in \mathbb{Z},\, P(x, y)$.
(c) $\exists x \in \mathbb{Z},\, \forall y \in \mathbb{Z},\, P(x, y)$.

**DM7.** Prove or disprove: For all positive integers $n$, $2^n > n^2$.

### Java Programming Problems

**JP1.** Write a method `<T> Optional<T> findCounterexample(Iterable<T> domain, Predicate<T> claim)` that finds an element violating the claim.

**JP2.** Implement nested quantifier evaluation: `forAllExists(IntStream xs, IntStream ys, BiPredicate<Integer,Integer> p)`.

**JP3.** Write a method that takes two arrays and checks: $\forall i,\, \text{arr1}[i] \leq \text{arr2}[i]$ (element-wise comparison).

**JP4.** Implement a method that checks whether a relation (given as a `Set<int[]>` of pairs) is: reflexive, symmetric, transitive, antisymmetric.

**JP5.** Write a precondition checker: given a method that requires "arr is sorted", write `boolean isSorted(int[] arr)` expressed using a universal quantifier: $\forall i \in \{0, \ldots, n-2\},\, \text{arr}[i] \leq \text{arr}[i+1]$.

**JP6.** Write a Java method that empirically tests "for all even $n$ in [4, 10000], $n$ is the sum of two primes" (Goldbach's conjecture). Find a witness pair for each.

### Bridge Problems

**BR1.** The claim "binary search returns the correct index" can be formalized as: $\forall \text{sorted arrays } A,\, \forall k,\, (\text{binarySearch}(A, k) = i \rightarrow A[i] = k)$. Negate this claim and write Java code that searches for a counterexample.

**BR2.** Prove by contradiction that any comparison-based sorting algorithm requires $\Omega(n \log n)$ comparisons in the worst case. *(Hint: there are $n!$ possible permutations; each comparison splits the possibilities in at most two.)* Then write a Java program that counts comparisons in your implementation of merge sort and verifies the lower bound empirically.

**BR3.** Express the following using quantifiers and implement each as a Java method:
(a) "Array contains a duplicate" — $\exists i,\, \exists j,\, i \neq j \wedge \text{arr}[i] = \text{arr}[j]$.
(b) "Array is a permutation of {1,...,n}" — $\forall k \in \{1,\ldots,n\},\, \exists i,\, \text{arr}[i] = k$.

---

## Solutions

### Discrete Math Solutions

**DM1a.** Original: If $n$ prime → $n$ odd or $n=2$. Converse: If $n$ odd or $n=2$ → $n$ prime (false: 9 is odd but not prime). Inverse: If $n$ not prime → $n$ not odd and $n \neq 2$ (false: 9). Contrapositive: If $n$ not odd and $n \neq 2$ → $n$ not prime (true: even numbers > 2 are not prime).

**DM2.** Contrapositive: if $n$ is even, then $n^3$ is even. Let $n = 2k$. Then $n^3 = 8k^3 = 2(4k^3)$, which is even. $\blacksquare$

**DM3.** Assume $\sqrt{3} = p/q$ with $\gcd(p,q) = 1$. Then $3q^2 = p^2$, so $3 \mid p^2$, so $3 \mid p$ (since 3 is prime). Write $p = 3m$. Then $3q^2 = 9m^2$, so $q^2 = 3m^2$, so $3 \mid q$. But then $3 \mid \gcd(p,q)$, contradicting $\gcd(p,q) = 1$. $\blacksquare$

**DM4.** (a) Negation: $\exists n, n^2 < 0$. Original is **true** (squares are non-negative). (b) Negation: $\forall n, n^2 + n + 1 \neq 0$. The discriminant $1 - 4 = -3 < 0$, so no integer solutions. Negation is **true**, original is **false**. (c) Negation: $\exists n, \forall m, m \leq n$. This says natural numbers are bounded. Original is **true** (no largest natural number).

**DM5.** By contrapositive: if $a < 8$ and $b < 8$, then $a + b < 16$. Since $a \leq 7$ and $b \leq 7$, $a + b \leq 14 < 15$. $\blacksquare$

**DM6.** (a) True: $x + x = 2x$ is always even. (b) True: take $y = x$ (or any $y$ with same parity as $x$). (c) True: take $x = 0$ (even); $0 + y$ is even iff $y$ is even — wait, that's not for all $y$. Take $x = 2$; $2 + 1 = 3$ is odd. So (c) is **false**: no single $x$ makes $x + y$ even for all $y$.

**DM7.** False for small $n$: $2^1 = 2 > 1 = 1^2$ ✓, $2^2 = 4 = 4 = 2^2$ NO (not strictly greater). $2^3 = 8 < 9 = 3^2$ ✗. Counterexample: $n = 3$.

### Java Solutions

**JP4.**
```java
public static boolean isReflexive(Set<int[]> rel, Set<Integer> domain) {
    return forAll(domain, a ->
        exists(rel, pair -> pair[0] == a && pair[1] == a));
}

public static boolean isSymmetric(Set<int[]> rel) {
    return forAll(rel, pair ->
        exists(rel, p2 -> p2[0] == pair[1] && p2[1] == pair[0]));
}

public static boolean isTransitive(Set<int[]> rel) {
    return forAll(rel, ab ->
        forAll(rel, bc ->
            ab[1] != bc[0] || exists(rel, ac ->
                ac[0] == ab[0] && ac[1] == bc[1])));
}
```

**JP5.**
```java
public static boolean isSorted(int[] arr) {
    // ∀i ∈ {0,...,n-2}, arr[i] <= arr[i+1]
    for (int i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) return false;  // counterexample found
    }
    return true;
}
```

**JP6.**
```java
public static void testGoldbach(int limit) {
    boolean[] sieve = new boolean[limit + 1];
    Arrays.fill(sieve, true);
    sieve[0] = sieve[1] = false;
    for (int p = 2; p * p <= limit; p++)
        if (sieve[p]) for (int j = p*p; j <= limit; j += p) sieve[j] = false;

    for (int n = 4; n <= limit; n += 2) {
        boolean found = false;
        for (int p = 2; p <= n / 2; p++) {
            if (sieve[p] && sieve[n - p]) {
                System.out.printf("  %d = %d + %d%n", n, p, n - p);
                found = true;
                break;
            }
        }
        assert found : "Goldbach failed for " + n;
    }
}
```
