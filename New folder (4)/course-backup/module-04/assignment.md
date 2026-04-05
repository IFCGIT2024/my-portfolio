# Module 4 Assignment: Sets, Set Operations and Data Collections

**Integrative Assignment — Modules 3–4**

This assignment synthesizes logic and quantifiers (Module 3) with set theory (Module 4). You will implement a state-space search using set operations, prove set identities, and demonstrate that search explores each state exactly once.

**Due:** End of Module 4

---

## Part A: Mathematical Proofs

### Problem A1: Set Identity Proofs (20 points)

Prove each identity using element-chasing (double inclusion):

(a) $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$ (distributive law)

(b) $\overline{A \cap B} = \overline{A} \cup \overline{B}$ (De Morgan's law for sets)

(c) $A \setminus (B \cap C) = (A \setminus B) \cup (A \setminus C)$

### Problem A2: Power Set Properties (15 points)

(a) Prove by induction: $|\mathcal{P}(A)| = 2^{|A|}$ for finite sets.

(b) Prove: $\mathcal{P}(A \cap B) = \mathcal{P}(A) \cap \mathcal{P}(B)$.

(c) Prove or disprove: $\mathcal{P}(A \cup B) = \mathcal{P}(A) \cup \mathcal{P}(B)$.

### Problem A3: Partitions and Equivalence (15 points)

(a) Prove that the congruence classes $[0]_m, [1]_m, \ldots, [m-1]_m$ form a partition of $\mathbb{Z}$.

(b) Let $f: A \rightarrow B$ be a function. Define $A_b = \{a \in A \mid f(a) = b\}$. Prove that the collection $\{A_b \mid b \in \text{range}(f)\}$ is a partition of $A$.

(c) Explain the connection between (a) and (b): identify the function $f$ whose induced partition matches the congruence classes.

### Problem A4: Logic Meets Sets (15 points)

(a) Show that De Morgan's laws for sets follow logically from De Morgan's laws for propositional logic (Module 3). Specifically, translate the set proof into a logical argument using membership predicates.

(b) Express the distributive law $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$ as a logical tautology. Verify it using a truth table.

(c) State the negation of: "$\forall x \in A$, $x \in B \cup C$." Interpret this in terms of sets.

---

## Part B: Java Programming

### Problem B1: State-Space Search with Sets (30 points)

Implement a breadth-first state-space search using set operations.

**Problem:** Given a set of $n$ binary switches (each ON=1 or OFF=0), the state space is $\{0,1\}^n$. From state $s$, you can reach a new state by toggling exactly one switch. Starting from state $(0, 0, \ldots, 0)$, explore all reachable states.

```java
/**
 * @requires n >= 1
 * @ensures returns a map from step count k to the set of states
 *          first reachable at step k (BFS layers)
 */
public static Map<Integer, Set<List<Integer>>> bfsLayers(int n)
```

Requirements:
1. Represent states as `List<Integer>` (e.g., `[0, 1, 0]`).
2. Use set operations: the set of states at layer $k+1$ is `neighbors(layer_k) \ visited`.
3. Verify that the total number of states discovered equals $2^n$ (for small $n$: 2, 3, 4).
4. For $n = 3$, verify:
   - Layer 0: $\{(0,0,0)\}$ — 1 state
   - Layer 1: 3 states (toggle one switch)
   - Layer 2: 3 states (toggle two different switches)
   - Layer 3: 1 state $\{(1,1,1)\}$
5. **Prove (in comments):** The search visits each state exactly once. Use set difference to argue that `visited` grows monotonically and no state appears in two layers.

### Problem B2: Divisor Set Operations (20 points)

Using the divisor set from Module 1 and set operations from Module 4:

```java
public static Set<Integer> divisorSet(int n)
```

1. Implement and verify: $D(\gcd(a,b)) = D(a) \cap D(b)$ for $1 \leq a, b \leq 50$.
2. Implement and verify: $D(\text{lcm}(a,b)) = D(a) \cup D(b)$ for $1 \leq a, b \leq 50$.
3. Explain why these identities hold (connect to the definitions of GCD and LCM).
4. Use these identities to compute GCD and LCM without Euclid's algorithm (by set intersection/union of divisors and taking the max).

### Problem B3: Set-Based Predicate Evaluation (15 points)

Connect Module 3's quantifiers to Module 4's sets:

1. Implement: `<T> Set<T> filter(Set<T> s, Predicate<T> p)` = $\{x \in S \mid P(x)\}$.
2. Show that `forAll(s, p)` (Module 3) equals `filter(s, p).equals(s)`.
3. Show that `exists(s, p)` equals `!filter(s, p).isEmpty()`.
4. Use `filter` to build:
   - The set of primes in $\{1, \ldots, 100\}$
   - The set of perfect squares in $\{1, \ldots, 100\}$
   - Their intersection (primes that are perfect squares — should be empty for $n > 1$)

### Problem B4: Power Set Application — Truth Table Enumeration (15 points)

Show that truth table generation (Module 3, Class 1) is equivalent to power set generation:

1. Generate $\mathcal{P}(\{p, q, r\})$ — each subset represents the variables set to TRUE.
2. For each subset, evaluate a formula (e.g., $(p \rightarrow q) \wedge (q \rightarrow r) \rightarrow (p \rightarrow r)$).
3. Show this produces the same truth table as Module 3's `allCombinations` approach.
4. Explain the bijection: a subset $S \subseteq \{p, q, r\}$ corresponds to the row where exactly the variables in $S$ are true.

---

## Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| **A1** Set identity proofs | 20 | Correct double inclusion, all three identities |
| **A2** Power set properties | 15 | Induction, correct proof/disproof |
| **A3** Partitions | 15 | Both proofs, connection to congruence |
| **A4** Logic meets sets | 15 | Translation between logic and sets, truth table |
| **B1** State-space search | 30 | Correct BFS, layer counts, uniqueness proof |
| **B2** Divisor sets | 20 | Both identities verified, explanation |
| **B3** Predicate evaluation | 15 | filter + quantifier equivalences + examples |
| **B4** Truth table connection | 15 | Power set / truth table bijection demonstrated |
| **Total** | **145** | |

---

## Solution Key

### Solution A1

**(a)** See Module 4, Class 2, Example 1 for complete proof. $\blacksquare$

**(b)** ($\subseteq$): Let $x \in \overline{A \cap B}$. Then $x \notin A \cap B$, so $\neg(x \in A \wedge x \in B)$. By De Morgan (logic): $x \notin A$ or $x \notin B$. So $x \in \overline{A}$ or $x \in \overline{B}$, giving $x \in \overline{A} \cup \overline{B}$.

($\supseteq$): Let $x \in \overline{A} \cup \overline{B}$. Then $x \notin A$ or $x \notin B$. So $\neg(x \in A \wedge x \in B)$, i.e., $x \notin A \cap B$, giving $x \in \overline{A \cap B}$. $\blacksquare$

**(c)** ($\subseteq$): Let $x \in A \setminus (B \cap C)$. Then $x \in A$ and $x \notin B \cap C$. So $x \notin B$ or $x \notin C$.
- If $x \notin B$: $x \in A \setminus B \subseteq (A \setminus B) \cup (A \setminus C)$.
- If $x \notin C$: $x \in A \setminus C \subseteq (A \setminus B) \cup (A \setminus C)$.

($\supseteq$): Let $x \in (A \setminus B) \cup (A \setminus C)$.
- If $x \in A \setminus B$: $x \in A, x \notin B$, so $x \notin B \cap C$, giving $x \in A \setminus (B \cap C)$.
- If $x \in A \setminus C$: similarly. $\blacksquare$

### Solution A2

**(c)** False. Counterexample: $A = \{1\}, B = \{2\}$. Then $\{1,2\} \in \mathcal{P}(A \cup B)$ but $\{1,2\} \notin \mathcal{P}(A) \cup \mathcal{P}(B)$.

### Solution A3

**(c)** The function is $f: \mathbb{Z} \rightarrow \{0, 1, \ldots, m-1\}$ defined by $f(n) = n \bmod m$. The fiber $A_r = \{n \in \mathbb{Z} \mid f(n) = r\}$ is exactly the congruence class $[r]_m$. Part (b) shows this is a partition; part (a) proved the same thing directly.

### Solution A4

**(b)** The distributive law translates to: $(P_A \wedge (P_B \vee P_C)) \leftrightarrow ((P_A \wedge P_B) \vee (P_A \wedge P_C))$ where $P_X$ means "$x \in X$". Truth table:

| $P_A$ | $P_B$ | $P_C$ | LHS | RHS | LHS ↔ RHS |
|--------|--------|--------|-----|-----|-----------|
| F | F | F | F | F | T |
| F | F | T | F | F | T |
| F | T | F | F | F | T |
| F | T | T | F | F | T |
| T | F | F | F | F | T |
| T | F | T | T | T | T |
| T | T | F | T | T | T |
| T | T | T | T | T | T |

Tautology confirmed. ✓

### Solution B1

```java
public static Map<Integer, Set<List<Integer>>> bfsLayers(int n) {
    Map<Integer, Set<List<Integer>>> layers = new TreeMap<>();
    Set<List<Integer>> visited = new HashSet<>();

    // Initial state: all zeros
    List<Integer> start = new ArrayList<>(Collections.nCopies(n, 0));
    Set<List<Integer>> currentLayer = new HashSet<>();
    currentLayer.add(start);
    visited.add(new ArrayList<>(start));
    layers.put(0, currentLayer);

    int step = 0;
    while (!currentLayer.isEmpty()) {
        step++;
        Set<List<Integer>> nextLayer = new HashSet<>();
        for (List<Integer> state : currentLayer) {
            for (int i = 0; i < n; i++) {
                List<Integer> neighbor = new ArrayList<>(state);
                neighbor.set(i, 1 - neighbor.get(i));  // toggle
                if (!visited.contains(neighbor)) {
                    nextLayer.add(neighbor);
                    visited.add(neighbor);
                }
            }
        }
        if (!nextLayer.isEmpty()) {
            layers.put(step, nextLayer);
        }
        currentLayer = nextLayer;
    }

    /*
     * Correctness argument:
     * - visited is monotonically growing (we only add, never remove).
     * - A state enters nextLayer only if it's NOT in visited.
     * - Therefore no state appears in two layers.
     * - Every state in {0,1}^n is reachable (any state can be reached
     *   from (0,...,0) by toggling switches one at a time).
     * - Total states = 2^n, and we discover all of them.
     */
    return layers;
}

// Verification for n=3
Map<Integer, Set<List<Integer>>> layers = bfsLayers(3);
assert layers.get(0).size() == 1;  // (0,0,0)
assert layers.get(1).size() == 3;  // toggle 1 switch
assert layers.get(2).size() == 3;  // toggle 2 switches
assert layers.get(3).size() == 1;  // (1,1,1)
int total = layers.values().stream().mapToInt(Set::size).sum();
assert total == 8;  // 2^3
```

### Solution B2

```java
public static Set<Integer> divisorSet(int n) {
    Set<Integer> result = new TreeSet<>();
    for (int d = 1; d <= n; d++)
        if (n % d == 0) result.add(d);
    return result;
}

public static int gcd(int a, int b) {
    while (b != 0) { int r = a % b; a = b; b = r; }
    return a;
}

// Verify D(gcd(a,b)) = D(a) ∩ D(b)
for (int a = 1; a <= 50; a++) {
    for (int b = 1; b <= 50; b++) {
        int g = gcd(a, b);
        assert divisorSet(g).equals(intersection(divisorSet(a), divisorSet(b)));
    }
}

// Verify D(lcm(a,b)) = D(a) ∪ D(b)
for (int a = 1; a <= 50; a++) {
    for (int b = 1; b <= 50; b++) {
        int lcm = a / gcd(a, b) * b;
        assert divisorSet(lcm).equals(union(divisorSet(a), divisorSet(b)));
    }
}

/*
 * Why these hold:
 * gcd(a,b) is the largest d dividing both a and b.
 * D(gcd) = common divisors of a and b = D(a) ∩ D(b).
 *
 * lcm(a,b) is the smallest positive integer divisible by both a and b.
 * D(lcm) = divisors of either a or b (or both) = D(a) ∪ D(b).
 *
 * GCD/LCM via sets:
 * gcd(a,b) = max(D(a) ∩ D(b))
 * lcm(a,b) = max(D(a) ∪ D(b)) [when D(a)∪D(b) = D(lcm)]
 * More precisely: lcm = min { m > 0 | D(a) ∪ D(b) ⊆ D(m) }
 */
```

### Solution B3

```java
public static <T> Set<T> filter(Set<T> s, java.util.function.Predicate<T> p) {
    Set<T> result = new HashSet<>();
    for (T x : s) if (p.test(x)) result.add(x);
    return result;
}

// forAll(s, p) ≡ filter(s, p).equals(s)
Set<Integer> s = Set.of(2, 4, 6, 8);
Predicate<Integer> isEven = n -> n % 2 == 0;
assert filter(s, isEven).equals(s);  // all even → forAll = true

// exists(s, p) ≡ !filter(s, p).isEmpty()
Set<Integer> s2 = Set.of(1, 3, 5, 7);
assert filter(s2, isEven).isEmpty();  // no even → exists = false

// Build interesting sets
Set<Integer> universe = IntStream.rangeClosed(1, 100).boxed()
        .collect(Collectors.toSet());
Set<Integer> primes = filter(universe, n -> isPrime(n));
Set<Integer> squares = filter(universe, n -> {
    int r = (int) Math.round(Math.sqrt(n));
    return r * r == n;
});
Set<Integer> primeSquares = intersection(primes, squares);
// primeSquares should be empty (no prime > 1 is a perfect square)
System.out.println("Prime squares: " + primeSquares);
```
