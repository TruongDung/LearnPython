"use strict";

// LeetCode 3420 — Count Non-Decreasing Subarrays After K Operations.
// Right-to-left sliding window [i, j] with a deque of [level, count] groups (each run of cells raised to the
// same running max). cost = the shaded fill-up area; while cost > k the right edge j moves left.
// Traced one executed Python line per step. Picture lives in public/renderer-count-nondecreasing-3420.js.

const MAX_N_3420 = 10;
const MAX_VALUE_3420 = 20;
const MAX_K_3420 = 999;
const DEFAULT_K_3420 = 5;
const DEFAULT_INPUT_3420 = [4, 1, 5, 2, 6, 3, 7, 1];

const SOURCE_3420 = Object.freeze([
  "from collections import deque",
  "from typing import List",
  "",
  "class Solution:",
  "    def countNonDecreasingSubarrays(self, nums: List[int], k: int) -> int:",
  "        ans = cost = 0",
  "        j = len(nums) - 1",
  "        dq = deque()",
  "        for i in range(len(nums) - 1, -1, -1):",
  "            cnt = 1",
  "            while dq and dq[0][0] <= nums[i]:",
  "                level, c = dq.popleft()",
  "                cost += (nums[i] - level) * c",
  "                cnt += c",
  "            dq.appendleft([nums[i], cnt])",
  "            while cost > k:",
  "                cost -= dq[-1][0] - nums[j]",
  "                dq[-1][1] -= 1",
  "                if dq[-1][1] == 0:",
  "                    dq.pop()",
  "                j -= 1",
  "            ans += j - i + 1",
  "        return ans",
]);

const bi = (vi, en) => ({ vi, en });

function parseInput3420(input, params = {}) {
  let value = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (!text) throw new Error(`3420: enter 1–${MAX_N_3420} numbers like 4,1,5.`);
    if (text.startsWith("[")) {
      try {
        value = JSON.parse(text);
      } catch (_error) {
        throw new Error("3420: enter numbers like 4,1,5 or [4,1,5].");
      }
    } else {
      value = text.split(",").map((part) => (part.trim() === "" ? NaN : Number(part.trim())));
    }
  }
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_N_3420) {
    throw new Error(`3420: enter 1–${MAX_N_3420} numbers.`);
  }
  if (value.some((n) => !Number.isSafeInteger(n) || n < 1 || n > MAX_VALUE_3420)) {
    throw new Error(`3420: every value must be an integer 1–${MAX_VALUE_3420}.`);
  }
  let k = params && params.k !== undefined && params.k !== "" ? params.k : DEFAULT_K_3420;
  k = typeof k === "string" ? Number(k.trim() || NaN) : k;
  if (!Number.isSafeInteger(k) || k < 1 || k > MAX_K_3420) {
    throw new Error(`3420: k must be an integer 1–${MAX_K_3420}.`);
  }
  return { nums: value.slice(), k };
}

function buildSteps3420(input, params) {
  const { nums, k } = parseInput3420(input, params);
  const n = nums.length;
  const maxVal = Math.max(...nums);
  const steps = [];
  let ans = null;
  let cost = null;
  let j = null;
  let dq = null; // [[level, count], ...] left to right: dq[0] touches i, dq[-1] ends at j
  let i = null;
  let cnt = null;
  let level = null;
  let c = null;
  const lvl = new Array(n).fill(null); // height each window cell is counted at in cost
  let pending = false; // the new group for nums[i] (lines 10-14)
  let popped = null; // [level, count] just taken by popleft (lines 12-13)
  const dash = (value) => (value === null ? "—" : value);
  const fmt = (groups) => `[${groups.map(([a, b]) => `[${a}, ${b}]`).join(", ")}]`;

  const spansOf = (left) => {
    const out = [];
    let start = left;
    const add = (kind, lv, count) => {
      out.push({ kind, level: lv, count, start });
      start += count;
    };
    if (pending) add("pending", nums[i], cnt);
    if (popped) add("popped", popped[0], popped[1]);
    (dq || []).forEach(([lv, count]) => add("group", lv, count));
    return out;
  };

  const emit = ({ line, event, title, note, condition = null, delta = null, added = null, final = false, left = i }) => {
    steps.push({
      title,
      note,
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      vars: [
        { name: "k", value: k },
        { name: "i", value: dash(i) },
        { name: "j", value: dash(j) },
        { name: "cnt", value: dash(cnt) },
        { name: "level", value: dash(level) },
        { name: "c", value: dash(c) },
        { name: "cost", value: dash(cost) },
        { name: "dq", value: dq ? fmt(dq) : "—" },
        { name: "ans", value: dash(ans) },
      ],
      final,
      nonDec3420View: JSON.parse(JSON.stringify({
        version: 1,
        problemId: 3420,
        line,
        event,
        condition,
        nums,
        k,
        n,
        i,
        j,
        cost,
        ans,
        dq,
        lvl,
        spans: dq ? spansOf(left === null ? n : left) : [],
        delta,
        added,
        peakCost: 0,
        maxVal,
        answer: final ? ans : null,
        final,
      })),
    });
  };

  emit({ line: 1, event: "import-deque", title: bi("from collections import deque", "from collections import deque"), note: bi("Nhập deque.", "Import deque.") });
  emit({ line: 2, event: "import-list", title: bi("from typing import List", "from typing import List"), note: bi("Kiểu List.", "Type hints.") });
  emit({ line: 4, event: "class", title: bi("class Solution", "class Solution"), note: bi("Định nghĩa lớp.", "Class defined.") });
  emit({ line: 5, event: "call", title: bi(`countNonDecreasingSubarrays(nums, ${k})`, `countNonDecreasingSubarrays(nums, ${k})`), note: bi(`${n} số, k = ${k}.`, `${n} nums, k = ${k}.`) });
  ans = 0;
  cost = 0;
  emit({ line: 6, event: "init", title: bi("ans = cost = 0", "ans = cost = 0"), note: bi("Chưa đếm, chưa tốn.", "No count, no cost yet.") });
  j = n - 1;
  emit({ line: 7, event: "j", title: bi(`j = ${n} - 1`, `j = ${n} - 1`), note: bi(`j = ${j}: mép phải.`, `j = ${j}: right edge.`) });
  dq = [];
  emit({ line: 8, event: "dq", title: bi("dq = deque()", "dq = deque()"), note: bi("Deque rỗng.", "Empty deque.") });

  for (let index = n - 1; index >= 0; index--) {
    i = index;
    const x = nums[i];
    emit({ line: 9, event: "for-i", left: i + 1, title: bi(`i = ${i}`, `i = ${i}`), note: bi(`i = ${i}: thêm bên trái.`, `i = ${i}: add on the left.`) });
    cnt = 1;
    pending = true;
    lvl[i] = x;
    emit({ line: 10, event: "cnt", title: bi("cnt = 1", "cnt = 1"), note: bi("Nhóm mới: 1 ô.", "New group: 1 cell.") });
    for (;;) {
      const merge = dq.length > 0 && dq[0][0] <= x;
      emit({
        line: 11,
        event: "merge-check",
        condition: merge,
        title: bi(dq.length ? `while ${dq[0][0]} <= ${x}` : "while dq (rỗng)", dq.length ? `while ${dq[0][0]} <= ${x}` : "while dq (empty)"),
        note: merge ? bi(`${dq[0][0]} ≤ ${x} → gộp.`, `${dq[0][0]} ≤ ${x} → merge.`) : bi("Dừng gộp.", "No merge."),
      });
      if (!merge) break;
      popped = dq.shift();
      [level, c] = popped;
      emit({ line: 12, event: "pop", title: bi(`level, c = ${level}, ${c}`, `level, c = ${level}, ${c}`), note: bi(`Lấy nhóm ${level}×${c}.`, `Pop group ${level}×${c}.`) });
      const d = (x - level) * c;
      cost += d;
      for (let t = i + cnt; t < i + cnt + c; t++) lvl[t] = x;
      emit({ line: 13, event: "raise", delta: d, title: bi(`cost += (${x} - ${level}) * ${c}`, `cost += (${x} - ${level}) * ${c}`), note: bi(`Tô thêm ${d} ô.`, `Fill +${d} cells.`) });
      cnt += c;
      popped = null;
      emit({ line: 14, event: "grow", title: bi(`cnt += ${c}`, `cnt += ${c}`), note: bi(`Nhóm dài ${cnt}.`, `Group size ${cnt}.`) });
    }
    dq.unshift([x, cnt]);
    pending = false;
    emit({ line: 15, event: "push", title: bi(`dq.appendleft([${x}, ${cnt}])`, `dq.appendleft([${x}, ${cnt}])`), note: bi(`Mức ${x} × ${cnt}.`, `Level ${x} × ${cnt}.`) });
    for (;;) {
      const over = cost > k;
      emit({
        line: 16,
        event: "budget-check",
        condition: over,
        title: bi(`while ${cost} > ${k}`, `while ${cost} > ${k}`),
        note: over ? bi(`${cost} > ${k}: quá ngân sách.`, `${cost} > ${k}: over budget.`) : bi(`${cost} ≤ ${k}: đủ ngân sách.`, `${cost} ≤ ${k}: fits budget.`),
      });
      if (!over) break;
      const back = dq[dq.length - 1];
      const d = back[0] - nums[j];
      cost -= d;
      lvl[j] = nums[j];
      emit({ line: 17, event: "drop", delta: -d, title: bi(`cost -= ${back[0]} - ${nums[j]}`, `cost -= ${back[0]} - ${nums[j]}`), note: bi(`Bỏ ô ${j}: −${d}.`, `Drop cell ${j}: −${d}.`) });
      back[1] -= 1;
      emit({ line: 18, event: "dec", title: bi("dq[-1][1] -= 1", "dq[-1][1] -= 1"), note: bi("Nhóm cuối bớt 1.", "Last group −1.") });
      const empty = back[1] === 0;
      emit({
        line: 19,
        event: "empty-check",
        condition: empty,
        title: bi(`if ${back[1]} == 0`, `if ${back[1]} == 0`),
        note: empty ? bi("Nhóm rỗng → xoá.", "Group empty → pop.") : bi("Nhóm còn ô.", "Group not empty."),
      });
      if (empty) {
        dq.pop();
        emit({ line: 20, event: "pop-group", title: bi("dq.pop()", "dq.pop()"), note: bi("Xoá nhóm cuối.", "Pop last group.") });
      }
      lvl[j] = null;
      j -= 1;
      emit({ line: 21, event: "shift-j", title: bi(`j = ${j}`, `j = ${j}`), note: bi(`j = ${j}.`, `j = ${j}.`) });
    }
    const len = j - i + 1;
    ans += len;
    emit({ line: 22, event: "count", added: len, title: bi(`ans += ${j} - ${i} + 1`, `ans += ${j} - ${i} + 1`), note: bi(`+${len} đoạn → ${ans}.`, `+${len} subarrays → ${ans}.`) });
  }
  emit({ line: 9, event: "for-done", title: bi("Hết range", "range done"), note: bi("Hết vòng i.", "Loop done.") });
  emit({ line: 23, event: "return", final: true, title: bi(`return ${ans}`, `return ${ans}`), note: bi(`Kết quả: ${ans}.`, `Answer: ${ans}.`) });

  // One meter scale for the whole run, so the budget bar never rescales while stepping.
  const peakCost = Math.max(0, ...steps.map((step) => step.nonDec3420View.cost || 0));
  steps.forEach((step) => {
    step.nonDec3420View.peakCost = peakCost;
  });
  return { input, answer: ans, steps };
}

module.exports = {
  3420: {
    id: 3420,
    difficulty: "hard",
    slug: "count-non-decreasing-subarrays-after-k-operations",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    tags: [{ key: "queue", vi: "Queue", en: "Queue" }],
    title: bi("Count Non-Decreasing Subarrays After K Operations", "Count Non-Decreasing Subarrays After K Operations"),
    titleVi: bi("Đếm đoạn không giảm sau ≤ k lần +1", "Count subarrays fixable with ≤ k +1s"),
    statement: {
      vi: "Mỗi lần được +1 vào một phần tử; đếm các đoạn con có thể thành không giảm với tối đa k lần (mỗi đoạn xét riêng). Visualization: tối đa 10 số, mỗi số 1–20, k ≤ 999.",
      en: "One operation adds 1 to an element; count the subarrays that can be made non-decreasing with at most k operations (each subarray on its own). Visualization: up to 10 values, each 1–20, k ≤ 999.",
    },
    defaultInput: DEFAULT_INPUT_3420.slice(),
    inputLabel: bi("nums · tối đa 10 số (1–20)", "nums · up to 10 values (1–20)"),
    extraParams: [{ key: "k", label: bi("k (số lần +1)", "k (+1 budget)"), type: "number", default: DEFAULT_K_3420, min: 1, max: MAX_K_3420 }],
    debugMode: "line-by-line",
    approach: [
      bi("Quét i từ phải sang trái, cửa sổ [i, j].", "Scan i right to left over the window [i, j]."),
      bi("Deque giữ nhóm [mức, số ô]; cost = phần tô thêm để nâng ô thấp lên mức.", "The deque holds [level, count] groups; cost = the shaded fill raising low cells to their level."),
      bi("Khi cost > k thì bỏ ô j; mỗi i cộng j − i + 1 đoạn.", "While cost > k, drop cell j; each i adds j − i + 1 subarrays."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: bi("Cách khác: segment tree / sparse table + tìm nhị phân, O(n log n).", "Alternative: segment tree / sparse table + binary search, O(n log n)."),
    },
    code: [...SOURCE_3420],
    builder: buildSteps3420,
    liveArgs: (input, params) => {
      const { nums, k } = parseInput3420(input, params);
      return [nums, k];
    },
  },
};

Object.defineProperty(module.exports, "__internals3420", {
  value: { parseInput3420, SOURCE_3420, MAX_N_3420, MAX_VALUE_3420, MAX_K_3420 },
  enumerable: false,
});
