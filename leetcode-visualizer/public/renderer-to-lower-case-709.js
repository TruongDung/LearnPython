function renderLowerCase709View(step) {
  const v = step.lowerCase709View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const done = v.phase === "done";
  const display = ch => ch === " " ? "␠" : ch;
  const cell = (ch, index, output) => {
    const written = !output || index < v.result.length;
    const current = !done && index === v.index;
    const converted = output && written && v.s[index] !== ch;
    return `<div class="lc709-cell${current ? " current" : ""}${converted ? " converted" : ""}${!written ? " pending" : ""}" aria-label="${escapeHtml(`${index}: ${written ? JSON.stringify(ch) : text("chưa ghi", "not written")}`)}"><small>${index}</small><b>${written ? escapeHtml(display(ch)) : "·"}</b><span>${current ? "i" : converted ? "↧" : ""}</span></div>`;
  };
  const input = [...v.s].map((ch, i) => cell(ch, i, false)).join("");
  const output = [...v.s].map((_, i) => cell(v.result[i], i, true)).join("");
  const phases = { init: text("Khởi tạo", "Initialize"), read: text("Đọc ký tự", "Read character"), check: text("Kiểm tra A–Z", "Check A–Z"), convert: text("Đổi sang chữ thường", "Convert to lowercase"), append: text("Ghi kết quả", "Append to result"), done: text("Hoàn tất", "Complete") };
  let decision = text("Bắt đầu từ ký tự đầu tiên.", "Start with the first character.");
  if (done) decision = text("Đã xử lý toàn bộ chuỗi.", "The entire string has been processed.");
  else if (v.index !== null) {
    const original = v.s[v.index];
    decision = v.uppercase === null ? text("Chưa kiểm tra chữ hoa.", "Uppercase check is pending.") : v.uppercase
      ? `${escapeHtml(original)} (${original.charCodeAt(0)}) + 32 → ${escapeHtml(original.toLowerCase())} (${original.charCodeAt(0) + 32}) · ${v.changed ? text("đã đổi", "converted") : text("chờ đổi", "conversion pending")}`
      : `${escapeHtml(JSON.stringify(original))} · ${text("giữ nguyên", "keep unchanged")}`;
  }
  $("treeView").innerHTML = `<section class="lc709-viz" aria-label="${text("Mô phỏng đổi chữ thường 709", "709 lowercase conversion")}">
    <header><div><small>709 · ${phases[v.phase]}</small><h3>${text("Chữ hoa → chữ thường", "Uppercase → lowercase")}</h3></div><strong>${v.result.length} / ${v.s.length}</strong></header>
    <p class="lc709-rule">${text("Chỉ đổi A–Z. Chữ thường, số, dấu câu và khoảng trắng giữ nguyên.", "Only A–Z changes. Lowercase, digits, punctuation and spaces stay unchanged.")}</p>
    <div class="lc709-scroll"><div class="lc709-row"><strong>s</strong><div>${input}</div></div><div class="lc709-row"><strong>result</strong><div>${output}</div></div></div>
    <div class="lc709-legend"><span>i = ${text("vị trí đang xét", "current index")}</span><span>↧ = ${text("chữ đã đổi", "converted letter")}</span><span>␠ = ${text("khoảng trắng", "space")}</span><span>· = ${text("chưa ghi", "not written")}</span></div>
    <div class="lc709-decision"><strong>${decision}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="lc709-result"><small>${done ? text("Kết quả", "Answer") : text("Chuỗi đã tạo đến hiện tại", "Result so far")}</small><code>${escapeHtml(JSON.stringify(v.result.join("")))}</code></div>
  </section>`;
  const strip = $("treeView").querySelector(".lc709-scroll");
  const current = strip.querySelector(".current");
  if (current) strip.scrollLeft = Math.max(0, current.offsetLeft - strip.clientWidth / 2);
}
