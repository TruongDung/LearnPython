function renderRankTransformMatrix1632View(step) {
  const v = step.rankTransformMatrix1632View;
  if (!v) return;
  const vi = lang === "vi", t = (a, b) => vi ? a : b;
  const palette = ["#0ea5e9", "#f97316", "#8b5cf6", "#10b981", "#ef4444", "#d946ef", "#eab308", "#14b8a6"];
  const host = $("treeView"), cell = 54, gap = 5, pad = 10, boardW = pad * 2 + v.n * (cell + gap) - gap, boardH = pad * 2 + v.m * (cell + gap) - gap;
  const rootOf = (node) => { while (v.parent[node] !== node) node = v.parent[node]; return node; };
  const roots = [...new Set(Array.from({ length: v.m + v.n }, (_, i) => rootOf(i)))];
  const colorOfRoot = (root) => palette[roots.indexOf(root) % palette.length];
  const grid = v.matrix.map((row, r) => row.map((value, c) => {
    const x = pad + c * (cell + gap), y = pad + r * (cell + gap), active = v.activeCell?.r === r && v.activeCell?.c === c;
    const selected = v.currentValue === value;
    const rank = v.result[r][c];
    return `<g class="cell ${selected ? "selected" : ""} ${active ? "active" : ""}"><rect class="tile" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="11"/><text class="value" x="${x + cell / 2}" y="${y + 20}">${value}</text>${rank ? `<rect class="rank-pill" x="${x + 13}" y="${y + 31}" width="28" height="17" rx="8"/><text class="rank" x="${x + 27}" y="${y + 39.5}">${rank}</text>` : `<text class="pending" x="${x + 27}" y="${y + 40}">·</text>`}</g>`;
  }).join("")).join("");
  const graphW = 360, graphH = Math.max(150, Math.max(v.m, v.n) * 46 + 20), leftX = 64, rightX = 296;
  const rowPos = Array.from({ length: v.m }, (_, r) => ({ x: leftX, y: 22 + (r + .5) * (graphH - 34) / v.m }));
  const colPos = Array.from({ length: v.n }, (_, c) => ({ x: rightX, y: 22 + (c + .5) * (graphH - 34) / v.n }));
  const links = v.edges.map((edge) => {
    const a = rowPos[edge.r], b = colPos[edge.c], root = rootOf(edge.rowNode);
    return `<path class="link" d="M${a.x + 20},${a.y} L${b.x - 20},${b.y}" stroke="${colorOfRoot(root)}"/>`;
  }).join("");
  const rowNodes = rowPos.map((p, r) => `<g class="dsu-node"><rect x="${p.x - 30}" y="${p.y - 16}" width="60" height="32" rx="10" fill="${colorOfRoot(rootOf(r))}"/><text x="${p.x}" y="${p.y + 1}">R${r} · ${v.rank[r]}</text></g>`).join("");
  const colNodes = colPos.map((p, c) => { const node = v.m + c; return `<g class="dsu-node"><rect x="${p.x - 30}" y="${p.y - 16}" width="60" height="32" rx="10" fill="${colorOfRoot(rootOf(node))}"/><text x="${p.x}" y="${p.y + 1}">C${c} · ${v.rank[node]}</text></g>`; }).join("");
  const best = Object.entries(v.best).map(([root, base]) => `<b style="--root:${colorOfRoot(Number(root))}">${t("nhóm", "set")} ${root}: ${base} + 1 → ${base + 1}</b>`).join("");
  const output = v.answer || v.result;
  host.innerHTML = `<section class="rt1632-viz">
    <header><div><span>1632</span><b>${t("Giá trị nhỏ → lớn", "Small values → large")}</b></div><strong>${v.currentValue === null ? t("XONG ✓", "DONE ✓") : `${t("ĐANG XỬ LÝ", "VALUE")} ${v.currentValue}`}</strong></header>
    <div class="layer-track"><span class="done">${v.completedValues.map((x) => `<b>${x}</b>`).join("")}</span><i>←</i><b class="current">${v.currentValue ?? "✓"}</b><i>→</i><span>${v.values.filter((x) => !v.completedValues.includes(x) && x !== v.currentValue).map((x) => `<b>${x}</b>`).join("") || `<small>${t("cuối", "last")}</small>`}</span></div>
    <div class="matrix-panel"><div class="panel-label"><span>▦ ${t("Ô gốc", "INPUT")}</span><small>${t("số trong huy hiệu = hạng", "badge = rank")}</small></div><svg class="matrix" viewBox="0 0 ${boardW} ${boardH}" role="img" aria-label="${t("Ma trận giá trị và hạng", "Matrix values and ranks")}">${grid}</svg></div>
    <div class="dsu-panel"><div class="panel-label"><span>⌘ ${t("GỘP HÀNG · CỘT", "JOIN ROWS · COLUMNS")}</span><small>${t("cùng màu = cùng nhóm", "same color = same set")}</small></div><svg class="dsu" viewBox="0 0 ${graphW} ${graphH}" role="img" aria-label="${t("Các thành phần DSU hàng và cột", "Row and column DSU components")}">${links}${rowNodes}${colNodes}</svg></div>
    <div class="best-ranks">${best || `<small>${t("Hạng hàng/cột ban đầu = 0", "Starting row/column ranks = 0")}</small>`}</div>
    <footer><small>${t("MA TRẬN HẠNG", "RANK MATRIX")}</small><div>${output.map((row) => `<span>${row.map((rank) => `<b>${rank || "·"}</b>`).join("")}</span>`).join("")}</div></footer>
    <aside>${t("Mỗi nhóm: hạng lớn nhất + 1", "Each component: largest rank + 1")}</aside>
  </section>`;
}
