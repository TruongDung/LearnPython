function renderSplitArraySameAverage805View(step) {
  const view = step.sameAverage805View;
  if (!view) return;
  const vi = lang === "vi";
  const text = (vn, en) => vi ? vn : en;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
  const numbers = view.nums.map((value, index) => {
    const selected = view.witnessMask !== null && (view.witnessMask & (1 << index));
    const current = index === view.itemIndex && view.phase === "item";
    const untouched = index > view.itemIndex && view.phase === "item";
    return `<span class="sa805-number${current ? " is-current" : ""}${selected ? " is-selected" : ""}${untouched ? " is-waiting" : ""}">${value}</span>`;
  }).join("");
  const candidateChips = view.candidates.length
    ? view.candidates.map(({ size, target }) => `<span class="sa805-candidate${view.after.find((entry) => entry.size === size)?.reachable ? " is-hit" : ""}"><small>k=${size}</small><b>${target}</b></span>`).join("")
    : `<span class="sa805-none">${text("Không có tổng nguyên", "No integer target")}</span>`;

  const beforeBySize = new Map(view.before.map((item) => [item.size, item]));
  const afterBySize = new Map(view.after.map((item) => [item.size, item]));
  const plotLeft = 126;
  const plotRight = 674;
  const plotWidth = 740;
  const rowHeight = 48;
  const plotHeight = Math.max(90, view.candidates.length * rowHeight + 34);
  const x = (value) => plotLeft + (value / view.total) * (plotRight - plotLeft);
  const dots = (entry, y, className) => (entry?.sums || []).map((sum) => `<circle class="${className}" cx="${x(sum)}" cy="${y}" r="2.7"><title>${sum}</title></circle>`).join("");
  const tracks = view.candidates.map(({ size, target }, index) => {
    const y = 24 + index * rowHeight;
    const before = beforeBySize.get(size);
    const after = afterBySize.get(size);
    const reached = Boolean(after?.reachable);
    return `<g class="sa805-track">
      <text class="sa805-track-label" x="8" y="${y + 4}">k=${size}</text>
      <text class="sa805-track-target" x="50" y="${y + 4}">${target}</text>
      <line class="sa805-track-line" x1="${plotLeft}" x2="${plotRight}" y1="${y}" y2="${y}"/>
      ${dots(before, y + 7, "sa805-dot-before")}${dots(after, y - 7, "sa805-dot-after")}
      <line class="sa805-target-line" x1="${x(target)}" x2="${x(target)}" y1="${y - 15}" y2="${y + 15}"/>
      <circle class="${reached ? "sa805-target-found" : "sa805-target-open"}" cx="${x(target)}" cy="${y - 7}" r="5"/>
      <text class="sa805-count" x="${plotRight + 7}" y="${y + 4}">${after?.stateCount ?? 0}</text>
    </g>`;
  }).join("");
  const axisY = 24 + view.candidates.length * rowHeight;
  const chart = view.candidates.length
    ? `<div class="sa805-chart-wrap"><svg class="sa805-chart" viewBox="0 0 ${plotWidth} ${plotHeight}" role="img" aria-label="${text("Các tổng tập con khả thi và mục tiêu cần đạt", "Reachable subset sums and required targets")}">
        ${tracks}<line class="sa805-axis" x1="${plotLeft}" x2="${plotRight}" y1="${axisY}" y2="${axisY}"/><text class="sa805-axis-label" x="${plotLeft}" y="${axisY + 18}">0</text><text class="sa805-axis-label" x="${plotRight}" y="${axisY + 18}" text-anchor="end">${view.total}</text>
      </svg></div>`
    : `<div class="sa805-no-candidates">${text("Không có k nào để total × k ÷ n ra số nguyên.", "No k makes total × k ÷ n an integer.")}</div>`;

  let split = "";
  if (view.phase === "done" && view.answer && view.witnessMask !== null) {
    const chosen = view.nums.filter((_, index) => view.witnessMask & (1 << index));
    const rest = view.nums.filter((_, index) => !(view.witnessMask & (1 << index)));
    const avg = (values) => `${values.reduce((sum, value) => sum + value, 0)} / ${values.length}`;
    split = `<div class="sa805-split">
      <div class="sa805-pile is-picked"><div>${chosen.map((value) => `<i>${value}</i>`).join("")}</div><b>${avg(chosen)} = ${view.total}/${view.n}</b></div>
      <span class="sa805-equal">=</span>
      <div class="sa805-pile"><div>${rest.map((value) => `<i>${value}</i>`).join("")}</div><b>${avg(rest)} = ${view.total}/${view.n}</b></div>
    </div>`;
  }
  const progress = view.phase === "item" ? `${view.processedCount} / ${view.n}` : `${view.n} ${text("số", "numbers")}`;
  const average = `${view.total} / ${view.n}`;
  const answer = view.answer === null ? "" : `<div class="sa805-answer${view.answer ? " is-yes" : " is-no"}">${view.answer ? "✓" : "×"}</div>`;

  $("treeView").innerHTML = `<section class="sa805-viz" aria-label="${text("Trực quan hóa bài 805", "Problem 805 visualization")}" aria-live="polite">
    <header class="sa805-head"><strong>#805 · ${text("Cùng trung bình", "Same average")}</strong><span>${average} <i>=</i> ${Number((view.total / view.n).toFixed(2))}</span>${answer}</header>
    <div class="sa805-numbers">${numbers}</div>
    <div class="sa805-formula"><span>k</span><i>→</i><span>total × k ÷ n</span><i>→</i><b>${text("tổng cần tìm", "target sum")}</b></div>
    <div class="sa805-candidates">${candidateChips}</div>
    <div class="sa805-legend"><span><i class="before"></i>${text("Trước", "Before")}</span><span><i class="after"></i>${text("Sau", "After")}</span><span><i class="target"></i>${text("Mục tiêu", "Target")}</span></div>
    ${chart}
    ${split}
    ${view.phase !== "done" && view.phase !== "no-size" ? `<footer class="sa805-foot"><span>${progress}</span><span>${text("Tổng", "Total")} = ${view.total}</span></footer>` : ""}
  </section>`;
}
