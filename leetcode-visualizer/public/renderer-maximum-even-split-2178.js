function renderMaximumEvenSplit2178View(step) {
  const view = step.maximumEvenSplit2178View;
  const vi = lang === "vi";
  const t = (vietnamese, english) => vi ? vietnamese : english;
  const final = view.phase === "done";
  const stone = (value, extraClass = "") => `<span class="mes2178-stone ${extraClass}"><strong>${value}</strong></span>`;

  let action = "";
  if (view.phase === "add" && view.added) {
    const added = view.added;
    const shownCount = Math.min(added.count, 7);
    const newStones = Array.from({ length: shownCount }, (_, index) => stone(added.start + index * 2, "is-new")).join("");
    const more = added.count > shownCount ? `<span class="mes2178-more">+${added.count - shownCount}</span>` : "";
    action = `<div class="mes2178-action-pieces">${newStones}${more}<span class="mes2178-arrow" aria-hidden="true">↓</span></div>`;
  } else if (view.phase === "balance" && view.adjustment) {
    action = `<div class="mes2178-balance-piece">
      ${stone(view.adjustment.before)}<span class="mes2178-plus">+</span>${stone(view.adjustment.added, "is-remainder")}
      <span class="mes2178-arrow" aria-hidden="true">→</span>${stone(view.adjustment.after, "is-new")}
    </div>`;
  } else if (final) {
    action = `<span class="mes2178-done-icon" aria-hidden="true">✓</span>`;
  } else {
    action = `<span class="mes2178-start-icon" aria-hidden="true">↓</span>`;
  }

  const previewStones = view.preview.map((value) => stone(value)).join("");
  const answerText = final ? view.answer.join(", ") : "";

  $("treeView").innerHTML = `<section class="mes2178-viz" aria-label="${t("Minh họa chia tổng thành số chẵn", "Even-sum split visualization")}">
    <header class="mes2178-heading">
      <div class="mes2178-title"><span>2178</span><h3>${t("Chia thành số chẵn", "Split into even numbers")}</h3></div>
      <div class="mes2178-total"><span>${t("TỔNG", "SUM")}</span><strong>${view.total}</strong></div>
    </header>
    <div class="mes2178-scene">
      <div class="mes2178-remaining">
        <span class="mes2178-caption">${t("CÒN LẠI", "LEFT TO SPLIT")}</span>
        <div class="mes2178-bank"><strong>${view.remaining}</strong><span>●</span></div>
      </div>
      <div class="mes2178-action" aria-label="${escapeHtml(pick(step.title))}">${action}</div>
      <div class="mes2178-parts">
        <div class="mes2178-caption">${t("CÁC PHẦN", "EVEN PARTS")} <b>${view.count}</b></div>
        <div class="mes2178-stones">${previewStones || `<span class="mes2178-empty">∅</span>`}${view.omitted ? `<span class="mes2178-more">… +${view.omitted}</span>` : ""}</div>
      </div>
    </div>
    ${final ? `<div class="mes2178-equation"><span>${view.total}</span><i>=</i><strong>${answerText || "∅"}</strong></div>` : ""}
  </section>`;
}
