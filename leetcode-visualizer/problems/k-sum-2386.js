"use strict";

const { bi } = require("./hard-viz-shared");

const PROBLEM_ID = 2386;
const MAX_NUMS = 100_000;
const MAX_K = 2_000;
const MAX_VALUE = 1_000_000_000;
const MAX_TRACE_STEPS = 420;
const MAX_WITNESS_SIZE = 200;

const SOURCE = Object.freeze([
  "from heapq import heappop, heappush",
  "from typing import List",
  "",
  "class Solution:",
  "    def kSum(self, nums: List[int], k: int) -> int:",
  "        maximum = sum(value for value in nums if value > 0)",
  "        values = sorted(abs(value) for value in nums)",
  "        if k == 1:",
  "            return maximum",
  "        heap = [(values[0], 0)]",
  "        loss = 0",
  "        for _ in range(k - 1):",
  "            loss, index = heappop(heap)",
  "            if index + 1 < len(values):",
  "                next_index = index + 1",
  "                heappush(heap, (loss + values[next_index], next_index))",
  "                heappush(heap, (loss - values[index] + values[next_index], next_index))",
  "        return maximum - loss",
]);

class MinHeap2386 {
  constructor() {
    this.data = [];
  }

  compare(left, right) {
    return left.loss - right.loss || left.index - right.index || left.id - right.id;
  }

  push(entry) {
    this.data.push(entry);
    let index = this.data.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.data[parent], this.data[index]) <= 0) break;
      [this.data[parent], this.data[index]] = [this.data[index], this.data[parent]];
      index = parent;
    }
  }

  pop() {
    const root = this.data[0];
    const tail = this.data.pop();
    if (this.data.length) {
      this.data[0] = tail;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < this.data.length && this.compare(this.data[left], this.data[smallest]) < 0) smallest = left;
        if (right < this.data.length && this.compare(this.data[right], this.data[smallest]) < 0) smallest = right;
        if (smallest === index) break;
        [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
        index = smallest;
      }
    }
    return root;
  }
}

function parseNums2386(input) {
  let raw = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (!text) throw new RangeError(`#${PROBLEM_ID}: nums không được rỗng / must not be empty.`);
    if (text.startsWith("[")) {
      try {
        raw = JSON.parse(text);
      } catch (_error) {
        throw new TypeError(`#${PROBLEM_ID}: nums phải là JSON hợp lệ / must be valid JSON.`);
      }
    } else {
      raw = text.split(",").map((value) => Number(value.trim()));
    }
  }
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_NUMS) {
    throw new RangeError(`#${PROBLEM_ID}: cần 1..${MAX_NUMS} số / provide 1..${MAX_NUMS} values.`);
  }
  return raw.map((value, index) => {
    if (!Number.isSafeInteger(value) || value < -MAX_VALUE || value > MAX_VALUE) {
      throw new RangeError(`#${PROBLEM_ID}: nums[${index}] phải là integer trong [-${MAX_VALUE}, ${MAX_VALUE}].`);
    }
    return value;
  });
}

function parseInput2386(input, params = {}) {
  const nums = parseNums2386(input);
  const k = Number(params.k ?? 5);
  const maximumRank = nums.length < 11 ? Math.min(MAX_K, 2 ** nums.length) : MAX_K;
  if (!Number.isSafeInteger(k) || k < 1 || k > maximumRank) {
    throw new RangeError(`#${PROBLEM_ID}: k phải thuộc 1..${maximumRank} cho input này.`);
  }
  return { nums, k };
}

function buildSteps2386(input, params = {}) {
  const { nums, k } = parseInput2386(input, params);
  const maximum = nums.reduce((sum, value) => sum + Math.max(value, 0), 0);
  const values = nums.map((value, originalIndex) => ({
    value: Math.abs(value),
    originalIndex,
    originalValue: value,
  })).sort((left, right) => left.value - right.value || left.originalIndex - right.originalIndex);
  const heap = new MinHeap2386();
  const includeWitness = nums.length <= MAX_WITNESS_SIZE;
  const baseSelectedIndices = includeWitness
    ? nums.flatMap((value, index) => value > 0 ? [index] : [])
    : [];
  const history = [{ rank: 1, loss: 0, sum: maximum, chosen: [], selectedIndices: baseSelectedIndices }];
  const steps = [];
  let current = null;
  let branch = null;
  let answer = maximum;
  let nextId = 1;
  let traceTruncated = false;

  const selectedIndicesFor = (chosen) => {
    if (!includeWitness) return [];
    const flipped = new Set(chosen.map((index) => values[index].originalIndex));
    return nums.flatMap((value, index) => ((value > 0) !== flipped.has(index)) ? [index] : []);
  };
  const stateView = (state, position = null) => state ? ({
    id: state.id,
    loss: state.loss,
    index: state.index,
    chosen: [...state.chosen],
    chosenValues: state.chosen.map((index) => values[index].value),
    originalIndices: state.chosen.map((index) => values[index].originalIndex),
    origin: state.origin,
    position,
  }) : null;
  const compactHistory = () => history.length <= 28
    ? history.map((entry) => ({ ...entry, chosen: [...entry.chosen], selectedIndices: [...entry.selectedIndices] }))
    : [...history.slice(0, 3), ...history.slice(-25)].map((entry) => ({ ...entry, chosen: [...entry.chosen], selectedIndices: [...entry.selectedIndices] }));
  const normalizedPreview = () => {
    const wanted = new Set(Array.from({ length: Math.min(values.length, 48) }, (_, index) => index));
    for (const index of current?.chosen ?? []) wanted.add(index);
    if (Number.isInteger(current?.index)) wanted.add(current.index + 1);
    return [...wanted].filter((index) => index >= 0 && index < values.length).sort((a, b) => a - b).map((index) => ({
      sortedIndex: index,
      ...values[index],
      chosen: Boolean(current?.chosen.includes(index)),
      active: current?.index === index,
      next: current?.index + 1 === index,
    }));
  };

  const emit = ({ phase, title, note, codeLines, rank = history.at(-1).rank, final = false }) => {
    if (!final && steps.length >= MAX_TRACE_STEPS - 1) {
      traceTruncated = true;
      return;
    }
    const selectedIndices = current ? selectedIndicesFor(current.chosen) : history.at(-1).selectedIndices;
    const flippedOriginalIndices = new Set((current?.chosen ?? []).map((index) => values[index].originalIndex));
    const numberPreview = nums.slice(0, 60).map((value, index) => ({
      index,
      value,
      baseSelected: value > 0,
      selected: (value > 0) !== flippedOriginalIndices.has(index),
      flipped: flippedOriginalIndices.has(index),
    }));
    const frontier = heap.data.slice(0, 40).map((state, position) => stateView(state, position));
    const loss = current?.loss ?? history.at(-1).loss;
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: nums.slice(0, 60),
      sub: nums.slice(0, 60).map((value, index) => `i=${index}${value > 0 ? " · base" : ""}`),
      highlight: current ? current.chosen.map((index) => values[index].originalIndex).filter((index) => index < 60) : [],
      mark: numberPreview.filter((item) => item.selected).map((item) => item.index),
      vars: [
        { name: "maximum", value: maximum },
        { name: "rank", value: rank },
        { name: "loss", value: loss },
        { name: "candidate", value: maximum - loss },
        { name: "heap size", value: heap.data.length },
      ],
      kSum2386View: {
        phase,
        n: nums.length,
        k,
        maximum,
        rank,
        loss,
        candidate: maximum - loss,
        numbers: numberPreview,
        numbersTruncated: nums.length > numberPreview.length,
        normalized: normalizedPreview(),
        normalizedTruncated: values.length > 48,
        current: stateView(current),
        branch: branch ? { type: branch.type, parent: stateView(branch.parent), child: stateView(branch.child) } : null,
        frontier,
        frontierSize: heap.data.length,
        history: compactHistory(),
        selectedIndices,
        selectedValues: selectedIndices.map((index) => nums[index]),
        witnessTruncated: !includeWitness,
        traceTruncated,
        answer: final ? answer : null,
      },
    });
  };

  emit({
    phase: "maximum",
    title: bi(`Maximum subsequence sum = ${maximum}`, `Maximum subsequence sum = ${maximum}`),
    note: bi("Lấy mọi số dương, bỏ mọi số âm. Đây là subsequence sum lớn nhất và là rank 1.", "Take every positive value and skip every negative value. This is the largest subsequence sum and rank 1."),
    codeLines: [1, 2, 4, 5, 6],
    rank: 1,
  });
  emit({
    phase: "normalize",
    title: bi("Đổi mọi quyết định thành một “loss” không âm", "Convert every decision into a non-negative loss"),
    note: bi("Bỏ số dương x hoặc thêm số âm −x đều làm maximum giảm đúng |x|. Vì vậy chỉ cần sort |nums|.", "Removing a positive x or adding a negative −x both reduce maximum by exactly |x|. Therefore only sorted |nums| matters."),
    codeLines: [7],
    rank: 1,
  });

  if (k === 1) {
    answer = maximum;
    emit({
      phase: "done",
      title: bi(`k = 1 nên đáp án là ${answer}`, `k = 1, so the answer is ${answer}`),
      note: bi("Không cần mở heap: loss nhỏ nhất đầu tiên là 0.", "No heap is needed: the first smallest loss is 0."),
      codeLines: [8, 9],
      rank: 1,
      final: true,
    });
    return { original: nums, k, answer, history, steps };
  }

  const seed = { id: nextId++, loss: values[0].value, index: 0, chosen: [0], origin: "seed" };
  heap.push(seed);
  branch = { type: "seed", parent: null, child: seed };
  emit({
    phase: "seed",
    title: bi(`Seed heap với loss ${seed.loss}`, `Seed the heap with loss ${seed.loss}`),
    note: bi("Rank 1 dùng loss 0. Ứng viên tiếp theo flip trị tuyệt đối nhỏ nhất.", "Rank 1 uses loss 0. The next candidate flips the smallest absolute value."),
    codeLines: [10, 11],
    rank: 1,
  });

  for (let rank = 2; rank <= k; rank += 1) {
    branch = null;
    current = heap.pop();
    answer = maximum - current.loss;
    history.push({
      rank,
      loss: current.loss,
      sum: answer,
      chosen: [...current.chosen],
      selectedIndices: selectedIndicesFor(current.chosen),
    });
    emit({
      phase: "pop",
      title: bi(`Pop loss nhỏ nhất ${current.loss} → rank ${rank} là ${answer}`, `Pop minimum loss ${current.loss} → rank ${rank} is ${answer}`),
      note: bi("Min-heap đưa loss tăng dần, nên maximum − loss xuất hiện theo thứ tự không tăng. Tổng trùng nhau vẫn là các rank riêng.", "The min-heap emits losses in ascending order, so maximum − loss is non-increasing. Equal sums still occupy separate ranks."),
      codeLines: [12, 13],
      rank,
    });

    const nextIndex = current.index + 1;
    if (nextIndex < values.length) {
      const addChild = {
        id: nextId++,
        loss: current.loss + values[nextIndex].value,
        index: nextIndex,
        chosen: [...current.chosen, nextIndex],
        origin: "add",
      };
      heap.push(addChild);
      branch = { type: "add", parent: current, child: addChild };
      emit({
        phase: "branch-add",
        title: bi(`Nhánh ADD: ${current.loss} + ${values[nextIndex].value} = ${addChild.loss}`, `ADD branch: ${current.loss} + ${values[nextIndex].value} = ${addChild.loss}`),
        note: bi("Giữ mọi flip hiện tại rồi thêm phần tử kế tiếp trong dãy |nums| đã sort.", "Keep every current flip and add the next item in sorted |nums|."),
        codeLines: [14, 15, 16],
        rank,
      });

      const replaceChild = {
        id: nextId++,
        loss: current.loss - values[current.index].value + values[nextIndex].value,
        index: nextIndex,
        chosen: [...current.chosen.slice(0, -1), nextIndex],
        origin: "replace",
      };
      heap.push(replaceChild);
      branch = { type: "replace", parent: current, child: replaceChild };
      emit({
        phase: "branch-replace",
        title: bi(`Nhánh REPLACE: ${current.loss} − ${values[current.index].value} + ${values[nextIndex].value} = ${replaceChild.loss}`, `REPLACE branch: ${current.loss} − ${values[current.index].value} + ${values[nextIndex].value} = ${replaceChild.loss}`),
        note: bi("Thay flip cuối bằng phần tử kế tiếp. Cặp ADD/REPLACE chia toàn bộ state con thành hai nhóm, không bỏ sót subset.", "Replace the last flip with the next item. ADD/REPLACE partition all child states into two groups without missing a subset."),
        codeLines: [17],
        rank,
      });
    }
  }

  branch = null;
  emit({
    phase: "done",
    title: bi(`K-sum thứ ${k} = ${maximum} − ${current.loss} = ${answer}`, `K-sum rank ${k} = ${maximum} − ${current.loss} = ${answer}`),
    note: bi("Đã pop đúng k − 1 loss sau loss 0; state hiện tại chứng minh trực tiếp subsequence đạt đáp án.", "Exactly k − 1 losses were popped after loss 0; the current state directly witnesses a subsequence with the answer."),
    codeLines: [18],
    rank: k,
    final: true,
  });

  return { original: nums, k, answer, history, steps };
}

module.exports = {
  2386: {
    id: 2386,
    difficulty: "hard",
    slug: "find-the-k-sum-of-an-array",
    category: { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
    tags: [
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "best-first-search", vi: "Tìm kiếm tốt nhất trước", en: "Best-First Search" },
      { key: "subset-sum", vi: "Tổng tập con", en: "Subset Sum" },
    ],
    title: bi("Find the K-Sum of an Array", "Find the K-Sum of an Array"),
    titleVi: bi("Tổng subsequence lớn thứ k", "K-th largest subsequence sum"),
    statement: bi("Xét tổng của mọi subsequence, kể cả rỗng và kể cả các tổng trùng nhau. Trả tổng lớn thứ k.", "Consider every subsequence sum, including the empty subsequence and duplicate sums. Return the k-th largest."),
    defaultInput: [2, 4, -2],
    inputKind: "integer",
    inputLabel: bi("nums (cách nhau bởi dấu phẩy)", "nums (comma separated)"),
    extraParams: [{ key: "k", label: bi("k (thứ hạng)", "k (rank)"), default: 5, min: 1, max: MAX_K }],
    debugMode: "line-by-line",
    approach: [
      bi("maximum lấy mọi số dương. Mọi subsequence khác bằng maximum trừ một loss trên |nums|.", "maximum takes every positive number. Every other subsequence equals maximum minus a loss over |nums|."),
      bi("Sort |nums| rồi dùng min-heap liệt kê loss nhỏ nhất kế tiếp; loss tăng thì k-sum giảm.", "Sort |nums| and use a min-heap to enumerate the next smallest loss; increasing losses produce decreasing k-sums."),
      bi("Mỗi state sinh hai nhánh: ADD phần tử kế tiếp, hoặc REPLACE phần tử cuối bằng phần tử kế tiếp.", "Each state creates two branches: ADD the next item, or REPLACE its last item with the next item."),
    ],
    complexity: {
      time: "O(n log n + k log k)",
      space: "O(n + k)",
      note: bi("Sort n trị tuyệt đối; mỗi trong k − 1 lượt pop tối đa hai state heap.", "Sort n absolute values; each of k − 1 pops pushes at most two heap states."),
    },
    code: SOURCE,
    parseInput: parseInput2386,
    liveArgs: (input, params) => {
      const { nums, k } = parseInput2386(input, params);
      return [nums, k];
    },
    builder: buildSteps2386,
  },
};
