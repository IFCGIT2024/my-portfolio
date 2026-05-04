// Proof steps broken down for ordering exercises
const proofSteps = {
    recursive: [
        {
            problem: 'Let the sequence {aₙ} be defined recursively by a₁ = 2 and aₙ = 2aₙ₋₁ for n ≥ 2. Prove that aₙ = 2ⁿ for all positive integers n.',
            difficulty: 'easy',
            steps: [
                'We will prove this using the recursive definition.',
                'Base Case: For n = 1, a₁ = 2 = 2¹ ✓',
                'Recursive Step: Assume aₖ = 2ᵏ for some k ≥ 1.',
                'Then for n = k + 1: aₖ₊₁ = 2aₖ (by the recursive definition)',
                'Substituting our assumption: aₖ₊₁ = 2(2ᵏ) = 2ᵏ⁺¹ ✓',
                'Therefore, aₙ = 2ⁿ for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Let the sequence {bₙ} be defined recursively by b₁ = 3 and bₙ = bₙ₋₁ + 4 for n ≥ 2. Prove that bₙ = 4n - 1 for all positive integers n.',
            difficulty: 'easy',
            steps: [
                'We will prove this using the recursive definition.',
                'Base Case: For n = 1, b₁ = 3 = 4(1) - 1 = 3 ✓',
                'Recursive Step: Assume bₖ = 4k - 1 for some k ≥ 1.',
                'Then for n = k + 1: bₖ₊₁ = bₖ + 4 (by the recursive definition)',
                'Substituting: bₖ₊₁ = (4k - 1) + 4 = 4k + 3 = 4(k + 1) - 1 ✓',
                'Therefore, bₙ = 4n - 1 for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Let the sequence {cₙ} be defined recursively by c₁ = 1 and cₙ = 3cₙ₋₁ for n ≥ 2. Prove that cₙ = 3ⁿ⁻¹ for all positive integers n.',
            difficulty: 'easy',
            steps: [
                'We will prove this using the recursive definition.',
                'Base Case: For n = 1, c₁ = 1 = 3¹⁻¹ = 3⁰ = 1 ✓',
                'Recursive Step: Assume cₖ = 3ᵏ⁻¹ for some k ≥ 1.',
                'Then for n = k + 1: cₖ₊₁ = 3cₖ (by the recursive definition)',
                'Substituting: cₖ₊₁ = 3(3ᵏ⁻¹) = 3ᵏ = 3⁽ᵏ⁺¹⁾⁻¹ ✓',
                'Therefore, cₙ = 3ⁿ⁻¹ for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Let the sequence {dₙ} be defined recursively by d₁ = 5 and dₙ = dₙ₋₁ + 2 for n ≥ 2. Prove that dₙ = 2n + 3 for all positive integers n.',
            difficulty: 'easy',
            steps: [
                'We will prove this using the recursive definition.',
                'Base Case: For n = 1, d₁ = 5 = 2(1) + 3 = 5 ✓',
                'Recursive Step: Assume dₖ = 2k + 3 for some k ≥ 1.',
                'Then for n = k + 1: dₖ₊₁ = dₖ + 2 (by the recursive definition)',
                'Substituting: dₖ₊₁ = (2k + 3) + 2 = 2k + 5 = 2(k + 1) + 3 ✓',
                'Therefore, dₙ = 2n + 3 for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Let the sequence {eₙ} be defined recursively by e₁ = 1, e₂ = 2, and eₙ = eₙ₋₁ + eₙ₋₂ for n ≥ 3. Prove that e₃ = 3.',
            difficulty: 'easy',
            steps: [
                'Given: e₁ = 1, e₂ = 2, and eₙ = eₙ₋₁ + eₙ₋₂ for n ≥ 3.',
                'For n = 3: e₃ = e₂ + e₁ (by the recursive definition)',
                'Substituting the given values: e₃ = 2 + 1 = 3 ✓',
                'Therefore, e₃ = 3 by direct application of the recursive definition. ∎'
            ]
        },
        {
            problem: 'Let the sequence {fₙ} be defined recursively by f₁ = 1 and fₙ = fₙ₋₁ + 2n - 1 for n ≥ 2. Prove that fₙ = n² for all positive integers n.',
            difficulty: 'medium',
            steps: [
                'We will prove this using the recursive definition.',
                'Base Case: For n = 1, f₁ = 1 = 1² ✓',
                'Recursive Step: Assume fₖ = k² for some k ≥ 1.',
                'Then for n = k + 1: fₖ₊₁ = fₖ + 2(k+1) - 1 (by the recursive definition)',
                'Substituting: fₖ₊₁ = k² + 2k + 2 - 1 = k² + 2k + 1',
                'Factoring: fₖ₊₁ = (k + 1)² ✓',
                'Therefore, fₙ = n² for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Let the sequence {gₙ} be defined recursively by g₁ = 3, g₂ = 5, and gₙ = 3gₙ₋₁ - 2gₙ₋₂ for n ≥ 3. Prove that gₙ = 2ⁿ + 1 for all positive integers n.',
            difficulty: 'hard',
            steps: [
                'We will use strong induction with the recursive definition.',
                'Base Case (n = 1): g₁ = 3 = 2¹ + 1 ✓',
                'Base Case (n = 2): g₂ = 5 = 2² + 1 ✓',
                'Inductive Step: Assume gⱼ = 2ʲ + 1 for all j ≤ k where k ≥ 2.',
                'Then for n = k + 1: gₖ₊₁ = 3gₖ - 2gₖ₋₁ (by the recursive definition)',
                'Substituting our assumptions: gₖ₊₁ = 3(2ᵏ + 1) - 2(2ᵏ⁻¹ + 1)',
                'Expanding: = 3·2ᵏ + 3 - 2·2ᵏ⁻¹ - 2 = 3·2ᵏ - 2ᵏ + 1',
                'Simplifying: = 2ᵏ(3 - 1) + 1 = 2ᵏ·2 + 1 = 2ᵏ⁺¹ + 1 ✓',
                'Therefore, gₙ = 2ⁿ + 1 for all positive integers n. ∎'
            ]
        }
    ],
    direct: [
        {
            problem: 'Prove that if n is an even integer, then n² is even.',
            difficulty: 'easy',
            steps: [
                'Assume n is an even integer.',
                'By definition of even, there exists an integer k such that n = 2k.',
                'Then n² = (2k)² = 4k² = 2(2k²)',
                'Since k is an integer, 2k² is also an integer. Let m = 2k².',
                'Therefore, n² = 2m where m is an integer, which means n² is even by definition. ∎'
            ]
        },
        {
            problem: 'Prove that if n is an odd integer, then n² is odd.',
            difficulty: 'easy',
            steps: [
                'Assume n is an odd integer.',
                'By definition of odd, there exists an integer k such that n = 2k + 1.',
                'Then n² = (2k + 1)² = 4k² + 4k + 1 = 2(2k² + 2k) + 1',
                'Since k is an integer, 2k² + 2k is also an integer. Let m = 2k² + 2k.',
                'Therefore, n² = 2m + 1 where m is an integer, which means n² is odd by definition. ∎'
            ]
        },
        {
            problem: 'Prove that the sum of two even integers is even.',
            difficulty: 'easy',
            steps: [
                'Let a and b be even integers.',
                'By definition of even, there exist integers j and k such that a = 2j and b = 2k.',
                'Then a + b = 2j + 2k = 2(j + k)',
                'Since j and k are integers, j + k is also an integer. Let m = j + k.',
                'Therefore, a + b = 2m where m is an integer, which means a + b is even. ∎'
            ]
        },
        {
            problem: 'Prove that if x and y are both positive, then x + y is positive.',
            difficulty: 'easy',
            steps: [
                'Assume x > 0 and y > 0.',
                'By the properties of real numbers, if we add two positive numbers, the result is positive.',
                'More formally: Since x > 0 and y > 0, we have x + y > 0 + 0',
                'Therefore, x + y > 0, which means x + y is positive. ∎'
            ]
        },
        {
            problem: 'Prove that if n is an integer and 3n + 2 is even, then n is even.',
            difficulty: 'easy',
            steps: [
                'Assume 3n + 2 is even.',
                'By definition of even, there exists an integer k such that 3n + 2 = 2k.',
                'Solving for n: 3n = 2k - 2 = 2(k - 1)',
                'Therefore n = 2(k - 1)/3.',
                'For n to be an integer, (k - 1) must be divisible by 3. Let k - 1 = 3m for some integer m.',
                'Then n = 2(3m)/3 = 2m.',
                'Since n = 2m where m is an integer, n is even by definition. ∎'
            ]
        },
        {
            problem: 'Prove that the product of two odd integers is odd.',
            difficulty: 'medium',
            steps: [
                'Let a and b be odd integers.',
                'By definition of odd, there exist integers j and k such that a = 2j + 1 and b = 2k + 1.',
                'Then ab = (2j + 1)(2k + 1)',
                'Expanding: ab = 4jk + 2j + 2k + 1',
                'Factoring: ab = 2(2jk + j + k) + 1',
                'Since j and k are integers, 2jk + j + k is also an integer. Let m = 2jk + j + k.',
                'Therefore, ab = 2m + 1 where m is an integer, which means ab is odd. ∎'
            ]
        },
        {
            problem: 'Prove that if a and b are integers where a divides b and b divides c, then a divides c.',
            difficulty: 'medium',
            steps: [
                'Assume a divides b and b divides c.',
                'By definition of divides, there exist integers j and k such that b = aj and c = bk.',
                'Substituting the first equation into the second: c = (aj)k = a(jk)',
                'Since j and k are integers, jk is also an integer. Let m = jk.',
                'Therefore, c = am where m is an integer, which means a divides c by definition. ∎'
            ]
        },
        {
            problem: 'Prove that for any integer n, the number n(n+1) is even.',
            difficulty: 'hard',
            steps: [
                'Let n be any integer. Then n is either even or odd.',
                'Case 1: Suppose n is even. Then n = 2k for some integer k.',
                'So n(n+1) = 2k(2k+1) = 2[k(2k+1)], which is even.',
                'Case 2: Suppose n is odd. Then n = 2k+1 for some integer k.',
                'So n+1 = (2k+1)+1 = 2k+2 = 2(k+1), which is even.',
                'Therefore n(n+1) = (2k+1)·2(k+1) = 2[(2k+1)(k+1)], which is even.',
                'In both cases, n(n+1) is even. ∎'
            ]
        }
    ],
    contrapositive: [
        {
            problem: 'Prove that if n² is odd, then n is odd.',
            difficulty: 'easy',
            steps: [
                'We will prove the contrapositive: If n is even, then n² is even.',
                'Assume n is even. By definition, n = 2k for some integer k.',
                'Then n² = (2k)² = 4k² = 2(2k²)',
                'Since k is an integer, 2k² is also an integer. Let m = 2k².',
                'Therefore, n² = 2m where m is an integer, so n² is even.',
                'We have proven the contrapositive, therefore the original statement is true. ∎'
            ]
        },
        {
            problem: 'Prove that if 3n + 1 is even, then n is odd.',
            difficulty: 'easy',
            steps: [
                'We will prove the contrapositive: If n is even, then 3n + 1 is odd.',
                'Assume n is even. By definition, n = 2k for some integer k.',
                'Then 3n + 1 = 3(2k) + 1 = 6k + 1 = 2(3k) + 1',
                'Since k is an integer, 3k is also an integer. Let m = 3k.',
                'Therefore, 3n + 1 = 2m + 1 where m is an integer, so 3n + 1 is odd.',
                'We have proven the contrapositive, therefore the original statement is true. ∎'
            ]
        },
        {
            problem: 'Prove that if n² is even, then n is even.',
            difficulty: 'easy',
            steps: [
                'We will prove the contrapositive: If n is odd, then n² is odd.',
                'Assume n is odd. By definition, n = 2k + 1 for some integer k.',
                'Then n² = (2k + 1)² = 4k² + 4k + 1 = 2(2k² + 2k) + 1',
                'Since k is an integer, 2k² + 2k is also an integer. Let m = 2k² + 2k.',
                'Therefore, n² = 2m + 1 where m is an integer, so n² is odd.',
                'We have proven the contrapositive, therefore the original statement is true. ∎'
            ]
        },
        {
            problem: 'Prove that if 7n + 4 is even, then n is even.',
            difficulty: 'easy',
            steps: [
                'We will prove the contrapositive: If n is odd, then 7n + 4 is odd.',
                'Assume n is odd. By definition, n = 2k + 1 for some integer k.',
                'Then 7n + 4 = 7(2k + 1) + 4 = 14k + 7 + 4 = 14k + 11',
                'Rewriting: 14k + 11 = 2(7k + 5) + 1',
                'Since k is an integer, 7k + 5 is also an integer. Let m = 7k + 5.',
                'Therefore, 7n + 4 = 2m + 1 where m is an integer, so 7n + 4 is odd.',
                'We have proven the contrapositive, therefore the original statement is true. ∎'
            ]
        },
        {
            problem: 'Prove that if the product xy is odd, then both x and y are odd.',
            difficulty: 'medium',
            steps: [
                'We will prove the contrapositive: If x is even or y is even, then xy is even.',
                'Case 1: Assume x is even. By definition, x = 2k for some integer k.',
                'Then xy = (2k)y = 2(ky)',
                'Since ky is an integer, xy is even.',
                'Case 2: Assume y is even. By definition, y = 2m for some integer m.',
                'Then xy = x(2m) = 2(xm)',
                'Since xm is an integer, xy is even.',
                'In both cases, xy is even. We have proven the contrapositive, therefore the original statement is true. ∎'
            ]
        },
        {
            problem: 'Prove that if n³ is even, then n is even.',
            difficulty: 'medium',
            steps: [
                'We will prove the contrapositive: If n is odd, then n³ is odd.',
                'Assume n is odd. By definition, n = 2k + 1 for some integer k.',
                'Then n³ = (2k + 1)³',
                'Expanding: n³ = 8k³ + 12k² + 6k + 1',
                'Factoring: n³ = 2(4k³ + 6k² + 3k) + 1',
                'Since k is an integer, 4k³ + 6k² + 3k is also an integer. Let m = 4k³ + 6k² + 3k.',
                'Therefore, n³ = 2m + 1 where m is an integer, so n³ is odd.',
                'We have proven the contrapositive, therefore the original statement is true. ∎'
            ]
        },
        {
            problem: 'Prove that if a² is not divisible by 4, then a is odd.',
            difficulty: 'hard',
            steps: [
                'We will prove the contrapositive: If a is even, then a² is divisible by 4.',
                'Assume a is even. By definition, a = 2k for some integer k.',
                'Then a² = (2k)² = 4k²',
                'Since k² is an integer, a² = 4k² shows that 4 divides a².',
                'We have proven the contrapositive, therefore the original statement is true. ∎'
            ]
        }
    ],
    contradiction: [
        {
            problem: 'Prove that √2 is irrational.',
            difficulty: 'medium',
            steps: [
                'Assume, for the sake of contradiction, that √2 is rational.',
                'Then √2 = a/b where a and b are integers with no common factors (lowest terms) and b ≠ 0.',
                'Squaring both sides: 2 = a²/b², so 2b² = a²',
                'This means a² is even, which implies a is even. So a = 2k for some integer k.',
                'Substituting: 2b² = (2k)² = 4k², so b² = 2k²',
                'This means b² is even, which implies b is even.',
                'But if both a and b are even, they have a common factor of 2, contradicting our assumption.',
                'Therefore, our assumption must be false, and √2 is irrational. ∎'
            ]
        },
        {
            problem: 'Prove that there is no largest integer.',
            difficulty: 'easy',
            steps: [
                'Assume, for the sake of contradiction, that there exists a largest integer N.',
                'Consider the integer M = N + 1.',
                'Since N is an integer and 1 is an integer, M = N + 1 is also an integer.',
                'Furthermore, M = N + 1 > N.',
                'This contradicts our assumption that N is the largest integer.',
                'Therefore, our assumption must be false, and there is no largest integer. ∎'
            ]
        },
        {
            problem: 'Prove that if n² is divisible by 3, then n is divisible by 3.',
            difficulty: 'medium',
            steps: [
                'Assume, for the sake of contradiction, that n² is divisible by 3 but n is not divisible by 3.',
                'If n is not divisible by 3, then either n = 3k + 1 or n = 3k + 2 for some integer k.',
                'Case 1: If n = 3k + 1, then n² = (3k + 1)² = 9k² + 6k + 1 = 3(3k² + 2k) + 1',
                'This means n² has remainder 1 when divided by 3, so n² is not divisible by 3.',
                'Case 2: If n = 3k + 2, then n² = (3k + 2)² = 9k² + 12k + 4 = 3(3k² + 4k + 1) + 1',
                'This means n² has remainder 1 when divided by 3, so n² is not divisible by 3.',
                'In both cases, n² is not divisible by 3, contradicting our assumption.',
                'Therefore, if n² is divisible by 3, then n must be divisible by 3. ∎'
            ]
        },
        {
            problem: 'Prove that there are infinitely many prime numbers.',
            difficulty: 'hard',
            steps: [
                'Assume, for the sake of contradiction, that there are only finitely many primes.',
                'Let p₁, p₂, p₃, ..., pₙ be the complete list of all prime numbers.',
                'Consider the number M = (p₁ · p₂ · p₃ · ... · pₙ) + 1.',
                'M is larger than all the primes in our list.',
                'When we divide M by any prime pᵢ in our list, we get remainder 1.',
                'This means M is not divisible by any of the primes in our list.',
                'Therefore, either M itself is prime, or M has a prime factor not in our list.',
                'In either case, we have found a prime not in our original list, contradicting the assumption.',
                'Therefore, there must be infinitely many prime numbers. ∎'
            ]
        },
        {
            problem: 'Prove that log₂(3) is irrational.',
            difficulty: 'hard',
            steps: [
                'Assume, for the sake of contradiction, that log₂(3) is rational.',
                'Then log₂(3) = p/q where p and q are integers with q ≠ 0.',
                'By the definition of logarithm: 2^(p/q) = 3',
                'Raising both sides to the power q: 2^p = 3^q',
                'The left side, 2^p, is even for any positive integer p (it has at least one factor of 2).',
                'The right side, 3^q, is odd for any integer q (odd numbers raised to any power remain odd).',
                'But an even number cannot equal an odd number, which is a contradiction.',
                'Therefore, our assumption must be false, and log₂(3) is irrational. ∎'
            ]
        },
        {
            problem: 'Prove that there is no smallest positive rational number.',
            difficulty: 'medium',
            steps: [
                'Assume, for the sake of contradiction, that there exists a smallest positive rational number r.',
                'Since r is positive, we have r > 0.',
                'Consider the rational number s = r/2.',
                'Since r is rational, and 2 is rational, s = r/2 is also rational (rationals are closed under division).',
                'Furthermore, s = r/2 < r and s > 0.',
                'This means s is a positive rational number smaller than r, contradicting our assumption.',
                'Therefore, there is no smallest positive rational number. ∎'
            ]
        }
    ],
    induction: [
        {
            problem: 'Prove that 1 + 2 + 3 + ... + n = n(n+1)/2 for all positive integers n.',            difficulty: 'easy',            steps: [
                'We will use mathematical induction.',
                'Base Case (n = 1): Left side = 1, Right side = 1(1+1)/2 = 1 ✓',
                'Inductive Hypothesis: Assume 1 + 2 + 3 + ... + k = k(k+1)/2 for some k ≥ 1.',
                'Inductive Step: We need to prove it holds for n = k + 1.',
                'Consider 1 + 2 + ... + k + (k+1) = [1 + 2 + ... + k] + (k+1)',
                'By the inductive hypothesis: = k(k+1)/2 + (k+1) = k(k+1)/2 + 2(k+1)/2',
                'Simplifying: = (k(k+1) + 2(k+1))/2 = (k+1)(k+2)/2 = (k+1)((k+1)+1)/2 ✓',
                'By the principle of mathematical induction, the formula holds for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Prove that 2ⁿ > n for all positive integers n.',
            difficulty: 'easy',
            steps: [
                'We will use mathematical induction.',
                'Base Case (n = 1): 2¹ = 2 > 1 ✓',
                'Inductive Hypothesis: Assume 2ᵏ > k for some positive integer k.',
                'Inductive Step: We need to prove 2^(k+1) > k + 1.',
                'We have 2^(k+1) = 2 · 2ᵏ',
                'By the inductive hypothesis: 2^(k+1) > 2 · k = k + k',
                'Since k ≥ 1, we have k ≥ 1, so k + k ≥ k + 1',
                'Therefore, 2^(k+1) > k + k ≥ k + 1, so 2^(k+1) > k + 1 ✓',
                'By the principle of mathematical induction, 2ⁿ > n for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Prove that 1² + 2² + 3² + ... + n² = n(n+1)(2n+1)/6 for all positive integers n.',
            difficulty: 'medium',
            steps: [
                'We will use mathematical induction.',
                'Base Case (n = 1): Left side = 1² = 1, Right side = 1(2)(3)/6 = 1 ✓',
                'Inductive Hypothesis: Assume 1² + 2² + ... + k² = k(k+1)(2k+1)/6 for some k ≥ 1.',
                'Inductive Step: We need to prove it holds for n = k + 1.',
                'Consider 1² + 2² + ... + k² + (k+1)² = k(k+1)(2k+1)/6 + (k+1)² (by inductive hypothesis)',
                'Factor out (k+1): = (k+1)[k(2k+1)/6 + (k+1)] = (k+1)[k(2k+1) + 6(k+1)]/6',
                'Expand: = (k+1)[2k² + k + 6k + 6]/6 = (k+1)[2k² + 7k + 6]/6',
                'Factor the quadratic: = (k+1)(k+2)(2k+3)/6 = (k+1)((k+1)+1)(2(k+1)+1)/6 ✓',
                'By the principle of mathematical induction, the formula holds for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Prove that n! > 2ⁿ for all integers n ≥ 4.',
            difficulty: 'medium',
            steps: [
                'We will use mathematical induction.',
                'Base Case (n = 4): 4! = 24 and 2⁴ = 16, so 24 > 16 ✓',
                'Inductive Hypothesis: Assume k! > 2ᵏ for some integer k ≥ 4.',
                'Inductive Step: We need to prove (k+1)! > 2^(k+1).',
                'We have (k+1)! = (k+1) · k!',
                'By the inductive hypothesis: (k+1)! > (k+1) · 2ᵏ',
                'Since k ≥ 4, we have k + 1 ≥ 5 > 2, so (k+1) · 2ᵏ > 2 · 2ᵏ = 2^(k+1)',
                'Therefore, (k+1)! > 2^(k+1) ✓',
                'By the principle of mathematical induction, n! > 2ⁿ for all integers n ≥ 4. ∎'
            ]
        },
        {
            problem: 'Prove that 3 divides n³ - n for all positive integers n.',
            difficulty: 'easy',
            steps: [
                'We will use mathematical induction.',
                'Base Case (n = 1): 1³ - 1 = 0, and 3 divides 0 ✓',
                'Inductive Hypothesis: Assume 3 divides k³ - k for some positive integer k.',
                'Inductive Step: We need to prove 3 divides (k+1)³ - (k+1).',
                'Expand: (k+1)³ - (k+1) = k³ + 3k² + 3k + 1 - k - 1',
                'Simplify: = k³ - k + 3k² + 3k = (k³ - k) + 3(k² + k)',
                'By the inductive hypothesis, 3 divides k³ - k, and clearly 3 divides 3(k² + k).',
                'Since 3 divides both terms, 3 divides their sum: (k+1)³ - (k+1) ✓',
                'By the principle of mathematical induction, 3 divides n³ - n for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Prove that 1 + 3 + 5 + ... + (2n-1) = n² for all positive integers n.',
            difficulty: 'medium',
            steps: [
                'We will use mathematical induction.',
                'Base Case (n = 1): Left side = 1, Right side = 1² = 1 ✓',
                'Inductive Hypothesis: Assume 1 + 3 + 5 + ... + (2k-1) = k² for some k ≥ 1.',
                'Inductive Step: We need to prove it holds for n = k + 1.',
                'The next odd number is 2(k+1) - 1 = 2k + 1.',
                'Consider 1 + 3 + ... + (2k-1) + (2k+1) = k² + (2k+1) (by inductive hypothesis)',
                'Simplify: = k² + 2k + 1 = (k+1)² ✓',
                'By the principle of mathematical induction, the formula holds for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Prove that n³ - n is divisible by 6 for all positive integers n.',
            difficulty: 'hard',
            steps: [
                'We will use mathematical induction.',
                'Base Case (n = 1): 1³ - 1 = 0, and 6 divides 0 ✓',
                'Inductive Hypothesis: Assume 6 divides k³ - k for some positive integer k.',
                'Inductive Step: We need to prove 6 divides (k+1)³ - (k+1).',
                'Expand: (k+1)³ - (k+1) = k³ + 3k² + 3k + 1 - k - 1 = k³ + 3k² + 2k',
                'Rewrite: = (k³ - k) + 3k² + 3k = (k³ - k) + 3k(k + 1)',
                'By the inductive hypothesis, 6 divides k³ - k.',
                'Note that k(k+1) is the product of consecutive integers, so one is even, making k(k+1) even.',
                'Therefore 3k(k+1) is divisible by 6 (it has factors of both 2 and 3).',
                'Since 6 divides both k³ - k and 3k(k+1), it divides their sum: (k+1)³ - (k+1) ✓',
                'By the principle of mathematical induction, 6 divides n³ - n for all positive integers n. ∎'
            ]
        },
        {
            problem: 'Prove that 2ⁿ < n! for all integers n ≥ 4.',
            difficulty: 'hard',
            steps: [
                'We will use mathematical induction.',
                'Base Case (n = 4): 2⁴ = 16 and 4! = 24, so 16 < 24 ✓',
                'Inductive Hypothesis: Assume 2ᵏ < k! for some integer k ≥ 4.',
                'Inductive Step: We need to prove 2^(k+1) < (k+1)!',
                'We have 2^(k+1) = 2 · 2ᵏ',
                'By the inductive hypothesis: 2 · 2ᵏ < 2 · k!',
                'Since k ≥ 4, we have k + 1 ≥ 5 > 2, so 2 · k! < (k+1) · k! = (k+1)!',
                'Therefore, 2^(k+1) < 2 · k! < (k+1)!, so 2^(k+1) < (k+1)! ✓',
                'By the principle of mathematical induction, 2ⁿ < n! for all integers n ≥ 4. ∎'
            ]
        }
    ]
};

// State
let currentProofType = '';
let currentProblemIndex = 0;
let currentSteps = [];
let correctOrder = [];
let userOrder = [];
let isChecked = false;
let currentDifficulty = 'all';
let availableProblems = [];

// Shuffle array function
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Select proof type and load random problem
function selectProofType(type) {
    currentProofType = type;
    currentDifficulty = 'all';
    updateAvailableProblems();
    currentProblemIndex = Math.floor(Math.random() * availableProblems.length);
    loadProblem();
    
    // Show difficulty selector
    document.getElementById('difficultySelector').style.display = 'block';
    
    // Update button styles
    document.querySelectorAll('.problem-select-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Filter by difficulty
function filterByDifficulty(difficulty) {
    if (!currentProofType) {
        alert('Please select a proof type first!');
        return;
    }
    
    currentDifficulty = difficulty;
    updateAvailableProblems();
    
    if (availableProblems.length === 0) {
        alert('No problems available for this difficulty level.');
        return;
    }
    
    currentProblemIndex = Math.floor(Math.random() * availableProblems.length);
    loadProblem();
}

// Update available problems based on difficulty filter
function updateAvailableProblems() {
    if (currentDifficulty === 'all') {
        availableProblems = [...proofSteps[currentProofType]];
    } else {
        availableProblems = proofSteps[currentProofType].filter(p => p.difficulty === currentDifficulty);
    }
}

// Load a problem
function loadProblem() {
    if (!currentProofType || availableProblems.length === 0) return;
    
    const problemData = availableProblems[currentProblemIndex];
    correctOrder = [...problemData.steps];
    currentSteps = shuffleArray(problemData.steps);
    userOrder = [];
    isChecked = false;
    
    // Display problem
    document.getElementById('problemText').textContent = problemData.problem;
    document.getElementById('problemStatement').style.display = 'block';
    document.getElementById('orderingContainer').style.display = 'grid';
    document.getElementById('controlButtons').style.display = 'flex';
    document.getElementById('resultMessage').className = 'result-message';
    document.getElementById('resultMessage').style.display = 'none';
    document.getElementById('solutionBox').style.display = 'none';
    
    // Display difficulty badge
    const badge = document.getElementById('difficultyBadge');
    badge.textContent = problemData.difficulty.toUpperCase();
    if (problemData.difficulty === 'easy') {
        badge.style.background = '#28a745';
        badge.style.color = 'white';
    } else if (problemData.difficulty === 'medium') {
        badge.style.background = '#ffc107';
        badge.style.color = '#333';
    } else if (problemData.difficulty === 'hard') {
        badge.style.background = '#dc3545';
        badge.style.color = 'white';
    }
    
    displayScrambledSteps();
    displayOrderedSteps();
}

// Display scrambled steps
function displayScrambledSteps() {
    const container = document.getElementById('scrambledSteps');
    container.innerHTML = '';
    
    currentSteps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'proof-step';
        stepDiv.textContent = step;
        stepDiv.onclick = () => selectStep(index);
        
        // Check if already selected
        if (userOrder.some(item => item.originalIndex === index)) {
            stepDiv.classList.add('disabled');
        }
        
        // Check if checked and show correctness
        if (isChecked) {
            stepDiv.onclick = null;
            const correctIndex = correctOrder.indexOf(step);
            const userIndex = userOrder.findIndex(item => item.originalIndex === index);
            
            if (userIndex !== -1 && userIndex === correctIndex) {
                stepDiv.classList.add('correct');
            }
        }
        
        container.appendChild(stepDiv);
    });
}

// Display ordered steps
function displayOrderedSteps() {
    const container = document.getElementById('orderedSteps');
    
    if (userOrder.length === 0) {
        container.innerHTML = '<div class="empty-message">Click steps on the left to build your proof →</div>';
        return;
    }
    
    container.innerHTML = '';
    
    userOrder.forEach((item, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'ordered-step';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'step-number';
        numberSpan.textContent = index + 1;
        
        const textSpan = document.createElement('span');
        textSpan.textContent = ' ' + item.step;
        
        stepDiv.appendChild(numberSpan);
        stepDiv.appendChild(textSpan);
        
        // Add remove button if not checked
        if (!isChecked) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-step';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => removeStep(index);
            stepDiv.appendChild(removeBtn);
        } else {
            // Show if correct or incorrect
            if (item.step === correctOrder[index]) {
                stepDiv.style.borderColor = '#28a745';
                stepDiv.style.background = '#d4edda';
            } else {
                stepDiv.style.borderColor = '#dc3545';
                stepDiv.style.background = '#f8d7da';
            }
        }
        
        container.appendChild(stepDiv);
    });
}

// Select a step
function selectStep(index) {
    if (isChecked) return;
    if (userOrder.some(item => item.originalIndex === index)) return;
    
    userOrder.push({
        originalIndex: index,
        step: currentSteps[index]
    });
    
    displayScrambledSteps();
    displayOrderedSteps();
    
    // Enable check button if all steps are selected
    document.getElementById('checkBtn').disabled = userOrder.length !== correctOrder.length;
}

// Remove a step from ordered list
function removeStep(index) {
    if (isChecked) return;
    
    userOrder.splice(index, 1);
    displayScrambledSteps();
    displayOrderedSteps();
    
    document.getElementById('checkBtn').disabled = userOrder.length !== correctOrder.length;
}

// Check answer
function checkAnswer() {
    if (userOrder.length !== correctOrder.length) {
        alert('Please select all steps before checking!');
        return;
    }
    
    isChecked = true;
    
    // Check if order is correct
    let allCorrect = true;
    for (let i = 0; i < userOrder.length; i++) {
        if (userOrder[i].step !== correctOrder[i]) {
            allCorrect = false;
            break;
        }
    }
    
    const resultDiv = document.getElementById('resultMessage');
    if (allCorrect) {
        resultDiv.className = 'result-message success';
        resultDiv.textContent = '🎉 Perfect! You got the proof structure exactly right!';
        document.getElementById('solutionBox').style.display = 'none';
    } else {
        resultDiv.className = 'result-message error';
        resultDiv.textContent = '❌ Not quite right. Review the correct solution below to see the proper order!';
        showSolution();
    }
    
    displayScrambledSteps();
    displayOrderedSteps();
    
    // Disable check button
    document.getElementById('checkBtn').disabled = true;
}

// Show the correct solution
function showSolution() {
    const solutionContainer = document.getElementById('solutionSteps');
    solutionContainer.innerHTML = '';
    
    correctOrder.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.style.cssText = `
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        `;
        
        const numberSpan = document.createElement('span');
        numberSpan.style.cssText = `
            display: inline-block;
            width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            background: #28a745;
            color: white;
            border-radius: 50%;
            margin-right: 10px;
            font-weight: bold;
        `;
        numberSpan.textContent = index + 1;
        
        const textSpan = document.createElement('span');
        textSpan.textContent = step;
        
        stepDiv.appendChild(numberSpan);
        stepDiv.appendChild(textSpan);
        solutionContainer.appendChild(stepDiv);
    });
    
    document.getElementById('solutionBox').style.display = 'block';
}

// Reset the current problem
function resetOrder() {
    userOrder = [];
    isChecked = false;
    document.getElementById('resultMessage').className = 'result-message';
    document.getElementById('resultMessage').style.display = 'none';
    document.getElementById('solutionBox').style.display = 'none';
    document.getElementById('checkBtn').disabled = true;
    
    displayScrambledSteps();
    displayOrderedSteps();
}

// Load a new problem
function newProblem() {
    if (!currentProofType) {
        alert('Please select a proof type first!');
        return;
    }
    
    if (availableProblems.length === 0) {
        alert('No problems available!');
        return;
    }
    
    // Get a different problem index
    const maxIndex = availableProblems.length - 1;
    if (maxIndex === 0) {
        // Only one problem, just reload it
        currentProblemIndex = 0;
    } else {
        // Get a different problem
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * availableProblems.length);
        } while (newIndex === currentProblemIndex && availableProblems.length > 1);
        currentProblemIndex = newIndex;
    }
    
    loadProblem();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('checkBtn').disabled = true;
});
