# COMPREHENSIVE ENHANCED STUDY GUIDE FOR PROOFS
## PART 3: DIRECT PROOFS, INDIRECT PROOFS, AND INDUCTION

---

## UNIT 2: DIRECT PROOF METHODS

### Topic 2.1: Direct Proof of Implications

#### Plain-Language Explanation

Direct proof is the "straightforward" method. You assume the hypothesis is true and use logical steps to derive the conclusion. No tricks—just careful reasoning from assumption to result.

Think of driving from home to work: you start at home (hypothesis), follow roads step-by-step (logical steps), and arrive at work (conclusion).

#### Formal Structure

To prove P → Q by direct proof:
1. Assume P is true
2. Through logical steps, derive Q
3. Conclude P → Q

#### Why It Matters

Direct proof is the first method to try. Many proofs can be done directly. If you master this, you have a foundation for everything else.

#### How It Appears

- "Prove that if...then..."
- Simple implications about numbers (even/odd, divisible, etc.)
- Algebraic or logical chains

#### Multiple-Choice Recognition

A direct proof:
- Starts by assuming the hypothesis ✓
- Does not assume the conclusion is false ✓
- Chains logically from start to finish ✓
- Does not reverse the statement ✓

#### Worked Examples

**Example 1: Even numbers**

**Claim:** If n is even, then n² is even.

**Direct Proof:**
```
Suppose n is even.
By definition, n = 2k for some integer k.
Then n² = (2k)² = 4k² = 2(2k²).
Since 2k² is an integer, n² is a multiple of 2.
Therefore, n² is even.
```

**Example 2: Divisibility**

**Claim:** If a divides b and b divides c, then a divides c.

**Direct Proof:**
```
Suppose a divides b and b divides c.
By definition, b = ak for some integer k.
Also by definition, c = bm for some integer m.
Substituting: c = (ak)m = a(km).
Since km is an integer, a divides c.
```

**Example 3: Sets**

**Claim:** If A ⊆ B and B ⊆ C, then A ⊆ C.

**Direct Proof:**
```
Suppose A ⊆ B and B ⊆ C.
Let x ∈ A.
Since A ⊆ B and x ∈ A, we have x ∈ B.
Since B ⊆ C and x ∈ B, we have x ∈ C.
Therefore, A ⊆ C.
```

#### Common Mistakes

- **Not using the hypothesis:** Best mistake to catch early
- **Starting with the conclusion:** Working backward instead of forward
- **Being too abstract:** Write out definitions (even = 2k, etc.)
- **Skipping steps:** "Therefore [big jump to conclusion]"

#### Memory Aid

**Direct = Don't dance around; direct the logic forward**

---

### Topic 2.2: Proof by Cases

#### Plain-Language Explanation

Proof by cases works when the hypothesis naturally splits into separate situations. You prove the claim in each situation individually, then combine to conclude it holds overall.

Like a manager assigning tasks: "If you're in Sales, do X. If you're in Marketing, do Y. If you're in Engineering, do Z. Therefore, everyone does something."

#### Formal Structure

To prove P → Q by cases where P splits into cases C₁, C₂, ..., Cₙ:
1. Verify cases C₁, C₂, ..., Cₙ are exhaustive (cover all possibilities)
2. For each case Cᵢ: assume Cᵢ and P, prove Q
3. Since all cases covered and Q proven in each, Q follows from P

#### Why It Matters

Many problems naturally split: even vs. odd, positive vs. negative vs. zero, modular classes, etc. Missing a case ruins the proof.

#### How It Appears

- "Prove for all integers n that..." (hints: even/odd cases)
- "Prove for all real x that..." (hints: positive/negative/zero)
- "Show that property holds for all [set split into categories]"

#### Multiple-Choice Recognition

A valid proof by cases:
- Identifies all possible cases ✓
- Proves the conclusion in every single case ✓
- Explicitly states cases are exhaustive ✓
- Concludes from coverage ✓

Invalid (watch for these!):
- Missing a case ✗
- Only checking one or some cases ✗
- Not stating the cases explicitly ✗

#### Worked Examples

**Example 1: Parity (even/odd)**

**Claim:** For any integer n, n(n+1) is even.

**Proof by Cases:**
```
Consider any integer n.
Case 1: n is even.
  Then n = 2k for some integer k.
  So n(n+1) = 2k(2k+1) = 2[k(2k+1)].
  Since k(2k+1) is an integer, n(n+1) is even.

Case 2: n is odd.
  Then n = 2k+1 for some integer k.
  So n+1 = 2k+2 = 2(k+1).
  Thus n(n+1) = (2k+1)·2(k+1) = 2[(2k+1)(k+1)].
  Since (2k+1)(k+1) is an integer, n(n+1) is even.

Since n is either even or odd, and n(n+1) is even in both cases,
n(n+1) is even for all integers n.
```

**Example 2: Sign (positive/negative/zero)**

**Claim:** For any real x, x² ≥ 0.

**Proof by Cases:**
```
Case 1: x > 0.
  Then x² = x · x > 0 (positive times positive).
  So x² ≥ 0.

Case 2: x < 0.
  Then x² = x · x = |x| · |x| > 0 (both factors positive magnitude).
  So x² ≥ 0.

Case 3: x = 0.
  Then x² = 0 · 0 = 0.
  So x² ≥ 0.

Since x is either positive, negative, or zero, and x² ≥ 0 in all cases,
x² ≥ 0 for all real x.
```

#### Common Mistakes

- **Missing a case:** Most common; remember "even/odd" or "positive/negative/zero"
- **Not proving conclusion in all cases:** Half the proof done isn't a proof
- **Not labeling cases clearly:** Reader gets lost
- **Overlapping cases:** Case 1 is x > 0, Case 2 is x ≥ 0 (overlaps!)

#### Memory Aid

**Cases must be (C)omplete and (C)omprehensive**

---

### Topic 2.3: Proof Using Sets

#### Plain-Language Explanation

Set proofs translate membership, subset, and equality claims into logical statements, then prove those.

- **x ∈ A:** x has the defining property of A
- **A ⊆ B:** every element of A is in B
- **A = B:** A and B have exactly the same elements

#### Formal Patterns

**To prove x ∈ {y : P(y)}:** Show P(x)

**To prove A ⊆ B:**
- Assume x ∈ A
- Show x ∈ B
- Conclude A ⊆ B

**To prove A = B:**
- Prove A ⊆ B (every element of A is in B)
- Prove B ⊆ A (every element of B is in A)
- Conclude A = B

#### Why It Matters

Set proofs appear frequently. They're really logic proofs in disguise. Master the structure and you've got them.

#### How It Appears

- "Prove A ⊆ B"
- "Show A = B"
- "Prove: if x ∈ A, then x ∈ B"

#### Multiple-Choice Recognition

- **Subset proof:** Use element-chasing (let x ∈ first set, show x ∈ second set)
- **Equality proof:** Must show **both** directions ✓
- Watch for: only showing one direction ✗

#### Worked Examples

**Example 1: Membership**

**Claim:** x = 3 ∈ {n : n² - 2n - 3 = 0}

**Proof:**
```
We must show 3² - 2(3) - 3 = 0.
3² - 2(3) - 3 = 9 - 6 - 3 = 0. ✓
Therefore, 3 ∈ {n : n² - 2n - 3 = 0}.
```

**Example 2: Subset**

**Claim:** {n : n is a multiple of 4} ⊆ {n : n is even}

**Proof:**
```
Let x ∈ {n : n is a multiple of 4}.
By definition, x = 4k for some integer k.
Then x = 4k = 2(2k).
Since 2k is an integer, x is a multiple of 2, hence even.
Therefore x ∈ {n : n is even}.
Since x was arbitrary, {n : n is a multiple of 4} ⊆ {n : n is even}.
```

**Example 3: Set Equality**

**Claim:** {n : n is divisible by 6} = {n : n is divisible by both 2 and 3}

**Proof:**
**Part 1:** Show LHS ⊆ RHS
```
Let x be divisible by 6.
Then x = 6k for some integer k.
So x = (2·3)k = 2(3k), meaning x is divisible by 2.
And x = (3·2)k = 3(2k), meaning x is divisible by 3.
Therefore x is divisible by both 2 and 3.
```

**Part 2:** Show RHS ⊆ LHS
```
Let x be divisible by both 2 and 3.
Then x = 2a for some integer a, and x = 3b for some integer b.
Since gcd(2,3) = 1, we have x = 6m for some integer m.
Therefore x is divisible by 6.
```

**Conclusion:** Since both inclusions hold, the sets are equal.

#### Common Mistakes

- **Set equality with only one direction:** Critical error
- **Confusing ∈ (element) with ⊆ (subset):** Different concepts
- **Not using definitions:** Write out "divisible by" means "= mk"
- **Element-chasing too vaguely:** Be explicit about which membership you're proving

#### Memory Aid

**Set Equality = (E)ach direction**

---

### Topic 2.4: Existence Proofs and Counterexamples

#### Plain-Language Explanation

- **Existence proof:** To prove "there exists x with property P," find ONE example
- **Counterexample:** To disprove "all x have property P," find ONE example where P fails

One example is ENOUGH for existence. One example is ENOUGH to kill a universal claim. But one example is NEVER enough to prove a universal claim.

#### Formal Definitions

**Existence Proof:** To prove ∃x ∈ A, P(x), provide a specific c ∈ A such that P(c) is true

**Counterexample:** To disprove ∀x ∈ A, P(x), provide a specific c ∈ A such that ¬P(c)

#### Why It Matters

THIS IS CRITICAL: Students confuse what examples do.
- One example = proves existence ✓
- One example = disproves universality ✓
- One example = does NOT prove universality ✗

#### How It Appears in Problems

- "Show there exists an even prime"
- "Is it true that all primes are odd? Justify."
- "Find a counterexample to..."

#### Multiple-Choice Recognition

- **"Prove there exists":** Look for "let x = [specific value]" or "(name) is an example"
- **"All X have property Y" false?:** Look for one X that doesn't have Y

#### Worked Examples

**Example 1: Existence Proof**

**Claim:** There exists a prime number that is even.

**Proof:**
```
Let p = 2.
2 is prime (only divisors are 1 and 2).
2 is even (2 = 2 · 1).
Therefore, there exists a prime number that is even.
```

**Example 2: Using Examples in Existence**

**Claim:** There exist integers x and y such that x² + y² = 50.

**Proof:**
```
Let x = 1 and y = 7.
Then x² + y² = 1 + 49 = 50. ✓
Therefore, there exist integers x and y with x² + y² = 50.
```

**Example 3: Counterexample**

**Claim:** "All prime numbers are odd" is FALSE.

**Disproof:**
```
Consider p = 2.
2 is prime (only divisors: 1, 2).
2 is even (not odd).
This is a counterexample to the claim.
Therefore, "all primes are odd" is FALSE.
```

**Example 4: Why One Example Is NOT Enough**

**Incorrect:** "Prove all primes > 2 are odd."
Response: "3 is prime and 3 is odd." ✗
(This is ONE example, not proof for ALL)

**Correct:** "Prove all primes > 2 are odd."
Response: "Let p > 2 be prime. If p were even, then p would be divisible by 2. Since p > 2 and divisible by 2, p is not prime (has divisor 2 besides 1 and itself). Contradiction. So p is odd." ✓
(This is a proof covering all primes > 2, not just examples)

#### Common Mistakes

- **Biggest mistake:** Using one example to "prove" a universal statement
- **Second biggest:** Not realizing one counterexample kills a universal claim
- **Third:** Thinking counterexample needs to satisfy the original statement

#### Memory Aid

- **Existence Proof = Find One Example to Prove "There Exists"**
- **Counterexample = Find One Example to disprove "For All"**
- **Universal Proof = Need LOGICAL ARGUMENT for every case, not just examples**

---

## UNIT 3: INDIRECT PROOF METHODS

### Topic 3.1: Proof by Contrapositive

#### Plain-Language Explanation

Instead of proving P → Q directly, prove ¬Q → ¬P (read "not Q implies not P"). It's logically equivalent, but sometimes easier to work with.

Think: instead of proving "if you're sick, you need a doctor," prove "if you don't need a doctor, you're not sick."

#### Formal Definition

**Contrapositive of P → Q is ¬Q → ¬P**

**Logical fact:** P → Q ≡ ¬Q → ¬P (they're logically equivalent)

So if you prove one, you've proven the other.

#### Key Distinction: Contrapositive vs. Converse

**This trip up students constantly.**

- **Contrapositive of P → Q:** ¬Q → ¬P (logically equivalent ✓)
- **Converse of P → Q:** Q → P (NOT equivalent ✗)

If you prove contrapositive, you've proven the original. If you prove converse, you haven't proven anything about the original.

#### Why It Matters

Sometimes negating the conclusion gives you something easier to work with algebraically or logically.

#### How It Appears

- Problems about proving "not divisible," "not equal," "not in set"
- When direct proof feels messy

#### Multiple-Choice Recognition

- "Prove by contrapositive" explicitly asked for → flip and negate both sides
- Looking for logically equivalent statement → contrapositive is equivalent, converse is not

#### Worked Examples

**Example 1: Contrapositive in Algebra**

**Claim:** If n² is odd, then n is odd.

**Contrapositive:** If n is not odd (i.e., n is even), then n² is not odd (i.e., n² is even).

**Proof by Contrapositive:**
```
We prove the contrapositive: if n is even, then n² is even.

Suppose n is even.
Then n = 2k for some integer k.
So n² = (2k)² = 4k² = 2(2k²).
Since 2k² is an integer, n² is even.

Therefore, if n² is odd, then n is odd. (By contrapositive)
```

**Example 2: Contrapositive with Divisibility**

**Claim:** If a does not divide b, then a does not divide bc (for any integer c).

**Contrapositive:** If a divides bc, then a divides b.

**Proof by Contrapositive:**
```
Suppose a divides bc.
Then bc = ak for some integer k.
[Additional reasoning using properties of divisibility...]
This becomes complex without additional assumptions.
Contrapositive might NOT be easier here! (Use direct proof instead.)
```

**Example 3: Why Contrapositive Helps**

**Claim:** If a real number is not a rational number, then it is irrational.

**Direct version:** confusing double negative
**Contrapositive:** If a real number is rational, then it is not irrational.
(This is obvious/clearer!)

#### Common Mistakes

- **Using converse instead:** Prove Q → P and think you've proven P → Q ✗
- **Negating incorrectly:** ¬(P ∧ Q) is not ¬P ∧ ¬Q; it's ¬P ∨ ¬Q
- **Not checking if contrapositive is actually easier:** Sometimes direct proof is simpler

#### Memory Aid

**Contrapositive = Flip and negate both parts**
**(Converse ≠ not equivalent; don't confuse!)**

---

### Topic 3.2: Proof by Contradiction

#### Plain-Language Explanation

Assume the opposite of what you want to prove. If assuming the opposite leads to an impossibility (a contradiction), then the opposite must be false, so your claim must be true.

Like a detective: "If the suspect was at the crime scene, then they would have mud on their shoes. But there's no mud. Contradiction. So they weren't there."

#### Formal Structure

To prove P by contradiction:
1. Assume ¬P (the opposite of what you want to prove)
2. Through logical reasoning, derive a contradiction (C and ¬C)
3. Conclude P must be true

#### Why It Matters

Best for "no such object exists," "X is impossible," "X is unique," irrational number proofs, etc.

#### How It Appears

- "Prove no such [object] exists"
- "Show [property] is impossible"
- "Prove [number] is irrational"
- "Prove uniqueness"

#### Multiple-Choice Recognition

- "Proof assumes opposite, derives impossibility" → contradiction ✓
- Looks for actual contradiction C ∧ ¬C, not just something surprising ✓
- Wrong answers: something unexpected but not contradictory ✗

#### Worked Examples

**Example 1: Classic - √2 is Irrational**

**Claim:** √2 is irrational (cannot be written as a/b for integers a, b)

**Proof by Contradiction:**
```
Assume √2 is rational.
Then √2 = a/b for some integers a, b in lowest terms (gcd(a,b) = 1).

Squaring: 2 = a²/b²
So: 2b² = a²

This means a² is even (it equals 2b²).
If a² is even, then a is even (as shown earlier).
So a = 2k for some integer k.

Substituting: 2b² = (2k)² = 4k²
So: b² = 2k²

This means b² is even.
If b² is even, then b is even.

But now a and b are both even, contradicting gcd(a,b) = 1.

Therefore, √2 is irrational.
```

**Example 2: Uniqueness Proof**

**Claim:** There is a unique integer solution to x + 3 = 5.

**Proof by Contradiction:**
```
Assume there are two distinct solutions x = a and x = b with a ≠ b.

From x + 3 = 5:
- a + 3 = 5, so a = 2
- b + 3 = 5, so b = 2

But then a = 2 = b, contradicting a ≠ b.

Therefore, there is a unique solution x = 2.
```

**Example 3: Impossibility**

**Claim:** There is no integer n such that 3n + 2 = 3m for any integer m.

**Proof by Contradiction:**
```
Assume there exists an integer n such that 3n + 2 = 3m for some integer m.

Then: 3n + 2 = 3m
      2 = 3m - 3n
      2 = 3(m - n)

Since m and n are integers, m - n is an integer.
So 2 = 3 · (integer), meaning 3 divides 2.

But 3 does not divide 2 (since 2/3 is not an integer).

Contradiction. Therefore, no such n exists.
```

#### Common Mistakes

- **Weak contradiction:** Deriving something surprising or unlikely (but not logically impossible)
  - "This is weird" ✗ vs. "This contradicts known fact X" ✓

- **Not being clear what the contradiction is:** Make C ∧ ¬C explicit

- **Assuming too much:** Only assume the negation of what you want to prove

#### Memory Aid

**Contradiction = Assume opposite, find C ∧ ¬C**

---

### Topic 3.3: Biconditional Proofs

#### Plain-Language Explanation

An "if and only if" (iff) statement means TWO implications:
- A ↔ B means both (A → B) AND (B → A)
- Two directions, both must be proven

#### Formal Definition

**Biconditional P ↔ Q is true iff both P → Q and Q → P are true**

#### Why It Matters

Students frequently prove only one direction. Both are required.

#### How It Appears

- "Prove [statement] if and only if [other statement]"
- "A ↔ B"
- "[Property] iff [other property]"

#### Multiple-Choice Recognition

- Biconditional answer must mention both directions ✓
- Watch for answers proving only one direction ✗

#### Worked Examples

**Example 1: Divisibility**

**Claim:** n is even ↔ n is divisible by 2

**Proof:**
```
(→) Assume n is even.
    Then n = 2k for some integer k.
    So n is divisible by 2. ✓

(←) Assume n is divisible by 2.
    Then n = 2m for some integer m.
    By definition, n is even. ✓

Therefore, n is even ↔ n is divisible by 2.
```

**Example 2: Set Membership**

**Claim:** x ∈ (A ∩ B) ↔ (x ∈ A AND x ∈ B)

**Proof:**
```
(→) Assume x ∈ (A ∩ B).
    By definition of intersection, x ∈ A and x ∈ B. ✓

(←) Assume x ∈ A and x ∈ B.
    By definition of intersection, x ∈ (A ∩ B). ✓

Therefore, x ∈ (A ∩ B) ↔ (x ∈ A and x ∈ B).
```

#### Common Mistakes

- **Only proving one direction** (huge error)
- **Not clearly labeling which direction** (causes confusion)
- **Circular reasoning:** Implicitly using the reverse direction in forward proof

#### Memory Aid

**Biconditional = Both directions**
**(IFF = If and only if = two proofs)**

---

### Topic 3.4: Equivalence Statements

#### Plain-Language Explanation

"The following are equivalent" means a chain of statement where each implies the next...eventually back to the first. They all stand or fall together.

Example: "A ↔ B ↔ C" means A ↔ B and B ↔ C (and hence A ↔ C).

#### Why It Matters

You may need to prove equivalence chains (often more elegant than proving multiple biconditionals individually).

#### Common Pattern

Prove: A → B → C → A (circular chain means all equivalent)

#### Worked Example

**Claim:** For an integer n, the following are equivalent:
(A) n is even
(B) n is divisible by 2
(C) n² is even

**Proof (circular chain):**
```
(A → B): If n is even, then n = 2k, so n is divisible by 2. ✓

(B → C): If n is divisible by 2, then n = 2m, so n² = 4m² = 2(2m²) is even. ✓

(C → A): If n² is even, we proved earlier that n is even. ✓

Since A → B → C → A, all three are equivalent.
```

---

## End of Part 3

**Next:** Part 4 will cover Mathematical Induction in detail (basic, strong, and non-trivial base cases).
