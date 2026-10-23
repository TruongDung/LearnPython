function renderMatchsticks473View(step) {
  const v = step.matchsticks473View;
  const vi = lang === "vi";
  const t = (vn, en) => vi ? vn : en;
  const esc = (value) => escapeHtml(String(value ?? ""));
  const final = v.mode === "summary" || step.final;
  const placed = new Set(v.placements.map((item) => item.index));
  const probe = v.probe;

  const sortedSticks = v.sticks.map((value, index) => {
    const isCurrent = !final && index === v.index;
    const isUsed = placed.has(index);
    return `<div class="ms473-input-stick${isCurrent ? " current" : ""}${isUsed ? " used" : ""}" title="matchsticks[${index}] = ${value}">
      <small>${index}</small><i class="ms473-stick-art"><b></b></i><strong>${value}</strong>${isUsed ? "<span>✓</span>" : ""}
    </div>`;
  }).join("");

  const edges = [0, 1, 2, 3].map((side) => {
    const members = v.placements.filter((item) => item.side === side);
    const sum = v.sides[side] || 0;
    const active = !final && probe?.side === side;
    const rejected = active && probe.kind === "overflow";
    const duplicate = active && probe.kind === "same-sum";
    const undo = active && ["backtrack", "empty-break"].includes(probe.kind);
    const full = v.target !== null && sum === v.target;
    const orientation = side === 1 || side === 3 ? "vertical" : "horizontal";
    const chips = members.map((item) => `<span class="ms473-placed-stick" title="matchsticks[${item.index}] = ${item.value}">
      <i class="ms473-stick-art"><b></b></i><strong>${item.value}</strong><small>${item.index}</small>
    </span>`).join("");
    const fill = v.target ? Math.min(100, sum / v.target * 100) : 0;
    const status = rejected ? (probe.kind === "same-sum" ? "↔" : "×")
      : undo ? "↩" : full ? "✓" : active ? "●" : "";
    return `<article class="ms473-edge ms473-edge-${side}${active ? " active" : ""}${rejected ? " rejected" : ""}${duplicate ? " duplicate" : ""}${undo ? " undo" : ""}${full ? " full" : ""}" aria-label="${t("Cạnh", "Side")} ${side + 1}">
      <header><span>${side + 1}</span><strong>${sum}${v.target === null ? "" : ` / ${v.target}`}</strong><i>${status}</i></header>
      <div class="ms473-edge-pieces ${orientation}">${chips || "<span class=\"ms473-empty\">⋯</span>"}</div>
      <div class="ms473-meter"><i style="width:${fill}%"></i></div>
    </article>`;
  }).join("");

  const statusText = (() => {
    if (v.phase === "not-divisible") return t("Tổng không chia hết cho 4", "Total is not divisible by 4");
    if (v.phase === "stick-too-long") return t("Que dài hơn một cạnh", "A stick is longer than a side");
    if (v.phase === "over-target") return `${probe?.current ?? ""} + ${v.stick} > ${v.target}`;
    if (v.phase === "skip-symmetric-side") return t("Cạnh này trùng tổng", "Same side total · skip");
    if (v.phase === "undo-stick") return `${t("Lùi lại", "Backtrack")} ↩`;
    if (v.phase === "skip-empty-symmetry") return t("Các cạnh rỗng giống nhau", "Empty sides are symmetric");
    if (v.phase === "square-complete") return t("Đủ 4 cạnh ✓", "All 4 sides filled ✓");
    if (v.phase === "no-square") return t("Không ghép được", "No square");
    if (v.phase === "keep-choice") return t("Giữ cách xếp ✓", "Keep this arrangement ✓");
    if (probe?.side !== undefined && v.stick !== null) return `${v.stick} → ${t("cạnh", "side")} ${probe.side + 1}`;
    if (v.index !== null) return `${t("Que", "Stick")} ${v.index + 1}/${v.sticks.length}`;
    return t("Thử ghép 4 cạnh", "Build four sides");
  })();

  const currentStick = v.stick === null ? (final && v.answer ? "✓" : "—") : v.stick;
  const line = Number.isInteger(v.line)
    ? `<div class="ms473-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`
    : "";
  const examples = [
    { input: "1,1,2,2,2", label: t("Mẫu 1", "Example 1") },
    { input: "2,2,2,2,3,3,7,7", label: t("Quay lui", "Backtrack") },
    { input: "3,3,3,3,4", label: t("Mẫu 2", "Example 2") },
  ].map(({ input, label }) => `<button type="button" data-ms473-example="${esc(input)}">${label}</button>`).join("");

  $("treeView").innerHTML = `<section class="ms473-viz" aria-label="473 Matchsticks to Square">
    <header class="ms473-header"><strong>473 <span>🔥</span></strong><span class="ms473-target">${t("Mỗi cạnh", "Each side")} <b>${v.target ?? "—"}</b></span><span class="ms473-status">${esc(statusText)}</span></header>
    ${line}
    ${!v.detailed ? `<small class="ms473-condensed">${t("Trace đã rút gọn", "Condensed trace")}</small>` : ""}
    <section class="ms473-input-row" aria-label="${t("Các que diêm", "Matchsticks")}">${sortedSticks}</section>
    <div class="ms473-square"><div class="ms473-center">
      <small>${t("MỤC TIÊU", "TARGET")}</small><strong>${v.target ?? "—"}</strong>
      <span>🪵 ${currentStick}</span>
      <small>${v.index === null ? "" : `i = ${v.index} · ${v.callStack.length} ${t("tầng", "calls")}`}</small>
    </div>${edges}</div>
    ${final ? `<div class="ms473-result ${v.answer ? "yes" : "no"}"><span>${v.answer ? "✓" : "×"}</span><strong>${v.answer ? "True" : "False"}</strong><small>${v.answer ? t("Tạo được hình vuông", "Square formed") : t("Không thể tạo hình vuông", "Cannot form a square")}</small></div>` : ""}
    <footer class="ms473-legend"><span>🪵 ${t("que hiện tại", "current stick")}</span><span>↩ ${t("quay lui", "backtrack")}</span><span>↔ ${t("bỏ nhánh trùng", "skip duplicate")}</span></footer>
    <nav class="ms473-examples">${examples}</nav>
  </section>`;

  const edgeNodes = [...$("treeView").querySelectorAll(".ms473-edge")];
  const positions = ["top", "right", "bottom", "left"];
  edgeNodes.forEach((node, index) => node.classList.add(`at-${positions[index]}`));
  $("treeView").querySelectorAll("[data-ms473-example]").forEach((button) => button.addEventListener("click", () => {
    $("arrInput").value = button.dataset.ms473Example;
    runViz();
  }));
}
