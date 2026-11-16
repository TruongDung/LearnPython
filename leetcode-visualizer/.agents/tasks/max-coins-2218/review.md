# Picture-first redesign of the LeetCode 2218 K-coins page

Commit f56079f replaces the old 2218 view, which lived in the shared requested-visualizations files, with a dedicated renderer and stylesheet. Both DP approaches are now 18-line runnable Python, traced one executed line per step with no step cap. The picture puts four things in one SVG: coin stacks with a "top coins only" cue, a dashed cut line under the top t coins with +prefix[t], the candidate list for the cell being filled (winner starred, −∞ crossed out), and the DP table with a source→target arrow. On the final step it shows the chosen coins, the per-pile counts and, for approach 1, the reconstruction path. Shared files only lose their 2218 code and gain registration lines.

Watch for: two cosmetic nits, neither blocking. Approach 2 reserves an empty second table row once `new_dp` is gone (confirmed). The class name `lc2218-foot` is used for both the HTML footer and the SVG pile-footer text (confirmed, harmless today).

**Verdict**: APPROVED

## High-level view

Both approaches share the parser, the step recorder and the renderer, so keeping both cost little. The per-pile picks come from a display-only `plan2218`. It uses the same first-maximum tie-break as the traced code, so the picks shown for approach 2 match what approach 2 computes.

Moving 2218 out of the shared files is clean. `renderer-requested-visualizations.js` lost 53 lines and `requested-visualizations.css` lost 34, all of them 2218 code. In `script.js`, the bundle list drops `renderCoins2218View` and the registry entry now checks `maxCoins2218View`. `index.html` gains one CSS link, one script tag and `&lc2218=pictures-v1`.

The full-suite logs in the task directory show the same 63 failing test names before (3423 tests) and after (3426 tests). The probe report shows all 17 executable lines visited and zero mismatches, overlaps, clipping or code-panel scroll.

<details>
<summary>Issues (2)</summary>

1. **Approach 2 empty table row** — `lc2218Layout` sizes the grid from `state.rows` (always 2 for approach 2), so after `dp = new_dp` and on the final step a blank row sits between the table and the equation. Size it from `state.table.length` instead. Cosmetic.
2. **`lc2218-foot` class collision** — the nav `<footer>` and the SVG pile-footer `<text>` share the class, so the footer's flex rules also match the SVG text. They have no visible effect now, but they are a trap for later edits. Rename one of them, for example to `lc2218-pile-foot`.

</details>

<details>
<summary>Details</summary>

### Approach 2 table geometry after the commit

For approach 2, `lc2218Normalize` fixes `rows = 2`, and `lc2218Layout` derives `gridBottom` and `eqY` from it. The builder's snapshot has two rows only between line 12 (`new_dp = dp[:]`) and line 17 (`dp = new_dp`). At the seed, the `for-pile`, the commit and the return steps, there is one row. The final-light screenshot confirms the gap (confirmed): about 38px of empty space between the `dp` row and "P1×2 + P3×1 → Answer 121". This does not cause clipping or overlap, so it is not blocking.

### Shared `lc2218-foot` class

`renderMaxCoins2218View` emits `<footer class="lc2218-foot">` for the jump buttons, and `lc2218Piles` emits `<text class="lc2218-foot …">` for the ×n, +prefix and Σ labels (confirmed). The CSS rule `.lc2218-presets, .lc2218-foot { display: flex; flex-wrap: wrap; gap: 7px; }` therefore also matches the SVG text. SVG text ignores those properties, so nothing renders wrong today. A future rule on `.lc2218-foot` meant for one element would silently hit the other.

### Test coverage

The tests cover both approaches against brute force (presets, 300 random inputs, 5 extremes). They also execute the displayed Python, check line coverage including the False branch and the kept-value case, render every frame in both languages, check geometry and theme colors, and cover aria-labels, locals, input rejection and asset registration. Not tested: unused vertical space in the picture, which is why the approach-2 gap passes the geometry test.

</details>

<details>
<summary>File map</summary>

- `problems/maximum-value-k-coins-2218.js`: rewritten builder for both approaches, new parser and limits, `plan2218` reconstruction, new default example.
- `public/renderer-max-coins-2218.js`: new dedicated renderer (normalize, SVG picture, current-line strip, presets, jump buttons).
- `public/max-coins-2218.css`: new dark and light theme variables, picture styles, code-panel wrapping and hanging indent scoped to 2218.
- `public/renderer-requested-visualizations.js`: `renderCoins2218View` removed.
- `public/requested-visualizations.css`: `.c2218-*` block removed.
- `public/script.js`: bundle list entry removed; registry entry switched to `maxCoins2218View` and `renderMaxCoins2218View`.
- `public/index.html`: CSS link, script tag, `lc2218` cache key.
- `tests/maximum-value-k-coins-2218.test.js`: rewritten, 11 tests.

Full diff: `git diff 5ac162d...f56079f`.

</details>
