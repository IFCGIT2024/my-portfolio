# Module 4 – Class 3: Power Sets, Indexed Families and Partitions

## Learning Objectives

- Define and compute power sets, proving $|\mathcal{P}(A)| = 2^{|A|}$.
- Represent indexed families of sets and compute their unions and intersections.
- Define partitions and connect them to equivalence classes (Module 5 preview).
- Implement power set generation using recursion and bit masks in Java.
- Apply subset enumeration and partitioning to algorithmic problems.

---

## Concept Overview

### Power Sets

The **power set** of $A$, written $\mathcal{P}(A)$, is the set of all subsets of $A$.

$$\mathcal{P}(A) = \{S \mid S \subseteq A\}$$

**Example:** $\mathcal{P}(\{1, 2\}) = \{\emptyset, \{1\}, \{2\}, \{1, 2\}\}$

**Theorem:** If $|A| = n$, then $|\mathcal{P}(A)| = 2^n$.

**Proof by induction on $n$:**
- **Base:** $n = 0$. $A = \emptyset$, $\mathcal{P}(\emptyset) = \{\emptyset\}$. $|\mathcal{P}(\emptyset)| = 1 = 2^0$. ✓
- **Inductive step:** Assume $|\mathcal{P}(S)| = 2^k$ for any set $S$ with $|S| = k$. Let $|A| = k + 1$ and pick $a \in A$. Let $A' = A \setminus \{a\}$, so $|A'| = k$. Every subset of $A$ either contains $a$ or doesn't:
  - Subsets not containing $a$: subsets of $A'$, of which there are $2^k$.
  - Subsets containing $a$: each is $S \cup \{a\}$ for some $S \subseteq A'$, so there are $2^k$.
  - Total: $2^k + 2^k = 2^{k+1}$. $\blacksquare$

### Indexed Families of Sets

An **indexed family** $\{A_i\}_{i \in I}$ assigns a set $A_i$ to each index $i$ in an index set $I$.

$$\bigcup_{i \in I} A_i = \{x \mid \exists i \in I : x \in A_i\}$$
$$\bigcap_{i \in I} A_i = \{x \mid \forall i \in I : x \in A_i\}$$

In Java: `Map<K, Set<V>>` represents an indexed family.

### Partitions

A **partition** of set $A$ is a collection of non-empty subsets $\{A_1, A_2, \ldots, A_k\}$ such that:
1. **Pairwise disjoint:** $A_i \cap A_j = \emptyset$ for $i \neq j$.
2. **Cover $A$:** $A_1 \cup A_2 \cup \cdots \cup A_k = A$.

**Examples:**
- $\{E, O\}$ where $E$ = even integers and $O$ = odd integers is a partition of $\mathbb{Z}$.
- Congruence classes modulo $m$ partition $\mathbb{Z}$ into $m$ classes (connects to Module 2).

**Key connection:** Every equivalence relation on $A$ induces a partition of $A$ into equivalence classes, and every partition determines an equivalence relation. (Module 5 will formalize this.)

**Why this matters in CS:**
- **Subset enumeration** (power sets) appears in backtracking, SAT solvers, and combinatorial optimization.
- **Partitions** model equivalence classes, graph components, union-find structures.
- **Indexed families** represent grouping operations (SQL `GROUP BY`, Map-Reduce).

---

## Formal Notation

| Notation | Meaning |
|----------|---------|
| $\mathcal{P}(A)$ | Power set: all subsets of $A$ |
| $\{A_i\}_{i \in I}$ | Indexed family of sets |
| $\bigcup_{i \in I} A_i$ | Union of all sets in the family |
| $\bigcap_{i \in I} A_i$ | Intersection of all sets in the family |
| Partition | Disjoint cover of a set |

---

## Worked Examples

### Example 1: Power Set Computation

**Problem:** Compute $\mathcal{P}(\{a, b, c\})$.

**Solution:**
$$\mathcal{P}(\{a,b,c\}) = \{\emptyset, \{a\}, \{b\}, \{c\}, \{a,b\}, \{a,c\}, \{b,c\}, \{a,b,c\}\}$$

$|\mathcal{P}(\{a,b,c\})| = 2^3 = 8$. ✓

### Example 2: Power Set via Bit Masks

Each subset of $\{a_0, a_1, \ldots, a_{n-1}\}$ corresponds to an $n$-bit integer where bit $i$ indicates whether $a_i$ is included.

For $\{a, b, c\}$:
| Binary | Decimal | Subset |
|--------|---------|--------|
| 000 | 0 | $\emptyset$ |
| 001 | 1 | $\{a\}$ |
| 010 | 2 | $\{b\}$ |
| 011 | 3 | $\{a,b\}$ |
| 100 | 4 | $\{c\}$ |
| 101 | 5 | $\{a,c\}$ |
| 110 | 6 | $\{b,c\}$ |
| 111 | 7 | $\{a,b,c\}$ |

### Example 3: Indexed Family

**Problem:** Let $A_i = \{i, i+1, i+2\}$ for $i \in \{1, 2, 3\}$. Compute $\bigcup_{i=1}^{3} A_i$ and $\bigcap_{i=1}^{3} A_i$.

$A_1 = \{1, 2, 3\}$, $A_2 = \{2, 3, 4\}$, $A_3 = \{3, 4, 5\}$.

$\bigcup = \{1, 2, 3, 4, 5\}$. $\bigcap = \{3\}$.

### Example 4: Partition by Congruence Classes

**Problem:** Partition $\{0, 1, 2, \ldots, 11\}$ by congruence modulo 3.

$[0]_3 = \{0, 3, 6, 9\}$, $[1]_3 = \{1, 4, 7, 10\}$, $[2]_3 = \{2, 5, 8, 11\}$.

Verification: pairwise disjoint (no overlaps) and union = $\{0, \ldots, 11\}$. ✓

This directly connects to Module 2's congruence classes!

### Example 5: Partition into Primes and Composites

Partition $\{2, 3, \ldots, 20\}$ into primes and composites:
- Primes: $\{2, 3, 5, 7, 11, 13, 17, 19\}$
- Composites: $\{4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20\}$

Disjoint? Yes (no number is both prime and composite). Cover? Yes ($|\text{Primes}| + |\text{Composites}| = 8 + 11 = 19 = |\{2, \ldots, 20\}|$). ✓

---

## Proof Techniques Spotlight

### Counting via Bijections

To prove $|\mathcal{P}(A)| = 2^n$, we established a bijection between subsets of $A$ and $n$-bit strings. In general:

> If there is a bijection $f : X \rightarrow Y$ between finite sets, then $|X| = |Y|$.

This is a powerful counting technique that we'll use more in Module 7.

### Partition Arguments

To prove a collection $\{A_1, \ldots, A_k\}$ is a partition:
1. Show each $A_i \neq \emptyset$.
2. Show $A_i \cap A_j = \emptyset$ for $i \neq j$ (often by assuming $x \in A_i \cap A_j$ and deriving $i = j$).
3. Show $\bigcup A_i = A$.

---

## Java Deep Dive

```java
import java.util.*;
import java.util.stream.*;

public class PowerSetLibrary {

    // --- Power Set Generation ---

    /**
     * Generate the power set using bit masks.
     * Time: O(n · 2^n), Space: O(n · 2^n).
     * Each integer from 0 to 2^n - 1 represents one subset.
     */
    public static <T> Set<Set<T>> powerSetBitMask(List<T> elements) {
        int n = elements.size();
        Set<Set<T>> result = new HashSet<>();

        for (int mask = 0; mask < (1 << n); mask++) {
            Set<T> subset = new HashSet<>();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    subset.add(elements.get(i));
                }
            }
            result.add(subset);
        }
        return result;
    }

    /**
     * Generate the power set recursively.
     * Base: P({}) = {{}}
     * Step: For element a, P(A) = P(A\{a}) ∪ { S ∪ {a} | S ∈ P(A\{a}) }
     */
    public static <T> Set<Set<T>> powerSetRecursive(List<T> elements) {
        Set<Set<T>> result = new HashSet<>();
        if (elements.isEmpty()) {
            result.add(new HashSet<>());  // { {} }
            return result;
        }

        T first = elements.get(0);
        List<T> rest = elements.subList(1, elements.size());
        Set<Set<T>> subsetsOfRest = powerSetRecursive(rest);

        for (Set<T> subset : subsetsOfRest) {
            result.add(new HashSet<>(subset));          // without first
            Set<T> withFirst = new HashSet<>(subset);
            withFirst.add(first);                        // with first
            result.add(withFirst);
        }
        return result;
    }

    // --- Indexed Families ---

    /**
     * Compute the union of all sets in a family.
     * ⋃_{i ∈ I} A_i
     */
    public static <K, V> Set<V> familyUnion(Map<K, Set<V>> family) {
        Set<V> result = new HashSet<>();
        for (Set<V> set : family.values()) {
            result.addAll(set);
        }
        return result;
    }

    /**
     * Compute the intersection of all sets in a family.
     * ⋂_{i ∈ I} A_i
     */
    public static <K, V> Set<V> familyIntersection(Map<K, Set<V>> family) {
        Iterator<Set<V>> iter = family.values().iterator();
        if (!iter.hasNext()) return new HashSet<>();
        Set<V> result = new HashSet<>(iter.next());
        while (iter.hasNext()) {
            result.retainAll(iter.next());
        }
        return result;
    }

    // --- Partitions ---

    /**
     * Partition a set of integers by their remainder modulo m.
     * Returns congruence classes [0]_m, [1]_m, ..., [m-1]_m.
     * Connects to Module 2.
     */
    public static Map<Integer, Set<Integer>> partitionByMod(Set<Integer> s, int m) {
        Map<Integer, Set<Integer>> partition = new TreeMap<>();
        for (int i = 0; i < m; i++) {
            partition.put(i, new TreeSet<>());
        }
        for (int x : s) {
            int cls = Math.floorMod(x, m);
            partition.get(cls).add(x);
        }
        // Remove empty classes (they might not appear in s)
        partition.entrySet().removeIf(e -> e.getValue().isEmpty());
        return partition;
    }

    /**
     * Partition by predicate: elements satisfying p go to "true",
     * others go to "false".
     */
    public static <T> Map<Boolean, Set<T>> partitionByPredicate(
            Set<T> s, java.util.function.Predicate<T> p) {
        Map<Boolean, Set<T>> result = new HashMap<>();
        result.put(true, new HashSet<>());
        result.put(false, new HashSet<>());
        for (T x : s) {
            result.get(p.test(x)).add(x);
        }
        return result;
    }

    /**
     * Verify that a collection of sets forms a valid partition.
     */
    public static <T> boolean isPartition(Set<T> whole, Collection<Set<T>> parts) {
        // Check pairwise disjoint
        List<Set<T>> list = new ArrayList<>(parts);
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).isEmpty()) return false;
            for (int j = i + 1; j < list.size(); j++) {
                Set<T> inter = new HashSet<>(list.get(i));
                inter.retainAll(list.get(j));
                if (!inter.isEmpty()) return false;
            }
        }
        // Check cover
        Set<T> union = new HashSet<>();
        for (Set<T> part : parts) union.addAll(part);
        return union.equals(whole);
    }

    // --- Demonstration ---

    public static void main(String[] args) {
        System.out.println("=== Power Set Library ===\n");

        // Power set
        List<Integer> elems = Arrays.asList(1, 2, 3);
        Set<Set<Integer>> ps = powerSetBitMask(elems);
        System.out.println("P({1,2,3}) has " + ps.size() + " subsets:");
        for (Set<Integer> s : ps) {
            System.out.println("  " + s);
        }

        // Verify: recursive matches bit-mask
        Set<Set<Integer>> psRec = powerSetRecursive(elems);
        System.out.println("\nRecursive method matches bit-mask? " + ps.equals(psRec));

        // Indexed family
        Map<Integer, Set<Integer>> family = new TreeMap<>();
        for (int i = 1; i <= 3; i++) {
            Set<Integer> ai = new TreeSet<>();
            for (int j = i; j <= i + 2; j++) ai.add(j);
            family.put(i, ai);
        }
        System.out.println("\nIndexed family: " + family);
        System.out.println("Union: " + familyUnion(family));
        System.out.println("Intersection: " + familyIntersection(family));

        // Partition by mod
        Set<Integer> nums = IntStream.rangeClosed(0, 11).boxed()
                .collect(Collectors.toSet());
        Map<Integer, Set<Integer>> modPart = partitionByMod(nums, 3);
        System.out.println("\nPartition of {0..11} by mod 3: " + modPart);
        System.out.println("Valid partition? " +
                isPartition(nums, modPart.values()));

        // Partition: primes vs composites
        Set<Integer> range = IntStream.rangeClosed(2, 20).boxed()
                .collect(Collectors.toSet());
        Map<Boolean, Set<Integer>> primePartition = partitionByPredicate(
                range, n -> isPrime(n));
        System.out.println("\nPrimes: " + new TreeSet<>(primePartition.get(true)));
        System.out.println("Composites: " + new TreeSet<>(primePartition.get(false)));
        System.out.println("Valid partition? " +
                isPartition(range, primePartition.values()));
    }

    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++)
            if (n % i == 0) return false;
        return true;
    }
}
```

---

## Historical Context

**Cantor's Power Set Theorem** (1891) proved that for any set $A$, there is no surjection from $A$ onto $\mathcal{P}(A)$. For finite sets, this simply says $2^n > n$. For infinite sets, it implies there are different "sizes" of infinity — the power set of the natural numbers is uncountably infinite (the same size as the real numbers).

The concept of partitions links to **equivalence classes**, formalized by mathematicians in the early 20th century. In CS, the **Union-Find** data structure (Tarjan, 1975) efficiently maintains partitions with near-constant-time operations.

Power set enumeration ($2^n$ subsets) is the basis of **exponential-time algorithms** in complexity theory, including brute-force solutions to NP-complete problems like the subset sum problem.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** How many elements does $\mathcal{P}(\{1,2,3,4,5\})$ have?

**A2.** Is $\{1\} \in \mathcal{P}(\{1,2,3\})$? Is $1 \in \mathcal{P}(\{1,2,3\})$?

**A3.** Name three ways to partition $\{1,2,3,4,5,6\}$ into exactly two non-empty parts.

### Slide Set B: Proof Problems

**B1.** Prove by induction: $|\mathcal{P}(A)| = 2^{|A|}$ for finite sets.

**B2.** Prove: congruence classes modulo $m$ form a partition of $\mathbb{Z}$.

**B3.** Prove: if $\{A_1, \ldots, A_k\}$ is a partition of $A$, then $\sum_{i=1}^{k} |A_i| = |A|$.

### Slide Set C: Java Coding Problems

**C1.** Generate the power set of $\{1,2,3,4\}$ and count subsets of each size. Verify: $\sum_{k=0}^{4} \binom{4}{k} = 16$.

**C2.** Partition a list of strings by their first letter.

**C3.** Implement `isPartition` and test with valid and invalid partitions.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** List all elements of $\mathcal{P}(\{a, b, c, d\})$. How many subsets of size 2 are there?

**DM2.** Prove by induction: $|\mathcal{P}(A)| = 2^{|A|}$.

**DM3.** Prove: If $A \subseteq B$, then $\mathcal{P}(A) \subseteq \mathcal{P}(B)$.

**DM4.** Prove that the congruence classes $[0]_m, [1]_m, \ldots, [m-1]_m$ form a partition of $\mathbb{Z}$.

**DM5.** Let $f: A \rightarrow B$ be a function. Define $A_b = \{a \in A \mid f(a) = b\}$ for each $b \in B$. Prove that $\{A_b \mid b \in B, A_b \neq \emptyset\}$ is a partition of $A$. (Preview of Module 5.)

**DM6.** Prove: $\mathcal{P}(A \cap B) = \mathcal{P}(A) \cap \mathcal{P}(B)$.

**DM7.** Prove or disprove: $\mathcal{P}(A \cup B) = \mathcal{P}(A) \cup \mathcal{P}(B)$.

### Java Programming Problems

**JP1.** Implement power set generation using both bit masks and recursion. Verify both produce the same result for sets of sizes 0 through 6.

**JP2.** Write a method `List<Set<Integer>> subsetsOfSize(List<Integer> elements, int k)` that returns all $k$-element subsets. Verify that the count matches $\binom{n}{k}$.

**JP3.** Implement `Map<Integer, Set<Integer>> partitionByMod(Set<Integer> s, int m)` and verify using `isPartition`.

**JP4.** Write a **subset sum solver**: given a set $S$ of integers and a target $t$, enumerate all subsets of $S$ whose sum equals $t$. Use power set generation.

**JP5.** Implement a general `groupBy` method: `<T, K> Map<K, Set<T>> groupBy(Set<T> s, Function<T, K> classifier)` that partitions $s$ by the classifier function.

### Bridge Problems

**BR1.** Implement the subset sum solver from JP4. For a set $S$ with $|S| = n$, the solver checks $2^n$ subsets. Measure the runtime for $n = 10, 15, 20, 25$ and plot the growth. Explain why this is exponential and relate to $|\mathcal{P}(S)| = 2^n$.

**BR2.** Recall from Module 2 that congruence modulo $m$ is an equivalence relation. Implement a method that takes a set of integers and a modulus $m$, partitions the set by congruence classes, and then verifies: (a) each class is non-empty, (b) classes are pairwise disjoint, (c) their union equals the original set, (d) all elements in a class have the same remainder mod $m$.

---

## Solutions

### Discrete Math Solutions

**DM2.** See proof in Concept Overview above. $\blacksquare$

**DM3.** Assume $A \subseteq B$. Let $S \in \mathcal{P}(A)$, so $S \subseteq A$. Since $A \subseteq B$, by transitivity of $\subseteq$, $S \subseteq B$, so $S \in \mathcal{P}(B)$. $\blacksquare$

**DM4.** Let $a, b \in \mathbb{Z}$. If $a \in [i]_m \cap [j]_m$, then $a \equiv i \pmod{m}$ and $a \equiv j \pmod{m}$, so $i \equiv j \pmod{m}$. Since $0 \leq i, j < m$, this means $i = j$. So classes are pairwise disjoint. Every $a \in \mathbb{Z}$ satisfies $a \equiv r \pmod{m}$ for some $r \in \{0, \ldots, m-1\}$ (by quotient-remainder, Module 2), so $a \in [r]_m$. Thus the classes cover $\mathbb{Z}$. $\blacksquare$

**DM6.** ($\subseteq$): Let $S \in \mathcal{P}(A \cap B)$. Then $S \subseteq A \cap B$, so $S \subseteq A$ and $S \subseteq B$, giving $S \in \mathcal{P}(A)$ and $S \in \mathcal{P}(B)$, i.e., $S \in \mathcal{P}(A) \cap \mathcal{P}(B)$.

($\supseteq$): Let $S \in \mathcal{P}(A) \cap \mathcal{P}(B)$. Then $S \subseteq A$ and $S \subseteq B$, so $S \subseteq A \cap B$, giving $S \in \mathcal{P}(A \cap B)$. $\blacksquare$

**DM7.** False. Counterexample: $A = \{1\}$, $B = \{2\}$. Then $\{1, 2\} \in \mathcal{P}(A \cup B)$ but $\{1, 2\} \notin \mathcal{P}(A) = \{\emptyset, \{1\}\}$ and $\{1, 2\} \notin \mathcal{P}(B) = \{\emptyset, \{2\}\}$. So $\{1, 2\} \notin \mathcal{P}(A) \cup \mathcal{P}(B)$. $\blacksquare$

### Java Solutions

**JP2.**
```java
public static List<Set<Integer>> subsetsOfSize(List<Integer> elements, int k) {
    List<Set<Integer>> result = new ArrayList<>();
    generateSubsets(elements, k, 0, new HashSet<>(), result);
    return result;
}

private static void generateSubsets(List<Integer> elements, int k,
        int start, Set<Integer> current, List<Set<Integer>> result) {
    if (current.size() == k) {
        result.add(new HashSet<>(current));
        return;
    }
    if (start >= elements.size()) return;
    // Include elements[start]
    current.add(elements.get(start));
    generateSubsets(elements, k, start + 1, current, result);
    current.remove(elements.get(start));
    // Exclude elements[start]
    generateSubsets(elements, k, start + 1, current, result);
}
```

**JP4.**
```java
public static List<Set<Integer>> subsetSum(List<Integer> elements, int target) {
    List<Set<Integer>> solutions = new ArrayList<>();
    int n = elements.size();
    for (int mask = 0; mask < (1 << n); mask++) {
        Set<Integer> subset = new HashSet<>();
        int sum = 0;
        for (int i = 0; i < n; i++) {
            if ((mask & (1 << i)) != 0) {
                subset.add(elements.get(i));
                sum += elements.get(i);
            }
        }
        if (sum == target) solutions.add(subset);
    }
    return solutions;
}
```
