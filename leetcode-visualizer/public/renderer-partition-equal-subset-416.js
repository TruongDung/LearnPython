"use strict";

// LeetCode 416 — Partition Equal Subset Sum. Picture-first renderers for the three approaches:
//   1. DP:     the dp row after every number, stacked as a grid (column = sum), with the two
//              sources of dp[j] drawn as arrows: keep (straight down) and take (from j − num).
//   2. Bitset: the bits as cells (bit 0 on the right), bits << num under them, and the OR result.
//   3. DFS:    the current call path as a take (left, −num) / skip (right) tree, with sibling results.
// The Python source is shown once, in the shared #codePanel (highlighted by script.js from step.codeLines);
// locals are shown once, in the shared Variables panel (step.vars).

// Preset inputs: [nums, Vietnamese label, English label]. The first preset is the default input.
const PE416_CASES = Object.freeze([
  ["3,1,5,9,4,2", "Ví dụ", "Example"],
  ["1,5,11,5", "Ngắn", "Short"],
  ["1,2,5", "Không chia được", "No split"],
  ["1,2,3,5", "Tổng lẻ", "Odd total"],
]);

const PE416_COPY = Object.freeze({
  vi: Object.freeze({
    examples: "Ví dụ",
    picture: ["Mỗi hàng = dp sau 1 số · cột = tổng", "bit = tổng (bit 0 bên phải)", "Đường gọi: trái = chọn, phải = bỏ"],
    jumps: [["num", "Số kế →"], ["result", "Kết quả ↠"]],
    dfsJumps: [["call", "Lời gọi kế →"], ["result", "Kết quả ↠"]],
    legendDp: ["✓ tạo được", "↓ giữ dp[j]", "↘ thêm num", "tổng mới"],
    legendBit: ["1 = tạo được", "← dịch num", "tổng mới"],
    legendDfs: ["−num: chọn", "┄ bỏ", "✓ / × kết quả"],
    groups: "2 nhóm",
    chosen: "đã chọn",
    noDp: "dp chưa tạo",
    shortened: "trace rút gọn",
  }),
  en: Object.freeze({
    examples: "Examples",
    picture: ["Row = dp after a number · column = sum", "bit = sum (bit 0 on the right)", "Call path: left = take, right = skip"],
    jumps: [["num", "Next number →"], ["result", "Result ↠"]],
    dfsJumps: [["call", "Next call →"], ["result", "Result ↠"]],
    legendDp: ["✓ reachable", "↓ keep dp[j]", "↘ add num", "new sum"],
    legendBit: ["1 = reachable", "← shift by num", "new sum"],
    legendDfs: ["−num: take", "┄ skip", "✓ / × result"],
    groups: "2 groups",
    chosen: "chosen",
    noDp: "no dp yet",
    shortened: "shortened trace",
  }),
});

function pe416Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pe416Copy() {
  return PE416_COPY[typeof lang !== "undefined" && lang === "vi" ? "vi" : "en"];
}

function pe416IsVi() {
  return typeof lang !== "undefined" && lang === "vi";
}

function pe416Host() {
  if (typeof $ === "function") return $("treeView");
  return typeof document !== "undefined" && document.getElementById ? document.getElementById("treeView") : null;
}

function pe416Truth(value) {
  return value === true ? "✓ True" : value === false ? "× False" : "?";
}

// ---------- Shared shell: header, presets, goal + numbers, picture card, groups, legend + jumps ----------

function pe416Goal(total, target, odd) {
  if (total === null || total === undefined) return "";
  const right = odd
    ? `<b class="pe416-goal-target is-odd">${pe416Escape(total)} % 2 = 1 ×</b>`
    : `<b class="pe416-goal-target">${target === null || target === undefined ? "?" : pe416Escape(target)}</b>`;
  return `<div class="pe416-goal" data-total="${pe416Escape(total)}"><span class="pe416-goal-total">Σ ${pe416Escape(total)}</span><i>÷ 2 =</i>${right}<small>🎯</small></div>`;
}

// Number chips. state(i) returns a class: is-active | is-done | is-taken | is-skipped | "".
function pe416Numbers(nums, state, focus) {
  const start = nums.length <= 14 ? 0 : Math.max(0, Math.min(nums.length - 14, (focus ?? 0) - 6));
  const end = Math.min(nums.length, start + 14);
  const chips = nums.slice(start, end).map((num, offset) => {
    const index = start + offset;
    return `<span class="pe416-num ${state(index)}" data-index="${index}"><b>${pe416Escape(num)}</b><small>${index}</small></span>`;
  }).join("");
  return `<div class="pe416-nums">${start ? `<small class="pe416-more">0…${start - 1}</small>` : ""}${chips}${end < nums.length ? `<small class="pe416-more">+${nums.length - end}</small>` : ""}</div>`;
}

function pe416Groups(nums, partition, copy) {
  if (!partition) return "";
  const group = (label, indices) => {
    const sum = indices.reduce((total, index) => total + nums[index], 0);
    const shown = indices.slice(0, 12).map((index) => `<span class="pe416-num" data-index="${index}"><b>${pe416Escape(nums[index])}</b></span>`).join("");
    return `<div class="pe416-group" data-group="${label}"><header><b>${label}</b><strong>Σ ${sum}</strong></header><div>${shown}${indices.length > 12 ? `<small class="pe416-more">+${indices.length - 12}</small>` : ""}</div></div>`;
  };
  return `<section class="pe416-groups" aria-label="${pe416Escape(copy.groups)}">${group("A", partition.a)}<b class="pe416-equals">=</b>${group("B", partition.b)}</section>`;
}

function pe416Legend(items) {
  return `<div class="pe416-legend" aria-hidden="true">${items.map((text, index) => `<span class="lg-${index}">${pe416Escape(text)}</span>`).join("")}</div>`;
}

function pe416Shell({ method, label, line, answer, final, body, presets = true, jumps, legend, groups = "", note = "" }) {
  const copy = pe416Copy();
  const vi = pe416IsVi();
  const presetNav = presets ? `<nav class="pe416-presets" aria-label="${pe416Escape(copy.examples)}">${PE416_CASES.map((preset, index) => `<button type="button" data-pe416-case="${index}">${pe416Escape(vi ? preset[1] : preset[2])}</button>`).join("")}</nav>` : "";
  const jumpNav = jumps.map(([kind, text]) => `<button type="button" data-pe416-jump="${kind}"${pe416Next(kind) < 0 ? " disabled" : ""}>${pe416Escape(text)}</button>`).join("");
  const badge = `<b class="pe416-badge${answer === true ? " is-true" : answer === false ? " is-false" : ""}">${pe416Truth(final ? answer : null)}</b>`;
  return `<section class="pe416-viz${final ? " is-final" : ""}" data-method="${method}" data-source-line="${line}" role="region" aria-label="LeetCode 416 · ${pe416Escape(label)} · line ${line}">`
    + `<header class="pe416-head"><small>LEETCODE 416 · ${pe416Escape(label)}</small>${badge}</header>`
    + presetNav
    + body
    + groups
    + `<footer class="pe416-foot">${legend}${note ? `<small class="pe416-short">${pe416Escape(note)}</small>` : ""}<span class="pe416-jumps">${jumpNav}</span></footer>`
    + `</section>`;
}

// ---------- Navigation (same contract as the other line-by-line renderers) ----------

function pe416Next(kind) {
  if (typeof steps === "undefined" || !Array.isArray(steps) || typeof stepIndex === "undefined") return -1;
  return steps.findIndex((step, index) => {
    if (index <= stepIndex || !step) return false;
    if (kind === "result") return Boolean(step.final);
    if (kind === "num") {
      const event = step.equalSubset416View?.event || step.equalSubset416BitsetView?.phase;
      return event === "choose-number" || event === "select";
    }
    if (kind === "call") return step.equalSubset416DfsView?.event === "zero-check";
    return false;
  });
}

function pe416Go(index) {
  if (index < 0 || typeof steps === "undefined" || !steps[index]) return;
  if (typeof stopPlay === "function") stopPlay();
  stepIndex = index;
  if (typeof renderStep === "function") renderStep();
}

function pe416Bind(host) {
  if (!host || typeof host.querySelectorAll !== "function") return;
  const bind = (selector, handler) => host.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("click", () => handler(element));
  });
  bind("[data-pe416-jump]", (element) => pe416Go(pe416Next(element.dataset.pe416Jump)));
  bind("[data-pe416-case]", (element) => {
    const preset = PE416_CASES[Number(element.dataset.pe416Case)];
    const input = typeof document !== "undefined" ? document.getElementById("arrInput") : null;
    if (!preset || !input) return;
    input.value = preset[0];
    if (typeof runViz === "function") runViz();
  });
}

// Columns with "…" gaps where the sums list skips values (large targets are cropped by the builder).
function pe416Columns(sums, pitch, start, reverse = false) {
  const xs = [];
  const gaps = [];
  let x = start;
  const order = reverse ? [...sums.keys()].reverse() : [...sums.keys()];
  order.forEach((index, k) => {
    if (k) {
      const prev = sums[order[k - 1]];
      if (Math.abs(sums[index] - prev) > 1) { gaps.push(x + 2); x += 18; }
    }
    xs[index] = x;
    x += pitch;
  });
  return { xs, gaps, end: x };
}

const PE416_ARROWS = `<defs>${["keep", "take", "off", "shift", "edge"].map((name) => `<marker id="pe416-tip-${name}" class="pe416-tip-${name}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10Z"/></marker>`).join("")}</defs>`;

// ---------- 1. DP grid ----------

const PE416_CELL = 28;
const PE416_PITCH = 34;
const PE416_ROW = 52;
const PE416_LABEL = 46;
const PE416_HEAD = 24;

function pe416DpPicture(view, copy) {
  if (!view.rows || !view.rows.length) {
    return `<div class="pe416-empty">${view.event === "odd-return" ? `<b class="is-false">${pe416Escape(view.total)} % 2 = 1</b> → False` : pe416Escape(copy.noDp)}</div>`;
  }
  const { xs, gaps, end } = pe416Columns(view.sums, PE416_PITCH, PE416_LABEL);
  const width = Math.max(end + 4, 220);
  const top = PE416_HEAD + (view.rowsOmitted ? 14 : 0);
  const rowY = (r) => top + r * PE416_ROW;
  const height = rowY(view.rows.length - 1) + PE416_CELL + 8;
  const parts = [];
  const tr = view.transition;
  const active = view.rows.findIndex((row) => row.active);
  view.sums.forEach((sum, c) => {
    const x = xs[c] + PE416_CELL / 2;
    const cls = ["pe416-sum", sum === view.target ? "is-target" : "", tr && sum === tr.destination ? "is-j" : ""].filter(Boolean).join(" ");
    parts.push(`<text class="${cls}" x="${x}" y="16">${sum}</text>`);
  });
  gaps.forEach((x) => parts.push(`<text class="pe416-sum is-gap" x="${x + 6}" y="16">…</text>`));
  if (view.rowsOmitted) parts.push(`<text class="pe416-rowlabel is-more" x="${PE416_LABEL / 2 - 4}" y="${PE416_HEAD + 6}">⋮ ${view.rowsOmitted}</text>`);
  view.rows.forEach((row, r) => {
    const y = rowY(r);
    const label = row.index === null ? "∅" : `+${row.num}`;
    parts.push(`<text class="pe416-rowlabel${row.active ? " is-active" : ""}" x="${PE416_LABEL / 2 - 4}" y="${y + PE416_CELL / 2 + 5}">${pe416Escape(label)}</text>`);
    const prev = r > 0 ? view.rows[r - 1] : null;
    row.cells.forEach((on, c) => {
      const sum = view.sums[c];
      const isNew = row.index !== null && prev && on && !prev.cells[c];
      const cls = ["pe416-cell", on ? "is-on" : "is-off", sum === view.target ? "is-target" : "", isNew ? "is-new" : "",
        row.active && tr && sum === tr.destination ? "is-dest" : "", r === active - 1 && tr && sum === tr.source ? "is-src" : "",
        r === active - 1 && tr && sum === tr.destination ? "is-keep" : ""].filter(Boolean).join(" ");
      parts.push(`<g class="${cls}" data-row="${r}" data-sum="${sum}" data-on="${on}"><rect x="${xs[c]}" y="${y}" width="${PE416_CELL}" height="${PE416_CELL}" rx="6"/>${on ? `<text x="${xs[c] + PE416_CELL / 2}" y="${y + PE416_CELL / 2 + 5}">✓</text>` : ""}</g>`);
    });
  });
  // dp[j] = dp[j] or dp[j - num]: keep arrow (straight down) and take arrow (from column j - num).
  if (tr && active > 0) {
    const c = view.sums.indexOf(tr.destination);
    const s = view.sums.indexOf(tr.source);
    const y0 = rowY(active - 1) + PE416_CELL + 2;
    const y1 = rowY(active) - 3;
    const preview = view.event === "inspect" ? " is-preview" : "";
    if (c >= 0) {
      const x = xs[c] + PE416_CELL / 2 + 6;
      parts.push(`<path class="pe416-arrow is-keep${tr.before ? " is-on" : ""}${preview}" d="M${x},${y0}V${y1}" data-arrow="keep" marker-end="url(#pe416-tip-${tr.before ? "keep" : "off"})"/>`);
    }
    if (c >= 0 && s >= 0) {
      const xa = xs[s] + PE416_CELL / 2;
      const xb = xs[c] + PE416_CELL / 2 - 6;
      parts.push(`<path class="pe416-arrow is-take${tr.from ? " is-on" : ""}${preview}" d="M${xa},${y0}L${xb},${y1}" data-arrow="take" marker-end="url(#pe416-tip-${tr.from ? "take" : "off"})"/>`);
    }
  }
  return `<svg class="pe416-svg pe416-dp-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="dp">${PE416_ARROWS}${parts.join("")}</svg>`;
}

function renderEqualSubset416View(step) {
  const view = step && step.equalSubset416View;
  const host = pe416Host();
  if (!view || !host) return;
  const copy = pe416Copy();
  const item = view.itemIndex;
  const witness = new Set(view.transition?.sourceWitness || []);
  const numbers = pe416Numbers(view.nums, (index) => (index === item ? "is-active"
    : view.partition && view.partition.a.includes(index) ? "is-taken"
      : witness.has(index) ? "is-taken"
        : item !== null && index < item || view.event === "return" ? "is-done" : ""), item);
  const body = `<div class="pe416-top">${pe416Goal(view.total, view.target, view.event === "odd-return")}${numbers}</div>`
    + `<section class="pe416-card" aria-label="${pe416Escape(copy.picture[0])}"><header><b>${pe416Escape(copy.picture[0])}</b></header>${pe416DpPicture(view, copy)}</section>`;
  host.innerHTML = pe416Shell({
    method: 1, label: "DP", line: view.line, answer: view.answer, final: Boolean(view.final || step.final), body,
    jumps: copy.jumps, legend: pe416Legend(copy.legendDp), groups: pe416Groups(view.nums, view.partition, copy),
    note: view.shortened ? copy.shortened : "",
  });
  pe416Bind(host);
}

// ---------- 2. Bitset rows (bit 0 on the right, as in binary) ----------

function pe416BitPicture(view) {
  if (!view.ready) {
    return `<div class="pe416-empty">${view.phase === "odd-return" ? `<b class="is-false">${pe416Escape(view.total)} % 2 = 1</b> → False` : "bits = ?"}</div>`;
  }
  const { xs, gaps, end } = pe416Columns(view.sums, PE416_PITCH, PE416_LABEL, true);
  const width = Math.max(end + 4, 220);
  const shift = view.phase === "shift-or";
  const rows = shift
    ? [["before", "bits", view.before], ["shifted", `<<${view.num}`, view.shifted], ["after", "|=", view.after]]
    : [["after", "bits", view.after]];
  const rowY = (r) => PE416_HEAD + r * PE416_ROW;
  const height = rowY(rows.length - 1) + PE416_CELL + 8;
  const parts = [];
  view.sums.forEach((sum, c) => parts.push(`<text class="pe416-sum${sum === view.target ? " is-target" : ""}" x="${xs[c] + PE416_CELL / 2}" y="16">${sum}</text>`));
  gaps.forEach((x) => parts.push(`<text class="pe416-sum is-gap" x="${x + 6}" y="16">…</text>`));
  rows.forEach(([name, label, bits], r) => {
    const y = rowY(r);
    parts.push(`<text class="pe416-rowlabel${name === "shifted" ? " is-shift" : ""}" x="${PE416_LABEL / 2 - 4}" y="${y + PE416_CELL / 2 + 5}">${pe416Escape(label)}</text>`);
    bits.forEach((bit, c) => {
      const sum = view.sums[c];
      const isNew = shift && name === "after" && bit === 1 && view.before[c] === 0;
      const cls = ["pe416-cell", bit ? "is-on" : "is-off", sum === view.target ? "is-target" : "", isNew ? "is-new" : "", name === "shifted" && bit ? "is-shifted" : ""].filter(Boolean).join(" ");
      parts.push(`<g class="${cls}" data-row="${name}" data-sum="${sum}" data-bit="${bit}"><rect x="${xs[c]}" y="${y}" width="${PE416_CELL}" height="${PE416_CELL}" rx="6"/><text x="${xs[c] + PE416_CELL / 2}" y="${y + PE416_CELL / 2 + 5}">${bit}</text></g>`);
    });
  });
  // One arrow shows the shift: bit 0 (always on) moves num places left to bit num.
  if (shift) {
    const from = view.sums.indexOf(0);
    const to = view.sums.indexOf(view.num);
    if (from >= 0 && to >= 0) {
      const xa = xs[from] + PE416_CELL / 2;
      const xb = xs[to] + PE416_CELL / 2;
      parts.push(`<path class="pe416-arrow is-shift" d="M${xa},${rowY(0) + PE416_CELL + 2}L${xb},${rowY(1) - 3}" data-arrow="shift" marker-end="url(#pe416-tip-shift)"/>`);
    }
  }
  return `<svg class="pe416-svg pe416-bit-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="bits">${PE416_ARROWS}${parts.join("")}</svg>`;
}

function renderEqualSubset416BitsetView(step) {
  const view = step && step.equalSubset416BitsetView;
  const host = pe416Host();
  if (!view || !host) return;
  const copy = pe416Copy();
  const numbers = pe416Numbers(view.nums, (index) => (index === view.activeIndex ? "is-active"
    : index < (view.activeIndex ?? -1) || view.final ? "is-done" : ""), view.activeIndex);
  const body = `<div class="pe416-top">${pe416Goal(view.total, view.target, view.phase === "odd-return")}${numbers}</div>`
    + `<section class="pe416-card" aria-label="${pe416Escape(copy.picture[1])}"><header><b>${pe416Escape(copy.picture[1])}</b></header>${pe416BitPicture(view)}</section>`;
  host.innerHTML = pe416Shell({
    method: 2, label: "BITSET", line: view.line, answer: view.answer, final: Boolean(view.final), body,
    jumps: copy.jumps, legend: pe416Legend(copy.legendBit),
  });
  pe416Bind(host);
}

// ---------- 3. DFS call path ----------

const PE416_R = 17;
const PE416_STUB = 12;
const PE416_SPREAD = 46;
const PE416_LEVEL = 62;

// Lays out the call stack as a path: take goes down-left, skip down-right. Each frame also shows its
// other branch as a small stub (✓/× once returned, ? while pending).
function pe416DfsLayout(view) {
  const stack = view.stack || [];
  const nodes = [];
  const stubs = [];
  const edges = [];
  let x = 0;
  const frames = stack.length ? stack : view.final && view.root ? [view.root] : [];
  frames.forEach((frame, d) => {
    if (d > 0) x += frame.branch === "take" ? -PE416_SPREAD : PE416_SPREAD;
    nodes.push({ frame, x, d, top: d === frames.length - 1 });
  });
  nodes.forEach((node, k) => {
    const next = nodes[k + 1];
    const v = view.nums[node.frame.i];
    const child = (branch, result, pending) => ({ branch, result, pending, x: node.x + (branch === "take" ? -PE416_SPREAD : PE416_SPREAD), d: node.d + 1, parent: node, v });
    if (next) {
      edges.push({ from: node, to: next, branch: next.frame.branch, v, onPath: true });
      if (next.frame.branch === "skip") stubs.push(child("take", node.frame.take, false));
      else stubs.push(child("skip", null, true));
    } else if (!view.final && ["take", "skip", "combine"].includes(view.event)) {
      stubs.push(child("take", node.frame.take, node.frame.take === null));
      stubs.push(child("skip", node.frame.skip, node.frame.skip === null));
    }
  });
  stubs.forEach((stub) => edges.push({ from: stub.parent, to: stub, branch: stub.branch, v: stub.v, onPath: false, active: stub.pending && stub.parent.top && view.event === stub.branch }));
  return { nodes, stubs, edges };
}

function pe416DfsPicture(view) {
  const { nodes, stubs, edges } = pe416DfsLayout(view);
  if (!nodes.length) {
    if (view.event === "odd-return") return `<div class="pe416-empty"><b class="is-false">${pe416Escape(view.total)} % 2 = 1</b> → False</div>`;
    return `<div class="pe416-empty">${view.target === null ? "dfs(i, remain)" : `dfs(0, ${pe416Escape(view.target)})`}</div>`;
  }
  const xsAll = [...nodes.map((n) => n.x), ...stubs.map((s) => s.x)];
  const depth = Math.max(...nodes.map((n) => n.d), ...stubs.map((s) => s.d));
  const gutter = 34;
  const minX = Math.min(...xsAll) - PE416_R - 26 - gutter;
  const maxX = Math.max(...xsAll) + PE416_R + 26;
  const X = (x) => x - minX;
  const Y = (d) => 24 + d * PE416_LEVEL;
  const width = Math.max(maxX - minX, 200);
  const height = Y(depth) + PE416_R + 10;
  const parts = [];
  for (let d = 0; d <= depth; d++) parts.push(`<text class="pe416-level" x="${gutter / 2}" y="${Y(d) + 4}">i=${d}</text>`);
  edges.forEach((edge) => {
    const r1 = PE416_R;
    const r2 = edge.onPath ? PE416_R : PE416_STUB;
    const x1 = X(edge.from.x);
    const y1 = Y(edge.from.d) + r1;
    const x2 = X(edge.to.x);
    const y2 = Y(edge.to.d) - r2 - 2;
    const cls = ["pe416-edge", `is-${edge.branch}`, edge.onPath ? "is-path" : "is-stub", edge.active ? "is-active" : ""].filter(Boolean).join(" ");
    parts.push(`<path class="${cls}" d="M${x1},${y1}L${x2},${y2}" data-arrow="${edge.branch}" marker-end="url(#pe416-tip-edge)"/>`);
    if (edge.branch === "take") {
      // Right-aligned just above-left of the midpoint: the down-left edge runs right of this point above it.
      const mx = (x1 + x2) / 2 - 8;
      const my = (y1 + y2) / 2 - 2;
      parts.push(`<text class="pe416-edge-label" x="${mx}" y="${my}" text-anchor="end">−${pe416Escape(edge.v)}</text>`);
    }
  });
  stubs.forEach((stub) => {
    const cls = ["pe416-stub", stub.pending ? "is-pending" : stub.result ? "is-true" : "is-false"].join(" ");
    parts.push(`<g class="${cls}" data-stub="${stub.branch}" data-result="${stub.pending ? "" : stub.result}"><circle cx="${X(stub.x)}" cy="${Y(stub.d)}" r="${PE416_STUB}"/><text x="${X(stub.x)}" y="${Y(stub.d) + 4}">${stub.pending ? "?" : stub.result ? "✓" : "×"}</text></g>`);
  });
  nodes.forEach((node) => {
    const f = node.frame;
    const state = f.result === true ? "is-true" : f.result === false ? "is-false" : f.remain === 0 ? "is-true" : f.remain < 0 ? "is-false" : "";
    const cls = ["pe416-call", node.top ? "is-current" : "", state].filter(Boolean).join(" ");
    const badge = f.result === null || f.result === undefined ? "" : `<text class="pe416-call-result ${f.result ? "is-true" : "is-false"}" x="${X(node.x) + PE416_R + 9}" y="${Y(node.d) + 5}">${f.result ? "✓" : "×"}</text>`;
    parts.push(`<g class="${cls}" data-call="${f.id}" data-i="${f.i}" data-remain="${f.remain}"><circle cx="${X(node.x)}" cy="${Y(node.d)}" r="${PE416_R}"/><text x="${X(node.x)}" y="${Y(node.d) + 5}">${pe416Escape(f.remain)}</text>${badge}</g>`);
  });
  return `<svg class="pe416-svg pe416-dfs-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="dfs">${PE416_ARROWS}${parts.join("")}</svg>`;
}

function renderEqualSubset416DfsView(step) {
  const view = step && step.equalSubset416DfsView;
  const host = pe416Host();
  if (!view || !host) return;
  const copy = pe416Copy();
  const n = view.current;
  const chosen = new Set(view.partition?.a || n?.taken || []);
  const numbers = pe416Numbers(view.nums, (index) => (n && n.i === index && !view.final ? "is-active"
    : chosen.has(index) ? "is-taken" : n && index < n.i ? "is-skipped" : ""), n?.i);
  let meter = "";
  if (view.target !== null && n && !view.final) {
    const sum = view.target - n.remain;
    const pct = Math.max(0, Math.min(100, (100 * sum) / view.target));
    meter = `<div class="pe416-meter${sum > view.target ? " is-over" : sum === view.target ? " is-full" : ""}" data-remain="${n.remain}"><span>Σ ${copy.chosen}</span><div><i style="width:${pct}%"></i></div><b>${sum} / ${view.target}</b></div>`;
  }
  const body = `<div class="pe416-top">${pe416Goal(view.total, view.target, view.event === "odd-return")}${numbers}${meter}</div>`
    + `<section class="pe416-card" aria-label="${pe416Escape(copy.picture[2])}" data-dfs-call="${n ? n.id : ""}" data-dfs-take="${n ? n.take : ""}" data-dfs-skip="${n ? n.skip : ""}"><header><b>${pe416Escape(copy.picture[2])}</b><small>${view.calls} dfs()</small></header>${pe416DfsPicture(view)}</section>`;
  host.innerHTML = pe416Shell({
    method: 3, label: "DFS", line: view.line, answer: view.answer, final: Boolean(view.final), body,
    jumps: copy.dfsJumps, legend: pe416Legend(copy.legendDfs), groups: pe416Groups(view.nums, view.partition, copy),
    note: view.shortened ? copy.shortened : "",
  });
  pe416Bind(host);
}
