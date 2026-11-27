# Bank batch qbank-009 (quant, quant, seed 16930)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-009.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; a unit's questions share its passage or DI set, whose id is the unit's id; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-008:s1q11 (you missed it; no sibling in the bank yet); revisit quant-008:s2q13 (you missed it; no sibling in the bank yet); revisit quant-008:s2q7 (you missed it; no sibling in the bank yet); revisit quant-008:s2q14 (you missed it; no sibling in the bank yet); revisit quant-008:s2q8 (you missed it; no sibling in the bank yet); revisit quant-008:s2q15 (you missed it; no sibling in the bank yet); revisit quant-009:s2q4 (you missed it; no sibling in the bank yet); revisit quant-009:s1q9 (you missed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | mc | 5 | overlapping-sets | the most in exactly one, two or all three groups from the entry total |
| s1q2 | qc | 5 | overlapping-sets | the most in exactly one, two or all three groups from the entry total |
| s1q3 | numeric | 3 | word-problems-rate | average speed over two legs |
| s1q4 | mc | 5 | word-problems-rate | rate with a unit change mid-problem |
| s1q5 | mc | 3 | coordinate-geometry | which quadrants a line passes through |
| s1q6 | qc | 3 | coordinate-geometry | distance and midpoint |
| s1q7 | qc | 3 | inequalities | a chain a < b < c: what must be true of sums or differences |
| s1q8 | mc_multi | 5 | inequalities | ordering several expressions under a given range |
| s1q9 | mc | 3 | remainders-units | units digit of a large power (cycle length) |
| s1q10 | mc_multi | 5 | remainders-units | remainder written as a decimal part (n/d = q.25) |
| s1q11 | qc | 3 | primes-factors | GCD / LCM from two products or a word problem |
| s1q12 | mc | 3 | primes-factors | count of primes or factors in a stated range |
| s1q13 | qc | 3 | abs-value-inequalities | a tolerance stated as an absolute-value inequality |
| s1q14 | mc | 3 | abs-value-inequalities | an absolute-value equation with two cases, one extraneous |
| s1q15 | qc | 3 | polygons-quadrilaterals | interior angle sum of an n-gon, and regular polygons |
| s1q16 | numeric | 5 | polygons-quadrilaterals | a regular hexagon split into triangles |
| s1q17 | qc | 5 | estimation-sigfig | scientific notation arithmetic with large powers of 10 |
| s1q18 | qc | 3 | estimation-sigfig | rounding to a place, then computing |
| s1q19 | qc | 5 | quadratic-inequalities | sign analysis of a factored product (x - a)(x - b) < 0 |
| s1q20 | mc_multi | 5 | quadratic-inequalities | powers against the number: where x^2 > x or x^3 < x |
| s1q21 | mc | 4 | probability-conditional | conditional probability from a two-way table (revisit) |
| s1q22 | qc | 4 | inequalities | a word problem with an inequality constraint (revisit) |
| s1q23 | mc | 5 | overlapping-sets | three-set Venn diagram (revisit) |
| s1q24 | mc_multi | 5 | min-max-bounding | optimizing a product or a difference under constraints (revisit) |
| s1q25 | di (d1) | 3 | overlapping-sets | the neither region from a two-set problem |
| s1q26 | di (d1) | 4 | overlapping-sets | at least / at most counts from a survey with overlap |
| s1q27 | di (d1) | 5 | overlapping-sets | a double-matrix (two-way) table |

Units: d1 di3

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **overlapping-sets**
  - **worn** two-set problem with a neither bound; range of the number in exactly one (3×)
  - three overlapping sets, everyone in at least one; greatest number in exactly one
  - three sets with all-three and neither counts; number in exactly one
  - the overlap stated as a percent of each set: equate the two expressions to compare the sets' sizes
  - three sets with the exactly-two count and a neither count given; find the number in all three (counting by multiplicity)
  - two-way table with one cell relation linking two other cells; solve for a cell
  - two sets where the both count is a multiple of the neither count; solve for neither
  - three overlapping groups in a fixed population: the feasible range of the triple overlap (complement bound below, smallest group above)
  - two-way table with only margins given; one cell's range from keeping every other cell nonnegative
  - least overlap of two survey answers across two separate groups: bound each group separately; pooling the totals understates it
  - the overlap stated as a percent of one set and as a percent of the other; the count in neither set from a table total
  - two sets in a fixed population with a condition linking the neither count to the both count; the neither count is the both count plus a constant, so the link caps the overlap; the possible exactly-one counts
  - … 4 more (the novelty judge sees every one)
- **word-problems-rate**
  - **worn** out and back at two speeds; average speed for the round trip (2×)
  - two fill pipes and a drain together; time to fill
  - second traveller leaves later and faster on the same route; when it leads by a distance
  - one crew starts alone, the other joins; finish at a set time; solo time
  - upstream and downstream legs with a current; time difference
  - two legs with speeds in different units (km/h and m/s); total time
  - combined rate known and one machine slower by a fixed time: the rate equation becomes a quadratic
  - two swimmers going back and forth in a pool; time of the second meeting
  - drain part of a solution and replace it with the pure substance to reach a target concentration; amount drained
  - inlet and drain open together for a stretch, then the drain closes; total time to fill
  - a job measured in one unit while the rate switches to another unit partway; the time split from the total time, then the amount in the second unit
  - two solutions mixed to a target concentration, then a stated amount of water dilutes it to a second concentration; the dilution fixes the mixture's size, then the mixing equation gives one part
  - … 7 more (the novelty judge sees every one)
- **coordinate-geometry**
  - line through a point perpendicular to a given line; its x-intercept
  - general-form line with sign conditions on products of coefficients; select what it must pass through
  - line through a point meets the x-axis at a given distance; it is perpendicular to a line with an unknown coefficient; find the coefficient
  - a line through two given points; the sum of its two intercepts
  - a V-shaped region bounded above by a horizontal line; count the lattice points row by row, odd rows rounding the half-width down
  - a segment with one endpoint on each axis and a given midpoint; the endpoints from doubling the midpoint's coordinates; the segment's length (not the origin-to-midpoint distance)
  - two parallel lines; the perpendicular segment between them from a point on one (not the vertical gap)
  - two points written in terms of one unknown; the given slope fixes the unknown, then the y-intercept follows from the x-intercept (not the unknown itself)
  - two linear resource limits and nonnegativity bound a convex region; select the possible values of x + y (the maximum is at the crossing point, not at either line's intercept)
  - line from a point and a slope; the signs of its intercepts tell which quadrant it misses
  - two points with swapped coordinates: slope -1 and the intercept is their sum; with their distance, solve for one coordinate
  - two lines with one unknown coefficient whose slopes are negative reciprocals for every value of it; compare their crossing angle with 90 degrees
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
  - … 9 more (the novelty judge sees every one)
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
  - … 11 more (the novelty judge sees every one)
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
  - one unknown multiplier must make one product a perfect square and another product a perfect cube; each prime's exponent meets an even condition and a multiple-of-three condition at once, so the solutions are the least one times sixth powers
  - … 3 more (the novelty judge sees every one)
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
  - … 6 more (the novelty judge sees every one)
- **polygons-quadrilaterals**
  - rhombus with side and one diagonal; area against a value
  - interior angle k times the exterior angle; number of diagonals
  - count the diagonals of a regular polygon, then remove those through the center
  - the triangle on two adjacent vertices and an opposite vertex of a regular hexagon: its fraction of the hexagon's area
  - trapezoid diagonals cut it into four triangles; two triangle areas give the trapezoid's area
  - midpoints of a regular hexagon's sides form a smaller hexagon; the cut-off corner triangles with a 120-degree angle give the side ratio; compare areas
  - one more side adds a given number of diagonals; find the number of diagonals of the smaller polygon
  - interior angle k times the exterior angle fixes n for two regular polygons of equal perimeter; side lengths in inverse ratio of n
  - the diagonal count is a stated multiple of the side count; find n, then report the diagonals from one vertex (a neighbouring quantity)
  - the interior angle sum of a regular polygon is given; recover the number of sides, then divide for one angle
  - a rhombus with one angle and its shorter diagonal; the 60-degree angle makes an equilateral triangle, so the short diagonal equals the side; area from the two diagonals
  - a point inside a regular hexagon joined to all six vertices; alternate triangles' areas always sum to half (the distances to three alternate sides have a fixed sum); compare the two alternating sums
  - … 1 more (the novelty judge sees every one)
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
  - two rounded measurements, one divided by the other; the quotient's range comes from opposite ends of the two rounding intervals; select values inside it
  - two rates in different time units; convert one before taking the ratio; choices a factor of ten apart
  - a product of powers of 4 and 25 rewritten as a power of ten times a leftover power of two; the leftover's own digit count adds to the zeros
  - … 1 more (the novelty judge sees every one)
- **quadratic-inequalities**
  - rational inequality k/x > x - c; multiplying through by x loses the negative branch; compare x with the left root
  - x^3 < x with no sign given; compare x^2 with x across the two solution intervals
  - a quartic inequality that factors as n^2 times a quadratic; dividing by n^2 silently admits n = 0, which fails the strict inequality; count the integers
  - three ordered parameters with no values; one factored product negative (between its roots) and one positive (outside its roots) intersect to a sub-interval; the sign of a third pairing of the factors
  - a two-sided bound on n squared with a non-square lower bound and a square upper bound; count the integers of both signs
  - a linear-over-linear expression at least a constant; move everything to one side and read the sign chart; the boundary root is included and the pole excluded; count the integers
  - a product of two linear factors, one with the variable's sign reversed, is negative; the solution is outside the roots, not between them
  - two power inequalities on one number intersect to the negatives only; compare the cube with the number, which flips at -1
  - a constant over a linear expression below a negative constant: only one sign of the denominator can work, and multiplying by it flips the inequality
  - a quadratic inequality in the absolute value of the variable; the solution set is symmetric; count the integers including the boundary

Revisit s1q21 of quant-008:s1q11 (you missed it): One of the company's 2025 Express orders is to be selected at random. What is the probability that it was shipped from a warehouse at which Ground orders made up more than half of that warehouse's orders? · choices: $\dfrac{3}{32}$ / $\dfrac{3}{17}$ / $\dfrac{5}{11}$ / $\dfrac{1}{2}$ / $\dfrac{6}{11}$ [setup: DI: P(from a qualifying group) among one category]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-008:s1q11"`.

Revisit s1q22 of quant-008:s2q13 (you missed it): A theater charges \$12 for each adult ticket and \$7 for each child ticket. A group with 3 more children than adults spent at least \$100 and at most \$150 on tickets. Which of the following could be the number of adults in the group? Indicate all such numbers. · choices: 3 / 4 / 5 / 6 / 7 / 8 [setup: linear cost with a fixed difference in counts, bounded above and below; select possible counts]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-008:s2q13"`.

Revisit s1q23 of quant-008:s2q7 (you missed it): Of the 200 members of a sports club, 120 play tennis, 90 play golf and 75 swim. Twenty-five members do none of the three, and exactly 40 members do exactly two of the three. How many members do all three? · choices: 15 / 25 / 35 / 45 / 70 [setup: three sets with the exactly-two count and a neither count given; find the number in all three (counting by multiplicity)]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-008:s2q7"`.

Revisit s1q24 of quant-008:s2q14 (you missed it): A rectangle lies inside a right triangle with legs of lengths 6 and 8. Two sides of the rectangle lie along the legs, and the opposite corner of the rectangle lies on the hypotenuse. Which of the following could be the area of the rectangle? Indicate all such areas. · choices: $6$ / $10$ / $12$ / $13$ / $16$ / $24$ [setup: a rectangle in the corner of a right triangle: its area peaks at half the triangle's area; select attainable areas]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-008:s2q14"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
