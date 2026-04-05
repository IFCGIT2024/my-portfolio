Initital guide
## Step 1: Review and organize the material

### Clean topic structure

**Unit 1: Introduction to Proofs**

* What a proof is
* Why proofs matter
* Theorem, proposition, lemma, corollary
* Definition
* Premise and conclusion
* Universal/existential instantiation
* Universal/existential generalization 

**Unit 2: Direct Proofs**

* Direct proof
* Proof by cases
* Proof using sets
* Proof by examples
* Existential statements
* Counterexamples / when an example does **not** prove a universal claim  

**Unit 3: Indirect Proofs**

* Contrapositive
* Contradiction
* Biconditional proofs
* “The following are equivalent” style proofs  

**Unit 4: Induction**

* What induction is
* Base case
* Inductive hypothesis
* Inductive step
* Non-trivial base cases
* Strong induction  

**Unit 5: Recursive Functions**

* Recursive functions
* Base case
* Recursive case
* Fibonacci
* Proving recursive statements with induction  

### Important mismatch check

What appears in the PDFs but not clearly emphasized in your pasted learning objectives:

* **Strong induction** 
* **Recursive functions / Fibonacci / proving recursive identities** 
* **Non-trivial base cases** 
* **Instantiation vs generalization** as explicit proof tools 
* **“The following are equivalent”** proofs 

What is in your pasted goals but not strongly explicit as a separate named unit in the PDFs:

* **Uniqueness proofs** are not clearly a main named topic in the uploaded slides
* **Divisibility proofs** are not a separate unit, but they appear inside examples/problems
* **Disproof by counterexample** is present in spirit through examples/counterexamples, especially around proof by example and false universal statements

---

## Step 2: Master exam overview

### 1. Introduction to proofs

You are expected to know:

* what a proof is
* what a theorem/proposition/lemma/corollary is
* premise vs conclusion
* instantiation vs generalization

Memorize:

* exact meanings of theorem / proof / definition / proposition / lemma / corollary
* universal vs existential instantiation/generalization

Understand deeply:

* a proof is not just evidence; it is a logically valid argument
* definitions are used constantly inside proofs

Common confusion:

* lemma vs theorem
* proposition vs theorem
* example vs proof
* existential vs universal statements

### 2. Direct proofs

You are expected to know:

* how to prove an implication directly
* how proof by cases works
* how set proofs work
* when an example proves existence and when it does not prove universality

Memorize:

* direct proof outline
* proof by cases outline
* set equality means prove both inclusions

Understand deeply:

* direct proof starts from the hypothesis
* proof by cases must cover **all** cases
* one example proves existence, but cannot prove a universal statement

Common confusion:

* forgetting to use the hypothesis
* not covering all cases
* thinking one example proves “for all”

### 3. Indirect proofs

You are expected to know:

* contrapositive
* contradiction
* biconditional proof
* equivalence proof structure

Memorize:

* contrapositive of (P \Rightarrow Q) is (\neg Q \Rightarrow \neg P)
* biconditional means prove both directions

Understand deeply:

* contrapositive is logically equivalent to the original implication
* contradiction assumes the opposite and derives an impossibility

Common confusion:

* mixing up contrapositive with converse
* contradiction vs contrapositive
* proving only one direction of “iff”

### 4. Induction

You are expected to know:

* induction framework
* base case
* inductive hypothesis
* inductive step
* strong induction
* when the base case starts at a value other than 1

Memorize:

* the 3-part structure: base, hypothesis, step
* strong induction assumes all earlier cases up to (k)

Understand deeply:

* induction proves infinitely many cases by chaining truth forward
* the inductive step is not “checking the next example”; it is proving the logical implication

Common confusion:

* not stating the proposition (P(n))
* using the thing you are trying to prove without citing the IH
* bad algebra in the inductive step
* wrong starting point for the base case

### 5. Recursive functions

You are expected to know:

* what recursion is
* base case vs recursive case
* Fibonacci definition
* how induction is used to prove recursive identities

Memorize:

* recursive function = defined in terms of earlier values
* base case stops the recursion
* Fibonacci: (F_0=0, F_1=1, F_n=F_{n-1}+F_{n-2}) for (n>1) 

Understand deeply:

* recursion tells you how to build later values from earlier ones
* induction and recursion naturally fit together

Common confusion:

* mixing recursive definition with explicit formula
* forgetting enough base cases
* not matching the recurrence correctly in proofs

---

## Step 3: Cheat sheet

## Core definitions

* **Theorem**: statement proven true
* **Proof**: logical written verification of truth
* **Definition**: exact meaning of a term
* **Proposition**: theorem, often less central
* **Lemma**: helper theorem used to prove another theorem
* **Corollary**: immediate consequence of a theorem 

## Logic structure

* **Premise / hypothesis**: what you assume
* **Conclusion**: what you must show
* Most proofs are of the form (P \Rightarrow Q) 

## Instantiation / generalization

* **Universal instantiation**: from (\forall x \in A, P(x)), conclude (P(c)) for arbitrary (c \in A)
* **Existential instantiation**: from (\exists x \in A, P(x)), conclude there exists some specific (c \in A) with (P(c))
* **Universal generalization**: prove (P(c)) for arbitrary (c), then conclude (\forall x, P(x))
* **Existential generalization**: prove (P(c)) for a particular (c), then conclude (\exists x, P(x)) 

## Proof types and when to use them

* **Direct proof**: implication where hypothesis naturally leads to conclusion
* **Cases**: natural split into parity/sign/boolean possibilities
* **Set proof**: membership, subset, equality of sets
* **Example / existence proof**: show one witness
* **Counterexample**: disprove a universal statement
* **Contrapositive**: easier to prove (\neg Q \Rightarrow \neg P)
* **Contradiction**: assume opposite and derive impossibility
* **Biconditional**: prove both directions
* **Induction**: statement for all integers (n \ge n_0)
* **Strong induction**: need several previous cases
* **Recursive proof**: often use induction on the recursive index

## Common logical reminders

* Contrapositive of (P \Rightarrow Q) is (\neg Q \Rightarrow \neg P)
* Converse is (Q \Rightarrow P), and is **not** equivalent in general
* Biconditional (P \Leftrightarrow Q) means both (P \Rightarrow Q) and (Q \Rightarrow P)

## Set reminders

* To prove (A \subseteq B): let (x \in A), show (x \in B)
* To prove (A=B): prove (A \subseteq B) and (B \subseteq A)
* To prove (x \in {x : P(x)}): show (P(x))

## Induction reminders

* State (P(n))
* Check base case carefully
* Assume (P(k))
* Prove (P(k+1))
* Use IH explicitly
* Strong induction: assume all (P(1),\dots,P(k)) as needed

## Recursive reminders

* Need a base case or recursion never bottoms out
* Recursive case must refer to earlier/known values
* Fibonacci needs two base cases

## “If you see this, think this”

* “For all integers (n\ge n_0)” → induction
* “If … then …” → direct first, then contrapositive if messy
* “If and only if” → two proofs
* “There exists” → find a witness
* “No such object exists” → contradiction
* “Set equality” → double inclusion
* “False universal claim” → find one counterexample
* “Even/odd/divisible by” → write definitions algebraically

## Common traps

* one example does **not** prove “for all”
* contrapositive is not the converse
* forgetting one direction in biconditional
* proving examples instead of general case
* not covering every case in proof by cases
* not stating the base case or IH in induction

---

## Step 4: Full study guide

## Unit 1: Introduction to proofs

### Plain-language explanation

A proof is a careful explanation showing why something must be true, not just that it seems true from examples.

### Formal ideas

The slides define theorem, proof, definition, proposition, lemma, and corollary explicitly. 

### Why it matters

Everything else in the unit depends on reading and writing proof language correctly.

### How it appears in problems

* “Which term means a theorem used to prove another theorem?”
* “Which statement best describes universal instantiation?”
* “Identify the premise and conclusion.”

### Multiple-choice recognition

* **lemma** = helper result
* **corollary** = quick consequence
* **definition** = exact meaning, not something “proved”

### Example

If you know “all multiples of 6 are even,” and (x) is a multiple of 6, you instantiate the universal statement to that particular (x).

### Common mistakes

* treating a definition like a theorem
* confusing a corollary with a lemma
* not identifying what is assumed vs what must be shown

### Memory aid

* **Lemma lends a hand**
* **Corollary comes right after**

---

## Unit 2: Direct proof

### Plain-language explanation

Start from what is given and push forward logically until you reach what you want.

### Formal structure

Assume (P). Work logically. Therefore (Q). 

### Why it matters

It is the default method for many implication proofs.

### How it appears in problems

* even/odd
* divisibility
* algebraic implications
* transitivity-style statements

### Multiple-choice recognition

A direct proof:

* starts by assuming the hypothesis
* does not assume the conclusion is false
* does not reverse the statement

### Small example

If (x) is even, then (xy) is even.
Write (x=2k). Then (xy=2(ky)), so (xy) is even. 

### Common mistakes

* starting with the conclusion
* doing examples instead of general proof
* not using the definition of even/odd/divisible

### Memory aid

**Direct = start where the statement starts.**

---

## Unit 2A: Proof by cases

### Plain-language explanation

Split the problem into all possible situations and prove the claim in each one.

### Formal idea

If the hypothesis leads to several exhaustive possibilities, check each. 

### Why it matters

Useful when parity, signs, booleans, or modular classes create natural splits.

### How it appears

* odd/even
* positive/negative/zero
* truth tables
* modular arithmetic classes

### Multiple-choice recognition

A valid proof by cases must:

* identify all cases
* show the conclusion in every case
* conclude the claim holds overall

### Common mistake

Missing a case.

### Memory aid

**Cases must be complete and exhaustive.**

---

## Unit 2B: Proof using sets

### Plain-language explanation

To prove things about sets, translate them into membership statements.

### Formal patterns

* (a \in A): show (a) has the defining property
* (A \subseteq B): let (a\in A), show (a\in B)
* (A=B): prove both (A\subseteq B) and (B\subseteq A) 

### Why it matters

Set proofs are really logic proofs in disguise.

### Common mistake

Trying to prove equality with only one inclusion.

### Memory aid

**Set equality = double inclusion.**

---

## Unit 2C: Proof by example / counterexample

### Plain-language explanation

One example can prove that something exists. One counterexample can disprove a universal statement.

### Why it matters

Students often misuse examples.

### Recognition rules

* “There exists …” → one good example may be enough
* “For all …” → one example is never enough to prove it
* “For all …” false? one counterexample kills it

### Common mistake

Using one example to prove a universal statement.

### Memory aid

**Existence needs one. Universality needs all. Falsity needs one counterexample.**

---

## Unit 3: Contrapositive

### Plain-language explanation

Instead of proving (P \Rightarrow Q), prove the logically equivalent statement (\neg Q \Rightarrow \neg P).

### Why it matters

Sometimes the conclusion is awkward, but its negation is easy to work with.

### Recognition

Useful when:

* conclusion has “even,” “divisible,” “zero,” etc.
* negating the conclusion gives something algebraically nicer

### Structure

Assume (\neg Q). Work. Therefore (\neg P). 

### Common mistake

Writing the converse (Q \Rightarrow P) instead.

### Memory aid

**Contra flips and negates.**

---

## Unit 3B: Contradiction

### Plain-language explanation

Assume the claim is false and show that leads to something impossible.

### Why it matters

Very useful for impossibility, irrationality, uniqueness, or “no such thing” arguments.

### Structure

Assume (\neg P). Work. Derive contradiction (C \land \neg C). Therefore (P). 

### Common mistake

Ending with something surprising but not actually contradictory.

### Memory aid

**Contradiction must truly clash.**

---

## Unit 3C: Biconditional proofs

### Plain-language explanation

An “if and only if” statement is really two implications.

### Structure

1. Prove (P \Rightarrow Q)
2. Prove (Q \Rightarrow P) 

### Common mistake

Only proving one direction.

### Memory aid

**IFF = two jobs.**

---

## Unit 3D: Equivalent statements

### Plain-language explanation

If several statements are equivalent, they all stand or fall together.

### Why it matters

You may be asked what such a theorem means conceptually.

### Common confusion

Thinking it means all are true individually without logical connection; really it means they have the same truth status. 

---

## Unit 4: Induction

### Plain-language explanation

Induction proves a statement for every integer from some starting point onward.

### Formal structure

* Base case
* Inductive hypothesis
* Inductive step (P(k)\Rightarrow P(k+1)) 

### Why it matters

It is the main tool for sums, recursive formulas, inequalities over integers, divisibility patterns.

### How it appears

* sums
* powers
* inequalities
* Fibonacci identities
* recursive statements

### Multiple-choice recognition

A correct induction proof must include:

* a starting value
* an assumption for arbitrary (k)
* a proof for (k+1)

### Common mistake

Confusing “assume (P(k))” with “assume (P(k+1)).”

### Memory aid

**Base, Assume, Build.**

---

## Unit 4B: Strong induction

### Plain-language explanation

Like induction, except you assume all earlier cases up to (k), not just one.

### Why it matters

Needed when the next case depends on multiple earlier ones.

### Recognition

If a recursive rule uses several earlier values, or one-step induction feels too weak, try strong induction. 

### Memory aid

**Strong induction remembers the whole staircase so far.**

---

## Unit 4C: Non-trivial base cases

### Plain-language explanation

Sometimes a statement is not true for very small (n), so the correct induction start is a larger value.

### Why it matters

Bad base cases ruin an otherwise good proof. The slides explicitly highlight this. 

---

## Unit 5: Recursive functions

### Plain-language explanation

A recursive function defines later values using earlier values.

### Formal idea

Need:

* one or more base cases
* recursive case(s) using previous values 

### Why it matters

Recursion appears in computing and mathematics all the time.

### How it appears

* define a sequence recursively
* compute values from a recurrence
* prove recursive identities by induction

### Fibonacci example

(F_0=0), (F_1=1), (F_n=F_{n-1}+F_{n-2}) for (n>1). 

### Common mistake

Not giving enough base cases.

### Memory aid

**Recursion needs a stop and a rule.**

---

## Step 5: Proof strategy guide

## A. General proof method

1. **Read the statement carefully**

   * Is it implication, biconditional, universal, existential, equality, or negation?

2. **Translate the claim into plain English**

   * What is assumed?
   * What must be shown?

3. **Write down definitions immediately**

   * even (=2k)
   * odd (=2k+1)
   * divisible by (m) means (m\mid n \iff n=mk)
   * subset means membership implication

4. **Identify the proof type**

   * implication → direct/contrapositive
   * for all integers (n\ge n_0) → induction
   * iff → two directions
   * set equality → double inclusion
   * existence → witness
   * false universal → counterexample

5. **Choose a structure before doing algebra**

   * know your first sentence and your target

6. **Do the algebra or logic cleanly**

   * every line should move you toward the target

7. **End by clearly restating the conclusion**

## B. Specific method by proof type

### 1. Direct proof

Use when the hypothesis gives you useful structure.

Template:

* Suppose (P).
* Then ...
* Therefore ...
* Hence (Q).

### 2. Contrapositive

Use when (\neg Q) is easier than (Q).

Template:

* We prove the contrapositive.
* Assume (\neg Q).
* Then ...
* Therefore (\neg P).
* So (P\Rightarrow Q).

### 3. Contradiction

Use for impossibility, uniqueness, irrationality, nonexistence.

Template:

* Assume for contradiction that (\neg P).
* Then ...
* This implies both ...
* Contradiction.
* Therefore (P).

### 4. Proof by cases

Use when there are natural exhaustive categories.

Template:

* Suppose (P).
* Case 1: ...
* Therefore (Q).
* Case 2: ...
* Therefore (Q).
* Since all cases were covered, (Q) follows.

### 5. Existence proof

Use when the claim says “there exists.”

Template:

* Let (x=\dots)
* Then show it satisfies the required property.
* Therefore such an (x) exists.

### 6. Uniqueness proof

Use when you must show only one object works.

Template:

* First show existence.
* Suppose (a) and (b) both satisfy the property.
* Show (a=b).
* Therefore the object is unique.

### 7. Induction

Use for statements over integers indexed by (n).

Template:

* Let (P(n)) be ...
* Base case: show (P(n_0)).
* Inductive hypothesis: assume (P(k)).
* Inductive step: show (P(k+1)).
* Therefore (P(n)) for all (n\ge n_0).

### 8. Biconditional

Use for “iff.”

Template:

* First, suppose (P). Show (Q).
* Conversely, suppose (Q). Show (P).
* Therefore (P\iff Q).

### 9. Set equality

Use when proving two sets are equal.

Template:

* First show (A\subseteq B).
* Let (x\in A). Then ...
* Hence (x\in B).
* Next show (B\subseteq A).
* Therefore (A=B).

### 10. Divisibility proof

Use definitions immediately.

Template:

* Suppose (a\mid b). Then (b=ak) for some integer (k).
* Substitute and manipulate.
* Conclude divisibility.

### 11. Counterexample

Use to disprove a universal claim.

Template:

* The statement is false.
* Consider (x=\dots)
* Then the hypothesis holds, but the conclusion fails.
* Hence this is a counterexample.

---

## Step 6: Proof selection flowchart

Start here:

**1. Is the statement “for all (n\ge n_0)” or indexed by integers?**

* Yes → try **induction**
* If next step depends on several earlier values → **strong induction**

**2. Is it an implication (P\Rightarrow Q)?**

* First try **direct proof**
* If direct proof feels awkward, and (\neg Q) is easier to handle → **contrapositive**
* If the claim says something impossible cannot happen, or direct/contra is ugly → **contradiction**

**3. Is it “if and only if”?**

* Do **two proofs**, one in each direction

**4. Is it about sets?**

* (x\in A) → prove defining property
* (A\subseteq B) → element chase
* (A=B) → double inclusion

**5. Does it say “there exists”?**

* Find a **witness**
* If asked “unique,” add a uniqueness argument

**6. Does it say something is false for all cases, or no such object exists?**

* Try **contradiction**
* Or find a **counterexample** if the original statement is universal and false

**7. Are there natural categories like even/odd, sign, truth values?**

* Try **proof by cases**

**If stuck**

* rewrite using definitions
* test a few examples to spot pattern
* negate conclusion and inspect contrapositive
* ask: is this really a set, divisibility, parity, or induction problem in disguise?

---

## Step 7: Definitions and multiple-choice recognition

## Definition recognition

* **Theorem**: important true statement with proof
* **Proposition**: true statement with proof, often less central
* **Lemma**: helper theorem
* **Corollary**: immediate result following from theorem
* **Definition**: exact meaning of a term
* **Premise**: assumption/hypothesis
* **Conclusion**: what follows / what must be shown
* **Universal instantiation**: from all, go to one arbitrary case
* **Existential instantiation**: from there exists, pick a witness
* **Universal generalization**: from arbitrary one, conclude all
* **Existential generalization**: from one example, conclude exists

## Common look-alikes

* **Contrapositive** vs **converse**

  * contrapositive: (\neg Q \Rightarrow \neg P)
  * converse: (Q \Rightarrow P)

* **Example** vs **counterexample**

  * example can illustrate
  * counterexample disproves a universal claim

* **Lemma** vs **corollary**

  * lemma helps prove
  * corollary follows after

* **Existence** vs **universality**

  * existence = one witness
  * universality = every case

* **Direct proof** vs **contradiction**

  * direct starts from hypothesis
  * contradiction starts from negation of the statement

## Multiple-choice elimination tips

* If an option says one example proves a universal statement, eliminate it.
* If an option calls the converse the contrapositive, eliminate it.
* If a biconditional answer only mentions one direction, eliminate it.
* If a set equality answer proves only one subset relation, eliminate it.
* If an induction answer has no base case or no IH, eliminate it.

---

## Step 8: Active recall materials

## Likely exam questions by topic

### Intro to proofs

1. Define theorem, proposition, lemma, corollary.
2. What is the difference between a proof and an example?
3. Explain universal instantiation.

### Direct proofs

4. Prove: if (x) is even, then (xy) is even.
5. Prove a subset relation.
6. Explain why one example cannot prove a universal statement.

### Indirect proofs

7. State the contrapositive of a given implication.
8. Prove a statement by contradiction.
9. Prove an iff statement.

### Induction

10. Outline the steps of induction.
11. Prove a sum formula by induction.
12. Explain when strong induction is needed.

### Recursive functions

13. Define a recursive function.
14. Give base and recursive cases for a sequence.
15. Explain why induction is natural for recursive claims.

## Short-answer concept questions

* What is a proof?
* Why are definitions central to proofs?
* What is the difference between premise and conclusion?
* When should you use proof by cases?
* Why is the base case necessary in induction?
* Why is the base case necessary in recursion?

## Proof-style questions

* Prove: if (x) is odd, then (x^2) is odd.
* Prove: if (A\subseteq B) and (B\subseteq C), then (A\subseteq C).
* Prove by contrapositive: if (x^2) is even, then (x) is even.
* Prove by contradiction: (\sqrt{2}) is irrational.
* Prove by induction: (\sum_{i=1}^n i = \frac{n(n+1)}2).

## Definition recognition questions

* A theorem used mainly to prove another theorem is called what?
* A result that follows immediately from a theorem is called what?
* From (\forall x\in A, P(x)), concluding (P(c)) for arbitrary (c\in A) is what?

## MCQ-style questions

1. Which proof method is most natural for a statement of the form “for all (n\ge 1)”?
2. Which of the following is the contrapositive of (P\Rightarrow Q)?
3. What must be shown to prove (A=B)?
4. Which statement can be proved by giving one example?
5. Which proof type requires both directions to be shown?

## “Explain why this is wrong”

* “I proved all odd integers have property X because 3 has property X.”
* “To prove (P\Rightarrow Q), I proved (Q\Rightarrow P).”
* “To prove (A=B), I only showed (A\subseteq B).”
* “In induction, I checked the first three examples, so the statement is true for all (n).”

---

## Priority: what to focus on first

Based on the uploaded material, I would prioritize in this order:

**Tier 1: Must know cold**

* direct proof structure
* contrapositive vs contradiction
* biconditional = two directions
* induction structure
* set proof structure
* examples vs counterexamples
* core definitions: theorem, lemma, corollary, premise, conclusion    

**Tier 2: Very likely and high-value**

* strong induction
* recursive functions and Fibonacci
* non-trivial base cases
* instantiation/generalization   

**Tier 3: Important but slightly more specialized**

* “the following are equivalent”
* existence proofs through examples/witnesses
* counterexample-based disproof

If you want, next I can turn this into a **one-page ultra-condensed exam sheet** or a **practice test with answers** based directly on these topics.
