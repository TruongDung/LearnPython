function studyHeapPicture(entries, labels, { selected = [], stale = [], ranges = null } = {}) {
  const esc = escapeHtml, levels = Math.floor(Math.log2(Math.max(1, entries.length))) + 1;
  const width = Math.max(300, 2 ** (levels - 1) * 76), height = levels * 54 + 12;
  const point = i => { const d = Math.floor(Math.log2(i + 1)); return [(i - 2 ** d + 1.5) * width / 2 ** d, d * 54 + 5]; };
  const nodes = entries.map((entry, i) => {
    if (ranges && !ranges[i]) return "";
    const [x, y] = point(i), text = labels(entry, i), active = selected.includes(i), expired = stale.includes(i);
    const edge = i && (!ranges || ranges[Math.floor((i - 1) / 2)]) ? (() => { const p = point(Math.floor((i - 1) / 2)); return `<line x1="${p[0]}" y1="${p[1] + 38}" x2="${x}" y2="${y}"/>`; })() : "";
    return `${edge}<g data-heap-index="${i}" class="study-node ${active ? "focus" : ""} ${expired ? "stale" : ""}" transform="translate(${x - 34},${y})"><title>${esc(JSON.stringify(entry))}</title><rect width="68" height="38" rx="8"/><text x="34" y="16" ${String(text[0]).length > 8 ? 'textLength="59" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(String(text[0]))}</text><text class="study-node-sub" x="34" y="30" ${String(text[1]).length > 12 ? 'textLength="59" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(String(text[1]))}</text></g>`;
  }).join("");
  return `<div class="study-tree-scroll"><svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${ranges ? "segment tree" : "min heap"}">${nodes || `<text class="study-empty-svg" x="${width / 2}" y="40">∅</text>`}</svg></div>`;
}

function study378Picture(v) {
  const n = v.matrix.length, taken = new Set(v.taken.map(e => `${e.r},${e.c}`)), queued = new Set(v.heap.map(e => `${e[1]},${e[2]}`)), a = v.action;
  const cells = v.matrix.flatMap((row, r) => row.map((val, c) => {
    const key = `${r},${c}`, focus = a && a.r === r && a.c === c;
    return `<div class="study-matrix-cell ${taken.has(key) ? "done" : ""} ${queued.has(key) ? "queued" : ""} ${focus ? "focus" : ""}" style="--study-tone:var(--study-c${r % 6})"><b>${val}</b><small>${r},${c}</small>${queued.has(key) ? '<i>↓</i>' : taken.has(key) ? '<i>✓</i>' : ""}</div>`;
  })).join("");
  const stream = v.taken.map((entry, i) => `<span class="study-token ${i === v.k - 1 ? "winner" : ""}" style="--study-tone:var(--study-c${entry.r % 6})"><small>#${i + 1}</small><b>${entry.val}</b></span>`).join("");
  const action = a?.kind === "push" ? `<b class="study-token">${a.val}<small>(${a.r},${a.c})</small></b><strong>→ ↓</strong><b>heap</b>`
    : a?.kind === "pop" ? `<b>heap</b><strong>→</strong><b class="study-token">${a.val}</b><strong>→ #${v.taken.length}</strong>`
    : a?.kind === "check" ? `<b>(${a.r},${a.c})</b><strong>→</strong><b>${a.pass ? v.matrix[a.r][a.c + 1] : "×"}</b>` : `<b>${v.taken.length} / ${v.k}</b><span>→</span><strong>${v.taken.length === v.k ? v.taken.at(-1).val : "?"}</strong>`;
  return `<div class="study-pair"><section class="study-panel"><header>matrix <small>→</small></header><div class="study-grid-scroll"><div class="study-matrix" style="--study-cols:${n}">${cells}</div></div></section><section class="study-panel"><header>MIN-HEAP <small>(val, r, c)</small></header>${v.heapReady ? studyHeapPicture(v.heap, e => [e[0], `(${e[1]},${e[2]})`], { selected: a?.kind === "push" ? [v.heap.findIndex(e => e[1] === a.r && e[2] === a.c)] : [0] }) : '<div class="study-empty">—</div>'}</section></div><div class="study-action">${action}</div><section class="study-panel"><header>${lang === "vi" ? "Đã lấy" : "Popped"}<small>${v.taken.length} / ${v.k}</small></header><div class="study-stream">${stream || "∅"}</div><div class="study-progress"><i style="width:${100 * v.taken.length / v.k}%"></i></div></section>`;
}

function study977Picture(v) {
  const esc = escapeHtml, max = Math.max(1, ...v.nums.map(Math.abs)), used = new Set(v.used), a = v.action;
  const nums = v.nums.map((value, i) => `<span class="study-number ${used.has(i) ? "used" : ""} ${v.choice === i ? "focus" : ""}" style="--study-tone:var(--study-c${value < 0 ? 0 : 3})"><small>${i === v.left ? "L →" : ""} ${i === v.right ? "← R" : ""}</small><div class="study-magnitude"><i style="height:${Math.abs(value) / max * 55}px"></i></div><b>${value}</b><em>[${i}]</em></span>`).join("");
  const result = v.result.map((value, i) => `<span class="study-token ${v.written[i] ? "done" : ""} ${i === v.pos ? "focus" : ""}"><small>${i === v.pos ? "↓ pos" : `[${i}]`}</small><b>${v.written[i] ? value : "·"}</b></span>`).join("");
  const compare = a?.kind === "compare" ? `<div class="study-compare"><b>|${v.nums[v.left]}| = ${a.a}</b><i style="width:${Math.max(2, a.a / max * 90)}px"></i><strong>${a.fromLeft ? ">" : "≤"}</strong><i style="width:${Math.max(2, a.b / max * 90)}px"></i><b>|${v.nums[v.right]}| = ${a.b}</b></div>`
    : a?.kind === "write" ? `<b class="study-token">${a.value}</b><strong>² →</strong><b class="study-token winner">${a.square}</b><span>→ result[${a.to}]</span>`
    : `<strong>${esc(v.phase)}</strong>`;
  return `<section class="study-panel"><header>nums <small>|x| ↑</small></header><div class="study-number-scroll">${nums}</div></section><div class="study-action">${compare}</div><section class="study-panel"><header>result <small>← ${lang === "vi" ? "điền từ cuối" : "fill from the end"}</small></header><div class="study-stream study-result">${result || "—"}</div></section>`;
}

function study3619Picture(v) {
  const n = v.grid[0].length, tile = 42, w = n * tile, h = v.grid.length * tile, esc = escapeHtml;
  const queued = new Set(v.queue.map(cell => cell.join(","))), a = v.action;
  const cells = v.grid.flatMap((row, r) => row.map((value, c) => {
    const key = `${r},${c}`, owner = v.owners[key], record = v.islands[owner], here = v.current?.[0] === r && v.current[1] === c;
    const near = a?.cell?.[0] === r && a.cell[1] === c;
    return `<g class="study-island-cell ${value ? "land" : "water"} ${queued.has(key) ? "queued" : ""} ${here ? "focus" : ""} ${near ? "neighbor" : ""} ${record?.complete ? record.accepted ? "accepted" : "rejected" : ""}" transform="translate(${c * tile},${r * tile})" style="--study-tone:var(--study-c${(owner ?? 0) % 6})"><title>(${r},${c}) = ${value}</title><rect x="2" y="2" width="38" height="38" rx="9"/><text x="21" y="25">${value || "≋"}</text>${owner === undefined ? "" : `<text class="study-cell-id" x="31" y="12">${owner + 1}</text>`}</g>`;
  })).join("");
  const arrow = a?.cell && v.current && a.cell[0] >= 0 && a.cell[0] < v.grid.length && a.cell[1] >= 0 && a.cell[1] < n ? `<line class="study-grid-arrow" x1="${(v.current[1] + .5) * tile}" y1="${(v.current[0] + .5) * tile}" x2="${(a.cell[1] + .5) * tile}" y2="${(a.cell[0] + .5) * tile}"/>` : "";
  const queue = v.queue.map((cell, i) => `<b class="study-token ${!i ? "focus" : ""}"><small>${i ? "" : "→"}</small>${cell.join(",")}</b>`).join("");
  const records = v.islands.map((record, i) => `<article class="study-island-record ${record.complete ? record.accepted ? "accepted" : "rejected" : ""}"><small>#${i + 1}</small><div class="study-island-mini">${record.cells.map(cell => `<i style="grid-row:${cell[0] + 1};grid-column:${cell[1] + 1};--study-tone:var(--study-c${i % 6})"></i>`).join("")}</div><b>Σ ${record.total}</b><strong>${record.complete ? record.accepted ? "✓" : "×" : "…"}</strong></article>`).join("");
  const total = v.total ?? 0, remainder = total % v.k;
  const action = a?.kind === "add" ? `<strong>+ ${a.value}</strong>`
    : a?.kind === "test" ? `<b>Σ % k = ${remainder}</b><strong>${a.pass ? "✓" : "×"}</strong>`
    : a?.kind === "accept" ? `<strong>✓ → ${v.answer}</strong>`
    : a?.kind === "neighbor" && a.pass !== undefined ? `<b>(${a.cell.join(",")})</b><strong>${a.pass ? "✓" : "×"}</strong>`
    : a?.kind === "skip" ? `<b>↷</b><strong>${a.pass ? "True" : "False"}</strong>` : `<strong>${esc(v.phase)}</strong>`;
  return `<div class="study-pair"><section class="study-panel"><header>grid <small>↓ ↑ → ←</small></header><div class="study-grid-scroll"><svg class="study-island-grid" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="islands">${cells}${arrow}</svg></div></section><section class="study-panel"><header>Σ <small>#${v.island >= 0 ? v.island + 1 : "—"}</small></header><div class="study-sum"><strong>${v.total ?? "—"}</strong><span>÷ ${v.k}</span><b class="${remainder ? "" : "study-good"}">r = ${v.total === undefined ? "—" : remainder}</b></div><div class="study-progress"><i style="width:${v.total === undefined ? 0 : 100 * remainder / v.k}%"></i></div><div class="study-action">${action}</div><header>queue <small>FIFO →</small></header><div class="study-stream">${queue || "∅"}</div></section></div><div class="study-island-records">${records || '<span class="study-empty">∅</span>'}</div><div class="study-score">✓ <strong>${v.answer}</strong></div>`;
}

function study2353Picture(v) {
  const esc = escapeHtml, cuisines = [...new Set(v.cuisines)], a = v.action, active = v.local.cuisine, max = Math.max(1, ...Object.values(v.food).map(e => e[0]));
  const cards = cuisines.map((cuisine, i) => `<section class="study-cuisine ${active === cuisine ? "focus" : ""}" style="--study-tone:var(--study-c${i % 6})"><header>🍽 ${esc(cuisine)}</header>${v.foods.filter(name => v.food[name]?.[1] === cuisine).map(name => `<div class="study-food ${v.local.food === name || a?.kind === "return" && a.food === name ? "focus" : ""}"><b>${esc(name)}</b><span>★ ${v.food[name][0]}</span><i style="width:${100 * v.food[name][0] / max}%"></i></div>`).join("") || '<span class="study-empty">∅</span>'}</section>`).join("");
  const heap = v.heaps[active] || [], stale = heap.map((e, i) => -e[0] !== v.food[e[1]][0] ? i : -1).filter(i => i >= 0);
  const rail = v.operations.map((op, i) => `<span class="study-op ${i === v.activeIndex ? "focus" : i > v.activeIndex ? "future" : ""}" title="${esc(`${op.name}(${op.args.join(", ")})`)}"><small>${i + 1}</small>${op.name === "highestRated" ? `★ ${esc(op.args[0])}` : `${esc(op.args[0])} ↻ ${op.args[1]}`}</span>`).join("");
  const action = a?.kind === "change" ? `<b>${esc(a.food)}</b><b class="study-token">${a.from}</b><strong>→</strong><b class="study-token winner">${a.to}</b>`
    : a?.kind === "remove" ? `<b class="study-token study-stale">${esc(a.entry[1])} · ${-a.entry[0]}</b><strong>×</strong>`
    : a?.kind === "push" ? `<b class="study-token">(${a.entry[0]}, ${esc(a.entry[1])})</b><strong>→ heap</strong>`
    : a?.kind === "return" ? `<strong>★</strong><b class="study-token winner">${esc(a.food)}</b>`
    : a?.kind === "check" ? `<b class="study-token">★ ${-heap[0][0]}<small>heap[0]</small></b><strong>${a.pass ? "≠" : "="}</strong><b class="study-token">★ ${v.food[heap[0][1]][0]}<small>${esc(heap[0][1])}</small></b><span>${a.pass ? "stale ×" : "✓"}</span>` : `<b>${esc(v.phase)}</b>`;
  const history = v.history.map(record => `<span class="study-token"><small>${esc(record.cuisine)}</small><b>${esc(record.food)}</b><small>★ ${record.rating}</small></span>`).join("");
  return `<div class="study-ops">${rail || "FoodRatings()"}</div><div class="study-cuisines">${cards}</div><div class="study-action">${action}</div><section class="study-panel"><header>MIN-HEAP · ${esc(active ?? "—")}<small>−rating · a → z</small></header>${studyHeapPicture(heap, e => [e[1], `−rating = ${e[0]}`], { selected: a?.kind === "push" ? [heap.findLastIndex(e => e[0] === a.entry[0] && e[1] === a.entry[1])] : [0], stale })}<div class="study-legend"><i class="study-stale">×</i> ${lang === "vi" ? "bản cũ" : "stale"}</div></section><div class="study-stream">${history || "—"}</div>`;
}

function study2407Picture(v) {
  const esc = escapeHtml, nums = v.nums, current = v.currentIndex, chain = new Set(v.chain), max = Math.max(1, ...v.dp.filter(Number.isFinite));
  const sequence = nums.map((x, i) => `<span class="study-lis-column ${i === current ? "focus" : ""} ${i === v.predecessorIndex || chain.has(i) ? "winner" : ""}"><small>${v.dp[i] ?? "·"}</small><i style="height:${(v.dp[i] ?? 0) / max * 70}px"></i><b>${x}</b><em>[${i}]</em></span>`).join("");
  const leaves = v.values.map((x, i) => `<span class="study-token ${v.leftCoord !== null && i >= v.leftCoord && i <= v.rightCoord ? "queued" : ""} ${x === v.currentValue ? "focus" : ""}"><small>${x}</small><b>${v.tree[v.size + i - 1]}</b></span>`).join("");
  const selected = (v.operation === "update" ? v.updatePath : v.queryNodes).map(i => i - 1);
  const range = v.coverage;
  const tree = studyHeapPicture(v.tree, (entry, i) => {
    const bounds = range[i]; return [entry, bounds ? `${v.values[bounds[0]]}…${v.values[bounds[1]]}` : "—"];
  }, { selected, ranges: range });
  const action = v.operation === "done" ? v.chain.map((i, p) => `${p ? '<strong>→</strong>' : ""}<b class="study-token winner">${nums[i]}</b>`).join("")
    : `<b class="study-token">${v.predecessorIndex >= 0 ? nums[v.predecessorIndex] : "∅"}</b><strong>→</strong><b class="study-token focus">${v.currentValue ?? "?"}</b>${v.predecessorIndex >= 0 ? `<small>+${v.currentValue - nums[v.predecessorIndex]} ≤ ${v.k}</small>` : ""}<span> · </span><b>${v.queryLength ?? "?"} + 1 = ${current >= 0 ? v.dp[current] ?? "?" : "?"}</b>`;
  return `<section class="study-panel"><header>nums → dp <small>k = ${v.k}</small></header><div class="study-lis-scroll">${sequence}</div></section><div class="study-action">${action}</div><section class="study-panel"><header>[ x−k, x−1 ] <small>${v.leftValue === null ? "—" : `[${v.leftValue}, ${v.rightValue}]`}</small></header><div class="study-stream">${leaves}</div></section><section class="study-panel"><header>SEGMENT TREE <small>${esc(v.operation)} · MAX</small></header>${tree}</section><div class="study-score">★ <strong>${v.answer}</strong></div>`;
}

function renderPictureStudy(step) {
  const v = step.pictureStudyView, host = $("treeView"), esc = escapeHtml;
  const names = { 378: "MATRIX → HEAP", 3619: "ISLANDS · BFS", 2407: "LIS II", 977: "SORTED SQUARES", 2353: "FOOD RATINGS" };
  const render = { 378: study378Picture, 3619: study3619Picture, 2407: study2407Picture, 977: study977Picture, 2353: study2353Picture }[v.id];
  host.innerHTML = `<section class="study-viz" data-study-id="${v.id}" aria-label="#${v.id} ${esc(names[v.id])}"><header class="study-heading"><b>#${v.id} · ${names[v.id]}</b><small>${lang === "vi" ? "Dòng" : "Line"} ${v.line}</small></header>${render(v)}</section>`;
  for (const tree of host.querySelectorAll(".study-tree-scroll")) {
    const target = tree.querySelector(".study-node.focus") || tree.querySelector(".study-node");
    if (target) { const rect = target.getBoundingClientRect(), box = tree.getBoundingClientRect(); tree.scrollLeft = Math.max(0, rect.x - box.x + tree.scrollLeft - tree.clientWidth / 2 + rect.width / 2); tree.scrollTop = Math.max(0, rect.y - box.y + tree.scrollTop - tree.clientHeight / 2 + rect.height / 2); }
  }
  for (const container of host.querySelectorAll(".study-number-scroll, .study-lis-scroll, .study-result")) {
    const target = container.querySelector(".focus"); if (target) container.scrollLeft = Math.max(0, target.offsetLeft - container.clientWidth / 2);
  }
  const ops = host.querySelector(".study-ops"), active = ops?.querySelector(".focus");
  if (active) { ops.scrollLeft = Math.max(0, active.offsetLeft - ops.clientWidth / 2 + active.clientWidth / 2); }
}
