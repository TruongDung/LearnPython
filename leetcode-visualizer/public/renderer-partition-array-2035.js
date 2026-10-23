function renderPartitionArray2035View(step) {
  const v = step.partition2035View; if (!v) return;
  const vi = lang === "vi"; const t = (a, b) => vi ? a : b;
  const selected = new Set(v.bestPair?.indices || []);
  const active = new Set([...(v.activeLeft?.indices || []), ...(v.activeRight?.indices || [])]);
  const nums = v.nums.map((x, i) => `<span class="p2035-num ${i < v.n ? "left" : "right"} ${active.has(i) ? "active" : ""} ${selected.has(i) ? "best" : ""}">${x}</span>`).join("");
  const count = v.activeCount ?? 0; const left = v.left[count] || []; const right = v.right[v.n - count] || [];
  const leftCards = left.slice(-14).map(x => `<span class="p2035-chip ${v.activeLeft?.mask === x.mask ? "active" : ""} ${v.bestPair?.left === x.sum && v.bestPair?.indices.some(i => i < v.n) ? "best" : ""}">${x.sum}</span>`).join("");
  const rightCards = right.map(x => `<span class="p2035-cell ${v.activeRight?.mask === x.mask ? "active" : ""} ${v.bestPair?.right === x.sum && v.bestPair?.indices.some(i => i >= v.n) ? "best" : ""}">${x.sum}</span>`).join("");
  const pointer = (x, cls) => {
    if (!x) return ""; const i = right.findIndex(y => y.mask === x.mask);
    return `<i class="p2035-pointer ${cls}" style="--pos:${right.length > 1 ? i / (right.length - 1) * 100 : 50}%">▼</i>`;
  };
  const picked = v.activeLeft && v.activeRight ? `${v.activeLeft.sum} + ${v.activeRight.sum} = ${v.activeLeft.sum + v.activeRight.sum}` : t("Chọn hai tổng", "Pair two sums");
  $("treeView").innerHTML = `<section class="p2035-viz" aria-label="${t("Minh họa chia mảng 2035", "Problem 2035 partition visualization")}" aria-live="polite">
    <header><div><span>2035</span><b>⚖️ ${t("Chia đều", "Equal split")}</b></div><strong>Δ ${v.answer ?? "—"}</strong></header>
    <div class="p2035-array">${nums}<i>✂</i></div>
    <div class="p2035-halves"><article class="left"><b>🔵 ${t("Trái", "Left")}</b><div>${leftCards}</div></article><article class="right"><b>🟣 ${t("Phải", "Right")}</b><div>${rightCards || "…"}</div></article></div>
    <div class="p2035-join"><div class="p2035-axis">${right.map(x=>`<span class="${x===v.activeRight?"active":""}">${x.sum}</span>`).join("")}${pointer(Number.isInteger(v.middle)?right[v.middle]:null,"mid")}${pointer(v.activeRight,"pick")}</div><div class="p2035-equation"><span>${picked}</span><b>${v.activeLeft&&v.activeRight?`Δ ${Math.abs(v.total-2*(v.activeLeft.sum+v.activeRight.sum))}`:""}</b></div>
    ${v.bestPair?`<footer>🏆 ${v.bestPair.left} + ${v.bestPair.right} = ${v.bestPair.sum}<b>Δ ${v.bestPair.gap}</b></footer>`:""}</div>
  </section>`;
}
