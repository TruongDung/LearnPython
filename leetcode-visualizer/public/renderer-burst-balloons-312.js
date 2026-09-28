"use strict";

const BB312_SOURCE = Object.freeze([
  "class Solution:",
  "    def maxCoins(self, nums):",
  "        balloons = [1] + nums + [1]",
  "        n = len(balloons)",
  "        dp = [[0] * n for _ in range(n)]",
  "        choice = [[-1] * n for _ in range(n)]",
  "        for length in range(2, n):",
  "            for left in range(n - length):",
  "                right = left + length",
  "                for k in range(left + 1, right):",
  "                    boundary = balloons[left] * balloons[k] * balloons[right]",
  "                    left_coins = dp[left][k]",
  "                    right_coins = dp[k][right]",
  "                    candidate = boundary + left_coins + right_coins",
  "                    if choice[left][right] == -1 or candidate > dp[left][right]:",
  "                        dp[left][right] = candidate",
  "                        choice[left][right] = k",
  "        order = []",
  "        def rebuild(left, right):",
  "            k = choice[left][right]",
  "            if k == -1:",
  "                return",
  "            rebuild(left, k)",
  "            rebuild(k, right)",
  "            order.append(k)",
  "        rebuild(0, n - 1)",
  "        return dp[0][n - 1]",
]);

const BB312_LINE_EVENTS = Object.freeze([
  "bind-class",
  "bind-method",
  "pad-balloons",
  "set-size",
  "allocate-dp",
  "allocate-choice",
  "select-length",
  "select-left",
  "set-right",
  "select-last",
  "boundary-product",
  "read-left-dp",
  "read-right-dp",
  "candidate-total",
  "update-condition",
  "write-dp",
  "write-choice",
  "reconstruction-init",
  "bind-rebuild",
  "read-choice",
  "base-condition",
  "base-return",
  "call-left",
  "call-right",
  "append-last",
  "call-root",
  "final-return",
]);

const BB312_EVENTS = Object.freeze({
  "bind-class": { en: "Bind class", vi: "Liên kết lớp" },
  "bind-method": { en: "Bind method", vi: "Liên kết phương thức" },
  "pad-balloons": { en: "Pad sentinels", vi: "Đệm sentinel" },
  "set-size": { en: "Set padded size", vi: "Đặt kích thước đệm" },
  "allocate-dp": { en: "Allocate DP", vi: "Tạo DP" },
  "allocate-choice": { en: "Allocate choice", vi: "Tạo choice" },
  "select-length": { en: "Select length", vi: "Chọn độ dài" },
  "select-left": { en: "Select left", vi: "Chọn left" },
  "set-right": { en: "Set right", vi: "Đặt right" },
  "select-last": { en: "Select last balloon", vi: "Chọn bóng nổ cuối" },
  "boundary-product": { en: "Multiply boundaries", vi: "Nhân ba biên" },
  "read-left-dp": { en: "Read left DP", vi: "Đọc DP trái" },
  "read-right-dp": { en: "Read right DP", vi: "Đọc DP phải" },
  "candidate-total": { en: "Total candidate", vi: "Tính tổng ứng viên" },
  "update-condition": { en: "Test update", vi: "Kiểm tra cập nhật" },
  "write-dp": { en: "Write DP", vi: "Ghi DP" },
  "write-choice": { en: "Write choice", vi: "Ghi choice" },
  "reconstruction-init": { en: "Initialize reconstruction", vi: "Khởi tạo tái dựng" },
  "bind-rebuild": { en: "Bind rebuild helper", vi: "Liên kết hàm rebuild" },
  "read-choice": { en: "Read choice", vi: "Đọc choice" },
  "base-condition": { en: "Test base case", vi: "Kiểm tra base" },
  "base-return": { en: "Return from base", vi: "Trả về từ base" },
  "call-left": { en: "Rebuild left", vi: "Tái dựng trái" },
  "call-right": { en: "Rebuild right", vi: "Tái dựng phải" },
  "append-last": { en: "Append last balloon", vi: "Thêm bóng nổ cuối" },
  "call-root": { en: "Rebuild full interval", vi: "Tái dựng toàn khoảng" },
  "final-return": { en: "Return maximum", vi: "Trả về cực đại" },
});

const BB312_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Burst Balloons exact interval-DP visualization",
    kicker: "LEETCODE 312 · INTERVAL DP + WITNESS",
    fallbackTitle: "Burst Balloons",
    line: "LINE",
    before: "before execution",
    after: "after execution",
    eventRail: "Exact 27-line source and event rail",
    sourceAction: "Current source action",
    phase: "Phase",
    event: "Event",
    condition: "Condition",
    noCondition: "No condition on this frame.",
    trueValue: "TRUE",
    falseValue: "FALSE",
    paddedStrip: "Padded balloon strip",
    paddedIndex: "padded",
    originalIndex: "original",
    sentinel: "sentinel",
    leftBoundary: "LEFT",
    lastChoice: "LAST k",
    rightBoundary: "RIGHT",
    interior: "inside interval",
    outside: "outside interval",
    intervalFacts: "Open-interval cursor",
    length: "length",
    left: "left",
    right: "right",
    k: "last k",
    none: "not selected",
    recurrence: "Candidate recurrence",
    boundary: "boundary product",
    leftDependency: "left dependency",
    rightDependency: "right dependency",
    proposed: "proposed total",
    incumbent: "incumbent",
    pending: "PENDING",
    read: "READ",
    update: "UPDATE",
    keep: "KEEP",
    idle: "IDLE",
    firstCandidate: "first candidate",
    strictlyGreater: "strictly greater",
    tie: "tie — keep earliest",
    lower: "lower — keep incumbent",
    dpTable: "Maximum-coins DP",
    choiceTable: "Last-balloon choice",
    tableHelp: "Only the useful upper triangle is shown.",
    status: "Cell status",
    base: "base zero",
    uncomputed: "uncomputed",
    computedZero: "computed zero",
    computed: "computed",
    reconstruction: "Recursive reconstruction",
    stack: "Active rebuild stack",
    emptyStack: "No recursive frame is active.",
    activeChoice: "Active stored choice",
    noActiveChoice: "No stored choice is active.",
    chronological: "Chronological burst order",
    noBursts: "No balloon has been appended yet.",
    step: "step",
    finalResult: "Maximum coins",
    witness: "Deterministic witness",
    paddedOrder: "padded indices",
    originalOrder: "original indices",
    valueOrder: "values",
    awaiting: "Awaiting final return",
    note: "Why this frame matters",
  }),
  vi: Object.freeze({
    region: "Trực quan Interval DP chính xác cho Làm nổ bóng bay",
    kicker: "LEETCODE 312 · INTERVAL DP + WITNESS",
    fallbackTitle: "Làm nổ bóng bay",
    line: "DÒNG",
    before: "trước khi chạy",
    after: "sau khi chạy",
    eventRail: "Thanh mã nguồn và sự kiện chính xác 27 dòng",
    sourceAction: "Hành động mã nguồn hiện tại",
    phase: "Giai đoạn",
    event: "Sự kiện",
    condition: "Điều kiện",
    noCondition: "Frame này không có điều kiện.",
    trueValue: "ĐÚNG",
    falseValue: "SAI",
    paddedStrip: "Dải bóng đã đệm",
    paddedIndex: "đệm",
    originalIndex: "gốc",
    sentinel: "sentinel",
    leftBoundary: "TRÁI",
    lastChoice: "CUỐI k",
    rightBoundary: "PHẢI",
    interior: "trong khoảng",
    outside: "ngoài khoảng",
    intervalFacts: "Con trỏ khoảng mở",
    length: "độ dài",
    left: "trái",
    right: "phải",
    k: "k nổ cuối",
    none: "chưa chọn",
    recurrence: "Công thức ứng viên",
    boundary: "tích ba biên",
    leftDependency: "phụ thuộc trái",
    rightDependency: "phụ thuộc phải",
    proposed: "tổng đề xuất",
    incumbent: "nghiệm hiện tại",
    pending: "ĐANG CHỜ",
    read: "ĐÃ ĐỌC",
    update: "CẬP NHẬT",
    keep: "GIỮ",
    idle: "RỖNG",
    firstCandidate: "ứng viên đầu tiên",
    strictlyGreater: "lớn hơn nghiêm ngặt",
    tie: "hòa — giữ lựa chọn sớm",
    lower: "thấp hơn — giữ nghiệm",
    dpTable: "DP coin tối đa",
    choiceTable: "Choice bóng nổ cuối",
    tableHelp: "Chỉ hiển thị tam giác trên hữu ích.",
    status: "Trạng thái ô",
    base: "base 0",
    uncomputed: "chưa tính",
    computedZero: "đã tính bằng 0",
    computed: "đã tính",
    reconstruction: "Tái dựng đệ quy",
    stack: "Stack rebuild đang hoạt động",
    emptyStack: "Không có frame đệ quy đang hoạt động.",
    activeChoice: "Lựa chọn đã lưu đang dùng",
    noActiveChoice: "Không có lựa chọn đang hoạt động.",
    chronological: "Thứ tự nổ theo thời gian",
    noBursts: "Chưa có bóng nào được thêm.",
    step: "bước",
    finalResult: "Coin tối đa",
    witness: "Witness xác định",
    paddedOrder: "chỉ số đệm",
    originalOrder: "chỉ số gốc",
    valueOrder: "giá trị",
    awaiting: "Đang chờ dòng return cuối",
    note: "Ý nghĩa của frame này",
  }),
});

function bb312Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bb312Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function bb312CleanText(value, fallback = "", maximum = 500) {
  if (typeof value !== "string") return fallback;
  const text = value.slice(0, maximum).trim();
  return /^(?:undefined|null|nan|[+-]?infinity)$/i.test(text) ? fallback : text;
}

function bb312Localized(value, locale, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return bb312CleanText(value[locale], bb312CleanText(value.en, bb312CleanText(value.vi, fallback)));
  }
  return bb312CleanText(value, fallback);
}

function bb312Integer(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function bb312Normalize(step) {
  const raw = step && step.burstBalloons312View && typeof step.burstBalloons312View === "object"
    ? step.burstBalloons312View
    : {};
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = bb312Integer(sourceRaw.line, 1, 27) ?? bb312Integer(fallbackLine, 1, 27) ?? 1;
  const fallbackEvent = BB312_LINE_EVENTS[sourceLine - 1];
  const event = Object.prototype.hasOwnProperty.call(BB312_EVENTS, raw.event) ? raw.event : fallbackEvent;
  const phase = ["setup", "interval-dp", "reconstruction", "done"].includes(raw.phase) ? raw.phase : "setup";
  const timing = raw.timing === "before" ? "before" : "after";

  const inputRaw = raw.input && typeof raw.input === "object" ? raw.input : {};
  const inputValues = Array.isArray(inputRaw.values)
    ? inputRaw.values.slice(0, 8).map((value) => bb312Integer(value, 0, 100)).filter((value) => value !== null)
    : [];
  const paddedRaw = raw.padded && typeof raw.padded === "object" ? raw.padded : {};
  const paddedAllocated = paddedRaw.allocated === true;
  let paddedValues = [];
  if (paddedAllocated && Array.isArray(paddedRaw.values)) {
    const normalized = paddedRaw.values.slice(0, 10).map((value) => bb312Integer(value, 0, 100));
    if (normalized.length >= 3 && normalized.every((value) => value !== null) && normalized[0] === 1 && normalized[normalized.length - 1] === 1) {
      paddedValues = normalized;
    }
  }
  if (paddedAllocated && !paddedValues.length && inputValues.length) paddedValues = [1, ...inputValues, 1];
  const inferredSize = paddedValues.length || (inputValues.length ? inputValues.length + 2 : 0);
  const declaredSize = bb312Integer(raw.size, 3, 10);
  const tableSize = declaredSize ?? inferredSize;
  const maxIndex = Math.max(0, tableSize - 1);

  const cursorRaw = raw.cursor && typeof raw.cursor === "object" ? raw.cursor : {};
  const cursor = {
    length: bb312Integer(cursorRaw.length, 2, Math.max(2, maxIndex)),
    left: bb312Integer(cursorRaw.left, 0, maxIndex),
    right: bb312Integer(cursorRaw.right, 0, maxIndex),
    k: bb312Integer(cursorRaw.k, 0, maxIndex),
  };
  if (cursor.left !== null && cursor.right !== null && cursor.left >= cursor.right) cursor.right = null;
  if (cursor.k !== null && (cursor.left === null || cursor.right === null || cursor.k <= cursor.left || cursor.k >= cursor.right)) cursor.k = null;

  const refAt = (index) => {
    if (index === null || !paddedValues.length || index < 0 || index >= paddedValues.length) return null;
    const isSentinel = index === 0 || index === paddedValues.length - 1;
    return {
      paddedIndex: index,
      originalIndex: isSentinel ? null : index - 1,
      value: paddedValues[index],
      sentinel: index === 0 ? "left" : index === paddedValues.length - 1 ? "right" : null,
    };
  };
  const cells = paddedValues.map((value, paddedIndex) => {
    const roles = [];
    if (paddedIndex === 0) roles.push("left-sentinel");
    if (paddedIndex === paddedValues.length - 1) roles.push("right-sentinel");
    if (paddedIndex === cursor.left) roles.push("left-boundary");
    if (paddedIndex === cursor.k) roles.push("last-choice");
    if (paddedIndex === cursor.right) roles.push("right-boundary");
    if (cursor.left !== null && cursor.right !== null && paddedIndex > cursor.left && paddedIndex < cursor.right) roles.push("interval-interior");
    if (!roles.length) roles.push("outside");
    return {
      paddedIndex,
      originalIndex: paddedIndex === 0 || paddedIndex === paddedValues.length - 1 ? null : paddedIndex - 1,
      value,
      sentinel: paddedIndex === 0 ? "left" : paddedIndex === paddedValues.length - 1 ? "right" : null,
      roles,
    };
  });

  const normalizeRead = (value, side) => {
    const read = value && typeof value === "object" ? value : {};
    const row = bb312Integer(read.row, 0, maxIndex);
    const column = bb312Integer(read.column, 0, maxIndex);
    const status = ["idle", "pending", "read"].includes(read.status) ? read.status : "idle";
    const cellStatus = ["unallocated", "not-applicable", "base", "uncomputed", "computed-zero", "computed"].includes(read.cellStatus)
      ? read.cellStatus
      : null;
    return {
      side,
      row,
      column,
      value: bb312Integer(read.value, 0, 10000000),
      status,
      cellStatus,
    };
  };
  const readsRaw = raw.dependencyReads && typeof raw.dependencyReads === "object" ? raw.dependencyReads : {};
  const dependencyReads = {
    left: normalizeRead(readsRaw.left, "left"),
    right: normalizeRead(readsRaw.right, "right"),
  };

  const multiplierRaw = raw.multipliers && typeof raw.multipliers === "object" ? raw.multipliers : {};
  const multiplierValuesRaw = multiplierRaw.values && typeof multiplierRaw.values === "object" ? multiplierRaw.values : {};
  const multipliers = {
    left: cursor.left === null ? null : refAt(cursor.left),
    k: cursor.k === null ? null : refAt(cursor.k),
    right: cursor.right === null ? null : refAt(cursor.right),
    values: {
      left: cursor.left === null ? null : bb312Integer(multiplierValuesRaw.left, 0, 100),
      k: cursor.k === null ? null : bb312Integer(multiplierValuesRaw.k, 0, 100),
      right: cursor.right === null ? null : bb312Integer(multiplierValuesRaw.right, 0, 100),
    },
    product: cursor.k === null ? null : bb312Integer(multiplierRaw.product, 0, 1000000),
  };

  const candidateRaw = raw.candidate && typeof raw.candidate === "object" ? raw.candidate : {};
  const candidate = {
    boundary: bb312Integer(candidateRaw.boundary, 0, 1000000),
    leftCoins: bb312Integer(candidateRaw.leftCoins, 0, 10000000),
    rightCoins: bb312Integer(candidateRaw.rightCoins, 0, 10000000),
    total: bb312Integer(candidateRaw.total, 0, 10000000),
    proposed: bb312Integer(candidateRaw.proposed, 0, 10000000),
    incumbent: bb312Integer(candidateRaw.incumbent, 0, 10000000),
    incumbentBefore: bb312Integer(candidateRaw.incumbentBefore, 0, 10000000),
    incumbentAfter: bb312Integer(candidateRaw.incumbentAfter, 0, 10000000),
    incumbentChoice: bb312Integer(candidateRaw.incumbentChoice, 1, Math.max(1, maxIndex - 1)),
    outcome: ["idle", "pending", "update", "keep"].includes(candidateRaw.outcome) ? candidateRaw.outcome : "idle",
    reason: ["first-candidate", "strictly-greater", "tie", "lower"].includes(candidateRaw.reason) ? candidateRaw.reason : null,
  };

  const validStatuses = new Set(["unallocated", "not-applicable", "base", "uncomputed", "computed-zero", "computed"]);
  const normalizeTable = (tableRaw, kind) => {
    const table = tableRaw && typeof tableRaw === "object" ? tableRaw : {};
    const allocated = table.allocated === true && tableSize >= 3;
    const values = Array.from({ length: tableSize }, (_, row) => Array.from({ length: tableSize }, (_, column) => {
      if (!allocated || !Array.isArray(table.values) || !Array.isArray(table.values[row])) return null;
      return kind === "dp"
        ? bb312Integer(table.values[row][column], 0, 10000000)
        : bb312Integer(table.values[row][column], -1, maxIndex);
    }));
    const status = Array.from({ length: tableSize }, (_, row) => Array.from({ length: tableSize }, (_, column) => {
      const supplied = allocated && Array.isArray(table.status) && Array.isArray(table.status[row]) ? table.status[row][column] : null;
      if (validStatuses.has(supplied)) return supplied;
      if (!allocated) return "unallocated";
      if (column <= row) return "not-applicable";
      if (column === row + 1) return "base";
      return "uncomputed";
    }));
    const activeRaw = table.active && typeof table.active === "object" ? table.active : {};
    const activeRow = bb312Integer(activeRaw.row, 0, maxIndex);
    const activeColumn = bb312Integer(activeRaw.column, 0, maxIndex);
    return {
      allocated,
      values,
      status,
      active: activeRow !== null && activeColumn !== null ? { row: activeRow, column: activeColumn } : null,
    };
  };
  const dp = normalizeTable(raw.dp, "dp");
  dp.dependencies = dependencyReads;
  const choice = normalizeTable(raw.choice, "choice");

  const reconstructionRaw = raw.reconstruction && typeof raw.reconstruction === "object" ? raw.reconstruction : {};
  const stackStages = new Set(["choice-read", "base-condition", "base-return", "call-left", "call-right", "append-last"]);
  const stack = Array.isArray(reconstructionRaw.stack) ? reconstructionRaw.stack.slice(0, 10).map((item, index) => {
    const frame = item && typeof item === "object" ? item : {};
    const left = bb312Integer(frame.left, 0, maxIndex);
    const right = bb312Integer(frame.right, 0, maxIndex);
    if (left === null || right === null || left >= right) return null;
    return {
      depth: bb312Integer(frame.depth, 0, 9) ?? index,
      left,
      right,
      k: bb312Integer(frame.k, -1, maxIndex),
      stage: stackStages.has(frame.stage) ? frame.stage : "choice-read",
    };
  }).filter(Boolean) : [];
  const activeChoiceRaw = reconstructionRaw.activeChoice && typeof reconstructionRaw.activeChoice === "object"
    ? reconstructionRaw.activeChoice
    : {};
  const activeChoiceIndex = bb312Integer(activeChoiceRaw.paddedIndex, 1, Math.max(1, maxIndex - 1));
  const activeChoice = activeChoiceIndex === null ? null : refAt(activeChoiceIndex);
  const orderRaw = reconstructionRaw.burstOrder && typeof reconstructionRaw.burstOrder === "object"
    ? reconstructionRaw.burstOrder
    : {};
  const seenOriginal = new Set();
  const burstItems = Array.isArray(orderRaw.items) ? orderRaw.items.slice(0, 8).map((item, index) => {
    const entry = item && typeof item === "object" ? item : {};
    const paddedIndex = bb312Integer(entry.paddedIndex, 1, Math.max(1, maxIndex - 1));
    const ref = refAt(paddedIndex);
    if (!ref || seenOriginal.has(ref.originalIndex)) return null;
    seenOriginal.add(ref.originalIndex);
    return {
      step: index + 1,
      paddedIndex: ref.paddedIndex,
      originalIndex: ref.originalIndex,
      value: ref.value,
    };
  }).filter(Boolean) : [];

  const conditionRaw = raw.condition && typeof raw.condition === "object" ? raw.condition : {};
  const locale = bb312Locale();
  return {
    source: { line: sourceLine, text: BB312_SOURCE[sourceLine - 1] },
    event,
    phase,
    timing,
    condition: {
      expression: bb312CleanText(conditionRaw.expression, "", 140),
      result: typeof conditionRaw.result === "boolean" ? conditionRaw.result : null,
    },
    input: { values: inputValues },
    padded: {
      allocated: paddedAllocated && paddedValues.length > 0,
      values: paddedValues,
      cells,
      sentinels: { left: refAt(0), right: refAt(paddedValues.length - 1) },
    },
    size: declaredSize,
    tableSize,
    cursor,
    interval: cursor.left !== null && cursor.right !== null
      ? { left: refAt(cursor.left), right: refAt(cursor.right), length: cursor.length }
      : null,
    lastChoice: cursor.k === null ? null : refAt(cursor.k),
    multipliers,
    dependencyReads,
    candidate,
    dp,
    choice,
    reconstruction: {
      initialized: reconstructionRaw.initialized === true,
      helperBound: reconstructionRaw.helperBound === true,
      rootCalled: reconstructionRaw.rootCalled === true,
      stack,
      activeChoice,
      burstOrder: {
        items: burstItems,
        paddedIndices: burstItems.map((item) => item.paddedIndex),
        originalIndices: burstItems.map((item) => item.originalIndex),
        values: burstItems.map((item) => item.value),
      },
      complete: reconstructionRaw.complete === true,
    },
    answer: bb312Integer(raw.answer, 0, 10000000),
    final: raw.final === true || Boolean(step && step.final),
    title: bb312Localized(step && step.title, locale, BB312_TEXT[locale].fallbackTitle),
    note: bb312Localized(step && step.note, locale, ""),
  };
}

function bb312Display(value, fallback = "—") {
  return value === null ? fallback : String(value);
}

function bb312RenderRail(state, copy, locale) {
  const items = BB312_SOURCE.map((source, index) => {
    const line = index + 1;
    const current = line === state.source.line;
    const event = BB312_EVENTS[BB312_LINE_EVENTS[index]][locale];
    return `<li class="bb312-rail-item ${current ? "bb312-is-current" : ""}"${current ? ' aria-current="step"' : ""}><small>L${line} · ${bb312Escape(event)}</small><code>${bb312Escape(source)}</code></li>`;
  }).join("");
  return `<nav class="bb312-rail-wrap" aria-label="${bb312Escape(copy.eventRail)}"><ol class="bb312-event-rail" role="list">${items}</ol></nav>`;
}

function bb312RenderSource(state, copy, locale) {
  const eventLabel = BB312_EVENTS[state.event][locale];
  const condition = state.condition.result === null
    ? copy.noCondition
    : `${state.condition.expression || copy.condition} → ${state.condition.result ? copy.trueValue : copy.falseValue}`;
  const conditionClass = state.condition.result === null ? "none" : state.condition.result ? "true" : "false";
  return `<section class="bb312-source-card" aria-labelledby="bb312-source-title"><div class="bb312-source-expression"><small id="bb312-source-title">${bb312Escape(copy.sourceAction)}</small><code>${bb312Escape(state.source.text)}</code></div><dl class="bb312-source-facts"><div><dt>${bb312Escape(copy.phase)}</dt><dd>${bb312Escape(state.phase)}</dd></div><div><dt>${bb312Escape(copy.event)}</dt><dd>${bb312Escape(eventLabel)}</dd></div><div><dt>${bb312Escape(copy.condition)}</dt><dd class="bb312-condition-${conditionClass}">${bb312Escape(condition)}</dd></div></dl></section>`;
}

function bb312CellRole(cell, copy) {
  if (cell.roles.includes("last-choice")) return copy.lastChoice;
  if (cell.roles.includes("left-boundary")) return copy.leftBoundary;
  if (cell.roles.includes("right-boundary")) return copy.rightBoundary;
  if (cell.sentinel) return copy.sentinel;
  if (cell.roles.includes("interval-interior")) return copy.interior;
  return copy.outside;
}

function bb312RenderBalloons(state, copy) {
  if (!state.padded.cells.length) {
    return `<section class="bb312-card bb312-balloons" aria-labelledby="bb312-balloons-title"><header><h3 id="bb312-balloons-title">${bb312Escape(copy.paddedStrip)}</h3></header><div class="bb312-empty">${bb312Escape(copy.awaiting)}</div></section>`;
  }
  const cells = state.padded.cells.map((cell) => {
    const role = bb312CellRole(cell, copy);
    const classes = [
      cell.sentinel ? "bb312-is-sentinel" : "",
      cell.roles.includes("left-boundary") ? "bb312-is-left" : "",
      cell.roles.includes("last-choice") ? "bb312-is-last" : "",
      cell.roles.includes("right-boundary") ? "bb312-is-right" : "",
      cell.roles.includes("interval-interior") ? "bb312-is-interior" : "",
    ].filter(Boolean).join(" ");
    const original = cell.originalIndex === null ? copy.sentinel : `${copy.originalIndex} ${cell.originalIndex}`;
    const aria = `${copy.paddedIndex} ${cell.paddedIndex}, ${original}, ${cell.value}, ${role}`;
    return `<li class="bb312-balloon ${classes}"${cell.roles.includes("last-choice") ? ' aria-current="step"' : ""} aria-label="${bb312Escape(aria)}"><small>p${cell.paddedIndex}</small><strong>${cell.value}</strong><span>${bb312Escape(cell.originalIndex === null ? "S" : `o${cell.originalIndex}`)}</span><em>${bb312Escape(role)}</em></li>`;
  }).join("");
  return `<section class="bb312-card bb312-balloons" aria-labelledby="bb312-balloons-title"><header><h3 id="bb312-balloons-title">${bb312Escape(copy.paddedStrip)}</h3><span>${state.padded.cells.length}</span></header><div class="bb312-strip-scroll"><ol class="bb312-balloon-strip" role="list">${cells}</ol></div></section>`;
}

function bb312RenderFacts(state, copy) {
  const facts = [
    [copy.length, bb312Display(state.cursor.length, copy.none)],
    [copy.left, bb312Display(state.cursor.left, copy.none)],
    [copy.right, bb312Display(state.cursor.right, copy.none)],
    [copy.k, bb312Display(state.cursor.k, copy.none)],
  ].map(([label, value]) => `<div><dt>${bb312Escape(label)}</dt><dd>${bb312Escape(value)}</dd></div>`).join("");
  return `<section class="bb312-card bb312-interval" aria-labelledby="bb312-interval-title"><header><h3 id="bb312-interval-title">${bb312Escape(copy.intervalFacts)}</h3></header><dl>${facts}</dl></section>`;
}

function bb312ReadCard(read, label, copy) {
  const coordinate = read.row === null || read.column === null ? "dp[—][—]" : `dp[${read.row}][${read.column}]`;
  const statusLabel = read.status === "read" ? copy.read : read.status === "pending" ? copy.pending : copy.idle;
  return `<div class="bb312-dependency bb312-read-${read.status}"><small>${bb312Escape(label)}</small><code>${bb312Escape(coordinate)}</code><strong>${bb312Escape(bb312Display(read.value))}</strong><span>${bb312Escape(statusLabel)}${read.cellStatus ? ` · ${bb312Escape(read.cellStatus)}` : ""}</span></div>`;
}

function bb312OutcomeReason(reason, copy) {
  if (reason === "first-candidate") return copy.firstCandidate;
  if (reason === "strictly-greater") return copy.strictlyGreater;
  if (reason === "tie") return copy.tie;
  if (reason === "lower") return copy.lower;
  return copy.pending;
}

function bb312RenderRecurrence(state, copy) {
  const values = state.multipliers.values;
  const product = state.multipliers.product;
  const candidate = state.candidate;
  const outcome = candidate.outcome === "update" ? copy.update : candidate.outcome === "keep" ? copy.keep : copy.pending;
  const formula = `${bb312Display(values.left)} × ${bb312Display(values.k)} × ${bb312Display(values.right)} = ${bb312Display(product)}`;
  const total = `${bb312Display(candidate.boundary)} + ${bb312Display(candidate.leftCoins)} + ${bb312Display(candidate.rightCoins)} = ${bb312Display(candidate.proposed)}`;
  return `<section class="bb312-card bb312-recurrence bb312-outcome-${candidate.outcome}" aria-labelledby="bb312-recurrence-title" aria-live="polite"><header><div><small>${bb312Escape(copy.recurrence)}</small><h3 id="bb312-recurrence-title">${bb312Escape(formula)}</h3></div><strong class="bb312-outcome-badge">${bb312Escape(outcome)}</strong></header><div class="bb312-dependency-grid">${bb312ReadCard(state.dependencyReads.left, copy.leftDependency, copy)}${bb312ReadCard(state.dependencyReads.right, copy.rightDependency, copy)}</div><div class="bb312-total-flow"><span><small>${bb312Escape(copy.boundary)}</small><code>${bb312Escape(total)}</code></span><span><small>${bb312Escape(copy.incumbent)}</small><strong>${bb312Escape(bb312Display(candidate.incumbentBefore))}</strong></span><span><small>${bb312Escape(copy.proposed)}</small><strong>${bb312Escape(bb312Display(candidate.proposed))}</strong></span></div><p>${bb312Escape(bb312OutcomeReason(candidate.reason, copy))}</p></section>`;
}

function bb312TableValue(kind, value, status) {
  if (status === "not-applicable") return "";
  if (status === "unallocated" || status === "uncomputed") return "·";
  if (kind === "choice" && status === "base") return "∅";
  if (kind === "choice" && value === -1) return "·";
  return value === null ? "·" : String(value);
}

function bb312CoordinateMatches(coordinate, row, column) {
  return coordinate && coordinate.row === row && coordinate.column === column;
}

function bb312RenderTable(state, kind, copy) {
  const table = kind === "dp" ? state.dp : state.choice;
  const title = kind === "dp" ? copy.dpTable : copy.choiceTable;
  const size = state.tableSize;
  if (!size) return `<div class="bb312-table-panel"><h4>${bb312Escape(title)}</h4><div class="bb312-empty">${bb312Escape(copy.awaiting)}</div></div>`;
  const headers = Array.from({ length: size }, (_, index) => {
    const value = state.padded.values[index];
    return `<th scope="col"><span>p${index}</span><small>${value == null ? "—" : value}</small></th>`;
  }).join("");
  const rows = Array.from({ length: size }, (_, row) => {
    const labelValue = state.padded.values[row];
    const cells = Array.from({ length: size }, (_, column) => {
      const status = table.status[row][column];
      const value = table.values[row][column];
      const active = bb312CoordinateMatches(table.active, row, column);
      const leftDependency = kind === "dp" && bb312CoordinateMatches(state.dp.dependencies.left, row, column);
      const rightDependency = kind === "dp" && bb312CoordinateMatches(state.dp.dependencies.right, row, column);
      const classes = [
        `bb312-cell-${status}`,
        active ? "bb312-is-active-cell" : "",
        leftDependency ? "bb312-is-left-dependency" : "",
        rightDependency ? "bb312-is-right-dependency" : "",
      ].filter(Boolean).join(" ");
      const display = bb312TableValue(kind, value, status);
      const aria = `${title}, [${row}, ${column}], ${status}, ${display || copy.outside}`;
      return `<td class="${classes}" aria-label="${bb312Escape(aria)}"><span>${bb312Escape(display)}</span></td>`;
    }).join("");
    return `<tr><th scope="row"><span>p${row}</span><small>${labelValue == null ? "—" : labelValue}</small></th>${cells}</tr>`;
  }).join("");
  return `<div class="bb312-table-panel"><h4>${bb312Escape(title)}</h4><div class="bb312-table-scroll"><table class="bb312-matrix bb312-${kind}-matrix"><caption>${bb312Escape(title)}. ${bb312Escape(copy.tableHelp)}</caption><thead><tr><th aria-hidden="true"></th>${headers}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function bb312RenderTables(state, copy) {
  const legend = [
    ["base", copy.base],
    ["uncomputed", copy.uncomputed],
    ["computed-zero", copy.computedZero],
    ["computed", copy.computed],
  ].map(([status, label]) => `<li class="bb312-legend-${status}"><span></span>${bb312Escape(label)}</li>`).join("");
  return `<section class="bb312-card bb312-tables" aria-label="${bb312Escape(copy.dpTable)}"><header><div><h3>${bb312Escape(copy.dpTable)} + ${bb312Escape(copy.choiceTable)}</h3><p>${bb312Escape(copy.tableHelp)}</p></div><ul class="bb312-table-legend" role="list">${legend}</ul></header><div class="bb312-table-grid">${bb312RenderTable(state, "dp", copy)}${bb312RenderTable(state, "choice", copy)}</div></section>`;
}

function bb312RenderReconstruction(state, copy) {
  const stack = state.reconstruction.stack.length
    ? `<ol class="bb312-stack-list" role="list">${state.reconstruction.stack.map((frame) => `<li><small>#${frame.depth}</small><code>rebuild(${frame.left}, ${frame.right})</code><strong>k=${bb312Display(frame.k)}</strong><span>${bb312Escape(frame.stage)}</span></li>`).join("")}</ol>`
    : `<div class="bb312-empty">${bb312Escape(copy.emptyStack)}</div>`;
  const active = state.reconstruction.activeChoice
    ? `<div class="bb312-active-choice"><small>${bb312Escape(copy.activeChoice)}</small><strong>${state.reconstruction.activeChoice.value}</strong><span>p${state.reconstruction.activeChoice.paddedIndex} · o${state.reconstruction.activeChoice.originalIndex}</span></div>`
    : `<div class="bb312-active-choice bb312-is-empty">${bb312Escape(copy.noActiveChoice)}</div>`;
  const order = state.reconstruction.burstOrder.items.length
    ? `<ol class="bb312-order-list" role="list">${state.reconstruction.burstOrder.items.map((item) => `<li><small>${bb312Escape(copy.step)} ${item.step}</small><strong>${item.value}</strong><span>p${item.paddedIndex} · o${item.originalIndex}</span></li>`).join("")}</ol>`
    : `<div class="bb312-empty">${bb312Escape(copy.noBursts)}</div>`;
  return `<section class="bb312-card bb312-reconstruction" aria-labelledby="bb312-reconstruction-title"><header><h3 id="bb312-reconstruction-title">${bb312Escape(copy.reconstruction)}</h3></header><div class="bb312-reconstruction-grid"><div><h4>${bb312Escape(copy.stack)}</h4><div class="bb312-stack-scroll">${stack}</div>${active}</div><div><h4>${bb312Escape(copy.chronological)}</h4><div class="bb312-order-scroll">${order}</div></div></div></section>`;
}

function bb312RenderFinal(state, copy) {
  const order = state.reconstruction.burstOrder;
  const answer = state.answer === null ? copy.awaiting : String(state.answer);
  const witness = order.items.length
    ? `<dl class="bb312-witness"><div><dt>${bb312Escape(copy.paddedOrder)}</dt><dd>[${order.paddedIndices.join(", ")}]</dd></div><div><dt>${bb312Escape(copy.originalOrder)}</dt><dd>[${order.originalIndices.join(", ")}]</dd></div><div><dt>${bb312Escape(copy.valueOrder)}</dt><dd>[${order.values.join(", ")}]</dd></div></dl>`
    : `<p>${bb312Escape(copy.noBursts)}</p>`;
  return `<section class="bb312-card bb312-final ${state.final ? "bb312-is-complete" : ""}" aria-labelledby="bb312-final-title" aria-live="polite"><div><small>${bb312Escape(copy.finalResult)}</small><h3 id="bb312-final-title">${bb312Escape(answer)}</h3></div><div><h4>${bb312Escape(copy.witness)}</h4>${witness}</div></section>`;
}

function renderBurstBalloons312View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = bb312Locale();
  const copy = BB312_TEXT[locale];
  const state = bb312Normalize(step);
  const eventLabel = BB312_EVENTS[state.event][locale];
  const timingLabel = state.timing === "before" ? copy.before : copy.after;
  const summary = `${copy.region}. ${copy.line} ${state.source.line}. ${eventLabel}.`;
  const note = state.note
    ? `<aside class="bb312-note"><strong>${bb312Escape(copy.note)}</strong><p>${bb312Escape(state.note)}</p></aside>`
    : "";
  host.innerHTML = `<article class="bb312-viz bb312-phase-${state.phase} ${state.final ? "bb312-is-final" : ""}" role="region" aria-label="${bb312Escape(summary)}"><header class="bb312-header"><div><span>${bb312Escape(copy.kicker)}</span><h2>${bb312Escape(state.title)}</h2></div><div class="bb312-line-state"><strong>${bb312Escape(copy.line)} ${state.source.line}</strong><span class="bb312-timing-${state.timing}">${bb312Escape(timingLabel)}</span><em>${bb312Escape(eventLabel)}</em></div></header>${bb312RenderRail(state, copy, locale)}${bb312RenderSource(state, copy, locale)}${bb312RenderBalloons(state, copy)}<div class="bb312-analysis-grid">${bb312RenderFacts(state, copy)}${bb312RenderRecurrence(state, copy)}</div>${bb312RenderTables(state, copy)}${bb312RenderReconstruction(state, copy)}${bb312RenderFinal(state, copy)}${note}</article>`;
}
