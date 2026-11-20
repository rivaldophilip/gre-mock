# Brief quant-017 (quant, seed 41318)

Untaken tests (their targets are damped, so this test spreads to other items): drill-002, drill-003, drill-004, drill-005, drill-006, drill-007, drill-008, drill-009, drill-010, drill-011, quant-015, quant-016, verbal-017, verbal-018, verbal-019

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

wrong on a question testing it (243):
- **counting-permutations**: Counting: permutations and combinations (data) [in 1 untaken]. Variant: arrangements of letters with repeated items. Asked before:
  - **revisit quant-003:s2q7** (you missed it): A gardener will plant 6 shrubs in a row along a fence: 2 identical boxwoods, 2 identical hollies and 2 identical junipers. How many different orders of the shrubs have no two shrubs of the same kind next to each other? · choices: 6 / 24 / 30 / 36 / 54 [setup: arrange pairs of identical items with no two alike adjacent]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-003:s2q7"`.
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
  - sum of a quadratic in x and a quadratic in y over integer ranges: one vertex outside its range, the other between integers (015 s2q11)
- **probability-basic**: Probability: independent events, complement (data) [in 1 untaken]. Variant: probability as a ratio of combinations (choose k of n). Asked before:
  - **worn** compare two binomial probabilities with p = 1/2 (at least / more heads than tails) (001 s2q1, 006 s2q3)
  - three dice: P(product divisible by 4) via complement cases (004 s2q7)
  - two independent draws from different-sized boxes; P(first > second) vs a value (005 s2q5)
  - three independent choices among 4 options: P(exactly one option unused) (007 s2q8)
  - P(A) and P(A or B) for independent events; compare P(B) with a value (008 s2q5)
  - random point in a square: the probability of landing in the inscribed disk (pi/4) against a fraction (009 s2q5)
  - P(at least one success) with vs without replacement (010 s2q3)
  - random draw of several items from matched pairs; probability of exactly one complete pair (combinations ratio) (013 s2q7)
  - two independent uniform arrival times in one interval with a fixed stay: the meeting region is a band in a square; compare with a fraction (015 s2q5)
- **weighted-average**: Weighted average and changing averages (data) [in 1 untaken]. Variant: the change in the mean when a group joins. Asked before:
  - two group means and one group's size; find the other group's size from the overall mean (001 s1q9)
  - add members of one kind outside a category to dilute the category's share to a subgroup's share; count from stacked bars (011 s1q12)
  - two group means and which group is larger; combined mean vs the midpoint of the means (013 s2q4)
  - a frequency table gives a group's mean; a few new members with one equal score join; the rise in the mean (015 s1q10)
- **algebraic-expressions**: Algebraic expressions, identities, simplification (algebra) [in 1 untaken]. Variant: expressions with nested parentheses and signs. Asked before:
  - **worn** value of a symmetric expression (a^3 ± b^3, |a| + |b|, a^2 + b^2) from a ± b, ab or a^2 + b^2 (002 s1q8, 003 s2q4, 006 s2q5)
  - which expressions equal a rational expression on its whole domain (removable points) (004 s2q13)
  - which expressions equal (a - b)^2 (a + b)^2 identically (005 s2q13)
  - difference of two rational expressions that both simplify; compare with a constant (the excluded values do not matter) (007 s2q4)
  - remove nested brackets with sign changes; the expression collapses to one term (008 s2q12)
  - factor a difference of squares twice; select every polynomial factor, including composite ones (009 s2q13)
  - an identity in completed-square form: match constant terms to find k (010 s2q4)
  - x + 1/x given; a non-symmetric polynomial in x reduces to a constant by repeatedly replacing x^2 with a linear expression (013 s2q8)
- **normal-distribution**: Normal distribution: 68-95-99.7 rule, z-scores, percentiles (data) [in 1 untaken]. Variant: symmetry: P(X > m + a) = P(X < m - a). Asked before:
  - variance given rather than SD; percentile at two SDs above the mean against the 95 from the empirical rule (011 s2q2)
  - an interval from one to three standard deviations above the mean: one tail band only, against a value (012 s2q4)
  - normal with known mean and one upper-tail probability; lower-tail probability at a nearer cutoff vs that probability (013 s2q1)
- **counting-restrictions**: Counting with restrictions and arrangements (data) [in 1 untaken]. Variant: two people must sit together, or apart. Asked before:
  - **revisit quant-003:s1q7** (you missed it): Six runners, among them Ana, Ben and Chloe, are assigned to lanes 1 through 6 of a track, one runner per lane. Ben and Chloe must be in adjacent lanes, and Ana may not be in lane 1 or lane 6. How many different lane assignments are possible? · choices: 96 / 120 / 144 / 192 / 240 [setup: lane assignment: two runners adjacent, a third not at either end]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-003:s1q7"`.
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
- **primes-factors**: Primes, factors, multiples, GCD/LCM (arithmetic) [in 1 untaken]. Variant: number of positive divisors from the prime factorization. Asked before:
  - x^2 - y^2 = N: count or list integer solutions from same-parity factor pairs (001 s1q4)
  - divisor-count function: d(n^2) vs 3·d(n) for an unknown n (001 s2q5)
  - divisor-count relation d(n^2) = 3·d(n) given; select the n that satisfy it (011 s2q14)
  - a power of a composite dividing a factorial: the squared small prime limits, not the larger prime (012 s2q14)
  - divisors of a perfect square below its square root: pair d with N/d and set the root aside; compare the count with a value (013 s2q2)
  - count the primes in two short ranges stated as integers with exactly two divisors; one range hides composites that look prime (015 s2q4)
- **percent**: Percent, percent change, successive percent (arithmetic) [in 1 untaken]. Variant: percent change vs percentage-point change. Asked before:
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
- **word-problems-rate**: Rate, work, distance and mixture problems (algebra) [in 1 untaken]. Variant: rate with a unit change mid-problem. Asked before:
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
- **polygons-quadrilaterals**: Polygons and quadrilaterals (geometry) [in 1 untaken]. Variant: the number of diagonals of a polygon. Asked before:
  - rhombus with side and one diagonal; area against a value (002 s2q3)
  - interior angle k times the exterior angle; number of diagonals (003 s2q15)
  - count the diagonals of a regular polygon, then remove those through the center (011 s2q11)
  - the triangle on two adjacent vertices and an opposite vertex of a regular hexagon: its fraction of the hexagon's area (012 s2q12)
  - trapezoid diagonals cut it into four triangles; two triangle areas give the trapezoid's area (013 s2q9)
- **exponents-roots**: Exponents and radicals (arithmetic) [in 1 untaken]. Variant: negative and fractional exponents. Asked before:
  - **worn** (b^{n+k} ± b^n) over a similar sum of powers: factor out the common power (002 s1q2, 005 s1q2)
  - **worn** sqrt(3·9^n) against a power of 3: rewrite as powers of 3 (003 s2q1, 004 s1q2)
  - sqrt(a+2) - sqrt(a) vs sqrt(a) - sqrt(a-2) (conjugates) (006 s2q1)
  - 0 < x < 1: compare two negative fractional powers of x (the more negative exponent gives the larger value) (007 s1q2)
  - 5th root of 5 vs cube root of 3 (raise both to the 15th) (008 s2q1)
  - a negative fractional power is given; raise it to another power by multiplying exponents (009 s2q1)
  - sqrt(a + 2sqrt b) - sqrt(a - 2sqrt b) denested; compare with a root (010 s1q2)
  - sum of reciprocals of consecutive root sums telescopes after rationalizing; select n making it an integer (013 s2q14)
- **overlapping-sets**: Overlapping sets, Venn diagrams (data) [in 1 untaken]. Variant: overlap given as percents of different bases. Asked before:
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
- **triangles**: Triangles: similar, isosceles, equilateral, inequality (geometry) [in 1 untaken]. Variant: a midsegment: parallel to the third side and half as long. Asked before:
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
- **lines-angles**: Lines and angles, parallel lines (geometry) [in 1 untaken]. Variant: angles around a point or on a straight line. Asked before:
  - two angle expressions at a transversal: equal or supplementary; select x (002 s2q13)
  - a ray from the intersection of two lines makes given angles with each line; compare the acute angle between the lines with a value (ray inside or outside) (011 s1q3)
  - two internal angle bisectors of a triangle meet: the angle between them is 90 plus half the third angle, whatever the other two (012 s1q3)
  - three concurrent lines with three marked angles, one across from an unmarked angle; solve along one line, then the obtuse angle between the other two lines (014 s2q3)
  - five lines with no three concurrent form a star; four point angles given; the fifth from the angle sum through exterior angles of small triangles (015 s2q6)
- **abs-value-inequalities**: Absolute-value equations and inequalities (algebra) [in 1 untaken]. Variant: an absolute-value equation with two cases, one extraneous. Asked before:
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
- **word-problems-age-sum**: Algebraic translation word problems (algebra) [in 1 untaken]. Variant: coins or tickets of two denominations. Asked before:
  - three people's shares related by more-than / twice / percent of the total (003 s1q9)
  - 'when one was as old as the other is now' statements in both directions; the constant age gap (011 s2q6)
  - the value of two coin types and the value if their counts were swapped; the total count from adding the two equations (012 s1q6)
  - sum of an even-length run of consecutive integers given; the greatest from the half-integer average (014 s1q9)
- **remainders-units**: Remainders and units digits (arithmetic) [in 1 untaken]. Variant: remainder of a sum or product from the remainders of its parts. Asked before:
  - **revisit quant-003:s1q2** (you missed it): When the positive integer $k$ is divided by 6, the remainder is 5. · Quantity A: The remainder when $k^{100}$ is divided by 8 | Quantity B: The remainder when $k^{50}$ is divided by 3 [setup: k ≡ 5 mod 6; remainders of high powers of k mod 8 and mod 3]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-003:s1q2"`.
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
- **solids-volume**: Volume and surface area of solids (geometry) [in 1 untaken]. Variant: a diagonal cross-section of a box. Asked before:
  - horizontal cylinder partly filled: circular-segment area times length (002 s2q8)
  - rectangular block painted on all faces but its base, then cut into unit cubes; count cubes with exactly two painted faces (011 s2q15)
  - a cone filled to half its height poured into a cylinder: the water's volume scales with the cube of the depth (012 s2q5)
  - horizontal cylinder more than half full, the empty segment's central angle given: whole cross section minus the empty segment, times the length (014 s2q11)
- **functions**: Functions, notation, composition and defined operations (algebra) [in 1 untaken]. Variant: f given on a transformed input, such as f((x + 3)/2). Asked before:
  - minimum value of f(f(x)) for a quadratic f (001 s2q11)
  - a function on a finite domain given by a table; the inputs fixed by applying f twice; compare one such input with a value (011 s2q4)
  - odd function with a period: one value fixes the value two units away and forces a zero at half the period (012 s2q1)
  - linear function with a nonzero constant term: compare f(a + b) with f(a) + f(b) (the constant counts twice) (014 s2q1)
  - count the integers in the domain of a quotient of square roots whose denominator subtracts a constant from a root (one hidden excluded point) (015 s2q2)
- **linear-equations**: Linear equations and simultaneous equations (algebra) [in 1 untaken]. Variant: a literal equation: solve for one letter in terms of the others. Asked before:
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
- **integers-properties**: Integer properties, even/odd, divisibility (arithmetic) [in 1 untaken]. Variant: divisibility of an expression such as n(n+1)(n+2) for every integer n. Asked before:
  - **worn** k^2 leaves remainder 1 mod 8; compare k mod 8 with k^3 mod 8 (002 s1q4, 005 s2q1)
  - n with exactly 3 divisors is p^2; compare divisor counts of n^2 and 2n (004 s2q5)
  - k^2 divisible by 72: greatest number that must divide k (006 s2q4)
  - reversing a two-digit number changes it by 9 times the digit difference; count the numbers (007 s2q1)
  - parity of ab + a + b through (a + 1)(b + 1) - 1; count pairs (008 s2q15)
  - count divisors of N divisible by one number but not another (from the prime factorization) (009 s2q15)
  - a sum of an odd number k of consecutive integers is k times the middle one; select which numbers qualify (010 s2q14)
  - two parity conditions on three unknown integers (one leaves open which of two is even); which expression must be odd (013 s2q12)
  - a digit condition makes a three-digit number a multiple of 11; compare the remainder with the units digit, which can be zero (014 s2q5)
- **circles**: Circles: arcs, sectors, chords, tangents (geometry) [in 1 untaken]. Variant: arc length and sector area from the central angle. Asked before:
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
- **estimation-sigfig**: Estimation, rounding, scientific notation (arithmetic) [in 1 untaken]. Variant: scientific notation arithmetic with large powers of 10. Asked before:
  - estimate a product and quotient of numbers in scientific notation (003 s2q10)
  - sum of many amounts each rounded to the nearest unit; bound the true total against the strict upper limit (011 s2q1)
  - a difference of squares of two decimals near consecutive whole numbers: rounding each term misleads, factoring gives the product (012 s2q10)
  - square root of a number in scientific notation with an odd power of ten; compare with a power of ten (013 s1q2)
  - concentration times volume over a per-dose amount, with a unit conversion; round each factor and pick the nearest of closely spaced choices (015 s1q5)
- **inscribed-figures**: Inscribed and circumscribed figures, composite shapes (geometry) [in 1 untaken]. Variant: a rectangle inscribed in a circle or semicircle (diameter as diagonal). Asked before:
  - **revisit quant-003:s2q8** (you missed it): Square $S_1$ has two vertices on the diameter of a semicircle of radius $r$ and its other two vertices on the arc of the semicircle. Square $S_2$ has all four vertices on a circle of radius $r$. The area of $S_1$ is what fraction of the area of $S_2$? · choices: $\dfrac14$ / $\dfrac13$ / $\dfrac25$ / $\dfrac12$ / $\dfrac45$ [setup: square inscribed in a semicircle with one side on the diameter]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-003:s2q8"`.
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
- **fractions-decimals**: Fractions, decimals and decimal representation (arithmetic) [in 1 untaken]. Variant: the k-th digit after the decimal point of a repeating decimal. Asked before:
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

right but slow (6):
- **graphs-of-functions**: Graphs of functions and parabolas, shifts and reflections (algebra) [in 1 untaken]. Variant: symmetry about an axis, the origin or y = x. Asked before:
  - parabola crossing the x-axis on both sides of the y-axis; compare b with c (002 s2q5)
  - piecewise-linear graph read at points between vertices after the input is reflected and shifted (011 s2q5)
  - a graph symmetric about the y-axis shifted horizontally: compare values at two points equidistant from the new axis (012 s2q3)
  - a function's unique maximum point; a reflected, stretched and shifted copy: compare where the copy's extreme value occurs with a value (014 s2q4)
  - a parabola against an absolute-value graph: solve on each piece and reject the roots outside that piece's domain; compare the count with a value (015 s2q3)

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
