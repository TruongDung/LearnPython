"use strict";

const { bi, parseIntegerArray } = require("./hard-viz-shared");
const MAX_TRACE_STEPS = 450;
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

function parseNums(input) {
  return parseIntegerArray(input, { problemId: 416, name: "nums", maxLength: 200, minValue: 1, maxValue: 100 });
}

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
  function emit(line, event, title, note, final = false) {
    if (!final && steps.length >= MAX_TRACE_STEPS) { shortened = true; return; }
    const sums = displaySums();
    const chosen = answer === true ? witness(target) : null;
    const chosenSet = new Set(chosen || []);
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
        reachableCount, transition: transition ? { ...transition, sourceWitness: [...transition.sourceWitness], existingWitness: [...transition.existingWitness] } : null,
        newlyReached: [...newSums], newlyReachedCount: newCount,
        history: history.slice(-6).map(row => ({ ...row, added: [...row.added] })),
        historyOmitted: Math.max(0, history.length - 6), shortened,
        answer, partition: chosen ? { a: [...chosen], b: nums.map((_, index) => index).filter(index => !chosenSet.has(index)) } : null,
      },
    });
  }
  total = nums.reduce((sum, num) => sum + num, 0);
  locals.total = total;
  emit(3, "total", bi(`Tổng tất cả số = ${total}`, `Sum of all numbers = ${total}`), bi("Hai nhóm bằng nhau phải có tổng bằng một nửa tổng mảng.", "Both groups must sum to half the array's total."));
  const odd = total % 2 !== 0;
  if (odd) answer = false;
  emit(4, odd ? "odd-return" : "even-check", bi(odd ? "Tổng lẻ → không chia được" : "Tổng chẵn → tiếp tục", odd ? "Odd total → cannot partition" : "Even total → continue"), bi(odd ? `${total} ÷ 2 không nguyên, nên trả về False ngay.` : "Chỉ cần tìm một nhóm tổng total / 2; nhóm còn lại tự có cùng tổng.", odd ? `${total} ÷ 2 is not an integer, so return False immediately.` : "Find one group totaling total / 2; the rest will automatically have the same sum."), odd);
  if (odd) return { original: [...nums], answer: false, steps };
  target = total / 2;
  locals.target = target;
  emit(5, "target", bi(`Mỗi nhóm cần tổng ${target}`, `Each group needs sum ${target}`), bi(`Tìm một tập con tổng ${target}, không cần thử cách chia cả hai nhóm cùng lúc.`, `Find a subset summing to ${target}; there is no need to search both groups simultaneously.`));
  dp = Array(target + 1).fill(false);
  parents = Array(target + 1).fill(null);
  locals.dp = dp;
  emit(6, "init-dp", bi("dp[s] = có tạo được tổng s không?", "dp[s] = can we make sum s?"), bi("Mỗi ô là một tổng, không phải một phần tử nums. Ban đầu các ô đều False.", "Each cell represents a sum, not an element of nums. Initially all cells are False."));
  dp[0] = true;
  reachableCount = 1;
  emit(7, "zero", bi("Tổng 0 tạo được bằng nhóm rỗng", "Sum 0 is reachable with the empty group"), bi("Chưa chọn số nào: chỉ tổng 0 có thể tạo được.", "Before choosing any number, only sum 0 is reachable."));
  nums.forEach((num, index) => {
    itemIndex = index;
    locals.num = num;
    rowBefore = [...dp];
    transition = null;
    newSums = [];
    newCount = 0;
    emit(8, "choose-number", bi(`Xét nums[${index}] = ${num}`, `Process nums[${index}] = ${num}`), bi(`Giữ hàng Trước để thấy các tổng tạo được bằng ${index} số trước đó. Số hiện tại chỉ dùng tối đa một lần.`, `The Before row shows sums reachable using the previous ${index} numbers. Use this occurrence at most once.`));
    if (num > target) {
      history.push({ item: index, num, added: [], addedCount: 0, reachableCount });
      emit(9, "skip-large", bi(`${num} > ${target}: không có ô để cập nhật`, `${num} > ${target}: no cells to update`), bi("range này rỗng. Bỏ qua số quá lớn; không thể dùng số dương này để tạo target.", "This range is empty. Skip this positive value because it exceeds the target."));
      return;
    }
    for (let j = target; j >= num; j--) {
      locals.j = j;
      const before = dp[j];
      const source = dp[j - num];
      const recording = steps.length < MAX_TRACE_STEPS;
      if (recording) {
        transition = { destination: j, source: j - num, before, from: source, after: before || source, sourceWitness: witness(j - num) || [], existingWitness: witness(j) || [], changed: !before && source };
        emit(9, "inspect", bi(`Thử tổng ${j}: cần tổng ${j - num} + ${num}`, `Try sum ${j}: need ${j - num} + ${num}`), bi("Nguồn j−num ở bên trái, chưa được cập nhật bằng số hiện tại. Nó vẫn thuộc hàng Trước.", "Source j−num is to the left and has not been updated with this occurrence. It still belongs to the Before row."));
      } else shortened = true;
      dp[j] = before || source;
      if (!before && source) {
        parents[j] = { from: j - num, item: index };
        reachableCount++;
        newCount++;
        if (newSums.length < 16) newSums.push(j);
      }
      if (j === num) history.push({ item: index, num, added: [...newSums].sort((a, b) => a - b), addedCount: newCount, reachableCount });
      if (recording) emit(10, "update", bi(`dp[${j}] = ${before ? "True" : "False"} or ${source ? "True" : "False"} → ${dp[j] ? "True" : "False"}`, `dp[${j}] = ${before ? "True" : "False"} or ${source ? "True" : "False"} → ${dp[j] ? "True" : "False"}`), bi(before ? "Đã tạo được tổng này trước đó: có thể không chọn số hiện tại." : source ? `Tạo được tổng mới ${j}: lấy nhóm tổng ${j - num}, thêm đúng số ở vị trí ${index}.` : `Chưa tạo được tổng ${j - num}, nên thêm ${num} vẫn chưa tạo được ${j}.`, before ? "This sum was already reachable: we may skip the current number." : source ? `New sum ${j}: take a group totaling ${j - num} and add the occurrence at index ${index}.` : `Sum ${j - num} is unreachable, so adding ${num} cannot make ${j}.`));
    }
  });
  answer = dp[target];
  itemIndex = null;
  transition = null;
  rowBefore = null;
  newSums = [];
  newCount = 0;
  emit(11, "return", bi(answer ? "Có thể chia thành hai nhóm bằng nhau" : "Không tạo được tổng target", answer ? "Two equal-sum groups exist" : "Target sum is unreachable"), bi(`dp[${target}] = ${answer ? "True" : "False"}.`, `dp[${target}] = ${answer ? "True" : "False"}.`), true);
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
    defaultInput: [1, 5, 11, 5], inputKind: "positive",
    inputLabel: bi("nums (1–200 phần tử, giá trị 1–100)", "nums (1–200 values, each 1–100)"),
    extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("Tổng lẻ thì False. Tổng chẵn: tìm một nhóm tổng target = total / 2.", "An odd total returns False. Otherwise find a subset totaling target = total / 2."),
      bi("dp[s] là True khi các số đã xét tạo được tổng s. dp[0] = True ứng với nhóm rỗng.", "dp[s] is True when processed numbers can make sum s. dp[0] = True represents the empty group."),
      bi("Với số num: dp[j] = dp[j] or dp[j−num]. Không chọn num, hoặc thêm num vào nhóm tổng j−num.", "For num: dp[j] = dp[j] or dp[j−num]. Skip num, or add it to a group totaling j−num."),
      bi("Duyệt j từ phải sang trái để nguồn j−num chưa dùng số hiện tại. Nhờ đó không chọn cùng một phần tử hai lần.", "Scan j from right to left so source j−num has not used this occurrence. This prevents using one occurrence twice."),
    ],
    complexity: { time: "O(n × target)", space: "O(target)", note: bi("Độ phức tạp của mã Python. Mô phỏng thêm bản sao và nhóm minh họa; trace dài được rút gọn nhưng vẫn tính đầy đủ đáp án.", "Complexity of the Python solution. The visualization also stores snapshots and witness groups; long traces are shortened while the full answer is computed.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseNums(input)],
  },
};
