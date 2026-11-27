# 4124 — Minimum Operations to Make Mountain Array II

Values may become zero or negative. This differs from the positivity constraint
in the first variant. The operation cost is the L1 distance to a strict mountain,
with an internal peak; arrays shorter than three return -1.

The implementation follows the public hints linked from the official problem:
https://leetcode.com/problems/minimum-operations-to-make-mountain-array-ii/
The description and example were supplied by the user. The source is an
independent implementation, not copied from a paid editorial.

For an increasing side, transform value a[i] to a[i] - i. A max-heap computes the
minimum L1 cost of fitting a nondecreasing sequence and its smallest optimal
endpoint for every prefix. Run this in both directions. At each internal peak,
combine the two side costs and the cost of raising that peak above both optimal
adjacent endpoints. Lowering either endpoint below its smallest optimal value
costs at least the amount by which it can reduce the peak's adjustment.

Retained heap levels also reconstruct one optimal side by a backward minimum
pass. Join both reconstructed sides and the selected peak. The native Python
snapshots include the actual target, per-index changes and the selected cost.

The scene shows the array profile, the actual max-heap, each trial peak, and the
reconstructed optimum with its unit edits. Code and line controls remain in the
existing external panel. Both languages and themes are supported. The teaching
UI accepts at most 40 integer values within ±10^9; the displayed algorithm is
O(n log n) time and O(n) space and does not scan the numeric value range.

```sh
node --test tests/mountain-4124.test.js
```

Checks cover 1,243 signed-array optima against independent exhaustive-height DP,
all reconstructed witnesses, the supplied example [2,2,3] -> 2, the zero-valued
optimum for [3,1,2,5,4] -> 3, impossible cases, large values, every visual snapshot
in both languages, source-line correspondence and immutable replay.
