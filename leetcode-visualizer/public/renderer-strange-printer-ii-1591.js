function renderStrangePrinterII1591View(step) {
  const v = step.strangePrinterII1591View;
  if (!v) return;
  const vi = lang === "vi", t = (a, b) => vi ? a : b;
  const palette = ["#0ea5e9", "#f97316", "#8b5cf6", "#10b981", "#ef4444", "#d946ef", "#eab308", "#14b8a6", "#6366f1", "#ec4899"];
  const allColors = [...new Set(v.grid.flat())].sort((a, b) => a - b);
  const colorOf = (color) => palette[allColors.indexOf(Number(color)) % palette.length];
  const host = $("treeView"), cell = 42, gap = 4, pad = 20, boardW = pad * 2 + v.w * (cell + gap) - gap, boardH = pad * 2 + v.h * (cell + gap) - gap;
  const gridCells = v.grid.map((row, r) => row.map((color, c) => {
    const x = pad + c * (cell + gap), y = pad + r * (cell + gap), active = v.activeCell?.r === r && v.activeCell?.c === c;
    return `<g class="cell ${active ? "cell-active" : ""}"><rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="9" fill="${colorOf(color)}"/><text x="${x + cell / 2}" y="${y + cell / 2 + 1}">${color}</text>${active ? `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="21"/>` : ""}</g>`;
  }).join("")).join("");
  const boxes = Object.entries(v.boxes).map(([color, box]) => {
    const x = pad + box.left * (cell + gap) - 3, y = pad + box.top * (cell + gap) - 3;
    const width = (box.right - box.left + 1) * (cell + gap) - gap + 6, height = (box.bottom - box.top + 1) * (cell + gap) - gap + 6;
    return `<rect class="bbox ${Number(color) === v.activeColor ? "bbox-active" : ""}" x="${x}" y="${y}" width="${width}" height="${height}" rx="12" stroke="${colorOf(color)}"><title>${t("khung màu", "color box")} ${color}</title></rect>`;
  }).join("");
  const colors = Object.keys(v.boxes).map(Number).sort((a, b) => a - b), positions = new Map();
  const graphW = 360, graphH = Math.max(165, colors.length * 24), cx = graphW / 2, cy = graphH / 2, radius = Math.min(105, 28 + colors.length * 7);
  colors.forEach((color, i) => { const angle = -Math.PI / 2 + 2 * Math.PI * i / colors.length; positions.set(color, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }); });
  const arrows = v.edges.map((edge) => {
    const a = positions.get(edge.from), b = positions.get(edge.to); if (!a || !b) return "";
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.max(1, Math.hypot(dx, dy));
    const d = `M${a.x + dx * 17 / length},${a.y + dy * 17 / length} L${b.x - dx * 20 / length},${b.y - dy * 20 / length}`;
    return `<path class="edge ${edge.status}" d="${d}" marker-end="url(#sp1591-arrow)"/>`;
  }).join("");
  const nodes = colors.map((color) => {
    const p = positions.get(color), ready = v.queue.includes(color), printed = v.order.includes(color), active = v.activeColor === color;
    return `<g class="node ${ready ? "ready" : ""} ${printed ? "printed" : ""} ${active ? "active" : ""}"><circle cx="${p.x}" cy="${p.y}" r="16" fill="${colorOf(color)}"/><text x="${p.x}" y="${p.y + 1}">${color}</text></g>`;
  }).join("");
  const output = v.answer === null ? v.order : v.answer ? v.order : [];
  host.innerHTML = `<section class="sp1591-viz">
    <header><div><span>1591</span><b>${t("Mỗi màu · một khung", "One box per color")}</b></div><strong class="${v.answer === false ? "bad" : v.answer ? "good" : ""}">${v.answer === null ? t("ĐANG TÌM THỨ TỰ", "FINDING ORDER") : v.answer ? t("IN ĐƯỢC ✓", "PRINTABLE ✓") : t("BỊ KẸT ✕", "CYCLE ✕")}</strong></header>
    <div class="picture-wrap"><div class="picture-title"><span>🎨 ${t("TRANH CẦN TẠO", "TARGET PICTURE")}</span><small>${t("viền = khung sơn", "outline = paint box")}</small></div>
      <svg class="picture" viewBox="0 0 ${boardW} ${boardH}" role="img" aria-label="${t("Bảng màu và khung sơn", "Color grid and paint boxes")}">${gridCells}${boxes}</svg>
    </div>
    <div class="graph-wrap"><div class="picture-title"><span>↗ ${t("THỨ TỰ MÀU", "COLOR ORDER")}</span><small>${t("mũi tên: in trước", "arrow: print first")}</small></div>
      <svg class="graph" viewBox="0 0 ${graphW} ${graphH}" role="img" aria-label="${t("Đồ thị thứ tự in màu", "Color print order graph")}"><defs><marker id="sp1591-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z"/></marker></defs>${arrows}${nodes}</svg>
    </div>
    <footer class="${v.answer === false ? "bad" : v.answer ? "good" : ""}"><small>${t("IN LẦN LƯỢT", "PRINT ORDER")}</small><div>${output.length ? output.map((color) => `<b style="--chip:${colorOf(color)}">${color}</b>`).join("") : `<i>${v.answer === false ? "↻" : "…"}</i>`}</div></footer>
    <aside>🖌️ ${t("Ô bị khung che → ô đó in trước", "Covered cell → print it first")}</aside>
  </section>`;
}
