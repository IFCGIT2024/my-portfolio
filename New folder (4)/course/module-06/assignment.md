# Module 6 – Assignment: Induction, Recursion and Expression Evaluation

**Integrative Assignment — Modules 5 & 6**

## Overview

This assignment synthesizes functions and relations (Module 5) with induction and recursion (Module 6). You will:
- Prove summation and structural properties by induction.
- Implement an arithmetic expression evaluator.
- Prove by structural induction that the evaluator computes the correct value.
- Connect recursive definitions to function properties from Module 5.

---

## Part A: Mathematical Proofs

**A1.** Prove by mathematical induction: $\displaystyle\sum_{i=1}^{n} i(i+1) = \frac{n(n+1)(n+2)}{3}$ for all $n \geq 1$.

**A2.** Prove by strong induction: every integer $n \geq 2$ can be written as a product of primes.

**A3.** Define an arithmetic expression recursively:
$$E ::= n \mid (E + E) \mid (E \times E)$$

where $n$ is an integer literal. Define `eval(e)` by:
- $\text{eval}(n) = n$
- $\text{eval}(e_1 + e_2) = \text{eval}(e_1) + \text{eval}(e_2)$
- $\text{eval}(e_1 \times e_2) = \text{eval}(e_1) \times \text{eval}(e_2)$

Prove by structural induction: `eval` is a well-defined function from expressions to integers (i.e., every expression has exactly one value).

**A4.** Prove by structural induction: in a full binary tree, $L = I + 1$ where $L$ = leaves and $I$ = internal nodes.

**A5.** Let $f: A \to B$ be a function. Define the relation $\sim_f$ on $A$ by $a_1 \sim_f a_2$ iff $f(a_1) = f(a_2)$ (from Module 5). Prove: $\sim_f$ has exactly $|\text{range}(f)|$ equivalence classes. Use induction on $|\text{range}(f)|$ (or a direct argument).

---

## Part B: Java Programming

### B1: Arithmetic Expression Evaluator (35 points)

Implement a complete arithmetic expression system:

```java
public interface Expr {
    int eval();
    int size();           // total nodes in tree
    int ops();            // number of operator nodes
    int depth();          // max depth (IntLit has depth 0)
    String toInfix();     // fully parenthesized infix
    String toPostfix();   // postfix (RPN)
}

public class IntLit implements Expr { /* TODO */ }
public class Add implements Expr { /* TODO */ }
public class Mul implements Expr { /* TODO */ }
public class Sub implements Expr { /* TODO */ }
```

**Requirements:**
1. Build at least 5 different expression trees, including nested ones.
2. For each, print `toInfix()`, `toPostfix()`, `eval()`, `size()`, `ops()`, `depth()`.
3. Verify `size() == 2 * ops() + 1` for all.
4. Verify `ops() <= 2^depth() - 1` for all (when `ops() > 0`).

### B2: Postfix Evaluator (20 points)

```java
public class PostfixEvaluator {
    /**
     * Evaluate a postfix expression string.
     * Tokens separated by spaces. Numbers can be multi-digit or negative.
     * Operators: +, -, *
     * Example: "3 5 + 2 *" -> 16
     */
    public static int evaluate(String postfix) { /* TODO */ }
}
```

Build expression trees, convert to postfix with `toPostfix()`, then evaluate with `PostfixEvaluator.evaluate()`. Verify the results match `eval()`.

### B3: Recursive and Iterative Computation (15 points)

```java
public class RecursionComparison {

    /**
     * Compute sum 1+2+...+n three ways: iterative, recursive, formula.
     * Time each for n = 10, 100, 1000, 10000.
     */
    public static void compareSums() { /* TODO */ }

    /**
     * Compute Fibonacci three ways: naive, iterative, memoized.
     * Time each for n = 10, 20, 30, 35, 40.
     */
    public static void compareFib() { /* TODO */ }

    /**
     * Print a table showing results and timing.
     */
    public static void main(String[] args) { /* TODO */ }
}
```

### B4: Tree Properties Verifier (15 points)

```java
public class TreeVerifier {

    /**
     * Build full binary trees of heights 0–8.
     * For each, verify:
     * - size == 2^(h+1) - 1
     * - leaves == internal + 1
     * - height == h
     * - mirror preserves size and height
     */
    public static void verifyFullTreeProperties() { /* TODO */ }

    /**
     * Build a "degenerate" (linear) tree of n nodes.
     * Verify: height == n - 1 and leaves == 1.
     */
    public static void verifyDegenerateTree(int n) { /* TODO */ }
}
```

---

## Rubric

| Component | Points |
|-----------|--------|
| A1: Summation induction proof | 10 |
| A2: Strong induction prime factorization | 10 |
| A3: Structural induction eval well-defined | 12 |
| A4: Full binary tree L=I+1 proof | 10 |
| A5: Equivalence classes of $\sim_f$ | 8 |
| B1: Expression evaluator (4 types, 6 methods) | 35 |
| B2: Postfix evaluator + round-trip test | 20 |
| B3: Recursive/iterative comparison with timing | 15 |
| B4: Tree property verification | 15 |
| Code quality and documentation | 10 |
| **Total** | **145** |

---

## Solution Key

### Part A Solutions

**A1.** *Base ($n = 1$):* $1 \cdot 2 = 2 = \frac{1 \cdot 2 \cdot 3}{3}$. ✓

*Inductive step:* Assume $\sum_{i=1}^k i(i+1) = \frac{k(k+1)(k+2)}{3}$.

$$\sum_{i=1}^{k+1} i(i+1) = \frac{k(k+1)(k+2)}{3} + (k+1)(k+2)$$
$$= \frac{k(k+1)(k+2) + 3(k+1)(k+2)}{3} = \frac{(k+1)(k+2)(k+3)}{3}$$

This is the formula with $n = k+1$. ✓ $\blacksquare$

**A2.** *Base ($n=2$):* 2 is prime, product of one prime. ✓

*Inductive step:* Assume every $j$ with $2 \leq j \leq k$ is a product of primes.

If $k+1$ is prime, done. If composite, $k+1 = ab$ with $2 \leq a, b \leq k$. By hypothesis, $a = p_1 \cdots p_s$ and $b = q_1 \cdots q_t$. So $k+1 = p_1 \cdots p_s q_1 \cdots q_t$. ✓ $\blacksquare$

**A3.** By structural induction on the expression $e$:

*Base:* $\text{eval}(n) = n$ is a single integer — well-defined. ✓

*Inductive step (Add):* Assume $\text{eval}(e_1)$ and $\text{eval}(e_2)$ are each well-defined integers. Then $\text{eval}(e_1 + e_2) = \text{eval}(e_1) + \text{eval}(e_2)$ is the sum of two integers, which is a unique integer. ✓

*Inductive step (Mul):* Similarly, $\text{eval}(e_1) \times \text{eval}(e_2)$ is a unique integer. ✓

Since every expression is built by finitely many applications of these rules, `eval` assigns a unique integer to every expression. $\blacksquare$

**A4.** *Base:* Single node (leaf, no children). $L = 1, I = 0$. $L = I + 1$. ✓

*Inductive step:* $T = \text{Node}(v, T_L, T_R)$ where both subtrees are non-empty full trees. IH: $L_L = I_L + 1$ and $L_R = I_R + 1$.

$L = L_L + L_R = (I_L + 1) + (I_R + 1) = I_L + I_R + 2 = (I_L + I_R + 1) + 1 = I + 1$. ✓ $\blacksquare$

**A5.** The equivalence classes of $\sim_f$ are exactly the fibers $f^{-1}(\{b\})$ for each $b \in \text{range}(f)$. Each fiber is non-empty (since $b \in \text{range}(f)$) and distinct $b$-values give disjoint fibers. So the number of classes equals $|\text{range}(f)|$. $\blacksquare$

### Part B Solutions

**B1:**
```java
import java.util.*;

public class ExpressionSystem {

    interface Expr {
        int eval();
        int size();
        int ops();
        int depth();
        String toInfix();
        String toPostfix();
    }

    static class IntLit implements Expr {
        final int value;
        IntLit(int v) { value = v; }
        public int eval() { return value; }
        public int size() { return 1; }
        public int ops() { return 0; }
        public int depth() { return 0; }
        public String toInfix() { return String.valueOf(value); }
        public String toPostfix() { return String.valueOf(value); }
    }

    static class Add implements Expr {
        final Expr left, right;
        Add(Expr l, Expr r) { left = l; right = r; }
        public int eval() { return left.eval() + right.eval(); }
        public int size() { return left.size() + right.size() + 1; }
        public int ops() { return left.ops() + right.ops() + 1; }
        public int depth() { return 1 + Math.max(left.depth(), right.depth()); }
        public String toInfix() { return "(" + left.toInfix() + " + " + right.toInfix() + ")"; }
        public String toPostfix() { return left.toPostfix() + " " + right.toPostfix() + " +"; }
    }

    static class Mul implements Expr {
        final Expr left, right;
        Mul(Expr l, Expr r) { left = l; right = r; }
        public int eval() { return left.eval() * right.eval(); }
        public int size() { return left.size() + right.size() + 1; }
        public int ops() { return left.ops() + right.ops() + 1; }
        public int depth() { return 1 + Math.max(left.depth(), right.depth()); }
        public String toInfix() { return "(" + left.toInfix() + " * " + right.toInfix() + ")"; }
        public String toPostfix() { return left.toPostfix() + " " + right.toPostfix() + " *"; }
    }

    static class Sub implements Expr {
        final Expr left, right;
        Sub(Expr l, Expr r) { left = l; right = r; }
        public int eval() { return left.eval() - right.eval(); }
        public int size() { return left.size() + right.size() + 1; }
        public int ops() { return left.ops() + right.ops() + 1; }
        public int depth() { return 1 + Math.max(left.depth(), right.depth()); }
        public String toInfix() { return "(" + left.toInfix() + " - " + right.toInfix() + ")"; }
        public String toPostfix() { return left.toPostfix() + " " + right.toPostfix() + " -"; }
    }

    // Postfix evaluator
    public static int evaluatePostfix(String postfix) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (String token : postfix.split("\\s+")) {
            switch (token) {
                case "+": { int b = stack.pop(); int a = stack.pop(); stack.push(a + b); break; }
                case "-": { int b = stack.pop(); int a = stack.pop(); stack.push(a - b); break; }
                case "*": { int b = stack.pop(); int a = stack.pop(); stack.push(a * b); break; }
                default: stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }

    public static void testExpr(Expr e) {
        System.out.println("  Infix:   " + e.toInfix());
        System.out.println("  Postfix: " + e.toPostfix());
        System.out.println("  eval=" + e.eval() + "  size=" + e.size()
                + "  ops=" + e.ops() + "  depth=" + e.depth());
        assert e.size() == 2 * e.ops() + 1 : "size != 2*ops+1";
        if (e.ops() > 0) assert e.ops() <= (1 << e.depth()) - 1 : "ops > 2^depth - 1";
        // Round-trip postfix
        int postfixResult = evaluatePostfix(e.toPostfix());
        assert postfixResult == e.eval() : "Postfix mismatch!";
        System.out.println("  Postfix eval matches: " + postfixResult);
    }

    public static void main(String[] args) {
        System.out.println("=== Expression Evaluator Assignment ===\n");

        Expr[] exprs = {
            new Add(new IntLit(3), new IntLit(5)),                          // 8
            new Mul(new Add(new IntLit(3), new IntLit(5)),
                    new Add(new IntLit(2), new IntLit(4))),                  // 48
            new Sub(new Mul(new IntLit(10), new IntLit(3)), new IntLit(7)), // 23
            new Add(new Mul(new IntLit(2), new IntLit(3)),
                    new Mul(new IntLit(4), new IntLit(5))),                  // 26
            new Mul(new Add(new Sub(new IntLit(10), new IntLit(3)),
                            new IntLit(2)),
                    new IntLit(4)),                                          // 36
        };

        for (int i = 0; i < exprs.length; i++) {
            System.out.println("Expression " + (i + 1) + ":");
            testExpr(exprs[i]);
            System.out.println();
        }

        System.out.println("All expression tests passed!");
    }
}
```
