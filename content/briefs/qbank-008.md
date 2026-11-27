# Bank batch qbank-008 (quant, quant, seed 14428)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-008.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; a unit's questions share its passage or DI set, whose id is the unit's id; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-008:s2q11 (you missed it; no sibling in the bank yet); revisit quant-008:s1q8 (you missed it; no sibling in the bank yet); revisit quant-008:s2q5 (you missed it; no sibling in the bank yet); revisit quant-008:s1q1 (you missed it; no sibling in the bank yet); revisit quant-008:s1q11 (you missed it; no sibling in the bank yet); revisit quant-008:s2q13 (you missed it; no sibling in the bank yet); revisit quant-008:s2q7 (you missed it; no sibling in the bank yet); revisit quant-008:s2q14 (you missed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | mc | 3 | quadratics-factoring | sum and product of the roots |
| s1q2 | numeric | 3 | quadratics-factoring | dividing by a variable that may be zero |
| s1q3 | numeric | 3 | triangles | isosceles or equilateral properties hidden in a figure |
| s1q4 | mc | 3 | triangles | exterior angle theorem |
| s1q5 | qc | 3 | triangles | isosceles or equilateral properties hidden in a figure |
| s1q6 | numeric | 3 | sequences-patterns | geometric sequence or a repeating cycle of terms |
| s1q7 | mc_multi | 5 | sequences-patterns | telescoping sum of differences |
| s1q8 | qc | 4 | sequences-patterns | telescoping sum of differences |
| s1q9 | numeric | 4 | sequences-patterns | recursive sequence: find a term or a sum |
| s1q10 | mc | 3 | sequences-patterns | geometric sequence or a repeating cycle of terms |
| s1q11 | mc | 5 | sequences-patterns | arithmetic sequence: n-th term, sum, count of terms |
| s1q12 | numeric | 3 | data-interpretation-calc | a value implied but not shown (derived total) |
| s1q13 | mc_multi | 5 | data-interpretation-calc | percent of a percent across two charts |
| s1q14 | mc | 5 | data-interpretation-calc | the percent increase between two periods |
| s1q15 | mc | 3 | data-interpretation-calc | estimation to pick the closest value |
| s1q16 | qc | 3 | linear-equations | a system with no solution or infinitely many |
| s1q17 | mc | 3 | linear-equations | solving for an expression (x + y) instead of each variable |
| s1q18 | mc | 5 | linear-equations | a literal equation: solve for one letter in terms of the others |
| s1q19 | qc | 3 | exponential-growth | compound interest against simple interest |
| s1q20 | mc_multi | 5 | exponential-growth | doubling or halving time |
| s1q21 | mc | 5 | counting-permutations | subset counts and the symmetry C(n, k) = C(n, n - k) (revisit) |
| s1q22 | qc | 4 | abs-value-inequalities | |x - a| < b as a distance interval (revisit) |
| s1q23 | qc | 4 | probability-basic | complement: at least one success (revisit) |
| s1q24 | qc | 3 | fractions-decimals | the k-th digit after the decimal point of a repeating decimal (revisit) |
| s1q25 | di (d1) | 3 | data-interpretation-calc | estimation to pick the closest value |
| s1q26 | di (d1) | 4 | data-interpretation-calc | a ratio between two categories in different graphs |
| s1q27 | di (d1) | 5 | data-interpretation-calc | the percent increase between two periods |

Units: d1 di3

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **quadratics-factoring**
  - x^2 + kx + c with two distinct positive integer roots; possible k
  - squares of the sum and of the difference given; find the product
  - equation linear in x and sqrt x: substitute, reject the negative root; sum of solutions
  - a cubic with no constant term has three distinct nonnegative integer solutions: factor out x (zero is one root), then factor pairs of the constant give the coefficient
  - a product of two linear factors set equal to a positive constant with unknown parameters; the discriminant is a square plus a positive term, so the solution count is fixed
  - two equations sharing a factor of one variable; cancelling it pins the other variable, but the factor can be zero and then frees it; compare the other variable with the pinned value
  - one squared quadratic equals another squared expression; factor as a difference of squares into two quadratics; the sum of all real roots (the one-sided equation misses a factor)
  - a quadratic with no real root bounds its constant; the same quadratic set equal to a positive number; compare its solution count with a value
  - a monic quadratic with fixed sum of roots and a free constant; the sum of squares of the roots from sum and product, bounded below by requiring two distinct real roots
  - a quadratic in a quadratic expression of x; back-substitution gives two quadratics, one a perfect square with a repeated root, so the sum of the different solutions is not the sum of both root sums
  - two squares whose sides differ by a given amount and areas by another; the difference of squares gives the sum of the sides, then the combined area
  - a negative constant appears in two quadratics: in one it is moved across the equals sign and its sign decides the discriminant; in the other a negative constant term forces two roots
- **triangles**
  - **worn** two sides given and an obtuse (or bounded) angle; the third side's range from c^2 against a^2 + b^2 (3×)
  - 13-14-15 triangle: altitude to one side via Heron or two right triangles
  - isosceles with sides 4 and 9: the third side must be 9; perimeter vs a value
  - isosceles triangle with one 40° angle: two cases; compare the largest angle with twice the smallest
  - a line parallel to one side cuts off a similar triangle; compare the trapezoid with the small triangle (areas scale as squares)
  - isosceles chain AD = BD = BC with one angle given; exterior angle then base angles; compare an angle with a value
  - exterior angle equals the sum of the two remote interior angles; split it by a given difference
  - obtuse triangle with three integer sides: the altitude to the shortest side falls outside it; find it from the area
  - two sides of a triangle given; perimeter of the midpoint triangle against the value at the triangle-inequality bound
  - one side and the altitude to it given; select possible lengths of another side (the foot may fall outside the base)
  - lower bounds on two exterior angles of a triangle; add the two exterior-angle relations to bound the third interior angle
  - a trapezoid's midline cut by a diagonal into two midsegments, each half of one base; from the midline and the pieces' difference, compare the shorter base with a value
  - … 7 more (the novelty judge sees every one)
- **sequences-patterns**
  - recursive a_{n+1} = 1/(1 - a_n) cycles with period 3; sum of 100 terms
  - recursive sequence whose step is a partial-fraction term; the nth term by telescoping, with an off-by-one in the term count
  - linear recursion doubling minus one: shift by 1 to get powers of 2; first term past a bound
  - a recursion with period four; sum of the terms whose index is a multiple of three up to a bound
  - a list of squares with alternating signs: pair consecutive terms into differences of squares; an odd number of terms leaves one unpaired
  - two arithmetic sequences with different differences and starts; their common terms form an arithmetic sequence with the lcm as difference; count those inside a window that does not start at the first term
  - two-term additive recursion with two terms two places apart given; recover the middle term, run backward to the start, then a later term and a partial sum
  - first term, common difference and last term given; count the terms, then the sum
  - the sum of the multiples of 3 up to an unknown bound is 3 times a triangular number; select the totals that can occur
  - a two-term difference recursion from two given starting terms repeats every six terms with block sum zero; select the sums over index ranges that equal zero
- **data-interpretation-calc**
  - DI: percent increase of a combined total (all categories but one) between two years
  - DI: percent greater between two groups' counts
  - DI: one category's percent of a total across groups
  - DI: percent increase in the total across all categories
  - DI: percent change of one category between two years
  - DI: one category's percent increase as a multiple of another's percent decrease
  - DI: a stated fraction of one subgroup gives a count; its percent of the whole group
  - DI: percentage-point difference between two groups' shares
  - DI: total of one status across groups, each from a percent of a different base
  - DI: read each box plot's interquartile range and count those meeting a bound
  - DI: compare two departments' non-remote counts, each the complement of a within-department percent applied to a percent of the whole
  - DI: share of all units (not of orders) that sit in the larger-order rows of a frequency table
  - … 4 more (the novelty judge sees every one)
- **linear-equations**
  - **worn** counts of items at two or three prices from a total count and revenue (2×)
  - for which k a 2x2 linear system has no solution
  - count integer k for which a 2x2 system has an integer solution
  - three item counts, two price lists and totals; greatest possible count of one
  - two linear equations in three unknowns; a third combination is determined
  - 1/a + 1/b = 1/c with positive values: solve for c and compare it with a
  - solve y = (ax + b)/(x - 1) for x: collect the x terms and factor
  - sum and difference linked by a multiple: find both, then the larger is their average
  - two equations that are multiples of one line: count the positive integer solutions of that line
  - a price after a percent discount plus a flat fee, solved for the discount rate (move the fee before dividing; the fee's sign flips)
  - a 2x2 system with no solution fixes the constant (one root makes the lines coincide); the axis intercepts of the two parallel lines form a quadrilateral whose area comes from its perpendicular diagonals
  - a product formula with a coefficient times a square root of two variables: solve for one variable under the root (square both sides, the coefficient included)
  - … 7 more (the novelty judge sees every one)
- **exponential-growth**
  - constant yearly growth with an overall 700% increase; percent over a third of the period
  - two decaying amounts with different halving times and a starting ratio; time when they are equal
  - the two-year gap between compound and simple interest is the principal times the rate squared: recover the rate, then the simple interest
  - two exponential models whose different-looking bases and exponents rewrite to the same yearly factor; a constant ratio
  - two exponential models each known at the same two times; the factor for half the gap is the square root; extrapolate both back and compare
  - constant percent growth with the overall percent increase over the period; the value at the halfway point against the average of the starting and ending values (geometric against arithmetic mean)
  - two deposits made one doubling period apart in an account with a fixed doubling time; the time from opening until the balance reaches a target (combine at the second deposit, then count doublings)
  - equal deposits at the same rate, one simple and one compounded yearly, run for three years; select the true statements on balances, a single year's interest, the gap and the percent gain
  - growth by a fixed factor per period; the number of days to reach a larger factor, solved by writing both factors as powers of a common base (a non-whole number of periods)
  - two growth models with different periods, one stated as a percent increase per period equal to the other's factor; count the periods for each over one span and take the ratio of the powers
  - a fixed percent loss per period; the time to fall to half against the linear estimate of 50 over the percent (compounding losses take longer)

Revisit s1q21 of quant-008:s2q11 (you missed it): How many subsets of the set $\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\}$ contain more even numbers than odd numbers? · choices: 252 / 386 / 512 / 638 / 772 [setup: subsets with more of one kind than another: symmetry pairs them, then remove the equal case]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-008:s2q11"`.

Revisit s1q22 of quant-008:s1q8 (you missed it): The numbers $a$, $b$ and $c$ satisfy $|a - b| = 5$ and $|b - c| = 3$. Which of the following could be the value of $|a - c|$? Indicate all such values. · choices: $0$ / $2$ / $3$ / $5$ / $8$ / $15$ [setup: two distances from a shared point on the number line: the third distance is their sum or difference]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-008:s1q8"`.

Revisit s1q23 of quant-008:s2q5 (you missed it): Whether a commuter's morning train is late and whether her evening bus is late are independent events. On any given day, the probability that the train is late is 0.5 and the probability that at least one of the two is late is 0.7. · Quantity A: The probability that the evening bus is late | Quantity B: $0.4$ [setup: P(A) and P(A or B) for independent events; compare P(B) with a value]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-008:s2q5"`.

Revisit s1q24 of quant-008:s1q1 (you missed it): $x = 0.\overline{36}$ · Quantity A: $\dfrac{1}{x}$ | Quantity B: $2.75$ [setup: repeating decimal x; compare 1/x with a value]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-008:s1q1"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
