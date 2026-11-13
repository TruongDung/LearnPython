# Review: LeetCode 3161 redesign (cf7cf31..d8c28a7)

Verdict: APPROVED. No blockers.

## Evidence

- Scope: the diff touches only the `// ─── 3161` block of `problems/binary-search.js` (hunks 8051-8443). It adds three new files: `public/renderer-block-placement-3161.js`, `public/block-placement-3161.css` and `tests/block-placement-3161.test.js`, plus the task artifacts. The shared changes are registration only. `public/index.html` gets a CSS link and a script tag, both with `data-problem-ids="3161"`, and `&bp3161=pictures-v1` on the `script.js` query. `public/script.js` gets one `blockPlace3161View` registry entry after `nonDec3420View`. `fenwick-catalog.js` and `index.js` are not changed. `id: 3161` (a number), the category and all three tags are unchanged.
- Approach: one approach, as the page had before (no `code2`). It is an offline reverse scan with a max-gap Fenwick tree (BIT) and a sorted list kept with `bisect`.
- Algorithm: I checked the reverse-scan argument. After a type-1 obstacle is removed, BIT index p keeps its old gap (prev→p). That old gap lies inside the merged gap prev→b, which is stored at b. A query at a live obstacle a ≥ p also covers b ≤ a, so the old value never raises the answer. Because of this, `bp3161Choice` always finds a real gap of length `best`. The JS builder follows the Python line for line: `bisect_right` is the count of obstacles ≤ x, and `insort` is a splice at the first index > x, which always exists because n > x.
- Default mismatch: the old builder and `liveArgs` used different default queries. That is fixed: one `DEFAULT_QUERIES_3161` now feeds `defaultInput`, the builder and `liveArgs`. Test 1 asserts `liveArgs(default)` equals the parsed default. `app-core.js:2462` sets `#arrInput` from `defaultInput` when a problem loads.
- Notes: every note is capped at 28 characters, and test 2 checks both languages on the presets, 400 random inputs and the extreme inputs. The CDP probe measured a longest note of 20 characters.
- Locals appear only in the shared Variables panel. Python scoping is tested (`i`/`v`/`best` show only inside their frames; `a` and `b` keep their last values).
- Brute force (tests/block-placement-3161.test.js:35) is independent of the builder. It is compared on the presets, 400 seeded random inputs and the extreme inputs. The displayed Python also runs in CPython and matches the builder (the commit reports this test ran, 0 skipped).
- Recorded runs:
  - Baseline at cf7cf31: 3150 tests, 49 failures.
  - After the change: 3161 tests, 50 failures. I compared the failing names in `full.txt` with `full-baseline.txt`. The only new failure is `HTTP metadata, solve, editor calls and lazy picture assets work for all six problems` in picture-lessons. Its log shows `listen EACCES`, and `rerun.txt` shows that file passing alone (14/14). No new failures otherwise.
  - The new 3161 tests and the fenwick-roadmap, fenwick-tree-tag-normalization and segment-tree-tag tests: 31/31 pass.
- CDP probe (`cdp-report.json`):
  - All 4 presets and 2 extreme inputs, in dark and light, show 0 highlight mismatches, 0 overlaps, 0 clipped elements, 0 labels outside their bars, a smallest font of 11px, and code-panel scroll and clipping of 0 in both directions.
  - The default example walks all 36 executable lines.
  - The 3161 chip is active in the binary-search, segment-tree and fenwick-tree groups, in search and in Recent. The id is a number.
  - 0 console errors.
  - Spot-checked pages 352, 416, 528, 1094, 1854, 2406 and 3420 load with 0 errors and no `.bp3161-viz`.
- Screenshots: both themes are legible. The `append` step shows the red sz=6 block crossing obstacle 7, with the best gap 5 and a tail of 0, and it matches the highlighted line 39.

## Non-blocking notes

- The code comment says legacy `[1]` input plus `params.queries` still loads. That fallback only works when the builder is called directly. The server's string check (`server.js:425`) rejects an array input, and the UI no longer sends `params.queries`. The fallback cannot be reached from the UI, because problem load always fills `#arrInput` from `defaultInput`.
- The old `renderBlockQueriesView`, its `.bq-*` CSS and its registry entry are now unused, as the plan intended. They can be removed in a later cleanup.
