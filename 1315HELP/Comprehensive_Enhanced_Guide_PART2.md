# COMPREHENSIVE ENHANCED STUDY GUIDE FOR PROOFS
## PART 2: DETAILED STUDY GUIDE BY TOPIC

---

## UNIT 1: FOUNDATIONS OF PROOFS

### Topic 1.1: What is a Proof?

#### Plain-Language Explanation

A proof is a **careful logical argument** that shows why something MUST be true. It's not the same as an example, an intuition, or evidence that something "seems" true. A proof is a step-by-step chain of reasoning where each step follows logically from previous steps and known facts.

Think of it like instructions for a recipe: an example is "I made a cake and it was good." A proof is the full recipe with every ingredient listed and every step explained so anyone following it produces the same result.

#### Formal Definition

A **proof** of a statement P is a finite sequence of logical statements in which:
1. Each statement is either a definition, given assumption, previously proven result, or logical consequence of earlier statements
2. The final statement is P itself
3. The transition from each statement to the next is justified by logical rules or established facts

#### Why It Matters

Understanding what counts as a proof is FUNDAMENTAL. Everything else in this unit depends on it. If you don't understand what "proof" means, you can't write one, can't evaluate one, and can't spot when a "proof" is actually just an example or hand-waving.

#### How It Appears in Problems

- "Prove that [statement]"
- "Justify your answer" (asking for reasoning, essentially a mini-proof)
- "Is this a valid proof? Why or why not?"
- "Which step of this proof is incorrect?"

#### Multiple-Choice Recognition

Wrong answers might claim:
- "A proof is giving one example that works" → NO
- "A proof is showing the statement is likely true" → NO
- "A proof is a definition of a term" → NO

Correct answer signals proof as:
- Logical argument
- Valid reasoning chain
- Derives conclusion from premises

#### Worked Examples

**Example 1: What counts as a proof?**

**Claim:** "If n is even, then n² is even."

**This is NOT a proof:**
"Let n = 4. Then n² = 16, which is even. ✗"
(Why? It's only one example. Doesn't cover all even numbers.)

**This IS a proof:**
"Suppose n is even. By definition, n = 2k for some integer k. Then n² = (2k)² = 4k² = 2(2k²). Since 2k² is an integer, n² is a multiple of 2, hence even. ✓"
(Why? Logical chain starting from definition, using the hypothesis, reaching conclusion.)

**Example 2: Proof vs. evidence**

**Statement:** "Most prime numbers are odd"

**Evidence (NOT proof):** "2, 3, 5, 7, 11, 13, 17, 19 — most of these are odd!"

**A proof would be:** "Let p be a prime number. If p is even, then p is divisible by 2. By definition of prime, the only divisors of p are 1 and p. So if p is even and divisible by 2, we have p = 2. Therefore, an even prime can only be 2. All other primes are odd."

#### Common Mistakes

- **Mistake 1:** Thinking an example is a proof
  - Why: Examples feel like evidence, so students think they prove things
  - Fix: Remember—one example can't prove "for all." Need logical chain.

- **Mistake 2:** Skipping steps ("obviously" leads to conclusion)
  - Why: Students assume readers will fill in gaps
  - Fix: Write every step. Readers shouldn't have to do mental work.

- **Mistake 3:** Not using definitions
  - Why: Students use intuition instead of precise definitions
  - Fix: Always translate terms into definitions before proving.

#### Memory Aid

**PROOF = Present Reason, Organize Flow, Of Fact Union**

Or better: **Proof chain = each link must hold**

---

### Topic 1.2: Theorem, Proposition, Lemma, Corollary

#### Plain-Language Explanation

These are all types of statements that have been PROVEN:
- **Theorem** = major, important result (the "main event")
- **Proposition** = true statement, important but less central (supporting character)
- **Lemma** = helper result used to prove bigger things (the sidekick)
- **Corollary** = immediate consequence of a theorem (the bonus scene)

Think of a movie: the theorem is the main plot, proposition is a supporting plotline, lemma is a flashback that helps explain something, corollary is the post-credits scene.

#### Formal Definitions

- **Theorem:** An important true statement that has been proven and provides a key result in the theory
- **Proposition:** A true statement with proof, typically less central than a theorem
- **Lemma:** A proven statement whose main purpose is to be used in proving another theorem
- **Corollary:** A proven statement that follows immediately and obviously from a theorem, requiring little or no additional proof

#### Why Each Matters

- **Theorem:** You need to know the STATEMENT (what it says), not necessarily the proof
- **Proposition:** Same as theorem—know the statement
- **Lemma:** Usually you DON'T need to memorize it; just know it exists and what it's for
- **Corollary:** Helpful quick consequence; saves time if you can remember the theorem

#### How They Appear in Problems

- "State the [name] theorem"
- "Which of these is a lemma?" (definition recognition)
- "Using theorem X, prove Y" (applying a known result)
- "This result is a corollary of which theorem?"

#### Multiple-Choice Recognition

- **If asked "what is a lemma?":** Look for "helper," "used to prove," "intermediate"
- **If asked "what is a corollary?":** Look for "follows immediately," "consequence," "direct result"
- **If asked "theorem vs proposition":** Both are proven, but theorem is more central

#### Worked Examples

**Example 1:** Relationship between terms

```
MAIN THEOREM: For all integers n, n² + n is even.

LEMMA (used in proof): If m = 2k, then m is even.
[This is a helper fact we use in the main proof]

COROLLARY (follows from theorem): If n is an integer,
then n² + n is divisible by 2.
[This follows immediately—same as saying it's even]
```

**Example 2:** Identifying the classification

**Statement:** "If n and m are both even, then nm is even."

Q: Is this a theorem, proposition, lemma, or corollary?
A: Could be any depending on context.
- In a textbook: likely **proposition** or **theorem** (main result)
- Used to prove "if n is even, then n² is even": **lemma** (helper)
- Following a result "products preserve evenness": **corollary** (consequence)

#### Common Mistakes

- Confusing lemma and corollary (opposite roles)
- Thinking corollary is always harder to prove (it's actually easier—it follows immediately)
- Trying to memorize proofs of lemmas (usually not needed)

#### Memory Aid

- **Lemma = Lends a hand** (helps prove something else)
- **Corollary = Comes right after** (follows immediately from theorem)
- **Theorem = The main Thing** (important result)
- **Proposition = supporting Play** (true but less central)

---

### Topic 1.3: Premise, Hypothesis, and Conclusion

#### Plain-Language Explanation

In any statement of the form "If P then Q":
- **Premise/Hypothesis** = the "if" part (what you're given)
- **Conclusion** = the "then" part (what you must show)

The premise is what you can assume. The conclusion is what you're trying to prove.

#### Formal Definitions

- **Premise (Hypothesis):** The assumption(s) in an implication; the "if" clause
- **Conclusion:** What must be proven; the "then" clause

In an implication P → Q:
- P is the premise/hypothesis
- Q is the conclusion

#### Why It Matters

Every proof starts by identifying these. You can't write a proof without knowing:
1. What am I allowed to assume?
2. What must I prove?

#### How It Appears in Problems

- "State the hypothesis and conclusion"
- "Does the proof use the hypothesis?" (checking if derivation is valid)
- "What must you show to complete this proof?"

#### Worked Examples

**Example 1:** Identifying premise and conclusion

**Statement:** "If n is divisible by 6, then n is divisible by 3."

- **Premise:** n is divisible by 6
- **Conclusion:** n is divisible by 3

**Example 2:** In proof context

**To prove:** "If x is odd, then x² is odd"

We start by writing:
- "Suppose x is odd" (using the premise)
- Then chain reasoning
- Ending with "Therefore x² is odd" (reaching the conclusion)

#### Common Mistakes

- Not clearly identifying what you're assuming vs. what you must show
- Assuming the conclusion and trying to work backward (backwards reasoning)
- Forgetting to use the hypothesis in the proof

#### Memory Aid

**Hypothesis = the Handholding (given to you)**
**Conclusion = the Claim you're Confirming**

---

### Topic 1.4: Universal and Existential Instantiation & Generalization

#### Plain-Language Explanation

These are logical tools for moving between "all" statements and "some" statements:

- **Universal Instantiation:** "All dogs bark" → "Fido is a dog, so Fido barks"
  (a specific instance of the universal rule)

- **Existential Instantiation:** "Someone ate the cookies" → "Let's call whoever ate them 'thief'"
  (we know one exists; we label it)

- **Universal Generalization:** "Pick any person; they all eventually need sleep" → "All people need sleep"
  (from arbitrary instance, conclude universal)

- **Existential Generalization:** "Bob likes ice cream" → "There exists someone who likes ice cream"
  (from one concrete case, conclude existence)

#### Formal Definitions

- **Universal Instantiation:** From ∀x ∈ A, P(x), conclude P(c) for an arbitrary/specific c ∈ A
- **Existential Instantiation:** From ∃x ∈ A, P(x), conclude there exists some c ∈ A with P(c)
- **Universal Generalization:** From P(c) proven for arbitrary c, conclude ∀x ∈ A, P(x)
- **Existential Generalization:** From P(c) for specific c, conclude ∃x ∈ A, P(x)

#### Why It Matters

These are how we  bridge from general claims to specific cases and back. You'll use them implicitly in every proof.

#### How It Appears

- "Apply universal instantiation to..."
- "What can you conclude from 'there exists...'"
- In proofs (often implicit): using definitions that say "for all"

#### Worked Examples

**Example 1: Universal Instantiation**

**Given:** "All even numbers are divisible by 2"
(∀n ∈ ℤ, if n is even then n is divisible by 2)

**We can instantiate:** "42 is even, so 42 is divisible by 2"
(applied the universal rule to the specific case n = 42)

**Example 2: Existential Instantiation**

**Given:** "There exists a solution to x² = 4"
(∃x ∈ ℝ, x² = 4)

**We can instantiate:** "Let s be a solution to x² = 4"
(we know one exists; we name it for working purposes)

**Example 3: Universal Generalization**

**Proof structure:**
"Let x be an arbitrary integer. [Do reasoning independent of what x is]... Therefore [conclusion holds for this arbitrary x]. Since x was arbitrary, [conclusion holds for all integers]."

**Example 4: Existential Generalization**

**Given:** "y = 5 is a solution to y² = 25"

**Conclusion:** "There exists a solution to y² = 25"

#### Common Mistakes

- **Mistake 1:** Confusing universal and existential claims
  - "∃x, P(x)" means "at least one x has property P" (not "all")
  - "∀x, P(x)" means "every x has property P" (not "one")

- **Mistake 2:** In universal generalization, forgetting that x must be ARBITRARY
  - Good: "Let x be any integer" (then prove something)
  - Bad: "Let x = 5" (only covers one case, not all)

- **Mistake 3:** In existential instantiation, treating the named element as if we know everything about it
  - We know it exists and satisfies the property, but nothing else

#### Memory Aid

- **UI (Universal Instantiation) = all → one**
  - (From "all have property" to "this one has property")

- **EI (Existential Instantiation) = some → this one**
  - (From "some have property" to "let's call this one that has it")

- **UG (Universal Generalization) = this arbitrary one → all**
  - (From "any one you pick has property" to "all have property")

- **EG (Existential Generalization) = this one → some**
  - (From "this one has property" to "there exists one with property")

---

## End of Part 2 (Unit 1 Complete)

**Next:** Part 3 will contain detailed study of Units 2-4 (Direct Proofs, Indirect Proofs, Induction).
