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

function renderInfiniteSet2336BitmaskView(step) {
  const view = step.infiniteSet2336BitmaskView;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const mask = BigInt(view.removed);
  const op = view.operation;
  const calc = view.calculation;
  const active = op?.value ?? (calc?.kind === "pop" ? BigInt(calc.bit).toString(2).length : null);
  const cells = Array.from({ length: view.width }, (_, index) => {
    const value = index + 1;
    const bit = Number((mask >> BigInt(index)) & 1n);
    const classes = ["inf2336-number", bit ? "popped" : "present"];
    if (value === view.minimum) classes.push("minimum");
    if (value === active) classes.push("current");
    if (value === active && view.event === "set-removed") classes.push("just-popped");
    if (value === active && view.event === "clear-removed") classes.push("just-added");
    return `<div class="${classes.join(" ")}" data-value="${value}" data-bit="${bit}" data-present="${!bit}"><small>${value === view.minimum ? "min ↓" : `bit ${index}`}</small><strong>${value}</strong><b class="inf2336-bm-bit">${bit}</b><span>${bit ? text("đã lấy", "popped") : text("còn", "present")}</span></div>`;
  }).join("");
  const binaryWidth = Math.min(48, Math.max(8, mask.toString(2).length + 2, calc?.kind === "pop" ? BigInt(calc.bit).toString(2).length + 2 : 0));
  const binary = (value, selected = false) => {
    const number = BigInt(value);
    const cropped = number >= 0n && number.toString(2).length > binaryWidth;
    const bits = Array.from({ length: binaryWidth }, (_, index) => {
      const position = binaryWidth - index - 1;
      const bit = (number >> BigInt(position)) & 1n;
      const highlighted = selected && calc && (BigInt(calc.bit) & (1n << BigInt(position))) !== 0n;
      return `<span class="inf2336-bm-digit${highlighted ? " selected" : ""}" title="bit ${position} · ${text("số", "number")} ${position + 1}">${bit}</span>`;
    }).join("");
    return `<code class="inf2336-bm-binary"><em>${number < 0n ? "…111" : cropped ? "…" : "…000"}</em>${bits}</code>`;
  };
  const compact = value => {
    const str = String(value);
    if (str.length <= 24) return str;
    const number = BigInt(value);
    return number > 0n && (number & (number - 1n)) === 0n ? `2^${number.toString(2).length - 1}` : `${str.slice(0, 10)}…${str.slice(-8)}`;
  };
  const row = (label, value, selected = false) => `<div class="inf2336-bm-row"><code>${escapeHtml(label)}</code>${binary(value, selected)}<span>${compact(value)}</span></div>`;
  let calculation = `<p>${text("Chọn bước popSmallest hoặc addBack để xem phép toán từng bit.", "Step into popSmallest or addBack to see the bit operations.")}</p>`;
  if (calc?.kind === "pop") {
    calculation = `${row("removed", calc.mask)}${row("removed + 1", calc.plusOne)}${row("~removed", calc.inverted)}${row("free_bit = (+1) & ~", calc.bit, true)}<p><code>free_bit.bit_length() = ${BigInt(calc.bit).toString(2).length}</code> · ${text("Số được lấy", "Popped number")}: <b>${active}</b></p><p>${text("Trong hàng nhị phân: bit 0 ở bên phải. ~removed có các bit 1 kéo dài bên trái.", "In binary rows, bit 0 is on the right. ~removed has leading ones extending to the left.")}</p>`;
  } else if (calc?.kind === "add") {
    calculation = `${row("removed", calc.mask)}${row(`bit = 1 << ${op.value - 1}`, calc.bit, true)}${row("removed & ~bit", calc.cleared)}<p>${op.accepted === false ? text("Số đã có trong tập → bỏ qua, mask không đổi.", "Already present → ignore; the mask stays unchanged.") : text("Nếu bit đang là 1, xóa nó để thêm số trở lại.", "If the bit is 1, clear it to restore the number.")}</p>`;
    if (op.value > binaryWidth) calculation += `<p class="inf2336-bm-preview">${text("Chỉ hiển thị", "Preview shows only")} ${binaryWidth} ${text("bit thấp. Bit", "low bits. Bit")} ${op.value - 1} ${text("của số", "for number")} ${op.value} ${text("nằm ngoài khung; dấu … biểu thị phần đã ẩn.", "is outside the preview; … marks the omitted high bits.")}</p>`;
  }
  let transition = text("Mọi bit bằng 0: tập chứa 1, 2, 3, …", "All bits start at 0: the set contains 1, 2, 3, …");
  if (op?.name === "popSmallest") transition = `popSmallest() → ${active ?? "?"} · ${text("bật bit", "set bit")} 0 → 1`;
  if (op?.name === "addBack") transition = `addBack(${op.value}) · ${op.accepted === false ? text("đã có → bỏ qua", "already present → ignore") : text("xóa bit", "clear bit") + " 1 → 0"}`;
  if (view.event === "done") transition = text("Hoàn tất · mask ghi nhớ các số hiện đang bị lấy khỏi tập", "Complete · the mask records numbers currently removed from the set");
  const outputs = view.history.map((entry, index) => `<span class="inf2336-output${entry.result === null ? " none" : ""}"><small>#${index + 1} ${escapeHtml(entry.label)}</small><b>${entry.result ?? "None"}</b></span>`).join("");
  $("treeView").innerHTML = `<section class="inf2336-viz inf2336-bm" aria-label="${text("Mô phỏng Bitmask bài 2336", "2336 bitmask simulation")}">
    <header class="inf2336-heading"><div><small>2336 · CÁCH 2 / APPROACH 2</small><h3>${text("Bitmask: mỗi bit đại diện một số", "Bitmask: one bit per number")}</h3></div><span class="inf2336-min">min = ${view.minimum}</span></header>
    <section class="inf2336-list-panel"><header><strong>${text("SỐ k ↔ BIT k−1", "NUMBER k ↔ BIT k−1")}</strong><span>removed = ${view.removed}</span></header>
      <div class="inf2336-strip">${cells}<div class="inf2336-infinity"><strong>0, 0, …</strong><span>${text("mọi số tiếp theo vẫn còn", "all later numbers are present")}</span></div></div>
      <div class="inf2336-legend"><span class="present">0 = ${text("còn trong tập", "present")}</span><span class="popped">1 = ${text("đã bị lấy", "removed")}</span></div>
      <p>${text("Ban đầu removed = 0. Những bit cao hơn luôn được hiểu là 0; không cần tạo một list vô hạn.", "Initially removed = 0. Higher bits are implicitly zero; no infinite list needs to be created.")}</p>
    </section>
    <section class="inf2336-flow" data-event="${view.event}"><code>${escapeHtml(transition)}</code></section>
    <p class="inf2336-action">${escapeHtml(pick(step.title))}</p>
    <section class="inf2336-bm-calculation"><header><strong>${text("PHÉP TOÁN BIT", "BIT OPERATIONS")}</strong><span>${text("Trạng thái trước phép cập nhật", "State before the update")}</span></header><div class="inf2336-bm-math">${calculation}</div></section>
    <section class="inf2336-results"><header><strong>${text("KẾT QUẢ THAO TÁC", "OPERATION OUTPUTS")}</strong></header><div>${outputs || text("Chưa có thao tác hoàn tất", "No completed operations yet")}</div></section>
  </section>`;
  const strip = $("treeView").querySelector(".inf2336-strip");
  const target = strip.querySelector(".current") || strip.querySelector(".minimum");
  if (target) strip.scrollLeft = Math.max(0, target.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + target.offsetWidth / 2);
}
