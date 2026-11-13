# Baseline test run (HEAD 7f6c70f, before LeetCode 1970 work)

Command (package.json has no `test` script, so the Node test runner was used directly): `node --test --test-reporter=tap "tests/*.test.js"`  (cwd: leetcode-visualizer)

Totals: 3219 tests, 3167 pass, 52 fail, 0 cancelled, 0 skipped. Duration ~93 s.

EACCES failures: none, so no rerun was needed.

## Failing tests (52)

| Test file | Test name |
|---|---|
| bfs-shortest-path-9006-visual.test.js | 9006 keeps six essential watches stable and agrees with Python after each instruction |
| cat-mouse-1728-pictures.test.js | 1728 main and move-helper line snapshots match CPython, with exact queue and table projections |
| course-schedule-207.test.js | 207 uses the requested typed Kahn implementation |
| course-schedule-207.test.js | 207 line-by-line frames point to executable lines in the updated snippet |
| distance-cycle-2204-pictures.test.js | 2204 every highlighted line, loop exhaustion and bound local matches CPython |
| equal-value-components-2440.test.js | 2440 all executed lines, locals, and six fixed watches match CPython |
| find-path-1971.test.js | 1971 matches every completed Python statement, exact adjacency, visited, worklist and recursive frame locals |
| flood-batch-2026.test.js | WASM Python records each completed statement and helper frame like native CPython, including heap and union-find mutations |
| k-divisible-components-2872.test.js | 2872 approach 1 matches CPython events and locals after every line |
| k-divisible-components-2872.test.js | 2872 approach 2 matches CPython events and locals after every line |
| k-divisible-components-2872.test.js | 2872 recursive calls, returns, frame locals and line timing match CPython |
| k-smallest-matrix-9008.test.js | 9008 watches and exact heap layout match CPython after every source line |
| knapsack-tag-normalization.test.js | 0/1 Knapsack uses one canonical key across categories and tags |
| largest-color-value-1857.test.js | 1857 renderer and no-scroll styles are registered and cache-busted |
| lis-300.test.js | 300 code view keeps both scroll directions for long approach 5 lines |
| lis-300.test.js | 300 opens the editor full-screen without wrapping for approaches 1 through 7 |
| map-of-highest-peak-1765.test.js | 1765 renderer and styles are registered for lazy loading |
| maximum-probability-1514-pictures.test.js | 1514 rejects malformed graphs and bundles its Python helper |
| maximum-product-628.test.js | 628 preserves the viewport and viz panel height between steps |
| maximum-sum-bst-1373.test.js | 1373 includes scoped responsive styles and refreshed assets |
| minimum-cost-grid-1368.test.js | 1368 registers five solutions, complexities and the recommended default |
| minimum-subgraph-2203-pictures.test.js | 2203 validates input, permits parallel edges and prepares live arguments |
| minimum-weighted-subgraph-2203.test.js | displayed Python implementations return the sample answers |
| n-queens-51.test.js | 51 matches every completed CPython statement, actual local, board, set and recursive frame across the full eight-queen trace |
| network-delay-743-pictures.test.js | 743 validates network input and exposes the three live-debug arguments |
| next-word-9005.test.js | 9005 every source line, local variable and cached winner matches CPython |
| next-word-9005.test.js | 9005 snippet runs train then predict through the real live design tracer |
| number-of-distinct-islands-694.test.js | 694 styles keep the grid and shape board responsive |
| obstacle-grid-9007.test.js | 9007 snapshots and six stable watches match CPython after each displayed instruction |
| one-path-3963.test.js | 3963 matches every completed Python statement, grid mutation and actual local variable |
| ones-and-zeroes-474-pictures.test.js | 474 source and locals match CPython after each executable line |
| pacific-atlantic-417.test.js | 417 renderer and no-scroll styles are registered for lazy loading |
| picture-study-updates.test.js | 378 and 977 trace the actual Python state after each executable line |
| picture-study-updates.test.js | all picture renderers work in day/night languages without changing trace state |
| possible-recipes-2115.test.js | every highlighted Python line, deque, set, dictionary mutation and return matches native CPython |
| quick-problem-jump.test.js | index loads only the shell assets synchronously and keeps visualization chunks inert |
| range-sum-mutable-307.test.js | 307 styles are responsive and theme-aware with concise interview metadata |
| safe-walk-3286.test.js | 3286 validates input/health and prepares both arguments for live editing |
| segment-tree-tag.test.js | all available requested problems are grouped under Segment Tree |
| segment-tree-tag.test.js | the Segment Tree roster exposes all 87 requested problems |
| shortest-bridge-934.test.js | 934 renderer and no-scroll styles are registered for lazy loading |
| skyline-218.test.js | 218 matches CPython after every line, including heapq tuple ties, stale height and for-loop exhaustion |
| sudoku-solver-37.test.js | 37 matches every executed CPython statement, frame local, board mutation and live row/column/box set |
| supersequences-3435-pictures.test.js | 3435 every executed source line and bound local matches CPython, including both call scopes |
| tic-tac-toe-1275.test.js | 1275 board state and actual local watches agree with Python after each displayed statement |
| top-k-frequent-347.test.js | 347 matches CPython after each line, including equal-frequency tuple ties and loop exhaustion |
| tree-pictures-1973-2003.test.js | 2003 exact CPython trace includes failed index lookup, child-list construction, blocked continue, mex and answer updates |
| two-best-non-overlapping-events-2054.test.js | 2054 is registered as the heap sweep-line interval lesson |
| valid-number-65.test.js | 65 complete physical line events, locals, branches and returns agree with native Python |
| walls-and-gates-286.test.js | 286 renderer and no-scroll styles are registered for lazy loading |
| weakest-rows-1337.test.js | 1337 row counts, sorting, final selection and watches match CPython instructions |
| wonderful-substrings-1915.test.js | standalone 1915 solution stays identical to the visualized source |

