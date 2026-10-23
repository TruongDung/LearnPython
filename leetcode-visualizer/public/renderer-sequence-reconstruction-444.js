function renderSequenceReconstruction444View(step) {
  const v = step.sequenceReconstruction444View;
  if (!v) return;
  const vi = lang === "vi";
  const t = (a, b) => vi ? a : b;
  const host = $("treeView");
  const width = 480; const height = 224; const cx = width / 2; const cy = 113;
  const radius = Math.min(76, 23 + v.nums.length * 5.4);
  const pos = Object.fromEntries(v.nums.map((n, i) => {
    const angle = -Math.PI / 2 + 2 * Math.PI * i / v.nums.length;
    return [n, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }];
  }));
  const done = new Set(v.order);
  const active = ["edge", "duplicate", "unlock"].includes(v.phase) ? v.activeEdge : null;
  const edges = v.edges.map(({ a, b }) => {
    const p = pos[a]; const q = pos[b];
    const hot = active && active.a === a && active.b === b;
    return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" class="${hot ? "edge active" : "edge"}" marker-end="url(#sr444-arrow)"/>`;
  }).join("");
  const nodes = v.nums.map((n) => {
    const p = pos[n];
    const kind = done.has(n) ? "done" : n === v.active ? "current" : v.ready.includes(n) ? "ready" : "node";
    return `<g class="node ${kind}"><circle cx="${p.x}" cy="${p.y}" r="18"/><text x="${p.x}" y="${p.y}">${n}</text><rect x="${p.x + 12}" y="${p.y - 25}" width="24" height="15" rx="7"/><text class="degree" x="${p.x + 24}" y="${p.y - 17}">${v.indegree[n]}</text></g>`;
  }).join("");
  const seqs = v.sequences.map((seq) => `<span class="seq">${seq.map((n) => `<b>${n}</b>`).join("<i>→</i>") || "∅"}</span>`).join("");
  const ready = v.queue.map((n) => `<b class="token ready">${n}</b>`).join("") || `<span class="empty">∅</span>`;
  const order = v.order.map((n) => `<b class="token done">${n}</b>`).join("");
  const resultLabels = {
    match: t("✅ Khớp duy nhất", "✅ Unique match"),
    ambiguous: t("↔️ Nhiều lựa chọn", "↔️ Multiple choices"),
    missing: t("⚠️ Thiếu số", "⚠️ Missing value"),
    cycle: t("🔁 Có chu trình", "🔁 Cycle found"),
    mismatch: t("↪️ Khác thứ tự đích", "↪️ Different order"),
  };
  const result = v.answer === null ? "" : `<footer class="${v.answer ? "yes" : "no"}"><strong>${resultLabels[v.reason] || t("Không khớp", "No match")}</strong><span>${v.order.join(" → ") || "∅"}</span></footer>`;
  host.innerHTML = `<section class="sr444-viz" aria-label="${t("Khôi phục thứ tự từ các dãy con", "Reconstruct order from subsequences")}" aria-live="polite">
    <header><div><span>444</span><b>🧩 ${t("Ghép thứ tự", "Rebuild order")}</b></div><strong>${v.nums.length} ${t("số", "values")}</strong></header>
    <div class="target"><small>${t("ĐÍCH", "TARGET")}</small><div>${v.nums.map((n, i) => `<b class="token ${done.has(n) ? "done" : ""}">${n}</b>${i < v.nums.length - 1 ? "<i>→</i>" : ""}`).join("")}</div></div>
    <div class="seqs">${seqs}</div>
    <svg class="graph" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t("Đồ thị mũi tên và bậc vào", "Arrow graph and indegrees")}"><defs><marker id="sr444-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"/></marker></defs>${edges}${nodes}</svg>
    <div class="lanes"><div><small>0 ${t("bậc", "in")}</small><span>${ready}</span></div><div><small>${t("ĐÃ GHÉP", "ORDER")}</small><span>${order || `<span class="empty">· · ·</span>`}</span></div></div>${result}
  </section>`;
}
