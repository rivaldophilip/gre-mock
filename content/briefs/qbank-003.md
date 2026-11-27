# Bank batch qbank-003 (quant, quant, seed 80952)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-003.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-006:s1q12 (you missed it; no sibling in the bank yet); revisit quant-006:s2q11 (you missed it; no sibling in the bank yet); revisit quant-006:s2q3 (you missed it; no sibling in the bank yet); revisit quant-006:s2q4 (you missed it; no sibling in the bank yet); revisit quant-006:s2q7 (you missed it; no sibling in the bank yet); revisit quant-006:s2q8 (you guessed it; no sibling in the bank yet); revisit quant-006:s2q15 (you missed it; no sibling in the bank yet); revisit quant-007:s2q4 (you missed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | mc | 4 | min-max-bounding | worst-case count (pigeonhole) |
| s1q2 | qc | 5 | min-max-bounding | extreme values of a mean or median |
| s1q3 | mc | 4 | min-max-bounding | the extreme value of an expression over an integer range |
| s1q4 | qc | 5 | min-max-bounding | the largest share or longest side under an ordering or triangle constraint |
| s1q5 | mc_multi | 5 | word-problems-interest | whole-unit pricing and boundary cases (sold only by the full yard; "or less") |
| s1q6 | mc | 4 | word-problems-interest | markup then discount |
| s1q7 | numeric | 5 | word-problems-interest | profit as a percent of cost vs of price |
| s1q8 | qc | 4 | word-problems-interest | whole-unit pricing and boundary cases (sold only by the full yard; "or less") |
| s1q9 | mc_multi | 4 | primes-factors | smallest multiplier that makes a perfect square or cube |
| s1q10 | mc | 5 | primes-factors | highest power of a prime dividing n! or a product |
| s1q11 | numeric | 4 | primes-factors | number of positive divisors from the prime factorization |
| s1q12 | qc | 5 | primes-factors | count of primes or factors in a stated range |
| s1q13 | mc_multi | 4 | graphs-of-functions | reading the value of f at a point from a graph |
| s1q14 | mc | 5 | graphs-of-functions | intersections of two graphs |
| s1q15 | numeric | 4 | graphs-of-functions | symmetry about an axis, the origin or y = x |
| s1q16 | qc | 5 | graphs-of-functions | reading the value of f at a point from a graph |
| s1q17 | mc_multi | 4 | random-variables | expected value from a probability table |
| s1q18 | mc | 5 | random-variables | mean and median of a discrete distribution table |
| s1q19 | numeric | 4 | random-variables | probability from areas under a density curve |
| s1q20 | qc | 5 | random-variables | a uniform distribution over an interval |
| s1q21 | mc_multi | 4 | percent | finding the original value after a change |
| s1q22 | mc | 5 | percent | percent comparisons in QC with unknown bases |
| s1q23 | numeric | 4 | percent | percent change vs percentage-point change |
| s1q24 | qc | 5 | percent | percent comparisons in QC with unknown bases |
| s1q25 | mc | 5 | mean-median-mode | a mean after adding or removing values (revisit) |
| s1q26 | numeric | 5 | inscribed-figures | a rectangle inscribed in a circle or semicircle (diameter as diagonal) (revisit) |
| s1q27 | qc | 5 | probability-basic | probability from a count of outcomes with dice or coins (revisit) |
| s1q28 | qc | 4 | integers-properties | must be / could be an integer from a stated condition (revisit) |

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **min-max-bounding**
  - integer ranges for x and y; select all possible values of the product xy
  - x < y < z positive integers with fixed product; select possible values of z
  - x/y over interval ranges with y ≠ 0; select possible values
  - distinct integer weights with a sum and a cap; least possible second-largest
  - three distinct integer lengths with a fixed sum that form a triangle; possible longest
  - worst-case draws to guarantee a color condition (pigeonhole); select the true counts
  - a rectangle in the corner of a right triangle: its area peaks at half the triangle's area; select attainable areas
  - a point moving on a line: its distance to a fixed point is at least the perpendicular distance; select attainable distances
  - interval ranges: greatest x^2 - y^2 vs greatest xy
  - integer scores in a fixed range with a given median; select possible means (extremes and integer totals)
  - sum of a quadratic in x and a quadratic in y over integer ranges: one vertex outside its range, the other between integers
  - integer points in a disk: the extreme values of several expressions, where the real optimum is not at an integer point
  - … 4 more (the novelty judge sees every one)
- **word-problems-interest**
  - lots sold at markup and at a discount off list; cost per unit from total profit
  - two deposits starting in different months in one simple-interest account; total interest at year's end
  - salary plus a flat commission against commission only above a threshold: the break-even sales
  - goods sold only in whole units with a non-whole need, then a fee on orders at or below a threshold: buying one more unit is cheaper
  - profit given as a percent of the selling price; the price rises by a percent with the cost fixed; the new profit as a percent of cost
  - a fixed fee plus a two-tier per-unit rate; the total bill given; the total usage
  - a price and a profit stated as a percent of cost give the cost; re-price so the same percent is of the selling price; the change in price
  - a dollar markup over cost followed by a percent discount on the marked price; the profit left over gives the cost (the discount comes off cost plus markup)
  - a repayment of principal plus simple interest over a fraction of a year; count the months, scale the annual rate, divide by one plus the term rate
- **primes-factors**
  - x^2 - y^2 = N: count or list integer solutions from same-parity factor pairs
  - divisor-count function: d(n^2) vs 3·d(n) for an unknown n
  - divisor-count relation d(n^2) = 3·d(n) given; select the n that satisfy it
  - a power of a composite dividing a factorial: the squared small prime limits, not the larger prime
  - divisors of a perfect square below its square root: pair d with N/d and set the root aside; compare the count with a value
  - count the primes in two short ranges stated as integers with exactly two divisors; one range hides composites that look prime
  - divisor count of a product of powers of two composite numbers that share a prime (combine the exponents first)
  - largest square tile that covers a rectangle exactly; the number of tiles (the GCD is the side, not the answer)
  - a multiple of a fixed number must be a perfect square; the possible multipliers are the least one times any square
  - a product of the first n even numbers rewritten as a power of 2 times n!; the power of an odd prime comes from n!, not from the larger factorial
  - two periodic events with a given gcd and lcm of their periods; list the coprime splits of lcm over gcd; compare the sum of the periods with its least value
- **graphs-of-functions**
  - parabola crossing the x-axis on both sides of the y-axis; compare b with c
  - piecewise-linear graph read at points between vertices after the input is reflected and shifted
  - a graph symmetric about the y-axis shifted horizontally: compare values at two points equidistant from the new axis
  - a function's unique maximum point; a reflected, stretched and shifted copy: compare where the copy's extreme value occurs with a value
  - a parabola against an absolute-value graph: solve on each piece and reject the roots outside that piece's domain; compare the count with a value
  - a graph symmetric about two parallel vertical lines: chaining the reflections links two values that neither reflection links alone; compare them
  - a line through the origin against a V-shaped graph whose vertex is off the origin; the slopes for which they meet twice (between the flat line through the vertex and the far arm's slope)
  - monic parabola with the gap between its x-intercepts and its y-intercept given; two mirror-image parabolas fit, so the vertex's side of the y-axis is undetermined
  - a horizontal compression, a shift and a vertical stretch of a graph scale the area between it and the x-axis by the product of the two stretch factors (the shift changes nothing); compare with a value
- **random-variables**
  - probability table where the median is not the middle listed value; mean minus median
  - DI: expected days on site per employee, weighting by department share and the non-remote share, remote counted as 0
  - triangular density on an interval: find the peak height, then the area of a tail; compare with a value
  - a length uniform on an interval; probabilities about its square found by converting back to the length (the square is not uniform)
  - a continuous uniform variable and a discrete uniform integer on the same endpoints; compare the probabilities of the same at-most event (length share against inclusive count)
  - a density whose graph is one sloped segment with both end heights given; the probability of the lower half is a trapezoid area (average height times width), not the length share
- **percent**
  - **worn** price up p% then down q% (or back to a reference); find the missing percent or value (3×)
  - dilute a solution: add water to lower the concentration to a target percent
  - DI: which categories' share of the total fell between two years
  - list price above cost, two successive discounts, final price; markup percent
  - a rate falls from p% to q%: percent decrease against the percentage-point drop
  - a price after one discount is given; find the original (divide by the remaining share)
  - the whole and a subgroup grow by different percents; percent change in the subgroup's share
  - a percent of a subgroup that is itself a percent of the whole (part of a part)
  - two quantities rise by different percents but by the same absolute amount; compare one new value with a multiple of the other's old value
  - one group a percent larger than another, a different percent of each group taken; compare the two parts (the base offsets the rate)
  - a share rises by some percentage points, then falls by a percent of itself; with the starting share bounded, compare the final share with the starting one
  - one group a percent larger than the other with no counts given; the smaller group's share of the whole against a value just above it
  - … 4 more (the novelty judge sees every one)

Revisit s1q25 of quant-006:s1q12 (you missed it): Suppose that French enrollment in 2025 is $x$ students, and that for the seven years 2019 through 2025 the median of the annual French enrollments equals their average (arithmetic mean). What is the sum of all possible values of $x$? · choices: $470$ / $870$ / $940$ / $1010$ / $1410$ [setup: add one value so the median equals the mean]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-006:s1q12"`.

Revisit s1q26 of quant-006:s2q11 (you missed it): A square is inscribed in a semicircle of radius 5, with two vertices of the square on the diameter and the other two on the arc. A circle is inscribed in the square. What is the area of the region that lies inside the semicircle but outside the circle? · choices: $5\pi$ / $\dfrac{15\pi}{2}$ / $\dfrac{25\pi}{2}-20$ / $10\pi$ / $\dfrac{25\pi}{4}$ [setup: square inscribed in a semicircle with one side on the diameter]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-006:s2q11"`.

Revisit s1q27 of quant-006:s2q3 (you missed it): A fair coin is to be tossed several times. · Quantity A: The probability of getting more heads than tails in 5 tosses | Quantity B: The probability of getting more heads than tails in 6 tosses [setup: compare two binomial probabilities with p = 1/2 (at least / more heads than tails)]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-006:s2q3"`.

Revisit s1q28 of quant-006:s2q4 (you missed it): $k$ is a positive integer, and $k^2$ is divisible by 72. · Quantity A: The greatest integer that must be a divisor of $k$ | Quantity B: 12 [setup: k^2 divisible by 72: greatest number that must divide k]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-006:s2q4"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
