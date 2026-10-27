function renderSubsequences491Pictures(step) {
  const v = step.subsequences491View, vi = lang === "vi", esc = x => escapeHtml(String(x));
  const t = (a, b) => vi ? a : b, frame = v.stack.at(-1), selected = new Set(v.selected);
  const activeActions = ["candidate", "duplicate", "skip-duplicate", "order", "skip-order", "used-add", "append", "resume", "pop"];
  const focus = activeActions.includes(v.action) ? v.i : null;
  const rejected = v.action.startsWith("skip") || v.gates.duplicate?.pass === false || v.gates.order?.pass === false;
  const colors = ["blue", "violet", "teal", "pink", "gold", "lime", "blue", "violet"];
  const tone = value => colors[v.nums.indexOf(value) % colors.length];
  const chip = (value, extra = "") => `<b class="sq491-chip ${tone(value)} ${extra}">${esc(value)}</b>`;
  const chain = (values, extra = "") => values.length ? values.map(value => chip(value, extra)).join('<i class="sq491-link" aria-hidden="true">→</i>') : '<span class="sq491-empty">∅</span>';
  const w = Math.max(360, v.nums.length * 64 + 20), center = i => v.nums.length === 1 ? w / 2 : 42 + i * (w - 84) / (v.nums.length - 1);
  const pathIndices = [...v.selected];
  const preview = ["candidate", "duplicate", "order", "used-add"].includes(v.action) && !rejected && focus !== null;
  if (preview) pathIndices.push(focus);
  if (v.action === "pop") pathIndices.push(v.removedIndex);
  const low = Math.min(...v.nums), high = Math.max(...v.nums);
  const pathPoint = position => [w / 2 + (position - (pathIndices.length - 1) / 2) * 55,
    202 - (high === low ? 25 : (v.nums[pathIndices[position]] - low) / (high - low) * 50)];
  const source = v.nums.map((value, i) => {
    const x = center(i), chosen = selected.has(i), unavailable = v.start !== null && i < v.start && !chosen;
    return `<g class="sq491-source ${tone(value)} ${chosen ? "selected" : ""} ${focus === i ? `focus ${rejected ? "rejected" : ""}` : ""} ${unavailable ? "unavailable" : ""}" data-source-index="${i}" data-selected="${chosen}"><title>nums[${i}] = ${esc(value)}</title><text class="sq491-pointer" x="${x}" y="13">${focus === i ? "i ↓" : v.start === i ? "start ↓" : chosen ? "✓" : ""}</text><rect x="${x - 22}" y="28" width="44" height="44" rx="11"/><text class="sq491-number" x="${x}" y="54" ${String(value).length > 3 ? 'textLength="35" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(value)}</text><text class="sq491-index" x="${x}" y="88">[${i}]</text>${focus === i && rejected ? `<path class="sq491-cross" d="M${x - 13} 38L${x + 13} 63M${x + 13} 38L${x - 13} 63"/>` : ""}</g>`;
  }).join("");
  const wires = v.selected.map((index, position) => {
    const [x, y] = pathPoint(position), sx = center(index);
    return `<path class="sq491-wire ${tone(v.nums[index])}" data-selection-wire="${index}" d="M${sx} 75C${sx} 116 ${x} 110 ${x} ${y - 21}"/>`;
  }).join("");
  const pathEdges = pathIndices.slice(1).map((_, index) => {
    const [ax, ay] = pathPoint(index), [bx, by] = pathPoint(index + 1);
    return `<path class="sq491-path-edge ${index + 1 >= v.selected.length ? "preview" : ""}" d="M${ax + 21} ${ay}L${bx - 21} ${by}" marker-end="url(#sq491-arrow)"/>`;
  }).join("");
  const pathNodes = pathIndices.map((index, position) => {
    const [x, y] = pathPoint(position), ghost = position >= v.selected.length;
    return `<g class="sq491-path-node ${tone(v.nums[index])} ${ghost ? "preview" : ""} ${ghost && v.action === "pop" ? "removed" : ""}" data-path-index="${index}" data-preview="${ghost}"><rect x="${x - 21}" y="${y - 21}" width="42" height="42" rx="10"/><text class="sq491-number" x="${x}" y="${y + 5}" ${String(v.nums[index]).length > 3 ? 'textLength="34" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(v.nums[index])}</text><text class="sq491-index" x="${x}" y="${y + 35}">[${index}]</text>${ghost && v.action === "pop" ? `<path class="sq491-cross" d="M${x - 15} ${y + 12}L${x + 15} ${y - 12}"/>` : ""}</g>`;
  }).join("");
  const diagram = `<div class="sq491-diagram-scroll"><svg class="sq491-diagram" style="min-width:${v.nums.length > 5 ? v.nums.length * 57 : 0}px" viewBox="0 0 ${w} 258" role="img" aria-label="${esc(t("Mảng nums và đường chọn current. Nét đứt là số chưa được thêm.", "nums and the selected current path. Dashed pieces have not been appended."))}"><defs><marker id="sq491-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5"/></marker></defs><text class="sq491-label" x="10" y="113">current</text>${wires}${source}${pathEdges}${pathNodes}${pathIndices.length ? "" : `<text class="sq491-empty-text" x="${w / 2}" y="186">${v.current === null ? "—" : "∅"}</text>`}</svg></div>`;

  const duplicate = focus === null ? null : v.gates.duplicate, order = focus === null ? null : v.gates.order;
  const duplicateGate = `<div class="sq491-gate ${duplicate ? duplicate.pass ? "pass" : "fail" : "pending"}" data-gate="duplicate"><header><b>① used</b><strong>${duplicate ? duplicate.pass ? "✓" : "×" : "?"}</strong></header><div>${focus !== null ? chip(v.nums[focus]) : '<span class="sq491-empty">?</span>'}<strong>${duplicate ? duplicate.pass ? "∉" : "∈" : "∈ ?"}</strong><span class="sq491-set">${duplicate ? duplicate.values.length ? duplicate.values.map(value => chip(value)).join("") : "∅" : "{…}"}</span></div><small>${t("Cùng frame", "Same frame")}</small></div>`;
  const orderGate = `<div class="sq491-gate ${order ? order.pass ? "pass" : "fail" : "pending"}" data-gate="order"><header><b>② ≥</b><strong>${order ? order.pass ? "✓" : "×" : "?"}</strong></header><div class="sq491-slope">${order ? order.left === null ? '<span class="sq491-empty">∅</span><strong>→</strong>' + chip(order.right) : chip(order.left) + `<strong>${order.pass ? "≤ ↗" : "> ↘"}</strong>` + chip(order.right) : '<span class="sq491-empty">? → ?</span>'}</div><small>${t("Số cuối → số mới", "Last → next")}</small></div>`;
  let operation;
  if (v.action === "save") operation = `<span>${chain(v.current)}</span><strong>⇢</strong><span class="sq491-save-badge">#${v.resultCount} ✓</span>`;
  else if (v.action === "length") operation = `<span>${chain(v.current)}</span><strong>${v.canSave ? "≥ 2 ✓" : "< 2"}</strong>`;
  else if (v.action === "append") operation = `<strong>＋</strong>${chip(v.nums[v.i])}<strong>↓</strong><code>current</code>`;
  else if (v.action === "pop") operation = `<code>pop()</code>${chip(v.nums[v.removedIndex], "removed")}<strong>↩</strong>`;
  else if (v.action === "used-add") operation = `${chip(v.nums[v.i])}<strong>→</strong><span class="sq491-set">used ✓</span>`;
  else if (["return", "resume", "root-return"].includes(v.action)) operation = `<strong>↩</strong><code>${v.action === "resume" ? `backtrack(${v.returnedStart}) → ${v.start}` : v.action === "return" ? `backtrack(${v.start})` : "backtrack(0)"}</code>`;
  else if (v.action.startsWith("skip")) operation = `${chip(v.nums[v.i], "removed")}<strong>× →</strong><code>continue</code>`;
  else if (v.action === "done") operation = `<strong>✓</strong><b>${v.resultCount}</b><span>${t("dãy khác nhau", "distinct sequences")}</span>`;
  else if (v.action === "used-init") operation = `<code>used</code><strong>← ∅</strong><small>${t("set mới", "new set")}</small>`;
  else operation = `<strong>${["duplicate", "order"].includes(v.action) ? "⚖" : "↓"}</strong><code>${esc(v.action === "define" ? "backtrack(start)" : v.action === "init" ? v.line === 3 ? "result = []" : "current = []" : `nums[${v.i}]`)}</code>`;

  const stack = v.stack.map((f, depth) => `<article class="sq491-frame ${depth === v.stack.length - 1 ? "active" : ""}" data-frame-id="${f.id}"><div class="sq491-frame-heading"><b>${depth === v.stack.length - 1 ? "▶" : "└"} backtrack(${f.start})</b><small>d=${depth}</small></div><div class="sq491-frame-path">${chain(f.indices.map(index => v.nums[index]))}</div><div class="sq491-frame-used"><code>used</code><span class="sq491-set">${f.used === undefined ? "—" : f.used.length ? f.used.map(value => chip(value)).join("") : "∅"}</span></div></article>`).join("") || `<div class="sq491-stack-empty">${v.action === "done" || v.action === "root-return" ? "✓" : "⌁"}<code>backtrack(0)</code></div>`;
  const results = v.results.map((r, index) => `<article class="sq491-result ${v.action === "save" && index === v.results.length - 1 ? "new" : ""}" data-result-number="${r.number}"><small>#${r.number}</small><div>${chain(r.values)}</div></article>`).join("") || '<span class="sq491-empty">∅</span>';
  const summary = t(`Dòng ${v.line}; current ${JSON.stringify(v.current)}; ${v.resultCount} dãy đã lưu`, `Line ${v.line}; current ${JSON.stringify(v.current)}; ${v.resultCount} saved sequences`);
  const host = $("treeView");
  host.innerHTML = `<section class="sq491-viz" role="group" aria-label="${esc(summary)}"><header class="sq491-heading"><b>nums → current → result</b><span>${t("Sau dòng", "After line")} <strong>${v.line}</strong></span></header><div class="sq491-main"><div class="sq491-work">${diagram}<div class="sq491-gates">${duplicateGate}${orderGate}</div><div class="sq491-operation" aria-label="${esc(typeof step.title === "object" ? step.title[lang] || step.title.en : step.title)}">${operation}</div></div><section class="sq491-stack"><header><b>↳ backtrack</b><small>${t("Mỗi frame · 1 used", "1 used per frame")}</small></header><div>${stack}</div></section></div><section class="sq491-results"><header><b>result <strong>${v.resultCount}</strong></b><small>${v.shownFrom ? `+${v.shownFrom} ${t("dãy trước", "earlier")}` : v.action === "done" ? t("Tất cả", "All") : "current[:]"}</small></header><div class="sq491-gallery">${results}</div></section></section>`;
  const stackPane = host.querySelector(".sq491-stack > div");
  if (stackPane) { stackPane.scrollLeft = stackPane.scrollWidth; stackPane.scrollTop = stackPane.scrollHeight; }
  const gallery = host.querySelector(".sq491-gallery");
  if (gallery && v.action === "save") gallery.scrollTop = gallery.scrollHeight;
}
