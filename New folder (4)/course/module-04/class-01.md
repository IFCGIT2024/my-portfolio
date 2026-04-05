# Module 4 – Class 1: Sets and Membership

## Learning Objectives

- Define sets, membership, the empty set and subset relations.
- Prove set equality using double inclusion ($A \subseteq B$ and $B \subseteq A$).
- Translate set concepts to Java's `Set<T>` interface.
- Apply element-chasing proofs to verify set relationships.
- Implement `isSubset`, `union`, `intersection` in Java and verify properties.

---

## Concept Overview

### What Is a Set?

A **set** is an unordered collection of distinct elements. Two sets are equal if and only if they contain the same elements.

$$A = B \iff (\forall x : x \in A \leftrightarrow x \in B)$$

| Term | Symbol | Meaning |
|------|--------|---------|
| Membership | $x \in A$ | $x$ is an element of $A$ |
| Empty set | $\emptyset$ or $\{\}$ | The set with no elements |
| Subset | $A \subseteq B$ | Every element of $A$ is in $B$ |
| Proper subset | $A \subset B$ | $A \subseteq B$ and $A \neq B$ |
| Set equality | $A = B$ | $A \subseteq B$ and $B \subseteq A$ |
| Cardinality | $|A|$ | Number of elements in $A$ |

### Roster and Set-Builder Notation

- **Roster notation**: $A = \{1, 2, 3\}$
- **Set-builder notation**: $A = \{x \in \mathbb{Z} \mid x > 0 \text{ and } x \leq 3\}$

### Key Properties

1. **No duplicates**: $\{1, 1, 2\} = \{1, 2\}$.
2. **No order**: $\{1, 2, 3\} = \{3, 1, 2\}$.
3. **Sets can contain sets**: $\{1, \{2, 3\}\}$ has two elements.

### Subsets

$A \subseteq B$ means $\forall x : x \in A \rightarrow x \in B$.

To prove $A \subseteq B$: Take an arbitrary $x \in A$ and show $x \in B$.
To disprove $A \subseteq B$: Find a specific $x \in A$ with $x \notin B$ (counterexample).

### Set Equality via Double Inclusion

To prove $A = B$:
1. Show $A \subseteq B$ (every element of $A$ is in $B$).
2. Show $B \subseteq A$ (every element of $B$ is in $A$).

**Why this matters in CS:**
- Sets model collections of **unique** items: user IDs, permissions, states, visited nodes.
- Database queries use set semantics (SQL `DISTINCT`, `UNION`, `INTERSECT`).
- Type systems use subsets: "Integer is a subset of Number."

---

## Formal Notation

| Expression | Meaning |
|-----------|---------|
| $\{x \in S \mid P(x)\}$ | Set of elements in $S$ satisfying predicate $P$ |
| $A \subseteq B$ | $\forall x (x \in A \rightarrow x \in B)$ |
| $A = B$ | $\forall x (x \in A \leftrightarrow x \in B)$ |
| $\|A\|$ | Number of elements in finite set $A$ |
| $\emptyset$ | The unique set with no elements |

---

## Worked Examples

### Example 1: Proving a Subset Relationship

**Claim:** If $A = \{x \in \mathbb{Z} \mid x \text{ is divisible by } 6\}$ and $B = \{x \in \mathbb{Z} \mid x \text{ is divisible by } 3\}$, then $A \subseteq B$.

**Proof.** Let $x \in A$. Then $6 \mid x$, so $x = 6k$ for some $k \in \mathbb{Z}$. But $x = 6k = 3(2k)$, and since $2k \in \mathbb{Z}$, we have $3 \mid x$, so $x \in B$. Since $x$ was arbitrary, $A \subseteq B$. $\blacksquare$

### Example 2: Disproving a Subset

**Claim:** $B \subseteq A$ (with $A$, $B$ as above).

**Disproof.** Counterexample: $9 \in B$ (since $3 \mid 9$) but $9 \notin A$ (since $6 \nmid 9$). So $B \not\subseteq A$. $\blacksquare$

### Example 3: Set Equality by Double Inclusion

**Claim:** $\{x \in \mathbb{Z} \mid x^2 = x\} = \{0, 1\}$.

**Proof.**
- ($\subseteq$): If $x^2 = x$, then $x^2 - x = 0$, so $x(x-1) = 0$, giving $x = 0$ or $x = 1$.
- ($\supseteq$): $0^2 = 0$ ✓ and $1^2 = 1$ ✓.

Both inclusions hold, so the sets are equal. $\blacksquare$

### Example 4: Empty Set Is a Subset of Every Set

**Claim:** $\emptyset \subseteq A$ for any set $A$.

**Proof.** We must show $\forall x (x \in \emptyset \rightarrow x \in A)$. Since $x \in \emptyset$ is always false, the implication is vacuously true. $\blacksquare$

### Example 5: Connecting to Module 1 — Divisor Sets

**Claim:** For positive integer $n$, let $D(n) = \{d \in \mathbb{Z}^+ \mid d \text{ divides } n\}$. If $a \mid b$, then $D(a) \subseteq D(b)$.

**Proof.** Let $d \in D(a)$, so $d \mid a$. Since $a \mid b$, by transitivity of divisibility (Module 1, Class 2), $d \mid b$, so $d \in D(b)$. $\blacksquare$

---

## Proof Techniques Spotlight

### Element-Chasing

The standard technique for proving set relationships:

**To prove $A \subseteq B$:**
> "Let $x \in A$. [Show that $x$ satisfies the conditions for membership in $B$.] Therefore $x \in B$."

**To prove $A = B$:**
> "($\subseteq$): Let $x \in A$. ... Therefore $x \in B$.
> ($\supseteq$): Let $x \in B$. ... Therefore $x \in A$.
> By double inclusion, $A = B$."

**To prove $A \cap B \subseteq C$:**
> "Let $x \in A \cap B$. Then $x \in A$ and $x \in B$. [Use both facts to show $x \in C$.]"

---

## Java Deep Dive

```java
import java.util.*;
import java.util.stream.*;

public class SetMembershipLibrary {

    // --- Membership and Subset ---

    /**
     * Check whether every element of A is contained in B.
     * Implements: A ⊆ B ≡ ∀x (x ∈ A → x ∈ B)
     */
    public static <T> boolean isSubset(Set<T> a, Set<T> b) {
        for (T x : a) {
            if (!b.contains(x)) return false;
        }
        return true;
    }

    /**
     * Check set equality via double inclusion.
     * A = B iff A ⊆ B and B ⊆ A
     */
    public static <T> boolean setEquals(Set<T> a, Set<T> b) {
        return isSubset(a, b) && isSubset(b, a);
    }

    // --- Set Construction ---

    /**
     * Build a set from a predicate (set-builder notation).
     * { x ∈ universe | predicate(x) }
     */
    public static <T> Set<T> setBuilder(Set<T> universe,
                                         java.util.function.Predicate<T> predicate) {
        Set<T> result = new HashSet<>();
        for (T x : universe) {
            if (predicate.test(x)) result.add(x);
        }
        return result;
    }

    /**
     * Compute the set of positive divisors of n.
     * D(n) = { d ∈ Z+ | d divides n }
     * Connects to Module 1.
     */
    public static Set<Integer> divisorSet(int n) {
        Set<Integer> result = new TreeSet<>();
        for (int d = 1; d <= Math.abs(n); d++) {
            if (n % d == 0) result.add(d);
        }
        return result;
    }

    // --- Intersection and Union ---

    /**
     * A ∩ B = { x | x ∈ A and x ∈ B }
     * Returns a new set (does not mutate inputs).
     */
    public static <T> Set<T> intersection(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.retainAll(b);
        return result;
    }

    /**
     * A ∪ B = { x | x ∈ A or x ∈ B }
     * Returns a new set (does not mutate inputs).
     */
    public static <T> Set<T> union(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.addAll(b);
        return result;
    }

    /**
     * A \ B = { x | x ∈ A and x ∉ B }
     */
    public static <T> Set<T> difference(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.removeAll(b);
        return result;
    }

    // --- Verification Methods ---

    /**
     * Verify A ∩ B ⊆ A (a basic set identity).
     */
    public static <T> boolean verifyIntersectionSubset(Set<T> a, Set<T> b) {
        Set<T> inter = intersection(a, b);
        return isSubset(inter, a);
    }

    /**
     * Verify: if a | b then D(a) ⊆ D(b).
     * Connects divisibility (Module 1) with set theory.
     */
    public static boolean verifyDivisorSubset(int a, int b) {
        if (b % a != 0) return false;  // a does not divide b
        return isSubset(divisorSet(a), divisorSet(b));
    }

    // --- Demonstration ---

    public static void main(String[] args) {
        System.out.println("=== Set Membership Library ===\n");

        // Basic sets
        Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3, 4));
        Set<Integer> b = new HashSet<>(Arrays.asList(2, 3, 4, 5, 6));
        Set<Integer> c = new HashSet<>(Arrays.asList(1, 2, 3));

        System.out.println("A = " + a);
        System.out.println("B = " + b);
        System.out.println("C = " + c);

        // Subset tests
        System.out.println("\nC ⊆ A? " + isSubset(c, a));       // true
        System.out.println("A ⊆ B? " + isSubset(a, b));         // false (1 ∉ B)

        // Set operations
        System.out.println("\nA ∩ B = " + intersection(a, b));   // {2,3,4}
        System.out.println("A ∪ B = " + union(a, b));            // {1,2,3,4,5,6}
        System.out.println("A \\ B = " + difference(a, b));      // {1}

        // Verify A ∩ B ⊆ A
        System.out.println("\nA ∩ B ⊆ A? " + verifyIntersectionSubset(a, b));

        // Set-builder notation
        Set<Integer> universe = IntStream.rangeClosed(1, 20)
                .boxed().collect(Collectors.toSet());
        Set<Integer> evens = setBuilder(universe, n -> n % 2 == 0);
        Set<Integer> divBy3 = setBuilder(universe, n -> n % 3 == 0);
        System.out.println("\nEvens in [1,20]: " + new TreeSet<>(evens));
        System.out.println("Div by 3 in [1,20]: " + new TreeSet<>(divBy3));
        System.out.println("Even ∩ DivBy3: " + new TreeSet<>(intersection(evens, divBy3)));

        // Divisor sets (connecting to Module 1)
        System.out.println("\nD(12) = " + divisorSet(12));
        System.out.println("D(6)  = " + divisorSet(6));
        System.out.println("6 | 12? " + (12 % 6 == 0));
        System.out.println("D(6) ⊆ D(12)? " + verifyDivisorSubset(6, 12));
    }
}
```

---

## Historical Context

**Georg Cantor** (1845–1918) created set theory in the 1870s–1880s, defining a set as "a gathering together into a whole of definite, distinct objects of our perception or thought." His work on infinite sets (countable vs. uncountable) sparked a revolution in mathematics.

**Ernst Zermelo** and **Abraham Fraenkel** formalized set theory axiomatically (ZF/ZFC) in the early 20th century, addressing paradoxes like Russell's paradox ($\{x \mid x \notin x\}$).

In computer science, sets appear everywhere: hash sets, tree sets, bit vectors. Java's `Set<T>` interface directly mirrors the mathematical concept: `contains()` for $\in$, `addAll()` for $\cup$, `retainAll()` for $\cap$.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** Let $A = \{1, 2, 3\}$, $B = \{2, 3, 4\}$. Is $A \subseteq B$? Is $B \subseteq A$? Is $A = B$?

**A2.** How many subsets does $\{a, b, c\}$ have? List them all.

**A3.** True or false: $\emptyset \in \{1, 2, 3\}$. True or false: $\emptyset \subseteq \{1, 2, 3\}$.

**A4.** If $|A| = 5$ and $A \subseteq B$, what is the minimum possible value of $|B|$?

### Slide Set B: Proof Problems

**B1.** Prove: If $A \subseteq B$ and $B \subseteq C$, then $A \subseteq C$ (transitivity of subset).

**B2.** Prove: $A \cap B \subseteq A$ for any sets $A$ and $B$.

**B3.** Prove or disprove: If $A \subseteq B$ and $A \subseteq C$, then $A \subseteq B \cap C$.

### Slide Set C: Java Coding Problems

**C1.** Write a method `<T> Set<T> symmetricDifference(Set<T> a, Set<T> b)` that returns elements in exactly one of the two sets.

**C2.** Write a method that takes a `List<Integer>` and returns a `Set<Integer>` of duplicates.

**C3.** Implement `divisorSet(int n)` and verify that `D(6) ⊆ D(12)`.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Let $A = \{1, 2, 3, 4, 5\}$, $B = \{3, 4, 5, 6, 7\}$. Compute $A \cap B$, $A \cup B$, $A \setminus B$, $B \setminus A$.

**DM2.** Prove by element-chasing: $A \cap (B \cup C) \supseteq (A \cap B) \cup (A \cap C)$.

**DM3.** Prove that $A \subseteq B$ if and only if $A \cap B = A$.

**DM4.** Let $E = \{n \in \mathbb{Z} \mid n \text{ is even}\}$ and $O = \{n \in \mathbb{Z} \mid n \text{ is odd}\}$. Prove $E \cap O = \emptyset$ and $E \cup O = \mathbb{Z}$.

**DM5.** Prove that $|\mathcal{P}(\emptyset)| = 1$ and identify the single element of $\mathcal{P}(\emptyset)$.

**DM6.** Prove: $A \setminus B = A \cap \overline{B}$ (where $\overline{B}$ is the complement of $B$ relative to a universal set $U$).

### Java Programming Problems

**JP1.** Write a method `boolean isSubset(Set<Integer> a, Set<Integer> b)` and test with at least 5 pairs of sets.

**JP2.** Implement set-builder notation: `Set<Integer> setBuilder(int low, int high, Predicate<Integer> p)` returning all integers in $[\text{low}, \text{high}]$ satisfying $p$. Use it to build the set of primes less than 100.

**JP3.** Write a method that, given two sets $A$ and $B$, verifies the identity $|A \cup B| = |A| + |B| - |A \cap B|$ by computing both sides.

**JP4.** Implement `divisorSet(int n)` and write tests verifying: if $a | b$ then $D(a) \subseteq D(b)$. Test for $a = 6, b = 30$ and $a = 4, b = 12$.

**JP5.** Write a method that partitions a set of integers into two subsets: primes and composites (connecting to Module 1).

### Bridge Problems

**BR1.** Prove mathematically that for positive integers $a$ and $b$, $D(\gcd(a,b)) = D(a) \cap D(b)$. Then write Java code to verify this for all pairs $(a,b)$ with $1 \leq a, b \leq 50$.

**BR2.** Prove: the set of all linear combinations $\{ax + by \mid x, y \in \mathbb{Z}\}$ equals the set of all multiples of $\gcd(a,b)$. Write a Java method that generates both sets for $a, b \leq 20$ and verifies equality (for sufficiently many values).

---

## Solutions

### Discrete Math Solutions

**DM1.** $A \cap B = \{3, 4, 5\}$. $A \cup B = \{1, 2, 3, 4, 5, 6, 7\}$. $A \setminus B = \{1, 2\}$. $B \setminus A = \{6, 7\}$.

**DM2.** Let $x \in (A \cap B) \cup (A \cap C)$. Then $x \in A \cap B$ or $x \in A \cap C$.
- Case 1: $x \in A \cap B$. Then $x \in A$ and $x \in B$. Since $x \in B$, $x \in B \cup C$. So $x \in A \cap (B \cup C)$.
- Case 2: $x \in A \cap C$. Then $x \in A$ and $x \in C \subseteq B \cup C$. So $x \in A \cap (B \cup C)$.

In both cases, $x \in A \cap (B \cup C)$. $\blacksquare$

**DM3.** ($\Rightarrow$): Assume $A \subseteq B$. Let $x \in A \cap B$, then $x \in A$, so $A \cap B \subseteq A$. Now let $x \in A$. Since $A \subseteq B$, $x \in B$, so $x \in A \cap B$. Thus $A \subseteq A \cap B$. By double inclusion, $A \cap B = A$.

($\Leftarrow$): Assume $A \cap B = A$. Let $x \in A$. Then $x \in A \cap B$ (since $A = A \cap B$), so $x \in B$. Thus $A \subseteq B$. $\blacksquare$

**DM4.** ($E \cap O = \emptyset$): Suppose $n \in E \cap O$. Then $2 | n$ and $n = 2k+1$. So $2 | (2k+1)$, meaning $2k+1 = 2m$, giving $1 = 2(m-k)$. But $|2(m-k)| \geq 2$ or $= 0$, so no integer satisfies this. Contradiction.

($E \cup O = \mathbb{Z}$): For any $n \in \mathbb{Z}$, by the quotient-remainder theorem (Module 2), $n = 2q + r$ where $r \in \{0, 1\}$. If $r = 0$, $n \in E$. If $r = 1$, $n \in O$. $\blacksquare$

**DM5.** $\mathcal{P}(\emptyset) = \{\emptyset\}$. It has exactly one element (the empty set itself is the only subset of the empty set). $|\mathcal{P}(\emptyset)| = 2^0 = 1$. $\blacksquare$

### Java Solutions

**JP2.**
```java
public static Set<Integer> setBuilder(int low, int high,
                                       Predicate<Integer> p) {
    Set<Integer> result = new TreeSet<>();
    for (int i = low; i <= high; i++) {
        if (p.test(i)) result.add(i);
    }
    return result;
}

// Primes less than 100
Set<Integer> primes = setBuilder(2, 99, n -> {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
});
```

**BR1.**
```java
// Verify D(gcd(a,b)) = D(a) ∩ D(b)
for (int a = 1; a <= 50; a++) {
    for (int b = 1; b <= 50; b++) {
        int g = gcd(a, b);
        Set<Integer> dGcd = divisorSet(g);
        Set<Integer> inter = intersection(divisorSet(a), divisorSet(b));
        assert dGcd.equals(inter)
            : "Failed for a=" + a + ", b=" + b;
    }
}
```
