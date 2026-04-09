# CSCI 2110: Module 7 - Binary Search Trees

**Course:** CSCI 2110 Data Structures and Algorithms  
**Institution:** Dalhousie University  
**Instructor:** Srini Sampalli

---

## Binary Search Tree (BST) Definition

A **binary search tree (BST)** is a binary tree that is **sorted or ordered** according to a rule.

### Key Concepts:
- In general, the information contained in each node is a **record** – one part of the record is called the **key**
- **Duplicate keys are generally not allowed** in a BST

### BST Rule:
A BST is a binary tree in which, **for every node x**:
- The keys in all nodes in the **left subtree of x** are **smaller** than the key in x
- The keys in all nodes in the **right subtree of x** are **larger** than the key in x

---

## BST Examples

### Example Trees:

**Example a):**
```
       20
      /  \
    10    25
   / \     \
  8  19    35
      \
      17
```

**Example b):**
```
       40
      /  \
    20    60
   /  \   / \
  10  30 50 70
```

**Example c):**
```
           9
          / \
         5   10
        / \    \
       3   6   12
      /         / \
     2        11  15
    /
   1
```

**Example d):**
```
         22
        /  \
       5    35
      / \   / \
     2  19 25
       /
      18
```

**Example e) - Degenerate Tree (BAD):**
```
  10
    \
    20
      \
      30
        \
        40
          \
          50
```

---

## Building a BST with Student Names

**Insertion Order:** Jason, Yugam, Junyu, Brandon, Elyanna, Ahmed, Isiah, Logan, Joyce, Reese, Zari, Yuyang

**Resulting BST:**
```
                Jason
               /      \
          Brandon      Yugam
          /    \       /     \
      Ahmed  Elyanna Junyu   Zari
               /     /  \      \
            Isiah Joyce Logan Yuyang
                           \
                           Reese
```

**Important Property:**
**Inorder traversal of a BST sorts the keys!**

Inorder traversal result: Ahmed, Brandon, Elyanna, Isiah, Jason, Joyce, Junyu, Logan, Reese, Yugam, Yuyang, Zari

---

## BST Operations

### 1. SEARCH FOR A GIVEN KEY

**Algorithm:**
1. Compare target key with the value in the root
2. If it is equal, target found. Exit.
3. If an empty subtree is reached, target not found. Exit.
4. Otherwise:
   - If target < value in the root, search the left subtree
   - If target > value in the root, search the right subtree

**Example: Search for key 19**
- Start at 20, 19 < 20, go left
- At 10, 19 > 10, go right
- At 19, 19 == 19, **Found!**

**Example: Search for key 15**
- Start at 20, 15 < 20, go left
- At 10, 15 > 10, go right
- At 19, 15 < 19, go left
- At 17, 15 < 17, go left
- NULL reached, **Not found**

---

### 2. INSERT A VALUE INTO A BST

**Algorithm:**
- In order to insert a value, the search process is employed to force a failure
- The new value is inserted at the place where the search failed
- **Note:** The new node always becomes a **leaf node** in the BST

**Examples:**

a) **Insert key 15** - Search fails at null child, insert there as leaf

b) **Insert key 11** - Search fails at null child, insert there as leaf

c) **Insert key 25** - Key found! Duplicate keys not allowed, **can't insert**

d) **Insert key 26** - Search fails at null child, insert there as leaf

---

### 3. DELETE A NODE WITH A GIVEN VALUE FROM A BST

First locate the value in the BST. Let it be found in node X.

#### **Case 1: X is a leaf node (has no children)**
- Simply delete X, that is, detach X from its parent

**Example: Delete 8**
- Just remove node 8 from tree

---

#### **Case 2: X has one child**
- Make the child of X the child of the parent of X
- Then delete X by delinking it from its parent
- **"Hand over the custody to the grandparent"**

**Example: Delete 19**
- Node 19 has one child (17)
- Connect 17 to 19's parent (10)
- Remove node 19

---

#### **Case 3: X has two children**
1. Replace the value in X by the **largest value in the left subtree** of X (the predecessor)
2. Let that value be found in node Y
3. Delete Y (this will be either Case 1 or Case 2)

**Why?** Because Y (the largest in left subtree) cannot have a right child!

**Example: Delete 10**
- Go to left subtree of 10
- Find the largest key → 9
- Replace 10 with node 9 (copy value)
- Then go delete 9
- This will be either Case 1 or Case 2 (9 has no children OR 9 has a left child)

---

## BST Practice Exercise

**Starting from an empty BST, perform the following operations in sequence:**

a) Insert 8, 10, 5, 1, 7, 11, 20, 15, 14

b) Delete 11

c) Insert 6

d) Delete 8

e) Insert 9

### Solutions:

**After step a) - Insert 8, 10, 5, 1, 7, 11, 20, 15, 14:**
```
         8
        / \
       5   10
      /  \   \
     1   7   11
              \
              20
              /
             15
             /
            14
```

**After step b) - Delete 11:**
```
         8
        / \
       5   10
      /  \   \
     1   7   20
             /
            15
            /
           14
```

**After step c) - Insert 6:**
```
         8
        / \
       5   10
      /  \   \
     1   7   20
         /   /
        6   15
            /
           14
```

**After step d) - Delete 8:**
```
         7
        / \
       5   10
      /  \   \
     1   6   20
             /
            15
            /
           14
```

**After step e) - Insert 9:**
```
         7
        / \
       5   10
      /  \   \
     1   6   20
             /
            15
            /
           14
```

---

## Binary Search Tree Class

### Attributes:
```java
BinaryTree<T> tree;
int size;
```

### Constructor:
```java
BinarySearchTree() // Creates an empty binary search tree
```

### Methods:

| Name | What it does | Header | Complexity |
|------|-------------|--------|------------|
| getTree | Returns the BinaryTree | `BinaryTree<T> getTree()` | O(1) |
| isEmpty | Checks if the tree is empty | `boolean isEmpty()` | O(1) |
| size | Returns the size of the binary tree | `int size()` | O(1) |
| search | Searches for a given key and returns the node with the key | `BinaryTree<T> search(T key)` | O(log n) GOOD TREE<br>O(n) BAD TREE |
| insert | Inserts a given item into the binary search tree | `void insert(T item)` | O(log n) GOOD TREE<br>O(n) BAD TREE |
| delete | Delete the node with the given key | `void delete(T item)` | O(log n) GOOD TREE<br>O(n) BAD TREE |

**Helper methods:** `findPredecessor` and `deleteHere` (for the delete method)

**Good Tree vs Bad Tree:**
- **GOOD TREE:** Balanced tree - operations are O(log n)
- **BAD TREE:** Degenerate (linear) tree - operations are O(n)

---

## Implementation

### Class Declaration:
```java
public class BinarySearchTree<T extends Comparable<T>>
{
    //attributes
    private BinaryTree<T> tree;
    private int size;
    
    //constructor
    public BinarySearchTree()
    {
        tree = new BinaryTree<T>();
        size = 0;
    }
    
    //other methods follow...
}
```

---

### getTree Method:
```java
public BinaryTree<T> getTree()
{
    return tree;
}
```

---

### isEmpty Method:
```java
public boolean isEmpty()
{
    return tree.isEmpty();
}
```

---

### size Method:
```java
public int size()
{
    return size;
}
```

---

### search Method:
```java
//Search for a given key and return the reference to that node; return null if key not found
public BinaryTree<T> search(T key)
{
    BinaryTree<T> t = tree;
    boolean found = false;
    
    while (t != null && !found)
    {
        int c = key.compareTo(t.getData());
        
        if (c < 0)
            t = t.getLeft();
        else if (c > 0)
            t = t.getRight();
        else if (c == 0)
            found = true;
    }
    
    if (found)
        return t;
    else
        return null;
}
```

**Example: Search for key 16**
- Tree structure with nodes: 10, 8, 15, 4, 7, 17, 16, 19
- Search path: 10 → 15 → 17 → 16 (found)

---

### insert Method:
```java
//insert an item into a binary search tree
public void insert(T item)
{
    //first create a new single node Binary Tree with the item
    BinaryTree<T> newNode = new BinaryTree<T>();
    newNode.setData(item);
    
    //if this is the first node in the binary search tree
    if (size == 0)
    {
        tree = newNode;
        size++;
        return;
    }
    
    //Otherwise, start at the root of the binary search tree and find the place to insert
    BinaryTree<T> t = tree;
    boolean done = false;
    
    while (!done)
    {
        int c = item.compareTo(t.getData());
        
        if (c == 0)
        {
            System.out.println("Duplicate key. Can't insert");
            return;
        }
        else if (c < 0)
        {
            if (t.getLeft() == null)
            {
                t.setLeft(newNode);
                newNode.setParent(t);
                size++;
                done = true;
            }
            else
                t = t.getLeft();
        }
        else
        {
            if (t.getRight() == null)
            {
                t.setRight(newNode);
                newNode.setParent(t);
                size++;
                done = true;
            }
            else
                t = t.getRight();
        }
    }
}
```

**Example: Insert 11**
- Tree: 20, 10, 25, 5, 12, 35
- Trivial case: if empty tree, new node becomes root
- Otherwise: Find the place to insert (search until null, then insert there)

---

### findPredecessor Method (Helper):
```java
//findPredecessor – helper method for the delete method
//returns the largest node in the left subtree of the given node
public BinaryTree<T> findPredecessor(BinaryTree<T> node)
{
    if (node == null) return null;
    
    BinaryTree<T> pred = node.getLeft(); // go left
    if (pred == null) return null;
    
    // Then keep going right to find largest
    while (pred.getRight() != null)
        pred = pred.getRight();
    
    return pred;
}
```

**Note:** The predecessor (largest node in left subtree) must be returned. This node **cannot have a right child**.

**Example:**
```
       21
      /
    13
      \
      17
       \
       18
      /  \
    15   18
   /  \
  14  16
```
- For node 21, predecessor is 18 (rightmost in left subtree)

---

### deleteHere Method (Helper):
```java
//deleteHere – helper method for the delete method
//deletes a given node and attaches its subtree(s) to its parent node
public void deleteHere(BinaryTree<T> deleteNode, BinaryTree<T> attach)
{
    if (deleteNode == null)
        return;
    
    BinaryTree<T> parent = deleteNode.getParent();
    if (parent == null)
        return;
    
    // Case 1: attach is null (deleteNode has no children)
    if (attach == null)
    {
        if (parent.getLeft() == deleteNode)
            parent.setLeft(null);
        else
            parent.setRight(null);
        return;
    }
    
    // Case 2: deleteNode is right child of parent
    if (deleteNode == parent.getRight())
    {
        parent.detachRight();          // (1) detach from parent
        deleteNode.setParent(null);    // (2) set deleteNode parent to null
        parent.attachRight(attach);    // (3) attach the subtree to parent
        attach.setParent(parent);      // (4) set parent of attach
    }
    else // deleteNode is left child of parent
    {
        parent.detachLeft();
        deleteNode.setParent(null);
        parent.attachLeft(attach);
        attach.setParent(parent);
    }
    
    deleteNode.clear();
}
```

**Example: deleteNode = 9, attach = 8**
```
      12
     /
    6
   / \
  4   9
     /
    8
```
After deleteHere(9, 8): node 8 becomes child of node 6

---

### delete Method:
```java
//delete method: deletes a node with a given key
public void delete(T key)
{
    if (size == 0)
    {
        System.out.println("Can't delete. Empty tree");
        return;
    }
    
    BinaryTree<T> deleteNode = search(key);
    
    if (deleteNode == null)
    {
        System.out.println("Can't delete. Key not found");
        return;
    }
    
    BinaryTree<T> hold = null;
    
    // Case 1: deleteNode has no children
    if (deleteNode.getLeft() == null && deleteNode.getRight() == null)
    {
        deleteHere(deleteNode, null);
    }
    // Case 2a: deleteNode has a right child only
    else if (deleteNode.getLeft() == null)
    {
        hold = deleteNode.getRight();
        deleteHere(deleteNode, hold);
    }
    // Case 2b: deleteNode has a left child only
    else if (deleteNode.getRight() == null)
    {
        hold = deleteNode.getLeft();
        deleteHere(deleteNode, hold);
    }
    // Case 3: deleteNode has two children
    else
    {
        hold = findPredecessor(deleteNode);
        deleteNode.setData(hold.getData());
        deleteNode = hold;
        deleteHere(deleteNode, deleteNode.getLeft());
        // Note: hold cannot have a right child (it's the rightmost in left subtree)
    }
}
```

---

## Summary

### Key Points:
1. **BST Property:** Left subtree < node < right subtree
2. **Inorder traversal sorts the keys**
3. **Search, Insert, Delete:**
   - Best case: O(log n) for balanced trees
   - Worst case: O(n) for degenerate trees
4. **Delete has 3 cases:**
   - Leaf node (no children)
   - One child
   - Two children (use predecessor from left subtree)

---

**End of Module 7**
