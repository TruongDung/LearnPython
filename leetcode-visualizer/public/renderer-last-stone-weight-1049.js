function renderLastStoneWeight1049View(step) {
  const view = step.stoneWeight1049View;
  const vi = lang === "vi";
  const t = (vietnamese, english) => vi ? vietnamese : english;
  const final = view.phase === "done";
  const currentStone = view.stoneIndex === null ? null : view.stones[view.stoneIndex];
  const groupBWeight = view.total - view.bestSum;
  const difference = Math.abs(groupBWeight - view.bestSum);
  const tilt = view.total === 0 ? 0 : Math.max(-7, Math.min(7, ((groupBWeight - view.bestSum) / view.total) * 12));

  const stone = (item, extraClass = "") => `<span
    class="lsw1049-stone ${item.state} ${extraClass}"
    aria-label="${t("Đá nặng", "Stone weight")} ${item.weight}"
  ><strong>${item.weight}</strong></span>`;

  const stones = view.stones.map((item) => stone(item)).join("");
  const leftPile = view.bestStones.map((index) => stone(view.stones[index], "in-pile chosen")).join("");
  const rightPile = view.otherStones.map((index) => stone(
    view.stones[index],
    `in-pile other${index >= view.processedCount ? " untested" : ""}`,
  )).join("");

  const chartWidth = 700;
  const chartLeft = 30;
  const chartRight = 670;
  const chartY = 70;
  const xFor = (sum) => chartLeft + (view.target === 0 ? 0 : (sum / view.target) * (chartRight - chartLeft));
  const labelSums = new Set([0, view.target, view.bestSum, ...view.changedSums]);
  const arcs = currentStone ? view.changedSums.slice(0, 14).map((sum, index) => {
    const from = sum - currentStone.weight;
    const x1 = xFor(from);
    const x2 = xFor(sum);
    const lift = Math.min(46, 16 + Math.abs(x2 - x1) * 0.15 + (index % 2) * 5);
    return `<path class="lsw1049-jump" d="M ${x1} ${chartY - 3} Q ${(x1 + x2) / 2} ${chartY - lift} ${x2} ${chartY - 3}">
      <title>${from} + ${currentStone.weight} = ${sum}</title>
    </path>`;
  }).join("") : "";
  const nodes = view.reachableSums.map((sum) => {
    const classes = [
      "lsw1049-dot",
      view.changedSums.includes(sum) ? "fresh" : "",
      sum === view.bestSum ? "best" : "",
      sum === view.target ? "target" : "",
    ].filter(Boolean).join(" ");
    const showLabel = view.target <= 24 || labelSums.has(sum);
    return `<g class="${classes}" transform="translate(${xFor(sum)} ${chartY})">
      <circle r="${sum === view.bestSum ? 9 : 6}"><title>${t("Tổng đạt được", "Reachable sum")}: ${sum}</title></circle>
      ${showLabel ? `<text y="22" text-anchor="middle">${sum}</text>` : ""}
    </g>`;
  }).join("");

  const activity = final
    ? `<span class="lsw1049-activity-mark">✓</span><strong>${t("Cân bằng nhất", "Best balance")}</strong>`
    : currentStone
      ? `<span class="lsw1049-mini-stone">${currentStone.weight}</span><span class="lsw1049-activity-arrow">→</span><strong>DP</strong>`
      : `<span class="lsw1049-activity-mark">◎</span><strong>${t("Tìm gần", "Aim for")} ${view.target}</strong>`;

  $("treeView").innerHTML = `<section class="lsw1049-viz" aria-label="${t("Minh hoạ chia đá thành hai nhóm", "Stone partition visualization")}">
    <header class="lsw1049-heading">
      <div class="lsw1049-title"><span>1049</span><h3>Last Stone Weight II</h3></div>
      <div class="lsw1049-answer ${final ? "is-final" : ""}" aria-label="${t("Đá còn lại", "Last stone")}">
        <span>Δ</span><strong>${final ? view.answer : "?"}</strong>
      </div>
    </header>

    <div class="lsw1049-stone-belt">
      <div class="lsw1049-stones">${stones}</div>
      <div class="lsw1049-total">Σ <strong>${view.total}</strong></div>
    </div>

    <div class="lsw1049-activity" aria-label="${escapeHtml(pick(step.title))}">${activity}</div>

    <section class="lsw1049-balance${final ? " is-final" : ""}" style="--lsw1049-tilt:${tilt.toFixed(2)}deg">
      <div class="lsw1049-beam" aria-hidden="true"><i></i></div>
      <section class="lsw1049-pile a" aria-label="${t("Nhóm A", "Pile A")}: ${view.bestSum}">
        <div class="lsw1049-pile-sum">${view.bestSum}</div>
        <div class="lsw1049-pile-stones">${leftPile || `<span class="lsw1049-empty">∅</span>`}</div>
      </section>
      <div class="lsw1049-difference" aria-label="${t("Chênh lệch", "Difference")} ${difference}">
        <span>Δ</span><strong>${difference}</strong>
      </div>
      <section class="lsw1049-pile b" aria-label="${t("Nhóm B", "Pile B")}: ${groupBWeight}">
        <div class="lsw1049-pile-sum">${groupBWeight}</div>
        <div class="lsw1049-pile-stones">${rightPile || `<span class="lsw1049-empty">∅</span>`}</div>
      </section>
    </section>

    <section class="lsw1049-sums" aria-label="${t("Các tổng có thể tạo", "Reachable subset sums")}">
      <div class="lsw1049-target"><span>0</span><strong>⌊Σ÷2⌋ = ${view.target}</strong></div>
      <svg viewBox="0 0 ${chartWidth} 104" role="img" aria-label="${t("Đường đua tổng con đến một nửa tổng", "Subset sums racing toward half of the total")}">
        <line class="lsw1049-track" x1="${chartLeft}" y1="${chartY}" x2="${chartRight}" y2="${chartY}"></line>
        <line class="lsw1049-finish" x1="${chartRight}" y1="18" x2="${chartRight}" y2="${chartY + 11}"></line>
        <path class="lsw1049-flag" d="M ${chartRight} 18 h-28 l8 9 -8 9 h28"></path>
        ${arcs}
        ${nodes}
      </svg>
    </section>
  </section>`;
}
