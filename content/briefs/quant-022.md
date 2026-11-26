# Brief quant-022 (quant, seed 22079)

Untaken tests (their targets are damped, so this test spreads to other items): drill-002, drill-003, drill-004, drill-005, drill-006, drill-007, drill-008, drill-009, drill-010, drill-011, drill-012, drill-013, drill-014, drill-015, quant-021, verbal-017, verbal-018, verbal-019

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

wrong on a question touching it (21):
- **pythagorean-special**: Pythagorean theorem and special right triangles (geometry). Variant: space diagonal of a rectangular box. Asked before:
  - **worn** oblique triangle with 45° and 30° angles split by an altitude into two special right triangles; area or a side (003 s2q11, 004 s2q12)
  - altitude to the hypotenuse splits it into given segments; perimeter (002 s2q6)
  - 30-60-90 right triangle with the altitude to the hypotenuse given; hypotenuse (005 s2q12)
  - quadrilateral split by a diagonal into a 45-45-90 and a 30-60-90 triangle; a side or the area (006 s2q12)
  - box with a square base and a given height; the space diagonal gives the base area (007 s2q6)
  - a perpendicular splits a triangle into pieces whose leg ratios reveal 45-45-90 and 30-60-90 triangles; add the angles at the vertex (backwards) (008 s2q9)
  - sliding ladder: two right triangles with the same hypotenuse (7-24-25, then 15-20-25) (009 s2q12)
  - a square whose diagonal exceeds its side by a given length: solve s sqrt2 = s + 1 (010 s2q12)
  - walk with legs along compass directions; straight-line distance from the net legs (013 s2q10)
  - regular hexagon with a given side; the triangle on alternate vertices, its side from a 30-60-90 half of a 120-degree isosceles triangle; its area (015 s2q12)
  - altitude to the hypotenuse and one hypotenuse segment given; the other segment from the geometric mean, then the area with the altitude as height (018 s2q15)
  - a right triangle with integer sides and one given leg; select the possible hypotenuses (factor the difference of squares into same-parity pairs: primitive and scaled triples) (019 s2q14)
- **number-line-abs**: Number line, absolute value of numbers (arithmetic). Variant: positions of unlabeled points on a number line. Asked before:
  - |x - a| < |x + b|: x is nearer a than -b; compare x with the midpoint (002 s1q1)
  - equally spaced ticks with two fractional labels; locate two unlabeled points and compare their sum with the tick spacing (011 s1q2)
  - opposite signs: the absolute difference equals the sum of the absolute values (012 s1q1)
  - x between two negative marks; compare x^2 with x + 1 (the crossover lies inside the interval) (014 s1q2)
  - two unknowns at given distances from the same point; their distance from each other is the difference or the sum of those distances; compare with a value (016 s1q1)
  - a number located strictly between two positive marks; compare the reciprocal minus one with one minus the number (the difference is a square over the number) (018 s1q1)
  - two signed moves with the net change and the total distance given; the product of the moves against a value (020 s1q1)

wrong on a question testing it (279):
- **figures-not-to-scale**: Reasoning from figures not drawn to scale (geometry). Variant: only what is given fixes the relationship. Asked before:
  - **revisit quant-005:s1q3** (you missed it): In triangle $ABC$ (not drawn), point $D$ lies on side $AC$, and $AD = BD = DC$. · Quantity A: $AB + BC$ | Quantity B: $\sqrt{2}\cdot AC$ [setup: AD = BD = DC forces a right angle; compare the sum of two sides with sqrt(2) times the third]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-005:s1q3"`.
  - isosceles triangle, point on the base with one segment given; compare the other segment (D) (002 s1q3)
  - rhombus with side and diagonal given: area vs a value (fixed) (003 s2q2)
  - median AD with BD = DC and a 3-4-5 right triangle forced; compare AC with a value (004 s1q3)
  - AD = BD = DC forces a right angle; compare the sum of two sides with sqrt(2) times the third (005 s1q3)
  - two sides and the area given (the included angle acute or obtuse); compare the third side with a value (006 s1q3)
  - points on a line in unknown order with given distances and one betweenness fact; compare a distance with a value (007 s1q3)
  - kite given only by side lengths: the angles between unequal sides are equal (SSS); no figure (008 s1q3)
  - triangles sharing a height: split the area by a base ratio and then by a midpoint; compare two pieces (009 s1q3)
  - three side lengths, no figure: identify which side each angle faces; the larger side has the larger opposite angle (010 s1q3)
  - isosceles triangle, point on the base with one segment given; which statement must be true when the figure suggests the midpoint (011 s2q8)
  - quadrilateral with both pairs of opposite sides equal and one right angle marked: forced rectangle; compare the diagonal not through the marked angle's triangle with a value (014 s1q3)
  - a point at given distances from three vertices looks like the foot of an altitude; two right angles put it on the line through two vertices but not between them; compare that side with a value (015 s1q3)
  - two lines that look parallel cut by two transversals; the given pair of angles at one transversal does not sum to 180, and the angle sum of the enclosed quadrilateral fixes the pair at the other (016 s1q3)
  - two triangles joined at a crossing point (a bowtie) with two angles given in one and one in the other; vertical angles make the remaining pairs share a sum; compare the unknown with the angle drawn equal to it (018 s1q3)
  - a point drawn on a circle opposite a diameter, but its distance from the center is less than the radius; compare the third side of the triangle on the diameter with the right-triangle value (019 s1q2)
- **mean-median-mode**: Mean, median, mode, range (data). Variant: a mean after adding or removing values. Asked before:
  - **revisit quant-004:s1q11** (you missed it): Suppose the company had also operated a sixth zone, Northgate, in 2024, and that for the 2024 trip counts of all six zones the median equals the mean. How many thousand trips started in Northgate in 2024? · choices: 47.5 / 53 / 55 / 61 / 73 [setup: add one value so the median equals the mean]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-004:s1q11"`. Earlier items already rework this setup, and the judge compares the sibling with them too, so make a change none of them made: quant-006:s1q12: Suppose that French enrollment in 2025 is $x$ students, and that for the seven years 2019 through 2025 the median of the annual French enrollments equals their average (arithmetic mean). What is the sum of all possible….
  - **worn** add one value so the median equals the mean (004 s1q11, 006 s1q12)
  - five integers with given mean and median; greatest possible least value (002 s2q1)
  - DI: change in the mean per nest when one group is excluded (003 s1q11)
  - DI: combined mean of two groups weighted by counts (005 s1q11)
  - DI: possible median of two combined grouped distributions (007 s1q12)
  - DI: change one category's values, then compare the mean and the median of the new list (008 s1q12)
  - DI: medians of two percent columns with an even count (average the middle two); compare them (009 s1q11)
  - DI: the range of combined groups from the extreme whiskers against one group's range (010 s1q11)
  - DI: overall mean and count give the total; subtract known categories to get the mean of an open-ended category (013 s1q12)
  - DI: least number of added top values that moves the median of a frequency table to a target (odd against even count) (014 s1q12)
  - two lists combined, one unknown; the unique-mode condition breaks a tie and forces the unknown, while the range condition is already met across both lists (a one-list reading of it is the trap) (016 s2q15)
  - DI: the overall total from counts times means; add a new group of equal values until the overall mean reaches a target; the new group's size (019 s1q12)
- **triangles**: Triangles: similar, isosceles, equilateral, inequality (geometry). Variant: triangles sharing a height: area ratio from the base ratio. Asked before:
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
  - a cut-off triangle similar to the whole with the vertices matched crosswise (not parallel to the third side); the area ratio against a fraction (020 s2q3)
- **word-problems-interest**: Interest, profit, discount and cost problems (algebra). Variant: markup then discount. Asked before:
  - lots sold at markup and at a discount off list; cost per unit from total profit (003 s1q6)
  - two deposits starting in different months in one simple-interest account; total interest at year's end (011 s1q9)
  - salary plus a flat commission against commission only above a threshold: the break-even sales (012 s2q9)
  - goods sold only in whole units with a non-whole need, then a fee on orders at or below a threshold: buying one more unit is cheaper (014 s2q9)
  - profit given as a percent of the selling price; the price rises by a percent with the cost fixed; the new profit as a percent of cost (015 s1q6)
  - a fixed fee plus a two-tier per-unit rate; the total bill given; the total usage (018 s1q9)
  - a price and a profit stated as a percent of cost give the cost; re-price so the same percent is of the selling price; the change in price (019 s1q6)
- **normal-distribution**: Normal distribution: 68-95-99.7 rule, z-scores, percentiles (data). Variant: comparing values in two normal distributions (z-scores). Asked before:
  - variance given rather than SD; percentile at two SDs above the mean against the 95 from the empirical rule (011 s2q2)
  - an interval from one to three standard deviations above the mean: one tail band only, against a value (012 s2q4)
  - normal with known mean and one upper-tail probability; lower-tail probability at a nearer cutoff vs that probability (013 s2q1)
  - two normal populations with different means and standard deviations; the cutoff farther in raw units is nearer in standard deviations; compare upper-tail percents (016 s2q2)
  - normal distribution with a known mean and one upper-tail percent; the percent in the band symmetric about the mean against a value (the two tails are equal) (017 s1q1)
  - two symmetric tail percents fix the mean and the standard deviation; the percent beyond a farther cutoff against a value (020 s1q3)
- **probability-basic**: Probability: independent events, complement (data). Variant: probability from a count of outcomes with dice or coins. Asked before:
  - **revisit quant-004:s2q7** (you missed it): A fair six-sided die, with faces numbered 1 through 6, is rolled three times. What is the probability that the product of the three numbers rolled is divisible by 4? · choices: $\dfrac{91}{216}$ / $\dfrac{1}{2}$ / $\dfrac{5}{8}$ / $\dfrac{3}{4}$ / $\dfrac{7}{8}$ [setup: three dice: P(product divisible by 4) via complement cases]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-004:s2q7"`.
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
  - repeated independent trials stopped at the first failure; at least k trials means the first k - 1 all succeed; against one half (020 s2q2)
- **counting-permutations**: Counting: permutations and combinations (data). Variant: subset counts and the symmetry C(n, k) = C(n, n - k). Asked before:
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
  - round table with two people fixed opposite and two others adjacent: fix one seat, count the adjacent seat pairs left on the two arcs (020 s2q8)
- **coordinate-geometry**: Coordinate plane, lines, slope, distance (algebra). Variant: slope and intercepts from two points. Asked before:
  - line through a point perpendicular to a given line; its x-intercept (002 s2q9)
  - general-form line with sign conditions on products of coefficients; select what it must pass through (011 s1q8)
  - line through a point meets the x-axis at a given distance; it is perpendicular to a line with an unknown coefficient; find the coefficient (013 s2q6)
  - a line through two given points; the sum of its two intercepts (015 s2q10)
  - a V-shaped region bounded above by a horizontal line; count the lattice points row by row, odd rows rounding the half-width down (016 s2q12)
  - a segment with one endpoint on each axis and a given midpoint; the endpoints from doubling the midpoint's coordinates; the segment's length (not the origin-to-midpoint distance) (019 s2q6)
  - two parallel lines; the perpendicular segment between them from a point on one (not the vertical gap) (020 s2q12)
- **std-dev-normal**: Standard deviation: spread, SD units, effect of shifting and scaling (data). Variant: spread read from a dot plot or a frequency table. Asked before:
  - **worn** two values added at mean ± 1 SD to a list; compare the new SD with the old (001 s2q2, 004 s2q2, 005 s1q4, 006 s1q4)
  - DI with a normal assumption: count above mean + 1 SD across two groups (003 s1q12)
  - normal distribution: P(above +3σ... of those above +1σ) as a conditional fraction vs a value (007 s1q4)
  - normal: percents above/below two values give the mean and SD; compare two tail percents (008 s1q4)
  - a list transformed by y = -2x + 30: the SD scales by |-2| and the shift does nothing (009 s2q3)
  - two equal-size lists with equal SDs and different means; combined SD vs the common SD (010 s1q4)
  - a list with one low outlier gets a new maximum that sits close to the mean; compare the new SD with the old (013 s1q4)
  - two frequency columns that are mirror images of each other: equal standard deviations, means reflected about the middle score (015 s1q11)
  - two normal groups with different means and SDs, one group's size and the combined count inside a fixed band given; the band sits at different SD distances in each group; solve for the other group's size (018 s2q6)
  - two integer lists of the same size whose sums differ by one; compare their least possible standard deviations (a half-integer mean forces every value off the mean) (019 s2q2)
- **random-variables**: Random variables, probability distributions, expected value (data). Variant: probability from areas under a density curve. Asked before:
  - probability table where the median is not the middle listed value; mean minus median (011 s2q12)
  - DI: expected days on site per employee, weighting by department share and the non-remote share, remote counted as 0 (012 s1q11)
  - triangular density on an interval: find the peak height, then the area of a tail; compare with a value (013 s2q3)
  - a length uniform on an interval; probabilities about its square found by converting back to the length (the square is not uniform) (016 s2q5)
  - a continuous uniform variable and a discrete uniform integer on the same endpoints; compare the probabilities of the same at-most event (length share against inclusive count) (019 s2q3)
- **inscribed-figures**: Inscribed and circumscribed figures, composite shapes (geometry). Variant: a circle inscribed in a right triangle. Asked before:
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
  - an equilateral triangle and a square inscribed in one circle: the triangle's side gives the radius, the radius gives the square (020 s2q11)
- **word-problems-rate**: Rate, work, distance and mixture problems (algebra). Variant: combined work rates. Asked before:
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
  - inlet and drain rates in volume units; the extra fill time with the drain open gives the capacity (020 s2q10)
- **quadratic-inequalities**: Quadratic and other nonlinear inequalities (sign analysis) (algebra). Variant: an inequality with x in the denominator (case on sign). Asked before:
  - rational inequality k/x > x - c; multiplying through by x loses the negative branch; compare x with the left root (011 s1q4)
  - x^3 < x with no sign given; compare x^2 with x across the two solution intervals (013 s1q1)
  - a quartic inequality that factors as n^2 times a quadratic; dividing by n^2 silently admits n = 0, which fails the strict inequality; count the integers (016 s1q4)
  - three ordered parameters with no values; one factored product negative (between its roots) and one positive (outside its roots) intersect to a sub-interval; the sign of a third pairing of the factors (018 s2q5)
  - a two-sided bound on n squared with a non-square lower bound and a square upper bound; count the integers of both signs (019 s2q15)
- **primes-factors**: Primes, factors, multiples, GCD/LCM (arithmetic). Variant: highest power of a prime dividing n! or a product. Asked before:
  - x^2 - y^2 = N: count or list integer solutions from same-parity factor pairs (001 s1q4)
  - divisor-count function: d(n^2) vs 3·d(n) for an unknown n (001 s2q5)
  - divisor-count relation d(n^2) = 3·d(n) given; select the n that satisfy it (011 s2q14)
  - a power of a composite dividing a factorial: the squared small prime limits, not the larger prime (012 s2q14)
  - divisors of a perfect square below its square root: pair d with N/d and set the root aside; compare the count with a value (013 s2q2)
  - count the primes in two short ranges stated as integers with exactly two divisors; one range hides composites that look prime (015 s2q4)
  - divisor count of a product of powers of two composite numbers that share a prime (combine the exponents first) (017 s1q9)
  - largest square tile that covers a rectangle exactly; the number of tiles (the GCD is the side, not the answer) (018 s2q10)
  - a multiple of a fixed number must be a perfect square; the possible multipliers are the least one times any square (020 s2q13)
- **graphs-of-functions**: Graphs of functions and parabolas, shifts and reflections (algebra). Variant: a shift, a stretch or a reflection of a graph. Asked before:
  - parabola crossing the x-axis on both sides of the y-axis; compare b with c (002 s2q5)
  - piecewise-linear graph read at points between vertices after the input is reflected and shifted (011 s2q5)
  - a graph symmetric about the y-axis shifted horizontally: compare values at two points equidistant from the new axis (012 s2q3)
  - a function's unique maximum point; a reflected, stretched and shifted copy: compare where the copy's extreme value occurs with a value (014 s2q4)
  - a parabola against an absolute-value graph: solve on each piece and reject the roots outside that piece's domain; compare the count with a value (015 s2q3)
  - a graph symmetric about two parallel vertical lines: chaining the reflections links two values that neither reflection links alone; compare them (017 s2q5)
  - a line through the origin against a V-shaped graph whose vertex is off the origin; the slopes for which they meet twice (between the flat line through the vertex and the far arm's slope) (018 s2q14)
  - monic parabola with the gap between its x-intercepts and its y-intercept given; two mirror-image parabolas fit, so the vertex's side of the y-axis is undetermined (020 s2q5)
- **min-max-bounding**: Bounding: minimum/maximum values under constraints (algebra). Variant: the least distance from a fixed point to a point moving on a line or circle. Asked before:
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
  - five integers with the least value, the range and the mean given; the median's bounds from the fixed ends and the middle sum (020 s2q14)
- **word-problems-age-sum**: Algebraic translation word problems (algebra). Variant: ages then and now. Asked before:
  - three people's shares related by more-than / twice / percent of the total (003 s1q9)
  - 'when one was as old as the other is now' statements in both directions; the constant age gap (011 s2q6)
  - the value of two coin types and the value if their counts were swapped; the total count from adding the two equations (012 s1q6)
  - sum of an even-length run of consecutive integers given; the greatest from the half-integer average (014 s1q9)
  - consecutive odd integers; one partial sum exceeds another by a given amount; translate into one equation in the smallest term (016 s1q6)
  - two ticket prices with equal revenue from each kind and a total count: the counts are in the inverse ratio of the prices; the total revenue (017 s2q9)
  - three parts related by less-than-twice / more-than / percent of the total; the largest part (020 s1q5)
- **number-sense-qc**: Number sense: sign, zero, magnitude cases (arithmetic). Variant: both quantities depend on one variable with a restricted range. Asked before:
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
  - negative number above -1: the sum of its reciprocal and the reciprocal of its square against zero (020 s1q2)
- **estimation-sigfig**: Estimation, rounding, scientific notation (arithmetic). Variant: rounding to a place, then computing. Asked before:
  - estimate a product and quotient of numbers in scientific notation (003 s2q10)
  - sum of many amounts each rounded to the nearest unit; bound the true total against the strict upper limit (011 s2q1)
  - a difference of squares of two decimals near consecutive whole numbers: rounding each term misleads, factoring gives the product (012 s2q10)
  - square root of a number in scientific notation with an odd power of ten; compare with a power of ten (013 s1q2)
  - concentration times volume over a per-dose amount, with a unit conversion; round each factor and pick the nearest of closely spaced choices (015 s1q5)
  - a difference of two numbers in scientific notation with different powers, divided by a negative power of ten (017 s2q10)
  - a power of a small base against a power of ten with a different exponent; rewrite the base in powers of two, use 2 to the 10th as about a thousand, and bound the error (019 s2q1)
- **percent**: Percent, percent change, successive percent (arithmetic). Variant: percent of a percent across subgroups. Asked before:
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
  - an absolute addition followed by a percent increase; undo them in reverse order to recover the original (020 s2q4)
- **geometry-coordinate**: Geometry in the coordinate plane (geometry) [in 1 untaken]. Variant: a triangle's vertices on the axes. Asked before:
  - opposite vertices of a square given; find another vertex (002 s2q11)
  - triangle formed by a point and its images across y = x and across an axis; its area (011 s2q9)
  - a line through a fixed first-quadrant point cuts off a triangle of given area with the axes; the slope from the two intercepts (012 s2q6)
  - circle from its center and one point on it; length of the chord it cuts on an axis (013 s1q6)
  - adjacent vertices of a square on the two axes; find another vertex by turning the side vector 90 degrees (the center method for opposite vertices is the trap) (015 s2q8)
  - convex quadrilateral with one vertex coordinate unknown and the area given; split by a diagonal, the absolute value gives two positions and convexity rejects one (016 s1q7)
  - circles tangent to both axes through a given point: the radius solves a quadratic with two roots; the distance between the two possible centers on the line y = x (018 s1q6)
  - shortest path from one point to an axis and on to a second point: reflect one point across the axis and join with a straight line; the touching point (020 s1q6)
  - a circle given in expanded form; complete the square for the center and radius; select the points strictly inside (some lie exactly on the circle) (021 s1q8)
- **remainders-units**: Remainders and units digits (arithmetic) [in 1 untaken]. Variant: remainder of a sum or product from the remainders of its parts. Asked before:
  - **revisit quant-005:s1q6** (you missed it): What is the remainder when $7^{83} + 3^{83}$ is divided by 20? · choices: 0 / 2 / 5 / 10 / 15 [setup: remainder of a^n ± b^n mod a small number via power cycles]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-005:s1q6"`. Earlier items already rework this setup, and the judge compares the sibling with them too, so make a change none of them made: quant-001:s1q6: What is the remainder when $17^{40}-2\cdot11^{25}$ is divided by 6? · choices: 1 / 2 / 3 / 4 / 5 ‖ quant-001:s2q8: What is the remainder when $5^{100}+7^{100}$ is divided by 13? · choices: 2 / 6 / 8 / 10 / 12 ‖ quant-006:s1q2: Compare the two quantities. · Quantity A: The remainder when $2^{50}$ is divided by 7 | Quantity B: The remainder when $3^{50}$ is divided by 7.
  - **worn** remainder of a^n ± b^n mod a small number via power cycles (001 s1q6, 001 s2q8, 005 s1q6, 006 s1q2)
  - k ≡ 5 mod 6; remainders of high powers of k mod 8 and mod 3 (003 s1q2)
  - units digits of 3^n and 7^n combined (sum vs product) for every n (004 s2q3)
  - two remainder conditions that conflict in parity: no such number; compare the count with a value (007 s2q3)
  - n + 1 a multiple of 6; remainder of n^2 + n mod 12 vs a value (008 s2q3)
  - the decimal part of n/d reduces to a fraction; the least divisor is its reduced denominator (009 s1q4)
  - from the last digit of a sum of powers back to the parity of n; then another power's last digit (010 s2q1)
  - remainder of the negative of a large power, via the power's cycle and the nonnegative-remainder rule (011 s1q7)
  - product of a long run of odd integers: an odd multiple of 25 ends in 25 or 75; the residue mod 4 decides (014 s1q4)
  - a multiple of 3 with a known remainder mod 14; the remainder of the number divided by 3 is fixed because 3 and 14 are coprime; compare it with the original remainder (015 s1q4)
  - two integers with the same remainder mod 6: their high even powers are fixed mod 24 through mod 8 and mod 3; compare the remainder of the sum of the powers with that of the square of the integers' sum (017 s1q4)
  - the decimal part of n over a given divisor fixes the remainder; compare the remainder by a factor of that divisor with the reduced fraction's numerator (018 s1q4)
  - two leftover conditions, each the same amount short of its divisor, with divisors that share a factor; solutions repeat every lcm; the least one above a threshold (019 s1q7)
  - last two digits of a product of three large numbers, each a little below a multiple of 100; multiply the small negative residues and convert the negative result (021 s2q9)
- **lines-angles**: Lines and angles, parallel lines (geometry) [in 1 untaken]. Variant: angles around a point or on a straight line. Asked before:
  - two angle expressions at a transversal: equal or supplementary; select x (002 s2q13)
  - a ray from the intersection of two lines makes given angles with each line; compare the acute angle between the lines with a value (ray inside or outside) (011 s1q3)
  - two internal angle bisectors of a triangle meet: the angle between them is 90 plus half the third angle, whatever the other two (012 s1q3)
  - three concurrent lines with three marked angles, one across from an unmarked angle; solve along one line, then the obtuse angle between the other two lines (014 s2q3)
  - five lines with no three concurrent form a star; four point angles given; the fifth from the angle sum through exterior angles of small triangles (015 s2q6)
  - rays around a point with angles in a given ratio; the angle between two non-adjacent rays is the smaller way around (017 s2q12)
  - a bent path between two parallel lines with the bend angle labeled as the sum of the two angles at the lines; the label is redundant, so the angle is undetermined (018 s2q4)
  - a bisected angle with a second ray inside one half; the ray's offset from the bisector and the ratio of the two angles it makes with the sides; the whole angle (019 s2q9)
  - the angle between an angle bisector and the altitude from the same vertex is given with one other angle; two signs give two candidates and the acute condition rejects one (021 s2q11)
- **integers-properties**: Integer properties, even/odd, divisibility (arithmetic) [in 1 untaken]. Variant: consecutive integers: sum, product or count in a range. Asked before:
  - **worn** k^2 leaves remainder 1 mod 8; compare k mod 8 with k^3 mod 8 (002 s1q4, 005 s2q1)
  - n with exactly 3 divisors is p^2; compare divisor counts of n^2 and 2n (004 s2q5)
  - k^2 divisible by 72: greatest number that must divide k (006 s2q4)
  - reversing a two-digit number changes it by 9 times the digit difference; count the numbers (007 s2q1)
  - parity of ab + a + b through (a + 1)(b + 1) - 1; count pairs (008 s2q15)
  - count divisors of N divisible by one number but not another (from the prime factorization) (009 s2q15)
  - a sum of an odd number k of consecutive integers is k times the middle one; select which numbers qualify (010 s2q14)
  - two parity conditions on three unknown integers (one leaves open which of two is even); which expression must be odd (013 s2q12)
  - a digit condition makes a three-digit number a multiple of 11; compare the remainder with the units digit, which can be zero (014 s2q5)
  - a run of consecutive integers ending at a given positive number has a small given sum; negatives cancel their opposites, which fixes the start; count the terms (016 s2q6)
  - product of four consecutive integers whose first is a multiple of a prime; select the numbers that must divide it (one plug-in makes extra divisors look forced) (017 s1q8)
  - several integers with an odd sum and an even product; the greatest possible number of odd ones (the count of odd terms must be odd) (019 s2q12)
  - run backwards: the divisor counts of n^2 and 2n are given; recover the possible prime shapes of n and compare its divisor count with a value (021 s1q4)

right but slow (7):
- **data-tables-graphs**: Reading tables, bar, line, circle graphs, scatterplots and time plots (data). Variant: a scatterplot: counting points or reading a trend line. Asked before:
  - DI: count of students at or above a threshold from a frequency chart (002 s1q10)
  - stacked bars of two groups over intervals; pick the interval with the greatest ratio of segment heights (011 s1q10)
  - DI: circle graph of a subgroup only: central angle of one category on the reduced base (013 s1q11)
  - scatterplot of the same units measured in two years; count the points above the line y = x (016 s2q10)
  - monthly frequency columns; sum two rows per period and find the largest change in either direction (a drop wins) (018 s1q10)
  - two cells of one row against the matching column totals (not the row total) (020 s1q10)

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
