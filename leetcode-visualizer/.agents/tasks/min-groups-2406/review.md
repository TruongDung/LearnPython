# New LeetCode 2406 page: group lanes on a number line plus a min-heap of group ends (pass 2)

Commits e0397a9 and 85b0a34 add a page for "Divide Intervals Into Minimum Number of Groups". It shows one approach, sort + min-heap of group end times, stepped one executed Python line at a time in the shared #codePanel. The picture draws groups as colored lanes on a number line, the waiting interval on a top row with a sweep line at `left`, the heap as colored slots, and a "×N" column at the most-overlapped point on the last frame. The three pass-1 findings are fixed. The `ends[0]` mark now sits 6px inside the group's last cell, the group palette avoids the free/busy hues (and busy/free also differ by dashed/solid outline), and the SVG label is localized. The overlap test now covers the line marks.

Watch for: the module registers `id: "2406"` as a string, while the other 1004 problems use numeric ids (**confirmed**). The server returns `problem.id` as-is, so `currentProblemId` becomes `"2406"`, and the app's `Number(chip.dataset.id) === currentProblemId` checks never match. The 2406 chip in the catalog/search list and in Recent problems doesn't get the `active` highlight that every other page gets.

**Verdict**: NEEDS_CHANGES

## High-level view

The single-approach choice fits the comparable heap pages (2402, 1851). The heap size equals the group count, so lanes and heap slots show the same number, and a sweep-line or difference-array view would only show the overlap count again. The default example runs every non-blank line, including the empty-heap False, overlapping False and True outcomes of line 9, so presets aren't needed to fill coverage gaps.

The remaining gap is in registration. The string id makes 2406 different from every other module in places where the app compares ids with `Number()` on one side only. The probe's "2406 not in list" result comes from the heap category being collapsed by default. The probe reads `document.body.innerText` and never opens the category, so this doesn't show a missing entry. The first commit's probe confirmed 2406 is in `/api/problems`.

<details>
<summary>Issues (2)</summary>

1. **String problem id** — `problems/min-groups-2406.js` exports `id: "2406"`. `markActiveChip` and the Recent chip compare `Number(...) === currentProblemId`, so the 2406 chip never shows as active. Change it to `id: 2406` like the other modules, and add a test that `typeof SUPPORTED[2406].id === "number"`.
2. **Probe list check can't pass** — `cdp-check.js` looks for "2406" in `body.innerText` while the heap category is collapsed. Open the heap category first, or search for 2406, then check that the chip exists and has `active` after loading. That would also have caught issue 1.

</details>

<details><summary>Details</summary>

### Numeric vs string id in the catalog

All 1005 entries in `SUPPORTED` have a numeric `id` except 2406. `/api/problem/:id` responds with `id: problem.id`, and `app-core.js` sets `currentProblemId = data.id`. Several catalog paths coerce only the chip side:

```js
// app-core.js markActiveChip
const isActive = Number(chip.dataset.id) === currentProblemId;   // 2406 === "2406" → false
// renderRecentProblems
(Number(problem.id) === currentProblemId ? " active" : "")       // same
```

So after loading 2406, the catalog/search chip and the Recent chip stay un-highlighted. The two `p.id === currentProblemId` comparisons in initial chip rendering happen to work, because both sides are strings there (**confirmed**). Stepping and rendering are unaffected because the renderer is chosen by the `minGroups2406View` predicate. The fix is one character. It also keeps 2406 consistent with `CATEGORY_ORDER` lookups and `PREMIUM_PROBLEM_IDS.has(problem.id)`, which both expect numbers.

</details>

<details>
<summary>File map</summary>

- `problems/min-groups-2406.js`: new module (parser with ≤10 intervals and span ≤ 40, heapq-faithful heap, step builder, heap category metadata).
- `public/renderer-min-groups-2406.js`: new renderer (lanes SVG, chips, heap slots, current-line strip, presets, jump buttons). In 85b0a34: inset `ends[0]` mark and localized aria-label.
- `public/min-groups-2406.css`: scoped styles with dark and light tokens and the code-panel height cap lifted for this page only. In 85b0a34: palette without green or red, and dashed/solid busy/free outlines.
- `tests/min-groups-2406.test.js`: 9 tests (brute-force answer on presets and 300 random inputs, note cap, line coverage, both-language render, overlap including line marks, palette distance, input limits, wiring).
- `problems/index.js`: `require("./min-groups-2406")` added to the heap category.
- `public/script.js`: one registry entry for `minGroups2406View`.
- `public/index.html`: stylesheet link and script tag with `data-problem-ids="2406"` (`?v=min-groups-2406-v2`), and `&mg2406=pictures-v1` on the `script.js` URL.
- `.agents/tasks/min-groups-2406/`: CDP probe, report, screenshots and the pass-1 review.

Full diff: `git diff 383c039..85b0a34`.

</details>
