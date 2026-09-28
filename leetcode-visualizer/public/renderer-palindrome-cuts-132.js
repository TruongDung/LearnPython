"use strict";

const PC132_EVENT_RAIL = Object.freeze([
  { line: 3, event: "read-input", en: "Read input", vi: "Đọc input" },
  { line: 4, event: "allocate-palindrome", en: "Allocate table", vi: "Tạo bảng" },
  { line: 5, event: "palindrome-start", en: "Select start", vi: "Chọn start" },
  { line: 6, event: "palindrome-interval", en: "Select interval", vi: "Chọn khoảng" },
  { line: 7, event: "test-interval", en: "Test condition (L7–9)", vi: "Kiểm tra điều kiện (D7–9)" },
  { line: 10, event: "discover-palindrome", en: "Discover palindrome", vi: "Ghi palindrome" },
  { line: 11, event: "allocate-cuts", en: "Allocate cuts", vi: "Tạo cuts" },
  { line: 12, event: "set-base", en: "Set base", vi: "Đặt base" },
  { line: 13, event: "allocate-parent", en: "Allocate parent", vi: "Tạo parent" },
  { line: 14, event: "prefix", en: "Choose prefix", vi: "Chọn prefix" },
  { line: 15, event: "candidate", en: "Choose candidate", vi: "Chọn candidate" },
  { line: 16, event: "palindrome-gate", en: "Palindrome gate", vi: "Cổng palindrome" },
  { line: 17, event: "candidate-value", en: "Candidate value", vi: "Giá trị candidate" },
  { line: 18, event: "improve", en: "Improve", vi: "Cải thiện" },
  { line: 18, event: "keep", en: "Keep first", vi: "Giữ đầu tiên" },
  { line: 19, event: "update-cut", en: "Update cut", vi: "Cập nhật cut" },
  { line: 20, event: "update-parent", en: "Update parent", vi: "Cập nhật parent" },
  { line: 21, event: "reconstruction-init", en: "Start witness", vi: "Bắt đầu witness" },
  { line: 22, event: "set-cursor", en: "Set cursor", vi: "Đặt cursor" },
  { line: 23, event: "reconstruction-loop", en: "Check cursor", vi: "Kiểm tra cursor" },
  { line: 24, event: "follow-parent", en: "Follow parent", vi: "Theo parent" },
  { line: 25, event: "append-piece", en: "Append piece", vi: "Thêm đoạn" },
  { line: 26, event: "move-cursor", en: "Move cursor", vi: "Dời cursor" },
  { line: 27, event: "reverse-partition", en: "Reverse witness", vi: "Đảo witness" },
  { line: 28, event: "done", en: "Return answer", vi: "Trả đáp án" },
]);

const PC132_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Palindrome Partitioning II line-by-line visualization",
    kicker: "LEETCODE 132 · PALINDROME CUTS",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    eventRail: "Source line and event rail",
    source: "Source ribbon",
    input: "Input",
    phase: "Phase",
    palindromeTable: "Triangular palindrome table",
    palindromeHelp: "? is unknown, × is computed false, and ✓ is computed true.",
    unknown: "unknown",
    computedFalse: "computed false",
    computedTrue: "computed true",
    unavailable: "not allocated",
    notApplicable: "outside the upper triangle",
    discovered: "Discovered palindromes",
    noneDiscovered: "No palindrome interval has been stored yet.",
    endpoints: "Endpoint test",
    inner: "Inner interval",
    notNeeded: "not needed for length ≤ 3",
    cuts: "Minimum cuts by prefix",
    cutsHelp: "null in the payload is shown as ∞ until a prefix is reached.",
    parent: "Parent links",
    noParent: "No parent links have been selected yet.",
    activePrefix: "active prefix",
    candidate: "Candidate equation",
    candidateHelp: "Only a palindromic suffix may challenge the incumbent.",
    noCandidate: "No suffix candidate is active.",
    reject: "REJECT",
    update: "UPDATE",
    keep: "KEEP",
    pending: "PENDING",
    fromCuts: "from cuts",
    incumbent: "incumbent",
    proposedParent: "proposed parent",
    reconstruction: "Parent reconstruction",
    reconstructionHelp: "Links are followed right to left, then reversed into source order.",
    rightToLeft: "RIGHT → LEFT",
    ordered: "ORDERED PARTITION",
    emptyWitness: "No pieces appended yet.",
    cursor: "cursor",
    activeLink: "active link",
    complete: "complete",
    incomplete: "in progress",
    currentResult: "Current best",
    finalAnswer: "MINIMUM CUTS",
    finalPartition: "optimal partition witness",
    note: "Why this frame matters",
  }),
  vi: Object.freeze({
    region: "Trực quan từng dòng Palindrome Partitioning II",
    kicker: "LEETCODE 132 · CẮT PALINDROME",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    eventRail: "Thanh dòng lệnh và sự kiện",
    source: "Dải trạng thái nguồn",
    input: "Input",
    phase: "Giai đoạn",
    palindromeTable: "Bảng palindrome tam giác",
    palindromeHelp: "? là chưa biết, × là false đã tính, và ✓ là true đã tính.",
    unknown: "chưa biết",
    computedFalse: "false đã tính",
    computedTrue: "true đã tính",
    unavailable: "chưa cấp phát",
    notApplicable: "ngoài tam giác trên",
    discovered: "Palindrome đã tìm thấy",
    noneDiscovered: "Chưa lưu khoảng palindrome nào.",
    endpoints: "Kiểm tra hai đầu",
    inner: "Khoảng bên trong",
    notNeeded: "không cần cho độ dài ≤ 3",
    cuts: "Số lần cắt tối thiểu theo prefix",
    cutsHelp: "null trong payload được hiển thị là ∞ tới khi prefix được chạm tới.",
    parent: "Liên kết parent",
    noParent: "Chưa chọn liên kết parent nào.",
    activePrefix: "prefix đang chạy",
    candidate: "Phương trình candidate",
    candidateHelp: "Chỉ suffix palindrome mới được so với incumbent.",
    noCandidate: "Không có suffix candidate đang hoạt động.",
    reject: "LOẠI",
    update: "CẬP NHẬT",
    keep: "GIỮ",
    pending: "ĐANG CHỜ",
    fromCuts: "từ cuts",
    incumbent: "giá trị hiện tại",
    proposedParent: "parent đề xuất",
    reconstruction: "Tái dựng bằng parent",
    reconstructionHelp: "Đi theo liên kết từ phải sang trái rồi đảo về thứ tự chuỗi.",
    rightToLeft: "PHẢI → TRÁI",
    ordered: "PARTITION ĐÚNG THỨ TỰ",
    emptyWitness: "Chưa thêm đoạn nào.",
    cursor: "cursor",
    activeLink: "liên kết đang chạy",
    complete: "hoàn tất",
    incomplete: "đang dựng",
    currentResult: "Tốt nhất hiện tại",
    finalAnswer: "SỐ LẦN CẮT TỐI THIỂU",
    finalPartition: "witness partition tối ưu",
    note: "Ý nghĩa của frame này",
  }),
});

function pc132Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pc132Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function pc132CleanText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const clean = value.slice(0, 320).trim();
  return /^(?:undefined|nan|[+-]?infinity)$/i.test(clean) ? fallback : clean;
}

function pc132Localized(value, locale, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return pc132CleanText(value[locale], pc132CleanText(value.en, pc132CleanText(value.vi, fallback)));
  }
  return pc132CleanText(value, fallback);
}

function pc132Integer(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max ? value : null;
}

function pc132Finite(value) {
  return typeof value === "number" && Number.isFinite(value) ? (Object.is(value, -0) ? 0 : value) : null;
}

function pc132Display(value, fallback = "—") {
  const number = pc132Finite(value);
  return number === null ? fallback : String(number);
}

function pc132Boolean(value) {
  return typeof value === "boolean" ? value : null;
}

function pc132Interval(value, n) {
  const raw = Array.isArray(value)
    ? { start: value[0], end: value[1] }
    : value && typeof value === "object" ? value : {};
  const start = pc132Integer(raw.start, 0, n);
  const end = pc132Integer(raw.end, 0, n);
  return start !== null && end !== null && start <= end ? [start, end] : null;
}

function pc132Normalize(step) {
  const raw = step && step.palindromeCuts132View && typeof step.palindromeCuts132View === "object"
    ? step.palindromeCuts132View
    : {};
  const cleanInput = pc132CleanText(raw.s, "");
  const inferredLength = Math.max(1, Math.min(16, Array.from(cleanInput).length || 1));
  const n = pc132Integer(raw.n, 1, 16) ?? inferredLength;
  const chars = Array.from(cleanInput).slice(0, n);
  while (chars.length < n) chars.push("·");
  const s = chars.join("");
  const sourceFromStep = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = pc132Integer(raw.sourceLine, 1, 28) ?? pc132Integer(sourceFromStep, 1, 28);
  const knownEvents = PC132_EVENT_RAIL.map((item) => item.event);
  const event = knownEvents.includes(raw.event) ? raw.event : "unknown";
  const palindromeRaw = raw.palindrome && typeof raw.palindrome === "object" ? raw.palindrome : {};
  const allowedStatuses = ["unallocated", "not-applicable", "unknown", "computed-false", "computed-true"];
  const valuesRaw = Array.isArray(palindromeRaw.values) ? palindromeRaw.values : [];
  const statusRaw = Array.isArray(palindromeRaw.status) ? palindromeRaw.status : [];
  const values = Array.from({ length: n }, (_, row) => Array.from({ length: n }, (_, col) => (
    Array.isArray(valuesRaw[row]) && valuesRaw[row][col] === true
  )));
  const status = Array.from({ length: n }, (_, row) => Array.from({ length: n }, (_, col) => {
    const value = Array.isArray(statusRaw[row]) ? statusRaw[row][col] : null;
    if (allowedStatuses.includes(value)) return value;
    return col < row ? "not-applicable" : "unknown";
  }));
  const activeRaw = palindromeRaw.active && typeof palindromeRaw.active === "object" ? palindromeRaw.active : null;
  const activeStart = activeRaw ? pc132Integer(activeRaw.start, 0, n - 1) : null;
  const activeEnd = activeStart !== null ? pc132Integer(activeRaw.end, activeStart, n - 1) : null;
  const active = activeStart !== null ? {
    start: activeStart,
    end: activeEnd,
    text: activeEnd === null ? "" : pc132CleanText(activeRaw.text, s.slice(activeStart, activeEnd + 1)),
    result: pc132Boolean(activeRaw.result),
  } : null;
  const innerRaw = palindromeRaw.inner && typeof palindromeRaw.inner === "object" ? palindromeRaw.inner : null;
  const innerInterval = innerRaw ? pc132Interval(innerRaw, n - 1) : null;
  const inner = innerRaw ? {
    start: innerInterval ? innerInterval[0] : null,
    end: innerInterval ? innerInterval[1] : null,
    status: ["not-needed", ...allowedStatuses].includes(innerRaw.status) ? innerRaw.status : "unknown",
    value: pc132Boolean(innerRaw.value),
  } : null;
  const endpointsRaw = palindromeRaw.endpoints && typeof palindromeRaw.endpoints === "object" ? palindromeRaw.endpoints : null;
  const endpointInterval = endpointsRaw ? pc132Interval(endpointsRaw, n - 1) : null;
  const endpoints = endpointInterval ? {
    start: endpointInterval[0],
    end: endpointInterval[1],
    left: pc132CleanText(endpointsRaw.left, chars[endpointInterval[0]]),
    right: pc132CleanText(endpointsRaw.right, chars[endpointInterval[1]]),
    match: pc132Boolean(endpointsRaw.match),
  } : null;
  const discovered = Array.isArray(palindromeRaw.discovered)
    ? palindromeRaw.discovered.slice(0, 136).map((item) => {
      const interval = pc132Interval(item, n - 1);
      if (!interval) return null;
      return {
        start: interval[0],
        end: interval[1],
        text: pc132CleanText(item && item.text, s.slice(interval[0], interval[1] + 1)),
      };
    }).filter(Boolean)
    : [];

  const cutsRaw = raw.cuts && typeof raw.cuts === "object" ? raw.cuts : {};
  const cutValuesRaw = Array.isArray(cutsRaw.values) ? cutsRaw.values : [];
  const cutStatusRaw = Array.isArray(cutsRaw.status) ? cutsRaw.status : [];
  const parentRaw = Array.isArray(cutsRaw.parent) ? cutsRaw.parent : [];
  const allowedCutStatuses = ["unallocated", "infinity", "base", "active", "computed"];
  const cuts = {
    values: Array.from({ length: n + 1 }, (_, index) => pc132Finite(cutValuesRaw[index])),
    status: Array.from({ length: n + 1 }, (_, index) => allowedCutStatuses.includes(cutStatusRaw[index]) ? cutStatusRaw[index] : "unallocated"),
    parent: Array.from({ length: n + 1 }, (_, index) => pc132Integer(parentRaw[index], -1, n)),
    activePrefix: pc132Integer(cutsRaw.activePrefix, 1, n),
  };

  const candidateRaw = raw.candidate && typeof raw.candidate === "object" ? raw.candidate : {};
  const candidate = {
    start: pc132Integer(candidateRaw.start, 0, n - 1),
    end: pc132Integer(candidateRaw.end, 0, n - 1),
    text: pc132CleanText(candidateRaw.text, ""),
    palindrome: pc132Boolean(candidateRaw.palindrome),
    fromCuts: pc132Finite(candidateRaw.fromCuts),
    value: pc132Finite(candidateRaw.value),
    incumbentBefore: pc132Finite(candidateRaw.incumbentBefore),
    incumbentAfter: pc132Finite(candidateRaw.incumbentAfter),
    proposedParent: pc132Integer(candidateRaw.proposedParent, 0, n - 1),
    outcome: ["pending", "reject", "update", "keep"].includes(candidateRaw.outcome) ? candidateRaw.outcome : "pending",
  };

  const reconstructionRaw = raw.reconstruction && typeof raw.reconstruction === "object" ? raw.reconstruction : {};
  const normalizeIntervals = (value) => Array.isArray(value)
    ? value.slice(0, n).map((item) => pc132Interval(item, n)).filter(Boolean)
    : [];
  const normalizePieces = (value) => Array.isArray(value)
    ? value.slice(0, n).map((item) => pc132CleanText(item, ""))
    : [];
  const activeLinkRaw = reconstructionRaw.activeLink && typeof reconstructionRaw.activeLink === "object"
    ? reconstructionRaw.activeLink
    : null;
  const activeLinkInterval = activeLinkRaw ? pc132Interval(activeLinkRaw.interval, n) : null;
  const reconstruction = {
    cursor: pc132Integer(reconstructionRaw.cursor, 0, n),
    activeLink: activeLinkRaw && activeLinkInterval ? {
      from: pc132Integer(activeLinkRaw.from, 0, n),
      to: pc132Integer(activeLinkRaw.to, 0, n),
      interval: activeLinkInterval,
      piece: pc132CleanText(activeLinkRaw.piece, ""),
    } : null,
    reversedIntervals: normalizeIntervals(reconstructionRaw.reversedIntervals),
    reversedPieces: normalizePieces(reconstructionRaw.reversedPieces),
    orderedIntervals: normalizeIntervals(reconstructionRaw.orderedIntervals),
    orderedPieces: normalizePieces(reconstructionRaw.orderedPieces),
    complete: reconstructionRaw.complete === true,
  };

  return {
    version: Number.isInteger(raw.version) && raw.version > 0 ? raw.version : 1,
    problemId: 132,
    sourceLine,
    timing: raw.timing === "before" ? "before" : "after",
    phase: pc132CleanText(raw.phase, "unknown"),
    event,
    s,
    n,
    palindrome: { values, status, active, inner, endpoints, discovered },
    cuts,
    candidate,
    reconstruction,
    answer: pc132Finite(raw.answer),
    final: raw.final === true || Boolean(step && step.final),
    title: pc132Localized(step && step.title, pc132Locale(), "Palindrome Partitioning II"),
    note: pc132Localized(step && step.note, pc132Locale(), ""),
  };
}

function pc132StatusCopy(status, copy) {
  if (status === "computed-true") return copy.computedTrue;
  if (status === "computed-false") return copy.computedFalse;
  if (status === "not-applicable") return copy.notApplicable;
  if (status === "unallocated") return copy.unavailable;
  return copy.unknown;
}

function pc132OutcomeCopy(outcome, copy) {
  if (outcome === "reject") return copy.reject;
  if (outcome === "update") return copy.update;
  if (outcome === "keep") return copy.keep;
  return copy.pending;
}

function pc132Equation(state, copy) {
  const candidate = state.candidate;
  const active = state.palindrome.active;
  switch (state.event) {
    case "read-input": return `n = len(${JSON.stringify(state.s)}) = ${state.n}`;
    case "allocate-palindrome": return `is_palindrome = [[False] * ${state.n} for _ in range(${state.n})]`;
    case "palindrome-start": return active ? `start = ${active.start} · active row [${active.start}, ${active.start}..${state.n - 1}]` : "select start";
    case "palindrome-interval": return active && active.end !== null ? `end = ${active.end} · [${active.start}, ${active.end}] = ${JSON.stringify(active.text)}` : "select interval";
    case "test-interval": return active ? `${JSON.stringify(active.text)}: endpoints ∧ inner → ${active.result === true ? "True" : "False"}` : "test interval";
    case "discover-palindrome": return active ? `is_palindrome[${active.start}][${active.end}] = True` : "store palindrome";
    case "allocate-cuts": return `cuts = [∞] * ${state.n + 1}`;
    case "set-base": return "cuts[0] = -1";
    case "allocate-parent": return `parent = [-1] * ${state.n + 1}`;
    case "prefix": return `end = ${state.cuts.activePrefix === null ? "—" : state.cuts.activePrefix}`;
    case "candidate": return candidate.start === null ? copy.noCandidate : `start = ${candidate.start}; suffix = ${JSON.stringify(candidate.text)}`;
    case "palindrome-gate": return candidate.start === null ? copy.noCandidate : `is_palindrome[${candidate.start}][${candidate.end}] → ${candidate.palindrome === true ? "True" : "False"}`;
    case "candidate-value": return `candidate = ${pc132Display(candidate.fromCuts)} + 1 = ${pc132Display(candidate.value)}`;
    case "improve":
    case "keep": return `${pc132Display(candidate.value)} < ${pc132Display(candidate.incumbentBefore, "∞")} → ${state.event === "improve" ? "True" : "False"}`;
    case "update-cut": return `cuts[${state.cuts.activePrefix === null ? "end" : state.cuts.activePrefix}] = ${pc132Display(candidate.value)}`;
    case "update-parent": return `parent[${state.cuts.activePrefix === null ? "end" : state.cuts.activePrefix}] = ${pc132Display(candidate.proposedParent)}`;
    case "reconstruction-init": return "partition = []";
    case "set-cursor": return `cursor = ${pc132Display(state.reconstruction.cursor)}`;
    case "reconstruction-loop": return `cursor > 0 → ${state.reconstruction.cursor !== null && state.reconstruction.cursor > 0 ? "True" : "False"}`;
    case "follow-parent": return state.reconstruction.activeLink ? `start = parent[${state.reconstruction.activeLink.from}] = ${state.reconstruction.activeLink.to}` : "start = parent[cursor]";
    case "append-piece": return state.reconstruction.activeLink ? `partition.append(${JSON.stringify(state.reconstruction.activeLink.piece)})` : "partition.append(s[start:cursor])";
    case "move-cursor": return `cursor = ${pc132Display(state.reconstruction.cursor)}`;
    case "reverse-partition": return "partition.reverse()";
    case "done": return `return cuts[${state.n}] = ${pc132Display(state.answer)}`;
    default: return "—";
  }
}

function pc132RenderRail(state, copy, locale) {
  return `<nav class="pc132-rail-wrap" aria-label="${pc132Escape(copy.eventRail)}"><ol class="pc132-event-rail" role="list">${PC132_EVENT_RAIL.map((item) => {
    const current = item.line === state.sourceLine && item.event === state.event;
    return `<li class="pc132-event ${current ? "is-current" : ""}"${current ? " aria-current=\"step\"" : ""}><small>L${item.line}</small><span>${pc132Escape(item[locale])}</span></li>`;
  }).join("")}</ol></nav>`;
}

function pc132RenderPalindrome(state, copy) {
  const active = state.palindrome.active;
  const inner = state.palindrome.inner;
  const endpoints = state.palindrome.endpoints;
  const header = state.s.split("").map((char, index) => `<th scope="col"><b>${index}</b><span>${pc132Escape(char)}</span></th>`).join("");
  const rows = state.palindrome.values.map((row, rowIndex) => `<tr><th scope="row"><b>${rowIndex}</b><span>${pc132Escape(state.s[rowIndex])}</span></th>${row.map((value, colIndex) => {
    const status = state.palindrome.status[rowIndex][colIndex];
    const isActiveStart = active && active.start === rowIndex && active.end === null && colIndex >= rowIndex;
    const isActive = isActiveStart || Boolean(active && active.start === rowIndex && active.end === colIndex);
    const isInner = inner && inner.start === rowIndex && inner.end === colIndex;
    const isEndpoint = endpoints && (endpoints.start === rowIndex && endpoints.end === colIndex);
    const symbol = status === "computed-true" ? "✓" : status === "computed-false" ? "×" : status === "not-applicable" ? "" : status === "unallocated" ? "·" : "?";
    const classes = ["pc132-pal-cell", `is-${status}`, isActive ? "is-active" : "", isInner ? "is-inner" : "", isEndpoint ? "is-endpoints" : ""].filter(Boolean).join(" ");
    const label = `${rowIndex}..${colIndex}: ${pc132StatusCopy(status, copy)}${value ? ", true" : ""}`;
    return `<td class="${classes}" aria-label="${pc132Escape(label)}"><span aria-hidden="true">${pc132Escape(symbol)}</span></td>`;
  }).join("")}</tr>`).join("");
  const endpointText = endpoints
    ? `${endpoints.start}:${endpoints.left} ${endpoints.match === true ? "=" : "≠"} ${endpoints.end}:${endpoints.right}`
    : "—";
  const innerText = !inner ? "—" : inner.status === "not-needed"
    ? copy.notNeeded
    : `[${inner.start}, ${inner.end}] · ${pc132StatusCopy(inner.status, copy)} · ${inner.value === true ? "True" : "False"}`;
  const discovered = state.palindrome.discovered.length
    ? state.palindrome.discovered.map((item) => `<li><span>${pc132Escape(item.text)}</span><small>[${item.start}, ${item.end}]</small></li>`).join("")
    : `<li class="pc132-empty">${pc132Escape(copy.noneDiscovered)}</li>`;
  return `<section class="pc132-card pc132-pal-card"><header><div><h3>${pc132Escape(copy.palindromeTable)}</h3><p>${pc132Escape(copy.palindromeHelp)}</p></div><b>${state.palindrome.discovered.length}</b></header><div class="pc132-table-scroll"><table class="pc132-pal-table" aria-label="${pc132Escape(copy.palindromeTable)}"><thead><tr><th aria-hidden="true">s\e</th>${header}</tr></thead><tbody>${rows}</tbody></table></div><dl class="pc132-pal-tests"><div><dt>${pc132Escape(copy.endpoints)}</dt><dd>${pc132Escape(endpointText)}</dd></div><div><dt>${pc132Escape(copy.inner)}</dt><dd>${pc132Escape(innerText)}</dd></div></dl><div class="pc132-discovered"><strong>${pc132Escape(copy.discovered)}</strong><ol>${discovered}</ol></div></section>`;
}

function pc132RenderCuts(state, copy) {
  const cells = state.cuts.values.map((value, index) => {
    const status = state.cuts.status[index];
    const active = state.cuts.activePrefix === index;
    return `<li class="pc132-cut-cell is-${status} ${active ? "is-active" : ""}"${active ? " aria-current=\"step\"" : ""}><small>${index}</small><strong>${pc132Escape(pc132Display(value, "∞"))}</strong><span>${index === 0 ? "∅" : pc132Escape(state.s.slice(0, index))}</span></li>`;
  }).join("");
  const links = state.cuts.parent.map((parent, end) => parent !== null && parent >= 0
    ? `<li><b>p[${end}]</b><span>${parent}</span><i aria-hidden="true">→</i><span>${end}</span></li>`
    : "").join("");
  return `<section class="pc132-card pc132-cuts-card"><header><div><h3>${pc132Escape(copy.cuts)}</h3><p>${pc132Escape(copy.cutsHelp)}</p></div><b>${state.cuts.activePrefix === null ? "—" : `${pc132Escape(copy.activePrefix)} ${state.cuts.activePrefix}`}</b></header><div class="pc132-cuts-scroll"><ol class="pc132-cuts-row" role="list">${cells}</ol></div><div class="pc132-parent"><strong>${pc132Escape(copy.parent)}</strong>${links ? `<ol>${links}</ol>` : `<p>${pc132Escape(copy.noParent)}</p>`}</div></section>`;
}

function pc132RenderCandidate(state, copy) {
  const candidate = state.candidate;
  const hasCandidate = candidate.start !== null && candidate.end !== null;
  const outcome = pc132OutcomeCopy(candidate.outcome, copy);
  const equation = !hasCandidate
    ? copy.noCandidate
    : candidate.palindrome === false
      ? `${JSON.stringify(candidate.text)} · palindrome = False`
      : candidate.value === null
        ? `${JSON.stringify(candidate.text)} · palindrome = ${candidate.palindrome === true ? "True" : "?"}`
        : `cuts[${candidate.start}] + 1 = ${pc132Display(candidate.fromCuts)} + 1 = ${pc132Display(candidate.value)}`;
  return `<section class="pc132-card pc132-candidate is-${candidate.outcome}" role="status" aria-live="polite"><header><div><h3>${pc132Escape(copy.candidate)}</h3><p>${pc132Escape(copy.candidateHelp)}</p></div><strong>${pc132Escape(outcome)}</strong></header><code>${pc132Escape(equation)}</code><dl><div><dt>${pc132Escape(copy.fromCuts)}</dt><dd>${pc132Escape(pc132Display(candidate.fromCuts))}</dd></div><div><dt>${pc132Escape(copy.incumbent)}</dt><dd>${pc132Escape(pc132Display(candidate.incumbentBefore, "∞"))}<i aria-hidden="true">→</i>${pc132Escape(pc132Display(candidate.incumbentAfter, "∞"))}</dd></div><div><dt>${pc132Escape(copy.proposedParent)}</dt><dd>${pc132Escape(pc132Display(candidate.proposedParent))}</dd></div></dl></section>`;
}

function pc132PieceList(intervals, pieces, emptyText, directionClass) {
  const length = Math.max(intervals.length, pieces.length);
  if (!length) return `<p class="pc132-empty">${pc132Escape(emptyText)}</p>`;
  return `<ol class="pc132-pieces ${directionClass}" role="list">${Array.from({ length }, (_, index) => {
    const interval = intervals[index] || [null, null];
    const piece = pieces[index] || "";
    return `<li><span>${pc132Escape(piece)}</span><small>[${pc132Display(interval[0])}, ${pc132Display(interval[1])})</small></li>`;
  }).join("")}</ol>`;
}

function pc132RenderReconstruction(state, copy) {
  const reconstruction = state.reconstruction;
  const activeLink = reconstruction.activeLink
    ? `${reconstruction.activeLink.from} → ${reconstruction.activeLink.to} · ${JSON.stringify(reconstruction.activeLink.piece)}`
    : "—";
  return `<section class="pc132-card pc132-reconstruction"><header><div><h3>${pc132Escape(copy.reconstruction)}</h3><p>${pc132Escape(copy.reconstructionHelp)}</p></div><strong class="${reconstruction.complete ? "is-complete" : ""}">${pc132Escape(reconstruction.complete ? copy.complete : copy.incomplete)}</strong></header><div class="pc132-link-state"><span><small>${pc132Escape(copy.cursor)}</small><b>${pc132Escape(pc132Display(reconstruction.cursor))}</b></span><span><small>${pc132Escape(copy.activeLink)}</small><b>${pc132Escape(activeLink)}</b></span></div><div class="pc132-reconstruction-grid"><section><h4>${pc132Escape(copy.rightToLeft)}</h4>${pc132PieceList(reconstruction.reversedIntervals, reconstruction.reversedPieces, copy.emptyWitness, "is-rtl")}</section><section><h4>${pc132Escape(copy.ordered)}</h4>${pc132PieceList(reconstruction.orderedIntervals, reconstruction.orderedPieces, copy.emptyWitness, "is-ordered")}</section></div></section>`;
}

function pc132RenderResult(state, copy) {
  const current = state.cuts.values[state.n];
  if (!state.final) {
    return `<section class="pc132-current-result" role="status"><small>${pc132Escape(copy.currentResult)}</small><strong>${pc132Escape(pc132Display(current, "∞"))}</strong></section>`;
  }
  return `<section class="pc132-final" role="status" aria-live="polite"><div><small>${pc132Escape(copy.finalAnswer)}</small><strong>${pc132Escape(pc132Display(state.answer))}</strong></div><div><small>${pc132Escape(copy.finalPartition)}</small>${pc132PieceList(state.reconstruction.orderedIntervals, state.reconstruction.orderedPieces, copy.emptyWitness, "is-final")}</div></section>`;
}

function renderPalindromeCuts132View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = pc132Locale();
  const copy = PC132_TEXT[locale];
  const state = pc132Normalize(step);
  const timing = state.timing === "before" ? copy.before : copy.after;
  const summary = `${copy.region}. ${copy.line} ${state.sourceLine === null ? "—" : state.sourceLine}, ${state.event}.`;
  const note = state.note ? `<aside class="pc132-note"><strong>${pc132Escape(copy.note)}</strong><p>${pc132Escape(state.note)}</p></aside>` : "";

  host.innerHTML = `<article class="pc132-viz ${state.final ? "is-final" : ""}" role="region" aria-label="${pc132Escape(summary)}"><header class="pc132-header"><div><span>${pc132Escape(copy.kicker)}</span><h2>${pc132Escape(state.title)}</h2></div><div class="pc132-line-state"><strong>${pc132Escape(copy.line)} ${state.sourceLine === null ? "—" : state.sourceLine}</strong><span class="is-${state.timing}">${pc132Escape(timing)}</span><em>${pc132Escape(state.event.replace(/-/g, " "))}</em></div></header>${pc132RenderRail(state, copy, locale)}<section class="pc132-source-ribbon"><div><small>${pc132Escape(copy.source)}</small><code>${pc132Escape(pc132Equation(state, copy))}</code></div><dl><div><dt>${pc132Escape(copy.input)}</dt><dd>${pc132Escape(state.s)}</dd></div><div><dt>${pc132Escape(copy.phase)}</dt><dd>${pc132Escape(state.phase)}</dd></div></dl></section><div class="pc132-main">${pc132RenderPalindrome(state, copy)}<div class="pc132-side">${pc132RenderCuts(state, copy)}${pc132RenderCandidate(state, copy)}</div></div>${pc132RenderReconstruction(state, copy)}${note}${pc132RenderResult(state, copy)}</article>`;
}
