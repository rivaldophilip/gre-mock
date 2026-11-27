# Bank batch qbank-004 (quant, quant, seed 82438)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-004.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-006:s2q7 (you missed it; no sibling in the bank yet); revisit quant-006:s2q8 (you guessed it; no sibling in the bank yet); revisit quant-006:s2q15 (you missed it; no sibling in the bank yet); revisit quant-007:s2q4 (you missed it; no sibling in the bank yet); revisit quant-007:s1q11 (you missed it; no sibling in the bank yet); revisit quant-007:s2q5 (you missed it; no sibling in the bank yet); revisit quant-007:s1q6 (you guessed it; no sibling in the bank yet); revisit quant-007:s2q11 (you missed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | mc | 4 | quadratic-inequalities | sign analysis of a factored product (x - a)(x - b) < 0 |
| s1q2 | qc | 5 | quadratic-inequalities | powers against the number: where x^2 > x or x^3 < x |
| s1q3 | mc | 4 | quadratic-inequalities | an inequality with x in the denominator (case on sign) |
| s1q4 | qc | 5 | quadratic-inequalities | integer count in a solution set such as x^2 < 10 |
| s1q5 | mc_multi | 5 | estimation-sigfig | rounding to a place, then computing |
| s1q6 | mc | 4 | estimation-sigfig | order of magnitude comparison in QC |
| s1q7 | numeric | 5 | estimation-sigfig | estimating a product or quotient to pick the closest choice |
| s1q8 | qc | 4 | estimation-sigfig | order of magnitude comparison in QC |
| s1q9 | mc_multi | 4 | data-tables-graphs | a circle graph: central angle and percent |
| s1q10 | mc | 5 | data-tables-graphs | a time plot: the largest change between periods |
| s1q11 | numeric | 4 | data-tables-graphs | reading values from a stacked or segmented bar graph |
| s1q12 | qc | 5 | data-tables-graphs | a scatterplot: counting points or reading a trend line |
| s1q13 | mc_multi | 4 | word-problems-age-sum | ages then and now |
| s1q14 | mc | 5 | word-problems-age-sum | coins or tickets of two denominations |
| s1q15 | numeric | 4 | word-problems-age-sum | consecutive-number sums |
| s1q16 | qc | 5 | word-problems-age-sum | coins or tickets of two denominations |
| s1q17 | mc_multi | 4 | remainders-units | units digit of a large power (cycle length) |
| s1q18 | mc | 5 | remainders-units | remainder of a negative or fractional expression of n |
| s1q19 | numeric | 4 | remainders-units | remainder written as a decimal part (n/d = q.25) |
| s1q20 | qc | 5 | remainders-units | two remainder conditions at once: smallest such number |
| s1q21 | mc_multi | 5 | inequalities | a word problem with an inequality constraint |
| s1q22 | mc | 4 | inequalities | a chain a < b < c: what must be true of sums or differences |
| s1q23 | numeric | 5 | inequalities | an inequality with a parameter: for which k a solution exists |
| s1q24 | qc | 4 | inequalities | a word problem with an inequality constraint |
| s1q25 | mc | 5 | circles | inscribed angle vs central angle (revisit) |
| s1q26 | numeric | 5 | counting-permutations | multiplication principle across independent choices (revisit) |
| s1q27 | numeric | 5 | triangles | larger side opposite the larger angle; obtuse vs acute from c^2 against a^2 + b^2 (revisit) |
| s1q28 | qc | 4 | algebraic-expressions | simplifying a rational expression (revisit) |

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **quadratic-inequalities**
  - rational inequality k/x > x - c; multiplying through by x loses the negative branch; compare x with the left root
  - x^3 < x with no sign given; compare x^2 with x across the two solution intervals
  - a quartic inequality that factors as n^2 times a quadratic; dividing by n^2 silently admits n = 0, which fails the strict inequality; count the integers
  - three ordered parameters with no values; one factored product negative (between its roots) and one positive (outside its roots) intersect to a sub-interval; the sign of a third pairing of the factors
  - a two-sided bound on n squared with a non-square lower bound and a square upper bound; count the integers of both signs
  - a linear-over-linear expression at least a constant; move everything to one side and read the sign chart; the boundary root is included and the pole excluded; count the integers
- **estimation-sigfig**
  - estimate a product and quotient of numbers in scientific notation
  - sum of many amounts each rounded to the nearest unit; bound the true total against the strict upper limit
  - a difference of squares of two decimals near consecutive whole numbers: rounding each term misleads, factoring gives the product
  - square root of a number in scientific notation with an odd power of ten; compare with a power of ten
  - concentration times volume over a per-dose amount, with a unit conversion; round each factor and pick the nearest of closely spaced choices
  - a difference of two numbers in scientific notation with different powers, divided by a negative power of ten
  - a power of a small base against a power of ten with a different exponent; rewrite the base in powers of two, use 2 to the 10th as about a thousand, and bound the error
  - a count known only after rounding to one place; rounding it to a coarser place directly against rounding the already-rounded figure (double rounding)
  - a sum of two numbers in scientific notation one power apart against the square of another; align the powers and square the coefficient
- **data-tables-graphs**
  - DI: count of students at or above a threshold from a frequency chart
  - stacked bars of two groups over intervals; pick the interval with the greatest ratio of segment heights
  - DI: circle graph of a subgroup only: central angle of one category on the reduced base
  - scatterplot of the same units measured in two years; count the points above the line y = x
  - monthly frequency columns; sum two rows per period and find the largest change in either direction (a drop wins)
  - two cells of one row against the matching column totals (not the row total)
  - DI: read two grid points on a drawn trend line and take its slope (not one point's ratio of the two coordinates)
  - stacked bars of three formats over years; the year with the longest middle segment (lengths, not tops)
- **word-problems-age-sum**
  - three people's shares related by more-than / twice / percent of the total
  - 'when one was as old as the other is now' statements in both directions; the constant age gap
  - the value of two coin types and the value if their counts were swapped; the total count from adding the two equations
  - sum of an even-length run of consecutive integers given; the greatest from the half-integer average
  - consecutive odd integers; one partial sum exceeds another by a given amount; translate into one equation in the smallest term
  - two ticket prices with equal revenue from each kind and a total count: the counts are in the inverse ratio of the prices; the total revenue
  - three parts related by less-than-twice / more-than / percent of the total; the largest part
  - a past multiple and the present sum give both ages; then the future year at which one is twice the other
  - one quantity stated as a fixed amount fewer than a multiple of another and also as a fixed amount more than it; translate both in order; the total
- **remainders-units**
  - **worn** remainder of a^n ± b^n mod a small number via power cycles (4×)
  - k ≡ 5 mod 6; remainders of high powers of k mod 8 and mod 3
  - units digits of 3^n and 7^n combined (sum vs product) for every n
  - two remainder conditions that conflict in parity: no such number; compare the count with a value
  - n + 1 a multiple of 6; remainder of n^2 + n mod 12 vs a value
  - the decimal part of n/d reduces to a fraction; the least divisor is its reduced denominator
  - from the last digit of a sum of powers back to the parity of n; then another power's last digit
  - remainder of the negative of a large power, via the power's cycle and the nonnegative-remainder rule
  - product of a long run of odd integers: an odd multiple of 25 ends in 25 or 75; the residue mod 4 decides
  - a multiple of 3 with a known remainder mod 14; the remainder of the number divided by 3 is fixed because 3 and 14 are coprime; compare it with the original remainder
  - two integers with the same remainder mod 6: their high even powers are fixed mod 24 through mod 8 and mod 3; compare the remainder of the sum of the powers with that of the square of the integers' sum
  - the decimal part of n over a given divisor fixes the remainder; compare the remainder by a factor of that divisor with the reduced fraction's numerator
  - … 3 more (the novelty judge sees every one)
- **inequalities**
  - DI: two linear growth projections; first year one exceeds the other
  - -1 < a < 0 < b < 1: select all inequalities that must hold
  - two linear inequalities give an interval; compare x^2 with -4x
  - for which k a linear inequality holds for every x in an interval (check endpoints)
  - 6/x < 2 and a quadratic inequality; sign of x
  - compound linear inequality gives an x interval; select possible x^2
  - three ordered numbers summing to zero; select the sign facts that must hold
  - linear cost with a fixed difference in counts, bounded above and below; select possible counts
  - which rewritten forms are equivalent to a linear inequality with a negative coefficient (the sign flips)
  - a quadratic inequality has a solution only when the discriminant is positive; select parameter values
  - a chained ordering of x, 1/x and x^2 is given; select the values of x that satisfy it (sign cases)
  - a < b < c with no signs given; select the sum, difference and product inequalities that must hold
  - … 5 more (the novelty judge sees every one)

Revisit s1q25 of quant-006:s2q7 (you missed it): Two lawn sprinklers each water a circular region of radius 6 meters. The sprinklers are placed $6\sqrt{2}$ meters apart. What is the area, in square meters, of the part of the lawn watered by both sprinklers? · choices: $9\pi - 18$ / $18\pi - 36$ / $18\pi - 18$ / $24\pi - 18\sqrt{3}$ / $36\pi - 36$ [setup: two equal circles at a given center distance; area of the overlap (lens)]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-006:s2q7"`.

Revisit s1q26 of quant-006:s2q8 (you guessed it): Eight tennis players, among them the siblings Ana and Ben and the siblings Cara and Dev, are to be split into four doubles teams of two players each. The teams are not labelled or ordered. In how many of the possible splits are no two siblings on the same team? · choices: $72$ / $75$ / $78$ / $90$ / $105$ [setup: split 8 people into unordered pairs with two sibling pairs not together]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-006:s2q8"`.

Revisit s1q27 of quant-006:s2q15 (you missed it): In triangle $ABC$, $AB = 7$, $BC = 11$, and the length of $AC$ is an integer less than 11. For how many possible values of $AC$ is triangle $ABC$ obtuse? [setup: two sides given and an obtuse (or bounded) angle; the third side's range from c^2 against a^2 + b^2]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-006:s2q15"`.

Revisit s1q28 of quant-007:s2q4 (you missed it): $x$ is a number other than $0$, $1$ and $-1$. · Quantity A: $\dfrac{x^3 - x}{x^2 - x} - \dfrac{x^2 - 1}{x + 1}$ | Quantity B: $2$ [setup: difference of two rational expressions that both simplify; compare with a constant (the excluded values do not matter)]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-007:s2q4"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
