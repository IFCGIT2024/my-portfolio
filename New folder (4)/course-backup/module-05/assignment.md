# Module 5 – Assignment: Functions, Relations and Social-Network Modeling

**Integrative Assignment — Modules 4 & 5**

## Overview

This assignment synthesizes sets (Module 4) with functions and relations (Module 5). You will:
- Prove properties of functions and relations.
- Model a small social network as a relation.
- Implement surjective and injective mapping functions.
- Compute equivalence classes and verify partitions.

---

## Part A: Mathematical Proofs

**A1.** Let $f: \mathbb{Z} \to \mathbb{Z}$ be defined by $f(n) = 3n - 5$. Prove $f$ is injective. Is $f$ surjective? Prove or disprove.

**A2.** Let $R$ be a relation on $\mathbb{Z}$ defined by $aRb$ iff $3 \mid (a - b)$. Prove $R$ is an equivalence relation.

**A3.** Prove: if $f: A \to B$ is surjective and $g: B \to C$ is surjective, then $g \circ f: A \to C$ is surjective.

**A4.** Let $R_1$ and $R_2$ be equivalence relations on $A$. Prove $R_1 \cap R_2$ is an equivalence relation. Give a counterexample showing $R_1 \cup R_2$ need not be an equivalence relation.

**A5.** Prove: if $f: A \to B$ is bijective, then $f^{-1}: B \to A$ is also bijective.

---

## Part B: Java Programming

### B1: Social Network Relation (30 points)

Model a small social network of 15 people (numbered 0–14) as a relation.

```java
public class SocialNetwork {

    /**
     * Build the "friends" relation: a symmetric, reflexive relation.
     * Add at least 20 friendship edges (not counting reflexive/symmetric copies).
     * Return the set of all (a,b) pairs.
     */
    public static Set<List<Integer>> buildFriendsRelation() { /* TODO */ }

    /**
     * Check if the relation is an equivalence relation.
     */
    public static boolean isEquivalenceRelation(Set<Integer> domain,
                                                 Set<List<Integer>> pairs) { /* TODO */ }

    /**
     * Compute the transitive closure to get "connected" relation.
     */
    public static Set<List<Integer>> transitiveClosure(
            Set<List<Integer>> pairs) { /* TODO */ }

    /**
     * Compute all equivalence classes (connected components).
     */
    public static Set<Set<Integer>> connectedComponents(Set<Integer> domain,
            Set<List<Integer>> closedPairs) { /* TODO */ }

    /**
     * Verify the classes form a partition of domain
     * (Module 4: pairwise disjoint, union = domain).
     */
    public static boolean isPartition(Set<Integer> domain,
            Set<Set<Integer>> classes) { /* TODO */ }
}
```

**Requirements:**
- Create at least 3 distinct connected components.
- Print each component with its members.
- Verify the partition property.

### B2: Mapping Functions (20 points)

```java
public class MappingAnalysis {

    /**
     * Build a Map<Integer, Integer> for f(x) = (5x + 7) % 26 on {0..25}.
     * Test if injective, surjective, bijective.
     */
    public static void analyzeAffineMap() { /* TODO */ }

    /**
     * Build a Map<String, Integer> mapping student names to their
     * "name hash" (sum of character values % 10).
     * Find collisions. Compute fibers.
     */
    public static void analyzeNameHash() { /* TODO */ }

    /**
     * Build two bijective maps (e.g., two Caesar ciphers with different shifts).
     * Compose them. Verify the composition is bijective.
     * Compute the inverse of the composition and verify it equals
     * f^{-1} ∘ g^{-1} (note the order swap!).
     */
    public static void compositionInverseDemo() { /* TODO */ }
}
```

### B3: Divisor Relation Analysis (15 points)

```java
public class DivisorRelation {

    /**
     * Build the divisibility relation on {1..n}.
     * Verify it is a partial order.
     * Compute the set of minimal elements (a is minimal if no b < a with b|a).
     * Compute the set of maximal elements.
     * Connect to Module 1 (divisors) and Module 4 (sets of divisors).
     */
    public static void analyzeDivisibility(int n) { /* TODO */ }
}
```

### B4: Equivalence Relation from Function (15 points)

**Key theorem:** Every function $f: A \to B$ induces an equivalence relation $\sim_f$ on $A$ defined by $a_1 \sim_f a_2$ iff $f(a_1) = f(a_2)$. The equivalence classes are the fibers of $f$.

```java
public class FunctionEquivalence {

    /**
     * Given a Map<A, B>, build the induced equivalence relation.
     * Return the set of all (a1, a2) pairs where f(a1) = f(a2).
     */
    public static <A, B> Set<List<A>> inducedRelation(Map<A, B> f) { /* TODO */ }

    /**
     * Verify the induced relation is an equivalence relation.
     * Compute its equivalence classes.
     * Verify the classes equal the fibers of f.
     */
    public static <A, B> void verifyFiberPartition(Map<A, B> f,
            Set<A> domain) { /* TODO */ }
}
```

Test with $f(n) = n \bmod 4$ on $\{0, \ldots, 15\}$.

---

## Rubric

| Component | Points |
|-----------|--------|
| A1: Injection proof + surjectivity determination | 10 |
| A2: Equivalence relation proof (3 properties) | 10 |
| A3: Surjectivity composition proof | 8 |
| A4: Intersection proof + union counterexample | 12 |
| A5: Bijection inverse proof | 10 |
| B1: Social network (relation, closure, components, partition) | 30 |
| B2: Mapping analysis (affine, hash, composition) | 20 |
| B3: Divisibility partial order | 15 |
| B4: Function-induced equivalence relation | 15 |
| Code quality and documentation | 10 |
| **Total** | **140** |

---

## Solution Key

### Part A Solutions

**A1.** *Injective:* $3x_1 - 5 = 3x_2 - 5 \implies 3x_1 = 3x_2 \implies x_1 = x_2$. ✓

*Not surjective over $\mathbb{Z}$:* $y = 0$ requires $3n = 5$, so $n = 5/3 \notin \mathbb{Z}$. More generally, $f$ hits only integers congruent to $1 \pmod{3}$ (since $3n - 5 \equiv -5 \equiv 1 \pmod{3}$). $\blacksquare$

**A2.** $aRb \iff 3 \mid (a - b)$, i.e., $a \equiv b \pmod{3}$.
- *Reflexive:* $a - a = 0$ and $3 \mid 0$. ✓
- *Symmetric:* $3 \mid (a-b) \implies a - b = 3k \implies b - a = 3(-k) \implies 3 \mid (b-a)$. ✓
- *Transitive:* $3 \mid (a-b)$ and $3 \mid (b-c)$ $\implies$ $a - c = (a-b)+(b-c) = 3k + 3l = 3(k+l)$ $\implies$ $3 \mid (a-c)$. ✓

$R$ is an equivalence relation. $\blacksquare$

**A3.** Let $c \in C$. Since $g$ is surjective, $\exists b \in B: g(b) = c$. Since $f$ is surjective, $\exists a \in A: f(a) = b$. Then $(g \circ f)(a) = g(f(a)) = g(b) = c$. Since $c$ was arbitrary, $g \circ f$ is surjective. $\blacksquare$

**A4.** *Intersection:* Let $R = R_1 \cap R_2$.
- *Reflexive:* $aR_1a$ and $aR_2a$ (both reflexive), so $aRa$. ✓
- *Symmetric:* $aRb \implies aR_1b$ and $aR_2b \implies bR_1a$ and $bR_2a \implies bRa$. ✓
- *Transitive:* $aRb$ and $bRc$ $\implies$ $aR_1b, bR_1c$ (so $aR_1c$) and $aR_2b, bR_2c$ (so $aR_2c$) $\implies$ $aRc$. ✓

*Union counterexample:* On $\{1,2,3\}$: $R_1 = \{(1,1),(2,2),(3,3),(1,2),(2,1)\}$ (equiv classes $\{1,2\}, \{3\}$) and $R_2 = \{(1,1),(2,2),(3,3),(2,3),(3,2)\}$ (equiv classes $\{1\}, \{2,3\}$). $R_1 \cup R_2$ contains $(1,2)$ and $(2,3)$ but NOT $(1,3)$. So it is not transitive. $\blacksquare$

**A5.** Let $f: A \to B$ be bijective with inverse $f^{-1}: B \to A$.

*$f^{-1}$ is injective:* Assume $f^{-1}(b_1) = f^{-1}(b_2) = a$. Then $f(a) = b_1$ and $f(a) = b_2$, so $b_1 = b_2$. ✓

*$f^{-1}$ is surjective:* Let $a \in A$. Then $b = f(a) \in B$ and $f^{-1}(b) = a$. So $a$ has a preimage. ✓ $\blacksquare$

### Part B Solutions

**B1:**
```java
import java.util.*;
import java.util.stream.*;

public class SocialNetworkSolution {

    public static Set<List<Integer>> buildFriendsRelation() {
        Set<List<Integer>> friends = new HashSet<>();
        // 3 clusters: {0-4}, {5-9}, {10-14} with inter-cluster gaps
        int[][] edges = {
            {0,1},{0,2},{1,3},{2,4},{3,4},         // cluster A
            {5,6},{5,7},{6,8},{7,9},{8,9},         // cluster B
            {10,11},{10,12},{11,13},{12,14},{13,14}, // cluster C
            // a few more within clusters
            {0,3},{1,4},{5,8},{6,9},{10,13}
        };
        Set<Integer> people = IntStream.range(0, 15).boxed().collect(Collectors.toSet());

        // Symmetric + reflexive
        for (int p : people) friends.add(Arrays.asList(p, p));
        for (int[] e : edges) {
            friends.add(Arrays.asList(e[0], e[1]));
            friends.add(Arrays.asList(e[1], e[0]));
        }
        return friends;
    }

    public static boolean isReflexive(Set<Integer> domain, Set<List<Integer>> pairs) {
        for (int a : domain) {
            if (!pairs.contains(Arrays.asList(a, a))) return false;
        }
        return true;
    }

    public static boolean isSymmetric(Set<List<Integer>> pairs) {
        for (List<Integer> p : pairs) {
            if (!pairs.contains(Arrays.asList(p.get(1), p.get(0)))) return false;
        }
        return true;
    }

    public static boolean isTransitive(Set<List<Integer>> pairs) {
        for (List<Integer> ab : pairs) {
            for (List<Integer> bc : pairs) {
                if (ab.get(1).equals(bc.get(0))) {
                    if (!pairs.contains(Arrays.asList(ab.get(0), bc.get(1)))) return false;
                }
            }
        }
        return true;
    }

    public static boolean isEquivalenceRelation(Set<Integer> domain,
                                                 Set<List<Integer>> pairs) {
        return isReflexive(domain, pairs) && isSymmetric(pairs) && isTransitive(pairs);
    }

    public static Set<List<Integer>> transitiveClosure(Set<List<Integer>> pairs) {
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
        return closed;
    }

    public static Set<Set<Integer>> connectedComponents(Set<Integer> domain,
                                                         Set<List<Integer>> closedPairs) {
        Set<Set<Integer>> classes = new HashSet<>();
        for (int a : domain) {
            Set<Integer> cls = new TreeSet<>();
            for (int x : domain) {
                if (closedPairs.contains(Arrays.asList(x, a))) cls.add(x);
            }
            classes.add(cls);
        }
        return classes;
    }

    public static boolean isPartition(Set<Integer> domain,
                                       Set<Set<Integer>> classes) {
        // Non-empty and pairwise disjoint
        Set<Integer> union = new HashSet<>();
        for (Set<Integer> cls : classes) {
            if (cls.isEmpty()) return false;
            for (Set<Integer> other : classes) {
                if (cls != other) {
                    Set<Integer> inter = new HashSet<>(cls);
                    inter.retainAll(other);
                    if (!inter.isEmpty()) return false;
                }
            }
            union.addAll(cls);
        }
        return union.equals(domain);
    }

    public static void main(String[] args) {
        System.out.println("=== Social Network Assignment ===\n");

        Set<Integer> people = IntStream.range(0, 15).boxed().collect(Collectors.toSet());
        Set<List<Integer>> friends = buildFriendsRelation();

        System.out.println("Before closure:");
        System.out.println("  Reflexive: " + isReflexive(people, friends));
        System.out.println("  Symmetric: " + isSymmetric(friends));
        System.out.println("  Transitive: " + isTransitive(friends));

        Set<List<Integer>> closed = transitiveClosure(friends);
        System.out.println("\nAfter closure:");
        System.out.println("  Equivalence relation: " + isEquivalenceRelation(people, closed));

        Set<Set<Integer>> components = connectedComponents(people, closed);
        System.out.println("\nConnected components (" + components.size() + "):");
        for (Set<Integer> comp : components) {
            System.out.println("  " + comp);
        }
        System.out.println("Partition: " + isPartition(people, components));
    }
}
```

**B4:**
```java
import java.util.*;
import java.util.stream.*;

public class FunctionEquivalenceSolution {

    public static <A, B> Set<List<A>> inducedRelation(Map<A, B> f) {
        Set<List<A>> pairs = new HashSet<>();
        for (Map.Entry<A, B> e1 : f.entrySet()) {
            for (Map.Entry<A, B> e2 : f.entrySet()) {
                if (Objects.equals(e1.getValue(), e2.getValue())) {
                    List<A> pair = new ArrayList<>();
                    pair.add(e1.getKey());
                    pair.add(e2.getKey());
                    pairs.add(pair);
                }
            }
        }
        return pairs;
    }

    public static <A, B> Set<Set<A>> fibers(Map<A, B> f) {
        Map<B, Set<A>> fiberMap = new HashMap<>();
        for (Map.Entry<A, B> entry : f.entrySet()) {
            fiberMap.computeIfAbsent(entry.getValue(), k -> new TreeSet<>((Comparator<A>)
                    (a, b) -> a.toString().compareTo(b.toString())));
            fiberMap.get(entry.getValue()).add(entry.getKey());
        }
        return new HashSet<>(fiberMap.values());
    }

    public static void main(String[] args) {
        System.out.println("=== Function-Induced Equivalence ===\n");

        // f(n) = n mod 4 on {0..15}
        Map<Integer, Integer> f = new HashMap<>();
        Set<Integer> domain = new TreeSet<>();
        for (int i = 0; i <= 15; i++) {
            f.put(i, i % 4);
            domain.add(i);
        }

        Set<List<Integer>> rel = (Set<List<Integer>>)(Set<?>)inducedRelation(f);
        System.out.println("f(n) = n mod 4 on {0..15}");
        System.out.println("Relation size: " + rel.size() + " pairs");

        // Verify equivalence
        boolean refl = domain.stream().allMatch(a -> rel.contains(Arrays.asList(a, a)));
        boolean sym = rel.stream().allMatch(p -> rel.contains(Arrays.asList(p.get(1), p.get(0))));
        System.out.println("Reflexive: " + refl);
        System.out.println("Symmetric: " + sym);

        // Compute fibers
        Set<Set<Integer>> fiberSets = (Set<Set<Integer>>)(Set<?>)fibers(f);
        System.out.println("\nFibers (= equivalence classes):");
        for (Set<Integer> fib : fiberSets) {
            System.out.println("  " + fib);
        }
        // Expected: {0,4,8,12}, {1,5,9,13}, {2,6,10,14}, {3,7,11,15}
    }
}
```
