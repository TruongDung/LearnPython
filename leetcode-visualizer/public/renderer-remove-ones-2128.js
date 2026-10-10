"use strict";

function renderRemoveOnes2128View(step) {
  const view = step.removeOnes2128View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const flipColumns = new Set(view.columnFlips);
  const contradiction = new Set(view.contradiction);
  const phaseIndex = ["intro", "columns"].includes(view.phase) ? 0
    : view.phase === "compare" ? 1
      : ["same", "opposite"].includes(view.phase) ? 2 : 3;
  const phases = [
    ["1. Chuẩn hóa cột", "1. Normalize columns"],
    ["2. XOR từng hàng", "2. XOR each row"],
    ["3. Giữ hoặc lật hàng", "3. Keep or flip row"],
    ["4. Kết luận", "4. Decide"],
  ].map((labels, index) => `<span class="${index === phaseIndex ? "active" : ""}${index < phaseIndex ? " done" : ""}">${text(...labels)}</span>`).join("");

  const columnHeader = `<div class="ro2128-row ro2128-cols"><span></span>${Array.from({ length: view.columns }, (_, column) => `<b class="${flipColumns.has(column) ? "flip" : ""}"><small>${flipColumns.has(column) ? "↕" : "·"}</small>c${column}</b>`).join("")}</div>`;
  const originalRows = view.original.map((row, rowIndex) => `<div class="ro2128-row ${rowIndex === view.activeRow ? "active" : ""}"><strong>r${rowIndex}</strong>${row.map((bit, column) => `<span class="bit-${bit}${rowIndex === view.activeRow && contradiction.has(column) ? " contradiction" : ""}">${bit}</span>`).join("")}</div>`).join("");
  const stateLabel = (state) => ({
    pending: text("chờ", "pending"),
    same: text("giống", "same"),
    opposite: text("bù bit", "opposite"),
    invalid: text("mâu thuẫn", "invalid"),
  }[state]);
  const normalizedRows = view.revealed.map((row, rowIndex) => {
    const state = view.rowStates[rowIndex];
    return `<div class="ro2128-normal-row ${state} ${rowIndex === view.activeRow ? "active" : ""}"><strong>r${rowIndex}</strong><div class="ro2128-bits">${row.map((bit, column) => `<span class="${bit === null ? "hidden-bit" : `bit-${bit}`}${rowIndex === view.activeRow && contradiction.has(column) ? " contradiction" : ""}">${bit === null ? "·" : bit}</span>`).join("")}</div><em>${stateLabel(state)}</em><b>${state === "opposite" ? text("lật hàng ↻", "flip row ↻") : state === "same" ? text("giữ", "keep") : state === "invalid" ? "✕" : "…"}</b></div>`;
  }).join("");
  const rowReceipts = view.rowStates.map((state, rowIndex) => `<li class="${state}${rowIndex === view.activeRow ? " active" : ""}"><span>r${rowIndex}</span><code>${view.normalized[rowIndex].join("")}</code><b>${stateLabel(state)}</b><em>${state === "opposite" ? "flip" : state === "same" ? "keep" : state === "invalid" ? "stop" : "—"}</em></li>`).join("");
  const firstPattern = view.first.map((bit, index) => `<span class="bit-${bit}"><small>c${index}</small><b>${bit}</b></span>`).join("");
  let verdict = `<p>${text("Mỗi hàng sau XOR phải chỉ chứa một loại bit.", "Every XOR row must contain only one bit value.")}</p>`;
  if (view.phase === "success") verdict = `<div class="ro2128-verdict success"><b>TRUE</b><span>${text("Lật cột", "Flip columns")} [${view.columnFlips.join(", ") || "—"}]</span><span>${text("Lật hàng", "Flip rows")} [${view.rowFlips.join(", ") || "—"}]</span></div>`;
  if (["invalid", "failure"].includes(view.phase)) {
    const row = view.activeRow;
    verdict = `<div class="ro2128-verdict failure"><b>FALSE</b><span>row ${row}: XOR = ${view.normalized[row].join("")}</span><span>${text("Có cả 0 và 1 → một row flip không thể sửa", "Contains both 0 and 1 → one row flip cannot fix it")}</span></div>`;
  }

  $("treeView").innerHTML = `<section class="ro2128-viz" aria-label="${text("Mô phỏng bài 2128", "Problem 2128 simulation")}">
    <header class="ro2128-heading"><div><small>#2128 · MEDIUM · MATRIX + XOR</small><h3>${text("Chuẩn hóa theo hàng đầu", "Normalize against the first row")}</h3></div><div class="${view.answer === true ? "success" : view.answer === false ? "failure" : ""}"><small>${text("có thể về toàn 0?", "can become all zero?")}</small><b>${view.answer === null ? "?" : view.answer ? "TRUE" : "FALSE"}</b></div></header>
    <nav class="ro2128-phases" aria-label="${text("Các bước thuật toán", "Algorithm stages")}">${phases}</nav>
    <div class="ro2128-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <section class="ro2128-pattern"><header><strong>first row</strong><code>column mask</code></header><div>${firstPattern}</div><p>${text("Bit 1 ⇒ lật cột đó. Sau bước này hàng đầu chắc chắn thành", "Bit 1 ⇒ flip that column. The first row then becomes")} <code>${"0".repeat(view.columns)}</code>.</p></section>
    <div class="ro2128-workspace">
      <section class="ro2128-matrix-card"><header><strong>${text("Ma trận gốc", "Original matrix")}</strong><span>↕ = column flip</span></header><div class="ro2128-matrix" style="--ro-cols:${view.columns}">${columnHeader}${originalRows}</div></section>
      <div class="ro2128-xor-arrow"><b>⊕</b><code>first</code></div>
      <section class="ro2128-matrix-card"><header><strong>row ⊕ first</strong><span>${text("chỉ 000… hoặc 111…", "only 000… or 111…")}</span></header><div class="ro2128-normalized" style="--ro-cols:${view.columns}">${normalizedRows}</div></section>
    </div>
    <div class="ro2128-bottom"><section class="ro2128-receipts"><header><strong>${text("Quyết định theo hàng", "Per-row decisions")}</strong><span>O(m · n)</span></header><ol>${rowReceipts}</ol></section><section class="ro2128-result"><header><strong>${text("Kết luận", "Verdict")}</strong></header>${verdict}</section></div>
    <details class="ro2128-proof"${view.answer !== null ? " open" : ""}><summary>${text("Vì sao điều kiện giống hoặc bù bit là đủ?", "Why is equal-or-complement sufficient?")}</summary><p>${text("Sau khi dùng first để lật cột, hàng i biến thành grid[i][j] XOR first[j]. Nếu kết quả toàn 0 thì giữ hàng; nếu toàn 1 thì lật hàng. Một hàng trộn hai giá trị không thể được biến thành toàn 0 bằng đúng một lựa chọn giữ/lật.", "After using first to flip columns, row i becomes grid[i][j] XOR first[j]. Keep an all-zero row and flip an all-one row. A mixed row cannot become all zero under the single keep-or-flip choice.")}</p></details>
  </section>`;
}
