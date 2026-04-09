# CSCI 2110: Module 8 - Heaps

**Course:** CSCI 2110 Data Structures and Algorithms  
**Institution:** Dalhousie University  
**Instructor:** Srini Sampalli

---

## Learning Objectives

- Define a heap
- Understand its properties
- Build algorithms for basic heap operations
- Implement the Heap class
- Know one Heap Application – Heap Sort
- Build Updatable Heaps

---

## What is a Heap?

### Structural and Functional Definition

- **Structurally,** a heap is a **binary tree**
- **Functionally,** a heap is a **priority queue**

### What is a Priority Queue?

A **priority queue** is a data structure in which entries have different priorities:
- The entry with the **highest priority** is the one to be removed next
- This means that **entries will be processed in the order of their priorities**

---

## Applications of Priority Queues

### 1. Hospital Emergency Room
The emergency room in a hospital is a quintessential priority queue.

### 2. Operating System Process Scheduling
- Processes arrive at different points of time, and take different amounts of time to finish executing
- The OS needs to ensure that all processes get fair treatment
- No single process should hog the CPU nor should any process starve for CPU time
- At the same time, **some essential processes need to be executed on a priority basis** – otherwise, the system won't function
- Hence a priority queue is used by the OS for process management

### 3. Network Router Traffic Queueing
Traffic queueing in network routers for quality of service – voice traffic, video traffic, and 'other' data traffic are given different priorities.

### 4. Discrete Event Simulation
Events are added to the queue with their arrival time used as priority.

---

## Dynamic Priorities

In some applications, the priorities may **dynamically change** when the items are in the queue.

**Example:** The ER situation
- The priority of a patient may be increased according to the severity of their condition

**Coverage in this module:**
- We will first focus on heaps that **do not allow** for the priority of an existing entry to be changed
- We will then discuss **updatable heaps** in which priorities can change dynamically

---

## Definition of a Heap

**A heap is a complete binary tree in which the key at any node x is greater than or equal to the keys at all nodes in the subtrees rooted at x.**

### Key Properties:

1. **This means that the largest key is always at the root – easy to get!**

2. **Complete Binary Tree Structure:**
   - Every level except the last must have the maximum number of nodes
   - Last level must be filled from left to right
   - This ensures that the heap is **balanced (it is a good tree!)**

3. **Duplicate entries are allowed** in a heap (for e.g., two items may have the same priority)

---

## Heap Examples

### Valid Heaps:

**Example 1:**
```
           90
          /  \
        80    60
       /  \   / \
     70  30 20  50
    /  \
   10  40
```
✓ Valid heap

**Example 2:**
```
       20
      /  \
    10    15
   /  \   /
  7   9  10
```
✓ Valid heap

**Example 3:**
```
      10
     /  \
   10    10
  /  \
 10   10
```
✓ Valid heap

**Example 4 (with strings):**
```
         fox
        /   \
      emu    ape
     /  \
   cat  bat  antelope
```
**Assumption:** Higher the alphabet, higher the priority (C > B > A, etc.)
✓ Valid heap

**Example 5:**
```
       30
      /  \
    30    10
   /  \
  20   5
```
✓ Valid heap

### Invalid Heaps:

**Not a heap - violates structure:**
```
       20
      /  \
    10    5
           \
            4
```
✗ Not a complete binary tree

**Not a heap - violates order:**
```
      10
     /  \
    5   15
   / \   /  \
  4  2  10  5
```
✗ Violates heap order property (15 > 10)

**Not a heap - violates both:**
```
        10
       /  \
     20    40
    /  \    \
  30   10   50
```
✗ Violates both structure and order

---

## Heap Operations

### 1. INSERT A NEW KEY INTO A HEAP

**Inserting a new key must maintain both the heap structure and heap order properties.**

#### Algorithm:

1. **First insert the key** so that the heap structure is maintained
   - This means it must continue to be a complete binary tree
   - This in turn means that the new key will be a **leaf node**
   - This might violate the order property

2. **Sift the new key up the tree** until the order property is restored

#### Algorithm for Sifting Up:

- If new key > key of its parent, exchange current node and parent node
- Repeat as long as the above condition is true

#### Example: Insert 100

**Starting heap:**
```
       90
      /  \
    85    60
   /  \   / \
  70  30 20  30
 /  \
10  40 30
```

**Step 1: Add 100 at next available position (rightmost in last level)**
```
       90
      /  \
    85    60
   /  \   / \
  70  30 20  30
 /  \   /
10  40 30 100  ← Added here
```

**Step 2: Sift up (100 > 60)**
```
       90
      /  \
    85    100
   /  \   / \
  70  30 20  30
 /  \   /
10  40 30 60
```

**Step 3: Sift up again (100 > 90)**
```
       100
      /  \
    85    90
   /  \   / \
  70  30 20  60
 /  \   /    \
10  40 30    30
```

#### Example: Insert 20

**Starting heap:**
```
       30
      /  \
    10    20
   /  \   /
  3   5  10  5
```

**Step 1: Add 20 at next available position**
```
       30
      /  \
    10    20
   /  \   /  \
  3   5  10  5  20  ← Added here
```

**Step 2: No sifting needed** (20 not > 20, order is maintained)

Final result:
```
       30
      /  \
    10    20
   /  \   /  \
  3   5  10  5  20
```

---

### 2. DELETE (DeleteMax)

**Deletion removes the entry at the top of the heap** (also called DeleteMax).  
This leaves a vacant spot at the root, hence the heap has to be restored.

#### Algorithm:

1. **Remove the item from the root**
2. **Replace it with the rightmost node in the last level** (this restores the structure property)
3. **Sift it down the tree** until the order property is restored

#### Algorithm for Sifting Down:

- Let **k** be the new key in the root node (after it is replaced)
- The children of k are first compared with each other to determine the larger key
- If k is smaller, it is exchanged with the larger key
- This process continues until either:
  - The larger of the keys of k's children is less than or equal to k, OR
  - k reaches a leaf node

#### Example: Delete from heap

**Starting heap:**
```
         90
        /  \
      80    60
     /  \   / \
   70  30 20  50
  /  \
 10  40
```

**Step 1: Remove 90, replace with rightmost in last level (40)**
```
         40  ← moved from last level
        /  \
      80    60
     /  \   / \
   70  30 20  50
  /
 10
```

**Step 2: Sift down (compare children: 80 vs 60, larger is 80)**
- 40 < 80, so swap with 80
```
         80
        /  \
      40    60
     /  \   / \
   70  30 20  50
  /
 10
```

**Step 3: Continue sifting down (compare children: 70 vs 30, larger is 70)**
- 40 < 70, so swap with 70
```
         80
        /  \
      70    60
     /  \   / \
   40  30 20  50
  /
 10
```

**Step 4: 40 is now at a position where it's greater than its child (10), stop**

#### Another Example: Delete again

**Starting heap:**
```
         80
        /  \
      70    60
     /  \   / \
   40  30 20  50
  /
 10
```

**Step 1: Remove 80, replace with 10**
```
         10  ← moved from last level
        /  \
      70    60
     /  \   / \
   40  30 20  50
```

**Step 2: Sift down (compare 70 vs 60, larger is 70)**
- 10 < 70, swap
```
         70
        /  \
      10    60
     /  \   / \
   40  30 20  50
```

**Step 3: Continue (compare 40 vs 30, larger is 40)**
- 10 < 40, swap
```
         70
        /  \
      40    60
     /  \   / \
   10  30 20  50
```

**Step 4: 10 is now a leaf, done**

---

## Heap Class

### Array Representation

**What data structure is ideal for storing and processing heap elements?**  
**ARRAY LIST!**

**We will never build any binary tree, but just use simple array list manipulations.**

#### Array Mapping:

```
           90
          /  \
        80    60
       /  \   / \
     70  30 20  50
    /  \
   10  40
```

Maps to array:
```
Index:  0   1   2   3   4   5   6   7   8
Value: 90  80  60  70  30  20  50  10  40
```

#### Index Formulas:

- **Parent of a node at index i:** `(i - 1) / 2` (integer division)
- **Children of a node at index i:**
  - Left child: `2*i + 1`
  - Right child: `2*i + 2`

---

### Attributes

```java
ArrayList<T> heapList;
```

### Constructor

| Constructor | Description |
|------------|-------------|
| `Heap()` | Creates an empty heap |

### Methods

| Name | What it does | Header | Complexity |
|------|-------------|--------|------------|
| add | Adds an item to the heap | `void add(T item)` | O(log n) |
| deleteMax | Deletes the item with the maximum key | `T deleteMax()` | O(log n) |
| size | Returns the size of the heap | `int size()` | O(1) |
| clear | Clears the heap | `void clear()` | O(1) |
| isEmpty | Checks if the heap is empty | `boolean isEmpty()` | O(1) |
| enumerate | Prints the keys in level order | `void enumerate()` | O(n) |

---

## Implementation

### Class Declaration and Constructor

```java
import java.util.ArrayList;

public class Heap<T extends Comparable<T>> {
    
    // Attributes
    private ArrayList<T> heapList;
    
    // Constructor
    public Heap() {
        heapList = new ArrayList<T>();
    }
    
    // Basic methods
    public int size() {
        return heapList.size();
    }
    
    public boolean isEmpty() {
        return (size() == 0);
    }
    
    public void clear() {
        heapList.clear();
    }
    
    public void enumerate() {
        System.out.println(heapList);
    }
```

---

### add Method

```java
public void add(T item) {
    // Add item to the end of the list
    heapList.add(item);
    
    // Get index and parent index
    int index = heapList.size() - 1;
    int pindex = (index - 1) / 2;
    T parent = heapList.get(pindex);
    
    // Sift up
    while (index > 0 && item.compareTo(parent) > 0) {
        // Switch the values
        heapList.set(index, parent);
        heapList.set(pindex, item);
        
        // Get the next set of values
        index = pindex;
        pindex = (index - 1) / 2;
        parent = heapList.get(pindex);
    }
}
```

**Example: add(100)**
```
Array: [90, 80, 10, 20, 5, 100]
         0   1   2   3   4   5

Tree:       90
           /  \
         80    10
        /  \
      20   5  100  ← Added at index 5
      
After sifting up: 100 > 10, swap
Then: 100 > 90, swap
Final: [100, 80, 90, 20, 5, 10]
```

---

### deleteMax Method

```java
public T deleteMax() {
    if (isEmpty()) {
        System.out.println("Heap is empty");
        return null;
    }
    else {
        T ret = heapList.get(0); // root has the item to be returned
        T item = heapList.remove(heapList.size() - 1); // remove the last item
        
        if (heapList.size() == 0) // if the heap now has no items
            return ret;
        
        heapList.set(0, item); // set it as the root
        
        int index, lIndex, rIndex, maxIndex;
        T maxChild;
        boolean found = false;
        
        index = 0;
        lIndex = index * 2 + 1;
        rIndex = index * 2 + 2;
        
        while (!found) {
            // Case 1: node has two children
            if (lIndex < size() && rIndex < size()) {
                if (heapList.get(lIndex).compareTo(heapList.get(rIndex)) > 0) {
                    maxChild = heapList.get(lIndex);
                    maxIndex = lIndex;
                }
                else {
                    maxChild = heapList.get(rIndex);
                    maxIndex = rIndex;
                }
                
                // Sift down if necessary
                if (item.compareTo(maxChild) < 0) {
                    heapList.set(maxIndex, item);
                    heapList.set(index, maxChild);
                    index = maxIndex;
                }
                else
                    found = true;
            }
            // Case 2: node has only left child
            else if (lIndex < size()) {
                if (item.compareTo(heapList.get(lIndex)) < 0) {
                    heapList.set(lIndex, item);
                    heapList.set(index, heapList.get(lIndex));
                    index = lIndex;
                }
                else
                    found = true;
            }
            // Case 3: only right child – this case does not occur since it is a complete binary tree
            
            // Case 4: no children
            else
                found = true;
            
            // Get the next set
            lIndex = index * 2 + 1;
            rIndex = index * 2 + 2;
        }
        
        return ret;
    }
}
```

---

## Heap Demo Program

```java
import java.util.Scanner;

public class HeapDemo {
    public static void main(String[] args) {
        Heap<Integer> myHeap = new Heap<Integer>();
        Scanner keyboard = new Scanner(System.in);
        
        System.out.println("Enter positive integers into the heap (-1 when done): ");
        Integer num = keyboard.nextInt();
        
        while (num != -1) {
            myHeap.add(num);
            num = keyboard.nextInt();
        }
        
        myHeap.enumerate();
        
        System.out.println("Adding nodes 20, 67, 14, 2");
        myHeap.add(20);
        myHeap.enumerate();
        
        myHeap.add(67);
        myHeap.enumerate();
        
        myHeap.add(14);
        myHeap.enumerate();
        
        myHeap.add(2);
        myHeap.enumerate();
        
        System.out.println("Removing nodes on a priority basis");
        while (!myHeap.isEmpty()) {
            System.out.println(myHeap.deleteMax());
            myHeap.enumerate();
        }
    }
}
```

---

## Heap Application: Heap Sort

**Sorting is easy with a heap!**

### Algorithm:

1. **Initialize an empty heap**
2. **Read the given set of keys and store them in the heap** (n insertions)
3. **Repeatedly remove the elements (deleteMax)** (n deletions)

### Complexity Analysis:

- **Building the heap:** n insertions × O(log n) = **O(n log n)**
- **Deleting all elements:** n deletions × O(log n) = **O(n log n)**
- **Total:** O(n log n) + O(n log n) = **O(n log n)**

### Example:

**Given keys:** 10, 23, 57, 22, 50, 30

**Step 1: Build the heap**
```
Insert 10:           10

Insert 23:           23
                    /
                  10

Insert 57:           57
                    /  \
                  10   23

Insert 22:           57
                    /  \
                  22   23
                 /
               10

Insert 50:           57
                    /  \
                  50   23
                 /  \
               10   22

Insert 30:           57
                    /  \
                  50   30
                 /  \  /
               10  22 23
```

**Step 2: DeleteMax n times**
- Delete 57 → output: 57
- Delete 50 → output: 50
- Delete 30 → output: 30
- Delete 23 → output: 23
- Delete 22 → output: 22
- Delete 10 → output: 10

**Result:** 57, 50, 30, 23, 22, 10 → **SORTED** (descending order)

---

## Updatable Heap

### Definition

An **updatable heap** is a heap in which the priorities can change dynamically.

This means that the nodes in the heap may have to **sift up or down** when the key values change.

### Example Application

The ER waiting room where patients' priorities can change while they are waiting.

### Example:

**Original heap:**
```
       57
      /  \
    50    30
   /  \   /
  10  22 23
```

**Priority of node with key 23 changes to 47:**
```
       57
      /  \
    50    30
   /  \   /
  10  22 47  ← Priority increased
```

**After sifting up (47 > 30):**
```
       57
      /  \
    50    47
   /  \   /
  10  22 30
```

### Implementation Consideration

To implement an updatable heap efficiently, we need to maintain a way to quickly locate nodes by their key value (e.g., using a hash map that maps keys to array indices).

---

## Summary

### Key Points:

1. **Heap is:**
   - Structurally: A complete binary tree
   - Functionally: A priority queue

2. **Heap Property:** Parent ≥ children (for max heap)

3. **Operations:**
   - **Add:** Insert at end, sift up - O(log n)
   - **DeleteMax:** Remove root, replace with last, sift down - O(log n)

4. **Array Implementation:**
   - Parent of i: `(i-1)/2`
   - Left child of i: `2*i+1`
   - Right child of i: `2*i+2`

5. **Heap Sort:** O(n log n) time complexity

6. **Updatable Heaps:** Allow priority changes dynamically

---

**End of Module 8**
