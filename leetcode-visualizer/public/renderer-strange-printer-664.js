"use strict";

const SP664_MAX_LENGTH = 12;
const SP664_SOURCE = Object.freeze([
  "class Solution:",
  "    def strangePrinter(self, s):",
  "        n = len(s)",
  "        dp = [[0]*n for _ in range(n)]",
  "        for i in range(n-1, -1, -1):",
  "            dp[i][i] = 1",
  "            for j in range(i+1, n):",
  "                dp[i][j] = dp[i][j-1] + 1",
  "                for k in range(i, j):",
  "                    if s[k] == s[j]:",
  "                        dp[i][j] = min(dp[i][j], dp[i][k] + (dp[k+1][j-1] if k+1 <= j-1 else 0))",
  "        return dp[0][n-1] if n else 0",
]);
const SP664_LINE_EVENTS = Object.freeze([
  "bind-class", "bind-method", "set-length", "allocate-dp", "i-loop-true", "write-diagonal",
  "j-loop-true", "write-baseline", "k-loop-true", "match-condition-true", "merge-candidate-improve", "final-return",
]);
const SP664_LINE_ACTIONS = Object.freeze([
  ["Define Solution", "Định nghĩa Solution"],
  ["Define strangePrinter", "Định nghĩa strangePrinter"],
  ["Read string length", "Đọc độ dài chuỗi"],
  ["Allocate square DP", "Cấp phát DP vuông"],
  ["Move i downward", "Duyệt i giảm dần"],
  ["Seed one-character interval", "Khởi tạo đoạn một ký tự"],
  ["Extend interval with j", "Mở rộng đoạn bằng j"],
  ["Commit separate-turn baseline", "Ghi baseline bằng lượt riêng"],
  ["Try merge point k", "Thử điểm gộp k"],
  ["Check matching characters", "Kiểm tra ký tự trùng"],
  ["Compare merge recurrence", "So sánh công thức gộp"],
  ["Return root interval", "Trả về đoạn gốc"],
]);
const SP664_EVENTS = Object.freeze({
  "bind-class": ["Bind Solution class", "Liên kết lớp Solution"],
  "bind-method": ["Bind strangePrinter method", "Liên kết method strangePrinter"],
  "set-length": ["Set input length", "Đặt độ dài input"],
  "allocate-dp": ["Allocate DP, mask, and choices", "Cấp phát DP, mask và lựa chọn"],
  "i-loop-true": ["Start descending i row", "Bắt đầu hàng i giảm dần"],
  "i-loop-false": ["Complete the i loop", "Hoàn tất vòng i"],
  "write-diagonal": ["Write diagonal base case", "Ghi trường hợp cơ sở đường chéo"],
  "j-loop-true": ["Open interval ending at j", "Mở đoạn kết thúc tại j"],
  "j-loop-false": ["Complete the current row", "Hoàn tất hàng hiện tại"],
  "write-baseline": ["Write separate-turn baseline", "Ghi baseline bằng lượt riêng"],
  "k-loop-true": ["Try merge index k", "Thử index gộp k"],
  "k-loop-false": ["Complete merge candidates", "Hoàn tất các ứng viên gộp"],
  "match-condition-true": ["Characters match", "Các ký tự trùng nhau"],
  "match-condition-false": ["Characters do not match", "Các ký tự không trùng"],
  "merge-candidate-improve": ["Candidate strictly improves", "Ứng viên cải thiện nghiêm ngặt"],
  "merge-candidate-tie": ["Candidate ties incumbent", "Ứng viên hòa incumbent"],
  "merge-candidate-worse": ["Candidate is worse", "Ứng viên kém hơn"],
  "final-return": ["Return answer and witness", "Trả đáp án và witness"],
});
const SP664_PHASES = Object.freeze({
  setup: ["setup", "khởi tạo"],
  fill: ["fill intervals", "điền các đoạn"],
  candidate: ["evaluate candidate", "đánh giá ứng viên"],
  done: ["complete", "hoàn tất"],
});
const SP664_OUTCOMES = Object.freeze({
  idle: ["waiting", "đang chờ"],
  "i-loop": ["row selected", "đã chọn hàng"],
  diagonal: ["base case", "trường hợp cơ sở"],
  "j-loop": ["interval opened", "đã mở đoạn"],
  baseline: ["baseline committed", "đã ghi baseline"],
  "k-loop": ["merge point selected", "đã chọn điểm gộp"],
  "condition-true": ["match: candidate follows", "trùng: sẽ tính ứng viên"],
  "condition-false": ["mismatch: skip candidate", "không trùng: bỏ ứng viên"],
  improve: ["IMPROVE", "CẢI THIỆN"],
  tie: ["TIE · KEEP INCUMBENT", "HÒA · GIỮ INCUMBENT"],
  worse: ["WORSE · KEEP INCUMBENT", "KÉM HƠN · GIỮ INCUMBENT"],
  "k-loop-complete": ["choice committed", "đã chốt lựa chọn"],
  "j-loop-complete": ["row complete", "hoàn tất hàng"],
  "i-loop-complete": ["table complete", "hoàn tất bảng"],
  final: ["answer verified", "đã xác minh đáp án"],
});
const SP664_COUNTERS = Object.freeze([
  ["frames", "Frames", "Frame"],
  ["iLoopTrue", "i entries", "Lần vào i"],
  ["iLoopFalse", "i exits", "Lần thoát i"],
  ["jLoopTrue", "j entries", "Lần vào j"],
  ["jLoopFalse", "j exits", "Lần thoát j"],
  ["kLoopTrue", "k entries", "Lần vào k"],
  ["kLoopFalse", "k exits", "Lần thoát k"],
  ["diagonalWrites", "Diagonal writes", "Lần ghi đường chéo"],
  ["baselineWrites", "Baseline writes", "Lần ghi baseline"],
  ["conditionChecks", "Match checks", "Lần kiểm tra trùng"],
  ["matches", "Matches", "Lần trùng"],
  ["mismatches", "Mismatches", "Lần không trùng"],
  ["mergeCandidates", "Merge candidates", "Ứng viên gộp"],
  ["improvements", "Improvements", "Lần cải thiện"],
  ["ties", "Ties", "Lần hòa"],
  ["worse", "Worse candidates", "Ứng viên kém hơn"],
  ["dpWrites", "DP assignments", "Phép gán DP"],
  ["choiceWrites", "Choice writes", "Lần ghi choice"],
  ["witnessTurns", "Witness turns", "Lượt witness"],
]);
const SP664_INVARIANTS = Object.freeze([
  ["tablesAreSquare", "DP, mask, and choice tables are square", "Bảng DP, mask và choice đều vuông"],
  ["lowerTriangleUnused", "Lower triangle remains unused", "Tam giác dưới không được sử dụng"],
  ["uncomputedCellsAreZero", "Uncomputed storage remains zero", "Ô chưa tính vẫn lưu 0"],
  ["computedMaskMatchesChoices", "Computed mask matches available choices", "Mask computed khớp các choice hiện có"],
  ["choiceValuesMatchDp", "Every choice value matches its DP cell", "Mọi giá trị choice khớp ô DP"],
  ["activeCellComputed", "Active interval is computed", "Đoạn hiện tại đã được tính"],
  ["dependenciesComputed", "Every nonempty dependency is ready", "Mọi phụ thuộc không rỗng đã sẵn sàng"],
  ["strictTieKeptIncumbent", "A tie preserves the incumbent choice", "Tie giữ nguyên lựa chọn incumbent"],
  ["answerMatchesRoot", "Answer equals dp[0][n−1]", "Đáp án bằng dp[0][n−1]"],
  ["witnessValid", "Witness turn count and final canvas are valid", "Số lượt và canvas cuối của witness hợp lệ"],
]);
const SP664_TEXT = Object.freeze({
  en: Object.freeze({
    kicker: "LEETCODE 664 · INTERVAL DP", fallback: "Strange Printer", line: "LINE", before: "before execution", after: "after execution",
    rail: "Canonical 12-line source rail", sourceAction: "Current source action", phase: "Phase", event: "Runtime event", condition: "Condition", noCondition: "No condition on this frame.", yes: "TRUE", no: "FALSE",
    indexedInput: "Indexed input", inputHelp: "Cursors use original, uncompressed string indices.", length: "length", activeInterval: "active interval", noInterval: "none", cursors: "Cursors", outcome: "Outcome",
    dp: "Interval DP and reconstruction choices", dpHelp: "Only the computed mask reveals a value. Each computed cell also records its deterministic choice type.", allocated: "tables allocated", pendingAllocation: "allocation pending", rowColumn: "i \\ j",
    computed: "computed", uncomputed: "not computed", unused: "lower triangle", activeCell: "active dp[i][j]", dependencyCell: "dependency interval", cursorI: "i row", cursorJ: "j column", cursorK: "k column",
    single: "single", separate: "separate", merge: "merge", noChoice: "no choice", choiceAt: "choice", value: "value", formula: "formula", mergeIndex: "merge k", appended: "appended index", character: "character",
    transition: "Baseline, candidate, and incumbent", transitionHelp: "The baseline owns ties. A merge replaces the incumbent only when its value is strictly smaller.", baseline: "Baseline", candidate: "Candidate", incumbent: "Incumbent before compare", committed: "Committed choice", pending: "pending", unavailable: "not available on this frame",
    dependencies: "Recurrence dependencies", dependencyHelp: "Highlighted DP intervals are already computed; an adjacent merge has an explicit empty middle with cost 0.", empty: "empty interval", rolePrefix: "prefix", roleSingleton: "singleton", roleLeft: "left", roleMiddle: "middle",
    improveHelp: "The candidate is strictly smaller, so both the DP value and reconstruction choice change.", tieHelp: "The candidate is equal, so the incumbent and its earlier tie priority stay unchanged.", worseHelp: "The candidate is larger, so the incumbent stays unchanged.", baselineHelp: "The separate final turn establishes the incumbent and wins later ties.", defaultDecisionHelp: "Advance the exact source action; no merge comparison is committed on this frame.",
    witness: "Overwrite-turn canvas witness", witnessHelp: "Each turn paints one character across an inclusive interval and may overwrite earlier cells.", witnessPending: "The witness is reconstructed only after the root DP value is complete.", initialCanvas: "Initial blank canvas", target: "Target", finalCanvas: "Final canvas", turn: "Turn", overwrite: "overwrite", answer: "minimum turns", turns: "replayed turns", valid: "VALID", invalid: "INVALID", strategy: "Reconstruction strategy",
    invariants: "Trace invariants", invariantDefinition: "dp[i][j] is the minimum turns needed to print the exact substring s[i..j].", pass: "holds", fail: "failed", notApplicable: "not applicable yet",
    counters: "Operation counters", note: "Why this frame matters",
  }),
  vi: Object.freeze({
    kicker: "LEETCODE 664 · DP ĐOẠN", fallback: "Máy in kỳ lạ", line: "DÒNG", before: "trước khi chạy", after: "sau khi chạy",
    rail: "Thanh mã nguồn 12 dòng chuẩn", sourceAction: "Thao tác mã nguồn hiện tại", phase: "Giai đoạn", event: "Sự kiện runtime", condition: "Điều kiện", noCondition: "Frame này không có điều kiện.", yes: "ĐÚNG", no: "SAI",
    indexedInput: "Input có chỉ số", inputHelp: "Các con trỏ dùng index của chuỗi gốc, không nén.", length: "độ dài", activeInterval: "đoạn hiện tại", noInterval: "không có", cursors: "Con trỏ", outcome: "Kết quả",
    dp: "DP đoạn và lựa chọn tái dựng", dpHelp: "Chỉ mask computed cho biết ô đã có giá trị. Mỗi ô đã tính cũng lưu loại choice xác định.", allocated: "đã cấp phát bảng", pendingAllocation: "chờ cấp phát", rowColumn: "i \\ j",
    computed: "đã tính", uncomputed: "chưa tính", unused: "tam giác dưới", activeCell: "dp[i][j] hiện tại", dependencyCell: "đoạn phụ thuộc", cursorI: "hàng i", cursorJ: "cột j", cursorK: "cột k",
    single: "đơn", separate: "riêng", merge: "gộp", noChoice: "chưa có choice", choiceAt: "choice", value: "giá trị", formula: "công thức", mergeIndex: "k gộp", appended: "index nối thêm", character: "ký tự",
    transition: "Baseline, ứng viên và incumbent", transitionHelp: "Baseline thắng tie. Merge chỉ thay incumbent khi giá trị nhỏ hơn nghiêm ngặt.", baseline: "Baseline", candidate: "Ứng viên", incumbent: "Incumbent trước so sánh", committed: "Lựa chọn đã chốt", pending: "đang chờ", unavailable: "không có ở frame này",
    dependencies: "Các phụ thuộc của công thức", dependencyHelp: "Các đoạn DP được tô sáng đều đã tính; merge kề nhau có đoạn giữa rỗng với cost 0.", empty: "đoạn rỗng", rolePrefix: "prefix", roleSingleton: "ký tự đơn", roleLeft: "trái", roleMiddle: "giữa",
    improveHelp: "Ứng viên nhỏ hơn nghiêm ngặt nên cả giá trị DP và lựa chọn tái dựng đều thay đổi.", tieHelp: "Ứng viên bằng nhau nên incumbent và thứ tự ưu tiên tie trước đó được giữ nguyên.", worseHelp: "Ứng viên lớn hơn nên incumbent được giữ nguyên.", baselineHelp: "Lượt cuối riêng thiết lập incumbent và thắng mọi tie về sau.", defaultDecisionHelp: "Tiến theo đúng thao tác nguồn; frame này chưa chốt so sánh merge.",
    witness: "Witness canvas theo lượt ghi đè", witnessHelp: "Mỗi lượt tô một ký tự trên đoạn đóng và có thể ghi đè các ô trước đó.", witnessPending: "Witness chỉ được tái dựng sau khi hoàn tất giá trị DP gốc.", initialCanvas: "Canvas trống ban đầu", target: "Mục tiêu", finalCanvas: "Canvas cuối", turn: "Lượt", overwrite: "ghi đè", answer: "số lượt ít nhất", turns: "lượt phát lại", valid: "HỢP LỆ", invalid: "KHÔNG HỢP LỆ", strategy: "Chiến lược tái dựng",
    invariants: "Bất biến trace", invariantDefinition: "dp[i][j] là số lượt ít nhất để in đúng chuỗi con s[i..j].", pass: "đúng", fail: "sai", notApplicable: "chưa áp dụng",
    counters: "Bộ đếm thao tác", note: "Ý nghĩa của frame này",
  }),
});

function sp664Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function sp664Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}
function sp664Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}
function sp664BoundedText(value, maximum, fallback = "") {
  return typeof value === "string" ? value.slice(0, maximum) : fallback;
}
function sp664LocalizedText(value, locale, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return sp664BoundedText(value[locale] ?? value.en ?? value.vi, 500, fallback);
  }
  return sp664BoundedText(value, 500, fallback);
}
function sp664Character(value, fallback = "?") {
  if (typeof value !== "string" || value.length === 0) return fallback;
  return Array.from(value)[0] ?? fallback;
}
function sp664StrictInterval(value, n) {
  if (!Array.isArray(value) || value.length < 2) return null;
  const start = sp664Int(value[0], 0, n - 1);
  const end = sp664Int(value[1], 0, n - 1);
  return start !== null && end !== null && start <= end ? [start, end] : null;
}
function sp664Dependency(raw, n) {
  if (!raw || typeof raw !== "object") return null;
  const roles = ["prefix", "singleton", "left", "middle"];
  if (!roles.includes(raw.role)) return null;
  const sourceInterval = Array.isArray(raw.interval) ? raw.interval : [];
  const start = sp664Int(raw.start, 0, n) ?? sp664Int(sourceInterval[0], 0, n);
  const end = sp664Int(raw.end, -1, n - 1) ?? sp664Int(sourceInterval[1], -1, n - 1);
  const empty = raw.empty === true;
  if (start === null || end === null || (empty ? start <= end : start > end || start >= n)) return null;
  return {
    role: raw.role,
    interval: [start, end],
    start,
    end,
    value: sp664Int(raw.value, 0, SP664_MAX_LENGTH) ?? 0,
    empty,
  };
}
function sp664Dependencies(raw, n) {
  return Array.isArray(raw) ? raw.slice(0, 4).map((item) => sp664Dependency(item, n)).filter(Boolean) : [];
}
function sp664Choice(raw, n) {
  if (!raw || typeof raw !== "object" || !["single", "separate", "merge"].includes(raw.type)) return null;
  const value = sp664Int(raw.value, 0, SP664_MAX_LENGTH);
  if (value === null) return null;
  return {
    type: raw.type,
    value,
    char: sp664Character(raw.char),
    k: raw.type === "merge" ? sp664Int(raw.k, 0, n - 1) : null,
    dependencies: sp664Dependencies(raw.dependencies, n),
  };
}
function sp664NormalizeCanvas(raw, n) {
  return Array.from({ length: n }, (_, index) => {
    const value = Array.isArray(raw) ? raw[index] : null;
    return value === null || typeof value !== "string" || value.length === 0 ? null : sp664Character(value, null);
  });
}
function sp664NormalizeWitness(raw, n) {
  if (!raw || typeof raw !== "object") return null;
  const turns = Array.isArray(raw.turns) ? raw.turns.slice(0, SP664_MAX_LENGTH).flatMap((turn, index) => {
    if (!turn || typeof turn !== "object") return [];
    const sourceInterval = Array.isArray(turn.interval) ? turn.interval : [];
    const left = sp664Int(turn.left, 0, n - 1) ?? sp664Int(sourceInterval[0], 0, n - 1);
    const right = sp664Int(turn.right, 0, n - 1) ?? sp664Int(sourceInterval[1], 0, n - 1);
    if (left === null || right === null || left > right) return [];
    return [{
      turn: sp664Int(turn.turn, 1, SP664_MAX_LENGTH) ?? index + 1,
      char: sp664Character(turn.char),
      left,
      right,
      interval: [left, right],
      postCanvas: sp664NormalizeCanvas(turn.postCanvas, n),
    }];
  }) : [];
  return {
    strategy: sp664BoundedText(raw.strategy, 300, ""),
    rootInterval: sp664StrictInterval(raw.rootInterval, n) ?? [0, n - 1],
    initialCanvas: sp664NormalizeCanvas(raw.initialCanvas, n),
    turns,
    turnCount: sp664Int(raw.turnCount, 0, SP664_MAX_LENGTH) ?? turns.length,
    finalCells: sp664NormalizeCanvas(raw.finalCells, n),
    finalCanvas: sp664BoundedText(raw.finalCanvas, SP664_MAX_LENGTH * 2, ""),
    valid: raw.valid === true,
  };
}
function sp664Normalize(step) {
  const raw = step && step.strangePrinter664View && typeof step.strangePrinter664View === "object"
    ? step.strangePrinter664View
    : {};
  const inputRaw = raw.input && typeof raw.input === "object" ? raw.input : {};
  const rawCharacters = Array.from(sp664BoundedText(inputRaw.s, SP664_MAX_LENGTH * 2, "?"));
  const suggestedLength = Math.max(1, Math.min(SP664_MAX_LENGTH, rawCharacters.length));
  const n = sp664Int(inputRaw.length, 1, SP664_MAX_LENGTH) ?? suggestedLength;
  const characters = Array.from({ length: n }, (_, index) => rawCharacters[index] ?? "?");
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = sp664Int(sourceRaw.line, 1, SP664_SOURCE.length)
    ?? sp664Int(fallbackLine, 1, SP664_SOURCE.length)
    ?? 1;
  const event = Object.hasOwn(SP664_EVENTS, raw.event) ? raw.event : SP664_LINE_EVENTS[line - 1];
  const locale = sp664Locale();
  const cursorsRaw = raw.cursors && typeof raw.cursors === "object" ? raw.cursors : {};
  const interval = sp664StrictInterval(raw.interval, n);
  const matrix = (source, map) => Array.from({ length: n }, (_, row) => Array.from(
    { length: n },
    (_, column) => map(Array.isArray(source) && Array.isArray(source[row]) ? source[row][column] : null, row, column),
  ));
  const dp = matrix(raw.dp, (value) => sp664Int(value, 0, SP664_MAX_LENGTH) ?? 0);
  const computedMask = matrix(raw.computedMask, (value) => value === true);
  const choiceTable = matrix(raw.choiceTable, (value) => sp664Choice(value, n));
  const normalizeTransitionInterval = (value) => sp664StrictInterval(value, n) ?? interval;
  const baselineRaw = raw.baseline && typeof raw.baseline === "object" ? raw.baseline : null;
  const baseline = baselineRaw ? {
    interval: normalizeTransitionInterval(baselineRaw.interval),
    value: sp664Int(baselineRaw.value, 0, SP664_MAX_LENGTH),
    prefixValue: sp664Int(baselineRaw.prefixValue, 0, SP664_MAX_LENGTH),
    appendedIndex: sp664Int(baselineRaw.appendedIndex, 0, n - 1),
    appendedChar: sp664Character(baselineRaw.appendedChar),
    formula: sp664BoundedText(baselineRaw.formula, 180, ""),
  } : null;
  const candidateRaw = raw.candidate && typeof raw.candidate === "object" ? raw.candidate : null;
  const candidate = candidateRaw ? {
    interval: normalizeTransitionInterval(candidateRaw.interval),
    k: sp664Int(candidateRaw.k, 0, n - 1),
    char: sp664Character(candidateRaw.char),
    value: sp664Int(candidateRaw.value, 0, SP664_MAX_LENGTH),
    leftValue: sp664Int(candidateRaw.leftValue, 0, SP664_MAX_LENGTH),
    middleValue: sp664Int(candidateRaw.middleValue, 0, SP664_MAX_LENGTH),
    formula: sp664BoundedText(candidateRaw.formula, 180, ""),
  } : null;
  const incumbentRaw = raw.incumbent && typeof raw.incumbent === "object" ? raw.incumbent : null;
  const incumbent = incumbentRaw ? {
    value: sp664Int(incumbentRaw.value, 0, SP664_MAX_LENGTH),
    choice: sp664Choice(incumbentRaw.choice, n),
  } : null;
  const counterRaw = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const counters = {};
  SP664_COUNTERS.forEach(([key]) => { counters[key] = sp664Int(counterRaw[key], 0, 1000000) ?? 0; });
  const invariantRaw = raw.invariants && typeof raw.invariants === "object" ? raw.invariants : {};
  const invariants = {};
  SP664_INVARIANTS.forEach(([key]) => {
    invariants[key] = typeof invariantRaw[key] === "boolean" ? invariantRaw[key] : null;
  });
  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};
  const outcomes = Object.keys(SP664_OUTCOMES);
  return {
    source: { line, text: SP664_SOURCE[line - 1] },
    event,
    phase: Object.hasOwn(SP664_PHASES, raw.phase) ? raw.phase : "setup",
    timing: raw.timing === "before" ? "before" : "after",
    condition: {
      expression: sp664BoundedText(conditionRaw.expression, 180, ""),
      result: typeof conditionRaw.result === "boolean" ? conditionRaw.result : null,
    },
    input: { s: characters.join(""), characters, length: n },
    cursors: {
      i: sp664Int(cursorsRaw.i, -1, n - 1),
      j: sp664Int(cursorsRaw.j, 0, n),
      k: sp664Int(cursorsRaw.k, 0, n),
    },
    interval,
    dpAllocated: raw.dpAllocated === true,
    dp,
    computedMask,
    choiceTable,
    baseline,
    candidate,
    incumbent,
    dependencies: sp664Dependencies(raw.dependencyIntervals, n),
    outcome: outcomes.includes(raw.outcome) ? raw.outcome : "idle",
    counters,
    invariants,
    answer: sp664Int(raw.answer, 0, SP664_MAX_LENGTH),
    witness: sp664NormalizeWitness(raw.witness, n),
    final: raw.final === true || Boolean(step && step.final),
    title: sp664LocalizedText(step && step.title, locale, SP664_TEXT[locale].fallback),
    note: sp664LocalizedText(step && step.note, locale, ""),
  };
}

function sp664PairLabel(dictionary, key, locale) {
  const pair = dictionary[key];
  return pair ? pair[locale === "vi" ? 1 : 0] : key;
}
function sp664EventLabel(event, locale) {
  return sp664PairLabel(SP664_EVENTS, event, locale);
}
function sp664OutcomeLabel(outcome, locale) {
  return sp664PairLabel(SP664_OUTCOMES, outcome, locale);
}
function sp664PhaseLabel(phase, locale) {
  return sp664PairLabel(SP664_PHASES, phase, locale);
}
function sp664ChoiceLabel(choice, copy) {
  if (!choice) return copy.noChoice;
  if (choice.type === "merge") return `${copy.merge} · k=${choice.k === null ? "—" : choice.k}`;
  return choice.type === "single" ? copy.single : copy.separate;
}
function sp664RoleLabel(role, copy) {
  return copy[`role${role[0].toUpperCase()}${role.slice(1)}`] ?? role;
}
function sp664Rail(state, copy, locale) {
  return `<nav class="sp664-rail-wrap" aria-label="${sp664Escape(copy.rail)}" tabindex="0"><ol class="sp664-rail">${SP664_SOURCE.map((source, index) => {
    const current = index + 1 === state.source.line;
    const action = SP664_LINE_ACTIONS[index][locale === "vi" ? 1 : 0];
    return `<li class="${current ? "sp664-current" : ""}"${current ? ' aria-current="step"' : ""}><small>L${index + 1} · ${sp664Escape(action)}</small><code>${sp664Escape(source)}</code></li>`;
  }).join("")}</ol></nav>`;
}
function sp664SourcePanel(state, copy, locale) {
  const condition = state.condition.result === null
    ? copy.noCondition
    : `${state.condition.expression || "—"} → ${state.condition.result ? copy.yes : copy.no}`;
  return `<section class="sp664-source" aria-labelledby="sp664-source-title"><div class="sp664-source-code"><small id="sp664-source-title">${sp664Escape(copy.sourceAction)}</small><code>${sp664Escape(state.source.text)}</code></div><dl><div><dt>${sp664Escape(copy.phase)}</dt><dd>${sp664Escape(sp664PhaseLabel(state.phase, locale))}</dd></div><div><dt>${sp664Escape(copy.event)}</dt><dd>${sp664Escape(sp664EventLabel(state.event, locale))}</dd></div><div><dt>${sp664Escape(copy.condition)}</dt><dd>${sp664Escape(condition)}</dd></div></dl></section>`;
}
function sp664IndexedInput(state, copy, locale) {
  const cells = state.input.characters.map((character, index) => {
    const cursorNames = [];
    if (state.cursors.i === index) cursorNames.push("i");
    if (state.cursors.j === index) cursorNames.push("j");
    if (state.cursors.k === index) cursorNames.push("k");
    const inInterval = state.interval && index >= state.interval[0] && index <= state.interval[1];
    const classes = [inInterval ? "sp664-in-interval" : "", ...cursorNames.map((name) => `sp664-is-${name}`)].filter(Boolean).join(" ");
    const cursorText = cursorNames.length ? ` · ${cursorNames.join(", ")}` : "";
    return `<li class="${classes}" aria-label="${sp664Escape(`${index}: ${character}${cursorText}`)}"><small>${index}</small><strong>${sp664Escape(character)}</strong><span>${cursorNames.map((name) => `<b class="sp664-cursor-${name}">${name}</b>`).join("")}</span></li>`;
  }).join("");
  const intervalText = state.interval ? `[${state.interval[0]}, ${state.interval[1]}]` : copy.noInterval;
  const cursorValue = (value) => value === null ? "—" : value;
  return `<section class="sp664-card sp664-input" aria-labelledby="sp664-input-title"><header><div><h3 id="sp664-input-title">${sp664Escape(copy.indexedInput)}</h3><p>${sp664Escape(copy.inputHelp)}</p></div><strong>${sp664Escape(state.input.s)}</strong></header><div class="sp664-character-scroll" tabindex="0" role="region" aria-label="${sp664Escape(copy.indexedInput)}"><ol>${cells}</ol></div><dl><div><dt>${sp664Escape(copy.length)}</dt><dd>${state.input.length}</dd></div><div><dt>${sp664Escape(copy.activeInterval)}</dt><dd>${sp664Escape(intervalText)}</dd></div><div><dt>${sp664Escape(copy.cursors)}</dt><dd>i=${cursorValue(state.cursors.i)} · j=${cursorValue(state.cursors.j)} · k=${cursorValue(state.cursors.k)}</dd></div><div><dt>${sp664Escape(copy.outcome)}</dt><dd>${sp664Escape(sp664OutcomeLabel(state.outcome, locale))}</dd></div></dl></section>`;
}
function sp664CellDependency(state, row, column) {
  return state.dependencies.find((dependency) => !dependency.empty && dependency.start === row && dependency.end === column) ?? null;
}
function sp664DpTable(state, copy) {
  const heads = Array.from({ length: state.input.length }, (_, column) => {
    const classes = [state.cursors.j === column ? "sp664-head-j" : "", state.cursors.k === column ? "sp664-head-k" : ""].filter(Boolean).join(" ");
    const markers = `${state.cursors.j === column ? " j" : ""}${state.cursors.k === column ? " k" : ""}`;
    return `<th scope="col" class="${classes}"><span>${column}</span>${markers ? `<small>${sp664Escape(markers.trim())}</small>` : ""}</th>`;
  }).join("");
  const rows = Array.from({ length: state.input.length }, (_, row) => {
    const rowClass = state.cursors.i === row ? "sp664-head-i" : "";
    const cells = Array.from({ length: state.input.length }, (_, column) => {
      if (column < row) {
        return `<td class="sp664-dp-cell sp664-unused" aria-label="dp[${row}][${column}]: ${sp664Escape(copy.unused)}"><span>—</span></td>`;
      }
      const computed = state.computedMask[row][column];
      const active = Boolean(state.interval && state.interval[0] === row && state.interval[1] === column);
      const dependency = sp664CellDependency(state, row, column);
      const choice = computed ? state.choiceTable[row][column] : null;
      const classes = [
        "sp664-dp-cell",
        computed ? "sp664-computed" : "sp664-uncomputed",
        active ? "sp664-active" : "",
        dependency ? `sp664-dependency sp664-dependency-${dependency.role}` : "",
      ].filter(Boolean).join(" ");
      const status = computed ? `${copy.computed}, ${copy.value} ${state.dp[row][column]}, ${copy.choiceAt} ${sp664ChoiceLabel(choice, copy)}` : copy.uncomputed;
      return `<td class="${classes}" aria-label="${sp664Escape(`dp[${row}][${column}]: ${status}`)}"><strong>${computed ? state.dp[row][column] : "·"}</strong>${computed ? `<small class="sp664-choice sp664-choice-${choice ? choice.type : "none"}">${sp664Escape(sp664ChoiceLabel(choice, copy))}</small>` : ""}${dependency ? `<em>${sp664Escape(sp664RoleLabel(dependency.role, copy))}</em>` : ""}</td>`;
    }).join("");
    return `<tr><th scope="row" class="${rowClass}"><span>${row}</span>${state.cursors.i === row ? "<small>i</small>" : ""}</th>${cells}</tr>`;
  }).join("");
  const allocation = state.dpAllocated ? copy.allocated : copy.pendingAllocation;
  return `<section class="sp664-card sp664-dp" aria-labelledby="sp664-dp-title"><header><div><h3 id="sp664-dp-title">${sp664Escape(copy.dp)}</h3><p>${sp664Escape(copy.dpHelp)}</p></div><strong class="${state.dpAllocated ? "sp664-ready" : "sp664-waiting"}">${sp664Escape(allocation)}</strong></header><div class="sp664-table-scroll" tabindex="0" role="region" aria-label="${sp664Escape(copy.dp)}"><table><caption>${sp664Escape(copy.dpHelp)}</caption><thead><tr><th scope="col">${sp664Escape(copy.rowColumn)}</th>${heads}</tr></thead><tbody>${rows}</tbody></table></div><ul class="sp664-legend" aria-label="Legend"><li class="sp664-legend-active">${sp664Escape(copy.activeCell)}</li><li class="sp664-legend-dependency">${sp664Escape(copy.dependencyCell)}</li><li class="sp664-legend-i">${sp664Escape(copy.cursorI)}</li><li class="sp664-legend-j">${sp664Escape(copy.cursorJ)}</li><li class="sp664-legend-k">${sp664Escape(copy.cursorK)}</li></ul></section>`;
}
function sp664TransitionDetails(item, kind, copy) {
  if (!item) return `<div class="sp664-transition-empty">${sp664Escape(copy.unavailable)}</div>`;
  const rows = [];
  if (item.value !== null) rows.push([copy.value, item.value]);
  if (item.formula) rows.push([copy.formula, `<code>${sp664Escape(item.formula)}</code>`]);
  if (kind === "baseline" && item.appendedIndex !== null) rows.push([copy.appended, item.appendedIndex]);
  if (kind === "candidate" && item.k !== null) rows.push([copy.mergeIndex, item.k]);
  if (item.appendedChar || item.char) rows.push([copy.character, `<code>${sp664Escape(item.appendedChar || item.char)}</code>`]);
  return `<dl>${rows.map(([label, value]) => `<div><dt>${sp664Escape(label)}</dt><dd>${value}</dd></div>`).join("")}</dl>`;
}
function sp664CommittedChoice(state) {
  if (!state.interval) return null;
  return state.computedMask[state.interval[0]][state.interval[1]]
    ? state.choiceTable[state.interval[0]][state.interval[1]]
    : null;
}
function sp664DecisionHelp(outcome, copy) {
  if (outcome === "improve") return copy.improveHelp;
  if (outcome === "tie") return copy.tieHelp;
  if (outcome === "worse") return copy.worseHelp;
  if (outcome === "baseline") return copy.baselineHelp;
  return copy.defaultDecisionHelp;
}
function sp664DependenciesPanel(state, copy) {
  const content = state.dependencies.length ? `<ul>${state.dependencies.map((dependency) => {
    const interval = dependency.empty ? copy.empty : `[${dependency.start}, ${dependency.end}]`;
    return `<li class="sp664-dependency-${dependency.role} ${dependency.empty ? "sp664-empty-dependency" : ""}"><strong>${sp664Escape(sp664RoleLabel(dependency.role, copy))}</strong><code>${sp664Escape(interval)}</code><span>${sp664Escape(copy.value)} ${dependency.value}</span></li>`;
  }).join("")}</ul>` : `<div class="sp664-transition-empty">${sp664Escape(copy.unavailable)}</div>`;
  return `<div class="sp664-dependencies"><div><h4>${sp664Escape(copy.dependencies)}</h4><p>${sp664Escape(copy.dependencyHelp)}</p></div>${content}</div>`;
}
function sp664TransitionPanel(state, copy, locale) {
  const committed = sp664CommittedChoice(state);
  const incumbentChoice = state.incumbent ? state.incumbent.choice : null;
  return `<section class="sp664-card sp664-transition sp664-outcome-${state.outcome}" aria-labelledby="sp664-transition-title"><header><div><h3 id="sp664-transition-title">${sp664Escape(copy.transition)}</h3><p>${sp664Escape(copy.transitionHelp)}</p></div><strong>${sp664Escape(sp664OutcomeLabel(state.outcome, locale))}</strong></header><div class="sp664-comparison"><article><small>${sp664Escape(copy.baseline)}</small>${sp664TransitionDetails(state.baseline, "baseline", copy)}</article><article><small>${sp664Escape(copy.candidate)}</small>${sp664TransitionDetails(state.candidate, "candidate", copy)}</article><article><small>${sp664Escape(copy.incumbent)}</small>${state.incumbent ? `<strong class="sp664-transition-value">${state.incumbent.value === null ? "—" : state.incumbent.value}</strong><span>${sp664Escape(sp664ChoiceLabel(incumbentChoice, copy))}</span>` : `<div class="sp664-transition-empty">${sp664Escape(copy.unavailable)}</div>`}</article><article><small>${sp664Escape(copy.committed)}</small>${committed ? `<strong class="sp664-transition-value">${committed.value}</strong><span>${sp664Escape(sp664ChoiceLabel(committed, copy))}</span>` : `<div class="sp664-transition-empty">${sp664Escape(copy.pending)}</div>`}</article></div><div class="sp664-decision"><strong>${sp664Escape(sp664OutcomeLabel(state.outcome, locale))}</strong><p>${sp664Escape(sp664DecisionHelp(state.outcome, copy))}</p></div>${sp664DependenciesPanel(state, copy)}</section>`;
}
function sp664Canvas(cells, interval, copy) {
  return `<ol class="sp664-canvas">${cells.map((character, index) => {
    const overwritten = interval && index >= interval[0] && index <= interval[1];
    const visible = character === null ? "·" : character;
    const description = `${index}: ${character === null ? copy.pending : character}${overwritten ? `, ${copy.overwrite}` : ""}`;
    return `<li class="${overwritten ? "sp664-overwritten" : ""}" aria-label="${sp664Escape(description)}"><small>${index}</small><strong>${sp664Escape(visible)}</strong></li>`;
  }).join("")}</ol>`;
}
function sp664WitnessPanel(state, copy) {
  if (!state.witness) {
    return `<section class="sp664-card sp664-witness" aria-labelledby="sp664-witness-title"><header><div><h3 id="sp664-witness-title">${sp664Escape(copy.witness)}</h3><p>${sp664Escape(copy.witnessHelp)}</p></div><strong>${sp664Escape(copy.pending)}</strong></header><div class="sp664-witness-pending">${sp664Escape(copy.witnessPending)}</div></section>`;
  }
  const witness = state.witness;
  const timeline = [
    `<li><article><header><strong>${sp664Escape(copy.initialCanvas)}</strong><small>0 / ${witness.turnCount}</small></header>${sp664Canvas(witness.initialCanvas, null, copy)}</article></li>`,
    ...witness.turns.map((turn) => `<li><article><header><strong>${sp664Escape(`${copy.turn} ${turn.turn}`)}</strong><small><code>${sp664Escape(turn.char)}</code> · ${sp664Escape(copy.overwrite)} [${turn.left}, ${turn.right}]</small></header>${sp664Canvas(turn.postCanvas, turn.interval, copy)}</article></li>`),
  ].join("");
  const targetCells = state.input.characters.map((character) => character);
  return `<section class="sp664-card sp664-witness" aria-labelledby="sp664-witness-title"><header><div><h3 id="sp664-witness-title">${sp664Escape(copy.witness)}</h3><p>${sp664Escape(copy.witnessHelp)}</p></div><strong class="${witness.valid ? "sp664-valid" : "sp664-invalid"}">${sp664Escape(witness.valid ? copy.valid : copy.invalid)}</strong></header><dl class="sp664-witness-summary"><div><dt>${sp664Escape(copy.answer)}</dt><dd>${state.answer === null ? "—" : state.answer}</dd></div><div><dt>${sp664Escape(copy.turns)}</dt><dd>${witness.turnCount}</dd></div><div><dt>${sp664Escape(copy.target)}</dt><dd><code>${sp664Escape(state.input.s)}</code></dd></div><div><dt>${sp664Escape(copy.finalCanvas)}</dt><dd><code>${sp664Escape(witness.finalCanvas || witness.finalCells.map((cell) => cell ?? "·").join(""))}</code></dd></div></dl><div class="sp664-target-canvas"><small>${sp664Escape(copy.target)}</small>${sp664Canvas(targetCells, null, copy)}</div><div class="sp664-timeline" tabindex="0" role="region" aria-label="${sp664Escape(copy.witness)}"><ol>${timeline}</ol></div>${witness.strategy ? `<p class="sp664-strategy"><strong>${sp664Escape(copy.strategy)}:</strong> ${sp664Escape(witness.strategy)}</p>` : ""}</section>`;
}
function sp664InvariantPanel(state, copy, locale) {
  return `<section class="sp664-card sp664-invariants" aria-labelledby="sp664-invariants-title"><header><div><h3 id="sp664-invariants-title">${sp664Escape(copy.invariants)}</h3><p>${sp664Escape(copy.invariantDefinition)}</p></div></header><ul>${SP664_INVARIANTS.map(([key, en, vi]) => {
    const value = state.invariants[key];
    const statusClass = value === true ? "sp664-pass" : value === false ? "sp664-fail" : "sp664-na";
    const symbol = value === true ? "✓" : value === false ? "×" : "·";
    const status = value === true ? copy.pass : value === false ? copy.fail : copy.notApplicable;
    return `<li class="${statusClass}"><span aria-hidden="true">${symbol}</span><strong>${sp664Escape(locale === "vi" ? vi : en)}</strong><small>${sp664Escape(status)}</small></li>`;
  }).join("")}</ul></section>`;
}
function sp664CounterPanel(state, copy, locale) {
  return `<section class="sp664-card sp664-counters" aria-labelledby="sp664-counters-title"><header><h3 id="sp664-counters-title">${sp664Escape(copy.counters)}</h3></header><ul>${SP664_COUNTERS.map(([key, en, vi]) => `<li><small>${sp664Escape(locale === "vi" ? vi : en)}</small><strong>${state.counters[key]}</strong></li>`).join("")}</ul></section>`;
}
function renderStrangePrinter664View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = sp664Locale();
  const copy = SP664_TEXT[locale];
  const state = sp664Normalize(step);
  const event = sp664EventLabel(state.event, locale);
  const note = state.note
    ? `<aside class="sp664-note"><strong>${sp664Escape(copy.note)}</strong><p>${sp664Escape(state.note)}</p></aside>`
    : "";
  host.innerHTML = `<article class="sp664-viz ${state.final ? "sp664-final" : ""} sp664-state-${state.outcome}" role="region" aria-label="${sp664Escape(`Strange Printer, ${copy.line} ${state.source.line}, ${event}`)}"><header class="sp664-header"><div><span>${sp664Escape(copy.kicker)}</span><h2>${sp664Escape(state.title)}</h2></div><div><strong>${sp664Escape(copy.line)} ${state.source.line}</strong><span>${sp664Escape(state.timing === "before" ? copy.before : copy.after)}</span><em>${sp664Escape(event)}</em></div></header>${sp664Rail(state, copy, locale)}${sp664SourcePanel(state, copy, locale)}${sp664IndexedInput(state, copy, locale)}<div class="sp664-main-grid">${sp664DpTable(state, copy)}${sp664TransitionPanel(state, copy, locale)}</div>${sp664WitnessPanel(state, copy)}<div class="sp664-footer-grid">${sp664InvariantPanel(state, copy, locale)}${sp664CounterPanel(state, copy, locale)}</div>${note}</article>`;
}
