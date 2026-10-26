function renderSearchMatrix240Pictures(step) {
  const v = step.search240View, vi = lang === "vi", esc = escapeHtml;
  const size = 44, ox = 52, oy = 32, width = ox + v.cols * size + 20, height = oy + v.rows * size + 40;
  const key = cell => cell.join(","), point = cell => [ox + cell[1] * size + 22, oy + cell[0] * size + 22];
  const routePoint = cell => { const p = point(cell); return [p[0] + 18, p[1] + 15]; };
  const visits = new Map(v.path.map((cell, i) => [key(cell), i + 1]));
  const dropCells = new Set((v.drop?.cells || []).map(key));
  const same = (a, b) => a && b && key(a) === key(b);
  const inRange = (r, c) => v.row === null || r >= v.row && c <= v.col;
  const axes = v.matrix.flatMap((row, r) => [
    `<text class="s240p-axis" x="13" y="${oy + r * size + 26}">${r}</text>`,
    ...(r === 0 ? row.map((_, c) => `<text class="s240p-axis" x="${ox + c * size + 22}" y="17">${c}</text>`) : []),
  ]).join("");
  const cells = v.matrix.flatMap((row, r) => row.map((value, c) => {
    const cell = [r, c], current = same(v.pointer, cell), read = same(v.readCell, cell), order = visits.get(key(cell));
    const dropped = dropCells.has(key(cell)), className = `${inRange(r, c) ? "candidate" : "discarded"} ${current ? `current ${read ? "read" : "next"}` : ""} ${dropped ? v.drop.applied ? "removed" : "preview" : ""} ${v.phase === "found" && current ? "found" : ""}`;
    return `<g class="s240p-cell ${className}" transform="translate(${ox + c * size},${oy + r * size})"><title>matrix[${r}][${c}] = ${esc(String(value))}${order ? `; #${order}` : ""}</title><rect x="2" y="2" width="40" height="40" rx="6"/><text class="s240p-value" x="22" y="28" ${String(value).length > 4 ? 'textLength="34" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(String(value))}</text>${order ? `<text class="s240p-order" x="10" y="11">${order}</text>` : ""}${current && !read ? '<text class="s240p-next-mark" x="33" y="12">?</text>' : ""}${dropped ? v.drop.applied ? '<path class="s240p-cross" d="M 30 6 l 6 6 m 0 -6 l -6 6"/>' : '<text class="s240p-preview-mark" x="33" y="12">?</text>' : ""}</g>`;
  })).join("");
  const region = v.pointer ? `<rect class="s240p-region" x="${ox - 1}" y="${oy + v.row * size - 1}" width="${(v.col + 1) * size + 2}" height="${(v.rows - v.row) * size + 2}" rx="7"/>` : "";
  let arrow = "";
  if (v.lastMove) {
    const from = routePoint(v.lastMove.from), to = routePoint(v.lastMove.to);
    if (v.lastMove.to[1] < 0) to[0] = ox - 22;
    if (v.lastMove.to[0] >= v.rows) to[1] = height - 13;
    arrow = `<path class="s240p-move" d="M ${from.join(" ")} L ${to.join(" ")}" marker-end="url(#s240p-arrow)"/>${!v.pointer ? `<circle class="s240p-exit" cx="${to[0]}" cy="${to[1]}" r="10"/><text class="s240p-exit-label" x="${to[0]}" y="${to[1] + 4}">∅</text>` : ""}`;
  }
  const ruleIcon = kind => {
    const squares = Array.from({ length: 9 }, (_, i) => {
      const r = Math.floor(i / 3), c = i % 3, drop = kind === "col" ? c === 2 : r === 0;
      return `<rect class="${drop ? "drop" : "keep"} ${r === 0 && c === 2 ? "pivot" : ""}" x="${c * 13 + 2}" y="${r * 13 + 2}" width="10" height="10" rx="2"/>`;
    }).join("");
    return `<svg class="s240p-rule-icon" viewBox="0 0 42 42" width="42" height="42" aria-hidden="true">${squares}</svg>`;
  };
  const rules = [{ kind: "col", operator: ">", arrow: "←", code: "col -= 1" }, { kind: "row", operator: "<", arrow: "↓", code: "row += 1" }].map(rule => {
    const active = v.drop?.kind === rule.kind;
    return `<div class="s240p-rule ${active ? "active" : ""}"><code>${active ? `${esc(String(v.value))} ${esc(rule.operator)} ${esc(String(v.target))}` : `value ${esc(rule.operator)} target`}</code><div>${ruleIcon(rule.kind)}<b>${rule.arrow}</b></div><code>${rule.code}</code></div>`;
  }).join("");
  let operation;
  if (v.drop?.applied) {
    const left = v.drop.kind === "col", name = left ? "col" : "row", before = v.drop.index, after = left ? v.col : v.row;
    operation = `<b class="s240p-direction">${left ? "←" : "↓"}</b><code>${name}: ${before} → ${after}</code><span class="s240p-cut">−${v.drop.cells.length} ${vi ? "ô" : "cells"}</span>`;
  } else if (v.decision.kind === "equal" || v.decision.kind === "greater") {
    operation = `<span class="s240p-number">${esc(String(v.value))}</span><b>${v.decision.kind === "equal" ? "==" : "&gt;"}</b><span class="s240p-number target">${esc(String(v.target))}</span><b class="${v.decision.result ? "yes" : "no"}">${v.decision.result ? "✓" : "✕"}</b>${v.drop ? `<small class="s240p-proof">${v.drop.kind === "col" ? "↓ ≥" : "← ≤"} ${esc(String(v.value))} ${v.drop.kind === "col" ? "&gt;" : "&lt;"} ${esc(String(v.target))}</small>` : ""}`;
  } else if (v.phase === "found") {
    operation = `<b class="yes">✓</b><code>matrix[${v.row}][${v.col}] = ${esc(String(v.value))}</code><span class="s240p-return yes">True</span>`;
  } else if (v.phase === "missing") {
    operation = `<b class="no">∅</b><code>${v.col < 0 ? `col = ${v.col}` : `row = ${v.row}`}</code><span class="s240p-return no">False</span>`;
  } else if (v.phase === "read") {
    operation = `<code>matrix[${v.row}][${v.col}]</code><b>→</b><code>value =</code><span class="s240p-number">${esc(String(v.value))}</span>`;
  } else if (v.phase === "loop") {
    operation = `<code>${v.row} &lt; ${v.rows} ∧ ${v.col} ≥ 0</code><b class="${v.decision.inBounds ? "yes" : "no"}">${v.decision.inBounds ? "✓" : "✕"}</b>`;
  } else {
    operation = `<code>${v.phase === "guard" ? `${v.rows} × ${v.cols} ≠ ∅` : `(row, col) = (0, ${v.cols - 1})`}</code><b class="yes">✓</b>`;
  }
  const summary = vi ? `Tìm ${v.target}; còn ${v.candidates}/${v.rows * v.cols} ô; đã đọc ${v.path.length} ô.` : `Find ${v.target}; ${v.candidates}/${v.rows * v.cols} candidates; ${v.path.length} probes.`;
  $("treeView").innerHTML = `<section class="s240p-viz" aria-label="${esc(summary)}">
    <div class="s240p-heading"><b>${vi ? "ĐƯỜNG CẦU THANG" : "STAIRCASE PATH"}</b><span class="s240p-target">target <strong>${esc(String(v.target))}</strong></span><small>${v.rows} × ${v.cols} · ${vi ? "Dòng" : "Line"} ${v.source.line}</small></div>
    <div class="s240p-layout"><div class="s240p-canvas"><svg class="s240p-grid" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(summary)}"><defs><marker id="s240p-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z"/></marker></defs>${region}${axes}${cells}<polyline class="s240p-trail" points="${v.path.map(cell => routePoint(cell).join(",")).join(" ")}"/>${arrow}</svg></div><div class="s240p-rules">${rules}</div></div>
    <div class="s240p-legend"><span class="candidate"></span>${vi ? "Còn tìm" : "Candidate"}<span class="current"></span>${vi ? "Đang xét" : "Current"}<span class="next">?</span>${vi ? "Chưa đọc" : "Not read"}<span class="discarded"></span>${vi ? "Đã bỏ" : "Discarded"}<b>1,2…</b>${vi ? "Thứ tự đọc" : "Probe order"}</div>
    <div class="s240p-progress"><span>${v.candidates} / ${v.rows * v.cols}</span><div><i style="width:${v.candidates / (v.rows * v.cols) * 100}%"></i></div><small>${v.path.length} ${vi ? "lần đọc" : "probes"}</small></div>
    <div class="s240p-operation">${operation}</div>
  </section>`;
  const canvas = $("treeView").querySelector(".s240p-canvas");
  if (canvas && v.row !== null) {
    const focus = point([v.row, v.col]);
    canvas.scrollTop = Math.max(0, focus[1] - canvas.clientHeight / 2);
    canvas.scrollLeft = Math.max(0, focus[0] - canvas.clientWidth / 2);
  }
}
