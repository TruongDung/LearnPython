function renderReverseVowels345View(step) {
  const v = step.reverseVowels345View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const vowels = new Set("aeiouAEIOU");
  const skipped = new Set([...(v.skippedLeft || []), ...(v.skippedRight || [])]);
  const swapped = new Set((v.swaps || []).flatMap((swap) => [swap.left, swap.right]));
  const display = (char) => char === " " ? "␠" : char;
  const cells = (chars, working) => chars.map((char, index) => {
    const classes = ["rv345-char", vowels.has(char) ? "vowel" : "fixed"];
    if (working && index === v.left) classes.push("left");
    if (working && index === v.right) classes.push("right");
    if (working && index === v.activeIndex) classes.push("active", v.activeSide || "");
    if (working && skipped.has(index)) classes.push("skipped");
    if (working && swapped.has(index)) classes.push("swapped");
    if (working && v.lastSwap && (index === v.lastSwap.left || index === v.lastSwap.right)) classes.push("just-swapped");
    const pointers = working
      ? [index === v.left ? "L" : "", index === v.right ? "R" : ""].filter(Boolean).join("/")
      : "";
    return `<span class="${classes.join(" ")}"><small>${index}</small><b>${escapeHtml(display(char))}</b><em>${pointers || (vowels.has(char) ? "vowel" : "fixed")}</em></span>`;
  }).join("");
  const phase = {
    vowels: text("Tạo tập nguyên âm", "Build vowel set"),
    copy: text("Tạo vùng làm việc", "Create workspace"),
    pointers: text("Đặt hai con trỏ", "Place two pointers"),
    loop: text("Kiểm tra vùng còn lại", "Check remaining range"),
    "check-left": text("Kiểm tra phía trái", "Check left side"),
    "move-left": text("Bỏ qua bên trái", "Skip on the left"),
    "check-right": text("Kiểm tra phía phải", "Check right side"),
    "move-right": text("Bỏ qua bên phải", "Skip on the right"),
    pair: text("Xác nhận cặp nguyên âm", "Confirm vowel pair"),
    swap: text("Đổi chỗ nguyên âm", "Swap vowels"),
    "advance-left": text("Thu hẹp phía trái", "Advance left"),
    "advance-right": text("Thu hẹp phía phải", "Advance right"),
    done: text("Hoàn tất", "Complete"),
  }[v.phase] || v.phase;
  const history = (v.swaps || []).map((swap, index) => `<article${v.lastSwap && index === v.swaps.length - 1 ? ' class="current"' : ""}><small>#${index + 1} · [${swap.left}] ↔ [${swap.right}]</small><strong>${escapeHtml(display(swap.leftBefore))} ↔ ${escapeHtml(display(swap.rightBefore))}</strong><span>${escapeHtml(display(swap.leftAfter))} · ${escapeHtml(display(swap.rightAfter))}</span></article>`).join("");
  const result = v.answer === null ? v.chars.join("") : v.answer;
  const vowelCount = [...v.original].filter((char) => vowels.has(char)).length;

  $("treeView").innerHTML = `<section class="rv345-viz phase-${escapeHtml(v.phase)}" role="img" aria-label="${text("Mô phỏng đảo nguyên âm bài 345", "Problem 345 reverse-vowels visualization")}">
    <header><div><small>345 · TWO POINTERS</small><h3>${text("Đảo nguyên âm, giữ nguyên mọi ký tự khác", "Reverse vowels, preserve every other position")}</h3></div><div class="rv345-answer"><small>${text("kết quả hiện tại", "current result")}</small><strong>${escapeHtml(result)}</strong></div></header>
    <section class="rv345-rule"><strong>${phase}</strong><span>${text("Nguyên âm: a e i o u · không phân biệt hoa thường", "Vowels: a e i o u · case-insensitive")}</span></section>
    <section class="rv345-row original"><header><strong>${text("CHUỖI BAN ĐẦU", "ORIGINAL STRING")}</strong><span>${vowelCount} ${text("nguyên âm", "vowels")}</span></header><div>${cells([...v.original], false)}</div></section>
    <section class="rv345-row working"><header><strong>chars · ${text("vùng làm việc", "mutable workspace")}</strong><span>L = ${v.left} · R = ${v.right}</span></header><div>${cells(v.chars, true)}</div></section>
    <section class="rv345-lower">
      <div class="rv345-legend"><strong>${text("ĐỌC MÀU", "COLOR KEY")}</strong><span class="vowel">${text("nguyên âm", "vowel")}</span><span class="fixed">${text("ký tự giữ nguyên", "fixed character")}</span><span class="pointer">L / R</span><span class="swap">${text("vừa đổi", "just swapped")}</span></div>
      <div class="rv345-history"><header><strong>${text("LỊCH SỬ ĐỔI CHỖ", "SWAP HISTORY")}</strong><span>${v.swaps.length}</span></header>${history || `<p>${text("Chưa có cặp nguyên âm nào được đổi.", "No vowel pair has been swapped yet.")}</p>`}</div>
    </section>
    <footer><small>${text("BƯỚC HIỆN TẠI", "CURRENT STEP")}</small><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></footer>
  </section>`;
}
