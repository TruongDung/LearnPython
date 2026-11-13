# New LeetCode 2406 page: group lanes on a number line plus a min-heap of group ends

Commit e0397a9 adds a new visualizer page for "Divide Intervals Into Minimum Number of Groups". It shows one approach, sort + min-heap of group end times. Each executed Python line is one step, with the line highlighted in the shared #codePanel. The picture is a number line with one colored lane per group. The interval being placed waits on a top row with a dashed sweep line at its `left`, and the lane of `ends[0]` turns green or red at the `if` check. The heap is drawn as colored slots, and the last frame marks the most-overlapped point with "×N". Shared changes are one require in `problems/index.js`, one renderer registry entry in `public/script.js`, and one link, one script tag and one cache-bust token in `public/index.html`. The builder's heap mirrors Python `heapq` comparison for comparison, so the `ends` list in the Variables panel matches what Python would print.

Watch for: in a True check where `ends[0] == left - 1`, the green `ends[0]` marker is drawn at the same x as the sweep line and hidden under it (**confirmed**). This happens in 3 of the 5 True checks in the default example and in at least one True check in every preset. The overlap test only checks bars and text, so it misses this. The user asked for no overlapping elements. Separately, the "free" green is the same color as group G2's lanes (**confirmed**, visible in `shot-light.png`).

**Verdict**: NEEDS_CHANGES

## High-level view

The approach choice holds up. 2402 and 1851 each show one heap solution, and the heap's size is the group count, so the lanes and the heap slots show the same number. A sweep line or difference array would only repeat the overlap count, and the final "×N" column already shows it. Every non-blank line runs in the default example, including both branches of line 9 (empty heap, still overlapping, free), so no preset is needed to cover gaps.

The weak spot is the `if ends and ends[0] < left` frame. The picture tells the user why the check is True or False with three cues: the lane color, the `ends[0]` end marker, and the sweep line. With inclusive integer ends, the most common True case is an interval that starts right after the earliest group ends. In that case the end marker and the sweep line share an x coordinate, and the sweep line is drawn on top. The lane-fill cue also clashes with G2's own color.

The page's CSS overrides for the code panel and step note only apply under `body:has(#treeView:not(.hidden) .mg2406-viz)`, so other pages keep their code-panel height cap. The test gap is the picture overlap check, which covers bars and text but not the SVG line marks.

<details>
<summary>Issues (3)</summary>

1. **`ends[0]` marker hidden by the sweep line** — when `ends[0] + 1 == left`, the marker at `x(top.end + 1)` and the sweep line at `x(current.left)` coincide, and the sweep line covers the marker. Move the marker to the middle or inside of the last cell (or offset the sweep line), and extend the overlap test to cover SVG `<line>` marks.
2. **"Free" green matches G2's color** — `--mg2406-g1` equals `--mg2406-green` in both themes, so a free G1 lane looks like a G2 lane. The red `is-busy` color is also close to G9 (`g8`). Pick group colors that differ from the status colors, or mark free/busy with something besides fill (an icon or a dashed outline).
3. **SVG aria-label is English only** — `mg2406Picture` always sets `aria-label="N groups"`. Use `copy.groups` so Vietnamese is consistent with the rest of the page.

</details>

<details><summary>Details</summary>

### The `ends[0]` marker and the sweep line collide

The renderer draws the end marker at the right edge of the earliest group's last cell, and the sweep line at the left edge of the current interval's first cell:

```js
const ex = x(top.end + 1);                 // ends[0] marker
...
parts.push(`<line class="mg2406-sweep" x1="${x(current.left)}" ...`);  // drawn after the marker
```

Ends are inclusive integers, so `ends[0] < left` is True exactly when `top.end + 1 <= left`. When the earliest group ends one unit before `left`, the two lines share an x. This is the tightest and most common reuse case. A quick count with the builder found 3 of 5 True checks in the default example, 1 of 2 in Short, 1 of 1 in Touching ends and 1 of 3 in No overlap (**confirmed**). The step 20/39 screenshot (`[5,8]` against `ends[0] = 4`) shows only the dashed sweep at 5. The green marker the legend promises (`▏ ends[0]`) cannot be seen. In False checks the marker is always right of the sweep line, so the picture shows the "busy" case more clearly than the "free" case.

The picture overlap test builds boxes only from `mg2406-bar` rects and `<text>` elements. The headless probe's `overlaps: 0` uses the same idea, so neither covers the marker and the sweep line. The user asked for "no overlapping or clipped elements or arrows, verified by a check", so the check should include the SVG line marks.

### Status colors reuse group colors

Lanes take their color from `--mg2406-g0..g9`, and the check frame recolors the `ends[0]` lane with `--mg2406-green` or `--mg2406-red`. In both themes `--mg2406-g1` is the same hex as `--mg2406-green` (`#4fd69c` dark, `#08784f` light). In the screenshot, G1 marked free and G2 at rest look alike, and the reader has to work out which lane the check is about (**confirmed**). `g8` (`#ffb3b3` / `#a83a3a`) is close to the busy red. That only matters with 9 or more groups, which the 10-interval cap allows but the presets do not reach. The True/False badge in the current-line card and the heap slot ring still show the result, so this is a legibility problem, not a wrong-picture problem.

</details>

<details>
<summary>File map</summary>

- `problems/min-groups-2406.js`: new problem module (parser with span ≤ 40 limit, heapq-faithful heap, step builder, metadata in the heap category).
- `public/renderer-min-groups-2406.js`: new renderer (lanes SVG, interval chips, heap slots, current-line strip, presets, jump buttons).
- `public/min-groups-2406.css`: new styles, dark default plus `[data-theme="light"]` tokens, code-panel height cap removed for this page only.
- `tests/min-groups-2406.test.js`: new tests (brute-force answer, note cap, line coverage, render both languages, bar/text overlap, input limits, wiring).
- `problems/index.js`: added `require("./min-groups-2406")` to the heap category.
- `public/script.js`: one renderer registry entry for `minGroups2406View`.
- `public/index.html`: stylesheet link and script tag with `data-problem-ids="2406"`, plus `&mg2406=pictures-v1` on the `script.js` query.
- `.agents/tasks/min-groups-2406/`: CDP probe, report and four screenshots (same as earlier task folders).

Full diff: `git diff 383c039..e0397a9`.

</details>
