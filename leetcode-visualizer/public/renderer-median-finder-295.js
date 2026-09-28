"use strict";

const MF295_EVENT_RAIL = Object.freeze([
  { line: 3, event: "constructor", en: "Constructor", vi: "Hàm khởi tạo" },
  { line: 4, event: "initialize-small", en: "Initialize small", vi: "Tạo small" },
  { line: 5, event: "initialize-large", en: "Initialize large", vi: "Tạo large" },
  { line: 6, event: "enter-add-num", en: "Enter addNum", vi: "Vào addNum" },
  { line: 7, event: "push-small", en: "Push into small", vi: "Push vào small" },
  { line: 8, event: "check-partition", en: "Check partition", vi: "Kiểm tra phân vùng" },
  { line: 9, event: "transfer-small-to-large", en: "Repair partition", vi: "Sửa phân vùng" },
  { line: 10, event: "check-small-size", en: "Check small size", vi: "Kiểm tra cỡ small" },
  { line: 11, event: "rebalance-small-to-large", en: "Move to large", vi: "Chuyển sang large" },
  { line: 12, event: "check-large-size", en: "Check large size", vi: "Kiểm tra cỡ large" },
  { line: 13, event: "rebalance-large-to-small", en: "Move to small", vi: "Chuyển sang small" },
  { line: 14, event: "enter-find-median", en: "Enter findMedian", vi: "Vào findMedian" },
  { line: 15, event: "check-return-odd", en: "Odd check / return", vi: "Kiểm tra lẻ / trả về" },
  { line: 16, event: "return-even", en: "Even return", vi: "Trả median chẵn" },
]);

const MF295_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Find Median from Data Stream line-by-line visualization",
    kicker: "LEETCODE 295 · TWO HEAPS",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    rail: "Source line and event rail",
    source: "Current source action",
    phase: "Phase",
    operation: "Operation",
    condition: "Condition",
    noCondition: "No condition is evaluated on this line.",
    trueValue: "TRUE",
    falseValue: "FALSE",
    heaps: "Heap topology after this line",
    heapsHelp: "Each node stays at its real heap-array index; edges use i → 2i+1 / 2i+2.",
    lower: "LOWER HALF · small",
    upper: "UPPER HALF · large",
    maxHeap: "semantic max-heap",
    minHeap: "min-heap",
    negativeStorage: "NEGATIVE STORAGE",
    directStorage: "DIRECT STORAGE",
    top: "top",
    size: "size",
    empty: "Heap is empty.",
    index: "index",
    token: "token",
    transfer: "Before / after transfer",
    transferHelp: "The same occurrence token moves; small changes sign because heapq stores its values negated.",
    beforeState: "BEFORE",
    afterState: "AFTER",
    moved: "MOVED TOKEN",
    reason: "Reason",
    noTransfer: "No value moves between heaps on this source line.",
    invariants: "Live invariants",
    orderInvariant: "Partition order",
    sizeInvariant: "Size balance",
    lowerHeapInvariant: "small storage heap",
    upperHeapInvariant: "large storage heap",
    countInvariant: "Occurrence count",
    pass: "HOLDS",
    fail: "TEMPORARILY BROKEN",
    formula: "Median rule",
    odd: "ODD",
    even: "EVEN",
    waitingMedian: "No median is returned on this line.",
    evenNext: "The odd check is false; line 16 will average both heap tops.",
    returned: "RETURNED MEDIAN",
    ledger: "Operation / result ledger",
    ledgerHelp: "One MedianFinder instance alternates addNum and findMedian. Python None results are retained.",
    running: "running",
    none: "None",
    result: "result",
    history: "Median history",
    historyHelp: "One value is appended only when findMedian returns.",
    noHistory: "No median has returned yet.",
    note: "Why this frame matters",
    finalAnswer: "FINAL MEDIAN",
    currentAnswer: "LATEST MEDIAN",
    unavailable: "unavailable",
  }),
  vi: Object.freeze({
    region: "Trực quan từng dòng Find Median from Data Stream",
    kicker: "LEETCODE 295 · HAI HEAP",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    rail: "Thanh dòng lệnh và sự kiện",
    source: "Hành động mã nguồn hiện tại",
    phase: "Giai đoạn",
    operation: "Thao tác",
    condition: "Điều kiện",
    noCondition: "Dòng này không đánh giá điều kiện.",
    trueValue: "ĐÚNG",
    falseValue: "SAI",
    heaps: "Cấu trúc heap sau dòng này",
    heapsHelp: "Mỗi node giữ đúng index trong mảng heap; cạnh dùng i → 2i+1 / 2i+2.",
    lower: "NỬA DƯỚI · small",
    upper: "NỬA TRÊN · large",
    maxHeap: "max-heap ngữ nghĩa",
    minHeap: "min-heap",
    negativeStorage: "LƯU SỐ ÂM",
    directStorage: "LƯU TRỰC TIẾP",
    top: "đỉnh",
    size: "kích thước",
    empty: "Heap đang rỗng.",
    index: "index",
    token: "token",
    transfer: "Trước / sau khi chuyển",
    transferHelp: "Cùng token lần xuất hiện được di chuyển; small đổi dấu vì heapq lưu giá trị âm.",
    beforeState: "TRƯỚC",
    afterState: "SAU",
    moved: "TOKEN ĐƯỢC CHUYỂN",
    reason: "Lý do",
    noTransfer: "Dòng nguồn này không chuyển giá trị giữa hai heap.",
    invariants: "Bất biến trực tiếp",
    orderInvariant: "Thứ tự phân vùng",
    sizeInvariant: "Cân bằng kích thước",
    lowerHeapInvariant: "Heap lưu trữ small",
    upperHeapInvariant: "Heap lưu trữ large",
    countInvariant: "Số lần xuất hiện",
    pass: "ĐÚNG",
    fail: "TẠM THỜI SAI",
    formula: "Quy tắc median",
    odd: "LẺ",
    even: "CHẴN",
    waitingMedian: "Dòng này chưa trả về median.",
    evenNext: "Kiểm tra lẻ là sai; dòng 16 sẽ lấy trung bình hai đỉnh heap.",
    returned: "MEDIAN TRẢ VỀ",
    ledger: "Sổ thao tác / kết quả",
    ledgerHelp: "Một instance MedianFinder xen kẽ addNum và findMedian. Kết quả None của Python được giữ lại.",
    running: "đang chạy",
    none: "None",
    result: "kết quả",
    history: "Lịch sử median",
    historyHelp: "Chỉ thêm một giá trị khi findMedian thực sự return.",
    noHistory: "Chưa có median nào được trả về.",
    note: "Ý nghĩa của frame này",
    finalAnswer: "MEDIAN CUỐI",
    currentAnswer: "MEDIAN GẦN NHẤT",
    unavailable: "không có",
  }),
});

function mf295Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mf295Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function mf295CleanText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const clean = value.slice(0, 500).trim();
  return /^(?:undefined|nan|[+-]?infinity)$/i.test(clean) ? fallback : clean;
}

function mf295Localized(value, locale, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return mf295CleanText(value[locale], mf295CleanText(value.en, mf295CleanText(value.vi, fallback)));
  }
  return mf295CleanText(value, fallback);
}

function mf295SafeInteger(value, min, max) {
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : null;
}

function mf295Finite(value) {
  return typeof value === "number" && Number.isFinite(value) ? (Object.is(value, -0) ? 0 : value) : null;
}

function mf295Number(value, fallback = "—") {
  const number = mf295Finite(value);
  return number === null ? fallback : String(number);
}

function mf295NormalizeOperation(value) {
  const raw = value && typeof value === "object" ? value : {};
  const name = ["MedianFinder", "addNum", "findMedian"].includes(raw.name) ? raw.name : "unknown";
  const streamIndex = raw.streamIndex === null ? null : mf295SafeInteger(raw.streamIndex, 0, 79);
  const inputIndex = raw.inputIndex === null ? null : mf295SafeInteger(raw.inputIndex, 0, 39);
  const args = Array.isArray(raw.args) ? raw.args.slice(0, 2).map(mf295Finite).filter((item) => item !== null) : [];
  return {
    streamIndex,
    inputIndex,
    name,
    args,
    status: raw.status === "complete" ? "complete" : "running",
    result: mf295Finite(raw.result),
  };
}

function mf295NormalizeHeap(value, role) {
  const raw = value && typeof value === "object" ? value : {};
  const rawStorage = Array.isArray(raw.storage) ? raw.storage.slice(0, 40) : [];
  const storage = rawStorage.map((item) => Number.isSafeInteger(item) ? (Object.is(item, -0) ? 0 : item) : 0);
  const rawEntries = Array.isArray(raw.entries) ? raw.entries : [];
  const entries = storage.map((storageValue, index) => {
    const rawEntry = rawEntries[index] && typeof rawEntries[index] === "object" ? rawEntries[index] : {};
    const inputIndex = mf295SafeInteger(rawEntry.inputIndex, 0, 39);
    const occurrence = mf295SafeInteger(rawEntry.occurrence, 1, 40);
    return {
      id: mf295CleanText(rawEntry.id, `${role}-${index}`).slice(0, 80),
      inputIndex,
      occurrence,
      index,
      value: role === "lower" ? -storageValue : storageValue,
      storageValue,
    };
  });
  const heapProperty = storage.every((item, index) => index === 0 || storage[(index - 1) >> 1] <= item);
  return {
    role,
    kind: role === "lower" ? "max-heap" : "min-heap",
    storageEncoding: role === "lower" ? "negated" : "identity",
    initialized: raw.initialized === true,
    storage,
    semanticValues: entries.map((entry) => entry.value),
    entries,
    top: entries.length ? entries[0].value : null,
    storageTop: storage.length ? storage[0] : null,
    size: entries.length,
    heapProperty,
  };
}

function mf295NormalizeHeapPair(value) {
  const raw = value && typeof value === "object" ? value : {};
  return {
    lower: mf295NormalizeHeap(raw.lower, "lower"),
    upper: mf295NormalizeHeap(raw.upper, "upper"),
  };
}

function mf295Normalize(step) {
  const raw = step && step.medianFinder295View && typeof step.medianFinder295View === "object"
    ? step.medianFinder295View
    : {};
  const rawInput = raw.input && typeof raw.input === "object" ? raw.input : {};
  const values = Array.isArray(rawInput.values)
    ? rawInput.values.slice(0, 40).map((value) => Number.isSafeInteger(value) ? (Object.is(value, -0) ? 0 : value) : null)
    : [];
  const sourceFromStep = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = mf295SafeInteger(raw.sourceLine, 3, 16) ?? mf295SafeInteger(sourceFromStep, 3, 16);
  const knownEvents = MF295_EVENT_RAIL.map((item) => item.event);
  const event = knownEvents.includes(raw.event) ? raw.event : "unknown";
  const rawHeaps = raw.heaps && typeof raw.heaps === "object" ? raw.heaps : {};
  const before = mf295NormalizeHeapPair(rawHeaps.before);
  const after = mf295NormalizeHeapPair(rawHeaps.after);
  const operation = mf295NormalizeOperation(raw.operation);
  const checkRaw = raw.check && typeof raw.check === "object" ? raw.check : {};
  const checkKinds = ["partition-order", "small-size", "large-size", "odd-count"];
  const movementRaw = raw.movement && typeof raw.movement === "object" ? raw.movement : {};
  const occurrenceRaw = movementRaw.occurrence && typeof movementRaw.occurrence === "object" ? movementRaw.occurrence : {};
  const movementKind = movementRaw.kind === "transfer" ? "transfer" : "none";
  const medianRaw = raw.median && typeof raw.median === "object" ? raw.median : {};
  const medianKind = ["odd", "even"].includes(medianRaw.kind) ? medianRaw.kind : null;
  const medianOperands = Array.isArray(medianRaw.operands)
    ? medianRaw.operands.slice(0, 2).map(mf295Finite).filter((item) => item !== null)
    : [];
  const operationLedger = Array.isArray(raw.operationLedger)
    ? raw.operationLedger.slice(0, 80).map(mf295NormalizeOperation)
    : [];
  const designResults = Array.isArray(raw.designResults)
    ? raw.designResults.slice(0, 80).map((value) => value === null ? null : mf295Finite(value))
    : [];
  const medianHistory = Array.isArray(raw.medianHistory)
    ? raw.medianHistory.slice(0, 40).map(mf295Finite).filter((value) => value !== null)
    : [];
  const insertedCount = mf295SafeInteger(rawInput.insertedCount, 0, 40) ?? after.lower.size + after.upper.size;
  const order = after.lower.top === null || after.upper.top === null || after.lower.top <= after.upper.top;
  const size = after.lower.size === after.upper.size || after.lower.size === after.upper.size + 1;
  const count = after.lower.size + after.upper.size === insertedCount;
  const initialized = after.lower.initialized && after.upper.initialized;
  const final = raw.final === true || Boolean(step && step.final);

  return {
    version: Number.isSafeInteger(raw.version) && raw.version > 0 ? raw.version : 1,
    problemId: 295,
    sourceLine,
    timing: raw.timing === "before" ? "before" : "after",
    phase: mf295CleanText(raw.phase, "unknown"),
    event,
    input: {
      values,
      size: values.length,
      operationIndex: operation.inputIndex,
      value: operation.args.length ? operation.args[0] : null,
      insertedCount,
    },
    operation,
    heaps: { before, after },
    check: {
      kind: checkKinds.includes(checkRaw.kind) ? checkRaw.kind : null,
      expression: mf295CleanText(checkRaw.expression, ""),
      result: typeof checkRaw.result === "boolean" ? checkRaw.result : null,
      left: mf295Finite(checkRaw.left),
      right: mf295Finite(checkRaw.right),
    },
    movement: {
      kind: movementKind,
      from: ["lower", "upper"].includes(movementRaw.from) ? movementRaw.from : null,
      to: ["lower", "upper"].includes(movementRaw.to) ? movementRaw.to : null,
      reason: ["partition-order", "small-too-large", "large-too-large"].includes(movementRaw.reason) ? movementRaw.reason : null,
      occurrence: movementKind === "transfer" ? {
        id: mf295CleanText(occurrenceRaw.id, "moved").slice(0, 80),
        inputIndex: mf295SafeInteger(occurrenceRaw.inputIndex, 0, 39),
        occurrence: mf295SafeInteger(occurrenceRaw.occurrence, 1, 40),
        value: mf295Finite(occurrenceRaw.value),
      } : null,
      value: mf295Finite(movementRaw.value),
      storageBefore: mf295Finite(movementRaw.storageBefore),
      storageAfter: mf295Finite(movementRaw.storageAfter),
      indexBefore: mf295SafeInteger(movementRaw.indexBefore, 0, 39),
      indexAfter: mf295SafeInteger(movementRaw.indexAfter, 0, 39),
    },
    invariants: {
      lowerHeapProperty: after.lower.heapProperty,
      upperHeapProperty: after.upper.heapProperty,
      order,
      size,
      count,
      initialized,
      all: after.lower.heapProperty && after.upper.heapProperty && order && size && count && initialized,
      lowerTop: after.lower.top,
      upperTop: after.upper.top,
      sizeDifference: after.lower.size - after.upper.size,
      expectedCount: insertedCount,
      actualCount: after.lower.size + after.upper.size,
    },
    median: {
      kind: medianKind,
      formula: medianKind === "odd" ? "-small[0]" : medianKind === "even" ? "(-small[0] + large[0]) / 2" : null,
      substituted: mf295CleanText(medianRaw.substituted, ""),
      operands: medianOperands,
      value: mf295Finite(medianRaw.value),
      returned: medianRaw.returned === true && mf295Finite(medianRaw.value) !== null,
    },
    operationLedger,
    designResults,
    medianHistory,
    final,
    title: mf295Localized(step && step.title, mf295Locale(), "MedianFinder"),
    note: mf295Localized(step && step.note, mf295Locale(), ""),
  };
}

function mf295SourceExpression(state) {
  const checkSuffix = state.check.result === null ? "" : ` → ${state.check.result ? "True" : "False"}`;
  switch (state.event) {
    case "constructor": return "def __init__(self):";
    case "initialize-small": return "self.small = []";
    case "initialize-large": return "self.large = []";
    case "enter-add-num": return `addNum(${mf295Number(state.input.value)})`;
    case "push-small": return `heapq.heappush(self.small, ${mf295Number(state.input.value === null ? null : -state.input.value)})`;
    case "check-partition": return `${state.check.expression || "partition check"}${checkSuffix}`;
    case "transfer-small-to-large": return "heapq.heappush(large, -heapq.heappop(small))";
    case "check-small-size": return `${state.check.expression || "small size check"}${checkSuffix}`;
    case "rebalance-small-to-large": return "heapq.heappush(large, -heapq.heappop(small))";
    case "check-large-size": return `${state.check.expression || "large size check"}${checkSuffix}`;
    case "rebalance-large-to-small": return "heapq.heappush(small, -heapq.heappop(large))";
    case "enter-find-median": return "findMedian()";
    case "check-return-odd": return `${state.check.expression || "odd count check"}${checkSuffix}${state.median.returned ? `; return ${mf295Number(state.median.value)}` : ""}`;
    case "return-even": return `return ${state.median.substituted || state.median.formula || "median"}`;
    default: return "—";
  }
}

function mf295ConditionText(state, copy, locale) {
  if (state.check.result === null) return copy.noCondition;
  const left = mf295Number(state.check.left);
  const right = mf295Number(state.check.right);
  const result = state.check.result ? copy.trueValue : copy.falseValue;
  const labels = {
    "partition-order": locale === "vi" ? `lower top ${left} > upper top ${right}` : `lower top ${left} > upper top ${right}`,
    "small-size": locale === "vi" ? `small size ${left} > large size + 1 (${right})` : `small size ${left} > large size + 1 (${right})`,
    "large-size": locale === "vi" ? `large size ${left} > small size ${right}` : `large size ${left} > small size ${right}`,
    "odd-count": locale === "vi" ? `small size ${left} > large size ${right}` : `small size ${left} > large size ${right}`,
  };
  return `${labels[state.check.kind] || state.check.expression || copy.condition} — ${result}`;
}

function mf295RenderRail(state, copy, locale) {
  const items = MF295_EVENT_RAIL.map((item) => {
    const active = item.line === state.sourceLine && item.event === state.event;
    return `<li class="mf295-event ${active ? "mf295-is-current" : ""}"${active ? " aria-current=\"step\"" : ""}><small>L${item.line}</small><span>${mf295Escape(item[locale])}</span></li>`;
  }).join("");
  return `<nav class="mf295-rail-wrap" aria-label="${mf295Escape(copy.rail)}"><ol class="mf295-event-rail" role="list">${items}</ol></nav>`;
}

function mf295RenderSource(state, copy, locale) {
  const args = state.operation.args.map((value) => mf295Number(value)).join(", ");
  const operation = `${state.operation.name}${state.operation.name === "MedianFinder" ? "()" : `(${args})`}`;
  return `<section class="mf295-source" aria-labelledby="mf295-source-heading"><div class="mf295-expression"><small id="mf295-source-heading">${mf295Escape(copy.source)}</small><code>${mf295Escape(mf295SourceExpression(state))}</code></div><dl class="mf295-source-facts"><div><dt>${mf295Escape(copy.phase)}</dt><dd>${mf295Escape(state.phase)}</dd></div><div><dt>${mf295Escape(copy.operation)}</dt><dd>${mf295Escape(operation)}</dd></div><div><dt>${mf295Escape(copy.condition)}</dt><dd class="mf295-check-${state.check.result === null ? "none" : state.check.result ? "pass" : "fail"}">${mf295Escape(mf295ConditionText(state, copy, locale))}</dd></div></dl></section>`;
}

function mf295HeapPositions(entries) {
  if (!entries.length) return { width: 360, height: 150, nodes: [] };
  const maxDepth = Math.floor(Math.log2(entries.length));
  const width = Math.max(360, (2 ** maxDepth) * 104);
  const height = 96 + maxDepth * 104;
  const nodes = entries.map((entry, index) => {
    const depth = Math.floor(Math.log2(index + 1));
    const first = 2 ** depth - 1;
    const offset = index - first;
    return {
      entry,
      index,
      x: width * (offset + 0.5) / (2 ** depth),
      y: 46 + depth * 104,
      parent: index === 0 ? null : (index - 1) >> 1,
    };
  });
  return { width, height, nodes };
}

function mf295RenderHeapTree(heap, copy) {
  if (!heap.entries.length) return `<div class="mf295-empty">${mf295Escape(copy.empty)}</div>`;
  const geometry = mf295HeapPositions(heap.entries);
  const edges = geometry.nodes.filter((node) => node.parent !== null).map((node) => {
    const parent = geometry.nodes[node.parent];
    return `<line x1="${parent.x}" y1="${parent.y + 25}" x2="${node.x}" y2="${node.y - 25}"></line>`;
  }).join("");
  const nodes = geometry.nodes.map(({ entry, x, y }, index) => {
    const top = index === 0 ? `<b class="mf295-top-badge">${mf295Escape(copy.top)}</b>` : "";
    const token = entry.inputIndex === null ? entry.id : `#${entry.inputIndex}·${entry.occurrence || 1}`;
    const label = `${heap.role}, ${copy.index} ${index}, value ${mf295Number(entry.value)}, storage ${mf295Number(entry.storageValue)}, ${copy.token} ${token}`;
    return `<div class="mf295-tree-node ${index === 0 ? "mf295-is-top" : ""}" style="left:${x}px;top:${y}px" role="listitem" aria-label="${mf295Escape(label)}">${top}<strong>${mf295Escape(mf295Number(entry.value))}</strong><span class="mf295-storage-badge ${heap.role === "lower" ? "mf295-is-negative" : "mf295-is-direct"}">${mf295Escape(heap.role === "lower" ? copy.negativeStorage : copy.directStorage)} · ${mf295Escape(mf295Number(entry.storageValue))}</span><em>${mf295Escape(copy.index)} ${index} · ${mf295Escape(token)}</em></div>`;
  }).join("");
  const aria = `${heap.role} ${heap.kind}, ${heap.size} nodes`;
  return `<div class="mf295-tree-scroll"><div class="mf295-tree-canvas" style="width:${geometry.width}px;height:${geometry.height}px" role="list" aria-label="${mf295Escape(aria)}"><svg class="mf295-tree-edges" viewBox="0 0 ${geometry.width} ${geometry.height}" aria-hidden="true">${edges}</svg>${nodes}</div></div>`;
}

function mf295RenderHeapCard(heap, copy) {
  const lower = heap.role === "lower";
  const heading = lower ? copy.lower : copy.upper;
  const kind = lower ? copy.maxHeap : copy.minHeap;
  const encoding = lower ? copy.negativeStorage : copy.directStorage;
  return `<article class="mf295-heap-card mf295-heap-${heap.role}"><header><div><span>${mf295Escape(heading)}</span><h4>${mf295Escape(kind)}</h4></div><dl><div><dt>${mf295Escape(copy.top)}</dt><dd>${mf295Escape(mf295Number(heap.top))}</dd></div><div><dt>${mf295Escape(copy.size)}</dt><dd>${heap.size}</dd></div></dl></header><p class="mf295-encoding">${mf295Escape(encoding)}</p>${mf295RenderHeapTree(heap, copy)}</article>`;
}

function mf295RenderHeaps(state, copy) {
  return `<section class="mf295-card mf295-heaps" aria-labelledby="mf295-heaps-heading"><header class="mf295-section-head"><div><h3 id="mf295-heaps-heading">${mf295Escape(copy.heaps)}</h3><p>${mf295Escape(copy.heapsHelp)}</p></div></header><div class="mf295-heap-grid">${mf295RenderHeapCard(state.heaps.after.lower, copy)}${mf295RenderHeapCard(state.heaps.after.upper, copy)}</div></section>`;
}

function mf295StorageSummary(pair, copy) {
  const row = (heap, label) => `<div><b>${mf295Escape(label)}</b><code>[${heap.storage.map((value) => mf295Escape(mf295Number(value))).join(", ")}]</code></div>`;
  return `${row(pair.lower, copy.lower)}${row(pair.upper, copy.upper)}`;
}

function mf295Reason(reason, locale) {
  const copy = {
    en: {
      "partition-order": "lower.top exceeded upper.top",
      "small-too-large": "small had more than one extra occurrence",
      "large-too-large": "large had more occurrences than small",
    },
    vi: {
      "partition-order": "đỉnh lower vượt đỉnh upper",
      "small-too-large": "small dư quá một lần xuất hiện",
      "large-too-large": "large có nhiều lần xuất hiện hơn small",
    },
  };
  return copy[locale][reason] || "—";
}

function mf295RenderTransfer(state, copy, locale) {
  if (state.movement.kind !== "transfer") {
    return `<section class="mf295-card mf295-transfer mf295-no-transfer" aria-labelledby="mf295-transfer-heading"><header class="mf295-section-head"><div><h3 id="mf295-transfer-heading">${mf295Escape(copy.transfer)}</h3><p>${mf295Escape(copy.noTransfer)}</p></div></header></section>`;
  }
  const occurrence = state.movement.occurrence || {};
  const token = occurrence.inputIndex === null || occurrence.inputIndex === undefined
    ? occurrence.id || "moved"
    : `#${occurrence.inputIndex}·${occurrence.occurrence || 1}`;
  return `<section class="mf295-card mf295-transfer mf295-has-transfer" aria-labelledby="mf295-transfer-heading"><header class="mf295-section-head"><div><h3 id="mf295-transfer-heading">${mf295Escape(copy.transfer)}</h3><p>${mf295Escape(copy.transferHelp)}</p></div><div class="mf295-moved-token"><small>${mf295Escape(copy.moved)}</small><strong>${mf295Escape(mf295Number(state.movement.value))}</strong><span>${mf295Escape(token)} · ${mf295Escape(mf295Number(state.movement.storageBefore))} → ${mf295Escape(mf295Number(state.movement.storageAfter))}</span></div></header><div class="mf295-transfer-grid"><article><h4>${mf295Escape(copy.beforeState)}</h4>${mf295StorageSummary(state.heaps.before, copy)}</article><div class="mf295-transfer-arrow" aria-hidden="true">→</div><article><h4>${mf295Escape(copy.afterState)}</h4>${mf295StorageSummary(state.heaps.after, copy)}</article></div><p class="mf295-transfer-reason"><b>${mf295Escape(copy.reason)}:</b> ${mf295Escape(mf295Reason(state.movement.reason, locale))}</p></section>`;
}

function mf295RenderInvariants(state, copy) {
  const invariant = (label, holds, expression) => `<li class="mf295-invariant ${holds ? "mf295-is-pass" : "mf295-is-fail"}"><span>${mf295Escape(label)}</span><code>${mf295Escape(expression)}</code><strong>${mf295Escape(holds ? copy.pass : copy.fail)}</strong></li>`;
  const lower = state.heaps.after.lower;
  const upper = state.heaps.after.upper;
  const entries = [
    invariant(copy.orderInvariant, state.invariants.order, `${mf295Number(lower.top)} ≤ ${mf295Number(upper.top)}`),
    invariant(copy.sizeInvariant, state.invariants.size, `${lower.size} = ${upper.size} or ${upper.size} + 1`),
    invariant(copy.lowerHeapInvariant, state.invariants.lowerHeapProperty, "parent storage ≤ child storage"),
    invariant(copy.upperHeapInvariant, state.invariants.upperHeapProperty, "parent storage ≤ child storage"),
    invariant(copy.countInvariant, state.invariants.count, `${state.invariants.actualCount} = ${state.invariants.expectedCount}`),
  ].join("");
  return `<section class="mf295-card mf295-invariants" aria-labelledby="mf295-invariants-heading"><header class="mf295-section-head"><div><h3 id="mf295-invariants-heading">${mf295Escape(copy.invariants)}</h3></div></header><ul role="list">${entries}</ul></section>`;
}

function mf295RenderFormula(state, copy) {
  const median = state.median;
  let current;
  if (median.returned) {
    current = `<div class="mf295-formula-result mf295-is-${median.kind}" role="status" aria-live="polite"><small>${mf295Escape(copy.returned)}</small><code>${mf295Escape(median.substituted || median.formula)}</code><strong>${mf295Escape(mf295Number(median.value))}</strong></div>`;
  } else if (state.event === "check-return-odd" && state.check.result === false) {
    current = `<p class="mf295-formula-wait">${mf295Escape(copy.evenNext)}</p>`;
  } else {
    current = `<p class="mf295-formula-wait">${mf295Escape(copy.waitingMedian)}</p>`;
  }
  return `<section class="mf295-card mf295-formula" aria-labelledby="mf295-formula-heading"><header class="mf295-section-head"><div><h3 id="mf295-formula-heading">${mf295Escape(copy.formula)}</h3></div></header><div class="mf295-formula-rules"><article class="${median.kind === "odd" ? "mf295-is-active" : ""}"><b>${mf295Escape(copy.odd)}</b><code>-small[0]</code></article><article class="${median.kind === "even" ? "mf295-is-active" : ""}"><b>${mf295Escape(copy.even)}</b><code>(-small[0] + large[0]) / 2</code></article></div>${current}</section>`;
}

function mf295RenderLedger(state, copy) {
  const currentIndex = state.operation.streamIndex;
  const rows = state.operationLedger.length ? state.operationLedger.map((operation, index) => {
    const hasResult = index < state.designResults.length;
    const result = hasResult ? (state.designResults[index] === null ? copy.none : mf295Number(state.designResults[index])) : copy.running;
    const args = operation.args.map((value) => mf295Number(value)).join(", ");
    const active = index === currentIndex;
    return `<li class="mf295-ledger-item ${active ? "mf295-is-current" : ""}"${active ? " aria-current=\"step\"" : ""}><small>#${index}</small><code>${mf295Escape(operation.name)}(${mf295Escape(args)})</code><span>${mf295Escape(copy.result)}: <b>${mf295Escape(result)}</b></span></li>`;
  }).join("") : `<li class="mf295-empty">${mf295Escape(copy.unavailable)}</li>`;
  return `<section class="mf295-card mf295-ledger" aria-labelledby="mf295-ledger-heading"><header class="mf295-section-head"><div><h3 id="mf295-ledger-heading">${mf295Escape(copy.ledger)}</h3><p>${mf295Escape(copy.ledgerHelp)}</p></div></header><div class="mf295-ledger-scroll"><ol role="list">${rows}</ol></div></section>`;
}

function mf295RenderHistory(state, copy) {
  const items = state.medianHistory.length ? state.medianHistory.map((value, index) => {
    const current = index === state.medianHistory.length - 1;
    return `<li class="mf295-history-item ${current ? "mf295-is-current" : ""}"><small>#${index + 1}</small><strong>${mf295Escape(mf295Number(value))}</strong></li>`;
  }).join("") : `<li class="mf295-empty">${mf295Escape(copy.noHistory)}</li>`;
  const latest = state.medianHistory.length ? state.medianHistory[state.medianHistory.length - 1] : null;
  return `<section class="mf295-card mf295-history" aria-labelledby="mf295-history-heading"><header class="mf295-section-head"><div><h3 id="mf295-history-heading">${mf295Escape(copy.history)}</h3><p>${mf295Escape(copy.historyHelp)}</p></div><div class="mf295-answer ${state.final ? "mf295-is-final" : ""}" role="status" aria-live="polite"><small>${mf295Escape(state.final ? copy.finalAnswer : copy.currentAnswer)}</small><strong>${mf295Escape(mf295Number(latest))}</strong></div></header><div class="mf295-history-scroll"><ol role="list">${items}</ol></div></section>`;
}

function renderMedianFinder295View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = mf295Locale();
  const copy = MF295_TEXT[locale];
  const state = mf295Normalize(step);
  const eventInfo = MF295_EVENT_RAIL.find((item) => item.event === state.event);
  const eventLabel = eventInfo ? eventInfo[locale] : state.event;
  const timing = state.timing === "before" ? copy.before : copy.after;
  const summary = `${copy.region}. ${copy.line} ${state.sourceLine === null ? "—" : state.sourceLine}, ${eventLabel}.`;
  const note = state.note ? `<aside class="mf295-note"><strong>${mf295Escape(copy.note)}</strong><p>${mf295Escape(state.note)}</p></aside>` : "";

  host.innerHTML = `<article class="mf295-viz ${state.final ? "mf295-is-final" : ""}" role="region" aria-label="${mf295Escape(summary)}"><header class="mf295-header"><div><span>${mf295Escape(copy.kicker)}</span><h2>${mf295Escape(state.title)}</h2></div><div class="mf295-line-state"><strong>${mf295Escape(copy.line)} ${state.sourceLine === null ? "—" : state.sourceLine}</strong><span class="mf295-timing-${state.timing}">${mf295Escape(timing)}</span><em>${mf295Escape(eventLabel)}</em></div></header>${mf295RenderRail(state, copy, locale)}${mf295RenderSource(state, copy, locale)}${mf295RenderTransfer(state, copy, locale)}${mf295RenderHeaps(state, copy)}<div class="mf295-analysis-grid">${mf295RenderInvariants(state, copy)}${mf295RenderFormula(state, copy)}</div>${mf295RenderLedger(state, copy)}${mf295RenderHistory(state, copy)}${note}</article>`;
}
