# Module 9 – Capstone Assignment: Verified Data Structure

## Overview

This capstone assignment synthesizes Modules 7–9 and draws on proof techniques from the entire course. You will choose a data structure, specify it formally, implement it in Java, prove its correctness and analyze its complexity, and reflect on the role of formal verification in software engineering.

**This assignment replaces a final exam project. Treat it as a portfolio piece.**

---

## Requirements

### Step 1: Choose a Data Structure

Pick **one** of the following:

| Option | Data Structure | Key Operations |
|--------|---------------|----------------|
| A | Balanced BST (AVL or Red-Black) | insert, delete, search, rebalance |
| B | Min-Heap / Priority Queue | insert, extractMin, buildHeap, heapSort |
| C | Hash Table (separate chaining) | put, get, delete, resize |
| D | Graph (adjacency list) + BFS/DFS | addEdge, bfs, dfs, shortestPath |

### Step 2: Formal Specification (20 points)

Write a complete specification for your data structure:

1. **Data invariant:** State the structural invariant (e.g., BST ordering, heap property, load factor bound).
2. **Preconditions and postconditions** for each operation (Hoare-triple style, Module 8).
3. **Representation function:** How does the Java implementation represent the abstract data type?

### Step 3: Java Implementation (30 points)

Implement the data structure in Java with:

1. All core operations from the table above.
2. **Assertions** that check the data invariant after each mutating operation.
3. **Clean code:** meaningful names, appropriate access modifiers, no unnecessary coupling.
4. A `main` method that demonstrates all operations and runs the verification suite.

### Step 4: Correctness Proofs (30 points)

Provide written proofs for at least **three** of the following (choose those relevant to your data structure):

1. **Insert preserves the invariant** (structural induction or loop invariant).
2. **Delete preserves the invariant** (case analysis + induction).
3. **Search is correct** (returns the right answer; loop invariant or recursion).
4. **Rebalance / resize preserves the invariant** (for AVL rotation, heap sift, hash resize).
5. **Termination** of each operation (state the variant function).

Each proof should use the techniques from this course:
- Direct proof (Module 1)
- Contradiction / contrapositive (Module 3)
- Structural induction (Module 6)
- Loop invariants + Hoare triples (Module 8)

### Step 5: Complexity Analysis (10 points)

1. State the time complexity of each operation (Big-O).
2. **Prove** at least one complexity claim rigorously (e.g., BST search is $O(h)$; heap insert is $O(\log n)$; hash table amortized $O(1)$ with good load factor).
3. Include **empirical measurements**: time operations for $n = 1000, 5000, 10000, 50000, 100000$. Does the measured growth match the theoretical bound?

### Step 6: Counting and Combinatorics Connection (5 points)

Connect your data structure to a counting problem from Module 7:

| If you chose... | Counting connection |
|-----------------|-------------------|
| BST | Number of distinct BSTs with $n$ keys = Catalan number $C_n$ |
| Heap | Number of distinct heaps with values $\{1, ..., n\}$ |
| Hash table | Expected collisions via birthday problem (Module 7 Class 3) |
| Graph | Number of spanning trees, or number of paths of length $k$ |

Compute or implement the relevant counting formula.

### Step 7: Reflection (5 points)

Write a 1–2 page reflection addressing:

1. How do the proof techniques from this course (direct proof, induction, invariants, specifications) form a foundation for formal verification?
2. What would it take to verify your implementation in a tool like Dafny or Coq?
3. What are the practical limits of formal verification in real software engineering?

---

## Rubric

| Component | Points | Criteria |
|-----------|--------|----------|
| Specification | 20 | Invariant, pre/post for all ops, representation function |
| Implementation | 30 | Correct, assertions, clean code, demo |
| Proofs | 30 | 3+ rigorous proofs, correct technique, clear presentation |
| Complexity | 10 | Big-O stated, 1+ proved, empirical data |
| Counting | 5 | Correct counting connection, computed/implemented |
| Reflection | 5 | Thoughtful, connects course themes, specific examples |
| **Total** | **100** | |

---

## Solution Key

### Option B: Min-Heap (Complete Example)

#### Specification

**Data invariant (Heap Property):**
For all indices $1 \leq i < n$: $\text{data}[\lfloor(i-1)/2\rfloor] \leq \text{data}[i]$.

Equivalently: every node's value is $\leq$ its children's values.

**Complete binary tree invariant:** Elements occupy indices $0, 1, ..., n-1$ with no gaps.

**Representation function:** Abstract priority queue $\{(v_0, v_1, ..., v_{n-1})\}$ where $v_0$ is the minimum ↔ Java `int[] data` with `data[0] = min`.

**Operations:**

| Operation | Pre | Post |
|-----------|-----|------|
| `insert(x)` | heap invariant holds, size $= n$ | heap invariant holds, size $= n + 1$, $x$ is in the heap |
| `extractMin()` | heap invariant holds, size $> 0$ | returns old `data[0]`, size decremented, heap invariant holds |
| `peek()` | size $> 0$ | returns `data[0]` (the minimum) |
| `buildHeap(a)` | $a$ is any array | heap invariant holds, multiset of elements preserved |

#### Implementation

```java
import java.util.*;

public class CapstoneHeap {

    private int[] data;
    private int size;

    public CapstoneHeap(int capacity) {
        data = new int[capacity];
        size = 0;
    }

    // --- Invariant Check ---
    public boolean checkInvariant() {
        for (int i = 1; i < size; i++) {
            if (data[i] < data[(i - 1) / 2]) return false;
        }
        return true;
    }

    // --- Insert ---
    public void insert(int value) {
        // Pre: checkInvariant()
        if (size == data.length) data = Arrays.copyOf(data, data.length * 2);
        data[size] = value;
        bubbleUp(size);
        size++;
        assert checkInvariant() : "Invariant violated after insert";
        // Post: checkInvariant(), size increased by 1, value is in heap
    }

    private void bubbleUp(int i) {
        // Loop invariant: heap property holds everywhere except
        // possibly between data[i] and data[parent(i)]
        // Variant: i (decreases each iteration, bounded below by 0)
        while (i > 0 && data[i] < data[(i - 1) / 2]) {
            swap(i, (i - 1) / 2);
            i = (i - 1) / 2;
        }
    }

    // --- Extract Min ---
    public int extractMin() {
        // Pre: size > 0, checkInvariant()
        if (size == 0) throw new NoSuchElementException("Heap is empty");
        int min = data[0];
        size--;
        data[0] = data[size];
        siftDown(0);
        assert checkInvariant() : "Invariant violated after extractMin";
        // Post: returns old minimum, size decreased by 1, checkInvariant()
        return min;
    }

    private void siftDown(int i) {
        // Loop invariant: heap property holds everywhere except
        // possibly between data[i] and its children
        // Variant: floor(log2(size)) - floor(log2(i+1)) (depth remaining)
        while (2 * i + 1 < size) {
            int smallest = i;
            int left = 2 * i + 1;
            int right = 2 * i + 2;
            if (left < size && data[left] < data[smallest]) smallest = left;
            if (right < size && data[right] < data[smallest]) smallest = right;
            if (smallest == i) break;
            swap(i, smallest);
            i = smallest;
        }
    }

    // --- Peek ---
    public int peek() {
        if (size == 0) throw new NoSuchElementException("Heap is empty");
        return data[0];
    }

    // --- Build Heap ---
    public void buildHeap(int[] values) {
        data = Arrays.copyOf(values, Math.max(values.length, 16));
        size = values.length;
        // Sift down from last internal node to root
        for (int i = size / 2 - 1; i >= 0; i--) {
            siftDown(i);
        }
        assert checkInvariant() : "Invariant violated after buildHeap";
    }

    // --- Heap Sort ---
    public static int[] heapSort(int[] values) {
        CapstoneHeap h = new CapstoneHeap(values.length);
        h.buildHeap(Arrays.copyOf(values, values.length));
        int[] result = new int[values.length];
        for (int i = 0; i < result.length; i++) {
            result[i] = h.extractMin();
        }
        // Sorting invariant: result[0..i-1] is sorted and contains
        // the i smallest elements
        return result;
    }

    public int size() { return size; }

    private void swap(int i, int j) {
        int tmp = data[i]; data[i] = data[j]; data[j] = tmp;
    }

    @Override
    public String toString() {
        return Arrays.toString(Arrays.copyOf(data, size));
    }

    // ========== DEMO AND VERIFICATION ==========

    public static void main(String[] args) {
        System.out.println("=== Capstone: Verified Min-Heap ===\n");

        // Basic operations
        CapstoneHeap heap = new CapstoneHeap(16);
        int[] values = {42, 17, 8, 31, 5, 23, 12, 3, 19, 27};
        System.out.println("--- Insert ---");
        for (int v : values) {
            heap.insert(v);
            System.out.printf("  insert(%d): %s  invariant=%b%n", v, heap, heap.checkInvariant());
        }

        System.out.println("\n--- Extract ---");
        while (heap.size() > 0) {
            System.out.printf("  extractMin() = %d  remaining: %s%n", heap.extractMin(), heap);
        }

        // BuildHeap
        System.out.println("\n--- BuildHeap ---");
        heap.buildHeap(new int[]{9, 7, 5, 3, 1, 8, 6, 4, 2, 0});
        System.out.println("  Result: " + heap + "  invariant=" + heap.checkInvariant());

        // HeapSort
        System.out.println("\n--- HeapSort ---");
        int[] unsorted = {42, 17, 8, 31, 5, 23, 12, 3};
        System.out.println("  Input:  " + Arrays.toString(unsorted));
        System.out.println("  Sorted: " + Arrays.toString(heapSort(unsorted)));

        // Complexity measurement
        System.out.println("\n--- Complexity ---");
        Random rng = new Random(42);
        int[] sizes = {1000, 5000, 10000, 50000, 100000};
        System.out.println("    n    |  insert (ns/op) | extract (ns/op)");
        System.out.println("---------+-----------------+----------------");
        for (int n : sizes) {
            CapstoneHeap h = new CapstoneHeap(n);
            // Measure insert
            long start = System.nanoTime();
            for (int i = 0; i < n; i++) h.insert(rng.nextInt(n * 10));
            long insertTime = System.nanoTime() - start;
            // Measure extract
            start = System.nanoTime();
            while (h.size() > 0) h.extractMin();
            long extractTime = System.nanoTime() - start;
            System.out.printf("%7d  |  %,13d  |  %,13d%n",
                    n, insertTime / n, extractTime / n);
        }

        // Counting connection: number of distinct heaps
        System.out.println("\n--- Counting: Distinct Heaps ---");
        System.out.println("Number of distinct min-heaps on {1,...,n}:");
        for (int n = 1; n <= 10; n++) {
            System.out.printf("  n=%2d: %d%n", n, countHeaps(n));
        }
    }

    // Number of distinct min-heaps on {1,...,n}
    // The root must be 1. Distribute remaining n-1 into left (size l)
    // and right (size r) subtrees of a complete tree.
    // f(n) = C(n-1, l) * f(l) * f(r) where l,r are subtree sizes
    static long countHeaps(int n) {
        if (n <= 1) return 1;
        long[] dp = new long[n + 1];
        dp[0] = 1;
        dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            int l = leftSubtreeSize(i);
            int r = i - 1 - l;
            dp[i] = binomial(i - 1, l) * dp[l] * dp[r];
        }
        return dp[n];
    }

    // For a complete binary tree with n nodes, size of left subtree
    static int leftSubtreeSize(int n) {
        if (n <= 1) return 0;
        int h = (int) (Math.log(n) / Math.log(2)); // height
        int maxLastLevel = (int) Math.pow(2, h);    // max nodes at last level
        int actualLastLevel = n - ((int) Math.pow(2, h) - 1);
        int leftLastLevel = Math.min(actualLastLevel, maxLastLevel / 2);
        return (int) Math.pow(2, h - 1) - 1 + leftLastLevel;
    }

    static long binomial(int n, int k) {
        if (k > n) return 0;
        if (k == 0 || k == n) return 1;
        long result = 1;
        k = Math.min(k, n - k);
        for (int i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }
}
```

#### Correctness Proofs

**Proof 1: Insert preserves the heap invariant.**

*Pre:* Heap property holds for indices $0, ..., n-1$.

*Operation:* Place new element at index $n$. Call bubbleUp($n$).

*Loop invariant for bubbleUp:* The heap property holds for all parent-child pairs except possibly $(\text{parent}(i), i)$, where $i$ is the current position of the new element.

*Init:* Before the loop, the only possible violation is between $\text{data}[n]$ and $\text{data}[\text{parent}(n)]$.

*Maintenance:* If $\text{data}[i] < \text{data}[\text{parent}(i)]$, we swap. After the swap:
- The old parent's value moves to $i$, restoring the heap property between $i$ and $i$'s children (since the parent was $\leq$ both its old children, and the new child at $i$ is the old parent ≥ the new child's children).
- The only new possible violation is between $\text{parent}(i)$ (now holding the new element) and $\text{parent}(\text{parent}(i))$.

*Variant:* $i$ decreases each iteration ($\text{parent}(i) < i$ for $i > 0$). Bounded below by 0.

*Termination:* Loop exits when $i = 0$ or $\text{data}[i] \geq \text{data}[\text{parent}(i)]$. In both cases, the heap property is fully restored. $\blacksquare$

**Proof 2: ExtractMin returns the minimum and preserves the invariant.**

*Pre:* Heap property holds, size $> 0$.

*Claim:* `data[0]` is the minimum.

*Proof:* By induction on the path from any node to the root: each node's value $\geq$ its parent's $\geq$ ... $\geq$ root. So root is minimum.

*After extracting:* We place `data[size-1]` at index 0 and call siftDown(0).

*Loop invariant for siftDown:* Heap property holds everywhere except possibly between $\text{data}[i]$ and its children.

*Maintenance:* We find the smallest of $\{i, \text{left}(i), \text{right}(i)\}$. If it's not $i$, we swap with the smallest child. After the swap, the heap property holds at the old position $i$, and the possible violation moves down one level.

*Variant:* Distance from $i$ to the bottom. Decreases each step.

*Termination:* The loop exits when $i$ is a leaf or $\text{data}[i] \leq$ both children. Heap property fully restored. $\blacksquare$

**Proof 3: BuildHeap produces a valid heap in $O(n)$ time.**

*Correctness:* Process nodes from index $\lfloor n/2 \rfloor - 1$ down to 0. After processing node $i$, the subtree rooted at $i$ is a valid heap (by induction: its children's subtrees were already valid).

*Time complexity:* At height $k$ (measured from bottom), there are at most $\lceil n / 2^{k+1} \rceil$ nodes, each requiring $O(k)$ work for siftDown. Total:

$$\sum_{k=0}^{\lfloor \log_2 n \rfloor} \frac{n}{2^{k+1}} \cdot k \leq \frac{n}{2} \sum_{k=0}^{\infty} \frac{k}{2^k} = \frac{n}{2} \cdot 2 = n$$

So buildHeap is $O(n)$. $\blacksquare$

#### Complexity Analysis

| Operation | Time | Why |
|-----------|------|-----|
| insert | $O(\log n)$ | bubbleUp traverses at most $h = \lfloor \log_2 n \rfloor$ levels |
| extractMin | $O(\log n)$ | siftDown traverses at most $h$ levels |
| peek | $O(1)$ | Direct array access |
| buildHeap | $O(n)$ | Proved above |
| heapSort | $O(n \log n)$ | $n$ extractMin operations, each $O(\log n)$ |

#### Counting Connection

The number of distinct min-heaps on $\{1, ..., n\}$ with a fixed complete binary tree shape is computed by `countHeaps(n)`. This uses the recursive formula:

$$f(n) = \binom{n-1}{l} \cdot f(l) \cdot f(r)$$

where $l$ and $r$ are the sizes of the left and right subtrees. The root must be 1 (minimum). We choose which $l$ of the remaining $n-1$ elements go left.

First values: $f(1) = 1, f(2) = 1, f(3) = 1, f(4) = 3, f(5) = 8, f(6) = 20, f(7) = 80$.

#### Reflection (Key Points)

1. **Course foundations → formal verification:** Direct proofs establish base facts. Induction (weak, strong, structural) proves properties of recursive structures. Loop invariants prove iterative algorithms correct. Specifications (pre/post) define what "correct" means. Together, these form exactly what tools like Dafny and Coq formalize.

2. **Verification in Dafny:** Dafny uses `requires` (pre), `ensures` (post), `invariant` (loop invariant), `decreases` (variant) — exactly the concepts from Module 8. The proofs we wrote by hand would become machine-checked annotations.

3. **Practical limits:** Full verification is expensive (10×–100× development time). Most practical for safety-critical systems (avionics, medical devices, cryptographic libraries). For typical software, Design by Contract + thorough testing is more cost-effective.
