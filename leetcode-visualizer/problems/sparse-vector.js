"use strict";

const MAX_VECTOR_LENGTH = 24;
const DESIGN = { key: "design", vi: "Thiết kế", en: "Design" };
const HASHMAP = { key: "hashmap", vi: "Hash Map", en: "Hash Map" };
const TWO_POINTER = { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" };

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
      ...(codeBlock === 2 ? { codeBlock: 2 } : {}),
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

function compressVector({ dense, sparse, side, state, snapshot }) {
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
      codeLines: stored ? [4, 5, 6] : [4, 5],
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

function buildSteps1570HashMap(input) {
  const [left, right] = parseSparseVectors(input);
  const sparseLeft = [];
  const sparseRight = [];
  const state = initialState();
  const steps = [];
  const snapshot = createSnapshotter({
    strategy: "hash-map",
    codeBlock: 1,
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

function buildSteps1570TwoPointers(input) {
  const [left, right] = parseSparseVectors(input);
  const sparseLeft = [];
  const sparseRight = [];
  const state = initialState();
  const steps = [];
  const snapshot = createSnapshotter({
    strategy: "two-pointer",
    codeBlock: 2,
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

module.exports = {
  1570: {
    id: 1570,
    difficulty: "medium",
    premium: true,
    slug: "dot-product-of-two-sparse-vectors",
    category: DESIGN,
    tags: [HASHMAP, TWO_POINTER],
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
          { value: "1", label: { vi: "Hash map + duyệt map nhỏ hơn", en: "Hash maps + iterate smaller map" } },
          { value: "2", label: { vi: "Cặp đã sort + hai con trỏ", en: "Sorted pairs + two pointers" } },
        ],
      },
    ],
    approach: [
      { vi: "Cả hai cách đều quét vector đặc một lần và chỉ lưu các cặp index–value có value khác 0.", en: "Both approaches scan each dense vector once and store only index–value pairs whose value is nonzero." },
      { vi: "Cách hash map duyệt map có ít entry hơn và tra mỗi index trong map còn lại với O(1) trung bình.", en: "The hash-map approach iterates the map with fewer entries and probes each index in the other map in expected O(1) time." },
      { vi: "Cách hai con trỏ giữ các cặp theo index tăng dần, tiến con trỏ có index nhỏ hơn và chỉ nhân khi hai index bằng nhau.", en: "The two-pointer approach keeps pairs sorted by index, advances the smaller index, and multiplies only when the indices match." },
    ],
    complexity: {
      time: "Build O(n) · hash dot O(min(nnz1, nnz2)) expected · two-pointer dot O(nnz1 + nnz2)",
      space: "O(nnz1 + nnz2)",
      note: {
        vi: "Mỗi constructor vẫn phải đọc n phần tử đặc. Sau khi nén, phép dot chỉ phụ thuộc số phần tử khác 0 (nnz).",
        en: "Each constructor still reads all n dense entries. After compression, dot-product work depends only on the nonzero counts (nnz).",
      },
    },
    debugMode: "semantic",
    codeLabel: { vi: "Hash map: duyệt map nhỏ hơn", en: "Hash maps: iterate smaller map" },
    code: HASH_MAP_CODE,
    code2Label: { vi: "Cặp đã sort: hai con trỏ", en: "Sorted pairs: two pointers" },
    code2: TWO_POINTER_CODE,
    builder: buildSteps1570HashMap,
    builder2: buildSteps1570TwoPointers,
    parseSparseVectors,
  },
};
