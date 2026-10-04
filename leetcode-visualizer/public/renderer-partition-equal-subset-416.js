function renderEqualSubset416View(step) {
  const view = step.equalSubset416View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const tr = view.transition;
  const item = view.itemIndex;
  const bit = value => value ? "True" : "False";
  const targetReached = view.current?.[view.sums.indexOf(view.target)] === true;
  const sourceIndices = new Set(tr?.sourceWitness || []);
  const inputs = view.nums.map((num, index) => `<span class="pe416-input${index === item ? " active" : item !== null && index < item || view.event === "return" ? " processed" : ""}${sourceIndices.has(index) ? " witness" : ""}"><small>[${index}]</small><b>${num}</b><span>${index === item ? text("đang xét", "current") : sourceIndices.has(index) ? text("nhóm nguồn", "source group") : "&nbsp;"}</span></span>`).join("");
  let focus;
  if (tr) {
    const updated = view.event === "update";
    focus = `<div class="pe416-formula"><div><small>${text("Không chọn số này", "Skip this number")}</small><code>dp[${tr.destination}]</code><b>${bit(tr.before)}</b></div><span>OR</span><div class="pe416-source"><small>${text("Chọn số", "Use number")} ${view.num}</small><code>dp[${tr.source}]</code><b>${bit(tr.from)}</b></div><span>→</span><div class="pe416-destination"><small>${updated ? text("Sau cập nhật", "After update") : text("Sẽ nhận", "Will become")}</small><code>dp[${tr.destination}]</code><b>${bit(tr.after)}</b></div></div>`;
    const values = tr.sourceWitness.map(index => view.nums[index]);
    focus += `<p class="pe416-proof">${tr.from ? `<b>${values.length ? values.join(" + ") : "0"}</b> + <b>${view.num}</b> = <b>${tr.destination}</b> · ${text("nhóm nguồn chỉ dùng các số trước đó", "the source group uses only earlier occurrences")}` : tr.before ? text("Tổng này đã tạo được từ trước; không cần chọn số hiện tại.", "This sum was already reachable; the current number can be skipped.") : text(`Chưa tạo được tổng ${tr.source}; chưa thể thêm ${view.num} để đạt ${tr.destination}.`, `Sum ${tr.source} is unreachable; adding ${view.num} cannot reach ${tr.destination}.`)}</p>`;
  } else if (view.answer !== null) {
    focus = `<p>${view.answer ? text("Đã tìm được một nhóm tổng target. Các phần tử còn lại tạo thành nhóm thứ hai có cùng tổng.", "A subset reaches target. All remaining occurrences form the other group with the same sum.") : view.target === null ? text("Tổng lẻ không thể tách thành hai tổng nguyên bằng nhau. Không cần tạo bảng DP.", "An odd total cannot split into two equal integer sums. No DP table is needed.") : text(`Sau khi xét tất cả số, vẫn không tạo được tổng ${view.target}.`, `After processing every number, sum ${view.target} remains unreachable.`)}</p>`;
  } else if (item !== null) {
    focus = `<p>${text("Đang xét", "Current number")}: <b>${view.num}</b> · ${view.num > view.target ? text("Lớn hơn target, bỏ qua.", "Exceeds target; skip it.") : text(`Duyệt tổng j từ ${view.target} xuống ${view.num}. Hàng Trước được giữ nguyên để so sánh.`, `Scan sum j from ${view.target} down to ${view.num}. The Before row is kept unchanged for comparison.`)}</p>`;
  } else focus = `<p>${text("dp[s] = True nghĩa là có thể chọn một số phần tử đã xét để có tổng s. Tổng 0 tương ứng với nhóm rỗng.", "dp[s] = True means some processed occurrences can form sum s. Sum 0 corresponds to the empty group.")}</p>`;

  let table = `<div class="pe416-empty">${view.answer === false ? text("Tổng lẻ → trả về False ngay", "Odd total → return False immediately") : text("Bảng DP sẽ xuất hiện sau khi tính target", "The DP table appears after target is calculated")}</div>`;
  if (view.current) {
    const columns = [];
    let left = 52;
    view.sums.forEach((sum, index) => {
      if (index > 0 && sum !== view.sums[index - 1] + 1) { columns.push({ gap: true, left, width: 18 }); left += 22; }
      columns.push({ sum, index, left, width: 34 }); left += 38;
    });
    const width = left - 4;
    const grid = `48px ${columns.map(column => `${column.width}px`).join(" ")}`;
    const numbers = columns.map(column => column.gap ? `<span class="pe416-gap">…</span>` : `<span class="pe416-sum${column.sum === view.target ? " goal" : ""}">${column.sum}${column.sum === view.target ? " ★" : ""}</span>`).join("");
    const row = (values, before) => `<div class="pe416-dp-row ${before ? "before" : "now"}" style="grid-template-columns:${grid}"><strong>${before ? text("Trước", "Before") : text("Hiện tại", "Now")}</strong>${columns.map(column => {
      if (column.gap) return `<span class="pe416-gap">…</span>`;
      const reachable = values[column.index];
      const classes = ["pe416-cell", reachable ? "yes" : "no"];
      if (column.sum === view.target) classes.push("goal");
      if (tr && column.sum === tr.source && before) classes.push("source");
      if (tr && column.sum === tr.destination && !before) classes.push("destination");
      if (!before && !view.before[column.index] && reachable) classes.push("new");
      return `<span class="${classes.join(" ")}" data-row="${before ? "before" : "now"}" data-sum="${column.sum}" data-reachable="${reachable}" title="dp[${column.sum}] = ${bit(reachable)}">${reachable ? "✓" : "·"}</span>`;
    }).join("")}</div>`;
    let arrow = "";
    if (tr) {
      const start = columns.find(column => column.sum === tr.source).left + 17;
      const end = columns.find(column => column.sum === tr.destination).left + 17;
      arrow = `<svg class="pe416-transfer" width="${width}" height="28" role="img" aria-label="${text("Thêm số hiện tại vào tổng nguồn", "Add current number to source sum")}"><defs><marker id="pe416-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" /></marker></defs><path d="M${start},1 C${start},14 ${end},14 ${end},25" marker-end="url(#pe416-arrow)" /></svg>`;
    }
    table = `<div class="pe416-table-scroll"><div class="pe416-dp-table" style="width:${width}px"><div class="pe416-dp-row sums" style="grid-template-columns:${grid}"><strong>${text("Tổng s", "Sum s")}</strong>${numbers}</div>${item !== null ? row(view.before, true) + `<div class="pe416-arrow-space">${arrow}</div>` : ""}${row(view.current, false)}</div></div><div class="pe416-legend"><span class="yes">✓ = ${text("tạo được tổng", "reachable sum")}</span><span>· = ${text("chưa tạo được", "unreachable")}</span><span class="source">${text("Tím: tổng nguồn j−num", "Purple: source sum j−num")}</span><span class="destination">${text("Vàng: tổng đang cập nhật j", "Gold: destination sum j")}</span></div>${view.cropped ? `<p class="pe416-cropped">${text("Các ô có dấu … được thu gọn để tập trung vào nguồn, đích và target. DP vẫn tính mọi tổng.", "… collapses other cells to focus on the source, destination, and target. DP still computes every sum.")}</p>` : ""}`;
  }
  const history = view.history.map(row => `<div class="pe416-history-row"><b>${text("Sau", "After")} [${row.item}] = ${row.num}</b><span>${row.addedCount ? `+ {${row.added.join(", ")}${row.addedCount > row.added.length ? ", …" : ""}}` : text("không có tổng mới", "no new sums")}</span><small>${row.reachableCount} ${text("tổng tạo được", "reachable sums")}</small></div>`).join("");
  const group = (label, indices) => `<div class="pe416-group"><header><b>${label}</b><strong>Σ = ${indices.reduce((sum, index) => sum + view.nums[index], 0)}</strong></header><div>${indices.map(index => `<span title="nums[${index}]"><b>${view.nums[index]}</b><small>[${index}]</small></span>`).join("")}</div></div>`;
  const partition = view.partition ? `<section class="pe416-partition">${group(text("Nhóm A", "Group A"), view.partition.a)}${group(text("Nhóm B", "Group B"), view.partition.b)}</section>` : "";
  $("treeView").innerHTML = `<section class="pe416-viz" aria-label="${text("Mô phỏng chia mảng tổng bằng nhau 416", "416 equal subset partition simulation")}">
    <header class="pe416-heading"><div><small>416 · 0/1 KNAPSACK</small><h3>${text("Chỉ cần tìm một nhóm có tổng target", "Find one group whose sum is target")}</h3></div><span class="${view.answer === false ? "false" : targetReached ? "true" : "pending"}">${view.answer !== null ? bit(view.answer) : `dp[target] = ${view.current ? bit(targetReached) : "?"}`}</span></header>
    <div class="pe416-goal"><div><small>${text("Tổng tất cả", "Total sum")}</small><b>${view.total}</b></div><span>÷ 2 →</span><div><small>target · ${text("mỗi nhóm", "each group")}</small><b>${view.target ?? (view.answer === false ? `${view.total / 2} ✕` : "?")}</b></div></div>
    <section class="pe416-input-panel"><header><strong>nums</strong><span>${text("Mỗi vị trí chỉ dùng một lần", "Each occurrence is used once")}</span></header><div class="pe416-inputs">${inputs}</div></section>
    <div class="pe416-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <section class="pe416-focus">${focus}</section>
    <section class="pe416-table-panel"><header><strong>${text("BẢNG CÁC TỔNG TẠO ĐƯỢC", "REACHABLE SUMS TABLE")}</strong><span>${item !== null && view.num <= view.target ? `j: ${view.target} → ${view.num} · ←` : "dp[s]"}</span></header>${table}</section>
    ${partition}
    <details class="pe416-direction"><summary>${text("Vì sao phải duyệt từ phải sang trái?", "Why scan from right to left?")}</summary><p>${text("Ví dụ chỉ có một số 2, ban đầu chỉ dp[0] = True.", "With just one occurrence of 2, initially only dp[0] is True.")}</p><div class="wrong"><b>${text("Duyệt thuận ✕", "Left to right ✕")}</b><code>0 → 2 → 4</code><span>${text("Ô 2 vừa được bật lại làm nguồn cho ô 4: dùng cùng số 2 hai lần.", "Newly reached 2 feeds 4: the same occurrence of 2 is used twice.")}</span></div><div class="correct"><b>${text("Duyệt ngược ✓", "Right to left ✓")}</b><code>4: False → 2: True</code><span>${text("Kiểm tra ô 4 khi ô 2 vẫn False, rồi mới bật ô 2. Một số 2 không tạo được tổng 4.", "Check 4 while 2 is still False, then mark 2. One occurrence of 2 cannot make sum 4.")}</span></div></details>
    <details class="pe416-history"${view.event === "return" ? " open" : ""}><summary>${text("Tổng mới sau mỗi số", "New sums after each number")}</summary>${history || `<p>${text("Chưa xử lý xong số nào.", "No number has been fully processed yet.")}</p>`}${view.historyOmitted ? `<p>${view.historyOmitted} ${text("hàng trước được thu gọn.", "earlier rows are collapsed.")}</p>` : ""}</details>
    ${view.shortened ? `<p class="pe416-shortened">${text("Trace dài đã được rút gọn; khung cuối và hai nhóm kết quả vẫn dùng toàn bộ đầu vào.", "The long trace is shortened; the final state and partition still use the complete input.")}</p>` : ""}
  </section>`;
  const scroll = $("treeView").querySelector(".pe416-table-scroll");
  const destination = scroll?.querySelector(".destination");
  if (destination) scroll.scrollLeft = Math.max(0, destination.offsetLeft - scroll.clientWidth / 2 + destination.offsetWidth / 2);
}
