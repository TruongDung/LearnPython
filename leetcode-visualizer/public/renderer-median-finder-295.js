"use strict";

function renderMedianFinder295View(step) {
  const v = step.medianFinder295View, vi = lang === "vi", esc = escapeHtml;
  const a = v.heaps.after.lower, b = v.heaps.after.upper, movement = v.movement;
  const moving = movement.kind === "transfer", currentId = `input-${v.input.operationIndex}`;
  const entries = [...a.entries.map(entry => ({ ...entry, role: "lower" })), ...b.entries.map(entry => ({ ...entry, role: "upper" }))];
  const roles = new Map(entries.map(entry => [entry.id, entry.role]));
  const returned = v.median.returned, medianIds = new Set();
  const ordered = [...entries].sort((left, right) => left.value - right.value || left.inputIndex - right.inputIndex);
  if (returned) {
    const middle = Math.floor(ordered.length / 2);
    medianIds.add(ordered[middle].id);
    if (ordered.length % 2 === 0) medianIds.add(ordered[middle - 1].id);
  }
  const token = (value, role, extra = "") => `<span class="mf295p-token ${role} ${extra}">${esc(String(value))}</span>`;
  const stream = v.input.values.map((num, i) => `<span class="mf295p-input ${roles.get(`input-${i}`) || "future"} ${i === v.input.operationIndex ? "current" : ""}"><small>${i + 1}</small><b>${esc(String(num))}</b></span>`).join("");
  function heapPicture(heap) {
    const lower = heap.role === "lower", levels = heap.size ? Math.floor(Math.log2(heap.size)) + 1 : 1;
    const width = Math.max(230, 2 ** (levels - 1) * 48), height = Math.max(95, levels * 40 + 12);
    const point = i => { const depth = Math.floor(Math.log2(i + 1)); return [(i - (2 ** depth - 1) + .5) / 2 ** depth * width, depth * 40 + 9]; };
    const edges = heap.entries.map((_, i) => {
      if (!i) return "";
      const from = point(Math.floor((i - 1) / 2)), to = point(i);
      return `<line class="mf295p-edge" x1="${from[0]}" y1="${from[1] + 30}" x2="${to[0]}" y2="${to[1]}"/>`;
    }).join("");
    const nodes = heap.entries.map((entry, i) => {
      const p = point(i), transferred = moving && entry.id === movement.occurrence.id;
      const pushed = v.event === "push-small" && entry.id === currentId;
      return `<g class="mf295p-node ${i === 0 ? "root" : ""} ${transferred || pushed ? "moved" : ""} ${returned && i === 0 && (lower || v.median.kind === "even") ? "median" : ""}" transform="translate(${p[0] - 20},${p[1]})"><title>#${entry.inputIndex + 1}: value ${entry.value}; heap[${i}] = ${entry.storageValue}</title><rect width="40" height="30" rx="7"/><text class="mf295p-value" x="20" y="15" ${String(entry.value).length > 4 ? 'textLength="33" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(String(entry.value))}</text><text class="mf295p-id" x="20" y="25">#${entry.inputIndex + 1}</text></g>`;
    }).join("");
    return `<section class="mf295p-heap ${heap.role}" data-role="${heap.role}"><header><b>${lower ? "small · MAX" : "large · MIN"}</b><span>${heap.initialized ? heap.size : "—"}</span></header><small>${lower ? vi ? "Giá trị hiển thị · heapq lưu số đối" : "Values shown · heapq stores negatives" : vi ? "Giá trị hiển thị · heapq lưu trực tiếp" : "Values shown · heapq stores values"}</small><div class="mf295p-tree-scroll"><svg class="mf295p-tree" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${lower ? "small" : "large"}">${edges}${nodes || `<text class="mf295p-empty-tree" x="${width / 2}" y="45">${heap.initialized ? "∅" : "—"}</text>`}</svg></div></section>`;
  }
  const orderReady = a.top !== null && b.top !== null;
  const balance = `<div class="mf295p-balance"><span class="${orderReady ? v.invariants.order ? "yes" : "no" : "muted"}">${a.top ?? "—"} ≤ ${b.top ?? "—"} ${orderReady ? v.invariants.order ? "✓" : "✕" : ""}</span><span class="${v.invariants.initialized ? v.invariants.size ? "yes" : "no" : "muted"}">|small| : |large| = ${a.size} : ${b.size} ${v.invariants.initialized ? v.invariants.size ? "✓" : "✕" : ""}</span></div>`;
  let operation;
  if (moving) {
    operation = `<code class="lower">small</code>${token(movement.value, "lower")}<b class="mf295p-direction">${movement.from === "lower" ? "→" : "←"}</b>${token(movement.value, "upper")}<code class="upper">large</code><small>#${movement.occurrence.inputIndex + 1}</small>`;
  } else if (returned) {
    operation = v.median.kind === "odd"
      ? `${token(v.median.operands[0], "lower")}<b>→</b>${token(v.median.value, "result")}<small>median</small>`
      : `<span>(</span>${token(v.median.operands[0], "lower")}<b>+</b>${token(v.median.operands[1], "upper")}<span>) / 2 =</span>${token(v.median.value, "result")}`;
  } else if (v.check.kind) {
    let expression;
    if (v.check.kind === "partition-order") expression = a.top === null || b.top === null ? `${a.top === null ? "small" : "large"} = ∅` : `${a.top} > ${b.top}`;
    else if (v.check.kind === "small-size") expression = `${a.size} > ${b.size} + 1`;
    else if (v.check.kind === "large-size" || v.check.kind === "odd-count") expression = `${v.check.kind === "odd-count" ? a.size : b.size} > ${v.check.kind === "odd-count" ? b.size : a.size}`;
    operation = `<code>${esc(expression)}</code><span class="mf295p-condition">${v.check.result ? "True" : "False"}</span>${v.event === "check-return-odd" && !v.check.result ? `<small>${vi ? "Tiếp → trung bình hai đỉnh" : "Next → average both roots"}</small>` : ""}`;
  } else if (v.event === "push-small" || v.event === "enter-add-num") {
    operation = `<code>num</code>${token(v.operation.args[0], "lower")}<b class="mf295p-direction">${v.event === "push-small" ? "↓" : "⇣"}</b><code class="lower">small</code>`;
  } else {
    operation = `<code>${v.event === "enter-find-median" ? "findMedian()" : v.event === "initialize-small" ? "small = []" : v.event === "initialize-large" ? "large = []" : "MedianFinder()"}</code>`;
  }
  const sorted = ordered.map(entry => `<span class="mf295p-sorted-token ${entry.role} ${medianIds.has(entry.id) ? "median" : ""}" title="#${entry.inputIndex + 1}">${esc(String(entry.value))}</span>`).join("") || '<span class="mf295p-empty">[ ]</span>';
  const history = v.medianHistory.map((value, i) => `<span class="${returned && i === v.medianHistory.length - 1 ? "new" : ""}"><small>${i + 1}</small><b>${esc(String(value))}</b></span>`).join("") || '<span class="mf295p-empty">—</span>';
  const summary = vi ? `Hai heap: small ${a.size}, large ${b.size}; ${v.input.insertedCount} số đã thêm; ${v.medianHistory.length} median đã trả.` : `Two heaps: small ${a.size}, large ${b.size}; ${v.input.insertedCount} inserted; ${v.medianHistory.length} returned medians.`;
  $("treeView").innerHTML = `<section class="mf295p-viz" aria-label="${esc(summary)}">
    <div class="mf295p-heading"><b>${vi ? "HAI NỬA · MỘT MEDIAN" : "TWO HALVES · ONE MEDIAN"}</b><small>${vi ? "Dòng" : "Line"} ${v.sourceLine} · ${v.timing === "before" ? vi ? "trước" : "before" : vi ? "sau" : "after"}</small></div>
    <div class="mf295p-stream" aria-label="addNum">${stream}</div>
    <div class="mf295p-heaps">${heapPicture(a)}${heapPicture(b)}</div>
    ${balance}
    <div class="mf295p-operation">${operation}</div>
    <div class="mf295p-strip-heading"><span>${vi ? "VỊ TRÍ MEDIAN · XẾP THEO GIÁ TRỊ" : "MEDIAN POSITION · SORTED BY VALUE"}</span><small>${returned ? "◆ median" : ""}</small></div>
    <div class="mf295p-sorted">${sorted}</div>
    <div class="mf295p-strip-heading"><span>${vi ? "MEDIAN ĐÃ TRẢ" : "RETURNED MEDIANS"}</span><small>${v.medianHistory.length} / ${v.input.size}</small></div>
    <div class="mf295p-history">${history}</div>
  </section>`;
  for (const role of ["lower", "upper"]) {
    const canvas = $("treeView").querySelector(`.mf295p-heap.${role} .mf295p-tree-scroll`);
    const heap = role === "lower" ? a : b;
    if (!canvas) continue;
    const targetId = moving && movement.to === role ? movement.occurrence.id : v.event === "push-small" && role === "lower" ? currentId : null;
    const i = Math.max(0, heap.entries.findIndex(entry => entry.id === targetId)), depth = Math.floor(Math.log2(i + 1));
    const levels = heap.size ? Math.floor(Math.log2(heap.size)) + 1 : 1, width = Math.max(230, 2 ** (levels - 1) * 48);
    canvas.scrollLeft = Math.max(0, (i - (2 ** depth - 1) + .5) / 2 ** depth * width - canvas.clientWidth / 2);
    canvas.scrollTop = Math.max(0, depth * 40 + 24 - canvas.clientHeight / 2);
  }
  const streamCanvas = $("treeView").querySelector(".mf295p-stream"), currentToken = $("treeView").querySelector(".mf295p-input.current");
  if (streamCanvas && currentToken) streamCanvas.scrollTop = Math.max(0, currentToken.offsetTop - streamCanvas.clientHeight / 2);
  const historyCanvas = $("treeView").querySelector(".mf295p-history");
  if (historyCanvas) historyCanvas.scrollTop = historyCanvas.scrollHeight;
}
