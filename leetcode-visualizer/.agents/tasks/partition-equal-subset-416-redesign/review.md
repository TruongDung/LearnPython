# Picture-first, line-by-line redesign of LeetCode 416 (DP, bitset, DFS)

Commit 964f4b5 replaces the text-heavy 416 views with one picture per approach. DP is a stacked grid with one dp row per processed number, plus keep and take arrows for `dp[j] = dp[j] or dp[j-num]`. Bitset shows `bits`, `bits << num` and the OR result, with bit 0 on the right. DFS draws the call path as a take/skip tree with sibling result stubs and a chosen-sum meter. All three builders now emit lines 1–2. Notes are cut to at most 25 characters, the default example becomes `3,1,5,9,4,2` with the old `1,5,11,5` kept as a preset, and the code-panel height cap is removed for 416. The only shared-file change is an `index.html` cache bump from v4 to v5 (CSS link, renderer script, and the `equalSubset` key in the `script.js` query string). `script.js` itself is unchanged.

Watch for: the note-length test only runs on the four presets. Arbitrary inputs stay under the cap by construction, not by test (non-blocking, confirmed).

**Verdict**: APPROVED

## High-level view

The redesign covers all three approaches, so scope is not limited. Each renderer builds its picture from the step's view object. The shared shell supplies the header badge, presets, Σ ÷ 2 goal, number chips, legend and jumps. Source code appears only in `#codePanel`, scoped per approach through the existing `data-block` rule. Locals appear only in the Variables panel.

Line coverage meets the done criteria. The default example walks DP lines 1–11 and bitset lines 1–9. DFS misses only line 6 (the odd-total return), and the Odd total preset covers it. A test enforces both facts. The DP builder's Python-trace parity test still compares every frame's line and locals against `sys.settrace`, with lines 1–2 now excluded as outside the frame. DFS on the default runs 335 steps (83 calls) and is not shortened.

Both themes come from `--pe-*` tokens under `.pe416-viz` and `[data-theme="light"] .pe416-viz`. The headless-Chrome probe reports 0 console errors and highlight equal to `data-source-line` on every frame for 4 presets × 3 approaches × 2 themes. It also reports 0 shape/label overlaps, 0 clipped elements, no code-panel vertical scroll, and clean runs on the other nine pages. The screenshots match: the DP take arrow runs from `j−num` in the previous row to `j` in the active row, the bitset arrow goes from bit 0 to bit `num`, and the DFS take labels sit clear of their edges.

<details>
<summary>Issues (1)</summary>

1. **Note cap tested on presets only** — the ≤ 28-char assertion iterates `PE416_CASES` only. The longest notes are bounded by the input limits (for example `Shift 100, OR: +9999 sums.` = 26), so this is non-blocking. Optionally add one sample at the input bounds to keep the cap enforced if the templates change.

</details>

<details>
<summary>Details</summary>

### Note length beyond the presets

The renderer test asserts `step.note[language].length <= 28` while looping only over the presets (confirmed, `tests/partition-equal-subset-416.test.js`, "renders every frame" test). The interpolated notes are the DP `` `${j - num} unreachable → no.` ``, the bitset `` `Shift ${num}, OR: +${added} sums.` ``, and the DFS `` `dfs(${i}, ${r}): done?` ``. With nums ≤ 100, length ≤ 200, target ≤ 10000, and DFS limited to 12 numbers, they all stay under 28 in both languages. The guarantee comes from the input bounds plus the current wording, so a later template edit could go over the cap without failing a test.

</details>

<details>
<summary>File map</summary>

- `problems/partition-equal-subset-416.js`: DP and bitset builders emit lines 1–2, short titles/notes, `rows`/`rowsOmitted` history (last 7), bitset hides locals until assigned, new default input.
- `problems/partition-equal-subset-416-dfs.js`: per-event short title/note table, emits lines 1–2.
- `public/renderer-partition-equal-subset-416.js`: rewritten. Shared shell, DP grid, bitset rows, DFS path, presets and jumps.
- `public/partition-equal-subset-416.css`: rewritten with dark/light tokens, picture styles, uncapped `#codePanel`, step note visible.
- `public/index.html`: cache bump `equal-subset-416-v4` → `v5` (CSS, renderer, `script.js` query key).
- `tests/partition-equal-subset-416.test.js`, `tests/partition-equal-subset-416-dfs.test.js`: coverage, every-frame render, note cap, arrow/label overlap, wiring and theme tests.
- `.agents/tasks/partition-equal-subset-416-redesign/*`: CDP probe script, report, screenshots.

Full diff: `git diff a02725a..964f4b5`.

</details>
