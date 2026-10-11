function renderMaxConsecutiveOnes1004View(step) {
  const view = step.maxConsecutiveOnes1004View || {};
  const vi = lang === "vi";
  const text = (viText, enText) => vi ? viText : enText;
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const windowSet = new Set(Array.isArray(view.windowIndices) ? view.windowIndices : []);
  const bestSet = new Set(Array.isArray(view.bestIndices) ? view.bestIndices : []);
  const flipSet = new Set(Array.isArray(view.flippedZeros) ? view.flippedZeros : []);
  const countedSet = new Set(Array.isArray(view.countedZeroIndices) ? view.countedZeroIndices : [...flipSet]);
  const phaseIndex = { init: 0, expand: 0, validate: 1, shrink: 1, record: 2, done: 3 }[view.phase] ?? 0;
  const phases = [
    text("Mở rộng right", "Expand right"),
    text("Giữ zero_count ≤ k", "Keep zero_count ≤ k"),
    text("Ghi kỷ lục", "Record best"),
    text("Kết quả", "Result"),
  ].map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${label}</span>`).join("");

  const cells = nums.map((value, index) => {
    const inWindow = windowSet.has(index);
    const inBest = bestSet.has(index);
    const flipped = inWindow && value === 0 && countedSet.has(index);
    const pendingZero = inWindow && value === 0 && !countedSet.has(index);
    const classes = ["ones1004-cell"];
    if (inWindow) classes.push("in-window");
    if (inBest) classes.push("in-best");
    if (flipped) classes.push(view.valid ? "flipped" : "overflow");
    if (pendingZero) classes.push("pending");
    if (index === view.activeIndex) classes.push("active");
    if (index === view.removedIndex) classes.push("removed");
    const pointers = [];
    if (index === view.left && view.right >= view.left) pointers.push("L");
    if (index === view.right) pointers.push("R");
    let state = inWindow ? text("TRONG WINDOW", "IN WINDOW") : text("BÊN NGOÀI", "OUTSIDE");
    if (flipped) state = view.valid ? "FLIP 0→1" : text("VƯỢT BUDGET", "OVER BUDGET");
    if (pendingZero) state = text("CHỜ FLIP", "PENDING FLIP");
    if (index === view.removedIndex) state = text("ĐANG BỎ", "LEAVING");
    return `<article class="${classes.join(" ")}"><div><small>${pointers.join(" + ") || "&nbsp;"}</small><span>i=${index}</span></div><strong>${value}</strong><em>${state}</em>${inBest ? `<i>${text("BEST", "BEST")}</i>` : ""}</article>`;
  }).join("");

  const usedZeroIndexes = Array.isArray(view.countedZeroIndices) ? view.countedZeroIndices : [...flipSet];
  const budgetSlots = Array.from({ length: view.k }, (_, slot) => {
    const zeroIndex = usedZeroIndexes[slot];
    return `<span class="${zeroIndex == null ? "free" : "used"}"><small>${text("lượt", "slot")} ${slot + 1}</small><b>${zeroIndex == null ? "—" : `i=${zeroIndex}`}</b><em>${zeroIndex == null ? text("còn trống", "available") : "0 → 1"}</em></span>`;
  }).join("");
  const overflow = Math.max(0, view.zeroCount - view.k);
  const overflowSlots = overflow > 0
    ? `<span class="over"><small>${text("thừa", "extra")}</small><b>+${overflow}</b><em>${text("phải co window", "must shrink")}</em></span>`
    : "";
  const budgetEmpty = view.k === 0
    ? `<em class="ones1004-no-budget">k = 0 · ${text("không có lượt flip", "no flip slots")}</em>`
    : "";

  const bestValues = bestSet.size
    ? nums.map((value, index) => bestSet.has(index)
      ? `<span class="${value === 0 ? "changed" : ""}"><small>i=${index}</small><b>${value === 0 ? "1" : value}</b><em>${value === 0 ? "0→1" : "1"}</em></span>`
      : "").join("")
    : `<em>${text("Chưa có cửa sổ hợp lệ được ghi lại.", "No valid window has been recorded yet.")}</em>`;
  const statusClass = view.valid ? "valid" : "invalid";
  const statusLabel = view.valid
    ? text("HỢP LỆ · CÓ THỂ GHI KỶ LỤC", "VALID · MAY RECORD")
    : text("CHƯA HỢP LỆ · PHẢI CO WINDOW", "INVALID · MUST SHRINK");
  const eventDetail = view.event === "record-best"
    ? `max_length: ${view.previousMax} → ${view.maxLength}`
    : view.event === "keep-best"
      ? `max_length = ${view.maxLength}`
      : view.event === "refund-flip"
        ? `zero_count → ${view.zeroCount}`
        : view.event === "move-left"
          ? `left → ${view.left}`
          : `zero_count = ${view.zeroCount}`;

  $("treeView").innerHTML = `<section class="ones1004-viz" role="group" aria-label="${text("Mô phỏng sliding window bài 1004", "LeetCode 1004 sliding-window simulation")}">
    <header class="ones1004-heading"><div><small>1004 · SLIDING WINDOW</small><h3>${text("Flip tối đa k số 0", "Flip at most k zeros")}</h3></div><span>${text("Đáp án hiện tại", "Current answer")}<b>${view.maxLength}</b></span></header>
    <div class="ones1004-phases">${phases}</div>
    <section class="ones1004-action"><div><small>${text("DÒNG", "LINE")} ${view.line}</small><strong>${escapeHtml(pick(step.title))}</strong></div><code>${escapeHtml(eventDetail)}</code><p>${escapeHtml(pick(step.note))}</p></section>
    <section class="ones1004-metrics"><article><small>left</small><b>${view.left}</b></article><article><small>right</small><b>${view.right >= 0 ? view.right : "—"}</b></article><article><small>${text("độ dài window", "window length")}</small><b>${view.currentLength}</b></article><article><small>zero_count / k</small><b>${view.zeroCount} / ${view.k}</b></article><article class="answer"><small>max_length</small><b>${view.maxLength}</b></article></section>
    <section class="ones1004-array"><header><strong>${text("CỬA SỔ HIỆN TẠI", "CURRENT WINDOW")}</strong><span>[${view.left}..${view.right >= 0 ? view.right : "—"}]</span></header><div class="ones1004-cells" style="--ones1004-count:${Math.max(nums.length, 1)}">${cells}</div><footer><span><i class="window"></i>${text("trong window", "in window")}</span><span><i class="flip"></i>flip 0→1</span><span><i class="best"></i>${text("thuộc best", "in best")}</span><span><i class="active"></i>${text("đang xử lý", "active")}</span></footer></section>
    <section class="ones1004-budget ${statusClass}"><header><div><strong>${text("BUDGET FLIP", "FLIP BUDGET")}</strong><span>${text("mỗi số 0 trong window chiếm một slot", "each zero in the window occupies one slot")}</span></div><b>${statusLabel}</b></header><div>${budgetSlots}${overflowSlots}${budgetEmpty}</div><p><code>zero_count ≤ k</code><span>${view.zeroCount} ≤ ${view.k} → ${view.valid ? "True" : "False"}</span></p></section>
    <section class="ones1004-best"><header><div><strong>${text("CỬA SỔ TỐT NHẤT ĐÃ LƯU", "SAVED BEST WINDOW")}</strong><span>${view.bestR >= view.bestL ? `[${view.bestL}..${view.bestR}]` : "—"}</span></div><b>${view.maxLength}</b></header><div>${bestValues}</div><p>${text("Hiển thị giá trị sau khi các số 0 trong best window được flip thành 1.", "Values are shown after zeros inside the best window are flipped to one.")}</p></section>
    <footer class="ones1004-invariant ${statusClass}"><strong>${text("Bất biến", "Invariant")}</strong><span>${text("Sau vòng while: window [left..right] luôn có tối đa k số 0.", "After the while loop, window [left..right] always contains at most k zeros.")}</span></footer>
  </section>`;
}
