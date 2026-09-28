"use strict";

const LIP329_SOURCE = Object.freeze([
  "class Solution:",
  "    def longestIncreasingPath(self, matrix):",
  "        rows, cols = len(matrix), len(matrix[0])",
  "        memo = [[0] * cols for _ in range(rows)]",
  "        next_cell = [[None] * cols for _ in range(rows)]",
  "        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]",
  "        def dfs(r, c):",
  "            cached = memo[r][c]",
  "            if cached:",
  "                return cached",
  "            best = 1",
  "            for direction_index, (dr, dc) in enumerate(directions):",
  "                nr, nc = r + dr, c + dc",
  "                in_bounds = 0 <= nr < rows and 0 <= nc < cols",
  "                if not in_bounds:",
  "                    continue",
  "                increasing = matrix[nr][nc] > matrix[r][c]",
  "                if not increasing:",
  "                    continue",
  "                child = dfs(nr, nc)",
  "                candidate = 1 + child",
  "                if candidate > best:",
  "                    best = candidate",
  "                    next_cell[r][c] = (nr, nc)",
  "            memo[r][c] = best",
  "            return best",
  "        answer = 0",
  "        start = None",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                length = dfs(r, c)",
  "                if length > answer:",
  "                    answer = length",
  "                    start = (r, c)",
  "        path = []",
  "        cell = start",
  "        while cell is not None:",
  "            path.append(cell)",
  "            r, c = cell",
  "            cell = next_cell[r][c]",
  "        return answer",
]);

const LIP329_LINE_EVENTS = Object.freeze([
  "bind-class",
  "bind-method",
  "set-dimensions",
  "allocate-memo",
  "allocate-next-cell",
  "set-directions",
  "bind-dfs",
  "cache-check",
  "cache-hit",
  "cache-return",
  "local-best-init",
  "direction",
  "neighbor-coordinate",
  "bounds-check",
  "bounds-check",
  "bounds-reject",
  "increasing-check",
  "increasing-check",
  "increasing-reject",
  "recursive-call",
  "candidate",
  "local-update",
  "local-best-write",
  "next-cell-write",
  "memo-write",
  "dfs-return",
  "global-answer-init",
  "global-start-init",
  "root-row",
  "root-select",
  "root-call",
  "global-update",
  "global-answer-write",
  "global-start-write",
  "witness-init",
  "witness-start",
  "witness-check",
  "witness-append",
  "witness-coordinate",
  "witness-follow",
  "final-return",
]);

const LIP329_EVENTS = Object.freeze({
  "bind-class": { en: "Bind class", vi: "Liên kết lớp" },
  "bind-method": { en: "Bind method", vi: "Liên kết phương thức" },
  "set-dimensions": { en: "Set dimensions", vi: "Đặt kích thước" },
  "allocate-memo": { en: "Allocate memo", vi: "Tạo memo" },
  "allocate-next-cell": { en: "Allocate next-cell matrix", vi: "Tạo ma trận ô kế tiếp" },
  "set-directions": { en: "Fix direction order", vi: "Cố định thứ tự hướng" },
  "bind-dfs": { en: "Bind DFS helper", vi: "Liên kết hàm DFS" },
  "dfs-entry": { en: "Enter DFS", vi: "Vào DFS" },
  "cache-check": { en: "Read cache", vi: "Đọc cache" },
  "cache-hit": { en: "Cache hit", vi: "Cache hit" },
  "cache-miss": { en: "Cache miss", vi: "Cache miss" },
  "cache-return": { en: "Return cached value", vi: "Trả giá trị cache" },
  "local-best-init": { en: "Initialize local best", vi: "Khởi tạo best cục bộ" },
  direction: { en: "Select direction", vi: "Chọn hướng" },
  "neighbor-coordinate": { en: "Derive neighbor", vi: "Tính ô kề" },
  "bounds-check": { en: "Check bounds", vi: "Kiểm tra biên" },
  "bounds-reject": { en: "Reject bounds", vi: "Loại ngoài biên" },
  "increasing-check": { en: "Check strict increase", vi: "Kiểm tra tăng nghiêm ngặt" },
  "increasing-reject": { en: "Reject non-increase", vi: "Loại ô không tăng" },
  "recursive-call": { en: "Call child DFS", vi: "Gọi DFS con" },
  "recursive-return": { en: "Child DFS returns", vi: "DFS con trả về" },
  candidate: { en: "Compute candidate", vi: "Tính ứng viên" },
  "local-update": { en: "Update local best", vi: "Cập nhật best cục bộ" },
  "local-keep": { en: "Keep local best", vi: "Giữ best cục bộ" },
  "local-best-write": { en: "Write local best", vi: "Ghi best cục bộ" },
  "next-cell-write": { en: "Write next cell", vi: "Ghi ô kế tiếp" },
  "memo-write": { en: "Write memo", vi: "Ghi memo" },
  "dfs-return": { en: "Return DFS result", vi: "Trả kết quả DFS" },
  "global-answer-init": { en: "Initialize answer", vi: "Khởi tạo đáp án" },
  "global-start-init": { en: "Initialize start", vi: "Khởi tạo điểm đầu" },
  "root-row": { en: "Scan row", vi: "Duyệt hàng" },
  "root-select": { en: "Select row-major root", vi: "Chọn gốc row-major" },
  "root-call": { en: "Call root DFS", vi: "Gọi DFS gốc" },
  "root-return": { en: "Root DFS returns", vi: "DFS gốc trả về" },
  "global-update": { en: "Update global answer", vi: "Cập nhật đáp án toàn cục" },
  "global-keep": { en: "Keep global answer", vi: "Giữ đáp án toàn cục" },
  "global-answer-write": { en: "Write global answer", vi: "Ghi đáp án toàn cục" },
  "global-start-write": { en: "Write witness start", vi: "Ghi điểm đầu witness" },
  "witness-init": { en: "Initialize witness", vi: "Khởi tạo witness" },
  "witness-start": { en: "Select witness start", vi: "Chọn điểm đầu witness" },
  "witness-check": { en: "Check witness cursor", vi: "Kiểm tra con trỏ witness" },
  "witness-append": { en: "Append witness cell", vi: "Thêm ô witness" },
  "witness-coordinate": { en: "Unpack coordinate", vi: "Tách tọa độ" },
  "witness-follow": { en: "Follow next cell", vi: "Đi theo ô kế tiếp" },
  "witness-complete": { en: "Complete witness", vi: "Hoàn tất witness" },
  "final-return": { en: "Return answer", vi: "Trả đáp án" },
});

const LIP329_DIRECTION_NAMES = Object.freeze({
  up: { en: "up", vi: "lên" },
  down: { en: "down", vi: "xuống" },
  left: { en: "left", vi: "trái" },
  right: { en: "right", vi: "phải" },
});

const LIP329_COUNTERS = Object.freeze([
  ["dfsCalls", { en: "DFS calls", vi: "Lần gọi DFS" }],
  ["cacheHits", { en: "Cache hits", vi: "Cache hit" }],
  ["cacheMisses", { en: "Cache misses", vi: "Cache miss" }],
  ["directionsTried", { en: "Directions", vi: "Hướng đã thử" }],
  ["boundsRejects", { en: "Bounds rejects", vi: "Loại ngoài biên" }],
  ["increasingRejects", { en: "Value rejects", vi: "Loại do giá trị" }],
  ["recursiveCalls", { en: "Recursive edges", vi: "Cạnh đệ quy" }],
  ["memoWrites", { en: "Memo writes", vi: "Lần ghi memo" }],
  ["localUpdates", { en: "Local updates", vi: "Cập nhật cục bộ" }],
  ["localKeeps", { en: "Local keeps", vi: "Giữ cục bộ" }],
  ["globalUpdates", { en: "Global updates", vi: "Cập nhật toàn cục" }],
  ["globalKeeps", { en: "Global keeps", vi: "Giữ toàn cục" }],
]);

const LIP329_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Longest Increasing Path exact DFS and memo visualization",
    kicker: "LEETCODE 329 · DFS + MEMO + WITNESS",
    fallbackTitle: "Longest Increasing Path in a Matrix",
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
    matrix: "Value + memo matrix",
    matrixHelp: "Each cell shows its input value, memo length, and stored next coordinate.",
    value: "value",
    memo: "memo",
    next: "next",
    uncomputed: "uncomputed",
    computing: "computing",
    computed: "computed",
    root: "root",
    current: "current DFS",
    neighbor: "neighbor",
    activePath: "active path",
    memoRead: "memo read",
    memoWrite: "memo write",
    nextWrite: "next write",
    witness: "witness",
    dfs: "DFS stack and active path",
    stack: "Call stack",
    emptyStack: "No DFS frame is active.",
    emptyPath: "No active DFS path.",
    depth: "depth",
    stage: "stage",
    best: "best",
    relation: "Neighbor relation",
    direction: "direction",
    delta: "delta",
    from: "from",
    to: "to",
    verdict: "verdict",
    reason: "reason",
    inBounds: "in bounds",
    increasing: "strictly increasing",
    pending: "pending",
    accepted: "accepted",
    rejected: "rejected",
    idle: "idle",
    none: "none",
    cache: "Cache and memo access",
    cacheState: "cache state",
    read: "read",
    write: "write",
    localCandidate: "Local candidate",
    child: "child",
    candidate: "candidate",
    incumbent: "incumbent",
    outcome: "outcome",
    update: "UPDATE",
    keep: "KEEP",
    global: "Row-major global decision",
    rootCandidate: "root candidate",
    answer: "answer",
    bestStart: "best start",
    counters: "Operation counters",
    witnessTitle: "Deterministic increasing witness",
    witnessHelp: "Numbered coordinates and values follow strict next-cell choices.",
    witnessAwaiting: "Witness reconstruction has not appended a cell yet.",
    step: "step",
    finalResult: "Longest path length",
    awaiting: "awaiting final return",
    note: "Why this frame matters",
  }),
  vi: Object.freeze({
    region: "Trực quan DFS và memo chính xác cho Đường tăng dài nhất",
    kicker: "LEETCODE 329 · DFS + MEMO + WITNESS",
    fallbackTitle: "Đường tăng dài nhất trong ma trận",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    eventRail: "Thanh mã nguồn và sự kiện runtime chính xác",
    sourceAction: "Hành động mã nguồn hiện tại",
    phase: "Giai đoạn",
    event: "Sự kiện",
    condition: "Điều kiện",
    noCondition: "Frame này không có điều kiện.",
    trueValue: "ĐÚNG",
    falseValue: "SAI",
    matrix: "Ma trận giá trị + memo",
    matrixHelp: "Mỗi ô hiển thị giá trị đầu vào, độ dài memo và tọa độ kế tiếp đã lưu.",
    value: "giá trị",
    memo: "memo",
    next: "kế tiếp",
    uncomputed: "chưa tính",
    computing: "đang tính",
    computed: "đã tính",
    root: "gốc",
    current: "DFS hiện tại",
    neighbor: "ô kề",
    activePath: "đường đang chạy",
    memoRead: "đọc memo",
    memoWrite: "ghi memo",
    nextWrite: "ghi ô kế",
    witness: "witness",
    dfs: "Stack DFS và đường đang hoạt động",
    stack: "Stack lời gọi",
    emptyStack: "Không có frame DFS đang hoạt động.",
    emptyPath: "Không có đường DFS đang hoạt động.",
    depth: "độ sâu",
    stage: "giai đoạn",
    best: "best",
    relation: "Quan hệ ô kề",
    direction: "hướng",
    delta: "độ dời",
    from: "từ",
    to: "đến",
    verdict: "kết luận",
    reason: "lý do",
    inBounds: "trong biên",
    increasing: "tăng nghiêm ngặt",
    pending: "đang chờ",
    accepted: "chấp nhận",
    rejected: "loại",
    idle: "rỗng",
    none: "không có",
    cache: "Cache và truy cập memo",
    cacheState: "trạng thái cache",
    read: "đọc",
    write: "ghi",
    localCandidate: "Ứng viên cục bộ",
    child: "ô con",
    candidate: "ứng viên",
    incumbent: "giá trị hiện tại",
    outcome: "kết quả",
    update: "CẬP NHẬT",
    keep: "GIỮ",
    global: "Quyết định toàn cục row-major",
    rootCandidate: "ứng viên gốc",
    answer: "đáp án",
    bestStart: "điểm đầu tốt nhất",
    counters: "Bộ đếm thao tác",
    witnessTitle: "Witness tăng xác định",
    witnessHelp: "Tọa độ và giá trị được đánh số đi theo lựa chọn ô kế tiếp nghiêm ngặt.",
    witnessAwaiting: "Tái dựng witness chưa thêm ô nào.",
    step: "bước",
    finalResult: "Độ dài đường dài nhất",
    awaiting: "đang chờ return cuối",
    note: "Ý nghĩa của frame này",
  }),
});

function lip329Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function lip329Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function lip329CleanText(value, fallback = "", maximum = 500) {
  if (typeof value !== "string") return fallback;
  const text = value.slice(0, maximum).trim();
  return /^(?:undefined|null|nan|[+-]?infinity)$/i.test(text) ? fallback : text;
}

function lip329Localized(value, locale, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return lip329CleanText(value[locale], lip329CleanText(value.en, lip329CleanText(value.vi, fallback)));
  }
  return lip329CleanText(value, fallback);
}

function lip329Integer(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function lip329NormalizeMatrix(rawMatrix) {
  const values = rawMatrix && typeof rawMatrix === "object" && Array.isArray(rawMatrix.values)
    ? rawMatrix.values
    : [];
  if (values.length < 1 || values.length > 6) return [];
  const columns = Array.isArray(values[0]) ? values[0].length : 0;
  if (columns < 1 || columns > 6) return [];
  const matrix = values.map((row) => {
    if (!Array.isArray(row) || row.length !== columns) return null;
    const normalized = row.map((value) => Number.isSafeInteger(value) ? value : null);
    return normalized.every((value) => value !== null) ? normalized : null;
  });
  return matrix.every(Boolean) ? matrix : [];
}

function lip329Coordinate(raw, matrix, allowOutside = false) {
  if (!raw || typeof raw !== "object") return null;
  const rows = matrix.length;
  const columns = rows ? matrix[0].length : 0;
  const minimum = allowOutside ? -1 : 0;
  const row = lip329Integer(raw.row, minimum, allowOutside ? rows : rows - 1);
  const column = lip329Integer(raw.column, minimum, allowOutside ? columns : columns - 1);
  if (row === null || column === null) return null;
  const inBounds = row >= 0 && row < rows && column >= 0 && column < columns;
  if (!allowOutside && !inBounds) return null;
  return { row, column, value: inBounds ? matrix[row][column] : null };
}

function lip329Normalize(step) {
  const raw = step && step.longestIncreasingPath329View && typeof step.longestIncreasingPath329View === "object"
    ? step.longestIncreasingPath329View
    : {};
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = lip329Integer(sourceRaw.line, 1, LIP329_SOURCE.length)
    ?? lip329Integer(fallbackLine, 1, LIP329_SOURCE.length)
    ?? 1;
  const fallbackEvent = LIP329_LINE_EVENTS[sourceLine - 1];
  const event = Object.prototype.hasOwnProperty.call(LIP329_EVENTS, raw.event) ? raw.event : fallbackEvent;
  const phase = ["setup", "dfs", "scan", "witness", "done"].includes(raw.phase) ? raw.phase : "setup";
  const timing = raw.timing === "before" ? "before" : "after";
  const matrix = lip329NormalizeMatrix(raw.matrix);
  const rows = matrix.length;
  const columns = rows ? matrix[0].length : 0;
  const maximumLength = Math.max(1, rows * columns);
  const cursorsRaw = raw.cursors && typeof raw.cursors === "object" ? raw.cursors : {};
  const cursors = {
    root: lip329Coordinate(cursorsRaw.root, matrix),
    current: lip329Coordinate(cursorsRaw.current, matrix),
    neighbor: lip329Coordinate(cursorsRaw.neighbor, matrix, true),
    witness: lip329Coordinate(cursorsRaw.witness, matrix),
  };

  const directionRaw = raw.direction && typeof raw.direction === "object" ? raw.direction : {};
  const directionIndex = lip329Integer(directionRaw.index, 0, 3);
  const canonicalDirections = [
    { name: "up", dr: -1, dc: 0 },
    { name: "down", dr: 1, dc: 0 },
    { name: "left", dr: 0, dc: -1 },
    { name: "right", dr: 0, dc: 1 },
  ];
  const canonicalDirection = directionIndex === null ? null : canonicalDirections[directionIndex];
  const direction = canonicalDirection
    ? { index: directionIndex, ...canonicalDirection }
    : { index: null, name: null, dr: null, dc: null };

  const stackStages = new Set([
    "entry", "cache-check", "cache-hit", "cache-return", "cache-miss", "local-best-init",
    "direction", "neighbor-coordinate", "bounds-check", "bounds-reject", "increasing-check",
    "increasing-reject", "recursive-call", "recursive-return", "candidate", "local-update",
    "local-keep", "local-best-write", "next-cell-write", "memo-write", "dfs-return",
  ]);
  const stack = Array.isArray(raw.stack) ? raw.stack.slice(0, maximumLength).map((item, index) => {
    const frame = item && typeof item === "object" ? item : {};
    const coordinate = lip329Coordinate(frame, matrix);
    if (!coordinate) return null;
    return {
      depth: lip329Integer(frame.depth, 0, maximumLength - 1) ?? index,
      ...coordinate,
      best: lip329Integer(frame.best, 1, maximumLength),
      stage: stackStages.has(frame.stage) ? frame.stage : "entry",
      returnValue: lip329Integer(frame.returnValue, 1, maximumLength),
    };
  }).filter(Boolean) : [];

  const neighborRaw = raw.neighbor && typeof raw.neighbor === "object" ? raw.neighbor : {};
  const neighbor = {
    from: lip329Coordinate(neighborRaw.from, matrix) || cursors.current,
    to: lip329Coordinate(neighborRaw.to, matrix, true) || cursors.neighbor,
    inBounds: typeof neighborRaw.inBounds === "boolean" ? neighborRaw.inBounds : null,
    increasing: typeof neighborRaw.increasing === "boolean" ? neighborRaw.increasing : null,
    verdict: ["idle", "pending", "accepted", "rejected"].includes(neighborRaw.verdict) ? neighborRaw.verdict : "idle",
    reason: [
      "direction-selected", "coordinate-derived", "in-bounds", "out-of-bounds",
      "strictly-larger", "equal", "not-larger",
    ].includes(neighborRaw.reason) ? neighborRaw.reason : null,
  };

  const normalizeAccess = (value, allowedStatuses) => {
    const access = value && typeof value === "object" ? value : {};
    const coordinate = lip329Coordinate(access.coordinate || access, matrix);
    return {
      coordinate,
      value: lip329Integer(access.value, 0, maximumLength),
      status: allowedStatuses.includes(access.status) ? access.status : "idle",
    };
  };
  const cacheRaw = raw.cache && typeof raw.cache === "object" ? raw.cache : {};
  const cache = {
    coordinate: lip329Coordinate(cacheRaw.coordinate || cacheRaw, matrix),
    status: ["idle", "checking", "hit", "miss"].includes(cacheRaw.status) ? cacheRaw.status : "idle",
    hit: typeof cacheRaw.hit === "boolean" ? cacheRaw.hit : null,
    value: lip329Integer(cacheRaw.value, 0, maximumLength),
  };

  const memoRaw = raw.memo && typeof raw.memo === "object" ? raw.memo : {};
  const memoStatuses = new Set(["unallocated", "uncomputed", "computing", "computed"]);
  const memoValues = Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
    const value = Array.isArray(memoRaw.values) && Array.isArray(memoRaw.values[row])
      ? memoRaw.values[row][column]
      : 0;
    return lip329Integer(value, 0, maximumLength) ?? 0;
  }));
  const memoStatus = Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
    const value = Array.isArray(memoRaw.status) && Array.isArray(memoRaw.status[row])
      ? memoRaw.status[row][column]
      : null;
    return memoStatuses.has(value) ? value : memoRaw.allocated === true ? "uncomputed" : "unallocated";
  }));
  const memo = {
    allocated: memoRaw.allocated === true,
    values: memoValues,
    status: memoStatus,
    read: normalizeAccess(memoRaw.read, ["idle", "checking", "hit", "miss"]),
    write: normalizeAccess(memoRaw.write, ["idle", "write"]),
  };

  const candidateRaw = raw.candidate && typeof raw.candidate === "object" ? raw.candidate : {};
  const candidate = {
    from: lip329Coordinate(candidateRaw.from, matrix),
    to: lip329Coordinate(candidateRaw.to, matrix, true),
    child: lip329Integer(candidateRaw.child, 1, maximumLength),
    value: lip329Integer(candidateRaw.value, 1, maximumLength),
    incumbent: lip329Integer(candidateRaw.incumbent, 1, maximumLength),
    incumbentAfter: lip329Integer(candidateRaw.incumbentAfter, 1, maximumLength),
    outcome: ["idle", "pending", "update", "keep"].includes(candidateRaw.outcome) ? candidateRaw.outcome : "idle",
    reason: ["awaiting-child", "child-returned", "computed", "strictly-greater", "tie", "lower"].includes(candidateRaw.reason)
      ? candidateRaw.reason
      : null,
  };

  const nextRaw = raw.nextCell && typeof raw.nextCell === "object"
    ? raw.nextCell
    : raw.choice && typeof raw.choice === "object" ? raw.choice : {};
  const nextValues = Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
    const value = Array.isArray(nextRaw.values) && Array.isArray(nextRaw.values[row])
      ? nextRaw.values[row][column]
      : null;
    return lip329Coordinate(value, matrix);
  }));
  const nextStatus = Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
    const value = Array.isArray(nextRaw.status) && Array.isArray(nextRaw.status[row])
      ? nextRaw.status[row][column]
      : null;
    return ["unallocated", "unset", "chosen"].includes(value) ? value : nextRaw.allocated === true ? "unset" : "unallocated";
  }));
  const nextWriteRaw = nextRaw.write && typeof nextRaw.write === "object" ? nextRaw.write : {};
  const nextCell = {
    allocated: nextRaw.allocated === true,
    values: nextValues,
    status: nextStatus,
    write: {
      coordinate: lip329Coordinate(nextWriteRaw.coordinate || nextWriteRaw, matrix),
      target: lip329Coordinate(nextWriteRaw.target, matrix),
      status: nextWriteRaw.status === "write" ? "write" : "idle",
    },
  };

  const globalRaw = raw.global && typeof raw.global === "object" ? raw.global : {};
  const globalCandidateRaw = globalRaw.candidate && typeof globalRaw.candidate === "object" ? globalRaw.candidate : {};
  const global = {
    root: lip329Coordinate(globalRaw.root, matrix),
    candidate: globalRaw.candidate && typeof globalRaw.candidate === "object" ? {
      root: lip329Coordinate(globalCandidateRaw.root, matrix),
      length: lip329Integer(globalCandidateRaw.length, 1, maximumLength),
    } : null,
    answer: lip329Integer(globalRaw.answer, 0, maximumLength),
    bestStart: lip329Coordinate(globalRaw.bestStart, matrix),
    outcome: ["idle", "initialized", "pending", "update", "keep"].includes(globalRaw.outcome) ? globalRaw.outcome : "idle",
    updated: typeof globalRaw.updated === "boolean" ? globalRaw.updated : null,
    reason: ["zero-baseline", "no-root-yet", "row-major-root", "root-returned", "strictly-greater", "tie", "lower"].includes(globalRaw.reason)
      ? globalRaw.reason
      : null,
  };

  const witnessRaw = raw.witness && typeof raw.witness === "object" ? raw.witness : {};
  const seenWitness = new Set();
  const witnessCells = Array.isArray(witnessRaw.cells) ? witnessRaw.cells.slice(0, maximumLength).map((item) => {
    const coordinate = lip329Coordinate(item, matrix);
    if (!coordinate) return null;
    const key = `${coordinate.row},${coordinate.column}`;
    if (seenWitness.has(key)) return null;
    seenWitness.add(key);
    return { step: seenWitness.size, ...coordinate };
  }).filter(Boolean) : [];
  const witnessFollowRaw = witnessRaw.follow && typeof witnessRaw.follow === "object" ? witnessRaw.follow : {};
  const witness = {
    reconstructing: witnessRaw.reconstructing === true,
    cells: witnessCells,
    current: lip329Coordinate(witnessRaw.current, matrix),
    follow: {
      from: lip329Coordinate(witnessFollowRaw.from, matrix),
      to: lip329Coordinate(witnessFollowRaw.to, matrix),
      status: ["idle", "initialized", "follow", "end"].includes(witnessFollowRaw.status) ? witnessFollowRaw.status : "idle",
    },
    complete: witnessRaw.complete === true,
  };

  const countersRaw = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const counters = {};
  [
    "dfsCalls", "cacheChecks", "cacheHits", "cacheMisses", "directionsTried", "neighborCoordinates",
    "boundsChecks", "boundsRejects", "increasingChecks", "increasingRejects", "acceptedNeighbors",
    "recursiveCalls", "recursiveReturns", "candidates", "localUpdates", "localKeeps", "nextCellWrites",
    "memoWrites", "rootCalls", "globalUpdates", "globalKeeps", "witnessAppends", "witnessFollows",
  ].forEach((key) => {
    counters[key] = lip329Integer(countersRaw[key], 0, 100000) ?? 0;
  });

  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};
  const locale = lip329Locale();
  return {
    source: { line: sourceLine, text: LIP329_SOURCE[sourceLine - 1] },
    event,
    phase,
    timing,
    condition: {
      expression: lip329CleanText(conditionRaw.expression, "", 180),
      result: typeof conditionRaw.result === "boolean" ? conditionRaw.result : null,
    },
    matrix,
    rows,
    columns,
    cursors,
    direction,
    stack,
    activePath: stack.map((frame) => ({ row: frame.row, column: frame.column, value: frame.value })),
    neighbor,
    cache,
    memo,
    candidate,
    nextCell,
    global,
    witness,
    counters,
    answer: lip329Integer(raw.answer, 0, maximumLength),
    final: raw.final === true || Boolean(step && step.final),
    title: lip329Localized(step && step.title, locale, LIP329_TEXT[locale].fallbackTitle),
    note: lip329Localized(step && step.note, locale, ""),
  };
}

function lip329Display(value, fallback = "—") {
  return value === null ? fallback : String(value);
}

function lip329CoordinateText(coordinate, fallback = "—") {
  return coordinate ? `(${coordinate.row}, ${coordinate.column})` : fallback;
}

function lip329BooleanText(value, copy) {
  return value === null ? copy.pending : value ? copy.trueValue : copy.falseValue;
}

function lip329RenderRail(state, copy, locale) {
  const items = LIP329_SOURCE.map((source, index) => {
    const line = index + 1;
    const current = line === state.source.line;
    const eventKey = LIP329_LINE_EVENTS[index];
    const label = LIP329_EVENTS[eventKey] ? LIP329_EVENTS[eventKey][locale] : copy.event;
    return `<li class="lip329-rail-item ${current ? "lip329-is-current" : ""}"${current ? ' aria-current="step"' : ""}><small>L${line} · ${lip329Escape(label)}</small><code>${lip329Escape(source)}</code></li>`;
  }).join("");
  return `<nav class="lip329-rail-wrap" aria-label="${lip329Escape(copy.eventRail)}"><ol class="lip329-event-rail" role="list">${items}</ol></nav>`;
}

function lip329RenderSource(state, copy, locale) {
  const eventLabel = LIP329_EVENTS[state.event][locale];
  const condition = state.condition.result === null
    ? copy.noCondition
    : `${state.condition.expression || copy.condition} → ${state.condition.result ? copy.trueValue : copy.falseValue}`;
  const conditionClass = state.condition.result === null ? "none" : state.condition.result ? "true" : "false";
  return `<section class="lip329-source-card" aria-labelledby="lip329-source-title"><div class="lip329-source-expression"><small id="lip329-source-title">${lip329Escape(copy.sourceAction)}</small><code>${lip329Escape(state.source.text)}</code></div><dl class="lip329-source-facts"><div><dt>${lip329Escape(copy.phase)}</dt><dd>${lip329Escape(state.phase)}</dd></div><div><dt>${lip329Escape(copy.event)}</dt><dd>${lip329Escape(eventLabel)}</dd></div><div><dt>${lip329Escape(copy.condition)}</dt><dd class="lip329-condition-${conditionClass}">${lip329Escape(condition)}</dd></div></dl></section>`;
}

function lip329Matches(coordinate, row, column) {
  return Boolean(coordinate && coordinate.row === row && coordinate.column === column);
}

function lip329RenderMatrix(state, copy) {
  if (!state.rows || !state.columns) {
    return `<section class="lip329-card lip329-matrix-card" aria-labelledby="lip329-matrix-title"><header><h3 id="lip329-matrix-title">${lip329Escape(copy.matrix)}</h3></header><div class="lip329-empty">${lip329Escape(copy.awaiting)}</div></section>`;
  }
  const witnessKeys = new Set(state.witness.cells.map((cell) => `${cell.row},${cell.column}`));
  const pathKeys = new Set(state.activePath.map((cell) => `${cell.row},${cell.column}`));
  const headers = Array.from({ length: state.columns }, (_, column) => `<th scope="col">c${column}</th>`).join("");
  const rows = state.matrix.map((matrixRow, row) => {
    const cells = matrixRow.map((value, column) => {
      const memoStatus = state.memo.status[row][column];
      const memoValue = state.memo.values[row][column];
      const next = state.nextCell.values[row][column];
      const roles = [];
      if (lip329Matches(state.cursors.root, row, column)) roles.push(copy.root);
      if (lip329Matches(state.cursors.current, row, column)) roles.push(copy.current);
      if (lip329Matches(state.cursors.neighbor, row, column)) roles.push(copy.neighbor);
      if (pathKeys.has(`${row},${column}`)) roles.push(copy.activePath);
      if (lip329Matches(state.memo.read.coordinate, row, column)) roles.push(copy.memoRead);
      if (lip329Matches(state.memo.write.coordinate, row, column)) roles.push(copy.memoWrite);
      if (lip329Matches(state.nextCell.write.coordinate, row, column)) roles.push(copy.nextWrite);
      if (witnessKeys.has(`${row},${column}`)) roles.push(copy.witness);
      const classes = [
        `lip329-memo-${memoStatus}`,
        lip329Matches(state.cursors.root, row, column) ? "lip329-is-root" : "",
        lip329Matches(state.cursors.current, row, column) ? "lip329-is-current-cell" : "",
        lip329Matches(state.cursors.neighbor, row, column) ? "lip329-is-neighbor" : "",
        pathKeys.has(`${row},${column}`) ? "lip329-is-active-path" : "",
        lip329Matches(state.memo.read.coordinate, row, column) ? "lip329-is-memo-read" : "",
        lip329Matches(state.memo.write.coordinate, row, column) ? "lip329-is-memo-write" : "",
        lip329Matches(state.nextCell.write.coordinate, row, column) ? "lip329-is-next-write" : "",
        witnessKeys.has(`${row},${column}`) ? "lip329-is-witness" : "",
      ].filter(Boolean).join(" ");
      const memoDisplay = memoStatus === "computed" ? String(memoValue) : memoStatus === "computing" ? "…" : "·";
      const nextDisplay = next ? `(${next.row},${next.column})` : "—";
      const roleText = roles.length ? roles.join(", ") : copy.idle;
      const aria = `[${row}, ${column}], ${copy.value} ${value}, ${copy.memo} ${memoDisplay}, ${copy.next} ${nextDisplay}, ${roleText}`;
      return `<td class="${classes}" aria-label="${lip329Escape(aria)}"><div class="lip329-cell-value"><small>v</small><strong>${lip329Escape(value)}</strong></div><div class="lip329-cell-memo"><small>m</small><strong>${lip329Escape(memoDisplay)}</strong></div><code class="lip329-cell-next">→ ${lip329Escape(nextDisplay)}</code><span class="lip329-cell-roles">${lip329Escape(roleText)}</span></td>`;
    }).join("");
    return `<tr><th scope="row">r${row}</th>${cells}</tr>`;
  }).join("");
  const legend = [
    ["root", copy.root], ["current", copy.current], ["neighbor", copy.neighbor],
    ["path", copy.activePath], ["read", copy.memoRead], ["write", copy.memoWrite],
    ["next", copy.nextWrite], ["witness", copy.witness],
  ].map(([kind, label]) => `<li class="lip329-legend-${kind}"><span aria-hidden="true"></span>${lip329Escape(label)}</li>`).join("");
  return `<section class="lip329-card lip329-matrix-card" aria-labelledby="lip329-matrix-title"><header><div><h3 id="lip329-matrix-title">${lip329Escape(copy.matrix)}</h3><p>${lip329Escape(copy.matrixHelp)}</p></div><ul class="lip329-matrix-legend" role="list">${legend}</ul></header><div class="lip329-matrix-scroll" tabindex="0" role="region" aria-label="${lip329Escape(copy.matrix)}"><table class="lip329-matrix"><caption>${lip329Escape(copy.matrixHelp)}</caption><thead><tr><th aria-hidden="true"></th>${headers}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function lip329RenderDfs(state, copy) {
  const stack = state.stack.length
    ? `<ol class="lip329-stack-list" role="list">${state.stack.map((frame) => `<li${frame.depth === state.stack.length - 1 ? ' aria-current="step"' : ""}><small>${lip329Escape(copy.depth)} ${frame.depth}</small><code>dfs(${frame.row}, ${frame.column})</code><strong>${lip329Escape(copy.best)} ${lip329Display(frame.best)}</strong><span>${lip329Escape(frame.stage)}</span></li>`).join("")}</ol>`
    : `<div class="lip329-empty">${lip329Escape(copy.emptyStack)}</div>`;
  const path = state.activePath.length
    ? `<ol class="lip329-path-list" role="list">${state.activePath.map((cell, index) => `<li><small>#${index}</small><strong>${lip329Escape(cell.value)}</strong><code>(${cell.row}, ${cell.column})</code></li>`).join("")}</ol>`
    : `<div class="lip329-empty">${lip329Escape(copy.emptyPath)}</div>`;
  return `<section class="lip329-card lip329-dfs-card" aria-labelledby="lip329-dfs-title"><header><h3 id="lip329-dfs-title">${lip329Escape(copy.dfs)}</h3><span>${state.stack.length}/${state.rows * state.columns || 0}</span></header><div class="lip329-dfs-grid"><div><h4>${lip329Escape(copy.stack)}</h4><div class="lip329-stack-scroll">${stack}</div></div><div><h4>${lip329Escape(copy.activePath)}</h4><div class="lip329-path-scroll">${path}</div></div></div></section>`;
}

function lip329VerdictLabel(verdict, copy) {
  if (verdict === "accepted") return copy.accepted;
  if (verdict === "rejected") return copy.rejected;
  if (verdict === "pending") return copy.pending;
  return copy.idle;
}

function lip329RenderNeighbor(state, copy, locale) {
  const directionName = state.direction.name
    ? LIP329_DIRECTION_NAMES[state.direction.name][locale]
    : copy.none;
  const verdict = lip329VerdictLabel(state.neighbor.verdict, copy);
  const facts = [
    [copy.direction, directionName],
    [copy.delta, state.direction.index === null ? copy.none : `(${state.direction.dr}, ${state.direction.dc})`],
    [copy.from, lip329CoordinateText(state.neighbor.from, copy.none)],
    [copy.to, lip329CoordinateText(state.neighbor.to, copy.none)],
    [copy.inBounds, lip329BooleanText(state.neighbor.inBounds, copy)],
    [copy.increasing, lip329BooleanText(state.neighbor.increasing, copy)],
  ].map(([label, value]) => `<div><dt>${lip329Escape(label)}</dt><dd>${lip329Escape(value)}</dd></div>`).join("");
  return `<section class="lip329-card lip329-neighbor-card lip329-verdict-${state.neighbor.verdict}" aria-labelledby="lip329-neighbor-title" aria-live="polite"><header><h3 id="lip329-neighbor-title">${lip329Escape(copy.relation)}</h3><strong>${lip329Escape(verdict)}</strong></header><dl>${facts}</dl><p><span>${lip329Escape(copy.reason)}</span>${lip329Escape(state.neighbor.reason || copy.none)}</p></section>`;
}

function lip329AccessCard(access, label, copy) {
  const coordinate = lip329CoordinateText(access.coordinate, copy.none);
  return `<div class="lip329-access lip329-access-${access.status}"><small>${lip329Escape(label)}</small><code>${lip329Escape(coordinate)}</code><strong>${lip329Escape(lip329Display(access.value))}</strong><span>${lip329Escape(access.status)}</span></div>`;
}

function lip329RenderCache(state, copy) {
  const cacheCoordinate = lip329CoordinateText(state.cache.coordinate, copy.none);
  return `<section class="lip329-card lip329-cache-card" aria-labelledby="lip329-cache-title"><header><h3 id="lip329-cache-title">${lip329Escape(copy.cache)}</h3><span class="lip329-cache-${state.cache.status}">${lip329Escape(state.cache.status)}</span></header><div class="lip329-cache-summary"><div><small>${lip329Escape(copy.cacheState)}</small><code>${lip329Escape(cacheCoordinate)}</code><strong>${lip329Escape(lip329Display(state.cache.value))}</strong></div><div><small>hit?</small><strong>${lip329Escape(lip329BooleanText(state.cache.hit, copy))}</strong></div></div><div class="lip329-access-grid">${lip329AccessCard(state.memo.read, copy.read, copy)}${lip329AccessCard(state.memo.write, copy.write, copy)}</div></section>`;
}

function lip329OutcomeLabel(outcome, copy) {
  if (outcome === "update") return copy.update;
  if (outcome === "keep") return copy.keep;
  return outcome === "pending" ? copy.pending : copy.idle;
}

function lip329RenderDecisions(state, copy) {
  const localFacts = [
    [copy.from, lip329CoordinateText(state.candidate.from, copy.none)],
    [copy.to, lip329CoordinateText(state.candidate.to, copy.none)],
    [copy.child, lip329Display(state.candidate.child)],
    [copy.candidate, lip329Display(state.candidate.value)],
    [copy.incumbent, lip329Display(state.candidate.incumbent)],
  ].map(([label, value]) => `<div><dt>${lip329Escape(label)}</dt><dd>${lip329Escape(value)}</dd></div>`).join("");
  const globalLength = state.global.candidate ? state.global.candidate.length : null;
  const globalFacts = [
    [copy.rootCandidate, `${lip329CoordinateText(state.global.root, copy.none)} · ${lip329Display(globalLength)}`],
    [copy.answer, lip329Display(state.global.answer)],
    [copy.bestStart, lip329CoordinateText(state.global.bestStart, copy.none)],
    [copy.reason, state.global.reason || copy.none],
  ].map(([label, value]) => `<div><dt>${lip329Escape(label)}</dt><dd>${lip329Escape(value)}</dd></div>`).join("");
  return `<section class="lip329-card lip329-decisions" aria-label="${lip329Escape(copy.localCandidate)}"><div class="lip329-decision-panel lip329-outcome-${state.candidate.outcome}"><header><h3>${lip329Escape(copy.localCandidate)}</h3><strong>${lip329Escape(lip329OutcomeLabel(state.candidate.outcome, copy))}</strong></header><dl>${localFacts}</dl><p>${lip329Escape(state.candidate.reason || copy.none)}</p></div><div class="lip329-decision-panel lip329-outcome-${state.global.outcome}"><header><h3>${lip329Escape(copy.global)}</h3><strong>${lip329Escape(lip329OutcomeLabel(state.global.outcome, copy))}</strong></header><dl>${globalFacts}</dl></div></section>`;
}

function lip329RenderCounters(state, copy, locale) {
  const cards = LIP329_COUNTERS.map(([key, labels]) => `<li><small>${lip329Escape(labels[locale])}</small><strong>${state.counters[key]}</strong></li>`).join("");
  return `<section class="lip329-card lip329-counters" aria-labelledby="lip329-counters-title"><header><h3 id="lip329-counters-title">${lip329Escape(copy.counters)}</h3></header><ul role="list">${cards}</ul></section>`;
}

function lip329RenderWitness(state, copy) {
  const items = state.witness.cells.length
    ? `<ol class="lip329-witness-list" role="list">${state.witness.cells.map((cell) => `<li${lip329Matches(state.witness.current, cell.row, cell.column) ? ' aria-current="step"' : ""}><small>${lip329Escape(copy.step)} ${cell.step}</small><strong>${lip329Escape(cell.value)}</strong><code>(${cell.row}, ${cell.column})</code></li>`).join("")}</ol>`
    : `<div class="lip329-empty">${lip329Escape(copy.witnessAwaiting)}</div>`;
  const answer = state.answer === null ? copy.awaiting : String(state.answer);
  const follow = state.witness.follow.from
    ? `${lip329CoordinateText(state.witness.follow.from)} → ${lip329CoordinateText(state.witness.follow.to, "None")}`
    : copy.none;
  return `<section class="lip329-card lip329-witness-card ${state.witness.complete ? "lip329-is-complete" : ""}" aria-labelledby="lip329-witness-title" aria-live="polite"><header><div><small>${lip329Escape(copy.finalResult)}</small><h3 id="lip329-witness-title">${lip329Escape(answer)}</h3></div><div><strong>${lip329Escape(copy.witnessTitle)}</strong><span>${lip329Escape(state.witness.complete ? copy.computed : copy.pending)}</span></div></header><p>${lip329Escape(copy.witnessHelp)}</p><div class="lip329-witness-scroll">${items}</div><footer><small>${lip329Escape(copy.next)}</small><code>${lip329Escape(follow)}</code></footer></section>`;
}

function renderLongestIncreasingPath329View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = lip329Locale();
  const copy = LIP329_TEXT[locale];
  const state = lip329Normalize(step);
  const eventLabel = LIP329_EVENTS[state.event][locale];
  const timingLabel = state.timing === "before" ? copy.before : copy.after;
  const summary = `${copy.region}. ${copy.line} ${state.source.line}. ${eventLabel}.`;
  const note = state.note
    ? `<aside class="lip329-note"><strong>${lip329Escape(copy.note)}</strong><p>${lip329Escape(state.note)}</p></aside>`
    : "";
  host.innerHTML = `<article class="lip329-viz lip329-phase-${state.phase} ${state.final ? "lip329-is-final" : ""}" role="region" aria-label="${lip329Escape(summary)}"><header class="lip329-header"><div><span>${lip329Escape(copy.kicker)}</span><h2>${lip329Escape(state.title)}</h2></div><div class="lip329-line-state"><strong>${lip329Escape(copy.line)} ${state.source.line}</strong><span class="lip329-timing-${state.timing}">${lip329Escape(timingLabel)}</span><em>${lip329Escape(eventLabel)}</em></div></header>${lip329RenderRail(state, copy, locale)}${lip329RenderSource(state, copy, locale)}${lip329RenderMatrix(state, copy)}${lip329RenderDfs(state, copy)}<div class="lip329-analysis-grid">${lip329RenderNeighbor(state, copy, locale)}${lip329RenderCache(state, copy)}</div>${lip329RenderDecisions(state, copy)}${lip329RenderCounters(state, copy, locale)}${lip329RenderWitness(state, copy)}${note}</article>`;
}
