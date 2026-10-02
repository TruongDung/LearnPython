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

function requestedVizSet(html, summary) {
  $("treeView").innerHTML = `<div class="requested-viz" role="img" aria-label="${requestedVizEsc(summary)}">${html}</div>`;
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
  const phaseIndex = view.phase === "init" ? 0 : view.phase === "ingest" ? 1 : view.phase === "evaluate" ? 2 : 3;
  const dayColumn = (day) => {
    const records = (view.records || []).filter((record) => record.day === day);
    return `<section class="rv-log-day"><header><b>DAY ${day + 1}</b><span>${records.filter((record) => record.state === "done").length}/${records.length}</span></header><div>${records.map((record) => `<article class="${record.state}${view.activeUser === record.user ? " user-active" : ""}"><small>#${record.index + 1}</small><b>${requestedVizEsc(record.user)}</b><span>→</span><em>${requestedVizEsc(record.video)}</em></article>`).join("")}</div></section>`;
  };
  const rows = (view.users || []).map((row) => `<tr class="${view.activeUser === row.user ? "active" : ""}${row.qualifies ? " pass" : " fail"}">
    <td><b>${requestedVizEsc(row.user)}</b></td>
    <td>${row.day1.length ? row.day1.map((video) => `<span>${requestedVizEsc(video)}</span>`).join("") : "—"}</td>
    <td>${row.day2.length ? row.day2.map((video) => `<span>${requestedVizEsc(video)}</span>`).join("") : "—"}</td>
    <td>${row.union.map((video) => `<span>${requestedVizEsc(video)}</span>`).join("") || "—"}</td>
    <td><b class="rv-check ${row.presentBoth ? "yes" : "no"}">${row.presentBoth ? "✓" : "✕"}</b></td>
    <td><b class="rv-check ${row.distinctCount >= 2 ? "yes" : "no"}">${row.distinctCount} ${row.distinctCount >= 2 ? "✓" : "✕"}</b></td>
    <td><strong class="rv-pass-badge ${row.qualifies ? "yes" : "no"}">${row.qualifies ? "LOYAL" : "NO"}</strong></td>
  </tr>`).join("");
  const accepted = (view.answer || (view.users || []).filter((row) => row.qualifies).map((row) => row.user));
  requestedVizSet(`${requestedVizPhases(vi ? ["Đọc 2 ngày", "Cập nhật Set", "Kiểm tra 3 điều kiện", "Loyal users"] : ["Read two days", "Update sets", "Check 3 conditions", "Loyal users"], phaseIndex)}
    <div class="rv-log-flow">${dayColumn(0)}<div class="rv-flow-arrow"><span>→</span><b>user sets</b><span>→</span></div>${dayColumn(1)}</div>
    <section class="rv-panel"><h4>${vi ? "Mỗi user phải PASS cả ba cột cuối" : "Each user must PASS all three final columns"}</h4><div class="rv-table-scroll"><table class="rv-data-table rv-loyal-table"><thead><tr><th>user</th><th>day 1</th><th>day 2</th><th>union distinct</th><th>${vi ? "cả 2 ngày" : "both days"}</th><th>distinct ≥ 2</th><th>result</th></tr></thead><tbody>${rows || `<tr><td colspan="7">—</td></tr>`}</tbody></table></div></section>
    <div class="rv-results"><h4>${vi ? "Đang đủ điều kiện" : "Currently qualified"}</h4><div>${accepted.length ? accepted.map((user) => `<span><b>${requestedVizEsc(user)}</b></span>`).join("") : requestedVizEmpty("∅")}</div></div>`,
  vi ? "Lọc khách trung thành từ hai daily logs" : "Filter loyal customers from two daily logs");
}

// ─── #9015: interval sweep line ─────────────────────────────────────────────
function renderSweep9015View(step) {
  const view = step.sweep9015View || {};
  const vi = lang === "vi";
  const phaseIndex = view.phase === "init" ? 0 : ["start", "end"].includes(view.phase) ? 1 : 2;
  const values = (view.intervals || []).flatMap((interval) => [interval.start, interval.end]);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const span = max - min || 1;
  const pct = (value) => ((value - min) / span) * 100;
  const tracks = (view.intervals || []).map((interval) => {
    const left = pct(interval.start);
    const width = Math.max(1.5, pct(interval.end) - left);
    return `<div class="rv-interval-track${interval.active ? " active" : ""}${interval.current ? " current" : ""}"><b>#${interval.id}</b><div><span style="left:${left}%;width:${width}%"><i>${requestedVizNumber(interval.start)}</i><i>${requestedVizNumber(interval.end)}</i></span></div></div>`;
  }).join("");
  const marker = view.currentEvent ? `<div class="rv-sweep-cursor" style="left:${pct(view.currentEvent.time)}%"><b>${requestedVizNumber(view.currentEvent.time)}</b></div>` : "";
  const events = (view.events || []).map((event, index) => {
    const state = view.phase === "done" ? "done" : event.state;
    return `<div class="rv-event-chip ${state} ${event.kind}"><small>${index + 1}</small><b>${event.kind === "start" ? "+" : "−"} #${event.id}</b><span>@ ${requestedVizNumber(event.time)}</span></div>`;
  }).join("");
  const active = (view.activeAfter || []).length ? view.activeAfter.map((id) => `<span>#${id}</span>`).join("") : requestedVizEmpty("∅");
  const newPairs = (view.newPairs || []).length ? view.newPairs.map(([a, b]) => `<span>#${a} ↔ #${b}</span>`).join("") : requestedVizEmpty(vi ? "Không thêm pair" : "No new pair");
  requestedVizSet(`${requestedVizPhases(vi ? ["Sort START/END", "Quét từ trái sang phải", "Pairs + peak"] : ["Sort START/END", "Sweep left to right", "Pairs + peak"], phaseIndex)}
    <div class="rv-sweep-stats"><span><small>pairs</small><b>${view.overlapPairs}</b></span><span><small>active</small><b>${(view.activeAfter || []).length}</b></span><span><small>peak</small><b>${view.maxActive}</b></span>${view.currentEvent ? `<span><small>${view.currentEvent.kind.toUpperCase()}</small><b>t=${requestedVizNumber(view.currentEvent.time)}</b></span>` : ""}</div>
    <section class="rv-panel"><h4>${vi ? "Interval lanes · chấm tròn là closed endpoints" : "Interval lanes · circles are closed endpoints"}</h4><div class="rv-sweep-chart"><div class="rv-axis"><span>${requestedVizNumber(min)}</span><span>${requestedVizNumber(max)}</span>${marker}</div>${tracks}</div></section>
    <section class="rv-panel"><h4>${vi ? "Event queue đã sort — cùng t: START trước END" : "Sorted event queue — same t: START before END"}</h4><div class="rv-event-stream">${events}</div></section>
    <div class="rv-two-column">
      <section class="rv-panel"><h4>active set</h4><div class="rv-active-set">${active}</div></section>
      <section class="rv-panel"><h4>${vi ? "Pair mới ở START này" : "New pairs at this START"}</h4><div class="rv-pair-set">${newPairs}</div></section>
    </div>
    ${view.currentEvent && view.currentEvent.kind === "start" ? `<div class="rv-focus-equation"><strong>pairs</strong><span>+= active_before (${(view.activeBefore || []).length})</span><b>→ ${view.overlapPairs}</b></div>` : ""}`,
  vi ? "Sweep line đếm overlap của closed intervals" : "Sweep line counting closed-interval overlaps");
}

// ─── #9016: movie-history friends ───────────────────────────────────────────
function renderFriends9016View(step) {
  const view = step.friends9016View || {};
  const vi = lang === "vi";
  const phaseIndex = view.phase === "init" ? 0 : view.phase === "index" ? 1 : view.phase === "evaluate" ? 2 : 3;
  const activeRow = (view.pairs || []).find((pair) => view.activePair && pair.a === view.activePair[0] && pair.b === view.activePair[1]);
  const matchPositions = new Set(activeRow ? activeRow.positions : []);
  const activeUsers = new Set(view.activePair || []);
  const histories = (view.histories || []).map((history) => {
    const older = history.olderCount || 0;
    return `<article class="rv-history${history.active ? " active" : ""}${activeUsers.has(history.index) ? " comparing" : ""}">
      <header><b>${requestedVizEsc(history.user)}</b>${older ? `<small>+${older} ${vi ? "cũ" : "older"}</small>` : ""}</header>
      <div>${history.window.map((movie, position) => `<span class="${activeUsers.has(history.index) && matchPositions.has(position) ? "match" : ""}"><small>pos ${position}</small><b>${requestedVizEsc(movie)}</b></span>`).join("")}</div>
    </article>`;
  }).join("");
  const buckets = (view.buckets || []).map((bucket) => `<div class="rv-index-bucket"><code>(${bucket.position}, ${requestedVizEsc(bucket.movie)})</code><span>→</span><b>[${bucket.users.map(requestedVizEsc).join(", ")}]</b></div>`).join("");
  const pairs = (view.pairs || []).map((pair) => `<tr class="${view.activePair && pair.a === view.activePair[0] && pair.b === view.activePair[1] ? "active" : ""}${pair.qualifies ? " pass" : " fail"}">
    <td><b>${requestedVizEsc(pair.left)}</b> — <b>${requestedVizEsc(pair.right)}</b></td><td>${pair.positions.length ? pair.positions.join(", ") : "—"}</td><td><strong>${pair.count}/${view.k}</strong></td><td><span class="rv-pass-badge ${pair.qualifies ? "yes" : "no"}">${pair.qualifies ? `PASS ≥ ${view.m}` : `FAIL < ${view.m}`}</span></td>
  </tr>`).join("");
  const result = (view.results || []).length ? view.results.map((pair) => `<span><b>${requestedVizEsc(pair[0])}</b> ↔ <b>${requestedVizEsc(pair[1])}</b></span>`).join("") : requestedVizEmpty("∅");
  requestedVizSet(`${requestedVizPhases(vi ? ["Cắt last-k", "Index (position,movie)", "Đếm match ≥ m", "Friend pairs"] : ["Take last-k", "Index (position,movie)", "Count matches ≥ m", "Friend pairs"], phaseIndex)}
    <div class="rv-focus-equation"><span>${vi ? "Điều kiện thật" : "Actual rule"}</span><strong>matches ≥ ${view.m}</strong><span>${vi ? `trong ${view.k} vị trí` : `of ${view.k} positions`}</span></div>
    <section class="rv-panel"><h4>${vi ? "Last-k windows — ô xanh là vị trí đang khớp" : "Last-k windows — green cells match at the same position"}</h4><div class="rv-histories">${histories}</div></section>
    <div class="rv-two-column rv-friends-workspace">
      <section class="rv-panel"><h4>inverted index: (position, movie) → users</h4><div class="rv-index-list">${buckets || requestedVizEmpty("index = {}")}</div>${view.omittedBuckets ? `<small>+${view.omittedBuckets} buckets</small>` : ""}</section>
      <section class="rv-panel"><h4>${vi ? "Xác nhận candidate pairs" : "Verify candidate pairs"}</h4><div class="rv-table-scroll"><table class="rv-data-table"><thead><tr><th>pair</th><th>${vi ? "vị trí khớp" : "matching positions"}</th><th>count</th><th>m=${view.m}</th></tr></thead><tbody>${pairs || `<tr><td colspan="4">—</td></tr>`}</tbody></table></div></section>
    </div>
    <section class="rv-results"><h4>${vi ? "Pairs đã emit" : "Emitted pairs"}</h4><div>${result}</div></section>
    ${view.omittedPairSteps || view.omittedPairs || view.omittedResults ? `<div class="rv-callout">${vi ? "Đã rút gọn phần hiển thị:" : "Display shortened:"} ${view.omittedPairSteps || 0} ${vi ? "bước kiểm tra ẩn" : "hidden checks"}, ${view.omittedPairs || 0} ${vi ? "pair không hiện trong bảng" : "pairs omitted from the table"}, ${view.omittedResults || 0} ${vi ? "kết quả còn lại" : "more results"}.</div>` : ""}`,
  vi ? `So khớp lịch sử phim m=${view.m} trong k=${view.k}` : `Movie-history matching with m=${view.m} of k=${view.k}`);
}

// ─── #9017: ad metrics pipeline ─────────────────────────────────────────────
function renderAds9017View(step) {
  const view = step.ads9017View || {};
  const vi = lang === "vi";
  const phaseIndex = view.phase === "init" || view.phase === "receive" ? 0 : view.phase === "duplicate" ? 1 : view.phase === "aggregate" ? 2 : 3;
  const events = (view.events || []).map((event, index) => `<article class="rv-ad-event ${event.state}">
    <small>#${index + 1} · ${requestedVizEsc(event.eventId)}</small><b>${requestedVizEsc(event.type)}</b><span>${requestedVizEsc(event.campaign)} · ${requestedVizEsc(event.user)}</span><em>$${Number(event.cost).toFixed(2)}</em>
  </article>`).join("");
  const current = view.current ? `<div class="rv-ad-current"><span><small>eventId</small><b>${requestedVizEsc(view.current.eventId)}</b></span><span><small>type</small><b>${requestedVizEsc(view.current.type)}</b></span><span><small>campaign</small><b>${requestedVizEsc(view.current.campaign)}</b></span><span><small>user</small><b>${requestedVizEsc(view.current.user)}</b></span><span><small>cost</small><b>$${Number(view.current.cost).toFixed(2)}</b></span></div>` : requestedVizEmpty(vi ? "Chưa đọc event" : "No event read yet");
  const gateClass = view.decision === "duplicate" ? "duplicate" : view.decision === "accepted" ? "accepted" : "checking";
  const gateText = view.decision === "duplicate" ? (vi ? "ĐÃ THẤY ID → BỎ QUA" : "ID SEEN → SKIP") : view.decision === "accepted" ? (vi ? "ID MỚI → AGGREGATE" : "NEW ID → AGGREGATE") : (vi ? "KIỂM TRA eventId" : "CHECK eventId");
  const campaigns = (view.campaigns || []).map((metric) => {
    const peak = Math.max(1, metric.impressions, metric.clicks, metric.conversions);
    const bar = (name, value, cls) => `<div class="rv-funnel-row ${cls}"><span>${name}</span><div><i style="width:${(value / peak) * 100}%"></i></div><b>${value}</b></div>`;
    return `<article class="rv-campaign-card"><header><b>${requestedVizEsc(metric.campaign)}</b>${metric.warning ? `<span>⚠ ${requestedVizEsc(metric.warning)}</span>` : ""}</header>
      ${bar("impressions", metric.impressions, "impression")}${bar("clicks", metric.clicks, "click")}${bar("conversions", metric.conversions, "conversion")}
      <div class="rv-metric-grid"><span><small>reach</small><b>${metric.reach}</b></span><span><small>spend</small><b>$${Number(metric.spend).toFixed(2)}</b></span><span><small>CTR</small><b>${(metric.ctr * 100).toFixed(1)}%</b></span><span><small>CVR</small><b>${(metric.cvr * 100).toFixed(1)}%</b></span></div>
    </article>`;
  }).join("");
  const seen = (view.seenIds || []).length ? view.seenIds.map((id) => `<span>${requestedVizEsc(id)}</span>`).join("") : requestedVizEmpty("seen = ∅");
  requestedVizSet(`${requestedVizPhases(vi ? ["Nhận event", "Dedupe eventId", "Aggregate campaign", "CTR / CVR"] : ["Receive event", "Dedupe eventId", "Aggregate campaign", "CTR / CVR"], phaseIndex)}
    <section class="rv-panel"><h4>${vi ? "Append-only event stream" : "Append-only event stream"}</h4><div class="rv-ad-stream">${events}</div></section>
    <div class="rv-ad-pipeline"><section class="rv-panel"><h4>${vi ? "Event hiện tại" : "Current event"}</h4>${current}</section><div class="rv-dedupe-gate ${gateClass}"><small>DEDUPE</small><b>${requestedVizEsc(gateText)}</b><span>${view.current ? requestedVizEsc(view.current.eventId) : "—"}</span></div><section class="rv-panel"><h4>${vi ? "ID trong cửa sổ dedupe" : "IDs in dedupe window"}</h4><div class="rv-seen-ids">${seen}</div></section></div>
    <section class="rv-panel"><h4>${vi ? "Campaign metrics — funnel + công thức" : "Campaign metrics — funnel + formulas"}</h4><div class="rv-campaigns">${campaigns || requestedVizEmpty(vi ? "Chưa có campaign" : "No campaign yet")}</div></section>
    <div class="rv-callout">CTR = clicks / impressions · CVR = conversions / clicks · ${vi ? "mẫu số 0 → 0" : "zero denominator → 0"}</div>`,
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

const renderLoyal9014GroupedView = renderLoyal9014View;
renderLoyal9014View = function renderLoyal9014LineDebugView(step) {
  renderLoyal9014GroupedView(step);
  const view = step.loyal9014View || {};
  const root = $("treeView").querySelector(".requested-viz");
  if (root) {
    const rows = root.querySelectorAll(".rv-loyal-table tbody tr");
    (view.users || []).forEach((user, index) => {
      const row = rows[index];
      if (!row) return;
      const status = user.evaluationState || "pending";
      if (status === "pending" || status === "checking") {
        row.classList.remove("pass", "fail");
        row.classList.add(status);
        const cells = row.querySelectorAll("td");
        const dayCheck = cells[4]?.querySelector(".rv-check");
        const distinctCheck = cells[5]?.querySelector(".rv-check");
        const result = cells[6]?.querySelector(".rv-pass-badge");
        if (user.presentBoth === null && dayCheck) {
          dayCheck.classList.remove("yes", "no");
          dayCheck.textContent = "…";
        }
        if (user.distinctEnough === null && distinctCheck) {
          distinctCheck.classList.remove("yes", "no");
          distinctCheck.textContent = `${user.distinctCount} · …`;
        }
        if (result) {
          result.classList.remove("yes", "no");
          result.textContent = status === "checking" ? (lang === "vi" ? "ĐANG XÉT" : "CHECKING") : (lang === "vi" ? "CHỜ" : "WAIT");
        }
      }
    });
  }
  decorateRequestedLineDebug(step, view, { detail: step.note });
};

const renderSweep9015GroupedView = renderSweep9015View;
renderSweep9015View = function renderSweep9015LineDebugView(step) {
  renderSweep9015GroupedView(step);
  const view = step.sweep9015View || {};
  const root = $("treeView").querySelector(".requested-viz");
  if (root && view.operation !== "count-overlaps") {
    root.querySelector(".rv-focus-equation")?.remove();
  }
  decorateRequestedLineDebug(step, view, { detail: step.note });
};

const renderFriends9016GroupedView = renderFriends9016View;
renderFriends9016View = function renderFriends9016LineDebugView(step) {
  renderFriends9016GroupedView(step);
  const view = step.friends9016View || {};
  const root = $("treeView").querySelector(".requested-viz");
  if (root) {
    root.querySelectorAll(".rv-history").forEach((historyNode, index) => {
      const position = view.histories?.[index]?.activePosition;
      if (Number.isInteger(position)) historyNode.querySelectorAll("span")[position]?.classList.add("match");
    });
    root.querySelectorAll(".rv-index-bucket").forEach((bucketNode, index) => {
      const bucket = view.buckets?.[index];
      if (bucket && view.activeBucket && bucket.position === view.activeBucket.position && bucket.movie === view.activeBucket.movie) {
        bucketNode.classList.add("active");
      }
    });
  }
  decorateRequestedLineDebug(step, view, { detail: step.note });
};

const renderAds9017GroupedView = renderAds9017View;
renderAds9017View = function renderAds9017LineDebugView(step) {
  renderAds9017GroupedView(step);
  const view = step.ads9017View || {};
  const root = $("treeView").querySelector(".requested-viz");
  if (root) {
    root.querySelectorAll(".rv-campaign-card").forEach((card, index) => {
      const metric = view.campaigns?.[index];
      if (!metric) return;
      const header = card.querySelector("header");
      if (header && Array.isArray(metric.users)) {
        header.insertAdjacentHTML("beforeend", `<span>users={${metric.users.map(requestedVizEsc).join(", ") || "∅"}}</span>`);
      }
      const values = card.querySelectorAll(".rv-metric-grid span b");
      if (metric.reach === null && values[0]) values[0].textContent = "—";
      if (metric.ctr === null && values[2]) values[2].textContent = "—";
      if (metric.cvr === null && values[3]) values[3].textContent = "—";
      card.classList.toggle("active", metric.campaign === view.activeCampaign);
    });
  }
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
    "parent-init": vi ? "Mỗi node tự làm parent" : "Each node starts as its own parent",
    "rank-init": vi ? "Rank ban đầu bằng 0" : "Initialize every rank to zero",
    "define-find": vi ? "Chuẩn bị hàm tìm root" : "Define how to find a root",
    "edge-loop": vi ? "Chọn cạnh tiếp theo" : "Take the next edge",
    "find-check": vi ? "Đi theo con trỏ parent" : "Follow the parent pointer",
    "path-compress": vi ? "Nén đường đi về root" : "Compress the path to the root",
    "find-return": vi ? "Đã tìm thấy root" : "The root is known",
    "root-u": vi ? "Lưu root của đầu u" : "Store the root of endpoint u",
    "root-v": vi ? "Lưu root của đầu v" : "Store the root of endpoint v",
    "cycle-check": vi ? "So sánh hai root" : "Compare the two roots",
    "rank-compare": vi ? "Chọn root lớn hơn" : "Choose the higher-rank root",
    "swap-roots": vi ? "Đổi thứ tự hai root" : "Swap the two roots",
    "attach-root": vi ? "Gộp hai component" : "Merge the two components",
    "rank-equality": vi ? "Kiểm tra rank bằng nhau" : "Check whether ranks are equal",
    "rank-increment": vi ? "Tăng rank của root mới" : "Increase the new root's rank",
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
    return `<article class="${containsEndpoint ? "active" : ""}"><header><small>COMPONENT</small><b>root ${component.root}</b></header><div>${component.members.map((member) => `<span class="${view.currentEdge?.includes(member) ? "endpoint" : ""}">${member}</span>`).join("")}</div></article>`;
  }).join("") || requestedVizEmpty(vi ? "Forest chưa được khởi tạo" : "The forest is not initialized yet");
  const findState = view.findState;
  const findPath = findState
    ? `<section class="rv-panel rv-dsu-find-panel"><h4>find(${findState.start}) · ${findState.endpoint === "u" ? (vi ? "đầu trái u" : "left endpoint u") : (vi ? "đầu phải v" : "right endpoint v")}</h4><div class="rv-find-path">${findState.path.map((node, index) => `<span class="${findState.compressed.includes(node) ? "compressed" : node === findState.current ? "current" : ""}"><b>${node}</b><small>${node === findState.root ? "ROOT" : `parent[${node}]`}</small></span>${index < findState.path.length - 1 ? "<i>→</i>" : ""}`).join("")}</div><p>${findState.root === null ? (vi ? "Tiếp tục đi theo parent cho tới khi parent[x] = x." : "Keep following parent until parent[x] = x.") : (vi ? `Root tìm được là ${findState.root}.` : `The discovered root is ${findState.root}.`)}</p></section>`
    : "";
  const rootsReady = view.roots.u !== null && view.roots.v !== null;
  const sameRoot = rootsReady && view.roots.u === view.roots.v;
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
