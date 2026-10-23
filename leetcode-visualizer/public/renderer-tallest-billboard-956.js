function renderTallestBillboard956View(step) {
  const view = step.tallestBillboard956View;
  if (!view) return;
  const vi = lang === "vi";
  const t = (vn, en) => vi ? vn : en;
  const maskValues = (mask) => view.rods.filter((_, index) => mask & (1 << index));
  const leftValues = maskValues(view.preview?.leftMask || 0);
  const rightValues = maskValues(view.preview?.rightMask || 0);
  const leftHeight = leftValues.reduce((sum, value) => sum + value, 0);
  const rightHeight = rightValues.reduce((sum, value) => sum + value, 0);
  const gap = Math.abs(leftHeight - rightHeight);
  const active = view.event !== "done" && Number.isInteger(view.rodIndex);
  const rodTiles = view.rods.map((value, index) => {
    const role = view.preview?.leftMask & (1 << index) ? "on-left" : view.preview?.rightMask & (1 << index) ? "on-right" : "";
    const state = index === view.rodIndex && active ? "current" : index < view.processedCount ? "processed" : "waiting";
    return `<span class="tb956-rod ${state} ${role}" aria-label="${t("Thanh", "Rod")} ${value}"><b>${value}</b></span>`;
  }).join("");
  const pile = (side, values, height) => `<div class="tb956-pile ${side}">
    <div class="tb956-pile-head"><span>${side === "left" ? "A" : "B"}</span><b>${height}</b></div>
    <div class="tb956-pile-rods">${values.map((value) => `<i style="--rod-height:${Math.max(16, value * 4)}px" title="${value}">${value}</i>`).join("") || "<em>∅</em>"}</div>
  </div>`;

  const width = 680;
  const left = 28;
  const right = 652;
  const railX = (diff) => left + (diff / Math.max(1, view.total)) * (right - left);
  const dots = (states, y, kind) => states.map((state) => {
    const selected = state.diff === view.currentDiff ? " is-source" : "";
    const candidate = state.diff === view.nextDiff && ["taller", "place"].includes(view.event) ? " is-candidate" : "";
    return `<circle class="tb956-dot ${kind}${selected}${candidate}" cx="${railX(state.diff)}" cy="${y}" r="${state.diff === view.currentDiff || state.diff === view.nextDiff ? 6 : 3.5}"><title>Δ ${state.diff} · h ${state.short}</title></circle>`;
  }).join("");
  const sourceX = Number.isInteger(view.currentDiff) ? railX(view.currentDiff) : null;
  const nextX = Number.isInteger(view.nextDiff) ? railX(view.nextDiff) : null;
  const rail = `<svg class="tb956-rail" viewBox="0 0 ${width} 108" role="img" aria-label="${t("Các chênh lệch DP có thể đạt", "Reachable DP differences")}">
    <line class="tb956-track" x1="${left}" y1="49" x2="${right}" y2="49"/>
    <line class="tb956-zero" x1="${left}" y1="28" x2="${left}" y2="72"/>
    ${Number.isFinite(nextX) && Number.isFinite(sourceX) ? `<path class="tb956-hop" d="M ${sourceX} 49 Q ${(sourceX + nextX) / 2} 15 ${nextX} 49"/>` : ""}
    ${dots(view.before, 43, "before")}${dots(view.after, 55, "after")}
    ${Number.isFinite(sourceX) ? `<text class="tb956-label source-label" x="${sourceX}" y="31" text-anchor="middle">Δ${view.currentDiff}</text>` : ""}
    ${Number.isFinite(nextX) && nextX !== sourceX ? `<text class="tb956-label next-label" x="${nextX}" y="88" text-anchor="middle">Δ${view.nextDiff}</text>` : ""}
    <text class="tb956-axis" x="${left}" y="103">0</text><text class="tb956-axis" x="${right}" y="103" text-anchor="end">${view.total}</text>
  </svg>`;
  const formula = view.event === "taller" ? `Δ + ${view.rod} = ${view.nextDiff}`
    : view.event === "gap" ? `|${view.currentDiff} − ${view.rod}| = ${view.nextDiff}`
      : view.event === "shorter" ? `h + min(Δ, ${view.rod}) = ${view.nextShort}`
        : view.event === "place" ? `dp[${view.nextDiff}] ← max(…)`
          : view.event === "pair" ? `Δ ${view.currentDiff} · h ${view.currentShort}`
            : view.event === "done" ? `Δ 0 → ${view.answer}` : `${view.after.length} ${t("chênh lệch", "gaps")}`;
  const answer = view.answer === null ? "?" : view.answer;

  $("treeView").innerHTML = `<section class="tb956-viz" aria-label="${t("Minh họa bài 956", "Problem 956 visualization")}" aria-live="polite">
    <header class="tb956-head"><div><span class="tb956-id">956</span><strong>Tallest Billboard</strong></div><span class="tb956-answer">↕ <b>${answer}</b></span></header>
    <div class="tb956-rods">${rodTiles}</div>
    <div class="tb956-action"><span>${formula}</span><b>${view.event === "done" ? "✓" : view.event === "taller" || view.event === "place" ? "↗" : "·"}</b></div>
    <div class="tb956-balance">
      ${pile("left", leftValues, leftHeight)}
      <div class="tb956-gap"><small>Δ</small><b>${gap}</b><i>⚖</i></div>
      ${pile("right", rightValues, rightHeight)}
    </div>
    <div class="tb956-dp-head"><span>DP · Δ</span><b>${view.after.length}</b></div>
    <div class="tb956-chart">${rail}</div>
  </section>`;
}
