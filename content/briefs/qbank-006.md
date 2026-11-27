# Bank batch qbank-006 (quant, quant, seed 95645)

Items for the question bank, served one by one in assembled quizzes (docs/BANK.md). File: content/bank/quant/qbank-006.json, the drill shape: every item in section 1, ids s1q1, s1q2, … in slot order; rules in docs/QUIZ-AUTHORING.md, Bank batches.

Gaps this batch closes: revisit quant-007:s1q7 (you guessed it; no sibling in the bank yet); revisit quant-007:s2q2 (you missed it; no sibling in the bank yet); revisit quant-007:s2q14 (you missed it; no sibling in the bank yet); revisit quant-007:s2q12 (you missed it; no sibling in the bank yet); revisit quant-008:s1q7 (you missed it; no sibling in the bank yet); revisit quant-008:s2q10 (you missed it; no sibling in the bank yet); revisit quant-008:s2q1 (you missed it; no sibling in the bank yet); revisit quant-008:s2q2 (you missed it; no sibling in the bank yet)

## Slots

| qid | type | level | concept | variant |
|---|---|---|---|---|
| s1q1 | numeric | 3 | polygons-quadrilaterals | interior angle sum of an n-gon, and regular polygons |
| s1q2 | mc | 4 | polygons-quadrilaterals | parallelogram, rhombus or trapezoid properties |
| s1q3 | qc | 5 | polygons-quadrilaterals | a regular hexagon split into triangles |
| s1q4 | mc | 5 | polygons-quadrilaterals | parallelogram, rhombus or trapezoid properties |
| s1q5 | numeric | 3 | functions | f(a + b) against f(a) + f(b) |
| s1q6 | mc | 5 | functions | a function property such as f(-x) = -f(x) or f(x + 1) = f(x) |
| s1q7 | mc | 4 | functions | composition f(g(x)), or solving f(x) = g(x) |
| s1q8 | qc | 4 | functions | a defined operation (x ◊ y = ...) applied twice |
| s1q9 | mc | 5 | linear-equations | a system with no solution or infinitely many |
| s1q10 | mc_multi | 4 | linear-equations | a literal equation: solve for one letter in terms of the others |
| s1q11 | qc | 4 | linear-equations | a system with no solution or infinitely many |
| s1q12 | mc_multi | 5 | linear-equations | solving for an expression (x + y) instead of each variable |
| s1q13 | numeric | 4 | quartiles-boxplots | the percentile rank of a value in a list |
| s1q14 | qc | 5 | quartiles-boxplots | quartiles of a list with an even count |
| s1q15 | mc_multi | 5 | quartiles-boxplots | reading quartiles and the IQR from a boxplot |
| s1q16 | qc | 5 | quartiles-boxplots | comparing two boxplots |
| s1q17 | mc | 3 | word-problems-interest | simple interest over a partial year |
| s1q18 | mc_multi | 5 | word-problems-interest | tiered pricing or commission |
| s1q19 | numeric | 4 | word-problems-interest | simple interest over a partial year |
| s1q20 | qc | 5 | word-problems-interest | tiered pricing or commission |
| s1q21 | mc_multi | 4 | exponential-growth | compound interest against simple interest |
| s1q22 | mc | 4 | exponential-growth | growth by a factor over a stated number of periods |
| s1q23 | numeric | 5 | exponential-growth | comparing two exponential models |
| s1q24 | qc | 5 | exponential-growth | doubling or halving time |
| s1q25 | mc | 5 | counting-restrictions | two people must sit together, or apart (revisit) |
| s1q26 | mc | 5 | triangles | larger side opposite the larger angle; obtuse vs acute from c^2 against a^2 + b^2 (revisit) |
| s1q27 | mc_multi | 5 | min-max-bounding | worst-case count (pigeonhole) (revisit) |
| s1q28 | mc | 4 | linear-equations | three variables, two equations: what can be determined (revisit) |

## Asked before (per concept; never reuse a setup, worn ones are banned)

- **polygons-quadrilaterals**
  - rhombus with side and one diagonal; area against a value
  - interior angle k times the exterior angle; number of diagonals
  - count the diagonals of a regular polygon, then remove those through the center
  - the triangle on two adjacent vertices and an opposite vertex of a regular hexagon: its fraction of the hexagon's area
  - trapezoid diagonals cut it into four triangles; two triangle areas give the trapezoid's area
  - midpoints of a regular hexagon's sides form a smaller hexagon; the cut-off corner triangles with a 120-degree angle give the side ratio; compare areas
  - one more side adds a given number of diagonals; find the number of diagonals of the smaller polygon
  - interior angle k times the exterior angle fixes n for two regular polygons of equal perimeter; side lengths in inverse ratio of n
  - the diagonal count is a stated multiple of the side count; find n, then report the diagonals from one vertex (a neighbouring quantity)
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
- **linear-equations**
  - **worn** counts of items at two or three prices from a total count and revenue (2×)
  - for which k a 2x2 linear system has no solution
  - count integer k for which a 2x2 system has an integer solution
  - three item counts, two price lists and totals; greatest possible count of one
  - two linear equations in three unknowns; a third combination is determined
  - 1/a + 1/b = 1/c with positive values: solve for c and compare it with a
  - solve y = (ax + b)/(x - 1) for x: collect the x terms and factor
  - sum and difference linked by a multiple: find both, then the larger is their average
  - two equations that are multiples of one line: count the positive integer solutions of that line
  - a price after a percent discount plus a flat fee, solved for the discount rate (move the fee before dividing; the fee's sign flips)
  - a 2x2 system with no solution fixes the constant (one root makes the lines coincide); the axis intercepts of the two parallel lines form a quadrilateral whose area comes from its perpendicular diagonals
  - a product formula with a coefficient times a square root of two variables: solve for one variable under the root (square both sides, the coefficient included)
  - … 2 more (the novelty judge sees every one)
- **quartiles-boxplots**
  - add a new minimum and maximum to a list; compare the IQRs
  - two boxplots on one scale; select statements forced by the five-number summaries (range, IQR, counts relative to the other's median)
  - a value's percentile rank before and after a batch of numbers is added: how many of the batch fall below it
  - read Q1 and Q3 off a boxplot; the outlier fence above Q3 and the least whole value past it
  - two values above every value of an even-count list are added; both quartiles shift to averages of neighbours; compare the IQRs
  - two box plots of groups of very different sizes, one wholly above a value and the other mostly below it; compare the counts above the value (a quarter of the large group outnumbers all of the small one)
  - read Q1 and Q3 off a box plot; every value is scaled by a percent and then shifted by a constant; the new IQR (the shift cancels) against a value
- **word-problems-interest**
  - lots sold at markup and at a discount off list; cost per unit from total profit
  - two deposits starting in different months in one simple-interest account; total interest at year's end
  - salary plus a flat commission against commission only above a threshold: the break-even sales
  - goods sold only in whole units with a non-whole need, then a fee on orders at or below a threshold: buying one more unit is cheaper
  - profit given as a percent of the selling price; the price rises by a percent with the cost fixed; the new profit as a percent of cost
  - a fixed fee plus a two-tier per-unit rate; the total bill given; the total usage
  - a price and a profit stated as a percent of cost give the cost; re-price so the same percent is of the selling price; the change in price
  - a dollar markup over cost followed by a percent discount on the marked price; the profit left over gives the cost (the discount comes off cost plus markup)
  - a repayment of principal plus simple interest over a fraction of a year; count the months, scale the annual rate, divide by one plus the term rate
  - two bookings with a fixed total length, each charged a flat fee up to a threshold and per started unit above it; the possible totals, including the split that lands exactly on the threshold and on a whole unit
  - a percent markup on cost, then a sale discount stated both in dollars and as a percent of the regular price; the dollar amount gives the regular price, which is divided by one plus the markup to get the cost; the profit at the sale price
  - two sales at the same price, a gain stated as a percent of the price and a loss stated as the same percent of the cost; find each cost on its own base; the net result is a loss, not break-even
  - … 1 more (the novelty judge sees every one)
- **exponential-growth**
  - constant yearly growth with an overall 700% increase; percent over a third of the period
  - two decaying amounts with different halving times and a starting ratio; time when they are equal
  - the two-year gap between compound and simple interest is the principal times the rate squared: recover the rate, then the simple interest
  - two exponential models whose different-looking bases and exponents rewrite to the same yearly factor; a constant ratio
  - two exponential models each known at the same two times; the factor for half the gap is the square root; extrapolate both back and compare
  - constant percent growth with the overall percent increase over the period; the value at the halfway point against the average of the starting and ending values (geometric against arithmetic mean)
  - two deposits made one doubling period apart in an account with a fixed doubling time; the time from opening until the balance reaches a target (combine at the second deposit, then count doublings)

Revisit s1q25 of quant-007:s1q7 (you guessed it): Four adults and three children, including a girl named Mia and her father, are to stand in a row of 7 places for a photograph. No two children may stand next to each other, and Mia must stand next to her father. How many different arrangements of the 7 people are possible? · choices: 288 / 432 / 576 / 720 / 1,440 [setup: row with no two children adjacent and one child next to a given adult]. Write a sibling, not a copy: run it backwards: give what the earlier item asked for, and ask for one of its givens. Set `"revisits": "quant-007:s1q7"`.

Revisit s1q26 of quant-007:s2q2 (you missed it): In triangle $PQR$, $PQ = 7$, $QR = 4$, and $PQ$ is the longest side. One of the angles of triangle $PQR$ measures more than $90^\circ$. · Quantity A: $PR$ | Quantity B: $6$ [setup: two sides given and an obtuse (or bounded) angle; the third side's range from c^2 against a^2 + b^2]. Write a sibling, not a copy: change the format (quantitative comparison, multiple choice or numeric entry) and the question asked. Set `"revisits": "quant-007:s2q2"`.

Revisit s1q27 of quant-007:s2q14 (you missed it): A drawer holds 10 red socks, 8 blue socks and 6 green socks. Socks are drawn one at a time without looking. For which of the following goals is the number shown the least number of draws that guarantees the goal? Indicate all such goals. · choices: Two socks of the same color: 4 / Three red socks: 17 / Two green socks: 19 / One blue sock: 17 / Two blue socks: 17 [setup: worst-case draws to guarantee a color condition (pigeonhole); select the true counts]. Write a sibling, not a copy: combine the same insight with a second concept. Set `"revisits": "quant-007:s2q14"`.

Revisit s1q28 of quant-007:s2q12 (you missed it): At a café, 3 muffins, 5 scones and 7 croissants cost a total of 41 dollars, and 1 muffin, 3 scones and 5 croissants cost a total of 25 dollars. What is the total cost, in dollars, of 1 muffin, 2 scones and 3 croissants? · choices: 8.00 / 13.50 / 16.50 / 33.00 / It cannot be determined from the information given. [setup: two linear equations in three unknowns; a third combination is determined]. Write a sibling, not a copy: keep the insight but move the trap: a different wrong path should tempt. Set `"revisits": "quant-007:s2q12"`.

Each item: one primary concept (its slot's), `setup` (one abstract line) and `variant` (the slot's). A python key check: content/verify/<id>.py (content/verify/keys.py).

How to write it: docs/QUIZ-AUTHORING.md (Bank batches) and docs/HARD-PATTERNS.md.
