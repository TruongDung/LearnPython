function renderMaximizeSquares2897View(step) {
  const view = step.maximizeSquares2897View;
  if (!view) return;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const bits = Array.from({ length: view.width }, (_, i) => view.width - 1 - i);
  const counting = ["init", "count"].includes(view.phase);
  const maxStack = Math.max(1, ...view.counts, ...view.initialCounts);
  const height = maxStack * 9 + 10;
  const bank = bits.map(bit => {
    const capacity = counting ? view.counts[bit] : view.initialCounts[bit];
    const active = view.activeBit === bit || view.inputIndex !== null && ((view.nums[view.inputIndex] >>> bit) & 1);
    const units = Array.from({ length: Math.max(1, capacity) }, (_, i) => {
      const remaining = i < view.counts[bit];
      const transferring = remaining && view.phase === "attach" && view.activeBit === bit && i === view.counts[bit] - 1;
      return `<rect class="${remaining ? "remaining" : "used"}${transferring ? " transferring" : ""}" x="6" y="${height - (i + 1) * 9}" width="22" height="6" rx="2"/>`;
    }).join("");
    return `<div class="sq2897-column ${active ? "active" : ""}" data-bit="${bit}" aria-label="${t("Bit", "Bit")} ${bit}: ${view.counts[bit]} / ${capacity}"><small>2<sup>${bit}</sup></small><svg viewBox="0 0 34 ${height}" aria-hidden="true">${units}</svg><b>${view.counts[bit]}<span>/${capacity}</span></b></div>`;
  }).join("");
  const original = view.nums.map((num, index) => `<span class="sq2897-input-number ${index === view.inputIndex ? "active" : ""}"><small>${index}</small><b>${num}</b></span>`).join("");
  const word = view.current === null ? "" : `<section class="sq2897-current"><header><span>x${view.activeSlot + 1}/${view.k}</span><strong>${view.current}</strong></header><div>${bits.map(bit => `<span class="sq2897-bit ${((view.current >>> bit) & 1) ? "one" : ""} ${view.activeBit === bit ? "active" : ""}"><small>${bit}</small><b>${(view.current >>> bit) & 1}</b></span>`).join("")}</div></section>`;
  const selected = Array.from({ length: view.k }, (_, index) => {
    const item = view.selected[index];
    return `<div class="sq2897-selected ${item ? "done" : ""} ${index === view.activeSlot ? "active" : ""}"><small>x${index + 1}</small><strong>${item ? item.value : index === view.activeSlot ? view.current : "—"}</strong><span>${item ? `${item.value}² = ${item.square}` : "—"}</span></div>`;
  }).join("");
  const operation = view.phase === "init" && view.operation ? `<div class="sq2897-operation"><small>AND / OR</small><span>[${view.operation.before.join(", ")}]</span><i>→</i><strong>[${view.operation.after.join(", ")}]</strong><b>▰ = ▰</b></div>` : "";
  const transfer = view.activeBit === null ? "" : `<div class="sq2897-transfer">2<sup>${view.activeBit}</sup><i>↓</i><b>x${view.activeSlot + 1}</b></div>`;
  const equation = view.selected.length ? `<div class="sq2897-equation">${view.selected.map((item, index) => `${index ? "<i>+</i>" : ""}<span>${escapeHtml(item.square)}</span>`).join("")}<i>=</i><strong>${escapeHtml(view.rawSum)}</strong></div>` : "";
  $("treeView").innerHTML = `<section class="sq2897-viz" aria-label="${t("Mô phỏng gom bit và tối đa tổng bình phương", "Bit concentration and maximum square sum simulation")}">
    <header><div><small>#2897 · BIT + GREEDY</small><h3>Σ x²</h3></div><output>${view.answer}</output></header>
    <div class="sq2897-original" aria-label="nums">${original}</div>
    ${operation}
    <section class="sq2897-bank"><header><strong>${t("Kho bit 1", "Set-bit bank")}</strong><span>${counting ? `${view.inputIndex === null ? 0 : view.inputIndex + 1}/${view.nums.length}` : `${view.selected.length}/${view.k}`}</span></header><div>${bank}</div></section>
    ${transfer}${word}
    <div class="sq2897-numbers" aria-label="${t("k số được chọn", "k chosen numbers")}">${selected}</div>
    ${equation}
    <footer><span>▰ ${t("còn", "left")}</span><span>⬚ ${t("đã dùng", "used")}</span><span>mod 1,000,000,007</span>${view.omittedSteps ? `<span>${t("Trace rút gọn", "Compact trace")}</span>` : ""}</footer>
  </section>`;
}
