"use strict";

const { bi, parseInteger, parsePlainParams } = require("./hard-viz-shared");

const PROBLEM_ID = 1146;
const MAX_LENGTH = 40;
const MAX_OPERATIONS = 80;
const MAX_VALUE = 1_000_000_000;
const MAX_TRACE_STEPS = 260;

const SOURCE = Object.freeze([
  "from bisect import bisect_right",
  "",
  "class SnapshotArray:",
  "    def __init__(self, length: int):",
  "        self.snap_id = 0",
  "        self.history = [[(0, 0)] for _ in range(length)]",
  "",
  "    def set(self, index: int, val: int) -> None:",
  "        records = self.history[index]",
  "        if records[-1][0] == self.snap_id:",
  "            records[-1] = (self.snap_id, val)",
  "        else:",
  "            records.append((self.snap_id, val))",
  "",
  "    def snap(self) -> int:",
  "        result = self.snap_id",
  "        self.snap_id += 1",
  "        return result",
  "",
  "    def get(self, index: int, snap_id: int) -> int:",
  "        records = self.history[index]",
  "        position = bisect_right(records, (snap_id, float('inf'))) - 1",
  "        return records[position][1]",
]);

const cloneRecords = (records) => records.map(([snapId, value]) => [snapId, value]);

function parseOperations1146(input, length = MAX_LENGTH) {
  let decoded = input;
  if (typeof input === "string") {
    try {
      decoded = JSON.parse(input.trim());
    } catch (_error) {
      throw new TypeError(`#${PROBLEM_ID}: operations phải là JSON hợp lệ / operations must be valid JSON.`);
    }
  }
  if (!Array.isArray(decoded) || decoded.length < 1 || decoded.length > MAX_OPERATIONS) {
    throw new RangeError(`#${PROBLEM_ID}: cần 1..${MAX_OPERATIONS} operations / provide 1..${MAX_OPERATIONS} operations.`);
  }

  let availableSnapshots = 0;
  return decoded.map((row, position) => {
    if (!Array.isArray(row) || typeof row[0] !== "string") {
      throw new TypeError(`#${PROBLEM_ID}: operation ${position + 1} không hợp lệ / is invalid.`);
    }
    const [name, first, second] = row;
    if (name === "set" && row.length === 3) {
      if (!Number.isSafeInteger(first) || first < 0 || first >= length) {
        throw new RangeError(`#${PROBLEM_ID}: set index tại operation ${position + 1} phải thuộc 0..${length - 1}.`);
      }
      if (!Number.isSafeInteger(second) || second < 0 || second > MAX_VALUE) {
        throw new RangeError(`#${PROBLEM_ID}: set value tại operation ${position + 1} phải thuộc 0..${MAX_VALUE}.`);
      }
      return { name, args: [first, second], label: `set(${first}, ${second})` };
    }
    if (name === "snap" && row.length === 1) {
      const operation = { name, args: [], label: "snap()" };
      availableSnapshots += 1;
      return operation;
    }
    if (name === "get" && row.length === 3) {
      if (!Number.isSafeInteger(first) || first < 0 || first >= length) {
        throw new RangeError(`#${PROBLEM_ID}: get index tại operation ${position + 1} phải thuộc 0..${length - 1}.`);
      }
      if (!Number.isSafeInteger(second) || second < 0 || second >= availableSnapshots) {
        throw new RangeError(`#${PROBLEM_ID}: get snap_id tại operation ${position + 1} phải trỏ tới snapshot đã tạo.`);
      }
      return { name, args: [first, second], label: `get(${first}, ${second})` };
    }
    throw new RangeError(`#${PROBLEM_ID}: operation ${position + 1} phải là set(index,val), snap(), hoặc get(index,snap_id).`);
  });
}

function findPosition(records, snapId) {
  let low = 0;
  let high = records.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (records[mid][0] <= snapId) low = mid + 1;
    else high = mid;
  }
  return low - 1;
}

function buildSteps1146(input, params = {}) {
  const parsedParams = parsePlainParams(params, PROBLEM_ID);
  const length = parseInteger(parsedParams.length ?? 3, {
    problemId: PROBLEM_ID,
    name: "length",
    min: 1,
    max: MAX_LENGTH,
  });
  const operations = parseOperations1146(input, length);
  const histories = Array.from({ length }, () => [[0, 0]]);
  const outputs = [];
  const operationHistory = [];
  const steps = [];
  let snapId = 0;
  let traceTruncated = false;

  const emit = ({ phase, operationIndex = null, title, note, codeLines, activeIndex = null, binary = null, coalesced = false, final = false }) => {
    if (!final && steps.length >= MAX_TRACE_STEPS - 1) {
      traceTruncated = true;
      return;
    }
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: histories.map((records) => records.at(-1)[1]),
      sub: histories.map((records, index) => `index ${index} · ${records.length} record${records.length === 1 ? "" : "s"}`),
      highlight: Number.isInteger(activeIndex) ? [activeIndex] : [],
      mark: [],
      vars: [
        { name: "snap_id", value: snapId },
        { name: "operation", value: operationIndex === null ? "complete" : operations[operationIndex].label },
        { name: "stored records", value: histories.reduce((sum, records) => sum + records.length, 0) },
        { name: "outputs", value: JSON.stringify(outputs) },
      ],
      snapshotArray1146View: {
        phase,
        operationIndex,
        operationCount: operations.length,
        length,
        snapId,
        activeIndex,
        histories: histories.map(cloneRecords),
        operationHistory: operationHistory.map((entry) => ({ ...entry })),
        outputs: [...outputs],
        binary: binary ? { ...binary, record: binary.record ? [...binary.record] : null } : null,
        coalesced,
        traceTruncated,
        answer: final ? [...outputs] : null,
      },
    });
  };

  emit({
    phase: "init",
    operationIndex: 0,
    title: bi("Khởi tạo lịch sử thưa", "Initialize sparse histories"),
    note: bi("Mỗi index bắt đầu bằng record (snap 0, value 0); chưa sao chép toàn bộ mảng.", "Each index starts with record (snap 0, value 0); no full-array copy is made."),
    codeLines: [1, 3, 4, 5, 6],
  });

  operations.forEach((operation, operationIndex) => {
    if (operation.name === "set") {
      const [index, value] = operation.args;
      const records = histories[index];
      const coalesced = records.at(-1)[0] === snapId;
      if (coalesced) records[records.length - 1] = [snapId, value];
      else records.push([snapId, value]);
      outputs.push(null);
      operationHistory.push({ index: operationIndex + 1, label: operation.label, result: null, snapId });
      emit({
        phase: coalesced ? "set-update" : "set-append",
        operationIndex,
        activeIndex: index,
        coalesced,
        title: coalesced
          ? bi(`Ghi đè record hiện tại của index ${index}`, `Overwrite index ${index}'s current record`)
          : bi(`Thêm thay đổi cho index ${index}`, `Append a change for index ${index}`),
        note: coalesced
          ? bi(`Snapshot ${snapId} chưa đóng băng, nên chỉ cần cập nhật value thành ${value}.`, `Snapshot ${snapId} is not frozen yet, so its value is simply updated to ${value}.`)
          : bi(`Index này chưa đổi trong phiên snapshot ${snapId}; thêm đúng một record.`, `This index has not changed in snapshot session ${snapId}; append exactly one record.`),
        codeLines: coalesced ? [8, 9, 10, 11] : [8, 9, 10, 12, 13],
      });
      return;
    }

    if (operation.name === "snap") {
      const frozen = snapId;
      outputs.push(frozen);
      operationHistory.push({ index: operationIndex + 1, label: operation.label, result: frozen, snapId: frozen });
      snapId += 1;
      emit({
        phase: "snap",
        operationIndex,
        title: bi(`Đóng băng snapshot ${frozen}`, `Freeze snapshot ${frozen}`),
        note: bi("Không copy mảng: chỉ trả ID hiện tại rồi tăng bộ đếm.", "No array is copied: return the current ID, then increment the counter."),
        codeLines: [15, 16, 17, 18],
      });
      return;
    }

    const [index, querySnapId] = operation.args;
    const records = histories[index];
    emit({
      phase: "get-start",
      operationIndex,
      activeIndex: index,
      title: bi(`Tìm giá trị index ${index} tại snapshot ${querySnapId}`, `Find index ${index} at snapshot ${querySnapId}`),
      note: bi("Cần record ngoài cùng bên phải có snap_id ≤ snapshot cần hỏi.", "We need the rightmost record whose snap_id is ≤ the requested snapshot."),
      codeLines: [20, 21, 22],
      binary: { querySnapId, low: 0, high: records.length, mid: null, record: null, decision: "start", resultPosition: null },
    });

    let low = 0;
    let high = records.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const record = records[mid];
      const moveRight = record[0] <= querySnapId;
      emit({
        phase: moveRight ? "search-right" : "search-left",
        operationIndex,
        activeIndex: index,
        title: moveRight
          ? bi(`${record[0]} ≤ ${querySnapId}: tìm tiếp bên phải`, `${record[0]} ≤ ${querySnapId}: search right`)
          : bi(`${record[0]} > ${querySnapId}: thu hẹp bên trái`, `${record[0]} > ${querySnapId}: shrink left`),
        note: moveRight
          ? bi("Record giữa hợp lệ, nhưng có thể còn record mới hơn vẫn không vượt query.", "The middle record is valid, but a newer valid record may still exist.")
          : bi("Record giữa thuộc tương lai so với snapshot cần đọc.", "The middle record belongs to the future relative to the requested snapshot."),
        codeLines: [22],
        binary: { querySnapId, low, high, mid, record, decision: moveRight ? "right" : "left", resultPosition: null },
      });
      if (moveRight) low = mid + 1;
      else high = mid;
    }
    const position = low - 1;
    const value = records[position][1];
    outputs.push(value);
    operationHistory.push({ index: operationIndex + 1, label: operation.label, result: value, snapId: querySnapId });
    emit({
      phase: "get-done",
      operationIndex,
      activeIndex: index,
      title: bi(`Record đúng là (${records[position][0]}, ${value})`, `The matching record is (${records[position][0]}, ${value})`),
      note: bi(`bisect_right dừng ở ${low}; lùi một ô về vị trí ${position} và trả ${value}.`, `bisect_right stops at ${low}; step back to position ${position} and return ${value}.`),
      codeLines: [22, 23],
      binary: { querySnapId, low, high, mid: null, record: records[position], decision: "found", resultPosition: position },
    });
  });

  emit({
    phase: "done",
    title: bi("Hoàn tất chuỗi thao tác", "Operation stream complete"),
    note: traceTruncated
      ? bi("Kết quả đầy đủ; trace dài đã được rút gọn.", "The outputs are complete; the long trace was compacted.")
      : bi("Chỉ các lần set tạo dữ liệu; snap chỉ tăng ID và get tìm kiếm trên lịch sử của một index.", "Only set calls store data; snap only increments an ID and get searches one index's history."),
    codeLines: [23],
    final: true,
  });

  return {
    original: { length, operations: operations.map((operation) => [operation.name, ...operation.args]) },
    operations: operations.map((operation) => ({ name: operation.name, args: [...operation.args] })),
    answer: outputs,
    steps,
  };
}

module.exports = {
  1146: {
    id: 1146,
    difficulty: "medium",
    slug: "snapshot-array",
    category: { key: "design", vi: "Thiết kế hệ thống", en: "Design" },
    tags: [
      { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "history", vi: "Lịch sử phiên bản", en: "Version History" },
    ],
    title: bi("Mảng Snapshot", "Snapshot Array"),
    titleVi: bi("Lưu lịch sử thưa, đọc phiên bản bằng binary search", "Store sparse history, read versions with binary search"),
    statement: bi(
      "Thiết kế mảng hỗ trợ set, snap và get(index, snap_id). get phải trả giá trị tại thời điểm snapshot được tạo.",
      "Design an array supporting set, snap, and get(index, snap_id). get must return the value at the time that snapshot was taken.",
    ),
    defaultInput: '[["set",0,5],["snap"],["set",0,6],["get",0,0]]',
    inputKind: "string",
    inputLabel: bi("Operations JSON: set / snap / get", "Operations JSON: set / snap / get"),
    extraParams: [{ key: "length", type: "number", min: 1, max: MAX_LENGTH, default: 3, label: bi("length (độ dài mảng)", "length (array size)") }],
    debugMode: "line-by-line",
    approach: [
      bi("Mỗi index lưu các cặp (snap_id, value), khởi đầu bằng (0, 0).", "Each index stores (snap_id, value) pairs, starting with (0, 0)."),
      bi("Nhiều set trong cùng phiên snapshot ghi đè record cuối; snap chỉ tăng bộ đếm.", "Repeated sets in one snapshot session overwrite the last record; snap only increments the counter."),
      bi("get dùng bisect_right để tìm record mới nhất có snap_id không vượt query.", "get uses bisect_right to find the newest record whose snap_id does not exceed the query."),
    ],
    complexity: {
      time: "set O(1), snap O(1), get O(log U)",
      space: "O(n + S)",
      note: bi("U là số lần index được thay đổi; S là tổng số thay đổi được lưu.", "U is the number of changes to one index; S is the total number of stored changes."),
    },
    code: SOURCE,
    parseOperations: parseOperations1146,
    builder: buildSteps1146,
  },
};
