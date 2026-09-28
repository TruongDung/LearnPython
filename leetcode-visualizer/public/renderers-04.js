function renderSortedArrayCostView(step) {
  const view = step.sortedArrayCostView || {};
  const vi = lang === "vi";
  const instructions = Array.isArray(view.instructions) ? view.instructions : [];
  const ranks = Array.isArray(view.ranks) ? view.ranks : [];
  const values = Array.isArray(view.values) ? view.values : [];
  const bit = Array.isArray(view.bit) ? view.bit : [];
  const costs = Array.isArray(view.costs) ? view.costs : [];
  const queryPath = new Set(Array.isArray(view.queryPath) ? view.queryPath : []);
  const updatePath = new Set(Array.isArray(view.updatePath) ? view.updatePath : []);
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : -1;
  const currentRank = Number.isInteger(view.currentRank) ? view.currentRank : null;
  const queryCursor = Number.isInteger(view.queryCursor) ? view.queryCursor : null;
  const updateCursor = Number.isInteger(view.updateCursor) ? view.updateCursor : null;
  const phase = String(view.phase || "compress");
  const phaseIndex = ["compress", "rank", "bit-init", "init"].includes(phase) ? 0
    : ["scan", "rank-current"].includes(phase) ? 1
      : phase.startsWith("query") || ["less-result", "greater-result"].includes(phase) ? 2
        : ["cost", "cost-add"].includes(phase) ? 3
          : ["update", "update-done"].includes(phase) ? 4 : 5;
  const phaseLabels = vi
    ? ["1 · Nén rank", "2 · Đọc instruction", "3 · Query BIT", "4 · Tính cost", "5 · Update BIT", "6 · Kết quả"]
    : ["1 · Compress", "2 · Read instruction", "3 · Query BIT", "4 · Compute cost", "5 · Update BIT", "6 · Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}">${index < phaseIndex ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`).join("");

  const instructionHtml = instructions.map((value, index) => {
    const classes = ["ca1649-instruction"];
    if (index < currentIndex || phase === "done") classes.push("processed");
    if (index === currentIndex) classes.push("current");
    const cost = costs[index];
    return `<span class="${classes.join(" ")}"><small>i=${index}</small><strong>${escapeHtml(String(value))}</strong><em>${cost === null || cost === undefined ? "cost _" : `cost ${escapeHtml(String(cost))}`}</em></span>`;
  }).join("");
  const rankHtml = ranks.map((item) => {
    const classes = ["ca1649-rank"];
    if (item.rank === currentRank) classes.push("active");
    if (currentRank !== null && item.rank < currentRank) classes.push("less");
    if (currentRank !== null && item.rank > currentRank) classes.push("greater");
    return `<span class="${classes.join(" ")}"><small>${escapeHtml(String(item.value))}</small><strong>r${item.rank}</strong></span>`;
  }).join("");
  const bitHtml = bit.map((count, zeroIndex) => {
    const index = zeroIndex + 1;
    const lowbit = index & -index;
    const leftRank = index - lowbit + 1;
    const classes = ["ca1649-bit"];
    if (queryPath.has(index)) classes.push("query-path");
    if (updatePath.has(index)) classes.push("update-path");
    if (index === queryCursor || index === updateCursor) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>BIT[${index}]</small><strong>${escapeHtml(String(count))}</strong><em>r${leftRank}..r${index}</em><i>${escapeHtml(String(values[leftRank - 1]))}..${escapeHtml(String(values[index - 1]))}</i></span>`;
  }).join("");

  const includeCurrent = phase === "update-done";
  const sortedLength = phase === "done" ? instructions.length : Math.max(0, currentIndex + (includeCurrent ? 1 : 0));
  const sortedValues = instructions.slice(0, sortedLength).sort((a, b) => a - b);
  const sortedHtml = sortedValues.length
    ? sortedValues.map((value) => `<span>${escapeHtml(String(value))}</span>`).join("")
    : `<em>${vi ? "chưa có phần tử" : "empty"}</em>`;
  const queryPathText = queryPath.size ? [...queryPath].map((index) => `BIT[${index}]`).join(" → ") : "—";
  const updatePathText = updatePath.size ? [...updatePath].map((index) => `BIT[${index}]`).join(" → ") : "—";

  let actionLabel = vi ? "CHUẨN BỊ" : "PREPARE";
  let actionMain = vi ? "Nén value thành rank tăng dần" : "Compress values into increasing ranks";
  let actionDetail = "value ↑ ⇔ rank ↑";
  if (phase.startsWith("query")) {
    const isLess = view.queryKind === "less";
    actionLabel = isLess ? "QUERY LESS" : "QUERY ≤";
    actionMain = `query(${view.queryLimit ?? "—"}) = ${view.queryTotal ?? 0}`;
    actionDetail = isLess
      ? (vi ? `đếm value < ${view.currentValue}` : `count values < ${view.currentValue}`)
      : (vi ? `đếm value ≤ ${view.currentValue}` : `count values ≤ ${view.currentValue}`);
  } else if (["less-result", "greater-result"].includes(phase)) {
    actionLabel = vi ? "HAI PHÍA" : "TWO SIDES";
    actionMain = `less = ${view.less ?? 0} · greater = ${view.greater ?? 0}`;
    actionDetail = vi ? "value bằng nhau không thuộc phía nào" : "equal values belong to neither side";
  } else if (["cost", "cost-add"].includes(phase)) {
    actionLabel = "COST";
    actionMain = `min(${view.less ?? 0}, ${view.greater ?? 0}) = ${view.currentCost ?? 0}`;
    actionDetail = `${vi ? "tổng" : "total"} = ${view.totalCost ?? 0}`;
  } else if (["update", "update-done"].includes(phase)) {
    actionLabel = "UPDATE";
    actionMain = `update(r${view.currentRank ?? "—"})`;
    actionDetail = vi ? `chèn ${view.currentValue} vào các node BIT cha` : `insert ${view.currentValue} into BIT ancestors`;
  } else if (["scan", "rank-current"].includes(phase)) {
    actionLabel = vi ? "ĐANG CHÈN" : "INSERT";
    actionMain = currentIndex >= 0 ? `instructions[${currentIndex}] = ${view.currentValue}` : "—";
    actionDetail = vi ? `${currentIndex} phần tử đã có trước đó` : `${currentIndex} elements already inserted`;
  } else if (phase === "done") {
    actionLabel = "RETURN";
    actionMain = String(view.totalCost ?? 0);
    actionDetail = vi ? "tổng insertion cost modulo 10⁹+7" : "total insertion cost modulo 10⁹+7";
  }

  $("treeView").innerHTML = `<div class="ca1649-viz phase-${escapeHtml(phase)}">
    <div class="ca1649-phases">${phases}</div>
    <section class="ca1649-section"><header><strong>INSTRUCTIONS</strong><span>${vi ? "số dưới ô = cost của lần chèn" : "number below = insertion cost"}</span></header><div class="ca1649-scroll"><div class="ca1649-instructions">${instructionHtml}</div></div></section>
    <section class="ca1649-section"><header><strong>VALUE → COMPRESSED RANK</strong><span>${vi ? "xanh = nhỏ hơn · tím = lớn hơn" : "green = smaller · purple = greater"}</span></header><div class="ca1649-ranks">${rankHtml}</div></section>
    <div class="ca1649-sorted"><small>${vi ? "SORTED ARRAY HIỆN TẠI" : "CURRENT SORTED ARRAY"}</small><div>${sortedHtml}</div></div>
    <div class="ca1649-action"><small>${escapeHtml(actionLabel)}</small><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="ca1649-metrics"><span><small>inserted</small><strong>${sortedLength}</strong></span><span class="less"><small>less</small><strong>${escapeHtml(String(view.less ?? 0))}</strong></span><span class="greater"><small>greater</small><strong>${escapeHtml(String(view.greater ?? 0))}</strong></span><span class="cost"><small>min / cost</small><strong>${escapeHtml(String(view.currentCost ?? 0))}</strong></span><span class="total"><small>total cost</small><strong>${escapeHtml(String(view.totalCost ?? 0))}</strong></span></div>
    <section class="ca1649-section"><header><strong>FENWICK TREE · FREQUENCY BY RANK</strong><span>lowbit → ${vi ? "đoạn rank được phủ" : "covered rank range"}</span></header><div class="ca1649-bits">${bitHtml || "—"}</div><div class="ca1649-paths"><span><b>query</b>${escapeHtml(queryPathText)}</span><span><b>update</b>${escapeHtml(updatePathText)}</span></div></section>
    <div class="ca1649-rule"><code>less = query(r−1)</code><i>·</i><code>greater = inserted − query(r)</code><i>·</i><code>cost = min(less, greater)</code></div>
  </div>`;
}

function renderRangeSumCountView(step) {
  const view = step.rangeSumCountView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefixOriginal = Array.isArray(view.prefixOriginal) ? view.prefixOriginal : [];
  const working = Array.isArray(view.working) ? view.working : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const validPositions = new Set(Array.isArray(view.validPositions) ? view.validPositions : []);
  const range = view.range || {};
  const start = Number.isInteger(range.start) ? range.start : -1;
  const mid = Number.isInteger(range.mid) ? range.mid : -1;
  const end = Number.isInteger(range.end) ? range.end : -1;
  const leftPos = Number.isInteger(view.leftPos) ? view.leftPos : -1;
  const low = Number.isInteger(view.low) ? view.low : null;
  const high = Number.isInteger(view.high) ? view.high : null;
  const phase = String(view.phase || "prefix");
  const phaseIndex = phase === "prefix" ? 0
    : ["divide", "base"].includes(phase) ? 1
      : ["merge", "return", "done"].includes(phase) ? 3 : 2;
  const phaseLabels = vi
    ? ["1 · Prefix Sum", "2 · Chia Merge Sort", "3 · Đếm cặp chéo", "4 · Merge"]
    : ["1 · Prefix sums", "2 · Divide", "3 · Count cross pairs", "4 · Merge"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}">${index < phaseIndex ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`).join("");

  const numsHtml = nums.map((num, index) => `<span class="rs327-num${index === view.currentNumIndex ? " active" : ""}"><small>nums[${index}]</small><strong>${escapeHtml(String(num))}</strong></span>`).join("");
  const prefixHtml = prefixOriginal.map((item) => `<span class="rs327-prefix"><small>P${escapeHtml(String(item.originalIndex))}</small><strong>${escapeHtml(String(item.sum))}</strong><em>nums[0..${item.originalIndex - 1}]</em></span>`).join("");
  const workingHtml = working.map((item, position) => {
    const classes = ["rs327-work"];
    if (position >= start && position < mid) classes.push("left-half");
    if (position >= mid && position < end) classes.push("right-half");
    if (position === leftPos) classes.push("left-current");
    if (validPositions.has(position)) classes.push("valid");
    if (view.mergedRange && position >= view.mergedRange.start && position < view.mergedRange.end) classes.push("merged");
    const markers = [];
    if (position === low) markers.push("low");
    if (position === high) markers.push("high");
    return `<span class="${classes.join(" ")}"><small>pos ${position}</small><strong>${escapeHtml(String(item.sum))}</strong><em>P${escapeHtml(String(item.originalIndex))}</em><i>${escapeHtml(markers.join(" · "))}</i></span>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((frame, index) => `<span class="${index === stack.length - 1 ? "active" : ""}"><small>d${frame.depth}</small><strong>[${frame.start}, ${frame.end})</strong></span>`).join("")
    : `<span><strong>—</strong></span>`;

  const leftItem = leftPos >= 0 ? working[leftPos] : null;
  const lowerTarget = leftItem ? leftItem.sum + Number(view.lower) : null;
  const upperTarget = leftItem ? leftItem.sum + Number(view.upper) : null;
  const validItems = [...validPositions].map((position) => working[position]).filter(Boolean);
  let actionLabel = vi ? "MỤC TIÊU" : "GOAL";
  let actionMain = `${view.lower} ≤ Pj − Pi ≤ ${view.upper}`;
  let actionDetail = vi ? "Đếm cặp prefix với i < j" : "Count prefix pairs with i < j";
  if (leftItem) {
    actionLabel = vi ? "PREFIX TRÁI" : "LEFT PREFIX";
    actionMain = `P${leftItem.originalIndex} = ${leftItem.sum} · right sum ∈ [${lowerTarget}, ${upperTarget}]`;
    actionDetail = validItems.length
      ? `${vi ? "hợp lệ" : "valid"}: ${validItems.map((item) => `P${item.originalIndex}=${item.sum}`).join(", ")}`
      : (vi ? "chưa có prefix phải hợp lệ" : "no valid right prefix yet");
  } else if (phase === "merge") {
    actionLabel = "MERGE";
    actionMain = `[${start}, ${end}) → ${working.slice(start, end).map((item) => item.sum).join(", ")}`;
    actionDetail = vi ? "Sắp theo prefix sum cho level cha" : "Sorted by prefix sum for the parent level";
  } else if (phase === "done") {
    actionLabel = "RETURN";
    actionMain = String(view.rangeCount);
    actionDetail = vi ? "range sum hợp lệ" : "valid range sums";
  }
  const lowText = low === null ? "—" : low >= end && end >= 0 ? `${low} (end)` : String(low);
  const highText = high === null ? "—" : high >= end && end >= 0 ? `${high} (end)` : String(high);

  $("treeView").innerHTML = `<div class="rs327-viz phase-${escapeHtml(phase)}">
    <div class="rs327-phases">${phases}</div>
    <section class="rs327-section"><header><strong>NUMS → ORIGINAL PREFIX SUMS</strong><span>Pj − Pi = sum(nums[i..j−1])</span></header><div class="rs327-scroll"><div class="rs327-row">${numsHtml}</div><div class="rs327-row prefix">${prefixHtml}</div></div></section>
    <div class="rs327-recursion"><div><small>${vi ? "RECURSION STACK" : "RECURSION STACK"}</small><span>${stackHtml}</span></div><strong>${start >= 0 ? `[${start}, ${mid >= 0 ? mid : "?"}) | [${mid >= 0 ? mid : "?"}, ${end})` : "—"}</strong></div>
    <section class="rs327-section"><header><strong>WORKING PREFIX ARRAY · SORTED INSIDE COMPLETED HALVES</strong><span>${vi ? "xanh = left · tím = right · lục = valid" : "blue = left · purple = right · green = valid"}</span></header><div class="rs327-scroll"><div class="rs327-row working">${workingHtml || "—"}</div></div></section>
    <div class="rs327-action"><small>${escapeHtml(actionLabel)}</small><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="rs327-metrics"><span><small>low</small><strong>${escapeHtml(lowText)}</strong></span><span><small>high</small><strong>${escapeHtml(highText)}</strong></span><span><small>high − low</small><strong>${escapeHtml(String(view.lastAdded ?? 0))}</strong></span><span class="count"><small>${vi ? "COUNT ĐOẠN" : "RANGE COUNT"}</small><strong>${escapeHtml(String(view.rangeCount ?? 0))}</strong></span></div>
    <div class="rs327-rule"><code>${escapeHtml(String(view.lower))} ≤ right.sum − left.sum ≤ ${escapeHtml(String(view.upper))}</code><span>${vi ? "low tìm cận dưới · high tìm sau cận trên" : "low finds lower bound · high finds after upper bound"}</span></div>
  </div>`;
}

function renderRangeSumSegmentTreeView(step) {
  const view = step.rangeSumSegmentTreeView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const values = Array.isArray(view.values) ? view.values : [];
  const tree = Array.isArray(view.tree) ? view.tree : [];
  const ranges = Array.isArray(view.treeRanges) ? view.treeRanges : [];
  const queryPath = new Set(Array.isArray(view.queryPath) ? view.queryPath : []);
  const coveredNodes = new Set(Array.isArray(view.coveredNodes) ? view.coveredNodes : []);
  const updatePath = new Set(Array.isArray(view.updatePath) ? view.updatePath : []);
  const current = Number.isInteger(view.prefixIndex) ? view.prefixIndex : 0;
  const left = Number.isInteger(view.queryLeft) ? view.queryLeft : null;
  const right = Number.isInteger(view.queryRight) ? view.queryRight : null;
  const phase = String(view.phase || "prefix");
  const phaseIndex = ["prefix", "compress"].includes(phase) ? 0
    : phase === "done" ? 3
      : ["scan", "bounds"].includes(phase) ? 1 : 2;
  const labels = vi
    ? ["1 · Prefix + nén", "2 · Tìm khoảng rank", "3 · Query + Update", "4 · Kết quả"]
    : ["1 · Prefix + compress", "2 · Find rank interval", "3 · Query + Update", "4 · Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}">${index < phaseIndex ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`).join("");

  const prefixHtml = prefix.map((sum, index) => {
    const classes = ["rs327st-prefix"];
    if (index < current || (phase === "done" && index <= current) || (index === 0 && current === 0 && phase === "update")) classes.push("stored");
    if (index === current && phase !== "done") classes.push("active");
    return `<span class="${classes.join(" ")}"><small>P${index}</small><strong>${escapeHtml(String(sum))}</strong><em>${index === 0 ? "empty" : `nums[0..${index - 1}]`}</em></span>`;
  }).join("");
  const rankHtml = values.map((value, index) => {
    const classes = ["rs327st-rank"];
    if (left !== null && right !== null && index >= left && index <= right) classes.push("inside");
    if (current < prefix.length && value === prefix[current]) classes.push("current");
    return `<span class="${classes.join(" ")}"><small>rank ${index}</small><strong>${escapeHtml(String(value))}</strong></span>`;
  }).join("");

  const depths = new Map();
  ranges.forEach((item) => {
    if (!depths.has(item.depth)) depths.set(item.depth, []);
    depths.get(item.depth).push(item);
  });
  const treeHtml = [...depths.entries()].sort((a, b) => a[0] - b[0]).map(([depth, nodes]) => {
    const nodesHtml = nodes.map((item) => {
      const classes = ["rs327st-node"];
      if (queryPath.has(item.node)) classes.push("visited");
      if (coveredNodes.has(item.node)) classes.push("covered");
      if (updatePath.has(item.node)) classes.push("updated");
      const valueRange = values.length ? `${values[item.start]}..${values[item.end]}` : "—";
      return `<span class="${classes.join(" ")}"><small>node ${item.node} · r${item.start}..r${item.end}</small><strong>${escapeHtml(String(tree[item.node] || 0))}</strong><em>${escapeHtml(valueRange)}</em></span>`;
    }).join("");
    return `<div class="rs327st-level"><b>L${depth}</b><div>${nodesHtml}</div></div>`;
  }).join("");

  const currentSum = current < prefix.length ? prefix[current] : null;
  const minValue = currentSum === null ? null : currentSum - Number(view.upper);
  const maxValue = currentSum === null ? null : currentSum - Number(view.lower);
  let actionLabel = vi ? "CHUẨN BỊ" : "PREPARE";
  let actionMain = vi ? "Tạo prefix và nén tọa độ" : "Build prefixes and compress coordinates";
  let actionDetail = vi ? "Mỗi leaf đại diện một prefix sum" : "Each leaf represents one prefix-sum value";
  if (["scan", "bounds"].includes(phase)) {
    actionLabel = vi ? `XÉT P${current}` : `PROCESS P${current}`;
    actionMain = `${minValue} <= previous prefix <= ${maxValue}`;
    actionDetail = left === null ? "—" : `value interval -> rank [${left}, ${right}]`;
  } else if (phase === "query") {
    actionLabel = "QUERY";
    actionMain = `query(rank ${left}..${right}) = ${view.queryCount || 0}`;
    actionDetail = vi ? "Node xanh lá nằm trọn trong khoảng và được cộng" : "Green nodes are fully covered and added";
  } else if (phase === "count") {
    actionLabel = "COUNT";
    actionMain = `answer = ${view.answer || 0}`;
    actionDetail = vi ? "Cộng số prefix trước đó hợp lệ" : "Add valid earlier prefixes";
  } else if (phase === "update") {
    actionLabel = "UPDATE";
    actionMain = currentSum === null ? "—" : `insert P${current} = ${currentSum}`;
    actionDetail = vi ? "Node màu cam là đường cập nhật từ leaf lên root" : "Orange nodes form the update path from leaf to root";
  } else if (phase === "done") {
    actionLabel = "RETURN";
    actionMain = String(view.answer || 0);
    actionDetail = vi ? "subarray sum hợp lệ" : "valid subarray sums";
  }

  $("treeView").innerHTML = `<div class="rs327st-viz phase-${escapeHtml(phase)}">
    <div class="rs327st-phases">${phases}</div>
    <section class="rs327st-section"><header><strong>NUMS -> PREFIX SUMS</strong><span>${vi ? "xanh = đã lưu · viền sáng = đang xét" : "green = stored · bright border = current"}</span></header><div class="rs327st-scroll"><div class="rs327st-nums">${nums.map((num, index) => `<span><small>nums[${index}]</small><strong>${escapeHtml(String(num))}</strong></span>`).join("")}</div><div class="rs327st-prefixes">${prefixHtml}</div></div></section>
    <section class="rs327st-section"><header><strong>COORDINATE COMPRESSION</strong><span>${vi ? "nền xanh = khoảng query" : "green fill = query interval"}</span></header><div class="rs327st-ranks">${rankHtml}</div></section>
    <div class="rs327st-action"><small>${escapeHtml(actionLabel)}</small><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="rs327st-metrics"><span><small>${vi ? "PREFIX HIỆN TẠI" : "CURRENT PREFIX"}</small><strong>${currentSum === null ? "—" : escapeHtml(String(currentSum))}</strong></span><span><small>${vi ? "QUERY TÌM THẤY" : "QUERY FOUND"}</small><strong>${escapeHtml(String(view.queryCount || 0))}</strong></span><span class="count"><small>ANSWER</small><strong>${escapeHtml(String(view.answer || 0))}</strong></span></div>
    <section class="rs327st-section tree"><header><strong>SEGMENT TREE · PREFIX FREQUENCY</strong><span>${vi ? "mỗi node lưu tổng frequency trong range rank" : "each node stores total frequency in its rank range"}</span></header><div class="rs327st-tree">${treeHtml}</div></section>
    <div class="rs327st-rule"><code>lower <= Pj - Pi <= upper</code><span>⇔</span><code>Pj - upper <= Pi <= Pj - lower</code></div>
  </div>`;
}

function renderRangeSumFenwickView(step) {
  const view = step.rangeSumFenwickView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const ranks = Array.isArray(view.ranks) ? view.ranks : [];
  const bit = Array.isArray(view.bit) ? view.bit : [];
  const leftPath = new Set(Array.isArray(view.leftPath) ? view.leftPath : []);
  const rightPath = new Set(Array.isArray(view.rightPath) ? view.rightPath : []);
  const updatePath = new Set(Array.isArray(view.updatePath) ? view.updatePath : []);
  const queryPath = new Set([...leftPath, ...rightPath]);
  const current = Number.isInteger(view.prefixIndex) ? view.prefixIndex : 0;
  const storedThrough = Number.isInteger(view.storedThrough) ? view.storedThrough : -1;
  const activeBitIndex = Number.isInteger(view.activeBitIndex) ? view.activeBitIndex : null;
  const leftRank = Number.isInteger(view.leftRank) ? view.leftRank : null;
  const rightRank = Number.isInteger(view.rightRank) ? view.rightRank : null;
  const phase = String(view.phase || "prefix");
  const phaseIndex = ["prefix", "prefix-init", "prefix-loop", "prefix-append", "compress", "rank", "bit-init", "answer-init"].includes(phase) ? 0
    : phase === "done" ? 3
      : ["scan", "bounds"].includes(phase) ? 1 : 2;
  const labels = vi
    ? ["1 · Prefix + nén", "2 · Tìm khoảng rank", "3 · BIT Query + Update", "4 · Kết quả"]
    : ["1 · Prefix + compress", "2 · Find rank interval", "3 · BIT Query + Update", "4 · Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}">${index < phaseIndex ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`).join("");

  const prefixHtml = prefix.map((sum, index) => {
    const classes = ["ca1649-instruction"];
    if (index <= storedThrough || phase === "done") classes.push("processed");
    if (index === current && phase !== "done") classes.push("current");
    const state = index <= storedThrough || phase === "done"
      ? "in BIT"
      : index === current ? "current" : (phase.startsWith("prefix") ? "built" : "waiting");
    return `<span class="${classes.join(" ")}"><small>P${index}</small><strong>${escapeHtml(String(sum))}</strong><em>${state}</em></span>`;
  }).join("");
  const rankHtml = ranks.map((item) => {
    const classes = ["ca1649-rank"];
    if (leftRank !== null && rightRank !== null && item.rank >= leftRank && item.rank <= rightRank) classes.push("less");
    if (current < prefix.length && item.value === prefix[current]) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>${escapeHtml(String(item.value))}</small><strong>r${item.rank}</strong></span>`;
  }).join("");
  const bitHtml = bit.map((count, zeroIndex) => {
    const index = zeroIndex + 1;
    const lowbit = index & -index;
    const left = index - lowbit + 1;
    const classes = ["ca1649-bit"];
    if (queryPath.has(index)) classes.push("query-path");
    if (updatePath.has(index)) classes.push("update-path");
    if (index === activeBitIndex) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>BIT[${index}]</small><strong>${escapeHtml(String(count))}</strong><em>r${left}..r${index}</em><i>${escapeHtml(`${ranks[left - 1]?.value ?? "?"}..${ranks[index - 1]?.value ?? "?"}`)}</i></span>`;
  }).join("");

  const currentSum = current < prefix.length ? prefix[current] : null;
  let actionLabel = vi ? "CHUẨN BỊ" : "PREPARE";
  let actionMain = vi ? "Tạo prefix và nén thành rank 1-based" : "Build prefixes and compress into 1-based ranks";
  let actionDetail = vi ? "BIT lưu frequency của prefix đã đi qua" : "The BIT stores frequencies of earlier prefixes";
  if (phase === "scan") {
    actionLabel = vi ? `XÉT P${current}` : `PROCESS P${current}`;
    actionMain = `current = ${currentSum}`;
    actionDetail = `${currentSum - Number(view.upper)} <= previous <= ${currentSum - Number(view.lower)}`;
  } else if (phase === "bounds") {
    actionLabel = vi ? "KHOẢNG RANK" : "RANK INTERVAL";
    actionMain = `[${leftRank}, ${rightRank}]`;
    actionDetail = vi ? "nền xanh = prefix value cần đếm" : "green fill = prefix values to count";
  } else if (phase === "query") {
    actionLabel = "BIT RANGE QUERY";
    actionMain = `query(${rightRank}) - query(${leftRank - 1}) = ${view.found || 0}`;
    actionDetail = `${view.rightCount || 0} - ${view.leftCount || 0}`;
  } else if (phase === "count") {
    actionLabel = "COUNT";
    actionMain = `answer = ${view.answer || 0}`;
    actionDetail = vi ? "Cộng số prefix trước đó hợp lệ" : "Add valid earlier prefixes";
  } else if (phase === "update") {
    actionLabel = "BIT UPDATE";
    actionMain = `insert P${current} = ${currentSum}`;
    actionDetail = vi ? "Node cam là update path theo lowbit" : "Orange nodes are the lowbit update path";
  } else if (phase === "done") {
    actionLabel = "RETURN";
    actionMain = String(view.answer || 0);
    actionDetail = vi ? "range sum hợp lệ" : "valid range sums";
  }

  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  if (Number.isInteger(activeLine)) {
    actionLabel = vi ? `DÒNG ${activeLine}` : `LINE ${activeLine}`;
    actionMain = pick(step.title);
    actionDetail = pick(step.note);
  }

  const leftPathText = leftPath.size ? [...leftPath].map((index) => `BIT[${index}]`).join(" -> ") : "—";
  const rightPathText = rightPath.size ? [...rightPath].map((index) => `BIT[${index}]`).join(" -> ") : "—";
  const updatePathText = updatePath.size ? [...updatePath].map((index) => `BIT[${index}]`).join(" -> ") : "—";
  $("treeView").innerHTML = `<div class="ca1649-viz rs327bit-viz phase-${escapeHtml(phase)}">
    <div class="ca1649-phases">${phases}</div>
    <section class="ca1649-section"><header><strong>NUMS -> PREFIX SUMS</strong><span>${vi ? "xanh = đã update vào BIT · cam = đang xét" : "green = updated into BIT · orange = current"}</span></header><div class="ca1649-scroll"><div class="ca1649-instructions">${prefixHtml}</div></div></section>
    <section class="ca1649-section"><header><strong>VALUE -> 1-BASED RANK</strong><span>${vi ? "nền xanh = khoảng cần query" : "green fill = queried interval"}</span></header><div class="ca1649-ranks">${rankHtml}</div></section>
    <div class="ca1649-action"><small>${escapeHtml(actionLabel)}</small><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="ca1649-metrics"><span><small>CURRENT</small><strong>${currentSum === null ? "—" : escapeHtml(String(currentSum))}</strong></span><span class="less"><small>query(left-1)</small><strong>${escapeHtml(String(view.leftCount || 0))}</strong></span><span class="greater"><small>query(right)</small><strong>${escapeHtml(String(view.rightCount || 0))}</strong></span><span class="cost"><small>FOUND</small><strong>${escapeHtml(String(view.found || 0))}</strong></span><span class="total"><small>ANSWER</small><strong>${escapeHtml(String(view.answer || 0))}</strong></span></div>
    <section class="ca1649-section"><header><strong>FENWICK TREE / BIT · PREFIX FREQUENCY</strong><span>lowbit -> ${vi ? "range rank được quản lý" : "covered rank range"}</span></header><div class="ca1649-bits">${bitHtml}</div><div class="ca1649-paths"><span><b>query(left-1)</b>${escapeHtml(leftPathText)}</span><span><b>query(right)</b>${escapeHtml(rightPathText)}</span><span><b>update</b>${escapeHtml(updatePathText)}</span></div></section>
    <div class="ca1649-rule"><code>count(left..right) = query(right) - query(left-1)</code><i>·</i><code>update(rank[current])</code></div>
  </div>`;
}

function renderCountSmallerView(step) {
  const view = step.countSmallerView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const values = Array.isArray(view.values) ? view.values : [];
  const ranks = Array.isArray(view.ranks) ? view.ranks : [];
  const bit = Array.isArray(view.bit) ? view.bit : [];
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const processed = new Set(Array.isArray(view.processedIndices) ? view.processedIndices : []);
  const queryPath = new Set(Array.isArray(view.queryPath) ? view.queryPath : []);
  const updatePath = new Set(Array.isArray(view.updatePath) ? view.updatePath : []);
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : -1;
  const currentRank = Number.isInteger(view.currentRank) ? view.currentRank : null;
  const queryCursor = Number.isInteger(view.queryCursor) ? view.queryCursor : null;
  const updateCursor = Number.isInteger(view.updateCursor) ? view.updateCursor : null;
  const phase = String(view.phase || "compress");
  const phaseIndex = ["compress", "rank", "bit-init", "answer-init"].includes(phase) ? 0
    : ["scan", "rank-current"].includes(phase) ? 1
      : phase === "done" ? 3 : 2;
  const phaseLabels = vi
    ? ["1 · Nén tọa độ", "2 · Quét phải → trái", "3 · Query + Update", "4 · Kết quả"]
    : ["1 · Compress", "2 · Scan right → left", "3 · Query + Update", "4 · Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}">${index < phaseIndex ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+ · /, ""))}</b></span>`).join("");

  const rankHtml = ranks.map((item) => {
    const active = item.rank === currentRank;
    const smaller = currentRank !== null && item.rank < currentRank;
    return `<span class="cs315-rank${active ? " active" : ""}${smaller ? " smaller" : ""}"><small>${escapeHtml(String(item.value))}</small><strong>r${item.rank}</strong></span>`;
  }).join("");
  const numsHtml = nums.map((num, index) => {
    const classes = ["cs315-num"];
    if (index === currentIndex) classes.push("current");
    if (processed.has(index)) classes.push("processed");
    if (currentIndex >= 0 && index > currentIndex) classes.push("right-side");
    const result = answer[index];
    return `<span class="${classes.join(" ")}"><small>i=${index}</small><strong>${escapeHtml(String(num))}</strong><em>${result === null || result === undefined ? "_" : escapeHtml(String(result))}</em></span>`;
  }).join("");
  const bitHtml = bit.map((count, zeroIndex) => {
    const index = zeroIndex + 1;
    const lowbit = index & -index;
    const rankLeft = index - lowbit + 1;
    const valueLeft = values[rankLeft - 1];
    const valueRight = values[index - 1];
    const classes = ["cs315-bit"];
    if (queryPath.has(index)) classes.push("query-path");
    if (updatePath.has(index)) classes.push("update-path");
    if (index === queryCursor || index === updateCursor) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>BIT[${index}]</small><strong>${escapeHtml(String(count))}</strong><em>r${rankLeft}..r${index}</em><i>${escapeHtml(String(valueLeft))}..${escapeHtml(String(valueRight))}</i></span>`;
  }).join("");

  const currentValue = currentIndex >= 0 ? nums[currentIndex] : null;
  let actionLabel = vi ? "CHUẨN BỊ" : "PREPARE";
  let actionMain = vi ? "Sắp xếp unique values và gán rank" : "Sort unique values and assign ranks";
  let actionDetail = "value ↑ ⇔ rank ↑";
  if (phase.startsWith("query") || phase === "answer-write") {
    actionLabel = "QUERY";
    actionMain = `query(${view.queryLimit ?? "—"}) = ${view.queryTotal ?? 0}`;
    actionDetail = vi
      ? `Đếm value < ${currentValue} bằng prefix rank < r${currentRank}`
      : `Count values < ${currentValue} using ranks below r${currentRank}`;
  } else if (phase.startsWith("update")) {
    actionLabel = "UPDATE";
    actionMain = `update(r${currentRank})`;
    actionDetail = vi ? `Thêm ${currentValue} vào các node BIT cha` : `Insert ${currentValue} into its BIT ancestors`;
  } else if (["scan", "rank-current"].includes(phase)) {
    actionLabel = vi ? "ĐANG XÉT" : "CURRENT";
    actionMain = currentIndex >= 0 ? `nums[${currentIndex}] = ${currentValue}` : "—";
    actionDetail = vi ? "Fenwick chỉ chứa phần bên phải" : "Fenwick contains only the right side";
  } else if (phase === "done") {
    actionLabel = "RETURN";
    actionMain = `[${answer.join(", ")}]`;
    actionDetail = vi ? "Số nhỏ hơn ở bên phải cho từng index" : "Smaller-right count for every index";
  }
  const queryPathText = (view.queryPath || []).length ? view.queryPath.map((index) => `BIT[${index}]`).join(" → ") : "—";
  const updatePathText = (view.updatePath || []).length ? view.updatePath.map((index) => `BIT[${index}]`).join(" → ") : "—";

  $("treeView").innerHTML = `<div class="cs315-viz phase-${escapeHtml(phase)}">
    <div class="cs315-phases">${phases}</div>
    <section class="cs315-section"><header><strong>VALUE → COMPRESSED RANK</strong><span>${vi ? "rank nhỏ hơn = value nhỏ hơn" : "smaller rank = smaller value"}</span></header><div class="cs315-ranks">${rankHtml}</div></section>
    <section class="cs315-section"><header><strong>NUMS · ${vi ? "QUÉT TỪ PHẢI SANG TRÁI" : "SCAN RIGHT TO LEFT"}</strong><span>${vi ? "số dưới ô là answer[i]" : "number below is answer[i]"}</span></header><div class="cs315-nums">${numsHtml}</div></section>
    <div class="cs315-action"><small>${escapeHtml(actionLabel)}</small><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <section class="cs315-section"><header><strong>FENWICK TREE · FREQUENCY BY RANK</strong><span>lowbit → ${vi ? "đoạn rank được phủ" : "covered rank range"}</span></header><div class="cs315-bits">${bitHtml}</div><div class="cs315-paths"><span><b>query</b>${escapeHtml(queryPathText)}</span><span><b>update</b>${escapeHtml(updatePathText)}</span></div></section>
    <div class="cs315-rule"><span><b>query(r−1)</b>${vi ? "đếm nhỏ hơn nghiêm ngặt" : "counts strictly smaller"}</span><i>→</i><span><b>update(r)</b>${vi ? "thêm phần tử hiện tại" : "inserts current value"}</span></div>
  </div>`;
}

function renderTrappingRainView(step) {
  const view = step.trappingRainView || {};
  const heights = Array.isArray(view.height) ? view.height : [];
  const water = Array.isArray(view.water) ? view.water : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const left = Number.isInteger(view.left) ? view.left : -1;
  const right = Number.isInteger(view.right) ? view.right : -1;
  const current = Number.isInteger(view.current) ? view.current : -1;
  const leftMax = Number.isFinite(Number(view.leftMax)) ? Number(view.leftMax) : null;
  const rightMax = Number.isFinite(Number(view.rightMax)) ? Number(view.rightMax) : null;
  const total = Number.isFinite(Number(view.total)) ? Number(view.total) : 0;
  const add = Number.isFinite(Number(view.add)) ? Number(view.add) : null;
  const maxLevel = Math.max(1, ...heights, ...water.map((w, i) => (heights[i] || 0) + (w || 0)), leftMax || 0, rightMax || 0);
  const compact = heights.length >= 10;

  const cells = heights.map((height, index) => {
    const w = water[index] || 0;
    const landPct = Math.max(4, (height / maxLevel) * 100);
    const waterPct = w > 0 ? Math.max(8, (w / maxLevel) * 100) : 0;
    const classes = ["trap-cell"];
    if (index === left) classes.push("left");
    if (index === right) classes.push("right");
    if (index === current) classes.push("current");
    if (w > 0) classes.push("has-water");
    return `<div class="${classes.join(" ")}" style="--land:${landPct}%;--water:${waterPct}%">
      <div class="trap-tank">
        ${w > 0 ? `<span class="trap-water"><b>${escapeHtml(String(w))}</b></span>` : ""}
        <span class="trap-bar"><b>${escapeHtml(String(height))}</b></span>
      </div>
      <div class="trap-index">[${index}]</div>
      <div class="trap-pointer-row">
        ${index === left ? '<span class="trap-pointer left">L</span>' : ""}
        ${index === right ? '<span class="trap-pointer right">R</span>' : ""}
      </div>
    </div>`;
  }).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  const formulaHtml = current >= 0
    ? `<div class="trap-formula ${add && add > 0 ? "positive" : ""}">
        <small>${escapeHtml(view.side === "left" ? "left side" : "right side")}</small>
        <strong>${escapeHtml(String(view.decision || ""))}</strong>
        <span>${escapeHtml(lang === "vi" ? "nước thêm" : "water added")} = ${escapeHtml(String(add ?? 0))}</span>
      </div>`
    : `<div class="trap-formula">
        <small>${escapeHtml(lang === "vi" ? "quy tắc" : "rule")}</small>
        <strong>${escapeHtml(leftMax !== null && rightMax !== null ? `min wall = min(${leftMax}, ${rightMax})` : "water = min(left_max, right_max) - height[i]")}</strong>
        <span>${escapeHtml(lang === "vi" ? "luôn xử lý phía có max thấp hơn" : "process the side with the lower max")}</span>
      </div>`;

  $("treeView").innerHTML = `
    <div class="trap-viz${compact ? " compact" : ""}">
      <div class="trap-summary">
        <span><small>left_max</small><b>${escapeHtml(String(leftMax ?? "-"))}</b></span>
        <span><small>right_max</small><b>${escapeHtml(String(rightMax ?? "-"))}</b></span>
        <span><small>total water</small><b>${escapeHtml(String(total))}</b></span>
      </div>
      <div class="trap-chart" style="--trap-cols:${Math.max(1, heights.length)}">${cells}</div>
      ${formulaHtml}
      <div class="trap-status">${statusItems}</div>
    </div>`;
}

function renderTrapRain2ViewLegacy(step) {
  const view = step.trapRain2View || {};
  const vi = lang === "vi";
  const heightMap = Array.isArray(view.heightMap) ? view.heightMap : [];
  const waterAt = Array.isArray(view.waterAt) ? view.waterAt : [];
  const surfaceAt = Array.isArray(view.surfaceAt) ? view.surfaceAt : [];
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const processed = Array.isArray(view.processed) ? view.processed : [];
  const rows = Number.isInteger(view.rows) ? view.rows : heightMap.length;
  const cols = Number.isInteger(view.cols) ? view.cols : (heightMap[0] || []).length;
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const frontier = Array.isArray(view.frontier) ? view.frontier : heap;
  const popped = view.popped || null;
  const neighbor = view.neighbor || null;
  const phase = String(view.phase || "init");
  const keyOf = (cell) => cell ? `${cell.r},${cell.c}` : "";
  const poppedKey = keyOf(popped);
  const neighborKey = keyOf(neighbor);
  const frontierKeys = new Set(frontier.map(keyOf));
  const maxLevel = Math.max(1, ...heightMap.flat().map((value) => Number(value) || 0), ...surfaceAt.flat().map((value) => Number(value) || 0));
  const stage = phase === "init" ? 1 : phase === "pop" ? 2 : phase === "done" ? 4 : 3;
  const stageLabels = vi
    ? ["Đưa biên vào heap", "Pop mức thấp nhất", "Xét ô kề và cập nhật"]
    : ["Seed heap with border", "Pop the lowest level", "Check and update neighbor"];
  const stagesHtml = stageLabels.map((label, index) => {
    const number = index + 1;
    const state = stage > number ? "complete" : stage === number ? "active" : "";
    return `<span class="${state}"><b>${number}</b>${escapeHtml(label)}</span>`;
  }).join("");

  const cellsHtml = heightMap.map((row, r) => row.map((height, c) => {
    const cellKey = `${r},${c}`;
    const water = Number((waterAt[r] || [])[c]) || 0;
    const surface = Number((surfaceAt[r] || [])[c]) || Number(height) + water;
    const isVisited = Boolean((visited[r] || [])[c]);
    const isProcessed = Boolean((processed[r] || [])[c]);
    const isFrontier = frontierKeys.has(cellKey);
    const isBorder = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
    const classes = ["rain2-cell"];
    if (isBorder) classes.push("is-border");
    if (isVisited) classes.push("is-visited");
    if (isProcessed) classes.push("is-processed");
    if (isFrontier) classes.push("is-frontier");
    if (cellKey === poppedKey) classes.push("is-popped");
    if (cellKey === neighborKey) classes.push("is-neighbor");
    if (water > 0) classes.push("has-water");
    const heightPct = Math.max(8, ((Number(height) || 0) / maxLevel) * 100);
    const waterPct = water > 0 ? Math.max(8, (water / maxLevel) * 100) : 0;
    const stateLabel = cellKey === neighborKey
      ? (vi ? "ĐANG XÉT" : "CHECK")
      : cellKey === poppedKey
        ? "POP MIN"
        : isFrontier
          ? (isBorder ? (vi ? "BIÊN · HEAP" : "BORDER · HEAP") : "IN HEAP")
          : isProcessed
            ? (vi ? "ĐÃ XONG" : "DONE")
            : (vi ? "CHƯA THẤY" : "UNSEEN");
    const accessible = vi
      ? `Ô ${r},${c}: đất ${height}, mực hiệu dụng ${surface}, nước ${water}, ${stateLabel}`
      : `Cell ${r},${c}: ground ${height}, effective level ${surface}, water ${water}, ${stateLabel}`;
    return `<div class="${classes.join(" ")}" aria-label="${escapeHtml(accessible)}" style="--rain2-height:${heightPct}%;--rain2-water:${waterPct}%">
      <span class="rain2-coord">(${r},${c})</span>
      <div class="rain2-column">
        ${water > 0 ? `<i class="rain2-water"><small>water</small><b>+${escapeHtml(String(water))}</b></i>` : ""}
        <b>${escapeHtml(String(height))}</b>
      </div>
      <span class="rain2-cell-state">${escapeHtml(stateLabel)}</span>
    </div>`;
  }).join("")).join("");

  const heapHtml = heap.length
    ? heap.map((item, index) => `<span class="${index === 0 ? "is-top" : ""}">
        <small>${index === 0 ? (vi ? "THẤP NHẤT" : "LOWEST") : `#${index + 1}`}</small>
        <strong>${vi ? "mức" : "level"} ${escapeHtml(String(item.wall))}</strong>
        <em>(${escapeHtml(String(item.r))},${escapeHtml(String(item.c))})</em>
      </span>`).join("")
    : `<span class="rain2-heap-empty">∅</span>`;
  const moreHeap = view.heapSize > heap.length ? `<small class="rain2-more">+${escapeHtml(String(view.heapSize - heap.length))}</small>` : "";

  let lessonTitle, lessonText, equationHtml;
  if (phase === "init") {
    lessonTitle = vi ? "Bắt đầu từ nơi nước có thể thoát ra" : "Start where water can escape";
    lessonText = vi ? "Mọi đường thoát ra ngoài đều đi qua ô biên. Vì vậy biên là vòng tường đầu tiên của vùng chưa xét." : "Every path to the outside crosses a border cell, so the border is the first wall around unseen land.";
    equationHtml = `<div class="rain2-flow"><span>OUTSIDE</span><b>→</b><span>${vi ? "Ô BIÊN" : "BORDER"}</span><b>→</b><span>MIN-HEAP</span></div>`;
  } else if (phase === "pop") {
    lessonTitle = vi ? `Mở đường thoát thấp nhất: (${popped?.r},${popped?.c})` : `Open the lowest escape route: (${popped?.r},${popped?.c})`;
    lessonText = vi ? `Mức ${view.wall} là mực nước an toàn hiện tại. Ta dùng nó để kiểm tra lần lượt các ô kề chưa thấy.` : `Level ${view.wall} is the current safe waterline. Use it to inspect each unseen neighbor.`;
    equationHtml = `<div class="rain2-flow"><span>heap min</span><b>→</b><span>(${popped?.r},${popped?.c})</span><b>→</b><span>${vi ? "mức" : "level"} ${view.wall}</span></div>`;
  } else if (phase === "done") {
    lessonTitle = vi ? `Hoàn tất: giữ được ${view.total} đơn vị nước` : `Complete: ${view.total} units of water`;
    lessonText = vi ? "Mọi ô đã được xử lý từ đường thoát thấp nhất vào trong. Không còn vùng chưa xét." : "Every cell was reached inward from the lowest available escape route. No unseen region remains.";
    equationHtml = `<div class="rain2-result-equation"><span>${vi ? "ĐÁP ÁN" : "ANSWER"}</span><strong>${escapeHtml(String(view.total ?? 0))}</strong></div>`;
  } else {
    const catches = Number(view.trapped) > 0;
    lessonTitle = vi
      ? `${popped?.r},${popped?.c} ${view.direction || "→"} ${neighbor?.r},${neighbor?.c}: ${catches ? "có nước" : "không có nước"}`
      : `${popped?.r},${popped?.c} ${view.direction || "→"} ${neighbor?.r},${neighbor?.c}: ${catches ? "water is trapped" : "no water"}`;
    lessonText = catches
      ? (vi ? `Đất ${view.cellHeight} thấp hơn đường thoát ${view.wall}; nước lấp phần chênh lệch và mực hiệu dụng trở thành ${view.newWall}.` : `Ground ${view.cellHeight} is below escape level ${view.wall}; water fills the gap and the effective level becomes ${view.newWall}.`)
      : (vi ? `Đất ${view.cellHeight} cao ít nhất bằng đường thoát ${view.wall}; không có khoảng trống để giữ nước.` : `Ground ${view.cellHeight} is at least as high as escape level ${view.wall}; there is no gap to fill.`);
    equationHtml = `<div class="rain2-equation">
      <span><small>${vi ? "ĐƯỜNG THOÁT" : "ESCAPE LEVEL"}</small><strong>${view.wall}</strong></span>
      <b>−</b>
      <span><small>${vi ? "MẶT ĐẤT" : "GROUND"}</small><strong>${view.cellHeight}</strong></span>
      <b>=</b>
      <span class="${catches ? "positive" : "zero"}"><small>${vi ? "NƯỚC THÊM" : "WATER ADDED"}</small><strong>${view.trapped}</strong></span>
    </div><div class="rain2-total-equation">${vi ? "Tổng" : "Total"}: ${view.waterBefore} + ${view.trapped} = <b>${view.total}</b> · ${vi ? "đẩy lại với mức" : "push back at level"} <b>${view.newWall}</b></div>`;
  }

  $("treeView").innerHTML = `<div class="rain2-viz phase-${escapeHtml(phase)}">
    <div class="rain2-story">${stagesHtml}</div>
    <div class="rain2-summary">
      <span><small>${vi ? "Tổng nước" : "Total water"}</small><strong>${escapeHtml(String(view.total ?? 0))}</strong></span>
      <span><small>${vi ? "Đang chờ trong heap" : "Waiting in heap"}</small><strong>${escapeHtml(String(view.heapSize ?? 0))}</strong></span>
      <span><small>${vi ? "Đã xử lý" : "Processed"}</small><strong>${escapeHtml(String(view.processedCount ?? 0))}/${escapeHtml(String(view.totalCells ?? rows * cols))}</strong></span>
    </div>
    <section class="rain2-lesson"><header><small>${vi ? "ĐANG LÀM GÌ?" : "WHAT IS HAPPENING?"}</small><strong>${escapeHtml(lessonTitle)}</strong></header><p>${escapeHtml(lessonText)}</p>${equationHtml}</section>
    <div class="rain2-layout">
      <section class="rain2-grid-card">
        <header><strong>${vi ? "BẢN ĐỒ: ĐẤT + NƯỚC" : "MAP: GROUND + WATER"}</strong><span>${vi ? "số trong khối = độ cao đất" : "number in block = ground height"}</span></header>
        <div class="rain2-grid" role="grid" style="--rain2-cols:${Math.max(1, cols)}">${cellsHtml}</div>
      </section>
      <aside class="rain2-heap"><header><strong>${vi ? "BIÊN ĐANG CHỜ (MIN-HEAP)" : "WAITING BOUNDARY (MIN-HEAP)"}</strong><small>${vi ? "minh họa đã sắp từ thấp → cao" : "shown sorted low → high"}</small></header><div>${heapHtml}${moreHeap}</div></aside>
    </div>
    <div class="rain2-legend">
      <span><i class="frontier"></i>${vi ? "đang chờ trong heap" : "waiting in heap"}</span>
      <span><i class="popped"></i>${vi ? "đường thấp nhất vừa pop" : "lowest route popped"}</span>
      <span><i class="neighbor"></i>${vi ? "ô đang kiểm tra" : "cell being checked"}</span>
      <span><i class="processed"></i>${vi ? "đã xử lý" : "processed"}</span>
      <span><i class="water"></i>${vi ? "có nước" : "water"}</span>
    </div>
  </div>`;
}

function renderTrapRain2ViewDetailedLegacy(step) {
  const view = step.trapRain2View || {};
  const vi = lang === "vi";
  const localPick = (value) => typeof pick === "function" ? pick(value) : value?.[lang] ?? value?.en ?? value?.vi ?? value ?? "";
  const heightMap = Array.isArray(view.heightMap) ? view.heightMap : [];
  const waterAt = Array.isArray(view.waterAt) ? view.waterAt : [];
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const settled = Array.isArray(view.settled) ? view.settled : (Array.isArray(view.processed) ? view.processed : []);
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const rows = Number.isInteger(view.rows) ? view.rows : heightMap.length;
  const cols = Number.isInteger(view.cols) ? view.cols : (heightMap[0] || []).length;
  const popped = view.popped || null;
  const neighbor = view.neighbor || null;
  const phase = String(view.phase || "init");
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : (phase === "init" ? 0 : phase === "pop" ? 1 : phase === "done" ? 3 : 2);
  const phaseLabels = vi
    ? ["1. Đưa biên vào heap", "2. Pop tường thấp nhất", "3. Mở ô hàng xóm", "4. Tổng nước"]
    : ["1. Add border to heap", "2. Pop lowest wall", "3. Open a neighbor", "4. Total water"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const cellKey = (cell) => cell ? `${cell.r}:${cell.c}` : "";
  const poppedKey = cellKey(popped);
  const neighborKey = cellKey(neighbor);
  const heapRanks = new Map(heap.map((cell, index) => [cellKey(cell), index + 1]));

  const cells = heightMap.map((row, r) => row.map((ground, c) => {
    const key = `${r}:${c}`;
    const water = Number(waterAt[r]?.[c]) || 0;
    const surface = ground + water;
    const border = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
    const isVisited = Boolean(visited[r]?.[c]);
    const isSettled = Boolean(settled[r]?.[c]);
    const rank = heapRanks.get(key);
    const classes = [
      "trw407-cell",
      border ? "border" : "interior",
      !isVisited ? "unvisited" : "",
      isVisited && !isSettled ? "frontier" : "",
      isSettled ? "settled" : "",
      key === poppedKey ? "popped" : "",
      key === neighborKey ? "neighbor" : "",
      water > 0 ? "wet" : "",
    ].filter(Boolean).join(" ");
    const state = key === neighborKey
      ? (vi ? "ĐANG MỞ" : "OPENING")
      : key === poppedKey
        ? "POPPED"
        : rank
          ? `HEAP #${rank}`
          : isSettled
            ? (vi ? "ĐÃ CHỐT" : "SETTLED")
            : border
              ? "BORDER"
              : (vi ? "CHƯA THĂM" : "UNVISITED");
    return `<article class="${classes}">
      <header><small>[${r},${c}]</small><span class="rain2-cell-state">${state}</span></header>
      <div class="trw407-levels"><span class="ground"><small>${vi ? "đất" : "ground"}</small><strong>${ground}</strong></span><i>+</i><span class="water"><small>${vi ? "nước" : "water"}</small><strong>${water}</strong></span></div>
      <footer><small>${vi ? "mặt nước / tường" : "surface / wall"}</small><strong>${surface}</strong></footer>
    </article>`;
  }).join("")).join("");

  const heapItems = heap.length
    ? heap.map((item, index) => `<span class="${index === 0 ? "top" : ""}"><small>${index === 0 ? "MIN / NEXT" : `#${index + 1}`}</small><strong>wall ${item.wall}</strong><em>(${item.r}, ${item.c})</em></span>`).join("")
    : `<em>${vi ? "Heap đã trống" : "The heap is empty"}</em>`;
  const hiddenHeap = Number(view.heapSize || 0) > heap.length ? `<b class="trw407-more">+${Number(view.heapSize) - heap.length}</b>` : "";
  const hasNeighbor = neighbor && Number.isFinite(view.wall) && Number.isFinite(view.cellHeight);
  const trapped = Number(view.trapped) || 0;
  const comparison = hasNeighbor
    ? `<section class="trw407-comparison ${trapped > 0 ? "fill" : "raise"}">
        <div><small>${vi ? "TƯỜNG THẤP NHẤT" : "LOWEST BOUNDARY"}</small><strong>${view.wall}</strong><span>(${popped.r}, ${popped.c})</span></div>
        <b>${view.wall > view.cellHeight ? ">" : "≤"}</b>
        <div><small>${vi ? "ĐỘ CAO HÀNG XÓM" : "NEIGHBOR GROUND"}</small><strong>${view.cellHeight}</strong><span>(${neighbor.r}, ${neighbor.c})</span></div>
        <p><span><small>${vi ? "NƯỚC GIỮ Ở Ô" : "WATER IN CELL"}</small><strong>max(0, ${view.wall} − ${view.cellHeight}) = ${trapped}</strong></span><i>→</i><span><small>${vi ? "TƯỜNG MỚI ĐƯA VÀO HEAP" : "NEW WALL PUSHED TO HEAP"}</small><strong>max(${view.wall}, ${view.cellHeight}) = ${view.newWall}</strong></span></p>
      </section>`
    : "";
  const activeAction = phase === "init"
    ? (vi ? "Biên thông với bên ngoài nên không thể tự giữ nước. Dùng toàn bộ vòng biên làm tường khởi đầu." : "The border leaks outside, so it cannot hold water by itself. Use the whole border as the initial wall.")
    : phase === "pop"
      ? (vi ? "Lấy tường thấp nhất trước: nếu nước có thể thoát, nó sẽ thoát qua điểm thấp nhất này." : "Take the lowest wall first: if water can escape, it escapes through this lowest point.")
      : phase === "done"
        ? (vi ? "Mọi ô đã được mở từ ngoài vào trong; tổng nước đã được cộng đúng một lần cho mỗi ô." : "Every cell has been opened from the outside inward; each cell's water was added exactly once.")
        : trapped > 0
          ? (vi ? `Ô thấp hơn tường ${view.wall}, nên đổ đầy ${trapped} đơn vị tới cùng mặt nước ${view.newWall}.` : `The cell is below wall ${view.wall}, so add ${trapped} units up to surface ${view.newWall}.`)
          : (vi ? `Ô cao ${view.cellHeight} không thấp hơn tường; không có nước và chính ô này trở thành tường mới.` : `Ground ${view.cellHeight} is not below the wall; add no water and use this cell as the new wall.`);
  const totalBefore = Number(view.waterBefore) || 0;
  const total = Number(view.total) || 0;
  const final = Boolean(step.final || phase === "done");

  $("treeView").innerHTML = `<section class="trw407-viz" role="img" aria-label="Trapping Rain Water II visualization">
    <header><div><small>MIN-HEAP · FLOOD FROM BORDER · #407</small><strong>TRAPPING RAIN WATER II</strong></div><span>${escapeHtml(localPick(step.title))}</span></header>
    <div class="trw407-phases rain2-story">${phases}</div>
    <section class="trw407-model"><b>${vi ? "HÌNH DUNG NHƯ MỞ BẢN ĐỒ TỪ NGOÀI VÀO" : "IMAGINE OPENING THE MAP FROM OUTSIDE IN"}</b><div><span><small>1</small><strong>${vi ? "Vòng biên" : "Border ring"}</strong><em>${vi ? "nơi nước có thể thoát" : "where water can escape"}</em></span><i>→</i><span><small>2</small><strong>${vi ? "Tường thấp nhất" : "Lowest wall"}</strong><em>${vi ? "min-heap chọn trước" : "min-heap picks first"}</em></span><i>→</i><span><small>3</small><strong>${vi ? "Ô bên trong" : "Inner neighbor"}</strong><em>${vi ? "đổ nước hoặc nâng tường" : "fill water or raise wall"}</em></span></div></section>
    <section class="trw407-metrics"><div><small>${vi ? "tổng nước" : "total water"}</small><strong>${total}</strong></div><div><small>${vi ? "tường đang xét" : "current wall"}</small><strong>${view.wall ?? "—"}</strong></div><div><small>${vi ? "ô đã phát hiện" : "discovered cells"}</small><strong>${view.visitedCount ?? 0}/${rows * cols}</strong></div><div><small>${vi ? "ô đã chốt" : "settled cells"}</small><strong>${view.settledCount ?? 0}/${rows * cols}</strong></div><div><small>heap size</small><strong>${view.heapSize ?? 0}</strong></div></section>
    <section class="trw407-map"><header><strong>${vi ? "BẢN ĐỒ NHÌN TỪ TRÊN" : "TOP-DOWN HEIGHT MAP"}</strong><span>${vi ? "mỗi ô tách riêng độ cao đất + nước = mặt nước/tường" : "each cell separates ground + water = surface/wall"}</span></header><div class="trw407-grid" style="--trw407-cols:${Math.max(cols, 1)}">${cells}</div></section>
    <section class="trw407-heap"><header><strong>MIN-HEAP · FRONTIER</strong><span>${vi ? "phần tử đầu là đường thoát thấp nhất còn lại" : "the first item is the lowest remaining escape wall"}</span></header><div>${heapItems}${hiddenHeap}</div></section>
    ${comparison}
    <section class="trw407-action"><small>${String(view.event || phase).toUpperCase()}</small><strong>${escapeHtml(activeAction)}</strong><span>${escapeHtml(localPick(step.note))}</span></section>
    <section class="trw407-running"><span><small>${vi ? "TỔNG TRƯỚC" : "TOTAL BEFORE"}</small><strong>${totalBefore}</strong></span><i>+</i><span><small>${vi ? "NƯỚC Ở Ô NÀY" : "WATER IN THIS CELL"}</small><strong>${hasNeighbor ? trapped : 0}</strong></span><i>=</i><span><small>${vi ? "TỔNG HIỆN TẠI" : "CURRENT TOTAL"}</small><strong>${total}</strong></span></section>
    <footer class="trw407-result ${final ? "done" : ""}"><small>TOTAL TRAPPED WATER</small><strong>${final ? total : "…"}</strong><span>${final ? (vi ? "Kết quả là tổng phần nước màu xanh trong các ô bên trong." : "The answer is the sum of the blue water values in all interior cells.") : (vi ? "Min-heap bảo đảm không dùng một bức tường cao giả tạo khi vẫn còn đường thoát thấp hơn." : "The min-heap prevents using an artificially high wall while a lower escape route remains.")}</span></footer>
  </section>`;
}

function renderTrapRain2View(step) {
  const view = step.trapRain2View || {};
  const vi = lang === "vi";
  const localPick = (value) => typeof pick === "function" ? pick(value) : value?.[lang] ?? value?.en ?? value?.vi ?? value ?? "";
  const heightMap = Array.isArray(view.heightMap) ? view.heightMap : [];
  const waterAt = Array.isArray(view.waterAt) ? view.waterAt : [];
  const surfaceAt = Array.isArray(view.surfaceAt) ? view.surfaceAt : [];
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const settled = Array.isArray(view.settled) ? view.settled : (Array.isArray(view.processed) ? view.processed : []);
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const rows = Number.isInteger(view.rows) ? view.rows : heightMap.length;
  const cols = Number.isInteger(view.cols) ? view.cols : (heightMap[0] || []).length;
  const popped = view.popped || null;
  const neighbor = view.neighbor || null;
  const phase = String(view.phase || "init");
  const total = Number(view.total) || 0;
  const wall = Number.isFinite(view.wall) ? Number(view.wall) : null;
  const ground = Number.isFinite(view.cellHeight) ? Number(view.cellHeight) : null;
  const trapped = Number(view.trapped) || 0;
  const newWall = Number.isFinite(view.newWall) ? Number(view.newWall) : null;
  const isDecision = (phase === "trap" || phase === "push") && neighbor && wall !== null && ground !== null;
  const isDone = Boolean(step.final || phase === "done");
  const cellKey = (cell) => cell ? `${cell.r}:${cell.c}` : "";
  const poppedKey = cellKey(popped);
  const neighborKey = cellKey(neighbor);
  const heapRanks = new Map(heap.map((cell, index) => [cellKey(cell), index + 1]));

  const phaseStep = phase === "init" ? 0 : phase === "pop" ? 1 : isDone ? 3 : 2;
  const phaseLabels = vi
    ? ["Bắt đầu từ biên", "Lấy tường thấp nhất", "Kiểm tra 1 hàng xóm"]
    : ["Start at the border", "Take the lowest wall", "Check one neighbor"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseStep ? "done" : index === phaseStep ? "active" : "";
    return `<span class="${state}"><b>${index < phaseStep ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`;
  }).join("");

  let focusHtml;
  if (isDone) {
    focusHtml = `<section class="trw407-focus done">
      <small>${vi ? "HOÀN TẤT" : "DONE"}</small>
      <strong>${vi ? "Không còn ô nào để mở" : "No cells remain to open"}</strong>
      <div class="trw407-answer"><span>${vi ? "Tổng nước" : "Total water"}</span><b>${total}</b></div>
      <p>${vi ? "Cộng tất cả phần nước màu xanh trên bản đồ." : "Add every blue water amount shown on the map."}</p>
    </section>`;
  } else if (isDecision) {
    const catchesWater = trapped > 0;
    focusHtml = `<section class="trw407-focus decision ${catchesWater ? "fill" : "dry"}">
      <small>${vi ? "CHỈ NHÌN PHÉP TÍNH NÀY" : "ONLY WATCH THIS CALCULATION"}</small>
      <strong>${catchesWater
        ? (vi ? `Ô (${neighbor.r},${neighbor.c}) thấp hơn tường nên giữ được nước` : `Cell (${neighbor.r},${neighbor.c}) is lower than the wall, so it holds water`)
        : (vi ? `Ô (${neighbor.r},${neighbor.c}) không thấp hơn tường nên không giữ nước` : `Cell (${neighbor.r},${neighbor.c}) is not below the wall, so it holds no water`)}</strong>
      <div class="trw407-formula">
        <span><small>${vi ? "TƯỜNG THẤP NHẤT" : "LOWEST WALL"}</small><b>${wall}</b></span>
        <i>−</i>
        <span><small>${vi ? "ĐẤT HÀNG XÓM" : "NEIGHBOR GROUND"}</small><b>${ground}</b></span>
        <i>=</i>
        <span class="water"><small>${vi ? "NƯỚC THÊM" : "WATER ADDED"}</small><b>${trapped}</b></span>
      </div>
      <p><code>water = max(0, ${wall} − ${ground}) = ${trapped}</code><span>${vi ? "Đưa ô này vào heap với level" : "Push this cell back with level"} <b>max(${wall}, ${ground}) = ${newWall}</b></span></p>
    </section>`;
  } else if (phase === "pop" && popped) {
    focusHtml = `<section class="trw407-focus pop">
      <small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small>
      <strong>${vi ? "Lấy đường thoát thấp nhất ra khỏi heap" : "Remove the lowest escape wall from the heap"}</strong>
      <div class="trw407-pop-flow"><span><small>POP</small><b>(${popped.r},${popped.c})</b></span><i>→</i><span><small>${vi ? "LEVEL TƯỜNG" : "WALL LEVEL"}</small><b>${wall}</b></span><i>→</i><span><small>${vi ? "TIẾP THEO" : "NEXT"}</small><b>${vi ? "xét 4 hàng xóm" : "check 4 neighbors"}</b></span></div>
      <p>${vi ? "Nếu một hàng xóm thấp hơn level này, phần chênh lệch chính là nước." : "If a neighbor is lower than this level, the difference is water."}</p>
    </section>`;
  } else {
    focusHtml = `<section class="trw407-focus start">
      <small>${vi ? "KHỞI TẠO" : "SETUP"}</small>
      <strong>${vi ? "Biên là nơi nước thoát ra ngoài" : "The border is where water escapes"}</strong>
      <div class="trw407-start-flow"><span>${vi ? "Tất cả ô biên" : "All border cells"}</span><i>→</i><span>MIN-HEAP</span><i>→</i><span>${vi ? "thấp nhất đi trước" : "lowest first"}</span></div>
      <p>${vi ? "Ta mở bản đồ từ ngoài vào trong, luôn đi qua bức tường thấp nhất trước." : "Open the map from the outside inward, always through the lowest wall first."}</p>
    </section>`;
  }

  const cells = heightMap.map((row, r) => row.map((height, c) => {
    const key = `${r}:${c}`;
    const water = Number(waterAt[r]?.[c]) || 0;
    const storedSurface = Number(surfaceAt[r]?.[c]);
    const surface = Number.isFinite(storedSurface) ? storedSurface : height + water;
    const border = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
    const isVisited = Boolean(visited[r]?.[c]);
    const isSettled = Boolean(settled[r]?.[c]);
    const rank = heapRanks.get(key);
    const isPopped = key === poppedKey;
    const isNeighbor = key === neighborKey;
    const classes = [
      "trw407-cell",
      border ? "border" : "interior",
      !isVisited ? "unvisited" : "",
      isVisited && !isSettled ? "frontier" : "",
      isSettled ? "settled" : "",
      isPopped ? "popped" : "",
      isNeighbor ? "neighbor" : "",
      water > 0 ? "wet" : "",
    ].filter(Boolean).join(" ");
    const state = isNeighbor
      ? (vi ? "ĐANG XÉT" : "CHECK")
      : isPopped
        ? "POP"
        : rank === 1
          ? "NEXT"
          : rank
            ? `WAIT ${rank}`
            : isSettled
              ? (vi ? "XONG" : "DONE")
              : border
                ? "BORDER"
                : (vi ? "CHƯA MỞ" : "UNSEEN");
    const accessible = vi
      ? `Ô ${r},${c}: đất ${height}, nước ${water}, level ${surface}, trạng thái ${state}`
      : `Cell ${r},${c}: ground ${height}, water ${water}, level ${surface}, state ${state}`;
    return `<article class="${classes}" aria-label="${escapeHtml(accessible)}">
      <header><small>[${r},${c}]</small><span class="trw407-cell-state rain2-cell-state">${escapeHtml(state)}</span></header>
      <div class="trw407-layers">
        <span class="water"><small>${vi ? "nước" : "water"}</small><strong>${water > 0 ? `+${water}` : "0"}</strong></span>
        <span class="ground"><small>${vi ? "đất" : "ground"}</small><strong>${height}</strong></span>
      </div>
      <footer><small>level</small><strong>${surface}</strong></footer>
    </article>`;
  }).join("")).join("");

  const heapItems = heap.length
    ? heap.slice(0, 8).map((item, index) => `<span class="${index === 0 ? "top" : ""}"><small>${index === 0 ? (vi ? "TIẾP THEO" : "NEXT") : `#${index + 1}`}</small><strong>${item.wall}</strong><em>(${item.r},${item.c})</em></span>`).join("")
    : `<em>${vi ? "Heap đã trống" : "The heap is empty"}</em>`;
  const hiddenHeap = Number(view.heapSize || 0) > 8 ? `<b class="trw407-more">+${Number(view.heapSize) - 8}</b>` : "";
  const nextWall = heap[0]?.wall ?? wall ?? "—";

  $("treeView").innerHTML = `<section class="trw407-viz simple" role="img" aria-label="Trapping Rain Water II visualization">
    <header><div><small>#407 · MIN-HEAP + BFS</small><strong>${vi ? "NƯỚC BỊ GIỮ BỞI TƯỜNG THẤP NHẤT" : "WATER IS LIMITED BY THE LOWEST WALL"}</strong></div><span>${escapeHtml(localPick(step.title))}</span></header>
    <section class="trw407-rule"><b>${vi ? "QUY TẮC DUY NHẤT" : "THE ONE RULE"}</b><code>water = max(0, lowest wall − neighbor ground)</code></section>
    <div class="trw407-phases rain2-story">${phases}</div>
    <section class="trw407-metrics"><div><small>${vi ? "TỔNG NƯỚC" : "TOTAL WATER"}</small><strong>💧 ${total}</strong></div><div><small>${vi ? "TƯỜNG THẤP NHẤT TIẾP THEO" : "NEXT LOWEST WALL"}</small><strong>${nextWall}</strong></div><div><small>${vi ? "ĐÃ XỬ LÝ" : "PROCESSED"}</small><strong>${view.settledCount ?? 0}/${rows * cols}</strong></div></section>
    ${focusHtml}
    <section class="trw407-map"><header><strong>${vi ? "BẢN ĐỒ ĐẤT + NƯỚC" : "GROUND + WATER MAP"}</strong><span>${vi ? "cam = vừa pop · xanh lá = đang xét · xanh dương = có nước" : "orange = popped · green = checking · blue = water"}</span></header><div class="trw407-grid" style="--trw407-cols:${Math.max(cols, 1)}">${cells}</div></section>
    <section class="trw407-heap"><header><strong>MIN-HEAP</strong><span>${vi ? "Ô đầu tiên là tường thấp nhất sẽ lấy tiếp" : "The first cell is the next lowest wall"}</span></header><div>${heapItems}${hiddenHeap}</div></section>
    <div class="trw407-legend"><span><i class="popped"></i>${vi ? "vừa pop" : "popped"}</span><span><i class="neighbor"></i>${vi ? "đang xét" : "checking"}</span><span><i class="water"></i>${vi ? "có nước" : "has water"}</span><span><i class="frontier"></i>${vi ? "đang trong heap" : "in heap"}</span></div>
    <footer class="trw407-result ${isDone ? "done" : ""}"><small>${vi ? "KẾT QUẢ HIỆN TẠI" : "RUNNING ANSWER"}</small><strong>${total}</strong><span>${isDone ? (vi ? "Đã mở hết bản đồ từ ngoài vào trong." : "The whole map has been opened from outside inward.") : (vi ? "Mỗi ô chỉ được mở một lần; tổng chỉ tăng khi đất thấp hơn tường." : "Each cell opens once; the total grows only when ground is below the wall.")}</span></footer>
  </section>`;
}

function renderAverageSubtree2265View(step) {
  const view = step.averageSubtree2265View || {};
  const vi = lang === "vi";
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const currentId = view.current;
  const formula = view.formula || null;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["1. DFS trái → phải", "2. Gộp sum + count", "3. So sánh trung bình", "4. Trả kết quả"]
    : ["1. DFS left → right", "2. Combine sum + count", "3. Compare average", "4. Return result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const maxDepth = nodes.reduce((max, node) => Math.max(max, Number(node.y) || 0), 0);
  const maxX = nodes.reduce((max, node) => Math.max(max, Number(node.x) || 0), 0);
  const horizontalGap = 112;
  const contentWidth = maxX * horizontalGap;
  const treeWidth = Math.max(360, contentWidth + 192);
  const treeHeight = Math.max(220, (maxDepth + 1) * 112 + 72);
  const xOffset = (treeWidth - contentWidth) / 2;
  const xOf = (node) => xOffset + (Number(node.x) || 0) * horizontalGap;
  const yOf = (node) => 64 + (Number(node.y) || 0) * 112;
  const fitTreeToFrame = nodes.length <= 15;
  const edges = nodes.filter((node) => node.parentId !== null && nodeMap.has(node.parentId)).map((node) => {
    const parent = nodeMap.get(node.parentId);
    return `<line x1="${xOf(parent)}" y1="${yOf(parent) + 27}" x2="${xOf(node)}" y2="${yOf(node) - 27}" />`;
  }).join("");
  const treeNodes = nodes.map((node) => {
    const isCurrent = node.id === currentId;
    const state = String(node.state || "unvisited");
    const stateLabel = state === "match"
      ? (vi ? "KHỚP" : "MATCH")
      : state === "miss"
        ? (vi ? "KHÔNG KHỚP" : "NO MATCH")
        : state === "combine"
          ? (vi ? "ĐANG GỘP" : "COMBINE")
          : state === "waiting"
            ? (vi ? "CHỜ CON" : "WAITING")
            : (vi ? "CHƯA THĂM" : "UNVISITED");
    const details = node.sum === null || node.sum === undefined
      ? "sum ?, count ?"
      : `sum ${node.sum} · n ${node.count} · avg ${node.average}`;
    return `<g class="as2265-node ${escapeHtml(state)} ${isCurrent ? "current" : ""}" transform="translate(${xOf(node)} ${yOf(node)})">
      <circle r="28"></circle>
      <text class="value" text-anchor="middle" y="6">${escapeHtml(String(node.value))}</text>
      <text class="state" text-anchor="middle" y="47">${escapeHtml(stateLabel)}</text>
      <text class="stats" text-anchor="middle" y="66">${escapeHtml(details)}</text>
    </g>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((id, index) => {
      const node = nodeMap.get(id);
      return `<span class="${id === currentId ? "current" : ""}"><small>${index === 0 ? "ROOT" : `DEPTH ${index}`}</small><strong>${node ? node.value : "?"}</strong></span>`;
    }).join("<i>→</i>")
    : `<em>${vi ? "Stack đã trống" : "The stack is empty"}</em>`;
  const formulaHtml = formula
    ? `<section class="as2265-formula ${formula.match === true ? "match" : formula.match === false ? "miss" : ""}">
        <header><strong>${vi ? `TÍNH SUBTREE TẠI NODE ${formula.nodeValue}` : `COMPUTE SUBTREE AT NODE ${formula.nodeValue}`}</strong><span>${vi ? "con trái + node + con phải" : "left child + node + right child"}</span></header>
        <div class="sum-row"><span><small>LEFT SUM</small><strong>${formula.leftSum}</strong></span><i>+</i><span><small>NODE</small><strong>${formula.nodeValue}</strong></span><i>+</i><span><small>RIGHT SUM</small><strong>${formula.rightSum}</strong></span><b>=</b><span class="total"><small>SUBTREE SUM</small><strong>${formula.sum}</strong></span></div>
        <div class="count-row"><span><small>LEFT COUNT</small><strong>${formula.leftCount}</strong></span><i>+</i><span><small>NODE</small><strong>1</strong></span><i>+</i><span><small>RIGHT COUNT</small><strong>${formula.rightCount}</strong></span><b>=</b><span class="total"><small>SUBTREE COUNT</small><strong>${formula.count}</strong></span></div>
        <div class="compare"><span><small>${vi ? "TRUNG BÌNH LÀM TRÒN XUỐNG" : "FLOOR AVERAGE"}</small><strong>${formula.sum} // ${formula.count} = ${formula.average}</strong></span><b>${formula.nodeValue} ${formula.nodeValue === formula.average ? "=" : "≠"} ${formula.average}</b><span class="verdict">${formula.match === null ? (vi ? "Chờ so sánh" : "Ready to compare") : formula.match ? (vi ? "+1 vào answer" : "+1 to answer") : (vi ? "+0 vào answer" : "+0 to answer")}</span></div>
      </section>`
    : `<section class="as2265-rule"><b>POSTORDER</b><div><span><strong>LEFT</strong><small>(sum, count)</small></span><i>→</i><span><strong>RIGHT</strong><small>(sum, count)</small></span><i>→</i><span><strong>NODE</strong><small>floor(sum / count)</small></span></div><p>${vi ? "Tại sao phải đi từ lá lên? Vì node cha chỉ tính được trung bình sau khi đã biết tổng và số lượng của cả hai cây con." : "Why work upward from leaves? A parent can compute its average only after both child sums and counts are known."}</p></section>`;
  const final = Boolean(step.final || view.phase === "done");

  $("treeView").innerHTML = `<section class="as2265-viz" role="img" aria-label="Count Nodes Equal to Average of Subtree visualization">
    <header><div><small>POSTORDER DFS · TREE · #2265</small><strong>${vi ? "NODE = TRUNG BÌNH SUBTREE" : "NODE = SUBTREE AVERAGE"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="as2265-phases">${phases}</div>
    <section class="as2265-summary"><div><small>${vi ? "NODE ĐANG XÉT" : "CURRENT NODE"}</small><strong>${currentId === null || currentId === undefined ? "—" : nodeMap.get(currentId)?.value ?? "—"}</strong></div><div><small>${vi ? "ĐÃ TÍNH XONG" : "PROCESSED"}</small><strong>${view.processed || 0}/${view.totalNodes || nodes.length}</strong></div><div class="answer"><small>ANSWER</small><strong>${view.answer || 0}</strong></div></section>
    <section class="as2265-tree"><header><strong>${vi ? "CÂY TÍNH TỪ DƯỚI LÊN" : "TREE COMPUTED BOTTOM-UP"}</strong><span>${vi ? "xanh lá = khớp · đỏ = không khớp · cam = hiện tại" : "green = match · red = no match · orange = current"}</span></header><div><svg class="as2265-tree-svg ${fitTreeToFrame ? "fit" : "scroll"}" viewBox="0 0 ${treeWidth} ${treeHeight}" preserveAspectRatio="xMidYMin meet" ${fitTreeToFrame ? "" : `style="min-width:${treeWidth}px"`} aria-hidden="true"><g class="edges">${edges}</g>${treeNodes}</svg></div></section>
    <section class="as2265-stack"><header><strong>RECURSION STACK</strong><span>${vi ? "node cha chờ hai cây con trả về" : "parents wait for both children to return"}</span></header><div>${stackHtml}</div></section>
    ${formulaHtml}
    <section class="as2265-action"><small>${escapeHtml(String(view.event || "postorder").toUpperCase())}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="as2265-result ${final ? "done" : ""}"><small>${vi ? "SỐ NODE THỎA" : "MATCHING NODES"}</small><strong>${final ? view.answer : "…"}</strong><span>${final ? (vi ? "Mỗi node xanh có node.val = floor(subtree_sum / subtree_count)." : "Every green node has node.val = floor(subtree_sum / subtree_count).") : (vi ? "Leaf luôn khớp vì trung bình của một giá trị chính là nó." : "A leaf always matches because the average of one value is itself.")}</span></footer>
  </section>`;
}

function renderDistributeCoins979View(step) {
  const view = step.distributeCoins979View || {};
  const vi = lang === "vi";
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const history = Array.isArray(view.history) ? view.history : [];
  const formula = view.formula || null;
  const currentId = view.current;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Khởi tạo", "DFS xuống hai con", "Nhận balance", "Đếm coin qua cạnh", "Trả balance", "Kết quả"]
    : ["Initialize", "DFS into children", "Receive balances", "Count edge moves", "Return balance", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const signed = value => value === null || value === undefined ? "?" : value > 0 ? `+${value}` : String(value);
  const balanceMeaning = value => value === null || value === undefined
    ? (vi ? "chưa tính" : "not computed")
    : value > 0
      ? (vi ? `dư ${value} coin` : `${value} surplus coin(s)`)
      : value < 0
        ? (vi ? `thiếu ${Math.abs(value)} coin` : `needs ${Math.abs(value)} coin(s)`)
        : (vi ? "đã cân bằng" : "balanced");

  const maxDepth = nodes.reduce((max, node) => Math.max(max, Number(node.y) || 0), 0);
  const maxX = nodes.reduce((max, node) => Math.max(max, Number(node.x) || 0), 0);
  const horizontalGap = 132;
  const contentWidth = maxX * horizontalGap;
  const treeWidth = Math.max(380, contentWidth + 230);
  const treeHeight = Math.max(235, (maxDepth + 1) * 126 + 88);
  const xOffset = (treeWidth - contentWidth) / 2;
  const xOf = node => xOffset + (Number(node.x) || 0) * horizontalGap;
  const yOf = node => 68 + (Number(node.y) || 0) * 126;
  const fitTreeToFrame = nodes.length <= 15;
  const edges = nodes.filter(node => node.parentId !== null && nodeMap.has(node.parentId)).map(node => {
    const parent = nodeMap.get(node.parentId);
    const balance = node.balance;
    const stateClass = balance === null || balance === undefined ? "pending" : balance > 0 ? "surplus" : balance < 0 ? "deficit" : "balanced";
    const edgeLabel = balance === null || balance === undefined
      ? "?"
      : balance > 0
        ? `↑ ${balance}`
        : balance < 0
          ? `↓ ${Math.abs(balance)}`
          : "0";
    const midX = (xOf(parent) + xOf(node)) / 2;
    const midY = (yOf(parent) + yOf(node)) / 2;
    return `<g class="dc979-edge ${stateClass}"><line x1="${xOf(parent)}" y1="${yOf(parent) + 27}" x2="${xOf(node)}" y2="${yOf(node) - 27}"/><rect x="${midX - 20}" y="${midY - 12}" width="40" height="24" rx="6"></rect><text x="${midX}" y="${midY + 4}" text-anchor="middle">${escapeHtml(edgeLabel)}</text></g>`;
  }).join("");
  const treeNodes = nodes.map(node => {
    const isCurrent = node.id === currentId;
    const state = String(node.state || "unvisited");
    const status = node.balance === null || node.balance === undefined
      ? state === "waiting" ? (vi ? "CHỜ CON" : "WAITING") : state === "moving" ? (vi ? "DI CHUYỂN" : "MOVING") : (vi ? "CHƯA TÍNH" : "PENDING")
      : `${vi ? "BALANCE" : "BALANCE"} ${signed(node.balance)}`;
    return `<g class="dc979-node ${escapeHtml(state)} ${isCurrent ? "current" : ""}" transform="translate(${xOf(node)} ${yOf(node)})"><circle r="29"></circle><text class="coins" text-anchor="middle" y="7">${escapeHtml(String(node.value))}</text><text class="coin-label" text-anchor="middle" y="48">${vi ? "COIN BAN ĐẦU" : "STARTING COINS"}</text><text class="status" text-anchor="middle" y="66">${escapeHtml(status)}</text></g>`;
  }).join("");

  const stackHtml = stack.length
    ? stack.map((frame, index) => `<span class="${frame.id === currentId ? "current" : ""} ${frame.value === null ? "null" : ""}"><small>${index === 0 ? "ROOT" : frame.side.toUpperCase()}</small><strong>${frame.value === null ? "None" : escapeHtml(String(frame.value))}</strong><em>${escapeHtml(String(frame.stage || ""))}</em></span>`).join("<i>→</i>")
    : `<em>${vi ? "Stack đã rỗng" : "The stack is empty"}</em>`;

  const flowCard = (side, balance) => {
    const label = side === "left" ? (vi ? "CẠNH TRÁI" : "LEFT EDGE") : (vi ? "CẠNH PHẢI" : "RIGHT EDGE");
    const cls = balance === null || balance === undefined ? "pending" : balance > 0 ? "surplus" : balance < 0 ? "deficit" : "balanced";
    const direction = balance === null || balance === undefined
      ? "?"
      : balance > 0
        ? (vi ? "CON → NODE" : "CHILD → NODE")
        : balance < 0
          ? (vi ? "NODE → CON" : "NODE → CHILD")
          : (vi ? "KHÔNG DI CHUYỂN" : "NO TRANSFER");
    return `<article class="${cls}"><small>${label}</small><strong>${signed(balance)}</strong><code>${direction}</code><span>${balance === null || balance === undefined ? (vi ? "đang chờ DFS" : "waiting for DFS") : `${Math.abs(balance)} ${vi ? "lượt qua cạnh" : "edge move(s)"}`}</span></article>`;
  };
  const formulaHtml = formula
    ? `<section class="dc979-formula"><header><strong>${vi ? `CÂN BẰNG NODE ${formula.nodeValue}` : `BALANCE NODE ${formula.nodeValue}`}</strong><span>${vi ? "dương = gửi lên · âm = cần từ cha" : "positive = send up · negative = need from parent"}</span></header><div class="flows">${flowCard("left", formula.leftBalance)}<b>+</b>${flowCard("right", formula.rightBalance)}</div><div class="move-equation"><small>MOVES</small><code>${formula.movesBefore ?? view.moves} + |${formula.leftBalance ?? "?"}| + |${formula.rightBalance ?? "?"}|</code><strong>${formula.movesAfter ?? view.moves}</strong></div><div class="balance-equation"><small>BALANCE RETURNED</small><code>coins + left + right − 1</code><strong>${formula.balance === null || formula.balance === undefined ? "?" : `${formula.nodeValue} + ${formula.leftBalance} + ${formula.rightBalance} − 1 = ${signed(formula.balance)}`}</strong><span>${balanceMeaning(formula.balance)}</span></div></section>`
    : `<section class="dc979-rule"><strong>${vi ? "HAI CÔNG THỨC" : "TWO FORMULAS"}</strong><div><code>moves += |left| + |right|</code><code>balance = coins + left + right − 1</code></div><span>${vi ? "Balance của child cho biết chính xác bao nhiêu coin phải đi qua cạnh nối với child đó." : "A child's balance tells exactly how many coins must cross that child's edge."}</span></section>`;

  const historyHtml = history.length
    ? history.map((item, index) => `<span class="${item.id === currentId ? "current" : ""}"><small>#${index + 1} · node ${escapeHtml(String(item.value))}</small><strong>${signed(item.balance)}</strong><em>+${item.movesAdded} moves · total ${item.movesAfter}</em></span>`).join("")
    : `<em>${vi ? "Chưa node nào trả balance" : "No node has returned a balance yet"}</em>`;
  const currentNode = currentId === null || currentId === undefined ? null : nodeMap.get(currentId);
  const final = Boolean(view.final || view.phase === "done");

  $("treeView").innerHTML = `<section class="dc979-viz" role="img" aria-label="Distribute Coins in Binary Tree visualization"><header><div><small>POSTORDER DFS · EDGE FLOW · #979</small><strong>${vi ? "PHÂN PHỐI COIN TRONG CÂY" : "DISTRIBUTE COINS IN A BINARY TREE"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header><div class="dc979-phases">${phases}</div><section class="dc979-summary"><div><small>${vi ? "NODE HIỆN TẠI" : "CURRENT NODE"}</small><strong>${currentNode ? currentNode.value : "—"}</strong></div><div><small>${vi ? "ĐÃ TRẢ BALANCE" : "RETURNED"}</small><strong>${view.processed || 0}/${view.totalNodes || nodes.length}</strong></div><div><small>${vi ? "TỔNG COIN / NODE" : "COINS / NODES"}</small><strong>${view.totalCoins || 0}/${view.totalNodes || nodes.length}</strong></div><div class="moves"><small>MOVES</small><strong>${view.moves || 0}</strong></div></section><section class="dc979-tree"><header><strong>${vi ? "MỖI CẠNH LÀ MỘT DÒNG COIN" : "EVERY EDGE CARRIES A COIN FLOW"}</strong><span>${vi ? "↑ child gửi lên · ↓ parent gửi xuống" : "↑ child sends up · ↓ parent sends down"}</span></header><div><svg class="dc979-tree-svg ${fitTreeToFrame ? "fit" : "scroll"}" viewBox="0 0 ${treeWidth} ${treeHeight}" preserveAspectRatio="xMidYMin meet" ${fitTreeToFrame ? "" : `style="min-width:${treeWidth}px"`} aria-hidden="true"><g class="edges">${edges}</g>${treeNodes}</svg></div></section><section class="dc979-stack"><header><strong>RECURSION STACK</strong><span>${vi ? "frame cuối đang chạy" : "the last frame is active"}</span></header><div>${stackHtml}</div></section>${formulaHtml}<section class="dc979-history"><header><strong>${vi ? "BALANCE TRẢ TỪ LÁ LÊN" : "BALANCES RETURNED BOTTOM-UP"}</strong><span>${vi ? "+ dư · − thiếu" : "+ surplus · − deficit"}</span></header><div>${historyHtml}</div></section><section class="dc979-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"} · ${escapeHtml(String(view.operation || ""))}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section><footer class="dc979-result ${final ? "done" : ""}"><small>${vi ? "SỐ LƯỢT TỐI THIỂU" : "MINIMUM MOVES"}</small><strong>${final ? view.answer : view.moves || 0}</strong><span>${final ? (vi ? "Mỗi node kết thúc với đúng một coin." : "Every node finishes with exactly one coin.") : (vi ? "Moves tăng khi balance đi qua cạnh, không phải khi tính tại node." : "Moves increase when a balance crosses an edge, not merely when a node is computed.")}</span></footer></section>`;
}

function renderMaximumSumBst1373View(step) {
  const view = step.maximumSumBst1373View || {};
  const vi = lang === "vi";
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const history = Array.isArray(view.history) ? view.history : [];
  const bestIds = new Set(Array.isArray(view.bestSubtreeIds) ? view.bestSubtreeIds : []);
  const formula = view.formula || null;
  const currentId = view.current;
  const bestNodeId = view.bestNode;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const labels = vi
    ? ["DFS hậu thứ tự", "Nhận state hai con", "Kiểm tra BST", "Cập nhật best", "Trả state lên cha"]
    : ["Postorder DFS", "Receive child states", "Validate BST", "Update best", "Return state"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const maxDepth = nodes.reduce((max, node) => Math.max(max, Number(node.y) || 0), 0);
  const maxX = nodes.reduce((max, node) => Math.max(max, Number(node.x) || 0), 0);
  const gap = nodes.length <= 11 ? 82 : 118;
  const contentWidth = maxX * gap;
  const width = Math.max(440, contentWidth + 170);
  const height = Math.max(300, (maxDepth + 1) * 140 + 100);
  const offset = (width - contentWidth) / 2;
  const xOf = node => offset + (Number(node.x) || 0) * gap;
  const yOf = node => 68 + (Number(node.y) || 0) * 140;
  const fit = nodes.length <= 15;
  const edges = nodes.filter(node => node.parentId !== null && nodeMap.has(node.parentId)).map(node => {
    const parent = nodeMap.get(node.parentId);
    const best = bestIds.has(node.id) && bestIds.has(parent.id);
    return `<line class="${best ? "best" : ""}" x1="${xOf(parent)}" y1="${yOf(parent) + 33}" x2="${xOf(node)}" y2="${yOf(node) - 33}"></line>`;
  }).join("");
  const treeNodes = nodes.map(node => {
    const state = String(node.state || "unvisited");
    const bestRoot = node.id === bestNodeId;
    const stateLabel = bestRoot ? "BEST ROOT"
      : state === "invalid" ? (vi ? "KHÔNG PHẢI BST" : "NOT A BST")
        : ["bst", "best"].includes(state) ? "BST"
          : state === "validating" ? (vi ? "BST ỨNG VIÊN" : "BST CANDIDATE")
            : state === "combine" ? (vi ? "ĐANG KIỂM TRA" : "CHECKING")
              : state === "waiting" ? (vi ? "CHỜ HAI CON" : "WAITING") : (vi ? "CHƯA THĂM" : "UNVISITED");
    const stats = node.isBst === true ? `min ${node.min} · max ${node.max} · Σ ${node.sum}`
      : node.isBst === false ? (vi ? "state: invalid" : "state: invalid")
        : node.candidateSum === null || node.candidateSum === undefined ? "min ? · max ? · Σ ?" : `candidate Σ ${node.candidateSum}`;
    return `<g class="mb1373-node ${escapeHtml(state)} ${node.id === currentId ? "current" : ""} ${bestIds.has(node.id) ? "best-subtree" : ""} ${bestRoot ? "best-root" : ""}" transform="translate(${xOf(node)} ${yOf(node)})"><circle r="33"></circle><text class="value" text-anchor="middle" y="8">${escapeHtml(String(node.value))}</text><text class="state" text-anchor="middle" y="55">${escapeHtml(stateLabel)}</text><text class="stats" text-anchor="middle" y="76">${escapeHtml(stats)}</text></g>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((id, index) => `<span class="${id === currentId ? "current" : ""}"><small>${index === 0 ? "ROOT" : `DEPTH ${index}`}</small><strong>${escapeHtml(String(nodeMap.get(id)?.value ?? "?"))}</strong></span>`).join("<i>→</i>")
    : `<em>${vi ? "Stack đã rỗng" : "The stack is empty"}</em>`;
  const childCard = (side, child = {}) => {
    const label = side === "left" ? (vi ? "STATE CON TRÁI" : "LEFT CHILD STATE") : (vi ? "STATE CON PHẢI" : "RIGHT CHILD STATE");
    const kind = child.empty ? "empty" : child.isBst ? "bst" : "invalid";
    return `<article class="${kind}"><small>${label}</small><strong>${child.empty ? "BST ∅" : child.isBst ? "BST" : "INVALID"}</strong><div><span>min <b>${child.empty ? "+∞" : child.min ?? "—"}</b></span><span>max <b>${child.empty ? "−∞" : child.max ?? "—"}</b></span><span>sum <b>${child.sum ?? 0}</b></span></div></article>`;
  };
  const formulaHtml = formula
    ? `<section class="mb1373-formula ${formula.valid === true ? "valid" : formula.valid === false ? "invalid" : "pending"}"><header><strong>${vi ? `SUBTREE GỐC ${formula.nodeValue}` : `SUBTREE ROOTED AT ${formula.nodeValue}`}</strong><span>(is_bst, min, max, sum)</span></header><div class="children">${childCard("left", formula.left)}<b>+</b>${childCard("right", formula.right)}</div><div class="ordering"><span class="${formula.leftOk ? "pass" : "fail"}"><small>LEFT BOUND</small><code>${formula.left?.empty ? "−∞" : formula.left?.max ?? "invalid"} &lt; ${formula.nodeValue}</code><b>${formula.leftOk ? "✓" : "✕"}</b></span><i>AND</i><span class="${formula.rightOk ? "pass" : "fail"}"><small>RIGHT BOUND</small><code>${formula.nodeValue} &lt; ${formula.right?.empty ? "+∞" : formula.right?.min ?? "invalid"}</code><b>${formula.rightOk ? "✓" : "✕"}</b></span></div><div class="sum"><small>BST SUM CANDIDATE</small><code>${formula.left?.sum ?? 0} + ${formula.nodeValue} + ${formula.right?.sum ?? 0}</code><strong>${formula.candidateSum}</strong></div><div class="decision"><small>${vi ? "QUYẾT ĐỊNH" : "DECISION"}</small><strong>${formula.valid === null ? (vi ? "Child states đã sẵn sàng; kiểm tra BST tiếp theo" : "Child states ready; validate the BST next") : formula.valid === false ? (vi ? "INVALID → không cập nhật best" : "INVALID → do not update best") : formula.updated === null ? (vi ? "BST hợp lệ; so tổng với best tiếp theo" : "Valid BST; compare its sum with best next") : formula.updated ? `best: ${formula.bestBefore} → ${formula.bestAfter}` : `best = ${formula.bestAfter}`}</strong></div></section>`
    : `<section class="mb1373-rule"><strong>POSTORDER STATE</strong><code>(is_bst, min_value, max_value, subtree_sum)</code><span>${vi ? "Hai cây con phải là BST và left.max < node < right.min." : "Both children must be BSTs and left.max < node < right.min."}</span></section>`;
  const historyHtml = history.length
    ? history.map((item, index) => `<span class="${item.id === bestNodeId ? "best" : item.isBst ? "bst" : "invalid"}"><small>#${index + 1} · node ${escapeHtml(String(item.value))}</small><strong>${item.isBst ? `BST · Σ ${item.sum}` : "INVALID"}</strong><em>best ${item.bestAfter}</em></span>`).join("")
    : `<em>${vi ? "Chưa node nào trả state" : "No node has returned a state yet"}</em>`;
  const currentNode = currentId === null || currentId === undefined ? null : nodeMap.get(currentId);
  const bestNode = bestNodeId === null || bestNodeId === undefined ? null : nodeMap.get(bestNodeId);
  const final = Boolean(view.final || view.phase === "done");

  $("treeView").innerHTML = `<section class="mb1373-viz" role="img" aria-label="Maximum Sum BST in Binary Tree visualization"><header><div><small>POSTORDER DFS · BST STATE · #1373</small><strong>${vi ? "BST SUBTREE CÓ TỔNG LỚN NHẤT" : "MAXIMUM-SUM BST SUBTREE"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header><div class="mb1373-phases">${phases}</div><section class="mb1373-summary"><div><small>${vi ? "NODE HIỆN TẠI" : "CURRENT NODE"}</small><strong>${currentNode ? currentNode.value : "—"}</strong></div><div><small>${vi ? "ĐÃ TRẢ STATE" : "RETURNED STATES"}</small><strong>${view.processed || 0}/${view.totalNodes || nodes.length}</strong></div><div><small>BEST ROOT</small><strong>${bestNode ? bestNode.value : "∅"}</strong></div><div class="best"><small>BEST SUM</small><strong>${view.best || 0}</strong></div></section><section class="mb1373-tree"><header><strong>${vi ? "STATE ĐƯỢC GỘP TỪ LÁ LÊN" : "STATES COMBINED BOTTOM-UP"}</strong><span>${vi ? "xanh = BST tốt nhất · đỏ = invalid · cam = hiện tại" : "green = best BST · red = invalid · orange = current"}</span></header><div><svg class="mb1373-tree-svg ${fit ? "fit" : "scroll"}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMin meet" ${fit ? "" : `style="min-width:${width}px"`} aria-hidden="true"><g class="edges">${edges}</g>${treeNodes}</svg></div></section><section class="mb1373-stack"><header><strong>RECURSION STACK</strong><span>${vi ? "cha chờ state của hai con" : "a parent waits for both child states"}</span></header><div>${stackHtml}</div></section>${formulaHtml}<section class="mb1373-history"><header><strong>${vi ? "STATE TRẢ VỀ THEO POSTORDER" : "STATES RETURNED IN POSTORDER"}</strong><span>BST / INVALID · sum · best</span></header><div>${historyHtml}</div></section><section class="mb1373-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"} · ${escapeHtml(String(view.operation || ""))}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section><footer class="mb1373-result ${final ? "done" : ""}"><small>MAXIMUM BST SUM</small><strong>${final ? view.answer : view.best || 0}</strong><span>${final ? (bestNode ? (vi ? `Subtree gốc ${bestNode.value} là BST có tổng lớn nhất.` : `The BST rooted at ${bestNode.value} has the largest sum.`) : (vi ? "Mọi tổng BST đều âm; empty subtree cho kết quả 0." : "Every BST sum is negative; the empty subtree gives 0.")) : (vi ? "min/max bảo đảm thứ tự BST trên toàn subtree." : "min/max enforces BST ordering across the whole subtree.")}</span></footer></section>`;
}

function renderLargestBst333View(step) {
  const view = step.largestBst333View || {};
  const vi = lang === "vi";
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const history = Array.isArray(view.history) ? view.history : [];
  const bestIds = new Set(Array.isArray(view.bestSubtreeIds) ? view.bestSubtreeIds : []);
  const formula = view.formula || null;
  const currentId = view.current;
  const bestNodeId = view.bestNode;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const labels = vi
    ? ["DFS hậu thứ tự", "Nhận state hai con", "Kiểm tra BST", "Cập nhật best", "Trả state lên cha"]
    : ["Postorder DFS", "Receive child states", "Validate BST", "Update best", "Return state"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const maxDepth = nodes.reduce((max, node) => Math.max(max, Number(node.y) || 0), 0);
  const maxX = nodes.reduce((max, node) => Math.max(max, Number(node.x) || 0), 0);
  const gap = nodes.length <= 11 ? 82 : 118;
  const contentWidth = maxX * gap;
  const width = Math.max(440, contentWidth + 170);
  const height = Math.max(300, (maxDepth + 1) * 140 + 100);
  const offset = (width - contentWidth) / 2;
  const xOf = node => offset + (Number(node.x) || 0) * gap;
  const yOf = node => 68 + (Number(node.y) || 0) * 140;
  const fit = nodes.length <= 15;
  const edges = nodes.filter(node => node.parentId !== null && nodeMap.has(node.parentId)).map(node => {
    const parent = nodeMap.get(node.parentId);
    const best = bestIds.has(node.id) && bestIds.has(parent.id);
    return `<line class="${best ? "best" : ""}" x1="${xOf(parent)}" y1="${yOf(parent) + 29}" x2="${xOf(node)}" y2="${yOf(node) - 29}"></line>`;
  }).join("");
  const treeNodes = nodes.map(node => {
    const state = String(node.state || "unvisited");
    const bestRoot = node.id === bestNodeId;
    const stateLabel = bestRoot ? "BEST ROOT"
      : state === "invalid" ? (vi ? "KHÔNG PHẢI BST" : "NOT A BST")
        : ["bst", "best"].includes(state) ? "BST"
          : state === "validating" ? (vi ? "BST ỨNG VIÊN" : "BST CANDIDATE")
            : state === "combine" ? (vi ? "ĐANG KIỂM TRA" : "CHECKING")
              : state === "waiting" ? (vi ? "CHỜ HAI CON" : "WAITING") : (vi ? "CHƯA THĂM" : "UNVISITED");
    const stats = node.isBst === true ? `min ${node.min} · max ${node.max} · size ${node.size}`
      : node.isBst === false ? (vi ? "state: invalid" : "state: invalid")
        : node.candidateSize === null || node.candidateSize === undefined ? "min ? · max ? · size ?" : `candidate size ${node.candidateSize}`;
    return `<g class="lb333-node ${escapeHtml(state)} ${node.id === currentId ? "current" : ""} ${bestIds.has(node.id) ? "best-subtree" : ""} ${bestRoot ? "best-root" : ""}" transform="translate(${xOf(node)} ${yOf(node)})"><circle r="29"></circle><text class="value" text-anchor="middle" y="7">${escapeHtml(String(node.value))}</text><text class="state" text-anchor="middle" y="49">${escapeHtml(stateLabel)}</text><text class="stats" text-anchor="middle" y="68">${escapeHtml(stats)}</text></g>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((id, index) => `<span class="${id === currentId ? "current" : ""}"><small>${index === 0 ? "ROOT" : `DEPTH ${index}`}</small><strong>${escapeHtml(String(nodeMap.get(id)?.value ?? "?"))}</strong></span>`).join("<i>→</i>")
    : `<em>${vi ? "Stack đã rỗng" : "The stack is empty"}</em>`;
  const childCard = (side, child = {}) => {
    const label = side === "left" ? (vi ? "STATE CON TRÁI" : "LEFT CHILD STATE") : (vi ? "STATE CON PHẢI" : "RIGHT CHILD STATE");
    const kind = child.empty ? "empty" : child.isBst ? "bst" : "invalid";
    return `<article class="${kind}"><small>${label}</small><strong>${child.empty ? "BST ∅" : child.isBst ? "BST" : "INVALID"}</strong><div><span>min <b>${child.empty ? "+∞" : child.min ?? "—"}</b></span><span>max <b>${child.empty ? "−∞" : child.max ?? "—"}</b></span><span>size <b>${child.size ?? 0}</b></span></div></article>`;
  };
  const formulaHtml = formula
    ? `<section class="lb333-formula ${formula.valid === true ? "valid" : formula.valid === false ? "invalid" : "pending"}"><header><strong>${vi ? `SUBTREE GỐC ${formula.nodeValue}` : `SUBTREE ROOTED AT ${formula.nodeValue}`}</strong><span>(is_bst, min, max, size)</span></header><div class="children">${childCard("left", formula.left)}<b>+</b>${childCard("right", formula.right)}</div><div class="ordering"><span class="${formula.leftOk ? "pass" : "fail"}"><small>LEFT BOUND</small><code>${formula.left?.empty ? "−∞" : formula.left?.max ?? "invalid"} &lt; ${formula.nodeValue}</code><b>${formula.leftOk ? "✓" : "✕"}</b></span><i>AND</i><span class="${formula.rightOk ? "pass" : "fail"}"><small>RIGHT BOUND</small><code>${formula.nodeValue} &lt; ${formula.right?.empty ? "+∞" : formula.right?.min ?? "invalid"}</code><b>${formula.rightOk ? "✓" : "✕"}</b></span></div><div class="size"><small>BST SIZE CANDIDATE</small><code>${formula.left?.size ?? 0} + 1 + ${formula.right?.size ?? 0}</code><strong>${formula.candidateSize}</strong></div><div class="decision"><small>${vi ? "QUYẾT ĐỊNH" : "DECISION"}</small><strong>${formula.valid === null ? (vi ? "Child states đã sẵn sàng; kiểm tra BST tiếp theo" : "Child states ready; validate the BST next") : formula.valid === false ? (vi ? "INVALID → không cập nhật best" : "INVALID → do not update best") : formula.updated === null ? (vi ? "BST hợp lệ; so size với best tiếp theo" : "Valid BST; compare its size with best next") : formula.updated ? `best: ${formula.bestBefore} → ${formula.bestAfter}` : `best = ${formula.bestAfter}`}</strong></div></section>`
    : `<section class="lb333-rule"><strong>POSTORDER STATE</strong><code>(is_bst, min_value, max_value, subtree_size)</code><span>${vi ? "Hai cây con phải là BST và left.max < node < right.min." : "Both children must be BSTs and left.max < node < right.min."}</span></section>`;
  const historyHtml = history.length
    ? history.map((item, index) => `<span class="${item.id === bestNodeId ? "best" : item.isBst ? "bst" : "invalid"}"><small>#${index + 1} · node ${escapeHtml(String(item.value))}</small><strong>${item.isBst ? `BST · size ${item.size}` : "INVALID"}</strong><em>best ${item.bestAfter}</em></span>`).join("")
    : `<em>${vi ? "Chưa node nào trả state" : "No node has returned a state yet"}</em>`;
  const currentNode = currentId === null || currentId === undefined ? null : nodeMap.get(currentId);
  const bestNode = bestNodeId === null || bestNodeId === undefined ? null : nodeMap.get(bestNodeId);
  const final = Boolean(view.final || view.phase === "done");

  $("treeView").innerHTML = `<section class="lb333-viz" role="img" aria-label="Largest BST Subtree visualization"><header><div><small>POSTORDER DFS · BST STATE · #333</small><strong>${vi ? "SUBTREE BST LỚN NHẤT" : "LARGEST BST SUBTREE"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header><div class="lb333-phases">${phases}</div><section class="lb333-summary"><div><small>${vi ? "NODE HIỆN TẠI" : "CURRENT NODE"}</small><strong>${currentNode ? currentNode.value : "—"}</strong></div><div><small>${vi ? "ĐÃ TRẢ STATE" : "RETURNED STATES"}</small><strong>${view.processed || 0}/${view.totalNodes || nodes.length}</strong></div><div><small>BEST ROOT</small><strong>${bestNode ? bestNode.value : "∅"}</strong></div><div class="best"><small>BEST SIZE</small><strong>${view.best || 0}</strong></div></section><section class="lb333-tree"><header><strong>${vi ? "STATE ĐƯỢC GỘP TỪ LÁ LÊN" : "STATES COMBINED BOTTOM-UP"}</strong><span>${vi ? "xanh = BST tốt nhất · đỏ = invalid · cam = hiện tại" : "green = best BST · red = invalid · orange = current"}</span></header><div><svg class="lb333-tree-svg ${fit ? "fit" : "scroll"}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMin meet" ${fit ? "" : `style="min-width:${width}px"`} aria-hidden="true"><g class="edges">${edges}</g>${treeNodes}</svg></div></section><section class="lb333-stack"><header><strong>RECURSION STACK</strong><span>${vi ? "cha chờ state của hai con" : "a parent waits for both child states"}</span></header><div>${stackHtml}</div></section>${formulaHtml}<section class="lb333-history"><header><strong>${vi ? "STATE TRẢ VỀ THEO POSTORDER" : "STATES RETURNED IN POSTORDER"}</strong><span>BST / INVALID · size · best</span></header><div>${historyHtml}</div></section><section class="lb333-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"} · ${escapeHtml(String(view.operation || ""))}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section><footer class="lb333-result ${final ? "done" : ""}"><small>LARGEST BST SIZE</small><strong>${final ? view.answer : view.best || 0}</strong><span>${final ? (bestNode ? (vi ? `Subtree gốc ${bestNode.value} có ${view.answer} node.` : `The BST rooted at ${bestNode.value} has ${view.answer} nodes.`) : (vi ? "Cây rỗng có kích thước 0." : "The empty tree has size 0.")) : (vi ? "min/max bảo đảm thứ tự BST trên toàn subtree." : "min/max enforces BST ordering across the whole subtree.")}</span></footer></section>`;
}

function renderMaximumAverage1120View(step) {
  const view = step.maximumAverage1120View || {};
  const vi = lang === "vi";
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const ranking = Array.isArray(view.ranking) ? view.ranking : [];
  const currentId = view.current;
  const bestNodeId = view.bestNode;
  const bestSubtreeIds = new Set(Array.isArray(view.bestSubtreeIds) ? view.bestSubtreeIds : []);
  const formula = view.formula || null;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const short = (value) => Number.isFinite(Number(value)) ? Number(value).toFixed(2) : "—";
  const precise = (value) => Number.isFinite(Number(value)) ? Number(value).toFixed(5) : "—";
  const phaseLabels = vi
    ? ["1. DFS từ lá lên", "2. Tính sum / count", "3. So với best", "4. Maximum average"]
    : ["1. DFS from leaves", "2. Compute sum / count", "3. Compare with best", "4. Maximum average"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const maxDepth = nodes.reduce((max, node) => Math.max(max, Number(node.y) || 0), 0);
  const maxX = nodes.reduce((max, node) => Math.max(max, Number(node.x) || 0), 0);
  const horizontalGap = 112;
  const contentWidth = maxX * horizontalGap;
  const treeWidth = Math.max(360, contentWidth + 192);
  const treeHeight = Math.max(220, (maxDepth + 1) * 112 + 72);
  const xOffset = (treeWidth - contentWidth) / 2;
  const xOf = (node) => xOffset + (Number(node.x) || 0) * horizontalGap;
  const yOf = (node) => 64 + (Number(node.y) || 0) * 112;
  const fitTreeToFrame = nodes.length <= 15;
  const edges = nodes.filter((node) => node.parentId !== null && nodeMap.has(node.parentId)).map((node) => {
    const parent = nodeMap.get(node.parentId);
    const isBestEdge = bestSubtreeIds.has(node.id) && bestSubtreeIds.has(parent.id);
    return `<line class="${isBestEdge ? "best" : ""}" x1="${xOf(parent)}" y1="${yOf(parent) + 27}" x2="${xOf(node)}" y2="${yOf(node) - 27}" />`;
  }).join("");
  const treeNodes = nodes.map((node) => {
    const isCurrent = node.id === currentId;
    const isBestRoot = node.id === bestNodeId;
    const state = String(node.state || "unvisited");
    const stateLabel = isBestRoot
      ? (vi ? "BEST ROOT" : "BEST ROOT")
      : state === "checked"
        ? (vi ? "ĐÃ SO SÁNH" : "CHECKED")
        : state === "combine"
          ? (vi ? "ĐANG TÍNH" : "COMPUTE")
          : state === "waiting"
            ? (vi ? "CHỜ CON" : "WAITING")
            : (vi ? "CHƯA THĂM" : "UNVISITED");
    const details = node.average === null || node.average === undefined
      ? "sum ?, n ?, avg ?"
      : `sum ${node.sum} / n ${node.count} · avg ${short(node.average)}`;
    return `<g class="as2265-node ma1120-node ${escapeHtml(state)} ${isCurrent ? "current" : ""} ${isBestRoot ? "best-root" : ""} ${bestSubtreeIds.has(node.id) ? "best-subtree" : ""}" transform="translate(${xOf(node)} ${yOf(node)})">
      <circle r="28"></circle>
      <text class="value" text-anchor="middle" y="6">${escapeHtml(String(node.value))}</text>
      <text class="state" text-anchor="middle" y="47">${escapeHtml(stateLabel)}</text>
      <text class="stats" text-anchor="middle" y="66">${escapeHtml(details)}</text>
    </g>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((id, index) => {
      const node = nodeMap.get(id);
      return `<span class="${id === currentId ? "current" : ""}"><small>${index === 0 ? "ROOT" : `DEPTH ${index}`}</small><strong>${node ? node.value : "?"}</strong></span>`;
    }).join("<i>→</i>")
    : `<em>${vi ? "Stack đã trống" : "The stack is empty"}</em>`;
  const formulaHtml = formula
    ? `<section class="as2265-formula ma1120-formula ${formula.updated === true ? "update" : formula.updated === false ? "keep" : ""}">
        <header><strong>${vi ? `ỨNG VIÊN: SUBTREE GỐC ${formula.nodeValue}` : `CANDIDATE: SUBTREE ROOTED AT ${formula.nodeValue}`}</strong><span>${vi ? "gộp con trái + node + con phải" : "combine left child + node + right child"}</span></header>
        <div class="sum-row"><span><small>LEFT SUM</small><strong>${formula.leftSum}</strong></span><i>+</i><span><small>NODE</small><strong>${formula.nodeValue}</strong></span><i>+</i><span><small>RIGHT SUM</small><strong>${formula.rightSum}</strong></span><b>=</b><span class="total"><small>SUBTREE SUM</small><strong>${formula.sum}</strong></span></div>
        <div class="count-row"><span><small>LEFT COUNT</small><strong>${formula.leftCount}</strong></span><i>+</i><span><small>NODE</small><strong>1</strong></span><i>+</i><span><small>RIGHT COUNT</small><strong>${formula.rightCount}</strong></span><b>=</b><span class="total"><small>SUBTREE COUNT</small><strong>${formula.count}</strong></span></div>
        <div class="compare"><span><small>CANDIDATE AVERAGE</small><strong>${formula.sum} / ${formula.count} = ${precise(formula.average)}</strong></span><b>${formula.updated === null ? "?" : formula.firstCandidate ? "INIT" : formula.updated ? ">" : "≤"}</b><span><small>BEST BEFORE</small><strong>${formula.firstCandidate ? "—" : precise(formula.bestBefore)}</strong></span></div>
        <div class="ma1120-decision"><small>${vi ? "QUYẾT ĐỊNH" : "DECISION"}</small><strong>${formula.updated === null ? (vi ? "Đã tính candidate, tiếp theo so với best" : "Candidate ready; compare it with best next") : formula.updated ? (vi ? `Cập nhật best = ${precise(formula.bestAfter)}` : `Update best = ${precise(formula.bestAfter)}`) : (vi ? `Giữ best = ${precise(formula.bestAfter)}` : `Keep best = ${precise(formula.bestAfter)}`)}</strong></div>
      </section>`
    : `<section class="as2265-rule ma1120-rule"><b>POSTORDER DFS</b><div><span><strong>LEFT</strong><small>(sum, count)</small></span><i>→</i><span><strong>RIGHT</strong><small>(sum, count)</small></span><i>→</i><span><strong>NODE</strong><small>average = sum / count</small></span></div><p>${vi ? "Mỗi node đại diện cho một subtree. Tính từ lá lên để có đủ sum và count, rồi giữ average lớn nhất." : "Every node represents one subtree. Work upward from leaves to get sum and count, then retain the largest average."}</p></section>`;
  const rankingHtml = ranking.length
    ? ranking.map((item, index) => `<article class="${item.id === bestNodeId ? "best" : ""}"><small>#${index + 1} · ROOT ${item.value}</small><strong>${precise(item.average)}</strong><span>${item.sum} / ${item.count}</span></article>`).join("")
    : `<em>${vi ? "Chưa có subtree nào được tính" : "No subtree has been computed yet"}</em>`;
  const final = Boolean(step.final || view.phase === "done");

  $("treeView").innerHTML = `<section class="as2265-viz ma1120-viz" role="img" aria-label="Maximum Average Subtree visualization">
    <header><div><small>POSTORDER DFS · TREE · #1120</small><strong>MAXIMUM AVERAGE SUBTREE</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="as2265-phases ma1120-phases">${phases}</div>
    <section class="as2265-summary ma1120-summary"><div><small>${vi ? "NODE ĐANG XÉT" : "CURRENT NODE"}</small><strong>${currentId === null || currentId === undefined ? "—" : nodeMap.get(currentId)?.value ?? "—"}</strong></div><div><small>${vi ? "ĐÃ TÍNH XONG" : "PROCESSED"}</small><strong>${view.processed || 0}/${view.totalNodes || nodes.length}</strong></div><div class="answer"><small>BEST AVERAGE</small><strong>${precise(view.best)}</strong></div></section>
    <section class="as2265-tree ma1120-tree"><header><strong>${vi ? "TÍNH AVERAGE TỪ DƯỚI LÊN" : "AVERAGES COMPUTED BOTTOM-UP"}</strong><span>${vi ? "vàng = subtree tốt nhất · cam = node hiện tại" : "gold = best subtree · orange = current node"}</span></header><div><svg class="as2265-tree-svg ${fitTreeToFrame ? "fit" : "scroll"}" viewBox="0 0 ${treeWidth} ${treeHeight}" preserveAspectRatio="xMidYMin meet" ${fitTreeToFrame ? "" : `style="min-width:${treeWidth}px"`} aria-hidden="true"><g class="edges">${edges}</g>${treeNodes}</svg></div></section>
    <section class="as2265-stack"><header><strong>RECURSION STACK</strong><span>${vi ? "node cha chờ sum và count từ các con" : "parents wait for child sums and counts"}</span></header><div>${stackHtml}</div></section>
    ${formulaHtml}
    <section class="ma1120-ranking"><header><strong>${vi ? "XẾP HẠNG SUBTREE ĐÃ TÍNH" : "COMPUTED SUBTREE RANKING"}</strong><span>${vi ? "sắp theo average giảm dần" : "sorted by descending average"}</span></header><div>${rankingHtml}</div></section>
    <section class="as2265-action"><small>${escapeHtml(String(view.event || "postorder").toUpperCase())}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="as2265-result ma1120-result ${final ? "done" : ""}"><small>MAXIMUM AVERAGE</small><strong>${final ? precise(view.best) : "…"}</strong><span>${final ? (vi ? `Subtree tốt nhất có gốc ${nodeMap.get(bestNodeId)?.value ?? "—"} và được tô vàng trên cây.` : `The best subtree is rooted at ${nodeMap.get(bestNodeId)?.value ?? "—"} and highlighted in gold.`) : (vi ? "Mỗi node được so sánh đúng một lần sau khi hai cây con hoàn tất." : "Each node is compared once after both child subtrees finish.")}</span></footer>
  </section>`;
}

function renderDescendantSum1973View(step) {
  const view = step.descendantSum1973View || {};
  const vi = lang === "vi";
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const currentId = view.current;
  const formula = view.formula || null;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["1. DFS xuống hai con", "2. Cộng tổng hai subtree", "3. So sánh node", "4. Trả số lượng"]
    : ["1. DFS into children", "2. Add both subtree sums", "3. Compare the node", "4. Return the count"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const maxDepth = nodes.reduce((max, node) => Math.max(max, Number(node.y) || 0), 0);
  const maxX = nodes.reduce((max, node) => Math.max(max, Number(node.x) || 0), 0);
  const horizontalGap = 118;
  const contentWidth = maxX * horizontalGap;
  const treeWidth = Math.max(360, contentWidth + 204);
  const treeHeight = Math.max(220, (maxDepth + 1) * 116 + 76);
  const xOffset = (treeWidth - contentWidth) / 2;
  const xOf = (node) => xOffset + (Number(node.x) || 0) * horizontalGap;
  const yOf = (node) => 66 + (Number(node.y) || 0) * 116;
  const fitTreeToFrame = nodes.length <= 15;
  const edges = nodes.filter((node) => node.parentId !== null && nodeMap.has(node.parentId)).map((node) => {
    const parent = nodeMap.get(node.parentId);
    return `<line class="${node.state === "match" ? "match" : ""}" x1="${xOf(parent)}" y1="${yOf(parent) + 27}" x2="${xOf(node)}" y2="${yOf(node) - 27}" />`;
  }).join("");
  const treeNodes = nodes.map((node) => {
    const isCurrent = node.id === currentId;
    const state = String(node.state || "unvisited");
    const stateLabel = state === "match"
      ? "MATCH"
      : state === "miss"
        ? (vi ? "KHÔNG KHỚP" : "NO MATCH")
        : state === "combine"
          ? (vi ? "ĐANG CỘNG" : "ADDING")
          : state === "waiting"
            ? (vi ? "CHỜ CON" : "WAITING")
            : (vi ? "CHƯA THĂM" : "UNVISITED");
    const details = node.descendantSum === null || node.descendantSum === undefined
      ? "descendants = ?"
      : `desc ${node.descendantSum} · subtree ${node.subtreeSum}`;
    return `<g class="as2265-node ds1973-node ${escapeHtml(state)} ${isCurrent ? "current" : ""}" transform="translate(${xOf(node)} ${yOf(node)})">
      <circle r="28"></circle>
      <text class="value" text-anchor="middle" y="6">${escapeHtml(String(node.value))}</text>
      <text class="state" text-anchor="middle" y="47">${escapeHtml(stateLabel)}</text>
      <text class="stats" text-anchor="middle" y="66">${escapeHtml(details)}</text>
    </g>`;
  }).join("");
  const stackHtml = stack.length
    ? stack.map((id, index) => {
      const node = nodeMap.get(id);
      return `<span class="${id === currentId ? "current" : ""}"><small>${index === 0 ? "ROOT" : `DEPTH ${index}`}</small><strong>${node ? node.value : "?"}</strong></span>`;
    }).join("<i>→</i>")
    : `<em>${vi ? "Stack đã trống" : "The stack is empty"}</em>`;
  const formulaHtml = formula
    ? `<section class="as2265-formula ds1973-formula ${formula.match === true ? "match" : formula.match === false ? "miss" : ""}">
        <header><strong>${vi ? `TÍNH TẠI NODE ${formula.nodeValue}` : `COMPUTE AT NODE ${formula.nodeValue}`}</strong><span>${vi ? "chỉ cộng hậu duệ, không cộng node hiện tại" : "add descendants only; exclude the current node"}</span></header>
        <div class="ds1973-sum"><span><small>LEFT SUBTREE SUM</small><strong>${formula.leftSum}</strong></span><i>+</i><span><small>RIGHT SUBTREE SUM</small><strong>${formula.rightSum}</strong></span><b>=</b><span class="total"><small>DESCENDANT SUM</small><strong>${formula.descendantSum}</strong></span></div>
        <div class="compare"><span><small>NODE.VALUE</small><strong>${formula.nodeValue}</strong></span><b>${formula.match === null ? "?" : formula.match ? "=" : "≠"}</b><span><small>DESCENDANT SUM</small><strong>${formula.descendantSum}</strong></span></div>
        <div class="ds1973-return"><small>${vi ? "TRẢ VỀ CHO CHA" : "RETURN TO PARENT"}</small><strong>${formula.nodeValue} + ${formula.descendantSum} = ${formula.subtreeSum}</strong><span>${formula.match === null ? (vi ? "Đã có tổng, bước sau mới so sánh" : "The sum is ready; compare in the next step") : formula.match ? (vi ? "MATCH → answer + 1" : "MATCH → answer + 1") : (vi ? "Không match → answer giữ nguyên" : "No match → answer stays unchanged")}</span></div>
      </section>`
    : `<section class="as2265-rule ds1973-rule"><b>POSTORDER DFS</b><div><span><strong>LEFT</strong><small>subtree sum</small></span><i>+</i><span><strong>RIGHT</strong><small>subtree sum</small></span><i>→</i><span><strong>COMPARE</strong><small>node vs descendants</small></span></div><p>${vi ? "Điểm dễ nhầm: descendant sum không chứa chính node hiện tại. Lá luôn có descendant sum = 0, nên chỉ lá mang giá trị 0 mới match." : "Key detail: the descendant sum excludes the current node. Every leaf has descendant sum = 0, so only a zero-valued leaf matches."}</p></section>`;
  const resultsHtml = results.length
    ? results.map((item) => `<article class="${item.match ? "match" : "miss"}"><small>NODE ${item.value}</small><strong>${item.value} ${item.match ? "=" : "≠"} ${item.descendantSum}</strong><span>${item.match ? "+1" : "+0"} · return ${item.subtreeSum}</span></article>`).join("")
    : `<em>${vi ? "Chưa có node nào được tính xong" : "No node has finished yet"}</em>`;
  const final = Boolean(step.final || view.phase === "done");

  $("treeView").innerHTML = `<section class="as2265-viz ds1973-viz" role="img" aria-label="Count Nodes Equal to Sum of Descendants visualization">
    <header><div><small>POSTORDER DFS · TREE · #1973 · PREMIUM</small><strong>${vi ? "NODE = TỔNG HẬU DUỆ" : "NODE = DESCENDANT SUM"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="as2265-phases ds1973-phases">${phases}</div>
    <section class="as2265-summary ds1973-summary"><div><small>${vi ? "NODE ĐANG XÉT" : "CURRENT NODE"}</small><strong>${currentId === null || currentId === undefined ? "—" : nodeMap.get(currentId)?.value ?? "—"}</strong></div><div><small>${vi ? "ĐÃ TÍNH XONG" : "PROCESSED"}</small><strong>${view.processed || 0}/${view.totalNodes || nodes.length}</strong></div><div class="answer"><small>MATCHING NODES</small><strong>${view.answer || 0}</strong></div></section>
    <section class="as2265-tree ds1973-tree"><header><strong>${vi ? "TÍNH TỪ LÁ LÊN GỐC" : "COMPUTE FROM LEAVES TO ROOT"}</strong><span>${vi ? "xanh = match · đỏ = không match · cam = hiện tại" : "green = match · red = no match · orange = current"}</span></header><div><svg class="as2265-tree-svg ${fitTreeToFrame ? "fit" : "scroll"}" viewBox="0 0 ${treeWidth} ${treeHeight}" preserveAspectRatio="xMidYMin meet" ${fitTreeToFrame ? "" : `style="min-width:${treeWidth}px"`} aria-hidden="true"><g class="edges">${edges}</g>${treeNodes}</svg></div></section>
    <section class="as2265-stack"><header><strong>RECURSION STACK</strong><span>${vi ? "node cha chờ tổng subtree từ hai con" : "parents wait for both child subtree sums"}</span></header><div>${stackHtml}</div></section>
    ${formulaHtml}
    <section class="ds1973-results"><header><strong>${vi ? "CÁC NODE ĐÃ SO SÁNH" : "COMPLETED COMPARISONS"}</strong><span>node.val ? descendant_sum</span></header><div>${resultsHtml}</div></section>
    <section class="as2265-action"><small>${escapeHtml(String(view.event || "postorder").toUpperCase())}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="as2265-result ds1973-result ${final ? "done" : ""}"><small>${vi ? "SỐ NODE THỎA" : "MATCHING NODES"}</small><strong>${final ? view.answer : "…"}</strong><span>${final ? (vi ? "Mỗi node xanh có node.val = tổng của tất cả hậu duệ." : "Every green node has node.val equal to the sum of all descendants.") : (vi ? "Lá có descendant sum = 0; node cha nhận tổng đầy đủ của từng subtree con." : "A leaf has descendant sum 0; a parent receives each child's complete subtree sum.")}</span></footer>
  </section>`;
}

function renderMissingIntegerView(step) {
  const view = step.missingIntegerView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const seen = Array.isArray(view.seen) ? view.seen : [];
  const candidates = Array.isArray(view.candidates) ? view.candidates : [];
  const prefixEnd = Number.isInteger(view.prefixEnd) ? view.prefixEnd : -1;
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : -1;
  const candidate = view.candidate === null || view.candidate === undefined ? null : Number(view.candidate);
  const status = Array.isArray(view.status) ? view.status : [];
  const phase = String(view.phase || "prefix");
  const seenSet = new Set(seen.map((value) => String(value)));

  const numsHtml = nums.map((num, index) => {
    const classes = ["mi2996-num"];
    if (index <= prefixEnd) classes.push("is-prefix");
    if (index === currentIndex) classes.push("is-current");
    if (candidate !== null && num === candidate) classes.push("is-candidate-hit");
    return `<span class="${classes.join(" ")}"><small>i=${index}</small><strong>${escapeHtml(String(num))}</strong></span>`;
  }).join("");

  const seenHtml = seen.length
    ? seen.map((value) => `<span class="${candidate !== null && Number(value) === candidate ? "is-hit" : ""}">${escapeHtml(String(value))}</span>`).join("")
    : `<span class="mi2996-empty">∅</span>`;
  const candidateItems = candidates.length ? candidates : (candidate !== null ? [{ value: candidate, exists: seenSet.has(String(candidate)) }] : []);
  const candidatesHtml = candidateItems.length
    ? candidateItems.map((item) => `<span class="${item.exists ? "exists" : "missing"}"><small>${item.exists ? (vi ? "có" : "seen") : (vi ? "thiếu" : "missing")}</small><strong>${escapeHtml(String(item.value))}</strong></span>`).join("")
    : `<span class="mi2996-empty">${vi ? "chưa kiểm tra" : "not checked yet"}</span>`;
  const statusHtml = status.map((item) => `<span><small>${escapeHtml(String(item.label ?? ""))}</small><strong>${escapeHtml(String(item.value ?? "-"))}</strong></span>`).join("");

  const phaseLabel = phase === "prefix"
    ? (vi ? "1 · Tìm prefix liên tiếp" : "1 · Find sequential prefix")
    : phase === "prefix-stop"
      ? (vi ? "2 · Chốt prefix sum" : "2 · Fix prefix sum")
      : phase === "set"
        ? (vi ? "3 · Tạo hash set" : "3 · Build hash set")
        : phase === "candidate"
          ? (vi ? "4 · Nhảy candidate" : "4 · Advance candidate")
          : (vi ? "5 · Trả đáp án" : "5 · Return answer");
  const action = phase === "prefix"
    ? (vi ? "Cộng các số từ đầu khi mỗi số tăng đúng 1." : "Add numbers from the start while each value increases by exactly 1.")
    : phase === "prefix-stop"
      ? (vi ? "Prefix dừng ở chỗ đầu tiên không nối tiếp." : "The prefix stops at the first non-sequential value.")
      : phase === "set"
        ? (vi ? "Set giúp kiểm tra candidate có trong nums hay không." : "The set lets us check whether a candidate is in nums.")
        : phase === "candidate"
          ? (vi ? "Candidate đã có trong nums, tăng thêm 1." : "The candidate exists in nums, so increment it.")
          : (vi ? "Candidate đầu tiên không có trong nums là đáp án." : "The first candidate missing from nums is the answer.");

  $("treeView").innerHTML = `<div class="mi2996-viz phase-${escapeHtml(phase)}">
    <div class="mi2996-summary">
      <span><small>prefix sum</small><strong>${escapeHtml(String(view.sum ?? 0))}</strong></span>
      <span><small>candidate</small><strong>${escapeHtml(candidate === null ? "-" : String(candidate))}</strong></span>
      <span><small>${vi ? "prefix" : "prefix"}</small><strong>${prefixEnd >= 0 ? `[0..${prefixEnd}]` : "-"}</strong></span>
    </div>
    <section class="mi2996-section">
      <header><strong>${escapeHtml(phaseLabel)}</strong><span>${escapeHtml(action)}</span></header>
      <div class="mi2996-nums">${numsHtml}</div>
    </section>
    <div class="mi2996-two-col">
      <section class="mi2996-section">
        <header><strong>SET(NUMS)</strong><span>${vi ? "dùng để kiểm tra O(1)" : "used for O(1) lookup"}</span></header>
        <div class="mi2996-seen">${seenHtml}</div>
      </section>
      <section class="mi2996-section">
        <header><strong>${vi ? "CANDIDATE" : "CANDIDATE"}</strong><span>${escapeHtml(String(view.decision || ""))}</span></header>
        <div class="mi2996-candidates">${candidatesHtml}</div>
      </section>
    </div>
    <div class="mi2996-status">${statusHtml}</div>
  </div>`;
}

function renderFenwickView(step) {
  const view = step.fenwickView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const bit = Array.isArray(view.bit) ? view.bit : [];
  const activeNums = new Set(Array.isArray(view.activeNums) ? view.activeNums : []);
  const activeBit = new Set(Array.isArray(view.activeBit) ? view.activeBit : []);
  const visitedBit = new Set(Array.isArray(view.visitedBit) ? view.visitedBit : []);
  const path = Array.isArray(view.path) ? view.path : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const mode = ["build", "update", "query"].includes(view.mode) ? view.mode : "idle";
  const minWidth = Math.max(0, Math.max(nums.length, bit.length) * 76);

  const numsCells = nums.map((value, index) => `<div class="fenwick-cell nums-cell${activeNums.has(index) ? " active" : ""}">
    <span>nums[${index}]</span>
    <strong>${escapeHtml(String(value))}</strong>
  </div>`).join("");

  const bitCells = bit.map((value, zeroIndex) => {
    const index = zeroIndex + 1;
    const lowbit = index & -index;
    const rangeLeft = index - lowbit;
    const rangeRight = index - 1;
    const classes = [
      "fenwick-cell",
      "bit-cell",
      activeBit.has(index) ? "active" : "",
      visitedBit.has(index) ? "visited" : "",
    ].filter(Boolean).join(" ");
    const label = `BIT ${index}, sum ${value}, covers nums ${rangeLeft} through ${rangeRight}`;
    return `<div class="${classes}" aria-label="${escapeHtml(label)}">
      <span>BIT[${index}]</span>
      <strong>${escapeHtml(String(value))}</strong>
      <small>[${rangeLeft}..${rangeRight}]</small>
    </div>`;
  }).join("");

  const pathText = path.length > 0
    ? path.map((index) => `BIT[${escapeHtml(String(index))}]`).join(" → ")
    : (lang === "vi" ? "chưa có node" : "no nodes yet");
  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");
  const modeLabel = {
    build: lang === "vi" ? "build" : "build",
    update: "update",
    query: lang === "vi" ? "truy vấn" : "query",
    idle: lang === "vi" ? "chờ" : "idle",
  }[mode];

  $("treeView").innerHTML = `<div class="fenwick-viz mode-${mode}">
    <div class="fenwick-mode"><span>${escapeHtml(modeLabel)}</span><strong>${pathText}</strong></div>
    <div class="fenwick-scroll">
      <div class="fenwick-content" style="--fenwick-cols:${Math.max(1, Math.max(nums.length, bit.length))};--fenwick-min-width:${minWidth}px">
        <div class="fenwick-heading">nums (0-based)</div>
        <div class="fenwick-row nums-row">${numsCells}</div>
        <div class="fenwick-heading">Fenwick Tree (1-based)</div>
        <div class="fenwick-row bit-row">${bitCells}</div>
      </div>
    </div>
    <div class="fenwick-status">${statusItems}</div>
  </div>`;
}

// ---- 2569 Handling Sum Queries After Update (lazy flip segment tree) ----
function renderSumQueriesView(step) {
  const view = step.sumQueriesView || {};
  const vi = lang === "vi";
  const n = Number(view.n) || 0;
  const nums1 = Array.isArray(view.nums1) ? view.nums1 : [];
  const nums2 = Array.isArray(view.nums2) ? view.nums2 : [];
  const tree = Array.isArray(view.tree) ? view.tree : [];
  const queries = Array.isArray(view.queries) ? view.queries : [];
  const answers = Array.isArray(view.answers) ? view.answers : [];
  const active = new Set(view.activeNodes || []);
  const pushed = new Set(view.pushedNodes || []);
  const covered = new Set(view.coveredNodes || []);
  const qi = Number.isInteger(view.queryIndex) ? view.queryIndex : -1;
  const flipRange = Array.isArray(view.flipRange) ? view.flipRange : null;
  const phase = view.phase || "";

  // ── Phase bar ───────────────────────────────────────────────────────────
  const stageOf = { intro: 0, build: 1, ready: 1, flip: 2, push: 2, add: 2, sum: 2, done: 3 };
  const stage = stageOf[phase] === undefined ? 0 : stageOf[phase];
  const labels = vi
    ? ["Ý tưởng", "Build cây đếm bit 1", "Chạy queries", "Kết quả"]
    : ["Key idea", "Build ones-tree", "Run queries", "Result"];
  const phases = labels.map((label, i) => {
    const cls = i < stage ? "done" : i === stage ? "active" : "";
    return `<span class="${cls}">${i < stage ? "✓" : i + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // ── Arrays ──────────────────────────────────────────────────────────────
  const inFlip = (i) => flipRange && i >= flipRange[0] && i <= flipRange[1];
  const bitCells = nums1.map((b, i) => {
    const cls = ["sq2569-bit", b === 1 ? "one" : "zero"];
    if (inFlip(i)) cls.push("inflip");
    return `<div class="${cls.join(" ")}"><small>${i}</small><strong>${b}</strong></div>`;
  }).join("");
  const valCells = nums2.map((v, i) => `<div class="sq2569-val${inFlip(i) ? " inflip" : ""}"><small>${i}</small><strong>${escapeHtml(v)}</strong></div>`).join("");

  // ── Tree: one column per index, each node spans the range it covers ─────
  const byDepth = new Map();
  tree.forEach((nd) => {
    if (!byDepth.has(nd.depth)) byDepth.set(nd.depth, []);
    byDepth.get(nd.depth).push(nd);
  });
  const treeRows = [...byDepth.keys()].sort((a, b) => a - b).map((depth) => {
    const cells = byDepth.get(depth).slice().sort((a, b) => a.lo - b.lo).map((nd) => {
      const cls = ["sq2569-node"];
      if (active.has(nd.node)) cls.push("active");
      if (pushed.has(nd.node)) cls.push("pushed");
      if (covered.has(nd.node)) cls.push("covered");
      if (nd.lazy) cls.push("lazy");
      if (nd.ones === nd.size && nd.size > 0) cls.push("allones");
      const label = nd.lo === nd.hi ? `[${nd.lo}]` : `[${nd.lo},${nd.hi}]`;
      return `<div class="${cls.join(" ")}" style="grid-column:${nd.lo + 1} / span ${nd.size}"
        aria-label="${escapeHtml(`node ${nd.node} covers ${label}, ones ${nd.ones} of ${nd.size}${nd.lazy ? ", lazy" : ""}`)}">
        <small>t[${nd.node}] ${escapeHtml(label)}</small>
        <strong>${nd.ones}<em>/${nd.size}</em></strong>
        ${nd.lazy ? `<b class="sq2569-flag">lazy</b>` : ""}
      </div>`;
    }).join("");
    return `<div class="sq2569-row"><small>L${depth}</small><div class="sq2569-nodes" style="--sq2569-cols:${Math.max(1, n)}">${cells}</div></div>`;
  }).join("");

  // ── Queries timeline ────────────────────────────────────────────────────
  let ansCursor = 0;
  const qChips = queries.map((q, i) => {
    const [kind, a, b] = q;
    const cls = ["sq2569-q", `k${kind}`];
    if (i === qi) cls.push("active");
    if (i < qi || (phase === "done")) cls.push("past");
    let text;
    if (kind === 1) text = `flip [${a},${b}]`;
    else if (kind === 2) text = `+= ${a}·ones`;
    else text = "sum";
    let tail = "";
    if (kind === 3) {
      const shown = ansCursor < answers.length ? answers[ansCursor] : null;
      ansCursor += 1;
      if (shown !== null && (i < qi || phase === "done" || (i === qi && phase === "sum"))) tail = ` → ${shown}`;
    }
    return `<span class="${cls.join(" ")}"><small>#${i} · t${kind}</small><b>${escapeHtml(text)}${escapeHtml(tail)}</b></span>`;
  }).join("");

  // ── Decision copy ───────────────────────────────────────────────────────
  const root = tree.find((nd) => nd.node === 1);
  const rootOnes = root ? root.ones : 0;
  const decisionText = {
    intro: vi ? "Type-2 chỉ cộng p vào các index có bit 1 → tổng tăng p × (số bit 1). Không cần sửa nums2 từng phần tử." : "A type-2 query only adds p where the bit is 1 → the sum grows by p × (count of ones). No need to touch nums2 element by element.",
    "build-leaf": vi ? "Lá lưu chính bit tại index đó." : "A leaf stores the bit at its index.",
    "build-merge": vi ? "Node cha = tổng số bit 1 của hai con." : "A parent equals the sum of its children's ones.",
    ready: vi ? "Cây xong. ones[1] ở root là số bit 1 toàn mảng." : "Tree ready. ones[1] at the root is the count of ones over the whole array.",
    "query-flip": vi ? "Flip một đoạn — dùng lazy để tránh sửa từng phần tử." : "Flip a range — lazy propagation avoids per-element work.",
    "flip-disjoint": vi ? "Đoạn này không giao vùng cần flip → bỏ qua." : "This segment is disjoint from the flip range → skip.",
    "flip-cover": vi ? "Phủ trọn → ones = size − ones, đặt lazy, và DỪNG tại đây." : "Fully covered → ones = size − ones, set lazy, and STOP here.",
    "flip-split": vi ? "Giao một phần → phải đi vào cả hai con." : "Partial overlap → must recurse into both children.",
    "push-down": vi ? "Node có lazy → áp flip cho hai con rồi xóa cờ ở node này." : "The node is lazy → apply the flip to both children, then clear its own flag.",
    "flip-recombine": vi ? "Gộp lại giá trị cho node cha sau khi hai con đã đổi." : "Recombine the parent after both children changed.",
    "flip-done": vi ? "Flip hoàn tất; root đã phản ánh số bit 1 mới." : "Flip complete; the root now reflects the new count of ones.",
    "query-add": vi ? `total += p × ones[1] — chỉ một phép nhân, O(1).` : `total += p × ones[1] — a single multiplication, O(1).`,
    "query-sum": vi ? "Trả về total hiện tại, O(1)." : "Report the current total, O(1).",
    done: vi ? "Xong: type-1 O(log n), type-2 và type-3 O(1)." : "Done: type-1 is O(log n), type-2 and type-3 are O(1).",
  }[view.decision] || (vi ? "Đang xử lý." : "Processing.");

  const isDone = phase === "done";
  const pLine = view.p === null || view.p === undefined ? "" : `<span>p = ${escapeHtml(view.p)}</span>`;
  const flipLine = flipRange ? `<span>flip [${flipRange[0]}, ${flipRange[1]}]</span>` : "";

  $("treeView").innerHTML = `<section class="sq2569-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa lazy segment tree cho #2569" : "Lazy segment tree visualization for #2569")}">
    <div class="sq2569-phases">${phases}</div>

    <div class="sq2569-scoreboard">
      <div class="big"><small>total = sum(nums2)</small><strong>${escapeHtml(view.total)}</strong></div>
      <div><small>ones[1] ${vi ? "(số bit 1)" : "(count of ones)"}</small><strong>${rootOnes}<em>/${n}</em></strong></div>
      <div><small>${vi ? "ĐÁP ÁN" : "ANSWERS"}</small><strong>[${answers.join(", ")}]</strong></div>
    </div>

    <section class="sq2569-block">
      <header><strong>${vi ? "TRUY VẤN" : "QUERIES"}</strong><span>${vi ? "t1 = flip · t2 = cộng p·ones · t3 = đọc total" : "t1 = flip · t2 = add p·ones · t3 = read total"}</span></header>
      <div class="sq2569-queries">${qChips}</div>
    </section>

    <section class="sq2569-block">
      <header><strong>nums1 ${vi ? "(bit)" : "(bits)"}</strong><span>${vi ? "vàng = đang trong vùng flip" : "amber = inside the flip range"}</span></header>
      <div class="sq2569-arr" style="--sq2569-cols:${Math.max(1, n)}">${bitCells}</div>
      <header><strong>nums2 ${vi ? "(giá trị — chỉ để tham khảo)" : "(values — reference only)"}</strong><span>${vi ? "thuật toán không sửa mảng này" : "the algorithm never mutates this array"}</span></header>
      <div class="sq2569-arr" style="--sq2569-cols:${Math.max(1, n)}">${valCells}</div>
    </section>

    <section class="sq2569-block">
      <header><strong>${vi ? "LAZY SEGMENT TREE · ones / size" : "LAZY SEGMENT TREE · ones / size"}</strong><span>${vi ? "node rộng đúng bằng đoạn nó phủ" : "each node is as wide as the range it covers"}</span></header>
      <div class="sq2569-tree">${treeRows}</div>
      <div class="sq2569-legend">
        <span><i class="lg-active"></i>${vi ? "đang xét" : "active"}</span>
        <span><i class="lg-cover"></i>${vi ? "phủ trọn → flip & dừng" : "fully covered → flip & stop"}</span>
        <span><i class="lg-push"></i>${vi ? "vừa nhận lazy" : "just received lazy"}</span>
        <span><i class="lg-lazy"></i>${vi ? "đang mang cờ lazy" : "carries a lazy flag"}</span>
      </div>
    </section>

    <div class="sq2569-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(decisionText)}</strong>
      <div>${flipLine}${pLine}<span>total = ${escapeHtml(view.total)}</span><span>ones[1] = ${rootOnes}</span></div>
    </div>
  </section>`;
}

function renderSegmentTreeView(step) {
  const view = step.segmentTreeView || {};
  const mapMode = view.mapMode === true;
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const tree = Array.isArray(view.tree) ? view.tree : [];
  const coverage = Array.isArray(view.coverage) ? view.coverage : [];
  const activeNums = new Set(Array.isArray(view.activeNums) ? view.activeNums : []);
  const activeTree = new Set(Array.isArray(view.activeTree) ? view.activeTree : []);
  const selectedTree = new Set(Array.isArray(view.selectedTree) ? view.selectedTree : []);
  const path = Array.isArray(view.path) ? view.path : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const mode = ["build", "update", "query"].includes(view.mode) ? view.mode : "idle";
  const nodeCount = tree.length;

  const numsCells = nums.map((value, index) => `<div class="segment-tree-cell nums-cell${activeNums.has(index) ? " active" : ""}">
    <span>nums[${index}]</span>
    <strong>${escapeHtml(String(value))}</strong>
  </div>`).join("");

  const levels = [];
  for (let start = 1; start <= nodeCount; start *= 2) {
    const end = Math.min(start * 2 - 1, nodeCount);
    const nodes = [];
    for (let index = start; index <= end; index += 1) nodes.push(index);
    levels.push(nodes);
  }

  // Every level shares ONE column grid sized to the deepest level, and each node
  // spans the columns it actually covers. That makes a parent sit exactly above
  // its two children instead of each level stretching independently (which used
  // to misalign the levels and clip the deepest one).
  const maxLevel = Math.max(0, levels.length - 1);
  const totalCols = Math.pow(2, maxLevel);

  const treeLevels = levels.map((nodes, levelIndex) => {
    const span = Math.pow(2, maxLevel - levelIndex);
    const firstIndex = Math.pow(2, levelIndex);
    const cells = nodes.map((index) => {
      const value = tree[index - 1];
      const covers = Array.isArray(coverage[index - 1]) ? coverage[index - 1] : [];
      const coverageText = covers.length ? `{${covers.join(",")}}` : "{}";
      const classes = [
        "segment-tree-cell",
        "tree-cell",
        activeTree.has(index) ? "active" : "",
        selectedTree.has(index) ? "selected" : "",
      ].filter(Boolean).join(" ");
      const startCol = (index - firstIndex) * span + 1;
      return `<div class="${classes}" style="grid-column:${startCol} / span ${span}" aria-label="${escapeHtml(`tree ${index}, value ${value}, covers ${coverageText}`)}">
        <span>tree[${index}]</span>
        <strong>${escapeHtml(String(value))}</strong>
        <small>${escapeHtml(coverageText)}</small>
      </div>`;
    }).join("");
    return `<div class="segment-tree-level">
      <div class="segment-tree-level-label">L${levelIndex}</div>
      <div class="segment-tree-level-nodes">${cells}</div>
    </div>`;
  }).join("");

  const pathText = path.length > 0
    ? path.map((index) => `tree[${escapeHtml(String(index))}]`).join(" -> ")
    : (lang === "vi" ? "chưa có node" : "no nodes yet");
  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");
  const modeLabel = {
    build: "build",
    update: "update",
    query: lang === "vi" ? "truy vấn" : "query",
    idle: lang === "vi" ? "chờ" : "idle",
  }[mode];

  $("treeView").innerHTML = `<div class="segment-tree-viz mode-${mode}${mapMode ? " map-mode" : ""}">
    <div class="segment-tree-mode"><span>${escapeHtml(modeLabel)}</span><strong>${pathText}</strong></div>
    <div class="segment-tree-scroll">
      <div class="segment-tree-heading">nums (0-based)</div>
      <div class="segment-tree-nums" style="--segment-nums-cols:${Math.max(1, nums.length)}">${numsCells}</div>
      <div class="segment-tree-heading">${mapMode ? "Segment Tree · {value: frequency}" : "Segment Tree array (1-based display)"}</div>
      <div class="segment-tree-levels" style="--segment-total-cols:${totalCols}">${treeLevels}</div>
    </div>
    <div class="segment-tree-status">${statusItems}</div>
  </div>`;
}

function renderEvenOddRatioView(step) {
  const view = step.evenOddRatioView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const weights = Array.isArray(view.weights) ? view.weights : [];
  const pref = Array.isArray(view.pref) ? view.pref : [];
  const values = Array.isArray(view.values) ? view.values : [];
  const bit = Array.isArray(view.bit) ? view.bit : [];
  const eligible = new Set(Array.isArray(view.eligiblePrefixIndices) ? view.eligiblePrefixIndices : []);
  const queryPath = new Set(Array.isArray(view.queryPath) ? view.queryPath : []);
  const updatePath = new Set(Array.isArray(view.updatePath) ? view.updatePath : []);
  const currentPrefixIndex = Number.isInteger(view.currentPrefixIndex) ? view.currentPrefixIndex : -1;
  const currentNumIndex = Number.isInteger(view.currentNumIndex) ? view.currentNumIndex : -1;
  const currentValue = currentPrefixIndex >= 0 ? pref[currentPrefixIndex] : null;
  const vi = lang === "vi";
  const countPhase = ![
    "prefix-init", "transform-read", "transform-weight", "prefix-append", "compress", "bit-init",
  ].includes(view.phase);
  const phaseIndex = ["compress", "bit-init"].includes(view.phase) ? 1 : countPhase ? 2 : 0;
  const phaseLabels = vi
    ? ["1. Đổi trọng số", "2. Nén prefix", "3. Fenwick đếm"]
    : ["1. Transform", "2. Compress prefixes", "3. Fenwick count"];
  const phasesHtml = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : ""}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`).join("");

  const numsHtml = nums.map((num, index) => {
    const isEven = num % 2 === 0;
    const weight = weights[index];
    const classes = ["even-odd-ratio-number", isEven ? "is-even" : "is-odd"];
    if (index === currentNumIndex) classes.push("is-current");
    if (weight === null || weight === undefined) classes.push("is-pending");
    return `<div class="${classes.join(" ")}">
      <span>nums[${index}]</span>
      <strong>${escapeHtml(num)}</strong>
      <small>${isEven ? "EVEN" : "ODD"} · ${weight === null || weight === undefined ? "?" : weight > 0 ? `+${weight}` : weight}</small>
    </div>`;
  }).join("");

  const prefixHtml = pref.map((value, index) => {
    const classes = ["even-odd-ratio-prefix"];
    let status = "";
    if (index === currentPrefixIndex) {
      classes.push("is-current");
      status = vi ? "HIỆN TẠI" : "CURRENT";
    } else if (view.phase !== "done" && currentPrefixIndex >= 0 && index < currentPrefixIndex) {
      if (eligible.has(index)) {
        classes.push("is-eligible");
        status = `≥ ${currentValue}`;
      } else {
        classes.push("is-smaller");
        status = `< ${currentValue}`;
      }
    } else if (view.phase !== "done" && countPhase && index > currentPrefixIndex) {
      classes.push("is-future");
      status = vi ? "CHƯA QUÉT" : "FUTURE";
    }
    return `<div class="${classes.join(" ")}">
      <span>pref[${index}]</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(status)}</small>
    </div>`;
  }).join("");

  const fenwickHtml = values.length
    ? values.map((value, zeroIndex) => {
        const index = zeroIndex + 1;
        const lowbit = index & -index;
        const left = index - lowbit + 1;
        const classes = ["even-odd-ratio-bit"];
        if (index === view.rank) classes.push("is-rank");
        if (queryPath.has(index)) classes.push("is-query");
        if (updatePath.has(index)) classes.push("is-update");
        const pathLabel = queryPath.has(index) ? "QUERY" : updatePath.has(index) ? "UPDATE" : "";
        return `<div class="${classes.join(" ")}">
          <span>rank ${index} · value ${escapeHtml(value)}</span>
          <strong>BIT[${index}] = ${escapeHtml(bit[zeroIndex] ?? 0)}</strong>
          <small>[rank ${left}..${index}]${pathLabel ? ` · ${pathLabel}` : ""}</small>
        </div>`;
      }).join("")
    : `<div class="even-odd-ratio-empty">${vi ? "Chưa nén tọa độ" : "Coordinates not compressed yet"}</div>`;

  const isQuery = String(view.phase || "").startsWith("query");
  const isUpdate = String(view.phase || "").startsWith("update");
  const smallerValue = view.smaller === null || view.smaller === undefined
    ? (isQuery ? view.queryTotal : "—")
    : view.smaller;
  const smallerLabel = isQuery && (view.smaller === null || view.smaller === undefined) ? "QUERY TOTAL" : "SMALLER";
  const addedValue = view.smaller === null || view.smaller === undefined ? "—" : view.added;
  const queryLabel = queryPath.size
    ? [...queryPath].map((index) => `BIT[${index}]`).join(" → ")
    : (vi ? "chưa đi qua node" : "no nodes visited");
  const updateLabel = updatePath.size
    ? [...updatePath].map((index) => `BIT[${index}]`).join(" → ")
    : (vi ? "chưa đi qua node" : "no nodes visited");
  const pathHtml = isQuery
    ? `<span class="is-query"><small>QUERY PATH</small><strong>${escapeHtml(queryLabel)}</strong></span>`
    : isUpdate
      ? `<span class="is-update"><small>UPDATE PATH</small><strong>${escapeHtml(updateLabel)}</strong></span>`
      : `<span><small>${vi ? "PREFIX HIỆN TẠI" : "CURRENT PREFIX"}</small><strong>${currentValue === null ? "—" : escapeHtml(currentValue)}</strong></span>`;
  const countEquation = view.phase === "done"
    ? `answer = ${escapeHtml(view.ans ?? 0)}`
    : view.smaller === null || view.smaller === undefined
      ? `${escapeHtml(view.seen ?? 0)} − smaller = ?`
      : `${escapeHtml(view.seen)} − ${escapeHtml(view.smaller)} = ${escapeHtml(view.added)}`;
  const summary = vi
    ? `Prefix hiện tại ${currentValue ?? "chưa có"}; đã thấy ${view.seen ?? 0}; đáp án ${view.ans ?? 0}.`
    : `Current prefix ${currentValue ?? "none"}; ${view.seen ?? 0} seen; answer ${view.ans ?? 0}.`;

  $("treeView").innerHTML = `<section class="even-odd-ratio-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="even-odd-ratio-phases">${phasesHtml}</div>
    <div class="even-odd-ratio-formula">
      <span class="is-even"><small>EVEN</small><strong>+b = +${escapeHtml(view.b)}</strong></span>
      <i aria-hidden="true">+</i>
      <span class="is-odd"><small>ODD</small><strong>−a = −${escapeHtml(view.a)}</strong></span>
      <i aria-hidden="true">⇒</i>
      <code>b·x − a·y ≤ 0</code>
      <i aria-hidden="true">⇒</i>
      <code>pref[current] ≤ pref[start]</code>
    </div>
    <div class="even-odd-ratio-strip">
      <header><strong>nums → weight</strong><small>${vi ? "chẵn +b · lẻ −a" : "even +b · odd −a"}</small></header>
      <div class="even-odd-ratio-scroll"><div class="even-odd-ratio-number-row">${numsHtml}</div></div>
    </div>
    <div class="even-odd-ratio-strip">
      <header><strong>prefix timeline</strong><small>${vi ? "prefix trước ≥ prefix hiện tại là một start hợp lệ" : "previous prefix ≥ current prefix is a valid start"}</small></header>
      <div class="even-odd-ratio-scroll"><div class="even-odd-ratio-prefix-row">${prefixHtml}</div></div>
    </div>
    <div class="even-odd-ratio-strip is-fenwick">
      <header><strong>compressed ranks + Fenwick</strong><small>${vi ? "query(rank−1) đếm prefix nhỏ hơn" : "query(rank−1) counts smaller prefixes"}</small></header>
      <div class="even-odd-ratio-scroll"><div class="even-odd-ratio-bit-row">${fenwickHtml}</div></div>
    </div>
    <div class="even-odd-ratio-counts">
      ${pathHtml}
      <span><small>SEEN</small><strong>${escapeHtml(view.seen ?? 0)}</strong></span>
      <span class="is-smaller"><small>${escapeHtml(smallerLabel)}</small><strong>${escapeHtml(smallerValue)}</strong></span>
      <span class="is-valid"><small>${vi ? "START HỢP LỆ" : "VALID STARTS"}</small><strong>${escapeHtml(addedValue)}</strong></span>
      <span class="is-answer"><small>ANSWER</small><strong>${escapeHtml(view.ans ?? 0)}</strong></span>
    </div>
    <div class="even-odd-ratio-equation"><span>${view.phase === "done" ? (vi ? "HOÀN TẤT" : "COMPLETE") : "seen − smaller"}</span><strong>${countEquation}</strong><small>${view.phase === "done" ? (vi ? "đã xử lý mọi prefix" : "all prefixes processed") : (vi ? "prefix trước ≥ current" : "previous prefixes ≥ current")}</small></div>
    <div class="even-odd-ratio-legend" aria-hidden="true">
      <span><i class="current"></i>${vi ? "prefix hiện tại" : "current prefix"}</span>
      <span><i class="eligible"></i>${vi ? "start hợp lệ (≥)" : "valid start (≥)"}</span>
      <span><i class="smaller"></i>${vi ? "bị query đếm (<)" : "counted as smaller (<)"}</span>
      <span><i class="query"></i>query path</span>
      <span><i class="update"></i>update path</span>
    </div>
  </section>`;
}

function renderSkylineView(step) {
  const view = step.skylineView || {};
  const buildings = Array.isArray(view.buildings) ? view.buildings : [];
  const skyline = Array.isArray(view.skyline) ? view.skyline : [];
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const activeIds = new Set(Array.isArray(view.activeBuildingIds) ? view.activeBuildingIds : []);
  const sweepX = Number.isFinite(view.sweepX) ? view.sweepX : null;

  if (buildings.length === 0) {
    $("treeView").innerHTML = `<div class="skyline-empty">${escapeHtml(lang === "vi" ? "Chưa có tòa nhà hợp lệ." : "No valid buildings.")}</div>`;
    return;
  }

  const width = 760;
  const height = 340;
  const pad = { left: 48, right: 22, top: 24, bottom: 46 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const minX = Math.min(...buildings.map((building) => building[0]));
  const maxX = Math.max(...buildings.map((building) => building[1]));
  const maxBuildingHeight = Math.max(1, ...buildings.map((building) => building[2]));
  const xRange = Math.max(1, maxX - minX);
  const xScale = (value) => pad.left + ((value - minX) / xRange) * plotWidth;
  const yScale = (value) => pad.top + plotHeight - (value / maxBuildingHeight) * plotHeight;
  const groundY = yScale(0);

  const yTicks = [...new Set([0, Math.round(maxBuildingHeight / 2), maxBuildingHeight])].sort((a, b) => a - b);
  const allXTicks = [...new Set(buildings.flatMap((building) => [building[0], building[1]]))].sort((a, b) => a - b);
  const tickStride = Math.max(1, Math.ceil(allXTicks.length / 10));
  const xTicks = allXTicks.filter((_, index) => index % tickStride === 0 || index === allXTicks.length - 1);

  const gridLines = yTicks.map((tick) => {
    const y = yScale(tick);
    return `<line class="skyline-grid" x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}"></line>
      <text class="skyline-axis-label" x="${pad.left - 10}" y="${y + 4}" text-anchor="end">${tick}</text>`;
  }).join("");

  const xAxisLabels = xTicks.map((tick) => {
    const x = xScale(tick);
    return `<line class="skyline-tick" x1="${x}" y1="${groundY}" x2="${x}" y2="${groundY + 5}"></line>
      <text class="skyline-axis-label" x="${x}" y="${groundY + 22}" text-anchor="middle">${tick}</text>`;
  }).join("");

  const buildingRects = buildings.map(([left, right, buildingHeight], index) => {
    const x = xScale(left);
    const y = yScale(buildingHeight);
    const rectWidth = Math.max(1, xScale(right) - x);
    const rectHeight = groundY - y;
    return `<g class="skyline-building${activeIds.has(index) ? " active" : ""}">
      <rect x="${x}" y="${y}" width="${rectWidth}" height="${rectHeight}"></rect>
      <title>[${left}, ${right}, ${buildingHeight}]</title>
    </g>`;
  }).join("");

  let skylinePath = "";
  if (skyline.length > 0) {
    skylinePath = `M ${xScale(skyline[0][0])} ${groundY} L ${xScale(skyline[0][0])} ${yScale(skyline[0][1])}`;
    for (let index = 1; index < skyline.length; index++) {
      const [x, current] = skyline[index];
      const previous = skyline[index - 1][1];
      skylinePath += ` L ${xScale(x)} ${yScale(previous)} L ${xScale(x)} ${yScale(current)}`;
    }
    const lastPoint = skyline[skyline.length - 1];
    if (sweepX !== null && sweepX > lastPoint[0]) {
      skylinePath += ` L ${xScale(sweepX)} ${yScale(lastPoint[1])}`;
    }
  }

  const keyPoints = skyline.length <= 14 ? skyline.map(([x, value]) => {
    const px = xScale(x);
    const py = yScale(value);
    const labelY = value === 0 ? py - 9 : Math.max(pad.top + 12, py - 9);
    return `<circle class="skyline-key-point" cx="${px}" cy="${py}" r="4"></circle>
      <text class="skyline-key-label" x="${px}" y="${labelY}" text-anchor="middle">${escapeXml(`[${x},${value}]`)}</text>`;
  }).join("") : "";

  const sweepLine = sweepX === null ? "" : `<line class="skyline-sweep" x1="${xScale(sweepX)}" y1="${pad.top}" x2="${xScale(sweepX)}" y2="${groundY}"></line>
    <text class="skyline-sweep-label" x="${xScale(sweepX)}" y="${pad.top - 7}" text-anchor="middle">x=${sweepX}</text>`;

  const heapItems = heap.length > 0
    ? heap.map((entry, index) => {
      const stale = sweepX !== null && entry.right <= sweepX;
      return `<span class="skyline-heap-entry${index === 0 ? " root" : ""}${stale ? " stale" : ""}">
        ${index === 0 ? `<strong>${escapeHtml(lang === "vi" ? "root" : "root")}</strong> ` : ""}h${escapeHtml(entry.height)} → ${escapeHtml(entry.right)}${stale ? ` (${escapeHtml(lang === "vi" ? "hết hạn" : "expired")})` : ""}
      </span>`;
    }).join("")
    : `<span class="skyline-heap-empty">${escapeHtml(lang === "vi" ? "heap rỗng" : "empty heap")}</span>`;

  const summary = lang === "vi"
    ? `Biểu đồ ${buildings.length} tòa nhà; đường quét ${sweepX === null ? "chưa bắt đầu" : `tại x=${sweepX}`}; skyline hiện có ${skyline.length} điểm.`
    : `Chart of ${buildings.length} buildings; sweep line ${sweepX === null ? "not started" : `at x=${sweepX}`}; current skyline has ${skyline.length} points.`;

  $("treeView").innerHTML = `<div class="skyline-viz">
    <svg class="skyline-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(summary)}">
      <title>${escapeXml(summary)}</title>
      ${gridLines}
      ${xAxisLabels}
      ${buildingRects}
      ${sweepLine}
      ${skylinePath ? `<path class="skyline-outline" d="${skylinePath}"></path>` : ""}
      ${keyPoints}
    </svg>
    <div class="skyline-heap" aria-label="${escapeHtml(lang === "vi" ? "Trạng thái max-heap" : "Max-heap state")}">
      <span class="skyline-heap-label">max-heap</span>
      ${heapItems}
    </div>
  </div>`;
}

// ---- Closed-interval sorting and merging (#56) ----
function renderMergeIntervalsView(step) {
  const view = step.mergeIntervalsView;
  const vi = lang === "vi";
  const { intervals, merged, currentIndex, previousLast, phase } = view;
  const current = currentIndex === null ? null : intervals[currentIndex];
  const min = Math.min(...intervals.map((interval) => interval.start));
  const max = Math.max(...intervals.map((interval) => interval.end));
  // A point interval still gets a visible, centered endpoint marker.
  const low = min === max ? min - 1 : min;
  const high = min === max ? max + 1 : max;
  const percent = (value) => (2 + 96 * (value - low) / (high - low)).toFixed(4);
  const pairText = ([start, end]) => `[${start}, ${end}]`;
  const applied = phase === "append" || phase === "merge";

  function row(pair, label, state, description, extension = null) {
    const [start, end] = pair;
    const extensionBar = extension !== null && end > extension
      ? `<i class="mi56-extension" style="left:${percent(extension)}%;width:${(96 * (end - extension) / (high - low)).toFixed(4)}%"></i>` : "";
    return `<div class="mi56-row ${state}" role="listitem" aria-label="${escapeHtml(description)}">
      <span class="mi56-label"><small>${escapeHtml(label)}</small><code>${pairText(pair)}</code></span>
      <div class="mi56-track" aria-hidden="true">
        <i class="mi56-bar" style="left:${percent(start)}%;width:${(96 * (end - start) / (high - low)).toFixed(4)}%"></i>
        ${extensionBar}
        <i class="mi56-endpoint" style="left:${percent(start)}%"></i>
        <i class="mi56-endpoint" style="left:${percent(end)}%"></i>
      </div>
    </div>`;
  }

  const inputs = intervals.map(({ id, start, end }, i) => {
    const active = i === currentIndex;
    const state = active ? "current" : i < view.processed ? "processed" : "pending";
    const status = active ? (vi ? "đang xét" : "current") : i < view.processed ? (vi ? "đã xử lý" : "processed") : (vi ? "chờ" : "pending");
    return row([start, end], `${active ? "▶ " : i < view.processed ? "✓ " : ""}#${id + 1}`, state, `#${id + 1}: ${pairText([start, end])}, ${status}`);
  }).join("");
  const output = merged.length ? merged.map((pair, i) => {
    const last = i === merged.length - 1;
    const target = last && current;
    return row(pair, `merged[${i}]`, `result${target ? " target" : ""}`, `${pairText(pair)}${target ? (vi ? ", đoạn cuối đang xét" : ", last interval under comparison") : ""}`,
      last && phase === "merge" ? previousLast[1] : null);
  }).join("") : `<p class="mi56-empty">merged = []</p>`;

  let decision = vi ? "Sắp xếp theo start trước khi duyệt." : "Sort by start before scanning.";
  if (phase === "init") decision = vi ? "merged = [] · sẵn sàng duyệt" : "merged = [] · ready to scan";
  if (current) {
    decision = !previousLast
      ? (vi ? "merged rỗng → thêm đoạn đầu tiên" : "merged is empty → append the first interval")
      : `start ${current.start} ${current.start > previousLast[1] ? ">" : "≤"} ${previousLast[1]} ${vi ? "(end cũ)" : "(last end)"} → ${current.start > previousLast[1] ? (vi ? "thêm mới" : "append") : (vi ? "gộp" : "merge")}`;
    if (phase === "inspect") decision = vi ? "So sánh start với điểm cuối của merged[-1]." : "Compare start with the end of merged[-1].";
    if (phase === "merge") decision = `end = max(${previousLast[1]}, ${current.end}) = ${merged[merged.length - 1][1]}`;
  }
  if (phase === "done") decision = vi ? `${intervals.length} đoạn đầu vào → ${merged.length} đoạn không chồng lấn` : `${intervals.length} input intervals → ${merged.length} non-overlapping intervals`;
  const update = applied
    ? `<div class="mi56-update"><span>${phase === "append" ? "merged.append" : "merged[-1]"}</span><code>${phase === "merge" ? `${pairText(previousLast)} → ` : ""}${pairText(merged[merged.length - 1])}</code></div>` : "";
  const ticks = [low, low + (high - low) / 2, high].map((value, i) => `<span class="tick-${i}" style="left:${percent(value)}%">${Number(value.toFixed(1))}</span>`).join("");
  const orderLabel = phase === "input" ? (vi ? "Thứ tự đầu vào" : "Input order") : (vi ? "Đã sắp theo start ↑" : "Sorted by start ↑");
  $("treeView").innerHTML = `<section class="mi56-viz" aria-label="${vi ? "Trực quan hóa gộp đoạn" : "Merge intervals visualization"}">
    <header class="mi56-heading"><strong>${orderLabel}</strong><span>${vi ? "# = vị trí ban đầu" : "# = original position"}</span></header>
    <div class="mi56-axis"><span>${vi ? "Tọa độ" : "Position"}</span><div>${ticks}</div></div>
    <div class="mi56-lanes" role="list" aria-label="${orderLabel}">${inputs}</div>
    <div class="mi56-decision" aria-live="polite"><strong>${escapeHtml(decision)}</strong>${update}</div>
    <header class="mi56-heading"><strong>${phase === "done" ? (vi ? "Kết quả" : "Result") : "merged"}</strong><span>${vi ? "Cùng thang tọa độ" : "Same coordinate scale"}</span></header>
    <div class="mi56-lanes" role="list" aria-label="${vi ? "Các đoạn đã gộp" : "Merged intervals"}">${output}</div>
    <div class="mi56-legend"><span><i class="current"></i>${vi ? "Đang xét" : "Current"}</span><span><i class="result"></i>${vi ? "Đã gộp" : "Merged"}</span><span>${vi ? "● Đoạn đóng: chạm đầu mút cũng gộp" : "● Closed endpoints: touching also merges"}</span></div>
  </section>`;
}

// ---- Meeting-room allocation timeline (#253) ----
function renderMeetingRoomsTimelineView(step) {
  const view = step.meetingRoomsTimelineView;
  const intervals = view.intervals || [];
  const assignments = view.assignments || [];
  const el = $("treeView");
  if (!intervals.length) {
    el.innerHTML = `<div class="meeting-timeline-empty">${lang === "vi" ? "Không có cuộc họp" : "No meetings"}</div>`;
    return;
  }

  const minTime = Math.min(...intervals.map((meeting) => meeting.start));
  const maxTime = Math.max(...intervals.map((meeting) => meeting.end));
  const span = Math.max(1, maxTime - minTime);
  const width = 820;
  const left = 105;
  const right = 24;
  const top = 42;
  const rowHeight = 58;
  const selectedRoom = Number.isInteger(view.selectedRoom) ? view.selectedRoom : null;
  // Do not draw a room lane before that room actually exists. In Approach 2,
  // pq is still empty while the first meeting is only being inspected.
  const roomCount = Math.max(0, view.roomCount || 0, selectedRoom === null ? 0 : selectedRoom + 1);
  const axisY = top + (roomCount + 1) * rowHeight + 4;
  const height = axisY + 42;
  const plotWidth = width - left - right;
  const x = (time) => left + ((time - minTime) / span) * plotWidth;
  const current = Number.isInteger(view.currentIndex) ? intervals[view.currentIndex] : null;
  const currentAssigned = current && assignments.some((meeting) => meeting.meetingIndex === view.currentIndex);

  const tickValues = [...new Set(intervals.flatMap((meeting) => [meeting.start, meeting.end]))].sort((a, b) => a - b);
  const shownTicks = tickValues.length <= 9
    ? tickValues
    : Array.from({ length: 6 }, (_, index) => minTime + (span * index) / 5);
  const ticks = shownTicks.map((time) => {
    const px = x(time);
    const label = Number.isInteger(time) ? time : Number(time.toFixed(1));
    return `<line class="rooms-timeline-grid" x1="${px}" y1="${top - 18}" x2="${px}" y2="${axisY}"></line>
      <text class="rooms-timeline-tick" x="${px}" y="${axisY + 23}" text-anchor="middle">${label}</text>`;
  }).join("");

  const lanes = Array.from({ length: roomCount }, (_, room) => {
    const y = top + (room + 1) * rowHeight;
    return `<line class="rooms-lane-line" x1="${left}" y1="${y + 20}" x2="${width - right}" y2="${y + 20}"></line>
      <text class="rooms-lane-label" x="${left - 12}" y="${y + 24}" text-anchor="end">Room ${room + 1}</text>`;
  }).join("");

  const meetingBars = assignments.map((meeting) => {
    const y = top + (meeting.room + 1) * rowHeight;
    const isSelected = selectedRoom === meeting.room && meeting.meetingIndex === view.currentIndex;
    return `<g class="rooms-meeting${isSelected ? " selected" : ""}">
      <rect x="${x(meeting.start)}" y="${y + 5}" width="${Math.max(5, x(meeting.end) - x(meeting.start))}" height="30" rx="7"></rect>
      <text x="${(x(meeting.start) + x(meeting.end)) / 2}" y="${y + 25}" text-anchor="middle">[${meeting.start}, ${meeting.end}]</text>
      <title>Room ${meeting.room + 1}: [${meeting.start}, ${meeting.end}]</title>
    </g>`;
  }).join("");

  let currentBar = "";
  if (current && !currentAssigned) {
    const targetRow = selectedRoom === null ? 0 : selectedRoom + 1;
    const y = top + targetRow * rowHeight;
    currentBar = `<g class="rooms-current-meeting">
      <text class="rooms-lane-label current" x="${left - 12}" y="${y + 24}" text-anchor="end">${targetRow === 0 ? (lang === "vi" ? "Đang xét" : "Inspecting") : `Room ${targetRow}`}</text>
      <rect x="${x(current.start)}" y="${y + 5}" width="${Math.max(5, x(current.end) - x(current.start))}" height="30" rx="7"></rect>
      <text x="${(x(current.start) + x(current.end)) / 2}" y="${y + 25}" text-anchor="middle">[${current.start}, ${current.end}]</text>
    </g>`;
  }

  const sweepLine = current
    ? `<line class="rooms-start-line" x1="${x(current.start)}" y1="${top - 18}" x2="${x(current.start)}" y2="${axisY}"></line>
       <text class="rooms-start-label" x="${x(current.start) + 5}" y="${top - 23}">start=${current.start}</text>`
    : "";
  const sortedChips = intervals.map((meeting, index) => {
    const done = assignments.some((assigned) => assigned.meetingIndex === index);
    const active = view.currentIndex === index;
    return `<span class="rooms-sorted-chip${done ? " done" : ""}${active ? " active" : ""}">[${meeting.start},${meeting.end}]</span>`;
  }).join("");
  const heapChips = (view.heap || []).length
    ? view.heap.map((entry, index) => `<span class="rooms-heap-chip${index === 0 ? " root" : ""}">R${entry.room + 1} · end ${entry.end}</span>`).join("")
    : `<span class="rooms-heap-empty">∅</span>`;

  const decisionText = {
    reuse: lang === "vi" ? `Tái sử dụng Room ${selectedRoom + 1}` : `Reuse Room ${selectedRoom + 1}`,
    new: lang === "vi" ? "Cần tạo phòng mới" : "Create a new room",
    reused: lang === "vi" ? `Đã tái sử dụng Room ${selectedRoom + 1}` : `Reused Room ${selectedRoom + 1}`,
    created: lang === "vi" ? `Đã tạo Room ${selectedRoom + 1}` : `Created Room ${selectedRoom + 1}`,
    done: lang === "vi" ? `Tối thiểu ${view.roomCount} phòng` : `Minimum ${view.roomCount} rooms`,
  }[view.decision] || "";
  const summary = lang === "vi"
    ? `Timeline phân bổ ${intervals.length} cuộc họp vào ${view.roomCount} phòng.`
    : `Timeline allocating ${intervals.length} meetings across ${view.roomCount} rooms.`;

  el.innerHTML = `<div class="rooms-timeline-viz">
    <div class="rooms-sorted-row"><span>${lang === "vi" ? "Thứ tự:" : "Order:"}</span>${sortedChips}</div>
    <svg class="rooms-timeline-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(summary)}">
      <title>${escapeXml(summary)}</title>
      ${ticks}
      <line class="rooms-timeline-axis" x1="${left}" y1="${axisY}" x2="${width - right}" y2="${axisY}"></line>
      ${lanes}
      ${meetingBars}
      ${currentBar}
      ${sweepLine}
    </svg>
    ${decisionText ? `<div class="rooms-decision ${view.decision || ""}">${escapeHtml(decisionText)}</div>` : ""}
    <div class="rooms-heap-row"><span>min-heap</span>${heapChips}</div>
  </div>`;
}

// ---- Pair chain timeline (#646) ----
function renderPairChainView(step) {
  const view = step.pairChainView;
  const pairs = view.pairs || [];
  const el = $("treeView");
  if (!pairs.length) {
    el.innerHTML = `<div class="pair-chain-empty">${lang === "vi" ? "Không có cặp" : "No pairs"}</div>`;
    return;
  }

  const minTime = Math.min(...pairs.map((pair) => pair.left));
  const maxTime = Math.max(...pairs.map((pair) => pair.right));
  const span = Math.max(1, maxTime - minTime);
  const width = 820;
  const leftPad = 102;
  const rightPad = 28;
  const top = 58;
  const rowHeight = 52;
  const axisY = top + pairs.length * rowHeight + 8;
  const height = axisY + 116;
  const plotWidth = width - leftPad - rightPad;
  const x = (value) => leftPad + ((value - minTime) / span) * plotWidth;
  const chosen = new Set(view.chosen || []);
  const skipped = new Set(view.skipped || []);
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : null;
  const current = currentIndex === null ? null : pairs[currentIndex];
  const previousEnd = view.previousEnd;
  const previousEndLabel = previousEnd === null || previousEnd === undefined
    ? "-inf"
    : previousEnd === -Infinity ? "-inf" : String(previousEnd);

  const tickValues = [...new Set(pairs.flatMap((pair) => [pair.left, pair.right]))].sort((a, b) => a - b);
  const shownTicks = tickValues.length <= 10
    ? tickValues
    : Array.from({ length: 6 }, (_, index) => minTime + (span * index) / 5);
  const ticks = shownTicks.map((time) => {
    const px = x(time);
    const label = Number.isInteger(time) ? time : Number(time.toFixed(1));
    return `<line class="pair-chain-grid" x1="${px}" y1="${top - 20}" x2="${px}" y2="${axisY}"></line>
      <text class="pair-chain-tick" x="${px}" y="${axisY + 23}" text-anchor="middle">${label}</text>`;
  }).join("");

  const rows = pairs.map((pair, index) => {
    const y = top + index * rowHeight;
    const classes = ["pair-chain-interval"];
    if (chosen.has(index)) classes.push("chosen");
    if (skipped.has(index)) classes.push("skipped");
    if (index === currentIndex) classes.push("current");
    const role = chosen.has(index)
      ? (lang === "vi" ? "chọn" : "take")
      : skipped.has(index) ? (lang === "vi" ? "bỏ" : "skip") : "";
    return `<g class="${classes.join(" ")}">
      <text class="pair-chain-row-label" x="${leftPad - 12}" y="${y + 23}" text-anchor="end">P${index + 1}</text>
      <line class="pair-chain-lane" x1="${leftPad}" y1="${y + 20}" x2="${width - rightPad}" y2="${y + 20}"></line>
      <rect x="${x(pair.left)}" y="${y + 5}" width="${Math.max(7, x(pair.right) - x(pair.left))}" height="30" rx="7"></rect>
      <circle class="pair-chain-dot left" cx="${x(pair.left)}" cy="${y + 20}" r="4"></circle>
      <circle class="pair-chain-dot right" cx="${x(pair.right)}" cy="${y + 20}" r="4"></circle>
      <text class="pair-chain-bar-label" x="${(x(pair.left) + x(pair.right)) / 2}" y="${y + 25}" text-anchor="middle">[${pair.left}, ${pair.right}]</text>
      ${role ? `<text class="pair-chain-role-label" x="${leftPad - 12}" y="${y + 39}" text-anchor="end">${escapeXml(role)}</text>` : ""}
      <title>${escapeXml(`P${index + 1} [${pair.left}, ${pair.right}]`)}</title>
    </g>`;
  }).join("");

  const currentStartLine = current
    ? `<line class="pair-chain-boundary current-start" x1="${x(current.left)}" y1="${top - 24}" x2="${x(current.left)}" y2="${axisY}"></line>
       <text class="pair-chain-boundary-label current-start" x="${x(current.left) + 6}" y="${top - 30}">left=${current.left}</text>`
    : "";
  const previousEndLine = current && Number.isFinite(previousEnd)
    ? `<line class="pair-chain-boundary previous-end" x1="${x(previousEnd)}" y1="${top - 24}" x2="${x(previousEnd)}" y2="${axisY}"></line>
       <text class="pair-chain-boundary-label previous-end" x="${x(previousEnd) + 6}" y="${top - 14}">current_end=${previousEnd}</text>`
    : "";

  let decision = "";
  if (current && view.decision) {
    const ok = view.decision === "take";
    const operator = ok ? ">" : "<=";
    const result = ok
      ? (lang === "vi" ? "CHỌN" : "TAKE")
      : (lang === "vi" ? "BỎ QUA" : "SKIP");
    decision = `<div class="pair-chain-decision ${ok ? "take" : "skip"}">
      <strong>${escapeHtml(String(current.left))} ${operator} ${escapeHtml(previousEndLabel)}</strong>
      <span>${escapeHtml(result)}</span>
    </div>`;
  } else if (view.phase === "done") {
    decision = `<div class="pair-chain-decision done">
      <strong>${lang === "vi" ? "Hoàn tất" : "Done"}</strong>
      <span>${lang === "vi" ? "Chuỗi đã chọn là đáp án" : "Chosen chain is the answer"}</span>
    </div>`;
  }

  const sortedChips = pairs.map((pair, index) => {
    const classes = ["pair-chain-chip"];
    if (chosen.has(index)) classes.push("chosen");
    if (skipped.has(index)) classes.push("skipped");
    if (index === currentIndex) classes.push("current");
    return `<span class="${classes.join(" ")}">P${index + 1} [${pair.left},${pair.right}]</span>`;
  }).join("");
  const chainChips = (view.chosen || []).length
    ? view.chosen.map((index) => {
        const pair = pairs[index];
        return `<span class="pair-chain-selected">[${pair.left},${pair.right}]</span>`;
      }).join(`<span class="pair-chain-arrow">→</span>`)
    : `<span class="pair-chain-empty-chip">∅</span>`;
  const phaseLabel = {
    original: lang === "vi" ? "Input ban đầu" : "Original input",
    sorted: lang === "vi" ? "Sort theo right tăng dần" : "Sorted by right endpoint",
    init: lang === "vi" ? "Khởi tạo current_end = -inf" : "Initialize current_end = -inf",
    inspect: lang === "vi" ? "Đang kiểm tra điều kiện nối chuỗi" : "Checking whether the pair can extend the chain",
    take: lang === "vi" ? "Chọn cặp này vào chain" : "Take this pair into the chain",
    skip: lang === "vi" ? "Bỏ qua vì không nối được" : "Skip because it cannot connect",
    done: lang === "vi" ? "Kết quả cuối cùng" : "Final result",
  }[view.phase] || "";
  const summary = lang === "vi"
    ? `Pair chain gồm ${pairs.length} cặp. Các cặp được quét theo right tăng dần.`
    : `Pair chain with ${pairs.length} pairs scanned by increasing right endpoint.`;

  el.innerHTML = `<div class="pair-chain-viz">
    <div class="pair-chain-status">${escapeHtml(phaseLabel)}</div>
    <div class="pair-chain-order"><span>${lang === "vi" ? "Thứ tự quét:" : "Scan order:"}</span>${sortedChips}</div>
    <svg class="pair-chain-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(summary)}">
      <title>${escapeXml(summary)}</title>
      ${ticks}
      <line class="pair-chain-axis" x1="${leftPad}" y1="${axisY}" x2="${width - rightPad}" y2="${axisY}"></line>
      ${rows}
      ${previousEndLine}
      ${currentStartLine}
    </svg>
    ${decision}
    <div class="pair-chain-result-row"><span>${lang === "vi" ? "Chain đang chọn:" : "Current chain:"}</span><div>${chainChips}</div></div>
  </div>`;
}

// ---- Meeting interval timeline (#252) ----
function renderMeetingTimelineView(step) {
  const view = step.meetingTimelineView;
  const intervals = view.intervals || [];
  const el = $("treeView");
  if (!intervals.length) {
    el.innerHTML = `<div class="meeting-timeline-empty">${lang === "vi" ? "Không có cuộc họp" : "No meetings"}</div>`;
    return;
  }

  const minTime = Math.min(...intervals.map((interval) => interval.start));
  const maxTime = Math.max(...intervals.map((interval) => interval.end));
  const span = Math.max(1, maxTime - minTime);
  const width = 820;
  const left = 112;
  const right = 24;
  const top = 50;
  const rowHeight = 54;
  const axisY = top + intervals.length * rowHeight + 10;
  const height = axisY + 48;
  const plotWidth = width - left - right;
  const x = (time) => left + ((time - minTime) / span) * plotWidth;
  const active = new Set(view.active || []);
  const processed = new Set(view.processed || []);
  const comparison = view.comparison;

  const tickValues = [...new Set(intervals.flatMap((interval) => [interval.start, interval.end]))].sort((a, b) => a - b);
  const shownTicks = tickValues.length <= 9
    ? tickValues
    : Array.from({ length: 6 }, (_, index) => minTime + (span * index) / 5);
  const ticks = shownTicks.map((time) => {
    const px = x(time);
    const label = Number.isInteger(time) ? time : Number(time.toFixed(1));
    return `<line class="meeting-timeline-grid" x1="${px}" y1="${top - 18}" x2="${px}" y2="${axisY}"></line>
      <text class="meeting-timeline-tick" x="${px}" y="${axisY + 24}" text-anchor="middle">${label}</text>`;
  }).join("");

  let overlapBand = "";
  if (comparison && comparison.overlap === true) {
    const overlapStart = comparison.currentStart;
    const overlapEnd = comparison.previousEnd;
    const y1 = top + Math.min(comparison.previousIndex, comparison.currentIndex) * rowHeight - 7;
    const y2 = top + (Math.max(comparison.previousIndex, comparison.currentIndex) + 1) * rowHeight - 11;
    overlapBand = `<rect class="meeting-overlap-band" x="${x(overlapStart)}" y="${y1}" width="${Math.max(3, x(overlapEnd) - x(overlapStart))}" height="${y2 - y1}"></rect>
      <text class="meeting-overlap-label" x="${(x(overlapStart) + x(overlapEnd)) / 2}" y="${y1 - 8}" text-anchor="middle">${lang === "vi" ? "TRÙNG GIỜ" : "OVERLAP"}</text>`;
  }

  const rows = intervals.map((interval, index) => {
    const y = top + index * rowHeight;
    const isPrevious = comparison && comparison.previousIndex === index;
    const isCurrent = comparison && comparison.currentIndex === index;
    const classes = ["meeting-interval"];
    if (processed.has(index)) classes.push("processed");
    if (active.has(index)) classes.push(isPrevious ? "previous" : isCurrent ? "current" : "active");
    if (comparison && comparison.overlap === true && (isPrevious || isCurrent)) classes.push("conflict");
    const role = isPrevious
      ? (lang === "vi" ? "trước" : "previous")
      : isCurrent ? (lang === "vi" ? "hiện tại" : "current") : "";
    const label = `M${index + 1} [${interval.start}, ${interval.end}]`;
    return `<g class="${classes.join(" ")}">
      <text class="meeting-row-label" x="${left - 12}" y="${y + 23}" text-anchor="end">M${index + 1}</text>
      <rect x="${x(interval.start)}" y="${y + 5}" width="${Math.max(5, x(interval.end) - x(interval.start))}" height="30" rx="7"></rect>
      <text class="meeting-bar-label" x="${(x(interval.start) + x(interval.end)) / 2}" y="${y + 25}" text-anchor="middle">[${interval.start}, ${interval.end}]</text>
      ${role ? `<text class="meeting-role-label" x="${left - 12}" y="${y + 39}" text-anchor="end">${escapeXml(role)}</text>` : ""}
      <title>${escapeXml(label)}</title>
    </g>`;
  }).join("");

  let comparisonLines = "";
  let verdict = "";
  if (comparison) {
    const prevX = x(comparison.previousEnd);
    const currentX = x(comparison.currentStart);
    comparisonLines = `<line class="meeting-boundary previous" x1="${prevX}" y1="${top - 20}" x2="${prevX}" y2="${axisY}"></line>
      <line class="meeting-boundary current" x1="${currentX}" y1="${top - 20}" x2="${currentX}" y2="${axisY}"></line>`;
    if (comparison.overlap !== null) {
      const operator = comparison.overlap ? "<" : "≥";
      const result = comparison.overlap
        ? (lang === "vi" ? "Xung đột" : "Conflict")
        : (lang === "vi" ? "Không trùng" : "No conflict");
      verdict = `<div class="meeting-verdict ${comparison.overlap ? "conflict" : "safe"}">
        current_start ${comparison.currentStart} ${operator} prev_end ${comparison.previousEnd} → ${result}
      </div>`;
    }
  }

  const orderLabel = view.sorted
    ? (lang === "vi" ? "Đã sắp xếp theo start" : "Sorted by start")
    : (lang === "vi" ? "Thứ tự ban đầu" : "Original order");
  const summary = lang === "vi"
    ? `Timeline ${intervals.length} cuộc họp. ${orderLabel}.`
    : `Timeline of ${intervals.length} meetings. ${orderLabel}.`;
  el.innerHTML = `<div class="meeting-timeline-viz">
    <div class="meeting-timeline-status">${escapeHtml(orderLabel)}</div>
    <svg class="meeting-timeline-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(summary)}">
      <title>${escapeXml(summary)}</title>
      ${ticks}
      <line class="meeting-timeline-axis" x1="${left}" y1="${axisY}" x2="${width - right}" y2="${axisY}"></line>
      ${rows}
      ${overlapBand}
      ${comparisonLines}
    </svg>
    ${verdict}
  </div>`;
}

// ---- Twitter Design (#355) ----
function renderTwitterView(step) {
  const view = step.twitterView;
  const el = $("treeView");
  const vi = lang === "vi";

  // Operations list on left sidebar
  const opsHtml = (view.operations || []).map((op, i) => {
    const active = i === view.activeIndex;
    const done = i < view.activeIndex;
    return `<div class="profit-op${active ? " active" : ""}${done ? " done" : ""}">
      <span class="profit-op-index">${i}</span>
      <span>${escapeHtml(op.label)}</span>
    </div>`;
  }).join("");

  // Tweets per user
  const userIds = [...new Set([
    ...Object.keys(view.tweets),
    ...Object.keys(view.following),
  ])].map(Number).sort((a, b) => a - b);

  const tweetsHtml = userIds.map((uid) => {
    const list = (view.tweets[uid] || []);
    const items = list.length ? list.map((t) => `<span class="twitter-tweet-chip">t${t.tweetId}</span>`).join("") : `<em>—</em>`;
    return `<div class="twitter-state-row">
      <span class="twitter-label">user ${uid}</span>
      <span class="twitter-chips">${items}</span>
    </div>`;
  }).join("") || `<div class="profit-empty">${vi ? "Chưa có tweet" : "No tweets yet"}</div>`;

  // Following per user
  const followHtml = userIds.map((uid) => {
    const set = view.following[uid] || [];
    const items = set.length ? set.map((f) => `<span class="twitter-follow-chip">→${f}</span>`).join("") : `<em>—</em>`;
    return `<div class="twitter-state-row">
      <span class="twitter-label">user ${uid}</span>
      <span class="twitter-chips">${items}</span>
    </div>`;
  }).join("") || `<div class="profit-empty">${vi ? "Chưa follow ai" : "No follows yet"}</div>`;

  // Heap for current getNewsFeed call
  const heapHtml = view.heap.length
    ? view.heap.map((entry, idx) => {
        const rootBadge = idx === 0 ? `<em class="twitter-root">${vi ? "ROOT" : "ROOT"}</em>` : "";
        const focused = entry.focused ? " focused" : "";
        return `<div class="profit-heap-entry current${focused}">
          <div class="profit-heap-top"><span>[${idx}]</span>${rootBadge}</div>
          <div class="profit-heap-name">ts=${escapeHtml(String(entry.ts))} &nbsp;·&nbsp; <strong>t${escapeHtml(String(entry.tweetId))}</strong> &nbsp;·&nbsp; user ${escapeHtml(String(entry.userId))}</div>
        </div>`;
      }).join("")
    : `<div class="profit-empty">heap = []</div>`;

  // Feed results
  const feedsHtml = view.feeds.length
    ? view.feeds.map((feed) =>
        `<div class="twitter-feed-row">
          <strong>getNewsFeed(${escapeHtml(String(feed.userId))})</strong>
          &nbsp;→&nbsp;
          [${feed.result.map((t) => `t${t}`).join(", ")}]
        </div>`
      ).join("")
    : `<div class="profit-empty">${vi ? "Chưa có getNewsFeed" : "No getNewsFeed yet"}</div>`;

  el.innerHTML = `<div class="profit-tracker-viz" role="img" aria-label="Twitter Design 355">
    <div class="profit-ops">${opsHtml}</div>
    <div class="profit-state-grid">
      <section class="profit-state-panel">
        <h4>${vi ? "tweets (mới nhất ở cuối)" : "tweets (most recent last)"}</h4>
        ${tweetsHtml}
      </section>
      <section class="profit-state-panel">
        <h4>${vi ? "following" : "following"}</h4>
        ${followHtml}
      </section>
    </div>
    <section class="profit-state-panel" style="margin:6px 0">
      <h4>heap &nbsp;·&nbsp; getNewsFeed &nbsp;<small style="font-weight:400;opacity:.75">${vi ? "(ts nhỏ hơn = mới hơn)" : "(smaller ts = more recent)"}</small></h4>
      <div class="profit-heap-list">${heapHtml}</div>
    </section>
    <div class="profit-result-row">
      <strong>${vi ? "Kết quả" : "Results"}</strong>
      ${feedsHtml}
    </div>
  </div>

  <style>
    .twitter-state-row{display:flex;align-items:center;gap:6px;padding:2px 0;font-size:.82rem}
    .twitter-label{min-width:52px;color:var(--text-muted,#888);font-weight:600}
    .twitter-chips{display:flex;flex-wrap:wrap;gap:4px}
    .twitter-tweet-chip{background:var(--hl-amber,#f59e0b22);border:1px solid var(--hl-amber,#f59e0b55);border-radius:4px;padding:1px 5px;font-size:.78rem;color:var(--hl-amber,#f59e0b)}
    .twitter-follow-chip{background:var(--hl-blue,#3b82f622);border:1px solid var(--hl-blue,#3b82f655);border-radius:4px;padding:1px 5px;font-size:.78rem;color:var(--hl-blue,#3b82f6)}
    .twitter-feed-row{font-size:.82rem;padding:2px 0}
    .twitter-root{font-size:.7rem;background:var(--hl-green,#22c55e33);color:var(--hl-green,#22c55e);border-radius:3px;padding:1px 4px;margin-left:4px}
  </style>`;
}

// ---- Gas Station track (#134) ----
function renderGasStationView(step) {
  const view = step.gasStationView;
  const el = $("treeView");
  const vi = lang === "vi";
  const answerStart = (view.answer !== null && view.answer >= 0) ? view.answer : null;

  // Feasibility bar: total gas vs total cost.
  const maxSum = Math.max(view.sumGas, view.sumCost, 1);
  const gasPct = Math.round((view.sumGas / maxSum) * 100);
  const costPct = Math.round((view.sumCost / maxSum) * 100);
  const feasHtml = `
    <div class="gas-feasibility ${view.feasible ? "ok" : "bad"}">
      <div class="gas-feas-row">
        <span class="gas-feas-label">⛽ Σgas = ${view.sumGas}</span>
        <div class="gas-feas-bar"><div class="gas-feas-fill gas" style="width:${gasPct}%"></div></div>
      </div>
      <div class="gas-feas-row">
        <span class="gas-feas-label">🚗 Σcost = ${view.sumCost}</span>
        <div class="gas-feas-bar"><div class="gas-feas-fill cost" style="width:${costPct}%"></div></div>
      </div>
      <div class="gas-feas-verdict">
        ${view.feasible
          ? (vi ? `Σgas ≥ Σcost → có 1 điểm xuất phát hợp lệ` : `Σgas ≥ Σcost → one valid start exists`)
          : (vi ? `Σgas < Σcost → không thể đi hết vòng (-1)` : `Σgas < Σcost → cannot complete the loop (-1)`)}
      </div>
    </div>`;

  // Tank gauge.
  const tankNeg = view.tank < 0;
  const tankHtml = `
    <div class="gas-tank-gauge">
      <div class="gas-tank-box ${tankNeg ? "neg" : "pos"}">
        <span class="gas-tank-label">${vi ? "Bình xăng (tank)" : "Fuel tank"}</span>
        <span class="gas-tank-value">${view.tank}</span>
      </div>
      <div class="gas-start-box">
        <span class="gas-start-label">${vi ? "Ứng viên start" : "Candidate start"}</span>
        <span class="gas-start-value">${view.start < view.n ? "▶ " + view.start : (vi ? "hết" : "none")}</span>
      </div>
    </div>`;

  // Station track.
  const cardsHtml = view.stations.map((s) => {
    let cls = "state-" + s.state;
    const isAnswer = answerStart !== null && s.index === answerStart;
    if (isAnswer) cls = "state-answer";
    const isCurrent = view.currentIndex === s.index;
    const isStart = view.start === s.index && !isAnswer && view.phase !== "answer";
    if (isCurrent) cls += " is-current";
    if (isStart) cls += " is-start";
    const netCls = s.net >= 0 ? "pos" : "neg";
    const tankShown = s.tank === null ? "—" : String(s.tank);
    const tankCls = s.tank === null ? "" : (s.tank < 0 ? "neg" : "pos");
    const badge = isAnswer ? "★ START" : (isStart ? "▶ start" : (isCurrent ? (vi ? "xe ở đây" : "car here") : ""));
    return `<div class="gas-station-card ${cls}">
      <div class="gas-st-head">station ${s.index}${badge ? `<span class="gas-st-badge">${badge}</span>` : ""}</div>
      <div class="gas-st-row"><span>⛽ gas</span><strong>${s.gas}</strong></div>
      <div class="gas-st-row"><span>🚗 cost</span><strong>${s.cost}</strong></div>
      <div class="gas-st-net ${netCls}">net ${s.net >= 0 ? "+" : ""}${s.net}</div>
      <div class="gas-st-tank ${tankCls}">tank ${tankShown}</div>
    </div>`;
  }).join(`<div class="gas-arrow">→</div>`);

  const summary = vi
    ? `Trạm xăng: start=${view.start}, tank=${view.tank}.`
    : `Gas station: start=${view.start}, tank=${view.tank}.`;

  el.innerHTML = `<div class="gas-station-viz" role="img" aria-label="${escapeHtml(summary)}">
    ${feasHtml}
    ${tankHtml}
    <div class="gas-track">${cardsHtml}</div>
    <div class="gas-legend">
      <span><i class="lg-pending"></i>${vi ? "chưa tới" : "pending"}</span>
      <span><i class="lg-reached"></i>${vi ? "đã qua (tank≥0)" : "reached (tank≥0)"}</span>
      <span><i class="lg-current"></i>${vi ? "xe đang ở đây" : "car here"}</span>
      <span><i class="lg-start"></i>${vi ? "ứng viên start" : "candidate start"}</span>
      <span><i class="lg-discarded"></i>${vi ? "đã loại bỏ" : "discarded"}</span>
      <span><i class="lg-answer"></i>${vi ? "start hợp lệ" : "valid start"}</span>
    </div>
  </div>`;
}

// ---- Gas Deposits on a circular track (#9135) ----
function renderGasCircularView(step) {
  const view = step.gasCircularView;
  const el = $("treeView");
  const vi = lang === "vi";
  const C = view.circumference || 100;
  const cx = 170, cy = 170, R = 120;

  // deg measured clockwise from the top (12 o'clock = position 0).
  const polar = (deg, r) => {
    const t = (-90 + deg) * Math.PI / 180;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  };
  const angleOf = (position) => ((position % C) / C) * 360;

  // Base track circle.
  let svg = `<circle cx="${cx}" cy="${cy}" r="${R}" class="gasc-track-ring" />`;

  // Traveled arc (green). If distance >= C, show a full ring.
  if (view.pos !== null && view.distance > 0) {
    if (view.distance >= C) {
      svg += `<circle cx="${cx}" cy="${cy}" r="${R}" class="gasc-traveled-ring" />`;
    } else {
      const a0 = angleOf(view.deposits[view.startIndex].position);
      const sweep = (view.distance / C) * 360;
      const a1 = a0 + sweep;
      const [x0, y0] = polar(a0, R);
      const [x1, y1] = polar(a1, R);
      const largeArc = sweep > 180 ? 1 : 0;
      svg += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R} ${R} 0 ${largeArc} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" class="gasc-traveled-arc" />`;
    }
  }

  // Wrap marker at the top (position 0 / circumference).
  const [wx, wy] = polar(0, R);
  svg += `<line x1="${cx}" y1="${cy - R - 14}" x2="${cx}" y2="${cy - R + 14}" class="gasc-wrap-mark" />`;
  svg += `<text x="${cx}" y="${cy - R - 20}" class="gasc-wrap-text" text-anchor="middle">0 / ${C}</text>`;

  // Deposit dots + labels.
  view.deposits.forEach((d) => {
    const a = angleOf(d.position);
    const [dx, dy] = polar(a, R);
    let cls = "gasc-dot state-" + d.state;
    if (view.currentIndex === d.index) cls += " is-current";
    svg += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="11" class="${cls}" />`;
    svg += `<text x="${dx.toFixed(1)}" y="${(dy + 4).toFixed(1)}" class="gasc-dot-idx" text-anchor="middle">${d.index}</text>`;
    // Outer label with position & gas.
    const [lx, ly] = polar(a, R + 30);
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="gasc-dot-label" text-anchor="middle">@${d.position} ⛽${d.gas}</text>`;
  });

  // Car marker.
  if (view.pos !== null) {
    const a = angleOf(view.pos);
    const [carX, carY] = polar(a, R);
    svg += `<text x="${carX.toFixed(1)}" y="${(carY + 8).toFixed(1)}" class="gasc-car" text-anchor="middle">🚗</text>`;
  }

  const gaugeHtml = `
    <div class="gasc-gauge">
      <div class="gasc-box"><span class="gasc-box-label">${vi ? "Vị trí (pos)" : "Position (pos)"}</span><span class="gasc-box-value">${view.pos === null ? "—" : view.pos}</span></div>
      <div class="gasc-box fuel"><span class="gasc-box-label">${vi ? "Xăng (tank)" : "Fuel (tank)"}</span><span class="gasc-box-value">${view.tank === null ? "—" : view.tank}</span></div>
      <div class="gasc-box dist"><span class="gasc-box-label">${vi ? "Quãng đường" : "Distance"}</span><span class="gasc-box-value">${view.answer !== null ? view.answer : view.distance}</span></div>
      <div class="gasc-box"><span class="gasc-box-label">${vi ? "Số vòng" : "Loops"}</span><span class="gasc-box-value">${view.loops}</span></div>
    </div>`;

  const summary = vi
    ? `Đường đua vòng tròn chu vi ${C}: pos=${view.pos}, tank=${view.tank}, quãng đường=${view.distance}.`
    : `Circular track of circumference ${C}: pos=${view.pos}, tank=${view.tank}, distance=${view.distance}.`;

  el.innerHTML = `<div class="gasc-viz" role="img" aria-label="${escapeHtml(summary)}">
    ${gaugeHtml}
    <div class="gasc-stage">
      <svg viewBox="0 0 340 360" class="gasc-svg" preserveAspectRatio="xMidYMid meet">${svg}</svg>
    </div>
    <div class="gasc-legend">
      <span><i class="lg-start"></i>${vi ? "kho xuất phát" : "start deposit"}</span>
      <span><i class="lg-collected"></i>${vi ? "đã ghé & đổ xăng" : "reached & refueled"}</span>
      <span><i class="lg-current"></i>${vi ? "đang xét" : "current target"}</span>
      <span><i class="lg-unreached"></i>${vi ? "không tới được" : "not reached"}</span>
      <span><i class="lg-pending"></i>${vi ? "chưa tới" : "pending"}</span>
    </div>
  </div>`;
}

// ---- Gas Deposits max distance number-line (#9134) ----
function renderGasDepositsView(step) {
  const view = step.gasDepositsView;
  const el = $("treeView");
  const vi = lang === "vi";
  const scaleMax = view.scaleMax || 1;
  const pct = (x) => Math.max(0, Math.min(100, (x / scaleMax) * 100));

  const startPct = view.startPos === null ? 0 : pct(view.startPos);
  const carPct = view.pos === null ? startPct : pct(view.pos);
  const travWidth = Math.max(0, carPct - startPct);

  // Deposit markers on the number line.
  const markersHtml = view.deposits.map((d) => {
    let cls = "state-" + d.state;
    if (view.currentIndex === d.index) cls += " is-current";
    return `<div class="gasdep-marker ${cls}" style="left:${pct(d.position)}%">
      <div class="gasdep-dot"></div>
      <div class="gasdep-mlabel"><span class="gasdep-mpos">@${d.position}</span><span class="gasdep-mgas">⛽${d.gas}</span></div>
    </div>`;
  }).join("");

  const carHtml = view.pos === null ? "" :
    `<div class="gasdep-car" style="left:${carPct}%">🚗</div>`;

  const lineHtml = `
    <div class="gasdep-line">
      <div class="gasdep-track">
        <div class="gasdep-baseline"></div>
        <div class="gasdep-traveled" style="left:${startPct}%;width:${travWidth}%"></div>
        ${markersHtml}
        ${carHtml}
      </div>
      <div class="gasdep-scale"><span>0</span><span>${scaleMax}</span></div>
    </div>`;

  const tankNeg = view.tank !== null && view.tank < 0;
  const gaugeHtml = `
    <div class="gasdep-gauge">
      <div class="gasdep-box">
        <span class="gasdep-box-label">${vi ? "Vị trí xe (pos)" : "Car position (pos)"}</span>
        <span class="gasdep-box-value">${view.pos === null ? "—" : view.pos}</span>
      </div>
      <div class="gasdep-box ${tankNeg ? "neg" : "fuel"}">
        <span class="gasdep-box-label">${vi ? "Bình xăng (tank)" : "Fuel (tank)"}</span>
        <span class="gasdep-box-value">${view.tank === null ? "—" : view.tank}</span>
      </div>
      <div class="gasdep-box dist">
        <span class="gasdep-box-label">${vi ? "Quãng đường" : "Distance"}</span>
        <span class="gasdep-box-value">${view.answer !== null ? view.answer : view.distance}</span>
      </div>
    </div>`;

  const summary = vi
    ? `Kho xăng: pos=${view.pos}, tank=${view.tank}, quãng đường=${view.distance}.`
    : `Gas deposits: pos=${view.pos}, tank=${view.tank}, distance=${view.distance}.`;

  el.innerHTML = `<div class="gasdep-viz" role="img" aria-label="${escapeHtml(summary)}">
    ${gaugeHtml}
    ${lineHtml}
    <div class="gasdep-legend">
      <span><i class="lg-start"></i>${vi ? "kho xuất phát" : "start deposit"}</span>
      <span><i class="lg-collected"></i>${vi ? "đã ghé & đổ xăng" : "reached & refueled"}</span>
      <span><i class="lg-current"></i>${vi ? "đang xét" : "current target"}</span>
      <span><i class="lg-unreached"></i>${vi ? "không tới được" : "not reached"}</span>
      <span><i class="lg-pending"></i>${vi ? "chưa tới" : "pending"}</span>
    </div>
  </div>`;
}

// ---- Real-time experience profit tracker (#9001) ----
function renderProfitTrackerView(step) {
  const view = step.profitTrackerView;
  const el = $("treeView");
  const vi = lang === "vi";

  const operationHtml = (view.operations || []).map((operation, index) => {
    const active = index === view.activeIndex;
    const done = index < view.activeIndex || view.activeIndex >= view.operations.length;
    const detail = operation.op === "U"
      ? `${operation.name} ${operation.delta >= 0 ? "+" : ""}${operation.delta}`
      : (vi ? "lấy max" : "get max");
    return `<div class="profit-op${active ? " active" : ""}${done ? " done" : ""}">
      <span class="profit-op-index">${index}</span>
      <strong>${escapeHtml(operation.op)}</strong>
      <span>${escapeHtml(detail)}</span>
    </div>`;
  }).join("");

  const totalsHtml = view.totals.length
    ? view.totals.map((entry) => `<div class="profit-total-row">
        <span>${escapeHtml(entry.name)}</span><strong>${escapeHtml(entry.total)}</strong>
      </div>`).join("")
    : `<div class="profit-empty">${vi ? "Chưa có dữ liệu" : "No data yet"}</div>`;

  const heapHtml = view.heap.length
    ? view.heap.map((entry) => `<div class="profit-heap-entry${entry.root ? " root" : ""}${entry.current ? " current" : " stale"}${entry.focused ? " focused" : ""}">
        <div class="profit-heap-top">
          <span>[${entry.index}]${entry.root ? ` · ${vi ? "ROOT" : "ROOT"}` : ""}</span>
          <strong>${entry.current ? "CURRENT" : "STALE"}</strong>
        </div>
        <div class="profit-heap-name">${escapeHtml(entry.name)}</div>
        <div class="profit-heap-values">
          <span>${vi ? "profit" : "profit"} = ${escapeHtml(entry.profit)}</span>
          <span>${vi ? "lưu" : "stored"} (${escapeHtml(entry.storedPriority)}, '${escapeHtml(entry.name)}')</span>
        </div>
      </div>`).join("")
    : `<div class="profit-empty">heap = []</div>`;

  const resultHtml = view.result.length
    ? view.result.map((name, index) => `<span class="profit-result-item">Q${index + 1}: ${escapeHtml(name === null ? "None" : name)}</span>`).join("")
    : `<span class="profit-empty">res = []</span>`;

  const action = view.action || {};
  let actionHtml = "";
  if (action.type === "init") {
    const labels = { totals: "totals = {}", heap: "heap = []", res: "res = []" };
    actionHtml = `<span>${vi ? "Khởi tạo" : "Initialize"}</span><strong>${escapeHtml(labels[action.target] || action.target)}</strong>`;
  } else if (action.type === "read") {
    const detail = action.op === "U"
      ? `${action.name}, delta ${action.delta >= 0 ? "+" : ""}${action.delta}`
      : (vi ? "cần đọc winner hiện tại" : "read the current winner");
    actionHtml = `<span>${vi ? "Đọc operation" : "Read operation"}</span><strong>${escapeHtml(action.op)} · ${escapeHtml(detail)}</strong>`;
  } else if (action.type === "branch") {
    actionHtml = `<span>op == 'U'</span><span class="profit-arrow">→</span><strong>${action.branch === "update" ? (vi ? "ĐÚNG: UPDATE" : "TRUE: UPDATE") : (vi ? "SAI: QUERY" : "FALSE: QUERY")}</strong>`;
  } else if (action.type === "update") {
    actionHtml = `<span>${escapeHtml(action.name)}: ${escapeHtml(action.oldTotal)}</span><span class="profit-arrow">+</span><span>${escapeHtml(action.delta)}</span><span class="profit-arrow">=</span><strong>${escapeHtml(action.newTotal)}</strong>`;
  } else if (action.type === "push") {
    actionHtml = `<span>${vi ? "total thật" : "true total"}: ${escapeHtml(action.profit)}</span><span class="profit-arrow">→</span><span>${vi ? "đổi dấu" : "negate"}: ${escapeHtml(action.storedPriority)}</span><span class="profit-arrow">→</span><strong>heappush</strong>`;
  } else if (action.type === "compare") {
    actionHtml = `<span>root ${escapeHtml(action.name)} = ${escapeHtml(action.heapProfit)}</span><span class="profit-arrow">${action.current ? "=" : "≠"}</span><span>totals[${escapeHtml(action.name)}] = ${escapeHtml(action.actualProfit)}</span><span class="profit-arrow">→</span><strong class="${action.current ? "is-current" : "is-stale"}">${action.current ? "CURRENT" : "STALE"}</strong>`;
  } else if (action.type === "pop") {
    actionHtml = `<strong class="is-stale">POP STALE</strong><span>${escapeHtml(action.name)} · ${escapeHtml(action.profit)}</span><span class="profit-arrow">→</span><span>${vi ? "kiểm tra root mới" : "check the new root"}</span>`;
  } else if (action.type === "empty") {
    actionHtml = `<strong>heap = []</strong><span class="profit-arrow">→</span><span>${vi ? "winner = None" : "winner = None"}</span>`;
  } else if (action.type === "answer") {
    actionHtml = action.name === null
      ? `<span>heap = []</span><span class="profit-arrow">→</span><strong>res.append(None)</strong>`
      : `<strong>PEEK heap[0]</strong><span class="profit-arrow">→</span><span>${escapeHtml(action.name)} · ${escapeHtml(action.profit)}</span><span class="profit-arrow">→</span><strong>res.append('${escapeHtml(action.name)}')</strong><em>${vi ? "không pop root" : "keep the root"}</em>`;
  } else if (action.type === "return") {
    actionHtml = `<strong>${vi ? "Hoàn tất tất cả operation" : "All operations complete"}</strong><span class="profit-arrow">→</span><span>return res</span>`;
  }

  const summary = vi
    ? `Profit tracker tại operation ${view.activeIndex}. totals có ${view.totals.length} experience, heap có ${view.heap.length} entry.`
    : `Profit tracker at operation ${view.activeIndex}. totals has ${view.totals.length} experiences and the heap has ${view.heap.length} entries.`;

  el.innerHTML = `<div class="profit-tracker-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="profit-ops">${operationHtml}</div>
    <div class="profit-action">${actionHtml}</div>
    <div class="profit-state-grid">
      <section class="profit-state-panel">
        <h4>${vi ? "totals · dữ liệu thật" : "totals · source of truth"}</h4>
        ${totalsHtml}
      </section>
      <section class="profit-state-panel">
        <h4>heap · ${vi ? "các snapshot" : "snapshots"}</h4>
        <div class="profit-heap-list">${heapHtml}</div>
      </section>
    </div>
    <div class="profit-result-row"><strong>res</strong>${resultHtml}</div>
    <div class="profit-legend">
      <span><i class="current"></i>CURRENT = ${vi ? "khớp totals" : "matches totals"}</span>
      <span><i class="stale"></i>STALE = ${vi ? "phiên bản cũ" : "old snapshot"}</span>
      <span><i class="root"></i>ROOT = ${vi ? "ứng viên lớn nhất" : "maximum candidate"}</span>
    </div>
  </div>`;
}

// ---- Cyclic-sort slot map (#41) ----
function renderCyclicSortView(step) {
  const view = step.cyclicSortView;
  const el = $("treeView");
  const vi = lang === "vi";
  const values = Array.isArray(view.values) ? view.values : [];
  const correct = new Set(view.correctIndices || []);
  const ignored = new Set(view.ignoredIndices || []);
  const duplicates = new Set(view.duplicateIndices || []);

  const phaseNumber = view.phase === "place" ? 1 : 2;
  const actionByReason = {
    "outside-range": vi
      ? `${values[view.currentIndex]} nằm ngoài 1..${values.length} → bỏ qua`
      : `${values[view.currentIndex]} is outside 1..${values.length} → ignore`,
    "already-correct": vi
      ? `${values[view.currentIndex]} đã ở đúng nhà → không swap`
      : `${values[view.currentIndex]} is already home → no swap`,
    duplicate: vi
      ? `Ô đích đã có ${values[view.currentIndex]} → đây là bản trùng, không swap`
      : `The target already has ${values[view.currentIndex]} → duplicate, do not swap`,
    swap: vi
      ? `Nhà của ${values[view.currentIndex]}: index ${view.targetIndex}`
      : `Home of ${values[view.currentIndex]}: index ${view.targetIndex}`,
    swapped: vi
      ? `Swap xong: giá trị đã được đặt vào đúng nhà`
      : `Swap complete: the value is now in its home slot`,
    match: vi
      ? `Giá trị thực tế khớp giá trị cần có → quét tiếp`
      : `Actual value matches the expected value → continue`,
    missing: vi
      ? `Giá trị thực tế khác giá trị cần có → tìm thấy số bị thiếu`
      : `Actual value differs from expected → missing value found`,
  };
  let actionText = actionByReason[view.reason] || view.action || "";
  if (!view.reason && view.phase === "place") {
    actionText = view.currentIndex >= 0
      ? (vi
        ? `Đang xét index ${view.currentIndex}, giá trị ${values[view.currentIndex]}`
        : `Processing index ${view.currentIndex}, value ${values[view.currentIndex]}`)
      : (vi
        ? `Các giá trị 1..${values.length} có nhà từ index 0..${Math.max(0, values.length - 1)}`
        : `Values 1..${values.length} have homes at indices 0..${Math.max(0, values.length - 1)}`);
  } else if (!view.reason && view.phase === "scan") {
    actionText = vi ? "Quét từ trái sang phải để tìm ô sai đầu tiên" : "Scan left to right for the first mismatched slot";
  } else if (!view.reason && view.phase === "answer") {
    actionText = vi ? `Tất cả ô đều khớp → đáp án = ${view.answer}` : `Every slot matches → answer = ${view.answer}`;
  }

  const slotsHtml = values.map((value, index) => {
    const classes = ["cyclic-slot"];
    const labels = [];
    if (index === view.currentIndex) {
      classes.push("current");
      labels.push(view.phase === "scan" ? (vi ? "ĐANG KIỂM TRA" : "CHECKING") : "i");
    }
    if (index === view.targetIndex && view.targetIndex !== view.currentIndex) {
      classes.push("target");
      labels.push(vi ? "Ô ĐÍCH" : "TARGET");
    }
    if (index === view.placedIndex) {
      classes.push("placed");
      labels.push(vi ? "VỪA ĐẶT ĐÚNG" : "JUST PLACED");
    } else if (correct.has(index)) {
      classes.push("correct");
      labels.push(vi ? "ĐÚNG NHÀ" : "HOME");
    }
    if (ignored.has(index) && index !== view.targetIndex) {
      classes.push("ignored");
      labels.push(vi ? "BỎ QUA" : "IGNORE");
    } else if (duplicates.has(index)) {
      classes.push("duplicate");
      labels.push(vi ? "TRÙNG" : "DUPLICATE");
    }
    if ((view.phase === "scan" || view.phase === "answer") && index < view.scanIndex) {
      classes.push("scanned");
    }
    if (index === view.missingIndex) {
      classes.push("missing");
      labels.length = 0;
      labels.push(vi ? "THIẾU Ở ĐÂY" : "MISSING HERE");
    }

    return `<div class="${classes.join(" ")}">
      <div class="cyclic-slot-index">index ${index}</div>
      <div class="cyclic-slot-value">${escapeHtml(value)}</div>
      <div class="cyclic-slot-expected">${vi ? "cần" : "expects"} <strong>${index + 1}</strong></div>
      <div class="cyclic-slot-state">${escapeHtml(labels.join(" · ") || (vi ? "chưa xử lý" : "unresolved"))}</div>
    </div>`;
  }).join("");

  const answerHtml = view.answer !== undefined
    ? `<div class="cyclic-answer"><span>${vi ? "Số dương nhỏ nhất bị thiếu" : "Smallest missing positive"}</span><strong>${escapeHtml(view.answer)}</strong></div>`
    : "";
  const summary = vi
    ? `Mô phỏng cyclic sort gồm ${values.length} ô, đang ở pha ${phaseNumber}.`
    : `Cyclic-sort simulation with ${values.length} slots, currently in phase ${phaseNumber}.`;

  el.innerHTML = `<div class="cyclic-sort-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="cyclic-sort-phases">
      <div class="cyclic-phase ${phaseNumber === 1 ? "active" : "done"}"><b>1</b><span>${vi ? "Đặt x về index x − 1" : "Place x at index x − 1"}</span></div>
      <div class="cyclic-phase ${phaseNumber === 2 ? "active" : ""}"><b>2</b><span>${vi ? "Tìm ô sai đầu tiên" : "Find first mismatch"}</span></div>
    </div>
    <div class="cyclic-sort-rule"><strong>${vi ? "Quy tắc" : "Rule"}:</strong> value <b>x</b> → ${vi ? "nhà" : "home"} index <b>x − 1</b></div>
    <div class="cyclic-sort-action">${escapeHtml(actionText)}</div>
    <div class="cyclic-sort-grid">${slotsHtml}</div>
    ${answerHtml}
    <div class="cyclic-sort-legend">
      <span><i class="current"></i>${vi ? "đang xử lý" : "current i"}</span>
      <span><i class="target"></i>${vi ? "ô sẽ swap tới" : "swap target"}</span>
      <span><i class="correct"></i>${vi ? "đúng nhà" : "correct home"}</span>
      <span><i class="ignored"></i>${vi ? "ngoài 1..n" : "outside 1..n"}</span>
      <span><i class="missing"></i>${vi ? "số bị thiếu" : "missing value"}</span>
    </div>
  </div>`;
}

function renderWaterDistributionView(step) {
  const view = step.waterDistributionView || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const n = Number(view.n) || 0;
  const edges = Array.isArray(view.edges) ? view.edges : [];
  const accepted = new Set((view.acceptedEdges || []).map((edge) => edge.key));
  const rejected = new Set(view.rejectedEdgeKeys || []);
  const currentKey = view.currentEdge ? view.currentEdge.key : null;
  const phaseIndex = { transform: 0, sort: 1, kruskal: 2, done: 3 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Thêm nguồn ảo 0", "2 · Sort mọi lựa chọn", "3 · Kruskal + DSU", "4 · Hệ thống tối ưu"]
    : ["1 · Add virtual source 0", "2 · Sort all options", "3 · Kruskal + DSU", "4 · Optimal network"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const edgeLabel = (edge) => `${edge.kind === "well" ? "W" : "P"}${edge.sourceIndex + 1}`;
  const edgeKindLabel = (edge) => edge.kind === "well" ? (vi ? "GIẾNG" : "WELL") : (vi ? "ỐNG" : "PIPE");
  const edgeChips = edges.map((edge, index) => {
    const classes = [edge.kind];
    if (accepted.has(edge.key)) classes.push("accepted");
    if (rejected.has(edge.key)) classes.push("rejected");
    if (edge.key === currentKey) classes.push("current");
    return `<span class="${classes.join(" ")}"><small>#${view.sorted ? index + 1 : "·"} · ${edgeKindLabel(edge)}</small><b>${escapeHtml(edgeLabel(edge))}: ${edge.u}↔${edge.v}</b><strong>$${escapeHtml(edge.cost)}</strong></span>`;
  }).join("") || `<em>${vi ? "Đang tạo danh sách cạnh..." : "Building the edge list..."}</em>`;

  const maxHousesPerRow = 4;
  const houseColumns = Math.max(1, Math.min(n, maxHousesPerRow));
  const houseRows = Math.max(1, Math.ceil(n / maxHousesPerRow));
  const width = 620;
  const houseRowGap = 126;
  const firstHouseY = 218;
  const height = firstHouseY + (houseRows - 1) * houseRowGap + 76;
  const sourcePoint = { x: width / 2, y: 48 };
  const housePoint = (house) => {
    const row = Math.floor((house - 1) / maxHousesPerRow);
    const firstHouseInRow = row * maxHousesPerRow + 1;
    const housesInRow = Math.min(maxHousesPerRow, n - row * maxHousesPerRow);
    const column = house - firstHouseInRow;
    const rowWidth = housesInRow <= 1 ? 0 : width - 130;
    return {
      x: housesInRow <= 1 ? width / 2 : 65 + column * (rowWidth / (housesInRow - 1)),
      y: firstHouseY + row * houseRowGap,
    };
  };
  const edgePriority = (edge) => edge.key === currentKey ? 3 : accepted.has(edge.key) ? 2 : rejected.has(edge.key) ? 0 : 1;
  const orderedEdges = [...edges].sort((a, b) => edgePriority(a) - edgePriority(b));
  const graphEdges = orderedEdges.map((edge) => {
    const classes = ["water1168-edge", edge.kind];
    if (accepted.has(edge.key)) classes.push("accepted");
    if (rejected.has(edge.key)) classes.push("rejected");
    if (edge.key === currentKey) classes.push("current");
    let path;
    let labelX;
    let labelY;
    if (edge.kind === "well") {
      const target = housePoint(edge.v);
      path = `M ${sourcePoint.x} ${sourcePoint.y + 22} L ${target.x} ${target.y - 28}`;
      labelX = sourcePoint.x * 0.45 + target.x * 0.55;
      labelY = sourcePoint.y * 0.45 + target.y * 0.55 - 7;
    } else {
      const from = housePoint(edge.u);
      const to = housePoint(edge.v);
      const middleX = (from.x + to.x) / 2;
      const controlY = 145 - (edge.sourceIndex % 4) * 15;
      path = `M ${from.x} ${from.y - 25} Q ${middleX} ${controlY} ${to.x} ${to.y - 25}`;
      labelX = middleX;
      labelY = (from.y + 2 * controlY + to.y) / 4 - 5;
    }
    const showLabel = accepted.has(edge.key) || edge.key === currentKey;
    return `<g class="${classes.join(" ")}" aria-label="${escapeHtml(`${edgeKindLabel(edge)} ${edge.u} to ${edge.v}, cost ${edge.cost}`)}"><path d="${path}"></path>${showLabel ? `<text x="${labelX}" y="${labelY}">${escapeHtml(edgeLabel(edge))} · $${escapeHtml(edge.cost)}</text>` : ""}</g>`;
  }).join("");

  const selectedWellHouses = new Set((view.acceptedEdges || []).filter((edge) => edge.kind === "well").map((edge) => edge.v));
  const currentEndpoints = new Set(view.currentEdge ? [view.currentEdge.u, view.currentEdge.v] : []);
  const rootFor = (node) => view.roots && view.roots[node] !== undefined ? view.roots[node] : node;
  const houseNodes = Array.from({ length: n }, (_, index) => {
    const house = index + 1;
    const point = housePoint(house);
    const classes = ["water1168-node", "house", `component-${Math.abs(rootFor(house)) % 6}`];
    if (currentEndpoints.has(house)) classes.push("current");
    if (selectedWellHouses.has(house)) classes.push("has-well");
    return `<g class="${classes.join(" ")}"><rect x="${point.x - 42}" y="${point.y - 32}" width="84" height="66" rx="12"></rect><path class="roof" d="M ${point.x - 37} ${point.y - 29} L ${point.x} ${point.y - 55} L ${point.x + 37} ${point.y - 29}"></path><text class="house" x="${point.x}" y="${point.y}">H${house}</text><text class="detail" x="${point.x}" y="${point.y + 21}">well $${escapeHtml(view.wells ? view.wells[index] : "—")} · R${escapeHtml(rootFor(house))}</text>${selectedWellHouses.has(house) ? `<text class="well-mark" x="${point.x + 34}" y="${point.y - 20}">💧</text>` : ""}</g>`;
  }).join("");
  const sourceClass = currentEndpoints.has(0) ? " current" : "";
  const sourceNode = `<g class="water1168-node source${sourceClass}"><path d="M ${sourcePoint.x - 46} ${sourcePoint.y + 27} L ${sourcePoint.x - 35} ${sourcePoint.y - 27} L ${sourcePoint.x + 35} ${sourcePoint.y - 27} L ${sourcePoint.x + 46} ${sourcePoint.y + 27} Z"></path><path class="water" d="M ${sourcePoint.x - 29} ${sourcePoint.y + 3} Q ${sourcePoint.x - 14} ${sourcePoint.y - 10} ${sourcePoint.x} ${sourcePoint.y + 3} T ${sourcePoint.x + 29} ${sourcePoint.y + 3}"></path><text class="source-id" x="${sourcePoint.x}" y="${sourcePoint.y - 5}">0</text><text class="source-label" x="${sourcePoint.x}" y="${sourcePoint.y + 44}">${vi ? "NGUỒN NƯỚC ẢO" : "VIRTUAL WATER SOURCE"}</text></g>`;
  const graphSummary = vi
    ? `Nguồn nước ảo 0 và ${n} nhà; đã chọn ${view.acceptedCount || 0} trên ${n} cạnh MST; tổng ${view.totalCost || 0}.`
    : `Virtual source 0 and ${n} houses; selected ${view.acceptedCount || 0} of ${n} MST edges; total ${view.totalCost || 0}.`;
  const graphSvg = `<svg class="water1168-graph" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(graphSummary)}">${graphEdges}${sourceNode}${houseNodes}</svg>`;

  const current = view.currentEdge;
  let decisionClass = "waiting";
  let decisionTitle = vi ? "Chờ cạnh tiếp theo" : "Waiting for the next edge";
  let decisionNote = vi ? "Kruskal xử lý cạnh từ rẻ đến đắt." : "Kruskal processes edges from cheapest to most expensive.";
  if (current) {
    decisionTitle = `${edgeLabel(current)} · ${current.u} ↔ ${current.v} · $${current.cost}`;
    decisionNote = vi ? "Chưa chạy find/union." : "Waiting for find/union.";
    if (view.rootsBefore) {
      if (view.unionChanged === true) {
        decisionClass = "accepted";
        decisionNote = vi ? `Khác root → chọn cạnh và cộng $${current.cost}.` : `Different roots → accept and add $${current.cost}.`;
      } else if (view.unionChanged === false) {
        decisionClass = "rejected";
        decisionNote = vi ? "Cùng root → bỏ qua để tránh cycle." : "Same root → reject to avoid a cycle.";
      } else if (view.rootsBefore.u === view.rootsBefore.v) {
        decisionClass = "cycle";
        decisionNote = vi ? "Cùng root: cạnh này sẽ tạo cycle." : "Same root: this edge would form a cycle.";
      } else {
        decisionClass = "ready";
        decisionNote = vi ? "Khác root: cạnh này an toàn để chọn." : "Different roots: this edge is safe to select.";
      }
    }
  }
  const rootsHtml = view.rootsBefore
    ? `<div class="water1168-roots"><span>find(${current.u}) = <b>R${view.rootsBefore.u}</b></span><strong>${view.rootsBefore.u === view.rootsBefore.v ? "=" : "≠"}</strong><span>find(${current.v}) = <b>R${view.rootsBefore.v}</b></span></div>`
    : `<div class="water1168-rule"><code>well[i] ⇔ edge (0, i)</code><span>${vi ? "Một MST trên n+1 node cần n cạnh" : "An MST over n+1 nodes needs n edges"}</span></div>`;

  const components = (view.groups || []).map((group) => {
    const labels = (group.nodes || []).map((node) => node === 0 ? (vi ? "Nguồn 0" : "Source 0") : `H${node}`).join(" · ");
    const hasSource = (group.nodes || []).includes(0);
    return `<span class="${hasSource ? "source" : ""}"><b>R${escapeHtml(group.root)}</b><small>${escapeHtml(labels)}</small><em>${hasSource ? (vi ? "có nước" : "water-connected") : (vi ? "chưa có nước" : "not supplied")}</em></span>`;
  }).join("");
  const selectedWells = (view.acceptedEdges || []).filter((edge) => edge.kind === "well");
  const selectedPipes = (view.acceptedEdges || []).filter((edge) => edge.kind === "pipe");
  const selectedHtml = [...selectedWells, ...selectedPipes].map((edge) => `<span class="${edge.kind}"><b>${escapeHtml(edgeLabel(edge))}</b><small>${edge.u}↔${edge.v}</small><strong>$${edge.cost}</strong></span>`).join("") || `<em>${vi ? "Chưa chọn hạ tầng" : "No infrastructure selected yet"}</em>`;
  const resultClass = view.complete ? "complete" : "building";

  el.innerHTML = `<section class="water1168-viz">
    <div class="water1168-phases">${phases}</div>
    <section class="water1168-edge-lane"><header><div><strong>${view.sorted ? (vi ? "CẠNH ĐÃ SORT · RẺ → ĐẮT" : "SORTED EDGES · CHEAP → EXPENSIVE") : (vi ? "BIẾN ĐỔI THÀNH ĐỒ THỊ" : "GRAPH TRANSFORMATION")}</strong><small>${edges.length} / ${n + (view.pipes || []).length} ${vi ? "lựa chọn" : "options"}</small></div><span><i class="well"></i>${vi ? "giếng / cạnh ảo" : "well / virtual edge"}<i class="pipe"></i>${vi ? "ống thật" : "physical pipe"}</span></header><div>${edgeChips}</div></section>
    <div class="water1168-layout"><section class="water1168-network"><header><strong>${vi ? "MẠNG CẤP NƯỚC" : "WATER NETWORK"}</strong><span>${vi ? "nét đứt cyan = giếng · nét liền = ống" : "dashed cyan = well · solid = pipe"}</span></header><div class="water1168-graph-scroll">${graphSvg}</div><div class="water1168-legend"><span><i class="pending"></i>${vi ? "chưa xét" : "pending"}</span><span><i class="current"></i>${vi ? "đang xét" : "current"}</span><span><i class="accepted"></i>${vi ? "đã chọn" : "accepted"}</span><span><i class="rejected"></i>${vi ? "cycle / bỏ" : "cycle / rejected"}</span></div></section>
      <aside class="water1168-state"><section class="water1168-score ${resultClass}"><div><small>MST EDGES</small><strong>${view.acceptedCount || 0}<em>/${n}</em></strong></div><div><small>${vi ? "TỔNG CHI PHÍ" : "TOTAL COST"}</small><strong>$${view.totalCost || 0}</strong></div></section><section class="water1168-decision ${decisionClass}"><small>${current ? edgeKindLabel(current) : (vi ? "QUY TẮC" : "RULE")}</small><strong>${escapeHtml(decisionTitle)}</strong>${rootsHtml}<p>${escapeHtml(decisionNote)}</p></section><section class="water1168-answer ${resultClass}"><small>${vi ? "CHI PHÍ NHỎ NHẤT" : "MINIMUM COST"}</small><strong>${view.answer === null || view.answer === undefined ? "—" : `$${view.answer}`}</strong><span>${view.complete ? (vi ? "✓ mọi nhà nối với nguồn 0" : "✓ every house reaches source 0") : (vi ? "đang xây MST" : "building the MST")}</span></section></aside>
    </div>
    <section class="water1168-components"><header><strong>DSU COMPONENTS</strong><span>${(view.groups || []).length} components</span></header><div>${components}</div></section>
    <section class="water1168-selected"><header><strong>${vi ? "HẠ TẦNG ĐÃ CHỌN" : "SELECTED INFRASTRUCTURE"}</strong><span>${selectedWells.length} wells · ${selectedPipes.length} pipes</span></header><div>${selectedHtml}</div></section>
  </section>`;
}

// ---- 1135 Connecting Cities renderer (Kruskal MST: edge queue + graph + DSU) ----
function renderConnectCitiesView(step) {
  const view = step.connectCitiesView || {};
  const vi = lang === "vi";
  const n = Number(view.n) || 0;
  const edges = Array.isArray(view.edges) ? view.edges : [];
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const roots = view.roots || {};
  const currentKey = view.currentKey || null;
  const cur = edges.find((e) => e.key === currentKey) || null;
  const curNodes = new Set(cur ? [cur.u, cur.v] : []);
  const compOf = (id) => Math.abs(Number(roots[id] ?? id)) % 6;

  const phaseIndex = { build: 0, sort: 1, kruskal: 2, done: 3 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Tạo cạnh", "2 · Sort chi phí", "3 · Kruskal + DSU", "4 · Hoàn tất MST"]
    : ["1 · Build edges", "2 · Sort by cost", "3 · Kruskal + DSU", "4 · MST done"];
  const phases = phaseLabels.map((label, i) => {
    const cls = i < phaseIndex ? "done" : i === phaseIndex ? "active" : "pending";
    return `<span class="${cls}">${i < phaseIndex ? "✓" : i === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const queue = edges.map((e) => {
    const cls = ["cc-q-edge"];
    if (e.state === "accept") cls.push("accepted");
    else if (e.state === "reject") cls.push("rejected");
    if (e.key === currentKey) cls.push("current");
    const idxLabel = view.sorted && e.sortedIndex >= 0 ? `#${e.sortedIndex + 1}` : "·";
    return `<span class="${cls.join(" ")}"><small>${idxLabel}</small><b>${e.u}–${e.v}</b><strong>${escapeHtml(e.w)}</strong></span>`;
  }).join("") || `<em class="cc-empty">${vi ? "chưa có cạnh" : "no edges"}</em>`;

  const size = Math.max(360, n * 56);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 54;
  const pos = {};
  nodes.forEach((id, i) => {
    const ang = (2 * Math.PI * i) / Math.max(1, n) - Math.PI / 2;
    pos[id] = { x: cx + radius * Math.cos(ang), y: cy + radius * Math.sin(ang) };
  });

  const paintOrder = (e) => (e.key === currentKey ? 3 : e.state === "accept" ? 2 : e.state === "reject" ? 0 : 1);
  const edgeSvg = [...edges].sort((a, b) => paintOrder(a) - paintOrder(b)).map((e) => {
    const a = pos[e.u];
    const b = pos[e.v];
    if (!a || !b) return "";
    const cls = ["cc-edge"];
    if (e.state === "accept") cls.push("accepted");
    else if (e.state === "reject") cls.push("rejected");
    if (e.key === currentKey && e.state === "pending") cls.push("current");
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const wCls = e.state === "accept" ? "accept" : e.state === "reject" ? "reject" : "";
    return `<line class="${cls.join(" ")}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>`
      + `<text class="cc-weight ${wCls}" x="${mx}" y="${my - 4}">${escapeHtml(e.w)}</text>`;
  }).join("");

  const nodeSvg = nodes.map((id) => {
    const p = pos[id];
    const cls = ["cc-node", `component-${compOf(id)}`];
    if (curNodes.has(id)) cls.push("current");
    return `<g class="${cls.join(" ")}"><circle cx="${p.x}" cy="${p.y}" r="23"></circle>`
      + `<text class="cc-id" x="${p.x}" y="${p.y}" dy="0.35em">${escapeHtml(id)}</text>`
      + `<text class="cc-root" x="${p.x}" y="${p.y + 37}">R${escapeHtml(roots[id] ?? id)}</text></g>`;
  }).join("");

  const graphSvg = `<svg class="cc-graph" viewBox="0 0 ${size} ${size}" role="img" aria-label="${vi ? "Đồ thị thành phố và cạnh MST" : "City graph with MST edges"}">${edgeSvg}${nodeSvg}</svg>`;

  const rb = view.rootsBefore;
  let decCls = "waiting";
  let decTitle = vi ? "Chờ cạnh tiếp theo" : "Waiting for the next edge";
  let decNote = vi ? "Kruskal xử lý cạnh từ rẻ đến đắt." : "Kruskal processes edges cheap → expensive.";
  if (cur && rb) {
    decTitle = `${cur.u} — ${cur.v} · ${vi ? "chi phí" : "cost"} ${cur.w}`;
    if (view.decision === "accept") {
      decCls = "accepted";
      decNote = vi ? `R${rb.u} ≠ R${rb.v} → khác nhóm, union và cộng ${cur.w}.` : `R${rb.u} ≠ R${rb.v} → different groups, union and add ${cur.w}.`;
    } else if (view.decision === "reject") {
      decCls = "rejected";
      decNote = vi ? `R${rb.u} = R${rb.v} → cùng nhóm, bỏ để tránh chu trình.` : `R${rb.u} = R${rb.v} → same group, skip to avoid a cycle.`;
    } else {
      decCls = rb.u === rb.v ? "cycle" : "ready";
      decNote = rb.u === rb.v
        ? (vi ? "Cùng nhóm: nối vào sẽ tạo chu trình." : "Same group: connecting would form a cycle.")
        : (vi ? "Khác nhóm: cạnh này an toàn để chọn." : "Different groups: this edge is safe to take.");
    }
  }
  const rootsLine = cur && rb
    ? `<div class="cc-roots"><span>find(${cur.u}) = <b>R${rb.u}</b></span><strong>${rb.u === rb.v ? "=" : "≠"}</strong><span>find(${cur.v}) = <b>R${rb.v}</b></span></div>`
    : "";

  const scoreHtml = `<section class="cc-score ${view.complete ? "complete" : ""}">
    <div><small>${vi ? "CẠNH MST" : "MST EDGES"}</small><strong>${view.used}<em>/${view.need}</em></strong></div>
    <div><small>${vi ? "TỔNG CHI PHÍ" : "TOTAL COST"}</small><strong>${view.total}</strong></div>
  </section>`;

  const answerHtml = (view.answer === null || view.answer === undefined) ? ""
    : `<section class="cc-decision ${view.answer === -1 ? "rejected" : "accepted"}"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${view.answer === -1 ? "-1" : view.answer}</strong><p>${view.answer === -1 ? (vi ? "Đồ thị không liên thông." : "The graph is disconnected.") : (vi ? "Tổng chi phí MST nhỏ nhất." : "Minimum total MST cost.")}</p></section>`;

  const comps = (view.groups || []).map((g) => {
    const k = Math.abs(g.root) % 6;
    const labels = (g.nodes || []).join(" · ");
    return `<span class="component-chip component-${k}"><b>R${escapeHtml(g.root)}</b><small>${escapeHtml(labels)}</small></span>`;
  }).join("");

  $("treeView").innerHTML = `<section class="cc-viz">
    <div class="cc-phases">${phases}</div>
    <section class="cc-queue"><header><strong>${view.sorted ? (vi ? "HÀNG ĐỢI CẠNH · RẺ → ĐẮT" : "EDGE QUEUE · CHEAP → EXPENSIVE") : (vi ? "DANH SÁCH CẠNH (chưa sort)" : "EDGE LIST (unsorted)")}</strong><span>${edges.length} ${vi ? "cạnh" : "edges"}</span></header><div>${queue}</div></section>
    <div class="cc-main">
      <section class="cc-graph-wrap">${graphSvg}</section>
      <aside class="cc-side">
        ${scoreHtml}
        <section class="cc-decision ${decCls}"><small>${vi ? "QUYẾT ĐỊNH" : "DECISION"}</small><strong>${escapeHtml(decTitle)}</strong>${rootsLine}<p>${escapeHtml(decNote)}</p></section>
        ${answerHtml}
        <section class="cc-components"><header><strong>DSU ${vi ? "NHÓM" : "GROUPS"}</strong><span>${(view.groups || []).length}</span></header><div>${comps}</div></section>
      </aside>
    </div>
  </section>`;
}

function renderKruskalEffortView(step) {
  const view = step.kruskalEffortView;
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseIndex = { build: 0, sort: 1, find: 2, union: 3, check: 4, done: 5 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Tạo cạnh", "2 · Sort ↑", "3 · Find root", "4 · Union", "5 · Kiểm tra S↔T"]
    : ["1 · Build edges", "2 · Sort ↑", "3 · Find roots", "4 · Union", "5 · Check S↔T"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    const icon = state === "done" ? "✓" : state === "active" ? "▶" : "○";
    return `<span class="${state}">${icon} ${escapeHtml(label)}</span>`;
  }).join("");

  const edges = Array.isArray(view.edges) ? view.edges : [];
  const accepted = new Set((view.acceptedEdges || []).map((edge) => edge.key));
  const skipped = new Set(view.skippedEdgeKeys || []);
  const currentKey = view.currentEdge ? view.currentEdge.key : null;
  const maxVisibleEdges = 18;
  let edgeWindowStart = 0;
  if (edges.length > maxVisibleEdges && view.edgeIndex >= 0) {
    edgeWindowStart = Math.max(0, Math.min(view.edgeIndex - 5, edges.length - maxVisibleEdges));
  }
  const visibleEdges = edges.slice(edgeWindowStart, edgeWindowStart + maxVisibleEdges);
  const edgeChips = visibleEdges.map((edge, offset) => {
    const index = edgeWindowStart + offset;
    const classes = [];
    if (accepted.has(edge.key)) classes.push("accepted");
    if (skipped.has(edge.key)) classes.push("skipped");
    if (edge.key === currentKey && index === view.edgeIndex) classes.push("current");
    const [fromRow, fromCol] = edge.from;
    const [toRow, toCol] = edge.to;
    return `<span class="${classes.join(" ")}"><small>#${index + 1}</small><b>(${fromRow},${fromCol})↔(${toRow},${toCol})</b><strong>Δ=${edge.diff}</strong></span>`;
  }).join("");
  const hiddenBefore = edgeWindowStart > 0 ? `<em>… ${edgeWindowStart} ${vi ? "cạnh trước" : "earlier edges"}</em>` : "";
  const hiddenAfterCount = edges.length - edgeWindowStart - visibleEdges.length;
  const hiddenAfter = hiddenAfterCount > 0 ? `<em>+${hiddenAfterCount} ${vi ? "cạnh" : "edges"}</em>` : "";
  const edgeLaneTitle = view.sorted
    ? (vi ? "CẠNH ĐÃ SORT — nhỏ nhất ở bên trái" : "SORTED EDGES — smallest first")
    : (vi ? "CẠNH ĐANG ĐƯỢC TẠO — chưa sort" : "EDGES BEING BUILT — unsorted");

  const width = 104 + Math.max(0, view.cols - 1) * 96;
  const height = 100 + Math.max(0, view.rows - 1) * 92;
  const center = (cell) => ({ x: 52 + cell[1] * 96, y: 50 + cell[0] * 92 });
  const pathKeys = new Set((view.pathEdges || []).map((edge) => edge.key));
  const pathCells = new Set();
  for (const edge of view.pathEdges || []) {
    pathCells.add(`${edge.from[0]},${edge.from[1]}`);
    pathCells.add(`${edge.to[0]},${edge.to[1]}`);
  }

  const acceptedLines = (view.acceptedEdges || []).map((edge) => {
    const from = center(edge.from);
    const to = center(edge.to);
    const classes = ["kruskal-link", "accepted"];
    if (pathKeys.has(edge.key)) classes.push("path");
    if (pathKeys.has(edge.key) && edge.diff === view.answer) classes.push("bottleneck");
    return `<line class="${classes.join(" ")}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
  }).join("");
  let currentLine = "";
  if (view.currentEdge && view.event !== "done") {
    const from = center(view.currentEdge.from);
    const to = center(view.currentEdge.to);
    currentLine = `<line class="kruskal-link current" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
  }

  const nodes = view.heights.map((row, rowIndex) => row.map((cellHeight, colIndex) => {
    const cell = [rowIndex, colIndex];
    const cellId = rowIndex * view.cols + colIndex;
    const point = center(cell);
    const root = view.roots[cellId];
    const cellKey = `${rowIndex},${colIndex}`;
    const isStart = rowIndex === view.start[0] && colIndex === view.start[1];
    const isTarget = rowIndex === view.target[0] && colIndex === view.target[1];
    const isCurrentCell = view.currentCell && rowIndex === view.currentCell[0] && colIndex === view.currentCell[1];
    const isEdgeEnd = view.currentEdge && (
      (rowIndex === view.currentEdge.from[0] && colIndex === view.currentEdge.from[1]) ||
      (rowIndex === view.currentEdge.to[0] && colIndex === view.currentEdge.to[1])
    );
    const classes = ["kruskal-cell", `component-${Math.abs(root) % 6}`];
    if (isCurrentCell) classes.push("scan");
    if (isEdgeEnd) classes.push("edge-end");
    if (pathCells.has(cellKey)) classes.push("path");
    const endpoint = isStart ? "S" : isTarget ? "T" : "";
    return `<g class="${classes.join(" ")}" aria-label="cell (${rowIndex},${colIndex}), height ${cellHeight}, root ${root}">
      <rect x="${point.x - 34}" y="${point.y - 31}" width="68" height="62" rx="9"></rect>
      <text class="coord" x="${point.x - 29}" y="${point.y - 16}">${rowIndex},${colIndex}</text>
      ${endpoint ? `<text class="endpoint" x="${point.x + 26}" y="${point.y - 16}">${endpoint}</text>` : ""}
      <text class="height" x="${point.x}" y="${point.y + 5}">${escapeHtml(cellHeight)}</text>
      <text class="root" x="${point.x}" y="${point.y + 22}">root R${root}</text>
    </g>`;
  }).join("")).join("");
  const gridSummary = vi
    ? `Grid ${view.rows} × ${view.cols}; màu ô biểu diễn component DSU hiện tại.`
    : `${view.rows} × ${view.cols} grid; cell color represents its current DSU component.`;
  const gridSvg = `<svg class="kruskal-grid-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(gridSummary)}">
    ${acceptedLines}${currentLine}${nodes}
  </svg>`;

  let edgeDetail;
  if (view.currentEdge) {
    const edge = view.currentEdge;
    const heightA = view.heights[edge.from[0]][edge.from[1]];
    const heightB = view.heights[edge.to[0]][edge.to[1]];
    const roots = view.rootsBefore;
    let decision = vi ? "Chưa Union" : "Not unioned yet";
    let decisionClass = "waiting";
    if (view.unionChanged === true) {
      decision = roots
        ? (vi ? `Gộp R${roots.u} → R${roots.v}` : `Merge R${roots.u} → R${roots.v}`)
        : (vi ? "Đã gộp hai component" : "Merged two components");
      decisionClass = "merged";
    } else if (view.unionChanged === false) {
      decision = vi ? "Cùng root → bỏ qua chu trình" : "Same root → skip cycle";
      decisionClass = "skipped";
    } else if (roots) {
      decision = roots.u === roots.v
        ? (vi ? "Cùng root → sẽ bỏ qua" : "Same root → will skip")
        : (vi ? "Khác root → có thể gộp" : "Different roots → can merge");
      decisionClass = roots.u === roots.v ? "skipped" : "waiting";
    }
    edgeDetail = `<div class="kruskal-edge-detail">
      <div><small>${vi ? "CẠNH HIỆN TẠI" : "CURRENT EDGE"}</small><strong>(${edge.from[0]},${edge.from[1]}) ↔ (${edge.to[0]},${edge.to[1]})</strong></div>
      <div class="kruskal-diff"><small>|${heightA} − ${heightB}|</small><strong>${edge.diff}</strong></div>
      ${roots ? `<div class="kruskal-roots-before"><span>find(u) = <b>R${roots.u}</b></span><span>find(v) = <b>R${roots.v}</b></span></div>` : ""}
      <div class="kruskal-union-decision ${decisionClass}">${escapeHtml(decision)}</div>
    </div>`;
  } else {
    edgeDetail = `<div class="kruskal-threshold-rule"><code>${vi ? "Mở các cạnh theo diff tăng dần" : "Open edges by ascending diff"}</code><span>${vi ? "Lần đầu S nối T ⇒ ngưỡng nhỏ nhất" : "First time S reaches T ⇒ minimum threshold"}</span></div>`;
  }

  const componentChips = (view.groups || []).map((group) => {
    const cells = group.cells.map(([row, col]) => `(${row},${col})`).join(" ");
    return `<span class="component-chip component-${Math.abs(group.root) % 6}"><b>R${group.root}</b><small>${escapeHtml(cells)}</small></span>`;
  }).join("");
  const connectionClass = view.connected ? "connected" : "separate";
  const connectionText = view.connected
    ? (vi ? "✓ CÙNG COMPONENT" : "✓ SAME COMPONENT")
    : (vi ? "CHƯA KẾT NỐI" : "NOT CONNECTED");
  const connectionHtml = `<div class="kruskal-connection ${connectionClass}">
    <span><small>START</small><b>S · R${view.startRoot}</b></span>
    <strong>${view.connected ? "═" : "≠"}</strong>
    <span><small>TARGET</small><b>T · R${view.targetRoot}</b></span>
    <em>${connectionText}</em>
  </div>`;

  const pathHtml = view.pathEdges && view.pathEdges.length
    ? `<div class="kruskal-final-path"><strong>${vi ? `ĐƯỜNG KẾT NỐI · effort = ${view.answer}` : `CONNECTED PATH · effort = ${view.answer}`}</strong><div>${view.pathEdges.map((edge) => {
      const bottleneck = edge.diff === view.answer;
      return `<span class="${bottleneck ? "bottleneck" : ""}">(${edge.from[0]},${edge.from[1]})→(${edge.to[0]},${edge.to[1]}) <b>Δ=${edge.diff}</b></span>`;
    }).join("")}</div></div>`
    : "";

  el.innerHTML = `<div class="kruskal-effort-viz">
    <div class="kruskal-phases">${phases}</div>
    <div class="kruskal-edge-lane"><div><strong>${edgeLaneTitle}</strong><small>${edges.length} ${vi ? "cạnh" : "edges"}</small></div><div>${hiddenBefore}${edgeChips}${hiddenAfter}</div></div>
    <div class="kruskal-main">
      <div class="kruskal-grid-wrap">${gridSvg}<div class="kruskal-grid-legend"><span><i class="accepted"></i>${vi ? "cạnh đã Union" : "unioned edge"}</span><span><i class="current"></i>${vi ? "cạnh đang xét" : "current edge"}</span><span><i class="bottleneck"></i>bottleneck</span></div></div>
      <div class="kruskal-state">${edgeDetail}${connectionHtml}<div class="kruskal-components"><strong>DSU COMPONENTS · ${view.groups.length}</strong><div>${componentChips}</div></div></div>
    </div>
    ${pathHtml}
  </div>`;
}

function renderParallelCoursesView(step) {
  const view = step.parallelCoursesView;
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseIndex = { build: 0, seed: 1, semester: 2, relax: 3, check: 4, done: 5 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Xây graph", "2 · Tìm in-degree 0", "3 · Học song song", "4 · Gỡ cạnh", "5 · Kiểm tra cycle"]
    : ["1 · Build graph", "2 · Find in-degree 0", "3 · Parallel semester", "4 · Remove edges", "5 · Check cycle"];
  const phaseHtml = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    const icon = state === "done" ? "✓" : state === "active" ? "▶" : "○";
    return `<span class="${state}">${icon} ${escapeHtml(label)}</span>`;
  }).join("");

  const columns = view.planColumns || [];
  const maxRows = Math.max(1, ...columns.map((column) => column.courses.length));
  const graphWidth = Math.max(600, columns.length * 210);
  const graphHeight = Math.max(280, 115 + maxRows * 92);
  const columnWidth = graphWidth / Math.max(1, columns.length);
  const positions = new Map();
  let columnSvg = "";
  columns.forEach((column, columnIndex) => {
    const centerX = columnWidth * (columnIndex + 0.5);
    const revealCycle = column.kind === "cycle" && view.event === "cycle";
    const columnLabel = column.kind === "cycle"
      ? (revealCycle ? (vi ? "⛔ CHU TRÌNH" : "⛔ CYCLE") : (vi ? "CHƯA GIẢI QUYẾT" : "UNRESOLVED"))
      : (vi ? `HỌC KỲ ${column.semester}` : `SEMESTER ${column.semester}`);
    if (columnIndex > 0) {
      const dividerX = columnWidth * columnIndex;
      columnSvg += `<line class="pc-column-divider" x1="${dividerX}" y1="34" x2="${dividerX}" y2="${graphHeight - 14}"></line>`;
    }
    columnSvg += `<text class="pc-column-label${revealCycle ? " cycle" : ""}" x="${centerX}" y="24" text-anchor="middle">${escapeXml(columnLabel)}</text>`;

    if (column.kind === "cycle" && column.courses.length > 1) {
      const radius = Math.min(68, columnWidth * 0.28);
      const centerY = graphHeight / 2 + 10;
      column.courses.forEach((course, index) => {
        const angle = (2 * Math.PI * index) / column.courses.length - Math.PI / 2;
        positions.set(course, {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        });
      });
    } else {
      const usableHeight = graphHeight - 72;
      column.courses.forEach((course, row) => {
        positions.set(course, {
          x: centerX,
          y: 48 + ((row + 1) * usableHeight) / (column.courses.length + 1),
        });
      });
    }
  });

  const builtEdges = new Set(view.builtEdgeKeys || []);
  const processedEdges = new Set(view.processedEdgeKeys || []);
  const activeEdgeKey = view.activeEdge ? view.activeEdge.key : null;
  const nodeRadius = 36;
  const edgeSvg = (view.relations || []).map((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) return "";
    const active = edge.key === activeEdgeKey;
    const processed = processedEdges.has(edge.key);
    const built = builtEdges.has(edge.key);
    const state = active ? "active" : processed ? "processed" : built ? "built" : "unbuilt";
    const marker = active ? "pc-arrow-active" : processed ? "pc-arrow-processed" : "pc-arrow";
    if (edge.from === edge.to) {
      return `<path class="pc-edge ${state}" d="M ${from.x} ${from.y - nodeRadius} C ${from.x + 82} ${from.y - 78}, ${from.x + 82} ${from.y + 78}, ${from.x} ${from.y + nodeRadius}" marker-end="url(#${marker})"></path>`;
    }
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    const unitX = dx / distance;
    const unitY = dy / distance;
    const x1 = from.x + unitX * (nodeRadius + 2);
    const y1 = from.y + unitY * (nodeRadius + 2);
    const x2 = to.x - unitX * (nodeRadius + (active ? 8 : 6));
    const y2 = to.y - unitY * (nodeRadius + (active ? 8 : 6));
    return `<line class="pc-edge ${state}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${marker})"></line>`;
  }).join("");

  const completedSet = new Set(view.completed || []);
  const betweenSemesters = Number(view.semester) > 0
    && (view.event === "semester-complete" || (view.event === "while-check" && (view.queue || []).length > 0));
  const currentQueue = betweenSemesters
    ? []
    : view.batchActive
      ? view.currentBatch
      : view.queue || [];
  const displayedNextQueue = betweenSemesters ? view.queue || [] : view.nextQueue || [];
  const currentQueueSet = new Set(currentQueue);
  const nextQueueSet = new Set(displayedNextQueue);
  const stuckSet = new Set(view.event === "cycle" ? view.stuckCourses || [] : []);
  const nodeSvg = (view.courses || []).map((course) => {
    const point = positions.get(course);
    if (!point) return "";
    const indegree = view.indegree[course - 1];
    const classes = ["pc-node"];
    let stateLabel = indegree === 0 ? (vi ? "sẵn sàng" : "ready") : (vi ? "đang chờ" : "waiting");
    if (completedSet.has(course)) {
      classes.push("completed");
      stateLabel = vi ? "đã học" : "done";
    }
    if (currentQueueSet.has(course)) {
      classes.push("queued");
      stateLabel = vi ? "queue hiện tại" : "current queue";
    }
    if (nextQueueSet.has(course)) {
      classes.push("next-queued");
      stateLabel = vi ? "queue kế tiếp" : "next queue";
    }
    if (course === view.currentNeighbor) classes.push("neighbor");
    if (course === view.currentCourse) {
      classes.push("current");
      stateLabel = vi ? "đang xử lý" : "processing";
    }
    if (stuckSet.has(course)) {
      classes.push("stuck");
      stateLabel = vi ? "kẹt cycle" : "cycle stuck";
    }
    return `<g class="${classes.join(" ")}" aria-label="course ${course}, in-degree ${indegree}, ${escapeHtml(stateLabel)}">
      <circle cx="${point.x}" cy="${point.y}" r="${nodeRadius}"></circle>
      <text class="course" x="${point.x}" y="${point.y - 7}">C${course}</text>
      <text class="degree" x="${point.x}" y="${point.y + 10}">in = ${indegree}</text>
      <text class="state" x="${point.x}" y="${point.y + 25}">${escapeXml(stateLabel)}</text>
    </g>`;
  }).join("");

  const graphSummary = vi
    ? "Đồ thị môn học được chia theo học kỳ, với mũi tên từ tiên quyết tới môn phụ thuộc."
    : "Course graph grouped by semester, with arrows from prerequisites to dependent courses.";
  const graphHtml = `<svg class="pc-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" role="img" aria-label="${escapeHtml(graphSummary)}">
    <defs>
      <marker id="pc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
      <marker id="pc-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
      <marker id="pc-arrow-processed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
    </defs>
    ${columnSvg}${edgeSvg}${nodeSvg}
  </svg>`;

  function queueChips(items, className) {
    return items.length
      ? items.map((course) => `<span class="${className}">C${course}</span>`).join("")
      : `<em>∅</em>`;
  }

  let actionHtml;
  if (view.event === "cycle") {
    actionHtml = `<div class="pc-action cycle"><small>${vi ? "BỊ KẸT" : "STUCK"}</small><strong>${(view.stuckCourses || []).map((course) => `C${course}`).join(", ")}</strong><span>${vi ? "queue rỗng nhưng in-degree vẫn > 0" : "queue is empty but in-degree remains > 0"}</span></div>`;
  } else if (view.event === "done") {
    actionHtml = `<div class="pc-action success"><small>${vi ? "HOÀN THÀNH" : "COMPLETE"}</small><strong>${view.answer} ${vi ? "học kỳ" : "semester(s)"}</strong><span>${vi ? "Mọi môn đã được xử lý" : "Every course was processed"}</span></div>`;
  } else if (view.event === "capture-size") {
    const batchText = (view.currentBatch || []).map((course) => `C${course}`).join(" + ") || "∅";
    actionHtml = `<div class="pc-action course"><small>${vi ? "KHÓA BATCH HIỆN TẠI" : "LOCK CURRENT BATCH"}</small><strong>size = ${view.loopSize}</strong><b>${batchText}</b><span>${vi ? "Môn vừa được mở khóa phải vào queue của học kỳ sau" : "A newly unlocked course must enter next semester's queue"}</span></div>`;
  } else if (view.event === "semester-complete") {
    const readyText = (view.queue || []).map((course) => `C${course}`).join(" + ") || "∅";
    actionHtml = `<div class="pc-action success"><small>${vi ? `XONG HỌC KỲ ${view.semester}` : `SEMESTER ${view.semester} COMPLETE`}</small><strong>${readyText}</strong><span>${vi ? `Trở thành queue đầu học kỳ ${view.semester + 1}` : `Becomes the starting queue for semester ${view.semester + 1}`}</span></div>`;
  } else if (["seed-check-ready", "seed-check-blocked", "seed-ready"].includes(view.event)) {
    const degree = view.indegree[view.currentCourse - 1];
    const decision = view.event === "seed-ready"
      ? (vi ? `queue.append(${view.currentCourseIndex})` : `queue.append(${view.currentCourseIndex})`)
      : view.event === "seed-check-ready"
        ? (vi ? "điều kiện True → bước sau sẽ append" : "condition is True → the next step appends")
      : (vi ? `còn ${degree} prerequisite → tiếp tục chờ` : `${degree} prerequisite(s) remain → keep waiting`);
    actionHtml = `<div class="pc-action ${view.event === "seed-ready" ? "success" : "rule"}"><small>${vi ? "INDEX → MÔN HỌC" : "INDEX → COURSE"}</small><strong>i=${view.currentCourseIndex} → C${view.currentCourse}</strong><b>indegree[${view.currentCourseIndex}] = ${degree}</b><span>${escapeHtml(decision)}</span></div>`;
  } else if (view.phase === "build" && view.activeEdge) {
    const buildValue = view.event === "increment-indegree"
      ? `indegree[${view.activeEdge.to - 1}]: ${view.indegreeBefore} → ${view.indegreeAfter}`
      : view.event === "add-edge"
        ? `graph[${view.activeEdge.from - 1}].append(${view.activeEdge.to - 1})`
        : (vi ? "Đọc cặp prerequisite" : "Read prerequisite pair");
    actionHtml = `<div class="pc-action edge"><small>${vi ? "XÂY ĐỒ THỊ" : "BUILD GRAPH"}</small><strong>C${view.activeEdge.from} → C${view.activeEdge.to}</strong><b>${escapeHtml(buildValue)}</b><span>${vi ? "Mũi tên đi từ prerequisite tới môn phụ thuộc" : "The arrow goes from prerequisite to dependent course"}</span></div>`;
  } else if (view.activeEdge) {
    const degreeText = view.indegreeBefore !== undefined
      ? `indegree[${view.activeEdge.to - 1}]: ${view.indegreeBefore} → ${view.indegreeAfter}`
      : `indegree[${view.activeEdge.to - 1}] = ${view.indegree[view.activeEdge.to - 1]}`;
    const decisionText = view.readyDecision === true
      ? (vi ? `C${view.activeEdge.to} đã sẵn sàng cho học kỳ sau` : `C${view.activeEdge.to} is ready for next semester`)
      : view.readyDecision === false
        ? (vi ? `C${view.activeEdge.to} vẫn phải chờ` : `C${view.activeEdge.to} is still blocked`)
        : (vi ? "Gỡ một prerequisite đã hoàn thành" : "Remove one completed prerequisite");
    actionHtml = `<div class="pc-action edge"><small>${vi ? "CẠNH ĐANG XỬ LÝ" : "ACTIVE EDGE"}</small><strong>C${view.activeEdge.from} → C${view.activeEdge.to}</strong><b>${escapeHtml(degreeText)}</b><span>${escapeHtml(decisionText)}</span></div>`;
  } else if (view.event === "result-check") {
    const ok = view.allCompleted === true;
    actionHtml = `<div class="pc-action ${ok ? "success" : "cycle"}"><small>count == n</small><strong>${view.count} == ${view.n} → ${ok ? "True" : "False"}</strong><span>${ok ? (vi ? "trả semester ở dòng kế tiếp" : "return semester on the next line") : (vi ? "đi vào nhánh else" : "enter the else branch")}</span></div>`;
  } else if (view.event === "else-branch") {
    actionHtml = `<div class="pc-action cycle"><small>ELSE</small><strong>count &lt; n</strong><span>${vi ? "còn môn chưa thể lấy khỏi queue" : "some courses could not be removed from the queue"}</span></div>`;
  } else if (view.currentCourse !== null && view.currentCourse !== undefined) {
    const processingSemester = view.activeSemester || view.semester || 1;
    actionHtml = `<div class="pc-action course"><small>${vi ? "INDEX ĐANG XỬ LÝ" : "CURRENT INDEX"}</small><strong>curr=${view.currentCourseIndex} → C${view.currentCourse}</strong><span>${vi ? `Batch học kỳ ${processingSemester} · duyệt graph[curr]` : `Semester ${processingSemester} batch · scan graph[curr]`}</span></div>`;
  } else {
    actionHtml = `<div class="pc-action rule"><code>queue stores 0-based indices</code><span>${vi ? "Mỗi BFS layer = một học kỳ" : "Each BFS layer = one semester"}</span></div>`;
  }

  const indegreeHtml = (view.courses || []).map((course) => {
    const degree = view.indegree[course - 1];
    const classes = [];
    if (course === view.currentNeighbor) classes.push("active");
    if (degree === 0) classes.push("ready");
    if (completedSet.has(course)) classes.push("completed");
    if (stuckSet.has(course)) classes.push("stuck");
    return `<span class="${classes.join(" ")}"><small>C${course} · [${course - 1}]</small><strong>${degree}</strong><em>${degree === 0 ? (vi ? "ready" : "ready") : `${degree} ${vi ? "còn lại" : "left"}`}</em></span>`;
  }).join("");

  const historyHtml = (view.semesterHistory || []).length
    ? view.semesterHistory.map((item) => `<span><small>S${item.semester}</small><strong>${item.courses.map((course) => `C${course}`).join(" + ")}</strong></span>`).join("")
    : `<em>${vi ? "Chưa hoàn thành học kỳ nào" : "No completed semester yet"}</em>`;

  const queueSemester = view.activeSemester || ((view.semester || 0) + 1);
  const currentQueueTitle = betweenSemesters
    ? (vi ? `HỌC KỲ ${view.semester} · ĐÃ XONG` : `SEMESTER ${view.semester} · COMPLETE`)
    : view.batchActive
      ? (vi ? `HỌC KỲ ${queueSemester} · CÒN LẠI` : `SEMESTER ${queueSemester} · REMAINING`)
      : (vi ? "QUEUE SẴN SÀNG BAN ĐẦU" : "INITIAL READY QUEUE");
  const nextQueueTitle = view.batchActive
    ? (vi ? `APPEND CHO HỌC KỲ ${queueSemester + 1}` : `APPENDED FOR SEMESTER ${queueSemester + 1}`)
    : (vi ? `QUEUE HỌC KỲ ${queueSemester}` : `SEMESTER ${queueSemester} QUEUE`);

  el.innerHTML = `<div class="pc-viz">
    <div class="pc-phases">${phaseHtml}</div>
    <div class="pc-summary">
      <span><small>semester</small><strong>${view.semester ?? "—"}</strong></span>
      <span><small>count</small><strong>${view.count ?? "—"}/${view.n}</strong></span>
      <span><small>${vi ? "QUEUE READY" : "READY QUEUE"}</small><strong>${currentQueue.length + displayedNextQueue.length}</strong></span>
    </div>
    <div class="pc-queues">
      <div><small>${currentQueueTitle}</small><section>${queueChips(currentQueue, "current")}</section></div>
      <i>→</i>
      <div><small>${nextQueueTitle}</small><section>${queueChips(displayedNextQueue, "next")}</section></div>
    </div>
    <div class="pc-main">
      <div class="pc-graph">${graphHtml}<div class="pc-legend"><span><i class="ready"></i>${vi ? "ready" : "ready"}</span><span><i class="current"></i>${vi ? "đang xử lý" : "processing"}</span><span><i class="completed"></i>${vi ? "đã học" : "done"}</span><span><i class="next"></i>${vi ? "queue sau" : "next queue"}</span></div></div>
      <div class="pc-debug">
        ${actionHtml}
        <div class="pc-indegree"><strong>IN-DEGREE</strong><div>${indegreeHtml}</div></div>
        <div class="pc-history"><strong>${vi ? "CÁC HỌC KỲ ĐÃ XONG" : "COMPLETED SEMESTERS"}</strong><div>${historyHtml}</div></div>
      </div>
    </div>
  </div>`;
}

function loudRichKahnHtml(view) {
  const vi = lang === "vi";
  const phaseIndex = { build: 0, seed: 1, propagate: 2, unlock: 3, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Dựng cạnh richer → poorer", "2 · Enqueue indegree = 0", "3 · Truyền best quiet xuống", "4 · Giảm indegree và mở khóa"]
    : ["1 · Build richer → poorer edges", "2 · Enqueue indegree = 0", "3 · Propagate the best quiet", "4 · Decrement indegree and unlock"];
  const phases = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < phaseIndex;
    const state = done ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${done ? "✓" : index === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const builtEdgeKeys = new Set(view.builtEdgeKeys || []);
  const processedEdgeKeys = new Set(view.processedEdgeKeys || []);
  const queueSet = new Set(view.queue || []);
  const processedSet = new Set(view.processed || []);
  const relationChips = (view.richerEdges || []).map((edge, index) => {
    const classes = [];
    if (builtEdgeKeys.has(edge.key)) classes.push("built");
    if (processedEdgeKeys.has(edge.key)) classes.push("processed");
    if (edge.key === view.activeEdgeKey) classes.push("active");
    return `<span class="${classes.join(" ")}"><small>#${index + 1}</small><strong>P${edge.a} &gt; P${edge.b}</strong><em>P${edge.a} → P${edge.b}</em></span>`;
  }).join("");

  const layoutAdj = Array.from({ length: view.n }, () => []);
  const layoutIndegree = new Array(view.n).fill(0);
  for (const edge of view.richerEdges || []) {
    layoutAdj[edge.a].push(edge.b);
    layoutIndegree[edge.b] += 1;
  }
  const layoutQueue = [];
  const levels = new Array(view.n).fill(0);
  layoutIndegree.forEach((degree, person) => { if (degree === 0) layoutQueue.push(person); });
  for (let index = 0; index < layoutQueue.length; index++) {
    const person = layoutQueue[index];
    for (const poorer of layoutAdj[person]) {
      levels[poorer] = Math.max(levels[poorer], levels[person] + 1);
      layoutIndegree[poorer] -= 1;
      if (layoutIndegree[poorer] === 0) layoutQueue.push(poorer);
    }
  }
  const maxLevel = Math.max(0, ...levels);
  const layers = Array.from({ length: maxLevel + 1 }, () => []);
  levels.forEach((level, person) => layers[level].push(person));
  const maxLayerSize = Math.max(1, ...layers.map((layer) => layer.length));
  const graphWidth = Math.max(520, 100 + maxLayerSize * 116);
  const graphHeight = Math.max(150, 104 + maxLevel * 124);
  const nodeRadius = 36;
  const positions = new Map();
  layers.forEach((layer, level) => {
    layer.forEach((person, index) => {
      positions.set(person, {
        x: ((index + 1) * graphWidth) / (layer.length + 1),
        y: 54 + level * 124,
      });
    });
  });

  const edgesHtml = (view.richerEdges || []).map((edge) => {
    const from = positions.get(edge.a);
    const to = positions.get(edge.b);
    if (!from || !to) return "";
    const active = edge.key === view.activeEdgeKey;
    const classes = ["lrk-edge"];
    if (!builtEdgeKeys.has(edge.key)) classes.push("unbuilt");
    else if (processedEdgeKeys.has(edge.key)) classes.push("processed");
    else classes.push("built");
    if (active) classes.push("active");
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const x1 = from.x + ux * (nodeRadius + 2);
    const y1 = from.y + uy * (nodeRadius + 2);
    const x2 = to.x - ux * (nodeRadius + 7);
    const y2 = to.y - uy * (nodeRadius + 7);
    return `<line class="${classes.join(" ")}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${active ? "lrk-arrow-active" : "lrk-arrow"})"></line>`;
  }).join("");

  const nodesHtml = Array.from({ length: view.n }, (_, person) => {
    const point = positions.get(person) || { x: graphWidth / 2, y: graphHeight / 2 };
    const degree = view.indegree === null ? null : view.indegree[person];
    const best = view.answer === null ? null : view.answer[person];
    const classes = ["lrk-node"];
    if (degree !== null && degree > 0) classes.push("locked");
    if (degree === 0 && !processedSet.has(person)) classes.push("ready");
    if (queueSet.has(person)) classes.push("queued");
    if (processedSet.has(person)) classes.push("processed");
    if (person === view.seedPerson) classes.push("seed");
    if (person === view.activeU) classes.push("source");
    if (person === view.activeV) classes.push("target");
    const degreeText = degree === null ? "in —" : `in ${degree}`;
    const bestText = best === null ? "best —" : `best P${best} · q${view.quiet[best]}`;
    const stateText = person === view.activeU
      ? "SOURCE"
      : person === view.activeV
        ? "TARGET"
        : queueSet.has(person)
          ? "QUEUE"
          : processedSet.has(person)
            ? "DONE"
            : degree === 0
              ? "READY"
              : degree === null
                ? "WAIT"
                : `WAIT ${degree}`;
    return `<g class="${classes.join(" ")}" aria-label="person ${person}, quiet ${view.quiet[person]}, ${degreeText}, ${bestText}">
      <circle cx="${point.x}" cy="${point.y}" r="${nodeRadius}"></circle>
      <text class="quiet" x="${point.x}" y="${point.y - 18}">quiet ${view.quiet[person]}</text>
      <text class="person" x="${point.x}" y="${point.y + 4}">P${person}</text>
      <text class="best" x="${point.x}" y="${point.y + 23}">${bestText}</text>
      <text class="degree" x="${point.x}" y="${point.y + nodeRadius + 15}">${degreeText} · ${stateText}</text>
    </g>`;
  }).join("");
  const graphSummary = vi
    ? "Đồ thị Kahn có mũi tên từ người giàu hơn xuống người nghèo hơn."
    : "Kahn graph with arrows from richer people down to poorer people.";
  const graphSvg = `<svg class="lrk-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" role="img" aria-label="${escapeHtml(graphSummary)}">
    <defs>
      <marker id="lrk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10z"></path></marker>
      <marker id="lrk-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10z"></path></marker>
    </defs>
    ${edgesHtml}${nodesHtml}
  </svg>`;

  const queueHtml = view.queue === null
    ? `<em>${vi ? "chưa khởi tạo" : "not initialized"}</em>`
    : view.queue.length
      ? view.queue.map((person, index) => `<span class="${person === view.enqueuedPerson ? "new" : ""}"><small>${index === 0 ? "FRONT" : index === view.queue.length - 1 ? "BACK" : `#${index}`}</small><strong>P${person}</strong><em>best P${view.answer[person]} · q${view.quiet[view.answer[person]]}</em></span>`).join("")
      : `<em>${vi ? "queue rỗng" : "empty queue"}</em>`;
  const currentHtml = Number.isInteger(view.activeU) && ["dequeue", "select-edge", "compare", "update-answer", "decrement-indegree", "check-ready", "enqueue"].includes(view.event)
    ? `<span><small>CURRENT u</small><strong>P${view.activeU}</strong><em>best P${view.answer[view.activeU]} · q${view.quiet[view.answer[view.activeU]]}</em></span>`
    : `<em>${vi ? "chưa popleft" : "nothing dequeued"}</em>`;
  const topoHtml = (view.topoOrder || []).length
    ? view.topoOrder.map((person, index) => `<span><small>#${index + 1}</small><strong>P${person}</strong></span>`).join(`<b>→</b>`)
    : `<em>${vi ? "chưa xử lý node" : "no processed node"}</em>`;

  let actionHtml;
  if (view.candidatePerson !== undefined && view.currentBestPerson !== undefined) {
    const update = view.shouldUpdate === true;
    actionHtml = `<div class="lrk-compare">
      <span class="candidate"><small>${vi ? `CANDIDATE TỪ P${view.activeU}` : `CANDIDATE FROM P${view.activeU}`}</small><strong>P${view.candidatePerson}</strong><b>quiet ${view.quiet[view.candidatePerson]}</b></span>
      <div><code>${view.quiet[view.candidatePerson]} ${update ? "<" : "≥"} ${view.quiet[view.currentBestPerson]}</code><strong class="${update ? "update" : "keep"}">${update ? "UPDATE" : "KEEP"}</strong></div>
      <span><small>${vi ? `BEST HIỆN TẠI CỦA P${view.activeV}` : `CURRENT BEST FOR P${view.activeV}`}</small><strong>P${view.currentBestPerson}</strong><b>quiet ${view.quiet[view.currentBestPerson]}</b></span>
    </div>`;
  } else if (view.indegreeBefore !== undefined && view.indegreeAfter !== undefined) {
    actionHtml = `<div class="lrk-degree-action"><small>${vi ? "SỐ RICHER PREDECESSOR CHƯA XỬ LÝ" : "UNPROCESSED RICHER PREDECESSORS"}</small><strong>indegree[P${view.activeV}]</strong><code>${view.indegreeBefore} → ${view.indegreeAfter}</code><span>${view.indegreeAfter === 0 ? (vi ? "Đã nhận đủ candidate · sẵn sàng enqueue" : "All candidates received · ready to enqueue") : (vi ? `Còn chờ ${view.indegreeAfter} predecessor` : `Still waiting for ${view.indegreeAfter} predecessor(s)`)}</span></div>`;
  } else if (view.event === "seed-check") {
    const degree = view.indegree[view.seedPerson];
    actionHtml = `<div class="lrk-seed-action ${view.ready ? "ready" : "locked"}"><small>SEED QUEUE</small><strong>P${view.seedPerson}</strong><code>indegree[${view.seedPerson}] = ${degree}</code><span>${view.ready ? (vi ? "0 → enqueue" : "0 → enqueue") : (vi ? `${degree} → chưa enqueue` : `${degree} → do not enqueue`)}</span></div>`;
  } else if (["seed-enqueue", "enqueue"].includes(view.event) && Number.isInteger(view.enqueuedPerson)) {
    actionHtml = `<div class="lrk-seed-action ready"><small>${vi ? "THÊM VÀO QUEUE" : "ADD TO QUEUE"}</small><strong>P${view.enqueuedPerson}</strong><code>q.append(${view.enqueuedPerson})</code><span>${vi ? `P${view.enqueuedPerson} đi vào BACK của queue` : `P${view.enqueuedPerson} moves to the BACK of the queue`}</span></div>`;
  } else if (view.event === "check-ready") {
    actionHtml = `<div class="lrk-seed-action ${view.ready ? "ready" : "locked"}"><small>${vi ? "MỞ KHÓA TARGET" : "UNLOCK TARGET"}</small><strong>P${view.activeV}</strong><code>indegree[${view.activeV}] = ${view.indegree[view.activeV]}</code><span>${view.ready ? (vi ? "Đã nhận đủ mọi candidate" : "All candidates received") : (vi ? "Vẫn còn predecessor chưa xử lý" : "Still has an unprocessed predecessor")}</span></div>`;
  } else if (Number.isInteger(view.activeU) && Number.isInteger(view.activeV)) {
    actionHtml = `<div class="lrk-edge-action"><small>RICHER → POORER</small><strong>P${view.activeU} → P${view.activeV}</strong><span>${vi ? `Truyền best quiet từ P${view.activeU} xuống P${view.activeV}` : `Propagate the best quiet from P${view.activeU} down to P${view.activeV}`}</span></div>`;
  } else if (view.event === "dequeue") {
    actionHtml = `<div class="lrk-edge-action"><small>POP FRONT</small><strong>P${view.activeU} · best P${view.answer[view.activeU]}</strong><span>${vi ? "Candidate của u đã hoàn chỉnh vì indegree[u] = 0" : "u's candidate is finalized because indegree[u] = 0"}</span></div>`;
  } else {
    actionHtml = `<div class="lrk-rule"><code>answer[v] = quieter(answer[v], answer[u])</code><span>${vi ? "Chỉ truyền từ richer u xuống poorer v; v chỉ vào queue khi indegree[v] = 0." : "Propagate only from richer u to poorer v; v enters the queue only when indegree[v] = 0."}</span></div>`;
  }

  const indegreeHtml = Array.from({ length: view.n }, (_, person) => {
    const degree = view.indegree === null ? null : view.indegree[person];
    const classes = [];
    if (person === view.activeU) classes.push("source");
    if (person === view.activeV || person === view.seedPerson) classes.push("target");
    if (queueSet.has(person)) classes.push("queued");
    if (processedSet.has(person)) classes.push("processed");
    if (degree === 0 && !processedSet.has(person)) classes.push("ready");
    const status = degree === null
      ? (vi ? "chưa tạo" : "not created")
      : processedSet.has(person)
        ? (vi ? "đã xử lý" : "processed")
        : queueSet.has(person)
          ? "queue"
          : degree === 0
            ? "ready"
            : (vi ? `chờ ${degree}` : `wait ${degree}`);
    return `<span class="${classes.join(" ")}"><small>P${person}</small><strong>${degree === null ? "—" : degree}</strong><em>${status}</em></span>`;
  }).join("");

  const answerHtml = Array.from({ length: view.n }, (_, person) => {
    const best = view.answer === null ? null : view.answer[person];
    const classes = [];
    if (person === view.activeV) classes.push("target");
    if (person === view.changedPerson) classes.push("changed");
    if (processedSet.has(person)) classes.push("finalized");
    return `<span class="${classes.join(" ")}"><small>answer[${person}]</small><strong>${best === null ? "—" : `P${best}`}</strong><em>${best === null ? "not initialized" : `quiet ${view.quiet[best]}`}</em></span>`;
  }).join("");

  return `<div class="loud-rich-kahn">
    <div class="lrk-phases">${phases}</div>
    <div class="lrk-direction"><strong>RICHER</strong><code>P a → P b</code><strong>POORER</strong><span>${vi ? "candidate quiet đi cùng chiều mũi tên" : "quiet candidates follow the arrow"}</span></div>
    <div class="lrk-relations"><header><strong>RICHER INPUT</strong><span>${vi ? "a > b trở thành cạnh a → b" : "a > b becomes edge a → b"}</span></header><div>${relationChips || "∅"}</div></div>
    <div class="lrk-queue-flow">
      <div><small>CURRENT</small><section>${currentHtml}</section></div><b>→</b>
      <div><small>QUEUE · FRONT → BACK</small><section>${queueHtml}</section></div>
    </div>
    <div class="lrk-main">
      <div class="lrk-graph">${graphSvg}<div class="lrk-legend"><span><i class="source"></i>source u</span><span><i class="target"></i>target v</span><span><i class="queued"></i>queue</span><span><i class="processed"></i>${vi ? "đã xử lý" : "processed"}</span></div></div>
      <div class="lrk-debug">${actionHtml}<div class="lrk-indegree"><header><strong>INDEGREE</strong><span>${vi ? "số richer predecessor còn chờ" : "richer predecessors still pending"}</span></header><div>${indegreeHtml}</div></div></div>
    </div>
    <div class="lrk-topo"><strong>TOPO ORDER</strong><div>${topoHtml}</div></div>
    <div class="lrk-answer"><header><strong>ANSWER</strong><span>answer[i] = ${vi ? "người quiet nhất giàu hơn hoặc bằng i" : "quietest person richer than or equal to i"}</span></header><div>${answerHtml}</div></div>
  </div>`;
}

function renderLoudRichView(step) {
  const view = step.loudRichView || step.loudRichV2;
  if (!view) return;
  const el = $("treeView");
  const vi = lang === "vi";

  const isBFS = !!step.loudRichV2;

  if (isBFS) {
    el.innerHTML = loudRichKahnHtml(view);
    return;
  }

  // Original DFS rendering
  const phaseIndex = { build: 0, dfs: 1, explore: 2, compare: 3, memo: 4, done: 5 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Đảo cạnh", "2 · Gọi DFS", "3 · Đi tới richer", "4 · So quiet", "5 · Memo"]
    : ["1 · Reverse edges", "2 · Call DFS", "3 · Visit richer", "4 · Compare quiet", "5 · Memoize"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  const builtKeys = new Set(view.builtEdgeKeys || []);
  const currentBuildKey = view.currentBuildEdge ? view.currentBuildEdge.key : null;
  const relationChips = (view.richerEdges || []).map((edge, index) => {
    const classes = [];
    if (builtKeys.has(edge.key)) classes.push("built");
    if (edge.key === currentBuildKey) classes.push("current");
    return `<span class="${classes.join(" ")}"><small>#${index + 1} · INPUT</small><b>P${edge.richer} &gt; P${edge.poorer}</b><em>DFS ${edge.poorer}→${edge.richer}</em></span>`;
  }).join("");

  const adjacency = Array.from({ length: view.n }, () => []);
  for (const edge of view.richerEdges || []) adjacency[edge.from].push(edge.to);
  const rankMemo = new Array(view.n).fill(null);
  const visiting = new Set();
  function rankOf(node) {
    if (rankMemo[node] !== null) return rankMemo[node];
    if (visiting.has(node)) return 0;
    visiting.add(node);
    const rank = adjacency[node].length ? 1 + Math.max(...adjacency[node].map(rankOf)) : 0;
    visiting.delete(node);
    rankMemo[node] = rank;
    return rank;
  }
  for (let node = 0; node < view.n; node++) rankOf(node);
  const maxRank = Math.max(0, ...rankMemo);
  const layers = Array.from({ length: maxRank + 1 }, () => []);
  rankMemo.forEach((rank, node) => layers[rank].push(node));
  const maxLayerSize = Math.max(1, ...layers.map((layer) => layer.length));
  const nodeRadius = 38;
  const layerGap = 108;
  const graphWidth = Math.max(440, 90 + maxLayerSize * 92);
  const graphHeight = 100 + maxRank * layerGap;
  const positions = new Map();
  layers.forEach((layer, rank) => {
    layer.forEach((node, index) => {
      positions.set(node, {
        x: ((index + 1) * graphWidth) / (layer.length + 1),
        y: 48 + rank * layerGap,
      });
    });
  });

  const activeFrom = view.activeEdge ? view.activeEdge[0] : null;
  const activeTo = view.activeEdge ? view.activeEdge[1] : null;
  const graphEdges = (view.richerEdges || []).map((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    const isActive = (edge.from === activeFrom && edge.to === activeTo) || edge.key === currentBuildKey;
    const classes = ["loud-rich-edge", builtKeys.has(edge.key) ? "built" : "unbuilt"];
    if (isActive) classes.push("active");
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    const unitX = dx / distance;
    const unitY = dy / distance;
    const startPadding = nodeRadius + 2;
    const endPadding = nodeRadius + (isActive ? 7 : 5);
    const x1 = from.x + unitX * startPadding;
    const y1 = from.y + unitY * startPadding;
    const x2 = to.x - unitX * endPadding;
    const y2 = to.y - unitY * endPadding;
    return `<line class="${classes.join(" ")}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${isActive ? "loud-rich-arrow-active" : "loud-rich-arrow"})"></line>`;
  }).join("");

  const stackSet = new Set(view.callStack || []);
  const doneSet = new Set(view.doneNodes || []);
  const graphNodes = Array.from({ length: view.n }, (_, person) => {
    const point = positions.get(person);
    const classes = ["loud-rich-node"];
    if (doneSet.has(person)) classes.push("done");
    if (stackSet.has(person)) classes.push("in-stack");
    if (person === view.currentNode) classes.push("current");
    if (person === view.neighbor) classes.push("neighbor");
    if (person === view.candidatePerson) classes.push("candidate");
    const memo = view.answer[person];
    const memoText = memo === -1 ? "ans —" : `ans P${memo} · q${view.quiet[memo]}`;
    return `<g class="${classes.join(" ")}" aria-label="person ${person}, quiet ${view.quiet[person]}, ${memoText}">
      <circle cx="${point.x}" cy="${point.y}" r="${nodeRadius}"></circle>
      <text class="quiet" x="${point.x}" y="${point.y - 17}">quiet ${view.quiet[person]}</text>
      <text class="person" x="${point.x}" y="${point.y + 7}">P${person}</text>
      <text class="memo" x="${point.x}" y="${point.y + 26}">${memoText}</text>
    </g>`;
  }).join("");
  const graphSummary = vi
    ? "Đồ thị DFS có mũi tên từ người nghèo hơn tới người giàu hơn."
    : "DFS graph with arrows from a poorer person to a richer person.";
  const graphSvg = `<svg class="loud-rich-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" role="img" aria-label="${escapeHtml(graphSummary)}">
    <defs>
      <marker id="loud-rich-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
      <marker id="loud-rich-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
    </defs>
    ${graphEdges}${graphNodes}
  </svg>`;

  const stackHtml = (view.callStack || []).length
    ? view.callStack.map((person, index) => `<span class="${index === view.callStack.length - 1 ? "top" : ""}"><small>${index === 0 ? "ROOT" : `#${index + 1}`}</small><b>dfs(${person})</b></span>`).join("<i>→</i>")
    : `<em>∅</em>`;

  let detailHtml;
  if (view.candidatePerson !== null && view.candidatePerson !== undefined) {
    const operator = view.willUpdate === null ? "?" : view.willUpdate ? "<" : "≥";
    const decision = view.willUpdate === null
      ? (vi ? "Đang chuẩn bị so sánh" : "Preparing comparison")
      : view.willUpdate
        ? (vi ? `UPDATE answer[${view.currentNode}] = ${view.candidatePerson}` : `UPDATE answer[${view.currentNode}] = ${view.candidatePerson}`)
        : (vi ? `KEEP answer[${view.currentNode}] = ${view.currentBestPerson}` : `KEEP answer[${view.currentNode}] = ${view.currentBestPerson}`);
    detailHtml = `<div class="loud-rich-compare">
      <span class="candidate"><small>${vi ? `TỪ answer[${view.neighbor}]` : `FROM answer[${view.neighbor}]`}</small><b>P${view.candidatePerson}</b><strong>quiet ${view.candidateQuiet}</strong></span>
      <i>${escapeHtml(operator)}</i>
      <span><small>${vi ? "BEST HIỆN TẠI" : "CURRENT BEST"}</small><b>P${view.currentBestPerson}</b><strong>quiet ${view.currentBestQuiet}</strong></span>
      <em class="${view.willUpdate ? "update" : "keep"}">${escapeHtml(decision)}</em>
    </div>`;
  } else if (["memo-hit", "memo-return"].includes(view.event) && view.currentBestPerson !== null) {
    detailHtml = `<div class="loud-rich-memo-hit"><small>MEMO HIT</small><strong>dfs(${view.currentNode}) → P${view.currentBestPerson}</strong><span>quiet ${view.currentBestQuiet} · ${vi ? "không DFS lại" : "no recomputation"}</span></div>`;
  } else if (view.currentNode !== null && view.currentNode !== undefined) {
    const neighbors = (view.graph[view.currentNode] || []).map((person) => `P${person}`).join(", ") || "∅";
    const best = view.answer[view.currentNode];
    detailHtml = `<div class="loud-rich-frame"><small>${vi ? "FRAME HIỆN TẠI" : "CURRENT FRAME"}</small><strong>dfs(${view.currentNode})</strong><span>${vi ? "richer neighbors" : "richer neighbors"}: ${neighbors}</span><span>${vi ? "best" : "best"}: ${best === -1 ? "—" : `P${best} · quiet ${view.quiet[best]}`}</span></div>`;
  } else {
    detailHtml = `<div class="loud-rich-rule"><code>answer[x] = argmin quiet[y]</code><span>${vi ? "với y = x hoặc y giàu hơn x" : "where y = x or y is richer than x"}</span></div>`;
  }

  const memoCells = Array.from({ length: view.n }, (_, person) => {
    const winner = view.answer[person];
    const classes = [];
    if (doneSet.has(person)) classes.push("done");
    if (person === view.currentNode) classes.push("current");
    if (person === view.changedPerson) classes.push("changed");
    return `<span class="${classes.join(" ")}"><small>P${person} · quiet ${view.quiet[person]}</small><b>${winner === -1 ? "answer —" : `answer P${winner}`}</b><em>${winner === -1 ? "" : `quiet ${view.quiet[winner]}`}</em></span>`;
  }).join("");

  const finalHtml = view.event === "done"
    ? `<div class="loud-rich-final"><strong>${vi ? "KẾT QUẢ" : "RESULT"}</strong><div>${view.answer.map((winner, person) => `<span>P${person} → <b>P${winner}</b><small>quiet ${view.quiet[winner]}</small></span>`).join("")}</div></div>`
    : "";

  el.innerHTML = `<div class="loud-rich-viz">
    <div class="loud-rich-phases">${phases}</div>
    <div class="loud-rich-relations"><div><strong>RICHER INPUT</strong><small>${vi ? "Pa > Pb · lưu DFS b→a" : "Pa > Pb · store DFS b→a"}</small></div><div>${relationChips || "∅"}</div></div>
    <div class="loud-rich-main">
      <div class="loud-rich-graph">${graphSvg}<div class="loud-rich-legend"><span><i class="current"></i>${vi ? "đang chạy" : "current"}</span><span><i class="neighbor"></i>richer neighbor</span><span><i class="done"></i>memo done</span></div></div>
      <div class="loud-rich-debug"><div class="loud-rich-stack"><strong>CALL STACK</strong><div>${stackHtml}</div></div>${detailHtml}</div>
    </div>
    <div class="loud-rich-memo-table"><strong>MEMO · answer[i]</strong><div>${memoCells}</div></div>
    ${finalHtml}
  </div>`;
}

function renderLruCacheView(step) {
  const view = step.lruCacheView || {};
  const treeView = $("treeView");
  const vi = lang === "vi";
  const operations = Array.isArray(view.operations) ? view.operations : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const order = Array.isArray(view.order) ? view.order : [];
  const entries = Array.isArray(view.entries) ? view.entries : [];
  const pointerProgress = new Set(Array.isArray(view.pointerProgress) ? view.pointerProgress : []);
  const initialized = view.initialized || {};
  const phase = String(view.phase || "idle");
  const phaseIndex = phase.startsWith("init") || phase === "ready"
    ? 0
    : phase.includes("lookup") || phase === "miss" || phase === "hit"
      ? 1
      : phase.includes("remove") || phase.includes("insert") || phase === "new-node" || phase === "update"
        ? 2
        : 3;
  const phaseLabels = vi
    ? ["1. Khởi tạo", "2. Tra hash map", "3. Đổi pointer", "4. Loại LRU"]
    : ["1. Initialize", "2. Hash lookup", "3. Rewire pointers", "4. Evict LRU"];
  const phasesHtml = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : ""}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`).join("");

  const formatResult = (operation, value) => operation.type === "put" ? "null" : String(value);
  const operationsHtml = operations.map((operation, index) => {
    const done = index < Number(view.completedOps || 0);
    const active = index === view.activeOpIndex;
    const classes = ["lru-operation"];
    if (done) classes.push("is-done");
    if (active) classes.push("is-active");
    if (!done && !active) classes.push("is-pending");
    const result = done ? formatResult(operation, results[index]) : "·";
    return `<span class="${classes.join(" ")}"><small>${index + 1}</small><code>${escapeHtml(operation.label)}</code><strong>→ ${escapeHtml(result)}</strong></span>`;
  }).join("");

  const orderKeys = new Set(order.map((node) => node.key));
  const transientKey = view.transient ? view.transient.key : null;
  const mapHtml = entries.length
    ? entries.map((entry) => {
        const classes = ["lru-map-entry"];
        if (entry.key === view.activeKey) classes.push("is-active");
        if (!orderKeys.has(entry.key)) classes.push("is-unlinked");
        if (entry.key === transientKey) classes.push("is-transient");
        const state = orderKeys.has(entry.key)
          ? (vi ? "trong list" : "in list")
          : (vi ? "chưa nối / đã tháo" : "unlinked / detached");
        return `<span class="${classes.join(" ")}"><code>${escapeHtml(entry.key)}</code><i>→</i><strong>Node(${escapeHtml(entry.key)}, ${escapeHtml(entry.value)})</strong><small>${state}</small></span>`;
      }).join("")
    : `<em>{ }</em>`;

  function sentinel(side) {
    const ready = side === "left" ? initialized.left : initialized.right;
    const pointerReady = side === "left" ? initialized.forward : initialized.backward;
    const label = side === "left" ? "LEFT" : "RIGHT";
    const role = side === "left" ? "LRU sentinel" : "MRU sentinel";
    const pointer = side === "left" ? "left.next" : "right.prev";
    return `<div class="lru-sentinel${ready ? " is-ready" : " is-pending"}"><small>${role}</small><strong>${label}</strong><span>${pointerReady ? pointer : "not linked"}</span></div>`;
  }

  const listParts = [sentinel("left")];
  order.forEach((node, index) => {
    listParts.push(`<span class="lru-double-arrow" aria-hidden="true"><i>next →</i><i>← prev</i></span>`);
    const classes = ["lru-list-node"];
    if (node.key === view.activeKey) classes.push("is-active");
    if (node.key === transientKey && phase.includes("remove")) classes.push("is-removing");
    listParts.push(`<div class="${classes.join(" ")}"><small>${index === 0 ? "LRU" : index === order.length - 1 ? "MRU" : `#${index + 1}`}</small><strong>${escapeHtml(node.key)} : ${escapeHtml(node.value)}</strong><span>Node(${escapeHtml(node.key)})</span></div>`);
  });
  if (initialized.left && initialized.right) listParts.push(`<span class="lru-double-arrow" aria-hidden="true"><i>next →</i><i>← prev</i></span>`);
  listParts.push(sentinel("right"));
  const transientHtml = view.transient
    ? `<div class="lru-transient"><small>${escapeHtml(view.transient.status || "detached")}</small><strong>${escapeHtml(view.transient.key)} : ${escapeHtml(view.transient.value)}</strong><span>Node(${escapeHtml(view.transient.key)})</span></div>`
    : `<div class="lru-transient is-empty"><strong>∅</strong><span>${vi ? "không có node rời list" : "no detached node"}</span></div>`;

  const pointerItems = [
    ["prev.next = next", "remove 1/2"],
    ["next.prev = prev", "remove 2/2"],
    ["prev.next = node", "insert 1/4"],
    ["node.prev = prev", "insert 2/4"],
    ["node.next = right", "insert 3/4"],
    ["right.prev = node", "insert 4/4"],
  ].map(([key, label]) => `<span class="${pointerProgress.has(key) ? "is-done" : ""}">${pointerProgress.has(key) ? "✓" : "○"}<b>${label}</b></span>`).join("");
  const pointerContext = view.pointerAction
    ? `<div class="lru-pointer-action"><div><small>prev</small><strong>${escapeHtml(view.prevLabel || "—")}</strong></div><i>↔</i><div class="is-node"><small>node</small><strong>${escapeHtml(view.nodeLabel || "—")}</strong></div><i>↔</i><div><small>next</small><strong>${escapeHtml(view.nextLabel || "—")}</strong></div><code>${escapeHtml(view.pointerAction)}</code></div>`
    : `<div class="lru-pointer-action is-idle"><code>${vi ? "Chọn Next để theo dõi từng phép gán pointer" : "Use Next to follow each pointer assignment"}</code></div>`;

  const lru = order.length ? `${order[0].key}:${order[0].value}` : "—";
  const mru = order.length ? `${order[order.length - 1].key}:${order[order.length - 1].value}` : "—";
  const currentOperation = view.activeOpIndex === null || view.activeOpIndex === undefined ? null : operations[view.activeOpIndex];
  const currentResult = currentOperation && view.activeOpIndex < view.completedOps
    ? formatResult(currentOperation, results[view.activeOpIndex])
    : view.result === null || view.result === undefined ? "—" : view.result;
  const summary = vi
    ? `LRU Cache có ${entries.length} trên ${view.capacity} key; LRU ${lru}; MRU ${mru}.`
    : `LRU Cache has ${entries.length} of ${view.capacity} keys; LRU ${lru}; MRU ${mru}.`;

  treeView.innerHTML = `<section class="lru-cache-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="lru-phases">${phasesHtml}</div>
    <div class="lru-operations" aria-label="${vi ? "Danh sách thao tác" : "Operation list"}">${operationsHtml}</div>
    <div class="lru-status">
      <span><small>SIZE / CAPACITY</small><strong>${entries.length} / ${escapeHtml(view.capacity)}</strong></span>
      <span class="is-lru"><small>LEFT.next · LRU</small><strong>${escapeHtml(lru)}</strong></span>
      <span class="is-mru"><small>RIGHT.prev · MRU</small><strong>${escapeHtml(mru)}</strong></span>
      <span><small>RESULT</small><strong>${escapeHtml(currentResult)}</strong></span>
    </div>
    <section class="lru-map"><header><strong>HASH MAP</strong><small>key → exact Node reference · O(1) lookup</small></header><div>${mapHtml}</div></section>
    <section class="lru-list"><header><strong>DOUBLY LINKED LIST</strong><small>LEFT · least recent → most recent · RIGHT</small></header><div class="lru-list-scroll"><div class="lru-list-track">${listParts.join("")}</div></div></section>
    <div class="lru-pointer-board">${pointerContext}<div class="lru-pointer-progress">${pointerItems}</div></div>
    <div class="lru-detached-row"><header><strong>${vi ? "NODE ĐANG THÁO / CHÈN" : "DETACHED / INSERTING NODE"}</strong><small>${vi ? "map và list có thể tạm khác nhau giữa hai dòng code" : "map and list can temporarily differ between code lines"}</small></header>${transientHtml}</div>
    <div class="lru-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <div class="lru-legend" aria-hidden="true"><span><i class="active"></i>${vi ? "node đang xử lý" : "active node"}</span><span><i class="detached"></i>${vi ? "node chưa nằm trong list" : "node outside list"}</span><span><b>LEFT.next</b> = LRU</span><span><b>RIGHT.prev</b> = MRU</span></div>
  </section>`;
}

function renderLfuCacheView(step) {
  const view = step.lfuCacheView;
  const treeView = $("treeView");
  const vi = lang === "vi";
  const operations = Array.isArray(view.operations) ? view.operations : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const groups = Array.isArray(view.groups) ? view.groups : [];
  const entries = Array.isArray(view.entries) ? view.entries : [];

  const operationHtml = operations.map((operation, index) => {
    const done = index < view.completedOps;
    const active = index === view.activeOpIndex;
    const classes = ["lfu-operation"];
    if (done) classes.push("done");
    if (active) classes.push("active");
    else if (!done) classes.push("pending");
    const result = done
      ? operation.type === "put"
        ? "null"
        : String(results[index])
      : "·";
    return `<span class="${classes.join(" ")}">
      <small>${index + 1}</small>
      <code>${escapeHtml(operation.label)}</code>
      <strong>→ ${escapeHtml(result)}</strong>
    </span>`;
  }).join("");

  const bucketHtml = groups.length
    ? groups.map((group) => {
        const isMin = view.size > 0 && group.frequency === view.minFreq;
        const nodes = Array.isArray(group.keys) ? group.keys : [];
        const nodeHtml = nodes.length
          ? nodes.map((entry, index) => {
              const classes = ["lfu-node"];
              if (entry.key === view.activeKey) classes.push("active");
              if (entry.key === view.movingKey) classes.push("moving");
              if (entry.key === view.evictedKey) classes.push("evicting");
              const position = nodes.length === 1
                ? "LRU = MRU"
                : index === 0
                  ? "LRU"
                  : index === nodes.length - 1
                    ? "MRU"
                    : "";
              const value = entry.value === undefined ? "—" : entry.value;
              return `<div class="${classes.join(" ")}">
                ${position ? `<span class="lfu-recency">${position}</span>` : ""}
                <strong>key ${escapeHtml(entry.key)}</strong>
                <span>value ${escapeHtml(value)}</span>
                <small>freq ${escapeHtml(entry.freq)}</small>
              </div>`;
            }).join('<span class="lfu-order-arrow" aria-hidden="true">→</span>')
          : `<span class="lfu-empty-bucket">${vi ? "bucket tạm rỗng" : "temporarily empty"}</span>`;
        return `<section class="lfu-bucket${isMin ? " minimum" : ""}">
          <header>
            <span><small>FREQUENCY</small><strong>f${escapeHtml(group.frequency)}</strong></span>
            ${isMin ? `<b>min_freq</b>` : ""}
          </header>
          <div class="lfu-bucket-order">
            <span class="lfu-order-label">LRU</span>
            <div class="lfu-node-row">${nodeHtml}</div>
            <span class="lfu-order-label">MRU</span>
          </div>
        </section>`;
      }).join("")
    : `<div class="lfu-empty-cache"><strong>∅</strong><span>${vi ? "cache chưa có key" : "cache has no keys"}</span></div>`;

  const indexHtml = entries.length
    ? entries.map((entry) => {
        const classes = ["lfu-index-entry"];
        if (entry.key === view.activeKey) classes.push("active");
        if (entry.key === view.movingKey) classes.push("moving");
        if (entry.key === view.evictedKey) classes.push("evicting");
        const frequency = entry.freq === null || entry.freq === undefined ? "?" : entry.freq;
        return `<span class="${classes.join(" ")}"><code>${escapeHtml(entry.key)}</code><strong>${escapeHtml(entry.value)}</strong><small>f${escapeHtml(frequency)}</small></span>`;
      }).join("")
    : `<span class="lfu-index-empty">{ }</span>`;

  const activeOperation = view.activeOpIndex === null ? null : operations[view.activeOpIndex];
  const operationDone = view.activeOpIndex !== null && view.activeOpIndex < view.completedOps;
  const currentResult = activeOperation && operationDone
    ? activeOperation.type === "put" ? "null" : results[view.activeOpIndex]
    : view.phase === "done" && operations.length
      ? operations[operations.length - 1].type === "put" ? "null" : results[results.length - 1]
      : "—";
  const minFrequency = view.size > 0 ? view.minFreq : "—";
  const moveHtml = view.movingKey !== null && view.fromFreq !== null && view.toFreq !== null
    ? `<span class="lfu-movement"><strong>key ${escapeHtml(view.movingKey)}</strong><code>f${escapeHtml(view.fromFreq)} → f${escapeHtml(view.toFreq)}</code></span>`
    : view.fromFreq !== null && view.toFreq !== null && view.activeKey !== null
      ? `<span class="lfu-movement"><strong>key ${escapeHtml(view.activeKey)}</strong><code>f${escapeHtml(view.fromFreq)} → f${escapeHtml(view.toFreq)}</code></span>`
      : "";
  const evictionHtml = view.evictedKey !== null
    ? `<span class="lfu-eviction"><strong>${vi ? "EVICT" : "EVICT"} key ${escapeHtml(view.evictedKey)}</strong><small>${vi ? `đầu bucket f${escapeHtml(view.fromFreq)} = LRU` : `front of bucket f${escapeHtml(view.fromFreq)} = LRU`}</small></span>`
    : "";
  const summary = vi
    ? `LFU Cache có ${view.size} trên ${view.capacity} key, min_freq ${minFrequency}. ${pick(step.title)}`
    : `LFU Cache contains ${view.size} of ${view.capacity} keys, min_freq ${minFrequency}. ${pick(step.title)}`;

  treeView.innerHTML = `<div class="lfu-cache-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="lfu-operations" aria-label="${vi ? "Danh sách operations" : "Operation list"}">${operationHtml}</div>
    <div class="lfu-status-row">
      <span><small>CAPACITY</small><strong>${escapeHtml(view.capacity)}</strong></span>
      <span><small>SIZE</small><strong>${escapeHtml(view.size)} / ${escapeHtml(view.capacity)}</strong></span>
      <span class="minimum"><small>MIN_FREQ</small><strong>${escapeHtml(minFrequency)}</strong></span>
      <span><small>RESULT</small><strong>${escapeHtml(currentResult)}</strong></span>
    </div>
    <div class="lfu-action-row">
      <span class="lfu-action"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(pick(step.title))}</strong></span>
      ${moveHtml}${evictionHtml}
    </div>
    <div class="lfu-buckets">${bucketHtml}</div>
    <section class="lfu-key-index">
      <header><strong>KEY INDEX</strong><small>key → value · frequency</small></header>
      <div>${indexHtml}</div>
    </section>
    <div class="lfu-legend" aria-hidden="true">
      <span><i class="minimum"></i>min_freq bucket</span>
      <span><i class="active"></i>${vi ? "key đang xử lý" : "active key"}</span>
      <span><i class="evicting"></i>${vi ? "key bị loại" : "evicted key"}</span>
      <span><b>LRU → MRU</b>${vi ? "cũ nhất → mới nhất" : "oldest → newest"}</span>
    </div>
  </div>`;
}

function renderMusicPlayerView(step) {
  const view = step.musicPlayerView || {};
  const treeView = $("treeView");
  const vi = lang === "vi";
  const songs = Array.isArray(view.songs) ? view.songs : [];
  const history = Array.isArray(view.history) ? view.history : [];
  const candidates = new Set(Array.isArray(view.candidates) ? view.candidates : []);
  const selected = view.selectedSong;
  const total = Number(view.requestedPlays || 0);
  const completed = Number(view.completedPlays || 0);
  const roundPlayed = songs.filter((song) => song.playedThisRound).length;
  const historyHtml = history.length
    ? history.map((song, index) => `<span class="mp9002-history-item${index === history.length - 1 ? " latest" : ""}"><small>${index + 1}</small>${escapeHtml(song)}</span>`).join("")
    : `<em>${vi ? "Chưa có bài nào được phát" : "No song has played yet"}</em>`;
  const songsHtml = songs.map((item) => {
    const classes = ["mp9002-song"];
    if (item.playedThisRound) classes.push("played");
    if (candidates.has(item.song)) classes.push("candidate");
    if (item.song === selected) classes.push("selected");
    const cycleLabel = item.playedThisRound ? (vi ? "đã phát vòng này" : "played this round") : (vi ? "đủ điều kiện" : "eligible");
    return `<article class="${classes.join(" ")}"><strong>${escapeHtml(item.song)}</strong><span><small>FREQ</small><b>${escapeHtml(item.frequency)}</b></span><em>${escapeHtml(cycleLabel)}</em></article>`;
  }).join("");
  const resetHtml = view.didReset
    ? `<div class="mp9002-reset"><b>↻ ${vi ? "RESET VÒNG" : "ROUND RESET"}</b><span>${vi ? "Tập chặn đã được xóa; freq vẫn giữ nguyên." : "The blocking set was cleared; freq is preserved."}</span></div>`
    : "";
  const chosenHtml = selected
    ? `<div class="mp9002-choice"><small>${vi ? "BÀI ĐƯỢC CHỌN" : "SELECTED SONG"}</small><strong>${escapeHtml(selected)}</strong><span>LFU = ${view.minFrequency ?? "—"}</span></div>`
    : `<div class="mp9002-choice idle"><small>${vi ? "BÀI ĐƯỢC CHỌN" : "SELECTED SONG"}</small><strong>—</strong><span>${vi ? "đang chuẩn bị" : "preparing"}</span></div>`;
  const summary = vi ? `Music Player vòng ${view.round || 1}: ${roundPlayed}/${songs.length} bài đã phát trong vòng.` : `Music Player round ${view.round || 1}: ${roundPlayed}/${songs.length} songs played this round.`;

  treeView.innerHTML = `<section class="mp9002-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>MUSIC PLAYER · LFU + RESET</small><strong>${escapeHtml(pick(step.title))}</strong></div><span>${vi ? `vòng ${view.round || 1}` : `round ${view.round || 1}`}</span></header>
    <div class="mp9002-status"><span><small>PLAY()</small><b>${completed} / ${total}</b></span><span><small>${vi ? "ĐÃ PHÁT VÒNG NÀY" : "PLAYED THIS ROUND"}</small><b>${roundPlayed} / ${songs.length}</b></span><span><small>${vi ? "ỨNG VIÊN LFU" : "LFU CANDIDATES"}</small><b>${candidates.size}</b></span></div>
    ${resetHtml}
    <div class="mp9002-body"><section><header><strong>${vi ? "THƯ VIỆN BÀI HÁT" : "SONG LIBRARY"}</strong><span>${vi ? "xanh = còn được chọn" : "teal = still eligible"}</span></header><div class="mp9002-songs">${songsHtml}</div></section>${chosenHtml}</div>
    <section class="mp9002-history"><header><strong>${vi ? "LỊCH SỬ PLAY()" : "PLAY() HISTORY"}</strong><span>${vi ? "mỗi vòng không lặp" : "no repeats per round"}</span></header><div>${historyHtml}</div></section>
    <footer>${escapeHtml(pick(step.note))}</footer>
  </section>`;
}

function renderRideSharingView(step) {
  const view = step.rideSharingView;
  const treeView = $("treeView");
  const vi = lang === "vi";
  const activeSet = new Set(view.activeRiders || []);
  const phaseIndex = {
    initialize: 0,
    "initialize-done": 0,
    "rider-call": 1,
    "rider-queued": 1,
    "rider-active": 1,
    "driver-call": 1,
    "driver-queued": 1,
    "cancel-call": 2,
    "cancel-done": 2,
    "cancel-noop": 2,
    "cleanup-check": 2,
    "cleanup-pop": 2,
    "cleanup-done": 2,
    "match-call": 3,
    "availability-check": 3,
    "take-driver": 3,
    "take-rider": 3,
    "deactivate-match": 3,
    matched: 3,
    "no-match": 3,
    done: 3,
  }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1. Khởi tạo", "2. Vào queue", "3. Hủy & dọn", "4. Ghép FRONT"]
    : ["1. Initialize", "2. Join queues", "3. Cancel & clean", "4. Match FRONT"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${state}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const formatResult = (result) => Array.isArray(result) ? `[${result.join(", ")}]` : "null";
  const operationsHtml = view.operations.map((operation, index) => {
    const done = index < view.completedOps;
    const active = index === view.activeOpIndex;
    const classes = ["ride-sharing-operation"];
    if (done) classes.push("is-done");
    if (active) classes.push("is-active");
    if (!done && !active) classes.push("is-pending");
    const result = done ? formatResult(view.results[index]) : "·";
    return `<div class="${classes.join(" ")}">
      <small>${index}</small>
      <code>${escapeHtml(operation.label)}</code>
      <strong>→ ${escapeHtml(result)}</strong>
    </div>`;
  }).join("");

  function queueLane(kind, items, initialized, activeId) {
    const isRider = kind === "rider";
    const label = isRider ? (vi ? "RIDER ĐANG CHỜ" : "WAITING RIDERS") : (vi ? "DRIVER SẴN SÀNG" : "AVAILABLE DRIVERS");
    let cellsHtml;
    if (!initialized) {
      cellsHtml = `<span class="ride-sharing-empty">${vi ? "chưa khởi tạo" : "not initialized"}</span>`;
    } else if (!items.length) {
      cellsHtml = `<span class="ride-sharing-empty"><b>∅</b>${vi ? "queue rỗng" : "empty queue"}</span>`;
    } else {
      cellsHtml = items.map((id, index) => {
        const cancelled = isRider && !activeSet.has(id);
        const pending = isRider && view.phase === "rider-queued" && id === activeId;
        const classes = ["ride-sharing-node", isRider ? "is-rider" : "is-driver"];
        if (cancelled && !pending) classes.push("is-cancelled");
        if (pending) classes.push("is-pending-active");
        if (id === activeId) classes.push("is-current");
        const status = cancelled && !pending
          ? (vi ? "ĐÃ HỦY" : "CANCELLED")
          : pending
            ? (vi ? "CHƯA ACTIVE" : "NOT ACTIVE")
            : isRider ? "ACTIVE" : "READY";
        return `<div class="${classes.join(" ")}">
          <span>${index === 0 ? "FRONT" : index === items.length - 1 ? "REAR" : `#${index}`}</span>
          <strong>${isRider ? "R" : "D"}${escapeHtml(id)}</strong>
          <small>${status}</small>
        </div>${index < items.length - 1 ? '<i class="ride-sharing-queue-arrow" aria-hidden="true">→</i>' : ""}`;
      }).join("");
    }
    return `<section class="ride-sharing-lane is-${kind}">
      <header><span class="ride-sharing-kind">${isRider ? "R" : "D"}</span><strong>${label}</strong><small>${items.length} ${vi ? "trong deque" : "in deque"}</small></header>
      <div class="ride-sharing-lane-track"><span class="ride-sharing-front-label">FRONT</span><div class="ride-sharing-cells">${cellsHtml}</div><span class="ride-sharing-rear-label">REAR</span></div>
    </section>`;
  }

  const currentOperation = view.activeOpIndex === null ? null : view.operations[view.activeOpIndex];
  const matchContext = new Set([
    "match-call", "cleanup-check", "cleanup-pop", "cleanup-done", "availability-check",
    "take-driver", "take-rider", "deactivate-match", "matched", "no-match",
  ]).has(view.phase);
  const selectedDriver = view.activeDriver ?? (matchContext ? (view.drivers[0] ?? null) : null);
  const selectedRider = view.activeRider ?? view.removedRider ?? (matchContext ? (view.riders[0] ?? null) : null);
  const hasPair = Array.isArray(view.pair);
  const noPair = hasPair && view.pair[0] === -1;
  const isCleaning = ["cleanup-check", "cleanup-pop"].includes(view.phase);
  const gateClasses = ["ride-sharing-gate"];
  if (hasPair) gateClasses.push(noPair ? "is-no-match" : "is-matched");
  if (isCleaning) gateClasses.push("is-cleaning");
  const gateResult = isCleaning
    ? "BLOCKED"
    : hasPair
    ? `[${view.pair.join(", ")}]`
    : selectedDriver !== null && selectedRider !== null
      ? `[${selectedDriver}, ${selectedRider}]`
      : "[driver, rider]";
  const gateShapeLabel = isCleaning ? "cancelled FRONT" : "[driverId, riderId]";
  let gateStatus;
  if (view.phase === "cleanup-check") gateStatus = vi ? `R${view.cancelledRider} không còn active` : `R${view.cancelledRider} is inactive`;
  else if (view.phase === "cleanup-pop") gateStatus = vi ? `lazy-remove R${view.removedRider}` : `lazy-remove R${view.removedRider}`;
  else if (noPair) gateStatus = vi ? "CHƯA ĐỦ HAI PHÍA" : "ONE SIDE MISSING";
  else if (hasPair) gateStatus = vi ? "ĐÃ GHÉP" : "MATCHED";
  else gateStatus = vi ? "CHỜ CẶP FRONT" : "WAITING FOR BOTH FRONTS";
  const gateHtml = `<div class="${gateClasses.join(" ")}">
    <span class="ride-sharing-gate-source is-driver">${selectedDriver === null ? "D—" : `D${escapeHtml(selectedDriver)}`}</span>
    <i aria-hidden="true">→</i>
    <div><small>${escapeHtml(gateStatus)}</small><strong>${escapeHtml(gateResult)}</strong><span>${escapeHtml(gateShapeLabel)}</span></div>
    <i aria-hidden="true">←</i>
    <span class="ride-sharing-gate-source is-rider">${selectedRider === null ? "R—" : `R${escapeHtml(selectedRider)}`}</span>
  </div>`;

  const activeRidersHtml = view.initialized.activeRiders
    ? view.activeRiders.length
      ? view.activeRiders.map((rider) => `<span${rider === view.activeRider ? ' class="is-current"' : ""}>R${escapeHtml(rider)}</span>`).join("")
      : `<em>∅</em>`
    : `<em>${vi ? "chưa khởi tạo" : "not initialized"}</em>`;
  const matchesHtml = view.matches.length
    ? view.matches.map((pair, index) => `<span><small>#${index + 1}</small><b>D${escapeHtml(pair[0])}</b><i>+</i><b>R${escapeHtml(pair[1])}</b></span>`).join("")
    : `<em>${vi ? "chưa có chuyến" : "no rides yet"}</em>`;

  let actionDetail;
  if (view.phase === "rider-queued") {
    actionDetail = vi ? "Đã append vào deque; dòng 11 mới thêm rider vào active_riders." : "Appended to the deque; line 11 adds this rider to active_riders.";
  } else if (view.phase === "cancel-done") {
    actionDetail = vi ? "Node vẫn ở deque nhưng bị gạch mờ; không còn đủ điều kiện ghép." : "The node remains in the deque but is dimmed and no longer matchable.";
  } else if (view.phase === "cancel-noop") {
    actionDetail = vi ? "Rider không active nên discard không thay đổi hệ thống." : "The rider is not active, so discard changes nothing.";
  } else if (view.phase === "cleanup-check") {
    actionDetail = vi ? "FRONT đã hủy làm điều kiện while đúng; bước kế tiếp sẽ popleft." : "The cancelled FRONT makes the while condition true; the next step removes it with popleft.";
  } else if (view.phase === "cleanup-pop") {
    actionDetail = vi ? "Chỉ rider đã hủy rời queue; driver vẫn đứng yên." : "Only the cancelled rider leaves; the driver queue stays unchanged.";
  } else if (view.phase === "availability-check") {
    actionDetail = view.condition
      ? (vi ? "Thiếu một phía nên không pop phía còn lại." : "One side is missing, so the remaining side is not popped.")
      : (vi ? "Hai FRONT là cặp đến sớm nhất hợp lệ." : "The two FRONT entries are the earliest valid pair.");
  } else if (view.phase === "take-driver") {
    actionDetail = vi ? "Dòng 21 chỉ popleft driver; rider sẽ rời ở dòng 22." : "Line 21 poplefts only the driver; the rider leaves on line 22.";
  } else if (view.phase === "take-rider") {
    actionDetail = vi ? "Hai phần tử đã rời deque nhưng rider còn được xóa khỏi active_riders ở dòng 23." : "Both entries left their deques; line 23 still removes the rider from active_riders.";
  } else if (view.phase === "matched") {
    actionDetail = vi ? `Trả đúng thứ tự ${gateResult}: driver trước, rider sau.` : `Return ${gateResult} in driver-first, rider-second order.`;
  } else if (view.phase === "no-match") {
    actionDetail = vi ? "Trả [-1, -1] và giữ nguyên phần tử đang chờ ở queue còn lại." : "Return [-1, -1] and preserve the waiting entry on the other side.";
  } else if (view.phase === "done") {
    actionDetail = vi ? "Mọi operation đã hoàn tất; các queue hiển thị đúng trạng thái còn chờ." : "All operations are complete; the queues show the remaining waiting state.";
  } else {
    actionDetail = currentOperation
      ? `${currentOperation.label}`
      : (vi ? "Theo dõi hai queue FIFO và active_riders." : "Track both FIFO queues and active_riders.");
  }
  const summary = vi
    ? `${view.riders.length} rider trong deque, ${view.activeRiders.length} rider active, ${view.drivers.length} driver sẵn sàng, ${view.matches.length} cặp đã ghép.`
    : `${view.riders.length} riders in deque, ${view.activeRiders.length} active riders, ${view.drivers.length} available drivers, ${view.matches.length} completed matches.`;

  treeView.innerHTML = `<section class="ride-sharing-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="ride-sharing-phases">${phasesHtml}</div>
    <div class="ride-sharing-operations" aria-label="${vi ? "Danh sách operation" : "Operation list"}">${operationsHtml}</div>
    <div class="ride-sharing-status">
      <span><small>${vi ? "RIDER ACTIVE" : "ACTIVE RIDERS"}</small><strong>${view.activeRiders.length}</strong></span>
      <span><small>${vi ? "DRIVER SẴN SÀNG" : "READY DRIVERS"}</small><strong>${view.drivers.length}</strong></span>
      <span class="is-total"><small>${vi ? "CHUYẾN ĐÃ GHÉP" : "MATCHED RIDES"}</small><strong>${view.matches.length}</strong></span>
    </div>
    <div class="ride-sharing-board">
      ${queueLane("driver", view.drivers, view.initialized.drivers, view.activeDriver)}
      ${gateHtml}
      ${queueLane("rider", view.riders, view.initialized.riders, view.activeRider)}
    </div>
    <div class="ride-sharing-index-row">
      <section><header><strong>active_riders</strong><small>set · O(1) discard</small></header><div class="ride-sharing-active-set">${activeRidersHtml}</div></section>
      <section><header><strong>${vi ? "Lịch sử ghép" : "Match history"}</strong><small>[driver, rider]</small></header><div class="ride-sharing-match-history">${matchesHtml}</div></section>
    </div>
    <div class="ride-sharing-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="ride-sharing-legend">
      <span><i class="driver"></i>driver ready</span>
      <span><i class="rider"></i>rider active</span>
      <span><i class="cancelled"></i>${vi ? "rider đã hủy" : "cancelled rider"}</span>
      <span><b>FRONT → REAR</b>${vi ? "cũ nhất → mới nhất" : "oldest → newest"}</span>
    </div>
  </section>`;
}

// ---- Rectangle Area II: Sweep Line + Segment Tree ----
function renderRectangleSweepView(step) {
  const view = step.rectangleSweepView;
  const el = $("treeView");
  const rectangles = view.rectangles || [];
  const xs = view.xs || [];

  if (!rectangles.length || xs.length < 2) {
    el.innerHTML = `<div class="rect850-empty">${lang === "vi" ? "Không có hình chữ nhật hợp lệ." : "No valid rectangles."}</div>`;
    return;
  }

  const light = document.documentElement.getAttribute("data-theme") === "light";
  const colors = {
    text: light ? "#0f172a" : "#e2e8f0",
    muted: light ? "#64748b" : "#94a3b8",
    grid: light ? "#cbd5e1" : "#334155",
    base: light ? "#818cf8" : "#a5b4fc",
    covered: light ? "#4f46e5" : "#818cf8",
    next: light ? "#d97706" : "#fbbf24",
    treeFill: light ? "#eef2ff" : "#1e1b4b",
    treeActive: light ? "#dbeafe" : "#172554",
    treeStroke: light ? "#6366f1" : "#818cf8",
  };

  const allY = rectangles.flatMap((rectangle) => [rectangle[1], rectangle[3]]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const planeWidth = 600;
  const planeHeight = 330;
  const pad = { left: 52, right: 24, top: 24, bottom: 44 };
  const plotWidth = planeWidth - pad.left - pad.right;
  const plotHeight = planeHeight - pad.top - pad.bottom;
  const scaleX = (x) => pad.left + ((x - minX) / Math.max(1, maxX - minX)) * plotWidth;
  const scaleY = (y) => pad.top + ((maxY - y) / Math.max(1, maxY - minY)) * plotHeight;
  const fmt = (number) => typeof number === "string"
    ? number
    : (Number.isInteger(number) ? String(number) : Number(number).toFixed(2));

  const gridLinesX = xs.map((x) => `
    <line x1="${scaleX(x)}" y1="${pad.top}" x2="${scaleX(x)}" y2="${planeHeight - pad.bottom}" stroke="${colors.grid}" stroke-width="1" />
    <text x="${scaleX(x)}" y="${planeHeight - 18}" fill="${colors.muted}" text-anchor="middle">${fmt(x)}</text>`).join("");
  const uniqueY = [...new Set(allY)].sort((a, b) => a - b);
  const gridLinesY = uniqueY.map((y) => `
    <line x1="${pad.left}" y1="${scaleY(y)}" x2="${planeWidth - pad.right}" y2="${scaleY(y)}" stroke="${colors.grid}" stroke-width="1" />
    <text x="${pad.left - 10}" y="${scaleY(y) + 4}" fill="${colors.muted}" text-anchor="end">${fmt(y)}</text>`).join("");

  const baseRectangles = rectangles.map(([x1, y1, x2, y2], index) => `
    <rect x="${scaleX(x1)}" y="${scaleY(y2)}" width="${Math.max(1, scaleX(x2) - scaleX(x1))}" height="${Math.max(1, scaleY(y1) - scaleY(y2))}" fill="${colors.base}" fill-opacity="0.10" stroke="${colors.base}" stroke-width="1.5" />
    <text x="${scaleX(x1) + 7}" y="${scaleY(y2) + 16}" fill="${colors.text}">R${index + 1}</text>`).join("");

  const completedArea = rectangles.map(([x1, y1, x2, y2]) => {
    const completedY = Math.min(Math.max(view.y, y1), y2);
    if (completedY <= y1) return "";
    return `<rect x="${scaleX(x1)}" y="${scaleY(completedY)}" width="${Math.max(1, scaleX(x2) - scaleX(x1))}" height="${Math.max(1, scaleY(y1) - scaleY(completedY))}" fill="${colors.covered}" fill-opacity="0.28" />`;
  }).join("");

  const nextStrip = (view.leafCounts || []).map((count, index) => {
    if (count <= 0 || view.nextY <= view.y) return "";
    return `<rect x="${scaleX(xs[index])}" y="${scaleY(view.nextY)}" width="${Math.max(1, scaleX(xs[index + 1]) - scaleX(xs[index]))}" height="${Math.max(1, scaleY(view.y) - scaleY(view.nextY))}" fill="${colors.next}" fill-opacity="0.28" />`;
  }).join("");

  const planeSvg = `<svg class="rect850-plane" viewBox="0 0 ${planeWidth} ${planeHeight}" role="img" aria-label="${lang === "vi" ? "Mặt phẳng với đường quét ngang" : "Plane with a horizontal sweep line"}">
    ${gridLinesX}${gridLinesY}${completedArea}${nextStrip}${baseRectangles}
    <line x1="${pad.left}" y1="${scaleY(view.y)}" x2="${planeWidth - pad.right}" y2="${scaleY(view.y)}" stroke="${colors.next}" stroke-width="3" />
    <text x="${planeWidth - pad.right}" y="${Math.max(14, scaleY(view.y) - 7)}" fill="${colors.next}" text-anchor="end">sweep y=${fmt(view.y)}</text>
  </svg>`;

  const segmentCount = xs.length - 1;
  const treeNodes = view.treeNodes || [];
  const maxDepth = Math.max(0, ...treeNodes.map((node) => node.depth));
  const treeWidth = Math.max(600, segmentCount * 105);
  const treeHeight = 100 + maxDepth * 86;
  const treePosition = new Map();
  treeNodes.forEach((node) => {
    treePosition.set(node.id, {
      x: 50 + ((node.left + node.right + 1) / (2 * segmentCount)) * (treeWidth - 100),
      y: 38 + node.depth * 86,
    });
  });
  const treeEdges = treeNodes.filter((node) => node.parent !== null).map((node) => {
    const from = treePosition.get(node.parent);
    const to = treePosition.get(node.id);
    return `<line x1="${from.x}" y1="${from.y + 25}" x2="${to.x}" y2="${to.y - 25}" stroke="${colors.grid}" stroke-width="1.5" />`;
  }).join("");
  const treeNodeHtml = treeNodes.map((node) => {
    const position = treePosition.get(node.id);
    const active = node.length > 0;
    const current = node.id === view.activeNode;
    const range = `[${fmt(xs[node.left])}, ${fmt(xs[node.right + 1])})`;
    return `<g>
      <rect x="${position.x - 45}" y="${position.y - 25}" width="90" height="50" rx="9" fill="${active ? colors.treeActive : colors.treeFill}" stroke="${current ? colors.next : active ? colors.treeStroke : colors.grid}" stroke-width="${current ? 4 : node.id === 1 ? 2 : 1}" />
      <text x="${position.x}" y="${position.y - 4}" fill="${colors.text}" text-anchor="middle">${range}</text>
      <text x="${position.x}" y="${position.y + 14}" fill="${active ? colors.treeStroke : colors.muted}" text-anchor="middle">len=${fmt(node.length)} · count=${node.count}</text>
    </g>`;
  }).join("");
  const treeSvg = `<svg viewBox="0 0 ${treeWidth} ${treeHeight}" style="width:${treeWidth}px" role="img" aria-label="Segment Tree storing covered x length">${treeEdges}${treeNodeHtml}</svg>`;

  const segmentHtml = (view.leafCounts || []).map((count, index) => {
    const target = view.updateRange && view.updateRange.left <= index && index <= view.updateRange.right;
    return `
    <div class="rect850-segment ${count > 0 ? "active" : ""} ${target ? "update-target" : ""}">
      <span>[${fmt(xs[index])}, ${fmt(xs[index + 1])})</span>
      <strong>${lang === "vi" ? "phủ" : "cover"}: ${count}</strong>
    </div>`;
  }).join("");
  const eventHtml = (view.events || []).map((event) => `
    <span class="rect850-event ${event.delta > 0 ? "add" : "remove"}">${event.delta > 0 ? "+" : "−"} R${event.rectangleIndex + 1} [${fmt(event.x1)}, ${fmt(event.x2)})</span>`).join("");

  const debugRange = view.updateRange
    ? `${view.updateRange.delta > 0 ? "+1" : "−1"} · [${fmt(view.updateRange.x1)}, ${fmt(view.updateRange.x2)})`
    : "—";
  const activeNodeLabel = view.activeNode
    ? `node #${view.activeNode} · depth ${view.callDepth}`
    : "—";

  el.innerHTML = `<div class="rect850-viz">
    <div class="rect850-debug">
      <span>${escapeHtml(view.phase || "setup")}</span>
      <strong>${escapeHtml(view.action || "")}</strong>
      <code>${escapeHtml(debugRange)} · ${escapeHtml(activeNodeLabel)}</code>
    </div>
    <div class="rect850-stats">
      <div><span>Δy</span><strong>${fmt(view.deltaY)}</strong></div>
      <div><span>${lang === "vi" ? "covered_x mới" : "new covered_x"}</span><strong>${fmt(view.coveredX)}</strong></div>
      <div><span>+ area</span><strong>${fmt(view.addedArea)}</strong></div>
      <div><span>${lang === "vi" ? "tổng area" : "total area"}</span><strong>${fmt(view.area)}</strong></div>
    </div>
    <div class="rect850-section-title">${lang === "vi" ? "1. Sweep Line trên mặt phẳng" : "1. Sweep Line on the plane"}</div>
    ${planeSvg}
    <div class="rect850-events">${eventHtml}</div>
    <div class="rect850-section-title">${lang === "vi" ? "2. Các đoạn x sau nén tọa độ" : "2. Compressed x segments"}</div>
    <div class="rect850-segments">${segmentHtml}</div>
    <div class="rect850-section-title">${lang === "vi" ? "3. Segment Tree · root.length = covered_x" : "3. Segment Tree · root.length = covered_x"}</div>
    <div class="rect850-tree-scroll">${treeSvg}</div>
  </div>`;
}

function renderReplaceGreatestView(step) {
  const view = step.replaceGreatestView || {};
  const original = Array.isArray(view.original) ? view.original : [];
  const arr = Array.isArray(view.arr) ? view.arr : [];
  const vi = lang === "vi";
  const phase = String(view.phase || "length");
  const phaseIndex = phase === "done" ? 3
    : phase === "update" ? 2
      : phase === "write" ? 1 : 0;
  const labels = vi
    ? ["Đọc từ phải", "Ghi maximum cũ", "Cập nhật maximum", "Kết quả"]
    : ["Read from right", "Write old maximum", "Update maximum", "Result"];
  const phases = labels.map((label, index) => {
    const done = phase === "done" || index < phaseIndex;
    return `<span class="${done ? "done" : index === phaseIndex ? "active" : ""}">${done ? "✓" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const current = Number.isInteger(view.currentI) ? view.currentI : null;
  const processedFrom = Number.isInteger(view.processedFrom) ? view.processedFrom : original.length;
  const maxSource = Number.isInteger(view.rightMaxSource) ? view.rightMaxSource : null;
  const writeSource = Number.isInteger(view.writeSource) ? view.writeSource : null;
  const sourceCells = original.map((value, index) => {
    const classes = ["rg1299-cell"];
    if (index >= processedFrom || phase === "done") classes.push("scanned");
    if (index === current) classes.push("current");
    if (index === maxSource) classes.push("max-source");
    if (index === writeSource) classes.push("write-source");
    const markers = [];
    if (index === current) markers.push("i");
    if (index === maxSource) markers.push("MAX");
    if (index === writeSource && index !== maxSource) markers.push("WRITE");
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><strong>${escapeHtml(String(value))}</strong><em>${markers.join(" · ")}</em></span>`;
  }).join("");
  const outputCells = arr.map((value, index) => {
    const written = index >= processedFrom || phase === "done";
    const classes = ["rg1299-cell", "output"];
    if (written) classes.push("written");
    if (index === current && written) classes.push("current-write");
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><strong>${written ? escapeHtml(String(value)) : "?"}</strong><em>${written ? (index === current ? "JUST WRITTEN" : "DONE") : "WAIT"}</em></span>`;
  }).join("");
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const curText = view.cur === null || view.cur === undefined ? "?" : String(view.cur);
  const oldMax = view.previousRightMax === null || view.previousRightMax === undefined ? -1 : view.previousRightMax;
  const writeText = view.writeValue === null || view.writeValue === undefined ? "?" : String(view.writeValue);
  const flow = [
    { key: "read", label: "SAVE ORIGINAL", code: `cur = ${curText}` },
    { key: "write", label: "WRITE ANSWER", code: `arr[i] = ${writeText}` },
    { key: "update", label: "PREPARE NEXT i", code: `right_max = max(${oldMax}, ${curText}) = ${view.rightMax}` },
  ].map((item, index) => `<div class="rg1299-flow-step${phase === item.key ? " active" : ""}${["write", "update", "done"].includes(phase) && index === 0 ? " done" : ""}${["update", "done"].includes(phase) && index === 1 ? " done" : ""}${phase === "done" && index === 2 ? " done" : ""}"><small>${item.label}</small><code>${escapeHtml(item.code)}</code></div>${index < 2 ? "<i>→</i>" : ""}`).join("");
  let statusLabel = vi ? "QUÉT TỪ PHẢI SANG TRÁI" : "SCAN RIGHT TO LEFT";
  let statusDetail = vi ? "right_max chỉ chứa các giá trị hoàn toàn bên phải i." : "right_max contains only values strictly to the right of i.";
  let statusClass = "scan";
  if (phase === "write") {
    statusLabel = vi ? "GHI TRƯỚC" : "WRITE FIRST";
    statusDetail = vi ? `arr[${current}] nhận maximum cũ ${writeText}; chưa được dùng cur=${curText}.` : `arr[${current}] receives old maximum ${writeText}; cur=${curText} is not included yet.`;
    statusClass = "write";
  } else if (phase === "update") {
    statusLabel = view.maxUpdated ? (vi ? "MAXIMUM MỚI" : "NEW MAXIMUM") : (vi ? "GIỮ MAXIMUM" : "KEEP MAXIMUM");
    statusDetail = view.maxUpdated ? (vi ? `${curText} trở thành right_max cho index tiếp theo bên trái.` : `${curText} becomes right_max for the next index to the left.`) : (vi ? `${curText} không vượt ${oldMax}; right_max không đổi.` : `${curText} does not exceed ${oldMax}; right_max stays unchanged.`);
    statusClass = view.maxUpdated ? "new-max" : "keep-max";
  } else if (phase === "done") {
    statusLabel = vi ? "HOÀN TẤT" : "DONE";
    statusDetail = vi ? "Tất cả vị trí đã nhận maximum ở bên phải." : "Every position now stores the maximum to its right.";
    statusClass = "done";
  }

  $("treeView").innerHTML = `<div class="rg1299-viz phase-${escapeHtml(phase)}">
    <div class="rg1299-phases">${phases}</div>
    <div class="rg1299-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="rg1299-row"><header><strong>ORIGINAL · READ ONLY</strong><span>${vi ? "xanh = đã quét · MAX = nguồn maximum hiện tại" : "blue = scanned · MAX = current maximum source"}</span></header><div class="rg1299-scroll"><div class="rg1299-cells">${sourceCells}</div></div></section>
    <div class="rg1299-flow">${flow}</div>
    <div class="rg1299-status ${statusClass}"><small>${escapeHtml(statusLabel)}</small><strong>${escapeHtml(statusDetail)}</strong></div>
    <section class="rg1299-row"><header><strong>OUTPUT · arr</strong><span>${vi ? "? = chưa xử lý · lục = đã ghi đáp án" : "? = waiting · green = answer written"}</span></header><div class="rg1299-scroll"><div class="rg1299-cells">${outputCells}</div></div></section>
    <div class="rg1299-metrics"><span><small>OLD RIGHT_MAX</small><strong>${escapeHtml(String(oldMax))}</strong></span><span><small>CUR</small><strong>${escapeHtml(curText)}</strong></span><span class="max"><small>NEW RIGHT_MAX</small><strong>${escapeHtml(String(view.rightMax))}</strong></span></div>
  </div>`;
}

function renderMountainArrayView(step) {
  const view = step.mountainArrayView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const vi = lang === "vi";
  const phase = String(view.phase || "length");
  const phaseIndex = phase === "done" ? 3
    : ["descend-check", "descend", "descend-stop"].includes(phase) ? 2
      : phase === "peak" ? 1 : 0;
  const labels = vi
    ? ["Leo nghiêm ngặt", "Đỉnh nội bộ", "Xuống nghiêm ngặt", "Kết quả"]
    : ["Strict ascent", "Internal peak", "Strict descent", "Result"];
  const phases = labels.map((label, index) => {
    const done = phase === "done" || index < phaseIndex;
    return `<span class="${done ? "done" : index === phaseIndex ? "active" : ""}">${done ? "✓" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const validated = new Set(Array.isArray(view.validatedEdges) ? view.validatedEdges : []);
  const activeEdge = Number.isInteger(view.activeEdge) ? view.activeEdge : null;
  const failedEdge = Number.isInteger(view.failedEdge) ? view.failedEdge : null;
  const peak = Number.isInteger(view.peak) ? view.peak : null;
  const current = Number.isInteger(view.i) ? view.i : 0;
  const width = Math.max(360, nums.length * 76 + 28);
  const height = 210;
  const minValue = nums.length ? Math.min(...nums) : 0;
  const maxValue = nums.length ? Math.max(...nums) : 1;
  const range = Math.max(1, maxValue - minValue);
  const xAt = (index) => nums.length <= 1 ? width / 2 : 38 + index * ((width - 76) / (nums.length - 1));
  const yAt = (value) => 160 - ((value - minValue) / range) * 105;
  const edges = nums.slice(0, -1).map((value, index) => {
    const next = nums[index + 1];
    const direction = value < next ? "up" : value > next ? "down" : "flat";
    const classes = ["mt941-edge", direction];
    if (validated.has(index)) classes.push("validated");
    if (index === activeEdge) classes.push("active");
    if (index === failedEdge) classes.push("failed");
    const x1 = xAt(index), y1 = yAt(value), x2 = xAt(index + 1), y2 = yAt(next);
    const symbol = direction === "up" ? "↑" : direction === "down" ? "↓" : "=";
    return `<g class="${classes.join(" ")}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 7}" text-anchor="middle">${symbol}</text></g>`;
  }).join("");
  const points = nums.map((value, index) => {
    const classes = ["mt941-point"];
    if (index === current) classes.push("current");
    if (index === peak) classes.push("peak");
    if (failedEdge !== null && (index === failedEdge || index === failedEdge + 1)) classes.push("failed");
    const x = xAt(index), y = yAt(value);
    return `<g class="${classes.join(" ")}"><circle cx="${x}" cy="${y}" r="7"/><text class="value" x="${x}" y="${y - 13}" text-anchor="middle">${escapeHtml(String(value))}</text><text class="index" x="${x}" y="${y + 24}" text-anchor="middle">[${index}]</text>${index === peak ? `<text class="peak-label" x="${x}" y="${Math.max(16, y - 31)}" text-anchor="middle">PEAK</text>` : ""}</g>`;
  }).join("");
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  let comparison = vi ? "Chưa so sánh hai điểm kề nhau" : "No adjacent comparison yet";
  if (activeEdge !== null && activeEdge + 1 < nums.length) {
    const leftValue = nums[activeEdge], rightValue = nums[activeEdge + 1];
    const descending = phase.startsWith("descend");
    comparison = `arr[${activeEdge}] = ${leftValue} ${descending ? ">" : "<"} arr[${activeEdge + 1}] = ${rightValue}`;
  } else if (peak !== null) {
    comparison = `peak = index ${peak} · value ${nums[peak]}`;
  }
  const resultKnown = typeof view.result === "boolean";
  const resultClass = resultKnown ? (view.result ? "success" : "failure") : "checking";
  const resultLabel = resultKnown ? (view.result ? "TRUE · VALID MOUNTAIN" : "FALSE · NOT A MOUNTAIN") : (vi ? "ĐANG KIỂM TRA" : "CHECKING");
  const reasonText = view.reason === "too-short" ? (vi ? "Cần ít nhất 3 phần tử" : "At least 3 values are required")
    : view.reason === "no-ascent" ? (vi ? "Đỉnh ở index 0: thiếu sườn lên" : "Peak at index 0: ascent is missing")
      : view.reason === "no-descent" ? (vi ? "Đỉnh ở cuối: thiếu sườn xuống" : "Peak at the end: descent is missing")
        : view.reason === "stopped-early" ? (vi ? "Sườn xuống bị phẳng hoặc tăng trở lại" : "The descent becomes flat or rises again")
          : view.reason === "valid" ? (vi ? "Tăng tới một đỉnh rồi giảm tới cuối" : "Rises to one peak, then falls to the end")
            : comparison;
  const ascentState = view.reason === "no-ascent" ? "fail" : peak !== null ? "pass" : "active";
  const peakState = ["no-ascent", "no-descent"].includes(view.reason) ? "fail" : peak !== null ? "pass" : "pending";
  const descentState = view.reason === "stopped-early" ? "fail" : view.reason === "valid" ? "pass" : phase.startsWith("descend") ? "active" : "pending";

  $("treeView").innerHTML = `<div class="mt941-viz phase-${escapeHtml(phase)}">
    <div class="mt941-phases">${phases}</div>
    <div class="mt941-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <div class="mt941-rules"><span class="${ascentState}"><b>1</b><small>${vi ? "SƯỜN LÊN" : "ASCENT"}</small><code>arr[j] &lt; arr[j+1]</code></span><span class="${peakState}"><b>2</b><small>PEAK</small><code>0 &lt; peak &lt; n-1</code></span><span class="${descentState}"><b>3</b><small>${vi ? "SƯỜN XUỐNG" : "DESCENT"}</small><code>arr[j] &gt; arr[j+1]</code></span></div>
    <section class="mt941-profile"><header><strong>MOUNTAIN PROFILE</strong><code>${escapeHtml(comparison)}</code></header><div><svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${vi ? "Biểu đồ đường của mảng núi" : "Line profile of the mountain array"}"><line class="mt941-ground" x1="22" y1="182" x2="${width - 22}" y2="182"/>${edges}${points}</svg></div></section>
    <div class="mt941-metrics"><span><small>i</small><strong>${escapeHtml(String(current))}</strong></span><span><small>PEAK INDEX</small><strong>${peak === null ? "?" : escapeHtml(String(peak))}</strong></span><span><small>LAST INDEX</small><strong>${Math.max(0, nums.length - 1)}</strong></span></div>
    <div class="mt941-result ${resultClass}"><small>${escapeHtml(resultLabel)}</small><strong>${escapeHtml(reasonText)}</strong></div>
  </div>`;
}

// ---- LeetCode 2320: Count Ways to Place Houses — Fibonacci per side, squared ----
function renderHouses2320View(step) {
  const view = step.houses2320View || {};
  const vi = lang === "vi";
  const n = Number(view.n) || 0;
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const phase = String(view.phase || "intro");
  const display = (value) => value === null || value === undefined ? "—" : String(value);

  const phaseIndex = phase === "intro" ? 0
    : phase === "init" ? 1
      : phase === "step" ? 2
        : phase === "square" ? 3 : 4;
  const phaseLabels = vi
    ? ["Ý tưởng", "Base dp[0],dp[1]", "Fibonacci dp[i]", "Một bên → ²", "Đáp án"]
    : ["Idea", "Base dp[0],dp[1]", "Fibonacci dp[i]", "One side → ²", "Answer"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // dp strip 0..n
  const dpCells = [];
  for (let k = 0; k <= n; k++) {
    const filled = dp[k] !== null && dp[k] !== undefined;
    const classes = ["h2320-dp-cell"];
    if (!filled) classes.push("pending");
    if (k === view.i && phase !== "done") classes.push("cur");
    if (phase === "step" && k === view.i - 1) classes.push("empty-src");
    if (phase === "step" && k === view.i - 2) classes.push("house-src");
    if ((phase === "square" || phase === "done") && k === n) classes.push("one-side");
    dpCells.push(`<div class="${classes.join(" ")}"><small>dp[${k}]</small><b>${filled ? escapeHtml(String(dp[k])) : "·"}</b></div>`);
  }
  const dpLine = dpCells.join("");

  // Branch cards during a Fibonacci step.
  let branches = "";
  if (phase === "step" && Number.isInteger(view.i)) {
    const iv = view.i;
    branches = `<section class="h2320-branches">
      <div class="empty">
        <small>${vi ? `Ô ${iv} ĐỂ TRỐNG` : `Plot ${iv} EMPTY`}</small>
        <div class="plots">${Array.from({ length: Math.min(iv, 6) }, (_, k) => `<span class="${k === Math.min(iv, 6) - 1 ? "free" : ""}"></span>`).join("")}</div>
        <b>dp[${iv - 1}] = ${escapeHtml(display(view.emptyWays))}</b>
      </div>
      <em>+</em>
      <div class="house">
        <small>${vi ? `Ô ${iv} ĐẶT NHÀ` : `Plot ${iv} HOUSE`}</small>
        <div class="plots">${Array.from({ length: Math.min(iv, 6) }, (_, k) => { const last = Math.min(iv, 6) - 1; return `<span class="${k === last ? "house" : k === last - 1 ? "forced" : ""}"></span>`; }).join("")}</div>
        <b>${vi ? "ô trước phải trống →" : "previous forced empty →"} dp[${iv - 2}] = ${escapeHtml(display(view.houseWays))}</b>
      </div>
      <em>=</em>
      <div class="sum"><small>dp[${iv}]</small><b>${escapeHtml(display(dp[iv]))}</b></div>
    </section>`;
  }

  // Two-sides square panel.
  let squarePanel = "";
  if (phase === "square" || phase === "done") {
    squarePanel = `<section class="h2320-square ${phase === "done" ? "ready" : ""}">
      <div class="side"><small>${vi ? "Bên A" : "Side A"}</small><b>${escapeHtml(display(view.oneSide))}</b></div>
      <em>×</em>
      <div class="side"><small>${vi ? "Bên B" : "Side B"}</small><b>${escapeHtml(display(view.oneSide))}</b></div>
      <em>=</em>
      <div class="total"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><b>${escapeHtml(display(view.answer))}</b></div>
    </section>`;
  }

  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;

  $("treeView").innerHTML = `<section class="h2320-viz" role="img" aria-label="LeetCode 2320 Count Ways to Place Houses visualization">
    <div class="h2320-phases">${phases}</div>
    <div class="h2320-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="h2320-street">
      <header><strong>${vi ? "Con đường: n ô mỗi bên" : "Street: n plots each side"}</strong><span>${vi ? "không đặt nhà ở hai ô liền kề cùng bên" : "no houses on adjacent plots on the same side"}</span></header>
      <div class="h2320-sides">
        <div class="h2320-side">${Array.from({ length: n }, (_, k) => `<span></span>`).join("")}<i>${vi ? "bên A" : "side A"}</i></div>
        <div class="h2320-road"></div>
        <div class="h2320-side">${Array.from({ length: n }, (_, k) => `<span></span>`).join("")}<i>${vi ? "bên B" : "side B"}</i></div>
      </div>
    </section>
    ${branches}
    <section class="h2320-dp">
      <header><strong>${vi ? "dp một bên (Fibonacci)" : "dp for one side (Fibonacci)"}</strong><span>dp[i] = dp[i-1] + dp[i-2]</span></header>
      <div class="h2320-dp-cells">${dpLine}</div>
    </section>
    ${squarePanel}
  </section>`;
}

// ---- LeetCode 1690: Stone Game VII — interval DP on the score difference ----
function renderStoneGame1690View(step) {
  const view = step.stoneGame1690View || {};
  const vi = lang === "vi";
  const stones = Array.isArray(view.stones) ? view.stones : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const n = Number(view.n) || stones.length;
  const phase = String(view.phase || "prefix");
  const display = (value) => value === null || value === undefined ? "—" : String(value);

  const phaseIndex = phase === "prefix" ? 0
    : phase === "base" ? 1
      : phase === "cell" ? 2 : 3;
  const phaseLabels = vi
    ? ["Prefix sum", "Base dp[i][i]", "Điền dp[i][j]", "Đáp án"]
    : ["Prefix sums", "Base dp[i][i]", "Fill dp[i][j]", "Answer"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const inInterval = (idx) => Number.isInteger(view.i) && Number.isInteger(view.j) && idx >= view.i && idx <= view.j;
  const showInterval = ["cell", "done"].includes(phase);
  const stoneCells = stones.map((value, index) => {
    const classes = ["sg1690-stone"];
    if (showInterval && inInterval(index)) classes.push("in-interval");
    if (phase === "cell" && index === view.i) classes.push("end-left");
    if (phase === "cell" && index === view.j) classes.push("end-right");
    if (phase === "prefix" && index === view.prefixK - 1) classes.push("active");
    const badges = [];
    if (phase === "cell" && index === view.i) badges.push(`<em class="l">${vi ? "TRÁI" : "LEFT"}</em>`);
    if (phase === "cell" && index === view.j) badges.push(`<em class="r">${vi ? "PHẢI" : "RIGHT"}</em>`);
    return `<div class="${classes.join(" ")}"><small>#${index}</small><b>${escapeHtml(String(value))}</b>${badges.join("")}</div>`;
  }).join("");

  // Prefix sums row.
  const prefixCells = prefix.map((value, index) => {
    const cls = index === view.prefixK ? "active" : "";
    return `<div class="sg1690-prefix-cell ${cls}"><small>p[${index}]</small><b>${escapeHtml(String(value))}</b></div>`;
  }).join("");

  // Triangular DP table (rows i, cols j; only i<=j meaningful).
  let dpGrid = "";
  if (n > 0) {
    const header = `<tr><th></th>${Array.from({ length: n }, (_, j) => `<th class="${j === view.j ? "active" : ""}">j${j}</th>`).join("")}</tr>`;
    const rows = [];
    for (let r = 0; r < n; r++) {
      const cells = [];
      for (let c = 0; c < n; c++) {
        if (c < r) {
          cells.push(`<td class="void"></td>`);
          continue;
        }
        const filled = dp[r] && dp[r][c] !== null && dp[r][c] !== undefined;
        const classes = [];
        if (r === view.i && c === view.j) classes.push("cur");
        else if (phase === "cell" && r === view.i + 1 && c === view.j) classes.push("left-src");
        else if (phase === "cell" && r === view.i && c === view.j - 1) classes.push("right-src");
        if (r === 0 && c === n - 1 && phase === "done") classes.push("answer");
        if (r === c) classes.push("diag");
        cells.push(`<td class="${classes.join(" ")}">${filled ? escapeHtml(String(dp[r][c])) : (r === c ? "0" : "·")}</td>`);
      }
      rows.push(`<tr><th class="${r === view.i ? "active" : ""}">i${r}</th>${cells.join("")}</tr>`);
    }
    dpGrid = `<section class="sg1690-dp">
      <header><strong>${vi ? "Bảng dp[i][j]" : "dp[i][j] table"}</strong><span>${vi ? "hiệu điểm tốt nhất trên đoạn [i..j]" : "best score difference on interval [i..j]"}</span></header>
      <div class="sg1690-dp-scroll"><table>${header}${rows.join("")}</table></div>
    </section>`;
  }

  // Decision card during a cell computation.
  let decisionPanel = "";
  if (phase === "cell" && Number.isInteger(view.i)) {
    const chose = view.decision;
    decisionPanel = `<section class="sg1690-decision">
      <div class="options">
        <div class="left ${chose === "left" ? "won" : "lost"}">
          <small>${vi ? "BỎ viên TRÁI #" : "REMOVE LEFT #"}${view.i} (${escapeHtml(String(stones[view.i]))})</small>
          <b>sum(${view.i + 1}..${view.j}) − dp[${view.i + 1}][${view.j}] = ${escapeHtml(display(view.sumLeft))} − ${escapeHtml(display(dp[view.i + 1] ? dp[view.i + 1][view.j] : null))} = ${escapeHtml(display(view.takeLeft))}</b>
          <span>${vi ? "nhận tổng còn lại, rồi đối thủ chơi tối ưu" : "earn remaining sum, then opponent plays optimally"}</span>
          <em>${chose === "left" ? (vi ? "CHỌN ✓" : "WIN ✓") : (vi ? "bỏ" : "lose")}</em>
        </div>
        <div class="right ${chose === "right" ? "won" : "lost"}">
          <small>${vi ? "BỎ viên PHẢI #" : "REMOVE RIGHT #"}${view.j} (${escapeHtml(String(stones[view.j]))})</small>
          <b>sum(${view.i}..${view.j - 1}) − dp[${view.i}][${view.j - 1}] = ${escapeHtml(display(view.sumRight))} − ${escapeHtml(display(dp[view.i] ? dp[view.i][view.j - 1] : null))} = ${escapeHtml(display(view.takeRight))}</b>
          <span>${vi ? "nhận tổng còn lại, rồi đối thủ chơi tối ưu" : "earn remaining sum, then opponent plays optimally"}</span>
          <em>${chose === "right" ? (vi ? "CHỌN ✓" : "WIN ✓") : (vi ? "bỏ" : "lose")}</em>
        </div>
      </div>
    </section>`;
  }

  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const answerReady = phase === "done";

  $("treeView").innerHTML = `<section class="sg1690-viz" role="img" aria-label="LeetCode 1690 Stone Game VII visualization">
    <div class="sg1690-phases">${phases}</div>
    <div class="sg1690-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="sg1690-row">
      <header><strong>stones</strong><span>${vi ? "vàng = đoạn [i..j] đang xét · TRÁI/PHẢI = hai đầu có thể bỏ" : "gold = current interval [i..j] · LEFT/RIGHT = removable ends"}</span></header>
      <div class="sg1690-stones">${stoneCells}</div>
    </section>
    ${phase === "prefix" ? `<section class="sg1690-prefix"><header><strong>prefix</strong><span>sum(l..r) = prefix[r+1] − prefix[l]</span></header><div class="sg1690-prefix-cells">${prefixCells}</div></section>` : ""}
    ${decisionPanel}
    ${dpGrid}
    <section class="sg1690-answer ${answerReady ? "ready" : ""}">
      <div><small>${vi ? "HIỆU ĐIỂM (Alice − Bob)" : "SCORE DIFF (Alice − Bob)"}</small><strong>${escapeHtml(display(view.answer))}</strong></div>
      <em>${answerReady ? (vi ? "dp[0][n-1]" : "dp[0][n-1]") : (vi ? "đang tính..." : "computing...")}</em>
    </section>
  </section>`;
}

// ---- LeetCode 1388: Pizza With 3n Slices — circular pick-n-non-adjacent DP ----
function renderPizza1388View(step) {
  const view = step.pizza1388View || {};
  const vi = lang === "vi";
  const slices = Array.isArray(view.slices) ? view.slices : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const picks = new Set(Array.isArray(view.picks) ? view.picks : []);
  const total = Number(view.total) || slices.length;
  const n = Number(view.n) || 0;
  const phase = String(view.phase || "intro");
  const offset = Number(view.offset) || 0;
  const display = (value) => value === null || value === undefined ? "—" : String(value);

  const phaseIndex = ["intro", "reduce"].includes(phase) ? 0
    : phase === "pass-init" ? 1
      : phase === "cell" ? 2
        : phase === "pass-result" ? 3 : 4;
  const phaseLabels = vi
    ? ["Quy về bài toán", "Bắt đầu lượt", "Điền dp[i][j]", "Kết quả lượt", "Đáp án"]
    : ["Reduce problem", "Start pass", "Fill dp[i][j]", "Pass result", "Answer"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // Circular slice ring rendered as a wrapping row; the dropped slice greyed out,
  // the current pass subarray outlined, chosen slices (you) highlighted.
  const inSub = (index) => phase !== "intro" && phase !== "reduce" && phase !== "final" && Number.isInteger(view.subLen)
    ? index >= offset && index < offset + view.subLen
    : false;
  const activeOriginal = phase === "cell" && Number.isInteger(view.i) ? view.i - 1 + offset : null;
  const ring = slices.map((value, index) => {
    const classes = ["pz1388-slice"];
    if (index === view.droppedIndex) classes.push("dropped");
    if (inSub(index)) classes.push("in-sub");
    if (index === activeOriginal) classes.push("active");
    if (picks.has(index)) classes.push("you");
    const badges = [];
    if (index === view.droppedIndex) badges.push(`<em class="drop">${vi ? "BỎ" : "DROP"}</em>`);
    if (picks.has(index)) badges.push(`<em class="you">${vi ? "BẠN" : "YOU"}</em>`);
    return `<div class="${classes.join(" ")}"><small>#${index}</small><b>${escapeHtml(String(value))}</b>${badges.join("")}</div>`;
  }).join("");

  // DP grid (only during a pass). Rows i=0..m, cols j=0..n.
  let dpGrid = "";
  if (dp.length > 1 && ["pass-init", "cell", "pass-result"].includes(phase)) {
    const m = dp.length - 1;
    const header = `<tr><th></th>${Array.from({ length: n + 1 }, (_, j) => `<th class="${j === view.j ? "active" : ""}">j=${j}</th>`).join("")}</tr>`;
    const rows = [];
    for (let i = 0; i <= m; i++) {
      const rowLabel = i === 0 ? "dp[0]" : `i=${i}<u>#${i - 1 + offset}</u>`;
      const cells = [];
      for (let j = 0; j <= n; j++) {
        const filled = dp[i][j] !== null && dp[i][j] !== undefined;
        const classes = [];
        if (i === view.i && j === view.j) classes.push("cur");
        else if (phase === "cell" && i === view.i - 1 && j === view.j) classes.push("skip-src");
        else if (phase === "cell" && i === view.i - 2 && j === view.j - 1) classes.push("take-src");
        if (i === m && j === n && phase === "pass-result") classes.push("answer");
        cells.push(`<td class="${classes.join(" ")}">${escapeHtml(String(filled ? dp[i][j] : "·"))}</td>`);
      }
      rows.push(`<tr><th>${rowLabel}</th>${cells.join("")}</tr>`);
    }
    dpGrid = `<section class="pz1388-dp">
      <header><strong>${vi ? `dp cho ${view.passLabel || "lượt"}` : `dp for ${view.passLabel || "pass"}`}</strong><span>dp[i][j] = ${vi ? "chọn j miếng không kề từ i miếng đầu" : "pick j non-adjacent from first i"}</span></header>
      <div class="pz1388-dp-scroll"><table>${header}${rows.join("")}</table></div>
    </section>`;
  }

  // Decision card during a cell computation.
  let decisionPanel = "";
  if (phase === "cell" && Number.isInteger(view.i)) {
    const chose = view.decision;
    decisionPanel = `<section class="pz1388-decision">
      <div class="options">
        <div class="skip ${chose === "skip" ? "won" : "lost"}">
          <small>${vi ? "BỎ miếng này" : "SKIP this slice"}</small>
          <b>dp[${view.i - 1}][${view.j}] = ${escapeHtml(display(view.skip))}</b>
          <span>${vi ? "giữ kết quả không dùng miếng i" : "keep the result without slice i"}</span>
          <em>${chose === "skip" ? (vi ? "CHỌN ✓" : "WIN ✓") : (vi ? "bỏ" : "lose")}</em>
        </div>
        <div class="take ${chose === "take" ? "won" : "lost"}">
          <small>${vi ? "LẤY miếng này" : "TAKE this slice"}</small>
          <b>dp[${view.i - 2}][${view.j - 1}] + ${escapeHtml(display(view.val))} = ${escapeHtml(display(view.take))}</b>
          <span>${vi ? "lấy miếng i nên phải bỏ miếng i-1 → dùng dp[i-2]" : "taking slice i forbids i-1 → use dp[i-2]"}</span>
          <em>${chose === "take" ? (vi ? "CHỌN ✓" : "WIN ✓") : (vi ? "bỏ" : "lose")}</em>
        </div>
      </div>
    </section>`;
  }

  // Pass tracker.
  const passTracker = `<section class="pz1388-passes">
    <div class="${view.pass === "A" ? "active" : ""} ${view.winner === "A" && phase === "final" ? "winner" : ""}"><small>Pass A · ${vi ? "bỏ miếng cuối" : "drop last"}</small><b>${escapeHtml(display(view.passABest))}</b></div>
    <div class="${view.pass === "B" ? "active" : ""} ${view.winner === "B" && phase === "final" ? "winner" : ""}"><small>Pass B · ${vi ? "bỏ miếng đầu" : "drop first"}</small><b>${escapeHtml(display(view.passBBest))}</b></div>
    <div class="ans ${phase === "final" ? "ready" : ""}"><small>max</small><b>${escapeHtml(display(view.answer))}</b></div>
  </section>`;

  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;

  $("treeView").innerHTML = `<section class="pz1388-viz" role="img" aria-label="LeetCode 1388 Pizza With 3n Slices visualization">
    <div class="pz1388-phases">${phases}</div>
    <div class="pz1388-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="pz1388-ring">
      <header><strong>${vi ? `Vòng tròn ${total} miếng · chọn ${n} miếng không kề` : `Circle of ${total} slices · pick ${n} non-adjacent`}</strong><span>${vi ? "xám = bỏ · viền = mảng con của lượt · lục = miếng bạn ăn" : "grey = dropped · outline = pass subarray · green = your slices"}</span></header>
      <div class="pz1388-slices">${ring}</div>
    </section>
    ${decisionPanel}
    ${dpGrid}
    ${passTracker}
  </section>`;
}

// ---- LeetCode 2140: Solving Questions With Brainpower — backward DP ----
function renderBrainpower2140View(step) {
  const view = step.brainpower2140View || {};
  const vi = lang === "vi";
  const questions = Array.isArray(view.questions) ? view.questions : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const decisions = Array.isArray(view.decisions) ? view.decisions : [];
  const chosen = new Set(Array.isArray(view.chosen) ? view.chosen : []);
  const n = Number(view.n) || questions.length;
  const phase = String(view.phase || "init");
  const display = (value) => value === null || value === undefined ? "—" : String(value);
  const inRange = (idx, lo, hi) => Number.isInteger(lo) && Number.isInteger(hi) && idx >= lo && idx <= hi;

  const phaseIndex = phase === "init" ? 0
    : ["scan", "read"].includes(phase) ? 1
      : ["skip", "solve", "compare"].includes(phase) ? 2
        : phase === "write" ? 3 : 4;
  const phaseLabels = vi
    ? ["Khởi tạo dp", "Đọc câu i", "So sánh skip/solve", "Ghi dp[i]", "Kết quả"]
    : ["Init dp", "Read question i", "Compare skip/solve", "Write dp[i]", "Result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // While a question is being processed, show its reach: locked span + landing.
  const reachPhases = ["read", "skip", "solve", "compare", "write"];
  const showReach = reachPhases.includes(phase) && Number.isInteger(view.i);

  // Question cards row. Each shows points + brainpower, current pointer, locked range, chosen.
  const cards = questions.map((q, index) => {
    const classes = ["bp2140-q"];
    if (index === view.i && phase !== "done") classes.push("active");
    if (showReach && inRange(index, view.lockedStart, view.lockedEnd)) classes.push("locked");
    if (showReach && view.jumpTarget < n && index === view.jumpTarget) classes.push("landing");
    if (phase === "done" && chosen.has(index)) classes.push("chosen");
    if (decisions[index] === "solve" && phase !== "done") classes.push("solved");
    const badges = [];
    if (index === view.i && phase !== "done") badges.push(`<em class="here">i</em>`);
    if (phase === "done" && chosen.has(index)) badges.push(`<em class="take">${vi ? "GIẢI" : "SOLVE"}</em>`);
    if (showReach && inRange(index, view.lockedStart, view.lockedEnd)) badges.push(`<em class="lock">🔒 ${vi ? "KHÓA" : "LOCKED"}</em>`);
    if (showReach && view.jumpTarget < n && index === view.jumpTarget) badges.push(`<em class="land">${vi ? "ĐÍCH" : "LAND"}</em>`);
    // dp value bound to this question index (dp is aligned by index).
    const dpv = dp[index];
    const dpChip = dpv !== null && dpv !== undefined ? `<u>dp[${index}]=${escapeHtml(String(dpv))}</u>` : "";
    return `<div class="${classes.join(" ")}">
      <small>#${index}</small>
      <b>${escapeHtml(String(q[0]))}<span>pts</span></b>
      <i>bp ${escapeHtml(String(q[1]))}</i>
      ${dpChip}
      ${badges.join("")}
    </div>`;
  }).join("");

  // Jump arrow description for the active question.
  let jumpInfo = "";
  if (showReach) {
    const iv = view.i;
    const lockedText = view.lockedEnd !== null && view.lockedEnd >= view.lockedStart
      ? (vi ? `🔒 khóa câu ${view.lockedStart}..${view.lockedEnd} (${view.brainpower} câu)` : `🔒 locks questions ${view.lockedStart}..${view.lockedEnd} (${view.brainpower})`)
      : (vi ? "không khóa câu nào" : "locks nothing");
    jumpInfo = `<div class="bp2140-jump"><span>${vi ? "GIẢI câu" : "SOLVE"} ${iv} →</span><b>${view.jumpTarget === n ? (vi ? `nhảy tới HẾT (dp[${n}])` : `jump to END (dp[${n}])`) : (vi ? `nhảy tới câu ${view.jumpTarget}` : `jump to question ${view.jumpTarget}`)}</b><i>${escapeHtml(lockedText)}</i></div>`;
  }

  // dp table 0..n
  const dpCells = [];
  for (let v = 0; v <= n; v++) {
    const classes = ["bp2140-dp-cell"];
    const filled = dp[v] !== null && dp[v] !== undefined;
    if (!filled) classes.push("pending");
    if (v === view.i && phase !== "done") classes.push("cursor");
    if (Number.isInteger(view.i) && v === view.i + 1 && ["skip", "compare", "write"].includes(phase)) classes.push("skip-src");
    if (Number.isInteger(view.jumpTarget) && v === view.jumpTarget && ["solve", "compare", "write"].includes(phase)) classes.push("jump-src");
    if (v === n) classes.push("base");
    const label = v === n ? (vi ? "dp[" + n + "]·HẾT" : "dp[" + n + "]·END") : `dp[${v}]`;
    dpCells.push(`<div class="${classes.join(" ")}"><small>${label}</small><b>${filled ? escapeHtml(String(dp[v])) : "·"}</b></div>`);
  }
  const dpLine = dpCells.join("");

  // Decision cards
  let decisionPanel = "";
  if (["skip", "solve", "compare", "write"].includes(view.phase) && Number.isInteger(view.i)) {
    const iv = view.i;
    const chose = view.decision;
    decisionPanel = `<section class="bp2140-decision">
      <div class="options">
        <div class="skip ${chose === "skip" ? "won" : chose ? "lost" : ""}">
          <small>${vi ? "BỎ câu " : "SKIP "}${iv}</small>
          <b>dp[${iv + 1}] = ${escapeHtml(display(view.skip))}</b>
          <span>${vi ? "sang thẳng câu kế tiếp" : "move to the next question"}</span>
          <em>${chose ? (chose === "skip" ? (vi ? "CHỌN ✓" : "WIN ✓") : (vi ? "bỏ" : "lose")) : "?"}</em>
        </div>
        <div class="solve ${chose === "solve" ? "won" : chose ? "lost" : ""}">
          <small>${vi ? "GIẢI câu " : "SOLVE "}${iv}</small>
          <b>${escapeHtml(display(view.points))} + dp[${display(view.jumpTarget)}] = ${escapeHtml(display(view.solve))}</b>
          <span>${vi ? `nhảy qua ${escapeHtml(display(view.brainpower))} câu bị khóa` : `jump over ${escapeHtml(display(view.brainpower))} locked questions`}</span>
          <em>${chose ? (chose === "solve" ? (vi ? "CHỌN ✓" : "WIN ✓") : (vi ? "bỏ" : "lose")) : "?"}</em>
        </div>
      </div>
    </section>`;
  }

  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const answerReady = phase === "done";
  const chosenList = [...chosen];
  const answerExpr = chosenList.length
    ? `${chosenList.map((q) => escapeHtml(String(questions[q][0]))).join(" + ")} = ${escapeHtml(display(view.answer))}`
    : display(view.answer);

  $("treeView").innerHTML = `<section class="bp2140-viz" role="img" aria-label="LeetCode 2140 Solving Questions With Brainpower visualization">
    <div class="bp2140-phases">${phases}</div>
    <div class="bp2140-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="bp2140-board">
      <header><strong>${vi ? "Danh sách câu hỏi" : "Questions"}</strong><span>${vi ? "tím = đang xét · đỏ = bị khóa · lục = câu nhảy tới · dp[i] gắn trên mỗi câu" : "purple = current · red = locked · green = landing · dp[i] shown on each card"}</span></header>
      <div class="bp2140-cards">${cards}</div>
      ${jumpInfo}
    </section>
    ${decisionPanel}
    <section class="bp2140-dp">
      <header><strong>${vi ? "Bảng dp (điền từ phải sang trái)" : "dp table (filled right to left)"}</strong><span>dp[i] = max(dp[i+1], points + dp[i+bp+1])</span></header>
      <div class="bp2140-dp-cells">${dpLine}</div>
    </section>
    <section class="bp2140-answer ${answerReady ? "ready" : ""}">
      <div><small>${vi ? "ĐIỂM TỐI ĐA (dp[0])" : "MAX POINTS (dp[0])"}</small><strong>${escapeHtml(display(view.answer))}</strong></div>
      <code>${answerReady ? answerExpr : (vi ? "đang tính..." : "computing...")}</code>
      <em>${answerReady && chosenList.length ? (vi ? `giải câu {${chosenList.join(", ")}}` : `solve questions {${chosenList.join(", ")}}`) : ""}</em>
    </section>
  </section>`;
}

// ---- LeetCode 740: Delete and Earn — value-axis House Robber ----
function renderDeleteEarn740View(step) {
  const view = step.deleteEarn740View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const counts = Array.isArray(view.counts) ? view.counts : [];
  const earn = Array.isArray(view.earn) ? view.earn : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const decisions = Array.isArray(view.decisions) ? view.decisions : [];
  const chosen = new Set(Array.isArray(view.chosen) ? view.chosen : []);
  const maxVal = Number(view.maxVal) || 0;
  const phase = String(view.phase || "aggregate");
  const display = (value) => value === null || value === undefined ? "—" : String(value);

  const phaseIndex = phase === "aggregate" || phase === "aggregate-loop" ? 0
    : phase === "reduce" ? 1
      : phase === "dp-init" ? 2
        : ["dp-loop", "dp-compute"].includes(phase) ? 3 : 4;
  const phaseLabels = vi
    ? ["Gom theo giá trị", "Quy về House Robber", "Khởi tạo dp", "Chạy dp", "Kết quả"]
    : ["Bucket by value", "Reduce to House Robber", "Init dp", "Run dp", "Result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // nums chips (aggregation source)
  const numChips = nums.map((value, index) => {
    const classes = ["de740-num"];
    if (index === view.activeNumIndex) classes.push("active");
    else if (Number.isInteger(view.activeNumIndex) && index < view.activeNumIndex) classes.push("done");
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><b>${escapeHtml(String(value))}</b></span>`;
  }).join("");

  // Value line 0..maxVal — this is the House Robber array.
  const dpActive = ["dp-init", "dp-loop", "dp-compute", "done"].includes(phase);
  const maxEarn = Math.max(1, ...earn.map((v) => Number(v) || 0));
  const valueCells = [];
  for (let v = 0; v <= maxVal; v++) {
    const classes = ["de740-cell"];
    const e = Number(earn[v]) || 0;
    if (e === 0) classes.push("empty");
    if (v === view.activeValue) classes.push("active");
    if (v === view.i && dpActive && phase !== "done") classes.push("cursor");
    if (view.phase === "dp-compute" && v === view.conflictLeft) classes.push("conflict");
    if (view.phase === "dp-compute" && v === view.baseIndex) classes.push("base");
    if (phase === "done" && chosen.has(v)) classes.push("chosen");
    const barHeight = 6 + Math.round((e / maxEarn) * 46);
    const badges = [];
    if (phase === "done" && chosen.has(v)) badges.push(`<em class="take">${vi ? "LẤY" : "TAKE"}</em>`);
    if (view.phase === "dp-compute" && v === view.conflictLeft && view.decision === "take") badges.push(`<em class="skip">${vi ? "BỎ" : "SKIP"}</em>`);
    valueCells.push(`<div class="${classes.join(" ")}">
      <span class="de740-bar" style="height:${barHeight}px"></span>
      <b>${escapeHtml(String(e))}</b>
      <small>v=${v}</small>
      ${counts[v] ? `<i>×${counts[v]}</i>` : ""}
      ${badges.join("")}
    </div>`);
  }
  const valueLine = valueCells.join("");

  // dp line 0..maxVal
  const dpCells = [];
  for (let v = 0; v <= maxVal; v++) {
    const classes = ["de740-dp-cell"];
    const filled = dp[v] !== null && dp[v] !== undefined;
    if (!filled) classes.push("pending");
    if (v === view.i && phase !== "done") classes.push("cursor");
    if (view.phase === "dp-compute" && v === view.baseIndex) classes.push("base");
    if (view.phase === "dp-compute" && v === view.conflictLeft) classes.push("prev");
    if (decisions[v] === "take" && filled) classes.push("take");
    dpCells.push(`<div class="${classes.join(" ")}"><small>dp[${v}]</small><b>${filled ? escapeHtml(String(dp[v])) : "·"}</b></div>`);
  }
  const dpLine = dpCells.join("");

  // Decision cards (only during dp loop/compute)
  let decisionPanel = "";
  if (["dp-loop", "dp-compute"].includes(view.phase) && Number.isInteger(view.i)) {
    const iv = view.i;
    const chose = view.decision;
    decisionPanel = `<section class="de740-decision">
      <header><strong>${vi ? `Xét giá trị ${iv}` : `Consider value ${iv}`}</strong><span>${vi ? "earn" : "earn"}[${iv}] = ${escapeHtml(display(earn[iv]))}</span></header>
      <div class="de740-options">
        <div class="skip ${chose === "skip" ? "won" : chose ? "lost" : ""}">
          <small>${vi ? "BỎ giá trị " : "SKIP value "}${iv}</small>
          <b>dp[${iv - 1}] = ${escapeHtml(display(view.skip))}</b>
          <span>${vi ? "giữ nguyên đáp án trước đó" : "keep the previous answer"}</span>
          <em>${chose ? (chose === "skip" ? (vi ? "CHỌN ✓" : "WIN ✓") : (vi ? "bỏ" : "lose")) : "?"}</em>
        </div>
        <div class="take ${chose === "take" ? "won" : chose ? "lost" : ""}">
          <small>${vi ? "LẤY giá trị " : "TAKE value "}${iv}</small>
          <b>dp[${iv - 2}] + earn[${iv}] = ${escapeHtml(display(view.baseIndex !== null && dp[view.baseIndex] !== null ? dp[view.baseIndex] : (Number.isInteger(iv - 2) ? dp[iv - 2] : 0)))} + ${escapeHtml(display(earn[iv]))} = ${escapeHtml(display(view.take))}</b>
          <span>${vi ? `phải bỏ giá trị ${iv - 1} liền kề → dùng dp[${iv - 2}]` : `must skip adjacent value ${iv - 1} → use dp[${iv - 2}]`}</span>
          <em>${chose ? (chose === "take" ? (vi ? "CHỌN ✓" : "WIN ✓") : (vi ? "bỏ" : "lose")) : "?"}</em>
        </div>
      </div>
    </section>`;
  }

  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const answerReady = phase === "done";
  const chosenList = [...chosen];
  const answerExpr = chosenList.length
    ? `${chosenList.map((v) => escapeHtml(String(earn[v]))).join(" + ")} = ${escapeHtml(display(view.answer))}`
    : display(view.answer);

  $("treeView").innerHTML = `<section class="de740-viz" role="img" aria-label="LeetCode 740 Delete and Earn visualization">
    <div class="de740-phases">${phases}</div>
    <div class="de740-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="de740-agg ${phase === "aggregate" || phase === "aggregate-loop" ? "active" : ""}">
      <header><strong>${vi ? "1 · Gom nums theo GIÁ TRỊ" : "1 · Bucket nums by VALUE"}</strong><span>${vi ? "earn[v] = v × số lần xuất hiện" : "earn[v] = v × how many times it appears"}</span></header>
      <div class="de740-nums">${numChips || `<span class="de740-empty">—</span>`}</div>
    </section>
    <section class="de740-line">
      <header><strong>${vi ? "2 · Trục giá trị earn[] = mảng House Robber" : "2 · Value axis earn[] = House Robber array"}</strong><span>${vi ? "cột = tổng điểm; lấy một cột thì bỏ hai cột kề" : "bars = total points; taking one bar blocks both neighbors"}</span></header>
      <div class="de740-cells">${valueLine}</div>
    </section>
    ${decisionPanel}
    <section class="de740-dp ${dpActive ? "active" : ""}">
      <header><strong>${vi ? "3 · Bảng dp" : "3 · dp table"}</strong><span>dp[v] = max(dp[v-1], dp[v-2] + earn[v])</span></header>
      <div class="de740-dp-cells">${dpLine}</div>
    </section>
    <section class="de740-answer ${answerReady ? "ready" : ""}">
      <div><small>${vi ? "ĐIỂM TỐI ĐA" : "MAX POINTS"}</small><strong>${escapeHtml(display(view.answer))}</strong></div>
      <code>${answerReady ? answerExpr : (vi ? "đang tính..." : "computing...")}</code>
      <em>${answerReady && chosenList.length ? (vi ? `chọn giá trị {${chosenList.join(", ")}}` : `chosen values {${chosenList.join(", ")}}`) : ""}</em>
    </section>
  </section>`;
}

function renderMaximumProductView(step) {
  const view = step.maxProductView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const vi = lang === "vi";
  const phase = String(view.phase || "init");
  const i = Number.isInteger(view.i) ? view.i : 0;
  const x = view.x;
  const display = (value) => value === null || value === undefined ? "—" : String(value);
  const product = (values) => (Array.isArray(values) && values.length ? values.join(" × ") : "—");
  const inRange = (index, start, end) => Number.isInteger(start) && Number.isInteger(end) && index >= start && index <= end;
  // Approach 1 hides values until its own update line runs; the other approaches
  // always hold a valid previous state, and unset DP cells render as "—".
  const swapApproach = (Number(view.approach) || 1) === 1;
  const maxReady = swapApproach ? ["init", "max", "min", "best", "done"].includes(phase) : view.curMax !== null && view.curMax !== undefined;
  const minReady = swapApproach ? ["init", "min", "best", "done"].includes(phase) : view.curMin !== null && view.curMin !== undefined;

  const approachId = Number(view.approach) || 1;
  const phaseIndex = phase === "done" || phase === "best" ? 4
    : ["min", "assign"].includes(phase) ? 3
      : phase === "max" ? 2
        : ["sign", "swap", "candidates"].includes(phase) ? 1 : 0;
  const labels = approachId === 1
    ? (vi
      ? ["Đọc x", "Xét dấu", "Cập nhật MAX", "Cập nhật MIN", "Cập nhật BEST"]
      : ["Read x", "Check sign", "Update MAX", "Update MIN", "Update BEST"])
    : approachId === 2
      ? (vi
        ? ["Đọc n", "Tính 3 ứng viên", "max_curr", "min_curr", "Cập nhật ans"]
        : ["Read n", "Build 3 candidates", "max_curr", "min_curr", "Update ans"])
      : (vi
        ? ["Khởi tạo bảng", "Tính 3 ứng viên", "max_dp[i]", "min_dp[i]", "max(max_dp)"]
        : ["Init tables", "Build 3 candidates", "max_dp[i]", "min_dp[i]", "max(max_dp)"]);
  const phases = labels.map((label, index) => {
    const done = phase === "done" || index < phaseIndex;
    return `<span class="${done ? "done" : index === phaseIndex ? "active" : ""}">${done ? "✓" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const cells = nums.map((value, index) => {
    const classes = ["mps152-cell"];
    if (index === i && phase !== "done") classes.push("active");
    if (value < 0) classes.push("negative");
    if (value === 0) classes.push("zero");
    if (inRange(index, view.bestStart, view.bestEnd)) classes.push("in-best");
    if (maxReady && inRange(index, view.maxStart, view.maxEnd)) classes.push("in-max");
    if (minReady && inRange(index, view.minStart, view.minEnd)) classes.push("in-min");
    const badges = [];
    if (maxReady && index === view.maxEnd) badges.push('<b class="max">MAX</b>');
    if (minReady && index === view.minEnd) badges.push('<b class="min">MIN</b>');
    if (index === view.bestEnd) badges.push('<b class="best">BEST</b>');
    if (index === view.upcomingNegativeIndex) badges.push(`<b class="soon">${vi ? "ÂM SẮP TỚI" : "NEG NEXT"}</b>`);
    return `<div class="${classes.join(" ")}">
      <small>[${index}]</small><strong>${escapeHtml(String(value))}</strong>
      <div><span>max ${escapeHtml(display(view.maxHistory[index]))}</span><span>min ${escapeHtml(display(view.minHistory[index]))}</span></div>
      <em>${badges.join("")}</em>
    </div>`;
  }).join("");

  // Step 1 explains the meaning of both DP states before any arithmetic.
  const meaning = `<section class="mps152-meaning">
    <div class="max"><small>cur_max</small><strong>${escapeHtml(display(view.curMax))}</strong><span>${vi ? "tích LỚN NHẤT của một subarray kết thúc đúng tại i" : "LARGEST product of a subarray ending exactly at i"}</span><code>${escapeHtml(maxReady ? `${product(view.maxValues)} = ${display(view.curMax)}` : "—")}</code></div>
    <div class="min"><small>cur_min</small><strong>${escapeHtml(display(view.curMin))}</strong><span>${vi ? "tích NHỎ NHẤT kết thúc tại i — giữ để dùng khi gặp số âm" : "SMALLEST product ending at i — kept for a future negative"}</span><code>${escapeHtml(minReady ? `${product(view.minValues)} = ${display(view.curMin)}` : "—")}</code></div>
  </section>`;

  // Step 2 answers the real question: why keep a minimum at all?
  const hasPreview = Number.isInteger(view.upcomingNegativeIndex) && minReady;
  const minFlipsToBest = hasPreview && Number(view.minFlipPreview) > Number(view.maxFlipPreview);
  const whyMin = `<section class="mps152-why ${minFlipsToBest ? "critical" : ""}">
    <header><strong>${vi ? "VÌ SAO PHẢI GIỮ cur_min?" : "WHY KEEP cur_min?"}</strong><span>${vi ? "âm × âm = dương" : "negative × negative = positive"}</span></header>
    ${hasPreview
      ? `<div class="mps152-preview">
          <span><small>cur_min</small><b>${escapeHtml(display(view.curMin))}</b></span><i>×</i>
          <span><small>nums[${view.upcomingNegativeIndex}]</small><b>${escapeHtml(display(view.upcomingNegativeValue))}</b></span><em>=</em>
          <span class="${minFlipsToBest ? "win" : ""}"><small>${vi ? "SẼ THÀNH" : "WILL BECOME"}</small><b>${escapeHtml(display(view.minFlipPreview))}</b></span>
          <span class="versus"><small>${vi ? "nếu chỉ dùng cur_max" : "if only cur_max"}</small><b>${escapeHtml(display(view.maxFlipPreview))}</b></span>
          <p>${minFlipsToBest
            ? escapeHtml(vi ? `Tại index ${view.upcomingNegativeIndex}, cur_min hiện tại sẽ tạo tích lớn hơn cur_min bị bỏ qua. Đây chính là lý do phải lưu cả min.` : `At index ${view.upcomingNegativeIndex}, today's cur_min produces the larger product. That is exactly why min must be stored.`)
            : escapeHtml(vi ? `Lần này cur_max thắng, nhưng cur_min vẫn phải giữ vì ta không biết trước dấu của các số sau.` : `cur_max wins this time, but cur_min must still be kept because future signs are unknown.`)}</p>
        </div>`
      : `<div class="mps152-preview none"><p>${escapeHtml(vi ? "Không còn số âm nào phía sau, nên cur_min không thể lật thành đáp án nữa." : "No negative numbers remain, so cur_min can no longer flip into the answer.")}</p></div>`}
  </section>`;

  // Step 3 makes the swap concrete instead of abstract.
  let signClass = "positive";
  let signTitle;
  let signDetail;
  if (view.zeroReset) {
    signClass = "zero";
    signTitle = vi ? "x = 0 → RESET" : "x = 0 → RESET";
    signDetail = vi ? "Mọi tích đi qua 0 đều bằng 0, nên hai nhánh phải bắt đầu lại." : "Every product crossing zero becomes 0, so both lanes restart.";
  } else if (Number(x) < 0) {
    signClass = "negative";
    signTitle = view.swapped ? (vi ? "ĐÃ ĐỔI VAI TRÒ" : "ROLES SWAPPED") : (vi ? "x < 0 → SẮP ĐỔI VAI TRÒ" : "x < 0 → ROLES WILL SWAP");
    signDetail = vi
      ? "Nhân số âm làm đảo thứ tự, nên nhánh MAX phải xuất phát từ min cũ."
      : "Multiplying by a negative reverses order, so the MAX lane must start from the old min.";
  } else {
    signTitle = vi ? "x > 0 → GIỮ NGUYÊN VAI TRÒ" : "x > 0 → ROLES UNCHANGED";
    signDetail = vi ? "Số dương giữ thứ tự: MAX nối max cũ, MIN nối min cũ." : "A positive value preserves order: MAX extends old max, MIN extends old min.";
  }
  const swapPanel = phase === "init" ? "" : `<section class="mps152-sign ${signClass} ${["sign", "swap"].includes(phase) ? "active" : ""}">
    <div class="mps152-sign-head"><strong>${escapeHtml(signTitle)}</strong><span>${escapeHtml(signDetail)}</span></div>
    <div class="mps152-sign-table">
      <span class="head"></span><span class="head">${vi ? "trước" : "before"}</span><span class="head">${vi ? "nền của MAX" : "base of MAX"}</span><span class="head">${vi ? "nền của MIN" : "base of MIN"}</span>
      <b>max</b><span>${escapeHtml(display(view.prevMax))}</span><span class="${view.swapped ? "" : "used"}">${view.swapped ? "—" : escapeHtml(display(view.prevMax))}</span><span class="${view.swapped ? "used" : ""}">${view.swapped ? escapeHtml(display(view.prevMax)) : "—"}</span>
      <b>min</b><span>${escapeHtml(display(view.prevMin))}</span><span class="${view.swapped ? "used" : ""}">${view.swapped ? escapeHtml(display(view.prevMin)) : "—"}</span><span class="${view.swapped ? "" : "used"}">${view.swapped ? "—" : escapeHtml(display(view.prevMin))}</span>
    </div>
  </section>`;

  // Step 4 shows the two competing candidates with explicit WIN/LOSE text.
  const laneHtml = (kind) => {
    const isMax = kind === "max";
    const ready = isMax ? maxReady : minReady;
    const base = isMax ? view.maxBase : view.minBase;
    const baseValues = isMax
      ? (view.swapped ? view.prevMinValues : view.prevMaxValues)
      : (view.swapped ? view.prevMaxValues : view.prevMinValues);
    const extended = isMax ? view.extendMax : view.extendMin;
    const selected = isMax ? view.curMax : view.curMin;
    const start = isMax ? view.maxStart : view.minStart;
    const end = isMax ? view.maxEnd : view.minEnd;
    const picked = isMax ? view.maxPick : view.minPick;
    const rule = isMax ? "max" : "min";
    const title = isMax
      ? (vi ? "MAX kết thúc tại i" : "MAX ending at i")
      : (vi ? "MIN kết thúc tại i" : "MIN ending at i");
    if (phase === "init") {
      return `<section class="mps152-lane ${kind} active"><header><strong>${title}</strong><span>nums[0..0]</span></header><div class="mps152-initial">${escapeHtml(display(selected))}</div><footer>${vi ? "chỉ có một subarray" : "only one subarray"}</footer></section>`;
    }
    const winText = vi ? "CHỌN ✓" : "WIN ✓";
    const loseText = vi ? "BỎ" : "LOSE";
    return `<section class="mps152-lane ${kind} ${phase === kind ? "active" : ""}">
      <header><strong>${title}</strong><code>${rule}(x, base × x)</code></header>
      <div class="mps152-candidates">
        <div class="${ready && picked === "restart" ? "won" : ready ? "lost" : ""}">
          <small>A · ${vi ? "BẮT ĐẦU LẠI" : "RESTART"}</small>
          <b>${escapeHtml(display(x))}</b>
          <span>${escapeHtml(vi ? `chỉ lấy nums[${i}]` : `take only nums[${i}]`)}</span>
          <em>${ready ? (picked === "restart" ? winText : loseText) : "?"}</em>
        </div>
        <div class="${ready && picked === "extend" ? "won" : ready ? "lost" : ""}">
          <small>B · ${vi ? "NỐI TIẾP" : "EXTEND"}</small>
          <b>${escapeHtml(display(base))} × ${escapeHtml(display(x))} = ${escapeHtml(display(extended))}</b>
          <span>${escapeHtml(Array.isArray(baseValues) && baseValues.length ? `${product(baseValues)} × ${display(x)}` : vi ? "nối vào đoạn trước" : "append to previous run")}</span>
          <em>${ready ? (picked === "extend" ? winText : loseText) : "?"}</em>
        </div>
      </div>
      <footer><span>${ready ? `nums[${start}..${end}]` : (vi ? "chờ dòng cập nhật" : "waiting for update line")}</span><strong>${rule} = ${ready ? escapeHtml(display(selected)) : "?"}</strong></footer>
    </section>`;
  };

  // Approach 2 and 3 replace the swap story with one explicit 3-candidate comparison.
  const approach = Number(view.approach) || 1;
  const candidateList = Array.isArray(view.candidates) ? view.candidates : [];
  const candidateNames = vi
    ? { alone: "chỉ lấy phần tử hiện tại", "max-prev": "nối vào MAX trước đó", "min-prev": "nối vào MIN trước đó" }
    : { alone: "take the current element alone", "max-prev": "extend the previous MAX", "min-prev": "extend the previous MIN" };
  const triple = candidateList.length
    ? `<section class="mps152-triple">
        <header><strong>${vi ? "BỘ BA ỨNG VIÊN" : "THE THREE CANDIDATES"}</strong><span>${vi ? "tính hết trước, rồi mới lấy max và min" : "compute all first, then take max and min"}</span></header>
        <div>${candidateList.map((candidate, index) => {
          const isMax = index === view.maxPickIndex;
          const isMin = index === view.minPickIndex;
          const tags = [];
          if (isMax) tags.push(`<b class="max">${vi ? "→ max_curr" : "→ max_curr"}</b>`);
          if (isMin) tags.push(`<b class="min">${vi ? "→ min_curr" : "→ min_curr"}</b>`);
          return `<div class="${[isMax ? "is-max" : "", isMin ? "is-min" : "", !isMax && !isMin ? "unused" : ""].filter(Boolean).join(" ")}">
            <small>${index + 1} · ${escapeHtml(candidate.label || "")}</small>
            <b>${escapeHtml(String(candidate.expression || ""))}</b>
            <strong>${escapeHtml(display(candidate.value))}</strong>
            <span>${escapeHtml(candidateNames[candidate.key] || "")}</span>
            <em>${tags.join("") || (vi ? "không được chọn" : "not selected")}</em>
          </div>`;
        }).join("")}</div>
        <footer>${escapeHtml(vi
          ? "Cùng một bộ ba cho cả max và min, nên không cần luật swap theo dấu."
          : "The same tuple feeds both max and min, so no sign-based swap rule is needed.")}</footer>
      </section>`
    : "";

  const dpTable = approach === 3 && Array.isArray(view.maxDp)
    ? `<section class="mps152-dp">
        <header><strong>${vi ? "BẢNG DP" : "DP TABLES"}</strong><span>${vi ? "max_dp[i] và min_dp[i] = tích lớn nhất / nhỏ nhất kết thúc tại i" : "max_dp[i] and min_dp[i] = largest / smallest product ending at i"}</span></header>
        <div class="mps152-dp-scroll"><table>
          <tr><th>i</th>${nums.map((_, index) => `<th class="${index === i ? "active" : ""}">${index}</th>`).join("")}</tr>
          <tr><th>nums</th>${nums.map((value, index) => `<td class="${index === i ? "active" : ""}">${escapeHtml(String(value))}</td>`).join("")}</tr>
          <tr><th>max_dp</th>${view.maxDp.map((value, index) => `<td class="max ${index === i ? "active" : ""} ${index === view.bestIndex && value !== null ? "argmax" : ""}">${escapeHtml(display(value))}</td>`).join("")}</tr>
          <tr><th>min_dp</th>${(view.minDp || []).map((value, index) => `<td class="min ${index === i ? "active" : ""}">${escapeHtml(display(value))}</td>`).join("")}</tr>
        </table></div>
        <footer>${escapeHtml(vi
          ? `Đáp án = max(max_dp) = ô max_dp[${display(view.bestIndex)}] = ${display(view.best)}. Bộ nhớ O(n) là điểm khác duy nhất so với cách 2.`
          : `Answer = max(max_dp) = cell max_dp[${display(view.bestIndex)}] = ${display(view.best)}. The O(n) memory is the only difference from approach 2.`)}</footer>
      </section>`
    : "";

  const bestExpression = Array.isArray(view.bestValues) && view.bestValues.length
    ? `${product(view.bestValues)} = ${display(view.best)}`
    : display(view.best);
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const approachLabels = vi
    ? { 1: "CÁCH 1 · SWAP KHI ÂM", 2: "CÁCH 2 · 3 ỨNG VIÊN", 3: "CÁCH 3 · BẢNG DP" }
    : { 1: "APPROACH 1 · SWAP ON NEGATIVE", 2: "APPROACH 2 · THREE CANDIDATES", 3: "APPROACH 3 · DP TABLES" };
  const summary = vi
    ? `Bài 152, cách ${approach}, index ${i}, cur max ${view.curMax}, cur min ${view.curMin}, best ${view.best}`
    : `Problem 152, approach ${approach}, index ${i}, current max ${view.curMax}, current min ${view.curMin}, best ${view.best}`;
  const bestLabel = approach === 3 ? "max(max_dp)" : approach === 2 ? "ans" : "GLOBAL BEST";

  $("treeView").innerHTML = `<section class="mps152-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="mps152-approach approach-${approach}">${escapeHtml(approachLabels[approach] || approachLabels[1])}</div>
    <div class="mps152-phases">${phases}</div>
    <div class="mps152-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    ${meaning}
    <section class="mps152-array"><header><strong>${approach === 3 ? "nums + max_dp/min_dp" : "nums + DP history"}</strong><span>${vi ? "vàng = best · xanh = đoạn của MAX · tím = đoạn của MIN" : "gold = best · blue = MAX run · purple = MIN run"}</span></header><div class="mps152-cells">${cells}</div></section>
    ${approach === 1 ? swapPanel : ""}
    ${approach === 1 ? `<div class="mps152-lanes">${laneHtml("max")}${laneHtml("min")}</div>` : triple}
    ${dpTable}
    ${approach === 3 ? "" : whyMin}
    <section class="mps152-best ${view.bestUpdated ? "updated" : ""}">
      <div><small>${escapeHtml(bestLabel)}</small><strong>${escapeHtml(display(view.best))}</strong><span>${view.bestUpdated ? (vi ? "BEST MỚI ✓" : "NEW BEST ✓") : (vi ? "giữ nguyên" : "unchanged")}</span></div>
      <code>${escapeHtml(bestExpression)}</code><em>nums[${escapeHtml(display(view.bestStart))}..${escapeHtml(display(view.bestEnd))}]</em>
    </section>
  </section>`;
}

function renderProductSubarrayView(step) {
  const view = step.productSubarrayView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const vi = lang === "vi";
  const phase = String(view.phase || "guard");
  const phaseIndex = phase === "done" ? 3
    : phase === "count" ? 2
      : ["too-large", "divide", "shrink"].includes(phase) ? 1
        : 0;
  const labels = vi
    ? ["Nhân nums[right]", "Chia nums[left]", "Đếm suffix mới", "Kết quả"]
    : ["Multiply nums[right]", "Divide nums[left]", "Count new suffixes", "Result"];
  const phases = labels.map((label, index) => {
    const done = phase === "done" || index < phaseIndex;
    return `<span class="${done ? "done" : index === phaseIndex ? "active" : ""}">${done ? "✓" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const right = Number.isInteger(view.right) && view.right < nums.length ? view.right : null;
  const left = Number.isInteger(view.left) ? view.left : 0;
  const removedIndex = Number.isInteger(view.removedIndex) ? view.removedIndex : null;
  const hasWindow = right !== null && left <= right;
  const inWindow = (index) => hasWindow && index >= left && index <= right;
  const cells = nums.map((value, index) => {
    const classes = ["psa713-cell"];
    if (inWindow(index)) classes.push("in-window");
    if (index === left && hasWindow) classes.push("left-edge");
    if (index === right) classes.push("right-edge");
    if (index === removedIndex) classes.push("removed");
    const pointers = [];
    if (index === left && hasWindow) pointers.push("L");
    if (index === right) pointers.push("R");
    return `<div class="${classes.join(" ")}" aria-label="nums[${index}] = ${escapeHtml(String(value))}"><small>index ${index}</small><strong>${escapeHtml(String(value))}</strong><span>${pointers.map((pointer) => `<b>${pointer}</b>`).join("")}</span></div>`;
  }).join("");
  const activeValues = nums.filter((_, index) => inWindow(index) && index !== removedIndex);
  const expression = activeValues.length ? activeValues.join(" × ") : "1";
  const product = Number(view.product) || 0;
  const k = Number(view.k) || 0;
  const valid = k > 1 && product < k;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const subarrays = Array.isArray(view.newSubarrays) ? view.newSubarrays : [];
  const hiddenSubarrays = Math.max(0, (Number(view.added) || 0) - subarrays.length);
  const subarrayHtml = subarrays.length
    ? subarrays.map((item) => `<span><small>[${item.left}..${item.right}]</small><strong>[${escapeHtml(item.values.join(", "))}]</strong><em>product ${escapeHtml(String(item.product))}</em></span>`).join("")
    : `<i>${vi ? "Sau khi product < k, các suffix kết thúc tại right sẽ xuất hiện ở đây." : "Once product < k, suffixes ending at right appear here."}</i>`;
  const statusClass = phase === "done" ? "done"
    : ["too-large", "divide", "shrink"].includes(phase) ? "shrink"
      : phase === "count" ? "count" : valid ? "valid" : "expand";
  const statusLabel = phase === "done" ? (vi ? "HOÀN TẤT" : "DONE")
    : ["too-large", "divide", "shrink"].includes(phase) ? `product >= k · ${vi ? "CO LEFT" : "SHRINK LEFT"}`
      : phase === "count" ? `+${view.added} ${vi ? "SUBARRAY" : "SUBARRAYS"}`
        : valid ? "product < k" : (vi ? "MỞ RỘNG RIGHT" : "EXPAND RIGHT");
  const statusDetail = phase === "count"
    ? (vi ? `Giữ right=${right}; chọn start bất kỳ từ ${left} đến ${right}.` : `Fix right=${right}; choose any start from ${left} through ${right}.`)
    : ["too-large", "divide", "shrink"].includes(phase)
      ? (vi ? "Bỏ nums[left] vì mọi số đều dương nên phép chia làm tích giảm." : "Remove nums[left]; all values are positive, so division decreases the product.")
      : phase === "done" ? (vi ? `Tổng số subarray hợp lệ = ${view.count}` : `Total valid subarrays = ${view.count}`)
        : (vi ? "Thêm nums[right] để xét các subarray kết thúc tại vị trí mới." : "Add nums[right] to inspect subarrays ending at the new position.");

  $("treeView").innerHTML = `<div class="psa713-viz phase-${escapeHtml(phase)}">
    <div class="psa713-phases">${phases}</div>
    <div class="psa713-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="psa713-array"><header><strong>nums</strong><span>${vi ? "viền xanh = cửa sổ product < k · đỏ = đang loại" : "blue border = product < k window · red = being removed"}</span></header><div class="psa713-scroll"><div class="psa713-cells">${cells}</div></div></section>
    <div class="psa713-equation"><small>${vi ? "TÍCH CỬA SỔ" : "WINDOW PRODUCT"}</small><code>${escapeHtml(expression)} = ${escapeHtml(String(product))}</code><strong>${escapeHtml(String(product))} ${valid ? "<" : ">="} ${escapeHtml(String(k))}</strong></div>
    <div class="psa713-status ${statusClass}"><small>${escapeHtml(statusLabel)}</small><strong>${escapeHtml(statusDetail)}</strong></div>
    <div class="psa713-metrics"><span><small>PRODUCT / K</small><strong>${escapeHtml(String(product))} / ${escapeHtml(String(k))}</strong></span><span><small>${vi ? "MỚI THÊM" : "JUST ADDED"}</small><strong>+${escapeHtml(String(view.added || 0))}</strong></span><span class="total"><small>COUNT</small><strong>${escapeHtml(String(view.count || 0))}</strong></span></div>
    <section class="psa713-new"><header><strong>${vi ? `SUBARRAY MỚI KẾT THÚC TẠI right=${right ?? "—"}` : `NEW SUBARRAYS ENDING AT right=${right ?? "—"}`}</strong><span>right - left + 1 = ${escapeHtml(String(view.added || 0))}</span></header><div>${subarrayHtml}${hiddenSubarrays ? `<b class="psa713-more">+${hiddenSubarrays} ${vi ? "đoạn khác" : "more"}</b>` : ""}</div></section>
  </div>`;
}

function renderMinimumSubarrayView(step) {
  const view = step.minimumSubarrayView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const vi = lang === "vi";
  const phase = String(view.phase || "init");
  const phaseIndex = phase === "done" ? 3
    : ["record", "remove", "shrink"].includes(phase) ? 2
      : ["eligible"].includes(phase) ? 1
        : 0;
  const phaseLabels = vi
    ? ["Mở rộng right", "Đủ target", "Lưu best + co left", "Kết quả"]
    : ["Expand right", "Reach target", "Save best + shrink left", "Result"];
  const phases = phaseLabels.map((label, index) => {
    const done = phase === "done" || index < phaseIndex;
    return `<span class="${done ? "done" : index === phaseIndex ? "active" : ""}">${done ? "✓" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const currentRight = Number.isInteger(view.right) && view.right < nums.length ? view.right : null;
  const currentLeft = Number.isInteger(view.left) ? view.left : 0;
  const removedIndex = Number.isInteger(view.removedIndex) ? view.removedIndex : null;
  const hasWindow = currentRight !== null && currentLeft <= currentRight;
  const inCurrent = (index) => hasWindow && index >= currentLeft && index <= currentRight;
  const inBest = (index) => Number.isInteger(view.bestLeft) && Number.isInteger(view.bestRight)
    && index >= view.bestLeft && index <= view.bestRight;
  const cells = nums.map((value, index) => {
    const classes = ["msa209-cell"];
    if (inCurrent(index)) classes.push("in-window");
    if (inBest(index)) classes.push("in-best");
    if (index === currentRight) classes.push("right-edge");
    if (index === currentLeft && hasWindow) classes.push("left-edge");
    if (index === removedIndex) classes.push("removed");
    const pointers = [];
    if (index === currentLeft && hasWindow) pointers.push("L");
    if (index === currentRight) pointers.push("R");
    return `<div class="${classes.join(" ")}" aria-label="nums[${index}] = ${escapeHtml(String(value))}">
      <small>index ${index}</small><strong>${escapeHtml(String(value))}</strong>
      <span>${pointers.map((pointer) => `<b>${pointer}</b>`).join("")}</span>
    </div>`;
  }).join("");

  const activeValues = nums.filter((_, index) => inCurrent(index) && index !== removedIndex);
  const expression = activeValues.length ? activeValues.join(" + ") : "0";
  const currentLength = hasWindow
    ? Math.max(0, currentRight - currentLeft + 1 - (removedIndex === currentLeft ? 1 : 0))
    : 0;
  const minLenText = view.minLen === null || view.minLen === undefined ? "∞" : String(view.minLen);
  const target = Number(view.target) || 0;
  const total = Number(view.total) || 0;
  const valid = total >= target;
  const progress = target > 0 ? Math.max(0, Math.min(100, Math.round((total / target) * 100))) : 100;
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const shrinking = ["remove", "shrink"].includes(phase);
  const statusClass = phase === "done" ? "done" : shrinking ? "remove" : view.improved ? "new-best" : valid ? "valid" : "need-more";
  const statusText = phase === "done" ? (vi ? "HOÀN TẤT" : "DONE")
    : shrinking ? (vi ? "CO CỬA SỔ" : "SHRINK WINDOW")
      : view.improved ? (vi ? "KỶ LỤC MỚI" : "NEW BEST")
        : valid ? (vi ? "ĐỦ TARGET" : "TARGET REACHED")
          : (vi ? "CHƯA ĐỦ · MỞ RỘNG" : "NOT ENOUGH · EXPAND");
  const statusInstruction = phase === "done"
    ? (view.minLen === null ? (vi ? "Không tìm thấy đoạn hợp lệ" : "No valid window found") : (vi ? `Độ dài nhỏ nhất = ${view.minLen}` : `Minimum length = ${view.minLen}`))
    : shrinking
      ? (vi ? "Bỏ phần tử trái, tăng left rồi kiểm tra lại" : "Remove the leftmost value, advance left, then check again")
      : valid
        ? (vi ? "Ghi nhận độ dài, rồi bỏ phần tử bên trái" : "Record its length, then remove the leftmost value")
        : (vi ? "Thêm số dương tiếp theo ở bên phải" : "Add the next positive value on the right");
  const bestValues = Number.isInteger(view.bestLeft) && Number.isInteger(view.bestRight)
    ? nums.slice(view.bestLeft, view.bestRight + 1)
    : [];
  const bestRange = bestValues.length ? `[${view.bestLeft}..${view.bestRight}]` : "—";

  $("treeView").innerHTML = `<div class="msa209-viz phase-${escapeHtml(phase)}">
    <div class="msa209-phases">${phases}</div>
    <div class="msa209-debug"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <section class="msa209-array"><header><strong>nums</strong><span>${vi ? "viền xanh = cửa sổ hiện tại · nền lục = đáp án tốt nhất" : "blue border = current window · green fill = best answer"}</span></header><div class="msa209-scroll"><div class="msa209-cells">${cells}</div></div></section>
    <div class="msa209-equation"><small>${vi ? "TỔNG CỬA SỔ" : "WINDOW SUM"}</small><code>${escapeHtml(expression)} = ${escapeHtml(String(total))}</code><div><i style="width:${progress}%"></i></div><span>${escapeHtml(String(total))} ${valid ? ">=" : "<"} ${escapeHtml(String(target))}</span></div>
    <div class="msa209-status ${statusClass}"><small>${escapeHtml(statusText)}</small><strong>${escapeHtml(statusInstruction)}</strong></div>
    <div class="msa209-metrics"><span><small>TOTAL / TARGET</small><strong>${escapeHtml(String(total))} / ${escapeHtml(String(target))}</strong></span><span><small>${vi ? "ĐỘ DÀI HIỆN TẠI" : "CURRENT LENGTH"}</small><strong>${currentLength}</strong></span><span class="best"><small>MIN_LEN</small><strong>${escapeHtml(minLenText)}</strong></span></div>
    <div class="msa209-best"><small>${vi ? "ĐÁP ÁN TỐT NHẤT ĐÃ TÌM THẤY" : "BEST ANSWER FOUND SO FAR"}</small><strong>${escapeHtml(bestRange)}</strong><code>${bestValues.length ? `[${escapeHtml(bestValues.join(", "))}]` : "—"}</code></div>
  </div>`;
}

function renderTwoSubarrays1477View(step) {
  const view = step.twoSubarrays1477View || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const best = Array.isArray(view.best) ? view.best : [];
  const vi = lang === "vi";
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Khởi tạo", "Trượt cửa sổ", "Tìm đoạn target", "Ghép đoạn trái", "Lưu best prefix", "Kết quả"]
    : ["Initialize", "Slide window", "Find target segment", "Pair left segment", "Save prefix best", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const inSegment = (index, segment) => Boolean(segment) && index >= segment.left && index <= segment.right;
  const bestPair = view.bestPair || null;
  const candidatePair = view.candidatePair || null;
  const current = view.currentSegment || null;
  const previous = view.previousSegment || null;
  const hasWindow = Number.isInteger(view.left) && Number.isInteger(view.right) && view.left <= view.right;
  const cells = nums.map((value, index) => {
    const classes = ["ts1477-cell"];
    if (hasWindow && index >= view.left && index <= view.right) classes.push("window");
    if (inSegment(index, current)) classes.push("current-segment");
    if (inSegment(index, previous)) classes.push("previous-segment");
    if (bestPair && inSegment(index, bestPair.first)) classes.push("pair-first");
    if (bestPair && inSegment(index, bestPair.second)) classes.push("pair-second");
    if (index === view.removedIndex) classes.push("removed");
    const pointers = [];
    if (hasWindow && index === view.left) pointers.push("L");
    if (index === view.right) pointers.push("R");
    return `<span class="${classes.join(" ")}"><small>[${index}]</small><strong>${escapeHtml(String(value))}</strong><em>${pointers.join(" · ")}</em></span>`;
  }).join("");

  const bestCells = nums.map((_, index) => {
    const value = best[index];
    const lookup = Number.isInteger(view.left) && view.left > 0 && index === view.left - 1;
    const currentIndex = index === view.right;
    return `<span class="${lookup ? "lookup" : ""}${currentIndex ? " current" : ""}"><small>best[${index}]</small><strong>${value === null || value === undefined ? "∞" : escapeHtml(String(value))}</strong><em>${lookup ? (vi ? "TRA CỨU" : "LOOKUP") : currentIndex ? (vi ? "GHI" : "WRITE") : ""}</em></span>`;
  }).join("");

  const segmentCard = (segment, label, kind) => segment
    ? `<article class="${kind}"><small>${escapeHtml(label)}</small><strong>[${segment.left}..${segment.right}]</strong><code>${nums.slice(segment.left, segment.right + 1).map(value => escapeHtml(String(value))).join(" + ")} = ${escapeHtml(String(view.target))}</code><span>length = ${segment.length}</span></article>`
    : `<article class="${kind} empty"><small>${escapeHtml(label)}</small><strong>—</strong><span>${vi ? "chưa có" : "not found yet"}</span></article>`;
  const firstForPair = candidatePair ? candidatePair.first : bestPair ? bestPair.first : previous;
  const secondForPair = candidatePair ? candidatePair.second : bestPair ? bestPair.second : current;
  const pairLength = candidatePair ? candidatePair.totalLength : bestPair ? bestPair.totalLength : null;
  const pairState = candidatePair ? "candidate" : bestPair ? "best" : "empty";
  const pairHtml = `${segmentCard(firstForPair, vi ? "ĐOẠN TRÁI TỪ best[left−1]" : "LEFT SEGMENT FROM best[left−1]", "first")}<b class="ts1477-plus">+</b>${segmentCard(secondForPair, vi ? "ĐOẠN HIỆN TẠI" : "CURRENT SEGMENT", "second")}<b class="ts1477-equals">=</b><article class="ts1477-total ${pairState}"><small>${vi ? "TỔNG ĐỘ DÀI" : "TOTAL LENGTH"}</small><strong>${pairLength === null ? "∞" : escapeHtml(String(pairLength))}</strong><span>${firstForPair && secondForPair ? `${firstForPair.length} + ${secondForPair.length}` : (vi ? "cần đủ hai đoạn" : "two segments required")}</span></article>`;

  const total = Number(view.total) || 0;
  const target = Number(view.target) || 0;
  const compare = total === target ? "=" : total > target ? ">" : "<";
  const status = view.final
    ? (view.answer === -1 ? (vi ? "KHÔNG CÓ CẶP HỢP LỆ" : "NO VALID PAIR") : (vi ? "CẶP TỐT NHẤT" : "BEST PAIR"))
    : total === target ? (vi ? "TÌM THẤY MỘT ĐOẠN" : "TARGET SEGMENT FOUND")
      : total > target ? (vi ? "CO CẠNH TRÁI" : "SHRINK LEFT")
        : (vi ? "MỞ RỘNG CẠNH PHẢI" : "EXPAND RIGHT");
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : "—";

  $("treeView").innerHTML = `<section class="ts1477-viz phase-${escapeHtml(String(view.phase || "initialize"))}" role="img" aria-label="LeetCode 1477 visualization">
    <header><div><small>SLIDING WINDOW + PREFIX BEST · #1477</small><strong>${vi ? "HAI ĐOẠN TARGET KHÔNG CHỒNG LẤN" : "TWO NON-OVERLAPPING TARGET SEGMENTS"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ts1477-phases">${phases}</div>
    <section class="ts1477-rule"><strong>${vi ? "MẤU CHỐT KHÔNG CHỒNG LẤN" : "NON-OVERLAP KEY"}</strong><code>current = [left..right]</code><b>+</b><code>previous = best[left − 1]</code><span>${vi ? "Đoạn trước kết thúc trước left, nên không thể đè lên đoạn hiện tại." : "The previous segment ends before left, so it cannot overlap the current one."}</span></section>
    <section class="ts1477-array"><header><strong>arr</strong><span>${vi ? "xanh = window · tím = đoạn trái · cam = đoạn hiện tại" : "blue = window · purple = left segment · amber = current segment"}</span></header><div>${cells || `<em>${vi ? "mảng rỗng" : "empty array"}</em>`}</div></section>
    <section class="ts1477-window"><div><small>WINDOW</small><strong>${hasWindow ? `[${view.left}..${view.right}]` : "∅"}</strong></div><div><small>TOTAL</small><strong>${escapeHtml(String(total))}</strong></div><div class="compare"><small>CHECK</small><strong>${escapeHtml(String(total))} ${compare} ${escapeHtml(String(target))}</strong></div><div><small>BEST SO FAR</small><strong>${view.bestSoFar === null || view.bestSoFar === undefined ? "∞" : escapeHtml(String(view.bestSoFar))}</strong></div></section>
    <section class="ts1477-status"><small>${escapeHtml(status)}</small><strong>${escapeHtml(pick(step.note))}</strong></section>
    <section class="ts1477-best"><header><strong>best[i]</strong><span>${vi ? "độ dài target ngắn nhất nằm trong prefix [0..i]" : "shortest target segment contained in prefix [0..i]"}</span></header><div>${bestCells || `<em>—</em>`}</div></section>
    <section class="ts1477-pair"><header><strong>${vi ? "GHÉP HAI ĐOẠN" : "PAIR THE TWO SEGMENTS"}</strong><span>best[left − 1] + current length</span></header><div>${pairHtml}</div></section>
    <section class="ts1477-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="ts1477-result ${view.final ? "done" : ""}"><small>ANS</small><strong>${view.final ? escapeHtml(String(view.answer)) : bestPair ? escapeHtml(String(bestPair.totalLength)) : "∞"}</strong><span>${view.final ? (view.answer === -1 ? (vi ? "Không tìm thấy hai đoạn phù hợp." : "No matching pair was found.") : (vi ? "Tổng độ dài nhỏ nhất của hai đoạn." : "Minimum total length of the two segments.")) : (vi ? "ans chỉ cập nhật khi ghép được hai đoạn tách rời." : "ans updates only after two separated segments can be paired.")}</span></footer>
  </section>`;
}

function renderAverageWindowView(step) {
  const view = step.averageWindowView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const k = Number(view.k) || 1;
  const vi = lang === "vi";
  const phaseIndex = { initialize: 0, slide: 1, compare: 2, done: 3 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Tạo cửa sổ đầu", "2 · OUT trái · IN phải", "3 · So với max_sum"]
    : ["1 · Build first window", "2 · OUT left · IN right", "3 · Compare with max_sum"];
  const phases = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < phaseIndex;
    const state = done ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${done ? "✓" : index === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const inRange = (index, left, right) => (
    Number.isInteger(left) && Number.isInteger(right) && index >= left && index <= right
  );
  const format = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
    return String(Number(Number(value).toFixed(5)));
  };
  const maxMagnitude = Math.max(1, ...nums.map((value) => Math.abs(Number(value) || 0)));
  const cells = nums.map((value, index) => {
    const classes = ["avg643-cell"];
    if (inRange(index, view.currentLeft, view.currentRight)) classes.push("current-window");
    if (["advance", "calculate-slide"].includes(view.event) && inRange(index, view.nextLeft, view.nextRight)) classes.push("next-window");
    if (inRange(index, view.bestLeft, view.bestRight)) classes.push("best-window");
    if (index === view.outgoingIndex) classes.push("outgoing");
    if (index === view.incomingIndex) classes.push("incoming");
    const markers = [];
    if (index === view.outgoingIndex) markers.push("OUT");
    if (index === view.incomingIndex) markers.push("IN");
    if (index === view.currentLeft) markers.push("L");
    if (index === view.currentRight) markers.push("R");
    const magnitude = Math.max(7, Math.round((Math.abs(value) / maxMagnitude) * 42));
    return `<div class="${classes.join(" ")}" aria-label="nums[${index}] = ${escapeHtml(String(value))}">
      <div class="avg643-markers">${markers.map((marker) => `<span>${marker}</span>`).join("")}</div>
      <div class="avg643-index">[${index}]</div>
      <div class="avg643-bar-zone"><i class="${value < 0 ? "negative" : "positive"}" style="--avg643-bar:${magnitude}%"></i><b>${escapeHtml(String(value))}</b></div>
    </div>`;
  }).join("");

  const initialValues = nums.slice(0, k);
  const signedExpression = initialValues.map((value, index) => {
    if (index === 0) return String(value);
    return value < 0 ? `− ${Math.abs(value)}` : `+ ${value}`;
  }).join(" ");
  let actionHtml;
  if (view.event === "enter") {
    actionHtml = `<div class="avg643-formula"><small>${vi ? "MỤC TIÊU" : "GOAL"}</small><strong>${vi ? `Tìm tổng lớn nhất trong mọi cửa sổ dài ${k}` : `Find the largest sum among all length-${k} windows`}</strong></div>`;
  } else if (view.event === "select-initial") {
    actionHtml = `<div class="avg643-formula"><small>${vi ? "CỬA SỔ ĐẦU" : "FIRST WINDOW"}</small><code>nums[:${k}] = [${escapeHtml(initialValues.join(", "))}]</code></div>`;
  } else if (view.event === "init-sum" || view.event === "init-max") {
    actionHtml = `<div class="avg643-formula"><small>${view.event === "init-sum" ? "window_sum" : "max_sum = window_sum"}</small><code>${escapeHtml(signedExpression)} = ${format(view.windowSum)}</code></div>`;
  } else if (view.event === "advance") {
    actionHtml = `<div class="avg643-move"><span class="out"><small>OUT</small><strong>nums[${view.outgoingIndex}]</strong><b>${escapeHtml(String(nums[view.outgoingIndex]))}</b></span><i>→</i><span class="in"><small>IN</small><strong>nums[${view.incomingIndex}]</strong><b>${escapeHtml(String(nums[view.incomingIndex]))}</b></span></div>`;
  } else if (["calculate-slide", "apply-slide"].includes(view.event) && view.operation) {
    actionHtml = `<div class="avg643-formula slide"><small>window_sum += IN − OUT</small><code>${format(view.operation.previousSum)} + (${format(view.operation.incomingValue)}) − (${format(view.operation.outgoingValue)}) = ${format(view.operation.result)}</code></div>`;
  } else if (["compare", "apply-max"].includes(view.event)) {
    const update = view.shouldUpdate === true;
    const candidateSum = view.windowSum;
    const recordSum = view.event === "apply-max" && update && view.evaluatedWindows.length > 1
      ? Math.max(...view.evaluatedWindows.slice(0, -1).map((window) => window.sum))
      : view.maxSum;
    actionHtml = `<div class="avg643-compare">
      <span><small>${vi ? "CỬA SỔ HIỆN TẠI" : "CURRENT WINDOW"}</small><strong>${format(candidateSum)}</strong><b>avg ${format(candidateSum / k)}</b></span>
      <div><code>${format(candidateSum)} ${update ? ">" : "≤"} ${format(recordSum)}</code><strong class="${update ? "update" : "keep"}">${update ? "UPDATE" : "KEEP"}</strong></div>
      <span><small>${vi ? "KỶ LỤC TRƯỚC" : "PREVIOUS RECORD"}</small><strong>${format(recordSum)}</strong><b>avg ${format(recordSum / k)}</b></span>
    </div>`;
  } else {
    actionHtml = `<div class="avg643-formula result"><small>return max_sum / k</small><code>${format(view.maxSum)} / ${k} = ${format(view.maxAverage)}</code></div>`;
  }

  const currentRange = Number.isInteger(view.currentLeft) ? `[${view.currentLeft}..${view.currentRight}]` : "—";
  const bestRange = Number.isInteger(view.bestLeft) ? `[${view.bestLeft}..${view.bestRight}]` : "—";
  const statsHtml = `<div class="avg643-stats">
    <span><small>${vi ? "CỬA SỔ HIỆN TẠI" : "CURRENT WINDOW"}</small><strong>${currentRange}</strong><b>sum ${format(view.windowSum)} · avg ${format(view.currentAverage)}</b></span>
    <span><small>${vi ? "CỬA SỔ TỐT NHẤT" : "BEST WINDOW"}</small><strong>${bestRange}</strong><b>max_sum ${format(view.maxSum)} · avg ${format(view.maxAverage)}</b></span>
  </div>`;
  const windows = Array.isArray(view.evaluatedWindows) ? view.evaluatedWindows : [];
  const ledgerHtml = windows.length
    ? windows.map((window, index) => `<span class="${window.isBest ? "best" : ""}${window.left === view.currentLeft && window.right === view.currentRight ? " current" : ""}"><small>#${index + 1} · [${window.left}..${window.right}]</small><strong>sum ${format(window.sum)}</strong><b>avg ${format(window.average)}</b>${window.isBest ? "<em>BEST</em>" : ""}</span>`).join("")
    : `<em>${vi ? "Chưa đánh giá cửa sổ" : "No evaluated window yet"}</em>`;

  $("treeView").innerHTML = `<div class="avg643-viz">
    <div class="avg643-phases">${phases}</div>
    <div class="avg643-rule"><strong>${vi ? `CỬA SỔ CỐ ĐỊNH k = ${k}` : `FIXED WINDOW k = ${k}`}</strong><span>window_sum(new) = window_sum(old) + IN − OUT</span></div>
    <div class="avg643-array">${cells}</div>
    <div class="avg643-legend"><span><i class="window"></i>${vi ? "cửa sổ hiện tại" : "current window"}</span><span><i class="out"></i>OUT</span><span><i class="in"></i>IN</span><span><i class="best"></i>best</span></div>
    ${actionHtml}
    ${statsHtml}
    <div class="avg643-history"><header><strong>${vi ? "CÁC CỬA SỔ ĐÃ ĐÁNH GIÁ" : "EVALUATED WINDOWS"}</strong><span>${vi ? "cùng độ dài nên so tổng là đủ" : "equal length, so comparing sums is enough"}</span></header><div>${ledgerHtml}</div></div>
  </div>`;
}

function renderPrefixAverageView(step) {
  const view = step.prefixAverageView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const k = Number(view.k) || 1;
  const vi = lang === "vi";
  const phaseIndex = { initialize: 0, build: 1, query: 2, done: 3 }[view.phase] ?? 0;
  const labels = vi
    ? ["1 · Đặt prefix[0] = 0", "2 · Dựng mảng prefix", "3 · Trừ hai mốc prefix"]
    : ["1 · Set prefix[0] = 0", "2 · Build the prefix array", "3 · Subtract two prefix marks"];
  const phases = labels.map((label, index) => {
    const done = view.phase === "done" || index < phaseIndex;
    const state = done ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${done ? "✓" : index === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const format = (value, empty = "—") => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return empty;
    return String(Number(Number(value).toFixed(5)));
  };
  const inWindow = (index) => (
    Number.isInteger(view.windowLeft)
    && Number.isInteger(view.windowRight)
    && index >= view.windowLeft
    && index < view.windowRight
  );
  const inBest = (index) => (
    Number.isInteger(view.bestLeft)
    && Number.isInteger(view.bestRight)
    && index >= view.bestLeft
    && index < view.bestRight
  );
  const numsHtml = nums.map((value, index) => {
    const classes = ["prefix643-cell", "num"];
    if (inWindow(index)) classes.push("window");
    if (inBest(index)) classes.push("best");
    if (index === view.activeNumIndex) classes.push("active");
    const markers = [];
    if (index === view.activeNumIndex) markers.push("num");
    if (index === view.windowLeft) markers.push("L");
    if (index === view.windowRight - 1) markers.push("R−1");
    return `<span class="${classes.join(" ")}"><small>nums[${index}]</small><strong>${escapeHtml(String(value))}</strong><em>${markers.join(" · ")}</em></span>`;
  }).join("");
  const prefixHtml = prefix.map((value, index) => {
    const classes = ["prefix643-cell", "prefix"];
    if (value !== null) classes.push("known");
    if (index === view.activePrefixFrom) classes.push("from");
    if (index === view.activePrefixTo) classes.push("to");
    if (index === view.windowLeft) classes.push("left-boundary");
    if (index === view.windowRight) classes.push("right-boundary");
    if (index === view.bestLeft || index === view.bestRight) classes.push("best-boundary");
    const marker = index === view.windowLeft
      ? "LEFT"
      : index === view.windowRight
        ? "RIGHT"
        : index === view.activePrefixFrom
          ? "FROM"
          : index === view.activePrefixTo
            ? "TO"
            : "";
    return `<span class="${classes.join(" ")}"><small>prefix[${index}]</small><strong>${value === null ? "_" : escapeHtml(String(value))}</strong><em>${marker}</em></span>`;
  }).join("");

  let actionHtml;
  if (view.event === "enter") {
    actionHtml = `<div class="prefix643-formula"><small>${vi ? "ĐỊNH NGHĨA" : "DEFINITION"}</small><strong>prefix[t] = sum(nums[0..t−1])</strong></div>`;
  } else if (view.event === "init-prefix") {
    actionHtml = `<div class="prefix643-formula"><small>${vi ? "MỐC GỐC" : "BASE MARK"}</small><code>prefix[0] = 0</code><span>${vi ? "0 phần tử có tổng bằng 0" : "zero values have sum zero"}</span></div>`;
  } else if (view.event === "prefix-loop") {
    actionHtml = `<div class="prefix643-build"><span><small>FROM</small><strong>prefix[${view.activePrefixFrom}] = ${format(prefix[view.activePrefixFrom])}</strong></span><b>+</b><span><small>NUM</small><strong>nums[${view.activeNumIndex}] = ${format(nums[view.activeNumIndex])}</strong></span><b>→</b><span><small>TO</small><strong>prefix[${view.activePrefixTo}] = ?</strong></span></div>`;
  } else if (view.event === "prefix-assign") {
    actionHtml = `<div class="prefix643-formula build"><small>prefix[i + 1] = prefix[i] + num</small><code>${format(prefix[view.activePrefixFrom])} + (${format(nums[view.activeNumIndex])}) = ${format(prefix[view.activePrefixTo])}</code></div>`;
  } else if (view.event === "init-record") {
    actionHtml = `<div class="prefix643-formula record"><small>${vi ? "KHỞI TẠO KỶ LỤC" : "INITIALIZE RECORD"}</small><code>max_sum = −∞</code></div>`;
  } else if (["window-loop", "window-sum"].includes(view.event)) {
    const hasSum = view.windowSum !== null;
    actionHtml = `<div class="prefix643-query">
      <span class="right"><small>RIGHT PREFIX</small><strong>prefix[${view.windowRight}]</strong><b>${format(prefix[view.windowRight])}</b></span>
      <div><code>${format(prefix[view.windowRight])} − ${format(prefix[view.windowLeft])}${hasSum ? ` = ${format(view.windowSum)}` : ""}</code><strong>${vi ? `nums[${view.windowLeft}..${view.windowRight - 1}]` : `nums[${view.windowLeft}..${view.windowRight - 1}]`}</strong></div>
      <span class="left"><small>LEFT PREFIX</small><strong>prefix[${view.windowLeft}]</strong><b>${format(prefix[view.windowLeft])}</b></span>
    </div>`;
  } else if (["compare", "apply-max"].includes(view.event)) {
    const update = view.shouldUpdate === true;
    const previous = view.recordBefore === null ? "−∞" : format(view.recordBefore);
    actionHtml = `<div class="prefix643-compare">
      <span><small>${vi ? "TỔNG CỬA SỔ" : "WINDOW SUM"}</small><strong>${format(view.windowSum)}</strong><b>avg ${format(view.currentAverage)}</b></span>
      <div><code>${format(view.windowSum)} ${update ? ">" : "≤"} ${previous}</code><strong class="${update ? "update" : "keep"}">${update ? "UPDATE" : "KEEP"}</strong></div>
      <span><small>${vi ? "KỶ LỤC TRƯỚC" : "PREVIOUS RECORD"}</small><strong>${previous}</strong><b>${view.recordBefore === null ? "no window yet" : `avg ${format(view.recordBefore / k)}`}</b></span>
    </div>`;
  } else {
    actionHtml = `<div class="prefix643-formula result"><small>return max_sum / k</small><code>${format(view.maxSum)} / ${k} = ${format(view.maxAverage)}</code></div>`;
  }

  const currentRange = Number.isInteger(view.windowLeft) ? `[${view.windowLeft}..${view.windowRight - 1}]` : "—";
  const bestRange = Number.isInteger(view.bestLeft) ? `[${view.bestLeft}..${view.bestRight - 1}]` : "—";
  const windows = Array.isArray(view.evaluatedWindows) ? view.evaluatedWindows : [];
  const historyHtml = windows.length
    ? windows.map((window, index) => `<span class="${window.isBest ? "best" : ""}${window.left === view.windowLeft && window.right === view.windowRight ? " current" : ""}"><small>#${index + 1} · [${window.left}..${window.right - 1}]</small><strong>sum ${format(window.sum)}</strong><b>avg ${format(window.average)}</b>${window.isBest ? "<em>BEST</em>" : ""}</span>`).join("")
    : `<em>${vi ? "Chưa truy vấn cửa sổ" : "No queried window yet"}</em>`;

  $("treeView").innerHTML = `<div class="prefix643-viz">
    <div class="avg643-phases">${phases}</div>
    <div class="prefix643-rule"><strong>PREFIX SUM</strong><span>sum(left..right−1) = prefix[right] − prefix[left]</span></div>
    <section class="prefix643-section"><header><strong>NUMS</strong><span>${vi ? "phần tử gốc" : "original values"}</span></header><div class="prefix643-row nums">${numsHtml}</div></section>
    <section class="prefix643-section"><header><strong>PREFIX</strong><span>${vi ? "n + 1 mốc tổng tích lũy" : "n + 1 cumulative-sum marks"}</span></header><div class="prefix643-row prefix">${prefixHtml}</div></section>
    <div class="prefix643-legend"><span><i class="window"></i>${vi ? "cửa sổ hiện tại" : "current window"}</span><span><i class="left"></i>prefix[left]</span><span><i class="right"></i>prefix[right]</span><span><i class="best"></i>best</span></div>
    ${actionHtml}
    <div class="avg643-stats">
      <span><small>${vi ? "CỬA SỔ HIỆN TẠI" : "CURRENT WINDOW"}</small><strong>${currentRange}</strong><b>sum ${format(view.windowSum)} · avg ${format(view.currentAverage)}</b></span>
      <span><small>${vi ? "CỬA SỔ TỐT NHẤT" : "BEST WINDOW"}</small><strong>${bestRange}</strong><b>max_sum ${format(view.maxSum)} · avg ${format(view.maxAverage)}</b></span>
    </div>
    <div class="avg643-history"><header><strong>${vi ? "CÁC CỬA SỔ ĐÃ TRUY VẤN" : "QUERIED WINDOWS"}</strong><span>prefix[right] − prefix[left]</span></header><div>${historyHtml}</div></div>
  </div>`;
}

