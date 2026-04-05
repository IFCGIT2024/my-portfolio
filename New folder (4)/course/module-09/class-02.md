# Module 9 – Class 2: Properties of Full and Balanced Binary Trees

## Learning Objectives

- Prove the full binary tree theorem ($L = I + 1$) and total node count ($N = 2I + 1$).
- Define balanced binary trees and analyze their height bounds.
- Implement methods to check fullness and balance.
- Connect tree properties to complexity analysis ($O(\log n)$ vs $O(n)$).
- Apply structural induction and counting (Modules 6–7) to tree theorems.

---

## Concept Overview

### Full Binary Trees

A binary tree is **full** if every node has either 0 or 2 children. No node has exactly one child.

**Fundamental properties of a full binary tree:**

| Property | Formula |
|----------|---------|
| Leaves | $L = I + 1$ |
| Total nodes | $N = 2I + 1 = 2L - 1$ |
| Internal nodes | $I = L - 1 = (N - 1) / 2$ |

### Complete Binary Trees

A binary tree is **complete** if every level except possibly the last is full, and the last level is filled from left to right.

For a complete binary tree of height $h$:
$$2^h \leq N \leq 2^{h+1} - 1$$

### Balanced Binary Trees

A binary tree is **balanced** (height-balanced) if for every node, the heights of the left and right subtrees differ by at most 1:

$$|h(T.L) - h(T.R)| \leq 1 \quad \text{for all nodes}$$

### Height Bounds

| Tree type | Height bound | Search time |
|-----------|-------------|-------------|
| Degenerate (linked list) | $h = n - 1$ | $O(n)$ |
| Balanced | $h = O(\log n)$ | $O(\log n)$ |
| Complete | $h = \lfloor \log_2 n \rfloor$ | $O(\log n)$ |
| Full, height $h$ | $n = 2^{h+1} - 1$ | $O(\log n)$ |

**Key insight:** Balancing a BST keeps height $O(\log n)$, ensuring efficient operations.

---

## Formal Notation

| Symbol | Definition |
|--------|-----------|
| $L(T)$ | Number of leaves in tree $T$ |
| $I(T)$ | Number of internal nodes |
| $N(T)$ | Total nodes = $L(T) + I(T)$ |
| $h(T)$ | Height of tree $T$ |

---

## Worked Examples

### Example 1: Full Binary Tree Theorem ($L = I + 1$)

**Proof by structural induction.**

**Base:** Single node: $L = 1, I = 0, L = I + 1$. ✓

**Inductive step:** $T$ has root with children $T_L, T_R$ (both non-empty since $T$ is full).

By IH: $L(T_L) = I(T_L) + 1$ and $L(T_R) = I(T_R) + 1$.

$$L(T) = L(T_L) + L(T_R) = (I(T_L) + 1) + (I(T_R) + 1) = I(T_L) + I(T_R) + 2$$

$$I(T) = I(T_L) + I(T_R) + 1$$

$$L(T) = I(T) + 1$$ $\blacksquare$

### Example 2: Total Nodes = $2I + 1$

$$N = L + I = (I + 1) + I = 2I + 1$$

Equivalently: $N = 2L - 1$.

### Example 3: Height Bound for Balanced Trees

**Claim:** A balanced binary tree with $n$ nodes has height $h \leq 1.44 \log_2(n+1)$.

**Sketch:** Let $N(h)$ be the minimum number of nodes in a balanced tree of height $h$. Then:

$$N(h) = N(h-1) + N(h-2) + 1$$

This is similar to Fibonacci! In fact, $N(h) = F_{h+2} - 1$ where $F$ is the Fibonacci sequence. Since $F_k \approx \phi^k / \sqrt{5}$, we get $n \geq \phi^h / \sqrt{5}$, giving $h = O(\log_\phi n) = O(1.44 \log_2 n)$.

### Example 4: Complete Binary Tree Node Count

A complete binary tree of height $h = 3$ has between $2^3 = 8$ and $2^4 - 1 = 15$ nodes.

A complete binary tree with $n = 10$ nodes has height $h = \lfloor \log_2 10 \rfloor = 3$.

### Example 5: Verifying Properties Computationally

For a full tree of height 4:
- $N = 2^5 - 1 = 31$
- $L = 2^4 = 16$
- $I = 15$
- $L = I + 1$? $16 = 15 + 1$. ✓

---

## Proof Techniques Spotlight

### Structural Induction on Trees (Revisited)

For full binary trees, the induction is cleaner because every internal node has exactly two children. The inductive step always has two subtrees to work with.

### Counting Nodes by Level

For a complete binary tree: level $k$ has $2^k$ nodes (for $0 \leq k < h$), and level $h$ has between 1 and $2^h$ nodes. Total:

$$\sum_{k=0}^{h-1} 2^k + \text{(last level)} = 2^h - 1 + \text{(last level)}$$

This uses the geometric series from Module 6.

---

## Java Deep Dive

```java
import java.util.*;

public class TreeProperties {

    static class TreeNode {
        int value;
        TreeNode left, right;

        TreeNode(int v) { this.value = v; }
        TreeNode(int v, TreeNode l, TreeNode r) {
            this.value = v; this.left = l; this.right = r;
        }
    }

    // --- Size ---
    public static int size(TreeNode t) {
        if (t == null) return 0;
        return 1 + size(t.left) + size(t.right);
    }

    // --- Height ---
    public static int height(TreeNode t) {
        if (t == null) return -1;
        return 1 + Math.max(height(t.left), height(t.right));
    }

    // --- Count Leaves ---
    public static int countLeaves(TreeNode t) {
        if (t == null) return 0;
        if (t.left == null && t.right == null) return 1;
        return countLeaves(t.left) + countLeaves(t.right);
    }

    // --- Count Internal Nodes ---
    public static int countInternal(TreeNode t) {
        if (t == null) return 0;
        if (t.left == null && t.right == null) return 0;
        return 1 + countInternal(t.left) + countInternal(t.right);
    }

    // --- Is Full ---
    public static boolean isFull(TreeNode t) {
        if (t == null) return true; // empty tree is vacuously full
        if (t.left == null && t.right == null) return true;
        if (t.left == null || t.right == null) return false;
        return isFull(t.left) && isFull(t.right);
    }

    // --- Is Balanced ---
    public static boolean isBalanced(TreeNode t) {
        return balancedHeight(t) != -2;
    }

    // Returns height if balanced, -2 if not
    private static int balancedHeight(TreeNode t) {
        if (t == null) return -1;
        int lh = balancedHeight(t.left);
        if (lh == -2) return -2;
        int rh = balancedHeight(t.right);
        if (rh == -2) return -2;
        if (Math.abs(lh - rh) > 1) return -2;
        return 1 + Math.max(lh, rh);
    }

    // --- Is Complete ---
    public static boolean isComplete(TreeNode t) {
        if (t == null) return true;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(t);
        boolean seenNull = false;
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (node == null) {
                seenNull = true;
            } else {
                if (seenNull) return false;
                queue.add(node.left);
                queue.add(node.right);
            }
        }
        return true;
    }

    // --- Build Full Tree ---
    public static TreeNode buildFull(int height) {
        if (height < 0) return null;
        if (height == 0) return new TreeNode(0);
        return new TreeNode(0, buildFull(height - 1), buildFull(height - 1));
    }

    // --- Build Balanced BST from Sorted Array ---
    public static TreeNode buildBalancedBST(int[] sorted, int lo, int hi) {
        if (lo > hi) return null;
        int mid = lo + (hi - lo) / 2;
        return new TreeNode(sorted[mid],
                buildBalancedBST(sorted, lo, mid - 1),
                buildBalancedBST(sorted, mid + 1, hi));
    }

    // --- Verify Full Binary Tree Theorem ---
    public static void verifyFullTreeTheorem(int maxHeight) {
        for (int h = 0; h <= maxHeight; h++) {
            TreeNode t = buildFull(h);
            int n = size(t);
            int l = countLeaves(t);
            int i = countInternal(t);
            assert l == i + 1 : "L != I+1 for h=" + h;
            assert n == 2 * i + 1 : "N != 2I+1 for h=" + h;
            assert n == (int) Math.pow(2, h + 1) - 1 : "N != 2^(h+1)-1";
            assert l == (int) Math.pow(2, h) : "L != 2^h";
            System.out.printf("h=%d: N=%d, L=%d, I=%d, L=I+1? %b, N=2I+1? %b%n",
                    h, n, l, i, l == i + 1, n == 2 * i + 1);
        }
    }

    // --- Demo ---
    public static void main(String[] args) {
        System.out.println("=== Tree Properties ===\n");

        // Full tree verification
        System.out.println("--- Full Binary Tree Theorem ---");
        verifyFullTreeTheorem(6);

        // Balanced BST
        System.out.println("\n--- Balanced BST ---");
        int[] sorted = {1, 3, 5, 7, 9, 11, 13, 15};
        TreeNode bst = buildBalancedBST(sorted, 0, sorted.length - 1);
        System.out.println("Size: " + size(bst));
        System.out.println("Height: " + height(bst));
        System.out.println("Balanced? " + isBalanced(bst));
        System.out.println("Full? " + isFull(bst));
        System.out.println("Complete? " + isComplete(bst));

        // Degenerate tree (linked list)
        System.out.println("\n--- Degenerate Tree ---");
        TreeNode degenerate = new TreeNode(1,
                new TreeNode(2, new TreeNode(3, new TreeNode(4), null), null), null);
        System.out.println("Size: " + size(degenerate));
        System.out.println("Height: " + height(degenerate));
        System.out.println("Balanced? " + isBalanced(degenerate));

        // Height vs size comparison
        System.out.println("\n--- Height Comparison ---");
        for (int h = 0; h <= 10; h++) {
            TreeNode full = buildFull(h);
            System.out.printf("Full tree h=%2d: n=%5d, balanced=%b%n",
                    h, size(full), isBalanced(full));
        }
    }
}
```

---

## Historical Context

**AVL trees** (Adelson-Velsky and Landis, 1962) were the first self-balancing binary search trees. Their balance condition (height difference $\leq 1$) guarantees $O(\log n)$ operations.

**Red-black trees** (Rudolf Bayer, 1972; given this name by Guibas and Sedgewick, 1978) use a coloring scheme to maintain approximate balance, guaranteeing height $\leq 2 \log_2(n + 1)$.

The **full binary tree theorem** ($L = I + 1$) appears in virtually every data structures textbook and is a classic exercise in structural induction.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** Define full, complete, and balanced binary trees. Give an example of each.

**A2.** For a full binary tree with 15 nodes, how many leaves and internal nodes?

**A3.** What is the maximum and minimum height of a binary tree with 100 nodes?

**A4.** Why does height $O(\log n)$ matter for BST operations?

### Slide Set B: Proof Problems

**B1.** Prove $L = I + 1$ for full binary trees by structural induction.

**B2.** Prove: a complete binary tree of height $h$ has between $2^h$ and $2^{h+1} - 1$ nodes.

**B3.** Prove: the minimum number of nodes in a balanced tree of height $h$ satisfies $N(h) = N(h-1) + N(h-2) + 1$.

### Slide Set C: Java Coding Problems

**C1.** Implement `isFull`, `isBalanced`, `isComplete` for binary trees.

**C2.** Build a full binary tree of height $h$ and verify $N = 2^{h+1} - 1$.

**C3.** Build a balanced BST from a sorted array and verify $h = O(\log n)$.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Prove: in a full binary tree, $N = 2L - 1$.

**DM2.** Prove: a binary tree with $n$ nodes has $n + 1$ null pointers.

**DM3.** Prove: for a complete binary tree of height $h$, the number of nodes at level $k$ ($0 \leq k < h$) is exactly $2^k$.

**DM4.** Show: the minimum number of nodes in a balanced tree of height $h$ is $N(h) = F_{h+3} - 1$ (where $F$ is Fibonacci). Verify for $h = 0, ..., 5$.

**DM5.** Prove by induction: a full binary tree of height $h$ has exactly $2^h$ leaves.

### Java Programming Problems

**JP1.** Implement all tree property methods: size, height, countLeaves, countInternal, isFull, isBalanced, isComplete.

**JP2.** Build full trees of heights 0–10 and verify all properties of the full binary tree theorem.

**JP3.** Build balanced BSTs from sorted arrays of sizes 1, 3, 7, 15, 31, 63, 127. Verify heights are optimal.

**JP4.** Create a degenerate (linked-list) tree with $n$ nodes. Compare its height with a balanced tree of the same size.

**JP5.** Implement `buildMinBalanced(int h)` that constructs a balanced tree with the *minimum* number of nodes for height $h$. Verify it matches $F_{h+3} - 1$.

### Bridge Problems

**BR1.** Module 7: The number of binary trees with $n$ nodes is the $n$-th Catalan number $C_n = \frac{1}{n+1}\binom{2n}{n}$. Compute $C_n$ for $n = 0, ..., 10$ using your binomial function from Module 7.

**BR2.** Module 6: The proof of $L = I + 1$ uses structural induction, which you first learned in Module 6 Class 3. Compare the technique here with the expression tree proof from that class.

---

## Solutions

### DM1 Solution

$N = L + I$. By the full binary tree theorem, $L = I + 1$. So $N = (I + 1) + I = 2I + 1 = 2(L - 1) + 1 = 2L - 1$. $\blacksquare$

### DM2 Solution

Each of the $n$ nodes has 2 pointers (left, right). Total pointers: $2n$. Each non-root node is pointed to by exactly one parent pointer. Parent pointers used: $n - 1$. Null pointers: $2n - (n - 1) = n + 1$. $\blacksquare$

### DM5 Solution

**Base:** $h = 0$: a single node is a leaf. $L = 1 = 2^0$. ✓

**Inductive step:** Assume a full binary tree of height $h$ has $2^h$ leaves. A full tree of height $h + 1$ has a root whose left and right subtrees are full trees of height $\leq h$. In a *full* tree of height exactly $h + 1$, at least one subtree has height $h$. If both are full trees of height $h$, then $L = 2^h + 2^h = 2^{h+1}$. ✓ $\blacksquare$

(Note: more precisely, a "perfect" binary tree of height $h$ has all leaves at level $h$; a "full" tree only requires every node to have 0 or 2 children. For perfect trees, $L = 2^h$ exactly.)
