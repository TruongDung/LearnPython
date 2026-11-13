# Review: LeetCode 3420 page (cf7cf31, diff b75845e...HEAD)

Verdict: APPROVED. No blockers.

## Evidence

- Algorithm (`problems/count-nondecreasing-3420.js`): the builder follows the 23-line Python line by line. The popped-group cells `i+cnt .. i+cnt+c-1` are raised to `nums[i]` at L13, `lvl[j]` is reset at L17 and cleared at L21, so the shaded area equals `cost` on every step (the test asserts this). The test also runs the shown Python with CPython and compares it to the builder, and checks brute force on the presets, 300 random inputs and the extremes, per the commit body (16/16 pass).
- Note cap: the longest possible note is about 24 characters. Cost is at most 171 with n ≤ 10 and values 1–20. The test enforces ≤ 28 in vi and en on the presets, random inputs and k = 999. The probe recorded a maximum note length of 23.
- Id is the number `3420`, and the test checks this. The probe found `typeof currentProblemId === "number"`, and the chip is active in Sliding Window, Segment Tree, search and Recent after the probe opened each category first.
- Line coverage: the default example walks all 22 non-blank lines (`cdp-report.json` `default-*.lines`). The presets cover the remaining lines.
- Code panel, dark and light: `scrollH == clientH` (456) and `scrollW == clientW` (483). There are 0 lines clipped vertically or horizontally, and the 74-character signature wraps (`wrapped: 1`). The probe's `CODE_PROBE` includes the horizontal range check.
- Picture: on every step of 7 inputs in both themes there were 0 highlight mismatches, overlaps, viewBox clips, labels outside their chips, or HTML clips. The minimum font is 11px and the probe saw 0 console errors. Screenshots `shot-dark.png` and `shot-light.png` are legible, and the L13 strip matches the dq chips (pending 5×1, popped 2×1) and the fill.
- Locals appear only in Variables, and the source text appears only in `#codePanel` (tests 9 and 5, and the probe's `inViewSource: 0`).
- Bilingual: copy, aria-labels and notes exist in vi and en, and test 8 checks the aria-labels.
- Shared changes match the plan and are listed in the commit body:
  - `problems/index.js`: one require.
  - `index.html`: one CSS link, one script tag and the `&nd3420=pictures-v1` query parameter.
  - `script.js`: one registry entry.
  - `segment-tree-tag.test.js`: 42→43 (twice) and 45→44.
- Spot-checks on 2406, 1854, 1094, 416 and 432: each page loads and steps with 0 errors and has no `.nd3420-viz` element.
- Full suite, per the commit body: 3150 tests, 49 failures, and the failing names are identical to `baseline.txt`. `segment-tree-tag.test.js` passes.
