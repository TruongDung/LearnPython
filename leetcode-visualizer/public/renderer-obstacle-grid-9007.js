function renderObstacleGrid9007(step) {
  const v = step.obstacle9007View, vi = lang === "vi";
  const t = (a, b) => vi ? a : b;
  const esc = value => escapeHtml(String(value));
  const key = point => point?.join(",");
  const coord = point => point ? `(${point.join(",")})` : "—";
  const rows = v.grid.length, cols = v.grid[0].length;
  const inside = point => point && point[0] >= 0 && point[0] < rows && point[1] >= 0 && point[1] < cols;
  const sources = new Set(v.sources.map(key)), queued = new Set(v.queue.map(key)), route = new Set(v.path.map(key));
  const done = v.phase === "done", tracing = v.phase === "trace";
  const inspecting = v.phase === "search" && ["check", "set-parent", "set-distance", "enqueue"].includes(v.operation);
  const focus = inspecting ? v.neighbor : null;
  const pitch = 56, margin = 32;
  const width = cols * pitch + margin + 12, height = rows * pitch + margin + 12;
  const center = point => [margin + point[1] * pitch + 24, margin + point[0] * pitch + 24];
  const arrow = (a, b, cls) => {
    const [ax, ay] = center(a), [bx, by] = center(b), length = Math.hypot(bx - ax, by - ay);
    if (!length) return "";
    const ux = (bx - ax) / length, uy = (by - ay) / length;
    const endX = Math.min(width - 8, Math.max(8, bx - ux * 17));
    const endY = Math.min(height - 8, Math.max(8, by - uy * 17));
    return `<path class="og7-arrow ${cls}" d="M${ax + ux * 17} ${ay + uy * 17} L${endX} ${endY}" marker-end="url(#og7-${cls === "route" ? "route" : v.reason ? "reject" : "focus"}-arrow)"/>`;
  };
  const cells = [], axes = [];
  for (let c = 0; c < cols; c++) axes.push(`<text class="og7-axis" x="${margin + c * pitch + 24}" y="15">${c}</text>`);
  for (let r = 0; r < rows; r++) axes.push(`<text class="og7-axis" x="14" y="${margin + r * pitch + 24}">${r}</text>`);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const id = `${r},${c}`, wall = v.grid[r][c] === 1, distance = v.distance[id];
    const current = key(v.current) === id && !done;
    const selected = key(focus) === id;
    const source = sources.has(id), target = key(v.target) === id;
    const kind = wall ? "wall" : route.has(id) ? "route" : queued.has(id) ? "queued" : Object.hasOwn(v.parent, id) ? "visited" : "empty";
    const x = margin + c * pitch, y = margin + r * pitch;
    const label = `(${r},${c}) · ${wall ? t("vật cản", "wall") : distance == null ? t("chưa có khoảng cách", "distance unknown") : `${distance} ${t("bước", "moves")}`}${source ? " · S" : ""}${target ? " · T" : ""}`;
    cells.push(`<g class="og7-cell ${kind}${source ? " source" : ""}${target ? " target" : ""}${current ? " current" : ""}${selected ? " focus" : ""}${selected && v.reason ? " rejected" : ""}" data-cell="${id}"><title>${esc(label)}</title>
      <rect class="og7-tile" x="${x}" y="${y}" width="48" height="48" rx="9"/>
      ${wall ? `<path class="og7-bricks" d="M${x + 7} ${y + 18}h34 M${x + 7} ${y + 31}h34 M${x + 24} ${y + 7}v11 M${x + 16} ${y + 18}v13 M${x + 32} ${y + 31}v10"/>` : distance != null ? `<text class="og7-distance" x="${x + 24}" y="${y + 28}">${distance}</text>` : `<circle class="og7-dot" cx="${x + 24}" cy="${y + 26}" r="2"/>`}
      ${source || target ? `<text class="og7-pin" x="${x + 10}" y="${y + 9}">${source && target ? "S/T" : source ? "S" : "T"}</text>` : ""}
      ${selected ? `<circle class="og7-badge" cx="${x + 44}" cy="${y + 4}" r="9"/><text class="og7-badge-text" x="${x + 44}" y="${y + 4}">${v.reason === "seen" ? "↩" : v.reason ? "×" : v.operation === "enqueue" ? "+" : "✓"}</text>` : ""}
    </g>`);
  }
  const routeArrows = v.path.slice(1).map((point, i) => arrow(v.path[i], point, "route")).join("");
  const focusArrow = inspecting && v.current ? arrow(v.current, focus, v.reason ? "rejected" : "focus") : "";
  const map = `<svg class="og7-map" style="min-width:${Math.min(width, cols * 28 + margin + 12)}px;max-width:${Math.min(480, width * 1.35)}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t("Bản đồ BFS: số trong ô là số bước từ nguồn gần nhất", "BFS map: numbers are distances from the nearest source"))}">
    <defs>${["focus", "reject", "route"].map(kind => `<marker id="og7-${kind}-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path class="og7-arrowhead ${kind}" d="M0 0 L8 4 L0 8 Z"/></marker>`).join("")}</defs>
    ${axes.join("")}${cells.join("")}${routeArrows}${focusArrow}
  </svg>`;

  // A compass shows all four choices around the cell being expanded.
  const origin = v.expanding || v.sources[0];
  const compassCells = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].map(([dr, dc]) => {
    const point = [origin[0] + dr, origin[1] + dc], id = key(point);
    const valid = inside(point), wall = valid && v.grid[point[0]][point[1]] === 1;
    const cls = !dr && !dc ? "center" : !valid ? "boundary" : wall ? "wall" : Object.hasOwn(v.parent, id) ? "visited" : "empty";
    const x = 50 + dc * 40, y = 46 + dr * 40;
    return `<g class="og7-compass-cell ${cls} ${key(focus) === id ? "selected" : ""}"><rect x="${x}" y="${y}" width="32" height="32" rx="7"/><text x="${x + 16}" y="${y + 16}">${!dr && !dc ? "◎" : !valid ? "×" : wall ? "▤" : v.distance[id] ?? "·"}</text></g>`;
  }).join("");
  const compass = `<svg class="og7-compass" viewBox="0 0 132 130" role="img" aria-label="${esc(t("Bốn hướng quanh ô đang mở rộng", "Four directions around the expanded cell"))}"><path class="og7-compass-links" d="M66 22 V102 M26 62 H106"/>${compassCells}</svg>`;
  const fromDistance = v.distance[key(v.current)];
  const nextDistance = v.distance[key(focus)];
  const action = done ? (v.answer < 0 ? "S ↛ T" : "S → T") : tracing ? (v.reversed ? "S → T" : "T → S") : v.operation === "dequeue" ? "← Q" : v.operation === "enqueue" ? "+ Q →" : v.operation === "set-distance" ? `${fromDistance} + 1 = ${nextDistance}` : v.operation === "set-parent" ? "↳ parent" : v.operation === "check" ? (v.reason ? "✕" : "✓") : v.operation === "target-check" ? (key(v.current) === key(v.target) ? "◎ T ✓" : "◎ ≠ T") : `${v.sources.length} × S`;
  const caption = done ? (v.answer < 0 ? t("Không có đường", "No route") : `${v.answer} ${t("bước", "moves")}`) : tracing ? t("Lần theo parent", "Follow parents") : v.reason === "boundary" && inspecting ? t("Ngoài lưới", "Outside grid") : v.reason === "wall" && inspecting ? t("Vật cản", "Wall") : v.reason === "seen" && inspecting ? t("Đã thăm", "Already seen") : inspecting ? coord(focus) : v.current ? coord(v.current) : t("Cùng bắt đầu ở 0", "All start at 0");
  const side = `<aside class="og7-focus-panel ${v.reason && inspecting ? "rejected" : done ? (v.answer >= 0 ? "success" : "unreachable") : ""}">${done || tracing ? `<div class="og7-route-icon" aria-hidden="true">${done && v.answer < 0 ? "⊘" : "⚑"}</div>` : compass}<strong class="og7-action">${esc(action)}</strong><span class="og7-caption">${esc(caption)}</span></aside>`;

  const queueChip = (point, index) => `<span class="og7-q-cell ${index === 0 ? "front" : ""} ${v.operation === "enqueue" && key(point) === key(v.neighbor) ? "added" : ""}" data-queue-cell="${key(point)}"><b>${coord(point)}</b><small>d=${v.distance[key(point)]}</small></span>`;
  const visibleQueue = v.queue.length <= 6 ? v.queue.map(queueChip).join("") : `${v.queue.slice(0, 3).map(queueChip).join("")}<span class="og7-q-more">+${v.queue.length - 5}</span>${v.queue.slice(-2).map((point, i) => queueChip(point, v.queue.length - 2 + i)).join("")}`;
  const queue = !done && !tracing ? `<section class="og7-queue"><header><strong>FIFO</strong><span>${v.queue.length} ${t("ô chờ", "waiting")}</span></header><div class="og7-queue-track"><span class="og7-queue-arrow" aria-hidden="true">←</span>${v.operation === "dequeue" ? `<span class="og7-q-cell popped"><b>${coord(v.current)}</b><small>POP</small></span>` : ""}${visibleQueue || '<span class="og7-q-empty">∅</span>'}<span class="og7-queue-arrow" aria-hidden="true">＋</span></div></section>` : "";
  const summary = `${t("BFS qua vật cản", "BFS through obstacles")}: ${caption}. ${v.current ? `${t("Ô hiện tại", "Current cell")} ${coord(v.current)}.` : ""} ${v.queue.length} ${t("ô chờ", "waiting")}.`;
  $("treeView").innerHTML = `<section class="og7-viz" role="group" aria-label="${esc(summary)}">
    <header class="og7-heading"><span><b class="og7-start-icon">S</b> → <b class="og7-target-icon">T</b></span><span>${tracing ? (v.reversed ? "S → T" : "T → S") : done ? (v.answer < 0 ? "−1" : `✓ ${v.answer}`) : `d = ${v.distance[key(v.expanding)] ?? 0}`}</span></header>
    <div class="og7-work"><div class="og7-board">${map}</div>${side}</div>
    ${queue}
    <div class="og7-legend"><span class="og7-wall-key">▤ ${t("Cản", "Wall")}</span><span class="og7-queued-key">■ ${t("Chờ", "Queued")}</span><span class="og7-visited-key">■ ${t("Đã tới", "Reached")}</span><span class="og7-current-key">◎ ${t("Đang xét", "Current")}</span><span># = ${t("số bước", "moves")}</span></div>
  </section>`;
}
