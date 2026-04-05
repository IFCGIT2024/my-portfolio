# Module 9 – Lab: Trees, Heaps and Verified Data Structures

## Overview

In this lab you will implement a BST and a min-heap from scratch, verify their invariants with assertions and structural-induction-style checks, and connect tree properties to complexity. This lab draws on proof techniques from the entire course.

**Estimated time:** 3 hours

---

## Part 1: Binary Search Tree

Build a complete BST class with insert, search, delete, and traversal.

### Exercises

1. Implement `insert(int key)` — recursive, returns new root.
2. Implement `search(int key)` — returns `true`/`false`.
3. Implement `delete(int key)` — handle leaf, one-child, and two-child cases.
4. Implement `inOrder()` — return a `List<Integer>`.
5. After each insert and delete, assert: (a) `isValidBST()` returns `true`; (b) `inOrder()` is sorted.
6. Insert the values 50, 30, 70, 20, 40, 60, 80. Print in-order. Delete 30 and 70. Print in-order again.

### Extension

7. Implement `findKthSmallest(int k)` using in-order traversal.
8. Implement `rangeSearch(int lo, int hi)` — return all keys in $[lo, hi]$.

---

## Part 2: Min-Heap and Priority Queue

Build a min-heap backed by an array.

### Exercises

1. Implement `insert(int value)` with bubble-up.
2. Implement `extractMin()` with sift-down.
3. Implement `checkHeapInvariant()` — verify $\text{data}[i] \leq \text{data}[2i+1]$ and $\text{data}[i] \leq \text{data}[2i+2]$ for all valid indices.
4. After each insert and extractMin, assert the heap invariant holds.
5. Insert values [42, 17, 8, 31, 5, 23, 12, 3]. Print the array after each insertion.
6. Extract all values and verify you get them in ascending order.

### Extension

7. Implement `buildHeap(int[] values)` using the $O(n)$ bottom-up algorithm (sift-down from $\lfloor n/2 \rfloor - 1$ to 0).
8. Implement `heapSort(int[] values)` using your heap.

---

## Part 3: Tree Property Verification

Verify the full binary tree theorem and balanced tree properties from Class 2.

### Exercises

1. Build full binary trees of heights 0–8. For each, verify:
   - $L = I + 1$
   - $N = 2I + 1$
   - $N = 2^{h+1} - 1$
2. Build balanced BSTs from sorted arrays of sizes 1–127. For each, verify:
   - `isBalanced()` returns `true`
   - Height $\leq \lfloor \log_2 n \rfloor$
3. Build a degenerate tree with 100 nodes. Verify height = 99 and `isBalanced()` = false.

---

## Part 4: Complexity Measurement

### Exercises

1. Build balanced BSTs of sizes $n = 1000, 5000, 10000, 50000, 100000$.
2. For each, time 10,000 random searches. Record average time per search.
3. Print a table showing $n$, height, and average search time.
4. Observe: does the growth pattern match $O(\log n)$?

### Extension

5. Compare BST search time with Java's `Arrays.binarySearch` on the same data.
6. Compare heap extractMin sequence timing with `Collections.sort`.

---

## Starter Code

```java
import java.util.*;

public class Module9Lab {

    // ========== TreeNode ==========
    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int v) { this.value = v; }
        TreeNode(int v, TreeNode l, TreeNode r) {
            this.value = v; this.left = l; this.right = r;
        }
    }

    // ========== BST ==========

    public static TreeNode bstInsert(TreeNode t, int key) {
        // TODO: Implement recursive BST insert
        return t;
    }

    public static boolean bstSearch(TreeNode t, int key) {
        // TODO: Implement recursive BST search
        return false;
    }

    public static TreeNode bstDelete(TreeNode t, int key) {
        // TODO: Implement BST delete (leaf, one child, two children)
        return t;
    }

    public static TreeNode findMin(TreeNode t) {
        // TODO: Find minimum node
        return t;
    }

    public static List<Integer> inOrder(TreeNode t) {
        List<Integer> result = new ArrayList<>();
        // TODO: Fill result with in-order traversal
        return result;
    }

    public static boolean isValidBST(TreeNode t) {
        // TODO: Validate BST invariant
        return false;
    }

    public static int height(TreeNode t) {
        // TODO
        return -1;
    }

    public static int countLeaves(TreeNode t) {
        // TODO
        return 0;
    }

    public static int countInternal(TreeNode t) {
        // TODO
        return 0;
    }

    public static int size(TreeNode t) {
        // TODO
        return 0;
    }

    public static boolean isFull(TreeNode t) {
        // TODO
        return false;
    }

    public static boolean isBalanced(TreeNode t) {
        // TODO
        return false;
    }

    public static TreeNode buildFull(int height) {
        // TODO: Build a full binary tree of given height
        return null;
    }

    public static TreeNode buildBalancedBST(int[] sorted, int lo, int hi) {
        // TODO: Build balanced BST from sorted array
        return null;
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

        public void insert(int value) {
            // TODO: Insert and bubble up
        }

        public int extractMin() {
            // TODO: Extract root and sift down
            return -1;
        }

        private void bubbleUp(int i) {
            // TODO
        }

        private void siftDown(int i) {
            // TODO
        }

        public boolean checkHeapInvariant() {
            // TODO: Verify parent <= children for all nodes
            return false;
        }

        private int parent(int i) { return (i - 1) / 2; }
        private int leftChild(int i) { return 2 * i + 1; }
        private int rightChild(int i) { return 2 * i + 2; }

        private void swap(int i, int j) {
            int tmp = data[i]; data[i] = data[j]; data[j] = tmp;
        }

        @Override
        public String toString() {
            return Arrays.toString(Arrays.copyOf(data, size));
        }
    }

    // ========== MAIN ==========

    public static void main(String[] args) {
        // Part 1: BST
        System.out.println("=== Part 1: BST ===");
        TreeNode bst = null;
        int[] keys = {50, 30, 70, 20, 40, 60, 80};
        for (int k : keys) {
            bst = bstInsert(bst, k);
            assert isValidBST(bst) : "BST invariant violated after insert " + k;
        }
        System.out.println("In-order: " + inOrder(bst));
        bst = bstDelete(bst, 30);
        bst = bstDelete(bst, 70);
        System.out.println("After deleting 30,70: " + inOrder(bst));
        assert isValidBST(bst) : "BST invariant violated after delete";

        // Part 2: Min-Heap
        System.out.println("\n=== Part 2: Min-Heap ===");
        MinHeap heap = new MinHeap(16);
        int[] vals = {42, 17, 8, 31, 5, 23, 12, 3};
        for (int v : vals) {
            heap.insert(v);
            assert heap.checkHeapInvariant() : "Heap invariant violated after insert " + v;
            System.out.println("  After insert " + v + ": " + heap);
        }
        System.out.println("Extract in order:");
        int prev = Integer.MIN_VALUE;
        while (heap.size() > 0) {
            int min = heap.extractMin();
            assert min >= prev : "Not in ascending order!";
            prev = min;
            System.out.println("  " + min);
        }

        // Part 3: Tree Properties
        System.out.println("\n=== Part 3: Tree Properties ===");
        for (int h = 0; h <= 8; h++) {
            TreeNode full = buildFull(h);
            int n = size(full);
            int l = countLeaves(full);
            int i = countInternal(full);
            assert l == i + 1 : "L != I+1";
            assert n == 2 * i + 1 : "N != 2I+1";
            System.out.printf("h=%d: N=%d, L=%d, I=%d%n", h, n, l, i);
        }

        // Part 4: Complexity
        System.out.println("\n=== Part 4: Complexity ===");
        Random rng = new Random(42);
        int[] sizes = {1000, 5000, 10000, 50000, 100000};
        System.out.println("    n    | height |  avg search (ns)");
        System.out.println("---------+--------+-----------------");
        for (int n : sizes) {
            int[] sorted = new int[n];
            for (int j = 0; j < n; j++) sorted[j] = j;
            TreeNode balanced = buildBalancedBST(sorted, 0, n - 1);
            long start = System.nanoTime();
            for (int j = 0; j < 10000; j++) {
                bstSearch(balanced, rng.nextInt(n));
            }
            long elapsed = System.nanoTime() - start;
            System.out.printf("%7d  |   %3d  |  %,d%n", n, height(balanced), elapsed / 10000);
        }
    }
}
```

---

## Solution Key

```java
import java.util.*;

public class Module9LabSolution {

    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int v) { this.value = v; }
        TreeNode(int v, TreeNode l, TreeNode r) {
            this.value = v; this.left = l; this.right = r;
        }
    }

    // ========== BST ==========

    public static TreeNode bstInsert(TreeNode t, int key) {
        if (t == null) return new TreeNode(key);
        if (key < t.value) t.left = bstInsert(t.left, key);
        else if (key > t.value) t.right = bstInsert(t.right, key);
        return t;
    }

    public static boolean bstSearch(TreeNode t, int key) {
        if (t == null) return false;
        if (key < t.value) return bstSearch(t.left, key);
        if (key > t.value) return bstSearch(t.right, key);
        return true;
    }

    public static TreeNode bstDelete(TreeNode t, int key) {
        if (t == null) return null;
        if (key < t.value) {
            t.left = bstDelete(t.left, key);
        } else if (key > t.value) {
            t.right = bstDelete(t.right, key);
        } else {
            if (t.left == null) return t.right;
            if (t.right == null) return t.left;
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

    public static boolean isValidBST(TreeNode t) {
        return isValidBST(t, Integer.MIN_VALUE, Integer.MAX_VALUE);
    }

    private static boolean isValidBST(TreeNode t, int min, int max) {
        if (t == null) return true;
        if (t.value <= min || t.value >= max) return false;
        return isValidBST(t.left, min, t.value)
            && isValidBST(t.right, t.value, max);
    }

    public static int height(TreeNode t) {
        if (t == null) return -1;
        return 1 + Math.max(height(t.left), height(t.right));
    }

    public static int countLeaves(TreeNode t) {
        if (t == null) return 0;
        if (t.left == null && t.right == null) return 1;
        return countLeaves(t.left) + countLeaves(t.right);
    }

    public static int countInternal(TreeNode t) {
        if (t == null) return 0;
        if (t.left == null && t.right == null) return 0;
        return 1 + countInternal(t.left) + countInternal(t.right);
    }

    public static int size(TreeNode t) {
        if (t == null) return 0;
        return 1 + size(t.left) + size(t.right);
    }

    public static boolean isFull(TreeNode t) {
        if (t == null) return true;
        if (t.left == null && t.right == null) return true;
        if (t.left == null || t.right == null) return false;
        return isFull(t.left) && isFull(t.right);
    }

    public static boolean isBalanced(TreeNode t) {
        return balancedHeight(t) != -2;
    }

    private static int balancedHeight(TreeNode t) {
        if (t == null) return -1;
        int lh = balancedHeight(t.left);
        if (lh == -2) return -2;
        int rh = balancedHeight(t.right);
        if (rh == -2) return -2;
        if (Math.abs(lh - rh) > 1) return -2;
        return 1 + Math.max(lh, rh);
    }

    public static TreeNode buildFull(int h) {
        if (h < 0) return null;
        if (h == 0) return new TreeNode(0);
        return new TreeNode(0, buildFull(h - 1), buildFull(h - 1));
    }

    public static TreeNode buildBalancedBST(int[] sorted, int lo, int hi) {
        if (lo > hi) return null;
        int mid = lo + (hi - lo) / 2;
        return new TreeNode(sorted[mid],
                buildBalancedBST(sorted, lo, mid - 1),
                buildBalancedBST(sorted, mid + 1, hi));
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
            if (size == 0) throw new NoSuchElementException();
            return data[0];
        }

        public void insert(int value) {
            if (size == data.length) data = Arrays.copyOf(data, data.length * 2);
            data[size] = value;
            bubbleUp(size);
            size++;
        }

        public int extractMin() {
            if (size == 0) throw new NoSuchElementException();
            int min = data[0];
            size--;
            data[0] = data[size];
            siftDown(0);
            return min;
        }

        private void bubbleUp(int i) {
            while (i > 0 && data[i] < data[parent(i)]) {
                swap(i, parent(i));
                i = parent(i);
            }
        }

        private void siftDown(int i) {
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

        public boolean checkHeapInvariant() {
            for (int i = 1; i < size; i++) {
                if (data[i] < data[parent(i)]) return false;
            }
            return true;
        }

        public void buildHeap(int[] values) {
            data = Arrays.copyOf(values, Math.max(values.length, 16));
            size = values.length;
            for (int i = size / 2 - 1; i >= 0; i--) {
                siftDown(i);
            }
        }

        public static int[] heapSort(int[] values) {
            MinHeap h = new MinHeap(values.length);
            h.buildHeap(Arrays.copyOf(values, values.length));
            int[] result = new int[values.length];
            for (int i = 0; i < result.length; i++) {
                result[i] = h.extractMin();
            }
            return result;
        }

        private int parent(int i) { return (i - 1) / 2; }
        private int leftChild(int i) { return 2 * i + 1; }
        private int rightChild(int i) { return 2 * i + 2; }

        private void swap(int i, int j) {
            int tmp = data[i]; data[i] = data[j]; data[j] = tmp;
        }

        @Override
        public String toString() {
            return Arrays.toString(Arrays.copyOf(data, size));
        }
    }

    // ========== MAIN ==========

    public static void main(String[] args) {
        // Part 1: BST
        System.out.println("=== Part 1: BST ===");
        TreeNode bst = null;
        int[] keys = {50, 30, 70, 20, 40, 60, 80};
        for (int k : keys) {
            bst = bstInsert(bst, k);
            assert isValidBST(bst) : "BST invariant violated after insert " + k;
        }
        System.out.println("In-order: " + inOrder(bst));
        System.out.println("Height: " + height(bst));
        System.out.println("Valid BST? " + isValidBST(bst));

        bst = bstDelete(bst, 30);
        System.out.println("After delete 30: " + inOrder(bst));
        assert isValidBST(bst);
        bst = bstDelete(bst, 70);
        System.out.println("After delete 70: " + inOrder(bst));
        assert isValidBST(bst);

        // findKthSmallest
        List<Integer> sorted = inOrder(bst);
        System.out.println("3rd smallest: " + sorted.get(2));

        // rangeSearch
        System.out.print("Range [25,65]: ");
        for (int v : sorted) {
            if (v >= 25 && v <= 65) System.out.print(v + " ");
        }
        System.out.println();

        // Part 2: Min-Heap
        System.out.println("\n=== Part 2: Min-Heap ===");
        MinHeap heap = new MinHeap(16);
        int[] vals = {42, 17, 8, 31, 5, 23, 12, 3};
        for (int v : vals) {
            heap.insert(v);
            assert heap.checkHeapInvariant() : "Heap invariant violated";
            System.out.println("  After insert " + v + ": " + heap);
        }

        System.out.println("Extract in order:");
        int prev = Integer.MIN_VALUE;
        while (heap.size() > 0) {
            int min = heap.extractMin();
            assert min >= prev : "Not ascending!";
            assert heap.checkHeapInvariant() : "Heap invariant violated after extract";
            prev = min;
            System.out.println("  " + min);
        }

        // Extension: buildHeap + heapSort
        System.out.println("\nHeapSort [42,17,8,31,5,23,12,3]:");
        System.out.println("  " + Arrays.toString(MinHeap.heapSort(vals)));

        // Part 3: Tree Properties
        System.out.println("\n=== Part 3: Tree Properties ===");
        for (int h = 0; h <= 8; h++) {
            TreeNode full = buildFull(h);
            int n = size(full);
            int l = countLeaves(full);
            int internal = countInternal(full);
            assert l == internal + 1 : "L != I+1";
            assert n == 2 * internal + 1 : "N != 2I+1";
            assert n == (int) Math.pow(2, h + 1) - 1 : "N != 2^(h+1)-1";
            System.out.printf("h=%d: N=%d, L=%d, I=%d, L=I+1? %b%n",
                    h, n, l, internal, l == internal + 1);
        }

        System.out.println("\nBalanced BST verification:");
        for (int n = 1; n <= 127; n += 2) {
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = i;
            TreeNode balanced = buildBalancedBST(arr, 0, n - 1);
            assert isBalanced(balanced) : "Not balanced for n=" + n;
            int h = height(balanced);
            int maxH = (int) (Math.log(n) / Math.log(2));
            System.out.printf("n=%3d: h=%d, floor(log2(n))=%d, balanced=%b%n",
                    n, h, maxH, isBalanced(balanced));
        }

        // Part 4: Complexity
        System.out.println("\n=== Part 4: Complexity ===");
        Random rng = new Random(42);
        int[] sizes = {1000, 5000, 10000, 50000, 100000};
        System.out.println("    n    | height |  avg search (ns)");
        System.out.println("---------+--------+-----------------");
        for (int n : sizes) {
            int[] arr = new int[n];
            for (int j = 0; j < n; j++) arr[j] = j;
            TreeNode balanced = buildBalancedBST(arr, 0, n - 1);
            // Warm up
            for (int j = 0; j < 1000; j++) bstSearch(balanced, rng.nextInt(n));
            // Measure
            long start = System.nanoTime();
            for (int j = 0; j < 10000; j++) {
                bstSearch(balanced, rng.nextInt(n));
            }
            long elapsed = System.nanoTime() - start;
            System.out.printf("%7d  |   %3d  |  %,d%n", n, height(balanced), elapsed / 10000);
        }
    }
}
```

---

## Verification Checklist

- [ ] BST insert preserves BST invariant (assert after each insert)
- [ ] BST delete preserves BST invariant (all three cases tested)
- [ ] In-order traversal always produces sorted output
- [ ] Heap invariant holds after every insert and extractMin
- [ ] Extracting all elements from heap produces ascending order
- [ ] Full tree L = I + 1 verified for heights 0–8
- [ ] Balanced BST has height ≤ floor(log₂ n) for all tested sizes
- [ ] Complexity measurements show O(log n) growth pattern
- [ ] All assertions pass with `-ea` flag
