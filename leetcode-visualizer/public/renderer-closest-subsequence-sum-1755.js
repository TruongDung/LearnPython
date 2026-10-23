function renderClosestSubsequenceSum1755View(step) {
  const view = step.closestSum1755View;
  if (!view) return;
  const vi = lang === "vi";
  const t = (vn, en) => vi ? vn : en;
  const done = view.phase === "done";
  const nums = view.nums.map((value, index) => `<span class="css1755-num ${index < view.mid ? "is-left" : "is-right"} ${view.activeSubset?.indices.includes(index) ? "is-active" : ""} ${view.bestPair?.indices.includes(index) ? "is-best" : ""}"><b>${value}</b></span>`).join("");
  const subsetRows = (items, side, active) => items.slice(-10).map((item) => `<span class="css1755-sum ${active && item.mask === active.mask ? "is-active" : ""} ${view.bestPair && item.sum === (side === "left" ? view.bestPair.left : view.bestPair.right) ? "is-best" : ""}">${item.sum}</span>`).join("");
  const right = view.right;
  const rightMin = right.length ? Math.min(...right.map((item) => item.sum)) : 0;
  const rightMax = right.length ? Math.max(...right.map((item) => item.sum)) : 0;
  const wanted = view.activeLeft ? view.goal - view.activeLeft.sum : null;
  const marker = (item, kind) => {
    if (!item) return "";
    const index = right.findIndex((entry) => entry.mask === item.mask && entry.sum === item.sum);
    return `<span class="css1755-pointer ${kind}" style="--css1755-position:${right.length > 1 ? Math.max(0, index) / (right.length - 1) * 100 : 50}%"><i>${kind === "mid" ? "⌖" : "●"}</i><b>${item.sum}</b></span>`;
  };
  const cells = right.map((item) => {
    const current = view.activeRight && item.mask === view.activeRight.mask && item.sum === view.activeRight.sum;
    const best = view.bestPair && item.sum === view.bestPair.right && view.activeLeft?.sum === view.bestPair.left;
    return `<span class="css1755-track-cell ${current ? "is-current" : ""} ${best ? "is-best" : ""}">${item.sum}</span>`;
  }).join("");
  const pair = view.activeLeft && view.activeRight
    ? `<div class="css1755-equation"><b>${view.activeLeft.sum}</b><i>+</i><b>${view.activeRight.sum}</b><i>→</i><b>${view.activeLeft.sum + view.activeRight.sum}</b><small>Δ ${Math.abs(view.goal - view.activeLeft.sum - view.activeRight.sum)}</small></div>`
    : `<div class="css1755-equation"><b>${t("Chọn một tổng bên trái", "Pick a left sum")}</b><i>→</i><b>${view.goal}</b></div>`;
  const result = done ? `<span class="css1755-result">${view.bestPair ? `${view.bestPair.left} + ${view.bestPair.right} = ${view.bestPair.total}` : "∅"}<b>Δ ${view.answer}</b></span>` : "";

  $("treeView").innerHTML = `<section class="css1755-viz" aria-label="${t("Minh họa tổng tập con gần nhất", "Closest subsequence sum visualization")}" aria-live="polite">
    <header class="css1755-head"><div><span>1755</span><strong>🎯 ${t("Tổng gần nhất", "Closest sum")}</strong></div><b>${t("goal", "goal")} ${view.goal}</b></header>
    <div class="css1755-input">${nums}<i>✂</i></div>
    <div class="css1755-halves">
      <article class="css1755-half left"><header><b>🔵 ${t("Nửa trái", "Left half")}</b><small>${view.leftValues.join(" · ") || "∅"}</small></header><div class="css1755-subsets">${subsetRows(view.left, "left", view.activeSide === "left" ? view.activeSubset : null) || "<small>…</small>"}</div></article>
      <article class="css1755-half right"><header><b>🟣 ${t("Nửa phải", "Right half")}</b><small>${view.rightValues.join(" · ") || "∅"}</small></header><div class="css1755-subsets">${subsetRows(view.right, "right", view.activeSide === "right" ? view.activeSubset : null) || "<small>…</small>"}</div></article>
    </div>
    <div class="css1755-match"><div class="css1755-match-top"><span>${view.activeLeft ? `${view.goal} − (${view.activeLeft.sum}) = ${wanted}` : t("Tổng mục tiêu", "Target sum")}</span><small>${rightMin} … ${rightMax}</small></div><div class="css1755-track">${cells || "<small>…</small>"}${marker(view.activeRight, "pick")}${marker(Number.isInteger(view.middle) ? right[view.middle] : null, "mid")}</div>${pair}${result}</div>
  </section>`;
}
