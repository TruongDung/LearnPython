function renderMaximumSubarrayView(step) {
  const view = step.maximumSubarrayView || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const n = nums.length;
  const isDP = view.approach === "dp";
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const curHistory = Array.isArray(view.curHistory) ? view.curHistory : [];
  const phase = view.phase || "init";
  const phaseIndex = phase === "done" ? 3 : phase.startsWith("update") ? 2 : phase === "loop" ? 1 : 0;
  const phaseLabels = vi
    ? ["Khởi tạo", "Quét phần tử", "Cập nhật cur/dp · best", "Kết quả"]
    : ["Initialize", "Scan element", "Update cur/dp · best", "Result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const curIdx = view.i !== null && view.i !== undefined ? view.i : null;
  const curStart = Number.isFinite(view.curStart) ? view.curStart : 0;
  const curEnd = Number.isFinite(view.curEnd) ? view.curEnd : 0;
  const bestL = Number.isFinite(view.bestL) ? view.bestL : 0;
  const bestR = Number.isFinite(view.bestR) ? view.bestR : 0;
  const curVal = Number.isFinite(view.cur) ? view.cur : (Number.isFinite(view.maxSum) ? view.maxSum : 0);
  const bestVal = Number.isFinite(view.best) ? view.best : (Number.isFinite(view.maxSum) ? view.maxSum : 0);
  const decision = view.decision;
  const bestUpdated = view.bestUpdated || view.maxUpdated || false;

  const maxAbs = Math.max(1, ...nums.map(Math.abs));
  const isDone = phase === "done";
  const cells = nums.map((val, index) => {
    const classes = ["msa53-cell"];
    const inCurrent = index >= curStart && index <= curEnd && !isDone && phase !== "init";
    const inBest = index >= bestL && index <= bestR;
    if (inBest) classes.push("in-best");
    if (inCurrent) classes.push("in-current");
    if (index === curIdx) classes.push("active");
    if (val < 0) classes.push("negative");
    const barH = Math.round((Math.abs(val) / maxAbs) * 100);
    const dpVal = isDP ? (dp[index] !== null ? dp[index] : "·") : (curHistory[index] !== null ? curHistory[index] : "·");
    const bar = val < 0
      ? `<i class="msa53-half up"></i><i class="msa53-zero"></i><i class="msa53-half down"><b class="msa53-bar neg" style="height:${barH}%"></b></i>`
      : `<i class="msa53-half up"><b class="msa53-bar pos" style="height:${barH}%"></b></i><i class="msa53-zero"></i><i class="msa53-half down"></i>`;
    return `<div class="${classes.join(" ")}"><small>[${index}]</small><div class="msa53-plot">${bar}</div><strong>${escapeHtml(String(val))}</strong><em>${escapeHtml(String(dpVal))}</em></div>`;
  }).join("");

  let decisionClass = "idle";
  let decisionLabel = vi ? "chờ bước tiếp" : "awaiting next step";
  if (isDone) {
    decisionClass = "final";
    decisionLabel = vi ? `✓ TỔNG = ${bestVal}` : `✓ SUM = ${bestVal}`;
  } else if (decision === "start-fresh") {
    decisionClass = "fresh";
    decisionLabel = vi ? "⚡ BẮT ĐẦU MỚI" : "⚡ START FRESH";
  } else if (decision === "extend") {
    decisionClass = "extend";
    decisionLabel = vi ? "→ MỞ RỘNG" : "→ EXTEND";
  }

  let formulaText;
  if (isDone) {
    formulaText = isDP ? `return max_sum = ${bestVal}` : `return best = ${bestVal}`;
  } else if (curIdx !== null && curIdx > 0) {
    formulaText = isDP
      ? `dp[${curIdx}] = max(dp[${curIdx - 1}]+nums[${curIdx}], nums[${curIdx}])`
      : `cur = max(nums[${curIdx}], cur+nums[${curIdx}])`;
  } else {
    formulaText = isDP ? "dp[0] = nums[0]" : "cur = nums[0]";
  }

  const bestSubarray = nums.slice(bestL, bestR + 1);
  const summary = vi
    ? `#53 Maximum Subarray · ${isDP ? "DP Array" : "Kadane"} · best=${bestVal}`
    : `#53 Maximum Subarray · ${isDP ? "DP Array" : "Kadane"} · best=${bestVal}`;

  el.innerHTML = `<section class="msa53-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="msa53-phases">${phases}</div>
    <section class="msa53-array"><header><strong>nums</strong><span>${vi ? "xanh = subarray hiện tại · vàng = best · dưới = " + (isDP ? "dp[i]" : "cur tại i") : "blue = current subarray · gold = best · below = " + (isDP ? "dp[i]" : "cur at i")}</span></header><div class="msa53-scroll"><div class="msa53-cells">${cells}</div></div></section>
    <div class="msa53-dashboard">
      <div class="msa53-formula"><small>${vi ? "CÔNG THỨC" : "FORMULA"}</small><code>${escapeHtml(formulaText)}</code></div>
      <div class="msa53-decision ${decisionClass}"><small>${vi ? "QUYẾT ĐỊNH" : "DECISION"}</small><strong>${escapeHtml(decisionLabel)}</strong></div>
      <div class="msa53-metrics"><div class="msa53-cur ${isDone ? "muted" : ""}"><small>${isDP ? "dp[i]" : "cur"}</small><strong>${escapeHtml(String(isDone ? "—" : (isDP ? (curIdx !== null && dp[curIdx] !== null ? dp[curIdx] : "—") : curVal)))}</strong></div><div class="msa53-best ${bestUpdated ? "updated" : ""} ${isDone ? "final" : ""}"><small>${isDP ? "max_sum" : "best"}</small><strong>${escapeHtml(String(bestVal))}${bestUpdated ? " 📈" : ""}</strong></div></div>
    </div>
    <section class="msa53-result"><header><strong>${vi ? "BEST SUBARRAY" : "BEST SUBARRAY"}</strong><span>[${bestL}..${bestR}]</span></header><div class="msa53-best-values">${bestSubarray.map((v) => `<span>${escapeHtml(String(v))}</span>`).join(" <b>+</b> ")} <b>=</b> <em>${escapeHtml(String(bestVal))}</em></div></section>
  </section>`;
}

function renderBricks803View(step) {
  const view = step.bricks803View || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const rows = Number(view.rows) || 0;
  const cols = Number(view.cols) || 0;
  const grid = Array.isArray(view.workingGrid) ? view.workingGrid : [];
  const original = Array.isArray(view.originalGrid) ? view.originalGrid : grid;
  const phaseOrder = ["prepare", "build", "reverse", "done"];
  const phaseIndex = Math.max(0, phaseOrder.indexOf(view.phase));
  const phaseLabels = vi
    ? ["1 · Xóa trước các hit", "2 · Xây DSU + roof", "3 · Khôi phục ngược", "4 · Kết quả"]
    : ["1 · Pre-remove hits", "2 · Build DSU + roof", "3 · Restore backward", "4 · Result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const keyOf = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : String(cell);
  const coordText = (cell) => cell === "roof"
    ? (vi ? "mái ảo" : "virtual roof")
    : Array.isArray(cell) ? `(${cell[0]},${cell[1]})` : "—";
  const stable = new Set((view.stableCells || []).map(keyOf));
  const newlyStable = new Set((view.newlyStable || []).map(keyOf));
  const activeKey = keyOf(view.activeCell);
  const neighborKey = keyOf(view.activeNeighbor);
  const restoredEvent = ["restore", "restore-union", "count"].includes(view.event);
  const removed = new Set();
  (view.hits || []).forEach((hit, index) => {
    if (view.effective && view.effective[index] && grid[hit[0]] && grid[hit[0]][hit[1]] === 0) removed.add(keyOf(hit));
  });

  const columnLabels = Array.from({ length: cols }, (_, col) => `<span>${col}</span>`).join("");
  const cells = [];
  for (let row = 0; row < rows; row++) {
    cells.push(`<span class="bricks803-row-label">${row}</span>`);
    for (let col = 0; col < cols; col++) {
      const key = `${row},${col}`;
      const value = grid[row] ? grid[row][col] : 0;
      const classes = ["bricks803-cell"];
      let status = vi ? "ô rỗng" : "empty";
      if (value === 1) {
        classes.push(view.phase === "prepare" ? "brick" : stable.has(key) ? "stable" : "loose");
        status = view.phase === "prepare"
          ? (vi ? "brick chưa xây DSU" : "brick before DSU")
          : stable.has(key) ? (vi ? "ổn định, nối roof" : "stable, roof-connected") : (vi ? "chưa nối roof" : "not roof-connected");
      } else if (removed.has(key) || (original[row] && original[row][col] === 1)) {
        classes.push("removed");
        status = vi ? "brick đã bị xóa" : "removed brick";
      } else {
        classes.push("empty");
      }
      if (newlyStable.has(key)) classes.push("newly-stable");
      if (key === neighborKey) classes.push("neighbor");
      if (key === activeKey) classes.push(restoredEvent && value === 1 ? "restored" : "active");
      const symbol = value === 1 ? "1" : classes.includes("removed") ? "×" : "·";
      cells.push(`<div class="${classes.join(" ")}" aria-label="${escapeHtml(`(${row},${col}): ${status}`)}"><small>${row},${col}</small><strong>${symbol}</strong><em>${stable.has(key) ? "roof ✓" : value === 1 ? "brick" : classes.includes("removed") ? "hit" : "empty"}</em></div>`);
    }
  }

  const hits = Array.isArray(view.hits) ? view.hits : [];
  const statusLabels = vi
    ? { pending: "chờ", removed: "đã xóa", skipped: "ô rỗng", processing: "đang xử lý", restored: "đã khôi phục", done: "xong" }
    : { pending: "waiting", removed: "removed", skipped: "empty", processing: "processing", restored: "restored", done: "done" };
  const hitTimeline = hits.length ? hits.map((hit, index) => {
    const status = (view.hitStatus && view.hitStatus[index]) || "pending";
    const answer = view.answers && view.answers[index] !== null && view.answers[index] !== undefined ? view.answers[index] : "—";
    const classes = [status, index === view.activeHit ? "active" : ""];
    return `<span class="${classes.join(" ")}"><small>#${index}</small><b>${escapeHtml(coordText(hit))}</b><em>${escapeHtml(statusLabels[status] || status)}</em><strong>${vi ? "rơi" : "fall"}: ${escapeHtml(answer)}</strong></span>`;
  }).join("") : `<span class="empty">${vi ? "Không có hit" : "No hits"}</span>`;

  const union = view.unionEdge;
  const operation = union
    ? `<div class="bricks803-union ${union.merged ? "merged" : "same"}"><small>UNION</small><strong>${escapeHtml(coordText(union.from))} ↔ ${escapeHtml(coordText(union.to))}</strong><span>${union.merged ? (vi ? "✓ gộp hai component" : "✓ components merged") : (vi ? "↷ đã cùng root" : "↷ already same root")}</span></div>`
    : `<div class="bricks803-union idle"><small>${vi ? "THAO TÁC HIỆN TẠI" : "CURRENT OPERATION"}</small><strong>${escapeHtml(view.event || "initialize")}</strong><span>${vi ? "Theo dõi grid và roof size ở từng dòng code" : "Track the grid and roof size at each code line"}</span></div>`;

  const components = (view.components || []).map((component) => {
    const cellText = (component.cells || []).map(coordText).join(" ");
    return `<span class="${component.roofConnected ? "roof" : "loose"}"><b>R${escapeHtml(component.root)}</b><small>${escapeHtml(cellText || "—")}</small><em>${component.roofConnected ? (vi ? "nối roof" : "roof-connected") : (vi ? "rời roof" : "detached")}</em></span>`;
  }).join("") || `<span class="bricks803-empty-state">${vi ? "Chưa có component brick" : "No brick components yet"}</span>`;

  const activeNodes = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row] && grid[row][col] === 1) activeNodes.push(row * cols + col);
    }
  }
  activeNodes.push(view.roofNode);
  const dsuNodes = activeNodes.map((node) => {
    const parent = view.parent && view.parent[node] !== undefined ? view.parent[node] : "—";
    const rootSize = view.size && parent === node ? view.size[node] : "—";
    return `<span class="${node === view.roofNode ? "roof" : ""}"><small>${node === view.roofNode ? "ROOF" : `node ${node}`}</small><b>p=${escapeHtml(parent)}</b><em>size=${escapeHtml(rootSize)}</em></span>`;
  }).join("");

  const roofSize = Number(view.roofSize) || 1;
  const before = view.roofBefore;
  const after = view.roofAfter;
  const formulaReady = Number.isFinite(before) && Number.isFinite(after);
  const formula = formulaReady
    ? `max(0, ${after} − ${before} − 1) = ${view.fallen}`
    : "max(0, after − before − 1)";
  const result = (view.answers || []).map((answer) => answer === null || answer === undefined ? "—" : answer).join(", ");
  const eventLabel = vi
    ? { copy: "Sao chép grid", remove: "Xóa hit", "skip-remove": "Hit ô rỗng", "init-dsu": "Tạo virtual roof", "build-union": "Xây component", before: "Đo roof trước", restore: "Khôi phục brick", "restore-union": "Union hàng xóm", "skip-restore": "Bỏ qua hit rỗng", count: "Tính số brick rơi", done: "Hoàn tất" }[view.event]
    : { copy: "Copy grid", remove: "Remove hit", "skip-remove": "Empty-cell hit", "init-dsu": "Create virtual roof", "build-union": "Build component", before: "Measure roof before", restore: "Restore brick", "restore-union": "Union neighbor", "skip-restore": "Skip empty hit", count: "Count fallen bricks", done: "Complete" }[view.event];
  const summary = vi
    ? `Bài 803, pha ${view.phase}, thao tác ${eventLabel || view.event}, roof size ${roofSize}.`
    : `Problem 803, ${view.phase} phase, ${eventLabel || view.event}, roof size ${roofSize}.`;

  el.innerHTML = `<section class="bricks803-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="bricks803-phases">${phases}</div>
    <section class="bricks803-hits"><header><strong>HIT TIMELINE</strong><span>${vi ? "xử lý xuôi → · khôi phục ←" : "remove forward → · restore backward ←"}</span></header><div>${hitTimeline}</div></section>
    <section class="bricks803-action"><div><small>${vi ? "SỰ KIỆN" : "EVENT"}</small><strong>${escapeHtml(eventLabel || view.event || "—")}</strong></div><div><small>${vi ? "HIT HIỆN TẠI" : "CURRENT HIT"}</small><strong>${view.activeHit === null || view.activeHit === undefined ? "—" : `#${view.activeHit} ${escapeHtml(coordText(hits[view.activeHit]))}`}</strong></div>${operation}</section>
    <div class="bricks803-main">
      <section class="bricks803-grid-card"><header><strong>GRID ${rows} × ${cols}</strong><span>${vi ? "hàng 0 chạm virtual roof" : "row 0 touches the virtual roof"}</span></header><div class="bricks803-roof"><i></i><strong>VIRTUAL ROOF · node ${escapeHtml(view.roofNode)}</strong><span>size=${roofSize} · ${Math.max(0, roofSize - 1)} ${vi ? "brick ổn định" : "stable bricks"}</span></div><div class="bricks803-grid-scroll"><div class="bricks803-col-labels" style="--bricks803-cols:${cols}"><i></i>${columnLabels}</div><div class="bricks803-grid" style="--bricks803-cols:${cols}">${cells.join("")}</div></div><div class="bricks803-legend"><span><i class="stable"></i>${vi ? "nối roof" : "stable"}</span><span><i class="loose"></i>${vi ? "rời roof" : "loose"}</span><span><i class="removed"></i>${vi ? "đã xóa" : "removed"}</span><span><i class="active"></i>${vi ? "hit hiện tại" : "active hit"}</span><span><i class="restored"></i>${vi ? "vừa khôi phục" : "restored"}</span><span><i class="newly"></i>${vi ? "vừa nối roof" : "newly roof-connected"}</span></div></section>
      <aside class="bricks803-side"><section class="bricks803-roof-metrics"><div><small>BEFORE</small><strong>${Number.isFinite(before) ? before : "—"}</strong></div><b>→</b><div><small>AFTER</small><strong>${Number.isFinite(after) ? after : "—"}</strong></div></section><section class="bricks803-formula ${formulaReady ? "ready" : "idle"}"><small>${vi ? "BRICK RƠI" : "FALLEN BRICKS"}</small><strong>${escapeHtml(formula)}</strong><span>${vi ? "−1 loại brick vừa khôi phục" : "−1 excludes the restored brick"}</span></section><section class="bricks803-answer"><small>ANSWER</small><strong>[${escapeHtml(result)}]</strong><span>${vi ? "null được hiển thị bằng —" : "pending values are shown as —"}</span></section></aside>
    </div>
    <section class="bricks803-components"><header><strong>DSU COMPONENTS</strong><span>${(view.components || []).length} ${vi ? "component brick" : "brick components"}</span></header><div>${components}</div></section>
    <details class="bricks803-dsu"><summary>${vi ? "Parent / size (chỉ size tại root có ý nghĩa)" : "Parent / size (size is meaningful only at roots)"}</summary><div>${dsuNodes}</div></details>
  </section>`;
}

// ---- 928 Minimize Malware Spread II renderer ----
function renderMalware928View(step) {
  const view = step.malware928View || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseIndex = view.phase === "done" ? 3 : view.phase === "score" ? 2 : view.phase === "spread" ? 1 : 0;
  const phaseLabels = vi
    ? ["Chọn node để xóa", "Mô phỏng lan truyền", "So sánh kết quả", "Đáp án"]
    : ["Choose a removal", "Simulate the spread", "Compare totals", "Answer"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex || view.phase === "done" ? "done" : index === phaseIndex ? "active" : "pending";
    return '<span class="' + state + '"><i>' + (state === "done" ? "✓" : index + 1) + '</i><b>' + escapeHtml(label) + '</b></span>';
  }).join("");

  const n = Number(view.n) || 0;
  const width = 680;
  const height = 332;
  const centerX = width / 2;
  const centerY = 158;
  const radius = n <= 2 ? 172 : Math.min(126, 42 + n * 9);
  const positions = {};
  for (let node = 0; node < n; node += 1) {
    const angle = n === 1 ? -Math.PI / 2 : -Math.PI / 2 + node * Math.PI * 2 / n;
    positions[node] = { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
  }

  const graph = Array.isArray(view.graph) ? view.graph : [];
  const activeEdge = Array.isArray(view.activeEdge) ? view.activeEdge : null;
  let edges = "";
  for (let from = 0; from < n; from += 1) {
    for (let to = from + 1; to < n; to += 1) {
      if (!graph[from] || graph[from][to] !== 1) continue;
      const a = positions[from];
      const b = positions[to];
      const highlighted = activeEdge && ((activeEdge[0] === from && activeEdge[1] === to) || (activeEdge[0] === to && activeEdge[1] === from));
      edges += '<line class="mal928-edge' + (highlighted ? ' active' : '') + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"></line>';
    }
  }

  const initial = new Set(view.initial || []);
  const infected = new Set(view.infected || []);
  const safe = new Set(view.safe || []);
  let graphNodes = "";
  for (let node = 0; node < n; node += 1) {
    const classes = ["mal928-node"];
    if (node === view.removed) classes.push("removed");
    else if (infected.has(node)) classes.push("infected");
    else if (safe.has(node)) classes.push("safe");
    if (initial.has(node)) classes.push("source");
    if (node === view.current) classes.push("current");
    if (node === view.neighbor) classes.push("neighbor");
    const point = positions[node];
    graphNodes += '<g class="' + classes.join(" ") + '" transform="translate(' + point.x + ' ' + point.y + ')"><circle r="23"></circle><text class="node-id" text-anchor="middle" y="5">' + node + '</text></g>';
  }

  const stateLabel = view.removed === null
    ? (vi ? "Chưa chọn node để xóa" : "No removal selected yet")
    : (vi ? "Xóa " + view.removed + " · nhiễm: " + infected.size + " · an toàn: " + safe.size : "Remove " + view.removed + " · infected: " + infected.size + " · safe: " + safe.size);
  const svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escapeHtml(vi ? "Đồ thị lan truyền malware sau khi xóa một nguồn" : "Malware-spread graph after removing one source") + '"><g>' + edges + '</g><g>' + graphNodes + '</g><g class="mal928-legend"><circle class="infected" cx="78" cy="310" r="7"></circle><text x="91" y="314">' + (vi ? "nhiễm" : "infected") + '</text><circle class="safe" cx="230" cy="310" r="7"></circle><text x="243" y="314">' + (vi ? "an toàn" : "safe") + '</text><circle class="removed" cx="355" cy="310" r="7"></circle><text x="368" y="314">' + (vi ? "đã xóa" : "removed") + '</text><line class="active-line" x1="470" y1="310" x2="494" y2="310"></line><text x="503" y="314">' + (vi ? "cạnh đang xét" : "active edge") + '</text></g></svg>';

  const statusLabels = vi
    ? { waiting: "chờ", testing: "đang thử", best: "best mới", tie: "hòa", worse: "kém hơn", selected: "đáp án" }
    : { waiting: "waiting", testing: "testing", best: "new best", tie: "tie", worse: "worse", selected: "answer" };
  const candidates = (view.candidateRows || []).map((row) => {
    const active = row.node === view.activeCandidate ? " active" : "";
    const answer = row.node === view.bestNode ? " answer" : "";
    const status = row.status || "waiting";
    const safeText = row.infectedCount === null ? "-" : row.safeNodes.length ? row.safeNodes.join(", ") : "—";
    return '<div class="mal928-candidate ' + status + active + answer + '"><b>' + row.node + '</b><span>' + (row.infectedCount === null ? "-" : row.infectedCount) + '</span><span>' + escapeHtml(safeText) + '</span><em>' + escapeHtml(statusLabels[status] || status) + '</em></div>';
  }).join("");

  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stack.length
    ? stack.map((node, index) => '<b class="' + (index === stack.length - 1 ? "top" : "") + '"><small>' + (index === stack.length - 1 ? "TOP" : index) + '</small>' + node + '</b>').join("")
    : '<em>' + (vi ? "stack rỗng" : "empty stack") + '</em>';
  const currentEdge = activeEdge ? activeEdge[0] + " - " + activeEdge[1] : "—";
  const ready = view.phase === "done";
  const bestSafe = (view.bestSafeNodes || []).length ? view.bestSafeNodes.join(", ") : "—";
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : "-";
  const summary = vi
    ? "Bài 928. Xóa node " + (view.bestNode ?? "—") + " để có ít node nhiễm nhất."
    : "Problem 928. Remove node " + (view.bestNode ?? "—") + " for the fewest infected nodes.";

  el.innerHTML = '<section class="mal928-viz" role="img" aria-label="' + escapeHtml(summary) + '">' +
    '<div class="mal928-phases">' + phases + '</div>' +
    '<section class="mal928-rule"><b>' + (vi ? "QUY TẮC" : "RULE") + '</b><strong>remove one source → spread from the rest</strong><span>' + (vi ? "Tổng node nhiễm nhỏ hơn là tốt hơn; hòa giữ index nhỏ hơn." : "A lower infected total is better; ties keep the smaller index.") + '</span></section>' +
    '<section class="mal928-action"><small>' + (vi ? "DÒNG" : "LINE") + ' ' + activeLine + '</small><strong>' + escapeHtml(pick(step.title)) + '</strong><span>' + escapeHtml(pick(step.note)) + '</span></section>' +
    '<section class="mal928-graph"><header><strong>' + (vi ? "MÔ PHỎNG LAN TRUYỀN" : "SPREAD SIMULATION") + '</strong><span>' + escapeHtml(stateLabel) + '</span></header>' + svg + '</section>' +
    '<div class="mal928-bottom"><section class="mal928-stack"><header><strong>DFS STACK</strong><span>' + stack.length + '</span></header><div>' + stackHtml + '</div><footer>' + (vi ? "cạnh đang xét: " : "active edge: ") + escapeHtml(currentEdge) + '</footer></section>' +
    '<section class="mal928-score"><header><strong>' + (vi ? "KẾT QUẢ TỪNG LẦN XÓA" : "RESULTS BY REMOVAL") + '</strong><span>' + (vi ? "nhiễm ít nhất thắng" : "fewest infected wins") + '</span></header><div class="mal928-candidate head"><b>' + (vi ? "xóa" : "remove") + '</b><span>' + (vi ? "nhiễm" : "infected") + '</span><span>' + (vi ? "an toàn" : "safe") + '</span><em>' + (vi ? "trạng thái" : "status") + '</em></div>' + candidates + '</section></div>' +
    '<section class="mal928-answer ' + (ready ? "ready" : "pending") + '"><small>' + (vi ? "XÓA NODE" : "REMOVE NODE") + '</small><strong>' + (ready ? view.finalAnswer : view.bestNode ?? "…") + '</strong><span>' + (ready ? (vi ? "còn " + view.bestInfected + " node nhiễm · an toàn: " + bestSafe : view.bestInfected + " infected remain · safe: " + bestSafe) : (vi ? "đang thử từng nguồn" : "testing each source")) + '</span></section>' +
    '</section>';
}

// ---- 924 Minimize Malware Spread renderer ----
function renderMalware924View(step) {
  const view = step.malware924View || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const chooseTieEvent = ["fallback", "tie-or-smaller"].includes(view.event);
  const activePhase = view.phase === "done" ? 4 : view.phase === "choose" ? (chooseTieEvent ? 3 : 2) : view.phase === "count" ? 1 : 0;
  const phaseLabels = vi
    ? ["Tạo component", "Đếm nguồn nhiễm", "Chấm điểm xóa", "Tie-break index", "Đáp án"]
    : ["Build components", "Count sources", "Score removals", "Index tie-break", "Answer"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "done" : index === activePhase ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const activePair = Array.isArray(view.activePair) ? view.activePair : null;
  const activeNodes = new Set(view.activeNodes || []);
  const activeRoots = new Set(view.activeRoots || []);
  const initialSet = new Set(view.initial || []);
  const scannedPairs = new Set(view.scannedPairs || []);
  const matrixCells = [];
  matrixCells.push(`<span class="corner">r/c</span>`);
  for (let col = 0; col < view.n; col++) matrixCells.push(`<span class="axis${initialSet.has(col) ? " source" : ""}">${col}${initialSet.has(col) ? "*" : ""}</span>`);
  for (let row = 0; row < view.n; row++) {
    matrixCells.push(`<span class="axis${initialSet.has(row) ? " source" : ""}">${row}${initialSet.has(row) ? "*" : ""}</span>`);
    for (let col = 0; col < view.n; col++) {
      const pairKey = `${Math.min(row, col)}-${Math.max(row, col)}`;
      const isActive = activePair && ((activePair[0] === row && activePair[1] === col) || (activePair[1] === row && activePair[0] === col));
      const classes = [
        row === col ? "diagonal" : view.graph[row][col] === 1 ? "edge" : "zero",
        scannedPairs.has(pairKey) && row < col ? "scanned" : "",
        isActive ? "active" : "",
      ].filter(Boolean).join(" ");
      matrixCells.push(`<b class="${classes}">${view.graph[row][col]}</b>`);
    }
  }

  const components = (view.components || []).map((component, index) => {
    const sourceCount = component.infectedCount;
    const hasSource = sourceCount !== null && sourceCount > 0;
    const unique = sourceCount === 1;
    const isProtected = component.root === view.protectedRoot;
    const isSelected = component.root === view.selectedRoot;
    const classes = ["mal924-component", `c${index % 4}`, hasSource ? "infected" : "clean", unique ? "unique" : "", isProtected ? "protected" : "", isSelected ? "selected" : "", activeRoots.has(component.root) ? "active" : ""].filter(Boolean).join(" ");
    const nodes = (component.nodes || []).map((node) => {
      const nodeClasses = [initialSet.has(node) ? "source" : "", node === view.activeCandidate ? "candidate" : "", node === view.answer ? "answer" : "", activeNodes.has(node) ? "active" : ""].filter(Boolean).join(" ");
      return `<b class="${nodeClasses}"><small>${initialSet.has(node) ? "INFECTED" : "node"}</small>${node}</b>`;
    }).join("");
    const status = sourceCount === null
      ? (vi ? "chưa đếm nguồn" : "sources not counted")
      : sourceCount === 0
        ? (vi ? "không bị lây" : "stays clean")
        : sourceCount === 1
          ? (vi ? "xóa nguồn duy nhất ⇒ cứu cả nhóm" : "remove unique source ⇒ save group")
          : (vi ? `${sourceCount} nguồn ⇒ xóa một vẫn bị lây` : `${sourceCount} sources ⇒ one removal is not enough`);
    return `<article class="${classes}"><header><span><small>ROOT</small><strong>${component.root}</strong></span><em>size=${component.size}</em></header><div>${nodes}</div><footer><strong>${sourceCount === null ? "?" : sourceCount} ${vi ? "nguồn nhiễm" : "source(s)"}</strong><span>${escapeHtml(status)}</span></footer></article>`;
  }).join("");

  const decisionLabels = vi
    ? { pending: "chờ", checking: "đang xét", qualifies: "đủ điều kiện", accepted: "chọn", shared: "nhiều nguồn", "not-better": "không tốt hơn" }
    : { pending: "waiting", checking: "checking", qualifies: "qualifies", accepted: "selected", shared: "multiple sources", "not-better": "not better" };
  const candidateRows = (view.candidateRows || []).map((candidate) => {
    const isActive = candidate.node === view.activeCandidate;
    const isAnswer = candidate.node === view.answer;
    const decision = candidate.decision || "pending";
    return `<div class="mal924-candidate ${decision}${isActive ? " active" : ""}${isAnswer ? " answer" : ""}"><b>${candidate.node}</b><span>${candidate.root === null ? "-" : candidate.root}</span><span>${candidate.sources === null ? "-" : candidate.sources}</span><strong>${candidate.gain === null ? "-" : candidate.gain}</strong><em>${escapeHtml(decisionLabels[decision] || decision)}</em></div>`;
  }).join("");

  const currentRow = (view.candidateRows || []).find((candidate) => candidate.node === view.activeCandidate);
  let decisionPanel = `<section class="mal924-decision idle"><small>${vi ? "QUY TẮC CỨU COMPONENT" : "COMPONENT-SAVING RULE"}</small><strong>infected[root] == 1</strong><span>${vi ? "Chỉ khi node bị xóa là nguồn duy nhất của component." : "Only when the removed node is its component's unique source."}</span></section>`;
  if (currentRow && currentRow.root !== null) {
    const unique = currentRow.sources === 1;
    const decisionClass = currentRow.decision === "accepted" ? "accepted" : unique ? "eligible" : "blocked";
    const formula = unique ? `gain = size[root ${currentRow.root}] = ${currentRow.gain}` : `gain = 0 (${currentRow.sources} sources)`;
    const detail = unique
      ? (vi ? `Node ${currentRow.node} là nguồn duy nhất; có thể cứu ${currentRow.gain} node.` : `Node ${currentRow.node} is the unique source; removing it can save ${currentRow.gain} nodes.`)
      : (vi ? `Sau khi xóa ${currentRow.node}, component vẫn còn nguồn nhiễm khác.` : `After removing ${currentRow.node}, another source still infects the component.`);
    decisionPanel = `<section class="mal924-decision ${decisionClass}"><small>${vi ? "THỬ XÓA" : "TRY REMOVING"} ${currentRow.node}</small><strong>${escapeHtml(formula)}</strong><span>${escapeHtml(detail)}</span></section>`;
  }

  const dsuCells = (view.parent || []).map((parent, node) => {
    const rootComponent = (view.components || []).find((component) => component.root === node);
    const rootSize = rootComponent ? view.size[node] : "-";
    const sources = view.infectedReady && rootComponent ? view.infected[node] : "-";
    return `<span class="${rootComponent ? "root" : ""}${activeNodes.has(node) ? " active" : ""}"><small>node ${node}</small><strong>p=${parent}</strong><em>size=${rootSize} · src=${sources}</em></span>`;
  }).join("");

  const answerReady = view.phase === "done";
  const spreadKnown = Number.isInteger(view.spreadBeforeRemoval);
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : "-";
  const summary = vi
    ? `Bài 924. ${view.n} node, initial [${(view.initial || []).join(", ")}], chọn ${view.answer ?? "chưa xác định"}.`
    : `Problem 924. ${view.n} nodes, initial [${(view.initial || []).join(", ")}], choose ${view.answer ?? "pending"}.`;

  el.innerHTML = `<section class="mal924-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="mal924-phases">${phases}</div>
    <section class="mal924-rule"><b>${vi ? "MẤU CHỐT" : "KEY TEST"}</b><strong>infected[root] == 1 &nbsp;⇒&nbsp; saved = size[root]</strong><span>${vi ? "Nếu có từ hai nguồn trở lên, xóa một nguồn không ngăn được component bị lây." : "With two or more sources, removing one source cannot stop the component from being infected."}</span></section>
    <section class="mal924-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <div class="mal924-main">
      <section class="mal924-matrix"><header><strong>ADJACENCY MATRIX</strong><span>* = ${vi ? "nguồn nhiễm ban đầu" : "initially infected"}</span></header><div class="mal924-matrix-wrap"><div style="--mal924-n:${view.n}">${matrixCells.join("")}</div></div><footer><span><i class="edge"></i>1 = edge</span><span><i class="active"></i>${vi ? "đang xét" : "current pair"}</span><span><i class="source"></i>${vi ? "header nguồn nhiễm" : "infected header"}</span></footer></section>
      <section class="mal924-components"><header><strong>${vi ? "CONNECTED COMPONENTS" : "CONNECTED COMPONENTS"}</strong><span>${(view.components || []).length} component${(view.components || []).length === 1 ? "" : "s"}</span></header><div>${components}</div></section>
    </div>
    ${decisionPanel}
    <section class="mal924-candidates"><header><strong>${vi ? "CHẤM ĐIỂM TỪNG NODE TRONG initial" : "SCORE EACH NODE IN initial"}</strong><span>${vi ? "duyệt index tăng dần" : "scan in increasing index order"}</span></header><div class="mal924-candidate head"><b>node</b><span>root</span><span>sources</span><strong>gain</strong><em>decision</em></div>${candidateRows}</section>
    <section class="mal924-metrics"><div><small>${vi ? "NHIỄM TRƯỚC KHI XÓA" : "INFECTED BEFORE REMOVAL"}</small><strong>${spreadKnown ? view.spreadBeforeRemoval : "-"}</strong></div><div class="saved"><small>${vi ? "CỨU ĐƯỢC" : "SAVED"}</small><strong>${view.saved ?? 0}</strong></div><div class="after"><small>${vi ? "NHIỄM SAU KHI XÓA" : "INFECTED AFTER REMOVAL"}</small><strong>${spreadKnown ? view.spreadAfterRemoval : "-"}</strong></div><div class="choice"><small>${vi ? "NODE ĐANG CHỌN" : "CURRENT CHOICE"}</small><strong>${view.answer === null ? "-" : view.answer}</strong></div></section>
    <details class="mal924-dsu" ${["attach", "grow", "increment"].includes(view.event) ? "open" : ""}><summary>DSU parent / size / infection sources</summary><div>${dsuCells}</div></details>
    <section class="mal924-answer ${answerReady ? "ready" : "pending"}"><small>${vi ? "XÓA NODE" : "REMOVE NODE"}</small><strong>${answerReady ? view.finalAnswer : "..."}</strong><span>${answerReady ? (view.saved > 0 ? (vi ? `cứu ${view.saved} node khỏi malware` : `save ${view.saved} nodes from malware`) : (vi ? "tie-break bằng index nhỏ nhất" : "smallest-index tie-break")) : (vi ? "đang đánh giá candidate" : "evaluating candidates")}</span></section>
  </section>`;
}

// ---- 2316 Count Unreachable Pairs of Nodes renderer ----
function renderCountPairs2316View(step) {
  const view = step.countPairs2316View || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseOrder = {
    init: 0,
    total: 1,
    edge: 2,
    find: 2,
    roots: 2,
    compare: 2,
    "size-check": 3,
    swap: 3,
    subtract: 3,
    parent: 3,
    "size-update": 3,
    skip: 3,
    done: 4,
  };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["Khởi tạo DSU", "C(n,2) ban đầu", "Tìm hai root", "Trừ a x b + union", "Đáp án"]
    : ["Initialize DSU", "Initial C(n,2)", "Find both roots", "Subtract a x b + union", "Answer"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "done" : index === activePhase ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const edgeIndex = Number.isInteger(view.edgeIndex) ? view.edgeIndex : -1;
  const edges = Array.isArray(view.edges) ? view.edges : [];
  const edgeCards = edges.map((edge, index) => {
    let state = index < edgeIndex || view.phase === "done" ? "done" : index === edgeIndex ? "active" : "pending";
    let status = state === "done" ? (vi ? "đã xử lý" : "processed") : state === "active" ? (vi ? "đang xét" : "current") : (vi ? "chờ" : "waiting");
    if (index === edgeIndex && view.outcome === "redundant") {
      state += " redundant";
      status = vi ? "cùng component" : "same component";
    } else if (index === edgeIndex && view.outcome === "merged") {
      state += " merged";
      status = vi ? "đã union" : "unioned";
    }
    return `<span class="cp2316-edge ${state}"><small>#${index}</small><strong>${escapeHtml(edge[0])} - ${escapeHtml(edge[1])}</strong><em>${escapeHtml(status)}</em></span>`;
  }).join("") || `<span class="cp2316-empty">${vi ? "Không có cạnh" : "No edges"}</span>`;

  const activeNodes = new Set(view.activeNodes || []);
  const activeRoots = new Set(view.activeRoots || []);
  const mergeNodes = new Set(view.merge ? [...(view.merge.leftNodes || []), ...(view.merge.rightNodes || [])] : []);
  const components = (view.components || []).map((component, index) => {
    const isActiveRoot = activeRoots.has(component.root);
    const isMergeTarget = (component.nodes || []).some((node) => mergeNodes.has(node));
    const nodeHtml = (component.nodes || []).map((node) => {
      const classes = [activeNodes.has(node) ? "active" : "", node === component.root ? "root" : ""].filter(Boolean).join(" ");
      return `<b class="${classes}"><small>node</small>${escapeHtml(node)}</b>`;
    }).join("");
    const reachableInside = component.size * (component.size - 1) / 2;
    return `<article class="cp2316-component c${index % 4}${isActiveRoot ? " active-root" : ""}${isMergeTarget ? " merge-target" : ""}"><header><span><small>ROOT</small><strong>${escapeHtml(component.root)}</strong></span><em>size = ${escapeHtml(component.size)}</em></header><div>${nodeHtml}</div><footer>C(${escapeHtml(component.size)}, 2) = ${escapeHtml(reachableInside)} ${vi ? "cặp reachable bên trong" : "reachable pairs inside"}</footer></article>`;
  }).join("");

  const findPath = Array.isArray(view.findPath) ? view.findPath : [];
  const findPanel = findPath.length
    ? `<section class="cp2316-find"><header><strong>find(${escapeHtml(view.findLabel || "x")})</strong><span>${vi ? "đi theo parent tới root" : "follow parent pointers to the root"}</span></header><div>${findPath.map((node, index) => `<b class="${index === findPath.length - 1 ? "last" : ""}">${escapeHtml(node)}</b>${index < findPath.length - 1 ? "<i>→</i>" : ""}`).join("")}</div></section>`
    : "";

  let equationLabel = `C(${view.n}, 2)`;
  let equation = `${view.n} x ${Math.max(0, view.n - 1)} / 2 = ${view.totalPairs}`;
  let equationDetail = vi ? "mọi cặp bắt đầu là unreachable" : "every pair starts unreachable";
  let equationClass = "initial";
  if (view.merge && ["subtract", "parent", "size-update"].includes(view.phase)) {
    equationLabel = "pairs -= size[ru] x size[rv]";
    equation = `${view.merge.beforePairs} - (${view.merge.leftSize} x ${view.merge.rightSize}) = ${view.pairs}`;
    equationDetail = vi
      ? `${view.merge.leftSize} x ${view.merge.rightSize} = ${view.merge.newlyReachable} cặp vừa có đường đi`
      : `${view.merge.leftSize} x ${view.merge.rightSize} = ${view.merge.newlyReachable} pairs just became reachable`;
    equationClass = "subtract";
  } else if (view.outcome === "redundant") {
    equationLabel = vi ? "CẠNH DƯ" : "REDUNDANT EDGE";
    equation = `${view.pairs} - 0 = ${view.pairs}`;
    equationDetail = vi ? "hai đầu đã cùng root, không có cặp mới" : "both endpoints already share a root; no new pair";
    equationClass = "redundant";
  } else if (view.phase === "done") {
    equationLabel = vi ? "CẶP KHÁC COMPONENT" : "CROSS-COMPONENT PAIRS";
    equation = `${view.pairs}`;
    equationDetail = vi ? "đây là các cặp vẫn không có đường đi" : "these pairs still have no path between them";
    equationClass = "done";
  }

  const roots = new Set((view.components || []).map((component) => component.root));
  const dsuCells = (view.parent || []).map((parent, node) => {
    const classes = [activeNodes.has(node) ? "active" : "", roots.has(node) ? "root" : ""].filter(Boolean).join(" ");
    const storedSize = roots.has(node) ? view.size[node] : "-";
    return `<span class="cp2316-dsu-cell ${classes}"><small>node ${node}</small><strong>p=${escapeHtml(parent)}</strong><em>size=${escapeHtml(storedSize)}</em></span>`;
  }).join("");

  const pairReady = view.pairsReady !== false;
  const answerReady = view.phase === "done";
  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : "-";
  const currentEdgeText = Array.isArray(view.currentEdge) ? `(${view.currentEdge[0]}, ${view.currentEdge[1]})` : "-";
  const summary = vi
    ? `Bài 2316. ${view.n} node, ${edges.length} cạnh, còn ${view.pairs} cặp unreachable.`
    : `Problem 2316. ${view.n} nodes, ${edges.length} edges, ${view.pairs} unreachable pairs remain.`;

  el.innerHTML = `<section class="cp2316-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="cp2316-phases">${phases}</div>
    <section class="cp2316-rule"><b>${vi ? "Ý TƯỞNG" : "CORE IDEA"}</b><strong>merge size a + size b&nbsp; ⇒ &nbsp;a x b ${vi ? "cặp trở thành reachable" : "pairs become reachable"}</strong><span>${vi ? "Vì mỗi node ở nhóm A vừa nối được tới mọi node ở nhóm B." : "Every node in group A gains a path to every node in group B."}</span></section>
    <section class="cp2316-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span><em>edge ${escapeHtml(currentEdgeText)}</em></section>
    <section class="cp2316-edges"><header><strong>EDGE TIMELINE</strong><span>${vi ? "vàng = đang xét - xanh = xong" : "yellow = current - green = done"}</span></header><div>${edgeCards}</div></section>
    ${findPanel}
    <section class="cp2316-components"><header><strong>${vi ? "CÁC COMPONENT HIỆN TẠI" : "CURRENT COMPONENTS"}</strong><span>${(view.components || []).length} component${(view.components || []).length === 1 ? "" : "s"}</span></header><div>${components}</div></section>
    <section class="cp2316-equation ${equationClass}"><small>${escapeHtml(equationLabel)}</small><strong>${escapeHtml(equation)}</strong><span>${escapeHtml(equationDetail)}</span></section>
    <section class="cp2316-metrics"><div><small>${vi ? "TỔNG CẶP" : "TOTAL PAIRS"}</small><strong>${escapeHtml(view.totalPairs)}</strong><span>C(n,2)</span></div><div class="reachable"><small>REACHABLE</small><strong>${pairReady ? escapeHtml(view.reachablePairs) : "-"}</strong><span>${vi ? "đã nối" : "connected"}</span></div><div class="unreachable"><small>UNREACHABLE</small><strong>${pairReady ? escapeHtml(view.pairs) : "-"}</strong><span>${vi ? "đang còn lại" : "remaining"}</span></div></section>
    <details class="cp2316-dsu" ${["find", "parent", "size-update"].includes(view.phase) ? "open" : ""}><summary>DSU parent / size ${vi ? "(size chỉ có ý nghĩa tại root)" : "(size matters only at roots)"}</summary><div>${dsuCells}</div></details>
    <section class="cp2316-answer ${answerReady ? "ready" : "pending"}"><small>${vi ? "ĐÁP ÁN CUỐI" : "FINAL ANSWER"}</small><strong>${answerReady ? escapeHtml(view.answer) : "..."}</strong><span>${answerReady ? (vi ? "cặp node không thể đi tới nhau" : "unreachable node pairs") : (vi ? "tiếp tục xử lý các cạnh" : "keep processing edges")}</span></section>
  </section>`;
}

// ---- 990 Satisfiability of Equality Equations renderer ----
function renderEqualityEquationsView(step) {
  const view = step.equalityEquationsView || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseOrder = { intro: 0, init: 1, equalities: 2, inequalities: 3, conflict: 4, done: 4 };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["Ý tưởng", "Khởi tạo", "Gộp ==", "Kiểm tra !=", "Kết luận"]
    : ["Idea", "Initialize", "Merge ==", "Check !=", "Conclusion"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "done" : index === activePhase ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const activeLetters = new Set(view.activeLetters || []);
  const stateLabels = vi
    ? { pending: "chờ", waiting: "đợi pass 2", checking: "đang xét", merged: "đã gộp", safe: "hợp lệ", conflict: "mâu thuẫn" }
    : { pending: "waiting", waiting: "pass 2", checking: "checking", merged: "merged", safe: "fits", conflict: "conflict" };
  const equations = Array.isArray(view.equations) ? view.equations : [];
  const equationCards = equations.map((equation, index) => {
    const state = (view.states || [])[index] || "pending";
    const classes = ["eq990-equation", state, index === view.activeEquation ? "active" : "", equation.slice(1, 3) === "==" ? "equality" : "inequality"];
    return `<article class="${classes.filter(Boolean).join(" ")}"><small>#${index + 1}</small><strong><b>${escapeHtml(equation[0])}</b><i>${escapeHtml(equation.slice(1, 3))}</i><b>${escapeHtml(equation[3])}</b></strong><em>${escapeHtml(stateLabels[state] || state)}</em></article>`;
  }).join("") || `<span class="eq990-empty">${vi ? "Chưa có phương trình" : "No equations"}</span>`;

  const components = (view.components || []).map((component, index) => {
    const members = component.members || [];
    const active = members.some((letter) => activeLetters.has(letter));
    return `<article class="eq990-component c${index % 4}${active ? " active" : ""}"><header><small>${vi ? "ROOT" : "ROOT"}</small><strong>${escapeHtml(component.root)}</strong></header><div>${members.map((letter) => `<b class="${activeLetters.has(letter) ? "focus" : ""}">${escapeHtml(letter)}</b>`).join("<i>=</i>")}</div><em>${vi ? "cùng giá trị" : "same value"}</em></article>`;
  }).join("") || `<span class="eq990-empty">${vi ? "Chưa có nhóm" : "No groups yet"}</span>`;

  const parentRows = (view.parentRows || []).map((row) => {
    const active = activeLetters.has(row.letter) || activeLetters.has(row.parent) || activeLetters.has(row.root);
    return `<span class="eq990-parent ${active ? "active" : ""}"><b>${escapeHtml(row.letter)}</b><i>→</i><strong>${escapeHtml(row.parent)}</strong><em>${vi ? "root" : "root"} ${escapeHtml(row.root)}${row.size === null ? "" : ` · size ${row.size}`}</em></span>`;
  }).join("") || `<span class="eq990-empty">${vi ? "Chưa có parent" : "No parent data"}</span>`;

  let operation = "";
  if (view.comparison) {
    const comparison = view.comparison;
    operation = `<section class="eq990-operation ${comparison.conflict ? "conflict" : "safe"}"><small>${comparison.conflict ? (vi ? "PHÁT HIỆN MÂU THUẪN" : "CONTRADICTION FOUND") : (vi ? "KIỂM TRA !=" : "CHECK !=")}</small><strong>find(${escapeHtml(comparison.left)}) = ${escapeHtml(comparison.rootLeft)} &nbsp; ${comparison.conflict ? "=" : "≠"} &nbsp; find(${escapeHtml(comparison.right)}) = ${escapeHtml(comparison.rootRight)}</strong><span>${comparison.conflict ? (vi ? "Cùng root → hai chữ đã bị ép bằng nhau, trái với !=." : "Same root → the letters are forced equal, which violates !=.") : (vi ? "Khác root → điều kiện != vẫn đúng." : "Different roots → the != condition still holds.")}</span></section>`;
  } else if (view.union) {
    const union = view.union;
    operation = `<section class="eq990-operation union"><small>UNION(${escapeHtml(union.left)}, ${escapeHtml(union.right)})</small><strong>${escapeHtml(union.rootLeft)} ${union.merged ? "←" : "="} ${escapeHtml(union.rootRight)}</strong><span>${union.merged ? (vi ? "Gộp hai nhóm để điều kiện == đúng." : "Merge two groups so the == condition holds.") : (vi ? "Hai chữ đã có cùng root; không cần gộp lại." : "Both letters already have the same root; no merge is needed.")}</span></section>`;
  } else {
    const helper = view.phase === "equalities"
      ? (vi ? "Pass 1 chỉ tạo các nhóm bị buộc bằng nhau." : "Pass 1 only builds groups forced equal.")
      : view.phase === "inequalities"
        ? (vi ? "Pass 2 so sánh root của từng điều kiện !=." : "Pass 2 compares roots for each != condition.")
        : view.phase === "done"
          ? (vi ? "Mọi điều kiện đều có thể cùng đúng." : "All conditions can be true together.")
          : (vi ? "Theo dõi mỗi bước để xem các nhóm thay đổi thế nào." : "Follow each step to see how the groups change.");
    operation = `<section class="eq990-operation idle"><small>${vi ? "THAO TÁC HIỆN TẠI" : "CURRENT OPERATION"}</small><strong>${escapeHtml(view.event || "initialize")}</strong><span>${escapeHtml(helper)}</span></section>`;
  }

  const resultReady = typeof view.answer === "boolean";
  const resultText = resultReady ? (view.answer ? "True" : "False") : "…";
  const resultDetail = !resultReady
    ? (vi ? "chưa kết luận" : "not decided yet")
    : view.answer
      ? (vi ? "mọi != đều nằm giữa hai nhóm khác nhau" : "every != spans two different groups")
      : (vi ? "ít nhất một != nằm trong cùng một nhóm" : "at least one != lies inside one group");

  const summary = vi
    ? `Bài 990. ${equations.length} phương trình, pha ${view.phase || "khởi tạo"}.`
    : `Problem 990. ${equations.length} equations, ${view.phase || "initialize"} phase.`;
  el.innerHTML = `<section class="eq990-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="eq990-phases">${phases}</div>
    <section class="eq990-rule"><b>${vi ? "QUY TẮC" : "RULE"}</b><strong>a == b &nbsp;⇒&nbsp; same DSU group &nbsp;&nbsp;•&nbsp;&nbsp; a != b &nbsp;⇒&nbsp; different DSU groups</strong><span>${vi ? "Hai pass tránh kiểm tra != trước khi mọi quan hệ bằng nhau đã được gộp." : "Two passes prevent checking != before every equality relationship has been merged."}</span></section>
    <section class="eq990-equations"><header><strong>${vi ? "DANH SÁCH PHƯƠNG TRÌNH" : "EQUATION LIST"}</strong><span>${vi ? "vàng = đang xét · đỏ = mâu thuẫn" : "yellow = current · red = contradiction"}</span></header><div>${equationCards}</div></section>
    ${operation}
    <section class="eq990-components"><header><strong>${vi ? "CÁC NHÓM BẮT BUỘC BẰNG NHAU" : "FORCED-EQUAL GROUPS"}</strong><span>${vi ? "mỗi card = một component của DSU" : "each card = one DSU component"}</span></header><div>${components}</div></section>
    <section class="eq990-parents"><header><strong>PARENT / ROOT</strong><span>${vi ? "mũi tên là parent pointer; root đại diện cả nhóm" : "arrow = parent pointer; root represents the group"}</span></header><div>${parentRows}</div></section>
    <section class="eq990-answer ${resultReady ? (view.answer ? "possible" : "impossible") : "pending"}"><small>${vi ? "CÓ THỂ THỎA TẤT CẢ?" : "CAN ALL EQUATIONS HOLD?"}</small><strong>${resultText}</strong><span>${escapeHtml(resultDetail)}</span></section>
  </section>`;
}

// ---- 947 Most Stones Removed with Same Row or Column renderer ----
function renderStones947View(step) {
  const view = step.stones947View || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseOrder = { intro: 0, init: 1, connect: 2, done: 3 };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const phaseLabels = vi ? ["Ý tưởng", "Node hàng/cột", "Nối đá", "Kết quả"] : ["Idea", "Row/column nodes", "Connect stones", "Result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "done" : index === activePhase ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const statusLabels = vi
    ? { pending: "chờ", active: "đang xét", merged: "đã nối", same: "đã cùng nhóm" }
    : { pending: "waiting", active: "checking", merged: "connected", same: "same group" };
  const stones = Array.isArray(view.stones) ? view.stones : [];
  const stonesHtml = stones.map(([row, col], index) => {
    const state = (view.stoneStates || [])[index] || "pending";
    return `<article class="stones947-stone ${state}${index === view.activeStone ? " active" : ""}"><small>#${index + 1}</small><strong>(${row},${col})</strong><span>R${row} ↔ C${col}</span><em>${escapeHtml(statusLabels[state] || state)}</em></article>`;
  }).join("") || `<span class="stones947-empty">${vi ? "Chưa có đá" : "No stones"}</span>`;
  const components = (view.components || []).map((component, index) => {
    const stonesText = (component.stones || []).map((stone) => `#${stone + 1}`).join(" ") || "—";
    return `<article class="stones947-component c${index % 4}"><header><small>${vi ? "ROOT" : "ROOT"}</small><strong>${escapeHtml(component.root)}</strong></header><div>${(component.members || []).map((member) => `<b>${escapeHtml(member)}</b>`).join("")}</div><em>${vi ? "đá" : "stones"}: ${escapeHtml(stonesText)}</em></article>`;
  }).join("") || `<span class="stones947-empty">${vi ? "Chưa có component" : "No components"}</span>`;
  const parentRows = (view.parentRows || []).map((row) => {
    const isRoot = row.node === row.root;
    return `<span class="stones947-parent ${isRoot ? "root" : ""}"><b>${escapeHtml(row.node)}</b><i>→</i><strong>${escapeHtml(row.parent)}</strong><em>${vi ? "root" : "root"} ${escapeHtml(row.root)}${row.size === null ? "" : ` · size ${row.size}`}</em></span>`;
  }).join("") || `<span class="stones947-empty">parent</span>`;
  const union = view.union;
  const operation = union
    ? `<section class="stones947-operation ${union.merged ? "merged" : "same"}"><small>UNION</small><strong>${escapeHtml(union.left)} ↔ ${escapeHtml(union.right)}</strong><span>${union.merged ? (vi ? `Gộp root ${escapeHtml(union.rootLeft)} và ${escapeHtml(union.rootRight)}.` : `Merge roots ${escapeHtml(union.rootLeft)} and ${escapeHtml(union.rootRight)}.`) : (vi ? "Đã có đường nối gián tiếp trong component này." : "An indirect path already exists in this component.")}</span></section>`
    : `<section class="stones947-operation idle"><small>${vi ? "THAO TÁC" : "OPERATION"}</small><strong>${escapeHtml(view.event || "initialize")}</strong><span>${vi ? "Mỗi đá là một cạnh giữa node hàng và node cột." : "Every stone is an edge between one row node and one column node."}</span></section>`;
  const ready = Number.isInteger(view.answer);
  const summary = vi
    ? `Bài 947. ${stones.length} đá, ${view.groupCount ?? "?"} component.`
    : `Problem 947. ${stones.length} stones, ${view.groupCount ?? "?"} components.`;
  el.innerHTML = `<section class="stones947-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="stones947-phases">${phases}</div>
    <section class="stones947-rule"><b>${vi ? "MÔ HÌNH" : "MODEL"}</b><strong>(row, col) = edge&nbsp; Rrow ↔ Ccol</strong><span>${vi ? "Không có node “đá”: DSU gộp các hàng/cột mà đá nối lại." : "There is no “stone” node: DSU merges the row/column nodes joined by stones."}</span></section>
    <section class="stones947-stones"><header><strong>STONES = EDGES</strong><span>${vi ? "mỗi thẻ là một cạnh" : "each card is one edge"}</span></header><div>${stonesHtml}</div></section>
    ${operation}
    <section class="stones947-components"><header><strong>DSU COMPONENTS</strong><span>${view.groupCount ?? 0} ${vi ? "nhóm hàng/cột" : "row/column groups"}</span></header><div>${components}</div></section>
    <section class="stones947-parents"><header><strong>PARENT / ROOT</strong><span>${vi ? "size chỉ có nghĩa tại root" : "size matters only at roots"}</span><div>${parentRows}</div></section>
    <section class="stones947-answer ${ready ? "ready" : "pending"}"><small>${vi ? "ĐÁ CÓ THỂ BỎ" : "REMOVABLE STONES"}</small><strong>${ready ? `${stones.length} − ${view.groupCount} = ${view.answer}` : "…"}</strong><span>${vi ? "mỗi component giữ lại đúng một đá" : "leave exactly one stone in each component"}</span></section>
  </section>`;
}

// ---- 1061 Lexicographically Smallest Equivalent String renderer ----
function renderEquivalent1061View(step) {
  const view = step.equivalent1061View || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseOrder = { intro: 0, init: 1, merge: 2, translate: 3, done: 4 };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const phaseLabels = vi ? ["Ý tưởng", "Khởi tạo", "Gộp cặp", "Đổi baseStr", "Kết quả"] : ["Idea", "Initialize", "Merge pairs", "Map baseStr", "Result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "done" : index === activePhase ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const stateLabels = vi
    ? { pending: "chờ", active: "đang xét", merged: "đã gộp", same: "đã tương đương" }
    : { pending: "waiting", active: "checking", merged: "merged", same: "already equivalent" };
  const s1 = String(view.s1 || "");
  const s2 = String(view.s2 || "");
  const pairs = Array.from({ length: Math.min(s1.length, s2.length) }, (_, index) => {
    const state = (view.pairStates || [])[index] || "pending";
    return `<article class="equiv1061-pair ${state}${index === view.activePair ? " active" : ""}"><small>#${index + 1}</small><strong><b>${escapeHtml(s1[index])}</b><i>≈</i><b>${escapeHtml(s2[index])}</b></strong><em>${escapeHtml(stateLabels[state] || state)}</em></article>`;
  }).join("") || `<span class="equiv1061-empty">${vi ? "Chưa có cặp" : "No pairs"}</span>`;
  const output = (view.output || []).map((item, index) => `<span class="equiv1061-output ${item.value ? "mapped" : ""}${index === view.activeBaseIndex ? " active" : ""}"><small>${index}</small><b>${escapeHtml(item.source)}</b><i>→</i><strong>${escapeHtml(item.value || "?")}</strong></span>`).join("") || `<span class="equiv1061-empty">baseStr</span>`;
  const components = (view.components || []).map((component, index) => `<article class="equiv1061-component c${index % 4}"><header><small>SMALLEST ROOT</small><strong>${escapeHtml(component.root)}</strong></header><div>${(component.members || []).map((member) => `<b class="${member === component.root ? "root" : ""}">${escapeHtml(member)}</b>`).join("<i>≈</i>")}</div><em>${vi ? "mọi chữ ánh xạ về root này" : "every member maps to this root"}</em></article>`).join("") || `<span class="equiv1061-empty">${vi ? "Chưa có nhóm" : "No groups"}</span>`;
  const parents = (view.parentRows || []).map((row) => `<span class="equiv1061-parent ${row.letter === row.root ? "root" : ""}"><b>${escapeHtml(row.letter)}</b><i>→</i><strong>${escapeHtml(row.parent)}</strong><em>${vi ? "root" : "root"} ${escapeHtml(row.root)}</em></span>`).join("") || `<span class="equiv1061-empty">parent</span>`;
  const union = view.union;
  const operation = union
    ? `<section class="equiv1061-operation ${union.merged ? "merged" : "same"}"><small>${union.merged ? (vi ? "GIỮ ROOT NHỎ NHẤT" : "KEEP SMALLEST ROOT") : (vi ? "ĐÃ CÙNG ROOT" : "ALREADY SAME ROOT")}</small><strong>${escapeHtml(union.rootLeft)} &nbsp; ${union.merged ? "→" : "="} &nbsp; ${escapeHtml(union.rootRight)}</strong><span>${union.merged ? (vi ? "Root lớn hơn trỏ về root nhỏ hơn để find() luôn trả về chữ nhỏ nhất." : "The larger root points to the smaller one, so find() always returns the smallest letter.") : (vi ? "Cặp này không thay đổi DSU." : "This pair does not change the DSU.")}</span></section>`
    : `<section class="equiv1061-operation idle"><small>${vi ? "THAO TÁC" : "OPERATION"}</small><strong>${escapeHtml(view.event || "initialize")}</strong><span>${vi ? "Theo dõi root nhỏ nhất của mỗi nhóm chữ." : "Track the smallest root in each letter group."}</span></section>`;
  const ready = typeof view.answer === "string";
  const summary = vi ? `Bài 1061. baseStr ${view.baseStr || ""}.` : `Problem 1061. baseStr ${view.baseStr || ""}.`;
  el.innerHTML = `<section class="equiv1061-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="equiv1061-phases">${phases}</div>
    <section class="equiv1061-rule"><b>${vi ? "QUY TẮC" : "RULE"}</b><strong>parent[max(rootA, rootB)] = min(rootA, rootB)</strong><span>${vi ? "Vì root luôn nhỏ nhất, thay thế mỗi chữ chỉ cần gọi find(ch)." : "Because the root is always smallest, replacing a character only needs find(ch)."}</span></section>
    <section class="equiv1061-pairs"><header><strong>EQUIVALENT PAIRS</strong><span>${vi ? "vàng = đang xét" : "yellow = current"}</span></header><div>${pairs}</div></section>
    ${operation}
    <section class="equiv1061-components"><header><strong>EQUIVALENCE GROUPS</strong><span>${vi ? "root được tô đậm" : "the root is emphasized"}</span><div>${components}</div></section>
    <section class="equiv1061-output-section"><header><strong>MAP baseStr</strong><span>${vi ? "mỗi vị trí gọi find(ch)" : "each position calls find(ch)"}</span><div>${output}</div></section>
    <details class="equiv1061-parents"><summary>PARENT / ROOT</summary><div>${parents}</div></details>
    <section class="equiv1061-answer ${ready ? "ready" : "pending"}"><small>${vi ? "CHUỖI NHỎ NHẤT" : "SMALLEST STRING"}</small><strong>${escapeHtml(ready ? view.answer : "…")}</strong><span>${vi ? "mỗi chữ đã dùng đại diện nhỏ nhất của nhóm" : "each character uses its group's smallest representative"}</span></section>
  </section>`;
}

// ---- 305 Number of Islands II renderer ----
function renderIslands305View(step) {
  const view = step.islands305View || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseOrder = { intro: 0, init: 1, add: 2, merge: 3, count: 4, done: 4 };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const phaseLabels = vi ? ["Ý tưởng", "DSU nước", "Thêm đất", "Nối láng giềng", "Đếm đảo"] : ["Idea", "Water DSU", "Add land", "Join neighbors", "Count islands"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "done" : index === activePhase ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const coordText = (coord) => Array.isArray(coord) ? `(${coord[0]},${coord[1]})` : "—";
  const components = view.components || [];
  const componentForCell = new Map();
  components.forEach((component, index) => (component.members || []).forEach((coord) => componentForCell.set(`${coord[0]},${coord[1]}`, index)));
  const rows = Number(view.rows) || 0;
  const cols = Number(view.cols) || 0;
  const activeCellKey = Array.isArray(view.activeCell) ? view.activeCell.join(",") : "";
  const activeNeighborKey = Array.isArray(view.activeNeighbor) ? view.activeNeighbor.join(",") : "";
  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const node = row * cols + col;
      const land = Array.isArray(view.parent) && view.parent[node] !== -1;
      const key = `${row},${col}`;
      const component = componentForCell.get(key);
      const root = component === undefined ? null : components[component].root;
      const classes = ["islands305-cell", land ? "land" : "water", component === undefined ? "" : `c${component % 4}`, key === activeCellKey ? "active" : "", key === activeNeighborKey ? "neighbor" : ""].filter(Boolean).join(" ");
      cells.push(`<span class="${classes}"><small>${row},${col}</small><b>${land ? "LAND" : "WATER"}</b><em>${land ? `${vi ? "root" : "root"} ${coordText(root)}` : ""}</em></span>`);
    }
  }
  const statusLabels = vi
    ? { pending: "chờ", active: "đang xét", land: "đất mới", done: "đã ghi", duplicate: "lặp" }
    : { pending: "waiting", active: "checking", land: "new land", done: "recorded", duplicate: "duplicate" };
  const timeline = (view.positions || []).map((position, index) => {
    const status = (view.statuses || [])[index] || "pending";
    const count = (view.counts || [])[index];
    return `<span class="islands305-position ${status}${index === view.activeIndex ? " active" : ""}"><small>#${index + 1}</small><b>${escapeHtml(coordText(position))}</b><em>${escapeHtml(statusLabels[status] || status)}</em><strong>${count === null || count === undefined ? "—" : count}</strong></span>`;
  }).join("") || `<span class="islands305-empty">${vi ? "Chưa có position" : "No positions"}</span>`;
  const union = view.union;
  const operation = union
    ? `<section class="islands305-operation ${union.merged ? "merged" : "same"}"><small>UNION</small><strong>${escapeHtml(coordText(union.from))} ↔ ${escapeHtml(coordText(union.to))}</strong><span>${union.merged ? (vi ? "Hai đảo chạm nhau → giảm islands đi 1." : "Two islands touch → decrease islands by 1.") : (vi ? "Đã cùng một đảo → counter giữ nguyên." : "Already one island → counter stays the same.")}</span></section>`
    : `<section class="islands305-operation idle"><small>${vi ? "SỰ KIỆN" : "EVENT"}</small><strong>${escapeHtml(view.event || "initialize")}</strong><span>${vi ? "Theo dõi counter islands sau mỗi thay đổi." : "Track the islands counter after every change."}</span></section>`;
  const componentCards = components.map((component, index) => `<article class="islands305-component c${index % 4}"><header><small>ROOT</small><strong>${escapeHtml(coordText(component.root))}</strong></header><div>${(component.members || []).map((member) => `<b>${escapeHtml(coordText(member))}</b>`).join("")}</div><em>size ${escapeHtml(component.size)}</em></article>`).join("") || `<span class="islands305-empty">${vi ? "Chưa có đảo" : "No islands yet"}</span>`;
  const parents = (view.parentRows || []).map((row) => `<span class="islands305-parent"><b>${escapeHtml(coordText(row.node))}</b><i>→</i><strong>${escapeHtml(coordText(row.parent))}</strong><em>${vi ? "root" : "root"} ${escapeHtml(coordText(row.root))}${row.size === null ? "" : ` · size ${row.size}`}</em></span>`).join("") || `<span class="islands305-empty">parent = −1 (${vi ? "toàn nước" : "all water"})</span>`;
  const answer = (view.counts || []).map((count) => count === null || count === undefined ? "—" : count).join(", ");
  const summary = vi ? `Bài 305. ${rows} × ${cols}, hiện có ${view.islands ?? 0} đảo.` : `Problem 305. ${rows} × ${cols}, currently ${view.islands ?? 0} islands.`;
  el.innerHTML = `<section class="islands305-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="islands305-phases">${phases}</div>
    <section class="islands305-rule"><b>${vi ? "QUY TẮC" : "RULE"}</b><strong>new land: islands + 1 &nbsp;•&nbsp; successful union: islands − 1</strong><span>${vi ? "Nước có parent = −1; chỉ các ô đất mới là node DSU hoạt động." : "Water has parent = −1; only land cells are active DSU nodes."}</span></section>
    <section class="islands305-timeline"><header><strong>POSITIONS → ISLAND COUNT</strong><span>${vi ? "số bên phải = đáp án sau lần thêm" : "right value = answer after that addition"}</span><div>${timeline}</div></section>
    ${operation}
    <section class="islands305-grid-section"><header><strong>GRID ${rows} × ${cols}</strong><span>${vi ? "màu giống nhau = cùng component" : "same color = same component"}</span><div class="islands305-grid" style="--islands305-cols:${Math.max(cols, 1)}">${cells.join("")}</div></section>
    <section class="islands305-components"><header><strong>ACTIVE ISLAND COMPONENTS</strong><span>${view.islands ?? 0} ${vi ? "đảo" : "islands"}</span><div>${componentCards}</div></section>
    <details class="islands305-parents"><summary>PARENT / ROOT</summary><div>${parents}</div></details>
    <section class="islands305-answer"><small>${vi ? "ANSWER" : "ANSWER"}</small><strong>[${escapeHtml(answer)}]</strong><span>${vi ? "mỗi phần tử là số đảo sau một position" : "each entry is the island count after one position"}</span></section>
  </section>`;
}

// ---- Inclusion–Exclusion / multiples / binary-search renderer ----
function renderMultiplesIeView(step) {
  const view = step.multiplesIeView || {};
  const el = $("treeView");
  const vi = lang === "vi";
  const isSum = view.mode === "sum";
  const phaseOrder = isSum
    ? { intro: 0, init: 1, check: 2, add: 2, answer: 3 }
    : { intro: 0, init: 1, count: 2, move: 3, answer: 4, done: 4 };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const phaseLabels = isSum
    ? (vi ? ["Ý tưởng", "Duyệt 1..n", "Kiểm tra OR", "Tổng"] : ["Idea", "Scan 1..n", "Check OR", "Sum"])
    : (vi ? ["Công thức", "Khoảng", "Đếm mid", "Thu hẹp", "Đáp án"] : ["Formula", "Range", "Count mid", "Narrow", "Answer"]);
  const phases = phaseLabels.map((label, index) => {
    const state = index < activePhase ? "done" : index === activePhase ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : index + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");
  const divisors = Array.isArray(view.divisors) ? view.divisors : [];
  const divisorCards = divisors.map((divisor, index) => `<span class="mie-divisor c${index % 4}"><small>${vi ? "TẬP BỘI" : "MULTIPLES"}</small><strong>${escapeHtml(divisor)}</strong><em>${vi ? `bội của ${divisor}` : `multiples of ${divisor}`}</em></span>`).join("");
  const current = view.current;
  const terms = (current?.terms || []).map((term, index) => `<article class="mie-term ${term.sign === "−" ? "subtract" : "add"}"><small>${escapeHtml(term.sign === "−" ? (vi ? "TRỪ" : "SUBTRACT") : (vi ? "CỘNG" : "ADD"))}</small><strong>${escapeHtml(term.label)}</strong><span>${vi ? "LCM" : "LCM"} = ${escapeHtml(term.divisor)}</span><b>${escapeHtml(term.value)}</b></article>`).join("") || `<span class="mie-empty">${isSum ? (vi ? "Theo dõi từng số ở dưới" : "Follow each number below") : (vi ? "Chọn một mid để bung công thức đếm" : "Choose a mid to expand the counting formula")}</span>`;
  let main = "";
  if (isSum) {
    const n = Number(view.target) || 0;
    const values = Array.from({ length: n }, (_, index) => index + 1).map((value) => {
      const chosen = Boolean((view.included || [])[value]);
      const active = value === view.scanIndex;
      const multiples = divisors.filter((divisor) => value % divisor === 0).join(", ");
      return `<span class="mie-number ${chosen ? "included" : ""}${active ? " active" : ""}"><small>${value}</small><b>${chosen ? "+" : "·"}</b><em>${chosen ? (vi ? `bội ${multiples}` : `multiple of ${multiples}`) : ""}</em></span>`;
    }).join("");
    main = `<section class="mie-number-grid-section"><header><strong>1 … ${n}</strong><span>${vi ? "xanh = đã cộng đúng một lần" : "green = added exactly once"}</span></header><div class="mie-number-grid">${values}</div></section>`;
  } else {
    const bounds = Number.isInteger(view.lo) && Number.isInteger(view.hi)
      ? `<section class="mie-bounds"><span><small>lo</small><strong>${view.lo}</strong></span><span class="mid"><small>mid</small><strong>${view.mid ?? "—"}</strong></span><span><small>hi</small><strong>${view.hi}</strong></span></section>`
      : "";
    const history = (view.history || []).slice(-12).map((entry) => `<span class="mie-history ${entry.passed ? "pass" : "fail"}"><small>[${entry.lo}, ${entry.hi}]</small><b>${entry.mid}</b><em>${escapeHtml(entry.label)}</em><strong>${entry.passed ? "≥" : "<"}</strong></span>`).join("") || `<span class="mie-empty">${vi ? "Chưa có lần check" : "No check yet"}</span>`;
    main = `${bounds}<section class="mie-terms"><header><strong>${vi ? "COUNT(mid)" : "COUNT(mid)"}</strong><span>${current ? `${vi ? "kết quả" : "result"}: ${escapeHtml(current.label || current.count)}` : (vi ? "chờ mid" : "waiting for a mid")}</span></header><div>${terms}</div></section><section class="mie-history-section"><header><strong>BINARY SEARCH LOG</strong><span>${vi ? "≥ target: giữ nửa trái" : "≥ target: keep left half"}</span></header><div>${history}</div></section>`;
  }
  const ready = view.answer !== null && view.answer !== undefined;
  const detail = isSum
    ? (vi ? "mỗi số thỏa OR được cộng một lần" : "every value satisfying OR is added once")
    : (vi ? "x nhỏ nhất thỏa điều kiện count(x)" : "smallest x satisfying count(x)");
  const summary = vi ? `Bài ${step.problemId || ""}. ${isSum ? "tổng bội số" : "bao hàm–loại trừ và binary search"}.` : `Multiples / inclusion–exclusion visualization.`;
  el.innerHTML = `<section class="mie-viz ${isSum ? "sum" : "binary"}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="mie-phases">${phases}</div>
    <section class="mie-rule"><b>${isSum ? "OR" : "I–E"}</b><strong>${escapeHtml(view.formula || "—")}</strong><span>${isSum ? (vi ? "Cùng lúc chia hết nhiều ước vẫn chỉ cộng một lần." : "Divisible by several divisors still means one addition.") : (vi ? "Dấu cộng/trừ loại bỏ việc đếm trùng giữa các tập bội số." : "The plus/minus signs remove double counting between multiple sets.")}</span></section>
    <section class="mie-divisors"><header><strong>${isSum ? (vi ? "ƯỚC SỐ" : "DIVISORS") : (vi ? "CÁC TẬP BỘI SỐ" : "MULTIPLE SETS")}</strong><span>${escapeHtml(view.targetLabel || "")}</span></header><div>${divisorCards}</div></section>
    ${main}
    <section class="mie-answer ${ready ? "ready" : "pending"}"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${ready ? escapeHtml(view.answer) : "…"}</strong><span>${escapeHtml(detail)}</span></section>
  </section>`;
}

function renderDiceRoll1223View(step) {
  const view = step.diceRoll1223View || {};
  const vi = lang === "vi";
  const rollMax = Array.isArray(view.rollMax) ? view.rollMax : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const totals = Array.isArray(view.totals) ? view.totals : [];
  const previousTotals = Array.isArray(view.previousTotals) ? view.previousTotals : [];
  const repeatWays = Array.isArray(view.repeatWays) ? view.repeatWays : [];
  const maxStreak = Math.max(1, Number(view.maxStreak) || 1);
  const currentFace = Number.isInteger(view.currentFace) ? view.currentFace : -1;
  const currentRoll = Number(view.currentRoll) || 1;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Khởi tạo", "Điền từng mặt", "Chốt lớp DP", "Cộng đáp án"]
    : ["Initialize", "Fill each face", "Commit DP layer", "Sum answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const timeline = Array.from({ length: view.n || 1 }, (_, index) => {
    const roll = index + 1;
    const classes = roll < currentRoll ? "done" : roll === currentRoll ? "current" : "";
    return `<span class="${classes}"><small>ROLL</small><b>${roll}</b></span>`;
  }).join("<i>→</i>");

  const streakHeaders = Array.from({ length: maxStreak }, (_, index) => `<span><small>STREAK</small><b>${index + 1}</b></span>`).join("");
  const tableRows = dp.map((row, face) => {
    const isCurrent = face === currentFace;
    const isPending = view.phase === "face" && face >= Number(view.completedFaces || 0);
    const cells = Array.from({ length: maxStreak }, (_, index) => {
      const streak = index + 1;
      const blocked = streak > rollMax[face];
      const classes = [
        "dr1223-cell",
        blocked ? "blocked" : "",
        isCurrent && streak === 1 ? "switch" : "",
        isCurrent && streak > 1 && streak <= rollMax[face] ? "repeat" : "",
      ].filter(Boolean).join(" ");
      return `<span class="${classes}"><small>${blocked ? "LIMIT" : `s=${streak}`}</small><b>${blocked ? "×" : (row[index + 1] ?? 0)}</b></span>`;
    }).join("");
    return `<div class="dr1223-row ${isCurrent ? "current" : ""} ${isPending ? "pending" : ""}">
      <header><span class="dr1223-die" aria-hidden="true">${face + 1}</span><div><strong>${vi ? "Mặt" : "Face"} ${face + 1}</strong><small>rollMax = ${rollMax[face]}</small></div></header>
      ${cells}
      <span class="dr1223-total"><small>TOTAL</small><b>${totals[face] ?? 0}</b></span>
    </div>`;
  }).join("");

  let transition;
  if (view.phase === "face" && currentFace >= 0) {
    const sources = previousTotals.map((value, face) => `<span class="${face === currentFace ? "excluded" : "included"}"><small>${vi ? "mặt" : "face"} ${face + 1}</small><b>${value}</b><em>${face === currentFace ? (vi ? "loại" : "exclude") : "+"}</em></span>`).join("");
    const repeats = repeatWays.length
      ? repeatWays.map((item) => `<span><small>streak ${item.fromStreak}</small><b>${item.ways}</b><i>→</i><small>streak ${item.toStreak}</small></span>`).join("")
      : `<p>${vi ? `rollMax[${currentFace}] = 1 nên mặt này không thể lặp.` : `rollMax[${currentFace}] = 1, so this face cannot repeat.`}</p>`;
    transition = `<section class="dr1223-transition">
      <div class="dr1223-switch"><header><strong>${vi ? "A. ĐỔI SANG MẶT" : "A. SWITCH TO FACE"} ${currentFace + 1}</strong><span>new streak = 1</span></header><div class="dr1223-sources">${sources}</div><footer><code>${view.previousTotal} − ${previousTotals[currentFace]} = ${view.switchWays}</code><span>→ dp[${currentFace + 1}][1]</span></footer></div>
      <div class="dr1223-repeat"><header><strong>${vi ? "B. LẶP MẶT" : "B. REPEAT FACE"} ${currentFace + 1}</strong><span>streak + 1 ≤ ${rollMax[currentFace]}</span></header><div>${repeats}</div></div>
    </section>`;
  } else if (view.phase === "init") {
    transition = `<section class="dr1223-base"><b>dp[face][1] = 1</b><span>${vi ? "Sáu lựa chọn cho lần gieo đầu tiên; chưa có mặt nào vi phạm giới hạn." : "Six choices for the first roll; no face can violate its limit yet."}</span></section>`;
  } else {
    transition = `<section class="dr1223-base ${view.final ? "finish" : ""}"><b>${view.final ? `answer = ${view.total}` : `dp = next_dp · roll ${currentRoll}`}</b><span>${view.final ? (vi ? "Mỗi ô là một nhóm chuỗi rời nhau, phân loại theo trạng thái cuối." : "Each cell is a disjoint group of sequences classified by its final state.") : (vi ? "Sáu hàng đã hoàn tất và sẵn sàng cho lần gieo kế tiếp." : "All six rows are complete and ready for the next roll.")}</span></section>`;
  }

  const currentBuilt = totals.reduce((sum, value) => sum + value, 0) % 1000000007;
  const final = Boolean(view.final);
  const summary = vi
    ? `Bảng DP cho ${currentRoll} lần gieo, tổng hiện tại ${currentBuilt}.`
    : `DP table for ${currentRoll} rolls, current total ${currentBuilt}.`;

  $("treeView").innerHTML = `<section class="dr1223-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>STATE DP · RUN LENGTH · #1223</small><strong>DICE ROLL SIMULATION</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="dr1223-phases">${phases}</div>
    <section class="dr1223-rule"><b>dp[face][streak]</b><span>${vi ? "Số chuỗi kết thúc bằng face, với face lặp đúng streak lần ở cuối." : "Sequences ending in face, with exactly streak copies of face at the end."}</span></section>
    <section class="dr1223-timeline"><header><strong>${vi ? "ĐỘ DÀI CHUỖI" : "SEQUENCE LENGTH"}</strong><span>${currentRoll}/${view.n}</span></header><div>${timeline}</div></section>
    <section class="dr1223-metrics"><div><small>${vi ? "lần gieo" : "roll"}</small><strong>${currentRoll}/${view.n}</strong></div><div><small>${vi ? "mặt đang điền" : "face being filled"}</small><strong>${currentFace >= 0 ? currentFace + 1 : "—"}</strong></div><div><small>${vi ? "hàng hoàn tất" : "rows complete"}</small><strong>${view.completedFaces || 0}/6</strong></div><div class="answer"><small>${vi ? "chuỗi trong lớp" : "ways in layer"}</small><strong>${currentBuilt}</strong></div></section>
    <section class="dr1223-table"><header><strong>DP STATE TABLE</strong><span>${vi ? "cam = đổi mặt · tím = kéo dài streak · × = bị giới hạn" : "amber = switch · purple = extend streak · × = blocked by limit"}</span></header><div class="dr1223-table-scroll"><div class="dr1223-grid" style="--dr1223-streaks:${maxStreak}"><div class="dr1223-grid-head"><span>ENDING FACE</span>${streakHeaders}<span>ROW TOTAL</span></div>${tableRows}</div></div></section>
    ${transition}
    <section class="dr1223-action"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="dr1223-result ${final ? "done" : ""}"><small>VALID SEQUENCES MOD 1,000,000,007</small><strong>${final ? view.total : "…"}</strong><span>${final ? (vi ? "Cộng tổng của cả sáu mặt kết thúc." : "Sum the totals for all six ending faces.") : (vi ? "Mỗi lần gieo chỉ đọc lớp trước." : "Each roll reads only the previous layer.")}</span></footer>
  </section>`;
}

function renderCyclicShift4052View(step) {
  const view = step.cyclicShift4052View || {};
  const vi = lang === "vi";
  const n = Math.max(1, Number(view.n) || 1);
  const original = Array.isArray(view.original) ? view.original : [];
  const afterRows = Array.isArray(view.afterRows) ? view.afterRows : [];
  const result = Array.isArray(view.result) ? view.result : [];
  const rowShift = Array.isArray(view.rowShift) ? view.rowShift : [];
  const colShift = Array.isArray(view.colShift) ? view.colShift : [];
  const mappings = Array.isArray(view.mappings) ? view.mappings : [];
  const activeRow = Number.isInteger(view.activeRow) ? view.activeRow : -1;
  const activeCol = Number.isInteger(view.activeCol) ? view.activeCol : -1;
  const sourceRow = Number.isInteger(view.sourceRow) ? view.sourceRow : -1;
  const sourceCol = Number.isInteger(view.sourceCol) ? view.sourceCol : -1;
  const targetRow = Number.isInteger(view.targetRow) ? view.targetRow : -1;
  const targetCol = Number.isInteger(view.targetCol) ? view.targetCol : -1;
  const operation = view.operation || "idle";
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const labels = vi
    ? ["Grid gốc", "Dịch hàng ←", "Dịch cột ↑", "Kết quả"]
    : ["Original grid", "Shift rows ←", "Shift columns ↑", "Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  function matrixHtml(matrix, kind) {
    const cells = [];
    for (let row = 0; row < n; row += 1) {
      for (let col = 0; col < n; col += 1) {
        const value = matrix[row]?.[col];
        const classes = ["cs4052-cell"];
        if (value == null) classes.push("empty");
        const hasSourceCell = sourceRow >= 0 && sourceCol >= 0;
        const hasTargetCell = targetRow >= 0 && targetCol >= 0;
        if (kind === "original" && view.phase === "rows" && (hasSourceCell ? row === sourceRow && col === sourceCol : row === activeRow)) classes.push("source");
        if (kind === "rows" && view.phase === "rows" && hasTargetCell && row === targetRow && col === targetCol) classes.push("target");
        if (kind === "rows" && view.phase === "columns" && (hasSourceCell ? row === sourceRow && col === sourceCol : col === activeCol)) classes.push("source");
        if (kind === "result" && view.phase === "columns" && hasTargetCell && row === targetRow && col === targetCol) classes.push("target");
        if (kind === "result" && view.final) classes.push("final");
        cells.push(`<span class="${classes.join(" ")}"><small>${row},${col}</small><b>${value == null ? "·" : escapeHtml(value)}</b></span>`);
      }
    }
    return `<div class="cs4052-grid" style="--cs4052-n:${n}">${cells.join("")}</div>`;
  }

  const rowVector = rowShift.map((shift, index) => `<span class="${index === activeRow ? "active" : index < Number(view.rowsDone || 0) ? "done" : ""}"><small>r${index}</small><b>${shift}</b><i>←</i></span>`).join("");
  const colVector = colShift.map((shift, index) => `<span class="${index === activeCol ? "active" : index < Number(view.colsDone || 0) ? "done" : ""}"><small>c${index}</small><b>${shift}</b><i>↑</i></span>`).join("");

  let mappingHtml;
  if (view.phase === "rows" && mappings.length) {
    mappingHtml = mappings.map((mapping) => `<span><small>value ${mapping.value}</small><b>c${mapping.from}</b><i>→</i><b>c${mapping.to}</b></span>`).join("");
  } else if (view.phase === "columns" && mappings.length) {
    mappingHtml = mappings.map((mapping) => `<span><small>value ${mapping.value}</small><b>r${mapping.from}</b><i>→</i><b>r${mapping.to}</b></span>`).join("");
  } else if (view.phase === "rows") {
    mappingHtml = `<p>${operation === "row-loop" ? (vi ? "Chọn hàng tiếp theo." : "Select the next row.") : (vi ? "Chọn ô nguồn tiếp theo trong hàng." : "Select the next source cell in the row.")}</p>`;
  } else if (view.phase === "columns") {
    mappingHtml = `<p>${operation === "column-loop" ? (vi ? "Chọn cột tiếp theo." : "Select the next column.") : (vi ? "Chọn ô nguồn tiếp theo trong cột." : "Select the next source cell in the column.")}</p>`;
  } else {
    mappingHtml = `<p>${view.final ? (vi ? "Mọi phần tử đã tới tọa độ cuối." : "Every element has reached its final coordinate.") : (vi ? "Chọn một hàng để bắt đầu dịch trái." : "Select a row to begin shifting left.")}</p>`;
  }

  const formulas = {
    "init-rows": "after_rows = [[0] * n for _ in range(n)]",
    "init-result": "result = [[0] * n for _ in range(n)]",
    "row-loop": "for row in range(n)",
    "row-cell": "for col in range(n)",
    "row-target": `target_col = (${activeCol} − ${view.shift}) % ${n} = ${targetCol}`,
    "row-write": `after_rows[${activeRow}][${targetCol}] = grid[${sourceRow}][${sourceCol}]`,
    "column-loop": "for col in range(n)",
    "column-cell": "for row in range(n)",
    "column-target": `target_row = (${activeRow} − ${view.shift}) % ${n} = ${targetRow}`,
    "column-write": `result[${targetRow}][${activeCol}] = after_rows[${sourceRow}][${sourceCol}]`,
    return: "return result",
  };
  const formula = formulas[operation] || "rows first → columns second";
  const final = Boolean(view.final);
  const resultText = final ? JSON.stringify(result) : "…";
  const summary = vi
    ? `Dịch vòng grid ${n} x ${n}: ${view.rowsDone || 0} hàng và ${view.colsDone || 0} cột đã xử lý.`
    : `Cyclic shift of a ${n} by ${n} grid: ${view.rowsDone || 0} rows and ${view.colsDone || 0} columns processed.`;

  $("treeView").innerHTML = `<section class="cs4052-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>2D ARRAY · CYCLIC MAPPING · #4052</small><strong>SHIFT ROWS, THEN COLUMNS</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="cs4052-phases">${phases}</div>
    <section class="cs4052-order"><span><b>1</b>${vi ? "Mỗi hàng dịch trái độc lập" : "Each row shifts left independently"}</span><i>→</i><span><b>2</b>${vi ? "Mỗi cột của grid trung gian dịch lên" : "Each intermediate-grid column shifts up"}</span></section>
    <section class="cs4052-vectors"><div><header><strong>rowShift</strong><span>${vi ? "vị trí sang trái" : "positions left"}</span></header><div>${rowVector}</div></div><div><header><strong>colShift</strong><span>${vi ? "vị trí lên trên" : "positions up"}</span></header><div>${colVector}</div></div></section>
    <section class="cs4052-matrices">
      <article><header><strong>ORIGINAL</strong><span>${n} × ${n}</span></header>${matrixHtml(original, "original")}</article>
      <i>→</i>
      <article><header><strong>AFTER ROW SHIFTS</strong><span>${view.rowsDone || 0}/${n}</span></header>${matrixHtml(afterRows, "rows")}</article>
      <i>→</i>
      <article><header><strong>FINAL GRID</strong><span>${view.colsDone || 0}/${n}</span></header>${matrixHtml(result, "result")}</article>
    </section>
    <section class="cs4052-mapping"><header><strong>${vi ? "ÁNH XẠ TRONG BƯỚC NÀY" : "MAPPING IN THIS STEP"}</strong><code>${escapeHtml(formula)}</code></header><div>${mappingHtml}</div></section>
    <section class="cs4052-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="cs4052-result ${final ? "done" : ""}"><small>RESULT GRID</small><strong>${escapeHtml(resultText)}</strong><span>${final ? (vi ? "Thứ tự hàng trước, cột sau đã được giữ nguyên." : "The required row-first, column-second order is preserved.") : (vi ? "Dấu · là ô chưa được ghi trong giai đoạn hiện tại." : "A · marks a cell not yet written in the current phase.")}</span></footer>
  </section>`;
}

function renderShadowPairs4054View(step) {
  const view = step.shadowPairs4054View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const candidates = Array.isArray(view.candidates) ? view.candidates : [];
  const qualifying = Array.isArray(view.qualifying) ? view.qualifying : [];
  const qualifyingIndices = new Set(qualifying.map((item) => item.index));
  const j = Number.isInteger(view.j) ? view.j : -1;
  const value = view.value;
  const smaller = Number.isInteger(view.smaller) ? view.smaller : 0;
  const operation = view.operation || "idle";
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const labels = vi
    ? ["Ứng viên", "Đếm < x", "Loại > x", "Push x", "Kết quả"]
    : ["Candidates", "Count < x", "Prune > x", "Push x", "Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const arrayHtml = nums.map((number, index) => {
    const classes = ["sp4054-cell"];
    if (index < j) classes.push("processed");
    if (index === j) classes.push("current");
    if (qualifyingIndices.has(index)) classes.push("pair-source");
    if (view.popped && index === view.popped.index) classes.push("removed");
    return `<span class="${classes.join(" ")}"><small>i=${index}</small><b>${escapeHtml(number)}</b></span>`;
  }).join("");

  const stackHtml = candidates.length
    ? candidates.map((item, index) => {
      const classes = ["sp4054-stack-item"];
      if (qualifyingIndices.has(item.index)) classes.push("qualifying");
      if (j >= 0 && item.index === j) classes.push("new");
      if (value != null && item.value === value && item.index !== j) classes.push("equal");
      if (value != null && item.value > value) classes.push("greater");
      return `<span class="${classes.join(" ")}"><small>#${index} · i=${item.index}</small><b>${escapeHtml(item.value)}</b></span>`;
    }).join("")
    : `<p>${vi ? "Stack đang rỗng." : "The stack is empty."}</p>`;

  const pairsHtml = qualifying.length && j >= 0
    ? qualifying.map((item) => `<span><b>(${item.index}, ${j})</b><small>${item.value} &lt; ${escapeHtml(value)}</small></span>`).join("")
    : `<p>${j < 0 ? (vi ? "Chưa xét đầu phải." : "No right endpoint yet.") : (vi ? "Không có cặp mới ở bước này." : "No new pair at this step.")}</p>`;

  const formulas = {
    "init-stack": "stack = []",
    "init-answer": "answer = 0",
    scan: j >= 0 ? `j = ${j}, value = ${value}` : "for j, value in enumerate(nums)",
    "binary-search": `bisect_left(stack, ${value}) = ${smaller}`,
    "add-count": `answer = ${view.answerBefore} + ${smaller} = ${view.answer}`,
    "check-pop": candidates.length ? `${candidates[candidates.length - 1].value} > ${value} → ${view.shouldPop ? "True" : "False"}` : `empty stack → False`,
    pop: view.popped ? `pop (${view.popped.index}, ${view.popped.value})` : "stack.pop()",
    push: `stack.append(${value})`,
    return: `return ${view.answer}`,
  };
  const formula = formulas[operation] || "suffix-minimum candidates";
  const currentDelta = operation === "add-count" ? smaller : 0;
  const processedCount = view.final ? nums.length : Math.max(0, j + 1);
  const summary = vi
    ? `Đếm shadow pair: đã duyệt ${processedCount} trên ${nums.length} phần tử, answer bằng ${view.answer || 0}.`
    : `Counting shadow pairs: processed ${processedCount} of ${nums.length} values, answer is ${view.answer || 0}.`;

  $("treeView").innerHTML = `<section class="sp4054-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>MONOTONIC STACK · BINARY SEARCH · #4054</small><strong>COUNT SHADOW PAIRS I</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="sp4054-phases">${phases}</div>
    <section class="sp4054-invariant"><strong>${vi ? "BẤT BIẾN" : "INVARIANT"}</strong><span>${vi ? "Stack tăng không giảm và chỉ giữ các i chưa gặp phần tử nhỏ hơn ở bên phải." : "The stack is nondecreasing and keeps only indices not followed by a smaller processed value."}</span></section>
    <section class="sp4054-array"><header><strong>NUMS</strong><span>${vi ? "tím = đầu phải j · xanh = đầu trái hợp lệ" : "purple = right endpoint j · green = valid left endpoint"}</span></header><div>${arrayHtml}</div></section>
    <section class="sp4054-workspace">
      <article><header><strong>CANDIDATE STACK</strong><span>${candidates.length} ${vi ? "ứng viên" : "candidates"}</span></header><div class="sp4054-stack">${stackHtml}</div><footer><span>&lt; ${value == null ? "x" : escapeHtml(value)}</span><b>${smaller}</b><small>${vi ? "phần tử đứng trước vị trí bisect" : "entries before the bisect position"}</small></footer></article>
      <article><header><strong>${vi ? "CẶP MỚI" : "NEW PAIRS"}</strong><span>+${currentDelta}</span></header><div class="sp4054-pairs">${pairsHtml}</div><footer><span>answer</span><b>${view.answer || 0}</b><small>${vi ? `trước bước: ${view.answerBefore ?? view.answer ?? 0}` : `before this step: ${view.answerBefore ?? view.answer ?? 0}`}</small></footer></article>
    </section>
    <section class="sp4054-operation"><header><strong>${vi ? "PHÉP TOÁN" : "OPERATION"}</strong><code>${escapeHtml(formula)}</code></header>${view.popped ? `<span class="removed">${vi ? "Đã pop" : "Popped"}: i=${view.popped.index}, value=${view.popped.value}</span>` : `<span>${vi ? "Giữ value bằng x; chỉ pop value lớn hơn x." : "Equal values stay; only values greater than x are popped."}</span>`}</section>
    <section class="sp4054-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="sp4054-result ${view.final ? "done" : ""}"><small>SHADOW PAIRS</small><strong>${view.final ? view.answer : "…"}</strong><span>${view.final ? (vi ? "Tất cả đầu phải j đã được xử lý." : "Every right endpoint j has been processed.") : (vi ? "Mỗi bước chỉ thực thi một dòng code." : "Every step executes exactly one source line.")}</span></footer>
  </section>`;
}

function renderShadowPairs4055View(step) {
  const view = step.shadowPairs4055View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const upper = Array.isArray(view.upper) ? view.upper : [];
  const lower = Array.isArray(view.lower) ? view.lower : [];
  const active = Array.isArray(view.active) ? view.active : [];
  const qualifying = Array.isArray(view.qualifying) ? view.qualifying : [];
  const rejected = Array.isArray(view.rejected) ? view.rejected : [];
  const activeIndices = new Set(active.map((item) => item.index));
  const qualifyingIndices = new Set(qualifying.map((item) => item.index));
  const rejectedIndices = new Set(rejected.map((item) => item.index));
  const left = Number.isInteger(view.left) ? view.left : 0;
  const right = Number.isInteger(view.right) ? view.right : nums.length - 1;
  const middle = Number.isInteger(view.middle) ? view.middle : null;
  const currentRight = view.currentRight || null;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const labels = vi
    ? ["Chia đoạn", "Tính b / c", "Sweep Fenwick", "Gộp", "Kết quả"]
    : ["Split", "Build b / c", "Fenwick sweep", "Combine", "Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const boundText = (value, positive) => Number.isFinite(value) ? escapeHtml(value) : positive ? "+∞" : "−∞";

  const arrayHtml = nums.map((number, index) => {
    const classes = ["spii4055-cell"];
    if (index >= left && index <= right) classes.push("segment");
    if (middle != null && index >= left && index <= middle) classes.push("left-half");
    if (middle != null && index > middle && index <= right) classes.push("right-half");
    if (currentRight && index === currentRight.index) classes.push("current-right");
    if (activeIndices.has(index)) classes.push("active-left");
    if (qualifyingIndices.has(index)) classes.push("qualifying");
    if (rejectedIndices.has(index)) classes.push("rejected");
    return `<span class="${classes.join(" ")}"><small>i=${index}</small><b>${escapeHtml(number)}</b></span>`;
  }).join("");

  const upperHtml = upper.length
    ? upper.map((item) => `<span class="${qualifyingIndices.has(item.index) ? "qualifying" : rejectedIndices.has(item.index) ? "rejected" : activeIndices.has(item.index) ? "active" : ""}"><small>i=${item.index}</small><b>${item.value}</b><i>≤ b=${boundText(item.bound, true)}</i></span>`).join("")
    : `<p>${vi ? "Chưa tính b[i]." : "No b[i] bounds yet."}</p>`;
  const lowerHtml = lower.length
    ? lower.map((item) => `<span class="${currentRight && currentRight.index === item.index ? "current" : ""}"><small>j=${item.index}</small><i>c=${boundText(item.bound, false)} ≤</i><b>${item.value}</b></span>`).join("")
    : `<p>${vi ? "Chưa tính c[j]." : "No c[j] bounds yet."}</p>`;

  const pairsHtml = qualifying.length && currentRight
    ? qualifying.map((item) => `<span><b>(${item.index}, ${currentRight.index})</b><small>${boundText(currentRight.bound, false)} ≤ ${item.value} &lt; ${currentRight.value} ≤ ${boundText(item.bound, true)}</small></span>`).join("")
    : `<p>${vi ? "Chưa có cặp băng qua ở bước này." : "No crossing pair at this step."}</p>`;

  const formulas = {
    "base-check": `left (${left}) >= right (${right})`,
    "base-return": "return 0",
    split: middle == null ? "middle = (left + right) // 2" : `middle = (${left} + ${right}) // 2 = ${middle}`,
    "combine-halves": `${view.leftAnswer || 0} + ${view.rightAnswer || 0} = ${view.subtotal || 0}`,
    "upper-bound": "b[i] = min(value > nums[i] in left suffix)",
    "lower-bound": "c[j] = max(value < nums[j] in right prefix)",
    "sort-right": "right_indices.sort(key = nums[j])",
    "select-right": currentRight ? `j=${currentRight.index}, nums[j]=${currentRight.value}` : "for j in right_indices",
    "active-window": currentRight ? `nums[i] < ${currentRight.value} ≤ b[i]` : "nums[i] < nums[j] ≤ b[i]",
    "query-lower": currentRight ? `${boundText(currentRight.bound, false)} ≤ nums[i]` : "c[j] ≤ nums[i]",
    "add-cross": `answer += ${qualifying.length}`,
    "return-segment": `return ${view.subtotal || 0}`,
    "return-final": `return ${view.subtotal || 0}`,
  };
  const formula = formulas[view.operation] || "c[j] ≤ nums[i] < nums[j] ≤ b[i]";
  const summary = vi
    ? `Đếm shadow pair II trên đoạn ${left} đến ${right}; subtotal ${view.subtotal || 0}.`
    : `Counting Shadow Pairs II on segment ${left} through ${right}; subtotal ${view.subtotal || 0}.`;

  $("treeView").innerHTML = `<section class="spii4055-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>DIVIDE & CONQUER · FENWICK · #4055</small><strong>COUNT SHADOW PAIRS II</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="spii4055-phases">${phases}</div>
    <section class="spii4055-segment"><header><strong>${vi ? "ĐOẠN ĐỆ QUY" : "RECURSIVE SEGMENT"}</strong><span>depth ${view.depth || 0}</span></header><div><b>[${left}, ${right}]</b>${middle == null ? "" : `<span>[${left}, ${middle}]</span><i>+</i><span>[${middle + 1}, ${right}]</span>`}</div></section>
    <section class="spii4055-array"><header><strong>NUMS</strong><span>${vi ? "xanh = nửa trái · tím = nửa phải" : "green = left half · purple = right half"}</span></header><div>${arrayHtml}</div></section>
    <section class="spii4055-bounds">
      <article><header><strong>LEFT BOUNDS · b[i]</strong><span>nums[i] &lt; nums[j] ≤ b[i]</span></header><div>${upperHtml}</div></article>
      <article><header><strong>RIGHT BOUNDS · c[j]</strong><span>c[j] ≤ nums[i] &lt; nums[j]</span></header><div>${lowerHtml}</div></article>
    </section>
    <section class="spii4055-condition"><strong>c[j] ≤ nums[i] &lt; nums[j] ≤ b[i]</strong><span>${vi ? "Hai bound loại mọi blocker nằm giữa hai endpoint." : "The two bounds exclude every blocker between the endpoints."}</span></section>
    <section class="spii4055-cross"><header><strong>${vi ? "CẶP BĂNG QUA" : "CROSSING PAIRS"}</strong><span>+${view.operation === "add-cross" ? qualifying.length : 0}</span></header><div>${pairsHtml}</div></section>
    <section class="spii4055-totals"><span><small>${vi ? "nửa trái" : "left half"}</small><b>${view.leftAnswer || 0}</b></span><i>+</i><span><small>${vi ? "nửa phải" : "right half"}</small><b>${view.rightAnswer || 0}</b></span><i>+</i><span><small>${vi ? "băng qua" : "crossing"}</small><b>${view.crossAnswer || 0}</b></span><i>=</i><span class="total"><small>subtotal</small><b>${view.subtotal || 0}</b></span></section>
    <section class="spii4055-operation"><header><strong>${vi ? "PHÉP TOÁN" : "OPERATION"}</strong><code>${escapeHtml(formula)}</code></header><span>${active.length} ${vi ? "đầu trái active" : "active left endpoints"} · ${rejected.length} ${vi ? "bị loại bởi c[j]" : "rejected by c[j]"}</span></section>
    <section class="spii4055-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="spii4055-result ${view.final ? "done" : ""}"><small>SHADOW PAIRS II</small><strong>${view.final ? view.subtotal : "…"}</strong><span>${view.final ? (vi ? "Mọi cặp được đếm đúng một lần ở merge chứa hai endpoint khác nửa." : "Every pair is counted once at the merge where its endpoints first lie in different halves.") : (vi ? "Mỗi bước highlight đúng một dòng code." : "Each step highlights exactly one source line.")}</span></footer>
  </section>`;
}

function renderOrderlyQueue899View(step) {
  const view = step.orderlyQueue899View || {};
  const vi = lang === "vi";
  const original = String(view.original || "");
  const queue = String(view.queue || original);
  const isRotation = view.branch === "rotation";
  const currentShift = Number.isInteger(view.currentShift) ? view.currentShift : -1;
  const compareIndex = Number.isInteger(view.compareIndex) ? view.compareIndex : -1;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Chọn nhánh", "Trạng thái reachable", "Lấy nhỏ nhất", "Kết quả"]
    : ["Choose branch", "Reachable states", "Keep smallest", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const selectable = new Set(view.selectable || []);
  const queueCells = [...queue].map((char, index) => {
    const classes = ["oq899-char", selectable.has(index) ? "selectable" : "", index === 0 && isRotation ? "front" : ""];
    return `<span class="${classes.filter(Boolean).join(" ")}"><small>${index}</small><b>${escapeHtml(char)}</b>${selectable.has(index) ? `<em>${vi ? "chọn" : "pick"}</em>` : ""}</span>`;
  }).join("");

  const branchCards = `<section class="oq899-branches">
    <article class="${isRotation ? "active" : "muted"}"><header><strong>k = 1</strong><span>${isRotation ? "ACTIVE" : ""}</span></header><b>${vi ? "Chỉ xoay" : "Rotations only"}</b><code>abc → bca → cab</code><p>${vi ? "Thứ tự vòng tròn bị khóa." : "Cyclic order stays locked."}</p></article>
    <article class="${!isRotation ? "active" : "muted"}"><header><strong>k ≥ 2</strong><span>${!isRotation ? "ACTIVE" : ""}</span></header><b>${vi ? "Mọi hoán vị" : "Any permutation"}</b><code>abc ⇢ a, b, c ${vi ? "tự do" : "unlocked"}</code><p>${vi ? "Hai lựa chọn đủ để đổi thứ tự tương đối." : "Two choices unlock relative order."}</p></article>
  </section>`;

  let workspace;
  if (isRotation) {
    const rotations = (view.rotations || []).map((rotation) => {
      const classes = [
        "oq899-rotation",
        rotation.shift === currentShift ? "current" : "",
        rotation.shift === view.bestShift ? "best" : "",
      ];
      return `<span class="${classes.filter(Boolean).join(" ")}"><small>${vi ? "xoay" : "shift"} ${rotation.shift}</small><b>${escapeHtml(rotation.value)}</b><em>${rotation.shift === view.bestShift ? "BEST" : rotation.shift === currentShift ? (vi ? "đang xét" : "checking") : ""}</em></span>`;
    }).join("");
    const candidate = String(view.candidate || "");
    const previousBest = String(view.previousBest || "");
    const comparison = candidate && previousBest
      ? `<section class="oq899-compare" style="--oq899-length:${original.length}"><header><strong>${vi ? "SO SÁNH TỪ TRÁI SANG PHẢI" : "COMPARE LEFT TO RIGHT"}</strong><span>${compareIndex >= 0 ? `${vi ? "khác đầu tiên tại" : "first difference at"} ${compareIndex}` : (vi ? "hai chuỗi bằng nhau" : "strings are equal")}</span></header><div><label>${vi ? "ứng viên" : "candidate"}</label>${[...candidate].map((char, index) => `<b class="${index === compareIndex ? "different" : index < compareIndex || compareIndex < 0 ? "same" : ""}">${escapeHtml(char)}</b>`).join("")}</div><div><label>best ${vi ? "trước đó" : "before"}</label>${[...previousBest].map((char, index) => `<b class="${index === compareIndex ? "different" : index < compareIndex || compareIndex < 0 ? "same" : ""}">${escapeHtml(char)}</b>`).join("")}</div><footer>${view.changed ? (vi ? "candidate nhỏ hơn → thay best" : "candidate is smaller → replace best") : (vi ? "giữ nguyên best" : "keep current best")}</footer></section>`
      : `<section class="oq899-compare idle"><strong>${vi ? "Liệt kê đủ n điểm cắt rồi lấy chuỗi nhỏ nhất." : "List all n cut points, then keep the smallest string."}</strong></section>`;
    workspace = `<section class="oq899-rotations"><header><strong>${vi ? "MỌI TRẠNG THÁI REACHABLE" : "ALL REACHABLE STATES"}</strong><span>${vi ? "mỗi thẻ = một điểm cắt vòng tròn" : "each card = one circular cut"}</span></header><div>${rotations}</div></section>${comparison}`;
  } else {
    const remaining = (view.remaining || []).map((char) => `<span class="oq899-pool-char${char === view.picked ? " picked" : ""}">${escapeHtml(char)}</span>`).join("") || `<span class="oq899-empty">${vi ? "rỗng" : "empty"}</span>`;
    const prefix = String(view.sortedPrefix || "");
    const output = Array.from({ length: original.length }, (_, index) => `<span class="oq899-output-char ${index < prefix.length ? "filled" : ""}${index === prefix.length - 1 && view.phase === "sort" ? "current" : ""}"><small>${index}</small><b>${escapeHtml(prefix[index] || "·")}</b></span>`).join("");
    workspace = `<section class="oq899-unlocked"><div class="oq899-swap-rule"><strong>${vi ? "VÌ SAO SORT ĐƯỢC?" : "WHY CAN WE SORT?"}</strong><span><code>#1</code><i>${vi ? "hoặc" : "or"}</i><code>#2</code><b>→</b>${vi ? "quyết định ký tự nào đi trước" : "choose which character stays ahead"}</span><p>${vi ? "Lặp lại lựa chọn này cho phép mô phỏng các phép đổi chỗ, nên mọi hoán vị đều reachable." : "Repeating this choice simulates swaps, making every permutation reachable."}</p></div><div class="oq899-sort"><article><header><strong>${vi ? "KÝ TỰ CÒN LẠI" : "REMAINING CHARACTERS"}</strong><span>${(view.remaining || []).length}</span></header><div>${remaining}</div></article><i>→</i><article><header><strong>${vi ? "KẾT QUẢ TĂNG DẦN" : "ASCENDING RESULT"}</strong><span>${prefix.length}/${original.length}</span></header><div>${output}</div></article></div></section>`;
  }

  const best = String(view.best || "");
  const summary = vi
    ? `Bài 899 với k bằng ${view.k}; ${isRotation ? "chỉ các phép xoay" : "mọi hoán vị"} là reachable.`
    : `Problem 899 with k equal to ${view.k}; ${isRotation ? "only rotations" : "every permutation"} is reachable.`;
  $("treeView").innerHTML = `<section class="oq899-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>STRING · SORTING · #899</small><strong>ORDERLY QUEUE</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="oq899-phases">${phases}</div>
    ${branchCards}
    <section class="oq899-queue"><header><strong>${vi ? "HÀNG ĐỢI HIỆN TẠI" : "CURRENT QUEUE"}</strong><span>${vi ? `${view.k} ký tự đầu có thể chọn` : `first ${view.k} character${view.k === 1 ? " is" : "s are"} selectable`}</span></header><div>${queueCells}</div><footer><b>FRONT</b><i>→</i><span>${isRotation ? (vi ? "lấy đầu, đưa ra sau" : "take front, append to back") : (vi ? "chọn trong vùng màu" : "pick from highlighted zone")}</span><i>→</i><b>BACK</b></footer></section>
    ${workspace}
    <section class="oq899-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="oq899-result ${view.final ? "done" : ""}"><small>${vi ? "CHUỖI NHỎ NHẤT" : "LEXICOGRAPHIC MINIMUM"}</small><strong>${view.final ? escapeHtml(best) : "…"}</strong><span>${view.final ? (isRotation ? (vi ? `nhỏ nhất trong ${original.length} phép xoay` : `smallest among ${original.length} rotations`) : (vi ? "các ký tự đã được xếp tăng dần" : "characters sorted in ascending order")) : (vi ? "Theo dõi reachable states trước khi chọn đáp án." : "Understand the reachable states before choosing the answer.")}</span></footer>
  </section>`;
}

function renderShortestPalindrome214View(step) {
  const view = step.shortestPalindrome214View || {};
  const vi = lang === "vi";
  const original = String(view.original || "");
  const reversed = String(view.reversed || "");
  const pattern = String(view.pattern || "#");
  const lps = Array.isArray(view.lps) ? view.lps : [];
  const current = Number.isInteger(view.i) ? view.i : -1;
  const compare = Number.isInteger(view.compareIndex) ? view.compareIndex : -1;
  const palindromeLength = Number(view.palindromeLength) || 0;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Ghép chuỗi gương", "Xây bảng KMP", "Tìm prefix đối xứng", "Thêm phần thiếu"]
    : ["Build mirror string", "Build KMP table", "Find palindrome prefix", "Prepend missing part"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const suffixMatchStart = pattern.length - palindromeLength;
  const cells = [...pattern].map((char, index) => {
    const classes = ["sp214-cell"];
    if (index < view.separatorIndex) classes.push("source");
    else if (index === view.separatorIndex) classes.push("separator");
    else classes.push("mirror");
    if (index === current) classes.push("current");
    if (index === compare) classes.push("compare");
    if (view.matched === true && (index === current || index === compare)) classes.push("match");
    if (view.matched === false && (index === current || index === compare)) classes.push("mismatch");
    if (palindromeLength && (index < palindromeLength || index >= suffixMatchStart)) classes.push("pal-region");
    const value = lps[index];
    return `<span class="${classes.join(" ")}"><small>${index}</small><b>${escapeHtml(char)}</b><em>${value == null ? "·" : value}</em></span>`;
  }).join("");

  let operationTitle = vi ? "Đang chuẩn bị KMP" : "Preparing KMP";
  let operationFormula = "pattern = s + '#' + reverse(s)";
  let operationDetail = vi ? "lps[i] đo prefix dài nhất cũng xuất hiện ở cuối đoạn đang xét." : "lps[i] measures the longest prefix also appearing at the end of the current slice.";
  if (["loop", "match-check", "mismatch", "extend", "write-lps", "fallback"].includes(view.operation)) {
    const leftChar = compare >= 0 ? pattern[compare] : "?";
    const rightChar = current >= 0 ? pattern[current] : "?";
    operationTitle = view.operation === "fallback"
      ? (vi ? "Nhảy tới border ngắn hơn" : "Jump to a shorter border")
      : (vi ? "So khớp hai ký tự" : "Compare two characters");
    operationFormula = view.operation === "fallback"
      ? `length: ${view.previousLength} → ${view.length}`
      : `pattern[${current}] '${rightChar}' ${view.matched === true ? "=" : view.matched === false ? "≠" : "?"} pattern[${compare}] '${leftChar}'`;
    operationDetail = view.operation === "fallback"
      ? `length = lps[${Math.max(0, Number(view.previousLength) - 1)}]`
      : view.operation === "write-lps"
        ? `lps[${current}] = ${view.length}`
        : (vi ? "Xanh = khớp; đỏ = mismatch; tím = vị trí đang quét." : "Green = match; red = mismatch; purple = scan position.");
  } else if (view.operation === "palindrome-prefix") {
    operationTitle = vi ? "Đọc ô lps cuối" : "Read the final lps cell";
    operationFormula = `lps[-1] = ${palindromeLength}`;
    operationDetail = vi ? "Đây là độ dài palindrome prefix dài nhất của s." : "This is the longest palindromic-prefix length of s.";
  } else if (view.operation === "suffix" || view.operation === "return") {
    operationTitle = vi ? "Bù phần chưa đối xứng" : "Mirror the non-palindromic remainder";
    operationFormula = `'${view.addFront}' + '${original}' = '${view.answer || `${view.addFront}${original}`}'`;
    operationDetail = vi ? "Chỉ thêm reverse(suffix), nên không thể dùng ít ký tự hơn." : "Only reverse(suffix) is added, so no shorter addition can work.";
  }

  const prefix = original.slice(0, palindromeLength);
  const suffix = String(view.suffix || "");
  const constructionReady = ["palindrome-prefix", "suffix", "return"].includes(view.operation);
  const sourceParts = [...original].map((char, index) => `<span class="sp214-part ${constructionReady ? (index < palindromeLength ? "prefix" : "suffix") : "pending"}"><small>${index}</small><b>${escapeHtml(char)}</b></span>`).join("") || `<span class="sp214-empty">${vi ? "chuỗi rỗng" : "empty string"}</span>`;
  const added = [...String(view.addFront || "")].map((char) => `<span class="sp214-result-char added"><b>${escapeHtml(char)}</b><small>${vi ? "thêm" : "new"}</small></span>`).join("");
  const kept = [...original].map((char, index) => `<span class="sp214-result-char ${index < palindromeLength ? "kept-prefix" : "kept-suffix"}"><b>${escapeHtml(char)}</b><small>${vi ? "giữ" : "keep"}</small></span>`).join("");
  const construction = constructionReady
    ? added + (kept || `<span class="sp214-empty">ε</span>`)
    : `<span class="sp214-empty">${vi ? "chờ lps cuối" : "waiting for final lps"}</span>`;

  const summary = vi
    ? `Bài 214: palindrome prefix dài nhất hiện có độ dài ${palindromeLength}.`
    : `Problem 214: the current longest palindromic prefix has length ${palindromeLength}.`;
  $("treeView").innerHTML = `<section class="sp214-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>KMP · PREFIX FUNCTION · #214</small><strong>SHORTEST PALINDROME</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="sp214-phases">${phases}</div>
    <section class="sp214-idea"><strong>${vi ? "MỤC TIÊU" : "TARGET"}</strong><code>${vi ? "palindrome prefix dài nhất" : "longest palindromic prefix"}</code><i>→</i><span>${vi ? "đảo phần còn lại và thêm vào trước" : "reverse the remainder and prepend it"}</span></section>
    <section class="sp214-pattern"><header><strong>s + # + reverse(s)</strong><span><b>s</b> · <i>#</i> · <em>reverse(s)</em></span></header><div class="sp214-strip">${cells}</div><footer><span>CHAR</span><span>LPS</span><p>${vi ? "Số dưới mỗi ký tự là lps tại index đó; · nghĩa là chưa tính." : "The lower number is lps at that index; · means not computed yet."}</p></footer></section>
    <section class="sp214-operation"><header><strong>${escapeHtml(operationTitle)}</strong><code>${escapeHtml(operationFormula)}</code></header><span>${escapeHtml(operationDetail)}</span></section>
    <section class="sp214-proof ${constructionReady ? "ready" : "pending"}"><header><strong>${vi ? "TÁCH s TẠI PALINDROME PREFIX" : "SPLIT s AT THE PALINDROME PREFIX"}</strong><span>${constructionReady ? `${palindromeLength} + ${suffix.length}` : "…"}</span></header><div>${sourceParts}</div><footer><span class="prefix"><b>${vi ? "prefix đối xứng" : "palindrome prefix"}</b><code>${constructionReady ? `'${escapeHtml(prefix)}'` : "…"}</code></span><i>+</i><span class="suffix"><b>${vi ? "suffix cần bù" : "suffix to mirror"}</b><code>${constructionReady ? `'${escapeHtml(suffix)}'` : "…"}</code></span></footer></section>
    <section class="sp214-construction ${view.final ? "done" : ""}"><header><strong>reverse(suffix) + s</strong><span>${vi ? "ký tự xanh được thêm mới" : "green characters are prepended"}</span></header><div>${construction}</div></section>
    <section class="sp214-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="sp214-result ${view.final ? "done" : ""}"><small>${vi ? "PALINDROME NGẮN NHẤT" : "SHORTEST PALINDROME"}</small><strong>${view.final ? (view.answer ? escapeHtml(view.answer) : "ε") : "…"}</strong><span>${view.final ? `${vi ? "thêm" : "prepend"} ${String(view.addFront || "").length} ${vi ? "ký tự" : "character(s)"}` : (vi ? "KMP đang tìm prefix đối xứng dài nhất." : "KMP is finding the longest palindromic prefix.")}</span></footer>
  </section>`;
}

function renderEquallySpaced4048View(step) {
  const view = step.equallySpaced4048View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const groups = Array.isArray(view.groups) ? view.groups : [];
  const activeIndices = Array.isArray(view.activeIndices) ? view.activeIndices : [];
  const activeIndexSet = new Set(activeIndices);
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : -1;
  const collectedCount = Number(view.collectedCount) || 0;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const labels = vi
    ? ["Gom index", "Đúng 3 lần", "So khoảng cách", "Đếm", "Kết quả"]
    : ["Collect indices", "Exactly 3", "Compare gaps", "Count", "Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const arrayHtml = nums.map((value, index) => {
    const classes = ["es4048-cell"];
    if (index < collectedCount) classes.push("collected");
    if (index === currentIndex) classes.push("current");
    if (activeIndexSet.has(index)) classes.push("same-value");
    return `<span class="${classes.join(" ")}"><small>i=${index}</small><b>${escapeHtml(value)}</b></span>`;
  }).join("");

  const statusText = {
    pending: vi ? "chờ kiểm tra" : "pending",
    active: vi ? "đang xét" : "checking",
    "special-ready": vi ? "khoảng cách bằng" : "equal gaps",
    special: "SPECIAL ✓",
    unequal: vi ? "khoảng cách khác" : "unequal gaps",
    "wrong-count": vi ? "không đủ 3 lần" : "not exactly 3",
  };
  const groupsHtml = groups.length
    ? groups.map((group) => {
      const indices = Array.isArray(group.indices) ? group.indices : [];
      const isActive = group.value === view.activeValue;
      return `<article class="es4048-group ${escapeHtml(group.status || "pending")} ${isActive ? "active" : ""}">
        <header><strong>${escapeHtml(group.value)}</strong><span>×${indices.length}</span></header>
        <div>${indices.map((index) => `<b>${index}</b>`).join("") || "<i>—</i>"}</div>
        <footer>${escapeHtml(statusText[group.status] || statusText.pending)}</footer>
      </article>`;
    }).join("")
    : `<p>${vi ? "Hash map đang rỗng." : "The hash map is empty."}</p>`;

  let spacingHtml;
  if (view.activeValue == null) {
    spacingHtml = `<p>${vi ? "Chọn một nhóm value để kiểm tra." : "Select a value group to inspect."}</p>`;
  } else if (activeIndices.length !== 3) {
    spacingHtml = `<div class="es4048-count-check"><span>value <b>${escapeHtml(view.activeValue)}</b></span><code>len(indices) = ${activeIndices.length}</code><strong>≠ 3</strong></div>`;
  } else {
    const leftGap = view.gapLeft == null ? "?" : view.gapLeft;
    const rightGap = view.gapRight == null ? "?" : view.gapRight;
    const comparison = view.equalGaps == null ? "?" : view.equalGaps ? "=" : "≠";
    spacingHtml = `<div class="es4048-spacing ${view.equalGaps === true ? "equal" : view.equalGaps === false ? "unequal" : ""}">
      <span><small>i₁</small><b>${activeIndices[0]}</b></span>
      <i><small>gap 1</small><b>${leftGap}</b></i>
      <span><small>i₂</small><b>${activeIndices[1]}</b></span>
      <i><small>gap 2</small><b>${rightGap}</b></i>
      <span><small>i₃</small><b>${activeIndices[2]}</b></span>
      <strong>${leftGap} ${comparison} ${rightGap}</strong>
    </div>`;
  }

  const operation = view.operation || "init-map";
  const formulas = {
    "init-map": "positions = defaultdict(list)",
    scan: currentIndex >= 0 ? `index = ${currentIndex}, value = ${view.currentValue}` : "for index, value in enumerate(nums)",
    append: `positions[${view.currentValue}].append(${currentIndex})`,
    "init-answer": "answer = 0",
    group: `value = ${view.activeValue}, indices = [${activeIndices.join(", ")}]`,
    check: view.countOk === false
      ? `len(indices) = ${activeIndices.length} != 3`
      : `${view.gapLeft} ${view.equalGaps ? "==" : "!="} ${view.gapRight}`,
    count: `answer = ${view.answerBefore} + 1 = ${view.answer}`,
    return: `return ${view.answer}`,
  };
  const countedValues = groups.filter((group) => group.status === "special").map((group) => group.value);
  const final = Boolean(view.final);
  const summary = vi
    ? `Bài 4048: đã gom ${collectedCount}/${nums.length} index và đếm ${view.answer || 0} value special.`
    : `Problem 4048: collected ${collectedCount}/${nums.length} indices and counted ${view.answer || 0} special values.`;

  $("treeView").innerHTML = `<section class="es4048-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>HASH MAP · INDEX GAPS · #4048</small><strong>EQUALLY SPACED OCCURRENCES</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="es4048-phases">${phases}</div>
    <section class="es4048-rule"><strong>SPECIAL</strong><code>count = 3</code><i>AND</i><code>i₂ − i₁ = i₃ − i₂</code></section>
    <section class="es4048-array"><header><strong>NUMS</strong><span>${vi ? "các ô cùng màu là occurrence của value đang xét" : "matching cells are occurrences of the active value"}</span></header><div>${arrayHtml}</div></section>
    <section class="es4048-groups"><header><strong>${vi ? "HASH MAP: VALUE → INDICES" : "HASH MAP: VALUE → INDICES"}</strong><span>${groups.length} ${vi ? "value phân biệt" : "distinct values"}</span></header><div>${groupsHtml}</div></section>
    <section class="es4048-check"><header><strong>${vi ? "KIỂM TRA NHÓM HIỆN TẠI" : "ACTIVE GROUP CHECK"}</strong><span>${view.activeValue == null ? "—" : `value ${escapeHtml(view.activeValue)}`}</span></header>${spacingHtml}</section>
    <section class="es4048-operation"><header><strong>${vi ? "PHÉP TOÁN" : "OPERATION"}</strong><code>${escapeHtml(formulas[operation] || operation)}</code></header><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="es4048-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong></section>
    <footer class="es4048-result ${final ? "done" : ""}"><div><small>SPECIAL VALUES</small><span>${countedValues.length ? countedValues.map((value) => `<b>${escapeHtml(value)}</b>`).join("") : "—"}</span></div><strong>${final ? view.answer : "…"}</strong><span>${final ? (vi ? "giá trị special phân biệt" : "distinct special values") : (vi ? "answer chỉ tăng sau khi cả hai điều kiện đúng" : "answer increases only after both conditions pass")}</span></footer>
  </section>`;
}

function renderEquallySpaced4049View(step) {
  const view = step.equallySpaced4049View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const groups = Array.isArray(view.groups) ? view.groups : [];
  const activeIndices = Array.isArray(view.activeIndices) ? view.activeIndices : [];
  const activeIndexSet = new Set(activeIndices);
  const currentIndex = Number.isInteger(view.currentIndex) ? view.currentIndex : -1;
  const collectedCount = Number(view.collectedCount) || 0;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const labels = vi
    ? ["Gom index", "Ít nhất 3", "Chọn gap", "Quét mọi gap", "Kết quả"]
    : ["Collect indices", "At least 3", "Choose gap", "Scan every gap", "Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const arrayHtml = nums.map((value, index) => {
    const classes = ["es4048-cell"];
    if (index < collectedCount) classes.push("collected");
    if (index === currentIndex) classes.push("current");
    if (activeIndexSet.has(index)) classes.push("same-value");
    return `<span class="${classes.join(" ")}"><small>i=${index}</small><b>${escapeHtml(value)}</b></span>`;
  }).join("");

  const statusText = {
    pending: vi ? "chờ kiểm tra" : "pending",
    active: vi ? "đang xét" : "checking",
    enough: vi ? "đủ occurrences" : "enough occurrences",
    checking: vi ? "đang quét gap" : "scanning gaps",
    "special-ready": vi ? "mọi gap bằng" : "all gaps equal",
    special: "SPECIAL ✓",
    unequal: vi ? "có gap khác" : "gap mismatch",
    "too-few": vi ? "ít hơn 3 lần" : "fewer than 3",
  };
  const groupsHtml = groups.length
    ? groups.map((group) => {
      const indices = Array.isArray(group.indices) ? group.indices : [];
      const isActive = group.value === view.activeValue;
      return `<article class="es4048-group ${escapeHtml(group.status || "pending")} ${isActive ? "active" : ""}">
        <header><strong>${escapeHtml(group.value)}</strong><span>×${indices.length}</span></header>
        <div>${indices.map((index) => `<b>${index}</b>`).join("") || "<i>—</i>"}</div>
        <footer>${escapeHtml(statusText[group.status] || statusText.pending)}</footer>
      </article>`;
    }).join("")
    : `<p>${vi ? "Hash map đang rỗng." : "The hash map is empty."}</p>`;

  let gapLane;
  if (view.activeValue == null) {
    gapLane = `<p>${vi ? "Chọn một nhóm value để kiểm tra." : "Select a value group to inspect."}</p>`;
  } else if (activeIndices.length < 3) {
    gapLane = `<div class="es4048-count-check"><span>value <b>${escapeHtml(view.activeValue)}</b></span><code>len(indices) = ${activeIndices.length}</code><strong>&lt; 3</strong></div>`;
  } else {
    const lane = [];
    activeIndices.forEach((index, occurrence) => {
      const nodeClasses = ["esii4049-node"];
      if (occurrence === view.currentGapOrdinal) nodeClasses.push("current");
      if (occurrence === view.mismatchGapOrdinal) nodeClasses.push("mismatch");
      lane.push(`<span class="${nodeClasses.join(" ")}"><small>i${occurrence + 1}</small><b>${index}</b></span>`);
      if (occurrence === activeIndices.length - 1) return;
      const ordinal = occurrence + 1;
      const actual = activeIndices[ordinal] - activeIndices[ordinal - 1];
      const gapClasses = ["esii4049-gap"];
      if (ordinal <= Number(view.checkedGapCount || 0)) gapClasses.push("match");
      if (ordinal === view.currentGapOrdinal) gapClasses.push("current");
      if (ordinal === view.mismatchGapOrdinal) gapClasses.push("mismatch");
      lane.push(`<i class="${gapClasses.join(" ")}"><small>δ${ordinal}</small><b>${actual}</b></i>`);
    });
    gapLane = `<div class="esii4049-lane">${lane.join("")}</div><footer><span>${vi ? "gap chuẩn" : "reference gap"}</span><strong>${view.expectedGap ?? "?"}</strong><code>${view.actualGap == null ? (vi ? "chờ gap tiếp theo" : "waiting for the next gap") : `${view.actualGap} ${view.actualGap === view.expectedGap ? "=" : "≠"} ${view.expectedGap}`}</code></footer>`;
  }

  const operation = view.operation || "init-map";
  const formulas = {
    "init-map": "positions = defaultdict(list)",
    scan: currentIndex >= 0 ? `index = ${currentIndex}, value = ${view.currentValue}` : "for index, value in enumerate(nums)",
    append: `positions[${view.currentValue}].append(${currentIndex})`,
    "init-answer": "answer = 0",
    group: `value = ${view.activeValue}, indices = [${activeIndices.join(", ")}]`,
    "size-check": `len(indices) = ${activeIndices.length} ${view.countOk ? ">=" : "<"} 3`,
    continue: "continue",
    "set-gap": activeIndices.length >= 2 ? `gap = ${activeIndices[1]} - ${activeIndices[0]} = ${view.expectedGap}` : "gap = indices[1] - indices[0]",
    "init-flag": "equally_spaced = True",
    "gap-loop": `i = ${view.currentGapOrdinal}`,
    "gap-check": `${view.actualGap} ${view.actualGap === view.expectedGap ? "==" : "!="} ${view.expectedGap}`,
    "set-false": "equally_spaced = False",
    break: "break",
    "final-check": `equally_spaced is ${view.equallySpaced ? "True" : "False"}`,
    count: `answer = ${view.answerBefore} + 1 = ${view.answer}`,
    return: `return ${view.answer}`,
  };
  const countedValues = groups.filter((group) => group.status === "special").map((group) => group.value);
  const final = Boolean(view.final);
  const summary = vi
    ? `Bài 4049: đã gom ${collectedCount}/${nums.length} index và đếm ${view.answer || 0} value special.`
    : `Problem 4049: collected ${collectedCount}/${nums.length} indices and counted ${view.answer || 0} special values.`;

  $("treeView").innerHTML = `<section class="es4048-viz esii4049-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>HASH MAP · ARITHMETIC INDICES · #4049</small><strong>EQUALLY SPACED OCCURRENCES II</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="es4048-phases">${phases}</div>
    <section class="es4048-rule"><strong>SPECIAL</strong><code>count ≥ 3</code><i>AND</i><code>δ₁ = δ₂ = … = δₘ₋₁</code></section>
    <section class="es4048-array"><header><strong>NUMS</strong><span>${vi ? "xanh = mọi occurrence của value đang xét" : "blue = every occurrence of the active value"}</span></header><div>${arrayHtml}</div></section>
    <section class="es4048-groups"><header><strong>HASH MAP: VALUE → INDICES</strong><span>${groups.length} ${vi ? "value phân biệt" : "distinct values"}</span></header><div>${groupsHtml}</div></section>
    <section class="es4048-check esii4049-check"><header><strong>${vi ? "DÃY KHOẢNG CÁCH" : "GAP SEQUENCE"}</strong><span>${view.activeValue == null ? "—" : `value ${escapeHtml(view.activeValue)}`}</span></header>${gapLane}</section>
    <section class="es4048-operation"><header><strong>${vi ? "PHÉP TOÁN" : "OPERATION"}</strong><code>${escapeHtml(formulas[operation] || operation)}</code></header><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="es4048-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong></section>
    <footer class="es4048-result ${final ? "done" : ""}"><div><small>SPECIAL VALUES</small><span>${countedValues.length ? countedValues.map((value) => `<b>${escapeHtml(value)}</b>`).join("") : "—"}</span></div><strong>${final ? view.answer : "…"}</strong><span>${final ? (vi ? "giá trị special phân biệt" : "distinct special values") : (vi ? "một mismatch sẽ dừng nhóm hiện tại" : "one mismatch stops the current group")}</span></footer>
  </section>`;
}

function renderMinDays4050View(step) {
  const view = step.minDays4050View || {};
  const vi = lang === "vi";
  const streaks = Array.isArray(view.streaks) ? view.streaks : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const schedule = Array.isArray(view.schedule) ? view.schedule : [];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const activeScore = Number.isInteger(view.activeScore) ? view.activeScore : -1;
  const activeOption = Number.isInteger(view.activeOption) ? view.activeOption : -1;
  const predecessor = Number.isInteger(view.predecessor) ? view.predecessor : -1;
  const labels = vi
    ? ["Tạo streak", "Base DP", "Thử lựa chọn", "Giữ min", "Lịch tối ưu"]
    : ["Build streaks", "DP base", "Try options", "Keep minimum", "Optimal schedule"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const optionHtml = streaks.length
    ? streaks.map((item, index) => `<article class="md4050-option${index === activeOption ? " active" : ""}">
        <small>STREAK L=${item.length}</small>
        <strong>${item.points} <em>pts</em></strong>
        <span>${item.length} earn + 1 skip = <b>${item.cost}</b> ${vi ? "ngày" : "days"}</span>
      </article>`).join("")
    : `<p class="md4050-empty">${vi ? "Chưa có streak nào." : "No streak options yet."}</p>`;

  const dpHtml = dp.length
    ? dp.map((value, score) => {
      const classes = ["md4050-cell"];
      if (score === activeScore) classes.push("active");
      if (score === predecessor) classes.push("source");
      if (value != null) classes.push("known");
      if (view.final && score === view.n) classes.push("answer");
      return `<span class="${classes.join(" ")}"><small>score ${score}</small><b>${value == null ? "∞" : value}</b></span>`;
    }).join("")
    : `<span class="md4050-cell"><small>dp</small><b>—</b></span>`;

  let transitionFormula = vi ? "Chọn một streak để xem transition." : "Choose a streak to inspect a transition.";
  if (view.operation === "fit-check" && Number(view.points) > activeScore) {
    transitionFormula = `${view.points} > ${activeScore} → break`;
  } else if (predecessor >= 0 && view.candidate != null) {
    transitionFormula = `dp[${predecessor}] + ${view.cost} = ${dp[predecessor]} + ${view.cost} = ${view.candidate}`;
  } else if (activeOption >= 0 && view.points != null && activeScore >= 0) {
    transitionFormula = `${view.points} ${view.points <= activeScore ? "≤" : ">"} ${activeScore}`;
  } else if (view.operation === "return") {
    transitionFormula = `dp[${view.n}] - 1 = ${dp[view.n]} - 1 = ${view.answer}`;
  }
  const comparison = view.updated === true
    ? (vi ? "NHỎ HƠN → CẬP NHẬT" : "SMALLER → UPDATE")
    : view.updated === false
      ? (vi ? "KHÔNG NHỎ HƠN → GIỮ NGUYÊN" : "NOT SMALLER → KEEP")
      : (vi ? "TRANSITION HIỆN TẠI" : "CURRENT TRANSITION");

  const scheduleHtml = schedule.length
    ? schedule.map((day, index) => `<span class="md4050-day ${day.type}"><small>${vi ? "ngày" : "day"} ${index + 1}</small><b>${day.type === "skip" ? "SKIP" : `+${day.points}`}</b><em>${day.type === "skip" ? (vi ? "reset" : "reset") : `streak ${day.streak}`}</em></span>`).join("")
    : `<p class="md4050-empty">${vi ? "Bảng DP sẽ dựng lịch tối ưu khi hoàn tất." : "The DP table will reconstruct the optimal schedule when complete."}</p>`;

  const formulas = {
    "init-streaks": "streaks = []",
    "init-length": "length = 1",
    "while-check": `T_${view.length} ≤ n ?`,
    "while-stop": `T_${view.length} > n → stop`,
    "compute-points": `points = ${view.length} × ${view.length + 1} / 2 = ${view.points}`,
    "append-option": `streaks.append((${view.points}, ${view.cost}))`,
    "increment-length": `length = ${view.length}`,
    "init-dp": `dp = [∞] × (${view.n} + 1)`,
    "base-case": "dp[0] = 0",
    "score-loop": `score = ${activeScore}`,
    "option-loop": activeOption >= 0 ? `points, cost = ${view.points}, ${view.cost}` : "for points, cost in streaks",
    "fit-check": `${view.points} > ${activeScore} ?`,
    break: "break",
    relax: transitionFormula,
    return: `return dp[${view.n}] - 1`,
  };
  const final = Boolean(view.final);
  const summary = vi
    ? `Bài 4050: DP tìm số ngày ít nhất để đạt chính xác ${view.n} điểm.`
    : `Problem 4050: DP finds the minimum days needed to score exactly ${view.n} points.`;

  $("treeView").innerHTML = `<section class="md4050-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>UNBOUNDED KNAPSACK · TRIANGULAR NUMBERS · #4050</small><strong>MINIMUM DAYS TO SCORE EXACTLY N POINTS</strong></div><span>n = ${view.n}</span></header>
    <div class="md4050-phases">${phases}</div>
    <section class="md4050-rule"><div><small>${vi ? "STREAK DÀI L" : "LENGTH-L STREAK"}</small><code>1 + 2 + … + L = L(L+1)/2</code></div><i>→</i><div><small>${vi ? "CHI PHÍ TẠM" : "CHARGED COST"}</small><code>L earn + 1 skip</code></div><i>→</i><strong>${vi ? "kết quả = dp[n] − 1" : "answer = dp[n] - 1"}</strong></section>
    <section class="md4050-options"><header><strong>${vi ? "CÁC STREAK CÓ THỂ DÙNG" : "AVAILABLE STREAK OPTIONS"}</strong><span>${streaks.length} options</span></header><div>${optionHtml}</div></section>
    <section class="md4050-dp"><header><strong>DP[EXACT SCORE]</strong><span>${vi ? "giá trị = ngày đã charge" : "value = charged days"}</span></header><div>${dpHtml}</div></section>
    <section class="md4050-transition ${view.updated === true ? "updated" : view.updated === false ? "kept" : ""}"><header><strong>${comparison}</strong><code>${escapeHtml(transitionFormula)}</code></header><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="md4050-schedule"><header><strong>${vi ? "LỊCH NGÀY TỐI ƯU" : "OPTIMAL DAY SCHEDULE"}</strong><span>${final ? `${view.answer} ${vi ? "ngày" : "days"} · ${view.n} points` : (vi ? "xuất hiện ở bước cuối" : "shown at the final step")}</span></header><div>${scheduleHtml}</div></section>
    <section class="md4050-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><code>${escapeHtml(formulas[view.operation] || view.operation || "—")}</code></section>
    <footer class="md4050-result ${final ? "done" : ""}"><small>MIN DAYS</small><strong>${final ? view.answer : "…"}</strong><span>${final ? (vi ? `đạt chính xác ${view.n} điểm` : `scores exactly ${view.n} points`) : (vi ? "DP đang so sánh các cách chia thành streak" : "DP is comparing streak decompositions")}</span></footer>
  </section>`;
}

function renderDistantSubarrays4051View(step) {
  const view = step.distantSubarrays4051View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const values = Array.isArray(view.values) ? view.values : [];
  const counts = Array.isArray(view.counts) ? view.counts : [];
  const matches = Array.isArray(view.currentMatches) ? view.currentMatches : [];
  const accepted = Array.isArray(view.accepted) ? view.accepted : [];
  const activePrefix = Number.isInteger(view.prefixIndex) ? view.prefixIndex : -1;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const hasBounds = Number.isFinite(view.low) && Number.isFinite(view.high);
  const labels = vi
    ? ["Prefix sum", "Nén tọa độ", "Query 2 miền", "Đếm + insert", "Kết quả"]
    : ["Prefix sums", "Compress", "Query 2 ranges", "Count + insert", "Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const numsHtml = nums.map((value, index) => `<span class="ds4051-num${activePrefix === index + 1 ? " current" : ""}"><small>i=${index}</small><b>${escapeHtml(value)}</b></span>`).join("");
  const prefixHtml = prefix.map((value, index) => {
    const classes = ["ds4051-prefix"];
    if (index < Number(view.seen || 0)) classes.push("seen");
    if (index === activePrefix) classes.push("current");
    return `<span class="${classes.join(" ")}"><small>P${index}</small><b>${escapeHtml(value)}</b><em>${index < Number(view.seen || 0) ? (vi ? "đã insert" : "inserted") : index === activePrefix ? "current" : ""}</em></span>`;
  }).join("");

  const coordinatesHtml = values.length
    ? values.map((value, index) => {
      const classes = ["ds4051-coordinate"];
      if (hasBounds && value <= view.low) classes.push("left-range");
      else if (hasBounds && value >= view.high) classes.push("right-range");
      else if (hasBounds) classes.push("middle-range");
      if (index === view.coordinate) classes.push("inserted-now");
      return `<span class="${classes.join(" ")}"><small>rank ${index + 1}</small><b>${escapeHtml(value)}</b><em>count ${counts[index] || 0}</em></span>`;
    }).join("")
    : `<p class="ds4051-empty">${vi ? "Chưa nén tọa độ." : "Coordinates are not compressed yet."}</p>`;

  const leftCount = view.leftCount == null ? "?" : view.leftCount;
  const rightCount = view.rightCount == null ? "?" : view.rightCount;
  const boundsHtml = hasBounds
    ? `<div class="ds4051-bound left"><small>${vi ? "MIỀN TRÁI" : "LEFT RANGE"}</small><strong>p ≤ ${view.low}</strong><span>${leftCount} prefix</span></div><i>OR</i><div class="ds4051-bound middle"><small>${vi ? "KHÔNG DISTANT" : "NOT DISTANT"}</small><strong>${view.low} &lt; p &lt; ${view.high}</strong><span>${vi ? "không đếm" : "do not count"}</span></div><i>OR</i><div class="ds4051-bound right"><small>${vi ? "MIỀN PHẢI" : "RIGHT RANGE"}</small><strong>p ≥ ${view.high}</strong><span>${rightCount} prefix</span></div>`
    : `<div class="ds4051-bound idle"><small>${vi ? "ĐỔI ĐIỀU KIỆN" : "TRANSFORM CONDITION"}</small><strong>|(s − p) − goal| ≥ k</strong><span>${vi ? "tìm hai miền của prefix trước p" : "find two ranges for earlier prefix p"}</span></div>`;

  const matchHtml = matches.length
    ? matches.map((item) => `<span class="ds4051-match ${item.side}"><small>[${item.start}..${item.end}]</small><b>sum ${item.sum}</b><em>|${item.sum} − ${view.goal}| = ${item.difference}</em></span>`).join("")
    : `<p class="ds4051-empty">${activePrefix > 0 ? (vi ? "Không có subarray distant kết thúc tại đây." : "No distant subarray ends here.") : (vi ? "Chưa có subarray không rỗng." : "No non-empty subarray yet.")}</p>`;
  const recentAccepted = accepted.slice(-12);
  const acceptedHtml = recentAccepted.length
    ? recentAccepted.map((item) => `<span class="ds4051-accepted"><b>[${item.start}..${item.end}]</b><small>Σ=${item.sum} · Δ=${item.difference}</small></span>`).join("")
    : `<p class="ds4051-empty">${vi ? "Chưa đếm subarray nào." : "No subarray counted yet."}</p>`;

  const formula = view.k === 0
    ? `${nums.length} × ${nums.length + 1} / 2 = ${view.totalSubarrays ?? "?"}`
    : view.operation === "count"
      ? `answer = ${view.answerBefore} + ${leftCount} + ${rightCount} = ${view.answer}`
      : hasBounds
        ? `p ≤ ${view.current} − ${view.goal} − ${view.k} = ${view.low}  OR  p ≥ ${view.current} − ${view.goal} + ${view.k} = ${view.high}`
        : "|(current − p) − goal| ≥ k";
  const formulas = {
    "k-check": `k == 0 → ${view.k === 0}`,
    "set-n": `n = len(nums) = ${nums.length}`,
    "return-all": `return ${nums.length} × ${nums.length + 1} // 2`,
    "init-prefix": "prefix = [0]",
    "prefix-loop": activePrefix > 0 ? `value = nums[${activePrefix - 1}]` : "for value in nums",
    "append-prefix": `prefix.append(${view.current})`,
    compress: `values = [${values.join(", ")}]`,
    "init-bit": `bit = Fenwick(${values.length})`,
    "init-counters": "answer = seen = 0",
    "scan-prefix": `current = P${activePrefix} = ${view.current}`,
    "low-threshold": `low = ${view.current} - ${view.goal} - ${view.k} = ${view.low}`,
    "high-threshold": `high = ${view.current} - ${view.goal} + ${view.k} = ${view.high}`,
    "query-left": `left_count = ${leftCount}`,
    "query-right": `right_count = ${rightCount}`,
    count: formula,
    insert: `bit.add(rank(${view.current}), 1)`,
    "increment-seen": `seen = ${view.seen}`,
    return: `return ${view.answer}`,
  };
  const final = Boolean(view.final);
  const summary = vi
    ? `Bài 4051: đã đếm ${view.answer || 0} subarray có tổng cách goal ít nhất k.`
    : `Problem 4051: counted ${view.answer || 0} subarrays whose sums are at least k away from goal.`;

  $("treeView").innerHTML = `<section class="ds4051-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>PREFIX SUM · FENWICK TREE · #4051</small><strong>COUNT SUBARRAYS WITH DISTANT SUMS</strong></div><span>goal = ${view.goal} · k = ${view.k}</span></header>
    <div class="ds4051-phases">${phases}</div>
    <section class="ds4051-rule"><code>sum(i..j) = P[j+1] − P[i]</code><i>→</i><strong>|sum − goal| ≥ k</strong><i>→</i><code>2 prefix ranges</code></section>
    <section class="ds4051-prefixes"><header><strong>NUMS → PREFIX SUMS</strong><span>${vi ? "chỉ query prefix đã insert" : "query inserted prefixes only"}</span></header><div class="ds4051-nums">${numsHtml}</div><div class="ds4051-arrow">↓ prefix</div><div class="ds4051-prefix-row">${prefixHtml || `<span class="ds4051-prefix"><b>—</b></span>`}</div></section>
    <section class="ds4051-ranges">${boundsHtml}</section>
    <section class="ds4051-coordinates"><header><strong>${vi ? "TỌA ĐỘ NÉN · TẦN SUẤT ĐÃ THẤY" : "COMPRESSED COORDINATES · SEEN FREQUENCIES"}</strong><span>seen = ${view.seen || 0}</span></header><div>${coordinatesHtml}</div></section>
    <section class="ds4051-transition"><header><strong>${vi ? "PHÉP ĐẾM HIỆN TẠI" : "CURRENT COUNT"}</strong><code>${escapeHtml(formula)}</code></header><div>${matchHtml}</div><footer>${escapeHtml(pick(step.note))}</footer></section>
    <section class="ds4051-found"><header><strong>${vi ? "SUBARRAY DISTANT ĐÃ ĐẾM" : "COUNTED DISTANT SUBARRAYS"}</strong><span>${accepted.length > 12 ? `${vi ? "12 gần nhất /" : "latest 12 /"} ` : ""}${view.answer || 0}</span></header><div>${acceptedHtml}</div></section>
    <section class="ds4051-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><code>${escapeHtml(formulas[view.operation] || view.operation || "—")}</code></section>
    <footer class="ds4051-result ${final ? "done" : ""}"><small>DISTANT SUBARRAYS</small><strong>${final ? view.answer : "…"}</strong><span>${final ? `|sum − ${view.goal}| ≥ ${view.k}` : (vi ? "query trước, insert sau để loại subarray rỗng" : "query before insertion to exclude empty subarrays")}</span></footer>
  </section>`;
}

function renderRectangleArea223View(step) {
  const view = step.rectangleArea223View || {};
  const vi = lang === "vi";
  const rectA = Array.isArray(view.rectA) ? view.rectA.map(Number) : [0, 0, 1, 1];
  const rectB = Array.isArray(view.rectB) ? view.rectB.map(Number) : [0, 0, 1, 1];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Hai rectangle", "Diện tích riêng", "Kích thước phần giao", "Diện tích giao", "Bao hàm–loại trừ"]
    : ["Two rectangles", "Individual areas", "Overlap dimensions", "Overlap area", "Inclusion-exclusion"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const allX = [rectA[0], rectA[2], rectB[0], rectB[2]];
  const allY = [rectA[1], rectA[3], rectB[1], rectB[3]];
  const baseSpanX = Math.max(1, Math.max(...allX) - Math.min(...allX));
  const baseSpanY = Math.max(1, Math.max(...allY) - Math.min(...allY));
  const minX = Math.min(...allX) - baseSpanX * 0.16;
  const maxX = Math.max(...allX) + baseSpanX * 0.16;
  const minY = Math.min(...allY) - baseSpanY * 0.18;
  const maxY = Math.max(...allY) + baseSpanY * 0.18;
  const plot = { left: 52, top: 20, width: 556, height: 244 };
  const mapX = (x) => plot.left + ((x - minX) / (maxX - minX)) * plot.width;
  const mapY = (y) => plot.top + ((maxY - y) / (maxY - minY)) * plot.height;
  const rectangleSvg = (rect, label, className) => {
    const x = mapX(rect[0]);
    const y = mapY(rect[3]);
    const width = Math.max(0, mapX(rect[2]) - x);
    const height = Math.max(0, mapY(rect[1]) - y);
    return `<g class="${className}"><rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="4"/><text x="${(x + width / 2).toFixed(2)}" y="${(y + height / 2).toFixed(2)}">${label}</text></g>`;
  };
  const showOverlap = view.overlapWidth > 0 && view.overlapHeight > 0;
  let overlapSvg = "";
  if (showOverlap) {
    const x = mapX(view.overlapLeft);
    const y = mapY(view.overlapTop);
    const width = mapX(view.overlapRight) - x;
    const height = mapY(view.overlapBottom) - y;
    overlapSvg = `<g class="ra223-overlap"><rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="3"/><text x="${(x + width / 2).toFixed(2)}" y="${(y + height / 2).toFixed(2)}">A ∩ B</text></g>`;
  }
  const planeSummary = vi ? "Hai rectangle và phần diện tích giao nhau." : "Two rectangles and their overlapping area.";
  const plane = `<svg viewBox="0 0 660 290" role="img" aria-label="${escapeHtml(planeSummary)}"><rect class="ra223-plane-bg" x="${plot.left}" y="${plot.top}" width="${plot.width}" height="${plot.height}" rx="5"/><line class="ra223-axis" x1="${plot.left}" y1="${plot.top + plot.height}" x2="${plot.left + plot.width}" y2="${plot.top + plot.height}"/><line class="ra223-axis" x1="${plot.left}" y1="${plot.top}" x2="${plot.left}" y2="${plot.top + plot.height}"/><text class="ra223-axis-name" x="${plot.left + plot.width + 9}" y="${plot.top + plot.height + 4}">x</text><text class="ra223-axis-name" x="${plot.left - 4}" y="${plot.top - 7}">y</text>${rectangleSvg(rectA, "A", "ra223-rect-a")}${rectangleSvg(rectB, "B", "ra223-rect-b")}${overlapSvg}</svg>`;

  const metric = (className, label, value, detail) => `<article class="${className}"><small>${escapeHtml(label)}</small><strong>${value == null ? "…" : value}</strong><span>${escapeHtml(detail)}</span></article>`;
  const widthState = view.overlapWidth == null ? "pending" : view.overlapWidth > 0 ? "positive" : "zero";
  const heightState = view.overlapHeight == null ? "pending" : view.overlapHeight > 0 ? "positive" : "zero";
  const dimensions = `<article class="ra223-dimension ${widthState}"><header><strong>${vi ? "CHIỀU RỘNG GIAO" : "OVERLAP WIDTH"}</strong><span>X axis</span></header><code>max(0, ${view.overlapRight} − ${view.overlapLeft})</code><b>${view.overlapWidth == null ? "…" : view.overlapWidth}</b></article><article class="ra223-dimension ${heightState}"><header><strong>${vi ? "CHIỀU CAO GIAO" : "OVERLAP HEIGHT"}</strong><span>Y axis</span></header><code>max(0, ${view.overlapTop} − ${view.overlapBottom})</code><b>${view.overlapHeight == null ? "…" : view.overlapHeight}</b></article>`;
  const formulas = {
    inputs: `A=[${rectA.join(",")}], B=[${rectB.join(",")}]`,
    "area-a": `(${rectA[2]} − ${rectA[0]}) × (${rectA[3]} − ${rectA[1]}) = ${view.areaA}`,
    "area-b": `(${rectB[2]} − ${rectB[0]}) × (${rectB[3]} − ${rectB[1]}) = ${view.areaB}`,
    "overlap-width": `max(0, ${view.overlapRight} − ${view.overlapLeft}) = ${view.overlapWidth}`,
    "overlap-height": `max(0, ${view.overlapTop} − ${view.overlapBottom}) = ${view.overlapHeight}`,
    "overlap-area": `${view.overlapWidth} × ${view.overlapHeight} = ${view.overlapArea}`,
    return: `${view.areaA} + ${view.areaB} − ${view.overlapArea} = ${view.answer}`,
  };
  const final = Boolean(view.final);
  const summary = vi
    ? `Bài 223: tổng diện tích phủ là ${view.answer ?? "đang tính"}.`
    : `Problem 223: total covered area is ${view.answer ?? "being computed"}.`;

  $("treeView").innerHTML = `<section class="ra223-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>GEOMETRY · INCLUSION–EXCLUSION · #223</small><strong>RECTANGLE AREA</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ra223-phases">${phases}</div>
    <section class="ra223-rule"><span><b>AREA A</b></span><i>+</i><span><b>AREA B</b></span><i>−</i><span class="overlap"><b>OVERLAP</b></span><i>=</i><strong>${vi ? "DIỆN TÍCH PHỦ" : "COVERED AREA"}</strong></section>
    <section class="ra223-workspace"><div class="ra223-plane"><header><strong>${vi ? "MẶT PHẲNG TỌA ĐỘ" : "COORDINATE PLANE"}</strong><span><i>A</i> · <em>B</em> · <b>A ∩ B</b></span></header>${plane}</div><div class="ra223-metrics">${metric("area-a", "AREA A", view.areaA, `${rectA[2] - rectA[0]} × ${rectA[3] - rectA[1]}`)}${metric("area-b", "AREA B", view.areaB, `${rectB[2] - rectB[0]} × ${rectB[3] - rectB[1]}`)}${metric("overlap", "OVERLAP", view.overlapArea, `${view.overlapWidth ?? "?"} × ${view.overlapHeight ?? "?"}`)}</div></section>
    <section class="ra223-dimensions">${dimensions}</section>
    <section class="ra223-equation ${final ? "done" : ""}"><small>INCLUSION–EXCLUSION</small><div><b>${view.areaA ?? "A"}</b><i>+</i><b>${view.areaB ?? "B"}</b><i>−</i><b class="overlap">${view.overlapArea ?? "A ∩ B"}</b><i>=</i><strong>${final ? view.answer : "…"}</strong></div></section>
    <section class="ra223-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><code>${escapeHtml(formulas[view.operation] || view.operation || "—")}</code><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="ra223-result ${final ? "done" : ""}"><small>${vi ? "TỔNG DIỆN TÍCH PHỦ" : "TOTAL COVERED AREA"}</small><strong>${final ? view.answer : "…"}</strong><span>${final ? (vi ? "phần giao chỉ được tính một lần" : "the overlap is counted exactly once") : (vi ? "đang tính từng thành phần" : "computing each component")}</span></footer>
  </section>`;
}

function renderRectangleOverlap836View(step) {
  const view = step.rectangleOverlap836View || {};
  const vi = lang === "vi";
  const approach = view.approach === 2 ? 2 : 1;
  const rec1 = Array.isArray(view.rec1) ? view.rec1.map(Number) : [0, 0, 1, 1];
  const rec2 = Array.isArray(view.rec2) ? view.rec2.map(Number) : [0, 0, 1, 1];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const labels = approach === 2
    ? vi
      ? ["Tọa độ rec1", "Tọa độ rec2", "4 hướng tách", "Điều kiện OR", "Kết quả"]
      : ["rec1 coordinates", "rec2 coordinates", "4 separations", "OR condition", "Result"]
    : vi
      ? ["Hai rectangle", "Chiếu trục X", "Chiếu trục Y", "Kiểm tra độ dài", "Kết quả"]
      : ["Two rectangles", "Project on X", "Project on Y", "Check lengths", "Result"];
  const phases = labels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const valuesX = [rec1[0], rec1[2], rec2[0], rec2[2]];
  const valuesY = [rec1[1], rec1[3], rec2[1], rec2[3]];
  let minX = Math.min(...valuesX);
  let maxX = Math.max(...valuesX);
  let minY = Math.min(...valuesY);
  let maxY = Math.max(...valuesY);
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  minX -= spanX * 0.16;
  maxX += spanX * 0.16;
  minY -= spanY * 0.18;
  maxY += spanY * 0.18;
  const plot = { left: 52, top: 20, width: 556, height: 244 };
  const mapX = (x) => plot.left + ((x - minX) / (maxX - minX)) * plot.width;
  const mapY = (y) => plot.top + ((maxY - y) / (maxY - minY)) * plot.height;
  const rectSvg = (rect, name, className) => {
    const x = mapX(rect[0]);
    const y = mapY(rect[3]);
    const width = mapX(rect[2]) - x;
    const height = mapY(rect[1]) - y;
    return `<g class="${className}"><rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="4"/><text x="${(x + width / 2).toFixed(2)}" y="${(y + height / 2).toFixed(2)}">${name}</text><text class="corner start" x="${(x + 5).toFixed(2)}" y="${(y + height - 7).toFixed(2)}">(${rect[0]}, ${rect[1]})</text><text class="corner end" x="${(x + width - 5).toFixed(2)}" y="${(y + 13).toFixed(2)}">(${rect[2]}, ${rect[3]})</text></g>`;
  };
  const bounds = [];
  if (Number.isFinite(view.left)) bounds.push(`<line class="ro836-bound x" x1="${mapX(view.left).toFixed(2)}" y1="${plot.top}" x2="${mapX(view.left).toFixed(2)}" y2="${plot.top + plot.height}"/><text class="ro836-bound-label" x="${mapX(view.left).toFixed(2)}" y="${plot.top + plot.height + 17}">left ${view.left}</text>`);
  if (Number.isFinite(view.right)) bounds.push(`<line class="ro836-bound x" x1="${mapX(view.right).toFixed(2)}" y1="${plot.top}" x2="${mapX(view.right).toFixed(2)}" y2="${plot.top + plot.height}"/><text class="ro836-bound-label" x="${mapX(view.right).toFixed(2)}" y="${plot.top + plot.height + 17}">right ${view.right}</text>`);
  if (Number.isFinite(view.bottom)) bounds.push(`<line class="ro836-bound y" x1="${plot.left}" y1="${mapY(view.bottom).toFixed(2)}" x2="${plot.left + plot.width}" y2="${mapY(view.bottom).toFixed(2)}"/><text class="ro836-bound-label y" x="${plot.left - 5}" y="${(mapY(view.bottom) + 4).toFixed(2)}">${view.bottom}</text>`);
  if (Number.isFinite(view.top)) bounds.push(`<line class="ro836-bound y" x1="${plot.left}" y1="${mapY(view.top).toFixed(2)}" x2="${plot.left + plot.width}" y2="${mapY(view.top).toFixed(2)}"/><text class="ro836-bound-label y" x="${plot.left - 5}" y="${(mapY(view.top) + 4).toFixed(2)}">${view.top}</text>`);

  let intersection = "";
  if (view.overlapX === true && view.overlapY === true) {
    const x = mapX(view.left);
    const y = mapY(view.top);
    const width = mapX(view.right) - x;
    const height = mapY(view.bottom) - y;
    intersection = `<g class="ro836-intersection"><rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="3"/><text x="${(x + width / 2).toFixed(2)}" y="${(y + height / 2).toFixed(2)}">OVERLAP</text></g>`;
  }
  const svgSummary = vi ? "Hai hình chữ nhật trên mặt phẳng tọa độ và vùng giao của chúng." : "Two rectangles on a coordinate plane and their intersection.";
  const plane = `<svg viewBox="0 0 660 300" role="img" aria-label="${escapeHtml(svgSummary)}"><rect class="ro836-plane-bg" x="${plot.left}" y="${plot.top}" width="${plot.width}" height="${plot.height}" rx="5"/><line class="ro836-axis" x1="${plot.left}" y1="${plot.top + plot.height}" x2="${plot.left + plot.width}" y2="${plot.top + plot.height}"/><line class="ro836-axis" x1="${plot.left}" y1="${plot.top}" x2="${plot.left}" y2="${plot.top + plot.height}"/><text class="ro836-axis-name" x="${plot.left + plot.width + 10}" y="${plot.top + plot.height + 4}">x</text><text class="ro836-axis-name" x="${plot.left - 4}" y="${plot.top - 7}">y</text>${rectSvg(rec1, "A", "ro836-rect-a")}${rectSvg(rec2, "B", "ro836-rect-b")}${bounds.join("")}${intersection}</svg>`;

  const axisCard = (axis, start, end, overlap) => {
    const known = Number.isFinite(start) && Number.isFinite(end);
    const state = overlap === true ? "pass" : overlap === false ? "fail" : "pending";
    const symbol = overlap === true ? "<" : overlap === false ? "≥" : "?";
    const length = known ? end - start : null;
    return `<article class="ro836-axis-card ${state}"><header><strong>${axis}</strong><span>${overlap === true ? "OVERLAP ✓" : overlap === false ? "NO OVERLAP ✕" : (vi ? "đang tính" : "computing")}</span></header><div><b>${known ? start : "?"}</b><i>${symbol}</i><b>${known ? end : "?"}</b></div><footer><span>${axis === "X" ? (vi ? "độ rộng" : "width") : (vi ? "chiều cao" : "height")}</span><code>${length == null ? "?" : length}</code><small>${vi ? "phải > 0" : "must be > 0"}</small></footer></article>`;
  };

  const separationDefinitions = [
    { label: vi ? "A ở bên trái B" : "A is left of B", formula: `x2 ≤ x3`, left: rec1[2], right: rec2[0] },
    { label: vi ? "A ở bên phải B" : "A is right of B", formula: `x1 ≥ x4`, left: rec1[0], right: rec2[2] },
    { label: vi ? "A ở phía dưới B" : "A is below B", formula: `y2 ≤ y3`, left: rec1[3], right: rec2[1] },
    { label: vi ? "A ở phía trên B" : "A is above B", formula: `y1 ≥ y4`, left: rec1[1], right: rec2[3] },
  ];
  const separationValues = Array.isArray(view.separations) ? view.separations : [null, null, null, null];
  const separationCards = separationDefinitions.map((item, index) => {
    const result = separationValues[index];
    const state = result === true ? "separated" : result === false ? "clear" : "pending";
    const active = index === view.activeSeparation ? " active" : "";
    return `<article class="ro836-separation ${state}${active}"><header><strong>${escapeHtml(item.label)}</strong><span>${result == null ? "?" : result ? "TRUE · NOT OVERLAP" : "FALSE"}</span></header><code>${item.formula}</code><div><b>${item.left}</b><i>${item.formula.includes("≤") ? "≤" : "≥"}</i><b>${item.right}</b></div></article>`;
  }).join("");

  const formulas = {
    inputs: `rec1=[${rec1.join(",")}], rec2=[${rec2.join(",")}]`,
    left: `left = max(${rec1[0]}, ${rec2[0]}) = ${view.left}`,
    right: `right = min(${rec1[2]}, ${rec2[2]}) = ${view.right}`,
    bottom: `bottom = max(${rec1[1]}, ${rec2[1]}) = ${view.bottom}`,
    top: `top = min(${rec1[3]}, ${rec2[3]}) = ${view.top}`,
    "overlap-x": `${view.left} < ${view.right} → ${view.overlapX}`,
    "overlap-y": `${view.bottom} < ${view.top} → ${view.overlapY}`,
    return: `${view.overlapX} and ${view.overlapY} → ${view.answer}`,
    "assign-x1": `x1 = rec1[0] = ${rec1[0]}`,
    "assign-y1": `y1 = rec1[1] = ${rec1[1]}`,
    "assign-x2": `x2 = rec1[2] = ${rec1[2]}`,
    "assign-y2": `y2 = rec1[3] = ${rec1[3]}`,
    "assign-x3": `x3 = rec2[0] = ${rec2[0]}`,
    "assign-y3": `y3 = rec2[1] = ${rec2[1]}`,
    "assign-x4": `x4 = rec2[2] = ${rec2[2]}`,
    "assign-y4": `y4 = rec2[3] = ${rec2[3]}`,
    "not-overlap-check": "x2 <= x3 or x1 >= x4 or y2 <= y3 or y1 >= y4",
    "return-false": "return False",
    "return-true": "return True",
  };
  const final = Boolean(view.final);
  const answerLabel = view.answer === true ? "TRUE" : view.answer === false ? "FALSE" : "…";
  const summary = approach === 2
    ? vi
      ? `Bài 836 cách 2: kiểm tra bốn hướng có thể làm hai rectangle không overlap.`
      : "Problem 836 approach 2: check the four directions that can separate the rectangles."
    : vi
      ? `Bài 836: overlap trục X là ${view.overlapX ?? "chưa biết"}, overlap trục Y là ${view.overlapY ?? "chưa biết"}.`
      : `Problem 836: X overlap is ${view.overlapX ?? "unknown"}, Y overlap is ${view.overlapY ?? "unknown"}.`;
  const rule = approach === 2
    ? `<section class="ro836-rule ro836-rule-separation"><span><b>1</b><code>x2 ≤ x3</code></span><i>OR</i><span><b>2</b><code>x1 ≥ x4</code></span><i>OR</i><span><b>3</b><code>y2 ≤ y3</code></span><i>OR</i><span><b>4</b><code>y1 ≥ y4</code></span></section>`
    : `<section class="ro836-rule"><span><b>X</b><code>max(lefts) &lt; min(rights)</code></span><i>AND</i><span><b>Y</b><code>max(bottoms) &lt; min(tops)</code></span></section>`;
  const checks = approach === 2
    ? `<section class="ro836-separation-grid">${separationCards}</section>`
    : `<section class="ro836-axis-checks">${axisCard("X", view.left, view.right, view.overlapX)}${axisCard("Y", view.bottom, view.top, view.overlapY)}</section>`;

  $("treeView").innerHTML = `<section class="ro836-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>GEOMETRY · ${approach === 2 ? "SEPARATION TEST" : "AXIS PROJECTION"} · #836</small><strong>RECTANGLE OVERLAP · ${approach === 2 ? "APPROACH 2" : "APPROACH 1"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ro836-phases">${phases}</div>
    ${rule}
    <section class="ro836-plane"><header><strong>${vi ? "MẶT PHẲNG TỌA ĐỘ" : "COORDINATE PLANE"}</strong><span><i>A</i> rec1 · <em>B</em> rec2 · <b>${vi ? "giao" : "intersection"}</b></span></header>${plane}</section>
    ${checks}
    <section class="ro836-operation"><header><strong>${vi ? "DÒNG ĐANG CHẠY" : "EXECUTING"}</strong><code>${escapeHtml(formulas[view.operation] || view.operation || "—")}</code></header><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="ro836-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong></section>
    <footer class="ro836-result ${final ? (view.answer ? "yes" : "no") : ""}"><small>POSITIVE-AREA OVERLAP?</small><strong>${answerLabel}</strong><span>${final ? (view.answer ? (vi ? "cả width và height đều dương" : "both width and height are positive") : (vi ? "ít nhất một chiều không dương" : "at least one dimension is non-positive")) : (vi ? "cần cả hai phép chiếu overlap" : "both axis projections must overlap")}</span></footer>
  </section>`;
}

function renderPalindrome2472View(step) {
  const view = step.palindrome2472View || {};
  const vi = lang === "vi";
  const s = String(view.s || "");
  const n = s.length;
  const k = Number(view.k) || 1;
  const table = Array.isArray(view.palindrome) ? view.palindrome : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const current = Array.isArray(view.current) ? view.current : null;
  const inner = Array.isArray(view.inner) ? view.inner : null;
  const selected = Array.isArray(view.selected) ? view.selected : [];
  const candidate = view.candidate || null;
  const activePrefix = Number.isInteger(view.activePrefix) ? view.activePrefix : -1;
  const phaseIndex = view.phase === "palindrome" ? 0 : view.phase === "prefix" ? 1 : 2;

  const phases = [
    vi ? "Nhận diện palindrome" : "Find palindromes",
    vi ? "Tối ưu từng prefix" : "Optimize prefixes",
    vi ? "Đọc kết quả" : "Read result",
  ].map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const isSelected = (index) => selected.some(([left, right]) => left <= index && index <= right);
  const isCurrent = (index) => current && current[0] <= index && index <= current[1];
  const chars = [...s].map((char, index) => {
    const classes = ["p2472-char"];
    if (isSelected(index)) classes.push("selected");
    if (isCurrent(index)) classes.push(candidate && !candidate.isPalindrome ? "rejected" : "current");
    if (activePrefix >= 0 && index >= activePrefix) classes.push("outside-prefix");
    const labels = [];
    if (isSelected(index)) labels.push(vi ? "đã chọn" : "chosen");
    if (isCurrent(index)) labels.push(vi ? "đang xét" : "checking");
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(char)}</strong><em>${escapeHtml(labels.join(" · "))}</em></span>`;
  }).join("");

  const matrixHeader = `<span class="corner">pal</span>${[...s].map((char, index) => `<span class="axis"><small>${index}</small><b>${escapeHtml(char)}</b></span>`).join("")}`;
  const matrixRows = [...s].map((char, row) => {
    const cells = [...s].map((_unused, col) => {
      if (col < row) return '<span class="p2472-pal-cell unused" aria-hidden="true"></span>';
      const value = table[row]?.[col];
      const classes = ["p2472-pal-cell", value == null ? "unknown" : value ? "yes" : "no"];
      if (current && current[0] === row && current[1] === col) classes.push("current");
      if (inner && inner[0] === row && inner[1] === col) classes.push("inner");
      const word = s.slice(row, col + 1);
      const state = value == null ? (vi ? "chưa tính" : "not computed") : value ? "palindrome" : (vi ? "không palindrome" : "not a palindrome");
      return `<span class="${classes.join(" ")}" aria-label="${escapeHtml(`${word}: ${state}`)}"><b>${value == null ? "·" : value ? "1" : "0"}</b></span>`;
    }).join("");
    return `<span class="axis row"><small>${row}</small><b>${escapeHtml(char)}</b></span>${cells}`;
  }).join("");

  const dpCells = Array.from({ length: n + 1 }, (_unused, index) => {
    const value = dp[index];
    const classes = ["p2472-dp-cell"];
    if (index === activePrefix) classes.push("active");
    if (value != null) classes.push("ready");
    return `<span class="${classes.join(" ")}"><small>dp[${index}]</small><b>${value == null ? "·" : value}</b><em>${index === 0 ? "∅" : escapeHtml(s.slice(0, index))}</em></span>`;
  }).join("");

  const chosenHtml = selected.length
    ? selected.map(([left, right]) => `<span><code>[${left}..${right}]</code><b>“${escapeHtml(s.slice(left, right + 1))}”</b></span>`).join("")
    : `<p>${vi ? "Chưa chọn palindrome nào trong prefix này." : "No palindrome has been selected in this prefix yet."}</p>`;

  let transition;
  if (view.phase === "palindrome" && current) {
    const [left, right] = current;
    const endpoints = s[left] === s[right];
    const innerText = right - left <= 1 ? "base case" : `pal[${left + 1}][${right - 1}] = ${table[left + 1]?.[right - 1] ? 1 : 0}`;
    transition = `<code>s[${left}] == s[${right}] → ${endpoints ? "True" : "False"}</code><i>AND</i><code>${escapeHtml(innerText)}</code><i>→</i><strong>${table[left]?.[right] ? "PALINDROME" : "NO"}</strong>`;
  } else if (candidate) {
    transition = candidate.isPalindrome
      ? `<code>dp[${candidate.start}] + 1 = ${candidate.value}</code><i>${candidate.improves ? ">" : "≤"}</i><code>dp[${activePrefix}] = ${dp[activePrefix]}</code><strong>${candidate.improves ? (vi ? "CẬP NHẬT" : "UPDATE") : (vi ? "GIỮ NGUYÊN" : "KEEP")}</strong>`
      : `<code>pal[${candidate.start}][${candidate.end}] = 0</code><i>→</i><strong>${vi ? "LOẠI" : "REJECT"}</strong>`;
  } else if (view.operation === "skip") {
    transition = `<code>dp[${activePrefix}] = dp[${activePrefix - 1}] = ${dp[activePrefix]}</code><strong>${vi ? "BỎ QUA KÝ TỰ CUỐI" : "SKIP LAST CHARACTER"}</strong>`;
  } else {
    transition = `<code>dp[p] = max(dp[p − 1], dp[start] + 1)</code><strong>${vi ? "MỖI ĐOẠN PHẢI DÀI ≥" : "EACH SPAN MUST HAVE LENGTH ≥"} ${k}</strong>`;
  }

  const result = view.final ? String(view.answer) : "…";
  const summary = vi
    ? `Bài 2472: đã chọn ${selected.length} palindrome không giao nhau; kết quả hiện tại ${view.final ? view.answer : "đang tính"}.`
    : `Problem 2472: ${selected.length} non-overlapping palindromes selected; result ${view.final ? view.answer : "in progress"}.`;

  $("treeView").innerHTML = `<section class="p2472-viz phase-${escapeHtml(view.phase || "palindrome")}" style="--p2472-size:${n}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>PALINDROME TABLE · PREFIX DP · #2472</small><strong>MAX NON-OVERLAPPING PALINDROMES</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="p2472-phases">${phases}</div>
    <section class="p2472-rule"><b>STATE</b><span><code>pal[l][r]</code> ${vi ? "xác nhận đoạn đối xứng" : "recognizes a palindrome"} · <code>dp[p]</code> ${vi ? "tối đa số đoạn trong prefix dài p" : "maximizes the count in a prefix of length p"}</span></section>
    <section class="p2472-string"><header><strong>${vi ? "CHUỖI ĐẦU VÀO" : "INPUT STRING"}</strong><span>k = ${k} · n = ${n}</span></header><div>${chars}</div></section>
    <section class="p2472-main">
      <article class="p2472-matrix"><header><strong>PALINDROME LOOKUP</strong><span>1 = yes · 0 = no · · = pending</span></header><div class="p2472-matrix-scroll"><div class="p2472-pal-grid" style="--p2472-size:${n}">${matrixHeader}${matrixRows}</div></div></article>
      <article class="p2472-prefix"><header><strong>PREFIX DP</strong><span>${vi ? "prefix kết thúc trước vị trí p" : "prefix ends before position p"}</span></header><div class="p2472-dp-scroll"><div class="p2472-dp-grid">${dpCells}</div></div><div class="p2472-chosen"><small>${vi ? "MỘT LỰA CHỌN TỐI ƯU HIỆN TẠI" : "ONE CURRENT OPTIMAL SELECTION"}</small><div>${chosenHtml}</div></div></article>
    </section>
    <section class="p2472-transition">${transition}</section>
    <section class="p2472-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="p2472-result ${view.final ? "done" : ""}"><small>MAXIMUM COUNT</small><strong>${result}</strong><span>${view.final ? (vi ? "Các đoạn xanh không giao nhau và đều dài ít nhất k." : "The green spans do not overlap and each has length at least k.") : (vi ? "Bảng DP đang được điền từ trái sang phải." : "The DP row is filling from left to right.")}</span></footer>
  </section>`;
}

function renderLineSegments1621View(step) {
  const view = step.lineSegments1621View || {};
  const vi = lang === "vi";

  if (Number(view.approach) === 2) {
    const n = Number(view.n) || 0;
    const k = Number(view.k) || 0;
    const totalDistance = Number(view.totalDistance) || 0;
    const remaining = Number(view.remaining) || 0;
    const variables = Number(view.variables) || 0;
    const bars = Number(view.bars) || 0;
    const totalSlots = Number(view.totalSlots) || 0;
    const revealed = view.revealed || {};
    const show = (name, value) => revealed[name] ? value : "…";
    const shifted = view.phase !== "encode";
    const parts = shifted && Array.isArray(view.shiftedParts) ? view.shiftedParts : (Array.isArray(view.parts) ? view.parts : []);
    const phaseIndex = view.phase === "encode" ? 0 : view.phase === "shift" ? 1 : view.phase === "stars" ? 2 : 3;
    const phaseLabels = vi
      ? ["Mã hóa", "Trừ phần bắt buộc", "Stars & Bars", "Kết quả"]
      : ["Encode", "Remove minimum", "Stars & Bars", "Result"];
    const phases = phaseLabels.map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index + 1}</b>${escapeHtml(label)}</span>`).join("");
    const partHtml = parts.map((part, index) => {
      const label = escapeHtml(part.label || "?");
      const kind = part.kind === "segment" ? "segment" : "gap";
      const caption = kind === "segment"
        ? (shifted ? (vi ? "phần thêm" : "extra length") : (vi ? "độ dài đoạn" : "segment length"))
        : (vi ? "khoảng trống" : "gap");
      return `${index ? `<i aria-hidden="true">+</i>` : ""}<span class="ls1621-comb-piece ${kind}"><strong>${label}</strong><small>${caption} ≥ ${Number(part.minimum) || 0}</small></span>`;
    }).join("");
    const labels = parts.map((part) => escapeHtml(part.label || "?")).join(" + ");
    const rightSide = shifted ? show("remaining", remaining) : show("distance", totalDistance);
    const tokens = revealed.dividers ? [
      ...Array.from({ length: remaining }, () => `<span class="star" aria-label="star">★</span>`),
      ...Array.from({ length: bars }, () => `<span class="bar" aria-label="divider">|</span>`),
    ].join("") : `<span class="ls1621-comb-wait">${vi ? "Tính số vạch ở dòng tiếp theo" : "Compute the divider count on the next line"}</span>`;
    const starPanel = phaseIndex >= 2
      ? `<section class="ls1621-comb-stars"><header><strong>STARS AND BARS</strong><span>${vi ? `${show("remaining", remaining)} sao + ${show("dividers", bars)} vạch = ${show("total_slots", totalSlots)} vị trí` : `${show("remaining", remaining)} stars + ${show("dividers", bars)} dividers = ${show("total_slots", totalSlots)} slots`}</span></header><div aria-label="${vi ? "Một cách sắp xếp sao và vạch" : "One stars-and-bars arrangement"}">${tokens}</div><p>${revealed.total_slots ? (vi ? `Chọn ${bars} vị trí đặt vạch trong ${totalSlots} vị trí.` : `Choose ${bars} divider positions among ${totalSlots} slots.`) : (vi ? "Mỗi dòng code mở thêm đúng một đại lượng." : "Each code line reveals exactly one more quantity.")}</p></section>`
      : "";
    const answer = view.final ? String(view.answer) : "…";
    const summary = vi
      ? `Bài 1621, cách tổ hợp: ${variables} biến không âm có tổng ${remaining}; đáp án ${view.final ? view.answer : "đang tính"}.`
      : `Problem 1621, combinatorial approach: ${variables} non-negative variables sum to ${remaining}; answer ${view.final ? view.answer : "in progress"}.`;

    $("treeView").innerHTML = `<section class="ls1621-viz ls1621-comb-viz phase-${escapeHtml(view.phase || "encode")}" role="img" aria-label="${escapeHtml(summary)}">
      <header><div><small>COMBINATORICS · STARS AND BARS · #1621</small><strong>${vi ? "ĐẾM BẰNG TỔ HỢP" : "COUNT WITH COMBINATORICS"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
      <div class="ls1621-phases">${phases}</div>
      <section class="ls1621-comb-meaning"><strong>${shifted ? (vi ? "SAU KHI TRỪ 1 CẠNH BẮT BUỘC MỖI ĐOẠN" : "AFTER REMOVING 1 MANDATORY EDGE PER SEGMENT") : (vi ? "MỘT HÌNH VẼ = ĐỘ DÀI ĐOẠN + CÁC KHOẢNG TRỐNG" : "ONE DRAWING = SEGMENT LENGTHS + GAPS")}</strong><span>${vi ? `${k} đoạn tạo ${k} biến s; trước, giữa và sau chúng có ${k + 1} biến g.` : `${k} segments create ${k} s-variables; before, between, and after them are ${k + 1} g-variables.`}</span></section>
      <section class="ls1621-comb-parts"><div>${partHtml}</div><p><code>${labels}</code><b>=</b><strong>${rightSide}</strong></p></section>
      ${starPanel}
      <section class="ls1621-comb-formula"><span><small>${vi ? "SỐ BIẾN" : "VARIABLES"}</small><strong>${show("variables", variables)}${revealed.variables ? " = 2k + 1" : ""}</strong></span><i>→</i><span><small>${vi ? "SỐ VẠCH" : "DIVIDERS"}</small><strong>${show("dividers", bars)}${revealed.dividers ? " = 2k" : ""}</strong></span><i>→</i><span><small>${vi ? "CHỌN VỊ TRÍ VẠCH" : "CHOOSE DIVIDER SLOTS"}</small><strong>C(${show("total_slots", totalSlots)}, ${show("dividers", bars)})</strong></span></section>
      <footer class="ls1621-result ${view.final ? "done" : ""}"><small>NUMBER OF SETS</small><strong>${answer}</strong><span>C(n + k − 1, 2k) = C(${show("total_slots", totalSlots)}, ${show("dividers", bars)})${view.final ? ` = ${answer}` : ""}</span></footer>
    </section>`;
    return;
  }

  const n = Number(view.n) || 0;
  const k = Number(view.k) || 0;
  const ways = Array.isArray(view.ways) ? view.ways : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const computed = Array.isArray(view.computed) ? view.computed : [];
  const prefixComputed = Array.isArray(view.prefixComputed) ? view.prefixComputed : computed;
  const points = Number.isInteger(view.points) ? view.points : 0;
  const segments = Number.isInteger(view.segments) ? view.segments : 0;
  const candidates = Array.isArray(view.candidates) ? view.candidates : [];
  const phaseIndex = view.phase === "init" ? 0 : view.phase === "base" ? 1 : view.phase === "fill" ? 2 : 3;

  const phaseLabels = vi
    ? ["Base 0 điểm", "Base 0 đoạn", "Điền bảng", "Kết quả"]
    : ["Zero-point base", "Zero-segment base", "Fill table", "Result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const pointRail = Array.from({ length: n }, (_unused, index) => {
    const classes = ["ls1621-point"];
    if (index < points) classes.push("available");
    if (points > 0 && index === points - 1) classes.push("right-end");
    if (index >= points) classes.push("future");
    return `<span class="${classes.join(" ")}"><b>${index}</b><small>${points > 0 && index === points - 1 ? (vi ? "đầu phải" : "right end") : "x=" + index}</small></span>`;
  }).join("");

  const laneHtml = candidates.length
    ? candidates.map((candidate) => {
        const denominator = Math.max(n - 1, 1);
        const left = candidate.start / denominator * 100;
        const width = (candidate.end - candidate.start) / denominator * 100;
        const state = candidate.priorWays > 0 ? "contributes" : "zero";
        return `<div class="ls1621-lane ${state}"><code>start ${candidate.start}</code><div class="ls1621-track"><i style="left:${left}%;width:${width}%"></i><span style="left:${left}%"></span><span style="left:${left + width}%"></span></div><b>${candidate.priorWays}</b><small>${vi ? "cách bên trái" : "left-side ways"}</small></div>`;
      }).join("")
    : `<p>${view.operation === "read-skip" ? (vi ? "Dòng này chỉ đọc nhánh bỏ điểm cuối; các đoạn ứng viên xuất hiện ở dòng kế tiếp." : "This line only reads the skip branch; candidate segments appear on the next line.") : view.phase === "fill" ? (vi ? "Chưa có điểm nào bên trái để tạo đoạn có độ dài dương." : "No earlier point can form a positive-length segment yet.") : (vi ? "Các đoạn ứng viên sẽ xuất hiện khi điền trạng thái." : "Candidate final segments appear while filling a state.")}</p>`;

  const tableHeader = `<span class="corner">s \\ p</span>${Array.from({ length: n + 1 }, (_unused, p) => `<span class="axis"><small>${vi ? "điểm" : "points"}</small><b>${p}</b></span>`).join("")}`;
  const tableRows = Array.from({ length: k + 1 }, (_unused, s) => {
    const cells = Array.from({ length: n + 1 }, (_unusedCell, p) => {
      const ready = Boolean(computed[p]?.[s]);
      const sumReady = Boolean(prefixComputed[p]?.[s]);
      const classes = ["ls1621-cell", ready ? "ready" : "pending"];
      if (p === points && s === segments) classes.push("current");
      if (view.phase === "fill" && ["read-skip", "write-ways"].includes(view.operation) && p === points - 1 && s === segments) classes.push("skip-source");
      if (view.phase === "fill" && ["read-prefix", "write-ways"].includes(view.operation) && s === segments - 1 && p >= 1 && p <= points - 1) classes.push("prefix-source");
      if (view.operation === "write-prefix" && p === points - 1 && s === segments) classes.push("running-source");
      if (view.operation === "write-prefix" && p === points && s === segments) classes.push("prefix-current");
      if (view.final && p === n && s === k) classes.push("answer");
      const value = ready ? ways[p]?.[s] ?? 0 : "·";
      const sum = sumReady ? prefix[p]?.[s] ?? 0 : "·";
      return `<span class="${classes.join(" ")}"><b>${value}</b><small>Σ ${sum}</small></span>`;
    }).join("");
    return `<span class="axis row"><small>${vi ? "đoạn" : "segments"}</small><b>${s}</b></span>${cells}`;
  }).join("");

  let formula;
  if (view.operation === "read-skip") {
    formula = `<span><small>${vi ? "ĐỌC Ô XANH" : "READ BLUE CELL"}</small><code>skip = ways[${points - 1}][${segments}]</code></span><i>→</i><strong>${view.skip}</strong>`;
  } else if (view.operation === "read-prefix") {
    formula = `<span><small>${vi ? "ĐỌC TỔNG PREFIX" : "READ PREFIX SUM"}</small><code>end_here = prefix[${points - 1}][${segments - 1}]</code></span><i>→</i><strong>${view.endHere}</strong>`;
  } else if (view.operation === "write-ways") {
    formula = `<span><small>${vi ? "BỎ ĐIỂM CUỐI" : "SKIP LAST POINT"}</small><code>ways[${points - 1}][${segments}] = ${view.skip}</code></span><i>+</i><span><small>${vi ? "KẾT THÚC ĐOẠN TẠI" : "END SEGMENT AT"} ${points - 1}</small><code>prefix[${points - 1}][${segments - 1}] = ${view.endHere}</code></span><i>=</i><strong>${ways[points]?.[segments] ?? 0}</strong>`;
  } else if (view.operation === "write-prefix") {
    formula = `<span><small>${vi ? "PREFIX TRƯỚC" : "PREVIOUS PREFIX"}</small><code>prefix[${points - 1}][${segments}] = ${prefix[points - 1]?.[segments] ?? 0}</code></span><i>+</i><span><small>${vi ? "Ô WAYS VỪA GHI" : "NEW WAYS CELL"}</small><code>ways[${points}][${segments}] = ${ways[points]?.[segments] ?? 0}</code></span><i>=</i><strong>${prefix[points]?.[segments] ?? 0}</strong>`;
  } else if (view.operation === "base-ways") {
    formula = `<span><small>BASE WAYS</small><code>ways[${points}][0]</code></span><i>=</i><strong>1</strong>`;
  } else if (view.operation === "base-prefix") {
    formula = `<span><small>RUNNING SUM</small><code>prefix[${points}][0]</code></span><i>=</i><strong>${points}</strong>`;
  } else if (view.final) {
    formula = `<span><small>ANSWER</small><code>ways[${n}][${k}]</code></span><i>=</i><strong>${view.answer}</strong>`;
  } else {
    formula = `<span><small>RECURRENCE</small><code>ways[p][s] = ways[p−1][s] + prefix[p−1][s−1]</code></span>`;
  }

  const result = view.final ? String(view.answer) : "…";
  const summary = vi
    ? `Bài 1621 với n=${n}, k=${k}; trạng thái hiện tại dùng ${points} điểm và ${segments} đoạn.`
    : `Problem 1621 with n=${n}, k=${k}; the current state uses ${points} points and ${segments} segments.`;

  $("treeView").innerHTML = `<section class="ls1621-viz phase-${escapeHtml(view.phase || "init")}" style="--ls1621-points:${n}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>COUNTING DP · PREFIX SUM · #1621</small><strong>K NON-OVERLAPPING LINE SEGMENTS</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ls1621-phases">${phases}</div>
    <section class="ls1621-rule"><b>STATE</b><span><code>ways[p][s]</code> ${vi ? "= số cách vẽ s đoạn bằng p điểm đầu" : "= drawings of s segments using the first p points"}. <code>prefix[p][s]</code> ${vi ? "gom mọi vị trí bắt đầu" : "aggregates every possible start"}.</span></section>
    <section class="ls1621-points"><header><strong>${vi ? "CÁC ĐIỂM TRÊN ĐƯỜNG THẲNG" : "POINTS ON THE LINE"}</strong><span>${vi ? "các đoạn được phép chung đầu mút" : "segments may share endpoints"}</span></header><div>${pointRail}</div></section>
    <section class="ls1621-main">
      <article class="ls1621-candidates"><header><strong>${vi ? "ĐOẠN CUỐI CÓ THỂ KẾT THÚC TẠI" : "FINAL SEGMENT ENDING AT"} ${points > 0 ? points - 1 : "—"}</strong><span>${vi ? "mỗi hàng chọn một đầu trái" : "each row chooses one left endpoint"}</span></header><div>${laneHtml}</div></article>
      <article class="ls1621-table"><header><strong>WAYS + PREFIX</strong><span>${vi ? "số lớn = ways · Σ = prefix" : "large = ways · Σ = prefix"}</span></header><div class="ls1621-table-scroll"><div class="ls1621-grid" style="--ls1621-cols:${n + 1}">${tableHeader}${tableRows}</div></div></article>
    </section>
    <section class="ls1621-formula">${formula}</section>
    <section class="ls1621-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="ls1621-result ${view.final ? "done" : ""}"><small>NUMBER OF SETS</small><strong>${result}</strong><span>${view.final ? (vi ? "Mỗi tập chứa đúng k đoạn; chạm chung đầu mút không bị xem là chồng lấn." : "Every set contains exactly k segments; sharing an endpoint is not overlap.") : (vi ? "Prefix sum giữ mỗi chuyển trạng thái ở O(1)." : "The prefix sum keeps each transition O(1).")}</span></footer>
  </section>`;
}

function renderDivideString2138View(step) {
  const view = step.divideString2138View || {};
  const vi = lang === "vi";
  const s = String(view.s || "");
  const k = Number(view.k) || 1;
  const fill = String(view.fill || "");
  const start = Number.isInteger(view.start) ? view.start : -1;
  const end = Number.isInteger(view.end) ? view.end : -1;
  const processedUntil = Number(view.processedUntil) || 0;
  const currentGroup = String(view.currentGroup || "");
  const groups = Array.isArray(view.groups) ? view.groups : [];
  const groupIndex = Number(view.groupIndex) || 0;
  const totalGroups = Number(view.totalGroups) || Math.ceil(s.length / k);
  const operation = String(view.operation || "init");
  const phaseIndex = ["init", "window"].includes(operation) ? 0
    : ["slice", "check"].includes(operation) ? 1
      : operation === "pad" ? 2 : 3;
  const phaseLabels = vi
    ? ["Chọn cửa sổ", "Cắt nhóm", "Bù ký tự", "Lưu kết quả"]
    : ["Select window", "Slice group", "Pad if needed", "Store result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const source = [...s].map((char, index) => {
    const classes = ["ds2138-char"];
    if (index < processedUntil) classes.push("processed");
    if (start >= 0 && index >= start && index < end) classes.push("active");
    if (index > 0 && index % k === 0) classes.push("boundary");
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(char)}</strong></span>`;
  }).join("");

  const slots = Array.from({ length: k }, (_unused, slot) => {
    const sourceIndex = start + slot;
    const hasSource = start >= 0 && sourceIndex >= 0 && sourceIndex < end;
    const hasFill = !hasSource && slot < currentGroup.length;
    const char = hasSource ? s[sourceIndex] : hasFill ? fill : "·";
    const kind = hasSource ? "source" : hasFill ? "fill" : "empty";
    const label = hasSource ? `s[${sourceIndex}]` : hasFill ? (vi ? "fill" : "fill") : (vi ? "chờ" : "waiting");
    return `<span class="ds2138-slot ${kind}"><small>${escapeHtml(label)}</small><strong>${escapeHtml(char)}</strong></span>`;
  }).join("");

  const output = Array.from({ length: totalGroups }, (_unused, index) => {
    const group = groups[index];
    const isCurrent = index === groupIndex && !view.final;
    const chars = group
      ? [...group].map((char, slot) => {
          const originalIndex = index * k + slot;
          const kind = originalIndex >= s.length ? "fill" : "source";
          return `<i class="${kind}">${escapeHtml(char)}</i>`;
        }).join("")
      : Array.from({ length: k }, () => "<i>·</i>").join("");
    return `<span class="ds2138-group ${group ? "ready" : "pending"} ${isCurrent ? "current" : ""}"><small>${vi ? "nhóm" : "group"} ${index + 1}</small><b>${chars}</b></span>`;
  }).join("");

  const missing = Number(view.missing) || 0;
  const status = operation === "check"
    ? (missing > 0 ? (vi ? `Thiếu ${missing} → cần fill` : `Missing ${missing} → padding required`) : (vi ? "Đã đủ k ký tự" : "Already has k characters"))
    : operation === "pad"
      ? (vi ? `Đã thêm '${fill}' × ${missing}` : `Appended '${fill}' × ${missing}`)
      : operation === "append"
        ? (vi ? `Đã lưu ${groups.length}/${totalGroups} nhóm` : `Stored ${groups.length}/${totalGroups} groups`)
        : (vi ? `k = ${k} · fill = '${fill}'` : `k = ${k} · fill = '${fill}'`);
  const answer = view.final ? `[${groups.map((group) => `'${escapeHtml(group)}'`).join(", ")}]` : "…";
  const summary = vi
    ? `Bài 2138: đã hoàn thành ${groups.length}/${totalGroups} nhóm, nhóm hiện tại bắt đầu tại ${start}.`
    : `Problem 2138: completed ${groups.length}/${totalGroups} groups; current start is ${start}.`;

  $("treeView").innerHTML = `<section class="ds2138-viz phase-${escapeHtml(operation)}" style="--ds2138-k:${k}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>STRING · FIXED-SIZE CHUNKS · #2138</small><strong>${vi ? "CHIA CHUỖI THÀNH NHÓM KÝ TỰ" : "DIVIDE STRING INTO GROUPS"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="ds2138-phases">${phases}</div>
    <section class="ds2138-source"><header><strong>${vi ? "CHUỖI GỐC" : "SOURCE STRING"}</strong><span>${vi ? "viền dọc = ranh giới mỗi k ký tự" : "vertical marker = each k-character boundary"}</span></header><div>${source}</div></section>
    <section class="ds2138-work"><header><strong>${vi ? "NHÓM ĐANG XỬ LÝ" : "CURRENT GROUP"} ${start >= 0 ? groupIndex + 1 : "—"}</strong><span>${escapeHtml(status)}</span></header><div>${slots}</div></section>
    <section class="ds2138-output"><header><strong>${vi ? "KẾT QUẢ THEO THỨ TỰ" : "OUTPUT IN ORDER"}</strong><span>${groups.length}/${totalGroups}</span></header><div>${output}</div></section>
    <section class="ds2138-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="ds2138-result ${view.final ? "done" : ""}"><small>GROUPS</small><strong>${answer}</strong></footer>
  </section>`;
}

function renderClosestBst270View(step) {
  const view = step.closestBst270View || {};
  const vi = lang === "vi";
  const values = Array.isArray(view.values) ? view.values : [];
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const current = Number.isFinite(view.current) ? view.current : null;
  const closest = Number.isFinite(view.closest) ? view.closest : null;
  const target = Number(view.target);
  const operation = String(view.operation || "initialize");
  const phaseIndex = ["initialize", "set-node"].includes(operation) ? 0
    : ["visit", "compare", "update"].includes(operation) ? 1
      : ["choose-branch", "move"].includes(operation) ? 2 : 3;
  const phaseLabels = vi
    ? ["Khởi tạo", "So khoảng cách", "Chọn nhánh BST", "Trả kết quả"]
    : ["Initialize", "Compare distance", "Choose BST branch", "Return answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const numberText = (value) => Number.isFinite(value) ? Number(value.toFixed(6)).toString() : "—";

  const rulerValues = [...values, target].filter(Number.isFinite);
  let minimum = rulerValues.length ? Math.min(...rulerValues) : 0;
  let maximum = rulerValues.length ? Math.max(...rulerValues) : 1;
  if (minimum === maximum) {
    minimum -= 1;
    maximum += 1;
  }
  const padding = Math.max((maximum - minimum) * 0.08, 0.5);
  minimum -= padding;
  maximum += padding;
  const position = (value) => `${Math.max(2, Math.min(98, ((value - minimum) / (maximum - minimum)) * 100)).toFixed(2)}%`;
  const rulerRow = (kind, label, value) => Number.isFinite(value)
    ? `<div class="cb270-ruler-row ${kind}"><small>${escapeHtml(label)}</small><div><i></i><b style="left:${position(value)}"><em></em><span>${escapeHtml(numberText(value))}</span></b></div></div>`
    : "";

  const currentDistance = Number.isFinite(view.currentDistance) ? view.currentDistance : null;
  const closestDistance = Number.isFinite(view.closestDistance) ? view.closestDistance : null;
  const comparisonClass = operation === "compare" || operation === "update"
    ? (view.candidateWins ? "candidate-wins" : "closest-wins")
    : "";
  const comparisonSymbol = currentDistance === null || closestDistance === null
    ? "?"
    : currentDistance < closestDistance ? "<" : currentDistance > closestDistance ? ">" : "=";
  const comparisonNote = operation === "compare" || operation === "update"
    ? view.candidateWins
      ? view.tied
        ? (vi ? "Bằng khoảng cách → số nhỏ hơn thắng" : "Equal distance → smaller value wins")
        : (vi ? "Current gần hơn → cập nhật closest" : "Current is nearer → update closest")
      : (vi ? "Giữ nguyên closest" : "Keep the existing closest")
    : (vi ? "Khoảng cách tuyệt đối quyết định ứng viên tốt hơn" : "Absolute distance determines the better candidate");

  const directionLabel = view.direction === "left" ? (vi ? "TRÁI" : "LEFT")
    : view.direction === "right" ? (vi ? "PHẢI" : "RIGHT") : "—";
  const directionFormula = view.direction === "left"
    ? `${numberText(target)} < ${numberText(current)}`
    : view.direction === "right" && current !== null ? `${numberText(target)} ≥ ${numberText(current)}` : "target ? node.val";
  const nextLabel = view.direction
    ? view.nextValue === null ? "None" : numberText(view.nextValue)
    : "—";
  const pathHtml = visited.length
    ? visited.map((item, index) => `<span class="${item.value === current ? "current" : ""} ${item.value === closest ? "closest" : ""}"><small>${index + 1}</small><b>${escapeHtml(numberText(item.value))}</b></span>`).join("<i>→</i>")
    : `<em>${vi ? "Chưa duyệt node nào" : "No node visited yet"}</em>`;
  const final = Boolean(view.final);
  const summary = vi
    ? `Bài 270: target ${numberText(target)}, current ${numberText(current)}, closest ${numberText(closest)}.`
    : `Problem 270: target ${numberText(target)}, current ${numberText(current)}, closest ${numberText(closest)}.`;

  $("treeView").innerHTML = `<section class="cb270-viz phase-${escapeHtml(view.phase || "initialize")}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>BST · GREEDY PATH · #270</small><strong>${vi ? "GIÁ TRỊ GẦN TARGET NHẤT" : "CLOSEST BINARY SEARCH TREE VALUE"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="cb270-phases">${phases}</div>
    <section class="cb270-rule"><b>${vi ? "HAI QUY TẮC" : "TWO RULES"}</b><span><code>(distance, value)</code> ${vi ? "nhỏ hơn sẽ thắng" : "uses lexicographic minimum"}</span><span><code>target &lt; node</code> → LEFT · else → RIGHT</span></section>
    <section class="cb270-ruler"><header><strong>${vi ? "CÙNG MỘT TRỤC SỐ" : "ONE SHARED NUMBER LINE"}</strong><span>${vi ? "mỗi hàng dùng cùng thang đo" : "every row uses the same scale"}</span></header><div>
      ${rulerRow("target", "TARGET", target)}
      ${rulerRow("current", "CURRENT", current)}
      ${rulerRow("closest", "CLOSEST", closest)}
    </div></section>
    <div class="cb270-layout">
      <section class="cb270-tree-card"><header><strong>${vi ? "ĐƯỜNG TÌM TRÊN BST" : "SEARCH PATH ON THE BST"}</strong><span>${vi ? "cam = current · xanh = closest" : "amber = current · green = closest"}</span></header><div id="cb270Tree" class="cb270-tree"></div></section>
      <aside class="cb270-side">
        <section class="cb270-metrics"><div><small>target</small><strong>${escapeHtml(numberText(target))}</strong></div><div><small>current</small><strong>${escapeHtml(numberText(current))}</strong></div><div><small>closest</small><strong>${escapeHtml(numberText(closest))}</strong></div></section>
        <section class="cb270-compare ${comparisonClass}"><header><strong>${vi ? "SO KHOẢNG CÁCH" : "COMPARE DISTANCES"}</strong><span>${escapeHtml(comparisonNote)}</span></header><div><article><small>|current − target|</small><b>${escapeHtml(numberText(currentDistance))}</b></article><i>${comparisonSymbol}</i><article><small>|closest − target|</small><b>${escapeHtml(numberText(closestDistance))}</b></article></div></section>
        <section class="cb270-direction ${view.direction || "idle"}"><small>${vi ? "QUYẾT ĐỊNH BST" : "BST DECISION"}</small><strong>${escapeHtml(directionFormula)} → ${escapeHtml(directionLabel)}</strong><span>${vi ? "node tiếp theo" : "next node"}: <b>${escapeHtml(nextLabel)}</b></span></section>
        <section class="cb270-path"><header><strong>${vi ? "ĐƯỜNG ĐÃ DUYỆT" : "VISITED PATH"}</strong><span>${visited.length} ${vi ? "node" : "node(s)"}</span></header><div>${pathHtml}</div></section>
      </aside>
    </div>
    <section class="cb270-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="cb270-result ${final ? "done" : ""}"><small>CLOSEST VALUE</small><strong>${final ? escapeHtml(numberText(view.answer)) : "…"}</strong><span>${final ? (vi ? "Chỉ duyệt một đường từ root xuống lá." : "Only one root-to-leaf path was visited.") : (vi ? "Tiếp tục so sánh và loại bỏ một nửa BST." : "Keep comparing while discarding one side of the BST.")}</span></footer>
  </section>`;
  renderTree({ tree: step.tree }, "cb270Tree");
}

function renderInorderSuccessor285View(step) {
  const view = step.inorderSuccessor285View || {};
  const vi = lang === "vi";
  const p = view.p || {};
  const current = view.current || null;
  const successor = view.successor || null;
  const next = view.next || null;
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const phaseIndex = Number(view.phaseIndex) || 0;
  const phaseLabels = vi
    ? ["Khởi tạo", "So sánh + đi nhánh", "Lưu ứng viên", "Trả kết quả"]
    : ["Initialize", "Compare + branch", "Save candidate", "Return answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const numberText = (value) => Number.isFinite(value) ? Number(value).toString() : "—";
  const comparison = view.comparison === "greater" ? ">" : view.comparison === "not-greater" ? "≤" : "?";
  const comparisonClass = view.comparison === "greater" ? "valid" : view.comparison === "not-greater" ? "invalid" : "idle";
  const directionText = view.direction === "left" ? (vi ? "TRÁI" : "LEFT") : view.direction === "right" ? (vi ? "PHẢI" : "RIGHT") : "—";
  const reasonText = view.direction === "left"
    ? (vi ? "node đủ lớn; đi trái để tìm số nhỏ hơn" : "node is large enough; go left for a smaller value")
    : view.direction === "right"
      ? (vi ? "node chưa lớn hơn p; chỉ nhánh phải còn hy vọng" : "node is not greater than p; only the right side can work")
      : (vi ? "Chờ so sánh node với p" : "Waiting to compare node with p");
  const pathHtml = visited.length
    ? visited.map((item, index) => {
        const role = item.value === p.value ? "p" : successor && item.id === successor.id ? "successor" : current && item.id === current.id ? "current" : "";
        return `<span class="${role}"><small>${index + 1}</small><b>${escapeHtml(numberText(item.value))}</b></span>`;
      }).join("<i>→</i>")
    : `<em>${vi ? "Chưa duyệt node nào" : "No node visited yet"}</em>`;
  const candidateChange = view.operation === "update-successor"
    ? `<div class="cb285-change"><span>${view.oldSuccessor === null ? "None" : escapeHtml(numberText(view.oldSuccessor))}</span><i>→</i><strong>${escapeHtml(numberText(successor && successor.value))}</strong></div>`
    : `<div class="cb285-change"><span>${vi ? "ứng viên hiện tại" : "current candidate"}</span><i>→</i><strong>${successor ? escapeHtml(numberText(successor.value)) : "None"}</strong></div>`;
  const final = Boolean(view.final);
  const answerText = final ? (view.answer === null ? "None" : numberText(view.answer)) : "…";
  const summary = vi
    ? `Bài 285: tìm successor của ${numberText(p.value)}, current ${numberText(current && current.value)}, ứng viên ${numberText(successor && successor.value)}.`
    : `Problem 285: successor of ${numberText(p.value)}, current ${numberText(current && current.value)}, candidate ${numberText(successor && successor.value)}.`;

  $("treeView").innerHTML = `<section class="cb285-viz phase-${escapeHtml(view.phase || "initialize")}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>BST · ONE SEARCH PATH · #285</small><strong>${vi ? "INORDER SUCCESSOR TRONG BST" : "INORDER SUCCESSOR IN BST"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="cb285-phases">${phases}</div>
    <section class="cb285-rule"><strong>SUCCESSOR</strong><span>${vi ? "giá trị nhỏ nhất thỏa" : "smallest value satisfying"}</span><code>successor.val &gt; p.val</code></section>
    <div class="cb285-layout">
      <section class="cb285-tree-card"><header><strong>${vi ? "ĐƯỜNG TÌM TRÊN BST" : "BST SEARCH PATH"}</strong><span>${vi ? "tím = p · cam = current · xanh = successor" : "purple = p · amber = current · green = successor"}</span></header><div id="cb285Tree" class="cb285-tree"></div></section>
      <aside class="cb285-side">
        <section class="cb285-values"><div><small>p.val</small><strong>${escapeHtml(numberText(p.value))}</strong></div><div><small>node.val</small><strong>${escapeHtml(numberText(current && current.value))}</strong></div><div><small>successor</small><strong>${successor ? escapeHtml(numberText(successor.value)) : "None"}</strong></div></section>
        <section class="cb285-compare ${comparisonClass}"><header><strong>${vi ? "CÂU HỎI DUY NHẤT" : "THE ONE QUESTION"}</strong><span>node.val &gt; p.val ?</span></header><div><b>${escapeHtml(numberText(current && current.value))}</b><i>${comparison}</i><b>${escapeHtml(numberText(p.value))}</b><em>${comparisonClass === "valid" ? "TRUE" : comparisonClass === "invalid" ? "FALSE" : "—"}</em></div></section>
        <section class="cb285-decision ${view.direction || "idle"}"><small>${vi ? "QUYẾT ĐỊNH" : "DECISION"}</small><strong>${escapeHtml(directionText)} → ${next ? escapeHtml(numberText(next.value)) : view.direction ? "None" : "—"}</strong><span>${escapeHtml(reasonText)}</span></section>
        <section class="cb285-candidate ${view.operation === "update-successor" ? "updated" : ""}"><small>${vi ? "ỨNG VIÊN TỐT NHẤT" : "BEST CANDIDATE"}</small>${candidateChange}<p>${successor ? (vi ? `${successor.value} > ${p.value}; tiếp tục tìm số nhỏ hơn nếu có.` : `${successor.value} > ${p.value}; keep looking for a smaller valid value.`) : (vi ? "Chưa gặp node nào lớn hơn p." : "No node greater than p has been found.")}</p></section>
        <section class="cb285-path"><header><strong>${vi ? "ĐƯỜNG ĐÃ ĐI" : "VISITED PATH"}</strong><span>${visited.length} ${vi ? "node" : "node(s)"}</span></header><div>${pathHtml}</div></section>
      </aside>
    </div>
    <section class="cb285-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="cb285-result ${final ? "done" : ""} ${final && view.answer === null ? "empty" : ""}"><small>SUCCESSOR(${escapeHtml(numberText(p.value))})</small><strong>${escapeHtml(answerText)}</strong><span>${final ? view.answer === null ? (vi ? "p là node lớn nhất nên không có successor." : "p is the largest node, so no successor exists.") : (vi ? "Giá trị nhỏ nhất lớn hơn p." : "The smallest value greater than p.") : (vi ? "Giữ ứng viên rồi tiếp tục thu hẹp bằng tính chất BST." : "Keep a candidate and narrow the search using BST order.")}</span></footer>
  </section>`;
  renderTree({ tree: step.tree }, "cb285Tree");
}

function renderInorderSuccessor510View(step) {
  const view = step.inorderSuccessor510View || {};
  const vi = lang === "vi";
  const p = view.p || {};
  const current = view.current || null;
  const parent = view.parent || null;
  const successor = view.successor || null;
  const next = view.next || null;
  const visited = Array.isArray(view.visited) ? view.visited : [];
  const phaseIndex = Number(view.phaseIndex) || 0;
  const numberText = value => value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value).toString() : "—";
  const phaseLabels = vi
    ? ["Đặt p", "Subtree phải", "Đi lên parent", "Trả kết quả"]
    : ["Set p", "Right subtree", "Climb parents", "Return answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const relation = view.relation === "right" ? (vi ? "CON PHẢI" : "RIGHT CHILD") : view.relation === "left" ? (vi ? "CON TRÁI" : "LEFT CHILD") : "—";
  const pathHtml = visited.length
    ? visited.map((item, index) => {
        const role = item.id === p.id ? "p" : successor && item.id === successor.id ? "successor" : current && item.id === current.id ? "current" : parent && item.id === parent.id ? "parent" : "";
        return `<span class="${role}"><small>${index + 1}</small><b>${escapeHtml(numberText(item.value))}</b></span>`;
      }).join("<i>→</i>")
    : `<em>${vi ? "Chưa đi qua node nào" : "No node visited yet"}</em>`;
  const final = Boolean(view.final);
  const answerText = final ? (view.answer === null ? "None" : numberText(view.answer)) : "…";
  const branchText = view.phase === "right-subtree"
    ? (vi ? "Có right subtree → lấy node trái nhất" : "Right subtree exists → take its leftmost node")
    : view.phase === "climb"
      ? (vi ? "Không có right subtree → đi lên bằng parent" : "No right subtree → climb with parent pointers")
      : (vi ? "Chọn nhánh theo cấu trúc của p" : "Choose a branch from p's structure");
  const summary = vi
    ? `Bài 510: successor của ${numberText(p.value)}, current ${numberText(current && current.value)}, parent ${numberText(parent && parent.value)}.`
    : `Problem 510: successor of ${numberText(p.value)}, current ${numberText(current && current.value)}, parent ${numberText(parent && parent.value)}.`;

  $("treeView").innerHTML = `<section class="is510-viz phase-${escapeHtml(view.phase || "target")}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>BST · PARENT POINTERS · #510</small><strong>${vi ? "INORDER SUCCESSOR TRONG BST II" : "INORDER SUCCESSOR IN BST II"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="is510-phases">${phases}</div>
    <section class="is510-rule"><strong>THE TWO CASES</strong><span>${escapeHtml(branchText)}</span><code>right subtree ? leftmost : climb parent</code></section>
    <div class="is510-layout">
      <section class="is510-tree-card"><header><strong>${vi ? "CÂY + LIÊN KẾT PARENT" : "TREE + PARENT LINKS"}</strong><span>${vi ? "tím = p · cam = current · xanh = successor · xanh dương = parent" : "purple = p · amber = current · green = successor · blue = parent"}</span></header><div id="is510Tree" class="is510-tree"></div></section>
      <aside class="is510-side">
        <section class="is510-values"><div><small>p</small><strong>${escapeHtml(numberText(p.value))}</strong></div><div><small>current</small><strong>${escapeHtml(numberText(current && current.value))}</strong></div><div><small>parent</small><strong>${escapeHtml(numberText(parent && parent.value))}</strong></div><div><small>successor</small><strong>${successor ? escapeHtml(numberText(successor.value)) : "None"}</strong></div></section>
        <section class="is510-pointer"><small>${vi ? "CON TRỎ ĐANG XÉT" : "POINTER STATE"}</small><div><b>${current ? escapeHtml(numberText(current.value)) : "None"}</b><i>→</i><b>${next ? escapeHtml(numberText(next.value)) : "None"}</b></div><span>${escapeHtml(relation)}</span></section>
        <section class="is510-cases"><div class="${view.phase === "right-subtree" ? "active" : ""}"><b>1</b><strong>${vi ? "Có nhánh phải" : "Right subtree"}</strong><span>${vi ? "đi phải rồi đi trái hết mức" : "go right, then all the way left"}</span></div><div class="${view.phase === "climb" ? "active" : ""}"><b>2</b><strong>${vi ? "Không có nhánh phải" : "No right subtree"}</strong><span>${vi ? "đi lên khi còn là con phải" : "climb while a right child"}</span></div></section>
        <section class="is510-path"><header><strong>${vi ? "ĐƯỜNG ĐÃ ĐI" : "VISITED / CLIMBED"}</strong><span>${visited.length} ${vi ? "node" : "node(s)"}</span></header><div>${pathHtml}</div></section>
      </aside>
    </div>
    <section class="is510-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="is510-result ${final ? "done" : ""} ${final && view.answer === null ? "empty" : ""}"><small>SUCCESSOR(${escapeHtml(numberText(p.value))})</small><strong>${escapeHtml(answerText)}</strong><span>${final ? view.answer === null ? (vi ? "p là node lớn nhất nên không có successor." : "p is the largest node, so no successor exists.") : (vi ? "Node kế tiếp trong inorder." : "The next node in inorder.") : (vi ? "Theo dõi current, parent và hai trường hợp của thuật toán." : "Track current, parent, and the algorithm's two cases.")}</span></footer>
  </section>`;
  renderTree({ tree: step.tree }, "is510Tree");
}

function renderTreeFamilyView(step, id, key, titleEn, titleVi, treeLabelEn, treeLabelVi) {
  const view = step[key] || {};
  const vi = lang === "vi";
  const prefix = `bt${id}`;
  const current = view.current || null;
  const target = view.target || null;
  const fmt = value => value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value).toString() : "—";
  const phases = id === 545 ? (vi ? ["Root", "Biên trái", "Lá", "Biên phải"] : ["Root", "Left boundary", "Leaves", "Right boundary"]) : id === 549 ? (vi ? ["Khởi tạo", "Kết hợp DP", "Best", "Trả kết quả"] : ["Initialize", "Combine DP", "Best", "Return"]) : (vi ? ["Target", "BFS", "Lá gần nhất", "Trả kết quả"] : ["Target", "BFS", "Closest leaf", "Return"]);
  const phaseIndex = Number(view.phaseIndex) || 0;
  const phaseHtml = phases.map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const values = id === 545 ? (Array.isArray(view.boundary) ? view.boundary : []) : id === 549 ? [`inc ${fmt(view.inc)}`, `dec ${fmt(view.dec)}`, `best ${fmt(view.best)}`] : (Array.isArray(view.queue) ? view.queue.map(item => item.value) : []);
  const listHtml = values.length ? values.map((value, index) => `<span><small>${index + 1}</small><b>${escapeHtml(fmt(value))}</b></span>`).join("<i>→</i>") : `<em>${vi ? "Chưa có phần tử" : "No items yet"}</em>`;
  const currentText = current ? fmt(current.value) : "—";
  const targetText = target ? fmt(target.value) : "—";
  const result = view.final ? (id === 545 ? `[${(view.boundary || []).join(", ")}]` : fmt(view.answer ?? view.best)) : "…";
  const summary = id === 545 ? (vi ? "Boundary được ghép theo bốn phần." : "Boundary is assembled from four parts.") : id === 549 ? (vi ? "Mỗi node trả về độ dài tăng và giảm." : "Each node returns increasing and decreasing lengths.") : (vi ? "BFS từ target trên các cạnh parent và child." : "BFS from the target over parent and child edges.");
  $("treeView").innerHTML = `<section class="${prefix}-viz tree-family-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>TREE · #${id}</small><strong>${vi ? titleVi : titleEn}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="${prefix}-phases tree-family-phases">${phaseHtml}</div>
    <section class="${prefix}-rule tree-family-rule"><strong>${id === 545 ? "BOUNDARY" : id === 549 ? "TREE DP" : "BFS"}</strong><span>${escapeHtml(summary)}</span><code>${id === 545 ? "root + left + leaves + reverse(right)" : id === 549 ? "best = inc + dec − 1" : "first dequeued leaf"}</code></section>
    <div class="${prefix}-layout tree-family-layout"><section class="${prefix}-tree tree-family-tree"><header><strong>${vi ? treeLabelVi : treeLabelEn}</strong><span>${current ? `current = ${escapeHtml(currentText)}` : target ? `target = ${escapeHtml(targetText)}` : ""}</span></header><div id="${prefix}Tree"></div></section>
      <aside class="${prefix}-side tree-family-side"><section class="${prefix}-values tree-family-values"><div><small>${id === 742 ? "target" : "current"}</small><strong>${escapeHtml(id === 742 ? targetText : currentText)}</strong></div><div><small>${id === 549 ? "inc" : id === 545 ? "items" : "queue"}</small><strong>${escapeHtml(id === 549 ? fmt(view.inc) : String(values.length))}</strong></div><div><small>${id === 549 ? "dec" : "answer"}</small><strong>${escapeHtml(id === 549 ? fmt(view.dec) : result)}</strong></div></section>
      <section class="${prefix}-list tree-family-list"><header><strong>${id === 545 ? (vi ? "BOUNDARY ĐANG GHÉP" : "BOUNDARY SO FAR") : id === 549 ? (vi ? "TRẠNG THÁI DP" : "DP STATE") : (vi ? "QUEUE BFS" : "BFS QUEUE")}</strong><span>${values.length} ${vi ? "mục" : "item(s)"}</span></header><div>${listHtml}</div></section></aside></div>
    <section class="${prefix}-action tree-family-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="${prefix}-result tree-family-result ${view.final ? "done" : ""}"><small>ANSWER</small><strong>${escapeHtml(result)}</strong><span>${view.final ? (vi ? "Đã hoàn tất." : "Computation complete.") : (vi ? "Theo dõi state hiện tại qua từng bước." : "Follow the current state one step at a time.")}</span></footer>
  </section>`;
  renderTree({ tree: step.tree }, `${prefix}Tree`);
}

function renderBoundary545View(step) { renderTreeFamilyView(step, 545, "boundary545View", "Boundary of Binary Tree", "BOUNDARY CỦA CÂY NHỊ PHÂN", "BOUNDARY TREE", "CÂY BIÊN"); }
function renderConsecutive549View(step) { renderTreeFamilyView(step, 549, "consecutive549View", "Longest Consecutive Sequence II", "CHUỖI LIÊN TIẾP DÀI NHẤT II", "POSTORDER TREE", "CÂY POSTORDER"); }
function renderClosestLeaf742View(step) { renderTreeFamilyView(step, 742, "closestLeaf742View", "Closest Leaf in a Binary Tree", "LÁ GẦN NHẤT TRONG CÂY", "BFS TREE", "CÂY BFS"); }

function renderClosestBst272View(step) {
  const view = step.closestBst272View || {};
  const vi = lang === "vi";
  const values = Array.isArray(view.values) ? view.values : [];
  const removed = new Set(Array.isArray(view.removedIndices) ? view.removedIndices : []);
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const target = Number(view.target);
  const k = Number(view.k) || 0;
  const left = Number.isInteger(view.left) ? view.left : null;
  const right = Number.isInteger(view.right) ? view.right : null;
  const phaseIndex = Number(view.phaseIndex) || 0;
  const numberText = (value) => Number.isFinite(value) ? Number(value.toFixed(6)).toString() : "—";
  const phaseLabels = vi
    ? ["Inorder BST", "Dãy tăng dần", "Co cửa sổ", "Kết quả"]
    : ["Inorder BST", "Sorted values", "Shrink window", "Answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const valueCells = values.length
    ? values.map((value, index) => {
        const outside = removed.has(index) || (left !== null && right !== null && (index < left || index > right));
        const markers = [
          index === left ? `<i class="left">L</i>` : "",
          index === right ? `<i class="right">R</i>` : "",
        ].join("");
        const classes = [
          "cb272-cell",
          outside ? "removed" : "candidate",
          index === left ? "left" : "",
          index === right ? "right" : "",
          index === view.removeIndex ? "just-removed" : "",
          view.current && value === view.current.value ? "current" : "",
        ].filter(Boolean).join(" ");
        return `<div class="${classes}"><span>${markers}</span><small>index ${index}</small><strong>${escapeHtml(numberText(value))}</strong><em>|Δ| ${escapeHtml(numberText(Math.abs(value - target)))}</em></div>`;
      }).join("")
    : `<p>${vi ? "Mảng còn rỗng — inorder chưa thêm node nào." : "The array is empty—inorder has not appended a node yet."}</p>`;

  const stackHtml = stack.length
    ? stack.map((item, index) => `<span class="${view.current && item.id === view.current.id ? "current" : ""}"><small>${index === stack.length - 1 ? "TOP" : `#${index + 1}`}</small><b>${escapeHtml(numberText(item.value))}</b></span>`).join("<i>→</i>")
    : `<em>${vi ? "Stack rỗng" : "Empty stack"}</em>`;
  const hasEnds = left !== null && right !== null && Number.isFinite(view.leftValue) && Number.isFinite(view.rightValue);
  const comparisonSymbol = hasEnds
    ? view.leftDistance > view.rightDistance ? ">" : view.leftDistance < view.rightDistance ? "<" : "="
    : "?";
  const decisionText = !hasEnds
    ? (vi ? "Chờ khởi tạo L và R" : "Waiting for L and R")
    : view.removeSide === "left"
      ? (vi ? "Đầu trái xa hơn → bỏ L" : "Left is farther → discard L")
      : view.removeSide === "right"
        ? view.leftDistance === view.rightDistance
          ? (vi ? "Bằng nhau → bỏ R, giữ số nhỏ hơn" : "Tie → discard R, keep the smaller value")
          : (vi ? "Đầu phải xa hơn → bỏ R" : "Right is farther → discard R")
        : (vi ? "So hai khoảng cách ở hai đầu" : "Compare the two endpoint distances");
  const windowSize = Number(view.windowSize) || 0;
  const windowReady = left !== null && right !== null && windowSize === k;
  const currentText = view.current ? numberText(view.current.value) : "—";
  const answerText = view.final && Array.isArray(view.answer) ? `[${view.answer.map(numberText).join(", ")}]` : "…";
  const summary = vi
    ? `Bài 272: target ${numberText(target)}, cần ${k} giá trị, cửa sổ hiện có ${windowSize}.`
    : `Problem 272: target ${numberText(target)}, need ${k} values, current window has ${windowSize}.`;

  $("treeView").innerHTML = `<section class="cb272-viz phase-${escapeHtml(view.phase || "inorder")}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>BST · INORDER + TWO POINTERS · #272</small><strong>${vi ? "K GIÁ TRỊ GẦN TARGET NHẤT" : "K CLOSEST VALUES IN A BST"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="cb272-phases">${phases}</div>
    <section class="cb272-rule"><strong>${vi ? "Ý TƯỞNG CHÍNH" : "CORE IDEA"}</strong><span>BST <b>inorder</b> → ${vi ? "dãy tăng dần" : "sorted values"}</span><span>${vi ? "mỗi vòng loại đầu xa target hơn" : "each loop discards the farther endpoint"}</span></section>
    <div class="cb272-layout">
      <section class="cb272-tree-card"><header><strong>${vi ? "1 · DUYỆT INORDER" : "1 · INORDER TRAVERSAL"}</strong><span>${vi ? "xanh = đã thêm · cam = node hiện tại" : "green = appended · amber = current"}</span></header><div id="cb272Tree" class="cb272-tree"></div><footer><small>CALL STACK</small><div>${stackHtml}</div><span>current = <b>${escapeHtml(currentText)}</b></span></footer></section>
      <aside class="cb272-side">
        <section class="cb272-target"><small>TARGET</small><strong>${escapeHtml(numberText(target))}</strong><span>k = <b>${k}</b></span></section>
        <section class="cb272-compare ${view.removeSide ? `remove-${view.removeSide}` : "idle"}"><header><strong>${vi ? "2 · SO HAI ĐẦU" : "2 · COMPARE ENDPOINTS"}</strong><span>${escapeHtml(decisionText)}</span></header><div><article><small>L · ${escapeHtml(numberText(view.leftValue))}</small><b>${escapeHtml(numberText(view.leftDistance))}</b><em>|L − target|</em></article><i>${comparisonSymbol}</i><article><small>R · ${escapeHtml(numberText(view.rightValue))}</small><b>${escapeHtml(numberText(view.rightDistance))}</b><em>|R − target|</em></article></div></section>
        <section class="cb272-window ${windowReady ? "ready" : ""}"><header><strong>${vi ? "CỬA SỔ ỨNG VIÊN" : "CANDIDATE WINDOW"}</strong><span>${windowSize} / k=${k}</span></header><div><b>L = ${left === null ? "—" : left}</b><i>values[L : R + 1]</i><b>R = ${right === null ? "—" : right}</b></div><p>${windowReady ? (vi ? "Đủ k phần tử — dừng co cửa sổ." : "Exactly k values—stop shrinking.") : (vi ? "Còn hơn k phần tử thì tiếp tục loại một đầu." : "Keep removing one endpoint while more than k remain.")}</p></section>
      </aside>
    </div>
    <section class="cb272-values"><header><strong>${vi ? "DÃY TĂNG DẦN + CỬA SỔ [L, R]" : "SORTED VALUES + WINDOW [L, R]"}</strong><span>${vi ? "mờ/gạch = đã loại · |Δ| = khoảng cách tới target" : "dimmed/struck = removed · |Δ| = distance to target"}</span></header><div>${valueCells}</div></section>
    <section class="cb272-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="cb272-result ${view.final ? "done" : ""}"><small>ANSWER</small><strong>${escapeHtml(answerText)}</strong><span>${view.final ? (vi ? `${k} giá trị còn lại gần target nhất.` : `The remaining ${k} values are closest to target.`) : (vi ? "Giữ lại đúng k ô không bị loại." : "Keep exactly k cells that are not discarded.")}</span></footer>
  </section>`;
  renderTree({ tree: step.tree }, "cb272Tree");
}

function renderCircleRectangle1401View(step) {
  const view = step.circleRectangle1401View || {};
  // The two approaches answer the same question from opposite directions, so
  // they get separate pictures rather than one picture with swapped labels.
  if (view.approach === 2) {
    renderCircleRectangle1401RegionView(step);
    return;
  }
  renderCircleRectangle1401ClampView(step);
}

// Shared coordinate mapping. One scale for both axes, otherwise every circle
// would render as an ellipse.
function cr1401Plane(worldMinX, worldMaxX, worldMinY, worldMaxY) {
  const spanX = Math.max(worldMaxX - worldMinX, 1e-6) * 1.2;
  const spanY = Math.max(worldMaxY - worldMinY, 1e-6) * 1.2;
  const plot = { left: 54, top: 18, width: 552, height: 248 };
  const scale = Math.min(plot.width / spanX, plot.height / spanY);
  const midX = (worldMinX + worldMaxX) / 2;
  const midY = (worldMinY + worldMaxY) / 2;
  const mapX = (x) => plot.left + plot.width / 2 + (x - midX) * scale;
  const mapY = (y) => plot.top + plot.height / 2 - (y - midY) * scale;
  return {
    plot,
    scale,
    mapX,
    mapY,
    fx: (x) => mapX(x).toFixed(2),
    fy: (y) => mapY(y).toFixed(2),
    frame: `<rect class="cr1401-plane-bg" x="${plot.left}" y="${plot.top}" width="${plot.width}" height="${plot.height}" rx="5"/><line class="cr1401-axis" x1="${plot.left}" y1="${plot.top + plot.height}" x2="${plot.left + plot.width}" y2="${plot.top + plot.height}"/><line class="cr1401-axis" x1="${plot.left}" y1="${plot.top}" x2="${plot.left}" y2="${plot.top + plot.height}"/><text class="cr1401-axis-name" x="${plot.left + plot.width + 8}" y="${plot.top + plot.height + 4}">x</text><text class="cr1401-axis-name" x="${plot.left - 4}" y="${plot.top - 6}">y</text>`,
  };
}

// Renders the debugger-style locals strip: one cell per named variable, tagged
// with the source line that assigns it.
function cr1401Locals(rows, currentLine, vi) {
  const cells = rows
    .map((row) => {
      const assigned = row.value !== null && row.value !== undefined;
      const text = !assigned
        ? "?"
        : typeof row.value === "boolean"
          ? (row.value ? "True" : "False")
          : String(row.value);
      const active = row.line === currentLine;
      return `<span class="cr1401-local ${assigned ? "set" : "pending"}${active ? " active" : ""}"><small>L${row.line}</small><code>${row.name}</code><b>${text}</b></span>`;
    })
    .join("");
  return `<section class="cr1401-locals"><header><strong>${vi ? "BIẾN CỤC BỘ THEO TỪNG DÒNG" : "LOCALS BY SOURCE LINE"}</strong><span>${vi ? "mờ = dòng chưa chạy · viền = dòng đang chạy" : "dimmed = line not run yet · outlined = current line"}</span></header><div>${cells}</div></section>`;
}

// ── Approach 1: clamp the center into the rectangle, measure one distance ──
function renderCircleRectangle1401ClampView(step) {
  const view = step.circleRectangle1401View || {};
  const vi = lang === "vi";
  const radius = Number.isFinite(view.radius) ? Number(view.radius) : 1;
  const xCenter = Number.isFinite(view.xCenter) ? Number(view.xCenter) : 0;
  const yCenter = Number.isFinite(view.yCenter) ? Number(view.yCenter) : 0;
  const rect = Array.isArray(view.rect) && view.rect.length === 4 ? view.rect.map(Number) : [0, 0, 1, 1];
  const [x1, y1, x2, y2] = rect;
  const anchorX = Number.isFinite(view.anchorX) ? Number(view.anchorX) : Math.max(x1, Math.min(xCenter, x2));
  const anchorY = Number.isFinite(view.anchorY) ? Number(view.anchorY) : Math.max(y1, Math.min(yCenter, y2));
  // radius_squared is assigned by its own source line, so it stays unknown until then.
  const radiusSq = Number.isFinite(view.radiusSq) ? Number(view.radiusSq) : null;
  const num = (value) => (Number.isFinite(value) ? String(value) : "?");
  // A negative base needs parentheses: "-1²" would read as -(1²).
  const sq = (value) => (Number.isFinite(value) ? (value < 0 ? `(${value})²` : `${value}²`) : "?²");
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const currentLine = (step.codeLines || [])[0];

  const labels = vi
    ? ["Circle & rectangle", "Kẹp trục X", "Kẹp trục Y", "Khoảng lệch dx, dy", "So với r²"]
    : ["Circle & rectangle", "Clamp X", "Clamp Y", "Gaps dx, dy", "Compare with r²"];
  const phases = labels
    .map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`)
    .join("");

  const g = cr1401Plane(
    Math.min(xCenter - radius, x1),
    Math.max(xCenter + radius, x2),
    Math.min(yCenter - radius, y1),
    Math.max(yCenter + radius, y2),
  );
  const { plot, scale, mapX, mapY, fx, fy } = g;

  const rectLeft = mapX(x1);
  const rectTop = mapY(y2);
  const rectWidth = mapX(x2) - rectLeft;
  const rectHeight = mapY(y1) - rectTop;
  const rectSvg = `<g class="cr1401-rect"><rect x="${rectLeft.toFixed(2)}" y="${rectTop.toFixed(2)}" width="${rectWidth.toFixed(2)}" height="${rectHeight.toFixed(2)}" rx="3"/><text class="corner start" x="${(rectLeft + 5).toFixed(2)}" y="${(rectTop + rectHeight - 6).toFixed(2)}">(${x1}, ${y1})</text><text class="corner end" x="${(rectLeft + rectWidth - 5).toFixed(2)}" y="${(rectTop + 13).toFixed(2)}">(${x2}, ${y2})</text></g>`;

  const centerSvgX = mapX(xCenter);
  const centerSvgY = mapY(yCenter);
  const radiusPx = radius * scale;
  const radiusTipX = centerSvgX - radiusPx * 0.7071;
  const radiusTipY = centerSvgY - radiusPx * 0.7071;
  const circleSvg = `<g class="cr1401-circle"><circle cx="${centerSvgX.toFixed(2)}" cy="${centerSvgY.toFixed(2)}" r="${radiusPx.toFixed(2)}"/><line class="cr1401-radius" x1="${centerSvgX.toFixed(2)}" y1="${centerSvgY.toFixed(2)}" x2="${radiusTipX.toFixed(2)}" y2="${radiusTipY.toFixed(2)}"/><text class="cr1401-radius-label" x="${((centerSvgX + radiusTipX) / 2 - 4).toFixed(2)}" y="${((centerSvgY + radiusTipY) / 2 - 5).toFixed(2)}">r = ${radius}</text><circle class="cr1401-center-dot" cx="${centerSvgX.toFixed(2)}" cy="${centerSvgY.toFixed(2)}" r="3.5"/><text class="cr1401-center-label" x="${(centerSvgX + 7).toFixed(2)}" y="${(centerSvgY - 7).toFixed(2)}">C (${xCenter}, ${yCenter})</text></g>`;

  const knownX = Number.isFinite(view.closestX);
  const knownY = Number.isFinite(view.closestY);
  const guides = [];
  if (knownX) {
    guides.push(`<line class="cr1401-guide x" x1="${fx(anchorX)}" y1="${plot.top}" x2="${fx(anchorX)}" y2="${plot.top + plot.height}"/><text class="cr1401-guide-label" x="${fx(anchorX)}" y="${plot.top + plot.height + 14}">closest_x = ${anchorX}</text>`);
  }
  if (knownY) {
    guides.push(`<line class="cr1401-guide y" x1="${plot.left}" y1="${fy(anchorY)}" x2="${plot.left + plot.width}" y2="${fy(anchorY)}"/><text class="cr1401-guide-label y" x="${plot.left - 6}" y="${(mapY(anchorY) + 4).toFixed(2)}">${anchorY}</text>`);
  }

  let anchorSvg = "";
  if (knownX && knownY) {
    const inside = Boolean(view.answer);
    const legs = [`<polyline class="cr1401-leg" points="${fx(xCenter)},${fy(yCenter)} ${fx(anchorX)},${fy(yCenter)} ${fx(anchorX)},${fy(anchorY)}"/>`];
    if (xCenter !== anchorX) {
      legs.push(`<text class="cr1401-leg-label" x="${((mapX(xCenter) + mapX(anchorX)) / 2).toFixed(2)}" y="${(mapY(yCenter) - 6).toFixed(2)}">|dx| = ${Math.abs(xCenter - anchorX)}</text>`);
    }
    if (yCenter !== anchorY) {
      legs.push(`<text class="cr1401-leg-label y" x="${(mapX(anchorX) + 6).toFixed(2)}" y="${((mapY(yCenter) + mapY(anchorY)) / 2).toFixed(2)}">|dy| = ${Math.abs(yCenter - anchorY)}</text>`);
    }
    anchorSvg = `<g class="cr1401-anchor ${view.final ? (inside ? "inside" : "outside") : ""}">${legs.join("")}<line class="cr1401-hypot" x1="${fx(xCenter)}" y1="${fy(yCenter)}" x2="${fx(anchorX)}" y2="${fy(anchorY)}"/><circle cx="${fx(anchorX)}" cy="${fy(anchorY)}" r="4.5"/><text x="${(mapX(anchorX) + 8).toFixed(2)}" y="${(mapY(anchorY) + 14).toFixed(2)}">(${anchorX}, ${anchorY})</text></g>`;
  }

  const svgSummary = vi
    ? `Circle tâm (${xCenter}, ${yCenter}) bán kính ${radius} và rectangle từ (${x1}, ${y1}) tới (${x2}, ${y2}), kèm điểm gần nhất.`
    : `A circle centered at (${xCenter}, ${yCenter}) with radius ${radius} and a rectangle from (${x1}, ${y1}) to (${x2}, ${y2}), with the closest point.`;
  const plane = `<svg viewBox="0 0 660 300" role="img" aria-label="${escapeHtml(svgSummary)}">${g.frame}${rectSvg}${circleSvg}${guides.join("")}${anchorSvg}</svg>`;

  const axisCard = (axis, componentValue, lowBound, highBound, centerValue, inner, clamped) => {
    const known = Number.isFinite(componentValue);
    const zero = known && componentValue === 0;
    const state = !known ? "pending" : zero ? "aligned" : "offset";
    const formula = `${centerValue} − ${num(clamped)}`;
    // The intermediate that the previous source line produced, so the
    // step-through makes the two-sided clamp explicit.
    const intermediate = `${axis === "X" ? "inner_x" : "inner_y"} = ${num(inner)} → ${axis === "X" ? "closest_x" : "closest_y"} = ${num(clamped)}`;
    const statusText = !known
      ? (vi ? "đang tính" : "computing")
      : zero
        ? (vi ? "TRONG SLAB · 0" : "INSIDE SLAB · 0")
        : (vi ? `LỆCH ${Math.abs(componentValue)}` : `OFF BY ${Math.abs(componentValue)}`);
    return `<article class="cr1401-axis-card ${state}"><header><strong>${axis === "X" ? "dx" : "dy"}</strong><span>${escapeHtml(statusText)}</span></header><code>${escapeHtml(formula)}</code><em class="cr1401-axis-inter">${escapeHtml(intermediate)}</em><div><small>slab [${lowBound}, ${highBound}]</small><b>${num(componentValue)}</b></div><footer><span>${escapeHtml(vi ? "khoảng lệch" : "gap")} ${axis}</span><code>${axis === "X" ? "dx" : "dy"}² = ${known ? componentValue * componentValue : "?"}</code></footer></article>`;
  };

  const locals = cr1401Locals([
    // Line numbers are 1-based, matching row.dataset.line in renderCode.
    { name: "inner_x", line: 3, value: view.innerX },
    { name: "closest_x", line: 4, value: view.closestX },
    { name: "inner_y", line: 5, value: view.innerY },
    { name: "closest_y", line: 6, value: view.closestY },
    { name: "dx", line: 7, value: view.dx },
    { name: "dy", line: 8, value: view.dy },
    { name: "dist_squared", line: 9, value: view.distSq },
    { name: "radius_squared", line: 10, value: view.radiusSq },
  ], currentLine, vi);

  // Both sides must have been assigned before the comparison can be shown.
  const compareReady = Number.isFinite(view.distSq) && Number.isFinite(radiusSq);
  const compareState = !compareReady ? "pending" : view.distSq <= radiusSq ? "pass" : "fail";
  const compareSymbol = !compareReady ? "?" : view.distSq <= radiusSq ? "≤" : ">";
  const compare = `<section class="cr1401-compare ${compareState}"><header><strong>${vi ? "SO SÁNH BÌNH PHƯƠNG" : "SQUARED COMPARISON"}</strong><span>${escapeHtml(vi ? "không cần sqrt" : "no sqrt needed")}</span></header><div><article><small>dist_squared</small><b>${num(view.distSq)}</b></article><i>${compareSymbol}</i><article><small>radius_squared</small><b>${num(radiusSq)}</b></article></div><footer>${escapeHtml(vi ? "Khoảng cách ngắn nhất từ tâm tới rectangle phải không lớn hơn bán kính." : "The shortest distance from the center to the rectangle must not exceed the radius.")}</footer></section>`;

  const formulas = {
    inputs: `radius=${radius}, center=(${xCenter}, ${yCenter}), rect=[${rect.join(", ")}]`,
    "inner-x": `inner_x = min(${xCenter}, ${x2}) = ${num(view.innerX)}`,
    "closest-x": `closest_x = max(${x1}, ${num(view.innerX)}) = ${num(view.closestX)}`,
    "inner-y": `inner_y = min(${yCenter}, ${y2}) = ${num(view.innerY)}`,
    "closest-y": `closest_y = max(${y1}, ${num(view.innerY)}) = ${num(view.closestY)}`,
    dx: `dx = ${xCenter} - ${num(view.closestX)} = ${num(view.dx)}`,
    dy: `dy = ${yCenter} - ${num(view.closestY)} = ${num(view.dy)}`,
    "dist-squared": `dist_squared = ${sq(view.dx)} + ${sq(view.dy)} = ${num(view.distSq)}`,
    "radius-squared": `radius_squared = ${radius}² = ${num(radiusSq)}`,
    return: `${num(view.distSq)} <= ${num(radiusSq)} → ${view.answer === true ? "True" : view.answer === false ? "False" : "?"}`,
  };

  const final = Boolean(view.final);
  const answerLabel = view.answer === true ? "TRUE" : view.answer === false ? "FALSE" : "…";
  const summary = vi
    ? "Bài 1401 cách 1: kẹp tâm circle vào rectangle để tìm điểm gần nhất, rồi so bình phương khoảng cách với r²."
    : "Problem 1401 approach 1: clamp the circle center into the rectangle to find the closest point, then compare the squared distance with r².";

  $("treeView").innerHTML = `<section class="cr1401-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>GEOMETRY · CLAMP TO RECTANGLE · #1401</small><strong>CIRCLE AND RECTANGLE OVERLAPPING · APPROACH 1</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="cr1401-phases">${phases}</div>
    <section class="cr1401-rule"><span><b>1</b><code>closest_x = max(x1, min(xc, x2))</code></span><i>${vi ? "RỒI" : "THEN"}</i><span><b>2</b><code>dist_squared &le; radius_squared</code></span></section>
    <section class="cr1401-plane"><header><strong>${vi ? "MẶT PHẲNG TỌA ĐỘ" : "COORDINATE PLANE"}</strong><span><i>circle</i> · <em>rectangle</em> · <b>${vi ? "điểm gần nhất" : "closest point"}</b></span></header>${plane}</section>
    ${locals}
    <section class="cr1401-axis-checks">${axisCard("X", view.dx, x1, x2, xCenter, view.innerX, view.closestX)}${axisCard("Y", view.dy, y1, y2, yCenter, view.innerY, view.closestY)}</section>
    ${compare}
    <section class="cr1401-operation"><header><strong>${vi ? "DÒNG ĐANG CHẠY" : "EXECUTING"}</strong><code>${escapeHtml(formulas[view.operation] || view.operation || "—")}</code></header><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="cr1401-action"><small>${vi ? "DÒNG" : "LINE"} ${currentLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong></section>
    <footer class="cr1401-result ${final ? (view.answer ? "yes" : "no") : ""}"><small>SHARE A POINT?</small><strong>${answerLabel}</strong><span>${final ? (view.answer ? (vi ? "điểm gần nhất của rectangle nằm trong circle" : "the rectangle's closest point lies inside the circle") : (vi ? "cả rectangle nằm ngoài circle" : "the whole rectangle stays outside the circle")) : (vi ? "cần dist_squared ≤ radius_squared" : "requires dist_squared ≤ radius_squared")}</span></footer>
  </section>`;
}

// ── Approach 2: grow the rectangle by r, shrink the circle to its center ──
// The inflated shape is a rounded rectangle, decomposed into a wide slab, a
// tall slab, and four corner discs. No closest point, no single distance.
function renderCircleRectangle1401RegionView(step) {
  const view = step.circleRectangle1401View || {};
  const vi = lang === "vi";
  const radius = Number.isFinite(view.radius) ? Number(view.radius) : 1;
  const xCenter = Number.isFinite(view.xCenter) ? Number(view.xCenter) : 0;
  const yCenter = Number.isFinite(view.yCenter) ? Number(view.yCenter) : 0;
  const rect = Array.isArray(view.rect) && view.rect.length === 4 ? view.rect.map(Number) : [0, 0, 1, 1];
  const [x1, y1, x2, y2] = rect;
  const radiusSq = Number.isFinite(view.radiusSq) ? Number(view.radiusSq) : null;
  const num = (value) => (Number.isFinite(value) ? String(value) : "?");
  const sq = (value) => (Number.isFinite(value) ? (value < 0 ? `(${value})²` : `${value}²`) : "?²");
  const bool = (value) => (value === true ? "True" : value === false ? "False" : "?");
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const currentLine = (step.codeLines || [])[0];
  const operation = view.operation || "";
  const cornerIndex = Number.isInteger(view.cornerIndex) ? view.cornerIndex : -1;
  const cornerResults = Array.isArray(view.cornerResults) ? view.cornerResults : [null, null, null, null];
  const corners = [[x1, y1], [x1, y2], [x2, y1], [x2, y2]];

  const labels = vi
    ? ["Circle & rectangle", "Slab ngang", "Slab dọc", "4 đĩa ở góc", "Kết quả"]
    : ["Circle & rectangle", "Wide slab", "Tall slab", "4 corner discs", "Result"];
  const phases = labels
    .map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`)
    .join("");

  const g = cr1401Plane(
    Math.min(x1 - radius, xCenter - radius),
    Math.max(x2 + radius, xCenter + radius),
    Math.min(y1 - radius, yCenter - radius),
    Math.max(y2 + radius, yCenter + radius),
  );
  const { plot, scale, mapX, mapY, fx, fy } = g;

  const box = (lo, hi, bottom, top, className) => {
    const left = mapX(lo);
    const upper = mapY(top);
    return `<rect class="${className}" x="${left.toFixed(2)}" y="${upper.toFixed(2)}" width="${(mapX(hi) - left).toFixed(2)}" height="${(mapY(bottom) - upper).toFixed(2)}" rx="2"/>`;
  };
  const stateOf = (value, active) => `${value === true ? "hit" : value === false ? "miss" : "pending"}${active ? " active" : ""}`;

  const wideSvg = box(x1 - radius, x2 + radius, y1, y2, `cr1401-region-slab ${stateOf(view.inWide, operation === "in-wide")}`);
  const tallSvg = box(x1, x2, y1 - radius, y2 + radius, `cr1401-region-slab ${stateOf(view.inTall, operation === "in-tall")}`);
  const radiusPx = radius * scale;
  const discsSvg = corners
    .map(([cornerX, cornerY], index) => {
      const active = cornerIndex === index && operation.startsWith("corner");
      return `<circle class="cr1401-region-disc ${stateOf(cornerResults[index], active)}" cx="${fx(cornerX)}" cy="${fy(cornerY)}" r="${radiusPx.toFixed(2)}"/>`;
    })
    .join("");

  const rectLeft = mapX(x1);
  const rectTop = mapY(y2);
  const rectWidth = mapX(x2) - rectLeft;
  const rectHeight = mapY(y1) - rectTop;
  const rectSvg = `<g class="cr1401-rect"><rect x="${rectLeft.toFixed(2)}" y="${rectTop.toFixed(2)}" width="${rectWidth.toFixed(2)}" height="${rectHeight.toFixed(2)}" rx="3"/><text class="corner start" x="${(rectLeft + 5).toFixed(2)}" y="${(rectTop + rectHeight - 6).toFixed(2)}">(${x1}, ${y1})</text><text class="corner end" x="${(rectLeft + rectWidth - 5).toFixed(2)}" y="${(rectTop + 13).toFixed(2)}">(${x2}, ${y2})</text></g>`;

  // The original circle is kept as a faint outline so the transformation
  // "circle shrinks to a point, rectangle grows by r" stays visible.
  const ghostSvg = `<circle class="cr1401-ghost-circle" cx="${fx(xCenter)}" cy="${fy(yCenter)}" r="${radiusPx.toFixed(2)}"/>`;

  const centerState = view.answer === true ? "inside" : view.final ? "outside" : "";
  let cornerLinkSvg = "";
  if (cornerIndex >= 0 && Number.isFinite(view.cornerX) && Number.isFinite(view.cornerY)) {
    cornerLinkSvg = `<line class="cr1401-corner-link ${cornerResults[cornerIndex] === true ? "hit" : cornerResults[cornerIndex] === false ? "miss" : ""}" x1="${fx(xCenter)}" y1="${fy(yCenter)}" x2="${fx(view.cornerX)}" y2="${fy(view.cornerY)}"/><circle class="cr1401-corner-dot" cx="${fx(view.cornerX)}" cy="${fy(view.cornerY)}" r="4"/>`;
  }
  const centerSvg = `<g class="cr1401-center ${centerState}"><circle cx="${fx(xCenter)}" cy="${fy(yCenter)}" r="4.5"/><text x="${(mapX(xCenter) + 8).toFixed(2)}" y="${(mapY(yCenter) - 8).toFixed(2)}">C (${xCenter}, ${yCenter})</text></g>`;

  const svgSummary = vi
    ? `Rectangle từ (${x1}, ${y1}) tới (${x2}, ${y2}) nở ra bán kính ${radius} thành hình chữ nhật bo góc, và tâm circle (${xCenter}, ${yCenter}) được kiểm tra có nằm trong vùng đó.`
    : `The rectangle from (${x1}, ${y1}) to (${x2}, ${y2}) inflated by radius ${radius} into a rounded rectangle, with the circle center (${xCenter}, ${yCenter}) tested for membership.`;
  const plane = `<svg viewBox="0 0 660 300" role="img" aria-label="${escapeHtml(svgSummary)}">${g.frame}${discsSvg}${wideSvg}${tallSvg}${rectSvg}${ghostSvg}${cornerLinkSvg}${centerSvg}</svg>`;

  const slabCard = (title, value, active, xLow, xHigh, yLow, yHigh) => {
    const xOk = xLow <= xCenter && xCenter <= xHigh;
    const yOk = yLow <= yCenter && yCenter <= yHigh;
    return `<article class="cr1401-slab-card ${stateOf(value, active)}"><header><strong>${escapeHtml(title)}</strong><span>${bool(value)}</span></header><div><span class="${value === null || value === undefined ? "" : xOk ? "ok" : "bad"}"><small>x</small><code>${xLow} ≤ ${xCenter} ≤ ${xHigh}</code></span><span class="${value === null || value === undefined ? "" : yOk ? "ok" : "bad"}"><small>y</small><code>${yLow} ≤ ${yCenter} ≤ ${yHigh}</code></span></div></article>`;
  };
  const slabs = `<section class="cr1401-slab-checks">${slabCard(vi ? "in_wide · nở theo X" : "in_wide · grown in X", view.inWide, operation === "in-wide", x1 - radius, x2 + radius, y1, y2)}${slabCard(vi ? "in_tall · nở theo Y" : "in_tall · grown in Y", view.inTall, operation === "in-tall", x1, x2, y1 - radius, y2 + radius)}</section>`;

  const cornerCards = corners
    .map(([cornerX, cornerY], index) => {
      const active = cornerIndex === index && operation.startsWith("corner");
      const visited = cornerResults[index] !== null && cornerResults[index] !== undefined;
      const dxText = active && Number.isFinite(view.dx) ? num(view.dx) : visited ? String(xCenter - cornerX) : "?";
      const dyText = active && Number.isFinite(view.dy) ? num(view.dy) : visited ? String(yCenter - cornerY) : "?";
      const distText = visited ? String((xCenter - cornerX) ** 2 + (yCenter - cornerY) ** 2) : active && Number.isFinite(view.cornerDistSq) ? num(view.cornerDistSq) : "?";
      return `<article class="cr1401-corner-card ${stateOf(cornerResults[index], active)}"><header><strong>#${index + 1}</strong><code>(${cornerX}, ${cornerY})</code></header><div><span>dx<b>${dxText}</b></span><span>dy<b>${dyText}</b></span></div><footer><code>dx²+dy² = ${distText}</code><span>${cornerResults[index] === true ? (vi ? "TRONG ĐĨA ✓" : "IN DISC ✓") : cornerResults[index] === false ? (vi ? "ngoài ✕" : "outside ✕") : (vi ? "chưa xét" : "not tested")}</span></footer></article>`;
    })
    .join("");

  const locals = cr1401Locals([
    // Line numbers are 1-based, matching row.dataset.line in renderCode.
    { name: "in_wide", line: 3, value: view.inWide },
    { name: "in_tall", line: 4, value: view.inTall },
    { name: "radius_squared", line: 7, value: view.radiusSq },
    { name: "corner_x", line: 8, value: view.cornerX },
    { name: "corner_y", line: 8, value: view.cornerY },
    { name: "dx", line: 9, value: view.dx },
    { name: "dy", line: 10, value: view.dy },
  ], currentLine, vi);

  const formulas = {
    inputs: `radius=${radius}, center=(${xCenter}, ${yCenter}), rect=[${rect.join(", ")}]`,
    "in-wide": `in_wide = ${x1 - radius} <= ${xCenter} <= ${x2 + radius} and ${y1} <= ${yCenter} <= ${y2} → ${bool(view.inWide)}`,
    "in-tall": `in_tall = ${x1} <= ${xCenter} <= ${x2} and ${y1 - radius} <= ${yCenter} <= ${y2 + radius} → ${bool(view.inTall)}`,
    "slab-check": `if ${bool(view.inWide)} or ${bool(view.inTall)} → ${bool(view.slabHit)}`,
    "return-slab": "return True",
    "radius-squared": `radius_squared = ${radius}² = ${num(radiusSq)}`,
    "corner-loop": `corner ${cornerIndex + 1}/4 = (${num(view.cornerX)}, ${num(view.cornerY)})`,
    "corner-dx": `dx = ${xCenter} - ${num(view.cornerX)} = ${num(view.dx)}`,
    "corner-dy": `dy = ${yCenter} - ${num(view.cornerY)} = ${num(view.dy)}`,
    "corner-check": `${sq(view.dx)} + ${sq(view.dy)} = ${num(view.cornerDistSq)} <= ${num(radiusSq)} → ${bool(cornerResults[cornerIndex])}`,
    "return-corner": "return True",
    "return-false": "return False",
  };

  const final = Boolean(view.final);
  const answerLabel = view.answer === true ? "TRUE" : view.answer === false ? "FALSE" : "…";
  const summary = vi
    ? "Bài 1401 cách 2: nở rectangle ra bán kính r rồi kiểm tra tâm circle có thuộc vùng đó, tách thành 2 slab và 4 đĩa góc."
    : "Problem 1401 approach 2: inflate the rectangle by r and test whether the circle center lies in that region, split into 2 slabs and 4 corner discs.";

  $("treeView").innerHTML = `<section class="cr1401-viz cr1401-region-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>GEOMETRY · INFLATED REGION · #1401</small><strong>CIRCLE AND RECTANGLE OVERLAPPING · APPROACH 2</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="cr1401-phases">${phases}</div>
    <section class="cr1401-rule"><span><b>1</b><code>${escapeHtml(vi ? "circle thu về tâm, rectangle nở ra r" : "circle shrinks to its center, rectangle grows by r")}</code></span><i>${vi ? "NÊN" : "SO"}</i><span><b>2</b><code>${escapeHtml(vi ? "chỉ cần: tâm có thuộc vùng nở ra?" : "only ask: is the center inside that region?")}</code></span></section>
    <section class="cr1401-plane"><header><strong>${vi ? "VÙNG NỞ RA = 2 SLAB + 4 ĐĨA" : "INFLATED REGION = 2 SLABS + 4 DISCS"}</strong><span>${escapeHtml(vi ? "nét mảnh = circle gốc · điểm = tâm" : "thin outline = original circle · dot = center")}</span></header>${plane}</section>
    ${locals}
    ${slabs}
    <section class="cr1401-corner-grid">${cornerCards}</section>
    <section class="cr1401-operation"><header><strong>${vi ? "DÒNG ĐANG CHẠY" : "EXECUTING"}</strong><code>${escapeHtml(formulas[view.operation] || view.operation || "—")}</code></header><span>${escapeHtml(pick(step.note))}</span></section>
    <section class="cr1401-action"><small>${vi ? "DÒNG" : "LINE"} ${currentLine ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong></section>
    <footer class="cr1401-result ${final ? (view.answer ? "yes" : "no") : ""}"><small>SHARE A POINT?</small><strong>${answerLabel}</strong><span>${final ? (view.answer ? (vi ? "tâm nằm trong vùng nở ra" : "the center lies inside the inflated region") : (vi ? "tâm ở ngoài cả 2 slab và cả 4 đĩa" : "the center misses both slabs and all four discs")) : (vi ? "tâm có thuộc vùng nở ra không?" : "is the center inside the inflated region?")}</span></footer>
  </section>`;
}

function renderDirections2096View(step) {
  const view = step.directions2096View || {};
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages
    .map((stage, index) => {
      const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
      return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
    })
    .join("");

  const startPath = Array.isArray(view.startPath) ? view.startPath : null;
  const destPath = Array.isArray(view.destPath) ? view.destPath : null;
  const common = Number.isInteger(view.common) ? view.common : null;
  const compareIndex = Number.isInteger(view.compareIndex) ? view.compareIndex : -1;

  // One row of L/R cells. Cells before `common` are the shared walk down to the
  // LCA; the cell under the cursor is the pair being compared right now.
  const pathRow = (path, tone) => {
    if (!path) return `<b class="dir2096-empty">${vi ? "chưa tính" : "not computed yet"}</b>`;
    if (!path.length) return `<b class="dir2096-empty">[] · ${vi ? "chính là root" : "this is the root"}</b>`;
    return path
      .map((letter, index) => {
        const classes = [];
        if (common !== null && index < common) classes.push("shared");
        else if (common !== null) classes.push(tone);
        if (index === compareIndex) classes.push("compare");
        return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(letter)}</strong></span>`;
      })
      .join("");
  };

  const compareCard = (() => {
    if (common === null) {
      return `<p class="dir2096-compare-note">${escapeHtml(vi ? "Cần cả hai path trước khi so tiền tố." : "Both paths are needed before comparing prefixes.")}</p>`;
    }
    if (compareIndex < 0) {
      return `<p class="dir2096-compare-note">${escapeHtml(vi ? `Tiền tố chung dài ${common} bước — đó chính là đường xuống LCA.` : `The shared prefix is ${common} steps long — that is the walk down to the LCA.`)}</p>`;
    }
    const left = startPath && compareIndex < startPath.length ? startPath[compareIndex] : null;
    const right = destPath && compareIndex < destPath.length ? destPath[compareIndex] : null;
    const ended = left === null || right === null;
    const same = view.compareResult === true;
    const symbol = ended ? "∅" : same ? "==" : "≠";
    const verdict = ended
      ? (vi ? "Một path đã hết → dừng" : "One path ran out → stop")
      : same
        ? (vi ? "Giống nhau → đi sâu thêm" : "Same → go deeper")
        : (vi ? "Khác nhau → đây là LCA" : "Different → this is the LCA");
    return `<div class="dir2096-compare-row ${ended ? "ended" : same ? "same" : "split"}"><span><small>start[${compareIndex}]</small><strong>${escapeHtml(left ?? "∅")}</strong></span><b>${symbol}</b><span><small>dest[${compareIndex}]</small><strong>${escapeHtml(right ?? "∅")}</strong></span><em>${escapeHtml(verdict)}</em></div>`;
  })();

  const answerCells = (() => {
    if (view.answer === null || view.answer === undefined) {
      return `<b class="dir2096-empty">${vi ? "chưa ghép" : "not assembled yet"}</b>`;
    }
    if (view.answer === "") return `<b class="dir2096-empty">""</b>`;
    const upCount = Number.isInteger(view.upCount) ? view.upCount : 0;
    return [...String(view.answer)]
      .map((letter, index) => `<span class="${index < upCount ? "up" : "down"}"><small>${index}</small><strong>${escapeHtml(letter)}</strong></span>`)
      .join("");
  })();

  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stack.length
    ? stack
      .map((frame, index) => `<li class="${index === stack.length - 1 ? "active" : ""}"><span>#${index + 1}</span><strong>${escapeHtml(frame.value)}</strong><small>${escapeHtml(`${frame.side} · trail=${frame.trail}`)}</small><em>${escapeHtml(frame.stage)}</em></li>`)
      .join("")
    : `<li class="empty">${vi ? "Call stack rỗng" : "Call stack is empty"}</li>`;

  const searching = view.which === "start" ? (vi ? "start" : "start") : view.which === "dest" ? "dest" : null;
  const trail = Array.isArray(view.trail) ? view.trail.join("") : "";
  const tone = view.event === "answer"
    ? "done"
    : view.event === "compare-stop"
      ? "split"
      : view.event && String(view.event).endsWith("-hit") || view.event === "match"
        ? "hit"
        : "";

  const summary = vi
    ? `Bài 2096, ${text(step.title)}. Đi từ ${view.startValue} tới ${view.destValue}.`
    : `Problem 2096, ${text(step.title)}. Travelling from ${view.startValue} to ${view.destValue}.`;

  $("treeView").innerHTML = `<section class="dir2096-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>BINARY TREE · ROOT PATHS + SHARED PREFIX · #2096</small><strong>STEP-BY-STEP DIRECTIONS · ${escapeHtml(String(view.startValue))} → ${escapeHtml(String(view.destValue))}</strong></div><span>${escapeHtml(text(step.title))}</span></header>
    <div class="dir2096-phases">${phases}</div>
    <section class="dir2096-rule"><span><b>1</b><code>${escapeHtml(vi ? "tiền tố chung = đường xuống LCA" : "shared prefix = walk down to the LCA")}</code></span><i>${vi ? "NÊN" : "SO"}</i><span><b>2</b><code>"U" × (len(start_path) − common) + dest_path[common:]</code></span></section>
    <section class="dir2096-action ${tone}"><span><small>${escapeHtml(String(view.event || "walk").replaceAll("-", " ").toUpperCase())}</small><strong>${escapeHtml(text(step.title))}</strong></span><em>${searching ? `${vi ? "đang tìm" : "looking for"} ${searching} = ${escapeHtml(String(view.target))}` : `ANSWER: ${escapeHtml(view.answer === null || view.answer === undefined ? "—" : `"${view.answer}"`)}`}</em></section>
    <div class="dir2096-layout">
      <section class="dir2096-tree-card"><header><strong>${vi ? "CÂY · CHỮ DƯỚI NODE LÀ BƯỚC TỪ CHA" : "TREE · THE LETTER UNDER A NODE IS THE STEP FROM ITS PARENT"}</strong><span>${vi ? "cam = node hiện tại · xanh = trên path" : "amber = current node · green = on a path"}</span></header><div id="dir2096Tree" class="dir2096-tree"></div></section>
      <aside class="dir2096-side">
        <section class="dir2096-stats"><div><small>${vi ? "ĐANG TÌM" : "LOOKING FOR"}</small><strong>${escapeHtml(view.target === null || view.target === undefined ? "—" : view.target)}</strong></div><div><small>NODE</small><strong>${escapeHtml(view.current ? view.current.value : "—")}</strong></div><div><small>TRAIL</small><strong>${escapeHtml(trail || '""')}</strong></div><div><small>LCA</small><strong>${escapeHtml(view.lca ? view.lca.value : "—")}</strong></div></section>
        <section class="dir2096-stack"><header><strong>CALL STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
      </aside>
    </div>
    <section class="dir2096-paths">
      <header><strong>${vi ? "HAI ĐƯỜNG TỪ ROOT" : "THE TWO ROOT PATHS"}</strong><span>${vi ? "ô xám = tiền tố chung (tới LCA) · ô màu = phần riêng" : "grey cells = shared prefix (down to the LCA) · coloured cells = the leftover"}</span></header>
      <div class="dir2096-path-row"><small>start_path · ${escapeHtml(String(view.startValue))}</small><div>${pathRow(startPath, "from-start")}</div></div>
      <div class="dir2096-path-row"><small>dest_path · ${escapeHtml(String(view.destValue))}</small><div>${pathRow(destPath, "to-dest")}</div></div>
      <footer>common = <b>${escapeHtml(common === null ? "—" : common)}</b>${compareCard}</footer>
    </section>
    <section class="dir2096-answer ${view.final ? "ready" : ""}">
      <header><strong>${vi ? "GHÉP ĐÁP ÁN" : "ASSEMBLE THE ANSWER"}</strong><span>${vi ? "tím = leo lên (U) · xanh = đi xuống (L/R)" : "purple = climb up (U) · green = descend (L/R)"}</span></header>
      <div class="dir2096-answer-parts"><span class="up"><small>${vi ? "LEO LÊN" : "CLIMB UP"}</small><strong>${escapeHtml(Number.isInteger(view.upCount) ? `${view.upCount} × U` : "—")}</strong></span><i>+</i><span class="down"><small>${vi ? "ĐI XUỐNG" : "DESCEND"}</small><strong>${escapeHtml(Array.isArray(view.downLetters) ? (view.downLetters.join("") || "(∅)") : "—")}</strong></span></div>
      <div class="dir2096-answer-cells">${answerCells}</div>
    </section>
    <section class="dir2096-code"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><span>${escapeHtml(text(step.note))}</span></section>
  </section>`;

  if (step.tree && Array.isArray(step.tree.nodes) && step.tree.nodes.length) renderTree(step, "dir2096Tree");
  else $("dir2096Tree").innerHTML = `<span class="dir2096-tree-empty">∅</span>`;
}
function renderReverseDegree3498View(step) {
  const view = step.reverseDegree3498View || {};
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const num = (value) => (Number.isFinite(value) ? String(value) : "?");
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages
    .map((stage, index) => {
      const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
      return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
    })
    .join("");

  const cells = Array.isArray(view.cells) ? view.cells : [];
  const hasChar = typeof view.char === "string" && view.char.length === 1;
  const alphaIndex = Number.isInteger(view.alphaIndex) ? view.alphaIndex : null;
  const reversePosition = Number.isInteger(view.reversePosition) ? view.reversePosition : null;

  // The reversed alphabet itself: the single mapping the whole problem rests on.
  const ruler = Array.from({ length: 26 }, (_unused, rank) => {
    const letter = String.fromCharCode(97 + rank);
    const value = 26 - rank;
    const active = hasChar && letter === view.char;
    return `<span class="${active ? "active" : ""}"><b>${letter}</b><small>${value}</small></span>`;
  }).join("");

  const charCells = cells.length
    ? cells
      .map((cell) => `<span class="rd3498-cell ${cell.state}"><small>${cell.position}</small><strong>${escapeHtml(cell.char)}</strong><em>${cell.reversePosition === null ? "·" : `×${cell.reversePosition}`}</em><b>${cell.product === null ? "?" : cell.product}</b></span>`)
      .join("")
    : `<b class="rd3498-empty">∅</b>`;

  // Substitution for the character being handled right now.
  const substitution = hasChar
    ? `<div class="rd3498-substitution"><span><small>ord('${escapeHtml(view.char)}') − ord('a')</small><strong>${num(alphaIndex)}</strong></span><i>→</i><span><small>26 − ${num(alphaIndex)}</small><strong>${num(reversePosition)}</strong></span><i>×</i><span><small>${vi ? "vị trí" : "position"}</small><strong>${num(view.position)}</strong></span><i>=</i><span class="result"><small>${vi ? "đóng góp" : "contribution"}</small><strong>${view.product === null || view.product === undefined ? "?" : view.product}</strong></span></div>`
    : `<p class="rd3498-substitution-idle">${escapeHtml(vi ? "Chưa có ký tự nào đang được xử lý." : "No character is being handled right now.")}</p>`;

  // The two classic off-by-one formulas, shown against the correct one.
  const guard = hasChar && alphaIndex !== null
    ? `<section class="rd3498-guard"><header><strong>${vi ? "BẪY LỆCH MỘT ĐƠN VỊ" : "THE OFF-BY-ONE TRAP"}</strong><span>${escapeHtml(vi ? `với '${view.char}', chỉ một công thức cho đúng` : `for '${view.char}', only one formula is right`)}</span></header><div><span class="bad"><code>25 − ${alphaIndex}</code><b>${25 - alphaIndex}</b><em>✕ ${vi ? "'z' thành 0" : "'z' becomes 0"}</em></span><span class="good"><code>26 − ${alphaIndex}</code><b>${26 - alphaIndex}</b><em>✓ ${vi ? "'a'=26, 'z'=1" : "'a'=26, 'z'=1"}</em></span><span class="bad"><code>27 − ${alphaIndex}</code><b>${27 - alphaIndex}</b><em>✕ ${vi ? "'a' thành 27" : "'a' becomes 27"}</em></span></div></section>`
    : "";

  const terms = Array.isArray(view.terms) ? view.terms : [];
  const sumExpression = terms.length
    ? terms
      .map((termValue, index) => `<span class="${index === terms.length - 1 ? "fresh" : ""}">${termValue}</span>${index < terms.length - 1 ? "<i>+</i>" : ""}`)
      .join("")
    : `<b class="rd3498-empty">${escapeHtml(vi ? "chưa có số hạng" : "no terms yet")}</b>`;

  const tone = view.event === "return" ? "done" : view.event === "accumulate" ? "add" : view.event === "reverse-value" ? "value" : "";
  const summary = vi
    ? `Bài 3498, chuỗi "${view.s}". ${text(step.title)}`
    : `Problem 3498, string "${view.s}". ${text(step.title)}`;

  $("treeView").innerHTML = `<section class="rd3498-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>STRING · WEIGHTED SUM · #3498</small><strong>REVERSE DEGREE · "${escapeHtml(String(view.s ?? ""))}"</strong></div><span>${escapeHtml(text(step.title))}</span></header>
    <div class="rd3498-phases">${phases}</div>
    <section class="rd3498-rule"><span><b>1</b><code>${escapeHtml(vi ? "bảng chữ cái đảo: 'a'=26 … 'z'=1" : "reversed alphabet: 'a'=26 … 'z'=1")}</code></span><i>${vi ? "RỒI" : "THEN"}</i><span><b>2</b><code>total += position × reverse_position</code></span></section>
    <section class="rd3498-alphabet"><header><strong>${vi ? "BẢNG CHỮ CÁI ĐẢO" : "THE REVERSED ALPHABET"}</strong><span>${escapeHtml(vi ? "chữ trên, giá trị dưới" : "letter on top, value below")}</span></header><div>${ruler}</div></section>
    <section class="rd3498-strip"><header><strong>${vi ? "TỪNG KÝ TỰ · VỊ TRÍ × GIÁ TRỊ ĐẢO" : "EACH CHARACTER · POSITION × REVERSED VALUE"}</strong><span>${escapeHtml(vi ? "mờ = chưa tới · viền = đang xét" : "dimmed = not reached · outlined = current")}</span></header><div>${charCells}</div></section>
    <section class="rd3498-work ${tone}"><header><strong>${vi ? "THAY SỐ CHO KÝ TỰ HIỆN TẠI" : "SUBSTITUTION FOR THE CURRENT CHARACTER"}</strong><span>${escapeHtml(vi ? "không cần bảng tra" : "no lookup table needed")}</span></header>${substitution}</section>
    ${guard}
    <section class="rd3498-total ${view.final ? "ready" : ""}"><header><strong>${vi ? "TỔNG ĐANG CỘNG DỒN" : "RUNNING TOTAL"}</strong><span>${escapeHtml(vi ? "số hạng mới nhất được làm nổi" : "the newest term is highlighted")}</span></header><div class="rd3498-sum">${sumExpression}</div><footer><small>total</small><strong>${view.total === null || view.total === undefined ? "—" : view.total}</strong><em>${view.final ? (vi ? "đây là đáp án" : "this is the answer") : (vi ? "còn tiếp" : "still accumulating")}</em></footer></section>
    <section class="rd3498-code"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><span>${escapeHtml(text(step.note))}</span></section>
  </section>`;
}
function renderFindXValue3524View(step) {
  const view = step.findXValue3524View || {};
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const n = Number.isInteger(view.n) ? view.n : nums.length;
  const k = Number.isInteger(view.k) ? view.k : 1;
  const index = Number.isInteger(view.index) ? view.index : -1;
  const r = Number.isInteger(view.r) ? view.r : -1;
  const targetR = Number.isInteger(view.targetR) ? view.targetR : -1;
  const event = view.event || "";
  const grid = Array.isArray(view.grid) ? view.grid : [];
  const total = (n * (n + 1)) / 2;

  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages
    .map((stage, position) => {
      const state = position < stageIndex ? "done" : position === stageIndex ? "active" : "pending";
      return `<span class="${state}"><i>${state === "done" ? "✓" : position + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
    })
    .join("");

  // nums with each value's remainder underneath, current element lit.
  const numsStrip = nums
    .map((value, position) => `<span class="${position === index ? "current" : position < index ? "done" : "pending"}"><small>${position}</small><strong>${escapeHtml(value)}</strong><em>%${k}=${value % k}</em></span>`)
    .join("");

  // The full triangle of subarrays, each labelled with its product remainder.
  // The column under the current index is exactly what new_dp is counting.
  const cellMatched = (cell) => {
    if (cell.end !== index) return false;
    if (event === "seed-single") return cell.start === index;
    if (event === "extend") return cell.start < index && cell.fromMod === r;
    if (event === "accumulate") return cell.mod === r;
    return false;
  };
  const gridCells = [];
  gridCells.push(`<span class="fx3524-corner">s\\e</span>`);
  for (let end = 0; end < n; end += 1) {
    gridCells.push(`<span class="fx3524-axis ${end === index ? "on" : ""}">${end}</span>`);
  }
  for (let start = 0; start < n; start += 1) {
    gridCells.push(`<span class="fx3524-axis">${start}</span>`);
    for (let end = 0; end < n; end += 1) {
      if (end < start) {
        gridCells.push(`<span class="fx3524-blank"></span>`);
        continue;
      }
      const cell = (grid[start] || [])[end - start];
      if (!cell) {
        gridCells.push(`<span class="fx3524-blank"></span>`);
        continue;
      }
      const state = index < 0 || cell.end > index ? "pending" : cell.end < index ? "counted" : "active";
      gridCells.push(`<span class="fx3524-cell ${state}${cellMatched(cell) ? " matched" : ""}" data-mod="${cell.mod}">${cell.mod}</span>`);
    }
  }
  const gridHtml = `<div class="fx3524-grid" style="grid-template-columns: repeat(${n + 1}, minmax(26px, 1fr))">${gridCells.join("")}</div>`;

  const bucketRow = (label, values, focus, tone) => {
    if (!Array.isArray(values)) {
      return `<div class="fx3524-row"><small>${escapeHtml(label)}</small><b class="fx3524-empty">${escapeHtml(vi ? "chưa có" : "not yet")}</b></div>`;
    }
    const cells = values
      .map((value, position) => `<span class="${position === focus ? `focus ${tone}` : ""}"><small>r=${position}</small><strong>${value}</strong></span>`)
      .join("");
    return `<div class="fx3524-row"><small>${escapeHtml(label)}</small><div>${cells}</div></div>`;
  };

  // The multiplication map on remainders, shown only while a transition runs.
  const transition = event === "extend"
    ? `<div class="fx3524-transition ${view.delta === 0 ? "empty" : "live"}"><span><small>dp[${r}]</small><strong>${escapeHtml(text(view.delta))}</strong></span><i>×${escapeHtml(text(view.numMod))}</i><span><small>(${r} × ${escapeHtml(text(view.numMod))}) % ${k}</small><strong>${targetR}</strong></span><i>→</i><span class="dest"><small>new_dp[${targetR}]</small><strong>${Array.isArray(view.newDp) ? view.newDp[targetR] : "?"}</strong></span><em>${escapeHtml(view.delta === 0 ? (vi ? "không có subarray nào để mở rộng" : "no subarray to extend") : (vi ? `${view.delta} subarray chuyển sang số dư ${targetR}` : `${view.delta} subarrays move to remainder ${targetR}`))}</em></div>`
    : event === "seed-single"
      ? `<div class="fx3524-transition live"><span class="dest"><small>new_dp[${escapeHtml(text(view.numMod))}]</small><strong>1</strong></span><em>${escapeHtml(vi ? `subarray một phần tử [${view.num}] kết thúc tại ${index}` : `the single-element subarray [${view.num}] ending at ${index}`)}</em></div>`
      : event === "accumulate"
        ? `<div class="fx3524-transition live"><span><small>new_dp[${r}]</small><strong>${escapeHtml(text(view.delta))}</strong></span><i>→</i><span class="dest"><small>ans[${r}]</small><strong>${Array.isArray(view.ans) ? view.ans[r] : "?"}</strong></span><em>${escapeHtml(vi ? "mọi subarray kết thúc tại đúng một vị trí nên không đếm trùng" : "each subarray ends at exactly one index, so nothing is double counted")}</em></div>`
        : `<p class="fx3524-transition-idle">${escapeHtml(vi ? "Chưa có phép chuyển số dư nào đang chạy." : "No remainder transition is running right now.")}</p>`;

  const ansSum = Array.isArray(view.ans) ? view.ans.reduce((sum, value) => sum + value, 0) : null;
  const checksum = ansSum === null
    ? ""
    : `<footer class="fx3524-checksum ${ansSum === total ? "full" : ""}"><small>Σ ans</small><strong>${ansSum}</strong><em>${escapeHtml(vi ? `phải bằng n(n+1)/2 = ${total}` : `must reach n(n+1)/2 = ${total}`)}</em></footer>`;

  const tone = event === "return" ? "done" : event === "extend" ? "extend" : event === "accumulate" ? "accumulate" : "";
  const summary = vi
    ? `Bài 3524, nums = [${nums.join(", ")}], k = ${k}. ${text(step.title)}`
    : `Problem 3524, nums = [${nums.join(", ")}], k = ${k}. ${text(step.title)}`;

  $("treeView").innerHTML = `<section class="fx3524-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>DP ON REMAINDERS · SUBARRAY COUNTING · #3524</small><strong>FIND X VALUE OF ARRAY I · k = ${k}</strong></div><span>${escapeHtml(text(step.title))}</span></header>
    <div class="fx3524-phases">${phases}</div>
    <section class="fx3524-rule"><span><b>1</b><code>${escapeHtml(vi ? "bỏ prefix + suffix = chọn một subarray" : "remove prefix + suffix = pick one subarray")}</code></span><i>${vi ? "NÊN" : "SO"}</i><span><b>2</b><code>result[x] = #{subarray : product % k == x}</code></span></section>
    <section class="fx3524-nums"><header><strong>${vi ? "NUMS · SỐ DƯ CỦA TỪNG PHẦN TỬ" : "NUMS · REMAINDER OF EACH ELEMENT"}</strong><span>${escapeHtml(vi ? "chỉ số dư là quan trọng" : "only the remainder matters")}</span></header><div>${numsStrip}</div></section>
    <div class="fx3524-layout">
      <section class="fx3524-triangle"><header><strong>${vi ? "MỌI SUBARRAY · product % k" : "EVERY SUBARRAY · product % k"}</strong><span>${escapeHtml(vi ? "hàng = start, cột = end · cột sáng = đang đếm" : "row = start, column = end · lit column = being counted")}</span></header>${gridHtml}</section>
      <section class="fx3524-dp"><header><strong>${vi ? "BẢNG ĐẾM THEO SỐ DƯ" : "COUNTS PER REMAINDER"}</strong><span>${escapeHtml(vi ? "chỉ k ô, không phải n² subarray" : "just k buckets, not n² subarrays")}</span></header>
        ${bucketRow(vi ? "dp · kết thúc tại i−1" : "dp · ending at i−1", view.dp, event === "extend" ? r : -1, "source")}
        ${bucketRow(vi ? "new_dp · kết thúc tại i" : "new_dp · ending at i", view.newDp, event === "extend" ? targetR : event === "seed-single" ? view.numMod : event === "accumulate" ? r : -1, "dest")}
        ${bucketRow("ans", view.ans, event === "accumulate" ? r : -1, "total")}
        ${checksum}
      </section>
    </div>
    <section class="fx3524-work ${tone}"><header><strong>${vi ? "PHÉP CHUYỂN SỐ DƯ" : "THE REMAINDER TRANSITION"}</strong><span>${escapeHtml(vi ? "nhân thêm một phần tử = nhân số dư" : "appending an element multiplies the remainder")}</span></header>${transition}</section>
    <section class="fx3524-code"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><span>${escapeHtml(text(step.note))}</span></section>
  </section>`;
}
function renderMinWindow76View(step) {
  const view = step.minWindow76View || {};
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages
    .map((stage, index) => {
      const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
      return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
    })
    .join("");

  const cells = Array.isArray(view.chars) ? view.chars : [];
  const strip = cells.length
    ? cells
      .map((cell) => {
        const classes = ["mw76-cell"];
        if (cell.inWindow) classes.push("in-window");
        if (cell.inBest) classes.push("in-best");
        if (cell.required) classes.push("required");
        const cursors = [];
        if (cell.isLeft) cursors.push("L");
        if (cell.isRight) cursors.push("R");
        if (cursors.length) classes.push("cursor");
        return `<span class="${classes.join(" ")}"><small>${cell.index}</small><strong>${escapeHtml(cell.char)}</strong><i>${escapeHtml(cursors.join("") || "\u00a0")}</i></span>`;
      })
      .join("")
    : `<b class="mw76-empty">${escapeHtml(vi ? "s rỗng" : "s is empty")}</b>`;

  // need[] is the whole problem: positive = still owed, negative = surplus.
  const needCells = Array.isArray(view.need) ? view.need : [];
  const needHtml = needCells.length
    ? needCells
      .map((entry) => `<span class="mw76-need ${entry.state}"><strong>${escapeHtml(entry.char)}</strong><b>${entry.count > 0 ? `+${entry.count}` : entry.count}</b><em>${escapeHtml(entry.state === "missing" ? (vi ? "còn nợ" : "still owed") : entry.state === "exact" ? (vi ? "vừa đủ" : "exactly met") : (vi ? "thừa" : "surplus"))}</em></span>`)
      .join("")
    : `<b class="mw76-empty">${escapeHtml(vi ? "t rỗng" : "t is empty")}</b>`;

  const missing = Number.isInteger(view.missing) ? view.missing : null;
  const covered = missing === 0;
  const gauge = `<section class="mw76-missing ${covered ? "covered" : "short"}"><small>missing</small><strong>${missing === null ? "—" : missing}</strong><em>${escapeHtml(covered ? (vi ? "0 → window đã phủ đủ t, co left được" : "0 → the window covers t, left may shrink") : (vi ? `còn nợ ${missing} ký tự → phải mở rộng right` : `${missing} characters still owed → right must expand`))}</em></section>`;

  const best = view.best;
  const bestHtml = best
    ? `<section class="mw76-best found"><small>${vi ? "BEST HIỆN TẠI" : "CURRENT BEST"}</small><strong>"${escapeHtml(best.text)}"</strong><em>s[${best.start}:${best.end}] · ${vi ? "độ dài" : "length"} ${best.length}</em></section>`
    : `<section class="mw76-best"><small>${vi ? "BEST HIỆN TẠI" : "CURRENT BEST"}</small><strong>${escapeHtml(vi ? "chưa có" : "none yet")}</strong><em>${escapeHtml(vi ? "missing chưa từng về 0" : "missing has never hit 0")}</em></section>`;

  const windowHtml = `<section class="mw76-window ${covered ? "valid" : ""}"><small>${vi ? "WINDOW" : "WINDOW"} [${escapeHtml(text(view.left))}..${view.right === null || view.right === undefined || view.right < 0 ? "—" : view.right}]</small><strong>${view.windowText ? `"${escapeHtml(view.windowText)}"` : '""'}</strong><em>${vi ? "độ dài" : "length"} ${escapeHtml(text(view.windowLength))}</em></section>`;

  const tone = view.event === "return"
    ? "done"
    : view.event === "record-better"
      ? "better"
      : view.event === "shrink-breaks"
        ? "breaks"
        : view.event && String(view.event).startsWith("shrink")
          ? "shrink"
          : "";
  const summary = vi
    ? `Bài 76, s = "${view.s}", t = "${view.t}". ${text(step.title)}`
    : `Problem 76, s = "${view.s}", t = "${view.t}". ${text(step.title)}`;

  $("treeView").innerHTML = `<section class="mw76-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>SLIDING WINDOW · NEED COUNTER · #76</small><strong>MINIMUM WINDOW SUBSTRING · t = "${escapeHtml(String(view.t ?? ""))}"</strong></div><span>${escapeHtml(text(step.title))}</span></header>
    <div class="mw76-phases">${phases}</div>
    <section class="mw76-rule"><span><b>1</b><code>missing == 0 ⟺ ${escapeHtml(vi ? "window phủ đủ t" : "the window covers t")}</code></span><i>${vi ? "VÀ" : "AND"}</i><span><b>2</b><code>need[c] &lt; 0 ⟹ ${escapeHtml(vi ? "thừa c, bỏ được" : "surplus c, droppable")}</code></span></section>
    <section class="mw76-strip"><header><strong>${vi ? "s · WINDOW VÀ BEST" : "s · WINDOW AND BEST"}</strong><span>${escapeHtml(vi ? "viền = window · nền xanh = best · L/R = con trỏ · chữ đậm = ký tự thuộc t" : "outline = window · green fill = best · L/R = cursors · bold letter = character of t")}</span></header><div>${strip}</div></section>
    <div class="mw76-state">
      <section class="mw76-need-card"><header><strong>${vi ? "need · CÒN NỢ BAO NHIÊU" : "need · HOW MANY ARE STILL OWED"}</strong><span>${escapeHtml(vi ? "âm = thừa" : "negative = surplus")}</span></header><div>${needHtml}</div></section>
      <div class="mw76-gauges">${gauge}${windowHtml}${bestHtml}</div>
    </div>
    <section class="mw76-action ${tone}"><span><small>${escapeHtml(String(view.event || "step").replaceAll("-", " ").toUpperCase())}</small><strong>${escapeHtml(text(step.title))}</strong></span><em>${escapeHtml(view.answer === null || view.answer === undefined ? (vi ? "đang chạy" : "running") : `ANSWER "${view.answer}"`)}</em></section>
    <section class="mw76-code"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || []).join(", ") || "—"}</small><span>${escapeHtml(text(step.note))}</span></section>
  </section>`;
}
function renderFindXValue3525View(step) {
  const view = step.findXValue3525View || {};
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const original = Array.isArray(view.original) ? view.original : nums;
  const n = Number.isInteger(view.n) ? view.n : nums.length;
  const k = Number.isInteger(view.k) ? view.k : 1;
  const start = Number.isInteger(view.start) ? view.start : null;
  const x = Number.isInteger(view.x) ? view.x : null;
  const activeU = Number.isInteger(view.activeU) ? view.activeU : -1;
  const leftU = Number.isInteger(view.leftU) ? view.leftU : -1;
  const rightU = Number.isInteger(view.rightU) ? view.rightU : -1;
  const pathU = new Set(Array.isArray(view.pathU) ? view.pathU : []);
  const selectedU = new Set(Array.isArray(view.selectedU) ? view.selectedU : []);
  const queryIndex = Number.isInteger(view.queryIndex) ? view.queryIndex : -1;
  const queries = Array.isArray(view.queries) ? view.queries : [];
  const current = queryIndex >= 0 ? queries[queryIndex] : null;

  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages
    .map((stage, index) => {
      const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
      return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
    })
    .join("");

  // nums, with the removed prefix dimmed and the just-written cell marked.
  const numsStrip = nums
    .map((value, index) => {
      const classes = ["fx3525-num"];
      if (start !== null && index < start) classes.push("dropped");
      if (current && index === current.index) classes.push("written");
      if (start !== null && index === start) classes.push("start");
      if (value !== original[index]) classes.push("changed");
      return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(value)}</strong><em>%${k}=${value % k}</em></span>`;
    })
    .join("");

  // Ground truth: the running product remainder of every prefix of nums[start..].
  const prefixes = Array.isArray(view.prefixProducts) ? view.prefixProducts : null;
  const prefixStrip = prefixes
    ? `<section class="fx3525-truth"><header><strong>${vi ? `PREFIX CỦA nums[${start}..${n - 1}] · product % ${k}` : `PREFIXES OF nums[${start}..${n - 1}] · product % ${k}`}</strong><span>${escapeHtml(x === null ? "" : (vi ? `ô sáng = khớp x = ${x}` : `lit cells match x = ${x}`))}</span></header><div>${prefixes
      .map((entry) => `<span class="${x !== null && entry.mod === x ? "hit" : ""}"><small>..${entry.end}</small><strong>${entry.mod}</strong></span>`)
      .join("")}</div><footer>${escapeHtml(x === null ? "" : (vi ? `số ô khớp = đáp án của query này` : "the number of matching cells is this query's answer"))}</footer></section>`
    : "";

  // Segment tree laid out by level, each node spanning its array range so the
  // halving of the array is visible.
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const maxDepth = nodes.reduce((deepest, node) => Math.max(deepest, node.depth), 0);
  const treeCells = nodes
    .map((node) => {
      const classes = ["fx3525-node"];
      if (!node.ready) classes.push("pending");
      if (node.u === leftU) classes.push("merge-left");
      else if (node.u === rightU) classes.push("merge-right");
      else if (node.u === activeU) classes.push("active");
      if (selectedU.has(node.u)) classes.push("selected");
      if (pathU.has(node.u)) classes.push("on-path");
      const prodText = node.prod === null || node.prod === undefined ? "?" : node.prod;
      const cntText = node.cnt ? node.cnt.join("·") : Array(k).fill("?").join("·");
      return `<span class="${classes.join(" ")}" style="grid-row:${node.depth + 1};grid-column:${node.lo + 1} / span ${node.hi - node.lo + 1}"><small>u${node.u} [${node.lo}..${node.hi}]</small><b>prod ${prodText}</b><code>${cntText}</code></span>`;
    })
    .join("");
  const treeHtml = `<div class="fx3525-tree" style="grid-template-columns: repeat(${Math.max(n, 1)}, minmax(0, 1fr)); grid-template-rows: repeat(${maxDepth + 1}, auto)">${treeCells}</div>`;

  // The merge rule: copy the left child's cnt, then fold the right child's in
  // with every remainder multiplied by the left child's prod.
  const merge = view.merge;
  const mergeHtml = merge
    ? `<div class="fx3525-merge"><div class="fx3525-merge-row"><small>${vi ? "copy cnt trái" : "copy left cnt"}</small><div>${merge.aCnt.map((value, r) => `<span><small>r${r}</small><strong>${value}</strong></span>`).join("")}</div></div>
      <div class="fx3525-merge-row shift"><small>${vi ? `dịch cnt phải ×${merge.aProd}` : `shift right cnt ×${merge.aProd}`}</small><div>${merge.shifts.map((shift) => `<span class="${shift.amount > 0 ? "moves" : "zero"}"><small>r${shift.r}→${shift.to}</small><strong>${shift.amount > 0 ? `+${shift.amount}` : "0"}</strong></span>`).join("")}</div></div>
      <div class="fx3525-merge-row result"><small>${vi ? "cnt kết quả" : "result cnt"}</small><div>${merge.result.map((value, r) => `<span class="${x !== null && r === x ? "target" : ""}"><small>r${r}</small><strong>${value}</strong></span>`).join("")}</div></div>
      <footer><code>prod = ${merge.aProd} × ${merge.bProd} % ${k} = ${merge.prod}</code><em>${escapeHtml(vi ? "chỉ mảnh PHẢI bị nhân thêm — phép ghép không giao hoán" : "only the RIGHT piece gets the extra factor — the combination is not commutative")}</em></footer></div>`
    : `<p class="fx3525-merge-idle">${escapeHtml(vi ? "Chưa có phép merge nào đang chạy." : "No merge is running right now.")}</p>`;

  const runningCnt = Array.isArray(view.runningCnt) ? view.runningCnt : null;
  const runningHtml = runningCnt
    ? `<div>${runningCnt.map((value, r) => `<span class="${x !== null && r === x ? "target" : ""}"><small>r${r}</small><strong>${value}</strong></span>`).join("")}</div>`
    : `<b class="fx3525-empty">${escapeHtml(vi ? "chưa ghép" : "not combined yet")}</b>`;

  const answers = Array.isArray(view.answers) ? view.answers : [];
  const answersHtml = queries.length
    ? queries
      .map((query, index) => {
        const state = index < answers.length ? "done" : index === queryIndex ? "active" : "pending";
        const value = index < answers.length ? answers[index] : "?";
        return `<span class="${state}"><small>#${index} [${query.index},${query.value},${query.start},${query.x}]</small><strong>${value}</strong></span>`;
      })
      .join("")
    : `<b class="fx3525-empty">—</b>`;

  const tone = view.event === "return" ? "done" : view.event === "read" ? "read" : String(view.event || "").includes("merge") ? "merge" : "";
  const summary = vi
    ? `Bài 3525, nums = [${nums.join(", ")}], k = ${k}. ${text(step.title)}`
    : `Problem 3525, nums = [${nums.join(", ")}], k = ${k}. ${text(step.title)}`;

  $("treeView").innerHTML = `<section class="fx3525-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>SEGMENT TREE · PREFIX COUNTS PER REMAINDER · #3525</small><strong>FIND X VALUE OF ARRAY II · k = ${k}</strong></div><span>${escapeHtml(text(step.title))}</span></header>
    <div class="fx3525-phases">${phases}</div>
    <section class="fx3525-rule"><span><b>1</b><code>${escapeHtml(vi ? "bỏ suffix = giữ một prefix của nums[start..]" : "remove a suffix = keep a prefix of nums[start..]")}</code></span><i>${vi ? "NÊN" : "SO"}</i><span><b>2</b><code>cnt[left.prod × r % k] += right.cnt[r]</code></span></section>
    <section class="fx3525-nums"><header><strong>${vi ? "NUMS" : "NUMS"}</strong><span>${escapeHtml(vi ? "mờ = prefix đã bỏ · viền = ô vừa ghi · S = start" : "dimmed = dropped prefix · outlined = just written · S = start")}</span></header><div>${numsStrip}</div></section>
    ${prefixStrip}
    <section class="fx3525-tree-card"><header><strong>${vi ? "SEGMENT TREE · u [lo..hi] · prod · cnt" : "SEGMENT TREE · u [lo..hi] · prod · cnt"}</strong><span>${escapeHtml(vi ? "node rộng theo đoạn nó phủ · tím/xanh = hai con đang merge · vàng = node được chọn cho query" : "node width matches its range · purple/blue = the two children being merged · amber = node chosen for the query")}</span></header>${treeHtml}</section>
    <section class="fx3525-merge-card ${tone}"><header><strong>${vi ? "PHÉP MERGE" : "THE MERGE"}</strong><span>${escapeHtml(vi ? "prefix trong con trái giữ nguyên, prefix lấn sang phải bị nhân" : "prefixes inside the left keep their remainder, prefixes reaching right get multiplied")}</span></header>${mergeHtml}</section>
    <section class="fx3525-out"><div class="fx3525-running"><small>${vi ? `cnt CỦA [${start === null ? "—" : start}..${n - 1}]` : `cnt OF [${start === null ? "—" : start}..${n - 1}]`}</small>${runningHtml}</div><div class="fx3525-answers"><small>${vi ? "KẾT QUẢ TỪNG QUERY" : "PER-QUERY RESULTS"}</small><div>${answersHtml}</div></div></section>
    <section class="fx3525-code"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || []).join(", ") || "—"}</small><span>${escapeHtml(text(step.note))}</span></section>
  </section>`;
}

function renderReverseParen1190View(step) {
  const view = step.reverseParen1190View || {};
  const vi = lang === "vi";
  const chars = Array.isArray(view.chars) ? view.chars : [];
  const pairs = Array.isArray(view.pairs) ? view.pairs : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const visited = new Set(Array.isArray(view.visited) ? view.visited : []);
  const output = Array.isArray(view.output) ? view.output : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const direction = view.direction === -1 ? -1 : 1;
  const jump = view.jump || null;
  const pairByIndex = new Map();
  pairs.forEach(([left, right]) => { pairByIndex.set(left, right); pairByIndex.set(right, left); });
  const stackSet = new Set(stack);
  const pairSet = new Set(jump ? [jump.from, jump.to] : []);
  const phase = String(view.phase || "pair");
  const phaseIndex = phase === "done" ? 2 : phase === "walk" ? 1 : 0;
  const stages = [
    vi ? "1 · Ghép ngoặc" : "1 · Match parentheses",
    vi ? "2 · Nhảy + đổi hướng" : "2 · Jump + flip direction",
  ].map((label, index) => `<span class="${phaseIndex > index || phase === "done" ? "done" : phaseIndex === index ? "active" : ""}"><i>${phaseIndex > index || phase === "done" ? "✓" : index + 1}</i><b>${escapeHtml(label)}</b></span>`).join("");
  const cells = chars.map((char, index) => {
    const classes = ["rp1190-cell"];
    if (current === index) classes.push("current");
    if (visited.has(index)) classes.push("visited");
    if (stackSet.has(index)) classes.push("stacked");
    if (pairSet.has(index)) classes.push("jump");
    if (char === "(" || char === ")") classes.push("paren");
    const mate = pairByIndex.get(index);
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(char)}</strong><em>${mate === undefined ? "" : `↔ ${mate}`}</em></span>`;
  }).join("") || `<span class="rp1190-empty">${vi ? "chuỗi rỗng" : "empty string"}</span>`;
  const pairsHtml = pairs.length
    ? pairs.map(([left, right]) => `<span class="${jump && jump.from === left && jump.to === right || jump && jump.from === right && jump.to === left ? "active" : ""}"><b>${left}</b> ↔ <b>${right}</b></span>`).join("")
    : `<span class="rp1190-empty">${vi ? "chưa có cặp" : "no pairs yet"}</span>`;
  const stackHtml = stack.length
    ? [...stack].reverse().map((index, position) => `<span><small>${position === 0 ? "TOP" : ""}</small><b>( [${index}]</b></span>`).join("")
    : `<span class="rp1190-empty">${vi ? "stack rỗng" : "empty stack"}</span>`;
  let action;
  if (view.event === "push") action = vi ? "Mở một cặp: lưu chỉ số '(' lên stack." : "Open a pair: push the '(' index onto the stack.";
  else if (view.event === "match") action = vi ? "Đóng cặp trong cùng: nối hai chỉ số vào pair." : "Close the innermost pair: link both indices in pair.";
  else if (view.event === "jump") action = vi ? `Nhảy từ ${jump?.from} tới ${jump?.to}, rồi đổi chiều.` : `Jump from ${jump?.from} to ${jump?.to}, then flip direction.`;
  else if (view.event === "emit") action = vi ? `Giữ '${chars[current] || ""}' và đi tiếp ${direction === 1 ? "→" : "←"}.` : `Keep '${chars[current] || ""}' and continue ${direction === 1 ? "→" : "←"}.`;
  else if (view.event === "return") action = vi ? "Đã đi hết chuỗi; answer không có ngoặc." : "The walk is complete; answer contains no parentheses.";
  else action = vi ? "Hai lượt duyệt, không cần đảo chuỗi con." : "Two passes; no substring is physically reversed.";
  const heading = phase === "done" ? (vi ? "HOÀN TẤT" : "COMPLETE") : phase === "walk" ? (vi ? "LƯỢT ĐI" : "WALK") : (vi ? "LƯỢT GHÉP" : "PAIRING PASS");
  const summary = vi
    ? `Reverse Parentheses: ${heading.toLowerCase()}, answer hiện tại ${output.join("") || "rỗng"}.`
    : `Reverse Parentheses: ${heading.toLowerCase()}, current answer ${output.join("") || "empty"}.`;

  $("treeView").innerHTML = `<section class="rp1190-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>LEETCODE 1190 · O(n) TIME</small><strong>REVERSE PARENTHESES</strong></div><span>${escapeHtml(heading)}</span></header>
    <section class="rp1190-stages">${stages}</section>
    <section class="rp1190-action"><small>${escapeHtml(String(view.event || "start").toUpperCase())}</small><strong>${escapeHtml(action)}</strong></section>
    <section class="rp1190-panel"><header><strong>s · index</strong><span>${vi ? "mũi tên ↔ = bạn ghép · vàng = vị trí đang xét" : "↔ labels = matching mate · yellow = current position"}</span></header><div class="rp1190-chars">${cells}</div></section>
    <section class="rp1190-lower">
      <section class="rp1190-panel"><header><strong>PAIR MAP</strong><span>${pairs.length} ${vi ? "cặp" : "pair(s)"}</span></header><div class="rp1190-pairs">${pairsHtml}</div></section>
      <section class="rp1190-panel"><header><strong>STACK</strong><span>${vi ? "đỉnh ở bên trái" : "top at left"}</span></header><div class="rp1190-stack">${stackHtml}</div></section>
    </section>
    <section class="rp1190-output"><div><small>${vi ? "HƯỚNG HIỆN TẠI" : "CURRENT DIRECTION"}</small><strong>${direction === 1 ? "→ +1" : "← -1"}</strong></div><div><small>ANSWER</small><strong>${escapeHtml(output.join("") || '""')}</strong></div></section>
  </section>`;
}

