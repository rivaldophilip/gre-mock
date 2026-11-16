# Brief quant-011 (quant, seed 70973)

Untaken tests (their targets are damped, so this test spreads to other items): quant-010, verbal-011, verbal-012, verbal-013, verbal-014

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

wrong on a question testing it (56):
- **quartiles-boxplots**: Quartiles, percentiles and boxplots (data). Variant: comparing two boxplots. Asked before:
  - add a new minimum and maximum to a list; compare the IQRs (002 s2q2)
- **geometry-coordinate**: Geometry in the coordinate plane (geometry). Variant: reflection of a point across an axis or y = x. Asked before:
  - opposite vertices of a square given; find another vertex (002 s2q11)
- **exponential-growth**: Exponential growth and compound interest (algebra). Variant: doubling or halving time. Asked before:
  - constant yearly growth with an overall 700% increase; percent over a third of the period (003 s2q5)
- **word-problems-age-sum**: Algebraic translation word problems (algebra). Variant: ages then and now. Asked before:
  - three people's shares related by more-than / twice / percent of the total (003 s1q9)
- **primes-factors**: Primes, factors, multiples, GCD/LCM (arithmetic). Variant: smallest multiplier that makes a perfect square or cube. Asked before:
  - **revisit quant-001:s2q5** (you missed it): $n$ is a positive integer, and $d(m)$ denotes the number of positive divisors of the positive integer $m$. · Quantity A: $d(n^2)$ | Quantity B: $3\cdot d(n)$ [setup: divisor-count function: d(n^2) vs 3·d(n) for an unknown n]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-001:s2q5"`.
  - x^2 - y^2 = N: count or list integer solutions from same-parity factor pairs (001 s1q4)
  - divisor-count function: d(n^2) vs 3·d(n) for an unknown n (001 s2q5)
- **polygons-quadrilaterals**: Polygons and quadrilaterals (geometry). Variant: the number of diagonals of a polygon. Asked before:
  - rhombus with side and one diagonal; area against a value (002 s2q3)
  - interior angle k times the exterior angle; number of diagonals (003 s2q15)
- **coordinate-geometry**: Coordinate plane, lines, slope, distance (algebra). Variant: which quadrants a line passes through. Asked before:
  - line through a point perpendicular to a given line; its x-intercept (002 s2q9)
- **quadratics-factoring**: Factoring and quadratic equations (algebra). Variant: special products: (a+b)^2, (a-b)^2, a^2 - b^2. Asked before:
  - x^2 + kx + c with two distinct positive integer roots; possible k (002 s2q14)
- **figures-not-to-scale**: Reasoning from figures not drawn to scale (geometry) [in 1 untaken]. Variant: a figure looks symmetric, but the givens don't force it. Asked before:
  - **revisit quant-002:s1q3** (you missed it): In the figure, $D$ is a point on side $BC$ of triangle $ABC$, $AB=AC=5$ and $BD=3$. · Quantity A: $DC$ | Quantity B: $3$ [setup: isosceles triangle, point on the base with one segment given; compare the other segment (D)]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-002:s1q3"`.
  - isosceles triangle, point on the base with one segment given; compare the other segment (D) (002 s1q3)
  - rhombus with side and diagonal given: area vs a value (fixed) (003 s2q2)
  - median AD with BD = DC and a 3-4-5 right triangle forced; compare AC with a value (004 s1q3)
  - AD = BD = DC forces a right angle; compare the sum of two sides with sqrt(2) times the third (005 s1q3)
  - two sides and the area given (the included angle acute or obtuse); compare the third side with a value (006 s1q3)
  - points on a line in unknown order with given distances and one betweenness fact; compare a distance with a value (007 s1q3)
  - kite given only by side lengths: the angles between unequal sides are equal (SSS); no figure (008 s1q3)
  - triangles sharing a height: split the area by a base ratio and then by a midpoint; compare two pieces (009 s1q3)
  - three side lengths, no figure: identify which side each angle faces; the larger side has the larger opposite angle (010 s1q3)
- **remainders-units**: Remainders and units digits (arithmetic) [in 1 untaken]. Variant: remainder of a negative or fractional expression of n. Asked before:
  - **revisit quant-001:s2q8** (you missed it): What is the remainder when $5^{100}+7^{100}$ is divided by 13? · choices: 2 / 6 / 8 / 10 / 12 [setup: remainder of a^n ± b^n mod a small number via power cycles]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-001:s2q8"`.
  - **worn** remainder of a^n ± b^n mod a small number via power cycles (001 s1q6, 001 s2q8, 005 s1q6, 006 s1q2)
  - k ≡ 5 mod 6; remainders of high powers of k mod 8 and mod 3 (003 s1q2)
  - units digits of 3^n and 7^n combined (sum vs product) for every n (004 s2q3)
  - two remainder conditions that conflict in parity: no such number; compare the count with a value (007 s2q3)
  - n + 1 a multiple of 6; remainder of n^2 + n mod 12 vs a value (008 s2q3)
  - the decimal part of n/d reduces to a fraction; the least divisor is its reduced denominator (009 s1q4)
  - from the last digit of a sum of powers back to the parity of n; then another power's last digit (010 s2q1)
- **inscribed-figures**: Inscribed and circumscribed figures, composite shapes (geometry) [in 1 untaken]. Variant: a regular hexagon in a circle. Asked before:
  - **revisit quant-001:s1q3** (you missed it): A square is inscribed in a circle, and that circle is inscribed in a larger square whose area is 64. · Quantity A: The area of the smaller square | Quantity B: $30$ [setup: square in a circle in a larger square of given area; compare the inner square's area with a value]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-001:s1q3"`.
  - **worn** square inscribed in a semicircle with one side on the diameter (001 s2q7, 003 s2q8, 006 s2q11)
  - **worn** incircle of a right triangle; distance from the incenter to a vertex or the circumcenter (004 s2q8, 009 s2q7)
  - square in a circle in a larger square of given area; compare the inner square's area with a value (001 s1q3)
  - equilateral triangle between its incircle and circumcircle; ring area gives the side (005 s2q7)
  - crescents on the legs of a right triangle inscribed in a circle: their total area equals the triangle's (007 s2q7)
  - circle through two vertices of a square and tangent to the opposite side; radius (008 s2q8)
  - four tangent circles in a square: the central gap is the centers' square minus four quarter disks (010 s2q8)
- **ratio-proportion**: Ratio and proportion (arithmetic) [in 1 untaken]. Variant: direct vs inverse proportion. Asked before:
  - **worn** ratio before and after adding or removing items of one or both kinds; a total (002 s1q9, 005 s1q5, 006 s2q6)
  - chained ratios a:b and b:c with bounds; possible totals (003 s2q13)
  - mix two blends with different part ratios to reach a 1:1 mixture (004 s1q5)
  - three-part budget ratio; one part grows to a given fraction of the total; new total (007 s1q5)
  - chained ratios a:b and b:c with a difference given; one count (008 s1q5)
  - a map scale applies to lengths; the actual area scales by its square (009 s1q9)
  - workers and time are inversely proportional; scale the time (010 s1q9)

right but guessed (4):
- **sequences-patterns**: Sequences, series and patterns (arithmetic). Variant: telescoping sum of differences. Asked before:
  - recursive a_{n+1} = 1/(1 - a_n) cycles with period 3; sum of 100 terms (002 s2q7)
- **solids-volume**: Volume and surface area of solids (geometry). Variant: cubes painted or cut into smaller cubes. Asked before:
  - horizontal cylinder partly filled: circular-segment area times length (002 s2q8)

right but slow (6):
- **functions**: Functions, notation, composition and defined operations (algebra). Variant: a function given by a table. Asked before:
  - minimum value of f(f(x)) for a quadratic f (001 s2q11)
- **word-problems-interest**: Interest, profit, discount and cost problems (algebra). Variant: simple interest over a partial year. Asked before:
  - lots sold at markup and at a discount off list; cost per unit from total profit (003 s1q6)
- **graphs-of-functions**: Graphs of functions and parabolas, shifts and reflections (algebra). Variant: reading the value of f at a point from a graph. Asked before:
  - parabola crossing the x-axis on both sides of the y-axis; compare b with c (002 s2q5)

wrong on a question touching it (4):
- **number-line-abs**: Number line, absolute value of numbers (arithmetic). Variant: positions of unlabeled points on a number line. Asked before:
  - |x - a| < |x + b|: x is nearer a than -b; compare x with the midpoint (002 s1q1)
- **lines-angles**: Lines and angles, parallel lines (geometry). Variant: angles around a point or on a straight line. Asked before:
  - two angle expressions at a transversal: equal or supplementary; select x (002 s2q13)

never tested (2):
- **normal-distribution**: Normal distribution: 68-95-99.7 rule, z-scores, percentiles (data). Variant: a percentile from a z-score
- **random-variables**: Random variables, probability distributions, expected value (data). Variant: mean and median of a discrete distribution table

covered, no weakness (11):
- **quadratic-inequalities**: Quadratic and other nonlinear inequalities (sign analysis) (algebra). Variant: an inequality with x in the denominator (case on sign)
- **units-conversion**: Units and measurement conversions (arithmetic). Variant: chained unit conversion. Asked before:
  - liters per second to cubic meters over hours (002 s1q5)
- **weighted-average**: Weighted average and changing averages (data). Variant: a mixture's concentration as a weighted average. Asked before:
  - two group means and one group's size; find the other group's size from the overall mean (001 s1q9)
- **frequency-distributions**: Frequency distributions and histograms (data). Variant: mean from a histogram's grouped data. Asked before:
  - DI: change in the median after moving one category's values (002 s1q12)
- **data-tables-graphs**: Reading tables, bar, line, circle graphs, scatterplots and time plots (data). Variant: reading values from a stacked or segmented bar graph. Asked before:
  - DI: count of students at or above a threshold from a frequency chart (002 s1q10)
- **estimation-sigfig**: Estimation, rounding, scientific notation (arithmetic). Variant: rounding to a place, then computing. Asked before:
  - estimate a product and quotient of numbers in scientific notation (003 s2q10)

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
