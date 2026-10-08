function requestedVizEsc(value) {
  return escapeHtml(value === null || value === undefined ? "" : String(value));
}

function requestedVizNumber(value) {
  if (typeof value !== "number") return requestedVizEsc(value);
  return requestedVizEsc(Number.isInteger(value) ? value : Number(value.toFixed(4)));
}

function requestedVizPhases(items, activeIndex) {
  return `<div class="rv-phases">${items.map((item, index) => {
    const state = index < activeIndex ? " done" : index === activeIndex ? " active" : "";
    return `<div class="rv-phase${state}"><span>${index < activeIndex ? "✓" : index + 1}</span><b>${requestedVizEsc(item)}</b></div>`;
  }).join("")}</div>`;
}

function requestedVizEmpty(text) {
  return `<div class="rv-empty">${requestedVizEsc(text)}</div>`;
}

function requestedVizSet(html, summary, role = "img") {
  $("treeView").innerHTML = `<div class="requested-viz" role="${role}" aria-label="${requestedVizEsc(summary)}">${html}</div>`;
}

// ─── #2218: Maximum Value of K Coins From Piles ────────────────────────────
function renderCoins2218View(step) {
  const view = step.coins2218View || {};
  const vi = lang === "vi";
  const approach = Number(view.approach) || 1;
  const oneDimensional = approach === 2;
  const phaseIndex = view.phase === "init" || view.phase === "pile" ? 0
    : view.phase === "state" || view.phase === "copy" ? 1 : 2;
  const phases = oneDimensional
    ? (vi
      ? ["Prefix của mỗi pile", "dp → new_dp", "Trả về dp[k]"]
      : ["Prefix each pile", "dp → new_dp", "Return dp[k]"])
    : (vi
      ? ["Prefix của mỗi pile", "So sánh take cho dp[i][j]", "Truy vết đáp án"]
      : ["Prefix each pile", "Compare takes for dp[i][j]", "Reconstruct answer"]);

  const selectedCounts = Array.isArray(view.selectedCounts) ? view.selectedCounts : null;
  const pilesHtml = (view.piles || []).map((pile) => {
    const active = pile.index === view.pileIndex;
    const take = selectedCounts ? (selectedCounts[pile.index] || 0) : active && Number.isInteger(view.bestTake) && view.bestTake >= 0 ? view.bestTake : 0;
    const visibleCoins = pile.coins.slice(0, 12);
    const coinHtml = visibleCoins.map((coin, index) => `<div class="rv-coin${index < take ? " taken" : ""}">
      <small>${index === 0 ? (vi ? "TRÊN" : "TOP") : `#${index + 1}`}</small><b>${requestedVizEsc(coin)}</b>
    </div>`).join("");
    const hidden = pile.coins.length - visibleCoins.length;
    const prefixHtml = pile.prefix.slice(0, 13).map((sum, index) => `<span class="${index === take && active ? "active" : ""}"><small>t=${index}</small><b>${requestedVizEsc(sum)}</b></span>`).join("");
    return `<section class="rv-pile${active ? " active" : ""}">
      <header><b>P${pile.index + 1}</b><span>${vi ? "lấy từ trên xuống" : "take from the top"}</span></header>
      <div class="rv-coin-stack">${coinHtml}${hidden > 0 ? `<em>+${hidden}</em>` : ""}</div>
      <div class="rv-prefix-row">${prefixHtml}</div>
      ${selectedCounts ? `<footer>${vi ? "chọn" : "take"} <strong>${take}</strong> ${vi ? "coin" : "coin(s)"}</footer>` : ""}
    </section>`;
  }).join("");

  const candidatesHtml = (view.candidates || []).length
    ? view.candidates.map((candidate) => `<div class="rv-coin-candidate${candidate.winner ? " winner" : ""}">
        <div class="rv-candidate-take"><small>take</small><strong>${candidate.take}</strong></div>
        <div><small>${vi ? "coin trên cùng" : "top coins"}</small><b>${candidate.coins.length ? candidate.coins.map(requestedVizEsc).join(" + ") : "∅"}</b></div>
        <div class="rv-candidate-formula"><code>${oneDimensional ? `dp[${candidate.sourceCoins}]` : `dp[${view.pileIndex}][${candidate.sourceCoins}]`}</code><span>+</span><code>prefix[${candidate.take}]</code><span>=</span><strong>${requestedVizEsc(candidate.previous)} + ${requestedVizEsc(candidate.pileValue)} = ${requestedVizEsc(candidate.total)}</strong></div>
        <span class="rv-verdict">${candidate.winner ? (vi ? "TỐT NHẤT" : "BEST") : (vi ? "ứng viên" : "candidate")}</span>
      </div>`).join("")
    : requestedVizEmpty(view.phase === "state" ? (vi ? "Trạng thái này chưa có nguồn khả thi." : "This state has no reachable source.") : (vi ? "Chọn một ô DP để xem các phương án take." : "Select a DP state to see its take choices."));

  const sourceKeys = new Set((view.candidates || []).map((candidate) => oneDimensional
    ? `0,${candidate.sourceCoins}`
    : `${view.pileIndex},${candidate.sourceCoins}`));
  const currentKey = Number.isInteger(view.pileIndex) && Number.isInteger(view.used)
    ? (oneDimensional ? `${view.dp.length - 1},${view.used}` : `${view.pileIndex + 1},${view.used}`)
    : "";
  const rowLabels = Array.isArray(view.dpRowLabels) ? view.dpRowLabels : [];
  const dpHtml = Array.isArray(view.dp) && view.dp.length
    ? `<div class="rv-dp-scroll"><table class="rv-dp-table"><thead><tr><th>${oneDimensional ? "array \\ j" : "i \\ j"}</th>${view.dp[0].map((_, index) => `<th>${index}</th>`).join("")}</tr></thead><tbody>${view.dp.map((row, i) => `<tr><th>${oneDimensional ? (rowLabels[i] || `row ${i}`) : (i === 0 ? "0 piles" : `P1..P${i}`)}</th>${row.map((value, j) => {
      const key = `${i},${j}`;
      const classes = [key === currentKey ? "current" : "", sourceKeys.has(key) ? "source" : "", view.phase === "done" && i === view.n && j === view.k ? "answer" : ""].filter(Boolean).join(" ");
      return `<td class="${classes}">${requestedVizEsc(value)}</td>`;
    }).join("")}</tr>`).join("")}</tbody></table></div>`
    : requestedVizEmpty("dp = []");

  const formula = view.phase === "state" && Number.isInteger(view.used)
    ? `<div class="rv-focus-equation"><span>${vi ? "Đang tính" : "Computing"}</span><strong>${oneDimensional ? `new_dp[${view.used}]` : `dp[${view.pileIndex + 1}][${view.used}]`}</strong><span>= max theo take</span><b>${view.bestValue === null ? "−∞" : requestedVizEsc(view.bestValue)}</b></div>`
    : view.phase === "done"
      ? `<div class="rv-focus-equation success"><span>${vi ? "Đúng" : "Exactly"}</span><strong>${view.k} coins</strong><span>${vi ? "giá trị lớn nhất" : "maximum value"}</span><b>${requestedVizEsc(view.answer)}</b></div>`
      : oneDimensional
        ? `<div class="rv-focus-equation"><span>${vi ? "Quy tắc" : "Rule"}</span><strong>new_dp[j]</strong><span>= max(new_dp[j], dp[j−x] + prefix[x])</span></div>`
        : `<div class="rv-focus-equation"><span>${vi ? "Quy tắc" : "Rule"}</span><strong>dp[i][j]</strong><span>= max(dp[i−1][j−t] + prefix[t])</span></div>`;

  requestedVizSet(`${requestedVizPhases(phases, phaseIndex)}
    ${formula}
    <div class="rv-piles">${pilesHtml}</div>
    <div class="rv-two-column rv-coins-workspace">
      <section class="rv-panel"><h4>${vi ? "Các lựa chọn cho pile hiện tại" : "Choices for the current pile"}</h4><div class="rv-candidates">${candidatesHtml}</div></section>
      <section class="rv-panel"><h4>${oneDimensional
        ? (view.dp.length > 1
          ? (vi ? "Hai snapshot O(k) — tím: dp nguồn, vàng: new_dp đích" : "Two O(k) snapshots — purple: source dp, amber: destination new_dp")
          : (vi ? "Trạng thái dp một chiều — O(k) bộ nhớ" : "One-dimensional dp state — O(k) space"))
        : (vi ? "Bảng DP — tím: nguồn, vàng: đích" : "DP table — purple: sources, amber: destination")}</h4>${dpHtml}</section>
    </div>
    ${view.omitted ? `<div class="rv-callout">${vi ? "Trace dài đã được rút gọn; bảng và đáp án vẫn đầy đủ." : "The long trace was shortened; the table and answer are complete."}</div>` : ""}`,
  vi ? `Minh họa bài 2218, cách ${approach}, với ${view.n} pile và k=${view.k}` : `Problem 2218 approach ${approach} with ${view.n} piles and k=${view.k}`);
}

// ─── #9006: BFS shortest path ───────────────────────────────────────────────
function requestedBfsGraph(view) {
  const nodes = view.nodes || [];
  const width = 720;
  const height = 390;
  const cx = width / 2;
  const cy = height / 2;
  const rx = Math.min(285, 48 + nodes.length * 18);
  const ry = Math.min(145, 42 + nodes.length * 9);
  const positions = new Map(nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(1, nodes.length) - Math.PI / 2;
    return [node.id, { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) }];
  }));
  const edges = (view.edges || []).map((edge) => {
    const from = positions.get(edge.u);
    const to = positions.get(edge.v);
    if (!from || !to) return "";
    const cls = edge.path ? "path" : edge.current ? "current" : edge.tree ? "tree" : "";
    return `<line class="rv-bfs-edge ${cls}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />`;
  }).join("");
  const nodeSvg = nodes.map((node) => {
    const pos = positions.get(node.id);
    const classes = ["rv-bfs-node", node.status, node.isStart ? "start" : "", node.isTarget ? "target" : "", node.isNeighbor ? "neighbor" : ""].filter(Boolean).join(" ");
    const shortName = node.name.length > 10 ? `${node.name.slice(0, 9)}…` : node.name;
    return `<g class="${classes}"><title>${requestedVizEsc(node.name)} · d=${node.distance === null ? "∞" : node.distance} · parent=${requestedVizEsc(node.parent || "—")}</title>
      <circle cx="${pos.x}" cy="${pos.y}" r="27" />
      <text class="name" x="${pos.x}" y="${pos.y - 2}" text-anchor="middle">${requestedVizEsc(shortName)}</text>
      <text class="distance" x="${pos.x}" y="${pos.y + 14}" text-anchor="middle">d=${node.distance === null ? "∞" : node.distance}</text>
    </g>`;
  }).join("");
  return `<div class="rv-bfs-graph"><svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${edges}${nodeSvg}</svg></div>`;
}

function renderBfs9006View(step) {
  const view = step.bfs9006View || {};
  const vi = lang === "vi";
  const phaseIndex = view.phase === "init" ? 0
    : ["dequeue", "expanded"].includes(view.phase) ? 1
      : ["inspect", "enqueue"].includes(view.phase) ? 2 : 3;
  const queueHtml = (view.queue || []).length
    ? view.queue.map((item, index) => `<div class="rv-queue-item${index === 0 ? " front" : ""}"><small>${index === 0 ? "FRONT" : `#${index + 1}`}</small><b>${requestedVizEsc(item.name)}</b><span>d=${requestedVizEsc(item.distance)}</span></div>`).join("")
    : requestedVizEmpty(vi ? "Queue rỗng" : "Queue is empty");
  const discovered = (view.nodes || []).filter((node) => node.distance !== null);
  const parentHtml = discovered.map((node) => `<tr class="${node.isCurrent ? "active" : ""}${node.status === "path" ? " path" : ""}">
    <td><b>${requestedVizEsc(node.name)}</b>${node.isStart ? " · S" : node.isTarget ? " · T" : ""}</td>
    <td>${requestedVizEsc(node.distance)}</td><td>${requestedVizEsc(node.parent || "—")}</td><td><span class="rv-state-badge ${requestedVizEsc(node.status)}">${requestedVizEsc(node.status)}</span></td>
  </tr>`).join("");
  let actionText = vi ? "Khởi tạo start ở lớp 0." : "Initialize the start at layer 0.";
  if (view.phase === "dequeue") actionText = vi ? "Lấy FRONT: đây là node gần nhất chưa mở rộng." : "Remove FRONT: this is the closest unexpanded node.";
  else if (view.phase === "inspect" && view.neighbor !== null) actionText = view.reason === "already-discovered"
    ? (vi ? "Neighbor đã có distance → bỏ qua, không đổi parent." : "The neighbor already has a distance → skip and keep its parent.")
    : (vi ? "Neighbor chưa thấy → chuẩn bị gán parent và distance." : "The neighbor is unseen → assign parent and distance next.");
  else if (view.phase === "enqueue") actionText = vi ? "Gắn vào cuối queue; cạnh này thuộc cây BFS." : "Append to the queue; this edge joins the BFS tree.";
  else if (view.phase === "found") actionText = vi ? "Target được dequeue lần đầu → shortest path đã được chứng minh." : "The target is dequeued for the first time → shortest path is proven.";
  else if (view.phase === "expanded") actionText = vi ? "Đã xét xong mọi neighbor; node chuyển thành expanded." : "All neighbors are processed; the node becomes expanded.";
  else if (view.phase === "done") actionText = view.path.length ? `${vi ? "Đi ngược parent" : "Follow parents"}: ${view.path.map(requestedVizEsc).join(" ← ")}` : (vi ? "Queue rỗng trước khi tới target." : "The queue emptied before reaching the target.");

  const pathHtml = view.path && view.path.length
    ? `<div class="rv-path-result"><small>${vi ? "SHORTEST PATH" : "SHORTEST PATH"}</small>${view.path.map((name, index) => `<b>${requestedVizEsc(name)}</b>${index < view.path.length - 1 ? "<span>→</span>" : ""}`).join("")}<em>${view.distance} ${vi ? "cạnh" : "edge(s)"}</em></div>`
    : "";

  requestedVizSet(`${requestedVizPhases(vi ? ["Start + bimap", "Dequeue FIFO", "Xét neighbor", "Dựng path"] : ["Start + bimap", "FIFO dequeue", "Inspect neighbors", "Reconstruct path"], phaseIndex)}
    <div class="rv-action-banner"><b>${requestedVizEsc((view.phase || "state").toUpperCase())}</b><span>${requestedVizEsc(actionText)}</span></div>
    ${pathHtml}
    <div class="rv-two-column rv-bfs-workspace">
      <section class="rv-panel"><h4>${vi ? "Graph — màu thể hiện trạng thái BFS" : "Graph — colors show BFS state"}</h4>${requestedBfsGraph(view)}
        <div class="rv-legend"><span class="queued">${vi ? "trong queue" : "queued"}</span><span class="current">${vi ? "đang mở rộng" : "current"}</span><span class="expanded">expanded</span><span class="path">path</span></div>
      </section>
      <section class="rv-panel rv-bfs-side"><h4>Queue · FRONT → BACK</h4><div class="rv-queue">${queueHtml}</div>
        <h4>distance + parent</h4><div class="rv-table-scroll"><table class="rv-data-table"><thead><tr><th>node</th><th>d</th><th>parent</th><th>state</th></tr></thead><tbody>${parentHtml}</tbody></table></div>
      </section>
    </div>`,
  vi ? `BFS từ ${view.start} tới ${view.target}` : `BFS from ${view.start} to ${view.target}`);
}

// ─── #9001: lazy max-heap profit tracker ────────────────────────────────────
function renderProfitTracker9001View(step) {
  const view = step.profitTrackerView || {};
  const vi = lang === "vi";
  if (view.invalid) {
    requestedVizSet(`<div class="rv-error-card"><strong>${vi ? "Input chưa hợp lệ" : "Invalid input"}</strong><span>${requestedVizEsc(step.note ? pick(step.note) : "")}</span></div>`, vi ? "Input bài 9001 không hợp lệ" : "Invalid input for problem 9001");
    return;
  }
  const action = view.action || {};
  const phaseIndex = ["init", "read", "branch", "update"].includes(view.phase) ? 0
    : view.phase === "push" ? 1
      : ["query", "compare", "pop"].includes(view.phase) ? 2 : 3;
  const operationsHtml = (view.operations || []).map((operation, index) => {
    const state = index < view.activeIndex || view.activeIndex >= view.operations.length ? "done" : index === view.activeIndex ? "active" : "";
    const detail = operation.op === "U" ? `${operation.name} ${operation.delta >= 0 ? "+" : ""}${operation.delta}` : (vi ? "đọc max" : "peek max");
    return `<div class="rv-op ${state}"><small>${index}</small><b>${requestedVizEsc(operation.op)}</b><span>${requestedVizEsc(detail)}</span></div>`;
  }).join("");
  const totalsHtml = (view.totals || []).length
    ? view.totals.map((entry) => `<div class="rv-kv-row"><span>${requestedVizEsc(entry.name)}</span><strong>${requestedVizEsc(entry.total)}</strong></div>`).join("")
    : requestedVizEmpty(vi ? "Chưa có total" : "No totals yet");
  const levels = new Map();
  for (const entry of view.heap || []) {
    if (!levels.has(entry.level)) levels.set(entry.level, []);
    levels.get(entry.level).push(entry);
  }
  const heapHtml = levels.size
    ? [...levels.entries()].map(([level, entries]) => `<div class="rv-heap-level"><small>LEVEL ${level}</small><div>${entries.map((entry) => `<article class="rv-heap-node${entry.root ? " root" : ""}${entry.current ? " current" : " stale"}${entry.focused ? " focused" : ""}">
      <header><span>[${entry.index}]${entry.root ? " ROOT" : ""}</span><b>${entry.current ? "CURRENT" : "STALE"}</b></header>
      <strong>${requestedVizEsc(entry.name)}</strong><em>profit = ${requestedVizEsc(entry.profit)}</em><code>${requestedVizEsc(entry.key)}</code>
      <footer>${entry.parentIndex === null ? (vi ? "không có parent" : "no parent") : `parent [${entry.parentIndex}]`}</footer>
    </article>`).join("")}</div></div>`).join("")
    : requestedVizEmpty("heap = []");
  let actionHtml = vi ? "Đọc trạng thái hiện tại." : "Read the current state.";
  if (action.type === "update") actionHtml = `${action.name}: ${action.oldTotal} + (${action.delta}) = ${action.newTotal}`;
  else if (action.type === "push") actionHtml = `${vi ? "Đổi max thành min-heap key" : "Convert max to min-heap key"}: ${action.profit} → ${action.storedPriority} → heappush`;
  else if (action.type === "compare") actionHtml = `root ${action.name}:${action.heapProfit} ${action.current ? "=" : "≠"} totals[${action.name}]:${action.actualProfit} → ${action.current ? "CURRENT" : "STALE"}`;
  else if (action.type === "pop") actionHtml = `POP STALE ${action.name}:${action.profit}`;
  else if (action.type === "answer") actionHtml = action.name === null ? "heap=[] → append None" : `PEEK root → ${action.name}:${action.profit} (${vi ? "giữ lại root" : "keep root"})`;
  else if (action.type === "branch") actionHtml = `op == 'U' → ${String(action.branch).toUpperCase()}`;
  else if (action.type === "return") actionHtml = "return res";
  const results = (view.result || []).length
    ? view.result.map((name, index) => `<span><small>Q${index + 1}</small><b>${requestedVizEsc(name === null ? "None" : name)}</b></span>`).join("")
    : requestedVizEmpty("res = []");

  requestedVizSet(`${requestedVizPhases(vi ? ["Cập nhật totals", "Push snapshot", "Dọn stale root", "Peek winner"] : ["Update totals", "Push snapshot", "Clean stale root", "Peek winner"], phaseIndex)}
    <div class="rv-op-strip">${operationsHtml}</div>
    <div class="rv-action-banner"><b>${requestedVizEsc((view.phase || "state").toUpperCase())}</b><span>${requestedVizEsc(actionHtml)}</span></div>
    <div class="rv-two-column rv-profit-workspace">
      <section class="rv-panel"><h4>totals · ${vi ? "nguồn dữ liệu đúng" : "source of truth"}</h4>${totalsHtml}<div class="rv-callout compact">${requestedVizEsc(pick(view.tieRule))}</div></section>
      <section class="rv-panel"><h4>heap · ${vi ? "cây theo index" : "index-based tree"}</h4><div class="rv-heap-tree">${heapHtml}</div></section>
    </div>
    <section class="rv-results"><h4>res · ${vi ? "chỉ thêm khi Query" : "one item per Query"}</h4><div>${results}</div></section>
    <div class="rv-legend"><span class="current">CURRENT = ${vi ? "khớp totals" : "matches totals"}</span><span class="stale">STALE = ${vi ? "snapshot cũ" : "old snapshot"}</span><span class="root">ROOT = ${vi ? "ứng viên max" : "max candidate"}</span></div>`,
  vi ? "Minh họa profit tracker bằng hash map và lazy heap" : "Profit tracker with a source-of-truth map and lazy heap");
}

// ─── #9013: perfect-square arrangement ─────────────────────────────────────
function requestedSquareGraph(view) {
  const nodes = view.nodes || [];
  const width = 680;
  const height = 410;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(158, 60 + nodes.length * 7);
  const positions = new Map(nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(1, nodes.length) - Math.PI / 2;
    return [node.value, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }];
  }));
  const edges = (view.edges || []).map((edge) => {
    const a = positions.get(edge.u);
    const b = positions.get(edge.v);
    if (!a || !b) return "";
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    return `<g class="rv-square-edge${edge.inPath ? " path" : ""}${edge.current ? " current" : ""}"><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><rect x="${mx - 13}" y="${my - 9}" width="26" height="18" rx="6"/><text x="${mx}" y="${my + 4}" text-anchor="middle">${edge.sum}</text></g>`;
  }).join("");
  const nodeSvg = nodes.map((node) => {
    const p = positions.get(node.value);
    const focus = node.value === view.focus;
    return `<g class="rv-square-node ${requestedVizEsc(node.state)}${focus ? " focus" : ""}"><circle cx="${p.x}" cy="${p.y}" r="22"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle">${node.value}</text></g>`;
  }).join("");
  return `<div class="rv-square-graph"><svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${edges}${nodeSvg}</svg></div>`;
}

function renderSquare9013View(step) {
  const view = step.square9013View || {};
  const vi = lang === "vi";
  const phaseIndex = view.phase === "graph" ? 0 : ["start", "choose", "try"].includes(view.phase) ? 1 : ["dead-end", "backtrack"].includes(view.phase) ? 2 : 3;
  const pathHtml = (view.path || []).length
    ? view.path.map((value, index) => {
      const next = view.path[index + 1];
      return `<div class="rv-path-node"><b>${value}</b><small>depth ${index + 1}</small></div>${next ? `<div class="rv-path-link"><span>+</span><strong>${value + next}=${Math.sqrt(value + next)}²</strong><span>→</span></div>` : ""}`;
    }).join("")
    : requestedVizEmpty(vi ? "Path đang rỗng" : "The path is empty");
  const candidates = (view.candidates || []).length
    ? view.candidates.map((value) => `<span class="rv-candidate-chip${value === view.attempted ? " active" : ""}"><b>${value}</b><small>${view.focus ? `${view.focus}+${value}=${view.focus + value}` : "legal"}</small></span>`).join("")
    : requestedVizEmpty(vi ? "Không có legal-next" : "No legal next node");
  let action = vi ? "Dựng cạnh khi tổng là số chính phương." : "Create an edge when the sum is a perfect square.";
  if (view.phase === "choose") action = vi ? "Đưa node vào recursion path và khóa node đó." : "Push the node onto the recursion path and mark it used.";
  else if (view.phase === "try") action = vi ? "Cạnh hợp lệ; đi sâu thêm một level." : "The edge is legal; recurse one level deeper.";
  else if (view.phase === "dead-end") action = vi ? "Path chưa đủ n nhưng không còn neighbor → nhánh thất bại." : "The path is incomplete and has no unused neighbor → branch failure.";
  else if (view.phase === "backtrack") action = vi ? "Bỏ lựa chọn cuối và thử candidate kế tiếp ở level trước." : "Remove the last choice and try the next candidate at the previous level.";
  else if (view.phase === "done") action = view.solution ? (vi ? "Đã dùng mỗi số đúng một lần." : "Every number is used exactly once.") : (vi ? "Không còn nhánh hợp lệ." : "No legal branch remains.");

  requestedVizSet(`${requestedVizPhases(vi ? ["Compatibility graph", "DFS chọn node", "Dead end + backtrack", "Arrangement"] : ["Compatibility graph", "DFS choices", "Dead end + backtrack", "Arrangement"], phaseIndex)}
    <div class="rv-action-banner"><b>${requestedVizEsc((view.phase || "state").toUpperCase())}</b><span>${requestedVizEsc(action)}</span></div>
    <div class="rv-square-stats"><span><small>${vi ? "đã thử" : "attempts"}</small><b>${view.attempts || 0}</b></span><span><small>backtracks</small><b>${view.backtracks || 0}</b></span><span><small>depth</small><b>${(view.path || []).length}/${view.n}</b></span>${view.omitted ? `<span><small>${vi ? "state ẩn" : "hidden states"}</small><b>${view.omitted}</b></span>` : ""}</div>
    <section class="rv-panel"><h4>${vi ? "Path hiện tại — mỗi connector chứng minh tổng square" : "Current path — every connector proves a square sum"}</h4><div class="rv-square-path">${pathHtml}</div></section>
    <div class="rv-two-column rv-square-workspace">
      <section class="rv-panel"><h4>${vi ? "Compatibility graph (nhãn cạnh = tổng)" : "Compatibility graph (edge label = sum)"}</h4>${requestedSquareGraph(view)}</section>
      <section class="rv-panel"><h4>${vi ? "Legal-next, sắp theo degree nhỏ trước" : "Legal next nodes, low degree first"}</h4><div class="rv-candidate-chips">${candidates}</div>
        <div class="rv-callout compact">${vi ? "Màu xanh: đang ở path · vàng: đang thử · đỏ: dead end/backtrack" : "Green: on path · amber: trying · red: dead end/backtrack"}</div>
      </section>
    </div>`,
  vi ? `Backtracking square arrangement n=${view.n}` : `Square-arrangement backtracking for n=${view.n}`);
}

// ─── #9014: loyal customers ─────────────────────────────────────────────────
function renderLoyal9014View(step) {
  const view = step.loyal9014View || {};
  const vi = lang === "vi";
  const operation = view.operation || view.phase;
  const phaseIndex = view.phase === "init" ? 0 : view.phase === "ingest" ? 1 : view.phase === "evaluate" ? 2 : 3;
  const allRecords = view.records || [];
  const allUsers = view.users || [];
  const activeRow = allUsers.find((row) => row.user === view.activeUser);
  const answer = Array.isArray(view.answer) ? view.answer : [];
  const operations = {
    import: ["Nạp thư viện", "Import"], call: ["Nhận hai daily logs", "Read two daily logs"], "per-day-init": ["Tạo Set cho từng ngày", "Initialize daily sets"], "all-videos-init": ["Tạo tập video distinct", "Initialize distinct video sets"],
    "day-loop": ["Đọc ngày tiếp theo", "Read next day"], "record-loop": ["Đọc record", "Read record"], "per-day-add": ["Thêm video vào Set của ngày", "Add video to daily set"], "union-add": ["Thêm video vào union Set", "Add video to union set"],
    "answer-init": ["Tạo kết quả", "Initialize result"], "user-loop": ["Xét user", "Evaluate user"], "check-days": ["Kiểm tra cả hai ngày", "Check both days"], "check-distinct": ["Kiểm tra video distinct", "Check distinct videos"],
    "loyal-check": ["Xác định loyal customer", "Decide loyal customer"], "answer-append": ["Thêm user vào answer", "Add user to answer"], return: ["Trả loyal customers", "Return loyal customers"],
  };
  const dayColumn = (day) => {
    const records = allRecords.filter((record) => record.day === day);
    const done = records.filter((record) => record.state === "done").length;
    const currentIndex = view.current?.day === day ? records.findIndex((record) => record.index === view.current.index) : -1;
    const start = Math.max(0, Math.min(currentIndex < 0 ? Math.max(0, done - 3) : currentIndex - 1, records.length - 3));
    const recordHtml = (record) => {
      const active = record.day === view.current?.day && record.index === view.current?.index;
      return `<article class="rv-loyal-record${active ? " active" : ""}${record.state === "done" ? " done" : ""}"><small>#${record.index + 1}</small><b>${requestedVizEsc(record.user)}</b><span>→</span><em>${requestedVizEsc(record.video)}</em></article>`;
    };
    return `<section class="rv-loyal-day${view.activeDay === day ? " active" : ""}"><header><b>${vi ? "NGÀY" : "DAY"} ${day + 1}</b><span>${done}/${records.length}</span></header><div>${records.slice(start, start + 3).map(recordHtml).join("")}</div>${records.length > 3 ? `<details><summary>${vi ? "Xem đủ" : "View all"} ${records.length} records</summary>${records.map(recordHtml).join("")}</details>` : ""}</section>`;
  };
  const videoChips = (videos) => videos.map((video) => `<span class="${view.current?.video === video ? "current" : ""}">${requestedVizEsc(video)}</span>`).join("") || `<em>∅</em>`;
  const videoSet = (label, videos, focus) => `<section class="rv-loyal-set${focus ? " focus" : ""}"><header><small>${label}</small><b>${videos.length}</b></header><div class="rv-loyal-videos">${videoChips(videos.slice(0, 8))}</div>${videos.length > 8 ? `<details><summary>+${videos.length - 8} videos</summary><div class="rv-loyal-videos">${videoChips(videos.slice(8))}</div></details>` : ""}</section>`;
  const statusText = (value) => value === true ? "PASS" : value === false ? "FAIL" : vi ? "CHƯA XÉT" : "PENDING";
  const condition = (label, value, detail, focus) => `<div class="rv-loyal-condition${focus ? " focus" : ""}"><div><b>${label}</b><small>${detail}</small></div><span class="${value === true ? "pass" : value === false ? "fail" : "pending"}">${statusText(value)}</span></div>`;
  const reasonText = (row) => row.reason === "missing-day" ? (vi ? "Thiếu ít nhất một ngày" : "Missing at least one day") : row.reason === "needs-two-distinct" ? (vi ? "Chưa đủ 2 video distinct" : "Fewer than 2 distinct videos") : row.qualifies === true ? (vi ? "Đạt cả hai điều kiện" : "Both conditions passed") : (vi ? "Chưa kết luận" : "Not decided yet");
  const userCard = (row, focused) => `<article class="rv-loyal-user${focused ? " active" : ""}"><header><b>${requestedVizEsc(row.user)}</b><span class="${row.qualifies === true ? "pass" : row.qualifies === false ? "fail" : "pending"}">${row.qualifies === true ? "LOYAL" : row.qualifies === false ? (vi ? "KHÔNG ĐẠT" : "NOT LOYAL") : vi ? "ĐANG XÉT" : "IN PROGRESS"}</span></header>
    <div class="rv-loyal-sets">${videoSet(vi ? "Ngày 1" : "Day 1", row.day1 || [], focused && operation === "per-day-add" && view.activeDay === 0)}${videoSet(vi ? "Ngày 2" : "Day 2", row.day2 || [], focused && operation === "per-day-add" && view.activeDay === 1)}${videoSet("Union distinct", row.union || [], focused && operation === "union-add")}</div>
    <div class="rv-loyal-checks">${condition(vi ? "Có mặt cả hai ngày" : "Present on both days", row.presentBoth, `day1: ${row.day1.length} · day2: ${row.day2.length}`, focused && operation === "check-days")}${condition(vi ? "Ít nhất 2 video distinct" : "At least 2 distinct videos", row.distinctEnough, `|union| = ${row.distinctCount}`, focused && operation === "check-distinct")}
      <div class="rv-loyal-decision${focused && operation === "loyal-check" ? " focus" : ""}"><small>${vi ? "Kết luận" : "Decision"}</small><b>${reasonText(row)}</b></div></div></article>`;
  const activeCard = activeRow ? userCard(activeRow, true) : `<div class="rv-loyal-idle">${view.phase === "evaluate" ? (vi ? "Sẵn sàng kiểm tra từng user." : "Ready to evaluate each user.") : (vi ? "User và các Set xuất hiện khi bắt đầu xử lý record." : "User sets appear when records are processed.")}</div>`;
  const answerChips = (users) => users.map((user) => `<span class="${operation === "answer-append" && user === view.activeUser ? "current" : ""}"><b>${requestedVizEsc(user)}</b></span>`).join("") || `<em>${vi ? "Chưa có loyal customer" : "No loyal customers yet"}</em>`;
  const answerPanel = `<section class="rv-panel rv-loyal-answer${operation === "answer-append" ? " focus" : ""}${view.phase === "done" ? " done" : ""}"><header><h4>${view.phase === "done" ? (vi ? "Loyal customers cuối cùng" : "Final loyal customers") : (vi ? "Đã thêm vào answer" : "Appended to answer")}</h4><b>${answer.length}</b></header><div class="rv-loyal-answer-users">${answerChips(answer.slice(0, 8))}</div>${answer.length > 8 ? `<details><summary>+${answer.length - 8} users</summary><div class="rv-loyal-answer-users">${answerChips(answer.slice(8))}</div></details>` : ""}</section>`;
  const reviewed = allUsers.filter((row) => row.qualifies !== null && row.qualifies !== undefined);
  const review = `<details class="rv-loyal-review"><summary>${vi ? "Xem các user đã kiểm tra" : "View evaluated users"} · ${reviewed.length}</summary><div>${reviewed.map((row) => userCard(row, false)).join("")}</div></details>`;
  requestedVizSet(`<div class="rv-loyal-9014 phase-${requestedVizEsc(view.phase || "init")}">
    ${requestedVizPhases(vi ? ["Đọc logs", "Cập nhật Set", "Kiểm tra", "Kết quả"] : ["Read logs", "Update sets", "Evaluate", "Results"], phaseIndex)}
    <div class="rv-action-banner"><small>${vi ? "DÒNG" : "LINE"} ${step.codeLines?.[0] || "—"}</small><b>${requestedVizEsc(operations[operation]?.[vi ? 0 : 1] || operation)}</b></div>
    <div class="rv-loyal-summary"><span><small>${vi ? "Đã đọc" : "Processed"}</small><b>${view.processed || 0}<em> / ${allRecords.length}</em></b></span><span><small>Users</small><b>${allUsers.length}</b></span><span><small>Loyal</small><b>${answer.length}</b></span><span><small>${vi ? "Ngày đang đọc" : "Current day"}</small><b>${Number.isInteger(view.activeDay) ? view.activeDay + 1 : "—"}</b></span></div>
    ${phaseIndex < 2 ? `<section class="rv-panel rv-loyal-logs"><h4>${vi ? "Hai daily logs" : "Two daily logs"}</h4><div class="rv-loyal-days">${dayColumn(0)}${dayColumn(1)}</div></section>` : ""}
    ${view.current ? `<div class="rv-loyal-current"><small>${vi ? "Record hiện tại" : "Current record"} · ${vi ? "ngày" : "day"} ${view.current.day + 1} · #${view.current.index + 1}</small><b>${requestedVizEsc(view.current.user)} <span>→</span> ${requestedVizEsc(view.current.video)}</b><code>${operation === "per-day-add" ? `day${view.current.day + 1}.add(${requestedVizEsc(view.current.video)})` : operation === "union-add" ? `union.add(${requestedVizEsc(view.current.video)})` : vi ? "Chưa cập nhật Set tại dòng này" : "No set update on this instruction"}</code></div>` : ""}
    ${view.phase !== "done" ? activeCard : ""}
    ${phaseIndex >= 2 ? `${answerPanel}${reviewed.length ? review : ""}` : ""}
    <footer class="rv-loyal-rule"><b>${vi ? "Cả hai ngày AND distinct ≥ 2" : "Both days AND distinct ≥ 2"}</b><span>${vi ? "Video lặp chỉ được đếm một lần trong Set." : "Repeated videos count once in a set."}</span></footer></div>`,
  vi ? "Lọc khách trung thành từ hai daily logs" : "Filter loyal customers from two daily logs", "group");
}

// ─── #9015: interval sweep line ─────────────────────────────────────────────
function renderSweep9015View(step) {
  const view = step.sweep9015View || {};
  const vi = lang === "vi";
  const line = step.codeLines?.[0];
  const operation = view.operation || view.phase;
  const sweeping = ["start", "end"].includes(view.phase);
  const sorted = sweeping || view.phase === "done" || Number(line) >= 6;
  const phaseIndex = view.phase === "done" ? 3 : sweeping ? 2 : sorted ? 1 : 0;
  const allIntervals = view.intervals || [];
  const values = allIntervals.flatMap((interval) => [interval.start, interval.end]);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const pct = (value) => max === min ? 50 : ((value - min) / (max - min)) * 100;
  const orderedIntervals = [...allIntervals.filter((interval) => interval.current), ...allIntervals.filter((interval) => !interval.current && interval.active), ...allIntervals.filter((interval) => !interval.current && !interval.active)];
  const visibleIntervals = allIntervals.length <= 8 ? allIntervals : orderedIntervals.slice(0, 8);
  const track = (interval) => {
    const left = pct(interval.start);
    const width = pct(interval.end) - left;
    return `<div class="rv-sweep-lane${interval.active ? " active" : ""}${interval.current ? " current" : ""}"><div><b>#${interval.id}</b><small>[${requestedVizNumber(interval.start)}, ${requestedVizNumber(interval.end)}]</small></div><div class="rv-sweep-plot"><span class="rv-sweep-segment${interval.start === interval.end ? " point" : ""}" style="left:${left}%;width:${width}%"></span>${view.currentEvent ? `<i class="rv-sweep-line" style="left:${pct(view.currentEvent.time)}%"></i>` : ""}</div></div>`;
  };
  const tracks = visibleIntervals.map(track).join("");
  const allEvents = view.events || [];
  const eventIndex = Number.isInteger(view.eventIndex) ? view.eventIndex : -1;
  const eventStart = Math.max(0, Math.min(eventIndex < 0 ? allEvents.length - 6 : eventIndex - 2, allEvents.length - 6));
  const events = allEvents.slice(eventStart, eventStart + 6).map((event, offset) => {
    const state = ["done", "current"].includes(event.state) ? event.state : "pending";
    return `<div class="rv-sweep-event ${state} ${event.kind}"><header><small>#${eventStart + offset + 1}</small><b>${event.kind.toUpperCase()}</b></header><strong>t=${requestedVizNumber(event.time)}</strong><span>interval #${event.id}</span></div>`;
  }).join("");
  const before = view.activeBefore || [];
  const after = view.activeAfter || [];
  const newPairs = view.newPairs || [];
  const operations = {
    call: ["Nhận intervals", "Read intervals"], "events-init": ["Tạo event queue", "Initialize event queue"], "interval-loop": ["Đọc interval", "Read interval"], "append-start": ["Thêm START", "Append START"], "append-end": ["Thêm END", "Append END"],
    "sort-events": ["Sắp xếp events", "Sort events"], "active-init": ["Tạo active set", "Initialize active set"], "pairs-init": ["Đặt pairs = 0", "Initialize pairs"], "peak-init": ["Đặt peak = 0", "Initialize peak"],
    "event-loop": ["Đọc event", "Read event"], "start-check": ["Kiểm tra START", "Check START"], "count-overlaps": ["Cộng overlap pairs", "Count overlap pairs"], "active-add": ["Thêm interval vào set", "Add interval to set"], "peak-update": ["Cập nhật peak", "Update peak"],
    else: ["Xử lý END", "Process END"], "active-remove": ["Xóa interval khỏi set", "Remove interval from set"], return: ["Trả pairs và peak", "Return pairs and peak"],
  };
  const ready = (initLine) => sweeping || view.phase === "done" || !view.operation || Number(line) >= initLine;
  const chips = (ids) => ids.map((id) => `<span class="${view.currentEvent?.id === id ? "current" : ""}">#${id}</span>`).join("") || `<em>∅</em>`;
  const pairChips = (pairs) => pairs.map(([a, b]) => `<span>#${a} ↔ #${b}</span>`).join("");
  const result = view.phase === "done" ? `<section class="rv-panel rv-sweep-result"><h4>${vi ? "Kết quả sweep line" : "Sweep-line result"}</h4><div><span><b>${view.overlapPairs}</b><small>${vi ? "cặp interval giao nhau" : "overlapping interval pairs"}</small></span><span><b>${view.maxActive}</b><small>${vi ? "interval cùng active tối đa" : "maximum active intervals"}</small></span></div></section>` : "";
  let action = "";
  if (view.currentEvent) {
    const event = view.currentEvent;
    const counted = ["count-overlaps", "active-add", "peak-update"].includes(operation);
    const detail = operation === "count-overlaps" ? `${view.overlapPairs - before.length} + ${before.length} = ${view.overlapPairs}`
      : operation === "active-add" ? `active.add(#${event.id}) · ${before.length} → ${after.length}`
        : operation === "active-remove" ? `active.remove(#${event.id}) · ${before.length} → ${after.length}`
          : operation === "peak-update" ? `peak = max(peak, ${after.length}) → ${view.maxActive}`
            : event.kind === "start" ? (vi ? `Sẽ cộng ${before.length} pair từ active set trước event.` : `Will add ${before.length} pairs from the set before this event.`)
              : (vi ? "END không tạo pair mới." : "END creates no new pairs.");
    action = `<section class="rv-panel rv-sweep-work"><div class="rv-sweep-current ${event.kind}"><span><small>${event.kind.toUpperCase()} · #${event.id}</small><b>t=${requestedVizNumber(event.time)}</b></span><div class="${operation === "count-overlaps" ? "focus" : ""}"><small>${vi ? "Thao tác tại dòng hiện tại" : "Current instruction"}</small><strong>${requestedVizEsc(detail)}</strong></div></div>
      <div class="rv-sweep-sets"><section class="${["active-add", "active-remove"].includes(operation) ? "focus" : ""}"><h4>active set · ${after.length}</h4><div class="rv-sweep-chips">${chips(after.slice(0, 8))}</div>${after.length > 8 ? `<details><summary>+${after.length - 8} intervals</summary><div class="rv-sweep-chips">${chips(after.slice(8))}</div></details>` : ""}<small>${vi ? "Trước event" : "Before event"}: {${before.map((id) => `#${id}`).join(", ") || "∅"}}</small></section>
      <section class="${operation === "count-overlaps" ? "focus" : ""}"><h4>${vi ? "Pair mới" : "New pairs"} · ${newPairs.length}</h4><div class="rv-sweep-chips pairs">${newPairs.length ? pairChips(newPairs.slice(0, 6)) : `<em>${event.kind === "start" && !counted ? (vi ? "Chưa cộng pairs" : "Pairs not counted yet") : (vi ? "Không có pair mới" : "No new pairs")}</em>`}</div>${newPairs.length > 6 ? `<details><summary>+${newPairs.length - 6} pairs</summary><div class="rv-sweep-chips pairs">${pairChips(newPairs.slice(6))}</div></details>` : ""}</section></div></section>`;
  }
  requestedVizSet(`<div class="rv-sweep-9015 phase-${requestedVizEsc(view.phase || "init")}">
    ${requestedVizPhases(vi ? ["Tạo events", "Sắp xếp", "Quét", "Kết quả"] : ["Build events", "Sort", "Sweep", "Results"], phaseIndex)}
    <div class="rv-action-banner"><small>${vi ? "DÒNG" : "LINE"} ${line || "—"}</small><b>${requestedVizEsc(operations[operation]?.[vi ? 0 : 1] || operation)}</b></div>
    <div class="rv-sweep-summary"><span class="${operation === "count-overlaps" ? "focus" : ""}"><small>Pairs</small><b>${ready(8) ? view.overlapPairs : "—"}</b></span><span class="${["active-add", "active-remove"].includes(operation) ? "focus" : ""}"><small>Active</small><b>${ready(7) ? after.length : "—"}</b></span><span class="${operation === "peak-update" ? "focus" : ""}"><small>Peak</small><b>${ready(9) ? view.maxActive : "—"}</b></span><span><small>${vi ? "Thời điểm" : "Time"}</small><b>${view.currentEvent ? requestedVizNumber(view.currentEvent.time) : "—"}</b></span></div>
    ${result}
    <section class="rv-panel rv-sweep-timeline"><h4>Timeline · ${allIntervals.length} intervals</h4><div class="rv-sweep-axis"><small>${vi ? "Interval" : "Interval"}</small><div><span>${requestedVizNumber(min)}</span><span>${requestedVizNumber(max)}</span></div></div>${tracks}${allIntervals.length > visibleIntervals.length ? `<details class="rv-sweep-more"><summary>+${allIntervals.length - visibleIntervals.length} ${vi ? "intervals khác" : "more intervals"}</summary>${allIntervals.filter((interval) => !visibleIntervals.includes(interval)).map(track).join("")}</details>` : ""}<footer>${vi ? "Xanh dương: đang xét · Xanh lá: active · Chấm tròn: có tính endpoint" : "Blue: current · Green: active · Dots: endpoints included"}</footer></section>
    ${view.phase !== "done" ? `<section class="rv-panel rv-sweep-queue"><header><h4>${sorted ? (vi ? "Event queue đã sắp xếp" : "Sorted event queue") : (vi ? "Events đang tạo" : "Events being built")}</h4><small>${allEvents.length ? `${eventStart + 1}–${Math.min(eventStart + 6, allEvents.length)} / ${allEvents.length}` : "0"}</small></header><div class="rv-sweep-events">${events || `<em>${vi ? "Chưa có event" : "No events yet"}</em>`}</div></section>${action}` : ""}
    <footer class="rv-sweep-rule"><b>${vi ? "Cùng thời điểm: START → END" : "Equal time: START → END"}</b><span>${vi ? "[a, b] và [b, c] vẫn giao nhau tại b." : "[a, b] and [b, c] overlap at b."}</span></footer></div>`,
  vi ? "Sweep line đếm overlap của closed intervals" : "Sweep line counting closed-interval overlaps", "group");
}

// ─── #9016: movie-history friends ───────────────────────────────────────────
function renderFriends9016View(step) {
  const view = step.friends9016View || {};
  const vi = lang === "vi";
  const phaseIndex = view.phase === "init" ? 0 : view.phase === "index" ? 1 : view.phase === "evaluate" ? 2 : 3;
  const activeRow = (view.pairs || []).find((pair) => view.activePair && pair.a === view.activePair[0] && pair.b === view.activePair[1]);
  const matchPositions = new Set(activeRow ? activeRow.positions : []);
  const activeUsers = new Set(view.activePair || []);
  const allHistories = view.histories || [];
  const prioritizedHistories = activeUsers.size
    ? [...allHistories.filter((history) => activeUsers.has(history.index)), ...allHistories.filter((history) => !activeUsers.has(history.index))]
    : [...allHistories.filter((history) => history.active), ...allHistories.filter((history) => !history.active)];
  const visibleHistories = prioritizedHistories.slice(0, view.phase === "evaluate" && activeUsers.size ? 2 : 6);
  const histories = visibleHistories.map((history) => {
    const older = history.olderCount || 0;
    return `<article class="rv-history${history.active ? " active" : ""}${activeUsers.has(history.index) ? " comparing" : ""}" data-history-index="${history.index}">
      <header><b>${requestedVizEsc(history.user)}</b><small>${history.active ? (vi ? "ĐANG ĐỌC" : "READING") : activeUsers.has(history.index) ? (vi ? "SO SÁNH" : "COMPARING") : older ? `+${older} ${vi ? "phim cũ" : "older movies"}` : `last ${view.k}`}</small></header>
      <div style="--rv-friend-cols:${Math.max(1, Math.min(5, history.window.length))}">${history.window.map((movie, position) => `<span class="${activeUsers.has(history.index) && matchPositions.has(position) ? "match" : ""}${history.activePosition === position ? " current" : ""}" title="pos ${position}: ${requestedVizEsc(movie)}"><small>#${position}</small><b>${requestedVizEsc(movie)}</b></span>`).join("") || `<em>${vi ? "Chưa cắt window" : "Window not sliced yet"}</em>`}</div>
    </article>`;
  }).join("");
  const allBuckets = view.buckets || [];
  const activeBucketIndex = view.activeBucket
    ? allBuckets.findIndex((bucket) => bucket.position === view.activeBucket.position && bucket.movie === view.activeBucket.movie)
    : -1;
  const bucketStart = activeBucketIndex >= 0 ? Math.max(0, Math.min(activeBucketIndex - 2, allBuckets.length - 5)) : Math.max(0, allBuckets.length - 5);
  const visibleBuckets = allBuckets.slice(bucketStart, bucketStart + 5);
  const buckets = visibleBuckets.map((bucket) => {
    const active = view.activeBucket && bucket.position === view.activeBucket.position && bucket.movie === view.activeBucket.movie;
    return `<div class="rv-index-bucket${active ? " active" : ""}" data-position="${bucket.position}" data-movie="${requestedVizEsc(bucket.movie)}"><code>(${bucket.position}, ${requestedVizEsc(bucket.movie)})</code><span>→</span><b>[${bucket.users.map(requestedVizEsc).join(", ")}]</b></div>`;
  }).join("");
  const visiblePairs = (view.pairs || []).slice(0, view.phase === "done" ? 6 : 1);
  const checked = ["threshold-check", "answer-append", "sort-and-return"].includes(view.operation) || !view.operation;
  const pairs = visiblePairs.map((pair) => `<article class="rv-friend-pair${view.activePair && pair.a === view.activePair[0] && pair.b === view.activePair[1] ? " active" : ""}${checked ? pair.qualifies ? " pass" : " fail" : " pending"}">
    <div><b>${requestedVizEsc(pair.left)}</b><span>↔</span><b>${requestedVizEsc(pair.right)}</b></div><strong>${pair.count}<em> / ${view.k}</em></strong><small>${vi ? "Vị trí khớp" : "Matched positions"}: ${pair.positions.length ? pair.positions.join(", ") : "—"}</small><span class="rv-pass-badge ${checked ? pair.qualifies ? "yes" : "no" : "pending"}">${checked ? pair.qualifies ? `PASS ≥ ${view.m}` : `FAIL < ${view.m}` : vi ? "CHỜ KIỂM TRA" : "AWAITING CHECK"}</span>
    <div class="rv-friend-match-meter" aria-label="${pair.count} / ${view.k}">${Array.from({ length: view.k }, (_, position) => `<i class="${matchPositions.has(position) ? "match" : ""}">${position}</i>`).join("")}</div>
  </article>`).join("");
  const allResults = view.phase === "done" && Array.isArray(view.answer) ? view.answer : view.results || [];
  const visibleResults = allResults.slice(0, 8);
  const result = visibleResults.length ? visibleResults.map((pair) => `<span><b>${requestedVizEsc(pair[0])}</b> ↔ <b>${requestedVizEsc(pair[1])}</b></span>`).join("") : requestedVizEmpty(vi ? "Chưa có pair đạt ngưỡng" : "No qualifying pair yet");
  const historyOmitted = Math.max(0, allHistories.length - visibleHistories.length);
  const bucketOmitted = Math.max(0, allBuckets.length - visibleBuckets.length) + (view.omittedBuckets || 0);
  const resultOmitted = Math.max(0, allResults.length - visibleResults.length) + (allResults === view.answer ? 0 : view.omittedResults || 0);
  const stage = view.phase === "index"
    ? `<section class="rv-panel rv-friend-stage"><h4>${vi ? "Index theo (vị trí, phim)" : "Index by (position, movie)"}</h4>${view.activeBucket ? `<div class="rv-friend-key"><small>${vi ? "Key đang xét" : "Current key"}</small><code>(${view.activeBucket.position}, ${requestedVizEsc(view.activeBucket.movie)})</code>${view.operation === "match-add" && activeRow ? `<span>${requestedVizEsc(activeRow.left)} ↔ ${requestedVizEsc(activeRow.right)} · ${vi ? "thêm vị trí" : "add position"} ${view.activeBucket.position}</span>` : ""}</div>` : ""}<div class="rv-friend-index">${buckets || requestedVizEmpty("index = {}")}</div>${bucketOmitted ? `<small class="rv-friend-more">+${bucketOmitted} ${vi ? "bucket đã thu gọn" : "compact buckets"}</small>` : ""}</section>`
    : view.phase === "evaluate"
      ? `<section class="rv-panel rv-friend-stage"><h4>${vi ? "Candidate đang xác nhận" : "Candidate being verified"}</h4><div class="rv-friend-pairs">${pairs || requestedVizEmpty(vi ? "Chưa có candidate" : "No candidate yet")}</div>${allResults.length ? `<div class="rv-friend-emitted"><small>${vi ? "Đã emit" : "Emitted"}</small>${result}</div>` : ""}</section>`
      : view.phase === "done"
        ? `<section class="rv-panel rv-friend-stage rv-friend-done"><h4>${vi ? "Friend pairs cuối cùng" : "Final friend pairs"} · ${allResults.length}</h4><div class="rv-friend-result">${result}</div>${resultOmitted ? `<details class="rv-friend-extra"><summary>+${resultOmitted} ${vi ? "kết quả khác" : "more results"}</summary><div class="rv-friend-result">${allResults.slice(8).map((pair) => `<span><b>${requestedVizEsc(pair[0])}</b> ↔ <b>${requestedVizEsc(pair[1])}</b></span>`).join("")}</div></details>` : ""}</section>`
        : `<div class="rv-friend-tip"><b>last-k</b><span>${vi ? "Cắt đúng k phim cuối trước khi tạo index." : "Slice the exact final k movies before indexing."}</span></div>`;
  const operations = {
    import: ["Nạp thư viện", "Import"], call: ["Nhận lịch sử phim", "Read movie histories"], "index-init": ["Tạo index", "Initialize index"], "matches-init": ["Tạo tập vị trí khớp", "Initialize match sets"], "sort-users": ["Sắp xếp users", "Sort users"],
    "user-loop": ["Đọc user", "Read user"], "slice-window": ["Lấy k phim cuối", "Take last k movies"], "position-loop": ["Đọc vị trí và phim", "Read position and movie"], "prior-user-loop": ["Tìm user trong bucket", "Find users in bucket"],
    "match-add": ["Ghi nhận vị trí khớp", "Record matching position"], "index-append": ["Thêm user vào index", "Add user to index"], "answer-init": ["Tạo kết quả", "Initialize results"], "pair-loop": ["Đọc candidate pair", "Read candidate pair"],
    "threshold-check": ["Kiểm tra ngưỡng m", "Check threshold m"], "answer-append": ["Thêm friend pair", "Add friend pair"], "sort-and-return": ["Trả friend pairs", "Return friend pairs"],
  };
  const historyPanel = `<section class="rv-panel rv-friend-histories"><h4>${vi ? "k phim cuối của mỗi user" : "Each user's last k movies"}</h4><div class="rv-histories">${histories}</div>${historyOmitted ? `<small class="rv-friend-more">+${historyOmitted} ${vi ? "user đã thu gọn" : "compact users"}</small>` : ""}<footer class="rv-friend-legend"><span>${vi ? "Xanh dương: đang đọc" : "Blue: current position"}</span><span>${vi ? "Xanh lá: đã khớp" : "Green: matched position"}</span></footer></section>`;
  requestedVizSet(`<div class="rv-friends-9016 phase-${requestedVizEsc(view.phase || "init")}">${requestedVizPhases(vi ? ["Lấy last-k", "Tạo index", "Kiểm tra m", "Kết quả"] : ["Take last-k", "Build index", "Check m", "Results"], phaseIndex)}
    <div class="rv-action-banner"><small>${vi ? "DÒNG" : "LINE"} ${step.codeLines?.[0] || "—"}</small><b>${requestedVizEsc(operations[view.operation]?.[vi ? 0 : 1] || view.operation || view.phase)}</b></div>
    <div class="rv-friend-summary"><span><small>Users</small><b>${allHistories.length}</b></span><span><small>last-k</small><b>${view.k}</b></span><span><small>${vi ? "Ngưỡng m" : "Threshold m"}</small><b>${view.m}</b></span><span><small>Friend pairs</small><b>${allResults.length + (allResults === view.answer ? 0 : view.omittedResults || 0)}</b></span></div>
    <div class="rv-focus-equation"><span>${vi ? "Điều kiện" : "Rule"}</span><strong>matches ≥ ${view.m}</strong><span>${vi ? `trong ${view.k} vị trí` : `of ${view.k} positions`}</span></div>
    ${view.phase === "done" ? `${stage}<details class="rv-friend-history-details"><summary>${vi ? "Xem last-k windows" : "View last-k windows"}</summary>${historyPanel}</details>` : `${historyPanel}${stage}`}
    ${view.omittedPairSteps || view.omittedPairs ? `<div class="rv-friend-more">+${(view.omittedPairSteps || 0) + (view.omittedPairs || 0)} ${vi ? "bước/pair đã thu gọn" : "compact step(s)/pair(s)"}</div>` : ""}</div>`,
  vi ? `So khớp lịch sử phim m=${view.m} trong k=${view.k}` : `Movie-history matching with m=${view.m} of k=${view.k}`, "group");
}

// ─── #9017: ad metrics pipeline ─────────────────────────────────────────────
function renderAds9017View(step) {
  const view = step.ads9017View || {};
  const vi = lang === "vi";
  const operation = view.operation || view.phase;
  const phaseIndex = view.phase === "derive" || view.phase === "done" ? 3
    : view.phase === "aggregate" ? 2
      : view.phase === "duplicate" || operation === "duplicate-check" ? 1 : 0;
  const allEvents = view.events || [];
  const eventIndex = Number.isInteger(view.eventIndex) ? view.eventIndex : -1;
  const start = Math.max(0, Math.min(eventIndex - 2, allEvents.length - 6));
  const statuses = vi ? { pending: "Chờ", current: "Đang xử lý", accepted: "Đã đếm", duplicate: "Bỏ qua" }
    : { pending: "Queued", current: "Processing", accepted: "Counted", duplicate: "Skipped" };
  const events = allEvents.slice(start, start + 6).map((event, offset) => {
    const active = start + offset === eventIndex;
    const state = ["accepted", "duplicate", "current"].includes(event.state) ? event.state : "pending";
    return `<article class="rv-ad-event ${state}${active ? " active" : ""}"><header><small>#${start + offset + 1}</small><b>${requestedVizEsc(event.eventId)}</b></header>
      <span>${requestedVizEsc(event.type)}</span><small>${requestedVizEsc(event.campaign)} · ${requestedVizEsc(event.user)}</small>
      <footer><em>$${Number(event.cost).toFixed(2)}</em><span>${requestedVizEsc(active && state !== "duplicate" ? statuses.current : statuses[state])}</span></footer></article>`;
  }).join("");
  const accepted = allEvents.filter((event) => event.state === "accepted").length;
  const skipped = allEvents.filter((event) => event.state === "duplicate").length;
  const totalSpend = (view.campaigns || []).reduce((sum, metric) => sum + Number(metric.spend || 0), 0);
  const current = view.current ? `<div class="rv-ad-current"><header><b>${requestedVizEsc(view.current.eventId)}</b><span>${requestedVizEsc(view.current.type)}</span></header><p>${requestedVizEsc(view.current.campaign)} <span>· ${requestedVizEsc(view.current.user)}</span></p><strong>$${Number(view.current.cost).toFixed(2)}</strong></div>`
    : `<div class="rv-ad-idle">${requestedVizEsc(vi ? "Sẵn sàng đọc event đầu tiên" : "Ready for the first event")}</div>`;
  const gateClass = view.decision === "duplicate" ? "duplicate" : view.decision === "accepted" ? "accepted" : "checking";
  const gateText = view.decision === "duplicate" ? (vi ? "ID trùng · bỏ qua" : "Duplicate ID · skip") : view.decision === "accepted" ? (vi ? "ID mới · tiếp tục" : "New ID · continue") : (vi ? "Kiểm tra eventId" : "Check eventId");
  const gateDetail = view.decision === "duplicate" ? (vi ? "Không tăng counter hoặc spend." : "Counters and spend stay unchanged.")
    : view.decision === "accepted" ? (vi ? "Cập nhật campaign theo từng dòng code." : "Update the campaign one instruction at a time.")
      : (vi ? "Chỉ đếm mỗi ID một lần." : "Count each event ID only once.");
  const allCampaigns = view.campaigns || [];
  const activeIndex = allCampaigns.findIndex((metric) => metric.campaign === view.activeCampaign);
  const campaignStart = Math.max(0, Math.min(activeIndex - 1, allCampaigns.length - 4));
  const visibleCampaigns = view.phase === "done" ? allCampaigns : allCampaigns.slice(campaignStart, campaignStart + 4);
  const money = (value) => `$${Number(value || 0).toFixed(2)}`;
  const ratio = (value) => value === null || value === undefined ? "—" : `${(value * 100).toFixed(1)}%`;
  const campaigns = visibleCampaigns.map((metric) => {
    const active = metric.campaign === view.activeCampaign;
    const focusField = { "impression-increment": "impressions", "click-increment": "clicks", "conversion-increment": "conversions", "spend-add": "spend", "compute-reach": "reach", "compute-ctr": "ctr", "compute-cvr": "cvr" }[operation];
    const focus = (field) => active && field === focusField ? " focus" : "";
    const peak = Math.max(1, metric.impressions, metric.clicks, metric.conversions);
    const bar = (name, value, cls) => `<div class="rv-funnel-row ${cls}${focus(name)}"><span>${name}</span><div><i style="width:${(value / peak) * 100}%"></i></div><b>${value}</b></div>`;
    const derived = (name, value, field, formula) => `<span class="${focus(field).trim()}"><small>${name}</small><b>${value}</b><em>${formula}</em></span>`;
    const users = Array.isArray(metric.users) ? metric.users : [];
    const warning = metric.warning === "clicks-exceed-impressions" ? (vi ? "Clicks vượt impressions" : "Clicks exceed impressions") : (vi ? "Conversions vượt clicks" : "Conversions exceed clicks");
    return `<article class="rv-campaign-card${active ? " active" : ""}"><header><b>${requestedVizEsc(metric.campaign)}</b>${active ? `<small>${vi ? "ĐANG XÉT" : "ACTIVE"}</small>` : ""}</header>
      ${bar("impressions", metric.impressions, "impression")}${bar("clicks", metric.clicks, "click")}${bar("conversions", metric.conversions, "conversion")}
      <div class="rv-metric-grid">${derived("reach", metric.reach ?? "—", "reach", vi ? "user duy nhất" : "unique users")}${derived("spend", money(metric.spend), "spend", "Σ cost")}${derived("CTR", ratio(metric.ctr), "ctr", `${metric.clicks} / ${metric.impressions}`)}${derived("CVR", ratio(metric.cvr), "cvr", `${metric.conversions} / ${metric.clicks}`)}</div>
      ${Array.isArray(metric.users) ? `<details class="rv-ad-users${active && operation === "reach-user-add" ? " focus" : ""}"><summary>users · ${users.length}${active && operation === "reach-user-add" && view.current ? ` · add(${requestedVizEsc(view.current.user)})` : ""}</summary><div>${users.map(requestedVizEsc).join(", ") || "∅"}</div></details>` : ""}
      ${metric.warning ? `<p class="rv-ad-warning">⚠ ${requestedVizEsc(warning)}</p>` : ""}
    </article>`;
  }).join("");
  const seenIds = view.seenIds || [];
  const seen = seenIds.map((id) => `<span class="${id === view.current?.eventId ? "active" : ""}">${requestedVizEsc(id)}</span>`).join("");
  const instructionNames = {
    import: ["Nạp thư viện", "Import"], call: ["Nhận stream", "Receive stream"], "seen-init": ["Tạo tập ID", "Initialize ID set"], "metrics-init": ["Tạo metrics", "Initialize metrics"],
    "event-loop": ["Đọc event", "Read event"], "duplicate-check": ["Kiểm tra ID", "Check ID"], continue: ["Bỏ qua retry", "Skip retry"], "mark-seen": ["Ghi nhận ID", "Remember ID"], "metric-lookup": ["Lấy campaign", "Look up campaign"],
    "reach-user-add": ["Thêm user vào tập", "Add user to set"], "spend-add": ["Cộng chi phí", "Add cost"], "impression-check": ["Kiểm tra impression", "Check impression"], "impression-increment": ["Tăng impressions", "Increment impressions"],
    "click-check": ["Kiểm tra click", "Check click"], "click-increment": ["Tăng clicks", "Increment clicks"], "conversion-else": ["Chọn conversion", "Select conversion"], "conversion-increment": ["Tăng conversions", "Increment conversions"],
    "answer-init": ["Tạo kết quả", "Initialize result"], "campaign-loop": ["Đọc campaign", "Read campaign"], "compute-reach": ["Tính reach", "Compute reach"], "compute-ctr": ["Tính CTR", "Compute CTR"], "compute-cvr": ["Tính CVR", "Compute CVR"],
    "answer-campaign": ["Lưu metrics", "Save metrics"], return: ["Trả kết quả", "Return result"],
  };
  const instruction = instructionNames[operation]?.[vi ? 0 : 1] || operation || "";
  requestedVizSet(`<div class="rv-ads-9017 phase-${requestedVizEsc(view.phase || "init")}">
    ${requestedVizPhases(vi ? ["Nhận event", "Kiểm tra ID", "Cập nhật", "Kết quả"] : ["Receive", "Check ID", "Aggregate", "Results"], phaseIndex)}
    <div class="rv-action-banner"><small>${vi ? "DÒNG" : "LINE"} ${step.codeLines?.[0] || "—"}</small><b>${requestedVizEsc(instruction)}</b></div>
    <div class="rv-ad-summary"><span><small>${vi ? "Đã đếm" : "Counted"}</small><b>${accepted}<em> / ${allEvents.length}</em></b></span><span><small>${vi ? "Bỏ qua" : "Skipped"}</small><b>${skipped}</b></span><span><small>Campaigns</small><b>${allCampaigns.length}</b></span><span><small>Spend</small><b>${money(totalSpend)}</b></span></div>
    ${phaseIndex < 3 ? `<section class="rv-panel rv-ad-stream-panel"><header><h4>Event stream</h4><small>${allEvents.length ? `${start + 1}–${Math.min(start + 6, allEvents.length)} / ${allEvents.length}` : "0"}</small></header><div class="rv-ad-stream">${events || requestedVizEmpty(vi ? "Stream rỗng" : "Empty stream")}</div></section>` : ""}
    ${phaseIndex < 3 ? `<section class="rv-panel rv-ad-processing"><div class="rv-ad-pipeline">${current}<div class="rv-dedupe-gate ${gateClass}"><small>DEDUPE · eventId</small><b>${requestedVizEsc(gateText)}</b><span>${requestedVizEsc(gateDetail)}</span></div></div>
      <details class="rv-ad-seen"><summary>seen_ids <b>${seenIds.length}</b>${view.current ? `<span>${requestedVizEsc(view.current.eventId)} ${seenIds.includes(view.current.eventId) ? "∈" : "∉"} seen_ids</span>` : ""}</summary><div class="rv-seen-ids">${seen || "∅"}</div></details></section>` : ""}
    <section class="rv-panel rv-ad-metrics"><header><h4>${vi ? "Metrics theo campaign" : "Campaign metrics"}</h4><small>${vi ? "Ô vàng = vừa tính" : "Gold cell = just computed"}</small></header><div class="rv-campaigns">${campaigns || `<div class="rv-ad-idle">${vi ? "Metrics xuất hiện khi event hợp lệ đầu tiên được xử lý." : "Metrics appear when the first accepted event is processed."}</div>`}</div>${allCampaigns.length > visibleCampaigns.length ? `<small class="rv-ad-more">+${allCampaigns.length - visibleCampaigns.length} ${vi ? "campaign khác · xem tất cả ở bước cuối" : "more campaigns · view all at the final step"}</small>` : ""}</section>
    <footer class="rv-ad-formulas">CTR = clicks / impressions · CVR = conversions / clicks<br><span>${vi ? "Chưa tính: — · Mẫu số bằng 0: kết quả 0" : "Not computed: — · Zero denominator: result 0"}</span></footer></div>`,
  vi ? "Pipeline ads có dedupe eventId và metrics theo campaign" : "Ad pipeline with event-ID dedupe and per-campaign metrics");
}


// ─── Instruction-level debug refinements for #9001/#9006/#9013–#9017 ─────
// Preserve the rich visual layouts above, then decorate them with the exact
// source instruction and fix fields that intentionally do not exist yet.
function requestedLineDebugText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return pick(value);
  return String(value);
}

function decorateRequestedLineDebug(step, view, options = {}) {
  const root = $("treeView").querySelector(".requested-viz");
  if (!root) return;
  const line = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const operation = options.operation || view.operation || view.phase || "step";
  const heading = `${line ? `LINE ${line} · ` : ""}${String(operation).replaceAll("-", " ").toUpperCase()}`;
  let banner = root.querySelector(".rv-action-banner");
  if (!banner) {
    const phases = root.querySelector(".rv-phases");
    const html = `<div class="rv-action-banner"><b>${requestedVizEsc(heading)}</b><span></span></div>`;
    if (phases) phases.insertAdjacentHTML("afterend", html);
    else root.insertAdjacentHTML("afterbegin", html);
    banner = root.querySelector(".rv-action-banner");
  }
  const headingNode = banner.querySelector("b");
  const textNode = banner.querySelector("span");
  if (headingNode) headingNode.textContent = heading;
  const detail = requestedLineDebugText(options.detail);
  if (textNode && detail) textNode.textContent = detail;
}

const renderProfitTracker9001GroupedView = renderProfitTracker9001View;
renderProfitTracker9001View = function renderProfitTracker9001LineDebugView(step) {
  renderProfitTracker9001GroupedView(step);
  const view = step.profitTrackerView || {};
  decorateRequestedLineDebug(step, view, { operation: view.action?.type || view.phase });
};

const renderBfs9006GroupedView = renderBfs9006View;
renderBfs9006View = function renderBfs9006LineDebugView(step) {
  renderBfs9006GroupedView(step);
  const view = step.bfs9006View || {};
  decorateRequestedLineDebug(step, view, {
    detail: view.actionText || step.note,
  });
};

const renderSquare9013GroupedView = renderSquare9013View;
renderSquare9013View = function renderSquare9013LineDebugView(step) {
  renderSquare9013GroupedView(step);
  const view = step.square9013View || {};
  decorateRequestedLineDebug(step, view, { detail: step.note });
};





// ????????? Core algorithm custom views: #542, #684, #787, #847 ??????????????????????????????????????????????????????
function requestedCoreGraphSvg(nodes, edges, options = {}) {
  const width = 700;
  const height = 330;
  const cx = width / 2;
  const cy = height / 2;
  const radiusX = Math.min(275, 70 + nodes.length * 22);
  const radiusY = Math.min(125, 48 + nodes.length * 10);
  const positions = new Map(nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(1, nodes.length) - Math.PI / 2;
    return [node.id, { x: cx + radiusX * Math.cos(angle), y: cy + radiusY * Math.sin(angle) }];
  }));
  const marker = options.directed
    ? `<defs><marker id="rv-core-arrow" markerWidth="9" markerHeight="7" refX="20" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" /></marker></defs>`
    : "";
  const edgeHtml = (edges || []).map((edge) => {
    const from = positions.get(edge.u);
    const to = positions.get(edge.v);
    if (!from || !to) return "";
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const label = edge.w === "" || edge.w === null || edge.w === undefined ? "" : `<text x="${midX}" y="${midY - 5}" text-anchor="middle">${requestedVizEsc(edge.w)}</text>`;
    return `<g class="rv-core-edge${edge.current ? " current" : ""}${edge.state ? ` ${requestedVizEsc(edge.state)}` : ""}"><line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"${options.directed ? ' marker-end="url(#rv-core-arrow)"' : ""}/>${label}</g>`;
  }).join("");
  const nodeHtml = (nodes || []).map((node) => {
    const point = positions.get(node.id);
    const classes = ["rv-core-node", node.active ? "active" : "", node.visited ? "visited" : "", node.reachable ? "reachable" : "", node.isSource ? "source" : "", node.isTarget ? "target" : ""].filter(Boolean).join(" ");
    const sub = node.cost === null || node.cost === undefined ? (node.sub || "") : `cost=${node.cost}`;
    return `<g class="${classes}"><circle cx="${point.x}" cy="${point.y}" r="25"/><text class="id" x="${point.x}" y="${point.y + (sub ? 0 : 5)}" text-anchor="middle">${requestedVizEsc(node.id)}</text>${sub ? `<text class="sub" x="${point.x}" y="${point.y + 14}" text-anchor="middle">${requestedVizEsc(sub)}</text>` : ""}</g>`;
  }).join("");
  return `<div class="rv-core-graph"><svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${marker}${edgeHtml}${nodeHtml}</svg></div>`;
}

function renderMatrix542View(step) {
  const view = step.matrix542View || {};
  const vi = lang === "vi";
  const phaseIndex = view.phase === "setup" ? 0 : view.phase === "sources" ? 1 : view.phase === "bfs" ? 2 : 3;
  const cells = (view.cells || []).flatMap((row) => row.map((cell) => {
    const display = cell.distance !== null && cell.distance !== undefined
      ? cell.distance
      : view.phase === "setup" ? (cell.input ?? "?") : "???";
    const classes = ["rv-matrix-cell", cell.state || "", cell.isSource ? "source" : ""].filter(Boolean).join(" ");
    return `<div class="${classes}"><small>(${cell.row},${cell.col})</small><strong>${requestedVizEsc(display)}</strong><em>${cell.isSource ? "SOURCE" : cell.distance === null ? "UNVISITED" : `d=${cell.distance}`}</em></div>`;
  })).join("");
  const queue = (view.queue || []).length
    ? view.queue.map((cell, index) => `<span class="${index === 0 ? "front" : ""}"><small>${index === 0 ? "FRONT" : `#${index + 1}`}</small><b>(${cell.row},${cell.col})</b><em>d=${cell.distance ?? "???"}</em></span>`).join("<i>???</i>")
    : requestedVizEmpty(vi ? "Queue r???ng" : "Queue is empty");
  const sources = (view.sources || []).map(([row, col]) => `<span>(${row},${col})</span>`).join("") || requestedVizEmpty("???");
  const neighbor = view.neighbor
    ? `<div class="rv-focus-equation${view.check?.unvisited === true ? " success" : ""}"><span>${view.current ? `(${view.current.join(",")})` : "?"} + ${view.direction ? `(${view.direction.join(",")})` : "?"}</span><strong>??? (${view.neighbor.join(",")})</strong><b>${view.check?.inBounds === false ? "OUT" : view.check?.unvisited === true ? "DISCOVER" : view.check?.unvisited === false ? "SKIP" : "CHECK"}</b></div>`
    : "";
  const result = view.phase === "result" && view.answer !== null
    ? `<div class="rv-core-result ${view.invalid ? "error" : ""}"><small>RETURN</small><strong>${requestedVizEsc(JSON.stringify(view.answer))}</strong></div>`
    : "";

  requestedVizSet(`${requestedVizPhases(vi ? ["Kh???i t???o distance", "Thu th???p m???i source 0", "Multi-source BFS", "Ma tr???n k???t qu???"] : ["Initialize distances", "Collect every zero source", "Multi-source BFS", "Result matrix"], phaseIndex)}
    <div class="rv-action-banner"><b>${requestedVizEsc((view.operation || "step").toUpperCase())}</b><span>${requestedVizEsc(step.note ? pick(step.note) : "")}</span></div>
    <div class="rv-matrix542-stats"><span><small>sources</small><b>${(view.sources || []).length}</b></span><span><small>queue</small><b>${(view.queue || []).length}</b></span><span><small>grid</small><b>${view.rows}??${view.cols}</b></span></div>
    <section class="rv-panel"><h4>${vi ? "Distance grid ??? ??? l?? ch??a th??m" : "Distance grid ??? ??? means unvisited"}</h4><div class="rv-matrix-grid" style="--rv-matrix-cols:${view.cols}">${cells}</div></section>
    ${neighbor}
    <div class="rv-two-column"><section class="rv-panel"><h4>${vi ? "C??c source ???????c enqueue v???i d=0" : "Sources enqueued with d=0"}</h4><div class="rv-source-set">${sources}</div></section><section class="rv-panel"><h4>QUEUE ?? FRONT ??? BACK</h4><div class="rv-matrix-queue">${queue}</div></section></div>
    ${result}`,
  vi ? "Multi-source BFS cho ma tr???n kho???ng c??ch" : "Multi-source BFS distance matrix");
}

function renderUnionFind684View(step) {
  const view = step.unionFind684View || {};
  const vi = lang === "vi";
  const phaseIndex = view.phase === "setup" ? 0
    : ["edge", "find"].includes(view.phase) ? 1
      : ["compare", "union"].includes(view.phase) ? 2 : 3;
  const operationLabels = {
    enter: vi ? "Nhận danh sách cạnh" : "Read the edge list",
    "n-init": vi ? "Đếm số cạnh" : "Count the edges",
    "parent-init": vi ? "Mỗi node tự làm parent" : "Each node starts as its own parent",
    "rank-init": vi ? "Rank ban đầu bằng 0" : "Initialize every rank to zero",
    "define-find": vi ? "Chuẩn bị hàm tìm root" : "Define how to find a root",
    "define-union": vi ? "Chuẩn bị hàm gộp hai nhóm" : "Define how to merge two groups",
    "edge-loop": vi ? "Chọn cạnh tiếp theo" : "Take the next edge",
    "union-call": vi ? "Gọi union cho cạnh này" : "Call union for this edge",
    "find-check": vi ? "Đi theo con trỏ parent" : "Follow the parent pointer",
    "path-compress": vi ? "Nén đường đi về root" : "Compress the path to the root",
    "find-return": vi ? "Đã tìm thấy root" : "The root is known",
    "root-x": vi ? "Lưu root_x" : "Store root_x",
    "root-y": vi ? "Lưu root_y" : "Store root_y",
    "cycle-check": vi ? "So sánh hai root" : "Compare the two roots",
    "union-false": vi ? "Hai node đã cùng nhóm" : "The nodes are already connected",
    "rank-less-check": vi ? "Kiểm tra rank_x < rank_y" : "Check whether rank_x < rank_y",
    "attach-x-to-y": vi ? "Gắn root_x vào root_y" : "Attach root_x below root_y",
    "rank-greater-check": vi ? "Kiểm tra rank_x > rank_y" : "Check whether rank_x > rank_y",
    "attach-y-to-x": vi ? "Gắn root_y vào root_x" : "Attach root_y below root_x",
    "equal-rank-branch": vi ? "Hai rank bằng nhau" : "The two ranks are equal",
    "rank-increment": vi ? "Tăng rank của root mới" : "Increase the new root's rank",
    "union-true": vi ? "Gộp thành công" : "The merge succeeds",
    "return-redundant": vi ? "Trả về cạnh tạo chu trình" : "Return the cycle-forming edge",
    "return-empty": vi ? "Không có cạnh thừa" : "No redundant edge",
  };
  const operation = view.operation || "step";
  const operationLabel = operationLabels[operation] || operation;
  const stateLabels = {
    pending: vi ? "chưa xét" : "waiting",
    current: vi ? "đang xét" : "current",
    accepted: vi ? "đã gộp" : "merged",
    redundant: vi ? "tạo cycle" : "cycle",
  };
  const edges = (view.edges || []).map((edge) => `<span class="rv-dsu-edge ${requestedVizEsc(edge.state)}"><small>${vi ? "cạnh" : "edge"} #${edge.index + 1}</small><b>${edge.u} — ${edge.v}</b><em>${requestedVizEsc(stateLabels[edge.state] || edge.state)}</em></span>`).join("");
  const nodes = (view.nodes || []).map((node) => `<article class="rv-dsu-node${node.active ? " active" : ""}${node.isRoot ? " root" : ""}"><header><small>${vi ? "đỉnh" : "node"}</small><b>${node.id}</b></header><div><span>parent</span><strong>${node.parent ?? "—"}</strong></div><div><span>rank</span><strong>${node.rank ?? "—"}</strong></div><footer>${node.root === null || node.root === undefined ? (vi ? "chưa khởi tạo" : "not initialized") : `root = ${node.root}`}</footer></article>`).join("");
  const components = (view.components || []).map((component) => {
    const containsEndpoint = view.currentEdge && component.members.some((member) => view.currentEdge.includes(member));
    const rootRank = (view.nodes || []).find((node) => node.id === component.root)?.rank;
    return `<article class="${containsEndpoint ? "active" : ""}"><header><small>COMPONENT</small><b>root ${component.root}<em>rank ${rootRank ?? "—"}</em></b></header><div>${component.members.map((member) => `<span class="${view.currentEdge?.includes(member) ? "endpoint" : ""}">${member}</span>`).join("")}</div></article>`;
  }).join("") || requestedVizEmpty(vi ? "Forest chưa được khởi tạo" : "The forest is not initialized yet");
  const findState = view.findState;
  const findPath = findState
    ? `<section class="rv-panel rv-dsu-find-panel"><h4>find(${findState.start}) · ${findState.endpoint === "u" ? (vi ? "đầu trái u" : "left endpoint u") : (vi ? "đầu phải v" : "right endpoint v")}</h4><div class="rv-find-path">${findState.path.map((node, index) => `<span class="${findState.compressed.includes(node) ? "compressed" : node === findState.current ? "current" : ""}"><b>${node}</b><small>${node === findState.root ? "ROOT" : `parent[${node}]`}</small></span>${index < findState.path.length - 1 ? "<i>→</i>" : ""}`).join("")}</div><p>${findState.root === null ? (vi ? "Tiếp tục đi theo parent cho tới khi parent[x] = x." : "Keep following parent until parent[x] = x.") : (vi ? `Root tìm được là ${findState.root}.` : `The discovered root is ${findState.root}.`)}</p></section>`
    : "";
  const rootsReady = view.roots.u !== null && view.roots.v !== null;
  const sameRoot = rootsReady && view.roots.u === view.roots.v;
  const rootXNode = rootsReady ? (view.nodes || []).find((node) => node.id === view.roots.u) : null;
  const rootYNode = rootsReady ? (view.nodes || []).find((node) => node.id === view.roots.v) : null;
  const rankOperations = ["rank-less-check", "attach-x-to-y", "rank-greater-check", "attach-y-to-x", "equal-rank-branch", "rank-increment"];
  const isRankStep = rankOperations.includes(operation);
  let comparedRankX = rootXNode?.rank ?? null;
  let comparedRankY = rootYNode?.rank ?? null;
  if (operation === "rank-increment" && comparedRankX !== null) comparedRankX -= 1;
  const rankRelation = comparedRankX === null || comparedRankY === null ? "?"
    : comparedRankX < comparedRankY ? "<" : comparedRankX > comparedRankY ? ">" : "=";
  const rankRelationHtml = requestedVizEsc(rankRelation);
  const rankLevels = (rank) => Array.from({ length: Math.min(Math.max((rank ?? 0) + 1, 1), 6) }, (_, index) => `<i style="width:${30 + index * 13}px"></i>`).join("");
  let rankOutcome = vi
    ? "Rank chỉ được so sánh sau khi đã tìm được hai root khác nhau."
    : "Ranks are compared only after two different roots are found.";
  if (sameRoot) {
    rankOutcome = vi
      ? "Hai đầu có cùng root nên dừng ngay: không cần so sánh rank và không union."
      : "The endpoints share one root, so stop: no rank comparison and no union.";
  } else if (isRankStep && rankRelation === "<") {
    rankOutcome = vi
      ? `Cây root ${view.roots.u} thấp hơn → cho ${view.roots.u} trỏ vào ${view.roots.v}. Rank không đổi.`
      : `Root ${view.roots.u}'s tree is shorter → point ${view.roots.u} to ${view.roots.v}. Ranks stay unchanged.`;
  } else if (isRankStep && rankRelation === ">") {
    rankOutcome = vi
      ? `Cây root ${view.roots.u} cao hơn → cho ${view.roots.v} trỏ vào ${view.roots.u}. Rank không đổi.`
      : `Root ${view.roots.u}'s tree is taller → point ${view.roots.v} to ${view.roots.u}. Ranks stay unchanged.`;
  } else if (isRankStep && rankRelation === "=") {
    rankOutcome = operation === "rank-increment"
      ? (vi
        ? `Hai cây trước đó cao bằng nhau: đã chọn root ${view.roots.u}, nên rank tăng từ ${comparedRankX} lên ${comparedRankX + 1}.`
        : `The trees had equal height: root ${view.roots.u} was chosen, so its rank grows from ${comparedRankX} to ${comparedRankX + 1}.`)
      : (vi
        ? `Hai cây cao bằng nhau → code chọn root ${view.roots.u}; sau khi nối, chỉ rank[${view.roots.u}] tăng 1.`
        : `The trees have equal height → the code chooses root ${view.roots.u}; after linking, only rank[${view.roots.u}] increases by 1.`);
  }
  const rankLesson = operation === "rank-init" || rootsReady
    ? `<section class="rv-panel rv-dsu-rank-lesson${isRankStep ? " active" : ""}${sameRoot ? " skipped" : ""}">
        <header><div><small>${vi ? "UNION BY RANK" : "UNION BY RANK"}</small><h4>${vi ? "Rank = độ cao ước lượng của cây" : "Rank = estimated tree height"}</h4></div><strong>${vi ? "Không phải số node" : "Not the node count"}</strong></header>
        ${rootsReady ? `<div class="rv-dsu-rank-compare">
          <article class="${rankRelation === ">" || rankRelation === "=" ? "winner" : ""}"><small>root_x</small><b>${view.roots.u}</b><div class="rv-dsu-rank-tower">${rankLevels(comparedRankX)}</div><span>rank = <strong>${comparedRankX ?? "—"}</strong></span></article>
          <div class="rv-dsu-rank-operator"><small>${vi ? "SO SÁNH" : "COMPARE"}</small><b>${sameRoot ? "SKIP" : rankRelationHtml}</b><span>${sameRoot ? (vi ? "cùng root" : "same root") : `rank_x ${rankRelationHtml} rank_y`}</span></div>
          <article class="${rankRelation === "<" ? "winner" : ""}"><small>root_y</small><b>${view.roots.v}</b><div class="rv-dsu-rank-tower">${rankLevels(comparedRankY)}</div><span>rank = <strong>${comparedRankY ?? "—"}</strong></span></article>
        </div>` : `<div class="rv-dsu-rank-basics"><span><b>rank 0</b>${vi ? "Một node, cây cao 1 tầng" : "One node, one tree level"}</span><i>→</i><span><b>rank + 1</b>${vi ? "Chỉ khi gộp hai cây cùng rank" : "Only when equal-rank trees merge"}</span></div>`}
        <p>${requestedVizEsc(rankOutcome)}</p>
        <footer><b>${vi ? "Quy tắc nhớ nhanh:" : "Memory rule:"}</b> ${vi ? "thấp nối vào cao; bằng nhau mới tăng rank." : "shorter goes under taller; only a tie increases rank."}</footer>
      </section>`
    : "";
  const comparison = view.currentEdge
    ? `<section class="rv-dsu-decision${sameRoot ? " cycle" : rootsReady ? " safe" : " waiting"}">
        <div class="rv-dsu-endpoint"><small>u</small><strong>${view.currentEdge[0]}</strong><span>root = <b>${view.roots.u ?? "?"}</b></span></div>
        <div class="rv-dsu-verdict"><small>${vi ? "SO SÁNH ROOT" : "COMPARE ROOTS"}</small><strong>${rootsReady ? (sameRoot ? "=" : "≠") : "?"}</strong><b>${!rootsReady ? (vi ? "Đang chạy find…" : "Running find…") : sameRoot ? (vi ? "CÙNG NHÓM → CYCLE" : "SAME GROUP → CYCLE") : (vi ? "KHÁC NHÓM → UNION" : "DIFFERENT GROUPS → UNION")}</b></div>
        <div class="rv-dsu-endpoint"><small>v</small><strong>${view.currentEdge[1]}</strong><span>root = <b>${view.roots.v ?? "?"}</b></span></div>
      </section>`
    : "";
  const result = view.answer ? `<div class="rv-core-result rv-dsu-result"><small>${vi ? "CẠNH THỪA" : "REDUNDANT EDGE"}</small><strong>[${view.answer.join(", ")}]</strong><span>${vi ? "Hai đầu đã thuộc cùng component, nên cạnh này khép chu trình." : "Both endpoints were already connected, so this edge closes a cycle."}</span></div>` : "";
  const rule = sameRoot
    ? (vi ? "Không union. Đây chính là cạnh cần xóa." : "Do not union. This is the edge to remove.")
    : rootsReady
      ? (vi ? "Hai root khác nhau, vì vậy cạnh này an toàn và hai component được gộp." : "The roots differ, so this edge is safe and the components can be merged.")
      : (vi ? "Trước tiên tìm root của cả hai đầu cạnh." : "First find the root of both endpoints.");

  requestedVizSet(`<div class="rv-dsu684-viz">
    ${requestedVizPhases(vi ? ["Khởi tạo các nhóm", "Tìm root của u và v", "So sánh rồi union", "Phát hiện chu trình"] : ["Initialize groups", "Find roots of u and v", "Compare and union", "Detect the cycle"], phaseIndex)}
    <div class="rv-action-banner rv-dsu-action"><b>${requestedVizEsc(operationLabel)}</b><span>${requestedVizEsc(step.note ? pick(step.note) : "")}</span></div>
    <section class="rv-dsu-rule"><span>1</span><b>${vi ? "Chọn một cạnh" : "Pick an edge"}</b><i>→</i><span>2</span><b>${vi ? "Tìm hai root" : "Find both roots"}</b><i>→</i><span>3</span><b>${vi ? "Giống: cycle · Khác: union" : "Same: cycle · Different: union"}</b></section>
    <section class="rv-panel rv-dsu-edges-panel"><h4>${vi ? "Dòng cạnh — đọc từ trái sang phải" : "Edge stream — process from left to right"}</h4><div class="rv-dsu-edge-stream">${edges}</div></section>
    ${comparison}
    <div class="rv-dsu-explanation ${sameRoot ? "cycle" : rootsReady ? "safe" : "waiting"}"><b>${sameRoot ? (vi ? "Vì sao có cycle?" : "Why is this a cycle?") : rootsReady ? (vi ? "Vì sao union được?" : "Why can we union?") : (vi ? "Đang làm gì?" : "What is happening?")}</b><span>${requestedVizEsc(rule)}</span></div>
    ${findPath}
    ${rankLesson}
    <div class="rv-two-column rv-dsu-workspace"><section class="rv-panel rv-dsu-components-panel"><h4>${vi ? "Các component hiện tại" : "Current connected components"}</h4><div class="rv-dsu-components">${components}</div></section><section class="rv-panel rv-dsu-table-panel"><h4>${vi ? "Bảng DSU (tham khảo)" : "DSU table (reference)"}</h4><div class="rv-dsu-nodes">${nodes}</div></section></div>
    ${result}
  </div>`,
  vi ? "Union-Find tìm cạnh tạo chu trình" : "Union-Find redundant-edge detection");
}

function renderFlights787View(step) {
  const view = step.flights787View || {};
  const vi = lang === "vi";
  const bellman = view.approach === 1;
  const phaseIndex = view.phase === "setup" ? 0 : view.phase === "result" ? 3 : bellman ? 1 : 2;
  const costs = (view.nodes || []).map((node) => `<span class="${node.active ? "active" : ""}${node.isSource ? " source" : ""}${node.isTarget ? " target" : ""}"><small>${vi ? "thành phố" : "city"} ${node.id}</small><b>${node.cost === null ? "∞" : requestedVizNumber(node.cost)}</b></span>`).join("");
  const flights = (view.edges || []).map((edge) => `<span class="${edge.current ? "active" : ""}"><b>${edge.u} → ${edge.v}</b><em>$${requestedVizNumber(edge.w)}</em></span>`).join("");
  const vector = (items, title) => items ? `<div class="rv-flight-vector"><label>${requestedVizEsc(title)}</label>${items.map((value, index) => `<span><small>${index}</small><b>${value === null ? "∞" : requestedVizNumber(value)}</b></span>`).join("")}</div>` : "";
  const bellmanPanel = bellman
    ? `<section class="rv-panel rv-flight-round-panel"><h4>${vi ? "Vòng trước đóng băng → vòng mới được ghi" : "Frozen previous round → writable next round"}</h4>${vector(view.oldCost, vi ? "cost (chỉ đọc)" : "cost (read only)")}${vector(view.nextCost || view.costs, "next_cost")}</section>
       <div class="rv-focus-equation rv-flight-equation"><span>${vi ? "Số chuyến tối đa vòng này" : "Flights allowed this round"}</span><strong>${view.allowedFlights ?? "—"}</strong><span>${vi ? "ứng viên" : "candidate"}</span><b>${view.candidate ?? "—"}</b></div>`
    : `<section class="rv-panel rv-flight-round-panel"><h4>${vi ? "Trạng thái Dijkstra + min-heap" : "Dijkstra state + min-heap"}</h4><div class="rv-flight-state"><span><small>${vi ? "giá" : "price"}</small><b>${view.price ?? "—"}</b></span><span><small>${vi ? "thành phố" : "city"}</small><b>${view.city ?? "—"}</b></span><span><small>${vi ? "số chuyến đã dùng" : "flights used"}</small><b>${view.used ?? "—"}</b></span><span><small>${vi ? "ứng viên" : "candidate"}</small><b>${view.candidate ?? "—"}</b></span></div><div class="rv-code-value"><small>heap</small><code>${requestedVizEsc(view.heap || "[]")}</code></div><div class="rv-code-value"><small>${vi ? "bảng trạng thái best" : "best state table"}</small><code>${requestedVizEsc(view.best || "—")}</code></div></section>`;
  const result = view.answer !== null ? `<div class="rv-core-result${view.answer === -1 ? " error" : ""}"><small>RETURN</small><strong>${requestedVizEsc(view.answer)}</strong></div>` : "";

  requestedVizSet(`<div class="rv-flight-viz">${requestedVizPhases(bellman ? (vi ? ["Khởi tạo cost", "K+1 vòng relax", "Chốt từng vòng", "Giá tại dst"] : ["Initialize cost", "K+1 relaxation rounds", "Commit each round", "Cost to dst"]) : (vi ? ["Xây state graph", "Khởi tạo best", "Pop/relax heap", "Tới dst"] : ["Build state graph", "Initialize best", "Pop/relax heap", "Reach dst"]), phaseIndex)}
    <div class="rv-action-banner"><b>${bellman ? "BELLMAN-FORD" : "STATE DIJKSTRA"} · ${requestedVizEsc((view.operation || "step").toUpperCase())}</b><span>${requestedVizEsc(step.note ? pick(step.note) : "")}</span></div>
    <div class="rv-flight-stats"><span><small>src</small><b>${view.src ?? "—"}</b></span><span><small>dst</small><b>${view.dst ?? "—"}</b></span><span><small>k stops</small><b>${view.k ?? "—"}</b></span><span><small>max flights</small><b>${Number.isInteger(view.k) ? view.k + 1 : "—"}</b></span></div>
    <div class="rv-two-column rv-flight-workspace"><section class="rv-panel rv-flight-network-panel"><h4>${vi ? "Mạng chuyến bay có hướng" : "Directed flight network"}</h4>${requestedCoreGraphSvg(view.nodes || [], view.edges || [], { directed: true })}<div class="rv-flight-edges">${flights}</div></section><section class="rv-panel rv-flight-cost-panel"><h4>${vi ? "Chi phí tốt nhất theo thành phố" : "Best cost by city"}</h4><div class="rv-city-costs">${costs}</div></section></div>
    ${bellmanPanel}${result}</div>`,
  vi ? `Chuyến bay rẻ nhất — cách ${view.approach}` : `Cheapest Flights — approach ${view.approach}`);
}

function renderVisitAll847View(step) {
  const view = step.visitAll847View || {};
  const vi = lang === "vi";
  const bfs = view.approach === 1;
  const phaseIndex = view.phase === "setup" ? 0 : view.phase === "result" ? 3 : view.phase === "floyd" ? 1 : 2;
  const bits = String(view.bits || "").padStart(view.n || 0, "0");
  const mask = Array.from({ length: view.n || 0 }, (_, node) => {
    const bit = bits[bits.length - 1 - node] || "0";
    return `<span class="${bit === "1" ? "on" : ""}${node === view.currentNode ? " active" : ""}"><small>node ${node}</small><b>${bit}</b></span>`;
  }).join("");
  const stateCards = (states, kind) => states.length
    ? states.map((state) => `<article class="${kind}"><header><small>node</small><b>${state.node}</b><em>d=${state.dist}</em></header><code>${requestedVizEsc(state.bits)}</code><footer>{${state.visited.join(", ")}}</footer></article>`).join("")
    : requestedVizEmpty("???");
  const bfsPanel = `<div class="rv-two-column"><section class="rv-panel"><h4>FRONTIER ?? ${view.frontierTotal} states</h4><div class="rv-mask-states">${stateCards(view.frontier || [], "frontier")}</div>${view.omittedFrontier ? `<small>+${view.omittedFrontier} hidden</small>` : ""}</section><section class="rv-panel"><h4>NEXT FRONTIER ?? ${view.nextFrontierTotal} states</h4><div class="rv-mask-states">${stateCards(view.nextFrontier || [], "next")}</div>${view.omittedNext ? `<small>+${view.omittedNext} hidden</small>` : ""}</section></div>`;
  const matrix = view.distanceMatrix
    ? `<div class="rv-dp-scroll"><table class="rv-dp-table"><thead><tr><th>i\\j</th>${view.distanceMatrix[0].map((_, index) => `<th>${index}</th>`).join("")}</tr></thead><tbody>${view.distanceMatrix.map((row, index) => `<tr><th>${index}</th>${row.map((value) => `<td>${requestedVizEsc(value)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
    : "";
  const dpPanel = `<section class="rv-panel"><h4>${view.phase === "floyd" ? "Floyd-Warshall distance matrix" : "Bitmask DP progress"}</h4>${matrix || `<div class="rv-focus-equation"><span>popcount</span><strong>${view.popcount ?? "???"}/${view.n}</strong><span>dp[mask][end]</span><b>${view.dpValue ?? "???"}</b></div>`}${view.dpRow ? `<div class="rv-code-value"><small>dp[fullMask]</small><code>${requestedVizEsc(view.dpRow)}</code></div>` : ""}</section>`;
  const result = view.answer !== null ? `<div class="rv-core-result"><small>SHORTEST LENGTH</small><strong>${requestedVizEsc(view.answer)}</strong></div>` : "";

  requestedVizSet(`${requestedVizPhases(bfs ? (vi ? ["M???i node l?? source", "Frontier hi???n t???i", "OR bit khi di chuy???n", "?????t full mask"] : ["Every node is a source", "Current frontier", "OR a bit on each move", "Reach full mask"]) : (vi ? ["Kh???i t???o", "Floyd-Warshall", "DP theo popcount", "Full mask"] : ["Initialize", "Floyd-Warshall", "DP by popcount", "Full mask"]), phaseIndex)}
    <div class="rv-action-banner"><b>${bfs ? "BITMASK BFS" : "FLOYD + BITMASK DP"} ?? ${requestedVizEsc((view.operation || "step").toUpperCase())}</b><span>${requestedVizEsc(step.note ? pick(step.note) : "")}</span></div>
    <div class="rv-mask-stats"><span><small>distance</small><b>${view.dist ?? "???"}</b></span><span><small>visited states</small><b>${view.visitedStateCount}</b></span><span><small>coverage</small><b>${view.visited.length}/${view.n}</b></span><span><small>target</small><b>${requestedVizEsc(view.fullBits)}</b></span></div>
    <div class="rv-two-column rv-mask-workspace"><section class="rv-panel"><h4>${vi ? "Graph ??? xanh l?? node trong mask m???u" : "Graph ??? green nodes are in the sample mask"}</h4>${requestedCoreGraphSvg(view.nodes || [], view.edges || [])}</section><section class="rv-panel"><h4>visited_mask ?? bit i ??? node i</h4><div class="rv-mask-bits">${mask}</div><div class="rv-callout compact">state = (node, visited_mask) ?? ${vi ? "c??ng node nh??ng mask kh??c l?? state kh??c" : "the same node with another mask is a different state"}</div></section></div>
    ${bfs ? bfsPanel : dpPanel}${result}`,
  vi ? `Shortest Path Visiting All Nodes ??? c??ch ${view.approach}` : `Shortest Path Visiting All Nodes ??? approach ${view.approach}`);
}
