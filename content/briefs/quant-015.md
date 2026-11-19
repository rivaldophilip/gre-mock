# Brief quant-015 (quant, seed 76342)

Untaken tests (their targets are damped, so this test spreads to other items): quant-013, quant-014, verbal-016, verbal-017, verbal-018, verbal-019

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

Type focus (need >= 0.4, put the weakest items here): mc, mc_multi

## Concept slots (one primary concept per question, any order; a DI set shares an area)

Write each question as its variant (the form of the concept earlier mocks used least), with a setup that is **not** in the slot's history below: new numbers, names or a story around a listed setup are the same item. **Worn** setups (2+ tests) are banned outright. Record `setup` and `variant` on each question. A slot marked **revisit** is the one exception: a sibling of an item you missed, with the change named (at most 4 per test).

wrong on a question testing it (199):
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
- **std-dev-normal**: Standard deviation: spread, SD units, effect of shifting and scaling (data) [in 1 untaken]. Variant: comparing the spread of two lists without computing. Asked before:
  - **worn** two values added at mean ± 1 SD to a list; compare the new SD with the old (001 s2q2, 004 s2q2, 005 s1q4, 006 s1q4)
  - DI with a normal assumption: count above mean + 1 SD across two groups (003 s1q12)
  - normal distribution: P(above +3σ... of those above +1σ) as a conditional fraction vs a value (007 s1q4)
  - normal: percents above/below two values give the mean and SD; compare two tail percents (008 s1q4)
  - a list transformed by y = -2x + 30: the SD scales by |-2| and the shift does nothing (009 s2q3)
  - two equal-size lists with equal SDs and different means; combined SD vs the common SD (010 s1q4)
  - a list with one low outlier gets a new maximum that sits close to the mean; compare the new SD with the old (013 s1q4)
- **inscribed-figures**: Inscribed and circumscribed figures, composite shapes (geometry) [in 1 untaken]. Variant: overlapping circles or semicircles. Asked before:
  - **worn** square inscribed in a semicircle with one side on the diameter (001 s2q7, 003 s2q8, 006 s2q11)
  - **worn** incircle of a right triangle; distance from the incenter to a vertex or the circumcenter (004 s2q8, 009 s2q7)
  - square in a circle in a larger square of given area; compare the inner square's area with a value (001 s1q3)
  - equilateral triangle between its incircle and circumcircle; ring area gives the side (005 s2q7)
  - crescents on the legs of a right triangle inscribed in a circle: their total area equals the triangle's (007 s2q7)
  - circle through two vertices of a square and tangent to the opposite side; radius (008 s2q8)
  - four tangent circles in a square: the central gap is the centers' square minus four quarter disks (010 s2q8)
  - regular hexagon in a circle in a larger regular hexagon of given area; the inner area from the apothem-radius ratio (011 s2q7)
- **coordinate-geometry**: Coordinate plane, lines, slope, distance (algebra) [in 1 untaken]. Variant: slope and intercepts from two points. Asked before:
  - line through a point perpendicular to a given line; its x-intercept (002 s2q9)
  - general-form line with sign conditions on products of coefficients; select what it must pass through (011 s1q8)
  - line through a point meets the x-axis at a given distance; it is perpendicular to a line with an unknown coefficient; find the coefficient (013 s2q6)
- **counting-permutations**: Counting: permutations and combinations (data) [in 1 untaken]. Variant: committees with roles: chair plus members. Asked before:
  - **revisit quant-002:s1q7** (you missed it): How many even four-digit positive integers have four different digits that decrease from left to right (for example, 9520)? · choices: 84 / 105 / 126 / 130 / 210 [setup: four-digit even numbers with strictly decreasing digits (choose sets)]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-002:s1q7"`.
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
- **min-max-bounding**: Bounding: minimum/maximum values under constraints (algebra) [in 1 untaken]. Variant: the extreme value of an expression over an integer range. Asked before:
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
- **ratio-proportion**: Ratio and proportion (arithmetic) [in 1 untaken]. Variant: part-to-part vs part-to-whole confusion. Asked before:
  - **revisit quant-002:s1q9** (you missed it): In a club, the ratio of members who play chess to members who do not is $3:5$. After 12 new members, all of whom play chess, join the club, the ratio becomes $3:4$. How many members did the club have before the new members joined? [setup: ratio before and after adding or removing items of one or both kinds; a total]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-002:s1q9"`.
  - **worn** ratio before and after adding or removing items of one or both kinds; a total (002 s1q9, 005 s1q5, 006 s2q6)
  - chained ratios a:b and b:c with bounds; possible totals (003 s2q13)
  - mix two blends with different part ratios to reach a 1:1 mixture (004 s1q5)
  - three-part budget ratio; one part grows to a given fraction of the total; new total (007 s1q5)
  - chained ratios a:b and b:c with a difference given; one count (008 s1q5)
  - a map scale applies to lengths; the actual area scales by its square (009 s1q9)
  - workers and time are inversely proportional; scale the time (010 s1q9)
  - inverse proportion: a percent increase in one variable; the percent decrease in the other (011 s1q5)
- **remainders-units**: Remainders and units digits (arithmetic) [in 1 untaken]. Variant: remainder of a negative or fractional expression of n. Asked before:
  - **worn** remainder of a^n ± b^n mod a small number via power cycles (001 s1q6, 001 s2q8, 005 s1q6, 006 s1q2)
  - k ≡ 5 mod 6; remainders of high powers of k mod 8 and mod 3 (003 s1q2)
  - units digits of 3^n and 7^n combined (sum vs product) for every n (004 s2q3)
  - two remainder conditions that conflict in parity: no such number; compare the count with a value (007 s2q3)
  - n + 1 a multiple of 6; remainder of n^2 + n mod 12 vs a value (008 s2q3)
  - the decimal part of n/d reduces to a fraction; the least divisor is its reduced denominator (009 s1q4)
  - from the last digit of a sum of powers back to the parity of n; then another power's last digit (010 s2q1)
  - remainder of the negative of a large power, via the power's cycle and the nonnegative-remainder rule (011 s1q7)
- **inequalities**: Linear and simultaneous inequalities (algebra) [in 1 untaken]. Variant: a chain a < b < c: what must be true of sums or differences. Asked before:
  - DI: two linear growth projections; first year one exceeds the other (001 s1q12)
  - -1 < a < 0 < b < 1: select all inequalities that must hold (001 s2q13)
  - two linear inequalities give an interval; compare x^2 with -4x (003 s1q4)
  - for which k a linear inequality holds for every x in an interval (check endpoints) (004 s1q8)
  - 6/x < 2 and a quadratic inequality; sign of x (005 s2q4)
  - compound linear inequality gives an x interval; select possible x^2 (006 s1q8)
  - three ordered numbers summing to zero; select the sign facts that must hold (007 s2q13)
  - linear cost with a fixed difference in counts, bounded above and below; select possible counts (008 s2q13)
  - which rewritten forms are equivalent to a linear inequality with a negative coefficient (the sign flips) (009 s1q8)
  - a quadratic inequality has a solution only when the discriminant is positive; select parameter values (010 s2q13)
  - a chained ordering of x, 1/x and x^2 is given; select the values of x that satisfy it (sign cases) (013 s1q8)
- **probability-basic**: Probability: independent events, complement (data) [in 1 untaken]. Variant: geometric probability (a point in a region). Asked before:
  - **worn** compare two binomial probabilities with p = 1/2 (at least / more heads than tails) (001 s2q1, 006 s2q3)
  - three dice: P(product divisible by 4) via complement cases (004 s2q7)
  - two independent draws from different-sized boxes; P(first > second) vs a value (005 s2q5)
  - three independent choices among 4 options: P(exactly one option unused) (007 s2q8)
  - P(A) and P(A or B) for independent events; compare P(B) with a value (008 s2q5)
  - random point in a square: the probability of landing in the inscribed disk (pi/4) against a fraction (009 s2q5)
  - P(at least one success) with vs without replacement (010 s2q3)
  - random draw of several items from matched pairs; probability of exactly one complete pair (combinations ratio) (013 s2q7)
- **counting-restrictions**: Counting with restrictions and arrangements (data) [in 1 untaken]. Variant: digits with restrictions (no repeats, even, > 500). Asked before:
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
- **weighted-average**: Weighted average and changing averages (data) [in 1 untaken]. Variant: the change in the mean when a group joins. Asked before:
  - two group means and one group's size; find the other group's size from the overall mean (001 s1q9)
  - add members of one kind outside a category to dilute the category's share to a subgroup's share; count from stacked bars (011 s1q12)
  - two group means and which group is larger; combined mean vs the midpoint of the means (013 s2q4)
- **percent**: Percent, percent change, successive percent (arithmetic) [in 1 untaken]. Variant: percent comparisons in QC with unknown bases. Asked before:
  - **worn** price up p% then down q% (or back to a reference); find the missing percent or value (003 s1q5, 004 s1q9, 006 s1q5)
  - dilute a solution: add water to lower the concentration to a target percent (001 s1q5)
  - DI: which categories' share of the total fell between two years (001 s1q11)
  - list price above cost, two successive discounts, final price; markup percent (005 s2q6)
  - a rate falls from p% to q%: percent decrease against the percentage-point drop (007 s1q9)
  - a price after one discount is given; find the original (divide by the remaining share) (008 s1q9)
  - the whole and a subgroup grow by different percents; percent change in the subgroup's share (009 s2q6)
  - a percent of a subgroup that is itself a percent of the whole (part of a part) (010 s1q5)
  - two quantities rise by different percents but by the same absolute amount; compare one new value with a multiple of the other's old value (013 s1q3)
- **sequences-patterns**: Sequences, series and patterns (arithmetic) [in 1 untaken]. Variant: pattern in a defined list (terms that alternate or repeat). Asked before:
  - recursive a_{n+1} = 1/(1 - a_n) cycles with period 3; sum of 100 terms (002 s2q7)
  - recursive sequence whose step is a partial-fraction term; the nth term by telescoping, with an off-by-one in the term count (011 s2q3)
  - linear recursion doubling minus one: shift by 1 to get powers of 2; first term past a bound (012 s1q9)
  - a recursion with period four; sum of the terms whose index is a multiple of three up to a bound (013 s2q15)
- **quadratics-factoring**: Factoring and quadratic equations (algebra) [in 1 untaken]. Variant: dividing by a variable that may be zero. Asked before:
  - **revisit quant-002:s2q14** (you missed it): The equation $x^2+kx+36=0$ has two different positive integer solutions. Which of the following could be the value of $k$? Select all such values. · choices: $-37$ / $-20$ / $-15$ / $-12$ / $-10$ / $13$ [setup: x^2 + kx + c with two distinct positive integer roots; possible k]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-002:s2q14"`.
  - x^2 + kx + c with two distinct positive integer roots; possible k (002 s2q14)
  - squares of the sum and of the difference given; find the product (011 s2q10)
  - equation linear in x and sqrt x: substitute, reject the negative root; sum of solutions (013 s2q11)
- **functions**: Functions, notation, composition and defined operations (algebra) [in 1 untaken]. Variant: domain restrictions (square roots, denominators). Asked before:
  - minimum value of f(f(x)) for a quadratic f (001 s2q11)
  - a function on a finite domain given by a table; the inputs fixed by applying f twice; compare one such input with a value (011 s2q4)
  - odd function with a period: one value fixes the value two units away and forces a zero at half the period (012 s2q1)
- **primes-factors**: Primes, factors, multiples, GCD/LCM (arithmetic) [in 1 untaken]. Variant: count of primes or factors in a stated range. Asked before:
  - x^2 - y^2 = N: count or list integer solutions from same-parity factor pairs (001 s1q4)
  - divisor-count function: d(n^2) vs 3·d(n) for an unknown n (001 s2q5)
  - divisor-count relation d(n^2) = 3·d(n) given; select the n that satisfy it (011 s2q14)
  - a power of a composite dividing a factorial: the squared small prime limits, not the larger prime (012 s2q14)
  - divisors of a perfect square below its square root: pair d with N/d and set the root aside; compare the count with a value (013 s2q2)
- **abs-value-inequalities**: Absolute-value equations and inequalities (algebra) [in 1 untaken]. Variant: |x - a| = |x - b|: the point midway. Asked before:
  - **worn** sum of two absolute values |x - a| + |x - b| against a bound (001 s2q9, 005 s1q8, 009 s2q2)
  - |x + c| < b gives an interval for x; compare x^2 with a constant (endpoint signs matter) (001 s1q2)
  - forces opposite signs; compare (x + y)^2 with (x - y)^2 (004 s1q4)
  - count integers with |x + a| > k|x - b|; compare with a value (006 s2q2)
  - |x - a| = bx + c: two cases, one rejected because the right side would be negative (007 s1q8)
  - two distances from a shared point on the number line: the third distance is their sum or difference (008 s1q8)
  - which absolute-value identities and inequalities hold for every real x (test a negative) (010 s1q8)
  - two different numbers equidistant from a fixed point: their sum is twice that point (012 s1q2)
- **word-problems-interest**: Interest, profit, discount and cost problems (algebra) [in 1 untaken]. Variant: profit as a percent of cost vs of price. Asked before:
  - lots sold at markup and at a discount off list; cost per unit from total profit (003 s1q6)
  - two deposits starting in different months in one simple-interest account; total interest at year's end (011 s1q9)
  - salary plus a flat commission against commission only above a threshold: the break-even sales (012 s2q9)
- **estimation-sigfig**: Estimation, rounding, scientific notation (arithmetic) [in 1 untaken]. Variant: estimating a product or quotient to pick the closest choice. Asked before:
  - estimate a product and quotient of numbers in scientific notation (003 s2q10)
  - sum of many amounts each rounded to the nearest unit; bound the true total against the strict upper limit (011 s2q1)
  - a difference of squares of two decimals near consecutive whole numbers: rounding each term misleads, factoring gives the product (012 s2q10)
  - square root of a number in scientific notation with an odd power of ten; compare with a power of ten (013 s1q2)
- **lines-angles**: Lines and angles, parallel lines (geometry) [in 1 untaken]. Variant: angles formed by several intersecting lines. Asked before:
  - two angle expressions at a transversal: equal or supplementary; select x (002 s2q13)
  - a ray from the intersection of two lines makes given angles with each line; compare the acute angle between the lines with a value (ray inside or outside) (011 s1q3)
  - two internal angle bisectors of a triangle meet: the angle between them is 90 plus half the third angle, whatever the other two (012 s1q3)
- **overlapping-sets**: Overlapping sets, Venn diagrams (data) [in 1 untaken]. Variant: at least / at most counts from a survey with overlap. Asked before:
  - **worn** two-set problem with a neither bound; range of the number in exactly one (001 s2q12, 003 s1q8, 006 s2q13)
  - three overlapping sets, everyone in at least one; greatest number in exactly one (004 s2q11)
  - three sets with all-three and neither counts; number in exactly one (005 s2q11)
  - the overlap stated as a percent of each set: equate the two expressions to compare the sets' sizes (007 s2q5)
  - three sets with the exactly-two count and a neither count given; find the number in all three (counting by multiplicity) (008 s2q7)
  - two-way table with one cell relation linking two other cells; solve for a cell (009 s2q8)
  - two sets where the both count is a multiple of the neither count; solve for neither (010 s2q7)
  - three overlapping groups in a fixed population: the feasible range of the triple overlap (complement bound below, smallest group above) (012 s2q13)
- **circles**: Circles: arcs, sectors, chords, tangents (geometry) [in 1 untaken]. Variant: circumference, or the number of rotations of a wheel. Asked before:
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
- **geometry-coordinate**: Geometry in the coordinate plane (geometry) [in 1 untaken]. Variant: a triangle's vertices on the axes. Asked before:
  - **revisit quant-002:s2q11** (you missed it): In the $xy$-plane, the points $(1, 2)$ and $(7, 6)$ are opposite vertices of a square. Which of the following is another vertex of the square? · choices: $(1, 6)$ / $(7, 2)$ / $(2, 7)$ / $(3, 8)$ / $(6, 0)$ [setup: opposite vertices of a square given; find another vertex]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-002:s2q11"`.
  - opposite vertices of a square given; find another vertex (002 s2q11)
  - triangle formed by a point and its images across y = x and across an axis; its area (011 s2q9)
  - a line through a fixed first-quadrant point cuts off a triangle of given area with the axes; the slope from the two intercepts (012 s2q6)
  - circle from its center and one point on it; length of the chord it cuts on an axis (013 s1q6)
- **figures-not-to-scale**: Reasoning from figures not drawn to scale (geometry) [in 1 untaken]. Variant: a point that looks on a line or circle but is not stated to be. Asked before:
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

right but slow (4):
- **graphs-of-functions**: Graphs of functions and parabolas, shifts and reflections (algebra) [in 1 untaken]. Variant: intersections of two graphs. Asked before:
  - parabola crossing the x-axis on both sides of the y-axis; compare b with c (002 s2q5)
  - piecewise-linear graph read at points between vertices after the input is reflected and shifted (011 s2q5)
  - a graph symmetric about the y-axis shifted horizontally: compare values at two points equidistant from the new axis (012 s2q3)

wrong on a question touching it (10):
- **pythagorean-special**: Pythagorean theorem and special right triangles (geometry) [in 1 untaken]. Variant: 30-60-90 triangle inside a hexagon, rhombus or trapezoid. Asked before:
  - **worn** oblique triangle with 45° and 30° angles split by an altitude into two special right triangles; area or a side (003 s2q11, 004 s2q12)
  - altitude to the hypotenuse splits it into given segments; perimeter (002 s2q6)
  - 30-60-90 right triangle with the altitude to the hypotenuse given; hypotenuse (005 s2q12)
  - quadrilateral split by a diagonal into a 45-45-90 and a 30-60-90 triangle; a side or the area (006 s2q12)
  - box with a square base and a given height; the space diagonal gives the base area (007 s2q6)
  - a perpendicular splits a triangle into pieces whose leg ratios reveal 45-45-90 and 30-60-90 triangles; add the angles at the vertex (backwards) (008 s2q9)
  - sliding ladder: two right triangles with the same hypotenuse (7-24-25, then 15-20-25) (009 s2q12)
  - a square whose diagonal exceeds its side by a given length: solve s sqrt2 = s + 1 (010 s2q12)
  - walk with legs along compass directions; straight-line distance from the net legs (013 s2q10)

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
