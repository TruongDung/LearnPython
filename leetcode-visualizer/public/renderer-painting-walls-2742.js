function renderPaintingWalls2742View(step) {
  const view = step.paintingWalls2742View;
  if (!view) return;
  const vi = lang === "vi";
  const t = (vn, en) => vi ? vn : en;
  const current = Number.isInteger(view.currentIndex) ? view.currentIndex : null;
  const done = view.event === "done";
  const wallCards = view.cost.map((price, index) => {
    const selected = done && (view.selectedMask & (1 << index));
    const status = index === current ? "is-current" : index < view.processedCount ? "is-seen" : "is-waiting";
    return `<div class="pw2742-job ${status}${selected ? " is-selected" : ""}">
      <div class="pw2742-brick" aria-hidden="true">▥</div>
      <b>#${index + 1}</b><span>💰 ${price}</span><small>⏱ ${view.time[index]}</small>
    </div>`;
  }).join("");

  const coverageBefore = Number.isInteger(view.painted) ? view.painted : 0;
  const coverageAfter = Number.isInteger(view.next) ? view.next : coverageBefore;
  const mural = view.cost.map((_, index) => {
    let role = "is-empty";
    let label = "";
    if (done) {
      const worker = view.mural[index]?.painter;
      role = worker === "paid" ? "is-paid" : worker === "free" ? "is-free" : "is-empty";
      label = worker === "paid" ? "💰" : worker === "free" ? "🎨" : "";
    } else if (index < coverageBefore) {
      role = "is-painted";
      label = "✓";
    } else if (view.event === "destination" || view.event === "update") {
      if (index < coverageAfter) {
        role = "is-preview";
        label = index === coverageBefore && current !== null ? "👷" : "🎨";
      }
    }
    return `<span class="pw2742-wall ${role}" title="${t("Tường", "Wall")} ${index + 1}">${label || index + 1}</span>`;
  }).join("");

  const dpCells = view.after.map((value, index) => {
    const prior = view.before[index];
    const changed = value !== prior;
    const reachable = value !== "∞";
    const state = [
      reachable ? "is-reachable" : "is-locked",
      index === view.painted ? "is-source" : "",
      index === view.next ? "is-destination" : "",
      changed ? "is-changed" : "",
      index === view.n ? "is-goal" : "",
    ].filter(Boolean).join(" ");
    return `<div class="pw2742-cell ${state}" title="dp[${index}] = ${value}">
      <small>${index}</small><b>${value === "∞" ? "∞" : `$${value}`}</b>
      ${changed ? `<i>← ${prior === "∞" ? "∞" : `$${prior}`}</i>` : ""}
    </div>`;
  }).join("");

  let action = "🎨";
  if (view.event === "capacity") action = `👷 + 🎨 → <b>${view.cover}</b>`;
  else if (view.event === "scan") action = `dp[${view.painted}]`;
  else if (view.event === "reachable") action = view.reachable ? `dp[${view.painted}] < ∞` : `dp[${view.painted}] = ∞`;
  else if (view.event === "skip") action = `∞ → skip`;
  else if (view.event === "destination") action = `min(${view.n}, ${view.painted} + ${view.cover}) = <b>${view.next}</b>`;
  else if (view.event === "update") action = `${view.before[view.painted] === "∞" ? "∞" : `$${view.before[view.painted]}`} + $${view.cost[current]} → <b>$${view.after[view.next]}</b>`;
  else if (view.event === "done") action = `✓ <b>$${view.answer}</b>`;
  else if (view.event === "job") action = `🧱 ${current + 1} · 💰 ${view.cost[current]} · ⏱ ${view.time[current]}`;
  else if (view.event === "seed") action = "dp[0] = $0";
  else if (view.event === "init") action = `dp[0…${view.n}] = ∞`;
  else if (view.event === "start") action = "🧱";
  else if (view.event === "size") action = `${view.n} 🧱`;

  const answer = view.answer === null ? "?" : `$${view.answer}`;
  const paintCount = done ? view.n : Math.min(coverageAfter, view.n);
  $("treeView").innerHTML = `<section class="pw2742-viz" aria-label="${t("Minh họa bài 2742", "Problem 2742 visualization")}" aria-live="polite">
    <header class="pw2742-head"><div><span>2742</span><strong>Painting the Walls</strong></div><b>💰 ${answer}</b></header>
    <div class="pw2742-jobs">${wallCards}</div>
    <div class="pw2742-action">${action}</div>
    <div class="pw2742-mural" aria-label="${t("Tường đã sơn", "Painted walls")}">
    <div class="pw2742-wall-row" style="--wall-count:${view.n}">${mural}</div>
      <div class="pw2742-wall-key"><span>👷 ${t("trả phí", "paid")}</span><span>🎨 ${t("miễn phí", "free")}</span><b>${paintCount}/${view.n}</b></div>
    </div>
    <div class="pw2742-dp-title"><span>DP · 🧱</span><small>${t("phủ được", "covered")}</small></div>
    <div class="pw2742-dp" style="--dp-count:${view.n + 1}">${dpCells}</div>
  </section>`;
}
