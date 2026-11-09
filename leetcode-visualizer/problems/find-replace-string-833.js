"use strict";

const PROBLEM_ID = 833;
const MAX_STRING_LENGTH = 120;
const MAX_OPERATIONS = 30;
const { runTrace } = require('./wasm-picture-trace');

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
    } else parsed = text.split(",").map((item) => item.trim() ? Number(item.trim()) : NaN);
  }
  if (!Array.isArray(parsed) || !Array.from(parsed).every((item) => Number.isSafeInteger(item))) {
    throw new TypeError(`#${PROBLEM_ID}: ${label} phải là danh sách số nguyên.`);
  }
  return [...parsed];
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
  if (!Array.isArray(parsed) || !Array.from(parsed).every((item) => typeof item === "string" && /^[a-z]{1,50}$/.test(item))) {
    throw new TypeError(`#${PROBLEM_ID}: ${label} phải là danh sách chuỗi a-z, mỗi chuỗi 1..50 ký tự.`);
  }
  return [...parsed];
}

function parseInput833(input, params = {}) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new TypeError('#833: params không hợp lệ.');
  const s = typeof input === 'string' ? input.trim() : '';
  if (!/^[a-z]+$/.test(s) || s.length > MAX_STRING_LENGTH) {
    throw new RangeError(`#${PROBLEM_ID}: s phải gồm 1..${MAX_STRING_LENGTH} chữ cái a-z.`);
  }
  const indices = parseIntegerList833(params.indices === undefined ? "0,2" : params.indices, "indices");
  const sources = parseWordList833(params.sources === undefined ? "a,cd" : params.sources, "sources");
  const targets = parseWordList833(params.targets === undefined ? "eee,ffff" : params.targets, "targets");
  if (indices.length < 1 || indices.length > MAX_OPERATIONS || indices.length !== sources.length || indices.length !== targets.length) {
    throw new RangeError(`#${PROBLEM_ID}: indices, sources, targets phải cùng có 1..${MAX_OPERATIONS} phần tử.`);
  }
  if (new Set(indices).size !== indices.length) throw new RangeError(`#${PROBLEM_ID}: indices phải khác nhau.`);
  indices.forEach((index, operation) => {
    if (index < 0 || index >= s.length) throw new RangeError(`#${PROBLEM_ID}: indices[${operation}] ngoài chuỗi s.`);
  });
  const matched = indices.map((index, order) => ({ index, source: sources[order] }))
    .filter(({ index, source }) => s.startsWith(source, index)).sort((a, b) => a.index - b.index);
  for (let i = 1; i < matched.length; i++) {
    if (matched[i - 1].index + matched[i - 1].source.length > matched[i].index) {
      throw new RangeError(`#${PROBLEM_ID}: các replacement khớp không được chồng lấn.`);
    }
  }
  return { s, indices, sources, targets };
}

function buildSteps833(input, params = {}) {
  const config = parseInput833(input, params), { s, indices, sources, targets } = config;
  const native = runTrace({ code: CODE833.join('\n'), method: 'findReplaceString', args: [s, indices, sources, targets] });
  const operations = indices.map((index, order) => ({ order, index, source: sources[order], target: targets[order],
    observed: s.slice(index, index + sources[order].length), status: 'pending', checkStep: null, acceptStep: null }));
  const chunks = [];
  let activeOperation = null, activeRange = [], comparison = null, segment = null, phase = 'intro';
  const steps = native.events.map((event, step) => {
    const x = event.locals, text = CODE833[event.line - 1].trim(), final = event.returning;
    let change = null;
    if (text === 'for index, source, target in zip(indices, sources, targets):') {
      comparison = null; segment = null;
      if (event.branch) {
        phase = 'check'; activeOperation = indices.indexOf(x.index);
        const op = operations[activeOperation]; op.status = 'checking';
        activeRange = Array.from({ length: op.source.length }, (_, i) => op.index + i).filter(i => i < s.length);
      } else { activeOperation = null; activeRange = []; }
    }
    if (text === 'if s.startswith(source, index):') {
      const op = operations[activeOperation];
      comparison = { order: op.order, matched: event.branch, step };
      op.status = event.branch ? 'matched' : 'rejected'; op.checkStep = step;
      phase = event.branch ? 'check-pass' : 'reject'; change = { kind: 'check', order: op.order, pass: event.branch };
    }
    if (text === 'replacements[index] = (source, target)') {
      const op = operations[activeOperation]; op.status = 'accepted'; op.acceptStep = step;
      phase = 'accept'; change = { kind: 'accept', order: op.order };
    }
    if (text === 'answer = []' || text === 'i = 0') { phase = 'scan-start'; activeOperation = null; activeRange = []; comparison = null; }
    if (text === 'while i < len(s):') {
      phase = 'scan'; segment = null; activeOperation = null; comparison = null;
      activeRange = event.branch ? [x.i] : [];
    }
    if (text === 'if i in replacements:') { phase = 'lookup'; change = { kind: 'lookup', index: x.i, pass: event.branch }; }
    if (text === 'source, target = replacements[i]') {
      phase = 'read'; activeOperation = indices.indexOf(x.i);
      segment = { kind: 'replace', start: x.i, end: x.i + x.source.length, source: x.source, text: x.target, order: activeOperation };
      activeRange = Array.from({ length: x.source.length }, (_, i) => x.i + i);
    }
    if (text === 'answer.append(target)' || text === 'answer.append(s[i])') {
      const replace = text === 'answer.append(target)';
      segment = { kind: replace ? 'replace' : 'copy', start: x.i, end: x.i + (replace ? x.source.length : 1),
        source: replace ? x.source : s[x.i], text: x.answer.at(-1), order: replace ? indices.indexOf(x.i) : null, step };
      chunks.push({ ...segment }); activeRange = Array.from({ length: segment.end - segment.start }, (_, i) => segment.start + i);
      phase = replace ? 'replace' : 'copy'; change = { kind: 'append', chunk: chunks.length - 1, start: x.i, order: segment.order };
    }
    if (text === 'i += len(source)' || text === 'i += 1') {
      phase = 'advance'; change = { kind: 'advance', from: segment.start, to: x.i };
    }
    if (final) phase = 'answer';
    const replacements = x.replacements?.__pairs__ ?? [];
    const view = { phase, ...config, operations: operations.map(op => ({ ...op })), activeOperation,
      activeRange: [...activeRange], cursor: x.i ?? null, comparison: comparison ? { ...comparison } : null,
      segment: segment ? { ...segment } : null, chunks: chunks.map(chunk => ({ ...chunk })),
      preview: (x.answer ?? []).join(''), parts: x.answer ?? null, replacements,
      answer: final ? native.answer : null, change, source: { line: event.line, text, timing: 'after' },
      locals: x, outer: event.outer, frames: event.frames, scope: event.scope, branch: event.branch,
      returning: event.returning, returned: event.returned, trace: native.trace };
    return { arr: [], codeBlock: 1, codeLines: [event.line], final,
      title: bi(`L${event.line} · ${text}`, `L${event.line} · ${text}`), note: bi('', ''),
      vars: Object.entries(x).map(([name, value]) => ({ name, value, rawValue: value })), findReplace833View: view };
  });
  return { original: config, answer: native.answer, steps };
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
      { key: "sources", type: "string", label: bi("sources · mỗi chuỗi 1–50 ký tự, cách nhau bởi dấu phẩy", "sources · 1–50 characters per word, comma separated"), default: "a,cd" },
      { key: "targets", type: "string", label: bi("targets · mỗi chuỗi 1–50 ký tự, cách nhau bởi dấu phẩy", "targets · 1–50 characters per word, comma separated"), default: "eee,ffff" },
    ],
    debugMode: "line-by-line",
    approach: [
      bi("Khớp trên s gốc → lưu replacement → append target hoặc ký tự gốc → join.", "Match original s → store replacements → append a target or original character → join."),
    ],
    complexity: {
      time: "O(n + Σ|source| + output)",
      space: "O(k + output)",
      note: bi("k là số replacement; replay đầy đủ ≤120 ký tự, ≤30 thao tác, mỗi source/target ≤50 ký tự.", "k is the replacement count; complete replay for ≤120 characters, ≤30 operations, each source/target ≤50 characters."),
    },
    visualizationLimits: { maxCharacters: 120, maxOperations: 30, maxWordLength: 50, completeTrace: true },
    code: CODE833,
    liveArgs: (input, params) => {
      const { s, indices, sources, targets } = parseInput833(input, params);
      return [s, indices, sources, targets];
    },
    builder: buildSteps833,
  },
};
