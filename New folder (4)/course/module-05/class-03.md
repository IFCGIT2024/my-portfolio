# Module 5 – Class 3: Injective, Surjective and Bijective Functions

## Learning Objectives

- Define injective (one-to-one), surjective (onto) and bijective functions.
- Prove a function is injective by assuming $f(x_1) = f(x_2)$ and showing $x_1 = x_2$.
- Prove a function is surjective by constructing a preimage for each element in the codomain.
- Understand how bijectivity connects to invertibility.
- Prove that composition preserves injectivity and surjectivity.
- Implement injectivity/surjectivity checks in Java using `Map` representations.

---

## Concept Overview

### Injective (One-to-One)

A function $f: A \to B$ is **injective** if:

$$\forall x_1, x_2 \in A: f(x_1) = f(x_2) \implies x_1 = x_2$$

Equivalently (contrapositive): $x_1 \neq x_2 \implies f(x_1) \neq f(x_2)$.

**Intuition:** Every output comes from at most one input. No two different inputs share the same output.

### Surjective (Onto)

A function $f: A \to B$ is **surjective** if:

$$\forall b \in B, \exists a \in A: f(a) = b$$

**Intuition:** Every element in the codomain $B$ is actually "hit." The range equals the codomain.

### Bijective (One-to-One Correspondence)

A function is **bijective** if it is both injective and surjective.

$$\text{Bijective} = \text{Injective} + \text{Surjective}$$

**Key theorem:** $f: A \to B$ is bijective if and only if $f$ has an inverse function $f^{-1}: B \to A$.

### Counting Implications

For finite sets $|A| = m$, $|B| = n$:
- If $f: A \to B$ is injective, then $m \leq n$.
- If $f: A \to B$ is surjective, then $m \geq n$.
- If $f: A \to B$ is bijective, then $m = n$.

This foreshadows the counting arguments of Module 7.

### CS Connections

| Concept | CS Application |
|---------|---------------|
| Injective | Hash functions with no collisions; unique ID generators |
| Surjective | Covering all enum values; complete switch statements |
| Bijective | Encryption/decryption; lossless compression; array index mappings |
| Inverse | Decode is the inverse of encode; deserialize inverts serialize |

---

## Formal Notation

| Notation | Meaning |
|----------|---------|
| $f: A \hookrightarrow B$ | $f$ is injective |
| $f: A \twoheadrightarrow B$ | $f$ is surjective |
| $f: A \xrightarrow{\sim} B$ | $f$ is bijective |
| $f^{-1}: B \to A$ | Inverse (exists iff $f$ is bijective) |
| $|f^{-1}(\{b\})|$ | Size of the preimage (fiber) of $b$ |

---

## Worked Examples

### Example 1: Proving Injectivity

**Claim:** $f: \mathbb{Z} \to \mathbb{Z}$ defined by $f(n) = 2n + 3$ is injective.

**Proof.** Assume $f(x_1) = f(x_2)$:
$$2x_1 + 3 = 2x_2 + 3$$
$$2x_1 = 2x_2$$
$$x_1 = x_2$$

So $f$ is injective. $\blacksquare$

### Example 2: Proving Surjectivity

**Claim:** $f: \mathbb{R} \to \mathbb{R}$ defined by $f(x) = 2x + 3$ is surjective.

**Proof.** Let $y \in \mathbb{R}$. We need $x$ such that $f(x) = y$:
$$2x + 3 = y \implies x = \frac{y - 3}{2}$$

Check: $f\!\left(\frac{y-3}{2}\right) = 2 \cdot \frac{y-3}{2} + 3 = y$. ✓

Since $\frac{y-3}{2} \in \mathbb{R}$, every $y$ has a preimage. $\blacksquare$

**Note:** Over $\mathbb{Z}$, $f(n) = 2n + 3$ is NOT surjective (e.g., $y = 4$ has no integer preimage: $n = 1/2$).

### Example 3: A Function That Is Neither

$f: \mathbb{Z} \to \mathbb{Z}$ defined by $f(n) = n^2$.
- Not injective: $f(2) = f(-2) = 4$ but $2 \neq -2$.
- Not surjective: no $n$ gives $f(n) = -1$.

### Example 4: Composition Preserves Injectivity

**Theorem:** If $f: A \to B$ and $g: B \to C$ are both injective, then $g \circ f: A \to C$ is injective.

**Proof.** Assume $(g \circ f)(x_1) = (g \circ f)(x_2)$, i.e., $g(f(x_1)) = g(f(x_2))$.

Since $g$ is injective: $f(x_1) = f(x_2)$.

Since $f$ is injective: $x_1 = x_2$. $\blacksquare$

### Example 5: Bijectivity and Inverses

$f: \{0, 1, \ldots, 25\} \to \{0, 1, \ldots, 25\}$ defined by $f(x) = (x + 3) \bmod 26$ (Caesar cipher with shift 3).

- *Injective:* $f(x_1) = f(x_2) \implies x_1 + 3 \equiv x_2 + 3 \pmod{26} \implies x_1 \equiv x_2 \pmod{26}$. Since $0 \leq x_1, x_2 \leq 25$, $x_1 = x_2$. ✓
- *Surjective:* For any $y$, take $x = (y - 3) \bmod 26$. Then $f(x) = y$. ✓

So $f$ is bijective with inverse $f^{-1}(y) = (y - 3) \bmod 26$. This connects to Module 2's modular arithmetic.

---

## Proof Techniques Spotlight

### The Injection Proof Template

1. Assume $f(x_1) = f(x_2)$.
2. Use the definition of $f$ and algebraic manipulation.
3. Conclude $x_1 = x_2$.

### The Surjection Proof Template

1. Let $y$ be an arbitrary element of the codomain.
2. Construct a candidate $x$ (often by "solving" $f(x) = y$).
3. Verify $f(x) = y$.
4. Verify $x$ is in the domain.

### Disproof by Counterexample

- **Not injective:** Find $x_1 \neq x_2$ with $f(x_1) = f(x_2)$.
- **Not surjective:** Find $y$ in the codomain with no preimage.

### Composition Proofs

For composition, chain the property through: use injectivity/surjectivity of the inner function, then the outer function.

---

## Java Deep Dive

```java
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class InjectSurjectLibrary {

    // --- Injectivity / Surjectivity Checks ---

    /**
     * Check if a function (Map) is injective.
     * f is injective iff all values are distinct.
     */
    public static <A, B> boolean isInjective(Map<A, B> f) {
        Set<B> seen = new HashSet<>();
        for (B val : f.values()) {
            if (!seen.add(val)) return false; // duplicate value
        }
        return true;
    }

    /**
     * Check if a function (Map) is surjective with respect to a codomain.
     * f is surjective iff every element of codomain appears as a value.
     */
    public static <A, B> boolean isSurjective(Map<A, B> f, Set<B> codomain) {
        return f.values().containsAll(codomain);
    }

    /**
     * Check if a function (Map) is bijective.
     */
    public static <A, B> boolean isBijective(Map<A, B> f, Set<B> codomain) {
        return isInjective(f) && isSurjective(f, codomain);
    }

    /**
     * Find a collision (two domain elements mapping to same value).
     * Returns null if function is injective.
     */
    public static <A, B> List<A> findCollision(Map<A, B> f) {
        Map<B, A> inverse = new HashMap<>();
        for (Map.Entry<A, B> entry : f.entrySet()) {
            A prev = inverse.put(entry.getValue(), entry.getKey());
            if (prev != null) {
                // Use ArrayList to ensure a mutable, safe list
                List<A> collision = new ArrayList<>();
                collision.add(prev);
                collision.add(entry.getKey());
                return collision;
            }
        }
        return null;
    }

    /**
     * Find elements in codomain with no preimage.
     */
    public static <A, B> Set<B> findMissing(Map<A, B> f, Set<B> codomain) {
        Set<B> range = new HashSet<>(f.values());
        Set<B> missing = new HashSet<>(codomain);
        missing.removeAll(range);
        return missing;
    }

    // --- Inverse ---

    /**
     * Compute the inverse of a bijective function.
     * Throws if not bijective.
     */
    public static <A, B> Map<B, A> inverse(Map<A, B> f, Set<B> codomain) {
        if (!isBijective(f, codomain)) {
            throw new IllegalArgumentException("Function is not bijective");
        }
        Map<B, A> inv = new HashMap<>();
        for (Map.Entry<A, B> entry : f.entrySet()) {
            inv.put(entry.getValue(), entry.getKey());
        }
        return inv;
    }

    // --- Composition with Property Preservation ---

    /**
     * Compose two maps: (g ∘ f)(x) = g(f(x)).
     */
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

    // --- Fiber / Preimage ---

    /**
     * Compute the preimage (fiber) of a value b.
     */
    public static <A, B> Set<A> fiber(Map<A, B> f, B b) {
        Set<A> result = new HashSet<>();
        for (Map.Entry<A, B> entry : f.entrySet()) {
            if (Objects.equals(entry.getValue(), b)) {
                result.add(entry.getKey());
            }
        }
        return result;
    }

    /**
     * Print fiber sizes. A function is:
     * - injective iff max fiber size = 1
     * - surjective iff min fiber size >= 1 (over codomain)
     */
    public static <A, B> void analyzeFibers(Map<A, B> f, Set<B> codomain) {
        System.out.println("Fiber analysis:");
        for (B b : codomain) {
            Set<A> fib = fiber(f, b);
            System.out.println("  f^{-1}({" + b + "}) = " + fib
                    + " (size " + fib.size() + ")");
        }
    }

    // --- Demo: Caesar Cipher ---

    public static Map<Integer, Integer> caesarEncrypt(int shift, int alphabetSize) {
        Map<Integer, Integer> f = new HashMap<>();
        for (int x = 0; x < alphabetSize; x++) {
            f.put(x, Math.floorMod(x + shift, alphabetSize));
        }
        return f;
    }

    // --- Demonstration ---

    public static void main(String[] args) {
        System.out.println("=== Inject/Surject Library ===\n");

        // f(n) = 2n + 3 on {0,...,5} -> Z
        Map<Integer, Integer> f1 = new HashMap<>();
        for (int i = 0; i <= 5; i++) f1.put(i, 2 * i + 3);
        System.out.println("f(n) = 2n+3 on {0..5}: " + f1);
        System.out.println("  Injective: " + isInjective(f1));

        // g(n) = n % 3 on {0,...,5} -> {0,1,2}
        Map<Integer, Integer> g1 = new HashMap<>();
        for (int i = 0; i <= 5; i++) g1.put(i, i % 3);
        Set<Integer> codomainG = Set.of(0, 1, 2);
        System.out.println("\ng(n) = n%3 on {0..5}: " + g1);
        System.out.println("  Injective: " + isInjective(g1));
        System.out.println("  Surjective onto {0,1,2}: " + isSurjective(g1, codomainG));
        List<Integer> collision = findCollision(g1);
        System.out.println("  Collision: " + collision);
        analyzeFibers(g1, codomainG);

        // Caesar cipher
        int n = 26;
        Map<Integer, Integer> caesar = caesarEncrypt(3, n);
        Set<Integer> alphabet = IntStream.range(0, n).boxed()
                .collect(Collectors.toSet());
        System.out.println("\nCaesar(3) on {0..25}:");
        System.out.println("  Bijective: " + isBijective(caesar, alphabet));
        Map<Integer, Integer> inv = inverse(caesar, alphabet);
        System.out.println("  Encrypt(0) = " + caesar.get(0)
                + ", Decrypt(3) = " + inv.get(3));

        // Composition preserves injectivity
        Map<Integer, Integer> h = new HashMap<>();
        for (int i = 0; i <= 5; i++) h.put(i, i * i); // not injective on Z, but on {0..5}?
        System.out.println("\nh(n) = n^2 on {0..5}: " + h);
        System.out.println("  Injective: " + isInjective(h));
        Map<Integer, Integer> composed = compose(f1, h);
        System.out.println("  h ∘ f1 injective: " + isInjective(composed));
    }
}
```

---

## Historical Context

**Georg Cantor** (1845–1918) used bijections to compare the sizes of infinite sets, leading to his groundbreaking theorem that $|\mathbb{R}|> |\mathbb{N}|$ (the reals are uncountable). His "diagonal argument" for surjection failure remains one of the most elegant proofs in mathematics.

The classification into injective/surjective/bijective became standard through **Bourbaki** (1930s–), the pseudonym of a group of French mathematicians who systematized modern mathematics. They also introduced the arrow notation $f: A \to B$.

In cryptography, **Claude Shannon** (1949) established that a secure cipher must be a bijection on the message space — if encryption is not injective, information is lost; if not surjective, some ciphertexts can never appear.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** For $f: \{1,2,3\} \to \{a,b,c,d\}$ with $f(1) = a, f(2) = b, f(3) = c$: injective? surjective? bijective?

**A2.** Can a function from a 5-element set to a 3-element set be injective? Surjective? Justify.

**A3.** If `HashMap` maps keys to values, is the key→value mapping always injective? Is it always surjective?

**A4.** True or false: The composition of two surjective functions is surjective.

### Slide Set B: Proof Problems

**B1.** Prove: $f(n) = 3n - 7$ is injective on $\mathbb{Z}$.

**B2.** Prove or disprove: $f(n) = n \bmod 5$ is surjective from $\mathbb{Z}$ to $\{0,1,2,3,4\}$.

**B3.** Prove: If $g \circ f$ is surjective, then $g$ is surjective.

**B4.** Prove: If $g \circ f$ is injective, then $f$ is injective.

### Slide Set C: Java Coding Problems

**C1.** Write `isInjective(Map<Integer, Integer> f)` and test with $f(n) = n^2$ on $\{-3, \ldots, 3\}$.

**C2.** Write `inverse(Map<A, B> f)` that returns the inverse map. Throw an exception if $f$ is not bijective.

**C3.** Compose two maps and check whether the composition preserves injectivity.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Let $f: \mathbb{Z} \to \mathbb{Z}$ be $f(n) = 5n + 2$. Prove $f$ is injective. Is $f$ surjective? Prove or disprove.

**DM2.** Let $f: \mathbb{R} \to \mathbb{R}$ be $f(x) = x^3$. Prove $f$ is bijective. Find $f^{-1}$.

**DM3.** Let $f: A \to B$ and $g: B \to C$. Prove: if $g \circ f$ is injective, then $f$ is injective.

**DM4.** Let $f: A \to B$ and $g: B \to C$. Prove: if $g \circ f$ is surjective, then $g$ is surjective.

**DM5.** Prove: if $f: A \to B$ is a bijection, then $|A| = |B|$ for finite sets.

**DM6.** Let $f: \{0, \ldots, n-1\} \to \{0, \ldots, n-1\}$ be defined by $f(x) = (ax + b) \bmod n$. Under what conditions on $a$ and $n$ is $f$ a bijection? (Connect to Module 2, units mod $n$.)

### Java Programming Problems

**JP1.** Implement `isInjective`, `isSurjective`, `isBijective` for `Map<Integer, Integer>` with a given codomain.

**JP2.** Given a bijective map, compute its inverse. Verify that $f^{-1}(f(x)) = x$ for all $x$ in the domain.

**JP3.** Build two injective maps $f$ and $g$, compose them, and verify the composition is injective.

**JP4.** Build a hash function from strings to integers (using `hashCode() % tableSize`). Find collisions, demonstrating the function is not injective. Compute fibers.

**JP5.** Implement the Caesar cipher as a bijective map. Encrypt a message, decrypt using the inverse. Extend to an affine cipher $f(x) = (ax + b) \bmod 26$ and compute the inverse using modular inverse from Module 2.

### Bridge Problems

**BR1.** From Module 2: the map $f(x) = ax \bmod n$ is a bijection iff $\gcd(a, n) = 1$. Verify this for $n = 26$ and all values of $a$ from 1 to 25, using your GCD function from Module 1.

**BR2.** From Module 5 Class 2: an equivalence relation on $A$ partitions $A$ into classes. Define the **canonical map** $\pi: A \to A/R$ by $\pi(a) = [a]$. Prove $\pi$ is surjective. When is $\pi$ injective?

**BR3.** From Module 4: the function $\text{powerSet}: \{0, 1, \ldots, n-1\} \to \{0,1\}^n$ that maps a subset to its characteristic function (bit vector) is a bijection from $\mathcal{P}(\{0,\ldots,n-1\})$ to $\{0,1\}^n$. Verify in Java for $n = 4$.

---

## Solutions

### Discrete Math Solutions

**DM1.** *Injective:* $5x_1 + 2 = 5x_2 + 2 \implies 5x_1 = 5x_2 \implies x_1 = x_2$. ✓
*Not surjective over $\mathbb{Z}$:* $y = 1$ requires $5n + 2 = 1$, so $n = -1/5 \notin \mathbb{Z}$. $\blacksquare$

**DM2.** *Injective:* $x_1^3 = x_2^3 \implies x_1 = x_2$ (cube root is well-defined on $\mathbb{R}$). *Surjective:* For any $y \in \mathbb{R}$, take $x = y^{1/3}$. Then $f(x) = y$. *Inverse:* $f^{-1}(y) = y^{1/3}$. $\blacksquare$

**DM3.** Assume $g \circ f$ is injective. Let $f(x_1) = f(x_2)$. Then $g(f(x_1)) = g(f(x_2))$, i.e., $(g \circ f)(x_1) = (g \circ f)(x_2)$. Since $g \circ f$ is injective, $x_1 = x_2$. So $f$ is injective. $\blacksquare$

**DM4.** Assume $g \circ f$ is surjective. Let $c \in C$. Then $\exists a \in A: (g \circ f)(a) = c$. So $g(f(a)) = c$. Let $b = f(a) \in B$. Then $g(b) = c$. So for every $c$, $\exists b: g(b) = c$. Thus $g$ is surjective. $\blacksquare$

**DM5.** If $f$ is bijective: injective $\implies |A| \leq |B|$, surjective $\implies |A| \geq |B|$. Therefore $|A| = |B|$. $\blacksquare$

**DM6.** $f(x) = (ax + b) \bmod n$ is bijective iff $\gcd(a, n) = 1$. If $\gcd(a, n) = 1$, then $a$ has an inverse $a^{-1}$ mod $n$, and $f^{-1}(y) = a^{-1}(y - b) \bmod n$. If $\gcd(a, n) = d > 1$, then $f(0) = b$ and $f(n/d) = (a \cdot n/d + b) \bmod n = b$ (since $a \cdot n/d$ is a multiple of $n$), so $f$ is not injective. $\blacksquare$

### Java Programming Solutions

**JP4.**
```java
public static void hashCollisionDemo() {
    String[] words = {"cat", "dog", "bat", "tab", "act", "god", "tac"};
    int tableSize = 5;
    Map<String, Integer> hashMap = new HashMap<>();
    for (String w : words) {
        hashMap.put(w, Math.floorMod(w.hashCode(), tableSize));
    }
    System.out.println("Hash map: " + hashMap);
    System.out.println("Injective: " + isInjective(hashMap));
    Set<Integer> codomain = IntStream.range(0, tableSize).boxed()
            .collect(Collectors.toSet());
    analyzeFibers(hashMap, codomain);
}
```

**JP5.**
```java
public static void affineCipherDemo() {
    int a = 5, b = 8, n = 26;
    // Verify gcd(a, n) = 1
    // From Module 1: gcd(5, 26) = 1, so a^{-1} mod 26 exists
    // Extended Euclidean: 5 * 21 = 105 = 4*26 + 1, so a^{-1} = 21

    Map<Integer, Integer> encrypt = new HashMap<>();
    for (int x = 0; x < n; x++) {
        encrypt.put(x, Math.floorMod(a * x + b, n));
    }
    Set<Integer> alpha = IntStream.range(0, n).boxed().collect(Collectors.toSet());
    System.out.println("Affine(5,8) bijective: " + isBijective(encrypt, alpha));

    int aInv = 21; // precomputed
    Map<Integer, Integer> decrypt = new HashMap<>();
    for (int y = 0; y < n; y++) {
        decrypt.put(y, Math.floorMod(aInv * (y - b), n));
    }
    // Verify round-trip
    for (int x = 0; x < n; x++) {
        assert decrypt.get(encrypt.get(x)) == x;
    }
    System.out.println("Round-trip verified for all 26 letters.");
}
```
