# Module 9 – Class 1: Binary Trees and Recursion

## Learning Objectives

- Define binary trees recursively as a data structure.
- Implement a `TreeNode` class in Java with recursive methods.
- Prove properties of tree algorithms by structural induction (Module 6).
- Implement and analyze recursive traversals (preorder, inorder, postorder).
- Connect trees to expression evaluation (Module 6 Class 3) and recursion.

---

## Concept Overview

### Recursive Definition

A **binary tree** is either:
1. **Empty** (null), or
2. A **node** with a value, a left subtree, and a right subtree.

$$\text{Tree} ::= \texttt{null} \mid \text{Node}(\text{value}, \text{left}, \text{right})$$

This is a **recursively defined structure** (Module 6 Class 3).

### Terminology

| Term | Meaning |
|------|---------|
| **Root** | The topmost node |
| **Leaf** | A node with no children (both subtrees are null) |
| **Internal node** | A node with at least one child |
| **Height** | Longest path from root to a leaf (empty tree has height $-1$) |
| **Size** | Total number of nodes |
| **Depth** | Distance from the root to a node |

### Traversal Orders

| Order | Pattern | Use Case |
|-------|---------|----------|
| **Preorder** | Root → Left → Right | Copy a tree, prefix expressions |
| **Inorder** | Left → Root → Right | Sorted order in BST |
| **Postorder** | Left → Right → Root | Evaluate expression trees, delete |

---

## Formal Notation

| Symbol | Meaning |
|--------|---------|
| $T$ | A binary tree |
| $T.val$ | Value at the root |
| $T.L$, $T.R$ | Left and right subtrees |
| $|T|$ | Size (number of nodes) |
| $h(T)$ | Height |
| $L(T)$ | Number of leaves |
| $I(T)$ | Number of internal nodes |

---

## Worked Examples

### Example 1: Size by Structural Induction

**Claim:** `size(T)` returns $|T|$.

```java
public int size() {
    int ls = (left == null) ? 0 : left.size();
    int rs = (right == null) ? 0 : right.size();
    return 1 + ls + rs;
}
```

**Proof by structural induction:**
- **Base:** Empty tree (null): size returns 0. $|null| = 0$. ✓
- **Inductive step:** Assume `left.size()` = $|T.L|$ and `right.size()` = $|T.R|$. Then `size()` = $1 + |T.L| + |T.R| = |T|$. ✓ $\blacksquare$

### Example 2: Height

```java
public int height() {
    int lh = (left == null) ? -1 : left.height();
    int rh = (right == null) ? -1 : right.height();
    return 1 + Math.max(lh, rh);
}
```

**Structural induction:** Base: single node (both children null): $1 + \max(-1, -1) = 0$. ✓
Inductive: $h(T) = 1 + \max(h(T.L), h(T.R))$, matching the definition.

### Example 3: Counting Leaves

```java
public int countLeaves() {
    if (left == null && right == null) return 1;
    int ll = (left == null) ? 0 : left.countLeaves();
    int rl = (right == null) ? 0 : right.countLeaves();
    return ll + rl;
}
```

### Example 4: Inorder Traversal

```java
public void inorder(List<Integer> result) {
    if (left != null) left.inorder(result);
    result.add(value);
    if (right != null) right.inorder(result);
}
```

For a BST, inorder traversal produces sorted output.

### Example 5: Expression Tree Evaluation (Module 6 Callback)

```
       *
      / \
     +   3
    / \
   2   5
```

Postorder: 2, 5, +, 3, * → $(2 + 5) \times 3 = 21$.

---

## Proof Techniques Spotlight

### Structural Induction on Trees

To prove property $P(T)$ for all binary trees $T$:

1. **Base case:** Prove $P(\text{null})$ (or $P(\text{leaf})$).
2. **Inductive step:** Assume $P(T.L)$ and $P(T.R)$. Prove $P(T)$.

This parallels recursion: the base case is the simplest tree; the inductive step combines results from subtrees.

### Size-Height Relationship

**Theorem:** For any binary tree $T$ with $n$ nodes and height $h$:

$$h + 1 \leq n \leq 2^{h+1} - 1$$

- Left bound: a path of $h + 1$ nodes (degenerate tree).
- Right bound: a complete binary tree (all levels full).

---

## Java Deep Dive

```java
import java.util.*;

public class TreeNode {
    int value;
    TreeNode left;
    TreeNode right;

    public TreeNode(int value) {
        this.value = value;
    }

    public TreeNode(int value, TreeNode left, TreeNode right) {
        this.value = value;
        this.left = left;
        this.right = right;
    }

    // --- Size ---
    public int size() {
        int ls = (left == null) ? 0 : left.size();
        int rs = (right == null) ? 0 : right.size();
        return 1 + ls + rs;
    }

    // --- Height ---
    public int height() {
        int lh = (left == null) ? -1 : left.height();
        int rh = (right == null) ? -1 : right.height();
        return 1 + Math.max(lh, rh);
    }

    // --- Count Leaves ---
    public int countLeaves() {
        if (left == null && right == null) return 1;
        int ll = (left == null) ? 0 : left.countLeaves();
        int rl = (right == null) ? 0 : right.countLeaves();
        return ll + rl;
    }

    // --- Count Internal Nodes ---
    public int countInternal() {
        if (left == null && right == null) return 0;
        int li = (left == null) ? 0 : left.countInternal();
        int ri = (right == null) ? 0 : right.countInternal();
        return 1 + li + ri;
    }

    // --- Traversals ---
    public List<Integer> preorder() {
        List<Integer> result = new ArrayList<>();
        preorderHelper(result);
        return result;
    }
    private void preorderHelper(List<Integer> result) {
        result.add(value);
        if (left != null) left.preorderHelper(result);
        if (right != null) right.preorderHelper(result);
    }

    public List<Integer> inorder() {
        List<Integer> result = new ArrayList<>();
        inorderHelper(result);
        return result;
    }
    private void inorderHelper(List<Integer> result) {
        if (left != null) left.inorderHelper(result);
        result.add(value);
        if (right != null) right.inorderHelper(result);
    }

    public List<Integer> postorder() {
        List<Integer> result = new ArrayList<>();
        postorderHelper(result);
        return result;
    }
    private void postorderHelper(List<Integer> result) {
        if (left != null) left.postorderHelper(result);
        if (right != null) right.postorderHelper(result);
        result.add(value);
    }

    // --- Is Full Binary Tree ---
    public boolean isFull() {
        if (left == null && right == null) return true;
        if (left == null || right == null) return false;
        return left.isFull() && right.isFull();
    }

    // --- Mirror ---
    public TreeNode mirror() {
        TreeNode ml = (right == null) ? null : right.mirror();
        TreeNode mr = (left == null) ? null : left.mirror();
        return new TreeNode(value, ml, mr);
    }

    // --- Build full binary tree of given height ---
    public static TreeNode buildFull(int height) {
        if (height < 0) return null;
        if (height == 0) return new TreeNode(0);
        TreeNode left = buildFull(height - 1);
        TreeNode right = buildFull(height - 1);
        return new TreeNode(0, left, right);
    }

    // --- Pretty print ---
    public void print(String prefix, boolean isLeft) {
        if (right != null) right.print(prefix + (isLeft ? "│   " : "    "), false);
        System.out.println(prefix + (isLeft ? "└── " : "┌── ") + value);
        if (left != null) left.print(prefix + (isLeft ? "    " : "│   "), true);
    }

    // --- Demo ---
    public static void main(String[] args) {
        System.out.println("=== Binary Trees ===\n");

        // Build a sample tree:
        //        1
        //       / \
        //      2   3
        //     / \   \
        //    4   5   6
        TreeNode tree = new TreeNode(1,
                new TreeNode(2, new TreeNode(4), new TreeNode(5)),
                new TreeNode(3, null, new TreeNode(6)));

        tree.print("", false);

        System.out.println("\nSize: " + tree.size());           // 6
        System.out.println("Height: " + tree.height());         // 2
        System.out.println("Leaves: " + tree.countLeaves());    // 3
        System.out.println("Internal: " + tree.countInternal());// 3

        System.out.println("\nPreorder:  " + tree.preorder());  // [1,2,4,5,3,6]
        System.out.println("Inorder:   " + tree.inorder());    // [4,2,5,1,3,6]
        System.out.println("Postorder: " + tree.postorder());  // [4,5,2,6,3,1]

        System.out.println("\nIs full? " + tree.isFull());      // false

        // Full binary tree
        TreeNode full = buildFull(3);
        System.out.println("\nFull tree (height 3):");
        full.print("", false);
        System.out.println("Size: " + full.size());             // 15 = 2^4 - 1
        System.out.println("Leaves: " + full.countLeaves());    // 8 = 2^3
        System.out.println("Internal: " + full.countInternal());// 7
        System.out.println("L = I + 1? " + (full.countLeaves() == full.countInternal() + 1));

        // Mirror
        System.out.println("\nMirror:");
        tree.mirror().print("", false);
    }
}
```

---

## Historical Context

**Arthur Cayley** (1857) was among the first to study tree structures mathematically, counting the number of labeled trees on $n$ vertices ($n^{n-2}$, Cayley's formula).

Binary trees became central in computer science through **Donald Knuth's** *The Art of Computer Programming* (1968), where he systematized traversal algorithms and their analysis.

**Expression trees** connect to Module 6's structural induction and recursion — evaluating an expression tree is one of the oldest examples of structural recursion in programming.

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** Give the recursive definition of a binary tree.

**A2.** What are the three traversal orders? For each, state which visits the root first/second/last.

**A3.** What is the height of a tree with a single node? An empty tree?

**A4.** For a full binary tree of height 3, how many nodes, leaves, and internal nodes are there?

### Slide Set B: Proof Problems

**B1.** Prove by structural induction: `size(T)` returns $|T|$.

**B2.** Prove: for a full binary tree, $L = I + 1$ (leaves = internal nodes + 1).

**B3.** Prove: $h + 1 \leq |T| \leq 2^{h+1} - 1$.

### Slide Set C: Java Coding Problems

**C1.** Implement `size()`, `height()`, `countLeaves()` recursively.

**C2.** Implement all three traversals and verify on a sample tree.

**C3.** Implement `buildFull(height)` and verify $|T| = 2^{h+1} - 1$.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Define a binary tree recursively. State the base case and the recursive case.

**DM2.** Prove by structural induction: for every binary tree $T$, $|T| = L(T) + I(T)$.

**DM3.** Prove by structural induction: for a full binary tree, $L(T) = I(T) + 1$.

**DM4.** Prove: the number of null pointers in a binary tree with $n$ nodes is $n + 1$.

**DM5.** Prove: inorder traversal of a BST visits nodes in sorted order.

### Java Programming Problems

**JP1.** Implement `TreeNode` with size, height, countLeaves, countInternal, and all three traversals.

**JP2.** Implement `buildFull(height)` and verify: size = $2^{h+1} - 1$, leaves = $2^h$, $L = I + 1$.

**JP3.** Implement `mirror(TreeNode root)` that returns a mirror image. Prove by structural induction that `mirror(mirror(T)) == T`.

**JP4.** Implement `isBalanced(TreeNode root)`: a tree is balanced if for every node, the heights of left and right subtrees differ by at most 1.

**JP5.** Build a tree from preorder and inorder traversal lists. Verify by comparing the tree's traversals with the originals.

### Bridge Problems

**BR1.** Module 6 Class 3 defined expressions recursively ($E ::= n \mid E + E \mid E \times E$). Show that expression trees are binary trees where leaves are numbers and internal nodes are operators.

**BR2.** Module 8: traversal algorithms have loop invariants (for iterative versions). State the invariant for an iterative inorder traversal using a stack.

---

## Solutions

### DM3 Solution: Full Binary Tree Theorem

**Proof by structural induction on $T$.**

**Base:** A single node (leaf). $L = 1$, $I = 0$. $L = I + 1 = 1$. ✓

**Inductive step:** Let $T$ have root with left subtree $T_L$ and right subtree $T_R$ (both non-empty, since $T$ is full).

By inductive hypothesis: $L(T_L) = I(T_L) + 1$ and $L(T_R) = I(T_R) + 1$.

$$L(T) = L(T_L) + L(T_R) = (I(T_L) + 1) + (I(T_R) + 1)$$
$$I(T) = I(T_L) + I(T_R) + 1 \text{ (root is internal)}$$
$$L(T) = I(T_L) + I(T_R) + 2 = I(T) + 1$$ $\blacksquare$

### DM4 Solution: Null Pointers

Each node has 2 pointers. Total pointers: $2n$. Each non-null pointer points to exactly one node (there are $n - 1$ such pointers, since every node except the root is pointed to by its parent). Null pointers: $2n - (n-1) = n + 1$. $\blacksquare$
