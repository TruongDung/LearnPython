function renderSimilarEnds1750View(step) {
  const v = step.similarEnds1750View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const esc = escapeHtml;
  let previous = -1;
  const cells = v.cells.map(cell => {
    const gap = cell.index > previous + 1 ? `<span class="se1750-gap">… ${cell.index - previous - 1} …</span>` : "";
    previous = cell.index;
    const removed = cell.index < v.left || cell.index > v.right;
    const pointer = [cell.index === v.left && v.left <= v.right ? "L" : "", cell.index === v.right && v.left <= v.right ? "R" : ""].filter(Boolean).join("/");
    return `${gap}<span class="se1750-cell ${removed ? "removed" : "kept"} ${pointer ? "pointer" : ""} ${v.activeIndex === cell.index ? "active" : ""}"><small>${cell.index}</small><b>${cell.char}</b><em>${pointer || (removed ? "×" : "·")}</em></span>`;
  }).join("");
  $("treeView").innerHTML = `<section class="se1750-viz">
    <header class="se1750-heading"><div><small>1750 · TWO POINTERS</small><h3>${text("Xóa cùng chữ từ hai đầu", "Delete the same letter from both ends")}</h3><p>${text("Hai nhóm không chồng lấn; không cần cùng độ dài.", "The runs must not overlap; their lengths may differ.")}</p></div><div class="se1750-answer"><small>${v.answer === null ? text("đang còn", "remaining") : text("kết quả", "result")}</small><b>${v.remaining}</b></div></header>
    <section class="se1750-action"><small>${text("BƯỚC HIỆN TẠI", "CURRENT STEP")}</small><strong>${esc(pick(step.title))}</strong><p>${esc(pick(step.note))}</p></section>
    <section class="se1750-source"><header><strong>s · ${text("index gốc", "original indices")}</strong><span>L = ${v.left} · R = ${v.right}</span></header><div class="se1750-cells">${cells}</div>${v.length > 16 ? `<p>${text("Cửa sổ quanh L/R; … biểu thị các index ẩn.", "Windows around L/R; … indicates hidden indices.")}</p>` : ""}</section>
    <div class="se1750-legend"><span>× ${text("đã bỏ qua", "skipped")}</span><span>L/R ${text("vùng còn lại", "remaining range")}</span></div>
    <div class="se1750-progress"><span style="width:${v.left / v.length * 100}%"></span><span class="remaining" style="width:${v.remaining / v.length * 100}%"></span><span style="width:${(v.length - 1 - v.right) / v.length * 100}%"></span></div>
    <div class="se1750-counts"><span>${text("Bỏ trái", "Skip left")}: <b>${v.left}</b></span><span>${text("Còn lại", "Remain")}: <b>${v.remaining}</b></span><span>${text("Bỏ phải", "Skip right")}: <b>${v.length - 1 - v.right}</b></span></div>
    <section class="se1750-remaining"><small>${text("CHUỖI TRONG VÙNG [L, R]", "STRING WITHIN [L, R]")}</small><strong>${esc(v.remainingPreview || "∅")}</strong><span>${v.remaining === 0 ? text("Chuỗi rỗng → 0", "Empty string → 0") : text(`${v.remaining} ký tự`, `${v.remaining} letters`)}</span></section>
    <section class="se1750-history"><header><strong>${text("Các lượt đã hoàn tất", "Completed rounds")}</strong><span>${v.completedRounds}</span></header>${v.history.map(item => `<article><small>#${item.round} · '${item.char}'</small><span>${text("Trái", "Left")} ${item.leftCount} + ${text("phải", "right")} ${item.rightCount}</span><strong>${esc(item.preview || "∅")} <small>(${item.remaining})</small></strong></article>`).join("") || `<p>${text("Chưa xóa xong cặp nhóm nào.", "No pair of runs has been fully deleted yet.")}</p>`}${v.completedRounds > 4 ? `<p>${text("Hiển thị tối đa 4 lượt gần nhất.", "Showing at most the four most recent rounds.")}</p>` : ""}</section>
    ${v.omitted ? `<footer>${text("Dữ liệu lớn: rút gọn", "Large input: condensed")} ${v.omitted} ${text("bước. Kết quả cuối vẫn xử lý toàn bộ chuỗi.", "steps. The final result still processes the entire string.")}</footer>` : ""}
  </section>`;
}
