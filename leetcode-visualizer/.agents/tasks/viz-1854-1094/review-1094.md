# Car Pooling (1094) page, pass 2: code wrap, off-scale capacity line, last-trip locals

This pass reviews fix commit c634196 on top of the 1094 page (013464d). It answers the three issues from pass 1. Long code lines now wrap inside the shared `#codePanel`. The load chart now scales to the rider peak, and a capacity far above that peak is drawn as a dotted line pinned just above the bars, labelled `↑capacity`. The Variables panel keeps `num`/`start`/`end` at the last trip's values after the first loop, as Python does. All changes are in 1094 files. No 1854 file has changed since the approved commit 9e90125, and the probe loaded the 1854 page with 0 errors, so it has not regressed. The approach is unchanged from pass 1: a difference array with a running sum, one method, no code2.

Watch for: nothing blocking. A builder comment still says the chart scale includes capacity, which no longer matches the renderer (**confirmed**, nit).

**Verdict**: APPROVED

## High-level view

The code-panel fix adds page-scoped `white-space: pre-wrap` to `.code-line` and `overflow-wrap: anywhere` to `.txt`, which is the same approach pages 441 and 464 use. The 74-character signature on line 4 now wraps to `-> bool:` on a second row (`shot-1094-light.png`). The probe now checks horizontal fit too. In both themes it measured `scrollWidth == clientWidth == 483`, 0 lines clipped on either axis, and 1 wrapped line. The rules are scoped to `.cp1094-viz`, and the other pages kept their own code-panel heights (146 and 1851 at 420px).

The chart switches to off-scale mode when capacity exceeds `max(ceil(1.5·peak), peak + 2)`. The scale then becomes `peak + 1`, and the capacity line sits at that level. The builder computes `peak` once before the first step, so the chart keeps the same scale while stepping. Tests and the probe cover the pinned case: the tallest bar is at least 14px, the line sits above every bar, and the probe found 0 overlaps or clipping.

The coder recorded 12/12 passing tests in the 1094 file. The full suite ran 3137 tests with 53 failures, and the failing files match the base-commit baseline, with none involving 1094 or 1854. The 1854 review already accepted the coder's explanation that the 4 failures above the brief's 49 come from CRLF line endings in the worktree. The probe found 0 highlight mismatches across 7 inputs × 2 themes, the smallest rendered font was 11px, and the chip highlighted with a numeric `currentProblemId`. Pages 1854, 2406, 416, 426, 432, 146 and 1851 loaded with 0 console errors. The default example walks every line except 14 (`return False`), and the Over capacity preset covers line 14.

<details>
<summary>Issues (1)</summary>

1. **Stale chart-scale comment** (confirmed, nit). The `buildSteps1094` comment says `peak` is "the most riders at any stop, or capacity if higher". The builder never included capacity, and since c634196 the renderer doesn't either. Change the comment to "the most riders at any stop".

</details>

<details>
<summary>File map</summary>

- `leetcode-visualizer/problems/car-pooling-1094.js`: `lastTrip` feeds `num`/`start`/`end` in the Variables panel; `trip` still drives the picture.
- `leetcode-visualizer/public/renderer-car-pooling-1094.js`: chart scale follows the rider peak; off-scale capacity line pinned at `peak + 1` with `is-off-scale` class and `↑` label.
- `leetcode-visualizer/public/car-pooling-1094.css`: dotted `is-off-scale` stroke; 1094-scoped wrap rules for `#codePanel .code-line` and `.txt`.
- `leetcode-visualizer/tests/car-pooling-1094.test.js`: off-scale scale/pin test, last-trip locals test, CSS wrap assertions, cap-line regex allows the extra class.
- 1854 files and shared registration (`problems/index.js`, `public/script.js`, `public/index.html`): unchanged in this pass.

Full diff: `git -C .worktrees/viz-1854-1094 diff 85b0a34...HEAD` (this pass only: `git show c634196`)

</details>
