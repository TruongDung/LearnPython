# Picture-first redesign of the LeetCode 432 All O`one view

The 432 renderer and stylesheet are rewritten around three panels: an SVG bucket chain with live `next`/`prev` arrows, a hash-map card showing `keyCount`/`keyBucket` before→after, and an in-view Python code window that highlights the executed line. The problem builder (`problems/all-one-432.js`) was already line-by-line (`debugMode: "line-by-line"`, one source line per step), so the change is entirely on the presentation side. The renderer reads the existing `allOne432View` model unchanged. Theme support uses the app-wide `html[data-theme]` attribute with dark tokens as the default and a light override. A new test file and a cache-busting version bump in `index.html` complete the diff. The commit records 3/3 new tests passing, no new failures in the full suite (49 pre-existing), 0 console errors in headless Chrome across 130 default and 233 full-tour steps, legibility checks in both themes, and no regressions on problems 146/410/514/707.

Watch for: the shared step-note panel under the view still shows the builder's full-sentence bilingual notes on every step, which works against "less text" (likely). The page also now shows the solution code twice, once in the shared code panel and once in the in-view window (confirmed). Neither blocks the stated done criteria.

**Verdict**: APPROVED

## High-level view

The bucket chain is the centerpiece. Linked buckets sit on one row in count order between HEAD and TAIL. Buckets that are detached but still referenced (a freshly constructed `new_bucket`, a just-removed `bucket`) drop to a lower row, so a half-finished `insert_after` or `remove_bucket` is visible as one-way dashed arrows. Role tags (`bucket`, `target`, `new_bucket`, `min`/`max`), a ghosted pill for a key being removed, and a ★ on the query bucket carry most of the explanation that used to be prose.

The code window shows only the source block that contains the current line, with a True/False badge on branch lines, a one-line `↳` effect (for example `[1].next → [2]`), a call-stack breadcrumb, and chips for locals. The stack is inferred from line ranges rather than taken from the builder. It is correct for the current source, but it is tied to fixed line numbers.

Theme handling is CSS-only. All colors are custom properties on `.ao432-viz` and are overridden under `[data-theme="light"]`, and every selector is scoped under `ao432`. Other pages cannot be affected by this stylesheet.

Navigation follows the shared renderer convention (`stopPlay` → set `stepIndex` → `renderStep`) used by the 999 and advanced-stack renderers. Presets write `arrInput` and call `runViz`. One preset is designed to execute every non-blank source line, and the test suite asserts that it does.

The text budget is only partly met. Text inside the view is down to labels and short code fragments, but the builder's `title`/`note` strings were left untouched and still render in the shared panel.

<details>
<summary>Issues (3)</summary>

1. **Step notes still verbose** — the shared `stepNote` panel still renders the builder's long bilingual sentences on every step (likely at odds with "ít chữ"). Shorten the `note` strings in `problems/all-one-432.js` to a few words, or drop them where the in-view effect line already says the same thing.
2. **Code shown twice** — the shared code panel and the in-view code window both display the solution with the same highlighted line (confirmed). Decide whether the in-view window is the primary one and say so in the layout, or reduce it to the effect, stack, and locals strip.
3. **Line-range call stack** — `ao432Stack` derives `insert_after`/`remove_bucket`/`Bucket()` frames from hardcoded line ranges 2–6, 17–23 and 25–27 (confirmed). If the source shifts, it will silently show wrong frames. Emit the frame from the builder, or add a test that pins the ranges to `problem.code`.

</details>

<details>
<summary>Details</summary>

### Bucket chain layout and transient states

`ao432Picture` sizes each box from its longest key and its key count, places linked buckets left to right, and routes arrows three ways. Adjacent same-row neighbors get straight lines. Non-adjacent same-row targets get arcs above (`next`) or below (`prev`). Cross-row targets get cubic curves. An arrow is styled `is-oneway` when the reverse pointer does not point back. This makes the four pointer writes in `insert_after` readable: the new box appears on the lower row with one outgoing arrow, gains its second, and then the neighbors' arrows swing down to it. Detached buckets are drawn only while a local, the mutation target, or `keyBucket` still references them, which mirrors Python garbage collection and keeps removed buckets from piling up.

```
 HEAD ──next──▶ [1] ──next──▶ TAIL      (row 1: linked, count order)
      ◀─prev───  │a│ ◀─prev───
                   ⇣ one-way while insert_after is half done
               new_bucket [2]            (row 2: detached / unlinked)
```

### In-view code window and its coupling to source line numbers

The window picks the block from `AO432_BLOCKS` that contains `state.line`, de-indents it, and marks exactly one `<li>` with `is-current`. The test asserts exactly one per frame. When `inc` calls `insert_after`, the window switches to the helper block, and the breadcrumb (`inc ▸ insert_after`) is the only thing that keeps the caller context. `ao432Stack` builds the breadcrumb from line ranges:

```js
if (line >= 17 && line <= 23) stack.push("insert_after");
if (line >= 25 && line <= 27) stack.push("remove_bucket");
if (line >= 2 && line <= 6) { ... stack.push("Bucket()"); }
```

These ranges, `AO432_BLOCKS`, and the renderer's private `AO432_SOURCE` copy all have to match `problem.code`. They match today (all 74 lines are identical), but nothing in the new test enforces that. The `AO432_SOURCE` duplication itself predates this change.

### Text budget and the shared panels

Inside the view, text is now limited to panel titles, a legend, role tags, and code. The 432 step still also drives the shared `stepTitle`/`stepNote` panel and the shared code panel through `script.js`. The builder's notes are full sentences ("Initialization boundary: both maps are empty and HEAD ↔ TAIL is a valid stable chain."), so below the picture the reader still gets a paragraph per step. The task constraints allowed edits to `problems/all-one-432.js`, so trimming these notes was in scope. Invariants and counters moved into a collapsed `<details>`, which is a good call for a picture-first layout.

### Theme tokens

Dark is the default because the app treats an unset `data-theme` as dark (`script.js` `current = dataset.theme || "dark"`). The light override redefines every token, and the current-line highlight switches from an amber `color-mix` to a solid pale yellow. A `prefers-reduced-motion` block disables the pill pop/ghost animations. The theme test only checks that both token blocks exist. Legibility rests on the commit's screenshot check.

### Test coverage

The new tests run the renderer in a `vm` context against every frame of every preset in both languages. They check for `undefined`/`NaN` leaks, a single highlighted line matching `codeLines[0]`, every linked bucket and map key drawn, branch badges on condition lines, the written-pointer class on pointer writes, and that rendering does not mutate steps. An oracle cross-checks query answers, allowing any tied key. The full-tour preset is asserted to visit every non-blank line.

Not tested: click and keyboard handlers (jump, op, and preset buttons) and scroll restoration, which are covered only by the recorded headless-Chrome run. Parity between `AO432_SOURCE`/`AO432_BLOCKS`/stack ranges and `problem.code` is also untested.

</details>

<details>
<summary>File map</summary>

- `leetcode-visualizer/public/renderer-all-one-432.js`: full rewrite covering SVG chain, map card, in-view code window, ops strip, presets, and jump navigation.
- `leetcode-visualizer/public/all-one-432.css`: full rewrite with scoped dark/light tokens, chain/pill/arrow styles, and reduced-motion.
- `leetcode-visualizer/public/index.html`: 432 CSS/JS cache version bumped v1 → v2.
- `leetcode-visualizer/tests/all-one-432.test.js`: new tests for preset correctness, line coverage, per-frame render checks, and theme wiring.

Full diff: `git diff 24983542753ef6d53dfcacb63050646e92bf71af...HEAD`

</details>
