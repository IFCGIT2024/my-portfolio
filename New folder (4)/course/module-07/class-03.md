# Module 7 – Class 3: Pigeonhole Principle and Simple Probability

## Learning Objectives

- State and apply the pigeonhole principle (basic and generalized).
- Analyze hash table collisions using the pigeonhole principle.
- Compute basic discrete probabilities over finite sample spaces.
- Understand and estimate the birthday paradox.
- Implement hash collision detection and birthday paradox simulation in Java.

---

## Concept Overview

### The Pigeonhole Principle (PHP)

If $n$ items are placed into $m$ containers and $n > m$, then at least one container holds more than one item.

**Formally:** For any function $f: A \to B$, if $|A| > |B|$, then $f$ is **not** injective. (Module 5!)

### Generalized Pigeonhole Principle

If $n$ items are placed into $m$ containers, then some container holds at least $\lceil n/m \rceil$ items.

### Applications

| Scenario | Items | Containers | Conclusion |
|----------|-------|------------|------------|
| 13 people born in some year | people | 12 months | $\geq 2$ share a birth month |
| 27 English words | words | 26 letters | $\geq 2$ start with same letter |
| $n+1$ integers from $\{1,...,2n\}$ | integers | $n$ pairs $\{k, 2n+1-k\}$ | $\geq 2$ sum to $2n+1$ |
| Hash table: $n$ keys, $m$ slots | keys | slots | collision if $n > m$ |

### Simple Probability

For a finite sample space $S$ where all outcomes are equally likely:

$$P(E) = \frac{|E|}{|S|}$$

**The Birthday Problem:** In a group of $k$ people, what is the probability that at least two share a birthday?

$$P(\text{no match among } k) = \frac{365}{365} \cdot \frac{364}{365} \cdot \frac{363}{365} \cdots \frac{365-k+1}{365} = \frac{P(365, k)}{365^k}$$

$$P(\text{at least one match}) = 1 - P(\text{no match})$$

At $k = 23$, $P(\text{match}) \approx 0.507$ — **more than 50%**.

At $k = 70$, $P(\text{match}) > 0.999$.

### Birthday Paradox and Hash Collisions

For a hash table with $m$ slots, the expected number of keys before the first collision is approximately $\sqrt{\pi m / 2}$ (birthday bound). This is why a 128-bit hash gives $\approx 2^{64}$ collision resistance, not $2^{128}$.

---

## Formal Notation

| Symbol | Meaning |
|--------|---------|
| $\lceil x \rceil$ | Ceiling: smallest integer $\geq x$ |
| $P(E)$ | Probability of event $E$ |
| $S$ | Sample space |
| $P(n,k)$ | Permutations (from Class 2) |

---

## Worked Examples

### Example 1: Birthday Months

In a group of 13 people, prove that at least 2 share a birth month.

*Proof:* There are 13 people (items) and 12 months (containers). By PHP, at least one month contains $\geq 2$ people. $\blacksquare$

### Example 2: Sock Drawer

A drawer contains 10 red socks and 10 blue socks. How many must you draw (in the dark) to guarantee a matching pair?

$m = 2$ colors. Need $m + 1 = 3$ socks.

### Example 3: Generalized PHP in Load Balancing

7 tasks are assigned to 3 servers. Show that some server gets at least 3 tasks.

$\lceil 7/3 \rceil = 3$. By the generalized PHP, at least one server handles $\geq 3$ tasks. $\blacksquare$

### Example 4: Hash Table Collision

A hash table has 1000 slots. How many keys can be inserted before a collision is guaranteed?

**Guaranteed:** $1001$ keys (by PHP).

**Expected (birthday bound):** $\approx \sqrt{\pi \cdot 1000 / 2} \approx 39.6$, so expect a collision around 40 keys.

### Example 5: Probability — Drawing Cards

From a standard 52-card deck, draw 5 cards. What is the probability of getting exactly 2 aces?

$$P = \frac{\binom{4}{2}\binom{48}{3}}{\binom{52}{5}} = \frac{6 \cdot 17296}{2598960} = \frac{103776}{2598960} \approx 0.0399$$

---

## Proof Techniques Spotlight

### Existence Proofs via PHP

The pigeonhole principle is a powerful tool for **existence proofs** — proving that something must exist without constructing it explicitly.

**Theorem:** Among any 5 points placed in a $1 \times 1$ square, at least two are within distance $\frac{\sqrt{2}}{2}$ of each other.

*Proof:* Divide the square into 4 smaller squares of side $\frac{1}{2}$. By PHP ($5$ points, $4$ squares), at least two points are in the same small square. The diameter of a $\frac{1}{2} \times \frac{1}{2}$ square is $\frac{\sqrt{2}}{2}$. $\blacksquare$

### Counting Complement

To find $P(E)$, compute $P(\overline{E})$ instead:

$$P(E) = 1 - P(\overline{E})$$

This technique powers the birthday problem calculation and many other problems.

---

## Java Deep Dive

```java
import java.util.*;
import java.util.stream.*;

public class PigeonholeAndProbability {

    // --- Pigeonhole Demonstration: Hash Collisions ---

    /**
     * Insert keys into a hash table of size m.
     * Returns the number of keys inserted before the first collision.
     */
    public static int firstCollision(int[] keys, int tableSize) {
        boolean[] occupied = new boolean[tableSize];
        for (int i = 0; i < keys.length; i++) {
            int slot = Math.floorMod(keys[i], tableSize);
            if (occupied[slot]) return i + 1; // collision on (i+1)-th key
            occupied[slot] = true;
        }
        return -1; // no collision
    }

    /**
     * Demonstrate the pigeonhole principle:
     * inserting tableSize+1 distinct hash keys guarantees a collision.
     */
    public static void demonstratePHP(int tableSize) {
        int[] keys = IntStream.range(0, tableSize + 1).toArray();
        int col = firstCollision(keys, tableSize);
        System.out.println("Table size: " + tableSize + ", keys: " + (tableSize + 1)
                + " → first collision at key #" + col);
    }

    // --- Generalized PHP ---

    /**
     * Given n items in m containers, the minimum items in the
     * fullest container is ceil(n/m).
     */
    public static int generalizedPHP(int n, int m) {
        return (n + m - 1) / m; // integer ceiling
    }

    /**
     * Simulate random distribution of n items into m containers.
     * Returns the maximum load.
     */
    public static int simulateMaxLoad(int n, int m, Random rng) {
        int[] counts = new int[m];
        for (int i = 0; i < n; i++) counts[rng.nextInt(m)]++;
        return Arrays.stream(counts).max().orElse(0);
    }

    // --- Birthday Problem ---

    /**
     * Exact probability that among k people, at least two share
     * a birthday (assuming 365 equally likely birthdays).
     */
    public static double birthdayProbExact(int k) {
        if (k > 365) return 1.0;
        double pNoMatch = 1.0;
        for (int i = 1; i < k; i++) {
            pNoMatch *= (365.0 - i) / 365.0;
        }
        return 1.0 - pNoMatch;
    }

    /**
     * Monte Carlo simulation: estimate birthday collision probability.
     */
    public static double birthdayProbMonteCarlo(int k, int trials) {
        Random rng = new Random(42);
        int collisions = 0;
        for (int t = 0; t < trials; t++) {
            Set<Integer> seen = new HashSet<>();
            boolean found = false;
            for (int i = 0; i < k; i++) {
                int day = rng.nextInt(365);
                if (!seen.add(day)) { found = true; break; }
            }
            if (found) collisions++;
        }
        return (double) collisions / trials;
    }

    /**
     * Birthday bound approximation: expected keys to first collision
     * in a hash table of size m is sqrt(pi * m / 2).
     */
    public static double birthdayBound(int m) {
        return Math.sqrt(Math.PI * m / 2.0);
    }

    // --- Simple Probability ---

    /**
     * P(E) = |E| / |S| for equally likely outcomes.
     */
    public static double uniformProbability(long eventSize, long sampleSize) {
        return (double) eventSize / sampleSize;
    }

    // --- Reusing C(n,k) from Class 2 ---

    public static long binomial(int n, int k) {
        if (k < 0 || k > n) return 0;
        if (k == 0 || k == n) return 1;
        if (k > n - k) k = n - k;
        long result = 1;
        for (int i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }

    // --- Monte Carlo: First Collision in Hash Table ---

    /**
     * Simulate inserting random keys into a table of size m.
     * Returns the average number of insertions until first collision.
     */
    public static double avgFirstCollision(int m, int trials) {
        Random rng = new Random(42);
        long totalInserts = 0;
        for (int t = 0; t < trials; t++) {
            Set<Integer> used = new HashSet<>();
            int count = 0;
            while (true) {
                int slot = rng.nextInt(m);
                count++;
                if (!used.add(slot)) break;
            }
            totalInserts += count;
        }
        return (double) totalInserts / trials;
    }

    // --- Demo ---

    public static void main(String[] args) {
        System.out.println("=== Pigeonhole Principle & Probability ===\n");

        // PHP Demonstration
        demonstratePHP(10);
        demonstratePHP(100);

        // Generalized PHP
        System.out.println("\n7 tasks, 3 servers: max load >= "
                + generalizedPHP(7, 3));

        // Simulated load balancing
        Random rng = new Random(42);
        int maxLoad = simulateMaxLoad(7, 3, rng);
        System.out.println("Simulated max load (7 tasks, 3 servers): " + maxLoad);

        // Birthday problem
        System.out.println("\n--- Birthday Problem ---");
        for (int k : new int[]{10, 20, 23, 30, 50, 70}) {
            System.out.printf("k=%2d: exact=%.4f, monte carlo=%.4f%n",
                    k, birthdayProbExact(k),
                    birthdayProbMonteCarlo(k, 100000));
        }

        // Birthday bound for hash tables
        System.out.println("\n--- Birthday Bound ---");
        for (int m : new int[]{100, 1000, 1_000_000}) {
            System.out.printf("m=%,d: bound=%.1f, simulated avg=%.1f%n",
                    m, birthdayBound(m), avgFirstCollision(m, 10000));
        }

        // Probability: 2 aces in 5-card hand
        long event = binomial(4, 2) * binomial(48, 3);
        long sample = binomial(52, 5);
        System.out.printf("\nP(exactly 2 aces in 5-card hand) = %d/%d = %.4f%n",
                event, sample, uniformProbability(event, sample));
    }
}
```

---

## Historical Context

The **pigeonhole principle** (Dirichlet's box principle) is attributed to **Peter Gustav Lejeune Dirichlet** (1834), though the idea was used informally much earlier. The German name *Schubfachprinzip* ("drawer principle") reflects its intuitive roots.

The **birthday problem** was posed by **Richard von Mises** in 1939 and is a staple of probability courses because it so effectively challenges human intuition. Hash table designers rely on its mathematics daily.

**Probability theory** grew from correspondence between **Blaise Pascal** and **Pierre de Fermat** in 1654 about gambling problems — the same Pascal from Class 2's triangle.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** State the pigeonhole principle. What does it guarantee?

**A2.** There are 367 students in a class. What can you conclude about their birthdays?

**A3.** Why is the birthday paradox surprising? At what group size does the probability hit 50%?

**A4.** How does the birthday bound relate to the security of a hash function with $n$-bit output?

### Slide Set B: Proof Problems

**B1.** Prove: among any 5 integers, at least two have the same remainder when divided by 4.

**B2.** Prove: in any group of 6 people, either 3 mutually know each other or 3 mutually don't. (Hint: fix one person, apply PHP to classify the other 5.)

**B3.** Prove the generalized PHP: if $n$ items are in $m$ containers, some container has $\geq \lceil n/m \rceil$ items.

### Slide Set C: Java Coding Problems

**C1.** Write a program that inserts $n$ random keys into a hash table of size $m$ and reports the first collision.

**C2.** Simulate the birthday problem 100,000 times for $k = 1, 2, ..., 50$ and plot exact vs simulated probabilities.

**C3.** Implement `generalizedPHP(n, m)` and verify experimentally by distributing $n$ random balls into $m$ bins.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** A store has 6 types of fruit. How many pieces must you buy to guarantee at least 4 of the same type?

**DM2.** Prove: among any 10 integers, there exist two whose difference is divisible by 9.

**DM3.** A deck of 52 cards is dealt to 4 players (13 each). Prove that at least one player has cards of all 4 suits.

**DM4.** Compute $P(\text{exactly 3 heads in 8 coin flips})$.

**DM5.** Prove: the number of people in a room who have shaken an odd number of hands is even. (Hint: sum of degrees.)

**DM6.** In a round-robin tournament with 6 players, prove that at least one player has $\geq 3$ wins or $\geq 3$ losses.

### Java Programming Problems

**JP1.** Implement `firstCollision(keys, tableSize)`. Test with sequential and random keys.

**JP2.** Compute and display the birthday probability for $k = 1, ..., 60$ (exact and Monte Carlo).

**JP3.** Simulate the generalized PHP: distribute $n$ balls into $m$ bins 10,000 times and report the average and maximum of the max-load.

**JP4.** Implement a simple hash table with chaining. Insert 2000 random keys into a 1000-slot table. Report the maximum chain length and compare with $\lceil 2000/1000 \rceil = 2$ (PHP bound) vs actual.

**JP5.** Merge the counting functions from Classes 1–3 into a single `CombinatoricsToolkit` class with `binomial`, `permutations`, `inclusionExclusion`, `birthdayProb`, and `firstCollision`.

### Bridge Problems

**BR1.** Module 5: $f: A \to B$ with $|A| > |B|$ is not injective. That *is* the pigeonhole principle. Give three different interpretations (functions, hash tables, birthdays) and implement each in Java.

**BR2.** Module 7 Class 1 used inclusion-exclusion. The birthday problem can also be solved with inclusion-exclusion over pairwise collisions (though it's harder). Set up the formula for $k = 3$ people and verify numerically.

**BR3.** Module 4: $|\mathcal{P}(A)| = 2^n$. A random subset of $A$ is equally likely to be any of $2^n$ subsets. What is $P(|S| = k)$? This equals $\binom{n}{k}/2^n$. Verify in Java by random sampling.

---

## Solutions

### Discrete Math Solutions

**DM1.** By generalized PHP: $\lceil n / 6 \rceil \geq 4 \Rightarrow n \geq 19$. Buy 19 pieces.

**DM2.** There are 9 possible remainders mod 9 ($\{0,...,8\}$). 10 integers → by PHP, two share a remainder. Their difference is divisible by 9. $\blacksquare$

**DM3.** The 4 players receive $4 \times 13 = 52$ cards covering all 4 suits. Each suit has 13 cards distributed among 4 players. If any player had cards of $\leq 3$ suits, those 3 suits contribute at most $13 \times 3 = 39$ cards total to those players. But we actually need a cleaner argument: Each player gets 13 cards from 4 suits. By PHP, any player with 13 cards from 4 suits needs $\lceil 13/4 \rceil = 4$ from some suit, but that doesn't immediately help. Instead: There are 4 suits. A player misses a suit only if they get 0 from that suit. Across all 4 players, total suit-appearances is $4 \times 13 = 52$. But we just need to show one player has all 4 suits. By PHP on suits: each suit has 13 cards among 4 players, so at most 3 players can miss a given suit. Across 4 suits, at most $3 \times 4 = 12$ (player, missed-suit) pairs. But there are 4 players, each with at most 3 missable suits, totalling at most 12 misses—so it's possible all miss 3. A more direct route: this is not provable in general; counterexample: deal each suit entirely to one player. Corrected statement: "at least one player has cards from at least $\lceil 13 \times 4 / 52 \rceil$ suits" is trivially 1. The correct pigeonhole application: since 13 > 4, a player with 13 cards from 4 available suits must have at least $\lceil 13/4 \rceil = 4$ cards of the same suit. But actually: **each player gets 13 cards drawn from all 4 suits so must touch at least $\lceil 13/(13) \rceil = 1$ suit, and since cards come from a shuffled deck, any player *could* get all one suit**. The claim as stated isn't necessarily true — it requires additional conditions. We replace this problem.

**DM3 (Revised).** 13 cards are dealt to one player from a 52-card deck containing 4 suits of 13 cards. Prove the player has at least $\lceil 13/4 \rceil = 4$ cards of the same suit. *Proof:* 13 cards are distributed among 4 suits (containers). By generalized PHP, at least one suit has $\lceil 13/4 \rceil = 4$ cards. $\blacksquare$

**DM4.** $P = \frac{\binom{8}{3}}{2^8} = \frac{56}{256} = \frac{7}{32} \approx 0.2188$.

**DM5.** Let $d_i$ = number of handshakes for person $i$. The sum $\sum d_i$ is even (each handshake counted twice). The people with odd $d_i$ contribute an odd amount each; for the total to be even, there must be an even number of odd contributors. $\blacksquare$

**DM6.** Each player plays 5 games. If a player has $\leq 2$ wins, they have $\geq 3$ losses. If a player has $\geq 3$ wins, we're done. $\blacksquare$
