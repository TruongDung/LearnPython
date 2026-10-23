function renderDesignExcel631View(step) {
  const v = step.excel631View;
  if (!v) return;
  const vi = lang === "vi";
  const t = (a, b) => vi ? a : b;
  const host = $("treeView");
  const cells = new Map(v.cells.map((cell) => [cell.cell, cell]));
  const refs = new Set(v.sourceCells);
  const affected = new Set(v.affected);
  const active = v.activeCell;
  const grid = `<div class="ex631-grid" style="--cols:${v.width}"><span class="corner"></span>${v.cols.map((col) => `<b class="col-head">${col}</b>`).join("")}${v.rows.map((row) => `<b class="row-head">${row}</b>${v.cols.map((col) => {
    const key = `${col}${row}`; const cell = cells.get(key); const formula = cell.formula.length > 0;
    const klass = ["cell", formula ? "formula" : "", key === active ? "active" : "", refs.has(key) ? "source" : "", affected.has(key) ? "affected" : ""].filter(Boolean).join(" ");
    const display = formula ? `<i>Σ</i><strong>${cell.value}</strong>` : cell.stored === null ? `<span>·</span>` : `<strong>${cell.stored}</strong>`;
    return `<div class="${klass}" aria-label="${key}: ${formula ? "formula" : "value"} ${cell.value}"><small>${key}</small>${display}</div>`;
  }).join("")}`).join("")}</div>`;
  const formulaCell = cells.get(active);
  const formulaText = formulaCell?.formula.length
    ? `Σ(${formulaCell.formula.map(({ ref, count }) => `${ref}${count > 1 ? ` ×${count}` : ""}`).join(", ")})`
    : formulaCell?.stored === null || !formulaCell ? "—" : String(formulaCell.stored);
  const links = v.edges.map(({ from, to, count }) => `<span class="edge ${to === v.currentOp?.cell && refs.has(from) ? "hot" : ""}"><b>${from}</b><i>→</i><strong>${to}</strong>${count > 1 ? `<small>×${count}</small>` : ""}</span>`).join("") || `<span class="empty">${t("Chưa có công thức", "No formulas yet")}</span>`;
  const op = v.currentOp ? v.currentOp.text : "";
  const outputs = v.outputs.map((item) => `<span>${item.type === "get" ? "GET" : "Σ"} ${item.cell} <b>${item.value}</b></span>`).join("");
  host.innerHTML = `<section class="ex631-viz" aria-label="${t("Bảng Excel và phụ thuộc công thức", "Excel sheet and formula dependencies")}" aria-live="polite">
    <header><div><span>631</span><b>📊 ${t("Ô → công thức", "Cells → formulas")}</b></div><strong>${v.height}×${v.width}</strong></header>
    <div class="formula-bar"><small>fx</small><b>${active || "—"}</b><span>${formulaText}</span><strong>${formulaCell?.value ?? 0}</strong></div>
    ${grid}
    <div class="flow">${links}</div>
    <div class="op-row"><span class="op-icon">${v.currentOp?.type === "set" ? "✍️" : v.currentOp?.type === "sum" ? "Σ" : v.currentOp?.type === "get" ? "👁" : "📄"}</span><b>${op || t("Bảng trống", "Empty sheet")}</b></div>
    ${outputs ? `<footer>${outputs}</footer>` : ""}
  </section>`;
}
