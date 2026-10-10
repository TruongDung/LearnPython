"use strict";

function renderLongestSubsequence2915View(step) {
  const view = step.longestSubsequence2915View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const transition = view.transition;
  const witness = new Set(view.solutionIndices || transition?.sourceWitness || []);
  const format = (value) => value === -1 ? "−1" : String(value);
  const bestReady = view.bestAtTarget !== -1;

  const inputs = view.nums.map((value, index) => {
    const classes = ["lst2915-item"];
    if (index === view.itemIndex) classes.push("active");
    else if (view.itemIndex !== null && index < view.itemIndex || view.event === "return") classes.push("processed");
    if (witness.has(index)) classes.push("witness");
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><b>${value}</b><em>${index === view.itemIndex ? text("đang xét", "current") : witness.has(index) ? text("witness", "witness") : "&nbsp;"}</em></span>`;
  }).join("");

  let decision = `<p>${text(
    "Mỗi ô dp[s] lưu độ dài lớn nhất, không phải số cách và cũng không phải tổng giá trị.",
    "Each dp[s] cell stores a maximum length—not a count of ways or a sum of values.",
  )}</p>`;
  if (transition) {
    const takeAvailable = transition.reachable;
    decision = `<div class="lst2915-equation">
      <div class="skip"><small>${text("SKIP · không lấy", "SKIP · do not take")}</small><code>dp[${transition.destination}]</code><b>${format(transition.before)}</b></div>
      <span>vs</span>
      <div class="take${takeAvailable ? " available" : ""}"><small>TAKE · +${view.num}</small><code>dp[${transition.source}] + 1</code><b>${takeAvailable ? transition.sourceLength + " + 1 = " + transition.candidate : "−1 · " + text("không thể", "unreachable")}</b></div>
      <span>→</span>
      <div class="result${transition.improved ? " improved" : ""}"><small>BEST</small><code>dp[${transition.destination}]</code><b>${format(transition.after)}</b></div>
    </div>
    <p>${takeAvailable
      ? text(
          `Nguồn ${transition.source} có subsequence dài ${transition.sourceLength}; thêm nums[${view.itemIndex}] = ${view.num} tạo ứng viên dài ${transition.candidate}.`,
          `Source ${transition.source} has length ${transition.sourceLength}; adding nums[${view.itemIndex}] = ${view.num} creates candidate length ${transition.candidate}.`,
        )
      : text(
          `Tổng nguồn ${transition.source} chưa đạt được, nên không được dùng giá trị 0 giả làm một subsequence hợp lệ.`,
          `Source sum ${transition.source} is unreachable, so a fake zero-length subsequence must not be used.`,
        )}</p>`;
  } else if (view.event === "return") {
    decision = `<p>${view.answer === -1
      ? text(`dp[${view.target}] = −1: không có subsequence nào có tổng đúng ${view.target}.`, `dp[${view.target}] = −1: no subsequence sums exactly to ${view.target}.`)
      : text(`dp[${view.target}] = ${view.answer}: đây là độ dài lớn nhất sau khi xét toàn bộ mảng.`, `dp[${view.target}] = ${view.answer}: this is the maximum length after the full array.`)}</p>`;
  } else if (view.itemIndex !== null) {
    decision = `<p>${view.num > view.target
      ? text(`${view.num} > target nên số dương này không thể được chọn.`, `${view.num} > target, so this positive item cannot be selected.`)
      : text(`Duyệt total từ ${view.target} xuống ${view.num}. Mọi nguồn total−num vẫn chưa dùng item hiện tại.`, `Scan total from ${view.target} down to ${view.num}. Every source total−num still excludes the current item.`)}</p>`;
  }

  let table = "";
  if (view.current?.length) {
    const columns = [];
    view.sums.forEach((sum, index) => {
      if (index && sum !== view.sums[index - 1] + 1) columns.push({ gap: true });
      columns.push({ sum, index });
    });
    const grid = `58px ${columns.map((column) => column.gap ? "20px" : "38px").join(" ")}`;
    const headings = columns.map((column) => column.gap
      ? `<span class="lst2915-gap">…</span>`
      : `<span class="lst2915-sum${column.sum === view.target ? " target" : ""}">${column.sum}${column.sum === view.target ? " ★" : ""}</span>`).join("");
    const renderRow = (values, before) => `<div class="lst2915-row ${before ? "before" : "now"}" style="grid-template-columns:${grid}"><strong>${before ? text("Trước", "Before") : text("Hiện tại", "Now")}</strong>${columns.map((column) => {
      if (column.gap) return `<span class="lst2915-gap">…</span>`;
      const value = values[column.index];
      const classes = ["lst2915-cell", value === -1 ? "unreachable" : "reachable"];
      if (column.sum === view.target) classes.push("target");
      if (transition && before && column.sum === transition.source) classes.push("source");
      if (transition && !before && column.sum === transition.destination) classes.push("destination");
      if (!before && value > view.before[column.index]) classes.push("changed");
      return `<span class="${classes.join(" ")}" data-row="${before ? "before" : "now"}" data-sum="${column.sum}" data-length="${value}" title="dp[${column.sum}] = ${value}">${format(value)}</span>`;
    }).join("")}</div>`;
    table = `<div class="lst2915-table-scroll"><div class="lst2915-table"><div class="lst2915-row sums" style="grid-template-columns:${grid}"><strong>${text("Tổng s", "Sum s")}</strong>${headings}</div>${view.itemIndex !== null ? renderRow(view.before, true) : ""}${renderRow(view.current, false)}</div></div>
      <div class="lst2915-legend"><span class="reachable">0..n = ${text("độ dài tốt nhất", "best length")}</span><span>−1 = ${text("chưa đạt được", "unreachable")}</span><span class="source">${text("Tím: nguồn", "Purple: source")}</span><span class="destination">${text("Vàng: đích", "Gold: destination")}</span></div>
      ${view.cropped ? `<p class="lst2915-cropped">${text("Dấu … thu gọn các ô xa vùng đang xét; thuật toán vẫn tính đầy đủ mọi tổng.", "… collapses cells far from the active region; the algorithm still computes every sum.")}</p>` : ""}`;
  }

  const history = view.history.map((entry) => `<div class="lst2915-history-row"><b>[${entry.index}] = ${entry.num}</b><span>${entry.improvedCount
    ? `${text("cải thiện", "improved")} {${entry.improved.join(", ")}${entry.improvedCount > entry.improved.length ? ", …" : ""}}`
    : text("không cải thiện ô nào", "no cells improved")}</span><small>dp[target] = ${entry.bestAtTarget}</small></div>`).join("");

  let solution = "";
  if (view.event === "return" && view.answer !== -1) {
    if (view.solutionIndices) {
      const values = view.solutionIndices.map((index) => view.nums[index]);
      solution = `<section class="lst2915-solution"><header><strong>${text("Một subsequence tối ưu", "One optimal subsequence")}</strong><b>${values.join(" + ")} = ${view.target}</b></header><div>${view.solutionIndices.map((index) => `<span><small>nums[${index}]</small><b>${view.nums[index]}</b></span>`).join("")}</div><p>${text(`Có ${view.answer} phần tử và giữ nguyên thứ tự chỉ số.`, `${view.answer} elements, with indices kept in their original order.`)}</p></section>`;
    } else {
      solution = `<p class="lst2915-witness-note">${text("Input lớn: visualization bỏ witness để giữ bộ nhớ O(target); đáp án độ dài vẫn chính xác.", "Large input: the visualization omits the witness to preserve O(target)-style memory; the length remains exact.")}</p>`;
    }
  }

  $("treeView").innerHTML = `<section class="lst2915-viz" aria-label="${text("Mô phỏng bài 2915", "Problem 2915 simulation")}">
    <header class="lst2915-heading"><div><small>#2915 · 0/1 KNAPSACK · INTERVIEW READY</small><h3>${text("Tổng phải đúng, độ dài phải lớn nhất", "Exact sum, maximum length")}</h3></div><span class="${view.answer === -1 ? "failure" : bestReady ? "success" : "pending"}"><small>dp[target]</small><b>${format(view.bestAtTarget)}</b></span></header>
    <div class="lst2915-rule"><strong>${text("Invariant", "Invariant")}</strong><span>${text("Duyệt total giảm dần: mỗi vị trí nums chỉ được dùng tối đa một lần.", "Scan total downward: each nums occurrence may be used at most once.")}</span></div>
    <section class="lst2915-input-panel"><header><strong>nums</strong><span>target = ${view.target}</span></header><div class="lst2915-items">${inputs}</div></section>
    <div class="lst2915-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <section class="lst2915-decision">${decision}</section>
    <section class="lst2915-table-panel"><header><strong>${text("DP: ĐỘ DÀI LỚN NHẤT CHO MỖI TỔNG", "DP: MAXIMUM LENGTH FOR EACH SUM")}</strong><span>${view.total === null ? "dp[s]" : `total = ${view.total} · ←`}</span></header>${table}</section>
    ${solution}
    <details class="lst2915-direction"><summary>${text("Câu hỏi Google-style: vì sao không duyệt từ trái sang phải?", "Google-style question: why not scan left to right?")}</summary><div><article class="wrong"><b>${text("Duyệt tăng ✕", "Ascending ✕")}</b><code>num = 2: dp[2] → dp[4]</code><p>${text("dp[2] vừa cập nhật lại được dùng ngay cho dp[4], tức chọn cùng một nums[i] hai lần.", "The newly updated dp[2] immediately feeds dp[4], selecting the same nums[i] twice.")}</p></article><article class="correct"><b>${text("Duyệt giảm ✓", "Descending ✓")}</b><code>dp[4] trước, dp[2] sau</code><p>${text("Nguồn luôn thuộc trạng thái trước item hiện tại, nên đúng semantics subsequence 0/1.", "Every source belongs to the state before the current item, preserving 0/1 subsequence semantics.")}</p></article></div></details>
    <details class="lst2915-history"${view.event === "return" ? " open" : ""}><summary>${text("Các tổng được cải thiện sau mỗi item", "Sums improved after each item")}</summary>${history || `<p>${text("Chưa xử lý xong item nào.", "No item has completed yet.")}</p>`}${view.historyOmitted ? `<p>${view.historyOmitted} ${text("item trước đã được thu gọn.", "earlier items are collapsed.")}</p>` : ""}</details>
    ${view.traceTruncated ? `<p class="lst2915-truncated">${text("Trace dài đã được rút gọn; đáp án cuối vẫn tính toàn bộ input.", "The long trace is truncated; the final answer still uses the complete input.")}</p>` : ""}
  </section>`;

  const scroll = $("treeView").querySelector(".lst2915-table-scroll");
  const destination = scroll?.querySelector(".destination");
  if (destination) scroll.scrollLeft = Math.max(0, destination.offsetLeft - scroll.clientWidth / 2);
}
