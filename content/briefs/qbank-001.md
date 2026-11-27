# Bank batch qbank-001 (quant, quant, seed 80632)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-001.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-005:s2q1 (you missed it; no sibling in the bank yet); revisit quant-005:s2q3 (you missed it; no sibling in the bank yet); revisit quant-005:s2q5 (you missed it; no sibling in the bank yet); revisit quant-006:s1q5 (you missed it; no sibling in the bank yet); revisit quant-006:s1q3 (you missed it; no sibling in the bank yet); revisit quant-006:s1q8 (you missed it; no sibling in the bank yet); revisit quant-006:s1q7 (you missed it; no sibling in the bank yet); revisit quant-006:s1q11 (you missed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | mc | 4 | probability-basic | probability as a ratio of combinations (choose k of n) |
| s1q2 | qc | 5 | probability-basic | complement: at least one success |
| s1q3 | mc | 4 | probability-basic | geometric probability (a point in a region) |
| s1q4 | qc | 5 | probability-basic | geometric probability (a point in a region) |
| s1q5 | mc_multi | 5 | coordinate-geometry | a region defined by inequalities in the plane |
| s1q6 | mc | 4 | coordinate-geometry | which quadrants a line passes through |
| s1q7 | numeric | 5 | coordinate-geometry | slope and intercepts from two points |
| s1q8 | qc | 4 | coordinate-geometry | parallel and perpendicular lines |
| s1q9 | mc_multi | 5 | std-dev-normal | comparing the spread of two lists without computing |
| s1q10 | mc | 4 | std-dev-normal | spread read from a dot plot or a frequency table |
| s1q11 | numeric | 5 | std-dev-normal | the standard deviation of two lists combined, when their means differ |
| s1q12 | qc | 4 | std-dev-normal | the least or greatest possible standard deviation under a constraint |
| s1q13 | mc_multi | 4 | number-sense-qc | sign cases: negatives, zero and fractions between 0 and 1 |
| s1q14 | mc | 5 | number-sense-qc | a square or a reciprocal against the original number |
| s1q15 | numeric | 4 | number-sense-qc | non-integer test values that flip the relationship |
| s1q16 | qc | 5 | number-sense-qc | x between -1 and 0: powers and reciprocals ordered |
| s1q17 | mc_multi | 4 | number-line-abs | |a| + |b| against |a + b| for signed values |
| s1q18 | mc | 5 | number-line-abs | distance between two numbers as an absolute value |
| s1q19 | numeric | 4 | number-line-abs | ordering expressions of a number located between two marks |
| s1q20 | qc | 5 | number-line-abs | positions of unlabeled points on a number line |
| s1q21 | mc_multi | 5 | geometry-coordinate | reflection of a point across an axis or y = x |
| s1q22 | mc | 4 | geometry-coordinate | area of a polygon from its vertex coordinates |
| s1q23 | numeric | 5 | geometry-coordinate | a circle in the coordinate plane |
| s1q24 | qc | 4 | geometry-coordinate | a triangle's vertices on the axes |
| s1q25 | mc_multi | 4 | solids-volume | cylinder volume or surface area |
| s1q26 | mc | 5 | solids-volume | rectangular solid: faces, volume, diagonal |
| s1q27 | numeric | 4 | solids-volume | cubes painted or cut into smaller cubes |
| s1q28 | qc | 5 | solids-volume | liquid poured between containers |
| s1q29 | qc | 4 | integers-properties | divisibility of an expression such as n(n+1)(n+2) for every integer n (revisit) |
| s1q30 | qc | 5 | min-max-bounding | greatest or least value of one item under a sum constraint (revisit) |
| s1q31 | qc | 5 | probability-basic | probability from a count of outcomes with dice or coins (revisit) |
| s1q32 | mc | 3 | percent | successive percent changes and reversal (up x%, then down x%) (revisit) |

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **probability-basic**
  - **worn** compare two binomial probabilities with p = 1/2 (at least / more heads than tails) (2×)
  - three dice: P(product divisible by 4) via complement cases
  - two independent draws from different-sized boxes; P(first > second) vs a value
  - three independent choices among 4 options: P(exactly one option unused)
  - P(A) and P(A or B) for independent events; compare P(B) with a value
  - random point in a square: the probability of landing in the inscribed disk (pi/4) against a fraction
  - P(at least one success) with vs without replacement
  - random draw of several items from matched pairs; probability of exactly one complete pair (combinations ratio)
  - two independent uniform arrival times in one interval with a fixed stay: the meeting region is a band in a square; compare with a fraction
  - choose several from a group of two kinds; the probability of at least one of each kind by removing both single-kind selections
  - independent repeated trials with a success chance other than one half; exactly k successes in n trials (one arrangement times the number of arrangements)
  - repeated independent trials stopped at the first failure; at least k trials means the first k - 1 all succeed; against one half
  - … 1 more (the novelty judge sees every one)
- **coordinate-geometry**
  - line through a point perpendicular to a given line; its x-intercept
  - general-form line with sign conditions on products of coefficients; select what it must pass through
  - line through a point meets the x-axis at a given distance; it is perpendicular to a line with an unknown coefficient; find the coefficient
  - a line through two given points; the sum of its two intercepts
  - a V-shaped region bounded above by a horizontal line; count the lattice points row by row, odd rows rounding the half-width down
  - a segment with one endpoint on each axis and a given midpoint; the endpoints from doubling the midpoint's coordinates; the segment's length (not the origin-to-midpoint distance)
  - two parallel lines; the perpendicular segment between them from a point on one (not the vertical gap)
  - two points written in terms of one unknown; the given slope fixes the unknown, then the y-intercept follows from the x-intercept (not the unknown itself)
- **std-dev-normal**
  - **worn** two values added at mean ± 1 SD to a list; compare the new SD with the old (4×)
  - DI with a normal assumption: count above mean + 1 SD across two groups
  - normal distribution: P(above +3σ... of those above +1σ) as a conditional fraction vs a value
  - normal: percents above/below two values give the mean and SD; compare two tail percents
  - a list transformed by y = -2x + 30: the SD scales by |-2| and the shift does nothing
  - two equal-size lists with equal SDs and different means; combined SD vs the common SD
  - a list with one low outlier gets a new maximum that sits close to the mean; compare the new SD with the old
  - two frequency columns that are mirror images of each other: equal standard deviations, means reflected about the middle score
  - two normal groups with different means and SDs, one group's size and the combined count inside a fixed band given; the band sits at different SD distances in each group; solve for the other group's size
  - two integer lists of the same size whose sums differ by one; compare their least possible standard deviations (a half-integer mean forces every value off the mean)
  - DI: groups of three values read off the plot; a group with a slightly smaller range but two values bunched at one end has the larger standard deviation
- **number-sense-qc**
  - x between 0 and 1: compare the reciprocal 1/x with 1 + x
  - positive integer factor pairs of a fixed product; compare x + y with a value
  - x^3 < x restricts x; compare x^2 with |x| or -x
  - ab > 0 and a > b; compare 1/a with 1/b (same sign flips the order)
  - x > y and 1/x > 1/y force opposite signs; compare x - y with |x + y|
  - x < 0 < y with x + y > 0; compare x/y with y/x
  - integer n with n^2 < 5: compare n^3 with n^2 (negative, zero and one cases)
  - x strictly between two integers: the sign of (x - 2)(x - 3) decides x^2 - 5x against -6
  - x in a narrow decimal interval; 1/x - x crosses the benchmark inside it (D)
  - x/y > 1: compare x with y (sign of y decides: D)
  - x between 0 and 1: the mean of x and its reciprocal against 1 + x
  - x rounds to a given integer; compare its square, rounded, with the square of that integer
  - … 4 more (the novelty judge sees every one)
- **number-line-abs**
  - |x - a| < |x + b|: x is nearer a than -b; compare x with the midpoint
  - equally spaced ticks with two fractional labels; locate two unlabeled points and compare their sum with the tick spacing
  - opposite signs: the absolute difference equals the sum of the absolute values
  - x between two negative marks; compare x^2 with x + 1 (the crossover lies inside the interval)
  - two unknowns at given distances from the same point; their distance from each other is the difference or the sum of those distances; compare with a value
  - a number located strictly between two positive marks; compare the reciprocal minus one with one minus the number (the difference is a square over the number)
  - two signed moves with the net change and the total distance given; the product of the moves against a value
  - a negative point left of -1 and a point between 0 and 1 read off the line; compare their product with the negative point (a fraction of a negative number is nearer zero)
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
- **solids-volume**
  - horizontal cylinder partly filled: circular-segment area times length
  - rectangular block painted on all faces but its base, then cut into unit cubes; count cubes with exactly two painted faces
  - a cone filled to half its height poured into a cylinder: the water's volume scales with the cube of the depth
  - horizontal cylinder more than half full, the empty segment's central angle given: whole cross section minus the empty segment, times the length
  - rectangular solid with the three face areas at one corner given; the volume is the square root of their product
  - a box cut by the plane through two diagonally opposite parallel edges: the cut's area gives the missing dimension; the surface area of one piece
  - a diagonal partition of a box along two opposite parallel edges, three possible pairs; the largest uses the longest edges with the diagonal of the face of the other two
  - a cylinder's radius and height scaled by different percents in opposite directions; the volume factor (radius squared) just above 1

Revisit s1q29 of quant-005:s2q1 (you missed it): $k$ is a positive integer, and the product $k(k+1)(k+2)$ is not divisible by 4. · Quantity A: The remainder when $k$ is divided by 4 | Quantity B: $1$ [setup: k(k+1)(k+2) not divisible by 4 fixes k mod 4; compare with a value]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-005:s2q1"`.

Revisit s1q30 of quant-005:s2q3 (you missed it): Four parcels in a mailroom have four different weights, each a whole number of kilograms. Their total weight is 30 kilograms, and no parcel weighs more than 10 kilograms. · Quantity A: The least possible weight, in kilograms, of the second-heaviest parcel | Quantity B: $7$ [setup: distinct integer weights with a sum and a cap; least possible second-largest]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-005:s2q3"`.

Revisit s1q31 of quant-005:s2q5 (you missed it): Kim draws one ticket at random from a box of 10 tickets numbered 1 through 10. Independently, Lee draws one ticket at random from a box of 12 tickets numbered 1 through 12. · Quantity A: The probability that the number on Kim's ticket is greater than the number on Lee's ticket | Quantity B: $\dfrac25$ [setup: two independent draws from different-sized boxes; P(first > second) vs a value]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-005:s2q5"`.

Revisit s1q32 of quant-006:s1q5 (you missed it): A farm stand raised the price of a jar of honey by 20 percent in June and then lowered the new price by 20 percent in September. In December it raised the September price by $p$ percent, which brought the price back exactly to its original value. To the nearest tenth, what is $p$? · choices: $0.0$ / $4.0$ / $4.2$ / $4.8$ / $20.0$ [setup: price up p% then down q% (or back to a reference); find the missing percent or value]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-006:s1q5"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
