# Implementation Plan: LeetCode 1970 page (Last Day Where You Can Still Cross)

Work on `main` (HEAD 7f6c70f) in `c:\Users\david.truong\OneDrive - Captive-Aire Systems\Documents\Learn Python\LearnPython\leetcode-visualizer`. Commit locally, never push. The user starts dev servers; any server or Chrome this plan starts is temporary and must be stopped.

Baseline (recorded by the setup step, `baseline.md` in this folder): `node --test --test-reporter=tap "tests/*.test.js"` → 3219 tests, 3167 pass, 52 fail. Compare failing test names against that list.

## What exists today

- `problems/union-find.js` line 6593 `buildSteps1970(input, params = {})` (ends at line 6665, right before the `// ─── 2316` comment) and the config `1970: { … }` at lines 7991-8015, inside the `Object.assign(module.exports, { 1970: …, 2316: … })` block that starts at line 7990.
- The builder reads `rows`/`cols` from `params` (default 2), parses `r,c;r,c` 1-based cells, does reverse union-find with union-by-size, and emits generic steps with `bfsGrid` (rendered by the shared `renderBfsGrid`, surface `bfsGridView`, registry entry `public/script.js` line 1428). Steps cover several code lines each (`codeLines: [5, 6, 7]`) and notes are 40-100 characters.
- The `code` array has the pseudo-code line `union(cell, top/bottom/neighbors)` and no `find`/`union` definitions, so it cannot run in the live editor.
- Config: `extraParams` rows/cols, `defaultInput: "1,1;2,1;1,2;2,2"`, no `tags`, no `debugMode`, no `liveArgs`, no `code2`.
- 1970 is not referenced by any test, any other problem module, `index.js` override, or `core-custom-visualization-upgrades.installUnionFind` (that only touches 684). No 1970 renderer/CSS exists. So the page uses the generic `bfsGrid` view today.

## Chosen approach: reverse union-find only (no `code2`)

- It is what the page already teaches, and it is the approach that gives the pictures the user asked for: land/water grid, the day being undone, components colored by root, parent arrows, and the virtual TOP/BOTTOM nodes joining.
- Binary search + BFS would add a second builder, a second picture (lo/hi/mid timeline + BFS wave), and roughly 2x the steps and tests, with no new union-find idea. The user did not ask for a second approach, and in 9025 they asked explicitly when they wanted more. The complexity note names it as the alternative in one line, and it can be added later as `code2`/`builder2` (the 9025 convention: `extraParams` `approach` select, `code2`, `code2Label`, `builder2`, `complexity2`, `codeBlock` on steps) if the user asks.

## Python code shown (`SOURCE_1970`, 31 lines; lines 2, 8, 14, 17 are blank; 27 executable lines)

```
 1 from typing import List
 2
 3 class Solution:
 4     def latestDayToCross(self, row: int, col: int, cells: List[List[int]]) -> int:
 5         top, bottom = row * col, row * col + 1
 6         parent = list(range(row * col + 2))
 7         land = [[False] * col for _ in range(row)]
 8
 9         def find(x: int) -> int:
10             while parent[x] != x:
11                 parent[x] = parent[parent[x]]
12                 x = parent[x]
13             return x
14
15         def union(a: int, b: int) -> None:
16             parent[find(a)] = find(b)
17
18         for day in range(len(cells) - 1, -1, -1):
19             r, c = cells[day][0] - 1, cells[day][1] - 1
20             land[r][c] = True
21             cell = r * col + c
22             if r == 0:
23                 union(cell, top)
24             if r == row - 1:
25                 union(cell, bottom)
26             for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
27                 nr, nc = r + dr, c + dc
28                 if 0 <= nr < row and 0 <= nc < col and land[nr][nc]:
29                     union(cell, nr * col + nc)
30             if find(top) == find(bottom):
31                 return day
```

- There is no trailing `return 0`. With row, col ≥ 2 and `cells` covering every cell, the state at `day = 0` is all land, so line 30 is always true by then and the loop always returns. A `return 0` line could never execute and would break "every line is walked".
- Indexing: loop index `day` (0-based) restores `cells[day]`; afterwards cells[0..day-1] are water, which is the grid on (1-based) day `day`, so `return day` is the answer.
- Union has no rank: `parent[find(a)] = find(b)` (the root of `a` points to the root of `b`). With path halving this is O(log) amortized, enough for ≤ 24 cells, and keeps the code short.
- During planning I ran a JS transcription of exactly this trace against a brute force (BFS on each day 0..n, keep the last day with a top-to-bottom land path) on 3000 random permutations (R, C in 2..6, R·C ≤ 24): 0 mismatches, max 1026 steps. All five presets below walk all 27 executable lines.

## Trace (one step per executed line, emitted by `emit({ line, event, title, note, condition, final })`)

- Header: 1 `import`, 3 `class`, 4 `call` (title `latestDayToCross(3, 3, cells)`), 5 `top-bottom`, 6 `parent`, 7 `land`, 9 `def-find`, 15 `def-union`.
- `find(x)` trace: 9 `find-call` (title `find(4)`), then repeat { 10 `find-check` (condition true), 11 `halve`, 12 `up` }, then 10 `find-check` (false), 13 `find-return`.
- `union(a, b)` trace: 15 `union-call` (title `union(4, 9)`), 16 `link-start`, find(a) trace, find(b) trace, 16 `link` (title `parent[ra] = rb` with numbers; when ra === rb the event is still `link` with `same: true`).
- Per loop day (from n-1 down): 18 `for-day`, 19 `cell-rc`, 20 `to-land`, 21 `cell-id`, 22 `top-check` (cond) [23 `join-top` + union(cell, top)], 24 `bottom-check` (cond) [25 `join-bottom` + union(cell, bottom)], then for each of the 4 directions: 26 `for-dir`, 27 `neighbor`, 28 `nb-check` (cond) [29 `join-nb` + union(cell, nb)]; then 26 `for-dir-done`; 30 `cross-start`, find(top) trace, find(bottom) trace, 30 `cross-check` (cond); if true 31 `return` (final), else the next 18.
- Step counts: default 281, presets 102 / 155 / 338 / 520.

## Presets (`LC1970_CASES` in the renderer: `[input, viLabel, enLabel]`; the first one is the default)

| # | input | answer | steps | vi / en | purpose |
|---|-------|--------|-------|---------|---------|
| 0 | `3,3 \| 1,2;2,1;3,3;2,2;1,1;1,3;2,3;3,2;3,1` | 3 | 281 | Ví dụ / Example | LeetCode example 3; TOP, BOTTOM and neighbor joins, path halving |
| 1 | `2,2 \| 1,1;2,1;1,2;2,2` | 2 | 102 | Ngắn / Short | LeetCode example 1 (= the old default) |
| 2 | `2,2 \| 1,1;1,2;2,1;2,2` | 1 | 155 | Ngày 1 / Day 1 | LeetCode example 2 |
| 3 | `3,5 \| 2,3;1,1;3,5;2,1;2,5;1,3;3,1;2,2;2,4;1,2;3,3;1,4;1,5;3,2;3,4` | 8 | 338 | Rộng / Wide | wide grid |
| 4 | `4,4 \| 2,2;3,3;1,4;4,1;2,3;3,2;1,1;4,4;2,4;3,1;1,2;4,3;2,1;3,4;1,3;4,2` | 5 | 520 | Lớn / Bigger | deeper find chains |

Module constant `DEFAULT_INPUT_1970 = "3,3 | 1,2;2,1;3,3;2,2;1,1;1,3;2,3;3,2;3,1"`.

Input format: `R,C | cells`, where cells is `r,c;r,c;…` (`;` or newline) or JSON `[[r,c],…]`, all 1-based. Limits: R and C integers 2-6, R·C ≤ 24, cells is a permutation of every cell (length R·C, each in range, no repeats; LeetCode guarantees this). Legacy fallback: an input without `|` is just the cells, and R, C come from `params.rows || params.row` and `params.cols || params.col`, default 2 each, so the old default `"1,1;2,1;1,2;2,2"` with no params still builds (answer 2).

## Names

- Prefix `lc1970`. View key `cross1970View`. Renderer `renderLastDayCross1970View(step)`. Cache token `last-day-cross-1970-v1`. Script query flag `&lc1970=pictures-v1`.
- New files: `public/renderer-last-day-cross-1970.js`, `public/last-day-cross-1970.css`, `tests/last-day-cross-1970.test.js`.
- The shared `renderBfsGrid` stays untouched; 1970 simply stops emitting `bfsGrid`.

---

- [ ] 1. Rewrite the 1970 builder and config in `problems/union-find.js`. Touch only the `buildSteps1970` function (lines 6593-6665) and the `1970: { … }` entry (lines 7991-8015); every other problem in the file stays byte-identical. Model the structure on the 3161 section of `problems/binary-search.js` (search `SOURCE_3161`, `parseQueries3161`, `buildSteps3161`, `__internals3161`).
      - Above `buildSteps1970`: a local `bi1970(vi, en)` returning `{ vi, en }` (union-find.js has no `bi`), frozen `SOURCE_1970` (the 31 lines above, verbatim), `DEFAULT_INPUT_1970`, `MIN_SIDE_1970 = 2`, `MAX_SIDE_1970 = 6`, `MAX_CELLS_1970 = 24`.
      - `parseInput1970(input, params = {})` returns `{ row, col, cells }` (fresh arrays, cells 1-based `[r, c]`). Source string: `input` if it is a non-empty string, else `DEFAULT_INPUT_1970`. Split on the first `|`; without `|` use the legacy params rule above. Throw `Error` with a message starting `1970:` for: R or C not an integer, outside 2-6, R·C > 24, malformed JSON, a cell that is not two integers, a cell out of range, a repeated cell, cell count ≠ R·C.
      - `buildSteps1970(input, params = {})` follows the trace section. Each step: `title`/`note` (bi), `arr: []`, `highlight: []`, `mark: []`, `codeLines: [line]`, `final`, `vars`, `cross1970View`. No `bfsGrid`, no `sub`. Returns `{ input, answer, steps }`.
        - `vars`, in this order on every step: `top, bottom, day, r, c, cell, dr, dc, nr, nc, a, b, x, parent`. `"—"` until assigned. `top`/`bottom` from line 5 on, `parent` from line 6 on, as a Python list `[0, 1, 9, …]`. `day, r, c, cell, dr, dc, nr, nc` keep their last values (Python loop variables leak). `a`, `b` show only inside a `union` call (from its line-15 call step through its closing line-16 `link` step, including the nested finds); `x` shows only inside a `find` call (lines 9-13 of that call). Outside those frames they are `"—"`. The def steps (events `def-find`, `def-union`) show `"—"` for `a, b, x`. `land` is not in `vars`: the grid picture is `land`. `row`, `col`, `cells` are not listed (constant inputs, shown in the heading).
        - `cross1970View` is a deep copy (`JSON.parse(JSON.stringify(...))`) of:
          `{ version: 1, problemId: 1970, line, event, condition, row, col, n, cells, dayOf, curDay, land, parent, roots, cur, nb, nbState, walk, x, a, b, linked, rootTop, rootBottom, crossed, route, answer, final }`
          - `row`, `col`, `n = row*col`; `cells`: the 1-based input list; `dayOf[id]`: the 1-based day cell `id` floods (fixed).
          - `curDay`: the loop `day` (null before line 18). `land`: flat booleans by cell id. `parent`: copy (null before line 6). `roots[id]`: the root of every land cell computed without path compression (display only, so drawing never mutates `parent`), null for water cells.
          - `cur`: the cell id restored this day (from line 19 on, null before). `nb`: the neighbor id on lines 27-29 when in range, else null; `nbState`: `"out"`, `"water"`, `"land"` on lines 27-29, else null.
          - `walk`: ids visited so far by the current `find` call, in order (top = n, bottom = n+1); `x`: the current `x` inside `find`, else null. `a`, `b`: union arguments inside a union call, else null. `linked`: `[ra, rb]` on the `link` step only, else null.
          - `rootTop`, `rootBottom`: `roots` of the virtual nodes (always set from line 6 on). `crossed`: true on `cross-check` true and on the final step. `route`: on those steps, a shortest land path of cell ids from the top row to the bottom row (BFS over `land`, display only, ties broken by id order), else null. `answer`: the result on the final step, else null.
        - Notes, each at most 28 characters in both languages with two-digit numbers (r, c, nr, nc are the 0-based code values; days in notes are the code's `day` except where it says `day + 1`):
          - L1 "Kiểu List." / "Type hints."; L3 "Định nghĩa lớp." / "Class defined."; L4 `Lưới ${R}×${C}, ${n} ngày.` / `${R}×${C} grid, ${n} days.`; L5 `TOP=${top}, BOTTOM=${bottom}.` (both); L6 "Mỗi nút tự làm gốc." / "Each node is its own root."; L7 "Ngày cuối: toàn nước." / "Last day: all water."
          - L9 def "Định nghĩa find." / "find defined."; call `find(${x})` (both). L10 true `${x} chưa là gốc.` / `${x} is not a root.`; false `${x} là gốc.` / `${x} is the root.`. L11 `Nén: cha ${x} = ${p}.` / `Halve: parent ${x} = ${p}.`. L12 `Lên ${x}.` / `Up to ${x}.`. L13 `Gốc = ${x}.` / `Root = ${x}.`
          - L15 def "Định nghĩa union." / "union defined."; call `union(${a}, ${b})`. L16 start "Tìm hai gốc." / "Find both roots."; link `Gốc ${ra} → ${rb}.` / `Root ${ra} → ${rb}.`; same `Đã chung gốc ${rb}.` / `Same root ${rb}.`
          - L18 `Hoàn tác ngày ${day + 1}.` / `Undo day ${day + 1}.`; L19 `Ô (${r}, ${c}).` / `Cell (${r}, ${c}).`; L20 "Ô thành đất." / "Cell becomes land."; L21 `Mã ô = ${cell}.` / `Cell id = ${cell}.`
          - L22 true "Hàng trên cùng." / "Top row."; false "Không ở hàng trên." / "Not in the top row.". L23 "Nối với TOP." / "Join TOP.". L24 true "Hàng dưới cùng." / "Bottom row."; false "Không ở hàng dưới." / "Not in the bottom row.". L25 "Nối với BOTTOM." / "Join BOTTOM."
          - L26 `Hướng (${dr}, ${dc}).` / `Direction (${dr}, ${dc}).`; done "Hết 4 hướng." / "All 4 directions done.". L27 `Hàng xóm (${nr}, ${nc}).` / `Neighbor (${nr}, ${nc}).`. L28 land "Đất kề: nối." / "Land next door: join."; out "Ngoài lưới." / "Outside the grid."; water "Ô nước, bỏ qua." / "Water, skip.". L29 `Nối ${cell} với ${nb}.` / `Join ${cell} with ${nb}.`
          - L30 start "TOP nối BOTTOM?" / "TOP joined to BOTTOM?"; true `Cùng gốc ${t}: qua được!` / `Same root ${t}: crossing!`; false `Gốc ${t} ≠ ${b}.` / `Roots ${t} ≠ ${b}.`. L31 `Đáp án: ngày ${day}.` / `Answer: day ${day}.`
          Titles are the executed expression with values filled in, for example `land[1][2] = True`, `union(5, 9)`, `parent[4] = 9`, `find(9) == find(10)`.
      - Config fields: keep `id: 1970` (number), `difficulty: "hard"`, `slug`, `category: UF_CAT`, `title`. Set:
        - `titleVi: bi1970("Ngày cuối còn đi qua được (Union-Find ngược)", "Last day you can still cross (reverse Union-Find)")`.
        - `statement`: two sentences per language: the rules (grid starts as land, day i floods cells[i], walk 4 directions from the top row to the bottom row on land, return the last such day) and the visualization limits/format (`R,C | r,c;…`, 1-based, R and C 2-6, ≤ 24 cells, every cell listed once).
        - `defaultInput: DEFAULT_INPUT_1970`, `inputKind: "string"`, `inputLabel: bi1970("R,C | cells r,c;… (1-based, R,C ≤ 6, ≤ 24 ô)", "R,C | cells r,c;… (1-based, R,C ≤ 6, ≤ 24 cells)")`. Remove `extraParams`.
        - `debugMode: "line-by-line"`.
        - `approach` (3 items): go back in time from the last day, so each step turns one water cell into land; union it with land neighbors and with virtual TOP (row 0) / BOTTOM (last row); the first time find(TOP) == find(BOTTOM), that `day` is the answer.
        - `complexity: { time: "O(R·C·log(R·C))", space: "O(R·C)", note: bi1970("Nén nửa đường, không xếp hạng. Cách khác: chặt nhị phân ngày + BFS, cùng độ phức tạp.", "Path halving, no rank. Alternative: binary search on the day + BFS, same complexity.") }`.
        - `code: [...SOURCE_1970]`, `builder: buildSteps1970`, `liveArgs: (input, params) => { const p = parseInput1970(input, params); return [p.row, p.col, p.cells]; }`.
      - After the `Object.assign` block that holds 1970 (it ends after the 2316 entry; find its closing `});`), add `Object.defineProperty(module.exports[1970], "__internals1970", { enumerable: false, value: { parseInput1970, SOURCE_1970, DEFAULT_INPUT_1970, MIN_SIDE_1970, MAX_SIDE_1970, MAX_CELLS_1970 } })`.
      Files: `leetcode-visualizer/problems/union-find.js`
      Verify: in `leetcode-visualizer`, `node -e "const m=require('./problems').SUPPORTED[1970];for(const q of['3,3 | 1,2;2,1;3,3;2,2;1,1;1,3;2,3;3,2;3,1','2,2 | 1,1;2,1;1,2;2,2','2,2 | 1,1;1,2;2,1;2,2','3,5 | 2,3;1,1;3,5;2,1;2,5;1,3;3,1;2,2;2,4;1,2;3,3;1,4;1,5;3,2;3,4','4,4 | 2,2;3,3;1,4;4,1;2,3;3,2;1,1;4,4;2,4;3,1;1,2;4,3;2,1;3,4;1,3;4,2','1,1;2,1;1,2;2,2']){const r=m.builder(q);console.log(r.answer,r.steps.length)}"` prints `3 281`, `2 102`, `1 155`, `8 338`, `5 520`, `2 102`. Then `node --test tests/provinces-547.test.js` (another union-find page module) still passes.

- [ ] 2. Create `public/renderer-last-day-cross-1970.js`, modeled on `public/renderer-block-placement-3161.js` (its `Escape`, `IsVi`, `Int`/`Ints`/`Bools`, `Normalize`, `Layout`, `Picture`, `Effect`, `Code`, `Next`/`Go`/`Bind`, render function). Depends on step 1 for the view shape.
      - `LC1970_LINE_COUNT = 31`, frozen `LC1970_CASES` (preset table), `LC1970_COPY` (vi/en strings).
      - `lc1970Normalize(step)` validates every view field (ints in range, arrays of ints/booleans of the right length, `nbState` in the 3 strings) and drops malformed data.
      - SVG `svg.lc1970-svg`, all text 11px monospace, rows top to bottom:
        (a) Timeline: one `rect.lc1970-daybox[data-day=d]` per day d = 1..n with `text.lc1970-day-label` = d, box width `min(32, floor(440 / n))` (≥ 18 at n = 24). Classes: `is-water` (still flooded: d ≤ curDay, or all boxes before line 18), `is-back` (already restored), `is-cur` (d = curDay + 1 from line 18 of that day on), `is-answer` (d = answer, final step) with `text.lc1970-answer-mark` "✓" above it. Row caption `text.lc1970-caption` "← ngược thời gian" / "← back in time" left-aligned above the boxes.
        (b) TOP bar `rect.lc1970-bar.is-top[data-node=n]` above the grid spanning the grid width, label `TOP`; BOTTOM bar `rect.lc1970-bar.is-bottom[data-node=n+1]` below, label `BOTTOM`. Bars get `is-walk`/`is-x` like cells, and `is-crossed` when `crossed`.
        (c) Grid: cell size 44, a left margin of 28 for the TOP↔BOTTOM connector. One `rect.lc1970-cell[data-cell=id]` per cell with `text.lc1970-cell-label` = its flood day `dayOf[id]` (the input meaning, so the timeline box and the cell share a number). Fill classes: `is-water` (water token fill plus a `stroke-dasharray` border, so the state does not rely on color alone), land cells `is-top-comp` when `roots[id] === rootTop`, `is-bottom-comp` when `=== rootBottom` (top wins when crossed), else `is-comp-k` with `k = roots[id] % 4`. Outline classes: `is-cur` (restored cell), `is-nb` (neighbor on lines 27-29, dashed), `is-walk` (in `walk`), `is-x` (current `x`), `is-route` (in `route`, thick path-color inner border).
        (d) Parent arrows: for every node i (cells and the two bars) with `parent[i] !== i`, `line.lc1970-link[data-from=i][data-to=parent[i]]` with an arrowhead marker; cell endpoints are the cell center moved 15 px toward the other end; a bar endpoint is the bar edge in the column of the cell at the other end; bar↔bar is a `path.lc1970-link.is-bars` along the left margin. Class `is-new` on the arrow set by this step (line 11 halve, line 16 link), `is-walk` on arrows between consecutive `walk` ids. Draw links before the cell labels; labels use `paint-order: stroke` halo so they stay readable over a link.
        SVG `aria-label`: `Lưới ${row}×${col}, ngày ${curDay}` / `${row}×${col} grid, day ${curDay}` (use `n` before line 18), and on the final step `Đáp án: ngày ${answer}` / `Answer: day ${answer}`.
      - Current-line strip (same contract as 3161): `<div class="lc1970-now" data-code-line="L" aria-current="step"><span class="lc1970-lineno">L{line}</span>` + effect code (for example `land[1][2] = True`, `parent[4] = 9`, `x = 9`, `cell = 5`, `nr, nc = 2, 1`, `return 3`) + a True/False badge `b.lc1970-branch` on lines 10, 22, 24, 28, 30 (only on the condition steps: `find-check`, `top-check`, `bottom-check`, `nb-check`, `cross-check`). Do not print the source or the locals in the view.
      - Header `LEETCODE 1970 · LAST DAY TO CROSS`; heading `latestDayToCross(${row}, ${col}, cells)`, or `return ${answer}` on the final step; status chip `ngày ${curDay}` / `day ${curDay}` (or `—`), `TOP ↔ BOTTOM ✓` when `crossed`.
      - Preset buttons `button[data-lc1970-case=i]`: set `#arrInput.value = preset[0]`, then `runViz()`. Jump buttons `data-lc1970-jump`: "Dòng →" / "Line →" (next step), "Ngày →" / "Next day →" (next `for-day` step), "Kết quả ↠" / "Result ↠" (final).
      - Legend `div.lc1970-legend`: icon + 2-3 words each: water, land, TOP, BOTTOM, parent arrow, crossing path.
      - Article `article.lc1970-viz[data-problem-id="1970"][data-source-line=L]`, `role="region"`, `aria-label="LeetCode 1970 · dòng L"` / `"… · line L"`. Render into `#treeView` the way the 3161 renderer does.
      Files: `leetcode-visualizer/public/renderer-last-day-cross-1970.js`
      Verify: covered by the render, geometry and aria tests in step 5.

- [ ] 3. Create `public/last-day-cross-1970.css`, modeled on `public/block-placement-3161.css` plus the hanging-indent block from `public/youtube-trending-9025.css` lines 499-546.
      - Dark tokens on `.lc1970-viz { --lc1970-bg … }` with `container: lc1970 / inline-size`; light tokens on `[data-theme="light"] .lc1970-viz { … }`.
        - Status: `--lc1970-green` (True, crossing), `--lc1970-red` (False), `--lc1970-amber` (line numbers, current cell). Reuse the 3161 values.
        - Picture: `--lc1970-water`, `--lc1970-top`, `--lc1970-bottom`, `--lc1970-c0` … `--lc1970-c3` (other components), `--lc1970-link`, `--lc1970-route`, `--lc1970-on-cell` (cell label text).
        - Every picture color must be more than 60 apart (RGB distance) from each status color and from every other picture color, in both themes; `--lc1970-on-cell` more than 150 from water, top, bottom and c0-c3.
      - Water cells and `is-nb` use `stroke-dasharray`; `is-walk`/`is-x` use stroke width, so states do not rely on color alone.
      - Page-scoped code-panel rules with `.lc1970-viz` (copy the 9025 block, rename the variable to `--lc1970-hang`): `#codePanel { position: static; max-height: none; overflow-y: visible; }`, `.code-line { width: auto; min-width: 0; white-space: pre-wrap; }`, `.code-line .txt { flex: 1 1 auto; min-width: 0; white-space: pre-wrap; overflow-wrap: anywhere; padding-left/text-indent hanging indent }`, the `.indent-guide` `text-indent: 0` rule and the four `:has(> .indent-guide:nth-child(k))` rules, `#stepNote { font-size: 13px }`. Line 4 (~85 characters) and line 28 must wrap with a hanging indent, not clip.
      - `@container lc1970 (max-width: 420px)` for the heading size.
      Files: `leetcode-visualizer/public/last-day-cross-1970.css`
      Verify: covered by the color and wiring tests in step 5.

- [ ] 4. Register the assets (shared files, registration only). Depends on steps 2 and 3.
      - `public/index.html`: after the `youtube-trending-9025.css` link (line 224) add `<link rel="stylesheet" href="last-day-cross-1970.css?v=last-day-cross-1970-v1" data-problem-ids="1970" />`; after the `renderer-youtube-trending-9025.js` script (line 755) add `<script src="renderer-last-day-cross-1970.js?v=last-day-cross-1970-v1" data-problem-ids="1970"></script>`; append `&lc1970=pictures-v1` to the `script.js?…` query right after `&yt9025=pictures-v1` (line 906).
      - `public/script.js`: after the `yt9025View` entry (lines 1272-1274) in `ORDERED_RENDERER_REGISTRY` add `{ predicate: (step) => Boolean(step.cross1970View), surface: "treeView", render: (step) => {\n      renderLastDayCross1970View(step);\n    } },`.
      Files: `leetcode-visualizer/public/index.html`, `leetcode-visualizer/public/script.js`
      Verify: `node --test tests/youtube-trending-9025.test.js tests/block-placement-3161.test.js` still passes.

- [ ] 5. Write `tests/last-day-cross-1970.test.js` on the 3161 harness (`tests/block-placement-3161.test.js`: `vm` renderer loader with `lang`/`steps`/`stepIndex`, `seeded()` RNG, `svgBoxes`/`hit`/`inside` helpers adapted to lc1970 classes, `readFrontendIndex`/`readFrontendJavaScript` from `tests/helpers/frontend-source`, the python spawn at lines 158-172).
      - Brute force: for each d = 0..n, flood cells[0..d-1], BFS from land cells of row 0, keep the last d that reaches the last row.
      - Random inputs from seed 1970: R, C in 2..6 with R·C ≤ 24, cells a random permutation of all cells.
      - Tests:
        1. Identity: `typeof SUPPORTED[1970].id === 'number'`, category `union-find`, `debugMode` `line-by-line`, `extraParams` undefined, `inputKind` `string`, `defaultInput === DEFAULT_INPUT_1970`, `code` deep-equals `SOURCE_1970` and contains no `top/bottom/neighbors` pseudo line, `liveArgs(defaultInput)` deep-equals `[3, 3, [[1,2],[2,1],[3,3],[2,2],[1,1],[1,3],[2,3],[3,2],[3,1]]]`, legacy `builder('1,1;2,1;1,2;2,2')` answers 2 and `liveArgs('1,1;1,2;2,1;2,2', { rows: 2, cols: 2 })` returns `[2, 2, [[1,1],[1,2],[2,1],[2,2]]]`.
        2. Answer and invariants on the presets plus 400 random inputs: answer equals brute force; exactly one final step, on line 31; one code line per step; `parent` only changes on line 11 and line-16 `link` steps; every `roots` entry of a land cell equals the root reached by following `parent`; `crossed` is true only on the `cross-check` true step and the final step; `route` cells are land, start in row 0, end in row R-1 and are 4-adjacent in order. Every vi and en note is at most 28 characters on every step (presets, random inputs and the extremes of test 6).
        3. Coverage: `LC1970_CASES[0][0]` equals `defaultInput`; the default and every preset walk all 27 executable lines (1-31 minus 2, 8, 14, 17); preset 1 is ≤ 4 cells.
        4. Displayed Python equals the builder: run `problem.code.join('\n')` with `..\.venv\Scripts\python.exe`, `process.env.PYTHON` or `python`, calling `Solution().latestDayToCross(R, C, cells)` on the presets plus 60 random inputs; compare with the builder answers. Skip with a clear message only when no python can be spawned (the 9025 commit notes the WindowsApps `python` alias hangs; set `PYTHON` to the real interpreter, e.g. `%LOCALAPPDATA%\Python\bin\python.exe`, when running locally).
        5. Every frame renders in vi and en on every preset: no `undefined|NaN|Infinity|object Object`; `data-source-line` equals the line; exactly one `data-code-line` strip; the source (`def latestDayToCross|def find`) is not in the view; R·C `data-cell` rects; n `data-day` boxes; two `.lc1970-bar`; one `lc1970-link` per node with `parent[i] !== i` (0 before line 6); `data-lc1970-case` count equals the preset count; branch badges exactly on the condition steps of lines 10, 22, 24, 28, 30; `is-route` only when `crossed`; rendering does not mutate steps.
        6. Geometry on every step of the presets, 60 random inputs and extremes (`6,4` and `4,6` with a fixed permutation, `6,2`, `2,6`, `2,2`): every box inside the viewBox; no two texts overlap; each cell label inside its cell, each day label inside its box, bar labels inside their bars; texts do not overlap cells/boxes/bars they do not belong to; SVG width ≤ 500. Links (lines/paths) are exempt from the overlap checks.
        7. Colors in both themes: picture tokens > 60 from each status token and from each other; `on-cell` > 150 from water, top, bottom, c0-c3; water cells and `is-nb` have `stroke-dasharray`.
        8. aria-labels follow the language for the SVG and the article on the first and the final step.
        9. Locals once: `vars` names equal `['top','bottom','day','r','c','cell','dr','dc','nr','nc','a','b','x','parent']` on every step; `x` is `'—'` outside find frames and `a`/`b` outside union frames; `day`/`dr`/`dc` keep their last values; the view has no locals block.
        10. Bad inputs throw `/1970/`: `''` is allowed (default), and these throw: `'x'`, `'1,3 | 1,1;1,2;1,3'`, `'7,2 | …'` (any), `'5,5 | …'` (> 24), `'2,2 | 1,1;1,2;2,1'` (too few), `'2,2 | 1,1;1,1;2,1;2,2'` (repeat), `'2,2 | 1,1;1,2;2,1;3,2'` (out of range), `'2,2 | [[1,1],[1,2'` (bad JSON), `'2,2 | 1,a;1,2;2,1;2,2'`.
        11. Wiring: the `index.html` link and script carry `last-day-cross-1970-v1` and `data-problem-ids="1970"`; `readFrontendJavaScript()` matches `/step\.cross1970View\), surface: "treeView", render: \(step\) => \{\s*renderLastDayCross1970View\(step\)/`; the CSS has dark and light `--lc1970-bg`, `#codePanel` `max-height: none`, the `.code-line` / `.txt` pre-wrap rules and `--lc1970-hang`.
      Files: `leetcode-visualizer/tests/last-day-cross-1970.test.js`
      Verify: `node --test tests/last-day-cross-1970.test.js` passes every test, with test 4 run (not skipped).

- [ ] 6. Run the full suite against the baseline.
      In `leetcode-visualizer`: `node --test --test-reporter=tap "tests/*.test.js" *> .agents/tasks/last-day-cross-1970/full.txt`. Compare failing test names with `baseline.md`. Rerun any `listen EACCES` file alone and save to `rerun.txt`.
      Files: artifacts only (not committed unless the reviewer asks).
      Verify: the failing set equals the baseline set (plus EACCES flakes that pass alone); no failing test mentions 1970, union-find, 9025, 3161 or 3420.

- [ ] 7. Write and run the headless Chrome probe `.agents/tasks/last-day-cross-1970/cdp-check.js`, copied from `.agents/tasks/block-placement-3161/cdp-check.js` (its code-panel probe with vertical and horizontal checks, the theme toggle and the console-error capture; `.agents/tasks/youtube-trending/cdp-check.js` has the hanging-indent probe).
      Start the server temporarily with `PORT=4197` and Chrome debugging on 9197; stop both afterwards.
      - Catalog: load 1970, `openCatalogGroupExclusively('union-find')` (categories are collapsed by default); the chip `[data-group-key="union-find"] .prob-chip[data-id="1970"]` exists, is visible and active; the search chip and the Recent chip are active; `typeof currentProblemId === 'number'`. No console errors.
      - For the 5 presets plus 2 custom inputs (a 6×4 and a 2×6 permutation), in dark and light, on every step: the highlighted `#codePanel` line equals `step.codeLines[0]` and `data-source-line`; getBBox finds no overlaps among texts, cells, boxes and bars, nothing clipped by the viewBox; the SVG fits its card; smallest font ≥ 10px; `#codePanel` `scrollHeight === clientHeight` and `scrollWidth === clientWidth`, 0 code lines clipped vertically or horizontally, wrapped lines continue at indent + 4; no source text in the view.
      - The default example covers all 27 executable lines. A preset button sets `#arrInput` and reruns.
      - Live editor: run the default in Pyodide and get `3`.
      - Spot-check pages 9025, 3161, 3420, 547 and 684 (union-find.js / provinces): they load with no console errors and their code panels keep their own rules (the 1970 CSS does not leak: `text-indent` 0 on 3161/3420).
      - Screenshots `shot-dark.png`, `shot-light.png` (a mid step on line 16 `link` so arrows show), `shot-final-dark.png`, `shot-final-light.png` (final step with the route).
      Files: `.agents/tasks/last-day-cross-1970/cdp-check.js`, `cdp-report.json`, the 4 screenshots.
      Verify: `cdp-report.json` shows 0 mismatches, 0 overlaps, 0 clipped, 0 scrollbars, 0 console errors.

- [ ] 8. Commit on `main` (do not push): `git add` the 3 new files, `problems/union-find.js`, `public/index.html`, `public/script.js`, and the task folder's `plan.md`, `baseline.md`, `cdp-check.js`, `cdp-report.json`, screenshots. Message `feat(1970): last-day-to-cross page (reverse union-find, grid + timeline + parent arrows + TOP/BOTTOM, line debugger, light/dark)` with the approach, the shared-file changes and the verification numbers in the body.
      Verify: `git status` is clean apart from untracked scratch files; `git log -1 --stat` lists only the files above.

## Digest

- `problems/union-find.js`
  - `function buildSteps1970(input, params = {})` lines 6593-6665: reads `params.rows/row/cols/col` (default 2), parses `r,c;r,c` with `split(/[;|]/)` (note: today `|` is a cell separator; the new parser uses it as the `R,C | cells` separator), union by size, `push(day, title, codeLines, current, vars, note, final)` emitting `bfsGrid`. Followed by `// ─── 2316` at line 6667.
  - `Object.assign(module.exports, {` line 7990, `1970: {` 7991-8015 (fields listed in "What exists today"), then `2316: {` 8016. `UF_CAT` is defined at line 8. File ends with `require("./core-custom-visualization-upgrades").installUnionFind(module.exports);` (line 8296), which only touches 684.
  - `problems/index.js` line 28 merges union-find.js with other modules; none defines 1970.
  - Covered by: new `tests/last-day-cross-1970.test.js`; no existing test mentions 1970.
- `public/renderer-last-day-cross-1970.js`, `public/last-day-cross-1970.css`, `tests/last-day-cross-1970.test.js`: new. Templates: `public/renderer-block-placement-3161.js` (436 lines; functions `bp3161Normalize`, `bp3161Picture`, `bp3161Effect`, `bp3161Code`, `bp3161Next`, `bp3161Go`, `bp3161Bind`, `renderBlockPlacement3161View`), `public/block-placement-3161.css`, `public/youtube-trending-9025.css` lines 495-546 (code panel + hanging indent), `tests/block-placement-3161.test.js` (renderer loader line 16, `seeded` 49, python test 158, `svgBoxes` 206, `hit`/`inside` 230-231, wiring test 349).
- `public/index.html`: line 224 `youtube-trending-9025.css?v=youtube-trending-9025-v2` link; line 755 `renderer-youtube-trending-9025.js?v=youtube-trending-9025-v1` script; line 906 `script.js?…&bp3161=pictures-v1&yt9025=pictures-v1"`.
- `public/script.js`: `ORDERED_RENDERER_REGISTRY` entries `blockPlace3161View` (1269-1271), `yt9025View` (1272-1274); generic `bfsGrid` entry at 1428 (surface `bfsGridView`) is what 1970 uses today.
- Multi-approach convention (not used here): `server.js` lines 509-541 choose `builderN`/`codeN` from `params.approach`; `public/app-core.js` lines 3153-3240 render every `codeN` block with its `codeNLabel`; 9025 config `problems/youtube-trending-9025.js` lines 620-685.
- Commands: tests `node --test --test-reporter=tap "tests/*.test.js"` (no npm test script); single file `node --test tests/<file>.test.js`. Baseline: 3219 tests, 52 failures, list in `baseline.md`. Planning-time check: a JS transcription of `SOURCE_1970` matched brute force on 3000 random inputs and covered all 27 executable lines on every preset (step counts 281/102/155/338/520).
