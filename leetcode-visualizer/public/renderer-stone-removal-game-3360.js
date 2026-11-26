function renderStoneRemovalGame3360View(step) {
  const host = $("treeView");
  const view = step.stoneRemoval3360View;
  if (!host || !view) return;

  const t = (vi, en) => lang === "vi" ? vi : en;
  const stone = (kind = "") => `<i class="sr3360-stone ${kind}" aria-hidden="true"></i>`;
  const turnRows = view.turns.map((turn, index) => {
    const active = view.line === 7 && index === view.turns.length - 1;
    return `<article class="sr3360-turn ${turn.player.toLowerCase()} ${active ? "active" : ""}">
      <b class="sr3360-player">${turn.player === "Alice" ? "A" : "B"}</b>
      <span class="sr3360-tokens">${Array.from({ length: turn.stones }, () => stone("taken")).join("")}</span>
      <strong>${turn.stones}</strong>
    </article>`;
  }).join("");
  const current = view.current
    ? `<article class="sr3360-turn current ${view.current.player.toLowerCase()} ${view.current.possible === false ? "failed" : ""}">
        <b class="sr3360-player">${view.current.player === "Alice" ? "A" : "B"}</b>
        <span class="sr3360-tokens">${Array.from({ length: view.current.stones }, (_, index) => stone(index < view.remaining ? "available" : "missing")).join("")}</span>
        <strong>${view.current.stones}</strong>
      </article>`
    : "";
  const pile = Array.from({ length: view.remaining }, () => stone("pile")).join("");
  const currentLine = view.current
    ? `${view.current.stones} ${view.current.possible === null ? "?" : view.current.possible ? "≤" : ">"} ${view.remaining}`
    : `n = ${view.remaining}`;
  const end = view.winner
    ? `<section class="sr3360-result ${view.winner.toLowerCase()}" aria-label="${t("Người thắng", "Winner")}">
        <span class="sr3360-crown" aria-hidden="true">★</span>
        <strong>${view.winner}</strong>
        <span>${t("thắng", "wins")}</span>
      </section>`
    : "";

  host.innerHTML = `<section class="sr3360-viz">
    <header class="sr3360-head">
      <span class="sr3360-problem">#3360</span>
      <div class="sr3360-counter"><small>n</small><strong>${view.remaining}</strong></div>
      <code class="sr3360-line">L${view.line} · ${currentLine}</code>
    </header>
    <div class="sr3360-pile" aria-label="${view.remaining} ${t("viên đá còn lại", "stones remaining")}">
      ${pile || `<b class="sr3360-empty">0</b>`}
    </div>
    <div class="sr3360-turns">${turnRows}${current}</div>
    <footer class="sr3360-legend">
      <span><b class="sr3360-player alice">A</b> Alice</span>
      <span><b class="sr3360-player bob">B</b> Bob</span>
      <span>${stone("taken")} ${t("đã lấy", "taken")}</span>
      <span>${stone("missing")} ${t("thiếu", "missing")}</span>
    </footer>
    ${end}
  </section>`;
}
