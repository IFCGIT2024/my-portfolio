# Module 4 – Class 2: Set Operations and Distributive Laws

## Learning Objectives

- Compute union, intersection, difference, complement and Cartesian product.
- Prove the distributive laws using double inclusion and element-chasing.
- Translate set operations to Java's `HashSet` methods.
- Understand how set operations underlie database queries and search.
- Verify set identities programmatically.

---

## Concept Overview

### Set Operations

| Operation | Notation | Definition |
|-----------|----------|------------|
| Union | $A \cup B$ | $\{x \mid x \in A \text{ or } x \in B\}$ |
| Intersection | $A \cap B$ | $\{x \mid x \in A \text{ and } x \in B\}$ |
| Difference | $A \setminus B$ | $\{x \mid x \in A \text{ and } x \notin B\}$ |
| Complement | $\overline{A}$ or $A^c$ | $\{x \in U \mid x \notin A\}$ (relative to universe $U$) |
| Symmetric Difference | $A \triangle B$ | $(A \setminus B) \cup (B \setminus A)$ |
| Cartesian Product | $A \times B$ | $\{(a, b) \mid a \in A \text{ and } b \in B\}$ |

### Core Identities

**Commutative laws:**
- $A \cup B = B \cup A$
- $A \cap B = B \cap A$

**Associative laws:**
- $(A \cup B) \cup C = A \cup (B \cup C)$
- $(A \cap B) \cap C = A \cap (B \cap C)$

**Distributive laws:**
- $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$
- $A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$

**De Morgan's laws for sets:**
- $\overline{A \cup B} = \overline{A} \cap \overline{B}$
- $\overline{A \cap B} = \overline{A} \cup \overline{B}$

**Absorption laws:**
- $A \cup (A \cap B) = A$
- $A \cap (A \cup B) = A$

### Cartesian Product

$A \times B = \{(a, b) \mid a \in A, b \in B\}$

$|A \times B| = |A| \cdot |B|$

In Java, the Cartesian product corresponds to **nested loops**.

**Why this matters in CS:**
- **Database joins** are Cartesian products filtered by predicates.
- **SQL** `UNION`, `INTERSECT`, `EXCEPT` map directly to $\cup$, $\cap$, $\setminus$.
- **Bitwise operations** on bit masks implement set operations on sets of flags.

---

## Formal Notation

Distributive law (first form):

$$A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$$

Proof pattern: show $\text{LHS} \subseteq \text{RHS}$ and $\text{RHS} \subseteq \text{LHS}$.

---

## Worked Examples

### Example 1: Distributive Law — Full Proof

**Claim:** $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$

**Proof.**

**($\subseteq$):** Let $x \in A \cap (B \cup C)$. Then $x \in A$ and $x \in B \cup C$.
- Case 1: $x \in B$. Then $x \in A$ and $x \in B$, so $x \in A \cap B \subseteq (A \cap B) \cup (A \cap C)$.
- Case 2: $x \in C$. Then $x \in A$ and $x \in C$, so $x \in A \cap C \subseteq (A \cap B) \cup (A \cap C)$.

**($\supseteq$):** Let $x \in (A \cap B) \cup (A \cap C)$.
- Case 1: $x \in A \cap B$. Then $x \in A$ and $x \in B \subseteq B \cup C$. So $x \in A \cap (B \cup C)$.
- Case 2: $x \in A \cap C$. Then $x \in A$ and $x \in C \subseteq B \cup C$. So $x \in A \cap (B \cup C)$.

By double inclusion, $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$. $\blacksquare$

### Example 2: De Morgan's Law for Sets

**Claim:** $\overline{A \cup B} = \overline{A} \cap \overline{B}$ (relative to universe $U$).

**Proof.**

($\subseteq$): Let $x \in \overline{A \cup B}$. Then $x \notin A \cup B$, so $x \notin A$ and $x \notin B$. Thus $x \in \overline{A}$ and $x \in \overline{B}$, giving $x \in \overline{A} \cap \overline{B}$.

($\supseteq$): Let $x \in \overline{A} \cap \overline{B}$. Then $x \notin A$ and $x \notin B$. So $x \notin A \cup B$, giving $x \in \overline{A \cup B}$. $\blacksquare$

### Example 3: Set Difference Identity

**Claim:** $A \setminus (B \cup C) = (A \setminus B) \cap (A \setminus C)$.

**Proof.**
($\subseteq$): Let $x \in A \setminus (B \cup C)$. Then $x \in A$ and $x \notin B \cup C$. So $x \notin B$ and $x \notin C$. Thus $x \in A \setminus B$ and $x \in A \setminus C$, giving $x \in (A \setminus B) \cap (A \setminus C)$.

($\supseteq$): Let $x \in (A \setminus B) \cap (A \setminus C)$. Then $x \in A$, $x \notin B$, $x \notin C$. So $x \notin B \cup C$, giving $x \in A \setminus (B \cup C)$. $\blacksquare$

### Example 4: Cartesian Product

**Problem:** Let $A = \{1, 2\}$, $B = \{a, b, c\}$. Compute $A \times B$ and $|A \times B|$.

$A \times B = \{(1,a), (1,b), (1,c), (2,a), (2,b), (2,c)\}$

$|A \times B| = 2 \cdot 3 = 6$

### Example 5: Connecting Set Operations to Logic

| Set Operation | Logical Connective | Java Operator |
|--------------|-------------------|---------------|
| $A \cup B$ | $P \vee Q$ | `a.addAll(b)` |
| $A \cap B$ | $P \wedge Q$ | `a.retainAll(b)` |
| $\overline{A}$ | $\neg P$ | `U.removeAll(a)` |
| $A \setminus B$ | $P \wedge \neg Q$ | `a.removeAll(b)` |

De Morgan's laws for sets follow from De Morgan's laws for logic (Module 3)!

---

## Proof Techniques Spotlight

### Double Inclusion with Case Analysis

Many set identity proofs require splitting into cases based on which sets an element belongs to. The pattern:

1. **Goal:** Prove $X = Y$.
2. **($\subseteq$):** Take $x \in X$. Analyze cases from the definition of $X$.
3. **($\supseteq$):** Take $x \in Y$. Analyze cases from the definition of $Y$.

**Tip:** If a definition involves "or" (union), split into cases. If it involves "and" (intersection), use both facts together.

---

## Java Deep Dive

```java
import java.util.*;
import java.util.stream.*;

public class SetOperationsLibrary {

    // --- Core Operations (non-mutating) ---

    public static <T> Set<T> union(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.addAll(b);
        return result;
    }

    public static <T> Set<T> intersection(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.retainAll(b);
        return result;
    }

    public static <T> Set<T> difference(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.removeAll(b);
        return result;
    }

    public static <T> Set<T> complement(Set<T> a, Set<T> universe) {
        return difference(universe, a);
    }

    public static <T> Set<T> symmetricDifference(Set<T> a, Set<T> b) {
        return union(difference(a, b), difference(b, a));
    }

    /**
     * Cartesian product A × B.
     * Each pair is represented as a two-element list [a, b].
     */
    public static <S, T> Set<List<Object>> cartesianProduct(Set<S> a, Set<T> b) {
        Set<List<Object>> result = new HashSet<>();
        for (S x : a) {
            for (T y : b) {
                result.add(Arrays.asList(x, y));
            }
        }
        return result;
    }

    // --- Identity Verification ---

    /**
     * Verify distributive law: A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)
     */
    public static <T> boolean verifyDistributive(Set<T> a, Set<T> b, Set<T> c) {
        Set<T> lhs = intersection(a, union(b, c));
        Set<T> rhs = union(intersection(a, b), intersection(a, c));
        return lhs.equals(rhs);
    }

    /**
     * Verify De Morgan: complement(A ∪ B) = complement(A) ∩ complement(B)
     */
    public static <T> boolean verifyDeMorgan(Set<T> a, Set<T> b, Set<T> universe) {
        Set<T> lhs = complement(union(a, b), universe);
        Set<T> rhs = intersection(complement(a, universe), complement(b, universe));
        return lhs.equals(rhs);
    }

    /**
     * Verify: A \ (B ∪ C) = (A \ B) ∩ (A \ C)
     */
    public static <T> boolean verifyDiffDistributive(Set<T> a, Set<T> b, Set<T> c) {
        Set<T> lhs = difference(a, union(b, c));
        Set<T> rhs = intersection(difference(a, b), difference(a, c));
        return lhs.equals(rhs);
    }

    /**
     * Verify inclusion-exclusion: |A ∪ B| = |A| + |B| - |A ∩ B|
     */
    public static <T> boolean verifyInclusionExclusion(Set<T> a, Set<T> b) {
        int lhs = union(a, b).size();
        int rhs = a.size() + b.size() - intersection(a, b).size();
        return lhs == rhs;
    }

    // --- Demonstration ---

    public static void main(String[] args) {
        System.out.println("=== Set Operations Library ===\n");

        Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3, 4, 5));
        Set<Integer> b = new HashSet<>(Arrays.asList(3, 4, 5, 6, 7));
        Set<Integer> c = new HashSet<>(Arrays.asList(5, 6, 7, 8, 9));
        Set<Integer> u = IntStream.rangeClosed(1, 10).boxed()
                .collect(Collectors.toSet());

        System.out.println("A = " + new TreeSet<>(a));
        System.out.println("B = " + new TreeSet<>(b));
        System.out.println("C = " + new TreeSet<>(c));
        System.out.println("U = " + new TreeSet<>(u));

        // Operations
        System.out.println("\nA ∪ B = " + new TreeSet<>(union(a, b)));
        System.out.println("A ∩ B = " + new TreeSet<>(intersection(a, b)));
        System.out.println("A \\ B = " + new TreeSet<>(difference(a, b)));
        System.out.println("A △ B = " + new TreeSet<>(symmetricDifference(a, b)));
        System.out.println("complement(A) = " + new TreeSet<>(complement(a, u)));

        // Verify identities
        System.out.println("\n--- Identity Verification ---");
        System.out.println("Distributive: " + verifyDistributive(a, b, c));
        System.out.println("De Morgan: " + verifyDeMorgan(a, b, u));
        System.out.println("Diff Distributive: " + verifyDiffDistributive(a, b, c));
        System.out.println("Inclusion-Exclusion: " + verifyInclusionExclusion(a, b));

        // Cartesian product
        Set<String> colors = new HashSet<>(Arrays.asList("R", "G", "B"));
        Set<Integer> sizes = new HashSet<>(Arrays.asList(1, 2));
        System.out.println("\nColors × Sizes = " + cartesianProduct(colors, sizes));
        System.out.println("|Colors × Sizes| = " + cartesianProduct(colors, sizes).size()
                + " (expected " + (colors.size() * sizes.size()) + ")");
    }
}
```

---

## Historical Context

**George Boole** (1815–1864) developed Boolean algebra, which treats logical operations as algebraic operations on truth values. The deep parallel between set algebra and Boolean algebra was recognized by Boole himself and later by **Augustus De Morgan**.

De Morgan's laws were originally stated for propositions (Module 3, Class 1), but they translate directly to sets:
- Logic: $\neg(P \wedge Q) \equiv \neg P \vee \neg Q$
- Sets: $\overline{A \cap B} = \overline{A} \cup \overline{B}$

This parallel is not a coincidence — both propositional logic and set algebra are instances of **Boolean algebra**, an algebraic structure with two binary operations satisfying the same axioms.

**SQL** (1970s) adopted set semantics from relational algebra, which **Edgar Codd** based directly on set theory and first-order logic.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** Let $A = \{1,2,3\}$, $B = \{2,3,4\}$, $C = \{3,4,5\}$. Compute $A \cap (B \cup C)$ and $(A \cap B) \cup (A \cap C)$. Are they equal?

**A2.** Compute $|A \times B|$ where $A = \{x, y\}$ and $B = \{1, 2, 3, 4\}$.

**A3.** If $U = \{1,\ldots,10\}$ and $A = \{2,4,6,8,10\}$, what is $\overline{A}$?

### Slide Set B: Proof Problems

**B1.** Prove: $A \cup (A \cap B) = A$ (absorption law).

**B2.** Prove: $A \triangle B = B \triangle A$ (symmetric difference is commutative).

**B3.** Prove: $A \setminus B = A \cap \overline{B}$.

### Slide Set C: Java Coding Problems

**C1.** Write a method verifying the second distributive law: $A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$.

**C2.** Generate all elements of $\{0,1\} \times \{0,1\} \times \{0,1\}$ (all 3-bit strings).

**C3.** Write a program that generates random sets $A, B, C \subseteq \{1,\ldots,20\}$ and verifies both distributive laws.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Prove the second distributive law: $A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$.

**DM2.** Prove both De Morgan's laws for sets using element-chasing.

**DM3.** Prove: $A \triangle B = (A \cup B) \setminus (A \cap B)$.

**DM4.** Prove: $|A \times B| = |A| \cdot |B|$ for finite sets.

**DM5.** Prove: $A \setminus (B \cap C) = (A \setminus B) \cup (A \setminus C)$.

**DM6.** For sets $A$, $B$, $C$, prove or disprove: $A \times (B \cup C) = (A \times B) \cup (A \times C)$.

### Java Programming Problems

**JP1.** Implement all six set operations (`union`, `intersection`, `difference`, `complement`, `symmetricDifference`, `cartesianProduct`) with non-mutating methods and test each.

**JP2.** Write a method that takes three sets and verifies all identities listed in the concept overview (commutative, associative, distributive, De Morgan, absorption).

**JP3.** Implement a `BitSetOps` class that represents sets as `BitSet` objects and implements union (OR), intersection (AND), complement (FLIP), and difference. Compare performance with `HashSet` for sets $\subseteq \{0, \ldots, 999\}$.

**JP4.** Write a method `Set<List<Integer>> cartesianPower(Set<Integer> s, int n)` that computes $S^n = S \times S \times \cdots \times S$ ($n$ times). Use it to enumerate all $n$-digit strings from a given alphabet.

**JP5.** Model a simple database query: given a `List<Map<String, Object>>` (list of records), implement `SELECT ... WHERE` as set filtering, `UNION` and `INTERSECT` using set operations.

### Bridge Problems

**BR1.** Using Module 1's divisibility and Module 4's set theory, prove: $D(\text{lcm}(a,b)) = D(a) \cup D(b)$ (where $D(n)$ is the divisor set). Verify in Java for $1 \leq a, b \leq 30$.

**BR2.** Prove that De Morgan's laws for sets are equivalent to De Morgan's laws for propositional logic (Module 3). Write a Java program that demonstrates this equivalence by evaluating both the set version and the logical version on corresponding inputs.

---

## Solutions

### Discrete Math Solutions

**DM1.** $A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$

($\subseteq$): Let $x \in A \cup (B \cap C)$.
- Case 1: $x \in A$. Then $x \in A \cup B$ and $x \in A \cup C$, so $x \in (A \cup B) \cap (A \cup C)$.
- Case 2: $x \in B \cap C$. Then $x \in B$ and $x \in C$. So $x \in A \cup B$ and $x \in A \cup C$, giving $x \in (A \cup B) \cap (A \cup C)$.

($\supseteq$): Let $x \in (A \cup B) \cap (A \cup C)$. Then $x \in A \cup B$ and $x \in A \cup C$.
- If $x \in A$: then $x \in A \cup (B \cap C)$. ✓
- If $x \notin A$: from $x \in A \cup B$, $x \in B$; from $x \in A \cup C$, $x \in C$. So $x \in B \cap C$, giving $x \in A \cup (B \cap C)$. ✓

$\blacksquare$

**DM3.** $A \triangle B = (A \cup B) \setminus (A \cap B)$

($\subseteq$): Let $x \in A \triangle B = (A \setminus B) \cup (B \setminus A)$.
- Case 1: $x \in A \setminus B$. Then $x \in A$ (so $x \in A \cup B$) and $x \notin B$. Since $x \notin B$, $x \notin A \cap B$. So $x \in (A \cup B) \setminus (A \cap B)$.
- Case 2: $x \in B \setminus A$. Symmetric argument.

($\supseteq$): Let $x \in (A \cup B) \setminus (A \cap B)$. Then $x \in A \cup B$ and $x \notin A \cap B$.
- Since $x \in A \cup B$: $x \in A$ or $x \in B$.
- Since $x \notin A \cap B$: not ($x \in A$ and $x \in B$).
- If $x \in A$: then $x \notin B$ (otherwise $x \in A \cap B$). So $x \in A \setminus B$.
- If $x \in B$: then $x \notin A$. So $x \in B \setminus A$.
Either way, $x \in A \triangle B$. $\blacksquare$

**DM6.** True. $A \times (B \cup C) = (A \times B) \cup (A \times C)$.

($\subseteq$): Let $(a, x) \in A \times (B \cup C)$. Then $a \in A$ and $x \in B \cup C$.
- If $x \in B$: $(a, x) \in A \times B \subseteq (A \times B) \cup (A \times C)$.
- If $x \in C$: $(a, x) \in A \times C \subseteq (A \times B) \cup (A \times C)$.

($\supseteq$): Let $(a, x) \in (A \times B) \cup (A \times C)$.
- If $(a, x) \in A \times B$: $a \in A$, $x \in B \subseteq B \cup C$, so $(a, x) \in A \times (B \cup C)$.
- If $(a, x) \in A \times C$: similarly. $\blacksquare$

### Java Solutions

**JP3.** (BitSet implementation)
```java
public class BitSetOps {
    private BitSet bits;
    private int universeSize;

    public BitSetOps(int universeSize) {
        this.bits = new BitSet(universeSize);
        this.universeSize = universeSize;
    }

    public BitSetOps union(BitSetOps other) {
        BitSetOps result = copy();
        result.bits.or(other.bits);
        return result;
    }

    public BitSetOps intersection(BitSetOps other) {
        BitSetOps result = copy();
        result.bits.and(other.bits);
        return result;
    }

    public BitSetOps complement() {
        BitSetOps result = copy();
        result.bits.flip(0, universeSize);
        return result;
    }

    public BitSetOps difference(BitSetOps other) {
        BitSetOps result = copy();
        result.bits.andNot(other.bits);
        return result;
    }

    private BitSetOps copy() {
        BitSetOps c = new BitSetOps(universeSize);
        c.bits = (BitSet) this.bits.clone();
        return c;
    }
}
```

**BR1.**
```java
for (int a = 1; a <= 30; a++) {
    for (int b = 1; b <= 30; b++) {
        int lcm = a * b / gcd(a, b);
        Set<Integer> dLcm = divisorSet(lcm);
        Set<Integer> dUnion = union(divisorSet(a), divisorSet(b));
        assert dLcm.equals(dUnion)
            : "Failed for a=" + a + ", b=" + b;
    }
}
```
