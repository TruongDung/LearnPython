"use strict";

// LeetCode 3420 — Count Non-Decreasing Subarrays After K Operations. Picture-first renderer on one index axis:
// nums as bars, the shaded fill-up (cost) raising lower bars to their group's level, the window [i, j] under the
// cells, the deque of [level, count] groups as chips below their columns, a k budget meter and the running count.
// The Python source is shown once, in the shared #codePanel, highlighted by script.js from step.codeLines.

const ND3420_LINE_COUNT = 23;

// Preset inputs: [nums, k, Vietnamese label, English label]. The first preset is the default input.
const ND3420_CASES = Object.freeze([
  ["4,1,5,2,6,3,7,1", 5, "Ví dụ", "Example"],
  ["3,1,2", 1, "Ngắn", "Short"],
  ["6,3,1,2,4,4", 7, "LeetCode 1", "LeetCode 1"],
  ["6,3,1,3,6", 4, "LeetCode 2", "LeetCode 2"],
  ["1,2,3,4", 1, "Đã tăng", "Already sorted"],
]);

const ND3420_COPY = Object.freeze({
  vi: Object.freeze({
    picture: "Cột = nums, phần tô = cost",
    code: "Dòng đang chạy",
    examples: "Ví dụ",
    nums: "số",
    answer: "Kết quả",
    budget: "Ngân sách k",
    count: "Số đoạn",
    jumps: [["line", "Dòng →"], ["loop", "i kế →"], ["result", "Kết quả ↠"]],
    legend: { bar: "▮ nums", fill: "▨ tô thêm = cost", level: "━ mức nhóm", win: "▬ cửa sổ [i, j]" },
  }),
  en: Object.freeze({
    picture: "Bars = nums, shading = cost",
    code: "Current line",
    examples: "Examples",
    nums: "nums",
    answer: "Answer",
    budget: "Budget k",
    count: "Subarrays",
    jumps: [["line", "Line →"], ["loop", "Next i →"], ["result", "Result ↠"]],
    legend: { bar: "▮ nums", fill: "▨ fill-up = cost", level: "━ group level", win: "▬ window [i, j]" },
  }),
});

function nd3420Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nd3420IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function nd3420Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

// Validates the builder's view model so malformed data never reaches innerHTML unescaped.
function nd3420Normalize(step) {
  const raw = step && step.nonDec3420View && typeof step.nonDec3420View === "object" ? step.nonDec3420View : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = nd3420Int(raw.line, 1, ND3420_LINE_COUNT) ?? nd3420Int(fallbackLine, 1, ND3420_LINE_COUNT) ?? 1;
  const event = typeof raw.event === "string" && /^[a-z-]{1,24}$/.test(raw.event) ? raw.event : "";
  const nums = Array.isArray(raw.nums) && raw.nums.length <= 16 && raw.nums.every((v) => nd3420Int(v, 0, 999) !== null) ? raw.nums.slice() : [];
  const n = nums.length;
  const index = (value) => nd3420Int(value, 0, Math.max(0, n - 1));
  const lvl = Array.isArray(raw.lvl) && raw.lvl.length === n
    ? raw.lvl.map((v, t) => (nd3420Int(v, nums[t], 999) === null ? null : v))
    : new Array(n).fill(null);
  const dq = Array.isArray(raw.dq)
    ? raw.dq.filter((g) => Array.isArray(g) && nd3420Int(g[0], 0, 999) !== null && nd3420Int(g[1], 0, 16) !== null).map((g) => [g[0], g[1]])
    : null;
  const spans = (Array.isArray(raw.spans) ? raw.spans.slice(0, 32) : []).flatMap((s) => {
    const kind = s && ["pending", "popped", "group"].includes(s.kind) ? s.kind : null;
    const level = nd3420Int(s && s.level, 0, 999);
    const count = nd3420Int(s && s.count, 0, 16);
    const start = nd3420Int(s && s.start, 0, n);
    if (!kind || level === null || count === null || start === null || start + Math.max(count, 1) > n) return [];
    return [{ kind, level, count, start }];
  });
  const finalFlag = raw.final === true || Boolean(step && step.final);
  return {
    line,
    event,
    condition: typeof raw.condition === "boolean" ? raw.condition : null,
    nums,
    n,
    k: nd3420Int(raw.k, 1, 99999) ?? 1,
    i: index(raw.i),
    j: index(raw.j),
    cost: nd3420Int(raw.cost, 0, 99999),
    ans: nd3420Int(raw.ans, 0, 99999),
    dq,
    lvl,
    spans,
    delta: nd3420Int(raw.delta, -99999, 99999),
    added: nd3420Int(raw.added, 0, 99),
    peakCost: nd3420Int(raw.peakCost, 0, 99999) ?? 0,
    maxVal: nd3420Int(raw.maxVal, 1, 999) ?? Math.max(1, ...nums),
    answer: finalFlag ? nd3420Int(raw.answer, 0, 99999) : null,
    final: finalFlag,
  };
}

// ---------- Picture: one shared index axis ----------

const ND3420_PAD_L = 40;
const ND3420_PAD_R = 16;
const ND3420_TOP = 8;
const ND3420_CHART_H = 130;
const ND3420_CELL_H = 22;
const ND3420_WIN_H = 5;
const ND3420_CHIP_H = 22;
const ND3420_MAX_W = 420;

const nd3420N = (value) => Math.round(value * 100) / 100;

function nd3420Layout(state) {
  const unit = Math.max(34, Math.min(44, Math.floor(ND3420_MAX_W / Math.max(1, state.n))));
  const unitH = Math.min(14, ND3420_CHART_H / Math.max(1, state.maxVal));
  const x = (t) => ND3420_PAD_L + t * unit;
  const base = nd3420N(ND3420_TOP + state.maxVal * unitH);
  const cellTop = base + 6;
  const winTop = cellTop + ND3420_CELL_H + 4;
  const ijY = winTop + ND3420_WIN_H + 13;
  const chipTop = ijY + 6;
  const y = (value) => nd3420N(base - value * unitH);
  return { unit, unitH, x, y, base, cellTop, winTop, ijY, chipTop, width: x(state.n) + ND3420_PAD_R, height: chipTop + ND3420_CHIP_H + 6 };
}

function nd3420Picture(state, copy) {
  if (!state.n) return "";
  const L = nd3420Layout(state);
  const { unit, x, y } = L;
  const parts = [];
  const role = (t) => `${t === state.i ? " is-i" : ""}${t === state.j ? " is-j" : ""}`;

  // (a) Bars, then the shaded fill-up above each raised bar (its area is the cost).
  state.nums.forEach((value, t) => {
    const inWin = state.lvl[t] !== null;
    parts.push(`<rect class="nd3420-bar ${inWin ? "is-in" : "is-out"}${role(t)}" data-bar="${t}" x="${x(t) + 4}" y="${y(value)}" width="${unit - 8}" height="${nd3420N(L.base - y(value))}" rx="2"/>`);
  });
  state.nums.forEach((value, t) => {
    const top = state.lvl[t];
    if (top === null || top <= value) return;
    parts.push(`<rect class="nd3420-fill" data-fill="${t}" x="${x(t) + 4}" y="${y(top)}" width="${unit - 8}" height="${nd3420N(y(value) - y(top))}"/>`);
  });
  // Level lines: one per group across its columns.
  state.spans.forEach((span, s) => {
    if (span.count < 1) return;
    parts.push(`<line class="nd3420-level is-${span.kind}" data-level="${s}" x1="${x(span.start) + 2}" y1="${y(span.level)}" x2="${x(span.start + span.count) - 2}" y2="${y(span.level)}"/>`);
  });

  // (b) Axis.
  parts.push(`<line class="nd3420-axis" x1="${ND3420_PAD_L}" y1="${L.base}" x2="${x(state.n)}" y2="${L.base}"/>`);

  // (c) nums cells.
  parts.push(`<text class="nd3420-row-label" x="${ND3420_PAD_L - 6}" y="${L.cellTop + 15}">nums</text>`);
  state.nums.forEach((value, t) => {
    const inWin = state.lvl[t] !== null;
    parts.push(`<rect class="nd3420-cell ${inWin ? "is-in" : "is-out"}${role(t)}" data-cell="${t}" x="${x(t) + 1}" y="${L.cellTop}" width="${unit - 2}" height="${ND3420_CELL_H}" rx="4"/>`);
    parts.push(`<text class="nd3420-cell-value${role(t)}" x="${x(t) + unit / 2}" y="${L.cellTop + 15}">${value}</text>`);
  });

  // (d) Window bracket [i, j] and the i / j markers.
  if (state.i !== null && state.j !== null && state.i <= state.j) {
    parts.push(`<rect class="nd3420-window" x="${x(state.i) + 2}" y="${L.winTop}" width="${(state.j - state.i + 1) * unit - 4}" height="${ND3420_WIN_H}" rx="2"/>`);
  }
  if (state.i !== null && state.i === state.j) {
    parts.push(`<text class="nd3420-ij is-i" x="${x(state.i) + unit / 2}" y="${L.ijY}">i=j</text>`);
  } else {
    if (state.i !== null) parts.push(`<text class="nd3420-ij is-i" x="${x(state.i) + unit / 2}" y="${L.ijY}">i</text>`);
    if (state.j !== null) parts.push(`<text class="nd3420-ij is-j" x="${x(state.j) + unit / 2}" y="${L.ijY}">j</text>`);
  }

  // (e) Deque chips under their columns.
  parts.push(`<text class="nd3420-row-label" x="${ND3420_PAD_L - 6}" y="${L.chipTop + 15}">dq</text>`);
  const groups = state.spans.map((span, s) => (span.kind === "group" ? s : -1)).filter((s) => s >= 0);
  state.spans.forEach((span, s) => {
    const cols = Math.max(1, span.count);
    const kind = span.kind === "pending" ? " is-pending"
      : span.kind === "popped" ? " is-popped"
        : `${s === groups[0] ? " is-front" : ""}${s === groups[groups.length - 1] ? " is-back" : ""}${span.count === 0 ? " is-empty" : ""}`;
    parts.push(`<rect class="nd3420-chip${kind}" data-chip="${s}" x="${x(span.start) + 2}" y="${L.chipTop}" width="${cols * unit - 4}" height="${ND3420_CHIP_H}" rx="6"/>`);
    parts.push(`<text class="nd3420-chip-label${kind}" data-chip-label="${s}" x="${nd3420N(x(span.start) + (cols * unit) / 2)}" y="${L.chipTop + 15}">${span.level}×${span.count}</text>`);
  });

  const label = state.final && state.answer !== null
    ? `${copy.answer} ${state.answer}`
    : `${state.n} ${copy.nums}, k = ${state.k}`;
  return `<svg class="nd3420-svg" width="${L.width}" height="${nd3420N(L.height)}" viewBox="0 0 ${L.width} ${nd3420N(L.height)}" role="img" aria-label="${nd3420Escape(label)}">${parts.join("")}</svg>`;
}

// ---------- Budget meter and counter ----------

function nd3420Meter(state, copy) {
  const cost = state.cost ?? 0;
  const peak = state.peakCost;
  const offScale = state.k > Math.max(Math.ceil(peak * 1.5), peak + 2);
  const scale = offScale ? peak + 1 : Math.max(peak, state.k, 1);
  const pct = (value) => nd3420N(Math.min(100, (100 * value) / scale));
  const tick = offScale ? scale : state.k;
  const status = cost > state.k ? "is-over" : "is-ok";
  return `<div class="nd3420-meter ${status}" data-cost="${cost}" data-k="${state.k}">`
    + `<b>${nd3420Escape(copy.budget)}</b>`
    + `<div class="nd3420-track"><span class="nd3420-meter-fill" style="width: ${pct(cost)}%"></span>`
    + `<span class="nd3420-k-tick${offScale ? " is-off-scale" : ""}" style="left: ${pct(tick)}%"></span></div>`
    + `<span class="nd3420-meter-label">cost ${cost} / k ${offScale ? `→${state.k}` : state.k}</span></div>`;
}

function nd3420Counter(state, copy) {
  const added = state.added !== null ? `<span class="nd3420-added">+${state.added}</span>` : "";
  return `<div class="nd3420-count"><b>${nd3420Escape(copy.count)}</b><strong>${state.ans ?? 0}</strong>${added}</div>`;
}

// ---------- Current-line strip (source lives in the shared #codePanel) ----------

function nd3420Fmt(groups) {
  return `[${groups.map(([a, b]) => `[${a}, ${b}]`).join(", ")}]`;
}

function nd3420Effect(state) {
  const x = state.i !== null ? state.nums[state.i] : null;
  const popped = state.spans.find((s) => s.kind === "popped");
  const back = state.dq && state.dq.length ? state.dq[state.dq.length - 1] : null;
  switch (state.event) {
    case "call": return `len(nums) = ${state.n}, k = ${state.k}`;
    case "init": return "ans = 0, cost = 0";
    case "j": return `j = ${state.j}`;
    case "dq": return "dq = deque([])";
    case "for-i": return `i = ${state.i}`;
    case "for-done": return "StopIteration";
    case "cnt": return "cnt = 1";
    case "merge-check": return state.dq && state.dq.length ? `${state.dq[0][0]} <= ${x}` : "dq = []";
    case "pop": return popped ? `dq.popleft() → [${popped.level}, ${popped.count}]` : "";
    case "raise": return state.delta !== null ? `cost += ${state.delta} → ${state.cost}` : "";
    case "grow": {
      const pending = state.spans.find((s) => s.kind === "pending");
      return pending ? `cnt = ${pending.count}` : "";
    }
    case "push": return state.dq && state.dq.length ? `dq[0] = [${state.dq[0][0]}, ${state.dq[0][1]}]` : "";
    case "budget-check": return `${state.cost} > ${state.k}`;
    case "drop": return state.delta !== null ? `cost -= ${-state.delta} → ${state.cost}` : "";
    case "dec": return back ? `dq[-1] = [${back[0]}, ${back[1]}]` : "";
    case "empty-check": return back ? `${back[1]} == 0` : "";
    case "pop-group": return state.dq ? `dq = ${nd3420Fmt(state.dq)}` : "";
    case "shift-j": return `j = ${state.j}`;
    case "count": return state.added !== null ? `ans += ${state.added} → ${state.ans}` : "";
    case "return": return `return ${state.ans}`;
    default: return "";
  }
}

function nd3420Code(state, copy) {
  const effect = nd3420Effect(state);
  // Line 11 True = merge, line 16 True = over budget (red), line 19 True = group empty.
  const tone = state.event === "budget-check" ? (state.condition ? "over" : "ok") : "neutral";
  const badge = state.condition !== null
    ? `<b class="nd3420-branch is-${tone}${state.condition ? " is-true" : " is-false"}">${state.condition ? "True" : "False"}</b>`
    : "";
  // Locals live only in the shared Variables panel (step.vars), not repeated here.
  return `<header><b>${nd3420Escape(copy.code)}</b></header><div class="nd3420-now" data-code-line="${state.line}" aria-current="step"><span class="nd3420-lineno">L${state.line}</span>${effect ? `<code class="nd3420-effect">↳ ${nd3420Escape(effect)}</code>` : ""}${badge}</div>`;
}

// ---------- Navigation (same contract as other line-by-line renderers) ----------

function nd3420Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  return steps.findIndex((step, index) => {
    const view = step && step.nonDec3420View;
    if (index <= stepIndex || !view) return false;
    if (kind === "line") return true;
    if (kind === "loop") return view.event === "for-i";
    if (kind === "result") return Boolean(step.final);
    return false;
  });
}

function nd3420Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function nd3420Bind(host) {
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
  bind("[data-nd3420-jump]", (element) => nd3420Go(nd3420Next(element.dataset.nd3420Jump)));
  bind("[data-nd3420-case]", (element) => {
    const preset = ND3420_CASES[Number(element.dataset.nd3420Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    const k = document.getElementById("param-k");
    if (k) k.value = preset[1];
    if (typeof runViz === "function") runViz();
  });
}

function renderNonDecreasing3420View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const vi = nd3420IsVi();
  const copy = ND3420_COPY[vi ? "vi" : "en"];
  const state = nd3420Normalize(step);
  const heading = state.final && state.answer !== null
    ? `return ${state.answer}`
    : state.i !== null ? `i = ${state.i}, j = ${state.j}`
      : `countNonDecreasingSubarrays(nums, ${state.k})`;
  const status = state.ans !== null ? `ans ${state.ans}` : `k ${state.k}`;
  const presets = ND3420_CASES.map((preset, index) => `<button type="button" data-nd3420-case="${index}">${nd3420Escape(vi ? preset[2] : preset[3])}</button>`).join("");
  const jumps = copy.jumps.map(([kind, label]) => `<button type="button" data-nd3420-jump="${kind}"${nd3420Next(kind) < 0 ? " disabled" : ""}>${nd3420Escape(label)}</button>`).join("");
  const G = copy.legend;
  const legend = `<div class="nd3420-legend" aria-hidden="true"><span class="lg-bar">${nd3420Escape(G.bar)}</span><span class="lg-fill">${nd3420Escape(G.fill)}</span><span class="lg-level">${nd3420Escape(G.level)}</span><span class="lg-win">${nd3420Escape(G.win)}</span></div>`;

  host.innerHTML = `<article class="nd3420-viz${state.final ? " is-final" : ""}" data-problem-id="3420" data-source-line="${state.line}" role="region" aria-label="LeetCode 3420 · ${vi ? "dòng" : "line"} ${state.line}">`
    + `<header class="nd3420-head"><div><small>LEETCODE 3420 · NON-DECREASING SUBARRAYS</small><h2><code>${nd3420Escape(heading)}</code></h2></div><span class="nd3420-status">${nd3420Escape(status)}</span></header>`
    + `<nav class="nd3420-presets" aria-label="${nd3420Escape(copy.examples)}">${presets}</nav>`
    + `<section class="nd3420-card nd3420-picture-card" aria-label="${nd3420Escape(copy.picture)}"><header><b>${nd3420Escape(copy.picture)}</b></header>${nd3420Picture(state, copy)}${legend}</section>`
    + `<section class="nd3420-card nd3420-stats">${nd3420Meter(state, copy)}${nd3420Counter(state, copy)}</section>`
    + `<section class="nd3420-card nd3420-code-card" aria-label="${nd3420Escape(copy.code)}">${nd3420Code(state, copy)}</section>`
    + `<footer class="nd3420-foot">${jumps}</footer></article>`;
  nd3420Bind(host);
}
