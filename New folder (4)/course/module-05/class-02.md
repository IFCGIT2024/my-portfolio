# Module 5 – Class 2: Relations and Properties

## Learning Objectives

- Define binary relations on a set as subsets of $A \times A$.
- Identify and prove reflexive, symmetric, transitive and antisymmetric properties.
- Distinguish equivalence relations from partial orders.
- Compute equivalence classes and verify they form partitions.
- Implement relation-checking in Java using sets of pairs and boolean predicates.

---

## Concept Overview

### Binary Relations

A **binary relation** $R$ on a set $A$ is a subset $R \subseteq A \times A$. We write $aRb$ or $(a,b) \in R$ to mean "$a$ is related to $b$."

### Properties of Relations

| Property | Definition | Example on $\mathbb{Z}$ |
|----------|-----------|------------------------|
| **Reflexive** | $\forall a \in A: aRa$ | $\leq$ (since $a \leq a$) |
| **Symmetric** | $\forall a,b: aRb \rightarrow bRa$ | $=$ (since $a = b \rightarrow b = a$) |
| **Transitive** | $\forall a,b,c: (aRb \wedge bRc) \rightarrow aRc$ | $\leq$ |
| **Antisymmetric** | $\forall a,b: (aRb \wedge bRa) \rightarrow a = b$ | $\leq$ (since $a \leq b \wedge b \leq a \implies a = b$) |
| **Irreflexive** | $\forall a \in A: \neg(aRa)$ | $<$ |

### Equivalence Relations

A relation that is **reflexive, symmetric and transitive** is an **equivalence relation**. It partitions the set into **equivalence classes**.

$$[a] = \{x \in A \mid xRa\}$$

**Key theorem:** The equivalence classes of an equivalence relation form a partition of $A$, and every partition defines an equivalence relation. (Connects to Module 4, Class 3.)

### Partial Orders

A relation that is **reflexive, antisymmetric and transitive** is a **partial order**.

Examples:
- $\leq$ on $\mathbb{Z}$
- $\subseteq$ on $\mathcal{P}(A)$ (subset ordering)
- $a \mid b$ (divisibility) on $\mathbb{Z}^+$

**Why this matters in CS:**
- **Graphs** are relations: an edge $(u,v)$ means $uRv$.
- **Equivalence relations** model "same group" — union-find, connected components.
- **Partial orders** model dependencies — topological sort, build systems, task scheduling.
- **Comparators** in Java implement total orders (a special case of partial orders).

---

## Formal Notation

| Notation | Meaning |
|----------|---------|
| $R \subseteq A \times A$ | $R$ is a relation on $A$ |
| $aRb$ | $(a,b) \in R$ |
| $[a]_R = \{x \mid xRa\}$ | Equivalence class of $a$ |
| $A / R$ | Quotient set: set of all equivalence classes |

---

## Worked Examples

### Example 1: Congruence Modulo $m$ Is an Equivalence Relation

**Relation:** $a \equiv b \pmod{m}$ on $\mathbb{Z}$.

**Proof.**
- *Reflexive:* $a - a = 0 = m \cdot 0$, so $m \mid (a - a)$. ✓
- *Symmetric:* If $m \mid (a - b)$, then $a - b = mk$, so $b - a = m(-k)$ and $m \mid (b - a)$. ✓
- *Transitive:* If $m \mid (a - b)$ and $m \mid (b - c)$, then $a - c = (a - b) + (b - c) = mk + ml = m(k+l)$, so $m \mid (a - c)$. ✓

Since all three hold, $\equiv \pmod{m}$ is an equivalence relation. Its equivalence classes are the congruence classes from Module 2. $\blacksquare$

### Example 2: Divisibility on $\mathbb{Z}^+$ Is a Partial Order

**Relation:** $a \mid b$ on $\mathbb{Z}^+$.

- *Reflexive:* $a = a \cdot 1$, so $a \mid a$. ✓
- *Antisymmetric:* If $a \mid b$ and $b \mid a$, then $b = ak$ and $a = bl$, so $a = akl$, giving $kl = 1$. Since $k, l \in \mathbb{Z}^+$, $k = l = 1$, so $a = b$. ✓
- *Transitive:* (Proved in Module 1, Class 2.) ✓

So divisibility is a partial order on $\mathbb{Z}^+$. $\blacksquare$

### Example 3: A Relation That Is NOT an Equivalence Relation

**Relation:** $R$ on $\mathbb{Z}$ defined by $aRb$ iff $|a - b| \leq 1$.

- *Reflexive:* $|a - a| = 0 \leq 1$. ✓
- *Symmetric:* $|a - b| = |b - a|$. ✓
- *Transitive:* $1R2$ and $2R3$, but $|1 - 3| = 2 > 1$, so $\neg(1R3)$. ✗

Not an equivalence relation (transitivity fails).

### Example 4: Equivalence Classes

**Relation:** Congruence mod 3 on $\{0, 1, \ldots, 8\}$.

$[0]_3 = \{0, 3, 6\}$, $[1]_3 = \{1, 4, 7\}$, $[2]_3 = \{2, 5, 8\}$.

These are pairwise disjoint and their union is $\{0, \ldots, 8\}$ — a partition! (Module 4, Class 3.)

### Example 5: Checking Properties Programmatically

Given a finite relation as a set of pairs, we can check each property by iterating:

- **Reflexive:** For every $a$ in the set, check $(a,a) \in R$.
- **Symmetric:** For every $(a,b) \in R$, check $(b,a) \in R$.
- **Transitive:** For every $(a,b) \in R$ and $(b,c) \in R$, check $(a,c) \in R$.

---

## Proof Techniques Spotlight

### Proving a Relation Has a Property

Each property requires a universal statement ("for all..."). To prove:
> "Let $a, b$ [, $c$] be arbitrary in $A$ with the given conditions. Then..."

### Disproving a Property

Find a specific counterexample:
> "Consider $a = \ldots$, $b = \ldots$. We have $aRb$ but not $bRa$. So $R$ is not symmetric."

### Proving Equivalence Classes Form a Partition

1. **Non-empty:** Each $[a]$ contains $a$ (by reflexivity).
2. **Disjoint or equal:** Prove that if $[a] \cap [b] \neq \emptyset$, then $[a] = [b]$.
3. **Cover:** Every $a \in A$ belongs to $[a]$.

---

## Java Deep Dive

```java
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class RelationLibrary {

    // --- Relation Representation ---

    /**
     * A relation on integers, represented as a set of pairs.
     */
    public static class Relation {
        private final Set<Integer> domain;
        private final Set<List<Integer>> pairs;

        public Relation(Set<Integer> domain, Set<List<Integer>> pairs) {
            this.domain = domain;
            this.pairs = pairs;
        }

        public boolean relates(int a, int b) {
            return pairs.contains(Arrays.asList(a, b));
        }

        // --- Property Checks ---

        public boolean isReflexive() {
            for (int a : domain) {
                if (!relates(a, a)) return false;
            }
            return true;
        }

        public boolean isSymmetric() {
            for (List<Integer> pair : pairs) {
                if (!relates(pair.get(1), pair.get(0))) return false;
            }
            return true;
        }

        public boolean isTransitive() {
            for (List<Integer> ab : pairs) {
                for (List<Integer> bc : pairs) {
                    if (ab.get(1).equals(bc.get(0))) {
                        if (!relates(ab.get(0), bc.get(1))) return false;
                    }
                }
            }
            return true;
        }

        public boolean isAntisymmetric() {
            for (List<Integer> pair : pairs) {
                int a = pair.get(0), b = pair.get(1);
                if (a != b && relates(b, a)) return false;
            }
            return true;
        }

        public boolean isEquivalenceRelation() {
            return isReflexive() && isSymmetric() && isTransitive();
        }

        public boolean isPartialOrder() {
            return isReflexive() && isAntisymmetric() && isTransitive();
        }

        // --- Equivalence Classes ---

        public Set<Integer> equivalenceClass(int a) {
            Set<Integer> cls = new TreeSet<>();
            for (int x : domain) {
                if (relates(x, a)) cls.add(x);
            }
            return cls;
        }

        public Set<Set<Integer>> allEquivalenceClasses() {
            Set<Set<Integer>> classes = new HashSet<>();
            for (int a : domain) {
                classes.add(equivalenceClass(a));
            }
            return classes;
        }

        // --- Transitive Closure ---

        public Relation transitiveClosure() {
            Set<List<Integer>> closed = new HashSet<>(pairs);
            boolean changed = true;
            while (changed) {
                changed = false;
                Set<List<Integer>> toAdd = new HashSet<>();
                for (List<Integer> ab : closed) {
                    for (List<Integer> bc : closed) {
                        if (ab.get(1).equals(bc.get(0))) {
                            List<Integer> ac = Arrays.asList(ab.get(0), bc.get(1));
                            if (!closed.contains(ac)) {
                                toAdd.add(ac);
                                changed = true;
                            }
                        }
                    }
                }
                closed.addAll(toAdd);
            }
            return new Relation(domain, closed);
        }
    }

    // --- Factory Methods ---

    /**
     * Build the congruence relation mod m on domain.
     */
    public static Relation congruenceRelation(Set<Integer> domain, int m) {
        Set<List<Integer>> pairs = new HashSet<>();
        for (int a : domain) {
            for (int b : domain) {
                if (Math.floorMod(a, m) == Math.floorMod(b, m)) {
                    pairs.add(Arrays.asList(a, b));
                }
            }
        }
        return new Relation(domain, pairs);
    }

    /**
     * Build the divisibility relation on domain.
     */
    public static Relation divisibilityRelation(Set<Integer> domain) {
        Set<List<Integer>> pairs = new HashSet<>();
        for (int a : domain) {
            for (int b : domain) {
                if (a != 0 && b % a == 0) {
                    pairs.add(Arrays.asList(a, b));
                }
            }
        }
        return new Relation(domain, pairs);
    }

    /**
     * Build a relation from a predicate.
     */
    public static Relation fromPredicate(Set<Integer> domain,
                                          BiPredicate<Integer, Integer> pred) {
        Set<List<Integer>> pairs = new HashSet<>();
        for (int a : domain) {
            for (int b : domain) {
                if (pred.test(a, b)) pairs.add(Arrays.asList(a, b));
            }
        }
        return new Relation(domain, pairs);
    }

    // --- Demonstration ---

    public static void main(String[] args) {
        System.out.println("=== Relation Library ===\n");

        Set<Integer> domain = IntStream.rangeClosed(0, 8).boxed()
                .collect(Collectors.toSet());

        // Congruence mod 3
        Relation congMod3 = congruenceRelation(domain, 3);
        System.out.println("Congruence mod 3:");
        System.out.println("  Reflexive: " + congMod3.isReflexive());
        System.out.println("  Symmetric: " + congMod3.isSymmetric());
        System.out.println("  Transitive: " + congMod3.isTransitive());
        System.out.println("  Equivalence relation: " + congMod3.isEquivalenceRelation());
        System.out.println("  Classes: " + congMod3.allEquivalenceClasses());

        // Divisibility on {1..12}
        Set<Integer> posDomain = IntStream.rangeClosed(1, 12).boxed()
                .collect(Collectors.toSet());
        Relation divides = divisibilityRelation(posDomain);
        System.out.println("\nDivisibility on {1..12}:");
        System.out.println("  Reflexive: " + divides.isReflexive());
        System.out.println("  Antisymmetric: " + divides.isAntisymmetric());
        System.out.println("  Transitive: " + divides.isTransitive());
        System.out.println("  Partial order: " + divides.isPartialOrder());

        // |a - b| <= 1 (not transitive)
        Relation close = fromPredicate(domain, (a, b) -> Math.abs(a - b) <= 1);
        System.out.println("\n|a-b| <= 1:");
        System.out.println("  Reflexive: " + close.isReflexive());
        System.out.println("  Symmetric: " + close.isSymmetric());
        System.out.println("  Transitive: " + close.isTransitive());
        System.out.println("  Equivalence: " + close.isEquivalenceRelation());

        // Transitive closure
        Relation closedClose = close.transitiveClosure();
        System.out.println("  After transitive closure — Equivalence: "
                + closedClose.isEquivalenceRelation());
    }
}
```

---

## Historical Context

**Giuseppe Peano** (1858–1932) and **Ernst Schröder** (1841–1902) formalized the study of relations in the late 19th century. Schröder developed an algebra of relations that predates modern relational databases.

**Equivalence relations** became central in abstract algebra through the work of **Évariste Galois** and later algebraists, who used quotient structures (groups modulo normal subgroups, rings modulo ideals) extensively.

**Edgar Codd** (1970) based the **relational database model** on mathematical relations. SQL tables are relations (sets of tuples), and queries are operations on these relations.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** For each relation on $\{1,2,3\}$, determine reflexive/symmetric/transitive: (a) $R = \{(1,1),(2,2),(3,3)\}$ (b) $R = \{(1,2),(2,1)\}$ (c) $R = \{(1,2),(2,3),(1,3)\}$

**A2.** Is $<$ on $\mathbb{Z}$ a partial order? Why or why not?

**A3.** Name two equivalence relations you use in everyday life.

### Slide Set B: Proof Problems

**B1.** Prove: "same parity" (both even or both odd) is an equivalence relation on $\mathbb{Z}$.

**B2.** Prove: if $R$ is an equivalence relation on $A$ and $[a] \cap [b] \neq \emptyset$, then $[a] = [b]$.

**B3.** Prove: $\subseteq$ is a partial order on $\mathcal{P}(S)$ for any set $S$.

### Slide Set C: Java Coding Problems

**C1.** Implement `isReflexive`, `isSymmetric`, `isTransitive` for a relation given as `Set<List<Integer>>`.

**C2.** Compute all equivalence classes of "same remainder mod 4" on $\{0, \ldots, 15\}$.

**C3.** Implement `transitiveClosure` and test on a small relation.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Determine which properties hold for each relation on $\mathbb{Z}$: (a) $aRb$ iff $a + b$ is even (b) $aRb$ iff $a \leq b + 1$ (c) $aRb$ iff $a \mid b$ (on $\mathbb{Z}^+$)

**DM2.** Prove: "has the same number of divisors" is an equivalence relation on $\mathbb{Z}^+$. What are the equivalence classes of $[1], [2], [6]$?

**DM3.** Prove that if $R$ is an equivalence relation on a finite set $A$ with $|A| = n$, and there are $k$ equivalence classes of sizes $n_1, \ldots, n_k$, then $n_1 + \cdots + n_k = n$.

**DM4.** Prove: the intersection of two equivalence relations on $A$ is an equivalence relation.

**DM5.** Let $R$ be a relation on $A$ that is symmetric and transitive. Is $R$ necessarily reflexive? Prove or give a counterexample.

**DM6.** Prove: if $(A, \preceq)$ is a partial order and $B \subseteq A$, then $(B, \preceq \cap (B \times B))$ is also a partial order.

### Java Programming Problems

**JP1.** Build the `Relation` class with `isReflexive()`, `isSymmetric()`, `isTransitive()`, `isAntisymmetric()`. Test with at least 4 different relations.

**JP2.** Implement `allEquivalenceClasses()` for an equivalence relation. Verify the classes form a partition (using Module 4's `isPartition`).

**JP3.** Implement `transitiveClosure()` using Warshall's algorithm. Compare with the iterative approach.

**JP4.** Model a small directed graph as a relation: `Set<List<String>>` of edges. Check if the "reachability" relation (transitive closure) is reflexive (every node reaches itself) and transitive (by construction).

**JP5.** Implement a `Comparator<Integer>` based on divisibility order. Use it with a list and explain why `Collections.sort` may fail (partial order, not total).

### Bridge Problems

**BR1.** From Module 1: divisibility $a \mid b$ on $\{1, \ldots, 30\}$ is a partial order. Draw the Hasse diagram (or describe it programmatically). Use a topological sort to produce a linear extension. Verify the extension is a total order.

**BR2.** From Module 2: congruence mod $m$ is an equivalence relation. From Module 4: equivalence classes partition the set. From Module 5: this is a special case of the general partition theorem. Write a Java program that demonstrates all three perspectives for $m = 5$ on $\{0, \ldots, 24\}$.

---

## Solutions

### Discrete Math Solutions

**DM1.** (a) Reflexive: $a + a = 2a$ is even. ✓ Symmetric: $a + b = b + a$. ✓ Transitive: If $a + b$ even and $b + c$ even, then $(a+b)+(b+c) = a + 2b + c$ is even, so $a + c$ is even. ✓ **Equivalence relation.**

(b) Reflexive: $a \leq a + 1$. ✓ Symmetric: $1 \leq 2 + 1 = 3$ ✓, but is $2 \leq 1 + 1 = 2$? Yes. Try $1R3$: $1 \leq 4$ ✓. $3R1$: $3 \leq 2$? No. ✗ **Not symmetric.** Not an equivalence relation.

(c) On $\mathbb{Z}^+$: Reflexive ✓, Antisymmetric ✓, Transitive ✓. **Partial order.** Not symmetric (e.g., $2 \mid 4$ but $4 \nmid 2$).

**DM2.** Let $\tau(n)$ = number of divisors. Define $aRb \iff \tau(a) = \tau(b)$.
- Reflexive: $\tau(a) = \tau(a)$. ✓
- Symmetric: $\tau(a) = \tau(b) \implies \tau(b) = \tau(a)$. ✓
- Transitive: $\tau(a) = \tau(b)$ and $\tau(b) = \tau(c)$ $\implies$ $\tau(a) = \tau(c)$. ✓

$[1] = \{1\}$ (only 1 has exactly 1 divisor). $[2] = \{p \mid p \text{ prime}\} = \{2, 3, 5, 7, 11, \ldots\}$. $[6] = \{n \mid \tau(n) = 4\} = \{6, 8, 10, 14, 15, 21, 22, \ldots\}$. $\blacksquare$

**DM5.** No! Counterexample: $A = \{1, 2\}$, $R = \emptyset$. $R$ is vacuously symmetric and transitive, but not reflexive ($(1,1) \notin R$). Another counterexample: $A = \{1,2,3\}$, $R = \{(1,2),(2,1),(1,1),(2,2)\}$. Symmetric ✓, transitive ✓, but not reflexive ($(3,3) \notin R$). $\blacksquare$
