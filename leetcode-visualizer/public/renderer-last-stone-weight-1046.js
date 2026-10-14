function renderLastStoneWeight1046View(step) {
  const view = step.lastStoneWeight1046View;
  const vi = lang === "vi";
  const t = (vietnamese, english) => vi ? vietnamese : english;
  const final = view.phase === "done";
  const stones = view.heap.map((stone, index) => `<span class="lsw1046-stone${index === 0 ? " is-heaviest" : ""}${stone.highlighted ? " is-active" : ""}">
    ${index === 0 ? `<i aria-hidden="true">★</i>` : ""}
    <strong>${stone.weight}</strong>
  </span>`).join("");
  const collision = view.clash;
  let action = "";
  if (collision) {
    const destroyed = collision.difference === 0;
    action = `<div class="lsw1046-clash${destroyed ? " is-destroyed" : ""}">
      <span class="lsw1046-stone is-fighter"><strong>${collision.x}</strong></span>
      <span class="lsw1046-impact" aria-hidden="true">⚒</span>
      <span class="lsw1046-stone is-fighter"><strong>${collision.y}</strong></span>
      <span class="lsw1046-result">${collision.difference === null ? "?" : destroyed ? "× 2" : `→ ${collision.difference}`}</span>
    </div>`;
  } else if (view.phase === "pick") {
    action = `<div class="lsw1046-picked"><span class="lsw1046-stone is-fighter"><strong>${view.picked}</strong></span><span>${t("được lấy ra", "picked")}<b>${view.role}</b></span></div>`;
  } else if (final) {
    action = `<div class="lsw1046-final-stone">${view.answer ? `<span class="lsw1046-stone is-fighter"><strong>${view.answer}</strong></span>` : `<span class="lsw1046-empty-stone">∅</span>`}<span>${t("Còn lại", "Remaining")}</span></div>`;
  } else {
    action = `<div class="lsw1046-hint" aria-hidden="true"><span>⬇</span><span>⚒</span><span>⬇</span></div>`;
  }

  $("treeView").innerHTML = `<section class="lsw1046-viz" aria-label="${t("Minh họa đập đá", "Stone smashing visualization")}">
    <header class="lsw1046-heading">
      <div class="lsw1046-title"><span>1046</span><h3>Last Stone Weight</h3></div>
      <div class="lsw1046-answer${final ? " is-final" : ""}"><small>${t("ĐÁ CUỐI", "LAST STONE")}</small><strong>${final ? view.answer : "?"}</strong></div>
    </header>
    <div class="lsw1046-scene${collision ? " is-smashing" : ""}">
      <div class="lsw1046-pile" aria-label="${t("Đá trong heap", "Stones in heap")}: ${view.heap.length}">
        <div class="lsw1046-pile-label">${t("MAX-HEAP", "MAX-HEAP")} <span>${view.heap.length}</span></div>
        <div class="lsw1046-stones">${stones || `<span class="lsw1046-empty-stone">∅</span>`}</div>
      </div>
      <div class="lsw1046-action">${action}</div>
    </div>
  </section>`;
}
