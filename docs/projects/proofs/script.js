// Problems Database
const problems = {
    recursive: [
        {
            id: 'rec1',
            statement: 'Let the sequence {aₙ} be defined recursively by a₁ = 2 and aₙ = 2aₙ₋₁ for n ≥ 2. Prove that aₙ = 2ⁿ for all positive integers n.',
            solution: `<p><strong>Proof:</strong></p>
<p>We will prove this using the recursive definition.</p>
<p><strong>Base Case:</strong> For n = 1:<br>
a₁ = 2 = 2¹ ✓</p>
<p><strong>Recursive Step:</strong> Assume aₖ = 2ᵏ for some k ≥ 1.</p>
<p>Then for n = k + 1:<br>
aₖ₊₁ = 2aₖ (by the recursive definition)<br>
= 2(2ᵏ) (by our assumption)<br>
= 2ᵏ⁺¹ ✓</p>
<p>Since the formula holds for a₁ and follows from the recursive definition, aₙ = 2ⁿ for all positive integers n. ∎</p>`
        },
        {
            id: 'rec2',
            statement: 'Let the sequence {bₙ} be defined recursively by b₁ = 3 and bₙ = bₙ₋₁ + 4 for n ≥ 2. Prove that bₙ = 4n - 1 for all positive integers n.',
            solution: `<p><strong>Proof:</strong></p>
<p><strong>Base Case:</strong> For n = 1:<br>
b₁ = 3 = 4(1) - 1 = 3 ✓</p>
<p><strong>Recursive Step:</strong> Assume bₖ = 4k - 1 for some k ≥ 1.</p>
<p>Then for n = k + 1:<br>
bₖ₊₁ = bₖ + 4 (by the recursive definition)<br>
= (4k - 1) + 4 (by our assumption)<br>
= 4k + 3<br>
= 4(k + 1) - 1 ✓</p>
<p>Therefore, bₙ = 4n - 1 for all positive integers n. ∎</p>`
        },
        {
            id: 'rec3',
            statement: 'Let the sequence {cₙ} be defined recursively by c₁ = 1 and cₙ = 3cₙ₋₁ for n ≥ 2. Prove that cₙ = 3ⁿ⁻¹ for all positive integers n.',
            solution: `<p><strong>Proof:</strong></p>
<p><strong>Base Case:</strong> For n = 1:<br>
c₁ = 1 = 3¹⁻¹ = 3⁰ = 1 ✓</p>
<p><strong>Recursive Step:</strong> Assume cₖ = 3ᵏ⁻¹ for some k ≥ 1.</p>
<p>Then for n = k + 1:<br>
cₖ₊₁ = 3cₖ (by the recursive definition)<br>
= 3(3ᵏ⁻¹) (by our assumption)<br>
= 3ᵏ<br>
= 3⁽ᵏ⁺¹⁾⁻¹ ✓</p>
<p>Therefore, cₙ = 3ⁿ⁻¹ for all positive integers n. ∎</p>`
        },
        {
            id: 'rec4',
            statement: 'Let the sequence {dₙ} be defined recursively by d₁ = 5 and dₙ = dₙ₋₁ + 2 for n ≥ 2. Prove that dₙ = 2n + 3 for all positive integers n.',
            solution: `<p><strong>Proof:</strong></p>
<p><strong>Base Case:</strong> For n = 1:<br>
d₁ = 5 = 2(1) + 3 = 5 ✓</p>
<p><strong>Recursive Step:</strong> Assume dₖ = 2k + 3 for some k ≥ 1.</p>
<p>Then for n = k + 1:<br>
dₖ₊₁ = dₖ + 2 (by the recursive definition)<br>
= (2k + 3) + 2 (by our assumption)<br>
= 2k + 5<br>
= 2(k + 1) + 3 ✓</p>
<p>Therefore, dₙ = 2n + 3 for all positive integers n. ∎</p>`
        },
        {
            id: 'rec5',
            statement: 'Let the sequence {eₙ} be defined recursively by e₁ = 1, e₂ = 2, and eₙ = eₙ₋₁ + eₙ₋₂ for n ≥ 3. Prove that e₃ = 3.',
            solution: `<p><strong>Proof:</strong></p>
<p>Given: e₁ = 1, e₂ = 2, and eₙ = eₙ₋₁ + eₙ₋₂ for n ≥ 3.</p>
<p>For n = 3:<br>
e₃ = e₂ + e₁ (by the recursive definition)<br>
= 2 + 1<br>
= 3 ✓</p>
<p>Therefore, e₃ = 3 by direct application of the recursive definition. ∎</p>`
        }
    ],
    direct: [
        {
            id: 'dir1',
            statement: 'Prove that if n is an even integer, then n² is even.',
            solution: `<p><strong>Proof:</strong></p>
<p>Assume n is an even integer.</p>
<p>By definition of even, there exists an integer k such that n = 2k.</p>
<p>Then:<br>
n² = (2k)²<br>
= 4k²<br>
= 2(2k²)</p>
<p>Since k is an integer, 2k² is also an integer. Let m = 2k².</p>
<p>Therefore, n² = 2m where m is an integer, which means n² is even by definition. ∎</p>`
        },
        {
            id: 'dir2',
            statement: 'Prove that if n is an odd integer, then n² is odd.',
            solution: `<p><strong>Proof:</strong></p>
<p>Assume n is an odd integer.</p>
<p>By definition of odd, there exists an integer k such that n = 2k + 1.</p>
<p>Then:<br>
n² = (2k + 1)²<br>
= 4k² + 4k + 1<br>
= 2(2k² + 2k) + 1</p>
<p>Since k is an integer, 2k² + 2k is also an integer. Let m = 2k² + 2k.</p>
<p>Therefore, n² = 2m + 1 where m is an integer, which means n² is odd by definition. ∎</p>`
        },
        {
            id: 'dir3',
            statement: 'Prove that the sum of two even integers is even.',
            solution: `<p><strong>Proof:</strong></p>
<p>Let a and b be even integers.</p>
<p>By definition of even, there exist integers j and k such that:<br>
a = 2j and b = 2k</p>
<p>Then:<br>
a + b = 2j + 2k<br>
= 2(j + k)</p>
<p>Since j and k are integers, j + k is also an integer. Let m = j + k.</p>
<p>Therefore, a + b = 2m where m is an integer, which means a + b is even. ∎</p>`
        },
        {
            id: 'dir4',
            statement: 'Prove that if x and y are both positive, then x + y is positive.',
            solution: `<p><strong>Proof:</strong></p>
<p>Assume x > 0 and y > 0.</p>
<p>By the properties of real numbers, if we add two positive numbers, the result is positive.</p>
<p>More formally: Since x > 0 and y > 0, we have:<br>
x + y > 0 + 0<br>
x + y > 0</p>
<p>Therefore, x + y is positive. ∎</p>`
        },
        {
            id: 'dir5',
            statement: 'Prove that if n is an integer and 3n + 2 is even, then n is even.',
            solution: `<p><strong>Proof:</strong></p>
<p>Assume 3n + 2 is even.</p>
<p>By definition of even, there exists an integer k such that:<br>
3n + 2 = 2k</p>
<p>Solving for n:<br>
3n = 2k - 2<br>
3n = 2(k - 1)<br>
n = (2(k - 1))/3</p>
<p>For n to be an integer, (k - 1) must be divisible by 3. Let k - 1 = 3m for some integer m.</p>
<p>Then:<br>
n = (2(3m))/3 = 2m</p>
<p>Since n = 2m where m is an integer, n is even by definition. ∎</p>`
        }
    ],
    contrapositive: [
        {
            id: 'con1',
            statement: 'Prove that if n² is odd, then n is odd.',
            solution: `<p><strong>Proof by Contrapositive:</strong></p>
<p>We will prove the contrapositive: If n is even, then n² is even.</p>
<p>Assume n is even. By definition, n = 2k for some integer k.</p>
<p>Then:<br>
n² = (2k)²<br>
= 4k²<br>
= 2(2k²)</p>
<p>Since k is an integer, 2k² is also an integer. Let m = 2k².</p>
<p>Therefore, n² = 2m where m is an integer, so n² is even.</p>
<p>We have proven the contrapositive (not odd → not odd for n implies not odd for n²), therefore the original statement is true: if n² is odd, then n is odd. ∎</p>`
        },
        {
            id: 'con2',
            statement: 'Prove that if 3n + 1 is even, then n is odd.',
            solution: `<p><strong>Proof by Contrapositive:</strong></p>
<p>We will prove the contrapositive: If n is even, then 3n + 1 is odd.</p>
<p>Assume n is even. By definition, n = 2k for some integer k.</p>
<p>Then:<br>
3n + 1 = 3(2k) + 1<br>
= 6k + 1<br>
= 2(3k) + 1</p>
<p>Since k is an integer, 3k is also an integer. Let m = 3k.</p>
<p>Therefore, 3n + 1 = 2m + 1 where m is an integer, so 3n + 1 is odd.</p>
<p>We have proven the contrapositive, therefore the original statement is true. ∎</p>`
        },
        {
            id: 'con3',
            statement: 'Prove that if n² is even, then n is even.',
            solution: `<p><strong>Proof by Contrapositive:</strong></p>
<p>We will prove the contrapositive: If n is odd, then n² is odd.</p>
<p>Assume n is odd. By definition, n = 2k + 1 for some integer k.</p>
<p>Then:<br>
n² = (2k + 1)²<br>
= 4k² + 4k + 1<br>
= 2(2k² + 2k) + 1</p>
<p>Since k is an integer, 2k² + 2k is also an integer. Let m = 2k² + 2k.</p>
<p>Therefore, n² = 2m + 1 where m is an integer, so n² is odd.</p>
<p>We have proven the contrapositive, therefore the original statement is true: if n² is even, then n is even. ∎</p>`
        },
        {
            id: 'con4',
            statement: 'Prove that if 7n + 4 is even, then n is even.',
            solution: `<p><strong>Proof by Contrapositive:</strong></p>
<p>We will prove the contrapositive: If n is odd, then 7n + 4 is odd.</p>
<p>Assume n is odd. By definition, n = 2k + 1 for some integer k.</p>
<p>Then:<br>
7n + 4 = 7(2k + 1) + 4<br>
= 14k + 7 + 4<br>
= 14k + 11<br>
= 2(7k + 5) + 1</p>
<p>Since k is an integer, 7k + 5 is also an integer. Let m = 7k + 5.</p>
<p>Therefore, 7n + 4 = 2m + 1 where m is an integer, so 7n + 4 is odd.</p>
<p>We have proven the contrapositive, therefore the original statement is true. ∎</p>`
        },
        {
            id: 'con5',
            statement: 'Prove that if the product xy is odd, then both x and y are odd.',
            solution: `<p><strong>Proof by Contrapositive:</strong></p>
<p>We will prove the contrapositive: If x is even or y is even, then xy is even.</p>
<p>Case 1: Assume x is even. By definition, x = 2k for some integer k.</p>
<p>Then:<br>
xy = (2k)y = 2(ky)</p>
<p>Since ky is an integer, xy is even.</p>
<p>Case 2: Assume y is even. By definition, y = 2m for some integer m.</p>
<p>Then:<br>
xy = x(2m) = 2(xm)</p>
<p>Since xm is an integer, xy is even.</p>
<p>In both cases, xy is even. We have proven the contrapositive, therefore the original statement is true. ∎</p>`
        }
    ],
    contradiction: [
        {
            id: 'cont1',
            statement: 'Prove that √2 is irrational.',
            solution: `<p><strong>Proof by Contradiction:</strong></p>
<p>Assume, for the sake of contradiction, that √2 is rational.</p>
<p>Then √2 = a/b where a and b are integers with no common factors (in lowest terms) and b ≠ 0.</p>
<p>Squaring both sides:<br>
2 = a²/b²<br>
2b² = a²</p>
<p>This means a² is even, which implies a is even (since the square of an odd number is odd).</p>
<p>Since a is even, we can write a = 2k for some integer k.</p>
<p>Substituting:<br>
2b² = (2k)²<br>
2b² = 4k²<br>
b² = 2k²</p>
<p>This means b² is even, which implies b is even.</p>
<p>But if both a and b are even, they have a common factor of 2, contradicting our assumption that a/b is in lowest terms.</p>
<p>Therefore, our assumption must be false, and √2 is irrational. ∎</p>`
        },
        {
            id: 'cont2',
            statement: 'Prove that there is no largest integer.',
            solution: `<p><strong>Proof by Contradiction:</strong></p>
<p>Assume, for the sake of contradiction, that there exists a largest integer N.</p>
<p>Consider the integer M = N + 1.</p>
<p>Since N is an integer, and 1 is an integer, M = N + 1 is also an integer (integers are closed under addition).</p>
<p>Furthermore, M = N + 1 > N.</p>
<p>This contradicts our assumption that N is the largest integer, since we found an integer M that is larger than N.</p>
<p>Therefore, our assumption must be false, and there is no largest integer. ∎</p>`
        },
        {
            id: 'cont3',
            statement: 'Prove that there are infinitely many prime numbers.',
            solution: `<p><strong>Proof by Contradiction:</strong></p>
<p>Assume, for the sake of contradiction, that there are only finitely many primes.</p>
<p>Let p₁, p₂, p₃, ..., pₙ be the complete list of all prime numbers.</p>
<p>Consider the number M = (p₁ · p₂ · p₃ · ... · pₙ) + 1.</p>
<p>M is larger than all the primes in our list. When we divide M by any prime pᵢ in our list, we get remainder 1.</p>
<p>This means M is not divisible by any of the primes in our list. Therefore, either:</p>
<p>1) M itself is prime, or<br>
2) M has a prime factor not in our list</p>
<p>In either case, we have found a prime not in our original list, contradicting the assumption that we had a complete list of all primes.</p>
<p>Therefore, there must be infinitely many prime numbers. ∎</p>`
        },
        {
            id: 'cont4',
            statement: 'Prove that if n² is divisible by 3, then n is divisible by 3.',
            solution: `<p><strong>Proof by Contradiction:</strong></p>
<p>Assume, for the sake of contradiction, that n² is divisible by 3 but n is not divisible by 3.</p>
<p>If n is not divisible by 3, then either n = 3k + 1 or n = 3k + 2 for some integer k.</p>
<p>Case 1: If n = 3k + 1, then:<br>
n² = (3k + 1)² = 9k² + 6k + 1 = 3(3k² + 2k) + 1</p>
<p>This means n² has remainder 1 when divided by 3, so n² is not divisible by 3.</p>
<p>Case 2: If n = 3k + 2, then:<br>
n² = (3k + 2)² = 9k² + 12k + 4 = 9k² + 12k + 3 + 1 = 3(3k² + 4k + 1) + 1</p>
<p>This means n² has remainder 1 when divided by 3, so n² is not divisible by 3.</p>
<p>In both cases, n² is not divisible by 3, contradicting our assumption.</p>
<p>Therefore, if n² is divisible by 3, then n must be divisible by 3. ∎</p>`
        },
        {
            id: 'cont5',
            statement: 'Prove that log₂(3) is irrational.',
            solution: `<p><strong>Proof by Contradiction:</strong></p>
<p>Assume, for the sake of contradiction, that log₂(3) is rational.</p>
<p>Then log₂(3) = p/q where p and q are integers with q ≠ 0.</p>
<p>By the definition of logarithm:<br>
2^(p/q) = 3<br>
Raising both sides to the power q:<br>
2^p = 3^q</p>
<p>The left side, 2^p, is even for any positive integer p (it has at least one factor of 2).</p>
<p>The right side, 3^q, is odd for any integer q (odd numbers raised to any power remain odd).</p>
<p>But an even number cannot equal an odd number, which is a contradiction.</p>
<p>Therefore, our assumption must be false, and log₂(3) is irrational. ∎</p>`
        }
    ],
    induction: [
        {
            id: 'ind1',
            statement: 'Prove that 1 + 2 + 3 + ... + n = n(n+1)/2 for all positive integers n.',
            solution: `<p><strong>Proof by Induction:</strong></p>
<p><strong>Base Case (n = 1):</strong><br>
Left side: 1<br>
Right side: 1(1+1)/2 = 1<br>
The formula holds for n = 1. ✓</p>
<p><strong>Inductive Hypothesis:</strong> Assume the formula holds for n = k, i.e.,<br>
1 + 2 + 3 + ... + k = k(k+1)/2</p>
<p><strong>Inductive Step:</strong> We need to prove it holds for n = k + 1.<br>
1 + 2 + 3 + ... + k + (k+1)<br>
= [1 + 2 + 3 + ... + k] + (k+1)<br>
= k(k+1)/2 + (k+1) (by inductive hypothesis)<br>
= k(k+1)/2 + 2(k+1)/2<br>
= (k(k+1) + 2(k+1))/2<br>
= (k+1)(k + 2)/2<br>
= (k+1)((k+1) + 1)/2 ✓</p>
<p>By the principle of mathematical induction, the formula holds for all positive integers n. ∎</p>`
        },
        {
            id: 'ind2',
            statement: 'Prove that 2ⁿ > n for all positive integers n.',
            solution: `<p><strong>Proof by Induction:</strong></p>
<p><strong>Base Case (n = 1):</strong><br>
2¹ = 2 > 1 ✓</p>
<p><strong>Inductive Hypothesis:</strong> Assume 2ᵏ > k for some positive integer k.</p>
<p><strong>Inductive Step:</strong> We need to prove 2^(k+1) > k + 1.<br>
2^(k+1) = 2 · 2ᵏ<br>
> 2 · k (by inductive hypothesis)<br>
= k + k</p>
<p>Since k ≥ 1, we have k ≥ 1, so:<br>
k + k ≥ k + 1</p>
<p>Therefore:<br>
2^(k+1) > k + k ≥ k + 1<br>
2^(k+1) > k + 1 ✓</p>
<p>By the principle of mathematical induction, 2ⁿ > n for all positive integers n. ∎</p>`
        },
        {
            id: 'ind3',
            statement: 'Prove that 1² + 2² + 3² + ... + n² = n(n+1)(2n+1)/6 for all positive integers n.',
            solution: `<p><strong>Proof by Induction:</strong></p>
<p><strong>Base Case (n = 1):</strong><br>
Left side: 1² = 1<br>
Right side: 1(2)(3)/6 = 1<br>
The formula holds for n = 1. ✓</p>
<p><strong>Inductive Hypothesis:</strong> Assume the formula holds for n = k, i.e.,<br>
1² + 2² + ... + k² = k(k+1)(2k+1)/6</p>
<p><strong>Inductive Step:</strong> We need to prove it holds for n = k + 1.<br>
1² + 2² + ... + k² + (k+1)²<br>
= k(k+1)(2k+1)/6 + (k+1)² (by inductive hypothesis)<br>
= (k+1)[k(2k+1)/6 + (k+1)]<br>
= (k+1)[k(2k+1) + 6(k+1)]/6<br>
= (k+1)[2k² + k + 6k + 6]/6<br>
= (k+1)[2k² + 7k + 6]/6<br>
= (k+1)(k+2)(2k+3)/6<br>
= (k+1)((k+1)+1)(2(k+1)+1)/6 ✓</p>
<p>By the principle of mathematical induction, the formula holds for all positive integers n. ∎</p>`
        },
        {
            id: 'ind4',
            statement: 'Prove that n! > 2ⁿ for all integers n ≥ 4.',
            solution: `<p><strong>Proof by Induction:</strong></p>
<p><strong>Base Case (n = 4):</strong><br>
4! = 24<br>
2⁴ = 16<br>
24 > 16 ✓</p>
<p><strong>Inductive Hypothesis:</strong> Assume k! > 2ᵏ for some integer k ≥ 4.</p>
<p><strong>Inductive Step:</strong> We need to prove (k+1)! > 2^(k+1).<br>
(k+1)! = (k+1) · k!<br>
> (k+1) · 2ᵏ (by inductive hypothesis)</p>
<p>Since k ≥ 4, we have k + 1 ≥ 5 > 2, so:<br>
(k+1) · 2ᵏ > 2 · 2ᵏ = 2^(k+1)</p>
<p>Therefore:<br>
(k+1)! > 2^(k+1) ✓</p>
<p>By the principle of mathematical induction, n! > 2ⁿ for all integers n ≥ 4. ∎</p>`
        },
        {
            id: 'ind5',
            statement: 'Prove that 3 divides n³ - n for all positive integers n.',
            solution: `<p><strong>Proof by Induction:</strong></p>
<p><strong>Base Case (n = 1):</strong><br>
1³ - 1 = 0, and 3 divides 0. ✓</p>
<p><strong>Inductive Hypothesis:</strong> Assume 3 divides k³ - k for some positive integer k.</p>
<p><strong>Inductive Step:</strong> We need to prove 3 divides (k+1)³ - (k+1).<br>
(k+1)³ - (k+1) = k³ + 3k² + 3k + 1 - k - 1<br>
= k³ - k + 3k² + 3k<br>
= (k³ - k) + 3(k² + k)</p>
<p>By the inductive hypothesis, 3 divides k³ - k.<br>
Also, 3 clearly divides 3(k² + k).</p>
<p>Since 3 divides both terms, 3 divides their sum: (k+1)³ - (k+1). ✓</p>
<p>By the principle of mathematical induction, 3 divides n³ - n for all positive integers n. ∎</p>`
        }
    ]
};

// Practice Tests - Each test has one problem of each type
const practiceTests = [
    {
        id: 1,
        name: 'Practice Test 1',
        problems: [
            { type: 'recursive', problem: problems.recursive[0] },
            { type: 'direct', problem: problems.direct[0] },
            { type: 'contrapositive', problem: problems.contrapositive[0] },
            { type: 'contradiction', problem: problems.contradiction[0] },
            { type: 'induction', problem: problems.induction[0] }
        ]
    },
    {
        id: 2,
        name: 'Practice Test 2',
        problems: [
            { type: 'recursive', problem: problems.recursive[1] },
            { type: 'direct', problem: problems.direct[1] },
            { type: 'contrapositive', problem: problems.contrapositive[1] },
            { type: 'contradiction', problem: problems.contradiction[1] },
            { type: 'induction', problem: problems.induction[1] }
        ]
    },
    {
        id: 3,
        name: 'Practice Test 3',
        problems: [
            { type: 'recursive', problem: problems.recursive[2] },
            { type: 'direct', problem: problems.direct[2] },
            { type: 'contrapositive', problem: problems.contrapositive[2] },
            { type: 'contradiction', problem: problems.contradiction[2] },
            { type: 'induction', problem: problems.induction[2] }
        ]
    },
    {
        id: 4,
        name: 'Practice Test 4',
        problems: [
            { type: 'recursive', problem: problems.recursive[3] },
            { type: 'direct', problem: problems.direct[3] },
            { type: 'contrapositive', problem: problems.contrapositive[3] },
            { type: 'contradiction', problem: problems.contradiction[3] },
            { type: 'induction', problem: problems.induction[3] }
        ]
    },
    {
        id: 5,
        name: 'Practice Test 5',
        problems: [
            { type: 'recursive', problem: problems.recursive[4] },
            { type: 'direct', problem: problems.direct[4] },
            { type: 'contrapositive', problem: problems.contrapositive[4] },
            { type: 'contradiction', problem: problems.contradiction[4] },
            { type: 'induction', problem: problems.induction[4] }
        ]
    }
];

// State
let currentScreen = 'home';
let currentProofType = '';
let currentTest = null;
let currentProblemIndex = 0;
let showingSolution = false;
let individualProblem = null;

// Proof type names
const proofTypeNames = {
    recursive: 'Recursive Proofs',
    direct: 'Direct Proofs',
    contrapositive: 'Contrapositive Proofs',
    contradiction: 'Proof by Contradiction',
    induction: 'Proof by Induction'
};

// Navigation functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function goHome() {
    currentScreen = 'home';
    showScreen('homeScreen');
}

function showProofType(type) {
    currentProofType = type;
    currentScreen = 'proofType';
    
    document.getElementById('proofTypeTitle').textContent = proofTypeNames[type];
    
    const problemsDiv = document.getElementById('proofTypeProblems');
    problemsDiv.innerHTML = '';
    
    problems[type].forEach((problem, index) => {
        const div = document.createElement('div');
        div.className = 'problem-item';
        div.innerHTML = `<h3>Problem ${index + 1}</h3><p>${problem.statement}</p>`;
        div.onclick = () => showIndividualProblem(type, index);
        problemsDiv.appendChild(div);
    });
    
    showScreen('proofTypeScreen');
}

function showIndividualProblem(type, index) {
    individualProblem = { type, index };
    const problem = problems[type][index];
    
    document.getElementById('individualProofTitle').textContent = 
        `${proofTypeNames[type]} - Problem ${index + 1}`;
    
    document.getElementById('individualProblemContent').innerHTML = `
        <div class="problem-statement">
            <h3>Problem:</h3>
            <div class="problem-text">${problem.statement}</div>
        </div>
        <div class="solution" id="individualSolution">
            <h3>Solution:</h3>
            <div class="solution-text">${problem.solution}</div>
        </div>
    `;
    
    document.getElementById('individualSolutionBtn').textContent = 'Show Solution';
    document.getElementById('individualSolution').classList.remove('active');
    
    showScreen('problemScreen');
}

function toggleIndividualSolution() {
    const solutionDiv = document.getElementById('individualSolution');
    const btn = document.getElementById('individualSolutionBtn');
    
    if (solutionDiv.classList.contains('active')) {
        solutionDiv.classList.remove('active');
        btn.textContent = 'Show Solution';
        btn.classList.remove('hide');
    } else {
        solutionDiv.classList.add('active');
        btn.textContent = 'Hide Solution';
        btn.classList.add('hide');
    }
}

function backToProofType() {
    showProofType(currentProofType);
}

function startTest(testNumber) {
    currentTest = practiceTests[testNumber - 1];
    currentProblemIndex = 0;
    showingSolution = false;
    
    document.getElementById('testTitle').textContent = currentTest.name;
    document.getElementById('totalProblems').textContent = currentTest.problems.length;
    
    displayCurrentProblem();
    showScreen('testScreen');
}

function displayCurrentProblem() {
    const problemData = currentTest.problems[currentProblemIndex];
    const problem = problemData.problem;
    
    document.getElementById('currentProblem').textContent = currentProblemIndex + 1;
    document.getElementById('currentProofType').textContent = proofTypeNames[problemData.type];
    
    document.getElementById('problemContent').innerHTML = `
        <div class="problem-statement">
            <h3>Problem:</h3>
            <div class="problem-text">${problem.statement}</div>
        </div>
        <div class="solution" id="solution">
            <h3>Solution:</h3>
            <div class="solution-text">${problem.solution}</div>
        </div>
    `;
    
    // Reset solution visibility
    showingSolution = false;
    document.getElementById('solution').classList.remove('active');
    document.getElementById('solutionBtn').textContent = 'Show Solution';
    document.getElementById('solutionBtn').classList.remove('hide');
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = currentProblemIndex === 0;
    document.getElementById('nextBtn').disabled = currentProblemIndex === currentTest.problems.length - 1;
}

function toggleSolution() {
    const solutionDiv = document.getElementById('solution');
    const btn = document.getElementById('solutionBtn');
    
    showingSolution = !showingSolution;
    
    if (showingSolution) {
        solutionDiv.classList.add('active');
        btn.textContent = 'Hide Solution';
        btn.classList.add('hide');
    } else {
        solutionDiv.classList.remove('active');
        btn.textContent = 'Show Solution';
        btn.classList.remove('hide');
    }
}

function previousProblem() {
    if (currentProblemIndex > 0) {
        currentProblemIndex--;
        displayCurrentProblem();
    }
}

function nextProblem() {
    if (currentProblemIndex < currentTest.problems.length - 1) {
        currentProblemIndex++;
        displayCurrentProblem();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showScreen('homeScreen');
});
