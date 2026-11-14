"use strict";

// Interview 9025 — YouTube Trending Videos (Top K). Picture-first renderer, one picture per approach:
//   1. score bars (dict order) + the size-k min-heap drawn as a tree (rebuilt each call) + res and the reversed top;
//   2. score bars + the SortedList of (score, id) with the moved entry sliding to its new slot and the top-k cutoff;
//   3. the doubly linked chain of score buckets (tail at the top) with prev/next arrows, cur/nxt/node pointers and the
//      top-k walk.
// The Python source is shown once, in the shared #codePanel, highlighted by script.js from step.codeLines; locals are
// shown once, in the shared Variables panel. Every <text> carries its text-anchor and, when it sits on a shape,
// data-own matching that shape's data-key, so tests can check overlaps from the markup.

const YT9025_LINE_COUNT = [0, 25, 17, 35];

// Preset inputs: [input, Vietnamese label, English label]. The first preset is the default input.
const YT9025_CASES = Object.freeze([
  ["2 | 1:3, 2:3, 3:4 | 1, 2, 2, 4, 3", "Ví dụ", "Example"],
  ["2 | 1:3, 2:3, 3:4 | 1", "Như ảnh đề", "Screenshot"],
  ["3 | a:2, b:5, c:1, d:4 | c, c, a, e, c, c", "k = 3", "k = 3"],
  ["1 | x:2, y:1 | y, y, z", "k = 1", "k = 1"],
]);

const YT9025_COPY = Object.freeze({
  vi: Object.freeze({
    picture: ["", "Điểm, heap và kết quả", "Điểm và SortedList", "Chuỗi xô điểm"],
    code: "Dòng đang chạy",
    examples: "Ví dụ",
    calls: "Lượt gọi",
    videos: "video",
    buckets: "xô",
    answer: "Kết quả",
    jumps: [["line", "Dòng →"], ["call", "Lượt kế →"], ["result", "Kết quả ↠"]],
    legend: {
      1: [["bar", "▬ điểm"], ["plus", "▬ +1"], ["scan", "▬ đang xét"], ["node", "▭ heap"], ["drop", "▭ bị pop"], ["out", "▭ top"]],
      2: [["bar", "▬ điểm"], ["plus", "▬ +1"], ["node", "▭ SortedList"], ["cut", "┃ mốc top k"], ["out", "▭ top"]],
      3: [["bucket", "▭ xô điểm"], ["link", "⇅ prev/next"], ["plus", "▭ video đổi"], ["scan", "▬ node"], ["out", "▭ đã lấy"]],
    },
  }),
  en: Object.freeze({
    picture: ["", "Scores, heap and result", "Scores and SortedList", "Score bucket chain"],
    code: "Current line",
    examples: "Examples",
    calls: "Calls",
    videos: "videos",
    buckets: "buckets",
    answer: "Result",
    jumps: [["line", "Line →"], ["call", "Next call →"], ["result", "Result ↠"]],
    legend: {
      1: [["bar", "▬ score"], ["plus", "▬ +1"], ["scan", "▬ scanning"], ["node", "▭ heap"], ["drop", "▭ popped"], ["out", "▭ top"]],
      2: [["bar", "▬ score"], ["plus", "▬ +1"], ["node", "▭ SortedList"], ["cut", "┃ top-k cut"], ["out", "▭ top"]],
      3: [["bucket", "▭ score bucket"], ["link", "⇅ prev/next"], ["plus", "▭ moving video"], ["scan", "▬ node"], ["out", "▭ taken"]],
    },
  }),
});

function yt9025Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function yt9025IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function yt9025Int(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

const YT9025_ID = /^[A-Za-z0-9]{1,3}$/;
const yt9025Id = (value) => (typeof value === "string" && YT9025_ID.test(value) ? value : null);
const yt9025Ids = (value, limit) => (Array.isArray(value) && value.length <= limit && value.every((id) => yt9025Id(id) !== null) ? value.slice() : null);
// [id, score] pairs (videos) or [score, id] tuples (heap, SortedList).
const yt9025Pairs = (value, limit) => (Array.isArray(value) && value.length <= limit
  && value.every((p) => Array.isArray(p) && p.length === 2 && yt9025Id(p[0]) !== null && yt9025Int(p[1], 0, 99) !== null) ? value.map((p) => p.slice()) : null);
const yt9025Tuples = (value, limit) => (Array.isArray(value) && value.length <= limit
  && value.every((t) => Array.isArray(t) && t.length === 2 && yt9025Int(t[0], 0, 99) !== null && yt9025Id(t[1]) !== null) ? value.map((t) => t.slice()) : null);
const yt9025Tuple = (value) => (Array.isArray(value) ? (yt9025Tuples([value], 1) || [null])[0] : null);

// Validates the builder's view model so malformed data never reaches innerHTML unescaped.
function yt9025Normalize(step) {
  const raw = step && step.yt9025View && typeof step.yt9025View === "object" ? step.yt9025View : {};
  const approach = raw.approach === 2 || raw.approach === 3 ? raw.approach : 1;
  const count = YT9025_LINE_COUNT[approach];
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = yt9025Int(raw.line, 1, count) ?? yt9025Int(fallbackLine, 1, count) ?? 1;
  const calls = yt9025Ids(raw.calls, 8) || [];
  const videos = yt9025Pairs(raw.videos, 8) || [];
  const finalFlag = raw.final === true || Boolean(step && step.final);
  const idList = (value) => (Array.isArray(value) && value.length <= 8 ? value.map((r) => yt9025Ids(r, 5) || []) : []);
  const chain = Array.isArray(raw.chain) && raw.chain.length <= 12
    ? raw.chain.filter((b) => b && (b.score === null || yt9025Int(b.score, 0, 99) !== null)).map((b) => ({ score: b.score, ids: yt9025Ids(b.ids, 8) || [] }))
    : [];
  const at = (value) => yt9025Int(value, 0, Math.max(0, chain.length - 1)) ?? -1;
  const ghost = raw.ghost && yt9025Int(raw.ghost.score, 1, 99) !== null && yt9025Int(raw.ghost.at, 0, 12) !== null ? { score: raw.ghost.score, at: raw.ghost.at } : null;
  const making = typeof raw.making === "string" && /^(?:\d{1,2}|inf)$/.test(raw.making) ? raw.making : null;
  return {
    approach,
    line,
    event: typeof raw.event === "string" && /^[a-z0-9-]{1,24}$/.test(raw.event) ? raw.event : "",
    condition: typeof raw.condition === "boolean" ? raw.condition : null,
    k: yt9025Int(raw.k, 1, 5) ?? 1,
    calls,
    ci: yt9025Int(raw.ci, 0, Math.max(0, calls.length - 1)),
    videoId: yt9025Id(raw.videoId),
    videos,
    maxScore: yt9025Int(raw.maxScore, 1, 99) ?? Math.max(1, ...videos.map((p) => p[1])),
    maxVideos: Math.max(videos.length, yt9025Int(raw.maxVideos, 0, 8) ?? 0),
    bumped: yt9025Id(raw.bumped),
    scan: yt9025Id(raw.scan),
    warm: yt9025Id(raw.warm),
    heap: yt9025Tuples(raw.heap, 6),
    heapAt: yt9025Int(raw.heapAt, 0, 5),
    popped: yt9025Tuple(raw.popped),
    ranked: yt9025Tuples(raw.ranked, 8),
    removed: yt9025Tuple(raw.removed),
    removedAt: yt9025Int(raw.removedAt, 0, 7),
    movedTo: yt9025Int(raw.movedTo, 0, 7),
    movedFrom: yt9025Int(raw.movedFrom, 0, 7),
    chain,
    curAt: at(raw.curAt),
    nxtAt: at(raw.nxtAt),
    nodeAt: at(raw.nodeAt),
    ghost,
    making,
    floating: yt9025Int(raw.floating, 1, 99),
    linked: yt9025Int(raw.linked, 1, 99),
    res: yt9025Ids(raw.res, 6),
    out: yt9025Ids(raw.out, 5),
    results: idList(raw.results),
    final: finalFlag,
    answer: finalFlag ? idList(raw.answer) : null,
  };
}

// ---------- SVG helpers ----------

const YT9025_W = 480;
const YT9025_HEAD = 24;

function yt9025Text(cls, x, y, value, anchor = "start", own = null) {
  return `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}"${own ? ` data-own="${own}"` : ""}>${yt9025Escape(value)}</text>`;
}

function yt9025Rect(cls, x, y, w, h, key = null, extra = "") {
  return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"${key ? ` data-key="${key}"` : ""}${extra}/>`;
}

// Score bars, one row per video in dict order (what self.videos.items() visits). Returns the bottom y.
function yt9025Bars(state, parts) {
  const unit = Math.max(5, Math.min(14, Math.floor(150 / state.maxScore)));
  state.videos.forEach(([id, s], r) => {
    const top = YT9025_HEAD + r * 24;
    const isScan = id === state.scan;
    const isBump = id === state.bumped || id === state.warm;
    if (isScan) parts.push(yt9025Rect("yt9025-band", 2, top, 206, 22, null, ' data-layer="bg"'));
    parts.push(yt9025Text(`yt9025-id${isBump ? " is-bump" : ""}`, 30, top + 15, id, "end"));
    const base = id === state.bumped && s > 0 ? s - 1 : s;
    if (base > 0) parts.push(yt9025Rect("yt9025-bar", 36, top + 4, base * unit - 1, 14, null, ` data-bar="${yt9025Escape(id)}"`));
    if (id === state.bumped && s > 0) parts.push(yt9025Rect("yt9025-plus", 36 + base * unit, top + 4, unit - 1, 14, null, ` data-plus="${yt9025Escape(id)}"`));
    parts.push(yt9025Text(`yt9025-score${isBump ? " is-bump" : ""}`, 36 + s * unit + 4, top + 15, s));
  });
  return YT9025_HEAD + state.maxVideos * 24;
}

// res (as built) and the returned top (reversed / final order) as two rows of boxes. Returns the bottom y.
function yt9025ResultRows(state, parts, y) {
  const row = (label, ids, cls, top, key) => {
    parts.push(yt9025Text("yt9025-row-label", 30, top + 15, label, "end"));
    for (let j = 0; j < Math.max(ids.length, 1); j++) {
      const id = ids[j];
      const k = `${key}${j}`;
      parts.push(yt9025Rect(`yt9025-box${id === undefined ? " is-empty" : cls}`, 36 + j * 46, top, 40, 22, k));
      if (id !== undefined) parts.push(yt9025Text(`yt9025-box-text${cls}`, 56 + j * 46, top + 15, id, "middle", k));
    }
  };
  row("res", state.res || [], "", y, "res");
  row("top", state.event === "return" && state.out ? state.out : [], " is-out", y + 30, "out");
  return y + 52;
}

// ---------- Approach 1: min-heap tree ----------

function yt9025HeapPicture(state, parts) {
  const barsBottom = yt9025Bars(state, parts);
  parts.push(yt9025Text("yt9025-head-label", 36, 14, "self.videos"));
  parts.push(yt9025Text("yt9025-head-label", 226, 14, "min_heap"));
  const levels = Math.floor(Math.log2(state.k + 1)) + 1;
  const center = (i) => {
    const level = Math.floor(Math.log2(i + 1));
    const idx = i - (2 ** level - 1);
    return { level, cx: level === 0 ? 334 : level === 1 ? 278 + idx * 112 : 250 + idx * 56, top: YT9025_HEAD + level * 46 };
  };
  const heap = state.heap || [];
  heap.forEach((_, i) => {
    if (i === 0) return;
    const c = center(i);
    const p = center((i - 1) >> 1);
    parts.push(`<path class="yt9025-edge" d="M ${p.cx} ${p.top + 30} L ${c.cx} ${c.top}"/>`);
  });
  heap.forEach(([s, id], i) => {
    const { cx, top } = center(i);
    const key = `h${i}`;
    const cls = `${i === 0 ? " is-root" : ""}${i === state.heapAt && state.event === "push" ? " is-new" : ""}${id === state.bumped ? " is-bump" : ""}`;
    parts.push(yt9025Rect(`yt9025-node${cls}`, cx - 24, top, 48, 30, key, ` data-heap="${i}"`));
    parts.push(yt9025Text(`yt9025-node-id${cls}`, cx, top + 13, id, "middle", key));
    parts.push(yt9025Text(`yt9025-node-score${cls}`, cx, top + 26, s, "middle", key));
  });
  if (state.popped && (state.event === "drop" || state.event === "take")) {
    const cls = state.event === "drop" ? " is-drop" : " is-take";
    parts.push(yt9025Rect(`yt9025-node${cls}`, 394, YT9025_HEAD, 48, 30, "pop", ' data-popped="1"'));
    parts.push(yt9025Text(`yt9025-node-id${cls}`, 418, YT9025_HEAD + 13, state.popped[1], "middle", "pop"));
    parts.push(yt9025Text(`yt9025-node-score${cls}`, 418, YT9025_HEAD + 26, state.popped[0], "middle", "pop"));
  }
  const heapBottom = YT9025_HEAD + levels * 46;
  return yt9025ResultRows(state, parts, Math.max(barsBottom, heapBottom) + 10);
}

// ---------- Approach 2: SortedList row ----------

function yt9025SortedPicture(state, parts) {
  const barsBottom = yt9025Bars(state, parts);
  parts.push(yt9025Text("yt9025-head-label", 36, 14, "self.videos"));
  const liftY = barsBottom + 8;
  const listY = liftY + 40;
  const x = (j) => 36 + j * 54;
  const list = state.ranked || [];
  parts.push(yt9025Text("yt9025-row-label", 30, listY + 19, "list", "end"));
  // The removed entry, lifted above its old slot while it waits to be re-added.
  if (state.removed && state.removedAt !== null && (state.event === "remove" || state.event === "bump")) {
    const [s, id] = state.removed;
    parts.push(yt9025Rect("yt9025-node is-lifted", x(state.removedAt), liftY, 46, 30, "lift", ' data-lifted="1"'));
    parts.push(yt9025Text("yt9025-node-id is-lifted", x(state.removedAt) + 23, liftY + 13, id, "middle", "lift"));
    parts.push(yt9025Text("yt9025-node-score is-lifted", x(state.removedAt) + 23, liftY + 26, s, "middle", "lift"));
  }
  const cut = Math.max(0, list.length - state.k);
  list.forEach(([s, id], j) => {
    const key = `r${j}`;
    const moved = state.event === "add" && j === state.movedTo;
    const cls = `${j >= cut ? " is-top" : ""}${id === state.bumped ? " is-bump" : ""}${moved ? " is-moved" : ""}`;
    const dx = moved ? (state.movedFrom === null ? 0 : (state.movedFrom - j) * 54) : 0;
    const open = moved ? `<g class="yt9025-move" style="--yt9025-dx: ${dx}px; --yt9025-dy: -40px">` : "";
    parts.push(open);
    parts.push(yt9025Rect(`yt9025-node${cls}`, x(j), listY, 46, 30, key, ` data-ranked="${j}"`));
    parts.push(yt9025Text(`yt9025-node-id${cls}`, x(j) + 23, listY + 13, id, "middle", key));
    parts.push(yt9025Text(`yt9025-node-score${cls}`, x(j) + 23, listY + 26, s, "middle", key));
    if (moved) parts.push("</g>");
  });
  if (list.length) {
    parts.push(yt9025Rect("yt9025-cut", x(cut) - 5, listY - 2, 2, 34));
    parts.push(yt9025Text("yt9025-cut-label", x(cut), listY + 44, `top k=${state.k} →`));
  }
  return yt9025ResultRows(state, parts, listY + 54);
}

// ---------- Approach 3: bucket chain, tail on top ----------

function yt9025BucketRows(state) {
  const rows = state.chain.map((b, i) => ({ kind: "bucket", score: b.score, ids: b.ids, chainAt: i }));
  const floatScore = state.making !== null ? state.making : state.floating !== null ? String(state.floating) : null;
  if (state.ghost) rows.splice(Math.min(state.ghost.at, rows.length), 0, { kind: "ghost", score: state.ghost.score, ids: [], chainAt: -1 });
  if (floatScore !== null) {
    const after = state.curAt >= 0 ? state.curAt + 1 : rows.length;
    rows.splice(after, 0, { kind: "float", score: floatScore === "inf" ? null : Number(floatScore), ids: [], chainAt: -1 });
  }
  return rows.reverse();
}

function yt9025BucketPicture(state, parts) {
  const rows = yt9025BucketRows(state);
  const top = (d) => YT9025_HEAD + d * 36;
  parts.push(yt9025Text("yt9025-head-label", 36, 14, "tail ↑ next · prev ↓ head"));
  const res = state.res || [];
  rows.forEach((row, d) => {
    const y = top(d);
    const isNode = row.kind === "bucket" && row.chainAt === state.nodeAt && ["walk", "for-id", "append", "for-done", "node", "node-prev"].includes(state.event);
    if (isNode) parts.push(yt9025Rect("yt9025-band", 30, y - 3, 360, 32, null, ' data-layer="bg"'));
    const key = `b${d}`;
    const sentinel = row.kind === "bucket" && (row.chainAt === 0 || row.score === null);
    const isNew = row.kind === "bucket" && state.linked !== null && row.score === state.linked;
    const cls = `${sentinel ? " is-sentinel" : ""}${row.kind === "ghost" ? " is-ghost" : ""}${row.kind === "float" ? " is-float" : ""}${isNew ? " is-new" : ""}`;
    parts.push(yt9025Rect(`yt9025-bucket${cls}`, 36, y, 40, 26, key, ` data-bucket="${row.score === null ? "inf" : row.score}"`));
    parts.push(yt9025Text(`yt9025-bucket-score${cls}`, 56, y + 17, row.score === null ? "∞" : row.score, "middle", key));
    row.ids.forEach((id, j) => {
      const ck = `${key}c${j}`;
      const leaving = row.chainAt === state.curAt && row.chainAt !== state.nxtAt && id === state.bumped;
      const ccls = `${id === state.bumped && !leaving ? " is-bump" : ""}${leaving ? " is-leaving" : ""}${res.includes(id) ? " is-picked" : ""}`;
      parts.push(yt9025Rect(`yt9025-chip${ccls}`, 84 + j * 38, y + 2, 34, 22, ck, ` data-chip="${yt9025Escape(id)}"`));
      parts.push(yt9025Text(`yt9025-chip-text${ccls}`, 101 + j * 38, y + 17, id, "middle", ck));
    });
    // Pointer tags at fixed columns so two pointers on one row never collide.
    const onRow = (at) => (at >= 0 ? row.kind === "bucket" && row.chainAt === at : false);
    const curHere = onRow(state.curAt) || (state.curAt < 0 && row.kind === "ghost" && state.event === "unlink");
    const nxtHere = onRow(state.nxtAt) || (state.nxtAt < 0 && row.kind === "float" && state.line >= 19);
    if (curHere && state.ci !== null) parts.push(yt9025Text("yt9025-ptr is-cur", 392, y + 17, "cur"));
    if (nxtHere && state.ci !== null) parts.push(yt9025Text("yt9025-ptr is-nxt", 420, y + 17, "nxt"));
    if (onRow(state.nodeAt) && state.ci !== null) parts.push(yt9025Text("yt9025-ptr is-node", 448, y + 17, "node"));
    // prev/next arrows to the row below (next points up toward the tail, prev points down toward the head).
    if (d + 1 < rows.length && row.kind !== "ghost" && rows[d + 1].kind !== "ghost") {
      const pending = row.kind === "float" || rows[d + 1].kind === "float" ? " is-pending" : "";
      const y1 = y + 26;
      const y2 = top(d + 1);
      parts.push(`<path class="yt9025-link${pending}" d="M 48 ${y2} L 48 ${y1 + 1} M 45 ${y1 + 4} L 48 ${y1 + 1} L 51 ${y1 + 4}"/>`);
      parts.push(`<path class="yt9025-link${pending}" d="M 64 ${y1} L 64 ${y2 - 1} M 61 ${y2 - 4} L 64 ${y2 - 1} L 67 ${y2 - 4}"/>`);
    }
  });
  return yt9025ResultRows(state, parts, top(Math.max(rows.length, 1)) + 4);
}

function yt9025Picture(state, copy) {
  const parts = [];
  const bottom = state.approach === 1 ? yt9025HeapPicture(state, parts) : state.approach === 2 ? yt9025SortedPicture(state, parts) : yt9025BucketPicture(state, parts);
  const height = bottom + 8;
  const answer = state.final && state.answer && state.answer.length ? state.answer[state.answer.length - 1] : null;
  const label = answer
    ? `${copy.answer}: ${answer.join(", ")}`
    : state.approach === 3 ? `${state.chain.length} ${copy.buckets}, k = ${state.k}` : `${state.videos.length} ${copy.videos}, k = ${state.k}`;
  return `<svg class="yt9025-svg" width="${YT9025_W}" height="${height}" viewBox="0 0 ${YT9025_W} ${height}" role="img" aria-label="${yt9025Escape(label)}">${parts.join("")}</svg>`;
}

// ---------- Call chips ----------

function yt9025Calls(state, copy) {
  const chips = state.calls.map((id, index) => {
    const done = index < state.results.length;
    const result = done ? `<small>${yt9025Escape(state.results[index].join(","))}</small>` : "";
    return `<span class="yt9025-call${index === state.ci ? " is-cur" : ""}${done ? " is-done" : ""}" data-call="${index}"><b>+1 ${yt9025Escape(id)}</b>${result}</span>`;
  }).join("");
  return `<div class="yt9025-calls" aria-label="${yt9025Escape(copy.calls)}">${chips}</div>`;
}

// ---------- Current-line strip (source lives in the shared #codePanel) ----------

function yt9025Code(step, state, copy, vi) {
  const title = step && step.title && typeof step.title === "object" ? step.title[vi ? "vi" : "en"] : "";
  const effect = typeof title === "string" ? title.slice(0, 160) : "";
  const badge = state.condition !== null
    ? `<b class="yt9025-branch${state.condition ? " is-true" : " is-false"}">${state.condition ? "True" : "False"}</b>`
    : "";
  return `<header><b>${yt9025Escape(copy.code)}</b></header><div class="yt9025-now" data-code-line="${state.line}" aria-current="step"><span class="yt9025-lineno">L${state.line}</span>${effect ? `<code class="yt9025-effect">↳ ${yt9025Escape(effect)}</code>` : ""}${badge}</div>`;
}

// ---------- Navigation (same contract as other line-by-line renderers) ----------

function yt9025Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  return steps.findIndex((step, index) => {
    const view = step && step.yt9025View;
    if (index <= stepIndex || !view) return false;
    if (kind === "line") return true;
    if (kind === "call") return view.event === "call";
    if (kind === "result") return Boolean(step.final);
    return false;
  });
}

function yt9025Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function yt9025Bind(host) {
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
  bind("[data-yt9025-jump]", (element) => yt9025Go(yt9025Next(element.dataset.yt9025Jump)));
  bind("[data-yt9025-case]", (element) => {
    const preset = YT9025_CASES[Number(element.dataset.yt9025Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    if (typeof runViz === "function") runViz();
  });
}

function renderYouTubeTrending9025View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const vi = yt9025IsVi();
  const copy = YT9025_COPY[vi ? "vi" : "en"];
  const state = yt9025Normalize(step);
  const last = state.results.length ? state.results[state.results.length - 1] : null;
  const str = (id) => `'${id}'`;
  const heading = state.final && last
    ? `→ [${last.map(str).join(", ")}]`
    : state.videoId ? `records(${str(state.videoId)})`
      : `YT(k=${state.k})`;
  const status = `${copy.calls} ${state.results.length}/${state.calls.length}`;
  const presets = YT9025_CASES.map((preset, index) => `<button type="button" data-yt9025-case="${index}">${yt9025Escape(vi ? preset[1] : preset[2])}</button>`).join("");
  const jumps = copy.jumps.map(([kind, label]) => `<button type="button" data-yt9025-jump="${kind}"${yt9025Next(kind) < 0 ? " disabled" : ""}>${yt9025Escape(label)}</button>`).join("");
  const legend = `<div class="yt9025-legend" aria-hidden="true">${copy.legend[state.approach].map(([cls, text]) => `<span class="lg-${cls}">${yt9025Escape(text)}</span>`).join("")}</div>`;
  const picture = copy.picture[state.approach];

  host.innerHTML = `<article class="yt9025-viz${state.final ? " is-final" : ""}" data-problem-id="9025" data-approach="${state.approach}" data-source-line="${state.line}" role="region" aria-label="9025 Videos — Top K · ${vi ? "dòng" : "line"} ${state.line}">`
    + `<header class="yt9025-head"><div><small>INTERVIEW 9025 · VIDEOS — TOP K</small><h2><code>${yt9025Escape(heading)}</code></h2></div><span class="yt9025-status">${yt9025Escape(status)}</span></header>`
    + `<nav class="yt9025-presets" aria-label="${yt9025Escape(copy.examples)}">${presets}</nav>`
    + `<section class="yt9025-card yt9025-call-card">${yt9025Calls(state, copy)}</section>`
    + `<section class="yt9025-card yt9025-picture-card" aria-label="${yt9025Escape(picture)}"><header><b>${yt9025Escape(picture)}</b></header>${yt9025Picture(state, copy)}${legend}</section>`
    + `<section class="yt9025-card yt9025-code-card" aria-label="${yt9025Escape(copy.code)}">${yt9025Code(step, state, copy, vi)}</section>`
    + `<footer class="yt9025-foot">${jumps}</footer></article>`;
  yt9025Bind(host);
}
