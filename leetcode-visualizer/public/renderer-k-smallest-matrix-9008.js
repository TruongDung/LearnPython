function merge9008Token(value, r, c, extra = "") {
  return `<span class="km8-token ${extra}" style="--km8-tone:var(--km8-c${r % 6})"><b>${escapeHtml(String(value))}</b><small>(${r},${c})</small></span>`;
}

function merge9008Heap(v) {
  if (!v.heapReady) return `<div class="km8-seeds">${v.heap.map(e => merge9008Token(...e)).join("")}</div><div class="km8-hint">↓ heapify</div>`;
  if (!v.heap.length) return '<div class="km8-empty">∅</div>';
  const levels = Math.floor(Math.log2(v.heap.length)) + 1, width = Math.max(240, 2 ** (levels - 1) * 74), height = levels * 61 + 15;
  const point = i => { const depth = Math.floor(Math.log2(i + 1)); return [(i - 2 ** depth + 1.5) * width / 2 ** depth, 8 + depth * 61]; };
  const edges = v.heap.map((_, i) => {
    if (!i) return "";
    const [x, y] = point(i), [px, py] = point(Math.floor((i - 1) / 2));
    return `<line x1="${px}" y1="${py + 42}" x2="${x}" y2="${y}"/>`;
  }).join("");
  const nodes = v.heap.map(([value, r, c], i) => {
    const [x, y] = point(i), pushed = v.action?.kind === "push" && v.action.r === r && v.action.c === c;
    return `<g class="km8-node ${i === 0 ? "root" : ""} ${pushed ? "active" : ""}" data-heap-index="${i}" transform="translate(${x - 33},${y})" style="--km8-tone:var(--km8-c${r % 6})"><title>heap[${i}] = (${value}, ${r}, ${c})</title><rect width="66" height="42" rx="9"/><text x="33" y="18" ${String(value).length > 7 ? 'textLength="56" lengthAdjust="spacingAndGlyphs"' : ""}>${value}</text><text class="km8-coord" x="33" y="33">(${r},${c})${i === 0 ? " ★" : ""}</text></g>`;
  }).join("");
  return `<div class="km8-heap-scroll"><svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${lang === "vi" ? "Cây min-heap: giá trị và tọa độ" : "Min-heap tree: values and coordinates"}">${edges}${nodes}</svg></div>`;
}

function merge9008Action(v) {
  const word = (vi, en) => lang === "vi" ? vi : en, a = v.action;
  if (a?.kind === "pop") return `<b>heap[0]</b><strong>→</strong>${merge9008Token(a.value, a.r, a.c, "active")}<small>${word("vừa lấy ra", "popped")}</small>`;
  if (a?.kind === "append") return `${merge9008Token(a.value, a.r, a.c, "active")}<strong>→</strong><b>answer[${v.answer.length - 1}]</b><strong>✓</strong>`;
  if (a?.kind === "check") return `<b>(${v.r},${v.c})</b><strong>→</strong>${a.pass ? merge9008Token(v.matrix[a.r][a.c], a.r, a.c, "next") : `<strong>×</strong><small>${word("hết hàng", "row exhausted")}</small>`}<small>${a.pass ? "c + 1 ✓" : ""}</small>`;
  if (a?.kind === "push") return `${merge9008Token(a.value, a.r, a.c, "active")}<strong>→</strong><b>heap</b><strong>↓</strong>`;
  if (v.final || v.phase === "stop") return `<strong class="km8-success">✓ ${v.answer.length} / ${v.k}</strong><b>${word("số nhỏ nhất", "smallest numbers")}</b>`;
  if (v.phase === "seed" || v.phase === "heapify") return `<b>matrix[r][0]</b><strong>→</strong><b>${v.heapReady ? "MIN-HEAP ★" : "list"}</b>`;
  if (v.phase === "initialize") return '<b>answer</b><strong>← [ ]</strong>';
  return `<b>heap[0]</b><strong>→ ?</strong><small>${word("lượt", "round")} ${v.iteration + 1} / ${v.k}</small>`;
}

function renderMatrixMerge9008(step) {
  const v = step.matrixMerge9008View, host = $("treeView"), word = (vi, en) => lang === "vi" ? vi : en;
  const queued = new Set(v.heap.map(e => `${e[1]},${e[2]}`)), taken = new Set(v.taken.map(e => `${e.r},${e.c}`));
  const rows = v.matrix.map((row, r) => `<div class="km8-row" style="--km8-tone:var(--km8-c${r % 6})"><b class="km8-row-label">r=${r}<span>→</span></b><div class="km8-row-cells">${row.map((value, c) => {
    const key = `${r},${c}`, action = v.action, active = action && action.r === r && action.c === c;
    return `<span class="km8-cell ${queued.has(key) ? "queued" : ""} ${taken.has(key) ? "taken" : ""} ${active ? "active" : ""}" data-cell="${key}" title="matrix[${r}][${c}] = ${value}"><small>${queued.has(key) ? "↓" : taken.has(key) ? "✓" : "·"}</small><b>${value}</b><em>c=${c}</em></span>`;
  }).join("")}<span class="km8-row-end">│</span></div></div>`).join("");
  const result = Array.from({ length: v.k }, (_, i) => {
    const entry = v.taken[i];
    return entry ? `<span class="km8-result ${v.phase === "append" && i === v.taken.length - 1 ? "active" : ""}" style="--km8-tone:var(--km8-c${entry.r % 6})" data-result-cell="${entry.r},${entry.c}"><small>#${i + 1}</small><b>${entry.value}</b><em>(${entry.r},${entry.c})</em></span>` : `<span class="km8-result empty"><small>#${i + 1}</small><b>·</b><em>—</em></span>`;
  }).join("");
  host.innerHTML = `<section class="km8-viz" aria-label="#9008 ${word("Trộn các hàng tăng dần", "Merge sorted rows")}">
    <header class="km8-heading"><b>#9008 · MATRIX → HEAP → ANSWER</b><small>${word("Dòng", "Line")} ${v.line}</small></header>
    <div class="km8-work"><section class="km8-panel"><header><b>matrix</b><small>${word("mỗi hàng tăng dần", "each row sorted")} →</small></header><div class="km8-matrix-scroll">${rows}</div><div class="km8-legend"><span>↓ ${word("trong heap", "in heap")}</span><span>✓ ${word("đã thêm", "appended")}</span><span>(${word("hàng,cột", "row,col")})</span></div></section>
    <section class="km8-panel"><header><b>${v.heapReady ? "MIN-HEAP" : "list → heap"}</b><small>${v.heap.length} / ${v.matrix.length} · (value,r,c)</small></header>${merge9008Heap(v)}<div class="km8-hint">${v.heapReady && v.heap.length ? `★ ${word("nhỏ nhất", "minimum")} · ${word("hòa: hàng → cột", "ties: row → col")}` : ""}</div></section></div>
    <div class="km8-action" aria-label="${word("Thao tác hiện tại", "Current operation")}">${merge9008Action(v)}</div>
    <section class="km8-panel km8-output"><header><b>answer ${v.final ? "✓" : ""}</b><small>${v.answerReady ? v.answer.length : "—"} / ${v.k}</small></header><div class="km8-results">${v.answerReady ? result : '<span class="km8-empty">—</span>'}</div><div class="km8-progress"><i style="width:${100 * v.answer.length / v.k}%"></i></div></section>
  </section>`;
  for (const selector of [".km8-matrix-scroll", ".km8-heap-scroll", ".km8-results"]) {
    const container = host.querySelector(selector), active = container?.querySelector(".active");
    if (!active) continue;
    const rect = active.getBoundingClientRect(), box = container.getBoundingClientRect();
    container.scrollLeft = Math.max(0, rect.x - box.x + container.scrollLeft - container.clientWidth / 2 + rect.width / 2);
    container.scrollTop = Math.max(0, rect.y - box.y + container.scrollTop - container.clientHeight / 2 + rect.height / 2);
  }
}
