# Physical DP pictures

All scenes support Vietnamese / US English, light / dark themes, mobile widths,
and the existing external source pane and forward/backward controls. They contain
no embedded source window. Pictures consume source snapshots; final witnesses
appear only after their supporting choices exist.

| Lesson | Picture | Visual input limit |
| --- | --- | --- |
| 312 | Last balloon in a DP interval, then the actual chronological burst order and neighbor products | 1–8 values, 0–100 |
| 546 | Equal-color boxes, carried k boxes, gap removal, concatenation and squared group scores | 1–10 boxes, colors 1–100 |
| 664 | Shared print turns and each canvas after an overwrite | 1–12 lowercase letters |
| 887 | Drop floor, broken/surviving branches; classic and moves-based DP | Classic: 1–5 eggs, 0–12 floors; optimized: 1–8 eggs, 0–200 floors |
| 1000 | Exactly k adjacent piles merged at each step with cumulative costs; impossible residue | 1–10 piles of 1–100 stones, k=2–10 |
| 1531 | Delete/keep branches, open RLE run, kept characters and final encoded groups | 1–12 lowercase letters, 0≤k≤length |
| 1659 | Empty / introvert / extrovert cells, left/above neighbor effects, final placement and score | At most 6 cells, dimensions 1–3, 0–6 of each person type |

312 and 664 retain their existing exact source-oriented state machines and
validated reconstruction data. Their old detailed renderers remain a fallback;
the primary view uses compact physical pictures and keeps code outside the scene.

546, 887, 1000, 1531 and 1659 now execute their displayed Python using the bundled
WASM runtime. 546 groups adjacent equal boxes before memo lookup. Its witness
backtracks the computed normalized memo states, preserving original box IDs.
1000 backtracks the completed interval DP and validates adjacent k-pile arity.

1531 records every executed memo write from the scalar `delete` / `keep` values,
then backtracks those costs at return. Full memo dictionaries are not serialized
at every recursive event. This keeps a complete source trace instead of the old
truncated teaching trace. 1659 records completed visit-state costs and derives a
valid grid at return. Call-stack projections retain the parameters used to draw
the current branch, while excluding repeated cache dictionaries.

`tests/physical-dp-pictures.test.js` checks 363 exhaustive removal optima,
762 adjacent-merge optima, 1011 deletion-subset compression optima, 39 grid
assignment optima, 222 egg-drop cases across both sources, 126 chronological
balloon optima and 62 canvas BFS optima. It also checks snapshot immutability,
source correspondence, witness accounting, lazy loading and separate theme
palettes. Existing compression regressions cover another 47 actual replays.

Browser QA covers all seven lessons, default and boundary examples, both egg
approaches, both languages/themes, external source stepping and 390px widths.
The replay caps are teaching limits, separate from the full judge constraints.
