function renderAllPathsDestination1059View(step) {
  const v = step.allPathsDestination1059View;
  if (!v) return;
  const vi = lang === "vi";
  const t = (a, b) => vi ? a : b;
  const host = $("treeView");
  const width = 520; const height = 280; const cx = width / 2; const cy = height / 2;
  const radius = Math.min(112, 22 + v.n * 8.3);
  const pos = Array.from({ length: v.n }, (_, node) => {
    const angle = -Math.PI / 2 + 2 * Math.PI * node / v.n;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
  const activeEdge = v.activeEdge;
  const edges = v.edges.map((edge) => {
    const a = pos[edge.u]; const b = pos[edge.v];
    const dx = b.x - a.x; const dy = b.y - a.y; const length = Math.max(1, Math.hypot(dx, dy));
    const from = { x: a.x + dx * 22 / length, y: a.y + dy * 22 / length };
    const to = { x: b.x - dx * 25 / length, y: b.y - dy * 25 / length };
    const hot = activeEdge && activeEdge.index === edge.index;
    const path = edge.u === edge.v
      ? `M ${a.x - 12} ${a.y - 17} C ${a.x - 46} ${a.y - 58}, ${a.x + 46} ${a.y - 58}, ${a.x + 12} ${a.y - 17}`
      : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    return `<path d="${path}" class="edge ${hot ? "active" : edge.status}" marker-end="url(#ap1059-arrow)"/>`;
  }).join("");
  const stack = v.stack.length ? v.stack : v.answer === true ? v.witness : v.failureWitness;
  const pathSet = new Set(stack);
  const nodes = pos.map(({ x, y }, node) => {
    const state = v.color[node];
    const cls = state === 3 || (v.answer === false && pathSet.has(node)) ? "bad" : state === 2 || (v.answer === true && node === v.destination) ? "good" : pathSet.has(node) ? "active" : "fresh";
    const tags = `${node === v.source ? `<text class="tag source-tag" x="${x}" y="${y - 31}">S</text>` : ""}${node === v.destination ? `<text class="tag dest-tag" x="${x}" y="${y + 36}">🏁</text>` : ""}`;
    return `<g class="node ${cls}"><circle class="halo" cx="${x}" cy="${y}" r="24"/><circle class="core" cx="${x}" cy="${y}" r="18"/><text class="number" x="${x}" y="${y}">${node}</text>${tags}</g>`;
  }).join("");
  const stackNodes = stack.map((node) => `<b>${node}</b>`).join(`<i>→</i>`) || `<span>${t("Chưa bắt đầu", "Not started")}</span>`;
  const status = v.answer === null ? "" : `<footer class="${v.answer ? "yes" : "no"}"><strong>${v.answer ? t("✓ MỌI ĐƯỜNG TỚI ĐÍCH", "✓ EVERY PATH REACHES DEST") : t("✕ CÓ ĐƯỜNG HỎNG", "✕ A PATH FAILS")}</strong><span>${(v.answer ? v.witness : v.failureWitness).join(" → ") || "∅"}</span></footer>`;
  host.innerHTML = `<section class="ap1059-viz" aria-label="${t("DFS kiểm tra mọi đường tới đích", "DFS checks all paths reach destination")}" aria-live="polite">
    <header><div><span>1059</span><b>🧭 ${t("Mọi đường tới đích?", "All paths reach dest?")}</b></div><strong>${v.edges.length} ↗</strong></header>
    <svg class="graph" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t("Đồ thị có hướng đang được DFS duyệt", "Directed graph explored by DFS")}"><defs><marker id="ap1059-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs>${edges}${nodes}</svg>
    <div class="trail"><small>${v.stack.length ? "DFS" : t("ĐƯỜNG MẪU", "PATH")}</small><div>${stackNodes}</div></div>
    <div class="legend"><span><i class="fresh"></i>${t("mới", "new")}</span><span><i class="active"></i>${t("đang thăm", "visiting")}</span><span><i class="good"></i>${t("an toàn", "safe")}</span><span><i class="bad"></i>${t("hỏng", "fails")}</span></div>${status}
  </section>`;
}
