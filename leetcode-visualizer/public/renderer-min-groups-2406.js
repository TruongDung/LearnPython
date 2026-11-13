"use strict";

// LeetCode 2406 — Divide Intervals Into Minimum Number of Groups. Picture-first renderer:
// a number line with one colored lane per group, the interval being placed on a top row with a sweep line at
// its left end, the min-heap of group ends as colored slots, and a current-line strip.
// The Python source is shown once, in the shared #codePanel, highlighted by script.js from step.codeLines.

const MG2406_LINE_COUNT = 12;
const MG2406_GROUP_COLORS = 10;

// Preset inputs: [input, Vietnamese label, English label]. The first preset is the default input.
const MG2406_CASES = Object.freeze([
  ["[[5,8],[1,4],[7,10],[2,6],[11,13],[4,7],[3,5],[10,12],[6,9]]", "Ví dụ", "Example"],
  ["[[5,10],[6,8],[1,5],[2,3],[1,10]]", "Ngắn", "Short"],
  ["[[1,2],[2,3],[3,4]]", "Chạm đầu", "Touching ends"],
  ["[[1,3],[5,6],[8,10],[11,13]]", "Không trùng", "No overlap"],
]);

const MG2406_COPY = Object.freeze({
  vi: Object.freeze({
    picture: "Mỗi làn = một nhóm",
    intervals: "intervals",
    sorted: "đã xếp",
    heap: "ends · min-heap",
    code: "Dòng đang chạy",
    examples: "Ví dụ",
    groups: "nhóm",
    jumps: [["line", "Dòng →"], ["interval", "Đoạn kế →"], ["result", "Kết quả ↠"]],
    legend: { sweep: "┆ left", end: "▏ ends[0]", peak: "▮ chồng nhiều nhất" },
  }),
  en: Object.freeze({
    picture: "One lane = one group",
    intervals: "intervals",
    sorted: "sorted",
    heap: "ends · min-heap",
    code: "Current line",
    examples: "Examples",
    groups: "groups",
    jumps: [["line", "Line →"], ["interval", "Next interval →"], ["result", "Result ↠"]],
    legend: { sweep: "┆ left", end: "▏ ends[0]", peak: "▮ most overlap" },
  }),
});

function mg2406Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mg2406IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function mg2406Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

// Validates the builder's view model so malformed data never reaches innerHTML unescaped.
function mg2406Normalize(step) {
  const raw = step && step.minGroups2406View && typeof step.minGroups2406View === "object" ? step.minGroups2406View : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = mg2406Int(raw.line, 1, MG2406_LINE_COUNT) ?? mg2406Int(fallbackLine, 1, MG2406_LINE_COUNT) ?? 1;
  const event = typeof raw.event === "string" && /^[a-z-]{1,24}$/.test(raw.event) ? raw.event : "";
  const group = (value) => mg2406Int(value, 0, 63);
  const seen = new Set();
  const intervals = (Array.isArray(raw.intervals) ? raw.intervals.slice(0, 64) : []).flatMap((item) => {
    const id = mg2406Int(item && item.id, 0, 63);
    const left = mg2406Int(item && item.left, -1e9, 1e9);
    const right = mg2406Int(item && item.right, -1e9, 1e9);
    if (id === null || seen.has(id) || left === null || right === null || left > right) return [];
    seen.add(id);
    return [{ id, left, right, group: group(item.group) }];
  });
  const entry = (item) => {
    const end = mg2406Int(item && item.end, -1e9, 1e9);
    const g = group(item && item.group);
    return end === null || g === null ? null : { end, group: g };
  };
  const heap = (Array.isArray(raw.heap) ? raw.heap.slice(0, 64) : []).map(entry).filter(Boolean);
  const peakRaw = raw.peak && typeof raw.peak === "object" ? raw.peak : null;
  const peak = peakRaw && mg2406Int(peakRaw.point, -1e9, 1e9) !== null && mg2406Int(peakRaw.count, 1, 64) !== null
    ? { point: peakRaw.point, count: peakRaw.count }
    : null;
  return {
    line,
    event,
    condition: typeof raw.condition === "boolean" ? raw.condition : null,
    sorted: raw.sorted === true,
    intervals,
    current: seen.has(raw.current) ? raw.current : null,
    heap,
    popped: entry(raw.popped),
    pushed: group(raw.pushed),
    groups: mg2406Int(raw.groups, 0, 64) ?? 0,
    peak,
    final: raw.final === true || Boolean(step && step.final),
  };
}

function mg2406Color(groupIndex) {
  return `g${groupIndex % MG2406_GROUP_COLORS}`;
}

// ---------- Picture: number line, one lane per group ----------

const MG2406_PAD_L = 40;
const MG2406_PAD_R = 12;
const MG2406_TOP = 8;
const MG2406_ROW = 30;
const MG2406_BAR_H = 18;

function mg2406Picture(state) {
  if (!state.intervals.length) return "";
  const lo = Math.min(...state.intervals.map((item) => item.left));
  const hi = Math.max(...state.intervals.map((item) => item.right));
  const span = hi - lo + 1;
  const unit = Math.max(16, Math.min(40, Math.floor(600 / span)));
  const x = (value) => MG2406_PAD_L + (value - lo) * unit;
  const width = x(hi + 1) + MG2406_PAD_R;
  const laneTop = MG2406_TOP + MG2406_ROW + 6;
  const laneY = (groupIndex) => laneTop + groupIndex * MG2406_ROW;
  const lanes = state.groups;
  const axisY = laneY(lanes) + 6;
  const height = axisY + 24;
  const barY = (rowTop) => rowTop + (MG2406_ROW - MG2406_BAR_H) / 2;
  const current = state.intervals.find((item) => item.id === state.current) || null;
  const top = state.heap.length ? state.heap[0] : null;
  const checking = state.event === "check" && top !== null;
  const parts = [];

  // Lanes (background) and their labels.
  for (let g = 0; g < lanes; g++) {
    const classes = ["mg2406-lane", mg2406Color(g),
      checking && top.group === g ? (state.condition ? "is-free" : "is-busy") : "",
      state.event === "pop" && state.popped && state.popped.group === g ? "is-free" : "",
      state.pushed === g ? "is-pushed" : ""].filter(Boolean).join(" ");
    parts.push(`<rect class="${classes}" data-lane="${g}" x="${MG2406_PAD_L - 2}" y="${laneY(g) + 2}" width="${x(hi + 1) - MG2406_PAD_L + 4}" height="${MG2406_ROW - 4}" rx="6"/>`);
    parts.push(`<text class="mg2406-lane-label ${mg2406Color(g)}" x="${MG2406_PAD_L - 8}" y="${laneY(g) + MG2406_ROW / 2 + 4}">G${g + 1}</text>`);
  }
  // Most-overlapped point (final frame): a column through every lane, count above it.
  if (state.final && state.peak) {
    const px = x(state.peak.point);
    parts.push(`<rect class="mg2406-band" x="${px}" y="${laneTop}" width="${unit}" height="${axisY - laneTop}"/>`);
    parts.push(`<text class="mg2406-peak" data-peak="${state.peak.count}" x="${px + unit / 2}" y="${MG2406_TOP + MG2406_ROW / 2 + 5}">×${state.peak.count}</text>`);
  }
  // Placed intervals, in their group's lane.
  state.intervals.forEach((item) => {
    if (item.group === null || item.group >= lanes) return;
    const isNew = state.pushed === item.group && item.id === state.current;
    parts.push(`<rect class="mg2406-bar ${mg2406Color(item.group)}${isNew ? " is-new" : ""}" data-interval="${item.id}" data-group="${item.group}" x="${x(item.left) + 1}" y="${barY(laneY(item.group))}" width="${(item.right - item.left + 1) * unit - 2}" height="${MG2406_BAR_H}" rx="5"/>`);
  });
  // The interval being placed waits on the top row until heappush puts it in a lane.
  if (current && current.group === null) {
    parts.push(`<rect class="mg2406-bar is-current" data-current="${current.id}" x="${x(current.left) + 1}" y="${barY(MG2406_TOP)}" width="${(current.right - current.left + 1) * unit - 2}" height="${MG2406_BAR_H}" rx="5"/>`);
  }
  // ends[0] at the moment it is compared: a mark on the right edge of that group's last cell.
  if (checking) {
    const ex = x(top.end + 1);
    parts.push(`<line class="mg2406-endmark ${state.condition ? "is-free" : "is-busy"}" data-endmark="${top.group}" x1="${ex}" y1="${laneY(top.group) + 1}" x2="${ex}" y2="${laneY(top.group) + MG2406_ROW - 1}"/>`);
  }
  // Sweep line at left of the current interval.
  if (current && !state.final) {
    parts.push(`<line class="mg2406-sweep" x1="${x(current.left)}" y1="${MG2406_TOP}" x2="${x(current.left)}" y2="${axisY}"/>`);
  }
  // Axis: one cell per integer, labels spaced so they never touch.
  const digits = Math.max(String(lo).length, String(hi).length);
  const every = Math.max(1, Math.ceil((digits * 7 + 6) / unit));
  parts.push(`<line class="mg2406-axis" x1="${MG2406_PAD_L}" y1="${axisY}" x2="${x(hi + 1)}" y2="${axisY}"/>`);
  for (let v = lo; v <= hi; v++) {
    parts.push(`<line class="mg2406-tick" x1="${x(v)}" y1="${axisY}" x2="${x(v)}" y2="${axisY + 4}"/>`);
    if ((v - lo) % every === 0) parts.push(`<text class="mg2406-tick-label" x="${x(v) + unit / 2}" y="${axisY + 17}">${v}</text>`);
  }
  parts.push(`<line class="mg2406-tick" x1="${x(hi + 1)}" y1="${axisY}" x2="${x(hi + 1)}" y2="${axisY + 4}"/>`);
  const label = `${lanes} groups`;
  return `<svg class="mg2406-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${mg2406Escape(label)}">${parts.join("")}</svg>`;
}

function mg2406Chips(state, copy) {
  const chips = state.intervals.map((item) => {
    const classes = ["mg2406-chip",
      item.group !== null ? mg2406Color(item.group) : "is-pending",
      item.id === state.current ? "is-current" : ""].filter(Boolean).join(" ");
    return `<span class="${classes}" data-chip="${item.id}">${item.left},${item.right}</span>`;
  }).join("");
  const tag = state.sorted ? `<i class="mg2406-sorted">↑ ${mg2406Escape(copy.sorted)}</i>` : "";
  return `<div class="mg2406-chips"><code>${mg2406Escape(copy.intervals)}</code>${chips}${tag}</div>`;
}

function mg2406Heap(state, copy) {
  const slots = state.heap.map((item, index) => {
    const classes = ["mg2406-slot", mg2406Color(item.group),
      index === 0 ? "is-top" : "",
      state.pushed === item.group ? "is-pushed" : "",
      index === 0 && state.event === "check" ? (state.condition ? "is-free" : "is-busy") : ""].filter(Boolean).join(" ");
    return `<span class="${classes}" data-heap-index="${index}">${index === 0 ? "<i>min</i>" : ""}<b>${item.end}</b><small>G${item.group + 1}</small></span>`;
  }).join("");
  const popped = state.popped && state.event === "pop"
    ? `<span class="mg2406-out">⤴</span><span class="mg2406-slot is-popped ${mg2406Color(state.popped.group)}" data-popped="${state.popped.group}"><b>${state.popped.end}</b><small>G${state.popped.group + 1}</small></span>`
    : "";
  const body = slots || `<span class="mg2406-heap-empty">[ ]</span>`;
  return `<header><b>${mg2406Escape(copy.heap)}</b></header><div class="mg2406-heap">${body}${popped}</div>`;
}

// ---------- Current-line strip (source lives in the shared #codePanel) ----------

function mg2406Effect(state) {
  const current = state.intervals.find((item) => item.id === state.current) || null;
  const top = state.heap.length ? state.heap[0] : null;
  switch (state.event) {
    case "call": return `len(intervals) = ${state.intervals.length}`;
    case "init": return "ends = []";
    case "for": return current ? `left, right = ${current.left}, ${current.right}` : "";
    case "check": return top && current ? `ends[0] = ${top.end} < left = ${current.left}` : "ends = []";
    case "pop": return state.popped ? `→ ${state.popped.end} (G${state.popped.group + 1})` : "";
    case "push-new":
    case "push-reuse": return current ? `push ${current.right} → G${state.pushed + 1}` : "";
    case "return": return `return ${state.heap.length}`;
    default: return "";
  }
}

function mg2406Code(state, copy) {
  const effect = mg2406Effect(state);
  const badge = state.condition !== null
    ? `<b class="mg2406-branch is-${state.condition ? "true" : "false"}">${state.condition ? "True" : "False"}</b>`
    : "";
  // left/right/ends values live only in the shared Variables panel (step.vars), not repeated here.
  return `<header><b>${mg2406Escape(copy.code)}</b></header><div class="mg2406-now" data-code-line="${state.line}" aria-current="step"><span class="mg2406-lineno">L${state.line}</span>${effect ? `<code class="mg2406-effect">↳ ${mg2406Escape(effect)}</code>` : ""}${badge}</div>`;
}

// ---------- Navigation (same contract as other line-by-line renderers) ----------

function mg2406Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  return steps.findIndex((step, index) => {
    const view = step && step.minGroups2406View;
    if (index <= stepIndex || !view) return false;
    if (kind === "line") return true;
    if (kind === "interval") return view.event === "for";
    if (kind === "result") return Boolean(step.final);
    return false;
  });
}

function mg2406Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function mg2406Bind(host) {
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
  bind("[data-mg2406-jump]", (element) => mg2406Go(mg2406Next(element.dataset.mg2406Jump)));
  bind("[data-mg2406-case]", (element) => {
    const preset = MG2406_CASES[Number(element.dataset.mg2406Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    if (typeof runViz === "function") runViz();
  });
}

function renderMinGroups2406View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const vi = mg2406IsVi();
  const copy = MG2406_COPY[vi ? "vi" : "en"];
  const state = mg2406Normalize(step);
  const current = state.intervals.find((item) => item.id === state.current) || null;
  const heading = state.final
    ? `return ${state.heap.length}`
    : current ? `[${current.left}, ${current.right}]` : "minGroups(intervals)";
  const status = `${copy.groups}: ${state.groups}`;
  const presets = MG2406_CASES.map((preset, index) => `<button type="button" data-mg2406-case="${index}">${mg2406Escape(vi ? preset[1] : preset[2])}</button>`).join("");
  const jumps = copy.jumps.map(([kind, label]) => `<button type="button" data-mg2406-jump="${kind}"${mg2406Next(kind) < 0 ? " disabled" : ""}>${mg2406Escape(label)}</button>`).join("");
  const L = copy.legend;
  const legend = `<div class="mg2406-legend" aria-hidden="true"><span class="lg-sweep">${mg2406Escape(L.sweep)}</span><span class="lg-end">${mg2406Escape(L.end)}</span><span class="lg-peak">${mg2406Escape(L.peak)}</span></div>`;

  host.innerHTML = `<article class="mg2406-viz${state.final ? " is-final" : ""}" data-problem-id="2406" data-source-line="${state.line}" role="region" aria-label="LeetCode 2406 · line ${state.line}">`
    + `<header class="mg2406-head"><div><small>LEETCODE 2406 · MIN GROUPS</small><h2><code>${mg2406Escape(heading)}</code></h2></div><span class="mg2406-status">${mg2406Escape(status)}</span></header>`
    + `<nav class="mg2406-presets" aria-label="${mg2406Escape(copy.examples)}">${presets}</nav>`
    + `<section class="mg2406-card mg2406-picture-card" aria-label="${mg2406Escape(copy.picture)}"><header><b>${mg2406Escape(copy.picture)}</b></header>${mg2406Chips(state, copy)}${mg2406Picture(state)}${legend}</section>`
    + `<div class="mg2406-row"><section class="mg2406-card mg2406-heap-card" aria-label="${mg2406Escape(copy.heap)}">${mg2406Heap(state, copy)}</section>`
    + `<section class="mg2406-card mg2406-code-card" aria-label="${mg2406Escape(copy.code)}">${mg2406Code(state, copy)}</section></div>`
    + `<footer class="mg2406-foot">${jumps}</footer></article>`;
  mg2406Bind(host);
}
