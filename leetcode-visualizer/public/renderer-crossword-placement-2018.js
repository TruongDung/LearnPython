"use strict";

function renderCrosswordPlacement2018View(step) {
  const view = step.crossword2018View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const activeKeyToIndex = new Map((view.slot?.cells || []).map((cell, index) => [`${cell.row},${cell.column}`, index]));
  const winning = view.phase === "success";
  const boardHtml = view.board.flatMap((row, rowIndex) => row.map((cell, columnIndex) => {
    const slotIndex = activeKeyToIndex.get(`${rowIndex},${columnIndex}`);
    const check = slotIndex === undefined ? null : view.checks[slotIndex];
    const classes = [cell === "#" ? "wall" : cell === " " ? "blank" : "letter", slotIndex !== undefined ? "active" : "", check?.state || "", winning && slotIndex !== undefined ? "winner" : ""].filter(Boolean).join(" ");
    const shown = cell === "#" ? "#" : cell === " " ? "" : escapeHtml(cell);
    const overlay = check && cell === " " ? `<small>${escapeHtml(check.expected)}</small>` : "";
    return `<div class="cw2018-cell ${classes}" aria-label="row ${rowIndex}, column ${columnIndex}"><span>${shown}</span>${overlay}<i>${rowIndex},${columnIndex}</i></div>`;
  })).join("");

  const phases = [
    ["1. Tách tại #", "1. Split at #"],
    ["2. Đúng độ dài", "2. Exact length"],
    ["3. Thử xuôi", "3. Try forward"],
    ["4. Thử ngược", "4. Try reverse"],
  ];
  const phaseIndex = view.phase === "scan" ? 0
    : view.phase === "length-reject" ? 1
      : view.orientation === "forward" ? 2
        : view.orientation === "reverse" || ["success", "failure"].includes(view.phase) ? 3 : 0;
  const phaseHtml = phases.map((labels, index) => `<span class="${index === phaseIndex ? "active" : ""}${index < phaseIndex ? " done" : ""}">${text(...labels)}</span>`).join("");

  const target = view.orientation === "reverse" ? [...view.word].reverse().join("") : view.word;
  const slotCells = view.slot
    ? view.slot.cells.map((cell, index) => {
      const check = view.checks[index];
      const state = check?.state || "unchecked";
      const value = cell.value === " " ? "□" : escapeHtml(cell.value);
      const expected = check ? escapeHtml(check.expected) : "·";
      return `<div class="cw2018-slot-cell ${state}"><small>${expected}</small><b>${value}</b><span>${index}</span></div>`;
    }).join("")
    : `<div class="cw2018-slot-empty">${text("Chọn một slot tối đa giữa hai biên #", "Choose a maximal slot between # boundaries")}</div>`;
  const slotLabel = view.slot
    ? `${view.slot.direction === "horizontal" ? "row" : "column"} ${view.slot.lineIndex} · len ${view.slot.cells.length}`
    : `${view.slotCount} slots`;
  const orientationLabel = view.orientation === "forward" ? `${view.word} →`
    : view.orientation === "reverse" ? `← ${[...view.word].reverse().join("")}` : "—";

  const checkedHtml = view.checked.length
    ? view.checked.slice(-9).map((entry) => `<li class="${entry.result}"><span>#${entry.id}</span><code>${entry.direction === "horizontal" ? "H" : "V"} · len ${entry.length}</code><b>${entry.result === "wrong-length" ? "len ≠" : entry.result === "conflict" ? "✕" : entry.result === "forward" ? "→ ✓" : "← ✓"}</b></li>`).join("")
    : `<li><span>—</span><em>${text("Chưa chốt slot", "No completed slot")}</em><b>—</b></li>`;
  const verdict = view.answer === null ? "?" : view.answer ? "TRUE" : "FALSE";

  $("treeView").innerHTML = `<section class="cw2018-viz" aria-label="${text("Mô phỏng đặt từ vào ô chữ", "Crossword placement simulation")}">
    <header class="cw2018-heading"><div><small>#2018 · MEDIUM · MATRIX + STRING</small><h3>${text("Slot phải vừa khít giữa các biên", "A slot must fit exactly between boundaries")}</h3></div><div class="cw2018-verdict ${view.answer === true ? "yes" : view.answer === false ? "no" : ""}"><small>${text("kết quả", "verdict")}</small><b>${verdict}</b></div></header>
    <nav class="cw2018-phases" aria-label="${text("Các bước thuật toán", "Algorithm stages")}">${phaseHtml}</nav>
    <div class="cw2018-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="cw2018-layout">
      <section class="cw2018-board-panel"><header><strong>${text("Bảng ô chữ", "Crossword board")}</strong><span>${view.rows} × ${view.columns}</span></header><div class="cw2018-board-wrap"><div class="cw2018-board" style="--cw-columns:${view.columns}">${boardHtml}</div></div><footer><span class="wall"># ${text("biên", "boundary")}</span><span class="blank">□ ${text("ô trống", "blank")}</span><span class="letter">a ${text("chữ cố định", "fixed letter")}</span></footer></section>
      <aside class="cw2018-side"><section class="cw2018-target"><small>word</small><div>${[...view.word].map((char) => `<b>${char}</b>`).join("")}</div><span>${orientationLabel}</span></section><section class="cw2018-checked"><header><strong>${text("Các slot đã loại", "Completed slots")}</strong><span>${view.checked.length}/${view.slotCount}</span></header><ol>${checkedHtml}</ol></section></aside>
    </div>
    <section class="cw2018-slot"><header><div><strong>${text("Slot đang xét", "Current slot")}</strong><span>${slotLabel}</span></div><code>${target}</code></header><div class="cw2018-slot-track"><i>#</i>${slotCells}<i>#</i></div><p>${text("Hai dấu # tượng trưng cho mép bảng hoặc ô bị chặn. Vì đây là slot tối đa, len(slot) = len(word) bảo đảm không còn ô trống thừa ở đầu/cuối.", "The two # symbols represent a board edge or blocked cell. Because this is a maximal slot, len(slot) = len(word) guarantees no extra blank before or after the word.")}</p></section>
    <details class="cw2018-proof"${view.phase === "success" || view.phase === "failure" ? " open" : ""}><summary>${text("Tại sao chỉ quét hàng + cột một lần?", "Why is one row + column scan enough?")}</summary><p>${text("Mọi cách đặt hợp lệ nằm trọn trong đúng một đoạn tối đa không chứa # của một hàng hoặc cột. Tách tất cả line tại # liệt kê mỗi đoạn đúng một lần; thử word và word đảo bao phủ cả bốn hướng.", "Every valid placement lies in exactly one maximal non-# segment of a row or column. Splitting every line at # enumerates each segment once; trying the word and its reverse covers all four directions.")}</p></details>
  </section>`;
}
