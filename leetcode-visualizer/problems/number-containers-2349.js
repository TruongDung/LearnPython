"use strict";

const { bi, createTracer } = require("./hard-viz-shared");

const PROBLEM_ID = 2349;
const MAX_OPERATIONS = 70;
const MAX_VALUE = 1_000;

const SOURCE = Object.freeze([
  "from collections import defaultdict",
  "from heapq import heappop, heappush",
  "",
  "class NumberContainers:",
  "    def __init__(self):",
  "        self.index_to_number = {}",
  "        self.number_to_indices = defaultdict(list)",
  "",
  "    def change(self, index: int, number: int) -> None:",
  "        self.index_to_number[index] = number",
  "        heappush(self.number_to_indices[number], index)",
  "",
  "    def find(self, number: int) -> int:",
  "        heap = self.number_to_indices[number]",
  "        while heap and self.index_to_number.get(heap[0]) != number:",
  "            heappop(heap)",
  "        return heap[0] if heap else -1",
]);

function parseOperations(input) {
  let decoded = input;
  if (typeof input === "string") {
    try { decoded = JSON.parse(input.trim()); } catch (_error) { throw new TypeError(`#${PROBLEM_ID}: operations must be valid JSON.`); }
  }
  if (!Array.isArray(decoded) || decoded.length < 1 || decoded.length > MAX_OPERATIONS) throw new RangeError(`#${PROBLEM_ID}: provide 1..${MAX_OPERATIONS} operations.`);
  return decoded.map((row, position) => {
    if (!Array.isArray(row) || typeof row[0] !== "string") throw new TypeError(`#${PROBLEM_ID}: invalid operation ${position + 1}.`);
    const [name, index, number] = row;
    if (name === "change" && row.length === 3 && Number.isSafeInteger(index) && Number.isSafeInteger(number) && index >= 1 && index <= MAX_VALUE && number >= 1 && number <= MAX_VALUE) {
      return { name, args: [index, number], label: `change(${index}, ${number})` };
    }
    if (name === "find" && row.length === 2 && Number.isSafeInteger(index) && index >= 1 && index <= MAX_VALUE) {
      return { name, args: [index], label: `find(${index})` };
    }
    throw new RangeError(`#${PROBLEM_ID}: invalid operation ${position + 1}.`);
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
  const root = heap[0];
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
  return root;
}

function buildSteps(input) {
  const operations = parseOperations(input);
  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: SOURCE,
    phases: [bi("Khởi tạo", "Initialize"), bi("Đổi assignment", "Change assignment"), bi("Tìm index", "Find index"), bi("Dọn stale", "Prune stale entries"), bi("Hoàn tất", "Complete")],
    maxSteps: 240,
  });
  const assignments = new Map();
  const heaps = new Map();
  const outputs = [];
  const history = [];
  let current = null;

  const heapFor = (number) => {
    if (!heaps.has(number)) heaps.set(number, []);
    return heaps.get(number);
  };
  const heapViews = () => [...heaps.entries()].sort(([left], [right]) => left - right).map(([number, heap]) => ({
    number,
    heap: [...heap],
    valid: [...heap].filter((index) => assignments.get(index) === number).sort((a, b) => a - b),
    stale: [...heap].filter((index) => assignments.get(index) !== number).sort((a, b) => a - b),
  }));
  const assignmentViews = () => [...assignments.entries()].sort(([left], [right]) => left - right);

  const emit = (line, phaseIndex, title, note, formula, final = false) => {
    const pairs = assignmentViews();
    const numbers = heapViews();
    const maxIndex = Math.max(1, ...pairs.map(([index]) => index), current?.index || 0);
    const activeHeap = Number.isSafeInteger(current?.number) ? heaps.get(current.number) || [] : [];
    tracer.emit({
      phaseIndex,
      codeLines: [line],
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`),
      note,
      action: title,
      formula,
      arr: Array.from({ length: Math.min(MAX_VALUE, maxIndex) }, (_, index) => assignments.get(index + 1) ?? 0),
      sub: Array.from({ length: Math.min(MAX_VALUE, maxIndex) }, (_, index) => assignments.has(index + 1) ? `index ${index + 1}` : "unassigned"),
      highlight: Number.isSafeInteger(current?.index) ? [current.index - 1] : [],
      mark: activeHeap.length ? [activeHeap[0] - 1] : [],
      vars: [
        { name: "operation", value: current?.label ?? "—" },
        { name: "index", value: current?.index ?? "—" },
        { name: "number", value: current?.number ?? "—" },
        { name: "heap_root", value: activeHeap[0] ?? "—" },
        { name: "outputs", value: JSON.stringify(outputs) },
      ],
      metrics: [
        { label: bi("Index đã gán", "Assigned indices"), value: assignments.size, state: "updated" },
        { label: bi("Number có heap", "Number heaps"), value: heaps.size, state: "default" },
        { label: bi("Stale entries", "Stale entries"), value: numbers.reduce((sum, view) => sum + view.stale.length, 0), state: numbers.some((view) => view.stale.length) ? "danger" : "muted" },
      ],
      groups: [
        {
          title: bi("Index → Number", "Index → Number"),
          items: pairs.length ? pairs.map(([index, number]) => ({ label: `index ${index}`, value: number, state: index === current?.index ? "active" : "default" })) : [{ label: bi("Chưa có assignment", "No assignments"), value: "—", state: "muted" }],
        },
        {
          title: bi("Heap theo number", "Per-number heaps"),
          items: numbers.length ? numbers.map((view) => ({ label: `number ${view.number}`, value: `heap=[${view.heap.join(", ")}] · stale=[${view.stale.join(", ")}]`, state: view.number === current?.number ? "candidate" : view.stale.length ? "danger" : "default" })) : [{ label: bi("Chưa có heap", "No heaps"), value: "—", state: "muted" }],
        },
      ],
      table: {
        title: bi("Lịch sử thao tác", "Operation history"),
        columns: [bi("#", "#"), bi("Thao tác", "Operation"), bi("Kết quả", "Result")],
        rows: history.map((entry, index) => [index + 1, entry.label, entry.result === null ? "None" : entry.result]),
      },
      sequence: activeHeap.length ? activeHeap.map((index, position) => ({
        label: `heap[${position}]`, value: index,
        state: assignments.get(index) === current?.number ? position === 0 ? "candidate" : "success" : "danger",
      })) : [{ label: bi("Heap đang xét", "Active heap"), value: "—", state: "muted" }],
      final,
      answer: final ? [...outputs] : null,
    });
  };

  emit(1, 0, bi("Import cấu trúc dữ liệu", "Import data structures"), bi("Hash map giữ assignment; heap giữ index nhỏ nhất theo number.", "A hash map stores assignments; heaps expose the smallest index per number."), bi("map + min-heaps", "map + min-heaps"));
  emit(6, 0, bi("Tạo map assignment", "Create the assignment map"), bi("Mỗi index chỉ có một number hiện tại.", "Each index has one current number."), bi("index_to_number = {}", "index_to_number = {}"));
  emit(7, 0, bi("Tạo các heap rỗng", "Create lazy heaps"), bi("Mỗi number nhận một min-heap index; entry cũ được dọn khi find.", "Each number gets an index min-heap; old entries are pruned during find."), bi("number_to_indices = defaultdict(list)", "number_to_indices = defaultdict(list)"));

  operations.forEach((operation, operationIndex) => {
    if (operation.name === "change") {
      const [index, number] = operation.args;
      current = { ...operation, operationIndex, index, number };
      emit(9, 1, bi(operation.label, operation.label), bi("Cập nhật assignment trước, sau đó thêm index vào heap mới.", "Update the assignment, then add the index to the new number's heap."), bi(`index ${index} → number ${number}`, `index ${index} → number ${number}`));
      assignments.set(index, number);
      emit(10, 1, bi(`Gán index ${index} = ${number}`, `Assign index ${index} = ${number}`), bi("Assignment cũ trở thành stale trong heap cũ nhưng không cần xóa ngay.", "The old assignment becomes stale in its old heap without immediate deletion."), bi(`index_to_number[${index}] = ${number}`, `index_to_number[${index}] = ${number}`));
      heapPush(heapFor(number), index);
      outputs.push(null);
      history.push({ label: operation.label, result: null });
      emit(11, 1, bi(`Đẩy index ${index} vào heap ${number}`, `Push index ${index} into heap ${number}`), bi("Heap có thể chứa duplicate/stale; find sẽ kiểm tra root với map.", "The heap may contain duplicates or stale entries; find validates its root against the map."), bi(`heappush(heap[${number}], ${index})`, `heappush(heap[${number}], ${index})`));
      return;
    }

    const number = operation.args[0];
    current = { ...operation, operationIndex, index: null, number };
    emit(13, 2, bi(operation.label, operation.label), bi("Chỉ cần làm sạch root cho tới khi root khớp assignment hiện tại.", "Only heap roots need pruning until the root matches the current assignment."), bi(`find(${number})`, `find(${number})`));
    const heap = heapFor(number);
    emit(14, 2, bi(`Lấy heap của ${number}`, `Load heap for ${number}`), bi(`Heap hiện tại: [${heap.join(", ")}].`, `Current heap: [${heap.join(", ")}].`), bi(`heap = number_to_indices[${number}]`, `heap = number_to_indices[${number}]`));
    while (true) {
      const stale = heap.length > 0 && assignments.get(heap[0]) !== number;
      emit(15, stale ? 3 : 2, bi(stale ? `Root ${heap[0]} đã stale` : "Root hợp lệ hoặc heap rỗng", stale ? `Root ${heap[0]} is stale` : "The root is valid or the heap is empty"), bi(stale ? `index ${heap[0]} hiện trỏ tới ${assignments.get(heap[0]) ?? "nothing"}.` : heap.length ? `index ${heap[0]} vẫn trỏ tới ${number}.` : "Không có index cho number này.", stale ? `index ${heap[0]} now maps to ${assignments.get(heap[0]) ?? "nothing"}.` : heap.length ? `index ${heap[0]} still maps to ${number}.` : "No index currently stores this number."), bi(`heap and map[root] != ${number} → ${stale}`, `heap and map[root] != ${number} → ${stale}`));
      if (!stale) break;
      const removed = heapPop(heap);
      current = { ...current, index: removed };
      emit(16, 3, bi(`Loại stale index ${removed}`, `Remove stale index ${removed}`), bi("Lazy deletion trả chi phí đúng một lần cho mỗi entry cũ.", "Lazy deletion pays for each old entry only once."), bi(`heappop(heap) = ${removed}`, `heappop(heap) = ${removed}`));
      current = { ...current, index: null };
    }
    const result = heap[0] ?? -1;
    current = { ...current, index: result === -1 ? null : result };
    outputs.push(result);
    history.push({ label: operation.label, result });
    emit(17, 2, bi(`Trả về ${result}`, `Return ${result}`), bi(result === -1 ? "Không index nào đang chứa number này." : `Root ${result} là index hợp lệ nhỏ nhất.`, result === -1 ? "No index currently contains this number." : `Root ${result} is the smallest valid index.`), bi(`return ${result}`, `return ${result}`));
  });

  current = null;
  emit(17, 4, bi("Hoàn tất mô phỏng", "Simulation complete"), bi(`Kết quả: ${JSON.stringify(outputs)}.`, `Outputs: ${JSON.stringify(outputs)}.`), bi("return outputs", "return outputs"), true);
  return { original: operations.map((operation) => [operation.name, ...operation.args]), operations: operations.map((operation) => ({ name: operation.name, args: [...operation.args] })), answer: outputs, steps: tracer.finish() };
}

module.exports = {
  2349: {
    id: 2349,
    difficulty: "medium",
    slug: "design-a-number-container-system",
    category: { key: "design", vi: "Thiết kế hệ thống", en: "Design" },
    tags: [{ key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" }, { key: "hashmap", vi: "Hash Map", en: "Hash Map" }],
    title: bi("Thiết kế hệ thống Number Container", "Design a Number Container System"),
    titleVi: bi("Assignment động với heap xóa lười", "Dynamic assignments with lazy heap deletion"),
    statement: bi("change gán number cho index; find trả index nhỏ nhất đang chứa number hoặc -1.", "change assigns a number to an index; find returns the smallest index currently containing a number or -1."),
    defaultInput: '[["change",2,10],["change",1,10],["change",3,10],["change",5,10],["find",10],["change",1,20],["find",10],["find",20]]',
    inputKind: "string",
    inputLabel: bi("Operations JSON", "Operations JSON"),
    extraParams: [],
    debugMode: "line-by-line",
    approach: [bi("Hash map là nguồn sự thật cho assignment hiện tại.", "The hash map is the source of truth for current assignments."), bi("Mỗi number có min-heap index; change chỉ push vào heap mới.", "Each number owns an index min-heap; change only pushes into the new heap."), bi("find loại root stale cho tới khi root khớp hash map.", "find removes stale roots until the root matches the hash map.")],
    complexity: { time: "change O(log q), find amortized O(log q)", space: "O(q)", note: bi("Mỗi heap entry stale chỉ bị pop một lần.", "Each stale heap entry is popped at most once.") },
    code: SOURCE,
    parseOperations,
    builder: buildSteps,
  },
};
