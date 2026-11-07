"use strict";

function rg25Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function rg25Name(id) { return id === null ? "None" : id === -1 ? "D" : `#${id + 1}`; }
function rg25Text() {
  const vi = typeof lang !== "undefined" && lang === "vi";
  return { locale: vi ? "vi" : "en", region: vi ? "Đảo nhóm k nút" : "Reverse k-node groups",
    count: vi ? "Đếm" : "Count", reverse: vi ? "Đảo" : "Reverse", connect: vi ? "Nối" : "Attach", done: vi ? "Xong" : "Done",
    after: vi ? "Sau dòng" : "After line", next: vi ? "Đổi next →" : "Next rewire →",
    group: vi ? "Xong nhóm ↠" : "Finish group ↠", result: vi ? "Kết quả ↠" : "Result ↠",
    old: vi ? "Liên kết cũ" : "Old link", fresh: vi ? "Liên kết mới" : "New link",
    identity: vi ? "# = số hiệu nút" : "# = node identity", input: "Input",
    graph: vi ? "Các liên kết next thực tế" : "Actual next links", detached: vi ? "Ngoài chuỗi D.next" : "Outside the D.next chain",
    kept: vi ? "giữ nguyên" : "keep unchanged", empty: vi ? "Rỗng" : "Empty",
    short: vi ? "Thiếu k" : "Fewer than k", duplicate: vi ? "Giá trị trùng" : "Duplicates",
  };
}

function rg25Graph(v, t) {
  const ids = [-1, ...v.original.map((_, id) => id)], gap = 74, y = 112;
  const positions = new Map(ids.map((id, index) => [id, 36 + index * gap]));
  const terminal = 36 + ids.length * gap, width = terminal + 36;
  const byId = new Map(v.nodes.map(node => [node.id, node]));
  const names = ["prev_group", "kth", "prev", "cur", "nxt", "next_group", "tmp", "head"];
  const aliases = id => names.filter(name => Object.hasOwn(v.pointers, name) && v.pointers[name] === id);
  const maxAliases = Math.max(1, ...[...ids, null].map(id => aliases(id).length));
  const height = Math.max(290, 225 + maxAliases * 18);
  function edge(from, to, removed = false) {
    const a = positions.get(from), b = to === null ? terminal : positions.get(to);
    const forward = b > a, sign = forward ? 1 : -1, x1 = a + 24 * sign, x2 = b - 28 * sign;
    const path = forward && b - a <= gap * 1.1 ? `M${x1},${y} L${x2},${y}`
      : `M${x1},${y} C${x1 + 18 * sign},${y + (forward ? -82 : 72)} ${x2 - 18 * sign},${y + (forward ? -82 : 72)} ${x2},${y}`;
    const changed = !removed && v.change?.from === from && v.change?.after === to;
    const kind = removed ? "old" : changed ? "new" : "normal";
    return `<path class="rg25-edge is-${kind}" d="${path}" marker-end="url(#rg25-arrow-${kind})" data-link-kind="${kind}" data-link-from="${from}" data-link-to="${to}"/>`;
  }
  const aliasLabels = (id, x) => aliases(id).map((name, index) => `<text x="${x}" y="${208 + index * 18}" class="rg25-alias is-${name}" data-alias="${name}" data-alias-node="${id}">${name}</text>`).join("");
  let edges = v.nodes.map(node => edge(node.id, node.next)).join("");
  if (v.change && v.change.before !== v.change.after) edges = edge(v.change.from, v.change.before, true) + edges;
  const nodes = ids.map(id => {
    const node = byId.get(id), x = positions.get(id);
    if (!node) return "";
    const classes = ["rg25-node", id === -1 ? "is-dummy" : "", v.group.includes(id) ? "is-group" : "",
      v.completed.includes(id) ? "is-done" : "", v.detached.includes(id) ? "is-detached" : "",
      v.change?.from === id ? "is-writing" : "", v.pointers.cur === id ? "is-cur" : ""].filter(Boolean).join(" ");
    const shape = id === -1 ? `<rect x="${x - 23}" y="${y - 23}" width="46" height="46" rx="10"/>`
      : `<circle cx="${x}" cy="${y}" r="23"/>`;
    return `<g class="${classes}" data-node-id="${id}" data-node-value="${node.value}" data-node-next="${node.next}"><title>${rg25Name(id)}: val=${node.value}, next=${rg25Name(node.next)}</title>${shape}<text x="${x}" y="${y + 6}" class="rg25-value">${id === -1 ? "D" : node.value}</text><text x="${x}" y="${y + 43}" class="rg25-node-id">${id === -1 ? "dummy" : rg25Name(id)}</text></g>${aliasLabels(id, x)}`;
  }).join("");
  const none = `<g class="rg25-terminal"><rect x="${terminal - 28}" y="${y - 17}" width="56" height="34" rx="8"/><text x="${terminal}" y="${y + 5}">None</text></g>${aliasLabels(null, terminal)}`;
  const countDots = v.group.map((id, index) => `<g class="rg25-count-dot ${v.checked.includes(id) ? "is-checked" : ""}"><circle cx="${positions.get(id)}" cy="25" r="11"/><text x="${positions.get(id)}" y="29">${v.checked.includes(id) ? "✓" : index + 1}</text></g>`).join("");
  return `<svg class="rg25-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t.graph}"><title>${t.graph}</title><defs>${["normal", "old", "new"].map(kind => `<marker id="rg25-arrow-${kind}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z"/></marker>`).join("")}</defs>${countDots}${edges}${nodes}${none}</svg>`;
}

function rg25Groups(v, t) {
  const groups = [];
  for (let start = 0; start < v.original.length; start += v.k) {
    const ids = v.original.slice(start, start + v.k).map((_, offset) => start + offset);
    const active = ids.some(id => v.group.includes(id)), done = ids.every(id => v.completed.includes(id));
    groups.push(`<span class="rg25-input-group ${active ? "is-active" : ""} ${done ? "is-done" : ""} ${ids.length < v.k ? "is-short" : ""}">${ids.map(id => `<b>${v.original[id]}</b>`).join('<i>→</i>')}</span>`);
  }
  return `<div class="rg25-input"><small>${t.input}</small><div>${groups.join("") || "∅"}</div></div>`;
}

function rg25Chain(v, t) {
  const byId = new Map(v.nodes.map(n => [n.id, n]));
  const chain = v.order.map(id => `<span class="rg25-chain-node ${v.completed.includes(id) ? "is-done" : ""}" data-chain-node="${id}"><b>${byId.get(id).value}</b><small>${rg25Name(id)}</small></span>`).join('<i>→</i>');
  return `<div class="rg25-chain ${v.answer !== null ? "is-final" : ""}"><small>${v.answer !== null ? "return dummy.next" : "D.next"}</small><div>${chain || "∅"}${chain ? "<i>→ None</i>" : ""}</div></div>`;
}

function rg25Jump(kind) {
  if (typeof steps === "undefined" || typeof renderStep !== "function") return;
  if (typeof stopPlay === "function") stopPlay();
  const next = steps.findIndex((s, index) => {
    const v = s.reverseGroup25View;
    return index > stepIndex && v && (kind === "result" ? v.answer !== null : kind === "group" ? v.source.line === 20 : Boolean(v.change));
  });
  stepIndex = next < 0 ? steps.length - 1 : next;
  renderStep();
}

function rg25Bind(host) {
  const bind = (selector, action) => host.querySelectorAll(selector).forEach(node => {
    node.addEventListener("click", () => action(node));
    node.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); action(node); }
    });
  });
  bind("[data-rg25-jump]", node => rg25Jump(node.dataset.rg25Jump));
  bind("[data-rg25-case]", node => {
    if (typeof runViz !== "function") return;
    const presets = [["1,2,3,4,5", 2], ["1,2,3,4,5", 3], ["1,2,3,4,5", 1], ["1,2,3,4,5", 5], ["7,7,2,7,2", 2], ["1,2", 3], ["[]", 2]];
    const [input, k] = presets[Number(node.dataset.rg25Case)];
    document.getElementById("arrInput").value = input;
    const field = document.querySelector('[data-param="k"]');
    if (field) field.value = k;
    runViz();
  });
}

function renderReverseGroup25Pictures(step) {
  const host = document.getElementById("treeView"), v = step.reverseGroup25View, t = rg25Text();
  if (!host || !v) return;
  const oldScroll = host.querySelector(".rg25-graph")?.scrollLeft ?? 0;
  const pointerNames = ["prev_group", "kth", "prev", "cur", "nxt", "next_group"];
  const pointers = pointerNames.map(name => `<span class="rg25-pointer is-${name} ${v.pointerChanges.some(p => p.name === name) ? "is-changed" : ""}" data-pointer="${name}" data-pointer-node="${Object.hasOwn(v.pointers, name) ? v.pointers[name] : "unbound"}"><small>${name}</small><b>${Object.hasOwn(v.pointers, name) ? rg25Name(v.pointers[name]) : "—"}</b></span>`).join("");
  const phaseRail = ["count", "reverse", "connect", "done"].map((key, index) => `<span class="${v.stage === key ? "is-active" : ""}"><i>${["①", "↶", "⇢", "✓"][index]}</i>${t[key]}</span>`).join('<i class="rg25-phase-arrow">→</i>');
  const change = v.change ? `<div class="rg25-change" data-change-from="${v.change.from}" data-change-before="${v.change.before}" data-change-after="${v.change.after}"><code>${rg25Name(v.change.from)}.next</code><s>${rg25Name(v.change.before)}</s><i>→</i><b>${rg25Name(v.change.after)}</b></div>` : "";
  const remainder = v.answer !== null && v.remainder.length ? `<div class="rg25-remainder" data-remainder="${v.remainder.length}">${v.remainder.length} &lt; ${v.k} <b>→ ${t.kept}</b></div>` : "";
  const detached = v.detached.length ? `<div class="rg25-detached"><small>${t.detached}</small>${v.detached.map(id => `<code>${rg25Name(id)}</code>`).join("")}</div>` : "";
  const presets = ["k = 2", "k = 3", "k = 1", "k = n", t.duplicate, t.short, t.empty];
  host.innerHTML = `<article class="rg25-viz" role="region" aria-label="${t.region}" data-source-line="${v.source.line}">
    <header class="rg25-header"><div><small>LEETCODE 25 · LINKED LIST</small><h2>${rg25Escape(v.phase[t.locale])}</h2></div><b class="rg25-k">k = ${v.k}</b></header>
    <nav class="rg25-presets" aria-label="Examples">${presets.map((name, index) => `<button type="button" data-rg25-case="${index}">${name}</button>`).join("")}</nav>
    ${rg25Groups(v, t)}<div class="rg25-phases">${phaseRail}</div>
    <div class="rg25-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${rg25Escape(v.source.text)}</code>${v.branch === null ? "" : `<strong class="${v.branch ? "is-true" : "is-false"}" data-branch="${v.branch}">${v.branch ? "True ✓" : "False ×"}</strong>`}</div>
    <div class="rg25-pointers">${pointers}</div>
    <section class="rg25-diagram"><div class="rg25-meter"><b>${t.count} ${v.checked.length}/${v.k}</b><span>${t.reverse} ${v.reversed.length}/${v.k}</span></div><div class="rg25-graph" role="region" tabindex="0" aria-label="${t.graph}">${rg25Graph(v, t)}</div><div class="rg25-legend"><span class="is-new">→ ${t.fresh}</span><span class="is-old">⇢ ${t.old}</span><span>${t.identity}</span></div></section>
    ${change}${detached}${remainder}${rg25Chain(v, t)}
    <footer class="rg25-footer"><div><button type="button" data-rg25-jump="rewire">${t.next}</button><button type="button" data-rg25-jump="group">${t.group}</button><button type="button" data-rg25-jump="result">${t.result}</button></div><small>O(n) time · O(1) space</small></footer>
  </article>`;
  const graph = host.querySelector(".rg25-graph");
  if (graph) {
    graph.scrollLeft = oldScroll;
    const focus = v.answer !== null ? v.returned?.id ?? -1 : v.change?.from ?? v.pointerChanges.find(p => p.name === "kth")?.after ?? v.pointers.cur;
    const target = host.querySelector(`[data-node-id="${focus}"]`);
    if (target) {
      const box = graph.getBoundingClientRect(), node = target.getBoundingClientRect(), pad = 20;
      if (node.left < box.left + pad) graph.scrollLeft -= box.left + pad - node.left;
      if (node.right > box.right - pad) graph.scrollLeft += node.right - box.right + pad;
    }
  }
  rg25Bind(host);
}
