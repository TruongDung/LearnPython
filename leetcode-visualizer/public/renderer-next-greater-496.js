function renderNextGreater496View(step) {
  const view = step.nextGreater496View;
  const vi = lang === "vi";
  const t = (vietnamese, english) => vi ? vietnamese : english;
  const readingNums1 = view.phase === "lookup" || view.phase === "answer";
  const currentIndex = readingNums1 ? view.lookupIndex : view.index;
  const currentValue = readingNums1 ? view.lookupValue : view.value;
  const top = view.stack.at(-1);
  const target = view.resolved;
  const comparison = !readingNums1 && view.compareIndex >= 0
    ? {
        value: view.nums2[view.compareIndex],
        greater: view.value > view.nums2[view.compareIndex],
      }
    : null;
  const tokens = view.nums2.map((value, index) => {
    const state = index === view.index ? "current" : index === view.compareIndex ? "candidate" : index < view.index ? "visited" : "";
    return `<span class="nge496-token ${state}">
      <small>${index}</small><strong>${value}</strong>
      ${index === view.index ? `<em>${t("MỚI", "NOW")}</em>` : ""}
      ${index === view.compareIndex ? `<em>${t("CHỜ", "WAIT")}</em>` : ""}
    </span>`;
  }).join("");
  const stackItems = [...view.stack].reverse().map((item, index) => `<span class="nge496-stack-item${index === 0 ? " top" : ""}${target?.index === item.index ? " resolved" : ""}">
    <small>${item.index}</small><strong>${item.value}</strong>${index === 0 ? `<em>${t("ĐỈNH", "TOP")}</em>` : ""}
  </span>`).join("");
  const mappings = view.nextGreater.map(({ from, to }) => `<span class="nge496-pair"><b>${from}</b><i>→</i><b>${to}</b></span>`).join("");
  const answers = view.nums1.map((value, index) => `<span class="nge496-answer${index === currentIndex && readingNums1 ? " active" : ""}${view.result[index] !== null ? " filled" : ""}">
    <small>${value}</small><i>→</i><strong>${view.result[index] === null ? "?" : view.result[index]}</strong>
  </span>`).join("");
  const relation = target
    ? `<div class="nge496-relation resolved"><span>${target.value}</span><b>⟶</b><span>${view.value}</span><small>${t("đáp án đầu tiên lớn hơn", "first greater to the right")}</small></div>`
    : comparison
      ? `<div class="nge496-relation ${comparison.greater ? "resolved" : ""}"><span>${comparison.value}</span><b>${comparison.greater ? "＜" : "≥"}</b><span>${view.value}</span></div>`
      : currentIndex >= 0
        ? `<div class="nge496-relation"><span>${currentValue}</span><small>${readingNums1 ? t("tra bảng", "map lookup") : t("đang quét từ trái sang phải", "scan left to right")}</small></div>`
        : "";
  const phase = readingNums1
    ? t("TRA KẾT QUẢ", "LOOKUP")
    : t("QUÉT MẢNG", "SCAN");
  const final = view.final;

  $("treeView").innerHTML = `<section class="nge496-viz">
    <header class="nge496-heading"><div><small>496 · ${phase}</small><h3>${t("Tìm số lớn hơn kế tiếp", "Next Greater Element")}</h3></div>
      <div class="nge496-badge">${final ? t("XONG", "DONE") : readingNums1 ? t("TRA MAP", "LOOKUP") : t("MONOTONIC STACK", "MONOTONIC STACK")}</div>
    </header>
    <div class="nge496-step"><span>${escapeHtml(pick(step.title))}</span></div>
    <section class="nge496-card">
      <header><strong>nums2</strong><span>${t("quét →", "scan →")}</span></header>
      <div class="nge496-array">${tokens}</div>
      ${relation}
    </section>
    <div class="nge496-flow">
      <section class="nge496-card nge496-stack">
        <header><strong>${t("STACK", "STACK")}</strong><span>↓</span></header>
        <div class="nge496-stack-items">${stackItems || `<span class="nge496-empty">∅</span>`}</div>
      </section>
      <div class="nge496-flow-arrow" aria-hidden="true">⟶</div>
      <section class="nge496-card nge496-map">
        <header><strong>${t("BẢN ĐỒ", "MAP")}</strong><span>num → next</span></header>
        <div class="nge496-pairs">${mappings || `<span class="nge496-empty">∅</span>`}</div>
      </section>
    </div>
    <section class="nge496-card nge496-results">
      <header><strong>nums1 → result</strong><span>${view.result.filter((value) => value !== null).length}/${view.nums1.length}</span></header>
      <div>${answers}</div>
    </section>
  </section>`;
}
