# Module 6 – Class 3: Recursive Sets and Structural Induction

## Learning Objectives

- Define sets and data structures recursively (arithmetic expressions, binary trees).
- Apply structural induction to prove properties of recursively defined objects.
- Connect structural induction to recursive program correctness.
- Implement recursive data structures in Java and prove properties about them.

---

## Concept Overview

### Recursively Defined Sets

A set $S$ is **recursively defined** by:
1. **Basis:** Specify initial elements in $S$.
2. **Recursive rule:** Specify how to build new elements from existing ones.
3. **Closure:** $S$ contains only elements obtained by finitely many applications of the basis and rules.

### Example: Arithmetic Expressions

$$E ::= n \mid (E + E) \mid (E \times E)$$

- **Basis:** Any integer $n$ is an expression.
- **Recursive rules:** If $e_1, e_2$ are expressions, so are $(e_1 + e_2)$ and $(e_1 \times e_2)$.

### Example: Binary Trees

$$T ::= \text{null} \mid \text{Node}(v, T, T)$$

- **Basis:** `null` is a binary tree (the empty tree).
- **Recursive rule:** If $T_L$ and $T_R$ are binary trees and $v$ is a value, then $\text{Node}(v, T_L, T_R)$ is a binary tree.

### Structural Induction

To prove a property $P$ holds for all elements of a recursively defined set:

1. **Base case(s):** Prove $P$ for each basis element.
2. **Inductive step:** For each recursive rule, assume $P$ holds for the sub-components (inductive hypothesis). Prove $P$ for the new element.

Structural induction generalizes mathematical induction from natural numbers to arbitrary recursively defined structures.

### The Pattern

| Mathematical Induction | Structural Induction |
|----------------------|---------------------|
| Prove for $n_0$ | Prove for basis elements |
| Assume $P(k)$, prove $P(k+1)$ | Assume $P$ for sub-structures, prove $P$ for composite |
| Works on $\mathbb{N}$ | Works on any recursive definition |

---

## Formal Notation

For binary trees with the definition $T ::= \text{null} \mid \text{Node}(v, L, R)$:

$$\left[P(\text{null}) \;\wedge\; \forall v, L, R:\; (P(L) \wedge P(R)) \to P(\text{Node}(v, L, R))\right] \implies \forall T:\; P(T)$$

---

## Worked Examples

### Example 1: Full Binary Tree Theorem

**Claim:** In a non-empty full binary tree (every node has 0 or 2 children), the number of leaves $L$ equals the number of internal nodes $I$ plus one: $L = I + 1$.

**Proof by structural induction.**

*Base case:* A single node (no children). $L = 1, I = 0$. $1 = 0 + 1$. ✓

*Inductive step:* A full binary tree $T = \text{Node}(v, T_L, T_R)$ where both $T_L, T_R$ are non-empty full binary trees (since the root has 2 children).

By hypothesis: $L_L = I_L + 1$ and $L_R = I_R + 1$.

For $T$: $L = L_L + L_R$ (leaves come from subtrees), $I = I_L + I_R + 1$ (internal nodes of subtrees plus root).

$$L = (I_L + 1) + (I_R + 1) = I_L + I_R + 2 = (I_L + I_R + 1) + 1 = I + 1$$

✓ $\blacksquare$

### Example 2: Size of an Expression Tree

Define $\text{size}(e)$ recursively:
- $\text{size}(n) = 1$ for any integer $n$.
- $\text{size}(e_1 \oplus e_2) = \text{size}(e_1) + \text{size}(e_2) + 1$ for $\oplus \in \{+, \times\}$.

**Claim:** $\text{size}(e) = 2 \cdot \text{ops}(e) + 1$, where $\text{ops}(e)$ is the number of operations.

*Base:* $\text{size}(n) = 1, \text{ops}(n) = 0$. $1 = 2(0) + 1$. ✓

*Inductive step:* $\text{size}(e_1 \oplus e_2) = \text{size}(e_1) + \text{size}(e_2) + 1 = (2\text{ops}(e_1)+1) + (2\text{ops}(e_2)+1) + 1 = 2(\text{ops}(e_1) + \text{ops}(e_2) + 1) + 1 = 2\text{ops}(e_1 \oplus e_2) + 1$. ✓ $\blacksquare$

### Example 3: Evaluator Correctness

Define `eval` on expression trees:

```
eval(IntLit(n)) = n
eval(Add(e1, e2)) = eval(e1) + eval(e2)
eval(Mul(e1, e2)) = eval(e1) * eval(e2)
```

**Claim:** `eval` computes the standard mathematical value of the expression.

This follows directly from structural induction: the base case agrees with the math, and each recursive case combines results correctly because addition and multiplication on Java `int` match the mathematical operations (within overflow bounds). $\blacksquare$

### Example 4: Number of Nodes in a Binary Tree

**Claim:** `size(null) = 0` and `size(Node(v, L, R)) = 1 + size(L) + size(R)` correctly returns the number of nodes.

*Base:* `size(null) = 0`. An empty tree has 0 nodes. ✓

*Inductive step:* Assume `size(L)` returns the node count of $L$ and `size(R)` returns the node count of $R$. Then `1 + size(L) + size(R)` counts the root plus all nodes in the subtrees. ✓ $\blacksquare$

### Example 5: Height and Node Count

**Claim:** A binary tree of height $h$ has at most $2^{h+1} - 1$ nodes.

*Base ($h = 0$):* A tree of height 0 is a single node: $1 \leq 2^1 - 1 = 1$. ✓

*Inductive step:* A tree of height $h+1$ has a root with subtrees of height $\leq h$. By hypothesis, each subtree has $\leq 2^{h+1} - 1$ nodes. Total: $\leq 1 + 2(2^{h+1} - 1) = 2^{h+2} - 1$. ✓ $\blacksquare$

---

## Proof Techniques Spotlight

### The Structural Induction Template

1. **Identify** the recursively defined set/structure.
2. **State** the property $P$ to prove.
3. **Base case(s):** Verify $P$ for each basis element.
4. **Inductive step:** For each constructor/rule, assume $P$ for sub-components, prove for the whole.
5. **Conclude:** By structural induction.

### Common Pitfall: Missing Constructors

If the recursive definition has multiple rules (e.g., `Add` and `Mul`), the inductive step must handle **each** rule separately.

---

## Java Deep Dive

```java
import java.util.*;

public class StructuralInductionLibrary {

    // ===== Arithmetic Expression Trees =====

    interface Expr {
        int eval();
        int size();
        int ops();
        String toInfix();
    }

    static class IntLit implements Expr {
        final int value;
        IntLit(int value) { this.value = value; }

        public int eval() { return value; }
        public int size() { return 1; }
        public int ops() { return 0; }
        public String toInfix() { return String.valueOf(value); }
    }

    static class Add implements Expr {
        final Expr left, right;
        Add(Expr left, Expr right) {
            this.left = left;
            this.right = right;
        }

        public int eval() { return left.eval() + right.eval(); }
        public int size() { return left.size() + right.size() + 1; }
        public int ops() { return left.ops() + right.ops() + 1; }
        public String toInfix() {
            return "(" + left.toInfix() + " + " + right.toInfix() + ")";
        }
    }

    static class Mul implements Expr {
        final Expr left, right;
        Mul(Expr left, Expr right) {
            this.left = left;
            this.right = right;
        }

        public int eval() { return left.eval() * right.eval(); }
        public int size() { return left.size() + right.size() + 1; }
        public int ops() { return left.ops() + right.ops() + 1; }
        public String toInfix() {
            return "(" + left.toInfix() + " * " + right.toInfix() + ")";
        }
    }

    // ===== Binary Tree =====

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

    /**
     * Size: number of nodes.
     * Correctness by structural induction (Example 4 above).
     */
    static int size(TreeNode root) {
        if (root == null) return 0;
        return 1 + size(root.left) + size(root.right);
    }

    /**
     * Height: length of longest root-to-leaf path.
     * Height of empty tree is -1 (convention).
     */
    static int height(TreeNode root) {
        if (root == null) return -1;
        return 1 + Math.max(height(root.left), height(root.right));
    }

    /**
     * Count leaves.
     * In a full binary tree: leaves = internal + 1.
     */
    static int countLeaves(TreeNode root) {
        if (root == null) return 0;
        if (root.left == null && root.right == null) return 1;
        return countLeaves(root.left) + countLeaves(root.right);
    }

    /**
     * Count internal nodes (nodes with at least one child).
     */
    static int countInternal(TreeNode root) {
        if (root == null) return 0;
        if (root.left == null && root.right == null) return 0;
        return 1 + countInternal(root.left) + countInternal(root.right);
    }

    /**
     * Check if a tree is full (every node has 0 or 2 children).
     */
    static boolean isFull(TreeNode root) {
        if (root == null) return true;
        boolean hasLeft = root.left != null;
        boolean hasRight = root.right != null;
        if (hasLeft != hasRight) return false; // exactly one child
        return isFull(root.left) && isFull(root.right);
    }

    /**
     * Build a complete full binary tree of given height.
     */
    static TreeNode buildFullTree(int height, int[] counter) {
        if (height < 0) return null;
        TreeNode node = new TreeNode(counter[0]++);
        if (height > 0) {
            node.left = buildFullTree(height - 1, counter);
            node.right = buildFullTree(height - 1, counter);
        }
        return node;
    }

    /**
     * Inorder traversal.
     */
    static List<Integer> inorder(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        inorderHelper(root, result);
        return result;
    }

    private static void inorderHelper(TreeNode root, List<Integer> result) {
        if (root == null) return;
        inorderHelper(root.left, result);
        result.add(root.value);
        inorderHelper(root.right, result);
    }

    // ===== Demonstration =====

    public static void main(String[] args) {
        System.out.println("=== Structural Induction Library ===\n");

        // --- Expression Trees ---
        // (3 + 5) * (2 + 4) = 8 * 6 = 48
        Expr expr = new Mul(
                new Add(new IntLit(3), new IntLit(5)),
                new Add(new IntLit(2), new IntLit(4))
        );
        System.out.println("Expression: " + expr.toInfix());
        System.out.println("  eval = " + expr.eval());
        System.out.println("  size = " + expr.size());
        System.out.println("  ops  = " + expr.ops());
        System.out.println("  size == 2*ops + 1? " + (expr.size() == 2 * expr.ops() + 1));

        // --- Binary Trees ---
        System.out.println("\nFull binary tree (height 3):");
        TreeNode tree = buildFullTree(3, new int[]{1});
        System.out.println("  Size:     " + size(tree));
        System.out.println("  Height:   " + height(tree));
        System.out.println("  Leaves:   " + countLeaves(tree));
        System.out.println("  Internal: " + countInternal(tree));
        System.out.println("  Full:     " + isFull(tree));
        System.out.println("  L = I+1?  " + (countLeaves(tree) == countInternal(tree) + 1));
        System.out.println("  Inorder:  " + inorder(tree));

        // Verify properties for full trees of various heights
        System.out.println("\nVerifying full binary tree properties:");
        for (int h = 0; h <= 6; h++) {
            TreeNode t = buildFullTree(h, new int[]{1});
            int s = size(t);
            int leaves = countLeaves(t);
            int internal = countInternal(t);
            int expectedNodes = (1 << (h + 1)) - 1; // 2^(h+1) - 1
            System.out.printf("  h=%d: nodes=%d (exp %d), leaves=%d, internal=%d, L=I+1? %b%n",
                    h, s, expectedNodes, leaves, internal, leaves == internal + 1);
            assert s == expectedNodes;
            assert leaves == internal + 1;
        }
    }
}
```

---

## Historical Context

**Structural induction** emerged from the formalization of recursive definitions in **mathematical logic** and **formal language theory** in the 20th century. **Stephen Kleene** and **Alonzo Church** studied recursive functions in the 1930s, laying the groundwork for both recursion theory and programming.

**Context-free grammars** (Chomsky, 1956) define languages recursively, and proofs about parse trees use structural induction. Every compiler course relies on these ideas.

The connection between recursive data structures and structural induction was made explicit in **type theory** (Martin-Löf, 1970s), where induction principles are automatically generated from data type definitions — a practice now common in proof assistants like Coq, Agda, and Lean.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** How does structural induction differ from mathematical induction on $\mathbb{N}$?

**A2.** Give the recursive definition of a binary tree.

**A3.** For the expression $(3 + (5 \times 2))$, draw the tree and compute `eval`, `size`, and `ops`.

**A4.** Why do we need a base case for `null` trees?

### Slide Set B: Proof Problems

**B1.** Prove by structural induction: in any binary tree, the number of `null` pointers is one more than the number of nodes.

**B2.** Prove: `eval(Mul(e1, e2)) = eval(e1) * eval(e2)` correctly computes the product for all expressions $e_1, e_2$.

**B3.** Prove: a full binary tree of height $h$ has exactly $2^{h+1} - 1$ nodes.

### Slide Set C: Java Coding Problems

**C1.** Implement the `Expr` interface with `IntLit`, `Add`, and `Mul`. Add a `Sub` variant.

**C2.** Write `countLeaves` and `countInternal` for binary trees. Verify $L = I + 1$ on full trees.

**C3.** Implement a method that builds an expression tree from a postfix string (e.g., `"3 5 + 2 *"`) and evaluates it.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Give a recursive definition of the set of all balanced parentheses strings. Prove by structural induction that every string in the set has equal numbers of `(` and `)`.

**DM2.** Prove by structural induction: the number of `null` children in a binary tree with $n$ nodes is $n + 1$.

**DM3.** Define the **depth** of an expression: $\text{depth}(n) = 0$, $\text{depth}(e_1 \oplus e_2) = 1 + \max(\text{depth}(e_1), \text{depth}(e_2))$. Prove: $\text{ops}(e) \leq 2^{\text{depth}(e)} - 1$.

**DM4.** Prove by structural induction: the **mirror** of a binary tree (swap left and right at every node) preserves the number of nodes.

**DM5.** Prove: $\text{height}(T) \leq \text{size}(T) - 1$ for every non-empty binary tree $T$.

### Java Programming Problems

**JP1.** Implement `Expr` with `IntLit`, `Add`, `Mul`, `Sub`, `Div`. Add `eval()`, `size()`, `toInfix()`, `toPostfix()`.

**JP2.** Build a postfix expression evaluator using a stack. Verify it matches `eval()` on the tree.

**JP3.** Implement `mirror(TreeNode root)` that returns a new tree with left/right swapped. Verify `size(mirror(T)) == size(T)` and `height(mirror(T)) == height(T)`.

**JP4.** Implement `isBalanced(TreeNode root)` that returns true iff the heights of left and right subtrees differ by at most 1, recursively. Test on balanced and unbalanced trees.

**JP5.** Write a method that generates all binary trees with $n$ nodes (Catalan number enumeration). Count them and verify the count matches the $n$-th Catalan number $C_n = \frac{1}{n+1}\binom{2n}{n}$.

### Bridge Problems

**BR1.** From Module 4: the power set of an $n$-element set has $2^n$ elements (proved by induction in Class 1). Structural induction on a binary tree of decisions ($\in / \notin$) gives an alternative proof: each path from root to leaf corresponds to a subset.

**BR2.** From Module 5: functions from $A$ to $\{0,1\}$ correspond bijectively to subsets of $A$. Express this correspondence using expression trees: an expression `(x_1 AND x_2) OR (NOT x_3)` defines a subset of $\{0,1\}^3$ via its truth set. Implement and evaluate.

---

## Solutions

### Discrete Math Solutions

**DM1.** Recursive definition: (i) $\varepsilon$ (empty string) is balanced. (ii) If $s$ is balanced, then $(s)$ is balanced. (iii) If $s_1, s_2$ are balanced, then $s_1 s_2$ is balanced.

Proof: *Base:* $\varepsilon$ has 0 `(`s and 0 `)`s. ✓ *Rule (ii):* If $s$ has equal `(` and `)`, then $(s)$ adds one of each. ✓ *Rule (iii):* If $s_1$ and $s_2$ each have equal `(` and `)`, so does $s_1 s_2$. ✓ $\blacksquare$

**DM2.** *Base:* `null` tree has 0 nodes and 1 null child (itself). $0 + 1 = 1$. ✓

*Inductive step:* $\text{Node}(v, L, R)$ has $n = 1 + n_L + n_R$ nodes. By hypothesis, $L$ has $n_L + 1$ null children and $R$ has $n_R + 1$. The full tree has $n_L + 1 + n_R + 1 = n_L + n_R + 2 = (1 + n_L + n_R) + 1 = n + 1$. ✓ $\blacksquare$

**DM4.** *Base:* `mirror(null) = null`. Both have 0 nodes. ✓

*Inductive step:* `mirror(Node(v, L, R)) = Node(v, mirror(R), mirror(L))`. By hypothesis, `size(mirror(L)) = size(L)` and `size(mirror(R)) = size(R)`. So `size(mirror(T)) = 1 + size(mirror(R)) + size(mirror(L)) = 1 + size(R) + size(L) = size(T)`. ✓ $\blacksquare$
