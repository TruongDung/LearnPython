# Visualizations 4000–5000

The app covers all **125 problems from 4000 through 4124**: 12 existing lessons,
112 additions in `problems/guided-4000-5000.json`, and the dedicated
`problems/mountain-array-4124.js` lesson. The official description for 4124 was
supplied by the user and confirms that adjusted values may be zero or negative.
IDs 4125–5000 have no source problem in the current local reference catalog.

Each addition executes its displayed source using the shared Python tracer,
with native Python locally and bundled WebAssembly on serverless hosts.
Pictures, highlighted lines, call frames, variable changes and return values
come from immutable executed snapshots. Backward replay reads these snapshots.
Short Vietnamese and English explanations accompany light/dark picture scenes.
The range renderer adds elevators, time-series tracks, a prefix trie, falling
boxes/bombs, bus seats, robots, chessboards and a circular dial. Shared scenes
cover arrays, strings, grids, trees, graphs, intervals and bit rows.

## Source and attribution

79 entries adapt doocs/leetcode implementations under CC BY-SA 4.0; 33 use
independent project implementations. Each entry records its source, license and
reference tree in `provenance`. See `third-party/NOTICE.txt` and the bundled
license. Examples are verification fixtures, not hardcoded answer lookups.

## Verification

```sh
node --test tests/guided-4000-5000.test.js tests/guided-4000-5000-properties.test.js
```

The checks cover 112 defaults, 202 additional reference examples, every default
trace frame in both languages, reversible replay, source-line correspondence,
asset registration and 4,801 independent small-domain oracle cases for all 33
local algorithms. The oracles use exhaustive assignments, permutations, legal
XOR moves, continuous collision events, synchronous gravity, whole-string
materialization, deletion searches and tree subsets as appropriate.

Browser QA covers 26 representative lessons, seven at 390px, both languages,
both themes and line controls. All 124 original lessons also pass metadata/solve
API checks. The unchanged existing 3998–4000 specialized lessons retain their
own renderers and regression checks.

## Teaching input limits

The shared argument parser limits JSON size and arrays to keep replay usable.
Some exact teaching models impose additional explicit limits: 4009 and 4029
accept up to 12 requests/cars; 4058 and 4123 accept up to 18 values; 4081 accepts
n and s up to 1000; 4082 accepts 15 nodes with value span at most 80; 4118
accepts 30 values with max(nums)+n at most 160. These models demonstrate exact
execution on small inputs rather than serving as full-constraint judge runners.
