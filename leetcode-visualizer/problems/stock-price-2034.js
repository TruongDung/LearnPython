"use strict";

const { bi } = require("./hard-viz-shared");

const PROBLEM_ID = 2034;
const MAX_OPERATIONS = 70;
const MAX_VALUE = 1_000_000_000;
const MAX_TRACE_STEPS = 280;

const SOURCE = Object.freeze([
  "from heapq import heappop, heappush",
  "",
  "class StockPrice:",
  "    def __init__(self):",
  "        self.latest = 0",
  "        self.prices = {}",
  "        self.min_heap = []",
  "        self.max_heap = []",
  "",
  "    def update(self, timestamp: int, price: int) -> None:",
  "        self.latest = max(self.latest, timestamp)",
  "        self.prices[timestamp] = price",
  "        heappush(self.min_heap, (price, timestamp))",
  "        heappush(self.max_heap, (-price, timestamp))",
  "",
  "    def current(self) -> int:",
  "        return self.prices[self.latest]",
  "",
  "    def maximum(self) -> int:",
  "        while self.prices[self.max_heap[0][1]] != -self.max_heap[0][0]:",
  "            heappop(self.max_heap)",
  "        return -self.max_heap[0][0]",
  "",
  "    def minimum(self) -> int:",
  "        while self.prices[self.min_heap[0][1]] != self.min_heap[0][0]:",
  "            heappop(self.min_heap)",
  "        return self.min_heap[0][0]",
]);

function parseOperations2034(input) {
  let decoded = input;
  if (typeof input === "string") {
    try {
      decoded = JSON.parse(input.trim());
    } catch (_error) {
      throw new TypeError(`#${PROBLEM_ID}: operations phải là JSON hợp lệ / must be valid JSON.`);
    }
  }
  if (!Array.isArray(decoded) || decoded.length < 1 || decoded.length > MAX_OPERATIONS) {
    throw new RangeError(`#${PROBLEM_ID}: cần 1..${MAX_OPERATIONS} operations / provide 1..${MAX_OPERATIONS} operations.`);
  }

  let hasUpdate = false;
  return decoded.map((row, position) => {
    if (!Array.isArray(row) || typeof row[0] !== "string") {
      throw new TypeError(`#${PROBLEM_ID}: operation ${position + 1} không hợp lệ / is invalid.`);
    }
    const [name, timestamp, price] = row;
    if (name === "update" && row.length === 3
      && Number.isSafeInteger(timestamp) && timestamp >= 1 && timestamp <= MAX_VALUE
      && Number.isSafeInteger(price) && price >= 1 && price <= MAX_VALUE) {
      hasUpdate = true;
      return { name, args: [timestamp, price], label: `update(${timestamp}, ${price})` };
    }
    if (["current", "maximum", "minimum"].includes(name) && row.length === 1) {
      if (!hasUpdate) {
        throw new RangeError(`#${PROBLEM_ID}: ${name} tại operation ${position + 1} cần ít nhất một update trước đó.`);
      }
      return { name, args: [], label: `${name}()` };
    }
    throw new RangeError(`#${PROBLEM_ID}: operation ${position + 1} phải là update(timestamp,price), current(), maximum(), hoặc minimum().`);
  });
}

function compareEntries(left, right) {
  return left.key - right.key || left.timestamp - right.timestamp;
}

function heapPush(heap, entry) {
  heap.push(entry);
  let index = heap.length - 1;
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (compareEntries(heap[parent], heap[index]) <= 0) break;
    [heap[parent], heap[index]] = [heap[index], heap[parent]];
    index = parent;
  }
}

function heapPop(heap) {
  const root = heap[0];
  const tail = heap.pop();
  if (heap.length) {
    heap[0] = tail;
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;
      if (left < heap.length && compareEntries(heap[left], heap[smallest]) < 0) smallest = left;
      if (right < heap.length && compareEntries(heap[right], heap[smallest]) < 0) smallest = right;
      if (smallest === index) break;
      [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
      index = smallest;
    }
  }
  return root;
}

function buildSteps2034(input) {
  const operations = parseOperations2034(input);
  const prices = new Map();
  const minHeap = [];
  const maxHeap = [];
  const outputs = [];
  const history = [];
  const steps = [];
  let latest = 0;
  let traceTruncated = false;

  const isValid = (entry) => prices.get(entry.timestamp) === entry.price;
  const cloneHeap = (heap) => heap.map((entry, index) => ({
    timestamp: entry.timestamp,
    price: entry.price,
    valid: isValid(entry),
    root: index === 0,
  }));
  const priceEntries = () => [...prices.entries()]
    .sort(([left], [right]) => left - right)
    .map(([timestamp, price]) => ({ timestamp, price, latest: timestamp === latest }));

  const emit = ({ phase, operationIndex = null, title, note, codeLines, query = null, pruned = null, final = false }) => {
    if (!final && steps.length >= MAX_TRACE_STEPS - 1) {
      traceTruncated = true;
      return;
    }
    const entries = priceEntries();
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: entries.map((entry) => entry.price),
      sub: entries.map((entry) => `t=${entry.timestamp}${entry.latest ? " · latest" : ""}`),
      highlight: entries.flatMap((entry, index) => entry.latest ? [index] : []),
      mark: [],
      vars: [
        { name: "latest", value: latest || "—" },
        { name: "records", value: prices.size },
        { name: "min_heap", value: minHeap.length },
        { name: "max_heap", value: maxHeap.length },
        { name: "outputs", value: JSON.stringify(outputs) },
      ],
      stockPrice2034View: {
        phase,
        operationIndex,
        operationCount: operations.length,
        operation: operationIndex === null ? null : operations[operationIndex].label,
        latest,
        prices: entries,
        minHeap: cloneHeap(minHeap),
        maxHeap: cloneHeap(maxHeap),
        query: query ? { ...query } : null,
        pruned: pruned ? { ...pruned } : null,
        history: history.map((entry) => ({ ...entry })),
        outputs: [...outputs],
        traceTruncated,
        answer: final ? [...outputs] : null,
      },
    });
  };

  emit({
    phase: "init",
    operationIndex: 0,
    title: bi("Khởi tạo nguồn sự thật và hai heap", "Initialize the source of truth and two heaps"),
    note: bi("Hash map giữ giá hiện tại; hai heap giữ mọi ứng viên và sẽ xóa bản cũ khi chúng lên root.", "The hash map stores current prices; both heaps keep candidates and prune obsolete versions only when they reach the root."),
    codeLines: [1, 3, 4, 5, 6, 7, 8],
  });

  operations.forEach((operation, operationIndex) => {
    if (operation.name === "update") {
      const [timestamp, price] = operation.args;
      const previous = prices.get(timestamp);
      emit({
        phase: "update-start",
        operationIndex,
        title: bi(`Nhận ${operation.label}`, `Receive ${operation.label}`),
        note: bi(previous === undefined ? "Timestamp mới sẽ được ghi vào map." : `Giá cũ ${previous} sẽ stale trong heap sau khi map đổi.`, previous === undefined ? "A new timestamp will be stored in the map." : `The old price ${previous} becomes stale in the heaps after the map changes.`),
        codeLines: [10],
      });
      latest = Math.max(latest, timestamp);
      prices.set(timestamp, price);
      emit({
        phase: "map-update",
        operationIndex,
        title: bi(`Map xác nhận t=${timestamp} → $${price}`, `Map confirms t=${timestamp} → $${price}`),
        note: bi("Map là nguồn sự thật: entry heap chỉ hợp lệ khi khớp đúng cặp này.", "The map is the source of truth: a heap entry is valid only when it matches this pair."),
        codeLines: [11, 12],
      });
      heapPush(minHeap, { key: price, timestamp, price });
      heapPush(maxHeap, { key: -price, timestamp, price });
      outputs.push(null);
      history.push({ index: operationIndex + 1, label: operation.label, result: null });
      emit({
        phase: "heap-push",
        operationIndex,
        title: bi(`Đẩy $${price} vào cả hai heap`, `Push $${price} into both heaps`),
        note: bi("Không tìm và xóa entry cũ ở giữa heap; update luôn O(log q).", "No search removes old entries inside a heap; update stays O(log q)."),
        codeLines: [13, 14],
      });
      return;
    }

    if (operation.name === "current") {
      const result = prices.get(latest);
      outputs.push(result);
      history.push({ index: operationIndex + 1, label: operation.label, result });
      emit({
        phase: "current",
        operationIndex,
        title: bi(`Giá mới nhất là $${result}`, `The latest price is $${result}`),
        note: bi(`latest=${latest}; current đọc thẳng map, không liên quan thứ tự update.`, `latest=${latest}; current reads the map directly, independent of update order.`),
        codeLines: [16, 17],
        query: { kind: "current", result, timestamp: latest, status: "answer" },
      });
      return;
    }

    const isMaximum = operation.name === "maximum";
    const heap = isMaximum ? maxHeap : minHeap;
    const whileLine = isMaximum ? 20 : 25;
    const popLine = isMaximum ? 21 : 26;
    const returnLine = isMaximum ? 22 : 27;
    const queryKind = isMaximum ? "maximum" : "minimum";
    emit({
      phase: "query-start",
      operationIndex,
      title: bi(`Kiểm tra root của ${queryKind} heap`, `Check the ${queryKind}-heap root`),
      note: bi("Root có thể là một giá cũ; so sánh nó với map trước khi trả lời.", "The root may be an old price; compare it with the map before returning it."),
      codeLines: [isMaximum ? 19 : 24, whileLine],
      query: { kind: queryKind, status: "checking", result: null },
    });
    while (heap.length && !isValid(heap[0])) {
      const stale = heap[0];
      emit({
        phase: "stale-root",
        operationIndex,
        title: bi(`Root $${stale.price} tại t=${stale.timestamp} đã stale`, `Root $${stale.price} at t=${stale.timestamp} is stale`),
        note: bi(`Map hiện lưu $${prices.get(stale.timestamp)} tại timestamp này.`, `The map now stores $${prices.get(stale.timestamp)} at this timestamp.`),
        codeLines: [whileLine],
        query: { kind: queryKind, status: "stale", result: null },
        pruned: stale,
      });
      const removed = heapPop(heap);
      emit({
        phase: "prune",
        operationIndex,
        title: bi(`Lazy-delete entry $${removed.price}`, `Lazy-delete the $${removed.price} entry`),
        note: bi("Mỗi entry stale bị pop nhiều nhất một lần, tạo ra chi phí amortized.", "Each stale entry is popped at most once, which gives the amortized bound."),
        codeLines: [popLine],
        query: { kind: queryKind, status: "pruned", result: null },
        pruned: removed,
      });
    }
    const result = heap[0].price;
    outputs.push(result);
    history.push({ index: operationIndex + 1, label: operation.label, result });
    emit({
      phase: "answer",
      operationIndex,
      title: bi(`${queryKind}() = $${result}`, `${queryKind}() = $${result}`),
      note: bi("Root giờ khớp map nên là cực trị hợp lệ hiện tại.", "The root now matches the map, so it is the current valid extreme."),
      codeLines: [returnLine],
      query: { kind: queryKind, status: "answer", result, timestamp: heap[0].timestamp },
    });
  });

  emit({
    phase: "done",
    title: bi("Hoàn tất mô phỏng", "Simulation complete"),
    note: bi(`Outputs: ${JSON.stringify(outputs)}.`, `Outputs: ${JSON.stringify(outputs)}.`),
    codeLines: [17, 22, 27],
    final: true,
  });

  return {
    original: operations.map((operation) => [operation.name, ...operation.args]),
    operations: operations.map((operation) => ({ name: operation.name, args: [...operation.args] })),
    answer: outputs,
    steps,
  };
}

module.exports = {
  2034: {
    id: 2034,
    difficulty: "medium",
    slug: "stock-price-fluctuation",
    category: { key: "design", vi: "Thiết kế hệ thống", en: "Design" },
    tags: [
      { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
      { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
      { key: "lazy-deletion", vi: "Xóa lười", en: "Lazy Deletion" },
    ],
    title: bi("Biến động giá cổ phiếu", "Stock Price Fluctuation"),
    titleVi: bi("Sửa giá theo timestamp với hai heap xóa lười", "Timestamp corrections with two lazy heaps"),
    statement: bi("Hỗ trợ update/correction và truy vấn giá mới nhất, lớn nhất, nhỏ nhất.", "Support updates/corrections and queries for the latest, maximum, and minimum stock price."),
    defaultInput: '[["update",1,10],["update",2,5],["current"],["maximum"],["update",1,3],["maximum"],["update",4,2],["minimum"]]',
    inputKind: "string",
    inputLabel: bi("Operations JSON", "Operations JSON"),
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      bi("Hash map timestamp → price là nguồn sự thật sau mọi correction.", "A timestamp → price hash map is the source of truth after every correction."),
      bi("Mỗi update push phiên bản mới vào cả min-heap và max-heap.", "Each update pushes the new version into both a min-heap and a max-heap."),
      bi("Trước truy vấn cực trị, pop root stale cho tới khi nó khớp hash map.", "Before an extreme query, pop stale roots until the root matches the hash map."),
    ],
    complexity: {
      time: "update O(log q), current O(1), maximum/minimum amortized O(log q)",
      space: "O(q)",
      note: bi("Mỗi heap entry stale chỉ bị pop một lần.", "Each stale heap entry is popped at most once."),
    },
    code: SOURCE,
    parseOperations: parseOperations2034,
    builder: buildSteps2034,
  },
};
