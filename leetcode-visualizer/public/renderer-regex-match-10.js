"use strict";

const REGEX10_PHASES = Object.freeze([
  { line: 3, key: "measure-inputs", en: "Measure", vi: "Đo độ dài" },
  { line: 4, key: "initialize-table", en: "Create DP", vi: "Tạo bảng DP" },
  { line: 5, key: "seed-empty-match", en: "Empty base", vi: "Cơ sở rỗng" },
  { line: 6, key: "scan-empty-pattern", en: "Empty row", vi: "Hàng rỗng" },
  { line: 7, key: "check-empty-star", en: "Check *", vi: "Kiểm tra *" },
  { line: 8, key: "write-empty-zero-copy", en: "Drop x*", vi: "Bỏ x*" },
  { line: 9, key: "scan-source-prefix", en: "Next s prefix", vi: "Tiền tố s mới" },
  { line: 10, key: "scan-pattern-prefix", en: "Next p prefix", vi: "Tiền tố p mới" },
  { line: 11, key: "check-direct-match", en: "Match token", vi: "Khớp token" },
  { line: 12, key: "write-diagonal-match", en: "Copy diagonal", vi: "Chép đường chéo" },
  { line: 13, key: "check-star-token", en: "Star branch", vi: "Nhánh dấu *" },
  { line: 14, key: "write-zero-copy", en: "Zero copies", vi: "Dùng 0 lần" },
  { line: 15, key: "check-star-atom", en: "Match atom", vi: "Khớp atom" },
  { line: 16, key: "write-upward-repeat", en: "Repeat upward", vi: "Lặp từ trên" },
  { line: 17, key: "return-answer", en: "Return", vi: "Trả kết quả" },
]);

const REGEX10_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Regular expression matching visualization",
    phaseRail: "Source-line phases",
    source: "Source s",
    pattern: "Pattern p",
    epsilon: "empty prefix epsilon",
    dimensions: "Dimensions",
    cursor: "Cursor",
    timingBefore: "before write",
    timingAfter: "after line",
    dpTable: "Known dynamic-programming states",
    unknown: "Unknown",
    falseValue: "Computed False",
    trueValue: "Computed True",
    read: "Read",
    write: "Write",
    active: "Active",
    condition: "Condition on this line",
    noCondition: "This source line has no Boolean condition.",
    operands: "Operands",
    recurrence: "Exact action / recurrence",
    reads: "DP reads on this line",
    noReads: "No DP cell is read on this source line.",
    writePanel: "DP write on this line",
    noWrite: "No DP cell is written on this source line.",
    result: "Result",
    pending: "Pending — the full answer is returned on line 17.",
    matches: "MATCH — the complete source matches the complete pattern.",
    noMatch: "NO MATCH — the complete source does not match the complete pattern.",
    prefix: "prefix",
    cell: "cell",
    row: "source-prefix row",
    column: "pattern-prefix column",
    value: "value",
    note: "Why this step matters",
  }),
  vi: Object.freeze({
    region: "Trực quan hóa so khớp biểu thức chính quy",
    phaseRail: "Các pha theo dòng mã nguồn",
    source: "Chuỗi nguồn s",
    pattern: "Mẫu p",
    epsilon: "tiền tố rỗng epsilon",
    dimensions: "Kích thước",
    cursor: "Con trỏ",
    timingBefore: "trước khi ghi",
    timingAfter: "sau dòng lệnh",
    dpTable: "Các trạng thái quy hoạch động đã biết",
    unknown: "Chưa biết",
    falseValue: "Đã tính False",
    trueValue: "Đã tính True",
    read: "Ô đọc",
    write: "Ô ghi",
    active: "Ô hiện tại",
    condition: "Điều kiện tại dòng này",
    noCondition: "Dòng mã nguồn này không có điều kiện Boolean.",
    operands: "Toán hạng",
    recurrence: "Thao tác / công thức chính xác",
    reads: "Các ô DP được đọc tại dòng này",
    noReads: "Dòng mã nguồn này không đọc ô DP nào.",
    writePanel: "Ô DP được ghi tại dòng này",
    noWrite: "Dòng mã nguồn này không ghi ô DP nào.",
    result: "Kết quả",
    pending: "Đang chờ — kết quả đầy đủ được trả về ở dòng 17.",
    matches: "KHỚP — toàn bộ chuỗi nguồn khớp toàn bộ mẫu.",
    noMatch: "KHÔNG KHỚP — toàn bộ chuỗi nguồn không khớp toàn bộ mẫu.",
    prefix: "tiền tố",
    cell: "ô",
    row: "hàng tiền tố chuỗi",
    column: "cột tiền tố mẫu",
    value: "giá trị",
    note: "Ý nghĩa của bước này",
  }),
});

const REGEX10_ROLE_TEXT = Object.freeze({
  "zero-copy": { en: "zero copies / drop x*", vi: "dùng 0 lần / bỏ x*" },
  diagonal: { en: "diagonal prefix", vi: "tiền tố đường chéo" },
  "upward-repeat": { en: "repeat x* upward", vi: "lặp x* từ ô trên" },
  "final-answer": { en: "final answer", vi: "kết quả cuối" },
});

const REGEX10_REASON_TEXT = Object.freeze({
  "empty-matches-empty": { en: "the empty source matches the empty pattern", vi: "chuỗi rỗng khớp mẫu rỗng" },
  "empty-pattern-zero-copy": { en: "drop the final x* from an empty-source match", vi: "bỏ x* cuối khi khớp chuỗi rỗng" },
  "direct-match-diagonal": { en: "one token consumes one source character", vi: "một token tiêu thụ một ký tự nguồn" },
  "star-zero-copy": { en: "use zero copies of the atom before *", vi: "dùng 0 lần atom đứng trước *" },
  "star-upward-repeat": { en: "combine zero copies with one more repeated character", vi: "gộp nhánh 0 lần với một ký tự lặp thêm" },
});

function regex10Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function regex10Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function regex10Localized(value, locale) {
  if (value && typeof value === "object") {
    if (typeof value[locale] === "string") return value[locale];
    if (typeof value.en === "string") return value.en;
    if (typeof value.vi === "string") return value.vi;
  }
  return typeof value === "string" ? value : "";
}

function regex10Integer(value) {
  return Number.isInteger(value) ? value : null;
}

function regex10Normalize(step) {
  const raw = step && step.regexMatch10View && typeof step.regexMatch10View === "object"
    ? step.regexMatch10View
    : {};
  const s = typeof raw.s === "string" ? raw.s : "";
  const p = typeof raw.p === "string" ? raw.p : "";
  const m = Number.isInteger(raw.m) && raw.m >= 0 ? raw.m : s.length;
  const n = Number.isInteger(raw.n) && raw.n >= 0 ? raw.n : p.length;
  const cursorRaw = raw.cursor && typeof raw.cursor === "object" ? raw.cursor : {};
  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};
  const conditionResult = typeof conditionRaw.result === "boolean" ? conditionRaw.result : null;
  const answer = typeof raw.answer === "boolean"
    ? raw.answer
    : (typeof raw.finalAnswer === "boolean" ? raw.finalAnswer : null);
  const reads = Array.isArray(raw.reads)
    ? raw.reads.filter((read) => read && Number.isInteger(read.i) && Number.isInteger(read.j)).map((read) => ({
        i: read.i,
        j: read.j,
        value: Boolean(read.value),
        role: typeof read.role === "string" ? read.role : "read",
      }))
    : [];
  const writeRaw = raw.write && typeof raw.write === "object" ? raw.write : null;
  const write = writeRaw && Number.isInteger(writeRaw.i) && Number.isInteger(writeRaw.j)
    ? {
        i: writeRaw.i,
        j: writeRaw.j,
        before: Boolean(writeRaw.before),
        after: Boolean(writeRaw.after),
        reason: typeof writeRaw.reason === "string" ? writeRaw.reason : "",
      }
    : null;

  return {
    s,
    p,
    m,
    n,
    phase: typeof raw.phase === "string" ? raw.phase : "unknown",
    sourceLine: Number.isInteger(raw.sourceLine) ? raw.sourceLine : null,
    timing: raw.timing === "after" ? "after" : "before",
    dp: Array.isArray(raw.dp) ? raw.dp.map((row) => Array.isArray(row) ? row.map(Boolean) : []) : [],
    known: Array.isArray(raw.known) ? raw.known.map((row) => Array.isArray(row) ? row.map(Boolean) : []) : [],
    cursor: {
      i: regex10Integer(cursorRaw.i),
      j: regex10Integer(cursorRaw.j),
      sIndex: regex10Integer(cursorRaw.sIndex),
      pIndex: regex10Integer(cursorRaw.pIndex),
      atomIndex: regex10Integer(cursorRaw.atomIndex),
    },
    condition: {
      kind: typeof conditionRaw.kind === "string" ? conditionRaw.kind : "none",
      expression: typeof conditionRaw.expression === "string" ? conditionRaw.expression : null,
      result: conditionResult,
      operands: Array.isArray(conditionRaw.operands) ? conditionRaw.operands.map((operand) => ({
        name: operand && typeof operand.name === "string" ? operand.name : "?",
        value: operand && Object.prototype.hasOwnProperty.call(operand, "value") ? operand.value : "",
      })) : [],
    },
    reads,
    write,
    answer,
    note: regex10Localized(step && step.note, regex10Locale()),
  };
}

function regex10PatternGroups(pattern) {
  const groups = [];
  let index = 0;
  while (index < pattern.length) {
    const start = index;
    const hasStar = pattern[index] !== "*" && pattern[index + 1] === "*";
    const end = hasStar ? index + 1 : index;
    groups.push({ start, end, hasStar, malformedStar: pattern[index] === "*" });
    index = end + 1;
  }
  return groups;
}

function regex10RenderStrip(state, kind, copy) {
  const isPattern = kind === "pattern";
  const text = isPattern ? state.p : state.s;
  const label = isPattern ? copy.pattern : copy.source;
  const prefixCursor = isPattern ? state.cursor.j : state.cursor.i;
  const activeIndex = isPattern ? state.cursor.pIndex : state.cursor.sIndex;
  const atomIndex = isPattern ? state.cursor.atomIndex : null;
  const epsilonClass = prefixCursor === 0 ? " is-active" : "";
  const epsilon = `<li class="regex10-strip-item regex10-epsilon${epsilonClass}" role="listitem" aria-label="${regex10Escape(copy.epsilon)}"><span class="regex10-strip-index">0</span><strong>ε</strong></li>`;

  let items = "";
  if (isPattern) {
    items = regex10PatternGroups(text).map((group) => {
      const groupActive = (activeIndex != null && activeIndex >= group.start && activeIndex <= group.end)
        || (atomIndex != null && atomIndex >= group.start && atomIndex <= group.end);
      const classes = [
        "regex10-pattern-atom",
        group.hasStar ? "is-star-group" : "",
        group.malformedStar ? "is-malformed" : "",
        groupActive ? "is-active" : "",
      ].filter(Boolean).join(" ");
      const tokens = [];
      for (let tokenIndex = group.start; tokenIndex <= group.end; tokenIndex++) {
        const tokenClasses = [
          "regex10-token",
          tokenIndex === activeIndex ? "is-cursor" : "",
          tokenIndex === atomIndex ? "is-atom" : "",
        ].filter(Boolean).join(" ");
        tokens.push(`<span class="${tokenClasses}"><small>${tokenIndex + 1}</small><strong>${regex10Escape(text[tokenIndex])}</strong></span>`);
      }
      const atomLabel = text.slice(group.start, group.end + 1);
      return `<li class="${classes}" role="listitem" aria-label="${regex10Escape(`${copy.pattern} ${copy.prefix} ${group.end + 1}: ${atomLabel}`)}">${tokens.join("")}</li>`;
    }).join("");
  } else {
    for (let index = 0; index < text.length; index++) {
      const activeClass = index === activeIndex ? " is-active" : "";
      items += `<li class="regex10-strip-item${activeClass}" role="listitem" aria-label="${regex10Escape(`${copy.source} ${index + 1}: ${text[index]}`)}"><span class="regex10-strip-index">${index + 1}</span><strong>${regex10Escape(text[index])}</strong></li>`;
    }
  }

  return `<section class="regex10-strip-card" aria-label="${regex10Escape(label)}"><header><span>${regex10Escape(label)}</span><code>${isPattern ? "p" : "s"} = &quot;${regex10Escape(text)}&quot;</code></header><ol class="regex10-strip${isPattern ? " regex10-pattern-strip" : ""}" role="list">${epsilon}${items}</ol></section>`;
}

function regex10CellValue(matrix, row, column) {
  return Boolean(Array.isArray(matrix[row]) && matrix[row][column]);
}

function regex10Role(role, locale) {
  const entry = REGEX10_ROLE_TEXT[role];
  return entry ? entry[locale] : role;
}

function regex10RenderTable(state, copy, locale) {
  const rowCount = Math.max(1, state.m + 1, state.dp.length, state.known.length);
  const dpWidth = state.dp.reduce((width, row) => Math.max(width, row.length), 0);
  const knownWidth = state.known.reduce((width, row) => Math.max(width, row.length), 0);
  const columnCount = Math.max(1, state.n + 1, dpWidth, knownWidth);
  const readMap = new Map();
  state.reads.forEach((read) => {
    const key = `${read.i},${read.j}`;
    const roles = readMap.get(key) || [];
    roles.push(read.role);
    readMap.set(key, roles);
  });
  const writeKey = state.write ? `${state.write.i},${state.write.j}` : null;
  const activeKey = Number.isInteger(state.cursor.i) && Number.isInteger(state.cursor.j)
    ? `${state.cursor.i},${state.cursor.j}`
    : null;

  let header = `<tr><th class="regex10-corner" scope="col">dp[i][j]</th>`;
  for (let column = 0; column < columnCount; column++) {
    const token = column === 0 ? "ε" : (state.p[column - 1] || "∅");
    const starStart = column > 0 && state.p[column] === "*";
    const starEnd = column > 0 && state.p[column - 1] === "*";
    const groupClass = starStart ? " is-star-start" : (starEnd ? " is-star-end" : "");
    header += `<th class="regex10-axis-cell${groupClass}" scope="col"><small>j=${column}</small><strong>${regex10Escape(token)}</strong></th>`;
  }
  header += "</tr>";

  let body = "";
  for (let row = 0; row < rowCount; row++) {
    const sourceToken = row === 0 ? "ε" : (state.s[row - 1] || "∅");
    body += `<tr><th class="regex10-axis-cell" scope="row"><small>i=${row}</small><strong>${regex10Escape(sourceToken)}</strong></th>`;
    for (let column = 0; column < columnCount; column++) {
      const key = `${row},${column}`;
      const isKnown = regex10CellValue(state.known, row, column);
      const value = regex10CellValue(state.dp, row, column);
      const roles = readMap.get(key) || [];
      const isRead = roles.length > 0;
      const isWrite = key === writeKey;
      const classes = [
        "regex10-cell",
        isKnown ? (value ? "is-true" : "is-false") : "is-unknown",
        key === activeKey ? "is-active" : "",
        isRead ? "is-read" : "",
        isWrite ? "is-write" : "",
      ].filter(Boolean).join(" ");
      const stateText = isKnown ? (value ? copy.trueValue : copy.falseValue) : copy.unknown;
      const actionText = [key === activeKey ? copy.active : "", isRead ? copy.read : "", isWrite ? copy.write : ""].filter(Boolean).join(", ");
      const aria = `${copy.cell} dp[${row}][${column}], ${copy.row} ${row}, ${copy.column} ${column}, ${stateText}${actionText ? `, ${actionText}` : ""}`;
      const roleBadges = roles.map((role) => `<small class="regex10-read-role">${regex10Escape(regex10Role(role, locale))}</small>`).join("");
      body += `<td class="${classes}" aria-label="${regex10Escape(aria)}"><strong>${isKnown ? (value ? "T" : "F") : "?"}</strong>${roleBadges}</td>`;
    }
    body += "</tr>";
  }

  return `<section class="regex10-table-card"><header class="regex10-section-heading"><h3>${regex10Escape(copy.dpTable)}</h3><div class="regex10-legend" aria-label="Legend"><span class="regex10-legend-unknown">?</span>${regex10Escape(copy.unknown)}<span class="regex10-legend-false">F</span>${regex10Escape(copy.falseValue)}<span class="regex10-legend-true">T</span>${regex10Escape(copy.trueValue)}<span class="regex10-legend-read">↗</span>${regex10Escape(copy.read)}<span class="regex10-legend-write">✎</span>${regex10Escape(copy.write)}</div></header><div class="regex10-table-scroll" role="region" tabindex="0" aria-label="${regex10Escape(copy.dpTable)}"><table class="regex10-table"><thead>${header}</thead><tbody>${body}</tbody></table></div></section>`;
}

function regex10Equation(state) {
  const i = state.cursor.i;
  const j = state.cursor.j;
  const bool = (value) => value ? "True" : "False";
  switch (state.sourceLine) {
    case 3:
      return `m = len(s) = ${state.m}; n = len(p) = ${state.n}`;
    case 4:
      return `dp = [[False] × ${state.n + 1}] × ${state.m + 1}`;
    case 5:
      return "dp[0][0] ← True";
    case 6:
      return `j ← ${j}; inspect p[:${j}]`;
    case 7:
      return `p[${j - 1}] == '*'`;
    case 8:
      return `dp[0][${j}] ← dp[0][${j - 2}] = ${bool(state.write && state.write.after)}`;
    case 9:
      return `i ← ${i}; compute row for s[:${i}]`;
    case 10:
      return `j ← ${j}; compute dp[${i}][${j}]`;
    case 11:
      return `p[${j - 1}] == '.' OR p[${j - 1}] == s[${i - 1}]`;
    case 12:
      return `dp[${i}][${j}] ← dp[${i - 1}][${j - 1}] = ${bool(state.write && state.write.after)}`;
    case 13:
      return `p[${j - 1}] == '*'`;
    case 14:
      return `dp[${i}][${j}] ← dp[${i}][${j - 2}] = ${bool(state.write && state.write.after)}`;
    case 15:
      return `p[${j - 2}] == '.' OR p[${j - 2}] == s[${i - 1}]`;
    case 16: {
      const zero = state.reads.find((read) => read.role === "zero-copy");
      const upward = state.reads.find((read) => read.role === "upward-repeat");
      return `dp[${i}][${j}] ← ${bool(zero && zero.value)} OR ${bool(upward && upward.value)} = ${bool(state.write && state.write.after)}`;
    }
    case 17:
      return `return dp[${state.m}][${state.n}] = ${bool(state.answer)}`;
    default:
      return "—";
  }
}

function regex10RenderCondition(state, copy) {
  if (state.condition.kind === "none" || !state.condition.expression) {
    return `<p class="regex10-empty-detail">${regex10Escape(copy.noCondition)}</p>`;
  }
  const resultClass = state.condition.result === true ? " is-true" : (state.condition.result === false ? " is-false" : " is-unknown");
  const resultText = state.condition.result === null ? "?" : (state.condition.result ? "TRUE" : "FALSE");
  const operands = state.condition.operands.map((operand) => `<span><code>${regex10Escape(operand.name)}</code><b>${regex10Escape(String(operand.value))}</b></span>`).join("");
  return `<div class="regex10-condition-line"><code>${regex10Escape(state.condition.expression)}</code><strong class="regex10-condition-result${resultClass}">${resultText}</strong></div>${operands ? `<div class="regex10-operands"><em>${regex10Escape(copy.operands)}</em>${operands}</div>` : ""}`;
}

function regex10RenderReads(state, copy, locale) {
  if (!state.reads.length) return `<p class="regex10-empty-detail">${regex10Escape(copy.noReads)}</p>`;
  return `<ul class="regex10-read-list">${state.reads.map((read) => `<li><code>dp[${read.i}][${read.j}]</code><strong>${read.value ? "True" : "False"}</strong><span>${regex10Escape(regex10Role(read.role, locale))}</span></li>`).join("")}</ul>`;
}

function regex10RenderWrite(state, copy, locale) {
  if (!state.write) return `<p class="regex10-empty-detail">${regex10Escape(copy.noWrite)}</p>`;
  const reasonEntry = REGEX10_REASON_TEXT[state.write.reason];
  const reason = reasonEntry ? reasonEntry[locale] : state.write.reason;
  return `<div class="regex10-write-detail"><code>dp[${state.write.i}][${state.write.j}]</code><span>${state.write.before ? "True" : "False"}</span><b aria-hidden="true">→</b><strong>${state.write.after ? "True" : "False"}</strong><small>${regex10Escape(reason)}</small></div>`;
}

function regex10RenderPhaseRail(state, copy, locale) {
  const currentIndex = REGEX10_PHASES.findIndex((phase) => phase.key === state.phase && phase.line === state.sourceLine);
  return `<ol class="regex10-phase-rail" role="list" aria-label="${regex10Escape(copy.phaseRail)}">${REGEX10_PHASES.map((phase, index) => {
    const classes = [
      "regex10-phase",
      index === currentIndex ? "is-current" : "",
      currentIndex >= 0 && index < currentIndex ? "is-earlier" : "",
    ].filter(Boolean).join(" ");
    return `<li class="${classes}" role="listitem"${index === currentIndex ? " aria-current=\"step\"" : ""}><small>${phase.line}</small><span>${regex10Escape(phase[locale])}</span></li>`;
  }).join("")}</ol>`;
}

function renderRegexMatch10View(step) {
  const host = typeof document !== "undefined" ? document.getElementById("treeView") : null;
  if (!host) return;

  const locale = regex10Locale();
  const copy = REGEX10_TEXT[locale];
  const state = regex10Normalize(step);
  const phase = REGEX10_PHASES.find((item) => item.key === state.phase && item.line === state.sourceLine);
  const phaseLabel = phase ? phase[locale] : state.phase;
  const timingLabel = state.timing === "after" ? copy.timingAfter : copy.timingBefore;
  const cursor = `i=${state.cursor.i == null ? "—" : state.cursor.i}, j=${state.cursor.j == null ? "—" : state.cursor.j}, sIndex=${state.cursor.sIndex == null ? "—" : state.cursor.sIndex}, pIndex=${state.cursor.pIndex == null ? "—" : state.cursor.pIndex}, atomIndex=${state.cursor.atomIndex == null ? "—" : state.cursor.atomIndex}`;
  const resultClass = state.answer === true ? " is-match" : (state.answer === false ? " is-no-match" : " is-pending");
  const resultText = state.answer === null ? copy.pending : (state.answer ? copy.matches : copy.noMatch);
  const note = state.note ? `<aside class="regex10-note"><strong>${regex10Escape(copy.note)}</strong><p>${regex10Escape(state.note)}</p></aside>` : "";

  host.innerHTML = `<article class="regex10-viz" role="region" aria-label="${regex10Escape(copy.region)}">
    <header class="regex10-debug-header">
      <div><span class="regex10-kicker">LeetCode 10 · DP</span><h2>${regex10Escape(phaseLabel || "Regular Expression Matching")}</h2></div>
      <div class="regex10-line-badges"><strong>LINE ${state.sourceLine == null ? "—" : state.sourceLine}</strong><span class="is-${state.timing}">${regex10Escape(timingLabel)}</span></div>
    </header>
    ${regex10RenderPhaseRail(state, copy, locale)}
    <div class="regex10-strips">${regex10RenderStrip(state, "source", copy)}${regex10RenderStrip(state, "pattern", copy)}</div>
    <div class="regex10-stat-row"><span><small>${regex10Escape(copy.dimensions)}</small><b>(${state.m + 1}) × (${state.n + 1})</b></span><span><small>${regex10Escape(copy.cursor)}</small><code>${regex10Escape(cursor)}</code></span></div>
    ${regex10RenderTable(state, copy, locale)}
    <div class="regex10-details">
      <section class="regex10-detail-card"><h3>${regex10Escape(copy.condition)}</h3>${regex10RenderCondition(state, copy)}</section>
      <section class="regex10-detail-card regex10-equation-card"><h3>${regex10Escape(copy.recurrence)}</h3><code>${regex10Escape(regex10Equation(state))}</code></section>
      <section class="regex10-detail-card"><h3>${regex10Escape(copy.reads)}</h3>${regex10RenderReads(state, copy, locale)}</section>
      <section class="regex10-detail-card"><h3>${regex10Escape(copy.writePanel)}</h3>${regex10RenderWrite(state, copy, locale)}</section>
    </div>
    ${note}
    <section class="regex10-result${resultClass}" role="status" aria-live="polite"><small>${regex10Escape(copy.result)}</small><strong>${regex10Escape(resultText)}</strong>${state.answer !== null ? `<code>dp[${state.m}][${state.n}] = ${state.answer ? "True" : "False"}</code>` : ""}</section>
  </article>`;
}
