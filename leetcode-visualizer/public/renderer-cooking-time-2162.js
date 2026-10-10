"use strict";

function renderCookingTime2162View(step) {
  const view = step.cookingTime2162View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const active = view.activePlan === null ? null : view.plans[view.activePlan];
  const phaseIndex = ["intro"].includes(view.phase) ? 0
    : ["candidate", "invalid"].includes(view.phase) ? 1
      : view.phase === "press" ? 2
        : ["candidate-done", "answer"].includes(view.phase) ? 3 : -1;
  const pipelineLabels = [
    ["1. Tạo 2 cách", "1. Make 2 forms"],
    ["2. Kiểm tra mm:ss", "2. Validate mm:ss"],
    ["3. Mô phỏng phím", "3. Simulate keys"],
    ["4. Lấy min", "4. Take minimum"],
  ];
  const pipeline = pipelineLabels.map((pair, index) => `<span class="${index === phaseIndex ? "active" : ""}${index < phaseIndex ? " done" : ""}">${text(...pair)}</span>`).join("");

  const planCards = view.plans.map((plan, index) => {
    const label = plan.kind === "normal" ? text("Divmod", "Divmod") : text("Mượn 1 phút", "Borrow 1 minute");
    const classes = ["mc2162-plan", index === view.activePlan ? "active" : "", !plan.valid ? "invalid" : "", plan.cost !== null ? "done" : ""].filter(Boolean).join(" ");
    return `<article class="${classes}"><header><strong>${label}</strong><span>${plan.valid ? "✓ valid" : "× invalid"}</span></header><div><b>${plan.minutes}</b><em>:</em><b>${String(plan.seconds).padStart(2, "0")}</b></div><p>${plan.valid ? `${text("bấm", "type")} “${plan.digits}”` : text("ngoài miền 0..99", "outside 0..99")}</p><footer><small>cost</small><strong>${plan.cost === null ? "?" : plan.cost}</strong></footer></article>`;
  }).join("");

  const keypad = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [null, 0, null]].flat().map((digit) => {
    if (digit === null) return `<span class="mc2162-key blank"></span>`;
    const classes = ["mc2162-key", digit === view.finger ? "finger" : "", view.event?.digit === digit ? "pressed" : ""].filter(Boolean).join(" ");
    return `<span class="${classes}"><b>${digit}</b>${digit === view.finger ? `<small>☝</small>` : ""}</span>`;
  }).join("");

  let sequence = `<p class="mc2162-empty">${text("Chọn một cách biểu diễn hợp lệ để bắt đầu bấm.", "Choose a valid representation to start pressing.")}</p>`;
  if (active?.valid) {
    sequence = `<div class="mc2162-sequence">${[...active.digits].map((digit, index) => `<span class="${index === view.pressIndex ? "active" : ""}${index < (view.pressIndex ?? -1) ? " done" : ""}"><small>#${index + 1}</small><b>${digit}</b></span>`).join("")}</div>`;
  }

  const receipt = active?.events.length
    ? active.events.map((event) => `<div class="mc2162-event${event.index === view.pressIndex ? " active" : ""}"><span>#${event.index + 1}</span><b>${event.before}${event.moved ? " → " : " = "}${event.digit}</b><em>${event.moved ? `move +${event.moveCharge}` : text("không di", "no move")}</em><em>push +${event.pushCharge}</em><strong>${event.total}</strong></div>`).join("")
    : `<p>${text("Chưa có lần bấm nào.", "No key presses yet.")}</p>`;

  const validCosts = view.plans.filter((plan) => plan.valid && plan.cost !== null).map((plan) => plan.cost);
  const bestKnown = validCosts.length ? Math.min(...validCosts) : null;
  $("treeView").innerHTML = `<section class="mc2162-viz" aria-label="${text("Mô phỏng bài 2162", "Problem 2162 simulation")}">
    <header class="mc2162-heading"><div><small>#2162 · MEDIUM · ENUMERATION + SIMULATION</small><h3>${text("Hai cách đặt cùng một thời gian", "Two ways to enter the same time")}</h3></div><span class="${view.phase === "answer" ? "success" : ""}"><small>min cost</small><b>${view.answer ?? bestKnown ?? "?"}</b></span></header>
    <div class="mc2162-target"><div><small>targetSeconds</small><b>${view.targetSeconds}</b></div><code>${view.targetSeconds} = ${view.baseMinutes} × 60 + ${view.baseSeconds}</code><span>${text("Ngón tay bắt đầu tại", "Finger starts at")} <b>${view.startAt}</b></span></div>
    <nav class="mc2162-pipeline" aria-label="${text("Các bước thuật toán", "Algorithm stages")}">${pipeline}</nav>
    <section class="mc2162-plans">${planCards}</section>
    <div class="mc2162-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="mc2162-workspace">
      <section class="mc2162-panel mc2162-keypad"><header><strong>Keypad</strong><span>finger = ${view.finger}</span></header><div class="mc2162-keys">${keypad}</div><div class="mc2162-costs"><span>moveCost <b>${view.moveCost}</b></span><span>pushCost <b>${view.pushCost}</b></span></div></section>
      <section class="mc2162-panel mc2162-typing"><header><strong>${text("Chuỗi cần bấm", "Digits to type")}</strong><span>${active?.valid ? `${active.padded} → ${active.digits}` : "—"}</span></header>${sequence}<div class="mc2162-receipt"><div class="mc2162-receipt-head"><span>#</span><span>${text("ngón tay", "finger")}</span><span>move</span><span>push</span><span>total</span></div>${receipt}</div></section>
    </div>
    <details class="mc2162-proof"${view.phase === "answer" ? " open" : ""}><summary>${text("Vì sao chỉ có 2 ứng viên?", "Why are there only two candidates?")}</summary><div><article><b>${text("Cách chuẩn", "Normal form")}</b><code>(t // 60, t % 60)</code><p>${text("Giây nằm trong 0..59.", "Seconds are in 0..59.")}</p></article><article><b>${text("Mượn một phút", "Borrow one minute")}</b><code>(m − 1, s + 60)</code><p>${text("Đây là cách duy nhất khác còn giữ nguyên tổng giây và có thể có seconds ≤ 99.", "This is the only other equal-total form that can still have seconds ≤ 99.")}</p></article></div><p>${text("Zero đầu luôn bỏ được: bấm thêm phím có chi phí dương nhưng không đổi mm:ss sau khi pad.", "Leading zeroes are always omitted: extra presses have positive cost but do not change the padded mm:ss.")}</p></details>
  </section>`;
}
