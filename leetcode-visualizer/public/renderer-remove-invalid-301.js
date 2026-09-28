"use strict";

const RI301_SOURCE = Object.freeze([
  "class Solution:",
  "    def removeInvalidParentheses(self, s):",
  "        def is_valid(string):",
  "            count = 0",
  "            for ch in string:",
  "                if ch == '(': count += 1",
  "                elif ch == ')':",
  "                    count -= 1",
  "                    if count < 0: return False",
  "            return count == 0",
  "        level = {s}",
  "        while level:",
  "            valid = [x for x in level if is_valid(x)]",
  "            if valid: return valid",
  "            next_level = set()",
  "            for string in level:",
  "                for i in range(len(string)):",
  "                    if string[i] in '()':",
  "                        next_level.add(string[:i] + string[i+1:])",
  "            level = next_level",
  "        return ['']",
]);

const RI301_EVENTS = Object.freeze({
  "bind-class": { en: "Bind class", vi: "Liên kết lớp" },
  "bind-method": { en: "Bind method", vi: "Liên kết phương thức" },
  "bind-helper": { en: "Bind helper", vi: "Liên kết hàm phụ" },
  "balance-init": { en: "Initialize balance", vi: "Khởi tạo balance" },
  "character-select": { en: "Select character", vi: "Chọn ký tự" },
  "open-increment": { en: "Count open", vi: "Đếm ngoặc mở" },
  "open-check": { en: "Check open", vi: "Kiểm tra ngoặc mở" },
  "close-check": { en: "Check close", vi: "Kiểm tra ngoặc đóng" },
  "close-decrement": { en: "Count close", vi: "Đếm ngoặc đóng" },
  "negative-check": { en: "Check negative", vi: "Kiểm tra âm" },
  "early-return-invalid": { en: "Early invalid return", vi: "Trả không hợp lệ sớm" },
  "validation-result": { en: "Validation result", vi: "Kết quả kiểm tra" },
  "level-init": { en: "Initialize frontier", vi: "Khởi tạo frontier" },
  "while-check": { en: "Check frontier", vi: "Kiểm tra frontier" },
  "candidate-dispatch": { en: "Dispatch candidate", vi: "Gọi kiểm tra ứng viên" },
  "candidate-classified": { en: "Classify candidate", vi: "Phân loại ứng viên" },
  "level-no-valid": { en: "No valid candidate", vi: "Không có ứng viên hợp lệ" },
  "minimal-stop": { en: "Minimal BFS stop", vi: "Dừng BFS tối thiểu" },
  "next-level-init": { en: "Initialize next set", vi: "Khởi tạo set kế tiếp" },
  "parent-select": { en: "Select parent", vi: "Chọn chuỗi cha" },
  "index-select": { en: "Select index", vi: "Chọn index" },
  "removable-check": { en: "Parenthesis is removable", vi: "Có thể xóa dấu ngoặc" },
  "letter-skip": { en: "Skip letter", vi: "Bỏ qua chữ" },
  "deletion-inserted": { en: "Insert deletion", vi: "Chèn phép xóa" },
  "deletion-duplicate": { en: "Duplicate deletion", vi: "Phép xóa trùng" },
  "level-promote": { en: "Promote next level", vi: "Chuyển mức kế tiếp" },
  "defensive-return": { en: "Defensive return", vi: "Trả về phòng thủ" },
});

const RI301_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Remove Invalid Parentheses line-by-line BFS visualization",
    kicker: "LEETCODE 301 · EXACT BFS",
    fallbackTitle: "Remove Invalid Parentheses",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    sourceRail: "Exact 21-line source rail",
    sourceAction: "Current source action",
    phase: "Phase",
    event: "Event",
    condition: "Condition",
    noCondition: "No condition on this frame.",
    trueValue: "TRUE",
    falseValue: "FALSE",
    currentFrontier: "Current frontier",
    nextFrontier: "Next frontier",
    depth: "removal depth",
    processed: "processed",
    emptyFrontier: "No candidates in this lane.",
    pending: "PENDING",
    scanning: "SCANNING",
    valid: "VALID",
    invalid: "INVALID",
    candidateScan: "Indexed character scan",
    balanceTrace: "Balance trace",
    candidate: "candidate",
    index: "index",
    character: "character",
    decision: "decision",
    balanceBefore: "before",
    balanceAfter: "after",
    firstNegative: "first negative",
    unmatchedOpens: "unmatched opens",
    validity: "validity",
    unknown: "UNKNOWN",
    notReached: "not reached",
    emptyString: "empty string",
    removal: "Deletion attempt",
    removalHelp: "Letters are shown but never struck or removed.",
    parent: "PARENT",
    child: "CHILD",
    removeAt: "REMOVE",
    waitingChild: "No child is attempted on this frame.",
    inserted: "INSERTED",
    duplicate: "DUPLICATE",
    origins: "Origins for this child",
    noOrigins: "No deletion origin yet.",
    attempts: "ATTEMPTS",
    unique: "UNIQUE",
    duplicates: "DUPLICATES",
    minimality: "BFS minimality proof",
    searching: "No minimal stop has been proven yet.",
    proved: "MINIMUM PROVED",
    provedDetail: "Every shallower level had no valid candidate, and this whole level was scanned. No deeper level is generated.",
    defensive: "DEFENSIVE SOURCE FALLBACK",
    validResults: "Valid results at this level",
    noValidResults: "No completed valid result at this level yet.",
    finalAnswers: "All final answers",
    note: "Why this frame matters",
  }),
  vi: Object.freeze({
    region: "Trực quan BFS từng dòng cho Xóa dấu ngoặc không hợp lệ",
    kicker: "LEETCODE 301 · BFS CHÍNH XÁC",
    fallbackTitle: "Xóa dấu ngoặc không hợp lệ",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    sourceRail: "Thanh mã nguồn chính xác 21 dòng",
    sourceAction: "Hành động mã nguồn hiện tại",
    phase: "Giai đoạn",
    event: "Sự kiện",
    condition: "Điều kiện",
    noCondition: "Frame này không có điều kiện.",
    trueValue: "ĐÚNG",
    falseValue: "SAI",
    currentFrontier: "Frontier hiện tại",
    nextFrontier: "Frontier kế tiếp",
    depth: "độ sâu xóa",
    processed: "đã xử lý",
    emptyFrontier: "Lane này chưa có ứng viên.",
    pending: "CHỜ",
    scanning: "ĐANG QUÉT",
    valid: "HỢP LỆ",
    invalid: "KHÔNG HỢP LỆ",
    candidateScan: "Dải ký tự có index",
    balanceTrace: "Dấu vết balance",
    candidate: "ứng viên",
    index: "index",
    character: "ký tự",
    decision: "quyết định",
    balanceBefore: "trước",
    balanceAfter: "sau",
    firstNegative: "âm lần đầu",
    unmatchedOpens: "ngoặc mở chưa ghép",
    validity: "tính hợp lệ",
    unknown: "CHƯA BIẾT",
    notReached: "chưa xảy ra",
    emptyString: "chuỗi rỗng",
    removal: "Lần thử xóa",
    removalHelp: "Chữ cái vẫn hiển thị nhưng không bao giờ bị gạch hoặc xóa.",
    parent: "CHA",
    child: "CON",
    removeAt: "XÓA",
    waitingChild: "Frame này chưa thử tạo chuỗi con.",
    inserted: "ĐÃ CHÈN",
    duplicate: "TRÙNG",
    origins: "Các nguồn tạo chuỗi con này",
    noOrigins: "Chưa có nguồn phép xóa.",
    attempts: "LẦN THỬ",
    unique: "PHÂN BIỆT",
    duplicates: "TRÙNG",
    minimality: "Chứng minh tối thiểu BFS",
    searching: "Chưa chứng minh điểm dừng tối thiểu.",
    proved: "ĐÃ CHỨNG MINH TỐI THIỂU",
    provedDetail: "Mọi mức nông hơn đều không hợp lệ và toàn bộ mức này đã được quét. Không sinh mức sâu hơn.",
    defensive: "FALLBACK NGUỒN PHÒNG THỦ",
    validResults: "Kết quả hợp lệ ở mức này",
    noValidResults: "Mức này chưa có kết quả hợp lệ đã kiểm tra xong.",
    finalAnswers: "Tất cả đáp án cuối",
    note: "Ý nghĩa của frame này",
  }),
});

function ri301Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ri301Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function ri301CleanText(value, fallback = "", maximum = 500) {
  if (typeof value !== "string") return fallback;
  const text = value.slice(0, maximum).trim();
  return /^(?:undefined|null|nan|[+-]?infinity)$/i.test(text) ? fallback : text;
}

function ri301Localized(value, locale, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return ri301CleanText(value[locale], ri301CleanText(value.en, ri301CleanText(value.vi, fallback)));
  }
  return ri301CleanText(value, fallback);
}

function ri301SafeInteger(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function ri301Candidate(value, nullable = true) {
  if (value === null && nullable) return null;
  return typeof value === "string" && value.length <= 14 && /^[a-z()]*$/.test(value)
    ? value
    : nullable ? null : "";
}

function ri301CandidateList(value) {
  if (!Array.isArray(value)) return [];
  const unique = new Set();
  value.slice(0, 16384).forEach((item) => {
    const candidate = ri301Candidate(item);
    if (candidate !== null) unique.add(candidate);
  });
  return [...unique].sort();
}

function ri301Normalize(step) {
  const raw = step && step.removeInvalid301View && typeof step.removeInvalid301View === "object"
    ? step.removeInvalid301View
    : {};
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = ri301SafeInteger(sourceRaw.line, 1, 21) ?? ri301SafeInteger(fallbackLine, 1, 21) ?? 1;
  const event = Object.prototype.hasOwnProperty.call(RI301_EVENTS, raw.event) ? raw.event : "bind-class";
  const phase = ["setup", "validate", "level", "generate", "done"].includes(raw.phase) ? raw.phase : "setup";
  const timing = raw.timing === "before" ? "before" : "after";
  const inputRaw = raw.input && typeof raw.input === "object" ? raw.input : {};
  const inputValue = typeof inputRaw.value === "string" && inputRaw.value.length <= 14 && /^[a-z()]*$/.test(inputRaw.value)
    ? inputRaw.value
    : "";
  const bfsRaw = raw.bfs && typeof raw.bfs === "object" ? raw.bfs : {};
  const frontierByValue = new Map();
  if (Array.isArray(bfsRaw.frontier)) {
    bfsRaw.frontier.slice(0, 16384).forEach((item) => {
      if (!item || typeof item !== "object") return;
      const value = ri301Candidate(item.value);
      if (value === null || frontierByValue.has(value)) return;
      const status = ["pending", "scanning", "valid", "invalid"].includes(item.status) ? item.status : "pending";
      frontierByValue.set(value, status);
    });
  }
  const frontier = [...frontierByValue].sort(([left], [right]) => left.localeCompare(right)).map(([value, status]) => ({ value, status }));
  const currentCandidateRaw = ri301Candidate(bfsRaw.currentCandidate);
  const currentCandidate = currentCandidateRaw !== null && frontierByValue.has(currentCandidateRaw) ? currentCandidateRaw : null;
  const nextFrontier = ri301CandidateList(bfsRaw.nextFrontier);
  const depth = ri301SafeInteger(bfsRaw.depth, 0, 14) ?? 0;
  const processedCount = ri301SafeInteger(bfsRaw.processedCount, 0, frontier.length) ?? 0;
  const generatedCount = ri301SafeInteger(bfsRaw.generatedCount, 0, 229376) ?? 0;
  const uniqueCount = ri301SafeInteger(bfsRaw.uniqueCount, 0, 16384) ?? nextFrontier.length;
  const duplicateCount = ri301SafeInteger(bfsRaw.duplicateCount, 0, generatedCount) ?? Math.max(0, generatedCount - uniqueCount);

  const scanRaw = raw.scan && typeof raw.scan === "object" ? raw.scan : {};
  const scanCandidate = ri301Candidate(scanRaw.candidate);
  const scanIndex = scanCandidate === null ? null : ri301SafeInteger(scanRaw.index, 0, Math.max(0, scanCandidate.length - 1));
  const scanChar = typeof scanRaw.char === "string" && scanRaw.char.length === 1 && /^[a-z()]$/.test(scanRaw.char)
    ? scanRaw.char
    : null;
  const balanceBefore = ri301SafeInteger(scanRaw.balanceBefore, -14, 14);
  const balanceAfter = ri301SafeInteger(scanRaw.balanceAfter, -14, 14);
  const firstNegativeIndex = scanCandidate === null ? null : ri301SafeInteger(scanRaw.firstNegativeIndex, 0, Math.max(0, scanCandidate.length - 1));
  const unmatchedOpens = ri301SafeInteger(scanRaw.unmatchedOpens, 0, 14);
  const scanValid = typeof scanRaw.valid === "boolean" ? scanRaw.valid : null;

  const removalRaw = raw.removal && typeof raw.removal === "object" ? raw.removal : {};
  const parent = ri301Candidate(removalRaw.parent);
  const removalIndex = parent === null ? null : ri301SafeInteger(removalRaw.index, 0, Math.max(0, parent.length - 1));
  const removalChar = removalIndex === null ? null : parent[removalIndex];
  const child = ri301Candidate(removalRaw.child);
  const removable = typeof removalRaw.removable === "boolean" ? removalRaw.removable : null;
  const duplicate = typeof removalRaw.duplicate === "boolean" ? removalRaw.duplicate : null;
  const origins = Array.isArray(removalRaw.origins) ? removalRaw.origins.slice(0, 196).map((origin) => {
    const source = origin && typeof origin === "object" ? origin : {};
    const originParent = ri301Candidate(source.parent);
    const originIndex = originParent === null ? null : ri301SafeInteger(source.index, 0, Math.max(0, originParent.length - 1));
    return originIndex === null ? null : {
      parent: originParent,
      index: originIndex,
      char: originParent[originIndex],
    };
  }).filter(Boolean) : [];

  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};
  const validResults = ri301CandidateList(raw.validResults);
  const finalAnswers = ri301CandidateList(raw.finalAnswers);
  const minimalDepth = ri301SafeInteger(raw.minimalDepth, 0, 14);
  const proofRaw = raw.stopProof && typeof raw.stopProof === "object" ? raw.stopProof : null;
  const stopProof = proofRaw && ["first-valid-bfs-level", "defensive-exhaustion"].includes(proofRaw.kind) ? {
    kind: proofRaw.kind,
    firstValidLevel: ri301SafeInteger(proofRaw.firstValidLevel, 0, 14),
    earlierInvalidDepths: Array.isArray(proofRaw.earlierInvalidDepths)
      ? proofRaw.earlierInvalidDepths.slice(0, 15).map((item) => ri301SafeInteger(item, 0, 14)).filter((item) => item !== null)
      : [],
    earlierLevelsHadNoValid: proofRaw.earlierLevelsHadNoValid === true,
    currentLevelFullyScanned: proofRaw.currentLevelFullyScanned === true,
    allCurrentValidReturned: proofRaw.allCurrentValidReturned === true,
    generationSkipped: proofRaw.generationSkipped === true,
  } : null;
  const locale = ri301Locale();

  return {
    source: { line: sourceLine, text: RI301_SOURCE[sourceLine - 1] },
    event,
    phase,
    timing,
    condition: {
      expression: ri301CleanText(conditionRaw.expression, "", 120),
      result: typeof conditionRaw.result === "boolean" ? conditionRaw.result : null,
    },
    input: {
      value: inputValue,
      chars: [...inputValue].map((char, index) => ({ index, char })),
    },
    bfs: {
      depth,
      frontier,
      currentCandidate,
      currentCandidateIndex: currentCandidate === null ? null : frontier.findIndex((item) => item.value === currentCandidate),
      processedCount,
      nextFrontier,
      generatedCount,
      uniqueCount,
      duplicateCount,
    },
    scan: {
      candidate: scanCandidate,
      index: scanIndex,
      char: scanChar,
      balanceBefore,
      balanceAfter,
      decision: ri301CleanText(scanRaw.decision, "idle", 80),
      firstNegativeIndex,
      unmatchedOpens,
      valid: scanValid,
    },
    removal: { parent, index: removalIndex, char: removalChar, child, removable, duplicate, origins },
    validResults,
    minimalDepth,
    stopProof,
    finalAnswers,
    final: raw.final === true || Boolean(step && step.final),
    title: ri301Localized(step && step.title, locale, RI301_TEXT[locale].fallbackTitle),
    note: ri301Localized(step && step.note, locale, ""),
  };
}

function ri301Quote(value) {
  return value === "" ? '""' : JSON.stringify(value);
}

function ri301RenderRail(state, copy) {
  const items = RI301_SOURCE.map((source, index) => {
    const line = index + 1;
    const current = line === state.source.line;
    return `<li class="ri301-rail-item ${current ? "ri301-is-current" : ""}"${current ? ' aria-current="step"' : ""}><small>L${line}</small><code>${ri301Escape(source)}</code></li>`;
  }).join("");
  return `<nav class="ri301-rail-wrap" aria-label="${ri301Escape(copy.sourceRail)}"><ol class="ri301-source-rail" role="list">${items}</ol></nav>`;
}

function ri301RenderSource(state, copy, locale) {
  const eventLabel = RI301_EVENTS[state.event][locale];
  const condition = state.condition.result === null
    ? copy.noCondition
    : `${state.condition.expression || copy.condition} → ${state.condition.result ? copy.trueValue : copy.falseValue}`;
  return `<section class="ri301-source-card" aria-labelledby="ri301-source-title"><div class="ri301-source-expression"><small id="ri301-source-title">${ri301Escape(copy.sourceAction)}</small><code>${ri301Escape(state.source.text)}</code></div><dl class="ri301-source-facts"><div><dt>${ri301Escape(copy.phase)}</dt><dd>${ri301Escape(state.phase)}</dd></div><div><dt>${ri301Escape(copy.event)}</dt><dd>${ri301Escape(eventLabel)}</dd></div><div><dt>${ri301Escape(copy.condition)}</dt><dd class="ri301-condition-${state.condition.result === null ? "none" : state.condition.result ? "true" : "false"}">${ri301Escape(condition)}</dd></div></dl></section>`;
}

function ri301StatusLabel(status, copy) {
  return copy[status] || copy.pending;
}

function ri301RenderCandidateChip(candidate, copy, current) {
  const aria = `${ri301Quote(candidate.value)}, ${ri301StatusLabel(candidate.status, copy)}`;
  return `<li class="ri301-candidate ri301-status-${candidate.status} ${current ? "ri301-is-current" : ""}"${current ? ' aria-current="step"' : ""} aria-label="${ri301Escape(aria)}"><code>${ri301Escape(ri301Quote(candidate.value))}</code><small>${ri301Escape(ri301StatusLabel(candidate.status, copy))}</small></li>`;
}

function ri301RenderLane(items, copy, currentCandidate, isNext) {
  if (!items.length) return `<div class="ri301-empty">${ri301Escape(copy.emptyFrontier)}</div>`;
  const candidates = isNext
    ? items.map((value) => ({ value, status: "pending" }))
    : items;
  return `<div class="ri301-lane-scroll"><ol class="ri301-candidate-list" role="list">${candidates.map((candidate) => ri301RenderCandidateChip(candidate, copy, !isNext && candidate.value === currentCandidate)).join("")}</ol></div>`;
}

function ri301RenderFrontiers(state, copy) {
  return `<section class="ri301-frontiers" aria-label="${ri301Escape(copy.currentFrontier)}"><article class="ri301-card ri301-frontier-current"><header><div><small>${ri301Escape(copy.depth)} ${state.bfs.depth}</small><h3>${ri301Escape(copy.currentFrontier)}</h3></div><strong>${state.bfs.processedCount}/${state.bfs.frontier.length} ${ri301Escape(copy.processed)}</strong></header>${ri301RenderLane(state.bfs.frontier, copy, state.bfs.currentCandidate, false)}</article><article class="ri301-card ri301-frontier-next"><header><div><small>${ri301Escape(copy.depth)} ${state.bfs.depth + 1}</small><h3>${ri301Escape(copy.nextFrontier)}</h3></div><strong>${state.bfs.nextFrontier.length}</strong></header>${ri301RenderLane(state.bfs.nextFrontier, copy, null, true)}</article></section>`;
}

function ri301RenderCharacters(candidate, activeIndex, copy) {
  if (candidate === "") return `<div class="ri301-empty-string"><code>""</code><span>${ri301Escape(copy.emptyString)}</span></div>`;
  const items = [...candidate].map((char, index) => {
    const active = index === activeIndex;
    return `<li class="ri301-char ${active ? "ri301-is-active" : ""}"${active ? ' aria-current="step"' : ""}><small>${index}</small><strong>${ri301Escape(char)}</strong></li>`;
  }).join("");
  return `<div class="ri301-char-scroll"><ol class="ri301-char-strip" role="list">${items}</ol></div>`;
}

function ri301Value(value, fallback) {
  return value === null ? fallback : String(value);
}

function ri301RenderScan(state, copy) {
  const candidate = state.scan.candidate !== null
    ? state.scan.candidate
    : state.bfs.currentCandidate !== null ? state.bfs.currentCandidate : state.input.value;
  const validity = state.scan.valid === null ? copy.unknown : state.scan.valid ? copy.valid : copy.invalid;
  const validityClass = state.scan.valid === null ? "unknown" : state.scan.valid ? "valid" : "invalid";
  return `<section class="ri301-card ri301-scan" aria-labelledby="ri301-scan-title"><header><div><small>${ri301Escape(copy.candidate)} ${ri301Escape(ri301Quote(candidate))}</small><h3 id="ri301-scan-title">${ri301Escape(copy.candidateScan)}</h3></div><span class="ri301-validity ri301-validity-${validityClass}" aria-live="polite">${ri301Escape(validity)}</span></header>${ri301RenderCharacters(candidate, state.scan.index, copy)}<div class="ri301-balance-panel"><div class="ri301-balance-flow" aria-label="${ri301Escape(copy.balanceTrace)}"><span><small>${ri301Escape(copy.balanceBefore)}</small><strong>${ri301Escape(ri301Value(state.scan.balanceBefore, "—"))}</strong></span><b aria-hidden="true">→</b><span><small>${ri301Escape(copy.balanceAfter)}</small><strong>${ri301Escape(ri301Value(state.scan.balanceAfter, "—"))}</strong></span></div><dl><div><dt>${ri301Escape(copy.index)}</dt><dd>${ri301Escape(ri301Value(state.scan.index, "—"))}</dd></div><div><dt>${ri301Escape(copy.character)}</dt><dd>${ri301Escape(state.scan.char === null ? "—" : state.scan.char)}</dd></div><div><dt>${ri301Escape(copy.decision)}</dt><dd>${ri301Escape(state.scan.decision)}</dd></div><div><dt>${ri301Escape(copy.firstNegative)}</dt><dd>${ri301Escape(ri301Value(state.scan.firstNegativeIndex, copy.notReached))}</dd></div><div><dt>${ri301Escape(copy.unmatchedOpens)}</dt><dd>${ri301Escape(ri301Value(state.scan.unmatchedOpens, copy.unknown))}</dd></div></dl></div></section>`;
}

function ri301RenderParent(parent, index, strike, copy) {
  if (parent === "") return `<span class="ri301-string-token"><code>""</code><small>${ri301Escape(copy.emptyString)}</small></span>`;
  const chars = [...parent].map((char, charIndex) => {
    const active = charIndex === index;
    const content = strike && active ? `<del>${ri301Escape(char)}</del>` : ri301Escape(char);
    return `<span class="${active ? "ri301-is-target" : ""}"><small>${charIndex}</small><b>${content}</b></span>`;
  }).join("");
  return `<span class="ri301-string-token">${chars}</span>`;
}

function ri301RenderRemoval(state, copy) {
  const removal = state.removal;
  const attempted = removal.child !== null && removal.duplicate !== null;
  const badge = removal.duplicate === null
    ? ""
    : `<strong class="ri301-removal-badge ri301-is-${removal.duplicate ? "duplicate" : "inserted"}">${ri301Escape(removal.duplicate ? copy.duplicate : copy.inserted)}</strong>`;
  let body = `<p class="ri301-removal-wait">${ri301Escape(copy.waitingChild)}</p>`;
  if (removal.parent !== null) {
    const strike = attempted && removal.removable === true;
    const middle = removal.index === null
      ? "—"
      : `${copy.removeAt} [${removal.index}] ${removal.char === null ? "" : ri301Quote(removal.char)}`;
    const child = removal.child === null
      ? `<span class="ri301-child-pending">${ri301Escape(copy.waitingChild)}</span>`
      : `<code>${ri301Escape(ri301Quote(removal.child))}</code>`;
    body = `<div class="ri301-removal-flow"><div><small>${ri301Escape(copy.parent)}</small>${ri301RenderParent(removal.parent, removal.index, strike, copy)}</div><span class="ri301-flow-arrow" aria-hidden="true">→</span><div class="ri301-remove-token"><small>${ri301Escape(middle)}</small>${badge}</div><span class="ri301-flow-arrow" aria-hidden="true">→</span><div class="ri301-child-token"><small>${ri301Escape(copy.child)}</small>${child}</div></div>`;
  }
  const origins = removal.origins.length
    ? `<ol class="ri301-origin-list" role="list">${removal.origins.map((origin) => `<li><code>${ri301Escape(ri301Quote(origin.parent))}</code><span>[${origin.index}] ${ri301Escape(ri301Quote(origin.char))}</span></li>`).join("")}</ol>`
    : `<p class="ri301-no-origins">${ri301Escape(copy.noOrigins)}</p>`;
  return `<section class="ri301-card ri301-removal" aria-labelledby="ri301-removal-title"><header><div><h3 id="ri301-removal-title">${ri301Escape(copy.removal)}</h3><p>${ri301Escape(copy.removalHelp)}</p></div><div class="ri301-counts"><span><small>${ri301Escape(copy.attempts)}</small><strong>${state.bfs.generatedCount}</strong></span><span><small>${ri301Escape(copy.unique)}</small><strong>${state.bfs.uniqueCount}</strong></span><span><small>${ri301Escape(copy.duplicates)}</small><strong>${state.bfs.duplicateCount}</strong></span></div></header>${body}<div class="ri301-origins"><h4>${ri301Escape(copy.origins)}</h4>${origins}</div></section>`;
}

function ri301RenderResultList(values, copy, emptyText) {
  if (!values.length) return `<p class="ri301-no-results">${ri301Escape(emptyText)}</p>`;
  return `<ol class="ri301-result-list" role="list">${values.map((value) => `<li><code>${ri301Escape(ri301Quote(value))}</code></li>`).join("")}</ol>`;
}

function ri301RenderMinimality(state, copy) {
  const proof = state.stopProof;
  const proved = proof && proof.kind === "first-valid-bfs-level" && state.minimalDepth !== null;
  const defensive = proof && proof.kind === "defensive-exhaustion";
  const status = proved ? copy.proved : defensive ? copy.defensive : copy.searching;
  const detail = proved ? copy.provedDetail : copy.searching;
  const answers = state.finalAnswers.length ? state.finalAnswers : state.validResults;
  return `<section class="ri301-card ri301-minimality ri301-proof-${proved ? "proved" : defensive ? "defensive" : "searching"}" aria-labelledby="ri301-proof-title" aria-live="polite"><header><div><small>${ri301Escape(copy.minimality)}</small><h3 id="ri301-proof-title">${ri301Escape(status)}</h3></div>${state.minimalDepth === null ? "" : `<strong>${ri301Escape(copy.depth)} ${state.minimalDepth}</strong>`}</header><p>${ri301Escape(detail)}</p><div class="ri301-results-grid"><div><h4>${ri301Escape(copy.validResults)}</h4>${ri301RenderResultList(state.validResults, copy, copy.noValidResults)}</div><div><h4>${ri301Escape(copy.finalAnswers)}</h4>${ri301RenderResultList(answers, copy, copy.noValidResults)}</div></div></section>`;
}

function renderRemoveInvalidParentheses301View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = ri301Locale();
  const copy = RI301_TEXT[locale];
  const state = ri301Normalize(step);
  const eventLabel = RI301_EVENTS[state.event][locale];
  const timingLabel = state.timing === "before" ? copy.before : copy.after;
  const summary = `${copy.region}. ${copy.line} ${state.source.line}. ${eventLabel}.`;
  const note = state.note
    ? `<aside class="ri301-note"><strong>${ri301Escape(copy.note)}</strong><p>${ri301Escape(state.note)}</p></aside>`
    : "";
  host.innerHTML = `<article class="ri301-viz ri301-phase-${state.phase} ${state.final ? "ri301-is-final" : ""}" role="region" aria-label="${ri301Escape(summary)}"><header class="ri301-header"><div><span>${ri301Escape(copy.kicker)}</span><h2>${ri301Escape(state.title)}</h2></div><div class="ri301-line-state"><strong>${ri301Escape(copy.line)} ${state.source.line}</strong><span class="ri301-timing-${state.timing}">${ri301Escape(timingLabel)}</span><em>${ri301Escape(eventLabel)}</em></div></header>${ri301RenderRail(state, copy)}${ri301RenderSource(state, copy, locale)}${ri301RenderFrontiers(state, copy)}<div class="ri301-analysis-grid">${ri301RenderScan(state, copy)}${ri301RenderMinimality(state, copy)}</div>${ri301RenderRemoval(state, copy)}${note}</article>`;
}
