# Review: LeetCode 1970 page (commit 4b2a6c1, diff 7f6c70f...HEAD)

Verdict: APPROVED. No blockers.

## Evidence

- Scope. `problems/union-find.js` has three hunks. The first is `buildSteps1970` and its helpers (around line 6590). The second is the `1970: {` config (around line 8294). The third is the non-enumerable `__internals1970` `defineProperty` placed after the `Object.assign` block, before `installUnionFind`. No other problem's code changed. A grep for `\b1970\b` in problems/public/tests outside the new files finds only unrelated year values in 1854.
- Shared files are registration only. `public/index.html` gains 1 CSS link and 1 script tag, both with `data-problem-ids="1970"`, plus `&lc1970=pictures-v1` on the `script.js` query. `public/script.js` gains 1 `ORDERED_RENDERER_REGISTRY` entry (`cross1970View` -> `treeView`).
- Code. `SOURCE_1970` is 31 lines of runnable Python with `find` (path halving) and `union`, and the pseudo line is gone. The trace emits one line per step. Line 16 evaluates `find(b)` before `find(a)`, which matches Python's rule of evaluating the right-hand side before the subscript target. Timeline classes (d ≤ curDay water, d = curDay+1 current) match the loop semantics. The trailing `throw` is unreachable for valid input (R, C ≥ 2, full permutation).
- Page-scoped CSS. All `#codePanel` and `#stepNote` overrides are gated by `body:has(#treeView:not(.hidden) .lc1970-viz)`, so they cannot leak to other pages. The probe confirmed text-indent 0 on 3161 and 3420.
- Renderer. All view fields are validated in `lc1970Normalize`, and interpolated strings go through `lc1970Escape`. Presets set `#arrInput` and call `runViz()`. The renderer shows no source and no locals.
- Approach. Reverse union-find only, with no `code2`. The plan explains why, and the complexity note names binary search + BFS as the alternative. This answers the open point.
- Tests (from the commit message, not rerun): `tests/last-day-cross-1970.test.js` 11/11 pass, 0 skipped. Brute force matched on 5 presets, 400 random inputs and 5 extreme grids. The Python ran in .venv on 70 inputs. The ≤ 28-character note cap is asserted on presets, random and extreme inputs.
- Probe (`cdp-report.json`): 7 inputs × 2 themes. 0 highlight mismatches, overlaps, clipping, code-panel scroll, clipped code lines or bad hanging indents. Every run walks 27/27 executable lines. 0 console errors. The chip is active. Spot-checks of 9025, 3161, 3420, 547, 684 and 2316 are clean.
- Full suite (`full.txt`): 3230 tests / 3177 pass / 53 fail, against a baseline of 3219 / 3167 / 52. The only new failure is `picture-lessons.test.js` with `listen EACCES`; `rerun.txt` shows it passing 14/14 alone.
