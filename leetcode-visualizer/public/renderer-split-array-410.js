"use strict";

const SA410_SOURCE = Object.freeze([
  "class Solution:",
  "    def splitArray(self, nums, k):",
  "        left, right = max(nums), sum(nums)",
  "        while left < right:",
  "            mid = (left + right) // 2",
  "            groups = self.count_groups(nums, mid)",
  "            if groups <= k:",
  "                right = mid",
  "            else:",
  "                left = mid + 1",
  "        cuts = self.build_cuts(nums, k, left)",
  "        return left",
  "    def count_groups(self, nums, limit):",
  "        groups, running = 1, 0",
  "        for num in nums:",
  "            if running + num > limit:",
  "                groups += 1",
  "                running = 0",
  "            running += num",
  "        return groups",
  "    def build_cuts(self, nums, k, limit):",
  "        cuts = []",
  "        groups_left, suffix_sum = k, 0",
  "        for i in range(len(nums) - 1, -1, -1):",
  "            must_cut = suffix_sum + nums[i] > limit or i + 1 < groups_left",
  "            if must_cut:",
  "                cuts.append(i + 1)",
  "                groups_left -= 1",
  "                suffix_sum = 0",
  "            suffix_sum += nums[i]",
  "        return sorted(cuts)",
]);

const SA410_LINE_EVENTS = Object.freeze([
  "bind-class",
  "bind-split-method",
  "initialize-bounds",
  "while-true",
  "choose-mid",
  "count-call",
  "feasible-mid",
  "move-right",
  "else-branch",
  "move-left",
  "cuts-call",
  "final-return",
  "count-entry",
  "count-initialize",
  "count-loop",
  "overflow-false",
  "open-greedy-group",
  "reset-running",
  "add-running",
  "count-return",
  "cuts-entry",
  "cuts-initialize",
  "witness-state-initialize",
  "witness-loop",
  "must-cut-false",
  "cut-branch-false",
  "append-cut",
  "decrement-groups-left",
  "reset-suffix",
  "add-suffix",
  "cuts-return",
]);

const SA410_EVENTS = Object.freeze({
  "bind-class": { en: "Bind class", vi: "Liên kết lớp" },
  "bind-split-method": { en: "Bind answer method", vi: "Liên kết hàm giải" },
  "bind-count-method": { en: "Bind greedy helper", vi: "Liên kết helper tham lam" },
  "bind-cuts-method": { en: "Bind witness helper", vi: "Liên kết helper witness" },
  "initialize-bounds": { en: "Initialize answer bounds", vi: "Khởi tạo biên đáp án" },
  "while-true": { en: "Continue lower-bound search", vi: "Tiếp tục tìm lower-bound" },
  "while-false": { en: "Finish lower-bound search", vi: "Kết thúc tìm lower-bound" },
  "choose-mid": { en: "Choose candidate capacity", vi: "Chọn capacity ứng viên" },
  "count-call": { en: "Call greedy feasibility scan", vi: "Gọi phép quét khả thi tham lam" },
  "count-entry": { en: "Enter greedy helper", vi: "Vào helper tham lam" },
  "count-initialize": { en: "Initialize greedy group", vi: "Khởi tạo nhóm tham lam" },
  "count-loop": { en: "Read next value", vi: "Đọc giá trị kế tiếp" },
  "count-loop-complete": { en: "Complete greedy loop", vi: "Hoàn tất vòng lặp tham lam" },
  "overflow-true": { en: "Capacity would overflow", vi: "Sẽ vượt capacity" },
  "overflow-false": { en: "Value fits current group", vi: "Giá trị vừa nhóm hiện tại" },
  "open-greedy-group": { en: "Open a new greedy group", vi: "Mở nhóm tham lam mới" },
  "reset-running": { en: "Reset running sum", vi: "Đặt lại tổng chạy" },
  "add-running": { en: "Add value to group", vi: "Cộng giá trị vào nhóm" },
  "count-return": { en: "Return minimum group count", vi: "Trả số nhóm tối thiểu" },
  "count-assignment": { en: "Assign returned group count", vi: "Gán số nhóm trả về" },
  "feasible-mid": { en: "Candidate is feasible", vi: "Ứng viên khả thi" },
  "infeasible-mid": { en: "Candidate is infeasible", vi: "Ứng viên bất khả thi" },
  "move-right": { en: "Keep feasible upper bound", vi: "Giữ biên trên khả thi" },
  "else-branch": { en: "Enter infeasible branch", vi: "Vào nhánh bất khả thi" },
  "move-left": { en: "Exclude small capacities", vi: "Loại capacity quá nhỏ" },
  "cuts-call": { en: "Call witness reconstruction", vi: "Gọi tái dựng witness" },
  "cuts-entry": { en: "Enter witness helper", vi: "Vào helper witness" },
  "cuts-initialize": { en: "Initialize cut list", vi: "Khởi tạo danh sách cut" },
  "witness-state-initialize": { en: "Initialize reverse scan", vi: "Khởi tạo quét ngược" },
  "witness-loop": { en: "Visit reverse-scan value", vi: "Xét giá trị khi quét ngược" },
  "witness-loop-complete": { en: "Complete reverse scan", vi: "Hoàn tất quét ngược" },
  "must-cut-true": { en: "A witness cut is required", vi: "Bắt buộc cắt witness" },
  "must-cut-false": { en: "No witness cut is needed", vi: "Chưa cần cắt witness" },
  "cut-branch-true": { en: "Execute cut branch", vi: "Thực thi nhánh cắt" },
  "cut-branch-false": { en: "Skip cut branch", vi: "Bỏ qua nhánh cắt" },
  "append-cut": { en: "Record boundary", vi: "Ghi lại biên" },
  "decrement-groups-left": { en: "Reserve completed group", vi: "Dành chỗ cho nhóm hoàn tất" },
  "reset-suffix": { en: "Reset suffix sum", vi: "Đặt lại tổng suffix" },
  "add-suffix": { en: "Extend suffix group", vi: "Mở rộng nhóm suffix" },
  "cuts-return": { en: "Return sorted boundaries", vi: "Trả các biên đã sắp xếp" },
  "cuts-assignment": { en: "Assign exact-k witness", vi: "Gán witness đúng k nhóm" },
  "final-return": { en: "Return optimal capacity", vi: "Trả capacity tối ưu" },
});

const SA410_COUNTERS = Object.freeze([
  ["searchIterations", { en: "Search rounds", vi: "Vòng tìm kiếm" }],
  ["feasibilityCalls", { en: "Greedy scans", vi: "Lần quét tham lam" }],
  ["loopVisits", { en: "Greedy visits", vi: "Lượt xét tham lam" }],
  ["overflowChecks", { en: "Capacity checks", vi: "Lần kiểm tra capacity" }],
  ["greedyCuts", { en: "Greedy cuts", vi: "Cut tham lam" }],
  ["runningAdds", { en: "Running additions", vi: "Phép cộng tổng chạy" }],
  ["feasibleChecks", { en: "Feasibility decisions", vi: "Quyết định khả thi" }],
  ["feasibleMids", { en: "Feasible mids", vi: "Mid khả thi" }],
  ["infeasibleMids", { en: "Rejected mids", vi: "Mid bị loại" }],
  ["upperUpdates", { en: "right updates", vi: "Lần đổi right" }],
  ["lowerUpdates", { en: "left updates", vi: "Lần đổi left" }],
  ["reconstructionVisits", { en: "Reverse visits", vi: "Lượt quét ngược" }],
  ["reconstructionChecks", { en: "Cut-rule checks", vi: "Lần kiểm tra cắt" }],
  ["witnessCuts", { en: "Witness cuts", vi: "Cut witness" }],
  ["capacityCuts", { en: "Capacity-forced", vi: "Cắt do capacity" }],
  ["remainingCuts", { en: "Count-forced", vi: "Cắt do số nhóm" }],
  ["suffixAdds", { en: "Suffix additions", vi: "Phép cộng suffix" }],
]);

const SA410_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Split Array Largest Sum exact binary-search visualization",
    kicker: "LEETCODE 410 · BINARY SEARCH ON ANSWER",
    fallbackTitle: "Split Array Largest Sum",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    eventRail: "Exact source and runtime event rail",
    sourceAction: "Current source action",
    phase: "Phase",
    event: "Event",
    condition: "Condition",
    noCondition: "No condition on this frame.",
    trueValue: "TRUE",
    falseValue: "FALSE",
    pending: "pending",
    none: "—",
    search: "Answer-space lower-bound search",
    searchHelp: "Every capacity below left is excluded; right remains feasible.",
    left: "left",
    right: "right",
    mid: "mid",
    iteration: "iteration",
    smallest: "largest value",
    total: "total sum",
    range: "remaining width",
    outcome: "decision",
    feasible: "FEASIBLE",
    infeasible: "INFEASIBLE",
    searching: "SEARCHING",
    converged: "CONVERGED",
    lastFeasible: "last feasible",
    lastRejected: "last rejected",
    invariants: "Search invariants",
    leftInvariant: "left ≥ max(nums)",
    orderInvariant: "left ≤ right",
    rightInvariant: "right is feasible",
    excludedInvariant: "all capacities below left are excluded",
    holds: "holds",
    awaiting: "awaiting",
    minimality: "Minimality evidence",
    structuralProof: "Anything smaller is below the largest input value.",
    greedyProof: "answer − 1 was rejected by the greedy group count.",
    proofPending: "The bounds have not converged yet.",
    array: "Input and current contiguous grouping",
    arrayHelp: "A boundary is drawn before every new group; the active value is outlined.",
    index: "index",
    value: "value",
    group: "group",
    unassigned: "not scanned",
    current: "current",
    greedy: "Greedy feasibility scan",
    greedyHelp: "Cut only when adding the next value would exceed mid; this minimizes the number of groups.",
    limit: "capacity",
    running: "running sum",
    prospective: "sum + value",
    processed: "processed",
    groups: "groups needed",
    groupSums: "Current greedy groups",
    scanWaiting: "No feasibility scan has started.",
    emptyGroups: "No value has been assigned to a greedy group yet.",
    cutDecision: "Latest greedy cut decision",
    cutBefore: "boundary before index",
    reason: "reason",
    witness: "Deterministic exact-k reconstruction",
    witnessHelp: "Scan right-to-left. Cut for capacity, or force a cut when the prefix needs one element per remaining group.",
    reverseIndex: "reverse index",
    groupsLeft: "groups left",
    suffix: "suffix sum",
    cuts: "reverse-order cuts",
    sortedCuts: "sorted cuts",
    capacityRule: "Capacity rule",
    capacityRuleHelp: "suffix_sum + nums[i] > answer",
    countRule: "Remaining-elements rule",
    countRuleHelp: "i + 1 < groups_left",
    required: "CUT",
    notRequired: "KEEP",
    witnessWaiting: "Witness reconstruction has not started.",
    result: "Exact-k partition witness",
    resultHelp: "These nonempty contiguous groups concatenate back to nums and each sum is at most the answer.",
    answer: "minimum largest sum",
    groupSum: "sum",
    values: "values",
    resultWaiting: "The exact-k witness appears after reconstruction.",
    counters: "Operation counters",
    note: "Why this frame matters",
  }),
  vi: Object.freeze({
    region: "Minh họa tìm kiếm nhị phân chính xác cho Split Array Largest Sum",
    kicker: "LEETCODE 410 · BINARY SEARCH TRÊN ĐÁP ÁN",
    fallbackTitle: "Chia mảng để tổng lớn nhất nhỏ nhất",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    eventRail: "Mã nguồn chính xác và chuỗi sự kiện runtime",
    sourceAction: "Thao tác mã nguồn hiện tại",
    phase: "Giai đoạn",
    event: "Sự kiện",
    condition: "Điều kiện",
    noCondition: "Frame này không có điều kiện.",
    trueValue: "ĐÚNG",
    falseValue: "SAI",
    pending: "đang chờ",
    none: "—",
    search: "Tìm lower-bound trong không gian đáp án",
    searchHelp: "Mọi capacity dưới left đã bị loại; right luôn khả thi.",
    left: "left",
    right: "right",
    mid: "mid",
    iteration: "vòng",
    smallest: "phần tử lớn nhất",
    total: "tổng toàn mảng",
    range: "độ rộng còn lại",
    outcome: "quyết định",
    feasible: "KHẢ THI",
    infeasible: "BẤT KHẢ THI",
    searching: "ĐANG TÌM",
    converged: "ĐÃ HỘI TỤ",
    lastFeasible: "khả thi gần nhất",
    lastRejected: "bị loại gần nhất",
    invariants: "Bất biến tìm kiếm",
    leftInvariant: "left ≥ max(nums)",
    orderInvariant: "left ≤ right",
    rightInvariant: "right khả thi",
    excludedInvariant: "mọi capacity dưới left đã bị loại",
    holds: "đúng",
    awaiting: "đang chờ",
    minimality: "Bằng chứng tối thiểu",
    structuralProof: "Mọi giá trị nhỏ hơn đều dưới phần tử lớn nhất của input.",
    greedyProof: "answer − 1 đã bị số nhóm tham lam loại bỏ.",
    proofPending: "Hai biên chưa hội tụ.",
    array: "Input và cách chia liên tiếp hiện tại",
    arrayHelp: "Một đường biên nằm trước mỗi nhóm mới; giá trị đang xét có viền nổi bật.",
    index: "index",
    value: "giá trị",
    group: "nhóm",
    unassigned: "chưa quét",
    current: "đang xét",
    greedy: "Phép quét khả thi tham lam",
    greedyHelp: "Chỉ cắt khi thêm giá trị kế tiếp sẽ vượt mid; quy tắc này tối thiểu hóa số nhóm.",
    limit: "capacity",
    running: "tổng chạy",
    prospective: "tổng + giá trị",
    processed: "đã xử lý",
    groups: "số nhóm cần",
    groupSums: "Các nhóm tham lam hiện tại",
    scanWaiting: "Chưa bắt đầu phép quét khả thi.",
    emptyGroups: "Chưa gán giá trị nào vào nhóm tham lam.",
    cutDecision: "Quyết định cắt tham lam gần nhất",
    cutBefore: "biên trước index",
    reason: "lý do",
    witness: "Tái dựng đúng k nhóm một cách xác định",
    witnessHelp: "Quét phải sang trái. Cắt do capacity, hoặc buộc cắt khi prefix cần mỗi nhóm còn lại ít nhất một phần tử.",
    reverseIndex: "index quét ngược",
    groupsLeft: "nhóm còn lại",
    suffix: "tổng suffix",
    cuts: "cuts theo thứ tự ngược",
    sortedCuts: "cuts đã sắp xếp",
    capacityRule: "Quy tắc capacity",
    capacityRuleHelp: "suffix_sum + nums[i] > answer",
    countRule: "Quy tắc phần tử còn lại",
    countRuleHelp: "i + 1 < groups_left",
    required: "CẮT",
    notRequired: "GIỮ",
    witnessWaiting: "Chưa bắt đầu tái dựng witness.",
    result: "Witness chia đúng k nhóm",
    resultHelp: "Các nhóm liên tiếp không rỗng này ghép lại đúng nums và mỗi tổng không vượt đáp án.",
    answer: "tổng lớn nhất nhỏ nhất",
    groupSum: "tổng",
    values: "giá trị",
    resultWaiting: "Witness đúng k nhóm xuất hiện sau khi tái dựng.",
    counters: "Bộ đếm thao tác",
    note: "Ý nghĩa của frame này",
  }),
});

function sa410Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sa410Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function sa410CleanText(value, fallback = "", maximum = 500) {
  if (typeof value !== "string") return fallback;
  const text = value.slice(0, maximum).trim();
  return /^(?:undefined|null|nan|[+-]?infinity)$/i.test(text) ? fallback : text;
}

function sa410Localized(value, locale, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return sa410CleanText(value[locale], sa410CleanText(value.en, sa410CleanText(value.vi, fallback)));
  }
  return sa410CleanText(value, fallback);
}

function sa410Integer(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function sa410Boolean(value) {
  return typeof value === "boolean" ? value : null;
}

function sa410CutList(value, length, sort = false) {
  if (!Array.isArray(value) || length < 2) return [];
  const seen = new Set();
  const cuts = [];
  value.slice(0, length - 1).forEach((item) => {
    const cut = sa410Integer(item, 1, length - 1);
    if (cut !== null && !seen.has(cut)) {
      seen.add(cut);
      cuts.push(cut);
    }
  });
  return sort ? cuts.sort((a, b) => a - b) : cuts;
}

function sa410Normalize(step) {
  const raw = step && step.splitArray410View && typeof step.splitArray410View === "object"
    ? step.splitArray410View
    : {};
  const inputRaw = raw.input && typeof raw.input === "object" ? raw.input : {};
  const candidate = Array.isArray(inputRaw.nums) ? inputRaw.nums : step && Array.isArray(step.arr) ? step.arr : [];
  const nums = candidate.length >= 1 && candidate.length <= 16 && candidate.every((value) => Number.isSafeInteger(value) && value >= 1 && value <= 1_000_000)
    ? [...candidate]
    : [];
  const length = nums.length;
  const total = nums.reduce((sum, value) => sum + value, 0);
  const largest = length ? Math.max(...nums) : 0;
  const k = length ? sa410Integer(inputRaw.k, 1, length) : null;
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = sa410Integer(sourceRaw.line, 1, SA410_SOURCE.length)
    ?? sa410Integer(fallbackLine, 1, SA410_SOURCE.length)
    ?? 1;
  const fallbackEvent = SA410_LINE_EVENTS[sourceLine - 1];
  const event = Object.prototype.hasOwnProperty.call(SA410_EVENTS, raw.event) ? raw.event : fallbackEvent;
  const phase = ["setup", "search", "count", "reconstruct", "done"].includes(raw.phase) ? raw.phase : "setup";
  const timing = raw.timing === "before" ? "before" : "after";
  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};

  const searchRaw = raw.search && typeof raw.search === "object" ? raw.search : {};
  const bound = (value) => length ? sa410Integer(value, largest, total) : null;
  const normalizeProbe = (value) => {
    if (!value || typeof value !== "object" || !length) return null;
    const limit = bound(value.limit);
    const groups = sa410Integer(value.groups, 1, length);
    if (limit === null || groups === null) return null;
    return { limit, groups, reason: sa410CleanText(value.reason, "", 80) };
  };
  const invariantRaw = searchRaw.invariant && typeof searchRaw.invariant === "object" ? searchRaw.invariant : {};
  const minimalityRaw = searchRaw.minimality && typeof searchRaw.minimality === "object" ? searchRaw.minimality : {};
  const outcomes = new Set(["idle", "bounded", "searching", "testing", "feasible", "infeasible", "move-right", "move-left", "converged"]);
  const left = bound(searchRaw.left);
  const right = bound(searchRaw.right);
  const search = {
    initialized: searchRaw.initialized === true && left !== null && right !== null,
    left,
    right,
    mid: bound(searchRaw.mid),
    iteration: sa410Integer(searchRaw.iteration, 0, 100) ?? 0,
    previousLeft: bound(searchRaw.previousLeft),
    previousRight: bound(searchRaw.previousRight),
    groups: length ? sa410Integer(searchRaw.groups, 1, length) : null,
    feasible: sa410Boolean(searchRaw.feasible),
    outcome: outcomes.has(searchRaw.outcome) ? searchRaw.outcome : "idle",
    lastFeasible: normalizeProbe(searchRaw.lastFeasible),
    lastInfeasible: normalizeProbe(searchRaw.lastInfeasible),
    rangeSize: left !== null && right !== null && left <= right ? right - left : null,
    invariant: {
      leftAtLeastLargest: sa410Boolean(invariantRaw.leftAtLeastLargest),
      orderedBounds: sa410Boolean(invariantRaw.orderedBounds),
      rightKnownFeasible: sa410Boolean(invariantRaw.rightKnownFeasible),
      belowLeftExcluded: sa410Boolean(invariantRaw.belowLeftExcluded),
    },
    minimality: {
      proven: minimalityRaw.proven === true,
      kind: ["pending", "largest-element", "greedy-rejection"].includes(minimalityRaw.kind) ? minimalityRaw.kind : "pending",
      capacity: sa410Integer(minimalityRaw.capacity, 0, Math.max(0, total)),
      groups: length ? sa410Integer(minimalityRaw.groups, 1, length) : null,
    },
  };

  const scanRaw = raw.scan && typeof raw.scan === "object" ? raw.scan : {};
  const scanCutRaw = scanRaw.cut && typeof scanRaw.cut === "object" ? scanRaw.cut : {};
  const scanStatuses = new Set(["idle", "required", "not-required", "opened", "reset", "placed", "placed-after-cut"]);
  const scanReasons = new Set(["capacity", "fits"]);
  const groupOf = Array.from({ length }, (_, index) => {
    const value = Array.isArray(scanRaw.groupOf) ? scanRaw.groupOf[index] : null;
    return sa410Integer(value, 0, Math.max(0, length - 1));
  });
  const groupSums = Array.isArray(scanRaw.groupSums)
    ? scanRaw.groupSums.slice(0, length).map((value) => sa410Integer(value, 0, total)).filter((value) => value !== null)
    : [];
  const scan = {
    active: scanRaw.active === true,
    call: sa410Integer(scanRaw.call, 0, 100) ?? 0,
    limit: bound(scanRaw.limit),
    index: length ? sa410Integer(scanRaw.index, 0, length - 1) : null,
    num: length ? sa410Integer(scanRaw.num, 1, 1_000_000) : null,
    processed: sa410Integer(scanRaw.processed, 0, length) ?? 0,
    groups: length ? sa410Integer(scanRaw.groups, 1, length) : null,
    currentGroup: length ? sa410Integer(scanRaw.currentGroup, 0, length - 1) : null,
    running: sa410Integer(scanRaw.running, 0, total),
    runningBefore: sa410Integer(scanRaw.runningBefore, 0, total),
    runningAfter: sa410Integer(scanRaw.runningAfter, 0, total),
    prospective: sa410Integer(scanRaw.prospective, 0, total),
    overflow: sa410Boolean(scanRaw.overflow),
    groupOf,
    groupSums,
    cut: {
      status: scanStatuses.has(scanCutRaw.status) ? scanCutRaw.status : "idle",
      beforeIndex: length ? sa410Integer(scanCutRaw.beforeIndex, 0, length - 1) : null,
      fromGroup: length ? sa410Integer(scanCutRaw.fromGroup, 0, length - 1) : null,
      toGroup: length ? sa410Integer(scanCutRaw.toGroup, 0, length - 1) : null,
      reason: scanReasons.has(scanCutRaw.reason) ? scanCutRaw.reason : null,
    },
    returnedGroups: length ? sa410Integer(scanRaw.returnedGroups, 1, length) : null,
    complete: scanRaw.complete === true,
  };

  const witnessRaw = raw.witness && typeof raw.witness === "object" ? raw.witness : {};
  const witnessCutRaw = witnessRaw.cut && typeof witnessRaw.cut === "object" ? witnessRaw.cut : {};
  const rawCuts = sa410CutList(witnessRaw.rawCuts, length, false);
  const cuts = sa410CutList(witnessRaw.cuts, length, true);
  const validCuts = k !== null && cuts.length === k - 1;
  const boundaries = validCuts ? [0, ...cuts, length] : [];
  const partitions = validCuts ? boundaries.slice(0, -1).map((start, group) => {
    const end = boundaries[group + 1];
    const values = nums.slice(start, end);
    return { group, start, end, values, sum: values.reduce((sum, value) => sum + value, 0) };
  }) : [];
  const witnessStatuses = new Set(["idle", "required", "not-required", "appended", "group-reserved", "reset", "placed", "placed-after-cut"]);
  const witnessReasons = new Set(["capacity", "remaining-elements", "fits"]);
  const witness = {
    active: witnessRaw.active === true,
    entered: witnessRaw.entered === true,
    initialized: witnessRaw.initialized === true,
    callerAssigned: witnessRaw.callerAssigned === true,
    limit: bound(witnessRaw.limit),
    index: length ? sa410Integer(witnessRaw.index, 0, length - 1) : null,
    num: length ? sa410Integer(witnessRaw.num, 1, 1_000_000) : null,
    visited: sa410Integer(witnessRaw.visited, 0, length) ?? 0,
    groupsLeft: k !== null ? sa410Integer(witnessRaw.groupsLeft, 1, k) : null,
    suffixSum: sa410Integer(witnessRaw.suffixSum, 0, total),
    suffixBefore: sa410Integer(witnessRaw.suffixBefore, 0, total),
    suffixAfter: sa410Integer(witnessRaw.suffixAfter, 0, total),
    prospective: sa410Integer(witnessRaw.prospective, 0, total),
    mustCut: sa410Boolean(witnessRaw.mustCut),
    capacityCut: sa410Boolean(witnessRaw.capacityCut),
    remainingCut: sa410Boolean(witnessRaw.remainingCut),
    rawCuts,
    cuts,
    boundaries,
    partitions,
    cut: {
      status: witnessStatuses.has(witnessCutRaw.status) ? witnessCutRaw.status : "idle",
      index: length ? sa410Integer(witnessCutRaw.index, 1, length - 1) : null,
      reason: witnessReasons.has(witnessCutRaw.reason) ? witnessCutRaw.reason : null,
    },
    complete: witnessRaw.complete === true && validCuts && partitions.every((partition) => partition.start < partition.end),
  };

  const countersRaw = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const counters = {};
  SA410_COUNTERS.forEach(([key]) => {
    counters[key] = sa410Integer(countersRaw[key], 0, 100_000) ?? 0;
  });
  const locale = sa410Locale();
  return {
    source: { line: sourceLine, text: SA410_SOURCE[sourceLine - 1] },
    event,
    phase,
    timing,
    condition: {
      expression: sa410CleanText(conditionRaw.expression, "", 220),
      result: sa410Boolean(conditionRaw.result),
    },
    nums,
    length,
    total,
    largest,
    k,
    search,
    scan,
    witness,
    counters,
    answer: length ? bound(raw.answer) : null,
    final: raw.final === true || Boolean(step && step.final),
    title: sa410Localized(step && step.title, locale, SA410_TEXT[locale].fallbackTitle),
    note: sa410Localized(step && step.note, locale, ""),
  };
}

function sa410Display(value, fallback = "—") {
  return value === null ? fallback : String(value);
}

function sa410Truth(value, copy) {
  return value === null ? copy.pending : value ? copy.trueValue : copy.falseValue;
}

function sa410EventLabel(event, locale) {
  return SA410_EVENTS[event] ? SA410_EVENTS[event][locale] : event;
}

function sa410RenderRail(state, copy, locale) {
  const items = SA410_SOURCE.map((source, index) => {
    const line = index + 1;
    const current = line === state.source.line;
    const event = SA410_LINE_EVENTS[index];
    return `<li class="sa410-rail-item ${current ? "sa410-is-current" : ""}"${current ? ' aria-current="step"' : ""}><small>L${line} · ${sa410Escape(sa410EventLabel(event, locale))}</small><code>${sa410Escape(source)}</code></li>`;
  }).join("");
  return `<nav class="sa410-rail-wrap" aria-label="${sa410Escape(copy.eventRail)}"><ol class="sa410-event-rail" role="list">${items}</ol></nav>`;
}

function sa410RenderSource(state, copy, locale) {
  const eventLabel = sa410EventLabel(state.event, locale);
  const condition = state.condition.result === null
    ? copy.noCondition
    : `${state.condition.expression || copy.condition} → ${state.condition.result ? copy.trueValue : copy.falseValue}`;
  const conditionClass = state.condition.result === null ? "none" : state.condition.result ? "true" : "false";
  return `<section class="sa410-source-card" aria-labelledby="sa410-source-title"><div class="sa410-source-expression"><small id="sa410-source-title">${sa410Escape(copy.sourceAction)}</small><code>${sa410Escape(state.source.text)}</code></div><dl class="sa410-source-facts"><div><dt>${sa410Escape(copy.phase)}</dt><dd>${sa410Escape(state.phase)}</dd></div><div><dt>${sa410Escape(copy.event)}</dt><dd>${sa410Escape(eventLabel)}</dd></div><div><dt>${sa410Escape(copy.condition)}</dt><dd class="sa410-condition-${conditionClass}">${sa410Escape(condition)}</dd></div></dl></section>`;
}

function sa410OutcomeLabel(state, copy) {
  if (state.search.feasible === true) return copy.feasible;
  if (state.search.feasible === false) return copy.infeasible;
  if (state.search.outcome === "converged") return copy.converged;
  return copy.searching;
}

function sa410RenderSearch(state, copy) {
  const span = Math.max(1, state.total - state.largest);
  const position = (value) => value === null ? null : Math.max(0, Math.min(100, ((value - state.largest) / span) * 100));
  const leftPosition = position(state.search.left);
  const rightPosition = position(state.search.right);
  const midPosition = position(state.search.mid);
  const selectionLeft = leftPosition === null ? 0 : leftPosition;
  const selectionWidth = leftPosition === null || rightPosition === null ? 0 : Math.max(0, rightPosition - leftPosition);
  const marker = (kind, label, value, point) => point === null ? "" : `<span class="sa410-range-marker sa410-marker-${kind}" style="--sa410-position:${point.toFixed(3)}%"><small>${sa410Escape(label)}</small><strong>${sa410Escape(value)}</strong></span>`;
  const metrics = [
    [copy.left, state.search.left],
    [copy.mid, state.search.mid],
    [copy.right, state.search.right],
    [copy.iteration, state.search.iteration],
    [copy.range, state.search.rangeSize],
  ].map(([label, value]) => `<div><dt>${sa410Escape(label)}</dt><dd>${sa410Escape(sa410Display(value))}</dd></div>`).join("");
  const invariants = [
    [copy.leftInvariant, state.search.invariant.leftAtLeastLargest],
    [copy.orderInvariant, state.search.invariant.orderedBounds],
    [copy.rightInvariant, state.search.invariant.rightKnownFeasible],
    [copy.excludedInvariant, state.search.invariant.belowLeftExcluded],
  ].map(([label, value]) => `<li class="sa410-invariant-${value === true ? "yes" : value === false ? "no" : "pending"}"><span aria-hidden="true">${value === true ? "✓" : value === false ? "×" : "·"}</span><span>${sa410Escape(label)}</span><strong>${sa410Escape(value === null ? copy.awaiting : value ? copy.holds : copy.falseValue)}</strong></li>`).join("");
  const lastFeasible = state.search.lastFeasible ? `${state.search.lastFeasible.limit} · ${state.search.lastFeasible.groups}G` : copy.none;
  const lastRejected = state.search.lastInfeasible ? `${state.search.lastInfeasible.limit} · ${state.search.lastInfeasible.groups}G` : copy.none;
  let proof = copy.proofPending;
  if (state.search.minimality.proven && state.search.minimality.kind === "largest-element") proof = copy.structuralProof;
  if (state.search.minimality.proven && state.search.minimality.kind === "greedy-rejection") {
    proof = `${copy.greedyProof} (${state.search.minimality.capacity} → ${sa410Display(state.search.minimality.groups)}G)`;
  }
  return `<section class="sa410-card sa410-search-card" aria-labelledby="sa410-search-title"><header><div><h3 id="sa410-search-title">${sa410Escape(copy.search)}</h3><p>${sa410Escape(copy.searchHelp)}</p></div><strong class="sa410-outcome sa410-outcome-${state.search.feasible === true ? "feasible" : state.search.feasible === false ? "infeasible" : state.search.outcome}">${sa410Escape(sa410OutcomeLabel(state, copy))}</strong></header><div class="sa410-range" role="img" aria-label="${sa410Escape(`${copy.left} ${sa410Display(state.search.left)}, ${copy.mid} ${sa410Display(state.search.mid)}, ${copy.right} ${sa410Display(state.search.right)}`)}"><div class="sa410-range-axis"><span>${sa410Escape(state.largest)}</span><span>${sa410Escape(state.total)}</span></div><div class="sa410-range-track"><span class="sa410-range-selection" style="--sa410-left:${selectionLeft.toFixed(3)}%;--sa410-width:${selectionWidth.toFixed(3)}%"></span>${marker("left", "L", state.search.left, leftPosition)}${marker("mid", "M", state.search.mid, midPosition)}${marker("right", "R", state.search.right, rightPosition)}</div></div><dl class="sa410-search-metrics">${metrics}</dl><div class="sa410-search-detail"><div><h4>${sa410Escape(copy.invariants)}</h4><ul class="sa410-invariant-list" role="list">${invariants}</ul></div><div class="sa410-proof"><h4>${sa410Escape(copy.minimality)}</h4><p>${sa410Escape(proof)}</p><dl><div><dt>${sa410Escape(copy.lastFeasible)}</dt><dd>${sa410Escape(lastFeasible)}</dd></div><div><dt>${sa410Escape(copy.lastRejected)}</dt><dd>${sa410Escape(lastRejected)}</dd></div></dl></div></div></section>`;
}

function sa410GroupAssignments(state) {
  if (state.witness.partitions.length) {
    const assignments = Array(state.length).fill(null);
    state.witness.partitions.forEach((partition) => {
      for (let index = partition.start; index < partition.end; index++) assignments[index] = partition.group;
    });
    return assignments;
  }
  return [...state.scan.groupOf];
}

function sa410CurrentCuts(state, assignments) {
  if (state.witness.cuts.length) return new Set(state.witness.cuts);
  if (state.phase === "reconstruct" && state.witness.rawCuts.length) return new Set(state.witness.rawCuts);
  const cuts = new Set();
  for (let index = 1; index < assignments.length; index++) {
    if (assignments[index] !== null && assignments[index - 1] !== null && assignments[index] !== assignments[index - 1]) cuts.add(index);
  }
  return cuts;
}

function sa410RenderArray(state, copy) {
  const assignments = sa410GroupAssignments(state);
  const cuts = sa410CurrentCuts(state, assignments);
  const currentIndex = state.witness.index !== null ? state.witness.index : state.scan.index;
  const maximum = Math.max(1, ...state.nums);
  const cells = state.nums.map((value, index) => {
    const group = assignments[index];
    const current = currentIndex === index;
    const boundary = cuts.has(index);
    const ratio = Math.max(10, (value / maximum) * 100);
    const classes = [
      "sa410-array-cell",
      group === null ? "sa410-group-unassigned" : `sa410-group-${group % 6}`,
      current ? "sa410-is-current-value" : "",
      boundary ? "sa410-has-boundary" : "",
    ].filter(Boolean).join(" ");
    const groupLabel = group === null ? copy.unassigned : `G${group}`;
    const roles = current ? `, ${copy.current}` : "";
    const aria = `${copy.index} ${index}, ${copy.value} ${value}, ${copy.group} ${groupLabel}${roles}`;
    return `<li class="${classes}" aria-label="${sa410Escape(aria)}"${current ? ' aria-current="step"' : ""}><span class="sa410-cut-line" aria-hidden="true"></span><small>i=${index}</small><div class="sa410-value-bar"><span style="--sa410-height:${ratio.toFixed(3)}%"></span><strong>${sa410Escape(value)}</strong></div><em>${sa410Escape(groupLabel)}</em></li>`;
  }).join("");
  return `<section class="sa410-card sa410-array-card" aria-labelledby="sa410-array-title"><header><div><h3 id="sa410-array-title">${sa410Escape(copy.array)}</h3><p>${sa410Escape(copy.arrayHelp)}</p></div><span>n=${state.length} · k=${sa410Display(state.k)}</span></header><div class="sa410-array-scroll" tabindex="0" role="region" aria-label="${sa410Escape(copy.array)}"><ol class="sa410-array-list" role="list">${cells}</ol></div></section>`;
}

function sa410GreedyGroups(state) {
  const groups = [];
  state.scan.groupOf.forEach((group, index) => {
    if (group === null) return;
    if (!groups[group]) groups[group] = { group, values: [], indices: [], sum: 0 };
    groups[group].values.push(state.nums[index]);
    groups[group].indices.push(index);
    groups[group].sum += state.nums[index];
  });
  return groups.filter(Boolean);
}

function sa410RenderGreedy(state, copy) {
  const groups = sa410GreedyGroups(state);
  const limit = state.scan.limit;
  const groupCards = groups.length
    ? groups.map((group) => {
      const fullness = limit ? Math.min(100, (group.sum / limit) * 100) : 0;
      return `<li class="sa410-greedy-group sa410-group-${group.group % 6}"><header><strong>G${group.group}</strong><span>${sa410Escape(copy.groupSum)} ${group.sum}/${sa410Display(limit)}</span></header><div class="sa410-capacity-meter"><span style="--sa410-fullness:${fullness.toFixed(3)}%"></span></div><code>${sa410Escape(group.values.join(" + "))}</code></li>`;
    }).join("")
    : `<li class="sa410-empty">${sa410Escape(state.scan.call ? copy.emptyGroups : copy.scanWaiting)}</li>`;
  const facts = [
    [copy.limit, state.scan.limit],
    [copy.running, state.scan.running],
    [copy.prospective, state.scan.prospective],
    [copy.processed, `${state.scan.processed}/${state.length}`],
    [copy.groups, state.scan.groups],
  ].map(([label, value]) => `<div><dt>${sa410Escape(label)}</dt><dd>${sa410Escape(sa410Display(value))}</dd></div>`).join("");
  const cut = state.scan.cut;
  const cutValue = cut.beforeIndex === null ? copy.none : String(cut.beforeIndex);
  return `<section class="sa410-card sa410-greedy-card" aria-labelledby="sa410-greedy-title"><header><div><h3 id="sa410-greedy-title">${sa410Escape(copy.greedy)}</h3><p>${sa410Escape(copy.greedyHelp)}</p></div><span>call #${state.scan.call}</span></header><dl class="sa410-greedy-facts">${facts}</dl><div class="sa410-cut-summary sa410-cut-${cut.status}"><strong>${sa410Escape(copy.cutDecision)}</strong><span>${sa410Escape(cut.status)}</span><dl><div><dt>${sa410Escape(copy.cutBefore)}</dt><dd>${sa410Escape(cutValue)}</dd></div><div><dt>${sa410Escape(copy.reason)}</dt><dd>${sa410Escape(cut.reason || copy.none)}</dd></div></dl></div><div><h4>${sa410Escape(copy.groupSums)}</h4><ol class="sa410-greedy-groups" role="list">${groupCards}</ol></div></section>`;
}

function sa410RuleCard(kind, label, help, value, copy) {
  const stateClass = value === true ? "yes" : value === false ? "no" : "pending";
  const verdict = value === null ? copy.pending : value ? copy.required : copy.notRequired;
  return `<div class="sa410-rule sa410-rule-${kind} sa410-rule-${stateClass}"><header><strong>${sa410Escape(label)}</strong><span>${sa410Escape(verdict)}</span></header><code>${sa410Escape(help)}</code><p>${sa410Escape(sa410Truth(value, copy))}</p></div>`;
}

function sa410RenderWitness(state, copy) {
  const witness = state.witness;
  const facts = [
    [copy.reverseIndex, witness.index],
    [copy.groupsLeft, witness.groupsLeft],
    [copy.suffix, witness.suffixSum],
    [copy.prospective, witness.prospective],
  ].map(([label, value]) => `<div><dt>${sa410Escape(label)}</dt><dd>${sa410Escape(sa410Display(value))}</dd></div>`).join("");
  const reverseCuts = witness.rawCuts.length
    ? witness.rawCuts.map((cut, index) => `<li><small>#${index + 1}</small><strong>${cut}</strong></li>`).join("")
    : `<li class="sa410-empty">${sa410Escape(witness.initialized ? copy.none : copy.witnessWaiting)}</li>`;
  const sortedCuts = witness.cuts.length ? `[${witness.cuts.join(", ")}]` : copy.none;
  return `<section class="sa410-card sa410-witness-card" aria-labelledby="sa410-witness-title"><header><div><h3 id="sa410-witness-title">${sa410Escape(copy.witness)}</h3><p>${sa410Escape(copy.witnessHelp)}</p></div><strong>${witness.rawCuts.length}/${state.k === null ? "—" : Math.max(0, state.k - 1)}</strong></header><dl class="sa410-witness-facts">${facts}</dl><div class="sa410-rule-grid">${sa410RuleCard("capacity", copy.capacityRule, copy.capacityRuleHelp, witness.capacityCut, copy)}${sa410RuleCard("count", copy.countRule, copy.countRuleHelp, witness.remainingCut, copy)}</div><div class="sa410-cut-ledger"><div><h4>${sa410Escape(copy.cuts)}</h4><ol role="list">${reverseCuts}</ol></div><div><h4>${sa410Escape(copy.sortedCuts)}</h4><code>${sa410Escape(sortedCuts)}</code><span>${sa410Escape(witness.cut.reason || copy.none)}</span></div></div></section>`;
}

function sa410RenderResult(state, copy) {
  const partitions = state.witness.complete
    ? state.witness.partitions.map((partition) => `<li class="sa410-result-group sa410-group-${partition.group % 6}"><header><strong>G${partition.group}</strong><span>[${partition.start}, ${partition.end})</span></header><code>${sa410Escape(partition.values.join(" + "))}</code><footer><small>${sa410Escape(copy.groupSum)}</small><strong>${partition.sum}</strong><span>≤ ${sa410Display(state.answer ?? state.witness.limit)}</span></footer></li>`).join("")
    : `<li class="sa410-empty">${sa410Escape(copy.resultWaiting)}</li>`;
  const answer = state.answer === null ? copy.awaiting : String(state.answer);
  return `<section class="sa410-card sa410-result-card ${state.witness.complete ? "sa410-is-complete" : ""}" aria-labelledby="sa410-result-title" aria-live="polite"><header><div><small>${sa410Escape(copy.answer)}</small><h3 id="sa410-result-title">${sa410Escape(answer)}</h3></div><div><strong>${sa410Escape(copy.result)}</strong><span>${state.witness.complete ? `${state.witness.partitions.length}/${state.k}` : copy.pending}</span></div></header><p>${sa410Escape(copy.resultHelp)}</p><div class="sa410-result-scroll"><ol class="sa410-result-groups" role="list">${partitions}</ol></div></section>`;
}

function sa410RenderCounters(state, copy, locale) {
  const items = SA410_COUNTERS.map(([key, labels]) => `<li><small>${sa410Escape(labels[locale])}</small><strong>${state.counters[key]}</strong></li>`).join("");
  return `<section class="sa410-card sa410-counters" aria-labelledby="sa410-counters-title"><header><h3 id="sa410-counters-title">${sa410Escape(copy.counters)}</h3></header><ul role="list">${items}</ul></section>`;
}

function renderSplitArray410View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = sa410Locale();
  const copy = SA410_TEXT[locale];
  const state = sa410Normalize(step);
  const eventLabel = sa410EventLabel(state.event, locale);
  const timingLabel = state.timing === "before" ? copy.before : copy.after;
  const summary = `${copy.region}. ${copy.line} ${state.source.line}. ${eventLabel}.`;
  const note = state.note
    ? `<aside class="sa410-note"><strong>${sa410Escape(copy.note)}</strong><p>${sa410Escape(state.note)}</p></aside>`
    : "";
  host.innerHTML = `<article class="sa410-viz sa410-phase-${state.phase} ${state.final ? "sa410-is-final" : ""}" role="region" aria-label="${sa410Escape(summary)}"><header class="sa410-header"><div><span>${sa410Escape(copy.kicker)}</span><h2>${sa410Escape(state.title)}</h2></div><div class="sa410-line-state"><strong>${sa410Escape(copy.line)} ${state.source.line}</strong><span class="sa410-timing-${state.timing}">${sa410Escape(timingLabel)}</span><em>${sa410Escape(eventLabel)}</em></div></header>${sa410RenderRail(state, copy, locale)}${sa410RenderSource(state, copy, locale)}${sa410RenderSearch(state, copy)}${sa410RenderArray(state, copy)}<div class="sa410-work-grid">${sa410RenderGreedy(state, copy)}${sa410RenderWitness(state, copy)}</div>${sa410RenderResult(state, copy)}${sa410RenderCounters(state, copy, locale)}${note}</article>`;
}
