function renderInfiniteSet2336View(step) {
  const view = step.infiniteSet2336View;
  const vi = lang === "vi";
  const text = (vn, en) => vi ? vn : en;
  const heap = view.heap;
  const returned = new Set(heap);
  const op = view.operation;
  const active = op?.value;
  const event = view.event;
  const isAdd = op?.name === "addBack";
  const inserted = ["push-heap", "dedup-add"].includes(event);
  const removed = ["pop-fresh", "return-fresh", "pop-heap", "dedup-remove", "return-heap"].includes(event);
  const smallest = heap.length ? heap[0] : view.nextSmallest;

  const cells = Array.from({ length: view.displayUpper }, (_, index) => {
    const value = index + 1;
    const present = returned.has(value) || value >= view.nextSmallest;
    const classes = ["inf2336-number", present ? "present" : "popped"];
    if (returned.has(value)) classes.push("returned");
    if (value === view.nextSmallest) classes.push("cursor");
    if (value === smallest) classes.push("minimum");
    if (value === active) classes.push("current");
    if (value === active && removed) classes.push("just-popped");
    if (value === active && inserted) classes.push("just-added");
    const status = returned.has(value) ? text("trong heap", "in heap")
      : present ? text("còn", "present") : text("đã lấy", "popped");
    return `<div class="${classes.join(" ")}" data-value="${value}" data-present="${present}">
      <small>${value === view.nextSmallest ? "next ↓" : value === smallest ? "min ↓" : "&nbsp;"}</small>
      <strong>${value}</strong><span>${status}</span></div>`;
  }).join("");

  const levels = heap.length ? Math.floor(Math.log2(heap.length)) + 1 : 1;
  const width = Math.max(360, 2 ** (levels - 1) * 64);
  const height = Math.max(150, levels * 82 + 30);
  const point = (index) => {
    const level = Math.floor(Math.log2(index + 1));
    const slot = index - (2 ** level - 1);
    return { x: width * (slot + 0.5) / 2 ** level, y: 48 + level * 82 };
  };
  const edges = heap.map((value, index) => {
    if (index === 0) return "";
    const parent = point(Math.floor((index - 1) / 2));
    const child = point(index);
    return `<line x1="${parent.x}" y1="${parent.y + 22}" x2="${child.x}" y2="${child.y - 22}" />`;
  }).join("");
  const nodes = heap.map((value, index) => {
    const pos = point(index);
    return `<g class="inf2336-node${index === 0 ? " root" : ""}${value === active ? " current" : ""}${value === active && inserted ? " inserted" : ""}" data-value="${value}" data-index="${index}">
      <circle cx="${pos.x}" cy="${pos.y}" r="23" />
      <text x="${pos.x}" y="${pos.y + 5}">${value}</text>
      <text class="inf2336-node-label" x="${pos.x}" y="${pos.y + 40}">${index === 0 ? "MIN / ROOT" : `[${index}]`}</text></g>`;
  }).join("");
  const heapDrawing = heap.length
    ? `<div class="inf2336-tree-scroll"><svg class="inf2336-tree" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${text("Cây min-heap chứa số đã thêm lại", "Min-heap tree of added-back numbers")}">${edges}${nodes}</svg></div>`
    : `<div class="inf2336-empty"><span>∅</span><strong>${text("Heap đang rỗng", "The heap is empty")}</strong><p>${text("addBack(num) đưa số đã bị lấy vào đây.", "addBack(num) puts a previously popped number here.")}</p></div>`;

  let flow;
  if (!op) {
    flow = `<span>${text("Mọi số nguyên dương", "All positive integers")}</span><b>1, 2, 3, …, ∞</b>`;
  } else if (isAdd) {
    const ignored = op.accepted === false;
    flow = `<b class="inf2336-token">${active}</b><span class="inf2336-arrow">→</span><code>addBack(${active})</code><span class="inf2336-arrow">${ignored ? "↛" : "→"}</span><b>${ignored ? text("Đã có trong tập", "Already present") : "MIN-HEAP"}</b>`;
  } else {
    flow = `<b>${op.source === "heap" ? text("Gốc heap", "Heap root") : text("Dãy vô hạn", "Infinite sequence")}</b><span class="inf2336-arrow">→</span><code>popSmallest()</code><span class="inf2336-arrow">→</span><b class="inf2336-token${removed ? " out" : ""}">${active ?? "?"}</b>`;
  }
  const outputs = view.history.map((entry, index) => `<span class="inf2336-output${entry.result === null ? " none" : ""}" title="${escapeHtml(entry.label)}"><small>#${index + 1} ${escapeHtml(entry.label)}</small><b>${entry.result ?? "None"}</b></span>`).join("");

  $("treeView").innerHTML = `<section class="inf2336-viz" aria-label="${text("Mô phỏng tập số nguyên dương vô hạn", "Infinite positive-integer set simulation")}">
    <header class="inf2336-heading"><div><small>2336 · SMALLEST INFINITE SET</small><h3>${text("Một dãy vô hạn + một min-heap", "An infinite sequence + a min-heap")}</h3></div><span class="inf2336-min">min = ${smallest}</span></header>
    <section class="inf2336-list-panel"><header><strong>${text("TẬP SỐ NGUYÊN DƯƠNG", "POSITIVE INTEGER SET")}</strong><span>1, 2, 3, …, ∞</span></header>
      <div class="inf2336-strip">${cells}<div class="inf2336-infinity"><strong>… → ∞</strong><span>${text("tiếp tục mãi", "continues forever")}</span></div></div>
      <div class="inf2336-legend"><span class="present">${text("Còn trong tập", "Still present")}</span><span class="popped">${text("Đã pop", "Popped")}</span><span class="returned">${text("Đã addBack → heap", "Added back → heap")}</span></div>
      <p>${text("Từ", "From")} <b>${view.nextSmallest}</b> ${text("trở đi: mọi số vẫn còn. Số nhỏ hơn chỉ còn nếu đã được addBack vào heap.", "onward: every number is still present. Smaller numbers are present only if added back into the heap.")}</p>
    </section>
    <section class="inf2336-flow" data-event="${event}">${flow}</section>
    <p class="inf2336-action">${escapeHtml(pick(step.title))}</p>
    <section class="inf2336-bottom"><section class="inf2336-heap-panel"><header><strong>MIN-HEAP · added_back</strong><span>${text("Nhỏ nhất ở gốc", "Smallest at the root")}</span></header>${heapDrawing}
      <div class="inf2336-heap-array"><small>${text("Mảng heap", "Heap array")}</small><code>[${heap.join(", ")}]</code></div></section>
      <section class="inf2336-info"><div class="inf2336-rule"><b>popSmallest()</b><p>${text("Heap có số? Lấy gốc heap. Heap rỗng? Lấy next_smallest và tăng con trỏ.", "Heap has values? Pop its root. Heap empty? Take next_smallest and advance the cursor.")}</p></div>
        <div class="inf2336-rule"><b>addBack(num)</b><p>${text("Số đã bị lấy → thêm vào heap. Số vẫn còn hoặc đã thêm lại → bỏ qua.", "Previously popped → push into the heap. Still present or already added back → ignore.")}</p></div>
        <div class="inf2336-dedup"><small>added_set</small><code>{${view.addedSet.join(", ")}}</code><p>${text("Chống trùng trong heap", "Prevents duplicate heap entries")}</p></div>
      </section></section>
    <section class="inf2336-results"><header><strong>${text("KẾT QUẢ THAO TÁC", "OPERATION OUTPUTS")}</strong></header><div>${outputs || `<span>${text("Chưa có thao tác hoàn tất", "No completed operations yet")}</span>`}</div></section>
  </section>`;
  const strip = $("treeView").querySelector(".inf2336-strip");
  const target = strip.querySelector(".current") || strip.querySelector(".cursor");
  if (target) strip.scrollLeft = Math.max(0, target.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + target.offsetWidth / 2);
}
