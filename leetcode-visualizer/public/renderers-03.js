// ---- Even/Odd slot fill visualization (LeetCode 767 approach 2) ----
function renderEvenOddFillView(step) {
  const view = step.evenOddFillView || {};
  const res = Array.isArray(view.res) ? view.res : [];
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const i = Number.isInteger(view.i) ? view.i : null;
  const curCh = view.curCh || null;

  const slots = res.map((ch, index) => {
    const isEven = index % 2 === 0;
    const isCursor = index === i;
    const filled = ch !== null;
    const classes = ["eof-slot", isEven ? "eof-even" : "eof-odd"];
    if (isCursor) classes.push("eof-cursor");
    if (filled) classes.push("eof-filled");
    return `<div class="${classes.join(" ")}">
      <span class="eof-slot-index">[${index}]</span>
      <strong class="eof-slot-char">${filled ? escapeHtml(ch) : "_"}</strong>
    </div>`;
  }).join("");

  const heapItems = heap.map((entry, index) => `<span class="eof-heap-entry${index === 0 ? " root" : ""}">
    ${index === 0 ? `<strong>${lang === "vi" ? "gốc" : "root"}</strong> ` : ""}(-${escapeHtml(String(entry.freq))}, '${escapeHtml(String(entry.ch))}')
  </span>`).join("");

  const heapBox = heap.length
    ? `<div class="eof-heap-box"><span class="eof-heap-label">pq (max-heap)</span>${heapItems}</div>`
    : `<div class="eof-heap-box eof-heap-empty">${lang === "vi" ? "pq rỗng" : "pq empty"}</div>`;

  const curBox = curCh
    ? `<div class="eof-current"><span class="eof-current-label">${lang === "vi" ? "Đang điền" : "Placing"}</span><strong>'${escapeHtml(curCh)}'</strong></div>`
    : "";

  const legend = `<div class="eof-legend">
    <span><i class="eof-swatch eof-swatch-even"></i>${lang === "vi" ? "ô chẵn (0,2,4,...)" : "even slots (0,2,4,...)"}</span>
    <span><i class="eof-swatch eof-swatch-odd"></i>${lang === "vi" ? "ô lẻ (1,3,5,...)" : "odd slots (1,3,5,...)"}</span>
    <span><i class="eof-swatch eof-swatch-cursor"></i>${lang === "vi" ? "vị trí i hiện tại" : "current pointer i"}</span>
  </div>`;

  $("treeView").innerHTML = `<div class="eof-viz">
    ${heapBox}
    ${curBox}
    <div class="eof-slots">${slots}</div>
    ${legend}
  </div>`;
}

function renderRunningSumView(step) {
  const view = step.runningSumView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const running = Array.isArray(view.running) ? view.running : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const current = Number.isInteger(view.current) ? view.current : -1;

  const columns = nums.map((num, index) => {
    const isCurrent = index === current;
    const isDone = running[index] != null;
    return `<div class="running-column${isCurrent ? " current" : ""}${isDone ? " done" : ""}">
      <span class="running-index">[${index}]</span>
      <div class="running-input">
        <small>nums</small>
        <strong>${escapeHtml(String(num))}</strong>
      </div>
      <div class="running-arrow">+</div>
      <div class="running-output">
        <small>sum</small>
        <strong>${running[index] == null ? "-" : escapeHtml(String(running[index]))}</strong>
      </div>
    </div>`;
  }).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  $("treeView").innerHTML = `
    <div class="running-viz">
      <div class="running-strip">${columns}</div>
      <div class="running-status">${statusItems}</div>
    </div>`;
}

// ---- Partition visualization (LeetCode 4: Median of Two Sorted Arrays) ----
function renderPartitionView(step) {
  const view = step.partitionView || {};
  const rowA = Array.isArray(view.rowA) ? view.rowA : [];
  const rowB = Array.isArray(view.rowB) ? view.rowB : [];
  const cutA = Number.isInteger(view.cutA) ? view.cutA : null;
  const cutB = Number.isInteger(view.cutB) ? view.cutB : null;
  const vi = lang === "vi";
  const line = view.line || (step.codeLines || [])[0] || 0;
  const phase = view.phase || "prepare";
  const total = rowA.length + rowB.length;
  const half = view.half ?? Math.ceil(total / 2);
  const labelA = view.labelA || "nums1";
  const labelB = view.labelB || "nums2";
  const ready = cutA !== null && cutB !== null;
  const aLeft = cutA === 0 ? -Infinity : rowA[cutA - 1];
  const aRight = cutA === rowA.length ? Infinity : rowA[cutA];
  const bLeft = cutB === 0 ? -Infinity : rowB[cutB - 1];
  const bRight = cutB === rowB.length ? Infinity : rowB[cutB];
  const maxLeft = ready ? Math.max(aLeft, bLeft) : null;
  const minRight = ready ? Math.min(aRight, bRight) : null;
  const odd = total % 2 === 1;
  const format = value => value === Infinity ? "+∞" : value === -Infinity ? "−∞" : String(value);
  const text = value => escapeHtml(String(value));
  const hl = view.highlight || {};
  const showLeftMedian = phase === "median" && line >= 15;
  const showRightMedian = phase === "median" && line >= 18;

  function renderCells(values, start, end, side, cut, role, pointer, highlights) {
    if (start === end) {
      if (cut === null) return `<span class="partition-empty">${vi ? "Mảng rỗng" : "Empty array"}</span>`;
      const value = side === "left" ? "−∞" : "+∞";
      const boundary = side === "left" ? `${role}[${pointer}−1]` : `${role}[${pointer}]`;
      return `<div class="partition-empty"><span>${vi ? "Rỗng" : "Empty"}</span><strong>${value}</strong><small>${boundary} (${vi ? "giá trị quy ước" : "sentinel"})</small></div>`;
    }
    return values.slice(start, end).map((value, offset) => {
      const index = start + offset;
      const boundary = cut !== null && (index === cut - 1 || index === cut);
      const leftWinner = role === "A" ? aLeft >= bLeft : bLeft > aLeft;
      const rightWinner = role === "A" ? aRight <= bRight : bRight < aRight;
      const median = ready && boundary && ((side === "left" && showLeftMedian && leftWinner)
        || (side === "right" && showRightMedian && rightWinner));
      return `<div class="partition-cell${cut !== null ? ` ${side}-half` : ""}${highlights.has(index) ? " hl" : ""}${median ? " median" : ""}">
        <span class="partition-cell-idx">[${index}]</span><strong>${text(value)}</strong>
        ${boundary ? `<small class="partition-boundary">${role}[${index < cut ? `${pointer}−1` : pointer}]</small>` : ""}
        ${median ? `<small class="partition-median-tag">${vi ? "Số giữa" : "Middle"}</small>` : ""}
      </div>`;
    }).join("");
  }

  function renderRow(rowLabel, values, cut, role, pointer, highlights) {
    const label = `<div class="partition-row-label"><strong>${text(role)} = ${text(rowLabel)}</strong><small>${phase === "prepare" ? `${values.length} ${vi ? "phần tử" : "elements"}` : role === "A" ? (vi ? "Mảng ngắn hơn · tìm i ở đây" : "Shorter array · search i here") : (vi ? "j phụ thuộc vào i" : "j follows from i")}</small></div>`;
    if (cut === null) {
      return `<div class="partition-row uncut">${label}<div class="partition-uncut">${renderCells(values, 0, values.length, "right", null, role, pointer, highlights)}</div></div>`;
    }
    return `<div class="partition-row">${label}
      <div class="partition-side partition-left">${renderCells(values, 0, cut, "left", cut, role, pointer, highlights)}</div>
      <div class="partition-cut"><strong>${pointer} = ${cut}</strong><span aria-hidden="true"></span></div>
      <div class="partition-side partition-right">${renderCells(values, cut, values.length, "right", cut, role, pointer, highlights)}</div>
    </div>`;
  }

  function comparison(leftName, leftValue, rightName, rightValue, checked, active) {
    const ok = leftValue <= rightValue;
    return `<div class="partition-check${active ? " active" : ""}${checked ? ok ? " pass" : " fail" : " pending"}">
      <span>${leftName} ≤ ${rightName}</span><strong>${text(format(leftValue))} ≤ ${text(format(rightValue))}</strong>
      <b>${checked ? ok ? (vi ? "✓ Đúng" : "✓ Pass") : (vi ? "✗ Sai" : "✗ Fail") : (vi ? "Chưa kiểm tra" : "Not checked yet")}</b>
    </div>`;
  }

  const checks = ready && line >= 10 ? `<div class="partition-checks">
    ${comparison("A[i−1]", aLeft, "B[j]", bRight, true, line === 10 || line === 11)}
    ${comparison("B[j−1]", bLeft, "A[i]", aRight, line >= 12, line === 12 || line === 13)}
  </div>` : "";
  let action = vi ? "Chọn mảng ngắn hơn làm A để tìm vị trí cắt." : "Use the shorter array as A to search for a cut.";
  if (phase === "search") action = vi ? "Tìm số phần tử lấy từ A, không tìm giá trị trung vị trực tiếp." : "Search how many elements to take from A, rather than the median value.";
  if (phase === "cut") action = cutB === null
    ? (vi ? `Lấy ${cutA} phần tử đầu của A vào nửa trái; bước tiếp theo tính j.` : `Take the first ${cutA} A elements into the left half; calculate j next.`)
    : (vi ? `Nửa trái lấy ${cutA} từ A + ${cutB} từ B = ${half} phần tử.` : `Left half takes ${cutA} from A + ${cutB} from B = ${half} elements.`);
  if (ready && line >= 10 && line < 14) {
    if (aLeft > bRight) action = vi ? `← Giảm i: ${format(aLeft)} ở trái A > ${format(bRight)} ở phải B. A đã lấy quá nhiều phần tử vào trái.` : `← Decrease i: ${format(aLeft)} on A's left > ${format(bRight)} on B's right. Too many A elements went left.`;
    else if (line === 10) action = vi ? "So sánh thứ nhất đúng; tiếp theo kiểm tra B ở trái với A ở phải." : "First comparison passes; next check B's left against A's right.";
    else if (bLeft > aRight) action = vi ? `Tăng i →: ${format(bLeft)} ở trái B > ${format(aRight)} ở phải A. Cần lấy thêm từ A, bớt từ B.` : `Increase i →: ${format(bLeft)} on B's left > ${format(aRight)} on A's right. Take more from A and less from B.`;
    else action = vi ? "✓ Cả hai so sánh đúng: mọi số ở nửa trái ≤ mọi số ở nửa phải." : "✓ Both comparisons pass: every left-half value ≤ every right-half value.";
  }
  if (phase === "median") action = vi ? "✓ Vị trí cắt hợp lệ. Chỉ cần các số sát vạch cắt để lấy trung vị." : "✓ Valid partition. Only the values next to the cuts are needed for the median.";
  const heading = phase === "prepare" ? (vi ? "Chuẩn bị hai mảng" : "Prepare the arrays")
    : phase === "median" ? (vi ? "Lấy trung vị" : "Read the median")
      : (vi ? "Chia thành hai nửa" : "Partition into two halves");
  const counts = ready ? `<div class="partition-halves"><span>${vi ? "TRÁI" : "LEFT"}: ${cutA} + ${cutB} = ${half}</span><span>${vi ? "PHẢI" : "RIGHT"}: ${total - half}</span></div>` : "";
  const range = phase !== "prepare" ? `<div class="partition-search"><span>${vi ? "Khoảng tìm i" : "Search range for i"}: <strong>[${view.left ?? 0}, ${view.right ?? rowA.length}]</strong></span><span>${vi ? "Trái cần" : "Left needs"} <strong>${half}/${total}</strong> ${vi ? "phần tử" : "elements"}</span>${ready ? `<span>j = ${half} − ${cutA} = <strong>${cutB}</strong></span>` : ""}</div>` : "";
  const median = showLeftMedian ? `<div class="partition-result">
    <span>${vi ? "Lớn nhất bên trái" : "Largest on the left"}: max(${text(format(aLeft))}, ${text(format(bLeft))}) = <strong>${text(maxLeft)}</strong></span>
    ${showRightMedian ? `<span>${vi ? "Nhỏ nhất bên phải" : "Smallest on the right"}: min(${text(format(aRight))}, ${text(format(bRight))}) = <strong>${text(minRight)}</strong></span>` : ""}
    ${line >= 16 ? `<span>${total} ${vi ? `phần tử (${odd ? "lẻ" : "chẵn"})` : `elements (${odd ? "odd" : "even"})`} → ${odd ? (vi ? "lấy 1 số giữa" : "take one middle value") : (vi ? "trung bình 2 số giữa" : "average two middle values")}</span>` : ""}
    ${step.final ? `<strong class="partition-answer">Median = ${odd ? text(view.answer) : `(${text(maxLeft)} + ${text(minRight)}) / 2 = ${text(view.answer)}`}</strong>` : ""}
  </div>` : "";

  $("treeView").innerHTML = `<div class="partition-viz" data-phase="${text(phase)}">
    <h4>${heading}</h4>
    ${view.swapped ? `<div class="partition-swap">${vi ? "Đã đổi vai trò" : "Roles swapped"}: A = ${text(labelA)}, B = ${text(labelB)}.</div>` : ""}
    ${range}${counts}
    <div class="partition-arrays">
      ${renderRow(labelA, rowA, cutA, "A", "i", new Set(hl.rowA || []))}
      ${renderRow(labelB, rowB, cutB, "B", "j", new Set(hl.rowB || []))}
    </div>
    ${checks}
    <div class="partition-action" aria-live="polite">${text(action)}</div>
    ${median}
  </div>`;
}

// ---- Two-pointer merge visualization (e.g. bai 88: Merge Sorted Array) ----
// Dedicated view showing nums1 and nums2 as separate rows, with a colored
// down-arrow + label above each pointer's current cell (instead of tiny text
// tags like "[i] p1" crammed into the sub-label, which is hard to scan when
// multiple pointers land near each other).
function renderTwoPointerMergeView(step) {
  const view = step.twoPointerMergeView || {};
  const nums1 = Array.isArray(view.nums1) ? view.nums1 : [];
  const nums2 = Array.isArray(view.nums2) ? view.nums2 : [];
  const written = Array.isArray(view.written) ? view.written : [];
  const result = Array.isArray(view.result) ? view.result : null;
  const resultLength = Number.isInteger(view.resultLength) ? view.resultLength : (result ? result.length : 0);
  const writtenResult = Array.isArray(view.writtenResult) ? view.writtenResult : [];
  const pointers1 = view.pointers1 || {}; // { i: idx, k: idx } -> pointer name -> index into nums1
  const pointers2 = view.pointers2 || {}; // { j: idx } -> pointer name -> index into nums2
  const pointersResult = view.pointersResult || {};
  const highlight1 = new Set(view.highlight1 || []);
  const highlight2 = new Set(view.highlight2 || []);
  const highlightResult = new Set(view.highlightResult || []);

  // Fixed color per pointer name so it's visually consistent across every step.
  const pointerColor = { i: "tp-ptr-a", p1: "tp-ptr-a", j: "tp-ptr-b", p2: "tp-ptr-b", k: "tp-ptr-c", write: "tp-ptr-c" };

  function pointersAt(pointerMap, idx) {
    return Object.entries(pointerMap).filter(([, v]) => v === idx).map(([name]) => name);
  }

  function renderRow(rowLabel, values, pointerMap, hlSet, rowClass, writtenCells = []) {
    const cells = values.map((v, i) => {
      const names = pointersAt(pointerMap, i);
      const arrowsHtml = names.map((name) => {
        const cls = pointerColor[name] || "tp-ptr-a";
        return `<div class="tp-pointer-arrow ${cls}"><span class="tp-pointer-name">${escapeHtml(name)}</span><span class="tp-pointer-caret">\u25BC</span></div>`;
      }).join("");
      const isWritten = writtenCells[i];
      const isHl = hlSet.has(i);
      return `<div class="tp-cell-wrap">
        <div class="tp-pointer-stack">${arrowsHtml}</div>
        <div class="tp-cell${isWritten ? " tp-cell-written" : ""}${isHl ? " tp-cell-hl" : ""}">
          <span class="tp-cell-idx">[${i}]</span>
          <strong>${escapeHtml(String(v))}</strong>
        </div>
      </div>`;
    }).join("");
    return `<div class="tp-row ${rowClass}">
      <span class="tp-row-label">${escapeHtml(rowLabel)}</span>
      <div class="tp-row-cells">${cells}</div>
    </div>`;
  }

  const legendItems = [
    { name: view.legend1Name || "i", cls: pointerColor[view.legend1Name || "i"] || "tp-ptr-a", text: pick(view.legend1Text) },
    { name: view.legend2Name || "j", cls: pointerColor[view.legend2Name || "j"] || "tp-ptr-b", text: pick(view.legend2Text) },
    { name: view.legend3Name || "k", cls: pointerColor[view.legend3Name || "k"] || "tp-ptr-c", text: pick(view.legend3Text) },
  ].filter((item) => item.text);
  const legendHtml = legendItems.map((item) => `<span><i class="tp-legend-swatch ${item.cls}"></i>${escapeHtml(item.name)} = ${escapeHtml(item.text)}</span>`).join("");

  $("treeView").innerHTML = `
    <div class="tp-merge-viz">
      ${renderRow(view.label1 || "nums1", nums1, pointers1, highlight1, "tp-row-nums1", written)}
      ${renderRow(view.label2 || "nums2", nums2, pointers2, highlight2, "tp-row-nums2")}
      ${result ? renderRow(
        view.resultLabel || "result",
        Array.from({ length: resultLength }, (_, idx) => result[idx] ?? "·"),
        pointersResult,
        highlightResult,
        "tp-row-result",
        writtenResult,
      ) : ""}
      <div class="tp-legend">${legendHtml}</div>
    </div>`;
}

function renderTriangleCountView(step) {
  const view = step.triangleCountView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const pointerClass = { left: "tri-ptr-left", right: "tri-ptr-right", k: "tri-ptr-k" };
  const pointerIndex = { left: view.left, right: view.right, k: view.k };
  const validSet = new Set();
  if (Number.isInteger(view.validStart) && Number.isInteger(view.validEnd)) {
    for (let i = view.validStart; i <= view.validEnd; i++) validSet.add(i);
  }

  const cells = nums.map((value, index) => {
    const names = Object.entries(pointerIndex).filter(([, pointer]) => pointer === index).map(([name]) => name);
    const arrows = names.map((name) => `<div class="tri-pointer ${pointerClass[name]}"><span>${escapeHtml(name)}</span><b>▼</b></div>`).join("");
    const classes = [
      "tri-cell",
      names.length ? "tri-cell-active" : "",
      validSet.has(index) ? "tri-cell-counted" : "",
    ].filter(Boolean).join(" ");
    return `<div class="tri-cell-wrap">
      <div class="tri-pointer-stack">${arrows}</div>
      <div class="${classes}"><span>[${index}]</span><strong>${escapeHtml(String(value))}</strong></div>
    </div>`;
  }).join("");

  const comparison = Number.isFinite(view.sum) && Number.isInteger(view.k)
    ? `${view.sum} ${view.condition ? ">" : "≤"} ${nums[view.k]}`
    : pick({ vi: "Chọn ba cạnh để kiểm tra", en: "Choose three sides to test" });
  const status = view.added
    ? pick({ vi: `Đếm thêm ${view.added} tam giác`, en: `Count ${view.added} more triangles` })
    : view.phase === "done"
      ? pick({ vi: "Đã hoàn tất", en: "Complete" })
      : view.condition === false
        ? pick({ vi: "Chưa đủ điều kiện tam giác", en: "Triangle condition fails" })
        : view.condition === true
          ? pick({ vi: "Điều kiện tam giác đúng", en: "Triangle condition holds" })
          : "";

  $("treeView").innerHTML = `<div class="triangle-viz">
    <div class="tri-row"><span class="tri-label">nums (sorted)</span><div class="tri-cells">${cells}</div></div>
    <div class="tri-panels">
      <div class="tri-formula"><span>${escapeHtml(pick({ vi: "Kiểm tra", en: "Check" }))}</span><strong>${escapeHtml(comparison)}</strong></div>
      <div class="tri-count"><span>count</span><strong>${escapeHtml(String(view.count ?? 0))}</strong>${status ? `<em>${escapeHtml(status)}</em>` : ""}</div>
    </div>
    <div class="tri-legend"><span><i class="tri-ptr-left"></i>left</span><span><i class="tri-ptr-right"></i>right</span><span><i class="tri-ptr-k"></i>k (cạnh lớn nhất)</span></div>
  </div>`;
}

// ---- LeetCode 30: word-sized, multi-offset sliding window ----
function renderSubstringConcatView(step) {
  const view = step.substringConcatView || {};
  const s = String(view.s || "");
  const chars = [...s];
  const words = Array.isArray(view.words) ? view.words : [];
  const width = Number(view.width) || 1;
  const totalWidth = Number(view.totalWidth) || words.length * width;
  const need = view.need || {};
  const windowFreq = view.window || {};
  const offset = Number.isInteger(view.offset) ? view.offset : null;
  const left = Number.isInteger(view.left) ? view.left : 0;
  const right = Number.isInteger(view.right) ? view.right : 0;
  const answers = Array.isArray(view.answer) ? view.answer : [];
  const completed = new Set(Array.isArray(view.completedOffsets) ? view.completedOffsets : []);
  const vi = lang === "vi";
  const inRange = (index, start, end) => Number.isInteger(start) && Number.isInteger(end) && index >= start && index <= end;
  const answerAt = (index) => answers.some((start) => index >= start && index < start + totalWidth);
  const phase = String(view.phase || "prepare");
  const phaseIndex = phase === "prepare" ? 0
    : phase === "offset" ? 1
      : phase === "read" ? 2
        : ["count", "validate"].includes(phase) ? 3
          : ["reset", "shrink"].includes(phase) ? 4 : 5;
  const phaseLabels = vi
    ? ["Chuẩn bị", "Chọn offset", "Đọc word", "Đếm / kiểm tra", "Reset / shrink", "Match"]
    : ["Prepare", "Choose offset", "Read word", "Count / validate", "Reset / shrink", "Match"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const charLimit = 180;
  const charFocus = Number.isInteger(view.activeStart)
    ? view.activeStart
    : Number.isInteger(view.matchStart)
      ? view.matchStart
      : answers.length ? answers[answers.length - 1] : left;
  const visibleCharStart = chars.length <= charLimit
    ? 0
    : Math.max(0, Math.min(chars.length - charLimit, charFocus - Math.floor(charLimit / 2)));
  const visibleCharEnd = Math.min(chars.length, visibleCharStart + charLimit);
  const visibleCharCells = chars.slice(visibleCharStart, visibleCharEnd).map((char, relativeIndex) => {
    const index = visibleCharStart + relativeIndex;
    const classes = ["sc30-char"];
    if (index >= left && index < right && phase !== "done") classes.push("window");
    if (inRange(index, view.activeStart, view.activeEnd)) classes.push("active-word");
    if (inRange(index, view.removedStart, view.removedEnd)) classes.push("removed");
    if (inRange(index, view.discardStart, view.discardEnd)) classes.push("discarded");
    if (Number.isInteger(view.matchStart) && index >= view.matchStart && index < view.matchStart + totalWidth) classes.push("new-match");
    if (answerAt(index)) classes.push("answer-range");
    const pointers = [];
    if (phase !== "done" && index === left) pointers.push("L");
    if (phase !== "done" && index === right) pointers.push("R");
    return `<div class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(char)}</strong>${pointers.length ? `<em>${pointers.join("/")}</em>` : ""}</div>`;
  }).join("");
  const charPrefix = visibleCharStart > 0 ? `<div class="sc30-ellipsis">…<small>0..${visibleCharStart - 1}</small></div>` : "";
  const charSuffix = visibleCharEnd < chars.length ? `<div class="sc30-ellipsis">…<small>${visibleCharEnd}..${chars.length - 1}</small></div>` : "";
  const charCells = `${charPrefix}${visibleCharCells}${charSuffix}`;
  const endPointer = phase !== "done" && right === chars.length && visibleCharEnd === chars.length
    ? `<div class="sc30-end-pointer"><small>${chars.length}</small><strong>R</strong></div>` : "";

  const tokenCards = [];
  if (offset !== null) {
    const tokenCount = Math.max(0, Math.floor((s.length - offset) / width));
    const tokenLimit = 80;
    const tokenFocusStart = Number.isInteger(view.activeStart) ? view.activeStart : left;
    const tokenFocus = Math.max(0, Math.floor((tokenFocusStart - offset) / width));
    const firstToken = tokenCount <= tokenLimit
      ? 0
      : Math.max(0, Math.min(tokenCount - tokenLimit, tokenFocus - Math.floor(tokenLimit / 2)));
    const lastToken = Math.min(tokenCount, firstToken + tokenLimit);
    if (firstToken > 0) tokenCards.push(`<div class="sc30-ellipsis">…<small>word 0..${firstToken - 1}</small></div>`);
    for (let tokenIndex = firstToken; tokenIndex < lastToken; tokenIndex++) {
      const start = offset + tokenIndex * width;
      const word = s.slice(start, start + width);
      const classes = ["sc30-token"];
      if (start >= left && start + width <= right) classes.push("window");
      if (start === view.activeStart) classes.push("active");
      if (start === view.removedStart) classes.push("removed");
      if (inRange(start, view.discardStart, view.discardEnd)) classes.push("discarded");
      if (Number.isInteger(view.matchStart) && start >= view.matchStart && start < view.matchStart + totalWidth) classes.push("new-match");
      if (answers.some((answer) => start >= answer && start < answer + totalWidth)) classes.push("answer");
      if (start === view.activeStart && !Object.prototype.hasOwnProperty.call(need, word)) classes.push("unknown");
      const pointers = [
        start === left ? "L" : "",
        start + width === right ? "R" : "",
      ].filter(Boolean).join(" · ");
      tokenCards.push(`<div class="${classes.join(" ")}"><small>[${start}..${start + width - 1}]</small><strong>${escapeHtml(word)}</strong>${pointers ? `<em>${pointers}</em>` : ""}</div>`);
    }
    if (lastToken < tokenCount) tokenCards.push(`<div class="sc30-ellipsis">…<small>word ${lastToken}..${tokenCount - 1}</small></div>`);
  }
  const tokensHtml = tokenCards.length
    ? tokenCards.join("")
    : `<span class="sc30-empty">${vi ? "Chọn một offset để chia s thành các word chunk." : "Choose an offset to split s into word chunks."}</span>`;

  const offsetLanes = Array.from({ length: width }, (_, lane) => {
    const state = completed.has(lane) ? "done" : lane === offset ? "active" : "pending";
    return `<span class="${state}"><small>offset</small><strong>${lane}</strong><em>${state === "done" ? "✓" : state === "active" ? "RUN" : "WAIT"}</em></span>`;
  }).join("");

  const frequencyWords = [...new Set([...Object.keys(need), ...Object.keys(windowFreq)])];
  const frequencyRows = frequencyWords.map((word) => {
    const required = Number(need[word] || 0);
    const have = Number(windowFreq[word] || 0);
    const status = have > required ? "over" : have === required && required > 0 ? "exact" : "missing";
    const statusText = status === "over" ? (vi ? "DƯ" : "OVER") : status === "exact" ? (vi ? "ĐỦ" : "EXACT") : (vi ? "THIẾU" : "MISSING");
    return `<div class="sc30-freq-row ${status}"><strong>${escapeHtml(word)}</strong><span><small>need</small><b>${required}</b></span><i>vs</i><span><small>window</small><b>${have}</b></span><em>${statusText}</em></div>`;
  }).join("") || `<span class="sc30-empty">—</span>`;

  const eventLabels = {
    "build-need": vi ? "COUNTER" : "COUNTER",
    "offset-start": "OFFSET",
    "read-word": "READ",
    "advance-right": "EXPAND",
    "known-word": vi ? "HỢP LỆ" : "KNOWN",
    "unknown-word": "UNKNOWN",
    "reset-clear": "RESET",
    "reset-left": "RESET L",
    "add-word": "COUNT",
    "over-count": "SHRINK",
    "count-within": vi ? "KHÔNG SHRINK" : "NO SHRINK",
    "shrink-complete": vi ? "SHRINK XONG" : "SHRINK DONE",
    "pick-remove": "REMOVE",
    "remove-count": "DECREMENT",
    "advance-left": "MOVE L",
    "match-check": "MATCH?",
    "save-match": "MATCH ✓",
    "offset-complete": vi ? "XONG OFFSET" : "OFFSET DONE",
    done: "DONE",
  };
  const eventLabel = eventLabels[view.event] || String(view.event || "STEP").toUpperCase();
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const activeWordText = view.activeWord === null || view.activeWord === undefined ? "—" : JSON.stringify(view.activeWord);
  const windowLength = Math.max(0, right - left);
  const answerLimit = 80;
  const visibleAnswers = answers.length <= answerLimit
    ? answers
    : [...answers.slice(0, answerLimit / 2), ...answers.slice(-answerLimit / 2)];
  const answerChips = visibleAnswers.length
    ? `${visibleAnswers.slice(0, answers.length > answerLimit ? answerLimit / 2 : visibleAnswers.length).map((start) => `<span class="${start === view.matchStart ? "new" : ""}"><b>${start}</b><small>s[${start}:${start + totalWidth}]</small></span>`).join("")}${answers.length > answerLimit ? `<span class="sc30-answer-summary"><b>…</b><small>${answers.length - answerLimit} ${vi ? "kết quả ẩn" : "hidden results"}</small></span>${visibleAnswers.slice(answerLimit / 2).map((start) => `<span class="${start === view.matchStart ? "new" : ""}"><b>${start}</b><small>s[${start}:${start + totalWidth}]</small></span>`).join("")}` : ""}`
    : `<span class="sc30-answer-empty">${vi ? "Chưa có match" : "No match yet"}</span>`;

  $("treeView").innerHTML = `<section class="sc30-viz" role="img" aria-label="LeetCode 30 sliding window visualization">
    <div class="sc30-phases">${phases}</div>
    <div class="sc30-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><b>${escapeHtml(eventLabel)}</b><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="sc30-formula">
      <div><small>word width</small><strong>${width}</strong><span>${vi ? "mỗi bước nhảy" : "each pointer jump"}</span></div>
      <b>×</b>
      <div><small>words</small><strong>${words.length}</strong><span>[${words.map((word) => escapeHtml(word)).join(", ")}]</span></div>
      <b>=</b>
      <div class="total"><small>target window</small><strong>${totalWidth}</strong><span>${vi ? "ký tự" : "characters"}</span></div>
    </section>
    <section class="sc30-offsets"><header><strong>${vi ? "CÁC OFFSET LANE" : "OFFSET LANES"}</strong><span>${vi ? "Mỗi lane đọc word tại các index cùng modulo width" : "Each lane reads starts with the same modulo width"}</span></header><div>${offsetLanes}</div></section>
    <section class="sc30-string"><header><strong>s = ${escapeHtml(JSON.stringify(s))}</strong><span>${vi ? "xanh=cửa sổ · vàng=word đang đọc · đỏ=reset/remove · lục=match" : "blue=window · gold=incoming word · red=reset/remove · green=match"}</span></header><div class="sc30-char-scroll"><div class="sc30-chars">${charCells}${endPointer}</div></div></section>
    <section class="sc30-token-section"><header><strong>${vi ? `WORD CHUNKS · OFFSET ${offset ?? "—"}` : `WORD CHUNKS · OFFSET ${offset ?? "—"}`}</strong><span>right ${vi ? "là biên phải exclusive" : "is an exclusive boundary"}</span></header><div class="sc30-token-scroll"><div class="sc30-tokens">${tokensHtml}</div></div></section>
    <div class="sc30-main">
      <section class="sc30-frequencies"><header><strong>need vs window</strong><span>${vi ? "Tần suất phải khớp chính xác" : "Frequencies must match exactly"}</span></header><div>${frequencyRows}</div></section>
      <section class="sc30-decision ${escapeHtml(String(view.phase || ""))}"><header><small>${eventLabel}</small><strong>${escapeHtml(view.decision || "—")}</strong></header><div class="sc30-metrics"><span><small>L</small><b>${left}</b></span><span><small>R</small><b>${right}</b></span><span><small>R−L</small><b>${windowLength}</b></span><span><small>${vi ? "word trong window" : "window words"}</small><b>${view.windowWords ?? 0}/${words.length}</b></span></div><footer><span>${vi ? "word hiện tại" : "incoming word"}</span><strong>${escapeHtml(activeWordText)}</strong></footer></section>
    </div>
    <section class="sc30-answers"><header><strong>result</strong><span>${vi ? "Chỉ số bắt đầu hợp lệ" : "Valid start indices"}${view.truncated ? ` · ${vi ? "timeline đã rút gọn cho input dài" : "timeline capped for long input"}` : ""}</span></header><div>${answerChips}</div></section>
  </section>`;
}

// ---- Sliding-window frequency visualization (e.g. bai 2958: Length of
// Longest Subarray With at Most K Frequency) ----
// Shows the array as a row of cells with the [left, right] window boxed
// together, colored L/R pointer arrows above the boundary cells, a live
// "freq table" panel listing the count of every distinct value currently
// inside the window (the offending value highlighted in red once it exceeds
// k), and a separate dimmed row marking the best window found so far.
function renderComplement1658View(step) {
  const view = step.complement1658View || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const vi = lang === "vi";
  const done = step.final;
  const isAll = view.phase === "all";
  const hasBest = isAll || (Number.isInteger(view.bestLen) && view.bestLen >= 0);
  const bestLength = isAll ? 0 : view.bestLen;
  const bestLeft = isAll ? 0 : view.bestLeft;
  const bestRight = isAll ? -1 : view.bestRight;
  const windowReady = Number.isInteger(view.windowLeft) && Number.isInteger(view.windowRight);
  const show = (number) => number === null || number === undefined ? "—" : number;
  const currentCells = nums.map((value, index) => {
    const inWindow = !done && windowReady && index >= view.windowLeft && index <= view.windowRight;
    const side = done && hasBest
      ? (index < bestLeft ? "take-left" : index > bestRight ? "take-right" : "keep")
      : done ? "future" : windowReady && index < view.windowLeft && index <= view.right ? "outside" : inWindow ? "keep" : "future";
    const pointer = !done && index === view.activeIndex ? " active" : "";
    return `<div class="co1658-cell ${side}${pointer}"><small>[${index}]</small><strong>${escapeHtml(value)}</strong></div>`;
  }).join("");
  const bestCells = hasBest ? nums.map((value, index) => {
    const side = index < bestLeft ? "take-left" : index > bestRight ? "take-right" : "keep";
    return `<div class="co1658-cell ${side}"><small>[${index}]</small><strong>${escapeHtml(value)}</strong></div>`;
  }).join("") : "";
  const leftCount = hasBest ? bestLeft : 0;
  const rightCount = hasBest ? nums.length - bestRight - 1 : 0;
  const bestMessage = hasBest
    ? (vi ? `Lấy trái ${leftCount} + lấy phải ${rightCount} = ${leftCount + rightCount} phép` : `Take ${leftCount} left + ${rightCount} right = ${leftCount + rightCount} operations`)
    : (vi ? "Chưa tìm thấy đoạn giữa có tổng bằng target." : "No middle segment summing to target has been found yet.");
  const currentLength = done ? (hasBest ? bestLength : 0)
    : windowReady && view.windowRight >= view.windowLeft ? view.windowRight - view.windowLeft + 1 : 0;
  const status = done
    ? view.answer < 0 ? (vi ? "Không có cách lấy ở hai đầu để đạt đúng x." : "No end removals can sum to exactly x.") : bestMessage
    : pick(step.note);
  const formula = view.target !== null && view.target < 0
    ? "x > total → return -1"
    : isAll ? "target == 0 → return len(nums)"
      : "operations = n - bestLen";

  $("treeView").innerHTML = `<section class="co1658-viz" aria-label="Minimum Operations to Reduce X to Zero visualization">
    <header class="co1658-heading"><div><small>SLIDING WINDOW · #1658</small><strong>${vi ? "GIỮ ĐOẠN GIỮA DÀI NHẤT" : "KEEP THE LONGEST MIDDLE SEGMENT"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="co1658-idea"><strong>${vi ? "ĐỔI GÓC NHÌN" : "CHANGE THE VIEW"}</strong><span>${vi ? "Lấy ở hai đầu" : "Remove from both ends"} <b>↔</b> ${vi ? "giữ một đoạn liên tiếp ở giữa" : "keep one contiguous middle segment"}</span><code>target = total - x = ${show(view.total)} - ${view.x} = ${show(view.target)}</code></div>
    <div class="co1658-stats"><div><small>total</small><strong>${show(view.total)}</strong></div><div><small>x</small><strong>${view.x}</strong></div><div class="target"><small>${vi ? "TỔNG CẦN GIỮ" : "SUM TO KEEP"}</small><strong>${show(view.target)}</strong></div><div><small>windowSum</small><strong>${show(view.windowSum)}</strong></div><div><small>${vi ? "ĐỘ DÀI HIỆN TẠI" : "CURRENT LENGTH"}</small><strong>${currentLength}</strong></div><div class="best"><small>bestLen</small><strong>${isAll ? "—" : show(view.bestLen)}</strong></div></div>
    <section class="co1658-panel"><header><strong>${done ? (vi ? "PHƯƠNG ÁN CUỐI" : "FINAL CHOICE") : (vi ? "ĐOẠN ĐANG XÉT" : "CURRENT WINDOW")}</strong><span>${done ? "" : `left = ${show(view.left)} · right = ${show(view.right)}`}</span></header><div class="co1658-scroll"><div class="co1658-row">${currentCells}</div></div><p>${escapeHtml(status)}</p></section>
    <section class="co1658-panel co1658-best"><header><strong>${vi ? "ĐOẠN TỐT NHẤT ĐÃ TÌM" : "BEST SEGMENT FOUND"}</strong><span>${hasBest ? (bestLength === 0 ? "∅" : `[${bestLeft}..${bestRight}]`) : "—"}</span></header>${hasBest ? `<div class="co1658-scroll"><div class="co1658-row">${bestCells}</div></div>` : ""}<p>${escapeHtml(bestMessage)}</p></section>
    <div class="co1658-legend"><span><i class="keep"></i>${vi ? "giữ đoạn giữa" : "keep middle"}</span><span><i class="take-left"></i>${vi ? "lấy bên trái" : "take left"}</span><span><i class="take-right"></i>${vi ? "lấy bên phải" : "take right"}</span></div>
    <footer class="co1658-answer ${done ? "done" : ""}"><div><small>${vi ? "CÔNG THỨC" : "FORMULA"}</small><code>${escapeHtml(formula)}</code><span>${escapeHtml(pick(step.note))}</span></div><strong>${done ? view.answer : "?"}</strong></footer>
  </section>`;
}

function renderNumberBfs2059View(step) {
  const view = step.numberBfs2059View || {};
  const vi = lang === "vi";
  const show = (value) => value === null || value === undefined ? "—" : escapeHtml(value);
  const current = view.current;
  const selected = view.num;
  const variants = current === null || selected === null ? [] : [
    { op: "+", value: current + selected },
    { op: "−", value: current - selected },
    { op: "^", value: current ^ selected },
  ];
  const candidates = variants.map(({ op, value }) => {
    const active = view.candidate && view.candidate.op === op;
    const status = active ? view.candidate.status : "preview";
    const badge = status === "goal" ? (vi ? "GOAL" : "GOAL")
      : status === "outside" ? (vi ? "NGOÀI KHOẢNG" : "OUT OF RANGE")
        : status === "seen" ? (vi ? "ĐÃ THẤY" : "SEEN")
          : status === "queued" ? (vi ? "TRONG QUEUE" : "QUEUED")
            : status === "new" || status === "discovered" ? (vi ? "MỚI" : "NEW") : "";
    return `<div class="nb2059-candidate ${active ? `active ${status}` : ""}"><small>${show(current)} ${escapeHtml(op)} ${show(selected)}</small><strong>${show(value)}</strong><span>${badge}</span></div>`;
  }).join("");
  const queue = (view.queue || []).map(({ value, depth }) => `<span class="nb2059-queue-item"><strong>${show(value)}</strong><small>d=${show(depth)}</small></span>`).join("");
  const path = (view.path || []).map(({ value, op, num }, index) =>
    `<span class="nb2059-path-node">${index ? `<small>${escapeHtml(op)} ${show(num)} →</small>` : ""}<strong>${show(value)}</strong></span>`).join("");
  const goalOutside = view.goal < 0 || view.goal > 1000;
  $("treeView").innerHTML = `<section class="nb2059-viz" aria-label="Minimum Operations to Convert Number visualization">
    <header class="nb2059-heading"><div><small>BFS · #2059</small><strong>${vi ? "ĐỔI SỐ VỚI ÍT THAO TÁC NHẤT" : "MINIMUM OPERATIONS TO CONVERT A NUMBER"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="nb2059-rule">${vi ? "Chỉ mở rộng trạng thái trong" : "Only expand states in"} <code>[0, 1000]</code>. ${goalOutside ? (vi ? "Goal ngoài khoảng vẫn hợp lệ ở bước cuối." : "An out-of-range goal is valid as the final move.") : (vi ? "BFS duyệt theo số thao tác tăng dần." : "BFS explores by increasing operation count.")}</div>
    <div class="nb2059-stats"><div><small>START</small><strong>${show(view.start)}</strong></div><div><small>GOAL</small><strong>${show(view.goal)}</strong></div><div><small>${vi ? "TẦNG BFS" : "BFS DEPTH"}</small><strong>${show(view.distance)}</strong></div><div><small>QUEUE</small><strong>${show(view.queueSize)}</strong></div><div><small>${vi ? "ĐÃ THẤY" : "SEEN"}</small><strong>${show(view.seenCount)}</strong></div></div>
    <section class="nb2059-panel"><header><strong>${vi ? "TRẠNG THÁI ĐANG MỞ RỘNG" : "CURRENT STATE"}</strong><span>${selected === null ? "" : `num = ${show(selected)}`}</span></header><div class="nb2059-current">${show(current)}</div><div class="nb2059-candidates">${candidates || `<p>${vi ? "Lấy trạng thái từ queue để thử ba phép toán." : "Pop a state to try the three operations."}</p>`}</div></section>
    <section class="nb2059-panel"><header><strong>${vi ? "HÀNG ĐỢI BFS" : "BFS QUEUE"}</strong><span>${show(view.queueSize)} ${vi ? "đang chờ" : "waiting"}</span></header><div class="nb2059-queue">${queue || `<span class="nb2059-empty">${vi ? "Trống" : "Empty"}</span>`}${view.queueSize > 8 ? `<span class="nb2059-empty">+${view.queueSize - 8} ${vi ? "khác" : "more"}</span>` : ""}</div></section>
    ${step.final ? `<section class="nb2059-panel nb2059-result"><header><strong>${view.answer < 0 ? (vi ? "KHÔNG THỂ ĐẠT GOAL" : "GOAL UNREACHABLE") : (vi ? "ĐƯỜNG ĐI NGẮN NHẤT" : "SHORTEST PATH")}</strong><span>${vi ? "Đáp án" : "Answer"}: ${show(view.answer)}</span></header>${path ? `<div class="nb2059-path">${path}</div>` : ""}</section>` : ""}
    <footer class="nb2059-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderShelfDp1105View(step) {
  const view = step.shelfDp1105View || {};
  const vi = lang === "vi";
  const show = (value) => value === null || value === undefined ? "—" : escapeHtml(value);
  const books = Array.isArray(view.books) ? view.books : [];
  const maxHeight = Math.max(1, ...books.map((book) => book.height));
  const bookTile = (book, active = false) => {
    const height = 30 + Math.round(book.height / maxHeight * 44);
    const width = 38 + Math.round(book.thickness / view.shelfWidth * 56);
    return `<div class="sh1105-book ${active ? "active" : ""}" style="--sh-height:${height}px;--sh-width:${width}px"><small>#${book.index + 1}</small><strong>${book.height}</strong><span>w=${book.thickness}</span></div>`;
  };
  const source = books.map((book) => bookTile(book,
    view.j !== null && view.i !== null && book.index >= view.j && book.index < view.i)).join("");
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const indices = dp.length <= 26
    ? dp.map((_, index) => index)
    : [...new Set([...Array.from({ length: 10 }, (_, index) => index),
      ...Array.from({ length: 7 }, (_, offset) => Math.min(dp.length - 1, Math.max(0, (view.i || 0) - 3 + offset))), dp.length - 1])].sort((a, b) => a - b);
  const dpCells = indices.map((index, position) => `${position && index > indices[position - 1] + 1 ? `<span class="sh1105-ellipsis">…</span>` : ""}
    <div class="sh1105-dp-cell ${index === view.i ? "current" : ""}"><small>dp[${index}]</small><strong>${dp[index] === null ? "∞" : show(dp[index])}</strong></div>`).join("");
  const shelves = (view.shelves || []).slice(0, 12).map((shelf, index) => `<div class="sh1105-shelf"><header><strong>${vi ? "KỆ" : "SHELF"} ${index + 1}</strong><span>${vi ? "rộng" : "width"} ${shelf.width}/${view.shelfWidth} · ${vi ? "cao" : "height"} ${shelf.height}</span></header><div class="sh1105-book-row">${shelf.books.map((book) => bookTile(book)).join("")}</div></div>`).join("");
  const moreShelves = (view.shelves || []).length > 12 ? `<span class="sh1105-more">+${view.shelves.length - 12} ${vi ? "kệ khác" : "more shelves"}</span>` : "";
  const bestText = view.i !== null && view.best === null ? "∞" : show(view.best);
  const formula = step.final ? `dp[${view.n}] = ${show(view.answer)}`
    : view.candidate === null ? (vi ? "Chọn j để thử kệ cuối [j..i−1]" : "Choose j for the final shelf [j..i−1]")
    : `dp[${view.j}] + maxHeight = ${show(view.previous)} + ${show(view.height)} = ${show(view.candidate)}`;
  $("treeView").innerHTML = `<section class="sh1105-viz" aria-label="Filling Bookcase Shelves visualization">
    <header class="sh1105-heading"><div><small>DP · #1105</small><strong>${vi ? "XẾP SÁCH LÊN KỆ" : "FILLING BOOKCASE SHELVES"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="sh1105-rule">${vi ? "Giữ nguyên thứ tự sách." : "Keep books in their original order."} <code>dp[i]</code> = ${vi ? "chiều cao nhỏ nhất của i quyển đầu" : "minimum height for the first i books"}.</div>
    <div class="sh1105-stats"><div><small>i</small><strong>${show(view.i)}</strong></div><div><small>j</small><strong>${show(view.j)}</strong></div><div><small>${vi ? "RỘNG KỆ CUỐI" : "LAST SHELF WIDTH"}</small><strong>${show(view.width)} / ${show(view.shelfWidth)}</strong></div><div><small>${vi ? "CAO KỆ CUỐI" : "LAST SHELF HEIGHT"}</small><strong>${show(view.height)}</strong></div><div><small>dp[i]</small><strong>${bestText}</strong></div></div>
    <section class="sh1105-panel"><header><strong>${vi ? "SÁCH THEO THỨ TỰ" : "BOOKS IN ORDER"}</strong><span>${books.length < view.n ? `${vi ? "Hiện" : "Showing"} ${books.length}/${view.n}` : `${view.n} ${vi ? "quyển" : "books"}`}</span></header><div class="sh1105-book-scroll"><div class="sh1105-book-row">${source}</div></div><p>${vi ? "Số lớn trên sách là chiều cao; w là độ dày. Sách viền vàng đang được thử trên kệ cuối." : "The large number is height; w is thickness. Gold-bordered books are on the trial last shelf."}</p></section>
    <section class="sh1105-panel"><header><strong>${vi ? "THỬ PHƯƠNG ÁN" : "TRIAL CANDIDATE"}</strong><span>${view.phase === "break" ? (vi ? "KỆ QUÁ RỘNG" : "TOO WIDE") : ""}</span></header><code class="sh1105-formula">${escapeHtml(formula)}</code><div class="sh1105-dp-row">${dpCells}</div></section>
    ${shelves ? `<section class="sh1105-panel sh1105-layout"><header><strong>${step.final ? (vi ? "CÁCH XẾP TỐI ƯU" : "OPTIMAL ARRANGEMENT") : (vi ? "PHƯƠNG ÁN TỐT NHẤT HIỆN TẠI" : "CURRENT BEST ARRANGEMENT")}</strong><span>${step.final ? `${vi ? "Tổng cao" : "Total height"} ${show(view.answer)}` : `${vi ? "Tổng cao" : "Total height"} ${show(view.best)}`}</span></header><div class="sh1105-shelves">${shelves}${moreShelves}</div></section>` : ""}
    <footer class="sh1105-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderServerHeap1606View(step) {
  const view = step.serverHeap1606View || {};
  const vi = lang === "vi";
  const show = (value) => value === null || value === undefined ? "—" : escapeHtml(value);
  const servers = (view.servers || []).map((item) => {
    const classes = ["sv1606-server", item.until !== null ? "busy" : "free",
      item.preferred ? "preferred" : "", item.chosen ? "chosen" : "", item.released ? "released" : ""].join(" ");
    return `<div class="${classes}"><small>SERVER ${item.id}</small><strong>${show(item.count)}</strong><span>${item.until === null ? (vi ? "RẢNH" : "FREE") : `${vi ? "BẬN TỚI" : "BUSY UNTIL"} ${show(item.until)}`}</span></div>`;
  }).join("");
  const freeSlots = (view.freeSlots || []).map(({ virtual, server }) =>
    `<span class="sv1606-heap-item"><small>slot ${show(virtual)}</small><strong>→ S${show(server)}</strong></span>`).join("");
  const busyJobs = (view.busyJobs || []).map(({ until, server }) =>
    `<span class="sv1606-heap-item"><small>S${show(server)}</small><strong>${vi ? "xong" : "until"} ${show(until)}</strong></span>`).join("");
  const winners = (view.answer || []).map((id) => `<span class="sv1606-winner">S${show(id)}</span>`).join("");
  const slotFormula = view.slot !== null && view.i !== null && view.server !== null
    ? `slot = ${show(view.slot)} → server = ${show(view.slot)} % ${show(view.k)} = ${show(view.slot % view.k)}`
    : view.released !== null && view.i !== null
      ? `slot = i + (server − i) mod k`
      : `server ${vi ? "ưu tiên" : "preferred"} = i mod k`;
  $("treeView").innerHTML = `<section class="sv1606-viz" aria-label="Find Servers That Handled Most Number of Requests visualization">
    <header class="sv1606-heading"><div><small>TWO HEAPS · #1606</small><strong>${vi ? "SERVER XỬ LÝ NHIỀU REQUEST NHẤT" : "BUSIEST SERVERS"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="sv1606-rule">${vi ? "Request i ưu tiên server" : "Request i prefers server"} <code>i % k</code>; ${vi ? "nếu bận, tìm server rảnh kế tiếp theo vòng." : "if busy, take the next free server with wraparound."}</div>
    <div class="sv1606-stats"><div><small>REQUEST</small><strong>${show(view.i)} / ${show(view.requestCount)}</strong></div><div><small>${vi ? "THỜI ĐIỂM" : "ARRIVAL"}</small><strong>${show(view.time)}</strong></div><div><small>LOAD</small><strong>${show(view.duration)}</strong></div><div><small>${vi ? "ƯU TIÊN" : "PREFERRED"}</small><strong>${show(view.preferred)}</strong></div><div><small>${vi ? "ĐÃ BỎ" : "DROPPED"}</small><strong>${show(view.droppedCount)}</strong></div></div>
    <section class="sv1606-panel"><header><strong>${vi ? "TRẠNG THÁI SERVER" : "SERVER STATUS"}</strong><span>${(view.servers || []).length < view.k ? `${vi ? "Hiện" : "Showing"} ${(view.servers || []).length}/${view.k}` : `${view.k} servers`}</span></header><div class="sv1606-servers">${servers}</div><div class="sv1606-legend"><span>${vi ? "viền tím: ưu tiên" : "purple: preferred"}</span><span>${vi ? "viền xanh: được chọn" : "green: selected"}</span><span>${vi ? "số lớn: đã xử lý" : "large number: handled"}</span></div></section>
    <div class="sv1606-heaps"><section class="sv1606-panel"><header><strong>${vi ? "FREE HEAP · VỊ TRÍ ẢO" : "FREE HEAP · VIRTUAL SLOTS"}</strong><span>${show(view.freeCount)} ${vi ? "server rảnh" : "free"}</span></header><div class="sv1606-heap-list">${freeSlots || `<span class="sv1606-empty">${vi ? "Trống" : "Empty"}</span>`}${view.freeCount > 30 ? `<span class="sv1606-empty">${vi ? "Chỉ hiện phần tử nhỏ nhất" : "Showing the minimum only"}</span>` : ""}</div></section><section class="sv1606-panel"><header><strong>${vi ? "BUSY HEAP · GIỜ HOÀN TẤT" : "BUSY HEAP · FINISH TIMES"}</strong><span>${show(view.busyCount)} ${vi ? "server bận" : "busy"}</span></header><div class="sv1606-heap-list">${busyJobs || `<span class="sv1606-empty">${vi ? "Trống" : "Empty"}</span>`}${view.busyCount > 30 ? `<span class="sv1606-empty">${vi ? "Chỉ hiện phần tử nhỏ nhất" : "Showing the minimum only"}</span>` : ""}</div></section></div>
    <div class="sv1606-formula"><code>${escapeHtml(slotFormula)}</code><span>${view.dropped ? (vi ? "Request này bị bỏ vì không còn server rảnh." : "This request was dropped because no server was free.") : ""}</span></div>
    ${step.final ? `<section class="sv1606-panel sv1606-result"><header><strong>${vi ? "SERVER BẬN NHẤT" : "BUSIEST SERVERS"}</strong><span>${vi ? "Mỗi server xử lý" : "Handled by each"} ${show(view.best)}</span></header><div class="sv1606-winners">${winners}${view.winnerCount > (view.answer || []).length ? `<span class="sv1606-empty">+${view.winnerCount - view.answer.length} ${vi ? "server khác" : "more"}</span>` : ""}</div></section>` : ""}
    <footer class="sv1606-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderMeetingRooms2402View(step) {
  const view = step.meetingRooms2402View || {};
  const vi = lang === "vi";
  const show = (value) => value === null || value === undefined ? "—" : escapeHtml(value);
  const meeting = view.meeting;
  const rooms = (view.rooms || []).map(({ id, count, until, chosen, released }) =>
    `<div class="mr2402-room ${until === null ? "free" : "busy"} ${chosen ? "chosen" : ""} ${released ? "released" : ""}"><small>ROOM ${show(id)}</small><strong>${show(count)}</strong><span>${until === null ? (vi ? "RẢNH" : "FREE") : `${vi ? "BẬN TỚI" : "BUSY UNTIL"} ${show(until)}`}</span></div>`).join("");
  const freeRooms = (view.freeRooms || []).map((id) => `<span class="mr2402-heap-chip">R${show(id)}</span>`).join("");
  const busyJobs = (view.busyJobs || []).map(({ until, room }) =>
    `<span class="mr2402-heap-chip">R${show(room)} <small>→ ${show(until)}</small></span>`).join("");
  const assignments = (view.assignments || []).map((item) =>
    `<div class="mr2402-assignment ${item.actualStart > item.originalStart ? "delayed" : ""}"><small>#${show(item.originalIndex)} · R${show(item.room)}</small><strong>[${show(item.actualStart)}, ${show(item.finish)})</strong><span>${item.actualStart > item.originalStart ? `${vi ? "gốc" : "original"} [${show(item.originalStart)}, ${show(item.originalEnd)})` : (vi ? "đúng giờ" : "on time")}</span></div>`).join("");
  const currentText = meeting ? `[${show(meeting.start)}, ${show(meeting.end)})` : "—";
  const actualText = view.actualStart !== null && view.finish !== null
    ? `[${show(view.actualStart)}, ${show(view.finish)})` : "—";
  $("treeView").innerHTML = `<section class="mr2402-viz" aria-label="Meeting Rooms III visualization">
    <header class="mr2402-heading"><div><small>TWO HEAPS · #2402</small><strong>${vi ? "PHÒNG HỌP ĐƯỢC DÙNG NHIỀU NHẤT" : "MEETING ROOMS III"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="mr2402-rule">${vi ? "Xét theo giờ bắt đầu gốc. Phòng rảnh: lấy số nhỏ nhất. Hết phòng: lấy phòng xong sớm nhất, giữ nguyên thời lượng." : "Use original start order. Take the lowest free room; if none is free, wait for the earliest finish and keep the duration."}</div>
    <div class="mr2402-stats"><div><small>MEETING</small><strong>${view.currentIndex === null ? "—" : `${show(view.currentIndex + 1)} / ${show(view.meetingCount)}`}</strong></div><div><small>${vi ? "LỊCH GỐC" : "ORIGINAL"}</small><strong>${currentText}</strong></div><div><small>${vi ? "LỊCH THỰC" : "ACTUAL"}</small><strong>${actualText}</strong></div><div><small>${vi ? "PHÒNG CHỌN" : "ROOM"}</small><strong>${show(view.room)}</strong></div></div>
    ${view.delayed ? `<div class="mr2402-delay">${vi ? "Đã dời" : "Delayed"}: ${currentText} → ${actualText}. ${vi ? "Thời lượng không đổi." : "Duration is unchanged."}</div>` : ""}
    <section class="mr2402-panel"><header><strong>${vi ? "TRẠNG THÁI PHÒNG · SỐ CUỘC HỌP" : "ROOM STATUS · MEETING COUNTS"}</strong><span>${(view.rooms || []).length < view.n ? `${vi ? "Hiện" : "Showing"} ${(view.rooms || []).length}/${show(view.n)}` : `${show(view.n)} rooms`}</span></header><div class="mr2402-rooms">${rooms}</div><div class="mr2402-legend">${vi ? "Viền xanh: phòng được chọn · Viền nét đứt: vừa giải phóng · Số lớn: số cuộc họp" : "Green border: selected · Dashed border: just released · Large number: meetings held"}</div></section>
    <div class="mr2402-heaps"><section class="mr2402-panel"><header><strong>FREE HEAP · ${vi ? "SỐ PHÒNG" : "ROOM NUMBER"}</strong><span>${show(view.freeCount)} ${vi ? "rảnh" : "free"}</span></header><div class="mr2402-heap-list">${freeRooms || `<span class="mr2402-empty">${vi ? "Trống" : "Empty"}</span>`}</div></section><section class="mr2402-panel"><header><strong>BUSY HEAP · ${vi ? "GIỜ XONG, PHÒNG" : "FINISH, ROOM"}</strong><span>${show(view.busyCount)} ${vi ? "bận" : "busy"}</span></header><div class="mr2402-heap-list">${busyJobs || `<span class="mr2402-empty">${vi ? "Trống" : "Empty"}</span>`}</div></section></div>
    <section class="mr2402-panel"><header><strong>${vi ? "LỊCH ĐÃ PHÂN" : "SCHEDULED MEETINGS"}</strong><span>${show(view.assignmentCount)} / ${show(view.meetingCount)}</span></header><div class="mr2402-assignments">${assignments || `<span class="mr2402-empty">${vi ? "Chưa có cuộc họp" : "No meetings assigned yet"}</span>`}${view.assignmentCount > (view.assignments || []).length ? `<span class="mr2402-empty">… ${vi ? "đã rút gọn" : "truncated"}</span>` : ""}</div></section>
    ${step.final ? `<section class="mr2402-panel mr2402-result"><header><strong>${vi ? "PHÒNG NHIỀU CUỘC HỌP NHẤT" : "MOST-BOOKED ROOM"}</strong><span>${show(view.best)} ${vi ? "cuộc họp" : "meetings"}</span></header><strong>Room ${show(view.answer)}</strong></section>` : ""}
    <footer class="mr2402-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderAdjacentRuns3350View(step) {
  const view = step.adjacentRuns3350View || {};
  const vi = lang === "vi";
  const show = (value) => value === null || value === undefined ? "—" : escapeHtml(value);
  const focus = view.candidate || view.witness;
  const partOf = (pair, index) => {
    if (!pair) return "";
    if (index >= pair.leftStart && index < pair.leftStart + pair.k) return "left";
    if (index >= pair.rightStart && index < pair.rightStart + pair.k) return "right";
    return "";
  };
  let previousIndex = -1;
  const cells = (view.cells || []).map(({ index, value }) => {
    const gap = index > previousIndex + 1 ? `<span class="ai3350-gap">…</span>` : "";
    previousIndex = index;
    const side = partOf(focus, index);
    const bestSide = partOf(view.witness, index);
    const inCurrent = view.currentRun && index >= view.currentRun[0] && index <= view.currentRun[1];
    const inPrevious = view.previousRun && index >= view.previousRun[0] && index <= view.previousRun[1];
    const classes = ["ai3350-cell", side ? `focus-${side}` : "", bestSide ? "best" : "",
      inCurrent ? "current" : "", inPrevious ? "previous" : "", index === view.i ? "active" : ""].filter(Boolean).join(" ");
    return `${gap}<div class="${classes}"><small>[${index}]</small><strong>${show(value)}</strong><span>${side ? side === "left" ? "L" : "R" : ""}</span></div>`;
  }).join("");
  const runText = (range) => range ? `[${show(range[0])}..${show(range[1])}]` : "—";
  const pairText = (pair) => pair
    ? `[${show(pair.leftStart)}..${show(pair.leftStart + pair.k - 1)}] + [${show(pair.rightStart)}..${show(pair.rightStart + pair.k - 1)}]`
    : "—";
  $("treeView").innerHTML = `<section class="ai3350-viz" aria-label="Adjacent Increasing Subarrays Detection II visualization">
    <header class="ai3350-heading"><div><small>INCREASING RUNS · #3350</small><strong>${vi ? "HAI ĐOẠN TĂNG LIỀN KỀ" : "ADJACENT INCREASING SUBARRAYS"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ai3350-rule">${vi ? "Hai đoạn phải có cùng độ dài k, đứng sát nhau và mỗi đoạn tăng nghiêm ngặt. Điểm nối giữa hai đoạn không bắt buộc tăng." : "Both subarrays must have length k, be adjacent, and increase strictly inside each one. Their shared boundary need not increase."}</div>
    <div class="ai3350-stats"><div><small>i</small><strong>${show(view.i)}</strong></div><div><small>${vi ? "RUN TRƯỚC" : "PREVIOUS RUN"}</small><strong>${show(view.previous)}</strong></div><div><small>${vi ? "RUN HIỆN TẠI" : "CURRENT RUN"}</small><strong>${show(view.current)}</strong></div><div><small>best k</small><strong>${show(view.best)}</strong></div></div>
    <section class="ai3350-panel"><header><strong>nums</strong><span>${(view.cells || []).length < view.n ? `${vi ? "Hiện" : "Showing"} ${(view.cells || []).length}/${show(view.n)}` : `${show(view.n)} ${vi ? "phần tử" : "values"}`}</span></header><div class="ai3350-array-scroll"><div class="ai3350-array">${cells}</div></div><div class="ai3350-legend"><span>${vi ? "L/R: hai đoạn đang xét" : "L/R: the two subarrays"}</span><span>${vi ? "viền vàng: cặp tốt nhất" : "gold outline: best pair"}</span></div></section>
    <div class="ai3350-runs"><div><small>${vi ? "RUN TRƯỚC" : "PREVIOUS RUN"}</small><strong>${runText(view.previousRun)}</strong></div><div><small>${vi ? "RUN HIỆN TẠI" : "CURRENT RUN"}</small><strong>${runText(view.currentRun)}</strong></div></div>
    <div class="ai3350-candidates"><div class="${view.candidate?.kind === "inside" ? "active" : ""}"><small>${vi ? "CHIA ĐÔI MỘT RUN" : "SPLIT ONE RUN"}</small><strong>⌊current / 2⌋ = ${show(view.inside)}</strong></div><div class="${view.candidate?.kind === "across" ? "active" : ""}"><small>${vi ? "GHÉP QUA RANH GIỚI" : "ACROSS RUN BOUNDARY"}</small><strong>min(previous, current) = ${show(view.across)}</strong></div></div>
    <section class="ai3350-panel ai3350-best"><header><strong>${vi ? "CẶP TỐT NHẤT" : "BEST PAIR"}</strong><span>k = ${show(view.best)}</span></header><code>${pairText(view.witness)}</code>${view.candidate ? `<p>${vi ? "Đang thử" : "Trying"}: ${pairText(view.candidate)}</p>` : ""}</section>
    <footer class="ai3350-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderDigitSum3550View(step) {
  const view = step.digitSum3550View || {};
  const vi = lang === "vi";
  const show = (value) => value === null || value === undefined ? "—" : escapeHtml(value);
  let previousIndex = -1;
  const cells = (view.cells || []).map((item) => {
    const gap = item.index > previousIndex + 1 ? `<span class="ds3550-gap">…</span>` : "";
    previousIndex = item.index;
    const classes = ["ds3550-cell", item.scanned ? "scanned" : "", item.current ? "current" : "",
      item.matched ? "matched" : ""].filter(Boolean).join(" ");
    return `${gap}<div class="${classes}"><small>[${show(item.index)}]</small><strong>${show(item.value)}</strong><span>${item.matched ? "✓" : item.current ? "▲" : ""}</span></div>`;
  }).join("");
  const digits = (view.digits || []).map((value, index, all) => {
    const processed = index >= all.length - view.processed;
    const active = view.phase === "add-digit" && index === all.length - view.processed;
    return `<div class="ds3550-digit ${processed ? "processed" : ""} ${active ? "active" : ""}"><small>10<sup>${all.length - index - 1}</sup></small><strong>${show(value)}</strong></div>`;
  }).join("");
  const processedDigits = view.processed ? (view.digits || []).slice(-view.processed).reverse() : [];
  const expression = processedDigits.length ? processedDigits.map(show).join(" + ")
    : view.value === 0 && view.total !== null ? "0" : "…";
  const compared = view.phase === "compare" || view.phase === "found";
  const matches = compared && view.total === view.i;
  const exhausted = step.final && view.answer === -1;
  $("treeView").innerHTML = `<section class="ds3550-viz" aria-label="Smallest Index With Digit Sum Equal to Index visualization">
    <header class="ds3550-heading"><div><small>DIGIT SUM · #3550</small><strong>${vi ? "CHỈ SỐ NHỎ NHẤT BẰNG TỔNG CHỮ SỐ" : "SMALLEST INDEX = DIGIT SUM"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ds3550-rule">${vi ? "Quét i từ trái sang phải. Khi tổng chữ số của nums[i] bằng i, trả về ngay: đó chắc chắn là chỉ số nhỏ nhất." : "Scan i from left to right. Return as soon as the digit sum of nums[i] equals i: this is necessarily the smallest index."}</div>
    <div class="ds3550-stats"><div><small>i</small><strong>${show(view.i)}</strong></div><div><small>nums[i]</small><strong>${show(view.value)}</strong></div><div><small>${vi ? "CÒN LẠI" : "REMAINING"}</small><strong>${show(view.remaining)}</strong></div><div><small>${vi ? "TỔNG CHỮ SỐ" : "DIGIT SUM"}</small><strong>${show(view.total)}</strong></div></div>
    <section class="ds3550-panel"><header><strong>nums</strong><span>${(view.cells || []).length < view.n ? `${vi ? "Hiện" : "Showing"} ${(view.cells || []).length}/${show(view.n)}` : `${show(view.n)} ${vi ? "phần tử" : "values"}`}</span></header><div class="ds3550-scroll"><div class="ds3550-array">${cells}</div></div><p>${vi ? "Ô mờ đã kiểm tra · viền xanh là vị trí hiện tại · dấu ✓ là chỉ số đầu tiên khớp." : "Dim cells were checked · cyan border is the current index · ✓ marks the first match."}</p></section>
    <section class="ds3550-panel"><header><strong>${vi ? "TÁCH TỪNG CHỮ SỐ" : "EXTRACT DIGITS"}</strong><span>${view.value === null ? "—" : `${show(view.processed)} / ${(view.digits || []).length}`}</span></header><div class="ds3550-digits">${digits || `<span class="ds3550-empty">${vi ? "Chọn một phần tử" : "Select a value"}</span>`}</div><div class="ds3550-equation">${vi ? "Đã cộng" : "Added"}: <code>${expression} = ${show(view.total)}</code>${view.digit !== null ? `<span>${vi ? "chữ số vừa lấy" : "last digit"}: ${show(view.digit)}</span>` : ""}</div></section>
    <div class="ds3550-compare ${exhausted ? "mismatch" : compared ? matches ? "match" : "mismatch" : ""}"><strong>${exhausted ? (vi ? "Đã kiểm tra mọi chỉ số" : "All indices checked") : `${show(view.total)} ${compared ? matches ? "=" : "≠" : "?"} ${show(view.i)}`}</strong><span>${exhausted ? (vi ? "Không có tổng chữ số nào bằng chỉ số tương ứng" : "No digit sum equals its index") : compared ? matches ? (vi ? "Khớp — dừng tại chỉ số nhỏ nhất" : "Match — stop at the smallest index") : (vi ? "Chưa khớp — xét phần tử tiếp" : "No match — continue scanning") : (vi ? "Đang tính tổng chữ số" : "Computing digit sum")}</span></div>
    ${step.final ? `<section class="ds3550-panel ds3550-result"><header><strong>${vi ? "KẾT QUẢ" : "RESULT"}</strong></header><strong>${show(view.answer)}</strong><span>${view.answer === -1 ? (vi ? "Không có chỉ số hợp lệ" : "No matching index") : (vi ? "Chỉ số khớp đầu tiên" : "First matching index")}</span></section>` : ""}
    <footer class="ds3550-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderPermutation1589View(step) {
  const view = step.permutation1589View || {};
  const vi = lang === "vi";
  const show = (value) => value === null || value === undefined ? "—" : escapeHtml(value);
  const activeRequest = view.requestIndex;
  const requestList = [...(view.requests || [])];
  if (activeRequest !== null && !requestList.some((item) => item.index === activeRequest) && view.request) {
    requestList.push({ index: activeRequest, left: view.request[0], right: view.request[1] });
  }
  const requests = requestList.map((item) => `<span class="mp1589-request ${item.index === activeRequest ? "active" : ""}">#${show(item.index)} [${show(item.left)}, ${show(item.right)}]</span>`).join("");
  let previous = -1;
  const cells = (view.cells || []).map((cell) => {
    const gap = cell.index > previous + 1 ? `<span class="mp1589-gap">…</span>` : "";
    previous = cell.index;
    const inRange = view.request && cell.index >= view.request[0] && cell.index <= view.request[1];
    const active = cell.index === view.activeIndex;
    return `${gap}<div class="mp1589-cell ${inRange ? "in-range" : ""} ${active ? "active" : ""}"><small>${cell.index === view.n ? "end" : `[${show(cell.index)}]`}</small><strong>${cell.index === view.n ? "∅" : show(cell.value)}</strong><span>Δ ${show(cell.diff)}</span><span>f ${show(cell.frequency)}</span></div>`;
  }).join("");
  previous = -1;
  const pairs = (view.sorted || []).map((item) => {
    const gap = item.index > previous + 1 ? `<span class="mp1589-gap">…</span>` : "";
    previous = item.index;
    return `${gap}<div class="mp1589-pair ${item.index === view.pairIndex ? "active" : ""}"><small>#${show(item.index)}</small><strong>${show(item.value)} × ${show(item.frequency)}</strong><span>${item.value === null || item.frequency === null ? "—" : show(item.value * item.frequency)}</span></div>`;
  }).join("");
  const phase = view.phase || "init";
  const stage = phase.startsWith("range") || phase === "init" ? (vi ? "1 · ĐÁNH DẤU ĐOẠN" : "1 · MARK RANGES")
    : phase === "prefix" ? (vi ? "2 · ĐẾM TẦN SUẤT" : "2 · COUNT COVERAGE")
      : (vi ? "3 · GHÉP TỐI ƯU" : "3 · OPTIMAL PAIRING");
  $("treeView").innerHTML = `<section class="mp1589-viz" aria-label="Maximum Sum Obtained of Any Permutation visualization">
    <header class="mp1589-heading"><div><small>DIFFERENCE ARRAY + GREEDY · #1589</small><strong>${vi ? "TỔNG TRUY VẤN LỚN NHẤT" : "MAXIMUM REQUEST SUM"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="mp1589-rule">${vi ? "Mỗi vị trí đóng góp nums[i] × số truy vấn phủ nó. Đặt số lớn ở nơi được dùng nhiều lần nhất." : "Each position contributes nums[i] × its request count. Put the largest values at the most-used positions."}</div>
    <div class="mp1589-stats"><div><small>${vi ? "GIAI ĐOẠN" : "STAGE"}</small><strong>${stage}</strong></div><div><small>${vi ? "VỊ TRÍ" : "POSITION"}</small><strong>${show(view.activeIndex)}</strong></div><div><small>${vi ? "TẦN SUẤT" : "FREQUENCY"}</small><strong>${phase === "prefix" ? show(view.running) : "—"}</strong></div><div><small>${vi ? "TỔNG HIỆN TẠI" : "RUNNING SUM"}</small><strong>${phase === "pair" || phase === "done" ? show(view.answer) : "—"}</strong></div></div>
    <section class="mp1589-panel"><header><strong>requests</strong><span>${show(view.requestCount)} ${vi ? "đoạn" : "ranges"}</span></header><div class="mp1589-requests">${requests}</div>${view.request ? `<p>${vi ? "Đang xét" : "Current"}: [${show(view.request[0])}, ${show(view.request[1])}] · Δ[${show(view.request[0])}] += 1 · Δ[${show(view.request[1] + 1)}] -= 1</p>` : ""}</section>
    <section class="mp1589-panel"><header><strong>${vi ? "MẢNG HIỆU → SỐ LẦN PHỦ" : "DIFFERENCE ARRAY → COVERAGE"}</strong><span>n = ${show(view.n)}</span></header><div class="mp1589-scroll"><div class="mp1589-cells">${cells}</div></div><p>${vi ? "Δ là mảng hiệu · f là tần suất sau tổng tiền tố · ô end không thuộc nums." : "Δ is the difference array · f is the prefix-sum frequency · end is a sentinel outside nums."}</p></section>
    <section class="mp1589-panel"><header><strong>${vi ? "SỐ ĐÃ SẮP × TẦN SUẤT ĐÃ SẮP" : "SORTED VALUES × SORTED FREQUENCIES"}</strong><span>${vi ? "ghép cùng thứ tự" : "pair in order"}</span></header><div class="mp1589-scroll"><div class="mp1589-pairs">${pairs || `<span class="mp1589-empty">${vi ? "Đếm tần suất trước, rồi sắp xếp hai dãy." : "Count coverage first, then sort both lists."}</span>`}</div></div>${view.pairIndex !== null ? `<p>${vi ? "Vừa cộng" : "Just added"}: ${show(view.contribution)} → ${show(view.answer)} (mod 1 000 000 007)</p>` : ""}</section>
    ${view.truncated ? `<div class="mp1589-short">${vi ? "Trace chỉ hiển thị phần đầu; kết quả vẫn tính trên toàn bộ đầu vào." : "The trace shows only the beginning; the answer still uses the full input."}</div>` : ""}
    ${step.final ? `<section class="mp1589-panel mp1589-result"><header><strong>${vi ? "ĐÁP ÁN" : "ANSWER"}</strong></header><strong>${show(view.answer)}</strong></section>` : ""}
    <footer class="mp1589-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderPrefixScores2416View(step) {
  const view = step.prefixScores2416View || {};
  const vi = lang === "vi";
  const phase = view.phase || "enter";
  const stage = phase === "done" ? 2 : phase.startsWith("score") || phase === "answer-init"
    || phase === "total-init" || phase === "append-answer" ? 1 : 0;
  const stageLabels = vi
    ? ["1 · Xây Trie + đếm prefix", "2 · Cộng điểm từng từ", "3 · Kết quả"]
    : ["1 · Build Trie + count prefixes", "2 · Score each word", "3 · Result"];
  const stages = stageLabels.map((title, index) => `<span class="${index < stage ? "done" : index === stage ? "active" : "pending"}">${index < stage ? "✓" : index === stage ? "▶" : "○"}<b>${title}</b></span>`).join("");
  const answers = view.answer || [];
  const words = (view.words || []).map((word, index) => {
    const classes = ["ps2416-word", index === view.wordIndex ? "active" : "",
      index < answers.length ? "done" : ""].filter(Boolean).join(" ");
    const score = index < answers.length ? answers[index] : "—";
    return `<div class="${classes}"><small>#${index}</small><strong>${escapeHtml(word)}</strong><span>${vi ? "điểm" : "score"} ${score}</span></div>`;
  }).join("");
  const activePath = new Set(view.activePath || []);
  const nodesByDepth = new Map();
  for (const node of view.nodes || []) {
    if (!nodesByDepth.has(node.depth)) nodesByDepth.set(node.depth, []);
    nodesByDepth.get(node.depth).push(node);
  }
  const nodeRows = [...nodesByDepth.entries()].map(([depth, nodes]) => `<div class="ps2416-level"><small>d=${depth}</small><div>${nodes.map((node) => {
    const classes = ["ps2416-node", node.id === 0 ? "root" : "",
      activePath.has(node.id) ? "path" : "", node.id === view.currentNode ? "current" : "",
      node.id === view.nextNode ? "next" : ""].filter(Boolean).join(" ");
    return `<div class="${classes}"><small>#${node.id}${node.parent === null ? "" : ` ← #${node.parent}`}</small><strong>${node.id === 0 ? "root" : escapeHtml(node.prefix)}</strong><span>count = ${node.count}</span></div>`;
  }).join("")}</div></div>`).join("");
  const activeWord = view.word || "";
  const prefixCards = [...activeWord].map((_char, index) => {
    const prefix = activeWord.slice(0, index + 1);
    const trieNode = (view.nodes || []).find((node) => node.prefix === prefix);
    const classes = ["ps2416-prefix", prefix === view.currentPrefix ? "current" : "",
      prefix === view.nextPrefix ? "next" : ""].filter(Boolean).join(" ");
    return `<div class="${classes}"><small>${index + 1}</small><strong>${escapeHtml(prefix)}</strong><span>${trieNode ? `count ${trieNode.count}` : (vi ? "chưa tạo" : "not built")}</span></div>`;
  }).join("");
  let formula = vi ? "Chọn một từ để xem đường prefix." : "Select a word to inspect its prefix path.";
  if (stage === 0 && view.word) {
    formula = `count("${escapeHtml(view.nextPrefix || view.currentPrefix)}") += 1`;
  } else if (stage === 1 && view.word) {
    formula = view.addedCount === null ? `total = ${view.total ?? 0}`
      : `total += ${view.addedCount} → ${view.total}`;
  } else if (stage === 2) {
    formula = `[${answers.slice(0, 8).join(", ")}${answers.length > 8 ? ", …" : ""}]`;
  }
  const resultChips = answers.slice(0, 8).map((score, index) => `<span><small>#${index}</small><b>${score}</b></span>`).join("");
  $("treeView").innerHTML = `<section class="ps2416-viz" aria-label="Sum of Prefix Scores of Strings visualization">
    <header class="ps2416-heading"><div><small>COUNTED TRIE · #2416</small><strong>${vi ? "TỔNG ĐIỂM CÁC PREFIX" : "SUM OF PREFIX SCORES"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ps2416-rule">${vi ? "Mỗi nút Trie lưu số từ đi qua prefix đó. Điểm của một từ = tổng count trên đường từ gốc tới từ." : "Each Trie node stores how many words pass through its prefix. A word's score is the sum of counts along its root-to-word path."}</div>
    <div class="ps2416-stages">${stages}</div>
    <div class="ps2416-stats"><div><small>${vi ? "SỐ TỪ" : "WORDS"}</small><strong>${view.wordCount}</strong></div><div><small>${vi ? "TỔNG KÝ TỰ" : "CHARACTERS"}</small><strong>${view.totalChars}</strong></div><div><small>${vi ? "NÚT TRIE" : "TRIE NODES"}</small><strong>${view.nodeCount}</strong></div><div><small>${vi ? "TỔNG HIỆN TẠI" : "RUNNING TOTAL"}</small><strong>${view.total ?? "—"}</strong></div></div>
    <section class="ps2416-panel"><header><strong>${vi ? "TỪ ĐẦU VÀO" : "INPUT WORDS"}</strong><span>${vi ? "vàng = đang xử lý · xanh = đã chấm điểm" : "amber = active · green = scored"}</span></header><div class="ps2416-words">${words}</div></section>
    <div class="ps2416-main"><section class="ps2416-panel"><header><strong>TRIE</strong><span>${vi ? "mỗi hàng là một độ sâu" : "one row per depth"}</span></header><div class="ps2416-tree">${nodeRows}</div></section><section class="ps2416-panel"><header><strong>${vi ? "ĐƯỜNG PREFIX" : "PREFIX PATH"}</strong><span>${escapeHtml(activeWord || "—")}</span></header><div class="ps2416-prefixes">${prefixCards || `<span class="ps2416-empty">${vi ? "Chưa chọn từ." : "No active word."}</span>`}</div><div class="ps2416-formula"><small>${stage === 0 ? (vi ? "TĂNG COUNT" : "INCREMENT COUNT") : stage === 1 ? (vi ? "CỘNG ĐIỂM" : "ADD SCORE") : (vi ? "ĐÁP ÁN" : "ANSWER")}</small><strong>${formula}</strong></div><div class="ps2416-results">${resultChips || `<span class="ps2416-empty">${vi ? "Chưa có điểm hoàn chỉnh." : "No completed scores yet."}</span>`}</div></section></div>
    ${view.shortened ? `<div class="ps2416-short">${vi ? "Trace giới hạn 8 từ, 40 ký tự và 28 nút; đáp án vẫn tính toàn bộ input." : "The trace previews 8 words, 40 characters, and 28 nodes; the answer still uses the full input."}</div>` : ""}
    <footer class="ps2416-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderBraceExpansion1096View(step) {
  const view = step.braceExpansion1096View || {};
  const vi = lang === "vi";
  const chars = [...(view.expression || "")].map((char, index) => {
    const classes = ["be1096-token", index < view.index ? "consumed" : "",
      index === view.index ? "current" : "", char === "{" || char === "}" ? "brace" : "",
      char === "," ? "comma" : ""].filter(Boolean).join(" ");
    return `<span class="${classes}"><small>${index}</small><strong>${escapeHtml(char)}</strong>${index === view.index ? "<i>i</i>" : ""}</span>`;
  }).join("");
  const setChips = (values, prefix) => (values || []).map((value) =>
    `<span class="be1096-word ${prefix || ""}">${value === "" ? "ε" : escapeHtml(value)}</span>`).join("");
  const frames = (view.frames || []).map((frame, index) => {
    const active = index === view.frames.length - 1 ? "active" : "";
    const kind = frame.kind === "union" ? "∪ UNION" : "× CONCAT";
    return `<div class="be1096-frame ${frame.kind} ${active}"><small>#${frame.depth} · ${kind}</small><div>${setChips(frame.result)}</div><span>${frame.size} ${frame.size === 1 ? "word" : "words"}</span></div>`;
  }).join("");
  const opSymbol = view.operation === "union" ? "∪" : view.operation === "concat" ? "×" : "→ sort";
  const operation = view.operation ? `<section class="be1096-operation ${view.operation}">
    <div><small>${vi ? "TRÁI" : "LEFT"}</small><div>${setChips(view.left, "left") || "—"}</div></div>
    <b>${opSymbol}</b>
    <div><small>${vi ? "PHẢI" : "RIGHT"}</small><div>${setChips(view.right, "right") || "—"}</div></div>
    <b>=</b>
    <div><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><div>${setChips(view.produced, "result") || "—"}</div></div>
  </section>` : `<div class="be1096-empty">${vi ? "Đọc biểu thức để tạo phép hợp hoặc phép nối tiếp theo." : "Read the expression to form the next union or concatenation."}</div>`;
  const answer = view.answer ? `<section class="be1096-answer"><header><strong>${vi ? "KẾT QUẢ ĐÃ SẮP XẾP" : "SORTED RESULT"}</strong><span>${view.answerSize} ${vi ? "từ khác nhau" : "distinct words"}</span></header><div>${setChips(view.answer, "answer")}</div></section>` : "";
  $("treeView").innerHTML = `<section class="be1096-viz" aria-label="Brace Expansion II parser visualization">
    <header class="be1096-heading"><div><small>RECURSIVE-DESCENT PARSER · #1096</small><strong>${vi ? "KHAI TRIỂN BIỂU THỨC NGOẶC II" : "BRACE EXPANSION II"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="be1096-rule">${vi ? "Dấu phẩy = HỢP (∪) · đứng liền nhau = NỐI bằng tích Descartes (×) · ngoặc = gọi đệ quy" : "Comma = UNION (∪) · adjacency = CONCATENATE by Cartesian product (×) · braces = recurse"}</div>
    <section class="be1096-panel"><header><strong>${vi ? "CON TRỎ TRÊN BIỂU THỨC" : "EXPRESSION POINTER"}</strong><span>i = ${view.index}/${(view.expression || "").length}</span></header><div class="be1096-expression">${chars}</div></section>
    <div class="be1096-main"><section class="be1096-panel"><header><strong>${vi ? "NGĂN XẾP LỜI GỌI" : "CALL STACK"}</strong><span>${(view.frames || []).length} ${vi ? "khung" : "frames"}</span></header><div class="be1096-frames">${frames || `<span class="be1096-empty">${vi ? "Đã rời mọi lời gọi đệ quy." : "All recursive calls have returned."}</span>`}</div></section><section class="be1096-panel"><header><strong>${vi ? "PHÉP TOÁN TẬP HỢP" : "SET OPERATION"}</strong><span>${view.operation || "—"}</span></header>${operation}</section></div>
    ${answer}
    ${view.shortened ? `<div class="be1096-short">${vi ? "Bảng chỉ hiện tối đa 12 từ mỗi tập; thuật toán vẫn tính toàn bộ kết quả." : "The board previews at most 12 words per set; the algorithm still computes the full result."}</div>` : ""}
    <footer class="be1096-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderWeakCharacters1996View(step) {
  const view = step.weakCharacters1996View || {};
  const vi = lang === "vi";
  const current = view.current;
  const witness = view.witness;
  const sorted = view.sorted || [];
  const statusText = (status) => status === "weak" ? (vi ? "Yếu" : "Weak")
    : status === "safe" ? (vi ? "Không yếu" : "Not weak") : (vi ? "Chưa xét" : "Pending");
  const original = (view.original || []).map((item) => `<span class="wc1996-original">#${item.id} <strong>${item.attack}/${item.defense}</strong></span>`).join("");
  const sortedCards = sorted.map((item) => {
    const classes = ["wc1996-character", item.status || "pending",
      current?.id === item.id ? "current" : "", witness?.id === item.id ? "witness" : "",
      current && item.attack === current.attack ? "same-attack" : ""].filter(Boolean).join(" ");
    return `<div class="${classes}"><small>${item.index + 1} · #${item.id}</small><strong>A ${item.attack} · D ${item.defense}</strong><span>${statusText(item.status)}</span></div>`;
  }).join("");
  const attacks = sorted.map((item) => item.attack);
  const defenses = sorted.map((item) => item.defense);
  const minAttack = Math.min(...attacks);
  const maxAttack = Math.max(...attacks);
  const minDefense = Math.min(...defenses);
  const maxDefense = Math.max(...defenses);
  const px = (attack) => 39 + (attack - minAttack) / (maxAttack - minAttack || 1) * 258;
  const py = (defense) => 195 - (defense - minDefense) / (maxDefense - minDefense || 1) * 166;
  const plotPoints = sorted.map((item) => {
    const classes = ["wc1996-point", item.status || "pending",
      current?.id === item.id ? "current" : "", witness?.id === item.id ? "witness" : ""].filter(Boolean).join(" ");
    return `<g class="${classes}"><circle cx="${px(item.attack)}" cy="${py(item.defense)}" r="7"/><text x="${px(item.attack) + 9}" y="${py(item.defense) - 7}">#${item.id}</text><title>#${item.id}: attack ${item.attack}, defense ${item.defense}</title></g>`;
  }).join("");
  const threshold = current ? `<rect class="wc1996-quadrant" x="${px(current.attack)}" y="22" width="${Math.max(0, 304 - px(current.attack))}" height="${Math.max(0, py(current.defense) - 22)}"/><line class="wc1996-threshold" x1="${px(current.attack)}" y1="22" x2="${px(current.attack)}" y2="198"/><line class="wc1996-threshold" x1="36" y1="${py(current.defense)}" x2="304" y2="${py(current.defense)}"/>` : "";
  const plot = sorted.length ? `<svg class="wc1996-plot" viewBox="0 0 330 230" role="img" aria-label="Attack and defense plot"><line class="wc1996-axis" x1="36" y1="198" x2="306" y2="198"/><line class="wc1996-axis" x1="36" y1="198" x2="36" y2="18"/>${threshold}${plotPoints}<text class="wc1996-axis-label" x="270" y="219">attack →</text><text class="wc1996-axis-label" x="2" y="17">defense ↑</text><text class="wc1996-axis-label" x="36" y="211">${minAttack}</text><text class="wc1996-axis-label" x="287" y="211">${maxAttack}</text><text class="wc1996-axis-label" x="10" y="195">${minDefense}</text><text class="wc1996-axis-label" x="10" y="31">${maxDefense}</text></svg>` : `<span class="wc1996-empty">${vi ? "Sắp xếp để hiện đồ thị" : "Sort to show the plot"}</span>`;
  const attackGreater = current && witness ? witness.attack > current.attack : null;
  const defenseGreater = current && witness ? witness.defense > current.defense : null;
  const comparison = current ? `<div class="wc1996-comparison"><div><small>${vi ? "NHÂN VẬT ĐANG XÉT" : "CURRENT CHARACTER"}</small><strong>#${current.id} · A ${current.attack} / D ${current.defense}</strong></div><div><small>${vi ? "NGƯỜI GIỮ MAX DEFENSE TRƯỚC BƯỚC NÀY" : "PREVIOUS MAX-DEFENSE OWNER"}</small><strong>${witness ? `#${witness.id} · A ${witness.attack} / D ${witness.defense}` : "—"}</strong></div><div class="${attackGreater ? "pass" : "fail"}"><small>ATTACK</small><strong>${witness ? `${witness.attack} > ${current.attack}` : "—"} ${attackGreater === null ? "" : attackGreater ? "✓" : "✗"}</strong></div><div class="${defenseGreater ? "pass" : "fail"}"><small>DEFENSE</small><strong>${witness ? `${witness.defense} > ${current.defense}` : "—"} ${defenseGreater === null ? "" : defenseGreater ? "✓" : "✗"}</strong></div></div>` : `<span class="wc1996-empty">${vi ? "Chọn nhân vật tiếp theo để so sánh hai chỉ số." : "Visit a character to compare both stats."}</span>`;
  const verdict = view.isWeak === null ? "—" : view.isWeak ? (vi ? "YẾU" : "WEAK") : (vi ? "KHÔNG YẾU" : "NOT WEAK");
  $("treeView").innerHTML = `<section class="wc1996-viz" aria-label="Weak Characters visualization">
    <header class="wc1996-heading"><div><small>SORT + MAX DEFENSE · #1996</small><strong>${vi ? "NHÂN VẬT YẾU TRONG GAME" : "WEAK CHARACTERS IN THE GAME"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="wc1996-rule">${vi ? "Yếu ⇔ tồn tại người có attack LỚN HƠN và defense LỚN HƠN. Cùng attack không tính." : "Weak ⇔ another character has strictly higher attack AND strictly higher defense. Equal attack does not count."}</div>
    <div class="wc1996-stats"><div><small>${vi ? "ĐÃ XÉT" : "PROCESSED"}</small><strong>${view.processed}/${view.total}</strong></div><div><small>MAX DEFENSE</small><strong>${view.maxDefense ?? "—"}</strong></div><div><small>${vi ? "SỐ NHÂN VẬT YẾU" : "WEAK COUNT"}</small><strong>${view.weak ?? "—"}</strong></div><div><small>${vi ? "KẾT LUẬN HIỆN TẠI" : "CURRENT VERDICT"}</small><strong>${verdict}</strong></div></div>
    <section class="wc1996-panel"><header><strong>${vi ? "BAN ĐẦU" : "ORIGINAL ORDER"}</strong></header><div class="wc1996-originals">${original}</div></section>
    <section class="wc1996-panel"><header><strong>${vi ? "SAU SORT: ATTACK ↓ · DEFENSE ↑ KHI ATTACK BẰNG" : "SORTED: ATTACK ↓ · DEFENSE ↑ ON TIES"}</strong><span>${vi ? "Quét từ trái sang phải →" : "Scan left to right →"}</span></header><div class="wc1996-sorted">${sortedCards || `<span class="wc1996-empty">${vi ? "Chưa sort" : "Not sorted yet"}</span>`}</div></section>
    <div class="wc1996-main"><section class="wc1996-panel"><header><strong>${vi ? "ĐỒ THỊ ATTACK / DEFENSE" : "ATTACK / DEFENSE PLOT"}</strong></header>${plot}<p>${vi ? "Vùng xanh phía trên bên phải ô hiện tại: mạnh hơn ở cả hai chỉ số. Đường nét đứt là ranh giới, không tính bằng nhau." : "Green upper-right area: strictly higher in both stats. Dashed borders are excluded."}</p></section><section class="wc1996-panel"><header><strong>${vi ? "SO SÁNH TỪNG CHỈ SỐ" : "COMPARE BOTH STATS"}</strong></header>${comparison}<p>${vi ? "Người cùng attack được xếp defense tăng dần nên không thể tạo kết luận yếu sai." : "Equal-attack characters are sorted by ascending defense, preventing false weak results."}</p></section></div>
    ${view.shortened ? `<div class="wc1996-short">${vi ? "Chỉ minh họa 14 nhân vật đầu sau sort; kết quả vẫn tính toàn bộ input." : "Only the first 14 sorted characters are traced; the answer still uses the full input."}</div>` : ""}
    <footer class="wc1996-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderLongestLine562View(step) {
  const view = step.longestLine562View || {};
  const vi = lang === "vi";
  const directions = [
    { key: "H", name: vi ? "Ngang →" : "Horizontal →", dr: 0, dc: 1 },
    { key: "V", name: vi ? "Dọc ↓" : "Vertical ↓", dr: 1, dc: 0 },
    { key: "D", name: vi ? "Chéo ↘" : "Diagonal ↘", dr: 1, dc: 1 },
    { key: "A", name: vi ? "Chéo ↙" : "Anti-diagonal ↙", dr: 1, dc: -1 },
  ];
  const current = view.current || [];
  const bestLine = view.bestLine;
  const bestCells = new Set();
  if (bestLine) {
    const direction = directions[bestLine.direction];
    for (let offset = 0; offset < bestLine.length; offset++) {
      bestCells.add(`${bestLine.end[0] - offset * direction.dr},${bestLine.end[1] - offset * direction.dc}`);
    }
  }
  const runCells = new Set();
  if (current.length === 2 && view.activeDirection !== null) {
    const direction = directions[view.activeDirection];
    for (let offset = 0; offset < (view.lengths?.[view.activeDirection] || 0); offset++) {
      runCells.add(`${current[0] - offset * direction.dr},${current[1] - offset * direction.dc}`);
    }
  }
  const matrix = (view.matrix || []).map((row, r) => `<div class="ll562-row">${row.map((value, c) => {
    const key = `${r},${c}`;
    const counts = view.dp?.[r]?.[c] || [0, 0, 0, 0];
    const classes = ["ll562-cell", value === 0 ? "zero" : "one",
      bestCells.has(key) ? "best" : "", runCells.has(key) ? "run" : "",
      view.source?.row === r && view.source?.col === c ? "source" : "",
      current[0] === r && current[1] === c ? "current" : ""].filter(Boolean).join(" ");
    return `<div class="${classes}"><small>${r},${c}</small><strong>${value}</strong><span>${counts.join("/")}</span></div>`;
  }).join("")}</div>`).join("");
  const cards = directions.map((direction, index) => `<div class="ll562-direction ${view.activeDirection === index ? "active" : ""} ${bestLine?.direction === index ? "winner" : ""}"><small>${direction.key} · ${direction.name}</small><strong>${view.lengths?.[index] ?? 0}</strong></div>`).join("");
  const predecessor = view.activeDirection === null ? "—" : view.source
    ? `(${view.source.row}, ${view.source.col}) = ${view.source.value}`
    : (vi ? "Ngoài biên → 0" : "Outside grid → 0");
  const bestText = bestLine
    ? `${directions[bestLine.direction].name} · (${bestLine.end.join(", ")})`
    : (vi ? "Chưa có dãy 1" : "No line of ones yet");
  $("treeView").innerHTML = `<section class="ll562-viz" aria-label="Longest Line of Consecutive One in Matrix visualization">
    <header class="ll562-heading"><div><small>4-DIRECTION DP · #562</small><strong>${vi ? "DÃY SỐ 1 DÀI NHẤT" : "LONGEST LINE OF ONES"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ll562-rule">${vi ? "Mỗi ô 1 nối dài dãy từ ô liền trước theo từng hướng. Ô 0 đặt cả bốn độ dài về 0." : "Each one extends the previous cell in each direction. A zero keeps all four lengths at zero."}</div>
    <div class="ll562-stats"><div><small>${vi ? "Ô ĐANG XÉT" : "CURRENT CELL"}</small><strong>${current.length ? `(${current.join(", ")})` : "—"}</strong></div><div><small>${vi ? "Ô ĐỨNG TRƯỚC" : "PREDECESSOR"}</small><strong>${predecessor}</strong></div><div><small>${vi ? "KỶ LỤC" : "BEST"}</small><strong>${view.best ?? 0}</strong></div></div>
    <section class="ll562-panel"><header><strong>${vi ? "MA TRẬN · MỖI Ô HIỆN H/V/D/A" : "MATRIX · EACH CELL SHOWS H/V/D/A"}</strong><span>${view.rows} × ${view.cols}</span></header><div class="ll562-scroll">${matrix}</div><p>${vi ? "Viền tím: ô hiện tại · Viền lam: ô đứng trước · Vàng: dãy đang tính · Xanh: dãy tốt nhất" : "Purple: current · Blue: predecessor · Amber: current run · Green: best run"}</p></section>
    <div class="ll562-directions">${cards}</div>
    <section class="ll562-panel ll562-best"><header><strong>${vi ? "DÃY TỐT NHẤT" : "BEST LINE"}</strong><span>${bestText}</span></header><strong>${view.best ?? 0}</strong></section>
    ${view.shortened ? `<div class="ll562-short">${vi ? "Trace và lưới xem trước được rút gọn; đáp án vẫn tính toàn bộ ma trận." : "The trace and grid preview are shortened; the answer still uses the whole matrix."}</div>` : ""}
    <footer class="ll562-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderNodeSequence2242View(step) {
  const view = step.nodeSequence2242View || {};
  const vi = lang === "vi";
  const show = (value) => value === null || value === undefined ? "—" : escapeHtml(value);
  const scoreById = new Map((view.nodes || []).map((node) => [node.id, node.score]));
  const middle = view.middle || [];
  const candidate = view.candidate || [];
  const bestPath = view.bestPath || [];
  let previous = -1;
  const nodes = (view.nodes || []).map((node) => {
    const gap = node.id > previous + 1 ? `<span class="ns2242-gap">…</span>` : "";
    previous = node.id;
    const cls = node.id === view.helperNode ? "helper" : candidate.includes(node.id) ? "candidate" : middle.includes(node.id) ? "middle" : "";
    return `${gap}<div class="ns2242-node ${cls}"><small>#${show(node.id)}</small><strong>${show(node.score)}</strong><span>top: ${(node.top || []).length ? node.top.map(show).join(", ") : "—"}</span></div>`;
  }).join("");
  previous = -1;
  const edges = (view.edges || []).map((edge) => {
    const gap = edge.index > previous + 1 ? `<span class="ns2242-gap">…</span>` : "";
    previous = edge.index;
    return `${gap}<span class="ns2242-edge ${edge.index === view.edgeIndex ? "active" : ""}">#${show(edge.index)} ${show(edge.u)}—${show(edge.v)}</span>`;
  }).join("");
  const neighborList = (list, opposite, selected) => list.length
    ? list.map((item) => `<span class="ns2242-neighbor ${item.id === selected ? "selected" : ""} ${item.id === opposite ? "blocked" : ""}">#${show(item.id)} · ${show(item.score)}</span>`).join("")
    : `<span class="ns2242-empty">${vi ? "Không có hàng xóm" : "No neighbors"}</span>`;
  const path = (items) => items.length === 4
    ? items.map((id, index) => `<div class="ns2242-path-node"><small>${["a", "b", "c", "d"][index]} · #${show(id)}</small><strong>${show(scoreById.get(id))}</strong></div>`).join('<span class="ns2242-arrow">→</span>')
    : `<span class="ns2242-empty">${vi ? "Chọn cạnh giữa và hai đầu ngoài" : "Choose a middle edge and two outer nodes"}</span>`;
  const resultText = bestPath.length ? bestPath.join(" → ") : "—";
  const emptyBest = step.final
    ? (vi ? "Không tồn tại đường đi 4 đỉnh" : "No four-node path exists")
    : (vi ? "Chưa có dãy hợp lệ" : "No valid path yet");
  $("treeView").innerHTML = `<section class="ns2242-viz" aria-label="Maximum Score of a Node Sequence visualization">
    <header class="ns2242-heading"><div><small>TOP-3 NEIGHBORS · #2242</small><strong>${vi ? "ĐƯỜNG ĐI 4 ĐỈNH ĐIỂM CAO NHẤT" : "BEST FOUR-NODE PATH"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ns2242-rule">${vi ? "Cố định cạnh giữa b—c. Chỉ cần thử 3 hàng xóm điểm cao nhất ở mỗi đầu, rồi loại dãy có đỉnh trùng." : "Fix a middle edge b—c. Try only each endpoint's top three neighbors, rejecting repeated nodes."}</div>
    <div class="ns2242-stats"><div><small>${vi ? "CẠNH GIỮA" : "MIDDLE EDGE"}</small><strong>${middle.length ? `${show(middle[0])}—${show(middle[1])}` : "—"}</strong></div><div><small>${vi ? "ĐANG THỬ" : "CANDIDATE"}</small><strong>${candidate.length ? candidate.map(show).join("→") : "—"}</strong></div><div><small>${vi ? "ĐIỂM DÃY" : "PATH SCORE"}</small><strong>${show(view.total)}</strong></div><div><small>BEST</small><strong>${show(view.answer)}</strong></div></div>
    ${view.helperNode !== null && view.helperNode !== undefined ? `<section class="ns2242-panel ns2242-build"><header><strong>${vi ? "ĐANG XÂY TOP-3" : "BUILDING TOP-3"}</strong><span>node = ${show(view.helperNode)} · neighbor = ${show(view.helperNeighbor)}</span></header><div><span>top[${show(view.helperNode)}]</span><strong>[${(view.helperTop || []).map(show).join(", ")}]</strong><span>${view.trimCondition === null ? "" : view.trimCondition ? (vi ? "Cần bỏ phần tử cuối" : "Pop the last entry") : (vi ? "Không cần bỏ" : "No pop needed")}</span></div></section>` : ""}
    <section class="ns2242-panel"><header><strong>${vi ? "ĐỈNH · ĐIỂM · TOP HÀNG XÓM" : "NODES · SCORES · TOP NEIGHBORS"}</strong><span>${show(view.n)} ${vi ? "đỉnh" : "nodes"}</span></header><div class="ns2242-scroll"><div class="ns2242-nodes">${nodes}</div></div></section>
    <section class="ns2242-panel"><header><strong>${vi ? "CÁC CẠNH" : "EDGES"}</strong><span>${show(view.edgeCount)} ${vi ? "cạnh" : "edges"}</span></header><div class="ns2242-scroll"><div class="ns2242-edges">${edges || `<span class="ns2242-empty">${vi ? "Không có cạnh" : "No edges"}</span>`}</div></div></section>
    <div class="ns2242-lists"><section class="ns2242-panel"><header><strong>top[${show(middle[0])}] → a</strong></header><div class="ns2242-neighbors">${neighborList(view.leftTop || [], middle[1], view.selectedA)}</div></section><section class="ns2242-panel"><header><strong>top[${show(middle[1])}] → d</strong></header><div class="ns2242-neighbors">${neighborList(view.rightTop || [], middle[0], view.selectedD)}</div></section></div>
    <section class="ns2242-panel"><header><strong>${vi ? "DÃY ĐANG XÉT" : "CURRENT FOUR-NODE PATH"}</strong><span>${view.valid === false ? (vi ? `Bị loại: ${show(view.reason)}` : `Rejected: ${show(view.reason)}`) : view.valid === true ? (vi ? "Hợp lệ" : "Valid") : ""}</span></header><div class="ns2242-path ${view.valid === false ? "rejected" : view.valid === true ? "valid" : ""}">${path(candidate)}</div>${candidate.length ? `<p>${vi ? "Bốn ID phải khác nhau và mỗi cặp kề nhau phải có cạnh." : "All four IDs must differ and every adjacent pair must share an edge."}</p>` : ""}</section>
    <section class="ns2242-panel ns2242-best"><header><strong>${vi ? "DÃY TỐT NHẤT" : "BEST PATH"}</strong><span>${resultText}</span></header><div class="ns2242-path">${bestPath.length ? path(bestPath) : `<span class="ns2242-empty">${emptyBest}</span>`}</div><strong>${view.answer === -1 ? "−1" : show(view.answer)}</strong></section>
    ${view.shortened ? `<div class="ns2242-short">${vi ? "Trace được rút gọn; đáp án vẫn xét toàn bộ đồ thị." : "The trace is shortened; the answer still checks the full graph."}</div>` : ""}
    <footer class="ns2242-note">${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderSlidingFreqView(step) {
  const view = step.slidingFreqView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const left = Number.isInteger(view.left) ? view.left : -1;
  const right = Number.isInteger(view.right) ? view.right : -1;
  const windowSet = new Set(Array.isArray(view.window) ? view.window : []);
  const bestSet = new Set(Array.isArray(view.best) ? view.best : []);
  const freq = view.freq || {};
  const k = view.k;
  const mode = view.mode || "frequency";
  const isDistinctMode = mode === "distinct";
  const rowLabel = view.label || "nums";
  const activeValue = view.activeValue;
  const overLimit = !!view.overLimit;
  const vi = lang === "vi";

  const cells = nums.map((v, i) => {
    const names = i === left && i === right
      ? ["L/R"]
      : [
        ...(i === left ? ["L"] : []),
        ...(i === right ? ["R"] : []),
      ];
    const arrowsHtml = names.map((name) => {
      const cls = name === "R" ? "tp-ptr-b" : "tp-ptr-a";
      return `<div class="tp-pointer-arrow ${cls}"><span class="tp-pointer-name">${name}</span><span class="tp-pointer-caret">\u25BC</span></div>`;
    }).join("");
    const inWindow = windowSet.has(i);
    const inBest = bestSet.has(i);
    const isOffending = overLimit && v === activeValue && inWindow;
    const classes = [
      "sfw-cell",
      inWindow ? "sfw-cell-window" : "",
      inBest && !inWindow ? "sfw-cell-best" : "",
      isOffending ? "sfw-cell-over" : "",
    ].filter(Boolean).join(" ");
    return `<div class="sfw-cell-wrap">
      <div class="tp-pointer-stack">${arrowsHtml}</div>
      <div class="${classes}">
        <span class="tp-cell-idx">[${i}]</span>
        <strong>${escapeHtml(String(v))}</strong>
      </div>
    </div>`;
  }).join("");

  const freqEntries = Object.entries(freq).sort(([a], [b]) => String(a).localeCompare(String(b)));
  const freqHtml = freqEntries.length
    ? freqEntries.map(([val, count]) => {
        const isActive = String(val) === String(activeValue);
        const isOver = overLimit && isActive;
        const atK = !isDistinctMode && !isOver && Number(count) === Number(k) && isActive;
        const cls = isOver ? "sfw-freq-over" : atK ? "sfw-freq-atk" : "";
        return `<div class="sfw-freq-card ${cls}">
          <span class="sfw-freq-value">${escapeHtml(String(val))}</span>
          <span class="sfw-freq-count">${escapeHtml(String(count))}</span>
        </div>`;
      }).join("")
    : `<span class="sfw-freq-empty">${vi ? "(rỗng)" : "(empty)"}</span>`;

  const windowLen = right >= left && left >= 0 ? right - left + 1 : 0;
  const distinct = freqEntries.filter(([, count]) => Number(count) > 0).length;
  const statusText = view.done
    ? (vi ? `Cửa sổ tốt nhất: [${left}..${right}], độ dài = ${view.ans}` : `Best window: [${left}..${right}], length = ${view.ans}`)
    : overLimit
      ? isDistinctMode
        ? (vi ? `${distinct} ký tự distinct > ${k} → đang thu hẹp cửa sổ từ bên trái` : `${distinct} distinct characters > ${k} → shrinking the window from the left`)
        : (vi ? `freq[${activeValue}] vượt k=${k} → đang thu hẹp cửa sổ từ bên trái` : `freq[${activeValue}] exceeds k=${k} → shrinking window from the left`)
      : isDistinctMode
        ? (vi ? `Cửa sổ [${left}..${right}] có ${distinct}/${k} ký tự distinct, độ dài = ${windowLen}, ans = ${view.ans}` : `Window [${left}..${right}] has ${distinct}/${k} distinct characters, length = ${windowLen}, ans = ${view.ans}`)
        : (vi ? `Cửa sổ hiện tại [${left}..${right}] hợp lệ, độ dài = ${windowLen}, ans tốt nhất = ${view.ans}` : `Current window [${left}..${right}] is valid, length = ${windowLen}, best ans = ${view.ans}`);

  $("treeView").innerHTML = `
    <div class="sfw-viz">
      <div class="sfw-row">
        <span class="tp-row-label">${escapeHtml(rowLabel)}</span>
        <div class="tp-row-cells sfw-row-cells">${cells}</div>
      </div>
      <div class="sfw-freq-panel">
        <div class="sfw-freq-title">${isDistinctMode ? (vi ? `Bảng freq trong cửa sổ — tối đa ${k} ký tự distinct` : `Window freq table — at most ${k} distinct characters`) : (vi ? `Bảng đếm freq trong cửa sổ (k=${k})` : `freq table inside window (k=${k})`)}</div>
        <div class="sfw-freq-cards">${freqHtml}</div>
      </div>
      <div class="sfw-status ${overLimit ? "sfw-status-over" : view.done ? "sfw-status-done" : ""}">${statusText}</div>
      <div class="tp-legend">
        <span><i class="tp-legend-swatch tp-ptr-a"></i>L = left</span>
        <span><i class="tp-legend-swatch tp-ptr-b"></i>R = right</span>
        <span><i class="sfw-legend-swatch sfw-legend-best"></i>${vi ? "ô đã từng nằm trong cửa sổ tốt nhất" : "cell in best window so far"}</span>
        <span><i class="sfw-legend-swatch sfw-legend-over"></i>${isDistinctMode ? (vi ? "ký tự mới làm vượt giới hạn distinct" : "new character exceeding the distinct limit") : (vi ? "phần tử vượt k" : "element exceeding k")}</span>
      </div>
    </div>`;
}

function renderBalanced1234View(step) {
  const view = step.balanced1234View || {};
  const chars = Array.isArray(view.chars) ? view.chars : [];
  const alphabet = Array.isArray(view.alphabet) ? view.alphabet : ["Q", "W", "E", "R"];
  const windowSet = new Set(Array.isArray(view.windowIndices) ? view.windowIndices : []);
  const vi = lang === "vi";
  const event = String(view.event || "target");
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : "—";
  const phaseIndex = {
    target: 0,
    count: 0,
    "balanced-check": 0,
    "init-window": 1,
    inspect: 1,
    expand: 2,
    "invalid-check": 3,
    "valid-check": 3,
    "update-best": 4,
    "restore-left": 5,
    "move-left": 5,
    done: 6,
  }[event] ?? 0;
  const phaseLabels = vi
    ? ["Đếm toàn chuỗi", "Mở rộng right", "Chuyển vào window", "Kiểm tra outside", "Cập nhật best", "Thu hẹp left"]
    : ["Count string", "Expand right", "Move into window", "Check outside", "Update best", "Shrink left"];
  const phases = phaseLabels.map((label, index) => {
    const state = event === "done" || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const bestLeft = view.bestWindow?.left;
  const bestRight = view.bestWindow?.right;
  const cells = chars.map((char, index) => {
    const inWindow = windowSet.has(index);
    const inBest = Number.isInteger(bestLeft) && index >= bestLeft && index <= bestRight;
    const pointers = [index === view.left ? "L" : "", index === view.right ? "R" : ""].filter(Boolean).join("/");
    const classes = [
      "bal1234-cell",
      `char-${char.toLowerCase()}`,
      inWindow ? "replace" : "outside",
      inBest ? "best" : "",
      index === view.restoringIndex ? "restoring" : "",
      index === view.right ? "current" : "",
    ].filter(Boolean).join(" ");
    return `<div class="bal1234-cell-wrap"><div class="bal1234-pointer">${pointers ? `${pointers} ▼` : ""}</div><div class="${classes}"><small>[${index}]</small><strong>${char}</strong><em>${inWindow ? (vi ? "THAY" : "REPLACE") : "OUTSIDE"}</em></div></div>`;
  }).join("");

  const countCards = alphabet.map((char) => {
    const count = Number(view.outside?.[char] || 0);
    const initial = Number(view.initialCounts?.[char] || 0);
    const status = count > view.target ? "excess" : "safe";
    const statusText = status === "excess" ? (vi ? "CÒN DƯ" : "EXCESS") : (vi ? "ĐẠT" : "SAFE");
    return `<div class="bal1234-count ${status} char-${char.toLowerCase()}"><header><strong>${char}</strong><em>${statusText}</em></header><div><span>${count}</span><b>/ ${view.target}</b></div><footer>${vi ? "ban đầu" : "initial"} ${initial} · window ${view.windowCounts?.[char] || 0}</footer></div>`;
  }).join("");

  const conditions = alphabet.map((char) => {
    const count = Number(view.outside?.[char] || 0);
    const pass = count <= view.target;
    return `<span class="${pass ? "pass" : "fail"}"><b>${char}</b><code>${count} ≤ ${view.target}</code><em>${pass ? "✓" : "✕"}</em></span>`;
  }).join("");
  const needed = alphabet.map((char) => `${char}:${view.replacementNeeds?.[char] || 0}`).join(" · ");

  const eventLabels = {
    target: "TARGET",
    count: "COUNT",
    "balanced-check": vi ? "CÂN BẰNG?" : "BALANCED?",
    "init-window": "WINDOW",
    inspect: "READ RIGHT",
    expand: "OUTSIDE − 1",
    "invalid-check": vi ? "CHƯA HỢP LỆ" : "NOT VALID",
    "valid-check": vi ? "WINDOW HỢP LỆ" : "VALID WINDOW",
    "update-best": view.improved ? "NEW BEST" : "KEEP BEST",
    "restore-left": "OUTSIDE + 1",
    "move-left": "MOVE LEFT",
    done: "DONE",
  };
  const validClass = view.valid ? "valid" : "invalid";
  const candidateText = view.candidate
    ? `[${view.candidate.left}..${view.candidate.right}] · ${view.candidate.length}`
    : "—";
  const bestText = view.bestWindow
    ? `[${view.bestWindow.left}..${view.bestWindow.right}] · ${view.best}`
    : view.best === 0 ? "[] · 0" : `— · ${view.best}`;

  $("treeView").innerHTML = `<section class="bal1234-viz" role="img" aria-label="Replace the Substring for Balanced String visualization">
    <header><div><small>#1234 · SLIDING WINDOW</small><strong>${vi ? "THAY SUBSTRING ĐỂ CÂN BẰNG QWER" : "REPLACE A SUBSTRING TO BALANCE QWER"}</strong></div><span>${escapeHtml(eventLabels[event] || event)}</span></header>
    <section class="bal1234-rule"><b>${vi ? "Ý TƯỞNG QUAN TRỌNG" : "KEY IDEA"}</b><strong>WINDOW = ${vi ? "phần sẽ thay" : "replaceable"} · OUTSIDE = ${vi ? "phần giữ nguyên" : "kept"}</strong><span>${vi ? "Chỉ cần mọi outside count ≤ target. Phần còn thiếu sẽ được điền vào window." : "Only the outside counts must be ≤ target. Missing characters can be placed inside the window."}</span></section>
    <div class="bal1234-phases">${phases}</div>
    <section class="bal1234-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine}</small><b>${escapeHtml(eventLabels[event] || event)}</b><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="bal1234-string"><header><strong>s = ${escapeHtml(JSON.stringify(view.s || ""))}</strong><span>${vi ? "xanh = outside · tím = window sẽ thay · nét đứt = best" : "blue = outside · purple = replacement window · dashed = best"}</span></header><div class="bal1234-scroll"><div class="bal1234-cells">${cells}</div></div></section>
    <section class="bal1234-counts"><header><strong>${vi ? "BỘ ĐẾM BÊN NGOÀI WINDOW" : "COUNTS OUTSIDE THE WINDOW"}</strong><span>${vi ? `mỗi ký tự tối đa ${view.target}` : `each character at most ${view.target}`}</span></header><div>${countCards}</div></section>
    <section class="bal1234-check ${validClass}"><header><div><small>${vi ? "ĐIỀU KIỆN WINDOW" : "WINDOW CONDITION"}</small><strong>all(outside[ch] ≤ target)</strong></div><b>${view.valid ? (vi ? "HỢP LỆ ✓" : "VALID ✓") : (vi ? "MỞ RỘNG TIẾP" : "KEEP EXPANDING")}</b></header><div>${conditions}</div><footer><span>${vi ? "Nếu thay window này, cần điền" : "If this window is replaced, fill"}</span><strong>${escapeHtml(needed)}</strong></footer></section>
    <div class="bal1234-bottom"><section><small>${vi ? "CANDIDATE HIỆN TẠI" : "CURRENT CANDIDATE"}</small><strong>${candidateText}</strong><span>${view.improved ? (vi ? "ngắn hơn → lưu" : "shorter → save") : (vi ? "chưa cập nhật" : "not updated")}</span></section><section class="best"><small>${vi ? "WINDOW TỐT NHẤT" : "BEST WINDOW"}</small><strong>${bestText}</strong><span>${vi ? "độ dài nhỏ nhất" : "minimum length"}</span></section></div>
    <footer><span>${vi ? "ANSWER · độ dài substring cần thay" : "ANSWER · replacement substring length"}</span><strong>${view.final || view.best === 0 || view.bestWindow ? view.best : "—"}</strong></footer>
  </section>`;
}

function renderNice1248View(step) {
  const view = step.nice1248View || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const right = Number.isInteger(view.right) ? view.right : -1;
  const matchingPositions = new Set(Array.isArray(view.matchingPositions) ? view.matchingPositions : []);
  const newSubarrays = Array.isArray(view.newSubarrays) ? view.newSubarrays : [];
  const vi = lang === "vi";
  const event = String(view.event || "init-freq");
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : "—";
  const phaseIndex = {
    "init-freq": 0,
    "init-values": 0,
    inspect: 0,
    "update-prefix": 1,
    "find-need": 2,
    count: 3,
    store: 4,
    done: 5,
  }[event] ?? 0;
  const phaseLabels = vi
    ? ["Đổi lẻ/chẵn", "Cập nhật prefix", "Tìm need", "Cộng số match", "Lưu prefix"]
    : ["Read parity", "Update prefix", "Find need", "Count matches", "Store prefix"];
  const phases = phaseLabels.map((label, index) => {
    const state = event === "done" || index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const eventLabels = {
    "init-freq": vi ? "PREFIX RỖNG" : "EMPTY PREFIX",
    "init-values": vi ? "KHỞI TẠO" : "INITIALIZE",
    inspect: vi ? "ĐỌC PHẦN TỬ" : "READ VALUE",
    "update-prefix": vi ? "ĐẾM SỐ LẺ" : "COUNT ODDS",
    "find-need": vi ? "TÍNH NEED" : "COMPUTE NEED",
    count: vi ? "ĐẾM SUBARRAY MỚI" : "COUNT NEW SUBARRAYS",
    store: vi ? "LƯU PREFIX" : "STORE PREFIX",
    done: vi ? "HOÀN TẤT" : "COMPLETE",
  };

  const belongsToNew = (index) => newSubarrays.some((item) => index >= item.start && index <= item.end);
  const arrayCells = nums.map((value, index) => {
    const odd = Math.abs(Number(value)) % 2 === 1;
    const classes = [
      "nice1248-cell",
      odd ? "odd" : "even",
      index < right ? "processed" : "",
      index === right ? "current" : "",
      belongsToNew(index) ? "new-range" : "",
    ].filter(Boolean).join(" ");
    return `<div class="nice1248-cell-wrap">
      <div class="nice1248-pointer">${index === right ? "right ▼" : ""}</div>
      <div class="${classes}"><small>[${index}]</small><strong>${escapeHtml(String(value))}</strong><em>${odd ? (vi ? "LẺ +1" : "ODD +1") : (vi ? "CHẴN +0" : "EVEN +0")}</em></div>
    </div>`;
  }).join("");

  const prefixHistory = Array.isArray(view.prefixHistory) ? view.prefixHistory.map((item) => ({ ...item })) : [];
  if (right >= 0 && ["update-prefix", "find-need", "count"].includes(event) && !prefixHistory.some((item) => item.boundary === right)) {
    prefixHistory.push({ boundary: right, value: view.prefix, temporary: true });
  }
  const prefixCells = prefixHistory.map((item) => {
    const isCurrent = item.boundary === right;
    const isMatch = matchingPositions.has(item.boundary) && ["find-need", "count", "store"].includes(event);
    const classes = ["nice1248-prefix", isCurrent ? "current" : "", isMatch ? "match" : "", item.temporary ? "temporary" : ""].filter(Boolean).join(" ");
    const boundaryLabel = item.boundary === -1 ? (vi ? "trước mảng" : "before array") : `after [${item.boundary}]`;
    return `<div class="${classes}"><small>P[${item.boundary}]</small><strong>${item.value}</strong><span>${escapeHtml(boundaryLabel)}</span>${isMatch ? `<em>need ✓</em>` : ""}</div>`;
  }).join("");

  const freqEntries = Object.entries(view.freq || {}).sort(([a], [b]) => Number(a) - Number(b));
  const freqCards = freqEntries.map(([prefixValue, count]) => {
    const isNeed = Number(prefixValue) === Number(view.need) && view.need !== null;
    const isCurrent = Number(prefixValue) === Number(view.prefix) && ["store", "done"].includes(event);
    const positions = Array.isArray(view.positions?.[prefixValue]) ? view.positions[prefixValue] : [];
    return `<div class="nice1248-freq${isNeed ? " need" : ""}${isCurrent ? " current" : ""}">
      <small>prefix</small><strong>${escapeHtml(prefixValue)}</strong><span>count = ${escapeHtml(String(count))}</span><em>${positions.map((index) => index === -1 ? "P[-1]" : `P[${index}]`).join(", ")}</em>
    </div>`;
  }).join("");

  const needReady = Number.isInteger(view.need);
  const found = Array.isArray(view.matchingPositions) ? view.matchingPositions.length : 0;
  const lookup = needReady
    ? `<div class="nice1248-equation"><span><small>${vi ? "prefix hiện tại" : "current prefix"}</small><strong>${view.prefix}</strong></span><b>−</b><span><small>k</small><strong>${view.k}</strong></span><b>=</b><span class="need"><small>need</small><strong>${view.need}</strong></span></div>
       <div class="nice1248-count"><span>prefix_freq[${view.need}]</span><strong>${found}</strong><b>ans: ${view.ans - (event === "count" ? view.added : 0)} + ${event === "count" ? view.added : 0} = ${view.ans}</b></div>`
    : `<div class="nice1248-wait"><strong>${vi ? "Chưa tính need" : "Need is not computed yet"}</strong><span>${vi ? "Đọc phần tử rồi cập nhật số lượng số lẻ trước." : "Read the value and update the odd count first."}</span></div>`;

  const newCards = newSubarrays.length
    ? newSubarrays.map((item) => `<div class="nice1248-subarray"><small>prefix P[${item.prefixEnd}] = ${view.need}</small><strong>[${item.start}..${item.end}]</strong><span>[${item.values.map((value) => escapeHtml(String(value))).join(", ")}]</span><em>${vi ? `đúng ${view.k} số lẻ` : `exactly ${view.k} odds`}</em></div>`).join("")
    : `<div class="nice1248-empty">${event === "done"
      ? (vi ? `Đã đếm xong ${view.ans} nice subarray.` : `Finished counting ${view.ans} nice subarray(s).`)
      : needReady
        ? (vi ? `Không có prefix cũ bằng ${view.need} ở bước này.` : `No earlier prefix equals ${view.need} at this step.`)
        : (vi ? "Các nice subarray mới sẽ hiện ở đây." : "New nice subarrays will appear here.")}</div>`;

  const coreRule = vi
    ? "Hai prefix chênh nhau k số lẻ ⇒ đoạn nằm giữa là một nice subarray."
    : "Two prefixes differing by k odds ⇒ the segment between them is a nice subarray.";
  const totalFound = Array.isArray(view.niceSubarrays) ? view.niceSubarrays.length : view.ans;

  $("treeView").innerHTML = `<section class="nice1248-viz" role="img" aria-label="Count Number of Nice Subarrays visualization">
    <header><div><small>#1248 · PREFIX COUNT</small><strong>${vi ? "ĐẾM SUBARRAY CÓ ĐÚNG K SỐ LẺ" : "COUNT SUBARRAYS WITH EXACTLY K ODDS"}</strong></div><span>${eventLabels[event] || event}</span></header>
    <section class="nice1248-rule"><b>${vi ? "QUY TẮC CỐT LÕI" : "CORE RULE"}</b><strong>prefix[right] − prefix[left − 1] = k</strong><span>${escapeHtml(coreRule)}</span></section>
    <div class="nice1248-phases">${phases}</div>
    <section class="nice1248-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="nice1248-array"><header><strong>NUMS → ODD CONTRIBUTION</strong><span>${vi ? "lẻ = +1 · chẵn = +0" : "odd = +1 · even = +0"}</span></header><div class="nice1248-scroll"><div class="nice1248-cells">${arrayCells}</div></div></section>
    <section class="nice1248-prefixes"><header><strong>${vi ? "CÁC MỐC PREFIX" : "PREFIX CHECKPOINTS"}</strong><span>${vi ? "P[i] = số lượng số lẻ trong nums[0..i]" : "P[i] = odd count in nums[0..i]"}</span></header><div class="nice1248-scroll"><div class="nice1248-prefix-row">${prefixCells}</div></div></section>
    <div class="nice1248-main"><section class="nice1248-lookup"><header><strong>${vi ? "TÌM PREFIX CẦN THIẾT" : "LOOK UP THE NEEDED PREFIX"}</strong><span>need = prefix − k</span></header>${lookup}</section><section class="nice1248-ledger"><header><strong>PREFIX_FREQ</strong><span>${vi ? "giá trị prefix → số lần đã lưu" : "prefix value → stored count"}</span></header><div>${freqCards}</div></section></div>
    <section class="nice1248-results"><header><strong>${vi ? "NICE SUBARRAY MỚI Ở RIGHT NÀY" : "NEW NICE SUBARRAYS AT THIS RIGHT"}</strong><span>${newSubarrays.length} ${vi ? "đoạn mới" : "new"}</span></header><div>${newCards}</div></section>
    <footer><span><small>${vi ? "đã liệt kê" : "listed so far"}</small><strong>${totalFound}</strong></span><b>${vi ? "TỔNG ĐÁP ÁN" : "RUNNING ANSWER"}</b><strong>${view.ans ?? 0}</strong></footer>
  </section>`;
}

function renderExactK992View(step) {
  const view = step.exactK992View || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const right = Number.isInteger(view.right) ? view.right : -1;
  const leftK = Number.isInteger(view.leftK) ? view.leftK : 0;
  const leftKm1 = Number.isInteger(view.leftKm1) ? view.leftKm1 : 0;
  const exactStarts = Array.isArray(view.exactStarts) ? view.exactStarts : [];
  const vi = lang === "vi";
  const phaseLabel = {
    helpers: vi ? "Hai helper add / remove" : "The add / remove helpers",
    "init-freq": vi ? "Khởi tạo hai map freq" : "Initialize two freq maps",
    "init-pointers": vi ? "Khởi tạo hai left pointer" : "Initialize two left pointers",
    right: vi ? "Đọc nums[right]" : "Read nums[right]",
    "add-k-call": vi ? "Gọi add cho atMost(K)" : "Call add for atMost(K)",
    "add-k": vi ? "Cập nhật freq atMost(K)" : "Update atMost(K) freq",
    "add-km1-call": vi ? "Gọi add cho atMost(K-1)" : "Call add for atMost(K-1)",
    "add-km1": vi ? "Cập nhật freq atMost(K-1)" : "Update atMost(K-1) freq",
    "shrink-k-check": vi ? "atMost(K) vượt giới hạn" : "atMost(K) exceeds its limit",
    "remove-k-call": vi ? "Gọi remove cho atMost(K)" : "Call remove for atMost(K)",
    "remove-k": vi ? "Cập nhật freq atMost(K)" : "Update atMost(K) freq",
    "remove-k-check": vi ? "Kiểm tra count bằng 0" : "Check whether count is zero",
    "remove-k-delete": vi ? "Xóa key count bằng 0" : "Delete the zero-count key",
    "move-k": vi ? "Dịch left_k" : "Move left_k",
    "shrink-km1-check": vi ? "atMost(K-1) vượt giới hạn" : "atMost(K-1) exceeds its limit",
    "remove-km1-call": vi ? "Gọi remove cho atMost(K-1)" : "Call remove for atMost(K-1)",
    "remove-km1": vi ? "Cập nhật freq atMost(K-1)" : "Update atMost(K-1) freq",
    "remove-km1-check": vi ? "Kiểm tra count bằng 0" : "Check whether count is zero",
    "remove-km1-delete": vi ? "Xóa key count bằng 0" : "Delete the zero-count key",
    "move-km1": vi ? "Dịch left_km1" : "Move left_km1",
    count: vi ? "Đếm subarray đúng K" : "Count exactly-K subarrays",
    done: vi ? "Hoàn tất" : "Complete",
  }[view.phase] || String(view.phase || "two windows");

  const windowRow = (name, limit, left, kind) => {
    const cells = nums.map((value, index) => {
      const inWindow = right >= 0 && index >= left && index <= right;
      const classes = [
        "exact992-cell",
        inWindow ? "inside" : "outside",
        index === left && inWindow ? "left" : "",
        index === right && right >= 0 ? "right" : "",
        index === view.removingIndex ? "removing" : "",
        index === right && value === view.activeValue ? "incoming" : "",
      ].filter(Boolean).join(" ");
      const pointers = `${index === left && inWindow ? `<span class="exact992-pointer">${name}</span>` : ""}${index === right && right >= 0 ? `<span class="exact992-pointer right">R</span>` : ""}`;
      return `<div class="exact992-cell-wrap"><div class="exact992-pointer-row">${pointers}</div><div class="${classes}"><small>[${index}]</small><strong>${escapeHtml(String(value))}</strong></div></div>`;
    }).join("");
    return `<section class="exact992-window ${kind}"><header><strong>${name}: atMost(${limit})</strong><span>left = ${left} · distinct = ${kind === "k" ? view.distinctK : view.distinctKm1}</span></header><div class="exact992-cells" style="--exact992-cols:${Math.max(nums.length, 1)}">${cells}</div></section>`;
  };

  const frequencyRows = (freq, kind) => {
    const entries = Object.entries(freq || {}).sort(([left], [rightValue]) => Number(left) - Number(rightValue));
    return entries.length
      ? entries.map(([value, count]) => `<span class="exact992-freq ${kind}${String(value) === String(view.activeValue) ? " active" : ""}"><small>${escapeHtml(value)}</small><strong>${escapeHtml(String(count))}</strong></span>`).join("")
      : `<span class="exact992-empty">{}</span>`;
  };
  const exactCards = right >= 0 && exactStarts.length
    ? exactStarts.map((start) => `<div class="exact992-subarray"><small>start ${start}</small><strong>[${escapeHtml(nums.slice(start, right + 1).join(", "))}]</strong><span>[${start}..${right}]</span></div>`).join("")
    : `<div class="exact992-empty">${vi ? "Chưa có start nào tạo đúng K distinct." : "No start currently gives exactly K distinct values."}</div>`;
  const currentContribution = right >= 0 ? leftKm1 - leftK : 0;
  const reason = view.phase === "count"
    ? (vi ? `Các start từ ${leftK} đến ${leftKm1 - 1} là các subarray mới có exactly ${view.k} distinct.` : `Starts ${leftK} through ${leftKm1 - 1} are the new subarrays with exactly ${view.k} distinct values.`)
    : view.phase && view.phase.includes("km1")
      ? (vi ? "Hàng vàng phải giữ tối đa K-1 distinct nên left_km1 thường đi xa hơn." : "The gold row must keep at most K-1 distinct, so left_km1 often moves farther right.")
      : (vi ? "Hàng xanh giữ tối đa K distinct. Khoảng giữa hai left pointer chính là các start đúng K." : "The blue row keeps at most K distinct. The gap between the two left pointers is exactly-K starts.");

  $("treeView").innerHTML = `
    <div class="exact992-viz">
      <header><strong>EXACTLY K DISTINCT = atMost(K) - atMost(K-1)</strong><span>${escapeHtml(phaseLabel)}</span></header>
      <div class="exact992-rule"><span>valid starts at R</span><strong>[left_k .. left_km1 - 1]</strong><b>${leftKm1} - ${leftK} = ${Math.max(0, currentContribution)}</b></div>
      <div class="exact992-windows">${windowRow("Lk", view.k, leftK, "k")}${windowRow("Lk-1", Math.max(0, (view.k ?? 0) - 1), leftKm1, "km1")}</div>
      <div class="exact992-lower">
        <section class="exact992-panel"><header><strong>FREQ atMost(K)</strong><span>${view.distinctK ?? 0} distinct</span></header><div class="exact992-freqs">${frequencyRows(view.freqK, "k")}</div></section>
        <section class="exact992-panel"><header><strong>FREQ atMost(K-1)</strong><span>${view.distinctKm1 ?? 0} distinct</span></header><div class="exact992-freqs">${frequencyRows(view.freqKm1, "km1")}</div></section>
      </div>
      <section class="exact992-results"><header><strong>${vi ? "SUBARRAY MOI, K DISTINCT" : "NEW EXACT-K SUBARRAYS"}</strong><span>right = ${right >= 0 ? right : "-"}</span></header><div class="exact992-subarrays">${exactCards}</div></section>
      <footer><span><small>${vi ? "hanh dong" : "action"}</small><strong>${escapeHtml(reason)}</strong></span><span><small>ans</small><strong>${view.ans ?? 0}</strong></span></footer>
    </div>`;
}

function renderSmallHashView(step) {
  const reverse = step.reverse344View || null;
  const view = step.smallHashView || null;
  const vi = lang === "vi";
  const cellRow = (values, options = {}) => {
    const activeIndex = Number.isInteger(options.activeIndex) ? options.activeIndex : -1;
    const pointerLabels = options.pointerLabels || {};
    const marks = new Set(options.marks || []);
    return `<div class="smallhash-cells">${values.map((value, index) => {
      const labels = pointerLabels[index] || [];
      const classes = ["smallhash-cell", index === activeIndex ? "active" : "", marks.has(index) ? "mark" : ""].filter(Boolean).join(" ");
      return `<div class="${classes}"><small>[${index}]</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(labels.join(" / ") || " ")}</em></div>`;
    }).join("")}</div>`;
  };

  if (reverse) {
    const chars = Array.isArray(reverse.chars) ? reverse.chars : [];
    const left = Number.isInteger(reverse.left) ? reverse.left : -1;
    const right = Number.isInteger(reverse.right) ? reverse.right : -1;
    const swapped = Array.isArray(reverse.swapped) ? reverse.swapped : [];
    const pointers = {};
    if (left >= 0 && left < chars.length) pointers[left] = ["L"];
    if (right >= 0 && right < chars.length) pointers[right] = [...(pointers[right] || []), "R"];
    const summary = reverse.phase === "done"
      ? (vi ? "Hai con trỏ đã gặp nhau; mảng đã được đảo ngược tại chỗ." : "The pointers met; the array is reversed in place.")
      : (vi ? "Đổi hai ký tự ở L và R, rồi đưa cả hai con trỏ vào trong." : "Swap the L and R characters, then move both pointers inward.");
    $("treeView").innerHTML = `
      <section class="smallhash-viz reverse" role="img" aria-label="Reverse String visualization">
        <header><strong>REVERSE STRING · TWO POINTERS</strong><span>${escapeHtml(String(reverse.phase || "setup"))}</span></header>
        <section class="smallhash-row"><header><strong>CHARACTER ARRAY</strong><span>L = ${left} · R = ${right}</span></header>${cellRow(chars, { pointerLabels: pointers, marks: swapped })}</section>
        <div class="smallhash-rule"><small>${vi ? "QUY TẮC" : "RULE"}</small><strong>while left &lt; right</strong><span>${escapeHtml(summary)}</span></div>
        <footer><span><small>${vi ? "mảng hiện tại" : "current array"}</small><strong>[${escapeHtml(chars.join(", "))}]</strong></span><span class="answer"><small>${vi ? "kết quả" : "result"}</small><strong>${reverse.phase === "done" ? escapeHtml(chars.join("")) : "…"}</strong></span></footer>
      </section>`;
    return;
  }

  if (!view) return;
  const isFirstUnique = view.kind === "first-unique";
  const isMulti = view.kind === "multiset-intersection";
  const source = isFirstUnique ? (Array.isArray(view.chars) ? view.chars : []) : (Array.isArray(view.nums1) ? view.nums1 : []);
  const scan = isFirstUnique ? source : (Array.isArray(view.nums2) ? view.nums2 : []);
  const activeIndex = Number.isInteger(view.activeIndex) ? view.activeIndex : -1;
  const activeValue = view.activeValue;
  const counts = Object.entries(view.counts || {}).sort(([left], [right]) => String(left).localeCompare(String(right), undefined, { numeric: true }));
  const result = Array.isArray(view.result) ? view.result : [];
  const setValues = Array.isArray(view.seen) ? view.seen : [];
  const sourceName = isFirstUnique ? "s" : "nums1";
  const scanName = isFirstUnique ? "s" : "nums2";
  const cellsForScan = cellRow(scan, {
    activeIndex,
    marks: view.found || view.taken || view.unique ? [activeIndex] : [],
  });
  const mapContent = isFirstUnique || isMulti
    ? (counts.length
      ? `<div class="smallhash-map">${counts.map(([value, count]) => `<span class="${String(value) === String(activeValue) ? "active" : ""}"><small>${escapeHtml(String(value))}</small><strong>${escapeHtml(String(count))}</strong></span>`).join("")}</div>`
      : `<div class="smallhash-empty">{}</div>`)
    : (setValues.length
      ? `<div class="smallhash-map">${setValues.map((value) => `<span class="${String(value) === String(activeValue) ? "active" : ""}"><small>value</small><strong>${escapeHtml(String(value))}</strong></span>`).join("")}</div>`
      : `<div class="smallhash-empty">{}</div>`);
  const headline = isFirstUnique
    ? "FIRST UNIQUE CHARACTER"
    : isMulti ? "INTERSECTION II · FREQUENCY MAP" : "UNIQUE INTERSECTION · SET";
  const mapTitle = isFirstUnique ? "COUNTER(s)" : isMulti ? "COUNT REMAINING FROM nums1" : "SEEN = set(nums1)";
  const resultTitle = isFirstUnique ? (vi ? "CHỈ SỐ ĐẦU TIÊN DUY NHẤT" : "FIRST UNIQUE INDEX") : "RESULT";
  const actionText = isFirstUnique
    ? (view.unique
      ? (vi ? `'${activeValue}' có count = 1 nên đây là ký tự unique đầu tiên.` : `'${activeValue}' has count = 1, so it is the first unique character.`)
      : (vi ? "Duyệt trái sang phải cho đến khi gặp count = 1." : "Scan left to right until a count of 1 is found."))
    : isMulti
      ? (view.taken
        ? (vi ? `Giữ ${activeValue} rồi giảm count để không dùng quá số bản sao trong nums1.` : `Keep ${activeValue}, then decrement its count so no extra nums1 copy is used.`)
        : (vi ? "Chỉ thêm khi count của giá trị hiện tại còn dương." : "Add only when the current value's count is still positive."))
      : (view.found
        ? (vi ? `${activeValue} xuất hiện ở cả hai mảng; result set tự loại duplicate.` : `${activeValue} appears in both arrays; the result set removes duplicates.`)
        : (vi ? "Chỉ thêm giá trị nums2 nếu nó nằm trong seen." : "Add a nums2 value only when it belongs to seen."));
  const answer = isFirstUnique ? (view.answer == null ? "—" : String(view.answer)) : `[${result.join(", ")}]`;

  $("treeView").innerHTML = `
    <section class="smallhash-viz" role="img" aria-label="${escapeHtml(headline)} visualization">
      <header><strong>${headline}</strong><span>${escapeHtml(String(view.phase || "setup"))}</span></header>
      <div class="smallhash-inputs">
        <section class="smallhash-row"><header><strong>${sourceName}</strong><span>${source.length} values</span></header>${cellRow(source)}</section>
        ${isFirstUnique ? "" : `<section class="smallhash-row scan"><header><strong>${scanName}</strong><span>${activeIndex >= 0 ? `active = ${activeIndex}` : "waiting"}</span>${cellsForScan}</section>`}
      </div>
      ${isFirstUnique ? `<section class="smallhash-row scan"><header><strong>${scanName} · left to right</strong><span>${activeIndex >= 0 ? `i = ${activeIndex}` : "waiting"}</span>${cellsForScan}</section>` : ""}
      <div class="smallhash-lower">
        <section class="smallhash-panel"><header><strong>${mapTitle}</strong><span>${isMulti ? "value → remaining" : isFirstUnique ? "char → total" : "membership"}</span>${mapContent}</section>
        <section class="smallhash-panel result"><header><strong>${resultTitle}</strong><span>${isFirstUnique ? "index" : `${result.length} value(s)`}</span><div class="smallhash-result">${escapeHtml(answer)}</div></section>
      </div>
      <footer><small>${vi ? "HÀNH ĐỘNG HIỆN TẠI" : "CURRENT ACTION"}</small><strong>${escapeHtml(actionText)}</strong></footer>
    </section>`;
}

function renderSequenceTraceView(step) {
  const view = step.sequenceTraceView || {};
  const vi = lang === "vi";
  const kind = view.kind;
  const cells = (values, options = {}) => {
    const classesFor = (index) => {
      const classes = ["seqtrace-cell"];
      if (Number.isInteger(options.active) && index === options.active) classes.push("active");
      if (options.matched && options.matched.has(index)) classes.push("matched");
      if (Number.isInteger(options.left) && Number.isInteger(options.right)) {
        classes.push(index >= options.left && index <= options.right ? "inside" : "outside");
      }
      if (Number.isInteger(options.mid) && (index === options.mid || index === options.pairEnd)) classes.push("mid");
      if (options.mismatch && options.mismatch.has(index)) classes.push("mismatch");
      return classes.join(" ");
    };
    const columns = Math.max(1, Math.min(values.length, 10));
    return `<div class="seqtrace-cells" style="--seqtrace-cols:${columns}">${values.map((value, index) => {
      const labels = [];
      if (index === options.left) labels.push("L");
      if (index === options.right) labels.push("R");
      if (index === options.mid) labels.push("M");
      if (index === options.pairEnd) labels.push("M+1");
      if (options.pointerIndex === index) labels.push("i");
      if (options.mismatch && options.mismatch.has(index)) labels.push("X");
      return `<div class="${classesFor(index)}"><small>[${index}]</small><strong>${escapeHtml(String(value))}</strong><em>${escapeHtml(labels.join(" / ") || " ")}</em></div>`;
    }).join("")}</div>`;
  };

  if (kind === "subsequence") {
    const s = Array.isArray(view.s) ? view.s : [];
    const t = Array.isArray(view.t) ? view.t : [];
    const nextIndex = Number.isInteger(view.nextIndex) ? view.nextIndex : 0;
    const scanIndex = Number.isInteger(view.scanIndex) ? view.scanIndex : -1;
    const matched = new Set(Array.isArray(view.matched) ? view.matched : []);
    const waiting = nextIndex < s.length ? s[nextIndex] : "done";
    const result = view.answer == null ? "—" : view.answer ? "TRUE" : "FALSE";
    const message = view.phase === "done"
      ? (view.answer
        ? (vi ? "Mọi ký tự của s đã được đánh dấu theo thứ tự trong t." : "Every s character is marked in order inside t.")
        : (vi ? `Còn thiếu '${s.slice(nextIndex).join("")}'.` : `Still missing '${s.slice(nextIndex).join("")}'.`))
      : (vi ? `Đang chờ tìm s[${nextIndex}] = '${waiting}' trong t.` : `Looking for s[${nextIndex}] = '${waiting}' inside t.`);
    $("treeView").innerHTML = `
      <section class="seqtrace-viz" role="img" aria-label="Is Subsequence visualization">
        <header><strong>IS SUBSEQUENCE · TWO POINTERS</strong><span>${escapeHtml(String(view.phase || "setup"))}</span></header>
        <section class="seqtrace-row"><header><strong>s · chars to match</strong><span>i = ${nextIndex}</span>${cells(s, { pointerIndex: nextIndex < s.length ? nextIndex : -1 })}</section>
        <section class="seqtrace-row target"><header><strong>t · scanned left to right</strong><span>j = ${scanIndex >= 0 ? scanIndex : "—"}</span>${cells(t, { active: scanIndex, matched })}</section>
        <section class="seqtrace-rule"><small>${vi ? "BẤT BIẾN" : "INVARIANT"}</small><strong>matched positions in t spell s[0..i-1]</strong><span>${escapeHtml(message)}</span></section>
        <footer><span><small>${vi ? "ký tự cần tìm" : "next needed"}</small><strong>${escapeHtml(String(waiting))}</strong></span><span class="answer"><small>${vi ? "kết quả" : "result"}</small><strong>${result}</strong></span></footer>
      </section>`;
    return;
  }

  if (kind === "palindrome-delete") {
    const chars = Array.isArray(view.chars) ? view.chars : [];
    const left = Number.isInteger(view.left) ? view.left : -1;
    const right = Number.isInteger(view.right) ? view.right : -1;
    const mismatch = Number.isInteger(view.mismatch) && view.mismatch >= 0
      ? new Set([view.mismatch, right])
      : new Set();
    const answer = view.answer == null ? "—" : view.answer ? "TRUE" : "FALSE";
    const hasChoice = typeof view.skipLeft === "boolean" || typeof view.skipRight === "boolean";
    const choiceText = hasChoice
      ? (vi
        ? `Bỏ s[L] = '${chars[left]}' → ${view.skipLeft ? "palindrome" : "không"}; bỏ s[R] = '${chars[right]}' → ${view.skipRight ? "palindrome" : "không"}.`
        : `Skip s[L] = '${chars[left]}' → ${view.skipLeft ? "palindrome" : "no"}; skip s[R] = '${chars[right]}' → ${view.skipRight ? "palindrome" : "no"}.`)
      : (vi ? "Hai đầu khớp thì tiếp tục thu hẹp vào giữa." : "When both ends match, keep shrinking toward the middle.");
    const phaseText = {
      setup: vi ? "Khởi tạo hai đầu" : "Initialize endpoints",
      loop: vi ? "Kiểm tra cặp đối xứng" : "Check mirrored pair",
      match: vi ? "Cặp ký tự khớp" : "Matching pair",
      advance: vi ? "Di chuyển vào trong" : "Move inward",
      mismatch: vi ? "Gặp mismatch" : "Mismatch found",
      decision: vi ? "Thử bỏ một ký tự" : "Try one deletion",
      done: vi ? "Đã là palindrome" : "Already a palindrome",
    }[view.phase] || String(view.phase || "two pointers");
    $("treeView").innerHTML = `
      <section class="seqtrace-viz" role="img" aria-label="Valid Palindrome II visualization">
        <header><strong>VALID PALINDROME II · TWO POINTERS</strong><span>${escapeHtml(phaseText)}</span></header>
        <section class="seqtrace-row target"><header><strong>s · mirrored comparison</strong><span>L = ${left >= 0 ? left : "—"} · R = ${right >= 0 ? right : "—"}</span>${cells(chars, { left, right, mismatch })}</section>
        <section class="seqtrace-rule"><small>${vi ? "QUY TẮC" : "RULE"}</small><strong>first mismatch → skip left OR skip right</strong><span>${escapeHtml(choiceText)}</span></section>
        <footer><span><small>${vi ? "quyết định" : "decision"}</small><strong>${escapeHtml(hasChoice ? choiceText : (vi ? "Chưa cần xóa ký tự." : "No deletion needed yet."))}</strong></span><span class="answer"><small>${vi ? "kết quả" : "result"}</small><strong>${answer}</strong></span></footer>
      </section>`;
    return;
  }

  if (kind === "binary-target") {
    const nums = Array.isArray(view.nums) ? view.nums : [];
    const left = Number.isInteger(view.left) ? view.left : -1;
    const right = Number.isInteger(view.right) ? view.right : -1;
    const mid = Number.isInteger(view.mid) ? view.mid : -1;
    const target = view.target;
    const answer = view.answer == null ? "—" : String(view.answer);
    const comparison = {
      equal: vi ? "nums[M] bằng target: tìm thấy." : "nums[M] equals target: found.",
      "too-small": vi ? "nums[M] nhỏ hơn target: bỏ nửa trái." : "nums[M] is smaller than target: discard the left half.",
      "too-large": vi ? "nums[M] lớn hơn target: bỏ nửa phải." : "nums[M] is larger than target: discard the right half.",
    }[view.comparison] || (vi ? "So sánh target với phần tử giữa để chọn nửa còn lại." : "Compare target with the middle value to choose the remaining half.");
    const phaseText = {
      setup: vi ? "Khởi tạo vùng" : "Initialize range",
      loop: vi ? "Vùng còn ứng viên" : "Candidates remain",
      mid: vi ? "Tính phần tử giữa" : "Compute midpoint",
      compare: vi ? "So sánh với target" : "Compare target",
      "move-right": vi ? "Giữ nửa phải" : "Keep right half",
      "move-left": vi ? "Giữ nửa trái" : "Keep left half",
      found: vi ? "Đã tìm thấy" : "Found",
      done: vi ? "Hoàn tất" : "Complete",
      "not-found": vi ? "Không tìm thấy" : "Not found",
    }[view.phase] || "binary search";
    $("treeView").innerHTML = `
      <section class="seqtrace-viz" role="img" aria-label="Binary Search visualization">
        <header><strong>BINARY SEARCH · TARGET ${escapeHtml(String(target))}</strong><span>${escapeHtml(phaseText)}</span></header>
        <section class="seqtrace-row binary"><header><strong>SORTED NUMS</strong><span>[L..R] = [${left}..${right}]</span>${cells(nums, { left, right, mid })}</section>
        <section class="seqtrace-rule"><small>${vi ? "SO SÁNH" : "COMPARISON"}</small><strong>${escapeHtml(comparison)}</strong><span>${mid >= 0 ? `nums[${mid}] = ${nums[mid]} · target = ${target}` : (vi ? "Chưa chọn mid." : "No midpoint selected yet.")}</span></section>
        <footer><span><small>${vi ? "vùng còn lại" : "remaining range"}</small><strong>[${left}..${right}]</strong></span><span class="answer"><small>${vi ? "chỉ số" : "index"}</small><strong>${answer}</strong></span></footer>
      </section>`;
    return;
  }

  const nums = Array.isArray(view.nums) ? view.nums : [];
  const left = Number.isInteger(view.left) ? view.left : 0;
  const right = Number.isInteger(view.right) ? view.right : nums.length - 1;
  const mid = Number.isInteger(view.mid) ? view.mid : -1;
  const pairEnd = Number.isInteger(view.pairEnd) ? view.pairEnd : -1;
  const answer = view.answer == null ? "—" : String(view.answer);
  const phaseText = {
    setup: vi ? "Khởi tạo vùng tìm kiếm" : "Initialize search range",
    loop: vi ? "Kiểm tra vòng lặp" : "Check loop",
    mid: vi ? "Tính mid" : "Compute mid",
    "align-check": vi ? "Kiểm tra parity của mid" : "Check mid parity",
    align: vi ? "Căn mid vào đầu cặp" : "Align mid to pair start",
    compare: vi ? "So sánh cặp" : "Compare pair",
    "move-left": vi ? "Bỏ nửa trái" : "Discard left half",
    "move-right": vi ? "Giữ nửa trái" : "Keep left half",
    done: vi ? "Đã tìm được phần tử đơn" : "Single value found",
  }[view.phase] || String(view.phase || "binary search");
  const pairText = mid >= 0 && pairEnd >= 0 && pairEnd < nums.length
    ? `nums[${mid}] = ${nums[mid]} · nums[${pairEnd}] = ${nums[pairEnd]}`
    : "align mid to an even pair start";
  $("treeView").innerHTML = `
    <section class="seqtrace-viz" role="img" aria-label="Single Element in a Sorted Array visualization">
      <header><strong>SINGLE ELEMENT · BINARY SEARCH</strong><span>${escapeHtml(phaseText)}</span></header>
      <section class="seqtrace-row binary"><header><strong>SORTED PAIRS</strong><span>[L..R] = [${left}..${right}]</span>${cells(nums, { left, right, mid, pairEnd })}</section>
      <section class="seqtrace-rule"><small>${vi ? "CẶP ĐANG KIỂM TRA" : "PAIR UNDER TEST"}</small><strong>${escapeHtml(pairText)}</strong><span>${vi ? "Cặp nguyên ở chỉ số chẵn nghĩa là phần tử đơn nằm về bên phải; cặp lệch nghĩa là nó nằm ở bên trái hoặc tại mid." : "An intact pair at an even index puts the single value to the right; a broken pair puts it at or to the left of mid."}</span></section>
      <footer><span><small>${vi ? "vùng còn lại" : "remaining range"}</small><strong>[${left}..${right}]</strong></span><span class="answer"><small>${vi ? "kết quả" : "result"}</small><strong>${answer}</strong></span></footer>
    </section>`;
}

function renderTaskSchedulerView(step) {
  const view = step.taskSchedulerView || {};
  const vi = lang === "vi";
  const counts = Object.entries(view.counts || {}).sort(([a], [b]) => a.localeCompare(b));
  const answer = view.answer == null ? "—" : String(view.answer);
  const maxFreq = view.maxFreq == null ? "—" : view.maxFreq;
  const maxCount = view.maxCount == null ? "—" : view.maxCount;
  const frame = view.frame == null ? "—" : view.frame;
  const taskCount = Array.isArray(view.tasks) ? view.tasks.length : 0;
  const slots = view.frame == null
    ? ""
    : Array.from({ length: Math.min(Number(view.frame), 24) }, (_, index) => `<div class="seqtrace-cell${index >= taskCount ? " outside" : ""}"><small>slot ${index + 1}</small><strong>${index < taskCount ? "task" : "idle"}</strong><em>${index < taskCount ? "filled" : "cooldown"}</em></div>`).join("");
  const phaseText = {
    count: vi ? "Đếm task" : "Count tasks",
    frequency: vi ? "Bảng tần suất" : "Frequency table",
    "max-frequency": vi ? "Tần suất lớn nhất" : "Maximum frequency",
    "tie-count": vi ? "Đếm task đồng hạng" : "Count tied tasks",
    frame: vi ? "Khung cooldown" : "Cooldown frame",
    done: vi ? "Thời gian tối thiểu" : "Minimum time",
  }[view.phase] || String(view.phase || "setup");
  const freqCells = counts.length
    ? counts.map(([task, count]) => `<div class="seqtrace-cell${count === view.maxFreq ? " matched" : ""}"><small>task</small><strong>${escapeHtml(task)}</strong><em>freq = ${count}</em></div>`).join("")
    : `<div class="seqtrace-cell"><small>freq</small><strong>—</strong><em>counting</em></div>`;
  $("treeView").innerHTML = `
    <section class="seqtrace-viz" role="img" aria-label="Task Scheduler frequency visualization">
      <header><strong>TASK SCHEDULER · FREQUENCY FRAME</strong><span>${escapeHtml(phaseText)}</span></header>
      <section class="seqtrace-row target"><header><strong>FREQUENCY TABLE</strong><span>n = ${view.n ?? 0}</span><div class="seqtrace-cells" style="--seqtrace-cols:${Math.max(1, Math.min(counts.length, 8))}">${freqCells}</div></section>
      <section class="seqtrace-row binary"><header><strong>MINIMUM COOLDOWN FRAME</strong><span>(max_freq - 1) × (n + 1) + max_count</span><div class="seqtrace-cells" style="--seqtrace-cols:${Math.max(1, Math.min(Number(view.frame) || 1, 10))}">${slots || `<div class="seqtrace-cell"><small>frame</small><strong>—</strong><em>waiting</em></div>`}</div></section>
      <section class="seqtrace-rule"><small>${vi ? "CÔNG THỨC" : "FORMULA"}</small><strong>max(total tasks, frame)</strong><span>max_freq = ${maxFreq} · max_count = ${maxCount} · frame = ${frame}</span></section>
      <footer><span><small>${vi ? "số task" : "task count"}</small><strong>${taskCount}</strong></span><span class="answer"><small>${vi ? "thời gian" : "time"}</small><strong>${answer}</strong></span></footer>
    </section>`;
}

function renderHappyNumberView(step) {
  const view = step.happyNumberView || {};
  const vi = lang === "vi";
  const slowPath = Array.isArray(view.slowPath) ? view.slowPath : [];
  const fastPath = Array.isArray(view.fastPath) ? view.fastPath : [];
  const transform = view.transform || null;
  const terminal = view.phase === "reached-one" || view.phase === "cycle" || view.phase === "done";
  const metInCycle = terminal && view.slow === view.fast && view.fast !== 1;

  const phaseLabel = {
    helper: vi ? "Cách tính số kế tiếp" : "How to compute the next value",
    "init-slow": vi ? "Đặt con trỏ slow" : "Place the slow pointer",
    "init-fast": vi ? "Đưa fast đi trước" : "Move fast one step ahead",
    condition: vi ? "Kiểm tra điều kiện vòng lặp" : "Check the loop condition",
    "slow-step": vi ? "Slow đi 1 bước" : "Slow moves 1 step",
    "fast-hop-one": vi ? "Fast đi bước thứ nhất" : "Fast takes its first hop",
    "fast-hop-two": vi ? "Fast đi bước thứ hai" : "Fast takes its second hop",
    "reached-one": vi ? "Đã chạm số 1" : "Reached number 1",
    cycle: vi ? "Đã phát hiện chu kỳ" : "Cycle detected",
    done: vi ? "Hoàn tất" : "Complete",
  }[view.phase] || String(view.phase || "setup");

  const lane = (name, path, kind, pointerValue) => {
    const visible = path.slice(-12);
    const skipped = path.length - visible.length;
    const valueCounts = path.reduce((counts, value) => {
      counts[value] = (counts[value] || 0) + 1;
      return counts;
    }, {});
    const nodes = visible.map((value, index) => {
      const isLast = index === visible.length - 1;
      const repeated = valueCounts[value] > 1;
      const classes = ["happy202-node", kind, isLast ? "current" : "", repeated ? "repeated" : "", metInCycle && isLast ? "meet" : "", value === 1 ? "one" : ""].filter(Boolean).join(" ");
      const position = skipped + index;
      return `${index ? `<span class="happy202-arrow" aria-hidden="true">→</span>` : ""}<span class="${classes}"><small>#${position}</small><strong>${escapeHtml(String(value))}</strong>${isLast ? `<em>${name}</em>` : ""}</span>`;
    }).join("");
    return `<section class="happy202-lane ${kind}"><header><strong>${name.toUpperCase()}</strong><span>${kind === "slow" ? (vi ? "1 bước / vòng" : "1 step / loop") : (vi ? "2 bước / vòng" : "2 steps / loop")}</span></header><div>${skipped > 0 ? `<span class="happy202-ellipsis">… ${skipped} ${vi ? "giá trị trước" : "earlier"}</span>` : ""}${nodes || `<span class="happy202-empty">${escapeHtml(String(pointerValue))}</span>`}</div></section>`;
  };

  const equation = transform
    ? `<section class="happy202-equation"><header><strong>nxt(${escapeHtml(String(transform.value))})</strong><span>${vi ? "tổng bình phương chữ số" : "sum of squared digits"}</span></header><div class="happy202-terms">${(transform.terms || []).map((term, index) => `${index ? `<span class="happy202-op">+</span>` : ""}<span class="happy202-term"><small>digit ${term.digit}</small><strong>${term.digit}²</strong><em>${term.square}</em></span>`).join("")}<span class="happy202-op equals">=</span><span class="happy202-sum"><small>${vi ? "số kế tiếp" : "next value"}</small><strong>${transform.sum}</strong></span></div></section>`
    : terminal
      ? `<section class="happy202-equation terminal ${view.answer === false || metInCycle ? "cycle" : "happy"}"><small>${vi ? "ĐIỀU KIỆN DỪNG" : "STOP CONDITION"}</small><strong>${view.fast === 1 ? "fast == 1" : `slow == fast == ${escapeHtml(String(view.fast))}`}</strong><span>${view.fast === 1 ? (vi ? "Dãy đã chạm 1 nên đây là Happy Number." : "The sequence reached 1, so this is a Happy Number.") : (vi ? "Hai con trỏ gặp nhau trong chu kỳ không chứa 1." : "The two pointers met inside a cycle that excludes 1.")}</span></section>`
    : `<section class="happy202-equation idle"><strong>${vi ? "Chọn một bước chuyển để xem phép tính chữ số." : "Select a transition to inspect its digit calculation."}</strong></section>`;

  const conditionText = view.phase === "cycle"
    ? (vi ? `slow = fast = ${view.fast}; gặp nhau trước khi chạm 1.` : `slow = fast = ${view.fast}; they met before reaching 1.`)
    : view.fast === 1
      ? (vi ? "fast = 1; dãy đã tới đích." : "fast = 1; the sequence reached its goal.")
      : (vi ? `fast != 1 và slow ${view.slow === view.fast ? "=" : "!="} fast.` : `fast != 1 and slow ${view.slow === view.fast ? "=" : "!="} fast.`);
  const outcome = view.answer == null ? "—" : view.answer ? "TRUE" : "FALSE";
  const outcomeClass = view.answer == null ? "pending" : view.answer ? "happy" : "cycle";

  $("treeView").innerHTML = `
    <section class="happy202-viz" role="img" aria-label="Happy Number Floyd cycle detection visualization">
      <header><div><small>LEETCODE 202</small><strong>HAPPY NUMBER · FLOYD CYCLE DETECTION</strong></div><span>${escapeHtml(phaseLabel)}</span></header>
      <div class="happy202-rule"><span><b>SLOW</b>${vi ? "đi 1 bước" : "moves 1 step"}</span><span><b>FAST</b>${vi ? "đi 2 bước" : "moves 2 steps"}</span><strong>${escapeHtml(conditionText)}</strong></div>
      <div class="happy202-lanes">${lane("slow", slowPath, "slow", view.slow)}${lane("fast", fastPath, "fast", view.fast)}</div>
      ${equation}
      <footer><span><small>${vi ? "vị trí hiện tại" : "current positions"}</small><strong>slow = ${escapeHtml(String(view.slow))} · fast = ${escapeHtml(String(view.fast))}</strong></span><span class="${outcomeClass}"><small>isHappy(${escapeHtml(String(view.original))})</small><strong>${outcome}</strong></span></footer>
    </section>`;
}

// ---- In-place array rotation visualization (LeetCode 189) ----
function renderRotateArray189View(step) {
  const v = step.rotateArray189View, vi = lang === "vi";
  const n = v.nums.length, effectiveK = v.requestedK % n;
  const split = n - effectiveK, done = Boolean(step.final), slicing = v.approach === 2;
  const labels = slicing
    ? (vi ? ["Chuẩn hóa k", "Tạo hai slice", "Gán nums[:]"] : ["Normalize k", "Build two slices", "Assign nums[:]"])
    : (vi ? ["Đảo toàn bộ", "Đảo k phần tử đầu", "Đảo phần còn lại"] : ["Reverse all", "Reverse first k", "Reverse the rest"]);
  const phases = labels.map((label, i) => `<span class="${v.phase === i + 1 && !done ? "active" : v.phase > i + 1 || done && effectiveK ? "complete" : ""}">${i + 1} · ${label}</span>`).join("");
  const values = list => `[${list.join(", ")}]`;
  const block = (name, list) => `<span class="ra189-original-${name.toLowerCase()}"><b>${name}</b><code>${escapeHtml(values(list))}</code></span>`;
  const cellWidth = Math.max(58, Math.max(...v.nums.map(value => String(value).length)) * 9 + 20);
  const cells = v.nums.map((value, i) => {
    const group = v.ids[i] < split ? "A" : "B";
    const inRange = v.range && i >= v.range[0] && i <= v.range[1];
    const lo = i === v.lo, hi = i === v.hi;
    const pointer = lo && hi ? "lo = hi" : lo ? "lo" : hi ? "hi" : "";
    const active = (lo || hi) && v.lo < v.hi;
    const label = `nums[${i}] = ${value}, ${group}, ${vi ? "từ vị trí" : "from index"} ${v.ids[i]}${pointer ? `, ${pointer}` : ""}`;
    return `<div class="ra189-cell group-${group.toLowerCase()}${inRange ? " in-range" : ""}${active ? " pointer" : ""}${done ? " done" : ""}" role="listitem" aria-label="${escapeHtml(label)}">
      <small>[${i}]</small><strong>${escapeHtml(value)}</strong><span>${group} · #${v.ids[i]}</span><em>${pointer || "&nbsp;"}</em>
    </div>`;
  }).join("");
  let action = `k = ${v.requestedK} % ${n} = ${effectiveK}`;
  let detail = vi ? "Mỗi vòng đủ n bước giữ nguyên mảng." : "Every full turn of n steps leaves the array unchanged.";
  if (v.range) {
    action = `reverse(${v.range[0]}, ${v.range[1]})`;
    detail = vi ? "Khung nhạt đánh dấu đoạn đang đảo; lo và hi đi vào giữa." : "Shaded cells mark the reversal range; lo and hi move inward.";
  }
  if (v.event === "check") {
    action = `${v.lo} < ${v.hi} → ${v.lo < v.hi ? "True" : "False"}`;
    detail = v.lo < v.hi ? (vi ? "Sẵn sàng hoán đổi cặp con trỏ." : "Ready to swap the pointer pair.") : (vi ? "Con trỏ đã gặp hoặc vượt nhau → dừng đảo." : "Pointers meet or cross → stop reversing.");
  } else if (v.event === "swap") {
    action = `nums[${v.lo}] ↔ nums[${v.hi}]`;
    detail = `${v.before[0]}, ${v.before[1]} → ${v.nums[v.lo]}, ${v.nums[v.hi]}`;
  } else if (v.event === "move") {
    action = `lo = ${v.lo} · hi = ${v.hi}`;
    detail = vi ? "Thu hẹp đoạn chưa đảo từ cả hai phía." : "Shrink the unreversed range from both ends.";
  } else if (v.event === "reversed") {
    detail = vi ? "Đoạn này đã đảo xong." : "This range is now reversed.";
  } else if (v.event === "slice-left") {
    action = `nums[-k:] → ${values(v.leftSlice)}`;
    detail = effectiveK ? (vi ? "Lấy suffix gồm k phần tử cuối." : "Take the suffix containing the last k elements.") : (vi ? "-0 bằng 0 nên lấy toàn bộ nums." : "-0 equals 0, so this takes all of nums.");
  } else if (v.event === "slice-right") {
    action = `nums[:-k] → ${values(v.rightSlice)}`;
    detail = effectiveK ? (vi ? "Lấy prefix đứng sau suffix trong kết quả." : "Take the prefix that follows the suffix in the result.") : (vi ? "Slice đến -0 là rỗng." : "A slice ending at -0 is empty.");
  } else if (v.event === "assigned") {
    action = "nums[:] = nums[-k:] + nums[:-k]";
    detail = vi ? "Sửa đúng list nums ban đầu; biểu thức bên phải dùng O(n) bộ nhớ tạm." : "Mutate the original nums list; the right-hand expression uses O(n) temporary space.";
  } else if (done) {
    action = effectiveK ? "A + B → B + A" : "k % n = 0";
    detail = effectiveK ? (vi ? "Xong: nums đã được sửa tại chỗ." : "Done: nums has been modified in place.") : (vi ? "Không đổi; không cần hoán đổi." : "Unchanged; no swaps are needed.");
  }
  const slices = slicing ? `<div class="ra189-slices">
    <span><small>nums[-k:]</small><code>${v.leftSlice ? escapeHtml(values(v.leftSlice)) : "—"}</code></span>
    <b>+</b>
    <span><small>nums[:-k]</small><code>${v.rightSlice ? escapeHtml(values(v.rightSlice)) : "—"}</code></span>
    <b>→ nums[:]</b>
  </div>` : "";
  $("treeView").innerHTML = `<section class="ra189-viz" aria-label="${slicing ? (vi ? "Xoay mảng bằng slicing" : "Rotate array with slicing") : (vi ? "Xoay mảng bằng ba lần đảo" : "Rotate array with three reversals")}">
    <header class="ra189-heading"><strong>${slicing ? (vi ? "Cách 2 · Slicing" : "Approach 2 · Slicing") : (vi ? "Cách 1 · Đảo 3 lần" : "Approach 1 · Three reversals")}</strong><span>${vi ? "Xoay phải" : "Rotate right"} ${effectiveK} · k: ${v.requestedK} % ${n} = ${effectiveK}</span></header>
    <div class="ra189-original"><span>${vi ? "Ban đầu" : "Original"}</span>${block("A", v.original.slice(0, split))}${block("B", v.original.slice(split))}</div>
    <div class="ra189-phases">${phases}</div>
    ${slices}
    <div class="ra189-array-heading"><strong>nums${done ? (vi ? " · kết quả" : " · result") : ""}</strong><span>${v.range ? `[${v.range[0]}, ${v.range[1]}]` : "A + B → B + A"}</span></div>
    <div class="ra189-array" role="list" aria-label="nums" style="--ra189-cell-width:${cellWidth}px">${cells}</div>
    <div class="ra189-action" aria-live="polite"><strong>${escapeHtml(action)}</strong><span>${escapeHtml(detail)}</span></div>
    <div class="ra189-legend"><span class="group-a">A · ${vi ? "nhóm đầu" : "original prefix"}</span><span class="group-b">B · ${vi ? "k phần tử cuối" : "last k elements"}</span><span>${vi ? "# = chỉ số ban đầu" : "# = original index"}</span></div>
  </section>`;
}

// ---- Rotated-array binary search visualization (LeetCode 33) ----
function renderRotatedSearchView(step) {
  const view = step.rotatedSearchView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const left = Number.isInteger(view.left) ? view.left : -1;
  const right = Number.isInteger(view.right) ? view.right : -1;
  const mid = Number.isInteger(view.mid) ? view.mid : -1;
  const eliminated = new Set(Array.isArray(view.eliminated) ? view.eliminated : []);
  const comparison = pick(view.comparison) || "";
  const vi = lang === "vi";
  const minValue = nums.length ? Math.min(...nums) : 0;
  const maxValue = nums.length ? Math.max(...nums) : 0;

  function columnHeight(value) {
    if (maxValue === minValue) return 64;
    return 44 + Math.round(((value - minValue) / (maxValue - minValue)) * 42);
  }

  function pointerLabels(index) {
    const labels = [];
    if (index === left) labels.push("L");
    if (index === mid) labels.push("M");
    if (index === right) labels.push("R");
    return labels;
  }

  function isInSortedHalf(index) {
    if (mid < 0) return false;
    if (view.sortedHalf === "left") return index >= left && index <= mid;
    if (view.sortedHalf === "right") return index >= mid && index <= right;
    return false;
  }

  const cells = nums.map((value, index) => {
    const pointers = pointerLabels(index);
    const active = index >= left && index <= right;
    const found = view.phase === "found" && index === mid;
    const classes = [
      "rotated-cell",
      active ? "active" : "discarded",
      eliminated.has(index) ? "just-eliminated" : "",
      isInSortedHalf(index) ? "sorted-half" : "",
      view.phase === "narrow" && active ? "kept" : "",
      index === mid && view.phase !== "found" ? "mid" : "",
      found ? "found" : "",
    ].filter(Boolean).join(" ");
    const pointerHtml = pointers.length
      ? pointers.map((label) => `<span class="rotated-pointer pointer-${label.toLowerCase()}">${label}<i></i></span>`).join("")
      : `<span class="rotated-pointer-spacer"></span>`;

    return `<div class="rotated-cell-wrap">
      <div class="rotated-pointers">${pointerHtml}</div>
      <div class="${classes}" style="--rotated-height: ${columnHeight(value)}px">
        <strong>${escapeHtml(String(value))}</strong>
        <span>[${index}]</span>
      </div>
    </div>`;
  }).join("");

  const stateLabel = ({
    range: vi ? "Vùng đang tìm" : "Search range",
    mid: vi ? "Kiểm tra điểm giữa" : "Check midpoint",
    sorted: vi ? "Xác định nửa tăng dần" : "Identify sorted half",
    narrow: vi ? `Giữ nửa ${view.keptHalf === "left" ? "TRÁI" : "PHẢI"}` : `Keep the ${view.keptHalf === "left" ? "LEFT" : "RIGHT"} half`,
    found: vi ? "Đã tìm thấy" : "Found",
    "not-found": vi ? "Không tìm thấy" : "Not found",
  })[view.phase] || (vi ? "Vùng đang tìm" : "Search range");

  const summary = vi
    ? `Tìm ${view.target} trong mảng xoay. ${stateLabel}. ${comparison}`
    : `Searching for ${view.target} in a rotated array. ${stateLabel}. ${comparison}`;

  $("treeView").innerHTML = `<div class="rotated-search-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rotated-search-head">
      <span class="rotated-target">target <strong>${escapeHtml(String(view.target))}</strong></span>
      <span class="rotated-phase">${escapeHtml(stateLabel)}</span>
    </div>
    <div class="rotated-cells">${cells}</div>
    <div class="rotated-decision">${escapeHtml(comparison)}</div>
    <div class="rotated-legend">
      <span><i class="legend-active"></i>${vi ? "còn xét" : "candidate"}</span>
      <span><i class="legend-sorted"></i>${vi ? "nửa tăng dần" : "sorted half"}</span>
      <span><i class="legend-mid"></i>mid</span>
      <span><i class="legend-discarded"></i>${vi ? "đã loại" : "discarded"}</span>
    </div>
  </div>`;
}

function renderRotatedSearch81View(step) {
  const view = step.rotatedSearch81View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const left = Number.isInteger(view.left) ? view.left : -1;
  const right = Number.isInteger(view.right) ? view.right : -1;
  const mid = Number.isInteger(view.mid) ? view.mid : -1;
  const comparedLeft = Number.isInteger(view.comparedLeft) ? view.comparedLeft : left;
  const comparedRight = Number.isInteger(view.comparedRight) ? view.comparedRight : right;
  const eliminated = new Set(Array.isArray(view.eliminated) ? view.eliminated : []);
  const operation = String(view.operation || "initialize");
  const activeGate = ["initialize", "loop-check", "choose-mid", "check-target"].includes(operation) ? 0
    : ["check-duplicates", "shrink-left", "shrink-right", "continue"].includes(operation) ? 1
      : ["detect-sorted-half", "check-left-range", "check-right-range", "left-range-else", "right-sorted-else", "right-range-else", "keep-left", "keep-right"].includes(operation) ? 2 : 3;
  const phaseLabels = vi
    ? ["Kiểm tra mid", "Gỡ duplicate wall", "Chọn nửa tăng dần", "Kết quả"]
    : ["Check midpoint", "Break duplicate wall", "Choose sorted half", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index === activeGate ? "active" : index < activeGate ? "done" : ""}"><b>${index < activeGate ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const pointerLabels = (index) => {
    const labels = [];
    if (index === left) labels.push("L");
    if (index === mid) labels.push("M");
    if (index === right) labels.push("R");
    return labels;
  };
  const inSortedHalf = (index) => (
    view.sortedHalf === "left" ? index >= left && index <= mid
      : view.sortedHalf === "right" ? index >= mid && index <= right
        : false
  );
  const cells = nums.map((value, index) => {
    const pointers = pointerLabels(index);
    const active = index >= left && index <= right;
    const found = view.answer === true && index === mid;
    const duplicateEdge = view.duplicateWall && (index === comparedLeft || index === mid || index === comparedRight);
    const classes = ["rs81-cell"];
    classes.push(active ? "candidate" : "discarded");
    if (index === mid) classes.push("mid");
    if (inSortedHalf(index)) classes.push("sorted");
    if (view.phase === "narrow" && active) classes.push("kept");
    if (duplicateEdge) classes.push("duplicate");
    if (eliminated.has(index)) classes.push("just-eliminated");
    if (found) classes.push("found");
    const pointerHtml = pointers.length
      ? pointers.map((label) => `<b class="pointer-${label.toLowerCase()}">${label}<i></i></b>`).join("")
      : "";
    return `<div class="rs81-cell-wrap"><div class="rs81-pointers">${pointerHtml}</div><div class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(value)}</strong></div></div>`;
  }).join("");

  const valueAt = (index) => index >= 0 && index < nums.length ? nums[index] : "—";
  const triple = [
    ["L", comparedLeft, valueAt(comparedLeft)],
    ["M", mid, valueAt(mid)],
    ["R", comparedRight, valueAt(comparedRight)],
  ].map(([label, index, value]) => `<article class="${view.duplicateWall ? "duplicate" : ""}"><small>${label} · index ${index >= 0 && index < nums.length ? index : "—"}</small><strong>${escapeHtml(value)}</strong><span>nums[${label}]</span></article>`).join("<i>=</i>");

  const gateLabels = vi
    ? ["1 · Mid là target?", "2 · L = M = R?", "3 · Nửa nào tăng dần?"]
    : ["1 · Is mid the target?", "2 · Does L = M = R?", "3 · Which half is sorted?"];
  const gates = gateLabels.map((label, index) => {
    const state = index < activeGate ? "done" : index === activeGate ? "active" : "waiting";
    const detail = index === 0
      ? `nums[M] ${mid >= 0 ? `= ${valueAt(mid)}` : "?"} · target = ${view.target}`
      : index === 1
        ? view.duplicateWall
          ? (vi ? "Mơ hồ → left++, right--" : "Ambiguous → left++, right--")
          : (vi ? "Không mơ hồ" : "Not ambiguous")
        : view.sortedHalf
          ? `${view.sortedHalf === "left" ? "LEFT" : "RIGHT"} ${vi ? "tăng dần" : "is sorted"}`
          : (vi ? "Chưa xác định" : "Not determined yet");
    return `<span class="${state}"><b>${escapeHtml(label)}</b><small>${escapeHtml(detail)}</small></span>`;
  }).join("");

  const decision = pick(view.decision) || "—";
  const answer = view.final ? (view.answer ? "True" : "False") : "…";
  const rangeSize = Math.max(0, right - left + 1);
  const summary = vi
    ? `Bài 81, target ${view.target}, vùng [${left}, ${right}], quyết định: ${decision}.`
    : `Problem 81, target ${view.target}, range [${left}, ${right}], decision: ${decision}.`;

  $("treeView").innerHTML = `<section class="rs81-viz phase-${escapeHtml(view.phase || "initialize")}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>BINARY SEARCH · DUPLICATES · #81</small><strong>${vi ? "TÌM TRONG MẢNG XOAY II" : "SEARCH IN ROTATED SORTED ARRAY II"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="rs81-phases">${phases}</div>
    <section class="rs81-rule"><b>${vi ? "THỨ TỰ KIỂM TRA" : "CHECK ORDER"}</b><code>target first → duplicate wall → sorted half</code><span>${vi ? "Không được kết luận nửa tăng dần trước khi xử lý L = M = R." : "Never infer the sorted half before handling L = M = R."}</span></section>
    <section class="rs81-array"><header><strong>${vi ? "VÙNG ỨNG VIÊN" : "CANDIDATE RANGE"} [${left}, ${right}]</strong><span>${rangeSize}/${nums.length} ${vi ? "phần tử còn lại" : "values remain"}</span></header><div class="rs81-scroll"><div class="rs81-cells">${cells}</div></div></section>
    <div class="rs81-main">
      <section class="rs81-triplet ${view.duplicateWall ? "ambiguous" : ""}"><header><strong>${view.duplicateWall && (comparedLeft !== left || comparedRight !== right) ? (vi ? "BA MỐC ĐÃ KIỂM TRA" : "TESTED ANCHORS") : "L · M · R"}</strong><span>${view.duplicateWall ? (vi ? "BA GIÁ TRỊ ĐÃ SO SÁNH GIỐNG NHAU → KHÔNG BIẾT PIVOT Ở ĐÂU" : "THE COMPARED VALUES WERE EQUAL → PIVOT SIDE WAS UNKNOWN") : (vi ? "so sánh ba mốc" : "compare the three anchors")}</span></header><div>${triple}</div></section>
      <section class="rs81-gates"><header><strong>${vi ? "CÂY QUYẾT ĐỊNH MỖI VÒNG" : "DECISION GATES PER ITERATION"}</strong><span>#${view.iteration || 0}</span></header><div>${gates}</div></section>
    </div>
    <section class="rs81-decision ${view.duplicateWall ? "duplicate" : ""}"><small>${vi ? "QUYẾT ĐỊNH HIỆN TẠI" : "CURRENT DECISION"}</small><strong>${escapeHtml(decision)}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="rs81-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><code>${escapeHtml(pick(step.title))}</code></section>
    <footer class="rs81-result ${view.final ? (view.answer ? "found" : "missing") : ""}"><small>SEARCH RESULT</small><strong>${answer}</strong><span>${view.final ? (view.answer ? (vi ? "Target tồn tại trong vùng đã xoay." : "The target exists in the rotated array.") : (vi ? "Vùng ứng viên đã rỗng." : "The candidate range is empty.")) : (view.duplicateWall ? (vi ? "Vòng này chỉ thu hẹp biên; worst case O(n)." : "This iteration only shrinks boundaries; worst case O(n).") : (vi ? "Nếu xác định được nửa tăng dần, ta loại khoảng một nửa." : "Once a sorted half is known, about half can be discarded."))}</span></footer>
  </section>`;
}

// ---- Find Minimum in Rotated Sorted Array II visualization (LeetCode 154) ----
// Reuses the same column/pointer layout as the bai 33 rotated-search view,
// but there is no target: instead nums[mid] is always compared against
// nums[right], and the duplicate-shrink case (nums[mid] == nums[right],
// right -= 1) gets its own distinct highlight so it's clear only one
// element is discarded instead of a whole half.
function renderFindMinRotatedView(step) {
  const view = step.findMinRotatedView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const left = Number.isInteger(view.left) ? view.left : -1;
  const right = Number.isInteger(view.right) ? view.right : -1;
  const mid = Number.isInteger(view.mid) ? view.mid : -1;
  const eliminated = new Set(Array.isArray(view.eliminated) ? view.eliminated : []);
  const comparison = pick(view.comparison) || "";
  const vi = lang === "vi";
  const minValue = nums.length ? Math.min(...nums) : 0;
  const maxValue = nums.length ? Math.max(...nums) : 0;

  function columnHeight(value) {
    if (maxValue === minValue) return 64;
    return 44 + Math.round(((value - minValue) / (maxValue - minValue)) * 42);
  }

  function pointerLabels(index) {
    const labels = [];
    if (index === left) labels.push("L");
    if (index === mid) labels.push("M");
    if (index === right) labels.push("R");
    return labels;
  }

  const cells = nums.map((value, index) => {
    const pointers = pointerLabels(index);
    const active = index >= left && index <= right;
    const found = view.phase === "found" && index === view.minIndex;
    const duplicateHit = view.duplicateShrink && index === right;
    const classes = [
      "rotated-cell",
      active ? "active" : "discarded",
      eliminated.has(index) ? "just-eliminated" : "",
      view.phase === "narrow" && active ? "kept" : "",
      index === mid && view.phase !== "found" ? "mid" : "",
      duplicateHit ? "duplicate-hit" : "",
      found ? "found" : "",
    ].filter(Boolean).join(" ");
    const pointerHtml = pointers.length
      ? pointers.map((label) => `<span class="rotated-pointer pointer-${label.toLowerCase()}">${label}<i></i></span>`).join("")
      : `<span class="rotated-pointer-spacer"></span>`;

    return `<div class="rotated-cell-wrap">
      <div class="rotated-pointers">${pointerHtml}</div>
      <div class="${classes}" style="--rotated-height: ${columnHeight(value)}px">
        <strong>${escapeHtml(String(value))}</strong>
        <span>[${index}]</span>
      </div>
    </div>`;
  }).join("");

  const stateLabel = ({
    range: vi ? "Vùng đang tìm" : "Search range",
    mid: vi ? "Kiểm tra điểm giữa" : "Check midpoint",
    sorted: view.duplicateShrink
      ? (vi ? "Trùng nums[M] == nums[R]" : "Tie: nums[M] == nums[R]")
      : (vi ? "So sánh nums[M] với nums[R]" : "Compare nums[M] with nums[R]"),
    narrow: view.duplicateShrink
      ? (vi ? "Loại bỏ 1 phần tử trùng (right -= 1)" : "Discard 1 duplicate (right -= 1)")
      : (vi ? `Giữ nửa ${view.keptHalf === "left" ? "TRÁI" : "PHẢI"}` : `Keep the ${view.keptHalf === "left" ? "LEFT" : "RIGHT"} half`),
    found: vi ? "Đã tìm thấy min" : "Minimum found",
  })[view.phase] || (vi ? "Vùng đang tìm" : "Search range");

  const summary = vi
    ? `Tìm phần tử nhỏ nhất trong mảng xoay. ${stateLabel}. ${comparison}`
    : `Finding the minimum in a rotated array. ${stateLabel}. ${comparison}`;

  $("treeView").innerHTML = `<div class="rotated-search-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rotated-search-head">
      <span class="rotated-target">${vi ? "tìm" : "finding"} <strong>min</strong></span>
      <span class="rotated-phase${view.duplicateShrink ? " rotated-phase-dup" : ""}">${escapeHtml(stateLabel)}</span>
    </div>
    <div class="rotated-cells">${cells}</div>
    <div class="rotated-decision">${escapeHtml(comparison)}</div>
    <div class="rotated-legend">
      <span><i class="legend-active"></i>${vi ? "còn xét" : "candidate"}</span>
      <span><i class="legend-mid"></i>mid</span>
      <span><i class="legend-dup"></i>${vi ? "trùng, loại 1 phần tử" : "duplicate, discard 1"}</span>
      <span><i class="legend-discarded"></i>${vi ? "đã loại" : "discarded"}</span>
    </div>
  </div>`;
}

// ---- Sorted GCD pair queries visualization (LeetCode 3312) ----
function renderGcdPairsView(step) {
  const view = step.gcdPairsView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const sorted = Array.isArray(view.sorted) ? view.sorted : [];
  const pair = view.pair || null;
  const buckets = Array.isArray(view.buckets) ? view.buckets : [];
  const query = view.query || null;
  const activeG = Number.isInteger(view.activeG) ? view.activeG : null;
  const vi = lang === "vi";

  const numsHtml = nums.map((value, index) => {
    const selected = pair && (index === pair.i || index === pair.j);
    return `<div class="gcd-num${selected ? " selected" : ""}"><strong>${escapeHtml(String(value))}</strong><span>[${index}]</span></div>`;
  }).join("");
  const pairHtml = pair
    ? `<div class="gcd-pair-formula"><span>nums[${pair.i}] = ${pair.vi}</span><b>gcd</b><span>nums[${pair.j}] = ${pair.vj}</span><strong>= ${pair.g}</strong></div>`
    : `<div class="gcd-pair-formula muted">${vi ? "Chọn mọi cặp i < j" : "Consider every pair i < j"}</div>`;
  const sortedHtml = sorted.map((value, index) => {
    const selected = query && index === query.index;
    const sameG = activeG !== null && value === activeG;
    return `<div class="gcd-sorted-chip${selected ? " query" : ""}${sameG ? " same-gcd" : ""}"><span>[${index}]</span><strong>${escapeHtml(String(value))}</strong></div>`;
  }).join("");
  const bucketHtml = buckets.length
    ? `<div class="gcd-buckets">${buckets.map((bucket) => `<div class="gcd-bucket${activeG === bucket.g ? " active" : ""}"><span>g = ${bucket.g}</span><strong>${bucket.count}</strong><small>${vi ? `tích lũy ${bucket.prefix}` : `prefix ${bucket.prefix}`}</small></div>`).join("")}</div>`
    : "";
  const queryHtml = query
    ? `<div class="gcd-query-result"><span>q=${query.index}</span><strong>gcdPairs[${query.index}] = ${query.answer}</strong></div>`
    : "";
  const summary = vi
    ? `Tạo GCD cho từng cặp rồi sắp xếp. ${query ? `Query ${query.index} chọn ${query.answer}.` : ""}`
    : `Form GCDs for every pair, then sort them. ${query ? `Query ${query.index} selects ${query.answer}.` : ""}`;

  $("treeView").innerHTML = `<div class="gcd-pairs-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="gcd-source-row"><span class="gcd-row-label">nums</span><div class="gcd-num-list">${numsHtml}</div></div>
    ${pairHtml}
    <div class="gcd-row-label">gcdPairs ${vi ? "(đã sắp xếp)" : "(sorted)"}</div>
    <div class="gcd-sorted-list">${sortedHtml}</div>
    ${bucketHtml}
    ${queryHtml}
  </div>`;
}

// ---- K-th palindromic rearrangement visualization (LeetCode 3518) ----
function renderKthPalindromeView(step) {
  const view = step.kthPalindromeView || {};
  const source = Array.isArray(view.source) ? view.source : [];
  const counts = Array.isArray(view.counts) ? view.counts : [];
  const halfCounts = Array.isArray(view.halfCounts) ? view.halfCounts : [];
  const candidates = Array.isArray(view.candidates) ? view.candidates : [];
  const preview = Array.isArray(view.preview) ? view.preview : [];
  const activeIndex = Number.isInteger(view.activeIndex) ? view.activeIndex : -1;
  const position = Number.isInteger(view.position) ? view.position : -1;
  const halfLength = Number.isInteger(view.halfLength) ? view.halfLength : Math.floor(source.length / 2);
  const vi = lang === "vi";
  const showsActivePosition = ["position", "try", "count-candidate", "skip", "choose"].includes(view.phase);

  const formatNumber = (value, capped = false) => {
    if (value === null || value === undefined) return "-";
    const formatted = Number(value).toLocaleString("en-US");
    return capped ? `${formatted}+` : formatted;
  };

  const visibleIndexes = (length, limit = 24) => {
    if (length <= limit) return Array.from({ length }, (_, index) => index);
    const side = Math.floor(limit / 2);
    return [
      ...Array.from({ length: side }, (_, index) => index),
      -1,
      ...Array.from({ length: side }, (_, index) => length - side + index),
    ];
  };

  const sourceHtml = visibleIndexes(source.length).map((index) => index < 0
    ? '<span class="kp-ellipsis">...</span>'
    : `<div class="kp-char"><span>[${index}]</span><strong>${escapeHtml(source[index])}</strong></div>`).join("");

  const countsHtml = counts.map((item) => {
    const index = item.ch.charCodeAt(0) - 97;
    const remaining = halfCounts.length ? halfCounts[index] : item.half;
    return `<div class="kp-count${index === activeIndex ? " active" : ""}${remaining === 0 ? " empty" : ""}">
      <strong>${escapeHtml(item.ch)}</strong>
      <span>${vi ? "toàn bộ" : "full"} ${item.count}</span>
      <small>${vi ? "còn lại" : "left"} ${remaining}</small>
    </div>`;
  }).join("");

  const statusLabel = {
    untried: vi ? "CHƯA THỬ" : "UNTRIED",
    trying: vi ? "ĐANG THỬ" : "TRY",
    counted: vi ? "ĐÃ ĐẾM" : "COUNTED",
    skipped: vi ? "BỎ BLOCK" : "SKIP BLOCK",
    chosen: vi ? "CHỌN" : "CHOOSE",
  };
  const candidatesHtml = candidates.map((candidate) => {
    const containsTarget = Number.isFinite(view.rankAtPosition)
      && view.rankAtPosition >= candidate.rangeStart
      && view.rankAtPosition <= candidate.rangeEnd;
    const rangeEnd = candidate.capped ? `${formatNumber(candidate.rangeEnd)}+` : formatNumber(candidate.rangeEnd);
    return `<div class="kp-candidate ${candidate.status || "untried"}${containsTarget ? " contains-target" : ""}">
      <div class="kp-candidate-head"><strong>${escapeHtml(candidate.ch)}</strong><span>${statusLabel[candidate.status] || statusLabel.untried}</span></div>
      <div><small>${vi ? "số cách" : "ways"}</small><b>${formatNumber(candidate.ways, candidate.capped)}</b></div>
      <div><small>rank</small><b>${formatNumber(candidate.rangeStart)}-${rangeEnd}</b></div>
    </div>`;
  }).join("");

  const previewHtml = visibleIndexes(preview.length).map((index) => {
    if (index < 0) return '<span class="kp-ellipsis">...</span>';
    const center = source.length % 2 === 1 && index === halfLength;
    const side = center ? "center" : index < halfLength ? "left" : "right";
    const active = showsActivePosition && (index === position || index === source.length - 1 - position);
    const value = preview[index];
    return `<div class="kp-result-cell ${side}${value != null ? " filled" : ""}${active ? " active" : ""}${view.final ? " final" : ""}">
      <span>[${index}]</span><strong>${escapeHtml(value == null ? "·" : String(value))}</strong>
    </div>`;
  }).join("");

  const emptyText = vi ? "rỗng" : "empty";
  const leftText = Array.isArray(view.left) && view.left.length ? view.left.join("") : emptyText;
  const middleText = view.middle || emptyText;
  const totalText = view.totalWays == null ? "-" : formatNumber(view.totalWays, view.totalCapped);
  const formula = view.formula ? `<div class="kp-formula">${escapeHtml(view.formula)}</div>` : "";
  const summary = vi
    ? `Đang tìm palindrome thứ ${view.requestedK}; prefix hiện tại là ${leftText}, k cục bộ là ${view.currentK}.`
    : `Finding palindrome ${view.requestedK}; the current prefix is ${leftText} and local k is ${view.currentK}.`;

  $("treeView").innerHTML = `<div class="kth-palindrome-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="kp-row"><span class="kp-label">input s</span><div class="kp-chars">${sourceHtml}</div></div>
    <div class="kp-rank-strip">
      <span>${vi ? "k yêu cầu" : "requested k"}<strong>${formatNumber(view.requestedK)}</strong></span>
      <span>${vi ? "k cục bộ" : "local k"}<strong>${formatNumber(view.currentK)}</strong></span>
      <span>${vi ? "tổng cách" : "total ways"}<strong>${totalText}</strong></span>
      <span>prefix<strong>${escapeHtml(leftText)}</strong></span>
      <span>middle<strong>${escapeHtml(middleText)}</strong></span>
    </div>
    ${counts.length ? `<div class="kp-row"><span class="kp-label">half count</span><div class="kp-counts">${countsHtml}</div></div>` : ""}
    ${candidates.length ? `<div class="kp-candidate-section"><div class="kp-candidate-title"><span>${vi ? `Lựa chọn cho vị trí ${position}` : `Choices for position ${position}`}</span><b>${vi ? `rank mục tiêu ${formatNumber(view.rankAtPosition)}` : `target rank ${formatNumber(view.rankAtPosition)}`}</b></div><div class="kp-candidates">${candidatesHtml}</div></div>` : ""}
    ${formula}
    <div class="kp-half-guide"><span>${vi ? "NỬA TRÁI = QUYẾT ĐỊNH THỨ TỰ" : "LEFT HALF = LEXICOGRAPHIC ORDER"}</span><span>${source.length % 2 ? "CENTER" : ""}</span><span>${vi ? "NỬA PHẢI = ĐẢO NGƯỢC" : "RIGHT HALF = REVERSE"}</span></div>
    <div class="kp-row"><span class="kp-label">${view.final ? (vi ? "kết quả" : "result") : "palindrome"}</span><div class="kp-result">${previewHtml}</div></div>
  </div>`;
}

// ---- Smallest palindromic rearrangement visualization (LeetCode 3517) ----
function renderPalindromeBuildView(step) {
  const view = step.palindromeBuildView || {};
  const source = Array.isArray(view.source) ? view.source : [];
  const counts = Array.isArray(view.counts) ? view.counts : [];
  const preview = Array.isArray(view.preview) ? view.preview : [];
  const bucket = Array.isArray(view.bucket) ? view.bucket : [];
  const placements = new Set(Array.isArray(view.placements) ? view.placements : []);
  const processed = new Set(Array.isArray(view.processed) ? view.processed : []);
  const activeChar = view.activeChar;
  const scanIndex = Number.isInteger(view.scanIndex) ? view.scanIndex : -1;
  const activeBucket = Number.isInteger(view.activeBucket) ? view.activeBucket : -1;
  const partition = Number.isInteger(view.partition) ? view.partition : Math.floor(source.length / 2);
  const halfLength = Number.isInteger(view.halfLength) ? view.halfLength : Math.floor(source.length / 2);
  const vi = lang === "vi";

  const sourceHtml = source.map((ch, index) => `<div class="sp-source-cell${ch === activeChar || index === scanIndex ? " active" : ""}${view.bucketApproach && index < partition ? " first-half" : ""}${view.bucketApproach && source.length % 2 && index === partition ? " source-center" : ""}">
    ${index === scanIndex ? '<b class="sp-source-pointer">i</b>' : ""}
    <span>[${index}]</span><strong>${escapeHtml(ch)}</strong>
  </div>`).join("");

  const countsHtml = counts.map((item) => `<div class="sp-count${item.ch === activeChar ? " active" : ""}${processed.has(item.ch) ? " processed" : ""}">
    <strong>${escapeHtml(item.ch)}</strong>
    <span>${vi ? "đếm" : "count"} ${item.count}</span>
    <small>${item.pairs} ${vi ? "cặp" : item.pairs === 1 ? "pair" : "pairs"}${item.odd ? ` + 1 ${vi ? "dư" : "odd"}` : ""}</small>
  </div>`).join("");

  const bucketHtml = bucket.map((value, index) => `<div class="sp-bucket${index === activeBucket ? " active" : ""}${value > 0 ? " filled" : ""}">
    <span>${String.fromCharCode(index + 97)}</span><strong>${value}</strong><small>[${index}]</small>
  </div>`).join("");

  const previewHtml = preview.map((ch, index) => {
    const center = source.length % 2 === 1 && index === halfLength;
    const side = center ? " center" : index < halfLength ? " left" : " right";
    return `<div class="sp-result-cell${side}${placements.has(index) ? " placed" : ""}${view.final ? " final" : ""}">
      <span>[${index}]</span><strong>${escapeHtml(ch == null ? "·" : String(ch))}</strong>
    </div>`;
  }).join("");

  const leftText = Array.isArray(view.left) && view.left.length ? view.left.join("") : "∅";
  const middleText = view.middle || "∅";
  const rightText = view.right || "∅";
  const formula = view.formula ? `<div class="sp-formula">${escapeHtml(view.formula)}</div>` : "";
  const summary = vi
    ? `Xây palindrome nhỏ nhất từ ${source.length} ký tự; nửa trái hiện là ${leftText}, ký tự giữa là ${middleText}.`
    : `Build the smallest palindrome from ${source.length} characters; current left half is ${leftText}, middle is ${middleText}.`;

  $("treeView").innerHTML = `<div class="smallest-palindrome-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="sp-row"><span class="sp-label">s</span><div class="sp-source">${sourceHtml}</div></div>
    ${counts.length ? `<div class="sp-row"><span class="sp-label">count</span><div class="sp-counts">${countsHtml}</div></div>` : ""}
    ${bucket.length ? `<div class="sp-row sp-bucket-row"><span class="sp-label">bucket</span><div class="sp-bucket-grid">${bucketHtml}</div></div>` : ""}
    <div class="sp-state"><span>${vi ? "nửa trái" : "left half"}: <strong>${escapeHtml(leftText)}</strong></span><span>middle: <strong>${escapeHtml(middleText)}</strong></span>${view.bucketApproach ? `<span>right: <strong>${escapeHtml(rightText)}</strong></span>` : ""}</div>
    ${formula}
    <div class="sp-half-guide"><span>${vi ? "NỬA TRÁI tăng dần" : "SORTED LEFT HALF"}</span><span>${source.length % 2 ? "CENTER" : ""}</span><span>${vi ? "NỬA PHẢI đối xứng" : "MIRRORED RIGHT HALF"}</span></div>
    <div class="sp-row"><span class="sp-label">${view.final ? (vi ? "kết quả" : "result") : (vi ? "bố cục" : "layout")}</span><div class="sp-result">${previewHtml}</div></div>
  </div>`;
}

// ---- Duplicate zeros visualization (LeetCode 1089) ----
function renderOccurrenceLookupView(step) {
  const view = step.occurrenceLookupView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const positions = Array.isArray(view.positions) ? view.positions : [];
  const queries = Array.isArray(view.queries) ? view.queries : [];
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const x = view.x;
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : -1;
  const queryIndex = Number.isInteger(view.queryIndex) ? view.queryIndex : -1;
  const vi = lang === "vi";
  const phase = view.final ? (vi ? "Hoàn tất" : "Complete") : queryIndex >= 0 ? (vi ? "Pha 2 · Tra query" : "Phase 2 · Query lookup") : (vi ? "Pha 1 · Quét nums" : "Phase 1 · Scan nums");
  const currentQuery = queryIndex >= 0 ? queries[queryIndex] : null;
  const hasAnswer = queryIndex >= 0 && queryIndex < answer.length;
  const currentAnswer = hasAnswer ? answer[queryIndex] : null;
  const formula = currentQuery === null
    ? (vi ? "Mỗi lần gặp x, lưu index vào positions theo đúng thứ tự." : "Whenever x appears, store its index in positions in encounter order.")
    : currentAnswer === null
      ? `q = ${currentQuery} → positions[${currentQuery - 1}] → ?`
      : currentAnswer === -1
        ? `q = ${currentQuery} → positions[${currentQuery - 1}] → ${vi ? "không tồn tại" : "missing"} → -1`
        : `q = ${currentQuery} → positions[${currentQuery - 1}] = ${currentAnswer}`;

  const numsHtml = nums.map((value, index) => {
    const occurrence = positions.indexOf(index) + 1;
    const isCurrent = index === currentIndex;
    const isTarget = value === x;
    return `<div class="ol-num${isCurrent ? " current" : ""}${isTarget ? " target" : ""}${occurrence ? " found" : ""}">
      ${isCurrent ? `<b class="ol-pointer">${vi ? "đang xét" : "scan"}</b>` : ""}
      <small>index ${index}</small><strong>${escapeHtml(String(value))}</strong>
      <em>${occurrence ? `${vi ? "lần" : "occ"} #${occurrence}` : isTarget ? (vi ? "x" : "target") : ""}</em>
    </div>`;
  }).join("");

  const mapHtml = positions.length ? positions.map((index, occurrence) => {
    const active = currentQuery === occurrence + 1 || currentIndex === index;
    return `<div class="ol-map${active ? " active" : ""}"><b>#${occurrence + 1}</b><span>→</span><strong>index ${index}</strong><small>nums[${index}] = ${escapeHtml(String(nums[index]))}</small></div>`;
  }).join("") : `<p class="ol-empty">${vi ? "Chưa tìm thấy x nào." : "No occurrences of x yet."}</p>`;

  const queryHtml = queries.map((query, index) => {
    const isCurrent = index === queryIndex;
    const completed = index < answer.length;
    const result = completed ? answer[index] : "?";
    const missing = completed && result === -1;
    const ordinal = vi ? `lần #${query}` : `occurrence ${query}`;
    return `<div class="ol-query${isCurrent ? " current" : ""}${completed ? " done" : ""}${missing ? " missing" : ""}"><small>q${index + 1}</small><b>${ordinal}</b><span>${completed ? `→ ${escapeHtml(String(result))}` : "→ ?"}</span></div>`;
  }).join("");

  const summary = vi
    ? `Target x = ${x}. Positions lưu index của các lần xuất hiện; query q đọc positions[q−1].`
    : `Target x = ${x}. Positions stores occurrence indices; query q reads positions[q−1].`;
  $("treeView").innerHTML = `<div class="occurrence-lookup-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><span class="ol-phase">${escapeHtml(phase)}</span><strong>x = ${escapeHtml(String(x))}</strong></header>
    <section><h4>${vi ? "1. Quét nums — các ô x được giữ lại" : "1. Scan nums — keep target cells"}</h4><div class="ol-nums">${numsHtml}</div></section>
    <div class="ol-flow">${vi ? "gặp x → lưu index theo thứ tự" : "find x → save its index in order"}</div>
    <section><h4>${vi ? "2. Bảng positions: lần xuất hiện → index" : "2. positions table: occurrence → index"}</h4><div class="ol-maps">${mapHtml}</div></section>
    <section><h4>${vi ? "3. Queries: q → positions[q − 1]" : "3. Queries: q → positions[q − 1]"}</h4><div class="ol-queries">${queryHtml}</div><div class="ol-formula">${escapeHtml(formula)}</div></section>
  </div>`;
}

function renderDuplicateZerosView(step) {
  const view = step.duplicateZerosView || {};
  const source = Array.isArray(view.source) ? view.source : [];
  const output = Array.isArray(view.output) ? view.output : [];
  const virtual = Array.isArray(view.virtual) ? view.virtual : output;
  const visibleLength = Number.isInteger(view.visibleLength) ? view.visibleLength : output.length;
  const read = Number.isInteger(view.read) ? view.read : -1;
  const write = Number.isInteger(view.write) ? view.write : -1;
  const writes = new Set((Array.isArray(view.writes) ? view.writes : []).filter((index) => index >= 0 && index < virtual.length));
  const finalized = new Set(Array.isArray(view.finalized) ? view.finalized : []);
  const vi = lang === "vi";

  const row = (values, type) => values.map((value, index) => {
    const isRead = type === "source" && index === read;
    const isWrite = type === "virtual" && writes.has(index);
    const isFinal = type === "virtual" && finalized.has(index);
    const isOverflow = type === "virtual" && index >= visibleLength;
    const display = value === null || value === undefined ? "·" : String(value);
    const pointer = isRead ? "i" : (type === "virtual" && index === write ? "j" : "");
    return `<div class="dz-cell${isRead ? " read" : ""}${isWrite ? " write" : ""}${isFinal ? " final" : ""}${isOverflow ? " overflow" : ""}${pointer ? " pointer-cell" : ""}">
      ${pointer ? `<b class="dz-pointer ${pointer}">${pointer}</b>` : ""}
      <span>[${index}]</span><strong>${escapeHtml(display)}</strong>
    </div>`;
  }).join("");

  const writeLabel = write >= visibleLength
    ? (vi ? `j = ${write} (ngoài mảng)` : `j = ${write} (outside array)`)
    : write >= 0
      ? `j = ${write}`
      : (vi ? "j = -1 (hoàn tất)" : "j = -1 (complete)");
  const summary = vi
    ? `Đọc source[${read}] và ghi ngược trong không gian ${virtual.length} ô; chỉ giữ các ô 0 đến ${visibleLength - 1}.`
    : `Read source[${read}] and write backwards in ${virtual.length} slots; keep only slots 0 through ${visibleLength - 1}.`;
  const keptRange = visibleLength ? `[0..${visibleLength - 1}]` : "-";
  const overflowRange = virtual.length > visibleLength ? `[${visibleLength}..${virtual.length - 1}]` : "-";

  $("treeView").innerHTML = `<div class="duplicate-zeros-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="dz-head"><span class="dz-badge read-badge">READ = ${read >= 0 ? read : "-"}</span><span class="dz-badge write-badge">${escapeHtml(writeLabel)}</span></div>
    <div class="dz-row"><span class="dz-label">${vi ? "nguồn" : "source"}</span><div class="dz-cells">${row(source, "source")}</div></div>
    <div class="dz-arrow">${vi ? "ghi từ phải sang trái" : "write from right to left"}</div>
    <div class="dz-range"><span class="dz-keep">${vi ? `GIỮ ${keptRange}` : `KEEP ${keptRange}`}</span><span class="dz-drop">${vi ? `BỎ ${overflowRange}` : `DROP ${overflowRange}`}</span></div>
    <div class="dz-row"><span class="dz-label">${vi ? "vùng ghi" : "write space"}</span><div class="dz-cells">${row(virtual, "virtual")}</div></div>
  </div>`;
}

// ---- Four-sum pair-hash visualization (bai 454: 4Sum II) ----
// Shows the four input arrays in separate rows, a frequency map of a+b pair
// sums, and the complementary -(c+d) lookup that completes a+b+c+d = 0.
function renderFourSumPairsView(step) {
  const view = step.fourSumPairsView || {};
  const rows = [
    { name: "nums1", values: Array.isArray(view.nums1) ? view.nums1 : [], active: view.activeA, cls: "fsp-row-a" },
    { name: "nums2", values: Array.isArray(view.nums2) ? view.nums2 : [], active: view.activeB, cls: "fsp-row-b" },
    { name: "nums3", values: Array.isArray(view.nums3) ? view.nums3 : [], active: view.activeC, cls: "fsp-row-c" },
    { name: "nums4", values: Array.isArray(view.nums4) ? view.nums4 : [], active: view.activeD, cls: "fsp-row-d" },
  ];
  const pairEntries = Array.isArray(view.pairEntries) ? view.pairEntries : [];
  const phase = view.phase || "build";
  const vi = lang === "vi";

  function renderRow(row) {
    const cells = row.values.map((value, index) => {
      const active = index === row.active;
      return `<div class="fsp-num-cell${active ? " active" : ""}"><span>[${index}]</span><strong>${escapeHtml(String(value))}</strong></div>`;
    }).join("");
    return `<div class="fsp-row ${row.cls}"><span class="fsp-row-label">${row.name}</span><div class="fsp-row-cells">${cells}</div></div>`;
  }

  const mapHtml = pairEntries.length
    ? pairEntries.map(({ sum, count }) => `<div class="fsp-map-card${sum === view.pairSum || sum === view.complement ? " active" : ""}${sum === view.complement ? " complement" : ""}"><span>${escapeHtml(String(sum))}</span><strong>×${escapeHtml(String(count))}</strong></div>`).join("")
    : `<span class="fsp-map-empty">{ }</span>`;

  let action = vi ? "Đang xây dựng bảng pair_count của các tổng a+b." : "Building the pair_count table for a+b sums.";
  if (phase === "store-pair") {
    action = vi
      ? `Lưu tổng a+b = ${view.pairSum}; tần suất của tổng này được tăng lên.`
      : `Store a+b = ${view.pairSum}; its frequency is incremented.`;
  } else if (phase === "lookup-complement") {
    action = view.foundCount
      ? (vi ? `Tìm thấy ${view.foundCount} cặp a+b = ${view.complement}; chúng ghép được với c+d để tạo 0.` : `Found ${view.foundCount} pair(s) where a+b = ${view.complement}; they pair with c+d to make 0.`)
      : (vi ? `Cần a+b = ${view.complement}, nhưng hash map không có tổng này.` : `Need a+b = ${view.complement}, but the hash map does not have this sum.`);
  } else if (phase === "found") {
    action = vi ? `Hoàn tất: có ${view.answer || 0} tuple tổng bằng 0.` : `Done: ${view.answer || 0} tuples sum to 0.`;
  }

  const formula = view.complement !== undefined
    ? `<div class="fsp-formula"><code>a + b</code><span>=</span><strong>${escapeHtml(String(view.complement))}</strong><span>=</span><code>-(c + d)</code></div>`
    : `<div class="fsp-formula muted"><code>a + b + c + d = 0</code></div>`;

  $("treeView").innerHTML = `
    <div class="fsp-viz">
      <div class="fsp-arrays">${rows.map(renderRow).join("")}</div>
      <section class="fsp-map-panel"><header><strong>pair_count</strong><span>${vi ? "tổng a+b → số cặp" : "sum a+b → pair frequency"}</span></header><div class="fsp-map-cards">${mapHtml}</div></section>
      ${formula}
      <div class="fsp-action">${escapeHtml(action)}</div>
      <div class="fsp-result"><span>${vi ? "count" : "count"}</span><strong>${escapeHtml(String(view.answer || 0))}</strong></div>
    </div>`;
}

// ---- Binary reduction visualization (bai 1404: Number of Steps to Reduce
// a Number in Binary Representation to One) ----
// Shows the binary number before and after every operation. For /2 the
// trailing zero being removed is red; for +1, the affected trailing ones
// and the receiving carry bit are gold so carry propagation is visible.
function renderBinaryReductionView(step) {
  const view = step.binaryReductionView || {};
  const before = String(view.before ?? "");
  const after = String(view.after ?? before);
  const operation = view.operation || "idle";
  const lsbIndex = Number.isInteger(view.lsbIndex) ? view.lsbIndex : -1;
  const carryIndices = new Set(Array.isArray(view.carryIndices) ? view.carryIndices : []);
  const stepsCount = view.steps;
  const vi = lang === "vi";

  function bitRow(bits, role) {
    const isBefore = role === "before";
    const cells = [...bits].map((bit, index) => {
      const isLsb = isBefore && index === lsbIndex;
      const isCarry = isBefore && carryIndices.has(index);
      const classes = [
        "br-bit-cell",
        isLsb && operation === "divide" ? "br-bit-remove" : "",
        isCarry && operation === "add" ? "br-bit-carry" : "",
      ].filter(Boolean).join(" ");
      const pointer = isLsb
        ? `<div class="br-lsb-pointer"><span>LSB</span><i>\u25BC</i></div>`
        : `<div class="br-lsb-space"></div>`;
      return `<div class="br-bit-wrap">${pointer}<div class="${classes}"><span>[${index}]</span><strong>${escapeHtml(bit)}</strong></div></div>`;
    }).join("");
    return `<div class="br-row"><span class="br-row-label">${escapeHtml(role)}</span><div class="br-bits">${cells}</div></div>`;
  }

  const opText = ({
    divide: "/ 2",
    add: "+ 1",
    check: vi ? "kiểm tra" : "check",
    "branch-add": vi ? "số lẻ" : "odd",
    found: vi ? "xong" : "done",
    idle: "",
  })[operation] || "";
  const changed = before !== after;
  const summary = operation === "divide"
    ? (vi ? "Số chẵn: bỏ bit 0 cuối để chia 2." : "Even number: remove the trailing 0 to divide by 2.")
    : operation === "add"
      ? (vi ? "Số lẻ: cộng 1; vàng là các bit carry đi qua." : "Odd number: add 1; gold marks the carry path.")
      : operation === "found"
        ? (vi ? "Đã đạt đúng giá trị 1." : "The value has reached exactly 1.")
        : (vi ? "Kiểm tra bit cuối để chọn phép toán tiếp theo." : "Inspect the final bit to choose the next operation.");

  $("treeView").innerHTML = `
    <div class="binary-reduce-viz">
      <div class="br-head">
        <span class="br-step-badge">${vi ? "bước" : "steps"} <strong>${escapeHtml(String(stepsCount ?? 0))}</strong></span>
        <span class="br-operation br-operation-${escapeHtml(operation)}">${escapeHtml(opText)}</span>
      </div>
      ${changed ? `${bitRow(before, "before")}<div class="br-transform">${escapeHtml(opText)}</div>${bitRow(after, "after")}` : bitRow(after, "s")}
      <div class="br-summary">${escapeHtml(summary)}</div>
      <div class="br-legend">
        <span><i class="br-swatch br-swatch-lsb"></i>${vi ? "bit cuối (LSB)" : "last bit (LSB)"}</span>
        <span><i class="br-swatch br-swatch-remove"></i>${vi ? "bit 0 bị bỏ khi /2" : "0 removed by /2"}</span>
        <span><i class="br-swatch br-swatch-carry"></i>${vi ? "đường đi carry khi +1" : "carry path for +1"}</span>
      </div>
    </div>`;
}

// ---- Repeating-runs visualization (bai 2213: Longest Substring of One
// Repeating Character) ----
// Shows the string as a strip of character cells grouped into colored
// "run" blocks (consecutive equal characters share a color band below
// them), the scan pointer j / j-1 as arrows while comparing, the current
// run highlighted with a bracket, and the best run found so far
// highlighted in gold. A small "lengths so far" trail shows the answer
// building up query by query.
function renderRepeatingRunsView(step) {
  const view = step.repeatingRunsView || {};
  const chars = Array.isArray(view.chars) ? view.chars : [];
  const runs = Array.isArray(view.runs) ? view.runs : [];
  const activeIndex = Number.isInteger(view.activeIndex) ? view.activeIndex : -1;
  const compareIndex = Number.isInteger(view.compareIndex) ? view.compareIndex : -1;
  const changedIndex = Number.isInteger(view.changedIndex) ? view.changedIndex : -1;
  const currentRun = view.currentRun || null;
  const bestRun = view.bestRun || null;
  const lengths = Array.isArray(view.lengths) ? view.lengths : [];
  const treeNodes = Array.isArray(view.treeNodes) ? view.treeNodes : [];
  const merge = view.merge || null;
  const rootBest = Number.isFinite(Number(view.rootBest)) ? Number(view.rootBest) : null;
  const queryIndex = Number.isInteger(view.queryIndex) ? view.queryIndex : null;
  const totalQueries = view.totalQueries;
  const vi = lang === "vi";

  // Assign each run a rotating color class so adjacent runs are visually distinct.
  const runPalette = ["run-c0", "run-c1", "run-c2", "run-c3", "run-c4"];
  const runOfIndex = new Array(chars.length).fill(-1);
  runs.forEach((r, ri) => {
    for (let i = r.start; i <= r.end; i++) runOfIndex[i] = ri;
  });

  const inCurrentRun = (i) => currentRun && i >= currentRun.start && i <= currentRun.end;
  const inBestRun = (i) => bestRun && bestRun.start !== null && bestRun.start !== undefined && i >= bestRun.start && i <= bestRun.end;

  const cells = chars.map((ch, i) => {
    const runIdx = runOfIndex[i];
    const paletteCls = runIdx >= 0 ? runPalette[runIdx % runPalette.length] : "";
    const isActive = i === activeIndex;
    const isCompare = i === compareIndex;
    const isChanged = i === changedIndex;
    const isCurrent = inCurrentRun(i);
    const isBest = inBestRun(i);
    const classes = [
      "run-cell",
      paletteCls,
      isCurrent ? "run-cell-current" : "",
      isBest ? "run-cell-best" : "",
      isChanged ? "run-cell-changed" : "",
    ].filter(Boolean).join(" ");
    const arrowHtml = isActive
      ? `<div class="run-pointer run-pointer-j"><span>j</span><i>\u25BC</i></div>`
      : isCompare
        ? `<div class="run-pointer run-pointer-j1"><span>j-1</span><i>\u25BC</i></div>`
        : `<div class="run-pointer-spacer"></div>`;
    return `<div class="run-cell-wrap">
      ${arrowHtml}
      <div class="${classes}">
        <span class="run-cell-idx">[${i}]</span>
        <strong>${escapeHtml(ch)}</strong>
      </div>
    </div>`;
  }).join("");

  const currentRunLabel = currentRun
    ? `${vi ? "run hiện tại" : "current run"}: '${chars[currentRun.start] ?? ""}' × ${currentRun.length} [${currentRun.start}..${currentRun.end}]`
    : "";
  const bestRunLabel = bestRun
    ? `${vi ? "best run" : "best run"}: '${bestRun.ch || chars[bestRun.start] || ""}' × ${bestRun.length}${bestRun.start !== null && bestRun.start !== undefined ? ` [${bestRun.start}..${bestRun.end}]` : ""}`
    : "";

  const lengthsHtml = lengths.length
    ? lengths.map((len, i) => `<span class="run-length-chip${i === lengths.length - 1 ? " run-length-chip-latest" : ""}">${len}</span>`).join("")
    : `<span class="run-length-empty">${vi ? "(chưa có)" : "(none yet)"}</span>`;

  const queryLabel = queryIndex !== null
    ? (vi ? `Query ${queryIndex + 1}/${totalQueries}` : `Query ${queryIndex + 1}/${totalQueries}`)
    : (vi ? "Khởi tạo" : "Setup");
  const treeHtml = treeNodes.length
    ? treeNodes.map((node) => `<span class="run-tree-node${node.root ? " is-root" : ""}${node.active ? " is-active" : ""}${node.path ? " is-path" : ""}">
        <small>#${escapeHtml(String(node.id))} · [${escapeHtml(String(node.l))}..${escapeHtml(String(node.r))}]</small>
        <strong>${escapeHtml(String(node.best))}</strong>
        <em>pre ${escapeHtml(String(node.pref))} · suf ${escapeHtml(String(node.suff))}</em>
        <i>${escapeHtml(String(node.leftChar))}…${escapeHtml(String(node.rightChar))}</i>
      </span>`).join("")
    : `<span class="run-length-empty">${vi ? "(chưa build cây)" : "(tree not built yet)"}</span>`;
  const mergeHtml = merge
    ? `<div class="run-merge-card">
        <small>${vi ? "merge đang chạy" : "current merge"}</small>
        <strong>node #${escapeHtml(String(merge.node))}: best ${escapeHtml(String(merge.beforeBest))} → ${escapeHtml(String(merge.afterBest))}</strong>
        <span>${merge.canJoin
    ? escapeHtml(`cross = ${merge.left.suff} + ${merge.right.pref} = ${merge.cross}`)
    : escapeHtml(vi ? "không nối được qua giữa" : "cannot join across the middle")}</span>
      </div>`
    : `<div class="run-merge-card">
        <small>${vi ? "quy tắc node" : "node rule"}</small>
        <strong>best = max(left.best, right.best, cross)</strong>
        <span>${vi ? "cross chỉ có khi ký tự cuối trái == ký tự đầu phải" : "cross exists only when left last char == right first char"}</span>
      </div>`;

  $("treeView").innerHTML = `
    <div class="run-viz">
      <div class="run-head">
        <span class="run-query-badge">${escapeHtml(queryLabel)}</span>
        ${rootBest !== null ? `<span class="run-query-badge run-root-badge">root.best = ${escapeHtml(String(rootBest))}</span>` : ""}
        <span class="run-info">${escapeHtml(currentRunLabel)}</span>
        <span class="run-info run-info-best">${escapeHtml(bestRunLabel)}</span>
      </div>
      <div class="run-cells">${cells}</div>
      <div class="run-tree-panel">
        <div class="run-tree-head">
          <strong>SEGMENT TREE</strong>
          <span>${vi ? "mỗi node hiển thị best / pref / suff" : "each node shows best / pref / suff"}</span>
        </div>
        <div class="run-tree-nodes">${treeHtml}</div>
      </div>
      ${mergeHtml}
      <div class="run-lengths-panel">
        <span class="run-lengths-label">${vi ? "lengths (kết quả từng query)" : "lengths (result per query)"}</span>
        <div class="run-lengths-chips">${lengthsHtml}</div>
      </div>
      <div class="run-legend">
        <span><i class="run-legend-swatch run-legend-current"></i>${vi ? "run đang quét" : "run being scanned"}</span>
        <span><i class="run-legend-swatch run-legend-best"></i>${vi ? "run tốt nhất" : "best run"}</span>
        <span><i class="run-legend-swatch run-legend-changed"></i>${vi ? "ký tự vừa đổi" : "just-changed character"}</span>
      </div>
    </div>`;
}

// ---- Candy allocation visualization (bai 2226: Maximum Candies Allocated
// to K Children) ----
// Binary search on the answer (candies per child). Shows:
//  1. A number-line strip with L/mid/R markers over [1, max(candies)].
//  2. Each pile as a column with a "children fed" badge (pile // mid),
//     colored consistently so it's obvious which piles contribute.
//  3. A total-fed vs k comparison bar showing feasible/infeasible at a glance.
function renderCandyAllocationView(step) {
  const view = step.candyAllocationView || {};
  const candies = Array.isArray(view.candies) ? view.candies : [];
  const k = view.k;
  const maxPile = Number.isInteger(view.maxPile) ? view.maxPile : Math.max(1, ...candies);
  const left = Number.isInteger(view.left) ? view.left : null;
  const right = Number.isInteger(view.right) ? view.right : null;
  const mid = Number.isInteger(view.mid) ? view.mid : null;
  const fedPer = Array.isArray(view.fedPer) ? view.fedPer : null;
  const total = Number.isInteger(view.total) ? view.total : null;
  const feasible = view.feasible;
  const bestAnswer = Number.isInteger(view.bestAnswer) ? view.bestAnswer : 0;
  const phase = view.phase || "range";
  const impossible = !!view.impossible;
  const finalAnswer = view.finalAnswer;
  const vi = lang === "vi";

  function pctOf(value) {
    if (!maxPile) return 0;
    return Math.max(2, Math.round((value / maxPile) * 100));
  }

  // ---- 1. Number-line strip over [1, maxPile] with L / mid / R markers ----
  let rangeHtml = "";
  if (!impossible) {
    const markers = [];
    if (Number.isInteger(left)) markers.push({ pos: left, label: "L", cls: "candy-mark-l" });
    if (Number.isInteger(mid)) markers.push({ pos: mid, label: "M", cls: "candy-mark-m" });
    if (Number.isInteger(right)) markers.push({ pos: right, label: "R", cls: "candy-mark-r" });
    const markersHtml = markers.map((m) => {
      const leftPct = maxPile > 1 ? ((m.pos - 1) / (maxPile - 1)) * 100 : 50;
      return `<div class="candy-range-marker ${m.cls}" style="left:${leftPct}%">
        <span class="candy-range-marker-label">${m.label}</span>
        <span class="candy-range-marker-value">${m.pos}</span>
      </div>`;
    }).join("");
    const bandLeftPct = Number.isInteger(left) && maxPile > 1 ? ((left - 1) / (maxPile - 1)) * 100 : 0;
    const bandRightPct = Number.isInteger(right) && maxPile > 1 ? ((right - 1) / (maxPile - 1)) * 100 : 100;
    rangeHtml = `
      <div class="candy-range-panel">
        <div class="candy-range-title">${vi ? `Tìm số kẹo/trẻ tối ưu trong [1, ${maxPile}]` : `Searching candies/child in [1, ${maxPile}]`}</div>
        <div class="candy-range-track">
          <div class="candy-range-band" style="left:${bandLeftPct}%; width:${Math.max(0, bandRightPct - bandLeftPct)}%"></div>
          ${markersHtml}
        </div>
      </div>`;
  }

  // ---- 2. Candy piles as columns with "children fed" badges ----
  const pilesHtml = candies.map((c, i) => {
    const fed = fedPer ? fedPer[i] : null;
    const contributes = fed !== null && fed > 0;
    const heightPct = pctOf(c);
    const classes = ["candy-pile", contributes ? "candy-pile-active" : ""].filter(Boolean).join(" ");
    const badge = fed !== null
      ? `<div class="candy-pile-badge${contributes ? "" : " candy-pile-badge-zero"}">${vi ? "nuôi" : "feeds"} <strong>${fed}</strong></div>`
      : "";
    return `<div class="candy-pile-wrap">
      ${badge}
      <div class="${classes}" style="height:${heightPct}%">
        <span class="candy-pile-value">${escapeHtml(String(c))}</span>
      </div>
      <span class="candy-pile-idx">[${i}]</span>
      ${mid !== null && contributes ? `<span class="candy-pile-formula">${c}÷${mid}=${fed}</span>` : ""}
    </div>`;
  }).join("");

  // ---- 3. Total-fed vs k comparison bar ----
  let totalBarHtml = "";
  if (total !== null) {
    const maxScale = Math.max(total, k, 1);
    const totalPct = Math.min(100, Math.round((total / maxScale) * 100));
    const kPct = Math.min(100, Math.round((k / maxScale) * 100));
    const barCls = feasible === true ? "candy-total-bar-ok" : feasible === false ? "candy-total-bar-bad" : "";
    totalBarHtml = `
      <div class="candy-total-panel">
        <div class="candy-total-row">
          <span class="candy-total-label">${vi ? "Tổng trẻ được chia" : "Total children fed"}</span>
          <span class="candy-total-value">${total}</span>
        </div>
        <div class="candy-total-track">
          <div class="candy-total-fill ${barCls}" style="width:${totalPct}%"></div>
          <div class="candy-total-k-marker" style="left:${kPct}%"><span>k=${k}</span></div>
        </div>
        <div class="candy-total-verdict ${barCls}">
          ${feasible === true
            ? (vi ? `${total} ≥ k=${k} → khả thi, thử LỚN HƠN` : `${total} ≥ k=${k} → feasible, try LARGER`)
            : feasible === false
              ? (vi ? `${total} < k=${k} → không khả thi, thử NHỎ HƠN` : `${total} < k=${k} → infeasible, try SMALLER`)
              : ""}
        </div>
      </div>`;
  }

  const statusText = impossible
    ? (vi ? `Tổng kẹo không đủ cho ${k} trẻ → trả về 0` : `Total candies not enough for ${k} children → return 0`)
    : phase === "found"
      ? (vi ? `Đáp án tối đa: mỗi trẻ nhận ${finalAnswer !== undefined ? finalAnswer : bestAnswer} kẹo` : `Final answer: each child gets ${finalAnswer !== undefined ? finalAnswer : bestAnswer} candies`)
      : (vi ? `Đáp án tốt nhất tạm thời: ${bestAnswer} kẹo/trẻ` : `Best answer so far: ${bestAnswer} candies/child`);

  $("treeView").innerHTML = `
    <div class="candy-alloc-viz">
      <div class="candy-alloc-head">
        <span class="candy-alloc-k">${vi ? "trẻ em" : "children"} <strong>k=${k}</strong></span>
        <span class="candy-alloc-status${phase === "found" ? " candy-alloc-status-done" : ""}">${escapeHtml(statusText)}</span>
      </div>
      ${rangeHtml}
      <div class="candy-piles-row">${pilesHtml}</div>
      ${totalBarHtml}
      <div class="candy-legend">
        <span><i class="candy-legend-swatch candy-legend-active"></i>${vi ? "đống góp phần chia kẹo" : "pile contributing candies"}</span>
        <span><i class="candy-legend-swatch candy-legend-zero"></i>${vi ? "đống không chia được (quá ít)" : "pile that can't feed anyone"}</span>
      </div>
    </div>`;
}

// ---- Multi-slot podium visualization (e.g. bai 628: track top-3 & bottom-2) ----
function renderMultiSlotPodiumView(step) {
  const view = step.multiSlotPodiumView || {};
  const values = Array.isArray(view.values) ? view.values : [];
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const slots = Array.isArray(view.slots) ? view.slots : []; // [{ key, label, value, group, bump, transition }]
  const formula = view.formula || null; // { label, value }
  const mirrorHint = !!view.mirrorHint;

  const valueCells = values.map((v, i) => {
    const isCurrent = i === current;
    const isDone = visited[i];
    return `<div class="digit-cell${isCurrent ? " current" : ""}${isDone && !isCurrent ? " done" : ""}">
      <span class="digit-cell-idx">[${i}]</span>
      <strong>${escapeHtml(String(v))}</strong>
    </div>`;
  }).join("");

  const groupClass = { top: "digit-slot-first", bottom: "digit-slot-second" };
  const groupHeading = { top: lang === "vi" ? "TOP-3 (lớn nhất)" : "TOP-3 (largest)", bottom: lang === "vi" ? "BOTTOM-2 (nhỏ nhất)" : "BOTTOM-2 (smallest)" };

  function renderGroup(groupKey) {
    const groupSlots = slots.filter((s) => s.group === groupKey);
    if (!groupSlots.length) return "";
    const cells = groupSlots.map((slot) => {
      const cls = groupClass[slot.group] || "digit-slot-answer";
      const bump = slot.bump ? " bump" : "";
      const val = slot.value === Infinity ? "+\u221E" : slot.value === -Infinity ? "-\u221E" : slot.value;
      const transitionHtml = slot.transition
        ? `<span class="digit-slot-transition">${escapeHtml(slot.transition)}</span>`
        : "";
      return `<div class="digit-slot ${cls}${bump}">
        <span class="digit-slot-label">${escapeHtml(pick(slot.label) || slot.key)}</span>
        <strong>${escapeHtml(String(val))}</strong>
        ${transitionHtml}
      </div>`;
    }).join("");
    return `<div class="multi-slot-group">
      <span class="multi-slot-group-heading">${escapeHtml(groupHeading[groupKey] || groupKey)}</span>
      <div class="multi-slot-group-cells">${cells}</div>
    </div>`;
  }

  const formulaHtml = formula
    ? `<div class="digit-slot digit-slot-answer"><span class="digit-slot-label">${escapeHtml(pick(formula.label) || (lang === "vi" ? "kết quả" : "result"))}</span><strong>${escapeHtml(String(formula.value))}</strong></div>`
    : "";

  const mirrorNote = mirrorHint
    ? `<div class="multi-slot-mirror-hint">${lang === "vi" ? "\u2194 Y hệt logic top-3 ở trên, chỉ đổi chiều so sánh (< thay vì >)" : "\u2194 Same logic as top-3 above, just flipped comparison (< instead of >)"}</div>`
    : "";

  $("treeView").innerHTML = `
    <div class="digit-podium-viz">
      <div class="digit-strip">${valueCells}</div>
      <div class="multi-slot-groups">
        ${renderGroup("top")}
        ${renderGroup("bottom")}
      </div>
      ${mirrorNote}
      ${formulaHtml ? `<div class="digit-podium">${formulaHtml}</div>` : ""}
    </div>`;
}

function renderDigitPodiumView(step) {
  const view = step.digitPodiumView || {};
  const digits = Array.isArray(view.digits) ? view.digits : [];
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const first = view.first ?? 0;
  const second = view.second ?? 0;
  const updateKind = view.updateKind || null; // "first" | "second" | "none" | null
  const answer = view.answer;
  const op = view.op === "vs" ? (lang === "vi" ? "so với" : "vs") : (view.op || "×");
  const resultLabel = view.resultLabel ? pick(view.resultLabel) : (lang === "vi" ? "tích" : "product");
  const defaultFirstLabel = { vi: "first (lớn nhất)", en: "first (largest)" };
  const defaultSecondLabel = { vi: "second (lớn nhì)", en: "second (2nd largest)" };
  const firstLabel = view.firstLabel ? pick(view.firstLabel) : defaultFirstLabel[lang === "vi" ? "vi" : "en"];
  const secondLabel = view.secondLabel ? pick(view.secondLabel) : defaultSecondLabel[lang === "vi" ? "vi" : "en"];

  const digitCells = digits.map((d, i) => {
    const isCurrent = i === current;
    const isDone = visited[i];
    return `<div class="digit-cell${isCurrent ? " current" : ""}${isDone && !isCurrent ? " done" : ""}">
      <span class="digit-cell-idx">[${i}]</span>
      <strong>${escapeHtml(String(d))}</strong>
    </div>`;
  }).join("");

  const firstBump = updateKind === "first" ? " bump" : "";
  const secondBump = updateKind === "second" ? " bump" : "";

  const answerDisplay = typeof answer === "boolean" ? (answer ? (lang === "vi" ? "True" : "True") : "False") : answer;

  const podium = `<div class="digit-podium">
    <div class="digit-slot digit-slot-first${firstBump}">
      <span class="digit-slot-label">${escapeHtml(firstLabel)}</span>
      <strong>${escapeHtml(String(first))}</strong>
    </div>
    <div class="digit-podium-op">${escapeHtml(op)}</div>
    <div class="digit-slot digit-slot-second${secondBump}">
      <span class="digit-slot-label">${escapeHtml(secondLabel)}</span>
      <strong>${escapeHtml(String(second))}</strong>
    </div>
    ${answer !== undefined ? `<div class="digit-podium-op">=</div><div class="digit-slot digit-slot-answer"><span class="digit-slot-label">${escapeHtml(resultLabel)}</span><strong>${escapeHtml(String(answerDisplay))}</strong></div>` : ""}
  </div>`;

  $("treeView").innerHTML = `
    <div class="digit-podium-viz">
      <div class="digit-strip">${digitCells}</div>
      ${podium}
    </div>`;
}

function renderPrefix1DView(step) {
  const view = step.prefix1DView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const prefixIndex = Number.isInteger(view.prefixIndex) ? view.prefixIndex : -1;
  const query = view.query || null;
  const left = query && Number.isInteger(query.left) ? query.left : -1;
  const right = query && Number.isInteger(query.right) ? query.right : -1;
  const isRangeSumImmutable = view.kind === "range-sum-immutable";

  const numsCells = nums.map((num, index) => {
    const inQuery = left >= 0 && index >= left && index <= right;
    const excludedLeft = isRangeSumImmutable && left > 0 && index < left;
    return `<div class="prefix1d-cell input${index === current ? " current" : ""}${inQuery ? " in-query" : ""}${excludedLeft ? " excluded-left" : ""}">
      <span>[${index}]</span>
      <strong>${escapeHtml(String(num))}</strong>
      ${inQuery ? `<small>${escapeHtml(lang === "vi" ? "lấy" : "keep")}</small>` : ""}
      ${excludedLeft ? `<small>${escapeHtml(lang === "vi" ? "trừ ra" : "subtract")}</small>` : ""}
    </div>`;
  }).join("");

  const prefixCells = prefix.map((value, index) => {
    const isQueryEdge = query && (index === left || index === right + 1);
    const isLeftEdge = query && index === left;
    const isRightEdge = query && index === right + 1;
    const rangeLabel = index === 0
      ? "0"
      : `nums[0..${index - 1}]`;
    return `<div class="prefix1d-cell prefix${index === prefixIndex ? " current" : ""}${isQueryEdge ? " edge" : ""}">
      <span>p[${index}]</span>
      <strong>${value == null ? "-" : escapeHtml(String(value))}</strong>
      ${isRightEdge ? `<small>${escapeHtml(lang === "vi" ? "tổng đến right" : "sum through right")}</small>` : ""}
      ${isLeftEdge ? `<small>${escapeHtml(lang === "vi" ? "trước left" : "before left")}</small>` : ""}
      ${!isRightEdge && !isLeftEdge ? `<small>${escapeHtml(rangeLabel)}</small>` : ""}
    </div>`;
  }).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  let proofHtml = "";
  if (isRangeSumImmutable && query) {
    const rightPrefixIndex = Number.isInteger(query.rightPrefixIndex) ? query.rightPrefixIndex : right + 1;
    const leftPrefixIndex = Number.isInteger(query.leftPrefixIndex) ? query.leftPrefixIndex : left;
    const queryPhase = String(query.phase || "subtract");
    const phaseRank = { "select-range": 0, "right-prefix": 1, "left-prefix": 2, subtract: 3 }[queryPhase] ?? 3;
    const rightReady = phaseRank >= 1;
    const leftReady = phaseRank >= 2;
    const answerReady = phaseRank >= 3 && Number.isInteger(query.answer);
    const rightPrefixValue = rightReady ? (query.rightPrefixValue ?? prefix[rightPrefixIndex]) : "?";
    const leftPrefixValue = leftReady ? (query.leftPrefixValue ?? prefix[leftPrefixIndex]) : "?";
    const included = Array.isArray(query.included) ? query.included : nums.slice(left, right + 1);
    const excludedLeft = Array.isArray(query.excludedLeft) ? query.excludedLeft : nums.slice(0, left);
    const proofTitle = queryPhase === "select-range"
      ? (lang === "vi" ? `Chọn đoạn nums[${left}..${right}]` : `Select range nums[${left}..${right}]`)
      : queryPhase === "right-prefix"
        ? (lang === "vi" ? "Bước 1 · Lấy tổng đến right" : "Step 1 · Read the sum through right")
        : queryPhase === "left-prefix"
          ? (lang === "vi" ? "Bước 2 · Lấy phần trước left" : "Step 2 · Read the part before left")
          : (lang === "vi" ? "Bước 3 · Trừ để giữ lại range" : "Step 3 · Subtract to isolate the range");
    proofHtml = `<div class="prefix1d-proof phase-${escapeHtml(queryPhase)}">
      <div class="prefix1d-proof-title">${escapeHtml(proofTitle)}</div>
      <div class="prefix1d-formula">
        <span class="take${queryPhase === "right-prefix" ? " is-active" : ""}"><small>prefix[${escapeHtml(String(rightPrefixIndex))}]</small><b>${escapeHtml(String(rightPrefixValue))}</b></span>
        <strong>-</strong>
        <span class="drop${queryPhase === "left-prefix" ? " is-active" : ""}"><small>prefix[${escapeHtml(String(leftPrefixIndex))}]</small><b>${escapeHtml(String(leftPrefixValue))}</b></span>
        <strong>=</strong>
        <span class="answer${queryPhase === "subtract" ? " is-active" : ""}"><small>sumRange(${escapeHtml(String(left))}, ${escapeHtml(String(right))})</small><b>${answerReady ? escapeHtml(String(query.answer)) : "?"}</b></span>
      </div>
      <div class="prefix1d-proof-detail">
        <span class="${rightReady ? "is-ready" : ""}">${rightReady ? "✓ " : "○ "}${escapeHtml(lang === "vi" ? "prefix[right+1] chứa:" : "prefix[right+1] contains:")} [${escapeHtml(nums.slice(0, right + 1).join(", "))}]</span>
        <span class="${leftReady ? "is-ready" : ""}">${leftReady ? "✓ " : "○ "}${escapeHtml(lang === "vi" ? "trừ phần trước left:" : "subtract before left:")} [${escapeHtml(excludedLeft.join(", ") || "∅")}]</span>
        <span class="${answerReady ? "is-ready" : ""}">${answerReady ? "✓ " : "○ "}${escapeHtml(lang === "vi" ? "còn lại đoạn query:" : "remaining query range:")} [${escapeHtml(included.join(", "))}]</span>
      </div>
    </div>`;
  }

  $("treeView").innerHTML = `
    <div class="prefix1d-viz${isRangeSumImmutable ? " range-sum-query" : ""}">
      <div>
        <div class="prefix1d-heading">nums</div>
        <div class="prefix1d-row">${numsCells}</div>
      </div>
      <div>
        <div class="prefix1d-heading">prefix</div>
        <div class="prefix1d-row prefix-row">${prefixCells}</div>
      </div>
      ${proofHtml}
      <div class="prefix1d-status">${statusItems}</div>
    </div>`;
}

function renderRangeFrequencyView(step) {
  const view = step.rangeFrequencyView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const entries = Array.isArray(view.entries) ? view.entries : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const query = view.query || {};
  const left = Number.isInteger(query.left) ? query.left : -1;
  const right = Number.isInteger(query.right) ? query.right : -1;
  const value = query.value;
  const current = Number.isInteger(view.current) ? view.current : -1;
  const activeValue = view.activeValue;
  const queryPositions = new Set(Array.isArray(view.queryPositions) ? view.queryPositions : []);
  const activeEntry = entries.find((entry) => entry.value === activeValue)
    || entries.find((entry) => entry.value === value)
    || null;
  const activeIndices = activeEntry && Array.isArray(activeEntry.indices) ? activeEntry.indices : [];
  const lo = Number.isInteger(view.lo) ? view.lo : null;
  const hi = Number.isInteger(view.hi) ? view.hi : null;
  const mid = Number.isInteger(view.mid) ? view.mid : null;
  const leftPos = Number.isInteger(view.leftPos) ? view.leftPos : null;
  const rightPos = Number.isInteger(view.rightPos) ? view.rightPos : null;

  const numCells = nums.map((num, index) => {
    const inRange = left >= 0 && index >= left && index <= right;
    const isTarget = num === value;
    const isAnswer = queryPositions.has(index);
    const classes = ["rfq-num"];
    if (index === current) classes.push("current");
    if (inRange) classes.push("in-range");
    if (isTarget) classes.push("target");
    if (isAnswer) classes.push("answer");
    return `<div class="${classes.join(" ")}">
      <span>[${index}]</span>
      <strong>${escapeHtml(String(num))}</strong>
      ${isAnswer ? `<small>${escapeHtml(lang === "vi" ? "đếm" : "count")}</small>` : ""}
    </div>`;
  }).join("");

  const entryRows = entries.length
    ? entries.map((entry) => {
      const isActive = entry.value === activeValue || entry.value === value;
      const indexChips = (Array.isArray(entry.indices) ? entry.indices : []).map((index) => {
        const isQueryHit = entry.value === value && index >= left && index <= right;
        return `<span class="${isQueryHit ? "hit" : ""}">${escapeHtml(String(index))}</span>`;
      }).join("");
      return `<div class="rfq-entry${isActive ? " active" : ""}">
        <strong>${escapeHtml(String(entry.value))}</strong>
        <div>${indexChips || "<span>∅</span>"}</div>
      </div>`;
    }).join("")
    : `<div class="rfq-empty">${escapeHtml(lang === "vi" ? "Chưa có index nào" : "No indices yet")}</div>`;

  const indexCells = activeIndices.length
    ? activeIndices.map((index, pos) => {
      const inWindow = lo !== null && hi !== null && pos >= lo && pos < hi;
      const inAnswerSlice = leftPos !== null && rightPos !== null && pos >= leftPos && pos < rightPos;
      const classes = ["rfq-index"];
      if (pos === mid) classes.push("mid");
      if (inWindow) classes.push("window");
      if (inAnswerSlice) classes.push("answer");
      return `<div class="${classes.join(" ")}">
        <span>pos ${pos}</span>
        <strong>${escapeHtml(String(index))}</strong>
        ${pos === mid ? "<small>mid</small>" : ""}
      </div>`;
    }).join("")
    : `<div class="rfq-empty">${escapeHtml(lang === "vi" ? "Value này không xuất hiện" : "This value does not appear")}</div>`;

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  const formulaHtml = Number.isInteger(view.answer)
    ? `<div class="rfq-formula">
        <span><small>bisect_right</small><b>${escapeHtml(String(rightPos ?? "-"))}</b></span>
        <strong>-</strong>
        <span><small>bisect_left</small><b>${escapeHtml(String(leftPos ?? "-"))}</b></span>
        <strong>=</strong>
        <span class="answer"><small>frequency</small><b>${escapeHtml(String(view.answer))}</b></span>
      </div>`
    : "";

  $("treeView").innerHTML = `
    <div class="rfq-viz">
      <div class="rfq-query">
        <span><small>left</small><b>${escapeHtml(String(left))}</b></span>
        <span><small>right</small><b>${escapeHtml(String(right))}</b></span>
        <span><small>value</small><b>${escapeHtml(String(value))}</b></span>
      </div>
      <section>
        <div class="rfq-heading">arr</div>
        <div class="rfq-num-row">${numCells}</div>
      </section>
      <section>
        <div class="rfq-heading">value → sorted indices</div>
        <div class="rfq-map">${entryRows}</div>
      </section>
      <section>
        <div class="rfq-heading">${escapeHtml(lang === "vi" ? "Binary search trên list của value" : "Binary search on value's index list")}</div>
        <div class="rfq-index-row">${indexCells}</div>
      </section>
      ${formulaHtml}
      <div class="rfq-status">${statusItems}</div>
    </div>`;
}

function renderBookMyShowView(step) {
  const view = step.bookMyShowView || {};
  const n = Number.isInteger(view.n) ? view.n : 0;
  const m = Number.isInteger(view.m) ? view.m : 0;
  const used = Array.isArray(view.used) ? view.used : [];
  const remaining = Array.isArray(view.remaining) ? view.remaining : [];
  const treeNodes = Array.isArray(view.treeNodes) ? view.treeNodes : [];
  const operations = Array.isArray(view.operations) ? view.operations : [];
  const operationIndex = Number.isInteger(view.operationIndex) ? view.operationIndex : -1;
  const activeRows = new Set(Array.isArray(view.activeRows) ? view.activeRows : []);
  const allocation = Array.isArray(view.allocation) ? view.allocation : [];
  const outputs = Array.isArray(view.outputs) ? view.outputs : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const phase = view.phase || "init";
  const operation = view.operation || null;

  const allocationCovers = (row, seat) => allocation.some((item) => (
    item && item.row === row && seat >= item.start && seat < item.start + item.count
  ));

  const rowsHtml = Array.from({ length: n }, (_, row) => {
    const seats = Array.from({ length: m }, (_, seat) => {
      const booked = seat < (used[row] || 0);
      const allocated = allocationCovers(row, seat);
      const classes = ["bms-seat"];
      if (booked) classes.push("booked");
      if (allocated) classes.push("allocated");
      return `<span class="${classes.join(" ")}" title="row ${row}, seat ${seat}">${seat}</span>`;
    }).join("");
    return `<div class="bms-row${activeRows.has(row) ? " active" : ""}">
      <div class="bms-row-label">
        <strong>row ${row}</strong>
        <span>${escapeHtml(String(remaining[row] ?? 0))}/${escapeHtml(String(m))} ${escapeHtml(lang === "vi" ? "trống" : "free")}</span>
      </div>
      <div class="bms-seats">${seats}</div>
    </div>`;
  }).join("");

  const levels = new Map();
  treeNodes.forEach((node) => {
    const depth = Number.isInteger(node.depth) ? node.depth : 0;
    if (!levels.has(depth)) levels.set(depth, []);
    levels.get(depth).push(node);
  });
  const treeHtml = [...levels.entries()].sort((a, b) => a[0] - b[0]).map(([depth, nodes]) => {
    const cells = nodes.sort((a, b) => a.left - b.left).map((node) => `<div class="bms-tree-node${node.active ? " active" : ""}">
      <span>[${escapeHtml(String(node.left))}..${escapeHtml(String(node.right))}]</span>
      <strong>max ${escapeHtml(String(node.max))}</strong>
      <small>sum ${escapeHtml(String(node.sum))}</small>
    </div>`).join("");
    return `<div class="bms-tree-level" style="--bms-tree-cols:${Math.max(1, nodes.length)}">
      <span class="bms-tree-depth">L${depth}</span>
      <div>${cells}</div>
    </div>`;
  }).join("");

  const operationsHtml = operations.length
    ? operations.map((item, index) => `<span class="${index === operationIndex ? "active" : index < operationIndex ? "done" : ""}">${escapeHtml(String(item))}</span>`).join("")
    : `<span>${escapeHtml(lang === "vi" ? "Không có operation" : "No operations")}</span>`;

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  const resultText = view.result === null || view.result === undefined
    ? "-"
    : Array.isArray(view.result)
      ? `[${view.result.join(", ")}]`
      : String(view.result);
  const outputsHtml = outputs.length
    ? outputs.map((item) => `<span>${escapeHtml(Array.isArray(item) ? `[${item.join(", ")}]` : String(item))}</span>`).join("")
    : `<span>[]</span>`;
  const opText = operation
    ? `${operation.op}(${operation.k}, ${operation.maxRow})`
    : (lang === "vi" ? "khởi tạo" : "initialize");

  $("treeView").innerHTML = `
    <div class="bms-viz phase-${escapeHtml(phase)}">
      <div class="bms-topline">
        <span>${escapeHtml(opText)}</span>
        <strong>${escapeHtml(lang === "vi" ? "Kết quả hiện tại" : "Current result")}: ${escapeHtml(resultText)}</strong>
      </div>
      <div class="bms-operations">${operationsHtml}</div>
      <section>
        <div class="bms-heading">${escapeHtml(lang === "vi" ? "Hàng ghế" : "Seat rows")}</div>
        <div class="bms-rows">${rowsHtml}</div>
      </section>
      <section>
        <div class="bms-heading">Segment Tree · max / sum remaining</div>
        <div class="bms-tree">${treeHtml}</div>
      </section>
      <div class="bms-status">${statusItems}</div>
      <div class="bms-output"><small>outputs</small><div>${outputsHtml}</div></div>
    </div>`;
}

function renderFallingSquaresView(step) {
  const view = step.fallingSquaresView || {};
  const vi = lang === "vi";
  const positions = Array.isArray(view.positions) ? view.positions : [];
  const coords = Array.isArray(view.coords) ? view.coords : [];
  const segments = Array.isArray(view.segments) ? view.segments : [];
  const treeNodes = Array.isArray(view.treeNodes) ? view.treeNodes : [];
  const outputs = Array.isArray(view.outputs) ? view.outputs : [];
  const queryVisited = new Set(Array.isArray(view.queryVisited) ? view.queryVisited : []);
  const updateVisited = new Set(Array.isArray(view.updateVisited) ? view.updateVisited : []);
  const currentSquare = Number.isInteger(view.currentSquare) ? view.currentSquare : -1;
  const queryLeft = Number.isInteger(view.queryLeft) ? view.queryLeft : -1;
  const queryRight = Number.isInteger(view.queryRight) ? view.queryRight : -1;
  const activeNode = Number.isInteger(view.activeNode) ? view.activeNode : null;
  const phase = String(view.phase || "compress");
  const phaseIndex = ["compress", "map", "segments", "tree-init", "ready"].includes(phase) ? 0
    : ["square", "map-square"].includes(phase) ? 1
      : phase.startsWith("query") || phase === "push-lazy" && view.operation === "query" ? 2
        : phase === "calculate" ? 3
          : phase.startsWith("update") || ["push-lazy", "landed"].includes(phase) ? 4 : 5;
  const phaseLabels = vi
    ? ["1 · Nén tọa độ", "2 · Square rơi", "3 · Query nền", "4 · Tính top", "5 · Lazy assign", "6 · Maximum"]
    : ["1 · Compress", "2 · Drop square", "3 · Query base", "4 · Compute top", "5 · Lazy assign", "6 · Maximum"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}">${index < phaseIndex ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`).join("");

  const positionsHtml = positions.map((item, index) => {
    const classes = ["fs699-position"];
    if (index < currentSquare || phase === "done") classes.push("processed");
    if (index === currentSquare) classes.push("current");
    const right = Number(item[0]) + Number(item[1]);
    return `<span class="${classes.join(" ")}"><small>#${index}</small><strong>[${escapeHtml(String(item[0]))}, ${escapeHtml(String(item[1]))}]</strong><em>[${escapeHtml(String(item[0]))}, ${escapeHtml(String(right))})</em></span>`;
  }).join("");
  const maxHeight = Math.max(1, ...segments.map((segment) => Number(segment.height) || 0), Number(view.newHeight) || 0, ...outputs.map(Number));
  const segmentsHtml = segments.map((segment, index) => {
    const active = queryLeft >= 0 && index >= queryLeft && index <= queryRight;
    const height = Number(segment.height) || 0;
    const pct = height > 0 ? Math.max(8, (height / maxHeight) * 100) : 0;
    return `<div class="fs699-segment${active ? " footprint" : ""}" style="--fs699-height:${pct}%">
      <div class="fs699-column">${height > 0 ? `<strong>${escapeHtml(String(height))}</strong>` : ""}</div>
      <span>[${escapeHtml(String(segment.left))},${escapeHtml(String(segment.right))})</span>
      <small>s${index}</small>
    </div>`;
  }).join("");
  const edgeHtml = coords.map((coord, index) => `<span><small>c${index}</small><strong>${escapeHtml(String(coord))}</strong></span>`).join("");

  const levels = new Map();
  for (const node of treeNodes) {
    if (!levels.has(node.depth)) levels.set(node.depth, []);
    levels.get(node.depth).push(node);
  }
  const treeHtml = [...levels.entries()].map(([depth, nodes]) => `<div class="fs699-tree-level"><small>L${depth}</small><div>${nodes.map((node) => {
    const classes = ["fs699-node"];
    if (queryVisited.has(node.node)) classes.push("query");
    if (updateVisited.has(node.node)) classes.push("update");
    if (node.node === activeNode) classes.push("active");
    if (node.lazy !== null && node.lazy !== undefined) classes.push("lazy");
    return `<span class="${classes.join(" ")}"><small>node ${node.node} · s${node.start}..s${node.end}</small><strong>${escapeHtml(String(node.value))}</strong><em>[${escapeHtml(String(node.xLeft))},${escapeHtml(String(node.xRight))})</em><i>lazy ${node.lazy === null || node.lazy === undefined ? "—" : escapeHtml(String(node.lazy))}</i></span>`;
  }).join("")}</div></div>`).join("");

  const square = currentSquare >= 0 ? positions[currentSquare] : null;
  const squareSize = square ? Number(square[1]) : 0;
  const globalMax = outputs.length ? outputs[outputs.length - 1] : (treeNodes[0]?.value ?? 0);
  let actionLabel = vi ? "CHUẨN BỊ" : "PREPARE";
  let actionMain = vi ? "Nén cạnh thành ground segments" : "Compress edges into ground segments";
  let actionDetail = coords.length ? `[${coords.join(", ")}]` : "—";
  if (["square", "map-square"].includes(phase)) {
    actionLabel = vi ? "SQUARE ĐANG RƠI" : "DROPPING SQUARE";
    actionMain = square ? `[${square[0]}, ${Number(square[0]) + squareSize}) · size ${squareSize}` : "—";
    actionDetail = queryLeft >= 0 ? `segments ${queryLeft}..${queryRight}` : (vi ? "đang ánh xạ footprint" : "mapping footprint");
  } else if (phase.startsWith("query") || phase === "push-lazy" && view.operation === "query") {
    actionLabel = "RANGE MAX QUERY";
    actionMain = `max(s${queryLeft}..s${queryRight}) = ${view.returnedValue ?? view.baseHeight ?? 0}`;
    actionDetail = vi ? "chiều cao nền là vật cản cao nhất" : "the base is the tallest obstacle";
  } else if (phase === "calculate") {
    actionLabel = "NEW TOP";
    actionMain = `${view.baseHeight ?? 0} + ${squareSize} = ${view.newHeight ?? 0}`;
    actionDetail = vi ? "base + cạnh square" : "base + square size";
  } else if (phase.startsWith("update") || ["push-lazy", "landed"].includes(phase)) {
    actionLabel = "RANGE ASSIGN";
    actionMain = `s${queryLeft}..s${queryRight} = ${view.newHeight ?? 0}`;
    actionDetail = vi ? "assignment, không phải cộng" : "assignment, not addition";
  } else if (["output", "done"].includes(phase)) {
    actionLabel = phase === "done" ? "RETURN" : "GLOBAL MAX";
    actionMain = phase === "done" ? `[${outputs.join(", ")}]` : String(globalMax);
    actionDetail = phase === "done" ? (vi ? "maximum sau mỗi lần rơi" : "maximum after every drop") : "tree[1]";
  }
  const outputsHtml = outputs.length ? outputs.map((value, index) => `<span><small>#${index}</small><strong>${escapeHtml(String(value))}</strong></span>`).join("") : `<em>—</em>`;

  $("treeView").innerHTML = `<div class="fs699-viz phase-${escapeHtml(phase)}">
    <div class="fs699-phases">${phases}</div>
    <section class="fs699-section"><header><strong>POSITIONS · [LEFT, SIZE]</strong><span>${vi ? "interval thật dùng dạng [left, right)" : "physical interval is [left, right)"}</span></header><div class="fs699-positions">${positionsHtml}</div></section>
    <div class="fs699-edges"><small>COMPRESSED EDGES</small><div>${edgeHtml || "—"}</div></div>
    <section class="fs699-section"><header><strong>SKYLINE · GROUND SEGMENTS</strong><span>${vi ? "viền vàng = footprint hiện tại" : "yellow border = current footprint"}</span></header><div class="fs699-skyline" style="--fs699-cols:${Math.max(1, segments.length)}">${segmentsHtml || "—"}</div></section>
    <div class="fs699-action"><small>${escapeHtml(actionLabel)}</small><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="fs699-metrics"><span><small>base</small><strong>${escapeHtml(String(view.baseHeight ?? 0))}</strong></span><span><small>size</small><strong>${square ? escapeHtml(String(squareSize)) : "—"}</strong></span><span><small>new top</small><strong>${escapeHtml(String(view.newHeight ?? 0))}</strong></span><span class="max"><small>global max</small><strong>${escapeHtml(String(globalMax))}</strong></span></div>
    <section class="fs699-section"><header><strong>LAZY SEGMENT TREE · RANGE MAX + RANGE ASSIGN</strong><span>${vi ? "xanh = query · cam = update · chấm tím = lazy" : "green = query · orange = update · purple = lazy"}</span></header><div class="fs699-tree">${treeHtml || "—"}</div></section>
    <div class="fs699-bottom"><div class="fs699-outputs"><small>ANSWER</small><div>${outputsHtml}</div></div><code>base = range_max(footprint) · top = base + size · assign(footprint, top)</code></div>
  </div>`;
}

function renderCalendarThreeView(step) {
  const view = step.calendarThreeView || {};
  const vi = lang === "vi";
  const bookings = Array.isArray(view.bookings) ? view.bookings : [];
  const outputs = Array.isArray(view.outputs) ? view.outputs : [];
  const segments = Array.isArray(view.segments) ? view.segments : [];
  const treeNodes = Array.isArray(view.treeNodes) ? view.treeNodes : [];
  const visited = new Set(Array.isArray(view.visitedNodes) ? view.visitedNodes : []);
  const covered = new Set(Array.isArray(view.coveredNodes) ? view.coveredNodes : []);
  const pulled = new Set(Array.isArray(view.pulledNodes) ? view.pulledNodes : []);
  const current = Number.isInteger(view.currentBooking) ? view.currentBooking : -1;
  const activeNode = Number.isInteger(view.activeNode) ? view.activeNode : null;
  const phase = String(view.phase || "init");
  const phaseIndex = phase === "init" ? 0
    : ["booking", "visit", "split", "skip"].includes(phase) ? 1
      : ["cover", "pull"].includes(phase) ? 2 : 3;
  const phaseLabels = vi
    ? ["1 · Dynamic Tree", "2 · Đi xuống range", "3 · Lazy + Pull", "4 · Root answer"]
    : ["1 · Dynamic tree", "2 · Descend range", "3 · Lazy + pull", "4 · Root answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}">${index < phaseIndex ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`).join("");

  const bookingHtml = bookings.map(([start, end], index) => {
    const classes = ["cal732-booking"];
    if (index < outputs.length) classes.push("processed");
    if (index === current) classes.push("current");
    return `<span class="${classes.join(" ")}"><small>book #${index + 1}</small><strong>[${escapeHtml(String(start))}, ${escapeHtml(String(end))})</strong><em>${index < outputs.length ? `max = ${outputs[index]}` : index === current ? "updating" : "waiting"}</em></span>`;
  }).join("");
  const maxCount = Math.max(1, ...segments.map((item) => Number(item.count) || 0));
  const timelineHtml = segments.map((item) => {
    const classes = ["cal732-segment"];
    if (item.current && current >= outputs.length) classes.push("current");
    if (item.count === maxCount && item.count > 0) classes.push("peak");
    const height = Math.max(8, (Number(item.count) || 0) / maxCount * 92);
    const grow = Math.max(1, Math.min(10, Number(item.right) - Number(item.left)));
    return `<span class="${classes.join(" ")}" style="--cal732-height:${height}%;--cal732-grow:${grow}"><b>${escapeHtml(String(item.count))}</b><i></i><small>[${escapeHtml(String(item.left))},${escapeHtml(String(item.right))})</small></span>`;
  }).join("");

  const nodeCandidates = treeNodes.filter((item) => item.depth <= 3 || visited.has(item.node) || item.node === 1);
  const rootNode = nodeCandidates.find((item) => item.node === 1);
  const visibleNodes = nodeCandidates.length <= 70
    ? nodeCandidates
    : [rootNode, ...nodeCandidates.filter((item) => item.node !== 1).slice(-69)].filter(Boolean);
  const treeHtml = visibleNodes.map((item) => {
    const classes = ["cal732-node"];
    if (visited.has(item.node)) classes.push("visited");
    if (covered.has(item.node)) classes.push("covered");
    if (pulled.has(item.node)) classes.push("pulled");
    if (item.node === activeNode) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>d${item.depth} · node ${item.node}</small><strong>${escapeHtml(String(item.value))}</strong><em>[${escapeHtml(String(item.start))}, ${escapeHtml(String(item.end))}]</em><i>lazy ${escapeHtml(String(item.lazy))}</i></span>`;
  }).join("");
  const currentBooking = current >= 0 ? bookings[current] : null;
  const rootValue = treeNodes.find((item) => item.node === 1)?.value || 0;
  let actionLabel = vi ? "KHỞI TẠO" : "INITIALIZE";
  let actionMain = "domain = [0, 10^9 - 1]";
  let actionDetail = vi ? "Chỉ tạo node khi update chạm tới" : "Materialize nodes only when touched";
  if (phase === "booking" && currentBooking) {
    actionLabel = `BOOK #${current + 1}`;
    actionMain = `[${currentBooking[0]}, ${currentBooking[1]}) -> [${view.queryLeft}, ${view.queryRight}]`;
    actionDetail = vi ? "end - 1 giữ đúng interval nửa mở" : "end - 1 preserves half-open semantics";
  } else if (["visit", "split", "skip"].includes(phase)) {
    actionLabel = phase === "skip" ? (vi ? "BỎ QUA" : "SKIP") : (vi ? "ĐI XUỐNG" : "DESCEND");
    actionMain = activeNode === null ? "—" : `node ${activeNode}`;
    actionDetail = vi ? "Chỉ đi vào các đoạn giao với booking" : "Visit only ranges overlapping the booking";
  } else if (phase === "cover") {
    actionLabel = "LAZY +1";
    actionMain = activeNode === null ? "—" : `node ${activeNode}`;
    actionDetail = vi ? "Đoạn được phủ hoàn toàn, dừng đệ quy" : "Fully covered range; stop descending";
  } else if (phase === "pull") {
    actionLabel = "PULL";
    actionMain = activeNode === null ? "—" : `tree[${activeNode}]`;
    actionDetail = "lazy + max(left, right)";
  } else if (phase === "output" || phase === "done") {
    actionLabel = phase === "done" ? "DONE" : "RETURN";
    actionMain = String(rootValue);
    actionDetail = vi ? "maximum overlap tại root" : "maximum overlap at the root";
  }
  const outputsHtml = outputs.length
    ? outputs.map((value, index) => `<span><small>#${index + 1}</small><strong>${escapeHtml(String(value))}</strong></span>`).join("")
    : `<em>${vi ? "chưa có kết quả" : "no result yet"}</em>`;

  $("treeView").innerHTML = `<div class="cal732-viz phase-${escapeHtml(phase)}">
    <div class="cal732-phases">${phases}</div>
    <section class="cal732-section"><header><strong>BOOKINGS · HALF-OPEN INTERVALS</strong><span>${vi ? "viền vàng = booking hiện tại" : "yellow border = current booking"}</span></header><div class="cal732-scroll"><div class="cal732-bookings">${bookingHtml}</div></div></section>
    <section class="cal732-section"><header><strong>CALENDAR OVERLAP TIMELINE</strong><span>${vi ? "cột cao nhất = overlap toàn cục" : "tallest column = global overlap"}</span></header><div class="cal732-timeline">${timelineHtml || "—"}</div></section>
    <div class="cal732-action"><small>${escapeHtml(actionLabel)}</small><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="cal732-metrics"><span><small>${vi ? "ĐÃ BOOK" : "BOOKED"}</small><strong>${outputs.length}</strong></span><span><small>${vi ? "NODE ĐÃ TẠO" : "MATERIALIZED"}</small><strong>${treeNodes.length}</strong></span><span class="max"><small>ROOT MAX</small><strong>${escapeHtml(String(rootValue))}</strong></span></div>
    <section class="cal732-section"><header><strong>DYNAMIC SEGMENT TREE · CURRENT UPDATE TRACE</strong><span>${vi ? "xanh = cover · tím = pull · cam = active" : "green = cover · purple = pull · orange = active"}</span></header><div class="cal732-tree">${treeHtml || "—"}</div></section>
    <div class="cal732-bottom"><div class="cal732-outputs"><small>RETURN VALUES</small><div>${outputsHtml}</div></div><code>tree[node] = lazy[node] + max(left, right)</code></div>
  </div>`;
}

function renderReversePairsView(step) {
  const view = step.reversePairsView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const working = Array.isArray(view.working) ? view.working : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const validPositions = new Set(Array.isArray(view.validPositions) ? view.validPositions : []);
  const range = view.range || {};
  const start = Number.isInteger(range.start) ? range.start : -1;
  const mid = Number.isInteger(range.mid) ? range.mid : -1;
  const end = Number.isInteger(range.end) ? range.end : -1;
  const leftPos = Number.isInteger(view.leftPos) ? view.leftPos : -1;
  const rightCursor = Number.isInteger(view.rightCursor) ? view.rightCursor : null;
  const phase = String(view.phase || "start");
  const phaseIndex = ["start", "divide", "base"].includes(phase) ? 0
    : ["count", "compare-valid", "move-right", "count-add"].includes(phase) ? 1
      : ["merge", "return"].includes(phase) ? 2 : 3;
  const phaseLabels = vi
    ? ["1 · Chia theo index", "2 · Đếm pair chéo", "3 · Merge theo value", "4 · Kết quả"]
    : ["1 · Divide by index", "2 · Count cross pairs", "3 · Merge by value", "4 · Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}">${index < phaseIndex ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`).join("");

  const originalHtml = nums.map((value, index) => `<span class="rp493-original"><small>i=${index}</small><strong>${escapeHtml(String(value))}</strong></span>`).join("");
  const workingHtml = working.map((item, position) => {
    const classes = ["rp493-work"];
    if (position >= start && position < mid) classes.push("left-half");
    if (position >= mid && position < end) classes.push("right-half");
    if (position === leftPos) classes.push("left-current");
    if (validPositions.has(position)) classes.push("valid");
    if (position === rightCursor) classes.push("right-cursor");
    if (view.mergedRange && position >= view.mergedRange.start && position < view.mergedRange.end) classes.push("merged");
    const marker = position === leftPos ? "L" : position === rightCursor ? "R" : validPositions.has(position) ? "✓" : "";
    return `<span class="${classes.join(" ")}"><small>pos ${position}</small><strong>${escapeHtml(String(item.value))}</strong><em>original i=${item.originalIndex}</em><i>${marker}</i></span>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((frame, index) => `<span class="${index === stack.length - 1 ? "active" : ""}"><small>d${frame.depth}</small><strong>[${frame.start}, ${frame.end})</strong></span>`).join("")
    : `<span><strong>—</strong></span>`;

  const leftItem = leftPos >= 0 ? working[leftPos] : null;
  const rightItem = rightCursor !== null && rightCursor >= 0 && rightCursor < end ? working[rightCursor] : null;
  let actionLabel = vi ? "MỤC TIÊU" : "GOAL";
  let actionMain = "nums[i] > 2 × nums[j]";
  let actionDetail = vi ? "đồng thời original i < original j" : "while original i < original j";
  if (leftItem && rightItem) {
    const valid = leftItem.value > 2 * rightItem.value;
    actionLabel = valid ? (vi ? "PAIR HỢP LỆ" : "VALID PAIR") : (vi ? "DỪNG CON TRỎ" : "STOP POINTER");
    actionMain = `${leftItem.value} ${valid ? ">" : "≤"} 2 × ${rightItem.value} = ${2 * rightItem.value}`;
    actionDetail = valid
      ? `${vi ? "original pair" : "original pair"} (${leftItem.originalIndex}, ${rightItem.originalIndex})`
      : (vi ? "các right value phía sau còn lớn hơn" : "later right values are even larger");
  } else if (leftItem && rightCursor !== null && rightCursor >= end) {
    actionLabel = vi ? "HẾT NỬA PHẢI" : "RIGHT END";
    actionMain = `right = ${rightCursor} = end`;
    actionDetail = vi ? "mọi right value trong cửa sổ đều hợp lệ" : "every right value in the window is valid";
  } else if (phase === "merge") {
    actionLabel = "MERGE";
    actionMain = `[${working.slice(start, end).map((item) => item.value).join(", ")}]`;
    actionDetail = vi ? "đã sort để cấp cha dùng two pointers" : "sorted for the parent two-pointer scan";
  } else if (phase === "done") {
    actionLabel = "RETURN";
    actionMain = String(view.rangeCount ?? 0);
    actionDetail = vi ? "reverse pairs" : "reverse pairs";
  }
  const doubledRight = rightItem ? 2 * rightItem.value : null;

  $("treeView").innerHTML = `<div class="rp493-viz phase-${escapeHtml(phase)}">
    <div class="rp493-phases">${phases}</div>
    <section class="rp493-section"><header><strong>ORIGINAL NUMS · ${vi ? "INDEX KHÔNG THAY ĐỔI" : "INDEX NEVER CHANGES"}</strong><span>i &lt; j</span></header><div class="rp493-scroll"><div class="rp493-row">${originalHtml}</div></div></section>
    <div class="rp493-recursion"><div><small>RECURSION STACK</small><span>${stackHtml}</span></div><strong>${start >= 0 ? `[${start}, ${mid >= 0 ? mid : "?"}) | [${mid >= 0 ? mid : "?"}, ${end})` : "—"}</strong></div>
    <section class="rp493-section"><header><strong>WORKING ARRAY · SORTED INSIDE COMPLETED HALVES</strong><span>${vi ? "xanh = left · tím = right · lục = pair hợp lệ" : "blue = left · purple = right · green = valid pair"}</span></header><div class="rp493-scroll"><div class="rp493-row">${workingHtml || "—"}</div></div></section>
    <div class="rp493-action"><small>${escapeHtml(actionLabel)}</small><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="rp493-metrics"><span><small>left value</small><strong>${leftItem ? escapeHtml(String(leftItem.value)) : "—"}</strong></span><span><small>2 × right</small><strong>${doubledRight === null ? "—" : escapeHtml(String(doubledRight))}</strong></span><span><small>right − mid</small><strong>${escapeHtml(String(view.lastAdded ?? 0))}</strong></span><span class="count"><small>${vi ? "COUNT ĐOẠN" : "RANGE COUNT"}</small><strong>${escapeHtml(String(view.rangeCount ?? 0))}</strong></span></div>
    <div class="rp493-rule"><code>left.value &gt; 2 × right.value</code><span>${vi ? "right chỉ tiến → mỗi merge level O(n)" : "right only moves forward → O(n) per merge level"}</span></div>
  </div>`;
}

function renderReversePairsSegmentTreeView(step) {
  const view = step.reversePairsSegmentTreeView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const values = Array.isArray(view.values) ? view.values : [];
  const tree = Array.isArray(view.tree) ? view.tree : [];
  const ranges = Array.isArray(view.treeRanges) ? view.treeRanges : [];
  const queryPath = new Set(Array.isArray(view.queryPath) ? view.queryPath : []);
  const coveredNodes = new Set(Array.isArray(view.coveredNodes) ? view.coveredNodes : []);
  const updatePath = new Set(Array.isArray(view.updatePath) ? view.updatePath : []);
  const current = Number.isInteger(view.currentIndex) ? view.currentIndex : -1;
  const queryLeft = Number.isInteger(view.queryLeft) ? view.queryLeft : null;
  const phase = String(view.phase || "compress");
  const phaseIndex = ["compress", "init"].includes(phase) ? 0
    : phase === "done" ? 3
      : ["scan", "bounds"].includes(phase) ? 1 : 2;
  const labels = vi
    ? ["1 · Nén tọa độ", "2 · Quét trái -> phải", "3 · Query + Update", "4 · Kết quả"]
    : ["1 · Compress", "2 · Scan left -> right", "3 · Query + Update", "4 · Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}">${index < phaseIndex ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`).join("");

  const numsHtml = nums.map((value, index) => {
    const classes = ["rp493st-num"];
    if (index < current || phase === "done") classes.push("stored");
    if (index === current) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>i=${index}</small><strong>${escapeHtml(String(value))}</strong><em>${index < current || phase === "done" ? "in tree" : index === current ? "current j" : "waiting"}</em></span>`;
  }).join("");
  const ranksHtml = values.map((value, index) => {
    const classes = ["rp493st-rank"];
    if (queryLeft !== null && index >= queryLeft) classes.push("inside");
    if (current >= 0 && value === nums[current]) classes.push("current");
    return `<span class="${classes.join(" ")}"><small>rank ${index}</small><strong>${escapeHtml(String(value))}</strong></span>`;
  }).join("");

  const depths = new Map();
  ranges.forEach((item) => {
    if (!depths.has(item.depth)) depths.set(item.depth, []);
    depths.get(item.depth).push(item);
  });
  const treeHtml = [...depths.entries()].sort((a, b) => a[0] - b[0]).map(([depth, nodes]) => {
    const nodesHtml = nodes.map((item) => {
      const classes = ["rp493st-node"];
      if (queryPath.has(item.node)) classes.push("visited");
      if (coveredNodes.has(item.node)) classes.push("covered");
      if (updatePath.has(item.node)) classes.push("updated");
      return `<span class="${classes.join(" ")}"><small>node ${item.node} · r${item.start}..r${item.end}</small><strong>${escapeHtml(String(tree[item.node] || 0))}</strong><em>${escapeHtml(`${values[item.start]}..${values[item.end]}`)}</em></span>`;
    }).join("");
    return `<div class="rp493st-level"><b>L${depth}</b><div>${nodesHtml}</div></div>`;
  }).join("");

  const currentValue = current >= 0 ? nums[current] : null;
  let actionLabel = vi ? "CHUẨN BỊ" : "PREPARE";
  let actionMain = vi ? "Nén value thành rank tăng dần" : "Compress values into increasing ranks";
  let actionDetail = vi ? "Cây lưu frequency của các index đã đi qua" : "The tree stores frequencies from earlier indices";
  if (phase === "scan") {
    actionLabel = vi ? `XÉT j=${current}` : `PROCESS j=${current}`;
    actionMain = `nums[j] = ${currentValue}`;
    actionDetail = vi ? `${current} value trước đó đang ở trong cây` : `${current} earlier values are in the tree`;
  } else if (phase === "bounds") {
    actionLabel = "BISECT_RIGHT";
    actionMain = `${vi ? "tìm value" : "find values"} > 2 * ${currentValue} = ${view.threshold}`;
    actionDetail = queryLeft === null ? "—" : `query ranks [${queryLeft}, ${Math.max(0, values.length - 1)}]`;
  } else if (phase === "query") {
    actionLabel = "QUERY";
    actionMain = `frequency = ${view.found || 0}`;
    actionDetail = vi ? "Node xanh lá nằm trọn trong khoảng > 2 * nums[j]" : "Green nodes are fully inside the > 2 * nums[j] interval";
  } else if (phase === "count") {
    actionLabel = "COUNT";
    actionMain = `answer = ${view.answer || 0}`;
    actionDetail = `i < ${current} · nums[i] > ${view.threshold}`;
  } else if (phase === "update") {
    actionLabel = "UPDATE";
    actionMain = `insert nums[${current}] = ${currentValue}`;
    actionDetail = vi ? "Node cam là đường update từ leaf lên root" : "Orange nodes are the update path from leaf to root";
  } else if (phase === "done") {
    actionLabel = "RETURN";
    actionMain = String(view.answer || 0);
    actionDetail = "reverse pairs";
  }

  $("treeView").innerHTML = `<div class="rp493st-viz phase-${escapeHtml(phase)}">
    <div class="rp493st-phases">${phases}</div>
    <section class="rp493st-section"><header><strong>NUMS · LEFT-TO-RIGHT SCAN</strong><span>${vi ? "xanh = đã update · viền sáng = j hiện tại" : "green = updated · bright border = current j"}</span></header><div class="rp493st-scroll"><div class="rp493st-nums">${numsHtml}</div></div></section>
    <section class="rp493st-section"><header><strong>VALUE -> COMPRESSED RANK</strong><span>${vi ? "nền xanh = value > 2 * nums[j]" : "green fill = value > 2 * nums[j]"}</span></header><div class="rp493st-ranks">${ranksHtml}</div></section>
    <div class="rp493st-action"><small>${escapeHtml(actionLabel)}</small><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="rp493st-metrics"><span><small>${vi ? "ĐÃ THẤY" : "SEEN"}</small><strong>${Math.max(0, current)}</strong></span><span><small>${vi ? "QUERY TÌM THẤY" : "QUERY FOUND"}</small><strong>${escapeHtml(String(view.found || 0))}</strong></span><span class="count"><small>ANSWER</small><strong>${escapeHtml(String(view.answer || 0))}</strong></span></div>
    <section class="rp493st-section"><header><strong>SEGMENT TREE · VALUE FREQUENCY</strong><span>${vi ? "node lưu tổng frequency trong range rank" : "nodes store total frequency in each rank range"}</span></header><div class="rp493st-tree">${treeHtml}</div></section>
    <div class="rp493st-rule"><code>nums[i] > 2 * nums[j]</code><span>+</span><code>${vi ? "query trước, update sau" : "query first, update second"}</code></div>
  </div>`;
}

