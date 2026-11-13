# Maximum Population Year (1854) line-by-line picture page

This change adds a 1854 page in the Prefix Sum category. It traces a difference-array solution one executed Python line per step. The picture puts three rows on one shared year axis: a life bar per person (an open dot marks the death year, which is not counted), the diff cells with the +1/−1 just written, and population bars for `curr` with the `max_pop` line and the best year in amber. The approach is the one in `Leetcode-sln/array/Leetcode_1854.py`, with one change: the array spans `lo..hi` instead of a fixed 101 years, so the picture has one cell per year actually used. There is no code2. Shared changes are one `require` in `problems/index.js`, one renderer-registry entry in `public/script.js`, and in `public/index.html` one stylesheet link, one script tag (both `data-problem-ids="1854"`) and a `&mp1854=pictures-v1` cache-buster. The coder reported all of these.

Watch for: on a 1400px window the SVG is drawn about 676 units wide and scaled down to fit its card. That likely shrinks the 10–11px diff, year and bar labels to about 8px, and no check measures rendered font size.

**Verdict**: APPROVED

## High-level view

The builder emits a step for every executed line, including the loop header re-checks that end each `for` loop (`for-log-done`, `for-year-done`). The default 8-person example covers all 17 non-blank lines. It includes a tie (`4 > 4 → False`, note "Tie → keep earlier year."), a smaller year, and at least three `max_pop` raises. The Short and Gap presets are LeetCode examples 2 and 1, and One person is the minimal case. Notes stay at most 24 characters. The test enforces the 28-character cap on all presets plus 300 seeded random inputs.

The source appears only in the shared `#codePanel`. Locals appear only in the Variables panel. The in-view "Current line" strip shows the line number, the evaluated effect and a True/False badge, the same contract the approved 2406 page uses. For the 1854 page only, a `body:has(... .mp1854-viz)` rule removes the code panel's height cap and makes it static. The headless probe measured `scrollHeight == clientHeight` (349) in both themes. It also confirmed the other pages keep their own code-panel heights (146 and 1851 still at 420px, 2406/416/426/432 unchanged) and step through with no errors.

Correctness is checked against a brute force that counts people alive in each year from 1950 to 2050. The check covers presets and 300 random inputs, and every prefix bar is compared with the true alive count for its year. Input limits (at most 10 logs, span at most 31 years) are enforced in the parser with errors that name the problem.

The overlap/clipping test works on approximate SVG boxes. The probe used real `getBBox` boxes and found 0 overlaps, 0 clipped elements and 0 diff values outside their cells in 6 inputs × 2 themes. Both checks work in SVG user units, so neither shows how small the text becomes after the SVG scales down to its card.

The full suite ran 3125 tests with 53 failures, and the failing set matches the base-commit baseline exactly (3115 tests, 53 failures). The brief expected 49 failures. The coder traced the 4 extra failures (1108, 1678, 541, 557) to CRLF line endings in the fresh worktree checkout, and the sample failure in the log is a `\r\n` vs `\n` source comparison. None of the failures involve 1854.

<details>
<summary>Issues (1)</summary>

1. **SVG labels scaled below readable size** (likely, non-blocking). On a 1400px window the 26-year default draws at about 676 units and is scaled to about 515px, so the 11px/10px labels render at about 8px. Size `unit` from the card width, or set a minimum rendered font size, and add a probe check of `getBoundingClientRect` height for `.mp1854-cell-value` and `.mp1854-year`.

</details>

<details>
<summary>Details</summary>

### Picture scaling and label legibility

`mp1854Layout` picks `unit = max(21, min(40, floor(620 / cells)))` and sets the SVG's natural width to `44 + cells·unit + 34`. For the default example (1950–1975, 26 cells) the unit is 23, so the SVG is about 676 units wide. `.mp1854-svg { max-width: 100% }` then scales it down to fit the picture card. The probe screenshot (1400×1800 window, captured at 0.6 scale) shows the picture card about 310px wide in the image, which is about 515 CSS px. That is a scale of about 0.76 (**likely**: inferred from the layout math and the screenshot, not measured). At that scale the 11px diff values, year ticks and bar labels render at about 8.4px, and the 10px `is-wide` values (`-10`) at about 7.6px. The probe's `fitsCard` check passes because of the scaling. Its overlap check uses `getBBox` in user units, so it never sees the rendered size. Neither theme is illegible in the screenshots, but the diff row and year axis are the smallest text on the page, and the brief asks for the page to be easy to read at a glance. A 31-year span (unit 21, about 729 units wide) would shrink further.

</details>

<details>
<summary>File map</summary>

- `leetcode-visualizer/problems/max-population-1854.js`: new problem module (parser with limits, line-by-line builder, metadata, id 1854 as a number).
- `leetcode-visualizer/public/renderer-max-population-1854.js`: new SVG renderer, presets, current-line strip, jump buttons.
- `leetcode-visualizer/public/max-population-1854.css`: new dark/light tokens, picture styles, 1854-scoped `#codePanel` and `#stepNote` overrides.
- `leetcode-visualizer/tests/max-population-1854.test.js`: new tests (numeric id, brute force, line coverage, notes cap, overlap/clipping, palette, aria, locals, limits, wiring).
- `leetcode-visualizer/problems/index.js`: one `require` added to the array category.
- `leetcode-visualizer/public/script.js`: one renderer-registry entry.
- `leetcode-visualizer/public/index.html`: one stylesheet link, one script tag, one cache-buster parameter.

Full diff: `git -C .worktrees/viz-1854-1094 diff 85b0a34...HEAD`

</details>
