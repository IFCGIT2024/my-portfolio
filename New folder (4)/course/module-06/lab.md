# Module 6 – Lab: Induction, Recursion and Recursive Structures

## Overview

In this lab you will implement recursive definitions, verify inductive formulas, build and traverse expression trees, and work with binary trees — connecting each implementation to the induction proofs from class.

**Prerequisites:** Modules 5–6 (functions/relations, induction, recursion, structural induction).

---

## Part 1: Summation Formulas and Induction Verification

### Exercise 1.1: Three Ways to Sum

Implement three methods for $\sum_{i=1}^n i$:

```java
public static long sumIterative(int n) { /* TODO */ }
public static long sumRecursive(int n) { /* TODO */ }
public static long sumFormula(int n) { /* TODO: n*(n+1)/2 */ }
```

Verify all three agree for $n = 1$ to 10000.

### Exercise 1.2: Sum of Squares

```java
public static long sumSquaresIterative(int n) { /* TODO */ }
public static long sumSquaresFormula(int n) { /* TODO: n(n+1)(2n+1)/6 */ }
```

### Exercise 1.3: Geometric Sum

```java
public static double geometricSumIterative(double r, int n) { /* TODO */ }
public static double geometricSumFormula(double r, int n) { /* TODO: (r^{n+1}-1)/(r-1) */ }
```

Test with $r = 2, 3, 0.5$ and $n = 10$.

---

## Part 2: Fibonacci and Strong Induction

### Exercise 2.1: Three Fibonacci Implementations

```java
public static long fibNaive(int n) { /* TODO: recursive, no memo */ }
public static long fibIterative(int n) { /* TODO: loop */ }
public static long fibMemoized(int n) { /* TODO: DP array */ }
```

### Exercise 2.2: Timing Comparison

Time `fibNaive(40)` vs `fibIterative(40)`. Print elapsed milliseconds.

### Exercise 2.3: Verify $F_n < 2^n$

```java
public static void verifyFibBound(int max) {
    // For n = 0..max, check fibIterative(n) < (1L << n)
}
```

---

## Part 3: Expression Trees

### Exercise 3.1: Expression Evaluator

Implement the `Expr` hierarchy:

```java
interface Expr {
    int eval();
    int size();
    int ops();
    String toInfix();
}
class IntLit implements Expr { /* TODO */ }
class Add implements Expr { /* TODO */ }
class Mul implements Expr { /* TODO */ }
```

Build and evaluate: $(3 + 5) \times (2 + 4) = 48$.

### Exercise 3.2: Verify size = 2 * ops + 1

For several expression trees, check that `size() == 2 * ops() + 1`.

### Exercise 3.3: Postfix Evaluator (Extension)

Build an expression tree from a postfix string using a stack. Evaluate and compare.

---

## Part 4: Binary Tree Properties

### Exercise 4.1: Basic Recursion

```java
public static int size(TreeNode root) { /* TODO */ }
public static int height(TreeNode root) { /* TODO */ }
public static int countLeaves(TreeNode root) { /* TODO */ }
public static int countInternal(TreeNode root) { /* TODO */ }
```

### Exercise 4.2: Full Binary Tree Verification

Build full binary trees of heights 0–6. Verify:
- `size == 2^(h+1) - 1`
- `countLeaves == countInternal + 1`

### Exercise 4.3: Mirror

```java
public static TreeNode mirror(TreeNode root) { /* TODO */ }
```

Verify: `size(mirror(T)) == size(T)` and `height(mirror(T)) == height(T)`.

---

## Extension Challenges

**E1.** Implement Towers of Hanoi. Verify $T(n) = 2^n - 1$ moves for $n = 1$ to 20.

**E2.** Generate all binary trees with $n$ nodes (Catalan number). Count and compare with $C_n$.

---

## Starter Code

```java
import java.util.*;

public class Module6Lab {

    // ====== Part 1 ======

    public static long sumIterative(int n) { return 0; /* TODO */ }
    public static long sumRecursive(int n) { return 0; /* TODO */ }
    public static long sumFormula(int n) { return 0; /* TODO */ }

    public static long sumSquaresIterative(int n) { return 0; /* TODO */ }
    public static long sumSquaresFormula(int n) { return 0; /* TODO */ }

    public static double geometricSumIterative(double r, int n) { return 0; /* TODO */ }
    public static double geometricSumFormula(double r, int n) { return 0; /* TODO */ }

    // ====== Part 2 ======

    public static long fibNaive(int n) { return 0; /* TODO */ }
    public static long fibIterative(int n) { return 0; /* TODO */ }
    public static long fibMemoized(int n) { return 0; /* TODO */ }

    // ====== Part 3 ======

    interface Expr {
        int eval();
        int size();
        int ops();
        String toInfix();
    }

    // TODO: Implement IntLit, Add, Mul

    // ====== Part 4 ======

    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int value) { this.value = value; }
        TreeNode(int value, TreeNode left, TreeNode right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }

    public static int size(TreeNode root) { return 0; /* TODO */ }
    public static int height(TreeNode root) { return -1; /* TODO */ }
    public static int countLeaves(TreeNode root) { return 0; /* TODO */ }
    public static int countInternal(TreeNode root) { return 0; /* TODO */ }
    public static TreeNode mirror(TreeNode root) { return null; /* TODO */ }

    public static TreeNode buildFullTree(int height, int[] counter) {
        if (height < 0) return null;
        TreeNode node = new TreeNode(counter[0]++);
        if (height > 0) {
            node.left = buildFullTree(height - 1, counter);
            node.right = buildFullTree(height - 1, counter);
        }
        return node;
    }

    // ====== Main ======

    public static void main(String[] args) {
        System.out.println("=== Module 6 Lab ===\n");

        // Part 1
        System.out.println("--- Part 1: Summation Formulas ---");
        // TODO

        // Part 2
        System.out.println("\n--- Part 2: Fibonacci ---");
        // TODO

        // Part 3
        System.out.println("\n--- Part 3: Expression Trees ---");
        // TODO

        // Part 4
        System.out.println("\n--- Part 4: Binary Trees ---");
        // TODO
    }
}
```

---

## Solution Key

```java
import java.util.*;

public class Module6LabSolution {

    // ====== Part 1 ======

    public static long sumIterative(int n) {
        long sum = 0;
        for (int i = 1; i <= n; i++) sum += i;
        return sum;
    }

    public static long sumRecursive(int n) {
        if (n <= 0) return 0;
        return sumRecursive(n - 1) + n;
    }

    public static long sumFormula(int n) {
        return (long) n * (n + 1) / 2;
    }

    public static long sumSquaresIterative(int n) {
        long sum = 0;
        for (int i = 1; i <= n; i++) sum += (long) i * i;
        return sum;
    }

    public static long sumSquaresFormula(int n) {
        return (long) n * (n + 1) * (2 * n + 1) / 6;
    }

    public static double geometricSumIterative(double r, int n) {
        double sum = 0;
        for (int i = 0; i <= n; i++) sum += Math.pow(r, i);
        return sum;
    }

    public static double geometricSumFormula(double r, int n) {
        if (Math.abs(r - 1.0) < 1e-10) return n + 1;
        return (Math.pow(r, n + 1) - 1) / (r - 1);
    }

    // ====== Part 2 ======

    public static long fibNaive(int n) {
        if (n <= 0) return 0;
        if (n == 1) return 1;
        return fibNaive(n - 1) + fibNaive(n - 2);
    }

    public static long fibIterative(int n) {
        if (n <= 0) return 0;
        long prev = 0, curr = 1;
        for (int i = 2; i <= n; i++) {
            long next = prev + curr;
            prev = curr;
            curr = next;
        }
        return curr;
    }

    public static long fibMemoized(int n) {
        if (n <= 0) return 0;
        long[] dp = new long[n + 1];
        dp[0] = 0;
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }

    // ====== Part 3 ======

    interface Expr {
        int eval();
        int size();
        int ops();
        String toInfix();
    }

    static class IntLit implements Expr {
        final int value;
        IntLit(int v) { this.value = v; }
        public int eval() { return value; }
        public int size() { return 1; }
        public int ops() { return 0; }
        public String toInfix() { return String.valueOf(value); }
    }

    static class Add implements Expr {
        final Expr left, right;
        Add(Expr l, Expr r) { left = l; right = r; }
        public int eval() { return left.eval() + right.eval(); }
        public int size() { return left.size() + right.size() + 1; }
        public int ops() { return left.ops() + right.ops() + 1; }
        public String toInfix() { return "(" + left.toInfix() + " + " + right.toInfix() + ")"; }
    }

    static class Mul implements Expr {
        final Expr left, right;
        Mul(Expr l, Expr r) { left = l; right = r; }
        public int eval() { return left.eval() * right.eval(); }
        public int size() { return left.size() + right.size() + 1; }
        public int ops() { return left.ops() + right.ops() + 1; }
        public String toInfix() { return "(" + left.toInfix() + " * " + right.toInfix() + ")"; }
    }

    // ====== Part 4 ======

    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int v) { this.value = v; }
        TreeNode(int v, TreeNode l, TreeNode r) { value = v; left = l; right = r; }
    }

    public static int size(TreeNode root) {
        if (root == null) return 0;
        return 1 + size(root.left) + size(root.right);
    }

    public static int height(TreeNode root) {
        if (root == null) return -1;
        return 1 + Math.max(height(root.left), height(root.right));
    }

    public static int countLeaves(TreeNode root) {
        if (root == null) return 0;
        if (root.left == null && root.right == null) return 1;
        return countLeaves(root.left) + countLeaves(root.right);
    }

    public static int countInternal(TreeNode root) {
        if (root == null) return 0;
        if (root.left == null && root.right == null) return 0;
        return 1 + countInternal(root.left) + countInternal(root.right);
    }

    public static TreeNode mirror(TreeNode root) {
        if (root == null) return null;
        return new TreeNode(root.value, mirror(root.right), mirror(root.left));
    }

    public static TreeNode buildFullTree(int h, int[] counter) {
        if (h < 0) return null;
        TreeNode node = new TreeNode(counter[0]++);
        if (h > 0) {
            node.left = buildFullTree(h - 1, counter);
            node.right = buildFullTree(h - 1, counter);
        }
        return node;
    }

    // ====== Main ======

    public static void main(String[] args) {
        System.out.println("=== Module 6 Lab — Solution ===\n");

        // --- Part 1 ---
        System.out.println("--- Part 1: Summation Formulas ---");
        for (int n : new int[]{1, 10, 100, 1000}) {
            assert sumIterative(n) == sumFormula(n);
            assert sumSquaresIterative(n) == sumSquaresFormula(n);
            System.out.printf("n=%d: sum=%d, sumSq=%d%n", n, sumFormula(n), sumSquaresFormula(n));
        }
        for (double r : new double[]{2.0, 3.0, 0.5}) {
            double iter = geometricSumIterative(r, 10);
            double form = geometricSumFormula(r, 10);
            System.out.printf("Geo(r=%.1f, n=10): iter=%.2f, formula=%.2f%n", r, iter, form);
            assert Math.abs(iter - form) < 1e-6;
        }

        // --- Part 2 ---
        System.out.println("\n--- Part 2: Fibonacci ---");
        for (int n = 0; n <= 15; n++) {
            long fI = fibIterative(n);
            long fM = fibMemoized(n);
            System.out.printf("F(%d) = %d (iter=%d, memo=%d)%n", n, fibNaive(n), fI, fM);
        }
        // Timing
        long t1 = System.currentTimeMillis();
        long fib40Naive = fibNaive(35); // using 35 to keep reasonable
        long t2 = System.currentTimeMillis();
        long fib40Iter = fibIterative(35);
        long t3 = System.currentTimeMillis();
        System.out.printf("\nF(35) naive: %d (%d ms)%n", fib40Naive, t2 - t1);
        System.out.printf("F(35) iter:  %d (%d ms)%n", fib40Iter, t3 - t2);

        // Verify bound
        System.out.println("\nVerifying F(n) < 2^n:");
        for (int n = 0; n <= 60; n++) {
            assert fibIterative(n) < (1L << n);
        }
        System.out.println("  Verified for n = 0..60");

        // --- Part 3 ---
        System.out.println("\n--- Part 3: Expression Trees ---");
        Expr e = new Mul(new Add(new IntLit(3), new IntLit(5)),
                         new Add(new IntLit(2), new IntLit(4)));
        System.out.println("Expr: " + e.toInfix());
        System.out.println("  eval = " + e.eval());
        System.out.println("  size = " + e.size() + ", ops = " + e.ops());
        System.out.println("  size == 2*ops+1? " + (e.size() == 2 * e.ops() + 1));

        // More expression tests
        Expr e2 = new Add(new Mul(new IntLit(2), new IntLit(7)),
                          new IntLit(1)); // (2*7)+1 = 15
        System.out.println("Expr: " + e2.toInfix() + " = " + e2.eval());
        assert e2.size() == 2 * e2.ops() + 1;

        // --- Part 4 ---
        System.out.println("\n--- Part 4: Binary Trees ---");
        for (int h = 0; h <= 5; h++) {
            TreeNode t = buildFullTree(h, new int[]{1});
            int s = size(t);
            int ht = height(t);
            int leaves = countLeaves(t);
            int internal = countInternal(t);
            System.out.printf("h=%d: size=%d, height=%d, leaves=%d, internal=%d, L=I+1? %b%n",
                    h, s, ht, leaves, internal, leaves == internal + 1);
            assert s == (1 << (h + 1)) - 1;
            assert leaves == internal + 1;

            // Mirror
            TreeNode m = mirror(t);
            assert size(m) == s;
            assert height(m) == ht;
        }
        System.out.println("All tree properties verified!");
    }
}
```

---

## Verification Checklist

- [ ] Sum formulas agree (iterative, recursive, closed-form) for $n = 1$ to 10000
- [ ] Fibonacci: three implementations agree; naive is measurably slower
- [ ] $F_n < 2^n$ verified up to $n = 60$
- [ ] Expression trees: `eval`, `size`, `ops` correct; `size == 2*ops + 1`
- [ ] Binary trees: `size`, `height`, `countLeaves`, `countInternal` correct
- [ ] Full binary trees: $L = I + 1$ and $\text{nodes} = 2^{h+1} - 1$ verified
- [ ] Mirror preserves size and height
