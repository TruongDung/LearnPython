"use strict";

const { bi, createTracer, parseInteger, parsePlainParams } = require("./hard-viz-shared");

const PROBLEM_ID = 1845;
const MAX_SEATS = 40;
const MAX_OPERATIONS = 60;

const SOURCE = Object.freeze([
  "from heapq import heapify, heappop, heappush",
  "",
  "class SeatManager:",
  "    def __init__(self, n: int):",
  "        self.available = list(range(1, n + 1))",
  "        heapify(self.available)",
  "",
  "    def reserve(self) -> int:",
  "        return heappop(self.available)",
  "",
  "    def unreserve(self, seatNumber: int) -> None:",
  "        heappush(self.available, seatNumber)",
]);

function parseOperations(input) {
  let decoded = input;
  if (typeof input === "string") {
    try { decoded = JSON.parse(input.trim()); } catch (_error) {
      throw new TypeError(`#${PROBLEM_ID}: operations must be valid JSON.`);
    }
  }
  if (!Array.isArray(decoded) || decoded.length < 1 || decoded.length > MAX_OPERATIONS) {
    throw new RangeError(`#${PROBLEM_ID}: provide 1..${MAX_OPERATIONS} operations.`);
  }
  return decoded.map((row, index) => {
    if (!Array.isArray(row) || typeof row[0] !== "string") throw new TypeError(`#${PROBLEM_ID}: invalid operation ${index + 1}.`);
    if (row[0] === "reserve" && row.length === 1) return { name: "reserve", args: [], label: "reserve()" };
    if (row[0] === "unreserve" && row.length === 2 && Number.isSafeInteger(row[1])) return { name: "unreserve", args: [row[1]], label: `unreserve(${row[1]})` };
    throw new RangeError(`#${PROBLEM_ID}: invalid operation ${index + 1}.`);
  });
}

function heapPush(heap, value) {
  heap.push(value);
  let index = heap.length - 1;
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (heap[parent] <= heap[index]) break;
    [heap[parent], heap[index]] = [heap[index], heap[parent]];
    index = parent;
  }
}

function heapPop(heap) {
  const value = heap[0];
  const tail = heap.pop();
  if (heap.length) {
    heap[0] = tail;
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;
      if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
      if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
      if (smallest === index) break;
      [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
      index = smallest;
    }
  }
  return value;
}

function buildSteps(input, params = {}) {
  const parsedParams = parsePlainParams(params, PROBLEM_ID);
  const n = parseInteger(parsedParams.n ?? 5, { problemId: PROBLEM_ID, name: "n", min: 1, max: MAX_SEATS });
  const operations = parseOperations(input);
  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: SOURCE,
    phases: [bi("Khởi tạo ghế", "Initialize seats"), bi("Giữ ghế", "Reserve"), bi("Trả ghế", "Unreserve"), bi("Hoàn tất", "Complete")],
    maxSteps: 180,
  });
  const heap = Array.from({ length: n }, (_, index) => index + 1);
  const available = new Set(heap);
  const reserved = new Set();
  const outputs = [];
  const history = [];
  let current = null;
  let beforeHeap = [];
  let heapReady = false;

  const emit = (line, phaseIndex, title, note, formula, final = false) => {
    tracer.emit({
      phaseIndex,
      codeLines: [line],
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`),
      note,
      action: title,
      formula,
      arr: Array.from({ length: n }, (_, index) => index + 1),
      sub: Array.from({ length: n }, (_, index) => available.has(index + 1) ? "available" : "reserved"),
      highlight: Number.isSafeInteger(current?.seat) ? [current.seat - 1] : [],
      mark: heap.length ? [heap[0] - 1] : [],
      vars: [
        { name: "operation", value: current?.label ?? "—" },
        { name: "self.available", value: JSON.stringify(heap) },
        { name: "self.available[0]", value: heap[0] ?? "—" },
        { name: "seatNumber", value: current?.name === "unreserve" ? current.seat : "—" },
        { name: "return", value: current ? current.name === "reserve" ? current.seat : "None" : "—" },
        { name: "free count", value: available.size },
        { name: "reserved count", value: reserved.size },
        { name: "min before", value: beforeHeap[0] ?? "—" },
      ],
      metrics: [
        { label: bi("Ghế trống", "Available"), value: available.size, state: available.size ? "success" : "danger" },
        { label: bi("Ghế đã giữ", "Reserved"), value: reserved.size, state: reserved.size ? "updated" : "muted" },
        { label: bi("Ghế nhỏ nhất", "Smallest free seat"), value: heap[0] ?? "—", state: heap.length ? "candidate" : "muted" },
      ],
      groups: [{
        title: bi("Min-heap ghế trống", "Available-seat min-heap"),
        items: [
          { label: bi("Heap nội bộ", "Heap storage"), value: `[${heap.join(", ")}]`, state: "candidate" },
          { label: bi("Ghế trống đã sort", "Sorted free seats"), value: `[${[...available].sort((a, b) => a - b).join(", ")}]`, state: "success" },
          { label: bi("Ghế đã giữ", "Reserved seats"), value: `[${[...reserved].sort((a, b) => a - b).join(", ")}]`, state: "updated" },
        ],
      }],
      table: {
        title: bi("Lịch sử thao tác", "Operation history"),
        columns: [bi("#", "#"), bi("Thao tác", "Operation"), bi("Kết quả", "Result")],
        rows: history.map((entry, index) => [index + 1, entry.label, entry.result === null ? "None" : entry.result]),
      },
      sequence: Array.from({ length: n }, (_, index) => ({
        label: bi(`Ghế ${index + 1}`, `Seat ${index + 1}`),
        value: available.has(index + 1) ? bi("trống", "available") : bi("đã giữ", "reserved"),
        state: index + 1 === heap[0] ? "candidate" : available.has(index + 1) ? "success" : "muted",
      })),
      final,
      answer: final ? [...outputs] : null,
    });
    tracer.steps.at(-1).seatManager1845View = {
      line, source: SOURCE[line - 1], n, heapReady,
      event: ({5:"list",6:"heapify",9:"reserve",12:"unreserve"})[line],
      heap: [...heap], beforeHeap: [...beforeHeap],
      free: [...available].sort((a,b)=>a-b), reserved: [...reserved].sort((a,b)=>a-b),
      current: current ? {...current,args:[...current.args],result:current.name === "reserve" ? current.seat : null} : null,
      operations: operations.map(op=>({...op,args:[...op.args]})),
      outputs: [...outputs], explanation: {...note},
    };
  };

  emit(5, 0, bi(`Tạo ghế 1..${n}`, `Create seats 1..${n}`), bi("Ban đầu mọi ghế đều trống.", "Every seat starts available."), bi(`available = [1, ..., ${n}]`, `available = [1, ..., ${n}]`));
  beforeHeap = [...heap];
  heapReady = true;
  emit(6, 0, bi("Heapify danh sách ghế", "Heapify the seat list"), bi("Heapify xây heap trong O(n).", "Heapify builds the heap in O(n)."), bi(`heap_min = ${heap[0]}`, `heap_min = ${heap[0]}`));

  operations.forEach((operation, index) => {
    current = { ...operation, index, seat: operation.args[0] ?? null };
    beforeHeap = [...heap];
    if (operation.name === "reserve") {
      if (!heap.length) throw new RangeError(`#${PROBLEM_ID}: reserve operation ${index + 1} has no available seat.`);
      const seat = heapPop(heap);
      available.delete(seat);
      reserved.add(seat);
      current = { ...current, seat };
      outputs.push(seat);
      history.push({ label: operation.label, result: seat });
      emit(9, 1, bi(`Giữ ghế ${seat}`, `Reserve seat ${seat}`), bi("heappop vừa lấy đúng ghế trống nhỏ nhất.", "heappop removed exactly the smallest available seat."), bi(`return heappop(...) = ${seat}`, `return heappop(...) = ${seat}`));
      return;
    }

    const seat = operation.args[0];
    if (seat < 1 || seat > n || !reserved.has(seat)) {
      throw new RangeError(`#${PROBLEM_ID}: unreserve operation ${index + 1} must target a reserved seat in 1..${n}.`);
    }
    reserved.delete(seat);
    available.add(seat);
    heapPush(heap, seat);
    outputs.push(null);
    history.push({ label: operation.label, result: null });
    emit(12, 2, bi(`Trả ghế ${seat}`, `Return seat ${seat}`), bi(`Gốc heap mới là ${heap[0]}.`, `The new heap root is ${heap[0]}.`), bi(`heappush(available, ${seat})`, `heappush(available, ${seat})`));
  });

  const last = tracer.steps.at(-1);
  last.final = true;
  last.hardProblemView.answer = [...outputs];
  return {
    original: { n, operations: operations.map((operation) => [operation.name, ...operation.args]) },
    operations: operations.map((operation) => ({ name: operation.name, args: [...operation.args] })),
    answer: outputs,
    steps: tracer.finish(),
  };
}

module.exports = {
  1845: {
    id: 1845,
    difficulty: "medium",
    slug: "seat-reservation-manager",
    category: { key: "design", vi: "Thiết kế hệ thống", en: "Design" },
    tags: [{ key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" }],
    title: bi("Quản lý đặt ghế", "Seat Reservation Manager"),
    titleVi: bi("Luôn cấp ghế trống có số nhỏ nhất", "Always reserve the smallest available seat"),
    statement: bi("Quản lý n ghế đánh số 1..n. reserve trả ghế trống nhỏ nhất; unreserve trả một ghế đã giữ về hệ thống.", "Manage seats numbered 1..n. reserve returns the smallest free seat; unreserve returns a reserved seat to the system."),
    defaultInput: '[["reserve"],["reserve"],["unreserve",2],["reserve"],["reserve"],["reserve"],["reserve"],["unreserve",5]]',
    inputKind: "string",
    inputLabel: bi("Operations JSON", "Operations JSON"),
    extraParams: [{ key: "n", type: "number", min: 1, max: MAX_SEATS, default: 5, label: bi("n (số ghế)", "n (seat count)") }],
    debugMode: "line-by-line",
    approach: [bi("Đưa toàn bộ ghế 1..n vào min-heap.", "Put seats 1..n into a min-heap."), bi("reserve dùng heappop; unreserve dùng heappush.", "reserve uses heappop; unreserve uses heappush.")],
    complexity: { time: "O(log n) per operation", space: "O(n)", note: bi("Heap chứa chính xác các ghế đang trống.", "The heap contains exactly the available seats.") },
    code: SOURCE,
    parseOperations,
    builder: buildSteps,
  },
};
