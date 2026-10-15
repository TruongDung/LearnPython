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
  const v=step.coins2218View,vi=lang==='vi',t=(a,b)=>vi?a:b;
  const one=Number(v.approach)===2,final=v.phase==='done',state=v.phase==='state';
  const active=Number.isInteger(v.pileIndex)?v.pileIndex:-1;
  const take=final?null:Number.isInteger(v.take)?v.take:
    v.phase==='pile'&&Number.isInteger(v.coinIndex)?v.coinIndex+1:Math.max(0,v.bestTake||0);
  const coins=(values,cls='')=>values.slice(0,12).map(value=>`<span class="c2218-token ${cls}">${requestedVizEsc(value)}</span>`).join('')+(values.length>12?`<small>+${values.length-12}</small>`:'');
  const slots=(count,cls='')=>Array.from({length:Math.min(count,12)},()=>`<i class="${cls}"></i>`).join('')+(count>12?`<small>+${count-12}</small>`:'');
  const pileHtml=v.piles.map(p=>{
    const selected=Array.isArray(v.selectedCounts)?v.selectedCounts[p.index]:p.index===active?take||0:0;
    const selecting=final&&Array.isArray(v.selectedCounts);
    const visible=p.coins.slice(0,12);
    return `<article class="c2218-pile ${!final&&p.index===active?'active':''}">
      <header><b>P${p.index+1}</b>${selected?`<span class="c2218-take">${selected} ×</span>`:''}</header>
      <div class="c2218-down" aria-label="${t('Lấy từ trên xuống','Take from the top')}">↓</div>
      <div class="c2218-stack">${visible.map((value,i)=>`<div class="c2218-coin ${i<selected?(selecting?'chosen':'trying'):selecting||selected?'remaining':''}" data-pile="${p.index}" data-coin="${i}" data-selected="${i<selected}" aria-label="P${p.index+1}, #${i+1}: ${value}"><b>${value}</b>${i<selected?`<span>${selecting?'✓':'→'}</span>`:''}</div>`).join('')}
      ${p.coins.length>12?`<small>+${p.coins.length-12}</small>`:''}</div>
      ${selected&&Number.isFinite(p.prefix[selected])?`<footer>Σ <b>${p.prefix[selected]}</b></footer>`:'<footer>·</footer>'}
    </article>`;
  }).join('');
  const sourceRow=one?0:active,source=v.dp[sourceRow];
  const previous=Number.isInteger(v.sourceCoins)&&source?source[v.sourceCoins]:null;
  const prefix=active>=0&&v.piles[active]?v.piles[active].prefix[take]:null;
  const ready=typeof previous==='number'&&typeof prefix==='number';
  const comparing=state&&Number.isInteger(v.take);
  const equation=comparing?`<section class="c2218-transfer ${v.reachable===false?'blocked':v.updated===false?'rejected':''}">
    <div class="c2218-from"><small>${t('Trước đó','Earlier piles')}</small><div class="c2218-slots">${slots(v.sourceCoins,'source')}</div><b>${typeof previous==='number'?previous:'∅'}</b></div>
    <em>+</em><div class="c2218-add"><small>P${active+1} · ${take} ×</small><div class="c2218-token-row">${take?coins(v.piles[active].coins.slice(0,take)):'<span class="c2218-zero">0</span>'}</div><b>${prefix??'·'}</b></div>
    <em>→</em><div class="c2218-total"><small>${v.used} ${t('xu','coins')}</small><b>${ready?previous+prefix:'∅'}</b><span>${v.reachable===false||v.updated===false?'×':v.updated===true?'✓':'?'}</span></div>
  </section>`:'';
  const candidates=v.candidates||[],max=Math.max(1,...candidates.map(c=>c.total));
  const choices=state?`<section class="c2218-choices"><header><b>${t('So sánh','Compare')}</b><small>${t('Lấy từ','Take from')} P${active+1}</small></header>${candidates.map(c=>`<div class="c2218-choice ${c.winner?'winner':''} ${c.take===v.take?'testing':''}" data-take="${c.take}" data-total="${c.total}">
    <span class="c2218-choice-count">${c.take} ×</span><div class="c2218-choice-track"><div class="c2218-choice-bar" style="width:${Math.max(3,c.total/max*100)}%"></div><span>${c.previous} + ${c.pileValue}</span></div><b>${c.total}</b><span class="c2218-crown">${c.winner?'★':''}</span></div>`).join('')||'<div class="c2218-wait">…</div>'}</section>`:'';
  const selectedCoins=Array.isArray(v.selectedCounts)?v.piles.flatMap(p=>p.coins.slice(0,v.selectedCounts[p.index])):[];
  const basket=final?`<section class="c2218-basket"><div class="c2218-basket-icon" aria-hidden="true">✓</div><div><small>${t('Đúng','Exactly')} ${v.k} ${t('xu','coins')}</small><div class="c2218-token-row">${selectedCoins.length?coins(selectedCoins,'chosen'):`<div class="c2218-slots">${slots(v.k,'filled')}</div>`}</div></div><strong>${v.answer}</strong></section>`:'';
  const currentRow=one?v.dp.length-1:active+1;
  const dpHtml=`<div class="rv-dp-scroll"><table class="rv-dp-table"><thead><tr><th>${one?'dp':'P'} / j</th>${v.dp[0].map((_,j)=>`<th>${j}</th>`).join('')}</tr></thead><tbody>${v.dp.map((row,i)=>`<tr><th>${one?(v.dpRowLabels?.[i]||'dp'):i===0?'∅':`P1…P${i}`}</th>${row.map((value,j)=>{
    const cls=final&&i===v.dp.length-1&&j===v.k?'answer':state&&i===currentRow&&j===v.used?'current':comparing&&i===sourceRow&&j===v.sourceCoins?'source':'';
    return `<td class="${cls}">${requestedVizEsc(value)}</td>`;
  }).join('')}</tr>`).join('')}</tbody></table></div>`;
  const stage=final?'✓':v.phase==='pile'?'Σ':state?'↗':v.phase==='copy'?'⇄':'↓';
  const stageText=final?t('Tối ưu','Best'):v.phase==='pile'?t('Cộng từ trên','Sum from top'):state?`P${active+1} · j = ${v.used}`:v.phase==='copy'?'dp → new_dp':t('Chỉ lấy từ trên','Top coins only');
  const recurrence=one?'new_dp[j] = max(new_dp[j], dp[j−x] + prefix[x])':'dp[i][j] = max(dp[i][j], dp[i−1][j−t] + prefix[t])';
  const reference=`<section class="c2218-recurrence"><small>${t('Công thức DP · tham khảo','DP formula · reference')}</small><code>${recurrence}</code><div><span>${one?'dp → new_dp':t('i: số chồng','i: piles')}</span><span>${t('j: đúng j xu','j: exactly j coins')}</span><span>${one?'x':'t'}: ${t('lấy từ trên','take from top')}</span></div></section>`;
  requestedVizSet(`<section class="c2218-viz" data-phase="${v.phase}" data-method="${one?2:1}">
    <header class="c2218-heading"><div class="c2218-stage"><b>${stage}</b><span>${stageText}</span></div><div class="c2218-target"><small>k = ${v.k}</small><div class="c2218-slots">${slots(v.k,final?'filled':'')}</div></div>${final?`<strong class="c2218-answer">${v.answer}</strong>`:''}</header>
    <div class="c2218-piles">${pileHtml}</div>${equation}${choices}${basket}
    ${reference}<details class="c2218-dp" open><summary>${t('Bảng DP','DP table')} <span>↗</span></summary>${dpHtml}</details>
    ${v.omitted?`<small class="c2218-condensed">${t('Bước rút gọn','Condensed steps')} · ✓ ${v.answer??''}</small>`:''}
  </section>`,t(`Chọn đúng ${v.k} xu từ ${v.n} chồng`,`Take exactly ${v.k} coins from ${v.n} piles`),'group');
}

// ─── #9006: BFS shortest path ───────────────────────────────────────────────
function requestedBfsGraph(view) {
  const nodes = view.nodes || [];
  if (!nodes.length || view.graphReady === false) return `<div class="rv-bfs-empty">${lang === "vi" ? "Graph sẽ xuất hiện ở bước khởi tạo." : "The graph appears at initialization."}</div>`;
  // Layout uses input topology only; displayed edges, distances and colors use this instruction's state.
  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  (view.layoutEdges || view.edges || []).forEach((edge) => { adjacency.get(edge.u)?.push(edge.v); adjacency.get(edge.v)?.push(edge.u); });
  const start = nodes.find((node) => node.isStart)?.id;
  const levels = new Map([[start, 0]]);
  const order = [start];
  for (let i = 0; i < order.length; i++) {
    for (const next of adjacency.get(order[i]) || []) {
      if (!levels.has(next)) { levels.set(next, levels.get(order[i]) + 1); order.push(next); }
    }
  }
  const lastLevel = Math.max(0, ...levels.values()) + 1;
  const groups = new Map();
  nodes.forEach((node) => {
    const level = levels.get(node.id) ?? lastLevel;
    if (!groups.has(level)) groups.set(level, []);
    groups.get(level).push(node);
  });
  const compactLayers = groups.size <= 5 && Math.max(...[...groups.values()].map((group) => group.length)) <= 4;
  const width = 380;
  const height = compactLayers ? Math.max(130, Math.max(...[...groups.values()].map((group) => group.length)) * 78) : Math.ceil(nodes.length / 5) * 78;
  const positions = new Map();
  if (compactLayers) {
    [...groups.values()].forEach((group, column) => group.forEach((node, row) => positions.set(node.id, {
      x: groups.size === 1 ? width / 2 : 36 + column * (width - 72) / (groups.size - 1),
      y: (row + .5) * height / group.length,
    })));
  } else {
    nodes.forEach((node, index) => positions.set(node.id, { x: 38 + (Math.floor(index / 5) % 2 ? 4 - index % 5 : index % 5) * 76, y: 39 + Math.floor(index / 5) * 78 }));
  }
  const aliases = nodes.some((node) => node.name.length > 6);
  const edges = (view.edges || []).map((edge) => {
    const from = positions.get(edge.u);
    const to = positions.get(edge.v);
    if (!from || !to) return "";
    const cls = edge.path ? "path" : edge.current ? "current" : edge.tree ? "tree" : "";
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const bend = Math.abs(to.x - from.x) < 1 && distance > 90 || distance > 160;
    const curve = bend ? `Q ${(from.x + to.x) / 2 - (to.y - from.y) / distance * 60} ${(from.y + to.y) / 2 + (to.x - from.x) / distance * 60}` : "L";
    return `<path class="rv-bfs-map-edge ${cls}" d="M ${from.x} ${from.y} ${curve} ${to.x} ${to.y}"/>`;
  }).join("");
  const nodeSvg = nodes.map((node) => {
    const pos = positions.get(node.id);
    const classes = ["rv-bfs-map-node", node.status, node.isNeighbor ? "neighbor" : ""].filter(Boolean).join(" ");
    return `<g class="${classes}"><title>${requestedVizEsc(node.name)} · d=${node.distance ?? "—"}</title>
      <circle cx="${pos.x}" cy="${pos.y}" r="25" />
      <text class="name" x="${pos.x}" y="${pos.y - 2}" text-anchor="middle">${requestedVizEsc(aliases ? `#${node.id + 1}` : node.name)}</text>
      <text class="distance" x="${pos.x}" y="${pos.y + 14}" text-anchor="middle">d=${node.distance ?? "—"}</text>
    </g>`;
  }).join("");
  return `<div class="rv-bfs-map"><svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${edges}${nodeSvg}</svg></div>${aliases ? `<div class="rv-bfs-map-note">${lang === "vi" ? "Tên dài dùng nhãn #; tên đầy đủ có trong thông tin node bên dưới." : "Long names use # labels; full names are listed in node details below."}</div>` : ""}`;
}

function renderBfs9006View(step) {
  const view = step.bfs9006View || {};
  const vi = lang === "vi";
  const operation = view.operation || view.phase;
  const nodes = view.nodes || [];
  const queue = view.queue || [];
  const path = view.path || [];
  const current = nodes.find((node) => node.id === view.current);
  const neighbor = nodes.find((node) => node.id === view.neighbor);
  const phaseIndex = ["graph", "init"].includes(view.phase) ? 0 : view.phase === "done" ? 3 : view.phase === "reconstruct" ? 2 : 1;
  const discovered = nodes.filter((node) => node.discovered ?? node.distance !== null);
  const names = {
    import: ["Nạp thư viện", "Import"], call: ["Nhận graph, start và target", "Read graph, start and target"], "graph-init": ["Tạo danh sách neighbor", "Initialize neighbor lists"], "edge-loop": ["Đọc một cạnh", "Read an edge"], "append-left": ["Thêm neighbor chiều thứ nhất", "Add the first neighbor direction"], "append-right": ["Thêm neighbor chiều ngược lại", "Add the reverse neighbor direction"], "sort-loop": ["Chọn danh sách cần sắp xếp", "Choose a neighbor list"], "sort-neighbors": ["Sắp xếp thứ tự neighbor", "Sort neighbors"],
    "queue-init": ["Đưa start vào queue", "Put start in the queue"], "parent-init": ["Đánh dấu start đã phát hiện", "Mark start discovered"], "distance-init": ["Khoảng cách của start là 0", "Set start distance to 0"], "while-check": ["Queue còn node để xử lý?", "Does the queue have work?"], dequeue: ["Lấy node ở đầu queue", "Remove the front node"], "target-check": ["Node này là target?", "Is this node the target?"], break: ["Đã tới target · dừng BFS", "Target reached · stop BFS"],
    "neighbor-loop": ["Xét một neighbor", "Inspect a neighbor"], "visited-check": ["Neighbor đã phát hiện chưa?", "Was this neighbor discovered?"], continue: ["Đã phát hiện · bỏ qua", "Already discovered · skip"], "set-parent": ["Ghi nhớ đường đến neighbor", "Remember how to reach the neighbor"], "set-distance": ["Tính khoảng cách mới", "Compute the new distance"], enqueue: ["Thêm neighbor vào cuối queue", "Add neighbor at the back"],
    "reachable-check": ["Có thể đi tới target?", "Is the target reachable?"], "return-empty": ["Không có đường đi", "No path exists"], "path-init": ["Tạo path rỗng", "Initialize path"], "cursor-init": ["Bắt đầu từ target", "Start from target"], "parent-loop": ["Đã đi hết chuỗi parent?", "Is the parent chain finished?"], "path-append": ["Thêm node vào path ngược", "Append to the backward path"], "follow-parent": ["Đi ngược về parent", "Follow the parent backward"], "path-reverse": ["Đảo path thành start → target", "Reverse path to start → target"], return: ["Trả đường đi ngắn nhất", "Return the shortest path"],
  };
  const parentName = (node) => node?.discovered ? node.isStart ? "None (start)" : node.parent ?? "—" : "—";
  let explanation = typeof view.actionText === "object" ? view.actionText?.[vi ? "vi" : "en"] : view.actionText;
  let equation = "";
  if (operation === "dequeue") {
    explanation = vi ? `${current?.name} được lấy ra khỏi đầu queue. Đây là node đang xử lý, không còn nằm trong queue.` : `${current?.name} was removed from the front. It is the current node and is no longer in the queue.`;
    equation = `queue.popleft() → ${current?.name}`;
  } else if (operation === "visited-check" || operation === "continue") {
    explanation = view.reason === "already-discovered" ? (vi ? `${neighbor?.name} đã có trong parent. Giữ nguyên parent và distance, không thêm vào queue lần nữa.` : `${neighbor?.name} is already in parent. Keep its parent and distance; do not queue it again.`) : (vi ? `${neighbor?.name} chưa có trong parent. Các dòng tiếp theo sẽ gán parent, distance rồi thêm vào queue.` : `${neighbor?.name} is not in parent yet. The next instructions set its parent and distance, then enqueue it.`);
    equation = `${neighbor?.name} ${view.reason === "already-discovered" ? "∈" : "∉"} parent`;
  } else if (operation === "set-parent") {
    explanation = vi ? `Lần đầu phát hiện ${neighbor?.name} từ ${current?.name}. Parent cho biết phải quay về node nào khi dựng path.` : `${neighbor?.name} was first discovered from ${current?.name}. Its parent tells us where to go backward when building the path.`;
    equation = `parent[${neighbor?.name}] = ${current?.name}`;
  } else if (operation === "set-distance") {
    explanation = vi ? `Đi từ ${current?.name} sang ${neighbor?.name} qua thêm một cạnh.` : `Moving from ${current?.name} to ${neighbor?.name} adds one edge.`;
    equation = `d[${neighbor?.name}] = ${current?.distance} + 1 = ${neighbor?.distance}`;
  } else if (operation === "enqueue") {
    explanation = vi ? `${neighbor?.name} được thêm ở cuối queue. Node ở đầu sẽ được xử lý trước.` : `${neighbor?.name} was added at the back. The node at the front will be processed first.`;
    equation = `queue.append(${neighbor?.name})`;
  } else if (operation === "path-append") {
    explanation = vi ? `Thêm ${current?.name} vào path đang thu thập từ target về start. Path này chưa được đảo.` : `Append ${current?.name} while collecting the path from target back to start. This path has not been reversed yet.`;
    equation = `path.append(${current?.name})`;
  } else if (operation === "follow-parent") {
    const last = path.at(-1);
    explanation = current ? (vi ? `Từ ${last}, đi về parent là ${current.name}.` : `From ${last}, move back to its parent ${current.name}.`) : (vi ? "Parent của start là None: đã đi hết chuỗi parent." : "The start's parent is None: the parent chain is finished.");
    equation = `node = parent[${last}] → ${current?.name ?? "None"}`;
  } else if (operation === "path-reverse") {
    explanation = vi ? "Đảo thứ tự vừa thu thập để đường đi bắt đầu ở start và kết thúc ở target." : "Reverse the collected order so the route begins at start and ends at target.";
    equation = "path.reverse()";
  }
  const instruction = `<section class="rv-bfs-instruction${operation === "continue" ? " skip" : ""}">${current || neighbor ? `<header><span><small>${view.phase === "reconstruct" ? (vi ? "Cursor" : "Cursor") : vi ? "Đang xử lý" : "Current"}</small><b>${requestedVizEsc(current?.name ?? "—")}</b></span>${neighbor ? `<i>→</i><span><small>${vi ? "Neighbor đang xét" : "Neighbor"}</small><b>${requestedVizEsc(neighbor.name)}</b></span>` : ""}</header>` : ""}${equation ? `<code>${requestedVizEsc(equation)}</code>` : ""}<p>${requestedVizEsc(explanation || (vi ? "State phản ánh đúng dòng code đang sáng." : "The state reflects the highlighted source instruction."))}</p>${neighbor && ["neighbor-loop", "visited-check", "continue", "set-parent", "set-distance", "enqueue"].includes(operation) ? `<div class="rv-bfs-neighbor-facts"><span class="${operation === "set-parent" ? "focus" : ""}"><small>parent[${requestedVizEsc(neighbor.name)}]</small><b>${requestedVizEsc(parentName(neighbor))}</b></span><span class="${operation === "set-distance" ? "focus" : ""}"><small>distance</small><b>${neighbor.distance ?? "—"}</b></span><span class="${operation === "enqueue" ? "focus" : ""}"><small>${vi ? "Trong queue?" : "In queue?"}</small><b>${queue.some((item) => item.id === neighbor.id) ? (vi ? "Có" : "Yes") : vi ? "Không" : "No"}</b></span></div>` : ""}</section>`;
  const queueItem = (item, index) => `<article class="rv-bfs-q-item${index === 0 ? " front" : ""}${operation === "enqueue" && item.id === neighbor?.id ? " focus" : ""}"><small>${index === 0 ? (vi ? "ĐẦU" : "FRONT") : index === queue.length - 1 ? (vi ? "CUỐI" : "BACK") : `#${index + 1}`}</small><b>${requestedVizEsc(item.name)}</b><span>d=${item.distance ?? "—"}</span></article>`;
  const visibleQueue = queue.length > 6 ? `${queue.slice(0, 4).map(queueItem).join("")}<span class="rv-bfs-q-gap">⋯ +${queue.length - 5}</span>${queueItem(queue.at(-1), queue.length - 1)}` : queue.map(queueItem).join("");
  const queuePanel = `<section class="rv-panel rv-bfs-queue-panel"><header><h4>${vi ? "Queue · lấy ở đầu, thêm ở cuối" : "Queue · remove front, add back"}</h4><span>${queue.length}</span></header><div class="rv-bfs-queue-items">${queue.length ? visibleQueue : `<div class="rv-bfs-empty">${view.queueReady === false ? (vi ? "Queue chưa khởi tạo." : "Queue is not initialized.") : vi ? "Queue rỗng." : "The queue is empty."}</div>`}</div>${queue.length > 6 ? `<details><summary>+${queue.length - 5} ${vi ? "node ở giữa" : "middle nodes"}</summary><div class="rv-bfs-queue-items">${queue.slice(4, -1).map((item, index) => queueItem(item, index + 4)).join("")}</div></details>` : ""}</section>`;
  const forwardPath = operation === "path-reverse" || view.phase === "done";
  const pathPanel = `<section class="rv-panel rv-bfs-route${view.phase === "done" && path.length ? " done" : ""}"><header><h4>${forwardPath ? (vi ? "Đường đi · start → target" : "Route · start → target") : vi ? "Thu thập path · target → start" : "Collect path · target → start"}</h4>${forwardPath && path.length ? `<span>${view.distance} ${vi ? "cạnh" : "edges"}</span>` : ""}</header>${path.length ? `<ol>${path.map((name, index) => `<li${operation === "path-append" && index === path.length - 1 ? ' class="focus"' : ""}><small>#${index + 1}${index ? " →" : ""}</small><b>${requestedVizEsc(name)}</b></li>`).join("")}</ol>` : `<div class="rv-bfs-empty">${view.phase === "done" ? (vi ? "Không có đường đi tới target." : "There is no path to the target.") : vi ? "Path đang rỗng; bắt đầu ở target." : "The path is empty; begin at target."}</div>`}</section>`;
  const graphPanel = `<section class="rv-panel rv-bfs-graph-panel"><header><h4>${vi ? "Graph vô hướng" : "Undirected graph"}</h4><span>${nodes.length} nodes</span></header>${requestedBfsGraph(view)}<footer class="rv-bfs-map-legend"><span class="queued">${vi ? "Xanh: trong queue" : "Blue: queued"}</span><span class="current">${vi ? "Vàng: đang xử lý" : "Gold: current"}</span><span class="path">${vi ? "Xanh lá: path" : "Green: path"}</span></footer></section>`;
  const states = vi ? { unseen: "Chưa phát hiện", discovered: "Đã có parent", queued: "Trong queue", current: "Đang xử lý", expanded: "Đã xét xong", path: "Trong path" } : { unseen: "Unseen", discovered: "Has parent", queued: "Queued", current: "Current", expanded: "Expanded", path: "In path" };
  const records = `<details class="rv-bfs-node-details"><summary>${vi ? "Xem distance và parent của mọi node" : "View every node's distance and parent"} · ${discovered.length}/${nodes.length}</summary><div>${nodes.map((node) => `<article class="rv-bfs-record ${requestedVizEsc(node.status)}"><header><b>#${node.id + 1} · ${requestedVizEsc(node.name)}</b><small>${requestedVizEsc(states[node.status] || node.status)}</small></header><div><span>d = <b>${node.distance ?? "—"}</b></span><span>parent = <b>${requestedVizEsc(parentName(node))}</b></span></div></article>`).join("")}</div></details>`;
  const adjacencyRows = view.adjacency || [];
  const activeAdjacency = adjacencyRows.find((row) => row.id === view.current);
  const adjacencyPanel = `<details class="rv-bfs-adjacency"${view.phase === "graph" && view.graphReady && nodes.length <= 6 ? " open" : ""}><summary>${vi ? "Danh sách neighbor · mỗi cạnh có 2 chiều" : "Neighbor lists · each edge has 2 directions"}</summary><div>${(activeAdjacency ? [activeAdjacency, ...adjacencyRows.filter((row) => row.id !== activeAdjacency.id)] : adjacencyRows).map((row) => `<article class="${row.id === view.current ? "focus" : ""}"><b>${requestedVizEsc(row.name)}</b><span>→ ${row.neighbors.map(requestedVizEsc).join(", ") || "∅"}</span></article>`).join("")}</div></details>`;
  requestedVizSet(`<div class="rv-bfs-9006 phase-${requestedVizEsc(view.phase || "init")}">
    ${requestedVizPhases(vi ? ["Dựng graph", "BFS theo lớp", "Dựng path", "Kết quả"] : ["Build graph", "BFS layers", "Build path", "Results"], phaseIndex)}
    <div class="rv-action-banner"><small>${vi ? "DÒNG" : "LINE"} ${step.codeLines?.[0] || "—"}</small><b>${requestedVizEsc(names[operation]?.[vi ? 0 : 1] || operation)}</b></div>
    <div class="rv-bfs-endpoints"><span><small>START</small><b>${requestedVizEsc(view.start)}</b></span><i>→</i><span><small>TARGET</small><b>${requestedVizEsc(view.target)}</b></span></div>
    <div class="rv-bfs-summary"><span><small>Queue</small><b>${view.queueReady === false ? "—" : queue.length}</b></span><span><small>${vi ? "Đã phát hiện" : "Discovered"}</small><b>${discovered.length}<em> / ${nodes.length}</em></b></span><span><small>d(target)</small><b>${view.distance ?? "—"}</b></span></div>
    ${view.phase !== "done" ? instruction : `<div class="rv-bfs-result-note${path.length ? " found" : " unreachable"}"><b>${path.length ? (vi ? `Đường đi ngắn nhất: ${view.distance} cạnh` : `Shortest path: ${view.distance} edges`) : vi ? "Target không thể tới được" : "Target is unreachable"}</b><span>${path.length ? (vi ? "BFS xử lý các node gần start trước, nên lần phát hiện đầu tiên cho khoảng cách ngắn nhất." : "BFS processes closer nodes first, so first discovery gives the shortest distance.") : vi ? "Queue đã rỗng và target vẫn chưa có parent. Trả []." : "The queue is empty and target has no parent. Return []."}</span></div>`}
    ${view.phase === "done" || view.phase === "reconstruct" && view.pathReady !== false ? pathPanel : view.phase !== "graph" && view.phase !== "reconstruct" ? queuePanel : ""}
    ${nodes.length > 10 && view.phase !== "graph" ? `<details class="rv-bfs-big-graph"><summary>${vi ? "Xem toàn bộ graph" : "View the full graph"}</summary>${graphPanel}</details>` : graphPanel}
    ${view.phase !== "graph" ? records : ""}${adjacencyPanel}
    <footer class="rv-bfs-rule">${vi ? "distance = số cạnh từ start · parent = node dẫn tới lần đầu" : "distance = edges from start · parent = first-discovery predecessor"}</footer></div>`,
  vi ? `BFS từ ${view.start} tới ${view.target}` : `BFS from ${view.start} to ${view.target}`, "group");
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
  if (!nodes.length) return `<div class="rv-square-idle">${lang === "vi" ? "Graph xuất hiện sau khi tạo values." : "The graph appears after values are initialized."}</div>`;
  const edges = view.edges || [];
  const neighbors = new Map(nodes.map((node) => [node.value, []]));
  edges.forEach((edge) => { neighbors.get(edge.u)?.push(edge.v); neighbors.get(edge.v)?.push(edge.u); });
  const order = (a, b) => neighbors.get(a).length - neighbors.get(b).length || a - b;
  const seen = new Set();
  const layout = [];
  for (const start of nodes.map((node) => node.value).sort(order)) {
    if (seen.has(start)) continue;
    const queue = [start];
    seen.add(start);
    for (let i = 0; i < queue.length; i++) {
      const value = queue[i];
      layout.push(value);
      for (const next of [...neighbors.get(value)].sort(order)) {
        if (!seen.has(next)) { seen.add(next); queue.push(next); }
      }
    }
  }
  const columns = Math.min(5, nodes.length);
  const width = columns * 72;
  const height = Math.ceil(nodes.length / columns) * 70;
  const positions = new Map(layout.map((value, index) => {
    const row = Math.floor(index / columns);
    const column = row % 2 ? columns - 1 - index % columns : index % columns;
    return [value, { x: 36 + column * 72, y: 35 + row * 70 }];
  }));
  const edgeSvg = edges.map((edge) => {
    const a = positions.get(edge.u);
    const b = positions.get(edge.v);
    if (!a || !b) return "";
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    const curve = distance > 73 ? `Q ${(a.x + b.x) / 2 - (b.y - a.y) / distance * 50} ${(a.y + b.y) / 2 + (b.x - a.x) / distance * 50}` : "L";
    return `<path class="rv-square-net-edge${edge.inPath ? " path" : ""}${edge.current ? " current" : ""}" d="M ${a.x} ${a.y} ${curve} ${b.x} ${b.y}"/>`;
  }).join("");
  const nodeSvg = nodes.map((node) => {
    const p = positions.get(node.value);
    const focus = node.value === view.focus;
    return `<g class="rv-square-net-node ${requestedVizEsc(node.state)}${focus ? " current" : ""}"><circle cx="${p.x}" cy="${p.y}" r="17"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle">${node.value}</text></g>`;
  }).join("");
  return `<div class="rv-square-network"><svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${edgeSvg}${nodeSvg}</svg></div>`;
}

function renderSquare9013View(step) {
  const view = step.square9013View || {};
  const vi = lang === "vi";
  const operation = view.operation || view.phase;
  const phaseIndex = view.phase === "graph" ? 0 : view.phase === "done" ? 3 : ["dead-end", "backtrack"].includes(view.phase) ? 2 : 1;
  const path = view.path || [];
  const used = Array.isArray(view.used) ? view.used : null;
  const nodes = view.nodes || [];
  const solved = view.phase === "done" && Array.isArray(view.solution) && view.solution.length === view.n;
  const operations = {
    call: ["Nhận n", "Read n"], "define-is-square": ["Tạo hàm kiểm tra square", "Define square check"], "build-values": ["Tạo dãy 1..n", "Build values 1..n"], "build-graph": ["Dựng compatibility graph", "Build compatibility graph"],
    "path-init": ["Tạo path rỗng", "Initialize path"], "used-init": ["Tạo used Set", "Initialize used set"], "define-dfs": ["Định nghĩa DFS", "Define DFS"], "sort-starts": ["Sắp xếp điểm bắt đầu", "Sort starting values"], "start-loop": ["Chọn điểm bắt đầu", "Choose starting value"], "call-dfs": ["Gọi DFS", "Call DFS"],
    "path-append": ["Thêm node vào path", "Append node to path"], "mark-used": ["Đánh dấu node đã dùng", "Mark node used"], "complete-check": ["Kiểm tra độ dài path", "Check path length"], "build-candidates": ["Lấy neighbor chưa dùng", "Find unused neighbors"], "candidate-loop": ["Chọn candidate", "Choose candidate"], recurse: ["Đi sâu vào DFS", "Recurse into DFS"],
    "child-result": ["Nhận kết quả nhánh con", "Receive child result"], "child-check": ["Kiểm tra nhánh con", "Check child result"], "return-true": ["Trả True", "Return True"], "unmark-used": ["Bỏ đánh dấu used", "Unmark used node"], "path-pop": ["Bỏ node cuối khỏi path", "Pop last path node"], "return-false": ["Trả False", "Return False"], "dfs-result": ["Nhận kết quả DFS", "Receive DFS result"], "found-check": ["Kiểm tra kết quả DFS", "Check DFS result"], "return-path": ["Trả arrangement", "Return arrangement"], "return-empty": ["Không có arrangement", "No arrangement exists"],
  };
  const pathTiles = path.map((value, index) => {
    const previous = path[index - 1];
    return `<li class="${operation === "path-append" && index === path.length - 1 ? "focus" : ""}"><header><small>#${index + 1}</small><b>${value}</b></header><span>${index ? `${previous}+${value}=${Math.sqrt(previous + value)}²` : vi ? "bắt đầu" : "start"}</span></li>`;
  }).join("");
  const pathPanel = `<section class="rv-panel rv-square-route${solved ? " solved" : ""}${operation === "path-pop" ? " removed" : ""}"><header><h4>${solved ? (vi ? "Arrangement tìm được" : "Found arrangement") : (vi ? "Path hiện tại" : "Current path")}</h4><span>${path.length}/${view.n}</span></header>${path.length ? `<ol>${pathTiles}</ol>` : `<div class="rv-square-idle">${view.pathReady === false ? (vi ? "Path chưa được khởi tạo." : "Path is not initialized yet.") : vi ? "Path đang rỗng." : "The path is empty."}</div>`}</section>`;
  const membership = `<section class="rv-panel rv-square-used${["mark-used", "unmark-used"].includes(operation) ? " focus" : ""}"><header><h4>used Set</h4><span>${used ? used.length : "—"}</span></header>${used ? `<div>${nodes.map((node) => `<span class="${used.includes(node.value) ? "locked" : "free"}${node.value === view.focus ? " current" : ""}">${node.value}</span>`).join("")}</div><footer>${vi ? "Xanh lá: đã dùng · nhạt: còn trống" : "Green: used · muted: available"}</footer>` : `<div class="rv-square-idle">${vi ? "Set chưa được khởi tạo." : "The set is not initialized yet."}</div>`}</section>`;
  const startFrame = ["sort-starts", "start-loop", "call-dfs", "dfs-result", "found-check"].includes(operation);
  const candidateFrame = startFrame || ["build-candidates", "candidate-loop", "recurse", "child-result", "child-check", "unmark-used", "path-pop", "return-false"].includes(operation) || operation === "return-true" && view.reason === "child-success";
  const candidates = (view.candidates || []).map((value) => {
    const degree = nodes.find((node) => node.value === value)?.degree ?? 0;
    return `<span class="rv-square-choice${value === view.attempted ? " current" : ""}${used?.includes(value) ? " used" : ""}"><b>${value}</b><small>deg ${degree}${used?.includes(value) ? " · used" : ""}</small></span>`;
  }).join("");
  const candidatePanel = candidateFrame ? `<section class="rv-panel rv-square-options${view.phase === "dead-end" ? " dead-end" : ""}"><h4>${startFrame ? (vi ? "Điểm bắt đầu · degree nhỏ trước" : "Starting values · lower degree first") : vi ? `Candidates của dfs(${view.focus}) · snapshot dòng 12` : `Candidates of dfs(${view.focus}) · line 12 snapshot`}</h4><div>${candidates || `<span class="rv-square-idle">${vi ? "Không còn neighbor chưa dùng." : "No unused neighbors remain."}</span>`}</div></section>` : "";
  const currentValue = Number.isInteger(view.focus) ? view.focus : view.attempted;
  let expression = "";
  if (operation === "path-append") expression = `path.append(${currentValue})`;
  else if (operation === "mark-used") expression = `used.add(${currentValue})`;
  else if (operation === "unmark-used") expression = `used.remove(${currentValue})`;
  else if (operation === "path-pop") expression = `path.pop() → ${currentValue}`;
  else if (operation === "complete-check") expression = `len(path) == n → ${view.reason === "complete" ? "True" : "False"}`;
  else if (operation === "recurse" || operation === "candidate-loop") expression = `${view.focus}+${view.attempted}=${Math.sqrt(view.focus + view.attempted)}² → dfs(${view.attempted})`;
  else if (operation === "call-dfs") expression = `dfs(${view.attempted})`;
  else if (operation === "return-true") expression = "return True";
  else if (operation === "return-false") expression = "return False";
  else if (["child-result", "child-check", "dfs-result", "found-check"].includes(operation)) expression = `${["child-result", "child-check"].includes(operation) ? "child_ok" : "found"} = ${["success", "true"].includes(view.reason) ? "True" : "False"}`;
  else if (operation === "build-candidates") expression = `${(view.candidates || []).length} ${vi ? "neighbor chưa dùng" : "unused neighbors"}`;
  const action = expression ? `<div class="rv-square-instruction${["dead-end", "backtrack"].includes(view.phase) ? " backtrack" : ""}"><small>${Number.isInteger(currentValue) ? `dfs(${currentValue})` : "DFS"}</small><code>${requestedVizEsc(expression)}</code>${view.phase === "dead-end" ? `<span>${vi ? "Path chưa đủ n; nhánh này phải quay lui." : "The path is incomplete; this branch must backtrack."}</span>` : ""}</div>` : "";
  const graphPanel = `<section class="rv-panel rv-square-overview"><header><h4>Compatibility graph</h4><span>${(view.edges || []).length} ${vi ? "cạnh" : "edges"}</span></header>${requestedSquareGraph(view)}<footer>${vi ? "Cạnh a—b ⇔ a+b là square · xanh lá: path" : "Edge a—b ⇔ a+b is square · green: path"}</footer>${(view.edges || []).length ? `<details><summary>${vi ? "Xem tổng trên từng cạnh" : "View each edge sum"}</summary><div class="rv-square-edge-proofs">${view.edges.map((edge) => `<span>${edge.u}+${edge.v}=${edge.root}²</span>`).join("")}</div></details>` : ""}</section>`;
  requestedVizSet(`<div class="rv-square-9013 phase-${requestedVizEsc(view.phase || "search")}">
    ${requestedVizPhases(vi ? ["Dựng graph", "Chọn node", "Quay lui", "Kết quả"] : ["Build graph", "Choose node", "Backtrack", "Results"], phaseIndex)}
    <div class="rv-action-banner"><small>${vi ? "DÒNG" : "LINE"} ${step.codeLines?.[0] || "—"}</small><b>${requestedVizEsc(operations[operation]?.[vi ? 0 : 1] || operation)}</b></div>
    <div class="rv-square-summary"><span><small>Path</small><b>${path.length}<em> / ${view.n}</em></b></span><span><small>Used</small><b>${used ? used.length : "—"}</b></span><span><small>${vi ? "Lần gọi DFS" : "DFS calls"}</small><b>${view.attempts || 0}</b></span><span><small>${vi ? "Quay lui" : "Backtracks"}</small><b>${view.backtracks || 0}</b></span></div>
    ${view.phase === "graph" ? graphPanel : view.phase === "done" ? `${solved ? pathPanel : `<section class="rv-panel rv-square-no-solution"><b>${vi ? "Không tìm được arrangement" : "No arrangement exists"}</b><span>${vi ? "Mọi điểm bắt đầu và nhánh hợp lệ đều đã thất bại." : "Every starting value and legal branch failed."}</span></section>`}<div class="rv-square-verdict">${solved ? (vi ? "✓ Mỗi số xuất hiện đúng một lần; mọi tổng kề đều là square." : "✓ Every value appears once; every adjacent sum is square.") : (vi ? "Kết quả: []" : "Result: []")}</div>` : `${action}${pathPanel}${candidatePanel}${membership}`}
    ${view.phase !== "graph" ? `<details class="rv-square-graph-details"><summary>${vi ? "Xem compatibility graph" : "View compatibility graph"}</summary>${graphPanel}</details>` : ""}
    ${view.omitted ? `<div class="rv-square-trace-note">${view.omitted} ${vi ? "instruction trung gian đã thu gọn; kết quả cuối vẫn đầy đủ." : "intermediate instructions omitted; the final result is complete."}</div>` : ""}
    <footer class="rv-square-rule">${vi ? "Mỗi số dùng một lần · tổng hai số kề là số chính phương" : "Use each value once · adjacent values sum to a perfect square"}</footer></div>`,
  vi ? `Backtracking square arrangement n=${view.n}` : `Square-arrangement backtracking for n=${view.n}`, "group");
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
  const v = step.matrix542View || {};
  const vi = lang === "vi";
  const t = (viText, enText) => vi ? viText : enText;
  const phaseIndex = v.phase === "bfs" ? 1 : v.phase === "result" ? 2 : 0;
  const stages = [
    ["◎", "SOURCE"],
    [")))", "WAVE"],
    ["#", "DIST"],
  ].map(([icon, name], index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "";
    return `<span class="${state}"><i>${index < phaseIndex ? "✓" : icon}</i><b>${name}</b></span>${index < 2 ? "<em>›</em>" : ""}`;
  }).join("");
  const key = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const originKey = key(v.origin || v.current);
  const neighborKey = key(v.neighbor);
  const discoveredKey = key(v.discovered);
  const cells = (v.cells || []).flatMap((row) => row.map((cell) => {
    const cellKey = `${cell.row},${cell.col}`;
    const known = cell.distance !== null && cell.distance !== undefined;
    const classes = [
      "m542-cell",
      cell.isSource ? "source" : "",
      known ? "known" : "unknown",
      cellKey === originKey ? "origin" : "",
      cellKey === neighborKey ? "neighbor" : "",
      cellKey === discoveredKey ? "discovered" : "",
    ].filter(Boolean).join(" ");
    const display = known ? cell.distance : v.phase === "setup" && v.operation !== "distance-init" ? (cell.input ?? "·") : "·";
    const aria = cell.isSource
      ? `(${cell.row},${cell.col}), source, distance 0`
      : `(${cell.row},${cell.col}), ${known ? `distance ${cell.distance}` : "unvisited"}`;
    return `<div class="${classes}" style="--m542-d:${known ? cell.distance : -1}" aria-label="${requestedVizEsc(aria)}">
      <small>${cell.row},${cell.col}</small><strong>${requestedVizEsc(display)}</strong>${cell.isSource ? "<i>◎</i>" : ""}
    </div>`;
  })).join("");
  const waves = (v.waves || []).map((wave) => {
    const complete = wave.total > 0 && wave.reached >= wave.total;
    const active = v.phase === "bfs" && wave.distance === v.activeDistance;
    return `<span class="${complete ? "done" : ""} ${active ? "active" : ""}" style="--wave:${wave.distance}"><i></i><b>d=${wave.distance}</b><small>${wave.reached}/${wave.total}</small></span>`;
  }).join("<em>›</em>");
  const queueItems = (v.queue || []).slice(0, 10).map((cell, index) => `<span class="${index === 0 ? "front" : ""}">
    <small>${index === 0 ? "POP" : `+${index}`}</small><b>${cell.row},${cell.col}</b><i>${cell.distance ?? "·"}</i>
  </span>`).join("<em>›</em>");
  const queue = queueItems || `<b class="m542-empty">∅</b>`;
  const queueMore = (v.queue || []).length > 10 ? `<small class="m542-more">+${v.queue.length - 10}</small>` : "";
  const sourceDots = (v.sources || []).slice(0, 12).map(([row, col]) => `<i aria-label="source ${row},${col}">0</i>`).join("");
  const sourceMore = (v.sources || []).length > 12 ? `<small>+${v.sources.length - 12}</small>` : "";
  const origin = Array.isArray(v.origin) ? v.origin : null;
  const neighbor = Array.isArray(v.neighbor) ? v.neighbor : null;
  const originCell = origin ? v.cells?.[origin[0]]?.[origin[1]] : null;
  const neighborCell = neighbor && neighbor[0] >= 0 && neighbor[0] < v.rows && neighbor[1] >= 0 && neighbor[1] < v.cols
    ? v.cells?.[neighbor[0]]?.[neighbor[1]]
    : null;
  const discoveredNow = ["distance-update", "neighbor-enqueue"].includes(v.operation);
  const verdict = v.check?.inBounds === false ? "× OUT" : discoveredNow || v.check?.unvisited === true ? "✓ NEW" : v.check?.unvisited === false ? "× SKIP" : "?";
  const transfer = neighbor ? `<div class="m542-transfer ${discoveredNow || v.check?.unvisited === true ? "success" : v.check?.unvisited === false || v.check?.inBounds === false ? "skip" : ""}">
    <span><small>${origin ? `(${origin.join(",")})` : "—"}</small><b>${originCell?.distance ?? "·"}</b></span>
    <em>+1</em><strong>→</strong>
    <span><small>(${neighbor.join(",")})</small><b>${neighborCell?.distance ?? (discoveredNow || v.check?.unvisited === true ? (originCell?.distance ?? 0) + 1 : "·")}</b></span>
    <i>${verdict}</i>
  </div>` : "";
  const result = v.phase === "result"
    ? `<div class="m542-done ${v.invalid ? "error" : ""}"><b>${v.invalid ? "!" : "✓"}</b><span>${v.invalid ? t("GRID KHÔNG HỢP LỆ", "INVALID GRID") : `${v.knownCount}/${v.totalCells}`}</span></div>`
    : "";

  requestedVizSet(`<section class="m542-viz phase-${v.phase}" data-operation="${requestedVizEsc(v.operation || "step")}">
    <header class="m542-header"><div class="m542-stages">${stages}</div><div class="m542-score"><span>◎ <b>${(v.sources || []).length}</b></span><span>✓ <b>${v.knownCount || 0}/${v.totalCells || 0}</b></span></div></header>
    <div class="m542-source-picture"><div>${sourceDots}${sourceMore}</div><strong>→</strong><span>QUEUE</span><strong>→</strong><i>)))</i></div>
    <div class="m542-waves">${waves || "<span><i></i><b>d=0</b><small>0/0</small></span>"}</div>
    <div class="m542-grid" style="--m542-cols:${v.cols}">${cells}</div>
    ${transfer}
    <section class="m542-queue"><header><b>QUEUE</b><small>FRONT → BACK</small></header><div>${queue}${queueMore}</div></section>
    ${result}
    <footer><code>${t("lần đầu = ngắn nhất", "first visit = shortest")}</code><b>O(m·n)</b></footer>
  </section>`, t("BFS đa nguồn: khoảng cách tới số 0 gần nhất", "Multi-source BFS: distance to the nearest zero"), "group");
}

function renderUnionFind684View(step) {
  const v=step.unionFind684View,t=(vi,en)=>lang==="vi"?vi:en,esc=requestedVizEsc;
  const current=v.edges.find(e=>e.index===v.currentEdgeIndex),cycle=current?.state==="redundant";
  const ready=v.roots.u!==null&&v.roots.v!==null,same=ready&&v.roots.u===v.roots.v;
  const color=root=>root===null?'var(--rv-line)':`hsl(${(root*137.508)%360} 65% 48%)`;
  const positions=new Map(),count=v.nodes.length,large=count>12;
  const width=large?Math.max(320,Math.ceil(Math.sqrt(count))*76):320;
  const height=large?Math.ceil(count/Math.ceil(Math.sqrt(count)))*76+30:260;
  v.nodes.forEach((n,i)=>{
    const angle=-Math.PI/2+2*Math.PI*i/count;
    positions.set(n.id,large?{x:40+(i%Math.ceil(Math.sqrt(count)))*76,y:40+Math.floor(i/Math.ceil(Math.sqrt(count)))*76}:{x:160+(count===1?0:95*Math.cos(angle)),y:130+(count===1?0:95*Math.sin(angle))});
  });
  // The green route uses only accepted input edges, never DSU parent links.
  const adjacency=new Map(v.nodes.map(n=>[n.id,[]]));
  v.edges.filter(e=>e.state==="accepted").forEach(e=>{adjacency.get(e.u).push(e.v);adjacency.get(e.v).push(e.u);});
  const route=[];
  if(cycle&&v.currentEdge) {
    const [start,end]=v.currentEdge,parents=new Map([[start,null]]),queue=[start];
    for(let i=0;i<queue.length&&!parents.has(end);i++)for(const next of adjacency.get(queue[i]))if(!parents.has(next)){parents.set(next,queue[i]);queue.push(next);}
    if(parents.has(end)){for(let n=end;n!==null;n=parents.get(n))route.push(n);route.reverse();}
  }
  const routeKeys=new Set(route.slice(1).map((n,i)=>[route[i],n].sort((a,b)=>a-b).join(','))),routeNodes=new Set(route);
  const graphEdges=v.edges.filter(e=>e.state!=="pending").map(e=>{
    const from=positions.get(e.u),to=positions.get(e.v),onRoute=routeKeys.has([e.u,e.v].sort((a,b)=>a-b).join(','));
    const cls=e.state==="redundant"?'redundant':onRoute?'route':e.state==="current"?'current':'accepted';
    return `<line class="d684-edge ${cls}" data-edge="${e.index}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"/>`;
  }).join('');
  const graphNodes=v.nodes.map(n=>{
    const p=positions.get(n.id),active=v.currentEdge?.includes(n.id),finding=v.findState?.current===n.id;
    return `<g class="d684-node ${active?'active':''} ${finding?'finding':''} ${routeNodes.has(n.id)?'route':''}" data-node="${n.id}" style="--group:${color(n.root)}">${active?`<circle class="halo ${cycle?'cycle':''}" cx="${p.x}" cy="${p.y}" r="27"/>`:''}<circle cx="${p.x}" cy="${p.y}" r="21"/><text x="${p.x}" y="${p.y+5}">${n.id}</text></g>`;
  }).join('');
  const edgeStart=Math.max(0,Math.min(v.currentEdgeIndex-2,v.edges.length-6));
  const edgeStream=(edgeStart?'<em>…</em>':'')+v.edges.slice(edgeStart,edgeStart+6).map(e=>`<span class="d684-edge-chip ${e.state}" data-edge="${e.index}"><small>#${e.index+1}</small><b>${e.u}—${e.v}</b><i>${e.state==='accepted'?'✓':e.state==='redundant'?'×':e.state==='current'?'↓':'·'}</i></span>`).join('')+(edgeStart+6<v.edges.length?'<em>…</em>':'');
  const groups=v.components.map(c=>`<div class="d684-group" style="--group:${color(c.root)}" data-root="${c.root}"><small>root ${c.root}</small><div>${c.members.map(n=>`<span class="${v.currentEdge?.includes(n)?'endpoint':''}">${n}</span>`).join('')}</div></div>`).join('')||'<span class="d684-empty">∅</span>';
  const path=v.findState?`<div class="d684-find"><small>find(${v.findState.start})</small><div>${v.findState.path.map((n,i)=>`${i?'<em>→</em>':''}<span class="${n===v.findState.root?'root':''} ${v.findState.compressed.includes(n)?'compressed':''}">${n}${n===v.findState.root?'<small>★</small>':''}</span>`).join('')}</div>${v.operation==='path-compress'?'<b>↗</b>':''}</div>`:'';
  const decision=v.currentEdge?`<div class="d684-decision ${cycle?'cycle':ready&&!same?'safe':''}"><div><small>${v.currentEdge[0]} → root</small><b>${v.roots.u??'?'}</b></div><span><strong>${ready?(same?'=':'≠'):'?'}</strong><small>${cycle?t('Chu trình','Cycle'):current.state==='accepted'?t('Đã gộp','Merged'):ready?(same?t('Cùng nhóm','Same group'):t('Gộp nhóm','Merge')):t('Tìm root','Find roots')}</small></span><div><small>${v.currentEdge[1]} → root</small><b>${v.roots.v??'?'}</b></div></div>`:'';
  const rankOps=['rank-less-check','rank-greater-check','equal-rank-branch','attach-x-to-y','attach-y-to-x','rank-increment'];
  let rankHtml='';
  if(ready&&!same&&rankOps.includes(v.operation)){
    const rx=v.nodes.find(n=>n.id===v.roots.u).rank,ry=v.nodes.find(n=>n.id===v.roots.v).rank,beforeX=v.operation==='rank-increment'?rx-1:rx,relation=beforeX<ry?'&lt;':beforeX>ry?'&gt;':'=';
    const tower=(root,rank)=>`<div><b>${root}</b><div class="d684-tower">${Array.from({length:rank+1},(_,i)=>`<i style="width:${24+i*10}px"></i>`).join('')}</div><small>rank ${rank}</small></div>`;
    const link=v.operation==='attach-x-to-y'?[v.roots.u,v.roots.v]:v.operation==='attach-y-to-x'?[v.roots.v,v.roots.u]:null;
    rankHtml=`<section class="d684-rank"><small>union by rank</small><div>${tower(v.roots.u,beforeX)}<strong>${relation}</strong>${tower(v.roots.v,ry)}</div>${link?`<footer data-child="${link[0]}" data-parent="${link[1]}">${link[0]} → ${link[1]}</footer>`:v.operation==='rank-increment'?`<footer>rank[${v.roots.u}]: ${beforeX} → ${rx} ↑</footer>`:''}</section>`;
  }
  const result=v.answer?.length?`<div class="d684-result"><small>${t('Bỏ cạnh','Remove edge')}</small><b>[${v.answer.join(', ')}]</b><span>×</span></div>`:'';
  const proof=cycle&&route.length?`<div class="d684-proof"><small>${t('Đã có đường nối','Already connected')}</small><div>${route.map((n,i)=>`${i?'<em>—</em>':''}<span>${n}</span>`).join('')}</div></div>`:'';
  const table=`<details class="d684-table" open><summary>parent · rank</summary><div><table><thead><tr><th>node</th>${v.nodes.map(n=>`<th>${n.id}</th>`).join('')}</tr></thead><tbody>${['parent','rank'].map(key=>`<tr><th>${key}</th>${v.nodes.map(n=>`<td>${n[key]??'·'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  const stage=cycle?'×':v.operation==='union-true'?'✓':v.phase==='find'?'↗':v.phase==='union'?'⇄':'↓';
  requestedVizSet(`<section class="rv-dsu684-viz d684-viz" data-operation="${v.operation}">
    <header class="d684-heading"><b>684 · Union-Find</b><span>${stage} ${v.currentEdge?`${v.currentEdge[0]}—${v.currentEdge[1]}`:v.nodes.length+' '+t('nút','nodes')}</span></header>
    <div class="d684-stream">${edgeStream}</div>
    <div class="d684-graph"><svg class="${large?'large':''}" viewBox="0 0 ${width} ${height}" style="min-width:${large?width:0}px" role="img" aria-label="${t('Đồ thị: đường đã nối màu xanh; cạnh thừa màu đỏ nét đứt','Graph: existing route is green; redundant edge is dashed red')}">${graphEdges}${graphNodes}</svg></div>
    <div class="d684-legend"><span class="accepted">━ ${t('Đã nối','Accepted')}</span><span class="current">━ ${t('Đang xét','Current')}</span><span class="redundant">┄ ${t('Cạnh thừa','Redundant')}</span></div>
    ${decision}${proof}${result}${path}${rankHtml}
    <section class="d684-groups"><header><b>${t('Nhóm nút','Groups')}</b><small>${v.components.length}</small></header><div>${groups}</div></section>
    ${table}
  </section>`,t('Union-Find: cạnh khép chu trình','Union-Find: edge closing a cycle'),'group');
}

function renderFlights787View(step) {
  const v=step.flights787View,t=(vi,en)=>lang==="vi"?vi:en,esc=requestedVizEsc;
  const bellman=v.approach===1,final=step.final,limit=(v.k??0)+1;
  const nodes=v.nodes||[],edges=v.edges||[],positions=new Map(),middle=nodes.filter(n=>n.id!==v.src&&n.id!==v.dst),width=420,height=Math.max(280,(middle.length+1)*72);
  positions.set(v.src,{x:45,y:height/2});positions.set(v.dst,{x:375,y:height/2});
  middle.forEach((n,i)=>positions.set(n.id,{x:210,y:(i+1)*height/(middle.length+1)}));
  const pathKeys=new Set((v.path?.edges||[]).map(e=>e.u+','+e.v)),pathNodes=new Set(v.path?.nodes||[]);
  const marker=kind=>`<marker id="f787-arrow-${kind}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path class="${kind}" d="M0 0 L7 3.5 L0 7 Z"/></marker>`;
  const connections=edges.map(e=>{
    const a=positions.get(e.u),b=positions.get(e.v);if(!a||!b)return '';
    const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1,ux=dx/length,uy=dy/length;
    const reciprocal=edges.some(other=>other.u===e.v&&other.v===e.u);
    const bend=reciprocal?30:e.u===v.src&&e.v===v.dst&&middle.length?70:12;
    const cx=(a.x+b.x)/2-uy*bend,cy=(a.y+b.y)/2+ux*bend;
    const cls=final?(pathKeys.has(e.u+','+e.v)?'route':'dim'):e.current?'current':'normal';
    const kind=cls==='route'?'route':cls==='current'?'current':'normal',px=(a.x+2*cx+b.x)/4,py=(a.y+2*cy+b.y)/4;
    return `<g class="f787-edge ${cls}" data-flight="${e.u},${e.v}"><path d="M${a.x+ux*25} ${a.y+uy*25} Q${cx} ${cy} ${b.x-ux*29} ${b.y-uy*29}" marker-end="url(#f787-arrow-${kind})"/><rect x="${px-23}" y="${py-11}" width="46" height="22" rx="6"/><text x="${px}" y="${py+4}">${esc(e.w)}</text></g>`;
  }).join('');
  const cities=nodes.map(n=>{
    const p=positions.get(n.id),cls=[n.isSource?'source':'',n.isTarget?'target':'',!final&&n.active?'active':'',pathNodes.has(n.id)?'route':''].join(' ');
    return `<g class="f787-node ${cls}" data-city="${n.id}"><circle cx="${p.x}" cy="${p.y}" r="22"/><text class="id" x="${p.x}" y="${p.y+5}">${n.id}</text>${n.isSource||n.isTarget?`<text class="tag" x="${p.x}" y="${p.y-32}">${n.isSource?'src':'dst'}</text>`:''}</g>`;
  }).join('');
  const routeCard=(route,bad=false)=>{
    if(!route)return '';const stops=Math.max(0,route.edges.length-1);
    return `<section class="f787-route ${bad?'invalid':'valid'}"><header><small>${bad?t('Vượt giới hạn','Over the limit'):t('Đường rẻ nhất hợp lệ','Cheapest valid route')}</small><b>${bad?'×':'✓'} ${route.cost}</b></header><div class="f787-itinerary">${route.nodes.map((n,i)=>`${i?`<span class="f787-ticket"><small>${route.edges[i-1].w}</small><b>✈ →</b></span>`:''}<strong>${n}</strong>`).join('')}</div><footer><span>${route.edges.length}/${limit} ✈</span><span>${stops} ${t('điểm dừng','stops')} ${stops>v.k?'&gt;':'≤'} ${v.k}</span></footer></section>`;
  };
  const row=(items,name)=>`<tr><th>${name}</th>${items.map((value,i)=>`<td class="${v.currentEdge?.includes(i)?'active':''}">${value===null?'∞':value}</td>`).join('')}</tr>`;
  const old=v.oldCost||v.costs,next=v.nextCost||v.costs;
  const snapshots=bellman?`<section class="f787-snapshots"><header><b>${final?'cost':v.allowedFlights!==null?t('Vòng','Round')+' '+v.allowedFlights+' / '+limit:'cost → next_cost'}</b><small>${final?'✓':'❄ → ✎'}</small></header><div><table><thead><tr><th></th>${nodes.map(n=>`<th>${n.id}</th>`).join('')}</tr></thead><tbody>${final?row(v.costs,'cost'):row(old,'❄ cost')+row(next,'✎ next_cost')}</tbody></table></div></section>`:
    `<section class="f787-state"><div><small>${t('Thành phố','City')}</small><b>${v.city??'—'}</b></div><div><small>${t('Đã bay','Flights used')}</small><b>${v.used??'—'}/${limit}</b></div><div><small>${t('Giá','Price')}</small><b>${v.price??'—'}</b></div></section>`;
  const current=edges.find(e=>e.current),source=current?(bellman?v.oldCost?.[current.u]:v.price):null;
  const amount=current&&typeof source==='number'?source+Number(current.w):null;
  const equation=!final&&current?`<div class="f787-transfer ${amount===null?'blocked':''}"><div><small>${bellman?'❄ cost['+current.u+']':'price'}</small><b>${source??'∞'}</b></div><em>+</em><div><small>${current.u} → ${current.v}</small><b>${current.w}</b></div><em>=</em><div><small>${t('Ứng viên','Candidate')}</small><strong>${amount??'∞'}</strong></div></div>`:'';
  const heap=!bellman&&!final?`<section class="f787-heap"><header><b>min-heap</b><small>${t('Giá nhỏ trước','Lowest price first')}</small></header><div>${(v.heapStates||[]).slice(0,6).map(s=>`<span><strong>${s.price}</strong><small>${t('TP','City')} ${s.city} · ${s.used} ✈</small></span>`).join('')||'<em>∅</em>'}</div>${v.heapStates?.length>6?`<small>+${v.heapStates.length-6}</small>`:''}</section>`:'';
  const best=!bellman&&v.bestMatrix?`<details class="f787-best" open><summary>best[city][flights]</summary><div><table><thead><tr><th>city / ✈</th>${v.bestMatrix[0].map((_,i)=>`<th>${i}</th>`).join('')}</tr></thead><tbody>${v.bestMatrix.map((values,i)=>row(values,i)).join('')}</tbody></table></div></details>`:'';
  const result=final&&v.answer===-1?`<div class="f787-no-route"><b>× −1</b><small>${t('Không có đường hợp lệ','No valid route')}</small></div>`:'';
  requestedVizSet(`<section class="rv-flight-viz f787-viz" data-method="${v.approach}">
    <header class="f787-heading"><b>787 · ${bellman?'Bellman-Ford':'Dijkstra'}</b><span>${v.src??'?'} → ${v.dst??'?'}</span></header>
    <div class="f787-limit"><span>≤ ${v.k??'?'} ${t('điểm dừng','stops')}</span><strong>→ ≤ ${limit} ✈</strong></div>
    <div class="f787-graph"><svg class="${nodes.length>6?'large':''}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('Chuyến bay có hướng và giá vé','Directed flights with ticket prices')}"><defs>${marker('normal')}${marker('current')}${marker('route')}</defs>${connections}${cities}</svg></div>
    <div class="f787-legend"><span class="current">━ ${t('Đang xét','Current')}</span><span class="route">━ ${t('Đường chọn','Selected route')}</span></div>
    ${final?routeCard(v.path)+routeCard(v.invalidRoute,true)+result:equation}
    ${snapshots}${heap}${best}
  </section>`,t('Chuyến bay trong giới hạn điểm dừng','Flights within the stop limit'),'group');
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
