function renderOnesAndZeroes474View(step) {
  const view = step.onesZeros474View;
  const vi = lang === "vi";
  const text = (vietnamese, english) => vi ? vietnamese : english;
  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
  const active = Number.isInteger(view.activeIndex) ? view.strings[view.activeIndex] : null;
  const maxDp = view.dp.reduce(
    (maximum, row) => row.reduce((rowMaximum, count) => Math.max(rowMaximum, count), maximum),
    1,
  );
  const strings = view.strings.map((item) => {
    const state = view.final || item.index < (view.activeIndex ?? -1)
      ? "done"
      : item.index === view.activeIndex ? "active" : "";
    const bits = [...item.text].map((bit) => {
      const tone = bit === "0" ? "bit-0" : bit === "1" ? "bit-1" : "bit-other";
      return `<i class="bit ${tone}">${escape(bit)}</i>`;
    }).join("");
    return `<div class="oz474-string ${state}">
      <small>#${item.index + 1}</small><div class="oz474-bits">${bits || `<i class="oz474-empty">∅</i>`}</div>
      <b><span class="zero">0×${item.zeros}</span><span class="one">1×${item.ones}</span></b>
    </div>`;
  }).join("");
  const rows = view.dp.map((row, z) => `<div class="oz474-row">
    <strong class="oz474-row-label" title="${text("số 0 tối đa", "zeroes available")}">${z}<small>0</small></strong>
    ${row.map((count, o) => {
      const destination = z === view.z && o === view.o;
      const source = z === view.sourceZ && o === view.sourceO;
      const winner = destination && view.phase === "update" && view.take > view.skip;
      const intensity = Math.round((count / maxDp) * 30);
      return `<span class="oz474-cell${destination ? " destination" : ""}${source ? " source" : ""}${winner ? " winner" : ""}" style="--oz-fill:${intensity}%" title="${text("Tối đa", "Max")} ${count} ${text("chuỗi với", "strings with")} ${z}×0, ${o}×1">
        <small>${count}</small>
      </span>`;
    }).join("")}
  </div>`).join("");
  const columnLabels = `<div class="oz474-row oz474-column-labels"><strong class="oz474-row-label">${text("0 ↓ / 1 →", "0 ↓ / 1 →")}</strong>
    ${Array.from({ length: view.n + 1 }, (_, o) => `<strong class="oz474-col-label">${o}</strong>`).join("")}
  </div>`;
  const comparison = view.phase === "compare" || view.phase === "update"
    ? `<section class="oz474-choice">
        <div class="oz474-choice-card skip${view.skip >= view.take ? " chosen" : ""}">
          <small>${text("Không lấy", "SKIP")}</small><b>${view.skip}</b>
        </div>
        <span class="oz474-or">↔</span>
        <div class="oz474-choice-card take${view.take > view.skip ? " chosen" : ""}">
          <small>${text("Lấy", "TAKE")} · dp[${view.sourceZ}][${view.sourceO}] + 1</small><b>${view.takeFrom} + 1 = ${view.take}</b>
        </div>
      </section>`
    : active
      ? `<div class="oz474-cost">${text("Tốn chỗ", "COSTS")} <b class="zero">0×${active.zeros}</b> <b class="one">1×${active.ones}</b>
          <span>${active.zeros <= view.m && active.ones <= view.n ? "✓" : "×"}</span>
        </div>`
      : "";

  $("treeView").innerHTML = `<section class="oz474-viz" role="region" aria-label="${text("Hình minh họa Ones and Zeroes", "Ones and Zeroes visual explanation")}">
    <header class="oz474-header">
      <div><small>#474 · ${text("CHỌN CHUỖI 0/1", "PICK BINARY STRINGS")}</small><h3>${text("Cái túi có 2 ngăn", "A backpack with two pockets")}</h3></div>
      <strong class="oz474-answer">${view.final ? view.answer : "?"}</strong>
    </header>
    <div class="oz474-capacity">
      <div><span class="zero">0️⃣</span><strong>${view.m}</strong><small>${text("số 0 tối đa", "zero limit")}</small></div>
      <i>＋</i>
      <div><span class="one">1️⃣</span><strong>${view.n}</strong><small>${text("số 1 tối đa", "one limit")}</small></div>
    </div>
    <section class="oz474-card oz474-items">
      <header><strong>${text("THẺ CHUỖI", "STRING CARDS")}</strong><span>${view.strings.length}</span></header>
      <div class="oz474-string-list">${strings}</div>
    </section>
    ${comparison}
    <section class="oz474-card oz474-table-card">
      <header><strong>${text("SỐ CHUỖI TỐI ĐA", "MAX STRINGS")}</strong><span>${text("ô sáng = đang xét", "glow = current cell")}</span></header>
      <div class="oz474-table-scroll"><div class="oz474-table">${columnLabels}${rows}</div></div>
      <div class="oz474-legend"><span class="source-key">● ${text("ô nguồn", "source budget")}</span><span class="destination-key">● ${text("ngân sách đang xét", "current budget")}</span></div>
    </section>
  </section>`;
}
