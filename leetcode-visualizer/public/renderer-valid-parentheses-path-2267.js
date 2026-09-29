"use strict";

const VPP2267_SOURCE = Object.freeze([
  "from functools import cache",
  "class Solution:",
  "    def hasValidPath(self, grid):",
  "        rows, cols = len(grid), len(grid[0])",
  "        path_len = rows + cols - 1",
  "        if grid[0][0] != '(' or grid[-1][-1] != ')' or path_len % 2:",
  "            return False",
  "        @cache",
  "        def dfs(r, c, balance):",
  "            balance += 1 if grid[r][c] == '(' else -1",
  "            remaining = (rows - 1 - r) + (cols - 1 - c)",
  "            if balance < 0 or balance > remaining or (remaining - balance) % 2:",
  "                return False",
  "            if r == rows - 1 and c == cols - 1:",
  "                return balance == 0",
  "            if r + 1 < rows and dfs(r + 1, c, balance):",
  "                return True",
  "            if c + 1 < cols and dfs(r, c + 1, balance):",
  "                return True",
  "            return False",
  "        return dfs(0, 0, 0)",
]);

const VPP2267_EVENTS = Object.freeze({
  "import-cache": { en: "Import cache", vi: "Import cache" },
  "bind-class": { en: "Bind class", vi: "Liên kết lớp" },
  "bind-method": { en: "Bind method", vi: "Liên kết hàm" },
  "set-dimensions": { en: "Set dimensions", vi: "Đặt kích thước" },
  "set-path-length": { en: "Set path length", vi: "Tính độ dài đường" },
  "precheck-failed": { en: "Precheck failed", vi: "Kiểm tra đầu thất bại" },
  "precheck-passed": { en: "Precheck passed", vi: "Kiểm tra đầu thành công" },
  "return-precheck-false": { en: "Return precheck result", vi: "Trả kết quả kiểm tra đầu" },
  "memo-hit": { en: "Memo hit", vi: "Memo hit" },
  "memo-miss": { en: "Memo miss", vi: "Memo miss" },
  "dfs-entry": { en: "Enter DFS", vi: "Vào DFS" },
  "consume-parenthesis": { en: "Update balance", vi: "Cập nhật balance" },
  "count-remaining": { en: "Count remaining cells", vi: "Đếm ô còn lại" },
  prune: { en: "Prune state", vi: "Cắt trạng thái" },
  "feasible-state": { en: "Feasible state", vi: "Trạng thái khả thi" },
  "return-pruned-false": { en: "Memoize pruned state", vi: "Memo trạng thái bị cắt" },
  destination: { en: "Reach destination", vi: "Tới đích" },
  "not-destination": { en: "Continue search", vi: "Tiếp tục tìm" },
  "return-destination": { en: "Return destination result", vi: "Trả kết quả tại đích" },
  "try-branch": { en: "Try branch", vi: "Thử nhánh" },
  "skip-out-of-bounds": { en: "Skip branch", vi: "Bỏ qua nhánh" },
  "branch-result": { en: "Child returns", vi: "Nhánh con trả về" },
  "return-branch-true": { en: "Keep successful branch", vi: "Giữ nhánh thành công" },
  "return-exhausted-false": { en: "Exhaust state", vi: "Duyệt hết trạng thái" },
  "final-return": { en: "Return answer", vi: "Trả đáp án" },
});

const VPP2267_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Valid Parentheses String Path visualization",
    kicker: "LEETCODE 2267 · GRID DFS + MEMO",
    fallbackTitle: "Valid Parentheses String Path",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    source: "Current source action",
    event: "Event",
    phase: "Phase",
    condition: "Condition",
    noCondition: "No condition on this frame",
    trueValue: "TRUE",
    falseValue: "FALSE",
    pending: "pending",
    pass: "pass",
    fail: "fail",
    precheck: "O(1) feasibility gate",
    start: "starts with '('",
    end: "ends with ')'",
    even: "even path length",
    pathLength: "Path length",
    grid: "Grid and explored balance states",
    gridHelp: "Each cell shows its character and memoized outgoing balances.",
    current: "current",
    candidate: "candidate",
    activePath: "DFS stack",
    witness: "witness",
    memoRead: "memo read",
    memoWrite: "memo write",
    noMemo: "·",
    balance: "Balance feasibility",
    incoming: "Incoming",
    character: "Character",
    delta: "Delta",
    afterCell: "After cell",
    remaining: "Cells remaining",
    feasible: "This balance can still reach zero.",
    prune: "Prune decision",
    noPrune: "No active prune rule.",
    branch: "Down / right branch",
    direction: "Direction",
    from: "From",
    to: "To",
    inBounds: "In bounds",
    result: "Result",
    status: "Status",
    none: "—",
    down: "down",
    right: "right",
    stack: "Active DFS stack",
    emptyStack: "No active DFS frame.",
    depth: "depth",
    memo: "Memoized (row, col, incoming balance) states",
    emptyMemo: "No state has been memoized yet.",
    state: "State",
    consumed: "After balance",
    reason: "Reason",
    counters: "Search counters",
    answer: "Answer",
    witnessPath: "Balanced witness path",
    noWitness: "No valid witness path exists for this result.",
    prefixBalances: "Prefix balances",
    traceLimited: "The teaching trace reached its frame limit; computation continued to the exact answer.",
    note: "Why this step matters",
  }),
  vi: Object.freeze({
    region: "Trực quan đường đi tạo chuỗi ngoặc hợp lệ",
    kicker: "LEETCODE 2267 · GRID DFS + MEMO",
    fallbackTitle: "Đường đi tạo chuỗi ngoặc hợp lệ",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    source: "Lệnh nguồn hiện tại",
    event: "Sự kiện",
    phase: "Giai đoạn",
    condition: "Điều kiện",
    noCondition: "Frame này không có điều kiện",
    trueValue: "ĐÚNG",
    falseValue: "SAI",
    pending: "đang chờ",
    pass: "đạt",
    fail: "không đạt",
    precheck: "Cổng khả thi O(1)",
    start: "bắt đầu bằng '('",
    end: "kết thúc bằng ')'",
    even: "độ dài đường là số chẵn",
    pathLength: "Độ dài đường",
    grid: "Lưới và các balance đã duyệt",
    gridHelp: "Mỗi ô hiển thị ký tự và các balance đầu ra đã memo.",
    current: "hiện tại",
    candidate: "ứng viên",
    activePath: "DFS stack",
    witness: "witness",
    memoRead: "đọc memo",
    memoWrite: "ghi memo",
    noMemo: "·",
    balance: "Khả thi của balance",
    incoming: "Đầu vào",
    character: "Ký tự",
    delta: "Thay đổi",
    afterCell: "Sau ô",
    remaining: "Ô còn lại",
    feasible: "Balance này vẫn có thể về 0.",
    prune: "Quyết định cắt nhánh",
    noPrune: "Không có luật cắt nhánh đang hoạt động.",
    branch: "Nhánh xuống / phải",
    direction: "Hướng",
    from: "Từ",
    to: "Đến",
    inBounds: "Trong lưới",
    result: "Kết quả",
    status: "Trạng thái",
    none: "—",
    down: "xuống",
    right: "phải",
    stack: "DFS stack đang hoạt động",
    emptyStack: "Không có frame DFS đang hoạt động.",
    depth: "độ sâu",
    memo: "Các state (hàng, cột, balance đầu vào) đã memo",
    emptyMemo: "Chưa có state nào trong memo.",
    state: "State",
    consumed: "Balance sau ô",
    reason: "Lý do",
    counters: "Bộ đếm tìm kiếm",
    answer: "Đáp án",
    witnessPath: "Đường witness cân bằng",
    noWitness: "Không có đường witness hợp lệ cho kết quả này.",
    prefixBalances: "Balance từng tiền tố",
    traceLimited: "Trace giảng dạy đã đạt giới hạn frame; thuật toán vẫn tính tiếp để có đáp án chính xác.",
    note: "Ý nghĩa của bước này",
  }),
});

const VPP2267_COUNTER_LABELS = Object.freeze({
  dfsCalls: { en: "DFS calls", vi: "Lần gọi DFS" },
  memoHits: { en: "Memo hits", vi: "Memo hit" },
  memoMisses: { en: "Memo misses", vi: "Memo miss" },
  statesComputed: { en: "States solved", vi: "State đã tính" },
  prunes: { en: "Pruned states", vi: "State bị cắt" },
  branchesTried: { en: "Branches tried", vi: "Nhánh đã thử" },
  successfulBranches: { en: "Winning branches", vi: "Nhánh thành công" },
  maxDepth: { en: "Max depth", vi: "Độ sâu lớn nhất" },
});

const VPP2267_PRUNE_LABELS = Object.freeze({
  none: {
    en: "No rule rejects this state.",
    vi: "Không có luật nào loại trạng thái này.",
  },
  negative: {
    en: "Balance is negative: a prefix closes more parentheses than it opens.",
    vi: "Balance âm: một tiền tố đóng nhiều ngoặc hơn số ngoặc đã mở.",
  },
  capacity: {
    en: "Balance exceeds the remaining cells, so there are not enough ')' cells to close it.",
    vi: "Balance lớn hơn số ô còn lại, nên không đủ dấu ')' để đóng hết.",
  },
  parity: {
    en: "Balance and remaining cells have incompatible parity.",
    vi: "Balance và số ô còn lại sai parity.",
  },
  "invalid-start": {
    en: "The first cell must be '('.",
    vi: "Ô đầu tiên phải là '('.",
  },
  "invalid-end": {
    en: "The last cell must be ')'.",
    vi: "Ô cuối cùng phải là ')'.",
  },
  "odd-length": {
    en: "A balanced parenthesis string cannot have odd length.",
    vi: "Chuỗi ngoặc cân bằng không thể có độ dài lẻ.",
  },
});

function vpp2267Escape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function vpp2267Locale() {
  return typeof lang === "string" && lang === "vi" ? "vi" : "en";
}

function vpp2267Localized(value, locale, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const selected = value[locale] ?? value.en ?? value.vi;
    return selected === undefined || selected === null ? fallback : String(selected);
  }
  return value === undefined || value === null ? fallback : String(value);
}

function vpp2267Integer(value, fallback = 0, maximum = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.max(0, Math.min(maximum, parsed)) : fallback;
}

function vpp2267NullableInteger(value, minimum = -1000, maximum = 1000) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : null;
}

function vpp2267Boolean(value) {
  return typeof value === "boolean" ? value : null;
}

function vpp2267Coordinate(value, rows, columns, allowOutside = false) {
  if (!value || typeof value !== "object") return null;
  const row = Number(value.row);
  const column = Number(value.column);
  if (!Number.isInteger(row) || !Number.isInteger(column)) return null;
  if (!allowOutside && (row < 0 || column < 0 || row >= rows || column >= columns)) return null;
  if (allowOutside && (row < -1 || column < -1 || row > rows || column > columns)) return null;
  return { row, column, char: value.char === "(" || value.char === ")" ? value.char : null };
}

function vpp2267Normalize(step) {
  const locale = vpp2267Locale();
  const raw = step && step.validParenthesesPath2267View && typeof step.validParenthesesPath2267View === "object"
    ? step.validParenthesesPath2267View
    : {};
  const rawGrid = raw.grid && typeof raw.grid === "object" ? raw.grid : {};
  const values = Array.isArray(rawGrid.values)
    ? rawGrid.values.slice(0, 7).map((row) => Array.isArray(row)
      ? row.slice(0, 7).map((cell) => cell === ")" ? ")" : "(")
      : [])
    : [];
  const rows = values.length;
  const columns = rows ? Math.min(...values.map((row) => row.length)) : 0;
  const matrix = values.map((row) => row.slice(0, columns));
  const rawState = raw.state && typeof raw.state === "object" ? raw.state : {};
  const rawMemo = raw.memo && typeof raw.memo === "object" ? raw.memo : {};
  const rawBranch = raw.branch && typeof raw.branch === "object" ? raw.branch : {};
  const rawWitness = raw.witness && typeof raw.witness === "object" ? raw.witness : {};
  const rawPrecheck = raw.precheck && typeof raw.precheck === "object" ? raw.precheck : {};
  const rawCounters = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const rawTrace = raw.trace && typeof raw.trace === "object" ? raw.trace : {};
  const sourceLine = Math.max(1, Math.min(VPP2267_SOURCE.length, vpp2267Integer(raw.source && raw.source.line, 1, VPP2267_SOURCE.length)));
  const current = vpp2267Coordinate(rawState.coordinate, rows, columns);

  const stack = Array.isArray(raw.stack) ? raw.stack.slice(0, 32).map((frame, index) => ({
    depth: vpp2267Integer(frame && frame.depth, index, 32),
    key: String((frame && frame.key) || "—"),
    row: vpp2267Integer(frame && frame.row, 0, Math.max(0, rows - 1)),
    column: vpp2267Integer(frame && frame.column, 0, Math.max(0, columns - 1)),
    char: frame && (frame.char === "(" || frame.char === ")") ? frame.char : null,
    balance: vpp2267NullableInteger(frame && frame.balance),
    remaining: vpp2267NullableInteger(frame && frame.remaining, 0),
    status: String((frame && frame.status) || "idle"),
  })) : [];

  const memoEntries = Array.isArray(rawMemo.entries) ? rawMemo.entries.slice(-80).map((entry) => ({
    key: String((entry && entry.key) || "—"),
    row: vpp2267Integer(entry && entry.row, 0, Math.max(0, rows - 1)),
    column: vpp2267Integer(entry && entry.column, 0, Math.max(0, columns - 1)),
    incomingBalance: vpp2267NullableInteger(entry && entry.incomingBalance, 0),
    balance: vpp2267NullableInteger(entry && entry.balance),
    result: Boolean(entry && entry.result),
    reason: String((entry && entry.reason) || "—"),
  })) : [];

  const witnessCells = Array.isArray(rawWitness.cells) ? rawWitness.cells.slice(0, rows + columns).map((cell, index) => ({
    step: vpp2267Integer(cell && cell.step, index + 1, rows + columns + 1),
    row: vpp2267Integer(cell && cell.row, 0, Math.max(0, rows - 1)),
    column: vpp2267Integer(cell && cell.column, 0, Math.max(0, columns - 1)),
    char: cell && cell.char === ")" ? ")" : "(",
    balance: vpp2267NullableInteger(cell && cell.balance),
  })) : [];

  const counters = {};
  Object.keys(VPP2267_COUNTER_LABELS).forEach((key) => {
    counters[key] = vpp2267Integer(rawCounters[key], 0, 1000000);
  });

  const event = String(raw.event || "import-cache");
  return {
    locale,
    title: vpp2267Localized(step && step.title, locale, VPP2267_TEXT[locale].fallbackTitle),
    note: vpp2267Localized(step && step.note, locale, ""),
    source: { line: sourceLine, text: VPP2267_SOURCE[sourceLine - 1] },
    event,
    eventLabel: VPP2267_EVENTS[event]
      ? VPP2267_EVENTS[event][locale]
      : event,
    phase: String(raw.phase || "setup"),
    timing: raw.timing === "before" ? "before" : "after",
    condition: {
      expression: raw.condition && raw.condition.expression ? String(raw.condition.expression) : null,
      result: vpp2267Boolean(raw.condition && raw.condition.result),
    },
    rows,
    columns,
    matrix,
    pathLength: vpp2267Integer(raw.setup && raw.setup.pathLength, Math.max(0, rows + columns - 1), 20),
    precheck: {
      startValid: vpp2267Boolean(rawPrecheck.startValid),
      endValid: vpp2267Boolean(rawPrecheck.endValid),
      evenPathLength: vpp2267Boolean(rawPrecheck.evenPathLength),
      status: ["pending", "passed", "failed"].includes(rawPrecheck.status) ? rawPrecheck.status : "pending",
      reason: String(rawPrecheck.reason || "none"),
    },
    state: {
      key: rawState.key ? String(rawState.key) : null,
      coordinate: current,
      char: rawState.char === "(" || rawState.char === ")" ? rawState.char : null,
      delta: vpp2267NullableInteger(rawState.delta, -1, 1),
      incomingBalance: vpp2267NullableInteger(rawState.incomingBalance, 0),
      balance: vpp2267NullableInteger(rawState.balance),
      remaining: vpp2267NullableInteger(rawState.remaining, 0),
      result: vpp2267Boolean(rawState.result),
      status: String(rawState.status || "idle"),
    },
    stack,
    memo: {
      size: vpp2267Integer(rawMemo.size, memoEntries.length, 1000000),
      entries: memoEntries,
      read: {
        key: rawMemo.read && rawMemo.read.key ? String(rawMemo.read.key) : null,
        coordinate: vpp2267Coordinate(rawMemo.read && rawMemo.read.coordinate, rows, columns),
        status: ["idle", "hit", "miss"].includes(rawMemo.read && rawMemo.read.status)
          ? rawMemo.read.status
          : "idle",
        result: vpp2267Boolean(rawMemo.read && rawMemo.read.result),
      },
      write: {
        key: rawMemo.write && rawMemo.write.key ? String(rawMemo.write.key) : null,
        coordinate: vpp2267Coordinate(rawMemo.write && rawMemo.write.coordinate, rows, columns),
        status: ["idle", "write"].includes(rawMemo.write && rawMemo.write.status)
          ? rawMemo.write.status
          : "idle",
        result: vpp2267Boolean(rawMemo.write && rawMemo.write.result),
      },
    },
    branch: {
      direction: rawBranch.direction === "down" || rawBranch.direction === "right" ? rawBranch.direction : null,
      from: vpp2267Coordinate(rawBranch.from, rows, columns),
      to: vpp2267Coordinate(rawBranch.to, rows, columns, true),
      inBounds: vpp2267Boolean(rawBranch.inBounds),
      status: ["idle", "checking", "out-of-bounds", "accepted", "rejected"].includes(rawBranch.status)
        ? rawBranch.status
        : "idle",
      result: vpp2267Boolean(rawBranch.result),
    },
    prune: {
      kind: Object.prototype.hasOwnProperty.call(VPP2267_PRUNE_LABELS, raw.prune && raw.prune.kind)
        ? raw.prune.kind
        : "none",
      active: Boolean(raw.prune && raw.prune.active),
    },
    witness: {
      complete: Boolean(rawWitness.complete),
      cells: witnessCells,
      string: witnessCells.map((cell) => cell.char).join(""),
      prefixBalances: witnessCells.map((cell) => cell.balance),
    },
    counters,
    trace: {
      emitted: vpp2267Integer(rawTrace.emitted, 0, 1000000),
      dropped: vpp2267Integer(rawTrace.dropped, 0, 1000000),
      truncated: Boolean(rawTrace.truncated),
    },
    answer: vpp2267Boolean(raw.answer),
    final: raw.final === true || Boolean(step && step.final),
  };
}

function vpp2267BoolText(value, copy) {
  if (value === null) return copy.pending;
  return value ? copy.trueValue : copy.falseValue;
}

function vpp2267CoordinateText(coordinate, fallback) {
  return coordinate ? `(${coordinate.row}, ${coordinate.column})` : fallback;
}

function vpp2267RenderSource(state, copy) {
  const condition = state.condition.result === null
    ? copy.noCondition
    : `${state.condition.expression || copy.condition} → ${vpp2267BoolText(state.condition.result, copy)}`;
  const conditionClass = state.condition.result === null ? "idle" : state.condition.result ? "true" : "false";
  return `<section class="vpp2267-card vpp2267-source" aria-labelledby="vpp2267-source-title"><div><small id="vpp2267-source-title">${vpp2267Escape(copy.source)}</small><code>${vpp2267Escape(state.source.text)}</code></div><dl><div><dt>${vpp2267Escape(copy.phase)}</dt><dd>${vpp2267Escape(state.phase)}</dd></div><div><dt>${vpp2267Escape(copy.event)}</dt><dd>${vpp2267Escape(state.eventLabel)}</dd></div><div><dt>${vpp2267Escape(copy.condition)}</dt><dd class="vpp2267-condition-${conditionClass}">${vpp2267Escape(condition)}</dd></div></dl></section>`;
}

function vpp2267RenderPrecheck(state, copy) {
  const checks = [
    [copy.start, state.precheck.startValid],
    [copy.end, state.precheck.endValid],
    [copy.even, state.precheck.evenPathLength],
  ].map(([label, value]) => {
    const status = value === null ? "pending" : value ? "pass" : "fail";
    return `<li class="vpp2267-check-${status}"><span aria-hidden="true"></span><strong>${vpp2267Escape(label)}</strong><small>${vpp2267Escape(copy[status])}</small></li>`;
  }).join("");
  return `<section class="vpp2267-card vpp2267-precheck" aria-labelledby="vpp2267-precheck-title"><header><h3 id="vpp2267-precheck-title">${vpp2267Escape(copy.precheck)}</h3><code>${vpp2267Escape(copy.pathLength)} = ${state.pathLength}</code></header><ul role="list">${checks}</ul></section>`;
}

function vpp2267SameCoordinate(coordinate, row, column) {
  return Boolean(coordinate && coordinate.row === row && coordinate.column === column);
}

function vpp2267RenderGrid(state, copy) {
  if (!state.rows || !state.columns) {
    return `<section class="vpp2267-card"><h3>${vpp2267Escape(copy.grid)}</h3><p>${vpp2267Escape(copy.pending)}</p></section>`;
  }
  const stackKeys = new Set(state.stack.map((frame) => `${frame.row},${frame.column}`));
  const witnessKeys = new Set(state.witness.cells.map((cell) => `${cell.row},${cell.column}`));
  const headers = Array.from({ length: state.columns }, (_, column) => `<th scope="col">c${column}</th>`).join("");
  const rows = state.matrix.map((row, rowIndex) => {
    const cells = row.map((char, columnIndex) => {
      const key = `${rowIndex},${columnIndex}`;
      const memoStates = state.memo.entries.filter((entry) => entry.row === rowIndex && entry.column === columnIndex);
      const roles = [];
      const classes = [];
      if (vpp2267SameCoordinate(state.state.coordinate, rowIndex, columnIndex)) {
        roles.push(copy.current);
        classes.push("vpp2267-is-current");
      }
      if (vpp2267SameCoordinate(state.branch.to, rowIndex, columnIndex)) {
        roles.push(copy.candidate);
        classes.push(`vpp2267-is-candidate-${state.branch.status}`);
      }
      if (stackKeys.has(key)) {
        roles.push(copy.activePath);
        classes.push("vpp2267-is-stack");
      }
      if (vpp2267SameCoordinate(state.memo.read.coordinate, rowIndex, columnIndex)) {
        roles.push(copy.memoRead);
        classes.push(`vpp2267-is-read-${state.memo.read.status}`);
      }
      if (vpp2267SameCoordinate(state.memo.write.coordinate, rowIndex, columnIndex)) {
        roles.push(copy.memoWrite);
        classes.push("vpp2267-is-write");
      }
      if (witnessKeys.has(key)) {
        roles.push(copy.witness);
        classes.push("vpp2267-is-witness");
      }
      if (memoStates.length) classes.push(memoStates.some((entry) => entry.result) ? "vpp2267-has-true" : "vpp2267-has-false");
      const balances = memoStates.length
        ? memoStates.map((entry) => `${entry.balance}:${entry.result ? "T" : "F"}`).join(" · ")
        : copy.noMemo;
      const aria = `[${rowIndex}, ${columnIndex}] ${char}; ${roles.join(", ") || copy.none}; memo ${balances}`;
      return `<td><div class="vpp2267-cell ${classes.join(" ")}" aria-label="${vpp2267Escape(aria)}"><small>r${rowIndex} c${columnIndex}</small><strong>${vpp2267Escape(char)}</strong><code>${vpp2267Escape(balances)}</code></div></td>`;
    }).join("");
    return `<tr><th scope="row">r${rowIndex}</th>${cells}</tr>`;
  }).join("");
  const legend = [
    ["current", copy.current], ["candidate", copy.candidate], ["stack", copy.activePath],
    ["witness", copy.witness], ["memo", copy.memoWrite],
  ].map(([kind, label]) => `<li class="vpp2267-legend-${kind}"><span aria-hidden="true"></span>${vpp2267Escape(label)}</li>`).join("");
  return `<section class="vpp2267-card vpp2267-grid-card" aria-labelledby="vpp2267-grid-title"><header><div><h3 id="vpp2267-grid-title">${vpp2267Escape(copy.grid)}</h3><p>${vpp2267Escape(copy.gridHelp)}</p></div><ul class="vpp2267-legend" role="list">${legend}</ul></header><div class="vpp2267-grid-scroll" role="region" tabindex="0" aria-label="${vpp2267Escape(copy.grid)}"><table><caption>${vpp2267Escape(copy.gridHelp)}</caption><thead><tr><th aria-hidden="true"></th>${headers}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function vpp2267RenderBalance(state, copy, locale) {
  const facts = [
    [copy.incoming, state.state.incomingBalance],
    [copy.character, state.state.char],
    [copy.delta, state.state.delta === null ? null : state.state.delta > 0 ? "+1" : "−1"],
    [copy.afterCell, state.state.balance],
    [copy.remaining, state.state.remaining],
  ].map(([label, value]) => `<div><dt>${vpp2267Escape(label)}</dt><dd>${vpp2267Escape(value === null ? copy.none : value)}</dd></div>`).join("");
  const balance = state.state.balance === null ? 0 : Math.max(0, state.state.balance);
  const remaining = state.state.remaining === null ? 0 : Math.max(0, state.state.remaining);
  const meterWidth = Math.round((balance / Math.max(1, balance + remaining)) * 100);
  const pruneText = (VPP2267_PRUNE_LABELS[state.prune.kind] || VPP2267_PRUNE_LABELS.none)[locale];
  return `<section class="vpp2267-card vpp2267-balance-card" aria-labelledby="vpp2267-balance-title"><header><h3 id="vpp2267-balance-title">${vpp2267Escape(copy.balance)}</h3><code>${vpp2267Escape(state.state.key || copy.none)}</code></header><dl>${facts}</dl><div class="vpp2267-balance-meter" role="meter" aria-valuemin="0" aria-valuemax="${Math.max(1, balance + remaining)}" aria-valuenow="${balance}"><span style="width:${meterWidth}%"></span></div><p>${vpp2267Escape(copy.feasible)}</p><aside class="vpp2267-prune vpp2267-prune-${state.prune.active ? "active" : "idle"}"><strong>${vpp2267Escape(copy.prune)}</strong><span>${vpp2267Escape(state.prune.active ? pruneText : copy.noPrune)}</span></aside></section>`;
}

function vpp2267RenderBranch(state, copy) {
  const direction = state.branch.direction ? copy[state.branch.direction] : copy.none;
  const facts = [
    [copy.direction, direction],
    [copy.from, vpp2267CoordinateText(state.branch.from, copy.none)],
    [copy.to, vpp2267CoordinateText(state.branch.to, copy.none)],
    [copy.inBounds, vpp2267BoolText(state.branch.inBounds, copy)],
    [copy.result, vpp2267BoolText(state.branch.result, copy)],
    [copy.status, state.branch.status],
  ].map(([label, value]) => `<div><dt>${vpp2267Escape(label)}</dt><dd>${vpp2267Escape(value)}</dd></div>`).join("");
  return `<section class="vpp2267-card vpp2267-branch vpp2267-branch-${state.branch.status}" aria-labelledby="vpp2267-branch-title" aria-live="polite"><header><h3 id="vpp2267-branch-title">${vpp2267Escape(copy.branch)}</h3><span>${vpp2267Escape(direction)}</span></header><dl>${facts}</dl></section>`;
}

function vpp2267RenderStack(state, copy) {
  const items = state.stack.length
    ? `<ol role="list">${state.stack.map((frame, index) => `<li${index === state.stack.length - 1 ? ' aria-current="step"' : ""}><small>${vpp2267Escape(copy.depth)} ${frame.depth}</small><code>${vpp2267Escape(frame.key)}</code><strong>${vpp2267Escape(frame.char || copy.none)} → ${vpp2267Escape(frame.balance === null ? copy.none : frame.balance)}</strong><span>${vpp2267Escape(frame.status)}</span></li>`).join("")}</ol>`
    : `<div class="vpp2267-empty">${vpp2267Escape(copy.emptyStack)}</div>`;
  return `<section class="vpp2267-card vpp2267-stack" aria-labelledby="vpp2267-stack-title"><header><h3 id="vpp2267-stack-title">${vpp2267Escape(copy.stack)}</h3><span>${state.stack.length}</span></header><div class="vpp2267-stack-scroll">${items}</div></section>`;
}

function vpp2267RenderMemo(state, copy) {
  const entries = state.memo.entries.slice(-16).reverse();
  const body = entries.length
    ? entries.map((entry) => `<tr class="vpp2267-memo-${entry.result ? "true" : "false"}"><th scope="row"><code>${vpp2267Escape(entry.key)}</code></th><td>${vpp2267Escape(entry.balance === null ? copy.none : entry.balance)}</td><td><strong>${vpp2267Escape(entry.result ? copy.trueValue : copy.falseValue)}</strong></td><td>${vpp2267Escape(entry.reason)}</td></tr>`).join("")
    : `<tr><td colspan="4" class="vpp2267-empty">${vpp2267Escape(copy.emptyMemo)}</td></tr>`;
  return `<section class="vpp2267-card vpp2267-memo" aria-labelledby="vpp2267-memo-title"><header><h3 id="vpp2267-memo-title">${vpp2267Escape(copy.memo)}</h3><span>${state.memo.size}</span></header><div class="vpp2267-memo-scroll" tabindex="0"><table><thead><tr><th>${vpp2267Escape(copy.state)}</th><th>${vpp2267Escape(copy.consumed)}</th><th>${vpp2267Escape(copy.result)}</th><th>${vpp2267Escape(copy.reason)}</th></tr></thead><tbody>${body}</tbody></table></div></section>`;
}

function vpp2267RenderCounters(state, copy, locale) {
  const items = Object.entries(VPP2267_COUNTER_LABELS).map(([key, labels]) => `<li><small>${vpp2267Escape(labels[locale])}</small><strong>${state.counters[key]}</strong></li>`).join("");
  return `<section class="vpp2267-card vpp2267-counters" aria-labelledby="vpp2267-counters-title"><header><h3 id="vpp2267-counters-title">${vpp2267Escape(copy.counters)}</h3></header><ul role="list">${items}</ul></section>`;
}

function vpp2267RenderWitness(state, copy) {
  const answerText = state.answer === null ? copy.pending : state.answer ? copy.trueValue : copy.falseValue;
  const path = state.witness.cells.length
    ? `<ol role="list">${state.witness.cells.map((cell) => `<li><small>#${cell.step} · (${cell.row}, ${cell.column})</small><strong>${vpp2267Escape(cell.char)}</strong><code>b=${vpp2267Escape(cell.balance === null ? copy.none : cell.balance)}</code></li>`).join("")}</ol>`
    : `<div class="vpp2267-empty">${vpp2267Escape(copy.noWitness)}</div>`;
  const balances = state.witness.prefixBalances.length
    ? state.witness.prefixBalances.map((value) => value === null ? copy.none : value).join(" → ")
    : copy.none;
  return `<section class="vpp2267-card vpp2267-witness vpp2267-answer-${state.answer === null ? "pending" : state.answer ? "true" : "false"}" aria-labelledby="vpp2267-witness-title" aria-live="polite"><header><div><small>${vpp2267Escape(copy.answer)}</small><h3 id="vpp2267-witness-title">${vpp2267Escape(answerText)}</h3></div><code>${vpp2267Escape(state.witness.string || copy.none)}</code></header><p>${vpp2267Escape(copy.witnessPath)}</p><div class="vpp2267-witness-scroll">${path}</div><footer><small>${vpp2267Escape(copy.prefixBalances)}</small><code>${vpp2267Escape(balances)}</code></footer></section>`;
}

function renderValidParenthesesPath2267View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;

  const state = vpp2267Normalize(step);
  const locale = state.locale;
  const copy = VPP2267_TEXT[locale];
  const timing = state.timing === "before" ? copy.before : copy.after;
  const summary = `${copy.region}. ${copy.line} ${state.source.line}. ${state.eventLabel}.`;
  const traceWarning = state.trace.truncated
    ? `<aside class="vpp2267-trace-warning"><strong>${vpp2267Escape(copy.traceLimited)}</strong><span>${state.trace.dropped}</span></aside>`
    : "";
  const note = state.note
    ? `<aside class="vpp2267-note"><strong>${vpp2267Escape(copy.note)}</strong><p>${vpp2267Escape(state.note)}</p></aside>`
    : "";

  host.innerHTML = `<article class="vpp2267-viz vpp2267-phase-${vpp2267Escape(state.phase)} ${state.final ? "vpp2267-is-final" : ""}" role="region" aria-label="${vpp2267Escape(summary)}"><header class="vpp2267-header"><div><span>${vpp2267Escape(copy.kicker)}</span><h2>${vpp2267Escape(state.title)}</h2></div><div class="vpp2267-line-state"><strong>${vpp2267Escape(copy.line)} ${state.source.line}</strong><span>${vpp2267Escape(timing)}</span><em>${vpp2267Escape(state.eventLabel)}</em></div></header>${traceWarning}${vpp2267RenderSource(state, copy)}${vpp2267RenderPrecheck(state, copy)}${vpp2267RenderGrid(state, copy)}<div class="vpp2267-analysis-grid">${vpp2267RenderBalance(state, copy, locale)}${vpp2267RenderBranch(state, copy)}</div><div class="vpp2267-runtime-grid">${vpp2267RenderStack(state, copy)}${vpp2267RenderMemo(state, copy)}</div>${vpp2267RenderCounters(state, copy, locale)}${vpp2267RenderWitness(state, copy)}${note}</article>`;
}
