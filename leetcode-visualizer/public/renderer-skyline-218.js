function renderSkyline218Pictures(step) {
  const v = step.skylineView, vi = lang === "vi", esc = escapeHtml, x = v.sweepX;
  const tone = id => `var(--sk-c${id % 6})`, number = value => Math.abs(value) >= 1e6 ? value.toExponential(1) : String(value);
  const width = 600, height = 220, left = 42, right = 582, top = 22, ground = 184;
  const minX = Math.min(...v.buildings.map(b => b[0])), maxX = Math.max(...v.buildings.map(b => b[1]));
  const maxH = Math.max(...v.buildings.map(b => b[2])), sx = value => left + (value - minX) / (maxX - minX) * (right - left), sy = value => ground - value / maxH * (ground - top);
  const active = new Set(v.activeBuildingIds), root = v.heap[0], focus = ["unpack", "push", "pop", "expire-check"].includes(v.phase) ? v.focusBuildingId : null;
  const ticks = [...new Set([0, Math.round(maxH / 2), maxH])].map(value => `<line class="sk218-grid-line" x1="${left}" y1="${sy(value)}" x2="${right}" y2="${sy(value)}"/><text class="sk218-y-tick" x="${left - 7}" y="${sy(value) + 3}">${number(value)}</text>`).join("");
  const stride = Math.max(1, Math.ceil(v.events.length / 8));
  const xTicks = v.events.filter((value, i) => i % stride === 0 || i === v.events.length - 1 || value === x).map(value => `<text class="sk218-x-tick ${value === x ? "current" : ""}" x="${sx(value)}" y="${ground + 19}"><title>${value}</title>${number(value)}</text>`).join("");
  const buildings = v.buildings.map(([l, r, h], id) => {
    const w = Math.max(.8, sx(r) - sx(l)), winner = root && !root.expired && root.id === id;
    return `<g class="sk218-building ${active.has(id) ? "active" : ""} ${x !== null && r <= x ? "passed" : ""} ${id === focus ? "focus" : ""} ${winner ? "winner" : ""}" style="--sk-tone:${tone(id)}"><title>B${id + 1}: [${l}, ${r}, ${h}]</title><rect x="${sx(l)}" y="${sy(h)}" width="${w}" height="${ground - sy(h)}"/>${w > 28 && (v.buildings.length <= 12 || winner || id === focus) ? `<text x="${sx(l) + w / 2}" y="${Math.max(11, sy(h) - 5)}">B${id + 1}</text>` : ""}</g>`;
  }).join("");
  let skylinePath = "";
  if (v.skyline.length) {
    const first = v.skyline[0]; skylinePath = `M ${sx(first[0])} ${ground} V ${sy(first[1])}`;
    for (const [px, h] of v.skyline.slice(1)) skylinePath += ` H ${sx(px)} V ${sy(h)}`;
    if (x !== null && x >= v.skyline.at(-1)[0]) skylinePath += ` H ${sx(x)}`;
  }
  const points = v.skyline.map(([px, h], i) => `<circle class="sk218-key-point ${v.phase === "append" && i === v.skyline.length - 1 ? "new" : ""}" cx="${sx(px)}" cy="${sy(h)}" r="${v.phase === "append" && i === v.skyline.length - 1 ? 5 : 3}"><title>[${px}, ${h}]</title></circle>`).join("");
  const preview = ["height", "compare"].includes(v.phase) && v.currentHeight !== null ? `<circle class="sk218-preview" cx="${sx(x)}" cy="${sy(v.currentHeight)}" r="5"/>` : "";
  const sweep = x === null ? "" : `<line class="sk218-sweep" x1="${sx(x)}" y1="10" x2="${sx(x)}" y2="${ground + 5}"/><path class="sk218-sweep-head" d="M ${sx(x) - 4} 8 h 8 l -4 6 z"/>`;
  const levels = v.heap.length ? Math.floor(Math.log2(v.heap.length)) + 1 : 1, heapWidth = Math.max(360, 2 ** (levels - 1) * 62), heapHeight = Math.max(85, levels * 46 + 10);
  const nodePoint = index => { const depth = Math.floor(Math.log2(index + 1)); return [(index - (2 ** depth - 1) + .5) / 2 ** depth * heapWidth, depth * 46 + 9]; };
  const heapEdges = v.heap.map((_, i) => {
    if (!i) return "";
    const a = nodePoint(Math.floor((i - 1) / 2)), b = nodePoint(i);
    return `<line class="sk218-heap-edge" x1="${a[0]}" y1="${a[1] + 34}" x2="${b[0]}" y2="${b[1]}"/>`;
  }).join("");
  const heapNodes = v.heap.map((entry, i) => {
    const p = nodePoint(i), label = `B${entry.id + 1}: (-${entry.height}, ${entry.right})${entry.expired ? `; ${entry.right} <= ${x}` : ""}`;
    return `<g class="sk218-heap-node ${i === 0 ? "root" : ""} ${entry.expired ? "expired" : ""} ${v.action?.kind === "push" && v.action.id === entry.id ? "pushed" : ""}" transform="translate(${p[0] - 28},${p[1]})" style="--sk-tone:${tone(entry.id)}"><title>${esc(label)}</title><rect width="56" height="34" rx="6"/><text class="sk218-node-height" x="28" y="14" ${String(entry.height).length > 6 ? 'textLength="45" lengthAdjust="spacingAndGlyphs"' : ""}>H=${entry.height}</text><text class="sk218-node-end" x="28" y="27" ${String(entry.right).length > 6 ? 'textLength="45" lengthAdjust="spacingAndGlyphs"' : ""}>B${entry.id + 1} · R=${entry.right}</text></g>`;
  }).join("");
  const output = v.skyline.map((point, i) => `<li class="${v.phase === "append" && i === v.skyline.length - 1 ? "new" : ""}"><small>${i + 1}</small><code>[${point.join(", ")}]</code></li>`).join("") || `<li class="sk218-empty">${v.locals.answer ? "[ ]" : "—"}</li>`;
  let operation;
  const chip = entry => `<span class="sk218-building-chip" style="--sk-tone:${tone(entry.id)}">B${entry.id + 1}<b>H ${entry.height}</b><small>R ${entry.right}</small></span>`;
  if (v.action) {
    operation = `${chip(v.action)}<b class="${v.action.kind === "pop" ? "no" : "yes"}">${v.action.kind === "pop" ? "→ ✕" : "→ ↓"}</b><code>${v.action.kind === "pop" ? `R ${v.action.right} ≤ x ${x}` : "heapq.heappush"}</code>`;
  } else if (v.phase === "height") {
    operation = `<code>${root ? `−(−${root.height})` : "heap = ∅"}</code><b>→</b><code>height =</code><span class="sk218-number">${v.currentHeight}</span>`;
  } else if (v.phase === "compare" || v.phase === "append") {
    operation = `<span class="sk218-number">${v.previousHeight ?? "∅"}</span><b>→</b><span class="sk218-number">${v.currentHeight}</span><b class="${v.changed ? "yes" : "muted"}">${v.changed ? v.phase === "append" ? "◆" : "◇" : "="}</b><code>${v.changed ? `[${x}, ${v.currentHeight}]` : vi ? "Giữ nguyên" : "Unchanged"}</code>`;
  } else if (v.phase === "unpack") {
    operation = `${chip({ id: v.focusBuildingId, height: v.locals.height, right: v.locals.right })}<code>L ${v.locals.left} → R ${v.locals.right}</code>`;
  } else if (v.phase === "expire-check" || v.phase === "expire-done") {
    operation = `<code>${root ? `R ${root.right} ${v.guard ? "≤" : "&gt;"} x ${x}` : "heap = ∅"}</code><b class="${v.guard ? "no" : "yes"}">${v.guard ? "→ ✕" : "✓"}</b>`;
  } else if (v.phase === "start-check" || v.phase === "start-done") {
    operation = `<code>${v.locals.i < v.buildings.length ? `B${v.locals.i + 1}: L ${v.buildings[v.locals.i][0]} ≤ x ${x}` : `i = ${v.locals.i} / ${v.buildings.length}`}</code><b class="${v.guard ? "yes" : "muted"}">${v.guard ? "→ ↓" : "✕"}</b>`;
  } else if (v.phase === "done") {
    operation = `<b class="yes">✓</b><code>return answer</code><span>${v.skyline.length} ${vi ? "điểm" : "points"}</span>`;
  } else if (v.phase === "sweep" || v.phase === "sweep-done") {
    operation = `<b class="sk218-direction">${v.phase === "sweep-done" ? "✓" : "│ →"}</b><code>x = ${x}</code>`;
  } else if (v.phase === "advance") {
    operation = `<code>i: ${v.locals.i - 1} → ${v.locals.i}</code>`;
  } else if (v.phase === "events") {
    operation = `<code>L ∪ R →</code><code>${v.events.slice(0, 10).join(" · ")}${v.events.length > 10 ? " …" : ""}</code>`;
  } else {
    operation = `<code>${esc(v.source.text.trim())}</code>`;
  }
  const summary = vi ? `Đường quét x ${x ?? "—"}; heap có ${v.heap.length} tòa nhà, skyline có ${v.skyline.length} điểm.` : `Sweep x ${x ?? "—"}; ${v.heap.length} heap entries, ${v.skyline.length} skyline points.`;
  $("treeView").innerHTML = `<section class="sk218-viz" aria-label="${esc(summary)}">
    <div class="sk218-heading"><b>SKYLINE</b><span class="sk218-x">x = ${x ?? "—"}</span><small>${vi ? "Dòng" : "Line"} ${v.source.line} · ${Math.max(0, v.eventIndex + 1)} / ${v.events.length}</small></div>
    <svg class="sk218-city" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(summary)}">${ticks}${buildings}${skylinePath ? `<path class="sk218-outline" d="${skylinePath}"/>` : ""}${sweep}${points}${preview}${xTicks}</svg>
    <div class="sk218-legend"><i class="building"></i>${vi ? "Tòa nhà" : "Buildings"}<i class="outline"></i>skyline<i class="expired"></i>R ≤ x<i class="preview"></i>${vi ? "Chưa ghi" : "Pending"}</div>
    <div class="sk218-details"><section class="sk218-heap"><header><b>HEAP <small>(−H, R)</small></b><span>${v.heap.length}</span></header><div class="sk218-heap-scroll"><svg class="sk218-heap-svg" width="${heapWidth}" height="${heapHeight}" viewBox="0 0 ${heapWidth} ${heapHeight}" role="img" aria-label="heap">${heapEdges}${heapNodes || `<text class="sk218-empty-heap" x="${heapWidth / 2}" y="45">${v.locals.heap ? "∅" : "—"}</text>`}</svg></div></section><section class="sk218-answer"><header><b>answer</b><span>${v.skyline.length}</span></header><ol class="sk218-output">${output}</ol></section></div>
    <div class="sk218-operation">${operation}</div>
  </section>`;
  const heapCanvas = $("treeView").querySelector(".sk218-heap-scroll");
  if (heapCanvas) {
    const index = v.action?.kind === "push" ? v.heap.findIndex(entry => entry.id === v.action.id) : 0;
    const p = nodePoint(Math.max(0, index));
    heapCanvas.scrollLeft = Math.max(0, p[0] - heapCanvas.clientWidth / 2);
    heapCanvas.scrollTop = Math.max(0, p[1] - heapCanvas.clientHeight / 2 + 17);
  }
  const outputCanvas = $("treeView").querySelector(".sk218-output");
  if (outputCanvas) outputCanvas.scrollTop = outputCanvas.scrollHeight;
}
