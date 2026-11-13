# Implementation Plan: LeetCode 3420 page (Count Non-Decreasing Subarrays After K Operations)

## What exists today

- `SUPPORTED[3420]` does not exist. 3420 is only a row in `SEGMENT_TREE_ROSTER_RAW` (`problems/index.js` line 226).
  The catalog therefore shows it as a dimmed, disabled placeholder chip in the Segment Tree "all" sub-tab, and there is no page to open.
- A full new module, renderer, CSS file and test file are needed, following the 1094 page (commits 81da31b and b75845e) file for file.
- Adding the module flips 3420 to `available` in the Segment Tree roster. `tests/segment-tree-tag.test.js` hard-codes
  42 available and 45 unavailable (lines 26, 41, 42), so those three numbers must become 43 and 44. That is the only edit to an existing test.
- `index.js` lines 508-515 append `SEGMENT_TREE_TAG` to the tags of every roster id that has a module and is not in the segment-tree category.
  3420 stays in the Segment Tree tag automatically, so the module must not add the tag itself.

## Chosen approach

Use a **single approach**: a right-to-left sliding window `[i, j]` with a monotonic deque of `[level, count]` groups. There is no `code2`.

Reasoning:
- The deque is the picture. Each group is a run of cells raised to the same running max from `i`. Its level is a horizontal line over those bars, and the fill-up cost is the shaded area between each bar and its level. The user asked for exactly that picture.
- The method runs in O(n) with one loop and two inner `while`s, about 23 lines that walk cleanly line by line.
- The segment-tree, sparse-table and binary-lifting methods add a tree that does not explain the cost. Their steps are mostly query mechanics.
- The Segment Tree catalog tag comes from `index.js` (by id), so the page stays in that tag regardless of method. The complexity note names the segment-tree / sparse-table alternative in one line.
- Recent pages (2406, 1094, 1854) each show one approach.

Using `appendleft`/`popleft` keeps the deque in the same left-to-right order as the array. `dq[0]` is the group next to `i` and `dq[-1]` is the group ending at `j`, so the chips line up under their bars.

## Python code shown (`SOURCE_3420`, 23 lines; line 3 is blank)

```
 1 from collections import deque
 2 from typing import List
 3
 4 class Solution:
 5     def countNonDecreasingSubarrays(self, nums: List[int], k: int) -> int:
 6         ans = cost = 0
 7         j = len(nums) - 1
 8         dq = deque()
 9         for i in range(len(nums) - 1, -1, -1):
10             cnt = 1
11             while dq and dq[0][0] <= nums[i]:
12                 level, c = dq.popleft()
13                 cost += (nums[i] - level) * c
14                 cnt += c
15             dq.appendleft([nums[i], cnt])
16             while cost > k:
17                 cost -= dq[-1][0] - nums[j]
18                 dq[-1][1] -= 1
19                 if dq[-1][1] == 0:
20                     dq.pop()
21                 j -= 1
22             ans += j - i + 1
23         return ans
```

During planning I checked a JS transcription of this code against a brute-force O(n²) count on every preset below. All matched, including both LeetCode examples (17 and 12).

## Presets (`ND3420_CASES` in the renderer: `[numsCsv, k, viLabel, enLabel]`; the first one is the default)

| # | nums | k | answer | label vi / en | purpose |
|---|------|---|--------|---------------|---------|
| 0 | `4,1,5,2,6,3,7,1` | 5 | 21 | Ví dụ / Example | default; covers all 22 non-blank lines, 100 steps, peak cost 6 |
| 1 | `3,1,2` | 1 | 4 | Ngắn / Short | short preset |
| 2 | `6,3,1,2,4,4` | 7 | 17 | LeetCode 1 / LeetCode 1 | official example 1 |
| 3 | `6,3,1,3,6` | 4 | 12 | LeetCode 2 / LeetCode 2 | official example 2 |
| 4 | `1,2,3,4` | 1 | 10 | Đã tăng / Already sorted | no merge, cost stays 0 |

Module `defaultInput: [4,1,5,2,6,3,7,1]`, `extraParams: [{ key: "k", label: bi("k (số lần +1)", "k (+1 budget)"), type: "number", default: 5, min: 1, max: 999 }]`.
Limits: 1-10 values, each an integer 1-20, and k an integer 1-999. These caps keep every step note at 28 characters or fewer.

## Names

- View key: `nonDec3420View`. Renderer: `renderNonDecreasing3420View(step)`. CSS/JS prefix: `nd3420`. Cache token: `count-nondecreasing-3420-v1`.
- Category: `{ key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" }`. This existing category matches the approach.
  Tags: `[{ key: "queue", vi: "Queue", en: "Queue" }]`, an existing tag key. Do not add a new tag key, because tags create catalog groups. `index.js` adds the Segment Tree tag.

---

- [ ] 1. Create the problem module `problems/count-nondecreasing-3420.js`.
      Model it on `problems/car-pooling-1094.js`: `"use strict"`, the frozen `SOURCE_3420` above, `bi()`, `parseInput3420`, `buildSteps3420`, `module.exports = { 3420: {...} }`,
      and a non-enumerable `__internals3420` holding `{ parseInput3420, SOURCE_3420, MAX_N_3420: 10, MAX_VALUE_3420: 20, MAX_K_3420: 999 }`.
      - `parseInput3420(input, params)`: accept a number array, or a string either as JSON `[..]` or as comma-separated values.
        Read `k` from `params.k` and default it to 5. Throw an `Error` whose message starts with `3420:` for: empty input, more than 10 values, any value that is not an integer from 1 to 20, and k that is not an integer from 1 to 999 (including `'x'`).
        Return `{ nums, k }` with `nums` copied.
      - `buildSteps3420`: emit one step per executed Python line through an `emit({line, event, title, note, condition, final})` helper, as 1094 does. Each step has:
        `title` and `note` (`bi`), `arr: []`, `highlight: []`, `mark: []`, `codeLines: [line]`, `final`, and
        `vars` in exactly this order: `k, i, j, cnt, level, c, cost, dq, ans`. Show `"—"` until a variable is assigned. Format `dq` as `[[4, 1], [5, 2]]`.
        `level` and `c` keep their last values after a pop, as in Python. `i` and `cnt` also keep theirs after the loop.
      - `nonDec3420View` is a deep copy (`JSON.parse(JSON.stringify(...))`) of:
        `{ version: 1, problemId: 3420, line, event, condition, nums, k, n, i, j, cost, ans, dq, lvl, spans, delta, added, peakCost, maxVal, answer, final }`.
        - `dq` lists the `[level, count]` groups left to right.
        - `lvl` has length n. `lvl[t]` is the height that cell t is counted at in `cost`, or `null` when t is outside the window. Set `lvl[i] = nums[i]` at line 10. At line 13, set the popped group's cells to `nums[i]`. At line 17, set `lvl[j] = nums[j]`. At line 21, set the old `lvl[j] = null`.
          The invariant `cost === Σ (lvl[t] - nums[t])` over non-null cells must hold on every step.
        - `spans` is the left-to-right list of `{ kind: "pending"|"popped"|"group", level, count, start }`, contiguous from the window's left edge. That edge is `i+1` at line 9 and `i` from line 10 on.
          - `pending` (`{level: nums[i], count: cnt}`) exists from line 10 through line 14.
          - `popped` exists only at lines 12 and 13, with the popleft'd `[level, c]`. Remove it at line 14, where its cells join `pending`.
          - At line 15, `pending` becomes the group `dq[0]`.
        - `delta` is the cost change at line 13 (`+`) and line 17 (`-`), otherwise `null`.
        - `added` is `j - i + 1` at line 22, otherwise `null`.
        - `peakCost` is the largest `cost` value during the run. Compute it once up front with a dry run, so the meter scale never changes while stepping.
        - `maxVal` is `max(nums)`.
      - Events and lines:
        - `import-deque`(1), `import-list`(2), `class`(4), `call`(5), `init`(6), `j`(7), `dq`(8)
        - `for-i`(9), `cnt`(10), `merge-check`(11, condition), `pop`(12), `raise`(13), `grow`(14), `push`(15)
        - `budget-check`(16, condition), `drop`(17), `dec`(18), `empty-check`(19, condition), `pop-group`(20), `shift-j`(21), `count`(22)
        - `for-done`(9), `return`(23, final)
      - Step notes, each at most 28 characters in both languages. Use these or something close; the worst case is k = 999 with cost up to 171:
        - L1 "Nhập deque." / "Import deque."; L2 "Kiểu List." / "Type hints."; L4 "Định nghĩa lớp." / "Class defined."
        - L5 `${n} số, k = ${k}.` / `${n} nums, k = ${k}.`; L6 "Chưa đếm, chưa tốn." / "No count, no cost yet."
        - L7 `j = ${j}: mép phải.` / `j = ${j}: right edge.`; L8 "Deque rỗng." / "Empty deque."
        - L9 `i = ${i}: thêm bên trái.` / `i = ${i}: add on the left.`; L10 "Nhóm mới: 1 ô." / "New group: 1 cell."
        - L11 when true: `${level} ≤ ${x} → gộp.` / `${level} ≤ ${x} → merge.`; when false: "Dừng gộp." / "No merge."
        - L12 `Lấy nhóm ${level}×${c}.` / `Pop group ${level}×${c}.`; L13 `Tô thêm ${d} ô.` / `Fill +${d} cells.`
        - L14 `Nhóm dài ${cnt}.` / `Group size ${cnt}.`; L15 `Mức ${x} × ${cnt}.` / `Level ${x} × ${cnt}.`
        - L16 when true: `${cost} > ${k}: quá ngân sách.` / `${cost} > ${k}: over budget.`; when false: `${cost} ≤ ${k}: đủ ngân sách.` / `${cost} ≤ ${k}: fits budget.`
        - L17 `Bỏ ô ${j}: −${d}.` / `Drop cell ${j}: −${d}.`; L18 "Nhóm cuối bớt 1." / "Last group −1."
        - L19 when true: "Nhóm rỗng → xoá." / "Group empty → pop."; when false: "Nhóm còn ô." / "Group not empty."; L20 "Xoá nhóm cuối." / "Pop last group."
        - L21 `j = ${j}.`; L22 `+${len} đoạn → ${ans}.` / `+${len} subarrays → ${ans}.`; L9-done "Hết vòng i." / "Loop done."; L23 `Kết quả: ${ans}.` / `Answer: ${ans}.`
        Titles are the executed expression with numbers filled in, for example `cost += (5 - 1) * 1`.
      - Problem fields:
        - `id: 3420` (a number, not a string), `difficulty: "hard"`, `slug: "count-non-decreasing-subarrays-after-k-operations"`, the category and tags from "Names".
        - `title: bi("Count Non-Decreasing Subarrays After K Operations", same)`, `titleVi: bi("Đếm đoạn không giảm sau ≤ k lần +1", "Count subarrays fixable with ≤ k +1s")`.
        - A two-sentence `statement` in vi and en, which states the visualization limits.
        - `defaultInput`, `inputLabel: bi("nums · tối đa 10 số (1–20)", "nums · up to 10 values (1–20)")`, `extraParams`, `debugMode: "line-by-line"`.
        - A three-line `approach`: scan i right to left over the window [i, j]; the deque holds [level, count] groups and the cost is the shaded fill; while cost > k, drop j; each i adds j−i+1.
        - `complexity: { time: "O(n)", space: "O(n)", note: bi("Cách khác: segment tree / sparse table + tìm nhị phân, O(n log n).", "Alternative: segment tree / sparse table + binary search, O(n log n).") }`.
        - `code: [...SOURCE_3420]`, `builder: buildSteps3420`, `liveArgs: (input, params) => { const { nums, k } = parseInput3420(input, params); return [nums, k]; }`.
      The builder returns `{ input, answer, steps }`.
      Files: `leetcode-visualizer/problems/count-nondecreasing-3420.js`
      Verify: `node -e "const m=require('./problems/count-nondecreasing-3420.js')[3420];for(const[a,k]of[[[4,1,5,2,6,3,7,1],5],[[6,3,1,2,4,4],7],[[6,3,1,3,6],4],[[3,1,2],1],[[1,2,3,4],1]])console.log(m.builder(a,{k}).answer)"` run in `leetcode-visualizer` prints 21, 17, 12, 4, 10.

- [ ] 2. Register the module and update the Segment Tree counts. This step depends on step 1.
      - In `problems/index.js` line 15 (the `sliding: Object.assign(...)` entry), append `, require("./count-nondecreasing-3420")` before the closing `)`.
      - In `tests/segment-tree-tag.test.js`, change `assert.equal(available.length, 42)` to 43 and `...available).length, 42)` to 43 (lines 26 and 41), and change `!problem.available).length, 45)` to 44 (line 42).
      Files: `leetcode-visualizer/problems/index.js`, `leetcode-visualizer/tests/segment-tree-tag.test.js`
      Verify: `node --test tests/segment-tree-tag.test.js` passes 3/3, and `node -e "const{SUPPORTED:S,SEGMENT_TREE_TAG:T}=require('./problems');const p=S[3420];console.log(typeof p.id,p.category.key,p.tags.includes(T))"` prints `number sliding true`.

- [ ] 3. Create the renderer `public/renderer-count-nondecreasing-3420.js`, modeled on `public/renderer-car-pooling-1094.js`.
      - Structure: `ND3420_LINE_COUNT = 23`, the frozen `ND3420_CASES` from the preset table, and `ND3420_COPY` with vi/en strings.
        Copy the 1094 helpers under nd3420 names: escape, `IsVi`, `Int`, and a `Normalize` that validates every view field and drops malformed data. Also add `Picture`, `Effect`, `Code`, `Next`/`Go`/`Bind` and `renderNonDecreasing3420View(step)`, which writes `#treeView`.
      - SVG picture `nd3420-svg` on one index axis, `x(t) = PAD_L + t*unit`, with `unit = max(34, min(44, floor(420/n)))`, drawn top to bottom:
        (a) Chart, with `unitH = min(14, 130/maxVal)`:
           - One bar per value, `rect.nd3420-bar[data-bar=t]`, with class `is-in` (window cell), `is-out`, `is-i` or `is-j`.
           - A fill rect `rect.nd3420-fill[data-fill=t]` from the bar top up to `lvl[t]`, only when `lvl[t] > nums[t]`. This shaded area is the cost.
           - A level line `line.nd3420-level[data-level=k]` across each span's columns at its level. `pending` is dashed, and `popped` is faded with class `is-popped`.
        (b) The axis line.
        (c) A `nums` cell row: `rect.nd3420-cell[data-cell=t]` with the value inside, plus a row label `nums` on the left.
        (d) The window bracket `rect.nd3420-window` from i to j (only when i is not null), with an `i` and a `j` text under their columns. Write a single `i=j` text when they are the same column.
        (e) A `dq` row: one chip per span, `rect.nd3420-chip[data-chip=k]` spanning that span's columns, with text `level×count`. Add class `is-pending` (dashed), `is-popped` (faded) or `is-front`/`is-back` for `dq[0]`/`dq[-1]`, plus a row label `dq`.
        The SVG `aria-label` is `${n} số, k = ${k}` / `${n} nums, k = ${k}`, or `Kết quả ${ans}` / `Answer ${ans}` on the final step.
      - HTML cards below the picture:
        - The budget meter `div.nd3420-meter[data-cost][data-k]`. Its fill width is `cost/scale`, with class `is-ok` when cost ≤ k and `is-over` when cost > k. A k tick marks the limit, and a label reads `cost ${cost} / k ${k}`.
          Use 1094's off-scale rule: `offScale = k > max(ceil(1.5*peakCost), peakCost+2)`, `scale = offScale ? peakCost+1 : max(peakCost, k, 1)`. When off-scale, pin the k tick at `scale` with a dotted style (`is-off-scale`) and label it `→${k}`.
        - The counter `div.nd3420-count` shows the big `ans` number, with a `+${added}` badge on line 22.
      - The strip `cp1094Code` pattern becomes `<div class="nd3420-now" data-code-line="L" aria-current="step"><span class="nd3420-lineno">L{line}</span>`, followed by the effect text (for example `cost = 4`, `dq.popleft() → [1, 1]`, `j = 5`) and a True/False badge for lines 11, 16 and 19.
        Do not print the source or the locals in the view. The source is in `#codePanel` and the locals are in Variables.
      - Header: `LEETCODE 3420 · NON-DECREASING SUBARRAYS`. The heading shows `i = …, j = …`, `return ${ans}` on the final step, or `countNonDecreasingSubarrays(nums, ${k})`. The status chip shows `ans ${ans}`.
      - Preset buttons use `data-nd3420-case`. The bind handler sets `arrInput.value = preset[0]` and `#param-k.value = preset[1]`, then calls `runViz()`.
      - Jump buttons use `data-nd3420-jump`, labelled "Dòng →" / "Line →", "i kế →" / "Next i →" (the next `for-i` step) and "Kết quả ↠" / "Result ↠".
      - The article is `article.nd3420-viz[data-problem-id="3420"][data-source-line=L]` with `aria-label="LeetCode 3420 · dòng L"` / `"… · line L"`.
      - All picture text is 11px monospace. Keep the natural SVG width at or below 500.
      Files: `leetcode-visualizer/public/renderer-count-nondecreasing-3420.js`
      Verify: covered by the render, geometry and aria tests in step 6.

- [ ] 4. Create `public/count-nondecreasing-3420.css`, modeled on `public/car-pooling-1094.css`.
      - Dark tokens go on `.nd3420-viz { --nd3420-bg … }`, and light tokens on `[data-theme="light"] .nd3420-viz { … }`.
        - Status colors: `--nd3420-green` (cost ≤ k), `--nd3420-red` (cost > k), `--nd3420-amber` (the k tick and line numbers). Reuse the 1094 values.
        - Picture colors: `--nd3420-bar` (in-window bar), `--nd3420-out` (dimmed bar), `--nd3420-fill` (the shaded fill-up, for example a cyan-blue at 55% opacity with a dashed top edge), `--nd3420-level` (level line and chip edge, for example magenta), `--nd3420-cur` (i, purple), `--nd3420-j` (j, for example a teal clearly apart from green), `--nd3420-on-bar` (text on chips).
        - Every picture color must be more than 60 apart in RGB distance from each status color, and from every other picture color except the bar/out pair, in both themes.
      - Classes for every element in step 3. Popped chips and level lines use opacity plus a dash pattern, so the state does not rely on color alone.
      - Page-scoped code-panel rules, copied from 1094 lines 437-455 with `.nd3420-viz`:
        - `body:has(#treeView:not(.hidden) .nd3420-viz) #codePanel { position: static; max-height: none; overflow-y: visible; }`
        - `.code-line { width: auto; min-width: 0; white-space: pre-wrap; }`
        - `.code-line .txt { flex: 1 1 auto; min-width: 0; white-space: pre-wrap; overflow-wrap: anywhere; }`
        - `#stepNote { font-size: 13px }`
        Line 5 is 74 characters and must wrap, not clip.
      - Add a `@container nd3420 (max-width: 420px)` rule for the heading size.
      Files: `leetcode-visualizer/public/count-nondecreasing-3420.css`
      Verify: covered by the color and wiring tests in step 6.

- [ ] 5. Wire the assets. This step depends on steps 3 and 4.
      - In `public/index.html`, after line 220, add `<link rel="stylesheet" href="count-nondecreasing-3420.css?v=count-nondecreasing-3420-v1" data-problem-ids="3420" />`.
      - After line 747, add `<script src="renderer-count-nondecreasing-3420.js?v=count-nondecreasing-3420-v1" data-problem-ids="3420"></script>`.
      - On line 898, append `&nd3420=pictures-v1` to the `script.js?...` query, after `&cp1094=pictures-v1`.
      - In `public/script.js`, after the `carPool1094View` entry (lines 1262-1264) in `ORDERED_RENDERER_REGISTRY`, add
        `{ predicate: (step) => Boolean(step.nonDec3420View), surface: "treeView", render: (step) => {\n      renderNonDecreasing3420View(step);\n    } },`.
      Files: `leetcode-visualizer/public/index.html`, `leetcode-visualizer/public/script.js`
      Verify: `node --test tests/car-pooling-1094.test.js tests/min-groups-2406.test.js` still passes (12/12 and 9/9), which shows the neighboring wiring is intact.

- [ ] 6. Write `tests/count-nondecreasing-3420.test.js` on the 1094 test harness: `vm` renderer loader, `seeded()` RNG, and `svgBoxes`/`hit`/`inside` helpers adapted to nd3420 classes.
      - Write a brute-force helper: for each l, extend r while tracking the running max m, add `m - nums[r]` to the cost, and count when the cost is at most k.
      - Random inputs come from seed 3420: n from 1 to 10, values from 1 to 20, and k from 1 to 40 so both shrinking and non-shrinking runs occur. Add an extreme case with k = 999.
      - Tests:
        1. Identity: `typeof SUPPORTED[3420].id === 'number'`, the id equals 3420, the category is `sliding`, `tags.includes(SEGMENT_TREE_TAG)`, `debugMode` is `line-by-line`, and `extraParams[0].key` is `'k'`.
        2. Answer and invariants on the presets plus 300 random inputs:
           - The answer equals brute force, exactly one step is final, and the final line is 23.
           - On every step: one code line; `cost === Σ(lvl−nums)`; dq levels strictly increase left to right; the spans are contiguous and do not overlap within [window left edge, j]; the dq counts equal the `group` span counts.
           - Every vi and en note is at most 28 characters on every step of every input, including random custom inputs and k = 999.
        3. Coverage: `cases[0]` equals the default (`defaultInput.join(',')` and the k default). The default walks every non-blank line (nothing missing), the presets also cover every line, one preset has 3 values or fewer, and the default has 6 or more.
        4. Displayed Python equals the builder: run `problem.code.join('\n')` with `.venv\Scripts\python.exe`, `process.env.PYTHON` or `python` on the presets plus 50 random inputs, following the `apply-substitutions-3481.test.js` lines 145-149 pattern, and compare with the builder answers.
           Skip with a clear message when no python can be spawned.
        5. Every frame renders in vi and en on every preset:
           - No `undefined`, `NaN`, `Infinity` or `object Object`.
           - `data-source-line` equals the line, there is exactly one `data-code-line` strip, and the source (`def countNonDecreasingSubarrays|appendleft`) does not appear.
           - Element counts: one `data-bar` and one `data-cell` per number; the `data-fill` count equals the count of `lvl[t] > nums[t]`; one `data-chip` per span; one meter; `data-nd3420-case` count equals the preset count; badges on lines 11, 16 and 19.
           - Rendering does not mutate steps.
        6. Geometry, for every step of the presets, 80 random inputs and extremes (`[20,1,1,1,1,1,1,1,1,1]` with k = 999, `[20]`, `[1,20,1,20,1,20,1,20,1,20]` with k = 1, ten 1s):
           - Every box stays inside the viewBox.
           - No two texts overlap, no text overlaps a bar, chip, level line or bracket, and chips do not overlap each other.
           - Each chip label fits inside its chip, and each cell value fits inside its cell.
           - SVG width is at most 500.
        7. Colors, in both themes: every picture token is more than 60 from each status token and from the other picture tokens (except bar/out). `on-bar` is more than 150 from `level` and `cur`. The popped style has `stroke-dasharray`.
        8. aria-labels follow the language for the SVG label and the article label, on both the first and the final step.
        9. Locals appear once: `vars` names equal `['k','i','j','cnt','level','c','cost','dq','ans']` on every step, and the view has no locals block.
        10. `level` and `c` keep their last popped values on later steps, and are `'—'` before the first pop.
        11. Bad inputs throw `/3420/`: `''`, `[]`, `'x'`, `[0]`, `[21]`, `[1.5]`, eleven values, and k values `0`, `1000`, `2.5`, `'x'`. `liveArgs('3,1,2', {k: 1})` deep-equals `[[3,1,2], 1]`.
        12. An off-scale k (`[3,1,2]` with k = 999) pins the k tick (`is-off-scale`, `→999`) and gives a visible fill when cost > 0. A normal k (`[3,1,2]` with k = 1) is not off-scale.
        13. Wiring: the `index.html` link and script carry the `count-nondecreasing-3420-v1` token and `data-problem-ids="3420"`. `readFrontendJavaScript()` matches the registry regex. The CSS has dark and light `--nd3420-bg`, `#codePanel` `max-height: none`, and the `.code-line` and `.txt` pre-wrap rules.
      Files: `leetcode-visualizer/tests/count-nondecreasing-3420.test.js`
      Verify: `node --test tests/count-nondecreasing-3420.test.js tests/segment-tree-tag.test.js` passes every test. Python test 4 runs (not skipped) on this machine, which has Python 3.14.0 and `..\.venv\Scripts\python.exe`.

- [ ] 7. Run the full suite against the baseline.
      Run `node --test` in `leetcode-visualizer` and save the output to `.agents/tasks/count-nondecreasing-3420/full.txt`. Compare the failing test names with `baseline.txt` (49 failures at b75845e).
      If a test fails with `listen EACCES`, rerun just that file and save the result to `rerun.txt`.
      Files: none, only artifacts in the task dir.
      Verify: the failing set equals the baseline 49, or the baseline 49 plus EACCES flakes that pass on rerun. No failing test names 3420, segment-tree, sliding or queue.

- [ ] 8. Write and run the headless Chrome probe `.agents/tasks/count-nondecreasing-3420/cdp-check.js`, copied from `.agents/tasks/viz-1854-1094/cdp-check-1094.js` with its `CODE_PROBE` (vertical and horizontal checks) and its error capture.
      Start the server temporarily on PORT=4420 with Chrome's debugging port at 9420, and stop both afterwards. The user runs their own dev servers, so do not leave one running.
      The probe checks:
      - Catalog: load 3420, then call `openCatalogGroupExclusively('sliding')`. The chip `[data-group-key="sliding"] .prob-chip[data-id="3420"]` exists, is visible and is active.
        Do the same for the `segment-tree` group: the chip is not `unavailable` or disabled. The search chip and the Recent chip are active, and `typeof currentProblemId === 'number'`.
      - For the 5 presets plus 2 custom inputs (`20,1,1,1,1,1,1,1,1,1` with k = 999, and `1,20,1,20,1,20,1,20,1,20` with k = 1), in the dark and light themes (toggle as in the 1094 probe), on every step:
        - The highlighted `#codePanel` line equals `step.codeLines[0]` and the `data-source-line`.
        - getBBox finds no overlaps among texts, bars, chips and level lines, and nothing is clipped by the viewBox.
        - The SVG fits its card and the smallest font is at least 10px.
        - `#codePanel` has `scrollHeight === clientHeight` and `scrollWidth === clientWidth`, with 0 lines clipped vertically or horizontally.
        - The view contains no source text.
      - The default example's covered lines equal all 22 non-blank lines.
      - Screenshots: `shot-dark.png`, `shot-light.png`, and a final-step screenshot in each theme.
      - Report the result to `cdp-report.json`, with 0 console errors.
      - Spot-check pages 2406, 1854, 1094, 416 and 432: each loads and steps with 0 errors and no `.nd3420-viz` element.
      Files: `leetcode-visualizer/.agents/tasks/count-nondecreasing-3420/cdp-check.js` (plus report and screenshots)
      Verify: `BASE=http://localhost:4420/ node .agents/tasks/count-nondecreasing-3420/cdp-check.js` finds 0 mismatches, 0 overlaps or clips, no code-panel scroll in either direction and 0 console errors. Fix any finding in steps 3 and 4, then rerun steps 6 and 8.

- [ ] 9. Commit locally on `main` and do not push.
      Stage only these files:
      - The 4 new files.
      - `problems/index.js`, `public/index.html`, `public/script.js`, `tests/segment-tree-tag.test.js`.
      - The task-dir artifacts: `plan.md`, `baseline.txt`, `cdp-check.js`, `cdp-report.json`, `shot-*.png`.
      Do not stage `full.txt`, which is about 1.2 MB, and do not stage the unrelated modified or untracked files under `min-groups-2406/` and `viz-1854-1094/`.
      Commit message: `feat(3420): new count non-decreasing subarrays page (bars + fill-up shading, deque of levels, k budget meter, line debugger, light/dark)`. The body states the approach, the presets, the limits, the shared changes and the verification numbers, as in commit e0397a9.
      Verify: `git status` shows none of these files as modified, and `git log -1 --stat` lists exactly them.

## Shared-file changes (report all)

- `problems/index.js`: one `require("./count-nondecreasing-3420")` added to the `sliding` Object.assign.
- `public/index.html`: one CSS link and one script tag (`data-problem-ids="3420"`), plus `&nd3420=pictures-v1` on the `script.js` query.
- `public/script.js`: one `ORDERED_RENDERER_REGISTRY` entry.
- `tests/segment-tree-tag.test.js`: available 42→43 (two asserts) and unavailable 45→44, because 3420 now has a page.

## Digest

- `problems/count-nondecreasing-3420.js` (new): structure copied from `problems/car-pooling-1094.js` (226 lines): `SOURCE_*` frozen array, `parseInput*`, `buildSteps*` with an `emit()` that pushes `{title, note, arr:[], highlight:[], mark:[], codeLines:[line], vars, final, <view>}`, and `module.exports = {id: {...}}` plus a non-enumerable `__internals`. Covered by test steps 6.1-6.4 and 6.9-6.11.
- `problems/index.js` line 15: `sliding: Object.assign(require("./sliding"), require("./sliding-advanced"), {2444: …}, require("./sliding-missing"), require("./visible-points-1610"), require("./hard-range-visualizations"), require("./vowel-substrings-3306"), require("./distinct-triplets-1876")),`. Append the new require inside the call.
  - Line 226 has `[3420, …]` in `SEGMENT_TREE_ROSTER_RAW`; leave it unchanged.
  - Lines 508-515 auto-append `SEGMENT_TREE_TAG`, and lines 540-560 normalize it to the canonical object.
  - Covered by `tests/segment-tree-tag.test.js` and test 6.1.
- `tests/segment-tree-tag.test.js`: line 26 `assert.equal(available.length, 42);`, line 41 `…filter((problem) => problem.available).length, 42);`, line 42 `…filter((problem) => !problem.available).length, 45);`. It passes 3/3 today.
- `public/renderer-count-nondecreasing-3420.js` (new): copy from `public/renderer-car-pooling-1094.js`. It has `CP1094_CASES` presets, a `Normalize` validator, the SVG `Picture` with a `cp1094N` rounding helper, `Effect`/`Code` for the strip (`<div class="cp1094-now" data-code-line=… aria-current="step">`), `Next(kind)` over `steps` and `stepIndex`, `Go`/`Bind` (clicks plus Enter/Space keydown), and the preset handler that sets `arrInput` and `param-<key>` and then calls `runViz()`. The render function writes `#treeView` innerHTML. Covered by tests 6.5-6.8 and 6.12.
- `public/count-nondecreasing-3420.css` (new): copy from `public/car-pooling-1094.css`. Line 2 has the `.cp1094-viz {` dark tokens and `container: cp1094 / inline-size`, line 35 has the `[data-theme="light"] .cp1094-viz {` tokens, and lines 437-455 have the `body:has(#treeView:not(.hidden) .cp1094-viz) #codePanel` / `.code-line` / `.code-line .txt` rules. Covered by tests 6.7 and 6.13.
- `public/index.html`: line 220 has `<link rel="stylesheet" href="car-pooling-1094.css?v=car-pooling-1094-v1" data-problem-ids="1094" />`, line 747 has `<script src="renderer-car-pooling-1094.js?v=car-pooling-1094-v1" data-problem-ids="1094"></script>`, and line 898's `script.js?...` query ends `&mg2406=pictures-v1&mp1854=pictures-v1&cp1094=pictures-v1"`. Covered by test 6.13.
- `public/script.js`: `ORDERED_RENDERER_REGISTRY` starts at line 78. Lines 1262-1264 hold `{ predicate: (step) => Boolean(step.carPool1094View), surface: "treeView", render: (step) => {\n      renderCarPooling1094View(step);\n    } },`. Covered by test 6.13 through `readFrontendJavaScript()` from `tests/helpers/frontend-source`.
- `tests/count-nondecreasing-3420.test.js` (new): harness from `tests/car-pooling-1094.test.js`, which uses `renderer(lang)` via `vm` with a `{ getElementById: () => host }` document, `seeded()`, `svgBoxes`, `hit`, `inside`, and the color `distance` test. The Python-exec pattern comes from `tests/apply-substitutions-3481.test.js` lines 145-149.
- Input path: with no `inputKind`, `app-core.js` `runViz` (lines 2783-2860) parses `arrInput` as comma-separated integers into a number array and sends `params` from `[data-param]` inputs as numbers. The builder also accepts strings, for tests and liveArgs.
- Verified during planning:
  - `node --test tests/segment-tree-tag.test.js` passes 3/3 at b75845e.
  - The baseline has 49 failing tests out of 3137 (`baseline.txt`).
  - The JS transcription of the Python code equals brute force on all 5 presets. The default `4,1,5,2,6,3,7,1` with k = 5 hits every non-blank line in 100 steps.
  - Python 3.14.0 and `..\.venv\Scripts\python.exe` are available.
  - Test command: `node --test <files>` in `leetcode-visualizer`; full suite: `node --test`.
