# Sweep Line visualization study path

Added all 33 previously missing lessons, following the order of the supplied lists.
The Sweep Line category now places all 56 requested problems first, in that same
order. Other existing Sweep Line lessons remain available after this path.

| Batch | New problem IDs, in study order |
| --- | --- |
| Intervals | 57, 435, 986, 228 |
| Difference arrays and coverage | 1109, 1943, 1893, 2021, 2381, 2772, 2848, 3169, 3355, 3356, 3362 |
| Heap scheduling and optimization | 1353, 1751, 1942, 1834, 1882, 502, 630, 857 |
| Calendars and availability | 759, 1229, 1272, 2237 |
| Geometry | 391, 3453, 3454, 587, 939, 963 |

## Using the lessons

Select **Sweep Line**, or load a problem by number. Click **Visualize**, then use
Next/Prev, Play, First/Last, or the app's keyboard shortcuts. Each lesson includes
Vietnamese/English descriptions, a default example, editable JSON input, complexity,
Python source, and typed arguments for the existing live editor.

For single-argument problems, input can be a JSON array or an object using the
argument name. Multi-argument problems take a JSON object, for example:

```json
{"intervals":[[1,2],[3,5],[6,7],[8,10],[12,16]],"newInterval":[4,8]}
```

```json
{"nums":[2,0,2],"queries":[[0,2,1],[0,2,1],[1,1,3]]}
```

Employee Free Time accepts nested arrays of `[start,end]` pairs instead of
LeetCode's `Interval` objects. Meeting slots and removed intervals use half-open
endpoints; closed ranges are drawn with filled endpoints. Non-overlapping
Intervals allows touching endpoints, while weighted events in 1751 do not.

## Pictures and execution

- Intervals share a coordinate axis, with pointer highlights and separate output lanes.
- Difference arrays show endpoint updates, prefix values, and coverage versus demand.
- Scheduling shows actual CPU/server timelines and the Python heap layouts.
- Weighted event DP shows the take/skip table and next compatible event indices.
- Geometry shows corner parity, hull chains, rectangle candidates, and separating lines.
- Separate Squares I counts overlapping squares separately; II shows the union and
  its coordinate-compressed coverage segment tree.

Every execution frame is recorded by the existing bundled Python tracer from the
displayed source. The shared renderer is loaded only when a new lesson is selected.
For 3356, the returned checker's picture is explicitly labeled as a retained prefix
check; the Variables panel continues to show current Python locals.

## Demo limits

These are step-through lessons, so inputs are bounded independently of LeetCode's
full constraints. Most interval lists allow at most 16 entries and numeric arrays
at most 24 cells. Geometry allows at most 12 squares or 16 points; 1751 allows at
most 12 events and k ≤ 6; employee schedules allow 8 employees with 6 intervals each.
Range-specific bounds and shape/order requirements are validated with an error
message before tracing. The displayed algorithms retain their stated complexity.

## Validation

The targeted regression command passes 94 tests:

```text
node --test tests/sweep-study.test.js tests/lazy-visualization-assets.test.js tests/car-pooling-1094.test.js tests/min-groups-2406.test.js tests/burst-balloons-452.test.js tests/calendar.test.js tests/calendar-two.test.js tests/meeting-rooms-iii-2402.test.js
```

Checks cover all 33 default answers, all frames in both languages, typed live
arguments, immutable snapshots, escaping, lazy assets, endpoint ties, impossible
inputs, prefix-check persistence, and deterministic random comparisons against
direct coverage, grid areas, exhaustive subsets, and simple scanning schedulers.
HTTP solve/live-args routes were exercised for all 33 lessons. Browser checks
covered interval merging, difference-array capacity, weighted-event DP, server
heaps, and square-union geometry with no console errors observed.
