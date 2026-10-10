"use strict";

const EW2846_COPY = Object.freeze({
  en: Object.freeze({
    kicker: "2846 · GOOGLE TREE INTERVIEW", preprocess: "1 · Root prefixes", lca: "2 · Binary-lifting LCA", count: "3 · Count path weights",
    tree: "Weighted tree", treeHelp: "The highlighted route is the current query path.", currentPrefix: "Root → current prefix counts",
    query: "Current query", noQuery: "Preprocessing before queries", ancestor: "LCA", pathEdges: "path edges", keep: "largest bucket",
    operations: "operations", frequencies: "Weights on this path", frequencyHelp: "Keep the tallest bucket; recolor every other edge.",
    jump: "Binary-lifting move", noJump: "No ancestor jump on this step.", answers: "Query answers", pending: "pending", done: "done",
    formula: "Prefix-frequency subtraction", empty: "No weighted edge is active yet.", line: "line",
  }),
  vi: Object.freeze({
    kicker: "2846 · PHỎNG VẤN TREE GOOGLE", preprocess: "1 · Prefix từ root", lca: "2 · LCA bằng binary lifting", count: "3 · Đếm weight trên path",
    tree: "Cây có trọng số", treeHelp: "Đường tô sáng là path của query hiện tại.", currentPrefix: "Tần suất prefix root → node hiện tại",
    query: "Query hiện tại", noQuery: "Đang tiền xử lý trước các query", ancestor: "LCA", pathEdges: "số cạnh path", keep: "bucket lớn nhất",
    operations: "số lần đổi", frequencies: "Trọng số trên path", frequencyHelp: "Giữ bucket cao nhất; đổi tất cả cạnh còn lại.",
    jump: "Bước nhảy binary lifting", noJump: "Bước này không nhảy ancestor.", answers: "Kết quả từng query", pending: "chờ", done: "xong",
    formula: "Trừ prefix frequency", empty: "Chưa có cạnh trọng số nào đang active.", line: "dòng",
  }),
});

function ew2846Escape(value) {
  return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function ew2846Locale() { return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en"; }
function ew2846Int(value, min, max, fallback = null) { return Number.isInteger(value) && value >= min && value <= max ? value : fallback; }
function ew2846Pair(value, n) {
  return Array.isArray(value) && value.length === 2 && value.every((item) => Number.isInteger(item) && item >= 0 && item < n) ? [value[0], value[1]] : null;
}

function ew2846Normalize(step) {
  const raw = step && step.edgeEquilibrium2846View && typeof step.edgeEquilibrium2846View === "object" ? step.edgeEquilibrium2846View : {};
  const n = ew2846Int(raw.n, 1, 24, 1);
  const edges = (Array.isArray(raw.edges) ? raw.edges : []).slice(0, n - 1).map((edge) => ({
    u: ew2846Int(edge && edge.u, 0, n - 1, 0),
    v: ew2846Int(edge && edge.v, 0, n - 1, 0),
    weight: ew2846Int(edge && edge.weight, 1, 26, 1),
  }));
  const vector = (value, length, min, max, fallback = 0) => Array.from({ length }, (_, index) => ew2846Int(Array.isArray(value) ? value[index] : null, min, max, fallback));
  const parent = vector(raw.parent, n, 0, n - 1);
  const depth = vector(raw.depth, n, 0, n - 1);
  const parentWeight = vector(raw.parentWeight, n, 0, 26);
  const up = (Array.isArray(raw.up) ? raw.up : []).slice(0, 6).map((row) => vector(row, n, 0, n - 1));
  const prefix = Array.from({ length: n }, (_, node) => vector(Array.isArray(raw.prefix) ? raw.prefix[node] : null, 26, 0, n));
  const frequencies = vector(raw.frequencies, 26, 0, n);
  const queries = (Array.isArray(raw.queries) ? raw.queries : []).slice(0, 32).map((query) => ew2846Pair(query, n)).filter(Boolean);
  const query = ew2846Pair(raw.query, n);
  const idList = (value) => [...new Set((Array.isArray(value) ? value : []).map((item) => ew2846Int(item, 0, n - 1)).filter((item) => item !== null))];
  const edgeKey = (u, v) => u < v ? `${u},${v}` : `${v},${u}`;
  const validEdgeKeys = new Set(edges.map((edge) => edgeKey(edge.u, edge.v)));
  const activeEdges = (Array.isArray(raw.activeEdges) ? raw.activeEdges : []).filter((key) => typeof key === "string" && validEdgeKeys.has(key));
  const liftRaw = raw.lift && typeof raw.lift === "object" ? raw.lift : null;
  const lift = liftRaw ? {
    side: String(liftRaw.side || ""), bit: ew2846Int(liftRaw.bit, 0, 5), distance: ew2846Int(liftRaw.distance, 1, 32),
    from: ew2846Int(liftRaw.from, 0, n - 1), to: ew2846Int(liftRaw.to, 0, n - 1),
    other: ew2846Int(liftRaw.other, 0, n - 1), otherFrom: ew2846Int(liftRaw.otherFrom, 0, n - 1), otherTo: ew2846Int(liftRaw.otherTo, 0, n - 1),
    reason: String(liftRaw.reason || "").slice(0, 60),
  } : null;
  return {
    n, edges, parent, depth, parentWeight, up, prefix, frequencies, queries, query,
    phase: ["setup", "preprocess", "query", "lca", "frequency", "answer", "done"].includes(raw.phase) ? raw.phase : "setup",
    event: String(raw.event || "setup").slice(0, 60), line: ew2846Int(raw.line, 1, 50, 1), source: String(raw.source || "").slice(0, 240),
    visited: idList(raw.visited), activeNodes: idList(raw.activeNodes), activeEdges,
    currentNode: ew2846Int(raw.currentNode, 0, n - 1), ancestor: ew2846Int(raw.ancestor, 0, n - 1),
    queryIndex: ew2846Int(raw.queryIndex, -1, 31, -1), queryCount: ew2846Int(raw.queryCount, 0, 32, queries.length),
    pathLength: ew2846Int(raw.pathLength, 0, n - 1), maxFrequency: ew2846Int(raw.maxFrequency, 0, n - 1),
    answers: vector(raw.answers, Array.isArray(raw.answers) ? Math.min(32, raw.answers.length) : 0, 0, n - 1),
    lift, final: Boolean(raw.final || (step && step.final)),
    title: typeof pick === "function" ? String(pick(step && step.title || "")) : "",
    note: typeof pick === "function" ? String(pick(step && step.note || "")) : "",
  };
}

function ew2846TreeLayout(state) {
  const children = Array.from({ length: state.n }, () => []);
  const adjacency = Array.from({ length: state.n }, () => []);
  state.edges.forEach((edge) => { adjacency[edge.u].push(edge.v); adjacency[edge.v].push(edge.u); });
  const treeParent = Array(state.n).fill(-1);
  const treeDepth = Array(state.n).fill(0);
  treeParent[0] = 0;
  const order = [0];
  for (const node of order) {
    for (const neighbor of adjacency[node]) {
      if (treeParent[neighbor] !== -1) continue;
      treeParent[neighbor] = node;
      treeDepth[neighbor] = treeDepth[node] + 1;
      children[node].push(neighbor);
      order.push(neighbor);
    }
  }
  children.forEach((list) => list.sort((a, b) => a - b));
  let leaf = 0;
  const x = Array(state.n).fill(0);
  const place = (node) => {
    if (!children[node].length) {
      x[node] = leaf;
      leaf += 1;
      return x[node];
    }
    const childX = children[node].map(place);
    x[node] = (childX[0] + childX[childX.length - 1]) / 2;
    return x[node];
  };
  place(0);
  const width = Math.max(520, Math.max(1, leaf) * 88);
  const maxDepth = Math.max(0, ...treeDepth);
  const height = Math.max(230, (maxDepth + 1) * 78 + 30);
  const position = Array.from({ length: state.n }, (_, node) => ({
    x: 44 + x[node] * (width - 88) / Math.max(1, leaf - 1),
    y: 38 + treeDepth[node] * 78,
  }));
  return { width, height, position };
}

function ew2846Tree(state, copy) {
  const { width, height, position } = ew2846TreeLayout(state);
  const activeNodes = new Set(state.activeNodes);
  const activeEdges = new Set(state.activeEdges);
  const endpoints = new Set(state.query || []);
  const edgeKey = (u, v) => u < v ? `${u},${v}` : `${v},${u}`;
  const lines = state.edges.map((edge) => {
    const a = position[edge.u]; const b = position[edge.v]; const active = activeEdges.has(edgeKey(edge.u, edge.v));
    const mx = (a.x + b.x) / 2; const my = (a.y + b.y) / 2;
    return `<g class="ew2846-edge ${active ? "is-path" : ""}"><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><circle cx="${mx}" cy="${my}" r="11"/><text x="${mx}" y="${my + 4}">${edge.weight}</text></g>`;
  }).join("");
  const nodes = position.map((point, node) => {
    const classes = ["ew2846-node"];
    if (state.visited.includes(node)) classes.push("is-visited");
    if (activeNodes.has(node)) classes.push("is-active");
    if (endpoints.has(node)) classes.push("is-endpoint");
    if (node === state.ancestor) classes.push("is-lca");
    if (node === state.currentNode) classes.push("is-current");
    return `<g class="${classes.join(" ")}" transform="translate(${point.x} ${point.y})"><circle r="18"/><text y="5">${node}</text>${node === state.ancestor ? `<text class="label" y="-25">LCA</text>` : ""}</g>`;
  }).join("");
  return `<section class="ew2846-card ew2846-tree"><header><div><strong>${copy.tree}</strong><small>${copy.treeHelp}</small></div><span>root = 0</span></header><div class="ew2846-tree-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Weighted rooted tree"><title>Weighted rooted tree for problem 2846</title>${lines}${nodes}</svg></div></section>`;
}

function ew2846Prefix(state, copy) {
  const compact = (node) => state.prefix[node].map((count, index) => count ? `${index + 1}:${count}` : null).filter(Boolean).join(" · ") || "∅";
  if (state.query) {
    const [u, v] = state.query;
    const rows = [
      { label: `P[${u}]`, node: u },
      { label: `P[${v}]`, node: v },
      ...(state.ancestor === null ? [] : [{ label: `P[LCA=${state.ancestor}]`, node: state.ancestor }]),
    ];
    return `<section class="ew2846-card ew2846-prefix ew2846-prefix-vectors"><header><div><strong>${copy.formula}</strong><small>P[u] + P[v] − 2P[LCA]</small></div></header><div>${rows.map((row) => `<span><strong>${row.label}</strong><code>{${compact(row.node)}}</code></span>`).join("")}</div></section>`;
  }
  const node = state.currentNode !== null ? state.currentNode : state.query ? state.query[0] : null;
  const counts = node === null ? [] : state.prefix[node].map((count, index) => ({ weight: index + 1, count })).filter((item) => item.count > 0);
  return `<section class="ew2846-card ew2846-prefix"><header><div><strong>${copy.currentPrefix}</strong><small>${node === null ? "node —" : `node ${node} · depth ${state.depth[node]}`}</small></div></header><div>${counts.length ? counts.map((item) => `<span><small>w=${item.weight}</small><b>${item.count}</b></span>`).join("") : `<p>${copy.empty}</p>`}</div></section>`;
}

function ew2846Query(state, copy) {
  if (!state.query) return `<section class="ew2846-card ew2846-query is-empty"><strong>${copy.noQuery}</strong><p>${ew2846Escape(state.note)}</p></section>`;
  const [u, v] = state.query;
  const lift = state.lift;
  let liftText = copy.noJump;
  if (lift && lift.side === "a") liftText = `2^${lift.bit}: ${lift.from} → ${lift.to}`;
  else if (lift && lift.side === "both") liftText = `2^${lift.bit}: ${lift.from}→${lift.to} · ${lift.otherFrom}→${lift.otherTo}`;
  else if (lift && lift.side === "swap") liftText = `swap: a=${lift.to}, b=${lift.other}`;
  else if (lift && lift.side === "done" && lift.to !== null) liftText = `LCA = ${lift.to}`;
  const lca = state.ancestor === null ? "?" : state.ancestor;
  const pathLength = state.pathLength === null ? "?" : state.pathLength;
  const keep = state.maxFrequency === null ? "?" : state.maxFrequency;
  const operations = state.pathLength === null || state.maxFrequency === null ? "?" : state.pathLength - state.maxFrequency;
  return `<section class="ew2846-card ew2846-query"><header><div><strong>${copy.query} #${state.queryIndex + 1}</strong><small>u=${u} · v=${v}</small></div><b>${state.queryIndex + 1}/${state.queryCount}</b></header>
    <div class="ew2846-depths"><span><small>u=${u}</small><b>depth ${state.depth[u]}</b></span><i>↕</i><span><small>v=${v}</small><b>depth ${state.depth[v]}</b></span></div>
    <div class="ew2846-lift"><small>${copy.jump}</small><code>${ew2846Escape(liftText)}</code></div>
    <div class="ew2846-formula"><span><small>${copy.ancestor}</small><b>${lca}</b></span><span><small>${copy.pathEdges}</small><b>${pathLength}</b></span><span><small>${copy.keep}</small><b>${keep}</b></span><span class="answer"><small>${copy.operations}</small><b>${operations}</b></span></div>
  </section>`;
}

function ew2846Frequency(state, copy) {
  const data = state.frequencies.map((count, index) => ({ weight: index + 1, count })).filter((item) => item.count > 0);
  const max = Math.max(1, ...data.map((item) => item.count));
  return `<section class="ew2846-card ew2846-frequency"><header><div><strong>${copy.frequencies}</strong><small>${copy.frequencyHelp}</small></div><code>freq[w] = P[u] + P[v] − 2P[LCA]</code></header><div>${data.length ? data.map((item) => `<span class="${state.maxFrequency !== null && item.count === state.maxFrequency ? "is-mode" : ""}"><i style="--ew2846-height:${Math.max(16, Math.round(item.count / max * 100))}%"></i><b>${item.count}</b><small>w=${item.weight}</small></span>`).join("") : `<p>${copy.empty}</p>`}</div></section>`;
}

function ew2846Answers(state, copy) {
  const rows = state.queries.map((query, index) => {
    const answered = index < state.answers.length;
    const active = index === state.queryIndex;
    return `<span class="${answered ? "is-done" : ""} ${active ? "is-active" : ""}"><small>Q${index + 1} · ${query[0]}↔${query[1]}</small><b>${answered ? state.answers[index] : "—"}</b><em>${answered ? copy.done : copy.pending}</em></span>`;
  }).join("");
  return `<section class="ew2846-card ew2846-answers"><header><strong>${copy.answers}</strong><span>${state.answers.length}/${state.queryCount}</span></header><div>${rows}</div></section>`;
}

function renderEdgeEquilibrium2846View(step) {
  const state = ew2846Normalize(step);
  const copy = EW2846_COPY[ew2846Locale()];
  const root = $("treeView");
  const stage = ["setup", "preprocess"].includes(state.phase) ? 0 : ["query", "lca"].includes(state.phase) ? 1 : 2;
  const phases = [copy.preprocess, copy.lca, copy.count].map((label, index) => `<span class="${index < stage ? "is-done" : index === stage ? "is-active" : ""}"><i>${index < stage ? "✓" : index + 1}</i><b>${ew2846Escape(label)}</b></span>`).join("");
  root.innerHTML = `<section class="ew2846-viz" role="img" aria-label="Minimum Edge Weight Equilibrium Queries visualization">
    <header class="ew2846-heading"><div><small>${copy.kicker}</small><h3>${ew2846Escape(state.title)}</h3></div><span>${copy.line} ${state.line} · ${state.phase.toUpperCase()}</span></header>
    <div class="ew2846-phases">${phases}</div>
    <section class="ew2846-action"><code>${ew2846Escape(state.source.trim())}</code><strong>${ew2846Escape(state.title)}</strong><p>${ew2846Escape(state.note)}</p></section>
    <div class="ew2846-main">${ew2846Tree(state, copy)}<div>${ew2846Query(state, copy)}${ew2846Prefix(state, copy)}</div></div>
    ${ew2846Frequency(state, copy)}
    ${ew2846Answers(state, copy)}
  </section>`;
}
