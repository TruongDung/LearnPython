function renderSumPower3082View(step) {
  const view = step.sumPower3082View;
  if (!view) return;
  const vi = lang === "vi";
  const t = (vn, en) => vi ? vn : en;
  const current = Number.isInteger(view.itemIndex) ? view.itemIndex : null;
  const done = view.event === "done";
  const tiles = view.nums.map((value, index) => `<span class="sp3082-num ${index === current ? "is-current" : index < view.processedCount ? "is-seen" : ""}">${value}</span>`).join("");
  const cells = view.after.map((value, sum) => {
    const before = view.before[sum];
    const changed = value !== before;
    const classes = [
      sum === view.sum ? "is-source" : "",
      sum === view.changedSum ? "is-destination" : "",
      changed ? "is-changed" : "",
      sum === view.k ? "is-goal" : "",
      value ? "is-live" : "is-empty",
    ].filter(Boolean).join(" ");
    return `<div class="sp3082-cell ${classes}"><small>${sum}</small><b>${value}</b>${changed ? `<i>${before}→${value}</i>` : ""}</div>`;
  }).join("");
  const event = view.event;
  const showBranches = ["skip", "check", "pick"].includes(event);
  const pickOk = Number.isInteger(view.sourceDest);
  const branch = `<div class="sp3082-branches ${showBranches ? "is-active" : ""}">
    <div class="sp3082-branch skip ${event === "skip" ? "is-hot" : ""}"><span class="sp3082-icon">${event === "skip" ? "↗ ↘" : "×2"}</span><b>${t("Ngoài tổng", "Outside sum")}</b><small>${t("2 cách", "2 ways")}</small></div>
    <div class="sp3082-fork">${current === null ? "✦" : view.x}</div>
    <div class="sp3082-branch pick ${event === "pick" ? "is-hot" : ""} ${!pickOk && event === "check" ? "is-closed" : ""}"><span class="sp3082-icon">${pickOk ? `＋${view.x}` : "⊘"}</span><b>${t("Trong tổng", "In sum")}</b><small>${pickOk ? `→ ${view.sourceDest}` : t("vượt k", "over k")}</small></div>
  </div>`;
  const active = Number.isInteger(view.sum) ? `<div class="sp3082-current"><span>${t("Nguồn", "From")}</span><b>dp[${view.sum}] = ${view.sourceCount}</b>${Number.isInteger(view.sourceDest) ? `<span class="sp3082-arrow">→</span><b>dp[${view.sourceDest}]</b>` : ""}</div>` : "";
  const answer = done ? view.answer : "· · ·";
  const strip = `<div class="sp3082-strip">${tiles}</div>`;
  $("treeView").innerHTML = `<section class="sp3082-viz" aria-label="${t("Minh họa bài 3082", "Problem 3082 visualization")}" aria-live="polite">
    <header class="sp3082-head"><div><span>3082</span><strong>${t("Tổng sức mạnh", "Sum of powers")}</strong></div><b>Σ ${answer}</b></header>
    ${strip}
    ${active}
    ${branch}
    <div class="sp3082-dp-head"><span>DP · ${t("tổng", "sum")}</span><small>k = ${view.k}</small></div>
    <div class="sp3082-dp" style="--sp-count:${view.k + 1}">${cells}</div>
  </section>`;
}
