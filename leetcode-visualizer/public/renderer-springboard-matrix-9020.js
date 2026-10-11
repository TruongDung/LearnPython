function renderSpringboardMatrix9020View(step) {
  if (step.springboardMatrix9020View?.method === 2) return renderSpringboardPaths9020View(step);
  renderSpringboardScene9020(step);
}

function renderSpringboardPaths9020View(step) {
  renderSpringboardScene9020(step);
}

function springboardRoute9020(matrix, path) {
  let moving = false;
  let ceiling = null;
  return path.slice(1).map((to, index) => {
    const from = path[index];
    const a = matrix[from[0]][from[1]];
    const b = matrix[to[0]][to[1]];
    const before = { mode: moving ? "momentum" : "rest", ceiling };
    const rule = !moving ? "launch" : b <= a ? "coast" : "spring";
    moving = rule !== "spring";
    ceiling = moving ? a : null;
    return { from, to, rule, ...before, nextMode: moving ? "momentum" : "rest", nextCeiling: ceiling };
  });
}

function springboardMiniMap9020(matrix, path, label) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 1;
  const order = new Map(path.map((cell, index) => [cell.join(","), index + 1]));
  const cells = matrix.flatMap((row, r) => row.map((height, c) => {
    const index = order.get(`${r},${c}`);
    return `<rect x="${c * 28 + 3}" y="${r * 28 + 3}" width="22" height="22" rx="4" class="${index ? "used" : ""}"/>${index ? `<text x="${c * 28 + 14}" y="${r * 28 + 17}">${index}</text>` : ""}`;
  })).join("");
  const points = path.map(([r, c]) => `${c * 28 + 14},${r * 28 + 14}`).join(" ");
  return `<svg class="spring9020-mini-map" viewBox="0 0 ${cols * 28} ${rows * 28}" role="img" aria-label="${escapeHtml(label)}"><title>${escapeHtml(label)} · ${path.map((cell) => `(${cell.join(",")})`).join(" → ") || "∅"}</title>${path.length > 1 ? `<polyline points="${points}"/>` : ""}${cells}</svg>`;
}

function springboardJump9020(view, matrix, route, text) {
  const validCell = (cell) => Array.isArray(cell) && matrix[cell[0]]?.[cell[1]] != null;
  let from = validCell(view.current) ? view.current : null;
  let to = validCell(view.next) ? view.next : null;
  let mode = view.mode;
  let ceiling = view.ceiling;
  if (!from && route.length) from = route.at(-1);
  // Show the completed jump on landing, without inventing a next cell.
  const landingIndex = route.findIndex((cell) => cell.join(",") === from?.join(","));
  if (from && !to && ["land", "append", "done"].includes(view.phase) && landingIndex > 0) {
    const move = springboardRoute9020(matrix, route.slice(0, landingIndex + 1)).at(-1);
    from = move.from;
    to = move.to;
    mode = move.mode;
    ceiling = move.ceiling;
  }
  const a = from ? matrix[from[0]][from[1]] : 0;
  const b = to ? matrix[to[0]][to[1]] : null;
  const visited = new Set((view.path || []).map((cell) => cell.join(",")));
  const isVisited = to && visited.has(to.join(",")) && view.phase === "reject";
  const allowed = to && !isVisited && (mode === "momentum" ? b <= a || b <= ceiling : b <= a);
  const rule = to ? b <= a ? mode === "momentum" ? "coast" : "launch" : "spring" : null;
  const limit = mode === "momentum" && Number.isFinite(ceiling) ? ceiling : null;
  const maxHeight = Math.max(1, a, b ?? 0, limit ?? 0);
  const y = (height) => Math.round(157 - height / maxHeight * 100);
  const ay = y(a);
  const by = b == null ? ay : y(b);
  const arcTop = Math.max(12, limit != null ? y(limit) - 14 : Math.min(ay, by) - 24);
  const hopPath = `M 82 ${ay - 14} Q 180 ${arcTop} 278 ${by - 14}`;
  const animate = to && allowed && ["move", "recurse", "extend", "land", "append"].includes(view.phase)
    && (typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const actor = animate
    ? `<g class="spring9020-hop"><circle r="8"/><path d="M -5 8 L -8 14 M 5 8 L 8 14"/><animateMotion dur="1.1s" path="${hopPath}" fill="freeze"/></g>`
    : `<g class="spring9020-hop" transform="translate(82 ${ay - 14})"><circle r="8"/><path d="M -5 8 L -8 14 M 5 8 L 8 14"/></g>`;
  const comparison = !to ? "—" : isVisited ? text("× Đã ghé", "× Visited") : `${allowed ? "✓" : "×"} ${b} ${allowed ? "≤" : ">"} ${b <= a || mode !== "momentum" ? a : ceiling}`;
  const caption = !to ? mode === "momentum" ? text("Còn đà", "Momentum") : text("Đứng yên", "At rest")
    : !allowed ? text("Bị chặn", "Blocked") : rule === "spring" ? text("Bật lên → đứng yên", "Spring → rest") : text("Nhảy xuống → còn đà", "Drop → momentum");
  return `<section class="spring9020-jump ${to && !allowed ? "blocked" : ""}">
    <header><strong>${caption}</strong><span class="${to && !allowed ? "no" : "ok"}">${comparison}</span></header>
    <svg viewBox="0 0 360 200" role="img" aria-label="${escapeHtml(caption)}"><title>${from ? `(${from.join(",")}) · ${a}` : "—"}${to ? ` → (${to.join(",")}) · ${b}` : ""}${limit != null ? ` · ${text("trần", "ceiling")} ${limit}` : ""}</title>
      <path class="spring9020-ground" d="M 24 180 H 336"/>
      ${limit != null ? `<path class="spring9020-ceiling" d="M 18 ${y(limit)} H 342"/><text class="spring9020-ceiling-label" x="180" y="${y(limit) - 8}">${text("Trần", "Ceiling")} ${limit}</text>` : ""}
      <rect class="spring9020-platform from" x="52" y="${ay}" width="60" height="${180 - ay}" rx="5"/><path class="spring9020-spring" d="M 59 ${ay} l 8 -5 8 5 8 -5 8 5 8 -5 8 5"/>
      <text class="spring9020-height-label" x="82" y="${ay + 21}">${from ? a : "—"}</text><text class="spring9020-coordinate" x="82" y="195">${from ? `(${from.join(",")})` : "—"}</text>
      ${to ? `<rect class="spring9020-platform to" x="248" y="${by}" width="60" height="${180 - by}" rx="5"/><path class="spring9020-spring" d="M 255 ${by} l 8 -5 8 5 8 -5 8 5 8 -5 8 5"/><text class="spring9020-height-label" x="278" y="${by + 21}">${b}</text><text class="spring9020-coordinate" x="278" y="195">(${to.join(",")})</text><path class="spring9020-flight ${allowed ? rule : "rejected"}" d="${hopPath}"/>${!allowed ? `<text class="spring9020-stop" x="180" y="${Math.max(45, Math.min(ay, by) - 25)}">×</text>` : ""}` : `<text class="spring9020-momentum-symbol" x="250" y="105">${mode === "momentum" ? "ϟ" : "●"}</text>`}
      ${actor}
    </svg>
    <div class="spring9020-physics-icons" aria-label="${text("Quy tắc nhảy", "Jump rules")}">
      ${[["launch", "● ↘ ϟ", text("Xuống", "Drop")], ["coast", "ϟ ↘ ϟ", text("Tiếp", "Coast")], ["spring", "ϟ ↗ ●", text("Bật", "Spring")]].map(([key, icon, label]) => `<span class="${rule === key && allowed ? "active" : ""}"><b>${icon}</b><small>${label}</small></span>`).join("")}
    </div>
  </section>`;
}

function renderSpringboardScene9020(step) {
  const view = step.springboardMatrix9020View || {};
  const text = (vi, en) => lang === "vi" ? vi : en;
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  if (!matrix.length || !matrix[0]?.length) { $("treeView").innerHTML = ""; return; }
  const rows = matrix.length;
  const cols = matrix[0].length;
  const method = view.method || 1;
  const keyOf = (cell) => Array.isArray(cell) ? cell.join(",") : "";
  const final = view.phase === "done";
  const activePath = view.path || [];
  const route = method === 1 ? view.bestPath || [] : final && method === 2
    ? view.groups?.find((group) => group.longest)?.paths[0]?.coordinates || [] : final ? view.bestPath || [] : activePath;
  const order = new Map(activePath.map((cell, index) => [keyOf(cell), index + 1]));
  const routeOrder = new Map(route.map((cell, index) => [keyOf(cell), index + 1]));
  const candidates = new Map((view.candidates || []).filter((candidate) => candidate.height !== null).map((candidate) => [keyOf(candidate.cell), candidate]));
  const currentKey = keyOf(view.current);
  const nextKey = keyOf(view.next);
  const removedKey = keyOf(view.removed);
  const target = view.nextMove || view.move;
  const phaseLabels = {
    setup: text("Chuẩn bị", "Setup"), init: text("Chuẩn bị", "Setup"), search: text("Tìm đường", "Search"),
    start: text("Bắt đầu", "Start"), root: text("Bắt đầu", "Start"), "root-call": text("Bắt đầu", "Start"),
    land: text("Đáp xuống", "Land"), inspect: text("Xét bước nhảy", "Check jump"), move: text("Nhảy", "Jump"),
    extend: text("Đi sâu", "Explore"), recurse: text("Đi sâu", "Explore"), append: text("Thêm cell", "Add cell"),
    add: text("Thêm cell", "Add cell"), record: text("Lưu bản sao", "Save copy"),
    remove: text("Quay lui", "Backtrack"), backtrack: text("Quay lui", "Backtrack"), return: text("Trả kết quả", "Return"),
    update: text("Cập nhật best", "Update best"), "root-done": text("Xong một gốc", "Root done"),
    reject: text("Bị chặn", "Blocked"), done: text("Kết quả", "Result"), group: text("Nhóm đường đi", "Group paths"),
    "paths-init": "paths = []", "path-init": "path = []", "best-init": "best = 1", define: "DFS",
  };
  const action = phaseLabels[view.phase] || "DFS";
  const answer = method === 2 ? view.longest : view.answer;
  const methodLabel = method === 1 ? "DFS + BITMASK" : method === 2 ? text("Lưu đường đi", "Save paths") : "DFS + VISITED SET";
  // The outer player already provides the counter and highlighted code.
  $("stepTitle").textContent = `${action}${target ? ` · ${matrix[target.from[0]][target.from[1]]} → ${matrix[target.to[0]][target.to[1]]}` : ""}`;
  $("stepNote").textContent = "";

  const cells = matrix.flatMap((row, r) => row.map((height, c) => {
    const key = `${r},${c}`;
    const candidate = candidates.get(key);
    const classes = ["spring9020-cell"];
    if (order.has(key) || final && routeOrder.has(key)) classes.push("visited");
    if (key === currentKey) classes.push("current");
    if (key === nextKey && view.phase !== "reject") classes.push("next");
    if (key === removedKey) classes.push("removed");
    if (key === nextKey && view.phase === "reject") classes.push("rejected-target");
    if (candidate) classes.push(candidate.allowed ? "candidate-ok" : "candidate-no");
    const badge = key === removedKey ? "−" : key === nextKey && view.phase === "reject" ? "×" : key === currentKey ? "●" : key === nextKey ? "◎"
      : order.has(key) ? order.get(key) : final && routeOrder.has(key) ? routeOrder.get(key) : candidate ? candidate.allowed ? "✓" : "×" : "";
    const heightFont = Math.round(70 / cols / String(height).length * 100) / 100;
    return `<article class="${classes.join(" ")}" title="(${r},${c}) · ${height}${order.has(key) ? ` · #${order.get(key)}` : ""}"><header><span>${r},${c}</span><b>${badge}</b></header><strong style="font-size:clamp(6px, ${heightFont}cqw, 25px)">${height}</strong>${key === currentKey ? '<i class="spring9020-player" aria-hidden="true">●</i>' : ""}</article>`;
  })).join("");
  const moves = springboardRoute9020(matrix, route);
  const edge = (from, to, tone, active = false) => {
    const dx = to[1] - from[1];
    const dy = to[0] - from[0];
    return `<path class="spring9020-map-edge ${tone} ${active ? "active" : ""}" d="M ${from[1] * 100 + 50 + dx * 36} ${from[0] * 100 + 50 + dy * 36} L ${to[1] * 100 + 50 - dx * 36} ${to[0] * 100 + 50 - dy * 36}" marker-end="url(#spring9020-arrow-${tone})"/>`;
  };
  const edges = moves.map((move, index) => edge(move.from, move.to, method === 1 && !final && index >= activePath.length - 1 ? "future" : move.rule === "spring" ? "spring" : "trail")).join("");
  const focusEdge = target ? edge(target.from, target.to, "jump", true) : "";
  const routeRibbon = route.map((cell, index) => `<span class="${order.has(keyOf(cell)) || final ? "done" : ""}" title="(${cell.join(",")})"><b>${matrix[cell[0]][cell[1]]}</b>${index < route.length - 1 ? `<i class="${moves[index].rule}">${moves[index].rule === "spring" ? "↗" : "↘"}</i>` : ""}</span>`).join("");

  let memory;
  if (method === 1) {
    memory = `<section class="spring9020-memory"><header><strong>mask</strong><span>${activePath.length}/${rows * cols}</span></header><div class="spring9020-bits" style="--spring9020-cols:${cols}">${matrix.flatMap((row, r) => row.map((_, c) => `<span class="${order.has(`${r},${c}`) ? "on" : ""}" title="(${r},${c})"><b>${order.has(`${r},${c}`) ? 1 : 0}</b><small>${r},${c}</small></span>`)).join("")}</div></section>`;
  } else if (method === 3) {
    const operation = view.phase === "add" ? `visited.add((${view.current.join(", ")}))` : view.removed ? `visited.remove((${view.removed.join(", ")}))` : "visited";
    memory = `<section class="spring9020-memory spring9020-visited-set" aria-label="Visited set"><header><strong title="${operation}">visited ${view.phase === "add" ? "+" : view.removed ? "−" : ""}</strong><span>${(view.visited || []).length}/${rows * cols}</span></header><div class="spring9020-set-chips">${(view.visited || []).map((cell) => `<span class="${keyOf(cell) === currentKey && view.phase === "add" ? "added" : ""}">${cell.join(",")}</span>`).join("") || '<span class="empty">∅</span>'}${view.removed ? `<span class="removed">${view.removed.join(",")}</span>` : ""}${view.returned != null ? `<b class="spring9020-return">↩ ${view.returned}</b>` : ""}</div><footer>best <b>${view.localBest ?? "—"}</b> <i>→</i> answer <b>${view.answer}</b></footer></section>`;
  } else {
    memory = `<section class="spring9020-memory spring9020-copy ${view.phase === "record" ? "recording" : ""}"><header><strong>path → copy</strong><span>${view.count} ${text("đường", "paths")}</span></header><div>${springboardMiniMap9020(matrix, activePath, "path")}<b aria-hidden="true">${view.phase === "backtrack" ? "↩" : "⇢"}</b>${springboardMiniMap9020(matrix, view.savedPath || [], "copy")}<span class="spring9020-copy-count">▤<b>${view.count}</b></span></div></section>`;
  }

  const histogram = method === 2 ? `<section class="spring9020-list-summary"><header><strong>${text("Độ dài", "Length")}</strong><span>${view.count} ${text("đường", "paths")}</span></header><div>${(view.counts || []).map((group) => `<span><small>${group.length}</small><i><b style="width:${Math.max(4, group.count / Math.max(1, ...view.counts.map((item) => item.count)) * 100)}%"></b></i><strong>${group.count}</strong></span>`).join("") || '<span class="spring9020-empty">∅</span>'}</div></section>` : "";
  const orderedGroups = [...(view.groups || [])].sort((a, b) => b.length - a.length);
  const groups = method === 2 && orderedGroups.length ? `<section class="spring9020-list-output"><header><strong>${text("Đường đã lưu", "Saved paths")}</strong><span>${view.count}</span></header>${orderedGroups.map((group) => `<details class="${group.longest ? "longest" : ""}" ${group.longest ? "open" : ""}><summary><b>${group.length} cell</b><span>× ${group.paths.length}</span>${group.longest ? `<strong>★ ${text("Dài nhất", "Longest")}</strong>` : ""}</summary><ol>${group.paths.map((path, index) => `<li>${springboardMiniMap9020(matrix, path.coordinates, `#${index + 1}`)}<div>${path.values.map((value, position) => `<b>${value}</b>${position < path.values.length - 1 ? '<i>→</i>' : ""}`).join("")}</div></li>`).join("")}</ol></details>`).join("")}</section>` : "";
  const details = `<details class="spring9020-info"><summary aria-label="${text("Giải thích bước này", "Step explanation")}">ⓘ</summary><p>${escapeHtml(pick(step.title) || "")}</p><p>${escapeHtml(pick(step.note) || "")}</p></details>`;
  $("treeView").innerHTML = `<section class="spring9020-viz ${method === 2 ? "spring9020-list-viz" : ""}" aria-label="Springboard matrix physics visualization">
    <header class="spring9020-header"><div><small>#9020 · ${text("Cách", "Method")} ${method}</small><h3>${methodLabel}</h3></div><div class="spring9020-answer"><span>★ ${text("Dài nhất", "Best")}</span><b>${answer ?? 0}</b></div>${details}</header>
    <div class="spring9020-scene">
      <section class="spring9020-board-wrap"><header><strong>${action}</strong><span>${rows}×${cols}</span></header><div class="spring9020-map"><div class="spring9020-board" style="--spring9020-cols:${cols}">${cells}</div><svg class="spring9020-map-arrows" viewBox="0 0 ${cols * 100} ${rows * 100}" aria-hidden="true"><defs>${["trail", "spring", "future", "jump"].map((tone) => `<marker id="spring9020-arrow-${tone}" class="${tone}" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 8 4 L 0 8 z"/></marker>`).join("")}</defs>${edges}${focusEdge}</svg></div><footer><span><i class="current"></i>${text("Bạn", "You")}</span><span><i class="visited"></i>${text("Đã đi", "Used")}</span><span><i class="no"></i>×</span></footer></section>
      ${springboardJump9020(view, matrix, route, text)}
    </div>
    <div class="spring9020-storage">${memory}${histogram}</div>
    <section class="spring9020-route"><header><strong>${final || method === 1 ? text("Đường tốt nhất", "Best path") : "path"}</strong><span>${route.length} cell</span></header><div>${routeRibbon || '<span class="spring9020-empty">∅</span>'}</div></section>
    ${groups}
  </section>`;
}
