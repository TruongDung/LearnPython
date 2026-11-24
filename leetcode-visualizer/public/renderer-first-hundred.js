"use strict";

function renderFirstHundredView(step) {
  const v = step.firstHundredView;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value ?? ""));
  const cell = item => `<span class="fh-cell ${["active","done","warm","bad"].includes(item.tone) ? item.tone : ""}"><b>${esc(item.text)}</b>${item.sub !== "" && item.sub !== undefined ? `<small>${esc(item.sub)}</small>` : ""}</span>`;
  const rows = (v.rows || []).map(r => `<section class="fh-row"><h4>${esc(pick(r.label))}</h4><div class="fh-strip${r.linked ? " linked" : ""}">${r.items.length ? r.items.map(cell).join(r.linked ? '<i aria-hidden="true">→</i>' : "") : '<span class="fh-empty">∅</span>'}${r.linked ? '<i>→ ∅</i>' : ""}</div></section>`).join("");

  function grid(g) {
    const size = 42, gap = 6, width = Math.max(1,g.cols) * (size+gap) + gap, height = g.rows * (size+gap) + gap;
    const xy = c => [gap+c.c*(size+gap), gap+c.r*(size+gap)];
    const path = v.id === 6 && g.cells.length > 1 ? `<polyline class="fh-path" points="${g.cells.map(c => {const [x,y]=xy(c);return `${x+size/2},${y+size/2}`;}).join(" ")}"/>` : "";
    const cells = g.cells.map(c => {const [x,y]=xy(c);return `<g class="fh-grid-cell${c.active ? " active" : c.done ? " done" : ""}"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="9"/><text x="${x+size/2}" y="${y+size/2+6}">${esc(c.text)}</text><title>${text("Hàng", "Row")} ${c.r}, ${text("cột", "column")} ${c.c}: ${esc(c.text)}</title></g>`;}).join("");
    return `<div class="fh-grid-scroll" tabindex="0" aria-label="${text("Ma trận minh họa", "Illustrated matrix")}"><svg class="fh-grid" role="img" aria-label="${v.id === 6 ? text("Đường zigzag", "Zigzag path") : text("Ma trận xoắn ốc", "Spiral matrix")}" viewBox="0 0 ${width} ${height}" style="width:${width}px;max-height:${Math.max(height,200)}px">${path}${cells}</svg></div>`;
  }

  function treePicture(root) {
    if (!root) return '<span class="fh-empty">∅</span>';
    const nodes = [], edges = []; let order = 0, deepest = 0;
    function visit(node, depth) {
      if (!node) return null;
      const left = visit(node.left,depth+1), record = {node,order:order++,depth};
      nodes.push(record);deepest=Math.max(deepest,depth);
      const right = visit(node.right,depth+1);
      for (const child of [left,right]) if(child) edges.push([record,child]);
      return record;
    }
    visit(root,0);
    const x = r => 28 + r.order*42, y = r => 27+r.depth*52;
    const lines = edges.map(([a,b])=>`<line x1="${x(a)}" y1="${y(a)}" x2="${x(b)}" y2="${y(b)}"/>`).join("");
    return `<svg class="fh-tree" viewBox="0 0 ${Math.max(84,order*42+14)} ${deepest*52+56}" role="img" aria-label="BST ${esc(root.val)}"><g class="fh-tree-edges">${lines}</g>${nodes.map(r=>`<g class="${r.depth === 0 ? "root" : ""}"><circle cx="${x(r)}" cy="${y(r)}" r="17"/><text x="${x(r)}" y="${y(r)+5}">${esc(r.node.val)}</text></g>`).join("")}</svg>`;
  }
  const forest = v.forest ? `<section class="fh-forest" aria-label="${text("Các cây BST", "BST gallery")}">${v.forest.map((tree,i)=>`<article><small>#${i+1}</small>${treePicture(tree)}</article>`).join("")}</section>` : "";
  const ranges = v.ranges ? `<div class="fh-ranges">${v.ranges.filter(r=>r.from<=r.to).map(r=>`<span><b>${esc(pick(r.label))}</b> [${r.from} … ${r.to}]</span>`).join('<i>→</i>')}</div>` : "";
  const sequence = v.sequence ? `<section class="fh-sequence"><h4>${text("Kết quả đã tìm được", "Results so far")} · ${v.sequence.length}</h4><div>${v.sequence.map((s,i)=>`<span class="${i===v.sequence.length-1 ? "active" : ""}">${esc(s)}</span>`).join("") || '<span>∅</span>'}</div></section>` : "";
  let result = v.result;
  if(Array.isArray(result)) result = Array.isArray(result[0]) ? `${result.length} × ${result[0].length}` : JSON.stringify(result);
  $("treeView").innerHTML = `<section class="fh-viz" aria-label="LeetCode ${v.id}">
    <header><span class="fh-badge">#${v.id}</span><h3>${esc(pick(step.title))}</h3></header>
    <div class="fh-legend"><span class="active">${text("Đang xét", "Current")}</span><span class="done">${text("Đã chọn / bên trái", "Chosen / left")}</span><span class="warm">${text("Bên phải", "Right")}</span><span class="bad">${text("Loại", "Rejected")}</span></div>
    ${v.equation ? `<div class="fh-equation">${esc(v.equation)}</div>` : ""}
    ${v.grid ? grid(v.grid) : ""}${ranges}${rows}${forest}${sequence}
    ${result !== undefined ? `<footer><small>${step.final ? text("KẾT QUẢ", "RESULT") : text("HIỆN TẠI", "CURRENT")}</small><strong>${esc(result)}</strong></footer>` : ""}
  </section>`;
}
