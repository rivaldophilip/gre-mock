# Brief quant-020 (quant, seed 4471)

Untaken tests (their targets are damped, so this test spreads to other items): drill-002, drill-003, drill-004, drill-005, drill-006, drill-007, drill-008, drill-009, drill-010, drill-011, drill-012, drill-013, drill-014, drill-015, quant-019, verbal-017, verbal-018, verbal-019

## Slots

| sec | slot | type | level | passage |
|---|---|---|---|---|
| 1 | 1 | qc | 3 |  |
| 1 | 2 | qc | 4 |  |
| 1 | 3 | qc | 4 |  |
| 1 | 4 | qc | 5 |  |
| 1 | 5 | mc | 3 |  |
| 1 | 6 | mc | 4 |  |
| 1 | 7 | mc | 5 |  |
| 1 | 8 | mc_multi | 4 |  |
| 1 | 9 | numeric | 3 |  |
| 1 | 10 | di | 3 |  |
| 1 | 11 | di | 4 |  |
| 1 | 12 | di | 5 |  |
| 2 | 1 | qc | 4 |  |
| 2 | 2 | qc | 5 |  |
| 2 | 3 | qc | 5 |  |
| 2 | 4 | qc | 4 |  |
| 2 | 5 | qc | 5 |  |
| 2 | 6 | mc | 4 |  |
| 2 | 7 | mc | 5 |  |
| 2 | 8 | mc | 5 |  |
| 2 | 9 | mc | 4 |  |
| 2 | 10 | mc | 3 |  |
| 2 | 11 | mc | 5 |  |
| 2 | 12 | mc | 4 |  |
| 2 | 13 | mc_multi | 4 |  |
| 2 | 14 | mc_multi | 5 |  |
| 2 | 15 | numeric | 4 |  |

Type focus (need >= 0.4, put the weakest items here): mc_multi, mc, di, qc, numeric

## Concept slots (one primary concept per question, any order; a DI set shares an area)

Write each question as its variant (the form of the concept earlier mocks used least), with a setup that is **not** in the slot's history below: new numbers, names or a story around a listed setup are the same item. **Worn** setups (2+ tests) are banned outright. Record `setup` and `variant` on each question. A slot marked **revisit** is the one exception: a sibling of an item you missed, with the change named (at most 4 per test).

wrong on a question testing it (269):
- **counting-restrictions**: Counting with restrictions and arrangements (data). Variant: identical items arranged with a restriction. Asked before:
  - row seating: two people not adjacent and neither at an end (001 s1q7)
  - count integers in a range divisible by one number or another but not a third (inclusion-exclusion) (001 s2q15)
  - lane assignment: two runners adjacent, a third not at either end (003 s1q7)
  - committee with at least one of a group and two people who cannot serve together (004 s1q7)
  - order items so that no two of one group are consecutive and the first isn't from it (gaps) (005 s1q7)
  - count four-digit numbers whose digits have a given product (006 s1q7)
  - row with no two children adjacent and one child next to a given adult (007 s1q7)
  - schedule with one item before another but not adjacent, plus a slot restriction (008 s1q7)
  - identical items of three kinds with a cap per kind (stars and bars minus the overflows) (009 s1q7)
  - crew with exactly k from one group and a one-way condition (A only if B); remove the forbidden pairs (010 s1q7)
  - row seating as a probability: two people non-adjacent with neither at an end, against a fraction (012 s2q2)
  - choose a set with at least one of each of three kinds: total minus sets missing one kind, plus the single-kind sets counted twice (014 s1q7)
  - three-digit even numbers above a bound with distinct digits: the leading digit's parity changes the units count, so split into two cases (015 s1q7)
  - row order with a third person kept off both ends: two people adjacent compared with the same two exactly one place apart (017 s2q1)
  - choose a group from three kinds of different sizes with the same cap on every kind; the cap forces a single split pattern, counted by which kind takes the short share (018 s1q7)
- **geometry-coordinate**: Geometry in the coordinate plane (geometry). Variant: reflection of a point across an axis or y = x. Asked before:
  - opposite vertices of a square given; find another vertex (002 s2q11)
  - triangle formed by a point and its images across y = x and across an axis; its area (011 s2q9)
  - a line through a fixed first-quadrant point cuts off a triangle of given area with the axes; the slope from the two intercepts (012 s2q6)
  - circle from its center and one point on it; length of the chord it cuts on an axis (013 s1q6)
  - adjacent vertices of a square on the two axes; find another vertex by turning the side vector 90 degrees (the center method for opposite vertices is the trap) (015 s2q8)
  - convex quadrilateral with one vertex coordinate unknown and the area given; split by a diagonal, the absolute value gives two positions and convexity rejects one (016 s1q7)
  - circles tangent to both axes through a given point: the radius solves a quadratic with two roots; the distance between the two possible centers on the line y = x (018 s1q6)
- **overlapping-sets**: Overlapping sets, Venn diagrams (data). Variant: three-set Venn diagram. Asked before:
  - **revisit quant-004:s2q11** (you missed it): Each of the 120 volunteers at a festival is trained for at least one of three tasks: 90 are trained for first aid, 85 for ticketing and 80 for stage setup. What is the greatest possible number of volunteers who are trained for exactly one of the three tasks? · choices: 15 / 37 / 45 / 52 / 67 [setup: three overlapping sets, everyone in at least one; greatest number in exactly one]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-004:s2q11"`.
  - **worn** two-set problem with a neither bound; range of the number in exactly one (001 s2q12, 003 s1q8, 006 s2q13)
  - three overlapping sets, everyone in at least one; greatest number in exactly one (004 s2q11)
  - three sets with all-three and neither counts; number in exactly one (005 s2q11)
  - the overlap stated as a percent of each set: equate the two expressions to compare the sets' sizes (007 s2q5)
  - three sets with the exactly-two count and a neither count given; find the number in all three (counting by multiplicity) (008 s2q7)
  - two-way table with one cell relation linking two other cells; solve for a cell (009 s2q8)
  - two sets where the both count is a multiple of the neither count; solve for neither (010 s2q7)
  - three overlapping groups in a fixed population: the feasible range of the triple overlap (complement bound below, smallest group above) (012 s2q13)
  - two-way table with only margins given; one cell's range from keeping every other cell nonnegative (014 s2q13)
  - least overlap of two survey answers across two separate groups: bound each group separately; pooling the totals understates it (015 s1q12)
  - the overlap stated as a percent of one set and as a percent of the other; the count in neither set from a table total (017 s1q11)
  - two sets in a fixed population with a condition linking the neither count to the both count; the neither count is the both count plus a constant, so the link caps the overlap; the possible exactly-one counts (018 s1q8)
- **fractions-decimals**: Fractions, decimals and decimal representation (arithmetic). Variant: terminating vs repeating decimal from the denominator's prime factors. Asked before:
  - sum of two repeating decimals vs 1 (002 s2q4)
  - compare (10^8 + 1)/(10^9 + 1) with (10^9 + 1)/(10^10 + 1) (003 s2q3)
  - digits after the decimal point of k/(2^a 5^b) for odd k (004 s2q4)
  - tank goes from one fraction full to another after a draw; amount to fill (005 s1q9)
  - telescoping product of (1 - 1/k^2) (006 s1q9)
  - which fraction lies between two close fractions (007 s2q10)
  - repeating decimal x; compare 1/x with a value (008 s1q1)
  - an expression with surds whose irrational parts cancel; compare it with a whole number (009 s1q1)
  - which fraction terminates: reduce first, then check the denominator's primes (010 s2q10)
  - a nonzero rational combined with an irrational: closure under sum, product and quotient against squares and reciprocal sums that can cancel (012 s1q8)
  - sum and product of two numbers rational; select the symmetric expressions forced rational, with conjugate counterexamples for the rest (014 s1q8)
  - a fraction between 0 and 1 with unknown parts; which transformed fractions must exceed it (the same amount added to or taken from both parts, square, root, a mixed form) (016 s2q13)
  - the k-th digit of a repeating decimal with one non-repeating digit before the period, against a digit of a pure repeating decimal (017 s2q3)
- **exponents-roots**: Exponents and radicals (arithmetic). Variant: bases between 0 and 1 or negative bases. Asked before:
  - **worn** (b^{n+k} ± b^n) over a similar sum of powers: factor out the common power (002 s1q2, 005 s1q2)
  - **worn** sqrt(3·9^n) against a power of 3: rewrite as powers of 3 (003 s2q1, 004 s1q2)
  - sqrt(a+2) - sqrt(a) vs sqrt(a) - sqrt(a-2) (conjugates) (006 s2q1)
  - 0 < x < 1: compare two negative fractional powers of x (the more negative exponent gives the larger value) (007 s1q2)
  - 5th root of 5 vs cube root of 3 (raise both to the 15th) (008 s2q1)
  - a negative fractional power is given; raise it to another power by multiplying exponents (009 s2q1)
  - sqrt(a + 2sqrt b) - sqrt(a - 2sqrt b) denested; compare with a root (010 s1q2)
  - sum of reciprocals of consecutive root sums telescopes after rationalizing; select n making it an integer (013 s2q14)
  - sum of two powers with negative bases against the power of the negative sum; the exponent's parity decides the signs and flips the order (016 s2q1)
  - a negative square-root power of a sum of two bases above 1 against the sum of the same powers of the bases (the exponent does not distribute) (017 s1q2)
- **probability-conditional**: Conditional probability and dependent events (data). Variant: conditional probability from a two-way table. Asked before:
  - **revisit quant-004:s1q12** (you missed it): In 2024, 15 percent of the trips that started in Riverside lasted longer than 30 minutes. Of all 2024 trips that started in Uptown or Riverside and lasted longer than 30 minutes, 60 percent started in Uptown. If one 2024 trip is chosen at random from the trips that started in Uptown or Riverside, what is the probability that it lasted longer than 30 minutes? Give your answer as a fraction. [setup: DI: reverse conditional probability from percents of two groups]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-004:s1q12"`. Earlier items already rework this setup, and the judge compares the sibling with them too, so make a change none of them made: quant-005:s1q12: Suppose that 20 percent of the DVD loans in 2022 and 40 percent of the DVD loans in 2024 were returned late. If one DVD loan is selected at random from all the DVD loans in those two years that were returned late, what….
  - **worn** DI: reverse conditional probability from percents of two groups (004 s1q12, 005 s1q12)
  - without replacement: unconditional P(second is red) vs P(second red | first red) (001 s2q3)
  - two draws without replacement: P(both red | at least one red) (001 s2q6)
  - DI: conditional probability with a given overlap between categories (006 s1q11)
  - DI: one pick from each of two groups, independently; P(exactly one meets a threshold) (007 s1q11)
  - DI: P(from a qualifying group) among one category (008 s1q11)
  - DI: P(exactly one of two overlapping events) from a table; remove the overlap twice (009 s1q12)
  - DI: greatest possible probability from interval-grouped data (010 s1q12)
  - DI: draws without replacement from one group until the first of a category appears; probability it is the k-th draw (012 s1q12)
  - DI: two draws without replacement from a frequency table; the probability both come from the same row (014 s1q11)
  - DI: one pick from a restricted part of a frequency table; P(one group or one value) with the overlap counted once (016 s1q12)
  - one event's probability read from a frequency column and a second given as a percent with no joint information; the least probability of both (sum minus one) (018 s1q12)
- **normal-distribution**: Normal distribution: 68-95-99.7 rule, z-scores, percentiles (data). Variant: a percentile from a z-score. Asked before:
  - variance given rather than SD; percentile at two SDs above the mean against the 95 from the empirical rule (011 s2q2)
  - an interval from one to three standard deviations above the mean: one tail band only, against a value (012 s2q4)
  - normal with known mean and one upper-tail probability; lower-tail probability at a nearer cutoff vs that probability (013 s2q1)
  - two normal populations with different means and standard deviations; the cutoff farther in raw units is nearer in standard deviations; compare upper-tail percents (016 s2q2)
  - normal distribution with a known mean and one upper-tail percent; the percent in the band symmetric about the mean against a value (the two tails are equal) (017 s1q1)
- **counting-permutations**: Counting: permutations and combinations (data). Variant: circular arrangements. Asked before:
  - four-digit even numbers with strictly decreasing digits (choose sets) (002 s1q7)
  - arrange pairs of identical items with no two alike adjacent (003 s2q7)
  - arrange flags with repeated colors, two identical ones not adjacent (complement) (004 s2q15)
  - choose and order relay runners with a pairing condition between two runners (005 s2q8)
  - split 8 people into unordered pairs with two sibling pairs not together (006 s2q8)
  - circular seating; two pairs must not sit together (inclusion-exclusion) (007 s2q11)
  - subsets with more of one kind than another: symmetry pairs them, then remove the equal case (008 s2q11)
  - four-digit numbers from tiles with one repeated digit (cases by count of the repeat) (009 s2q11)
  - two distinct offices (ordered) followed by an unordered committee from the rest (010 s2q11)
  - points on two parallel lines; count triangles by which line holds two vertices (013 s1q7)
  - the count of numbers with strictly decreasing digits is given; find the possible digit lengths (choosing sets, with the symmetric choose count) (015 s1q8)
  - the count of strings using each of several letters twice with no identical letters adjacent is given; find the number of letters (017 s1q6)
  - equal counts of subsets of two different sizes fix the set's size by symmetry; then the number of subsets up to a small size, the empty set included (018 s2q11)
- **circles**: Circles: arcs, sectors, chords, tangents (geometry). Variant: chord length from the distance to the center. Asked before:
  - chord length gives the central angle; minor arc length (002 s1q6)
  - two parallel chords at known distances from the center (003 s2q6)
  - annulus with a chord of the outer circle tangent to the inner; ring area (004 s2q6)
  - arc length and sector area give r and angle; compare the chord with a value (005 s2q2)
  - two equal circles at a given center distance; area of the overlap (lens) (006 s2q7)
  - chord and radius give the distance to the center; chord to the arc midpoint (007 s1q6)
  - two wheels of different diameters cover the same distance; the difference in rotations (008 s2q6)
  - two tangents from an external point; area between the tangents and the minor arc (009 s2q9)
  - concentric lanes: the extra distance per lap is 2 pi times the gap, independent of the radius (010 s2q6)
  - a radius-radius isosceles triangle gives the central angle; the inscribed angle from a point on the minor arc uses the reflex arc (012 s2q8)
  - chord and radius give the central angle; the inscribed angle from the major arc makes an isosceles inscribed triangle equilateral; its area (014 s2q8)
  - a measuring wheel's turns around a circle's edge give that circle's circumference; the enclosed area (015 s2q9)
  - the region between two arcs of one sector: the two arc lengths and the radial depth give the radii and the angle; its area (average arc times depth) (017 s2q11)
  - a tangent length and the external point's distance to the circle (not to the center) given; the radius from the right angle at the point of tangency (018 s2q8)
- **probability-basic**: Probability: independent events, complement (data). Variant: independent events across repeated trials. Asked before:
  - **worn** compare two binomial probabilities with p = 1/2 (at least / more heads than tails) (001 s2q1, 006 s2q3)
  - three dice: P(product divisible by 4) via complement cases (004 s2q7)
  - two independent draws from different-sized boxes; P(first > second) vs a value (005 s2q5)
  - three independent choices among 4 options: P(exactly one option unused) (007 s2q8)
  - P(A) and P(A or B) for independent events; compare P(B) with a value (008 s2q5)
  - random point in a square: the probability of landing in the inscribed disk (pi/4) against a fraction (009 s2q5)
  - P(at least one success) with vs without replacement (010 s2q3)
  - random draw of several items from matched pairs; probability of exactly one complete pair (combinations ratio) (013 s2q7)
  - two independent uniform arrival times in one interval with a fixed stay: the meeting region is a band in a square; compare with a fraction (015 s2q5)
  - choose several from a group of two kinds; the probability of at least one of each kind by removing both single-kind selections (017 s1q12)
  - independent repeated trials with a success chance other than one half; exactly k successes in n trials (one arrangement times the number of arrangements) (018 s2q12)
- **sequences-patterns**: Sequences, series and patterns (arithmetic). Variant: arithmetic sequence: n-th term, sum, count of terms. Asked before:
  - recursive a_{n+1} = 1/(1 - a_n) cycles with period 3; sum of 100 terms (002 s2q7)
  - recursive sequence whose step is a partial-fraction term; the nth term by telescoping, with an off-by-one in the term count (011 s2q3)
  - linear recursion doubling minus one: shift by 1 to get powers of 2; first term past a bound (012 s1q9)
  - a recursion with period four; sum of the terms whose index is a multiple of three up to a bound (013 s2q15)
  - a list of squares with alternating signs: pair consecutive terms into differences of squares; an odd number of terms leaves one unpaired (015 s2q15)
  - two arithmetic sequences with different differences and starts; their common terms form an arithmetic sequence with the lcm as difference; count those inside a window that does not start at the first term (016 s2q11)
  - two-term additive recursion with two terms two places apart given; recover the middle term, run backward to the start, then a later term and a partial sum (018 s2q13)
- **polygons-quadrilaterals**: Polygons and quadrilaterals (geometry). Variant: interior angle sum of an n-gon, and regular polygons. Asked before:
  - **revisit quant-003:s2q15** (you missed it): Each interior angle of a regular polygon is 5 times as large as each of its exterior angles. How many diagonals does the polygon have? [setup: interior angle k times the exterior angle; number of diagonals]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-003:s2q15"`.
  - rhombus with side and one diagonal; area against a value (002 s2q3)
  - interior angle k times the exterior angle; number of diagonals (003 s2q15)
  - count the diagonals of a regular polygon, then remove those through the center (011 s2q11)
  - the triangle on two adjacent vertices and an opposite vertex of a regular hexagon: its fraction of the hexagon's area (012 s2q12)
  - trapezoid diagonals cut it into four triangles; two triangle areas give the trapezoid's area (013 s2q9)
  - midpoints of a regular hexagon's sides form a smaller hexagon; the cut-off corner triangles with a 120-degree angle give the side ratio; compare areas (016 s2q8)
  - one more side adds a given number of diagonals; find the number of diagonals of the smaller polygon (017 s2q6)
- **inscribed-figures**: Inscribed and circumscribed figures, composite shapes (geometry). Variant: an equilateral triangle in a circle. Asked before:
  - **worn** square inscribed in a semicircle with one side on the diameter (001 s2q7, 003 s2q8, 006 s2q11)
  - **worn** incircle of a right triangle; distance from the incenter to a vertex or the circumcenter (004 s2q8, 009 s2q7)
  - square in a circle in a larger square of given area; compare the inner square's area with a value (001 s1q3)
  - equilateral triangle between its incircle and circumcircle; ring area gives the side (005 s2q7)
  - crescents on the legs of a right triangle inscribed in a circle: their total area equals the triangle's (007 s2q7)
  - circle through two vertices of a square and tangent to the opposite side; radius (008 s2q8)
  - four tangent circles in a square: the central gap is the centers' square minus four quarter disks (010 s2q8)
  - regular hexagon in a circle in a larger regular hexagon of given area; the inner area from the apothem-radius ratio (011 s2q7)
  - square on the diameter of a semicircle with its area given; the radius from the half-side, then semicircle minus square (014 s2q7)
  - three semicircles on one segment (two inside the large one); a perpendicular half-chord at the split point gives the product of the parts; area of the region between them (015 s2q7)
  - a rectangle with sides in a 2 to 1 ratio in a semicircle, the long side on the diameter; its area as a fraction of the semicircle (its diagonal is not a diameter) (017 s2q8)
  - regular hexagon in a circle with the hexagon's perimeter given; the area of the circular segment cut off by one side (one-sixth sector minus an equilateral triangle) (018 s2q7)
- **graphs-of-functions**: Graphs of functions and parabolas, shifts and reflections (algebra). Variant: parabola vertex, axis of symmetry and intercepts. Asked before:
  - parabola crossing the x-axis on both sides of the y-axis; compare b with c (002 s2q5)
  - piecewise-linear graph read at points between vertices after the input is reflected and shifted (011 s2q5)
  - a graph symmetric about the y-axis shifted horizontally: compare values at two points equidistant from the new axis (012 s2q3)
  - a function's unique maximum point; a reflected, stretched and shifted copy: compare where the copy's extreme value occurs with a value (014 s2q4)
  - a parabola against an absolute-value graph: solve on each piece and reject the roots outside that piece's domain; compare the count with a value (015 s2q3)
  - a graph symmetric about two parallel vertical lines: chaining the reflections links two values that neither reflection links alone; compare them (017 s2q5)
  - a line through the origin against a V-shaped graph whose vertex is off the origin; the slopes for which they meet twice (between the flat line through the vertex and the far arm's slope) (018 s2q14)
- **percent**: Percent, percent change, successive percent (arithmetic). Variant: finding the original value after a change. Asked before:
  - **worn** price up p% then down q% (or back to a reference); find the missing percent or value (003 s1q5, 004 s1q9, 006 s1q5)
  - dilute a solution: add water to lower the concentration to a target percent (001 s1q5)
  - DI: which categories' share of the total fell between two years (001 s1q11)
  - list price above cost, two successive discounts, final price; markup percent (005 s2q6)
  - a rate falls from p% to q%: percent decrease against the percentage-point drop (007 s1q9)
  - a price after one discount is given; find the original (divide by the remaining share) (008 s1q9)
  - the whole and a subgroup grow by different percents; percent change in the subgroup's share (009 s2q6)
  - a percent of a subgroup that is itself a percent of the whole (part of a part) (010 s1q5)
  - two quantities rise by different percents but by the same absolute amount; compare one new value with a multiple of the other's old value (013 s1q3)
  - one group a percent larger than another, a different percent of each group taken; compare the two parts (the base offsets the rate) (015 s1q2)
  - a share rises by some percentage points, then falls by a percent of itself; with the starting share bounded, compare the final share with the starting one (017 s2q4)
  - one group a percent larger than the other with no counts given; the smaller group's share of the whole against a value just above it (018 s1q2)
- **primes-factors**: Primes, factors, multiples, GCD/LCM (arithmetic). Variant: smallest multiplier that makes a perfect square or cube. Asked before:
  - x^2 - y^2 = N: count or list integer solutions from same-parity factor pairs (001 s1q4)
  - divisor-count function: d(n^2) vs 3·d(n) for an unknown n (001 s2q5)
  - divisor-count relation d(n^2) = 3·d(n) given; select the n that satisfy it (011 s2q14)
  - a power of a composite dividing a factorial: the squared small prime limits, not the larger prime (012 s2q14)
  - divisors of a perfect square below its square root: pair d with N/d and set the root aside; compare the count with a value (013 s2q2)
  - count the primes in two short ranges stated as integers with exactly two divisors; one range hides composites that look prime (015 s2q4)
  - divisor count of a product of powers of two composite numbers that share a prime (combine the exponents first) (017 s1q9)
  - largest square tile that covers a rectangle exactly; the number of tiles (the GCD is the side, not the answer) (018 s2q10)
- **number-sense-qc**: Number sense: sign, zero, magnitude cases (arithmetic). Variant: x between -1 and 0: powers and reciprocals ordered. Asked before:
  - x between 0 and 1: compare the reciprocal 1/x with 1 + x (001 s1q1)
  - positive integer factor pairs of a fixed product; compare x + y with a value (001 s2q4)
  - x^3 < x restricts x; compare x^2 with |x| or -x (003 s1q1)
  - ab > 0 and a > b; compare 1/a with 1/b (same sign flips the order) (004 s1q1)
  - x > y and 1/x > 1/y force opposite signs; compare x - y with |x + y| (005 s1q1)
  - x < 0 < y with x + y > 0; compare x/y with y/x (006 s1q1)
  - integer n with n^2 < 5: compare n^3 with n^2 (negative, zero and one cases) (007 s1q1)
  - x strictly between two integers: the sign of (x - 2)(x - 3) decides x^2 - 5x against -6 (008 s1q2)
  - x in a narrow decimal interval; 1/x - x crosses the benchmark inside it (D) (009 s1q2)
  - x/y > 1: compare x with y (sign of y decides: D) (010 s1q1)
  - x between 0 and 1: the mean of x and its reciprocal against 1 + x (012 s1q4)
  - x rounds to a given integer; compare its square, rounded, with the square of that integer (014 s1q1)
  - x between -1 and 0: an odd-power difference against an even-power difference; factor out the common positive factor and compare |x| with x^2 (016 s1q2)
  - two positive numbers with a fixed sum; their product against a value between the best whole-number product and the true maximum (018 s2q1)
- **frequency-distributions**: Frequency distributions and histograms (data). Variant: mean from a histogram's grouped data. Asked before:
  - DI: change in the median after moving one category's values (002 s1q12)
  - one group's segments of a stacked interval graph; estimated mean from interval midpoints (011 s1q11)
  - DI: cumulative frequency table; least value at which the cumulative share reaches a given percent (a percentile) (013 s1q10)
  - DI: median of one group from a frequency table where the two middle values fall in adjacent rows (016 s1q11)
  - several frequency columns over the same population; count the columns whose median falls in a given row (cumulative counts against the middle position) (018 s1q11)
- **word-problems-age-sum**: Algebraic translation word problems (algebra). Variant: translating 'more than' / 'less than' in order. Asked before:
  - **revisit quant-003:s1q9** (you missed it): Three coworkers, Dev, Eli and Fay, split the cost of a gift. Dev paid 12 dollars more than Eli, Fay paid twice as much as Eli, and Dev's payment was 30 percent of the total cost. What was the total cost of the gift, in dollars? [setup: three people's shares related by more-than / twice / percent of the total]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-003:s1q9"`.
  - three people's shares related by more-than / twice / percent of the total (003 s1q9)
  - 'when one was as old as the other is now' statements in both directions; the constant age gap (011 s2q6)
  - the value of two coin types and the value if their counts were swapped; the total count from adding the two equations (012 s1q6)
  - sum of an even-length run of consecutive integers given; the greatest from the half-integer average (014 s1q9)
  - consecutive odd integers; one partial sum exceeds another by a given amount; translate into one equation in the smallest term (016 s1q6)
  - two ticket prices with equal revenue from each kind and a total count: the counts are in the inverse ratio of the prices; the total revenue (017 s2q9)
- **functions**: Functions, notation, composition and defined operations (algebra). Variant: a function given by a table. Asked before:
  - minimum value of f(f(x)) for a quadratic f (001 s2q11)
  - a function on a finite domain given by a table; the inputs fixed by applying f twice; compare one such input with a value (011 s2q4)
  - odd function with a period: one value fixes the value two units away and forces a zero at half the period (012 s2q1)
  - linear function with a nonzero constant term: compare f(a + b) with f(a) + f(b) (the constant counts twice) (014 s2q1)
  - count the integers in the domain of a quotient of square roots whose denominator subtracts a constant from a root (one hidden excluded point) (015 s2q2)
  - f of a linear expression in x given; the input that gives a stated output (the solved x is not the answer) (017 s2q15)
  - a defined operation nested with an unknown in the inner pair; the outer value gives a square, and only the negative root's value is offered (018 s2q9)
- **coordinate-geometry**: Coordinate plane, lines, slope, distance (algebra) [in 1 untaken]. Variant: parallel and perpendicular lines. Asked before:
  - line through a point perpendicular to a given line; its x-intercept (002 s2q9)
  - general-form line with sign conditions on products of coefficients; select what it must pass through (011 s1q8)
  - line through a point meets the x-axis at a given distance; it is perpendicular to a line with an unknown coefficient; find the coefficient (013 s2q6)
  - a line through two given points; the sum of its two intercepts (015 s2q10)
  - a V-shaped region bounded above by a horizontal line; count the lattice points row by row, odd rows rounding the half-width down (016 s2q12)
  - a segment with one endpoint on each axis and a given midpoint; the endpoints from doubling the midpoint's coordinates; the segment's length (not the origin-to-midpoint distance) (019 s2q6)
- **min-max-bounding**: Bounding: minimum/maximum values under constraints (algebra) [in 1 untaken]. Variant: extreme values of a mean or median. Asked before:
  - integer ranges for x and y; select all possible values of the product xy (001 s1q8)
  - x < y < z positive integers with fixed product; select possible values of z (001 s2q14)
  - x/y over interval ranges with y ≠ 0; select possible values (004 s2q14)
  - distinct integer weights with a sum and a cap; least possible second-largest (005 s2q3)
  - three distinct integer lengths with a fixed sum that form a triangle; possible longest (006 s2q14)
  - worst-case draws to guarantee a color condition (pigeonhole); select the true counts (007 s2q14)
  - a rectangle in the corner of a right triangle: its area peaks at half the triangle's area; select attainable areas (008 s2q14)
  - a point moving on a line: its distance to a fixed point is at least the perpendicular distance; select attainable distances (009 s2q14)
  - interval ranges: greatest x^2 - y^2 vs greatest xy (010 s2q5)
  - integer scores in a fixed range with a given median; select possible means (extremes and integer totals) (013 s2q13)
  - sum of a quadratic in x and a quadratic in y over integer ranges: one vertex outside its range, the other between integers (015 s2q11)
  - integer points in a disk: the extreme values of several expressions, where the real optimum is not at an integer point (017 s2q14)
  - a total split into a fixed number of whole-number shares, the largest at most twice the smallest; the greatest possible largest share (a ratio bound, then whole numbers) (019 s2q11)
- **word-problems-rate**: Rate, work, distance and mixture problems (algebra) [in 1 untaken]. Variant: pipes filling and draining at once. Asked before:
  - **worn** out and back at two speeds; average speed for the round trip (004 s1q6, 009 s1q6)
  - two fill pipes and a drain together; time to fill (002 s2q10)
  - second traveller leaves later and faster on the same route; when it leads by a distance (003 s2q9)
  - one crew starts alone, the other joins; finish at a set time; solo time (005 s2q9)
  - upstream and downstream legs with a current; time difference (006 s1q6)
  - two legs with speeds in different units (km/h and m/s); total time (007 s2q9)
  - combined rate known and one machine slower by a fixed time: the rate equation becomes a quadratic (008 s1q6)
  - two swimmers going back and forth in a pool; time of the second meeting (010 s1q6)
  - drain part of a solution and replace it with the pure substance to reach a target concentration; amount drained (013 s1q5)
  - inlet and drain open together for a stretch, then the drain closes; total time to fill (015 s1q9)
  - a job measured in one unit while the rate switches to another unit partway; the time split from the total time, then the amount in the second unit (017 s2q7)
  - two solutions mixed to a target concentration, then a stated amount of water dilutes it to a second concentration; the dilution fixes the mixture's size, then the mixing equation gives one part (019 s2q8)
- **triangles**: Triangles: similar, isosceles, equilateral, inequality (geometry) [in 1 untaken]. Variant: similar triangles: side and area ratios. Asked before:
  - **worn** two sides given and an obtuse (or bounded) angle; the third side's range from c^2 against a^2 + b^2 (005 s2q14, 006 s2q15, 007 s2q2)
  - 13-14-15 triangle: altitude to one side via Heron or two right triangles (001 s2q10)
  - isosceles with sides 4 and 9: the third side must be 9; perimeter vs a value (003 s1q3)
  - isosceles triangle with one 40° angle: two cases; compare the largest angle with twice the smallest (004 s2q1)
  - a line parallel to one side cuts off a similar triangle; compare the trapezoid with the small triangle (areas scale as squares) (008 s2q2)
  - isosceles chain AD = BD = BC with one angle given; exterior angle then base angles; compare an angle with a value (009 s2q4)
  - exterior angle equals the sum of the two remote interior angles; split it by a given difference (010 s2q2)
  - obtuse triangle with three integer sides: the altitude to the shortest side falls outside it; find it from the area (012 s1q7)
  - two sides of a triangle given; perimeter of the midpoint triangle against the value at the triangle-inequality bound (013 s2q5)
  - one side and the altitude to it given; select possible lengths of another side (the foot may fall outside the base) (014 s2q14)
  - lower bounds on two exterior angles of a triangle; add the two exterior-angle relations to bound the third interior angle (016 s2q4)
  - a trapezoid's midline cut by a diagonal into two midsegments, each half of one base; from the midline and the pieces' difference, compare the shorter base with a value (017 s2q2)
  - three points on a circle joined to its center; two given angles at the circle are base angles of triangles made isosceles only by equal radii; the central angle between two of the points (019 s2q7)

right but slow (7):
- **solids-volume**: Volume and surface area of solids (geometry). Variant: a diagonal cross-section of a box. Asked before:
  - horizontal cylinder partly filled: circular-segment area times length (002 s2q8)
  - rectangular block painted on all faces but its base, then cut into unit cubes; count cubes with exactly two painted faces (011 s2q15)
  - a cone filled to half its height poured into a cylinder: the water's volume scales with the cube of the depth (012 s2q5)
  - horizontal cylinder more than half full, the empty segment's central angle given: whole cross section minus the empty segment, times the length (014 s2q11)
  - rectangular solid with the three face areas at one corner given; the volume is the square root of their product (016 s1q9)
  - a box cut by the plane through two diagonally opposite parallel edges: the cut's area gives the missing dimension; the surface area of one piece (017 s1q7)

wrong on a question touching it (13):
- **number-line-abs**: Number line, absolute value of numbers (arithmetic). Variant: |a| + |b| against |a + b| for signed values. Asked before:
  - |x - a| < |x + b|: x is nearer a than -b; compare x with the midpoint (002 s1q1)
  - equally spaced ticks with two fractional labels; locate two unlabeled points and compare their sum with the tick spacing (011 s1q2)
  - opposite signs: the absolute difference equals the sum of the absolute values (012 s1q1)
  - x between two negative marks; compare x^2 with x + 1 (the crossover lies inside the interval) (014 s1q2)
  - two unknowns at given distances from the same point; their distance from each other is the difference or the sum of those distances; compare with a value (016 s1q1)
  - a number located strictly between two positive marks; compare the reciprocal minus one with one minus the number (the difference is a square over the number) (018 s1q1)
- **data-tables-graphs**: Reading tables, bar, line, circle graphs, scatterplots and time plots (data). Variant: a two-way table with totals. Asked before:
  - DI: count of students at or above a threshold from a frequency chart (002 s1q10)
  - stacked bars of two groups over intervals; pick the interval with the greatest ratio of segment heights (011 s1q10)
  - DI: circle graph of a subgroup only: central angle of one category on the reduced base (013 s1q11)
  - scatterplot of the same units measured in two years; count the points above the line y = x (016 s2q10)
  - monthly frequency columns; sum two rows per period and find the largest change in either direction (a drop wins) (018 s1q10)

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
