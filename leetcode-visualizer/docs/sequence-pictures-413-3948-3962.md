# 413, 3948 and 3962

All three scenes consume executed Python snapshots and use the external source
pane and line controls. No source window is embedded in a picture. They support
Vietnamese / US English, light / dark themes and mobile layouts.

3948 shows suffix membership, the current MEX candidate, the actual missing set
and committed prefix cuts. A cut appears only after `answer.append(mex)`.
The teaching source rebuilds suffix sets in O(n²), accepting 1–60 integers in
[0,100000]. Its partition history retains original boundaries.

3962 shows signed bars and the selected window, sorted inside/outside queues,
candidate exchanges and committed gains. Original indices disambiguate repeated
values. A new window resets its local swaps. The best witness updates only on
`answer=max(answer,score)` and supplies the final chart. The teaching model is
O(n³ log n), accepting 1–12 values in ±100000 with 0 ≤ k ≤ n.

413 compares the two adjacent differences, shows the actual `ending` count,
and adds interval groups only when `answer += ending` runs. A histogram records
each committed contribution; at most six example intervals are drawn together.
The displayed source remains O(n) time / O(1) auxiliary space, excluding replay
annotations, and accepts 1–80 integers in [-1000,1000].

`tests/sequence-pictures.test.js` checks 3430 exhaustive-partition MEX optima,
1189 swap optima against reachable-array BFS, and 9843 arithmetic interval counts.
Additional checks validate every source frame, witness sums, immutable rewind,
input caps, bundled runtime response size and lazy asset order. Browser checks
cover both languages/themes, external line controls, scene jumps and 390px widths.
