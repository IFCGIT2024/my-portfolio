# Module 3 – Class 1: Propositional Logic and Truth Tables

## Learning Objectives

- Define propositions and the logical connectives $\neg$, $\wedge$, $\vee$, $\rightarrow$, $\leftrightarrow$.
- Construct truth tables for compound propositions.
- Verify logical equivalences (e.g., De Morgan's laws) by truth table.
- Translate logical connectives into Java's `!`, `&&`, `||`, and conditional expressions.
- Use truth tables to identify tautologies, contradictions, and contingencies.

---

## Concept Overview

A **proposition** is a declarative statement that is either true or false (not both). Examples:
- "7 is prime" (true)
- "4 is odd" (false)
- "Is this a question?" (not a proposition)

**Logical connectives** combine propositions:

| Connective | Symbol | Java | Meaning |
|-----------|--------|------|---------|
| Negation | $\neg P$ | `!p` | "not P" — true when P is false |
| Conjunction | $P \wedge Q$ | `p && q` | "P and Q" — true when both are true |
| Disjunction | $P \vee Q$ | `p \|\| q` | "P or Q" — true when at least one is true |
| Implication | $P \rightarrow Q$ | `!p \|\| q` | "if P then Q" — false only when P is true and Q is false |
| Biconditional | $P \leftrightarrow Q$ | `p == q` | "P if and only if Q" — true when both have the same value |

**The implication** $P \rightarrow Q$ is the most important and most confusing connective for new students. It is logically equivalent to $\neg P \vee Q$. When P is false, the implication is **vacuously true** regardless of Q.

**Why this matters in CS:**
- **Conditionals:** Every `if-else` statement evaluates a compound proposition.
- **Short-circuit evaluation:** Java's `&&` and `||` don't evaluate the second operand if the result is determined by the first (this has real consequences for null checks).
- **Assertions:** `assert P` crashes if proposition P is false.
- **Specifications:** Method contracts are implications: "if the precondition holds, then the postcondition holds."

---

## Formal Notation

A **truth table** lists all possible truth values for the atomic propositions and the resulting value of the compound expression.

**Truth table for implication $P \rightarrow Q$:**

| $P$ | $Q$ | $P \rightarrow Q$ |
|-----|-----|--------------------|
| T | T | T |
| T | F | F |
| F | T | T |
| F | F | T |

**Key equivalences:**
- $P \rightarrow Q \equiv \neg P \vee Q$
- $\neg(P \wedge Q) \equiv \neg P \vee \neg Q$ (De Morgan)
- $\neg(P \vee Q) \equiv \neg P \wedge \neg Q$ (De Morgan)
- $P \rightarrow Q \equiv \neg Q \rightarrow \neg P$ (Contrapositive)
- $P \leftrightarrow Q \equiv (P \rightarrow Q) \wedge (Q \rightarrow P)$

**Terminology:**
- **Tautology:** always true (e.g., $P \vee \neg P$)
- **Contradiction:** always false (e.g., $P \wedge \neg P$)
- **Contingency:** sometimes true, sometimes false

---

## Worked Examples

### Example 1: Building a Truth Table — Discrete Math

**Problem:** Construct the truth table for $\neg P \vee Q$ and show it is equivalent to $P \rightarrow Q$.

| $P$ | $Q$ | $\neg P$ | $\neg P \vee Q$ | $P \rightarrow Q$ |
|-----|-----|----------|------------------|--------------------|
| T | T | F | T | T |
| T | F | F | F | F |
| F | T | T | T | T |
| F | F | T | T | T |

The last two columns are identical, confirming $P \rightarrow Q \equiv \neg P \vee Q$. $\blacksquare$

### Example 2: Java Translation — Truth Table Generator

```java
public class TruthTableDemo {

    /** Implication: P → Q ≡ ¬P ∨ Q */
    public static boolean implies(boolean p, boolean q) {
        return !p || q;
    }

    /** Biconditional: P ↔ Q */
    public static boolean iff(boolean p, boolean q) {
        return p == q;
    }

    /**
     * Prints a truth table for two propositions.
     * The evaluator takes (p, q) and returns the compound result.
     */
    public static void truthTable2(String label,
            java.util.function.BiFunction<Boolean, Boolean, Boolean> eval) {
        System.out.println("Truth table for: " + label);
        System.out.println("  P     Q     Result");
        System.out.println("  ----- ----- ------");
        for (boolean p : new boolean[]{true, false}) {
            for (boolean q : new boolean[]{true, false}) {
                System.out.printf("  %-5s %-5s %s%n", p, q, eval.apply(p, q));
            }
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // P → Q
        truthTable2("P → Q", (p, q) -> implies(p, q));

        // ¬P ∨ Q (should match P → Q)
        truthTable2("¬P ∨ Q", (p, q) -> !p || q);

        // De Morgan: ¬(P ∧ Q) vs ¬P ∨ ¬Q
        truthTable2("¬(P ∧ Q)", (p, q) -> !(p && q));
        truthTable2("¬P ∨ ¬Q", (p, q) -> !p || !q);

        // Verify equivalence programmatically
        boolean allMatch = true;
        for (boolean p : new boolean[]{true, false}) {
            for (boolean q : new boolean[]{true, false}) {
                if ((!(p && q)) != (!p || !q)) allMatch = false;
            }
        }
        System.out.println("De Morgan's Law verified: " + allMatch);
    }
}
```

### Example 3: De Morgan's Laws — Combined Proof and Code

**Problem:** Prove $\neg(P \wedge Q) \equiv \neg P \vee \neg Q$ by truth table, then verify in Java.

| $P$ | $Q$ | $P \wedge Q$ | $\neg(P \wedge Q)$ | $\neg P$ | $\neg Q$ | $\neg P \vee \neg Q$ |
|-----|-----|-------------|---------------------|----------|----------|----------------------|
| T | T | T | F | F | F | F |
| T | F | F | T | F | T | T |
| F | T | F | T | T | F | T |
| F | F | F | T | T | T | T |

Columns 4 and 7 match. $\blacksquare$

**Java verification:**
```java
public static boolean verifyDeMorgan() {
    for (boolean p : new boolean[]{true, false}) {
        for (boolean q : new boolean[]{true, false}) {
            assert (!(p && q)) == (!p || !q) : "DM1 failed";
            assert (!(p || q)) == (!p && !q) : "DM2 failed";
        }
    }
    return true;
}
```

### Example 4: Tautology Check

**Problem:** Show that $P \vee \neg P$ is a tautology (Law of Excluded Middle).

| $P$ | $\neg P$ | $P \vee \neg P$ |
|-----|----------|-----------------|
| T | F | T |
| F | T | T |

Always true. $\blacksquare$

### Example 5: Short-Circuit Evaluation in Java

**Problem:** Explain why `if (arr != null && arr.length > 0)` is safe but `if (arr.length > 0 && arr != null)` may crash.

**Solution:** Java's `&&` uses **short-circuit evaluation**: if the left operand is `false`, the right operand is never evaluated. So:
- `arr != null && arr.length > 0`: If `arr` is null, `arr != null` is false, and `arr.length` is never accessed. Safe.
- `arr.length > 0 && arr != null`: If `arr` is null, `arr.length` throws `NullPointerException`.

This is a real-world consequence of the truth table for `&&`: if the first operand is false, the result is false regardless of the second operand. Java exploits this to skip evaluation.

---

## Proof Techniques Spotlight

### Proof by Truth Table

For propositions involving a finite number of atomic variables, we can verify equivalences exhaustively:

**Template:**
1. List all $2^n$ combinations of truth values for $n$ atomic propositions.
2. Compute each side of the equivalence for every row.
3. If all rows match, the equivalence is proven.

**Limitations:** This only works for propositional logic (finitely many cases). For predicate logic with quantifiers (∀, ∃), we need different techniques.

**Common mistakes:**
- Forgetting that $P \rightarrow Q$ is true when $P$ is false (vacuous truth).
- Confusing $P \rightarrow Q$ with $Q \rightarrow P$ (the converse).
- Confusing "or" in English (often exclusive) with $\vee$ in logic (inclusive).

---

## Java Deep Dive

```java
import java.util.*;
import java.util.function.*;

public class PropositionalLogicLibrary {

    // --- Core Connectives ---

    public static boolean not(boolean p) { return !p; }
    public static boolean and(boolean p, boolean q) { return p && q; }
    public static boolean or(boolean p, boolean q) { return p || q; }
    public static boolean implies(boolean p, boolean q) { return !p || q; }
    public static boolean iff(boolean p, boolean q) { return p == q; }
    public static boolean xor(boolean p, boolean q) { return p ^ q; }
    public static boolean nand(boolean p, boolean q) { return !(p && q); }
    public static boolean nor(boolean p, boolean q) { return !(p || q); }

    // --- Truth Table Engine ---

    /**
     * Generates a truth table for n variables.
     * Returns all 2^n rows as boolean arrays.
     */
    public static boolean[][] allCombinations(int n) {
        int rows = 1 << n;  // 2^n
        boolean[][] table = new boolean[rows][n];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < n; c++) {
                table[r][c] = ((r >> (n - 1 - c)) & 1) == 1;
            }
        }
        return table;
    }

    /** Checks if a formula with n variables is a tautology */
    public static boolean isTautology(int n, Function<boolean[], Boolean> formula) {
        for (boolean[] row : allCombinations(n)) {
            if (!formula.apply(row)) return false;
        }
        return true;
    }

    /** Checks if two formulas are logically equivalent */
    public static boolean areEquivalent(int n,
            Function<boolean[], Boolean> f1,
            Function<boolean[], Boolean> f2) {
        for (boolean[] row : allCombinations(n)) {
            if (!f1.apply(row).equals(f2.apply(row))) return false;
        }
        return true;
    }

    /** Pretty-prints a truth table for a formula with named variables */
    public static void printTruthTable(String[] varNames,
            Function<boolean[], Boolean> formula, String formulaName) {
        int n = varNames.length;
        // Header
        StringBuilder header = new StringBuilder("  ");
        for (String v : varNames) header.append(String.format("%-6s", v));
        header.append(formulaName);
        System.out.println(header);
        System.out.println("  " + "-".repeat(header.length() - 2));

        // Rows
        for (boolean[] row : allCombinations(n)) {
            StringBuilder line = new StringBuilder("  ");
            for (boolean val : row) line.append(String.format("%-6s", val ? "T" : "F"));
            line.append(formula.apply(row) ? "T" : "F");
            System.out.println(line);
        }
        System.out.println();
    }

    // --- Demonstrations ---

    public static void main(String[] args) {
        System.out.println("=== Propositional Logic Library ===\n");

        // Print truth table for P → Q
        printTruthTable(new String[]{"P", "Q"},
            row -> implies(row[0], row[1]), "P → Q");

        // Print truth table for ¬P ∨ Q
        printTruthTable(new String[]{"P", "Q"},
            row -> or(not(row[0]), row[1]), "¬P ∨ Q");

        // Verify De Morgan's Laws
        boolean dm1 = areEquivalent(2,
            row -> not(and(row[0], row[1])),
            row -> or(not(row[0]), not(row[1])));
        boolean dm2 = areEquivalent(2,
            row -> not(or(row[0], row[1])),
            row -> and(not(row[0]), not(row[1])));
        System.out.println("De Morgan 1 (¬(P∧Q) ≡ ¬P∨¬Q): " + dm1);
        System.out.println("De Morgan 2 (¬(P∨Q) ≡ ¬P∧¬Q): " + dm2);

        // Check tautologies
        System.out.println("\nTautology checks:");
        System.out.println("  P ∨ ¬P: " + isTautology(1, row -> or(row[0], not(row[0]))));
        System.out.println("  P → P: " + isTautology(1, row -> implies(row[0], row[0])));
        System.out.println("  (P→Q) ↔ (¬Q→¬P): " + isTautology(2,
            row -> iff(implies(row[0], row[1]), implies(not(row[1]), not(row[0])))));

        // Three-variable example: (P ∧ Q) → R
        printTruthTable(new String[]{"P", "Q", "R"},
            row -> implies(and(row[0], row[1]), row[2]), "(P ∧ Q) → R");
    }
}
```

---

## Historical Context

**Aristotle** (384–322 BC) developed the first formal system of logic — syllogisms, which are structured arguments with premises and conclusions. His work dominated logic for over two millennia.

**George Boole** (1815–1864) revolutionized logic by showing that logical reasoning could be represented algebraically. His *The Laws of Thought* (1854) introduced Boolean algebra, where propositions are variables that take values 0 (false) and 1 (true), and logical operations correspond to algebraic operations.

**Augustus De Morgan** (1806–1871) formulated the laws that bear his name: $\neg(P \wedge Q) \equiv \neg P \vee \neg Q$ and $\neg(P \vee Q) \equiv \neg P \wedge \neg Q$.

**Claude Shannon's** 1937 master's thesis showed that Boolean algebra could be used to analyze electrical switching circuits — the foundation of digital computers. Every logic gate in a CPU implements a Boolean function.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** Is the sentence "This statement is false" a proposition? Why or why not?

**A2.** What is the truth value of $P \rightarrow Q$ when $P$ is false and $Q$ is false? Explain in everyday terms.

**A3.** True or false: $P \vee Q$ in logic means "P or Q, but not both." Correct any misconception.

**A4.** What does **short-circuit evaluation** mean for `&&` and `||` in Java?

### Slide Set B: Proof Problems

**B1.** Prove by truth table that $(P \rightarrow Q) \wedge (Q \rightarrow R) \rightarrow (P \rightarrow R)$ is a tautology.

**B2.** Prove De Morgan's second law: $\neg(P \vee Q) \equiv \neg P \wedge \neg Q$.

**B3.** Show that $P \rightarrow Q$ is not equivalent to $Q \rightarrow P$ by finding a row where they differ.

### Slide Set C: Java Coding Problems

**C1.** Write a Java method `boolean implies(boolean p, boolean q)` and test it with all four combinations.

**C2.** Write a truth table generator that prints the truth table for any binary Boolean function.

**C3.** Write a method that checks whether a given 2-variable Boolean function is a tautology by testing all 4 rows.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Construct truth tables for: (a) $P \wedge (Q \vee R)$, (b) $(P \wedge Q) \vee (P \wedge R)$. Are they equivalent?

**DM2.** Prove that $P \rightarrow (Q \rightarrow R) \equiv (P \wedge Q) \rightarrow R$ using truth tables.

**DM3.** Which of the following are tautologies? (a) $P \rightarrow (P \vee Q)$, (b) $(P \wedge Q) \rightarrow P$, (c) $P \rightarrow (Q \rightarrow P)$, (d) $(P \vee Q) \rightarrow P$.

**DM4.** Using only $\neg$ and $\vee$, express: (a) $P \wedge Q$, (b) $P \rightarrow Q$, (c) $P \leftrightarrow Q$.

**DM5.** Prove that NAND ($\uparrow$, where $P \uparrow Q \equiv \neg(P \wedge Q)$) is functionally complete: express $\neg P$, $P \wedge Q$, and $P \vee Q$ using only NAND.

**DM6.** Write the negation of: "If it is raining, then the ground is wet" in both symbolic and English form.

**DM7.** Determine whether these compound statements are tautologies, contradictions, or contingencies: (a) $(P \rightarrow Q) \vee (Q \rightarrow P)$, (b) $P \leftrightarrow \neg P$, (c) $(P \rightarrow Q) \leftrightarrow (\neg Q \rightarrow \neg P)$.

### Java Programming Problems

**JP1.** Implement all 16 possible binary Boolean functions (there are exactly $2^{2^2} = 16$). Print the truth table for each and label it.

**JP2.** Write a method that takes a `BiFunction<Boolean, Boolean, Boolean>` and determines if it is a tautology, contradiction, or contingency.

**JP3.** Implement a `BooleanExpression` class that represents expressions as trees (with `AND`, `OR`, `NOT`, `IMPLIES` nodes and `VAR` leaves). Write an `evaluate(Map<String, Boolean> assignment)` method.

**JP4.** Write a program that takes a compound Boolean expression and prints its truth table. Support operators `!`, `&&`, `||`, `->`.

**JP5.** Implement a method that, given two Boolean expressions, checks whether they are logically equivalent by exhaustively testing all inputs.

**JP6.** Write a program that verifies De Morgan's Laws, the distributive laws, and the absorption laws by truth table, printing "VERIFIED" or "FAILED" for each.

### Bridge Problems

**BR1.** A method has precondition $P$ and postcondition $Q$. The specification is $P \rightarrow Q$. Explain why the method is "correct" (vacuously) when the precondition is false, and relate this to the truth table for implication.

**BR2.** Write a Java program that takes a combinational logic circuit (specified as a series of gates: AND, OR, NOT, NAND) and computes the truth table of the circuit. Test with a half-adder circuit (sum = XOR, carry = AND).

**BR3.** Java's `&&` and `||` use short-circuit evaluation, but `&` and `|` do not. Write test cases that demonstrate the difference (e.g., where one causes a NullPointerException and the other does not). Explain how this relates to the logical equivalence between `P && Q` and `P & Q`.

---

## Solutions

### Discrete Math Solutions

**DM1.** Both expressions produce the same truth table (distributive law):

| P | Q | R | $P \wedge (Q \vee R)$ | $(P \wedge Q) \vee (P \wedge R)$ |
|---|---|---|------------------------|-----------------------------------|
| T | T | T | T | T |
| T | T | F | T | T |
| T | F | T | T | T |
| T | F | F | F | F |
| F | T | T | F | F |
| F | T | F | F | F |
| F | F | T | F | F |
| F | F | F | F | F |

They are equivalent. $\blacksquare$

**DM2.** Truth table (8 rows) confirms all rows match.

**DM3.** (a) Tautology: if P is true, then P∨Q is true; (b) Tautology: P∧Q implies P; (c) Tautology: if P then Q→P is vacuously true (P makes Q→P true); (d) Contingency: P=F, Q=T gives F.

**DM4.** (a) $P \wedge Q \equiv \neg(\neg P \vee \neg Q)$; (b) $P \rightarrow Q \equiv \neg P \vee Q$; (c) $P \leftrightarrow Q \equiv (\neg P \vee Q) \wedge (\neg Q \vee P) \equiv \neg((\neg P \vee Q) \vee ...)$ — more naturally: $\neg(\neg(\neg P \vee Q) \vee \neg(\neg Q \vee P))$... or using only $\neg, \vee$: $(\neg P \vee Q) \wedge (\neg Q \vee P)$ where $A \wedge B = \neg(\neg A \vee \neg B)$.

**DM5.** $\neg P \equiv P \uparrow P$. $P \wedge Q \equiv (P \uparrow Q) \uparrow (P \uparrow Q)$. $P \vee Q \equiv (P \uparrow P) \uparrow (Q \uparrow Q)$. $\blacksquare$

**DM6.** Symbolic: $\neg(P \rightarrow Q) \equiv P \wedge \neg Q$. English: "It is raining and the ground is not wet."

**DM7.** (a) Tautology (try P=T,Q=F: P→Q=F but Q→P=T, so disjunction is T; all rows give T). (b) Contradiction (P↔¬P is always false). (c) Tautology (contrapositive equivalence).

### Java Solutions

**JP1.**
```java
public static void allBinaryFunctions() {
    String[] names = {"F", "AND", "P∧¬Q", "P", "¬P∧Q", "Q",
        "XOR", "OR", "NOR", "XNOR", "¬Q", "P∨¬Q",
        "¬P", "¬P∨Q", "NAND", "T"};
    for (int fn = 0; fn < 16; fn++) {
        System.out.printf("Function %2d (%s):%n", fn, names[fn]);
        for (int r = 0; r < 4; r++) {
            boolean p = (r & 2) != 0, q = (r & 1) != 0;
            boolean result = ((fn >> r) & 1) == 1;
            System.out.printf("  %s %s → %s%n", p, q, result);
        }
    }
}
```

**JP2.**
```java
public static String classify(BiFunction<Boolean, Boolean, Boolean> f) {
    int trueCount = 0;
    for (boolean p : new boolean[]{true, false})
        for (boolean q : new boolean[]{true, false})
            if (f.apply(p, q)) trueCount++;
    if (trueCount == 4) return "tautology";
    if (trueCount == 0) return "contradiction";
    return "contingency";
}
```

**JP6.**
```java
public static void verifyLaws() {
    boolean[][] rows = {{true,true},{true,false},{false,true},{false,false}};
    // De Morgan 1
    boolean ok = true;
    for (boolean[] r : rows) ok &= (!(r[0]&&r[1])) == (!r[0]||!r[1]);
    System.out.println("De Morgan 1: " + (ok ? "VERIFIED" : "FAILED"));
    // De Morgan 2
    ok = true;
    for (boolean[] r : rows) ok &= (!(r[0]||r[1])) == (!r[0]&&!r[1]);
    System.out.println("De Morgan 2: " + (ok ? "VERIFIED" : "FAILED"));
    // Distribution
    // Need 3 vars for distributive
    for (boolean p : new boolean[]{true,false})
        for (boolean q : new boolean[]{true,false})
            for (boolean r : new boolean[]{true,false}) {
                assert (p&&(q||r)) == ((p&&q)||(p&&r));
                assert (p||(q&&r)) == ((p||q)&&(p||r));
            }
    System.out.println("Distributive laws: VERIFIED");
}
```
