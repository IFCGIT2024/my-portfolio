# Complete Exam Preparation Guide: Mathematical Proofs

---

## STEP 1: Material Review and Organization

### Complete Topic Structure

**Unit 1: Introduction to Proofs & Logical Foundations**
- What a proof is and why it matters
- Theorem, proposition, lemma, corollary - terminology and hierarchy
- Definition - how definitions are used within proofs
- Premise/hypothesis vs. conclusion - identifying what is assumed vs. what must be shown
- Universal/existential statements - recognizing quantified claims
- Universal/existential instantiation and generalization - logical rules for reasoning

**Unit 2: Direct Proof Methods**
- Direct proof - assuming the hypothesis and deriving the conclusion
- Proof by cases - dividing into exhaustive categories
- Set membership and subset proofs - element-chasing arguments
- Existence proofs - finding a witness to prove "there exists"
- Examples vs. counterexamples - what examples can and cannot prove
- Common mistakes - when students use examples incorrectly

**Unit 3: Indirect Proof Methods**
- Proof by contrapositive - proving the logically equivalent converse
- Proof by contradiction - assuming negation and deriving impossibility
- Biconditional proofs - "if and only if" requires two directions
- Equivalence proofs - "the following are equivalent" chains

**Unit 4: Proof by Mathematical Induction**
- The principle of mathematical induction - how it works conceptually
- Base case - checking the starting point
- Inductive hypothesis - the assumption P(k)
- Inductive step - proving P(k) → P(k+1)
- Non-trivial base cases - when to start at n ≠ 1
- Strong induction - assuming all prior cases, not just one

**Unit 5: Recursive Functions and Recursive Proofs**
- Recursive definition - defining values in terms of earlier values
- Base cases in recursion - must have enough to start
- Recursive case - the rule for subsequent values
- Fibonacci sequences - classic example with two base cases
- Proving recursive identities with induction - combining both techniques

### Topic Emphasis & Priority Signals

**Appears heavily emphasized in materials:**
- Mathematical induction (multiple lessons, detailed explanation)
- Proof structure and templates
- Contrapositive and how it differs from converse
- The role of definitions in proofs

**Appears multiple times across different contexts:**
- Direct proof techniques
- Set proofs (appears in context of many proof types)
- Contradiction proofs (especially for "no such thing exists")
- Recursive functions

**Has special sections or "non-trivial" warnings:**
- Non-trivial base cases in induction
- Strong induction (separate from weak)
- The distinction between examples and proofs

---

## STEP 2: Master Exam Overview

### Unit 1: Introduction to Proofs & Logic

**You need to know:**
- The exact definitions and distinctions between theorem, proposition, lemma, corollary
- What makes something a proof (not just intuition or examples)
- How to identify the premise and conclusion in any statement
- How instantiation and generalization work as logical tools

**What to memorize cold:**
- Definitions: theorem, proof, definition, proposition, lemma, corollary
- Universal instantiation/generalization formulas
- Existential instantiation/generalization formulas
- The logical structure: ∀x, ∃x, P → Q

**What to understand deeply:**
- A proof is a logically valid chain of reasoning, not just evidence
- Definitions are the tools you use to transform statements
- Instantiation moves from a general claim to a specific case
- Generalization moves from a specific case to a general claim

**Confusion zones to watch for:**
- Lemma vs. theorem vs. proposition - their roles differ, not just their importance
- Proposition vs. lemma - which helps prove which?
- Example vs. proof - students often think examples are proofs
- ∀x vs ∃x - universal claims require all cases; existential require just one

---

### Unit 2: Direct Proofs

**You need to know:**
- How to structure a direct proof (assume P, derive Q)
- When each proof type applies (direct, cases, sets, examples)
- Why one example cannot prove a universal statement
- How to determine if a set proof requires subset, membership, or equality

**What to memorize:**
- Direct proof structure: Assume P. [work]. Therefore Q.
- Proof by cases must cover ALL exhaustive categories
- Set equality ALWAYS requires proving both A ⊆ B and B ⊆ A
- One example proves existence; cannot prove universality

**What to understand deeply:**
- Direct proof starts from what you know (hypothesis) not where you want to go
- Proof by cases needs both the identification of all cases AND the proof in each case
- Element-chasing in set proofs is really a disguised logical argument
- An example is concrete; a proof is general

**Confusion zones:**
- Forgetting to use the hypothesis in direct proof
- Incomplete case coverage (missing one case invalidates the proof)
- Thinking one example proves "for all" (this is the #1 mistake)
- Trying to prove set equality with only one inclusion

---

### Unit 3: Indirect Proofs

**You need to know:**
- Contrapositive is logically equivalent to the original; the converse is not
- Contradiction means deriving both P and ¬P simultaneously
- Biconditional (iff) requires proving both directions
- When each method is most efficient

**What to memorize:**
- Contrapositive of (P → Q) is (¬Q → ¬P)
- Converse of (P → Q) is (Q → P) - NOT equivalent
- Biconditional requires two proofs
- Equivalence proofs chain logical equivalences

**What to understand deeply:**
- Why contrapositive is equivalent: you can always trade P → Q for its contrapositive
- Contradiction works because assuming the opposite and deriving a logical impossibility means your assumption was wrong
- Biconditional is really two implications; you must do both

**Confusion zones:**
- Contrapositive vs. converse (students often mix them up)
- Contradiction vs. contrapositive (both are indirect, but different)
- Only proving one direction of biconditional (common error)
- Thinking "surprising result" is the same as "contradiction"

---

### Unit 4: Mathematical Induction

**You need to know:**
- The three-part structure: base case, inductive hypothesis, inductive step
- The inductive step is NOT "checking the next example"; it's proving a logical implication
- Strong induction assumes all earlier cases, not just one
- Base cases can start at any value, not always n = 1

**What to memorize:**
- Three-part structure: base, hypothesis, step
- The inductive step must use the IH explicitly
- Strong induction assumes: P(1), P(2), ..., P(k) all true, then prove P(k+1)
- Induction works by chaining forward: base case true → P(1) true → P(2) true → ... all true

**What to understand deeply:**
- Induction proves infinitely many cases by proving a logical chain
- The base case establishes the foundation of the chain
- The inductive step ensures each link leads to the next
- Together, these make the logical chain unbreakable

**Confusion zones:**
- Skipping the explicitly stated P(n) - students sometimes forget to write what they're proving
- Using P(k+1) before proving it (circular reasoning)
- Bad algebra in the inductive step
- Wrong base case (starting at wrong n value)
- Not clearly using the IH in the proof

---

### Unit 5: Recursive Functions

**You need to know:**
- Recursive definition = values defined in terms of earlier values
- Must have sufficient base cases to start the recursion
- Induction is the natural tool for proving recursive identities
- Fibonacci is the classic example with two base cases

**What to memorize:**
- Fibonacci: F₀ = 0, F₁ = 1, Fₙ = Fₙ₋₁ + Fₙ₋₂ for n > 1
- Recursive function = base case(s) + recursive case
- The recursive case must reference earlier/known values

**What to understand deeply:**
- Recursion and induction are naturally paired
- The recursive definition tells you what to assume in induction
- Induction proof mirrors the recursive structure

**Confusion zones:**
- Mixing recursive definition with explicit formula
- Forgetting enough base cases (Fibonacci needs two)
- Not matching the recurrence correctly in proofs
- Thinking recursion is intrinsically harder (it's just a pattern)

---

## STEP 3: Concise Cheat Sheet

### Core Definitions & Terminology

| Term | Definition |
|------|-----------|
| **Theorem** | Important true statement that has been proven |
| **Proof** | Logical written argument showing why a statement must be true |
| **Definition** | Exact, precise meaning of a term (not proven, but established) |
| **Proposition** | True statement with proof; typically less central than a theorem |
| **Lemma** | Helper theorem; proved to help prove a more important theorem |
| **Corollary** | Result that follows immediately and easily from a theorem |

### Logic Structure

- **Premise/Hypothesis**: What you assume/are given
- **Conclusion**: What you must show/derive
- **Implication**: P → Q (if P then Q)
- **Most proofs have form**: Assume hypothesis, work logically, show conclusion follows necessarily

### Quantifiers & Instantiation

| Rule | Meaning |
|------|---------|
| **Universal Instantiation** | From (∀x ∈ A, P(x)), conclude P(c) for arbitrary c ∈ A |
| **Universal Generalization** | If you prove P(c) for arbitrary c, conclude ∀x, P(x) |
| **Existential Instantiation** | From (∃x, P(x)), pick one specific object with P(x) |
| **Existential Generalization** | From P(c) for one c, conclude ∃x, P(x) |

### Proof Selection at a Glance

| Problem Type | Best Method | Key Indicator |
|--------------|-------------|---------------|
| "If ... then ..." | Direct proof first | Implication structure |
| "For all integers n ≥ n₀" | Mathematical induction | Integer indexed universality |
| "If and only if" | Two separate proofs | Biconditional (↔) |
| "There exists ..." | Find a witness | Existential claim |
| "No such object exists" | Contradiction or counterexample | Negation or universally false |
| "Set equality A = B" | Double inclusion | Set membership proof |
| "Even/odd/divisible" | Direct using definitions | Parity or divisibility |
| "If P → Q awkward" | Try contrapositive | Negation of Q easier to work with |

### Critical Logical Reminders

**Contrapositive:**
- Original: P → Q
- Contrapositive: ¬Q → ¬P (logically equivalent!)
- Converse: Q → P (NOT equivalent in general)

**Biconditional:**
- P ↔ Q means both P → Q AND Q → P
- Must prove both directions or proof is incomplete

**Set Operations:**
- To show x ∈ A: Prove A's defining property holds for x
- To show A ⊆ B: Let x ∈ A, prove x ∈ B
- To show A = B: Prove A ⊆ B **AND** B ⊆ A (both required)

### Mathematical Induction Structure

```
Proposition: P(n) for all n ≥ n₀

Base Case: Show P(n₀) is true
Inductive Hypothesis: Assume P(k) is true for some k ≥ n₀
Inductive Step: Show P(k+1) follows from P(k)
Conclusion: Therefore P(n) is true for all n ≥ n₀
```

### "If You See This, Think This"

| Phrase | Think | Method |
|--------|-------|--------|
| "For all integers n ≥ ..." | Induction | Mathematical induction |
| "If ... then ..." | Two options | Direct proof, then contrapositive |
| "If and only if" | Two jobs | Prove both P→Q and Q→P |
| "Prove there exists ..." | Find it | Construct a witness |
| "No such ... exists" | Assume it does | Proof by contradiction |
| "Set equality" | Two inclusions | A ⊆ B and B ⊆ A both needed |
| "False claim: for all ..." | One counterexample | Disproof by counterexample |
| "A divides B" | Algebraic form | Write B = Ak for integer k |

### Common Traps & What They Look Like

1. **"One example proves for all"** - This is false. One example proves existence only.
2. **"Contrapositive is the converse"** - No. Contrapositive is ¬Q → ¬P, not Q → P.
3. **"I proved P iff Q by proving only P → Q"** - No. Biconditional requires both directions.
4. **"I checked examples, so the claim is true"** - Examples suggest ideas but don't prove universality.
5. **"I didn't cover all cases in my proof by cases"** - Invalid. All cases must be exhaustive.
6. **"I proved the statement, not using the hypothesis"** - Invalid. Hypothesis must be used.
7. **"A surprising result means contradiction"** - No. Contradiction requires logical impossibility (P ∧ ¬P).

---

## STEP 4: Full Study Guide by Topic

### Unit 1: Introduction to Proofs & Logical Foundations

#### 1.1 What is a Proof?

**Plain-language explanation:**
A proof is a careful, step-by-step logical argument that shows why a statement must be true. It's not just evidence or examples—it's a chain of reasoning where each step follows necessarily from previous steps and agreed-upon definitions. A proof is like building a bridge: each plank (step) must rest on solid ground (previous step), and the entire bridge must connect the starting shore (assumptions) to the destination shore (conclusion).

**Formal definition:**
A proof of a statement S is a sequence of logical statements, each of which is either:
- An assumption/hypothesis
- A definition
- A previously established fact
- Derived from previous statements by valid logical rules
...ending with statement S, such that each step follows necessarily from what came before.

**Why it matters:**
Everything in mathematics and logic depends on proofs. They are how we establish truth with certainty. In exams, proofs are often the main question type. Understanding proof structure is the foundation for success. If you can't read and write proofs, you can't do proof-based coursework.

**How it appears in problems:**
- "Write a proof of the following statement"
- "Identify the error in this proof"
- "Which of the following best describes proof by contradiction?"
- "What is missing from this attempted proof?"

**Multiple-choice recognition:**
- A correct proof: starts with assumptions, every step follows logically, reaches conclusion
- An invalid proof: some step doesn't follow, missing steps, uses circular reasoning
- Examples are NOT proofs (they illustrate but don't prove universality)

**Detailed example:**

*Claim:* If x is an even integer, then x² is even.

*Proof:*
Assume x is an even integer. By definition of even, x = 2k for some integer k.
Then x² = (2k)² = 4k² = 2(2k²).
Since 2k² is an integer, x² is even by definition.

This is a proof because: (1) it assumes the hypothesis, (2) uses the definition of even, (3) does valid algebra, (4) restates the conclusion as a consequence.

**Common mistakes:**
- Treating proof and example as the same thing
- Thinking you've proven something by testing a few cases
- Written proof that has gaps (jumps you didn't explain)
- Circular reasoning (assuming what you're trying to prove)

**Memory aid:**
**"Proof = Logic Chain. Each link depends on previous links."**

---

#### 1.2 Theorem, Proposition, Lemma, Corollary

**Plain-language explanation:**
These are all "true statements," but they differ in role. A theorem is a big important fact. A proposition is also a true fact, but maybe less central. A lemma is a helper—it's proved mainly so you can use it to prove something bigger. A corollary is a fact that follows so directly from a theorem that it barely needs its own proof.

Think of it like chapters in a book: the main chapters state theorems; small supporting facts are propositions; lemmas are exercises you do to prepare for a bigger goal; corollaries are "bonus facts" that follow directly.

**Formal distinction:**
- **Theorem**: A significant, proven true statement
- **Proposition**: A true statement, similar to a theorem but often less central
- **Lemma**: ("helper theorem") A proved statement whose main purpose is to be used in proving a theorem
- **Corollary**: A result that follows immediately and almost trivially from a theorem, often needing minimal additional proof

**Why it matters:**
When reading existing mathematics, you need to know which results are foundational, which are helper steps, and which are natural consequences. This helps you understand the logical structure of ideas.

**Multiple-choice recognition:**
- **"A theorem used mainly to prove another theorem"** → Lemma
- **"A fact that follows immediately from a theorem"** → Corollary
- **"Which is a helper result?"** → Lemma

**Example:**
- **Theorem**: "In a right triangle, a² + b² = c²" (Pythagorean theorem)
- **Lemma** (to prove the theorem): "The area of a square is side²" (proved first to help the main theorem)
- **Corollary**: "If a = 3, b = 4, then c = 5" (follows directly from the theorem)

**Common mistakes:**
- Confusing lemma and theorem (swapping their roles)
- Thinking corollary is just a smaller theorem (it's closer to a direct consequence)
- Not recognizing why a fact is called a lemma (not seeing that it's a helper)

**Memory aid:**
- **Lemma = "Lends a hand"** (helps prove something bigger)
- **Corollary = "Comes right after"** (follows almost immediately)

---

#### 1.3 Definition vs. Theorem

**Plain-language explanation:**
A definition is "what a word means." You don't prove a definition; you just agree on it. A theorem is a fact you prove based on definitions. Definitions are tools; theorems are results.

**Key distinction:**
- **Definition**: "Even means 2k for some integer k" (this is just meaning, not proven)
- **Theorem**: "If x is even, then x² is even" (this is proven using the definition)

**Why it matters:**
In proofs, definitions are essential. You use them to transform statements into workable forms. But you never try to "prove" a definition. If someone asks "prove evenness," they mean "prove something about even numbers," not "prove what even means."

**Multiple-choice recognition:**
- A definition is not proved; it is stated/assumed
- A theorem is proved
- Confusing these means misunderstanding the whole proof

---

#### 1.4 Premise vs. Conclusion

**Plain-language explanation:**
The premise is what you're given/assume. The conclusion is what you must prove/show. In most problems, you prove implications P → Q: given P (premise), show Q (conclusion).

**Formal structure:**
- **Premise (Hypothesis)**: The "if" part; what's assumed true
- **Conclusion**: The "then" part; what must be shown

**Why it matters:**
If you misidentify the premise or conclusion, your proof will be wrong. You might even prove the opposite.

**Example:**
*Statement:* "If a number is divisible by 4, then it is even."
- **Premise**: "divisible by 4"
- **Conclusion**: "is even"

---

#### 1.5 Instantiation and Generalization

**Plain-language explanation:**
- **Instantiation**: Moving from a general statement to a specific case. If "all cats are mammals" is true, and Fluffy is a cat, you can instantiate to "Fluffy is a mammal."
- **Generalization**: Moving from a specific case to a general statement. If you can show ANY arbitrary cat is a mammal, you can generalize to "all cats are mammals."

**Formal rules:**

**Universal Instantiation** (∀-instantiation):
From: ∀x ∈ A, P(x) ("for all x in A, P(x) is true")
We conclude: P(c) for any arbitrary c ∈ A

**Universal Generalization** (∀-generalization):
From: P(c) where c is arbitrary
We conclude: ∀x, P(x)

**Existential Instantiation** (∃-instantiation):
From: ∃x, P(x) ("there exists an x with property P")
We conclude: There is some specific object (call it c) with P(c)

**Existential Generalization** (∃-generalization):
From: P(c) for one specific c
We conclude: ∃x, P(x) ("there exists something with property P")

**Why it matters:**
These are the logical rules you use implicitly in proofs. Understanding them lets you write cleaner proofs and recognize when arguments are valid or invalid.

**Examples:**

(∀-instantiation): "All primes greater than 2 are odd. 7 is prime. Therefore 7 is odd."

(∀-generalization): "Let n be an arbitrary even integer. Then n = 2k... [proof]. Therefore, ALL even integers have this property."

(∃-instantiation): "There exists a smallest prime. Let p be that smallest prime. Then..."

(∃-generalization): "Consider n = 6. Then n = 2·3, so n is composite. Therefore there exists a composite number."

---

### Unit 2: Direct Proofs

#### 2.1 What is Direct Proof?

**Plain-language explanation:**
A direct proof is the most straightforward approach: assume the hypothesis is true, and then work forward step-by-step using logic and definitions until you reach the conclusion. It's like following a path from starting point (hypothesis) to destination (conclusion) without detours.

**Formal structure:**
```
Statement: P → Q
Proof:
  Assume P.
  [use logic and definitions to derive intermediate statements]
  Therefore Q.
```

**Why it matters:**
Direct proof is the default method for most implication proofs. If you can solve something directly, it's almost always clearer and simpler than indirect methods.

**How it appears in exams:**
- Proving implications about even/odd numbers
- Proving divisibility relationships
- Proving algebraic inequalities
- Proving set relationships

**Multiple-choice recognition:**
A direct proof:
- Assumes the hypothesis at the start
- Does NOT assume the conclusion is false
- Does NOT reverse or negate the statement
- Uses definitions and algebra moving forward

**Detailed worked example:**

*Claim:* If x is even and y is even, then xy is even.

*Proof:*
Assume x is even and y is even.
By definition, x = 2a for some integer a, and y = 2b for some integer b.
Then xy = (2a)(2b) = 4ab = 2(2ab).
Since 2ab is an integer, xy is 2 times an integer.
Therefore xy is even. ✓

Why this works: We took the definition of even, applied it, did algebra, and showed the result must be even.

**Common mistakes:**
- Starting with the conclusion instead of the hypothesis
- Using examples instead of general proof ("let x = 4, then...")
- Forgetting to explicitly use the definition of the term (e.g., not writing x = 2k for "x is even")
- Making unjustified leaps (skipping logical steps)

**Memory aid:**
**"Direct = Start where the statement starts. End where it ends."**

---

#### 2.2 Proof by Cases

**Plain-language explanation:**
Proof by cases handles situations that naturally split into exhaustive, mutually exclusive categories. Instead of proving one general case, you prove the statement separately for each category, then conclude it holds for all.

**Formal structure:**
```
Statement: P → Q (where P naturally splits into cases)
Proof:
  Assume P. Note that [one of the following must be true: Case 1, Case 2, ...]
  Case 1: [prove Q]
  Case 2: [prove Q]
  ... [all cases]
  Since every case leads to Q, Q must be true. ✓
```

**Why it matters:**
Parity (even/odd), sign (positive/negative/zero), and modular classes all create natural case structures. Proof by cases is the standard technique.

**How it appears:**
- Even/odd problems often split into two cases
- Problems about positive/negative values may need 2-3 cases
- Modular arithmetic: divisibility by n often means checking n cases (remainders 0, 1, ..., n-1)

**Multiple-choice recognition:**
A valid proof by cases:
- Identifies all possible cases
- Proves the conclusion in EVERY case
- Concludes the claim holds overall
- Missing even one case makes the proof invalid

**Detailed example:**

*Claim:* The product of any two consecutive integers is even.

*Proof:*
Let n and n+1 be consecutive integers. We consider whether n is even or odd.

Case 1: n is even.
Then n = 2k for integer k, so n(n+1) = 2k(n+1). This is even.

Case 2: n is odd.
Then n = 2k+1 for integer k, so n+1 = 2k+2 = 2(k+1) is even.
Thus n(n+1) = n · 2(k+1), which is even.

In both cases, n(n+1) is even. ✓

**Common mistakes:**
- Missing a case (e.g., forgetting the case n=0 in a sign analysis)
- Not proving that those are all the cases
- Proving extra cases not needed (no error, but wasted effort)
- Treating examples as case coverage ("n = 3 is odd, n = 5 is odd, so all odds...") ← This is wrong!

**Memory aid:**
**"Cases must be complete and exhaustive. Every possibility covered."**

---

#### 2.3 Set Membership and Set Proofs

**Plain-language explanation:**
Set proofs translate into membership proofs. To prove something about sets, you show that elements have the required properties. Set equality requires proving both inclusions.

**Formal patterns:**

**To prove x ∈ A:**
Show that x satisfies the defining property of A.
```
Goal: Show x ∈ {y : P(y)}
Proof: Show P(x).
```

**To prove A ⊆ B:**
Take an arbitrary element of A and show it's in B (element-chasing).
```
Assume A ⊆ B. We must show: for all x, if x ∈ A then x ∈ B.
Proof:
  Let x ∈ A.
  [show that x must be in B]
  Therefore x ∈ B. ✓
  Since x was arbitrary, A ⊆ B. ✓
```

**To prove A = B:**
Prove both A ⊆ B and B ⊆ A (double inclusion).
```
Proof:
  (1) First show A ⊆ B: [Element chasing: x ∈ A ⇒ x ∈ B]
  (2) Next show B ⊆ A: [Element chasing: x ∈ B ⇒ x ∈ A]
  Therefore A = B. ✓
```

**Why it matters:**
Set proofs are everywhere. Many problems that look complicated are really just "show x has property P" in disguise.

**Multiple-choice recognition:**
- Membership: prove the property holds
- Subset: do element-chasing
- Equality: both inclusions needed (this is crucial!)

**Detailed example:**

*Claim:* {x : x is even and divisible by 3} = {x : x is divisible by 6}

*Proof:*
Let A = {x : x is even and divisible by 3} and B = {x : x divisible by 6}.

(1) Show A ⊆ B: Let x ∈ A. Then x is even and divisible by 3.
So x = 2a and x = 3b for integers a, b.
Since x is divisible by both 2 and 3 (which are coprime), x is divisible by 6.
Therefore x ∈ B. So A ⊆ B. ✓

(2) Show B ⊆ A: Let x ∈ B. Then x = 6k for integer k.
x = 6k = 2(3k), so x is even.
x = 6k = 3(2k), so x is divisible by 3.
Therefore x ∈ A. So B ⊆ A. ✓

Since A ⊆ B and B ⊆ A, we have A = B. ✓

**Common mistakes:**
- Only proving one inclusion for equality (invalid!)
- Trying to prove membership by giving an example
- Not using definitions (e.g., not writing out what "divisible by 3" means algebraically)

**Memory aid:**
**"Set equality = Double inclusion. Always prove both A ⊆ B AND B ⊆ A."**

---

#### 2.4 Existence Proofs and Counterexamples

**Plain-language explanation:**
- **Existence proof**: To prove "there exists an object with property P," you just need to produce ONE specific object and verify it works.
- **Counterexample**: To disprove "for all objects, property P holds," you just need ONE object that doesn't have property P.

These are easy to misuse: one example CANNOT prove a universal claim, but it CAN disprove one.

**Recognition rules:**

| Claim | Proof Method |
|-------|-------------|
| "There exists an x with P(x)" | Find ONE x and verify |
| "For all x, P(x)" | Cannot use one example; need general proof |
| "For all x, P(x) is FALSE" | One counterexample suffices |

**Why it matters:**
This is one of the most common mistakes: students try to prove "for all" with examples. The rules here are crucial.

**Detailed examples:**

**Existence proof:**
*Claim:* There exists a prime number between 20 and 30.

*Proof:* 23 is prime (verify: not divisible by 2, 3, 5...). Therefore a prime exists in this range. ✓

**Counterexample:**
*Claim (false):* All numbers of the form 2^n - 1 are prime.

*Disproof:* 2⁶ - 1 = 64 - 1 = 63 = 9 × 7, which is not prime. ✓

**Common mistakes:**
- Using one example to "prove" a universal statement
- Thinking multiple examples (even 5-10) prove "for all"
- Not verifying the example actually works

**Memory aid:**
**"ONE example = EXISTENCE PROOF. For universality, you need ALL."**

---

### Unit 3: Indirect Proofs

#### 3.1 Proof by Contrapositive

**Plain-language explanation:**
Instead of proving P → Q directly, you prove its logical equivalent: ¬Q → ¬P. This is useful when the conclusion Q (or its negation ¬Q) is easier to work with than the hypothesis P.

**Formal basis:**
The contrapositive of P → Q is ¬Q → ¬P, and they are logically equivalent:
- P → Q means "if P is true, Q must be true"
- ¬Q → ¬P means "if Q is false, P must be false"
These say the same thing.

**Why it matters:**
Sometimes directly proving P → Q is awkward, but proving ¬Q → ¬P is clean. Negations are often easier to work with algebraically.

**When to use contrapositive:**
- The conclusion Q contains "is not," "is not divisible," "is not even," etc.
- The negation ¬Q transforms into something algebraically nice
- Direct proof feels stuck; try flipping

**Formal structure:**
```
Statement: P → Q
Proof (by contrapositive):
  We prove the contrapositive: ¬Q → ¬P.
  Assume ¬Q.
  [work until you reach ¬P]
  Therefore ¬P.
  Since ¬Q → ¬P, the original P → Q follows. ✓
```

**Detailed example:**

*Claim:* If n² is even, then n is even.

*Proof (by contrapositive):*
We prove the contrapositive: If n is odd, then n² is odd.

Assume n is odd. Then n = 2k+1 for integer k.
Then n² = (2k+1)² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, which is odd.

Therefore if n is odd, n² is odd.
By contrapositive, if n² is even, n is even. ✓

**Why contrapositive works here:** Starting from "n is odd" and deriving "n² is odd" is more straightforward than starting from "n² is even" and deriving "n is even."

**Common mistakes:**
- Proving the *converse* Q → P instead of the contrapositive (wrong!)
- Forgetting to state you're using contrapositive
- Not actually using the contrapositive (proving something else)

**Memory aid:**
**"Contra = flip and negate both parts."**
- Original: P → Q
- Contrapositive: ¬Q → ¬P

---

#### 3.2 Proof by Contradiction

**Plain-language explanation:**
Assume the opposite of what you want to prove, and show that it leads to an impossibility (a logical contradiction). If the opposite is impossible, the original claim must be true.

**Formal structure:**
```
Goal: Prove P
Proof (by contradiction):
  Assume ¬P (the opposite).
  [work until you derive both C and ¬C for some statement C]
  This is a contradiction.
  Therefore P must be true. ✓
```

**Why it matters:**
Contradiction is powerful for:
- Impossibility claims ("no such object exists")
- Uniqueness proofs ("only one object works")
- Irrationality proofs (√2 is irrational)

**When to use contradiction:**
- "Prove there is no..."
- "Prove something is impossible"
- "Prove there is exactly one..."
- Direct proof feels wrong; contrapositive doesn't fit

**Detailed example:**

*Claim:* √2 is irrational.

*Proof (by contradiction):*
Assume √2 is rational. Then √2 = p/q for integers p, q with no common factors.

Squaring: 2 = p²/q², so p² = 2q².
This means p² is even, therefore p is even (from earlier result).
Write p = 2k. Then 2q² = (2k)² = 4k², so q² = 2k².
This means q² is even, therefore q is even.

But if both p and q are even, they share a common factor (2), contradicting our assumption that p/q is in lowest terms.

This contradiction shows √2 cannot be rational. Therefore √2 is irrational. ✓

**Common mistakes:**
- Ending with a "surprising result" instead of an actual contradiction
- A contradiction must be P ∧ ¬P (statement and its negation both true simultaneously)
- Forgetting to state "assume the opposite" clearly
- Getting confused between "contradiction" and "unexpected"

**Memory aid:**
**"Contradiction must be true logical clash: P and not-P both true."**

---

#### 3.3 Biconditional Proofs (If and Only If)

**Plain-language explanation:**
A biconditional statement "P if and only if Q" (written P ↔ Q) means both directions must be true:
- P implies Q (the "if Q then... unless P" part)
- Q implies P (the "only if P" part)

To prove it, you prove both directions separately.

**Formal structure:**
```
Goal: Prove P ↔ Q
Proof:
  First, we show P → Q:
    Assume P.
    [work]
    Therefore Q. ✓

  Next, we show Q → P:
    Assume Q.
    [work]
    Therefore P. ✓

  Since P → Q and Q → P, we have P ↔ Q. ✓
```

**Why it matters:**
Biconditional statements often characterize when something is true. "X is even if and only if X = 2k for integer k" is a characterization.

**Detailed example:**

*Claim:* An integer n is even if and only if n² is even.

*Proof:*
(⇒) First, we show: if n is even, then n² is even.
  Assume n is even. Then n = 2k.
  So n² = 4k² = 2(2k²), which is even. ✓

(⇐) Next, we show: if n² is even, then n is even.
  We proved earlier by contrapositive: if n² is even, then n is even. ✓

Therefore n is even ↔ n² is even. ✓

**Common mistakes:**
- Proving only one direction (invalid!)
- Proving one direction twice (wasted effort, still incomplete)
- Not clearly marking which direction you're proving

**Memory aid:**
**"IFF = two jobs. Always prove both directions."**

---

### Unit 4: Mathematical Induction

#### 4.1 The Principle and Structure

**Plain-language explanation:**
Mathematical induction is a technique for proving statements that apply to all integers from some starting point onward. The idea: if you can establish a logical chain where each link depends on the previous one, and you verify the first link, then all links must be solid.

**Intuitive picture:**
Imagine dominoes in a line.
- **Base case**: You knock down the first domino.
- **Inductive step**: Each domino is set up so that knocking it down knocks down the next.
- **Conclusion**: All dominoes fall.

**Formal structure:**

```
Proposition: P(n) is true for all n ≥ n₀

Proof by induction:

Base case: Show P(n₀) is true.

Inductive hypothesis: Assume P(k) is true for some arbitrary k ≥ n₀.

Inductive step: Using the assumption P(k), prove P(k+1).

Conclusion: Therefore, P(n) is true for all n ≥ n₀. ✓
```

**Why it matters:**
- Induction is THE tool for proving statements over integers
- It appears in many contexts: sums, inequalities, recursive formulas, divisibility patterns
- Understanding induction deeply is critical for exam success

**When to use induction:**
- "Prove for all integers n ≥ ..."
- "Prove ∑ᵢ₌₁ⁿ f(i) = F(n)"
- "Prove inequality holds for all n"
- "Prove recursive formula"

**Detailed example:**

*Claim:* ∑ᵢ₌₁ⁿ i = n(n+1)/2 for all positive integers n.

*Proof by induction:*

**Base case (n = 1):**
LHS = ∑ᵢ₌₁¹ i = 1
RHS = 1(1+1)/2 = 1
LHS = RHS ✓

**Inductive hypothesis:**
Assume ∑ᵢ₌₁ᵏ i = k(k+1)/2 for some positive integer k.

**Inductive step:**
We must show ∑ᵢ₌₁ᵏ⁺¹ i = (k+1)(k+2)/2.

∑ᵢ₌₁ᵏ⁺¹ i = (∑ᵢ₌₁ᵏ i) + (k+1)
           = k(k+1)/2 + (k+1)          [by IH]
           = [k(k+1) + 2(k+1)]/2
           = (k+1)(k+2)/2 ✓

**Conclusion:**
By induction, ∑ᵢ₌₁ⁿ i = n(n+1)/2 for all positive integers n. ✓

**Common mistakes:**
- Not stating P(n) explicitly
- Confusing "assume P(k)" with "assume P(k+1)" (classic error!)
- Not using the inductive hypothesis (IH) in the inductive step
- Sloppy algebra in the step
- Using P(k+1) before proving it (circular!)
- Wrong base case (forgetting to check where the statement actually starts)

**Memory aid:**
**"Base, Hypothesis, Step. Base gets the chain started. IH is the assumption. Step proves the next link."**

---

#### 4.2 Non-Trivial Base Cases

**Plain-language explanation:**
Not all statements start being true at n = 1. Some are only true for n ≥ 2, or n ≥ 5, or some other value. You must start induction at the correct base case.

**Why it matters:**
Using the wrong base case invalidates the entire proof. If you start at n = 1 but the statement is false there, your induction chain is broken.

**How to find the right base case:**
1. Test small values: is it true for n = 1? n = 2? n = 3?
2. Start induction at the first n where the statement is actually true.
3. Clearly state your starting point.

**Example:**

*Claim:* 2ⁿ > n² for all integers n ≥ 5.

*Proof:*
We note that 2¹ = 2 < 1² = 1 (false), 2² = 4 = 2² (equal), 2³ = 8 > 3² = 9 (false), 2⁴ = 16 = 4² (equal), but 2⁵ = 32 > 5² = 25 (true).

So we use base case n = 5.

**Base case (n = 5):** 2⁵ = 32 > 25 = 5². ✓

**Inductive hypothesis:** Assume 2ᵏ > k² for some k ≥ 5.

**Inductive step:** Show 2ᵏ⁺¹ > (k+1)².
[algebra...]

---

#### 4.3 Strong Induction

**Plain-language explanation:**
Strong induction is like regular induction, except instead of assuming just P(k), you can assume P(1) ∧ P(2) ∧ ... ∧ P(k) (all cases up to k). Use this when you need multiple previous cases to prove the next one.

**When to use strong induction:**
- Fibonacci-type recursion (depends on previous two terms)
- Problems mentioning "any earlier value"
- Direct induction feels insufficient

**Formal structure:**
```
Proposition: P(n) for all n ≥ n₀

Prove by strong induction:

Base cases: Show P(n₀), P(n₀+1), ..., P(n₀+m) are all true.

Inductive hypothesis: Assume P(n₀), P(n₀+1), ..., P(k) are all true for some k.

Inductive step: Using all these assumptions, prove P(k+1).

Conclusion: Therefore P(n) is true for all n ≥ n₀. ✓
```

**Detailed example:**

*Claim:* Every integer greater than 1 can be written as a product of primes.

*Proof by strong induction:*

**Base case (n = 2):** 2 is prime, so it's already a product of primes. ✓

**Inductive hypothesis:** Assume every integer from 2 to k can be written as a product of primes.

**Inductive step:** Show k+1 can be written as a product of primes.

Two cases:
- If k+1 is prime, it's a product of primes. ✓
- If k+1 is composite, then k+1 = ab where 2 ≤ a, b ≤ k. By IH, both a and b are products of primes. So k+1 is a product of primes. ✓

**Conclusion:** Every integer > 1 is a product of primes. ✓

**Why strong induction was needed:** To prove k+1, we needed both a and b, which could be any values less than k+1, not just k.

---

### Unit 5: Recursive Functions

#### 5.1 Recursive Definitions

**Plain-language explanation:**
A recursive definition defines later values using earlier values. Instead of a closed-form formula like F(n) = 2n, a recursive definition says "F(n) depends on F(n-1)" or similar.

**Essential parts:**
1. **Base case(s)**: The starting point; must provide enough information to stop recursion
2. **Recursive case**: A rule for getting later values from earlier ones

**Formal structure:**
```
Base case: F(0) = value or F(1) = value
Recursive case: F(n) = [expression involving F(n-1), F(n-2), ...]
```

**Why it matters:**
Recursion appears constantly in computer science and mathematics. Many sequences are defined recursively.

**Detailed example:**

*Fibonacci sequence:*
- Base cases: F₀ = 0, F₁ = 1
- Recursive case: Fₙ = Fₙ₋₁ + Fₙ₋₂ for n > 1

This defines: F₂ = F₁ + F₀ = 1+0 = 1, F₃ = 1+1 = 2, F₄ = 2+1 = 3, F₅ = 3+2 = 5, ...

**Common mistakes:**
- Not giving enough base cases (Fibonacci needs TWO)
- Recursive case not referencing earlier values
- Recursion that never bottoms out (missing base case)

**Memory aid:**
**"Recursion needs a stop (base) and a rule (recursive case)."**

---

#### 5.2 Proving Recursive Properties by Induction

**Plain-language explanation:**
To prove something about a recursively defined function, induction is natural: you use the recursive definition to structure the proof.

**How they fit together:**
- The recursive definition structures your induction
- Base case in definition → base case in induction
- Recursive case in definition → inductive hypothesis in induction

**Detailed example:**

*Claim:* Fₙ < 2ⁿ for all n ≥ 1.

*Proof by induction:*

**Base cases (n = 1, 2):**
- F₁ = 1 < 2 = 2¹ ✓
- F₂ = 1 < 4 = 2² ✓

**Inductive hypothesis:** Assume Fᵢ < 2ⁱ for all i ≤ k.

**Inductive step:** Show Fₖ₊₁ < 2^(k+1).
Fₖ₊₁ = Fₖ + Fₖ₋₁ < 2ᵏ + 2ᵏ⁻¹ [by IH] < 2ᵏ + 2ᵏ = 2·2ᵏ = 2^(k+1) ✓

**Conclusion:** Fₙ < 2ⁿ for all n ≥ 1. ✓

---

## STEP 5: Proof Strategy Guide

### Part A: General Proof Method (For Any Problem)

Follow these steps in order when facing a proof problem:

**Step 1: Read the Statement Carefully**
- What are you being asked to prove?
- Is it an implication (if...then)? Biconditional (iff)? Universal statement? Existential (there exists)?
- What exactly is the hypothesis? What is the conclusion?
- Write down the statement in logical notation if it helps:
  - P → Q? ∀x, P(x)? ∃x, P(x)? P ↔ Q?

**Step 2: Translate to Plain English**
Rewrite the claim in your own words:
- "I must show: _____ implies _____"
- "I need to find an object such that _____"
- "I must prove that _____ and _____"

**Step 3: Write Down Relevant Definitions**
This is crucial. Don't proceed from memory.
- Even: n = 2k for integer k
- Odd: n = 2k+1 for integer k
- Divisible by m: n = mk for integer k
- A ⊆ B: for all x, if x ∈ A then x ∈ B
- A = B: A ⊆ B and B ⊆ A

**Step 4: Identify the Proof Type**
Ask yourself:
- Is it "for all integers n ≥ n₀"? → **Induction**
- Is it an implication P → Q?
  - Is it straightforward? → **Direct proof**
  - Is ¬Q easier to work with? → **Contrapositive**
  - Does it involve impossibility/uniqueness? → **Contradiction**
- Is it "P iff Q"? → **Two proofs** (P→Q, then Q→P)
- Is it about sets? → **Element chasing** (subset/membership)
- Does it say "there exists"? → **Witness/example**
- Does it ask you to disprove something? → **Counterexample**
- Are there natural categories? → **Cases**

**Step 5: Choose Your Structure**
Before you write anything formal, write your "skeleton":
- What will your first sentence be?
- What's your target conclusion?
- Roughly what steps will you take?

Example skeleton:
"I'll assume [hypothesis]. Then I'll use the definition of [term] to get [intermediate]. From there, I can [key step]. This gives [conclusion]."

**Step 6: Write the Proof Cleanly**
Follow your skeleton. Each line should:
- Follow logically from previous lines
- Move you closer to your target
- Use defined terms correctly

**Step 7: Verify and Polish**
Ask yourself:
- Did I state what I'm proving (P(n) for induction)?
- Did I use all hypotheses?
- Are all steps justified?
- Is the conclusion clearly restated?

---

### Part B: Specific Proof Methods (Detailed Templates)

#### Method 1: Direct Proof

**The idea:** Assume the hypothesis is true. Use logic and definitions to derive the conclusion.

**Template:**

```
Theorem: P → Q

Proof:
Assume P.
[Define terms if needed]
[Derive intermediate statements using logic and valid steps]
[Step by step, get closer to Q]
Therefore Q.
```

**Example:**

**Theorem:** If x and y are both even, then x + y is even.

**Proof:**
Assume x and y are both even.
Then x = 2a for some integer a, and y = 2b for some integer b.
Adding: x + y = 2a + 2b = 2(a + b).
Since a+b is an integer, x+y is even by definition.
Therefore, if x and y are even, then x+y is even. ✓

---

#### Method 2: Proof by Contrapositive

**The idea:** Instead of proving P → Q, prove ¬Q → ¬P (which is logically equivalent).

**When to use:**
- The conclusion Q contains "not," "not divisible," "not even," etc.
- Negating Q gives something algebraically nicer
- Direct proof isn't working

**Template:**

```
Theorem: P → Q

Proof (by contrapositive):
We prove the contrapositive: ¬Q → ¬P.
Assume ¬Q.
[work until you reach ¬P]
Therefore ¬P.
Since ¬Q → ¬P, we conclude P → Q. ✓
```

**Example:**

**Theorem:** If n is even, then 3n+1 is odd.

**Proof (by contrapositive):**
We prove: if 3n+1 is even, then n is odd.

Assume 3n+1 is even.
Then 3n+1 = 2k for some integer k.
So 3n = 2k - 1, which is odd.
If 3n is odd and 3 is odd, then n must be odd (since odd × anything = odd iff anything is odd).
Therefore n is odd.

By contrapositive, if n is even, then 3n+1 is odd. ✓

---

#### Method 3: Proof by Contradiction

**The idea:** Assume your claim is false. Derive a logical impossibility. Conclude your claim must be true.

**When to use:**
- "Prove nothing with property P exists"
- "Prove only one object has property P"
- "Prove something is impossible"

**Template:**

```
Theorem: P

Proof (by contradiction):
Assume for contradiction that ¬P.
[work using this assumption]
[derive statements C and ¬C simultaneously]
This is a contradiction.
Therefore P must be true. ✓
```

**Example:**

**Theorem:** √3 is irrational.

**Proof (by contradiction):**
Assume √3 is rational.
Then √3 = p/q for integers p, q with gcd(p,q) = 1.

Squaring: 3 = p²/q², so p² = 3q².
This means 3 divides p².
Since 3 is prime, if 3|p², then 3|p.
Write p = 3m. Then 9m² = 3q², so 3m² = q².
Therefore 3|q.

But then 3|p and 3|q, contradicting that gcd(p,q)=1.
This is a contradiction.
Therefore √3 is irrational. ✓

---

#### Method 4: Proof by Cases

**The idea:** The hypothesis splits into exhaustive, mutually exclusive cases. Prove the conclusion in EACH case. Then conclude it holds overall.

**Template:**

```
Theorem: P → Q (where P implies C₁ ∨ C₂ ∨ ... ∨ Cₙ)

Proof:
Assume P.
Note that [one of the following must hold]:
Case 1: [C₁ holds]. Then [prove Q].
Case 2: [C₂ holds]. Then [prove Q].
...
Case n: [Cₙ holds]. Then [prove Q].

Since every case leads to Q, Q must be true. ✓
```

**Example:**

**Theorem:** For any integer n, the product n(n+1) is even.

**Proof:**
Let n be an integer. Note that n is either even or odd.

Case 1: n is even.
Then n = 2k, so n(n+1) = 2k(n+1) is even. ✓

Case 2: n is odd.
Then n+1 is even, so n+1 = 2k, and n(n+1) = n·2k is even. ✓

In both cases, n(n+1) is even. ✓

---

#### Method 5: Existence Proof

**The idea:** To prove "there exists an object with property P," construct an object and verify it works.

**Template:**

```
Theorem: ∃x, P(x)

Proof:
Consider x = [specific object].
Then [show P(x) holds].
Therefore, such an x exists. ✓
```

**Example:**

**Theorem:** There exists an integer that is both even and prime.

**Proof:**
Consider x = 2.
2 = 2·1, so 2 is even.
2 is divisible only by 1 and 2, so 2 is prime.
Therefore 2 is an integer that is both even and prime. ✓

---

#### Method 6: Uniqueness Proof

**The idea:** Show an object exists (witness), then show it's the only one.

**Template:**

```
Theorem: ∃! x, P(x) ("there exists a unique x with P(x)")

Proof:
[First, show existence]:
Consider x = [specific object]. Then [P(x)].

[Next, show uniqueness]:
Suppose a and b both satisfy P. Then [show a = b].

Therefore exactly one object has property P. ✓
```

**Example:**

**Theorem:** There is a unique integer n such that n + 5 = 8.

**Proof:**
Existence: Let n = 3. Then 3 + 5 = 8. ✓

Uniqueness: Suppose a and b both satisfy a+5=8 and b+5=8.
Then a + 5 = b + 5, so a = b.

Therefore n = 3 is the unique solution. ✓

---

#### Method 7: Mathematical Induction

**The idea:** Prove base case, then prove P(k)→P(k+1), concluding P(n) for all n.

**Template:**

```
Theorem: P(n) for all n ≥ n₀

Proof by induction:
Base case: Show P(n₀). [direct computation]

Inductive hypothesis: Assume P(k) for some k ≥ n₀.

Inductive step: Show P(k+1).
[use P(k) to derive P(k+1)]

Therefore P(n) holds for all n ≥ n₀. ✓
```

**Example:**

**Theorem:** ∑ᵢ₌₁ⁿ (2i-1) = n² for all positive integers n.

**Proof by induction:**

Base case (n=1):
LHS = 2(1)-1 = 1
RHS = 1²= 1 ✓

Inductive hypothesis: Assume ∑ᵢ₌₁ᵏ (2i-1) = k²

Inductive step: Show ∑ᵢ₌₁ᵏ⁺¹ (2i-1) = (k+1)²
∑ᵢ₌₁ᵏ⁺¹ (2i-1) = [∑ᵢ₌₁ᵏ (2i-1)] + (2(k+1)-1)
                = k² + (2k+1)
                = k² + 2k + 1
                = (k+1)² ✓

Therefore ∑ᵢ₌₁ⁿ (2i-1) = n² for all positive integers n. ✓

---

#### Method 8: Biconditional Proof

**The idea:** Prove both directions: P→Q and Q→P.

**Template:**

```
Theorem: P ↔ Q

Proof:
(⇒) [Prove P → Q]:
  Assume P.
  [work]
  Therefore Q. ✓

(⇐) [Prove Q → P]:
  Assume Q.
  [work]
  Therefore P. ✓

Therefore P ↔ Q. ✓
```

**Example:**

**Theorem:** A positive integer n is even if and only if n² is even.

**Proof:**

(⇒) Assume n is even. Then n = 2k.
So n² = 4k² = 2(2k²) is even. ✓

(⇐) Assume n² is even. By the contrapositive proof from earlier, n must be even. ✓

Therefore n is even ↔ n² is even. ✓

---

#### Method 9: Set Equality Proof

**The idea:** To prove A = B, show A ⊆ B and B ⊆ A.

**Template:**

```
Theorem: A = B

Proof:
We show both inclusions.

(⊆) Show A ⊆ B:
  Let x ∈ A. Then [show x has properties to be in B].
  Therefore x ∈ B, so A ⊆ B. ✓

(⊇) Show B ⊆ A:
  Let x ∈ B. Then [show x has properties to be in A].
  Therefore x ∈ A, so B ⊆ A. ✓

Since A ⊆ B and B ⊆ A, we have A = B. ✓
```

**Example:**

**Theorem:** {x : x is divisible by 4} = {x : x ≡ 0 (mod 4)}

**Proof:**

(⊆) Let x be divisible by 4. Then x = 4k, so x ≡ 0 (mod 4). ✓

(⊇) Let x ≡ 0 (mod 4). Then x = 4k for integer k, so x is divisible by 4. ✓

Therefore the sets are equal. ✓

---

#### Method 10: Counterexample (Disproof)

**The idea:** To disprove a universal claim, produce ONE object that doesn't satisfy it.

**Template:**

```
"Theorem" (false): For all x, P(x)

Disproof:
Consider x = [specific counterexample].
Then [show P(x) is false].
Therefore the statement is false. ✗
```

**Example:**

**Statement (false):** All prime numbers are odd.

**Disproof:**
Consider 2.
2 is even (not odd).
2 is prime (divisible only by 1 and 2).
Therefore there exists a prime that is not odd, so the statement is false. ✗

---

## STEP 6: Proof Selection Flowchart

**START: Read the statement. What do you see?**

```
┌─────────────────────────────────┐
│ Is it "for all n ≥ n₀" or      │
│ "prove this for integers"?      │
└────────┬────────────────────────┘
         │ YES
         ▼
    ┌──────────────┐
    │ INDUCTION    │
    └──────────────┘
    If later term depends on
    several earlier terms?
         │ YES
         ▼
    STRONG INDUCTION


┌─────────────────────────────────┐
│ Is it an implication           │
│ "If P then Q"?                 │
└────────┬────────────────────────┘
         │ YES
         ▼
    ┌──────────────────────────────┐
    │ Does it seem straightforward?│
    │ Can you just assume P and   │
    │ work toward Q?              │
    └────┬─────────────┬──────────┘
   YES │             │ NO/AWKWARD
       ▼             ▼
    DIRECT      Try CONTRAPOSITIVE
    PROOF       (Is ¬Q easier?)
                     │ YES
                     ▼
                CONTRAPOSITIVE
                     │ NO
                     ▼
                Try CONTRADICTION


┌─────────────────────────────────┐
│ "If and only if" statement?     │
│ (P ↔ Q)                        │
└────────┬────────────────────────┘
         │ YES
         ▼
    PROVE BOTH DIRECTIONS
    (P → Q) and (Q → P)


┌─────────────────────────────────┐
│ Does it say "there exists"?     │
│ (∃x, P(x))                     │
└────────┬────────────────────────┘
         │ YES
         ▼
    EXISTENCE PROOF
    Find a witness x
         │
         │ Need to show uniqueness?
         │ YES
         ▼
    UNIQUENESS PROOF
    (Show a=b if both work)


┌─────────────────────────────────┐
│ Does it say "no such object     │
│ exists" or "prove impossible"?  │
└────────┬────────────────────────┘
         │ YES
         ▼
    CONTRADICTION
    Assume opposite, reach ⊥


┌─────────────────────────────────┐
│ Is it about SETS?              │
└────────┬────────────────────────┘
         │ YES
         ▼
    ├─ x ∈ A? Prove defining property
    ├─ A ⊆ B? Element-chase
    └─ A = B? Double inclusion


┌─────────────────────────────────┐
│ Natural categories?             │
│ (even/odd, sign, etc.)         │
└────────┬────────────────────────┘
         │ YES
         ▼
    PROOF BY CASES
    Cover all possibilities


┌─────────────────────────────────┐
│ Is the claim false/ask to       │
│ disprove universal statement?   │
└────────┬────────────────────────┘
         │ YES
         ▼
    COUNTEREXAMPLE
    Find one that breaks the claim
```

**IF YOU GET STUCK:**

1. **Rewrite using definitions**: Write everything in algebraic/logical form
2. **Test examples**: Try 2-3 specific cases to spot patterns
3. **Negate the conclusion**: What does ¬Q look like? Consider contrapositive
4. **Ask hidden questions**: Is this secretly a set problem? A parity problem? A divisibility problem?
5. **Change perspective**: Can I prove an equivalent statement instead?
6. **Divide it**: Can I break it into cases?
7. **Try again backward**: Start from the conclusion, work backward, then reverse the logic

---

## STEP 7: Definition Recognition & Multiple Choice Strategy

### Complete Term Reference

| Term | Definition | Key Feature |
|------|-----------|-------------|
| **Theorem** | Important proven true statement | Central, significant result |
| **Proposition** | Proven true statement | Similar to theorem, less central |
| **Lemma** | Helper theorem | Proved to help prove something else |
| **Corollary** | Consequence of a theorem | Follows almost immediately |
| **Definition** | Exact meaning of a term | Not proved, just established |
| **Axiom/Postulate** | Assumed true without proof | Starting assumption |
| **Conjecture** | Suspected true, not proven | Open question |
| **Premise/Hypothesis** | What's assumed | "If" part of implication |
| **Conclusion** | What must be shown | "Then" part of implication |
| **Proof** | Logical argument for truth | Chain of justified steps |

**Quantifiers:**

| Phrase | Symbol | Meaning |
|--------|--------|---------|
| "For all" | ∀ | Universal quantifier |
| "There exists" | ∃ | Existential quantifier |
| "There exists unique" | ∃! | Exactly one |

**Instantiation & Generalization:**

| Operation | Meaning | Example |
|-----------|---------|---------|
| **Universal Instantiation** | From ∀, go to one case | "All cats are mammals, so Fluffy is a mammal" |
| **Universal Generalization** | From arbitrary case, go to ∀ | "n is arbitrary even integer... so ALL evens have this property" |
| **Existential Instantiation** | From ∃, pick a witness | "There exists a person, call them Alice..." |
| **Existential Generalization** | From one case, go to ∃ | "5 is divisible by 5, so there exists a number divisible by 5" |

### Common Look-Alike Pairs (Distinguish These!)

**Contrapositive vs. Converse**
- **Contrapositive of P→Q**: ¬Q→¬P (logically equivalent!)
- **Converse of P→Q**: Q→P (NOT equivalent in general)
Example: "If it rains, the ground is wet."
- Contrapositive: "If the ground is not wet, it didn't rain." (equivalent to original) ✓
- Converse: "If the ground is wet, it rained." (could be false; maybe the sprinkler ran) ✗

**Direct Proof vs. Contrapositive vs. Contradiction**
- **Direct**: Start by assuming P, work toward Q
- **Contrapositive**: Assume ¬Q, work toward ¬P
- **Contradiction**: Assume ¬P, derive a contradiction (P and ¬P both true)

All indirect, but use different negations.

**Example vs. Counterexample**
- **Example**: Illustrates a concept; one example proves "there exists"
- **Counterexample**: Disproves a universal claim; one counterexample proves "for all" is false

**Lemma vs. Corollary**
- **Lemma**: Helper; usually proved BEFORE the main result
- **Corollary**: Consequence; usually stated AFTER the main result

**Existence vs. Universality**
- **"There exists x with P(x)"**: Need one witness
- **"For all x, P(x)"**: Need all cases
- **Rule**: One example cannot prove "for all"

### Multiple Choice Elimination Strategies

**Red Flags:**

1. **"This example proves the for-all statement." → ELIMINATE**
   - Examples never prove universality

2. **"The contrapositive of P→Q is Q→P." → ELIMINATE**
   - That's the converse, not contrapositive

3. **"To prove A=B, show A⊆B." → ELIMINATE**
   - Must show both A⊆B and B⊆A

4. **"To prove P↔Q, show P→Q." → ELIMINATE**
   - Need both directions

5. **"Induction proof with no base case or IH." → ELIMINATE**
   - Missing parts make it invalid

6. **"This surprising result means we have a contradiction." → ELIMINATE**
   - Contradiction requires P ∧ ¬P (logical impossibility)

7. **"One case in the proof by cases..." (missing others) → ELIMINATE**
   - All cases must be covered

**Positive Strategies:**

- If statement says "for all n ≥ ...", induction is likely → Look for that answer
- If statement has "iff," look for "prove both directions" → Good answer
- If statement is "there exists," look for "find a witness" → Good answer
- If statement negates something, contradiction is natural → Look for that
- If a term appears in the question, its definition is probably key → Look for answer using definition clearly

---

## STEP 8: Active Recall Practice Questions

### Questions by Topic

#### Topic 1: Definitions & Terminology

1. Define each of: theorem, proposition, lemma, corollary. How do they differ in role?
2. What is the difference between a proof and an example?
3. Explain universal instantiation with an example.
4. What does it mean to assume something in a proof?
5. What is a definition, and why don't we "prove" definitions?

#### Topic 2: Direct Proofs

6. State the general structure of a direct proof.
7. Prove: If x is odd, then x² is odd.
8. Prove: If A ⊆ B and B ⊆ C, then A ⊆ C.
9. When should you use proof by cases? Give an example context.
10. Why can one example alone never prove a universal statement?
11. Prove: The sum of two even integers is even.
12. Prove: If n is an integer, then n(n+1) is even.

#### Topic 3: Contrapositive & Contradiction

13. State the contrapositive of: "If x² is even, then x is even."
14. What is the difference between contrapositive and converse?
15. When is proof by contrapositive useful?
16. Prove by contrapositive: If 3k is odd, then k is odd.
17. When is proof by contradiction appropriate?
18. Prove by contradiction: √2 is irrational.
19. What must true contradictory look like (not just surprising)?
20. Disprove: All prime numbers are odd. (Give a counterexample.)

#### Topic 4: Biconditional & Set Proofs

21. How many directions must you prove for a biconditional?
22. Set up (don't fully prove): Prove A ↔ B where A and B are sets.
23. To prove A = B for sets, what must you show?
24. Prove: An integer n is even ↔ n² is even.
25. What is the formal definition of A ⊆ B?

#### Topic 5: Induction

26. State the three parts of a mathematical induction proof.
27. Explain why the inductive step is NOT just "checking the next example."
28. What could go wrong if you use the wrong base case?
29. Prove by induction: 1 + 2 + ... + n = n(n+1)/2.
30. Prove by induction: 2ⁿ > n for all n ≥ 1.
31. When would you use strong induction instead of weak?
32. Prove by strong induction: Every integer > 1 is a product of primes.

#### Topic 6: Recursion

33. Define a recursive function. What must it include?
34. State the Fibonacci sequence definition.
35. Why must Fibonacci have two base cases?
36. Prove by induction: Fₙ ≤ 2ⁿ for all n ≥ 0.

### Short Answer Concept Questions

37. Why are definitions so important in proofs?
38. What does it mean to "use the hypothesis" in a proof?
39. Can you prove a statement with just examples? Explain.
40. What is the relationship between induction and recursion?
41. Why might one proof method be easier than another for the same statement?
42. Explain the difference between "there exists" and "for all" claims.
43. What are the two main indirect proof methods, and when do you use each?

### MCQ-Style Practice Questions

**44.** Which proof type is most natural for "prove P iff Q"?
- (A) Direct proof
- (B) Proof by cases
- (C) Two separate proofs
- (D) Mathematical induction

**45.** What is the contrapositive of "If not a, then not b"?
- (A) If not b, then not a
- (B) If a, then b
- (C) If b, then a
- (D) If a, then not b

**46.** Which statement can be proved by giving a single example?
- (A) For all integers, the sum is even
- (B) There exists an integer greater than 100
- (C) No integer is both even and odd
- (D) All primes are odd

**47.** To prove two sets A and B are equal, you must prove:
- (A) A ⊆ B
- (B) B ⊆ A
- (C) Both A ⊆ B and B ⊆ A
- (D) A ∩ B ≠ ∅

**48.** In mathematical induction, the inductive hypothesis assumes:
- (A) P(n) for all n
- (B) P(k+1) for some k
- (C) P(k) for some arbitrary k ≥ n₀
- (D) P(n₀) is false

**49.** Which statement best describes why contrapositive is equivalent to the original?
- (A) They have the same form
- (B) If P→Q is true, then ¬Q→¬P must be true
- (C) They use the converse
- (D) They're both indirect

**50.** In a proof by contradiction, you must:
- (A) Assume the conclusion is false
- (B) Derive a logical impossibility
- (C) Both assume opposite and derive contradiction
- (D) Show the statement is surprising

### Explain Why This Is Wrong

**51.** "I proved that all odd integers have property X because I checked 3, 5, 7, 9, and they all have it."
→ Why is this wrong?

**52.** "To prove P→Q, I proved Q→P."
→ Why is this wrong?

**53.** "To prove A = B (sets), I showed A ⊆ B."
→ Why is this wrong?

**54.** "In my induction proof, I assumed P(k+1) and proved P(k) from it."
→ Why is this wrong?

**55.** "My 'proof by cases' covered Case 1 and Case 2. Since both led to the conclusion, I proved it."
→ What could be wrong?

### Application & Depth Questions

**56.** You're asked to prove: "If x is divisible by 6, then x is divisible by 2."
What's the fastest method? What definitions will you use?

**57.** You're asked to prove: "If n² is divisible by 3, then n is divisible by 3."
Why is contrapositive better than direct proof here?

**58.** You're asked to prove: "There is no greatest prime."
Would you use direct proof, induction, or contradiction? Why?

**59.** You're faced with a recursive definition for a sequence.
What proof method would you use to prove something about it? Why?

---

## STEP 9: Prioritization and Study Plan

### Topic Prioritization by Tier

#### TIER 1: Must Know Cold 🔴

These are foundational. Master them completely before moving on.

**1. Direct Proof Structure**
- Why: It's the default method for most proofs
- Frequency: Appears in nearly every proof problem
- Prerequisite for: Every other method

**2. Contrapositive vs. Converse Distinction**
- Why: Students constantly confuse these; it's a major trap
- Frequency: Likely exam question
- Impact: Misunderstanding ruins related proofs

**3. Mathematical Induction (weak form)**
- Why: THE tool for "for all n ≥ ..." statements
- Frequency: Multiple exam questions likely
- Difficulty: Takes practice to internalize

**4. Mathematical Induction (strong form)**
- Why: Needed for recursive formulas like Fibonacci
- Frequency: Likely exam question
- Difficulty: More subtle than weak induction

**5. Proof by Contradiction**
- Why: The natural method for "impossible" and "unique" claims
- Frequency: Common in exams
- Prerequisite for: Uniqueness proofs

**6. Set Proof Structure (A ⊆ B, A = B)**
- Why: Set problems appear frequently
- Difficulty: Easy to do wrong (forgetting one inclusion)
- Impact: High confidence gain from mastery

**7. Biconditional Proofs (Iff)**
- Why: Common problem type
- Common mistake: Only one direction
- Impact: Easy points if mastered

**8. Core Definitions: Theorem, Lemma, Corollary, Definition**
- Why: Needed to read and write proofs correctly
- Frequency: Likely definitional exam questions
- Impact: Foundational understanding

**9. Universal vs. Existential Statements**
- Why: Misplacing one invalidates entire arguments
- Common mistake: Confusing quantifiers
- Impact: Critical for proof validation

**10. Example vs. Proof vs. Counterexample**
- Why: #1 student mistake (using example to prove "for all")
- Impact: Simple misunderstanding, easy to fix, high value

---

#### TIER 2: Very High Priority 🟡

Important and likely to appear. Study after Tier 1 is solid.

**1. Proof by Cases**
- When it's needed (parity, sign, modular classes)
- How to ensure complete case coverage
- Difficulty: Straightforward but easy to forget a case

**2. Strong Induction in Depth**
- Knowing when weak induction isn't enough
- Setting up multiple base cases correctly (Fibonacci)
- Why strong induction works

**3. Recursive Functions & Sequences**
- Defining recursively vs. explicitly
- Fibonacci in depth
- Seeing the link between recursion and induction

**4. Non-Trivial Base Cases**
- Finding the correct starting point for induction
- What happens if you start too early

**5. Definition-Based Proofs**
- Using definitions strategically (even = 2k, divisible = mk, etc.)
- Transforming statements using definitions

**6. Existence Proofs with Witnesses**
- Constructing a concrete example
- Difference from "there exists" claims that need logical proof

**7. Proof Selection (Flowchart Thinking)**
- Quickly identifying which method to use
- Making strategic choices between methods
- Getting unstuck when one method doesn't work

**8. Multiple-Choice Recognition**
- Spotting answer choices with common errors
- Elimination strategies
- Distinguishing similar-sounding proofs

---

#### TIER 3: Important but Specialized 🟢

Study after Tier 1-2 are solid. These have narrower application.

**1. Uniqueness Proofs**
- Show existence, then a = b argument
- Not as frequent as other proofs

**2. Equivalence Proofs ("The following are equivalent")**
- Chaining equivalences (A ↔ B, B ↔ C, so A ↔ C)
- Less common than individual biconditionals

**3. Divisibility Proofs**
- Specific technique for divisibility claims
- Often just direct proof with divisibility definition

**4. Special Proof Techniques**
- Any proof types emphasized in YOUR materials but not in standard list
- Problem-specific methods

---

### Your Study Plan

**If you have 1-2 weeks:**
- Focus on Tier 1 only
- Do practice problems heavily
- Review cheat sheet nightly
- Night-before session: memorize templates and Tier 1 definitions

**If you have 3-4 weeks:**
- Weeks 1-2: Tier 1 (direct, induction, contrapositive, contradiction, sets)
- Week 3: Tier 2 (cases, strong induction, recursive proofs, existence)
- Week 4: Solidify with practice, review all, do full practice problems

**If you have 5+ weeks:**
- Weeks 1-2: Tier 1 foundations
- Weeks 2-3: Tier 2 topics
- Weeks 3-4: Tier 3 + problem-specific techniques
- Week 5+: Intensive practice, timed problems, corrections

### What to Study First if Time is Limited

1. **Direct proof** - 20% of exam value
2. **Contrapositive** - 10% of exam value
3. **Mathematical induction** - 25% of exam value
4. **Contradiction** - 10% of exam value
5. **Sets and biconditionals** - 20% of exam value

Master these five and you've covered ~85% of typical exam material.

---

## STEP 10: Final Exam Resources

### 1️⃣ Night Before the Exam: Ultra-Condensed Essentials

**Proof Templates (Keep these in your head)**

```
DIRECT PROOF:
Assume P.
[work]
Therefore Q. ✓

CONTRAPOSITIVE:
We prove: ¬Q → ¬P.
Assume ¬Q.
[work]
Therefore ¬P.
By contrapositive, P → Q. ✓

CONTRADICTION:
Assume ¬P.
[work]
Derive P ∧ ¬P.
Contradiction.
Therefore P. ✓

INDUCTION:
Base case: P(n₀). ✓
IH: Assume P(k).
Step: Prove P(k+1). ✓
Therefore P(n) for all n ≥ n₀. ✓

BICONDITIONAL:
(→) Assume P. [work] Therefore Q. ✓
(←) Assume Q. [work] Therefore P. ✓
Therefore P ↔ Q. ✓

SET EQUALITY:
Let x ∈ A. [show x ∈ B]. So A ⊆ B. ✓
Let x ∈ B. [show x ∈ A]. So B ⊆ A. ✓
Therefore A = B. ✓

CASES:
Case 1: [prove Q]. ✓
Case 2: [prove Q]. ✓
All cases covered, so Q. ✓
```

**Critical Definitions**

- Even: n = 2k
- Odd: n = 2k+1
- Divisible: a|b means b = ak
- A ⊆ B: ∀x, x ∈ A → x ∈ B
- A = B: A ⊆ B ∧ B ⊆ A
- Contrapositive of P→Q: ¬Q→¬P (equivalent!)
- Converse of P→Q: Q→P (NOT equivalent)

**Top 3 Mistakes to Avoid**

1. **Using one example to prove "for all"**
   - Remember: Examples prove existence only
   - One counterexample disproves "for all"

2. **Confusing contrapositive with converse**
   - Contrapositive: ¬Q→¬P (equivalent to original!)
   - Converse: Q→P (not equivalent)

3. **Only proving one direction of biconditional**
   - P ↔ Q requires both P→Q and Q→P
   - Missing one direction = incomplete proof

**Proof Quality Checklist**

Before submitting your proof, ask:
- ☑ Did I state what I'm proving (for induction, state P(n))?
- ☑ Did I use the hypothesis/assumption?
- ☑ Does each step follow logically from the previous one?
- ☑ Did I use definitions where needed (even/odd/divisible)?
- ☑ Is the conclusion clearly stated?
- ☑ For induction: base case, IH, step all present?
- ☑ For biconditional: both directions done?
- ☑ For sets: both inclusions done?
- ☑ For cases: all cases covered?

---

### 2️⃣ How to Approach Proof Questions Under Time Pressure

**When you see a proof problem (5-minute strategy):**

**Step 1 (30 seconds):**
- Read the statement carefully
- Identify: Is it P→Q, iff, exists, universal, set, induction?
- Circle the key terms

**Step 2 (1 minute):**
- Write down definitions for key terms
- Write your statement in logical notation
- Quickly decide on proof method

**Step 3 (2 minutes):**
- Write your proof skeleton:
  - First sentence
  - Key steps (2-3 lines)
  - Final conclusion
- Don't write full proof yet; outline first

**Step 4 (2 minutes):**
- Fill in your skeleton with full write-out
- Check logic as you go
- Use your templates

**If you get stuck:**

1. **In first 2 minutes:** Switch proof method immediately (try contrapositive, cases, contradiction)
2. **At 5 minutes in:** Write a partial proof with what you know; then note the step you're stuck on
3. **At 8+ minutes:** You can get partial credit; move on to other problems

**Partial Credit Strategy:**

If you can't complete the proof:
- Write what you CAN do (base case, first direction, etc.)
- Write "Here I would need to [fill in what's missing]"
- Examiners give partial credit generously for correct approach

---

### 3️⃣ How to Approach Multiple Choice Definition Questions

**When you see a definition/recognition MCQ (30-60 seconds):**

**Step 1: Read the question**
- Are they giving a definition and asking for the term?
- Giving a term and asking for definition?
- Giving a description and asking for which concept?

**Step 2: Try to answer before looking at choices**
- Have an answer in mind first
- Prevents being swayed by distractors

**Step 3: Use elimination**

**Red flag phrases to eliminate immediately:**
- "One example proves for all" ✗
- "Contrapositive is the converse" ✗
- "Only one direction suffices for iff" ✗
- "No base case needed" ✗
- "Surprising result is contradiction" ✗

**Step 4: Match your answer**
- Find your mental answer in the choices
- If multiple match, pick the most precise/complete one

**If you're genuinely unsure:**

1. Eliminate obviously wrong answers
2. Pick the one that uses precise language (most textbook-y sounding)
3. Avoid cute/clever-sounding answers (usually wrong)
4. When in doubt, the answer using the exact definition is likely correct

**Quick Identifier Table:**

| Question | Answer |
|----------|--------|
| "What do you call helper theorem?" | Lemma |
| "What follows immediately from theorem?" | Corollary |
| "From ∀x, conclude P(c)?" | Universal Instantiation |
| "From specific case, conclude ∀?" | Universal Generalization |
| "What's logically equivalent to P→Q?" | ¬Q→¬P (contrapositive) |
| "To prove A=B?" | Show A⊆B and B⊆A |
| "To prove iff?" | Prove both directions |
| "To prove there exists?" | Find a witness |

---

## 🎯 Complete Study Checklist

**Week 1:**
- [ ] Read Unit 1 carefully; memorize core definitions
- [ ] Read Unit 2 (direct proofs); do 5 direct proof practice problems
- [ ] Read Unit 3A (contrapositive); understand contrapositive ≠ converse
- [ ] Do 3 contrapositive problems

**Week 2:**
- [ ] Read Unit 3B (contradiction); do 3 contradiction problems
- [ ] Read Unit 3C (biconditional); do 3 biconditional problems
- [ ] Read Unit 3D (sets); do 5 set proof problems

**Week 3:**
- [ ] Read Unit 4 (induction); carefully study base case, IH, step
- [ ] Do 5 induction problems (varying difficulty)
- [ ] Read Unit 4B (strong induction); do 2 problems

**Week 4:**
- [ ] Read Unit 4C (non-trivial base cases)
- [ ] Read Unit 5 (recursion); do 2 recursive/induction problems
- [ ] Review cheat sheet; do 10 mixed practice problems
- [ ] Do 1 complete timed practice exam

**Before Exam:**
- [ ] Review night-before summary
- [ ] Do 5 random proof problems under time pressure
- [ ] Read through common mistakes section
- [ ] Review MCQ elimination strategies

---

**End of Study Guide**

You now have a complete, structured guide. Master Tier 1 first, then move systematically through Tier 2 and 3. Use this guide not just to read, but to practice actively. Every concept should be tested with problems. You've got this! 💪