# Brief quant-012 (quant, seed 75009)

Untaken tests (their targets are damped, so this test spreads to other items): quant-010, quant-011, verbal-011, verbal-012, verbal-013, verbal-014

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

wrong on a question testing it (102):
- **quartiles-boxplots**: Quartiles, percentiles and boxplots (data) [in 1 untaken]. Variant: the percentile rank of a value in a list. Asked before:
  - add a new minimum and maximum to a list; compare the IQRs (002 s2q2)
- **geometry-coordinate**: Geometry in the coordinate plane (geometry) [in 1 untaken]. Variant: a triangle's vertices on the axes. Asked before:
  - opposite vertices of a square given; find another vertex (002 s2q11)
- **exponential-growth**: Exponential growth and compound interest (algebra) [in 1 untaken]. Variant: compound interest against simple interest. Asked before:
  - constant yearly growth with an overall 700% increase; percent over a third of the period (003 s2q5)
- **word-problems-age-sum**: Algebraic translation word problems (algebra) [in 1 untaken]. Variant: coins or tickets of two denominations. Asked before:
  - three people's shares related by more-than / twice / percent of the total (003 s1q9)
- **primes-factors**: Primes, factors, multiples, GCD/LCM (arithmetic) [in 1 untaken]. Variant: highest power of a prime dividing n! or a product. Asked before:
  - **revisit quant-001:s2q5** (you missed it): $n$ is a positive integer, and $d(m)$ denotes the number of positive divisors of the positive integer $m$. · Quantity A: $d(n^2)$ | Quantity B: $3\cdot d(n)$ [setup: divisor-count function: d(n^2) vs 3·d(n) for an unknown n]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-001:s2q5"`.
  - x^2 - y^2 = N: count or list integer solutions from same-parity factor pairs (001 s1q4)
  - divisor-count function: d(n^2) vs 3·d(n) for an unknown n (001 s2q5)
- **polygons-quadrilaterals**: Polygons and quadrilaterals (geometry) [in 1 untaken]. Variant: a regular hexagon split into triangles. Asked before:
  - rhombus with side and one diagonal; area against a value (002 s2q3)
  - interior angle k times the exterior angle; number of diagonals (003 s2q15)
- **counting-restrictions**: Counting with restrictions and arrangements (data) [in 1 untaken]. Variant: identical items arranged with a restriction. Asked before:
  - **revisit quant-001:s1q7** (you missed it): Eight people, including Ann and Bob, sit in a row of eight seats. In how many ways can they be seated if Ann and Bob are not adjacent and neither sits at either end? · choices: 9,360 / 10,800 / 12,960 / 14,400 / 15,120 [setup: row seating: two people not adjacent and neither at an end]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-001:s1q7"`.
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
- **probability-conditional**: Conditional probability and dependent events (data) [in 1 untaken]. Variant: dependent events in sequence. Asked before:
  - **worn** DI: reverse conditional probability from percents of two groups (004 s1q12, 005 s1q12)
  - without replacement: unconditional P(second is red) vs P(second red | first red) (001 s2q3)
  - two draws without replacement: P(both red | at least one red) (001 s2q6)
  - DI: conditional probability with a given overlap between categories (006 s1q11)
  - DI: one pick from each of two groups, independently; P(exactly one meets a threshold) (007 s1q11)
  - DI: P(from a qualifying group) among one category (008 s1q11)
  - DI: P(exactly one of two overlapping events) from a table; remove the overlap twice (009 s1q12)
  - DI: greatest possible probability from interval-grouped data (010 s1q12)
- **number-sense-qc**: Number sense: sign, zero, magnitude cases (arithmetic) [in 1 untaken]. Variant: sign cases: negatives, zero and fractions between 0 and 1. Asked before:
  - **revisit quant-001:s1q1** (you missed it): $0 < x < 1$. · Quantity A: $\dfrac1x$ | Quantity B: $1+x$ [setup: x between 0 and 1: compare the reciprocal 1/x with 1 + x]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-001:s1q1"`.
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
- **linear-equations**: Linear equations and simultaneous equations (algebra) [in 1 untaken]. Variant: a system with no solution or infinitely many. Asked before:
  - **worn** counts of items at two or three prices from a total count and revenue (003 s2q12, 005 s2q10)
  - for which k a 2x2 linear system has no solution (002 s2q15)
  - count integer k for which a 2x2 system has an integer solution (004 s2q9)
  - three item counts, two price lists and totals; greatest possible count of one (006 s2q9)
  - two linear equations in three unknowns; a third combination is determined (007 s2q12)
  - 1/a + 1/b = 1/c with positive values: solve for c and compare it with a (008 s2q4)
  - solve y = (ax + b)/(x - 1) for x: collect the x terms and factor (009 s1q5)
  - sum and difference linked by a multiple: find both, then the larger is their average (010 s2q9)
- **triangles**: Triangles: similar, isosceles, equilateral, inequality (geometry) [in 1 untaken]. Variant: triangles sharing a height: area ratio from the base ratio. Asked before:
  - **revisit quant-001:s2q10** (you missed it): In triangle $ABC$, $AB=13$, $BC=14$ and $AC=15$. What is the length of the altitude from $B$ to side $AC$? · choices: 11 / $\dfrac{56}{5}$ / 12 / 13 / 14 [setup: 13-14-15 triangle: altitude to one side via Heron or two right triangles]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-001:s2q10"`.
  - **worn** two sides given and an obtuse (or bounded) angle; the third side's range from c^2 against a^2 + b^2 (005 s2q14, 006 s2q15, 007 s2q2)
  - 13-14-15 triangle: altitude to one side via Heron or two right triangles (001 s2q10)
  - isosceles with sides 4 and 9: the third side must be 9; perimeter vs a value (003 s1q3)
  - isosceles triangle with one 40° angle: two cases; compare the largest angle with twice the smallest (004 s2q1)
  - a line parallel to one side cuts off a similar triangle; compare the trapezoid with the small triangle (areas scale as squares) (008 s2q2)
  - isosceles chain AD = BD = BC with one angle given; exterior angle then base angles; compare an angle with a value (009 s2q4)
  - exterior angle equals the sum of the two remote interior angles; split it by a given difference (010 s2q2)
- **overlapping-sets**: Overlapping sets, Venn diagrams (data) [in 1 untaken]. Variant: at least / at most counts from a survey with overlap. Asked before:
  - **worn** two-set problem with a neither bound; range of the number in exactly one (001 s2q12, 003 s1q8, 006 s2q13)
  - three overlapping sets, everyone in at least one; greatest number in exactly one (004 s2q11)
  - three sets with all-three and neither counts; number in exactly one (005 s2q11)
  - the overlap stated as a percent of each set: equate the two expressions to compare the sets' sizes (007 s2q5)
  - three sets with the exactly-two count and a neither count given; find the number in all three (counting by multiplicity) (008 s2q7)
  - two-way table with one cell relation linking two other cells; solve for a cell (009 s2q8)
  - two sets where the both count is a multiple of the neither count; solve for neither (010 s2q7)
- **abs-value-inequalities**: Absolute-value equations and inequalities (algebra) [in 1 untaken]. Variant: |x - a| = |x - b|: the point midway. Asked before:
  - **worn** sum of two absolute values |x - a| + |x - b| against a bound (001 s2q9, 005 s1q8, 009 s2q2)
  - |x + c| < b gives an interval for x; compare x^2 with a constant (endpoint signs matter) (001 s1q2)
  - forces opposite signs; compare (x + y)^2 with (x - y)^2 (004 s1q4)
  - count integers with |x + a| > k|x - b|; compare with a value (006 s2q2)
  - |x - a| = bx + c: two cases, one rejected because the right side would be negative (007 s1q8)
  - two distances from a shared point on the number line: the third distance is their sum or difference (008 s1q8)
  - which absolute-value identities and inequalities hold for every real x (test a negative) (010 s1q8)
- **circles**: Circles: arcs, sectors, chords, tangents (geometry) [in 1 untaken]. Variant: inscribed angle vs central angle. Asked before:
  - chord length gives the central angle; minor arc length (002 s1q6)
  - two parallel chords at known distances from the center (003 s2q6)
  - annulus with a chord of the outer circle tangent to the inner; ring area (004 s2q6)
  - arc length and sector area give r and angle; compare the chord with a value (005 s2q2)
  - two equal circles at a given center distance; area of the overlap (lens) (006 s2q7)
  - chord and radius give the distance to the center; chord to the arc midpoint (007 s1q6)
  - two wheels of different diameters cover the same distance; the difference in rotations (008 s2q6)
  - two tangents from an external point; area between the tangents and the minor arc (009 s2q9)
  - concentric lanes: the extra distance per lap is 2 pi times the gap, independent of the radius (010 s2q6)
- **fractions-decimals**: Fractions, decimals and decimal representation (arithmetic) [in 1 untaken]. Variant: rational vs irrational: which expressions must be rational. Asked before:
  - sum of two repeating decimals vs 1 (002 s2q4)
  - compare (10^8 + 1)/(10^9 + 1) with (10^9 + 1)/(10^10 + 1) (003 s2q3)
  - digits after the decimal point of k/(2^a 5^b) for odd k (004 s2q4)
  - tank goes from one fraction full to another after a draw; amount to fill (005 s1q9)
  - telescoping product of (1 - 1/k^2) (006 s1q9)
  - which fraction lies between two close fractions (007 s2q10)
  - repeating decimal x; compare 1/x with a value (008 s1q1)
  - an expression with surds whose irrational parts cancel; compare it with a whole number (009 s1q1)
  - which fraction terminates: reduce first, then check the denominator's primes (010 s2q10)

right but guessed (4):
- **sequences-patterns**: Sequences, series and patterns (arithmetic) [in 1 untaken]. Variant: recursive sequence: find a term or a sum. Asked before:
  - recursive a_{n+1} = 1/(1 - a_n) cycles with period 3; sum of 100 terms (002 s2q7)
- **solids-volume**: Volume and surface area of solids (geometry) [in 1 untaken]. Variant: liquid poured between containers. Asked before:
  - horizontal cylinder partly filled: circular-segment area times length (002 s2q8)

right but slow (6):
- **functions**: Functions, notation, composition and defined operations (algebra) [in 1 untaken]. Variant: a function property such as f(-x) = -f(x) or f(x + 1) = f(x). Asked before:
  - minimum value of f(f(x)) for a quadratic f (001 s2q11)
- **word-problems-interest**: Interest, profit, discount and cost problems (algebra) [in 1 untaken]. Variant: tiered pricing or commission. Asked before:
  - lots sold at markup and at a discount off list; cost per unit from total profit (003 s1q6)
- **graphs-of-functions**: Graphs of functions and parabolas, shifts and reflections (algebra) [in 1 untaken]. Variant: symmetry about an axis, the origin or y = x. Asked before:
  - parabola crossing the x-axis on both sides of the y-axis; compare b with c (002 s2q5)

never tested (2):
- **normal-distribution**: Normal distribution: 68-95-99.7 rule, z-scores, percentiles (data) [in 1 untaken]. Variant: the 68-95-99.7 rule for a probability
- **random-variables**: Random variables, probability distributions, expected value (data) [in 1 untaken]. Variant: expected value from a probability table

covered, no weakness (4):
- **estimation-sigfig**: Estimation, rounding, scientific notation (arithmetic) [in 1 untaken]. Variant: estimating a product or quotient to pick the closest choice. Asked before:
  - estimate a product and quotient of numbers in scientific notation (003 s2q10)
- **units-conversion**: Units and measurement conversions (arithmetic) [in 1 untaken]. Variant: currency or exchange rates. Asked before:
  - liters per second to cubic meters over hours (002 s1q5)

wrong on a question touching it (15):
- **data-interpretation-calc**: Data interpretation: percent and ratio from graphs (data) [in 1 untaken]. Variant: percent of a percent across two charts. Asked before:
  - DI: percent increase of a combined total (all categories but one) between two years (001 s1q10)
  - DI: percent greater between two groups' counts (002 s1q11)
  - DI: one category's percent of a total across groups (003 s1q10)
  - DI: percent increase in the total across all categories (004 s1q10)
  - DI: percent change of one category between two years (005 s1q10)
  - DI: one category's percent increase as a multiple of another's percent decrease (006 s1q10)
  - DI: a stated fraction of one subgroup gives a count; its percent of the whole group (007 s1q10)
  - DI: percentage-point difference between two groups' shares (008 s1q10)
  - DI: total of one status across groups, each from a percent of a different base (009 s1q10)
  - DI: read each box plot's interquartile range and count those meeting a bound (010 s1q10)
- **lines-angles**: Lines and angles, parallel lines (geometry) [in 1 untaken]. Variant: angle bisectors. Asked before:
  - two angle expressions at a transversal: equal or supplementary; select x (002 s2q13)
- **number-line-abs**: Number line, absolute value of numbers (arithmetic) [in 1 untaken]. Variant: |a| + |b| against |a + b| for signed values. Asked before:
  - |x - a| < |x + b|: x is nearer a than -b; compare x with the midpoint (002 s1q1)

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
