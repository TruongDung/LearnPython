function renderMinimumHeightTrees310View(step) {
  const v = step.minimumHeightTrees310View; if (!v) return;
  const vi = lang === "vi"; const t = (a, b) => vi ? a : b;
  const cx = 200, cy = 105, radius = Math.min(77, 22 + v.n * 3.7);
  const pos = Array.from({ length: v.n }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i / v.n);
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
  const removed = new Set(v.removed); const leaves = new Set(v.leaves); const roots = new Set(v.roots);
  const lines = v.edges.map(([a,b]) => {
    const cut = removed.has(a) || removed.has(b);
    return `<line x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}" class="${cut ? "cut" : "edge"}"/>`;
  }).join("");
  const nodes = pos.map(({x,y},i) => {
    const klass = roots.has(i) ? "center" : removed.has(i) ? "removed" : i === v.current ? "current" : leaves.has(i) ? "leaf" : "node";
    return `<g class="node ${klass}"><circle cx="${x}" cy="${y}" r="15"/><text x="${x}" y="${y+1}">${i}</text>${!removed.has(i)?`<text class="degree" x="${x+12}" y="${y-11}">${v.degree[i]}</text>`:""}</g>`;
  }).join("");
  const leafIcons = [...leaves].map(i => `<span>🍃 ${i}</span>`).join("") || `<span>${t("—", "—")}</span>`;
  const result = v.phase === "done" ? `<footer>🌳 ${v.roots.join(" · ")}</footer>` : "";
  $("treeView").innerHTML = `<section class="mht310-viz" aria-label="${t("Tỉa lá tìm tâm cây", "Peel leaves to find tree center")}" aria-live="polite">
    <header><div><span>310</span><b>🌳 ${t("Tỉa lá → tâm", "Peel → center")}</b></div><strong>${t("Lớp", "Layer")} ${v.layer}</strong></header>
    <svg class="mht310-tree" viewBox="0 0 400 210" role="img" aria-label="${t("Đồ thị cây", "Tree graph")}">${lines}${nodes}</svg>
    <div class="mht310-foot"><div>${leafIcons}</div><b>${v.n-v.removed.length}/${v.n}</b></div>${result}
  </section>`;
}
