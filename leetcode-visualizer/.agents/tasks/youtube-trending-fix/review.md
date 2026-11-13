# Review: 9025 fix pass (161f1b4...7818217)

Verdict: APPROVED. No blockers.

## Evidence
- Git state: `main...origin/main [ahead 2]` (161f1b4, 7818217), so nothing is pushed. `.agents/tasks/youtube-trending/review.md` and `review.json` are tracked in 7818217.
- Finding 1 (live results):
  - `public/live-editor.js` adds `result_repr()`, which expands `list_iterator`/`list_reverseiterator` (top-level or one level inside a list result). It is applied only in the final `return`, after `sys.settrace(None)` and after every design operation has run, so user code cannot need the iterator any more. Line snapshots still use `safe_repr`.
  - `resultSkip` defaults to 0 (`int(design_config.get("resultSkip") or 0)`), so it is opt-in. Only `prepareLiveDesign9025` sets it, to `warm.length`. It is applied before `resultMode == "last"`, so 1570 is unaffected.
  - Approach 1's code is unchanged in the diff, including `return reversed(res)`.
  - The new test runs the real TRACER_PY across all 3 approaches × 4 inputs, including ties. It asserts that the output equals the builder answers, that the screenshot preset gives `[['3', '1']]`, that no iterator reprs appear, and that an iterator is not consumed early.
  - The coder's spot check over 1216 default cases shows that only 9025 changed. The 126/1236 differences come from set iteration order, and errors stayed at 34 → 34.
  - The coder surveyed the other design-class pages: none hide setup calls. This is reported in the commit message.
- Finding 2 (complexity): `complexity3.time` is now `O(1) + O(n log n) / call`. It is ASCII and uses the same `/ call` format as approaches 1 and 2 (`O(n log k + k log k) / call`, `O(log n + k) / call`). The localized `note` explains the full-bucket `sorted()` cost in both vi and en. The bound is correct because the visited buckets hold at most n ids.
- Finding 3 (wrap): the CSS is scoped to `body:has(... .yt9025-viz)`. `renderCodeLineHtml` (app-core.js:3042) emits one leading 4-space `.indent-guide` per level, so `:has(> .indent-guide:nth-child(L))` with hang `4L+4ch` gives a continuation at indent + 4. The guides reset `text-indent: 0`. The headless check covered 26 wrapped lines at 4 widths, and no 9025 styles leak to 300, 2406, 3161 or 3420.
- Verification (commit message): 9025 tests 14/14. Full suite 52 → 53; the only new failure is the 560 `listen EACCES` flake, which passes 8/8 alone (rerun-560.txt). Headless Chrome in dark and light: 42 runs with 0 issues, and the Pyodide live editor runs 9025 a1–a3 plus pages 1, 146, 208, 295 and 432 without errors.

## Shared-file changes
- `public/live-editor.js`: `result_repr()` for the final result; opt-in `resultSkip` for design runs.
- `public/index.html`: `&yt9025=live-result-v1` added to the live-editor.js cache key; 9025 CSS key bumped to `-v2`.
