# 426 follow-up: distinct closing arcs, arrow-overlap check, tighter note cap, locals shown once

Commit a02725a fixes the four non-blocking findings from the 426 redesign review. The closing links `tail.right = head` and `head.left = tail` now always use the dashed arc under the list row, so on a 2-node list they no longer sit on the straight `head.right`/`tail.left` lanes. A new unit test samples every pointer path on every frame and fails when one arrow mostly lies on another. The note cap is now 28, and the node/prev/head chips are gone from the line strip, so these values appear only in the shared Variables panel. The only shared file touched is `index.html`, for a cache-version bump that the year-long static cache requires.

Watch for: nothing blocking. The `closing` predicate relies on the fact that the builder never writes `head.left` or `x.right = head` except in the final closing step (likely; this holds for the inorder prev/head algorithm, and the test asserts exactly two `is-close` arrows in the last frame).

**Verdict**: APPROVED

## High-level view

The renderer decides on a closing link by looking at the endpoints (`to === head` for right, `from === head` for left) instead of the rank distance. For n = 2 this sends both closing links down to the arcs. The arcs use different offsets (±8px) and depths (30/52px), so they cross once and never run side by side. The probe measured a worst overlap of 5.7% for `2,1` and 1.5% for the default input in both themes.

The new overlap test parses the `M`/`H`/`C` path data and reports the largest share of one arrow's points that fall within 2px of another arrow. The threshold is 10%. Per the commit message, the old renderer fails this test at `2,1` step 28 with a 0.95 share, so the test would catch the original bug. It covers `2,1`, `1,null,2`, the default and `4,2,5,1,3`, and also asserts that the final frame has exactly two closing arcs.

The note cap of 28 matches the longest English note ("head: smallest node (later)."). Locals now appear only in the shared Variables panel. A test asserts that `step.vars` is `node, prev, head, list` on every step and that no `dl426-locals`/`chip-` markup is rendered. This follows the 432 approach of keeping the shared view and dropping the in-view copy. The coder recorded 9/9 passing for 426 and 432, and 49 failures in the full suite, the same count as the base.

<details>
<summary>Issues (2)</summary>

1. **Closing detection is tied to the algorithm** — `closing` treats any `head.left` or `x.right = head` arrow as a closing link. This is correct for this builder (likely), but if the builder ever starts drawing original tree pointers in `state.left`/`state.right`, those arrows would wrongly become arcs. No action needed now; keep this in mind if the builder changes.
2. **Overlap test only covers English** — the overlap test renders with `renderer('en')` only. Arrow geometry does not depend on language, so the risk is low (possible). Running the loop for `vi` as well would be a cheap way to close this gap.

</details>

<details>
<summary>Details</summary>

### Closing-arc routing

```
        ┌──────┐ ──right──▶ ┌──────┐
        │  1   │            │  2   │
        └──────┘ ◀──left─── └──────┘
          ╰╮ ↘ tail.right=head ↙ ╭╯   (depth 30, +8px)
           ╰─── head.left=tail ──╯    (depth 52, −8px)
```

Before this change, the branch was chosen with `Math.abs(rank diff) === 1`. For n = 2 the closing links landed on the straight lanes at y+11 and y+24, which are the same lanes `head.right` and `tail.left` use. The fix is the `!closing &&` guard. The arc branch was already written for head↔tail, so nothing else in it changed. The single-node self-loop branch still comes first, so n = 1 is unchanged.

### Overlap test

`maxArrowOverlap` compares every pair of arrows, which is O(points²) per frame. The inputs are small, so the cost is negligible. The test samples cubic curves at 200 points and `H` segments at about 1px. This gives a share-based score that tolerates a single crossing (about 5%) but flags arrows drawn on top of each other (about 95%). The headless probe adds the same measurement on real DOM paths in both themes, so theme-dependent CSS such as stroke offsets would also be caught there.

### Locals and the Variables panel

`dl426Code` now returns only the header and the current-line strip. The chip CSS was removed along with it, so no unused styles remain. The 432 follow-up kept "locals" in its in-view strip because its shared panel did not show them. On 426, `step.vars` already holds node/prev/head, so keeping only the shared panel is the right choice here.

</details>

<details>
<summary>Files changed</summary>

- `public/renderer-bst-dll-426.js`: closing links always arc; chip strip removed.
- `public/bst-dll-426.css`: removed `.dl426-locals` styles.
- `public/index.html`: cache bump for 426 assets from v1 to v2 (shared file, required).
- `tests/bst-dll-426.test.js`: note cap 40 → 28; arrow-overlap test; locals-once test; asset version assertions.
- `.agents/tasks/bst-426-followup/`: CDP probe, report, screenshots.

Full diff: `git diff ae2f479..a02725a`

</details>
