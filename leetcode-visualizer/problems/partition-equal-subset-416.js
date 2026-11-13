"use strict";

// LeetCode 416 — Partition Equal Subset Sum. Line-by-line builders for the DP and bitset approaches
// (the DFS approach lives in partition-equal-subset-416-dfs.js). Each step is one executed Python line;
// public/renderer-partition-equal-subset-416.js draws the picture, the shared #codePanel shows the source.
const { bi, parseIntegerArray } = require("./hard-viz-shared");
const MAX_TRACE_STEPS = 450;
// Rows of the dp history picture: the last completed rows plus the row being updated.
const MAX_GRID_ROWS = 7;
const DEFAULT_INPUT = Object.freeze([3, 1, 5, 9, 4, 2]);
const SOURCE = Object.freeze([
  "class Solution:",
  "    def canPartition(self, nums):",
  "        total = sum(nums)",
  "        if total % 2 != 0: return False",
  "        target = total // 2",
  "        dp = [False] * (target + 1)",
  "        dp[0] = True",
  "        for num in nums:",
  "            for j in range(target, num-1, -1):",
  "                dp[j] = dp[j] or dp[j-num]",
  "        return dp[target]",
]);
const BITSET_SOURCE = Object.freeze([
  "class Solution:",
  "    def canPartition(self, nums):",
  "        total = sum(nums)",
  "        if total % 2 != 0: return False",
  "        target = total // 2",
  "        bits = 1",
  "        for num in nums:",
  "            bits |= bits << num",
  "        return ((bits >> target) & 1) == 1",
]);

const py = (value) => (value ? "True" : "False");

function parseNums(input) {
  return parseIntegerArray(input, { problemId: 416, name: "nums", maxLength: 200, minValue: 1, maxValue: 100 });
}

// Shared opening lines (class, def, total, odd check). Notes stay a few words; the picture carries the rest.
const OPENING = Object.freeze({
  class: bi("Định nghĩa lớp.", "Class defined."),
  call: (n) => bi(`${n} số.`, `${n} numbers.`),
  total: bi("Cộng tất cả số.", "Add up every number."),
  odd: bi("Tổng lẻ → False.", "Odd total → False."),
  even: bi("Tổng chẵn → tiếp.", "Even total → go on."),
});

function buildSteps(input) {
  const nums = parseNums(input);
  const steps = [];
  const locals = { nums };
  let total = null;
  let target = null;
  let dp = null;
  let rowBefore = null;
  let parents = null;
  let itemIndex = null;
  let transition = null;
  let answer = null;
  let shortened = false;
  let reachableCount = 0;
  const history = [];
  // Completed dp snapshots (∅ row, then one per processed number); only the last rows are kept.
  const completed = [];
  let completedCount = 0;
  let newSums = [];
  let newCount = 0;
  function witness(sum) {
    if (!dp || !dp[sum]) return null;
    const indices = [];
    while (sum > 0) {
      const parent = parents[sum];
      indices.push(parent.item);
      sum = parent.from;
    }
    return indices.reverse();
  }
  function displaySums() {
    if (target === null) return [];
    if (target <= 30) return Array.from({ length: target + 1 }, (_, sum) => sum);
    const sums = new Set([0, 1, 2, target - 2, target - 1, target]);
    for (const center of [transition?.destination, transition?.source, locals.num]) {
      if (center === undefined || center === null) continue;
      for (let delta = -3; delta <= 3; delta++) if (center + delta >= 0 && center + delta <= target) sums.add(center + delta);
    }
    return [...sums].sort((a, b) => a - b);
  }
  function gridRows(sums) {
    if (dp === null) return { rows: [], omitted: 0 };
    const live = completed.length === 0 || itemIndex !== null;
    const keep = MAX_GRID_ROWS - (live ? 1 : 0);
    const shown = completed.slice(-keep);
    const rows = shown.map((row) => ({ index: row.index, num: row.num, cells: sums.map((sum) => row.dp[sum]), active: false }));
    if (live) rows.push({ index: itemIndex, num: itemIndex === null ? null : nums[itemIndex], cells: sums.map((sum) => dp[sum]), active: true });
    return { rows, omitted: completedCount - shown.length };
  }
  function emit(line, event, title, note, final = false) {
    if (!final && steps.length >= MAX_TRACE_STEPS) { shortened = true; return; }
    const sums = displaySums();
    const chosen = answer === true ? witness(target) : null;
    const chosenSet = new Set(chosen || []);
    const grid = gridRows(sums);
    steps.push({
      arr: [], codeLines: [line], final,
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`), note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? name === "dp" && value.length > 60 ? `[${value.slice(0, 12).map(v => v ? "True" : "False").join(", ")}, …] (${value.length} cells)` : [...value] : value })),
      equalSubset416View: {
        line, source: SOURCE[line - 1], event, nums: [...nums], total, target,
        itemIndex, num: itemIndex === null ? null : nums[itemIndex],
        sums, cropped: dp !== null && sums.length < dp.length,
        before: dp === null ? null : sums.map(sum => (rowBefore || dp)[sum]),
        current: dp === null ? null : sums.map(sum => dp[sum]),
        rows: grid.rows, rowsOmitted: grid.omitted,
        reachableCount, transition: transition ? { ...transition, sourceWitness: [...transition.sourceWitness], existingWitness: [...transition.existingWitness] } : null,
        newlyReached: [...newSums], newlyReachedCount: newCount,
        history: history.slice(-6).map(row => ({ ...row, added: [...row.added] })),
        historyOmitted: Math.max(0, history.length - 6), shortened,
        answer, final, partition: chosen ? { a: [...chosen], b: nums.map((_, index) => index).filter(index => !chosenSet.has(index)) } : null,
      },
    });
  }
  function complete(index) {
    completed.push({ index, num: index === null ? null : nums[index], dp: [...dp] });
    if (completed.length > MAX_GRID_ROWS) completed.shift();
    completedCount++;
  }
  emit(1, "class", bi("class Solution", "class Solution"), OPENING.class);
  emit(2, "call", bi("canPartition(nums)", "canPartition(nums)"), OPENING.call(nums.length));
  total = nums.reduce((sum, num) => sum + num, 0);
  locals.total = total;
  emit(3, "total", bi(`total = ${total}`, `total = ${total}`), OPENING.total);
  const odd = total % 2 !== 0;
  if (odd) answer = false;
  emit(4, odd ? "odd-return" : "even-check", bi(`${total} % 2 = ${total % 2}`, `${total} % 2 = ${total % 2}`), odd ? OPENING.odd : OPENING.even, odd);
  if (odd) return { original: [...nums], answer: false, steps };
  target = total / 2;
  locals.target = target;
  emit(5, "target", bi(`target = ${target}`, `target = ${target}`), bi("Tìm 1 nhóm tổng = nửa.", "Find one half-sum group."));
  dp = Array(target + 1).fill(false);
  parents = Array(target + 1).fill(null);
  locals.dp = dp;
  emit(6, "init-dp", bi(`dp = [False] × ${target + 1}`, `dp = [False] × ${target + 1}`), bi("dp[s]: tạo được tổng s?", "dp[s]: can we make s?"));
  dp[0] = true;
  reachableCount = 1;
  emit(7, "zero", bi("dp[0] = True", "dp[0] = True"), bi("Nhóm rỗng → tổng 0.", "Empty group → sum 0."));
  complete(null);
  nums.forEach((num, index) => {
    itemIndex = index;
    locals.num = num;
    rowBefore = [...dp];
    transition = null;
    newSums = [];
    newCount = 0;
    emit(8, "choose-number", bi(`num = ${num}`, `num = ${num}`), bi(`Hàng mới cho ${num}.`, `New row for ${num}.`));
    if (num > target) {
      history.push({ item: index, num, added: [], addedCount: 0, reachableCount });
      emit(9, "skip-large", bi(`range(${target}, ${num - 1}, -1) rỗng`, `range(${target}, ${num - 1}, -1) is empty`), bi(`${num} > ${target}: bỏ qua.`, `${num} > ${target}: skip.`));
      complete(index);
      return;
    }
    for (let j = target; j >= num; j--) {
      locals.j = j;
      const before = dp[j];
      const source = dp[j - num];
      const recording = steps.length < MAX_TRACE_STEPS;
      if (recording) {
        transition = { destination: j, source: j - num, before, from: source, after: before || source, sourceWitness: witness(j - num) || [], existingWitness: witness(j) || [], changed: !before && source };
        emit(9, "inspect", bi(`j = ${j}`, `j = ${j}`), bi(`Xét ${j} = ${j - num} + ${num}.`, `Try ${j} = ${j - num} + ${num}.`));
      } else shortened = true;
      dp[j] = before || source;
      if (!before && source) {
        parents[j] = { from: j - num, item: index };
        reachableCount++;
        newCount++;
        if (newSums.length < 16) newSums.push(j);
      }
      if (j === num) history.push({ item: index, num, added: [...newSums].sort((a, b) => a - b), addedCount: newCount, reachableCount });
      if (recording) {
        const title = `dp[${j}] = ${py(before)} or ${py(source)} → ${py(dp[j])}`;
        const note = before ? bi("Đã có sẵn → giữ.", "Already reachable → keep.")
          : source ? bi(`Tổng mới ${j}!`, `New sum ${j}!`)
            : bi(`Chưa có ${j - num} → bỏ.`, `${j - num} unreachable → no.`);
        emit(10, "update", bi(title, title), note);
      }
    }
    complete(index);
  });
  answer = dp[target];
  itemIndex = null;
  transition = null;
  rowBefore = null;
  newSums = [];
  newCount = 0;
  emit(11, "return", bi(`return dp[${target}] → ${py(answer)}`, `return dp[${target}] → ${py(answer)}`), answer ? bi("Chia được 2 nhóm!", "Two equal groups!") : bi("Không tạo được target.", "Target unreachable."), true);
  return { original: [...nums], answer, steps };
}

// Python's bin(), shortened for the Variables panel when the integer is long.
function binary(bits) {
  const text = bits.toString(2);
  return text.length <= 40 ? `0b${text}` : `0b…${text.slice(-32)} (${text.length} bits)`;
}

function buildBitsetSteps(input) {
  const nums = parseNums(input);
  const total = nums.reduce((sum, num) => sum + num, 0);
  const steps = [];
  const odd = total % 2 !== 0;
  const target = odd ? null : total / 2;
  let bits = 1n;
  let ready = false;
  let known = { total: false, target: false };
  let answer = odd ? false : null;
  let activeIndex = null;
  let currentNum;

  function shownSums(num = null) {
    if (target === null || !known.target) return [];
    const sums = new Set();
    const addRange = (center, radius) => {
      if (!Number.isFinite(center)) return;
      for (let sum = Math.max(0, center - radius); sum <= Math.min(target, center + radius); sum++) sums.add(sum);
    };
    if (target <= 40) {
      addRange(0, target);
    } else {
      addRange(0, 5);
      addRange(target, 7);
      addRange(num, 3);
      addRange(target - num, 3);
    }
    return [...sums].sort((a, b) => a - b);
  }

  function snapshot(line, event, title, note, opts = {}) {
    const sums = shownSums(opts.num);
    const before = opts.before ?? bits;
    const shifted = opts.shifted ?? 0n;
    const after = opts.after ?? bits;
    const changedCount = (after & ~before).toString(2).replace(/0/g, "").length;
    steps.push({
      arr: [],
      codeLines: [line],
      final: Boolean(opts.final),
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`),
      note,
      vars: [
        ...(known.total ? [{ name: "total", value: total }] : []),
        ...(known.target ? [{ name: "target", value: target }] : []),
        ...(ready ? [{ name: "bits", value: binary(bits) }] : []),
        ...(currentNum === undefined ? [] : [{ name: "num", value: currentNum }]),
      ],
      equalSubset416BitsetView: {
        line,
        nums: [...nums],
        total: known.total ? total : null,
        target: known.target ? target : null,
        odd,
        ready,
        activeIndex,
        num: opts.num ?? null,
        sums,
        before: sums.map((sum) => Number((before >> BigInt(sum)) & 1n)),
        shifted: sums.map((sum) => Number((shifted >> BigInt(sum)) & 1n)),
        after: sums.map((sum) => Number((after >> BigInt(sum)) & 1n)),
        beforeCount: before.toString(2).replace(/0/g, "").length,
        afterCount: after.toString(2).replace(/0/g, "").length,
        addedCount: changedCount,
        phase: event,
        answer: opts.final ? answer : null,
        final: Boolean(opts.final),
      },
    });
  }

  snapshot(1, "class", bi("class Solution", "class Solution"), OPENING.class);
  snapshot(2, "call", bi("canPartition(nums)", "canPartition(nums)"), OPENING.call(nums.length));
  known.total = true;
  snapshot(3, "total", bi(`total = ${total}`, `total = ${total}`), OPENING.total);
  if (odd) {
    answer = false;
    snapshot(4, "odd-return", bi(`${total} % 2 = 1 → return False`, `${total} % 2 = 1 → return False`), OPENING.odd, { final: true });
    return { original: [...nums], answer, steps };
  }
  snapshot(4, "even-check", bi(`${total} % 2 = 0`, `${total} % 2 = 0`), OPENING.even);
  known.target = true;
  snapshot(5, "target", bi(`target = ${target}`, `target = ${target}`), bi("Cần bật bit target.", "Need the target bit on."));
  ready = true;
  snapshot(6, "init-bitset", bi("bits = 1", "bits = 1"), bi("Bit 0 bật: tổng 0.", "Bit 0 on: sum 0."));

  nums.forEach((num, index) => {
    activeIndex = index;
    currentNum = num;
    const before = bits;
    snapshot(7, "select", bi(`num = ${num}`, `num = ${num}`), bi("Số tiếp theo.", "Next number."), { num, before, after: before });
    const shifted = before << BigInt(num);
    bits = before | shifted;
    const added = (bits & ~before).toString(2).replace(/0/g, "").length;
    snapshot(8, "shift-or", bi(`bits |= bits << ${num}`, `bits |= bits << ${num}`), bi(`Dịch ${num}, OR: +${added} tổng.`, `Shift ${num}, OR: +${added} sums.`), { num, before, shifted, after: bits });
  });

  answer = ((bits >> BigInt(target)) & 1n) === 1n;
  activeIndex = null;
  snapshot(9, "return", bi(`bit ${target} → ${py(answer)}`, `bit ${target} → ${py(answer)}`), answer
    ? bi(`Bit ${target} bật → True.`, `Bit ${target} on → True.`)
    : bi(`Bit ${target} tắt → False.`, `Bit ${target} off → False.`), { final: true });
  return { original: [...nums], answer, steps };
}

module.exports = {
  416: {
    id: 416, difficulty: "medium", slug: "partition-equal-subset-sum",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "knapsack", vi: "Ba lô 0/1", en: "0/1 Knapsack" }],
    title: bi("Chia mảng thành hai nhóm tổng bằng nhau", "Partition Equal Subset Sum"),
    titleVi: bi("Tìm một nhóm có tổng bằng một nửa", "Find one group totaling half the sum"),
    statement: bi("Cho mảng số nguyên dương nums. Có thể chia tất cả phần tử thành hai nhóm, mỗi phần tử dùng đúng một lần, sao cho hai nhóm có tổng bằng nhau không?", "Given positive integers nums, can all occurrences be divided into two groups with equal sums, using each occurrence exactly once?"),
    defaultInput: [...DEFAULT_INPUT], inputKind: "positive",
    inputLabel: bi("nums (1–200 phần tử, giá trị 1–100)", "nums (1–200 values, each 1–100)"),
    extraParams: [{
      key: "approach", label: bi("Cách giải", "Approach"), type: "select", default: 1,
      options: [
        { value: 1, label: bi("Cách 1: DP mảng boolean", "Approach 1: Boolean-array DP") },
        { value: 2, label: bi("Cách 2: Bitset (dịch + OR)", "Approach 2: Bitset (shift + OR)") },
        { value: 3, label: bi("Cách 3: DFS chọn / bỏ (≤12 số)", "Approach 3: Take / skip DFS (≤12 numbers)") },
      ],
    }], debugMode: "line-by-line",
    approach: [
      bi("Tổng lẻ thì False. Tổng chẵn: tìm một nhóm tổng target = total / 2.", "An odd total returns False. Otherwise find a subset totaling target = total / 2."),
      bi("dp[s] là True khi các số đã xét tạo được tổng s. dp[0] = True ứng với nhóm rỗng.", "dp[s] is True when processed numbers can make sum s. dp[0] = True represents the empty group."),
      bi("Với số num: dp[j] = dp[j] or dp[j−num]. Không chọn num, hoặc thêm num vào nhóm tổng j−num.", "For num: dp[j] = dp[j] or dp[j−num]. Skip num, or add it to a group totaling j−num."),
      bi("Duyệt j từ phải sang trái để nguồn j−num chưa dùng số hiện tại. Nhờ đó không chọn cùng một phần tử hai lần.", "Scan j from right to left so source j−num has not used this occurrence. This prevents using one occurrence twice."),
      bi("Cách 2: biểu diễn mọi tổng bằng bitset số nguyên. bits |= bits << num bật đồng thời các tổng mới trong một phép dịch và OR.", "Approach 2: encode reachable sums in an integer bitset. bits |= bits << num marks all new sums with one shift and OR."),
      bi("DFS: chọn số → trừ remain; bỏ số → giữ remain. remain = 0 trả True. Hết số hoặc remain < 0 trả False. O(2^n) thời gian, O(n) ngăn xếp.", "DFS: take a number → subtract from remain; skip it → keep remain. Return True at remain = 0, False when out of numbers or remain < 0. O(2^n) time, O(n) stack."),
    ],
    complexity: { time: "O(n × target)", space: "O(target)", note: bi("Độ phức tạp của mã Python. Mô phỏng thêm bản sao và nhóm minh họa; trace dài được rút gọn nhưng vẫn tính đầy đủ đáp án.", "Complexity of the Python solution. The visualization also stores snapshots and witness groups; long traces are shortened while the full answer is computed.") },
    code: SOURCE,
    code2Label: bi("Cách 2: Bitset (dịch + OR)", "Approach 2: Bitset (shift + OR)"),
    code2: BITSET_SOURCE,
    builder: buildSteps,
    builder2: buildBitsetSteps,
    ...require('./partition-equal-subset-416-dfs'),
    liveArgs: input => [parseNums(input)],
  },
};
