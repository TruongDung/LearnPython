"use strict";

const FT514_SOURCE = Object.freeze([
  "from collections import defaultdict",
  "class Solution:",
  "    def findRotateSteps(self, ring, key):",
  "        n = len(ring)",
  "        positions = defaultdict(list)",
  "        for index, char in enumerate(ring):",
  "            positions[char].append(index)",
  "        dp = {0: 0}",
  "        parents = []",
  "        for char in key:",
  "            next_dp = {}",
  "            parent = {}",
  "            for target in positions[char]:",
  "                best = None",
  "                for previous in sorted(dp):",
  "                    clockwise = (previous - target) % n",
  "                    counterclockwise = (target - previous) % n",
  "                    if target == previous:",
  "                        turns, direction, rank = 0, \"stay\", 0",
  "                    elif clockwise <= counterclockwise:",
  "                        turns, direction, rank = clockwise, \"clockwise\", 1",
  "                    else:",
  "                        turns, direction, rank = counterclockwise, \"counterclockwise\", 2",
  "                    candidate = (dp[previous] + turns + 1, previous, rank, turns, direction)",
  "                    if best is None or candidate[:3] < best[:3]:",
  "                        best = candidate",
  "                next_dp[target] = best[0]",
  "                parent[target] = (best[1], best[3], best[4])",
  "            dp = next_dp",
  "            parents.append(parent)",
  "        end = min(dp, key=lambda position: (dp[position], position))",
  "        answer = dp[end]",
  "        actions = []",
  "        for layer in range(len(key) - 1, -1, -1):",
  "            previous, turns, direction = parents[layer][end]",
  "            actions.append((previous, end, direction, turns, key[layer]))",
  "            end = previous",
  "        actions.reverse()",
  "        return answer",
]);

const FT514_LINE_EVENTS = Object.freeze([
  "import-defaultdict", "bind-class", "bind-method", "set-ring-size", "allocate-positions", "scan-ring", "append-position", "seed-dp", "allocate-parents",
  "select-key-character", "allocate-next-frontier", "allocate-layer-parent", "select-target", "reset-best", "select-predecessor", "compute-clockwise", "compute-counterclockwise",
  "stay-check-false", "choose-stay", "clockwise-check-true", "choose-clockwise", "direction-else", "choose-counterclockwise", "build-candidate", "candidate-better", "replace-best",
  "write-next-cost", "write-parent", "commit-frontier", "append-parent-layer", "select-final-position", "capture-answer", "initialize-actions", "reconstruct-layer", "read-parent",
  "append-action", "move-to-parent", "reverse-actions", "final-return",
]);

const FT514_EVENTS = Object.freeze({
  "import-defaultdict": { en: "Import occurrence map", vi: "Import map occurrence" },
  "bind-class": { en: "Bind Solution class", vi: "Liên kết lớp Solution" },
  "bind-method": { en: "Bind DP method", vi: "Liên kết method DP" },
  "set-ring-size": { en: "Set ring size", vi: "Đặt kích thước ring" },
  "allocate-positions": { en: "Allocate occurrence index", vi: "Tạo index occurrence" },
  "scan-ring": { en: "Visit ring position", vi: "Xét vị trí ring" },
  "append-position": { en: "Record occurrence", vi: "Ghi occurrence" },
  "scan-ring-complete": { en: "Complete ring scan", vi: "Hoàn tất quét ring" },
  "seed-dp": { en: "Seed aligned state", vi: "Khởi tạo trạng thái căn chỉnh" },
  "allocate-parents": { en: "Allocate parent history", vi: "Tạo lịch sử parent" },
  "select-key-character": { en: "Select key layer", vi: "Chọn tầng key" },
  "key-loop-complete": { en: "Complete key layers", vi: "Hoàn tất các tầng key" },
  "allocate-next-frontier": { en: "Allocate next frontier", vi: "Tạo frontier kế" },
  "allocate-layer-parent": { en: "Allocate layer parents", vi: "Tạo parent của tầng" },
  "select-target": { en: "Select target occurrence", vi: "Chọn occurrence đích" },
  "target-loop-complete": { en: "Complete target occurrences", vi: "Hoàn tất các occurrence đích" },
  "reset-best": { en: "Reset target best", vi: "Đặt lại best của target" },
  "select-predecessor": { en: "Select predecessor", vi: "Chọn predecessor" },
  "predecessor-loop-complete": { en: "Complete predecessors", vi: "Hoàn tất các predecessor" },
  "compute-clockwise": { en: "Compute physical clockwise distance", vi: "Tính khoảng quay cùng chiều vật lý" },
  "compute-counterclockwise": { en: "Compute physical counterclockwise distance", vi: "Tính khoảng quay ngược chiều vật lý" },
  "stay-check-true": { en: "Already aligned", vi: "Đã căn chỉnh" },
  "stay-check-false": { en: "Rotation required", vi: "Cần quay" },
  "choose-stay": { en: "Choose no rotation", vi: "Chọn không quay" },
  "clockwise-check-true": { en: "Clockwise wins", vi: "Chiều kim đồng hồ thắng" },
  "clockwise-check-false": { en: "Counterclockwise is shorter", vi: "Ngược chiều ngắn hơn" },
  "choose-clockwise": { en: "Choose physical clockwise", vi: "Chọn cùng chiều kim đồng hồ vật lý" },
  "direction-else": { en: "Enter counterclockwise branch", vi: "Vào nhánh ngược chiều" },
  "choose-counterclockwise": { en: "Choose physical counterclockwise", vi: "Chọn ngược chiều kim đồng hồ vật lý" },
  "build-candidate": { en: "Add turns and press", vi: "Cộng bước quay và nhấn" },
  "candidate-better": { en: "Candidate wins", vi: "Ứng viên thắng" },
  "candidate-kept-out": { en: "Incumbent stays", vi: "Giữ incumbent" },
  "replace-best": { en: "Store best transition", vi: "Lưu transition tốt nhất" },
  "write-next-cost": { en: "Write target cost", vi: "Ghi cost đích" },
  "write-parent": { en: "Write target parent", vi: "Ghi parent đích" },
  "commit-frontier": { en: "Commit completed layer", vi: "Commit tầng hoàn tất" },
  "append-parent-layer": { en: "Save parent layer", vi: "Lưu tầng parent" },
  "select-final-position": { en: "Select final endpoint", vi: "Chọn endpoint cuối" },
  "capture-answer": { en: "Capture optimum", vi: "Ghi nhận tối ưu" },
  "initialize-actions": { en: "Initialize witness", vi: "Khởi tạo witness" },
  "reconstruct-layer": { en: "Select reconstruction layer", vi: "Chọn tầng tái dựng" },
  "reconstruction-loop-complete": { en: "Complete backward walk", vi: "Hoàn tất đi ngược" },
  "read-parent": { en: "Read parent transition", vi: "Đọc transition parent" },
  "append-action": { en: "Append reverse action", vi: "Thêm action ngược" },
  "move-to-parent": { en: "Move to predecessor", vi: "Đi tới predecessor" },
  "reverse-actions": { en: "Restore chronological actions", vi: "Khôi phục thứ tự action" },
  "final-return": { en: "Return minimum steps", vi: "Trả số bước nhỏ nhất" },
});

const FT514_COUNTERS = Object.freeze([
  ["ringVisits", { en: "Ring visits", vi: "Lượt xét ring" }],
  ["occurrenceWrites", { en: "Occurrence writes", vi: "Lần ghi occurrence" }],
  ["keyLayers", { en: "Key layers", vi: "Tầng key" }],
  ["targets", { en: "Target states", vi: "Trạng thái đích" }],
  ["predecessorTransitions", { en: "Transitions", vi: "Transition" }],
  ["clockwiseComputations", { en: "Clockwise distances", vi: "Khoảng cách cùng chiều" }],
  ["counterclockwiseComputations", { en: "Counter distances", vi: "Khoảng cách ngược chiều" }],
  ["stays", { en: "Stay choices", vi: "Lần đứng yên" }],
  ["clockwiseChoices", { en: "Clockwise choices", vi: "Lần chọn cùng chiều" }],
  ["counterclockwiseChoices", { en: "Counter choices", vi: "Lần chọn ngược chiều" }],
  ["candidates", { en: "Candidates", vi: "Ứng viên" }],
  ["bestUpdates", { en: "Best updates", vi: "Lần cập nhật best" }],
  ["bestKeeps", { en: "Best keeps", vi: "Lần giữ best" }],
  ["costWrites", { en: "Cost writes", vi: "Lần ghi cost" }],
  ["parentWrites", { en: "Parent writes", vi: "Lần ghi parent" }],
  ["reconstructionReads", { en: "Parent reads", vi: "Lần đọc parent" }],
  ["witnessTurns", { en: "Witness turns", vi: "Bước quay witness" }],
  ["witnessPresses", { en: "Witness presses", vi: "Lần nhấn witness" }],
]);

const FT514_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Freedom Trail exact circular dynamic-programming visualization",
    kicker: "LEETCODE 514 · CIRCULAR POSITION DP",
    fallbackTitle: "Freedom Trail",
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
    ring: "Physical ring at twelve o'clock",
    ringHelp: "Original indices increase clockwise. The displayed wheel is rotated so the aligned original index sits under the fixed selector.",
    aligned: "aligned index",
    previous: "predecessor",
    target: "target",
    selector: "12 O'CLOCK · PRESS",
    originalIndex: "original index",
    active: "active",
    rotation: "Two legal physical rotations",
    rotationHelp: "Physical ring direction is opposite a cursor moving across a fixed ring.",
    clockwise: "clockwise",
    counterclockwise: "counterclockwise",
    stay: "stay",
    turns: "turns",
    chosen: "chosen",
    notChosen: "not chosen",
    path: "aligned-index path",
    key: "Key layers",
    keyHelp: "Completed layers are green; the current character owns the next DP frontier.",
    occurrenceIndex: "Character occurrence index",
    positions: "positions",
    dp: "Layer × ring-position DP",
    dpHelp: "dp[p] is the exact minimum rotations + presses for the completed prefix ending with p aligned.",
    initial: "start",
    unreachable: "·",
    currentFrontier: "Current and partial next frontier",
    currentDp: "dp",
    nextDp: "next_dp",
    candidate: "Transition candidate",
    candidateHelp: "Compare (total cost, predecessor, direction rank); every candidate includes one press.",
    baseCost: "base cost",
    press: "press",
    total: "total",
    incumbent: "incumbent",
    outcome: "outcome",
    update: "UPDATE",
    keep: "KEEP",
    idle: "IDLE",
    parents: "Current parent choices",
    parentsHelp: "Each target stores the exact predecessor, direction, and turns selected with its cost.",
    reconstruction: "Rotation-and-press witness",
    reconstructionHelp: "Parents are read backward, then actions are reversed into chronological order.",
    reverseOrder: "reverse order",
    chronological: "chronological",
    from: "from",
    to: "to",
    character: "character",
    actionCost: "action cost",
    noActions: "No witness action has been appended yet.",
    answer: "minimum steps",
    waitingAnswer: "awaiting final DP",
    invariants: "Trace invariants",
    dpPositions: "dp positions match the completed key layer",
    nextPositions: "next_dp positions contain the current character",
    parentCoverage: "every written next cost has a parent",
    finiteCosts: "all serialized costs are finite safe integers",
    witnessValid: "witness actions join, spell key, and sum to answer",
    notReady: "not ready",
    counters: "Operation counters",
    note: "Why this frame matters",
  }),
  vi: Object.freeze({
    region: "Minh họa quy hoạch động vòng tròn chính xác cho Freedom Trail",
    kicker: "LEETCODE 514 · DP VỊ TRÍ VÒNG TRÒN",
    fallbackTitle: "Freedom Trail",
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
    ring: "Ring vật lý tại vị trí 12 giờ",
    ringHelp: "Index gốc tăng theo chiều kim đồng hồ. Bánh xe hiển thị được quay để index gốc đang căn chỉnh nằm dưới selector cố định.",
    aligned: "index căn chỉnh",
    previous: "predecessor",
    target: "đích",
    selector: "12 GIỜ · NHẤN",
    originalIndex: "index gốc",
    active: "đang xét",
    rotation: "Hai hướng quay vật lý hợp lệ",
    rotationHelp: "Hướng quay ring vật lý ngược với hướng cursor di chuyển trên ring cố định.",
    clockwise: "cùng chiều kim đồng hồ",
    counterclockwise: "ngược chiều kim đồng hồ",
    stay: "đứng yên",
    turns: "bước quay",
    chosen: "được chọn",
    notChosen: "không chọn",
    path: "đường index căn chỉnh",
    key: "Các tầng key",
    keyHelp: "Tầng hoàn tất màu xanh; ký tự hiện tại sở hữu frontier DP kế.",
    occurrenceIndex: "Index occurrence ký tự",
    positions: "vị trí",
    dp: "DP tầng × vị trí ring",
    dpHelp: "dp[p] là tổng bước quay + nhấn nhỏ nhất chính xác cho prefix đã hoàn tất khi p được căn chỉnh.",
    initial: "bắt đầu",
    unreachable: "·",
    currentFrontier: "Frontier hiện tại và frontier kế một phần",
    currentDp: "dp",
    nextDp: "next_dp",
    candidate: "Ứng viên transition",
    candidateHelp: "So sánh (tổng cost, predecessor, rank hướng); mọi ứng viên đều gồm một lần nhấn.",
    baseCost: "cost gốc",
    press: "nhấn",
    total: "tổng",
    incumbent: "incumbent",
    outcome: "kết quả",
    update: "CẬP NHẬT",
    keep: "GIỮ",
    idle: "CHỜ",
    parents: "Các lựa chọn parent hiện tại",
    parentsHelp: "Mỗi target lưu đúng predecessor, hướng và số bước quay đã được chọn cùng cost.",
    reconstruction: "Witness quay-và-nhấn",
    reconstructionHelp: "Đọc parent theo chiều ngược, rồi đảo actions về thứ tự thời gian.",
    reverseOrder: "thứ tự ngược",
    chronological: "thứ tự thời gian",
    from: "từ",
    to: "đến",
    character: "ký tự",
    actionCost: "cost action",
    noActions: "Chưa thêm action witness nào.",
    answer: "số bước nhỏ nhất",
    waitingAnswer: "đang chờ DP cuối",
    invariants: "Bất biến trace",
    dpPositions: "vị trí dp khớp tầng key đã hoàn tất",
    nextPositions: "vị trí next_dp chứa ký tự hiện tại",
    parentCoverage: "mọi next cost đã ghi đều có parent",
    finiteCosts: "mọi cost serialize là số nguyên an toàn hữu hạn",
    witnessValid: "witness nối liền, đánh đúng key và có tổng bằng đáp án",
    notReady: "chưa sẵn sàng",
    counters: "Bộ đếm thao tác",
    note: "Ý nghĩa của frame này",
  }),
});

function ft514Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ft514Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function ft514CleanText(value, fallback = "", maximum = 500) {
  if (typeof value !== "string") return fallback;
  const text = value.slice(0, maximum).trim();
  return /^(?:undefined|null|nan|[+-]?infinity)$/i.test(text) ? fallback : text;
}

function ft514Localized(value, locale, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return ft514CleanText(value[locale], ft514CleanText(value.en, ft514CleanText(value.vi, fallback)));
  }
  return ft514CleanText(value, fallback);
}

function ft514Integer(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function ft514Boolean(value) {
  return typeof value === "boolean" ? value : null;
}

function ft514NormalizeEntries(value, ring, maximumCost) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.slice(0, ring.length).flatMap((item) => {
    const entry = item && typeof item === "object" ? item : {};
    const position = ft514Integer(entry.position, 0, Math.max(0, ring.length - 1));
    const cost = ft514Integer(entry.cost, 0, maximumCost);
    if (position === null || cost === null || seen.has(position)) return [];
    seen.add(position);
    return [{ position, cost }];
  }).sort((left, right) => left.position - right.position);
}

function ft514NormalizeAction(item, ring, key) {
  const raw = item && typeof item === "object" ? item : {};
  const layer = ft514Integer(raw.layer, 0, Math.max(0, key.length - 1));
  const from = ft514Integer(raw.from, 0, Math.max(0, ring.length - 1));
  const to = ft514Integer(raw.to, 0, Math.max(0, ring.length - 1));
  const direction = ["stay", "clockwise", "counterclockwise"].includes(raw.direction) ? raw.direction : null;
  const turns = ft514Integer(raw.turns, 0, Math.max(0, ring.length - 1));
  if (layer === null || from === null || to === null || !direction || turns === null) return null;
  const path = Array.isArray(raw.rotationPath) ? raw.rotationPath.slice(0, turns).map((position) => ft514Integer(position, 0, ring.length - 1)).filter((position) => position !== null) : [];
  const char = key[layer];
  return { layer, char, from, to, direction, turns, rotationPath: path, press: raw.press === true, cost: turns + 1 };
}

function ft514Normalize(step) {
  const raw = step && step.freedomTrail514View && typeof step.freedomTrail514View === "object" ? step.freedomTrail514View : {};
  const inputRaw = raw.input && typeof raw.input === "object" ? raw.input : {};
  const ring = typeof inputRaw.ring === "string" && /^[a-z]{1,8}$/.test(inputRaw.ring) ? inputRaw.ring : "";
  const key = typeof inputRaw.key === "string" && /^[a-z]{1,8}$/.test(inputRaw.key) ? inputRaw.key : "";
  const length = ring.length;
  const maximumCost = Math.max(1, key.length * (length + 1));
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = ft514Integer(sourceRaw.line, 1, FT514_SOURCE.length)
    ?? ft514Integer(fallbackLine, 1, FT514_SOURCE.length)
    ?? 1;
  const fallbackEvent = FT514_LINE_EVENTS[sourceLine - 1];
  const event = Object.prototype.hasOwnProperty.call(FT514_EVENTS, raw.event) ? raw.event : fallbackEvent;
  const phase = ["setup", "transition", "reconstruction", "done"].includes(raw.phase) ? raw.phase : "setup";
  const timing = raw.timing === "before" ? "before" : "after";
  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};

  const positionsRaw = raw.positions && typeof raw.positions === "object" ? raw.positions : {};
  const positionEntries = Array.isArray(positionsRaw.entries) ? positionsRaw.entries.slice(0, 26).flatMap((item) => {
    const entry = item && typeof item === "object" ? item : {};
    const char = typeof entry.char === "string" && /^[a-z]$/.test(entry.char) ? entry.char : null;
    if (!char || !Array.isArray(entry.indices)) return [];
    const indices = [...new Set(entry.indices.map((value) => ft514Integer(value, 0, Math.max(0, length - 1))).filter((value) => value !== null && ring[value] === char))].sort((a, b) => a - b);
    return indices.length ? [{ char, indices }] : [];
  }) : [];

  const cursorRaw = raw.cursor && typeof raw.cursor === "object" ? raw.cursor : {};
  const ringPosition = (value) => length ? ft514Integer(value, 0, length - 1) : null;
  const keyIndex = key.length ? ft514Integer(cursorRaw.keyIndex, 0, key.length - 1) : null;
  const cursor = {
    keyIndex,
    keyChar: keyIndex === null ? null : key[keyIndex],
    target: ringPosition(cursorRaw.target),
    previous: ringPosition(cursorRaw.previous),
    aligned: ringPosition(cursorRaw.aligned) ?? (length ? 0 : null),
  };

  const rotationRaw = raw.rotation && typeof raw.rotation === "object" ? raw.rotation : {};
  const direction = ["stay", "clockwise", "counterclockwise"].includes(rotationRaw.direction) ? rotationRaw.direction : null;
  const rotation = {
    clockwise: length ? ft514Integer(rotationRaw.clockwise, 0, length - 1) : null,
    counterclockwise: length ? ft514Integer(rotationRaw.counterclockwise, 0, length - 1) : null,
    turns: length ? ft514Integer(rotationRaw.turns, 0, length - 1) : null,
    direction,
    rank: ft514Integer(rotationRaw.rank, 0, 2),
    path: Array.isArray(rotationRaw.path) ? rotationRaw.path.slice(0, length).map(ringPosition).filter((position) => position !== null) : [],
  };

  const normalizeCandidate = (value) => {
    if (!value || typeof value !== "object") return null;
    const total = ft514Integer(value.total, 0, maximumCost);
    const previous = ringPosition(value.previous);
    const target = ringPosition(value.target);
    const rank = ft514Integer(value.rank, 0, 2);
    const turns = length ? ft514Integer(value.turns, 0, length - 1) : null;
    const candidateDirection = ["stay", "clockwise", "counterclockwise"].includes(value.direction) ? value.direction : null;
    const baseCost = ft514Integer(value.baseCost, 0, maximumCost);
    return total !== null && previous !== null && target !== null && rank !== null && turns !== null && candidateDirection && baseCost !== null
      ? { total, previous, target, rank, turns, direction: candidateDirection, baseCost }
      : null;
  };
  const candidateRaw = raw.candidate && typeof raw.candidate === "object" ? raw.candidate : {};
  const candidate = {
    value: normalizeCandidate(candidateRaw.value),
    incumbent: normalizeCandidate(candidateRaw.incumbent),
    outcome: ["idle", "pending", "update", "keep"].includes(candidateRaw.outcome) ? candidateRaw.outcome : "idle",
  };

  const frontierRaw = raw.frontier && typeof raw.frontier === "object" ? raw.frontier : {};
  const frontier = {
    layer: ft514Integer(frontierRaw.layer, -1, Math.max(-1, key.length - 1)) ?? -1,
    dp: ft514NormalizeEntries(frontierRaw.dp, ring, maximumCost),
    next: ft514NormalizeEntries(frontierRaw.next, ring, maximumCost),
    best: normalizeCandidate(frontierRaw.best),
    parent: Array.isArray(frontierRaw.parent) ? frontierRaw.parent.slice(0, length).flatMap((item) => {
      const link = item && typeof item === "object" ? item : {};
      const position = ringPosition(link.position);
      const previous = ringPosition(link.previous);
      const turns = length ? ft514Integer(link.turns, 0, length - 1) : null;
      const linkDirection = ["stay", "clockwise", "counterclockwise"].includes(link.direction) ? link.direction : null;
      return position !== null && previous !== null && turns !== null && linkDirection ? [{ position, previous, turns, direction: linkDirection }] : [];
    }) : [],
    completedLayers: ft514Integer(frontierRaw.completedLayers, -1, Math.max(-1, key.length - 1)) ?? -1,
  };

  const table = Array.isArray(raw.table) ? raw.table.slice(0, key.length + 1).flatMap((item) => {
    const row = item && typeof item === "object" ? item : {};
    const layer = ft514Integer(row.layer, -1, Math.max(-1, key.length - 1));
    if (layer === null) return [];
    return [{ layer, char: layer < 0 ? "" : key[layer], costs: ft514NormalizeEntries(row.costs, ring, maximumCost) }];
  }) : [];

  const reconstructionRaw = raw.reconstruction && typeof raw.reconstruction === "object" ? raw.reconstruction : {};
  const actions = Array.isArray(reconstructionRaw.actions) ? reconstructionRaw.actions.slice(0, key.length).map((item) => ft514NormalizeAction(item, ring, key)).filter(Boolean) : [];
  const current = ft514NormalizeAction(reconstructionRaw.current, ring, key);
  const reconstruction = {
    layer: key.length ? ft514Integer(reconstructionRaw.layer, 0, key.length - 1) : null,
    end: ringPosition(reconstructionRaw.end),
    current,
    actions,
    reversed: reconstructionRaw.reversed === true,
    complete: reconstructionRaw.complete === true && actions.length === key.length,
  };

  const invariantsRaw = raw.invariants && typeof raw.invariants === "object" ? raw.invariants : {};
  const countersRaw = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const counters = {};
  FT514_COUNTERS.forEach(([name]) => {
    counters[name] = ft514Integer(countersRaw[name], 0, 100_000) ?? 0;
  });
  const locale = ft514Locale();
  return {
    source: { line: sourceLine, text: FT514_SOURCE[sourceLine - 1] },
    event,
    phase,
    timing,
    condition: { expression: ft514CleanText(conditionRaw.expression, "", 200), result: ft514Boolean(conditionRaw.result) },
    ring,
    key,
    length,
    positions: { allocated: positionsRaw.allocated === true, entries: positionEntries, ringIndex: ringPosition(positionsRaw.ringIndex), ringChar: typeof positionsRaw.ringChar === "string" && /^[a-z]$/.test(positionsRaw.ringChar) ? positionsRaw.ringChar : null },
    cursor,
    rotation,
    candidate,
    frontier,
    table,
    reconstruction,
    invariants: {
      dpPositionsMatchLayer: ft514Boolean(invariantsRaw.dpPositionsMatchLayer),
      nextPositionsMatchChar: ft514Boolean(invariantsRaw.nextPositionsMatchChar),
      parentCoversNext: ft514Boolean(invariantsRaw.parentCoversNext),
      costsFinite: ft514Boolean(invariantsRaw.costsFinite),
      witnessValid: ft514Boolean(invariantsRaw.witnessValid),
    },
    counters,
    answer: ft514Integer(raw.answer, 0, maximumCost),
    final: raw.final === true || Boolean(step && step.final),
    title: ft514Localized(step && step.title, locale, FT514_TEXT[locale].fallbackTitle),
    note: ft514Localized(step && step.note, locale, ""),
  };
}

function ft514Display(value, copy) {
  return value === null ? copy.none : String(value);
}

function ft514EventLabel(event, locale) {
  return FT514_EVENTS[event] ? FT514_EVENTS[event][locale] : event;
}

function ft514RenderRail(state, copy, locale) {
  const items = FT514_SOURCE.map((source, index) => {
    const line = index + 1;
    const current = line === state.source.line;
    return `<li class="ft514-rail-item ${current ? "ft514-is-current" : ""}"${current ? ' aria-current="step"' : ""}><small>L${line} · ${ft514Escape(ft514EventLabel(FT514_LINE_EVENTS[index], locale))}</small><code>${ft514Escape(source)}</code></li>`;
  }).join("");
  return `<nav class="ft514-rail-wrap" aria-label="${ft514Escape(copy.eventRail)}"><ol class="ft514-event-rail" role="list">${items}</ol></nav>`;
}

function ft514RenderSource(state, copy, locale) {
  const eventLabel = ft514EventLabel(state.event, locale);
  const condition = state.condition.result === null ? copy.noCondition : `${state.condition.expression || copy.condition} → ${state.condition.result ? copy.trueValue : copy.falseValue}`;
  const conditionClass = state.condition.result === null ? "none" : state.condition.result ? "true" : "false";
  return `<section class="ft514-source-card" aria-labelledby="ft514-source-title"><div class="ft514-source-expression"><small id="ft514-source-title">${ft514Escape(copy.sourceAction)}</small><code>${ft514Escape(state.source.text)}</code></div><dl class="ft514-source-facts"><div><dt>${ft514Escape(copy.phase)}</dt><dd>${ft514Escape(state.phase)}</dd></div><div><dt>${ft514Escape(copy.event)}</dt><dd>${ft514Escape(eventLabel)}</dd></div><div><dt>${ft514Escape(copy.condition)}</dt><dd class="ft514-condition-${conditionClass}">${ft514Escape(condition)}</dd></div></dl></section>`;
}

function ft514AlignedPosition(state) {
  if (state.reconstruction.complete && state.reconstruction.actions.length) return state.reconstruction.actions[state.reconstruction.actions.length - 1].to;
  if (state.reconstruction.current) return state.reconstruction.current.from;
  if (state.cursor.previous !== null) return state.cursor.previous;
  return state.cursor.aligned ?? 0;
}

function ft514RenderRing(state, copy) {
  if (!state.length) return `<section class="ft514-card"><div class="ft514-empty">${ft514Escape(copy.pending)}</div></section>`;
  const aligned = ft514AlignedPosition(state);
  const path = new Set(state.rotation.path);
  const actionTargets = new Set(state.reconstruction.actions.map((action) => action.to));
  const nodes = [...state.ring].map((char, index) => {
    const angle = ((index - aligned + state.length) % state.length) * (360 / state.length);
    const classes = [
      "ft514-ring-node",
      index === aligned ? "ft514-is-aligned" : "",
      index === state.cursor.previous ? "ft514-is-previous" : "",
      index === state.cursor.target ? "ft514-is-target" : "",
      path.has(index) ? "ft514-is-path" : "",
      actionTargets.has(index) ? "ft514-is-witness" : "",
    ].filter(Boolean).join(" ");
    const roles = [];
    if (index === aligned) roles.push(copy.aligned);
    if (index === state.cursor.previous) roles.push(copy.previous);
    if (index === state.cursor.target) roles.push(copy.target);
    const aria = `${copy.originalIndex} ${index}, ${copy.character} ${char}${roles.length ? `, ${roles.join(", ")}` : ""}`;
    return `<li class="${classes}" style="--ft514-angle:${angle.toFixed(3)}deg;--ft514-counter-angle:${(-angle).toFixed(3)}deg" aria-label="${ft514Escape(aria)}"><div><small>${index}</small><strong>${ft514Escape(char)}</strong></div></li>`;
  }).join("");
  return `<section class="ft514-card ft514-ring-card" aria-labelledby="ft514-ring-title"><header><div><h3 id="ft514-ring-title">${ft514Escape(copy.ring)}</h3><p>${ft514Escape(copy.ringHelp)}</p></div><strong>${ft514Escape(copy.aligned)} ${aligned}</strong></header><div class="ft514-ring-stage" role="img" aria-label="${ft514Escape(`${copy.ring}: ${state.ring}; ${copy.aligned} ${aligned}`)}"><div class="ft514-selector"><span>▼</span><strong>${ft514Escape(copy.selector)}</strong></div><div class="ft514-ring-wheel"><ol role="list">${nodes}</ol><div class="ft514-ring-hub"><small>${ft514Escape(copy.aligned)}</small><strong>${aligned}</strong><span>${ft514Escape(state.ring[aligned])}</span></div></div></div></section>`;
}

function ft514DirectionLabel(direction, copy) {
  if (direction === "clockwise") return copy.clockwise;
  if (direction === "counterclockwise") return copy.counterclockwise;
  if (direction === "stay") return copy.stay;
  return copy.none;
}

function ft514RenderRotation(state, copy) {
  const direction = state.rotation.direction;
  const card = (kind, value) => {
    const selected = direction === kind;
    const label = kind === "clockwise" ? copy.clockwise : copy.counterclockwise;
    return `<div class="ft514-direction ft514-direction-${kind} ${selected ? "ft514-is-chosen" : ""}"><header><strong>${ft514Escape(label)}</strong><span>${ft514Escape(selected ? copy.chosen : copy.notChosen)}</span></header><div><b>${ft514Escape(ft514Display(value, copy))}</b><small>${ft514Escape(copy.turns)}</small></div><p aria-hidden="true">${kind === "clockwise" ? "↻" : "↺"}</p></div>`;
  };
  const path = state.rotation.path.length ? state.rotation.path.join(" → ") : copy.none;
  return `<section class="ft514-card ft514-rotation-card" aria-labelledby="ft514-rotation-title"><header><div><h3 id="ft514-rotation-title">${ft514Escape(copy.rotation)}</h3><p>${ft514Escape(copy.rotationHelp)}</p></div><strong>${ft514Escape(ft514DirectionLabel(direction, copy))}</strong></header><div class="ft514-direction-grid">${card("clockwise", state.rotation.clockwise)}${card("counterclockwise", state.rotation.counterclockwise)}</div><dl><div><dt>${ft514Escape(copy.previous)}</dt><dd>${ft514Escape(ft514Display(state.cursor.previous, copy))}</dd></div><div><dt>${ft514Escape(copy.target)}</dt><dd>${ft514Escape(ft514Display(state.cursor.target, copy))}</dd></div><div><dt>${ft514Escape(copy.turns)}</dt><dd>${ft514Escape(ft514Display(state.rotation.turns, copy))}</dd></div><div><dt>${ft514Escape(copy.path)}</dt><dd>${ft514Escape(path)}</dd></div></dl></section>`;
}

function ft514RenderKey(state, copy) {
  const completed = state.frontier.layer;
  const items = [...state.key].map((char, index) => {
    const current = index === state.cursor.keyIndex || index === state.reconstruction.layer;
    const done = index <= completed || state.reconstruction.complete;
    return `<li class="${current ? "ft514-is-current" : ""} ${done ? "ft514-is-done" : ""}"${current ? ' aria-current="step"' : ""}><small>${index}</small><strong>${ft514Escape(char)}</strong><span>${done ? "✓" : "·"}</span></li>`;
  }).join("");
  const occurrences = state.positions.entries.length ? state.positions.entries.map((entry) => `<li><strong>${ft514Escape(entry.char)}</strong><code>[${entry.indices.join(", ")}]</code></li>`).join("") : `<li class="ft514-empty">${ft514Escape(copy.pending)}</li>`;
  return `<section class="ft514-card ft514-key-card" aria-labelledby="ft514-key-title"><header><div><h3 id="ft514-key-title">${ft514Escape(copy.key)}</h3><p>${ft514Escape(copy.keyHelp)}</p></div><strong>${ft514Escape(state.key)}</strong></header><ol class="ft514-key-list" role="list">${items}</ol><h4>${ft514Escape(copy.occurrenceIndex)}</h4><ul class="ft514-occurrences" role="list">${occurrences}</ul></section>`;
}

function ft514RenderDp(state, copy) {
  const costMaps = state.table.map((row) => new Map(row.costs.map((entry) => [entry.position, entry.cost])));
  const headers = [...state.ring].map((char, index) => `<th scope="col"><span>${index}</span><strong>${ft514Escape(char)}</strong></th>`).join("");
  const rows = state.table.map((row, rowIndex) => {
    const costs = costMaps[rowIndex];
    const label = row.layer < 0 ? copy.initial : `${row.layer}: ${row.char}`;
    const cells = [...state.ring].map((_, position) => {
      const value = costs.has(position) ? costs.get(position) : null;
      const current = row.layer === state.frontier.layer && position === state.cursor.previous;
      return `<td class="${value === null ? "ft514-unreachable" : ""} ${current ? "ft514-is-current-cell" : ""}">${value === null ? copy.unreachable : value}</td>`;
    }).join("");
    return `<tr><th scope="row">${ft514Escape(label)}</th>${cells}</tr>`;
  }).join("");
  const chips = (entries, kind) => entries.length ? entries.map((entry) => `<li class="${entry.position === state.cursor.target || entry.position === state.cursor.previous ? "ft514-is-current" : ""}"><small>p${entry.position}</small><strong>${entry.cost}</strong><span>${ft514Escape(kind)}</span></li>`).join("") : `<li class="ft514-empty">${ft514Escape(copy.none)}</li>`;
  return `<section class="ft514-card ft514-dp-card" aria-labelledby="ft514-dp-title"><header><div><h3 id="ft514-dp-title">${ft514Escape(copy.dp)}</h3><p>${ft514Escape(copy.dpHelp)}</p></div><strong>${state.table.length}</strong></header><div class="ft514-table-scroll" tabindex="0"><table><thead><tr><th></th>${headers}</tr></thead><tbody>${rows}</tbody></table></div><h4>${ft514Escape(copy.currentFrontier)}</h4><div class="ft514-frontiers"><div><small>${ft514Escape(copy.currentDp)}</small><ul role="list">${chips(state.frontier.dp, "dp")}</ul></div><div><small>${ft514Escape(copy.nextDp)}</small><ul role="list">${chips(state.frontier.next, "next")}</ul></div></div></section>`;
}

function ft514OutcomeLabel(outcome, copy) {
  if (outcome === "update") return copy.update;
  if (outcome === "keep") return copy.keep;
  return copy.idle;
}

function ft514RenderCandidate(state, copy) {
  const value = state.candidate.value;
  const incumbent = state.candidate.incumbent;
  const facts = value ? [
    [copy.baseCost, value.baseCost],
    [copy.turns, value.turns],
    [copy.press, 1],
    [copy.total, value.total],
    [copy.previous, value.previous],
    [copy.target, value.target],
  ] : [];
  const factHtml = facts.length ? facts.map(([label, entry]) => `<div><dt>${ft514Escape(label)}</dt><dd>${entry}</dd></div>`).join("") : `<div class="ft514-empty">${ft514Escape(copy.pending)}</div>`;
  const incumbentText = incumbent ? `${incumbent.total} · p${incumbent.previous} · ${ft514DirectionLabel(incumbent.direction, copy)}` : copy.none;
  const parents = state.frontier.parent.length ? state.frontier.parent.map((link) => `<li><strong>p${link.position}</strong><span>← p${link.previous}</span><code>${ft514Escape(ft514DirectionLabel(link.direction, copy))} · ${link.turns}</code></li>`).join("") : `<li class="ft514-empty">${ft514Escape(copy.none)}</li>`;
  return `<section class="ft514-card ft514-candidate-card ft514-outcome-${state.candidate.outcome}" aria-labelledby="ft514-candidate-title"><header><div><h3 id="ft514-candidate-title">${ft514Escape(copy.candidate)}</h3><p>${ft514Escape(copy.candidateHelp)}</p></div><strong>${ft514Escape(ft514OutcomeLabel(state.candidate.outcome, copy))}</strong></header><dl class="ft514-candidate-facts">${factHtml}</dl><div class="ft514-incumbent"><small>${ft514Escape(copy.incumbent)}</small><strong>${ft514Escape(incumbentText)}</strong></div><h4>${ft514Escape(copy.parents)}</h4><p class="ft514-parent-help">${ft514Escape(copy.parentsHelp)}</p><ul class="ft514-parent-list" role="list">${parents}</ul></section>`;
}

function ft514RenderWitness(state, copy) {
  const chronological = state.reconstruction.reversed;
  const ordered = chronological ? state.reconstruction.actions : [...state.reconstruction.actions].reverse();
  const items = ordered.length ? ordered.map((action) => {
    const path = action.rotationPath.length ? action.rotationPath.join(" → ") : copy.stay;
    return `<li class="ft514-action ft514-action-${action.direction}"><header><small>#${action.layer}</small><strong>${ft514Escape(action.char)}</strong><span>+${action.cost}</span></header><div><code>${action.from} → ${action.to}</code><strong>${ft514Escape(ft514DirectionLabel(action.direction, copy))}</strong></div><p>${ft514Escape(copy.path)}: ${ft514Escape(path)}</p><footer><span>${action.turns} ${ft514Escape(copy.turns)}</span><b>● ${ft514Escape(copy.press)}</b></footer></li>`;
  }).join("") : `<li class="ft514-empty">${ft514Escape(copy.noActions)}</li>`;
  const answer = state.answer === null ? copy.waitingAnswer : String(state.answer);
  return `<section class="ft514-card ft514-witness-card ${state.reconstruction.complete ? "ft514-is-complete" : ""}" aria-labelledby="ft514-witness-title" aria-live="polite"><header><div><small>${ft514Escape(copy.answer)}</small><h3 id="ft514-witness-title">${ft514Escape(answer)}</h3></div><div><strong>${ft514Escape(copy.reconstruction)}</strong><span>${ft514Escape(chronological ? copy.chronological : copy.reverseOrder)}</span></div></header><p>${ft514Escape(copy.reconstructionHelp)}</p><div class="ft514-action-scroll" tabindex="0"><ol role="list">${items}</ol></div></section>`;
}

function ft514RenderInvariants(state, copy) {
  const checks = [
    [copy.dpPositions, state.invariants.dpPositionsMatchLayer],
    [copy.nextPositions, state.invariants.nextPositionsMatchChar],
    [copy.parentCoverage, state.invariants.parentCoversNext],
    [copy.finiteCosts, state.invariants.costsFinite],
    [copy.witnessValid, state.invariants.witnessValid],
  ].map(([label, value]) => `<li class="ft514-check-${value === true ? "yes" : value === false ? "no" : "pending"}"><span aria-hidden="true">${value === true ? "✓" : value === false ? "×" : "·"}</span><span>${ft514Escape(label)}</span><strong>${ft514Escape(value === null ? copy.notReady : value ? copy.trueValue : copy.falseValue)}</strong></li>`).join("");
  return `<section class="ft514-card ft514-invariants" aria-labelledby="ft514-invariants-title"><header><h3 id="ft514-invariants-title">${ft514Escape(copy.invariants)}</h3></header><ul role="list">${checks}</ul></section>`;
}

function ft514RenderCounters(state, copy, locale) {
  const items = FT514_COUNTERS.map(([name, labels]) => `<li><small>${ft514Escape(labels[locale])}</small><strong>${state.counters[name]}</strong></li>`).join("");
  return `<section class="ft514-card ft514-counters" aria-labelledby="ft514-counters-title"><header><h3 id="ft514-counters-title">${ft514Escape(copy.counters)}</h3></header><ul role="list">${items}</ul></section>`;
}

function renderFreedomTrail514View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = ft514Locale();
  const copy = FT514_TEXT[locale];
  const state = ft514Normalize(step);
  const eventLabel = ft514EventLabel(state.event, locale);
  const timingLabel = state.timing === "before" ? copy.before : copy.after;
  const summary = `${copy.region}. ${copy.line} ${state.source.line}. ${eventLabel}.`;
  const note = state.note ? `<aside class="ft514-note"><strong>${ft514Escape(copy.note)}</strong><p>${ft514Escape(state.note)}</p></aside>` : "";
  host.innerHTML = `<article class="ft514-viz ft514-phase-${state.phase} ${state.final ? "ft514-is-final" : ""}" role="region" aria-label="${ft514Escape(summary)}"><header class="ft514-header"><div><span>${ft514Escape(copy.kicker)}</span><h2>${ft514Escape(state.title)}</h2></div><div class="ft514-line-state"><strong>${ft514Escape(copy.line)} ${state.source.line}</strong><span class="ft514-timing-${state.timing}">${ft514Escape(timingLabel)}</span><em>${ft514Escape(eventLabel)}</em></div></header>${ft514RenderRail(state, copy, locale)}${ft514RenderSource(state, copy, locale)}<div class="ft514-ring-grid">${ft514RenderRing(state, copy)}${ft514RenderRotation(state, copy)}</div>${ft514RenderKey(state, copy)}<div class="ft514-dp-grid">${ft514RenderDp(state, copy)}${ft514RenderCandidate(state, copy)}</div>${ft514RenderWitness(state, copy)}<div class="ft514-footer-grid">${ft514RenderInvariants(state, copy)}${ft514RenderCounters(state, copy, locale)}</div>${note}</article>`;
}
