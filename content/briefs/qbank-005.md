# Bank batch qbank-005 (quant, quant, seed 85993)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-005.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-007:s1q11 (you missed it; no sibling in the bank yet); revisit quant-007:s2q5 (you missed it; no sibling in the bank yet); revisit quant-007:s1q6 (you guessed it; no sibling in the bank yet); revisit quant-007:s2q11 (you missed it; no sibling in the bank yet); revisit quant-007:s1q7 (you guessed it; no sibling in the bank yet); revisit quant-007:s2q2 (you missed it; no sibling in the bank yet); revisit quant-007:s2q14 (you missed it; no sibling in the bank yet); revisit quant-007:s2q12 (you missed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | qc | 3 | geometry-coordinate | area of a polygon from its vertex coordinates |
| s1q2 | mc | 5 | geometry-coordinate | reflection of a point across an axis or y = x |
| s1q3 | mc | 4 | geometry-coordinate | a circle in the coordinate plane |
| s1q4 | qc | 5 | geometry-coordinate | reflection of a point across an axis or y = x |
| s1q5 | qc | 5 | integers-properties | digits and place value of an unknown number |
| s1q6 | qc | 3 | integers-properties | even/odd parity of sums and products of unknown integers |
| s1q7 | mc_multi | 4 | integers-properties | divisibility of an expression such as n(n+1)(n+2) for every integer n |
| s1q8 | mc | 5 | integers-properties | consecutive integers: sum, product or count in a range |
| s1q9 | qc | 3 | pythagorean-special | 45-45-90 triangle (square diagonal) |
| s1q10 | numeric | 5 | pythagorean-special | 30-60-90 triangle inside a hexagon, rhombus or trapezoid |
| s1q11 | mc_multi | 4 | pythagorean-special | Pythagorean triples and their multiples |
| s1q12 | mc | 5 | pythagorean-special | a right triangle from a word problem or coordinates (distance) |
| s1q13 | mc | 3 | graphs-of-functions | a shift, a stretch or a reflection of a graph |
| s1q14 | numeric | 5 | graphs-of-functions | parabola vertex, axis of symmetry and intercepts |
| s1q15 | mc_multi | 4 | graphs-of-functions | intersections of two graphs |
| s1q16 | numeric | 5 | graphs-of-functions | parabola vertex, axis of symmetry and intercepts |
| s1q17 | mc | 3 | weighted-average | the ratio of group sizes from the means |
| s1q18 | mc_multi | 4 | weighted-average | combining the means of two groups |
| s1q19 | numeric | 5 | weighted-average | the ratio of group sizes from the means |
| s1q20 | qc | 5 | weighted-average | a mixture's concentration as a weighted average |
| s1q21 | mc | 4 | remainders-units | last two digits of a product too large for the calculator |
| s1q22 | mc_multi | 5 | remainders-units | remainder of a negative or fractional expression of n |
| s1q23 | numeric | 4 | remainders-units | last two digits of a product too large for the calculator |
| s1q24 | qc | 5 | remainders-units | two remainder conditions at once: smallest such number |
| s1q25 | mc | 4 | probability-conditional | exactly one of two independent events (revisit) |
| s1q26 | mc | 4 | overlapping-sets | overlap given as percents of different bases (revisit) |
| s1q27 | mc | 4 | circles | chord length from the distance to the center (revisit) |
| s1q28 | mc | 5 | counting-permutations | circular arrangements (revisit) |

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **geometry-coordinate**
  - opposite vertices of a square given; find another vertex
  - triangle formed by a point and its images across y = x and across an axis; its area
  - a line through a fixed first-quadrant point cuts off a triangle of given area with the axes; the slope from the two intercepts
  - circle from its center and one point on it; length of the chord it cuts on an axis
  - adjacent vertices of a square on the two axes; find another vertex by turning the side vector 90 degrees (the center method for opposite vertices is the trap)
  - convex quadrilateral with one vertex coordinate unknown and the area given; split by a diagonal, the absolute value gives two positions and convexity rejects one
  - circles tangent to both axes through a given point: the radius solves a quadratic with two roots; the distance between the two possible centers on the line y = x
  - shortest path from one point to an axis and on to a second point: reflect one point across the axis and join with a straight line; the touching point
  - a circle given in expanded form; complete the square for the center and radius; select the points strictly inside (some lie exactly on the circle)
  - a triangle with two fixed vertices on the x-axis and the third on the y-axis; isosceles cases by which pair of sides is equal, the equal-sides-at-the-apex case impossible off the perpendicular bisector
  - a point reflected across y = x and then across the x-axis is a quarter turn about the origin; select what must hold (the order of the reflections matters)
  - area of a tilted quadrilateral from its vertices: an enclosing rectangle minus the corner triangles
  - … 2 more (the novelty judge sees every one)
- **integers-properties**
  - **worn** k^2 leaves remainder 1 mod 8; compare k mod 8 with k^3 mod 8 (2×)
  - n with exactly 3 divisors is p^2; compare divisor counts of n^2 and 2n
  - k^2 divisible by 72: greatest number that must divide k
  - reversing a two-digit number changes it by 9 times the digit difference; count the numbers
  - parity of ab + a + b through (a + 1)(b + 1) - 1; count pairs
  - count divisors of N divisible by one number but not another (from the prime factorization)
  - a sum of an odd number k of consecutive integers is k times the middle one; select which numbers qualify
  - two parity conditions on three unknown integers (one leaves open which of two is even); which expression must be odd
  - a digit condition makes a three-digit number a multiple of 11; compare the remainder with the units digit, which can be zero
  - a run of consecutive integers ending at a given positive number has a small given sum; negatives cancel their opposites, which fixes the start; count the terms
  - product of four consecutive integers whose first is a multiple of a prime; select the numbers that must divide it (one plug-in makes extra divisors look forced)
  - several integers with an odd sum and an even product; the greatest possible number of odd ones (the count of odd terms must be odd)
  - … 4 more (the novelty judge sees every one)
- **pythagorean-special**
  - **worn** oblique triangle with 45° and 30° angles split by an altitude into two special right triangles; area or a side (2×)
  - altitude to the hypotenuse splits it into given segments; perimeter
  - 30-60-90 right triangle with the altitude to the hypotenuse given; hypotenuse
  - quadrilateral split by a diagonal into a 45-45-90 and a 30-60-90 triangle; a side or the area
  - box with a square base and a given height; the space diagonal gives the base area
  - a perpendicular splits a triangle into pieces whose leg ratios reveal 45-45-90 and 30-60-90 triangles; add the angles at the vertex (backwards)
  - sliding ladder: two right triangles with the same hypotenuse (7-24-25, then 15-20-25)
  - a square whose diagonal exceeds its side by a given length: solve s sqrt2 = s + 1
  - walk with legs along compass directions; straight-line distance from the net legs
  - regular hexagon with a given side; the triangle on alternate vertices, its side from a 30-60-90 half of a 120-degree isosceles triangle; its area
  - altitude to the hypotenuse and one hypotenuse segment given; the other segment from the geometric mean, then the area with the altitude as height
  - a right triangle with integer sides and one given leg; select the possible hypotenuses (factor the difference of squares into same-parity pairs: primitive and scaled triples)
  - … 6 more (the novelty judge sees every one)
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
  - a piecewise-linear graph read twice: find f(x) between vertices, then read f at that output; select the inputs where the composition is negative (not where f itself is negative)
  - a circle against a parabola: substitute to get a quadratic in y, keep the roots with x^2 = y + c nonnegative, and count one point (not two) where x = 0
  - a graph unchanged by a half-turn about the origin with its formula given only for positive x; a value at a negative input fixes the unknown coefficient through f(-x) = -f(x); then evaluate at a positive input
  - … 1 more (the novelty judge sees every one)
- **weighted-average**
  - two group means and one group's size; find the other group's size from the overall mean
  - add members of one kind outside a category to dilute the category's share to a subgroup's share; count from stacked bars
  - two group means and which group is larger; combined mean vs the midpoint of the means
  - a frequency table gives a group's mean; a few new members with one equal score join; the rise in the mean
  - a table of group sizes and means; which whole group joining a fixed group raises its mean the most (gap times share, not the largest gap)
  - DI: two pairs of groups, each pair's combined mean weighted by counts; the difference of the two combined means (the unweighted averages order the pairs the other way)
  - two solutions of known amounts and concentrations plus a fixed amount of a third; the third's concentration that brings the whole to a target (balance the solute, weighted by volume)
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
  - … 7 more (the novelty judge sees every one)

Revisit s1q25 of quant-007:s1q11 (you missed it): One volunteer is chosen at random from the Northside volunteers and, independently, one from the Lakeview volunteers. Approximately what is the probability that exactly one of the two chosen volunteers logged at least 30 hours? · choices: 0.06 / 0.24 / 0.37 / 0.42 / 0.48 [setup: DI: one pick from each of two groups, independently; P(exactly one meets a threshold)]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-007:s1q11"`.

Revisit s1q26 of quant-007:s2q5 (you missed it): At a club, 60 percent of the members who play chess also play go, and 40 percent of the members who play go also play chess. At least one member plays both games. · Quantity A: The number of members who play chess | Quantity B: The number of members who play go [setup: the overlap stated as a percent of each set: equate the two expressions to compare the sets' sizes]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-007:s2q5"`.

Revisit s1q27 of quant-007:s1q6 (you guessed it): A circle with center $O$ has radius 10, and chord $AB$ has length 16. Point $C$ lies on the circle, on the shorter of the two arcs from $A$ to $B$, so that $AC = BC$. What is the length of $AC$? · choices: $4\sqrt{3}$ / $8$ / $4\sqrt{5}$ / $10$ / $8\sqrt{5}$ [setup: chord and radius give the distance to the center; chord to the arc midpoint]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-007:s1q6"`.

Revisit s1q28 of quant-007:s2q11 (you missed it): Eight people, among them two married couples, are to be seated around a circular table with eight seats. Seatings that differ only by a rotation are considered the same. In how many seatings does neither couple sit side by side? · choices: 2,160 / 2,640 / 3,600 / 4,080 / 5,040 [setup: circular seating; two pairs must not sit together (inclusion-exclusion)]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-007:s2q11"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
