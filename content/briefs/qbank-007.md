# Bank batch qbank-007 (quant, quant, seed 3665)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-007.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-008:s1q7 (you missed it; no sibling in the bank yet); revisit quant-008:s2q10 (you missed it; no sibling in the bank yet); revisit quant-008:s2q1 (you missed it; no sibling in the bank yet); revisit quant-008:s2q2 (you missed it; no sibling in the bank yet); revisit quant-008:s2q11 (you missed it; no sibling in the bank yet); revisit quant-008:s1q8 (you missed it; no sibling in the bank yet); revisit quant-008:s2q5 (you missed it; no sibling in the bank yet); revisit quant-008:s1q1 (you missed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | mc | 3 | frequency-distributions | relative frequency and cumulative frequency |
| s1q2 | mc | 4 | frequency-distributions | which interval contains the median or a percentile |
| s1q3 | qc | 4 | frequency-distributions | mean from a histogram's grouped data |
| s1q4 | qc | 5 | frequency-distributions | median from a frequency table |
| s1q5 | mc | 5 | units-conversion | rates with mixed units |
| s1q6 | mc | 4 | units-conversion | chained unit conversion |
| s1q7 | mc_multi | 4 | units-conversion | area or volume unit conversion (squares and cubes) |
| s1q8 | numeric | 5 | units-conversion | currency or exchange rates |
| s1q9 | qc | 4 | ratio-proportion | combining two ratios that share a term (a:b and b:c) |
| s1q10 | mc_multi | 5 | ratio-proportion | part-to-part vs part-to-whole confusion |
| s1q11 | numeric | 4 | ratio-proportion | scale maps and models |
| s1q12 | qc | 5 | ratio-proportion | direct vs inverse proportion |
| s1q13 | mc_multi | 5 | exponents-roots | nested and conjugate radicals (rationalizing a denominator) |
| s1q14 | mc | 5 | exponents-roots | negative and fractional exponents |
| s1q15 | numeric | 4 | exponents-roots | equations solved by rewriting to a common base |
| s1q16 | qc | 5 | exponents-roots | nested and conjugate radicals (rationalizing a denominator) |
| s1q17 | mc_multi | 4 | quadratics-factoring | sum and product of the roots |
| s1q18 | mc | 5 | quadratics-factoring | a quadratic in disguise (x^4, sqrt x or 1/x as the variable) |
| s1q19 | numeric | 4 | quadratics-factoring | special products: (a+b)^2, (a-b)^2, a^2 - b^2 |
| s1q20 | qc | 5 | quadratics-factoring | the discriminant: number of real solutions |
| s1q21 | mc_multi | 5 | abs-value-inequalities | |x - a| = |x - b|: the point midway |
| s1q22 | mc | 5 | abs-value-inequalities | a tolerance stated as an absolute-value inequality |
| s1q23 | numeric | 4 | abs-value-inequalities | |x - a| < b as a distance interval |
| s1q24 | qc | 5 | abs-value-inequalities | |x| against x in QC |
| s1q25 | mc | 5 | counting-restrictions | complement counting: total minus the forbidden (revisit) |
| s1q26 | numeric | 3 | area-perimeter | the area of an irregular composite figure (revisit) |
| s1q27 | qc | 4 | exponents-roots | comparing large powers or roots without a calculator (revisit) |
| s1q28 | qc | 4 | triangles | similar triangles: side and area ratios (revisit) |

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **frequency-distributions**
  - DI: change in the median after moving one category's values
  - one group's segments of a stacked interval graph; estimated mean from interval midpoints
  - DI: cumulative frequency table; least value at which the cumulative share reaches a given percent (a percentile)
  - DI: median of one group from a frequency table where the two middle values fall in adjacent rows
  - several frequency columns over the same population; count the columns whose median falls in a given row (cumulative counts against the middle position)
  - grouped whole-number data: the greatest possible mean of one row puts every value at its interval's top
  - DI: a percentile within a subgroup that leaves out one group's lowest row; re-base on the subgroup before accumulating (accumulating the whole group's column points to the row below)
- **units-conversion**
  - liters per second to cubic meters over hours
  - price per square inch; cost of an area given in square yards, with each linear factor squared inside the chain
  - money converted out, part spent abroad, the remainder converted back at a different rate
  - speed, fuel economy and fuel price; the fuel cost for a time given in minutes
  - rain depth over a land area gives a water volume, then a mass, through area, length and mass unit changes
  - a floor area in square meters covered by square tiles measured in centimeters; the number of tiles (convert by the square of the length factor)
  - a price converted through two exchange rates in a chain (a cross rate); divide, not multiply, at the second rate
- **ratio-proportion**
  - **worn** ratio before and after adding or removing items of one or both kinds; a total (3×)
  - chained ratios a:b and b:c with bounds; possible totals
  - mix two blends with different part ratios to reach a 1:1 mixture
  - three-part budget ratio; one part grows to a given fraction of the total; new total
  - chained ratios a:b and b:c with a difference given; one count
  - a map scale applies to lengths; the actual area scales by its square
  - workers and time are inversely proportional; scale the time
  - inverse proportion: a percent increase in one variable; the percent decrease in the other
  - a model's surface-area ratio gives the linear scale; capacity scales by its cube
  - a part-to-whole fraction before and a part-to-part ratio after adding members of one kind; compare the unchanged kind's count with a value
  - two ratios that each compare a different kind with the same shared kind (shared term second in both); one kind's fraction of the whole
  - two blends combined into an even mixture, with both amounts and one blend's part-to-part ratio given; find the other blend's part-to-whole share
  - … 2 more (the novelty judge sees every one)
- **exponents-roots**
  - **worn** (b^{n+k} ± b^n) over a similar sum of powers: factor out the common power (2×)
  - **worn** sqrt(3·9^n) against a power of 3: rewrite as powers of 3 (2×)
  - sqrt(a+2) - sqrt(a) vs sqrt(a) - sqrt(a-2) (conjugates)
  - 0 < x < 1: compare two negative fractional powers of x (the more negative exponent gives the larger value)
  - 5th root of 5 vs cube root of 3 (raise both to the 15th)
  - a negative fractional power is given; raise it to another power by multiplying exponents
  - sqrt(a + 2sqrt b) - sqrt(a - 2sqrt b) denested; compare with a root
  - sum of reciprocals of consecutive root sums telescopes after rationalizing; select n making it an integer
  - sum of two powers with negative bases against the power of the negative sum; the exponent's parity decides the signs and flips the order
  - a negative square-root power of a sum of two bases above 1 against the sum of the same powers of the bases (the exponent does not distribute)
  - an exponential inequality with a base below 1 on one side and its reciprocal on the other; rewrite to one base, flip the inequality, compare x with a value
  - a large power of 5 against a power of 10: write 5 as 10 over 2 and bound the power of 2 with 2^10 above 10^3
  - … 1 more (the novelty judge sees every one)
- **quadratics-factoring**
  - x^2 + kx + c with two distinct positive integer roots; possible k
  - squares of the sum and of the difference given; find the product
  - equation linear in x and sqrt x: substitute, reject the negative root; sum of solutions
  - a cubic with no constant term has three distinct nonnegative integer solutions: factor out x (zero is one root), then factor pairs of the constant give the coefficient
  - a product of two linear factors set equal to a positive constant with unknown parameters; the discriminant is a square plus a positive term, so the solution count is fixed
  - two equations sharing a factor of one variable; cancelling it pins the other variable, but the factor can be zero and then frees it; compare the other variable with the pinned value
  - one squared quadratic equals another squared expression; factor as a difference of squares into two quadratics; the sum of all real roots (the one-sided equation misses a factor)
  - a quadratic with no real root bounds its constant; the same quadratic set equal to a positive number; compare its solution count with a value
- **abs-value-inequalities**
  - **worn** sum of two absolute values |x - a| + |x - b| against a bound (3×)
  - |x + c| < b gives an interval for x; compare x^2 with a constant (endpoint signs matter)
  - forces opposite signs; compare (x + y)^2 with (x - y)^2
  - count integers with |x + a| > k|x - b|; compare with a value
  - |x - a| = bx + c: two cases, one rejected because the right side would be negative
  - two distances from a shared point on the number line: the third distance is their sum or difference
  - which absolute-value identities and inequalities hold for every real x (test a negative)
  - two different numbers equidistant from a fixed point: their sum is twice that point
  - a side length within a tolerance; the area's greatest deviation from nominal against the linear estimate (the square term breaks the tie)
  - one unknown equidistant from two fixed numbers written as equal absolute values; compare it with a value
  - x times |x| equals a linear expression: a quadratic in each sign case, one root in the wrong case and no real root in the other; compare the sum of solutions with the sum of the quadratic's roots
  - the sum of |x| and x is zero (x nonpositive, zero allowed); compare |x| minus x with zero
  - … 2 more (the novelty judge sees every one)

Revisit s1q25 of quant-008:s1q7 (you missed it): Six different talks, including talks by Alvarez, Brandt and Chen, are to be scheduled in six consecutive time slots, one talk per slot. Alvarez's talk must come earlier than Brandt's talk but not in the slot immediately before it, and Chen's talk cannot be in the first slot. How many different schedules are possible? · choices: 180 / 200 / 204 / 240 / 300 [setup: schedule with one item before another but not adjacent, plus a slot restriction]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-008:s1q7"`.

Revisit s1q26 of quant-008:s2q10 (you missed it): From a rectangular sheet of plywood that measures 12 feet by 10 feet, a rectangle that measures 4 feet by 6 feet is cut away at one corner. The perimeter of the remaining piece is how many feet greater than the perimeter of the piece that was cut away? · choices: 4 / 16 / 20 / 24 / 44 [setup: corner cut from a rectangle: perimeter of the remaining L shape]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-008:s2q10"`.

Revisit s1q27 of quant-008:s2q1 (you missed it): Compare the two quantities. · Quantity A: $\sqrt[5]{5}$ | Quantity B: $\sqrt[3]{3}$ [setup: 5th root of 5 vs cube root of 3 (raise both to the 15th)]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-008:s2q1"`.

Revisit s1q28 of quant-008:s2q2 (you missed it): In triangle $ABC$, point $D$ lies on side $AB$ and point $E$ lies on side $AC$ so that $DE$ is parallel to $BC$. $AD = 4$ and $DB = 2$. · Quantity A: The area of quadrilateral $DBCE$ | Quantity B: The area of triangle $ADE$ [setup: a line parallel to one side cuts off a similar triangle; compare the trapezoid with the small triangle (areas scale as squares)]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-008:s2q2"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
