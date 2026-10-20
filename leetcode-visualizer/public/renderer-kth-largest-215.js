function renderKthLargest215Pictures(step) {
  const v = step.kthLargest215View, t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value)), summary = v.mode === "summary";
  const kept = new Set(v.heap.map(item => item.index)), discarded = new Set(v.discarded);
  const depth = v.heap.length ? Math.floor(Math.log2(v.heap.length)) : 0;
  const width = Math.max(410, Math.pow(2, depth) * 64), height = Math.max(155, depth * 66 + 89);
  const xy = index => { const d = Math.floor(Math.log2(index + 1)); return { x: (index - (Math.pow(2, d) - 1) + .5) / Math.pow(2, d) * width, y: 40 + d * 66 }; };
  const edges = v.heap.slice(1).map((_, i) => { const a = xy(Math.floor(i / 2)), b = xy(i + 1); return `<line x1="${a.x}" y1="${a.y + 23}" x2="${b.x}" y2="${b.y - 23}"/>`; }).join("");
  const nodes = v.heap.map((item, index) => { const p = xy(index); return `<g class="k215-node${index === 0 ? " root" : ""}${item.index === v.cursor ? " current" : ""}" transform="translate(${p.x},${p.y})"><title>heap[${index}] = ${item.value} · nums[${item.index}]</title><circle r="25"/><text y="6" text-anchor="middle">${item.value}</text><text class="k215-index" y="45" text-anchor="middle">[${index}]${index === 0 ? " · min" : ""}</text></g>`; }).join("");
  const input = v.nums.map((value, index) => `<button type="button" data-k215-index="${index}" ${summary ? "disabled" : ""} class="${index === v.cursor ? "current " : ""}${kept.has(index) ? "kept" : discarded.has(index) ? "discarded" : ""}" aria-label="${t("Xét", "Visit")} nums[${index}] = ${value}"><small>${index}</small><b>${value}</b>${discarded.has(index) ? '<span aria-hidden="true">×</span>' : ''}</button>`).join("");
  const cells = v.heap.map((item, index) => `<span class="${index === 0 ? "root" : ""}${item.index === v.cursor ? " current" : ""}"><small>${index}</small><b>${item.value}</b></span>`).join("");
  const rank = step.final && !summary ? [...v.heap].sort((a, b) => b.value - a.value).map((item, index) => `<span class="${index === v.k - 1 ? "answer" : ""}"><small>#${index + 1}</small><b>${item.value}</b></span>`).join("") : "";
  const over = v.overflow, checking = v.event === "check";
  const decision = v.removed ? `<div class="k215-decision removed"><span>${t("Bỏ nhỏ nhất", "Drop smallest")}</span><b>${v.removed.value}</b><strong>→</strong><span>${v.k + 1} → ${v.k} ${t("ô", "items")}</span></div>`
    : checking || v.event === "push" ? `<div class="k215-decision${over ? " over" : ""}"><span>len(heap) &gt; k</span><b>${v.heapSize} &gt; ${v.k}</b><strong>${over ? "✓" : "✕"}</strong><span>${over ? t("Bỏ gốc ở dòng 8", "Pop root on line 8") : t("Giữ lại", "Keep")}</span></div>` : "";
  $("treeView").innerHTML = `<section class="k215-viz" aria-label="${t("215 · Giữ k số lớn nhất", "215 · Keep k largest")}">
    <header><strong>215 · Min-heap</strong><button type="button" data-k215-finish ${summary || step.final || v.cursor < 0 ? "disabled" : ""}>${t("Xong số này", "Finish number")} ⏭</button><button type="button" data-k215-result>${t("Kết quả", "Result")}</button></header>
    ${summary ? `<div class="k215-summary">${t("Đã tính đủ", "Computed all")} ${v.total} ${t("số · hình xem trước tối đa 24 ô. Debug từng dòng với ≤40 số.", "numbers · pictures preview up to 24 items. Line debug for ≤40 numbers.")}</div>` : `<div class="k215-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}
    <div class="k215-input"><small>nums${summary ? ` · ${t("xem trước", "preview")}` : ""}</small><div>${input}</div></div>
    <div class="k215-legend"><span class="current">● ${t("đang xét", "current")}</span><span class="kept">● ${t("trong heap", "in heap")}</span><span class="discarded">× ${t("đã loại", "removed")}</span></div>
    <div class="k215-capacity${over ? " over" : ""}"><span>heap</span><strong>${v.heapSize}</strong><span>/ k =</span><b>${v.k}</b>${v.cursor >= 0 && !step.final ? `<code>x = ${v.nums[v.cursor]}</code>` : ""}</div>
    ${decision}
    <div class="k215-tree" role="img" aria-label="${t("Cây min-heap: gốc nhỏ nhất", "Min-heap tree: smallest at root")}">${v.heap.length ? `<svg viewBox="0 0 ${width} ${height}" style="width:${width}px;height:${height}px" aria-hidden="true">${edges}${nodes}</svg>` : `<div class="k215-empty">∅<small>heap = []</small></div>`}</div>
    <div class="k215-root-hint">↑ ${t("Gốc = nhỏ nhất trong heap", "Root = smallest in heap")}</div>
    <div class="k215-array"><small>heap[]</small>${cells || '<span>∅</span>'}</div>
    ${rank ? `<div class="k215-ranking"><small>${t("Top k · xếp giảm để nhìn thứ hạng", "Top k · descending display to show ranks")}</small><div>${rank}</div></div>` : ""}
    ${step.final ? `<div class="k215-answer"><span>${t("Lớn thứ", "Largest")} #${v.k}</span><code>heap[0]</code><strong>${v.answer}</strong><span>✓</span></div>` : ""}
  </section>`;
  const host = $("treeView");
  host.querySelector("[data-k215-result]").addEventListener("click", () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelector("[data-k215-finish]").addEventListener("click", () => {
    const target = steps.findIndex((s, i) => i >= stepIndex && s.kthLargest215View?.cursor === v.cursor && (s.kthLargest215View.event === "pop" || s.kthLargest215View.event === "check" && !s.kthLargest215View.overflow));
    if (target >= 0) { stopPlay(); stepIndex = target; renderStep(); }
  });
  host.querySelectorAll("[data-k215-index]").forEach(button => button.addEventListener("click", () => {
    const target = steps.findIndex(s => s.kthLargest215View?.cursor === Number(button.dataset.k215Index) && s.kthLargest215View.event === "visit");
    if (target >= 0) { stopPlay(); stepIndex = target; renderStep(); }
  }));
}
