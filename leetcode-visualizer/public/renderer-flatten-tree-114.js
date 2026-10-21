function flatten114Layout(v, final) {
  const positions = new Map();
  if (final) {
    v.chain.forEach((id, i) => positions.set(id, { x: 55 + i * 85, y: 90 }));
    return { positions, width: Math.max(460, v.chain.length * 85 + 60), height: 210 };
  }
  const original = new Map(v.original.map(node => [node.id, node]));
  let index = 0, depthMax = 0;
  function visit(id, depth) {
    if (id === null) return;
    const node = original.get(id);
    visit(node.left, depth + 1);
    positions.set(id, { x: 65 + index++ * 85, y: 90 + depth * 95 }); depthMax = Math.max(depthMax, depth);
    visit(node.right, depth + 1);
  }
  if (v.original.length) visit(0, 0);
  return { positions, width: Math.max(460, v.original.length * 85 + 70), height: 175 + depthMax * 95 };
}
function renderFlatten114Pictures(step) {
  const v = step.flatten114View, t = (vi, en) => lang === "vi" ? vi : en, esc = value => escapeHtml(String(value));
  const summary = v.mode === "summary", final = Boolean(step.final), byId = new Map(v.nodes.map(node => [node.id, node]));
  const { positions, width, height } = flatten114Layout(v, final);
  const name = id => id === null ? "None" : `#${id + 1}`;
  function edge(from, side, to, removed = false) {
    const a = positions.get(from), b = positions.get(to);
    if (!a) return "";
    const changed = !removed && v.change?.from === from && v.change?.side === side;
    const kind = removed ? "old" : changed ? "new" : side;
    if (!b) {
      if (to !== null && v.clipped) return `<path class="f114-edge right" d="M${a.x + 24},${a.y} h35" marker-end="url(#f114-right-arrow)"/><text class="f114-null" x="${a.x + 70}" y="${a.y + 5}">…</text>`;
      if (!changed) return "";
      const sign = side === "left" ? -1 : 1;
      return `<path class="f114-edge new" d="M${a.x + sign * 19},${a.y + 14} l${sign * 20},25" marker-end="url(#f114-new-arrow)"/><text class="f114-null changed" x="${a.x + sign * 51}" y="${a.y + 53}" text-anchor="middle">${side === "left" ? "L" : "R"}: ∅</text>`;
    }
    const dx = b.x - a.x, dy = b.y - a.y;
    let path, lx, ly;
    if (Math.abs(dy) < 5) {
      const sign = dx >= 0 ? 1 : -1, x1 = a.x + sign * 24, x2 = b.x - sign * 28, bend = side === "left" ? -42 : 0;
      path = `M${x1},${a.y} C${x1},${a.y + bend} ${x2},${b.y + bend} ${x2},${b.y}`; lx = (x1 + x2) / 2; ly = a.y + bend * .75 - 7;
    } else {
      const sign = dy >= 0 ? 1 : -1, shift = side === "left" ? -16 : 16, x1 = a.x + shift / 2, y1 = a.y + sign * 23, x2 = b.x + shift / 3, y2 = b.y - sign * 28, mid = (y1 + y2) / 2;
      path = `M${x1},${y1} C${x1 + shift},${mid} ${x2 + shift},${mid} ${x2},${y2}`; lx = (x1 + x2) / 2 + shift; ly = mid - 4;
    }
    return `<g><path class="f114-edge ${kind}" d="${path}" marker-end="url(#f114-${kind}-arrow)"/><text class="f114-edge-label ${kind}" x="${lx}" y="${ly}" text-anchor="middle">${side === "left" ? "L" : "R"}</text></g>`;
  }
  let edges = "";
  if (v.change && v.change.before !== v.change.after) edges += edge(v.change.from, v.change.side, v.change.before, true);
  edges += v.nodes.map(node => edge(node.id, "left", node.left) + edge(node.id, "right", node.right)).join("");
  const nodes = v.nodes.map(node => {
    const p = positions.get(node.id), aliases = ["root", "cur", "pred"].filter(key => Object.hasOwn(v.pointers, key) && v.pointers[key] === node.id);
    const classes = ["f114-node", v.completed.includes(node.id) ? "done" : "", v.pointers.cur === node.id ? "cur" : "", v.pointers.pred === node.id ? "pred" : ""].filter(Boolean).join(" ");
    return `<g class="${classes}" transform="translate(${p.x},${p.y})"><title>${name(node.id)} · val=${node.value} · left=${name(node.left)} · right=${name(node.right)}</title>${v.pointers.cur === node.id ? '<circle class="cur-ring" r="29"/>' : ""}<circle r="24"/><text class="value" y="6" text-anchor="middle">${node.value}</text><text class="identity" y="44" text-anchor="middle">${name(node.id)}${final ? " · L:∅" : ""}</text>${aliases.map((key, i) => `<text class="alias ${key}" y="${-37 - i * 17}" text-anchor="middle">${key}</text>`).join("")}</g>`;
  }).join("");
  function mini(from, to) {
    const dot = (id, x) => `<circle cx="${x}" cy="29" r="19"/><text class="mini-value" x="${x}" y="34" text-anchor="middle">${id === null ? "∅" : byId.get(id).value}</text><text class="mini-id" x="${x}" y="65" text-anchor="middle">${name(id)}</text>`;
    return `<svg viewBox="0 0 160 72" aria-hidden="true">${dot(from, 32)}<path d="M56,29 H103 m-7,-5 7,5 -7,5"/>${dot(to, 127)}</svg>`;
  }
  const splice = v.splice, readyToSplice = v.line === 7 && v.check === false || v.line >= 9 && v.line <= 11;
  const miniSteps = splice && readyToSplice ? `<div class="f114-splice">${[
    [9, "pred.right", splice.pred, splice.oldRight], [10, "cur.right", splice.cur, splice.left], [11, "cur.left", splice.cur, null]
  ].map(([line, text, from, to], i) => `<div class="${v.line === line ? "active" : ""}${v.line >= line ? " done" : ""}"><small>${i + 1} · ${text}</small>${mini(from, to)}</div>`).join("")}</div>` : "";
  const pointers = ["root", "cur", "pred"].map(key => `<span class="${key}"><small>${key}</small><b>${Object.hasOwn(v.pointers, key) ? name(v.pointers[key]) : "—"}</b></span>`).join("");
  const change = v.change ? `<div class="f114-change"><code>${name(v.change.from)}.${v.change.side}</code><s>${name(v.change.before)}</s><b>→</b><strong>${name(v.change.after)}</strong></div>` : "";
  const chain = v.chain.map(id => `<span class="${v.completed.includes(id) ? "done" : ""}"><b>${byId.get(id).value}</b><small>${name(id)}</small></span>`).join('<i>→</i>');
  const host = $("treeView");
  host.innerHTML = `<section class="f114-viz" aria-label="114 · Flatten Binary Tree">
    <header><strong>114 · ${t("Cây → chuỗi right", "Tree → right chain")}</strong><button type="button" data-f114-next ${final ? "disabled" : ""}>${t("Xong node", "Finish node")} ⏭</button><button type="button" data-f114-result>${t("Kết quả", "Result")}</button></header>
    <div class="f114-rule">${t("Gốc", "Root")} <b>→</b> ${t("Trái", "Left")} <b>→</b> ${t("Phải", "Right")} <span>right = next · left = ∅</span></div>
    ${summary ? `<div class="f114-summary">${t("Đã xử lý đủ", "Processed all")} ${v.total} node · ${t("hình xem trước 12 node. Debug từng dòng với ≤18 node.", "picture previews 12 nodes. Line debug for ≤18 nodes.")}</div>` : `<div class="f114-line"><b>L${v.line}</b><code>${esc(v.source)}</code>${v.check === null ? "" : `<strong>${v.check ? "True ✓" : "False ✕"}</strong>`}</div><div class="f114-pointers">${pointers}</div>`}
    ${miniSteps}
    <div class="f114-graph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:${width}px;height:${height}px" role="img" aria-label="${t("Con trỏ thật tại dòng hiện tại. L là left, R là right; # là số hiệu node.", "Actual pointers at this line. L is left, R is right; # is node identity.")}"><defs>${["left", "right", "old", "new"].map(kind => `<marker id="f114-${kind}-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z"/></marker>`).join("")}</defs>${edges}${nodes}${v.nodes.length ? "" : '<text class="f114-empty" x="230" y="95" text-anchor="middle">root = None · ∅</text>'}</svg></div>
    <div class="f114-legend"><span class="left">L: left</span><span class="right">R: right</span><span class="new">→ ${t("nối mới", "new link")}</span><span class="old">⇢ ${t("vừa bỏ", "removed link")}</span><span># = ${t("số hiệu node", "node identity")}</span></div>
    ${change}
    ${final ? `<div class="f114-answer"><strong>✓ ${t("Mọi left = None", "Every left = None")}</strong><code>return → None</code></div>` : `<div class="f114-chain"><small>${t("Đi theo right lúc này", "Follow right right now")} · ${v.completed.length}/${v.total} ${t("node xong", "nodes done")}</small><div>${chain || '<code>∅</code>'}${v.chain.length ? '<i>→ None</i>' : ""}</div></div>`}
    <div class="f114-examples">${[t("Ví dụ", "Example"), t("Cây thưa", "Sparse"), t("Lệch trái", "Left chain"), t("Lệch phải", "Right chain"), t("Trùng giá trị", "Duplicates"), t("Rỗng", "Empty")].map((text, i) => `<button type="button" data-f114-example="${i}">${text}</button>`).join("")}</div>
  </section>`;
  host.querySelector("[data-f114-result]").addEventListener("click", () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelector("[data-f114-next]").addEventListener("click", () => {
    const target = steps.findIndex((s, i) => i > stepIndex && s.flatten114View?.event === "advance");
    stopPlay(); stepIndex = target < 0 ? steps.length - 1 : target; renderStep();
  });
  host.querySelectorAll("[data-f114-example]").forEach(button => button.addEventListener("click", () => { $("arrInput").value = ["1,2,5,3,4,null,6", "1,null,2,3", "1,2,null,3,null,4", "1,null,2,null,3,null,4", "7,7,7,7,7", "[]"][Number(button.dataset.f114Example)]; runViz(); }));
  const graph = host.querySelector(".f114-graph"), focus = positions.get(v.change?.from ?? v.pointers.cur);
  if (graph && focus) {
    if (width > graph.clientWidth) graph.scrollLeft = Math.max(0, focus.x - graph.clientWidth / 2);
    if (height > graph.clientHeight) graph.scrollTop = Math.max(0, focus.y - graph.clientHeight / 2);
  }
}
