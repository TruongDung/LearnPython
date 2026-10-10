"use strict";

function renderFindReplace833View(step) {
  const view = step.findReplace833View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const active = view.activeOperation === null ? null : view.operations[view.activeOperation];
  const activeRange = new Set(view.activeRange);
  const acceptedOwners = new Map();
  view.operations.filter((operation) => operation.status === "accepted").forEach((operation) => {
    for (let offset = 0; offset < operation.source.length; offset++) acceptedOwners.set(operation.index + offset, operation.order);
  });
  const cursorIndex = view.phase === "copy" ? Math.max(0, view.cursor - 1)
    : view.phase === "replace" && active ? active.index : view.cursor;
  const originalCells = [...view.s].map((char, index) => {
    const classes = ["fr833-char"];
    if (activeRange.has(index)) classes.push("active");
    if (acceptedOwners.has(index)) classes.push("accepted");
    if (index === cursorIndex && ["scan-start", "copy", "replace"].includes(view.phase)) classes.push("cursor");
    return `<span class="${classes.join(" ")}"><small>${index}</small><b>${escapeHtml(char)}</b><em>${index === cursorIndex && ["scan-start", "copy", "replace"].includes(view.phase) ? "i" : acceptedOwners.has(index) ? `R${acceptedOwners.get(index) + 1}` : ""}</em></span>`;
  }).join("");
  const operations = view.operations.map((operation, index) => {
    const classes = ["fr833-operation", operation.status, index === view.activeOperation ? "active" : ""].filter(Boolean).join(" ");
    const status = operation.status === "accepted" ? text("khớp", "match") : operation.status === "rejected" ? text("bỏ", "skip") : text("chờ", "pending");
    return `<article class="${classes}"><header><strong>R${index + 1} · @${operation.index}</strong><span>${status}</span></header><div><code>${escapeHtml(operation.source)}</code><i>→</i><code>${escapeHtml(operation.target)}</code></div><footer>${text("đọc", "read")} “${escapeHtml(operation.observed)}”</footer></article>`;
  }).join("");
  let comparison = `<p>${text("Chọn một replacement để đối chiếu source với chuỗi gốc.", "Select a replacement to compare its source with the original string.")}</p>`;
  if (active) {
    const length = Math.max(active.source.length, active.observed.length);
    const pairs = Array.from({ length }, (_, offset) => {
      const expected = active.source[offset] ?? "∅";
      const actual = active.observed[offset] ?? "∅";
      const matches = expected === actual;
      return `<span class="${matches ? "match" : "mismatch"}"><small>@${active.index + offset}</small><b>${escapeHtml(expected)}</b><i>${matches ? "=" : "≠"}</i><b>${escapeHtml(actual)}</b></span>`;
    }).join("");
    comparison = `<div class="fr833-compare-row">${pairs}</div><p><code>s.startswith("${escapeHtml(active.source)}", ${active.index})</code> = <b class="${active.status}">${active.status === "accepted" ? "True" : active.status === "rejected" ? "False" : "?"}</b></p>`;
  }
  const chunks = view.chunks.length
    ? view.chunks.map((chunk, index) => `<span class="${chunk.kind}"><small>#${index + 1} · [${chunk.start},${chunk.end})</small><b>${escapeHtml(chunk.text)}</b><em>${chunk.kind === "replace" ? `${escapeHtml(chunk.source)} → target` : text("copy", "copy")}</em></span>`).join("")
    : `<p>${text("Output chưa có chunk nào.", "The output has no chunks yet.")}</p>`;
  const phaseIndex = ["intro", "check", "accept", "reject"].includes(view.phase) ? (view.phase === "intro" ? 0 : 1)
    : ["scan-start", "copy", "replace"].includes(view.phase) ? 2 : 3;
  const phases = [
    ["1. Giữ chuỗi gốc", "1. Keep original"],
    ["2. Xác nhận source", "2. Validate sources"],
    ["3. Quét & tạo chunk", "3. Scan & make chunks"],
    ["4. Join kết quả", "4. Join result"],
  ].map((labels, index) => `<span class="${index === phaseIndex ? "active" : ""}${index < phaseIndex ? " done" : ""}">${text(...labels)}</span>`).join("");
  const validCount = view.operations.filter((operation) => operation.status === "accepted").length;

  $("treeView").innerHTML = `<section class="fr833-viz" aria-label="${text("Mô phỏng bài 833", "Problem 833 simulation")}">
    <header class="fr833-heading"><div><small>#833 · MEDIUM · STRING + SIMULATION</small><h3>${text("Thay thế đồng thời, index không dịch", "Simultaneous replacement without index drift")}</h3></div><div class="${view.answer !== null ? "done" : ""}"><small>${text("kết quả hiện tại", "current result")}</small><b>${escapeHtml((view.answer ?? view.preview) || "∅")}</b></div></header>
    <nav class="fr833-phases" aria-label="${text("Các bước thuật toán", "Algorithm stages")}">${phases}</nav>
    <div class="fr833-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <section class="fr833-original"><header><strong>${text("CHUỖI GỐC — index cố định", "ORIGINAL STRING — fixed indices")}</strong><span>${view.s.length} chars · ${validCount}/${view.operations.length} valid</span></header><div class="fr833-char-scroll"><div class="fr833-char-row">${originalCells}</div></div></section>
    <div class="fr833-middle"><section class="fr833-operations"><header><strong>${text("DANH SÁCH REPLACEMENT", "REPLACEMENT LIST")}</strong><span>${text("kiểm tra trên s gốc", "checked against original s")}</span></header><div>${operations}</div></section><section class="fr833-comparison"><header><strong>source vs original</strong><span>startswith</span></header>${comparison}</section></div>
    <section class="fr833-output"><header><strong>${text("OUTPUT BUILDER", "OUTPUT BUILDER")}</strong><span>cursor i = ${view.cursor}</span></header><div class="fr833-chunks">${chunks}</div><footer><small>${text("preview", "preview")}</small><code>${escapeHtml(view.preview || "∅")}</code></footer></section>
    <details class="fr833-proof"${view.phase === "answer" ? " open" : ""}><summary>${text("Vì sao không sửa trực tiếp từ trái sang phải?", "Why not mutate the string from left to right?")}</summary><div><article><b>${text("Sai", "Wrong")}</b><code>replace s ngay</code><p>${text("Target dài/ngắn khác source sẽ làm mọi index phía sau bị dịch.", "A target with a different length shifts every later index.")}</p></article><article><b>${text("Đúng", "Correct")}</b><code>validate → scan → join</code><p>${text("Mọi match dùng index của s gốc; output chỉ được tạo sau khi quyết định xong.", "Every match uses original-s indices; output is built only after validation.")}</p></article></div></details>
  </section>`;
}
