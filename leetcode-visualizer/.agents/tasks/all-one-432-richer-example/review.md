# Richer default example for the 432 All O`one visualizer

Commit 3b12f14 replaces the 6-operation default on the 432 page with a 23-operation sequence. The old example stays available as a new "Short"/"Ngắn" preset. Tracing the new sequence by hand: bucket [1] grows to 4 keys, the chain reaches `[1] e f · [2] c d · [3] a b` (three 2-key buckets), then four buckets `[1] e f · [2] c d · [3] b · [4] a`. The sequence ends at `[2] c d · [3] b a`. Along the way it covers inc/dec bucket creation, reuse of the neighbouring bucket, empty-bucket removal from both inc and dec, dec to zero, dec on a missing key, and mid-run and final getMaxKey/getMinKey. To fit the bigger chain, spacing was tightened, the SVG now scales down to the card width instead of scrolling, and the min/max tag moved to its own line above the role tags. The range d8e95f8..HEAD also contains b9a9696 and 1cb4afd from the earlier redesign passes. This review covers 3b12f14.

Watch for: the chain SVG now shrinks to fit with no lower limit, so long custom keys or narrower windows shrink the text instead of scrolling (confirmed, non-blocking). The default uses 23 of the 24-operation input cap (confirmed, non-blocking).

**Verdict**: APPROVED

## High-level view

The richer sequence replaces the default and also takes the first preset slot ("Ví dụ"/"Example"). "Every code line" and "Tied counts" are unchanged, and "Short" is appended. The only change to the shared `problems/linked-list.js` is the 432 `defaultInput` line, and `index.html` only bumps the 432 asset version from v4 to v5.

The layout fix swaps horizontal scrolling for proportional scaling (`max-width: 100%; height: auto` on an SVG with a `viewBox`). HEAD and TAIL stay in view, and the commit records a minimum scale of 0.93 at 1400px for the default. Nothing limits how far it shrinks for wider data.

The min/max tag gets its own line 13px above the role tags. This fixes the label collision between neighbouring boxes, which also affected the existing "Every code line" preset. The commit message records 4/4 passing 432 tests and a headless check at 1400px across 320 + 233 frames, with no highlight mismatches and no overlap or clipping in either theme. Those layout checks live only in an uncommitted script.

<details>
<summary>Issues (3)</summary>

1. **No minimum scale on the chain SVG** — with `max-width: 100%` and no `min-width`, custom inputs with 10-character keys or several detached buckets, or windows narrower than 1400px, scale the text below legible size. Add a `min-width` on the SVG, or let the card scroll again (`overflow-x: auto`) below some scale. Non-blocking: the default example fits at 0.93.
2. **Default sits at the operation cap** — the default uses 23 of `ALL_ONE_432_MAX_OPERATIONS = 24`, so a user who edits it can add only one operation before hitting the limit. Raise the cap slightly or drop one operation. Non-blocking.
3. **Layout regressions not caught by tests** — the overlap and clipping checks exist only in the uncommitted `.agents` check script, so a later spacing change could bring back clipped buckets without any test failing. Optionally add a renderer-level assertion, for example that the default's peak SVG width stays under a set bound. Non-blocking.

</details>

<details>
<summary>Details</summary>

### Scale-to-fit chain replaces horizontal scroll

Before this commit, `.ao432-svg` had `max-width: none`, so a wide chain overflowed its card and the card scrolled. Now the SVG is limited to the card width and keeps its aspect ratio. For the default example (single-letter keys, at most 4 real buckets plus HEAD/TAIL, `GAP` 40, `PAD` 12, a 56px minimum box, a 52px sentinel), the cost is 7% at 1400px. Box width still grows with key length (`longest * 7.6 + 34`), and keys may be up to 10 characters. Detached buckets also add a lower row whose width counts toward the SVG width. A custom input with several long keys can therefore produce an SVG two or three times wider than the card, and every label and pill shrinks by the same factor. This is confirmed from the code; the actual scale for such inputs was not measured. The change affects custom inputs, not the default, so it does not block the user's request.

### Test coverage for the new default

The new test checks the default's peak bucket count, peak number of multi-key buckets, largest bucket, and that the insert, remove, count-one, dec-complete and extreme-return events occur. Not tested: an assertion for the missing-key `dec x` path in the default (the sequence runs it, but nothing checks it), and any layout property (width, overlap, clipping).

</details>

<details>
<summary>File map</summary>

- `leetcode-visualizer/problems/linked-list.js`: 432 `defaultInput` replaced with the 23-operation sequence (one line).
- `leetcode-visualizer/public/renderer-all-one-432.js`: new first preset, "Short" preset appended, compact spacing constants, min/max tag on a separate line.
- `leetcode-visualizer/public/all-one-432.css`: `.ao432-svg` scales to card width.
- `leetcode-visualizer/public/index.html`: 432 CSS/JS asset version v4 → v5.
- `leetcode-visualizer/tests/all-one-432.test.js`: new default-example shape test; version assertions bumped.

Full diff: `git diff d8e95f8..HEAD` (3b12f14 is the commit for this task; `git show 3b12f14`).

</details>
