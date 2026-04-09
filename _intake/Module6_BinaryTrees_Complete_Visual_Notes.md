# CSCI 2110: Module 6 - Binary Trees

**Course:** CSCI 2110 Data Structures and Algorithms  
**Institution:** Dalhousie University  
**Instructor:** Srini Sampalli  

---

## Notes on how this file was built

This version is based primarily on **visual review of the slide images and handwritten annotations**, not just raw OCR. In several places the handwritten circles, arrows, checks, and quick sketches add meaning that would be lost in a plain text extract, so those visual explanations are included here.

The overall structure is modeled after the style of the Module 7 BST markdown file:
- concept first
- examples and interpretation
- code or pseudocode where it appears
- slide-by-slide explanations
- explicit callout of what the handwritten annotations are showing

---

## Module Overview

Module 6 introduces the binary tree as a special kind of tree data structure, defines the key terminology, compares important binary-tree subclasses, explains recursive definitions and traversals, then shows one major application of binary trees: **Huffman coding**.

### Learning Objectives

- Define the tree and binary tree data structures
- Understand the terminology of binary trees
- Know different types of binary tree traversals
- Build the binary tree class
- Learn one application of binary trees: Huffman coding

---

# Part I - Binary tree foundations

## Slide 1 - Module title and learning objectives

### What is shown visually
The first page contains the title slide for **Module 6: Binary Trees**, followed by a learning-objectives slide. The learning-objectives slide highlights two items in red for emphasis: understanding binary-tree terminology and building the binary-tree class.

### Main idea
This slide sets up the whole module. It tells us that the module is not just about definitions. It is also about:
1. being able to talk correctly about tree structure,
2. traversing trees,
3. implementing a tree in code, and
4. applying the idea to compression through Huffman coding.

---

## Slide 2 - A tree in the eyes of a computer scientist

### What is shown visually
The top panel uses an actual tree image as a conceptual bridge. The bottom panel turns that intuition into a data-structure diagram with labeled terms such as:
- root
- branch
- parent node
- child nodes
- leaf node
- internal node
- levels 0 through 4

### Main idea
A computer scientist's tree is a **hierarchy of nodes** arranged in levels. The important mental shift is that the "top" of the tree is the root, and the hierarchy grows downward.

### Key terminology introduced
- **Root**: the starting node, at level 0
- **Branch / link**: a connection between nodes
- **Parent**: a node connected downward to one or more child nodes
- **Child**: a node directly below a parent
- **Leaf**: a node with no children
- **Internal node**: a non-leaf node

---

## Slide 3 - Binary tree data structure and subtree terminology

### What is shown visually
The slide uses a lettered example tree rooted at `A` with children `B` and `C`, plus deeper nodes `D`, `E`, `F`, `G`, and `H`. The slide explicitly marks:
- root
- left child of `A`
- right child of `A`
- leaf nodes
- internal nodes

The lower panel continues with subtree terminology and asks small questions about left and right subtrees.

### Main idea
A **binary tree** is a tree in which each node can have **at most two children**. Those two positions matter, because they are not just any two children. They are specifically the **left child** and the **right child**.

### Important takeaways
- Order matters in binary trees.
- The tree rooted at a node's left child is its **left subtree**.
- The tree rooted at a node's right child is its **right subtree**.
- Either subtree may be `null`.

---

## Slide 4 - Path, distance, depth, level, height, and node-count observations

### What is shown visually
The diagram keeps the same lettered tree and overlays:
- node depths
- level labels
- example paths
- distance calculations
- two handwritten algebra derivations for the maximum number of nodes in a full binary tree and the inverse height formula

### Main idea
This slide formalizes the geometry of a binary tree.

### Definitions
- **Path**: the unique route from one node to another
- **Distance**: the number of branches in that path
- **Depth**: distance from the root
- **Level**: all nodes with the same depth
- **Height**: maximum depth of any node in the tree

### Example facts from the slide
- Path from `A` to `H`: `A -> B -> D -> H`
- Path from `G` to `E`: `G -> D -> B -> E`
- Distance from `A` to `H`: `3`
- Distance from `H` to `C`: `4`
- Height of the example tree: `3`

### Observations shown on the slide
For a binary tree of height `h`, the maximum number of nodes is:

```text
Nmax = 2^(h+1) - 1
```

If a binary tree has all levels completely filled and has `Nmax` nodes, then:

```text
h = log2(Nmax + 1) - 1
```

### What the handwritten math is doing
The handwritten notes expand the geometric sum level by level:
`1 + 2 + 4 + ... + 2^h`,
then convert it to the closed-form expression above.

---

## Slide 5 - Strictly binary and complete binary

### What is shown visually
The slide defines two special categories and then adds hand-drawn example trees underneath with checks and X marks.

### Definitions
A **strictly binary tree** is one where every node has either:
- no children, or
- exactly two children

So a node with only one child is not allowed.

A **complete binary tree** is one where:
- every level except possibly the last is completely filled, and
- the last level is filled from left to right without gaps

### What the handwritten examples show
The annotations separate examples into two groups:
- strictly binary examples
- complete binary examples

The circled node on the incorrect strictly-binary example is a node with only one child. That is exactly why it fails the strict condition.

The complete-tree sketches emphasize the **left-to-right filling rule**. A last-level gap in the middle makes the tree incomplete even if the total shape looks almost full.

---

## Slide 6 - Exercise on classifying tree shapes

### What is shown visually
The slide presents a table with several small hand-drawn tree shapes and two columns:
- Strictly Binary?
- Complete Binary?

The instructor marks each row with checks or X marks and writes "Trick question" and "Not a binary tree!" for the final example.

### Main idea
This is a classification exercise that forces you to distinguish:
- structure with one-child nodes,
- structure that is complete but not strict,
- structure that is both,
- and structure that is not even binary

### Important visual lesson
A tree can be:
- both strictly binary and complete
- strictly binary but not complete
- complete but not strictly binary
- neither
- not binary at all

The last sketch is a trick because one node has too many children, so it fails before the strict/complete question even begins.

---

## Slide 7 - Recursive definitions for the binary tree

### What is shown visually
The slide lists three recursive definitions:
- the binary tree itself
- number of nodes
- height

Underneath, the handwritten annotations circle left and right subtrees and write arithmetic decompositions for node counts and height.

### Recursive definition of binary tree
A binary tree is either:
- empty, or
- a root with a left subtree and a right subtree that are themselves binary trees

### Recursive definition of number of nodes
```text
nodes(empty) = 0
nodes(tree) = 1 + nodes(left subtree) + nodes(right subtree)
```

### Recursive definition of height
```text
height(empty) = -1
height(tree) = 1 + max(height(left subtree), height(right subtree))
```

### What the handwritten notes are emphasizing
On the left, the instructor visually splits a tree into root plus left and right subtrees, then counts the nodes as repeated `1 + ...` terms.

On the right, the instructor follows the longest downward chain and shows that height comes from the **maximum** subtree height, not the total count of edges everywhere. One of the small side notes also reminds you that a single-node tree has height `0`.

---

## Slide 8 - Binary tree traversals and pre-order

### What is shown visually
The top portion introduces binary-tree traversals as a systematic way of visiting nodes. It lists:
- pre-order traversal
- in-order traversal
- post-order traversal

The bottom portion focuses on **pre-order** using a lettered tree and red instructions.

### Pre-order rule
```text
Root - Left - Right
```

### Example shown
For the illustrated tree, the pre-order sequence written on the slide is:

```text
A B D E C F G
```

### Handwritten meaning
The circles around subtrees visually reinforce the recursive pattern:
1. visit the root first,
2. recursively traverse the left subtree,
3. recursively traverse the right subtree.

---

## Slide 9 - In-order and post-order

### What is shown visually
This page contains two traversal slides:
- **In-order traversal**
- **Post-order traversal**

Each slide uses the same lettered tree and gives the rule and a worked output.

### In-order rule
```text
Left - Root - Right
```

### Example shown
```text
B D E A F C G
```

### Post-order rule
```text
Left - Right - Root
```

### Example shown
```text
D E B F G C A
```

### Main idea
These are not arbitrary orderings. They come directly from the recursive tree definition. Traversal is one of the first places where the recursive nature of a tree becomes operational.

---

# Part II - Traversal exercises and BinaryTree<T> implementation

## Slide 10 - Traversal exercise page

### What is shown visually
The slide shows three separate hand-drawn trees.

For tree 1, handwritten solutions are given for:
- pre-order
- in-order
- post-order
- level order

For tree 2, handwritten solutions are also given.

For tree 3, the note says: **Do it yourself**.

### Tree 1 sequences shown
```text
Pre-order:  A B C D F G E
In-order:   B A F D G C E
Post-order: B F G D E C A
Level order: A B C D E F G
```

### Tree 2 sequences shown
```text
Pre-order:  A B C D E
In-order:   A D E C B
Post-order: E D C B A
Level order: A B C D E
```

### Why this slide matters
It distinguishes recursive depth-first traversals from **level order**, which is breadth-first.

---

## Slide 11 - Class BinaryTree<T> overview

### What is shown visually
This slide presents the API table for `BinaryTree<T>` and annotates it heavily:
- a node is modeled as a `BinaryTree<T>` itself
- each node stores `data`, `left`, `right`, and `parent`
- method headers are handwritten into the table
- complexity tags are written in by hand
- a small sketch on the right marks a chain-shaped tree as a "Bad tree"

### Main idea
The class is designed so that **each node is itself the root of a binary tree**. That is why the node type and the tree type are the same object.

### Core attributes
```java
T data;
BinaryTree<T> parent;
BinaryTree<T> left;
BinaryTree<T> right;
```

### Methods listed on the slide
- `BinaryTree()` - creates an empty binary tree
- `makeRoot`
- set methods
- get methods
- `root`
- `attachLeft`
- `attachRight`
- `detachLeft`
- `detachRight`
- `isEmpty`
- `clear`

### Complexity notes visible on the slide
Most direct setter/getter/attach/detach methods are marked `O(1)`, while `root()` is marked `O(n)` in the worst case because it may have to climb all the way up through parent pointers.

---

## Slide 12 - BinaryTree<T> fields, constructor, emptiness, clear, makeRoot, and setters

### What is shown visually
This code slide defines the core data fields and the first methods of the class. Large handwritten brackets label:
- instance variables
- constructor
- method groups

### Reconstructed code from the slide
```java
public class BinaryTree<T>
{
    private T data;
    private BinaryTree<T> parent;
    private BinaryTree<T> left;
    private BinaryTree<T> right;

    public BinaryTree()
    {
        parent = left = right = null;
        data = null;
    }

    public boolean isEmpty()
    {
        if (data == null)
            return true;
        else
            return false;
    }

    public void clear()
    {
        left = right = parent = null;
        data = null;
    }

    public void makeRoot(T data)
    {
        if (!isEmpty())
        {
            System.out.println("Can't make root. Already exists");
        }
        else
            this.data = data;
    }

    public void setData(T data)
    {
        this.data = data;
    }

    public void setLeft(BinaryTree<T> tree)
    {
        left = tree;
    }

    public void setRight(BinaryTree<T> tree)
    {
        right = tree;
    }

    public void setParent(BinaryTree<T> tree)
    {
        parent = tree;
    }

    public T getData()
    {
        return data;
    }
}
```

### Handwritten meaning
The handwritten note beside `makeRoot` emphasizes that this creates a **single-node binary tree**. The constructor leaves the object empty, and `makeRoot` is what turns it into an actual one-node tree.

---

## Slide 13 - Getters, attachLeft, attachRight, and detachLeft

### What is shown visually
The slide continues the code and uses sketches to show:
- `this`
- the subtree being attached
- parent-pointer updates
- the detach operation returning a reference to the subtree that got removed

### Reconstructed code from the slide
```java
public BinaryTree<T> getParent()
{
    return parent;
}

public BinaryTree<T> getLeft()
{
    return left;
}

public BinaryTree<T> getRight()
{
    return right;
}

public void attachLeft(BinaryTree<T> tree)
{
    if (this.isEmpty()) return;
    if (this.left != null || tree.getParent() != null)
    {
        System.out.println("Can't attach");
        return;
    }
    else
    {
        this.setLeft(tree);
        tree.setParent(this);
    }
}

public void attachRight(BinaryTree<T> tree)
{
    if (this.isEmpty()) return;
    if (tree == null) return;
    else if (right != null || tree.getParent() != null)
    {
        System.out.println("Can't attach");
        return;
    }
    else
    {
        tree.setParent(this);
        this.setRight(tree);
    }
}

public BinaryTree<T> detachLeft()
{
    if (this.isEmpty()) return null;
    BinaryTree<T> retLeft = this.left;
    this.left = null;
    if (retLeft != null)
        retLeft.setParent(null);
    return retLeft;
}
```

### Main idea
Attachment must preserve tree structure correctly:
- you cannot attach into an occupied child slot
- you cannot attach a subtree that already has a parent
- detaching returns the subtree and also clears its parent pointer

---

## Slide 14 - detachRight, root(), and recursive preorder/inorder

### What is shown visually
This slide contains code plus a large handwritten suggestion to "Try the recursive version" for `root()`. A side sketch shows climbing upward through parent pointers until the actual root is reached. Another note on the right reminds us that preorder is `Root - Left - Right`.

### Reconstructed code from the slide
```java
public BinaryTree<T> detachRight()
{
    if (this.isEmpty()) return null;
    BinaryTree<T> retRight = right;
    right = null;
    if (retRight != null) retRight.setParent(null);
    return retRight;
}

public BinaryTree<T> root()
{
    if (this.isEmpty()) return null;
    if (this.parent == null)
        return this;

    BinaryTree<T> next = this.parent;
    while (next.getParent() != null)
        next = next.getParent();

    return next;
}

public static <T> void preorder(BinaryTree<T> t)
{
    if (t != null)
    {
        System.out.print(t.getData() + "\t");
        preorder(t.getLeft());
        preorder(t.getRight());
    }
}

public static <T> void inorder(BinaryTree<T> t)
{
    if (t != null)
    {
        inorder(t.getLeft());
        System.out.print(t.getData() + "\t");
        inorder(t.getRight());
    }
}
```

### Main idea
- `root()` follows parent links upward.
- `preorder` and `inorder` are both small recursive methods whose logic mirrors the traversal rules from earlier slides.

---

## Slide 15 - postorder and demo program

### What is shown visually
The top shows the recursive `postorder` method. The lower half builds a demo using six separate `BinaryTree<String>` objects named `A` through `F`, then attaches them into a tree and prints the traversals. A hand-drawn copy of the resulting tree is included beside the code, along with the expected outputs.

### Reconstructed code from the slide
```java
public static <T> void postorder(BinaryTree<T> t)
{
    if (t != null)
    {
        postorder(t.getLeft());
        postorder(t.getRight());
        System.out.print(t.getData() + "\t");
    }
}

public class BinaryTreeDemo
{
    public static void main(String[] args)
    {
        BinaryTree<String> A = new BinaryTree<String>();
        BinaryTree<String> B = new BinaryTree<String>();
        BinaryTree<String> C = new BinaryTree<String>();
        BinaryTree<String> D = new BinaryTree<String>();
        BinaryTree<String> E = new BinaryTree<String>();
        BinaryTree<String> F = new BinaryTree<String>();

        A.makeRoot("A");
        B.makeRoot("B");
        C.makeRoot("C");
        D.makeRoot("D");
        E.makeRoot("E");
        F.makeRoot("F");

        A.attachLeft(B);
        A.attachRight(C);
        B.attachLeft(D);
        B.attachRight(E);
        D.attachLeft(F);

        System.out.print("Preorder:\t");
        BinaryTree.preorder(A);
        System.out.println();

        System.out.print("Inorder:\t");
        BinaryTree.inorder(A);
        System.out.println();

        System.out.print("Postorder:\t");
        BinaryTree.postorder(A);
        System.out.println();
    }
}
```

### Tree built by the demo
```text
      A
     / \
    B   C
   / \
  D   E
 /
F
```

### Outputs handwritten on the slide
```text
Preorder:  A B D F E C
Inorder:   F D B E A C
Postorder: F D E B C A
```

---

# Part III - Huffman coding introduction and tree construction

## Slide 16 - Huffman coding title slide

### What is shown visually
A bright yellow title card labeled:

```text
Huffman Coding
A nifty application with binary trees
```

### Main idea
This marks the transition from binary-tree structure and traversal to an application where binary trees solve a real optimization problem: reducing the number of bits needed to transmit a message.

---

## Slide 17 - What is Huffman coding?

### What is shown visually
A plain concept slide with four bullets.

### Main points from the slide
- It is one of the earliest schemes used in text compression.
- It influenced many later compression techniques.
- It uses a binary tree to derive binary codes for symbols in an alphabet.
- It reduces the total number of bits required to transmit a message.

### Main idea
The module is shifting from tree structure to **encoding efficiency**.

---

## Slide 18 - Motivation: why fixed-length encoding is wasteful

### What is shown visually
The slide begins with a small alphabet of six symbols and asks how many bits are needed to encode each one. It explains that with a naïve method, we would use **3 bits per symbol**, because 3 bits can represent up to 8 distinct patterns and 2 bits would only represent 4.

### Main idea
If all symbols are given the same code length, we ignore the fact that some symbols appear much more often than others. That is exactly the inefficiency Huffman coding will fix.

---

## Slide 19 - Naïve 3-bit encoding table

### What is shown visually
A table maps the six symbols to 3-bit fixed-length codes. The slide then shows the message `tweet` encoded using those 3-bit chunks.

### Code table shown
```text
t  000
u  001
$  010
e  011
a  100
w  101
```

### Worked example from the slide
```text
tweet -> 000 101 011 011 000
```

Without spaces, the transmitted string is:

```text
000101011011000
```

### Main idea
This method is easy, but every symbol costs the same number of bits.

---

## Slide 20 - Problem with the naïve method

### What is shown visually
A bullet-point slide criticizing the fixed-length scheme.

### Main points
- every symbol uses the same number of bits
- it assumes all symbols are equally likely
- real symbol frequencies are usually not equal
- this can increase transmission cost
- if probabilities are known, we should try to give common symbols shorter codes

### Conclusion shown on the slide
The answer is the **Huffman coding technique**.

---

## Slide 21 - Start Huffman coding with a probability table

### What is shown visually
A table lists six symbols and their probabilities in increasing order:

```text
w  0.05
a  0.08
u  0.12
$  0.20
t  0.20
e  0.35
```

### Main idea
The first step in building a Huffman tree is sorting symbols from smallest probability to largest.

---

## Slide 22 - First merge

### What is shown visually
The slide crosses out the two smallest entries `w` and `a`, then draws two leaf nodes with weights `0.05` and `0.08`, and combines them into a small subtree with root weight `0.13`.

### Operation shown
```text
0.05 + 0.08 = 0.13
```

### Main idea
At each stage, Huffman coding merges the two smallest available weights.

---

## Slide 23 - Second merge

### What is shown visually
The slide keeps the previous `0.13` subtree and compares it against the remaining symbol weights. The next smallest pair is `u = 0.12` and the subtree root `0.13`.

### Operation shown
```text
0.12 + 0.13 = 0.25
```

### Main idea
Once subtrees exist, their root weights are treated just like ordinary symbol probabilities.

---

## Slide 24 - Third merge

### What is shown visually
The slide highlights the two `0.20` symbols, `$` and `t`, and combines them into a subtree rooted at `0.40`.

### Operation shown
```text
0.20 + 0.20 = 0.40
```

### Main idea
Equal probabilities can be paired naturally. The result is another internal node.

---

## Slide 25 - Fourth merge setup

### What is shown visually
The list is now reduced to the contenders `0.25`, `0.35`, and `0.40`, along with the drawn subtrees that have been built so far.

### Main idea
The remaining choices are no longer just symbols. They are subtrees and a single leaf competing by weight.

---

## Slide 26 - Merge 0.25 with 0.35

### What is shown visually
The `0.25` subtree and the leaf `e = 0.35` are combined into a new subtree rooted at `0.60`.

### Operation shown
```text
0.25 + 0.35 = 0.60
```

### Main idea
This is the next greedy step. The two smallest available weights are merged again.

---

## Slide 27 - Final merge setup

### What is shown visually
The slide shows the `0.60` subtree on one side and the `0.40` subtree on the other side, with the remaining weights ready to be combined into a full tree.

### Main idea
Only two trees are left, so the next merge will produce the final Huffman tree.

---

## Slide 28 - Merge 0.60 with 0.40

### What is shown visually
The final root appears with total weight `1.00`, sitting above the left subtree `0.60` and the right subtree `0.40`.

### Operation shown
```text
0.60 + 0.40 = 1.00
```

### Main idea
The root weight equals the total probability mass, which is 1.

---

## Slide 29 - Completed Huffman tree summary

### What is shown visually
A clean summary slide presents the completed Huffman tree without extra construction commentary.

### Tree structure
```text
                1.00
               /    \
            0.60    0.40
           /   \    /   \
        0.25  0.35 0.20 0.20
       /   \     |   |    |
    0.13  0.12   e   $    t
    /  \
 0.05 0.08
  w     a
```

### Main idea
Every symbol is now a leaf, and every internal node holds a combined probability.

---

# Part IV - Deriving codes from the Huffman tree

## Slide 30 - Assign 0 to left and 1 to right

### What is shown visually
The slide labels every left branch with `0` and every right branch with `1`. It explicitly works out:
- code for `w`
- code for `e`

### Rules shown
- left branch -> `0`
- right branch -> `1`

### Example codes shown
```text
w = 0000
e = 01
```

### Main idea
The binary code for a symbol is the path from the root to that symbol's leaf.

---

## Slide 31 - Finished symbol-to-code table

### What is shown visually
A table lists each symbol and its final Huffman code, while the tree on the right remains annotated with edge labels.

### Code table
```text
w  0000
a  0001
u  001
$  10
t  11
e  01
```

### Main idea
Common symbols are getting shorter codes than rare symbols.

---

## Slide 32 - Why Huffman coding works

### What is shown visually
The code table stays on the left, and the tree stays on the right. New red bullets emphasize the conceptual point.

### Two core ideas highlighted
1. The most frequently occurring symbols get encoded with the fewest bits.
2. No code is a prefix of another code.

### Why prefix-free matters
Because no codeword starts with another full codeword, decoding is unambiguous. A receiver can scan the bitstream from left to right and know exactly when one symbol ends.

---

## Slide 33 - Encode the message `tweet`

### What is shown visually
The slide places the Huffman code table beside a sender/receiver diagram and groups the encoded message into symbol-sized chunks.

### Encoding shown
```text
t = 11
w = 0000
e = 01
e = 01
t = 11
```

So:

```text
tweet -> 11 0000 01 01 11
```

Without spaces:

```text
110000010111
```

### Main idea
The slide demonstrates end-to-end encoding and decoding using the prefix-free Huffman code.

---

## Slide 34 - Compare Huffman against fixed-length encoding

### What is shown visually
This is the same `tweet` example, but now the slide explicitly compares bit counts.

### Comparison shown
```text
Naïve fixed-length method: 15 bits
Huffman coding:            12 bits
```

### Why 15 bits?
There are 6 symbols in the alphabet, so fixed-length encoding needs 3 bits per symbol. The word `tweet` has 5 symbols:

```text
5 * 3 = 15 bits
```

### Main idea
Huffman coding wins because the frequent symbols, especially `t` and `e`, are cheap to encode.

---

# Part V - Decoding exercise, efficiency formula, larger example, and pseudocode

## Slide 35 - Decoding exercise setup

### What is shown visually
The code table is shown again, and the bit string

```text
0001000001
```

is sent from sender to receiver. The receiver box is blank at first.

### Main idea
This slide asks you to decode by using the prefix-free code table.

---

## Slide 36 - Decoding exercise solution

### What is shown visually
The bit string is split with braces into three codewords, labeled:

```text
0001   0000   01
 a      w     e
```

The receiver box is filled with the message:

```text
awe
```

### Main idea
This is a direct visual proof that the Huffman code is unambiguous to decode.

---

## Slide 37 - Average code length formula

### What is shown visually
The slide introduces a formula for average code length and then plugs in the probabilities and code lengths from the example.

### Formula shown
```text
Average code length = Σ Pi Ci
```

where:
- `Pi` is the probability of symbol `i`
- `Ci` is the number of bits in that symbol's code

### Calculation shown
```text
4(0.05) + 4(0.08) + 3(0.12) + 2(0.20) + 2(0.20) + 2(0.35)
= 2.38 bits
```

### Comparison noted on the slide
```text
Code length without Huffman = 3 bits
```

### Huffman ratio shown
```text
Huffman ratio = (average code length with Huffman) / (code length without Huffman)
```

### Main idea
Huffman coding reduces the expected number of bits per symbol from 3 to 2.38.

---

## Slide 38 - Compression savings for large transmission

### What is shown visually
A short applied slide scales the average to a million letters.

### Numbers shown
```text
Without Huffman: 3,000,000 bits
With Huffman:    2,380,000 bits
```

### Savings
```text
Savings = 620,000 bits
```

### Main idea
Even a modest average savings per symbol becomes very large at scale.

---

## Slide 39 - Huffman coding example 2

### What is shown visually
This slide presents a larger 10-symbol probability table and a fully hand-drawn Huffman tree underneath. The instructor also writes three specific codes beside the drawing.

### Probability table shown
```text
@  0.02
?  0.03
$  0.07
W  0.08
A  0.10
U  0.10
S  0.10
N  0.12
T  0.13
E  0.25
```

### Handwritten full-tree interpretation
The drawn tree combines the left side into weights like:
- `0.02 + 0.03 = 0.05`
- `0.05 + 0.07 = 0.12`
- `0.12 + 0.12 = 0.24`

The middle combines:
- `0.10 + 0.10 = 0.20`

The right side combines:
- `0.08 + 0.10 = 0.18`
- `0.18 + 0.13 = 0.31`

Then:
- `0.24 + 0.20 = 0.44`
- `0.25 + 0.31 = 0.56`
- `0.44 + 0.56 = 1.00`

### Specific handwritten codes on the slide
```text
Code for @ : 00000
Code for T : 111
Code for S : 011
```

### Main idea
This larger example shows that the same Huffman strategy scales to larger alphabets and more varied probabilities.

---

## Slide 40 - Pseudocode for implementing the Huffman tree

### What is shown visually
The slide gives numbered pseudocode and then adds a large hand-drawn explanation with:
- a "pair object" idea `(symbol, weight)`
- two queues labeled conceptually as `S` and `T`
- example queue contents and subtree combinations

### Pseudocode shown on the slide
```text
1. Construct a single-node binary tree for each symbol.
   Place these trees in queue S in increasing order of probability.
   Let T be the result queue, initially empty.

2. Pick the two smallest weight trees, say A and B, from S and T:
   a) If T is empty, take the front and next-to-front entries of S.
   b) If T is not empty, compare the fronts of S and T and dequeue
      the smaller one as A, then do the same again for B.

3. Construct a new tree P by creating a root and attaching A and B
   as subtrees. The root weight is the sum of the weights of A and B.

4. Enqueue P to T.

5. Repeat steps 2 to 4 until S is empty.
```

### What the handwritten queue diagram is explaining
The annotations show how:
- `S` starts with the original symbol-weight pairs in sorted order
- `T` holds newly constructed partial trees
- each new tree goes back into `T`
- future selections always compare the fronts of both queues

### Main idea
This is the algorithmic version of the slide-by-slide greedy process shown earlier.

---

# Consolidated code and formulas section

## BinaryTree<T> core implementation from the visually reviewed slides

```java
public class BinaryTree<T>
{
    private T data;
    private BinaryTree<T> parent;
    private BinaryTree<T> left;
    private BinaryTree<T> right;

    public BinaryTree()
    {
        parent = left = right = null;
        data = null;
    }

    public boolean isEmpty()
    {
        if (data == null)
            return true;
        else
            return false;
    }

    public void clear()
    {
        left = right = parent = null;
        data = null;
    }

    public void makeRoot(T data)
    {
        if (!isEmpty())
            System.out.println("Can't make root. Already exists");
        else
            this.data = data;
    }

    public void setData(T data) { this.data = data; }
    public void setLeft(BinaryTree<T> tree) { left = tree; }
    public void setRight(BinaryTree<T> tree) { right = tree; }
    public void setParent(BinaryTree<T> tree) { parent = tree; }

    public T getData() { return data; }
    public BinaryTree<T> getParent() { return parent; }
    public BinaryTree<T> getLeft() { return left; }
    public BinaryTree<T> getRight() { return right; }

    public void attachLeft(BinaryTree<T> tree)
    {
        if (this.isEmpty()) return;
        if (this.left != null || tree.getParent() != null)
        {
            System.out.println("Can't attach");
            return;
        }
        this.setLeft(tree);
        tree.setParent(this);
    }

    public void attachRight(BinaryTree<T> tree)
    {
        if (this.isEmpty()) return;
        if (tree == null) return;
        if (right != null || tree.getParent() != null)
        {
            System.out.println("Can't attach");
            return;
        }
        tree.setParent(this);
        this.setRight(tree);
    }

    public BinaryTree<T> detachLeft()
    {
        if (this.isEmpty()) return null;
        BinaryTree<T> retLeft = this.left;
        this.left = null;
        if (retLeft != null) retLeft.setParent(null);
        return retLeft;
    }

    public BinaryTree<T> detachRight()
    {
        if (this.isEmpty()) return null;
        BinaryTree<T> retRight = right;
        right = null;
        if (retRight != null) retRight.setParent(null);
        return retRight;
    }

    public BinaryTree<T> root()
    {
        if (this.isEmpty()) return null;
        if (this.parent == null) return this;

        BinaryTree<T> next = this.parent;
        while (next.getParent() != null)
            next = next.getParent();

        return next;
    }

    public static <T> void preorder(BinaryTree<T> t)
    {
        if (t != null)
        {
            System.out.print(t.getData() + "\t");
            preorder(t.getLeft());
            preorder(t.getRight());
        }
    }

    public static <T> void inorder(BinaryTree<T> t)
    {
        if (t != null)
        {
            inorder(t.getLeft());
            System.out.print(t.getData() + "\t");
            inorder(t.getRight());
        }
    }

    public static <T> void postorder(BinaryTree<T> t)
    {
        if (t != null)
        {
            postorder(t.getLeft());
            postorder(t.getRight());
            System.out.print(t.getData() + "\t");
        }
    }
}
```

---

## Huffman code table from the main worked example

```text
w  0000
a  0001
u  001
$  10
t  11
e  01
```

---

## Huffman average code length formula

```text
Average code length = Σ Pi Ci
```

Example from the module:

```text
4(0.05) + 4(0.08) + 3(0.12) + 2(0.20) + 2(0.20) + 2(0.35)
= 2.38 bits
```

---

## Huffman tree pseudocode from the final slide

```text
1. Make a single-node tree for each symbol and place them in queue S in increasing order.
2. Let T be an empty result queue.
3. Repeatedly choose the two smallest-weight trees from the fronts of S and T.
4. Merge them under a new root whose weight is the sum of the two roots.
5. Enqueue the merged tree into T.
6. Continue until only the final Huffman tree remains.
```

---

# Final summary

## Binary tree portion
The first half of the module builds the vocabulary and mental model for trees:
- generic tree terms
- binary-tree-specific terms
- depth, level, and height
- strict vs complete trees
- recursive definitions
- recursive traversals
- a concrete `BinaryTree<T>` implementation

## Huffman portion
The second half uses binary trees to solve a compression problem:
- fixed-length codes waste bits when symbol probabilities differ
- Huffman coding repeatedly merges the two smallest probabilities
- the resulting binary tree gives shorter codes to frequent symbols
- the code is prefix-free, so decoding is unambiguous
- the average number of bits per symbol drops below the fixed-length baseline

## Biggest conceptual bridge across the whole module
The module is showing that binary trees are not just abstract objects. The same recursive structure that makes traversals natural also makes Huffman coding possible.

---

**End of Module 6**
