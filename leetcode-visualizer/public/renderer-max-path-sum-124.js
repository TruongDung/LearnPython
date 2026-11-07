"use strict";

let mps124PictureMode = "step";
function mps124Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function mps124Copy() {
  const vi = typeof lang !== "undefined" && lang === "vi";
  return { locale: vi ? "vi" : "en", region: vi ? "Tổng đường đi trong cây" : "Tree path sums", after: vi ? "Sau dòng" : "After line",
    best: vi ? "Lớn nhất đã gặp" : "Best so far", step: vi ? "Bước này" : "This step", bestMode: "Best",
    through: vi ? "Đi qua nút · hai nhánh" : "Through node · two arms", up: vi ? "Trả lên cha · một nhánh" : "Return to parent · one arm",
    tree: vi ? "Chọn nút để tua về lần gọi" : "Select a node to rewind to its call", left: vi ? "Trái" : "Left", right: vi ? "Phải" : "Right",
    clamp: vi ? "Nhận gain từ con" : "Receive a child gain", cut: vi ? "Bỏ nhánh âm" : "Drop negative arm", keep: vi ? "Giữ best" : "Keep best", update: vi ? "Best mới" : "New best",
    stack: "Stack · gain(node)", log: vi ? "Gain từng nút" : "Gains by node", empty: vi ? "Nhánh trống" : "Empty branch",
    result: vi ? "Tổng lớn nhất" : "Maximum path sum", rootReturn: vi ? "gain(root)" : "gain(root)",
    nextNode: vi ? "Nút tiếp →" : "Next node →", nextBest: vi ? "Best mới →" : "Next best →", nextReturn: vi ? "Trả lên ↑" : "Next return ↑", end: vi ? "Kết quả ↠" : "Result ↠",
    presets: vi ? ["Mẫu 42", "Hai nhánh", "Toàn âm", "Bỏ nhánh âm", "Một nút", "Cây lệch", "Giá trị 0"]
      : ["Example 42", "Two arms", "All negative", "Negative arms", "One node", "Skewed tree", "Zero values"],
  };
}
function mps124Path(v, path) {
  const byId = new Map(v.nodes.map(n => [n.id, n]));
  return `<div class="mps124-path">${path.map((id, index) => `${index ? '<i>—</i>' : ''}<span data-path-node="${id}"><b>${byId.get(id).value}</b><small>#${id.split(":")[1]}</small></span>`).join("")}</div>`;
}
function mps124Tree(v, t) {
  const width = Math.max(420, v.nodes.length * 80 + 48), depth = Math.max(...v.nodes.map(n => n.depth));
  const height = Math.max(240, depth * 96 + (v.emptyCall ? 210 : 128));
  const points = new Map(v.nodes.map(n => [n.id, { x: (width - (v.nodes.length - 1) * 80) / 2 + n.rank * 80, y: 60 + n.depth * 96 }]));
  const scene = mps124PictureMode === "best" ? { kind: "best", path: v.best.path } : v.scene;
  const pathNodes = new Set(scene.path), edgesInPath = new Set(scene.path.slice(1).map((id, i) => [id, scene.path[i]].sort().join("|")));
  const calls = new Set(v.stack.map(f => f.node)), done = new Map(v.ledger.filter(row => row.gain !== null).map(row => [row.id, row.gain]));
  const edges = v.nodes.filter(n => n.parent).map(n => {
    const a = points.get(n.parent), b = points.get(n.id), selected = edgesInPath.has([n.parent, n.id].sort().join("|"));
    const cut = mps124PictureMode === "step" && v.clamp?.discarded && v.clamp.child === n.id;
    return `<path class="mps124-edge ${selected ? `is-${scene.kind}` : ""} ${cut ? "is-cut" : ""}" data-edge-from="${n.parent}" data-edge-to="${n.id}" data-edge-selected="${selected}" d="M${a.x},${a.y} L${b.x},${b.y}"/>${cut ? `<text class="mps124-cut" x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2}">×</text>` : ""}`;
  }).join("");
  const nodes = v.nodes.map(n => {
    const p = points.get(n.id), current = n.id === v.active;
    return `<g class="mps124-node ${current ? "is-current" : ""} ${calls.has(n.id) ? "is-call" : ""} ${pathNodes.has(n.id) ? `is-${scene.kind}` : ""}" data-mps124-node="${n.id}" data-node-value="${n.value}" role="button" tabindex="0" aria-label="gain(${n.value}), #${n.id.split(":")[1]}"><circle class="mps124-ring" cx="${p.x}" cy="${p.y}" r="29"/><circle class="mps124-disc" cx="${p.x}" cy="${p.y}" r="24"/><text class="mps124-value" x="${p.x}" y="${p.y + 5}">${n.value}</text><text class="mps124-id" x="${p.x}" y="${p.y + 43}">#${n.id.split(":")[1]}</text>${done.has(n.id) ? `<text class="mps124-gain" data-node-gain="${n.id}" x="${p.x}" y="${p.y - 36}">↑ ${done.get(n.id)}</text>` : ""}</g>`;
  }).join("");
  let empty = "";
  if (v.emptyCall && mps124PictureMode === "step") {
    const parent = points.get(v.emptyCall.parent), x = parent.x + (v.emptyCall.side === "left" ? -40 : 40), y = parent.y + 80;
    empty = `<g class="mps124-null" data-empty-side="${v.emptyCall.side}"><path d="M${parent.x},${parent.y + 24} L${x},${y - 18}"/><circle cx="${x}" cy="${y}" r="18"/><text x="${x}" y="${y + 4}">∅</text><text x="${x}" y="${y + 40}">${v.emptyCall.returned === null ? "…" : "↑ 0"}</text></g>`;
  }
  const name = scene.kind === "through" ? t.through : scene.kind === "return" ? t.up : t.best;
  return `<section class="mps124-tree-card"><header><b class="is-${scene.kind}">${name}</b><div class="mps124-modes">${["step", "best"].map(mode => `<button type="button" data-mps124-mode="${mode}" aria-pressed="${mps124PictureMode === mode}">${mode === "step" ? t.step : t.bestMode}</button>`).join("")}</div></header><div class="mps124-tree-scroll" role="region" aria-label="${t.region}" tabindex="0"><svg class="mps124-tree-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="group" aria-label="${t.region}"><title>${t.region}</title>${edges}${nodes}${empty}</svg></div><small>${t.tree} · # = ID</small></section>`;
}
function mps124Fork(v, kind, t) {
  const row = v.current, isReturn = kind === "return", ready = isReturn ? v.returnedGain !== null : row.candidate !== null;
  const chosen = v.returnedGain?.chosen, number = value => value ?? "…";
  const left = !isReturn || chosen === "left", right = !isReturn || chosen === "right";
  const output = isReturn ? v.returnedGain?.value : row.candidate;
  const caption = isReturn ? t.up : t.through;
  return `<section class="mps124-fork is-${kind} ${ready ? "is-ready" : ""}" data-fork-kind="${kind}" data-fork-value="${output ?? null}"><header>${caption}</header><svg viewBox="0 0 224 145" role="img" aria-label="${caption}"><path class="${left && ready ? "is-chosen" : ""}" d="M44,102 L112,48"/><path class="${right && ready ? "is-chosen" : ""}" d="M180,102 L112,48"/>${isReturn ? `<path class="${ready ? "is-chosen" : ""}" d="M112,22 V4 M105,12 L112,4 L119,12"/>` : ""}<circle cx="112" cy="48" r="24"/><text x="112" y="53">${row.value}</text><circle class="${left && ready ? "is-chosen" : ""}" cx="44" cy="102" r="23"/><text x="44" y="107">${number(row.left)}</text><circle class="${right && ready ? "is-chosen" : ""}" cx="180" cy="102" r="23"/><text x="180" y="107">${number(row.right)}</text><text class="mps124-fork-label" x="44" y="140">L</text><text class="mps124-fork-label" x="180" y="140">R</text>${isReturn && ready && chosen !== "none" ? `<text class="mps124-unused" x="${chosen === "left" ? 180 : 44}" y="70">×</text>` : ""}</svg><code>${isReturn ? `${row.value} + max(${number(row.left)}, ${number(row.right)})` : `${number(row.left)} + ${row.value} + ${number(row.right)}`}</code><strong>${number(output)}</strong></section>`;
}
function mps124Calculation(v, t) {
  let html = "";
  if (v.clamp) html += `<section class="mps124-clamp ${v.clamp.discarded ? "is-cut" : ""}" data-clamp-raw="${v.clamp.raw}" data-clamp-value="${v.clamp.value}"><header>${t.clamp} · ${v.clamp.side === "left" ? t.left : t.right}</header><div><b>${v.clamp.raw}</b><i>→</i><code>max(…, 0)</code><i>→</i><strong>${v.clamp.value}</strong></div>${v.clamp.discarded ? `<small>✂ ${t.cut}</small>` : ""}</section>`;
  if (v.current) html += `<div class="mps124-forks">${mps124Fork(v, "through", t)}${mps124Fork(v, "return", t)}</div>`;
  if (v.source.line === 9) html += `<div class="mps124-compare" data-best-improved="${v.best.improved}"><small>${v.best.improved ? t.update : t.keep}</small><code>max(${v.best.before}, ${v.current.candidate})</code><i>→</i><strong>${v.best.value}</strong></div>`;
  if (v.emptyCall) html += `<div class="mps124-empty"><small>${t.empty}</small><code>gain(None)</code><b>∅</b><i>→</i><strong data-empty-return="${v.emptyCall.returned}">${v.emptyCall.returned ?? "…"}</strong></div>`;
  return html;
}
function mps124Stack(v, t) {
  if (!v.stack.length) return "";
  return `<section class="mps124-stack"><header>${t.stack} <small>· ${v.stack.length}</small></header><div class="mps124-stack-scroll">${v.stack.map((frame, i) => `<div class="${i === v.stack.length - 1 ? "is-current" : ""}" data-frame-index="${i}" data-frame-node="${frame.node}" data-frame-left="${frame.left}" data-frame-right="${frame.right}"><code>gain(${frame.value ?? "None"})</code><small>${frame.node ? `#${frame.node.split(":")[1]}` : "∅"}</small><span>L: ${frame.left ?? "—"} · R: ${frame.right ?? "—"}</span></div>`).join("")}</div></section>`;
}
function mps124Ledger(v, t, open) {
  return `<details class="mps124-ledger" ${open ? "open" : ""}><summary>${t.log} · ${v.ledger.filter(row => row.gain !== null).length}/${v.nodes.length}</summary><div class="mps124-ledger-scroll"><table><thead><tr><th>#</th><th>node</th><th>L</th><th>R</th><th>L+node+R</th><th>↑ gain</th></tr></thead><tbody>${v.ledger.map(row => `<tr data-mps124-node="${row.id}" role="button" tabindex="0" class="${row.id === v.active ? "is-current" : ""}"><th>${row.id.split(":")[1]}</th><td>${row.value}</td>${["left", "right", "candidate", "gain"].map(name => `<td data-ledger-node="${row.id}" data-ledger-field="${name}" data-ledger-value="${row[name]}">${row[name] ?? "·"}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
}
function mps124Jump(kind) {
  if (typeof steps === "undefined" || typeof renderStep !== "function") return;
  if (typeof stopPlay === "function") stopPlay();
  const next = steps.findIndex((s, i) => {
    const v = s.maxPathSum124View;
    return i > stepIndex && v && (kind === "node" ? v.source.line === 5 && v.active !== null : kind === "best" ? v.best.improved : kind === "return" ? v.scope === "gain" && v.returning : v.answer !== null);
  });
  stepIndex = next < 0 ? steps.length - 1 : next; renderStep();
}
function mps124Bind(host) {
  const bind = (selector, action) => host.querySelectorAll(selector).forEach(node => {
    node.addEventListener("click", () => action(node));
    node.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); action(node); } });
  });
  bind("[data-mps124-jump]", node => mps124Jump(node.dataset.mps124Jump));
  bind("[data-mps124-mode]", node => { mps124PictureMode = node.dataset.mps124Mode; renderStep(); });
  bind("[data-mps124-node]", node => {
    if (typeof steps === "undefined" || typeof renderStep !== "function") return;
    const index = steps.findIndex(s => s.maxPathSum124View?.source.line === 5 && s.maxPathSum124View.active === node.dataset.mps124Node);
    if (index < 0) return; if (typeof stopPlay === "function") stopPlay(); stepIndex = index; renderStep();
  });
  bind("[data-mps124-case]", node => {
    if (typeof runViz !== "function") return;
    const cases = [[-10,9,20,null,null,15,7],[1,2,3],[-8,-3,-10],[2,-1,-2],[-3],[-1,null,2,null,3,null,-2,null,4],[0,0,0]];
    document.getElementById("arrInput").value = JSON.stringify(cases[Number(node.dataset.mps124Case)]);
    mps124PictureMode = "step"; runViz();
  });
}
function renderMaxPathSum124View(step) {
  const host = document.getElementById("treeView"), v = step.maxPathSum124View, t = mps124Copy();
  if (!host || !v) return;
  const oldTree = host.querySelector(".mps124-tree-scroll"), scroll = { x: oldTree?.scrollLeft ?? 0, y: oldTree?.scrollTop ?? 0 };
  const oldLog = host.querySelector(".mps124-ledger-scroll"), logScroll = { x: oldLog?.scrollLeft ?? 0, y: oldLog?.scrollTop ?? 0 };
  const ledgerOpen = host.querySelector(".mps124-ledger")?.open ?? false;
  host.innerHTML = `<article class="mps124-viz" role="region" aria-label="${t.region}" data-source-line="${v.source.line}"><header class="mps124-header"><div><small>LEETCODE 124 · POSTORDER DFS</small><h2>${mps124Escape(v.phase[t.locale])}</h2></div><div class="mps124-best"><small>${t.best}</small><strong data-best-value="${v.best.value}">${v.best.value}</strong></div></header><nav class="mps124-presets" aria-label="Examples">${t.presets.map((name, i) => `<button type="button" data-mps124-case="${i}">${name}</button>`).join("")}</nav><div class="mps124-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${mps124Escape(v.source.text)}</code>${v.branch === null ? "" : `<strong class="${v.branch ? "is-true" : "is-false"}">${v.branch ? "True ✓" : "False ×"}</strong>`}</div>${mps124Tree(v, t)}${mps124Calculation(v, t)}${mps124Stack(v, t)}${v.answer === null ? "" : `<section class="mps124-result"><header><small>${t.result}</small><strong data-answer="${v.answer}">${v.answer}</strong></header>${mps124Path(v, v.best.path)}<small>${t.rootReturn} = ${v.rootReturn} · ${t.up}</small></section>`}${mps124Ledger(v, t, ledgerOpen)}<footer class="mps124-footer"><div>${[["node",t.nextNode],["best",t.nextBest],["return",t.nextReturn],["result",t.end]].map(([kind,label]) => `<button type="button" data-mps124-jump="${kind}">${label}</button>`).join("")}</div><small>O(n) time · O(h) space</small></footer></article>`;
  const tree = host.querySelector(".mps124-tree-scroll");
  if (tree) {
    tree.scrollLeft = scroll.x; tree.scrollTop = scroll.y;
    const focus = mps124PictureMode === "best" || v.answer !== null ? v.best.pivot : v.active;
    const current = host.querySelector(v.emptyCall && mps124PictureMode === "step" ? ".mps124-null"
      : `.mps124-node[data-mps124-node="${focus ?? v.nodes[0].id}"]`);
    if (current) {
      const box = tree.getBoundingClientRect(), p = current.getBoundingClientRect(), pad = 24;
      if (p.left < box.left + pad) tree.scrollLeft -= box.left + pad - p.left;
      if (p.right > box.right - pad) tree.scrollLeft += p.right - box.right + pad;
      if (p.top < box.top + pad) tree.scrollTop -= box.top + pad - p.top;
      if (p.bottom > box.bottom - pad) tree.scrollTop += p.bottom - box.bottom + pad;
    }
  }
  const stack = host.querySelector(".mps124-stack-scroll"); if (stack) stack.scrollLeft = stack.scrollWidth;
  const log = host.querySelector(".mps124-ledger-scroll");
  if (log && ledgerOpen) {
    log.scrollLeft = logScroll.x; log.scrollTop = logScroll.y;
    const row = log.querySelector("tr.is-current");
    if (row) {
      const box = log.getBoundingClientRect(), p = row.getBoundingClientRect();
      if (p.top < box.top + 30) log.scrollTop -= box.top + 30 - p.top;
      if (p.bottom > box.bottom) log.scrollTop += p.bottom - box.bottom;
      const field = { 7: "left", 8: "right", 9: "candidate", 10: "gain" }[v.source.line];
      const cell = row.querySelector(field ? `[data-ledger-field="${field}"]` : "td");
      if (cell) {
        const c = cell.getBoundingClientRect();
        if (c.left < box.left + 3) log.scrollLeft -= box.left + 3 - c.left;
        if (c.right > box.right - 3) log.scrollLeft += c.right - box.right + 3;
      }
    }
  }
  mps124Bind(host);
}
