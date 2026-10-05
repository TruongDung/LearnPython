function renderInformEmployees1376View(step) {
  const v = step.informEmployees1376View;
  if (!v) return;
  const vi = lang === "vi", text = (a, b) => vi ? a : b;
  const esc = escapeHtml;
  const done = step.final, path = new Set(v.path), processed = new Set(v.processed);
  const queued = new Set(v.pending.map(item => item.employee));
  const positions = {}, expected = Array(v.n).fill(0);
  let leaf = 0, maxDepth = 0;
  function layout(node, depth) {
    maxDepth = Math.max(maxDepth, depth);
    const xs = v.children[node].map(child => {
      expected[child] = expected[node] + v.informTime[node];
      return layout(child, depth + 1);
    });
    const x = xs.length ? (xs[0] + xs.at(-1)) / 2 : 60 + leaf++ * 116;
    positions[node] = { x, y: 40 + depth * 102 };
    return x;
  }
  layout(v.headID, 0);
  const width = Math.max(120, leaf * 116), height = maxDepth * 102 + 80;
  const maxTime = Math.max(1, ...expected);
  const edges = v.manager.flatMap((boss, child) => {
    if (boss < 0) return [];
    const a = positions[boss], b = positions[child];
    const critical = done && path.has(boss) && path.has(child);
    const active = !done && v.current === boss && v.child === child;
    return [`<g class="ie1376-edge ${critical ? "critical" : active ? "active" : ""}">
      <path d="M ${a.x} ${a.y + 29} V ${a.y + 51} H ${b.x} V ${b.y - 29}" marker-end="url(#ie1376-${critical ? 'critical' : active ? 'active' : 'normal'}-arrow)" />
      <rect x="${b.x - 23}" y="${b.y - 49}" width="46" height="18" rx="9" />
      <text x="${b.x}" y="${b.y - 36}">+${v.informTime[boss]} ${text("ph", "min")}</text>
    </g>`];
  }).join("");
  const nodes = Array.from({ length: v.n }, (_, employee) => {
    const p = positions[employee], arrival = v.arrival[employee];
    const state = done && path.has(employee) ? "critical" : employee === v.current ? "current" : processed.has(employee) ? "processed" : queued.has(employee) ? "pending" : "unknown";
    const label = `E${employee}: ${text("nhận tin", "receives")} ${arrival === null ? "?" : arrival + ' ' + text("phút", "min")}; informTime = ${v.informTime[employee]}`;
    return `<g class="ie1376-node ${state}" data-employee="${employee}" transform="translate(${p.x},${p.y})" aria-label="${esc(label)}">
      <title>${esc(label)}</title><rect x="-49" y="-29" width="98" height="58" rx="10" />
      <text y="-10" class="employee">E${employee}${employee === v.headID ? ' · HEAD' : ''}</text>
      <text y="8" class="receive">${text("Nhận", "Receives")}: ${arrival === null ? '?' : arrival} ${text("ph", "min")}</text>
      <text y="22" class="delay">${text("Báo tin", "Tell")}: ${v.informTime[employee]} ${text("ph", "min")}</text>
    </g>`;
  }).join("");
  const pendingOrder = v.kind === "DFS" ? [...v.pending].reverse() : v.pending;
  const pendingHtml = pendingOrder.map((item, i) => `<li class="${i === 0 ? 'next' : ''}"><strong>E${item.employee}</strong><span>${item.time} ${text("phút", "min")}</span>${i === 0 ? `<small>${text("lấy tiếp", "next pop")}</small>` : ''}</li>`).join("");
  const currentTime = v.current === null ? null : v.arrival[v.current];
  let formula = `<strong>${text("Cấp dưới nhận tin = thời điểm cấp trên nhận + informTime của cấp trên", "Child's receive time = boss's receive time + boss's informTime")}</strong><p>${text("Cùng một cấp trên → các cấp dưới nhận tin cùng lúc.", "Reports of the same boss receive the news at the same time.")}</p>`;
  if (v.child !== undefined) {
    formula = `<span>E${v.current} → E${v.child}</span><strong>${currentTime} + ${v.informTime[v.current]} = ${v.event === 'child' ? '?' : v.nextTime} ${text("phút", "min")}</strong><p>${text("Thời điểm E", "E")}${v.current}${text(" nhận tin + độ trễ của E", "'s receive time + E")}${v.current}${text(" báo tin", "'s informing delay")}</p><small>${v.event === 'push' ? text("Đã thêm vào danh sách chờ xét.", "Added to the worklist.") : text("Chưa thêm vào danh sách chờ xét.", "Not added to the worklist yet.")}</small>`;
  } else if (v.event === "max") {
    formula = `<span>${text("Cập nhật thời điểm muộn nhất", "Update the latest receive time")}</span><strong>max(${v.previousAnswer}, ${currentTime}) = ${v.answer}</strong><p>${text("Hai nhánh chạy song song: lấy max, không cộng hai nhánh.", "Branches run in parallel: take max, do not add branches.")}</p>`;
  } else if (done) {
    const delays = v.path.slice(0, -1).map(employee => v.informTime[employee]);
    formula = `<span>${text("Nhánh quyết định đáp án", "A branch that determines the answer")}</span><strong>${delays.length ? delays.join(' + ') : '0'} = ${v.answer} ${text("phút", "min")}</strong><p>${v.path.map(employee => 'E' + employee).join(' → ')}</p><small>${text("Dừng khi nhân viên cuối nhận tin; không cộng độ trễ của người cuối.", "Stop when the last employee receives; do not add the last employee's delay.")}</small>`;
  }
  const timeline = Array.from({ length: v.n }, (_, employee) => {
    const arrival = v.arrival[employee], critical = done && path.has(employee);
    return `<div class="ie1376-time-row ${critical ? 'critical' : ''} ${employee === v.current ? 'current' : ''}" data-employee="${employee}"><b>E${employee}</b><div class="ie1376-track">${arrival === null ? '' : `<span style="width:${arrival / maxTime * 100}%"></span><i style="left:${arrival / maxTime * 100}%"></i>`}</div><strong>${arrival === null ? text('chưa tính', 'not calculated') : arrival + ' ' + text('phút', 'min')}</strong></div>`;
  }).join('');
  $('treeView').innerHTML = `<article class="ie1376-viz" role="region" aria-label="${text('Truyền tin cho nhân viên', 'Inform employees')}">
    <header class="ie1376-intro"><div><span>${v.kind} · ${v.kind === 'DFS' ? 'LIFO' : 'FIFO'}</span><h3>${text('Tin đi xuống cây quản lý', 'News travels down the manager tree')}</h3><p>${text('Cộng dọc một nhánh. Lấy max giữa các nhánh vì chúng chạy song song.', 'Add along one branch. Take max across branches because they run in parallel.')}</p></div><div class="ie1376-answer"><small>${done ? text('ĐÁP ÁN', 'ANSWER') : text('MAX ĐÃ XÉT', 'MAX SO FAR')}</small><strong>${v.answer}<em> ${text('phút', 'min')}</em></strong><span>${v.processed.length}/${v.n} ${text('người đã xét', 'processed')}</span></div></header>
    <section class="ie1376-card"><h4>${text('1 · Ai báo tin cho ai?', '1 · Who informs whom?')}</h4><p>${text('Mũi nối đi xuống. + trên cạnh là thời gian báo tin của cấp trên.', 'Connections point down. + on an edge is the boss’s informing delay.')}</p><div class="ie1376-tree-scroll"><svg class="ie1376-tree" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${text('Cây quản lý và thời điểm nhận tin', 'Manager tree and receive times')}"><defs>${[["normal", "--ie-border"], ["active", "--ie-yellow"], ["critical", "--ie-pink"]].map(([name, color]) => `<marker id="ie1376-${name}-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(${color})" /></marker>`).join("")}</defs>${edges}${nodes}</svg></div><div class="ie1376-legend"><span class="unknown">${text('chưa tính', 'not calculated')}</span><span class="pending">${text('chờ xét', 'worklist')}</span><span class="current">${text('đang xét', 'current')}</span><span class="processed">${text('đã xét', 'processed')}</span><span class="critical">${text('nhánh muộn nhất', 'latest branch')}</span></div></section>
    <div class="ie1376-work-grid"><section class="ie1376-card"><h4>2 · ${v.kind === 'DFS' ? 'STACK' : 'QUEUE'}</h4><p>${v.kind === 'DFS' ? text('Đỉnh stack ở bên trái: vào sau, ra trước.', 'Stack top is on the left: last in, first out.') : text('Đầu queue ở bên trái: vào trước, ra trước.', 'Queue front is on the left: first in, first out.')}</p><ol class="ie1376-worklist">${pendingHtml || `<li class="empty">${text('Rỗng', 'Empty')}</li>`}</ol><p class="ie1376-order">${text('Thứ tự đã duyệt', 'Traversal order')}: ${v.processed.map(employee => 'E' + employee).join(' → ') || '—'}</p><small>${text('Thứ tự duyệt của thuật toán không phải thứ tự thời gian thực.', 'Algorithm traversal order is not chronological time.')}</small></section><section class="ie1376-card ie1376-formula"><h4>${text('3 · Tính thời gian', '3 · Calculate the time')}</h4>${formula}</section></div>
    <section class="ie1376-card ie1376-timeline"><h4>${text('4 · Thời điểm mỗi người nhận tin', '4 · When each employee receives the news')}</h4><div class="ie1376-axis"><span>0 ${text('phút', 'min')}</span><span>${maxTime} ${text('phút', 'min')}</span></div>${timeline}<p>${text('Thanh bắt đầu từ mốc 0 chung. Người nhận muộn nhất quyết định khi mọi người đã nhận tin.', 'All bars share time zero. The latest recipient determines when everyone has the news.')}</p></section>
  </article>`;
}
