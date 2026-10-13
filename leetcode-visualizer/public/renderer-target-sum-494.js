function renderTargetSum494View(step) {
  const view = step.targetSum494View;
  const vi = lang === "vi";
  const text = (vietnamese, english) => vi ? vietnamese : english;
  const layers = [new Map([[0, 1]])];

  for (const num of view.nums) {
    const next = new Map();
    for (const [sum, ways] of layers.at(-1)) {
      next.set(sum + num, (next.get(sum + num) || 0) + ways);
      next.set(sum - num, (next.get(sum - num) || 0) + ways);
    }
    layers.push(next);
  }

  const visibleLayers = layers.map((layer) => {
    const sorted = [...layer].sort((a, b) =>
      Math.abs(a[0] - view.target) - Math.abs(b[0] - view.target) || a[0] - b[0],
    );
    return sorted.slice(0, 14).sort((a, b) => a[0] - b[0]);
  });
  const maxNodes = Math.max(1, ...visibleLayers.map((layer) => layer.length));
  const height = Math.max(100, maxNodes * 34 + 34);
  const width = Math.max(140, 90 + view.nums.length * 108);
  const xAt = (layerIndex) => 44 + layerIndex * 108;
  const positions = visibleLayers.map((layer, layerIndex) => {
    const spacing = (height - 40) / Math.max(layer.length, 1);
    return new Map(layer.map(([sum], nodeIndex) => [sum, 20 + spacing * (nodeIndex + 0.5)]));
  });

  const edges = view.nums.map((num, index) => {
    const highlighted = index === view.activeNumIndex;
    return visibleLayers[index].flatMap(([sum]) => [
      [sum, sum + num, "+", "plus"],
      [sum, sum - num, "−", "minus"],
    ].flatMap(([from, to, sign, tone]) => {
      const targetY = positions[index + 1].get(to);
      if (targetY === undefined) return [];
      const sourceY = positions[index].get(from);
      const x1 = xAt(index) + 23;
      const x2 = xAt(index + 1) - 23;
      const middle = (x1 + x2) / 2;
      return [
        `<path class="ts494-edge ${tone}${highlighted ? " active" : ""}" d="M${x1},${sourceY} C${middle},${sourceY} ${middle},${targetY} ${x2},${targetY}"/>`,
        `<text class="ts494-edge-label ${tone}${highlighted ? " active" : ""}" x="${middle}" y="${(sourceY + targetY) / 2 - 2}">${sign}</text>`,
      ];
    })).join("");
  }).join("");

  const nodes = visibleLayers.map((layer, layerIndex) => layer.map(([sum, ways]) => {
    const y = positions[layerIndex].get(sum);
    const active = Number.isInteger(view.activeNumIndex) && layerIndex === view.activeNumIndex + 1;
    const target = sum === view.target;
    const x = xAt(layerIndex);
    return `<g class="ts494-node${active ? " active" : ""}${target ? " target" : ""}" transform="translate(${x} ${y})">
      <circle r="22"/><text class="sum" y="-2">${sum}</text><text class="ways" y="11">×${ways}</text>
    </g>`;
  }).join("")).join("");

  const layerLabels = view.nums.map((num, index) =>
    `<text class="ts494-layer-label" x="${xAt(index + 1)}" y="12">${index + 1}: ±${num}</text>`,
  ).join("");
  const renderDpCell = (ways, sum) =>
    `<span class="ts494-dp-cell${sum === view.subsetTarget ? " target" : ""}${step.highlight?.includes(sum) ? " current" : ""}">
      <small>${sum}</small><strong>${ways}</strong>
    </span>`;
  const dpShown = view.dp.length <= 26
    ? view.dp.map(renderDpCell).join("")
    : (() => {
        const start = Math.max(0, Math.min(view.subsetTarget - 12, view.dp.length - 24));
        return `${start > 0 ? '<span class="ts494-ellipsis">…</span>' : ""}
          ${view.dp.slice(start, start + 24).map((ways, offset) => renderDpCell(ways, start + offset)).join("")}
          ${start + 24 < view.dp.length ? '<span class="ts494-ellipsis">…</span>' : ""}`;
      })();
  const activeTotal = view.currentSum === null ? null : view.currentSum;

  $("treeView").innerHTML = `<section class="ts494-viz" role="img" aria-label="${text("Sơ đồ gán dấu cộng trừ bài 494", "Target Sum 494 sign-assignment diagram")}">
    <header class="ts494-header">
      <div><small>#494 · ${text("GÁN DẤU", "ASSIGN SIGNS")}</small><h3>${text("Mỗi số rẽ thành hai nhánh", "Each number branches two ways")}</h3></div>
      <strong class="ts494-answer">${view.final || view.phase === "infeasible" ? view.answer : "?"}</strong>
    </header>
    <div class="ts494-number-row">${view.nums.map((num, index) =>
      `<span class="${index === view.activeNumIndex ? "active" : ""}">${num}</span>`,
    ).join('<i>→</i>')}<b>🎯 ${view.target}</b></div>
    ${view.phase === "infeasible"
      ? `<div class="ts494-empty">${text("Không có đường đến target", "No path reaches target")}</div>`
      : `      <div class="ts494-graph-scroll"><svg class="ts494-graph" style="width:${width}px" viewBox="0 0 ${width} ${height}" role="presentation">
          ${layerLabels}${edges}${nodes}
        </svg></div>
        <div class="ts494-legend"><span class="plus">＋ ${text("cộng", "add")}</span><span class="minus">− ${text("trừ", "subtract")}</span><span class="target">🎯 ${text("target", "target")}</span></div>
        <section class="ts494-dp">
          <header><strong>${text("Đếm cách", "Count ways")}</strong><span>P = (Σ + target) / 2 = ${view.subsetTarget}</span></header>
          <div class="ts494-dp-cells">${dpShown}</div>
        </section>
        <div class="ts494-equation">${text("Tổng cần chọn", "Subset target")} <b>${view.subsetTarget}</b>
          <span>↔</span> ${text("Tổng có dấu", "Signed sum")} <b>${view.target}</b>
          ${activeTotal === null ? "" : `<em>j = ${activeTotal}</em>`}
        </div>`}
  </section>`;
}
