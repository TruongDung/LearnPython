"use strict";

// LeetCode 1970 — Last Day Where You Can Still Cross. Picture-first renderer for the reverse union-find: a day
// timeline that runs backward, the land/water grid with union-find components colored by root, parent arrows, the
// virtual TOP / BOTTOM nodes drawn as bars, and the crossing path once TOP and BOTTOM share a root. The Python source
// is shown once, in the shared #codePanel (highlighted by script.js from step.codeLines); locals are shown once, in the
// shared Variables panel.

const LC1970_LINE_COUNT = 31;

// Preset inputs: [input, Vietnamese label, English label]. The first preset is the default input.
const LC1970_CASES = Object.freeze([
  ["3,3 | 1,2;2,1;3,3;2,2;1,1;1,3;2,3;3,2;3,1", "Ví dụ", "Example"],
  ["2,2 | 1,1;2,1;1,2;2,2", "Ngắn", "Short"],
  ["2,2 | 1,1;1,2;2,1;2,2", "Ngày 1", "Day 1"],
  ["3,5 | 2,3;1,1;3,5;2,1;2,5;1,3;3,1;2,2;2,4;1,2;3,3;1,4;1,5;3,2;3,4", "Rộng", "Wide"],
  ["4,4 | 2,2;3,3;1,4;4,1;2,3;3,2;1,1;4,4;2,4;3,1;1,2;4,3;2,1;3,4;1,3;4,2", "Lớn", "Bigger"],
]);

const LC1970_COPY = Object.freeze({
  vi: Object.freeze({
    picture: "Lưới, ngày và Union-Find",
    code: "Dòng đang chạy",
    examples: "Ví dụ",
    back: "← ngược thời gian",
    day: "ngày",
    grid: "Lưới",
    answer: "Đáp án: ngày",
    jumps: [["line", "Dòng →"], ["day", "Ngày →"], ["result", "Kết quả ↠"]],
    legend: { water: "nước", land: "đất", top: "TOP", bottom: "BOTTOM", link: "→ cha", route: "đường qua", ids: "số giữa = ngày ngập · góc = mã ô" },
  }),
  en: Object.freeze({
    picture: "Grid, days and union-find",
    code: "Current line",
    examples: "Examples",
    back: "← back in time",
    day: "day",
    grid: "grid",
    answer: "Answer: day",
    jumps: [["line", "Line →"], ["day", "Next day →"], ["result", "Result ↠"]],
    legend: { water: "water", land: "land", top: "TOP", bottom: "BOTTOM", link: "→ parent", route: "crossing path", ids: "middle = flood day · corner = cell id" },
  }),
});

const LC1970_EVENTS = new Set([
  "import", "class", "call", "top-bottom", "parent", "land", "def-find", "def-union", "find-call", "find-check", "halve", "up",
  "find-return", "union-call", "link-start", "link", "for-day", "cell-rc", "to-land", "cell-id", "top-check", "join-top",
  "bottom-check", "join-bottom", "for-dir", "neighbor", "nb-check", "join-nb", "for-dir-done", "cross-start", "cross-check", "return",
]);
const LC1970_BRANCH_EVENTS = new Set(["find-check", "top-check", "bottom-check", "nb-check", "cross-check"]);

function lc1970Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function lc1970IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function lc1970Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function lc1970Ints(value, minimum, maximum, length) {
  return Array.isArray(value) && value.length === length && value.every((v) => lc1970Int(v, minimum, maximum) !== null) ? value.slice() : null;
}

// Validates the builder's view model so malformed data never reaches innerHTML unescaped.
function lc1970Normalize(step) {
  const raw = step && step.cross1970View && typeof step.cross1970View === "object" ? step.cross1970View : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = lc1970Int(raw.line, 1, LC1970_LINE_COUNT) ?? lc1970Int(fallbackLine, 1, LC1970_LINE_COUNT) ?? 1;
  const event = typeof raw.event === "string" && LC1970_EVENTS.has(raw.event) ? raw.event : "";
  let row = lc1970Int(raw.row, 2, 6);
  let col = lc1970Int(raw.col, 2, 6);
  if (row === null || col === null || row * col > 24) {
    row = 2;
    col = 2;
  }
  const n = row * col;
  const node = (value) => lc1970Int(value, 0, n + 1);
  const cellId = (value) => lc1970Int(value, 0, n - 1);
  const cells = Array.isArray(raw.cells) && raw.cells.length === n
    && raw.cells.every((cell) => Array.isArray(cell) && cell.length === 2 && lc1970Int(cell[0], 1, row) !== null && lc1970Int(cell[1], 1, col) !== null)
    ? raw.cells.map((cell) => cell.slice()) : null;
  const dayOf = lc1970Ints(raw.dayOf, 1, n, n);
  const land = Array.isArray(raw.land) && raw.land.length === n && raw.land.every((v) => typeof v === "boolean") ? raw.land.slice() : new Array(n).fill(false);
  const parent = lc1970Ints(raw.parent, 0, n + 1, n + 2);
  const roots = Array.isArray(raw.roots) && raw.roots.length === n && raw.roots.every((v) => v === null || node(v) !== null)
    ? raw.roots.slice() : new Array(n).fill(null);
  const walk = Array.isArray(raw.walk) && raw.walk.length <= 2 * n + 4 && raw.walk.every((v) => node(v) !== null) ? raw.walk.slice() : [];
  const route = Array.isArray(raw.route) && raw.route.length <= n && raw.route.every((v) => cellId(v) !== null) ? raw.route.slice() : null;
  const linked = Array.isArray(raw.linked) && raw.linked.length === 2 && raw.linked.every((v) => node(v) !== null) ? raw.linked.slice() : null;
  const dir = Array.isArray(raw.dir) && raw.dir.length === 2 && raw.dir.every((v) => lc1970Int(v, -1, 1) !== null) ? raw.dir.slice() : null;
  const finalFlag = raw.final === true || Boolean(step && step.final);
  const crossed = raw.crossed === true;
  return {
    line,
    event,
    condition: typeof raw.condition === "boolean" ? raw.condition : null,
    row,
    col,
    n,
    cells,
    dayOf,
    curDay: lc1970Int(raw.curDay, 0, n - 1),
    land,
    parent,
    roots,
    cur: cellId(raw.cur),
    nb: cellId(raw.nb),
    nbState: raw.nbState === "out" || raw.nbState === "water" || raw.nbState === "land" ? raw.nbState : null,
    dir,
    walk,
    x: node(raw.x),
    a: node(raw.a),
    b: node(raw.b),
    linked,
    rootTop: node(raw.rootTop),
    rootBottom: node(raw.rootBottom),
    crossed,
    route: crossed ? route : null,
    answer: finalFlag ? lc1970Int(raw.answer, 0, n) : null,
    final: finalFlag,
  };
}

// ---------- Picture ----------

const LC1970_PAD_L = 34;
const LC1970_PAD_R = 10;
const LC1970_CAP_BASE = 11;
const LC1970_MARK_BASE = 27;
const LC1970_BOX_Y = 32;
const LC1970_BOX_H = 22;
const LC1970_TOP_Y = 66;
const LC1970_BAR_H = 20;
const LC1970_GRID_Y = 96;
const LC1970_CELL = 44;
const LC1970_INSET = 2;
const LC1970_BAR_GAP = 10;
const LC1970_SHORTEN = 15;
const LC1970_BAR_SHIFT = 10;

function lc1970Layout(state) {
  const box = Math.min(32, Math.floor(440 / state.n));
  const gridW = state.col * LC1970_CELL;
  const content = Math.max(gridW, state.n * box);
  const gridX = LC1970_PAD_L + Math.floor((content - gridW) / 2);
  const gridBottom = LC1970_GRID_Y + state.row * LC1970_CELL;
  const bottomY = gridBottom + LC1970_BAR_GAP;
  return {
    box,
    gridX,
    gridW,
    bottomY,
    width: LC1970_PAD_L + content + LC1970_PAD_R,
    height: bottomY + LC1970_BAR_H + 6,
  };
}

function lc1970Center(L, state, id) {
  const r = Math.floor(id / state.col);
  const c = id % state.col;
  return { x: L.gridX + c * LC1970_CELL + LC1970_CELL / 2, y: LC1970_GRID_Y + r * LC1970_CELL + LC1970_CELL / 2 };
}

const lc1970Round = (value) => Math.round(value * 10) / 10;

// Endpoints of the parent arrow from node i to node j (cells, or the TOP / BOTTOM bars).
function lc1970Arrow(L, state, i, j) {
  const isBar = (k) => k >= state.n;
  const barEdge = (k) => (k === state.n ? LC1970_TOP_Y + LC1970_BAR_H : L.bottomY);
  if (isBar(i) && isBar(j)) {
    const left = L.gridX + LC1970_INSET;
    const rail = L.gridX - 14;
    const yi = i === state.n ? LC1970_TOP_Y + LC1970_BAR_H / 2 : L.bottomY + LC1970_BAR_H / 2;
    const yj = j === state.n ? LC1970_TOP_Y + LC1970_BAR_H / 2 : L.bottomY + LC1970_BAR_H / 2;
    return { path: `M${left} ${yi} H${rail} V${yj} H${left - 1}` };
  }
  if (!isBar(i) && !isBar(j)) {
    const p = lc1970Center(L, state, i);
    const q = lc1970Center(L, state, j);
    const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    const ux = (q.x - p.x) / len;
    const uy = (q.y - p.y) / len;
    return { x1: p.x + ux * LC1970_SHORTEN, y1: p.y + uy * LC1970_SHORTEN, x2: q.x - ux * LC1970_SHORTEN, y2: q.y - uy * LC1970_SHORTEN };
  }
  // Cell ↔ bar: a vertical arrow shifted right of the cell labels, from the cell to the bar edge (or back).
  const cell = isBar(i) ? j : i;
  const bar = isBar(i) ? i : j;
  const center = lc1970Center(L, state, cell);
  const x = center.x + LC1970_BAR_SHIFT;
  const towardTop = bar === state.n;
  const cellY = center.y + (towardTop ? -LC1970_SHORTEN : LC1970_SHORTEN);
  const edge = barEdge(bar) + (towardTop ? 1 : -1);
  return isBar(i) ? { x1: x, y1: edge, x2: x, y2: cellY } : { x1: x, y1: cellY, x2: x, y2: edge };
}

function lc1970NewArrow(state) {
  if (!state.parent) return null;
  if (state.event === "halve" && state.x !== null) return state.x;
  if (state.event === "link" && state.linked && state.linked[0] !== state.linked[1]) return state.linked[0];
  return null;
}

function lc1970Picture(state, copy) {
  const L = lc1970Layout(state);
  const parts = [];
  const n = state.n;
  const started = state.curDay !== null;
  const walkSet = new Set(state.walk);
  const routeSet = new Set(state.route || []);
  const showNb = state.nb !== null && (state.line === 27 || state.line === 28 || state.line === 29);

  parts.push('<defs>'
    + '<marker id="lc1970-head" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path class="lc1970-head" d="M0,0 L8,4 L0,8 z"/></marker>'
    + '<marker id="lc1970-head-new" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path class="lc1970-head is-new" d="M0,0 L8,4 L0,8 z"/></marker>'
    + '<marker id="lc1970-head-walk" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path class="lc1970-head is-walk" d="M0,0 L8,4 L0,8 z"/></marker>'
    + "</defs>");

  // (a) Timeline: one box per day; days after the current one are already restored (time runs backward).
  parts.push(`<text class="lc1970-caption" x="${LC1970_PAD_L}" y="${LC1970_CAP_BASE}">${lc1970Escape(copy.back)}</text>`);
  for (let d = 1; d <= n; d++) {
    const x = LC1970_PAD_L + (d - 1) * L.box + 1.5;
    const w = L.box - 3;
    let cls;
    if (!started || d <= state.curDay) cls = " is-water";
    else if (d === state.curDay + 1) cls = " is-cur";
    else cls = " is-back";
    if (state.final && state.answer === d) cls += " is-answer";
    parts.push(`<rect class="lc1970-daybox${cls}" data-day="${d}" x="${x}" y="${LC1970_BOX_Y}" width="${w}" height="${LC1970_BOX_H}" rx="4"/>`);
    parts.push(`<text class="lc1970-day-label${cls}" x="${x + w / 2}" y="${LC1970_BOX_Y + 15}">${d}</text>`);
    if (state.final && state.answer === d) {
      parts.push(`<text class="lc1970-answer-mark" x="${x + w / 2}" y="${LC1970_MARK_BASE}">✓</text>`);
    }
  }

  // (b) TOP and BOTTOM bars (virtual nodes n and n + 1).
  const barCls = (k) => `${walkSet.has(k) ? " is-walk" : ""}${state.x === k ? " is-x" : ""}${state.crossed ? " is-crossed" : ""}`;
  const barX = L.gridX + LC1970_INSET;
  const barW = L.gridW - 2 * LC1970_INSET;
  parts.push(`<rect class="lc1970-bar is-top${barCls(n)}" data-node="${n}" x="${barX}" y="${LC1970_TOP_Y}" width="${barW}" height="${LC1970_BAR_H}" rx="5"/>`);
  parts.push(`<text class="lc1970-bar-label is-top" x="${barX + barW / 2}" y="${LC1970_TOP_Y + 14}">TOP · ${n}</text>`);
  parts.push(`<rect class="lc1970-bar is-bottom${barCls(n + 1)}" data-node="${n + 1}" x="${barX}" y="${L.bottomY}" width="${barW}" height="${LC1970_BAR_H}" rx="5"/>`);
  parts.push(`<text class="lc1970-bar-label is-bottom" x="${barX + barW / 2}" y="${L.bottomY + 14}">BOTTOM · ${n + 1}</text>`);

  // (c) Grid cells, colored by component root; TOP's component wins once TOP and BOTTOM are joined.
  const cellText = [];
  for (let id = 0; id < n; id++) {
    const r = Math.floor(id / state.col);
    const c = id % state.col;
    const x = L.gridX + c * LC1970_CELL + LC1970_INSET;
    const y = LC1970_GRID_Y + r * LC1970_CELL + LC1970_INSET;
    const size = LC1970_CELL - 2 * LC1970_INSET;
    const root = state.roots[id];
    let fill;
    if (!state.land[id] || root === null) fill = " is-water";
    else if (root === state.rootTop) fill = " is-land is-top-comp";
    else if (root === state.rootBottom) fill = " is-land is-bottom-comp";
    else fill = ` is-land is-comp-${root % 4}`;
    const outline = `${id === state.cur && started ? " is-cur" : ""}${showNb && id === state.nb ? " is-nb" : ""}${walkSet.has(id) ? " is-walk" : ""}${state.x === id ? " is-x" : ""}${routeSet.has(id) ? " is-route" : ""}`;
    parts.push(`<rect class="lc1970-cell${fill}${outline}" data-cell="${id}" x="${x}" y="${y}" width="${size}" height="${size}" rx="6"/>`);
    const day = state.dayOf ? state.dayOf[id] : "";
    cellText.push(`<text class="lc1970-cell-id${fill}" x="${x + size / 2}" y="${y + 11}">${id}</text>`);
    cellText.push(`<text class="lc1970-cell-label${fill}" x="${x + size / 2}" y="${y + 30}">${day}</text>`);
  }

  // (d) Parent arrows: every node whose parent is not itself. Drawn before the labels; labels carry a halo.
  if (state.parent) {
    const fresh = lc1970NewArrow(state);
    const walkEdge = new Set();
    for (let k = 0; k + 1 < state.walk.length; k++) walkEdge.add(`${state.walk[k]}>${state.walk[k + 1]}`);
    state.parent.forEach((p, i) => {
      if (p === i) return;
      const isNew = fresh === i;
      const isWalk = walkEdge.has(`${i}>${p}`);
      const cls = `${isNew ? " is-new" : ""}${isWalk && !isNew ? " is-walk" : ""}`;
      const marker = isNew ? "lc1970-head-new" : isWalk ? "lc1970-head-walk" : "lc1970-head";
      const g = lc1970Arrow(L, state, i, p);
      if (g.path) {
        parts.push(`<path class="lc1970-link is-bars${cls}" data-from="${i}" data-to="${p}" d="${g.path}" marker-end="url(#${marker})"/>`);
      } else {
        parts.push(`<line class="lc1970-link${cls}" data-from="${i}" data-to="${p}" x1="${lc1970Round(g.x1)}" y1="${lc1970Round(g.y1)}" x2="${lc1970Round(g.x2)}" y2="${lc1970Round(g.y2)}" marker-end="url(#${marker})"/>`);
      }
    });
  }
  parts.push(...cellText);

  const label = state.final && state.answer !== null
    ? `${copy.answer} ${state.answer}`
    : lc1970IsVi() ? `${copy.grid} ${state.row}×${state.col}, ${copy.day} ${started ? state.curDay : n}`
      : `${state.row}×${state.col} ${copy.grid}, ${copy.day} ${started ? state.curDay : n}`;
  return `<svg class="lc1970-svg" width="${L.width}" height="${L.height}" viewBox="0 0 ${L.width} ${L.height}" role="img" aria-label="${lc1970Escape(label)}">${parts.join("")}</svg>`;
}

// ---------- Current-line strip (source lives in the shared #codePanel) ----------

function lc1970Effect(state) {
  const n = state.n;
  const r = state.cur !== null ? Math.floor(state.cur / state.col) : null;
  const c = state.cur !== null ? state.cur % state.col : null;
  const nr = r !== null && state.dir ? r + state.dir[0] : null;
  const nc = c !== null && state.dir ? c + state.dir[1] : null;
  const px = state.parent && state.x !== null ? state.parent[state.x] : null;
  switch (state.event) {
    case "import": return "List";
    case "class": return "Solution";
    case "call": return `row, col = ${state.row}, ${state.col}`;
    case "top-bottom": return `top, bottom = ${n}, ${n + 1}`;
    case "parent": return `parent = [0 … ${n + 1}]`;
    case "land": return `land = ${state.row}×${state.col} False`;
    case "def-find": return "find";
    case "def-union": return "union";
    case "find-call":
    case "up": return state.x !== null ? `x = ${state.x}` : "";
    case "find-check": return px !== null ? `${px} != ${state.x}` : "";
    case "halve": return px !== null ? `parent[${state.x}] = ${px}` : "";
    case "find-return": return state.x !== null ? `return ${state.x}` : "";
    case "union-call": return state.a !== null && state.b !== null ? `a, b = ${state.a}, ${state.b}` : "";
    case "link-start": return state.a !== null && state.b !== null ? `find(${state.b}), find(${state.a})` : "";
    case "link": return state.linked ? `parent[${state.linked[0]}] = ${state.linked[1]}` : "";
    case "for-day": return state.curDay !== null ? `day = ${state.curDay}` : "";
    case "cell-rc": return r !== null ? `r, c = ${r}, ${c}` : "";
    case "to-land": return r !== null ? `land[${r}][${c}] = True` : "";
    case "cell-id": return state.cur !== null ? `cell = ${state.cur}` : "";
    case "top-check": return r !== null ? `${r} == 0` : "";
    case "bottom-check": return r !== null ? `${r} == ${state.row - 1}` : "";
    case "join-top": return state.cur !== null ? `union(${state.cur}, ${n})` : "";
    case "join-bottom": return state.cur !== null ? `union(${state.cur}, ${n + 1})` : "";
    case "for-dir": return state.dir ? `dr, dc = ${state.dir[0]}, ${state.dir[1]}` : "";
    case "neighbor": return nr !== null ? `nr, nc = ${nr}, ${nc}` : "";
    case "nb-check":
      if (state.nbState === "out") return lc1970IsVi() ? `(${nr}, ${nc}) ngoài lưới` : `(${nr}, ${nc}) outside the grid`;
      return nr !== null ? `land[${nr}][${nc}]` : "";
    case "join-nb": return state.cur !== null && state.nb !== null ? `union(${state.cur}, ${state.nb})` : "";
    case "for-dir-done": return "StopIteration";
    case "cross-start": return `find(${n}) == find(${n + 1})`;
    case "cross-check": return state.rootTop !== null && state.rootBottom !== null ? `${state.rootTop} == ${state.rootBottom}` : "";
    case "return": return state.answer !== null ? `return ${state.answer}` : "";
    default: return "";
  }
}

function lc1970Code(state, copy) {
  const effect = lc1970Effect(state);
  const badge = state.condition !== null && LC1970_BRANCH_EVENTS.has(state.event)
    ? `<b class="lc1970-branch${state.condition ? " is-true" : " is-false"}">${state.condition ? "True" : "False"}</b>`
    : "";
  return `<header><b>${lc1970Escape(copy.code)}</b></header><div class="lc1970-now" data-code-line="${state.line}" aria-current="step"><span class="lc1970-lineno">L${state.line}</span>${effect ? `<code class="lc1970-effect">↳ ${lc1970Escape(effect)}</code>` : ""}${badge}</div>`;
}

// ---------- Navigation (same contract as other line-by-line renderers) ----------

function lc1970Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  return steps.findIndex((step, index) => {
    const view = step && step.cross1970View;
    if (index <= stepIndex || !view) return false;
    if (kind === "line") return true;
    if (kind === "day") return view.event === "for-day";
    if (kind === "result") return Boolean(step.final);
    return false;
  });
}

function lc1970Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function lc1970Bind(host) {
  if (!host || typeof host.querySelectorAll !== "function") return;
  const bind = (selector, handler) => host.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("click", () => handler(element));
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        handler(element);
      }
    });
  });
  bind("[data-lc1970-jump]", (element) => lc1970Go(lc1970Next(element.dataset.lc1970Jump)));
  bind("[data-lc1970-case]", (element) => {
    const preset = LC1970_CASES[Number(element.dataset.lc1970Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    if (typeof runViz === "function") runViz();
  });
}

function renderLastDayCross1970View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const vi = lc1970IsVi();
  const copy = LC1970_COPY[vi ? "vi" : "en"];
  const state = lc1970Normalize(step);
  const heading = state.final && state.answer !== null ? `return ${state.answer}` : `latestDayToCross(${state.row}, ${state.col}, cells)`;
  const status = state.crossed ? "TOP ↔ BOTTOM ✓" : state.curDay !== null ? `${copy.day} ${state.curDay}` : `${copy.day} —`;
  const presets = LC1970_CASES.map((preset, index) => `<button type="button" data-lc1970-case="${index}">${lc1970Escape(vi ? preset[1] : preset[2])}</button>`).join("");
  const jumps = copy.jumps.map(([kind, label]) => `<button type="button" data-lc1970-jump="${kind}"${lc1970Next(kind) < 0 ? " disabled" : ""}>${lc1970Escape(label)}</button>`).join("");
  const G = copy.legend;
  const legend = `<div class="lc1970-legend" aria-hidden="true">`
    + `<span class="lg-water"><i></i>${lc1970Escape(G.water)}</span>`
    + `<span class="lg-land"><i></i>${lc1970Escape(G.land)}</span>`
    + `<span class="lg-top"><i></i>${lc1970Escape(G.top)}</span>`
    + `<span class="lg-bottom"><i></i>${lc1970Escape(G.bottom)}</span>`
    + `<span class="lg-link">${lc1970Escape(G.link)}</span>`
    + `<span class="lg-route"><i></i>${lc1970Escape(G.route)}</span>`
    + `<span class="lg-ids">${lc1970Escape(G.ids)}</span></div>`;

  host.innerHTML = `<article class="lc1970-viz${state.final ? " is-final" : ""}${state.crossed ? " is-crossed" : ""}" data-problem-id="1970" data-source-line="${state.line}" role="region" aria-label="LeetCode 1970 · ${vi ? "dòng" : "line"} ${state.line}">`
    + `<header class="lc1970-head"><div><small>LEETCODE 1970 · LAST DAY TO CROSS</small><h2><code>${lc1970Escape(heading)}</code></h2></div><span class="lc1970-status">${lc1970Escape(status)}</span></header>`
    + `<nav class="lc1970-presets" aria-label="${lc1970Escape(copy.examples)}">${presets}</nav>`
    + `<section class="lc1970-card lc1970-picture-card" aria-label="${lc1970Escape(copy.picture)}"><header><b>${lc1970Escape(copy.picture)}</b></header>${lc1970Picture(state, copy)}${legend}</section>`
    + `<section class="lc1970-card lc1970-code-card" aria-label="${lc1970Escape(copy.code)}">${lc1970Code(state, copy)}</section>`
    + `<footer class="lc1970-foot">${jumps}</footer></article>`;
  lc1970Bind(host);
}
