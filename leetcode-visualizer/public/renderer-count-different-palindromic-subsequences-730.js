"use strict";

const CPS730_MAX_LENGTH = 10;
const CPS730_MAX_FRAMES = 1200;
const CPS730_MAX_EVIDENCE_ENTRIES = 1023;
const CPS730_MAX_RENDERED_EVIDENCE = 96;
const CPS730_MODULUS = 1000000007;
const CPS730_ALPHABET = Object.freeze(["a", "b", "c", "d"]);
const CPS730_SOURCE = Object.freeze([
  "class Solution:",
  "    def countPalindromicSubsequences(self, s: str) -> int:",
  "        MOD = 10**9 + 7",
  "        n = len(s)",
  "        dp = [[0] * n for _ in range(n)]",
  "        for i in range(n - 1, -1, -1):",
  "            dp[i][i] = 1",
  "            for j in range(i + 1, n):",
  "                if s[i] == s[j]:",
  "                    low, high = i + 1, j - 1",
  "                    while low <= high and s[low] != s[i]:",
  "                        low += 1",
  "                    while low <= high and s[high] != s[j]:",
  "                        high -= 1",
  "                    middle = dp[i + 1][j - 1]",
  "                    if low > high:",
  "                        dp[i][j] = (2 * middle + 2) % MOD",
  "                    elif low == high:",
  "                        dp[i][j] = (2 * middle + 1) % MOD",
  "                    else:",
  "                        dp[i][j] = (2 * middle - dp[low + 1][high - 1]) % MOD",
  "                else:",
  "                    dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1]) % MOD",
  "        return dp[0][n - 1]",
]);
const CPS730_LINE_EVENTS = Object.freeze([
  "bind-class", "bind-method", "set-modulus", "set-length", "allocate-dp", "i-loop-true",
  "write-diagonal", "j-loop-true", "endpoint-condition-true", "initialize-inner-scan",
  "low-scan-condition-true", "advance-low", "high-scan-condition-true", "retreat-high",
  "read-middle", "zero-inner-match-condition-true", "write-zero-inner-match",
  "one-inner-match-condition-true", "write-one-inner-match", "multiple-inner-match-branch",
  "write-multiple-inner-matches", "unequal-endpoint-branch", "write-unequal-endpoints", "final-return",
]);
const CPS730_LINE_ACTIONS = Object.freeze([
  ["Define Solution", "Định nghĩa Solution"],
  ["Define the counting method", "Định nghĩa phương thức đếm"],
  ["Set the canonical modulus", "Đặt modulo chính tắc"],
  ["Read the input length", "Đọc độ dài input"],
  ["Allocate interval DP", "Cấp phát DP đoạn"],
  ["Move i from right to left", "Duyệt i từ phải sang trái"],
  ["Seed a singleton interval", "Khởi tạo đoạn một ký tự"],
  ["Extend the interval with j", "Mở rộng đoạn bằng j"],
  ["Compare endpoint characters", "So sánh ký tự hai đầu"],
  ["Initialize inward cursors", "Khởi tạo con trỏ hướng vào"],
  ["Scan low toward a match", "Quét low đến ký tự trùng"],
  ["Advance low", "Tăng low"],
  ["Scan high toward a match", "Quét high đến ký tự trùng"],
  ["Retreat high", "Giảm high"],
  ["Read the middle interval", "Đọc đoạn giữa"],
  ["Test for zero inner matches", "Kiểm tra không có ký tự trùng trong"],
  ["Write the zero-match case", "Ghi trường hợp không trùng"],
  ["Test for one inner match", "Kiểm tra đúng một ký tự trùng trong"],
  ["Write the one-match case", "Ghi trường hợp một ký tự trùng"],
  ["Select multiple inner matches", "Chọn trường hợp nhiều ký tự trùng"],
  ["Subtract the duplicate range", "Trừ phạm vi trùng lặp"],
  ["Select unequal endpoints", "Chọn hai đầu khác nhau"],
  ["Apply inclusion-exclusion", "Áp dụng bao hàm-loại trừ"],
  ["Return the root interval", "Trả về đoạn gốc"],
]);
const CPS730_EVENTS = Object.freeze({
  "bind-class": ["Bind Solution class", "Liên kết lớp Solution"],
  "bind-method": ["Bind counting method", "Liên kết phương thức đếm"],
  "set-modulus": ["Set MOD", "Đặt MOD"],
  "set-length": ["Set input length", "Đặt độ dài input"],
  "allocate-dp": ["Allocate DP and computed mask", "Cấp phát DP và mask computed"],
  "i-loop-true": ["Enter descending i loop", "Vào vòng i giảm dần"],
  "i-loop-false": ["Exit descending i loop", "Thoát vòng i giảm dần"],
  "write-diagonal": ["Write diagonal base case", "Ghi trường hợp cơ sở đường chéo"],
  "j-loop-true": ["Enter increasing j loop", "Vào vòng j tăng dần"],
  "j-loop-false": ["Exit the current j row", "Thoát hàng j hiện tại"],
  "endpoint-condition-true": ["Endpoints are equal", "Hai đầu bằng nhau"],
  "endpoint-condition-false": ["Endpoints are unequal", "Hai đầu khác nhau"],
  "initialize-inner-scan": ["Initialize low and high", "Khởi tạo low và high"],
  "low-scan-condition-true": ["Low scan continues", "Tiếp tục quét low"],
  "low-scan-condition-false": ["Low scan stops", "Dừng quét low"],
  "advance-low": ["Advance low", "Tăng low"],
  "high-scan-condition-true": ["High scan continues", "Tiếp tục quét high"],
  "high-scan-condition-false": ["High scan stops", "Dừng quét high"],
  "retreat-high": ["Retreat high", "Giảm high"],
  "read-middle": ["Read middle DP value", "Đọc giá trị DP giữa"],
  "zero-inner-match-condition-true": ["Zero inner matches", "Không có ký tự trùng bên trong"],
  "zero-inner-match-condition-false": ["An inner match exists", "Có ký tự trùng bên trong"],
  "write-zero-inner-match": ["Commit zero-match recurrence", "Ghi công thức không trùng"],
  "one-inner-match-condition-true": ["Exactly one inner match", "Đúng một ký tự trùng bên trong"],
  "one-inner-match-condition-false": ["Multiple inner matches", "Nhiều ký tự trùng bên trong"],
  "write-one-inner-match": ["Commit one-match recurrence", "Ghi công thức một ký tự trùng"],
  "multiple-inner-match-branch": ["Enter multiple-match branch", "Vào nhánh nhiều ký tự trùng"],
  "write-multiple-inner-matches": ["Commit duplicate subtraction", "Ghi phép trừ trùng lặp"],
  "unequal-endpoint-branch": ["Enter unequal-endpoint branch", "Vào nhánh hai đầu khác nhau"],
  "write-unequal-endpoints": ["Commit inclusion-exclusion", "Ghi bao hàm-loại trừ"],
  "final-return": ["Return verified answer", "Trả đáp án đã xác minh"],
});
const CPS730_PHASES = Object.freeze({
  setup: ["setup", "khởi tạo"],
  fill: ["fill intervals", "điền các đoạn"],
  recurrence: ["select recurrence", "chọn công thức"],
  scan: ["scan inward", "quét hướng vào"],
  write: ["commit cell", "ghi ô"],
  done: ["complete", "hoàn tất"],
});
const CPS730_BRANCHES = Object.freeze({
  idle: ["waiting", "đang chờ"],
  "i-loop": ["row selected", "đã chọn hàng"],
  diagonal: ["singleton base", "cơ sở ký tự đơn"],
  "j-loop": ["interval opened", "đã mở đoạn"],
  "equal-endpoints-pending": ["equal endpoints", "hai đầu bằng nhau"],
  "unequal-endpoints-pending": ["unequal endpoints pending", "chờ xử lý hai đầu khác nhau"],
  "scan-inner-matches": ["scanning inner matches", "đang quét ký tự trùng bên trong"],
  "zero-inner-match": ["zero inner matches", "không có ký tự trùng bên trong"],
  "one-inner-match": ["one inner match", "một ký tự trùng bên trong"],
  "multiple-inner-matches": ["multiple inner matches", "nhiều ký tự trùng bên trong"],
  "unequal-endpoints": ["inclusion-exclusion", "bao hàm-loại trừ"],
  "j-loop-complete": ["row complete", "hoàn tất hàng"],
  "i-loop-complete": ["table complete", "hoàn tất bảng"],
  final: ["answer verified", "đã xác minh đáp án"],
});
const CPS730_COUNTERS = Object.freeze([
  ["frames", "Frames", "Frame"],
  ["iLoopTrue", "i entries", "Lần vào i"],
  ["iLoopFalse", "i exits", "Lần thoát i"],
  ["jLoopTrue", "j entries", "Lần vào j"],
  ["jLoopFalse", "j exits", "Lần thoát j"],
  ["diagonalWrites", "Diagonal writes", "Lần ghi đường chéo"],
  ["endpointChecks", "Endpoint checks", "Lần kiểm tra hai đầu"],
  ["equalEndpoints", "Equal endpoints", "Hai đầu bằng nhau"],
  ["unequalEndpoints", "Unequal endpoints", "Hai đầu khác nhau"],
  ["lowScanChecks", "Low checks", "Lần kiểm tra low"],
  ["lowScanAdvances", "Low advances", "Lần tăng low"],
  ["highScanChecks", "High checks", "Lần kiểm tra high"],
  ["highScanRetreats", "High retreats", "Lần giảm high"],
  ["zeroInnerMatchBranches", "Zero-match writes", "Lần ghi không trùng"],
  ["oneInnerMatchBranches", "One-match writes", "Lần ghi một trùng"],
  ["multipleInnerMatchBranches", "Multiple-match writes", "Lần ghi nhiều trùng"],
  ["recurrenceWrites", "Recurrence writes", "Lần ghi công thức"],
  ["evidenceBuilds", "Evidence builds", "Lần dựng bằng chứng"],
  ["evidenceMasksExamined", "Evidence masks", "Mask bằng chứng"],
]);
const CPS730_INVARIANTS = Object.freeze([
  ["sourceEventHasSingletonLine", "Each event maps to one canonical source line", "Mỗi sự kiện ánh xạ tới một dòng nguồn chuẩn"],
  ["tablesAreSquare", "DP, mask, and evidence tables are square", "Bảng DP, mask và bằng chứng đều vuông"],
  ["lowerTriangleUnused", "The lower triangle remains unused", "Tam giác dưới không được sử dụng"],
  ["uncomputedCellsAreZero", "Uncomputed storage remains zero", "Ô chưa tính vẫn lưu 0"],
  ["computedMaskMatchesEvidence", "Computed cells have matching evidence", "Ô đã tính có bằng chứng tương ứng"],
  ["evidenceCountsMatchDp", "Every evidence count equals its DP cell", "Mọi số đếm bằng chứng bằng ô DP"],
  ["evidenceIsBounded", "Evidence remains complete within its bound", "Bằng chứng đầy đủ trong giới hạn"],
  ["canonicalResidues", "Computed values are canonical residues", "Giá trị đã tính là số dư chính tắc"],
  ["dependenciesComputed", "Every nonempty dependency is ready", "Mọi phụ thuộc không rỗng đã sẵn sàng"],
  ["activeCellEvidenceMatches", "Active evidence matches the active cell", "Bằng chứng hiện tại khớp ô hiện tại"],
  ["framesWithinLimit", "The trace remains within the frame limit", "Trace nằm trong giới hạn frame"],
  ["answerMatchesRoot", "The answer equals dp[0][n−1]", "Đáp án bằng dp[0][n−1]"],
  ["finalEvidenceMatchesAnswer", "Final grouped evidence matches the answer", "Bằng chứng nhóm cuối khớp đáp án"],
]);
const CPS730_ASSERTIONS = Object.freeze([
  "countMatchesDp", "groupedCountMatches", "representativesAreValid", "indexTuplesAreAbsolute",
  "lexicographicallySmallestRepresentatives", "withinBound", "countMatchesAnswer",
  "completeWithinVisualizationBound", "deterministicRepresentatives",
]);
const CPS730_TEXT = Object.freeze({
  en: Object.freeze({
    kicker: "LEETCODE 730 · DISTINCT PALINDROMES", fallback: "Count Different Palindromic Subsequences",
    line: "LINE", before: "before execution", after: "after execution", rail: "Canonical 24-line source and event rail",
    sourceAction: "Current canonical source action", phase: "Phase", event: "Runtime event", condition: "Condition",
    noCondition: "No condition on this frame.", yes: "TRUE", no: "FALSE", indexedInput: "Indexed input and cursors",
    inputHelp: "i/j bound the active interval; low/high scan inward using absolute indices.", length: "length",
    interval: "active interval", none: "none", cursors: "cursors", answer: "answer", pending: "pending",
    dp: "Interval DP table", dpHelp: "A numeric zero is visible only when the computed mask marks the cell as written.",
    allocated: "table allocated", allocationPending: "allocation pending", rowColumn: "i \\ j", computed: "computed",
    uncomputed: "not computed", unused: "lower triangle", activeCell: "active interval", dependencyCell: "recurrence dependency",
    endpointScan: "Endpoint relation and inward scan", endpointHelp: "Equal endpoints scan for the first and last matching character strictly inside the interval.",
    leftEndpoint: "left endpoint", rightEndpoint: "right endpoint", relation: "relation", equal: "EQUAL", unequal: "UNEQUAL",
    undecided: "not checked", target: "scan target", scanStart: "scan starts", scanNow: "current low/high",
    lowGuard: "low guard", highGuard: "high guard", notEvaluated: "not evaluated", holds: "true", stops: "false",
    recurrence: "Four recurrence cases", recurrenceHelp: "Exactly one case commits each non-diagonal cell. Raw arithmetic stays signed before canonical modulo normalization.",
    branch: "current branch", unequalCase: "Unequal endpoints", zeroCase: "Equal · zero inner matches",
    oneCase: "Equal · one inner match", multipleCase: "Equal · multiple inner matches", activeCase: "selected case",
    inactiveCase: "not selected", unequalFormula: "drop-left + drop-right − overlap",
    zeroFormula: "2 × middle + 2", oneFormula: "2 × middle + 1", multipleFormula: "2 × middle − duplicate",
    unequalHelp: "Union both shorter intervals, then subtract their overlap.",
    zeroHelp: "No matching endpoint occurs inside; add the singleton and the endpoint pair.",
    oneHelp: "One matching endpoint already supplies the singleton; add only one new base value.",
    multipleHelp: "Subtract values already wrapped around the strictly interior duplicate range.",
    traceFormula: "trace formula", middle: "middle", duplicate: "duplicate", signedRaw: "signed raw",
    normalized: "normalized modulo", unavailable: "not available on this frame", dependencies: "Recurrence dependencies",
    emptyInterval: "empty interval", value: "value", roleMiddle: "middle", roleDuplicate: "duplicate",
    roleDropLeft: "drop left", roleDropRight: "drop right", roleOverlap: "overlap",
    evidence: "Deterministic distinct-palindrome evidence", evidenceHelp: "Values are grouped by outer character; each value shows its lexicographically smallest absolute representative index tuple.",
    activeEvidence: "active-cell evidence", finalEvidence: "final root evidence", evidencePending: "Evidence appears after the active cell is committed.",
    distinctCount: "distinct count", listShown: "renderer list", masksExamined: "masks examined", representativeRule: "representative rule",
    boundedComplete: "complete within bound", boundedPartial: "bounded or truncated", outerGroup: "outer character",
    noValues: "No displayed values in this group.", indices: "indices", mask: "absolute mask", localMask: "local mask",
    evidenceCap: `The renderer deterministically shows at most ${CPS730_MAX_RENDERED_EVIDENCE} values.`, omitted: "additional values not displayed",
    invariants: "Trace invariants", invariantDefinition: "dp[i][j] counts distinct non-empty palindromic subsequence values in s[i..j].",
    pass: "holds", fail: "failed", notApplicable: "not applicable yet", counters: "Operation counters",
    note: "Why this frame matters", legend: "DP table legend",
  }),
  vi: Object.freeze({
    kicker: "LEETCODE 730 · PALINDROME KHÁC NHAU", fallback: "Đếm subsequence đối xứng khác nhau",
    line: "DÒNG", before: "trước khi chạy", after: "sau khi chạy", rail: "Thanh nguồn và sự kiện 24 dòng chuẩn",
    sourceAction: "Thao tác nguồn chuẩn hiện tại", phase: "Giai đoạn", event: "Sự kiện runtime", condition: "Điều kiện",
    noCondition: "Frame này không có điều kiện.", yes: "ĐÚNG", no: "SAI", indexedInput: "Input và con trỏ có chỉ số",
    inputHelp: "i/j giới hạn đoạn hiện tại; low/high quét hướng vào bằng chỉ số tuyệt đối.", length: "độ dài",
    interval: "đoạn hiện tại", none: "không có", cursors: "con trỏ", answer: "đáp án", pending: "đang chờ",
    dp: "Bảng DP đoạn", dpHelp: "Số 0 chỉ hiện khi mask computed đánh dấu ô đã được ghi.",
    allocated: "đã cấp phát bảng", allocationPending: "chờ cấp phát", rowColumn: "i \\ j", computed: "đã tính",
    uncomputed: "chưa tính", unused: "tam giác dưới", activeCell: "đoạn hiện tại", dependencyCell: "phụ thuộc công thức",
    endpointScan: "Quan hệ hai đầu và quét hướng vào", endpointHelp: "Hai đầu bằng nhau sẽ quét ký tự trùng đầu tiên và cuối cùng nằm hẳn trong đoạn.",
    leftEndpoint: "đầu trái", rightEndpoint: "đầu phải", relation: "quan hệ", equal: "BẰNG NHAU", unequal: "KHÁC NHAU",
    undecided: "chưa kiểm tra", target: "ký tự quét", scanStart: "điểm bắt đầu", scanNow: "low/high hiện tại",
    lowGuard: "guard low", highGuard: "guard high", notEvaluated: "chưa đánh giá", holds: "đúng", stops: "sai",
    recurrence: "Bốn trường hợp công thức", recurrenceHelp: "Đúng một trường hợp ghi mỗi ô không nằm trên đường chéo. Phép tính raw giữ dấu trước khi chuẩn hóa modulo.",
    branch: "nhánh hiện tại", unequalCase: "Hai đầu khác nhau", zeroCase: "Hai đầu bằng · không trùng bên trong",
    oneCase: "Hai đầu bằng · một ký tự trùng", multipleCase: "Hai đầu bằng · nhiều ký tự trùng", activeCase: "trường hợp đã chọn",
    inactiveCase: "không được chọn", unequalFormula: "bỏ trái + bỏ phải − phần giao",
    zeroFormula: "2 × giữa + 2", oneFormula: "2 × giữa + 1", multipleFormula: "2 × giữa − trùng lặp",
    unequalHelp: "Hợp hai đoạn ngắn hơn rồi trừ phần giao.",
    zeroHelp: "Không có ký tự hai đầu trùng bên trong; thêm ký tự đơn và cặp hai đầu.",
    oneHelp: "Một ký tự trùng đã cung cấp giá trị đơn; chỉ thêm một giá trị cơ sở mới.",
    multipleHelp: "Trừ các giá trị đã được bọc quanh phạm vi trùng lặp nằm hẳn bên trong.",
    traceFormula: "công thức trace", middle: "giữa", duplicate: "trùng lặp", signedRaw: "raw có dấu",
    normalized: "modulo đã chuẩn hóa", unavailable: "không có ở frame này", dependencies: "Các phụ thuộc công thức",
    emptyInterval: "đoạn rỗng", value: "giá trị", roleMiddle: "giữa", roleDuplicate: "trùng lặp",
    roleDropLeft: "bỏ trái", roleDropRight: "bỏ phải", roleOverlap: "phần giao",
    evidence: "Bằng chứng palindrome khác nhau xác định", evidenceHelp: "Các giá trị được nhóm theo ký tự ngoài cùng; mỗi giá trị hiển thị tuple chỉ số tuyệt đối đại diện nhỏ nhất theo thứ tự từ điển.",
    activeEvidence: "bằng chứng ô hiện tại", finalEvidence: "bằng chứng đoạn gốc cuối", evidencePending: "Bằng chứng xuất hiện sau khi ô hiện tại được ghi.",
    distinctCount: "số lượng khác nhau", listShown: "danh sách renderer", masksExamined: "mask đã xét", representativeRule: "quy tắc đại diện",
    boundedComplete: "đầy đủ trong giới hạn", boundedPartial: "có giới hạn hoặc bị cắt", outerGroup: "ký tự ngoài cùng",
    noValues: "Không có giá trị hiển thị trong nhóm này.", indices: "chỉ số", mask: "mask tuyệt đối", localMask: "mask cục bộ",
    evidenceCap: `Renderer hiển thị xác định tối đa ${CPS730_MAX_RENDERED_EVIDENCE} giá trị.`, omitted: "giá trị bổ sung không hiển thị",
    invariants: "Bất biến trace", invariantDefinition: "dp[i][j] đếm các giá trị palindromic subsequence không rỗng khác nhau trong s[i..j].",
    pass: "đúng", fail: "sai", notApplicable: "chưa áp dụng", counters: "Bộ đếm thao tác",
    note: "Ý nghĩa của frame này", legend: "Chú giải bảng DP",
  }),
});

function cps730Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function cps730Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}
function cps730Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}
function cps730BoundedText(value, maximum, fallback = "") {
  return typeof value === "string" ? value.slice(0, maximum) : fallback;
}
function cps730LocalizedText(value, locale, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return cps730BoundedText(value[locale] ?? value.en ?? value.vi, 500, fallback);
  }
  return cps730BoundedText(value, 500, fallback);
}
function cps730InputCharacter(value) {
  const character = typeof value === "string" ? Array.from(value)[0] : null;
  return CPS730_ALPHABET.includes(character) ? character : "?";
}
function cps730EvidenceText(value, maximum = CPS730_MAX_LENGTH) {
  return typeof value === "string" ? Array.from(value).slice(0, maximum).join("") : "";
}
function cps730NullableCharacter(value) {
  if (value === null || value === undefined) return null;
  return cps730InputCharacter(value);
}
function cps730Boolean(value) {
  return typeof value === "boolean" ? value : null;
}
function cps730StrictInterval(value, n) {
  if (!Array.isArray(value) || value.length < 2) return null;
  const start = cps730Int(value[0], 0, n - 1);
  const end = cps730Int(value[1], 0, n - 1);
  return start !== null && end !== null && start <= end ? [start, end] : null;
}
function cps730Tuple(value, n) {
  if (!Array.isArray(value)) return [];
  const candidate = value.slice(0, n);
  const tuple = [];
  for (const item of candidate) {
    const index = cps730Int(item, 0, n - 1);
    if (index === null || (tuple.length && index <= tuple[tuple.length - 1])) return [];
    tuple.push(index);
  }
  return tuple;
}
function cps730TupleCompare(left, right) {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index++) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.length - right.length;
}
function cps730EvidenceEntry(raw, n) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const palindrome = cps730EvidenceText(raw.palindrome ?? raw.value, n) || "?";
  const sourceTuple = Array.isArray(raw.indexTuple) ? raw.indexTuple : raw.indices;
  const indexTuple = cps730Tuple(sourceTuple, n);
  const tupleMask = indexTuple.reduce((mask, index) => mask | (1 << index), 0);
  const mask = cps730Int(raw.mask, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? tupleMask;
  const absoluteMask = cps730Int(raw.absoluteMask, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? mask;
  const localMask = cps730Int(raw.localMask, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? 0;
  const firstCharacter = CPS730_ALPHABET.includes(Array.from(palindrome)[0]) ? Array.from(palindrome)[0] : "?";
  const outerChar = firstCharacter !== "?"
    ? firstCharacter
    : CPS730_ALPHABET.includes(raw.outerChar) ? raw.outerChar : "?";
  return {
    palindrome,
    value: cps730EvidenceText(raw.value, n) || palindrome,
    outerChar,
    length: cps730Int(raw.length, 1, n) ?? Math.max(1, Math.min(n, Array.from(palindrome).length)),
    mask,
    localMask,
    absoluteMask,
    indexTuple,
    indices: [...indexTuple],
  };
}
function cps730SortedEvidenceEntries(raw, n) {
  if (!raw || typeof raw !== "object") return { all: [], displayed: [] };
  const candidates = [];
  const append = (items) => {
    if (!Array.isArray(items)) return;
    for (const item of items.slice(0, CPS730_MAX_EVIDENCE_ENTRIES - candidates.length)) {
      const entry = cps730EvidenceEntry(item, n);
      if (entry) candidates.push(entry);
      if (candidates.length >= CPS730_MAX_EVIDENCE_ENTRIES) break;
    }
  };
  append(raw.entries);
  if (candidates.length === 0 && Array.isArray(raw.groups)) {
    for (const group of raw.groups.slice(0, CPS730_ALPHABET.length)) {
      if (group && typeof group === "object") append(group.entries);
      if (candidates.length >= CPS730_MAX_EVIDENCE_ENTRIES) break;
    }
  }
  candidates.sort((left, right) => {
    if (left.palindrome < right.palindrome) return -1;
    if (left.palindrome > right.palindrome) return 1;
    const tupleOrder = cps730TupleCompare(left.indexTuple, right.indexTuple);
    return tupleOrder || left.absoluteMask - right.absoluteMask;
  });
  const distinct = [];
  const seen = new Set();
  for (const entry of candidates) {
    if (seen.has(entry.palindrome)) continue;
    seen.add(entry.palindrome);
    distinct.push(entry);
  }
  return { all: distinct, displayed: distinct.slice(0, CPS730_MAX_RENDERED_EVIDENCE) };
}
function cps730EvidenceAssertions(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const assertions = {};
  CPS730_ASSERTIONS.forEach((key) => { assertions[key] = cps730Boolean(source[key]); });
  return assertions;
}
function cps730Evidence(raw, n, finalEvidence = false) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const normalizedEntries = cps730SortedEvidenceEntries(raw, n);
  const groupsRaw = Array.isArray(raw.groups) ? raw.groups.slice(0, CPS730_ALPHABET.length) : [];
  const declaredGroupCounts = new Map();
  const declaredPalindromes = new Map();
  for (const group of groupsRaw) {
    if (!group || typeof group !== "object" || !CPS730_ALPHABET.includes(group.outerChar)) continue;
    const groupEntries = Array.isArray(group.entries)
      ? group.entries.slice(0, CPS730_MAX_EVIDENCE_ENTRIES).map((entry) => cps730EvidenceEntry(entry, n)).filter(Boolean)
      : [];
    const palindromes = Array.isArray(group.palindromes)
      ? group.palindromes.slice(0, CPS730_MAX_EVIDENCE_ENTRIES).map((value) => cps730EvidenceText(value, n)).filter(Boolean)
      : [];
    declaredGroupCounts.set(group.outerChar, cps730Int(group.count, 0, CPS730_MAX_EVIDENCE_ENTRIES)
      ?? Math.max(groupEntries.length, palindromes.length));
    declaredPalindromes.set(group.outerChar, palindromes.slice(0, CPS730_MAX_RENDERED_EVIDENCE));
  }
  const groups = CPS730_ALPHABET.map((outerChar) => {
    const entries = normalizedEntries.displayed.filter((entry) => entry.outerChar === outerChar);
    const allCount = normalizedEntries.all.filter((entry) => entry.outerChar === outerChar).length;
    return {
      outerChar,
      count: declaredGroupCounts.get(outerChar) ?? allCount,
      palindromes: declaredPalindromes.get(outerChar) ?? entries.map((entry) => entry.palindrome),
      entries,
    };
  });
  const maskRaw = raw.maskEnumeration && typeof raw.maskEnumeration === "object"
    ? raw.maskEnumeration
    : {};
  const interval = cps730StrictInterval(finalEvidence ? raw.rootInterval : raw.interval, n);
  const count = cps730Int(raw.count, 0, CPS730_MAX_EVIDENCE_ENTRIES)
    ?? cps730Int(raw.distinctCount, 0, CPS730_MAX_EVIDENCE_ENTRIES)
    ?? normalizedEntries.all.length;
  const shownCount = cps730Int(raw.shownCount, 0, CPS730_MAX_EVIDENCE_ENTRIES)
    ?? Math.min(count, normalizedEntries.all.length);
  const payloadOmitted = cps730Int(raw.omittedCount, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? 0;
  return {
    interval,
    rootInterval: finalEvidence ? interval : null,
    substring: cps730EvidenceText(raw.substring, n),
    method: cps730BoundedText(raw.method, 300, ""),
    strategy: cps730BoundedText(raw.strategy, 300, ""),
    representativeRule: cps730BoundedText(raw.representativeRule, 300, ""),
    maskEnumeration: {
      firstLocalMask: cps730Int(maskRaw.firstLocalMask, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? 0,
      lastLocalMask: cps730Int(maskRaw.lastLocalMask, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? 0,
      masksExamined: cps730Int(maskRaw.masksExamined, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? 0,
      localWidth: cps730Int(maskRaw.localWidth, 0, n) ?? 0,
    },
    masksExamined: cps730Int(raw.masksExamined, 0, CPS730_MAX_EVIDENCE_ENTRIES)
      ?? cps730Int(maskRaw.masksExamined, 0, CPS730_MAX_EVIDENCE_ENTRIES)
      ?? 0,
    dpValue: cps730Int(raw.dpValue, 0, CPS730_MODULUS - 1),
    count,
    distinctCount: cps730Int(raw.distinctCount, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? count,
    bounded: raw.bounded === true,
    entryLimit: cps730Int(raw.entryLimit, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? CPS730_MAX_EVIDENCE_ENTRIES,
    shownCount,
    omittedCount: payloadOmitted,
    rendererOmittedCount: Math.max(0, normalizedEntries.all.length - normalizedEntries.displayed.length),
    truncated: raw.truncated === true,
    entries: normalizedEntries.displayed,
    groups,
    assertions: cps730EvidenceAssertions(raw.assertions),
  };
}
function cps730EvidenceSummary(raw, n) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return {
    interval: cps730StrictInterval(raw.interval, n),
    dpValue: cps730Int(raw.dpValue, 0, CPS730_MODULUS - 1),
    count: cps730Int(raw.count, 0, CPS730_MAX_EVIDENCE_ENTRIES),
    distinctCount: cps730Int(raw.distinctCount, 0, CPS730_MAX_EVIDENCE_ENTRIES),
    bounded: raw.bounded === true,
    shownCount: cps730Int(raw.shownCount, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? 0,
    omittedCount: cps730Int(raw.omittedCount, 0, CPS730_MAX_EVIDENCE_ENTRIES) ?? 0,
    truncated: raw.truncated === true,
  };
}
function cps730Dependency(raw, n) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const roles = ["middle", "duplicate", "drop-left", "drop-right", "overlap"];
  if (!roles.includes(raw.role)) return null;
  const sourceInterval = Array.isArray(raw.interval) ? raw.interval : [];
  const start = cps730Int(raw.start, 0, n) ?? cps730Int(sourceInterval[0], 0, n);
  const end = cps730Int(raw.end, -1, n - 1) ?? cps730Int(sourceInterval[1], -1, n - 1);
  const empty = raw.empty === true;
  if (start === null || end === null) return null;
  if (empty ? start <= end : start > end || start >= n) return null;
  return {
    role: raw.role,
    interval: [start, end],
    start,
    end,
    value: cps730Int(raw.value, 0, CPS730_MODULUS - 1) ?? 0,
    empty,
  };
}
function cps730Normalize(step) {
  const raw = step && step.countPalindromicSubsequences730View
    && typeof step.countPalindromicSubsequences730View === "object"
    && !Array.isArray(step.countPalindromicSubsequences730View)
    ? step.countPalindromicSubsequences730View
    : {};
  const inputRaw = raw.input && typeof raw.input === "object" && !Array.isArray(raw.input) ? raw.input : {};
  const rawCharacters = Array.from(cps730BoundedText(inputRaw.s, CPS730_MAX_LENGTH * 2, "?"));
  const suggestedLength = Math.max(1, Math.min(CPS730_MAX_LENGTH, rawCharacters.length));
  const n = cps730Int(inputRaw.length, 1, CPS730_MAX_LENGTH) ?? suggestedLength;
  const characters = Array.from({ length: n }, (_, index) => cps730InputCharacter(rawCharacters[index]));
  const sourceRaw = raw.source && typeof raw.source === "object" && !Array.isArray(raw.source) ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = cps730Int(sourceRaw.line, 1, CPS730_SOURCE.length)
    ?? cps730Int(fallbackLine, 1, CPS730_SOURCE.length)
    ?? 1;
  const event = Object.hasOwn(CPS730_EVENTS, raw.event) ? raw.event : CPS730_LINE_EVENTS[line - 1];
  const locale = cps730Locale();
  const cursorsRaw = raw.cursors && typeof raw.cursors === "object" && !Array.isArray(raw.cursors) ? raw.cursors : {};
  const interval = cps730StrictInterval(raw.interval, n);
  const matrix = (source, map) => Array.from({ length: n }, (_, row) => Array.from(
    { length: n },
    (_, column) => map(Array.isArray(source) && Array.isArray(source[row]) ? source[row][column] : null, row, column),
  ));
  const dp = matrix(raw.dp, (value) => cps730Int(value, 0, CPS730_MODULUS - 1) ?? 0);
  const computedMask = matrix(raw.computedMask, (value) => value === true);
  const evidenceTable = matrix(raw.evidenceTable, (value) => cps730EvidenceSummary(value, n));
  const endpointRaw = raw.endpoint && typeof raw.endpoint === "object" && !Array.isArray(raw.endpoint) ? raw.endpoint : {};
  const scanRaw = raw.scan && typeof raw.scan === "object" && !Array.isArray(raw.scan) ? raw.scan : {};
  const recurrenceRaw = raw.recurrence && typeof raw.recurrence === "object" && !Array.isArray(raw.recurrence)
    ? raw.recurrence
    : {};
  const counterRaw = raw.counters && typeof raw.counters === "object" && !Array.isArray(raw.counters) ? raw.counters : {};
  const counters = {};
  CPS730_COUNTERS.forEach(([key]) => {
    counters[key] = cps730Int(counterRaw[key], 0, 1000000000) ?? 0;
  });
  const invariantRaw = raw.invariants && typeof raw.invariants === "object" && !Array.isArray(raw.invariants)
    ? raw.invariants
    : {};
  const invariants = {};
  CPS730_INVARIANTS.forEach(([key]) => { invariants[key] = cps730Boolean(invariantRaw[key]); });
  const conditionRaw = raw.condition && typeof raw.condition === "object" && !Array.isArray(raw.condition)
    ? raw.condition
    : {};
  const limitsRaw = inputRaw.limits && typeof inputRaw.limits === "object" && !Array.isArray(inputRaw.limits)
    ? inputRaw.limits
    : {};
  const branches = Object.keys(CPS730_BRANCHES);
  const dependencies = Array.isArray(raw.dependencyIntervals)
    ? raw.dependencyIntervals.slice(0, 5).map((item) => cps730Dependency(item, n)).filter(Boolean)
    : [];
  const activeEvidence = cps730Evidence(raw.activeEvidence, n, false);
  const finalEvidence = cps730Evidence(raw.finalEvidence, n, true);
  const final = raw.final === true || Boolean(step && step.final);
  const displayInterval = interval ?? (finalEvidence ? finalEvidence.rootInterval : null);
  const cursorLow = cps730Int(cursorsRaw.low, -1, n);
  const cursorHigh = cps730Int(cursorsRaw.high, -1, n);
  return {
    version: cps730Int(raw.version, 1, 100) ?? 1,
    problemId: raw.problemId === 730 ? 730 : 730,
    source: { line, text: CPS730_SOURCE[line - 1] },
    event,
    phase: Object.hasOwn(CPS730_PHASES, raw.phase) ? raw.phase : "setup",
    timing: raw.timing === "before" ? "before" : "after",
    condition: {
      expression: cps730BoundedText(conditionRaw.expression, 220, ""),
      result: cps730Boolean(conditionRaw.result),
    },
    input: {
      s: characters.join(""), characters, length: n, alphabet: [...CPS730_ALPHABET], modulus: CPS730_MODULUS,
      limits: {
        minLength: cps730Int(limitsRaw.minLength, 1, CPS730_MAX_LENGTH) ?? 1,
        maxLength: cps730Int(limitsRaw.maxLength, 1, CPS730_MAX_LENGTH) ?? CPS730_MAX_LENGTH,
        maxFrames: cps730Int(limitsRaw.maxFrames, 1, CPS730_MAX_FRAMES) ?? CPS730_MAX_FRAMES,
        maxEvidenceEntries: cps730Int(limitsRaw.maxEvidenceEntries, 0, CPS730_MAX_EVIDENCE_ENTRIES)
          ?? CPS730_MAX_EVIDENCE_ENTRIES,
      },
    },
    cursors: {
      i: cps730Int(cursorsRaw.i, -1, n - 1),
      j: cps730Int(cursorsRaw.j, 0, n),
      low: cursorLow,
      high: cursorHigh,
    },
    interval,
    displayInterval,
    endpoint: {
      leftChar: cps730NullableCharacter(endpointRaw.leftChar),
      rightChar: cps730NullableCharacter(endpointRaw.rightChar),
      equal: cps730Boolean(endpointRaw.equal),
    },
    scan: {
      target: cps730NullableCharacter(scanRaw.target),
      lowStart: cps730Int(scanRaw.lowStart, -1, n),
      highStart: cps730Int(scanRaw.highStart, -1, n),
      lowCondition: cps730Boolean(scanRaw.lowCondition),
      highCondition: cps730Boolean(scanRaw.highCondition),
      low: cps730Int(scanRaw.low, -1, n) ?? cursorLow,
      high: cps730Int(scanRaw.high, -1, n) ?? cursorHigh,
    },
    recurrence: {
      branch: branches.includes(recurrenceRaw.branch) ? recurrenceRaw.branch : "idle",
      formula: cps730BoundedText(recurrenceRaw.formula, 220, ""),
      middleValue: cps730Int(recurrenceRaw.middleValue, 0, CPS730_MODULUS - 1),
      duplicateValue: cps730Int(recurrenceRaw.duplicateValue, 0, CPS730_MODULUS - 1),
      rawValue: cps730Int(recurrenceRaw.rawValue, -1000000000000, 1000000000000),
      value: cps730Int(recurrenceRaw.value, 0, CPS730_MODULUS - 1),
    },
    dependencies,
    dpAllocated: raw.dpAllocated === true,
    dp,
    computedMask,
    evidenceTable,
    activeEvidence,
    finalEvidence,
    evidence: final && finalEvidence ? finalEvidence : activeEvidence,
    counters,
    invariants: {
      definition: cps730BoundedText(invariantRaw.definition, 500, ""),
      ...invariants,
    },
    answer: cps730Int(raw.answer, 0, CPS730_MODULUS - 1),
    final,
    title: cps730LocalizedText(step && step.title, locale, CPS730_TEXT[locale].fallback),
    note: cps730LocalizedText(step && step.note, locale, ""),
  };
}
function cps730PairLabel(dictionary, key, locale) {
  const pair = dictionary[key];
  return pair ? pair[locale === "vi" ? 1 : 0] : key;
}
function cps730EventLabel(event, locale) {
  return cps730PairLabel(CPS730_EVENTS, event, locale);
}
function cps730PhaseLabel(phase, locale) {
  return cps730PairLabel(CPS730_PHASES, phase, locale);
}
function cps730BranchLabel(branch, locale) {
  return cps730PairLabel(CPS730_BRANCHES, branch, locale);
}
function cps730Value(value, fallback = "—") {
  return value === null ? fallback : String(value);
}
function cps730IntervalLabel(interval, copy) {
  return interval ? `[${interval[0]}, ${interval[1]}]` : copy.none;
}
function cps730Rail(state, copy, locale) {
  return `<nav class="cps730-rail-wrap" aria-label="${cps730Escape(copy.rail)}" tabindex="0"><ol class="cps730-rail">${CPS730_SOURCE.map((source, index) => {
    const current = index + 1 === state.source.line;
    const action = CPS730_LINE_ACTIONS[index][locale === "vi" ? 1 : 0];
    const currentEvent = current ? `<em>${cps730Escape(cps730EventLabel(state.event, locale))}</em>` : "";
    return `<li class="${current ? "cps730-current" : ""}"${current ? ' aria-current="step"' : ""}><small>L${index + 1} · ${cps730Escape(action)}</small><code>${cps730Escape(source)}</code>${currentEvent}</li>`;
  }).join("")}</ol></nav>`;
}
function cps730SourcePanel(state, copy, locale) {
  const condition = state.condition.result === null
    ? copy.noCondition
    : `${state.condition.expression || "—"} → ${state.condition.result ? copy.yes : copy.no}`;
  return `<section class="cps730-source" aria-labelledby="cps730-source-title"><div class="cps730-source-code"><small id="cps730-source-title">${cps730Escape(copy.sourceAction)}</small><code>${cps730Escape(state.source.text)}</code></div><dl><div><dt>${cps730Escape(copy.phase)}</dt><dd>${cps730Escape(cps730PhaseLabel(state.phase, locale))}</dd></div><div><dt>${cps730Escape(copy.event)}</dt><dd>${cps730Escape(cps730EventLabel(state.event, locale))}</dd></div><div><dt>${cps730Escape(copy.condition)}</dt><dd>${cps730Escape(condition)}</dd></div></dl></section>`;
}
function cps730IndexedInput(state, copy) {
  const cells = state.input.characters.map((character, index) => {
    const cursors = [];
    if (state.cursors.i === index) cursors.push("i");
    if (state.cursors.j === index) cursors.push("j");
    if (state.cursors.low === index) cursors.push("low");
    if (state.cursors.high === index) cursors.push("high");
    const inInterval = state.displayInterval && index >= state.displayInterval[0] && index <= state.displayInterval[1];
    const inScan = state.scan.low !== null && state.scan.high !== null && index >= state.scan.low && index <= state.scan.high;
    const classes = [
      inInterval ? "cps730-in-interval" : "", inScan ? "cps730-in-scan" : "",
      ...cursors.map((cursor) => `cps730-is-${cursor}`),
    ].filter(Boolean).join(" ");
    const cursorText = cursors.length ? ` · ${cursors.join(", ")}` : "";
    return `<li class="${classes}" aria-label="${cps730Escape(`${index}: ${character}${cursorText}`)}"><small>${cps730Escape(index)}</small><strong>${cps730Escape(character)}</strong><span>${cursors.map((cursor) => `<b class="cps730-cursor-${cursor}">${cps730Escape(cursor)}</b>`).join("")}</span></li>`;
  }).join("");
  const cursorValue = (value) => cps730Escape(cps730Value(value));
  return `<section class="cps730-card cps730-input" aria-labelledby="cps730-input-title"><header><div><h3 id="cps730-input-title">${cps730Escape(copy.indexedInput)}</h3><p>${cps730Escape(copy.inputHelp)}</p></div><strong>${cps730Escape(state.input.s)}</strong></header><div class="cps730-character-scroll" tabindex="0" role="region" aria-label="${cps730Escape(copy.indexedInput)}"><ol>${cells}</ol></div><dl><div><dt>${cps730Escape(copy.length)}</dt><dd>${cps730Escape(state.input.length)}</dd></div><div><dt>${cps730Escape(copy.interval)}</dt><dd>${cps730Escape(cps730IntervalLabel(state.displayInterval, copy))}</dd></div><div><dt>${cps730Escape(copy.cursors)}</dt><dd>i=${cursorValue(state.cursors.i)} · j=${cursorValue(state.cursors.j)} · low=${cursorValue(state.cursors.low)} · high=${cursorValue(state.cursors.high)}</dd></div><div><dt>${cps730Escape(copy.answer)}</dt><dd>${cps730Escape(cps730Value(state.answer, copy.pending))}</dd></div></dl></section>`;
}
function cps730CellDependencies(state, row, column) {
  return state.dependencies.filter((dependency) => !dependency.empty && dependency.start === row && dependency.end === column);
}
function cps730RoleLabel(role, copy) {
  const suffix = role.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
  return copy[`role${suffix}`] ?? role;
}
function cps730DpTable(state, copy) {
  const heads = Array.from({ length: state.input.length }, (_, column) => {
    const active = state.cursors.j === column;
    return `<th scope="col" class="${active ? "cps730-head-j" : ""}"><span>${cps730Escape(column)}</span>${active ? "<small>j</small>" : ""}</th>`;
  }).join("");
  const rows = Array.from({ length: state.input.length }, (_, row) => {
    const rowActive = state.cursors.i === row;
    const cells = Array.from({ length: state.input.length }, (_, column) => {
      if (column < row) {
        return `<td class="cps730-dp-cell cps730-unused" aria-label="${cps730Escape(`dp[${row}][${column}]: ${copy.unused}`)}"><span>—</span></td>`;
      }
      const computed = state.computedMask[row][column];
      const active = Boolean(state.displayInterval && state.displayInterval[0] === row && state.displayInterval[1] === column);
      const dependencies = cps730CellDependencies(state, row, column);
      const classes = [
        "cps730-dp-cell", computed ? "cps730-computed" : "cps730-uncomputed", active ? "cps730-active" : "",
        dependencies.length ? "cps730-dependency" : "",
        ...dependencies.map((dependency) => `cps730-dependency-${dependency.role}`),
      ].filter(Boolean).join(" ");
      const status = computed ? `${copy.computed}, ${copy.value} ${state.dp[row][column]}` : copy.uncomputed;
      const roles = dependencies.map((dependency) => cps730RoleLabel(dependency.role, copy)).join(" · ");
      return `<td class="${classes}" aria-label="${cps730Escape(`dp[${row}][${column}]: ${status}${roles ? `, ${roles}` : ""}`)}"><strong>${computed ? cps730Escape(state.dp[row][column]) : "·"}</strong>${roles ? `<small>${cps730Escape(roles)}</small>` : ""}</td>`;
    }).join("");
    return `<tr><th scope="row" class="${rowActive ? "cps730-head-i" : ""}"><span>${cps730Escape(row)}</span>${rowActive ? "<small>i</small>" : ""}</th>${cells}</tr>`;
  }).join("");
  const allocation = state.dpAllocated ? copy.allocated : copy.allocationPending;
  return `<section class="cps730-card cps730-dp" aria-labelledby="cps730-dp-title"><header><div><h3 id="cps730-dp-title">${cps730Escape(copy.dp)}</h3><p>${cps730Escape(copy.dpHelp)}</p></div><strong class="${state.dpAllocated ? "cps730-ready" : "cps730-waiting"}">${cps730Escape(allocation)}</strong></header><div class="cps730-table-scroll" tabindex="0" role="region" aria-label="${cps730Escape(copy.dp)}"><table><caption>${cps730Escape(copy.dpHelp)}</caption><thead><tr><th scope="col">${cps730Escape(copy.rowColumn)}</th>${heads}</tr></thead><tbody>${rows}</tbody></table></div><ul class="cps730-legend" aria-label="${cps730Escape(copy.legend)}"><li class="cps730-legend-active">${cps730Escape(copy.activeCell)}</li><li class="cps730-legend-dependency">${cps730Escape(copy.dependencyCell)}</li><li class="cps730-legend-i">i</li><li class="cps730-legend-j">j</li></ul></section>`;
}
function cps730GuardLabel(value, copy) {
  if (value === null) return copy.notEvaluated;
  return value ? copy.holds : copy.stops;
}
function cps730EndpointPanel(state, copy) {
  const relation = state.endpoint.equal === true ? copy.equal : state.endpoint.equal === false ? copy.unequal : copy.undecided;
  const relationClass = state.endpoint.equal === true ? "cps730-equal" : state.endpoint.equal === false ? "cps730-unequal" : "cps730-undecided";
  const scanCells = state.input.characters.map((character, index) => {
    const markers = [];
    if (state.scan.low === index) markers.push("low");
    if (state.scan.high === index) markers.push("high");
    const isTarget = state.scan.target !== null && character === state.scan.target;
    const inWindow = state.scan.low !== null && state.scan.high !== null && index >= state.scan.low && index <= state.scan.high;
    const classes = [isTarget ? "cps730-target-match" : "", inWindow ? "cps730-scan-window" : "", ...markers.map((item) => `cps730-scan-${item}`)].filter(Boolean).join(" ");
    return `<li class="${classes}"><small>${cps730Escape(index)}</small><strong>${cps730Escape(character)}</strong><span>${markers.map((item) => `<b>${cps730Escape(item)}</b>`).join("")}</span></li>`;
  }).join("");
  return `<section class="cps730-card cps730-endpoints" aria-labelledby="cps730-endpoints-title"><header><div><h3 id="cps730-endpoints-title">${cps730Escape(copy.endpointScan)}</h3><p>${cps730Escape(copy.endpointHelp)}</p></div><strong class="${relationClass}">${cps730Escape(relation)}</strong></header><div class="cps730-endpoint-equation"><article><small>${cps730Escape(copy.leftEndpoint)}</small><strong>${cps730Escape(state.endpoint.leftChar ?? "—")}</strong></article><span aria-hidden="true">${state.endpoint.equal === true ? "=" : state.endpoint.equal === false ? "≠" : "?"}</span><article><small>${cps730Escape(copy.rightEndpoint)}</small><strong>${cps730Escape(state.endpoint.rightChar ?? "—")}</strong></article></div><dl class="cps730-scan-summary"><div><dt>${cps730Escape(copy.target)}</dt><dd>${cps730Escape(state.scan.target ?? "—")}</dd></div><div><dt>${cps730Escape(copy.scanStart)}</dt><dd>low=${cps730Escape(cps730Value(state.scan.lowStart))} · high=${cps730Escape(cps730Value(state.scan.highStart))}</dd></div><div><dt>${cps730Escape(copy.scanNow)}</dt><dd>low=${cps730Escape(cps730Value(state.scan.low))} · high=${cps730Escape(cps730Value(state.scan.high))}</dd></div><div><dt>${cps730Escape(copy.lowGuard)}</dt><dd>${cps730Escape(cps730GuardLabel(state.scan.lowCondition, copy))}</dd></div><div><dt>${cps730Escape(copy.highGuard)}</dt><dd>${cps730Escape(cps730GuardLabel(state.scan.highCondition, copy))}</dd></div></dl><div class="cps730-scan-scroll" tabindex="0" role="region" aria-label="${cps730Escape(copy.endpointScan)}"><ol>${scanCells}</ol></div></section>`;
}
function cps730RecurrenceCase(state) {
  const event = state.event;
  if (state.recurrence.branch === "unequal-endpoints" || state.recurrence.branch === "unequal-endpoints-pending"
    || event === "endpoint-condition-false" || event === "unequal-endpoint-branch" || event === "write-unequal-endpoints") return "unequal";
  if (state.recurrence.branch === "zero-inner-match" || event === "zero-inner-match-condition-true"
    || event === "write-zero-inner-match") return "zero";
  if (state.recurrence.branch === "one-inner-match" || event === "one-inner-match-condition-true"
    || event === "write-one-inner-match") return "one";
  if (state.recurrence.branch === "multiple-inner-matches" || event === "one-inner-match-condition-false"
    || event === "multiple-inner-match-branch" || event === "write-multiple-inner-matches") return "multiple";
  return null;
}
function cps730SignedValue(value) {
  if (value === null) return "—";
  return value < 0 ? `−${Math.abs(value)}` : `+${value}`;
}
function cps730Dependencies(state, copy) {
  if (!state.dependencies.length) return `<div class="cps730-empty">${cps730Escape(copy.unavailable)}</div>`;
  return `<ul>${state.dependencies.map((dependency) => {
    const interval = dependency.empty ? copy.emptyInterval : `[${dependency.start}, ${dependency.end}]`;
    return `<li class="cps730-dependency-${dependency.role} ${dependency.empty ? "cps730-empty-dependency" : ""}"><strong>${cps730Escape(cps730RoleLabel(dependency.role, copy))}</strong><code>${cps730Escape(interval)}</code><span>${cps730Escape(copy.value)} ${cps730Escape(dependency.value)}</span></li>`;
  }).join("")}</ul>`;
}
function cps730RecurrencePanel(state, copy, locale) {
  const selected = cps730RecurrenceCase(state);
  const cases = [
    ["unequal", copy.unequalCase, copy.unequalFormula, copy.unequalHelp],
    ["zero", copy.zeroCase, copy.zeroFormula, copy.zeroHelp],
    ["one", copy.oneCase, copy.oneFormula, copy.oneHelp],
    ["multiple", copy.multipleCase, copy.multipleFormula, copy.multipleHelp],
  ];
  const cards = cases.map(([key, label, formula, help]) => {
    const active = selected === key;
    return `<article class="cps730-case cps730-case-${key} ${active ? "cps730-case-active" : ""}"${active ? ' aria-current="true"' : ""}><small>${cps730Escape(active ? copy.activeCase : copy.inactiveCase)}</small><h4>${cps730Escape(label)}</h4><code>${cps730Escape(formula)}</code><p>${cps730Escape(help)}</p></article>`;
  }).join("");
  const formula = state.recurrence.formula || copy.unavailable;
  return `<section class="cps730-card cps730-recurrence" aria-labelledby="cps730-recurrence-title"><header><div><h3 id="cps730-recurrence-title">${cps730Escape(copy.recurrence)}</h3><p>${cps730Escape(copy.recurrenceHelp)}</p></div><strong>${cps730Escape(cps730BranchLabel(state.recurrence.branch, locale))}</strong></header><div class="cps730-cases">${cards}</div><dl class="cps730-arithmetic"><div><dt>${cps730Escape(copy.traceFormula)}</dt><dd><code>${cps730Escape(formula)}</code></dd></div><div><dt>${cps730Escape(copy.middle)}</dt><dd>${cps730Escape(cps730Value(state.recurrence.middleValue))}</dd></div><div><dt>${cps730Escape(copy.duplicate)}</dt><dd>${cps730Escape(cps730Value(state.recurrence.duplicateValue))}</dd></div><div class="cps730-raw-value"><dt>${cps730Escape(copy.signedRaw)}</dt><dd>${cps730Escape(cps730SignedValue(state.recurrence.rawValue))}</dd></div><div class="cps730-normalized-value"><dt>${cps730Escape(copy.normalized)}</dt><dd>${cps730Escape(cps730Value(state.recurrence.value))} <small>(mod ${cps730Escape(CPS730_MODULUS)})</small></dd></div></dl><div class="cps730-dependencies"><h4>${cps730Escape(copy.dependencies)}</h4>${cps730Dependencies(state, copy)}</div></section>`;
}
function cps730MaskLabel(mask, width) {
  return `0b${mask.toString(2).padStart(width, "0")}`;
}
function cps730EvidencePanel(state, copy) {
  const evidence = state.evidence;
  if (!evidence) {
    return `<section class="cps730-card cps730-evidence" aria-labelledby="cps730-evidence-title"><header><div><h3 id="cps730-evidence-title">${cps730Escape(copy.evidence)}</h3><p>${cps730Escape(copy.evidenceHelp)}</p></div><strong>${cps730Escape(copy.pending)}</strong></header><div class="cps730-empty">${cps730Escape(copy.evidencePending)}</div></section>`;
  }
  const kind = state.final && state.finalEvidence === evidence ? copy.finalEvidence : copy.activeEvidence;
  const displayedCount = evidence.entries.length;
  const omittedCount = Math.max(evidence.omittedCount, evidence.rendererOmittedCount, evidence.count - displayedCount, 0);
  const groups = evidence.groups.map((group) => {
    const entries = group.entries.length ? `<ol>${group.entries.map((entry) => `<li><div><code>${cps730Escape(entry.palindrome)}</code><small>${cps730Escape(copy.indices)} [${entry.indexTuple.map(cps730Escape).join(", ")}]</small></div><span>${cps730Escape(copy.mask)} ${cps730Escape(cps730MaskLabel(entry.absoluteMask, state.input.length))}<small>${cps730Escape(copy.localMask)} ${cps730Escape(cps730MaskLabel(entry.localMask, state.input.length))}</small></span></li>`).join("")}</ol>` : `<p>${cps730Escape(copy.noValues)}</p>`;
    return `<article class="cps730-evidence-group"><header><div><small>${cps730Escape(copy.outerGroup)}</small><strong>${cps730Escape(group.outerChar)}</strong></div><span>${cps730Escape(group.count)}</span></header>${entries}</article>`;
  }).join("");
  const masksExamined = evidence.masksExamined || evidence.maskEnumeration.masksExamined;
  const complete = evidence.bounded && !evidence.truncated && evidence.omittedCount === 0;
  const omitted = omittedCount > 0 ? `<p class="cps730-omitted"><strong>${cps730Escape(omittedCount)}</strong> ${cps730Escape(copy.omitted)}. ${cps730Escape(copy.evidenceCap)}</p>` : "";
  return `<section class="cps730-card cps730-evidence" aria-labelledby="cps730-evidence-title"><header><div><h3 id="cps730-evidence-title">${cps730Escape(copy.evidence)}</h3><p>${cps730Escape(copy.evidenceHelp)}</p></div><strong>${cps730Escape(kind)}</strong></header><dl class="cps730-evidence-summary"><div><dt>${cps730Escape(copy.distinctCount)}</dt><dd>${cps730Escape(evidence.distinctCount)}</dd></div><div><dt>${cps730Escape(copy.listShown)}</dt><dd>${cps730Escape(displayedCount)} / ${cps730Escape(evidence.count)}</dd></div><div><dt>${cps730Escape(copy.masksExamined)}</dt><dd>${cps730Escape(masksExamined)}</dd></div><div><dt>${cps730Escape(copy.boundedComplete)}</dt><dd class="${complete ? "cps730-pass-text" : "cps730-warn-text"}">${cps730Escape(complete ? copy.yes : copy.boundedPartial)}</dd></div><div><dt>${cps730Escape(copy.representativeRule)}</dt><dd>${cps730Escape(evidence.representativeRule || copy.unavailable)}</dd></div></dl><div class="cps730-evidence-scroll" tabindex="0" role="region" aria-label="${cps730Escape(copy.evidence)}"><div class="cps730-evidence-groups">${groups}</div></div>${omitted}</section>`;
}
function cps730InvariantPanel(state, copy, locale) {
  return `<section class="cps730-card cps730-invariants" aria-labelledby="cps730-invariants-title"><header><div><h3 id="cps730-invariants-title">${cps730Escape(copy.invariants)}</h3><p>${cps730Escape(copy.invariantDefinition)}</p></div></header><ul>${CPS730_INVARIANTS.map(([key, en, vi]) => {
    const value = state.invariants[key];
    const statusClass = value === true ? "cps730-pass" : value === false ? "cps730-fail" : "cps730-na";
    const symbol = value === true ? "✓" : value === false ? "×" : "·";
    const status = value === true ? copy.pass : value === false ? copy.fail : copy.notApplicable;
    return `<li class="${statusClass}"><span aria-hidden="true">${symbol}</span><strong>${cps730Escape(locale === "vi" ? vi : en)}</strong><small>${cps730Escape(status)}</small></li>`;
  }).join("")}</ul></section>`;
}
function cps730CounterPanel(state, copy, locale) {
  return `<section class="cps730-card cps730-counters" aria-labelledby="cps730-counters-title"><header><h3 id="cps730-counters-title">${cps730Escape(copy.counters)}</h3></header><ul>${CPS730_COUNTERS.map(([key, en, vi]) => `<li><small>${cps730Escape(locale === "vi" ? vi : en)}</small><strong>${cps730Escape(state.counters[key])}</strong></li>`).join("")}</ul></section>`;
}
function renderCountPalindromicSubsequences730View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = cps730Locale();
  const copy = CPS730_TEXT[locale];
  const state = cps730Normalize(step);
  const event = cps730EventLabel(state.event, locale);
  const note = state.note
    ? `<aside class="cps730-note"><strong>${cps730Escape(copy.note)}</strong><p>${cps730Escape(state.note)}</p></aside>`
    : "";
  host.innerHTML = `<article class="cps730-viz ${state.final ? "cps730-final" : ""} cps730-branch-${state.recurrence.branch}" role="region" aria-label="${cps730Escape(`${copy.fallback}, ${copy.line} ${state.source.line}, ${event}`)}"><header class="cps730-header"><div><span>${cps730Escape(copy.kicker)}</span><h2>${cps730Escape(state.title)}</h2></div><div><strong>${cps730Escape(copy.line)} ${cps730Escape(state.source.line)}</strong><span>${cps730Escape(state.timing === "before" ? copy.before : copy.after)}</span><em>${cps730Escape(event)}</em></div></header>${cps730Rail(state, copy, locale)}${cps730SourcePanel(state, copy, locale)}${cps730IndexedInput(state, copy)}<div class="cps730-main-grid">${cps730DpTable(state, copy)}${cps730EndpointPanel(state, copy)}</div>${cps730RecurrencePanel(state, copy, locale)}${cps730EvidencePanel(state, copy)}<div class="cps730-footer-grid">${cps730InvariantPanel(state, copy, locale)}${cps730CounterPanel(state, copy, locale)}</div>${note}</article>`;
}
