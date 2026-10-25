function renderKDivisibleComponents2872View(step) {
  const v = step.kDivisible2872View;
  const bfs = v.algorithm === "bfs";
  const t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value));
  const shortNumber = value => {
    if (value < 100000) return String(value);
    const unit = value >= 1e9 ? 1e9 : value >= 1e6 ? 1e6 : 1e3;
    const scaled = Number((value / unit).toPrecision(3));
    return `${scaled * unit === value ? "" : "≈"}${scaled}${unit === 1e9 ? "B" : unit === 1e6 ? "M" : "K"}`;
  };
  const depth = Array(v.n).fill(0), leafX = Array(v.n).fill(0);
  let leaves = 0;
  function place(node) {
    for (const child of v.children[node]) { depth[child] = depth[node] + 1; place(child); }
    leafX[node] = v.children[node].length
      ? (leafX[v.children[node][0]] + leafX[v.children[node].at(-1)]) / 2
      : leaves++;
  }
  place(0);
  const width = Math.max(360, leaves * 82 + 70), height = Math.max(180, Math.max(...depth) * 90 + 100);
  const position = leafX.map((x, node) => ({ x: leaves === 1 ? width / 2 : 55 + x * (width - 110) / (leaves - 1), y: 45 + depth[node] * 90 }));
  const owner = Array(v.n).fill(-1);
  for (const group of v.closedGroups) for (const node of group.members) owner[node] = group.id;
  const key = (a, b) => [Math.min(a, b), Math.max(a, b)].join(":");
  const cuts = new Set(v.cuts.map(cut => key(cut.parent, cut.child)));
  const processed = new Set(v.processed);
  const queued = new Set((bfs ? v.queue : v.stack) || []);
  const visited = new Set(v.order || []);
  const tone = id => id < 0 ? "" : ` tone-${id % 6}`;
  const lines = v.edges.map(([a, b]) => {
    const from = position[a], to = position[b];
    const directions = Number(v.graph[a].includes(b)) + Number(v.graph[b].includes(a));
    const focused = v.edgeFocus && key(...v.edgeFocus) === key(a, b);
    const state = directions === 0 ? " pending" : directions === 1 ? " partial" : "";
    const pruned = bfs && (processed.has(a) || processed.has(b));
    if (!cuts.has(key(a, b))) return `<line class="kd2872-edge${tone(owner[a])}${state}${pruned ? " pruned" : ""}${focused ? " focused" : ""}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"/>`;
    const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
    const length = Math.hypot(to.x - from.x, to.y - from.y), dx = (to.x - from.x) / length * 14, dy = (to.y - from.y) / length * 14;
    return `<g class="kd2872-cut"><path d="M${from.x},${from.y} L${mx - dx},${my - dy} M${mx + dx},${my + dy} L${to.x},${to.y}"/><text x="${mx}" y="${my + 5}" aria-label="${esc(t("Cạnh đã cắt", "Removed edge"))}">✂</text></g>`;
  }).join("");
  let flow = "", moving = v.transfer;
  if (!bfs && v.phase === "carry" && v.activeNode !== null && v.parent[v.activeNode] !== -1) moving = { from: v.activeNode, to: v.parent[v.activeNode], amount: v.contribution[v.activeNode] };
  if (moving && moving.amount > 0) {
    const from = position[moving.from], to = position[moving.to], length = Math.hypot(to.x - from.x, to.y - from.y);
    const dx = (to.x - from.x) / length, dy = (to.y - from.y) / length;
    const x = (from.x + to.x) / 2, y = (from.y + to.y) / 2;
    flow = `<g class="kd2872-flow"><path d="M${from.x + dx * 28},${from.y + dy * 28} L${to.x - dx * 31},${to.y - dy * 31}" marker-end="url(#kd2872-arrow)"/><rect x="${x - 30}" y="${y - 11}" width="60" height="22" rx="10"/><text x="${x}" y="${y + 4}">+${esc(shortNumber(moving.amount))}</text></g>`;
  }
  const nodes = position.map((p, node) => {
    const active = node === v.activeNode && !step.final;
    const group = v.closedGroups.find(group => group.root === node);
    const status = group ? `✓ C${group.id + 1}` : processed.has(node) && owner[node] < 0 ? `↑${shortNumber(v.contribution[node])}` : bfs && queued.has(node) ? "queue" : v.stage === "dfs" ? queued.has(node) ? "stack" : visited.has(node) ? "✓ order" : "" : "";
    const badge = bfs && v.degree ? `<g class="kd2872-degree" aria-label="degree[${node}] = ${v.degree[node]}"><rect x="${p.x + 15}" y="${p.y - 32}" width="30" height="17" rx="5"/><text x="${p.x + 30}" y="${p.y - 20}">d${v.degree[node]}</text></g>` : "";
    return `<g class="kd2872-node${tone(owner[node])}${queued.has(node) && (bfs || v.stage === "dfs") ? " queued" : ""}${active ? " active" : ""}${processed.has(node) ? " processed" : ""}${owner[node] >= 0 ? " closed" : ""}" role="img" aria-label="${esc(`${t("Nút", "Node")} ${node}: ${v.values[node]}${owner[node] >= 0 ? `, C${owner[node] + 1}` : ""}`)}"><title>#${node} · ${v.values[node]}</title><circle cx="${p.x}" cy="${p.y}" r="25"/><text class="kd2872-value" x="${p.x}" y="${p.y + 5}">${esc(shortNumber(v.values[node]))}</text><text class="kd2872-id" x="${p.x}" y="${p.y - 32}">#${node}</text>${status ? `<text class="kd2872-node-status" x="${p.x}" y="${p.y + 43}">${esc(status)}</text>` : ""}${badge}</g>`;
  }).join("");
  const activeSum = v.transfer?.after ?? v.activeSum;
  const remainder = activeSum === null ? null : activeSum % v.k;
  function bucket(filled, full) {
    const small = v.k <= 12;
    return `<div class="kd2872-bucket${full ? " full" : " partial"}" title="${filled} / ${v.k}">${small
      ? Array.from({ length: v.k }, (_, i) => `<i class="${i < filled ? "filled" : ""}"></i>`).join("")
      : `<div class="kd2872-liquid"><i style="width:${filled / v.k * 100}%"></i></div>`}<small>${filled}/${v.k}</small></div>`;
  }
  let work = `<div class="kd2872-ready" aria-label="${esc(t("Xử lý từ lá lên gốc", "Process leaves toward the root"))}">🍃 <span>↑</span> 🌳</div>`;
  if (activeSum !== null) {
    const quotient = Math.floor(activeSum / v.k);
    const buckets = Array.from({ length: Math.min(quotient, 3) }, () => bucket(v.k, true)).join("");
    const math = v.transfer ? `${v.transfer.before} + ${v.transfer.amount} = ${v.transfer.after}` : `${activeSum} mod ${v.k} = ${remainder}`;
    const actions = { merge: `+${v.transfer?.amount ?? 0}`, check: v.condition ? "True ✓" : "False", count: "components +1", cut: "✂ → 0", close: "✓ → 0", carry: `↑ ${activeSum}`, remove: "degree → 0", degree: "degree −1", enqueue: `queue ← #${v.locals.neighbor}` };
    const action = actions[v.phase] || "…";
    work = `<div class="kd2872-work${remainder === 0 ? " divisible" : ""}"><div class="kd2872-math"><span>#${v.transfer?.to ?? v.activeNode} · Σ ${activeSum}</span><strong>${esc(math)}</strong><b>${esc(action)}</b></div><div class="kd2872-buckets">${buckets}${quotient > 3 ? `<span class="kd2872-more">… ${quotient} × ${v.k}</span>` : ""}${remainder > 0 ? bucket(remainder, false) : ""}</div></div>`;
  }
  const memberDots = group => `<div class="kd2872-member-dots">${group.members.slice(0, 12).map(node => `<span title="#${node}: ${v.values[node]}">${esc(shortNumber(v.values[node]))}</span>`).join("")}${group.members.length > 12 ? `<small>+${group.members.length - 12}</small>` : ""}</div>`;
  function componentPicture(group) {
    const xs = group.members.map(node => position[node].x), ys = group.members.map(node => position[node].y);
    const minX = Math.min(...xs), minY = Math.min(...ys), dx = Math.max(...xs) - minX, dy = Math.max(...ys) - minY;
    const scale = Math.min(110 / Math.max(dx, 1), 65 / Math.max(dy, 1));
    const point = node => ({ x: 75 + (position[node].x - minX - dx / 2) * scale, y: 48 + (position[node].y - minY - dy / 2) * scale });
    const dense = group.members.some((node, index) => group.members.slice(index + 1).some(other => Math.hypot(point(node).x - point(other).x, point(node).y - point(other).y) < 28));
    if (dense) return memberDots(group);
    const members = new Set(group.members);
    const edges = v.edges.filter(([a, b]) => members.has(a) && members.has(b)).map(([a, b]) => { const p = point(a), q = point(b); return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`; }).join("");
    const dots = group.members.map(node => { const p = point(node); return `<g><title>#${node}: ${v.values[node]}</title><circle cx="${p.x}" cy="${p.y}" r="12"/><text x="${p.x}" y="${p.y + 4}">${esc(shortNumber(v.values[node]))}</text></g>`; }).join("");
    return `<svg class="kd2872-mini" viewBox="0 0 150 96" role="img" aria-label="${esc(`C${group.id + 1}: ${group.members.map(node => `#${node}`).join(", ")}`)}">${edges}${dots}</svg>`;
  }
  const shownGroups = v.closedGroups.slice(-8);
  const components = shownGroups.map(group => `<div class="kd2872-component${tone(group.id)}"><header><strong>C${group.id + 1}</strong><span>✓ Σ ${group.sum}</span></header>${group.members.length <= 12 ? componentPicture(group) : memberDots(group)}<small>${group.sum} = ${group.sum / v.k} × ${v.k}</small></div>`).join("");
  const focusNode = v.activeNode ?? 0;
  function sequence(label, items, mode = "") {
    if (!items) return "";
    const start = mode === "queue" ? 0 : Math.max(0, Math.min(mode === "stack" ? items.length - 18 : items.indexOf(focusNode) - 8, items.length - 18));
    return `<div class="kd2872-sequence"><code>${label}</code><div class="kd2872-order">${start > 0 ? `<span>… ${start}</span>` : ""}${items.length ? items.slice(start, start + 18).map((node, index) => {
      const end = mode === "stack" && start + index === items.length - 1 ? "top" : mode === "queue" && index === 0 ? "front" : "";
      return `<span class="${end ? "top" : node === v.activeNode && !step.final ? "active" : processed.has(node) ? "done" : ""}">#${node}${end ? ` ← ${end}` : ""}</span>`;
    }).join("") : "<span>∅</span>"}${items.length > start + 18 ? `<span>… +${items.length - start - 18}</span>` : ""}</div></div>`;
  }
  function indexedArray(label, items, changed) {
    if (!items) return "";
    const start = Math.max(0, Math.min((changed ?? focusNode) - 5, items.length - 12));
    return `<div class="kd2872-sequence kd2872-indexed"><code>${label}</code><div>${start ? "<small>…</small>" : ""}${items.slice(start, start + 12).map((value, offset) => `<span class="${start + offset === changed ? "changed" : ""}"><small>#${start + offset}</small><b>${esc(Array.isArray(value) ? `[${value.join(",")}]` : value)}</b></span>`).join("")}${items.length > start + 12 ? "<small>…</small>" : ""}</div></div>`;
  }
  const array = bfs ? (v.stage === "graph" ? indexedArray("graph", v.graph, v.arrayChanges.graph) : indexedArray("subtotal", v.locals.subtotal, v.arrayChanges.subtotal)) + indexedArray("degree", v.degree, v.arrayChanges.degree)
    : v.stage === "graph" ? indexedArray("graph", v.graph, v.source.line === 9 ? v.locals.u : v.source.line === 10 ? v.locals.v : null)
      : v.stage === "dfs" ? indexedArray("parent", v.traversalParent, v.source.line === 13 ? 0 : v.source.line === 21 ? v.locals.neighbor : null) : "";
  const condition = v.condition === null ? "" : `<b class="kd2872-condition ${v.condition ? "true" : "false"}">${v.exhausted ? t("Hết vòng lặp", "Loop exhausted") : String(v.condition ? "True" : "False")}</b>`;
  const cursor = Object.entries(v.cursor).map(([name, value]) => `<span><code>${esc(name)}</code> = <b>${esc(value)}</b></span>`).join("");
  $("treeView").innerHTML = `<section class="kd2872-viz" aria-label="${esc(t("Cộng tổng từ lá; cắt phần chia hết cho k", "Accumulate from the leaves and separate components divisible by k"))}">
    <div class="kd2872-debugger"><div><strong>${t("Đã chạy dòng", "Executed line")} ${v.source.line}</strong>${condition}<small>→ ${v.nextLine === null ? t("Trả kết quả", "Returned") : `${t("Tiếp", "Next")} L${v.nextLine}`}</small></div><code>${esc(v.source.text.trim())}</code><small>${t("Biến bên dưới là giá trị sau dòng này", "Variables show their values after this line")}</small></div>
    <div class="kd2872-heading"><span>${bfs ? "BFS · 🍃 → queue" : "DFS · 🍃 ↑ 🌳"}</span><span>k = <b>${v.k}</b></span><strong>🌳 ${v.components} ${t("nhóm", v.components === 1 ? "group" : "groups")}</strong></div>
    <small class="kd2872-caption kd2872-legend">● values[node] · ↑ ${bfs ? "carry · d degree" : "contribution"} · ✂ ${t("cắt", "cut")}</small>
    ${cursor ? `<div class="kd2872-cursor">${cursor}</div>` : ""}
    ${bfs ? sequence("queue", v.queue, "queue") : v.stage === "dfs" ? sequence("stack", v.stack, "stack") + sequence("order", v.order) : v.stage === "postorder" || v.stage === "done" ? sequence("reversed(order)", v.postorder) : ""}
    ${array}
    <div class="kd2872-canvas"><svg class="kd2872-tree" viewBox="0 0 ${width} ${height}" style="width:${width}px;height:${height}px" role="img" aria-label="${esc(t("Số trong nút là giá trị; mũi tên là tổng chuyển lên; kéo là cạnh cắt", "Circles show values, arrows carry totals, and scissors mark removed edges"))}"><defs><marker id="kd2872-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z"/></marker></defs>${lines}${flow}${nodes}</svg></div>
    ${step.final || v.stage === "graph" || v.stage === "dfs" ? "" : work}
    <div class="kd2872-groups">${components || `<div class="kd2872-no-groups" aria-label="${esc(t("Chưa tách nhóm nào", "No components separated yet"))}">✂ → 🌳 🌳</div>`}</div>
    ${v.closedGroups.length > shownGroups.length ? `<small class="kd2872-caption">+${v.closedGroups.length - shownGroups.length} ${t("nhóm khác", "other groups")}</small>` : ""}
    ${v.traceTruncated ? `<small class="kd2872-caption">${t("Đã rút gọn bước · vẫn tính đủ toàn bộ cây", "Condensed steps · the entire tree was computed")}</small>` : ""}
  </section>`;
  const canvas = $("treeView").querySelector(".kd2872-canvas");
  if (canvas) {
    canvas.scrollLeft = Math.max(0, position[focusNode].x - canvas.clientWidth / 2);
    canvas.scrollTop = Math.max(0, position[focusNode].y - canvas.clientHeight / 2);
  }
}
