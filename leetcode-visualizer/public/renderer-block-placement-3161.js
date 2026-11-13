"use strict";

// LeetCode 3161 — Block Placement Queries. Picture-first renderer on one position axis: obstacle posts and the gaps
// between them, the [0, x] prefix and the tail gap x − a, the size-sz block (fits / does not fit), and the max-gap
// BIT with each node drawn under the range it covers. The Python source is shown once, in the shared #codePanel,
// highlighted by script.js from step.codeLines; locals are shown once, in the shared Variables panel.

const BP3161_LINE_COUNT = 40;

// Preset inputs: [queries, Vietnamese label, English label]. The first preset is the default input.
const BP3161_CASES = Object.freeze([
  ["1,7;2,7,6;1,2;2,7,5;2,7,6", "Ví dụ", "Example"],
  ["1,2;2,3,3;2,3,1;2,2,2", "Ngắn", "Short"],
  ["1,3;1,8;2,10,4;1,11;2,13,5;1,6;2,13,3;2,7,4", "Nhiều", "Bigger"],
  ["1,2;1,4;2,5,3;2,6,3", "Không vừa", "No fit"],
]);

const BP3161_COPY = Object.freeze({
  vi: Object.freeze({
    picture: "Trục số, khe và BIT",
    code: "Dòng đang chạy",
    examples: "Ví dụ",
    queries: "Truy vấn",
    reverse: "← duyệt ngược",
    positions: "vị trí",
    obstacles: "vật cản",
    count: "truy vấn",
    answer: "Kết quả",
    fit: "Khối",
    jumps: [["line", "Dòng →"], ["query", "Truy vấn →"], ["result", "Kết quả ↠"]],
    legend: { post: "┃ vật cản", gap: "▬ khe", node: "▭ nút BIT", path: "▭ đã thăm", block: "▬ khối sz" },
  }),
  en: Object.freeze({
    picture: "Number line, gaps and BIT",
    code: "Current line",
    examples: "Examples",
    queries: "Queries",
    reverse: "← reverse scan",
    positions: "positions",
    obstacles: "obstacles",
    count: "queries",
    answer: "Answer",
    fit: "Block",
    jumps: [["line", "Line →"], ["query", "Next query →"], ["result", "Result ↠"]],
    legend: { post: "┃ obstacle", gap: "▬ gap", node: "▭ BIT node", path: "▭ visited", block: "▬ block sz" },
  }),
});

function bp3161Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bp3161IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function bp3161Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function bp3161Ints(value, minimum, maximum, limit) {
  return Array.isArray(value) && value.length <= limit && value.every((v) => bp3161Int(v, minimum, maximum) !== null) ? value.slice() : null;
}

function bp3161Bools(value, limit) {
  return Array.isArray(value) && value.length <= limit && value.every((v) => typeof v === "boolean") ? value.slice() : null;
}

// Validates the builder's view model so malformed data never reaches innerHTML unescaped.
function bp3161Normalize(step) {
  const raw = step && step.blockPlace3161View && typeof step.blockPlace3161View === "object" ? step.blockPlace3161View : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = bp3161Int(raw.line, 1, BP3161_LINE_COUNT) ?? bp3161Int(fallbackLine, 1, BP3161_LINE_COUNT) ?? 1;
  const event = typeof raw.event === "string" && /^[a-z0-9-]{1,24}$/.test(raw.event) ? raw.event : "";
  const queries = Array.isArray(raw.queries) && raw.queries.length <= 16
    ? raw.queries.filter((row) => Array.isArray(row)
      && ((row.length === 2 && row[0] === 1) || (row.length === 3 && row[0] === 2))
      && row.every((v) => bp3161Int(v, 0, 99) !== null)).map((row) => row.slice())
    : [];
  const n = bp3161Int(raw.n, 2, 99);
  const axis = n ?? Math.max(1, ...queries.map((row) => row[1])) + 1;
  const pos = (value) => bp3161Int(value, 0, axis);
  let obs = bp3161Ints(raw.obs, 0, axis, 32);
  if (obs && obs.some((p, t) => t > 0 && p <= obs[t - 1])) obs = null;
  const bit = n !== null ? bp3161Ints(raw.bit, 0, 99, 128) : null;
  const finalFlag = raw.final === true || Boolean(step && step.final);
  const qi = bp3161Int(raw.qi, 0, Math.max(0, queries.length - 1));
  const q = Array.isArray(raw.q) && raw.q.length <= 3 && raw.q.every((v) => bp3161Int(v, 0, 99) !== null) ? raw.q.slice() : null;
  return {
    line,
    event,
    condition: typeof raw.condition === "boolean" ? raw.condition : null,
    queries,
    n,
    axis,
    qi,
    q,
    obs,
    ghosts: (bp3161Ints(raw.ghosts, 0, axis, 16) || []),
    added: pos(raw.added),
    removed: pos(raw.removed),
    k: bp3161Int(raw.k, 0, 32),
    a: pos(raw.a),
    b: pos(raw.b),
    bit: bit && bit.length === axis + 1 ? bit : null,
    frame: raw.frame === "update" || raw.frame === "query" ? raw.frame : null,
    i: bp3161Int(raw.i, 0, 2 * axis + 2),
    node: bp3161Int(raw.node, 1, axis),
    path: (bp3161Ints(raw.path, 1, axis, 16) || []),
    raised: bp3161Int(raw.raised, 1, axis),
    merging: raw.merging === true,
    x: bp3161Int(raw.x, 1, axis),
    sz: bp3161Int(raw.sz, 1, 99),
    best: bp3161Int(raw.best, 0, 99),
    tail: bp3161Int(raw.tail, 0, 99),
    fit: typeof raw.fit === "boolean" ? raw.fit : null,
    ans: bp3161Bools(raw.ans, 16) || [],
    answer: finalFlag ? bp3161Bools(raw.answer, 16) : null,
    final: finalFlag,
  };
}

// ---------- Picture: one shared position axis ----------

const BP3161_PAD_L = 40;
const BP3161_PAD_R = 16;
const BP3161_BLOCK_Y = 6;
const BP3161_BLOCK_H = 18;
const BP3161_BAND_Y = 26;
const BP3161_BAND_H = 34;
const BP3161_POST_Y = 28;
const BP3161_POST_H = 30;
const BP3161_GAP_Y = 34;
const BP3161_GAP_H = 18;
const BP3161_TAIL_Y = 64;
const BP3161_TAIL_H = 14;
const BP3161_TICK_Y = 94;
const BP3161_BIT_Y = 102;
const BP3161_ROW = 24;
const BP3161_NODE_H = 20;
const BP3161_GLYPH = 6.6; // 11px monospace ≈ 0.6em per glyph

const bp3161Low = (i) => i & -i;
const bp3161Levels = (n) => Math.floor(Math.log2(Math.max(1, n))) + 1;
const BP3161_A_EVENTS = new Set(["for-gap", "build-update", "neighbors", "remove", "merge-update", "continue", "prev", "ask", "append"]);
const BP3161_B_EVENTS = new Set(["for-gap", "build-update", "neighbors", "remove", "merge-update", "continue"]);

function bp3161Layout(state) {
  const unit = Math.max(26, Math.min(40, Math.floor(440 / state.axis)));
  const x = (p) => BP3161_PAD_L + p * unit;
  const levels = bp3161Levels(state.axis);
  return { unit, x, levels, width: x(state.axis) + BP3161_PAD_R, height: BP3161_BIT_Y + levels * BP3161_ROW };
}

function bp3161Roles(state) {
  const showB = BP3161_B_EVENTS.has(state.event) || state.frame === "update";
  const showA = showB || BP3161_A_EVENTS.has(state.event) || state.frame === "query";
  return { a: showA ? state.a : null, b: showB ? state.b : null };
}

// The space the block is drawn in on the append step: the tail [a, x] when it is at least the best stored gap,
// else the leftmost current gap ending by a whose length equals the BIT answer.
function bp3161Choice(state) {
  if (state.event !== "append" || !state.obs || state.a === null || state.x === null || state.best === null || state.tail === null) return null;
  if (state.tail >= state.best) return { kind: "tail", start: state.a, length: state.tail };
  for (let t = 1; t < state.obs.length; t++) {
    const [lo, hi] = [state.obs[t - 1], state.obs[t]];
    if (hi <= state.a && hi - lo === state.best) return { kind: "gap", start: lo, end: hi, length: state.best };
  }
  return { kind: "tail", start: state.a, length: state.tail };
}

function bp3161Picture(state, copy) {
  const L = bp3161Layout(state);
  const { unit, x } = L;
  const parts = [];
  const roles = bp3161Roles(state);
  const choice = bp3161Choice(state);
  const inPrefix = state.x !== null && (state.event === "prev" || state.event === "ask" || state.event === "append" || state.frame === "query");
  const showTail = state.x !== null && state.a !== null && state.tail !== null && (state.event === "ask" || state.event === "append");

  // (a) The block, only on the append step.
  if (choice && state.sz !== null && state.fit !== null) {
    const room = state.axis - choice.start;
    const cells = Math.min(state.sz, room);
    const width = cells * unit - 2;
    const mark = state.fit ? "✓" : "✗";
    const full = `sz=${state.sz} ${mark}`;
    const label = full.length * BP3161_GLYPH + 6 <= width ? full : `${state.sz}${mark}`;
    const cls = `${state.fit ? " is-fit" : " is-nofit"}${state.sz > room ? " is-cut" : ""}`;
    parts.push(`<rect class="bp3161-block${cls}" data-block="${state.sz}" x="${x(choice.start) + 1}" y="${BP3161_BLOCK_Y}" width="${width}" height="${BP3161_BLOCK_H}" rx="4"/>`);
    parts.push(`<text class="bp3161-block-label${cls}" x="${x(choice.start) + 1 + width / 2}" y="${BP3161_BLOCK_Y + 13}">${bp3161Escape(label)}</text>`);
  }

  // (b) Prefix band [0, x], then gaps, then posts (live, sentinel, ghost).
  if (inPrefix) {
    parts.push(`<rect class="bp3161-prefix" x="${x(0)}" y="${BP3161_BAND_Y}" width="${state.x * unit}" height="${BP3161_BAND_H}" rx="3"/>`);
  }
  const ghosts = [...state.ghosts, ...(state.removed !== null ? [state.removed] : [])];
  if (state.obs) {
    parts.push(`<text class="bp3161-row-label" x="${BP3161_PAD_L - 6}" y="${BP3161_GAP_Y + 13}">gap</text>`);
    for (let t = 1; t < state.obs.length; t++) {
      const lo = state.obs[t - 1];
      const hi = state.obs[t];
      const cur = roles.a === lo && roles.b === hi;
      const cls = `${cur ? " is-cur" : ""}${cur && state.merging ? " is-merged" : ""}${choice && choice.kind === "gap" && choice.start === lo ? " is-best" : ""}`;
      parts.push(`<rect class="bp3161-gap${cls}" data-gap="${lo}-${hi}" x="${x(lo) + 4}" y="${BP3161_GAP_Y}" width="${(hi - lo) * unit - 8}" height="${BP3161_GAP_H}" rx="3"/>`);
      // Put the length in the widest stretch between ghost posts so the label never sits on one.
      const cuts = [lo, ...ghosts.filter((g) => g > lo && g < hi).sort((p, r) => p - r), hi];
      let span = [cuts[0], cuts[1]];
      for (let c = 2; c < cuts.length; c++) if (cuts[c] - cuts[c - 1] > span[1] - span[0]) span = [cuts[c - 1], cuts[c]];
      parts.push(`<text class="bp3161-gap-label${cls}" x="${(x(span[0]) + x(span[1])) / 2}" y="${BP3161_GAP_Y + 13}">${hi - lo}</text>`);
    }
    ghosts.forEach((p) => {
      parts.push(`<rect class="bp3161-post is-ghost${p === state.removed ? " is-removed" : ""}" data-ghost="${p}" x="${x(p) - 3}" y="${BP3161_POST_Y}" width="6" height="${BP3161_POST_H}" rx="2"/>`);
    });
    state.obs.forEach((p) => {
      const cls = `${p === 0 || p === state.axis ? " is-sentinel" : ""}${p === state.added ? " is-new" : ""}${p === roles.a ? " is-a" : ""}${p === roles.b ? " is-b" : ""}`;
      parts.push(`<rect class="bp3161-post${cls}" data-post="${p}" x="${x(p) - 3}" y="${BP3161_POST_Y}" width="6" height="${BP3161_POST_H}" rx="2"/>`);
    });
  }

  // (c) Tail gap from the last obstacle a to x.
  if (showTail) {
    parts.push(`<text class="bp3161-row-label" x="${BP3161_PAD_L - 6}" y="${BP3161_TAIL_Y + 11}">tail</text>`);
    const best = choice && choice.kind === "tail" ? " is-best" : "";
    if (state.tail > 0) {
      parts.push(`<rect class="bp3161-tail${best}" x="${x(state.a) + 1}" y="${BP3161_TAIL_Y}" width="${state.tail * unit - 2}" height="${BP3161_TAIL_H}" rx="3"/>`);
      parts.push(`<text class="bp3161-tail-label${best}" x="${(x(state.a) + x(state.x)) / 2}" y="${BP3161_TAIL_Y + 11}">${state.tail}</text>`);
    } else {
      parts.push(`<text class="bp3161-tail-label is-zero" x="${x(state.a) + 10}" y="${BP3161_TAIL_Y + 11}">0</text>`);
    }
  }

  // (d) Position ticks.
  for (let p = 0; p <= state.axis; p++) {
    parts.push(`<text class="bp3161-tick${p === state.x ? " is-x" : ""}" x="${x(p)}" y="${BP3161_TICK_Y}">${p}</text>`);
  }

  // (e) BIT: node i covers (i − lowbit(i), i]; one row per lowbit level.
  if (state.bit) {
    parts.push(`<text class="bp3161-row-label" x="${BP3161_PAD_L - 6}" y="${BP3161_BIT_Y + 14}">bit</text>`);
    for (let i = 1; i <= state.axis; i++) {
      const level = Math.log2(bp3161Low(i));
      const top = BP3161_BIT_Y + level * BP3161_ROW;
      const value = state.bit[i];
      const cls = `${state.path.includes(i) ? " is-path" : ""}${i === state.node ? " is-cur" : ""}${i === state.raised ? " is-raised" : ""}${value === 0 ? " is-zero" : ""}`;
      const left = x(i - bp3161Low(i)) + 1;
      const width = bp3161Low(i) * unit - 2;
      parts.push(`<rect class="bp3161-node${cls}" data-node="${i}" x="${left}" y="${top}" width="${width}" height="${BP3161_NODE_H}" rx="4"/>`);
      parts.push(`<text class="bp3161-node-label${cls}" x="${left + width / 2}" y="${top + 14}">${value}</text>`);
    }
  }

  const letters = (list) => `[${list.map((v) => (v ? "T" : "F")).join(", ")}]`;
  const label = state.final && state.answer
    ? `${copy.answer} ${letters(state.answer)}`
    : state.obs ? `${state.axis} ${copy.positions}, ${state.obs.length - 2} ${copy.obstacles}`
      : `${state.queries.length} ${copy.count}`;
  return `<svg class="bp3161-svg" width="${L.width}" height="${L.height}" viewBox="0 0 ${L.width} ${L.height}" role="img" aria-label="${bp3161Escape(label)}">${parts.join("")}</svg>`;
}

// ---------- Query chips and fit card ----------

function bp3161Reverse(state) {
  return state.line >= 30 || state.frame === "query" || state.merging;
}

function bp3161Queries(state, copy) {
  const type2 = state.queries.map((row, index) => (row[0] === 2 ? index : -1)).filter((index) => index >= 0);
  const answered = new Map();
  state.ans.forEach((value, j) => {
    const index = type2[type2.length - 1 - j];
    if (index !== undefined) answered.set(index, value);
  });
  const chips = state.queries.map((row, index) => {
    const text = row[0] === 1 ? `+${row[1]}` : `${row[1]},${row[2]}`;
    const mark = answered.has(index)
      ? `<b class="bp3161-mark ${answered.get(index) ? "is-true\">✓" : "is-false\">✗"}</b>`
      : "";
    return `<span class="bp3161-q is-t${row[0]}${index === state.qi ? " is-cur" : ""}" data-q="${index}">${bp3161Escape(text)}${mark}</span>`;
  }).join("");
  const arrow = bp3161Reverse(state) && !state.final ? `<span class="bp3161-reverse">${bp3161Escape(copy.reverse)}</span>` : "";
  return `<div class="bp3161-queries" aria-label="${bp3161Escape(copy.queries)}">${chips}${arrow}</div>`;
}

function bp3161FitCard(state, copy) {
  if (state.event !== "ask" && state.event !== "append") return "";
  const cell = (name, value) => `<span class="bp3161-mini"><small>${name}</small><b>${value === null ? "?" : value}</b></span>`;
  const verdict = state.fit === null ? ""
    : `<span class="bp3161-verdict ${state.fit ? "is-true\">✓" : "is-false\">✗"}</span>`;
  return `<div class="bp3161-fit"><b>${bp3161Escape(copy.fit)}</b>${cell("best", state.best)}${cell("tail", state.tail)}<span class="bp3161-ge">≥</span>${cell("sz", state.sz)}${verdict}</div>`;
}

// ---------- Current-line strip (source lives in the shared #codePanel) ----------

function bp3161List(values) {
  return `[${values.join(", ")}]`;
}

function bp3161Effect(state) {
  const q = state.q;
  const lastPath = state.path.length ? state.path[state.path.length - 1] : null;
  const pathMax = state.bit ? Math.max(0, ...state.path.map((j) => state.bit[j])) : 0;
  const v = state.a !== null && state.b !== null ? state.b - state.a : null;
  switch (state.event) {
    case "import-bisect": return "bisect_right, insort";
    case "import-list": return "List";
    case "class-bit": return "BIT";
    case "class-sol": return "Solution";
    case "call": return `len(queries) = ${state.queries.length}`;
    case "n": return `n = ${state.n}`;
    case "obs":
    case "insort":
    case "remove": return state.obs ? `obs = ${bp3161List(state.obs)}` : "";
    case "for-q":
    case "for-rev": return q ? `q = ${bp3161List(q)}` : "";
    case "for-q-done":
    case "for-gap-done":
    case "for-rev-done": return "StopIteration";
    case "type-check":
    case "kind-check": return q ? `${q[0]} == 1` : "";
    case "bit-new": return `bit = BIT(${state.n})`;
    case "init-call": return `n = ${state.n}`;
    case "init-t": return `t = [0] * ${state.axis + 1}`;
    case "for-gap":
    case "neighbors": return `a, b = ${state.a}, ${state.b}`;
    case "build-update":
    case "merge-update": return v !== null ? `update(${state.b}, ${v})` : "";
    case "upd-call": return v !== null ? `i, v = ${state.i}, ${v}` : "";
    case "upd-check": return `${state.i} < ${state.axis + 1}`;
    case "upd-max": return lastPath !== null && state.bit ? `t[${lastPath}] = ${state.bit[lastPath]}` : "";
    case "upd-step":
    case "qry-step":
    case "qry-call": return `i = ${state.i}`;
    case "ans": return "ans = []";
    case "bisect": return `k = ${state.k}`;
    case "continue": return "continue";
    case "prev": return `a = ${state.a}`;
    case "ask": return `x − a = ${state.tail}`;
    case "append": return state.fit === null ? "" : `ans.append(${state.fit ? "True" : "False"})`;
    case "best0": return "best = 0";
    case "qry-check": return `${state.i} > 0`;
    case "qry-max": return `best = ${pathMax}`;
    case "qry-return": return `return ${state.best}`;
    case "return": return state.answer ? `return ${bp3161List(state.answer.map((b) => (b ? "True" : "False")))}` : "";
    default: return "";
  }
}

function bp3161Code(state, copy) {
  const effect = bp3161Effect(state);
  const badge = state.condition !== null
    ? `<b class="bp3161-branch${state.condition ? " is-true" : " is-false"}">${state.condition ? "True" : "False"}</b>`
    : state.event === "append" && state.fit !== null
      ? `<b class="bp3161-verdict ${state.fit ? "is-true\">✓" : "is-false\">✗"}</b>`
      : "";
  return `<header><b>${bp3161Escape(copy.code)}</b></header><div class="bp3161-now" data-code-line="${state.line}" aria-current="step"><span class="bp3161-lineno">L${state.line}</span>${effect ? `<code class="bp3161-effect">↳ ${bp3161Escape(effect)}</code>` : ""}${badge}</div>`;
}

// ---------- Navigation (same contract as other line-by-line renderers) ----------

function bp3161Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  return steps.findIndex((step, index) => {
    const view = step && step.blockPlace3161View;
    if (index <= stepIndex || !view) return false;
    if (kind === "line") return true;
    if (kind === "query") return view.event === "for-q" || view.event === "for-rev";
    if (kind === "result") return Boolean(step.final);
    return false;
  });
}

function bp3161Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function bp3161Bind(host) {
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
  bind("[data-bp3161-jump]", (element) => bp3161Go(bp3161Next(element.dataset.bp3161Jump)));
  bind("[data-bp3161-case]", (element) => {
    const preset = BP3161_CASES[Number(element.dataset.bp3161Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    if (typeof runViz === "function") runViz();
  });
}

function renderBlockPlacement3161View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const vi = bp3161IsVi();
  const copy = BP3161_COPY[vi ? "vi" : "en"];
  const state = bp3161Normalize(step);
  const heading = state.final && state.answer
    ? `return ${bp3161List(state.answer.map((b) => (b ? "True" : "False")))}`
    : state.q && state.qi !== null ? `q = ${bp3161List(state.q)}`
      : "getResults(queries)";
  const type2 = state.queries.filter((row) => row[0] === 2).length;
  const status = `ans ${state.ans.length}/${type2}`;
  const presets = BP3161_CASES.map((preset, index) => `<button type="button" data-bp3161-case="${index}">${bp3161Escape(vi ? preset[1] : preset[2])}</button>`).join("");
  const jumps = copy.jumps.map(([kind, label]) => `<button type="button" data-bp3161-jump="${kind}"${bp3161Next(kind) < 0 ? " disabled" : ""}>${bp3161Escape(label)}</button>`).join("");
  const G = copy.legend;
  const legend = `<div class="bp3161-legend" aria-hidden="true"><span class="lg-post">${bp3161Escape(G.post)}</span><span class="lg-gap">${bp3161Escape(G.gap)}</span><span class="lg-node">${bp3161Escape(G.node)}</span><span class="lg-path">${bp3161Escape(G.path)}</span><span class="lg-block">${bp3161Escape(G.block)}</span></div>`;

  host.innerHTML = `<article class="bp3161-viz${state.final ? " is-final" : ""}" data-problem-id="3161" data-source-line="${state.line}" role="region" aria-label="LeetCode 3161 · ${vi ? "dòng" : "line"} ${state.line}">`
    + `<header class="bp3161-head"><div><small>LEETCODE 3161 · BLOCK PLACEMENT</small><h2><code>${bp3161Escape(heading)}</code></h2></div><span class="bp3161-status">${bp3161Escape(status)}</span></header>`
    + `<nav class="bp3161-presets" aria-label="${bp3161Escape(copy.examples)}">${presets}</nav>`
    + `<section class="bp3161-card bp3161-query-card">${bp3161Queries(state, copy)}${bp3161FitCard(state, copy)}</section>`
    + `<section class="bp3161-card bp3161-picture-card" aria-label="${bp3161Escape(copy.picture)}"><header><b>${bp3161Escape(copy.picture)}</b></header>${bp3161Picture(state, copy)}${legend}</section>`
    + `<section class="bp3161-card bp3161-code-card" aria-label="${bp3161Escape(copy.code)}">${bp3161Code(state, copy)}</section>`
    + `<footer class="bp3161-foot">${jumps}</footer></article>`;
  bp3161Bind(host);
}
