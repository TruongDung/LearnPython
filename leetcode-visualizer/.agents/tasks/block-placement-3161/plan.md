# Implementation Plan: LeetCode 3161 page redesign (Block Placement Queries)

## What exists today

- `problems/binary-search.js` lines 8049-8373 hold the whole 3161 page: `parseQueries3161`, `buildSteps3161` and the `Object.assign(module.exports, { 3161: {...} })` config.
  - The builder emits multi-line steps (`codeLines: [30..35]`), long notes (100+ characters), and a `blockQueriesView` rendered by `renderBlockQueriesView` in the shared bundle `public/renderers-02.js` (line 3451, CSS in `public/style-07.css` ~line 5476, registry entry `public/script.js` line 1610).
  - The shown Python imports `sortedcontainers` (not installed, so the live editor run fails) and uses `N = min(50000, len(queries) * 3)` while the JS uses `max(50000, …)`. The visual is a 30-cell number line plus text panels; the Fenwick array is never drawn.
  - Queries come in through `extraParams.queries`; the main input is a dead `n` box (`defaultInput: [1]`, label "n (unused…)").
  - There is only one approach (no `code2`).
- **Default-query mismatch**: the builder falls back to `"1,2;2,3,3;2,3,1;2,2,2"` and `liveArgs` to `"1,2;2,3,1;2,3,2"`. It is latent (the form always sends `params.queries`), but a live run without params would bind different queries than the trace. The redesign removes it: one `DEFAULT_QUERIES_3161` constant feeds `defaultInput`, the builder and `liveArgs`.
- 3161 is listed by id in `problems/fenwick-catalog.js` line 35, `problems/index.js` line 216 (segment-tree roster), and in `tests/fenwick-roadmap.test.js`, `tests/fenwick-tree-tag-normalization.test.js`, `tests/segment-tree-tag.test.js`. None of these change. Keep `id: 3161` (number), the `binary-search` category and the three existing tags exactly as they are, so all listings stay.

## Chosen approach

Keep the page's **single approach**: offline reverse scan + Fenwick tree (BIT) of max gaps, with a sorted list of obstacles. No `code2`.

- It is the approach the page already teaches, and it matches the Fenwick roadmap label ("Ordered set + BIT / Segment Tree") and the page's Fenwick listing.
- In reverse, a type-1 query removes an obstacle, so gaps only merge and grow. The BIT only ever needs `max=` updates, which keeps the code to 36 executable lines.
- The BIT draws well on the same axis as the number line: node `i` covers `(i − lowbit(i), i]`, so the node that stores the gap ending at obstacle `b` sits right under that gap.
- A segment tree version would double the code and the steps without a new idea. The complexity note names it in one line.
- The sorted list uses `bisect` from the standard library, so the displayed Python runs in the live editor and in the Python test.

## Python code shown (`SOURCE_3161`, 40 lines; lines 3, 7, 12, 19 are blank; 36 executable lines)

```
 1 from bisect import bisect_right, insort
 2 from typing import List
 3
 4 class BIT:
 5     def __init__(self, n: int):
 6         self.t = [0] * (n + 1)
 7
 8     def update(self, i: int, v: int) -> None:
 9         while i < len(self.t):
10             self.t[i] = max(self.t[i], v)
11             i += i & -i
12
13     def query(self, i: int) -> int:
14         best = 0
15         while i > 0:
16             best = max(best, self.t[i])
17             i -= i & -i
18         return best
19
20 class Solution:
21     def getResults(self, queries: List[List[int]]) -> List[bool]:
22         n = max(q[1] for q in queries) + 1
23         obs = [0, n]
24         for q in queries:
25             if q[0] == 1:
26                 insort(obs, q[1])
27         bit = BIT(n)
28         for a, b in zip(obs, obs[1:]):
29             bit.update(b, b - a)
30         ans = []
31         for q in reversed(queries):
32             k = bisect_right(obs, q[1])
33             if q[0] == 1:
34                 a, b = obs[k - 2], obs[k]
35                 obs.pop(k - 1)
36                 bit.update(b, b - a)
37                 continue
38             a = obs[k - 1]
39             ans.append(max(bit.query(a), q[1] - a) >= q[2])
40         return ans[::-1]
```

`continue` replaces an `else:` so every non-blank line is a real Python line event. During planning I ran a JS transcription of this code (same line order) against a brute force (sort the obstacles below x, check every gap including the tail to x) on 3000 random inputs (≤ 8 queries, x and sz in 1..15, distinct type-1 x): 0 mismatches. Every preset below covers all 36 executable lines.

## Presets (`BP3161_CASES` in the renderer: `[queriesText, viLabel, enLabel]`; the first one is the default)

| # | queries | answer | steps | label vi / en | purpose |
|---|---------|--------|-------|---------------|---------|
| 0 | `1,7;2,7,6;1,2;2,7,5;2,7,6` | `[true, true, false]` | ~141 | Ví dụ / Example | default = LeetCode example 2; n = 8 gives a full 4-level BIT |
| 1 | `1,2;2,3,3;2,3,1;2,2,2` | `[false, true, true]` | ~92 | Ngắn / Short | short preset = LeetCode example 1 |
| 2 | `1,3;1,8;2,10,4;1,11;2,13,5;1,6;2,13,3;2,7,4` | `[true, true, true, false]` | ~197 | Nhiều / Bigger | 8 queries, n = 14 |
| 3 | `1,2;1,4;2,5,3;2,6,3` | `[false, false]` | ~99 | Không vừa / No fit | every block fails |

Module `DEFAULT_QUERIES_3161 = "1,7;2,7,6;1,2;2,7,5;2,7,6"`.
Limits: 1-8 queries; type 1 rows are exactly `[1, x]`, type 2 rows exactly `[2, x, sz]`; x and sz are integers 1-15; type-1 x values are distinct (LeetCode guarantees it; duplicates break the sorted list). A run with no type-2 query is allowed and returns `[]`. These caps keep n ≤ 16, the SVG ≤ 500 px wide and every note ≤ 28 characters.

## Names

- View key `blockPlace3161View`. Renderer `renderBlockPlacement3161View(step)`. CSS/JS prefix `bp3161`. Cache token `block-placement-3161-v1`. Script query flag `&bp3161=pictures-v1`.
- New files: `public/renderer-block-placement-3161.js`, `public/block-placement-3161.css`, `tests/block-placement-3161.test.js`.
- The old `renderBlockQueriesView` (renderers-02.js), its `.bq-*` CSS (style-07.css) and its registry entry (script.js line 1610) are left untouched. They become dead because the new builder no longer emits `blockQueriesView`. Removing them would touch three shared bundles for no user-visible gain; note it in the report as a possible later cleanup.

---

- [ ] 1. Record the full-suite baseline before any change.
      Run `node --test *> .agents/tasks/block-placement-3161/full-baseline.txt` in `leetcode-visualizer` (main at cf7cf31). Write `baseline.txt` in the same format as `.agents/tasks/count-nondecreasing-3420/baseline.txt`: the command, `tests N, pass P, fail F`, and the failing test names with their file:line. Expect 49 failures (the 3420 run had 3137 tests / 49 failures at b75845e; cf7cf31 adds the 3420 tests, so the total is higher). Rerun any `listen EACCES` file alone and note it.
      Files: `.agents/tasks/block-placement-3161/baseline.txt` (and `full-baseline.txt`, not committed)
      Verify: `baseline.txt` lists the counts and the failing names.

- [ ] 2. Rewrite the 3161 section of `problems/binary-search.js` (lines 8049-8373 only; nothing outside the `// ─── 3161` comment block and its `Object.assign`). Model the structure on `problems/count-nondecreasing-3420.js`.
      - Constants: frozen `SOURCE_3161` (the 40 lines above), `DEFAULT_QUERIES_3161`, `MAX_Q_3161 = 8`, `MAX_X_3161 = 15`. A local `bi3161(vi, en)` helper returning `{ vi, en }` (binary-search.js has no `bi`).
      - `parseQueries3161(input, params = {})` replaces the old parser:
        - Source: `input` if it is a non-empty string or an array of arrays; otherwise `params.queries` if it is a non-empty string (legacy URLs/forms that still send the old `[1]` input plus `queries`); otherwise `DEFAULT_QUERIES_3161`.
        - Accept JSON `[[1,7],[2,7,6]]` or `type,x[,sz];…` (`;` or newline between rows), as today.
        - Throw an `Error` whose message starts with `3161:` for: no rows, more than 8 rows, a non-integer value, type not 1/2, type-1 row length ≠ 2, type-2 row length ≠ 3, x or sz outside 1-15, a repeated type-1 x, malformed JSON.
        - Return a fresh array of fresh rows.
      - `buildSteps3161(input, params)`: one step per executed Python line through an `emit({ line, event, title, note, condition, final })` helper as in 3420. Each step has `title`/`note` (bi), `arr: []`, `highlight: []`, `mark: []`, `codeLines: [line]`, `final`, `vars`, and `blockPlace3161View`.
        - Execution order (this is the trace; call steps land on the `def` line as in 3420's line 5):
          1, 2, 4, 20, 21(call), 22, 23, then for each query: 24, 25(cond), [26]; then 24 (done);
          27, 5(init call), 6; for each consecutive pair: 28, 29, then `update` = 8, (9 True, 10, 11)*, 9 False; then 28 (done); 30;
          for each reversed query: 31, 32, 33(cond); type 1: 34, 35, 36, update trace, 37; type 2: 38, 39 (event `ask`), `query` = 13, 14, (15 True, 16, 17)*, 15 False, 18, then 39 again (event `append`, with the boolean result); then 31 (done), 40 (final).
        - Events: `import-bisect`(1), `import-list`(2), `class-bit`(4), `class-sol`(20), `call`(21), `n`(22), `obs`(23), `for-q`/`for-q-done`(24), `type-check`(25, condition), `insort`(26), `bit-new`(27), `init-call`(5), `init-t`(6), `for-gap`/`for-gap-done`(28), `build-update`(29), `upd-call`(8), `upd-check`(9, condition), `upd-max`(10), `upd-step`(11), `ans`(30), `for-rev`/`for-rev-done`(31), `bisect`(32), `kind-check`(33, condition), `neighbors`(34), `remove`(35), `merge-update`(36), `continue`(37), `prev`(38), `ask`/`append`(39), `qry-call`(13), `best0`(14), `qry-check`(15, condition), `qry-max`(16), `qry-step`(17), `qry-return`(18), `return`(40, final).
        - `vars`, in exactly this order on every step: `q, n, obs, k, a, b, bit.t, i, v, best, ans`. Show `"—"` until assigned. `q` stays `"—"` on line 22 (the generator variable does not leak). `a`, `b`, `k`, `q` keep their last values, as in Python. `i` and `v` exist only inside `update`, and `i` and `best` only inside `query`: show them on lines 8-11 / 13-18 and `"—"` elsewhere. Format lists as `[0, 2, 7, 8]`, and `ans` as Python booleans `[True, False]`.
        - `blockPlace3161View` is a deep copy (`JSON.parse(JSON.stringify(...))`) of:
          `{ version: 1, problemId: 3161, line, event, condition, queries, n, qi, q, obs, ghosts, added, removed, k, a, b, bit, frame, node, path, raised, x, sz, best, tail, fit, ans, answer, final }`
          - `n`: null before line 22. `obs`: the current sorted list (null before line 23). `qi`: index in `queries` of the current `q` (forward loop and reverse loop), else null.
          - `ghosts`: obstacles already removed by the reverse scan (dashed "not built yet" posts). `added`: x inserted on this step (line 26), else null. `removed`: x popped on this step (line 35), else null.
          - `bit`: copy of `t` (null before line 6). `frame`: `"update"`, `"query"` or null. `node`: the current `i` inside a BIT method (null outside or once `i` leaves 1..n). `path`: indices already visited in the current BIT call, in order. `raised`: the index whose value changed on line 10 (null if `max` kept the old value or on other lines).
          - `x`, `sz`: set from the current type-2 query on lines 38-39 and 13-18 of its `query` call, else null. `best`: the query result (set from line 18 on, through the `append` step). `tail`: `x − a` on the `ask` and `append` steps. `fit`: the boolean on the `append` step, else null.
          - `ans`: answers in append (reverse) order. `answer`: the final list in original order, only on the final step.
        - Step notes, each at most 28 characters in both languages (the worst case is two-digit numbers). Use these or something close:
          - L1 "Nhập bisect." / "Import bisect."; L2 "Kiểu List." / "Type hints."; L4 "Định nghĩa BIT." / "BIT class defined."; L20 "Định nghĩa lớp." / "Class defined."
          - L21 `${m} truy vấn.` / `${m} queries.`; L22 `Trục 0…${n}.` / `Axis 0…${n}.`; L23 `Mốc 0 và ${n}.` / `Sentinels 0 and ${n}.`
          - L24 `q = [${q}]` (same both); done: "Hết truy vấn." / "All queries read."; L25 true: "Loại 1: vật cản." / "Type 1: obstacle."; false: "Loại 2: bỏ qua." / "Type 2: skip."; L26 `Đặt vật cản ${x}.` / `Place obstacle ${x}.`
          - L27 `BIT cỡ ${n}.` / `BIT of size ${n}.`; L5 "Tạo BIT." / "Build BIT."; L6 "Mọi nút = 0." / "All nodes = 0."
          - L28 `Khe ${a}→${b}.` / `Gap ${a}→${b}.`; done: "Hết khe." / "All gaps stored."; L29 `Ghi khe ${b - a} tại ${b}.` / `Store gap ${b - a} at ${b}.`
          - L8 `update(${i}, ${v})`; L9 true: `Nút ${i} ≤ ${n}.` / `Node ${i} ≤ ${n}.`; false: "Ra khỏi cây." / "Past the end."; L10 raised: `t[${i}] = ${v}.`; kept: `t[${i}] giữ ${t}.` / `t[${i}] stays ${t}.`; L11 `Lên nút ${i}.` / `Up to node ${i}.`
          - L30 "ans rỗng." / "Empty ans."; L31 `Ngược: q = [${q}]` / `Back: q = [${q}]`; done: "Hết duyệt ngược." / "Reverse scan done."; L32 `k = ${k}.`
          - L33 true: `Gỡ vật cản ${x}.` / `Undo obstacle ${x}.`; false: "Hỏi đặt khối." / "Block query."; L34 `Hàng xóm ${a}, ${b}.` / `Neighbors ${a}, ${b}.`; L35 `Bỏ ${x}.` / `Remove ${x}.`; L36 `Gộp khe ${b - a}.` / `Merged gap ${b - a}.`; L37 "Truy vấn kế." / "Next query."
          - L38 `Vật cản trước: ${a}.` / `Last obstacle: ${a}.`; L39 ask: `Khe lớn nhất ≤ ${a}?` / `Max gap up to ${a}?`; append: `max(${best}, ${tail}) ≥ ${sz}: ✓` / `…: ✗` (same both, e.g. `max(6, 0) ≥ 6: ✓`)
          - L13 `query(${i})`; L14 "best = 0."; L15 true: `Nút ${i} > 0.` / `Node ${i} > 0.`; false: "Tới gốc." / "Reached 0."; L16 `best = ${best}.`; L17 `Xuống nút ${i}.` / `Down to node ${i}.`; L18 `Trả ${best}.` / `Return ${best}.`
          - L40 `Kết quả: ${k} đáp án.` / `Answer: ${k} results.`
          Titles are the executed expression with values filled in, for example `bit.update(7, 5)` or `ans.append(max(6, 0) >= 6)`.
      - Problem fields: keep `id: 3161`, `difficulty`, `slug`, `category` and `tags` exactly as today. Update:
        - `titleVi: bi("Đặt khối giữa các vật cản (BIT max khe)", "Place blocks between obstacles (max-gap BIT)")`.
        - Two-sentence `statement` (vi/en) that states the rules (block may touch obstacles, must lie in [0, x]) and the visualization limits.
        - `defaultInput: DEFAULT_QUERIES_3161`, `inputKind: "string"`, `inputLabel: bi("queries · 1,x hoặc 2,x,sz; … (≤ 8, x ≤ 15)", "queries · 1,x or 2,x,sz; … (≤ 8, x ≤ 15)")`. Remove `singleInput` and `extraParams`.
        - `debugMode: "line-by-line"`.
        - Three-line `approach`: place every obstacle first; scan queries backwards so type 1 removes an obstacle and merges two gaps; the BIT keeps the max gap ending at or before each point, and a block fits if max(BIT up to the last obstacle, x − last obstacle) ≥ sz.
        - `complexity: { time: "O(q log q)", space: "O(q)", note: bi("Cách khác: segment tree max khe, cùng độ phức tạp.", "Alternative: a max-gap segment tree, same complexity.") }`.
        - `code: [...SOURCE_3161]`, `builder: buildSteps3161`, `liveArgs: (input, params) => [parseQueries3161(input, params)]`.
      - After the `Object.assign`, attach `Object.defineProperty(module.exports[3161], "__internals3161", { enumerable: false, value: { parseQueries3161, SOURCE_3161, DEFAULT_QUERIES_3161, MAX_Q_3161, MAX_X_3161 } })`.
      The builder returns `{ input, answer, steps }` with `answer` the boolean list in original order.
      Files: `leetcode-visualizer/problems/binary-search.js`
      Verify: in `leetcode-visualizer`, `node -e "const m=require('./problems')['SUPPORTED'][3161];for(const q of['1,7;2,7,6;1,2;2,7,5;2,7,6','1,2;2,3,3;2,3,1;2,2,2','1,3;1,8;2,10,4;1,11;2,13,5;1,6;2,13,3;2,7,4','1,2;1,4;2,5,3;2,6,3'])console.log(JSON.stringify(m.builder(q).answer),m.builder(q).steps.length)"` prints `[true,true,false]`, `[false,true,true]`, `[true,true,true,false]`, `[false,false]`; and `node --test tests/fenwick-roadmap.test.js tests/fenwick-tree-tag-normalization.test.js tests/segment-tree-tag.test.js` passes.

- [ ] 3. Create `public/renderer-block-placement-3161.js`, modeled on `public/renderer-count-nondecreasing-3420.js` (escape, `IsVi`, `Int`, `Normalize`, `Layout`, `Picture`, `Effect`, `Code`, `Next`/`Go`/`Bind`, render function). Depends on step 2 for the view shape.
      - `BP3161_LINE_COUNT = 40`, frozen `BP3161_CASES` (preset table), `BP3161_COPY` (vi/en).
      - `bp3161Normalize(step)` validates every view field (ints in range, arrays of ints, booleans) and drops malformed data, as `nd3420Normalize` does.
      - SVG `bp3161-svg`, one position axis for every row: `x(p) = PAD_L + p * unit`, `PAD_L = 40`, `PAD_R = 16`, `unit = max(26, min(40, floor(440 / n)))`. Natural width ≤ 500 for n ≤ 16. Rows top to bottom:
        (a) Block row (only on the `append` step): `rect.bp3161-block` with class `is-fit` or `is-nofit`, height 18, starting at the chosen space and `width = min(sz, room) * unit`, where the chosen space is the tail `[a, x]` when `tail ≥ best`, else the leftmost gap with right end ≤ a and length `best`, and `room = n − start`. When `sz > room` add class `is-cut`. Label `text.bp3161-block-label` = `sz=${sz}` (or `${sz}` when the block is under 3 units) inside the block.
        (b) Line row: the prefix band `rect.bp3161-prefix` from 0 to x (lines 38-39 and the `query` frame of a type-2 query), drawn first; obstacle posts `rect.bp3161-post[data-post=p]` (6 px wide, centered on x(p)) with class `is-sentinel` for 0 and n, `is-new` when `added === p`, `is-a`/`is-b` for the current `a`/`b`; ghost posts `rect.bp3161-post.is-ghost` for `ghosts` and `removed` (dashed, faded); gap bars `rect.bp3161-gap[data-gap=g]` between consecutive obstacles with their length `text.bp3161-gap-label` inside, and class `is-merged` on the gap a→b on lines 36 and the following update, `is-best` on the gap chosen in (a). Row label `gap`.
        (c) Tail row (on `ask`/`append`): `rect.bp3161-tail` from a to x with `text.bp3161-tail-label` = `${tail}` inside (omit the rect when tail is 0, keep a `0` label right of x(a)).
        (d) Tick row: `text.bp3161-tick` with each position 0..n.
        (e) BIT rows, one per level `L = 0..floor(log2 n)`: node `i` (lowbit(i) = 2^L) is `rect.bp3161-node[data-node=i]` from `x(i − lowbit(i)) + 1` to `x(i) − 1`, value `text.bp3161-node-label` inside. Classes: `is-path` (in `path`), `is-cur` (`node`), `is-raised` (`raised`), `is-zero` when the value is 0. Row label `bit` on the first BIT row. Draw only when `bit` is not null.
        SVG `aria-label`: `${n} vị trí, ${obs.length - 2} vật cản` / `${n} positions, ${obs.length - 2} obstacles`; on the final step `Kết quả ${answer}` / `Answer ${answer}` with the list as `T/F` letters.
      - HTML below the picture:
        - Query strip `div.bp3161-queries`: one `span.bp3161-q[data-q=idx]` per query in original order, text `+x` for type 1 and `x,sz` for type 2, class `is-t1`/`is-t2`, `is-cur` for `qi`, and once answered a `✓`/`✗` mark with class `is-true`/`is-false`. A `←` arrow label "duyệt ngược" / "reverse scan" while in the reverse loop.
        - Fit card `div.bp3161-fit` on `ask`/`append`: three mini values `best`, `tail`, `sz` and the result badge (✓ green / ✗ red) on `append`.
      - Current-line strip, same contract as 3420: `<div class="bp3161-now" data-code-line="L" aria-current="step"><span class="bp3161-lineno">L{line}</span>` + effect code (for example `obs = [0, 2, 7, 8]`, `t[8] = 6`, `i = 8`, `k = 3`, `best = 6`, `ans.append(True)`) + a True/False badge `b.bp3161-branch` on lines 9, 15, 25 and 33, and a ✓/✗ badge on the `append` step. Do not print the source or the locals in the view.
      - Header `LEETCODE 3161 · BLOCK PLACEMENT`; heading `getResults(queries)`, `q = [2, 7, 6]` while a query is current, or `return [True, True, False]` on the final step; status chip `ans ${ans.length}/${type2 count}`.
      - Preset buttons `data-bp3161-case`: set `#arrInput.value = preset[0]`, then `runViz()`. Jump buttons `data-bp3161-jump`: "Dòng →" / "Line →" (next step), "Truy vấn →" / "Next query →" (next `for-rev` step, or next `for-q` before the reverse loop), "Kết quả ↠" / "Result ↠" (final).
      - Article `article.bp3161-viz[data-problem-id="3161"][data-source-line=L]`, `role="region"`, `aria-label="LeetCode 3161 · dòng L"` / `"… · line L"`. Legend line with icon + 2-3 words per item (post, gap, BIT node, path, block).
      - All SVG text 11px monospace.
      Files: `leetcode-visualizer/public/renderer-block-placement-3161.js`
      Verify: covered by the render, geometry and aria tests in step 6.

- [ ] 4. Create `public/block-placement-3161.css`, modeled on `public/count-nondecreasing-3420.css`.
      - Dark tokens on `.bp3161-viz { --bp3161-bg … }` with `container: bp3161 / inline-size`; light tokens on `[data-theme="light"] .bp3161-viz { … }`.
        - Status: `--bp3161-green` (fits / True), `--bp3161-red` (no fit / False), `--bp3161-amber` (line numbers, current node). Reuse the 3420 values.
        - Picture: `--bp3161-post` (obstacles), `--bp3161-gap` (gap bars), `--bp3161-prefix` (prefix band, low opacity), `--bp3161-tail` (tail), `--bp3161-node` (BIT nodes), `--bp3161-path` (visited nodes), `--bp3161-block` (block outline when not judged), `--bp3161-on-bar` (text on bars/nodes).
        - Every picture color must be more than 60 apart (RGB distance) from each status color and from every other picture color, in both themes. `on-bar` more than 150 from `gap`, `node` and `path`.
      - Ghost posts and `is-cut` blocks use opacity plus `stroke-dasharray`, so the state does not rely on color alone. `is-fit`/`is-nofit` blocks also get ✓/✗ in the label text.
      - Page-scoped code-panel rules copied from 3420 with `.bp3161-viz`: `body:has(#treeView:not(.hidden) .bp3161-viz) #codePanel { position: static; max-height: none; overflow-y: visible; }`, `.code-line { width: auto; min-width: 0; white-space: pre-wrap; }`, `.code-line .txt { flex: 1 1 auto; min-width: 0; white-space: pre-wrap; overflow-wrap: anywhere; }`, `#stepNote { font-size: 13px }`. Lines 21 and 39 (~65 characters) must wrap, not clip.
      - `@container bp3161 (max-width: 420px)` for the heading size.
      Files: `leetcode-visualizer/public/block-placement-3161.css`
      Verify: covered by the color and wiring tests in step 6.

- [ ] 5. Wire the assets (shared registration only). Depends on steps 3 and 4.
      - `public/index.html`: after the `count-nondecreasing-3420.css` link (line 221) add `<link rel="stylesheet" href="block-placement-3161.css?v=block-placement-3161-v1" data-problem-ids="3161" />`; after the `renderer-count-nondecreasing-3420.js` script (line 749) add `<script src="renderer-block-placement-3161.js?v=block-placement-3161-v1" data-problem-ids="3161"></script>`; append `&bp3161=pictures-v1` to the `script.js?...` query after `&nd3420=pictures-v1` (line ~900).
      - `public/script.js`: after the `nonDec3420View` entry (lines 1265-1267) in `ORDERED_RENDERER_REGISTRY` add `{ predicate: (step) => Boolean(step.blockPlace3161View), surface: "treeView", render: (step) => {\n      renderBlockPlacement3161View(step);\n    } },`.
      Files: `leetcode-visualizer/public/index.html`, `leetcode-visualizer/public/script.js`
      Verify: `node --test tests/count-nondecreasing-3420.test.js tests/car-pooling-1094.test.js` still passes.

- [ ] 6. Write `tests/block-placement-3161.test.js` on the 3420 harness (`vm` renderer loader with `lang`, `steps`, `stepIndex`; `seeded()` RNG; `svgBoxes`/`hit` helpers adapted to bp3161 classes; `readFrontendIndex`/`readFrontendJavaScript` from `tests/helpers/frontend-source`).
      - Brute force: for each type-2 query, take the obstacles placed so far that are < x, sort, add 0 and x, and check whether any consecutive difference ≥ sz.
      - Random inputs from seed 3161: 1-8 queries, x and sz in 1-15, distinct type-1 x (redraw duplicates), both types present in most runs.
      - Tests:
        1. Identity: `typeof SUPPORTED[3161].id === 'number'` and equals 3161, category `binary-search`, tags still include `binary-search`, `segment-tree` and `sorted-set` keys, `debugMode` is `line-by-line`, no `extraParams`, `defaultInput === DEFAULT_QUERIES_3161`, `liveArgs(DEFAULT)` deep-equals the parsed default (no mismatch), and `liveArgs('[1]', { queries: '1,2;2,3,1' })` returns `[[[1,2],[2,3,1]]]` (legacy fallback).
        2. Answer and invariants on the presets plus 400 random inputs: answer equals brute force; exactly one final step on line 40; one code line per step; `obs` sorted with 0 and n at the ends; no `bit[i]` value ever decreases between steps; on every step outside the `update` frame, for every current gap a→b, `max(bit[j] for j on the query path of b) ≥ b − a` (the gap is visible to a query at b); `path` entries are valid BIT indices; `answer` (final) equals `ans` reversed.
           Every vi and en note is at most 28 characters on every step of every preset and random input, including the extremes in test 6.
        3. Coverage: `cases[0][0]` equals `defaultInput`; the default walks all 36 executable lines (lines 1-40 minus 3, 7, 12, 19); every preset does too; one preset has ≤ 4 queries and the default has ≥ 5.
        4. Displayed Python equals the builder: run `problem.code.join('\n')` with `..\.venv\Scripts\python.exe`, `process.env.PYTHON` or `python` (the `apply-substitutions-3481.test.js` lines 145-149 pattern, calling `Solution().getResults(q)`) on the presets plus 60 random inputs, and compare with the builder answers. Skip with a clear message when no python can be spawned.
        5. Every frame renders in vi and en on every preset: no `undefined|NaN|Infinity|object Object`; `data-source-line` equals the line; exactly one `data-code-line` strip; the source (`def getResults|bisect_right\(`) does not appear in the view; one `data-post` per obstacle; one `data-gap` per consecutive pair; `data-node` count is n when `bit` is set, else 0; one `data-q` per query; `data-bp3161-case` count equals the preset count; branch badges exactly on lines 9, 15, 25, 33; a block only on `append` steps with `is-fit` iff `fit`; rendering does not mutate steps.
        6. Geometry on every step of the presets, 80 random inputs and extremes (`1,1;1,2;…;1,7;2,15,1` — 7 obstacles packed left, `2,15,15`, `1,15;2,15,15`, `1,8;2,15,7;2,15,8`): every box inside the viewBox; no two texts overlap; no text overlaps a post, a bar it does not belong to, or a node it does not belong to; each gap/tail/node/block label fits inside its rect; posts do not overlap gap labels; SVG width ≤ 500.
        7. Colors in both themes: picture tokens > 60 from each status token and from each other; `on-bar` > 150 from `gap`, `node`, `path`; `.bp3161-post.is-ghost` and `.bp3161-block.is-cut` have `stroke-dasharray`.
        8. aria-labels follow the language for the SVG and the article on the first and the final step.
        9. Locals appear once: `vars` names equal `['q','n','obs','k','a','b','bit.t','i','v','best','ans']` on every step; `i`/`v` are `'—'` outside lines 8-11 and `i`/`best` outside 13-18; `a`/`b` keep their last values; the view has no locals block.
        10. Bad inputs throw `/3161/`: `''`, `'x'`, `'3,1'`, `'1'`, `'1,2,3'`, `'2,5'`, `'1,0'`, `'1,16'`, `'2,5,0'`, `'2,5,16'`, `'1,2;1,2'`, nine rows, `'[[1,2'`. A run with only type 1 queries returns `[]`.
        11. Wiring: the `index.html` link and script carry `block-placement-3161-v1` and `data-problem-ids="3161"`; `readFrontendJavaScript()` matches `/step\.blockPlace3161View\), surface: "treeView", render: \(step\) => \{\s*renderBlockPlacement3161View\(step\)/`; the CSS has dark and light `--bp3161-bg`, `#codePanel` `max-height: none`, and the `.code-line` / `.txt` pre-wrap rules.
      Files: `leetcode-visualizer/tests/block-placement-3161.test.js`
      Verify: `node --test tests/block-placement-3161.test.js tests/fenwick-roadmap.test.js tests/fenwick-tree-tag-normalization.test.js tests/segment-tree-tag.test.js` passes every test, with test 4 run (not skipped).

- [ ] 7. Run the full suite against the baseline.
      `node --test *> .agents/tasks/block-placement-3161/full.txt` in `leetcode-visualizer`. Compare the failing test names with `baseline.txt`. Rerun any `listen EACCES` file alone and save to `rerun.txt`.
      Files: artifacts only.
      Verify: the failing set equals the baseline set (plus EACCES flakes that pass on rerun); no failing test mentions 3161, fenwick, segment-tree or binary-search.

- [ ] 8. Write and run the headless Chrome probe `.agents/tasks/block-placement-3161/cdp-check.js`, copied from `.agents/tasks/count-nondecreasing-3420/cdp-check.js` (its `CODE_PROBE` with vertical and horizontal checks, the theme toggle and the error capture).
      Start the server temporarily on PORT=4316 with Chrome debugging on 9316, and stop both afterwards (the user runs their own dev servers).
      - Catalog: load 3161, `openCatalogGroupExclusively('binary-search')`; the chip `[data-group-key="binary-search"] .prob-chip[data-id="3161"]` exists, is visible and active. Do the same for the `segment-tree` group and the Fenwick roadmap level that lists 3161. The search chip and the Recent chip are active; `typeof currentProblemId === 'number'`.
      - For the 4 presets plus 2 custom inputs (`1,1;1,2;1,3;1,4;1,5;1,6;1,7;2,15,1` and `1,8;2,15,7;2,15,8`), in dark and light, on every step: the highlighted `#codePanel` line equals `step.codeLines[0]` and `data-source-line`; getBBox finds no overlaps among texts, posts, gaps, nodes and the block, and nothing clipped by the viewBox; the SVG fits its card; the smallest font ≥ 10px; `#codePanel` has `scrollHeight === clientHeight` and `scrollWidth === clientWidth`, with 0 code lines clipped vertically or horizontally; no source text in the view.
      - The default example's covered lines equal all 36 executable lines. A preset button sets `#arrInput` and reruns.
      - Screenshots `shot-dark.png`, `shot-light.png`, `shot-final-dark.png`, `shot-final-light.png` (pick a mid step on an `append` step so the block shows). Report to `cdp-report.json` with 0 console errors.
      - Spot-check pages 3420, 2406, 1854, 1094, 416, and binary-search.js pages 352 and 528: each loads and steps with 0 errors and has no `.bp3161-viz`.
      Files: `.agents/tasks/block-placement-3161/cdp-check.js` (plus report and screenshots)
      Verify: `BASE=http://localhost:4316/ node .agents/tasks/block-placement-3161/cdp-check.js` reports 0 mismatches, 0 overlaps or clips, no code-panel scroll in either direction and 0 console errors. Fix findings in steps 3-4 and rerun steps 6 and 8.

- [ ] 9. Commit locally on `main`; do not push.
      Stage only: `problems/binary-search.js`, the 3 new files, `public/index.html`, `public/script.js`, and the task-dir artifacts `plan.md`, `baseline.txt`, `cdp-check.js`, `cdp-report.json`, `shot-*.png`. Do not stage `full.txt`/`full-baseline.txt` or the pre-existing unrelated changes (`min-groups-2406/*`, `count-nondecreasing-3420/full.txt|review.*`, `viz-1854-1094/`).
      Message: `feat(3161): redesign block placement page (number line + gaps, max-gap BIT on the same axis, block fit, line debugger, light/dark)`; the body states the approach, presets, limits, the shared changes and the verification numbers, as in cf7cf31.
      Verify: `git log -1 --stat` lists exactly those files and `git status` shows none of them modified.

## Shared-file changes (report all)

- `public/index.html`: one CSS link and one script tag (`data-problem-ids="3161"`), plus `&bp3161=pictures-v1` on the `script.js` query.
- `public/script.js`: one `ORDERED_RENDERER_REGISTRY` entry for `blockPlace3161View`.
- `problems/binary-search.js` is shared by many problems, but only the 3161 block (lines 8049-8373) changes.
- Not changed: `problems/index.js`, `problems/fenwick-catalog.js`, all existing tests, and the old `renderBlockQueriesView` / `.bq-*` CSS / registry line 1610 (now dead; possible later cleanup).

## Digest

- `problems/binary-search.js` lines 8049-8373: comment header `// ─── 3161: Block Placement Queries`, `function parseQueries3161(raw, label = "queries")` (8061), `function buildSteps3161(input, params = {})` (8078, reads `params.queries`, cap 16, emits `blockQueriesView` via `snap()`), `Object.assign(module.exports, { 3161: { id: 3161, difficulty: "hard", slug: "block-placement-queries", category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" }, tags: [binary-search, segment-tree ("Segment Tree / Fenwick Tree"), sorted-set], …, defaultInput: [1], inputKind: "positive", singleInput: true, extraParams: [{ key: "queries", type: "string", default: "1,2;2,3,3;2,3,1;2,2,2" }], code: [41 lines using sortedcontainers], liveArgs(input, params) { return [parseQueries3161(params.queries ?? "1,2;2,3,1;2,3,2", "queries")]; }, builder: buildSteps3161 } })` ending at 8373; the next section is `// ─── 528: Random Pick with Weight`. Keep the `tags` array verbatim. Covered by the new tests 1-4, 9, 10 and by `tests/fenwick-roadmap.test.js`, `tests/fenwick-tree-tag-normalization.test.js`, `tests/segment-tree-tag.test.js` (id lists only).
- `problems/count-nondecreasing-3420.js`: pattern for `SOURCE_*`, `emit()` pushing `{title, note, arr: [], highlight: [], mark: [], codeLines: [line], vars, final, <view>: JSON.parse(JSON.stringify(...))}` and the non-enumerable internals.
- `public/renderer-count-nondecreasing-3420.js` (read in full): pattern for `ND3420_CASES`, `nd3420Normalize`, `nd3420Layout`/`nd3420Picture` (rect/text attribute order `class … x y width height` that the test regexes depend on), `nd3420Code` strip `<div class="nd3420-now" data-code-line="${line}" aria-current="step"><span class="nd3420-lineno">L${line}</span>`, `nd3420Next/Go/Bind` (preset sets `arrInput` then `runViz()`), and `renderNonDecreasing3420View` writing `#treeView`.
- `public/count-nondecreasing-3420.css`: dark tokens `.nd3420-viz {`, light `[data-theme="light"] .nd3420-viz {`, and the `body:has(#treeView:not(.hidden) .nd3420-viz) #codePanel` / `.code-line` / `.code-line .txt` rules.
- `tests/count-nondecreasing-3420.test.js`: harness (requires `../problems`, `./helpers/frontend-source`; `vm` context with `lang`; `svgBoxes` regexes; Python spawn), color test parsing `--nd3420-<name>: #rrggbb;`, wiring test regexes.
- `public/index.html`: line 221 `<link rel="stylesheet" href="count-nondecreasing-3420.css?v=count-nondecreasing-3420-v1" data-problem-ids="3420" />`, line 749 `<script src="renderer-count-nondecreasing-3420.js?v=count-nondecreasing-3420-v1" data-problem-ids="3420"></script>`, line ~900 `script.js?…&cp1094=pictures-v1&nd3420=pictures-v1"`.
- `public/script.js`: lines 1265-1267 `{ predicate: (step) => Boolean(step.nonDec3420View), surface: "treeView", render: (step) => {\n      renderNonDecreasing3420View(step);\n    } },`; line 1610 is the old `blockQueriesView` entry (leave it).
- Verified during planning: `git log` shows main at cf7cf31 in sync with origin/main; the JS transcription of `SOURCE_3161` matched brute force on 3000 random inputs and gave the preset answers above with all 36 executable lines covered by each preset. The full suite was not run during planning (step 1 records it); the 3420 baseline file reports 3137 tests / 49 failures at b75845e.
