# Module 7 – Class 1: Sum and Product Principles

## Learning Objectives

- State and apply the rule of product (multiplication principle) and the rule of sum (addition principle).
- Use inclusion-exclusion for overlapping cases.
- Connect counting principles to nested loops and algorithm analysis.
- Estimate the size of search spaces using counting arguments.

---

## Concept Overview

### Rule of Product (Multiplication Principle)

If a process can be broken into **sequential stages**, with $a$ choices for stage 1 and $b$ choices for stage 2 (independent of stage 1's choice), then there are $a \cdot b$ total outcomes.

**General form:** For $k$ stages with $n_1, n_2, \ldots, n_k$ choices:

$$\text{Total} = n_1 \cdot n_2 \cdots n_k = \prod_{i=1}^{k} n_i$$

### Rule of Sum (Addition Principle)

If a task can be done in **one of several disjoint ways**, with $a$ choices for way 1 and $b$ choices for way 2 (with no overlap), then there are $a + b$ total choices.

$$|A \cup B| = |A| + |B| \quad \text{when } A \cap B = \emptyset$$

### Inclusion-Exclusion (for overlapping cases)

When the cases overlap:

$$|A \cup B| = |A| + |B| - |A \cap B|$$

### Connection to Loops

| Counting Principle | Code Pattern | Iterations |
|-------------------|-------------|-----------|
| Product rule | Nested loops | $m \times n$ |
| Sum rule | Sequential blocks / `if-else` | $m + n$ |
| $k$-fold product | $k$ nested loops | $n_1 \cdot n_2 \cdots n_k$ |

### Connection to Sets (Module 4)

- **Product rule:** $|A \times B| = |A| \cdot |B|$ (Cartesian product)
- **Sum rule:** $|A \cup B| = |A| + |B|$ when $A \cap B = \emptyset$ (disjoint union)

---

## Formal Notation

For finite sets $A, B$:
- $|A \times B| = |A| \cdot |B|$
- $|A \cup B| = |A| + |B| - |A \cap B|$
- $|A^k| = |A|^k$ (strings of length $k$ over alphabet $A$)

---

## Worked Examples

### Example 1: 4-Digit PINs

How many 4-digit PINs (digits 0–9)?

Each digit: 10 choices. By the product rule: $10^4 = 10000$.

```java
int count = 0;
for (int d1 = 0; d1 <= 9; d1++)
  for (int d2 = 0; d2 <= 9; d2++)
    for (int d3 = 0; d3 <= 9; d3++)
      for (int d4 = 0; d4 <= 9; d4++)
        count++;
// count == 10000
```

### Example 2: License Plates

3 letters (A–Z) followed by 3 digits (0–9):
$$26^3 \cdot 10^3 = 17{,}576 \cdot 1000 = 17{,}576{,}000$$

### Example 3: Strings with Constraints

How many 3-character strings over $\{a, b, c, d\}$ start with $a$ or end with $d$?

- Start with $a$: $1 \cdot 4 \cdot 4 = 16$.
- End with $d$: $4 \cdot 4 \cdot 1 = 16$.
- Start with $a$ AND end with $d$: $1 \cdot 4 \cdot 1 = 4$.
- By inclusion-exclusion: $16 + 16 - 4 = 28$.

### Example 4: Loop Iteration Count

```java
int count = 0;
for (int i = 0; i < m; i++)
    for (int j = 0; j < n; j++)
        count++;
```

By the product rule: `count == m * n`. This is the basis of Big-O analysis for nested loops.

### Example 5: Brute-Force vs. Smart Search

**Problem:** Find all 8-character passwords using lowercase letters + digits.

Search space: $36^8 = 2{,}821{,}109{,}907{,}456 \approx 2.8 \times 10^{12}$.

At 1 billion checks/second: $\approx 2821$ seconds $\approx 47$ minutes.

This counting argument motivates why longer passwords and larger alphabets increase security.

---

## Proof Techniques Spotlight

### Counting Arguments as Proofs

To prove a set has a certain size, decompose the problem using sum/product rules:
1. Break into stages or cases.
2. Ensure stages are independent (product) or cases are disjoint (sum).
3. Multiply or add.

### Double Counting

Count the same set two different ways to establish an identity. Example: the number of ordered pairs $(a, b) \in A \times B$ can be counted as $|A| \cdot |B|$ or by summing over elements of $A$: $\sum_{a \in A} |B| = |A| \cdot |B|$.

---

## Java Deep Dive

```java
import java.util.*;
import java.util.stream.*;

public class CountingPrinciples {

    // --- Counting by Enumeration ---

    /**
     * Count all strings of length k over an alphabet of size n.
     * By product rule: n^k.
     */
    public static long countStrings(int alphabetSize, int length) {
        long count = 1;
        for (int i = 0; i < length; i++) {
            count *= alphabetSize;
        }
        return count;
    }

    /**
     * Generate all strings of length k over the given alphabet.
     * The number generated should equal alphabetSize^k.
     */
    public static List<String> generateStrings(char[] alphabet, int length) {
        List<String> result = new ArrayList<>();
        generateHelper(alphabet, length, new char[length], 0, result);
        return result;
    }

    private static void generateHelper(char[] alpha, int len, char[] current,
                                        int pos, List<String> result) {
        if (pos == len) {
            result.add(new String(current));
            return;
        }
        for (char c : alpha) {
            current[pos] = c;
            generateHelper(alpha, len, current, pos + 1, result);
        }
    }

    /**
     * Count iterations of k nested loops each from 0 to n-1.
     * By product rule: n^k.
     */
    public static long countNestedLoopIterations(int n, int k) {
        long count = 1;
        for (int i = 0; i < k; i++) count *= n;
        return count;
    }

    // --- Inclusion-Exclusion ---

    /**
     * |A ∪ B| = |A| + |B| - |A ∩ B|.
     */
    public static <T> int inclusionExclusion(Set<T> a, Set<T> b) {
        Set<T> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        return a.size() + b.size() - intersection.size();
    }

    /**
     * Three-set inclusion-exclusion:
     * |A ∪ B ∪ C| = |A| + |B| + |C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|.
     */
    public static <T> int inclusionExclusion3(Set<T> a, Set<T> b, Set<T> c) {
        Set<T> ab = new HashSet<>(a); ab.retainAll(b);
        Set<T> ac = new HashSet<>(a); ac.retainAll(c);
        Set<T> bc = new HashSet<>(b); bc.retainAll(c);
        Set<T> abc = new HashSet<>(ab); abc.retainAll(c);
        return a.size() + b.size() + c.size()
                - ab.size() - ac.size() - bc.size()
                + abc.size();
    }

    // --- Cartesian Product ---

    /**
     * Generate A × B as a list of pairs.
     * |result| should equal |A| * |B|.
     */
    public static <A, B> List<List<Object>> cartesianProduct(Set<A> setA, Set<B> setB) {
        List<List<Object>> result = new ArrayList<>();
        for (A a : setA) {
            for (B b : setB) {
                result.add(Arrays.asList(a, b));
            }
        }
        return result;
    }

    // --- Demo ---

    public static void main(String[] args) {
        System.out.println("=== Counting Principles ===\n");

        // Product rule: PINs
        System.out.println("4-digit PINs: " + countStrings(10, 4));

        // License plates
        System.out.println("License plates (3 letters + 3 digits): "
                + (countStrings(26, 3) * countStrings(10, 3)));

        // Generate small alphabet strings
        List<String> strs = generateStrings(new char[]{'a','b'}, 3);
        System.out.println("\nAll 3-char strings over {a,b}: " + strs);
        System.out.println("  Count: " + strs.size() + " (expected " + countStrings(2, 3) + ")");

        // Inclusion-exclusion
        Set<Integer> A = IntStream.rangeClosed(1, 20).filter(i -> i % 2 == 0)
                .boxed().collect(Collectors.toSet());
        Set<Integer> B = IntStream.rangeClosed(1, 20).filter(i -> i % 3 == 0)
                .boxed().collect(Collectors.toSet());
        System.out.println("\nEvens in {1..20}: " + A.size());
        System.out.println("Multiples of 3 in {1..20}: " + B.size());
        System.out.println("|A ∪ B| by inclusion-exclusion: " + inclusionExclusion(A, B));

        // Cartesian product
        Set<String> colors = Set.of("red", "blue");
        Set<Integer> sizes = Set.of(1, 2, 3);
        var cp = cartesianProduct(colors, sizes);
        System.out.println("\n{red,blue} × {1,2,3}: " + cp);
        System.out.println("  Count: " + cp.size() + " (expected " + (colors.size() * sizes.size()) + ")");

        // Nested loop counting
        System.out.println("\nNested loops (m=5, n=4): " + (5 * 4) + " iterations");
        System.out.println("3 nested loops (n=10): " + countNestedLoopIterations(10, 3));

        // Password space
        long passSpace = countStrings(36, 8);
        System.out.println("\n8-char password space (a-z + 0-9): " + passSpace);
    }
}
```

---

## Historical Context

Counting principles have ancient roots. **Indian mathematicians** (Mahavira, 9th century) and **Arabic scholars** systematized combinatorial counting. **Blaise Pascal** (1654) and **Pierre de Fermat** developed counting methods through their study of gambling problems, which also launched probability theory.

The **inclusion-exclusion principle** was formalized by **Abraham de Moivre** (1718) and extended by **Sylvester** (1883). It is fundamentally connected to Euler's totient function, the sieve of Eratosthenes, and Möbius inversion.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** A restaurant offers 3 appetizers, 5 entrees, and 4 desserts. How many different meals can you order?

**A2.** How many 5-bit binary strings are there? How does this relate to the power set of a 5-element set?

**A3.** A program has a loop over $m$ items inside a loop over $n$ items. How many operations?

### Slide Set B: Proof Problems

**B1.** Use counting to prove: $|A \times B| = |B \times A|$ for finite sets.

**B2.** Prove by inclusion-exclusion: the number of integers in $\{1, \ldots, 100\}$ divisible by 2 or 3 is 67.

**B3.** Prove: the number of functions from an $n$-element set to a $k$-element set is $k^n$.

### Slide Set C: Java Coding Problems

**C1.** Write `generateStrings(alphabet, length)` and verify the count matches $|\text{alphabet}|^{\text{length}}$.

**C2.** Compute the Cartesian product of two sets. Verify $|A \times B| = |A| \cdot |B|$.

**C3.** Write a method counting integers in $\{1, \ldots, n\}$ divisible by $a$ or $b$. Use inclusion-exclusion.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** How many strings of length 6 can be formed from the 26 lowercase letters if (a) repetition is allowed, (b) no letter is repeated?

**DM2.** How many integers in $\{1, \ldots, 1000\}$ are divisible by 2, 3, or 5? Use inclusion-exclusion.

**DM3.** A function $f: \{1,\ldots,n\} \to \{1,\ldots,k\}$ corresponds to a string of length $n$ over a $k$-letter alphabet. How many such functions are there? (Connect to Module 5.)

**DM4.** Prove: the number of subsets of $\{1,\ldots,n\}$ is $2^n$ using the product rule: for each element, choose "in" or "out." (Alternative to the induction proof from Module 6.)

**DM5.** How many ways can you seat $n$ people in a row? In a circle? (Introduce permutations preview.)

### Java Programming Problems

**JP1.** Generate all binary strings of length $n$. Verify count equals $2^n$.

**JP2.** Implement 3-set inclusion-exclusion. Verify: integers in {1..1000} divisible by 2, 3, or 5.

**JP3.** Generate all strings of length 3 over $\{a,b,c,d\}$ that start with $a$ or end with $d$ (Example 3). Verify count is 28.

**JP4.** Compute Cartesian products of 3 sets $A \times B \times C$. Verify $|A \times B \times C| = |A| \cdot |B| \cdot |C|$.

**JP5.** Estimate brute-force time for an $n$-character password over a $k$-symbol alphabet at $10^9$ guesses/sec.

### Bridge Problems

**BR1.** From Module 4: the password space $\{a,...,z,0,...,9\}^n$ is a Cartesian product. Each element is a function $f: \{1,...,n\} \to \{a,...,z,0,...,9\}$ (Module 5). How many such functions are injective? Connect to Module 5's injectivity.

**BR2.** From Module 2: count the number of units mod $n$ (integers coprime to $n$ in $\{1,...,n\}$) using inclusion-exclusion on prime factors. Connect to Euler's totient function $\phi(n)$.

---

## Solutions

### Discrete Math Solutions

**DM1.** (a) $26^6 = 308{,}915{,}776$. (b) $26 \cdot 25 \cdot 24 \cdot 23 \cdot 22 \cdot 21 = 165{,}765{,}600$.

**DM2.** $|D_2| = 500, |D_3| = 333, |D_5| = 200, |D_2 \cap D_3| = |D_6| = 166, |D_2 \cap D_5| = |D_{10}| = 100, |D_3 \cap D_5| = |D_{15}| = 66, |D_2 \cap D_3 \cap D_5| = |D_{30}| = 33$.

By inclusion-exclusion: $500 + 333 + 200 - 166 - 100 - 66 + 33 = 734$.

**DM3.** Each of the $n$ inputs can be mapped to any of $k$ outputs independently. By the product rule: $k^n$ functions.

**DM4.** For each element $x_i \in \{1,...,n\}$, there are 2 choices: include $x_i$ or exclude $x_i$. All choices are independent. By the product rule: $2^n$ subsets.

**DM5.** Row: $n!$. Circle: $(n-1)!$ (fix one person, permute the rest).
