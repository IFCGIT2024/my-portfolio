# CSCI 2110 Final Exam – Practice Test Notes
Source: FinalExam.TopicsAndPracticeQuestionBank.2110.Win2026.pdf

---

## EXAM FORMAT
- 2 hours 30 min, closed book, on paper
- Topics: Modules 6–10 (Binary Trees, BST, Heaps, Hashing, Graphs)

---

## QUESTION TYPES & STRUCTURE

### Q1 – 30 MCQs (4–5 options, sometimes "None of above" / "Two of above")
Topics covered:
- Depth vs height of a node
- Complete binary tree vs strictly binary tree definitions
- Traversal output (preorder, inorder, postorder, level-order) given a tree
- Tree property identification (is it BST? heap? complete? strictly binary?)
- Max height of n-node tree
- BST deletion: replace root with inorder predecessor (largest in left subtree)
- Heap arraylist validity check
- Heap insert (sift-up) and delete_max (sift-down) — what are children of root after op?
- HeapSort complexity
- Hash function computation (key mod n)
- Load factor α = number_of_elements / number_of_slots
- Linear probing insertion order deduction from final table state
- Linear probing: find location of a key after insertions
- Cryptographic hashing (hash stored server-side, not password)
- Graph edges from adjacency matrix (undirected 4-vertex all-1s non-diagonal = 6 edges)
- DFS traversal sequence from a directed graph
- Adjacency matrix zeros count for a directed graph
- Indegree and outdegree of a vertex

### "Who is Lying?" MCQs (5 questions)
Format: 3 named students each make a statement. One statement is false. Pick who's lying (or "No one").
Topics: one per module (Binary Trees, BST, Heaps, Hashing, Graphs)
KEY: Topological sort only works on DAGs (directed acyclic graphs), NOT any directed graph — Omar is lying in MCQ5.

### Q2 – Binary Tree Anatomy (short answer, 9 sub-questions)
Given a named-node tree, answer:
i) leaf nodes  ii) internal nodes  iii) longest distance  iv) nodes at level 2
v) height  vi) leaves in right subtree of root  vii) left subtree of left child of right child of root
viii) strictly binary? why?  ix) complete binary? why?

TREE USED IN Q2:
```
        M
       / \
      C   T
     / \ /
    A  G R
          \
           S
```
- Root: M
- M.left = C, M.right = T
- C.left = A, C.right = G
- T.left = R
- R.right = S  (NOTE: R has only a right child, so T has only left child R)

### Q3 – Formulas + Huffman Decode
3.1: Max nodes in complete binary tree height h = 2^(h+1) - 1
3.2: Min leaves in complete binary tree height h = 2^h (min nodes total = 2^h + 2^(h-1) ... debatable, check notes)
3.3: Huffman decode using given tree

HUFFMAN TREE STRUCTURE (Q3.3):
```
Left=0, Right=1 convention assumed (standard):
Root
├── 0: internal
│   ├── 0: internal
│   │   ├── 0: internal
│   │   │   ├── 0: !
│   │   │   └── 1: G
│   │   └── 1: Y
│   └── 1: O
└── 1: internal
    ├── 0: I
    └── 1: internal
        ├── 0: A
        └── 1: T
```
Codes: ! = 0000, G = 0001, Y = 001, O = 01, I = 10, A = 110, T = 111
Message to decode: "0011100010000  10  000101111  1011100000000"

### Q4 – Java Programming (BinaryTree<T> API)
4.1a: Recursive countNodes(BinaryTree<T> tree)
4.1b: Recursive areIdentical(BinaryTree<T> tree1, BinaryTree<T> tree2)
4.2: Code trace — draw tree from code, then draw after detach/attach operations

CODE IN Q4.2 (first tree):
```java
root.makeRoot("A"); root.attachLeft(B); root.attachRight(C); B.attachLeft(D);
```
Result:
```
    A
   / \
  B   C
 /
D
```
Second snippet: X = root.detachLeft() [gets B subtree], E.makeRoot("E"), X.attachRight(E), root.attachLeft(X)
Result after:
```
    A
   / \
  B   C
 / \
D   E
```

### Q5 – BST Insert + Sequential Deletes
Insert sequence: 55, 23, 48, 95, 16, 2, 70, 63, 100, 19
Then delete right child of root, then left child, then root itself.
After each step: identify root, leaves, children of root.

RESULTING BST after all inserts:
```
            55
           /  \
          23   95
         /  \  / \
        16  48 70 100
       /  \   /
       2  19 63
```

### Q6 – Heap Operations (arraylist trace)
Insert: 12, 19, 10, 4, 23, 7, 45, 8, 15 → then delete_max → insert 22 → delete_max → delete_max x5
Write arraylist after EACH operation.

### Q7 – Hash Table Work Problems
7.1: Insert 12,18,13,2,3,23,5,15 into size-10 table, h(k)=k mod 10, LINEAR probing
7.2: Same but QUADRATIC probing
7.3: Size-7 table, h(k)=(3x+4) mod 7, insert 1,3,8,10, linear probing
7.4: Partially filled size-10 table (XX at positions 1,3,4,5,6,7), insert 44,55,66,77
     - a) linear probing: result + collision count
     - b) quadratic probing: result + collision count

### Q8 – Undirected Graph Analysis
GRAPH STRUCTURE (Q8):
```
Nodes: A, B, C, D, E, F, G
Edges (undirected): A-B, A-C, A-E, B-D, B-F, C-F, C-G
```
Visual layout:
```
      A
    / | \
   B  C  E
  /\  |\
 D  F F  G
```
Questions: classify graph, degree-3 vertices, cycle, all paths A→D, DFS from A, BFS from A

### Q9 – Directed Graph (indegree/outdegree/connectivity)
GRAPH STRUCTURE (Q9): 11 nodes: A,B,C,D,E,F,G,H,I,J,K
Dense directed graph — edges include:
A→D, A→E, B→E(implied), D→C, D→E, E→F, E→G, F→J, G→I, H→A, H→G, I→K, I→J, I→G(back?)
(Exact edges need Module 10 notes to confirm — Q9 graph was complex/dense)
Subgraph A,B,C,D: check strongly vs weakly connected

### Q10 – Topological Sort (step-by-step)
DAG STRUCTURE (Q10):
```
Nodes: A, B, C, D, E, F
Edges: A→C, B→C, B→F, D→C, D→E, C→(none shown as outgoing?), F→E
```
Visual:
```
  A       D
   \     / \
    → C ←   E
   /     \
  B→      F→E
```
Run topological sort algorithm, assign topological numbers, show each step.

---

## REFERENCE SHEET (from test — BinaryTree & BST class APIs)

### BinaryTree<T>
Instance vars: T data, BinaryTree<T> parent/left/right
- `BinaryTree<T>()` — empty constructor
- `void makeRoot(T data)`
- `void setData/setLeft/setRight/setParent()`
- `T getData()`, `BinaryTree<T> getLeft/getRight/getParent()`
- `BinaryTree<T> root()` — returns root of whole tree
- `void attachLeft/attachRight(BinaryTree<T> tree)`
- `BinaryTree<T> detachLeft/detachRight()`
- `boolean isEmpty()`
- `void clear()`

### BinarySearchTree<T extends Comparable<T>>
Instance vars: BinaryTree<T> tree, int size
- `BinarySearchTree()` — empty constructor
- `BinaryTree<T> getTree()`
- `boolean isEmpty()`
- `int size()`
- `BinaryTree<T> search(T key)`
- `void insert(T key)`
- `void delete(T key)`

---

## VISUAL TYPES NEEDED FOR SITE
1. **tree** — binary tree with labeled nodes (letters or numbers), directed edges down
2. **heap-tree** — same as tree but heap-ordered
3. **arraylist** — horizontal array of indexed cells with values
4. **hashtable** — vertical table of index|value rows, some empty (shown as -)
5. **directed-graph** — nodes as circles with labeled arrows between them
6. **undirected-graph** — nodes as circles with lines (no arrows)
7. **huffman-tree** — binary tree with 0/1 edge labels, leaves are characters

---

## ANSWER KEY (selected)
1b, 2b, 3a, 4e(levelorder+preorder both give ABCDE? — level=ABCDE, pre=ABDEC... so level order only=b), 5c(DBEAC), 6c(height=2), 7a, 8c(6), 9b(I and II — complete+strictly), 10d(I and III — complete+BST), 11d(5 is inorder predecessor), 12d(B and C), 13d(III and IV), 14a(A), 15c(I and III), 16a(O(n)), 17d(B and C), 18b(25 and 19? needs trace), 19d(36 and 25? needs trace), 20b([10,10,10,10,10]), 21b, 22e(i and ii), 23a(80), 24c, 25c(7), 26a, 27b(6), 28b(I and II), 29c(21), 30c(0 and 2)
WhoLying: MCQ1=b(Ben), MCQ2=c(Farhan), MCQ3=c(Ishaan), MCQ4=d(No one), MCQ5=c(Omar)
