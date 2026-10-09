"use strict";

const KM1197_TEXT = Object.freeze({
  en: Object.freeze({
    kicker: "1197 · SHORTEST PATH WITH BFS", board: "Search window", boardHelp: "Numbers are minimum moves fixed at first discovery.",
    symmetry: "Symmetry reduction", original: "original target", normalized: "searched target", queue: "FIFO queue", queueHelp: "Front → back; BFS finishes one distance layer before the next.",
    emptyQueue: "Queue is empty", layers: "BFS layers", moves: "Eight knight moves", candidate: "Candidate gate", noCandidate: "Select a move to inspect its candidate.",
    current: "current", plus: "move", next: "candidate", checking: "checking", inBounds: "inside bounds", outOfBounds: "outside bounds", visited: "already visited",
    fresh: "new square", distanceSet: "distance fixed", parentSet: "parent recorded", enqueued: "enqueued", path: "Reconstructed shortest path", result: "minimum moves",
    compacted: "After the first three dequeues, repeated candidate checks are compacted; every BFS state is still computed.", window: "visible coordinates", legend: "Legend",
    start: "start", target: "target", frontier: "queued", explored: "visited", active: "active", route: "shortest path", none: "—",
  }),
  vi: Object.freeze({
    kicker: "1197 · ĐƯỜNG NGẮN NHẤT BẰNG BFS", board: "Vùng tìm kiếm", boardHelp: "Con số là số bước tối thiểu được chốt ở lần khám phá đầu tiên.",
    symmetry: "Rút gọn bằng đối xứng", original: "đích ban đầu", normalized: "đích thực sự tìm", queue: "Queue FIFO", queueHelp: "Đầu → cuối; BFS xử lý hết một lớp khoảng cách trước lớp tiếp theo.",
    emptyQueue: "Queue đang rỗng", layers: "Các lớp BFS", moves: "Tám nước đi của mã", candidate: "Cổng kiểm tra candidate", noCandidate: "Chọn một nước đi để xem candidate.",
    current: "ô hiện tại", plus: "nước đi", next: "candidate", checking: "đang kiểm tra", inBounds: "trong biên", outOfBounds: "ngoài biên", visited: "đã thăm",
    fresh: "ô mới", distanceSet: "đã chốt distance", parentSet: "đã lưu parent", enqueued: "đã vào queue", path: "Đường ngắn nhất đã dựng", result: "số bước tối thiểu",
    compacted: "Sau ba lần dequeue đầu, các kiểm tra candidate lặp lại được thu gọn; toàn bộ trạng thái BFS vẫn được tính.", window: "tọa độ đang hiển thị", legend: "Chú thích",
    start: "điểm đầu", target: "đích", frontier: "trong queue", explored: "đã thăm", active: "đang xử lý", route: "đường ngắn nhất", none: "—",
  }),
});

function km1197Escape(value) {
  return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function km1197Locale() { return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en"; }
function km1197Int(value, min = -1000, max = 1000) { return Number.isInteger(value) && value >= min && value <= max ? value : null; }
function km1197Point(raw, withDistance = false) {
  if (!raw || typeof raw !== "object") return null;
  const x = km1197Int(raw.x, -30, 30); const y = km1197Int(raw.y, -30, 30);
  if (x === null || y === null) return null;
  return { x, y, distance: withDistance ? km1197Int(raw.distance, 0, 100) : null };
}
function km1197Normalize(step) {
  const raw = step && step.knight1197View && typeof step.knight1197View === "object" ? step.knight1197View : {};
  const bounds = raw.bounds && typeof raw.bounds === "object" ? raw.bounds : {};
  const pointList = (value, max, path = false) => (Array.isArray(value) ? value : []).slice(0, max).map(item => {
    const point = km1197Point(item, !path);
    return point ? { ...point, step: path ? km1197Int(item.step, 0, 100) : null } : null;
  }).filter(Boolean);
  const candidate = km1197Point(raw.candidate, true);
  const allowedDecisions = new Set(["checking", "in-bounds", "out-of-bounds", "visited", "new", "distance-set", "parent-set", "enqueued"]);
  return {
    line: km1197Int(raw.line, 1, 33) || 1, source: typeof raw.source === "string" ? raw.source.slice(0, 240) : "",
    event: typeof raw.event === "string" ? raw.event.slice(0, 40) : "", phase: ["setup", "search", "found", "path", "done"].includes(raw.phase) ? raw.phase : "setup",
    originalTarget: km1197Point(raw.originalTarget) || { x: 0, y: 0 }, target: km1197Point(raw.target) || { x: 0, y: 0 },
    bounds: { minX: km1197Int(bounds.minX, -30, 30) ?? -2, maxX: km1197Int(bounds.maxX, -30, 30) ?? 2, minY: km1197Int(bounds.minY, -30, 30) ?? -2, maxY: km1197Int(bounds.maxY, -30, 30) ?? 2 },
    moves: (Array.isArray(raw.moves) ? raw.moves : []).slice(0, 8).map(move => ({ dx: km1197Int(move && move.dx, -2, 2) || 0, dy: km1197Int(move && move.dy, -2, 2) || 0 })),
    current: km1197Point(raw.current, true), candidate: candidate ? { ...candidate, dx: km1197Int(raw.candidate.dx, -2, 2) || 0, dy: km1197Int(raw.candidate.dy, -2, 2) || 0, decision: allowedDecisions.has(raw.candidate.decision) ? raw.candidate.decision : "checking" } : null,
    queue: pointList(raw.queue, 24), queueSize: km1197Int(raw.queueSize, 0, 10000) || 0, visited: pointList(raw.visited, 1000), path: pointList(raw.path, 100, true),
    answer: raw.answer === null ? null : km1197Int(raw.answer, 0, 100), popped: km1197Int(raw.popped, 0, 10000) || 0, traceCompacted: raw.traceCompacted === true,
    condition: raw.condition && typeof raw.condition.result === "boolean" ? { expression: String(raw.condition.expression || "").slice(0, 120), result: raw.condition.result } : null,
    final: Boolean(raw.final || (step && step.final)), title: typeof pick === "function" ? String(pick(step.title || "")) : "", note: typeof pick === "function" ? String(pick(step.note || "")) : "",
  };
}
function km1197Key(point) { return point ? `${point.x},${point.y}` : ""; }
function km1197DecisionLabel(decision, copy) {
  return ({ checking: copy.checking, "in-bounds": copy.inBounds, "out-of-bounds": copy.outOfBounds, visited: copy.visited, new: copy.fresh, "distance-set": copy.distanceSet, "parent-set": copy.parentSet, enqueued: copy.enqueued })[decision] || copy.checking;
}
function km1197Window(state) {
  const width = state.bounds.maxX - state.bounds.minX + 1; const height = state.bounds.maxY - state.bounds.minY + 1;
  if (width <= 13 && height <= 13) return { ...state.bounds };
  const focus = state.candidate || state.current || (state.final ? state.target : { x: 0, y: 0 });
  const span = 11;
  const clampStart = (center, min, max) => Math.max(min, Math.min(center - Math.floor(span / 2), max - span + 1));
  const minX = width <= span ? state.bounds.minX : clampStart(focus.x, state.bounds.minX, state.bounds.maxX);
  const minY = height <= span ? state.bounds.minY : clampStart(focus.y, state.bounds.minY, state.bounds.maxY);
  return { minX, maxX: width <= span ? state.bounds.maxX : minX + span - 1, minY, maxY: height <= span ? state.bounds.maxY : minY + span - 1 };
}
function km1197Board(state, copy) {
  const window = km1197Window(state); const visited = new Map(state.visited.map(point => [km1197Key(point), point.distance]));
  const frontier = new Set(state.queue.map(km1197Key)); const route = new Map(state.path.map(point => [km1197Key(point), point.step]));
  const cells = [];
  for (let y = window.maxY; y >= window.minY; y--) for (let x = window.minX; x <= window.maxX; x++) {
    const key = `${x},${y}`; const classes = ["km1197-cell"];
    if ((x + y) % 2 === 0) classes.push("is-dark");
    if (visited.has(key)) classes.push("is-visited"); if (frontier.has(key)) classes.push("is-frontier");
    if (route.has(key)) classes.push("is-path"); if (x === 0 && y === 0) classes.push("is-start");
    if (x === state.target.x && y === state.target.y) classes.push("is-target");
    if (state.current && x === state.current.x && y === state.current.y) classes.push("is-current");
    if (state.candidate && x === state.candidate.x && y === state.candidate.y) classes.push("is-candidate", `is-${state.candidate.decision}`);
    const value = route.has(key) ? route.get(key) : visited.has(key) ? visited.get(key) : "";
    cells.push(`<div class="${classes.join(" ")}" data-coordinate="${key}"><small>${x},${y}</small><b>${value}</b></div>`);
  }
  const columns = window.maxX - window.minX + 1;
  return `<section class="km1197-card km1197-board"><header><div><strong>${km1197Escape(copy.board)}</strong><small>${km1197Escape(copy.boardHelp)}</small></div><span>${km1197Escape(copy.window)}: x ${window.minX}…${window.maxX}, y ${window.minY}…${window.maxY}</span></header>
    <div class="km1197-board-scroll"><div class="km1197-grid" style="--km1197-columns:${columns}">${cells.join("")}</div></div>
    <div class="km1197-legend"><span class="start">${copy.start}</span><span class="target">${copy.target}</span><span class="frontier">${copy.frontier}</span><span class="explored">${copy.explored}</span><span class="active">${copy.active}</span><span class="route">${copy.route}</span></div></section>`;
}
function km1197Queue(state, copy) {
  const cards = state.queue.map((point, index) => `<li class="${index === 0 ? "is-front" : ""}"><small>${index === 0 ? "front" : `#${index + 1}`}</small><code>(${point.x},${point.y})</code><b>d=${point.distance}</b></li>`).join("");
  const omitted = Math.max(0, state.queueSize - state.queue.length);
  return `<section class="km1197-card km1197-queue"><header><div><strong>${copy.queue}</strong><small>${copy.queueHelp}</small></div><b>${state.queueSize}</b></header><ol>${cards || `<li class="is-empty">${copy.emptyQueue}</li>`}${omitted ? `<li class="is-more">+${omitted}</li>` : ""}</ol></section>`;
}
function km1197Layers(state, copy) {
  const counts = new Map(); state.visited.forEach(point => counts.set(point.distance, (counts.get(point.distance) || 0) + 1));
  const active = state.current ? state.current.distance : null;
  return `<section class="km1197-card km1197-layers"><header><strong>${copy.layers}</strong><span>${state.visited.length} cells · ${state.popped} dequeued</span></header><div>${[...counts].sort((a,b) => a[0]-b[0]).map(([distance,count]) => `<span class="${distance === active ? "is-active" : distance < active ? "is-done" : ""}"><small>d=${distance}</small><b>${count}</b></span>`).join("")}</div></section>`;
}
function km1197Candidate(state, copy) {
  const activeDx = state.candidate ? state.candidate.dx : null; const activeDy = state.candidate ? state.candidate.dy : null;
  const moves = state.moves.map(move => `<span class="${move.dx === activeDx && move.dy === activeDy ? "is-active" : ""}">(${move.dx > 0 ? "+" : ""}${move.dx},${move.dy > 0 ? "+" : ""}${move.dy})</span>`).join("");
  let equation = `<p>${copy.noCandidate}</p>`;
  if (state.candidate && state.current) equation = `<div class="km1197-equation"><div><small>${copy.current}</small><code>(${state.current.x},${state.current.y})</code></div><b>+</b><div><small>${copy.plus}</small><code>(${state.candidate.dx},${state.candidate.dy})</code></div><b>=</b><div><small>${copy.next}</small><code>(${state.candidate.x},${state.candidate.y})</code></div><strong class="is-${state.candidate.decision}">${km1197Escape(km1197DecisionLabel(state.candidate.decision, copy))}</strong></div>`;
  return `<section class="km1197-card km1197-candidate"><header><strong>${copy.candidate}</strong><span>${copy.moves}</span></header><div class="km1197-moves">${moves}</div>${equation}</section>`;
}
function km1197Path(state, copy) {
  if (!state.path.length) return "";
  const nodes = state.path.map((point, index) => `<span><small>${index}</small><code>(${point.x},${point.y})</code></span>${index < state.path.length - 1 ? "<i>→</i>" : ""}`).join("");
  return `<section class="km1197-card km1197-path"><header><strong>${copy.path}</strong><span>${copy.result}: <b>${state.answer == null ? Math.max(0, state.path.length - 1) : state.answer}</b></span></header><div>${nodes}</div></section>`;
}
function renderMinimumKnightMoves1197View(step) {
  const state = km1197Normalize(step); const copy = KM1197_TEXT[km1197Locale()]; const root = $("treeView");
  const condition = state.condition ? `<span class="km1197-condition ${state.condition.result ? "is-true" : "is-false"}"><code>${km1197Escape(state.condition.expression)}</code><b>${state.condition.result ? "TRUE" : "FALSE"}</b></span>` : "";
  root.innerHTML = `<section class="km1197-viz" role="img" aria-label="Minimum Knight Moves BFS visualization">
    <header class="km1197-heading"><div><small>${copy.kicker}</small><h3>${km1197Escape(state.title)}</h3></div><span>LINE ${state.line} · ${state.phase.toUpperCase()}</span></header>
    <section class="km1197-symmetry"><div><small>${copy.original}</small><code>(${state.originalTarget.x}, ${state.originalTarget.y})</code></div><b>│x│, │y│ →</b><div><small>${copy.normalized}</small><code>(${state.target.x}, ${state.target.y})</code></div></section>
    <section class="km1197-action"><div><code>${km1197Escape(state.source.trim())}</code>${condition}</div><p>${km1197Escape(state.note)}</p></section>
    ${km1197Layers(state, copy)}
    <div class="km1197-main">${km1197Board(state, copy)}<div>${km1197Candidate(state, copy)}${km1197Queue(state, copy)}</div></div>
    ${km1197Path(state, copy)}
    ${state.traceCompacted && !state.final ? `<p class="km1197-compacted">${copy.compacted}</p>` : ""}
  </section>`;
}
