"use strict";

const { bi, createTracer } = require("./hard-viz-shared");

const PROBLEM_ID = 635;
const MAX_OPERATIONS = 30;
const MAX_ID = 10_000;
const GRANULARITIES = Object.freeze({ Year: 4, Month: 7, Day: 10, Hour: 13, Minute: 16, Second: 19 });
const TIMESTAMP_PATTERN = /^\d{4}:\d{2}:\d{2}:\d{2}:\d{2}:\d{2}$/;

const SOURCE = Object.freeze([
  "class LogSystem:",
  "    LENGTHS = {'Year': 4, 'Month': 7, 'Day': 10,",
  "               'Hour': 13, 'Minute': 16, 'Second': 19}",
  "",
  "    def __init__(self):",
  "        self.logs = []",
  "",
  "    def put(self, log_id: int, timestamp: str) -> None:",
  "        self.logs.append((log_id, timestamp))",
  "",
  "    def retrieve(self, start: str, end: str, granularity: str):",
  "        length = self.LENGTHS[granularity]",
  "        start_key = start[:length]",
  "        end_key = end[:length]",
  "        result = []",
  "        for log_id, timestamp in self.logs:",
  "            key = timestamp[:length]",
  "            if start_key <= key <= end_key:",
  "                result.append(log_id)",
  "        return result",
]);

function parseTimestamp(value, label) {
  if (typeof value !== "string" || !TIMESTAMP_PATTERN.test(value)) throw new TypeError(`#${PROBLEM_ID}: ${label} must use YYYY:MM:DD:HH:MM:SS.`);
  const [year, month, day, hour, minute, second] = value.split(":").map(Number);
  if (year < 0 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    throw new RangeError(`#${PROBLEM_ID}: ${label} contains an out-of-range timestamp field.`);
  }
  return value;
}

function parseOperations(input) {
  let decoded = input;
  if (typeof input === "string") {
    try { decoded = JSON.parse(input.trim()); } catch (_error) { throw new TypeError(`#${PROBLEM_ID}: operations must be valid JSON.`); }
  }
  if (!Array.isArray(decoded) || decoded.length < 1 || decoded.length > MAX_OPERATIONS) throw new RangeError(`#${PROBLEM_ID}: provide 1..${MAX_OPERATIONS} operations.`);
  const seenIds = new Set();
  return decoded.map((row, position) => {
    if (!Array.isArray(row) || typeof row[0] !== "string") throw new TypeError(`#${PROBLEM_ID}: invalid operation ${position + 1}.`);
    if (row[0] === "put" && row.length === 3 && Number.isSafeInteger(row[1]) && row[1] >= 1 && row[1] <= MAX_ID) {
      if (seenIds.has(row[1])) throw new RangeError(`#${PROBLEM_ID}: duplicate log id ${row[1]}.`);
      seenIds.add(row[1]);
      const timestamp = parseTimestamp(row[2], `operation ${position + 1} timestamp`);
      return { name: "put", args: [row[1], timestamp], label: `put(${row[1]}, ${timestamp})` };
    }
    if (row[0] === "retrieve" && row.length === 4 && Object.hasOwn(GRANULARITIES, row[3])) {
      const start = parseTimestamp(row[1], `operation ${position + 1} start`);
      const end = parseTimestamp(row[2], `operation ${position + 1} end`);
      const length = GRANULARITIES[row[3]];
      if (start.slice(0, length) > end.slice(0, length)) throw new RangeError(`#${PROBLEM_ID}: retrieve start must not exceed end at ${row[3]} granularity.`);
      return { name: "retrieve", args: [start, end, row[3]], label: `retrieve(${row[3]})` };
    }
    throw new RangeError(`#${PROBLEM_ID}: invalid operation ${position + 1}.`);
  });
}

function buildSteps(input) {
  const operations = parseOperations(input);
  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: SOURCE,
    phases: [bi("Khởi tạo", "Initialize"), bi("Lưu log", "Store log"), bi("Chuẩn hóa khoảng", "Normalize range"), bi("Quét log", "Scan logs"), bi("Hoàn tất", "Complete")],
    maxSteps: 320,
  });
  const logs = [];
  const outputs = [];
  const history = [];
  let current = null;
  let query = null;

  const emit = (line, phaseIndex, title, note, formula, final = false) => {
    tracer.emit({
      phaseIndex,
      codeLines: [line],
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`),
      note,
      action: title,
      formula,
      arr: logs.map((log) => log.id),
      sub: logs.map((log) => {
        if (!query) return log.timestamp;
        const key = log.timestamp.slice(0, query.length);
        return query.matches.includes(log.id) ? `${key} · match` : `${key} · outside`;
      }),
      highlight: Number.isInteger(query?.activeIndex) && query.activeIndex >= 0 ? [query.activeIndex] : [],
      mark: query ? logs.map((log, index) => query.matches.includes(log.id) ? index : -1).filter((index) => index >= 0) : [],
      vars: [
        { name: "operation", value: current?.label ?? "—" },
        { name: "granularity", value: query?.granularity ?? "—" },
        { name: "length", value: query?.length ?? "—" },
        { name: "start_key", value: query?.startKey ?? "—" },
        { name: "end_key", value: query?.endKey ?? "—" },
        { name: "result", value: query ? JSON.stringify(query.matches) : "—" },
      ],
      metrics: [
        { label: bi("Log đã lưu", "Stored logs"), value: logs.length, state: "default" },
        { label: bi("Đã quét", "Scanned"), value: query?.scanned ?? 0, state: query ? "active" : "muted" },
        { label: bi("Khớp khoảng", "Range matches"), value: query?.matches.length ?? 0, state: query?.matches.length ? "success" : "muted" },
      ],
      groups: [
        {
          title: bi("Log storage", "Log storage"),
          items: logs.length ? logs.map((log) => ({ label: `id ${log.id}`, value: log.timestamp, state: query?.matches.includes(log.id) ? "success" : log.id === current?.logId ? "active" : "default" })) : [{ label: bi("Chưa có log", "No logs"), value: "—", state: "muted" }],
        },
        {
          title: bi("Khoảng truy vấn đã cắt", "Truncated query range"),
          items: query ? [
            { label: bi("Granularity", "Granularity"), value: `${query.granularity} (${query.length})`, state: "active" },
            { label: bi("Start key", "Start key"), value: query.startKey || "—", state: "candidate" },
            { label: bi("End key", "End key"), value: query.endKey || "—", state: "candidate" },
          ] : [{ label: bi("Chưa có retrieve", "No retrieve yet"), value: "—", state: "muted" }],
        },
      ],
      table: {
        title: bi("Kết quả thao tác", "Operation results"),
        columns: [bi("#", "#"), bi("Thao tác", "Operation"), bi("Kết quả", "Result")],
        rows: history.map((entry, index) => [index + 1, entry.label, Array.isArray(entry.result) ? JSON.stringify(entry.result) : "None"]),
      },
      sequence: logs.map((log) => ({ label: `id ${log.id}`, value: query ? log.timestamp.slice(0, query.length) : log.timestamp, state: query?.matches.includes(log.id) ? "success" : "default" })),
      final,
      answer: final ? outputs.map((value) => Array.isArray(value) ? [...value] : value) : null,
    });
  };

  emit(2, 0, bi("Khai báo độ dài granularity", "Define granularity lengths"), bi("Timestamp cố định độ rộng nên có thể so sánh prefix bằng chuỗi.", "Fixed-width timestamps let us compare prefixes lexicographically."), bi("Year=4, Month=7, ..., Second=19", "Year=4, Month=7, ..., Second=19"));
  emit(6, 0, bi("Tạo log storage", "Create log storage"), bi("Danh sách giữ thứ tự put để output dễ theo dõi.", "The list preserves put order for deterministic output."), bi("logs = []", "logs = []"));

  operations.forEach((operation, operationIndex) => {
    if (operation.name === "put") {
      const [logId, timestamp] = operation.args;
      current = { ...operation, operationIndex, logId };
      query = null;
      emit(8, 1, bi(`Gọi put(${logId})`, `Call put(${logId})`), bi("Lưu nguyên timestamp để mọi granularity dùng lại được.", "Store the full timestamp so every granularity can reuse it."), bi(`id ${logId} → ${timestamp}`, `id ${logId} → ${timestamp}`));
      logs.push({ id: logId, timestamp });
      outputs.push(null);
      history.push({ label: operation.label, result: null });
      emit(9, 1, bi(`Lưu log ${logId}`, `Store log ${logId}`), bi(`Storage hiện có ${logs.length} log.`, `Storage now contains ${logs.length} logs.`), bi(`logs.append((${logId}, timestamp))`, `logs.append((${logId}, timestamp))`));
      return;
    }

    const [start, end, granularity] = operation.args;
    const length = GRANULARITIES[granularity];
    current = { ...operation, operationIndex, logId: null };
    query = { start, end, granularity, length: null, startKey: "", endKey: "", matches: [], scanned: 0, activeIndex: -1 };
    emit(11, 2, bi(`Gọi retrieve theo ${granularity}`, `Retrieve by ${granularity}`), bi("Chỉ prefix tương ứng granularity tham gia so sánh.", "Only the prefix for the requested granularity participates in comparison."), bi(`${granularity} query`, `${granularity} query`));
    query.length = length;
    emit(12, 2, bi(`Độ dài prefix = ${length}`, `Prefix length = ${length}`), bi("Các field nhỏ hơn granularity bị bỏ qua.", "Fields smaller than the granularity are ignored."), bi(`length = LENGTHS[${granularity}] = ${length}`, `length = LENGTHS[${granularity}] = ${length}`));
    query.startKey = start.slice(0, length);
    emit(13, 2, bi(`Cắt start thành ${query.startKey}`, `Truncate start to ${query.startKey}`), bi("Start key là biên inclusive.", "The start key is inclusive."), bi(`start[:${length}]`, `start[:${length}]`));
    query.endKey = end.slice(0, length);
    emit(14, 2, bi(`Cắt end thành ${query.endKey}`, `Truncate end to ${query.endKey}`), bi("End key cũng là biên inclusive.", "The end key is also inclusive."), bi(`end[:${length}]`, `end[:${length}]`));
    query.matches = [];
    emit(15, 2, bi("Tạo result rỗng", "Create an empty result"), bi("Mỗi log khớp sẽ append id đúng một lần.", "Each matching log appends its id exactly once."), bi("result = []", "result = []"));

    logs.forEach((log, logIndex) => {
      query.activeIndex = logIndex;
      query.scanned = logIndex;
      current = { ...current, logId: log.id };
      emit(16, 3, bi(`Xét log ${log.id}`, `Inspect log ${log.id}`), bi("Duyệt storage theo thứ tự put.", "Scan storage in put order."), bi(`log_id = ${log.id}`, `log_id = ${log.id}`));
      const key = log.timestamp.slice(0, length);
      query.scanned = logIndex + 1;
      emit(17, 3, bi(`Key của log = ${key}`, `Log key = ${key}`), bi("Cắt timestamp bằng cùng length với hai biên.", "Truncate the timestamp with the same length as both bounds."), bi(`timestamp[:${length}] = ${key}`, `timestamp[:${length}] = ${key}`));
      const matches = query.startKey <= key && key <= query.endKey;
      emit(18, 3, bi(matches ? `Log ${log.id} nằm trong khoảng` : `Log ${log.id} ngoài khoảng`, matches ? `Log ${log.id} is inside the range` : `Log ${log.id} is outside the range`), bi(`${query.startKey} ≤ ${key} ≤ ${query.endKey} là ${matches}.`, `${query.startKey} ≤ ${key} ≤ ${query.endKey} is ${matches}.`), bi(`start_key <= key <= end_key → ${matches}`, `start_key <= key <= end_key → ${matches}`));
      if (matches) {
        query.matches.push(log.id);
        emit(19, 3, bi(`Thêm id ${log.id}`, `Append id ${log.id}`), bi("ID được giữ theo thứ tự lưu log.", "The id remains in log insertion order."), bi(`result.append(${log.id})`, `result.append(${log.id})`));
      }
    });
    query.activeIndex = -1;
    current = { ...current, logId: null };
    const result = [...query.matches];
    outputs.push(result);
    history.push({ label: operation.label, result });
    emit(20, 2, bi(`Trả về ${JSON.stringify(result)}`, `Return ${JSON.stringify(result)}`), bi("Mọi timestamp khớp prefix inclusive đã được thu thập.", "Every timestamp matching the inclusive prefix range was collected."), bi(`return ${JSON.stringify(result)}`, `return ${JSON.stringify(result)}`));
  });

  current = null;
  query = null;
  emit(20, 4, bi("Hoàn tất mô phỏng", "Simulation complete"), bi(`Kết quả: ${JSON.stringify(outputs)}.`, `Outputs: ${JSON.stringify(outputs)}.`), bi("return outputs", "return outputs"), true);
  return { original: operations.map((operation) => [operation.name, ...operation.args]), operations: operations.map((operation) => ({ name: operation.name, args: [...operation.args] })), answer: outputs, steps: tracer.finish() };
}

module.exports = {
  635: {
    id: 635,
    difficulty: "medium",
    premium: true,
    slug: "design-log-storage-system",
    category: { key: "design", vi: "Thiết kế hệ thống", en: "Design" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }, { key: "sorting", vi: "Sắp xếp", en: "Sorting" }],
    title: bi("Thiết kế hệ thống lưu log", "Design Log Storage System"),
    titleVi: bi("Truy vấn timestamp theo granularity", "Query timestamps by granularity"),
    statement: bi("put lưu log ID và timestamp; retrieve trả các ID nằm trong khoảng inclusive sau khi bỏ qua field nhỏ hơn granularity.", "put stores a log ID and timestamp; retrieve returns IDs in an inclusive range after ignoring fields smaller than the granularity."),
    defaultInput: '[["put",1,"2017:01:01:23:59:59"],["put",2,"2017:01:01:22:59:59"],["put",3,"2016:01:01:00:00:00"],["retrieve","2016:01:01:01:01:01","2017:01:01:23:00:00","Year"],["retrieve","2016:01:01:01:01:01","2017:01:01:23:00:00","Hour"]]',
    inputKind: "string",
    inputLabel: bi("Operations JSON", "Operations JSON"),
    extraParams: [],
    debugMode: "line-by-line",
    approach: [bi("Ánh xạ mỗi granularity sang độ dài prefix cố định.", "Map each granularity to a fixed prefix length."), bi("Cắt start, end và timestamp cùng độ dài rồi so sánh chuỗi inclusive.", "Truncate start, end, and each timestamp to the same length, then compare inclusively."), bi("Quét log theo thứ tự put để kết quả ổn định.", "Scan logs in put order for deterministic output.")],
    complexity: { time: "put O(1), retrieve O(n)", space: "O(n)", note: bi("Mỗi retrieve quét mọi log; timestamp fixed-width cho phép so sánh lexicographic.", "Each retrieve scans all logs; fixed-width timestamps support lexicographic comparison.") },
    code: SOURCE,
    parseOperations,
    builder: buildSteps,
  },
};
