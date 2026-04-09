# CSCI 2110: Module 9 - Hashing and Hash Tables

**Course:** CSCI 2110 Data Structures and Algorithms  
**Institution:** Dalhousie University  
**Instructor:** Srini Sampalli

---

## What this module is about

This module is about how to make **search** much faster by using a **hash function** to map a key to an index in an array. The whole idea is to try to get search down to **O(1) on average** instead of the slower search times we saw with lists, trees, and heaps.

The visual story of the module goes like this:

1. Start with the motivation: search is the most important operation.
2. Ask whether we can beat `O(n)` and `O(log n)`.
3. Use an array and map a key directly to an index.
4. Realize direct indexing wastes too much space.
5. Introduce **hashing** as the trick that maps a large key space into a smaller table.
6. See the main problem: **collisions** or **hash clashes**.
7. Learn the two main collision strategies:
   - **Open hashing / separate chaining**
   - **Closed hashing** with probing
8. Compare time complexity using load factor.
9. End with applications and Java `HashMap` examples.

This markdown file is based on the **actual visual slides and handwritten diagrams**, not just raw text extraction.

---

## Big picture summary

### Why hashing exists

Earlier data structures gave us these search costs:

```text
Unordered list      O(n)
Ordered list        O(log2 n)
Binary tree         O(n)
Binary search tree  O(log2 n) if balanced, O(n) if bad tree
Heap                O(n)
```

The module asks:

```text
Can we do better?
Can we aim for O(1) search, at least on average?
```

### Core idea

Arrays already give us `O(1)` access **if we know the index**.
So the hashing idea is:

```text
key  --->  hash function  --->  array index
```

### Core definitions

```text
Hash table   = storage array
Hash function = function that maps a key to an index in that array
Hashing      = the process of storing / retrieving objects using that mapping
```

### Simplest mapping function used in the module

```text
index = key % N
```

where `N` is the table size.

Example when `N = 10`:

```text
index = key % 10
```

### The main problem

Different keys can map to the same slot.
That is called a:

```text
Hash clash
Hash collision
```

### Two major solutions

```text
1. Open hashing / separate chaining
2. Closed hashing
   a) Linear probing
   b) Quadratic probing
```

---

## Key formulas collected in one place

### Basic hash function

```text
index = key % N
```

### Linear probing

```text
index = (key % tableSize + x) % tableSize
where x = 0, 1, 2, 3, ...
```

### Quadratic probing

```text
index = (key % tableSize + x^2) % tableSize
where x = 0, 1, 2, 3, ...
```

### Load factor

```text
load factor = n / N
```

where:
- `n` = number of keys stored
- `N` = table size

### Rehashing

When the table gets too full, create a larger table, usually double the size, and remap all keys.

---

# Slide by slide visual notes

---

## Part 1: Slides 1 to 12

### Slide 1 - Module title

**Visual:** title slide, “Module 9: Hashing and Hash Tables.”  
**Purpose:** introduces the module topic.

---

### Slide 2 - Motivation

**What the slide says visually:**
- The most important operation is emphasized dramatically as:

```text
SEARCH, SEARCH AND SEARCH!
```

- Then it reviews the search complexity of earlier data structures.

**Main point:** the module is motivated entirely by the cost of search.

**Teaching message:**
The lecturer is framing hashing as the next big improvement after lists, trees, BSTs, and heaps.

---

### Slide 3 - Can we aim for O(1)?

**Visual structure:** large red questions with short bullets.

**Main idea:**
- Arrays already support `O(1)` access if the index is known.
- So maybe arrays can help us make search `O(1)` too.

**Central question from the slide:**

```text
How can we put a set of keys onto an array so that the search complexity is O(1)?
```

---

### Slide 4 - Make the key the index

**Visual:** same set of keys shown in an unsorted array and a sorted array, then the slide asks what happens if the key itself becomes the index.

**Example keys used:**

```text
2, 8, 7, 4, 0
```

**Main point:**
- Arbitrary placement gives sequential search: `O(n)`
- Sorted placement gives binary search: `O(log2 n)`
- If the key itself is the index, lookup becomes direct: `O(1)`

This is the first step toward direct addressing.

---

### Slide 5 - Here is the idea

**Visual:** a vertical array of size 10 with highlighted occupied positions.

**Keys shown:**

```text
2, 8, 7, 4, 0
```

**Table idea shown visually:**

```text
Index 0 -> occupied
Index 1 -> null
Index 2 -> occupied
Index 3 -> null
Index 4 -> occupied
Index 5 -> null
Index 6 -> null
Index 7 -> occupied
Index 8 -> occupied
Index 9 -> null
```

**Main point:**
The array acts like a direct lookup table.

---

### Slide 6 - What is the catch?

**Visual:** big red title and a sequence of bullets ending with the three most important conclusions in red.

**Key issue:** direct addressing only works nicely when the keys are small and close together.

The slide asks:

```text
What if the keys are 1, 43, 102, 131, 15143, and 19992?
Would you declare an array of size 20000?
```

**Main conclusion:**
- We gained time complexity.
- But we lost badly in **space complexity**.

**Three red takeaways from the slide:**

```text
The trick: map the key to an index
The process: hashing
The data structure: hash table
```

---

### Slide 7 - Hashing and Hash Table definition

**Visual:** definition slide with large red bullets and formulas centered on the page.

**Definitions:**

```text
A hash table is a storage array.
A hash function maps a key to a specific index on the hash table.
Hashing is the process of storing objects in the hash table using a hash function.
```

**Formula shown:**

```text
key % N
```

where `N` is table size.

**Concrete example shown:**

```text
index = key % 10
```

---

### Slide 8 - First full example setup

**Visual:** empty vertical array indexed 0 through 9, with explanatory text on the right.

**Keys used in the example:**

```text
9876, 234, 5672, 89990, 6777
```

**Hash function:**

```text
index = key % 10
```

**Main purpose:** this slide sets up the example before any keys are placed.

---

### Slide 9 - Insert 9876

**Visual:** the array with 9876 placed into slot 6, with an arrow and annotation.

**Computation:**

```text
9876 % 10 = 6
```

**Table state:**

```text
6 -> 9876
```

---

### Slide 10 - Insert 234

**Visual:** same array, now with 234 circled at slot 4 and 9876 still at slot 6.

**Computation:**

```text
234 % 10 = 4
```

**Table state:**

```text
4 -> 234
6 -> 9876
```

---

### Slide 11 - Insert 5672

**Visual:** 5672 added at slot 2, with arrows from the calculations to the slots.

**Computation:**

```text
5672 % 10 = 2
```

**Table state:**

```text
2 -> 5672
4 -> 234
6 -> 9876
```

---

### Slide 12 - Insert 89990

**Visual:** 89990 added at slot 0, with all previously placed keys still shown.

**Computation:**

```text
89990 % 10 = 0
```

**Table state:**

```text
0 -> 89990
2 -> 5672
4 -> 234
6 -> 9876
```

This finishes most of the direct hash placement example.

---

## Part 2: Slides 13 to 24

### Slide 13 - Insert 6777

**Visual:** the full direct-address-style table now includes 6777 in slot 7.

**Computation:**

```text
6777 % 10 = 7
```

**Table state:**

```text
0 -> 89990
2 -> 5672
4 -> 234
6 -> 9876
7 -> 6777
```

---

### Slide 14 - Now look at the search operations

**Visual:** just the finished table, with no new math yet.

**Purpose:** transitions from insertion to lookup.

---

### Slide 15 - Search for 234

**Visual:** slot 4 is circled and the search process is written on the right.

**Search shown:**

```text
Search for key 234
Apply the hash function
234 % 10 = 4
Go to location 4
Found!
O(1) time complexity!
```

**Main teaching point:** when the key maps straight to its own slot, search is immediate.

---

### Slide 16 - Search for 878

**Visual:** slot 8 is circled as empty.

**Search shown:**

```text
878 % 10 = 8
Go to location 8
Not found!
O(1) time complexity!
```

**Main point:** search can also fail in `O(1)` if the slot is empty.

---

### Slide 17 - Search for 312

**Visual:** the finished table is still shown, and a new search is added.

**Search shown:**

```text
312 % 10 = 2
Go to location 2
Not found!
O(1) time complexity!
```

**Important subtle point:**
Slot 2 is not empty, but it contains **5672**, not **312**. So direct hashing must still check equality of the key in the slot.

---

### Slide 18 - The collision problem begins

**Visual:** a large yellow box with the warning question:

```text
What if two or more keys map to the same index?
```

**Main point:** this is unavoidable because we map a large key space into a smaller table.

---

### Slide 19 - Hash clash example

**Visual:** an empty table with three arrows all pointing to slot 6 and a big “HASH CLASH!” burst.

**Keys used:**

```text
9876, 566, 26
```

**Calculations:**

```text
26 % 10 = 6
566 % 10 = 6
9876 % 10 = 6
```

**Main point:** different keys can collide into the same slot.

---

### Slide 20 - Definition of hash clash problem

**Visual:** plain text definition slide.

**Definition:**
If two or more keys map to the same index, it is called a **hash clash** or **hash collision**.

---

### Slide 21 - Two solutions

**Visual:** the phrase “Two Solutions:” followed by two red bullets.

**Solutions listed:**

```text
Open hashing / separate chaining
Closed hashing
```

This is the main fork in the rest of the module.

---

### Slide 22 - Open hashing starts

**Visual:** a yellow array indexed 0 through 9, each slot pointing outward to the right, but all chains are empty.

**Concept line on slide:**

```text
Create an ArrayList of Linked Lists
```

**Main idea:**
Instead of forcing one key per slot, each bucket can hold a list of keys that hash there.

---

### Slide 23 - Add 9876 to separate chaining table

**Visual:** the first real node appears in the chain at bucket 6.

**State:**

```text
bucket 6: 9876
```

---

### Slide 24 - Add 234 to separate chaining table

**Visual:** bucket 4 now has 234 while bucket 6 still has 9876.

**State:**

```text
bucket 4: 234
bucket 6: 9876
```

---

## Part 3: Slides 25 to 36

### Slides 25 to 32 - Building the full separate chaining example step by step

These slides animate the construction of the hash table using separate chaining for the keys:

```text
9876, 234, 5672, 89990, 6777, 366, 7446, 212, 4676
```

The important hash values are:

```text
9876 % 10 = 6
234  % 10 = 4
5672 % 10 = 2
89990 % 10 = 0
6777 % 10 = 7
366  % 10 = 6
7446 % 10 = 6
212  % 10 = 2
4676 % 10 = 6
```

### Final table built across these slides

```text
bucket 0: 89990
bucket 1: empty
bucket 2: 5672 -> 212
bucket 3: empty
bucket 4: 234
bucket 5: empty
bucket 6: 9876 -> 366 -> 7446 -> 4676
bucket 7: 6777
bucket 8: empty
bucket 9: empty
```

**Visual pattern of the slides:**
- each new key appears in red in the key list
- the new node is appended to the correct linked list on the right side of the bucket
- bucket 6 becomes the main collision chain
- bucket 2 also becomes a shorter chain

These slides are very useful because they make the chaining idea feel concrete rather than abstract.

---

### Slide 33 - More examples with open hashing

This is a handwritten practice slide with two fully worked exercises.

#### Example 1

**Prompt:** insert the keys

```text
50, 700, 76, 85, 92, 73, 101
```

into a table of size 7 using:

```text
key mod 7
```

**Handwritten calculations shown:**

```text
50  mod 7 = 1
700 mod 7 = 0
76  mod 7 = 6
85  mod 7 = 1
92  mod 7 = 1
73  mod 7 = 3
101 mod 7 = 3
```

**Resulting chains shown:**

```text
bucket 0: 700
bucket 1: 50 -> 85 -> 92
bucket 3: 73 -> 101
bucket 6: 76
```

#### Example 2

**Prompt:** hash the words

```text
SKILL, ABILITY, KNOWLEDGE, HARDWORK, ATTITUDE
```

using table size 5 and a custom hash rule:
- convert letters to positions in the alphabet
- add them
- take remainder after division by 5

**Sums shown on the page:**

```text
SKILL      = 63
ABILITY    = 78
KNOWLEDGE  = 96
HARDWORK   = 98
ATTITUDE   = 100
```

**Remainders shown:**

```text
63  mod 5 = 3
78  mod 5 = 3
96  mod 5 = 1
98  mod 5 = 3
100 mod 5 = 0
```

**Resulting table:**

```text
bucket 0: ATTITUDE
bucket 1: KNOWLEDGE
bucket 3: SKILL -> ABILITY -> HARDWORK
```

This is one of the best conceptual slides in the module because it shows that the key does not have to be numeric originally. We can hash strings too.

---

### Slide 34 - Separate chaining with linked lists: search complexity

**Visual:** buckets with linked lists of different lengths, plus handwritten notes on the right.

**Main assumptions written in the notes:**

```text
Suppose there are n keys and the table size is N
```

**Complexities written on the slide:**

```text
Average case: O(n / N)
Worst case:   O(n)
```

**Interpretation:**
- If the load is spread evenly, each chain has about `n/N` items on average.
- If all keys pile into one bucket, search degenerates to linear search.

---

### Slide 35 - Separate chaining using binary search trees

**Visual:** instead of linked lists, some buckets point to trees.

**Handwritten note on slide:**

```text
Avg. case:   O(n / N)
Worst case:  O(n)
```

**Meaning:**
If the bucket trees are not balanced, worst-case search can still degrade.

---

### Slide 36 - Separate chaining using balanced binary search trees

**Visual:** bucket trees are now presented as balanced trees, with heavy handwritten emphasis.

**Key complexities written on the slide:**

```text
Worst case: O(log2 n)
Avg. case:  O((log2 n) / N)
```

The handwritten note at the bottom says this is **inching closer to O(1)**.

**Main idea:**
if each bucket uses a balanced search tree instead of a linked list, bucket-level search becomes faster.

---

## Part 4: Closed hashing, applications, load factor, and Java

### Slide 37 - Closed hashing and linear probing

**Visual:** a typed explanation at the top, then a large hand-drawn example table.

**Definition shown:**
Closed hashing stores keys **directly in the array**. If a collision occurs, we try alternative locations inside the same array until an empty spot is found.

**Two techniques listed:**

```text
Linear probing
Quadratic probing
```

#### Linear probing rule

```text
If collision at index i, try i+1, i+2, i+3, ...
Wrap around if needed.
```

#### Handwritten example 1

**Keys:**

```text
22, 31, 10, 23, 95, 70, 63, 48
```

**Final table drawn on the slide:**

```text
0: 10
1: 31
2: 22
3: 23
4: 70
5: 95
6: 63
7: empty
8: 48
9: empty
```

**Important collisions shown visually:**
- `70 % 10 = 0`, but slot 0 is occupied, so it linearly probes until slot 4
- `63 % 10 = 3`, but 3, 4, and 5 are occupied, so it ends up at 6

**Formula shown:**

```text
index = (key % 10 + x) % 10
```

and in general:

```text
index = (key % tableSize + x) % tableSize
where x = 0, 1, 2, 3, ...
```

---

### Slide 38 - Problems with linear probing

**Visual:** one example shows a big cluster. Another revisits Example 1 and crosses out key 23 to explain deletion trouble.

#### Cluster example

**Keys shown:**

```text
22, 32, 42, 97, 87, 57, 62, 77
```

The table drawing shows keys piling up into neighboring cells, creating a **cluster**.

#### Two problems listed

```text
1. Tends to form clusters
2. Problem with deletion
```

#### Deletion issue

The slide revisits the linear probing table from slide 37 and says:

```text
Search for 70.
Suppose we delete 23.
Then search for 70.
```

If 23 is removed completely, the search chain gets broken.

#### Solution written on slide

```text
Lazy deletion
Do not remove the deleted key, just flag it deleted.
Periodically the array is flushed, deleted keys are removed, and the remaining keys are rehashed.
```

This is a very important operational detail.

---

### Slide 39 - Quadratic probing

**Visual:** typed definition at top, handwritten examples below.

#### Quadratic probing rule

```text
If a collision occurs at index i, try i+1^2, i+2^2, i+3^2, ...
Wrap around if needed.
```

**Formula written on the slide:**

```text
index = (key % tableSize + x^2) % tableSize
where x = 0, 1, 2, 3, ...
```

#### Example 1 on the slide

**Keys:**

```text
22, 31, 23, 95, 70, 63, 48, 50
```

The handwritten table shows quadratic jumps rather than one-step linear movement.

#### Example 2 on the slide

**Keys:**

```text
15, 29, 3, 43, 90, 28, 10, 57, 23
```

Again, keys are placed by jumping according to squares.

#### Example 3 on the slide

**Keys:**

```text
22, 32, 42, 52, 97, 87, 57
```

The slide explicitly writes:

```text
No spot for 57!
```

#### Important theorem-like note at bottom

```text
If the table size is prime and the table is less than half full,
you can always find a spot for any key.
```

This is one of the module’s major facts about quadratic probing.

---

## Supplementary application pages: Hashing in cybersecurity

These pages are visually different from the main slide deck. They look like inserted handout pages or a second export, but they are clearly part of the module material.

### Cybersecurity application page 1

**Top half visual:** three cybersecurity goals are listed:

```text
Confidentiality  = no eavesdropping
Integrity        = message sent = message received
Authentication   = you are who you say you are
```

The slide circles **Integrity** and **Authentication** and points out that hashing plays a role in those two.

**Bottom half visual:** two applications are described.

#### 1. Password checking

The slide says:
- let the client password be `P`
- compute `hash(P)`
- use a secret key to generate a random number called **salt**
- verify the salted hashed value on the server

#### 2. File modification detector

For each file `F`:

```text
compute hash(F)
store it securely
later verify hash(F) to see whether the file changed
```

---

### Cybersecurity application page 2

#### 3. Sender verification by digital signatures

The slide explains:
- A wants to send message `M` to B
- A computes `hash(M)` which is the **message digest**
- A encrypts `hash(M)` using a secret key, producing the **digital signature**
- B receives the message and the signature
- B independently checks the signature

#### 4. Blockchain

The visual at the bottom shows repeated hashing by miners:

```text
Transaction T -> hash(T) -> hash(hash(T)) -> hash(hash(hash(T)))
```

with labels like Miner 1, Miner 2, Miner 3.

The point is not a full blockchain explanation, but to show repeated hashing as a core mechanism.

---

## Load factor, rehashing, and double hashing page

This page is heavily handwritten and is conceptually important.

### Load factor

The formula written clearly is:

```text
load factor = number of keys hashed / hash table size = n / N
```

#### Note written on the page

```text
Open hashing:  n can be > N
Closed hashing: n must be <= N
```

That is because open hashing can grow chains outside the array, but closed hashing stores keys directly in the array.

### Search time complexity summary on this page

**Best case:**

```text
Open   O(1)
Closed O(1)
```

**Worst case:**

```text
Open   O(n)
Closed O(n)
```

**Average case on the page:**

```text
Open with linked lists: O(n / N)
Open with balanced BSTs: O(log2(n / N)) in spirit, written as a logarithmic bucket cost
Closed: depends strongly on load factor
```

The page also includes a graph showing **search time increasing as load factor approaches 1**.

### Rehashing

The typed text says that when the table becomes too full, we create a new table, usually double the size, and remap all the keys.

### Double hashing

At the bottom, the page says:

```text
The key is hashed twice to map it.
```

A handwritten example uses key `1230` and computes:

```text
1230 % 10 = 0
123  % 10 = 3
```

The sketch suggests using a second hash value as part of the probe sequence.

---

## HashMap in Java

### Java API overview page

This page introduces Java’s built-in `HashMap`.

**Main type idea written by hand:**

```text
HashMap<K, V>
```

with `K` labeled as **key** and `V` labeled as **value / record**.

### Methods listed on the page

```java
put(K key, V value)      // add key/value pair
get(K key)               // retrieve value for key, null if not present
containsKey(K key)       // test whether key exists
values()                 // collection of values
keySet()                 // set of keys
remove(K key)            // delete entry by key
isEmpty()                // whether the map is empty
```

---

## Java example 1: student record HashMap

This page contains a full Java example that stores student IDs as keys and student names as values.

### Code shown on the slide

```java
// Simple illustration of hashmap in java
// Creates a hashmap of student id numbers as keys and student names as records.
import java.util.HashMap;
import java.util.Scanner;
import java.io.*;

public class HashMapDemo
{
    public static void main(String[] args) throws IOException
    {
        HashMap<Integer, String> studentRecord = new HashMap<Integer, String>();
        Integer id;
        String name;
        Scanner keyboard = new Scanner(System.in);
        System.out.print("Enter the filename to read from: ");
        String filename = keyboard.nextLine();

        File file = new File(filename);
        Scanner inputFile = new Scanner(file);

        while (inputFile.hasNext())
        {
            id = Integer.parseInt(inputFile.next());
            name = inputFile.nextLine();
            studentRecord.put(id, name);
        }

        inputFile.close();
        System.out.println(studentRecord.values());
        System.out.println(studentRecord.keySet());

        System.out.print("Enter key: ");
        id = keyboard.nextInt();
        if (studentRecord.containsKey(id)) {
            name = studentRecord.get(id);
            System.out.println(id + "\t" + name + " found");
        }
        else
            System.out.println(id + " not found");
    }
}
```

### What the example is teaching

- `HashMap<Integer, String>` means keys are integers and values are strings.
- Data is read from a file.
- Each `(id, name)` pair is inserted into the hash map.
- The program then searches for a key using `containsKey()` and `get()`.

---

## Java example 1 output and alternative map classes

The next page shows sample input and sample runs.

### Input file shown

```text
10245 James
23450 Jack
10398 Amar
10009 Boris
51430 Amy
69087 Brenda
88700 Zirui
67568 Xu
22229 Nick
17171 Chandra
```

### Sample run with HashMap

The page shows that the values and keys are printed, but the order is not sorted and not necessarily insertion order.

A sample search shown is:

```text
Enter the search key: 10398
10398    Amar found
```

### Two alternative classes on the page

#### TreeMap

The page says:
- TreeMap stores the records in a **tree data structure**
- Retrieval is in **sorted order**
- Default sorting is done on the keys

Example declaration shown:

```java
TreeMap<Integer, String> studentRecord = new TreeMap<Integer, String>();
```

#### LinkedHashMap

The page says:
- LinkedHashMap stores the records using a **doubly linked list**
- Retrieval is in **order of insertion**

Example declaration shown:

```java
LinkedHashMap<Integer, String> studentRecord = new LinkedHashMap<Integer, String>();
```

This page is useful because it distinguishes:
- `HashMap` -> fast hashing, no guaranteed order
- `TreeMap` -> sorted order
- `LinkedHashMap` -> insertion order

---

## Java example 2: map from a word to all line numbers where it appears

The final page contains a HashMap example the instructor clearly wanted students to pay attention to, since there is a handwritten note saying:

```text
Trace this.
```

### Code shown on the page

```java
import java.util.*;

public class HashMapDemo4 {

    public static void main(String [] args) {

        Scanner keyboard = new Scanner(System.in);

        // create empty map
        HashMap<String, ArrayList<Integer>> data =
            new HashMap<String, ArrayList<Integer>>();

        // read words, one on each line, until "end"
        String word = keyboard.next();
        int lineNumber = 1;
        while (!word.equals("end")) {

            // if the word is not yet in map
            if (data.get(word) == null) {

                // create a new list and add it to the map
                ArrayList<Integer> lines = new ArrayList<Integer>();
                lines.add(lineNumber);
                data.put(word, lines);
            }
            else {

                // get the existing list for this word
                ArrayList<Integer> lines = data.get(word);

                // add the line number to that list
                lines.add(lineNumber);
            }

            // get the next word
            word = keyboard.next();
            lineNumber += 1;
        }

        // print the map
        for (String w : data.keySet()) {
            System.out.println(w + " = " + data.get(w));
        }
    }
}
```

### What this example teaches

This is a very important map pattern:

```text
key   -> one record? no
key   -> a collection of related values
```

Here the map stores:

```text
word -> list of line numbers where the word appears
```

So the value in a hash map does not have to be a single object. It can itself be a collection like an `ArrayList<Integer>`.

---

# Concept summary by topic

## 1. Direct addressing

Fast, but wastes too much space when keys are large or sparse.

## 2. Hashing

Maps a key to a smaller index range using a hash function.

## 3. Collision

Unavoidable when many keys share a smaller table.

## 4. Open hashing / separate chaining

Use a bucket array where each bucket stores a linked list or tree.

```text
Average with linked lists: O(n / N)
Worst case: O(n)
```

Can allow `n > N`.

## 5. Closed hashing

Store keys directly in the array and probe for alternatives.

```text
Best case: O(1)
Worst case: O(n)
```

Requires `n <= N`.

## 6. Linear probing

Simple, but causes clustering and deletion issues.

## 7. Quadratic probing

Reduces clustering compared with linear probing.
Needs care with table size and fullness.

## 8. Load factor

```text
load factor = n / N
```

This controls average search performance.

## 9. Rehashing

When the load gets too high, create a larger table and remap all keys.

## 10. Java HashMap

Use `HashMap<K, V>` when you want fast average-case key lookup.

---

# Final exam-style takeaways

## Definitions you should know exactly

```text
hash table
hash function
hashing
hash collision / hash clash
open hashing
separate chaining
closed hashing
linear probing
quadratic probing
load factor
rehashing
```

## Formulas you should know

```text
index = key % N
index = (key % tableSize + x) % tableSize
index = (key % tableSize + x^2) % tableSize
load factor = n / N
```

## Comparison points you should be able to explain

### Open hashing vs closed hashing

```text
Open hashing:
- bucket points to external chain / tree
- n can be greater than N
- average depends on chain length

Closed hashing:
- keys stay inside the array
- n must be less than or equal to N
- probing finds alternate slots
```

### Linear vs quadratic probing

```text
Linear probing:
- easy
- tends to cluster
- deletion is awkward

Quadratic probing:
- spreads probes more
- better against clustering
- may fail unless table conditions are good
```

### HashMap vs TreeMap vs LinkedHashMap

```text
HashMap      -> no guaranteed order
TreeMap      -> sorted by key
LinkedHashMap -> insertion order
```

---

# One-paragraph module summary

Module 9 teaches that hashing is a way to turn the array’s `O(1)` index access into fast average-case searching by using a hash function to map keys into a table. The module first shows why direct indexing is too space-expensive, then introduces hashing and the collision problem. It develops two main collision strategies, separate chaining and closed hashing, and compares their behavior using examples, probing formulas, load factor, and complexity. It ends by showing that hashing is not only a data structures topic but also a practical tool in cybersecurity and in Java programming through `HashMap`, `TreeMap`, and `LinkedHashMap`.
