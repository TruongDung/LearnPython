function renderReverseLetters917View(step) {
  const v = step.reverseLetters917View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const isLetter = char => /^[A-Za-z]$/.test(char);
  const skipped = new Set([...(v.skippedLeft || []), ...(v.skippedRight || [])]);
  const swapped = new Set((v.swaps || []).flatMap(swap => [swap.left, swap.right]));
  const cells = (chars, working) => chars.map((char, index) => {
    const classes = ["rol917-char", isLetter(char) ? "letter" : "fixed"];
    if (working && index === v.left) classes.push("left");
    if (working && index === v.right) classes.push("right");
    if (working && index === v.activeIndex) classes.push("active", v.activeSide || "");
    if (working && skipped.has(index)) classes.push("skipped");
    if (working && swapped.has(index)) classes.push("swapped");
    if (working && v.lastSwap && (index === v.lastSwap.left || index === v.lastSwap.right)) classes.push("just-swapped");
    const pointer = working ? [index === v.left ? "L" : "", index === v.right ? "R" : ""].filter(Boolean).join("/") : "";
    return `<span class="${classes.join(" ")}"><small>${index}</small><b>${escapeHtml(char)}</b><em>${pointer || (isLetter(char) ? text("chữ", "letter") : text("giữ", "fixed"))}</em></span>`;
  }).join("");
  const phase = {
    copy: text("Tạo vùng làm việc", "Create workspace"),
    pointers: text("Đặt hai con trỏ", "Place two pointers"),
    loop: text("Kiểm tra vùng còn lại", "Check remaining range"),
    "check-left": text("Kiểm tra phía trái", "Check left side"),
    "move-left": text("Khóa ký tự bên trái", "Lock left character"),
    "check-right": text("Kiểm tra phía phải", "Check right side"),
    "move-right": text("Khóa ký tự bên phải", "Lock right character"),
    pair: text("Xác nhận cặp chữ cái", "Confirm letter pair"),
    swap: text("Đổi chỗ hai chữ", "Swap letters"),
    "advance-left": text("Thu hẹp phía trái", "Advance left"),
    "advance-right": text("Thu hẹp phía phải", "Advance right"),
    done: text("Hoàn tất", "Complete"),
  }[v.phase] || v.phase;
  const history = (v.swaps || []).map((swap, index) => `<article${v.lastSwap && index === v.swaps.length - 1 ? ' class="current"' : ""}><small>#${index + 1} · [${swap.left}] ↔ [${swap.right}]</small><strong>${escapeHtml(swap.leftBefore)} ↔ ${escapeHtml(swap.rightBefore)}</strong><span>${escapeHtml(swap.leftAfter)} · ${escapeHtml(swap.rightAfter)}</span></article>`).join("");
  const result = v.answer === null ? v.chars.join("") : v.answer;
  const letterCount = [...v.original].filter(isLetter).length;

  $("treeView").innerHTML = `<section class="rol917-viz phase-${escapeHtml(v.phase)}" role="img" aria-label="${text("Mô phỏng đảo chữ cái bài 917", "Problem 917 reverse-only-letters visualization")}">
    <header><div><small>917 · TWO POINTERS</small><h3>${text("Đảo chữ cái, khóa nguyên vị trí số và ký hiệu", "Reverse letters, lock digits and symbols in place")}</h3></div><div class="rol917-answer"><small>${text("kết quả hiện tại", "current result")}</small><strong>${escapeHtml(result)}</strong></div></header>
    <section class="rol917-rule"><strong>${phase}</strong><span><code>A–Z · a–z</code> ${text("được đảo · ký tự khác giữ nguyên index", "reverse · every other character keeps its index")}</span></section>
    <section class="rol917-row original"><header><strong>${text("CHUỖI BAN ĐẦU", "ORIGINAL STRING")}</strong><span>${letterCount} ${text("chữ cái", "letters")}</span></header><div>${cells([...v.original], false)}</div></section>
    <section class="rol917-row working"><header><strong>chars · ${text("vùng làm việc", "mutable workspace")}</strong><span>L = ${v.left} · R = ${v.right}</span></header><div>${cells(v.chars, true)}</div></section>
    <section class="rol917-lower">
      <div class="rol917-legend"><strong>${text("ĐỌC MÀU", "COLOR KEY")}</strong><span class="letter">${text("chữ cái có thể đổi", "swappable letter")}</span><span class="fixed">${text("ký tự bị khóa", "locked character")}</span><span class="pointer">L / R</span><span class="swap">${text("vừa đổi", "just swapped")}</span></div>
      <div class="rol917-history"><header><strong>${text("LỊCH SỬ ĐỔI CHỖ", "SWAP HISTORY")}</strong><span>${v.swaps.length}</span></header>${history || `<p>${text("Chưa có cặp chữ cái nào được đổi.", "No letter pair has been swapped yet.")}</p>`}</div>
    </section>
    <footer><small>${text("BƯỚC HIỆN TẠI", "CURRENT STEP")}</small><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></footer>
  </section>`;
}
