# 4123 · Minimum Cost to Delete Array

The executable source is the user-supplied `minCost` implementation, including
`dravolqeni` and the simultaneous tuple assignment. It takes O(n) time and
O(1) auxiliary space, excluding visualization snapshots and endpoint paths.

The two outer endpoints must be charged. Every operation charges two endpoints,
so an even number of interior elements must also be selected. `even` / `odd`
store the minimum cost for an even / odd number of selected interior endpoints.
Skipping an item preserves parity; selecting x switches parity and adds x.

The picture shows both old states and the crossed transitions. The first RHS
line reveals only the new-even candidate, the second reveals new-odd, and the
tuple-assignment frame commits both together. Both RHS expressions use the old
values. The loop frame never reads the stale x from the previous iteration.

`deletion-4123-replay.js` attaches endpoint paths to the executed cost snapshots.
A tie chooses the first min argument (skip), and both new paths read the old
paths. Final pictures pair selected interior endpoints, delete those intervals,
then delete the remaining outer segment. Original indices preserve identity
for duplicate values. No final plan appears before execution finishes.

The external source pane and forward/backward controls remain the line debugger.
Pictures support Vietnamese / US English, light / dark themes and mobile widths.
The visual replay accepts 2–80 integers in [-10⁹, 10⁹]. Oversized inputs fail
before tracing; the submitted Python source remains unchanged.

Validation: `node --test tests/deletion-4123.test.js tests/math-replays.test.js`.
Tests cover 1,244 signed arrays, independent exhaustive deletion optima for small
arrays, legal reconstructed operations, old-value tuple semantics, reversible
snapshots and an 80-value replay through the bundled Vercel Python runtime.
