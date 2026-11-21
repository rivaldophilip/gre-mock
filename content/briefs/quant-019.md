# Brief quant-019 (quant, seed 52881)

Untaken tests (their targets are damped, so this test spreads to other items): drill-002, drill-003, drill-004, drill-005, drill-006, drill-007, drill-008, drill-009, drill-010, drill-011, quant-016, quant-017, quant-018, verbal-017, verbal-018, verbal-019

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

Type focus (need >= 0.4, put the weakest items here): mc_multi, mc, numeric, qc

## Concept slots (one primary concept per question, any order; a DI set shares an area)

Write each question as its variant (the form of the concept earlier mocks used least), with a setup that is **not** in the slot's history below: new numbers, names or a story around a listed setup are the same item. **Worn** setups (2+ tests) are banned outright. Record `setup` and `variant` on each question. A slot marked **revisit** is the one exception: a sibling of an item you missed, with the change named (at most 4 per test).

wrong on a question testing it (225):
- **ratio-proportion**: Ratio and proportion (arithmetic) [in 1 untaken]. Variant: part-to-part vs part-to-whole confusion. Asked before:
  - **revisit quant-004:s1q5** (you missed it): Seed blend X contains clover seed and grass seed in the ratio $1:3$ by weight, and seed blend Y contains them in the ratio $3:2$ by weight. How many kilograms of blend Y must be mixed with 12 kilograms of blend X so that the mixture contains equal weights of clover seed and grass seed? · choices: 6 / 12 / 18 / 24 / 30 [setup: mix two blends with different part ratios to reach a 1:1 mixture]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-004:s1q5"`.
  - **worn** ratio before and after adding or removing items of one or both kinds; a total (002 s1q9, 005 s1q5, 006 s2q6)
  - chained ratios a:b and b:c with bounds; possible totals (003 s2q13)
  - mix two blends with different part ratios to reach a 1:1 mixture (004 s1q5)
  - three-part budget ratio; one part grows to a given fraction of the total; new total (007 s1q5)
  - chained ratios a:b and b:c with a difference given; one count (008 s1q5)
  - a map scale applies to lengths; the actual area scales by its square (009 s1q9)
  - workers and time are inversely proportional; scale the time (010 s1q9)
  - inverse proportion: a percent increase in one variable; the percent decrease in the other (011 s1q5)
  - a model's surface-area ratio gives the linear scale; capacity scales by its cube (014 s1q6)
  - a part-to-whole fraction before and a part-to-part ratio after adding members of one kind; compare the unchanged kind's count with a value (015 s2q1)
- **mean-median-mode**: Mean, median, mode, range (data) [in 1 untaken]. Variant: a mean after adding or removing values. Asked before:
  - **revisit quant-003:s1q11** (you missed it): If the nests at Gull Bay were excluded, the mean number of eggs per nest for the other three beaches combined would be approximately how much less than the mean number of eggs per nest for all four beaches combined? · choices: 1.8 / 2.7 / 3.6 / 4.6 / 15.5 [setup: DI: change in the mean per nest when one group is excluded]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-003:s1q11"`.
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
- **word-problems-rate**: Rate, work, distance and mixture problems (algebra) [in 1 untaken]. Variant: mixing two solutions to a target concentration. Asked before:
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
- **coordinate-geometry**: Coordinate plane, lines, slope, distance (algebra) [in 1 untaken]. Variant: distance and midpoint. Asked before:
  - line through a point perpendicular to a given line; its x-intercept (002 s2q9)
  - general-form line with sign conditions on products of coefficients; select what it must pass through (011 s1q8)
  - line through a point meets the x-axis at a given distance; it is perpendicular to a line with an unknown coefficient; find the coefficient (013 s2q6)
  - a line through two given points; the sum of its two intercepts (015 s2q10)
  - a V-shaped region bounded above by a horizontal line; count the lattice points row by row, odd rows rounding the half-width down (016 s2q12)
- **word-problems-interest**: Interest, profit, discount and cost problems (algebra) [in 1 untaken]. Variant: profit as a percent of cost vs of price. Asked before:
  - lots sold at markup and at a discount off list; cost per unit from total profit (003 s1q6)
  - two deposits starting in different months in one simple-interest account; total interest at year's end (011 s1q9)
  - salary plus a flat commission against commission only above a threshold: the break-even sales (012 s2q9)
  - goods sold only in whole units with a non-whole need, then a fee on orders at or below a threshold: buying one more unit is cheaper (014 s2q9)
  - profit given as a percent of the selling price; the price rises by a percent with the cost fixed; the new profit as a percent of cost (015 s1q6)
- **exponential-growth**: Exponential growth and compound interest (algebra) [in 1 untaken]. Variant: growth by a factor over a stated number of periods. Asked before:
  - **revisit quant-003:s2q5** (you missed it): Over a 12-year period, the number of subscribers to a newsletter increased by 700 percent, and the percent increase was the same in each year of the period. · Quantity A: The percent increase in the number of subscribers over the first 4 years of the period | Quantity B: 100% [setup: constant yearly growth with an overall 700% increase; percent over a third of the period]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-003:s2q5"`.
  - constant yearly growth with an overall 700% increase; percent over a third of the period (003 s2q5)
  - two decaying amounts with different halving times and a starting ratio; time when they are equal (011 s1q6)
  - the two-year gap between compound and simple interest is the principal times the rate squared: recover the rate, then the simple interest (012 s2q11)
  - two exponential models whose different-looking bases and exponents rewrite to the same yearly factor; a constant ratio (014 s2q12)
  - two exponential models each known at the same two times; the factor for half the gap is the square root; extrapolate both back and compare (016 s2q9)
- **min-max-bounding**: Bounding: minimum/maximum values under constraints (algebra) [in 1 untaken]. Variant: the largest share or longest side under an ordering or triangle constraint. Asked before:
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
- **area-perimeter**: Area and perimeter (geometry) [in 1 untaken]. Variant: perimeter fixed, area varies (or the reverse). Asked before:
  - **revisit quant-003:s2q14** (you missed it): A rectangle has a diagonal of length 10. Which of the following could be the perimeter of the rectangle? Indicate all such values. · choices: 22 / 24 / 26 / 28 / 29 / 30 [setup: rectangle with a fixed diagonal; select possible perimeters (range)]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-003:s2q14"`.
  - **worn** uniform border around a rectangle; border area against the outer dimensions or perimeter (004 s2q10, 005 s2q15, 006 s2q10)
  - rectangle from perimeter and diagonal; area via (a+b)^2 - (a^2+b^2) (002 s2q12)
  - rectangle with a fixed diagonal; select possible perimeters (range) (003 s2q14)
  - trade length for width at a fixed perimeter until a square; the area gain (007 s2q15)
  - corner cut from a rectangle: perimeter of the remaining L shape (008 s2q10)
  - perimeter of a composite figure: count only the outside edges (shared sides drop out) (009 s2q10)
  - rectangle cut into four by two cuts; three areas given, find the fourth (integer sides) (010 s2q15)
  - similar rectangles: the perimeter ratio and the larger area give the smaller area (013 s1q9)
  - one side scaled by a percent; the other side's percent change that gives a target area increase (factors multiply, not add) (014 s2q10)
  - one pair of sides of known length scaled by a percent at a fixed perimeter, the other pair unknown; the percent change in area is one expression in the unknown side, bounded by an unreachable limit; select the possible percent changes (016 s2q14)
- **std-dev-normal**: Standard deviation: spread, SD units, effect of shifting and scaling (data) [in 1 untaken]. Variant: the least or greatest possible standard deviation under a constraint. Asked before:
  - **worn** two values added at mean ± 1 SD to a list; compare the new SD with the old (001 s2q2, 004 s2q2, 005 s1q4, 006 s1q4)
  - DI with a normal assumption: count above mean + 1 SD across two groups (003 s1q12)
  - normal distribution: P(above +3σ... of those above +1σ) as a conditional fraction vs a value (007 s1q4)
  - normal: percents above/below two values give the mean and SD; compare two tail percents (008 s1q4)
  - a list transformed by y = -2x + 30: the SD scales by |-2| and the shift does nothing (009 s2q3)
  - two equal-size lists with equal SDs and different means; combined SD vs the common SD (010 s1q4)
  - a list with one low outlier gets a new maximum that sits close to the mean; compare the new SD with the old (013 s1q4)
  - two frequency columns that are mirror images of each other: equal standard deviations, means reflected about the middle score (015 s1q11)
- **weighted-average**: Weighted average and changing averages (data) [in 1 untaken]. Variant: combining the means of two groups. Asked before:
  - two group means and one group's size; find the other group's size from the overall mean (001 s1q9)
  - add members of one kind outside a category to dilute the category's share to a subgroup's share; count from stacked bars (011 s1q12)
  - two group means and which group is larger; combined mean vs the midpoint of the means (013 s2q4)
  - a frequency table gives a group's mean; a few new members with one equal score join; the rise in the mean (015 s1q10)
  - a table of group sizes and means; which whole group joining a fixed group raises its mean the most (gap times share, not the largest gap) (017 s1q10)
- **inequalities**: Linear and simultaneous inequalities (algebra) [in 1 untaken]. Variant: multiplying or dividing by a negative. Asked before:
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
  - a < b < c with no signs given; select the sum, difference and product inequalities that must hold (015 s2q14)
- **estimation-sigfig**: Estimation, rounding, scientific notation (arithmetic) [in 1 untaken]. Variant: order of magnitude comparison in QC. Asked before:
  - estimate a product and quotient of numbers in scientific notation (003 s2q10)
  - sum of many amounts each rounded to the nearest unit; bound the true total against the strict upper limit (011 s2q1)
  - a difference of squares of two decimals near consecutive whole numbers: rounding each term misleads, factoring gives the product (012 s2q10)
  - square root of a number in scientific notation with an odd power of ten; compare with a power of ten (013 s1q2)
  - concentration times volume over a per-dose amount, with a unit conversion; round each factor and pick the nearest of closely spaced choices (015 s1q5)
  - a difference of two numbers in scientific notation with different powers, divided by a negative power of ten (017 s2q10)
- **abs-value-inequalities**: Absolute-value equations and inequalities (algebra) [in 1 untaken]. Variant: |x| against x in QC. Asked before:
  - **worn** sum of two absolute values |x - a| + |x - b| against a bound (001 s2q9, 005 s1q8, 009 s2q2)
  - |x + c| < b gives an interval for x; compare x^2 with a constant (endpoint signs matter) (001 s1q2)
  - forces opposite signs; compare (x + y)^2 with (x - y)^2 (004 s1q4)
  - count integers with |x + a| > k|x - b|; compare with a value (006 s2q2)
  - |x - a| = bx + c: two cases, one rejected because the right side would be negative (007 s1q8)
  - two distances from a shared point on the number line: the third distance is their sum or difference (008 s1q8)
  - which absolute-value identities and inequalities hold for every real x (test a negative) (010 s1q8)
  - two different numbers equidistant from a fixed point: their sum is twice that point (012 s1q2)
  - a side length within a tolerance; the area's greatest deviation from nominal against the linear estimate (the square term breaks the tie) (014 s2q2)
  - one unknown equidistant from two fixed numbers written as equal absolute values; compare it with a value (015 s1q1)
  - x times |x| equals a linear expression: a quadratic in each sign case, one root in the wrong case and no real root in the other; compare the sum of solutions with the sum of the quadratic's roots (017 s1q3)
- **quadratics-factoring**: Factoring and quadratic equations (algebra) [in 1 untaken]. Variant: dividing by a variable that may be zero. Asked before:
  - x^2 + kx + c with two distinct positive integer roots; possible k (002 s2q14)
  - squares of the sum and of the difference given; find the product (011 s2q10)
  - equation linear in x and sqrt x: substitute, reject the negative root; sum of solutions (013 s2q11)
  - a cubic with no constant term has three distinct nonnegative integer solutions: factor out x (zero is one root), then factor pairs of the constant give the coefficient (015 s2q13)
- **quartiles-boxplots**: Quartiles, percentiles and boxplots (data) [in 1 untaken]. Variant: comparing two boxplots. Asked before:
  - add a new minimum and maximum to a list; compare the IQRs (002 s2q2)
  - two boxplots on one scale; select statements forced by the five-number summaries (range, IQR, counts relative to the other's median) (011 s2q13)
  - a value's percentile rank before and after a batch of numbers is added: how many of the batch fall below it (012 s2q15)
  - read Q1 and Q3 off a boxplot; the outlier fence above Q3 and the least whole value past it (014 s2q15)
  - two values above every value of an even-count list are added; both quartiles shift to averages of neighbours; compare the IQRs (016 s2q3)
- **lines-angles**: Lines and angles, parallel lines (geometry) [in 2 untaken]. Variant: angle bisectors. Asked before:
  - two angle expressions at a transversal: equal or supplementary; select x (002 s2q13)
  - a ray from the intersection of two lines makes given angles with each line; compare the acute angle between the lines with a value (ray inside or outside) (011 s1q3)
  - two internal angle bisectors of a triangle meet: the angle between them is 90 plus half the third angle, whatever the other two (012 s1q3)
  - three concurrent lines with three marked angles, one across from an unmarked angle; solve along one line, then the obtuse angle between the other two lines (014 s2q3)
  - five lines with no three concurrent form a star; four point angles given; the fifth from the angle sum through exterior angles of small triangles (015 s2q6)
  - rays around a point with angles in a given ratio; the angle between two non-adjacent rays is the smaller way around (017 s2q12)
- **algebraic-expressions**: Algebraic expressions, identities, simplification (algebra) [in 2 untaken]. Variant: expressions with nested parentheses and signs. Asked before:
  - **worn** value of a symmetric expression (a^3 ± b^3, |a| + |b|, a^2 + b^2) from a ± b, ab or a^2 + b^2 (002 s1q8, 003 s2q4, 006 s2q5)
  - which expressions equal a rational expression on its whole domain (removable points) (004 s2q13)
  - which expressions equal (a - b)^2 (a + b)^2 identically (005 s2q13)
  - difference of two rational expressions that both simplify; compare with a constant (the excluded values do not matter) (007 s2q4)
  - remove nested brackets with sign changes; the expression collapses to one term (008 s2q12)
  - factor a difference of squares twice; select every polynomial factor, including composite ones (009 s2q13)
  - an identity in completed-square form: match constant terms to find k (010 s2q4)
  - x + 1/x given; a non-symmetric polynomial in x reduces to a constant by repeatedly replacing x^2 with a linear expression (013 s2q8)
  - x^2 + 1/x^2 given; recover x + 1/x by squaring back, with both signs possible (016 s1q8)
  - which regroupings equal a doubly nested difference of four letters (017 s2q13)
- **quadratic-inequalities**: Quadratic and other nonlinear inequalities (sign analysis) (algebra) [in 2 untaken]. Variant: integer count in a solution set such as x^2 < 10. Asked before:
  - rational inequality k/x > x - c; multiplying through by x loses the negative branch; compare x with the left root (011 s1q4)
  - x^3 < x with no sign given; compare x^2 with x across the two solution intervals (013 s1q1)
  - a quartic inequality that factors as n^2 times a quadratic; dividing by n^2 silently admits n = 0, which fails the strict inequality; count the integers (016 s1q4)
- **linear-equations**: Linear equations and simultaneous equations (algebra) [in 2 untaken]. Variant: three variables, two equations: what can be determined. Asked before:
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
  - a 2x2 system with no solution fixes the constant (one root makes the lines coincide); the axis intercepts of the two parallel lines form a quadrilateral whose area comes from its perpendicular diagonals (016 s2q7)
  - a product formula with a coefficient times a square root of two variables: solve for one variable under the root (square both sides, the coefficient included) (017 s1q5)
- **integers-properties**: Integer properties, even/odd, divisibility (arithmetic) [in 2 untaken]. Variant: even/odd parity of sums and products of unknown integers. Asked before:
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
- **triangles**: Triangles: similar, isosceles, equilateral, inequality (geometry) [in 2 untaken]. Variant: angle chasing through isosceles triangles in a figure. Asked before:
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
- **remainders-units**: Remainders and units digits (arithmetic) [in 2 untaken]. Variant: two remainder conditions at once: smallest such number. Asked before:
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
- **figures-not-to-scale**: Reasoning from figures not drawn to scale (geometry) [in 2 untaken]. Variant: a point that looks on a line or circle but is not stated to be. Asked before:
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

wrong on a question touching it (25):
- **data-interpretation-calc**: Data interpretation: percent and ratio from graphs (data) [in 1 untaken]. Variant: a value implied but not shown (derived total). Asked before:
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
  - DI: percent less between two groups' counts, with the larger count as the base (016 s1q10)
- **pythagorean-special**: Pythagorean theorem and special right triangles (geometry) [in 1 untaken]. Variant: Pythagorean triples and their multiples. Asked before:
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

right but slow (5):
- **random-variables**: Random variables, probability distributions, expected value (data) [in 1 untaken]. Variant: a uniform distribution over an interval. Asked before:
  - probability table where the median is not the middle listed value; mean minus median (011 s2q12)
  - DI: expected days on site per employee, weighting by department share and the non-remote share, remote counted as 0 (012 s1q11)
  - triangular density on an interval: find the peak height, then the area of a tail; compare with a value (013 s2q3)
  - a length uniform on an interval; probabilities about its square found by converting back to the length (the square is not uniform) (016 s2q5)

covered, no weakness (6):
- **units-conversion**: Units and measurement conversions (arithmetic) [in 1 untaken]. Variant: area or volume unit conversion (squares and cubes). Asked before:
  - liters per second to cubic meters over hours (002 s1q5)
  - price per square inch; cost of an area given in square yards, with each linear factor squared inside the chain (011 s1q1)
  - money converted out, part spent abroad, the remainder converted back at a different rate (012 s1q5)
  - speed, fuel economy and fuel price; the fuel cost for a time given in minutes (014 s1q5)
  - rain depth over a land area gives a water volume, then a mass, through area, length and mass unit changes (016 s1q5)

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
