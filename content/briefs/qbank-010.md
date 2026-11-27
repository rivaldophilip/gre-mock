# Bank batch qbank-010 (quant, quant, seed 19461)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-010.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; a unit's questions share its passage or DI set, whose id is the unit's id; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-008:s2q8 (you missed it; no sibling in the bank yet); revisit quant-008:s2q15 (you missed it; no sibling in the bank yet); revisit quant-009:s2q4 (you missed it; no sibling in the bank yet); revisit quant-009:s1q9 (you missed it; no sibling in the bank yet); revisit quant-009:s1q2 (you missed it; no sibling in the bank yet); revisit quant-009:s1q3 (you missed it; no sibling in the bank yet); revisit quant-009:s2q5 (you missed it; no sibling in the bank yet); revisit quant-009:s1q4 (you guessed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | mc | 3 | random-variables | expected value from a probability table |
| s1q2 | qc | 5 | random-variables | mean and median of a discrete distribution table |
| s1q3 | mc | 4 | counting-restrictions | at least one of a type in a selection |
| s1q4 | mc | 3 | counting-restrictions | digits with restrictions (no repeats, even, > 500) |
| s1q5 | qc | 3 | graphs-of-functions | reading the value of f at a point from a graph |
| s1q6 | mc_multi | 5 | graphs-of-functions | a shift, a stretch or a reflection of a graph |
| s1q7 | mc_multi | 5 | lines-angles | parallel lines cut by a transversal |
| s1q8 | mc | 3 | lines-angles | angles formed by several intersecting lines |
| s1q9 | mc | 5 | lines-angles | angles around a point or on a straight line |
| s1q10 | mc | 4 | lines-angles | angles formed by several intersecting lines |
| s1q11 | numeric | 4 | lines-angles | angle bisectors |
| s1q12 | qc | 5 | percent | finding the original value after a change |
| s1q13 | qc | 4 | percent | percent of a percent across subgroups |
| s1q14 | mc | 3 | area-perimeter | the effect of scaling a side on the area |
| s1q15 | mc | 4 | area-perimeter | perimeter fixed, area varies (or the reverse) |
| s1q16 | mc | 5 | fractions-decimals | rational vs irrational: which expressions must be rational |
| s1q17 | mc_multi | 5 | fractions-decimals | complex (nested) fractions |
| s1q18 | mc_multi | 4 | fractions-decimals | terminating vs repeating decimal from the denominator's prime factors |
| s1q19 | mc | 3 | functions | domain restrictions (square roots, denominators) |
| s1q20 | numeric | 5 | functions | domain restrictions (square roots, denominators) |
| s1q21 | mc | 5 | inscribed-figures | a square inscribed in a circle, or a circle in a square (revisit) |
| s1q22 | qc | 4 | integers-properties | even/odd parity of sums and products of unknown integers (revisit) |
| s1q23 | qc | 5 | triangles | angle chasing through isosceles triangles in a figure (revisit) |
| s1q24 | numeric | 3 | ratio-proportion | scale maps and models (revisit) |
| s1q25 | di (d1) | 3 | random-variables | a uniform distribution over an interval |
| s1q26 | di (d1) | 4 | random-variables | mean and median of a discrete distribution table |
| s1q27 | di (d1) | 5 | random-variables | expected value from a probability table |

Units: d1 di3

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **random-variables**
  - probability table where the median is not the middle listed value; mean minus median
  - DI: expected days on site per employee, weighting by department share and the non-remote share, remote counted as 0
  - triangular density on an interval: find the peak height, then the area of a tail; compare with a value
  - a length uniform on an interval; probabilities about its square found by converting back to the length (the square is not uniform)
  - a continuous uniform variable and a discrete uniform integer on the same endpoints; compare the probabilities of the same at-most event (length share against inclusive count)
  - a density whose graph is one sloped segment with both end heights given; the probability of the lower half is a trapezoid area (average height times width), not the length share
  - a prize table with two unknown positive probabilities whose sum is fixed; the expected value is linear in one of them, so it fills an open interval; select the attainable values (not the endpoints, not the mean of the prize values)
  - a table counts groups by size, but the random pick is a member, not a group; weight each size by its members to build the distribution, then find its mean and median (the per-group mean and median are the trap)
  - a step density at two heights, one twice the other, on two adjacent intervals; total area 1 fixes the heights, and a probability across the step adds two rectangles (not the length share)
  - a waiting time uniform on an interval; a conditional probability given that the event has not happened yet is a length share of the remaining interval, compared with an unconditional length share
- **counting-restrictions**
  - row seating: two people not adjacent and neither at an end
  - count integers in a range divisible by one number or another but not a third (inclusion-exclusion)
  - lane assignment: two runners adjacent, a third not at either end
  - committee with at least one of a group and two people who cannot serve together
  - order items so that no two of one group are consecutive and the first isn't from it (gaps)
  - count four-digit numbers whose digits have a given product
  - row with no two children adjacent and one child next to a given adult
  - schedule with one item before another but not adjacent, plus a slot restriction
  - identical items of three kinds with a cap per kind (stars and bars minus the overflows)
  - crew with exactly k from one group and a one-way condition (A only if B); remove the forbidden pairs
  - row seating as a probability: two people non-adjacent with neither at an end, against a fraction
  - choose a set with at least one of each of three kinds: total minus sets missing one kind, plus the single-kind sets counted twice
  - … 9 more (the novelty judge sees every one)
- **graphs-of-functions**
  - parabola crossing the x-axis on both sides of the y-axis; compare b with c
  - piecewise-linear graph read at points between vertices after the input is reflected and shifted
  - a graph symmetric about the y-axis shifted horizontally: compare values at two points equidistant from the new axis
  - a function's unique maximum point; a reflected, stretched and shifted copy: compare where the copy's extreme value occurs with a value
  - a parabola against an absolute-value graph: solve on each piece and reject the roots outside that piece's domain; compare the count with a value
  - a graph symmetric about two parallel vertical lines: chaining the reflections links two values that neither reflection links alone; compare them
  - a line through the origin against a V-shaped graph whose vertex is off the origin; the slopes for which they meet twice (between the flat line through the vertex and the far arm's slope)
  - monic parabola with the gap between its x-intercepts and its y-intercept given; two mirror-image parabolas fit, so the vertex's side of the y-axis is undetermined
  - a horizontal compression, a shift and a vertical stretch of a graph scale the area between it and the x-axis by the product of the two stretch factors (the shift changes nothing); compare with a value
  - a piecewise-linear graph read twice: find f(x) between vertices, then read f at that output; select the inputs where the composition is negative (not where f itself is negative)
  - a circle against a parabola: substitute to get a quadratic in y, keep the roots with x^2 = y + c nonnegative, and count one point (not two) where x = 0
  - a graph unchanged by a half-turn about the origin with its formula given only for positive x; a value at a negative input fixes the unknown coefficient through f(-x) = -f(x); then evaluate at a positive input
  - … 5 more (the novelty judge sees every one)
- **lines-angles**
  - two angle expressions at a transversal: equal or supplementary; select x
  - a ray from the intersection of two lines makes given angles with each line; compare the acute angle between the lines with a value (ray inside or outside)
  - two internal angle bisectors of a triangle meet: the angle between them is 90 plus half the third angle, whatever the other two
  - three concurrent lines with three marked angles, one across from an unmarked angle; solve along one line, then the obtuse angle between the other two lines
  - five lines with no three concurrent form a star; four point angles given; the fifth from the angle sum through exterior angles of small triangles
  - rays around a point with angles in a given ratio; the angle between two non-adjacent rays is the smaller way around
  - a bent path between two parallel lines with the bend angle labeled as the sum of the two angles at the lines; the label is redundant, so the angle is undetermined
  - a bisected angle with a second ray inside one half; the ray's offset from the bisector and the ratio of the two angles it makes with the sides; the whole angle
  - the angle between an angle bisector and the altitude from the same vertex is given with one other angle; two signs give two candidates and the acute condition rejects one
  - clock hands at a given time: the hour hand's drift past its hour mark; the smaller angle between the hands
- **percent**
  - **worn** price up p% then down q% (or back to a reference); find the missing percent or value (3×)
  - dilute a solution: add water to lower the concentration to a target percent
  - DI: which categories' share of the total fell between two years
  - list price above cost, two successive discounts, final price; markup percent
  - a rate falls from p% to q%: percent decrease against the percentage-point drop
  - a price after one discount is given; find the original (divide by the remaining share)
  - the whole and a subgroup grow by different percents; percent change in the subgroup's share
  - a percent of a subgroup that is itself a percent of the whole (part of a part)
  - two quantities rise by different percents but by the same absolute amount; compare one new value with a multiple of the other's old value
  - one group a percent larger than another, a different percent of each group taken; compare the two parts (the base offsets the rate)
  - a share rises by some percentage points, then falls by a percent of itself; with the starting share bounded, compare the final share with the starting one
  - one group a percent larger than the other with no counts given; the smaller group's share of the whole against a value just above it
  - … 8 more (the novelty judge sees every one)
- **area-perimeter**
  - **worn** uniform border around a rectangle; border area against the outer dimensions or perimeter (3×)
  - rectangle from perimeter and diagonal; area via (a+b)^2 - (a^2+b^2)
  - rectangle with a fixed diagonal; select possible perimeters (range)
  - trade length for width at a fixed perimeter until a square; the area gain
  - corner cut from a rectangle: perimeter of the remaining L shape
  - perimeter of a composite figure: count only the outside edges (shared sides drop out)
  - rectangle cut into four by two cuts; three areas given, find the fourth (integer sides)
  - similar rectangles: the perimeter ratio and the larger area give the smaller area
  - one side scaled by a percent; the other side's percent change that gives a target area increase (factors multiply, not add)
  - one pair of sides of known length scaled by a percent at a fixed perimeter, the other pair unknown; the percent change in area is one expression in the unknown side, bounded by an unreachable limit; select the possible percent changes
  - a rectangle with a fixed perimeter; select the possible diagonal lengths (the square gives the least, a flat rectangle the unreachable greatest)
  - a rectilinear floor plan with one corner cut off and a semicircular bay; the missing height and the bay's diameter come from the labeled pieces; area = rectangle minus triangle plus half-disk
  - … 2 more (the novelty judge sees every one)
- **fractions-decimals**
  - sum of two repeating decimals vs 1
  - compare (10^8 + 1)/(10^9 + 1) with (10^9 + 1)/(10^10 + 1)
  - digits after the decimal point of k/(2^a 5^b) for odd k
  - tank goes from one fraction full to another after a draw; amount to fill
  - telescoping product of (1 - 1/k^2)
  - which fraction lies between two close fractions
  - repeating decimal x; compare 1/x with a value
  - an expression with surds whose irrational parts cancel; compare it with a whole number
  - which fraction terminates: reduce first, then check the denominator's primes
  - a nonzero rational combined with an irrational: closure under sum, product and quotient against squares and reciprocal sums that can cancel
  - sum and product of two numbers rational; select the symmetric expressions forced rational, with conjugate counterexamples for the rest
  - a fraction between 0 and 1 with unknown parts; which transformed fractions must exceed it (the same amount added to or taken from both parts, square, root, a mixed form)
  - … 4 more (the novelty judge sees every one)
- **functions**
  - minimum value of f(f(x)) for a quadratic f
  - a function on a finite domain given by a table; the inputs fixed by applying f twice; compare one such input with a value
  - odd function with a period: one value fixes the value two units away and forces a zero at half the period
  - linear function with a nonzero constant term: compare f(a + b) with f(a) + f(b) (the constant counts twice)
  - count the integers in the domain of a quotient of square roots whose denominator subtracts a constant from a root (one hidden excluded point)
  - f of a linear expression in x given; the input that gives a stated output (the solved x is not the answer)
  - a defined operation nested with an unknown in the inner pair; the outer value gives a square, and only the negative root's value is offered
  - finite-domain table with one output repeated three times; the sum of two inputs sharing that output against a value
  - f given on a shifted input; completing the square gives an even closed form; a zero of f has two signs, and f one step above against one step below the zero flips with the sign
  - a pure square function: f(a + b) exceeds f(a) + f(b) by the cross term only; from the excess find the product
  - a function repeating every two units, given by a square on one period; one solution per period counted over a window, and the negative root of the square is not a solution
  - a quadratic and a linear function composed in both orders; set the two compositions equal and sum the irrational roots of the resulting quadratic
  - … 1 more (the novelty judge sees every one)

Revisit s1q21 of quant-008:s2q8 (you missed it): Square $ABCD$ has sides of length 10. A circle passes through vertices $A$ and $B$ and is tangent to side $CD$. What is the radius of the circle? · choices: $5$ / $6$ / $\dfrac{25}{4}$ / $5\sqrt{2}$ / $\dfrac{15}{2}$ [setup: circle through two vertices of a square and tangent to the opposite side; radius]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-008:s2q8"`.

Revisit s1q22 of quant-008:s2q15 (you missed it): For how many ordered pairs of integers $(a, b)$ with $1 \le a \le 10$ and $1 \le b \le 10$ is $ab + a + b$ odd? [setup: parity of ab + a + b through (a + 1)(b + 1) - 1; count pairs]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-008:s2q15"`.

Revisit s1q23 of quant-009:s2q4 (you missed it): In triangle $ABC$, $D$ is a point on side $AC$, and the segments $AD$, $BD$ and $BC$ all have the same length. Angle $BAC$ measures $36^\circ$. · Quantity A: The measure of angle $ABC$, in degrees | Quantity B: $72$ [setup: isosceles chain AD = BD = BC with one angle given; exterior angle then base angles; compare an angle with a value]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-009:s2q4"`.

Revisit s1q24 of quant-009:s1q9 (you missed it): On a map, 2.5 centimeters represent 15 kilometers. A rectangular park appears on the map as a rectangle 3 centimeters by 2 centimeters. What is the actual area of the park, in square kilometers? [setup: a map scale applies to lengths; the actual area scales by its square]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-009:s1q9"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
