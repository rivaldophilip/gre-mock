# Brief quant-014 (quant, seed 64125)

Untaken tests (their targets are damped, so this test spreads to other items): quant-013, verbal-016, verbal-017, verbal-018, verbal-019

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

wrong on a question testing it (192):
- **inscribed-figures**: Inscribed and circumscribed figures, composite shapes (geometry). Variant: a shaded region: whole minus part. Asked before:
  - **revisit quant-001:s2q7** (you missed it): A square is inscribed in a semicircle of radius 5 so that one side of the square lies along the diameter of the semicircle and the other two vertices lie on the arc. What is the area of the square? · choices: 16 / 20 / $25/2$ / $25\sqrt2/2$ / 25 [setup: square inscribed in a semicircle with one side on the diameter]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-001:s2q7"`.
  - **worn** square inscribed in a semicircle with one side on the diameter (001 s2q7, 003 s2q8, 006 s2q11)
  - **worn** incircle of a right triangle; distance from the incenter to a vertex or the circumcenter (004 s2q8, 009 s2q7)
  - square in a circle in a larger square of given area; compare the inner square's area with a value (001 s1q3)
  - equilateral triangle between its incircle and circumcircle; ring area gives the side (005 s2q7)
  - crescents on the legs of a right triangle inscribed in a circle: their total area equals the triangle's (007 s2q7)
  - circle through two vertices of a square and tangent to the opposite side; radius (008 s2q8)
  - four tangent circles in a square: the central gap is the centers' square minus four quarter disks (010 s2q8)
  - regular hexagon in a circle in a larger regular hexagon of given area; the inner area from the apothem-radius ratio (011 s2q7)
- **ratio-proportion**: Ratio and proportion (arithmetic). Variant: scale maps and models. Asked before:
  - **worn** ratio before and after adding or removing items of one or both kinds; a total (002 s1q9, 005 s1q5, 006 s2q6)
  - chained ratios a:b and b:c with bounds; possible totals (003 s2q13)
  - mix two blends with different part ratios to reach a 1:1 mixture (004 s1q5)
  - three-part budget ratio; one part grows to a given fraction of the total; new total (007 s1q5)
  - chained ratios a:b and b:c with a difference given; one count (008 s1q5)
  - a map scale applies to lengths; the actual area scales by its square (009 s1q9)
  - workers and time are inversely proportional; scale the time (010 s1q9)
  - inverse proportion: a percent increase in one variable; the percent decrease in the other (011 s1q5)
- **remainders-units**: Remainders and units digits (arithmetic). Variant: last two digits of a product too large for the calculator. Asked before:
  - **worn** remainder of a^n ± b^n mod a small number via power cycles (001 s1q6, 001 s2q8, 005 s1q6, 006 s1q2)
  - k ≡ 5 mod 6; remainders of high powers of k mod 8 and mod 3 (003 s1q2)
  - units digits of 3^n and 7^n combined (sum vs product) for every n (004 s2q3)
  - two remainder conditions that conflict in parity: no such number; compare the count with a value (007 s2q3)
  - n + 1 a multiple of 6; remainder of n^2 + n mod 12 vs a value (008 s2q3)
  - the decimal part of n/d reduces to a fraction; the least divisor is its reduced denominator (009 s1q4)
  - from the last digit of a sum of powers back to the parity of n; then another power's last digit (010 s2q1)
  - remainder of the negative of a large power, via the power's cycle and the nonnegative-remainder rule (011 s1q7)
- **counting-restrictions**: Counting with restrictions and arrangements (data). Variant: at least one of a type in a selection. Asked before:
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
- **probability-conditional**: Conditional probability and dependent events (data). Variant: drawing without replacement. Asked before:
  - **worn** DI: reverse conditional probability from percents of two groups (004 s1q12, 005 s1q12)
  - without replacement: unconditional P(second is red) vs P(second red | first red) (001 s2q3)
  - two draws without replacement: P(both red | at least one red) (001 s2q6)
  - DI: conditional probability with a given overlap between categories (006 s1q11)
  - DI: one pick from each of two groups, independently; P(exactly one meets a threshold) (007 s1q11)
  - DI: P(from a qualifying group) among one category (008 s1q11)
  - DI: P(exactly one of two overlapping events) from a table; remove the overlap twice (009 s1q12)
  - DI: greatest possible probability from interval-grouped data (010 s1q12)
  - DI: draws without replacement from one group until the first of a category appears; probability it is the k-th draw (012 s1q12)
- **overlapping-sets**: Overlapping sets, Venn diagrams (data). Variant: a double-matrix (two-way) table. Asked before:
  - **revisit quant-001:s2q12** (you missed it): Fifty people were surveyed: 30 own a dog and 28 own a cat. What is the greatest possible number of people who own exactly one of the two kinds of pet? · choices: 38 / 40 / 42 / 46 / 50 [setup: two-set problem with a neither bound; range of the number in exactly one]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-001:s2q12"`.
  - **worn** two-set problem with a neither bound; range of the number in exactly one (001 s2q12, 003 s1q8, 006 s2q13)
  - three overlapping sets, everyone in at least one; greatest number in exactly one (004 s2q11)
  - three sets with all-three and neither counts; number in exactly one (005 s2q11)
  - the overlap stated as a percent of each set: equate the two expressions to compare the sets' sizes (007 s2q5)
  - three sets with the exactly-two count and a neither count given; find the number in all three (counting by multiplicity) (008 s2q7)
  - two-way table with one cell relation linking two other cells; solve for a cell (009 s2q8)
  - two sets where the both count is a multiple of the neither count; solve for neither (010 s2q7)
  - three overlapping groups in a fixed population: the feasible range of the triple overlap (complement bound below, smallest group above) (012 s2q13)
- **circles**: Circles: arcs, sectors, chords, tangents (geometry). Variant: inscribed angle vs central angle. Asked before:
  - **revisit quant-002:s1q6** (you missed it): In a circle of radius 6, chord $AB$ has length $6\sqrt3$. What is the length of the minor arc $AB$? · choices: $2\pi$ / $3\pi$ / $4\pi$ / $6\pi$ / $8\pi$ [setup: chord length gives the central angle; minor arc length]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-002:s1q6"`.
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
- **figures-not-to-scale**: Reasoning from figures not drawn to scale (geometry). Variant: lines that look parallel or perpendicular but are not stated to be. Asked before:
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
- **word-problems-age-sum**: Algebraic translation word problems (algebra). Variant: consecutive-number sums. Asked before:
  - three people's shares related by more-than / twice / percent of the total (003 s1q9)
  - 'when one was as old as the other is now' statements in both directions; the constant age gap (011 s2q6)
  - the value of two coin types and the value if their counts were swapped; the total count from adding the two equations (012 s1q6)
- **fractions-decimals**: Fractions, decimals and decimal representation (arithmetic). Variant: rational vs irrational: which expressions must be rational. Asked before:
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
- **lines-angles**: Lines and angles, parallel lines (geometry). Variant: angles formed by several intersecting lines. Asked before:
  - two angle expressions at a transversal: equal or supplementary; select x (002 s2q13)
  - a ray from the intersection of two lines makes given angles with each line; compare the acute angle between the lines with a value (ray inside or outside) (011 s1q3)
  - two internal angle bisectors of a triangle meet: the angle between them is 90 plus half the third angle, whatever the other two (012 s1q3)
- **quartiles-boxplots**: Quartiles, percentiles and boxplots (data). Variant: reading quartiles and the IQR from a boxplot. Asked before:
  - add a new minimum and maximum to a list; compare the IQRs (002 s2q2)
  - two boxplots on one scale; select statements forced by the five-number summaries (range, IQR, counts relative to the other's median) (011 s2q13)
  - a value's percentile rank before and after a batch of numbers is added: how many of the batch fall below it (012 s2q15)
- **linear-equations**: Linear equations and simultaneous equations (algebra). Variant: a system with no solution or infinitely many. Asked before:
  - **worn** counts of items at two or three prices from a total count and revenue (003 s2q12, 005 s2q10)
  - for which k a 2x2 linear system has no solution (002 s2q15)
  - count integer k for which a 2x2 system has an integer solution (004 s2q9)
  - three item counts, two price lists and totals; greatest possible count of one (006 s2q9)
  - two linear equations in three unknowns; a third combination is determined (007 s2q12)
  - 1/a + 1/b = 1/c with positive values: solve for c and compare it with a (008 s2q4)
  - solve y = (ax + b)/(x - 1) for x: collect the x terms and factor (009 s1q5)
  - sum and difference linked by a multiple: find both, then the larger is their average (010 s2q9)
  - two equations that are multiples of one line: count the positive integer solutions of that line (012 s2q7)
- **abs-value-inequalities**: Absolute-value equations and inequalities (algebra). Variant: a tolerance stated as an absolute-value inequality. Asked before:
  - **worn** sum of two absolute values |x - a| + |x - b| against a bound (001 s2q9, 005 s1q8, 009 s2q2)
  - |x + c| < b gives an interval for x; compare x^2 with a constant (endpoint signs matter) (001 s1q2)
  - forces opposite signs; compare (x + y)^2 with (x - y)^2 (004 s1q4)
  - count integers with |x + a| > k|x - b|; compare with a value (006 s2q2)
  - |x - a| = bx + c: two cases, one rejected because the right side would be negative (007 s1q8)
  - two distances from a shared point on the number line: the third distance is their sum or difference (008 s1q8)
  - which absolute-value identities and inequalities hold for every real x (test a negative) (010 s1q8)
  - two different numbers equidistant from a fixed point: their sum is twice that point (012 s1q2)
- **functions**: Functions, notation, composition and defined operations (algebra). Variant: f(a + b) against f(a) + f(b). Asked before:
  - minimum value of f(f(x)) for a quadratic f (001 s2q11)
  - a function on a finite domain given by a table; the inputs fixed by applying f twice; compare one such input with a value (011 s2q4)
  - odd function with a period: one value fixes the value two units away and forces a zero at half the period (012 s2q1)
- **exponential-growth**: Exponential growth and compound interest (algebra). Variant: comparing two exponential models. Asked before:
  - constant yearly growth with an overall 700% increase; percent over a third of the period (003 s2q5)
  - two decaying amounts with different halving times and a starting ratio; time when they are equal (011 s1q6)
  - the two-year gap between compound and simple interest is the principal times the rate squared: recover the rate, then the simple interest (012 s2q11)
- **word-problems-interest**: Interest, profit, discount and cost problems (algebra). Variant: whole-unit pricing and boundary cases (sold only by the full yard; "or less"). Asked before:
  - lots sold at markup and at a discount off list; cost per unit from total profit (003 s1q6)
  - two deposits starting in different months in one simple-interest account; total interest at year's end (011 s1q9)
  - salary plus a flat commission against commission only above a threshold: the break-even sales (012 s2q9)
- **number-sense-qc**: Number sense: sign, zero, magnitude cases (arithmetic). Variant: non-integer test values that flip the relationship. Asked before:
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
- **solids-volume**: Volume and surface area of solids (geometry). Variant: scaling a dimension: the effect on volume. Asked before:
  - **revisit quant-002:s2q8** (you guessed it): A closed cylindrical tank with radius 3 meters and length 10 meters lies on its side, so that its axis is horizontal. It holds water to a depth of 1.5 meters. What is the volume of the water, in cubic meters? · choices: $15\pi-\dfrac{45\sqrt3}{2}$ / $30\pi-45\sqrt3$ / $30\pi-\dfrac{45\sqrt3}{2}$ / $30\pi$ / $45\pi$ [setup: horizontal cylinder partly filled: circular-segment area times length]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-002:s2q8"`.
  - horizontal cylinder partly filled: circular-segment area times length (002 s2q8)
  - rectangular block painted on all faces but its base, then cut into unit cubes; count cubes with exactly two painted faces (011 s2q15)
  - a cone filled to half its height poured into a cylinder: the water's volume scales with the cube of the depth (012 s2q5)
- **area-perimeter**: Area and perimeter (geometry) [in 1 untaken]. Variant: the effect of scaling a side on the area. Asked before:
  - **worn** uniform border around a rectangle; border area against the outer dimensions or perimeter (004 s2q10, 005 s2q15, 006 s2q10)
  - rectangle from perimeter and diagonal; area via (a+b)^2 - (a^2+b^2) (002 s2q12)
  - rectangle with a fixed diagonal; select possible perimeters (range) (003 s2q14)
  - trade length for width at a fixed perimeter until a square; the area gain (007 s2q15)
  - corner cut from a rectangle: perimeter of the remaining L shape (008 s2q10)
  - perimeter of a composite figure: count only the outside edges (shared sides drop out) (009 s2q10)
  - rectangle cut into four by two cuts; three areas given, find the fourth (integer sides) (010 s2q15)
  - similar rectangles: the perimeter ratio and the larger area give the smaller area (013 s1q9)
- **mean-median-mode**: Mean, median, mode, range (data) [in 1 untaken]. Variant: median of a list with unknowns. Asked before:
  - **worn** add one value so the median equals the mean (004 s1q11, 006 s1q12)
  - five integers with given mean and median; greatest possible least value (002 s2q1)
  - DI: change in the mean per nest when one group is excluded (003 s1q11)
  - DI: combined mean of two groups weighted by counts (005 s1q11)
  - DI: possible median of two combined grouped distributions (007 s1q12)
  - DI: change one category's values, then compare the mean and the median of the new list (008 s1q12)
  - DI: medians of two percent columns with an even count (average the middle two); compare them (009 s1q11)
  - DI: the range of combined groups from the extreme whiskers against one group's range (010 s1q11)
  - DI: overall mean and count give the total; subtract known categories to get the mean of an open-ended category (013 s1q12)
- **integers-properties**: Integer properties, even/odd, divisibility (arithmetic) [in 1 untaken]. Variant: digits and place value of an unknown number. Asked before:
  - **worn** k^2 leaves remainder 1 mod 8; compare k mod 8 with k^3 mod 8 (002 s1q4, 005 s2q1)
  - n with exactly 3 divisors is p^2; compare divisor counts of n^2 and 2n (004 s2q5)
  - k^2 divisible by 72: greatest number that must divide k (006 s2q4)
  - reversing a two-digit number changes it by 9 times the digit difference; count the numbers (007 s2q1)
  - parity of ab + a + b through (a + 1)(b + 1) - 1; count pairs (008 s2q15)
  - count divisors of N divisible by one number but not another (from the prime factorization) (009 s2q15)
  - a sum of an odd number k of consecutive integers is k times the middle one; select which numbers qualify (010 s2q14)
  - two parity conditions on three unknown integers (one leaves open which of two is even); which expression must be odd (013 s2q12)
- **triangles**: Triangles: similar, isosceles, equilateral, inequality (geometry) [in 1 untaken]. Variant: area with an altitude outside the triangle. Asked before:
  - **worn** two sides given and an obtuse (or bounded) angle; the third side's range from c^2 against a^2 + b^2 (005 s2q14, 006 s2q15, 007 s2q2)
  - 13-14-15 triangle: altitude to one side via Heron or two right triangles (001 s2q10)
  - isosceles with sides 4 and 9: the third side must be 9; perimeter vs a value (003 s1q3)
  - isosceles triangle with one 40° angle: two cases; compare the largest angle with twice the smallest (004 s2q1)
  - a line parallel to one side cuts off a similar triangle; compare the trapezoid with the small triangle (areas scale as squares) (008 s2q2)
  - isosceles chain AD = BD = BC with one angle given; exterior angle then base angles; compare an angle with a value (009 s2q4)
  - exterior angle equals the sum of the two remote interior angles; split it by a given difference (010 s2q2)
  - obtuse triangle with three integer sides: the altitude to the shortest side falls outside it; find it from the area (012 s1q7)
  - two sides of a triangle given; perimeter of the midpoint triangle against the value at the triangle-inequality bound (013 s2q5)

wrong on a question touching it (16):
- **data-interpretation-calc**: Data interpretation: percent and ratio from graphs (data). Variant: estimation to pick the closest value. Asked before:
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
- **number-line-abs**: Number line, absolute value of numbers (arithmetic). Variant: ordering expressions of a number located between two marks. Asked before:
  - |x - a| < |x + b|: x is nearer a than -b; compare x with the midpoint (002 s1q1)
  - equally spaced ticks with two fractional labels; locate two unlabeled points and compare their sum with the tick spacing (011 s1q2)
  - opposite signs: the absolute difference equals the sum of the absolute values (012 s1q1)

right but slow (4):
- **graphs-of-functions**: Graphs of functions and parabolas, shifts and reflections (algebra). Variant: a shift, a stretch or a reflection of a graph. Asked before:
  - parabola crossing the x-axis on both sides of the y-axis; compare b with c (002 s2q5)
  - piecewise-linear graph read at points between vertices after the input is reflected and shifted (011 s2q5)
  - a graph symmetric about the y-axis shifted horizontally: compare values at two points equidistant from the new axis (012 s2q3)

covered, no weakness (4):
- **units-conversion**: Units and measurement conversions (arithmetic). Variant: rates with mixed units. Asked before:
  - liters per second to cubic meters over hours (002 s1q5)
  - price per square inch; cost of an area given in square yards, with each linear factor squared inside the chain (011 s1q1)
  - money converted out, part spent abroad, the remainder converted back at a different rate (012 s1q5)

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
