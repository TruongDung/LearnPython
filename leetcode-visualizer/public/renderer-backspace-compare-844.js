function renderBackspace844View(step) {
  const v = step.backspace844View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const setFor = (name, side) => new Set(v[`${name}${side.toUpperCase()}`] || []);
  const cells = (source, side) => {
    const backspaces = setFor("backspaces", side);
    const deleted = setFor("deleted", side);
    const matched = setFor("matched", side);
    const pointer = side === "s" ? v.i : v.j;
    return [...source].map((char, index) => {
      const classes = ["bs844-char", char === "#" ? "backspace" : "letter"];
      if (backspaces.has(index)) classes.push("used-backspace");
      if (deleted.has(index)) classes.push("deleted");
      if (matched.has(index)) classes.push("matched");
      if (index === pointer) classes.push("pointer");
      if (v.activeSide === side && v.activeIndex === index) classes.push("active");
      if (v.compared && ((side === "s" && v.compared.sIndex === index) || (side === "t" && v.compared.tIndex === index))) classes.push("compared");
      const status = index === pointer ? (side === "s" ? "i" : "j")
        : deleted.has(index) ? text("đã xóa", "erased")
          : backspaces.has(index) ? "# used"
            : matched.has(index) ? text("đã khớp", "matched")
              : " ";
      return `<span class="${classes.join(" ")}"><small>${index}</small><b>${escapeHtml(char)}</b><em>${status}</em></span>`;
    }).join("");
  };
  const typed = source => {
    const stack = [];
    for (const char of source) char === "#" ? stack.pop() : stack.push(char);
    return stack.join("");
  };
  const phases = {
    pointers: text("Đặt con trỏ cuối chuỗi", "Place end pointers"), skips: text("Khởi tạo bộ đếm xóa", "Initialize skip counters"),
    loop: text("Tìm cặp hiển thị tiếp theo", "Find next visible pair"), "scan-s": text("Quét s", "Scan s"), "scan-t": text("Quét t", "Scan t"),
    "backspace-s-check": text("Phát hiện # trong s", "Found # in s"), "backspace-t-check": text("Phát hiện # trong t", "Found # in t"),
    "backspace-s": text("Tăng skip_s", "Increment skip_s"), "backspace-t": text("Tăng skip_t", "Increment skip_t"),
    "delete-s-check": text("Chữ của s sẽ bị xóa", "An s letter will be erased"), "delete-t-check": text("Chữ của t sẽ bị xóa", "A t letter will be erased"),
    "delete-s": text("Áp dụng backspace cho s", "Apply backspace in s"), "delete-t": text("Áp dụng backspace cho t", "Apply backspace in t"),
    "move-s": text("Dời i sang trái", "Move i left"), "move-t": text("Dời j sang trái", "Move j left"),
    "visible-s": text("Tìm thấy chữ hiển thị trong s", "Visible s character found"), "visible-t": text("Tìm thấy chữ hiển thị trong t", "Visible t character found"),
    "ready-s": text("s sẵn sàng", "s is ready"), "ready-t": text("t sẵn sàng", "t is ready"),
    exhaustion: text("Kiểm tra chuỗi đã hết", "Check exhaustion"), compare: text("So sánh cặp hiển thị", "Compare visible pair"),
    "advance-s": text("Cặp khớp: dời i", "Pair matched: move i"), "advance-t": text("Cặp khớp: dời j", "Pair matched: move j"), done: text("Hoàn tất", "Complete"),
  };
  const comparison = v.compared
    ? `<section class="bs844-comparison ${v.compared.sChar === v.compared.tChar ? "equal" : "different"}"><span>s[${v.compared.sIndex}]</span><strong>${escapeHtml(v.compared.sChar)}</strong><b>${v.compared.sChar === v.compared.tChar ? "=" : "≠"}</b><strong>${escapeHtml(v.compared.tChar)}</strong><span>t[${v.compared.tIndex}]</span></section>`
    : `<section class="bs844-comparison waiting"><span>${text("Đang tìm hai ký tự còn hiển thị", "Finding the two visible characters")}</span></section>`;
  const history = (v.matches || []).map((match, index) => `<span><small>#${index + 1}</small><b>${escapeHtml(match.sChar)}</b><em>s[${match.sIndex}] = t[${match.tIndex}]</em></span>`).join("");
  const answer = v.answer === null ? "—" : v.answer ? "TRUE" : "FALSE";

  $("treeView").innerHTML = `<section class="bs844-viz phase-${escapeHtml(v.phase)}" role="img" aria-label="${text("Mô phỏng so sánh backspace bài 844", "Problem 844 backspace comparison visualization")}">
    <header><div><small>844 · REVERSE TWO POINTERS</small><h3>${text("So sánh trực tiếp, không dựng chuỗi trung gian", "Compare directly without building processed strings")}</h3></div><div class="bs844-answer"><small>${text("kết quả", "answer")}</small><strong>${answer}</strong></div></header>
    <section class="bs844-rule"><strong>${phases[v.phase] || v.phase}</strong><span><code>#</code> ${text("tăng skip · chữ khi skip > 0 bị xóa", "increments skip · a letter with skip > 0 is erased")}</span></section>
    <section class="bs844-row s"><header><strong>s · ${text("quét từ phải", "scan from right")}</strong><span>i = ${v.i} · skip_s = ${v.skipS}</span></header><div>${cells(v.s, "s")}</div></section>
    <section class="bs844-row t"><header><strong>t · ${text("quét từ phải", "scan from right")}</strong><span>j = ${v.j} · skip_t = ${v.skipT}</span></header><div>${cells(v.t, "t")}</div></section>
    ${comparison}
    <section class="bs844-lower">
      <div class="bs844-preview"><header><strong>${text("KẾT QUẢ GÕ", "TYPED RESULTS")}</strong><span>${text("chỉ dùng để đối chiếu", "reference only")}</span></header><p><small>s</small><code>${escapeHtml(typed(v.s)) || "∅"}</code></p><p><small>t</small><code>${escapeHtml(typed(v.t)) || "∅"}</code></p></div>
      <div class="bs844-history"><header><strong>${text("CÁC CẶP ĐÃ KHỚP", "MATCHED PAIRS")}</strong><span>${v.matches.length}</span></header><div>${history || `<p>${text("Chưa có cặp nào.", "No pair yet.")}</p>`}</div></div>
    </section>
    <footer><small>${text("BƯỚC HIỆN TẠI", "CURRENT STEP")}</small><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></footer>
  </section>`;
}
