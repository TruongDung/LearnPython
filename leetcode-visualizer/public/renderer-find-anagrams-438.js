function renderFindAnagrams438View(step) {
  const view = step.anagram438View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const inWindow = (index) => index >= view.left && index <= view.right;
  const cells = [...view.s].map((letter, index) => {
    const current = index === view.right;
    const active = inWindow(index);
    const matched = view.answers.some((start) => index >= start && index < start + view.p.length);
    return `<span class="ana438-cell${active ? " in-window" : ""}${current ? " current" : ""}${matched ? " found" : ""}"><small>${index}</small><b>${letter}</b></span>`;
  }).join("");
  const counters = Object.keys(view.need).map((letter) => {
    const needed = view.need[letter];
    const counted = view.window[letter];
    const matched = needed > 0 && needed === counted;
    const tooMany = counted > needed;
    return `<article class="ana438-counter${matched ? " matched" : ""}${tooMany ? " excess" : ""}">
      <strong>${letter}</strong>
      <div class="ana438-counts"><span>${text("cần", "need")} <b>${needed}</b></span><span>${text("có", "have")} <b>${counted}</b></span></div>
      <div class="ana438-bars"><i style="--count:${needed}"></i><i style="--count:${counted}"></i></div>
    </article>`;
  }).join("");
  const answers = view.answers.length
    ? view.answers.map((index) => `<span class="ana438-answer${view.answerAdded && index === view.answers[view.answers.length - 1] ? " latest" : ""}">${index}</span>`).join("")
    : `<span class="ana438-empty">—</span>`;
  const phase = {
    setup: text("Sẵn sàng", "Ready"),
    init: text("Khởi tạo", "Initialize"),
    "need-index": text("Đếm p", "Count p"),
    "need-count": text("Đếm p", "Count p"),
    required: text("Đếm chữ khác nhau", "Count distinct letters"),
    read: text("Mở rộng →", "Expand →"),
    "window-index": text("Tìm ô chữ", "Find letter slot"),
    "window-count": text("Tăng tần suất", "Increment count"),
    compare: text("So khớp", "Compare"),
    "add-match": text("Tần suất khớp", "Frequency matches"),
    "check-over": text("Kiểm tra dư", "Check extra copy"),
    "remove-match": text("Thừa một chữ", "One extra copy"),
    "check-remove-over": text("Kiểm tra trước khi bỏ", "Check before removal"),
    shrink: text("Cửa sổ quá dài", "Window too long"),
    "outgoing-index": text("Bỏ ←", "Remove ←"),
    "compare-remove": text("So khớp trước khi bỏ", "Compare before removal"),
    "lose-match": text("Mất khớp", "Match lost"),
    "restore-match": text("Khớp lại", "Match restored"),
    "remove-char": text("Giảm tần suất", "Decrement count"),
    "move-left": text("Thu hẹp ←", "Shrink ←"),
    check: text("So sánh", "Compare"),
    match: text("Anagram ✓", "Anagram ✓"),
    save: text("Lưu vị trí", "Save index"),
    short: text("Không đủ độ dài", "Too short"),
    done: text("Hoàn tất", "Done"),
  }[view.event] || text("Đang chạy", "Running");
  const matchedCount = view.matches;
  const removing = ["outgoing-index", "compare-remove", "lose-match", "check-remove-over", "restore-match", "remove-char", "move-left"].includes(view.event);
  const currentLabel = view.ch === null ? "—" : removing
    ? `${view.ch} · ${text("bỏ", "out")} ${view.s[view.left]} → ${view.idx}`
    : `${view.ch} → ${view.idx}`;

  const treeView = $("treeView");
  treeView.innerHTML = `<section class="ana438-viz" aria-label="${text("Mô phỏng Find All Anagrams in a String", "Find All Anagrams in a String visualization")}">
    <header class="ana438-head">
      <div><small>438 · ${phase}</small><h3>${text("Cửa sổ cố định", "Fixed-size window")}</h3></div>
      <div class="ana438-progress"><b>${matchedCount}</b><span>/ ${view.required}</span></div>
    </header>
    <div class="ana438-pattern"><small>p</small>${[...view.p].map((letter) => `<b>${letter}</b>`).join("")}</div>
    <div class="ana438-strip" aria-label="${text("Chuỗi s với cửa sổ trượt", "String s with sliding window")}">
      <div class="ana438-cells">${cells}</div>
      <div class="ana438-pointers"><span style="--pointer:${view.left}">▲ left</span><span style="--pointer:${Math.max(0, view.right)}">▼ right</span></div>
    </div>
    <div class="ana438-counters">${counters}</div>
    <div class="ana438-status"><span>${text("ch · idx", "ch · idx")} <b>${currentLabel}</b></span><span>matches <b>${view.matches}/${view.required}</b></span></div>
    <div class="ana438-results"><small>ans</small><div>${answers}</div></div>
  </section>`;
  const strip = treeView.querySelector(".ana438-strip");
  const currentCell = strip.querySelector(".ana438-cell.current");
  if (currentCell) strip.scrollLeft = Math.max(0, currentCell.offsetLeft - strip.clientWidth / 2);
}
