# Bank batch qbank-002 (quant, quant, seed 66377)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-002.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-006:s1q3 (you missed it; no sibling in the bank yet); revisit quant-006:s1q8 (you missed it; no sibling in the bank yet); revisit quant-006:s1q7 (you missed it; no sibling in the bank yet); revisit quant-006:s1q11 (you missed it; no sibling in the bank yet); revisit quant-006:s1q12 (you missed it; no sibling in the bank yet); revisit quant-006:s2q11 (you missed it; no sibling in the bank yet); revisit quant-006:s2q3 (you missed it; no sibling in the bank yet); revisit quant-006:s2q4 (you missed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | mc | 5 | pythagorean-special | a right triangle from a word problem or coordinates (distance) |
| s1q2 | qc | 4 | pythagorean-special | 45-45-90 triangle (square diagonal) |
| s1q3 | mc | 5 | pythagorean-special | Pythagorean theorem used twice (a ladder, a path, a shared leg) |
| s1q4 | qc | 4 | pythagorean-special | space diagonal of a rectangular box |
| s1q5 | mc_multi | 5 | figures-not-to-scale | a point looks like a midpoint but is not stated as one |
| s1q6 | mc | 4 | figures-not-to-scale | regions that look equal in area |
| s1q7 | numeric | 5 | figures-not-to-scale | lines that look parallel or perpendicular but are not stated to be |
| s1q8 | qc | 4 | figures-not-to-scale | a point that looks on a line or circle but is not stated to be |
| s1q9 | mc_multi | 4 | mean-median-mode | the mean against the median of a skewed list |
| s1q10 | mc | 5 | mean-median-mode | median of two lists combined |
| s1q11 | numeric | 4 | mean-median-mode | median of a list with unknowns |
| s1q12 | qc | 5 | mean-median-mode | mode and range of a combined list |
| s1q13 | mc_multi | 5 | word-problems-rate | mixing two solutions to a target concentration |
| s1q14 | mc | 4 | word-problems-rate | average speed over two legs |
| s1q15 | numeric | 5 | word-problems-rate | rate with a unit change mid-problem |
| s1q16 | qc | 4 | word-problems-rate | pipes filling and draining at once |
| s1q17 | mc_multi | 5 | normal-distribution | the 68-95-99.7 rule for a probability |
| s1q18 | mc | 4 | normal-distribution | symmetry: P(X > m + a) = P(X < m - a) |
| s1q19 | numeric | 5 | normal-distribution | a percentile from a z-score |
| s1q20 | qc | 4 | normal-distribution | the 68-95-99.7 rule for a probability |
| s1q21 | qc | 4 | figures-not-to-scale | an angle or length that can vary: answer D (revisit) |
| s1q22 | mc_multi | 4 | inequalities | compound inequality: range of x + y or x - y or xy (revisit) |
| s1q23 | mc | 5 | counting-restrictions | digits with restrictions (no repeats, even, > 500) (revisit) |
| s1q24 | mc | 4 | probability-conditional | conditional probability from a two-way table (revisit) |

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **pythagorean-special**
  - **worn** oblique triangle with 45° and 30° angles split by an altitude into two special right triangles; area or a side (2×)
  - altitude to the hypotenuse splits it into given segments; perimeter
  - 30-60-90 right triangle with the altitude to the hypotenuse given; hypotenuse
  - quadrilateral split by a diagonal into a 45-45-90 and a 30-60-90 triangle; a side or the area
  - box with a square base and a given height; the space diagonal gives the base area
  - a perpendicular splits a triangle into pieces whose leg ratios reveal 45-45-90 and 30-60-90 triangles; add the angles at the vertex (backwards)
  - sliding ladder: two right triangles with the same hypotenuse (7-24-25, then 15-20-25)
  - a square whose diagonal exceeds its side by a given length: solve s sqrt2 = s + 1
  - walk with legs along compass directions; straight-line distance from the net legs
  - regular hexagon with a given side; the triangle on alternate vertices, its side from a 30-60-90 half of a 120-degree isosceles triangle; its area
  - altitude to the hypotenuse and one hypotenuse segment given; the other segment from the geometric mean, then the area with the altitude as height
  - a right triangle with integer sides and one given leg; select the possible hypotenuses (factor the difference of squares into same-parity pairs: primitive and scaled triples)
  - … 2 more (the novelty judge sees every one)
- **figures-not-to-scale**
  - isosceles triangle, point on the base with one segment given; compare the other segment (D)
  - rhombus with side and diagonal given: area vs a value (fixed)
  - median AD with BD = DC and a 3-4-5 right triangle forced; compare AC with a value
  - AD = BD = DC forces a right angle; compare the sum of two sides with sqrt(2) times the third
  - two sides and the area given (the included angle acute or obtuse); compare the third side with a value
  - points on a line in unknown order with given distances and one betweenness fact; compare a distance with a value
  - kite given only by side lengths: the angles between unequal sides are equal (SSS); no figure
  - triangles sharing a height: split the area by a base ratio and then by a midpoint; compare two pieces
  - three side lengths, no figure: identify which side each angle faces; the larger side has the larger opposite angle
  - isosceles triangle, point on the base with one segment given; which statement must be true when the figure suggests the midpoint
  - quadrilateral with both pairs of opposite sides equal and one right angle marked: forced rectangle; compare the diagonal not through the marked angle's triangle with a value
  - a point at given distances from three vertices looks like the foot of an altitude; two right angles put it on the line through two vertices but not between them; compare that side with a value
  - … 5 more (the novelty judge sees every one)
- **mean-median-mode**
  - **worn** add one value so the median equals the mean (2×)
  - five integers with given mean and median; greatest possible least value
  - DI: change in the mean per nest when one group is excluded
  - DI: combined mean of two groups weighted by counts
  - DI: possible median of two combined grouped distributions
  - DI: change one category's values, then compare the mean and the median of the new list
  - DI: medians of two percent columns with an even count (average the middle two); compare them
  - DI: the range of combined groups from the extreme whiskers against one group's range
  - DI: overall mean and count give the total; subtract known categories to get the mean of an open-ended category
  - DI: least number of added top values that moves the median of a frequency table to a target (odd against even count)
  - two lists combined, one unknown; the unique-mode condition breaks a tie and forces the unknown, while the range condition is already met across both lists (a one-list reading of it is the trap)
  - DI: the overall total from counts times means; add a new group of equal values until the overall mean reaches a target; the new group's size
  - … 2 more (the novelty judge sees every one)
- **word-problems-rate**
  - **worn** out and back at two speeds; average speed for the round trip (2×)
  - two fill pipes and a drain together; time to fill
  - second traveller leaves later and faster on the same route; when it leads by a distance
  - one crew starts alone, the other joins; finish at a set time; solo time
  - upstream and downstream legs with a current; time difference
  - two legs with speeds in different units (km/h and m/s); total time
  - combined rate known and one machine slower by a fixed time: the rate equation becomes a quadratic
  - two swimmers going back and forth in a pool; time of the second meeting
  - drain part of a solution and replace it with the pure substance to reach a target concentration; amount drained
  - inlet and drain open together for a stretch, then the drain closes; total time to fill
  - a job measured in one unit while the rate switches to another unit partway; the time split from the total time, then the amount in the second unit
  - two solutions mixed to a target concentration, then a stated amount of water dilutes it to a second concentration; the dilution fixes the mixture's size, then the mixing equation gives one part
  - … 3 more (the novelty judge sees every one)
- **normal-distribution**
  - variance given rather than SD; percentile at two SDs above the mean against the 95 from the empirical rule
  - an interval from one to three standard deviations above the mean: one tail band only, against a value
  - normal with known mean and one upper-tail probability; lower-tail probability at a nearer cutoff vs that probability
  - two normal populations with different means and standard deviations; the cutoff farther in raw units is nearer in standard deviations; compare upper-tail percents
  - normal distribution with a known mean and one upper-tail percent; the percent in the band symmetric about the mean against a value (the two tails are equal)
  - two symmetric tail percents fix the mean and the standard deviation; the percent beyond a farther cutoff against a value
  - match the standard-deviation distance of a value in one normal distribution to find the equally ranked value in another; compare that value with the original

Revisit s1q21 of quant-006:s1q3 (you missed it): In triangle $PQR$, $PQ = 6$, $QR = 8$, and the area of the triangle is 20. (The figure is not drawn to scale.) · Quantity A: $PR$ | Quantity B: 10 [setup: two sides and the area given (the included angle acute or obtuse); compare the third side with a value]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-006:s1q3"`.

Revisit s1q22 of quant-006:s1q8 (you missed it): The number $x$ satisfies $-2 \le 3 - 5x < 18$. Which of the following could be the value of $x^2$? Indicate all such values. · choices: $-1$ / $0$ / $1$ / $4$ / $8.5$ / $9$ [setup: compound linear inequality gives an x interval; select possible x^2]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-006:s1q8"`.

Revisit s1q23 of quant-006:s1q7 (you missed it): How many four-digit positive integers have digits whose product is 24? · choices: $36$ / $48$ / $52$ / $60$ / $64$ [setup: count four-digit numbers whose digits have a given product]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-006:s1q7"`.

Revisit s1q24 of quant-006:s1q11 (you missed it): In 2023, exactly 60 students were enrolled in both French and Mandarin, and no other student was enrolled in more than one of the three courses. One of the students enrolled in at least one of the three courses in 2023 is to be chosen at random. Given that the student chosen is not enrolled in Spanish, what is the probability that the student is enrolled in both French and Mandarin? · choices: $\dfrac{1}{23}$ / $\dfrac{1}{12}$ / $\dfrac{1}{11}$ / $\dfrac{2}{15}$ / $\dfrac{2}{9}$ [setup: DI: conditional probability with a given overlap between categories]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-006:s1q11"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
