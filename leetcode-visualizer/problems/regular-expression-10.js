"use strict";

const base = require("./dp")[10];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
// Keep the lesson's Python unchanged. Every snapshot is a completed statement
// from this exact source, including exhausted loops and unchanged assignments.
const CODE = Object.freeze([...base.code]);

function parse(input, params = {}) {
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    throw new RangeError("#10: params phải là object / params must be an object.");
  }
  if (typeof input !== "string" || !/^[a-z]{0,20}$/.test(input)) {
    throw new RangeError("#10: s gồm 0–20 chữ a-z / s must contain 0–20 lowercase letters.");
  }
  const pattern = params.p === undefined ? "c*a*b" : params.p;
  if (typeof pattern !== "string" || pattern.length > 20 || !/^(?:[a-z.]\*?)*$/.test(pattern)) {
    throw new RangeError("#10: p dài tối đa 20, chỉ gồm a-z, . và x* / p: at most 20 characters; use a-z, . or x*.");
  }
  return [input, pattern];
}

// A witness is presentation data, reconstructed only from the final true DP
// cells. It is never inserted into Python locals or shown as a partial answer.
function witness(s, p, dp) {
  let i = s.length, j = p.length;
  const groups = [];
  while (j > 0) {
    const end = j, to = i;
    if (p[j - 1] === "*") {
      while (!dp[i][j - 2]) i--;
      j -= 2;
    } else {
      i--; j--;
    }
    groups.push({ pattern: p.slice(j, end), text: s.slice(i, to), from: i, to, start: j, end });
  }
  return groups.reverse();
}

const PHASES = {
  3: bi("Đo độ dài", "Measure lengths"),
  4: bi("Tạo bảng False", "Create a False table"),
  5: bi("Rỗng khớp rỗng", "Empty matches empty"),
  6: bi("Duyệt hàng rỗng", "Scan the empty row"),
  7: bi("Có dấu *?", "Is it a star?"),
  8: bi("Bỏ x* · 0 lần", "Skip x* · zero copies"),
  9: bi("Duyệt chuỗi s", "Scan the string"),
  10: bi("Duyệt mẫu p", "Scan the pattern"),
  11: bi("Khớp một ký tự?", "Match one character?"),
  12: bi("Chép ô chéo ↘", "Copy the diagonal ↘"),
  13: bi("Thử nhánh *", "Try the star branch"),
  14: bi("Bỏ x* · 0 lần", "Skip x* · zero copies"),
  15: bi("x* ăn thêm được?", "Can x* consume more?"),
  16: bi("Giữ 0 lần hoặc lặp ↓", "Keep zero or repeat ↓"),
  17: bi("Khớp toàn bộ?", "Full match?"),
};

function builder(input, params = {}) {
  const [s, p] = parse(input, params), m = s.length, n = p.length;
  // The bounded 20 × 20 input permits a complete replay, with no dropped lines.
  const trace = runTrace({ code: CODE.join("\n"), method: "isMatch", args: [s, p] });
  let previous = null;
  const steps = trace.events.map(record => {
    const { line, locals: x } = record, dp = x.dp ?? null;
    let i = null, j = null;
    if (line === 5) { i = 0; j = 0; }
    if (line >= 6 && line <= 8 && (line !== 6 || record.branch)) { i = 0; j = x.j ?? null; }
    if (line === 9 && record.branch) { i = x.i; j = 0; }
    if (line >= 10 && line <= 16 && (line !== 10 || record.branch)) { i = x.i; j = x.j; }
    if (line === 17) { i = m; j = n; }
    const valid = Number.isInteger(i) && Number.isInteger(j);
    const reads = [];
    const add = (r, c, role, matrix = dp) => {
      reads.push({ i: r, j: c, role, value: matrix[r][c] });
    };
    let write = null;
    if (valid && [5, 8, 12, 14, 16].includes(line)) {
      write = { i, j, before: previous[i][j], after: dp[i][j] };
    }
    if (line === 8 || line === 14) add(i, j - 2, "skip");
    if (line === 12) add(i - 1, j - 1, "diagonal");
    let shortCircuit = false;
    if (line === 16) {
      add(i, j, "keep", previous);
      // Python's `or` does not read the second operand if the first is true.
      shortCircuit = previous[i][j];
      if (!shortCircuit) add(i - 1, j, "repeat");
    }
    if (line === 17) add(m, n, "answer");
    const final = record.returning;
    const condition = typeof record.branch === "boolean" ? record.branch : null;
    const exhausted = [6, 9, 10].includes(line) && condition === false;
    const phase = exhausted ? bi("Hết vòng lặp ↩", "Loop exhausted ↩") : PHASES[line];
    const view = {
      s, p, m, n, dp, cursor: { i, j }, reads, write, shortCircuit,
      source: { line, text: CODE[line - 1].trim(), timing: "after" },
      phase, condition, exhausted,
      locals: x, outer: record.outer, frames: record.frames, scope: record.scope,
      branch: record.branch, returned: record.returned, returning: record.returning,
      answer: final ? trace.answer : null,
      witness: final && trace.answer ? witness(s, p, dp) : null,
      trace: trace.trace,
    };
    previous = dp;
    return {
      arr: [], highlight: [], mark: [], codeBlock: 1, codeLines: [line], final,
      title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: ["m", "n", "i", "j"].map(name => ({ name, value: x[name] ?? "—" })),
      regexMatch10View: view,
    };
  });
  return { original: s, answer: trace.answer, steps };
}

module.exports = {
  10: {
    ...base,
    titleVi: bi("So khớp biểu thức chính quy", "Regular expression matching"),
    statement: bi("Khớp toàn bộ s với p. Dấu . khớp 1 ký tự; x* khớp 0 hoặc nhiều x.",
      "Match all of s with p. A dot matches one character; x* matches zero or more x characters."),
    inputLabel: bi("s · 0–20 chữ a-z (có thể rỗng)", "s · 0–20 lowercase letters (empty allowed)"),
    extraParams: [{ key: "p", type: "string", allowEmpty: true, label: bi("p · a-z, . và *", "p · a-z, . and *"), default: "c*a*b" }],
    allowEmptyInput: true,
    debugMode: "line-by-line",
    codeLabel: bi("DP · chạy từng dòng Python", "DP · Python line by line"),
    approach: [bi("dp[i][j]: s[:i] ↔ p[:j]. ↘ khớp 1 ký tự · → bỏ x* · ↓ lặp x*.",
      "dp[i][j]: s[:i] ↔ p[:j]. ↘ match one · → skip x* · ↓ repeat x*.")],
    complexity: { time: "O(mn)", space: "O(mn)", note: bi("m = len(s), n = len(p).", "m = len(s), n = len(p).") },
    visualizationLimits: { maxStringLength: 20, maxPatternLength: 20, completeTrace: true },
    code: CODE, builder, liveArgs: parse,
  },
};
