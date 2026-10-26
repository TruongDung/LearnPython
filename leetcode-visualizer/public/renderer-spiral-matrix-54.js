function renderSpiral54Pictures(step) {
  const v = step.spiral54View, vi = lang === "vi", esc = escapeHtml;
  const directions = [
    { key: "top", arrow: "→", label: vi ? "Trên" : "Top" },
    { key: "right", arrow: "↓", label: vi ? "Phải" : "Right" },
    { key: "bottom", arrow: "←", label: vi ? "Dưới" : "Bottom" },
    { key: "left", arrow: "↑", label: vi ? "Trái" : "Left" },
  ];
  const b = v.bounds, size = 56, ox = 64, oy = 40, width = ox * 2 + v.cols * size, height = oy * 2 + v.rows * size;
  const visits = new Map(v.visitedCells.map(cell => [`${cell.row},${cell.col}`, cell]));
  const defined = bounds => Object.values(bounds).every(value => value !== null);
  const valid = bounds => defined(bounds) && bounds.top <= bounds.bottom && bounds.left <= bounds.right;
  const point = (r, c) => [ox + c * size + size / 2, oy + r * size + size / 2];
  const rectangle = (bounds, className) => valid(bounds) ? `<rect class="${className}" x="${ox + bounds.left * size - 2}" y="${oy + bounds.top * size - 2}" width="${(bounds.right - bounds.left + 1) * size + 4}" height="${(bounds.bottom - bounds.top + 1) * size + 4}" rx="8"/>` : "";
  const oldBounds = v.boundaryChange ? { ...b, [v.boundaryChange.name]: v.boundaryChange.from } : null;
  const trail = v.visitedCells.map(cell => point(cell.row, cell.col).join(",")).join(" ");
  const axes = v.matrix.flatMap((row, r) => [
    `<text class="sp54-axis" x="${ox - 12}" y="${oy + r * size + 31}">${r}</text>`,
    ...(r === 0 ? row.map((_, c) => `<text class="sp54-axis" x="${ox + c * size + 28}" y="${oy - 12}">${c}</text>`) : []),
  ]).join("");
  const cells = v.matrix.flatMap((row, r) => row.map((value, c) => {
    const visit = visits.get(`${r},${c}`), active = v.activeCell?.[0] === r && v.activeCell?.[1] === c;
    const tone = visit?.direction || (active ? v.direction : "none");
    const label = `${vi ? "Ô" : "Cell"} (${r},${c}): ${value}${visit ? `; #${visit.order}` : ""}`;
    return `<g class="sp54-cell ${visit ? "visited" : "pending"} ${active ? "active" : ""} tone-${tone}" transform="translate(${ox + c * size},${oy + r * size})"><title>${esc(label)}</title><rect x="3" y="3" width="50" height="50" rx="7"/><text class="sp54-value" x="28" y="34" ${String(value).length > 5 ? 'textLength="42" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(String(value))}</text>${visit ? `<text class="sp54-order" x="12" y="15">${visit.order}</text>` : ""}${active ? `<circle class="sp54-cursor" cx="43" cy="13" r="4"/>` : ""}</g>`;
  })).join("");
  let edge = "";
  if (valid(b) && v.direction && ["select", "append", "loop"].includes(v.phase)) {
    const x1 = ox + b.left * size, x2 = ox + (b.right + 1) * size, y1 = oy + b.top * size, y2 = oy + (b.bottom + 1) * size;
    const paths = {
      top: `M ${x1 + 10} ${y1 + size - 5} H ${x2 - 10}`,
      right: `M ${x2 - 5} ${y1 + 10} V ${y2 - 10}`,
      bottom: `M ${x2 - 10} ${y2 - 5} H ${x1 + 10}`,
      left: `M ${x1 + 5} ${y2 - 10} V ${y1 + 10}`,
    };
    edge = `<path class="sp54-edge tone-${v.direction}" d="${paths[v.direction]}" marker-end="url(#sp54-arrow)"/>`;
  }
  const display = name => b[name] ?? "—";
  const boundsLabels = `<text class="sp54-bound tone-top" x="${width / 2}" y="15">top = ${display("top")}</text><text class="sp54-bound tone-bottom" x="${width / 2}" y="${height - 8}">bottom = ${display("bottom")}</text><text class="sp54-bound tone-left" x="28" y="${height / 2 - 8}">left<tspan x="28" dy="16">${display("left")}</tspan></text><text class="sp54-bound tone-right" x="${width - 28}" y="${height / 2 - 8}">right<tspan x="${width - 28}" dy="16">${display("right")}</tspan></text>`;
  const compass = directions.map(d => `<span class="tone-${d.key} ${v.direction === d.key ? "active" : ""}"><b>${d.arrow}</b><small>${d.label}</small></span>`).join("");
  let operation = "";
  if (v.activeCell) {
    const [r, c] = v.activeCell, value = v.matrix[r][c], index = v.result.length - (v.phase === "append" ? 1 : 0);
    operation = `<code>matrix[${r}][${c}]</code><span class="sp54-token tone-${v.direction}">${esc(String(value))}</span><b>${v.phase === "append" ? "→" : "⇢"}</b><span class="sp54-target ${v.phase === "append" ? "added" : ""}">res[${index}]${v.phase === "append" ? " ✓" : " ?"}</span>`;
  } else if (v.boundaryChange) {
    const d = v.boundaryChange;
    operation = `<code class="tone-${d.name}">${d.name}</code><span class="sp54-token">${d.from}</span><b>→</b><span class="sp54-token tone-${d.name}">${d.to}</span>`;
  } else if (v.guard) {
    operation = `<code>${esc(v.guard.expression)}</code><b class="${v.guard.pass ? "pass" : "skip"}">${v.guard.pass ? "✓" : "✕"}</b>`;
  } else {
    operation = `<code>${esc(v.source.text.trim())}</code><b class="pass">${v.phase === "done" || v.phase === "loop" ? "✓" : ""}</b>`;
  }
  const output = v.visitedCells.map(cell => `<span class="sp54-output-cell tone-${cell.direction} ${v.phase === "append" && cell.order === v.result.length ? "active" : ""}" title="(${cell.row},${cell.col})"><small>${cell.order}</small><b>${esc(String(cell.value))}</b></span>`).join("") || '<span class="sp54-empty">[ ]</span>';
  const summary = vi ? `Đã lấy ${v.result.length}/${v.rows * v.cols} ô theo xoắn ốc.` : `${v.result.length}/${v.rows * v.cols} cells visited in spiral order.`;
  $("treeView").innerHTML = `<section class="sp54-viz" aria-label="${esc(summary)}">
    <div class="sp54-heading"><b>${vi ? "ĐƯỜNG XOẮN ỐC" : "SPIRAL PATH"}</b><span>${v.rows} × ${v.cols} · ${vi ? "Dòng" : "Line"} ${v.source.line}</span></div>
    <div class="sp54-compass" aria-label="${vi ? "Thứ tự bốn hướng" : "Four directions in order"}">${compass}</div>
    <div class="sp54-canvas"><svg class="sp54-grid" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(summary)}"><defs><marker id="sp54-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"/></marker></defs>${oldBounds ? rectangle(oldBounds, "sp54-old-region") : ""}${rectangle(b, "sp54-region")}<polyline class="sp54-trail" points="${trail}"/>${axes}${cells}${edge}${boundsLabels}</svg></div>
    <div class="sp54-legend"><span class="sp54-key pending"></span>${vi ? "Chưa lấy" : "Unvisited"}<span class="sp54-key visited"></span>${vi ? "Đã lấy" : "Visited"}<span class="sp54-key region"></span>${vi ? "Vùng đang xử lý" : "Active region"}</div>
    <div class="sp54-operation">${operation}</div>
    <div class="sp54-output-heading"><b>res</b><span>${v.result.length} / ${v.rows * v.cols} ${v.phase === "done" ? "✓" : ""}</span></div>
    <div class="sp54-output" aria-label="res">${output}</div>
  </section>`;
}
