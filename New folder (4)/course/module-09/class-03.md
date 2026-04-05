# Module 9 – Class 3: Applications, Complexity and Formal Verification

## Learning Objectives

- Implement and prove correctness of BST insert, search, and delete.
- Understand heap structure and prove the heap property is maintained by insert/extract.
- Connect tree height to Big-O complexity for core operations.
- Survey formal verification tools and their role in software engineering.
- Synthesize proof techniques from the entire course (Modules 1–9).

---

## Concept Overview

### Binary Search Trees (BST)

A BST is a binary tree where for every node $v$:
- All values in $v.\text{left}$ are less than $v.\text{value}$
- All values in $v.\text{right}$ are greater than $v.\text{value}$

**Operations and worst-case time:**

| Operation | Balanced BST | Degenerate BST |
|-----------|-------------|----------------|
| Search | $O(\log n)$ | $O(n)$ |
| Insert | $O(\log n)$ | $O(n)$ |
| Delete | $O(\log n)$ | $O(n)$ |
| Min/Max | $O(\log n)$ | $O(n)$ |

### Heaps and Priority Queues

A **min-heap** is a complete binary tree where every node's value is $\leq$ its children's values:

$$v.\text{value} \leq v.\text{left}.\text{value} \quad \text{and} \quad v.\text{value} \leq v.\text{right}.\text{value}$$

**Array representation:** For node at index $i$ (0-based):
- Left child: $2i + 1$
- Right child: $2i + 2$
- Parent: $\lfloor(i - 1) / 2\rfloor$

| Operation | Time |
|-----------|------|
| Insert | $O(\log n)$ |
| Extract-min | $O(\log n)$ |
| Peek-min | $O(1)$ |
| Build heap | $O(n)$ |

### Big-O Notation

$$f(n) = O(g(n)) \iff \exists c > 0, n_0 \geq 0 : \forall n \geq n_0, f(n) \leq c \cdot g(n)$$

**Common complexity classes:**

$$O(1) \subset O(\log n) \subset O(n) \subset O(n \log n) \subset O(n^2) \subset O(2^n)$$

### Formal Verification

**Formal verification** uses mathematical proof to guarantee software correctness — *not just testing*. Key approaches:

1. **Model checking**: Exhaustive state-space exploration (finite systems)
2. **Theorem proving**: Interactive/automated provers (Coq, Isabelle, Lean)
3. **Static analysis**: Automated approximation of program behavior
4. **Design by Contract**: Runtime assertions as lightweight verification (Module 3, 8)

---

## Formal Notation

| Symbol | Definition |
|--------|-----------|
| $O(f(n))$ | Asymptotic upper bound |
| $\Omega(f(n))$ | Asymptotic lower bound |
| $\Theta(f(n))$ | Tight bound ($O$ and $\Omega$ simultaneously) |
| BST invariant | $\forall v \in T: (\forall u \in T_L(v): u < v) \land (\forall w \in T_R(v): w > v)$ |
| Heap invariant | $\forall v \in T: v \leq v.\text{left} \land v \leq v.\text{right}$ |

---

## Worked Examples

### Example 1: BST Insert Correctness

**Claim:** Inserting a value $x$ into a valid BST produces a valid BST.

**Proof by structural induction on the BST.**

**Base:** Empty tree → single node $x$ → valid BST. ✓

**Inductive step:** Let $T$ be a valid BST with root $r$.
- If $x < r$: by IH, inserting $x$ into $T_L$ produces a valid BST. The new $T_L$' contains only values $< r$ (since $T_L$ did, and $x < r$). So the full tree is a valid BST. ✓
- If $x > r$: symmetric argument on $T_R$. ✓
- If $x = r$: depends on policy (ignore, update, or allow duplicates).

$\blacksquare$

### Example 2: Heap Insert (Bubble Up)

**Claim:** After inserting at the end of the array and bubbling up, the min-heap property is restored.

**Proof outline:**
1. Place new element at position $n$ (next available in complete tree).
2. While element is less than its parent, swap with parent.
3. **Loop invariant:** The heap property holds everywhere except possibly between the current node and its parent.
4. **Termination:** On each swap, the element moves to a lower index ($\lfloor(i-1)/2\rfloor < i$). Terminates at index 0.
5. At termination, either the element is $\geq$ its parent, or it's at the root. Either way, the heap property is fully restored.

$\blacksquare$

### Example 3: Big-O Proof for BST Search

**Claim:** BST search is $O(h)$ where $h$ is the tree height.

**Proof:** Each comparison moves the search one level down. The tree has $h + 1$ levels. At most $h + 1$ comparisons are made. So search is $O(h)$.

For a balanced BST: $h = O(\log n)$, so search is $O(\log n)$.
For a degenerate BST: $h = n - 1$, so search is $O(n)$.

### Example 4: Build-Heap is $O(n)$

The naive analysis gives $O(n \log n)$ (call siftDown $n/2$ times, each $O(\log n)$). But a tighter analysis uses the observation that most nodes are near the bottom:

$$\sum_{k=0}^{h} \frac{n}{2^{k+1}} \cdot k = O(n) \sum_{k=0}^{\infty} \frac{k}{2^{k+1}} = O(n)$$

This is an application of the sum formula techniques from Module 6.

### Example 5: Formal Verification of `reverseArray`

Using Hoare logic (Module 8), we can verify array reversal:

**Specification:**
- **Pre:** $a$ is an array of length $n$, $a_0 = A$
- **Post:** $a[i] = A[n - 1 - i]$ for all $0 \leq i < n$

**Loop invariant:** At iteration $j$:
- $a[i] = A[n - 1 - i]$ for $0 \leq i < j$
- $a[n - 1 - i] = A[i]$ for $0 \leq i < j$
- $a[i] = A[i]$ for $j \leq i \leq n - 1 - j$

**Variant:** $\lfloor n/2 \rfloor - j$ (decreases each iteration, bounded below by 0).

---

## Proof Techniques Spotlight

### Course Proof Techniques Synthesis

| Module | Proof Technique | Used in Trees |
|--------|----------------|---------------|
| 1 | Direct proof, counterexample | Proving a tree is *not* balanced |
| 2 | Modular arithmetic | Array-based heap indexing |
| 3 | Contrapositive, contradiction | If not balanced, height $\neq O(\log n)$ |
| 4 | Element-chasing for sets | Proving correctness of tree-to-set operations |
| 5 | Function composition | Tree traversal = composition of recursive calls |
| 6 | Induction: weak, strong, structural | All tree proofs |
| 7 | Counting, pigeonhole | Catalan numbers, number of tree shapes |
| 8 | Loop invariants, termination | Iterative tree operations, heap operations |
| 9 | All of the above! | BST/heap correctness |

---

## Java Deep Dive

```java
import java.util.*;

public class TreeApplications {

    // ========== BST ==========

    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int v) { this.value = v; }
        TreeNode(int v, TreeNode l, TreeNode r) {
            this.value = v; this.left = l; this.right = r;
        }
    }

    // --- BST Search ---
    public static TreeNode bstSearch(TreeNode t, int key) {
        if (t == null) return null;
        if (key < t.value) return bstSearch(t.left, key);
        if (key > t.value) return bstSearch(t.right, key);
        return t;
    }

    // --- BST Insert ---
    public static TreeNode bstInsert(TreeNode t, int key) {
        if (t == null) return new TreeNode(key);
        if (key < t.value) t.left = bstInsert(t.left, key);
        else if (key > t.value) t.right = bstInsert(t.right, key);
        // key == t.value: no duplicates
        return t;
    }

    // --- BST Delete ---
    public static TreeNode bstDelete(TreeNode t, int key) {
        if (t == null) return null;
        if (key < t.value) {
            t.left = bstDelete(t.left, key);
        } else if (key > t.value) {
            t.right = bstDelete(t.right, key);
        } else {
            // Found node to delete
            if (t.left == null) return t.right;
            if (t.right == null) return t.left;
            // Two children: replace with in-order successor
            TreeNode successor = findMin(t.right);
            t.value = successor.value;
            t.right = bstDelete(t.right, successor.value);
        }
        return t;
    }

    public static TreeNode findMin(TreeNode t) {
        while (t.left != null) t = t.left;
        return t;
    }

    // --- BST Validity Check ---
    public static boolean isValidBST(TreeNode t) {
        return isValidBST(t, Integer.MIN_VALUE, Integer.MAX_VALUE);
    }

    private static boolean isValidBST(TreeNode t, int min, int max) {
        if (t == null) return true;
        if (t.value <= min || t.value >= max) return false;
        return isValidBST(t.left, min, t.value)
            && isValidBST(t.right, t.value, max);
    }

    // --- In-Order Traversal (should be sorted for BST) ---
    public static List<Integer> inOrder(TreeNode t) {
        List<Integer> result = new ArrayList<>();
        inOrderHelper(t, result);
        return result;
    }

    private static void inOrderHelper(TreeNode t, List<Integer> result) {
        if (t == null) return;
        inOrderHelper(t.left, result);
        result.add(t.value);
        inOrderHelper(t.right, result);
    }

    // --- Height ---
    public static int height(TreeNode t) {
        if (t == null) return -1;
        return 1 + Math.max(height(t.left), height(t.right));
    }

    // ========== MIN-HEAP ==========

    static class MinHeap {
        private int[] data;
        private int size;

        public MinHeap(int capacity) {
            data = new int[capacity];
            size = 0;
        }

        public int size() { return size; }

        public int peek() {
            if (size == 0) throw new NoSuchElementException("Heap is empty");
            return data[0];
        }

        public void insert(int value) {
            if (size == data.length) {
                data = Arrays.copyOf(data, data.length * 2);
            }
            data[size] = value;
            bubbleUp(size);
            size++;
            assert checkHeapInvariant() : "Heap invariant violated after insert";
        }

        public int extractMin() {
            if (size == 0) throw new NoSuchElementException("Heap is empty");
            int min = data[0];
            size--;
            data[0] = data[size];
            siftDown(0);
            assert checkHeapInvariant() : "Heap invariant violated after extractMin";
            return min;
        }

        private void bubbleUp(int i) {
            // Invariant: heap property holds everywhere except
            // possibly between data[i] and data[parent(i)]
            while (i > 0 && data[i] < data[parent(i)]) {
                swap(i, parent(i));
                i = parent(i);
            }
            // Post: heap property fully restored
        }

        private void siftDown(int i) {
            // Variant: distance from i to bottom level (decreases each step)
            while (leftChild(i) < size) {
                int smallest = i;
                int left = leftChild(i);
                int right = rightChild(i);
                if (left < size && data[left] < data[smallest]) smallest = left;
                if (right < size && data[right] < data[smallest]) smallest = right;
                if (smallest == i) break;
                swap(i, smallest);
                i = smallest;
            }
        }

        private int parent(int i) { return (i - 1) / 2; }
        private int leftChild(int i) { return 2 * i + 1; }
        private int rightChild(int i) { return 2 * i + 2; }

        private void swap(int i, int j) {
            int tmp = data[i]; data[i] = data[j]; data[j] = tmp;
        }

        // Verify heap invariant
        public boolean checkHeapInvariant() {
            for (int i = 1; i < size; i++) {
                if (data[i] < data[parent(i)]) return false;
            }
            return true;
        }

        @Override
        public String toString() {
            return Arrays.toString(Arrays.copyOf(data, size));
        }
    }

    // ========== BIG-O COMPLEXITY MEASUREMENT ==========

    public static void measureBSTComplexity() {
        System.out.println("--- BST Operation Timing ---\n");
        int[] sizes = {1000, 10000, 100000};
        Random rng = new Random(42);

        for (int n : sizes) {
            // Balanced BST (from sorted array)
            int[] sorted = new int[n];
            for (int i = 0; i < n; i++) sorted[i] = i;
            TreeNode balanced = buildBalanced(sorted, 0, n - 1);

            // Degenerate BST (insert in order)
            TreeNode degenerate = null;
            int degN = Math.min(n, 10000); // cap to avoid stack overflow
            for (int i = 0; i < degN; i++) {
                degenerate = bstInsert(degenerate, i);
            }

            // Search timing
            long start = System.nanoTime();
            for (int i = 0; i < 1000; i++) {
                bstSearch(balanced, rng.nextInt(n));
            }
            long balancedTime = System.nanoTime() - start;

            System.out.printf("n=%6d | Balanced BST h=%d, 1000 searches: %,d ns%n",
                    n, height(balanced), balancedTime);
        }
    }

    private static TreeNode buildBalanced(int[] sorted, int lo, int hi) {
        if (lo > hi) return null;
        int mid = lo + (hi - lo) / 2;
        return new TreeNode(sorted[mid],
                buildBalanced(sorted, lo, mid - 1),
                buildBalanced(sorted, mid + 1, hi));
    }

    // ========== FORMAL VERIFICATION DEMO ==========

    // Verified reverseArray with loop invariant and variant
    public static void reverseArray(int[] a) {
        int n = a.length;
        // Pre: a is a valid array
        int[] original = Arrays.copyOf(a, n); // ghost variable for verification
        for (int j = 0; j < n / 2; j++) {
            // Invariant: a[i] = original[n-1-i] for 0 <= i < j
            //            a[n-1-i] = original[i] for 0 <= i < j
            //            a[i] = original[i] for j <= i <= n-1-j
            // Variant: n/2 - j
            int tmp = a[j];
            a[j] = a[n - 1 - j];
            a[n - 1 - j] = tmp;
            // Check invariant
            for (int i = 0; i <= j; i++) {
                assert a[i] == original[n - 1 - i] : "Invariant violated at i=" + i;
                assert a[n - 1 - i] == original[i] : "Invariant violated (mirror)";
            }
        }
        // Post: a[i] = original[n-1-i] for all i
        for (int i = 0; i < n; i++) {
            assert a[i] == original[n - 1 - i] : "Postcondition violated";
        }
    }

    // ========== DEMO ==========

    public static void main(String[] args) {
        System.out.println("=== Trees, Complexity and Verification ===\n");

        // BST Demo
        System.out.println("--- BST Operations ---");
        TreeNode bst = null;
        int[] keys = {50, 30, 70, 20, 40, 60, 80};
        for (int k : keys) bst = bstInsert(bst, k);
        System.out.println("In-order: " + inOrder(bst));
        System.out.println("Valid BST? " + isValidBST(bst));
        System.out.println("Height: " + height(bst));

        System.out.println("Search 40: " + (bstSearch(bst, 40) != null));
        System.out.println("Search 99: " + (bstSearch(bst, 99) != null));

        bst = bstDelete(bst, 30);
        System.out.println("After delete 30: " + inOrder(bst));
        System.out.println("Still valid BST? " + isValidBST(bst));

        // Min-Heap Demo
        System.out.println("\n--- Min-Heap ---");
        MinHeap heap = new MinHeap(16);
        int[] vals = {42, 17, 8, 31, 5, 23, 12, 3};
        for (int v : vals) {
            heap.insert(v);
            System.out.println("  Inserted " + v + ": " + heap);
        }
        System.out.println("Extracting in order:");
        while (heap.size() > 0) {
            System.out.println("  " + heap.extractMin());
        }

        // Big-O Measurement
        System.out.println("\n--- Complexity Measurement ---");
        measureBSTComplexity();

        // Verified Reverse
        System.out.println("\n--- Verified reverseArray ---");
        int[] arr = {1, 2, 3, 4, 5, 6, 7, 8};
        System.out.println("Before: " + Arrays.toString(arr));
        reverseArray(arr);
        System.out.println("After:  " + Arrays.toString(arr));

        // Formal Verification Survey
        System.out.println("\n--- Formal Verification Tools ---");
        System.out.println("Tool          | Type             | Language");
        System.out.println("Coq           | Theorem prover   | Gallina");
        System.out.println("Isabelle/HOL  | Theorem prover   | Isar");
        System.out.println("Lean          | Theorem prover   | Lean");
        System.out.println("Dafny         | Auto verifier    | Dafny");
        System.out.println("SPARK/Ada     | Design by Contract| Ada subset");
        System.out.println("JML           | Spec language    | Java");
        System.out.println("TLA+          | Model checker    | TLA+");
        System.out.println("\nIn this course, we used a lightweight form of");
        System.out.println("verification: Hoare logic + assertions in Java.");
    }
}
```

---

## Historical Context

**Binary search trees** date to the late 1950s (Conway and Berners-Lee, 1959). The problem of balancing them has driven decades of innovation: AVL trees (1962), red-black trees (1978), splay trees (1985), and treaps (1989).

**Heaps** were introduced by J.W.J. Williams in 1964 alongside heapsort. The elegant array representation and the $O(n)$ build-heap algorithm make them a textbook favorite.

**Big-O notation** was introduced by Paul Bachmann (1894) and made standard by Edmund Landau. Donald Knuth popularized it in computer science.

**Formal verification** has a rich history: Floyd-Hoare logic (1969), Dijkstra's weakest precondition calculus (1975), and modern provers like Coq (used to verify the C compiler CompCert) and seL4 (a verified OS microkernel).

---

## Slide-Ready Problem Sets

### Slide Set A: Conceptual Questions

**A1.** What is the BST invariant? Why does in-order traversal produce sorted output?

**A2.** Describe the difference between a BST and a heap. Can a heap be used for sorted output?

**A3.** Explain why balanced BST search is $O(\log n)$ while degenerate BST search is $O(n)$.

**A4.** What does formal verification guarantee that testing cannot?

### Slide Set B: Proof Problems

**B1.** Prove BST insert preserves the BST invariant by structural induction.

**B2.** Prove heap bubble-up terminates and restores the heap property.

**B3.** Prove: $f(n) = 3n^2 + 5n + 7$ is $O(n^2)$. Find explicit $c$ and $n_0$.

**B4.** State the loop invariant for BST search. Prove correctness.

### Slide Set C: Java Coding Problems

**C1.** Implement BST insert, search, and delete. Verify with in-order traversal.

**C2.** Implement a min-heap with insert and extractMin. Verify the heap invariant with assertions.

**C3.** Time BST search for balanced vs degenerate trees of increasing size. Plot or display the results.

---

## Full Problem Set

### Discrete Math Problems

**DM1.** Prove that in-order traversal of a valid BST produces values in ascending order (by structural induction).

**DM2.** Prove: $5n^3 + 2n^2 + n = O(n^3)$. Exhibit $c$ and $n_0$.

**DM3.** Prove: bubble-up in a min-heap terminates (state the variant function) and restores the heap invariant (state and verify the loop invariant).

**DM4.** Prove: build-heap is $O(n)$, not $O(n \log n)$. Use the sum $\sum_{k=0}^{h} k \cdot 2^{h-k}$.

**DM5.** Prove: BST delete preserves the BST invariant (consider all three cases: leaf, one child, two children).

**DM6.** Starting from the Hoare triple framework (Module 8), write the full specification for `bstSearch(t, key)` including precondition, postcondition, and loop/recursion variant.

### Java Programming Problems

**JP1.** Implement a complete BST with insert, search, delete, findMin, findMax, inOrder. Verify that in-order output is always sorted.

**JP2.** Implement a min-heap with invariant checking. Show it can function as a priority queue.

**JP3.** Implement heapsort using your min-heap. Prove a sorting invariant.

**JP4.** Measure and compare search times for balanced BST, degenerate BST, and `Arrays.binarySearch` on the same sorted data.

**JP5.** Implement a verified `reverseArray` with assertions checking the loop invariant and postcondition. Run with `-ea` to enable assertions.

### Bridge Problems

**BR1.** Module 8 + 9: Write the complete Hoare-logic correctness proof for `heapInsert`: precondition, loop invariant, variant, postcondition.

**BR2.** Modules 6–9 Synthesis: The number of structurally distinct BSTs with $n$ keys is the $n$-th Catalan number (Module 7 bridge). Use structural induction (Module 6) to prove the recurrence $C_n = \sum_{i=0}^{n-1} C_i \cdot C_{n-1-i}$. Then implement it in Java and verify against the closed form $C_n = \frac{1}{n+1}\binom{2n}{n}$.

**BR3.** Reflection: Write a one-page essay on the role of formal verification in software engineering. How do the proof techniques from this course (direct proof, induction, loop invariants, specifications) form a foundation for tools like Coq or Dafny?

---

## Solutions

### DM1 Solution

**Claim:** In-order traversal of a valid BST produces values in ascending order.

**Proof by structural induction.**

**Base:** Empty tree produces empty list. ✓ Single node produces [v]. ✓

**Inductive step:** BST $T$ with root $r$, left subtree $T_L$, right subtree $T_R$. By BST invariant: all values in $T_L < r < $ all values in $T_R$.

By IH: inOrder($T_L$) is ascending and inOrder($T_R$) is ascending.

inOrder($T$) = inOrder($T_L$) ++ [$r$] ++ inOrder($T_R$).

- inOrder($T_L$) is ascending (by IH).
- Last element of inOrder($T_L$) $< r$ (by BST invariant).
- $r <$ first element of inOrder($T_R$) (by BST invariant).
- inOrder($T_R$) is ascending (by IH).

Therefore inOrder($T$) is ascending. $\blacksquare$

### DM2 Solution

We need $c, n_0$ such that $5n^3 + 2n^2 + n \leq cn^3$ for all $n \geq n_0$.

For $n \geq 1$: $n \leq n^3$ and $n^2 \leq n^3$. So $5n^3 + 2n^2 + n \leq 5n^3 + 2n^3 + n^3 = 8n^3$.

Choose $c = 8, n_0 = 1$. $\blacksquare$

### JP2 Solution Sketch

```java
MinHeap pq = new MinHeap(16);
// Priority queue usage: process tasks by priority
pq.insert(5);  // low priority task
pq.insert(1);  // highest priority
pq.insert(3);
while (pq.size() > 0) {
    System.out.println("Processing priority: " + pq.extractMin());
}
// Output: 1, 3, 5  (ascending order = highest priority first)
```
