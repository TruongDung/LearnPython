"use strict";

const PROBLEM_ID = 833;
const MAX_STRING_LENGTH = 120;
const MAX_OPERATIONS = 30;

const CODE833 = Object.freeze([
  "class Solution:",
  "    def findReplaceString(self, s: str, indices: list[int], sources: list[str], targets: list[str]) -> str:",
  "        replacements = {}",
  "",
  "        for index, source, target in zip(indices, sources, targets):",
  "            if s.startswith(source, index):",
  "                replacements[index] = (source, target)",
  "",
  "        answer = []",
  "        i = 0",
  "",
  "        while i < len(s):",
  "            if i in replacements:",
  "                source, target = replacements[i]",
  "                answer.append(target)",
  "                i += len(source)",
  "            else:",
  "                answer.append(s[i])",
  "                i += 1",
  "",
  "        return ''.join(answer)",
]);

const bi = (vi, en) => ({ vi, en });

function parseIntegerList833(value, label) {
  let parsed = value;
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) parsed = [];
    else if (text.startsWith("[")) {
      try { parsed = JSON.parse(text); } catch (_error) { throw new TypeError(`#${PROBLEM_ID}: ${label} JSON không hợp lệ.`); }
    } else parsed = text.split(",").map((item) => Number(item.trim()));
  }
  if (!Array.isArray(parsed) || parsed.some((item) => !Number.isSafeInteger(item))) {
    throw new TypeError(`#${PROBLEM_ID}: ${label} phải là danh sách số nguyên.`);
  }
  return parsed;
}

function parseWordList833(value, label) {
  let parsed = value;
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) parsed = [];
    else if (text.startsWith("[")) {
      try { parsed = JSON.parse(text); } catch (_error) { throw new TypeError(`#${PROBLEM_ID}: ${label} JSON không hợp lệ.`); }
    } else parsed = text.split(",").map((item) => item.trim());
  }
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string" || !/^[a-z]+$/.test(item))) {
    throw new TypeError(`#${PROBLEM_ID}: ${label} phải là danh sách chuỗi a-z không rỗng.`);
  }
  return [...parsed];
}

function parseInput833(input, params = {}) {
  const s = String(input ?? "").trim();
  if (!/^[a-z]+$/.test(s) || s.length > MAX_STRING_LENGTH) {
    throw new RangeError(`#${PROBLEM_ID}: s phải gồm 1..${MAX_STRING_LENGTH} chữ cái a-z.`);
  }
  const indices = parseIntegerList833(params.indices ?? "0,2", "indices");
  const sources = parseWordList833(params.sources ?? "a,cd", "sources");
  const targets = parseWordList833(params.targets ?? "eee,ffff", "targets");
  if (indices.length < 1 || indices.length > MAX_OPERATIONS || indices.length !== sources.length || indices.length !== targets.length) {
    throw new RangeError(`#${PROBLEM_ID}: indices, sources, targets phải cùng có 1..${MAX_OPERATIONS} phần tử.`);
  }
  if (new Set(indices).size !== indices.length) throw new RangeError(`#${PROBLEM_ID}: indices phải khác nhau.`);
  indices.forEach((index, operation) => {
    if (index < 0 || index >= s.length) throw new RangeError(`#${PROBLEM_ID}: indices[${operation}] ngoài chuỗi s.`);
  });
  return { s, indices, sources, targets };
}

function buildSteps833(input, params = {}) {
  const config = parseInput833(input, params);
  const { s, indices, sources, targets } = config;
  const operations = indices.map((index, order) => ({
    order,
    index,
    source: sources[order],
    target: targets[order],
    observed: s.slice(index, index + sources[order].length),
    status: "pending",
  }));
  const replacements = new Map();
  const chunks = [];
  const steps = [];
  let cursor = 0;

  const emit = ({ phase, title, note, codeLines, activeOperation = null, activeRange = [], answer = null, final = false }) => {
    const preview = chunks.map((chunk) => chunk.text).join("");
    steps.push({
      title,
      note,
      codeLines,
      final,
      arr: [...s].map((char) => char.charCodeAt(0)),
      sub: [...s],
      highlight: [...activeRange],
      mark: operations.filter((operation) => operation.status === "accepted").flatMap((operation) => Array.from({ length: operation.source.length }, (_, offset) => operation.index + offset)).filter((index) => index < s.length),
      vars: [
        { name: "i", value: cursor },
        { name: "accepted", value: replacements.size },
        { name: "answer", value: JSON.stringify(preview) },
      ],
      findReplace833View: {
        phase,
        ...config,
        operations: operations.map((operation) => ({ ...operation })),
        activeOperation,
        activeRange: [...activeRange],
        cursor,
        chunks: chunks.map((chunk) => ({ ...chunk })),
        preview,
        answer,
      },
    });
  };

  emit({
    phase: "intro",
    title: bi("Mọi index đều neo vào chuỗi gốc", "Every index is anchored to the original string"),
    note: bi("Kiểm tra toàn bộ source trước khi tạo output để replacement trước không làm dịch index của replacement sau.", "Validate every source before building output so an earlier replacement cannot shift a later replacement index."),
    codeLines: [2, 3],
  });

  for (const operation of operations) {
    const range = Array.from({ length: operation.source.length }, (_, offset) => operation.index + offset).filter((index) => index < s.length);
    emit({
      phase: "check",
      activeOperation: operation.order,
      activeRange: range,
      title: bi(`Kiểm tra source "${operation.source}" tại index ${operation.index}`, `Check source "${operation.source}" at index ${operation.index}`),
      note: bi(`Chuỗi gốc tại đây là "${operation.observed}".`, `The original string contains "${operation.observed}" here.`),
      codeLines: [5, 6],
    });
    const matched = s.startsWith(operation.source, operation.index);
    operation.status = matched ? "accepted" : "rejected";
    if (matched) replacements.set(operation.index, operation);
    emit({
      phase: matched ? "accept" : "reject",
      activeOperation: operation.order,
      activeRange: range,
      title: matched
        ? bi(`Khớp: "${operation.source}" → "${operation.target}"`, `Match: "${operation.source}" → "${operation.target}"`)
        : bi(`Không khớp: giữ nguyên tại index ${operation.index}`, `No match: keep the original text at index ${operation.index}`),
      note: matched
        ? bi("Lưu replacement theo index; chưa sửa chuỗi s.", "Store the replacement by index; do not mutate s yet.")
        : bi(`Cần "${operation.source}" nhưng đọc được "${operation.observed}" từ chuỗi gốc.`, `Expected "${operation.source}" but read "${operation.observed}" from the original string.`),
      codeLines: matched ? [6, 7] : [6],
    });
  }

  const accepted = [...replacements.values()].sort((left, right) => left.index - right.index);
  for (let index = 1; index < accepted.length; index++) {
    const previous = accepted[index - 1];
    const current = accepted[index];
    if (previous.index + previous.source.length > current.index) {
      throw new RangeError(`#${PROBLEM_ID}: các replacement khớp không được chồng lấn.`);
    }
  }

  cursor = 0;
  emit({
    phase: "scan-start",
    title: bi("Quét chuỗi gốc từ trái sang phải", "Scan the original string left to right"),
    note: bi(`${replacements.size} replacement hợp lệ đã được cố định theo index gốc.`, `${replacements.size} valid replacements are fixed at original indices.`),
    codeLines: [9, 10, 12],
  });

  while (cursor < s.length) {
    const replacement = replacements.get(cursor);
    if (replacement) {
      const start = cursor;
      chunks.push({ kind: "replace", start, end: start + replacement.source.length, source: replacement.source, text: replacement.target });
      cursor += replacement.source.length;
      emit({
        phase: "replace",
        activeOperation: replacement.order,
        activeRange: Array.from({ length: replacement.source.length }, (_, offset) => start + offset),
        title: bi(`Thêm target "${replacement.target}"`, `Append target "${replacement.target}"`),
        note: bi(`Tiêu thụ source "${replacement.source}" ở [${start}, ${cursor}); cursor nhảy tới ${cursor}.`, `Consume source "${replacement.source}" at [${start}, ${cursor}); advance cursor to ${cursor}.`),
        codeLines: [13, 14, 15, 16],
      });
    } else {
      const start = cursor;
      chunks.push({ kind: "copy", start, end: start + 1, source: s[start], text: s[start] });
      cursor += 1;
      emit({
        phase: "copy",
        activeRange: [start],
        title: bi(`Sao chép ký tự '${s[start]}'`, `Copy character '${s[start]}'`),
        note: bi(`Không có replacement tại index ${start}; giữ ký tự gốc và tăng cursor lên ${cursor}.`, `No replacement starts at index ${start}; keep the original character and advance cursor to ${cursor}.`),
        codeLines: [17, 18, 19],
      });
    }
  }

  const answer = chunks.map((chunk) => chunk.text).join("");
  emit({
    phase: "answer",
    title: bi(`Kết quả: "${answer}"`, `Result: "${answer}"`),
    note: bi("Ghép các chunk đúng một lần; mọi match đã được quyết định trên chuỗi gốc.", "Join the chunks once; every match was decided against the original string."),
    codeLines: [21],
    answer,
    final: true,
  });
  return { original: config, answer, steps };
}

module.exports = {
  833: {
    id: 833,
    difficulty: "medium",
    slug: "find-and-replace-in-string",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
      { key: "hashmap", vi: "Hash Map", en: "Hash Map" },
    ],
    title: bi("Find And Replace in String", "Find And Replace in String"),
    titleVi: bi("Tìm và thay thế đồng thời trong chuỗi", "Perform simultaneous string replacements"),
    statement: bi(
      "Với mỗi indices[i], nếu sources[i] khớp chuỗi gốc tại vị trí đó thì thay bằng targets[i]. Mọi phép thay thế diễn ra đồng thời.",
      "At each indices[i], replace sources[i] with targets[i] only when it matches the original string there. All replacements are simultaneous.",
    ),
    defaultInput: "abcd",
    inputKind: "string",
    inputLabel: bi("s — chuỗi a-z (tối đa 120 ký tự)", "s — lowercase string (up to 120 characters)"),
    extraParams: [
      { key: "indices", type: "string", label: bi("indices (cách nhau bởi dấu phẩy)", "indices (comma separated)"), default: "0,2" },
      { key: "sources", type: "string", label: bi("sources (cách nhau bởi dấu phẩy)", "sources (comma separated)"), default: "a,cd" },
      { key: "targets", type: "string", label: bi("targets (cách nhau bởi dấu phẩy)", "targets (comma separated)"), default: "eee,ffff" },
    ],
    debugMode: "line-by-line",
    approach: [
      bi("Kiểm tra từng source bằng startswith trên chuỗi s gốc; lưu các replacement khớp theo index.", "Check each source with startswith against the original s; store matching replacements by index."),
      bi("Quét s bằng cursor. Nếu replacement bắt đầu tại cursor, thêm target và nhảy qua độ dài source.", "Scan s with a cursor. When a replacement starts there, append its target and skip the source length."),
      bi("Nếu không có replacement, sao chép một ký tự gốc. Cuối cùng join các chunk.", "Otherwise copy one original character. Join all chunks at the end."),
    ],
    complexity: {
      time: "O(n + Σ|source| + output)",
      space: "O(k + output)",
      note: bi("k là số replacement; visualization giới hạn 30 thao tác để giữ trace dễ đọc.", "k is the number of replacements; the visualization caps operations at 30 for a readable trace."),
    },
    code: CODE833,
    liveArgs: (input, params) => {
      const { s, indices, sources, targets } = parseInput833(input, params);
      return [s, indices, sources, targets];
    },
    builder: buildSteps833,
  },
};
