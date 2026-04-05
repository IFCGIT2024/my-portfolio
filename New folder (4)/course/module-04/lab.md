# Module 4 Lab: Sets, Set Operations and Data Collections

## Overview

In this lab you will implement core set operations in Java, generate power sets, create partitions, and verify set identities programmatically. The exercises connect set theory to earlier modules (divisibility, congruence) and to practical CS applications (state-space search, database-style queries).

**Estimated Time:** 90–120 minutes

---

## Part 1: Set Operations Library

Implement a library of non-mutating set operations.

### Tasks

1. Implement `<T> Set<T> union(Set<T> a, Set<T> b)` — returns $A \cup B$.
2. Implement `<T> Set<T> intersection(Set<T> a, Set<T> b)` — returns $A \cap B$.
3. Implement `<T> Set<T> difference(Set<T> a, Set<T> b)` — returns $A \setminus B$.
4. Implement `<T> Set<T> symmetricDifference(Set<T> a, Set<T> b)` — returns $A \triangle B$.
5. Implement `<T> Set<T> complement(Set<T> a, Set<T> universe)` — returns $\overline{A}$.
6. Write a test method that verifies the inclusion-exclusion principle: $|A \cup B| = |A| + |B| - |A \cap B|$ for at least 5 pairs of sets.

### Verification Checklist
- [ ] All operations return new sets (no mutation of inputs)
- [ ] Union of $\{1,2,3\}$ and $\{3,4,5\}$ = $\{1,2,3,4,5\}$
- [ ] Intersection of $\{1,2,3\}$ and $\{3,4,5\}$ = $\{3\}$
- [ ] Symmetric difference of $\{1,2,3\}$ and $\{3,4,5\}$ = $\{1,2,4,5\}$
- [ ] Inclusion-exclusion verified for all test pairs

---

## Part 2: Set Identity Verification

Verify fundamental set identities computationally.

### Tasks

1. Generate random sets $A, B, C \subseteq \{1, \ldots, 20\}$ (at least 10 trials).
2. For each trial, verify:
   - Distributive: $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$
   - Distributive: $A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$
   - De Morgan: $\overline{A \cup B} = \overline{A} \cap \overline{B}$
   - De Morgan: $\overline{A \cap B} = \overline{A} \cup \overline{B}$
   - Difference: $A \setminus (B \cup C) = (A \setminus B) \cap (A \setminus C)$
3. Print pass/fail for each identity on each trial.

### Verification Checklist
- [ ] All 5 identities hold for all 10+ trials
- [ ] Uses proper universe set for complement operations
- [ ] Random sets have varying sizes

---

## Part 3: Power Sets and Subset Enumeration

Generate power sets and apply them to a combinatorial problem.

### Tasks

1. Implement `Set<Set<Integer>> powerSet(List<Integer> elements)` using bit masks.
2. Implement `Set<Set<Integer>> powerSetRecursive(List<Integer> elements)`.
3. Verify both methods produce the same result for sets of sizes 0 through 5.
4. Verify $|\mathcal{P}(A)| = 2^{|A|}$ for each test.
5. **Subset sum:** Given a set $S$ and target $t$, find all subsets of $S$ whose elements sum to $t$.
   - Test with $S = \{1, 2, 3, 4, 5\}$, $t = 7$. Expected: $\{2,5\}$, $\{3,4\}$, $\{1,2,4\}$.

### Verification Checklist
- [ ] Both power set methods agree for sizes 0–5
- [ ] $|\mathcal{P}(A)| = 2^{|A|}$ for each size
- [ ] Subset sum finds all solutions for test case
- [ ] Empty set appears in every power set

---

## Part 4: Partitions and Applications

Create partitions and verify their properties.

### Tasks

1. Implement `Map<Integer, Set<Integer>> partitionByMod(Set<Integer> s, int m)`.
2. Implement `boolean isPartition(Set<T> whole, Collection<Set<T>> parts)` that checks:
   - Each part is non-empty
   - Parts are pairwise disjoint
   - Union of parts equals the whole set
3. Partition $\{1, \ldots, 30\}$ by mod 2 (even/odd) and mod 5 (remainder classes).
4. Partition $\{2, \ldots, 50\}$ into primes and composites.
5. Verify all partitions using `isPartition`.
6. **Connection to Module 2:** verify that elements within the same congruence class satisfy $a \equiv b \pmod{m}$ for all pairs $a, b$ in the class.

### Verification Checklist
- [ ] `partitionByMod` creates correct classes
- [ ] `isPartition` correctly validates partitions
- [ ] Even/odd partition of $\{1..30\}$ verified
- [ ] Mod 5 partition of $\{1..30\}$ verified
- [ ] Prime/composite partition verified
- [ ] Congruence within classes verified

---

## Extension Challenge

### State-Space Search with Sets

Model a simple puzzle using set operations:

**Puzzle:** You have 3 switches, each ON or OFF. The state space is $\{0,1\}^3$ (the Cartesian product, 8 states). From any state, you can toggle one switch. Starting from state $(0,0,0)$, find all states reachable in exactly $k$ steps for $k = 0, 1, 2, 3$.

1. Represent states as `Set<List<Integer>>`.
2. Implement a `neighbors` function that generates states reachable by toggling one switch.
3. Use set operations to compute reachable states level by level (BFS with sets).
4. Verify that after 3 steps, all 8 states are reachable.

---

## Starter Code

```java
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.*;

public class Module4Lab {

    // ===== Part 1: Set Operations =====

    public static <T> Set<T> union(Set<T> a, Set<T> b) {
        // TODO: Return A ∪ B without mutating inputs
        return null;
    }

    public static <T> Set<T> intersection(Set<T> a, Set<T> b) {
        // TODO: Return A ∩ B
        return null;
    }

    public static <T> Set<T> difference(Set<T> a, Set<T> b) {
        // TODO: Return A \ B
        return null;
    }

    public static <T> Set<T> symmetricDifference(Set<T> a, Set<T> b) {
        // TODO: Return A △ B
        return null;
    }

    public static <T> Set<T> complement(Set<T> a, Set<T> universe) {
        // TODO: Return complement of A relative to universe
        return null;
    }

    // ===== Part 2: Identity Verification =====

    public static <T> boolean verifyDistributive1(Set<T> a, Set<T> b, Set<T> c) {
        // TODO: Verify A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)
        return false;
    }

    // ===== Part 3: Power Sets =====

    public static Set<Set<Integer>> powerSet(List<Integer> elements) {
        // TODO: Generate power set using bit masks
        return null;
    }

    public static Set<Set<Integer>> powerSetRecursive(List<Integer> elements) {
        // TODO: Generate power set recursively
        return null;
    }

    public static List<Set<Integer>> subsetSum(List<Integer> elements, int target) {
        // TODO: Find all subsets summing to target
        return null;
    }

    // ===== Part 4: Partitions =====

    public static Map<Integer, Set<Integer>> partitionByMod(Set<Integer> s, int m) {
        // TODO: Partition s into congruence classes mod m
        return null;
    }

    public static <T> boolean isPartition(Set<T> whole, Collection<Set<T>> parts) {
        // TODO: Verify parts form a valid partition of whole
        return false;
    }

    // ===== Helpers =====

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++)
            if (n % i == 0) return false;
        return true;
    }

    // ===== Main =====

    public static void main(String[] args) {
        System.out.println("=== Module 4 Lab ===\n");

        // Part 1 tests
        System.out.println("--- Part 1: Set Operations ---");
        // TODO

        // Part 2 tests
        System.out.println("\n--- Part 2: Identity Verification ---");
        // TODO

        // Part 3 tests
        System.out.println("\n--- Part 3: Power Sets ---");
        // TODO

        // Part 4 tests
        System.out.println("\n--- Part 4: Partitions ---");
        // TODO
    }
}
```

---

## Complete Solution Key

```java
import java.util.*;
import java.util.stream.*;

public class Module4LabSolution {

    // ===== Part 1: Set Operations =====

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

    public static <T> Set<T> symmetricDifference(Set<T> a, Set<T> b) {
        return union(difference(a, b), difference(b, a));
    }

    public static <T> Set<T> complement(Set<T> a, Set<T> universe) {
        return difference(universe, a);
    }

    // ===== Part 2: Identity Verification =====

    public static <T> boolean verifyDistributive1(Set<T> a, Set<T> b, Set<T> c) {
        return intersection(a, union(b, c))
                .equals(union(intersection(a, b), intersection(a, c)));
    }

    public static <T> boolean verifyDistributive2(Set<T> a, Set<T> b, Set<T> c) {
        return union(a, intersection(b, c))
                .equals(intersection(union(a, b), union(a, c)));
    }

    public static <T> boolean verifyDeMorgan1(Set<T> a, Set<T> b, Set<T> u) {
        return complement(union(a, b), u)
                .equals(intersection(complement(a, u), complement(b, u)));
    }

    public static <T> boolean verifyDeMorgan2(Set<T> a, Set<T> b, Set<T> u) {
        return complement(intersection(a, b), u)
                .equals(union(complement(a, u), complement(b, u)));
    }

    public static <T> boolean verifyDiffDist(Set<T> a, Set<T> b, Set<T> c) {
        return difference(a, union(b, c))
                .equals(intersection(difference(a, b), difference(a, c)));
    }

    // ===== Part 3: Power Sets =====

    public static Set<Set<Integer>> powerSet(List<Integer> elements) {
        int n = elements.size();
        Set<Set<Integer>> result = new HashSet<>();
        for (int mask = 0; mask < (1 << n); mask++) {
            Set<Integer> subset = new HashSet<>();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) subset.add(elements.get(i));
            }
            result.add(subset);
        }
        return result;
    }

    public static Set<Set<Integer>> powerSetRecursive(List<Integer> elements) {
        Set<Set<Integer>> result = new HashSet<>();
        if (elements.isEmpty()) {
            result.add(new HashSet<>());
            return result;
        }
        int first = elements.get(0);
        Set<Set<Integer>> rest = powerSetRecursive(elements.subList(1, elements.size()));
        for (Set<Integer> s : rest) {
            result.add(new HashSet<>(s));
            Set<Integer> withFirst = new HashSet<>(s);
            withFirst.add(first);
            result.add(withFirst);
        }
        return result;
    }

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

    // ===== Part 4: Partitions =====

    public static Map<Integer, Set<Integer>> partitionByMod(Set<Integer> s, int m) {
        Map<Integer, Set<Integer>> result = new TreeMap<>();
        for (int i = 0; i < m; i++) result.put(i, new TreeSet<>());
        for (int x : s) result.get(Math.floorMod(x, m)).add(x);
        result.entrySet().removeIf(e -> e.getValue().isEmpty());
        return result;
    }

    public static <T> boolean isPartition(Set<T> whole, Collection<Set<T>> parts) {
        List<Set<T>> list = new ArrayList<>(parts);
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).isEmpty()) return false;
            for (int j = i + 1; j < list.size(); j++) {
                Set<T> inter = new HashSet<>(list.get(i));
                inter.retainAll(list.get(j));
                if (!inter.isEmpty()) return false;
            }
        }
        Set<T> all = new HashSet<>();
        for (Set<T> part : parts) all.addAll(part);
        return all.equals(whole);
    }

    // ===== Helpers =====

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++)
            if (n % i == 0) return false;
        return true;
    }

    static Set<Integer> randomSubset(int max, Random rng) {
        Set<Integer> s = new HashSet<>();
        for (int i = 1; i <= max; i++) {
            if (rng.nextBoolean()) s.add(i);
        }
        return s;
    }

    // ===== Main =====

    public static void main(String[] args) {
        System.out.println("=== Module 4 Lab Solution ===\n");

        // --- Part 1 ---
        System.out.println("--- Part 1: Set Operations ---");
        Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3));
        Set<Integer> b = new HashSet<>(Arrays.asList(3, 4, 5));
        System.out.println("A = " + a + ", B = " + b);
        System.out.println("Union: " + union(a, b));
        System.out.println("Intersection: " + intersection(a, b));
        System.out.println("Difference: " + difference(a, b));
        System.out.println("Symmetric Diff: " + symmetricDifference(a, b));

        // Inclusion-exclusion
        for (int trial = 0; trial < 5; trial++) {
            Set<Integer> x = randomSubset(10, new Random(trial));
            Set<Integer> y = randomSubset(10, new Random(trial + 100));
            int lhs = union(x, y).size();
            int rhs = x.size() + y.size() - intersection(x, y).size();
            System.out.println("  IE trial " + trial + ": " + (lhs == rhs));
        }

        // --- Part 2 ---
        System.out.println("\n--- Part 2: Identity Verification ---");
        Set<Integer> u = IntStream.rangeClosed(1, 20).boxed().collect(Collectors.toSet());
        Random rng = new Random(42);
        boolean allPassed = true;
        for (int trial = 0; trial < 10; trial++) {
            Set<Integer> ra = randomSubset(20, rng);
            Set<Integer> rb = randomSubset(20, rng);
            Set<Integer> rc = randomSubset(20, rng);
            boolean d1 = verifyDistributive1(ra, rb, rc);
            boolean d2 = verifyDistributive2(ra, rb, rc);
            boolean dm1 = verifyDeMorgan1(ra, rb, u);
            boolean dm2 = verifyDeMorgan2(ra, rb, u);
            boolean dd = verifyDiffDist(ra, rb, rc);
            if (!(d1 && d2 && dm1 && dm2 && dd)) allPassed = false;
            System.out.printf("  Trial %d: D1=%b D2=%b DM1=%b DM2=%b DD=%b%n",
                    trial, d1, d2, dm1, dm2, dd);
        }
        System.out.println("All identities passed: " + allPassed);

        // --- Part 3 ---
        System.out.println("\n--- Part 3: Power Sets ---");
        for (int size = 0; size <= 5; size++) {
            List<Integer> elems = IntStream.rangeClosed(1, size)
                    .boxed().collect(Collectors.toList());
            Set<Set<Integer>> ps1 = powerSet(elems);
            Set<Set<Integer>> ps2 = powerSetRecursive(elems);
            boolean match = ps1.equals(ps2);
            boolean sizeOk = ps1.size() == (1 << size);
            System.out.printf("  n=%d: |P|=%d, expected=%d, methods match=%b%n",
                    size, ps1.size(), 1 << size, match);
        }

        // Subset sum
        List<Integer> items = Arrays.asList(1, 2, 3, 4, 5);
        List<Set<Integer>> solutions = subsetSum(items, 7);
        System.out.println("Subsets of {1..5} summing to 7: " + solutions);

        // --- Part 4 ---
        System.out.println("\n--- Part 4: Partitions ---");
        Set<Integer> nums = IntStream.rangeClosed(1, 30).boxed().collect(Collectors.toSet());

        // Mod 2 (even/odd)
        Map<Integer, Set<Integer>> mod2 = partitionByMod(nums, 2);
        System.out.println("Mod 2 partition: " + mod2);
        System.out.println("Valid? " + isPartition(nums, mod2.values()));

        // Mod 5
        Map<Integer, Set<Integer>> mod5 = partitionByMod(nums, 5);
        System.out.println("Mod 5 partition: " + mod5);
        System.out.println("Valid? " + isPartition(nums, mod5.values()));

        // Primes vs composites
        Set<Integer> range = IntStream.rangeClosed(2, 50).boxed().collect(Collectors.toSet());
        Set<Integer> primes = new TreeSet<>();
        Set<Integer> composites = new TreeSet<>();
        for (int n : range) {
            if (isPrime(n)) primes.add(n); else composites.add(n);
        }
        System.out.println("Primes: " + primes);
        System.out.println("Composites: " + composites);
        System.out.println("Valid? " + isPartition(range, Arrays.asList(primes, composites)));

        // Verify congruence within classes
        boolean congOk = true;
        for (var entry : mod5.entrySet()) {
            int r = entry.getKey();
            for (int x : entry.getValue()) {
                if (Math.floorMod(x, 5) != r) { congOk = false; break; }
            }
        }
        System.out.println("Congruence within classes verified: " + congOk);

        System.out.println("\n=== All tests complete! ===");
    }
}
```

---

## Verification Checklist (Complete)

| Part | Check | Expected |
|------|-------|----------|
| 1 | Union $\{1,2,3\} \cup \{3,4,5\}$ | $\{1,2,3,4,5\}$ |
| 1 | Intersection $\{1,2,3\} \cap \{3,4,5\}$ | $\{3\}$ |
| 1 | Inclusion-exclusion | 5 trials pass |
| 2 | Both distributive laws | 10 trials pass |
| 2 | Both De Morgan's laws | 10 trials pass |
| 2 | Difference distribution | 10 trials pass |
| 3 | Power set sizes | $2^n$ for $n = 0..5$ |
| 3 | Both methods agree | true for all sizes |
| 3 | Subset sum for target 7 | 3 solutions found |
| 4 | Mod 2 partition valid | true |
| 4 | Mod 5 partition valid | true |
| 4 | Prime/composite partition valid | true |
| 4 | Congruence within classes | true |
