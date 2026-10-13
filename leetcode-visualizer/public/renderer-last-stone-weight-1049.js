function renderLastStoneWeight1049View(step) {
  const view = step.stoneWeight1049View;
  const vi = lang === "vi";
  const t = (vietnamese, english) => vi ? vietnamese : english;
  const shownSums = view.reachableSums.length <= 28
    ? view.reachableSums
    : [...new Set([
        ...view.reachableSums.slice(0, 10),
        ...view.reachableSums.filter((sum) => Math.abs(sum - view.bestSum) <= 3),
        ...view.reachableSums.slice(-10),
      ])].sort((a, b) => a - b);
  const stones = view.stones.map((stone) => `<span class="lsw1049-stone ${stone.state}">
    <small>${stone.index + 1}</small><strong>${stone.weight}</strong>
  </span>`).join("");
  const sums = shownSums.map((sum) => `<span class="lsw1049-sum${sum === view.target ? " target" : ""}${sum === view.bestSum ? " best" : ""}${view.changedSums.includes(sum) ? " fresh" : ""}">
    ${sum}
  </span>`).join("");
  const omittedCount = view.reachableSums.length - shownSums.length;
  const renderPile = (indices, sum, label, tone) => `<section class="lsw1049-pile ${tone}">
    <header><small>${label}</small><strong>${sum}</strong></header>
    <div>${indices.map((index) => `<span class="lsw1049-stone in-pile"><small>${index + 1}</small><strong>${view.stones[index].weight}</strong></span>`).join("")}</div>
  </section>`;
  const final = view.phase === "done";
  const groupBWeight = view.total - view.bestSum;

  $("treeView").innerHTML = `<section class="lsw1049-viz">
    <header class="lsw1049-heading">
      <div><small>1049 · ${t("CHIA HAI NHÓM", "SPLIT INTO TWO PILES")}</small><h3>${t("Đập đá thành hai nhóm cân bằng", "Balance the stones into two piles")}</h3></div>
      <div class="lsw1049-answer"><small>${t("ĐÁ CÒN LẠI", "LAST STONE")}</small><strong>${final ? view.answer : "?"}</strong></div>
    </header>
    <div class="lsw1049-step">${escapeHtml(pick(step.title))}</div>
    <section class="lsw1049-card">
      <header><strong>${t("CÁC VIÊN ĐÁ", "STONES")}</strong><span>Σ ${view.total}</span></header>
      <div class="lsw1049-stones">${stones}</div>
      <div class="lsw1049-key"><span><i class="processed"></i>${t("đã thử", "processed")}</span><span><i class="current"></i>${t("đang xét", "current")}</span><span><i class="waiting"></i>${t("chưa xét", "waiting")}</span></div>
    </section>
    <section class="lsw1049-card">
      <header><strong>${t("TỔNG CÓ THỂ TẠO", "REACHABLE SUBSET SUMS")}</strong><span>${t("mục tiêu", "target")} = ⌊${view.total}/2⌋ = ${view.target}</span></header>
      <div class="lsw1049-sums">${sums}${omittedCount > 0 ? `<span class="lsw1049-more">+${omittedCount}</span>` : ""}</div>
      <div class="lsw1049-key"><span><i class="best"></i>${t("gần nửa nhất", "closest to half")}</span><span><i class="fresh"></i>${t("mới đạt được", "new this turn")}</span></div>
    </section>
    ${final ? `<section class="lsw1049-balance">
      ${renderPile(view.bestStones, view.bestSum, t("NHÓM A", "PILE A"), "a")}
      <div class="lsw1049-smash"><span>⚖</span><small>${t("chênh lệch", "difference")}</small><strong>${view.answer}</strong></div>
      ${renderPile(view.otherStones, groupBWeight, t("NHÓM B", "PILE B"), "b")}
    </section>` : `<div class="lsw1049-equation">${view.bestSum} <span>↔</span> ${view.total - view.bestSum} <b>Δ ${view.total - 2 * view.bestSum}</b></div>`}
  </section>`;
}
