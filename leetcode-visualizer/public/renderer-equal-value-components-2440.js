function renderEqualComponents2440View(step) {
  const v = step.equalComponents2440View, esc = value => escapeHtml(String(value)), t = (vi, en) => lang === "vi" ? vi : en;
  const n = v.nums.length, graph = v.nums.map(() => []), children = v.nums.map(() => []), depth = v.nums.map(() => 0);
  v.edges.forEach(([a, b]) => { graph[a].push(b); graph[b].push(a); });
  function root(node, parent) {
    for (const next of graph[node]) if (next !== parent) {
      children[node].push(next); depth[next] = depth[node] + 1; root(next, node);
    }
  }
  root(0, -1);
  const leafX = [], owner = v.nums.map(() => -1);
  let leaves = 0;
  function place(node) {
    children[node].forEach(place);
    leafX[node] = children[node].length ? (leafX[children[node][0]] + leafX[children[node].at(-1)]) / 2 : leaves++;
  }
  place(0);
  const width = Math.max(330, leaves * 72 + 50), height = Math.max(150, (Math.max(...depth) + 1) * 74 + 24);
  const positions = v.nums.map((_, node) => ({ x: leaves === 1 ? width / 2 : 40 + leafX[node] * (width - 80) / (leaves - 1), y: 38 + depth[node] * 74 }));
  for (const group of v.closedGroups) for (const node of group.members) owner[node] = group.id;
  const tone = id => id < 0 ? "" : ` tone-${id % 6}`;
  const key = (a, b) => [Math.min(a, b), Math.max(a, b)].join(":");
  const cutKeys = new Set(v.cuts.map(edge => key(...edge))), carried = new Set(v.carried);
  const active = !step.final && ["traverse", "partition"].includes(v.stage) ? v.node : null;
  const edges = v.edges.map(([a, b]) => {
    const p = positions[a], q = positions[b];
    if (cutKeys.has(key(a, b))) {
      const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, length = Math.hypot(p.x - q.x, p.y - q.y);
      const dx = (q.x - p.x) / length * 10, dy = (q.y - p.y) / length * 10;
      return `<g class="ec2440-cut"><path d="M${p.x},${p.y} L${mx - dx},${my - dy} M${mx + dx},${my + dy} L${q.x},${q.y}"/><text x="${mx + (mx > width - 50 ? -28 : 28)}" y="${my + 5}">✂</text></g>`;
    }
    return `<line class="ec2440-edge${owner[a] === owner[b] ? tone(owner[a]) : ""}${v.edgeFocus && key(...v.edgeFocus) === key(a, b) ? " focused" : ""}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`;
  }).join("");
  let flow = "";
  if (v.transfer?.amount > 0) {
    const p = positions[v.transfer.from], q = positions[v.transfer.to], length = Math.hypot(q.x - p.x, q.y - p.y);
    const dx = (q.x - p.x) / length, dy = (q.y - p.y) / length, mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
    flow = `<g class="ec2440-flow"><path d="M${p.x + dx * 23},${p.y + dy * 23} L${q.x - dx * 27},${q.y - dy * 27}" marker-end="url(#ec2440-arrow)"/><rect x="${mx - 20}" y="${my - 10}" width="40" height="20" rx="8"/><text x="${mx}" y="${my + 4}">+${v.transfer.amount}</text></g>`;
  }
  const nodes = v.nums.map((value, node) => {
    const p = positions[node], closed = owner[node] >= 0;
    const subtotal = v.stage === "partition" && (node === active || node === v.transfer?.to) ? v.subtotal?.[node] : null;
    const caption = !closed && carried.has(node) ? "↑" : "";
    const idLabel = !closed && subtotal !== null ? `#${node} · Σ ${subtotal}` : `#${node}`;
    const bad = node === active && (v.phase === "reject" || v.phase === "overflow" && v.condition);
    return `<g class="ec2440-node${tone(owner[node])}${closed ? " closed" : ""}${node === active ? " active" : ""}${bad ? " bad" : ""}"><title>#${node}: nums=${value}${subtotal !== null ? `, subtotal=${subtotal}` : ""}</title><circle cx="${p.x}" cy="${p.y}" r="21"/><text class="value" x="${p.x}" y="${p.y + (closed ? -2 : 5)}">${value}</text>${closed ? `<text class="component" x="${p.x}" y="${p.y + 13}">C${owner[node] + 1}</text>` : ""}<text class="id" x="${p.x}" y="${p.y - 27}">${esc(idLabel)}</text>${caption ? `<text class="status" x="${p.x}" y="${p.y + 35}">${esc(caption)}</text>` : ""}</g>`;
  }).join("");
  const shownTarget = v.stage === "candidate" && v.phase !== "target" ? null : v.target;
  const formula = v.total === null ? "" : `<div class="ec2440-formula"><span><small>Σ</small><b>${v.total}</b></span><i>=</i><span><small>parts</small><b>${v.parts ?? "—"}</b></span><i>×</i><span><small>target</small><b>${shownTarget ?? "—"}</b></span></div>`;
  const attemptChip = item => `<span class="ec2440-attempt ${item.status}" title="${esc(item.remainder ? `${v.total} % ${item.parts} = ${item.remainder}` : `${item.parts} × ${item.target}`)}"><b>${item.parts} × ${item.target ?? "?"}</b><i>${item.status === "success" ? "✓" : ["failed", "indivisible"].includes(item.status) ? "×" : "…"}</i></span>`;
  const trials = v.attempts.length ? `<div class="ec2440-trials"><small>parts ↓</small><div>${v.attempts.slice(-8).map(attemptChip).join("")}</div>${v.attempts.length > 8 ? `<details><summary>+${v.attempts.length - 8}</summary><div>${v.attempts.slice(0, -8).map(attemptChip).join("")}</div></details>` : ""}</div>` : "";
  const currentSum = v.transfer?.after ?? (["node", "reset"].includes(v.phase) ? v.subtotal?.[v.node] : v.carry);
  const showBucket = v.stage === "partition" && currentSum !== null && currentSum !== undefined && v.target !== null;
  const exact = ["equal", "count", "close"].includes(v.phase) && currentSum === v.target;
  const bucket = showBucket ? `<div class="ec2440-bucket${currentSum > v.target ? " overflow" : exact ? " exact" : ""}"><div class="ec2440-fill">${v.target <= 12 ? Array.from({ length: v.target }, (_, i) => `<i class="${i < currentSum ? "filled" : ""}"></i>`).join("") : `<span class="ec2440-bar"><i style="width:${Math.min(100, currentSum / v.target * 100)}%"></i></span>`}</div><strong>${currentSum} / ${v.target}</strong>${currentSum > v.target ? `<b>+${currentSum - v.target} !</b>` : ""}</div>` : "";
  const title = typeof step.title === "object" ? step.title[lang === "vi" ? "vi" : "en"] : step.title;
  const work = step.final ? "" : `<div class="ec2440-work${v.phase === "reject" ? " rejected" : ""}"><div><small>${esc(title)}</small><code>${esc(v.equation)}</code></div>${bucket}</div>`;
  const postorder = ["partition", "done"].includes(v.stage) ? [...v.order].reverse() : v.stage === "traverse" ? v.order : [];
  const cursor = postorder.indexOf(v.node), start = Math.max(0, Math.min(cursor - 4, postorder.length - 12));
  const order = postorder.length ? `<div class="ec2440-order"><small>${v.stage === "traverse" ? "order" : "🍃 ↑"}</small><div>${start ? "…" : ""}${postorder.slice(start, start + 12).map(node => `<span class="${node === active ? "active" : owner[node] >= 0 ? "closed" : carried.has(node) ? "done" : ""}">${node}</span>`).join("")}${postorder.length > start + 12 ? "…" : ""}</div></div>` : "";
  function componentPicture(group) {
    const xs = group.members.map(node => positions[node].x), ys = group.members.map(node => positions[node].y);
    const minX = Math.min(...xs), minY = Math.min(...ys), dx = Math.max(...xs) - minX, dy = Math.max(...ys) - minY;
    const scale = Math.min(90 / Math.max(1, dx), 45 / Math.max(1, dy));
    const point = node => ({ x: 65 + (positions[node].x - minX - dx / 2) * scale, y: 40 + (positions[node].y - minY - dy / 2) * scale });
    const dense = group.members.some((node, index) => group.members.slice(index + 1).some(other => Math.hypot(point(node).x - point(other).x, point(node).y - point(other).y) < 25));
    if (dense) return `<div class="ec2440-dots">${group.members.map(node => `<span title="#${node}">${v.nums[node]}</span>`).join("")}</div>`;
    const memberSet = new Set(group.members);
    const lines = v.edges.filter(([a, b]) => memberSet.has(a) && memberSet.has(b)).map(([a, b]) => { const p = point(a), q = point(b); return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`; }).join("");
    const circles = group.members.map(node => { const p = point(node); return `<g><title>#${node}: ${v.nums[node]}</title><circle cx="${p.x}" cy="${p.y}" r="12"/><text x="${p.x}" y="${p.y + 4}">${v.nums[node]}</text></g>`; }).join("");
    return `<svg class="ec2440-mini" viewBox="0 0 130 80" aria-hidden="true">${lines}${circles}</svg>`;
  }
  const groups = v.closedGroups.map(group => `<article class="ec2440-component${tone(group.id)}"><header><b>C${group.id + 1}</b><span>Σ ${group.sum}</span></header>${componentPicture(group)}<small>✓ ${group.sum} = target</small></article>`).join("");
  const result = `<div class="ec2440-result"><strong>✂ ${v.answer}</strong><i>→</i><span>🌳 ${v.closedGroups.length} ${t("nhóm", "groups")}</span><code>Σ ${v.total} = ${v.parts} × ${v.target} · ${v.parts} − 1 = ${v.answer}</code></div>`;
  $("treeView").innerHTML = `<section class="ec2440-viz" aria-label="${esc(t("Cắt cây thành các thành phần có tổng bằng nhau", "Split the tree into components of equal sum"))}">
    <div class="ec2440-heading"><b>2440 · ${t("Gom bằng tổng", "Equal sums")}</b><span>${t("Dòng", "Line")} ${v.source.line}</span></div>
    ${step.final ? result + (v.attempts.length > 1 ? trials : "") : formula + trials + order}
    <div class="ec2440-canvas" tabindex="0" aria-label="${esc(t("Cây: giá trị trong node; kéo để xem các nhánh", "Tree: values inside nodes; scroll to explore branches"))}"><svg class="ec2440-tree" viewBox="0 0 ${width} ${height}" style="width:${width}px;height:${height}px" role="img" aria-label="${esc(t("Các cạnh đã cắt có dấu kéo; các nhóm cùng màu có cùng tổng", "Scissors mark removed edges; component colors identify equal sums"))}"><defs><marker id="ec2440-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z"/></marker></defs>${edges}${flow}${nodes}</svg></div>
    <div class="ec2440-legend"><span>● nums[node]</span><span>↑ ${t("gửi tổng", "carry subtotal")}</span><span>✂ ${t("cắt cạnh", "remove edge")}</span></div>
    ${work}
    ${groups ? `<div class="ec2440-groups${v.closedGroups.length > 8 ? " compact" : ""}">${groups}</div>` : ""}
  </section>`;
  const canvas = $("treeView").querySelector(".ec2440-canvas");
  if (canvas) {
    const focus = positions[v.transfer?.to ?? active ?? 0];
    canvas.scrollLeft = Math.max(0, focus.x - canvas.clientWidth / 2);
    canvas.scrollTop = Math.max(0, focus.y - canvas.clientHeight / 2);
  }
}
