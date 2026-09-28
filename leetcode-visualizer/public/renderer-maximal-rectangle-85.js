"use strict";

const MAXIMAL85_PHASES = Object.freeze([
  { line: 3, phase: "guard", event: "check-matrix", en: "Nonempty guard", vi: "Kiểm tra không rỗng" },
  { line: 4, phase: "initialize", event: "allocate-heights", en: "Allocate heights", vi: "Tạo heights" },
  { line: 5, phase: "initialize", event: "initialize-best", en: "Initialize best", vi: "Khởi tạo best" },
  { line: 6, phase: "row", event: "select-row", en: "Select row", vi: "Chọn hàng" },
  { line: 7, phase: "heights", event: "read-cell", en: "Read cell", vi: "Đọc ô" },
  { line: 8, phase: "heights", event: "write-height", en: "Write height", vi: "Ghi chiều cao" },
  { line: 9, phase: "histogram", event: "allocate-stack", en: "Allocate stack", vi: "Tạo stack" },
  { line: 10, phase: "histogram", event: "select-bar", en: "Select bar", vi: "Chọn bar" },
  { line: 11, phase: "stack", event: "evaluate-pop-condition", en: "Check pop", vi: "Kiểm tra pop" },
  { line: 12, phase: "stack", event: "pop-bar", en: "Pop bar", vi: "Pop bar" },
  { line: 13, phase: "geometry", event: "measure-candidate", en: "Measure candidate", vi: "Đo ứng viên" },
  { line: 14, phase: "decision", event: "update-or-keep-best", en: "Update or keep", vi: "Cập nhật hoặc giữ" },
  { line: 15, phase: "stack", event: "push-bar", en: "Push bar", vi: "Push bar" },
  { line: 16, phase: "return", event: "return-best", en: "Return best", vi: "Trả best" },
]);

const MAXIMAL85_TEXT = Object.freeze({
  en: Object.freeze({
    region: "Maximal Rectangle monotonic-stack visualization",
    kicker: "LeetCode 85 · row histogram + monotonic stack",
    phaseRail: "Source-line and phase rail",
    line: "LINE",
    before: "before line effect",
    after: "after line effect",
    matrix: "Binary matrix",
    matrixHelp: "The active row builds the histogram. Candidate and global-best rectangles stay independently visible.",
    histogram: "Aligned histogram",
    histogramHelp: "Each bar is aligned to its matrix column; S is the height-0 sentinel.",
    stack: "Monotonic stack · bottom to top",
    stackEmpty: "The stack is empty.",
    stackBottom: "BOTTOM",
    stackTop: "TOP",
    current: "current",
    sentinel: "sentinel",
    stacked: "in stack",
    popped: "popped",
    candidate: "candidate",
    globalBest: "global best",
    active: "active",
    cursor: "Cursor",
    row: "row",
    column: "column",
    index: "histogram index",
    cellTransition: "Cell → height transition",
    cell: "cell value",
    oldHeight: "old height",
    newHeight: "new height",
    notApplicable: "not active on this line",
    whileCondition: "While condition",
    notEvaluated: "not evaluated on this line",
    conditionTrue: "TRUE · pop the stack top",
    conditionFalse: "FALSE · current can be pushed",
    geometry: "Candidate geometry",
    geometryPending: "No candidate geometry is calculated on this line.",
    left: "left boundary",
    right: "right boundary",
    width: "width",
    height: "height",
    area: "area",
    rectangle: "matrix rectangle",
    emptyCandidate: "height 0 produces no matrix rectangle",
    decision: "Update vs keep",
    decisionPending: "The best comparison has not run on this line.",
    update: "UPDATE",
    keep: "KEEP",
    updateDetail: "candidate is strictly larger",
    keepDetail: "candidate is not strictly larger",
    previousBest: "previous best",
    bestNow: "best now",
    bestSummary: "Persistent global best",
    noBest: "No all-1 rectangle has won yet.",
    bestArea: "best area",
    bestCoordinates: "coordinates",
    bestShape: "shape",
    rowsByCols: "rows × cols",
    note: "Why this frame matters",
    legend: "Legend",
  }),
  vi: Object.freeze({
    region: "Trực quan hóa Hình chữ nhật lớn nhất bằng stack đơn điệu",
    kicker: "LeetCode 85 · histogram theo hàng + stack đơn điệu",
    phaseRail: "Thanh dòng mã nguồn và pha",
    line: "DÒNG",
    before: "trước tác động của dòng",
    after: "sau tác động của dòng",
    matrix: "Ma trận nhị phân",
    matrixHelp: "Hàng hoạt động tạo histogram. Rectangle ứng viên và global best luôn được hiển thị riêng.",
    histogram: "Histogram thẳng cột",
    histogramHelp: "Mỗi bar thẳng với cột ma trận; S là sentinel cao 0.",
    stack: "Stack đơn điệu · từ đáy lên đỉnh",
    stackEmpty: "Stack đang rỗng.",
    stackBottom: "ĐÁY",
    stackTop: "ĐỈNH",
    current: "hiện tại",
    sentinel: "sentinel",
    stacked: "trong stack",
    popped: "đã pop",
    candidate: "ứng viên",
    globalBest: "global best",
    active: "đang xét",
    cursor: "Con trỏ",
    row: "hàng",
    column: "cột",
    index: "index histogram",
    cellTransition: "Chuyển ô → chiều cao",
    cell: "giá trị ô",
    oldHeight: "chiều cao cũ",
    newHeight: "chiều cao mới",
    notApplicable: "không hoạt động ở dòng này",
    whileCondition: "Điều kiện while",
    notEvaluated: "không được đánh giá ở dòng này",
    conditionTrue: "TRUE · pop đỉnh stack",
    conditionFalse: "FALSE · có thể push current",
    geometry: "Hình học ứng viên",
    geometryPending: "Dòng này chưa tính hình học ứng viên.",
    left: "biên trái",
    right: "biên phải",
    width: "chiều rộng",
    height: "chiều cao",
    area: "diện tích",
    rectangle: "rectangle trên ma trận",
    emptyCandidate: "chiều cao 0 không tạo rectangle trên ma trận",
    decision: "Cập nhật hay giữ",
    decisionPending: "Dòng này chưa so sánh với best.",
    update: "CẬP NHẬT",
    keep: "GIỮ",
    updateDetail: "ứng viên lớn hơn nghiêm ngặt",
    keepDetail: "ứng viên không lớn hơn nghiêm ngặt",
    previousBest: "best trước",
    bestNow: "best hiện tại",
    bestSummary: "Global best bền vững",
    noBest: "Chưa có rectangle toàn 1 chiến thắng.",
    bestArea: "diện tích best",
    bestCoordinates: "tọa độ",
    bestShape: "kích thước",
    rowsByCols: "hàng × cột",
    note: "Ý nghĩa của frame này",
    legend: "Chú giải",
  }),
});

function maximal85Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function maximal85Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function maximal85Localized(value, locale) {
  if (value && typeof value === "object") {
    if (typeof value[locale] === "string") return value[locale];
    if (typeof value.en === "string") return value.en;
    if (typeof value.vi === "string") return value.vi;
  }
  return typeof value === "string" ? value : "";
}

function maximal85Integer(value) {
  return Number.isInteger(value) ? value : null;
}

function maximal85Number(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function maximal85Dimension(value, fallback) {
  const candidate = Number.isInteger(value) && value >= 0 ? value : fallback;
  return Math.min(16, Math.max(0, Number.isInteger(candidate) ? candidate : 0));
}

function maximal85CellValue(value) {
  if (typeof value === "string") return value.slice(0, 80);
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  return "";
}

function maximal85Rect(value, rows, cols) {
  if (!value || typeof value !== "object") return null;
  const top = maximal85Integer(value.top);
  const bottom = maximal85Integer(value.bottom);
  const left = maximal85Integer(value.left);
  const right = maximal85Integer(value.right);
  if (top === null || bottom === null || left === null || right === null) return null;
  if (top < 0 || left < 0 || bottom < top || right < left || bottom >= rows || right >= cols) return null;
  const height = maximal85Number(value.height) ?? (bottom - top + 1);
  const width = maximal85Number(value.width) ?? (right - left + 1);
  const area = maximal85Number(value.area) ?? (height * width);
  return { top, bottom, left, right, height, width, area };
}

function maximal85IndexedHeight(value) {
  const raw = value && typeof value === "object" ? value : {};
  return { index: maximal85Integer(raw.index), height: maximal85Number(raw.height) };
}

function maximal85Normalize(step) {
  const raw = step && step.maximalRectangle85View && typeof step.maximalRectangle85View === "object"
    ? step.maximalRectangle85View
    : {};
  const rawMatrix = Array.isArray(raw.matrix) ? raw.matrix.slice(0, 16) : [];
  const inferredCols = rawMatrix.reduce((size, row) => Math.max(size, Array.isArray(row) ? row.length : 0), 0);
  const rows = maximal85Dimension(raw.rows, rawMatrix.length);
  const cols = maximal85Dimension(raw.cols, inferredCols);
  const matrix = Array.from({ length: rows }, (_, row) => {
    const source = Array.isArray(rawMatrix[row]) ? rawMatrix[row] : [];
    return Array.from({ length: cols }, (_, col) => maximal85CellValue(source[col]));
  });
  const numberArray = (value, length, fallback) => Array.from({ length }, (_, index) => {
    const candidate = Array.isArray(value) ? maximal85Number(value[index]) : null;
    return candidate === null ? fallback(index) : Math.max(0, candidate);
  });
  const heights = numberArray(raw.heights, cols, () => 0);
  const bars = numberArray(raw.bars, cols + 1, (index) => index < cols ? heights[index] : 0);
  const sentinelIndex = maximal85Integer(raw.sentinelIndex) === null ? cols : maximal85Integer(raw.sentinelIndex);
  const cursorRaw = raw.cursor && typeof raw.cursor === "object" ? raw.cursor : {};
  const row = maximal85Integer(cursorRaw.row);
  const col = maximal85Integer(cursorRaw.col);
  const histogramIndex = maximal85Integer(cursorRaw.histogramIndex);
  const stack = Array.isArray(raw.stack)
    ? raw.stack.map(maximal85Integer).filter((index) => index !== null && index >= 0 && index < bars.length).slice(0, 17)
    : [];
  const cellRaw = raw.cell && typeof raw.cell === "object" ? raw.cell : {};
  const current = maximal85IndexedHeight(raw.current);
  const popped = maximal85IndexedHeight(raw.popped);
  const boundariesRaw = raw.boundaries && typeof raw.boundaries === "object" ? raw.boundaries : {};
  const left = maximal85Integer(boundariesRaw.left);
  const right = maximal85Integer(boundariesRaw.right);
  const sourceLine = maximal85Integer(raw.sourceLine) !== null
    ? maximal85Integer(raw.sourceLine)
    : (step && Array.isArray(step.codeLines) ? maximal85Integer(step.codeLines[0]) : null);

  return {
    version: maximal85Integer(raw.version) || 1,
    phase: typeof raw.phase === "string" ? raw.phase.slice(0, 80) : "unknown",
    event: typeof raw.event === "string" ? raw.event.slice(0, 80) : "unknown",
    sourceLine,
    timing: raw.timing === "before" ? "before" : "after",
    matrix,
    rows,
    cols,
    cursor: {
      row: row !== null && row >= 0 && row < rows ? row : null,
      col: col !== null && col >= 0 && col < cols ? col : null,
      histogramIndex: histogramIndex !== null && histogramIndex >= 0 && histogramIndex < bars.length ? histogramIndex : null,
      sentinel: cursorRaw.sentinel === true || histogramIndex === sentinelIndex,
    },
    cell: {
      value: maximal85CellValue(Object.prototype.hasOwnProperty.call(cellRaw, "value") ? cellRaw.value : raw.cellValue),
      oldHeight: maximal85Number(Object.prototype.hasOwnProperty.call(cellRaw, "oldHeight") ? cellRaw.oldHeight : raw.oldHeight),
      newHeight: maximal85Number(Object.prototype.hasOwnProperty.call(cellRaw, "newHeight") ? cellRaw.newHeight : raw.newHeight),
    },
    heights,
    bars,
    sentinelIndex,
    stack,
    stackTop: maximal85Integer(raw.stackTop),
    current,
    whileResult: typeof raw.whileResult === "boolean" ? raw.whileResult : null,
    popped,
    boundaries: { left, right },
    width: maximal85Number(raw.width),
    candidateArea: maximal85Number(raw.candidateArea),
    candidateRect: maximal85Rect(raw.candidateRect, rows, cols),
    previousBest: maximal85Number(raw.previousBest) || 0,
    maxArea: maximal85Number(raw.maxArea) || 0,
    improved: typeof raw.improved === "boolean" ? raw.improved : null,
    bestRect: maximal85Rect(raw.bestRect, rows, cols),
    note: maximal85Localized(step && step.note, maximal85Locale()),
  };
}

function maximal85Phase(state) {
  return MAXIMAL85_PHASES.find((item) => item.line === state.sourceLine && item.event === state.event)
    || MAXIMAL85_PHASES.find((item) => item.line === state.sourceLine)
    || null;
}

function maximal85InRect(rect, row, col) {
  return Boolean(rect && row >= rect.top && row <= rect.bottom && col >= rect.left && col <= rect.right);
}

function maximal85RectText(rect) {
  return rect ? `r${rect.top}..${rect.bottom}, c${rect.left}..${rect.right}` : "—";
}

function maximal85RenderPhaseRail(state, copy, locale) {
  const currentIndex = MAXIMAL85_PHASES.findIndex((item) => item.line === state.sourceLine && item.event === state.event);
  return `<nav class="maximal85-rail-wrap" aria-label="${maximal85Escape(copy.phaseRail)}"><ol class="maximal85-phase-rail" role="list">${MAXIMAL85_PHASES.map((item, index) => {
    const classes = [
      "maximal85-phase",
      index === currentIndex ? "is-current" : "",
      currentIndex >= 0 && index < currentIndex ? "is-complete" : "",
    ].filter(Boolean).join(" ");
    return `<li class="${classes}"${index === currentIndex ? " aria-current=\"step\"" : ""}><small>${item.line}</small><span>${maximal85Escape(item[locale])}</span></li>`;
  }).join("")}</ol></nav>`;
}

function maximal85RenderMatrix(state, copy) {
  let header = `<tr><th class="maximal85-corner" scope="col">r\\c</th>`;
  for (let col = 0; col < state.cols; col++) header += `<th scope="col"><small>c=${col}</small></th>`;
  header += "</tr>";
  let body = "";
  for (let row = 0; row < state.rows; row++) {
    const activeRow = row === state.cursor.row;
    body += `<tr class="${activeRow ? "is-active-row" : ""}"><th scope="row"><small>r=${row}</small></th>`;
    for (let col = 0; col < state.cols; col++) {
      const value = state.matrix[row][col];
      const active = activeRow && col === state.cursor.col;
      const candidate = maximal85InRect(state.candidateRect, row, col);
      const best = maximal85InRect(state.bestRect, row, col);
      const classes = ["maximal85-matrix-cell", active ? "is-active" : "", candidate ? "is-candidate" : "", best ? "is-best" : ""].filter(Boolean).join(" ");
      const labels = [active ? copy.active : "", candidate ? copy.candidate : "", best ? copy.globalBest : ""].filter(Boolean);
      const aria = `${copy.row} ${row}, ${copy.column} ${col}, ${copy.cell} ${value || "empty"}${labels.length ? `, ${labels.join(", ")}` : ""}`;
      const markers = `${active ? `<i class="maximal85-marker is-active" aria-label="${maximal85Escape(copy.active)}">◎</i>` : ""}${candidate ? `<i class="maximal85-marker is-candidate" aria-label="${maximal85Escape(copy.candidate)}">C</i>` : ""}${best ? `<i class="maximal85-marker is-best" aria-label="${maximal85Escape(copy.globalBest)}">★</i>` : ""}`;
      body += `<td class="${classes}" aria-label="${maximal85Escape(aria)}"><span>${maximal85Escape(value || "·")}</span><b class="maximal85-cell-markers">${markers}</b></td>`;
    }
    body += "</tr>";
  }
  return `<section class="maximal85-panel maximal85-matrix-panel"><header><div><h3>${maximal85Escape(copy.matrix)}</h3><p>${maximal85Escape(copy.matrixHelp)}</p></div><div class="maximal85-legend" aria-label="${maximal85Escape(copy.legend)}"><span><i class="is-active">◎</i>${maximal85Escape(copy.active)}</span><span><i class="is-candidate">C</i>${maximal85Escape(copy.candidate)}</span><span><i class="is-best">★</i>${maximal85Escape(copy.globalBest)}</span></div></header><div class="maximal85-table-scroll" role="region" tabindex="0" aria-label="${maximal85Escape(copy.matrix)}"><table class="maximal85-matrix"><thead>${header}</thead><tbody>${body}</tbody></table></div></section>`;
}

function maximal85RenderHistogram(state, copy) {
  const maximum = Math.max(1, ...state.bars);
  const stackSet = new Set(state.stack);
  const candidateLeft = state.boundaries.left;
  const candidateRight = state.boundaries.right;
  const items = state.bars.map((height, index) => {
    const sentinel = index === state.sentinelIndex;
    const current = index === state.current.index || index === state.cursor.histogramIndex;
    const popped = index === state.popped.index;
    const candidate = candidateLeft !== null && candidateRight !== null && index >= candidateLeft && index <= candidateRight && !sentinel;
    const classes = [
      "maximal85-bar-item",
      sentinel ? "is-sentinel" : "",
      current ? "is-current" : "",
      stackSet.has(index) ? "is-stacked" : "",
      popped ? "is-popped" : "",
      candidate ? "is-candidate" : "",
    ].filter(Boolean).join(" ");
    const states = [sentinel ? copy.sentinel : "", current ? copy.current : "", stackSet.has(index) ? copy.stacked : "", popped ? copy.popped : "", candidate ? copy.candidate : ""].filter(Boolean).join(", ");
    const percent = Math.round((height / maximum) * 100);
    const label = sentinel ? "S" : `c${index}`;
    const flags = [
      current ? `<i class="is-current" aria-label="${maximal85Escape(copy.current)}">◎</i>` : "",
      stackSet.has(index) ? `<i class="is-stacked" aria-label="${maximal85Escape(copy.stacked)}">▣</i>` : "",
      popped ? `<i class="is-popped" aria-label="${maximal85Escape(copy.popped)}">↟</i>` : "",
      candidate ? `<i class="is-candidate" aria-label="${maximal85Escape(copy.candidate)}">C</i>` : "",
      sentinel ? `<i class="is-sentinel" aria-label="${maximal85Escape(copy.sentinel)}">S</i>` : "",
    ].join("");
    return `<li class="${classes}" role="listitem" aria-label="${maximal85Escape(`${label}, ${copy.height} ${height}${states ? `, ${states}` : ""}`)}"><div class="maximal85-bar-track"><span class="maximal85-bar-flags">${flags}</span><span class="maximal85-bar" style="--maximal85-bar-height:${percent}%"><b>${maximal85Escape(height)}</b></span>${popped ? `<em aria-hidden="true">↑</em>` : ""}</div><strong>${maximal85Escape(label)}</strong><small>${sentinel ? "⏹" : `h=${maximal85Escape(height)}`}</small></li>`;
  }).join("");
  return `<section class="maximal85-panel maximal85-histogram-panel"><header><div><h3>${maximal85Escape(copy.histogram)}</h3><p>${maximal85Escape(copy.histogramHelp)}</p></div><div class="maximal85-histogram-badges"><span>i=${state.current.index === null ? "—" : maximal85Escape(state.current.index)}</span><span>h=${state.current.height === null ? "—" : maximal85Escape(state.current.height)}</span></div></header><ol class="maximal85-histogram" role="list" style="--maximal85-columns:${Math.max(1, state.bars.length)}">${items}</ol></section>`;
}

function maximal85RenderStack(state, copy) {
  const items = state.stack.map((index, position) => {
    const isTop = position === state.stack.length - 1;
    const height = state.bars[index] == null ? 0 : state.bars[index];
    return `<li class="maximal85-stack-item ${isTop ? "is-top" : ""}"><span><small>i</small>${maximal85Escape(index)}</span><span><small>h</small>${maximal85Escape(height)}</span>${isTop ? `<strong>${maximal85Escape(copy.stackTop)}</strong>` : ""}</li>`;
  }).join("");
  const popped = state.popped.index === null
    ? ""
    : `<div class="maximal85-popped-chip"><span aria-hidden="true">↟</span><div><small>${maximal85Escape(copy.popped)}</small><strong>i=${maximal85Escape(state.popped.index)}, h=${maximal85Escape(state.popped.height)}</strong></div></div>`;
  return `<section class="maximal85-panel maximal85-stack-panel"><header><h3>${maximal85Escape(copy.stack)}</h3><span>${maximal85Escape(copy.stackTop)}: ${state.stackTop === null ? "—" : maximal85Escape(state.stackTop)}</span></header><div class="maximal85-stack-lane"><b>${maximal85Escape(copy.stackTop)}</b>${state.stack.length ? `<ol class="maximal85-stack-items" role="list" aria-label="${maximal85Escape(copy.stack)}">${items}</ol>` : `<p>${maximal85Escape(copy.stackEmpty)}</p>`}<b>${maximal85Escape(copy.stackBottom)}</b></div>${popped}</section>`;
}

function maximal85RenderTransition(state, copy) {
  const hasCell = state.cell.oldHeight !== null || state.cell.newHeight !== null || state.cell.value !== "";
  const transition = hasCell
    ? `<div class="maximal85-transition"><span><small>${maximal85Escape(copy.cell)}</small><b>${maximal85Escape(state.cell.value || "—")}</b></span><i aria-hidden="true">→</i><span><small>${maximal85Escape(copy.oldHeight)}</small><b>${state.cell.oldHeight === null ? "—" : maximal85Escape(state.cell.oldHeight)}</b></span><i aria-hidden="true">→</i><span><small>${maximal85Escape(copy.newHeight)}</small><b>${state.cell.newHeight === null ? "—" : maximal85Escape(state.cell.newHeight)}</b></span></div>`
    : `<p class="maximal85-empty">${maximal85Escape(copy.notApplicable)}</p>`;
  const whileText = state.whileResult === null ? copy.notEvaluated : (state.whileResult ? copy.conditionTrue : copy.conditionFalse);
  const whileClass = state.whileResult === null ? "is-pending" : (state.whileResult ? "is-true" : "is-false");
  const topHeight = state.stackTop === null || state.bars[state.stackTop] == null ? "—" : state.bars[state.stackTop];
  const expression = state.whileResult === null
    ? "stack and bars[stack[-1]] >= h"
    : `stack=${state.stack.length > 0} · ${topHeight} >= ${state.current.height === null ? "—" : state.current.height}`;
  return `<section class="maximal85-panel maximal85-transition-panel"><div><h3>${maximal85Escape(copy.cellTransition)}</h3>${transition}</div><div><h3>${maximal85Escape(copy.whileCondition)}</h3><div class="maximal85-condition ${whileClass}"><code>${maximal85Escape(expression)}</code><strong>${maximal85Escape(whileText)}</strong></div></div></section>`;
}

function maximal85RenderGeometry(state, copy) {
  if (state.candidateArea === null || state.width === null || state.popped.height === null) {
    return `<section class="maximal85-panel maximal85-geometry-panel"><h3>${maximal85Escape(copy.geometry)}</h3><p class="maximal85-empty">${maximal85Escape(copy.geometryPending)}</p></section>`;
  }
  const rectText = state.candidateRect ? maximal85RectText(state.candidateRect) : copy.emptyCandidate;
  return `<section class="maximal85-panel maximal85-geometry-panel"><header><h3>${maximal85Escape(copy.geometry)}</h3><strong class="maximal85-area-chip">A=${maximal85Escape(state.candidateArea)}</strong></header><div class="maximal85-boundary-diagram"><span><small>${maximal85Escape(copy.left)}</small><b>${state.boundaries.left === null ? "—" : maximal85Escape(state.boundaries.left)}</b></span><i aria-hidden="true">⟷</i><span><small>${maximal85Escape(copy.right)}</small><b>${state.boundaries.right === null ? "—" : maximal85Escape(state.boundaries.right)}</b></span></div><code class="maximal85-formula">${maximal85Escape(`${copy.area} = ${copy.height} × ${copy.width} = ${state.popped.height} × ${state.width} = ${state.candidateArea}`)}</code><dl class="maximal85-geometry-values"><div><dt>${maximal85Escape(copy.height)}</dt><dd>${maximal85Escape(state.popped.height)}</dd></div><div><dt>${maximal85Escape(copy.width)}</dt><dd>${maximal85Escape(state.width)}</dd></div><div><dt>${maximal85Escape(copy.rectangle)}</dt><dd>${maximal85Escape(rectText)}</dd></div></dl></section>`;
}

function maximal85RenderDecision(state, copy) {
  if (state.improved === null) {
    return `<section class="maximal85-panel maximal85-decision-panel is-pending"><h3>${maximal85Escape(copy.decision)}</h3><p class="maximal85-empty">${maximal85Escape(copy.decisionPending)}</p></section>`;
  }
  const action = state.improved ? copy.update : copy.keep;
  const detail = state.improved ? copy.updateDetail : copy.keepDetail;
  const symbol = state.improved ? "↑" : "=";
  return `<section class="maximal85-panel maximal85-decision-panel ${state.improved ? "is-update" : "is-keep"}"><header><h3>${maximal85Escape(copy.decision)}</h3><strong><span aria-hidden="true">${symbol}</span>${maximal85Escape(action)}</strong></header><p>${maximal85Escape(detail)}</p><div class="maximal85-best-transition"><span><small>${maximal85Escape(copy.previousBest)}</small><b>${maximal85Escape(state.previousBest)}</b></span><i aria-hidden="true">→</i><span><small>${maximal85Escape(copy.candidate)}</small><b>${state.candidateArea === null ? "—" : maximal85Escape(state.candidateArea)}</b></span><i aria-hidden="true">→</i><span><small>${maximal85Escape(copy.bestNow)}</small><b>${maximal85Escape(state.maxArea)}</b></span></div></section>`;
}

function maximal85RenderBest(state, copy) {
  if (!state.bestRect) {
    return `<section class="maximal85-best-summary is-empty" role="status" aria-live="polite"><div><small>${maximal85Escape(copy.bestSummary)}</small><strong>${maximal85Escape(copy.noBest)}</strong></div><b>0</b></section>`;
  }
  const rowCount = state.bestRect.bottom - state.bestRect.top + 1;
  const colCount = state.bestRect.right - state.bestRect.left + 1;
  return `<section class="maximal85-best-summary" role="status" aria-live="polite"><div><small>${maximal85Escape(copy.bestSummary)}</small><strong>★ ${maximal85Escape(copy.bestArea)} = ${maximal85Escape(state.maxArea)}</strong></div><dl><div><dt>${maximal85Escape(copy.bestCoordinates)}</dt><dd>${maximal85Escape(maximal85RectText(state.bestRect))}</dd></div><div><dt>${maximal85Escape(copy.bestShape)}</dt><dd>${rowCount} × ${colCount} ${maximal85Escape(copy.rowsByCols)}</dd></div></dl><b>${maximal85Escape(state.maxArea)}</b></section>`;
}

function maximal85Equation(state) {
  const i = state.current.index === null ? "—" : state.current.index;
  const h = state.current.height === null ? "—" : state.current.height;
  switch (state.sourceLine) {
    case 3: return `if not matrix → False (${state.rows} × ${state.cols})`;
    case 4: return `heights = [0] × ${state.cols} = [${state.heights.join(", ")}]`;
    case 5: return "best = 0";
    case 6: return `row ← matrix[${state.cursor.row === null ? "—" : state.cursor.row}]`;
    case 7: return `c ← ${state.cursor.col === null ? "—" : state.cursor.col}; value ← ${state.cell.value || "—"}`;
    case 8: return `heights[${state.cursor.col === null ? "—" : state.cursor.col}] : ${state.cell.oldHeight === null ? "—" : state.cell.oldHeight} → ${state.cell.newHeight === null ? "—" : state.cell.newHeight}`;
    case 9: return "stack = []";
    case 10: return `i = ${i}; h = ${h}${state.cursor.sentinel ? " (sentinel)" : ""}`;
    case 11: return `stack and bars[stack[-1]] >= ${h} → ${state.whileResult === null ? "—" : state.whileResult}`;
    case 12: return `top = stack.pop() = ${state.popped.index === null ? "—" : state.popped.index}`;
    case 13: return `width = ${state.width === null ? "—" : state.width}; area = ${state.candidateArea === null ? "—" : state.candidateArea}`;
    case 14: return `best = max(${state.previousBest}, ${state.candidateArea === null ? "—" : state.candidateArea}) = ${state.maxArea}`;
    case 15: return `stack.append(${i}) → [${state.stack.join(", ")}]`;
    case 16: return `return ${state.maxArea}`;
    default: return "—";
  }
}

function renderMaximalRectangle85View(step) {
  const host = typeof document !== "undefined" ? document.getElementById("treeView") : null;
  if (!host) return;

  const locale = maximal85Locale();
  const copy = MAXIMAL85_TEXT[locale];
  const state = maximal85Normalize(step);
  const phase = maximal85Phase(state);
  const phaseLabel = phase ? phase[locale] : state.phase;
  const timing = state.timing === "before" ? copy.before : copy.after;
  const cursor = `${copy.row}=${state.cursor.row === null ? "—" : state.cursor.row}, ${copy.column}=${state.cursor.col === null ? "—" : state.cursor.col}, ${copy.index}=${state.cursor.histogramIndex === null ? "—" : state.cursor.histogramIndex}${state.cursor.sentinel ? ` (${copy.sentinel})` : ""}`;
  const note = state.note
    ? `<aside class="maximal85-note"><strong>${maximal85Escape(copy.note)}</strong><p>${maximal85Escape(state.note)}</p></aside>`
    : "";

  host.innerHTML = `<article class="maximal85-viz" role="region" aria-label="${maximal85Escape(copy.region)}">
    <header class="maximal85-header"><div><span>${maximal85Escape(copy.kicker)}</span><h2>${maximal85Escape(phaseLabel)}</h2></div><div class="maximal85-line-state"><strong>${maximal85Escape(copy.line)} ${state.sourceLine === null ? "—" : maximal85Escape(state.sourceLine)}</strong><span class="is-${state.timing}">${maximal85Escape(timing)}</span></div></header>
    ${maximal85RenderPhaseRail(state, copy, locale)}
    <section class="maximal85-source-strip"><code>${maximal85Escape(maximal85Equation(state))}</code><span><small>${maximal85Escape(copy.cursor)}</small>${maximal85Escape(cursor)}</span></section>
    ${maximal85RenderMatrix(state, copy)}
    ${maximal85RenderHistogram(state, copy)}
    <div class="maximal85-analysis-grid">${maximal85RenderStack(state, copy)}${maximal85RenderTransition(state, copy)}${maximal85RenderGeometry(state, copy)}${maximal85RenderDecision(state, copy)}</div>
    ${note}
    ${maximal85RenderBest(state, copy)}
  </article>`;
}
