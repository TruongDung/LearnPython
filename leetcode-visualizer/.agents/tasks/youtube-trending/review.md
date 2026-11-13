# YouTube Trending Top K page (problem 9025, three approaches)

Commit `161f1b4` adds interview problem 9025, `YT.records(video_id)`, as a line-by-line page with three approaches chosen through the standard approach select (code/code2/code3, as on 416). Approach 1 is the user's size-k min-heap code, kept verbatim and pinned by a test. Approach 2 uses a SortedList of `(score, id)`. Approach 3 is a linked list of score buckets, as in 432. The class takes no starting scores, so the input's starting scores are replayed as earlier `records()` calls and shown as one warm-up step per video. Ties follow Python tuple order, so the screenshot example returns `['3', '1']`: the same set as `{1, 3}`, in a different order. Shared files only get registration lines.

Watch for: the live editor shows approaches 1 and 2 results as `<list_reverseiterator …>` reprs, and its result list includes the warm-up calls (likely user-visible, non-blocking). Approach 3's complexity string is Vietnamese-only and shows in English mode; its `O(k log k)` read cost also ignores sorting large buckets (confirmed, minor).

**Verdict**: APPROVED

## High-level view

The builder emits one step per executed Python line. It mirrors CPython `heapq` sift order and SortedList insertion order, so heap shape and slot indices match a real run. Two tests anchor this. A brute-force comparison runs 400 random sequences plus presets and extremes on all three approaches. A second test runs the displayed Python under real CPython, with `sortedcontainers` loaded from the existing vendored wheel, and checks it against the builder answers. The run log shows both passing; neither was skipped.

Id 9025 was chosen because the assertion in `lis-300.test.js` keeps 9024 retired; it guards the old LIS screenshot exercise merged into 300 (c7f6b9c).

Warm-up replay is a deliberate trade-off that the coder disclosed. Starting scores don't step line by line, but the default example still covers every executable line in all three approaches. The probe confirms this through the `lines` field for every run.

The renderer draws one SVG per approach and checks itself from its own markup: overlaps, viewBox bounds, and labels inside their owning shapes. The CDP probe covers 7 inputs × 3 approaches × 2 themes. It reports 0 mismatches, 0 overlaps, 0 clipping, no code-panel scroll, notes ≤ 23 characters and no console errors. It opens the Interview category first, and the chip is active in the category, recent and search. 3161, 3420, 2406 and 300 still load, and the 9025 code-panel override does not leak to them (300 keeps `max-height: 520px`).

The gaps are at the edges: the live editor output, the complexity string, and the wrapped code line in approach 3.

<details>
<summary>Issues (3)</summary>

1. **Live editor shows iterator reprs and warm-up results** (likely, non-blocking). With approach 1 or 2, `records()` returns `reversed(res)`. The live editor's `safe_repr` only expands list, tuple, dict and set, so every result shows as `<list_reverseiterator object at 0x…>`. The result list also starts with the warm-up calls (11 entries for the screenshot preset instead of 1). Either teach `safe_repr` to expand `reversed` iterators (a shared-file change, so report it), or tell the user this is a known limitation.
2. **Approach 3 complexity string** (confirmed, minor). `complexity3.time` is `"O(1) cập nhật + O(k log k) đọc / call"`. `app-core.js` writes `cx.time` as plain text, so this Vietnamese text shows in English mode (visible in `shot-a3-dark.png`). `sorted(node.ids, …)` also sorts the whole bucket, so the read costs O(m log m) for a bucket of m tied videos, up to O(n log n). Make the time string language-neutral, for example `O(1) + O(n log n) / call`, and correct the note.
3. **Wrapped line 32 in approach 3 loses its indent** (confirmed, cosmetic). `for id in sorted(node.ids, reverse=True)[:self.k - len(res)]:` wraps, and `len(res)]:` restarts at column 0 of the text area (`shot-a3-dark.png`). Nothing is clipped, but the wrap reads like a separate line. A hanging indent on wrapped `.txt` (for example `padding-left` with a negative `text-indent`) or a shorter line would fix it.

</details>

<details>
<summary>Details</summary>

### Tie order and the screenshot example

The user's heap pushes `(score, id)` with string ids. When scores are equal, the larger id in string order ranks higher, and `'9'` beats `'10'`. Approaches 2 and 3 copy this rule: the SortedList orders by the tuple, and buckets use `sorted(ids, reverse=True)`. The brute force uses the same comparator, and the CPython run shows the builder matches real behaviour. The screenshot example yields `['3', '1']`. The page states this in both languages, and the commit message and report disclose it. Whether the user wanted `1` before `3` is a product question, not a defect.

### Live editor path

```
prepareLiveDesign9025 → operations = warm-up records() × Σscores + traced calls
live-editor.js: result.append(getattr(instance, "records")(id))  → reversed iterator
safe_repr(iterator) → repr(...) → "<list_reverseiterator object at 0x…>"
```

The step debugger is unaffected because the builder renders `reversed(res)` as a list. The live editor is the only place a user sees raw Python output for this page. With the user's own code, every result there is unreadable. Approach 3 returns a list and displays normally, but its live result also starts with the warm-up calls. The live editor has no `skip` option like the one the test harness uses (`got[run['skip']:]`), so the live answer can't be made to match the page's answer without a shared-file change.

### Complexity labels

`complexity.time` and `complexity2.time` are pure big-O strings, but `complexity3.time` embeds Vietnamese words. Only `note` goes through `pick()`. The `O(k log k)` read bound assumes each visited bucket holds few ids. The code slices after sorting the full set, so a bucket of n tied videos costs O(n log n) on every call. That case is common in this problem, where ties are the interesting part.

### Test coverage

Covered: brute force on 400 random sequences with frequent ties and mixed-length ids (`'9'`/`'10'`, `'B'`/`'b'`); presets and extremes in all approaches; real CPython execution of the displayed code; line coverage of the default and presets; notes ≤ 28 characters in both languages; SVG overlap and bounds checks across 80 random inputs; theme color distances; aria-labels in both languages; input rejection; and asset wiring. Not tested: the live-editor run (`prepareLiveDesign` output only reaches a shape assertion), and that complexity strings contain no language-specific text.

### Baseline

The recorded baseline is 72 failures, not the 52 in the brief. Comparing by name, the one new failure is a `listen EACCES` port error in `picture-lessons.test.js` that passes alone. The probe and `after-failures.txt` support this, so the suite shows no regression attributable to 9025.

</details>

<details>
<summary>File map</summary>

- `problems/youtube-trending-9025.js`: new. Parser, three step builders, CPython-exact heapq, warm-up, live design config, and metadata.
- `public/renderer-youtube-trending-9025.js`: new. Per-approach SVG (bars + heap tree, bars + SortedList with slide and cutoff, bucket chain with pointers), call chips, current-line strip, presets and jumps.
- `public/youtube-trending-9025.css`: new. Dark/light tokens, picture styles, and a scoped `#codePanel` override (no height cap, wrap).
- `tests/youtube-trending-9025.test.js`: new. 12 tests.
- `problems/index.js`: one `require` in the interview group.
- `public/index.html`: CSS link, renderer script (`data-problem-ids="9025"`), `&yt9025=pictures-v1` cache key.
- `public/script.js`: one renderer registry entry for `yt9025View`.
- `.agents/tasks/youtube-trending/*`: probe script, report, screenshots, test logs.

Full diff: `git diff dd655a4...161f1b4`.

</details>
