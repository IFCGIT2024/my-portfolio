# COMPREHENSIVE ENHANCED STUDY GUIDE FOR PROOFS
## PART 4: MATHEMATICAL INDUCTION, STRONG INDUCTION & RECURSION

---

## UNIT 4: INDUCTION & RECURSION

### Topic 4.1: Mathematical Induction (Basic)

#### Plain-Language Explanation

Induction proves a statement is true for ALL integers starting from some value. Think of dominoes: if the first one falls and each falling domino knocks the next one, then all dominoes fall.

**Structure:**
1. **Base case:** Show the statement is true for the starting value
2. **Inductive hypothesis:** Assume the statement is true for some arbitrary value k
3. **Inductive step:** Show that if it's true for k, it must be true for k+1
4. **Conclusion:** By domino effect, the statement is true for all values ≥ starting value

#### Formal Definition

To prove ∀n ≥ n₀, P(n) by induction:

1. **Base Case:** Prove P(n₀)

2. **Inductive Step:** Prove that ∀k ≥ n₀, P(k) → P(k+1)
   (Equivalently: assume P(k), prove P(k+1))

3. **Conclusion:** Therefore P(n) holds for all n ≥ n₀

#### Why It Matters

Induction is THE method for:
- Sum formulas
- Recursive definitions
- Divisibility patterns
- Inequalities with integer index

#### How It Appears

- "Prove for all integers n ≥ 1 that..."
- "Prove that the n-th [something] equals..."
- Fibonacci identities
- Properties of recursively-defined sequences

#### Multiple-Choice Recognition

Valid induction proof must have:
- Explicit statement P(n) ✓
- Base case verification ✓
- Inductive hypothesis assumption ✓
- Inductive step proof ✓
- Conclusion ✓

Missing any of these = incomplete proof ✗

#### Worked Examples

**Example 1: Sum Formula**

**Claim:** For all n ≥ 1, ∑ᵢ₌₁ⁿ i = n(n+1)/2

**Induction Proof:**

```
Let P(n) denote the statement: ∑ᵢ₌₁ⁿ i = n(n+1)/2

BASE CASE: n = 1
LHS = ∑ᵢ₌₁¹ i = 1
RHS = 1(1+1)/2 = 1(2)/2 = 1
LHS = RHS ✓
Therefore P(1) is true.

INDUCTIVE STEP:
Inductive Hypothesis: Assume P(k) is true for arbitrary k ≥ 1.
That is: ∑ᵢ₌₁ᵏ i = k(k+1)/2

We must show P(k+1) is true:
∑ᵢ₌₁ᵏ⁺¹ i = (k+1)(k+2)/2

Proof:
∑ᵢ₌₁ᵏ⁺¹ i = (∑ᵢ₌₁ᵏ i) + (k+1)
           = k(k+1)/2 + (k+1)          [by IH]
           = k(k+1)/2 + 2(k+1)/2      [common denominator]
           = (k+1)(k + 2)/2
           = (k+1)(k+2)/2 ✓

Therefore P(k+1) is true whenever P(k) is true.

CONCLUSION:
By mathematical induction, P(n) is true for all n ≥ 1.
```

**Example 2: Divisibility Pattern**

**Claim:** For all n ≥ 1, 3 divides (4ⁿ - 1)

**Induction Proof:**

```
Let P(n) denote: 3 divides (4ⁿ - 1)

BASE CASE: n = 1
4¹ - 1 = 4 - 1 = 3
3 divides 3 ✓
Therefore P(1) is true.

INDUCTIVE STEP:
IH: Assume P(k) is true: 3 divides (4ᵏ - 1)
    So 4ᵏ - 1 = 3m for some integer m.
    Thus 4ᵏ = 3m + 1.

Must show P(k+1): 3 divides (4ᵏ⁺¹ - 1)

Proof:
4ᵏ⁺¹ - 1 = 4 · 4ᵏ - 1
         = 4(3m + 1) - 1          [substituting 4ᵏ = 3m + 1 from IH]
         = 12m + 4 - 1
         = 12m + 3
         = 3(4m + 1)

Since 4m + 1 is an integer, 3 divides (4ᵏ⁺¹ - 1) ✓

Therefore P(k+1) is true whenever P(k) is true.

CONCLUSION:
By mathematical induction, 3 divides (4ⁿ - 1) for all n ≥ 1.
```

**Example 3: Inequality**

**Claim:** For all n ≥ 1, 2ⁿ > n

**Induction Proof:**

```
Let P(n) denote: 2ⁿ > n

BASE CASE: n = 1
2¹ = 2 > 1 ✓
Therefore P(1) is true.

INDUCTIVE STEP:
IH: Assume P(k) is true: 2ᵏ > k

Must show P(k+1): 2ᵏ⁺¹ > k + 1

Proof:
2ᵏ⁺¹ = 2 · 2ᵏ
     > 2 · k          [by IH, since 2ᵏ > k]
     = 2k

Now we need 2k > k + 1:
2k > k + 1  ⟺  k > 1

For k ≥ 1, this holds when k ≥ 1. Actually, we have:
- When k = 1: 2(1) = 2 > 1 + 1 = 2? No, equals.

Let me be more careful:
2ᵏ⁺¹ > 2k, and we need 2k ≥ k + 1
This is true when k ≥ 1.

Therefore, for k ≥ 1: 2ᵏ⁺¹ > 2k ≥ k + 1, so 2ᵏ⁺¹ > k + 1 ✓

CONCLUSION:
By mathematical induction, 2ⁿ > n for all n ≥ 1.
```

#### Common Mistakes

- **Not statingP(n) explicitly** - reader doesn't know what's being proven
- **Using the thing-being-proved without citing IH** - circular reasoning
  - Bad: "To show 2ᵏ⁺¹ > k+1, note that 2ᵏ⁺¹ > k+1..." (assuming what you proved)
  - Good: "By IH, 2ᵏ > k. So 2ᵏ⁺¹ = 2·2ᵏ > 2·k..." (using IH explicitly)

- **Wrong base case value** - starting at n = 0 when claim is only for n ≥ 1
- **Algebra errors in the step** - sloppy symbolic manipulation
- **Not actually proving the step** - skipping to conclusion

#### Memory Aid

**INDUCTION = Base, Hypothesis, step**
**or: First domino falls, Each falls if previous did, All fall**

---

### Topic 4.2: Strong Induction

#### Plain-Language Explanation

Strong induction is like regular induction, but instead of assuming P(k), you assume P(1), P(2), ..., P(k) all true, then prove P(k+1).

Use it when the next term depends on MULTIPLE previous terms, not just the one before.

#### Formal Definition

To prove ∀n ≥ n₀, P(n) by strong induction:

1. **Base Cases:** Prove P(n₀), P(n₀+1), ..., P(n₀+m) for enough starting values

2. **Inductive Step:** Assume P(n₀), P(n₀+1), ..., P(k) all true.
   Prove P(k+1) using any or all previous cases.

3. **Conclusion:** Therefore P(n) holds for all n ≥ n₀

#### Why It Matters

Some recursive definitions (like Fibonacci) depend on multiple prior values. Weak induction (assuming only P(k)) isn't strong enough.

#### How It Appears

- Fibonacci-type recurrences: aₙ = aₙ₋₁ + aₙ₋₂
- Problems explicitly asking for multiple base cases
- When one-step induction feels insufficient

#### Worked Example

**Claim:** Every integer n ≥ 2 can be written as a product of primes.

**Strong Induction Proof:**

```
Let P(n) denote: n can be written as a product of primes

BASE CASES:
P(2): 2 is prime, so 2 = 2 (product of one prime) ✓
P(3): 3 is prime, so 3 = 3 (product of one prime) ✓

INDUCTIVE STEP:
IH: Assume P(2), P(3), ..., P(k) all true.
    That is, every integer from 2 to k is a product of primes.

Must show P(k+1): k+1 can be written as a product of primes.

Proof:
Case 1: k+1 is prime.
  Then k+1 itself is a product of primes (the one prime k+1).

Case 2: k+1 is composite.
  Then k+1 = ab for some integers a, b with 1 < a, b < k+1.
  By IH, both a and b are products of primes.
  Therefore ab = k+1 is a product of primes.

Thus P(k+1) is true.

CONCLUSION:
By strong induction, every integer n ≥ 2 is a product of primes.
```

#### When to Use Strong vs. Weak Induction

| Weak Induction | Strong Induction |
|---|---|
| Next term depends on previous 1 term | Next term depends on multiple prior terms |
| Fibonacci-like: fₙ = fₙ₋₁ + fₙ₋₂ (weak fails) | Fibonacci-like: needs strong |
| Divisibility by single prior | Divisibility by set of priors |

#### Common Mistakes

- **Forgetting multiple base cases** - if recursion uses 2 prior terms, check 2 base cases
- **Not explicitly using IH for multiple cases** - can use any of them
- **Assuming unnecessarily strongly** - weak induction sometimes suffices; don't over-complicate

---

### Topic 4.3: Non-Trivial Base Cases

#### Plain-Language Explanation

Sometimes a claim is NOT true for very small n. In those cases, you start the induction at a larger value.

Example: "2ⁿ > n" is true for n ≥ 1, but proof needs to check n = 1 carefully.

"3ⁿ > 2n" is only true for n ≥ 2, so base case is n = 2.

#### Why It Matters

Choosing the wrong base case invalidates the entire induction. PDFs emphasize this.

#### How to Find the Right Base Case

1. Start with small values: n = 1, 2, 3, ...
2. Check the inequality or formula
3. Find the first n where it becomes true
4. That's your base case

#### Worked Example

**Claim:** For all n ≥ 2, 2ⁿ > 2n

**Finding base case:**
```
n = 1: 2¹ = 2, 2(1) = 2. Is 2 > 2? NO
n = 2: 2² = 4, 2(2) = 4. Is 4 > 4? NO
n = 3: 2³ = 8, 2(3) = 6. Is 8 > 6? YES ✓

Base case should be n = 3 (the first true value)
```

**Wait, let me recalculate:** Actually the claim says n ≥ 2, so it's asserting starting at n = 2. But n = 2 makes 4 = 4 (not >). So either:
1. The claim is false (suggested inequality doesn't hold for n = 2)
2. The claim should be n ≥ 3

This illustrates: **Check your base cases FIRST.**

#### Common Mistakes

- **Assuming base case is always n = 1** - Not always!
- **Starting induction at wrong value** - Prove for n ≥ 1 when base case fails at n = 1
- **Not checking small cases** - Critical before settling on n₀

---

### Topic 4.4: Recursive Functions

#### Plain-Language Explanation

A recursive function defines new values using earlier values. Like a recipe that says "to make f(n), use f(n-1)."

**Must have:**
- **Base case(s):** Values you know directly (without recursion)
- **Recursive case(s):** Rule for computing new values from earlier ones

#### Formal Definition

A recursive definition specifies:
1. Base case(s): f(n₀) = [explicit value]
2. Recursive case: f(n) = [expression involving f(n-1), f(n-2), ...] for n > n₀

#### Why It Matters

Recursion appears everywhere in computing and mathematics. You need to:
- Understand recursive definitions
- Compute values from them
- Prove properties about them (usually with induction)

#### How It Appears

- "Define f recursively"
- "Given f(n) = [recursive definition], find f(k)"
- "Prove property P holds for this recursively-defined sequence"

#### Worked Examples

**Example 1: Simple Recursion**

**Definition:** f(n) = n! (factorial)
```
Base case: f(0) = 1
Recursive case: f(n) = n · f(n-1) for n > 0
```

**Computing values:**
```
f(0) = 1
f(1) = 1 · f(0) = 1 · 1 = 1
f(2) = 2 · f(1) = 2 · 1 = 2
f(3) = 3 · f(2) = 3 · 2 = 6
f(4) = 4 · f(3) = 4 · 6 = 24
```

**Example 2: Fibonacci (Two-Term Recursion)**

**Definition:**
```
Base cases: F(0) = 0, F(1) = 1
Recursive case: F(n) = F(n-1) + F(n-2) for n ≥ 2
```

**Computing values:**
```
F(0) = 0
F(1) = 1
F(2) = F(1) + F(0) = 1 + 0 = 1
F(3) = F(2) + F(1) = 1 + 1 = 2
F(4) = F(3) + F(2) = 2 + 1 = 3
F(5) = F(4) + F(3) = 3 + 2 = 5
F(6) = F(5) + F(4) = 5 + 3 = 8
```

**Example 3: Proving a Property**

**Claim:** F(n) < 2ⁿ for all n ≥ 0

**Induction Proof:**

```
BASE CASES:
F(0) = 0 < 2⁰ = 1 ✓
F(1) = 1 < 2¹ = 2 ✓

INDUCTIVE STEP:
IH: Assume F(k) < 2ᵏ for all k ≤ n where n ≥ 1

Must show F(n+1) < 2ⁿ⁺¹:

Proof:
F(n+1) = F(n) + F(n-1)
       < 2ⁿ + 2ⁿ⁻¹      [by IH on both terms, assuming n ≥ 1]
       < 2ⁿ + 2ⁿ       [since 2ⁿ⁻¹ < 2ⁿ]
       = 2 · 2ⁿ
       = 2ⁿ⁺¹ ✓

CONCLUSION:
By strong induction, F(n) < 2ⁿ for all n ≥ 0.
```

*(Note: We used strong induction because Fibonacci depends on both F(n) and F(n-1))*

#### Common Mistakes

- **Missing base case** - recursion never bottoms out, leads to infinite loop conceptually
- **Not enough base cases** - if n depends on n-2, need two base cases
- **Incorrect recurrence** - mixed up the rule
- **Not using IH explicitly in proofs**  - show you're using the recursive definition

#### Memory Aid

**Recursion = Reduce, Solve smaller, Combine**
**Base case must stop the recursion**

---

### Topic 4.5: Proving Recursive Properties with Induction

#### Key Insight

Recursive definitions almost always get proven using induction. When you have a recursively-defined sequence, induction is the natural proof method.

#### Pattern

```
Claim: Property P holds for recursively-defined f(n)

Induction proof:
- Base cases: Prove P for the base case values of f
- IH: Assume P(k) for arbitrary k
- Step: Using the recursive definition (express f(k+1) in terms of f(k))
        and the IH (P holds for f(k)), prove P(k+1)

The recursion guides the induction step.
```

#### Example: Fibonacci Sum Property

**Claim** ∑ᵢ₌₀ⁿ F(i) = F(n+2) - 1

**Induction:**

```
BASE CASE: n = 0
LHS = F(0) = 0
RHS = F(2) - 1 = 1 - 1 = 0
LHS = RHS ✓

INDUCTIVE STEP:
IH: ∑ᵢ₌₀ᵏ F(i) = F(k+2) - 1

Must show: ∑ᵢ₌₀ᵏ⁺¹ F(i) = F(k+3) - 1

Proof:
∑ᵢ₌₀ᵏ⁺¹ F(i) = (∑ᵢ₌₀ᵏ F(i)) + F(k+1)
             = (F(k+2) - 1) + F(k+1)         [by IH]
             = F(k+2) + F(k+1) - 1
             = F(k+3) - 1                    [by Fibonacci recursion]  ✓

CONCLUSION:
By induction, ∑ᵢ₌₀ⁿ F(i) = F(n+2) - 1 for all n ≥ 0.
```

---

## End of Part 4

**Next:** Part 5 will contain the Proof Strategy Guide, Flowchart, and Practice Materials.
