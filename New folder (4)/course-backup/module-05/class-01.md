# Module 5 – Class 1: Functions and Domains

## Learning Objectives

- Define functions, domains, codomains and ranges formally.
- Distinguish between functions and non-functions (the vertical line test for mappings).
- Translate mathematical functions to Java methods and `Function<T,R>`.
- Prove that a given rule defines a function.
- Analyze Java methods as functions: identify domain, codomain and range.

---

## Concept Overview

### What Is a Function?

A **function** $f: X \rightarrow Y$ is a rule that assigns to each element $x \in X$ exactly one element $f(x) \in Y$.

| Term | Symbol | Meaning |
|------|--------|---------|
| Domain | $X$ or $\text{dom}(f)$ | Set of all inputs |
| Codomain | $Y$ | Set of all allowable outputs |
| Range (Image) | $\text{range}(f)$ or $f(X)$ | $\{f(x) \mid x \in X\}$ — actual outputs |
| Image of $x$ | $f(x)$ | The output for input $x$ |
| Preimage of $y$ | $f^{-1}(\{y\})$ | $\{x \in X \mid f(x) = y\}$ |

**Key property:** Each input maps to *exactly one* output. Two things can fail:
1. Some input has **no** output defined → not a function on that domain.
2. Some input maps to **multiple** outputs → not a function.

### Function Equality

$f = g$ if and only if $\text{dom}(f) = \text{dom}(g)$ and $\forall x \in \text{dom}(f): f(x) = g(x)$.

### Functions as Sets of Ordered Pairs

A function $f: X \rightarrow Y$ can be viewed as a set $F \subseteq X \times Y$ (connecting to Module 4) where:
- For every $x \in X$, there exists exactly one $y$ with $(x, y) \in F$.

### Composition

If $f: X \rightarrow Y$ and $g: Y \rightarrow Z$, the **composition** $g \circ f: X \rightarrow Z$ is defined by $(g \circ f)(x) = g(f(x))$.

**Why this matters in CS:**
- Java methods are functions: parameters form the domain, return type is the codomain.
- **Hash functions** map keys to buckets: `hashCode: Object → int`.
- **Functional programming** uses composition (`Function.andThen`, `Function.compose`).
- Understanding domain and range prevents bugs: calling a function outside its domain causes errors.

---

## Formal Notation

| Expression | Meaning |
|-----------|---------|
| $f: X \rightarrow Y$ | $f$ maps from $X$ to $Y$ |
| $\text{dom}(f) = X$ | Domain of $f$ |
| $\text{range}(f) = \{f(x) \mid x \in X\}$ | Range (image) of $f$ |
| $(g \circ f)(x) = g(f(x))$ | Composition |
| $f\|_A$ | Restriction of $f$ to subset $A \subseteq X$ |

---

## Worked Examples

### Example 1: Identifying Domain, Codomain and Range

**Function:** $f: \mathbb{Z} \rightarrow \mathbb{Z}$ defined by $f(n) = 3n$.

- Domain: $\mathbb{Z}$ 
- Codomain: $\mathbb{Z}$
- Range: $\{3k \mid k \in \mathbb{Z}\} = $ multiples of 3

The range is a proper subset of the codomain ($3 \nmid 1$, so $1$ is not in the range).

**Java translation:**
```java
// Domain: int (all 32-bit integers)
// Codomain: int
// Range: multiples of 3 (that fit in int)
public static int f(int n) { return 3 * n; }
```

### Example 2: Is This a Function?

**Rule:** $g: \mathbb{Z} \rightarrow \mathbb{Z}$ defined by "$g(n) = $ a number whose square is $n$."

This is **not** a function because:
- For $n = 4$: both $2$ and $-2$ satisfy $g(4)^2 = 4$. Multiple outputs.
- For $n = 3$: no integer has square 3. No output.

### Example 3: Composition

Let $f(x) = x + 2$ and $g(x) = x^2$. Then:
- $(g \circ f)(x) = g(f(x)) = g(x+2) = (x+2)^2$
- $(f \circ g)(x) = f(g(x)) = f(x^2) = x^2 + 2$

Note: $g \circ f \neq f \circ g$ in general! Composition is **not** commutative.

### Example 4: Function from Module 2 — Remainder

$r_m: \mathbb{Z} \rightarrow \{0, 1, \ldots, m-1\}$ defined by $r_m(n) = n \bmod m$.

- Domain: $\mathbb{Z}$
- Codomain: $\{0, \ldots, m-1\}$
- Range = Codomain (every remainder value is achieved) → **surjective** (Module 5, Class 3)
- Preimage: $r_m^{-1}(\{k\}) = [k]_m$ (congruence class from Module 2)

### Example 5: Hash Function as a Function

```java
// Domain: all possible String values
// Codomain: int (all 32-bit integers)
// Range: a subset of int (not every int is a hash value)
int h = "hello".hashCode();  // h = 99162322
```

The hash function maps an infinite domain to a finite codomain — by the pigeonhole principle (Module 7 preview), **collisions must occur**.

---

## Proof Techniques Spotlight

### Proving a Rule Is (or Isn't) a Function

**To prove $f: X \rightarrow Y$ is a function:**
1. Show every $x \in X$ has at least one output (well-defined).
2. Show every $x \in X$ has at most one output (single-valued).

**To disprove:** Find an $x$ with zero or multiple outputs.

### Proving Function Equality

To prove $f = g$ where $f, g: X \rightarrow Y$:
> "Let $x \in X$. Then $f(x) = \ldots = g(x)$."

---

## Java Deep Dive

```java
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class FunctionLibrary {

    // --- Representing Functions ---

    /**
     * Represent a finite function as a Map.
     * Domain = keySet, Codomain determined by context, Range = values.
     */
    public static <X, Y> boolean isFunction(Map<X, Y> mapping, Set<X> domain) {
        // Every element of domain must have exactly one image
        for (X x : domain) {
            if (!mapping.containsKey(x)) return false;
        }
        return true;  // Maps give single-valued by construction
    }

    /**
     * Compute the range (image) of a function.
     */
    public static <X, Y> Set<Y> range(Map<X, Y> f) {
        return new HashSet<>(f.values());
    }

    /**
     * Compute the preimage of a value y.
     * f^{-1}({y}) = { x ∈ dom(f) | f(x) = y }
     */
    public static <X, Y> Set<X> preimage(Map<X, Y> f, Y y) {
        Set<X> result = new HashSet<>();
        for (Map.Entry<X, Y> entry : f.entrySet()) {
            if (Objects.equals(entry.getValue(), y)) {
                result.add(entry.getKey());
            }
        }
        return result;
    }

    // --- Composition ---

    /**
     * Compose two functions: (g ∘ f)(x) = g(f(x))
     */
    public static <X, Y, Z> Function<X, Z> compose(
            Function<X, Y> f, Function<Y, Z> g) {
        return x -> g.apply(f.apply(x));
    }

    /**
     * Compose finite functions represented as Maps.
     */
    public static <X, Y, Z> Map<X, Z> composeMaps(
            Map<X, Y> f, Map<Y, Z> g) {
        Map<X, Z> result = new HashMap<>();
        for (Map.Entry<X, Y> entry : f.entrySet()) {
            Y intermediate = entry.getValue();
            if (g.containsKey(intermediate)) {
                result.put(entry.getKey(), g.get(intermediate));
            }
        }
        return result;
    }

    // --- Analysis Methods ---

    /**
     * Analyze a Java function over a domain:
     * compute its range and identify the mapping.
     */
    public static <X, Y> Map<X, Y> analyzeFunction(
            Set<X> domain, Function<X, Y> f) {
        Map<X, Y> mapping = new LinkedHashMap<>();
        for (X x : domain) {
            mapping.put(x, f.apply(x));
        }
        return mapping;
    }

    /**
     * Check if two functions agree on a domain.
     * f = g iff ∀x ∈ domain: f(x) = g(x)
     */
    public static <X, Y> boolean functionsEqual(
            Set<X> domain, Function<X, Y> f, Function<X, Y> g) {
        for (X x : domain) {
            if (!Objects.equals(f.apply(x), g.apply(x))) return false;
        }
        return true;
    }

    // --- Demonstration ---

    public static void main(String[] args) {
        System.out.println("=== Function Library ===\n");

        // f(n) = 3n
        Set<Integer> domain = IntStream.rangeClosed(-5, 5).boxed()
                .collect(Collectors.toCollection(TreeSet::new));
        Function<Integer, Integer> f = n -> 3 * n;
        Map<Integer, Integer> fMap = analyzeFunction(domain, f);
        System.out.println("f(n) = 3n on [-5,5]:");
        System.out.println("  Mapping: " + fMap);
        System.out.println("  Range: " + new TreeSet<>(range(fMap)));

        // Composition: g(x) = x + 2, h(x) = x^2
        Function<Integer, Integer> g = x -> x + 2;
        Function<Integer, Integer> h = x -> x * x;
        Function<Integer, Integer> hg = compose(g, h);  // h(g(x)) = (x+2)^2
        Function<Integer, Integer> gh = compose(h, g);  // g(h(x)) = x^2 + 2

        System.out.println("\nComposition (non-commutative):");
        System.out.println("  (h ∘ g)(3) = " + hg.apply(3) + " = (3+2)^2 = 25");
        System.out.println("  (g ∘ h)(3) = " + gh.apply(3) + " = 3^2 + 2 = 11");

        // Remainder function r_m
        int m = 5;
        Function<Integer, Integer> rem = n -> Math.floorMod(n, m);
        Map<Integer, Integer> remMap = analyzeFunction(
                IntStream.rangeClosed(0, 14).boxed().collect(Collectors.toSet()), rem);
        System.out.println("\nr_5(n) = n mod 5:");
        System.out.println("  Mapping: " + new TreeMap<>(remMap));
        System.out.println("  Range: " + new TreeSet<>(range(remMap)));

        // Preimage: which inputs map to 2 under r_5?
        Map<Integer, Integer> extendedRem = analyzeFunction(
                IntStream.rangeClosed(0, 20).boxed().collect(Collectors.toSet()), rem);
        System.out.println("  Preimage of 2: " + new TreeSet<>(preimage(extendedRem, 2)));

        // Function equality
        Function<Integer, Integer> f1 = x -> x * x - 1;
        Function<Integer, Integer> f2 = x -> (x - 1) * (x + 1);
        boolean eq = functionsEqual(domain, f1, f2);
        System.out.println("\nx²-1 = (x-1)(x+1)? " + eq);
    }
}
```

---

## Historical Context

The modern concept of a function evolved over centuries:
- **Euler** (1748) defined a function as an "analytic expression."
- **Dirichlet** (1837) generalized to any rule assigning outputs to inputs.
- **Set-theoretic definition** (20th century): a function is a set of ordered pairs with unique first components.

In computer science, **Alonzo Church**'s lambda calculus (1930s) formalized computation as function application. This directly influenced functional programming languages (Lisp, Haskell, and Java 8+'s lambda expressions).

Java's `Function<T, R>` interface (Java 8) made functions first-class citizens, enabling `map`, `filter`, `compose` — all grounded in the mathematical concept.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** For $f: \mathbb{Z} \rightarrow \mathbb{Z}$ with $f(n) = n^2$, what is the range?

**A2.** Is the rule "$g(x) = \pm\sqrt{x}$" a function from $\mathbb{R}^+ \rightarrow \mathbb{R}$? Why or why not?

**A3.** Given $f(x) = 2x+1$ and $g(x) = x-3$, compute $(g \circ f)(4)$ and $(f \circ g)(4)$.

### Slide Set B: Proof Problems

**B1.** Prove that $f(n) = 2n + 1$ is a well-defined function from $\mathbb{Z}$ to $\mathbb{Z}$.

**B2.** Prove: if $f: X \rightarrow Y$ and $g: Y \rightarrow Z$, then composition is associative: $h \circ (g \circ f) = (h \circ g) \circ f$.

**B3.** Prove the range of $f(n) = n \bmod m$ is exactly $\{0, 1, \ldots, m-1\}$.

### Slide Set C: Java Coding Problems

**C1.** Write a method that takes a `Function<Integer, Integer>` and a domain, and returns the range as a `Set<Integer>`.

**C2.** Implement function composition for `Map`-based finite functions.

**C3.** Write a method to compute the preimage of a given output value.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** For each rule, determine whether it defines a function from $\mathbb{Z}$ to $\mathbb{Z}$:
(a) $f(n) = n + 3$ (b) $g(n) = n/2$ (c) $h(n) = |n|$ (d) $k(n) = $ "the smallest prime greater than $n$"

**DM2.** Prove: if $f: X \rightarrow Y$ is a function, then for all $A \subseteq X$: $f(A) \subseteq Y$ (the image of a subset of the domain is a subset of the codomain).

**DM3.** Let $f: \mathbb{Z} \rightarrow \mathbb{Z}$ with $f(n) = n^2 + 1$. Compute $f(\{-2, -1, 0, 1, 2\})$ and $f^{-1}(\{2\})$.

**DM4.** Prove: composition of functions is associative.

**DM5.** Prove or disprove: the range of $f \circ g$ is a subset of the range of $f$.

**DM6.** Let $f(n) = n \bmod 5$ (from Module 2). Show that the fibers of $f$ (sets $f^{-1}(\{k\})$ for $k = 0,\ldots,4$) form a partition of $\mathbb{Z}$. (Connects to Module 4, Class 3.)

### Java Programming Problems

**JP1.** Represent a function as a `Map<Integer, Integer>`. Write methods: `isFunction(Map, Set domain)`, `getRange(Map)`, `getPreimage(Map, value)`.

**JP2.** Implement a method that takes two `Function<Integer, Integer>` objects and composes them. Test by composing $f(x) = x + 1$ and $g(x) = x * 2$ in both orders.

**JP3.** Write a method that, given a `List<Function<Integer, Integer>>`, composes them left-to-right ($f_1 \circ f_2 \circ \cdots \circ f_n$).

**JP4.** Analyze Java's `String.hashCode()` as a function: for all 2-character strings from 'a' to 'z', compute the hash and identify collisions (different inputs, same output).

**JP5.** Write a method that determines whether a given `Map<Integer, Integer>` is a well-defined function on a given domain and codomain (every domain element maps to an element in the codomain).

### Bridge Problems

**BR1.** The divisor-count function $\tau(n) = |D(n)|$ maps $\mathbb{Z}^+$ to $\mathbb{Z}^+$. Compute $\tau(n)$ for $n = 1, \ldots, 30$. What is the range of $\tau$ restricted to $\{1, \ldots, 30\}$? Which values have the largest preimage?

**BR2.** Recall from Module 2 that $r_m(n) = n \bmod m$ maps $\mathbb{Z}$ to $\{0, \ldots, m-1\}$. Prove that the fibers of $r_m$ are exactly the congruence classes. Implement in Java: compute fibers for $m = 7$ over $\{0, \ldots, 50\}$ and verify they match `partitionByMod` from Module 4.

---

## Solutions

### Discrete Math Solutions

**DM1.** (a) Yes — well-defined, single-valued. (b) No — $g(3) = 3/2 \notin \mathbb{Z}$. Not well-defined on $\mathbb{Z}$. (c) Yes — well-defined, single-valued. (d) Yes — by Bertrand's postulate, there exists a prime between $n$ and $2n$; the smallest such prime is unique.

**DM2.** Let $y \in f(A)$. Then $y = f(a)$ for some $a \in A \subseteq X$. Since $f: X \rightarrow Y$, $f(a) \in Y$. So $y \in Y$. $\blacksquare$

**DM3.** $f(\{-2,-1,0,1,2\}) = \{5, 2, 1, 2, 5\} = \{1, 2, 5\}$. $f^{-1}(\{2\}) = \{-1, 1\}$ (since $(-1)^2 + 1 = 2$ and $1^2 + 1 = 2$).

**DM5.** True. Let $y \in \text{range}(f \circ g)$. Then $y = f(g(x))$ for some $x$. Let $z = g(x)$. Then $y = f(z)$, so $y \in \text{range}(f)$. $\blacksquare$

**DM6.** $f^{-1}(\{k\}) = \{n \in \mathbb{Z} \mid n \bmod 5 = k\} = [k]_5$. By Module 4, Class 3 (Problem A3 of the assignment), the fibers of any function partition the domain. Since every $n \in \mathbb{Z}$ has $n \bmod 5 \in \{0,\ldots,4\}$, the five fibers are non-empty, pairwise disjoint, and cover $\mathbb{Z}$. $\blacksquare$

### Java Solutions

**JP4.**
```java
Set<Integer> hashes = new HashSet<>();
Map<Integer, List<String>> hashToStrings = new HashMap<>();
for (char c1 = 'a'; c1 <= 'z'; c1++) {
    for (char c2 = 'a'; c2 <= 'z'; c2++) {
        String s = "" + c1 + c2;
        int h = s.hashCode();
        hashToStrings.computeIfAbsent(h, k -> new ArrayList<>()).add(s);
        hashes.add(h);
    }
}
System.out.println("Total 2-char strings: " + (26 * 26));
System.out.println("Distinct hash values: " + hashes.size());
// Find collisions
hashToStrings.entrySet().stream()
    .filter(e -> e.getValue().size() > 1)
    .forEach(e -> System.out.println("Collision: hash=" + e.getKey()
            + " strings=" + e.getValue()));
```

**BR1.**
```java
Map<Integer, Integer> tau = new TreeMap<>();
for (int n = 1; n <= 30; n++) {
    int count = 0;
    for (int d = 1; d <= n; d++) if (n % d == 0) count++;
    tau.put(n, count);
}
System.out.println("τ(n) for n=1..30: " + tau);
Set<Integer> tauRange = new TreeSet<>(tau.values());
System.out.println("Range of τ: " + tauRange);

// Preimage analysis
Map<Integer, List<Integer>> preimages = new TreeMap<>();
for (var e : tau.entrySet()) {
    preimages.computeIfAbsent(e.getValue(), k -> new ArrayList<>())
            .add(e.getKey());
}
preimages.forEach((k, v) ->
    System.out.println("  τ^{-1}({" + k + "}) = " + v));
```
