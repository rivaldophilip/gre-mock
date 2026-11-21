# Brief quant-018 (quant, seed 68768)

Untaken tests (their targets are damped, so this test spreads to other items): drill-002, drill-003, drill-004, drill-005, drill-006, drill-007, drill-008, drill-009, drill-010, drill-011, quant-016, quant-017, verbal-017, verbal-018, verbal-019

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

wrong on a question testing it (235):
- **ratio-proportion**: Ratio and proportion (arithmetic). Variant: combining two ratios that share a term (a:b and b:c). Asked before:
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
- **word-problems-interest**: Interest, profit, discount and cost problems (algebra). Variant: tiered pricing or commission. Asked before:
  - lots sold at markup and at a discount off list; cost per unit from total profit (003 s1q6)
  - two deposits starting in different months in one simple-interest account; total interest at year's end (011 s1q9)
  - salary plus a flat commission against commission only above a threshold: the break-even sales (012 s2q9)
  - goods sold only in whole units with a non-whole need, then a fee on orders at or below a threshold: buying one more unit is cheaper (014 s2q9)
  - profit given as a percent of the selling price; the price rises by a percent with the cost fixed; the new profit as a percent of cost (015 s1q6)
- **std-dev-normal**: Standard deviation: spread, SD units, effect of shifting and scaling (data). Variant: values within k standard deviations of the mean. Asked before:
  - **revisit quant-003:s1q12** (you missed it): Assume that at each beach the numbers of eggs per nest are approximately normally distributed. Of the nests at Coral Point and Dune Hollow combined, approximately how many contained more than 130 eggs? · choices: 10 / 50 / 90 / 104 / 120 [setup: DI with a normal assumption: count above mean + 1 SD across two groups]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-003:s1q12"`.
  - **worn** two values added at mean ± 1 SD to a list; compare the new SD with the old (001 s2q2, 004 s2q2, 005 s1q4, 006 s1q4)
  - DI with a normal assumption: count above mean + 1 SD across two groups (003 s1q12)
  - normal distribution: P(above +3σ... of those above +1σ) as a conditional fraction vs a value (007 s1q4)
  - normal: percents above/below two values give the mean and SD; compare two tail percents (008 s1q4)
  - a list transformed by y = -2x + 30: the SD scales by |-2| and the shift does nothing (009 s2q3)
  - two equal-size lists with equal SDs and different means; combined SD vs the common SD (010 s1q4)
  - a list with one low outlier gets a new maximum that sits close to the mean; compare the new SD with the old (013 s1q4)
  - two frequency columns that are mirror images of each other: equal standard deviations, means reflected about the middle score (015 s1q11)
- **inequalities**: Linear and simultaneous inequalities (algebra). Variant: compound inequality: range of x + y or x - y or xy. Asked before:
  - **revisit quant-003:s1q4** (you missed it): $x$ satisfies both $3 - 2x \ge 7$ and $5x + 2 > -18$. · Quantity A: $x^2$ | Quantity B: $-4x$ [setup: two linear inequalities give an interval; compare x^2 with -4x]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-003:s1q4"`.
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
- **quadratics-factoring**: Factoring and quadratic equations (algebra). Variant: the discriminant: number of real solutions. Asked before:
  - x^2 + kx + c with two distinct positive integer roots; possible k (002 s2q14)
  - squares of the sum and of the difference given; find the product (011 s2q10)
  - equation linear in x and sqrt x: substitute, reject the negative root; sum of solutions (013 s2q11)
  - a cubic with no constant term has three distinct nonnegative integer solutions: factor out x (zero is one root), then factor pairs of the constant give the coefficient (015 s2q13)
- **quadratic-inequalities**: Quadratic and other nonlinear inequalities (sign analysis) (algebra) [in 1 untaken]. Variant: sign analysis of a factored product (x - a)(x - b) < 0. Asked before:
  - rational inequality k/x > x - c; multiplying through by x loses the negative branch; compare x with the left root (011 s1q4)
  - x^3 < x with no sign given; compare x^2 with x across the two solution intervals (013 s1q1)
  - a quartic inequality that factors as n^2 times a quadratic; dividing by n^2 silently admits n = 0, which fails the strict inequality; count the integers (016 s1q4)
- **counting-restrictions**: Counting with restrictions and arrangements (data) [in 1 untaken]. Variant: selections with a cap per type (at most 2 from one group). Asked before:
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
- **overlapping-sets**: Overlapping sets, Venn diagrams (data) [in 1 untaken]. Variant: maximum and minimum of the overlap. Asked before:
  - **revisit quant-003:s1q8** (you missed it): Each of the 80 students at a language school studies Spanish, Japanese, both or neither. If 50 of the students study Spanish and 45 study Japanese, which of the following could be the number of students who study exactly one of the two languages? Indicate all such numbers. · choices: 3 / 5 / 30 / 35 / 65 / 67 [setup: two-set problem with a neither bound; range of the number in exactly one]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-003:s1q8"`.
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
- **counting-permutations**: Counting: permutations and combinations (data) [in 1 untaken]. Variant: subset counts and the symmetry C(n, k) = C(n, n - k). Asked before:
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
- **probability-conditional**: Conditional probability and dependent events (data) [in 1 untaken]. Variant: bounds on P(A and B) or P(A or B) from P(A) and P(B). Asked before:
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
- **figures-not-to-scale**: Reasoning from figures not drawn to scale (geometry) [in 1 untaken]. Variant: angles that only look equal. Asked before:
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
- **remainders-units**: Remainders and units digits (arithmetic) [in 1 untaken]. Variant: remainder written as a decimal part (n/d = q.25). Asked before:
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
- **geometry-coordinate**: Geometry in the coordinate plane (geometry) [in 1 untaken]. Variant: a circle in the coordinate plane. Asked before:
  - opposite vertices of a square given; find another vertex (002 s2q11)
  - triangle formed by a point and its images across y = x and across an axis; its area (011 s2q9)
  - a line through a fixed first-quadrant point cuts off a triangle of given area with the axes; the slope from the two intercepts (012 s2q6)
  - circle from its center and one point on it; length of the chord it cuts on an axis (013 s1q6)
  - adjacent vertices of a square on the two axes; find another vertex by turning the side vector 90 degrees (the center method for opposite vertices is the trap) (015 s2q8)
  - convex quadrilateral with one vertex coordinate unknown and the area given; split by a diagonal, the absolute value gives two positions and convexity rejects one (016 s1q7)
- **primes-factors**: Primes, factors, multiples, GCD/LCM (arithmetic) [in 1 untaken]. Variant: GCD / LCM from two products or a word problem. Asked before:
  - x^2 - y^2 = N: count or list integer solutions from same-parity factor pairs (001 s1q4)
  - divisor-count function: d(n^2) vs 3·d(n) for an unknown n (001 s2q5)
  - divisor-count relation d(n^2) = 3·d(n) given; select the n that satisfy it (011 s2q14)
  - a power of a composite dividing a factorial: the squared small prime limits, not the larger prime (012 s2q14)
  - divisors of a perfect square below its square root: pair d with N/d and set the root aside; compare the count with a value (013 s2q2)
  - count the primes in two short ranges stated as integers with exactly two divisors; one range hides composites that look prime (015 s2q4)
  - divisor count of a product of powers of two composite numbers that share a prime (combine the exponents first) (017 s1q9)
- **functions**: Functions, notation, composition and defined operations (algebra) [in 1 untaken]. Variant: a defined operation (x ◊ y = ...) applied twice. Asked before:
  - minimum value of f(f(x)) for a quadratic f (001 s2q11)
  - a function on a finite domain given by a table; the inputs fixed by applying f twice; compare one such input with a value (011 s2q4)
  - odd function with a period: one value fixes the value two units away and forces a zero at half the period (012 s2q1)
  - linear function with a nonzero constant term: compare f(a + b) with f(a) + f(b) (the constant counts twice) (014 s2q1)
  - count the integers in the domain of a quotient of square roots whose denominator subtracts a constant from a root (one hidden excluded point) (015 s2q2)
  - f of a linear expression in x given; the input that gives a stated output (the solved x is not the answer) (017 s2q15)
- **graphs-of-functions**: Graphs of functions and parabolas, shifts and reflections (algebra) [in 1 untaken]. Variant: intersections of two graphs. Asked before:
  - parabola crossing the x-axis on both sides of the y-axis; compare b with c (002 s2q5)
  - piecewise-linear graph read at points between vertices after the input is reflected and shifted (011 s2q5)
  - a graph symmetric about the y-axis shifted horizontally: compare values at two points equidistant from the new axis (012 s2q3)
  - a function's unique maximum point; a reflected, stretched and shifted copy: compare where the copy's extreme value occurs with a value (014 s2q4)
  - a parabola against an absolute-value graph: solve on each piece and reject the roots outside that piece's domain; compare the count with a value (015 s2q3)
  - a graph symmetric about two parallel vertical lines: chaining the reflections links two values that neither reflection links alone; compare them (017 s2q5)
- **sequences-patterns**: Sequences, series and patterns (arithmetic) [in 1 untaken]. Variant: recursive sequence: find a term or a sum. Asked before:
  - recursive a_{n+1} = 1/(1 - a_n) cycles with period 3; sum of 100 terms (002 s2q7)
  - recursive sequence whose step is a partial-fraction term; the nth term by telescoping, with an off-by-one in the term count (011 s2q3)
  - linear recursion doubling minus one: shift by 1 to get powers of 2; first term past a bound (012 s1q9)
  - a recursion with period four; sum of the terms whose index is a multiple of three up to a bound (013 s2q15)
  - a list of squares with alternating signs: pair consecutive terms into differences of squares; an odd number of terms leaves one unpaired (015 s2q15)
  - two arithmetic sequences with different differences and starts; their common terms form an arithmetic sequence with the lcm as difference; count those inside a window that does not start at the first term (016 s2q11)
- **lines-angles**: Lines and angles, parallel lines (geometry) [in 1 untaken]. Variant: parallel lines cut by a transversal. Asked before:
  - two angle expressions at a transversal: equal or supplementary; select x (002 s2q13)
  - a ray from the intersection of two lines makes given angles with each line; compare the acute angle between the lines with a value (ray inside or outside) (011 s1q3)
  - two internal angle bisectors of a triangle meet: the angle between them is 90 plus half the third angle, whatever the other two (012 s1q3)
  - three concurrent lines with three marked angles, one across from an unmarked angle; solve along one line, then the obtuse angle between the other two lines (014 s2q3)
  - five lines with no three concurrent form a star; four point angles given; the fifth from the angle sum through exterior angles of small triangles (015 s2q6)
  - rays around a point with angles in a given ratio; the angle between two non-adjacent rays is the smaller way around (017 s2q12)
- **probability-basic**: Probability: independent events, complement (data) [in 1 untaken]. Variant: independent events across repeated trials. Asked before:
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
- **inscribed-figures**: Inscribed and circumscribed figures, composite shapes (geometry) [in 1 untaken]. Variant: a regular hexagon in a circle. Asked before:
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
- **number-sense-qc**: Number sense: sign, zero, magnitude cases (arithmetic) [in 1 untaken]. Variant: non-integer test values that flip the relationship. Asked before:
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
- **circles**: Circles: arcs, sectors, chords, tangents (geometry) [in 1 untaken]. Variant: tangent lines and the radius. Asked before:
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
  - one group a percent larger than another, a different percent of each group taken; compare the two parts (the base offsets the rate) (015 s1q2)
  - a share rises by some percentage points, then falls by a percent of itself; with the starting share bounded, compare the final share with the starting one (017 s2q4)

wrong on a question touching it (23):
- **pythagorean-special**: Pythagorean theorem and special right triangles (geometry). Variant: altitude to the hypotenuse: similar right triangles. Asked before:
  - **revisit quant-002:s2q6** (you guessed it): In a right triangle, the altitude drawn to the hypotenuse divides the hypotenuse into segments of lengths 4 and 9. What is the perimeter of the triangle? · choices: $19$ / $25$ / $13+\sqrt{13}$ / $13+5\sqrt{13}$ / $13+6\sqrt{13}$ [setup: altitude to the hypotenuse splits it into given segments; perimeter]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-002:s2q6"`.
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
- **data-tables-graphs**: Reading tables, bar, line, circle graphs, scatterplots and time plots (data) [in 1 untaken]. Variant: a time plot: the largest change between periods. Asked before:
  - DI: count of students at or above a threshold from a frequency chart (002 s1q10)
  - stacked bars of two groups over intervals; pick the interval with the greatest ratio of segment heights (011 s1q10)
  - DI: circle graph of a subgroup only: central angle of one category on the reduced base (013 s1q11)
  - scatterplot of the same units measured in two years; count the points above the line y = x (016 s2q10)
- **number-line-abs**: Number line, absolute value of numbers (arithmetic) [in 1 untaken]. Variant: ordering expressions of a number located between two marks. Asked before:
  - |x - a| < |x + b|: x is nearer a than -b; compare x with the midpoint (002 s1q1)
  - equally spaced ticks with two fractional labels; locate two unlabeled points and compare their sum with the tick spacing (011 s1q2)
  - opposite signs: the absolute difference equals the sum of the absolute values (012 s1q1)
  - x between two negative marks; compare x^2 with x + 1 (the crossover lies inside the interval) (014 s1q2)
  - two unknowns at given distances from the same point; their distance from each other is the difference or the sum of those distances; compare with a value (016 s1q1)

covered, no weakness (5):
- **frequency-distributions**: Frequency distributions and histograms (data) [in 1 untaken]. Variant: median from a frequency table. Asked before:
  - DI: change in the median after moving one category's values (002 s1q12)
  - one group's segments of a stacked interval graph; estimated mean from interval midpoints (011 s1q11)
  - DI: cumulative frequency table; least value at which the cumulative share reaches a given percent (a percentile) (013 s1q10)
  - DI: median of one group from a frequency table where the two middle values fall in adjacent rows (016 s1q11)

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
