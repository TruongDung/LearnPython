function renderDisappearedNumbers448View(step) {
  const view = step.disappearedNumbers448View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const marking = view.phase === "mark";
  const completeMarks = view.phase === "collect" || view.phase === "done";
  const n = view.nums.length;
  const phases = { initialize: text("Khởi tạo", "Initialize"), mark: text("Lượt 1 · Đánh dấu số đã có", "Pass 1 · Mark present numbers"), collect: text("Lượt 2 · Thu số thiếu", "Pass 2 · Collect missing numbers"), done: text("Hoàn tất", "Complete") };
  const width = n * 62 - 6;
  const cells = view.nums.map((value, index) => {
    const classes = ["dn448-cell", value < 0 ? "seen" : completeMarks ? "missing" : "unmarked"];
    if (index === view.current) classes.push("current");
    if (marking && index === view.target) classes.push("target");
    if (view.event === "mark-negative" && index === view.target) classes.push("changed");
    if (view.event === "append-missing" && index === view.current) classes.push("found");
    const label = index === view.current && index === view.target ? "i / index ↓" : index === view.current ? "i ↓" : marking && index === view.target ? "index ↓" : "&nbsp;";
    return `<div class="${classes.join(" ")}" data-index="${index}" data-value="${value}"><small>${label}</small><span class="dn448-original">${text("gốc", "was")} ${view.original[index]}</span><strong>${value}</strong><span class="dn448-index">[${index}]</span><b class="dn448-number">${text("Số", "Number")} ${index + 1}</b></div>`;
  }).join("");
  let arrow = "";
  if (marking && view.target !== null) {
    const from = view.current * 62 + 28;
    const to = view.target * 62 + 28;
    const path = from === to ? `M${from - 9},32 Q${from},-4 ${to + 9},32` : `M${from},32 Q${(from + to) / 2},-14 ${to},32`;
    arrow = `<svg class="dn448-arrow" width="${width}" height="36" role="img" aria-label="${text("Ánh xạ giá trị sang chỉ số", "Map value to index")}"><defs><marker id="dn448-arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" /></marker></defs><path d="${path}" marker-end="url(#dn448-arrowhead)" /></svg>`;
  }
  let detail = `<p>${text("Số k được theo dõi bằng dấu của ô k−1. Giá trị tại ô đó vẫn giữ độ lớn gốc.", "Number k is tracked by the sign of slot k−1. The value in that slot keeps its original magnitude.")}</p>`;
  if (marking && view.current !== null) {
    detail = `<div class="dn448-mapping"><code>nums[${view.current}]</code><span>→ abs →</span><b>${view.value ?? "?"}</b><span>− 1 →</span><code>index = ${view.target ?? "?"}</code></div>`;
    if (view.target !== null) {
      const after = view.nums[view.target];
      const updated = view.event === "mark-negative";
      detail += `<p class="dn448-target-state"><code>nums[${view.target}]</code> · ${updated ? `${view.targetBefore} → <b>${after}</b>` : `<b>${after}</b>`} · ${view.accepted === false ? text("Đã âm → giữ nguyên (số trùng)", "Already negative → keep unchanged (duplicate)") : updated ? text("Đã đánh dấu số", "Marked number") + ` ${view.value}` : text("Chờ đổi dấu nếu còn dương", "Negate only if still positive")}</p>`;
    }
    detail += `<p>${text("Không đổi dấu lần thứ hai: số trùng không được làm ô âm trở lại thành dương.", "Do not flip a sign twice: a duplicate must not turn a negative slot positive again.")}</p>`;
  } else if (view.phase === "collect" && view.current !== null) {
    const value = view.nums[view.current];
    detail = `<div class="dn448-mapping"><code>nums[${view.current}] = ${value}</code><span>${value > 0 ? "> 0" : "< 0"}</span><b>${text("Số", "Number")} ${view.current + 1}</b><span>${value > 0 ? text("bị thiếu", "is missing") : text("đã có", "is present")}</span></div><p>${text("Kết quả lấy index + 1, không lấy giá trị đang lưu trong ô.", "The output is index + 1, not the value stored in the slot.")}</p>`;
  } else if (view.phase === "done") {
    detail = `<p><b>${text("Kết quả", "Answer")}: [${view.missing.join(", ")}]</b> · ${text("Mỗi số bị thiếu ứng với một ô vẫn dương sau lượt đánh dấu.", "Each missing number corresponds to a slot still positive after marking.")}</p>`;
  }
  const numberChips = view.nums.map((value, index) => {
    const status = value < 0 ? "seen" : completeMarks ? "missing" : "unmarked";
    const label = value < 0 ? text("đã có", "present") : completeMarks ? text("thiếu", "missing") : text("chưa đánh dấu", "unmarked yet");
    return `<span class="dn448-presence ${status}${(marking ? index === view.target : index === view.current) ? " active" : ""}" data-number="${index + 1}" data-status="${status}"><b>${index + 1}</b><small>${label}</small></span>`;
  }).join("");
  const results = view.missing === null ? `<p>${text("Danh sách missing sẽ được tạo sau lượt đánh dấu.", "missing is created after the marking pass.")}</p>` : view.missing.length ? view.missing.map(value => `<b class="dn448-output">${value}</b>`).join("") : `<p>${view.phase === "done" ? text("[] · Không có số bị thiếu", "[] · No missing numbers") : text("[] · Chưa thêm số nào", "[] · No numbers appended yet")}</p>`;
  $("treeView").innerHTML = `<section class="dn448-viz" aria-label="${text("Mô phỏng tìm số thiếu 448", "448 disappeared-numbers simulation")}">
    <header class="dn448-heading"><div><small>448 · ${phases[view.phase]}</small><h3>${text("Dùng dấu âm để ghi nhớ số đã có", "Negative signs remember present numbers")}</h3></div><span>n = ${n}</span></header>
    <section class="dn448-array-panel"><header><strong>nums · ${text("đổi dấu tại chỗ", "marked in place")}</strong><span>${text("Giá trị gốc → giá trị hiện tại", "Original → current values")}</span></header><div class="dn448-scroll"><div class="dn448-timeline" style="width:${width}px"><div class="dn448-arrow-space">${arrow}</div><div class="dn448-array">${cells}</div></div></div><div class="dn448-legend"><span class="seen">${text("Âm: đã đánh dấu", "Negative: marked")}</span><span class="${completeMarks ? "missing" : "unmarked"}">${completeMarks ? text("Dương: số bị thiếu", "Positive: missing number") : text("Dương: chưa đánh dấu", "Positive: unmarked yet")}</span><span>i = ${text("ô đang đọc", "reading slot")} · index = ${text("ô cần đánh dấu", "marking slot")}</span></div></section>
    <div class="dn448-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <section class="dn448-detail" data-event="${view.event}">${detail}</section>
    <section class="dn448-presence-panel"><header><strong>${text("CÁC SỐ TRONG 1..n", "NUMBERS IN 1..n")}</strong><span>${completeMarks ? text("Đã quét hết đầu vào", "Input scan complete") : text("Theo phần đã quét", "For the scanned prefix")}</span></header><div class="dn448-presence-strip">${numberChips}</div></section>
    <section class="dn448-results"><header><strong>missing</strong><span>${text("Số thiếu đã thu được", "Missing numbers collected")}</span></header><div>${results}</div></section>
  </section>`;
  const scroll = $("treeView").querySelector(".dn448-scroll");
  const target = scroll.querySelector(".current") || scroll.querySelector(".target");
  if (target) scroll.scrollLeft = Math.max(0, target.offsetLeft - scroll.clientWidth / 2 + target.offsetWidth / 2);
  const presence = $("treeView").querySelector(".dn448-presence-strip");
  const active = presence.querySelector(".active");
  if (active) presence.scrollLeft = Math.max(0, active.offsetLeft - presence.offsetLeft - presence.clientWidth / 2 + active.offsetWidth / 2);
}
