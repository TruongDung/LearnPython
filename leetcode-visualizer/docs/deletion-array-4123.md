# 4123 · Minimum Cost to Delete Array

The drawing follows the existing executed interval-DP source. A deletion removes
at least two adjacent items in the current array and charges its two endpoints;
interior items contribute no extra cost. Negative costs are retained.

During execution, endpoint, inside and tail regions have separate colors and
symbols. Cost cards appear only after the corresponding statement has run.
The `full` and `free` states remain visible; complete tables are optional details.
The existing external source pane and forward/backward line controls are used.

At the final frame, `deletion4123Plan` backtracks the completed `full` / `free`
tables, matching their recurrence and retaining original indices. It displays
one optimal sequence with each before/after array, endpoint charge and running
total. It does not predict a plan from incomplete tables or modify snapshots.
Different tied plans may give the same minimum cost.

The renderer supports Vietnamese and US English, light/dark themes, and narrow
screens. Wide arrays scroll inside the drawing. The source remains an O(n³),
O(n²) teaching model limited to 18 values, not a solution for the problem's
full 100,000-element constraint.

Validation: `node --test tests/deletion-4123.test.js tests/math-replays.test.js`.
The dedicated tests verify 1,244 signed arrays, including repeated values and
18-item cases, legal adjacency after concatenation, endpoint-only charges,
independent exhaustive optima for small arrays, and reversible source snapshots.
