"use strict";

const WILDCARD44_PHASES = Object.freeze([
  { line: 3, key: "measure-inputs", en: "Measure inputs", vi: "Đo đầu vào" },
  { line: 4, key: "allocate-table", en: "Allocate DP", vi: "Tạo bảng DP" },
  { line: 5, key: "write-empty-base", en: "Empty base", vi: "Cơ sở rỗng" },
  { line: 6, key: "scan-empty-prefix", en: "Empty prefix", vi: "Tiền tố rỗng" },
  { line: 7, key: "check-leading-star", en: "Leading *?", vi: "Dấu * đầu?" },
  { line: 8, key: "write-leading-star", en: "Copy left", vi: "Chép ô trái" },
  { line: 10, key: "stop-empty-prefix", en: "Resolve suffix", vi: "Chốt hậu tố" },
  { line: 11, key: "start-source-row", en: "Start row", vi: "Bắt đầu hàng" },
  { line: 12, key: "scan-cell", en: "Visit cell", vi: "Xét ô" },
  { line: 13, key: "check-single-token", en: "Literal / ?", vi: "Ký tự / ?" },
  { line: 14, key: "write-diagonal", en: "Copy diagonal", vi: "Chép đường chéo" },
  { line: 15, key: "check-star", en: "Star branch", vi: "Nhánh dấu *" },
  { line: 16, key: "write-star-recurrence", en: "Empty OR consume", vi: "Rỗng HOẶC ăn" },
  { line: 18, key: "write-literal-mismatch", en: "Write mismatch", vi: "Ghi không khớp" },
  { line: 19, key: "return-answer", en: "Return answer", vi: "Trả kết quả" },
]);

const WILDCARD44_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Wildcard matching dynamic-programming visualization",
    phaseRail: "Source-line phases",
    source: "Source s",
    pattern: "Pattern p",
    epsilon: "empty prefix epsilon",
    dimensions: "Table dimensions",
    cursor: "Cursor",
    token: "Current token",
    tokenNone: "none",
    literal: "literal",
    question: "question wildcard",
    star: "star wildcard",
    timingBefore: "before line effect",
    timingAfter: "after line effect",
    table: "Tri-state DP table",
    unknown: "Unknown / not resolved",
    falseValue: "Known False",
    trueValue: "Known True",
    active: "Active",
    read: "Read",
    write: "Write",
    resolved: "Resolved by invariant",
    condition: "Condition and sub-branches",
    noCondition: "This source line has no Boolean condition.",
    operands: "Operands",
    recurrence: "Exact action / recurrence",
    questionComparison: "How ? compares",
    questionRule: "? consumes exactly one source character.",
    questionInactive: "The current token is not ?.",
    starChoices: "The two independent * choices",
    emptyBranch: "Match an empty sequence",
    emptyDetail: "Keep the source prefix; drop this * token.",
    consumeBranch: "Consume one source character",
    consumeDetail: "Keep * available; move to the source prefix above.",
    orResult: "OR result",
    unavailable: "not read on this line",
    reads: "Exact DP reads",
    noReads: "No DP cell is read on this source line.",
    knownRead: "known",
    unknownRead: "unknown",
    writePanel: "Exact DP write",
    noWrite: "No DP cell is written on this source line.",
    before: "before",
    after: "after",
    resolutions: "Invariant resolutions (not writes)",
    noResolutions: "No cell is resolved by an invariant on this line.",
    result: "Final result",
    pending: "Pending — line 19 returns the full-table state.",
    matches: "MATCH — the complete source matches the complete wildcard pattern.",
    noMatch: "NO MATCH — the complete source does not match the complete wildcard pattern.",
    note: "Why this step matters",
    row: "source-prefix row",
    column: "pattern-prefix column",
    cell: "cell",
  }),
  vi: Object.freeze({
    region: "Trực quan hóa quy hoạch động cho so khớp wildcard",
    phaseRail: "Các pha theo dòng mã nguồn",
    source: "Chuỗi nguồn s",
    pattern: "Mẫu p",
    epsilon: "tiền tố rỗng epsilon",
    dimensions: "Kích thước bảng",
    cursor: "Con trỏ",
    token: "Token hiện tại",
    tokenNone: "không có",
    literal: "ký tự thường",
    question: "wildcard dấu hỏi",
    star: "wildcard dấu sao",
    timingBefore: "trước tác động của dòng",
    timingAfter: "sau tác động của dòng",
    table: "Bảng DP ba trạng thái",
    unknown: "Chưa biết / chưa được chốt",
    falseValue: "Đã biết False",
    trueValue: "Đã biết True",
    active: "Ô hiện tại",
    read: "Ô đọc",
    write: "Ô ghi",
    resolved: "Chốt bằng bất biến",
    condition: "Điều kiện và các nhánh con",
    noCondition: "Dòng mã nguồn này không có điều kiện Boolean.",
    operands: "Toán hạng",
    recurrence: "Thao tác / công thức chính xác",
    questionComparison: "Cách ? so khớp",
    questionRule: "? tiêu thụ đúng một ký tự nguồn.",
    questionInactive: "Token hiện tại không phải dấu ?.",
    starChoices: "Hai lựa chọn độc lập của *",
    emptyBranch: "Khớp chuỗi rỗng",
    emptyDetail: "Giữ nguyên tiền tố nguồn; bỏ token * này.",
    consumeBranch: "Ăn một ký tự nguồn",
    consumeDetail: "Giữ * để dùng tiếp; lùi lên tiền tố nguồn phía trên.",
    orResult: "Kết quả HOẶC",
    unavailable: "không đọc ở dòng này",
    reads: "Các ô DP được đọc chính xác",
    noReads: "Dòng mã nguồn này không đọc ô DP nào.",
    knownRead: "đã biết",
    unknownRead: "chưa biết",
    writePanel: "Phép ghi DP chính xác",
    noWrite: "Dòng mã nguồn này không ghi ô DP nào.",
    before: "trước",
    after: "sau",
    resolutions: "Các ô chốt bằng bất biến (không phải phép ghi)",
    noResolutions: "Dòng này không chốt ô nào bằng bất biến.",
    result: "Kết quả cuối",
    pending: "Đang chờ — dòng 19 sẽ trả trạng thái toàn bảng.",
    matches: "KHỚP — toàn bộ chuỗi nguồn khớp toàn bộ mẫu wildcard.",
    noMatch: "KHÔNG KHỚP — toàn bộ chuỗi nguồn không khớp toàn bộ mẫu wildcard.",
    note: "Ý nghĩa của bước này",
    row: "hàng tiền tố nguồn",
    column: "cột tiền tố mẫu",
    cell: "ô",
  }),
});

const WILDCARD44_ROLE_TEXT = Object.freeze({
  left: { en: "left empty-prefix state", vi: "trạng thái tiền tố rỗng bên trái" },
  diagonal: { en: "diagonal one-character state", vi: "trạng thái một ký tự ở đường chéo" },
  empty: { en: "* matches empty (left)", vi: "* khớp rỗng (bên trái)" },
  consume: { en: "* consumes one character (above)", vi: "* ăn một ký tự (phía trên)" },
  final: { en: "full-string answer", vi: "kết quả toàn chuỗi" },
});

const WILDCARD44_REASON_TEXT = Object.freeze({
  "empty-matches-empty": {
    en: "the empty source matches the empty pattern",
    vi: "chuỗi nguồn rỗng khớp mẫu rỗng",
  },
  "leading-star-copies-left": {
    en: "a leading * matches empty, so copy the left prefix state",
    vi: "dấu * đầu khớp rỗng nên chép trạng thái tiền tố bên trái",
  },
  "single-token-copies-diagonal": {
    en: "a literal or ? consumes exactly one source character",
    vi: "ký tự thường hoặc ? tiêu thụ đúng một ký tự nguồn",
  },
  "star-empty-or-consume": {
    en: "combine the independent empty and consume branches with OR",
    vi: "gộp hai nhánh độc lập khớp rỗng và ăn ký tự bằng HOẶC",
  },
  "literal-mismatch": {
    en: "the literal differs and neither wildcard rule applies",
    vi: "ký tự thường khác nhau và không có quy tắc wildcard nào áp dụng",
  },
});

const WILDCARD44_RESOLUTION_TEXT = Object.freeze({
  "non-star-empty-prefix-and-suffix": {
    en: "after the first non-* token, this and every longer pattern prefix cannot match empty",
    vi: "sau token đầu tiên không phải *, tiền tố này và mọi tiền tố dài hơn không thể khớp chuỗi rỗng",
  },
  "nonempty-source-cannot-match-empty-pattern": {
    en: "a nonempty source prefix cannot match an empty pattern",
    vi: "tiền tố nguồn không rỗng không thể khớp mẫu rỗng",
  },
});

function wildcard44Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wildcard44Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function wildcard44Localized(value, locale) {
  if (value && typeof value === "object") {
    if (typeof value[locale] === "string") return value[locale];
    if (typeof value.en === "string") return value.en;
    if (typeof value.vi === "string") return value.vi;
  }
  return typeof value === "string" ? value : "";
}

function wildcard44Integer(value) {
  return Number.isInteger(value) ? value : null;
}

function wildcard44Dimension(value, fallback) {
  const candidate = Number.isInteger(value) && value >= 0 ? value : fallback;
  return Math.min(Math.max(0, candidate), 200);
}

function wildcard44Matrix(value) {
  return Array.isArray(value)
    ? value.slice(0, 201).map((row) => Array.isArray(row)
      ? row.slice(0, 201).map((cell) => cell === true)
      : [])
    : [];
}

function wildcard44Operand(operand) {
  return {
    name: operand && typeof operand.name === "string" ? operand.name : "?",
    value: operand && Object.prototype.hasOwnProperty.call(operand, "value") ? operand.value : null,
  };
}

function wildcard44Branch(branch) {
  return {
    kind: branch && typeof branch.kind === "string" ? branch.kind : "unknown",
    expression: branch && typeof branch.expression === "string" ? branch.expression : "",
    result: branch && typeof branch.result === "boolean" ? branch.result : null,
    operands: branch && Array.isArray(branch.operands) ? branch.operands.map(wildcard44Operand) : [],
  };
}

function wildcard44TokenKind(value) {
  if (value === "?") return "question";
  if (value === "*") return "star";
  return value == null || value === "" ? "none" : "literal";
}

function wildcard44Normalize(step) {
  const raw = step && step.wildcardMatch44View && typeof step.wildcardMatch44View === "object"
    ? step.wildcardMatch44View
    : {};
  const s = typeof raw.s === "string" ? raw.s : "";
  const p = typeof raw.p === "string" ? raw.p : "";
  const m = wildcard44Dimension(raw.m, Math.min(s.length, 200));
  const n = wildcard44Dimension(raw.n, Math.min(p.length, 200));
  const cursorRaw = raw.cursor && typeof raw.cursor === "object" ? raw.cursor : {};
  const cursor = {
    i: wildcard44Integer(cursorRaw.i),
    j: wildcard44Integer(cursorRaw.j),
    sIndex: wildcard44Integer(cursorRaw.sIndex),
    pIndex: wildcard44Integer(cursorRaw.pIndex),
  };
  const currentTokenRaw = raw.currentToken && typeof raw.currentToken === "object"
    ? raw.currentToken
    : {};
  const fallbackToken = cursor.pIndex != null && cursor.pIndex >= 0 && cursor.pIndex < p.length
    ? p[cursor.pIndex]
    : null;
  const tokenValue = typeof currentTokenRaw.value === "string" ? currentTokenRaw.value : fallbackToken;
  const validKinds = new Set(["literal", "question", "star", "none"]);
  const tokenKind = validKinds.has(currentTokenRaw.kind)
    ? currentTokenRaw.kind
    : wildcard44TokenKind(tokenValue);
  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};
  const reads = Array.isArray(raw.reads)
    ? raw.reads.filter((read) => read && Number.isInteger(read.i) && Number.isInteger(read.j)).map((read) => ({
        i: read.i,
        j: read.j,
        role: typeof read.role === "string" ? read.role : "read",
        known: read.known === true,
        value: read.value === true,
      }))
    : [];
  const writeRaw = raw.write && typeof raw.write === "object" ? raw.write : null;
  const write = writeRaw && Number.isInteger(writeRaw.i) && Number.isInteger(writeRaw.j)
    ? {
        i: writeRaw.i,
        j: writeRaw.j,
        beforeKnown: writeRaw.beforeKnown === true,
        beforeValue: writeRaw.beforeValue === true,
        afterValue: writeRaw.afterValue === true,
        reason: typeof writeRaw.reason === "string" ? writeRaw.reason : "",
      }
    : null;
  const invariantResolutions = Array.isArray(raw.invariantResolutions)
    ? raw.invariantResolutions
      .filter((item) => item && Number.isInteger(item.i) && Number.isInteger(item.j))
      .map((item) => ({
        i: item.i,
        j: item.j,
        beforeKnown: item.beforeKnown === true,
        beforeValue: item.beforeValue === true,
        value: item.value === true,
        reason: typeof item.reason === "string" ? item.reason : "",
      }))
    : [];
  const sourceLine = Number.isInteger(raw.sourceLine)
    ? raw.sourceLine
    : (step && Array.isArray(step.codeLines) && Number.isInteger(step.codeLines[0]) ? step.codeLines[0] : null);
  const answer = typeof raw.answer === "boolean"
    ? raw.answer
    : (typeof raw.finalAnswer === "boolean" ? raw.finalAnswer : null);

  return {
    approach: raw.approach === "table" ? "table" : "table",
    phase: typeof raw.phase === "string" ? raw.phase : "unknown",
    sourceLine,
    timing: raw.timing === "after" ? "after" : "before",
    s,
    p,
    m,
    n,
    dp: wildcard44Matrix(raw.dp),
    known: wildcard44Matrix(raw.known),
    cursor,
    currentToken: {
      index: wildcard44Integer(currentTokenRaw.index),
      value: tokenKind === "none" ? null : tokenValue,
      kind: tokenKind,
    },
    condition: {
      kind: typeof conditionRaw.kind === "string" ? conditionRaw.kind : "none",
      expression: typeof conditionRaw.expression === "string" ? conditionRaw.expression : null,
      result: typeof conditionRaw.result === "boolean" ? conditionRaw.result : null,
      operands: Array.isArray(conditionRaw.operands) ? conditionRaw.operands.map(wildcard44Operand) : [],
      branches: Array.isArray(conditionRaw.branches) ? conditionRaw.branches.map(wildcard44Branch) : [],
    },
    reads,
    write,
    invariantResolutions,
    answer,
    finalAnswer: typeof raw.finalAnswer === "boolean" ? raw.finalAnswer : answer,
    note: wildcard44Localized(step && step.note, wildcard44Locale()),
  };
}

function wildcard44Boolean(value) {
  return value ? "True" : "False";
}

function wildcard44StatusClass(value) {
  return value === true ? "is-true" : (value === false ? "is-false" : "is-pending");
}

function wildcard44Role(role, locale) {
  const item = WILDCARD44_ROLE_TEXT[role];
  return item ? item[locale] : role;
}

function wildcard44Reason(reason, locale, table) {
  const item = table[reason];
  return item ? item[locale] : reason;
}

function wildcard44RenderStrip(state, kind, copy) {
  const isPattern = kind === "pattern";
  const text = isPattern ? state.p : state.s;
  const label = isPattern ? copy.pattern : copy.source;
  const activeIndex = isPattern ? state.currentToken.index : state.cursor.sIndex;
  const prefix = isPattern ? state.cursor.j : state.cursor.i;
  const epsilonClass = prefix === 0 ? " is-active" : "";
  let items = `<li class="wildcard44-token wildcard44-epsilon${epsilonClass}" role="listitem" aria-label="${wildcard44Escape(copy.epsilon)}"><small>0</small><strong>ε</strong></li>`;

  for (let index = 0; index < text.length; index++) {
    const token = text[index];
    const tokenKind = isPattern ? wildcard44TokenKind(token) : "literal";
    const classes = [
      "wildcard44-token",
      `is-${tokenKind}`,
      index === activeIndex ? "is-active" : "",
    ].filter(Boolean).join(" ");
    const typeLabel = isPattern ? copy[tokenKind] : copy.literal;
    items += `<li class="${classes}" role="listitem" aria-label="${wildcard44Escape(`${label} ${index + 1}: ${token}, ${typeLabel}`)}"><small>${index + 1}</small><strong>${wildcard44Escape(token)}</strong><span>${wildcard44Escape(typeLabel)}</span></li>`;
  }

  return `<section class="wildcard44-strip-card" aria-label="${wildcard44Escape(label)}"><header><span>${wildcard44Escape(label)}</span><code>${isPattern ? "p" : "s"} = &quot;${wildcard44Escape(text)}&quot;</code></header><ol class="wildcard44-strip${isPattern ? " is-pattern" : ""}" role="list">${items}</ol></section>`;
}

function wildcard44CellValue(matrix, row, column) {
  return Boolean(Array.isArray(matrix[row]) && matrix[row][column] === true);
}

function wildcard44RenderTable(state, copy, locale) {
  const dpWidth = state.dp.reduce((width, row) => Math.max(width, row.length), 0);
  const knownWidth = state.known.reduce((width, row) => Math.max(width, row.length), 0);
  const rowCount = Math.min(201, Math.max(1, state.m + 1, state.dp.length, state.known.length));
  const columnCount = Math.min(201, Math.max(1, state.n + 1, dpWidth, knownWidth));
  const readMap = new Map();
  state.reads.forEach((read) => {
    const key = `${read.i},${read.j}`;
    const roles = readMap.get(key) || [];
    roles.push(read.role);
    readMap.set(key, roles);
  });
  const resolutionMap = new Map(state.invariantResolutions.map((item) => [`${item.i},${item.j}`, item]));
  const activeKey = Number.isInteger(state.cursor.i) && Number.isInteger(state.cursor.j)
    ? `${state.cursor.i},${state.cursor.j}`
    : null;
  const writeKey = state.write ? `${state.write.i},${state.write.j}` : null;

  let header = `<tr><th class="wildcard44-corner" scope="col">dp[i][j]</th>`;
  for (let column = 0; column < columnCount; column++) {
    const token = column === 0 ? "ε" : (state.p[column - 1] || "∅");
    const tokenKind = column === 0 ? "epsilon" : wildcard44TokenKind(token);
    header += `<th class="wildcard44-axis is-${tokenKind}" scope="col"><small>j=${column}</small><strong>${wildcard44Escape(token)}</strong></th>`;
  }
  header += "</tr>";

  let body = "";
  for (let row = 0; row < rowCount; row++) {
    const sourceToken = row === 0 ? "ε" : (state.s[row - 1] || "∅");
    body += `<tr><th class="wildcard44-axis" scope="row"><small>i=${row}</small><strong>${wildcard44Escape(sourceToken)}</strong></th>`;
    for (let column = 0; column < columnCount; column++) {
      const key = `${row},${column}`;
      const known = wildcard44CellValue(state.known, row, column);
      const value = wildcard44CellValue(state.dp, row, column);
      const roles = readMap.get(key) || [];
      const classes = [
        "wildcard44-cell",
        known ? (value ? "is-true" : "is-false") : "is-unknown",
        key === activeKey ? "is-active" : "",
        roles.length ? "is-read" : "",
        key === writeKey ? "is-write" : "",
        resolutionMap.has(key) ? "is-resolved" : "",
      ].filter(Boolean).join(" ");
      const stateLabel = known ? (value ? copy.trueValue : copy.falseValue) : copy.unknown;
      const actionLabel = [
        key === activeKey ? copy.active : "",
        roles.length ? copy.read : "",
        key === writeKey ? copy.write : "",
        resolutionMap.has(key) ? copy.resolved : "",
      ].filter(Boolean).join(", ");
      const aria = `${copy.cell} dp[${row}][${column}], ${copy.row} ${row}, ${copy.column} ${column}, ${stateLabel}${actionLabel ? `, ${actionLabel}` : ""}`;
      const roleBadges = roles.map((role) => `<small class="wildcard44-read-role">${wildcard44Escape(wildcard44Role(role, locale))}</small>`).join("");
      body += `<td class="${classes}" aria-label="${wildcard44Escape(aria)}"><strong>${known ? (value ? "T" : "F") : "?"}</strong>${roleBadges}</td>`;
    }
    body += "</tr>";
  }

  return `<section class="wildcard44-table-card"><header class="wildcard44-section-heading"><h3>${wildcard44Escape(copy.table)}</h3><div class="wildcard44-legend" aria-label="Legend"><span class="is-unknown">?</span>${wildcard44Escape(copy.unknown)}<span class="is-false">F</span>${wildcard44Escape(copy.falseValue)}<span class="is-true">T</span>${wildcard44Escape(copy.trueValue)}<span class="is-read">↗</span>${wildcard44Escape(copy.read)}<span class="is-write">✎</span>${wildcard44Escape(copy.write)}<span class="is-resolved">✓</span>${wildcard44Escape(copy.resolved)}</div></header><div class="wildcard44-table-scroll" role="region" tabindex="0" aria-label="${wildcard44Escape(copy.table)}"><table class="wildcard44-table"><thead>${header}</thead><tbody>${body}</tbody></table></div></section>`;
}

function wildcard44RenderOperands(operands, copy) {
  if (!operands.length) return "";
  return `<div class="wildcard44-operands"><em>${wildcard44Escape(copy.operands)}</em>${operands.map((operand) => `<span><code>${wildcard44Escape(operand.name)}</code><b>${wildcard44Escape(String(operand.value))}</b></span>`).join("")}</div>`;
}

function wildcard44RenderCondition(state, copy) {
  if (state.condition.kind === "none" || !state.condition.expression) {
    return `<p class="wildcard44-empty-detail">${wildcard44Escape(copy.noCondition)}</p>`;
  }
  const resultText = state.condition.result == null ? "?" : (state.condition.result ? "TRUE" : "FALSE");
  const branches = state.condition.branches.length
    ? `<div class="wildcard44-condition-branches">${state.condition.branches.map((branch) => {
        const branchResult = branch.result == null ? "?" : (branch.result ? "TRUE" : "FALSE");
        return `<div class="wildcard44-condition-branch ${wildcard44StatusClass(branch.result)}"><span>${wildcard44Escape(branch.kind)}</span><code>${wildcard44Escape(branch.expression)}</code><strong>${branchResult}</strong>${wildcard44RenderOperands(branch.operands, copy)}</div>`;
      }).join("")}</div>`
    : "";
  return `<div class="wildcard44-condition-line"><code>${wildcard44Escape(state.condition.expression)}</code><strong class="wildcard44-condition-result ${wildcard44StatusClass(state.condition.result)}">${resultText}</strong></div>${wildcard44RenderOperands(state.condition.operands, copy)}${branches}`;
}

function wildcard44RenderQuestion(state, copy) {
  const questionBranch = state.condition.branches.find((branch) => branch.kind === "question");
  if (!questionBranch && state.currentToken.kind !== "question") return "";
  const sourceToken = state.cursor.sIndex != null && state.cursor.sIndex >= 0
    ? (state.s[state.cursor.sIndex] || "∅")
    : "∅";
  const result = questionBranch ? questionBranch.result : null;
  const resultText = result == null ? "?" : (result ? "TRUE" : "FALSE");
  return `<section class="wildcard44-question-comparison"><h3>${wildcard44Escape(copy.questionComparison)}</h3><div><span class="wildcard44-question-token">?</span><b aria-hidden="true">↔</b><span class="wildcard44-source-token">${wildcard44Escape(sourceToken)}</span><strong class="${wildcard44StatusClass(result)}">${resultText}</strong></div><p>${wildcard44Escape(copy.questionRule)}</p></section>`;
}

function wildcard44FindRead(state, roles) {
  return state.reads.find((read) => roles.includes(read.role)) || null;
}

function wildcard44RenderStarBranch(read, title, detail, copy) {
  const status = read ? (read.known ? wildcard44Boolean(read.value) : "?") : "—";
  const statusClass = read ? wildcard44StatusClass(read.known ? read.value : null) : "is-pending";
  const cell = read ? `dp[${read.i}][${read.j}]` : copy.unavailable;
  return `<div class="wildcard44-star-choice ${statusClass}"><span>${wildcard44Escape(title)}</span><code>${wildcard44Escape(cell)}</code><strong>${status}</strong><small>${wildcard44Escape(detail)}</small></div>`;
}

function wildcard44RenderStar(state, copy) {
  const isStarStep = state.currentToken.kind === "star"
    || state.condition.kind === "star"
    || state.condition.kind === "leading-star"
    || state.reads.some((read) => read.role === "empty" || read.role === "consume" || read.role === "left");
  if (!isStarStep) return "";
  const emptyRead = wildcard44FindRead(state, ["empty", "left"]);
  const consumeRead = wildcard44FindRead(state, ["consume"]);
  const orValue = state.write && state.write.reason === "star-empty-or-consume"
    ? wildcard44Boolean(state.write.afterValue)
    : "—";
  return `<section class="wildcard44-star-diagram"><h3>${wildcard44Escape(copy.starChoices)}</h3><div class="wildcard44-star-center" aria-label="star wildcard">*</div><div class="wildcard44-star-branches">${wildcard44RenderStarBranch(emptyRead, copy.emptyBranch, copy.emptyDetail, copy)}${wildcard44RenderStarBranch(consumeRead, copy.consumeBranch, copy.consumeDetail, copy)}</div><div class="wildcard44-star-or"><span>${wildcard44Escape(copy.orResult)}</span><strong>${orValue}</strong></div></section>`;
}

function wildcard44Equation(state) {
  const i = state.cursor.i;
  const j = state.cursor.j;
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
    case 8: {
      const left = wildcard44FindRead(state, ["left"]);
      return `dp[0][${j}] ← dp[0][${j - 1}] = ${left ? wildcard44Boolean(left.value) : "?"}`;
    }
    case 10:
      return `break; resolve dp[0][${j}..${state.n}] = False`;
    case 11:
      return `i ← ${i}; resolve dp[${i}][0] = False`;
    case 12:
      return `j ← ${j}; inspect dp[${i}][${j}]`;
    case 13:
      return `p[${j - 1}] == '?' OR p[${j - 1}] == s[${i - 1}]`;
    case 14: {
      const diagonal = wildcard44FindRead(state, ["diagonal"]);
      return `dp[${i}][${j}] ← dp[${i - 1}][${j - 1}] = ${diagonal ? wildcard44Boolean(diagonal.value) : "?"}`;
    }
    case 15:
      return `p[${j - 1}] == '*'`;
    case 16: {
      const empty = wildcard44FindRead(state, ["empty"]);
      const consume = wildcard44FindRead(state, ["consume"]);
      return `dp[${i}][${j}] ← ${empty ? wildcard44Boolean(empty.value) : "?"} OR ${consume ? wildcard44Boolean(consume.value) : "?"} = ${state.write ? wildcard44Boolean(state.write.afterValue) : "?"}`;
    }
    case 18:
      return `dp[${i}][${j}] ← False`;
    case 19:
      return `return dp[${state.m}][${state.n}] = ${state.answer == null ? "?" : wildcard44Boolean(state.answer)}`;
    default:
      return "—";
  }
}

function wildcard44RenderReads(state, copy, locale) {
  if (!state.reads.length) return `<p class="wildcard44-empty-detail">${wildcard44Escape(copy.noReads)}</p>`;
  return `<ul class="wildcard44-read-list">${state.reads.map((read) => `<li class="${read.known ? "is-known" : "is-unknown"}"><code>dp[${read.i}][${read.j}]</code><strong>${read.known ? wildcard44Boolean(read.value) : "?"}</strong><span>${wildcard44Escape(wildcard44Role(read.role, locale))}</span><small>${wildcard44Escape(read.known ? copy.knownRead : copy.unknownRead)}</small></li>`).join("")}</ul>`;
}

function wildcard44RenderWrite(state, copy, locale) {
  if (!state.write) return `<p class="wildcard44-empty-detail">${wildcard44Escape(copy.noWrite)}</p>`;
  const before = state.write.beforeKnown ? wildcard44Boolean(state.write.beforeValue) : "?";
  const reason = wildcard44Reason(state.write.reason, locale, WILDCARD44_REASON_TEXT);
  return `<div class="wildcard44-write-transition"><code>dp[${state.write.i}][${state.write.j}]</code><div><small>${wildcard44Escape(copy.before)}</small><span class="${state.write.beforeKnown ? wildcard44StatusClass(state.write.beforeValue) : "is-pending"}">${before}</span><b aria-hidden="true">→</b><small>${wildcard44Escape(copy.after)}</small><strong class="${wildcard44StatusClass(state.write.afterValue)}">${wildcard44Boolean(state.write.afterValue)}</strong></div><p>${wildcard44Escape(reason)}</p></div>`;
}

function wildcard44RenderResolutions(state, copy, locale) {
  if (!state.invariantResolutions.length) {
    return `<p class="wildcard44-empty-detail">${wildcard44Escape(copy.noResolutions)}</p>`;
  }
  return `<ul class="wildcard44-resolution-list">${state.invariantResolutions.map((item) => {
    const reason = wildcard44Reason(item.reason, locale, WILDCARD44_RESOLUTION_TEXT);
    return `<li><code>dp[${item.i}][${item.j}]</code><strong>${wildcard44Boolean(item.value)}</strong><span>${wildcard44Escape(reason)}</span></li>`;
  }).join("")}</ul>`;
}

function wildcard44RenderPhaseRail(state, copy, locale) {
  const currentIndex = WILDCARD44_PHASES.findIndex((phase) => phase.key === state.phase && phase.line === state.sourceLine);
  return `<ol class="wildcard44-phase-rail" role="list" aria-label="${wildcard44Escape(copy.phaseRail)}">${WILDCARD44_PHASES.map((phase, index) => {
    const classes = [
      "wildcard44-phase",
      index === currentIndex ? "is-current" : "",
      currentIndex >= 0 && index < currentIndex ? "is-earlier" : "",
    ].filter(Boolean).join(" ");
    return `<li class="${classes}" role="listitem"${index === currentIndex ? " aria-current=\"step\"" : ""}><small>${phase.line}</small><span>${wildcard44Escape(phase[locale])}</span></li>`;
  }).join("")}</ol>`;
}

function renderWildcardMatch44View(step) {
  const host = typeof document !== "undefined" ? document.getElementById("treeView") : null;
  if (!host) return;

  const locale = wildcard44Locale();
  const copy = WILDCARD44_TEXT[locale];
  const state = wildcard44Normalize(step);
  const phase = WILDCARD44_PHASES.find((item) => item.key === state.phase && item.line === state.sourceLine);
  const phaseLabel = phase ? phase[locale] : state.phase;
  const timingLabel = state.timing === "after" ? copy.timingAfter : copy.timingBefore;
  const tokenValue = state.currentToken.value == null ? "—" : state.currentToken.value;
  const tokenKindLabel = state.currentToken.kind === "none" ? copy.tokenNone : copy[state.currentToken.kind];
  const cursorText = `i=${state.cursor.i == null ? "—" : state.cursor.i}, j=${state.cursor.j == null ? "—" : state.cursor.j}, sIndex=${state.cursor.sIndex == null ? "—" : state.cursor.sIndex}, pIndex=${state.cursor.pIndex == null ? "—" : state.cursor.pIndex}`;
  const resultClass = state.answer === true ? "is-match" : (state.answer === false ? "is-no-match" : "is-pending");
  const resultText = state.answer == null ? copy.pending : (state.answer ? copy.matches : copy.noMatch);
  const note = state.note ? `<aside class="wildcard44-note"><strong>${wildcard44Escape(copy.note)}</strong><p>${wildcard44Escape(state.note)}</p></aside>` : "";

  host.innerHTML = `<article class="wildcard44-viz" role="region" aria-label="${wildcard44Escape(copy.region)}">
    <header class="wildcard44-debug-header">
      <div><span class="wildcard44-kicker">LeetCode 44 · DP table</span><h2>${wildcard44Escape(phaseLabel || "Wildcard Matching")}</h2></div>
      <div class="wildcard44-line-badges"><strong>LINE ${state.sourceLine == null ? "—" : state.sourceLine}</strong><span class="is-${state.timing}">${wildcard44Escape(timingLabel)}</span></div>
    </header>
    ${wildcard44RenderPhaseRail(state, copy, locale)}
    <div class="wildcard44-strips">${wildcard44RenderStrip(state, "source", copy)}${wildcard44RenderStrip(state, "pattern", copy)}</div>
    <div class="wildcard44-stat-row">
      <span><small>${wildcard44Escape(copy.dimensions)}</small><b>(${state.m + 1}) × (${state.n + 1})</b></span>
      <span><small>${wildcard44Escape(copy.cursor)}</small><code>${wildcard44Escape(cursorText)}</code></span>
      <span class="wildcard44-current-token is-${state.currentToken.kind}"><small>${wildcard44Escape(copy.token)}</small><b>${wildcard44Escape(tokenValue)}</b><em>${wildcard44Escape(tokenKindLabel)}</em></span>
    </div>
    ${wildcard44RenderTable(state, copy, locale)}
    <div class="wildcard44-logic-grid">
      <section class="wildcard44-detail-card"><h3>${wildcard44Escape(copy.condition)}</h3>${wildcard44RenderCondition(state, copy)}</section>
      <section class="wildcard44-detail-card wildcard44-equation-card"><h3>${wildcard44Escape(copy.recurrence)}</h3><code>${wildcard44Escape(wildcard44Equation(state))}</code></section>
      ${wildcard44RenderQuestion(state, copy)}
      ${wildcard44RenderStar(state, copy)}
      <section class="wildcard44-detail-card"><h3>${wildcard44Escape(copy.reads)}</h3>${wildcard44RenderReads(state, copy, locale)}</section>
      <section class="wildcard44-detail-card"><h3>${wildcard44Escape(copy.writePanel)}</h3>${wildcard44RenderWrite(state, copy, locale)}</section>
      <section class="wildcard44-detail-card wildcard44-resolution-card"><h3>${wildcard44Escape(copy.resolutions)}</h3>${wildcard44RenderResolutions(state, copy, locale)}</section>
    </div>
    ${note}
    <section class="wildcard44-result ${resultClass}" role="status" aria-live="polite"><small>${wildcard44Escape(copy.result)}</small><strong>${wildcard44Escape(resultText)}</strong>${state.answer == null ? "" : `<code>dp[${state.m}][${state.n}] = ${wildcard44Boolean(state.answer)}</code>`}</section>
  </article>`;
}
