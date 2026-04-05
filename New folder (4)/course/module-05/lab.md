# Module 5 – Lab: Functions and Relations in Java

## Overview

In this lab you will implement Java methods to work with functions (as `Map` objects) and relations (as sets of pairs). You will check injectivity, surjectivity, bijectivity, compute inverses, build and analyze relations, compute equivalence classes, and compose functions.

**Prerequisites:** Modules 4–5 (sets, functions, relations).

---

## Part 1: Function Properties

### Exercise 1.1: Injective / Surjective / Bijective

Implement the following methods:

```java
public static <A, B> boolean isInjective(Map<A, B> f) { /* TODO */ }
public static <A, B> boolean isSurjective(Map<A, B> f, Set<B> codomain) { /* TODO */ }
public static <A, B> boolean isBijective(Map<A, B> f, Set<B> codomain) { /* TODO */ }
```

**Test with:**
- $f(n) = 2n + 1$ on $\{0, \ldots, 5\} \to \mathbb{Z}$ — injective but not surjective onto $\{0, \ldots, 11\}$.
- $f(n) = n \bmod 3$ on $\{0, \ldots, 8\} \to \{0,1,2\}$ — surjective but not injective.
- Caesar cipher shift 3 on $\{0, \ldots, 25\}$ — bijective.

### Exercise 1.2: Collisions and Missing Values

```java
public static <A, B> List<A> findCollision(Map<A, B> f) { /* TODO */ }
public static <A, B> Set<B> findMissing(Map<A, B> f, Set<B> codomain) { /* TODO */ }
```

Test with `hashCode() % 7` on a list of 10 words.

### Exercise 1.3: Inverse of a Bijection

```java
public static <A, B> Map<B, A> inverse(Map<A, B> f) { /* TODO */ }
```

Verify: $f^{-1}(f(x)) = x$ for all $x$ in the domain.

---

## Part 2: Composition

### Exercise 2.1: Compose Two Maps

```java
public static <A, B, C> Map<A, C> compose(Map<A, B> f, Map<B, C> g) { /* TODO */ }
```

Test: $f(n) = n + 1$, $g(n) = 2n$. Verify $(g \circ f)(3) = g(f(3)) = g(4) = 8$.

### Exercise 2.2: Composition Preserves Injectivity

Build two injective maps. Compose them and verify the result is injective.
Build one non-injective map and one injective map. Compose and check.

---

## Part 3: Relations

### Exercise 3.1: Relation Properties

Using the `Relation` class from Class 2, or building your own:

```java
public static boolean isReflexive(Set<Integer> domain, Set<List<Integer>> pairs) { /* TODO */ }
public static boolean isSymmetric(Set<List<Integer>> pairs) { /* TODO */ }
public static boolean isTransitive(Set<List<Integer>> pairs) { /* TODO */ }
public static boolean isAntisymmetric(Set<List<Integer>> pairs) { /* TODO */ }
```

**Test on** $A = \{1,2,3,4,5\}$:
- Congruence mod 2: equivalence relation ✓
- Divisibility: partial order ✓
- $|a - b| \leq 1$: reflexive and symmetric but NOT transitive

### Exercise 3.2: Equivalence Classes

```java
public static Set<Integer> equivalenceClass(int a, Set<Integer> domain,
                                             Set<List<Integer>> pairs) { /* TODO */ }
public static Set<Set<Integer>> allEquivalenceClasses(Set<Integer> domain,
                                                       Set<List<Integer>> pairs) { /* TODO */ }
```

Verify that the equivalence classes of congruence mod 3 on $\{0, \ldots, 11\}$ form a partition (use `isPartition` from Module 4).

### Exercise 3.3: Transitive Closure

```java
public static Set<List<Integer>> transitiveClosure(Set<List<Integer>> pairs) { /* TODO */ }
```

Test: start with $R = \{(1,2), (2,3)\}$. The closure should add $(1,3)$.

---

## Part 4: Integration — Social Network

Model a small social network as a relation on a set of people (integers 0–9).

1. Generate a "friends" relation (symmetric but not necessarily transitive or reflexive).
2. Add reflexivity (everyone is their own friend) to get a reflexive, symmetric relation.
3. Compute the transitive closure to get "connected within the friend network."
4. Verify the closure is an equivalence relation.
5. Compute equivalence classes — these are the "friend groups."

---

## Extension Challenges

**E1.** Implement Warshall's algorithm for transitive closure using a boolean adjacency matrix. Compare runtime with the set-based approach.

**E2.** Build a `Map<String, String>` modeling an encoder (bijection on $\{a, \ldots, z\}$). Compute the inverse decoder. Encode and decode a message.

---

## Starter Code

```java
import java.util.*;
import java.util.stream.*;

public class Module5Lab {

    // ====== Part 1: Function Properties ======

    public static <A, B> boolean isInjective(Map<A, B> f) {
        // TODO: Return true iff no two keys share the same value
        return false;
    }

    public static <A, B> boolean isSurjective(Map<A, B> f, Set<B> codomain) {
        // TODO: Return true iff every element of codomain appears as a value
        return false;
    }

    public static <A, B> boolean isBijective(Map<A, B> f, Set<B> codomain) {
        // TODO
        return false;
    }

    public static <A, B> List<A> findCollision(Map<A, B> f) {
        // TODO: Return a list of two domain elements mapping to the same value,
        //       or null if injective
        return null;
    }

    public static <A, B> Set<B> findMissing(Map<A, B> f, Set<B> codomain) {
        // TODO: Return set of codomain elements with no preimage
        return Collections.emptySet();
    }

    public static <A, B> Map<B, A> inverse(Map<A, B> f) {
        // TODO: Return the inverse map. Throw if not injective.
        return Collections.emptyMap();
    }

    // ====== Part 2: Composition ======

    public static <A, B, C> Map<A, C> compose(Map<A, B> f, Map<B, C> g) {
        // TODO: Return g ∘ f, i.e., for each key a of f, result.put(a, g.get(f.get(a)))
        return Collections.emptyMap();
    }

    // ====== Part 3: Relations ======

    public static boolean isReflexive(Set<Integer> domain, Set<List<Integer>> pairs) {
        // TODO: Check (a, a) in pairs for every a in domain
        return false;
    }

    public static boolean isSymmetric(Set<List<Integer>> pairs) {
        // TODO: Check (b, a) in pairs for every (a, b) in pairs
        return false;
    }

    public static boolean isTransitive(Set<List<Integer>> pairs) {
        // TODO: Check (a, c) in pairs for every (a, b) and (b, c) in pairs
        return false;
    }

    public static boolean isAntisymmetric(Set<List<Integer>> pairs) {
        // TODO: Check a == b whenever (a, b) and (b, a) both in pairs
        return false;
    }

    public static boolean isEquivalenceRelation(Set<Integer> domain,
                                                 Set<List<Integer>> pairs) {
        // TODO
        return false;
    }

    public static Set<Integer> equivalenceClass(int a, Set<Integer> domain,
                                                 Set<List<Integer>> pairs) {
        // TODO: Return {x in domain | (x, a) in pairs}
        return Collections.emptySet();
    }

    public static Set<Set<Integer>> allEquivalenceClasses(Set<Integer> domain,
                                                           Set<List<Integer>> pairs) {
        // TODO: Return set of all distinct equivalence classes
        return Collections.emptySet();
    }

    public static Set<List<Integer>> transitiveClosure(Set<List<Integer>> pairs) {
        // TODO: Repeatedly add (a, c) whenever (a, b) and (b, c) exist, until stable
        return Collections.emptySet();
    }

    // ====== Part 4: Social Network ======

    public static Set<List<Integer>> socialNetworkDemo() {
        // TODO:
        // 1. Create 10 "people" (0–9)
        // 2. Add some friendship pairs (symmetric)
        // 3. Make reflexive
        // 4. Compute transitive closure
        // 5. Verify equivalence relation
        // 6. Return equivalence classes
        return Collections.emptySet();
    }

    // ====== Helpers ======

    public static Set<List<Integer>> buildRelation(Set<Integer> domain,
                                                    java.util.function.BiPredicate<Integer, Integer> pred) {
        Set<List<Integer>> pairs = new HashSet<>();
        for (int a : domain) {
            for (int b : domain) {
                if (pred.test(a, b)) pairs.add(Arrays.asList(a, b));
            }
        }
        return pairs;
    }

    // ====== Main ======

    public static void main(String[] args) {
        System.out.println("=== Module 5 Lab ===\n");

        // --- Part 1 ---
        System.out.println("--- Part 1: Function Properties ---");
        // TODO: build test maps and call isInjective, isSurjective, etc.

        // --- Part 2 ---
        System.out.println("\n--- Part 2: Composition ---");
        // TODO: compose two maps and test

        // --- Part 3 ---
        System.out.println("\n--- Part 3: Relations ---");
        // TODO: build relations and test properties

        // --- Part 4 ---
        System.out.println("\n--- Part 4: Social Network ---");
        // TODO: run socialNetworkDemo()
    }
}
```

---

## Solution Key

```java
import java.util.*;
import java.util.stream.*;

public class Module5LabSolution {

    // ====== Part 1: Function Properties ======

    public static <A, B> boolean isInjective(Map<A, B> f) {
        Set<B> seen = new HashSet<>();
        for (B val : f.values()) {
            if (!seen.add(val)) return false;
        }
        return true;
    }

    public static <A, B> boolean isSurjective(Map<A, B> f, Set<B> codomain) {
        return f.values().containsAll(codomain);
    }

    public static <A, B> boolean isBijective(Map<A, B> f, Set<B> codomain) {
        return isInjective(f) && isSurjective(f, codomain);
    }

    public static <A, B> List<A> findCollision(Map<A, B> f) {
        Map<B, A> inv = new HashMap<>();
        for (Map.Entry<A, B> entry : f.entrySet()) {
            A prev = inv.put(entry.getValue(), entry.getKey());
            if (prev != null) {
                List<A> result = new ArrayList<>();
                result.add(prev);
                result.add(entry.getKey());
                return result;
            }
        }
        return null;
    }

    public static <A, B> Set<B> findMissing(Map<A, B> f, Set<B> codomain) {
        Set<B> missing = new HashSet<>(codomain);
        missing.removeAll(new HashSet<>(f.values()));
        return missing;
    }

    public static <A, B> Map<B, A> inverse(Map<A, B> f) {
        if (!isInjective(f)) {
            throw new IllegalArgumentException("Function not injective — cannot invert");
        }
        Map<B, A> inv = new HashMap<>();
        for (Map.Entry<A, B> entry : f.entrySet()) {
            inv.put(entry.getValue(), entry.getKey());
        }
        return inv;
    }

    // ====== Part 2: Composition ======

    public static <A, B, C> Map<A, C> compose(Map<A, B> f, Map<B, C> g) {
        Map<A, C> result = new HashMap<>();
        for (Map.Entry<A, B> entry : f.entrySet()) {
            C val = g.get(entry.getValue());
            if (val != null) {
                result.put(entry.getKey(), val);
            }
        }
        return result;
    }

    // ====== Part 3: Relations ======

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
                    if (!pairs.contains(Arrays.asList(ab.get(0), bc.get(1)))) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public static boolean isAntisymmetric(Set<List<Integer>> pairs) {
        for (List<Integer> p : pairs) {
            int a = p.get(0), b = p.get(1);
            if (a != b && pairs.contains(Arrays.asList(b, a))) return false;
        }
        return true;
    }

    public static boolean isEquivalenceRelation(Set<Integer> domain,
                                                 Set<List<Integer>> pairs) {
        return isReflexive(domain, pairs) && isSymmetric(pairs) && isTransitive(pairs);
    }

    public static Set<Integer> equivalenceClass(int a, Set<Integer> domain,
                                                 Set<List<Integer>> pairs) {
        Set<Integer> cls = new TreeSet<>();
        for (int x : domain) {
            if (pairs.contains(Arrays.asList(x, a))) cls.add(x);
        }
        return cls;
    }

    public static Set<Set<Integer>> allEquivalenceClasses(Set<Integer> domain,
                                                           Set<List<Integer>> pairs) {
        Set<Set<Integer>> classes = new HashSet<>();
        for (int a : domain) {
            classes.add(equivalenceClass(a, domain, pairs));
        }
        return classes;
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

    // ====== Helpers ======

    public static Set<List<Integer>> buildRelation(Set<Integer> domain,
                                                    java.util.function.BiPredicate<Integer, Integer> pred) {
        Set<List<Integer>> pairs = new HashSet<>();
        for (int a : domain) {
            for (int b : domain) {
                if (pred.test(a, b)) pairs.add(Arrays.asList(a, b));
            }
        }
        return pairs;
    }

    // ====== Main ======

    public static void main(String[] args) {
        System.out.println("=== Module 5 Lab — Solution ===\n");

        // --- Part 1 ---
        System.out.println("--- Part 1: Function Properties ---");

        // f(n) = 2n + 1 on {0..5}
        Map<Integer, Integer> f1 = new HashMap<>();
        for (int i = 0; i <= 5; i++) f1.put(i, 2 * i + 1);
        Set<Integer> cod1 = IntStream.rangeClosed(0, 11).boxed().collect(Collectors.toSet());
        System.out.println("f(n) = 2n+1: " + f1);
        System.out.println("  Injective: " + isInjective(f1));        // true
        System.out.println("  Surjective onto {0..11}: " + isSurjective(f1, cod1)); // false
        System.out.println("  Missing: " + findMissing(f1, cod1));

        // g(n) = n % 3 on {0..8}
        Map<Integer, Integer> g1 = new HashMap<>();
        for (int i = 0; i <= 8; i++) g1.put(i, i % 3);
        Set<Integer> cod2 = Set.of(0, 1, 2);
        System.out.println("\ng(n) = n%3: " + g1);
        System.out.println("  Injective: " + isInjective(g1));        // false
        System.out.println("  Surjective onto {0,1,2}: " + isSurjective(g1, cod2)); // true
        System.out.println("  Collision: " + findCollision(g1));

        // Caesar shift 3
        Map<Integer, Integer> caesar = new HashMap<>();
        for (int i = 0; i < 26; i++) caesar.put(i, (i + 3) % 26);
        Set<Integer> alpha = IntStream.range(0, 26).boxed().collect(Collectors.toSet());
        System.out.println("\nCaesar(3): bijective = " + isBijective(caesar, alpha));
        Map<Integer, Integer> decCaesar = inverse(caesar);
        System.out.println("  Encrypt(0) = " + caesar.get(0) + ", Decrypt(3) = " + decCaesar.get(3));

        // --- Part 2 ---
        System.out.println("\n--- Part 2: Composition ---");
        Map<Integer, Integer> fComp = new HashMap<>();
        Map<Integer, Integer> gComp = new HashMap<>();
        for (int i = 0; i <= 10; i++) {
            fComp.put(i, i + 1);
            gComp.put(i, 2 * i);
        }
        gComp.put(11, 22); // to handle f's max output
        Map<Integer, Integer> gof = compose(fComp, gComp);
        System.out.println("f(n)=n+1, g(n)=2n");
        System.out.println("  (g∘f)(3) = " + gof.get(3)); // g(4) = 8
        System.out.println("  f injective: " + isInjective(fComp));
        System.out.println("  g injective: " + isInjective(gComp));
        System.out.println("  g∘f injective: " + isInjective(gof));

        // --- Part 3 ---
        System.out.println("\n--- Part 3: Relations ---");
        Set<Integer> domain = IntStream.rangeClosed(1, 5).boxed().collect(Collectors.toSet());

        // Congruence mod 2
        Set<List<Integer>> congMod2 = buildRelation(domain,
                (a, b) -> Math.floorMod(a, 2) == Math.floorMod(b, 2));
        System.out.println("Cong mod 2 — Equivalence: "
                + isEquivalenceRelation(domain, congMod2));
        System.out.println("  Classes: " + allEquivalenceClasses(domain, congMod2));

        // Divisibility on {1..5}
        Set<List<Integer>> divRel = buildRelation(domain,
                (a, b) -> a != 0 && b % a == 0);
        System.out.println("\nDivisibility — Partial order: "
                + (isReflexive(domain, divRel) && isAntisymmetric(divRel) && isTransitive(divRel)));

        // |a - b| <= 1
        Set<List<Integer>> closeRel = buildRelation(domain,
                (a, b) -> Math.abs(a - b) <= 1);
        System.out.println("\n|a-b|<=1 — Reflexive: " + isReflexive(domain, closeRel)
                + " Symmetric: " + isSymmetric(closeRel)
                + " Transitive: " + isTransitive(closeRel));

        // Transitive closure
        Set<List<Integer>> closedClose = transitiveClosure(closeRel);
        System.out.println("  After closure — Transitive: " + isTransitive(closedClose));

        // --- Part 4 ---
        System.out.println("\n--- Part 4: Social Network ---");
        Set<Integer> people = IntStream.range(0, 10).boxed().collect(Collectors.toSet());
        Set<List<Integer>> friends = new HashSet<>();

        // Add some friendships (symmetric)
        int[][] edges = {{0,1},{1,2},{3,4},{4,5},{6,7},{8,9}};
        for (int[] e : edges) {
            friends.add(Arrays.asList(e[0], e[1]));
            friends.add(Arrays.asList(e[1], e[0]));
        }
        // Add reflexivity
        for (int p : people) {
            friends.add(Arrays.asList(p, p));
        }
        System.out.println("Before closure — Equivalence: "
                + isEquivalenceRelation(people, friends));

        // Transitive closure
        Set<List<Integer>> closed = transitiveClosure(friends);
        System.out.println("After closure — Equivalence: "
                + isEquivalenceRelation(people, closed));
        System.out.println("Friend groups: " + allEquivalenceClasses(people, closed));
    }
}
```

---

## Verification Checklist

- [ ] `isInjective` correctly identifies injective/non-injective maps
- [ ] `isSurjective` checks all codomain elements
- [ ] `findCollision` returns two different domain elements or null
- [ ] `inverse` throws on non-injective input
- [ ] `compose` correctly computes $g \circ f$
- [ ] All four relation properties checked correctly
- [ ] Equivalence classes are correct and form a partition
- [ ] Transitive closure terminates and is actually transitive
- [ ] Social network demo produces sensible friend groups
