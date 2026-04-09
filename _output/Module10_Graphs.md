# CSCI 2110: Module 10 - Graphs

**Course:** CSCI 2110 Data Structures and Algorithms  
**Institution:** Dalhousie University  
**Instructor:** Srini Sampalli

---

## Topics

**Part 1:**
- Definition and motivation
- Graph terminology
- Graph Representation

**Part 2:**
- Graph Algorithms

---

## The Graph Data Structure

### Definition

**A graph is a data structure that consists of:**
- A set of **nodes** (also called **vertices**)
- A set of **edges**

### Key Characteristics:

- Each **node** or **vertex** generally holds data
- Each **edge** connects a pair of nodes that have some form of relationship between them
- A graph can be used to represent any geometric pattern – that is, a list, a binary tree, binary search tree, etc. can all be considered as **special cases** of a graph data structure
- **This makes the graph one of the most widely used data structures**

### Visual Representation:

```
       B ----------- C
      / \           /
     /   \         /
    A     \       /
     \     \     /
      \     \   /
       D --- E - F
```

- **Vertices (Nodes):** A, B, C, D, E, F
- **Edges:** Connections between vertices

---

## Applications of Graphs

### 1. Graph of Cities Connected by Highways

Cities as vertices, highways as edges with distances as weights.

Example: California highway network
- Santa Barbara, Barstow, Malibu, Los Angeles, Riverside, Palm Springs, San Diego, El Cajon
- Edge weights represent distances (e.g., 45 miles, 75 miles, etc.)

### 2. Graph of CS Courses with Prerequisites

Courses as vertices, prerequisite relationships as directed edges.

Example prerequisite graph:
```
CSCI 1100
    ↓
CSCI 1101
    ↓
CSCI 2110 → CSCI 2134
    ↓           ↓
CSCI 3110   CSCI 3120 → CSCI 3171
                ↓
             [Various 3000+ courses]
```

### 3. Graphs of Molecular Structures

Organic compounds represented as graphs where:
- Atoms = vertices
- Chemical bonds = edges

Examples: Glycine, Gluconate, Citrate, Tartrate molecules

### 4. Graph of Web Pages Connected by Hyperlinks

The World Wide Web as a massive graph:
- Web pages = vertices
- Hyperlinks = edges
- Used by search engines for PageRank algorithms

### 5. Graph of Wireless/Wired Networks

Network topology represented as a graph:
- Routers, switches, nodes = vertices
- Network connections = edges
- Useful for routing algorithms and network analysis

---

## Graph Terminology

### 1. Undirected Graph

**An undirected graph is one in which there is a symmetric relationship among the vertices.**

- An undirected graph has **edges without arrows**
- If A and B are two vertices connected by an edge, you can get to B from A and vice versa

**Example:**
```
       B
      / \
     /   \
    A     C
     \   /
      \ /
       E --- F
      /
     /
    D
```

---

### 2. Directed Graph

**A directed graph is one in which there is an asymmetric relationship among the vertices.**

- In a directed graph, **edges are represented by arrows**
- Arrows start at one vertex and end at a neighboring vertex
- An edge from vertex 1 to 2 means 2 can be visited from 1, but 1 cannot be visited from 2 (directly)
- **Edges can also be bidirectional** (arrows in both directions)

**Example:**
```
    1 → 2
    ↓ ↗ ↓ ↖ 5
    3 ← 4
    ↓   ↑
    6 ← 7
```

---

### 3. Weighted Graph

**Each edge has a number associated with it, called the cost or the weight.**

- The number represents the **"effort"** it takes to traverse that edge
- The weight could represent one parameter or an aggregate of multiple parameters
- Weights play an important role in algorithms such as **shortest path determination**

**Example:**
```
        f --- 3 --- a
       / \         / \
      1   2       2   6
     /     \     /     \
    d       e - 7       b
     \     / \   \     /
      4   4   5   5   5
       \ /     \ /
        c ------
```

**Shortest path from a to d is via f:**
- Path: a → f → d
- Total cost: 3 + 1 = **4**

---

### 4. Unweighted Graph

**Edges don't have any costs associated with them.**

- In unweighted graphs, all edges are treated alike
- It is not beneficial to prefer one path over another
- An unweighted graph can be considered as a special case of a weighted graph in which **the weight of every edge = 1**

**Example:**
```
    F --- E --- D
    |     |     |
    A --- B --- C
```

Cost to traverse any link = 1

---

### 5. Representation of an Edge

**An edge between two vertices v1 and v2 is represented by the tuple (v1, v2).**

- If the graph is **undirected**, if an edge (v1, v2) exists, then **(v2, v1) also exists**
- If the graph is **directed** and there is an edge from v1 to v2 only, then only edge **(v1, v2) exists**

**Example:** Edge between A and B
- In undirected graph: both (A, B) and (B, A) exist
- In directed graph (A→B): only (A, B) exists

---

### 6. Degree of a Vertex

#### **Undirected Graph:**

**Number of edges connected to the vertex**

**Example:**
```
    F --- E --- D
    |     |     |
    A --- B --- C
```

- Degree of A = 2
- Degree of B = 5
- Degree of E = 3

#### **Directed Graph:**

- **Indegree** = Number of edges **terminating** at the vertex
- **Outdegree** = Number of edges **leaving** the vertex

**Example:**
```
    1 → 2
    ↓ ↗ ↓ ↖ 5
    3 ← 4
    ↓   ↑
    6 ← 7
```

- Indegree of vertex 1 = 0
- Outdegree of vertex 1 = 3
- Indegree of vertex 4 = 3
- Outdegree of vertex 4 = 3

---

### 7. Path in a Graph

**A path from vertex v1 to vertex vk is any sequence of edges to get from v1 to vk.**

Sequence is represented by tuples: (v1, v2), (v2, v3), ..., (v(k-1), vk)

**Example:**
```
    F --- E --- D
    |     |     |
    A --- B --- C
```

**Paths from A to D:**
1. (A, B), (B, C), (C, D)
2. (A, F), (F, E), (E, B), (B, D)
3. (A, F), (F, B), (B, E), (E, B), (B, D)

---

### 8. Simple Path

**A simple path is a path in which no vertex is visited twice.**

- The only exception for repetition is the first and last vertex (they can be the same)

**Examples:**

**Simple paths:**
- From A to D: (A, B), (B, C), (C, D) ✓
- From B to B: (B, E), (E, F), (F, A), (A, B) ✓

**NOT a simple path:**
- (A, B), (B, F), (F, B), (B, C) ✗ (vertex B visited twice)

---

### 9. Cycle, Cyclic and Acyclic Graphs

**Cycle:** A simple path in which the first and last vertices are the same

**Cyclic graph:** A graph that has at least one cycle

**Acyclic graph:** A graph that has no cycles

#### Examples:

**Undirected Cyclic Graph:**
```
    F --- E --- D
    |     |     |
    A --- B --- C
```
(Has cycles: A-B-E-F-A, B-C-D-E-B, etc.)

**Undirected Acyclic Graph:**
```
      1
       \
        4 --- 2
       / \     \
      6   5     3
```
(No cycles - tree structure)

**Directed Cyclic Graph:**
```
    0 → 1 → 2 ⇄ 4
         ↘ ↗
          3
```
(Has cycle: 2 ⇄ 4)

**Directed Acyclic Graph (DAG):**
```
    1 → 2 → 4
    ↓   ↓ ↗ ↓
    3   5   7
          ↘ ↑
            6
```
(No cycles!)

---

### 10. Connected and Unconnected Graphs

**Connected Graph:** There is a path between every pair of vertices

**Unconnected Graph:** A collection of graphs, each of which is connected

#### Connected Graph Example:
```
    F --- E --- D
    |     |     |
    A --- B --- C
```
(Path exists between all vertex pairs)

#### Unconnected Graph Example:
```
    C --- D        G
   /                \
  B        E         F
   \                /
    A
```
(Three separate components)

---

### 11. Strongly Connected and Weakly Connected (Directed Graphs)

**Strongly Connected:** There is a path from every vertex to every other vertex

**Example:**
```
    0 → 1 → 2 ⇄ 4
    ↓ ↗ ↓ ↖ ↓
    3
```
(Every vertex reachable from every other vertex)

**Weakly Connected:** If ignoring the directions of edges, the resulting undirected graph is connected

**Example:**
```
    A → B
    ↑ ↘ ↓
    D ← C
```
(No path from D to A, B, or C, but connected if directions ignored)

---

## Graph Representation

Graphs can be represented in one of two ways for implementation purposes:

1. **Adjacency Matrix Representation**
2. **Adjacency List Representation**

---

### 1. Adjacency Matrix Representation

**The graph is represented as a 2-D array of n rows and n columns**, where each row or column represents a vertex.

- The element `G[i,j] = 1` if there is an edge between vertex i and vertex j
- Otherwise `G[i,j] = 0`
- **Note:** If the graph is weighted, G[i,j] will be equal to the weight of the edge (i,j)

#### Example (Undirected, Unweighted Graph):

**Graph:**
```
    F --- E --- D
    |     |     |
    A --- B --- C
```

**Adjacency Matrix:**
```
      A  B  C  D  E  F
   ┌─────────────────┐
 A │ 0  1  0  1  1  0 │
 B │ 1  0  1  0  0  0 │
 C │ 0  1  0  0  1  1 │
 D │ 1  0  0  0  1  0 │
 E │ 1  0  1  1  0  1 │
 F │ 0  0  1  0  1  0 │
   └─────────────────┘
```

#### Advantages:
✓ Given an edge, it takes **O(1) time** to check if it exists

#### Drawbacks:
✗ **Waste of space for sparse matrices** (lots of vertices, few edges)  
✗ Search for all edges connected to a vertex: **O(n)**

---

### 2. Adjacency List Representation

**The graph is represented by an array of linked lists.**

- Each linked list represents a vertex
- The entries in the linked list represent the neighbors of that vertex
- Order of storing the elements in the linked list doesn't matter

#### Example (Undirected, Unweighted Graph):

**Graph:**
```
    F --- E --- D
    |     |     |
    A --- B --- C
```

**Adjacency List:**
```
A (0): → B → E → D → null
B (1): → A → C → null
C (2): → B → E → F → null
D (3): → A → E → null
E (4): → A → C → D → F → null
F (5): → C → E → null
```

#### Advantages:
✓ **Space efficient**  
✓ Search for all edges connected to a vertex:
  - Best case: **O(1)**
  - Worst case: **O(n)**

#### Drawback:
✗ Search for a given edge:
  - Best case: **O(1)**
  - Worst case: **O(n)**

---

### 3. Directed Graph Representation

**Example:**
```
    A → B
    ↓   ↓
    D ← C
```

**Adjacency Matrix:**
```
      A  B  C  D
   ┌───────────┐
 A │ 0  1  0  1 │
 B │ 0  0  1  0 │
 C │ 1  0  0  1 │
 D │ 0  0  0  0 │
   └───────────┘
```

**Adjacency List:**
```
A: → B → D → null
B: → C → null
C: → A → D → null
D: → null
```

---

### 4. Weighted Graph Representation

**Example:**
```
        f
       /|\
      1 2 3
     /  |  \
    d   e   a
    |   |\  |\
    4   4 5 2 6
     \ / \ |/ \
      c---5---b
```

**Adjacency Matrix:**
```
    a  b  c  d  e  f
 a [0  6  7  0  2  3]
 b [6  0  5  0  0  0]
 c [7  5  0  0  5  0]
 d [0  0  0  0  4  1]
 e [2  0  5  4  0  2]
 f [3  0  0  1  2  0]
```

**Adjacency List:**
```
a: → (b,6) → (c,7) → (e,2) → (f,3) → null
b: → (a,6) → (c,5) → null
c: → (a,7) → (b,5) → (e,5) → null
d: → (e,4) → (f,1) → null
e: → (a,2) → (c,5) → (d,4) → (f,2) → null
f: → (a,3) → (d,1) → (e,2) → null
```

---

## Practice Exercise 1

**Study the graph and answer the following questions:**

```
         B
        /|\
       2 | 8
      /  |  \
     A   D---F
     |\ /|\ /|
     6 3 7 6 
     |/ \|/ \|
     C   E   H
      \ 2|  5/
       \ | /
         G
```

### Questions:

**a) Classify the graph:**
- Undirected, Weighted, Connected, Cyclic

**b) List all simple paths from A to E:**
- A → D → E
- A → C → G → E
- A → D → B → F → H → E
- A → D → H → E

**c) What is the largest degree? Which nodes have the largest degree?**
- Largest degree: **4**
- Nodes: **D**

**d) What is the smallest degree? Which nodes have the smallest degree?**
- Smallest degree: **2**
- Nodes: **A, C, G, B, F**

**e) Write the adjacency matrix and adjacency list representations:**
- Try yourself!

---

## Practice Exercise 2

**Determine if each of the following directed graphs are strongly or weakly connected:**

**Graph 1:**
```
    0 → 1
    ↓ ↗ ↓
    4 ← 2
       ↓ ↑
       3
```
Answer: **Strongly connected** (every vertex reachable from every other)

**Graph 2:**
```
    2          5
    ↓ ↖       ↓ ↖
    1 → 3     4 → 6
                ↓ ↗
                7
```
Answer: **Weakly connected** (two separate components)

---

## Graph Algorithms

### Part 2 Topics:
1. **Graph Traversal** (DFS and BFS)
2. **Topological Sorting**

---

## 1. Graph Traversal

**A graph traversal is a "walk" in the graph so that every vertex is visited.**

### Rules:
- During a traversal, you are allowed to **backtrack**
- The walk should remain **connected** (no jumping to distant nodes)
- A traversal should list each vertex **exactly once**
- Traversals are also called **Searches**

### Two Types of Traversals:

a) **Depth First Search (DFS)**  
b) **Breadth First Search (BFS)**

---

## a) Depth First Search (DFS)

### Algorithm:

1. Start at a vertex v1
2. Mark v1 as visited
3. Pick a neighbor of v1 that is not visited, say v2. Go to v2
4. Mark v2 as visited
5. Pick a neighbor of v2 that is not visited, say v3. Go to v3
6. Continue and mark each vertex that has been visited
7. **If you hit a dead-end, backtrack** to the previous neighbor and pick a neighbor that has not been visited

### Example:

**Graph:**
```
    F --- E --- D
    |     |     |
    A --- B --- C
```

**DFS starting from A:** A B C F E D

### Recursive Algorithm:

```
Algorithm DFS(v) where v is the starting vertex

    visit v and mark it as visited.
    
    for each neighbor w of v {
        if w is not visited
            DFS(w)
    }
```

**Key Point:** DFS uses **recursion** or a **stack**

---

## b) Breadth First Search (BFS)

### Algorithm:

1. Start at a vertex v1
2. Visit all the neighbors of v1
3. Then visit all the unvisited neighbors of each neighbor of v1
4. Continue until all vertices are visited

### Example:

**Graph:**
```
    F --- E --- D
    |     |     |
    A --- B --- C
```

**BFS starting from A:** A B E D C F

### Queue-Based Algorithm:

```
Algorithm BFS(v) where v is the starting vertex

    Initialize an empty queue and a result list.
    Enqueue the first vertex v.
    
    while the queue is not empty {
        Dequeue the item x and put it in the result list.
        Enqueue each neighbor of x if it is not in the 
        result list and if it is not already in the queue.
    }
```

**Key Point:** BFS uses a **queue** or **ArrayList**

---

## 2. Topological Sorting

**Topological sorting means arranging the vertices in a directed graph in a sequence so that the dependency condition is not violated.**

### Example: CS Course Prerequisites

**Directed Graph:**
```
CSCI 1110 → CSCI 2110 → CSCI 3110
              ↓
CSCI 1120 → CSCI 2134 → CSCI 3120 → CSCI 3171
```

### Valid Topological Sorts:

**Solution 1:**
```
Position:  1     2     3     4     5     6     7
Course:   1110  1120  2110  2134  3110  3120  3171
```

**Solution 2:**
```
Position:  1     2     3     4     5     6     7
Course:   1120  1110  2110  3110  2134  3120  3171
```

### Invalid Sort:

**NOT Valid:**
```
Position:  1     2     3     4     5     6     7
Course:   1120  1110  3120  3110  2134  2110  3171
```
(Violates: 3120 before 2110, 2110 after 3110)

---

## Topological Sorting Algorithm

### Algorithm:

```
Initialize three variables:
    - PRED array (predecessor/indegree array)
    - Empty queue
    - TOPNUM array

for each vertex v in the graph
    compute the indegree and add it to PRED array, pred(v)

for each vertex v in the graph
    if (pred(v) == 0) add v to the queue

topnum ← 1

while queue is not empty {
    w ← dequeue
    assign w with topnum
    topnum ← topnum + 1
    
    for each neighbor p of w {
        pred(p) ← pred(p) - 1
        if (pred(p) == 0) then
            add p to queue
    }
}
```

All vertices will be assigned topnum in topological sorting order.

---

### Example 1: Topological Sort

**Graph:**
```
    C → A → H
    ↓   ↓   ↑
    B → D → E
    ↓   ↓
    F   G
```

**Step-by-step execution:**

| Step | PRED | QUEUE | TOPNUM |
|------|------|-------|---------|
| Init | C:0, A:1, B:1, D:1, E:1, F:1, G:1, H:2 | [C] | - |
| 1 | | [A,B] | C:1 |
| 2 | | [B,D,H] | A:2 |
| 3 | | [D,H,F] | B:3 |
| 4 | | [H,F,E,G] | D:4 |
| 5 | | [F,E,G] | H:8 |
| 6 | | [E,G] | F:5 |
| 7 | | [G] | E:6 |
| 8 | | [] | G:7 |

**Result:** C, A, B, D, F, E, G, H

---

### Example 2: Topological Sort

**Graph:**
```
    A → B → C
    ↓   ↓ ↗ ↓
    E → F   D
```

**Execution:**

| PRED | A:0, B:1, C:2, D:1, E:1, F:1 |
| QUEUE | [A] → [B,E] → [E,F,C] → [F,C,D] → [C,D] → [D] → [] |
| TOPNUM | A:1, B:2, E:3, F:4, C:5, D:6 |

**Result:** A, B, E, F, C, D

---

## Summary

### Key Points:

1. **Graph Components:**
   - Vertices (nodes)
   - Edges (connections)

2. **Graph Types:**
   - Directed vs Undirected
   - Weighted vs Unweighted
   - Cyclic vs Acyclic
   - Connected vs Unconnected

3. **Representations:**
   - **Adjacency Matrix:** O(1) lookup, O(n²) space
   - **Adjacency List:** Space efficient, O(degree) lookup

4. **Traversal Algorithms:**
   - **DFS:** Uses recursion/stack, goes deep first
   - **BFS:** Uses queue, visits level by level

5. **Topological Sorting:**
   - Only for directed acyclic graphs (DAGs)
   - Uses indegree tracking and queue
   - Produces ordering respecting dependencies

---

**End of Module 10**
