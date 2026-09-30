"use strict";

const { bi, createTracer } = require("./hard-viz-shared");

const PROBLEM_ID = 2336;
const MAX_OPERATIONS = 40;
const MAX_VALUE = 1_000;

const SOURCE = Object.freeze([
  "from heapq import heappop, heappush",
  "",
  "class SmallestInfiniteSet:",
  "    def __init__(self):",
  "        self.next_smallest = 1",
  "        self.added_back = []",
  "        self.added_set = set()",
  "",
  "    def popSmallest(self) -> int:",
  "        if self.added_back:",
  "            smallest = heappop(self.added_back)",
  "            self.added_set.remove(smallest)",
  "            return smallest",
  "        smallest = self.next_smallest",
  "        self.next_smallest += 1",
  "        return smallest",
  "",
  "    def addBack(self, num: int) -> None:",
  "        if num < self.next_smallest and num not in self.added_set:",
  "            heappush(self.added_back, num)",
  "            self.added_set.add(num)",
]);

function parseOperations(input) {
  let decoded = input;
  if (typeof input === "string") {
    try {
      decoded = JSON.parse(input.trim());
    } catch (_error) {
      throw new TypeError(`#${PROBLEM_ID}: operations must be a JSON array.`);
    }
  }
  if (!Array.isArray(decoded) || decoded.length < 1 || decoded.length > MAX_OPERATIONS) {
    throw new RangeError(`#${PROBLEM_ID}: provide 1..${MAX_OPERATIONS} operations.`);
  }
  return decoded.map((row, index) => {
    if (!Array.isArray(row) || typeof row[0] !== "string") {
      throw new TypeError(`#${PROBLEM_ID}: operation ${index + 1} must be [name, ...args].`);
    }
    const name = row[0];
    if (name === "popSmallest" && row.length === 1) return { name, args: [], label: "popSmallest()" };
    if (name === "addBack" && row.length === 2 && Number.isSafeInteger(row[1]) && row[1] >= 1 && row[1] <= MAX_VALUE) {
      return { name, args: [row[1]], label: `addBack(${row[1]})` };
    }
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
  const smallest = heap[0];
  const tail = heap.pop();
  if (heap.length) {
    heap[0] = tail;
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let next = index;
      if (left < heap.length && heap[left] < heap[next]) next = left;
      if (right < heap.length && heap[right] < heap[next]) next = right;
      if (next === index) break;
      [heap[index], heap[next]] = [heap[next], heap[index]];
      index = next;
    }
  }
  return smallest;
}

function buildSteps(input) {
  const operations = parseOperations(input);
  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: SOURCE,
    phases: [
      bi("Khởi tạo", "Initialize"),
      bi("Lấy số nhỏ nhất", "Pop smallest"),
      bi("Thêm số trở lại", "Add back"),
      bi("Hoàn tất", "Complete"),
    ],
    maxSteps: 220,
  });
  const heap = [];
  const addedSet = new Set();
  const outputs = [];
  const history = [];
  let nextSmallest = 1;
  let current = null;

  const emit = (line, phaseIndex, title, note, formula, final = false) => {
    const upper = Math.min(14, Math.max(6, nextSmallest + 3, ...heap));
    tracer.emit({
      phaseIndex,
      codeLines: [line],
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`),
      note,
      action: title,
      formula,
      arr: Array.from({ length: upper }, (_, index) => index + 1),
      sub: Array.from({ length: upper }, (_, index) => {
        const value = index + 1;
        if (addedSet.has(value)) return value === heap[0] ? "heap-min" : "added-back";
        if (value >= nextSmallest) return "infinite-tail";
        return "popped";
      }),
      highlight: Number.isSafeInteger(current?.value) && current.value <= upper ? [current.value - 1] : [],
      mark: heap.length && heap[0] <= upper ? [heap[0] - 1] : [],
      vars: [
        { name: "operation", value: current?.label ?? "—" },
        { name: "next_smallest", value: nextSmallest },
        { name: "heap_min", value: heap[0] ?? "—" },
        { name: "added_set", value: JSON.stringify([...addedSet].sort((a, b) => a - b)) },
        { name: "outputs", value: JSON.stringify(outputs) },
      ],
      metrics: [
        { label: bi("Con trỏ mới", "Fresh cursor"), value: nextSmallest, state: "active" },
        { label: bi("Số đã trả lại", "Added-back count"), value: heap.length, state: heap.length ? "candidate" : "muted" },
        { label: bi("Kết quả gần nhất", "Latest output"), value: outputs.at(-1) ?? "—", state: "updated" },
      ],
      groups: [
        {
          title: bi("Trạng thái tập vô hạn", "Infinite-set state"),
          items: [
            { label: bi("Min-heap", "Min-heap"), value: `[${heap.join(", ")}]`, state: heap.length ? "candidate" : "muted" },
            { label: bi("Set chống trùng", "Dedup set"), value: `[${[...addedSet].sort((a, b) => a - b).join(", ")}]`, state: "default" },
            { label: bi("Đuôi vô hạn bắt đầu", "Infinite tail starts"), value: nextSmallest, state: "success" },
          ],
        },
      ],
      table: {
        title: bi("Lịch sử thao tác", "Operation history"),
        columns: [bi("#", "#"), bi("Thao tác", "Operation"), bi("Kết quả", "Result")],
        rows: history.map((entry, index) => [index + 1, entry.label, entry.result === null ? "None" : entry.result]),
      },
      sequence: Array.from({ length: upper }, (_, index) => {
        const value = index + 1;
        return {
          label: String(value),
          value: addedSet.has(value) ? bi("đã thêm lại", "added back") : value >= nextSmallest ? bi("còn trong tập", "still present") : bi("đã lấy", "popped"),
          state: value === heap[0] ? "candidate" : addedSet.has(value) || value >= nextSmallest ? "success" : "muted",
        };
      }),
      final,
      answer: final ? [...outputs] : null,
    });
  };

  emit(1, 0, bi("Import min-heap", "Import min-heap"), bi("Heap giữ số nhỏ nhất được thêm trở lại ở gốc.", "The heap keeps the smallest added-back number at its root."), bi("heap root = min(added_back)", "heap root = min(added_back)"));
  emit(5, 0, bi("Bắt đầu tại số 1", "Start at number 1"), bi("Mọi số từ next_smallest trở lên vẫn thuộc tập.", "Every number from next_smallest onward is still present."), bi("next_smallest = 1", "next_smallest = 1"));
  emit(6, 0, bi("Tạo heap rỗng", "Create an empty heap"), bi("Heap chỉ chứa các số nhỏ hơn con trỏ đã được trả lại.", "The heap stores only returned numbers below the cursor."), bi("added_back = []", "added_back = []"));
  emit(7, 0, bi("Tạo set chống trùng", "Create the dedup set"), bi("Set ngăn addBack cùng một số nhiều lần.", "The set prevents the same number from being added back twice."), bi("added_set = set()", "added_set = set()"));

  operations.forEach((operation, operationIndex) => {
    current = { ...operation, index: operationIndex, value: operation.args[0] ?? null };
    if (operation.name === "popSmallest") {
      emit(9, 1, bi("Gọi popSmallest", "Call popSmallest"), bi("Ưu tiên số đã trả lại; nếu không có thì dùng con trỏ mới.", "Prefer a returned number; otherwise use the fresh cursor."), bi("min(heap_min, next_smallest)", "min(heap_min, next_smallest)"));
      const hasReturned = heap.length > 0;
      emit(10, 1, bi(hasReturned ? "Heap có ứng viên" : "Heap rỗng", hasReturned ? "The heap has a candidate" : "The heap is empty"), bi(hasReturned ? `Gốc heap ${heap[0]} là đáp án nhỏ nhất.` : `${nextSmallest} là số mới nhỏ nhất.`, hasReturned ? `Heap root ${heap[0]} is the minimum answer.` : `${nextSmallest} is the smallest fresh number.`), bi(`bool(added_back) = ${hasReturned}`, `bool(added_back) = ${hasReturned}`));
      let value;
      if (hasReturned) {
        value = heapPop(heap);
        current = { ...current, value };
        emit(11, 1, bi(`Lấy ${value} khỏi heap`, `Pop ${value} from the heap`), bi("heappop luôn lấy gốc nhỏ nhất.", "heappop always removes the minimum root."), bi(`smallest = ${value}`, `smallest = ${value}`));
        addedSet.delete(value);
        emit(12, 1, bi(`Xóa ${value} khỏi set`, `Remove ${value} from the set`), bi("Heap và set tiếp tục biểu diễn cùng tập số.", "The heap and set continue to represent the same values."), bi(`added_set.remove(${value})`, `added_set.remove(${value})`));
        outputs.push(value);
        history.push({ label: operation.label, result: value });
        emit(13, 1, bi(`Trả về ${value}`, `Return ${value}`), bi("Đây là số nhỏ nhất hiện có trong tập.", "This is the smallest number currently present."), bi(`return ${value}`, `return ${value}`));
      } else {
        value = nextSmallest;
        current = { ...current, value };
        emit(14, 1, bi(`Chọn con trỏ ${value}`, `Take cursor ${value}`), bi("Không có số cũ nào được trả lại.", "No previously popped number has been added back."), bi(`smallest = ${value}`, `smallest = ${value}`));
        nextSmallest += 1;
        emit(15, 1, bi(`Tăng con trỏ lên ${nextSmallest}`, `Advance cursor to ${nextSmallest}`), bi("Số mới kế tiếp chưa từng bị lấy.", "The next fresh number has never been popped."), bi(`next_smallest = ${nextSmallest}`, `next_smallest = ${nextSmallest}`));
        outputs.push(value);
        history.push({ label: operation.label, result: value });
        emit(16, 1, bi(`Trả về ${value}`, `Return ${value}`), bi("Con trỏ cũ là số nhỏ nhất của đuôi vô hạn.", "The old cursor was the minimum of the infinite tail."), bi(`return ${value}`, `return ${value}`));
      }
      return;
    }

    const value = operation.args[0];
    emit(18, 2, bi(`Gọi addBack(${value})`, `Call addBack(${value})`), bi("Chỉ số đã bị lấy và chưa có trong heap mới cần thêm.", "Only a popped number not already in the heap needs insertion."), bi(`num = ${value}`, `num = ${value}`));
    const shouldAdd = value < nextSmallest && !addedSet.has(value);
    emit(19, 2, bi(shouldAdd ? "Có thể thêm lại" : "Bỏ qua an toàn", shouldAdd ? "Add the number back" : "Safely ignore"), bi(shouldAdd ? `${value} nhỏ hơn con trỏ và chưa có trong set.` : `${value} vẫn còn trong tập hoặc đã được thêm lại.`, shouldAdd ? `${value} is below the cursor and absent from the set.` : `${value} is still present or was already added back.`), bi(`${value} < ${nextSmallest} and ${!addedSet.has(value)} = ${shouldAdd}`, `${value} < ${nextSmallest} and ${!addedSet.has(value)} = ${shouldAdd}`));
    if (shouldAdd) {
      heapPush(heap, value);
      emit(20, 2, bi(`Đẩy ${value} vào heap`, `Push ${value} into the heap`), bi(`Gốc heap mới là ${heap[0]}.`, `The new heap root is ${heap[0]}.`), bi(`heappush(added_back, ${value})`, `heappush(added_back, ${value})`));
      addedSet.add(value);
      emit(21, 2, bi(`Đánh dấu ${value} đã thêm`, `Mark ${value} as added`), bi("Set giữ thao tác addBack idempotent.", "The set keeps addBack idempotent."), bi(`added_set.add(${value})`, `added_set.add(${value})`));
    }
    outputs.push(null);
    history.push({ label: operation.label, result: null });
  });

  current = null;
  emit(16, 3, bi("Hoàn tất mô phỏng", "Simulation complete"), bi(`Kết quả: ${JSON.stringify(outputs)}.`, `Outputs: ${JSON.stringify(outputs)}.`), bi("return outputs", "return outputs"), true);
  return {
    original: operations.map((operation) => [operation.name, ...operation.args]),
    operations: operations.map((operation) => ({ name: operation.name, args: [...operation.args] })),
    answer: outputs,
    steps: tracer.finish(),
  };
}

module.exports = {
  2336: {
    id: 2336,
    difficulty: "medium",
    slug: "smallest-number-in-infinite-set",
    category: { key: "design", vi: "Thiết kế hệ thống", en: "Design" },
    tags: [
      { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
      { key: "hash-set", vi: "Hash Set", en: "Hash Set" },
    ],
    title: bi("Số nhỏ nhất trong tập vô hạn", "Smallest Number in Infinite Set"),
    titleVi: bi("Cấp số nhỏ nhất và cho phép trả lại", "Allocate the smallest number and add it back"),
    statement: bi("Tập ban đầu chứa mọi số nguyên dương. popSmallest lấy và xóa số nhỏ nhất; addBack thêm lại một số đã bị xóa.", "The set initially contains every positive integer. popSmallest removes and returns the minimum; addBack restores a removed number."),
    defaultInput: '[["popSmallest"],["popSmallest"],["addBack",1],["popSmallest"],["popSmallest"],["popSmallest"]]',
    inputKind: "string",
    inputLabel: bi("Operations JSON", "Operations JSON"),
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      bi("next_smallest đại diện cho đuôi vô hạn chưa từng bị lấy.", "next_smallest represents the untouched infinite tail."),
      bi("Min-heap chứa các số nhỏ hơn con trỏ đã được addBack.", "A min-heap stores numbers below the cursor that were added back."),
      bi("Hash set ngăn một số xuất hiện hai lần trong heap.", "A hash set prevents duplicate heap entries."),
    ],
    complexity: {
      time: "pop/add O(log k)",
      space: "O(k)",
      note: bi("k là số phần tử đã addBack đang chờ trong heap.", "k is the number of added-back values waiting in the heap."),
    },
    code: SOURCE,
    parseOperations,
    builder: buildSteps,
  },
};
