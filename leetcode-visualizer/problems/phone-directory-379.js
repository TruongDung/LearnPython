"use strict";

const { bi, createTracer, parseInteger, parsePlainParams } = require("./hard-viz-shared");

const PROBLEM_ID = 379;
const MAX_NUMBERS = 50;
const MAX_OPERATIONS = 70;

const SOURCE = Object.freeze([
  "from collections import deque",
  "",
  "class PhoneDirectory:",
  "    def __init__(self, maxNumbers: int):",
  "        self.available = deque(range(maxNumbers))",
  "        self.free = set(range(maxNumbers))",
  "",
  "    def get(self) -> int:",
  "        if not self.available:",
  "            return -1",
  "        number = self.available.popleft()",
  "        self.free.remove(number)",
  "        return number",
  "",
  "    def check(self, number: int) -> bool:",
  "        return number in self.free",
  "",
  "    def release(self, number: int) -> None:",
  "        if number in self.free:",
  "            return",
  "        self.free.add(number)",
  "        self.available.append(number)",
]);

function parseOperations(input) {
  let decoded = input;
  if (typeof input === "string") {
    try { decoded = JSON.parse(input.trim()); } catch (_error) { throw new TypeError(`#${PROBLEM_ID}: operations must be valid JSON.`); }
  }
  if (!Array.isArray(decoded) || decoded.length < 1 || decoded.length > MAX_OPERATIONS) throw new RangeError(`#${PROBLEM_ID}: provide 1..${MAX_OPERATIONS} operations.`);
  return decoded.map((row, index) => {
    if (!Array.isArray(row) || typeof row[0] !== "string") throw new TypeError(`#${PROBLEM_ID}: invalid operation ${index + 1}.`);
    const [name, value] = row;
    if (name === "get" && row.length === 1) return { name, args: [], label: "get()" };
    if ((name === "check" || name === "release") && row.length === 2 && Number.isSafeInteger(value)) return { name, args: [value], label: `${name}(${value})` };
    throw new RangeError(`#${PROBLEM_ID}: invalid operation ${index + 1}.`);
  });
}

function buildSteps(input, params = {}) {
  const parsedParams = parsePlainParams(params, PROBLEM_ID);
  const maxNumbers = parseInteger(parsedParams.maxNumbers ?? 3, { problemId: PROBLEM_ID, name: "maxNumbers", min: 1, max: MAX_NUMBERS });
  const operations = parseOperations(input);
  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: SOURCE,
    phases: [bi("Khởi tạo", "Initialize"), bi("Cấp số", "Get"), bi("Kiểm tra", "Check"), bi("Thu hồi", "Release"), bi("Hoàn tất", "Complete")],
    maxSteps: 220,
  });
  const queue = Array.from({ length: maxNumbers }, (_, index) => index);
  const free = new Set(queue);
  const outputs = [];
  const history = [];
  let current = null;

  const emit = (line, phaseIndex, title, note, formula, final = false) => {
    tracer.emit({
      phaseIndex,
      codeLines: [line],
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`),
      note,
      action: title,
      formula,
      arr: Array.from({ length: maxNumbers }, (_, index) => index),
      sub: Array.from({ length: maxNumbers }, (_, number) => free.has(number) ? "free" : "assigned"),
      highlight: Number.isSafeInteger(current?.number) && current.number >= 0 && current.number < maxNumbers ? [current.number] : [],
      mark: queue.length ? [queue[0]] : [],
      vars: [
        { name: "operation", value: current?.label ?? "—" },
        { name: "queue", value: JSON.stringify(queue) },
        { name: "free", value: JSON.stringify([...free].sort((a, b) => a - b)) },
        { name: "outputs", value: JSON.stringify(outputs) },
      ],
      metrics: [
        { label: bi("Số còn trống", "Free numbers"), value: free.size, state: free.size ? "success" : "danger" },
        { label: bi("Số đã cấp", "Assigned numbers"), value: maxNumbers - free.size, state: "updated" },
        { label: bi("Đầu queue", "Queue front"), value: queue[0] ?? "—", state: queue.length ? "candidate" : "muted" },
      ],
      groups: [{
        title: bi("Queue + Set", "Queue + Set"),
        items: [
          { label: bi("Queue có thể cấp", "Allocation queue"), value: `[${queue.join(", ")}]`, state: queue.length ? "candidate" : "muted" },
          { label: bi("Set còn trống", "Free set"), value: `[${[...free].sort((a, b) => a - b).join(", ")}]`, state: "success" },
          { label: bi("Invariant", "Invariant"), value: queue.length === free.size && queue.every((number) => free.has(number)) ? "queue = free" : "transition", state: "default" },
        ],
      }],
      table: {
        title: bi("Kết quả thao tác", "Operation results"),
        columns: [bi("#", "#"), bi("Thao tác", "Operation"), bi("Kết quả", "Result")],
        rows: history.map((entry, index) => [index + 1, entry.label, entry.result === null ? "None" : String(entry.result)]),
      },
      sequence: queue.map((number, index) => ({ label: bi(`Vị trí ${index}`, `Position ${index}`), value: number, state: index === 0 ? "candidate" : "success" })),
      final,
      answer: final ? [...outputs] : null,
    });
  };

  emit(1, 0, bi("Import deque", "Import deque"), bi("Deque cấp và thu hồi số trong O(1).", "A deque allocates and recycles numbers in O(1)."), bi("queue front → next allocation", "queue front → next allocation"));
  emit(5, 0, bi("Tạo queue số trống", "Create the free-number queue"), bi(`Queue ban đầu chứa 0..${maxNumbers - 1}.`, `The initial queue contains 0..${maxNumbers - 1}.`), bi(`available = deque(range(${maxNumbers}))`, `available = deque(range(${maxNumbers}))`));
  emit(6, 0, bi("Tạo set tra cứu", "Create the lookup set"), bi("Set trả lời check và chống release trùng.", "The set answers check and prevents duplicate release."), bi("free = set(available)", "free = set(available)"));

  operations.forEach((operation, index) => {
    const number = operation.args[0];
    if (number !== undefined && (number < 0 || number >= maxNumbers)) throw new RangeError(`#${PROBLEM_ID}: operation ${index + 1} number must be in 0..${maxNumbers - 1}.`);
    current = { ...operation, index, number: number ?? null };
    if (operation.name === "get") {
      emit(8, 1, bi("Gọi get", "Call get"), bi("Lấy đầu queue nếu còn số.", "Take the queue front when a number remains."), bi("get next available number", "get next available number"));
      const empty = queue.length === 0;
      emit(9, 1, bi(empty ? "Queue rỗng" : "Queue còn số", empty ? "The queue is empty" : "The queue has a number"), bi(empty ? "Không còn số để cấp." : `Số kế tiếp là ${queue[0]}.`, empty ? "No number remains for allocation." : `The next number is ${queue[0]}.`), bi(`not available = ${empty}`, `not available = ${empty}`));
      if (empty) {
        outputs.push(-1); history.push({ label: operation.label, result: -1 });
        emit(10, 1, bi("Trả về -1", "Return -1"), bi("Directory đã cấp hết số.", "The directory has no available numbers."), bi("return -1", "return -1"));
        return;
      }
      const allocated = queue.shift();
      current = { ...current, number: allocated };
      emit(11, 1, bi(`Lấy ${allocated} khỏi queue`, `Remove ${allocated} from the queue`), bi("popleft bảo toàn thứ tự tái sử dụng.", "popleft preserves recycling order."), bi(`number = ${allocated}`, `number = ${allocated}`));
      free.delete(allocated);
      emit(12, 1, bi(`Đánh dấu ${allocated} đã cấp`, `Mark ${allocated} assigned`), bi("Set và queue lại đồng bộ.", "The set and queue are synchronized again."), bi(`free.remove(${allocated})`, `free.remove(${allocated})`));
      outputs.push(allocated); history.push({ label: operation.label, result: allocated });
      emit(13, 1, bi(`Trả về ${allocated}`, `Return ${allocated}`), bi("Số này không còn available cho tới khi release.", "This number remains unavailable until release."), bi(`return ${allocated}`, `return ${allocated}`));
      return;
    }

    if (operation.name === "check") {
      emit(15, 2, bi(`Gọi check(${number})`, `Call check(${number})`), bi("Set membership cho kết quả O(1).", "Set membership answers in O(1)."), bi(`${number} in free`, `${number} in free`));
      const result = free.has(number);
      outputs.push(result); history.push({ label: operation.label, result });
      emit(16, 2, bi(result ? `${number} còn trống` : `${number} đã được cấp`, result ? `${number} is available` : `${number} is assigned`), bi(`check trả về ${result}.`, `check returns ${result}.`), bi(`return ${result}`, `return ${result}`));
      return;
    }

    emit(18, 3, bi(`Gọi release(${number})`, `Call release(${number})`), bi("Release lặp lại phải là no-op.", "Repeated release must be a no-op."), bi(`number = ${number}`, `number = ${number}`));
    const alreadyFree = free.has(number);
    emit(19, 3, bi(alreadyFree ? "Số đã trống" : "Số đang được cấp", alreadyFree ? "The number is already free" : "The number is assigned"), bi(alreadyFree ? "Không thêm trùng vào queue." : "Có thể trả số về directory.", alreadyFree ? "Do not duplicate it in the queue." : "Return the number to the directory."), bi(`${number} in free = ${alreadyFree}`, `${number} in free = ${alreadyFree}`));
    if (alreadyFree) {
      outputs.push(null); history.push({ label: operation.label, result: null });
      emit(20, 3, bi("No-op", "No-op"), bi("Queue và set giữ nguyên.", "The queue and set stay unchanged."), bi("return None", "return None"));
      return;
    }
    free.add(number);
    emit(21, 3, bi(`Đánh dấu ${number} trống`, `Mark ${number} free`), bi("Set cho phép check thấy số ngay lập tức.", "The set makes the number immediately checkable."), bi(`free.add(${number})`, `free.add(${number})`));
    queue.push(number);
    outputs.push(null); history.push({ label: operation.label, result: null });
    emit(22, 3, bi(`Đưa ${number} vào cuối queue`, `Append ${number} to the queue`), bi("Số được thu hồi sẽ được cấp lại theo thứ tự FIFO.", "The released number will be reused in FIFO order."), bi(`available.append(${number})`, `available.append(${number})`));
  });

  current = null;
  emit(13, 4, bi("Hoàn tất mô phỏng", "Simulation complete"), bi(`Kết quả: ${JSON.stringify(outputs)}.`, `Outputs: ${JSON.stringify(outputs)}.`), bi("return outputs", "return outputs"), true);
  return { original: { maxNumbers, operations: operations.map((operation) => [operation.name, ...operation.args]) }, operations: operations.map((operation) => ({ name: operation.name, args: [...operation.args] })), answer: outputs, steps: tracer.finish() };
}

module.exports = {
  379: {
    id: 379,
    difficulty: "medium",
    premium: true,
    slug: "design-phone-directory",
    category: { key: "design", vi: "Thiết kế hệ thống", en: "Design" },
    tags: [{ key: "queue", vi: "Queue", en: "Queue" }, { key: "hash-set", vi: "Hash Set", en: "Hash Set" }],
    title: bi("Thiết kế danh bạ số điện thoại", "Design Phone Directory"),
    titleVi: bi("Cấp, kiểm tra và thu hồi số", "Allocate, check, and release numbers"),
    statement: bi("Quản lý các số 0..maxNumbers-1 với get, check và release.", "Manage numbers 0..maxNumbers-1 with get, check, and release."),
    defaultInput: '[["get"],["get"],["check",2],["get"],["check",2],["release",2],["check",2]]',
    inputKind: "string",
    inputLabel: bi("Operations JSON", "Operations JSON"),
    extraParams: [{ key: "maxNumbers", type: "number", min: 1, max: MAX_NUMBERS, default: 3, label: bi("maxNumbers", "maxNumbers") }],
    debugMode: "line-by-line",
    approach: [bi("Queue chứa đúng các số có thể cấp; đầu queue là số kế tiếp.", "The queue contains exactly the allocatable numbers; its front is next."), bi("Set hỗ trợ check và ngăn release trùng trong O(1).", "A set supports check and prevents duplicate release in O(1).")],
    complexity: { time: "O(1) per operation", space: "O(n)", note: bi("Mỗi số xuất hiện tối đa một lần trong queue và set.", "Each number appears at most once in the queue and set.") },
    code: SOURCE,
    parseOperations,
    builder: buildSteps,
  },
};
