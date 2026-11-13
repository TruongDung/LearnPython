"use strict";

// LeetCode 1854 — Maximum Population Year. Picture-first renderer on one shared year axis:
// a life bar per person (open dot = death year, not counted), the diff cells with +/- marks,
// and the running sum curr as population bars with the max_pop line and the best year in amber.
// The Python source is shown once, in the shared #codePanel, highlighted by script.js from step.codeLines.

const MP1854_LINE_COUNT = 18;

// Preset inputs: [input, Vietnamese label, English label]. The first preset is the default input.
const MP1854_CASES = Object.freeze([
  ["[[1952,1960],[1955,1966],[1950,1956],[1958,1963],[1961,1972],[1964,1970],[1957,1962],[1966,1975]]", "Ví dụ", "Example"],
  ["[[1950,1961],[1960,1971],[1970,1981]]", "Ngắn", "Short"],
  ["[[1993,1999],[2000,2010]]", "Có khoảng trống", "Gap"],
  ["[[2049,2050]]", "Một người", "One person"],
]);

const MP1854_COPY = Object.freeze({
  vi: Object.freeze({
    picture: "Mỗi thanh = một đời người",
    code: "Dòng đang chạy",
    examples: "Ví dụ",
    people: "người",
    best: "năm đông nhất",
    jumps: [["line", "Dòng →"], ["loop", "Vòng kế →"], ["result", "Kết quả ↠"]],
    legend: { life: "▬ sống", death: "○ năm mất", plus: "+1 sinh", minus: "-1 mất", max: "┄ max_pop" },
  }),
  en: Object.freeze({
    picture: "One bar = one lifetime",
    code: "Current line",
    examples: "Examples",
    people: "people",
    best: "best year",
    jumps: [["line", "Line →"], ["loop", "Next loop →"], ["result", "Result ↠"]],
    legend: { life: "▬ alive", death: "○ death year", plus: "+1 born", minus: "-1 died", max: "┄ max_pop" },
  }),
});

function mp1854Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mp1854IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function mp1854Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

// Validates the builder's view model so malformed data never reaches innerHTML unescaped.
function mp1854Normalize(step) {
  const raw = step && step.maxPop1854View && typeof step.maxPop1854View === "object" ? step.maxPop1854View : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = mp1854Int(raw.line, 1, MP1854_LINE_COUNT) ?? mp1854Int(fallbackLine, 1, MP1854_LINE_COUNT) ?? 1;
  const event = typeof raw.event === "string" && /^[a-z-]{1,24}$/.test(raw.event) ? raw.event : "";
  const year = (value) => mp1854Int(value, 0, 9999);
  const logs = (Array.isArray(raw.logs) ? raw.logs.slice(0, 32) : []).flatMap((item, index) => {
    const birth = year(item && item.birth);
    const death = year(item && item.death);
    return birth === null || death === null || birth >= death ? [] : [{ id: index, birth, death }];
  });
  const start = year(raw.start);
  const end = year(raw.end);
  const cells = start !== null && end !== null && end >= start && end - start < 64 ? end - start + 1 : 0;
  const index = (value) => mp1854Int(value, 0, Math.max(0, cells - 1));
  const diff = Array.isArray(raw.diff) && raw.diff.length === cells && raw.diff.every((v) => mp1854Int(v, -64, 64) !== null)
    ? raw.diff.slice()
    : null;
  const prefix = Array.isArray(raw.prefix) ? raw.prefix.slice(0, cells).filter((v) => mp1854Int(v, 0, 64) !== null) : [];
  return {
    line,
    event,
    condition: typeof raw.condition === "boolean" ? raw.condition : null,
    logs,
    start,
    cells,
    lo: year(raw.lo),
    hi: year(raw.hi),
    person: mp1854Int(raw.person, 0, logs.length - 1),
    diff,
    changed: index(raw.changed),
    delta: raw.delta === 1 || raw.delta === -1 ? raw.delta : null,
    i: index(raw.i),
    curr: mp1854Int(raw.curr, 0, 64),
    maxPop: mp1854Int(raw.maxPop, 0, 64),
    ans: year(raw.ans),
    prefix,
    peak: mp1854Int(raw.peak, 1, 64) ?? 1,
    final: raw.final === true || Boolean(step && step.final),
  };
}

// ---------- Picture: one shared year axis ----------

const MP1854_PAD_L = 44;
const MP1854_PAD_R = 34;
const MP1854_TOP = 8;
const MP1854_ROW = 20;
const MP1854_BAR_H = 12;
const MP1854_DELTA_H = 16;
const MP1854_DIFF_H = 22;
const MP1854_GAP = 10;
const MP1854_UNIT_H = 20; // bar height per person: keeps value labels clear of the max_pop line
const MP1854_HEAD = 20;

function mp1854Signed(value) {
  return value > 0 ? `+${value}` : String(value);
}

function mp1854Layout(state) {
  const unit = Math.max(21, Math.min(40, Math.floor(620 / Math.max(1, state.cells))));
  const x = (cell) => MP1854_PAD_L + cell * unit;
  const rowsTop = MP1854_TOP;
  const deltaTop = rowsTop + state.logs.length * MP1854_ROW + 2;
  const diffTop = deltaTop + MP1854_DELTA_H;
  const chartTop = diffTop + MP1854_DIFF_H + MP1854_GAP;
  const base = chartTop + MP1854_HEAD + state.peak * MP1854_UNIT_H;
  return { unit, x, rowsTop, deltaTop, diffTop, chartTop, base, width: x(state.cells) + MP1854_PAD_R, height: base + 24 };
}

function mp1854Picture(state, copy) {
  if (!state.logs.length || !state.cells) return "";
  const L = mp1854Layout(state);
  const { unit, x } = L;
  const parts = [];
  const bestCell = state.ans !== null && state.maxPop ? state.ans - state.start : null;
  const yearLoop = state.i !== null;

  // Background columns (drawn first, never cover marks): current year i and, on the last frame, the answer year.
  if (yearLoop) {
    parts.push(`<rect class="mp1854-band is-current" data-band="${state.i}" x="${x(state.i)}" y="${L.rowsTop - 4}" width="${unit}" height="${L.base - L.rowsTop + 4}"/>`);
  }
  if (state.final && bestCell !== null) {
    parts.push(`<rect class="mp1854-band is-best" data-best-band="${bestCell}" x="${x(bestCell)}" y="${L.rowsTop - 4}" width="${unit}" height="${L.base - L.rowsTop + 4}"/>`);
  }

  // Life bars: alive cells birth..death-1, an open dot in the death cell.
  state.logs.forEach((log, k) => {
    const rowY = L.rowsTop + k * MP1854_ROW;
    const cy = rowY + MP1854_ROW / 2;
    const b = log.birth - state.start;
    const d = log.death - state.start;
    const alive = yearLoop && state.i >= b && state.i < d;
    const classes = ["mp1854-life", state.person === k ? "is-current" : "", alive ? "is-alive" : ""].filter(Boolean).join(" ");
    parts.push(`<text class="mp1854-row-label${state.person === k ? " is-current" : ""}" x="${MP1854_PAD_L - 6}" y="${cy + 4}">P${k + 1}</text>`);
    parts.push(`<rect class="${classes}" data-life="${k}" x="${x(b) + 1}" y="${cy - MP1854_BAR_H / 2}" width="${(d - b) * unit - 2}" height="${MP1854_BAR_H}" rx="4"/>`);
    parts.push(`<circle class="mp1854-death${state.person === k ? " is-current" : ""}" data-death="${k}" cx="${x(d) + unit / 2}" cy="${cy}" r="4"/>`);
  });

  // +1 / -1 just written by line 9 or 10, above its diff cell.
  if (state.changed !== null && state.delta !== null) {
    const sign = state.delta > 0 ? "plus" : "minus";
    parts.push(`<text class="mp1854-delta is-${sign}" data-delta="${state.changed}" x="${x(state.changed) + unit / 2}" y="${L.deltaTop + 12}">${state.delta > 0 ? "+1" : "-1"}</text>`);
  }

  // diff cells.
  parts.push(`<text class="mp1854-row-label" x="${MP1854_PAD_L - 6}" y="${L.diffTop + 15}">diff</text>`);
  if (state.diff) {
    state.diff.forEach((value, cell) => {
      const sign = value > 0 ? "is-plus" : value < 0 ? "is-minus" : "is-zero";
      const classes = ["mp1854-cell", sign, state.changed === cell ? "is-changed" : "", state.i === cell ? "is-read" : ""].filter(Boolean).join(" ");
      parts.push(`<rect class="${classes}" data-cell="${cell}" x="${x(cell) + 1}" y="${L.diffTop + 1}" width="${unit - 2}" height="${MP1854_DIFF_H - 2}" rx="4"/>`);
      // "-10" gets a 10px font so three glyphs still fit a 21px cell.
      const wide = Math.abs(value) >= 10 ? " is-wide" : "";
      parts.push(`<text class="mp1854-cell-value ${sign}${wide}" x="${x(cell) + unit / 2}" y="${L.diffTop + 15}">${mp1854Signed(value)}</text>`);
    });
  }

  // Population bars (curr after each finished year), the max_pop line and its value at the right.
  parts.push(`<text class="mp1854-row-label" x="${MP1854_PAD_L - 6}" y="${L.base - 4}">curr</text>`);
  state.prefix.forEach((value, cell) => {
    const top = L.base - value * MP1854_UNIT_H;
    const isBest = bestCell === cell; // the year ans points at so far
    const status = state.event === "check" && state.i === cell ? (state.condition ? " is-true" : " is-false") : "";
    if (value > 0) {
      parts.push(`<rect class="mp1854-pop${isBest ? " is-best" : ""}${state.i === cell ? " is-current" : ""}${status}" data-pop="${cell}" x="${x(cell) + 3}" y="${top}" width="${unit - 6}" height="${value * MP1854_UNIT_H}" rx="3"/>`);
    }
    parts.push(`<text class="mp1854-pop-value${isBest ? " is-best" : ""}" data-pop-value="${cell}" x="${x(cell) + unit / 2}" y="${top - 6}">${value}</text>`);
  });
  if (state.maxPop) {
    const my = L.base - state.maxPop * MP1854_UNIT_H;
    parts.push(`<line class="mp1854-max" data-max="${state.maxPop}" x1="${MP1854_PAD_L}" y1="${my}" x2="${x(state.cells)}" y2="${my}"/>`);
    parts.push(`<text class="mp1854-max-label" x="${x(state.cells) + 4}" y="${my + 4}">${state.maxPop}</text>`);
  }

  // Year axis: one cell per year, labels spaced so they never touch.
  const every = Math.max(1, Math.ceil(34 / unit));
  parts.push(`<line class="mp1854-axis" x1="${MP1854_PAD_L}" y1="${L.base}" x2="${x(state.cells)}" y2="${L.base}"/>`);
  for (let cell = 0; cell <= state.cells; cell++) {
    parts.push(`<line class="mp1854-tick" x1="${x(cell)}" y1="${L.base}" x2="${x(cell)}" y2="${L.base + 4}"/>`);
    if (cell < state.cells && cell % every === 0) {
      const isBest = state.final && bestCell === cell;
      parts.push(`<text class="mp1854-year${isBest ? " is-best" : ""}" x="${x(cell) + unit / 2}" y="${L.base + 17}">${state.start + cell}</text>`);
    }
  }
  const label = state.final && state.ans !== null
    ? `${copy.best}: ${state.ans}`
    : `${state.logs.length} ${copy.people}`;
  return `<svg class="mp1854-svg" width="${L.width}" height="${L.height}" viewBox="0 0 ${L.width} ${L.height}" role="img" aria-label="${mp1854Escape(label)}">${parts.join("")}</svg>`;
}

// ---------- Current-line strip (source lives in the shared #codePanel) ----------

function mp1854Effect(state) {
  const log = state.person !== null ? state.logs[state.person] : null;
  switch (state.event) {
    case "call": return `len(logs) = ${state.logs.length}`;
    case "lo": return `lo = ${state.lo}`;
    case "hi": return `hi = ${state.hi}`;
    case "diff": return `diff = [0] * ${state.cells}`;
    case "for-log": return log ? `birth, death = ${log.birth}, ${log.death}` : "";
    case "plus":
    case "minus": return state.diff && state.changed !== null ? `diff[${state.changed}] = ${state.diff[state.changed]}` : "";
    case "for-log-done":
    case "for-year-done": return "StopIteration";
    case "init": return "max_pop = 0, curr = 0";
    case "ans":
    case "set-ans": return `ans = ${state.ans}`;
    case "for-year": return state.i !== null ? `i = ${state.i} → ${state.start + state.i}` : "";
    case "add": return state.i !== null && state.diff ? `curr += ${mp1854Signed(state.diff[state.i])} → ${state.curr}` : "";
    case "check": return `${state.curr} > ${state.maxPop}`;
    case "set-max": return `max_pop = ${state.maxPop}`;
    case "return": return `return ${state.ans}`;
    default: return "";
  }
}

function mp1854Code(state, copy) {
  const effect = mp1854Effect(state);
  const badge = state.condition !== null
    ? `<b class="mp1854-branch is-${state.condition ? "true" : "false"}">${state.condition ? "True" : "False"}</b>`
    : "";
  // Locals live only in the shared Variables panel (step.vars), not repeated here.
  return `<header><b>${mp1854Escape(copy.code)}</b></header><div class="mp1854-now" data-code-line="${state.line}" aria-current="step"><span class="mp1854-lineno">L${state.line}</span>${effect ? `<code class="mp1854-effect">↳ ${mp1854Escape(effect)}</code>` : ""}${badge}</div>`;
}

// ---------- Navigation (same contract as other line-by-line renderers) ----------

function mp1854Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  return steps.findIndex((step, index) => {
    const view = step && step.maxPop1854View;
    if (index <= stepIndex || !view) return false;
    if (kind === "line") return true;
    if (kind === "loop") return view.event === "for-log" || view.event === "for-year";
    if (kind === "result") return Boolean(step.final);
    return false;
  });
}

function mp1854Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function mp1854Bind(host) {
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
  bind("[data-mp1854-jump]", (element) => mp1854Go(mp1854Next(element.dataset.mp1854Jump)));
  bind("[data-mp1854-case]", (element) => {
    const preset = MP1854_CASES[Number(element.dataset.mp1854Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    if (typeof runViz === "function") runViz();
  });
}

function renderMaxPopulation1854View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const vi = mp1854IsVi();
  const copy = MP1854_COPY[vi ? "vi" : "en"];
  const state = mp1854Normalize(step);
  const log = state.person !== null ? state.logs[state.person] : null;
  const heading = state.final
    ? `return ${state.ans}`
    : state.i !== null ? `${state.start + state.i}`
      : log ? `P${state.person + 1}: ${log.birth} → ${log.death}` : "maximumPopulation(logs)";
  const status = state.maxPop !== null ? `max_pop = ${state.maxPop}` : `${state.logs.length} ${copy.people}`;
  const presets = MP1854_CASES.map((preset, index) => `<button type="button" data-mp1854-case="${index}">${mp1854Escape(vi ? preset[1] : preset[2])}</button>`).join("");
  const jumps = copy.jumps.map(([kind, label]) => `<button type="button" data-mp1854-jump="${kind}"${mp1854Next(kind) < 0 ? " disabled" : ""}>${mp1854Escape(label)}</button>`).join("");
  const G = copy.legend;
  const legend = `<div class="mp1854-legend" aria-hidden="true"><span class="lg-life">${mp1854Escape(G.life)}</span><span class="lg-death">${mp1854Escape(G.death)}</span><span class="lg-plus">${mp1854Escape(G.plus)}</span><span class="lg-minus">${mp1854Escape(G.minus)}</span><span class="lg-max">${mp1854Escape(G.max)}</span></div>`;

  host.innerHTML = `<article class="mp1854-viz${state.final ? " is-final" : ""}" data-problem-id="1854" data-source-line="${state.line}" role="region" aria-label="LeetCode 1854 · ${vi ? "dòng" : "line"} ${state.line}">`
    + `<header class="mp1854-head"><div><small>LEETCODE 1854 · MAX POPULATION</small><h2><code>${mp1854Escape(heading)}</code></h2></div><span class="mp1854-status">${mp1854Escape(status)}</span></header>`
    + `<nav class="mp1854-presets" aria-label="${mp1854Escape(copy.examples)}">${presets}</nav>`
    + `<section class="mp1854-card mp1854-picture-card" aria-label="${mp1854Escape(copy.picture)}"><header><b>${mp1854Escape(copy.picture)}</b></header>${mp1854Picture(state, copy)}${legend}</section>`
    + `<section class="mp1854-card mp1854-code-card" aria-label="${mp1854Escape(copy.code)}">${mp1854Code(state, copy)}</section>`
    + `<footer class="mp1854-foot">${jumps}</footer></article>`;
  mp1854Bind(host);
}
