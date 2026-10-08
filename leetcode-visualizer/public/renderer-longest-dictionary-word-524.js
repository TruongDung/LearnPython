function renderDictionary524View(step) {
  const v = step.dictionary524View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const esc = escapeHtml;
  const done = v.phase === "done";
  const ready = !["init", "candidate"].includes(v.phase);
  const kept = new Set(v.matches);
  const strip = (value, pointer, source) => {
    if (!value) return `<p class="ldw524-empty">${done ? text('Không có từ hợp lệ → trả ""', 'No valid word → return ""') : text("Chọn một từ trong dictionary để bắt đầu.", "Select a dictionary word to begin.")}</p>`;
    const center = !ready ? 0 : done && source ? (v.matches[0] ?? 0) : Math.min(pointer, value.length - 1);
    const start = Math.max(0, Math.min(center - 4, value.length - 10));
    const end = Math.min(value.length, start + 10);
    let html = start > 0 ? '<span class="ldw524-dots">…</span>' : "";
    for (let k = start; k < end; k++) {
      const matched = ready && (source ? kept.has(k) : k < v.j);
      const active = ready && !done && k === pointer;
      const skipped = ready && source && !matched && (done || k < v.i);
      html += `<span class="ldw524-cell ${matched ? "kept" : ""} ${active ? "active" : ""} ${skipped ? "skipped" : ""}"><small>${k}</small><b>${esc(value[k])}</b><em>${active ? source ? "i" : "j" : matched ? "✓" : skipped ? "×" : "·"}</em></span>`;
    }
    if (end < value.length) html += '<span class="ldw524-dots">…</span>';
    return `<div class="ldw524-cells">${html}</div>${value.length > 10 ? `<small class="ldw524-window">${text("Đang hiển thị vị trí", "Showing positions")} ${start}–${end - 1} / ${value.length}</small>` : ""}`;
  };
  const reasons = {
    invalid: text("Không khớp đủ", "Incomplete match"),
    longer: text("Dài hơn → chọn", "Longer → choose"),
    shorter: text("Ngắn hơn → giữ best", "Shorter → keep best"),
    "lex-smaller": text("Cùng độ dài, từ điển nhỏ hơn → chọn", "Same length, lexicographically smaller → choose"),
    "lex-keep": text("Cùng độ dài → giữ best", "Same length → keep best"),
  };
  const comparison = v.compared;
  const compareHtml = comparison ? `<div class="ldw524-comparison ${comparison.equal ? "equal" : "different"}"><code>s[${comparison.i}] <b>${esc(comparison.source)}</b></code><strong>${comparison.equal ? "=" : "≠"}</strong><code>word[${comparison.j}] <b>${esc(comparison.target)}</b></code><span>${comparison.equal ? text("Giữ chữ · j tiến lên", "Keep letter · advance j") : text("Bỏ chữ của s · j đứng yên", "Delete s letter · keep j")}</span></div>` : "";
  const history = v.history.map(item => `<li><strong>${esc(item.word)}</strong><span class="${item.valid ? "valid" : "invalid"}">${item.valid ? "✓" : "×"} ${reasons[item.reason]}</span></li>`).join("");
  const alignment = done && v.best ? `<p class="ldw524-alignment">${text("Giữ các index", "Keep indices")}: <code>${v.matches.slice(0, 20).join(" → ")}${v.matches.length > 20 ? " → …" : ""}</code>${v.matches.length > 20 ? ` (${v.matches.length} ${text("vị trí", "positions")})` : ""}</p>` : "";
  $("treeView").innerHTML = `<section class="ldw524-viz">
    <header class="ldw524-heading"><div><small>524 · TWO POINTERS</small><h3>${text("Giữ đúng thứ tự, chọn từ dài nhất", "Keep the order, choose the longest word")}</h3><p>${text("Xóa ký tự được. Đổi thứ tự không được.", "Delete characters while preserving their order.")}</p></div><span class="ldw524-count">${v.inspected}/${v.total} ${text("từ đã kiểm tra", "words checked")}</span></header>
    <div class="ldw524-rule"><span><b>1</b> ${text("Khớp đủ chữ", "Match all letters")}</span><span><b>2</b> ${text("Ưu tiên dài hơn", "Prefer longer")}</span><span><b>3</b> ${text("Hòa: thứ tự từ điển", "Tie: lexicographic order")}</span></div>
    ${!done ? `<nav class="ldw524-candidates" aria-label="dictionary">${v.candidates.map(item => `<span class="${item.index === v.index ? "current" : ""}"><small>#${item.index + 1}</small> ${esc(item.word)} <em>${item.length}</em></span>`).join("")}</nav>` : ""}
    <section class="ldw524-row"><header><strong>s · ${text("chuỗi gốc", "source string")}</strong><span>${!ready ? text("chưa đặt i", "i not set yet") : done ? `${v.matches.length}/${v.s.length} ${text("chữ giữ lại", "letters kept")}` : `i = ${v.i}/${v.s.length}`}</span></header>${strip(v.s, v.i, true)}</section>
    <section class="ldw524-row target"><header><strong>${done ? text("Từ thắng cuộc", "Winning word") : text("word · từ đang thử", "word · current candidate")}</strong><span>${ready ? `${v.j}/${v.word.length} ${text("chữ khớp", "letters matched")}` : text("chưa kiểm tra", "not checked yet")}</span></header>${strip(v.word, v.j, false)}${compareHtml}${alignment}</section>
    <div class="ldw524-legend"><span class="kept">✓ ${text("đã giữ / đã khớp", "kept / matched")}</span><span class="active">i / j ${text("vị trí tiếp theo", "next position")}</span><span>× ${text("bỏ khỏi s", "delete from s")}</span></div>
    <div class="ldw524-bottom"><section class="ldw524-best"><small>${done ? text("KẾT QUẢ", "RESULT") : text("BEST HIỆN TẠI", "CURRENT BEST")}</small><strong>${esc(v.best || '""')}</strong><span>${v.best.length} ${text("chữ", "letters")}${!v.best && !done ? ` · ${text("chưa chọn được từ", "no word selected yet")}` : ""}</span></section><section class="ldw524-history"><header><strong>${text("Các từ vừa xét", "Recently checked")}</strong><span>${v.validCount} ${text("hợp lệ", "valid")}</span></header><ul>${history || `<li>${text("Chưa có từ nào được xác nhận.", "No word has been verified yet.")}</li>`}</ul>${v.inspected > 5 ? `<small>${text("Hiển thị 5 từ gần nhất.", "Showing the five most recent words.")}</small>` : ""}</section></div>
    <footer><small>${text("BƯỚC HIỆN TẠI", "CURRENT STEP")}</small><strong>${esc(pick(step.title))}</strong><p>${esc(pick(step.note))}</p>${v.omitted ? `<p class="ldw524-condensed">${text("Dữ liệu lớn: đã rút gọn", "Large input: condensed")} ${v.omitted} ${text("bước; vẫn hiển thị kết luận cho mọi từ.", "steps; every word's verdict is still shown.")}</p>` : ""}</footer>
    <details><summary>${text("Xem đầy đủ chuỗi gốc và từ", "View the full source and word")}</summary><p><b>s:</b> <code>${esc(v.s)}</code></p><p><b>word:</b> <code>${esc(v.word || '""')}</code></p><p><b>best:</b> <code>${esc(v.best || '""')}</code></p></details>
  </section>`;
}
