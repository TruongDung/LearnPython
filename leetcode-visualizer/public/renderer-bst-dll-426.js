"use strict";

// LeetCode 426 — Convert BST to Sorted Doubly Linked List. Picture-first renderer:
// the original tree on top (x = inorder rank), the list row underneath in the same columns,
// right (next) / left (prev) pointers as they are written, head/prev tags, and a current-line strip.
// The Python source is shown once, in the shared #codePanel, highlighted by script.js from step.codeLines.

const DL426_LINE_COUNT = 26;

// Preset inputs: [input, Vietnamese label, English label]. The first preset is the default input.
const DL426_CASES = Object.freeze([
  ["6,3,9,1,4,8,10,null,2,null,5", "Ví dụ", "Example"],
  ["4,2,5,1,3", "Ngắn", "Short"],
  ["1", "1 node", "1 node"],
  ["null", "Cây rỗng", "Empty tree"],
]);

const DL426_COPY = Object.freeze({
  vi: Object.freeze({
    picture: "Cây gốc ↓ cột = thứ tự inorder ↓ danh sách",
    code: "Dòng đang chạy",
    examples: "Ví dụ",
    linked: "đã nối",
    circular: "↻ vòng kín",
    empty: "root = None",
    jumps: [["line", "Dòng →"], ["node", "Node kế →"], ["result", "Kết quả ↠"]],
    legend: { next: "→ .right (next)", prev: "← .left (prev)", written: "→ vừa ghi", stack: "◯ đang gọi", done: "● đã nối" },
  }),
  en: Object.freeze({
    picture: "Tree ↓ column = inorder rank ↓ list",
    code: "Current line",
    examples: "Examples",
    linked: "linked",
    circular: "↻ circular",
    empty: "root = None",
    jumps: [["line", "Line →"], ["node", "Next node →"], ["result", "Result ↠"]],
    legend: { next: "→ .right (next)", prev: "← .left (prev)", written: "→ just written", stack: "◯ on call stack", done: "● linked" },
  }),
});

function dl426Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function dl426IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function dl426Integer(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

// Validates the builder's view model so malformed data never reaches innerHTML unescaped.
function dl426Normalize(step) {
  const raw = step && step.bstDll426View && typeof step.bstDll426View === "object" ? step.bstDll426View : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const line = dl426Integer(raw.line, 1, DL426_LINE_COUNT) ?? dl426Integer(fallbackLine, 1, DL426_LINE_COUNT) ?? 1;
  const event = typeof raw.event === "string" && /^[a-z-]{1,40}$/.test(raw.event) ? raw.event : "";

  const seen = new Set();
  const nodes = (Array.isArray(raw.tree) ? raw.tree.slice(0, 63) : []).flatMap((item) => {
    const node = item && typeof item === "object" ? item : {};
    const id = dl426Integer(node.id, 0, 100000);
    if (id === null || seen.has(id) || !Number.isFinite(node.val)) return [];
    seen.add(id);
    return [{ id, label: String(node.val).slice(0, 6), depth: dl426Integer(node.depth, 0, 62) ?? 0, parent: node.parent, left: node.left, right: node.right }];
  });
  const known = (value) => (dl426Integer(value, 0, 100000) !== null && seen.has(value) ? value : null);
  const byId = new Map();
  nodes.forEach((node, rank) => {
    node.rank = rank;
    node.parent = known(node.parent);
    node.left = known(node.left);
    node.right = known(node.right);
    byId.set(node.id, node);
  });

  const ids = (value) => (Array.isArray(value) ? value.slice(0, 63).map(known).filter((id) => id !== null) : []);
  const visited = [...new Set(ids(raw.visited))];
  const stack = Array.isArray(raw.stack) ? raw.stack.slice(0, 64).map((value) => (value === null ? null : known(value))) : [];
  const linkMap = (value) => {
    const out = new Map();
    if (!value || typeof value !== "object") return out;
    Object.keys(value).slice(0, 63).forEach((key) => {
      const from = known(Number(key));
      const to = known(value[key]);
      if (from !== null && to !== null) out.set(from, to);
    });
    return out;
  };
  const linksRaw = raw.links && typeof raw.links === "object" ? raw.links : {};
  const writeRaw = raw.write && typeof raw.write === "object" ? raw.write : null;
  const write = writeRaw && ["right", "left", "head", "prev"].includes(writeRaw.field)
    ? { field: writeRaw.field, from: known(writeRaw.from), to: known(writeRaw.to) }
    : null;
  const slotRaw = raw.nullSlot && typeof raw.nullSlot === "object" ? raw.nullSlot : null;
  const nullSlot = slotRaw && known(slotRaw.parent) !== null && (slotRaw.side === "left" || slotRaw.side === "right")
    ? { parent: slotRaw.parent, side: slotRaw.side }
    : null;

  return {
    line,
    event,
    condition: typeof raw.condition === "boolean" ? raw.condition : null,
    nodes,
    byId,
    current: known(raw.current),
    nullSlot,
    stack,
    visited,
    head: known(raw.head),
    prev: known(raw.prev),
    right: linkMap(linksRaw.right),
    left: linkMap(linksRaw.left),
    write,
    final: raw.final === true || Boolean(step && step.final),
  };
}

function dl426Name(state, id) {
  return id === null || id === undefined ? "None" : state.byId.get(id).label;
}

// ---------- Picture: tree on top, list row under it, same columns ----------

const DL426_COL = 64;
// Left/right padding leaves room for a None slot half a column outside the outermost node.
const DL426_PAD = 28;
const DL426_R = 18;
const DL426_ROW = 60;
const DL426_BOX_W = 40;
const DL426_BOX_H = 34;

function dl426Picture(state, copy) {
  if (!state.nodes.length) return `<div class="dl426-empty">${dl426Escape(copy.empty)}</div>`;
  const cx = (rank) => DL426_PAD + DL426_R + rank * DL426_COL;
  const cy = (depth) => 26 + depth * DL426_ROW;
  const maxDepth = state.nodes.reduce((max, node) => Math.max(max, node.depth), 0);
  // The list row sits below the None-slot level of the deepest leaves, with room for head/prev tags.
  const listY = cy(maxDepth + 1) + 10 + 36;
  const width = Math.max(cx(state.nodes.length - 1) + DL426_R + DL426_PAD, 240);
  const visited = new Set(state.visited);
  const inStack = new Set(state.stack.filter((id) => id !== null));
  const W = state.write;
  const parts = [];

  // Tree edges (original shape, never rewritten in this picture).
  state.nodes.forEach((node) => {
    if (node.parent === null) return;
    const parent = state.byId.get(node.parent);
    parts.push(`<line class="dl426-edge" x1="${cx(parent.rank)}" y1="${cy(parent.depth)}" x2="${cx(node.rank)}" y2="${cy(node.depth)}"/>`);
  });
  // The None child being checked: a small dashed slot under its parent.
  if (state.nullSlot) {
    const parent = state.byId.get(state.nullSlot.parent);
    const x = cx(parent.rank) + (state.nullSlot.side === "left" ? -1 : 1) * DL426_COL / 2;
    const y = cy(parent.depth + 1);
    parts.push(`<line class="dl426-edge is-null" x1="${cx(parent.rank)}" y1="${cy(parent.depth)}" x2="${x}" y2="${y - 10}"/>`
      + `<g class="dl426-null" data-null-slot="${state.nullSlot.side}"><circle cx="${x}" cy="${y}" r="10"/><text x="${x}" y="${y + 4}">∅</text></g>`);
  }
  // Projection guide: current node's tree position drops to its list slot.
  if (state.current !== null) {
    const node = state.byId.get(state.current);
    parts.push(`<line class="dl426-guide" x1="${cx(node.rank)}" y1="${cy(node.depth) + DL426_R}" x2="${cx(node.rank)}" y2="${listY - 16}"/>`);
  }
  state.nodes.forEach((node) => {
    const classes = ["dl426-tnode", visited.has(node.id) ? "is-done" : "", inStack.has(node.id) ? "is-stack" : "", node.id === state.current ? "is-current" : ""].filter(Boolean).join(" ");
    parts.push(`<g class="${classes}" data-tree-node="${node.id}"><circle cx="${cx(node.rank)}" cy="${cy(node.depth)}" r="${DL426_R}"/><text x="${cx(node.rank)}" y="${cy(node.depth) + 5}">${dl426Escape(node.label)}</text></g>`);
  });

  // List pointers.
  const arrows = [];
  const isWritten = (field, from) => W && W.field === field && W.from === from;
  const closeDepth = { right: 30, left: 52 };
  [["right", state.right], ["left", state.left]].forEach(([field, map]) => {
    map.forEach((to, from) => {
      const a = state.byId.get(from);
      const b = state.byId.get(to);
      const written = isWritten(field, from);
      const xa = cx(a.rank);
      const xb = cx(b.rank);
      let path;
      let close = false;
      // Only the closing writes touch head this way (tail.right = head, head.left = tail), so they always take
      // the arc under the row, even when head and tail are neighbours (n = 2) and would share the straight lane.
      const closing = field === "right" ? to === state.head : from === state.head;
      if (from === to) {
        // Single node: self loop on the right (next) or left (prev) side.
        const sx = field === "right" ? xa + DL426_BOX_W / 2 : xa - DL426_BOX_W / 2;
        const dx = field === "right" ? 22 : -22;
        path = `M${sx},${listY + 10}C${sx + dx},${listY - 6} ${sx + dx},${listY + DL426_BOX_H + 6} ${sx + (field === "right" ? 3 : -3)},${listY + DL426_BOX_H - 10}`;
        close = true;
      } else if (!closing && Math.abs(a.rank - b.rank) === 1) {
        const y = listY + (field === "right" ? 11 : 24);
        const sign = Math.sign(xb - xa);
        path = `M${xa + sign * DL426_BOX_W / 2},${y}H${xb - sign * (DL426_BOX_W / 2 + 3)}`;
      } else {
        // Closing link between head and tail: arc under the row.
        const offset = field === "right" ? 8 : -8;
        const y0 = listY + DL426_BOX_H;
        const dip = y0 + closeDepth[field];
        path = `M${xa + offset},${y0}C${xa + offset},${dip} ${xb + offset},${dip} ${xb + offset},${y0 + 3}`;
        close = true;
      }
      const classes = ["dl426-ptr", `is-${field}`, close ? "is-close" : "", written ? "is-written" : ""].filter(Boolean).join(" ");
      arrows.push(`<path class="${classes}" d="${path}" data-ptr-from="${from}" data-ptr-field="${field}" data-ptr-to="${to}" marker-end="url(#dl426-tip-${written ? "written" : field})"/>`);
    });
  });

  const boxes = state.nodes.map((node) => {
    const x = cx(node.rank) - DL426_BOX_W / 2;
    const tags = [];
    if (node.id === state.head) tags.push(`<tspan class="tag-head">head</tspan>`);
    if (node.id === state.prev) tags.push(`<tspan class="tag-prev">prev</tspan>`);
    const tagWritten = W && (W.field === "head" || W.field === "prev") && W.to === node.id;
    const classes = ["dl426-lnode", visited.has(node.id) ? "is-done" : "is-pending", node.id === state.current ? "is-current" : "", tagWritten ? "is-tagged" : ""].filter(Boolean).join(" ");
    const tagText = tags.length ? `<text class="dl426-tags" x="${cx(node.rank)}" y="${listY - (tags.length > 1 ? 20 : 8)}">${tags.join(`<tspan class="tag-sep" x="${cx(node.rank)}" dy="12"></tspan>`)}</text>` : "";
    return `<g class="${classes}" data-list-node="${node.id}"><rect x="${x}" y="${listY}" width="${DL426_BOX_W}" height="${DL426_BOX_H}" rx="8"/><text x="${cx(node.rank)}" y="${listY + 22}">${dl426Escape(node.label)}</text>${tagText}</g>`;
  }).join("");

  const height = listY + DL426_BOX_H + 66;
  const markers = ["right", "left", "written"].map((name) => `<marker id="dl426-tip-${name}" class="dl426-tip-${name}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10Z"/></marker>`).join("");
  const label = state.visited.map((id) => dl426Name(state, id)).join(" ⇄ ") || "—";
  return `<svg class="dl426-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${dl426Escape(label)}"><defs>${markers}</defs>${parts.join("")}${arrows.join("")}${boxes}</svg>`;
}

// ---------- Current-line strip (source lives in the shared #codePanel) ----------

function dl426Effect(state) {
  const W = state.write;
  if (state.event === "return-head") return `return ${dl426Name(state, state.head)}`;
  if (state.event === "return-none") return "return None";
  if (!W) return "";
  if (W.field === "head" || W.field === "prev") return `${W.field} = ${dl426Name(state, W.to)}`;
  return `${dl426Name(state, W.from)}.${W.field} = ${dl426Name(state, W.to)}`;
}

function dl426Code(state, copy) {
  const effect = dl426Effect(state);
  const badge = state.condition !== null
    ? `<b class="dl426-branch is-${state.condition ? "true" : "false"}">${state.condition ? "True" : "False"}</b>`
    : "";
  const now = `<div class="dl426-now" data-code-line="${state.line}" aria-current="step"><span class="dl426-lineno">L${state.line}</span>${effect ? `<code class="dl426-effect">↳ ${dl426Escape(effect)}</code>` : ""}${badge}</div>`;
  const frames = state.stack.map((id) => `inorder(${id === null ? "None" : dl426Name(state, id)})`);
  const crumbs = frames.length ? `<span class="dl426-stack">${frames.map((frame) => `<code>${dl426Escape(frame)}</code>`).join("<i>▸</i>")}</span>` : "";
  // node/prev/head values live only in the shared Variables panel (step.vars), not repeated here.
  return `<header><b>${dl426Escape(copy.code)}</b>${crumbs}</header>${now}`;
}

// ---------- Navigation (same contract as other line-by-line renderers) ----------

function dl426Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  return steps.findIndex((step, index) => {
    const view = step && step.bstDll426View;
    if (index <= stepIndex || !view) return false;
    if (kind === "line") return true;
    if (kind === "node") return view.event === "check-prev";
    if (kind === "result") return Boolean(step.final);
    return false;
  });
}

function dl426Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function dl426Bind(host) {
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
  bind("[data-dl426-jump]", (element) => dl426Go(dl426Next(element.dataset.dl426Jump)));
  bind("[data-dl426-case]", (element) => {
    const preset = DL426_CASES[Number(element.dataset.dl426Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    if (typeof runViz === "function") runViz();
  });
}

function renderBstDll426View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const vi = dl426IsVi();
  const copy = DL426_COPY[vi ? "vi" : "en"];
  const state = dl426Normalize(step);
  const top = state.stack.length ? state.stack[state.stack.length - 1] : undefined;
  const heading = state.final
    ? `return ${dl426Name(state, state.head)}`
    : top !== undefined ? `inorder(${top === null ? "None" : dl426Name(state, top)})` : "treeToDoublyList(root)";
  const closed = state.head !== null && state.left.get(state.head) === state.prev && state.right.get(state.prev) === state.head && state.visited.length === state.nodes.length;
  const status = closed ? copy.circular : `${state.visited.length}/${state.nodes.length} ${copy.linked}`;
  const presets = DL426_CASES.map((preset, index) => `<button type="button" data-dl426-case="${index}">${dl426Escape(vi ? preset[1] : preset[2])}</button>`).join("");
  const jumps = copy.jumps.map(([kind, label]) => `<button type="button" data-dl426-jump="${kind}"${dl426Next(kind) < 0 ? " disabled" : ""}>${dl426Escape(label)}</button>`).join("");
  const L = copy.legend;
  const legend = `<div class="dl426-legend" aria-hidden="true"><span class="lg-next">${dl426Escape(L.next)}</span><span class="lg-prev">${dl426Escape(L.prev)}</span><span class="lg-written">${dl426Escape(L.written)}</span><span class="lg-stack">${dl426Escape(L.stack)}</span><span class="lg-done">${dl426Escape(L.done)}</span></div>`;

  host.innerHTML = `<article class="dl426-viz${state.final ? " is-final" : ""}${closed ? " is-closed" : ""}" data-problem-id="426" data-source-line="${state.line}" role="region" aria-label="LeetCode 426 · line ${state.line}">`
    + `<header class="dl426-head"><div><small>LEETCODE 426 · BST → DLL</small><h2><code>${dl426Escape(heading)}</code></h2></div><span class="dl426-status">${dl426Escape(status)}</span></header>`
    + `<nav class="dl426-presets" aria-label="${dl426Escape(copy.examples)}">${presets}</nav>`
    + `<section class="dl426-card dl426-picture-card" aria-label="${dl426Escape(copy.picture)}"><header><b>${dl426Escape(copy.picture)}</b></header>${dl426Picture(state, copy)}${legend}</section>`
    + `<section class="dl426-card dl426-code-card" aria-label="${dl426Escape(copy.code)}">${dl426Code(state, copy)}</section>`
    + `<footer class="dl426-foot">${jumps}</footer></article>`;
  dl426Bind(host);
}
