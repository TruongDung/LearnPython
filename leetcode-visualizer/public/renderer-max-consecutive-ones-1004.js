function renderMaxConsecutiveOnes1004View(step) {
  const view = step.maxConsecutiveOnes1004View || {};
  const vi = lang === "vi";
  const text = (viText, enText) => vi ? viText : enText;
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const windowSet = new Set(Array.isArray(view.windowIndices) ? view.windowIndices : []);
  const bestSet = new Set(Array.isArray(view.bestIndices) ? view.bestIndices : []);
  const countedSet = new Set(Array.isArray(view.countedZeroIndices) ? view.countedZeroIndices : []);
  const phaseIndex = { init: 0, expand: 0, validate: 1, shrink: 2, record: 3, done: 3 }[view.phase] ?? 0;
  const phases = [
    ["→", text("Mở rộng", "Expand")],
    ["0/k", text("Kiểm tra", "Check")],
    ["←", text("Co trái", "Shrink")],
    ["★", text("Lưu best", "Save best")],
  ].map(([icon, label], index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}" aria-label="${label}">${index < phaseIndex ? "✓" : icon}</span>`).join("");

  const cells = nums.map((value, index) => {
    const inWindow = windowSet.has(index);
    const flipped = inWindow && value === 0 && countedSet.has(index);
    const pendingZero = inWindow && value === 0 && !countedSet.has(index);
    const classes = ["ones1004-cell"];
    if (inWindow) classes.push("in-window");
    if (bestSet.has(index)) classes.push("in-best");
    if (flipped) classes.push(view.valid ? "flipped" : "overflow");
    if (pendingZero) classes.push("pending");
    if (index === view.activeIndex) classes.push("active");
    if (index === view.removedIndex) classes.push("removed");
    const pointers = `${index === view.left && view.right >= view.left ? "L" : ""}${index === view.left && index === view.right ? "·" : ""}${index === view.right ? "R" : ""}`;
    const shownValue = flipped && view.valid ? 1 : value;
    return `<article class="${classes.join(" ")}" aria-label="i=${index}, value=${value}">
      <small>${pointers || "&nbsp;"}</small><strong>${shownValue}</strong>${flipped ? `<i>0→1</i>` : ""}<em>${index}</em>${bestSet.has(index) ? "<b>★</b>" : ""}
    </article>`;
  }).join("");

  const usedZeroIndexes = Array.isArray(view.countedZeroIndices) ? view.countedZeroIndices : [];
  const budgetSlots = Array.from({ length: view.k }, (_, slot) => {
    const zeroIndex = usedZeroIndexes[slot];
    return `<span class="${zeroIndex == null ? "free" : "used"}"><b>${zeroIndex == null ? "+" : "0→1"}</b><small>${zeroIndex == null ? "" : `i=${zeroIndex}`}</small></span>`;
  }).join("");
  const overflow = Math.max(0, view.zeroCount - view.k);
  const overflowSlots = overflow ? `<span class="over"><b>+${overflow}</b><small>!</small></span>` : "";
  const budgetEmpty = view.k === 0 ? `<span class="none"><b>∅</b><small>k=0</small></span>` : "";

  const bestValues = bestSet.size
    ? nums.map((value, index) => bestSet.has(index)
      ? `<span class="${value === 0 ? "changed" : ""}"><b>1</b><small>${index}</small></span>`
      : "").join("")
    : "<span class=\"empty\">—</span>";

  const shortAction = (() => {
    if (view.event === "expand") return `R → ${view.right}`;
    if (view.event === "inspect-right") return `nums[R] = ${nums[view.right] ?? "—"}`;
    if (view.event === "use-flip") return `0→1 · ${view.zeroCount}/${view.k}`;
    if (view.event === "validate") return `${view.zeroCount} ${view.valid ? "≤" : ">"} ${view.k} ${view.valid ? "✓" : "✕"}`;
    if (view.event === "inspect-left") return `nums[L] = ${nums[view.left] ?? "—"}`;
    if (view.event === "refund-flip") return `↩ i=${view.removedIndex}`;
    if (view.event === "move-left") return `L → ${view.left}`;
    if (view.event === "record-best") return `★ ${view.previousMax} → ${view.maxLength}`;
    if (view.event === "keep-best" || view.event === "done") return `★ ${view.maxLength}`;
    return "…";
  })();
  const statusClass = view.valid ? "valid" : "invalid";

  $("treeView").innerHTML = `<section class="ones1004-viz" role="group" aria-label="${text("Mô phỏng sliding window bài 1004", "LeetCode 1004 sliding-window simulation")}">
    <header class="ones1004-heading">
      <div><small>#1004 · SLIDING WINDOW</small><h3>k = ${view.k}</h3></div>
      <div class="ones1004-stats"><span>L<b>${view.left}</b></span><span>R<b>${view.right >= 0 ? view.right : "—"}</b></span><span>0/k<b>${view.zeroCount}/${view.k}</b></span><span>★<b>${view.maxLength}</b></span></div>
    </header>
    <div class="ones1004-stage"><div class="ones1004-phases">${phases}</div><strong class="${statusClass}">${shortAction}</strong></div>
    <section class="ones1004-array ${statusClass}">
      <header><strong>[${view.left}..${view.right >= 0 ? view.right : "—"}]</strong><b>${view.valid ? "✓" : "✕"}</b></header>
      <div class="ones1004-cells" style="--ones1004-count:${Math.max(nums.length, 1)}">${cells}</div>
    </section>
    <div class="ones1004-bottom">
      <section class="ones1004-budget ${statusClass}"><header><strong>${text("Lượt flip", "Flip slots")}</strong><b>${view.zeroCount}/${view.k}</b></header><div>${budgetSlots}${overflowSlots}${budgetEmpty}</div></section>
      <section class="ones1004-best"><header><strong>★ BEST</strong><b>${view.maxLength}</b></header><div>${bestValues}</div></section>
    </div>
  </section>`;
}
