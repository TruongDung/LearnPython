"use strict";

const MAX_VECTOR_LENGTH = 24;
const DESIGN = { key: "design", vi: "Thiết kế", en: "Design" };
const HASHMAP = { key: "hashmap", vi: "Hash Map", en: "Hash Map" };
const TWO_POINTER = { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" };
const BINARY_SEARCH = { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" };

const BRUTE_FORCE_CODE = [
  "class SparseVector:",
  "    def __init__(self, nums):",
  "        self.nums = nums",
  "",
  "    def dotProduct(self, vec):",
  "        result = 0",
  "        for i in range(len(self.nums)):",
  "            result += self.nums[i] * vec.nums[i]",
  "        return result",
];

const HASH_MAP_CODE = [
  "class SparseVector:",
  "    def __init__(self, nums):",
  "        self.values = {}",
  "        for index, value in enumerate(nums):",
  "            if value != 0:",
  "                self.values[index] = value",
  "",
  "    def dotProduct(self, other):",
  "        if len(self.values) <= len(other.values):",
  "            smaller, larger = self.values, other.values",
  "        else:",
  "            smaller, larger = other.values, self.values",
  "",
  "        total = 0",
  "        for index, value in smaller.items():",
  "            counterpart = larger.get(index)",
  "            if counterpart is not None:",
  "                total += value * counterpart",
  "        return total",
];

const HASH_MEMBERSHIP_CODE = [
  "from typing import List",
  "",
  "class SparseVector:",
  "    def __init__(self, nums: List[int]):",
  "        self.nums = {}",
  "",
  "        for i, num in enumerate(nums):",
  "            if num != 0:",
  "                self.nums[i] = num",
  "",
  "    def dotProduct(self, vec: 'SparseVector') -> int:",
  "        result = 0",
  "",
  "        for i, num in self.nums.items():",
  "            if i in vec.nums:",
  "                result += num * vec.nums[i]",
  "",
  "        return result",
];

const TWO_POINTER_CODE = [
  "class SparseVector:",
  "    def __init__(self, nums):",
  "        self.pairs = []",
  "        for index, value in enumerate(nums):",
  "            if value != 0:",
  "                self.pairs.append((index, value))",
  "",
  "    def dotProduct(self, other):",
  "        left = right = 0",
  "        total = 0",
  "        while left < len(self.pairs) and right < len(other.pairs):",
  "            left_index, left_value = self.pairs[left]",
  "            right_index, right_value = other.pairs[right]",
  "            if left_index < right_index:",
  "                left += 1",
  "            elif left_index > right_index:",
  "                right += 1",
  "            else:",
  "                total += left_value * right_value",
  "                left += 1",
  "                right += 1",
  "        return total",
];

const BINARY_SEARCH_CODE = [
  "class SparseVector:",
  "    def __init__(self, nums):",
  "        self.pairs = []",
  "        for i, num in enumerate(nums):",
  "            if num != 0:",
  "                self.pairs.append((i, num))",
  "",
  "    def dotProduct(self, vec):",
  "        result = 0",
  "        for i, num in self.pairs:",
  "            left, right = 0, len(vec.pairs) - 1",
  "            while left <= right:",
  "                mid = (left + right) // 2",
  "                other_i, other_num = vec.pairs[mid]",
  "                if other_i == i:",
  "                    result += num * other_num",
  "                    break",
  "                if other_i < i:",
  "                    left = mid + 1",
  "                else:",
  "                    right = mid - 1",
  "        return result",
];

function parseSparseVectors(input) {
  if (typeof input !== "string") {
    throw new Error("Input must be exactly two comma-separated integer vectors: nums1|nums2.");
  }

  const parts = input.split("|");
  if (parts.length !== 2 || parts.some((part) => part.trim() === "")) {
    throw new Error("Input must contain exactly one | separator and two nonempty vectors.");
  }

  const parseVector = (part) => {
    const tokens = part.split(",");
    if (tokens.some((token) => token.trim() === "")) {
      throw new Error("Vector entries cannot be empty.");
    }

    return tokens.map((token) => {
      const normalized = token.trim();
      if (!/^[+-]?\d+$/.test(normalized)) {
        throw new Error(`Invalid integer entry: ${normalized || "(empty)"}.`);
      }
      const value = Number(normalized);
      if (!Number.isSafeInteger(value)) {
        throw new Error(`Integer entry is outside the safe range: ${normalized}.`);
      }
      return value;
    });
  };

  const left = parseVector(parts[0]);
  const right = parseVector(parts[1]);
  if (left.length !== right.length) {
    throw new Error("The two vectors must have equal length.");
  }
  if (left.length > MAX_VECTOR_LENGTH) {
    throw new Error(`Visualization supports vectors of at most ${MAX_VECTOR_LENGTH} entries.`);
  }

  return [[...left], [...right]];
}

function emptyCurrent() {
  return {
    index: null,
    leftIndex: null,
    leftValue: null,
    rightIndex: null,
    rightValue: null,
    relation: null,
    product: null,
  };
}

function initialState() {
  return {
    build: {
      side: null,
      index: null,
      value: null,
      action: null,
      processed: { left: 0, right: 0 },
    },
    iteratedSide: null,
    cursors: { left: null, right: null, iteration: null },
    current: emptyCurrent(),
    runningTotal: 0,
    contributions: [],
  };
}

function sparseText(entries) {
  return `{${entries.map(({ index, value }) => `${index}:${value}`).join(", ")}}`;
}

function createSnapshotter({ strategy, codeBlock, left, right, sparseLeft, sparseRight, state, steps }) {
  return function snapshot({ title, note, phase, codeLines, highlight = [], mark, final = false, vars = [] }) {
    const contributionMarks = state.contributions.map(({ index }) => index);
    steps.push({
      title: { ...title },
      note: { ...note },
      arr: [...left],
      highlight: [...highlight],
      mark: mark ? [...mark] : contributionMarks,
      final: Boolean(final),
      codeLines: [...codeLines],
      ...(codeBlock > 1 ? { codeBlock } : {}),
      vars: [
        { name: "strategy", value: strategy },
        { name: "left sparse", value: sparseText(sparseLeft) },
        { name: "right sparse", value: sparseText(sparseRight) },
        { name: "running total", value: state.runningTotal },
        ...vars.map((entry) => ({ ...entry })),
      ],
      sparseVector1570View: {
        strategy,
        phase,
        dense: { left: [...left], right: [...right] },
        sparse: {
          left: sparseLeft.map((entry) => ({ ...entry })),
          right: sparseRight.map((entry) => ({ ...entry })),
        },
        build: {
          side: state.build.side,
          index: state.build.index,
          value: state.build.value,
          action: state.build.action,
          processed: { ...state.build.processed },
        },
        iteratedSide: state.iteratedSide,
        cursors: { ...state.cursors },
        current: { ...state.current },
        runningTotal: state.runningTotal,
        contributions: state.contributions.map((entry) => ({ ...entry })),
        answer: final ? state.runningTotal : null,
      },
    });
  };
}

function compressVector({ dense, sparse, side, state, snapshot, lineOffset = 0 }) {
  const sideVi = side === "left" ? "trái" : "phải";
  for (let index = 0; index < dense.length; index++) {
    const value = dense[index];
    const stored = value !== 0;
    if (stored) sparse.push({ index, value });

    state.build = {
      side,
      index,
      value,
      action: stored ? "store" : "skip-zero",
      processed: { ...state.build.processed, [side]: index + 1 },
    };
    state.current = emptyCurrent();
    state.cursors = { left: null, right: null, iteration: null };
    snapshot({
      phase: "compression",
      title: stored
        ? { vi: `Lưu vector ${sideVi}[${index}] = ${value}`, en: `Store ${side} vector[${index}] = ${value}` }
        : { vi: `Bỏ qua số 0 tại vector ${sideVi}[${index}]`, en: `Skip zero at ${side} vector[${index}]` },
      note: stored
        ? { vi: `Giữ cặp {index: ${index}, value: ${value}} trong biểu diễn thưa.`, en: `Keep {index: ${index}, value: ${value}} in the sparse representation.` }
        : { vi: "Số 0 không thể đóng góp vào tích vô hướng nên không cần lưu.", en: "Zero cannot contribute to the dot product, so it is not stored." },
      codeLines: stored ? [4, 5, 6].map((line) => line + lineOffset) : [4, 5].map((line) => line + lineOffset),
      highlight: [index],
      vars: [
        { name: "build side", value: side },
        { name: "dense index", value: index },
        { name: "action", value: stored ? "store" : "skip zero" },
      ],
    });
  }
}

function markBuildComplete(state, length) {
  state.build = {
    side: null,
    index: null,
    value: null,
    action: "complete",
    processed: { left: length, right: length },
  };
}

function buildSteps1570BruteForce(input) {
  const [left, right] = parseSparseVectors(input);
  const denseEntries = (values) => values.map((value, index) => ({ index, value }));
  const sparseLeft = denseEntries(left);
  const sparseRight = denseEntries(right);
  const state = initialState();
  const steps = [];
  const snapshot = createSnapshotter({
    strategy: "brute-force",
    codeBlock: 1,
    left,
    right,
    sparseLeft,
    sparseRight,
    state,
    steps,
  });

  state.build = {
    side: null,
    index: null,
    value: null,
    action: "store-all",
    processed: { left: left.length, right: right.length },
  };
  state.iteratedSide = "both";
  snapshot({
    phase: "initialize",
    title: { vi: "Giữ nguyên hai mảng", en: "Keep both full arrays" },
    note: { vi: "Không nén; mỗi index đều sẽ được nhân.", en: "No compression; multiply every index." },
    codeLines: [3],
  });

  for (let index = 0; index < left.length; index++) {
    const product = left[index] * right[index];
    state.cursors = { left: index, right: index, iteration: index };
    state.current = {
      index,
      leftIndex: index,
      leftValue: left[index],
      rightIndex: index,
      rightValue: right[index],
      relation: "match",
      product,
    };
    snapshot({
      phase: "brute-force",
      title: { vi: `Index ${index}: ${left[index]} × ${right[index]}`, en: `Index ${index}: ${left[index]} × ${right[index]}` },
      note: { vi: "Nhân cả index có số 0.", en: "Multiply every index, including zeros." },
      codeLines: [7, 8],
      highlight: [index],
      vars: [{ name: "product", value: product }],
    });

    state.runningTotal += product;
    state.contributions.push({
      index,
      leftValue: left[index],
      rightValue: right[index],
      product,
      totalAfter: state.runningTotal,
    });
    snapshot({
      phase: "brute-force",
      title: { vi: `result = ${state.runningTotal}`, en: `result = ${state.runningTotal}` },
      note: { vi: `Cộng ${product} vào tổng.`, en: `Add ${product} to the total.` },
      codeLines: [8],
      highlight: [index],
      vars: [{ name: "product", value: product }, { name: "result", value: state.runningTotal }],
    });
  }

  state.current = emptyCurrent();
  state.cursors = { left: left.length, right: right.length, iteration: left.length };
  snapshot({
    phase: "complete",
    title: { vi: `Trả về ${state.runningTotal}`, en: `Return ${state.runningTotal}` },
    note: { vi: "Đã duyệt toàn bộ n index.", en: "All n indices have been checked." },
    codeLines: [9],
    final: true,
  });

  return { original: [[...left], [...right]], answer: state.runningTotal, steps };
}

function buildSteps1570HashMap(input) {
  const [left, right] = parseSparseVectors(input);
  const sparseLeft = [];
  const sparseRight = [];
  const state = initialState();
  const steps = [];
  const snapshot = createSnapshotter({
    strategy: "hash-map",
    codeBlock: 3,
    left,
    right,
    sparseLeft,
    sparseRight,
    state,
    steps,
  });

  compressVector({ dense: left, sparse: sparseLeft, side: "left", state, snapshot });
  compressVector({ dense: right, sparse: sparseRight, side: "right", state, snapshot });
  markBuildComplete(state, left.length);

  const iterateLeft = sparseLeft.length <= sparseRight.length;
  const smaller = iterateLeft ? sparseLeft : sparseRight;
  const larger = iterateLeft ? sparseRight : sparseLeft;
  const largerLookup = new Map(larger.map((entry, position) => [entry.index, { entry, position }]));
  state.iteratedSide = iterateLeft ? "left" : "right";
  state.current = emptyCurrent();
  state.cursors = { left: null, right: null, iteration: 0 };
  snapshot({
    phase: "select-smaller",
    title: {
      vi: `Duyệt map ${state.iteratedSide === "left" ? "trái" : "phải"} nhỏ hơn (${smaller.length} entry)`,
      en: `Iterate the smaller ${state.iteratedSide} map (${smaller.length} entries)`,
    },
    note: {
      vi: "Duyệt map có ít phần tử khác 0 hơn; mỗi index chỉ cần một phép tra cứu expected O(1) trong map còn lại.",
      en: "Iterate the map with fewer nonzero entries; each index needs one expected O(1) lookup in the other map.",
    },
    codeLines: iterateLeft ? [9, 10] : [9, 11, 12],
    vars: [{ name: "iterated side", value: state.iteratedSide }],
  });

  for (let position = 0; position < smaller.length; position++) {
    const candidate = smaller[position];
    const counterpart = largerLookup.get(candidate.index);
    state.cursors = {
      left: iterateLeft ? position : null,
      right: iterateLeft ? null : position,
      iteration: position,
    };
    state.current = {
      index: candidate.index,
      leftIndex: candidate.index,
      leftValue: left[candidate.index],
      rightIndex: candidate.index,
      rightValue: right[candidate.index],
      relation: "probe",
      product: null,
    };
    snapshot({
      phase: "probe",
      title: { vi: `Tra index ${candidate.index} trong map còn lại`, en: `Probe index ${candidate.index} in the other map` },
      note: { vi: "Entry của map nhỏ hơn cung cấp index cần tra cứu.", en: "An entry from the smaller map supplies the index to look up." },
      codeLines: [15, 16],
      highlight: [candidate.index],
      vars: [{ name: "probe index", value: candidate.index }],
    });

    if (!counterpart) {
      state.current = { ...state.current, relation: "missing", product: 0 };
      snapshot({
        phase: "miss",
        title: { vi: `Index ${candidate.index} không có ở map còn lại`, en: `Index ${candidate.index} is absent from the other map` },
        note: { vi: "Một phía bằng 0 tại index này, nên đóng góp bằng 0 và total không đổi.", en: "One side is zero at this index, so the contribution is zero and the total stays unchanged." },
        codeLines: [17],
        highlight: [candidate.index],
        vars: [{ name: "product", value: 0 }],
      });
      continue;
    }

    if (iterateLeft) state.cursors.right = counterpart.position;
    else state.cursors.left = counterpart.position;
    const product = left[candidate.index] * right[candidate.index];
    state.current = { ...state.current, relation: "match", product };
    snapshot({
      phase: "match",
      title: { vi: `Khớp index ${candidate.index}: ${left[candidate.index]} × ${right[candidate.index]}`, en: `Match index ${candidate.index}: ${left[candidate.index]} × ${right[candidate.index]}` },
      note: { vi: "Cả hai map đều lưu index này, nên tích của hai giá trị sẽ đóng góp vào đáp án.", en: "Both maps store this index, so the product of the two values contributes to the answer." },
      codeLines: [17],
      highlight: [candidate.index],
      vars: [{ name: "product", value: product }],
    });

    state.runningTotal += product;
    state.contributions.push({
      index: candidate.index,
      leftValue: left[candidate.index],
      rightValue: right[candidate.index],
      product,
      totalAfter: state.runningTotal,
    });
    snapshot({
      phase: "accumulate",
      title: { vi: `Cộng ${product} → total = ${state.runningTotal}`, en: `Add ${product} → total = ${state.runningTotal}` },
      note: { vi: "Ghi đóng góp vào ledger và cập nhật tổng đang chạy.", en: "Record the contribution in the ledger and update the running total." },
      codeLines: [18],
      highlight: [candidate.index],
      vars: [{ name: "product", value: product }, { name: "total", value: state.runningTotal }],
    });
  }

  state.current = emptyCurrent();
  state.cursors = {
    left: iterateLeft ? sparseLeft.length : null,
    right: iterateLeft ? null : sparseRight.length,
    iteration: smaller.length,
  };
  snapshot({
    phase: "complete",
    title: { vi: `Trả về ${state.runningTotal}`, en: `Return ${state.runningTotal}` },
    note: { vi: "Mọi entry của map nhỏ hơn đã được kiểm tra; ledger chứa toàn bộ index đóng góp.", en: "Every entry in the smaller map has been checked; the ledger contains every contributing index." },
    codeLines: [19],
    final: true,
  });

  return { original: [[...left], [...right]], answer: state.runningTotal, steps };
}

function buildSteps1570HashMembership(input) {
  const [left, right] = parseSparseVectors(input);
  const sparseLeft = [];
  const sparseRight = [];
  const state = initialState();
  const steps = [];
  const snapshot = createSnapshotter({
    strategy: "hash-membership",
    codeBlock: 2,
    left,
    right,
    sparseLeft,
    sparseRight,
    state,
    steps,
  });

  compressVector({ dense: left, sparse: sparseLeft, side: "left", state, snapshot, lineOffset: 2 });
  compressVector({ dense: right, sparse: sparseRight, side: "right", state, snapshot, lineOffset: 2 });
  markBuildComplete(state, left.length);

  const rightPositions = new Map(sparseRight.map((entry, position) => [entry.index, position]));
  state.iteratedSide = "left";
  state.current = emptyCurrent();
  state.cursors = { left: 0, right: null, iteration: 0 };
  snapshot({
    phase: "iterate",
    title: { vi: "Duyệt các cặp trong nums1", en: "Iterate pairs in nums1" },
    note: {
      vi: "Mỗi index của nums1 được kiểm tra trong bảng nums của vector còn lại.",
      en: "Check each nums1 index in the other vector's nums map.",
    },
    codeLines: [14],
  });

  for (let position = 0; position < sparseLeft.length; position++) {
    const candidate = sparseLeft[position];
    const rightPosition = rightPositions.get(candidate.index);
    const rightValue = rightPosition === undefined ? 0 : sparseRight[rightPosition].value;
    state.cursors = { left: position, right: rightPosition ?? null, iteration: position };
    state.current = {
      index: candidate.index,
      leftIndex: candidate.index,
      leftValue: candidate.value,
      rightIndex: candidate.index,
      rightValue,
      relation: "probe",
      product: null,
    };
    snapshot({
      phase: "probe",
      title: { vi: `Kiểm tra index ${candidate.index}`, en: `Check index ${candidate.index}` },
      note: { vi: "Tìm index này trong vec.nums.", en: "Look for this index in vec.nums." },
      codeLines: [14, 15],
      highlight: [candidate.index],
      vars: [{ name: "index", value: candidate.index }],
    });

    if (rightPosition === undefined) {
      state.current = { ...state.current, relation: "missing", product: 0 };
      snapshot({
        phase: "miss",
        title: { vi: `Không có index ${candidate.index} trong vec.nums`, en: `Index ${candidate.index} is not in vec.nums` },
        note: { vi: "Bỏ qua index này; tổng không đổi.", en: "Skip this index; the total stays unchanged." },
        codeLines: [15],
        highlight: [candidate.index],
        vars: [{ name: "contribution", value: 0 }],
      });
      continue;
    }

    const product = candidate.value * rightValue;
    state.current = { ...state.current, relation: "match", product };
    snapshot({
      phase: "match",
      title: { vi: `${candidate.value} × ${rightValue} tại index ${candidate.index}`, en: `${candidate.value} × ${rightValue} at index ${candidate.index}` },
      note: { vi: "Index có ở cả hai vector.", en: "The index exists in both vectors." },
      codeLines: [16],
      highlight: [candidate.index],
      vars: [{ name: "product", value: product }],
    });

    state.runningTotal += product;
    state.contributions.push({
      index: candidate.index,
      leftValue: candidate.value,
      rightValue,
      product,
      totalAfter: state.runningTotal,
    });
    snapshot({
      phase: "accumulate",
      title: { vi: `Cộng ${product} → result = ${state.runningTotal}`, en: `Add ${product} → result = ${state.runningTotal}` },
      note: { vi: "Cập nhật tổng tích vô hướng.", en: "Update the dot-product total." },
      codeLines: [16],
      highlight: [candidate.index],
      vars: [{ name: "product", value: product }, { name: "result", value: state.runningTotal }],
    });
  }

  state.current = emptyCurrent();
  state.cursors = { left: sparseLeft.length, right: null, iteration: sparseLeft.length };
  snapshot({
    phase: "complete",
    title: { vi: `Trả về ${state.runningTotal}`, en: `Return ${state.runningTotal}` },
    note: { vi: "Đã duyệt hết nums1.", en: "All entries in nums1 have been checked." },
    codeLines: [18],
    final: true,
  });

  return { original: [[...left], [...right]], answer: state.runningTotal, steps };
}

function buildSteps1570TwoPointers(input) {
  const [left, right] = parseSparseVectors(input);
  const sparseLeft = [];
  const sparseRight = [];
  const state = initialState();
  const steps = [];
  const snapshot = createSnapshotter({
    strategy: "two-pointer",
    codeBlock: 4,
    left,
    right,
    sparseLeft,
    sparseRight,
    state,
    steps,
  });

  compressVector({ dense: left, sparse: sparseLeft, side: "left", state, snapshot });
  compressVector({ dense: right, sparse: sparseRight, side: "right", state, snapshot });
  markBuildComplete(state, left.length);

  let leftCursor = 0;
  let rightCursor = 0;
  state.iteratedSide = "both";
  state.cursors = { left: leftCursor, right: rightCursor, iteration: 0 };
  state.current = emptyCurrent();
  snapshot({
    phase: "initialize",
    title: { vi: "Đặt hai con trỏ tại đầu hai danh sách thưa", en: "Place two pointers at the starts of both sparse lists" },
    note: { vi: "Các cặp đã tăng theo index vì được tạo khi quét vector từ trái sang phải.", en: "The pairs are already sorted by index because construction scans each vector from left to right." },
    codeLines: [9, 10],
  });

  let comparisons = 0;
  while (leftCursor < sparseLeft.length && rightCursor < sparseRight.length) {
    const leftEntry = sparseLeft[leftCursor];
    const rightEntry = sparseRight[rightCursor];
    const relation = leftEntry.index < rightEntry.index
      ? "left-before-right"
      : leftEntry.index > rightEntry.index
        ? "left-after-right"
        : "match";
    const product = relation === "match" ? leftEntry.value * rightEntry.value : null;
    state.cursors = { left: leftCursor, right: rightCursor, iteration: comparisons };
    state.current = {
      index: relation === "match" ? leftEntry.index : null,
      leftIndex: leftEntry.index,
      leftValue: leftEntry.value,
      rightIndex: rightEntry.index,
      rightValue: rightEntry.value,
      relation,
      product,
    };
    snapshot({
      phase: "compare",
      title: { vi: `So sánh index ${leftEntry.index} và ${rightEntry.index}`, en: `Compare indices ${leftEntry.index} and ${rightEntry.index}` },
      note: { vi: "Index nhỏ hơn không thể khớp về sau ở vị trí hiện tại của danh sách kia, nên con trỏ đó sẽ tiến.", en: "The smaller index cannot match at the other list's current position, so that pointer must advance." },
      codeLines: [11, 12, 13],
      highlight: [...new Set([leftEntry.index, rightEntry.index])],
      vars: [{ name: "relation", value: relation }],
    });
    comparisons += 1;

    if (leftEntry.index < rightEntry.index) {
      leftCursor += 1;
      state.cursors = { left: leftCursor, right: rightCursor, iteration: comparisons };
      snapshot({
        phase: "advance-left",
        title: { vi: `Index trái nhỏ hơn → left = ${leftCursor}`, en: `Left index is smaller → left = ${leftCursor}` },
        note: { vi: `Bỏ qua index ${leftEntry.index}; vector phải không có non-zero tương ứng.`, en: `Skip index ${leftEntry.index}; the right vector has no corresponding nonzero value.` },
        codeLines: [14, 15],
        highlight: [leftEntry.index],
      });
      continue;
    }

    if (leftEntry.index > rightEntry.index) {
      rightCursor += 1;
      state.cursors = { left: leftCursor, right: rightCursor, iteration: comparisons };
      snapshot({
        phase: "advance-right",
        title: { vi: `Index phải nhỏ hơn → right = ${rightCursor}`, en: `Right index is smaller → right = ${rightCursor}` },
        note: { vi: `Bỏ qua index ${rightEntry.index}; vector trái không có non-zero tương ứng.`, en: `Skip index ${rightEntry.index}; the left vector has no corresponding nonzero value.` },
        codeLines: [16, 17],
        highlight: [rightEntry.index],
      });
      continue;
    }

    snapshot({
      phase: "match",
      title: { vi: `Khớp index ${leftEntry.index}: ${leftEntry.value} × ${rightEntry.value}`, en: `Match index ${leftEntry.index}: ${leftEntry.value} × ${rightEntry.value}` },
      note: { vi: "Hai con trỏ cùng index, nên tích này đóng góp vào dot product.", en: "Both pointers have the same index, so this product contributes to the dot product." },
      codeLines: [18],
      highlight: [leftEntry.index],
      vars: [{ name: "product", value: product }],
    });

    state.runningTotal += product;
    state.contributions.push({
      index: leftEntry.index,
      leftValue: leftEntry.value,
      rightValue: rightEntry.value,
      product,
      totalAfter: state.runningTotal,
    });
    leftCursor += 1;
    rightCursor += 1;
    state.cursors = { left: leftCursor, right: rightCursor, iteration: comparisons };
    snapshot({
      phase: "accumulate",
      title: { vi: `Cộng ${product} → total = ${state.runningTotal}`, en: `Add ${product} → total = ${state.runningTotal}` },
      note: { vi: "Cập nhật ledger, rồi tiến cả hai con trỏ qua cặp vừa khớp.", en: "Update the ledger, then advance both pointers past the matched pair." },
      codeLines: [19, 20, 21],
      highlight: [leftEntry.index],
      vars: [{ name: "product", value: product }, { name: "total", value: state.runningTotal }],
    });
  }

  state.current = emptyCurrent();
  state.cursors = { left: leftCursor, right: rightCursor, iteration: comparisons };
  snapshot({
    phase: "complete",
    title: { vi: `Trả về ${state.runningTotal}`, en: `Return ${state.runningTotal}` },
    note: { vi: "Ít nhất một danh sách đã hết; không còn index chung nào có thể đóng góp.", en: "At least one sparse list is exhausted; no remaining shared index can contribute." },
    codeLines: [22],
    final: true,
  });

  return { original: [[...left], [...right]], answer: state.runningTotal, steps };
}

function buildSteps1570BinarySearch(input) {
  const [left, right] = parseSparseVectors(input);
  const sparseLeft = [];
  const sparseRight = [];
  const state = initialState();
  const steps = [];
  const snapshot = createSnapshotter({
    strategy: "binary-search",
    codeBlock: 5,
    left,
    right,
    sparseLeft,
    sparseRight,
    state,
    steps,
  });

  compressVector({ dense: left, sparse: sparseLeft, side: "left", state, snapshot });
  compressVector({ dense: right, sparse: sparseRight, side: "right", state, snapshot });
  markBuildComplete(state, left.length);

  state.iteratedSide = "left";
  state.current = emptyCurrent();
  state.cursors = { left: 0, right: null, iteration: 0 };
  snapshot({
    phase: "iterate",
    title: { vi: "Duyệt các cặp khác 0 của nums1", en: "Iterate nonzero pairs in nums1" },
    note: { vi: "Tìm từng index trong danh sách đã sắp xếp của vec.", en: "Search for each index in vec's sorted pairs." },
    codeLines: [10],
  });

  for (let position = 0; position < sparseLeft.length; position++) {
    const candidate = sparseLeft[position];
    let low = 0;
    let high = sparseRight.length - 1;
    let found = false;
    state.cursors = { left: position, right: null, iteration: position };

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const probe = sparseRight[middle];
      state.cursors = { left: position, right: middle, iteration: position };
      state.current = {
        index: candidate.index,
        leftIndex: candidate.index,
        leftValue: candidate.value,
        rightIndex: probe.index,
        rightValue: probe.value,
        relation: candidate.index === probe.index
          ? "match"
          : candidate.index < probe.index ? "left-before-right" : "left-after-right",
        product: null,
      };

      if (candidate.index === probe.index) {
        const product = candidate.value * probe.value;
        state.current = { ...state.current, product };
        snapshot({
          phase: "match",
          title: { vi: `Tìm thấy index ${candidate.index}`, en: `Found index ${candidate.index}` },
          note: { vi: `${candidate.value} × ${probe.value}`, en: `${candidate.value} × ${probe.value}` },
          codeLines: [15, 16, 17],
          highlight: [candidate.index],
          vars: [{ name: "product", value: product }],
        });

        state.runningTotal += product;
        state.contributions.push({
          index: candidate.index,
          leftValue: candidate.value,
          rightValue: probe.value,
          product,
          totalAfter: state.runningTotal,
        });
        snapshot({
          phase: "accumulate",
          title: { vi: `result = ${state.runningTotal}`, en: `result = ${state.runningTotal}` },
          note: { vi: `Cộng ${product} vào tổng.`, en: `Add ${product} to the total.` },
          codeLines: [16],
          highlight: [candidate.index],
          vars: [{ name: "product", value: product }, { name: "result", value: state.runningTotal }],
        });
        found = true;
        break;
      }

      snapshot({
        phase: "compare",
        title: {
          vi: `${candidate.index} ${candidate.index < probe.index ? "<" : ">"} ${probe.index}`,
          en: `${candidate.index} ${candidate.index < probe.index ? "<" : ">"} ${probe.index}`,
        },
        note: {
          vi: candidate.index < probe.index ? "Thu hẹp nửa trái." : "Thu hẹp nửa phải.",
          en: candidate.index < probe.index ? "Keep the left half." : "Keep the right half.",
        },
        codeLines: [15, 18, 19, 20, 21],
        highlight: [candidate.index, probe.index],
        vars: [{ name: "search range", value: `[${low}, ${high}]` }, { name: "middle", value: middle }],
      });

      if (probe.index < candidate.index) low = middle + 1;
      else high = middle - 1;

      snapshot({
        phase: "binary-search",
        title: { vi: `Tìm tiếp trong [${low}, ${high}]`, en: `Search next in [${low}, ${high}]` },
        note: { vi: "Loại bỏ một nửa danh sách.", en: "Discard half of the list." },
        codeLines: probe.index < candidate.index ? [18, 19] : [20, 21],
        highlight: [candidate.index],
        vars: [{ name: "search range", value: `[${low}, ${high}]` }],
      });
    }

    if (!found) {
      state.current = {
        index: candidate.index,
        leftIndex: candidate.index,
        leftValue: candidate.value,
        rightIndex: null,
        rightValue: null,
        relation: "missing",
        product: 0,
      };
      state.cursors = { left: position, right: null, iteration: position };
      snapshot({
        phase: "miss",
        title: { vi: `Không tìm thấy index ${candidate.index}`, en: `Index ${candidate.index} not found` },
        note: { vi: "Bỏ qua; index này không đóng góp.", en: "Skip; this index does not contribute." },
        codeLines: [22],
        highlight: [candidate.index],
      });
    }
  }

  state.current = emptyCurrent();
  state.cursors = { left: sparseLeft.length, right: null, iteration: sparseLeft.length };
  snapshot({
    phase: "complete",
    title: { vi: `Trả về ${state.runningTotal}`, en: `Return ${state.runningTotal}` },
    note: { vi: "Đã tìm xong mọi index khác 0 của nums1.", en: "Every nonzero nums1 index has been searched." },
    codeLines: [22],
    final: true,
  });

  return { original: [[...left], [...right]], answer: state.runningTotal, steps };
}

module.exports = {
  1570: {
    id: 1570,
    difficulty: "medium",
    premium: true,
    slug: "dot-product-of-two-sparse-vectors",
    category: DESIGN,
    tags: [HASHMAP, TWO_POINTER, BINARY_SEARCH],
    title: { vi: "Tích vô hướng của hai vector thưa", en: "Dot Product of Two Sparse Vectors" },
    titleVi: { vi: "Tích vô hướng của hai vector thưa", en: "Dot product of two sparse vectors" },
    statement: {
      vi: "Cho hai vector số nguyên thưa nums1 và nums2 có cùng độ dài. Thiết kế lớp SparseVector lưu các phần tử khác 0 và trả về tích vô hướng của hai vector.",
      en: "Given two equal-length sparse integer vectors nums1 and nums2, design SparseVector to store nonzero entries and return their dot product.",
    },
    defaultInput: "0,0,3,0,4,0,0,2|0,0,2,0,5,0,0,7",
    inputKind: "string",
    inputLabel: { vi: "nums1 | nums2 (số nguyên cách nhau bằng dấu phẩy)", en: "nums1 | nums2 (comma-separated integers)" },
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Brute force · mảng", en: "Brute force · arrays" } },
          { value: "2", label: { vi: "Hash map · kiểm tra index", en: "Hash map · membership check" } },
          { value: "3", label: { vi: "Hash map tối ưu · duyệt map nhỏ hơn", en: "Optimized hash map · iterate smaller map" } },
          { value: "4", label: { vi: "Two pointers", en: "Two pointers" } },
          { value: "5", label: { vi: "Binary search", en: "Binary search" } },
        ],
      },
    ],
    approach: [
      { vi: "Brute force giữ nguyên mảng và nhân từng cặp cùng index: dot O(n), lưu O(n) mỗi vector.", en: "Brute force keeps full arrays and multiplies every matching index: O(n) dot time, O(n) storage per vector." },
      { vi: "Hash map duyệt nums1 và kiểm tra từng index trong map của vector kia: O(L1) trung bình.", en: "Hash map iterates nums1 and checks each index in the other vector's map: O(L1) average." },
      { vi: "Hash map tối ưu duyệt map ngắn hơn: O(min(L1, L2)) trung bình.", en: "The optimized hash map iterates the smaller map: O(min(L1, L2)) average." },
      { vi: "Two pointers quét hai danh sách cặp đã sắp xếp: O(L1 + L2).", en: "Two pointers scan both sorted pair lists: O(L1 + L2)." },
      { vi: "Binary search tìm từng index của nums1 trong danh sách vec đã sắp xếp: O(L1 log L2).", en: "Binary search looks up each nums1 index in vec's sorted list: O(L1 log L2)." },
    ],
    complexity: {
      time: "Dot: brute O(n) · hash O(L1) avg · optimized hash O(min(L1, L2)) avg · two pointers O(L1 + L2) · binary search O(L1 log L2)",
      space: "O(L1 + L2)",
      note: {
        vi: "L1, L2 là số phần tử khác 0. Mảng lưu O(n) mỗi vector; các cách còn lại lưu O(L1 + L2). Mỗi constructor vẫn đọc n phần tử.",
        en: "L1 and L2 are the nonzero counts. Arrays use O(n) storage per vector; the other approaches use O(L1 + L2). Each constructor still reads n entries.",
      },
    },
    debugMode: "line-by-line",
    codeLabel: { vi: "Cách 1 · Brute force mảng", en: "Approach 1 · Brute force arrays" },
    code: BRUTE_FORCE_CODE,
    code2Label: { vi: "Cách 2 · Hash map", en: "Approach 2 · Hash map" },
    code2: HASH_MEMBERSHIP_CODE,
    code3Label: { vi: "Cách 3 · Hash map tối ưu", en: "Approach 3 · Optimized hash map" },
    code3: HASH_MAP_CODE,
    code4Label: { vi: "Cách 4 · Two pointers", en: "Approach 4 · Two pointers" },
    code4: TWO_POINTER_CODE,
    code5Label: { vi: "Cách 5 · Binary search", en: "Approach 5 · Binary search" },
    code5: BINARY_SEARCH_CODE,
    builder: buildSteps1570BruteForce,
    builder2: buildSteps1570HashMembership,
    builder3: buildSteps1570HashMap,
    builder4: buildSteps1570TwoPointers,
    builder5: buildSteps1570BinarySearch,
    parseSparseVectors,
  },
};
