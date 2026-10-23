function renderMaximumTotalReward3180View(step) {
  const view = step.reward3180View;
  if (!view) return;
  const vi = lang === "vi";
  const t = (vn, en) => vi ? vn : en;
  const current = Number.isInteger(view.rewardIndex) ? view.rewardIndex : null;
  const done = view.event === "done";
  const displayedRewards = view.event === "start" ? view.original : view.rewards;
  const rewards = displayedRewards.map((value, index) => `<span class="mr3180-token ${index === current ? "is-current" : index < view.processedCount ? "is-seen" : ""}"><i>✦</i><b>${value}</b></span>`).join("");
  let running = 0;
  const path = view.witness.map((value) => {
    running += value;
    return `<span class="mr3180-hop"><b>+${value}</b><small>Σ ${running}</small></span>`;
  }).join("");
  const cells = view.after.map((reachable, sum) => {
    const before = view.before[sum];
    const changed = reachable && !before;
    const classes = [
      sum === view.total ? "is-source" : "",
      sum === view.destination && ["add", "done"].includes(view.event) ? "is-target" : "",
      changed ? "is-new" : "",
      reachable ? "is-reachable" : "is-locked",
    ].filter(Boolean).join(" ");
    return `<div class="mr3180-cell ${classes}" title="${t("Tổng", "Total")} ${sum}"><small>${sum}</small><b>${reachable ? "●" : "·"}</b></div>`;
  }).join("");
  const open = Boolean(view.reachable) && Number.isInteger(view.total) && Number.isInteger(view.reward) && view.total < view.reward;
  const action = view.event === "add"
    ? `<div class="mr3180-equation"><span>${view.total}</span><i>＋</i><b>${view.reward}</b><i>＝</i><strong>${view.destination}</strong></div>`
    : view.event === "check"
      ? `<div class="mr3180-gate is-open"><span>🧮</span><b>${view.total} &lt; ${view.reward} ✓</b></div>`
    : view.event === "gate"
      ? `<div class="mr3180-gate ${open ? "is-open" : "is-closed"}"><span>${open ? "🚪✨" : "🚫🔒"}</span><b>dp[${view.total}] = ${open ? "1 ✓" : "0"}</b></div>`
      : `<div class="mr3180-gate"><span>${done ? "🏆" : "🎁"}</span><b>${done ? view.answer : "<" + (view.reward ?? "r")}</b></div>`;
  const status = view.event === "add" ? `dp[${view.total}] → dp[${view.destination}]`
    : view.event === "check" ? `total = ${view.total}`
      : view.event === "done" ? `${view.answer} 🏆` : t("Tổng có thể đạt", "Reachable totals");
  $("treeView").innerHTML = `<section class="mr3180-viz" aria-label="${t("Minh họa bài 3180", "Problem 3180 visualization")}" aria-live="polite">
    <header class="mr3180-head"><div><span>3180</span><strong>${t("Tổng thưởng", "Total reward")}</strong></div><b>🏆 ${done ? view.answer : "?"}</b></header>
    <div class="mr3180-rewards">${rewards}</div>
    ${action}
    <div class="mr3180-track-head"><span>DP · ${status}</span><small>${t("điểm sáng = đạt được", "dot = reachable")}</small></div>
    <div class="mr3180-track" style="--mr-count:${view.limit}">${cells}</div>
    <div class="mr3180-witness"><span>🪙</span><div>${path || `<b>${t("Chọn phần thưởng", "Pick rewards")}</b>`}</div><strong>${done ? `=${view.answer}` : ""}</strong></div>
  </section>`;
}
