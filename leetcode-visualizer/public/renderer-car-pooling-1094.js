"use strict";

// LeetCode 1094 — Car Pooling. Picture-first renderer on one shared stop axis:
// a bar per trip (number = riders, open dot = drop-off stop), the diff cells with +/- marks,
// the running sum curr as passengers-in-car bars under a dashed capacity line, and a curr row.
// The Python source is shown once, in the shared #codePanel, highlighted by script.js from step.codeLines.

const CP1094_LINE_COUNT = 15;

// Preset inputs: [trips, capacity, Vietnamese label, English label]. The first preset is the default input.
const CP1094_CASES = Object.freeze([
  ["[[2,0,4],[3,1,6],[1,3,8],[4,6,12],[1,7,10],[1,9,14],[1,11,16]]", 6, "Ví dụ", "Example"],
  ["[[2,1,5],[3,3,7]]", 4, "Quá tải", "Over capacity"],
  ["[[2,1,5],[3,3,7]]", 5, "Vừa đủ", "Just fits"],
  ["[[3,2,7],[3,7,9],[8,3,9]]", 11, "Nối tiếp", "Back to back"],
]);

const CP1094_COPY = Object.freeze({
  vi: Object.freeze({
    picture: "Mỗi thanh = một chuyến",
    code: "Dòng đang chạy",
    examples: "Ví dụ",
    trips: "chuyến",
    cap: "chứa",
    ok: "Không quá tải",
    over: "Quá tải ở điểm",
    jumps: [["line", "Dòng →"], ["loop", "Vòng kế →"], ["result", "Kết quả ↠"]],
    legend: { trip: "▬ chuyến (số khách)", drop: "○ điểm xuống", plus: "+ đón", minus: "- trả", cap: "┄ capacity", over: "■ quá tải" },
  }),
  en: Object.freeze({
    picture: "One bar = one trip",
    code: "Current line",
    examples: "Examples",
    trips: "trips",
    cap: "capacity",
    ok: "Never over capacity",
    over: "Over at stop",
    jumps: [["line", "Line →"], ["loop", "Next loop →"], ["result", "Result ↠"]],
    legend: { trip: "▬ trip (riders)", drop: "○ drop-off", plus: "+ pick up", minus: "- drop off", cap: "┄ capacity", over: "■ over" },
  }),
});

function cp1094Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cp1094IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function cp1094Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

// Validates the builder's view model so malformed data never reaches innerHTML unescaped.
function cp1094Normalize(step) {
  const raw = step && step.carPool1094View && typeof step.carPool1094View === "object" ? step.carPool1094View : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = cp1094Int(raw.line, 1, CP1094_LINE_COUNT) ?? cp1094Int(fallbackLine, 1, CP1094_LINE_COUNT) ?? 1;
  const event = typeof raw.event === "string" && /^[a-z-]{1,24}$/.test(raw.event) ? raw.event : "";
  const end = cp1094Int(raw.end, 1, 64);
  const cells = end === null ? 0 : end + 1;
  const trips = (Array.isArray(raw.trips) ? raw.trips.slice(0, 16) : []).flatMap((item, index) => {
    const num = cp1094Int(item && item.num, 1, 99);
    const from = cp1094Int(item && item.from, 0, 64);
    const to = cp1094Int(item && item.to, 0, 64);
    return num === null || from === null || to === null || from >= to || to >= cells ? [] : [{ id: index, num, from, to }];
  });
  const index = (value) => cp1094Int(value, 0, Math.max(0, cells - 1));
  const diff = Array.isArray(raw.diff) && raw.diff.length === cells && raw.diff.every((v) => cp1094Int(v, -999, 999) !== null)
    ? raw.diff.slice()
    : null;
  const prefix = Array.isArray(raw.prefix) ? raw.prefix.slice(0, cells).filter((v) => cp1094Int(v, 0, 999) !== null) : [];
  const capacity = cp1094Int(raw.capacity, 1, 999) ?? 1;
  return {
    line,
    event,
    condition: typeof raw.condition === "boolean" ? raw.condition : null,
    trips,
    cells,
    capacity,
    last: cp1094Int(raw.last, 0, 64),
    trip: cp1094Int(raw.trip, 0, trips.length - 1),
    diff,
    changed: index(raw.changed),
    delta: cp1094Int(raw.delta, -99, 99),
    i: index(raw.i),
    curr: cp1094Int(raw.curr, 0, 999),
    prefix,
    peak: cp1094Int(raw.peak, 0, 999) ?? 0,
    answer: typeof raw.answer === "boolean" ? raw.answer : null,
    final: raw.final === true || Boolean(step && step.final),
  };
}

// ---------- Picture: one shared stop axis ----------

const CP1094_PAD_L = 44;
const CP1094_PAD_R = 34;
const CP1094_TOP = 8;
const CP1094_ROW = 20;
const CP1094_BAR_H = 14;
const CP1094_DELTA_H = 16;
const CP1094_CELL_H = 22;
const CP1094_GAP = 10;
const CP1094_HEAD = 16;
const CP1094_CHART_H = 126; // the tallest bar (or the capacity line) never goes above this
const CP1094_MAX_W = 420; // cells x unit: keeps the natural SVG width near the picture card's width

function cp1094Signed(value) {
  return value > 0 ? `+${value}` : String(value);
}

function cp1094Layout(state) {
  const unit = Math.max(22, Math.min(40, Math.floor(CP1094_MAX_W / Math.max(1, state.cells))));
  const x = (cell) => CP1094_PAD_L + cell * unit;
  // Scale to the riders. A capacity far above the peak would flatten the bars, so its line is then pinned
  // one unit above the tallest bar (offScale) and labelled with an up arrow instead of drawn to scale.
  const offScale = state.capacity > Math.max(Math.ceil(state.peak * 1.5), state.peak + 2);
  const scale = offScale ? state.peak + 1 : Math.max(state.peak, state.capacity);
  const capLevel = offScale ? scale : state.capacity;
  const unitH = Math.min(18, CP1094_CHART_H / Math.max(1, scale));
  const rowsTop = CP1094_TOP;
  const deltaTop = rowsTop + state.trips.length * CP1094_ROW + 2;
  const diffTop = deltaTop + CP1094_DELTA_H;
  const chartTop = diffTop + CP1094_CELL_H + CP1094_GAP;
  const base = chartTop + CP1094_HEAD + scale * unitH;
  const currTop = base + 24;
  return { unit, unitH, offScale, capLevel, x, rowsTop, deltaTop, diffTop, chartTop, base, currTop, width: x(state.cells) + CP1094_PAD_R, height: currTop + CP1094_CELL_H + 4 };
}

const cp1094N = (value) => Math.round(value * 100) / 100;

function cp1094Picture(state, copy) {
  if (!state.trips.length || !state.cells) return "";
  const L = cp1094Layout(state);
  const { unit, x } = L;
  const parts = [];
  const stopLoop = state.i !== null;
  const bandTop = L.rowsTop - 4;
  const bandH = L.currTop + CP1094_CELL_H + 2 - bandTop;

  // Background column for stop i (drawn first, so it never covers marks). Red when that stop overflows.
  if (stopLoop) {
    const over = state.prefix[state.i] > state.capacity;
    parts.push(`<rect class="cp1094-band${over ? " is-over" : " is-current"}" data-band="${state.i}" x="${x(state.i)}" y="${bandTop}" width="${unit}" height="${bandH}"/>`);
  }

  // Trip bars on [from, to): riders written inside, an open dot at the drop-off stop.
  state.trips.forEach((trip, k) => {
    const rowY = L.rowsTop + k * CP1094_ROW;
    const cy = rowY + CP1094_ROW / 2;
    const riding = stopLoop && state.i >= trip.from && state.i < trip.to;
    const current = state.trip === k;
    const status = current ? " is-current" : stopLoop ? (riding ? " is-riding" : " is-off") : "";
    parts.push(`<text class="cp1094-row-label${current ? " is-current" : ""}" x="${CP1094_PAD_L - 6}" y="${cy + 4}">T${k + 1}</text>`);
    parts.push(`<rect class="cp1094-trip${status}" data-trip="${k}" x="${x(trip.from) + 1}" y="${cy - CP1094_BAR_H / 2}" width="${(trip.to - trip.from) * unit - 2}" height="${CP1094_BAR_H}" rx="4"/>`);
    parts.push(`<text class="cp1094-trip-num${status}" data-trip-num="${k}" x="${cp1094N(x(trip.from) + ((trip.to - trip.from) * unit) / 2)}" y="${cy + 4}">${trip.num}</text>`);
    parts.push(`<circle class="cp1094-drop${current ? " is-current" : ""}" data-drop="${k}" cx="${x(trip.to) + unit / 2}" cy="${cy}" r="4"/>`);
  });

  // +num / -num just written by line 8 or 9, above its diff cell.
  if (state.changed !== null && state.delta !== null) {
    const sign = state.delta > 0 ? "plus" : "minus";
    parts.push(`<text class="cp1094-delta is-${sign}" data-delta="${state.changed}" x="${x(state.changed) + unit / 2}" y="${L.deltaTop + 12}">${cp1094Signed(state.delta)}</text>`);
  }

  // diff cells.
  parts.push(`<text class="cp1094-row-label" x="${CP1094_PAD_L - 6}" y="${L.diffTop + 15}">diff</text>`);
  if (state.diff) {
    state.diff.forEach((value, cell) => {
      const sign = value > 0 ? "is-plus" : value < 0 ? "is-minus" : "is-zero";
      const classes = ["cp1094-cell", sign, state.changed === cell ? "is-changed" : "", state.i === cell ? "is-read" : ""].filter(Boolean).join(" ");
      parts.push(`<rect class="${classes}" data-cell="${cell}" x="${x(cell) + 1}" y="${L.diffTop + 1}" width="${unit - 2}" height="${CP1094_CELL_H - 2}" rx="4"/>`);
      parts.push(`<text class="cp1094-cell-value ${sign}" x="${x(cell) + unit / 2}" y="${L.diffTop + 15}">${cp1094Signed(value)}</text>`);
    });
  }

  // Passengers-in-car bars (curr after each visited stop); red above capacity.
  state.prefix.forEach((value, cell) => {
    if (value <= 0) return;
    const top = cp1094N(L.base - value * L.unitH);
    const over = value > state.capacity;
    const status = state.event === "check" && state.i === cell ? (state.condition ? " is-check-over" : " is-check-ok") : "";
    parts.push(`<rect class="cp1094-load${over ? " is-over" : ""}${state.i === cell ? " is-current" : ""}${status}" data-load="${cell}" x="${x(cell) + 3}" y="${top}" width="${unit - 6}" height="${cp1094N(value * L.unitH)}" rx="3"/>`);
  });
  // Capacity line over the bars, its value in the right margin.
  const capY = cp1094N(L.base - L.capLevel * L.unitH);
  parts.push(`<line class="cp1094-cap${L.offScale ? " is-off-scale" : ""}" data-cap="${state.capacity}" x1="${CP1094_PAD_L}" y1="${capY}" x2="${x(state.cells)}" y2="${capY}"/>`);
  parts.push(`<text class="cp1094-cap-label" x="${x(state.cells) + 4}" y="${cp1094N(capY + 4)}">${L.offScale ? "↑" : ""}${state.capacity}</text>`);

  // Stop axis: one cell per stop.
  parts.push(`<line class="cp1094-axis" x1="${CP1094_PAD_L}" y1="${L.base}" x2="${x(state.cells)}" y2="${L.base}"/>`);
  for (let cell = 0; cell <= state.cells; cell++) {
    parts.push(`<line class="cp1094-tick" x1="${x(cell)}" y1="${L.base}" x2="${x(cell)}" y2="${L.base + 4}"/>`);
    if (cell < state.cells) {
      parts.push(`<text class="cp1094-stop${state.i === cell ? " is-current" : ""}" x="${x(cell) + unit / 2}" y="${L.base + 16}">${cell}</text>`);
    }
  }

  // curr row: riders in the car after each visited stop.
  parts.push(`<text class="cp1094-row-label" x="${CP1094_PAD_L - 6}" y="${L.currTop + 15}">curr</text>`);
  state.prefix.forEach((value, cell) => {
    const over = value > state.capacity;
    const classes = ["cp1094-curr", over ? "is-over" : "", state.i === cell ? "is-read" : ""].filter(Boolean).join(" ");
    parts.push(`<rect class="${classes}" data-curr="${cell}" x="${x(cell) + 1}" y="${L.currTop + 1}" width="${unit - 2}" height="${CP1094_CELL_H - 2}" rx="4"/>`);
    parts.push(`<text class="cp1094-curr-value${over ? " is-over" : ""}" data-curr-value="${cell}" x="${x(cell) + unit / 2}" y="${L.currTop + 15}">${value}</text>`);
  });

  const label = state.final && state.answer !== null
    ? (state.answer ? copy.ok : `${copy.over} ${state.i}`)
    : `${state.trips.length} ${copy.trips}, ${copy.cap} ${state.capacity}`;
  return `<svg class="cp1094-svg" width="${L.width}" height="${cp1094N(L.height)}" viewBox="0 0 ${L.width} ${cp1094N(L.height)}" role="img" aria-label="${cp1094Escape(label)}">${parts.join("")}</svg>`;
}

// ---------- Current-line strip (source lives in the shared #codePanel) ----------

function cp1094Effect(state) {
  const trip = state.trip !== null ? state.trips[state.trip] : null;
  switch (state.event) {
    case "call": return `len(trips) = ${state.trips.length}, capacity = ${state.capacity}`;
    case "last": return `last = ${state.last}`;
    case "diff": return `diff = [0] * ${state.cells}`;
    case "for-trip": return trip ? `num, start, end = ${trip.num}, ${trip.from}, ${trip.to}` : "";
    case "plus":
    case "minus": return state.diff && state.changed !== null ? `diff[${state.changed}] = ${state.diff[state.changed]}` : "";
    case "for-trip-done":
    case "for-stop-done": return "StopIteration";
    case "init": return "curr = 0";
    case "for-stop": return state.i !== null ? `i = ${state.i}` : "";
    case "add": return state.i !== null && state.diff ? `curr += ${cp1094Signed(state.diff[state.i])} → ${state.curr}` : "";
    case "check": return `${state.curr} > ${state.capacity}`;
    case "return-false": return "return False";
    case "return-true": return "return True";
    default: return "";
  }
}

function cp1094Code(state, copy) {
  const effect = cp1094Effect(state);
  // The if is "curr > capacity": True means overloaded (red), False means it still fits (green).
  const badge = state.condition !== null
    ? `<b class="cp1094-branch is-${state.condition ? "over" : "ok"}">${state.condition ? "True" : "False"}</b>`
    : "";
  // Locals live only in the shared Variables panel (step.vars), not repeated here.
  return `<header><b>${cp1094Escape(copy.code)}</b></header><div class="cp1094-now" data-code-line="${state.line}" aria-current="step"><span class="cp1094-lineno">L${state.line}</span>${effect ? `<code class="cp1094-effect">↳ ${cp1094Escape(effect)}</code>` : ""}${badge}</div>`;
}

// ---------- Navigation (same contract as other line-by-line renderers) ----------

function cp1094Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  return steps.findIndex((step, index) => {
    const view = step && step.carPool1094View;
    if (index <= stepIndex || !view) return false;
    if (kind === "line") return true;
    if (kind === "loop") return view.event === "for-trip" || view.event === "for-stop";
    if (kind === "result") return Boolean(step.final);
    return false;
  });
}

function cp1094Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function cp1094Bind(host) {
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
  bind("[data-cp1094-jump]", (element) => cp1094Go(cp1094Next(element.dataset.cp1094Jump)));
  bind("[data-cp1094-case]", (element) => {
    const preset = CP1094_CASES[Number(element.dataset.cp1094Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    const capacity = document.getElementById("param-capacity");
    if (capacity) capacity.value = preset[1];
    if (typeof runViz === "function") runViz();
  });
}

function renderCarPooling1094View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const vi = cp1094IsVi();
  const copy = CP1094_COPY[vi ? "vi" : "en"];
  const state = cp1094Normalize(step);
  const trip = state.trip !== null ? state.trips[state.trip] : null;
  const heading = state.final && state.answer !== null
    ? `return ${state.answer ? "True" : "False"}`
    : state.i !== null ? `i = ${state.i}`
      : trip ? `T${state.trip + 1}: ${trip.num} × ${trip.from} → ${trip.to}` : `carPooling(trips, ${state.capacity})`;
  const status = state.curr !== null ? `curr ${state.curr} / ${state.capacity}` : `capacity ${state.capacity}`;
  const result = state.final && state.answer !== null ? (state.answer ? " is-ok" : " is-over") : "";
  const presets = CP1094_CASES.map((preset, index) => `<button type="button" data-cp1094-case="${index}">${cp1094Escape(vi ? preset[2] : preset[3])}</button>`).join("");
  const jumps = copy.jumps.map(([kind, label]) => `<button type="button" data-cp1094-jump="${kind}"${cp1094Next(kind) < 0 ? " disabled" : ""}>${cp1094Escape(label)}</button>`).join("");
  const G = copy.legend;
  const legend = `<div class="cp1094-legend" aria-hidden="true"><span class="lg-trip">${cp1094Escape(G.trip)}</span><span class="lg-drop">${cp1094Escape(G.drop)}</span><span class="lg-plus">${cp1094Escape(G.plus)}</span><span class="lg-minus">${cp1094Escape(G.minus)}</span><span class="lg-cap">${cp1094Escape(G.cap)}</span><span class="lg-over">${cp1094Escape(G.over)}</span></div>`;

  host.innerHTML = `<article class="cp1094-viz${state.final ? " is-final" : ""}${result}" data-problem-id="1094" data-source-line="${state.line}" role="region" aria-label="LeetCode 1094 · ${vi ? "dòng" : "line"} ${state.line}">`
    + `<header class="cp1094-head"><div><small>LEETCODE 1094 · CAR POOLING</small><h2><code>${cp1094Escape(heading)}</code></h2></div><span class="cp1094-status">${cp1094Escape(status)}</span></header>`
    + `<nav class="cp1094-presets" aria-label="${cp1094Escape(copy.examples)}">${presets}</nav>`
    + `<section class="cp1094-card cp1094-picture-card" aria-label="${cp1094Escape(copy.picture)}"><header><b>${cp1094Escape(copy.picture)}</b></header>${cp1094Picture(state, copy)}${legend}</section>`
    + `<section class="cp1094-card cp1094-code-card" aria-label="${cp1094Escape(copy.code)}">${cp1094Code(state, copy)}</section>`
    + `<footer class="cp1094-foot">${jumps}</footer></article>`;
  cp1094Bind(host);
}
