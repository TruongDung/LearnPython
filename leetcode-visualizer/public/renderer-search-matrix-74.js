function renderSearchMatrix74Pictures(step) {
  const v = step.search74View, vi = lang === "vi", esc = escapeHtml;
  const lo = v.lo ?? 0, hi = v.hi ?? v.total - 1, mid = v.mid;
  const hasRead = mid !== null && v.lastReadIndex === mid, found = v.phase === "found";
  const flat = v.matrix.flat(), inspected = new Set(v.inspected.map(probe => probe.index));
  const inside = index => index >= lo && index <= hi;
  const removed = index => v.removed && index >= v.removed.from && index <= v.removed.to;
  const classes = index => `${inside(index) ? "candidate" : "discarded"} ${index === mid ? "mid" : ""} ${removed(index) ? "just-removed" : ""} ${found && index === mid ? "found" : ""}`;
  const size = 46, pad = 28, width = pad * 2 + v.cols * size, height = pad * 2 + v.rows * size;
  const axes = v.matrix.flatMap((row, r) => [
    `<text class="s74p-axis" x="13" y="${pad + r * size + 28}">${r}</text>`,
    ...(r === 0 ? row.map((_, c) => `<text class="s74p-axis" x="${pad + c * size + 23}" y="15">${c}</text>`) : []),
  ]).join("");
  const cells = flat.map((value, index) => {
    const row = Math.floor(index / v.cols), col = index % v.cols;
    const read = inspected.has(index), long = String(value).length > 4;
    return `<g class="s74p-cell ${classes(index)}" transform="translate(${pad + col * size},${pad + row * size})"><title>index ${index} ↔ matrix[${row}][${col}] = ${esc(String(value))}</title><rect x="2" y="2" width="42" height="42" rx="6"/><text class="s74p-index" x="10" y="12">${index}</text><text class="s74p-value" x="23" y="29" ${long ? 'textLength="35" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(String(value))}</text>${read ? '<circle class="s74p-read-dot" cx="35" cy="36" r="2"/>' : ""}${removed(index) ? '<path class="s74p-cross" d="M 32 7 l 6 6 m 0 -6 l -6 6"/>' : ""}</g>`;
  }).join("");
  const mapping = mid === null
    ? `<div class="s74p-map-index"><small>index</small><b>?</b></div><i>↓</i><code>index // ${v.cols}</code><code>index % ${v.cols}</code><i>↓</i><span class="s74p-coordinate">(${vi ? "hàng, cột" : "row, col"})</span>`
    : `<div class="s74p-map-index"><small>mid</small><b>${mid}</b></div><i>↓</i><code>${mid} // ${v.cols} = <b>${v.activeCell[0]}</b></code><code>${mid} % ${v.cols} = <b>${v.activeCell[1]}</b></code><i>↓</i><span class="s74p-coordinate">(${v.activeCell.join(", ")})${hasRead ? ` → <b>${esc(String(v.value))}</b>` : ""}</span>`;
  const span = 440 / v.total, startX = 20;
  const interval = (from, to, className) => from <= to ? `<rect class="${className}" x="${startX + from * span}" y="9" width="${(to - from + 1) * span}" height="10" rx="2"/>` : "";
  const bar = `<svg class="s74p-range" viewBox="0 0 480 34" role="img" aria-label="${esc(`lo ${lo}, hi ${hi}; ${v.remaining}/${v.total}`)}"><rect class="s74p-range-base" x="20" y="9" width="440" height="10" rx="2"/>${v.removed ? interval(...v.removed.before, "s74p-before-range") : ""}${interval(lo, hi, "s74p-keep-range")}${v.removed ? interval(v.removed.from, v.removed.to, "s74p-drop-range") : ""}${mid === null ? "" : `<path class="s74p-mid-tick" d="M ${startX + (mid + .5) * span} 4 v 21"/>`}<text x="20" y="32">0</text><text x="460" y="32">${v.total - 1}</text></svg>`;
  const windowSize = 18, center = mid ?? lo, start = Math.max(0, Math.min(v.total - windowSize, center - Math.floor(windowSize / 2))), end = Math.min(v.total, start + windowSize);
  const omission = (from, to) => `<span class="s74p-ellipsis"><b>…</b><small>${from}–${to}</small></span>`;
  const flatCells = flat.slice(start, end).map((value, offset) => {
    const index = start + offset, tags = [index === lo ? "lo" : "", index === mid ? "mid" : "", index === hi ? "hi" : ""].filter(Boolean).join("/");
    return `<span class="s74p-flat-cell ${classes(index)}" title="matrix[${Math.floor(index / v.cols)}][${index % v.cols}]"><small>${index}</small><b>${esc(String(value))}</b><em>${tags || "&nbsp;"}</em></span>`;
  }).join("");
  let operation;
  if (v.removed) {
    const right = v.phase === "move-right", name = right ? "lo" : "hi", before = v.removed.before[right ? 0 : 1], after = right ? lo : hi;
    operation = `<span class="s74p-number">${esc(String(v.value))}</span><b>${right ? "&lt;" : "&gt;"}</b><span class="s74p-number target">${esc(String(v.target))}</span><i>${right ? "→" : "←"}</i><code>${name}: ${before} → ${after}</code><small class="s74p-cut">−${v.removed.to - v.removed.from + 1} ${vi ? "ô" : "cells"}</small>`;
  } else if (v.comparison) {
    const c = v.comparison;
    operation = `<code>value</code><span class="s74p-number">${esc(String(c.left))}</span><b>${esc(c.operator)}</b><span class="s74p-number target">${esc(String(c.right))}</span><code>target</code><b class="${c.pass ? "yes" : "no"}">${c.pass ? "✓" : "✕"}</b>`;
  } else if (found) {
    operation = `<b class="yes">✓</b><code>matrix[${v.activeCell[0]}][${v.activeCell[1]}] = ${esc(String(v.value))}</code><span class="s74p-return yes">True</span>`;
  } else if (v.phase === "missing") {
    operation = `<b class="no">∅</b><code>lo ${lo} &gt; hi ${hi}</code><span class="s74p-return no">False</span>`;
  } else if (v.phase === "mid") {
    operation = `<code>mid = ⌊(${lo} + ${hi}) / 2⌋</code><b>→</b><span class="s74p-number">${mid}</span>`;
  } else if (v.phase === "read") {
    operation = `<code>matrix[${v.activeCell[0]}][${v.activeCell[1]}]</code><b>→</b><code>value =</code><span class="s74p-number">${esc(String(v.value))}</span>`;
  } else if (v.phase === "range") {
    operation = `<code>lo ${lo} ≤ hi ${hi}</code><b class="${v.guard ? "yes" : "no"}">${v.guard ? "✓" : "✕"}</b>`;
  } else {
    operation = `<code>${v.rows} × ${v.cols} = ${v.total}</code><b>→</b><code>[0 … ${v.total - 1}]</code>`;
  }
  const summary = vi ? `Tìm ${v.target}; còn ${v.remaining}/${v.total} ô; mid ${mid ?? "—"}.` : `Find ${v.target}; ${v.remaining}/${v.total} candidates; mid ${mid ?? "—"}.`;
  $("treeView").innerHTML = `<section class="s74p-viz" aria-label="${esc(summary)}">
    <div class="s74p-heading"><b>${vi ? "MA TRẬN ⇄ CHỈ SỐ" : "MATRIX ⇄ INDEXES"}</b><span class="s74p-target">target <strong>${esc(String(v.target))}</strong></span><small>${v.rows} × ${v.cols} · ${vi ? "Dòng" : "Line"} ${v.source.line}</small></div>
    <div class="s74p-spatial"><div class="s74p-matrix-scroll"><svg class="s74p-matrix" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="matrix">${axes}${cells}</svg></div><div class="s74p-map">${mapping}</div></div>
    <div class="s74p-legend"><span class="candidate"></span>${vi ? "Còn tìm" : "Candidate"}<span class="mid"></span>mid<span class="discarded"></span>${vi ? "Đã bỏ" : "Discarded"}<span class="read"></span>${vi ? "Đã đọc" : "Read"}</div>
    <div class="s74p-range-section"><div><code>${v.remaining ? `[${lo} … ${hi}]` : "∅"}</code><small>${v.remaining} / ${v.total}</small></div>${bar}</div>
    <div class="s74p-flat" aria-label="${vi ? "Dải chỉ số phẳng" : "Flat index strip"}">${start > 0 ? omission(0, start - 1) : ""}${flatCells}${end < v.total ? omission(end, v.total - 1) : ""}</div>
    <div class="s74p-operation">${operation}</div>
  </section>`;
  const canvas = $("treeView").querySelector(".s74p-matrix-scroll");
  if (canvas && v.activeCell) {
    canvas.scrollTop = Math.max(0, pad + v.activeCell[0] * size - canvas.clientHeight / 2 + size / 2);
    canvas.scrollLeft = Math.max(0, pad + v.activeCell[1] * size - canvas.clientWidth / 2 + size / 2);
  }
}
