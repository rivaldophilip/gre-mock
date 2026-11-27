# Bank batch qbank-011 (quant, quant, seed 21982)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-011.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; a unit's questions share its passage or DI set, whose id is the unit's id; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-009:s1q2 (you missed it; no sibling in the bank yet); revisit quant-009:s1q3 (you missed it; no sibling in the bank yet); revisit quant-009:s2q5 (you missed it; no sibling in the bank yet); revisit quant-009:s1q4 (you guessed it; no sibling in the bank yet); revisit quant-009:s2q9 (you missed it; no sibling in the bank yet); revisit quant-009:s1q6 (you missed it; no sibling in the bank yet); revisit quant-009:s2q6 (you missed it; no sibling in the bank yet); revisit quant-009:s1q12 (you missed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | qc | 5 | frequency-distributions | relative frequency and cumulative frequency |
| s1q2 | mc | 5 | frequency-distributions | median from a frequency table |
| s1q3 | mc | 4 | frequency-distributions | mean from a histogram's grouped data |
| s1q4 | mc | 5 | pythagorean-special | Pythagorean triples and their multiples |
| s1q5 | qc | 5 | pythagorean-special | a right triangle from a word problem or coordinates (distance) |
| s1q6 | mc_multi | 4 | pythagorean-special | altitude to the hypotenuse: similar right triangles |
| s1q7 | numeric | 4 | inscribed-figures | a shaded region: whole minus part |
| s1q8 | qc | 5 | inscribed-figures | a regular hexagon in a circle |
| s1q9 | mc | 3 | number-sense-qc | sign cases: negatives, zero and fractions between 0 and 1 |
| s1q10 | mc_multi | 5 | number-sense-qc | the sign of a product or quotient from a condition (ab < 0, a/b > 1) |
| s1q11 | mc | 3 | mean-median-mode | a sum from the mean and the count |
| s1q12 | numeric | 5 | mean-median-mode | mode and range of a combined list |
| s1q13 | qc | 3 | solids-volume | liquid poured between containers |
| s1q14 | mc_multi | 5 | solids-volume | cubes painted or cut into smaller cubes |
| s1q15 | numeric | 5 | probability-conditional | dependent events in sequence |
| s1q16 | qc | 5 | probability-conditional | drawing without replacement |
| s1q17 | mc_multi | 5 | area-perimeter | a border or path around a rectangle |
| s1q18 | mc | 5 | area-perimeter | the area of an irregular composite figure |
| s1q19 | numeric | 5 | algebraic-expressions | an expression's value from a related expression (x + 1/x given) |
| s1q20 | qc | 5 | algebraic-expressions | expressions with nested parentheses and signs |
| s1q21 | qc | 4 | number-sense-qc | both quantities depend on one variable with a restricted range (revisit) |
| s1q22 | mc | 5 | figures-not-to-scale | regions that look equal in area (revisit) |
| s1q23 | qc | 5 | probability-basic | geometric probability (a point in a region) (revisit) |
| s1q24 | qc | 5 | remainders-units | remainder written as a decimal part (n/d = q.25) (revisit) |
| s1q25 | di (d1) | 3 | frequency-distributions | which interval contains the median or a percentile |
| s1q26 | di (d1) | 4 | frequency-distributions | relative frequency and cumulative frequency |
| s1q27 | di (d1) | 5 | frequency-distributions | which interval contains the median or a percentile |

Units: d1 di3

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **frequency-distributions**
  - DI: change in the median after moving one category's values
  - one group's segments of a stacked interval graph; estimated mean from interval midpoints
  - DI: cumulative frequency table; least value at which the cumulative share reaches a given percent (a percentile)
  - DI: median of one group from a frequency table where the two middle values fall in adjacent rows
  - several frequency columns over the same population; count the columns whose median falls in a given row (cumulative counts against the middle position)
  - grouped whole-number data: the greatest possible mean of one row puts every value at its interval's top
  - DI: a percentile within a subgroup that leaves out one group's lowest row; re-base on the subgroup before accumulating (accumulating the whole group's column points to the row below)
  - cumulative relative frequency table; the count in a band of rows is the difference of two cumulative entries times the total
  - two grouped columns over the same intervals, one in percents of its group and one in counts; convert, combine and locate the median of the pooled data
  - histogram of whole-number values with a long left tail; weighted mean from bar heights against the median found by counting to the middle position
  - one frequency in a table is an unknown with a lower bound; the smallest allowed value makes the count even and puts the middle pair across two rows, larger values put it in one row
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
  - … 10 more (the novelty judge sees every one)
- **inscribed-figures**
  - **worn** square inscribed in a semicircle with one side on the diameter (3×)
  - **worn** incircle of a right triangle; distance from the incenter to a vertex or the circumcenter (2×)
  - square in a circle in a larger square of given area; compare the inner square's area with a value
  - equilateral triangle between its incircle and circumcircle; ring area gives the side
  - crescents on the legs of a right triangle inscribed in a circle: their total area equals the triangle's
  - circle through two vertices of a square and tangent to the opposite side; radius
  - four tangent circles in a square: the central gap is the centers' square minus four quarter disks
  - regular hexagon in a circle in a larger regular hexagon of given area; the inner area from the apothem-radius ratio
  - square on the diameter of a semicircle with its area given; the radius from the half-side, then semicircle minus square
  - three semicircles on one segment (two inside the large one); a perpendicular half-chord at the split point gives the product of the parts; area of the region between them
  - a rectangle with sides in a 2 to 1 ratio in a semicircle, the long side on the diameter; its area as a fraction of the semicircle (its diagonal is not a diameter)
  - regular hexagon in a circle with the hexagon's perimeter given; the area of the circular segment cut off by one side (one-sixth sector minus an equilateral triangle)
  - … 4 more (the novelty judge sees every one)
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
  - … 8 more (the novelty judge sees every one)
- **mean-median-mode**
  - **worn** add one value so the median equals the mean (2×)
  - five integers with given mean and median; greatest possible least value
  - DI: change in the mean per nest when one group is excluded
  - DI: combined mean of two groups weighted by counts
  - DI: possible median of two combined grouped distributions
  - DI: change one category's values, then compare the mean and the median of the new list
  - DI: medians of two percent columns with an even count (average the middle two); compare them
  - DI: the range of combined groups from the extreme whiskers against one group's range
  - DI: overall mean and count give the total; subtract known categories to get the mean of an open-ended category
  - DI: least number of added top values that moves the median of a frequency table to a target (odd against even count)
  - two lists combined, one unknown; the unique-mode condition breaks a tie and forces the unknown, while the range condition is already met across both lists (a one-list reading of it is the trap)
  - DI: the overall total from counts times means; add a new group of equal values until the overall mean reaches a target; the new group's size
  - … 7 more (the novelty judge sees every one)
- **solids-volume**
  - horizontal cylinder partly filled: circular-segment area times length
  - rectangular block painted on all faces but its base, then cut into unit cubes; count cubes with exactly two painted faces
  - a cone filled to half its height poured into a cylinder: the water's volume scales with the cube of the depth
  - horizontal cylinder more than half full, the empty segment's central angle given: whole cross section minus the empty segment, times the length
  - rectangular solid with the three face areas at one corner given; the volume is the square root of their product
  - a box cut by the plane through two diagonally opposite parallel edges: the cut's area gives the missing dimension; the surface area of one piece
  - a diagonal partition of a box along two opposite parallel edges, three possible pairs; the largest uses the longest edges with the diagonal of the face of the other two
  - a cylinder's radius and height scaled by different percents in opposite directions; the volume factor (radius squared) just above 1
  - a closed cylinder with whole-number radius and height and a fixed volume; select the possible total surface areas
  - two face diagonals and the space diagonal of a box given; the third face diagonal (each edge squared appears in two face diagonals)
  - a coated cube cut into unit cubes; the one-face count gives the edge, then the uncoated core
  - water from a cuboid poured into a cylinder that cannot hold it all: the depth is capped at the cylinder's height; compare with a value
- **probability-conditional**
  - **worn** DI: reverse conditional probability from percents of two groups (2×)
  - without replacement: unconditional P(second is red) vs P(second red | first red)
  - two draws without replacement: P(both red | at least one red)
  - DI: conditional probability with a given overlap between categories
  - DI: one pick from each of two groups, independently; P(exactly one meets a threshold)
  - DI: P(from a qualifying group) among one category
  - DI: P(exactly one of two overlapping events) from a table; remove the overlap twice
  - DI: greatest possible probability from interval-grouped data
  - DI: draws without replacement from one group until the first of a category appears; probability it is the k-th draw
  - DI: two draws without replacement from a frequency table; the probability both come from the same row
  - DI: one pick from a restricted part of a frequency table; P(one group or one value) with the overlap counted once
  - one event's probability read from a frequency column and a second given as a percent with no joint information; the least probability of both (sum minus one)
  - … 5 more (the novelty judge sees every one)
- **area-perimeter**
  - **worn** uniform border around a rectangle; border area against the outer dimensions or perimeter (3×)
  - rectangle from perimeter and diagonal; area via (a+b)^2 - (a^2+b^2)
  - rectangle with a fixed diagonal; select possible perimeters (range)
  - trade length for width at a fixed perimeter until a square; the area gain
  - corner cut from a rectangle: perimeter of the remaining L shape
  - perimeter of a composite figure: count only the outside edges (shared sides drop out)
  - rectangle cut into four by two cuts; three areas given, find the fourth (integer sides)
  - similar rectangles: the perimeter ratio and the larger area give the smaller area
  - one side scaled by a percent; the other side's percent change that gives a target area increase (factors multiply, not add)
  - one pair of sides of known length scaled by a percent at a fixed perimeter, the other pair unknown; the percent change in area is one expression in the unknown side, bounded by an unreachable limit; select the possible percent changes
  - a rectangle with a fixed perimeter; select the possible diagonal lengths (the square gives the least, a flat rectangle the unreachable greatest)
  - a rectilinear floor plan with one corner cut off and a semicircular bay; the missing height and the bay's diameter come from the labeled pieces; area = rectangle minus triangle plus half-disk
  - … 2 more (the novelty judge sees every one)
- **algebraic-expressions**
  - **worn** value of a symmetric expression (a^3 ± b^3, |a| + |b|, a^2 + b^2) from a ± b, ab or a^2 + b^2 (3×)
  - which expressions equal a rational expression on its whole domain (removable points)
  - which expressions equal (a - b)^2 (a + b)^2 identically
  - difference of two rational expressions that both simplify; compare with a constant (the excluded values do not matter)
  - remove nested brackets with sign changes; the expression collapses to one term
  - factor a difference of squares twice; select every polynomial factor, including composite ones
  - an identity in completed-square form: match constant terms to find k
  - x + 1/x given; a non-symmetric polynomial in x reduces to a constant by repeatedly replacing x^2 with a linear expression
  - x^2 + 1/x^2 given; recover x + 1/x by squaring back, with both signs possible
  - which regroupings equal a doubly nested difference of four letters
  - a doubly nested expression with a subtracted negative term simplifies to a multiple of a given linear combination; its value
  - which expressions equal a rational expression whose numerator factor is the negative of a denominator factor (the sign flip on cancelling), with one choice adding a new excluded point
  - … 2 more (the novelty judge sees every one)

Revisit s1q21 of quant-009:s1q2 (you missed it): $0.1 < x < 0.2$ · Quantity A: $\dfrac{1}{x} - x$ | Quantity B: $5$ [setup: x in a narrow decimal interval; 1/x - x crosses the benchmark inside it (D)]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-009:s1q2"`.

Revisit s1q22 of quant-009:s1q3 (you missed it): In triangle $ABC$ (not shown), point $D$ lies on side $BC$ with $BD = 2 \cdot DC$, and $E$ is the midpoint of segment $AD$. · Quantity A: The area of triangle $ABE$ | Quantity B: The area of triangle $ADC$ [setup: triangles sharing a height: split the area by a base ratio and then by a midpoint; compare two pieces]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-009:s1q3"`.

Revisit s1q23 of quant-009:s2q5 (you missed it): A point is chosen at random from the interior of a square with sides of length 2. · Quantity A: The probability that the point is less than 1 unit from the center of the square | Quantity B: $\dfrac{3}{4}$ [setup: random point in a square: the probability of landing in the inscribed disk (pi/4) against a fraction]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-009:s2q5"`.

Revisit s1q24 of quant-009:s1q4 (you guessed it): $n$ and $d$ are positive integers, and $\dfrac{n}{d} = 14.36$. · Quantity A: The least possible value of $d$ | Quantity B: $25$ [setup: the decimal part of n/d reduces to a fraction; the least divisor is its reduced denominator]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-009:s1q4"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
