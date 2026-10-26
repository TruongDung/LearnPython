function renderTopKFrequent347Pictures(step) {
  const v = step.topK347View, vi = lang === "vi", esc = escapeHtml;
  const palette = new Map([...new Set(v.nums)].map((value, i) => [value, i % 6]));
  const tone = value => `var(--tk-c${palette.get(value)})`;
  const kept = new Set(v.heap.map(entry => entry.v)), root = v.heap[0], over = v.heap.length > v.k;
  const removed = v.action?.kind === "pop" ? v.action : null;
  const preview = v.phase === "check" && v.check ? root : null;
  const stream = v.nums.map(num => `<span class="tk347p-input ${v.focusValue === num ? "focus" : ""}" style="--tk-tone:${tone(num)}">${esc(String(num))}</span>`).join("");
  const n = v.frequencies.length, chartWidth = Math.max(320, n * 54 + 48), chartHeight = 160, baseY = 130;
  const maxF = Math.max(1, ...v.frequencies.map(entry => entry.count)), stride = (chartWidth - 48) / Math.max(1, n), unit = 90 / maxF;
  const bars = v.frequencies.map((entry, i) => {
    const cx = 32 + (i + .5) * stride, barWidth = Math.min(44, stride - 12), y = baseY - entry.count * unit;
    const processed = i < v.processedCount && !(v.phase === "select" && entry.value === v.focusValue);
    const status = `${kept.has(entry.value) ? "kept" : processed ? "discarded" : "pending"} ${entry.value === v.focusValue ? "focus" : ""} ${removed?.v === entry.value ? "removed" : ""} ${preview?.v === entry.value ? "preview" : ""}`;
    const bricks = maxF <= 10 ? Array.from({ length: entry.count }, (_, j) => `<rect x="${cx - barWidth / 2}" y="${baseY - (j + 1) * unit + 2}" width="${barWidth}" height="${Math.max(1, unit - 3)}" rx="3"/>`).join("")
      : `<rect x="${cx - barWidth / 2}" y="${y}" width="${barWidth}" height="${entry.count * unit}" rx="4"/>`;
    return `<g class="tk347p-bar ${status}" style="--tk-tone:${tone(entry.value)}"><title>v=${entry.value}, f=${entry.count}</title>${bricks}<text class="tk347p-count" x="${cx}" y="${y - 6}">×${entry.count}</text><text class="tk347p-bar-value" x="${cx}" y="150" ${String(entry.value).length > 6 ? 'textLength="46" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(String(entry.value))}</text>${removed?.v === entry.value || preview?.v === entry.value ? `<text class="tk347p-drop-mark" x="${cx + barWidth / 2 + 5}" y="${y + 9}">${removed?.v === entry.value ? "×" : "?"}</text>` : ""}</g>`;
  }).join("");
  const levels = v.heap.length ? Math.floor(Math.log2(v.heap.length)) + 1 : 1, heapWidth = Math.max(300, 2 ** (levels - 1) * 58), heapHeight = Math.max(90, levels * 43 + 10);
  const point = i => { const depth = Math.floor(Math.log2(i + 1)); return [(i - (2 ** depth - 1) + .5) / 2 ** depth * heapWidth, depth * 43 + 9]; };
  const edges = v.heap.map((_, i) => {
    if (!i) return "";
    const from = point(Math.floor((i - 1) / 2)), to = point(i);
    return `<line class="tk347p-edge" x1="${from[0]}" y1="${from[1] + 33}" x2="${to[0]}" y2="${to[1]}"/>`;
  }).join("");
  const nodes = v.heap.map((entry, i) => {
    const p = point(i);
    return `<g class="tk347p-node ${i === 0 ? "root" : ""} ${v.action?.kind === "push" && entry.id === v.action.id ? "pushed" : ""} ${preview?.id === entry.id ? "preview" : ""}" transform="translate(${p[0] - 24},${p[1]})" style="--tk-tone:${tone(entry.v)}"><title>heap[${i}] = (${entry.f}, ${entry.v})</title><rect width="48" height="33" rx="6"/><text class="tk347p-node-value" x="24" y="15" ${String(entry.v).length > 5 ? 'textLength="40" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(String(entry.v))}</text><text class="tk347p-node-count" x="24" y="27">×${entry.f}</text></g>`;
  }).join("");
  const output = v.heap.map(entry => `<span class="tk347p-kept-token" style="--tk-tone:${tone(entry.v)}"><b>${esc(String(entry.v))}</b><small>×${entry.f}</small></span>`).join("") || `<span class="tk347p-empty">${v.heapReady ? "[ ]" : "—"}</span>`;
  const chip = entry => `<span class="tk347p-entry" style="--tk-tone:${tone(entry.v)}"><b>${esc(String(entry.v))}</b><small>×${entry.f}</small></span>`;
  let operation;
  if (v.action) {
    operation = v.action.kind === "push" ? `${chip(v.action)}<b class="yes">↓</b><code>heappush (${v.action.f}, ${v.action.v})</code>`
      : `${chip(v.action)}<b class="no">→ ×</b><code>heappop (${v.action.f}, ${v.action.v})</code>`;
  } else if (v.phase === "check") {
    operation = `<code>len(heap) ${v.heap.length} &gt; k ${v.k}</code><span class="tk347p-condition">${v.check ? "True" : "False"}</span>${v.check ? '<b class="no">→ ?</b>' : ""}`;
  } else if (v.phase === "select") {
    operation = `${chip({ v: v.focusValue, f: v.locals.f })}<code>v = ${v.focusValue} · f = ${v.locals.f}</code>`;
  } else if (v.phase === "count") {
    operation = `<code>nums</code><b>→</b><code>freq</code><span>${v.frequencies.length} ${vi ? "giá trị" : "values"}</span>`;
  } else if (v.phase === "done") {
    operation = `<b class="yes">✓</b><code>heap → answer</code><span>${v.k} ${vi ? "giá trị" : "values"}</span>`;
  } else {
    operation = `<code>${esc(v.source.text.trim())}</code>`;
  }
  const summary = vi ? `Top ${v.k}; heap đang giữ ${v.heap.length} giá trị; đã xét ${v.processedCount}/${n}.` : `Top ${v.k}; ${v.heap.length} values retained; ${v.processedCount}/${n} processed.`;
  $("treeView").innerHTML = `<section class="tk347p-viz" aria-label="${esc(summary)}">
    <div class="tk347p-heading"><b>TOP K · k = ${v.k}</b><small>${vi ? "Dòng" : "Line"} ${v.source.line}</small></div>
    <div class="tk347p-stream" aria-label="nums">${stream}</div>
    <div class="tk347p-frequency-heading"><b>freq</b><small>${v.counterReady ? `${v.processedCount} / ${n}` : "?"}</small></div>
    <div class="tk347p-chart-scroll"><svg class="tk347p-chart" width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="freq"><line class="tk347p-axis" x1="24" y1="132" x2="${chartWidth - 8}" y2="132"/>${bars || `<text class="tk347p-empty-chart" x="${chartWidth / 2}" y="80">Counter(nums) → ?</text>`}</svg></div>
    <div class="tk347p-legend"><i class="kept"></i>${vi ? "Đang giữ" : "Retained"}<i class="discarded"></i>${vi ? "Đã bỏ" : "Discarded"}<i class="focus"></i>${vi ? "Đang xét" : "Current"}</div>
    <div class="tk347p-details"><section class="tk347p-heap"><header><b>MIN-HEAP <small>(f, v)</small></b><span class="${over ? "no" : ""}">${v.heapReady ? v.heap.length : "—"} / ${v.k}</span></header><div class="tk347p-capacity ${over ? "over" : ""}"><i style="width:${Math.min(100, v.heap.length / v.k * 100)}%"></i>${over ? "<b>+1</b>" : ""}</div><div class="tk347p-tree-scroll"><svg class="tk347p-tree" width="${heapWidth}" height="${heapHeight}" viewBox="0 0 ${heapWidth} ${heapHeight}" role="img" aria-label="heap">${edges}${nodes || `<text class="tk347p-empty-tree" x="${heapWidth / 2}" y="45">${v.heapReady ? "∅" : "—"}</text>`}</svg></div></section><section class="tk347p-result"><header><b>${v.phase === "done" ? "answer" : vi ? "ĐANG GIỮ" : "RETAINED"}</b><span>${v.heap.length}</span></header><div class="tk347p-kept">${output}</div></section></div>
    <div class="tk347p-operation">${operation}</div>
  </section>`;
  const heapCanvas = $("treeView").querySelector(".tk347p-tree-scroll");
  if (heapCanvas) {
    const i = v.action?.kind === "push" ? Math.max(0, v.heap.findIndex(entry => entry.id === v.action.id)) : 0, p = point(i);
    heapCanvas.scrollLeft = Math.max(0, p[0] - heapCanvas.clientWidth / 2);
    heapCanvas.scrollTop = Math.max(0, p[1] + 16 - heapCanvas.clientHeight / 2);
  }
  const chartCanvas = $("treeView").querySelector(".tk347p-chart-scroll");
  if (chartCanvas && (v.focusValue !== null || root)) {
    const i = v.frequencies.findIndex(entry => entry.value === (v.focusValue ?? root.v));
    chartCanvas.scrollLeft = Math.max(0, 32 + (i + .5) * stride - chartCanvas.clientWidth / 2);
  }
  const streamCanvas = $("treeView").querySelector(".tk347p-stream"), focusedToken = $("treeView").querySelector(".tk347p-input.focus");
  if (streamCanvas && focusedToken) streamCanvas.scrollTop = Math.max(0, focusedToken.offsetTop - streamCanvas.clientHeight / 2);
}
