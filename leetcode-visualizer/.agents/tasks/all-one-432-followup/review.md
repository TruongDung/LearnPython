# Shorter step notes and a single code view for the 432 visualizer

Commit b9a9696 fixes findings 1 and 2 from the redesign review. The 432 renderer no longer has its own copy of the Python source. The in-view code window is now a one-row "Current line" strip showing `L<n>`, the `↳` effect, the True/False badge, the call stack and the locals. The source appears only in the shared `#codePanel`, which `script.js` highlights from `step.codeLines` the same way it does on every other page. Every `note` in `problems/all-one-432.js` was cut to a few words in both languages (the longest is 33 characters). Shared `script.js` is untouched. The commit message records 3/3 passing 432 tests, 49 failures in the full suite (the same count as the base), and 0 console errors in headless Chrome across the default example (130 steps) and "Every code line" (233 steps). On every step, the shared panel highlighted exactly one line and it matched the picture. It also records a 146/410/514/707 walk-through with no errors.

Watch for: the hidden note box is now visible again, which is a small layout change the coder flagged for the user (confirmed, intentional). Also, `AO432_LINE_COUNT = 74` is a second hardcoded copy of the source length (confirmed, minor).

**Verdict**: APPROVED

## High-level view

The duplicate code view was removed by keeping the shared `#codePanel`, which matches how every other visualizer page is laid out. Line-by-line highlighting still works because that panel already scrolls to and highlights `step.codeLines[0]`. The in-view strip keeps only information the shared panel lacks (effect, branch result, stack, locals), so the two no longer repeat each other. The finding 3 stack line ranges are unchanged, as the scope required.

The notes are now short phrases such as "Link 3 of 4." and "Empty: remove it.". No note interpolates a user key, so user input cannot push one past the new 40-character test limit. Because the redesign had hidden `#stepNote` on this page, the change in what readers see is that a one-line caption appears, not that a paragraph shrinks. The coder reported this to the user as an open decision.

<details>
<summary>Issues (2)</summary>

1. **Note caption re-shown** — `all-one-432.css` changed `#stepNote` on 432 from `display: none` to a 13px caption. This adds a little text to the page. Confirm with the user that they want the caption, or restore `display: none` if not.
2. **Hardcoded line count** — `AO432_LINE_COUNT = 74` in the renderer must match `ALL_ONE_432_SOURCE.length` (74 today). If the builder source changes, line clamping drifts without any warning. Consider deriving it from the step data, or adding a test that asserts the two are equal.

</details>

<details>
<summary>Details</summary>

### Keeping the shared `#codePanel` over the in-view window

The renderer dropped `AO432_SOURCE` and `AO432_BLOCKS`. `ao432Code` now emits a single `<div class="ao432-now" data-code-line="N" aria-current="step">`, and the test asserts that each frame has exactly one `data-code-line` and contains no source text (`ao432-lines`, `def inc(self`). The title in the strip header changed from "Python code · line by line" to "Current line" / "Dòng đang chạy". These labels describe what the strip shows now. One side effect (likely): the shared panel starts blurred for every problem until the eye button is pressed. On a first visit the only line indicator is therefore `L43` with no visible source. This is app-wide behavior that applies to every page, so it is not a 432 regression.

The one remaining link to the deleted source copy is `AO432_LINE_COUNT`, which clamps `allOne432View.source.line` and the `codeLines` fallback. It matches `ALL_ONE_432_SOURCE.length` (74) today (confirmed). Like finding 3, it ties the renderer to a fixed source length.

### Note text and its visibility on 432

All note changes are in `problems/all-one-432.js`, and `script.js` still sets `stepNote` from `pick(step.note)`, so other pages' notes are unchanged. Notes only interpolate bucket names (`[3]`, `HEAD`) and counts, never keys. The `<= 40` assertion therefore holds beyond the presets the test runs. The CSS rule `body:has(#treeView:not(.hidden) .ao432-viz) #stepNote` stays scoped to the 432 view, so other pages' note styling is unaffected. The prior review assumed the long notes were visible. The coder's finding that they were hidden explains why the visible change is a caption appearing, and the coder surfaced that choice to the user rather than deciding it silently.

</details>

<details>
<summary>File map</summary>

- `problems/all-one-432.js`: shortened every `note` string (EN and VI).
- `public/renderer-all-one-432.js`: removed the in-view source copy and block table, added the current-line strip and `AO432_LINE_COUNT`.
- `public/all-one-432.css`: replaced `.ao432-lines` styles with `.ao432-now`, and un-hid `#stepNote` as a caption.
- `public/index.html`: bumped the 432 asset version from v2 to v3.
- `tests/all-one-432.test.js`: added assertions for a single line number per frame, no source in the view, notes of 40 characters or fewer, and the v3 assets.

Full diff: `git diff d8e95f8...HEAD -- leetcode-visualizer`

</details>
