# Brief quant-016 (quant, seed 40086)

Untaken tests (their targets are damped, so this test spreads to other items): drill-002, drill-003, drill-004, drill-005, drill-006, drill-007, drill-008, drill-009, drill-010, drill-011, quant-015, verbal-017, verbal-018, verbal-019

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

Type focus (need >= 0.4, put the weakest items here): mc, mc_multi, qc, numeric

## Concept slots (one primary concept per question, any order; a DI set shares an area)

Write each question as its variant (the form of the concept earlier mocks used least), with a setup that is **not** in the slot's history below: new numbers, names or a story around a listed setup are the same item. **Worn** setups (2+ tests) are banned outright. Record `setup` and `variant` on each question. A slot marked **revisit** is the one exception: a sibling of an item you missed, with the change named (at most 4 per test).

wrong on a question testing it (173):
- **algebraic-expressions**: Algebraic expressions, identities, simplification (algebra). Variant: an expression's value from a related expression (x + 1/x given). Asked before:
  - **revisit quant-002:s1q8** (you missed it): If $x+\dfrac1x=4$, which of the following must be integers? Select all such quantities. · choices: $x^2+\dfrac{1}{x^2}$ / $x-\dfrac1x$ / $x^3+\dfrac{1}{x^3}$ / $\left(x-\dfrac1x\right)^2$ / $x^2-\dfrac{1}{x^2}$ / $\dfrac{x^2+1}{x}$ [setup: value of a symmetric expression (a^3 ± b^3, |a| + |b|, a^2 + b^2) from a ± b, ab or a^2 + b^2]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-002:s1q8"`.
  - **worn** value of a symmetric expression (a^3 ± b^3, |a| + |b|, a^2 + b^2) from a ± b, ab or a^2 + b^2 (002 s1q8, 003 s2q4, 006 s2q5)
  - which expressions equal a rational expression on its whole domain (removable points) (004 s2q13)
  - which expressions equal (a - b)^2 (a + b)^2 identically (005 s2q13)
  - difference of two rational expressions that both simplify; compare with a constant (the excluded values do not matter) (007 s2q4)
  - remove nested brackets with sign changes; the expression collapses to one term (008 s2q12)
  - factor a difference of squares twice; select every polynomial factor, including composite ones (009 s2q13)
  - an identity in completed-square form: match constant terms to find k (010 s2q4)
  - x + 1/x given; a non-symmetric polynomial in x reduces to a constant by repeatedly replacing x^2 with a linear expression (013 s2q8)
- **normal-distribution**: Normal distribution: 68-95-99.7 rule, z-scores, percentiles (data). Variant: comparing values in two normal distributions (z-scores). Asked before:
  - variance given rather than SD; percentile at two SDs above the mean against the 95 from the empirical rule (011 s2q2)
  - an interval from one to three standard deviations above the mean: one tail band only, against a value (012 s2q4)
  - normal with known mean and one upper-tail probability; lower-tail probability at a nearer cutoff vs that probability (013 s2q1)
- **polygons-quadrilaterals**: Polygons and quadrilaterals (geometry). Variant: a regular hexagon split into triangles. Asked before:
  - rhombus with side and one diagonal; area against a value (002 s2q3)
  - interior angle k times the exterior angle; number of diagonals (003 s2q15)
  - count the diagonals of a regular polygon, then remove those through the center (011 s2q11)
  - the triangle on two adjacent vertices and an opposite vertex of a regular hexagon: its fraction of the hexagon's area (012 s2q12)
  - trapezoid diagonals cut it into four triangles; two triangle areas give the trapezoid's area (013 s2q9)
- **exponents-roots**: Exponents and radicals (arithmetic). Variant: bases between 0 and 1 or negative bases. Asked before:
  - **worn** (b^{n+k} ± b^n) over a similar sum of powers: factor out the common power (002 s1q2, 005 s1q2)
  - **worn** sqrt(3·9^n) against a power of 3: rewrite as powers of 3 (003 s2q1, 004 s1q2)
  - sqrt(a+2) - sqrt(a) vs sqrt(a) - sqrt(a-2) (conjugates) (006 s2q1)
  - 0 < x < 1: compare two negative fractional powers of x (the more negative exponent gives the larger value) (007 s1q2)
  - 5th root of 5 vs cube root of 3 (raise both to the 15th) (008 s2q1)
  - a negative fractional power is given; raise it to another power by multiplying exponents (009 s2q1)
  - sqrt(a + 2sqrt b) - sqrt(a - 2sqrt b) denested; compare with a root (010 s1q2)
  - sum of reciprocals of consecutive root sums telescopes after rationalizing; select n making it an integer (013 s2q14)
- **triangles**: Triangles: similar, isosceles, equilateral, inequality (geometry). Variant: exterior angle theorem. Asked before:
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
- **quadratic-inequalities**: Quadratic and other nonlinear inequalities (sign analysis) (algebra). Variant: integer count in a solution set such as x^2 < 10. Asked before:
  - rational inequality k/x > x - c; multiplying through by x loses the negative branch; compare x with the left root (011 s1q4)
  - x^3 < x with no sign given; compare x^2 with x across the two solution intervals (013 s1q1)
- **integers-properties**: Integer properties, even/odd, divisibility (arithmetic). Variant: consecutive integers: sum, product or count in a range. Asked before:
  - **worn** k^2 leaves remainder 1 mod 8; compare k mod 8 with k^3 mod 8 (002 s1q4, 005 s2q1)
  - n with exactly 3 divisors is p^2; compare divisor counts of n^2 and 2n (004 s2q5)
  - k^2 divisible by 72: greatest number that must divide k (006 s2q4)
  - reversing a two-digit number changes it by 9 times the digit difference; count the numbers (007 s2q1)
  - parity of ab + a + b through (a + 1)(b + 1) - 1; count pairs (008 s2q15)
  - count divisors of N divisible by one number but not another (from the prime factorization) (009 s2q15)
  - a sum of an odd number k of consecutive integers is k times the middle one; select which numbers qualify (010 s2q14)
  - two parity conditions on three unknown integers (one leaves open which of two is even); which expression must be odd (013 s2q12)
  - a digit condition makes a three-digit number a multiple of 11; compare the remainder with the units digit, which can be zero (014 s2q5)
- **probability-conditional**: Conditional probability and dependent events (data). Variant: P(A or B) with overlap. Asked before:
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
- **fractions-decimals**: Fractions, decimals and decimal representation (arithmetic). Variant: ordering fractions with unknowns or near-equal values. Asked before:
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
- **mean-median-mode**: Mean, median, mode, range (data). Variant: mode and range of a combined list. Asked before:
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
- **word-problems-age-sum**: Algebraic translation word problems (algebra). Variant: consecutive-number sums. Asked before:
  - three people's shares related by more-than / twice / percent of the total (003 s1q9)
  - 'when one was as old as the other is now' statements in both directions; the constant age gap (011 s2q6)
  - the value of two coin types and the value if their counts were swapped; the total count from adding the two equations (012 s1q6)
  - sum of an even-length run of consecutive integers given; the greatest from the half-integer average (014 s1q9)
- **linear-equations**: Linear equations and simultaneous equations (algebra). Variant: a system with no solution or infinitely many. Asked before:
  - **revisit quant-002:s2q15** (you missed it): For what value of the constant $k$ does the system of equations $kx+3y=6$ and $12x+ky=12$ have no solution $(x, y)$? [setup: for which k a 2x2 linear system has no solution]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-002:s2q15"`.
  - **worn** counts of items at two or three prices from a total count and revenue (003 s2q12, 005 s2q10)
  - for which k a 2x2 linear system has no solution (002 s2q15)
  - count integer k for which a 2x2 system has an integer solution (004 s2q9)
  - three item counts, two price lists and totals; greatest possible count of one (006 s2q9)
  - two linear equations in three unknowns; a third combination is determined (007 s2q12)
  - 1/a + 1/b = 1/c with positive values: solve for c and compare it with a (008 s2q4)
  - solve y = (ax + b)/(x - 1) for x: collect the x terms and factor (009 s1q5)
  - sum and difference linked by a multiple: find both, then the larger is their average (010 s2q9)
  - two equations that are multiples of one line: count the positive integer solutions of that line (012 s2q7)
  - a price after a percent discount plus a flat fee, solved for the discount rate (move the fee before dividing; the fee's sign flips) (014 s2q6)
- **solids-volume**: Volume and surface area of solids (geometry). Variant: rectangular solid: faces, volume, diagonal. Asked before:
  - horizontal cylinder partly filled: circular-segment area times length (002 s2q8)
  - rectangular block painted on all faces but its base, then cut into unit cubes; count cubes with exactly two painted faces (011 s2q15)
  - a cone filled to half its height poured into a cylinder: the water's volume scales with the cube of the depth (012 s2q5)
  - horizontal cylinder more than half full, the empty segment's central angle given: whole cross section minus the empty segment, times the length (014 s2q11)
- **quartiles-boxplots**: Quartiles, percentiles and boxplots (data). Variant: quartiles of a list with an even count. Asked before:
  - **revisit quant-002:s2q2** (you missed it): List $L$ consists of 10 different numbers. List $M$ consists of the numbers in $L$ together with two more: one less than every number in $L$ and one greater than every number in $L$. (The first and third quartiles of a list with an even number of values are the medians of its lower half and its upper half.) · Quantity A: The interquartile range of $M$ | Quantity B: The interquartile range of $L$ [setup: add a new minimum and maximum to a list; compare the IQRs]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-002:s2q2"`.
  - add a new minimum and maximum to a list; compare the IQRs (002 s2q2)
  - two boxplots on one scale; select statements forced by the five-number summaries (range, IQR, counts relative to the other's median) (011 s2q13)
  - a value's percentile rank before and after a batch of numbers is added: how many of the batch fall below it (012 s2q15)
  - read Q1 and Q3 off a boxplot; the outlier fence above Q3 and the least whole value past it (014 s2q15)
- **exponential-growth**: Exponential growth and compound interest (algebra). Variant: comparing two exponential models. Asked before:
  - constant yearly growth with an overall 700% increase; percent over a third of the period (003 s2q5)
  - two decaying amounts with different halving times and a starting ratio; time when they are equal (011 s1q6)
  - the two-year gap between compound and simple interest is the principal times the rate squared: recover the rate, then the simple interest (012 s2q11)
  - two exponential models whose different-looking bases and exponents rewrite to the same yearly factor; a constant ratio (014 s2q12)
- **area-perimeter**: Area and perimeter (geometry). Variant: the effect of scaling a side on the area. Asked before:
  - **worn** uniform border around a rectangle; border area against the outer dimensions or perimeter (004 s2q10, 005 s2q15, 006 s2q10)
  - rectangle from perimeter and diagonal; area via (a+b)^2 - (a^2+b^2) (002 s2q12)
  - rectangle with a fixed diagonal; select possible perimeters (range) (003 s2q14)
  - trade length for width at a fixed perimeter until a square; the area gain (007 s2q15)
  - corner cut from a rectangle: perimeter of the remaining L shape (008 s2q10)
  - perimeter of a composite figure: count only the outside edges (shared sides drop out) (009 s2q10)
  - rectangle cut into four by two cuts; three areas given, find the fourth (integer sides) (010 s2q15)
  - similar rectangles: the perimeter ratio and the larger area give the smaller area (013 s1q9)
  - one side scaled by a percent; the other side's percent change that gives a target area increase (factors multiply, not add) (014 s2q10)
- **geometry-coordinate**: Geometry in the coordinate plane (geometry) [in 1 untaken]. Variant: area of a polygon from its vertex coordinates. Asked before:
  - opposite vertices of a square given; find another vertex (002 s2q11)
  - triangle formed by a point and its images across y = x and across an axis; its area (011 s2q9)
  - a line through a fixed first-quadrant point cuts off a triangle of given area with the axes; the slope from the two intercepts (012 s2q6)
  - circle from its center and one point on it; length of the chord it cuts on an axis (013 s1q6)
  - adjacent vertices of a square on the two axes; find another vertex by turning the side vector 90 degrees (the center method for opposite vertices is the trap) (015 s2q8)
- **coordinate-geometry**: Coordinate plane, lines, slope, distance (algebra) [in 1 untaken]. Variant: a region defined by inequalities in the plane. Asked before:
  - line through a point perpendicular to a given line; its x-intercept (002 s2q9)
  - general-form line with sign conditions on products of coefficients; select what it must pass through (011 s1q8)
  - line through a point meets the x-axis at a given distance; it is perpendicular to a line with an unknown coefficient; find the coefficient (013 s2q6)
  - a line through two given points; the sum of its two intercepts (015 s2q10)
- **figures-not-to-scale**: Reasoning from figures not drawn to scale (geometry) [in 1 untaken]. Variant: lines that look parallel or perpendicular but are not stated to be. Asked before:
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
- **sequences-patterns**: Sequences, series and patterns (arithmetic) [in 1 untaken]. Variant: arithmetic sequence: n-th term, sum, count of terms. Asked before:
  - recursive a_{n+1} = 1/(1 - a_n) cycles with period 3; sum of 100 terms (002 s2q7)
  - recursive sequence whose step is a partial-fraction term; the nth term by telescoping, with an off-by-one in the term count (011 s2q3)
  - linear recursion doubling minus one: shift by 1 to get powers of 2; first term past a bound (012 s1q9)
  - a recursion with period four; sum of the terms whose index is a multiple of three up to a bound (013 s2q15)
  - a list of squares with alternating signs: pair consecutive terms into differences of squares; an odd number of terms leaves one unpaired (015 s2q15)

wrong on a question touching it (23):
- **data-interpretation-calc**: Data interpretation: percent and ratio from graphs (data). Variant: a ratio between two categories in different graphs. Asked before:
  - **revisit quant-002:s1q11** (you missed it): The number of Grade 8 students who read exactly 3 books is approximately what percent greater than the number of Grade 7 students who read exactly 3 books? · choices: 8% / 27% / 36% / 73% / 136% [setup: DI: percent greater between two groups' counts]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-002:s1q11"`.
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
  - DI: compare two departments' non-remote counts, each the complement of a within-department percent applied to a percent of the whole (012 s1q10)
  - DI: share of all units (not of orders) that sit in the larger-order rows of a frequency table (014 s1q10)
- **number-line-abs**: Number line, absolute value of numbers (arithmetic). Variant: distance between two numbers as an absolute value. Asked before:
  - |x - a| < |x + b|: x is nearer a than -b; compare x with the midpoint (002 s1q1)
  - equally spaced ticks with two fractional labels; locate two unlabeled points and compare their sum with the tick spacing (011 s1q2)
  - opposite signs: the absolute difference equals the sum of the absolute values (012 s1q1)
  - x between two negative marks; compare x^2 with x + 1 (the crossover lies inside the interval) (014 s1q2)
- **data-tables-graphs**: Reading tables, bar, line, circle graphs, scatterplots and time plots (data). Variant: a scatterplot: counting points or reading a trend line. Asked before:
  - DI: count of students at or above a threshold from a frequency chart (002 s1q10)
  - stacked bars of two groups over intervals; pick the interval with the greatest ratio of segment heights (011 s1q10)
  - DI: circle graph of a subgroup only: central angle of one category on the reduced base (013 s1q11)

right but slow (4):
- **random-variables**: Random variables, probability distributions, expected value (data). Variant: a uniform distribution over an interval. Asked before:
  - probability table where the median is not the middle listed value; mean minus median (011 s2q12)
  - DI: expected days on site per employee, weighting by department share and the non-remote share, remote counted as 0 (012 s1q11)
  - triangular density on an interval: find the peak height, then the area of a tail; compare with a value (013 s2q3)

covered, no weakness (9):
- **frequency-distributions**: Frequency distributions and histograms (data). Variant: median from a frequency table. Asked before:
  - DI: change in the median after moving one category's values (002 s1q12)
  - one group's segments of a stacked interval graph; estimated mean from interval midpoints (011 s1q11)
  - DI: cumulative frequency table; least value at which the cumulative share reaches a given percent (a percentile) (013 s1q10)
- **units-conversion**: Units and measurement conversions (arithmetic). Variant: chained unit conversion. Asked before:
  - liters per second to cubic meters over hours (002 s1q5)
  - price per square inch; cost of an area given in square yards, with each linear factor squared inside the chain (011 s1q1)
  - money converted out, part spent abroad, the remainder converted back at a different rate (012 s1q5)
  - speed, fuel economy and fuel price; the fuel cost for a time given in minutes (014 s1q5)

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
