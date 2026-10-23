function renderMaximumTotalReward3181View(step) {
  const view = step.reward3181View;
  if (!view) return;
  const vi = lang === "vi";
  const t = (vn, en) => vi ? vn : en;
  const done = view.event === "done";
  const current = Number.isInteger(view.rewardIndex) ? view.rewardIndex : null;
  const rewards = view.rewards.map((value, index) => `
    <span class="mtr3181-reward ${index === current ? "is-current" : index < view.processedCount ? "is-seen" : ""}">
      <i aria-hidden="true">🎁</i><b>${value}</b>
    </span>`).join("");
  const reachable = new Set(view.after);
  const eligible = new Set(view.eligible);
  const shifted = new Set(view.shifted);
  const changed = new Set(view.changed);
  const cells = Array.from({ length: view.limit }, (_, total) => {
    const classes = [
      reachable.has(total) ? "is-reachable" : "is-empty",
      eligible.has(total) ? "is-eligible" : "",
      shifted.has(total) ? "is-preview" : "",
      changed.has(total) ? "is-new" : "",
      total === view.reward ? "is-gate" : "",
      total === view.answer && done ? "is-answer" : "",
    ].filter(Boolean).join(" ");
    return `<div class="mtr3181-cell ${classes}" title="${t("Tổng", "Total")} ${total}">
      <small>${total}</small><b aria-hidden="true">${reachable.has(total) || shifted.has(total) ? "●" : "·"}</b>
    </div>`;
  }).join("");

  let action = `<span aria-hidden="true">✨</span><b>${t("Bắt đầu", "Ready")}</b>`;
  if (view.event === "reward") action = `<span aria-hidden="true">🎁</span><b>${view.reward}</b>`;
  if (view.event === "mask") action = `<span aria-hidden="true">🚪</span><b>total &lt; ${view.reward}</b><small>${view.eligible.length} ●</small>`;
  if (view.event === "shift") action = `<span class="mtr3181-flow" aria-label="${t("Dịch tổng", "Shift totals")}">
    <b>${view.eligible.length} ●</b><i aria-hidden="true">→</i><strong>+${view.reward}</strong><i aria-hidden="true">→</i><b>${view.shifted.length} ✨</b>
  </span>`;
  if (view.event === "merge") action = `<span aria-hidden="true">✨</span><b>+${view.changed.length}</b><small>${t("tổng mới", "new totals")}</small>`;
  if (done) action = `<span aria-hidden="true">🏆</span><b>${view.answer}</b>`;

  const witness = view.witness.map((value) => `<span class="mtr3181-coin"><i aria-hidden="true">🪙</i><b>${value}</b></span>`).join("");
  const count = view.after.length;
  $("treeView").innerHTML = `<section class="mtr3181-viz" aria-label="${t("Minh họa bài 3181", "Problem 3181 visualization")}" aria-live="polite">
    <header class="mtr3181-head">
      <div><span>3181</span><strong>${t("Thưởng lớn nhất", "Maximum reward")}</strong></div>
      <b>🏆 ${done ? view.answer : "?"}</b>
    </header>
    <div class="mtr3181-rewards" aria-label="${t("Thưởng đã sắp xếp", "Sorted rewards")}">${rewards}</div>
    <div class="mtr3181-action">${action}</div>
    <div class="mtr3181-track-label"><span>0</span><b>${count} ●</b><span>${view.limit - 1}</span></div>
    <div class="mtr3181-track" style="--mtr3181-count:${view.limit}" aria-label="${t("Các tổng có thể đạt", "Reachable totals")}">${cells}</div>
    <div class="mtr3181-witness" aria-label="${t("Các phần thưởng tạo tổng lớn nhất", "Rewards making the maximum total")}">
      <span aria-hidden="true">🪙</span><div>${witness || `<small>${t("Chờ tìm đường", "Finding a path")}</small>`}</div><b>${done ? `=${view.answer}` : ""}</b>
    </div>
  </section>`;
}
