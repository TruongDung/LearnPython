// ---- Bar chart renderer (array visualization) ----
function renderBars(step) {
  const maxVal = Math.max(...steps.flatMap((s) => (s.arr || []).map((v) => Math.abs(v))), 1);
  const barsEl = $("bars");
  barsEl.innerHTML = "";

  step.arr.forEach((val, i) => {
    const marked = (step.mark || []).includes(i);
    const highlighted = (step.highlight || []).includes(i);

    const bar = document.createElement("div");
    bar.className = "bar" + (marked ? " final" : highlighted ? " highlight" : "");

    const col = document.createElement("div");
    col.className = "col";
    col.style.height = `${(Math.abs(val) / maxVal) * 180 + 4}px`;
    if (val < 0) col.classList.add("neg");

    const valEl = document.createElement("div");
    valEl.className = "val";
    valEl.textContent = Array.isArray(step.raw) && step.raw[i] !== undefined ? step.raw[i] : val;

    const idxEl = document.createElement("div");
    idxEl.className = "idx";
    idxEl.textContent = `[${i}]`;

    bar.appendChild(valEl);
    bar.appendChild(col);
    if (step.sub) {
      const subEl = document.createElement("div");
      subEl.className = "dp";
      subEl.textContent = step.sub[i];
      bar.appendChild(subEl);
    }
    bar.appendChild(idxEl);
    barsEl.appendChild(bar);
  });
}

// ---- BFS Grid renderer (pathfinding) ----
function distinctIslandGuideHtml(view) {
  const vi = lang === "vi";
  const phaseOrder = { scan: 0, dfs: 1, compare: 2, done: 3 };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const phaseLabels = vi ? ["Tìm đảo", "Chuẩn hoá", "So shape"] : ["Find", "Normalize", "Match"];
  const phaseIcons = ["▦", "⊖", "⊕"];
  const phases = phaseLabels.map((label, index) => {
    const state = activePhase > index ? "done" : activePhase === index ? "active" : "pending";
    return `<span class="di694-stage ${state}"><i>${activePhase > index ? "✓" : phaseIcons[index]}</i><b>${label}</b></span>`;
  }).join(`<span class="di694-stage-arrow">›</span>`);

  const shapeArt = (cells, options = {}) => {
    const points = (cells || []).map((cell) => ({
      r: Number(cell.dr ?? cell.row ?? 0),
      c: Number(cell.dc ?? cell.col ?? 0),
    }));
    if (!points.length) return `<div class="di694-empty-shape">∅</div>`;
    const minR = Math.min(...points.map((point) => point.r));
    const maxR = Math.max(...points.map((point) => point.r));
    const minC = Math.min(...points.map((point) => point.c));
    const maxC = Math.max(...points.map((point) => point.c));
    const pointKeys = new Set(points.map((point) => `${point.r},${point.c}`));
    let tiles = "";
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const occupied = pointKeys.has(`${r},${c}`);
        const origin = options.origin || [0, 0];
        const isOrigin = occupied && r === origin[0] && c === origin[1];
        const isLatest = occupied && options.latest && r === options.latest[0] && c === options.latest[1];
        tiles += `<span class="di694-tile${occupied ? " land" : " water"}${isOrigin ? " origin" : ""}${isLatest ? " latest" : ""}">${isOrigin ? "●" : occupied ? "" : "·"}</span>`;
      }
    }
    return `<div class="di694-shape-grid" style="--shape-cols:${maxC - minC + 1}">${tiles}</div>`;
  };

  const currentRelative = view.current && view.origin
    ? [view.current[0] - view.origin[0], view.current[1] - view.origin[1]]
    : null;
  const originLabel = view.origin ? `(${view.origin[0]},${view.origin[1]})` : "(r₀,c₀)";
  const formula = currentRelative && view.phase === "dfs"
    ? `(${view.current[0]},${view.current[1]}) − ${originLabel} = (${currentRelative[0]},${currentRelative[1]})`
    : view.phase === "compare"
      ? (view.candidateState === "duplicate" ? `shape = S${view.matchId}` : `shape + S${view.matchId}`)
      : view.phase === "done"
        ? `|set| = ${view.distinctCount}`
        : view.origin
          ? `${originLabel} → (0,0)`
          : "grid → shape";

  const absoluteArt = shapeArt(view.shape.map((cell) => ({ dr: cell.row, dc: cell.col })), {
    origin: view.origin,
    latest: view.current ? [view.current[0], view.current[1]] : null,
  });
  const normalizedArt = shapeArt(view.shape, { latest: currentRelative });
  const currentShape = view.shape.length ? normalizedArt : `<div class="di694-empty-shape">?</div>`;

  const knownHtml = view.knownSignatures.length
    ? view.knownSignatures.map((record) => {
        const matched = view.phase === "compare" && record.id === view.matchId;
        const badge = matched ? (view.candidateState === "duplicate" ? "=" : "+") : "";
        return `<article class="di694-shape-card${matched ? " matched" : ""}${view.candidateState === "duplicate" && matched ? " duplicate" : ""}">
          <header><b>S${record.id}</b>${badge ? `<i>${badge}</i>` : ""}</header>
          ${shapeArt(record.shape)}
        </article>`;
      }).join("")
    : `<div class="di694-empty-set"><b>{ }</b><span>${vi ? "chưa có shape" : "no shapes"}</span></div>`;

  const verdict = view.phase === "compare"
    ? `<div class="di694-verdict ${view.candidateState}"><b>${view.candidateState === "duplicate" ? "=" : "+"}</b><span>${view.candidateState === "duplicate" ? (vi ? "TRÙNG" : "MATCH") : (vi ? "MỚI" : "NEW")}</span></div>`
    : "";
  const summary = vi ? "Chuẩn hoá hình dạng đảo bằng tọa độ tương đối" : "Normalize island shapes with relative coordinates";
  return `<section class="di694-viz phase-${view.phase}" aria-label="${escapeHtml(summary)}">
    <header class="di694-topbar">
      <div class="di694-stages">${phases}</div>
      <div class="di694-counters"><span>🏝️ <b>${view.islandNumber || 0}</b></span><span>◆ <b>${view.distinctCount}</b></span></div>
    </header>
    <div class="di694-normalizer">
      <article><small>${vi ? "TRÊN GRID" : "ON GRID"}</small>${absoluteArt}</article>
      <div class="di694-minus"><b>−</b><span>${originLabel}</span></div>
      <article><small>SHAPE</small>${currentShape}</article>
    </div>
    <div class="di694-formula">${escapeHtml(formula)}</div>
    ${verdict}
    <section class="di694-library">
      <header><b>{ SHAPES }</b><span>${view.distinctCount}</span></header>
      <div>${knownHtml}</div>
    </section>
    <footer class="di694-rule"><span>↔ ${vi ? "chỉ tịnh tiến" : "translation only"}</span><span>↻ ✕</span><span>⇋ ✕</span></footer>
  </section>`;
}

function surroundedRegionsGuideHtml(view) {
  const vi = lang === "vi";
  const phaseOrder = { border: 0, spread: 1, capture: 2, done: 3 };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const labels = vi ? ["BIÊN", "LAN", "LẬT"] : ["EDGE", "SPREAD", "FLIP"];
  const icons = ["▣", "⌁", "✕"];
  const stages = labels.map((label, index) => {
    const state = activePhase > index ? "done" : activePhase === index ? "active" : "pending";
    return `<span class="sr130-stage ${state}"><i>${activePhase > index ? "✓" : icons[index]}</i><b>${label}</b></span>`;
  }).join(`<span class="sr130-stage-arrow">›</span>`);

  const board = (pattern, kind) => {
    const rows = pattern.length;
    const cols = pattern[0].length;
    const cells = pattern.flatMap((row, r) => [...row].map((value, c) => {
      const edge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      const cls = value === "X" ? "wall" : value === "S" ? "safe" : "open";
      return `<span class="sr130-mini-cell ${cls}${edge ? " edge" : ""}">${value === "S" ? "O" : value}</span>`;
    })).join("");
    return `<div class="sr130-mini-board ${kind}" style="--sr130-mini-cols:${cols}">${cells}</div>`;
  };

  const safeBoard = board(["XXXX", "OSXX", "XSSX", "XXXX"], "safe-board");
  const trappedBefore = board(["XXX", "XOX", "XXX"], "trapped-board");
  const trappedAfter = board(["XXX", "XXX", "XXX"], "captured-board");
  const keepState = view.phase === "done" ? "done" : ["border", "spread"].includes(view.phase) ? "active" : "";
  const flipState = view.phase === "done" ? "done" : view.phase === "capture" ? "active" : "";
  const action = view.phase === "done"
    ? `✓ ${view.safeCount}   ·   ✕ ${view.capturedCount}`
    : view.event === "border-seeds"
      ? `O@edge × ${view.borderCount}`
      : view.event === "mark-safe"
        ? "O → ✓"
        : view.event === "restore-safe"
          ? "✓ → O"
          : view.event === "flip"
            ? "O → X"
            : view.current
              ? `(${view.current[0]},${view.current[1]})`
              : "O → edge ?";
  const summary = vi ? "Giữ O nối biên, lật O bị bao kín" : "Keep border-connected O, flip enclosed O";
  return `<section class="sr130-viz phase-${view.phase}" aria-label="${escapeHtml(summary)}">
    <header class="sr130-topbar">
      <div class="sr130-stages">${stages}</div>
      <div class="sr130-counts"><span>🛟 <b>${view.safeCount}</b></span><span>✕ <b>${view.capturedCount}</b></span></div>
    </header>
    <div class="sr130-action">${escapeHtml(action)}</div>
    <div class="sr130-cases">
      <article class="sr130-case keep ${keepState}">
        <header><span>↗</span><b>${vi ? "BIÊN → GIỮ" : "EDGE → KEEP"}</b></header>
        ${safeBoard}
      </article>
      <article class="sr130-case flip ${flipState}">
        <header><span>▣</span><b>${vi ? "KÍN → LẬT" : "CLOSED → FLIP"}</b></header>
        <div class="sr130-flip-picture">${trappedBefore}<i>→</i>${trappedAfter}</div>
      </article>
    </div>
    <footer><span><i class="sr130-dot safe"></i>O</span><span><i class="sr130-dot captured"></i>O→X</span></footer>
  </section>`;
}

function effortGuideHtml(view) {
  const vi = lang === "vi";
  const event = view.event || "init";
  const current = Array.isArray(view.current) ? view.current : null;
  const neighbor = Array.isArray(view.neighbor) ? view.neighbor : null;
  const heights = Array.isArray(view.heights) ? view.heights : [];
  const heap = Array.isArray(view.heap) ? [...view.heap] : [];
  const pathEdges = Array.isArray(view.pathEdges) ? view.pathEdges : [];
  const valueAt = (cell) => cell && heights[cell[0]] ? heights[cell[0]][cell[1]] : null;
  const coord = (cell) => cell ? `(${cell[0]},${cell[1]})` : "—";
  const hasValue = (value) => value !== null && value !== undefined;
  const activePhase = event === "done"
    ? 3
    : ["direction", "neighbor", "bounds", "edge"].includes(event)
      ? 1
      : ["relax", "compare"].includes(event)
        ? 2
        : ["update"].includes(event) || (event === "push" && neighbor)
          ? 3
          : 0;
  const phaseLabels = vi
    ? ["1 · Pop heap", "2 · Đo cạnh", "3 · Lấy max", "4 · Relax"]
    : ["1 · Pop heap", "2 · Measure edge", "3 · Take max", "4 · Relax"];
  const phases = phaseLabels.map((label, index) => {
    const state = event === "done" || index < activePhase ? "done" : index === activePhase ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : index === activePhase ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  const heapHtml = heap.length
    ? heap.slice(0, 8).map(([effort, row, col], index) => `<span class="${index === 0 ? "top" : ""}"><small>${index === 0 ? "TOP" : `#${index + 1}`}</small><strong>${effort}</strong>· (${row},${col})</span>`).join("")
    : `<span class="effort-heap-empty">∅</span>`;
  const moreHeap = heap.length > 8 ? `<small class="effort-heap-more">+${heap.length - 8}</small>` : "";

  const currentHeight = valueAt(current);
  const neighborHeight = valueAt(neighbor);
  const routeHtml = current
    ? `<div class="effort-route-row">
        <span class="current-cell"><small>${vi ? "Ô ĐANG POP" : "POPPED CELL"}</small><strong>${coord(current)}</strong><em>height ${currentHeight}</em></span>
        ${neighbor ? `<b aria-hidden="true">→</b><span class="neighbor-cell"><small>${vi ? "HÀNG XÓM" : "NEIGHBOR"}</small><strong>${coord(neighbor)}</strong><em>${hasValue(neighborHeight) ? `height ${neighborHeight}` : (vi ? "ngoài grid" : "outside grid")}</em></span>` : ""}
      </div>`
    : `<div class="effort-key-idea"><code>effort(path) = max(|Δheight|)</code><span>${vi ? "không cộng các cạnh" : "never sum the edges"}</span></div>`;

  const formulaHtml = hasValue(view.edgeEffort)
    ? `<div class="effort-formula-row">
        <span><small>${vi ? "ĐƯỜNG ĐẾN CURRENT" : "PATH TO CURRENT"}</small><strong>${view.curEffort}</strong></span>
        <b>max</b>
        <span><small>|${currentHeight} − ${neighborHeight}|</small><strong>${view.edgeEffort}</strong></span>
        <b>=</b>
        <span class="new-effort"><small>new_effort</small><strong>${hasValue(view.newEffort) ? view.newEffort : "?"}</strong></span>
        ${hasValue(view.improves) ? `<span class="effort-decision ${view.improves ? "update" : "skip"}">${view.improves ? "✓ UPDATE" : "✕ SKIP"}<small>${hasValue(view.newEffort) ? view.newEffort : "?"} &lt; ${escapeHtml(String(view.oldEffort))}</small></span>` : ""}
      </div>`
    : `<div class="effort-key-idea"><code>new_effort = max(cur_effort, edge_effort)</code></div>`;

  const pathHtml = pathEdges.length
    ? `<div class="effort-path-row"><strong>${vi ? "ĐƯỜNG CUỐI · bottleneck được tô đậm" : "FINAL PATH · bottleneck is emphasized"}</strong><div>${pathEdges.map((edge) => {
      const bottleneck = edge.diff === view.answer;
      return `<span class="${bottleneck ? "bottleneck" : ""}">${coord(edge.from)}→${coord(edge.to)} <b>|Δ|=${edge.diff}</b></span>`;
    }).join("")}</div></div>`
    : "";

  return `<section class="effort-dijkstra-guide" aria-label="${vi ? "Mô phỏng Dijkstra minimax" : "Minimax Dijkstra simulation"}">
    <div class="effort-phases">${phases}</div>
    <div class="effort-guide-main">
      <div class="effort-heap-lane"><div><strong>MIN-HEAP</strong><small>${vi ? "effort nhỏ nhất đứng đầu" : "smallest effort first"}</small></div><div>${heapHtml}${moreHeap}</div></div>
      ${routeHtml}
      ${formulaHtml}
    </div>
    ${pathHtml}
  </section>`;
}

function renderFloodFillView(step) {
  const view = step.floodFillView;
  const vi = lang === "vi";
  const recursive = view.mode === "recursive";
  const bfs = view.mode === "bfs";
  const keyOf = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const coord = (cell) => Array.isArray(cell) ? `(${cell[0]},${cell[1]})` : "—";
  const currentKey = keyOf(view.current);
  const neighborKey = keyOf(view.neighbor);
  const startKey = keyOf(view.start);
  const hasTopFrame = recursive && view.stack.length > 0;
  const neighborInside = Array.isArray(view.neighbor)
    && view.neighbor[0] >= 0 && view.neighbor[0] < view.rows
    && view.neighbor[1] >= 0 && view.neighbor[1] < view.cols;
  const expansionPhases = new Set(["stack-init", "fill-start", "stack-check", "pop"]);
  const neighborPhases = new Set(["direction", "neighbor", "neighbor-check"]);
  const fillPhases = new Set(["fill-neighbor", "push-neighbor", "stack-empty", "done"]);
  const recursiveCallPhases = new Set(["main-call", "dfs-enter", "recursive-call", "resume-frame"]);
  const recursiveCheckPhases = new Set(["bounds-check", "color-check", "return-bounds", "return-color"]);
  const recursiveFillPhases = new Set(["recolor", "dfs-complete", "main-resume", "done"]);
  const bfsQueuePhases = new Set(["queue-init", "fill-start", "directions", "queue-check", "dequeue"]);
  const bfsNeighborPhases = new Set(["direction", "next-row", "neighbor", "row-bounds", "col-bounds", "bounds-check", "continue-bounds", "color-check", "continue-color"]);
  const bfsFillPhases = new Set(["fill-neighbor", "enqueue-neighbor", "queue-empty", "done"]);
  const activePhase = recursive
    ? recursiveFillPhases.has(view.phase) ? 3 : recursiveCheckPhases.has(view.phase) ? 2 : recursiveCallPhases.has(view.phase) ? 1 : 0
    : bfs
      ? bfsFillPhases.has(view.phase) ? 3 : bfsNeighborPhases.has(view.phase) ? 2 : bfsQueuePhases.has(view.phase) ? 1 : 0
    : fillPhases.has(view.phase) ? 3 : neighborPhases.has(view.phase) ? 2 : expansionPhases.has(view.phase) ? 1 : 0;
  const phaseLabels = recursive
    ? (vi
      ? ["1. Khởi tạo", "2. Vào frame dfs", "3. Hai base case", "4. Tô và gọi 4 hướng"]
      : ["1. Initialize", "2. Enter dfs frame", "3. Two base cases", "4. Recolor and call four ways"])
    : bfs
      ? (vi
        ? ["1. Đọc màu gốc", "2. Dequeue ở FRONT", "3. Kiểm tra hàng xóm", "4. Tô và enqueue BACK"]
        : ["1. Read source color", "2. Dequeue from FRONT", "3. Check a neighbor", "4. Recolor and enqueue at BACK"])
    : (vi
      ? ["1. Đọc màu gốc", "2. Pop từ DFS stack", "3. Kiểm tra hàng xóm", "4. Tô màu và push"]
      : ["1. Read source color", "2. Pop DFS stack", "3. Check a neighbor", "4. Recolor and push"]);
  const phasesHtml = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < activePhase;
    const state = done ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${done ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const cellsHtml = view.image.map((row, rowIndex) => row.map((value, colIndex) => {
    const key = `${rowIndex},${colIndex}`;
    const classes = ["flood-fill-cell"];
    if (view.changed[rowIndex][colIndex]) classes.push("is-filled");
    else if (view.original[rowIndex][colIndex] === view.originalColor) classes.push("is-source-color");
    else classes.push("is-barrier");
    if (key === startKey) classes.push("is-start");
    if (key === currentKey) classes.push("is-current");
    if (key === neighborKey) classes.push("is-neighbor");
    const tags = [];
    if (key === currentKey) tags.push(recursive ? (hasTopFrame ? "TOP" : "READ") : "CUR");
    if (key === neighborKey) tags.push("NEXT");
    return `<div class="${classes.join(" ")}">
      <small>[${rowIndex},${colIndex}]</small>
      <strong>${escapeHtml(value)}</strong>
      <span>${tags.join(" · ")}</span>
    </div>`;
  }).join("")).join("");

  const stackHtml = view.stack.length
    ? view.stack.map((cell, index) => {
      const top = index === view.stack.length - 1;
      const front = index === 0;
      const back = top;
      const label = recursive
        ? (top ? `TOP · d${index}` : `depth ${index}`)
        : bfs
          ? (front && back ? "FRONT / BACK" : front ? "FRONT" : back ? "BACK" : `#${index}`)
          : (top ? "TOP" : `#${index}`);
      return `<span class="${(bfs ? front : top) ? "is-top" : ""}"><small>${label}</small><strong>${escapeHtml(coord(cell))}</strong></span>`;
    }).join("")
    : `<em>∅</em>`;

  const directionDefinitions = [
    { delta: [1, 0], arrow: "↓", vi: "xuống", en: "down" },
    { delta: [-1, 0], arrow: "↑", vi: "lên", en: "up" },
    { delta: [0, 1], arrow: "→", vi: "phải", en: "right" },
    { delta: [0, -1], arrow: "←", vi: "trái", en: "left" },
  ];
  const directionHtml = directionDefinitions.map((direction) => {
    const active = Array.isArray(view.direction)
      && view.direction[0] === direction.delta[0] && view.direction[1] === direction.delta[1];
    return `<span class="${active ? "is-active" : ""}"><b>${direction.arrow}</b><small>${escapeHtml(vi ? direction.vi : direction.en)}</small><code>(${direction.delta.join(",")})</code></span>`;
  }).join("");

  const activeDirection = directionDefinitions.find((direction) => Array.isArray(view.direction)
    && view.direction[0] === direction.delta[0] && view.direction[1] === direction.delta[1]);
  const arrow = activeDirection ? activeDirection.arrow : "→";
  const currentInside = Array.isArray(view.current)
    && view.current[0] >= 0 && view.current[0] < view.rows
    && view.current[1] >= 0 && view.current[1] < view.cols;
  const currentValue = currentInside ? view.image[view.current[0]][view.current[1]] : "OUT";
  let neighborValue = "?";
  if (neighborInside) neighborValue = view.image[view.neighbor[0]][view.neighbor[1]];
  const recursiveState = {
    "dfs-enter": ["FRAME STATE", "enter", `d${Math.max(0, view.stack.length - 1)}`],
    "bounds-check": ["BASE CASE 1", "in bounds?", view.insideGrid === null ? "?" : view.insideGrid ? "True" : "False"],
    "return-bounds": ["FRAME STATE", "out of bounds", "RETURN"],
    "color-check": ["BASE CASE 2", "source color?", view.matchesOriginal === null ? "?" : view.matchesOriginal ? "True" : "False"],
    "return-color": ["FRAME STATE", "wrong/visited", "RETURN"],
    recolor: ["FRAME STATE", "recolor", String(view.newColor)],
    "dfs-complete": ["FRAME STATE", "4 calls done", "RETURN"],
  }[view.phase] || ["FRAME STATE", "dfs(row,col)", "ACTIVE"];
  const bfsState = {
    "read-color": ["BFS SETUP", "read source", String(view.originalColor ?? "?")],
    "same-color-check": ["BFS SETUP", "same color?", view.originalColor === view.newColor ? "True" : "False"],
    "queue-init": ["QUEUE OP", "enqueue start", "BACK"],
    "fill-start": ["VISITED", "recolor start", String(view.newColor)],
    directions: ["BFS SETUP", "4 directions", "READY"],
    dequeue: ["QUEUE OP", "popleft", "FRONT"],
    direction: ["DIRECTION", activeDirection ? `(${activeDirection.delta.join(",")})` : "choose", arrow],
    "next-row": ["COORDINATE", "next_row", String(view.nextRow ?? "?")],
  }[view.phase] || ["BFS STATE", "queue traversal", "ACTIVE"];
  const hasNeighbor = Array.isArray(view.neighbor);
  const routeHtml = Array.isArray(view.current) && ((!recursive && !bfs) || hasNeighbor)
    ? `<div class="flood-fill-route">
        <span class="${currentInside ? "is-current" : "is-outside"}"><small>${hasTopFrame ? "TOP FRAME" : recursive ? "FOCUS" : "CURRENT"}</small><strong>${escapeHtml(coord(view.current))}</strong><em>${escapeHtml(currentValue)}</em></span>
        <b>${arrow}</b>
        <span class="${neighborInside ? "is-neighbor" : "is-outside"}"><small>NEIGHBOR</small><strong>${escapeHtml(coord(view.neighbor))}</strong><em>${neighborInside ? escapeHtml(neighborValue) : "OUT"}</em></span>
      </div>`
    : recursive && Array.isArray(view.current)
      ? `<div class="flood-fill-route is-frame">
          <span class="${currentInside ? "is-current" : "is-outside"}"><small>${hasTopFrame ? "TOP FRAME" : "FOCUS"}</small><strong>${escapeHtml(coord(view.current))}</strong><em>${escapeHtml(currentValue)}</em></span>
          <b>→</b>
          <span class="is-check"><small>${escapeHtml(recursiveState[0])}</small><strong>${escapeHtml(recursiveState[1])}</strong><em>${escapeHtml(recursiveState[2])}</em></span>
        </div>`
      : bfs && Array.isArray(view.current)
        ? `<div class="flood-fill-route is-frame">
            <span class="${currentInside ? "is-current" : "is-outside"}"><small>CURRENT</small><strong>${escapeHtml(coord(view.current))}</strong><em>${escapeHtml(currentValue)}</em></span>
            <b>→</b>
            <span class="is-check"><small>${escapeHtml(bfsState[0])}</small><strong>${escapeHtml(bfsState[1])}</strong><em>${escapeHtml(bfsState[2])}</em></span>
          </div>`
        : `<div class="flood-fill-route is-idle"><code>${recursive ? "dfs(row,col) → base cases → recolor → 4 calls" : bfs ? "queue.popleft() → current → enqueue neighbors" : "stack.pop() → current → 4 neighbors"}</code></div>`;

  const truth = (value) => value === null ? "?" : value ? "True" : "False";
  let decision = "?";
  let decisionClass = "";
  if (view.phase === "done") {
    decision = "RETURN";
    decisionClass = "is-fill";
  } else if (recursive && view.phase === "main-call") {
    decision = "CALL";
    decisionClass = "is-push";
  } else if (recursive && view.phase === "dfs-enter") {
    decision = "ENTER";
    decisionClass = "is-push";
  } else if (recursive && view.phase === "bounds-check") {
    decision = view.insideGrid ? "NEXT CHECK" : "RETURN";
    decisionClass = view.insideGrid ? "is-fill" : "is-skip";
  } else if (recursive && view.phase === "color-check") {
    decision = view.matchesOriginal ? "RECOLOR" : "RETURN";
    decisionClass = view.matchesOriginal ? "is-fill" : "is-skip";
  } else if (recursive && ["return-bounds", "return-color", "dfs-complete"].includes(view.phase)) {
    decision = "RETURN";
    decisionClass = "is-skip";
  } else if (recursive && view.phase === "recolor") {
    decision = "RECOLOR";
    decisionClass = "is-fill";
  } else if (recursive && view.phase === "recursive-call") {
    decision = "CALL";
    decisionClass = "is-push";
  } else if (recursive && view.phase === "resume-frame") {
    decision = "RESUME";
    decisionClass = "is-fill";
  } else if (recursive && view.phase === "main-resume") {
    decision = "DONE";
    decisionClass = "is-fill";
  } else if (bfs && view.phase === "queue-init") {
    decision = "ENQUEUE";
    decisionClass = "is-push";
  } else if (bfs && view.phase === "queue-check") {
    decision = "CONTINUE";
    decisionClass = "is-fill";
  } else if (bfs && view.phase === "dequeue") {
    decision = "DEQUEUE";
    decisionClass = "is-push";
  } else if (bfs && ["row-bounds", "col-bounds"].includes(view.phase)) {
    decision = "STORE";
    decisionClass = "is-fill";
  } else if (bfs && view.phase === "bounds-check") {
    decision = view.insideGrid ? "NEXT CHECK" : "SKIP";
    decisionClass = view.insideGrid ? "is-fill" : "is-skip";
  } else if (bfs && ["continue-bounds", "continue-color"].includes(view.phase)) {
    decision = "SKIP";
    decisionClass = "is-skip";
  } else if (bfs && view.phase === "color-check") {
    decision = view.matchesOriginal ? "RECOLOR" : "SKIP";
    decisionClass = view.matchesOriginal ? "is-fill" : "is-skip";
  } else if (bfs && view.phase === "enqueue-neighbor") {
    decision = "ENQUEUE";
    decisionClass = "is-push";
  } else if (bfs && view.phase === "queue-empty") {
    decision = "STOP";
    decisionClass = "is-skip";
  } else if (view.phase === "stack-empty") {
    decision = "STOP";
    decisionClass = "is-skip";
  } else if (view.phase === "fill-neighbor") {
    decision = vi ? "TÔ MÀU" : "RECOLOR";
    decisionClass = "is-fill";
  } else if (view.phase === "push-neighbor") {
    decision = "PUSH";
    decisionClass = "is-push";
  } else if (view.canFill !== null) {
    decision = view.canFill ? (vi ? "HỢP LỆ" : "FILL") : (vi ? "BỎ QUA" : "SKIP");
    decisionClass = view.canFill ? "is-fill" : "is-skip";
  }
  const firstCheck = bfs && view.phase === "row-bounds"
    ? { label: "ROW IN BOUNDS", value: view.rowInside }
    : bfs && view.phase === "col-bounds"
      ? { label: "COL IN BOUNDS", value: view.colInside }
      : { label: vi ? "TRONG BIÊN" : "IN BOUNDS", value: view.insideGrid };
  const checksHtml = `<div class="flood-fill-checks">
    <span class="${firstCheck.value === true ? "is-pass" : firstCheck.value === false ? "is-fail" : ""}"><small>${firstCheck.label}</small><strong>${truth(firstCheck.value)}</strong></span>
    <b>AND</b>
    <span class="${view.matchesOriginal === true ? "is-pass" : view.matchesOriginal === false ? "is-fail" : ""}"><small>${recursive ? "image[row][col] == original" : "image[next] == original"}</small><strong>${truth(view.matchesOriginal)}</strong></span>
    <b>→</b>
    <span class="flood-fill-decision ${decisionClass}"><small>${vi ? "HÀNH ĐỘNG" : "ACTION"}</small><strong>${escapeHtml(decision)}</strong></span>
  </div>`;

  let actionDetail;
  if (bfs && view.phase === "enter") {
    actionDetail = vi ? "Cách 3 dùng FIFO queue: lấy ô cũ nhất ở FRONT, thêm ô mới vào BACK." : "Approach 3 uses a FIFO queue: remove the oldest cell at FRONT and add new cells at BACK.";
  } else if (bfs && view.phase === "dimensions") {
    actionDetail = vi ? `Image có ${view.rows} hàng, ${view.cols} cột; đây là biên để chặn neighbor ngoài image.` : `The image has ${view.rows} rows and ${view.cols} columns; these bounds reject outside neighbors.`;
  } else if (bfs && view.phase === "read-color") {
    actionDetail = vi ? `Đọc original_color = ${view.originalColor} tại ô bắt đầu ${coord(view.start)}.` : `Read original_color = ${view.originalColor} from the start cell ${coord(view.start)}.`;
  } else if (bfs && view.phase === "same-color-check") {
    actionDetail = view.originalColor === view.newColor
      ? (vi ? "Màu mới trùng màu gốc, nên return trước khi tạo queue." : "The new color matches the source, so return before creating the queue.")
      : (vi ? "Màu mới khác màu gốc; tiếp tục khởi tạo BFS queue." : "The new color differs from the source; initialize the BFS queue.");
  } else if (bfs && view.phase === "queue-init") {
    actionDetail = vi ? `${coord(view.start)} vào queue; vì chỉ có một phần tử nên nó vừa là FRONT vừa là BACK.` : `${coord(view.start)} enters the queue; as its only item, it is both FRONT and BACK.`;
  } else if (bfs && view.phase === "fill-start") {
    actionDetail = vi ? "Tô ô bắt đầu ngay khi enqueue để đánh dấu visited và tránh enqueue trùng." : "Recolor the start cell on enqueue to mark it visited and prevent duplicate enqueue.";
  } else if (bfs && view.phase === "directions") {
    actionDetail = vi ? "Bốn hướng không có đường chéo: xuống, lên, phải, trái." : "Use four non-diagonal directions: down, up, right, and left.";
  } else if (bfs && view.phase === "queue-check") {
    actionDetail = vi ? `Queue còn ${view.stack.length} ô; BFS sẽ lấy ô ở FRONT.` : `${view.stack.length} cell(s) remain; BFS removes the FRONT cell next.`;
  } else if (bfs && view.phase === "dequeue") {
    actionDetail = vi ? `${coord(view.current)} vừa rời FRONT và trở thành CURRENT; thứ tự các ô còn lại không đổi.` : `${coord(view.current)} just left FRONT and became CURRENT; the remaining order is unchanged.`;
  } else if (bfs && view.phase === "direction") {
    actionDetail = vi ? `Từ CURRENT ${coord(view.current)}, chọn hướng ${arrow}; bước sau mới tính neighbor.` : `From CURRENT ${coord(view.current)}, choose direction ${arrow}; the next line computes the neighbor.`;
  } else if (bfs && view.phase === "next-row") {
    actionDetail = vi ? `Tính next_row = ${view.nextRow}; bước sau mới tính next_col.` : `Compute next_row = ${view.nextRow}; the next line computes next_col.`;
  } else if (bfs && view.phase === "neighbor") {
    actionDetail = vi ? `Hướng ${arrow} từ ${coord(view.current)} tạo neighbor ${coord(view.neighbor)}.` : `Direction ${arrow} from ${coord(view.current)} produces neighbor ${coord(view.neighbor)}.`;
  } else if (bfs && view.phase === "row-bounds") {
    actionDetail = vi ? `row_inside = ${truth(view.rowInside)} vì kiểm tra 0 <= ${view.nextRow} < ${view.rows}.` : `row_inside = ${truth(view.rowInside)} from checking 0 <= ${view.nextRow} < ${view.rows}.`;
  } else if (bfs && view.phase === "col-bounds") {
    actionDetail = vi ? `col_inside = ${truth(view.colInside)} vì kiểm tra 0 <= ${view.nextCol} < ${view.cols}.` : `col_inside = ${truth(view.colInside)} from checking 0 <= ${view.nextCol} < ${view.cols}.`;
  } else if (bfs && view.phase === "bounds-check") {
    actionDetail = view.insideGrid
      ? (vi ? `${coord(view.neighbor)} nằm trong image; tiếp tục kiểm tra màu.` : `${coord(view.neighbor)} is inside the image; check its color next.`)
      : (vi ? `${coord(view.neighbor)} nằm ngoài image; không được truy cập ô này.` : `${coord(view.neighbor)} is outside the image; do not access this cell.`);
  } else if (bfs && view.phase === "continue-bounds") {
    actionDetail = vi ? "continue bỏ neighbor ngoài biên và chuyển sang hướng tiếp theo; queue không đổi." : "continue skips the out-of-bounds neighbor and moves to the next direction; the queue is unchanged.";
  } else if (bfs && view.phase === "color-check") {
    actionDetail = view.matchesOriginal
      ? (vi ? `image${coord(view.neighbor)} vẫn bằng ${view.originalColor}; neighbor thuộc vùng cần tô.` : `image${coord(view.neighbor)} still equals ${view.originalColor}; the neighbor belongs to the fill region.`)
      : (vi ? `image${coord(view.neighbor)} không bằng ${view.originalColor}; đây là biên màu hoặc ô đã visited.` : `image${coord(view.neighbor)} does not equal ${view.originalColor}; it is a color boundary or an already visited cell.`);
  } else if (bfs && view.phase === "continue-color") {
    actionDetail = vi ? "continue bỏ ô khác màu hoặc đã tô; không thêm nó vào queue." : "continue skips a different or visited cell; it is not added to the queue.";
  } else if (bfs && view.phase === "fill-neighbor") {
    actionDetail = vi ? `Đổi ${coord(view.neighbor)} sang màu ${view.newColor} trước khi enqueue để đánh dấu visited.` : `Recolor ${coord(view.neighbor)} to ${view.newColor} before enqueueing it to mark it visited.`;
  } else if (bfs && view.phase === "enqueue-neighbor") {
    actionDetail = vi ? `${coord(view.neighbor)} vào BACK; mọi ô đứng trước sẽ được dequeue trước nó.` : `${coord(view.neighbor)} enters at BACK; every cell ahead of it will be dequeued first.`;
  } else if (bfs && view.phase === "queue-empty") {
    actionDetail = vi ? "Queue rỗng: toàn bộ component nối với ô bắt đầu đã được xử lý." : "The queue is empty: the entire component connected to the start has been processed.";
  } else if (bfs) {
    actionDetail = vi ? `Hoàn tất BFS: ${view.filledCount} ô đã đổi sang màu ${view.newColor}.` : `BFS complete: ${view.filledCount} cell(s) were changed to color ${view.newColor}.`;
  } else if (recursive && view.phase === "enter") {
    actionDetail = vi ? "Cách 2 dùng call stack của dfs; mỗi lời gọi tạo một frame riêng." : "Approach 2 uses the dfs call stack; every call creates its own frame.";
  } else if (recursive && view.phase === "rows") {
    actionDetail = vi ? `rows = ${view.rows}: lưu số hàng để kiểm tra biên.` : `rows = ${view.rows}: store the row count for bounds checks.`;
  } else if (recursive && view.phase === "dimensions") {
    actionDetail = vi ? `cols = ${view.cols}: miền hợp lệ là row 0..${view.rows - 1}, col 0..${view.cols - 1}.` : `cols = ${view.cols}: valid coordinates are rows 0..${view.rows - 1}, cols 0..${view.cols - 1}.`;
  } else if (recursive && view.phase === "read-color") {
    actionDetail = vi ? `Đọc original_color = ${view.originalColor} tại ô bắt đầu ${coord(view.start)}.` : `Read original_color = ${view.originalColor} from the start cell ${coord(view.start)}.`;
  } else if (recursive && view.phase === "same-color-check") {
    actionDetail = view.originalColor === view.newColor
      ? (vi ? "Màu mới trùng màu gốc, nên return ngay và không tạo frame dfs." : "The new color matches the source, so return before creating any dfs frame.")
      : (vi ? "Màu mới khác màu gốc; tiếp tục định nghĩa và gọi dfs." : "The new color differs from the source; continue to define and call dfs.");
  } else if (recursive && view.phase === "define-dfs") {
    actionDetail = vi ? "Mỗi frame dfs chạy hai base case, tô ô hợp lệ, rồi lần lượt gọi xuống, lên, phải, trái." : "Each dfs frame checks two base cases, recolors a valid cell, then calls down, up, right, and left.";
  } else if (recursive && view.phase === "main-call") {
    actionDetail = vi ? `Dòng chính gọi dfs${coord(view.start)}; bước sau frame đầu tiên mới được đẩy vào call stack.` : `The main function calls dfs${coord(view.start)}; the next step pushes the first frame onto the call stack.`;
  } else if (recursive && view.phase === "dfs-enter") {
    actionDetail = vi ? `Tạo frame ${coord(view.current)} ở TOP; depth hiện tại là ${Math.max(0, view.stack.length - 1)}.` : `Create frame ${coord(view.current)} at TOP; the current depth is ${Math.max(0, view.stack.length - 1)}.`;
  } else if (recursive && view.phase === "bounds-check") {
    actionDetail = view.insideGrid
      ? (vi ? `${coord(view.current)} nằm trong biên, nên frame chuyển sang kiểm tra màu.` : `${coord(view.current)} is in bounds, so this frame proceeds to the color check.`)
      : (vi ? `${coord(view.current)} nằm ngoài biên, nên base case 1 sẽ return.` : `${coord(view.current)} is out of bounds, so base case 1 returns.`);
  } else if (recursive && view.phase === "return-bounds") {
    actionDetail = vi ? `Frame ${coord(view.current)} return vì ngoài biên; bước sau nó rời TOP và frame cha tiếp tục.` : `Frame ${coord(view.current)} returns out of bounds; next it leaves TOP and its parent resumes.`;
  } else if (recursive && view.phase === "color-check") {
    actionDetail = view.matchesOriginal
      ? (vi ? `image${coord(view.current)} vẫn bằng original_color ${view.originalColor}, nên được phép tô.` : `image${coord(view.current)} still equals original_color ${view.originalColor}, so it may be recolored.`)
      : (vi ? `image${coord(view.current)} không còn bằng ${view.originalColor}; base case 2 ngăn đi lặp hoặc vượt vùng.` : `image${coord(view.current)} no longer equals ${view.originalColor}; base case 2 prevents revisits or crossing the region.`);
  } else if (recursive && view.phase === "return-color") {
    actionDetail = vi ? `Frame ${coord(view.current)} return mà không tô; bước sau frame cha được resume.` : `Frame ${coord(view.current)} returns without recoloring; the parent frame resumes next.`;
  } else if (recursive && view.phase === "recolor") {
    actionDetail = vi ? `Đổi image${coord(view.current)} thành ${view.newColor} trước bốn lời gọi con để đánh dấu đã thăm.` : `Set image${coord(view.current)} to ${view.newColor} before the four child calls to mark it visited.`;
  } else if (recursive && view.phase === "recursive-call") {
    actionDetail = vi ? `Frame ${coord(view.current)} tạm dừng và gọi frame con ${coord(view.neighbor)} theo hướng ${arrow}.` : `Frame ${coord(view.current)} pauses and calls child frame ${coord(view.neighbor)} in direction ${arrow}.`;
  } else if (recursive && view.phase === "resume-frame") {
    actionDetail = vi ? `Frame con ${coord(view.neighbor)} đã rời stack; frame cha ${coord(view.current)} tiếp tục ở đúng dòng gọi.` : `Child frame ${coord(view.neighbor)} left the stack; parent frame ${coord(view.current)} resumes at that call line.`;
  } else if (recursive && view.phase === "dfs-complete") {
    actionDetail = vi ? `Bốn hướng của ${coord(view.current)} đều đã return; frame TOP này chuẩn bị rời call stack.` : `All four directions from ${coord(view.current)} returned; this TOP frame is ready to leave the call stack.`;
  } else if (recursive && view.phase === "main-resume") {
    actionDetail = vi ? "Frame gốc đã return; call stack rỗng và quyền điều khiển trở lại floodFill." : "The root frame returned; the call stack is empty and control is back in floodFill.";
  } else if (recursive) {
    actionDetail = vi ? `Hoàn tất: ${view.filledCount} ô đã đổi sang màu ${view.newColor}.` : `Complete: ${view.filledCount} cell(s) were changed to color ${view.newColor}.`;
  } else if (view.phase === "enter") {
    actionDetail = vi ? "Bắt đầu từ ô S và chỉ lan qua cạnh trên, dưới, trái, phải." : "Start at S and spread only through top, bottom, left, and right edges.";
  } else if (view.phase === "dimensions") {
    actionDetail = vi ? `Image có ${view.rows} hàng và ${view.cols} cột.` : `The image has ${view.rows} rows and ${view.cols} columns.`;
  } else if (view.phase === "read-color") {
    actionDetail = vi ? `Ô bắt đầu có màu ${view.originalColor}; chỉ ô nối liền vẫn mang màu này mới thuộc vùng.` : `The start cell has color ${view.originalColor}; only connected cells still carrying it belong to the region.`;
  } else if (view.phase === "same-color-check") {
    actionDetail = view.originalColor === view.newColor
      ? (vi ? "Màu mới trùng màu gốc, nên trả ngay để tránh lặp." : "The new color matches the source, so return immediately to avoid looping.")
      : (vi ? "Màu mới khác màu gốc; có thể bắt đầu DFS." : "The new color differs from the source, so DFS can begin.");
  } else if (view.phase === "directions") {
    actionDetail = vi ? "Bốn hướng không có đường chéo: xuống, lên, phải, trái." : "Use four non-diagonal directions: down, up, right, and left.";
  } else if (view.phase === "stack-init") {
    actionDetail = vi ? `Đưa ô bắt đầu ${coord(view.start)} vào TOP của stack.` : `Put the start cell ${coord(view.start)} on TOP of the stack.`;
  } else if (view.phase === "fill-start") {
    actionDetail = vi ? "Tô ô bắt đầu trước khi duyệt để nó không bao giờ được push lần hai." : "Recolor the start before traversal so it can never be pushed twice.";
  } else if (view.phase === "stack-check") {
    actionDetail = vi ? `Stack còn ${view.stack.length} ô, nên vòng while tiếp tục.` : `${view.stack.length} cell(s) remain on the stack, so the while loop continues.`;
  } else if (view.phase === "pop") {
    actionDetail = vi ? `${coord(view.current)} rời TOP và trở thành CURRENT để mở rộng.` : `${coord(view.current)} leaves TOP and becomes CURRENT for expansion.`;
  } else if (view.phase === "direction") {
    actionDetail = vi ? `Chọn hướng ${activeDirection ? activeDirection.arrow : ""}; bước kế tiếp mới tính tọa độ neighbor.` : `Choose direction ${activeDirection ? activeDirection.arrow : ""}; the next line computes the neighbor coordinate.`;
  } else if (view.phase === "neighbor") {
    actionDetail = vi ? `Từ CURRENT ${coord(view.current)}, hướng ${arrow} tạo neighbor ${coord(view.neighbor)}.` : `From CURRENT ${coord(view.current)}, direction ${arrow} produces neighbor ${coord(view.neighbor)}.`;
  } else if (view.phase === "neighbor-check") {
    actionDetail = view.canFill
      ? (vi ? "Neighbor nằm trong biên và còn màu gốc, nên được phép tô." : "The neighbor is in bounds and still has the source color, so it can be filled.")
      : (vi ? "Ít nhất một điều kiện sai; neighbor không được tô hay push." : "At least one condition fails; the neighbor is neither recolored nor pushed.");
  } else if (view.phase === "fill-neighbor") {
    actionDetail = vi ? `Đổi ${coord(view.neighbor)} sang màu ${view.newColor} trước khi push.` : `Recolor ${coord(view.neighbor)} to ${view.newColor} before pushing it.`;
  } else if (view.phase === "push-neighbor") {
    actionDetail = vi ? `${coord(view.neighbor)} đã ở TOP và sẽ được pop để tiếp tục lan.` : `${coord(view.neighbor)} is now on TOP and will later be popped to continue the fill.`;
  } else if (view.phase === "stack-empty") {
    actionDetail = vi ? "Stack rỗng: không còn ô nào trong component cần mở rộng." : "The stack is empty: no cell in the component remains to expand.";
  } else {
    actionDetail = vi ? `Hoàn tất: ${view.filledCount} ô đã đổi sang màu ${view.newColor}.` : `Complete: ${view.filledCount} cell(s) were changed to color ${view.newColor}.`;
  }

  const summary = vi
    ? `Flood Fill ${view.rows} nhân ${view.cols}; đã tô ${view.filledCount} ô; ${recursive ? "call stack" : bfs ? "queue" : "stack"} có ${view.stack.length} phần tử.`
    : `Flood Fill ${view.rows} by ${view.cols}; ${view.filledCount} cells recolored; ${view.stack.length} item(s) in the ${recursive ? "call stack" : bfs ? "BFS queue" : "DFS stack"}.`;
  $("treeView").innerHTML = `<section class="flood-fill-viz${recursive ? " is-recursive" : bfs ? " is-bfs" : ""}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="flood-fill-phases">${phasesHtml}</div>
    <div class="flood-fill-status">
      <span><small>${vi ? "MÀU GỐC" : "SOURCE"}</small><strong>${view.originalColor === null ? "?" : escapeHtml(view.originalColor)}</strong></span>
      <span><small>${vi ? "MÀU MỚI" : "NEW COLOR"}</small><strong>${escapeHtml(view.newColor)}</strong></span>
      <span><small>${vi ? "ĐÃ TÔ" : "RECOLORED"}</small><strong>${view.filledCount}</strong></span>
      <span><small>${recursive ? "CALL STACK" : bfs ? "QUEUE" : "STACK"}</small><strong>${view.stack.length}</strong></span>
    </div>
    <div class="flood-fill-main">
      <section class="flood-fill-image-section">
        <header><strong>IMAGE</strong><span>${vi ? "tọa độ [row,col]" : "coordinates [row,col]"}</span></header>
        <div class="flood-fill-grid-scroll"><div class="flood-fill-grid" style="--flood-cols:${view.cols}">${cellsHtml}</div></div>
      </section>
      <section class="flood-fill-work-section">
        <header><strong>${recursive ? "CALL STACK" : bfs ? "BFS QUEUE" : "DFS STACK"}</strong><span>${recursive ? (vi ? "TOP frame ở bên phải" : "TOP frame at the right") : bfs ? (vi ? "popleft FRONT · append BACK" : "popleft FRONT · append BACK") : (vi ? "push/pop ở bên phải" : "push/pop at the right")}</span></header>
        <div class="flood-fill-stack">${stackHtml}</div>
        <div class="flood-fill-directions">${directionHtml}</div>
        ${routeHtml}
      </section>
    </div>
    ${checksHtml}
    <div class="flood-fill-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(actionDetail)}</span></div>
    <div class="flood-fill-legend">
      <span><i class="source"></i>${vi ? "còn màu gốc" : "source color"}</span>
      <span><i class="filled"></i>${vi ? "đã đổi màu" : "recolored"}</span>
      <span><i class="current"></i>${recursive ? "TOP FRAME" : "CURRENT"}</span>
      <span><i class="neighbor"></i>NEIGHBOR</span>
      <span><b>S</b>${vi ? "ô bắt đầu" : "start cell"}</span>
    </div>
  </section>`;
}

// ---- 749 Contain Virus renderer (reuses the flood-fill-* CSS from #733) ----
function renderVirusView(step) {
  const view = step.virusView;
  const vi = lang === "vi";
  const keyOf = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const coord = (cell) => Array.isArray(cell) ? `(${cell[0]},${cell[1]})` : "—";
  const currentKey = keyOf(view.current);

  // 4 tabs matching Contain Virus's own daily cycle:
  //   1. Scan & DFS each region   2. Compare frontiers   3. Quarantine winner   4. Spread the rest
  const scanPhases = new Set(["scan-cell", "dfs-visit", "dfs-neighbor", "region-done"]);
  const comparePhases = new Set(["no-regions", "compare-frontiers", "no-threat"]);
  const quarantinePhases = new Set(["add-walls", "mark-quarantine"]);
  const spreadPhases = new Set(["spread-loop", "spread-cell", "done"]);
  const activePhase = quarantinePhases.has(view.phase) ? 2 : spreadPhases.has(view.phase) ? 3 : comparePhases.has(view.phase) ? 1 : 0;
  const phaseLabels = vi
    ? ["1. Quét & DFS từng vùng", "2. So sánh frontier", "3. Cách ly vùng thắng", "4. Lan các vùng còn lại"]
    : ["1. Scan & DFS regions", "2. Compare frontiers", "3. Quarantine winner", "4. Spread the rest"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < activePhase;
    const state = done ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${done ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // Grid cells: 0=uninfected, 1=infected, 2 or -1=quarantined (walled)
  const regionSet = new Set(view.regionCells || []);
  const frontierSet = new Set(view.frontierCells || []);
  const winnerSet = new Set(view.winnerCells || []);
  const cellsHtml = view.grid.map((row, rowIndex) => row.map((value, colIndex) => {
    const key = `${rowIndex},${colIndex}`;
    const classes = ["flood-fill-cell"];
    const quarantined = value === 2 || value === -1;
    if (quarantined) classes.push("is-filled");
    else if (value === 1) classes.push("is-source-color");
    else classes.push("is-barrier");
    if (regionSet.has(key)) classes.push("is-neighbor");
    if (frontierSet.has(key)) classes.push("is-virus-frontier");
    if (winnerSet.has(key)) classes.push("is-current");
    if (key === currentKey) classes.push("is-current");
    const tags = [];
    if (regionSet.has(key)) tags.push(vi ? "VÙNG" : "REGION");
    if (frontierSet.has(key)) tags.push(vi ? "BIÊN" : "FRONTIER");
    if (winnerSet.has(key)) tags.push(vi ? "CÁCH LY" : "WALLED");
    return `<div class="${classes.join(" ")}">
      <small>[${rowIndex},${colIndex}]</small>
      <strong>${escapeHtml(value)}</strong>
      <span>${tags.join(" · ")}</span>
    </div>`;
  }).join("")).join("");

  // Region summary table: one row per region found this day
  const regionsHtml = (view.regions && view.regions.length)
    ? view.regions.map((region, index) => {
      const isWinner = index === view.quarantineIndex;
      return `<span class="${isWinner ? "is-top" : ""}">
        <small>${vi ? "vùng" : "region"} #${index}</small>
        <strong>${region.size} ${vi ? "ô" : "cells"}</strong>
        <em>${vi ? "frontier" : "frontier"}=${region.frontierSize} · ${vi ? "tường" : "walls"}=${region.walls}</em>
      </span>`;
    }).join("")
    : `<em>∅</em>`;

  const truth = (value) => value === null || value === undefined ? "?" : value ? "True" : "False";
  let decision = "?";
  let decisionClass = "";
  if (view.phase === "mark-quarantine") { decision = vi ? "CÁCH LY" : "QUARANTINE"; decisionClass = "is-fill"; }
  else if (view.phase === "add-walls") { decision = vi ? "XÂY TƯỜNG" : "BUILD WALLS"; decisionClass = "is-fill"; }
  else if (view.phase === "spread-cell") { decision = vi ? "LAN" : "SPREAD"; decisionClass = "is-push"; }
  else if (view.phase === "no-threat" || view.phase === "no-regions") { decision = vi ? "DỪNG" : "STOP"; decisionClass = "is-skip"; }
  else if (view.phase === "done") { decision = vi ? "TRẢ VỀ" : "RETURN"; decisionClass = "is-fill"; }
  else if (view.phase === "compare-frontiers") { decision = vi ? "CHỌN VÙNG MAX" : "PICK MAX"; decisionClass = "is-push"; }
  else if (view.phase === "dfs-visit" || view.phase === "dfs-neighbor") { decision = vi ? "MỞ RỘNG VÙNG" : "EXPAND REGION"; decisionClass = "is-push"; }

  const checksHtml = `<div class="flood-fill-checks">
    <span class="${view.day !== undefined ? "is-pass" : ""}"><small>${vi ? "NGÀY" : "DAY"}</small><strong>${view.day ?? "?"}</strong></span>
    <b>·</b>
    <span class="${view.regions && view.regions.length ? "is-pass" : ""}"><small>${vi ? "SỐ VÙNG" : "REGIONS"}</small><strong>${view.regions ? view.regions.length : "?"}</strong></span>
    <b>→</b>
    <span class="flood-fill-decision ${decisionClass}"><small>${vi ? "HÀNH ĐỘNG" : "ACTION"}</small><strong>${escapeHtml(decision)}</strong></span>
  </div>`;

  const summary = vi
    ? `Contain Virus ${view.rows} nhân ${view.cols}; ngày ${view.day ?? "?"}; tổng tường = ${view.totalWalls ?? 0}.`
    : `Contain Virus ${view.rows} by ${view.cols}; day ${view.day ?? "?"}; total walls = ${view.totalWalls ?? 0}.`;

  $("treeView").innerHTML = `<section class="flood-fill-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="flood-fill-phases">${phasesHtml}</div>
    <div class="flood-fill-status">
      <span><small>${vi ? "NGÀY" : "DAY"}</small><strong>${view.day ?? "?"}</strong></span>
      <span><small>${vi ? "SỐ VÙNG" : "REGIONS"}</small><strong>${view.regions ? view.regions.length : 0}</strong></span>
      <span><small>${vi ? "TƯỜNG NGÀY NÀY" : "WALLS TODAY"}</small><strong>${view.wallsToday ?? 0}</strong></span>
      <span><small>${vi ? "TỔNG TƯỜNG" : "TOTAL WALLS"}</small><strong>${view.totalWalls ?? 0}</strong></span>
    </div>
    <div class="flood-fill-main">
      <section class="flood-fill-image-section">
        <header><strong>GRID</strong><span>${vi ? "0=lành 1=nhiễm 2/-1=cách ly" : "0=clean 1=infected 2/-1=walled"}</span></header>
        <div class="flood-fill-grid-scroll"><div class="flood-fill-grid" style="--flood-cols:${view.cols}">${cellsHtml}</div></div>
      </section>
      <section class="flood-fill-work-section">
        <header><strong>${vi ? "CÁC VÙNG NGÀY NÀY" : "REGIONS THIS DAY"}</strong><span>${vi ? "vùng #max_idx sẽ bị cách ly" : "region #max_idx gets quarantined"}</span></header>
        <div class="flood-fill-stack">${regionsHtml}</div>
      </section>
    </div>
    ${checksHtml}
    <div class="flood-fill-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <div class="flood-fill-legend">
      <span><i class="source"></i>${vi ? "đất nhiễm" : "infected"}</span>
      <span><i class="filled"></i>${vi ? "đã cách ly" : "walled"}</span>
      <span><i class="current"></i>${vi ? "vùng thắng" : "winning region"}</span>
      <span><i class="neighbor"></i>${vi ? "vùng hiện tại" : "current region"}</span>
      <span><b>F</b>${vi ? "biên (frontier)" : "frontier"}</span>
    </div>
  </section>`;
}

function renderRottingOrangesView(step) {
  const view = step.rottingOrangesView || {};
  const vi = lang === "vi";
  const grid = Array.isArray(view.grid) ? view.grid : [];
  const frontier = Array.isArray(view.frontier) ? view.frontier : [];
  const nextFrontier = Array.isArray(view.nextFrontier) ? view.nextFrontier : [];
  const queue = Array.isArray(view.queue) ? view.queue : [];
  const newlyRotten = Array.isArray(view.newlyRotten) ? view.newlyRotten : [];
  const key = (row, col) => `${row},${col}`;
  const sourceKey = view.source ? key(view.source[0], view.source[1]) : "";
  const neighborKey = view.neighbor ? key(view.neighbor[0], view.neighbor[1]) : "";
  const frontierKeys = new Set(frontier.map((cell) => key(cell.row, cell.col)));
  const nextKeys = new Set(nextFrontier.map((cell) => key(cell.row, cell.col)));
  const queueKeys = new Set(queue.map((cell) => key(cell.row, cell.col)));
  const newKeys = new Set(newlyRotten.map(([row, col]) => key(row, col)));
  const phaseIndex = view.phase === "result" ? 2 : view.phase === "spread" ? 1 : 0;
  const phaseLabels = vi
    ? ["🔎 Quét", "🦠 Lan", "🏁 Kết quả"]
    : ["🔎 Scan", "🦠 Spread", "🏁 Result"];
  const phaseDescriptions = vi
    ? ["Quét cam và tìm nguồn", "Lan một lớp mỗi phút", "Kiểm tra cam tươi còn lại"]
    : ["Count oranges and find sources", "Spread one layer per minute", "Check remaining fresh oranges"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "is-done" : index === phaseIndex ? "is-active" : "";
    return `<span class="${state}" title="${escapeHtml(phaseDescriptions[index])}" aria-label="${escapeHtml(phaseDescriptions[index])}">${index < phaseIndex ? "✓" : ""}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  const cellsHtml = grid.flatMap((row) => row.map((cell) => {
    const cellKey = key(cell.row, cell.col);
    const classes = ["rotting-cell"];
    if (cell.value === 0) classes.push("is-empty");
    else if (cell.value === 1) classes.push("is-fresh");
    else classes.push("is-rotten");
    if (frontierKeys.has(cellKey)) classes.push("is-frontier");
    if (nextKeys.has(cellKey)) classes.push("is-next-frontier");
    if (cellKey === sourceKey) classes.push("is-source");
    if (cellKey === neighborKey) classes.push("is-neighbor");
    if (newKeys.has(cellKey)) classes.push("is-newly-rotten");
    let badge = "";
    if (cellKey === sourceKey) badge = "📡";
    else if (newKeys.has(cellKey)) badge = `+${cell.rottenMinute}`;
    else if (nextKeys.has(cellKey)) badge = "↗";
    else if (frontierKeys.has(cellKey)) badge = "●";
    const stateLabel = cell.value === 0
      ? (vi ? "TRỐNG" : "EMPTY")
      : cell.value === 1
        ? "FRESH"
        : `ROTTEN · t=${Math.max(0, cell.rottenMinute)}`;
    const orange = cell.value === 0
      ? `<span class="rotting-empty-mark">0</span>`
      : `<span class="rotting-orange"><i></i><b>${cell.value === 1 ? "1" : "2"}</b></span>`;
    return `<div class="${classes.join(" ")}" role="gridcell" aria-label="cell ${cell.row}, ${cell.col}: ${escapeHtml(stateLabel)}">
      <span class="rotting-cell-badge">${escapeHtml(badge)}</span>
      ${orange}
      <small>${cell.row},${cell.col}</small>
    </div>`;
  })).join("");

  const makeQueueLane = (items, kind) => items.length
    ? items.map((cell, index) => {
      const cellKey = key(cell.row, cell.col);
      const classes = ["rotting-queue-chip"];
      if (cellKey === sourceKey) classes.push("is-current");
      if (kind === "current" && !queueKeys.has(cellKey) && cellKey !== sourceKey) classes.push("is-processed");
      if (kind === "next") classes.push("is-next");
      return `<span class="${classes.join(" ")}"><small>${index + 1}</small><strong>(${cell.row},${cell.col})</strong><em>t=${Math.max(0, cell.rottenMinute)}</em></span>`;
    }).join(`<b>→</b>`)
    : `<em class="rotting-lane-empty">${vi ? "trống" : "empty"}</em>`;

  const timelineHtml = (view.timeline || []).map((entry) => `<span class="${entry.minute === view.minutes ? "is-current" : entry.minute === view.targetMinute ? "is-next" : ""}" aria-label="${vi ? `Phút ${entry.minute}: ${entry.cells.length} cam` : `Minute ${entry.minute}: ${entry.cells.length} oranges`}"><small>t=${entry.minute}</small><strong>🍊 ${entry.cells.length}</strong></span>`).join("");

  const directions = [
    { delta: [-1, 0], arrow: "↑", label: vi ? "Lên" : "Up", cls: "up" },
    { delta: [0, 1], arrow: "→", label: vi ? "Phải" : "Right", cls: "right" },
    { delta: [1, 0], arrow: "↓", label: vi ? "Xuống" : "Down", cls: "down" },
    { delta: [0, -1], arrow: "←", label: vi ? "Trái" : "Left", cls: "left" },
  ];
  const directionHtml = directions.map((direction) => {
    const active = view.direction && view.direction[0] === direction.delta[0] && view.direction[1] === direction.delta[1];
    return `<span class="rotting-direction ${direction.cls}${active ? " is-active" : ""}" aria-label="${direction.label}" title="${direction.label}"><strong>${direction.arrow}</strong></span>`;
  }).join("");

  let checkHtml;
  if (view.neighbor) {
    const inBounds = view.check ? view.check.inBounds : null;
    const isFresh = view.check ? view.check.isFresh : null;
    const sourceText = view.source ? `(${view.source.join(",")})` : "?";
    const directionText = view.direction ? `(${view.direction.join(",")})` : "?";
    const neighborText = `(${view.neighbor.join(",")})`;
    const accepted = inBounds === true && isFresh === true;
    checkHtml = `<div class="rotting-neighbor-check ${accepted ? "is-pass" : inBounds === false || isFresh === false ? "is-fail" : ""}">
      <div class="rotting-coordinate"><span title="${vi ? "Cam nguồn" : "Rotten source"}"><small>📡</small><strong>${escapeHtml(sourceText)}</strong></span><i>+</i><span title="${vi ? "Hướng" : "Direction"}"><small>➡</small><strong>${escapeHtml(directionText)}</strong></span><i>=</i><span title="${vi ? "Ô kế" : "Neighbor"}"><small>🍊</small><strong>${escapeHtml(neighborText)}</strong></span></div>
      <div class="rotting-checks"><span class="${inBounds === true ? "pass" : inBounds === false ? "fail" : "pending"}" aria-label="${vi ? "Trong grid" : "Inside grid"}"><b>${inBounds === true ? "✓" : inBounds === false ? "×" : "?"}</b><strong>${inBounds === null ? "?" : String(inBounds)}</strong></span><span class="${isFresh === true ? "pass" : isFresh === false ? "fail" : "pending"}" aria-label="${vi ? "Cam tươi" : "Fresh orange"}"><b>${isFresh === true ? "✓" : isFresh === false ? "×" : "?"}</b><strong>${isFresh === null ? "?" : String(isFresh)}</strong></span><em aria-label="${accepted ? (vi ? "Sẽ thối" : "Will rot") : inBounds === false || isFresh === false ? (vi ? "Bỏ qua" : "Skip") : (vi ? "Đang kiểm tra" : "Checking")}">${accepted ? "🦠" : inBounds === false || isFresh === false ? "↩" : "…"}</em></div>
    </div>`;
  } else {
    checkHtml = `<div class="rotting-rule" aria-label="${vi ? "Một phút cho mỗi lớp BFS" : "One minute per BFS level"}"><strong>⏱ 1 = 1 BFS level</strong><span>● NOW&nbsp;&nbsp; →&nbsp;&nbsp; ↗ NEXT</span></div>`;
  }

  const initialFresh = Number.isInteger(view.initialFresh) ? view.initialFresh : 0;
  const freshValue = Number.isInteger(view.fresh) ? view.fresh : "?";
  const rottedFresh = Number.isInteger(view.fresh) && initialFresh > 0 ? initialFresh - view.fresh : 0;
  const progress = initialFresh > 0 ? Math.max(0, Math.min(100, (rottedFresh / initialFresh) * 100)) : 0;
  const resultHtml = view.phase === "result" && view.answer !== undefined
    ? `<div class="rotting-result ${view.answer === -1 ? "is-impossible" : "is-success"}" aria-label="${view.answer === -1 ? (vi ? "Không thể làm thối hết cam" : "Not all oranges can rot") : (vi ? `Hoàn tất sau ${view.answer} phút` : `Complete in ${view.answer} minutes`)}"><small>↩</small><strong>${escapeHtml(view.answer)}</strong><span>🍊 ${escapeHtml(view.fresh)}</span></div>`
    : "";
  const summary = vi
    ? `Rotting Oranges trên grid ${view.rows} nhân ${view.cols}; phút ${view.minutes ?? "?"}; còn ${freshValue} cam tươi.`
    : `Rotting Oranges on a ${view.rows} by ${view.cols} grid; minute ${view.minutes ?? "?"}; ${freshValue} fresh remain.`;
  const codeLine = Array.isArray(step.codeLines) && Number.isInteger(step.codeLines[0])
    ? step.codeLines[0]
    : "—";

  $("treeView").innerHTML = `<section class="rotting-oranges-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rotting-debug-line"><small>${vi ? "DÒNG" : "LINE"}</small><strong>${escapeHtml(codeLine)}</strong></div>
    <div class="rotting-phases">${phasesHtml}</div>
    <div class="rotting-status">
      <span aria-label="${vi ? "Phút" : "Minutes"}"><small>⏱</small><strong>${view.minutes === null ? "—" : escapeHtml(view.minutes)}</strong></span>
      <span aria-label="${vi ? "Cam tươi còn lại" : "Fresh oranges remaining"}"><small>🍊</small><strong>${escapeHtml(freshValue)}</strong><i style="--rotting-progress:${progress}%"></i></span>
      <span aria-label="NOW"><small>●</small><strong>${frontier.length}</strong></span>
      <span aria-label="NEXT"><small>↗</small><strong>${nextFrontier.length}</strong></span>
    </div>
    <section class="rotting-grid-section"><header><strong>🍊 GRID</strong><span>⬜ 0&nbsp;&nbsp; 🟠 1&nbsp;&nbsp; 🟤 2</span></header><div class="rotting-grid" role="grid" style="--rotting-cols:${view.cols}">${cellsHtml}</div></section>
    <div class="rotting-workspace">
      <section class="rotting-queue-section"><header><strong>🧺 QUEUE</strong><span>${vi ? "từng lớp = từng phút" : "one layer = one minute"}</span></header><div class="rotting-lane current"><label>● t=${view.minutes ?? 0}</label><div>${makeQueueLane(frontier, "current")}</div></div><div class="rotting-lane next"><label>↗ t=${view.targetMinute ?? 1}</label><div>${makeQueueLane(nextFrontier, "next")}</div></div></section>
      <section class="rotting-directions-section"><header><strong>🧭</strong><span>${view.source ? `(${view.source.join(",")})` : "—"}</span></header><div class="rotting-directions">${directionHtml}</div></section>
    </div>
    ${checkHtml}
    <section class="rotting-timeline-section"><header><strong>⏱</strong></header><div class="rotting-timeline">${timelineHtml || `<em>${vi ? "Chưa có nguồn" : "No sources"}</em>`}</div></section>
    ${resultHtml}
    <div class="rotting-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
    <div class="rotting-legend"><span><i class="fresh"></i>fresh</span><span><i class="now"></i>frontier NOW</span><span><i class="next"></i>frontier NEXT</span><span><i class="source"></i>${vi ? "đang lan" : "spreading source"}</span><span><i class="empty"></i>${vi ? "ô trống" : "empty"}</span></div>
  </section>`;
}

function classroomGuideHtml(view) {
  if (!view) return "";
  const vi = lang === "vi";
  const phases = [
    ["map", vi ? "1. Đọc bản đồ" : "1. Read map"],
    ["state", vi ? "2. Hiểu state" : "2. Understand state"],
    ["bfs", vi ? "3. BFS từng bước" : "3. Run BFS"],
    ["result", vi ? "4. Đường ngắn nhất" : "4. Shortest path"],
  ];
  const phaseHtml = phases.map(([key, label]) => `<span class="${view.phase === key ? "active" : ""}">${label}</span>`).join("");
  const state = view.state;
  const batteryHtml = state && Number.isInteger(state.energy)
    ? `<div class="classroom-battery" aria-label="${vi ? "năng lượng" : "energy"} ${state.energy}/${view.maxEnergy}"><i style="--energy-level:${Math.max(0, Math.min(100, (state.energy / view.maxEnergy) * 100))}%"></i></div>`
    : `<strong>—</strong>`;
  const stateHtml = state
    ? `<div class="classroom-state-tuple">
        <span><small>${vi ? "VỊ TRÍ" : "POSITION"}</small><strong>(${state.position.join(",")})</strong></span>
        <span><small>${vi ? "PIN" : "ENERGY"}</small>${batteryHtml}<em>${state.energy ?? "—"}/${view.maxEnergy}</em></span>
        <span><small>MASK</small><strong>${state.mask ?? "—"}</strong></span>
        <span><small>${vi ? "SỐ BƯỚC" : "MOVES"}</small><strong>${state.moves ?? "—"}</strong></span>
      </div>`
    : `<div class="classroom-state-empty">${vi ? "Đang chuẩn bị state đầu tiên" : "Preparing the first state"}</div>`;
  const candidate = view.candidate;
  const candidateStatus = candidate ? candidate.status || "checking" : "idle";
  const candidateHtml = candidate
    ? `<div class="classroom-candidate ${candidateStatus}">
        <div><small>${vi ? "THỬ Ô" : "TRY CELL"}</small><strong>(${candidate.position.join(",")}) · ${escapeHtml(candidate.cell)}</strong></div>
        <div class="classroom-transition"><span>E: ${candidate.energyBefore}</span><b>→</b><span>${candidate.energyAfter}</span></div>
        <div class="classroom-transition"><span>mask: ${candidate.maskBefore}</span><b>→</b><span>${candidate.maskAfter}</span></div>
      </div>`
    : `<div class="classroom-candidate idle"><span>${vi ? "Chưa thử ô hàng xóm" : "No neighbor checked yet"}</span></div>`;
  const verdictLabels = {
    checking: vi ? "ĐANG KIỂM TRA" : "CHECKING",
    rejected: vi ? "BỎ NHÁNH" : "REJECT",
    dominated: vi ? "STATE YẾU HƠN" : "DOMINATED",
    accepted: vi ? "THÊM QUEUE" : "ENQUEUE",
    success: vi ? "HOÀN TẤT" : "COMPLETE",
  };
  const verdict = view.verdict || "checking";
  const reason = view.reason ? pick(view.reason) : (vi ? "BFS lấy state ở đầu queue và thử 4 hướng." : "BFS takes the front state and tries four directions.");
  const litterHtml = view.litters.length
    ? view.litters.map((item) => `<span class="${item.collected ? "done" : ""}"><i>${item.collected ? "✓" : ""}</i><strong>${item.id}</strong><small>@(${item.position.join(",")})</small></span>`).join("")
    : `<em>${vi ? "Không có rác" : "No litter"}</em>`;
  const queueHtml = view.queue.length
    ? view.queue.map((item, index) => `<span><b>${index === 0 ? "FRONT" : `+${index}`}</b><strong>(${item.position.join(",")})</strong><small>E=${item.energy} · mask=${item.mask} · d=${item.moves}</small></span>`).join("")
    : `<em>${vi ? "queue đang rỗng" : "queue is empty"}</em>`;
  const routeHtml = view.route && view.route.length
    ? `<section class="classroom-route"><header><strong>${vi ? "ĐƯỜNG ĐI NGẮN NHẤT" : "SHORTEST PATH"}</strong><span>${view.route.length - 1} ${vi ? "bước" : "moves"}</span></header><div>${view.route.map((pos, index) => `<span><small>${index}</small><strong>(${pos.join(",")})</strong></span>`).join("<b>→</b>")}</div></section>`
    : "";

  return `<section class="classroom-guide">
    <div class="classroom-phases">${phaseHtml}</div>
    <div class="classroom-rule"><strong>state = (row, col, energy, mask)</strong><span>${vi ? "Cùng vị trí + mask, chỉ giữ state có pin nhiều nhất." : "For the same position + mask, keep only the state with the most energy."}</span></div>
    <div class="classroom-guide-main">
      <section><header><strong>${vi ? "STATE ĐANG XỬ LÝ" : "CURRENT STATE"}</strong><span>${vi ? "lấy từ đầu queue" : "taken from queue front"}</span></header>${stateHtml}</section>
      <section><header><strong>${vi ? "MỘT BƯỚC DI CHUYỂN" : "ONE MOVE"}</strong><span>${vi ? "tốn 1 pin trước, rồi mới áp dụng L/R" : "spend 1 energy, then apply L/R"}</span></header>${candidateHtml}</section>
    </div>
    <div class="classroom-decision ${verdict}"><strong>${verdictLabels[verdict] || verdictLabels.checking}</strong><span>${escapeHtml(reason)}</span></div>
    <section class="classroom-litter"><header><strong>${vi ? "RÁC CẦN NHẶT" : "LITTER CHECKLIST"}</strong><span>target mask = ${view.targetMask}</span></header><div>${litterHtml}</div></section>
    <section class="classroom-queue"><header><strong>QUEUE</strong><span>${view.queueRemaining} ${vi ? "state đang chờ" : "states waiting"}</span></header><div>${queueHtml}</div></section>
    ${routeHtml}
  </section>`;
}

function renderBfsGrid(step) {
  const { cells, rows, cols, variant } = step.bfsGrid;
  const el = $("bfsGridView");
  el.style.textAlign = "center";
  if (step.disconnect1568View) {
    el.classList.remove("distinct-islands-host", "sr130-host");
    const view = step.disconnect1568View;
    const vi = lang === "vi";
    const phaseHtml = [
      { icon: "🏝", label: vi ? "Đếm các mảng đất" : "Count land groups", active: view.phase === "count", done: view.phase !== "count" },
      { icon: "✂", label: vi ? "Gỡ thử một ô đất" : "Try removing one land cell", active: view.phase === "pick" || view.phase === "trial", done: view.phase === "result" },
      { icon: "⌁", label: vi ? "Kiểm tra đảo đã tách" : "Check whether the island splits", active: view.phase === "result", done: view.phase === "result" },
    ].map((phase) => `<span class="${phase.active ? "is-active" : ""} ${phase.done ? "is-done" : ""}" title="${escapeXml(phase.label)}" aria-label="${escapeXml(phase.label)}"><b aria-hidden="true">${phase.icon}</b></span>`).join("");
    const cellsHtml = view.cells.map((row, r) => row.map((cell, c) => {
      const kind = cell.kind || "water";
      const name = {
        water: vi ? "nước" : "water",
        land: vi ? "đất" : "land",
        fragment: vi ? `mảnh đảo ${cell.component}` : `island fragment ${cell.component}`,
        removed: vi ? "ô đất đang gỡ" : "land cell being removed",
      }[kind];
      const classes = ["ci1568-cell", `is-${kind}`];
      if (cell.component) classes.push(`component-${Math.min(cell.component, 3)}`);
      if (cell.isVisited) classes.push("is-seen");
      if (cell.isCurrent) classes.push("is-current");
      return `<div class="${classes.join(" ")}" aria-label="${escapeXml(`${name}, ${r},${c}`)}" title="${escapeXml(`${name} (${r}, ${c})`)}">
        <i class="ci1568-mark" aria-hidden="true"></i>
        ${cell.isCurrent ? `<b class="ci1568-current" aria-hidden="true">✦</b>` : ""}
      </div>`;
    }).join("")).join("");
    const visibleComponents = Array.from({ length: Math.min(view.componentCount, 3) }, (_, index) => `<i class="component-${index + 1}"></i>`).join("");
    const answerIcon = view.answer === 0 ? "⌀" : view.answer === 1 ? "✂" : "✂✂";
    const answerLabel = view.answer === null
      ? (vi ? `${view.componentCount} mảnh đất` : `${view.componentCount} land group${view.componentCount === 1 ? "" : "s"}`)
      : (vi ? `${view.answer} ngày` : `${view.answer} day${view.answer === 1 ? "" : "s"}`);
    el.innerHTML = `<section class="ci1568-viz is-${view.phase}${view.isDisconnected ? " is-split" : ""}" role="img" aria-label="${vi ? "Bản đồ đảo: thử gỡ từng ô để tìm điểm làm đảo tách rời" : "Island map: remove one cell at a time to find a split point"}">
      <div class="ci1568-phases">${phaseHtml}</div>
      <div class="ci1568-board-scroll"><div class="ci1568-scene"><div class="ci1568-ripples" aria-hidden="true"><i></i><i></i><i></i></div><div class="ci1568-board" style="--ci1568-cols:${view.cols}">${cellsHtml}</div></div></div>
      <div class="ci1568-footer">
        <div class="ci1568-components" title="${vi ? "Các mảnh đất hiện có" : "Current land groups"}" aria-label="${vi ? `${view.componentCount} mảnh đất` : `${view.componentCount} land groups`}">${visibleComponents}</div>
        <div class="ci1568-answer" title="${escapeXml(answerLabel)}" aria-label="${escapeXml(answerLabel)}" aria-live="polite"><span aria-hidden="true">${answerIcon}</span>${view.answer !== null ? `<strong>${view.answer}</strong>` : ""}</div>
      </div>
    </section>`;
    return;
  }
  if (step.closedIsland1254View) {
    el.classList.remove("distinct-islands-host", "sr130-host");
    const view = step.closedIsland1254View;
    const vi = lang === "vi";
    const countPhase = view.phase === "count";
    const phaseHtml = [
      { icon: "🌊", label: vi ? "Nước tràn từ biên" : "Flood from the edge", active: !countPhase, done: countPhase },
      { icon: "⌕", label: vi ? "Tìm đất còn lại" : "Find remaining land", active: countPhase && !view.done, done: view.done },
      { icon: "🏝", label: vi ? "Đảo kín đã đếm" : "Closed islands counted", active: view.done, done: view.done },
    ].map((phase) => `<span class="${phase.active ? "is-active" : ""} ${phase.done ? "is-done" : ""}" title="${escapeXml(phase.label)}" aria-label="${escapeXml(phase.label)}"><b aria-hidden="true">${phase.icon}</b></span>`).join("");
    const cellsHtml = cells.map((row, r) => row.map((cell, c) => {
      const kind = cell.kind || "water";
      const name = {
        water: vi ? "nước" : "water",
        flooded: vi ? "đất nối bờ đã ngập" : "flooded edge land",
        land: vi ? "đất chưa thăm" : "unvisited land",
        island: vi ? `đảo kín ${cell.meta || ""}` : `closed island ${cell.meta || ""}`,
      }[kind];
      const classes = ["ci1254-cell", `is-${kind}`];
      if (cell.isBorder) classes.push("is-edge");
      if (cell.isCurrent) classes.push("is-current");
      return `<div class="${classes.join(" ")}" aria-label="${escapeXml(`${name}, ${r},${c}`)}" title="${escapeXml(`${name} (${r}, ${c})`)}">
        <i class="ci1254-mark" aria-hidden="true"></i>
        ${cell.meta ? `<small>${escapeXml(cell.meta.replace("#", ""))}</small>` : ""}
        ${cell.isCurrent ? `<b class="ci1254-current-tag" aria-hidden="true">✦</b>` : ""}
      </div>`;
    }).join("")).join("");
    const sceneState = view.done ? "is-finished" : countPhase ? "is-counting" : "is-flooding";
    const approachNames = [
      vi ? "DFS đệ quy từ biên" : "Recursive DFS from border",
      vi ? "BFS từ biên" : "BFS from border",
      vi ? "DFS + visited" : "DFS + visited",
      vi ? "BFS + visited" : "BFS + visited",
      "Union-Find + ocean",
    ];
    const worklistHtml = view.approach === 5
      ? `<div class="ci1254-state"><small>parent · ${view.parent?.length ?? 0}</small><span>${(view.parent || []).slice(0, 18).map(([id, parent]) => `${Math.floor(id / cols)},${id % cols}→${Math.floor(parent / cols)},${parent % cols}`).join(" · ") || "∅"}</span></div>`
      : view.approach === 3 || view.approach === 4
        ? `<div class="ci1254-state"><small>${view.approach === 3 ? "DFS stack" : "BFS queue"} · ${view.worklist?.length ?? 0}</small><span>${(view.worklist || []).slice(0, 10).map(([r, c]) => `(${r},${c})`).join(" · ") || "∅"}${(view.worklist?.length ?? 0) > 10 ? " · …" : ""}</span><small>visited · ${view.visited?.flat().filter(Boolean).length ?? 0}</small></div>`
        : view.approach === 2
          ? `<div class="ci1254-state"><small>BFS queue · ${view.worklist?.length ?? 0}</small><span>${(view.worklist || []).slice(0, 10).map(([r, c]) => `(${r},${c})`).join(" · ") || "∅"}${(view.worklist?.length ?? 0) > 10 ? " · …" : ""}</span></div>`
          : "";
    el.innerHTML = `<section class="ci1254-viz ${sceneState}" role="img" aria-label="${vi ? "Bản đồ nước và đất: đất nối ra biên bị nhấn chìm, đảo nằm trong được đếm" : "Land connected to the border is flooded; islands left inside are counted"}">
      <div class="ci1254-phases">${phaseHtml}</div>${view.approach ? `<small class="ci1254-approach">${escapeXml(approachNames[view.approach - 1])}</small>` : ""}
      <div class="ci1254-board-scroll"><div class="ci1254-scene"><div class="ci1254-tide" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="ci1254-board" style="--ci-cols:${cols}">${cellsHtml}</div></div></div>
      ${worklistHtml}
      <div class="ci1254-footer">
        <div class="ci1254-legend" aria-label="${vi ? "Chú giải" : "Legend"}">
          <span class="is-water" title="${vi ? "nước" : "water"}" aria-label="${vi ? "nước" : "water"}"><i></i></span>
          <span class="is-land" title="${vi ? "đất chưa thăm" : "unvisited land"}" aria-label="${vi ? "đất chưa thăm" : "unvisited land"}"><i></i></span>
          <span class="is-flooded" title="${vi ? "đất nối biên đã ngập" : "flooded edge land"}" aria-label="${vi ? "đất nối biên đã ngập" : "flooded edge land"}"><i></i></span>
          <span class="is-island" title="${vi ? "đảo kín đã tìm" : "closed island found"}" aria-label="${vi ? "đảo kín đã tìm" : "closed island found"}"><i></i></span>
        </div>
        <div class="ci1254-count" title="${vi ? "Số đảo kín" : "Closed islands"}" aria-label="${vi ? `Số đảo kín: ${view.count}` : `Closed islands: ${view.count}`}" aria-live="polite"><span aria-hidden="true">🏝</span><strong>${view.count}</strong></div>
      </div>
    </section>`;
    return;
  }
  const isTicTacToe = variant === "tic-tac-toe";
  const isPhonePath = variant === "phone-path";
  const isEffortGrid = variant === "effort-grid";
  const isDistinctIslands = variant === "distinct-islands";
  const isSurroundedRegions = variant === "surrounded-regions";
  el.classList.toggle("distinct-islands-host", isDistinctIslands);
  el.classList.toggle("sr130-host", isSurroundedRegions);
  const isMaxScoreGrid = variant === "max-score-grid";
  const isClassroomGrid = variant === "classroom-grid";
  const variantClass = isTicTacToe
    ? " tic-tac-toe-grid"
    : isPhonePath
      ? " phone-path-grid"
      : isEffortGrid
        ? " effort-grid"
        : isDistinctIslands
          ? " distinct-islands-grid"
          : isSurroundedRegions
            ? " sr130-grid"
            : isMaxScoreGrid
              ? " max-score-grid"
              : isClassroomGrid
                ? " classroom-grid"
                : "";
  const gridClass = `bfs-grid${variantClass}${isEffortGrid && step.effortView ? " minimax-effort-grid" : ""}`;
  const gridStyle = isTicTacToe
    ? ""
    : isDistinctIslands || isSurroundedRegions
      ? ` style="grid-template-columns:repeat(${cols},minmax(0,1fr));max-width:${cols * 60 + 20}px;width:100%"`
      : ` style="grid-template-columns:repeat(${cols},${isPhonePath ? "68px" : isEffortGrid ? (step.effortView ? "78px" : "64px") : isMaxScoreGrid ? "74px" : isClassroomGrid ? "58px" : "32px"})"`;
  let html = `<div class="${gridClass}"${gridStyle}>`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const cls = cell.cls || "empty";
      const label = cell.label || "";
      const meta = cell.meta || "";
      const topTag = isEffortGrid ? `<span class="bfs-cell-label-tag">${step.effortView ? "HEIGHT" : "ARR"}</span>` : "";
      const coordTag = step.effortView && cell.coord ? `<span class="bfs-cell-coord">${escapeXml(cell.coord)}</span>` : "";
      const endpointTag = step.effortView && cell.endpoint ? `<span class="bfs-cell-endpoint">${escapeXml(cell.endpoint)}</span>` : "";
      const ariaLabel = step.effortView ? ` aria-label="cell ${escapeXml(cell.coord || `${r},${c}`)}, height ${escapeXml(label)}, ${escapeXml(meta)}"` : "";
      html += `<div class="bfs-cell ${cls}"${ariaLabel}>${topTag}${coordTag}${endpointTag}<span class="bfs-cell-value">${escapeXml(label)}</span>${meta ? `<span class="bfs-cell-meta">${escapeXml(meta)}</span>` : ""}</div>`;
    }
  }
  html += "</div>";
  if (isEffortGrid) {
    const hasParity = !!step.bfsGrid.parity;
    html += step.effortView
      ? `<div class="effort-grid-legend minimax">
          <span><strong class="eg-legend-big">8</strong>${lang === "vi" ? "height của ô" : "cell height"}</span>
          <span><strong class="eg-legend-small">best:2</strong>${lang === "vi" ? "effort tốt nhất tới ô" : "best effort to cell"}</span>
          <span><i class="eg-swatch eg-current"></i>${lang === "vi" ? "current" : "current"}</span>
          <span><i class="eg-swatch eg-neighbor"></i>${lang === "vi" ? "hàng xóm" : "neighbor"}</span>
          <span><i class="eg-swatch eg-path"></i>${lang === "vi" ? "đường cuối" : "final path"}</span>
        </div>`
      : `<div class="effort-grid-legend">
          <span><strong class="eg-legend-big">99</strong> ${lang === "vi" ? "= thời điểm ĐẾN sớm nhất (cập nhật)" : "= earliest ARRIVAL time (updates)"}</span>
          <span><strong class="eg-legend-small">⏱99</strong> ${lang === "vi" ? "= thời điểm phòng sẵn sàng (cố định)" : "= room ready time (fixed)"}</span>
          ${hasParity ? `<span><i class="eg-swatch eg-swatch-even"></i>${lang === "vi" ? "bước tới tốn 1s" : "step costs 1s"}</span><span><i class="eg-swatch eg-swatch-odd"></i>${lang === "vi" ? "bước tới tốn 2s" : "step costs 2s"}</span>` : ""}
        </div>`;
  }
  if (isClassroomGrid) {
    html += `<div class="classroom-grid-legend">
      <span><i class="start"></i>S</span>
      <span><i class="litter"></i>L</span>
      <span><i class="reset"></i>R</span>
      <span><i class="wall"></i>X</span>
      <span><i class="queued"></i>${lang === "vi" ? "frontier" : "frontier"}</span>
      <span><i class="current"></i>${lang === "vi" ? "đang pop" : "current"}</span>
      <span><i class="path"></i>${lang === "vi" ? "vừa thêm" : "new state"}</span>
    </div>`;
  }
  const guideHtml = step.distinctIslandView ? distinctIslandGuideHtml(step.distinctIslandView) : "";
  const surroundedGuide = step.surroundedRegionsView ? surroundedRegionsGuideHtml(step.surroundedRegionsView) : "";
  const effortGuide = step.effortView ? effortGuideHtml(step.effortView) : "";
  const classroomGuide = step.classroomView ? classroomGuideHtml(step.classroomView) : "";
  el.innerHTML = isDistinctIslands || isSurroundedRegions
    ? html + guideHtml + surroundedGuide
    : guideHtml + effortGuide + classroomGuide + html;
}

// ---- Shift 2D Grid renderer ----
function renderShiftGridView(step) {
  const view = step.shiftGridView;
  const source = view.source || [];
  const result = view.result || [];
  const currentKey = view.current ? `${view.current[0]},${view.current[1]}` : "";
  const targetKey = view.target ? `${view.target[0]},${view.target[1]}` : "";
  const placedSet = new Set((view.placed || []).map(([r, c]) => `${r},${c}`));
  const hasGrid = source.length > 0 && source[0] && source[0].length > 0;
  const cols = hasGrid ? source[0].length : 0;

  const matrixHtml = (matrix, kind) => {
    if (!matrix.length) return `<div class="shift-empty">${lang === "vi" ? "Không có dữ liệu" : "No data"}</div>`;
    let cells = "";
    matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        const key = `${r},${c}`;
        const classes = ["shift-cell"];
        if (kind === "source" && key === currentKey) classes.push("source-active");
        if (kind === "source" && view.sourceRow === r && !currentKey) classes.push("row-active");
        if (kind === "result" && view.resultRow === r && !targetKey) classes.push("row-active");
        if (kind === "result" && placedSet.has(key)) classes.push("placed");
        if (kind === "result" && key === targetKey) classes.push("target-active");
        const display = value === null || value === undefined ? "·" : value;
        cells += `<div class="${classes.join(" ")}" aria-label="${kind} row ${r} column ${c}, value ${escapeHtml(display)}">
          <span class="shift-coord">(${r},${c})</span>
          <strong>${escapeHtml(display)}</strong>
        </div>`;
      });
    });
    return `<div class="shift-matrix" style="--shift-cols:${cols}">${cells}</div>`;
  };

  const hasArrayLanes = Array.isArray(view.oneArr) && Array.isArray(view.newArr);
  let track = "";
  if (hasGrid && !hasArrayLanes) {
    const flat = source.flat();
    track = `<div class="shift-track" aria-label="Flattened grid">${flat.map((value, index) => {
      const classes = ["shift-track-cell"];
      if (index === view.oldPos) classes.push("old-index");
      if (index === view.newPos) classes.push("new-index");
      return `<div class="${classes.join(" ")}"><span>${index}</span><strong>${escapeHtml(value)}</strong></div>`;
    }).join("")}</div>`;
  }

  let arrayLanes = "";
  if (hasGrid && hasArrayLanes) {
    const size = source.flat().length;
    const laneHtml = (label, values, activeIndex, activeClass) => {
      const cells = Array.from({ length: size }, (_, index) => {
        const value = values[index];
        const classes = ["shift-array-cell"];
        if (value !== null && value !== undefined) classes.push("filled");
        if (index === activeIndex) classes.push(activeClass);
        return `<div class="${classes.join(" ")}"><span>${index}</span><strong>${escapeHtml(value === null || value === undefined ? "·" : value)}</strong></div>`;
      }).join("");
      return `<div class="shift-array-lane"><strong class="shift-array-name">${label}</strong><div class="shift-array-values">${cells}</div></div>`;
    };
    arrayLanes = `<div class="shift-array-lanes">
      ${laneHtml("one_arr", view.oneArr, view.activeOneIndex, "source-index")}
      ${laneHtml("new_arr", view.newArr, view.activeNewIndex, "target-index")}
    </div>`;
  }

  const formula = view.oldPos === undefined
    ? `<span>k = <strong>${escapeHtml(view.k)}</strong></span><span>k % cells = <strong>${escapeHtml(view.normalizedK)}</strong></span>`
    : hasArrayLanes
      ? `<span>i = <strong>${view.oldPos}</strong></span><span>+ k = <strong>${escapeHtml(view.k)}</strong></span>${view.newPos === undefined ? "" : `<span>new_index = <strong>${view.newPos}</strong></span>`}`
      : `<span>old_pos = <strong>${view.oldPos}</strong></span><span>+ k = <strong>${escapeHtml(view.k)}</strong></span>${view.newPos === undefined ? "" : `<span>new_pos = <strong>${view.newPos}</strong></span>`}`;

  const sourceLabel = pick(view.sourceLabel) || (lang === "vi" ? "Grid nguồn" : "Source grid");
  const resultLabel = pick(view.resultLabel) || (lang === "vi" ? "Grid kết quả" : "Result grid");

  $("treeView").innerHTML = `<div class="shift-grid-viz">
    <div class="shift-phase">${escapeHtml(pick(view.phase) || "")}</div>
    <div class="shift-formula">${formula}</div>
    <div class="shift-matrices">
      <section class="shift-matrix-block">
        <h4>${escapeHtml(sourceLabel)}</h4>
        ${matrixHtml(source, "source")}
      </section>
      <div class="shift-arrow" aria-hidden="true">→</div>
      <section class="shift-matrix-block">
        <h4>${escapeHtml(resultLabel)}</h4>
        ${matrixHtml(result, "result")}
      </section>
    </div>
    ${arrayLanes}
    ${track}
    <div class="shift-legend">
      <span><i class="source-swatch"></i>${lang === "vi" ? "ô nguồn" : "source"}</span>
      <span><i class="target-swatch"></i>${lang === "vi" ? "ô đích" : "target"}</span>
      <span><i class="placed-swatch"></i>${lang === "vi" ? "đã đặt" : "placed"}</span>
    </div>
  </div>`;
}

// ---- Grid renderer (2D DP) ----
function renderGrid(step) {
  const { dp, text1, text2, hlCell, autoScrollCell, pathCells, historyCells, cellLabels, showIndices, rowLabels, colLabels, largeCells, bestCell, bestCells, caption, secondaryCaption, mutedCells, hideInitialColumn } = step.grid;
  const pathSet = new Set((pathCells || []).map(([r, c]) => `${r},${c}`));
  const historySet = new Set((historyCells || []).map(([r, c]) => `${r},${c}`));
  const mutedSet = new Set((mutedCells || []).map(([r, c]) => `${r},${c}`));
  const bestSet = new Set((bestCells || []).map(([r, c]) => `${r},${c}`));
  if (bestCell) bestSet.add(`${bestCell[0]},${bestCell[1]}`);
  const labels = cellLabels || {};
  const m = dp.length - 1;
  const n = dp[0].length - 1;
  const axisLabelHtml = (label) => {
    if (!label) return "";
    if (typeof label === "object") {
      return `<span class="axis-index">${escapeXml(pick(label.index) || "")}</span><span class="axis-char">${escapeXml(pick(label.char) || "")}</span>`;
    }
    return escapeXml(String(label));
  };

  const hasCellLabels = Object.keys(labels).length > 0 || largeCells;
  let html = `<table class="dp-grid${hasCellLabels ? " has-cell-labels" : ""}"><thead><tr><th></th>${hideInitialColumn ? "" : "<th></th>"}`;
  for (let j = 0; j < n; j++) {
    const colLabel = colLabels && colLabels[j]
      ? axisLabelHtml(colLabels[j])
      : showIndices
      ? `<span class="axis-index">j=${j + 1}</span><span class="axis-char">${escapeXml(text2[j])}</span>`
      : escapeXml(text2[j]);
    html += `<th>${colLabel}</th>`;
  }
  html += "</tr></thead><tbody>";

  for (let i = 0; i <= m; i++) {
    html += "<tr>";
    const rowLabel = i === 0
      ? ""
      : rowLabels && rowLabels[i - 1]
        ? axisLabelHtml(rowLabels[i - 1])
        : showIndices
        ? `<span class="axis-index">i=${i}</span><span class="axis-char">${escapeXml(text1[i - 1])}</span>`
        : escapeXml(text1[i - 1]);
    html += `<td class="row-label">${rowLabel}</td>`;
    for (let j = hideInitialColumn ? 1 : 0; j <= n; j++) {
      let cls = "dp-cell";
      if (hlCell && hlCell[0] === i && hlCell[1] === j) cls += " hl";
      if (historySet.has(`${i},${j}`)) cls += " history";
      if (pathSet.has(`${i},${j}`)) cls += " path";
      if (bestSet.has(`${i},${j}`)) cls += " best";
      if (mutedSet.has(`${i},${j}`)) cls += " muted";
      const key = `${i},${j}`;
      const fullLabel = pick(labels[key]) || "";
      const label = fullLabel
        ? `<span class="cell-label" title="${escapeXml(fullLabel)}">${escapeXml(fullLabel)}</span>`
        : "";
      html += `<td class="${cls}" data-grid-row="${i}" data-grid-col="${j}">${label}<span class="cell-value">${dp[i][j]}</span></td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  const captionText = pick(caption);
  const secondaryCaptionText = pick(secondaryCaption);
  const captionHtml = captionText ? `<div class="dp-grid-caption">${escapeXml(captionText)}</div>` : "";
  const secondaryCaptionHtml = secondaryCaptionText
    ? `<div class="dp-grid-caption-secondary">${escapeXml(secondaryCaptionText)}</div>`
    : "";
  const gridView = $("gridView");
  gridView.innerHTML = captionHtml + secondaryCaptionHtml + html;

  if (Array.isArray(autoScrollCell)) {
    const [scrollRow, scrollCol] = autoScrollCell;
    const target = gridView.querySelector(
      `.dp-cell[data-grid-row="${scrollRow}"][data-grid-col="${scrollCol}"]`,
    );
    if (target) {
      if (gridView._autoScrollFrame) cancelAnimationFrame(gridView._autoScrollFrame);
      gridView._autoScrollFrame = requestAnimationFrame(() => {
        gridView._autoScrollFrame = null;
        const viewport = gridView.getBoundingClientRect();
        const cell = target.getBoundingClientRect();
        const padding = 20;
        let delta = 0;
        if (cell.right > viewport.right - padding) {
          delta = cell.right - viewport.right + padding;
        } else if (cell.left < viewport.left + padding) {
          delta = cell.left - viewport.left - padding;
        }
        if (delta !== 0) {
          const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          gridView.scrollTo({
            left: Math.max(0, gridView.scrollLeft + delta),
            behavior: reduceMotion ? "auto" : "smooth",
          });
        }
      });
    }
  }
}

// ---- Tree renderer (Trie) ----
function escapeXml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function distanceKGuideHtml(view) {
  const vi = lang === "vi";
  const phaseOrder = { parent: 0, bfs: 1, collect: 2, done: 3 };
  const activePhase = phaseOrder[view.phase] ?? 0;
  const phases = [
    { vi: "Nối node với cha", en: "Build parent links" },
    { vi: "BFS từ target", en: "BFS from target" },
    { vi: `Lấy lớp d = ${view.k}`, en: `Collect layer d = ${view.k}` },
  ];
  const phaseHtml = phases.map((item, index) => {
    const state = activePhase > index ? "is-done" : activePhase === index ? "is-active" : "";
    const marker = activePhase > index ? "✓" : String(index + 1);
    return `<div class="distance-k-phase ${state}"><span>${marker}</span>${escapeHtml(vi ? item.vi : item.en)}</div>`;
  }).join("");

  const relationNames = {
    left: vi ? "con trái" : "left child",
    right: vi ? "con phải" : "right child",
    parent: vi ? "cha" : "parent",
  };
  let actionText;
  if (view.phase === "parent") {
    actionText = vi
      ? `Đang tạo đường đi ngược con → cha. Đã ghi ${view.parentCount} liên kết.`
      : `Building reverse child → parent links. ${view.parentCount} links recorded.`;
  } else if (view.phase === "collect" && view.distance !== null && view.distance !== undefined) {
    const layerValues = (view.queue || []).map((item) => item.value).join(", ");
    actionText = vi
      ? `distance=${view.distance}=k nên toàn bộ queue [${layerValues}] là lớp cần lấy.`
      : `distance=${view.distance}=k, so the entire queue [${layerValues}] is the requested layer.`;
  } else if (view.phase === "done") {
    actionText = vi
      ? `Hoàn tất: các node ở đúng lớp d=${view.k} là [${view.result.join(", ")}].`
      : `Done: nodes on layer d=${view.k} are [${view.result.join(", ")}].`;
  } else if (view.inspecting) {
    const relation = relationNames[view.inspecting.relation] || view.inspecting.relation;
    if (view.inspecting.reason === "none") {
      actionText = vi
        ? `Từ node ${view.current.value}, hướng ${relation} là None → bỏ qua.`
        : `From node ${view.current.value}, ${relation} is None → skip.`;
    } else if (view.inspecting.eligible) {
      actionText = vi
        ? `${view.current.value} → ${relation} ${view.inspecting.value}: chưa visited → đưa vào queue với d=${view.current.distance + 1}.`
        : `${view.current.value} → ${relation} ${view.inspecting.value}: not visited → enqueue with d=${view.current.distance + 1}.`;
    } else {
      actionText = vi
        ? `${view.current.value} → ${relation} ${view.inspecting.value}: đã có trong visited → bỏ qua để tránh quay vòng.`
        : `${view.current.value} → ${relation} ${view.inspecting.value}: already in visited → skip to prevent a cycle.`;
    }
  } else if (view.current) {
    actionText = view.current.distance === view.k
      ? (vi
          ? `Node ${view.current.value} có d=${view.current.distance}=k → thêm vào result và không mở rộng xa hơn.`
          : `Node ${view.current.value} has d=${view.current.distance}=k → add it to result and do not expand farther.`)
      : (vi
          ? `Đang xử lý node ${view.current.value} tại d=${view.current.distance}; kiểm tra lần lượt left, right, parent.`
          : `Processing node ${view.current.value} at d=${view.current.distance}; inspect left, right, then parent.`);
  } else {
    actionText = vi
      ? `Target ${view.target} bắt đầu ở d=0. Queue luôn lấy node có khoảng cách nhỏ nhất trước.`
      : `Target ${view.target} starts at d=0. The queue always processes the smallest distance first.`;
  }

  const layerMap = new Map((view.layers || []).map((layer) => [Number(layer.distance), layer.nodes || []]));
  if (!layerMap.has(Number(view.k))) layerMap.set(Number(view.k), []);
  const layerHtml = [...layerMap.entries()].sort(([a], [b]) => a - b).map(([distance, nodes]) => {
    const isGoal = distance === Number(view.k);
    const nodesHtml = nodes.length
      ? nodes.map((node) => {
          const stateClass = node.isAnswer
            ? "is-answer"
            : node.isCurrent
              ? "is-current"
              : node.isQueued
                ? "is-queued"
                : node.isTarget
                  ? "is-target"
                  : "is-visited";
          const stateLabel = node.isAnswer
            ? (vi ? "đáp án" : "answer")
            : node.isCurrent
              ? (vi ? "đang xử lý" : "current")
              : node.isQueued
                ? "queue"
                : node.isTarget
                  ? "target"
                  : "visited";
          return `<span class="distance-k-node ${stateClass}"><b>${escapeHtml(node.value)}</b><small>${stateLabel}</small></span>`;
        }).join("")
      : `<span class="distance-k-empty">${vi ? "chưa tới lớp này" : "layer not reached yet"}</span>`;
    return `<div class="distance-k-layer${isGoal ? " is-goal" : ""}">
      <div class="distance-k-layer-label"><strong>d=${distance}</strong>${isGoal ? `<small>${vi ? "CẦN LẤY" : "COLLECT"}</small>` : ""}</div>
      <div class="distance-k-layer-nodes">${nodesHtml}</div>
    </div>`;
  }).join("");

  const summary = vi
    ? `Mô phỏng BFS từ target ${view.target}; lớp khoảng cách cần tìm là ${view.k}.`
    : `BFS simulation from target ${view.target}; requested distance layer is ${view.k}.`;
  return `<section class="distance-k-guide" aria-label="${escapeHtml(summary)}">
    <div class="distance-k-phases">${phaseHtml}</div>
    <div class="distance-k-rule"><strong>${vi ? "Quy tắc:" : "Rule:"}</strong> ${vi ? "mỗi cạnh đi qua làm distance tăng 1; visited ngăn quay lại node cũ." : "each traversed edge adds 1 to distance; visited prevents returning to an old node."}</div>
    <div class="distance-k-action">${escapeHtml(actionText)}</div>
    <div class="distance-k-layers">${layerHtml}</div>
    <div class="distance-k-legend">
      <span><i class="target"></i>target</span>
      <span><i class="current"></i>${vi ? "đang xử lý" : "current"}</span>
      <span><i class="queued"></i>queue</span>
      <span><i class="visited"></i>visited</span>
      <span><i class="answer"></i>${vi ? "đáp án" : "answer"}</span>
    </div>
  </section>`;
}

function rightSideBfsGuideHtml(view) {
  const vi = lang === "vi";
  const phaseGroup = {
    initialize: 0,
    "enqueue-root": 0,
    "while-queue": 1,
    "lock-level": 1,
    "level-index": 2,
    dequeue: 2,
    "check-left": 2,
    "enqueue-left": 2,
    "check-right": 2,
    "enqueue-right": 2,
    "check-rightmost": 3,
    "save-rightmost": 3,
    "done-levels": 3,
    done: 3,
  };
  const activePhase = phaseGroup[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1. Enqueue root", "2. Chốt size của tầng", "3. Popleft và enqueue con", "4. Lưu node cuối tầng"]
    : ["1. Enqueue root", "2. Lock the level size", "3. Popleft and enqueue children", "4. Save the level's last node"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < activePhase;
    const state = done ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${done ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+\.\s*/, ""))}</b></span>`;
  }).join("");

  const selectedIds = new Set(view.selectedIds || []);
  const currentLevelHtml = (view.currentLevel || []).length
    ? view.currentLevel.map((node, index) => {
      const isCurrent = view.current && node.id === view.current.id;
      const isNext = !view.current && index === view.index;
      const classes = [
        "rsv-level-node",
        index < view.processedCount ? "is-processed" : "is-pending",
        isCurrent ? "is-current" : "",
        isNext ? "is-next" : "",
        index === view.rightmostIndex ? "is-rightmost" : "",
        selectedIds.has(node.id) ? "is-saved" : "",
      ].filter(Boolean).join(" ");
      const stateLabel = isCurrent
        ? "CURRENT"
        : isNext
          ? (vi ? "KẾ TIẾP" : "NEXT")
          : index < view.processedCount
            ? (vi ? "ĐÃ XỬ LÝ" : "PROCESSED")
            : (vi ? "ĐANG CHỜ" : "WAITING");
      return `<span class="${classes}"><small>i=${index}${index === view.rightmostIndex ? " · RIGHTMOST" : ""}</small><strong>${escapeHtml(node.val)}</strong><em>${stateLabel}</em></span>`;
    }).join("")
    : `<em class="rsv-empty">${vi ? "chưa chốt tầng" : "level not locked yet"}</em>`;

  const nextLevelHtml = (view.nextLevel || []).length
    ? view.nextLevel.map((node, index) => `<span class="rsv-next-node"><small>${index === 0 ? "FRONT" : index === view.nextLevel.length - 1 ? "BACK" : `#${index}`}</small><strong>${escapeHtml(node.val)}</strong></span>`).join("")
    : `<em class="rsv-empty">${vi ? "chưa enqueue node con" : "no children enqueued yet"}</em>`;

  const hasDecision = Number.isInteger(view.index) && view.index >= 0 && view.size > 0;
  const decisionValue = hasDecision ? view.index === view.size - 1 : null;
  const decisionHtml = hasDecision
    ? `<code>i=${view.index} == size-1=${view.size - 1}</code><strong class="${decisionValue ? "is-true" : "is-false"}">${decisionValue ? "True" : "False"}</strong><span>${decisionValue ? (vi ? "node này là góc nhìn bên phải" : "this node is visible from the right") : (vi ? "tiếp tục tới node cuối tầng" : "continue to the level's last node")}</span>`
    : `<code>i == size - 1</code><strong>?</strong><span>${vi ? "chỉ node cuối mỗi tầng được thêm vào res" : "only the last node of each level enters res"}</span>`;

  let actionText;
  if (view.phase === "lock-level") {
    actionText = vi
      ? `Chốt size=${view.size}: đúng ${view.size} node này thuộc level ${view.level}; node con enqueue sau đó thuộc level ${view.level + 1}.`
      : `Lock size=${view.size}: exactly these ${view.size} node(s) belong to level ${view.level}; children enqueued afterward belong to level ${view.level + 1}.`;
  } else if (view.phase === "dequeue" && view.current) {
    actionText = vi
      ? `Popleft ${view.current.val} ở FRONT; đây là node i=${view.index} trong ${view.size} node của level ${view.level}.`
      : `Popleft ${view.current.val} from FRONT; it is node i=${view.index} among ${view.size} node(s) on level ${view.level}.`;
  } else if (["check-left", "check-right"].includes(view.phase)) {
    const side = view.childSide === "left" ? (vi ? "trái" : "left") : (vi ? "phải" : "right");
    actionText = view.child === null
      ? (vi ? `CURRENT không có con ${side}; queue không đổi.` : `CURRENT has no ${side} child; the queue stays unchanged.`)
      : (vi ? `CURRENT có con ${side} ${view.child}; bước sau enqueue vào phần NEXT LEVEL.` : `CURRENT has ${side} child ${view.child}; enqueue it into NEXT LEVEL next.`);
  } else if (["enqueue-left", "enqueue-right"].includes(view.phase)) {
    actionText = vi
      ? `Append ${view.child} vào BACK. Node này chờ ở level ${view.level + 1}, không làm thay đổi size=${view.size} đang chạy.`
      : `Append ${view.child} at BACK. It waits for level ${view.level + 1} and does not change the active size=${view.size}.`;
  } else if (view.phase === "check-rightmost" && view.current) {
    actionText = decisionValue
      ? (vi ? `${view.current.val} có i=size-1 nên là node phải nhất của level ${view.level}.` : `${view.current.val} has i=size-1, so it is the rightmost node on level ${view.level}.`)
      : (vi ? `${view.current.val} chưa phải node cuối level; không thêm vào res.` : `${view.current.val} is not the level's last node; do not add it to res.`);
  } else if (view.phase === "save-rightmost" && view.current) {
    actionText = vi
      ? `Thêm ${view.current.val} vào right side view: res=[${view.result.join(",")}].`
      : `Add ${view.current.val} to the right side view: res=[${view.result.join(",")}].`;
  } else if (["done", "done-levels"].includes(view.phase)) {
    actionText = vi
      ? `BFS hoàn tất; góc nhìn bên phải từ trên xuống là [${view.result.join(",")}].`
      : `BFS is complete; the top-to-bottom right side view is [${view.result.join(",")}].`;
  } else {
    actionText = vi
      ? "BFS xử lý từng tầng từ trái sang phải; node được popleft cuối cùng của mỗi tầng là node nhìn thấy bên phải."
      : "BFS processes each level left to right; the last node popped from each level is visible from the right.";
  }

  const resultHtml = (view.result || []).length
    ? view.result.map((value, index) => `<span><small>level ${index}</small><strong>${escapeHtml(value)}</strong></span>`).join("")
    : `<em class="rsv-empty">[]</em>`;
  const summary = vi
    ? `BFS góc nhìn bên phải; đang ở level ${view.level}, kết quả [${view.result.join(",")}].`
    : `Right-side-view BFS; current level ${view.level}, result [${view.result.join(",")}].`;
  return `<section class="rsv-bfs-guide" aria-label="${escapeHtml(summary)}">
    <div class="rsv-bfs-phases">${phasesHtml}</div>
    <div class="rsv-bfs-status">
      <span><small>LEVEL</small><strong>${view.size > 0 ? view.level : "—"}</strong></span>
      <span><small>FIXED SIZE</small><strong>${view.size || "—"}</strong></span>
      <span><small>i</small><strong>${view.index >= 0 ? view.index : "—"}</strong></span>
      <span><small>QUEUE</small><strong>${(view.queue || []).length}</strong></span>
    </div>
    <div class="rsv-level-flow">
      <div class="rsv-level-band"><header><strong>${vi ? "CURRENT LEVEL" : "CURRENT LEVEL"} ${view.size > 0 ? view.level : ""}</strong><span>size=${view.size || "?"} · ${vi ? "không đổi trong for-loop" : "fixed during the for-loop"}</span></header><div>${currentLevelHtml}</div></div>
      <b>→</b>
      <div class="rsv-level-band is-next"><header><strong>${vi ? "NEXT LEVEL" : "NEXT LEVEL"} ${view.size > 0 ? view.level + 1 : ""}</strong><span>${vi ? "node con append vào BACK" : "children append at BACK"}</span></header><div>${nextLevelHtml}</div></div>
    </div>
    <div class="rsv-bfs-decision">${decisionHtml}</div>
    <div class="rsv-bfs-action">${escapeHtml(actionText)}</div>
    <div class="rsv-result"><strong>RIGHT SIDE VIEW</strong><div>${resultHtml}</div></div>
  </section>`;
}

function rightSideDfsGuideHtml(view) {
  const vi = lang === "vi";
  const phaseGroup = {
    initialize: 0,
    "call-root": 0,
    enter: 1,
    "check-null": 1,
    "call-right": 1,
    "check-depth": 2,
    save: 2,
    "return-null": 3,
    "call-left": 3,
    "return-node": 3,
    done: 3,
  };
  const activePhase = phaseGroup[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1. Gọi DFS từ root", "2. Đi nhánh PHẢI trước", "3. Lưu node đầu tiên mỗi depth", "4. Quay lui rồi đi TRÁI"]
    : ["1. Call DFS from root", "2. Explore RIGHT first", "3. Save the first node per depth", "4. Backtrack, then go LEFT"];
  const phasesHtml = phaseLabels.map((label, index) => {
    const done = view.phase === "done" || index < activePhase;
    const state = done ? "is-done" : index === activePhase ? "is-active" : "";
    return `<span class="${state}">${done ? "✓" : index + 1}<b>${escapeHtml(label.replace(/^\d+\.\s*/, ""))}</b></span>`;
  }).join("");

  const currentLabel = view.isNullCall
    ? "None"
    : view.current
      ? view.current.val
      : "—";
  const viaLabel = view.via
    ? view.via === "root"
      ? "ROOT"
      : view.via.toUpperCase()
    : "—";
  const statusHtml = `<div class="rsv-dfs-status">
    <span><small>CURRENT NODE</small><strong>${escapeHtml(currentLabel)}</strong></span>
    <span><small>DEPTH</small><strong>${view.depth === null ? "—" : escapeHtml(view.depth)}</strong></span>
    <span><small>len(res)</small><strong>${(view.result || []).length}</strong></span>
    <span><small>CALL VIA</small><strong>${escapeHtml(viaLabel)}</strong></span>
  </div>`;

  const stackHtml = (view.stack || []).length
    ? view.stack.map((frame, index) => {
      const isTop = index === view.stack.length - 1;
      const frameClass = `${isTop ? " is-top" : ""}${frame.node === null ? " is-null" : ""}`;
      const via = frame.via === "root" ? "ROOT" : frame.via.toUpperCase();
      return `<span class="rsv-dfs-frame${frameClass}"><small>${via} · d=${frame.depth}</small><strong>${frame.node === null ? "None" : escapeHtml(frame.node)}</strong>${isTop ? `<em>${vi ? "ĐANG CHẠY" : "RUNNING"}</em>` : ""}</span>`;
    }).join(`<b class="rsv-dfs-stack-arrow">→</b>`)
    : `<em class="rsv-empty">${vi ? "call stack rỗng" : "empty call stack"}</em>`;

  const depthRows = Array.from({ length: Math.max(1, (view.maxDepth || 0) + 1) }, (_, depth) => {
    const hasValue = depth < (view.result || []).length;
    const isCurrent = view.depth === depth;
    const stateClass = `${hasValue ? " is-filled" : ""}${isCurrent ? " is-current" : ""}`;
    const stateText = hasValue
      ? (vi ? "đã chốt node phải nhất" : "rightmost node locked")
      : isCurrent
        ? (vi ? "đang kiểm tra depth này" : "checking this depth")
        : (vi ? "chưa gặp" : "not reached");
    return `<span class="rsv-dfs-depth${stateClass}"><small>depth ${depth}</small><strong>${hasValue ? escapeHtml(view.result[depth]) : "?"}</strong><em>${stateText}</em></span>`;
  }).join("");

  let decisionHtml;
  if (view.decision === null) {
    decisionHtml = `<code>depth == len(res)</code><strong>?</strong><span>${vi ? "True chỉ khi depth này chưa có node đại diện" : "True only when this depth has no representative"}</span>`;
  } else {
    const depth = view.depth === null ? "?" : view.depth;
    const lenBefore = view.decision ? (view.result || []).length - (view.phase === "save" ? 1 : 0) : (view.result || []).length;
    decisionHtml = `<code>${depth} == ${lenBefore}</code><strong class="${view.decision ? "is-true" : "is-false"}">${view.decision ? "True" : "False"}</strong><span>${view.decision ? (vi ? "node đầu tiên ở depth này → thêm vào res" : "first node at this depth → append to res") : (vi ? "depth đã có node nhìn thấy → bỏ qua" : "depth already has a visible node → skip")}</span>`;
  }

  const selectedIds = new Set(view.selectedIds || []);
  const traversalHtml = (view.visitOrder || []).length
    ? view.visitOrder.map((item, index) => {
      const isCurrent = view.current && item.id === view.current.id;
      const classes = `${selectedIds.has(item.id) ? " is-selected" : ""}${isCurrent ? " is-current" : ""}`;
      return `<span class="rsv-dfs-visit${classes}"><small>#${index + 1} · d=${item.depth}</small><strong>${escapeHtml(item.val)}</strong>${selectedIds.has(item.id) ? `<em>VIEW</em>` : ""}</span>`;
    }).join(`<b>→</b>`)
    : `<em class="rsv-empty">${vi ? "chưa thăm node" : "no node visited yet"}</em>`;

  const nextCallHtml = view.nextCall
    ? `<span class="rsv-dfs-next-call"><small>${vi ? "LỜI GỌI KẾ TIẾP" : "NEXT CALL"}</small><code>dfs(${view.nextCall.node === null ? "None" : escapeHtml(view.nextCall.node)}, ${view.nextCall.depth})</code><strong>${escapeHtml(view.nextCall.side.toUpperCase())}</strong></span>`
    : "";
  const actionText = view.action ? pick(view.action) : (vi ? "DFS ưu tiên nhánh phải trước nhánh trái." : "DFS explores the right branch before the left branch.");
  const resultHtml = (view.result || []).length
    ? view.result.map((value, depth) => `<span><small>depth ${depth}</small><strong>${escapeHtml(value)}</strong></span>`).join("")
    : `<em class="rsv-empty">[]</em>`;
  const summary = vi
    ? `DFS góc nhìn bên phải; depth hiện tại ${view.depth ?? "chưa có"}, kết quả [${(view.result || []).join(",")}].`
    : `Right-side-view DFS; current depth ${view.depth ?? "none"}, result [${(view.result || []).join(",")}].`;

  return `<section class="rsv-dfs-guide" aria-label="${escapeHtml(summary)}">
    <div class="rsv-dfs-phases">${phasesHtml}</div>
    ${statusHtml}
    <div class="rsv-dfs-stack"><header><strong>CALL STACK</strong><span>${vi ? "frame ngoài cùng bên phải đang chạy" : "the rightmost frame is running"}</span></header><div>${stackHtml}</div></div>
    ${nextCallHtml}
    <div class="rsv-dfs-depths"><header><strong>FIRST NODE AT EACH DEPTH</strong><span>RIGHT → LEFT</span></header><div>${depthRows}</div></div>
    <div class="rsv-dfs-decision">${decisionHtml}</div>
    <div class="rsv-dfs-action">${escapeHtml(actionText)}</div>
    <div class="rsv-dfs-traversal"><strong>DFS ORDER</strong><div>${traversalHtml}</div></div>
    <div class="rsv-result"><strong>RIGHT SIDE VIEW</strong><div>${resultHtml}</div></div>
  </section>`;
}

function lcaDeepestGuideHtml(view) {
  const vi = lang === "vi";
  const pair = (value) => value
    ? `(${value.height}, ${value.lca})`
    : "?";
  const stack = (view.callStack || []).length
    ? view.callStack.map((value, index) => (
      `<span class="lca-stack-node${index === view.callStack.length - 1 ? " current" : ""}">${escapeHtml(`dfs(${value})`)}</span>`
    )).join(`<i>→</i>`)
    : `<span class="lca-stack-empty">${vi ? "trống" : "empty"}</span>`;

  let decisionText;
  let decisionClass = "waiting";
  if (view.phase === "done") {
    decisionClass = "done";
    decisionText = vi
      ? `Hoàn tất: các lá sâu nhất [${(view.deepestLeaves || []).join(", ")}] ở level ${view.deepestLevel}.`
      : `Done: deepest leaves [${(view.deepestLeaves || []).join(", ")}] are at level ${view.deepestLevel}.`;
  } else if (view.phase === "base") {
    decisionClass = "base";
    decisionText = vi ? "None là đáy đệ quy → trả (0, None)." : "None is the base case → return (0, None).";
  } else if (view.decision === "equal") {
    decisionClass = "equal";
    decisionText = vi
      ? `${view.left.height} = ${view.right.height} → chọn node hiện tại làm LCA.`
      : `${view.left.height} = ${view.right.height} → current node becomes the LCA.`;
  } else if (view.decision === "left" || view.decision === "right") {
    decisionClass = view.decision;
    decisionText = vi
      ? `${view.decision === "left" ? "Trái" : "Phải"} cao hơn → giữ LCA của phía đó.`
      : `${view.decision === "left" ? "Left" : "Right"} is taller → keep that side's LCA.`;
  } else if (view.phase === "enter") {
    decisionText = vi ? "Chờ kết quả cây trái và cây phải…" : "Waiting for the left and right subtree results…";
  } else {
    decisionText = vi
      ? "Quy ước: dfs(node) trả về (chiều cao cây con, LCA)."
      : "Contract: dfs(node) returns (subtree height, LCA).";
  }

  const resultPair = view.result ? pair(view.result) : view.phase === "base" ? "(0, None)" : "?";
  const summary = vi
    ? `Đệ quy postorder tìm LCA lá sâu nhất. Đã xử lý ${view.processed} trên ${view.total} node.`
    : `Postorder recursion finds the LCA of deepest leaves. Processed ${view.processed} of ${view.total} nodes.`;

  return `<section class="lca-deepest-guide" role="img" aria-label="${escapeHtml(summary)}">
    <div class="lca-contract">
      <strong>dfs(node)</strong>
      <span>→</span>
      <code>(height, lca)</code>
      <small>${vi ? "height = chiều cao từ node xuống lá sâu nhất" : "height = distance from node to its deepest leaf"}</small>
    </div>
    <div class="lca-stack-row">
      <b>CALL STACK</b>
      <div>${stack}</div>
    </div>
    <div class="lca-compare-row">
      <div class="lca-side left${view.decision === "left" ? " chosen" : ""}">
        <small>${vi ? "CÂY TRÁI TRẢ VỀ" : "LEFT RETURNS"}</small>
        <strong>${escapeHtml(pair(view.left))}</strong>
      </div>
      <div class="lca-decision ${decisionClass}">
        <span>${escapeHtml(decisionText)}</span>
      </div>
      <div class="lca-side right${view.decision === "right" ? " chosen" : ""}">
        <small>${vi ? "CÂY PHẢI TRẢ VỀ" : "RIGHT RETURNS"}</small>
        <strong>${escapeHtml(pair(view.right))}</strong>
      </div>
      <div class="lca-result${view.result || view.phase === "base" || view.phase === "done" ? " ready" : ""}">
        <small>RETURN</small>
        <strong>${escapeHtml(resultPair)}</strong>
      </div>
    </div>
    <div class="lca-progress"><span style="width:${view.total ? Math.round((view.processed / view.total) * 100) : 0}%"></span></div>
    <small class="lca-progress-label">POSTORDER · ${escapeHtml(view.processed)}/${escapeHtml(view.total)} ${vi ? "node đã xong" : "nodes complete"}</small>
  </section>`;
}

function renderBstIteratorView(step) {
  const view = step.bstIteratorView || {};
  const vi = lang === "vi";
  const stageLabels = {
    constructor: vi ? "Tạo iterator" : "Create iterator",
    "stack-init": vi ? "Khởi tạo stack" : "Initialize stack",
    "push-left-start": vi ? "Bắt đầu push đường trái" : "Start pushing left path",
    "push-check": vi ? "Kiểm tra node" : "Check node",
    push: vi ? "Push node lên TOP" : "Push node onto TOP",
    "move-left": vi ? "Đi sang con trái" : "Move to left child",
    pop: vi ? "Pop node nhỏ nhất" : "Pop smallest node",
    "right-subtree": vi ? "Chuyển sang subtree phải" : "Move to right subtree",
    emit: vi ? "Trả kết quả next()" : "Return next() result",
    "has-next": vi ? "Kiểm tra stack" : "Check stack",
    "invalid-next": vi ? "next() không hợp lệ" : "Invalid next()",
    done: vi ? "Hoàn tất" : "Complete",
  };
  const stage = stageLabels[view.phase] || view.phase || "—";
  const operation = view.phase === "done"
    ? (vi ? "hoàn tất tất cả operations" : "all operations complete")
    : view.operationIndex === null || view.operationIndex === undefined
      ? "constructor"
      : `#${view.operationIndex + 1} ${view.operationName}()`;
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackDisplay = [...stack].reverse();
  const stackHtml = stackDisplay.length
    ? stackDisplay.map((item, index) => `<div class="bsti-stack-item${index === 0 ? " top" : ""}">
        <span>${index === 0 ? "TOP" : `#${item.index}`}</span><strong>${escapeHtml(item.value)}</strong><small>${index === 0 ? (vi ? "pop trước" : "pop first") : (vi ? "đang chờ" : "waiting")}</small>
      </div>`).join("")
    : `<div class="bsti-stack-empty">${vi ? "STACK RỖNG" : "EMPTY STACK"}</div>`;
  const stackArray = `[${stack.map((item) => item.value).join(", ")}]`;
  const beforeArray = `[${(view.stackBefore || []).map((item) => item.value).join(", ")}]`;
  const emitted = Array.isArray(view.emitted) ? view.emitted : [];
  const emittedHtml = emitted.length
    ? emitted.map((value, index) => `<span><small>${index + 1}</small><strong>${escapeHtml(value)}</strong></span>`).join("")
    : `<em>${vi ? "Chưa có giá trị nào được return" : "No value has been returned yet"}</em>`;
  const operationsHtml = (view.operations || []).map((item) => {
    const state = view.phase === "done"
      ? "done"
      : view.operationIndex === item.index ? "active" : view.operationIndex !== null && item.index < view.operationIndex ? "done" : "";
    return `<span class="${state}"><b>${item.index + 1}</b>${escapeHtml(item.name)}()</span>`;
  }).join("") || `<em>${vi ? "Không có operation" : "No operations"}</em>`;
  const pushPath = (view.pushPath || []).map((item) => item.value).join(" → ") || "—";

  let action = vi ? "Quan sát trạng thái iterator" : "Inspect iterator state";
  if (view.phase === "push") action = `PUSH ${view.current ? view.current.value : "node"} → TOP`;
  else if (view.phase === "pop") action = `POP TOP → ${view.popped ? view.popped.value : "—"}`;
  else if (view.phase === "move-left") action = `${view.current ? view.current.value : "node"}.left → ${view.nextNode ? view.nextNode.value : "None"}`;
  else if (view.phase === "right-subtree") action = `${view.popped ? view.popped.value : "node"}.right → ${view.rightRoot ? view.rightRoot.value : "None"}`;
  else if (view.phase === "emit") action = `RETURN ${view.popped ? view.popped.value : "—"}`;
  else if (view.phase === "has-next") action = `bool(stack) → ${String(view.hasNextResult)}`;
  else if (view.phase === "push-check") action = `while node → ${view.current ? "True" : "False"}`;

  const isNext = view.operationName === "next";
  const isHasNext = view.operationName === "hasNext";
  const flowActive = view.phase === "pop" ? 0
    : ["right-subtree", "push-check", "push", "move-left"].includes(view.phase) && isNext ? 1
      : view.phase === "emit" ? 2 : -1;
  let flowHtml;
  if (isNext) {
    flowHtml = [vi ? "POP TOP" : "POP TOP", "pushLeft(node.right)", vi ? "RETURN value" : "RETURN value"]
      .map((label, index) => `<span class="${index === flowActive ? "active" : index < flowActive ? "done" : ""}"><b>${index + 1}</b>${escapeHtml(label)}</span>`).join("<i>→</i>");
  } else if (isHasNext) {
    flowHtml = `<span class="${view.phase === "has-next" ? "active" : ""}"><b>?</b>bool(stack) = stack ${stack.length ? "≠ []" : "= []"}</span>`;
  } else {
    const constructorActive = ["constructor", "stack-init"].includes(view.phase) ? 0
      : view.phase === "push-left-start" ? 1
        : ["push-check", "push", "move-left"].includes(view.phase) ? 2 : -1;
    flowHtml = ["stack = []", vi ? "push root" : "push root", vi ? "đi trái đến None" : "follow left to None"]
      .map((label, index) => `<span class="${index === constructorActive ? "active" : index < constructorActive ? "done" : ""}"><b>${index + 1}</b>${escapeHtml(label)}</span>`).join("<i>→</i>");
  }
  const hasNextIsActual = view.phase === "has-next";
  const hasNextValue = hasNextIsActual ? Boolean(view.hasNextResult) : stack.length > 0;
  const hasNextClass = hasNextValue ? "true" : "false";
  const hasNextText = hasNextValue ? "TRUE" : "FALSE";
  const hasNextMode = hasNextIsActual ? (vi ? "ĐANG GỌI" : "CALLED") : (vi ? "XEM TRƯỚC" : "PREVIEW");
  const hasNextReason = stack.length
    ? `${stackArray} ≠ [] · ${stack.length} ${vi ? "node đang chờ" : "waiting node(s)"}`
    : `${stackArray} = [] · ${vi ? "không còn node" : "no node remains"}`;
  const flowTitle = isNext ? "next()" : isHasNext ? "hasNext()" : "constructor";
  const transitionText = view.stackBefore && view.stackBefore.length
    ? `${beforeArray} → ${stackArray}`
    : `${vi ? "stack hiện tại" : "current stack"} = ${stackArray}`;

  $("treeView").innerHTML = `<section class="bsti-viz">
    <section class="bsti-rule"><strong>BST ITERATOR</strong><code>TOP = ${view.nextValue === null ? "None" : escapeHtml(view.nextValue)}</code><span>${vi ? "TOP luôn là node nhỏ nhất chưa được trả về" : "TOP is always the smallest node not returned yet"}</span></section>
    <section class="bsti-stage"><div><small>${vi ? "PHA" : "PHASE"}</small><strong>${escapeHtml(stage)}</strong></div><div><small>OPERATION</small><strong>${escapeHtml(operation)}</strong></div><code>${escapeHtml(action)}</code></section>
    <div class="bsti-layout">
      <section class="bsti-tree-card"><header><strong>${vi ? "CÂY BST" : "BST"}</strong><span>${vi ? "cam = đang xét · xanh = đã return · nhãn STACK/TOP = đang chờ" : "amber = current · green = returned · STACK/TOP labels = waiting"}</span></header><div id="bstiTree" class="bsti-tree"></div></section>
      <aside class="bsti-side">
        <section class="bsti-stack-card"><header><strong>ITERATOR STACK</strong><span>${vi ? "TOP ở trên · pop trước" : "TOP above · popped first"}</span></header><div class="bsti-stack-shell"><b>TOP</b><div>${stackHtml}</div><b>BOTTOM</b></div><footer><code>${escapeHtml(stackArray)}</code><span>bottom → top</span></footer></section>
        ${view.popped ? `<section class="bsti-popped"><span>${vi ? "VỪA POP" : "POPPED"}</span><strong>${escapeHtml(view.popped.value)}</strong><code>${escapeHtml(transitionText)}</code></section>` : ""}
        <section class="bsti-flow"><header><strong>${escapeHtml(flowTitle)}</strong><span>${vi ? "luồng xử lý" : "execution flow"}</span></header><div>${flowHtml}</div></section>
        <section class="bsti-path"><span>pushLeft path</span><strong>${escapeHtml(pushPath)}</strong><small>${view.rightRoot ? `${vi ? "subtree phải bắt đầu tại" : "right subtree starts at"} ${view.rightRoot.value}` : (vi ? "đi trái cho đến None" : "follow left pointers until None")}</small></section>
        <section class="bsti-hasnext ${hasNextClass}"><div><span>hasNext()</span><code>bool(stack)</code><em>${escapeHtml(hasNextMode)}</em></div><strong>${escapeHtml(hasNextText)}</strong><small>${escapeHtml(hasNextReason)}</small></section>
      </aside>
    </div>
    <section class="bsti-emitted"><header><strong>${vi ? "INORDER ĐÃ RETURN" : "EMITTED INORDER"}</strong><span>${vi ? "chỉ gồm kết quả next(), không gồm boolean" : "next() values only; booleans excluded"}</span></header><div>${emittedHtml}</div></section>
    <section class="bsti-operations"><header><strong>OPERATIONS</strong><span>${vi ? "xanh = xong · cam = hiện tại" : "green = done · amber = active"}</span></header><div>${operationsHtml}</div></section>
  </section>`;
  renderTree(step, "bstiTree");
}

function renderInsufficient1080View(step) {
  const view = step.insufficient1080View || {};
  const vi = lang === "vi";
  const localPick = (value) => typeof pick === "function" ? pick(value) : value?.[lang] ?? value?.en ?? value?.vi ?? value ?? "";
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["1. Đi xuống và cộng", "2. Quyết định ở lá", "3. Quay lên và cắt", "4. Cây kết quả"]
    : ["1. Descend and add", "2. Decide at leaves", "3. Backtrack and prune", "4. Result tree"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");
  const path = Array.isArray(view.path) ? view.path : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const decision = view.decision || { type: "rule" };
  const currentPath = path.length
    ? path.map((node, index) => `<span class="${index === path.length - 1 ? "current" : ""}"><small>${index === 0 ? "ROOT" : `LEVEL ${index}`}</small><strong>${escapeHtml(node.value)}</strong></span>`).join("<i>→</i>")
    : `<em>${vi ? "DFS đã quay về khỏi gốc" : "DFS has returned from the root"}</em>`;
  const stackHtml = stack.length
    ? stack.map((frame, index) => `<li class="${index === stack.length - 1 ? "active" : ""}"><span>#${index + 1}</span><strong>${escapeHtml(frame.value)}</strong><small>Σ = ${escapeHtml(frame.pathSum)}</small><em>${escapeHtml(frame.stage || "WAIT")}</em></li>`).join("")
    : `<li class="empty">${vi ? "Stack trống" : "Empty stack"}</li>`;

  let decisionClass = "neutral";
  let decisionLabel = vi ? "QUY TẮC" : "RULE";
  let decisionFormula = "leaf: path_sum ≥ limit · parent: left OR right";
  let decisionText = vi
    ? "Chỉ lá mới kiểm tra tổng đường đi; node cha giữ lại khi ít nhất một nhánh con còn sống."
    : "Only a leaf checks the path sum; a parent remains when at least one child branch survives.";
  if (decision.type === "enter") {
    decisionLabel = vi ? "CỘNG NODE VÀO ĐƯỜNG ĐI" : "ADD NODE TO THE PATH";
    decisionFormula = `${decision.previousSum} + (${decision.nodeValue}) = ${decision.pathSum}`;
    decisionText = vi ? "Mang tổng mới xuống các node con." : "Carry the new sum down to both children.";
  } else if (decision.type === "call") {
    decisionLabel = vi ? `ĐI XUỐNG NHÁNH ${decision.side === "left" ? "TRÁI" : "PHẢI"}` : `DESCEND INTO THE ${String(decision.side || "").toUpperCase()} BRANCH`;
    decisionFormula = decision.childValue === null ? "dfs(None) → None" : `dfs(${decision.childValue}, path_sum)`;
    decisionText = decision.childValue === null
      ? (vi ? "Nhánh rỗng trả None ngay." : "An empty branch immediately returns None.")
      : (vi ? "Chưa quyết định node cha cho đến khi nhánh con trả về." : "The parent cannot be decided until the child returns.");
  } else if (decision.type === "leaf") {
    decisionClass = decision.survives ? "keep" : "prune";
    decisionLabel = vi ? "LÁ: SO TỔNG VỚI LIMIT" : "LEAF: COMPARE SUM WITH LIMIT";
    decisionFormula = `${decision.pathSum} ${decision.survives ? "≥" : "<"} ${decision.limit} → ${decision.survives ? "KEEP" : "PRUNE"}`;
    decisionText = decision.survives
      ? (vi ? "Đường root → leaf này đủ lớn, nên giữ lá." : "This root-to-leaf path reaches the limit, so keep the leaf.")
      : (vi ? "Đường root → leaf này không đủ, nên lá trả None." : "This root-to-leaf path is too small, so the leaf returns None.");
  } else if (decision.type === "child-return") {
    decisionClass = decision.survives ? "keep" : "prune";
    const side = decision.side === "left" ? (vi ? "TRÁI" : "LEFT") : (vi ? "PHẢI" : "RIGHT");
    decisionLabel = vi ? `NHÁNH ${side} ĐÃ TRẢ VỀ` : `${side} BRANCH RETURNED`;
    decisionFormula = `${decision.side} = ${decision.survives ? "node" : "None"}`;
    decisionText = decision.survives
      ? (vi ? "Nhánh này có ít nhất một đường đủ limit." : "This branch contains at least one sufficient path.")
      : (vi ? "Nhánh này không còn đường hợp lệ." : "This branch has no sufficient path left.");
  } else if (decision.type === "parent") {
    decisionClass = decision.survives ? "keep" : "prune";
    decisionLabel = vi ? "NODE CHA: GỘP KẾT QUẢ HAI CON" : "PARENT: COMBINE BOTH CHILD RESULTS";
    decisionFormula = `${decision.leftSurvives ? "KEEP" : "None"} OR ${decision.rightSurvives ? "KEEP" : "None"} → ${decision.survives ? "KEEP" : "PRUNE"}`;
    decisionText = decision.survives
      ? (vi ? "Ít nhất một con sống, nên node cha vẫn nằm trên một đường hợp lệ." : "At least one child survives, so the parent still lies on a sufficient path.")
      : (vi ? "Cả hai con đều None, nên node cha cũng phải bị cắt." : "Both children are None, so the parent must also be pruned.");
  } else if (decision.type === "done") {
    decisionClass = decision.survives ? "keep" : "prune";
    decisionLabel = vi ? "HOÀN TẤT" : "COMPLETE";
    decisionFormula = decision.survives ? "root returned node" : "root returned None";
    decisionText = decision.survives
      ? (vi ? "Các node xanh tạo thành cây kết quả." : "The green nodes form the result tree.")
      : (vi ? "Không có đường root-to-leaf nào đạt limit." : "No root-to-leaf path reaches the limit.");
  }

  const decided = Number(view.decided) || 0;
  const totalNodes = Number(view.totalNodes) || 0;
  const keptCount = Array.isArray(view.keptIds) ? view.keptIds.length : 0;
  const prunedCount = Array.isArray(view.prunedIds) ? view.prunedIds.length : 0;
  const final = Boolean(step.final || decision.type === "done");

  $("treeView").innerHTML = `<section class="is1080-viz" role="img" aria-label="Insufficient Nodes in Root to Leaf Paths visualization">
    <header><div><small>POSTORDER DFS · PRUNING · #1080</small><strong>INSUFFICIENT NODES</strong></div><span>${escapeHtml(localPick(step.title))}</span></header>
    <div class="is1080-phases">${phases}</div>
    <section class="is1080-rule"><div><small>${vi ? "QUYẾT ĐỊNH Ở LÁ" : "LEAF DECISION"}</small><code>path_sum ≥ limit ? KEEP : PRUNE</code></div><i>→</i><div><small>${vi ? "QUYẾT ĐỊNH Ở NODE CHA" : "PARENT DECISION"}</small><code>left OR right ? KEEP : PRUNE</code></div></section>
    <section class="is1080-summary"><div><small>LIMIT</small><strong>${escapeHtml(view.limit)}</strong></div><div><small>${vi ? "NODE HIỆN TẠI" : "CURRENT NODE"}</small><strong>${view.currentValue === null || view.currentValue === undefined ? "—" : escapeHtml(view.currentValue)}</strong></div><div><small>PATH SUM</small><strong>${view.pathSum === null || view.pathSum === undefined ? "—" : escapeHtml(view.pathSum)}</strong></div><div><small>${vi ? "ĐÃ QUYẾT ĐỊNH" : "DECIDED"}</small><strong>${decided}/${totalNodes}</strong></div><div class="keep"><small>KEEP</small><strong>${keptCount}</strong></div><div class="prune"><small>PRUNE</small><strong>${prunedCount}</strong></div></section>
    <div class="is1080-layout">
      <section class="is1080-tree-card"><header><strong>${vi ? "CÂY GỐC — KHÔNG LÀM NODE BIẾN MẤT GIỮA CHỪNG" : "ORIGINAL TREE — NODES STAY VISIBLE WHILE DECIDING"}</strong><span>${vi ? "cam = hiện tại · xanh = giữ · đỏ = cắt" : "orange = current · green = keep · red = prune"}</span></header><div id="is1080Tree" class="is1080-tree"></div><footer><span><i class="current"></i>${vi ? "đang xét" : "current"}</span><span><i class="keep"></i>keep</span><span><i class="prune"></i>prune</span><span><i class="waiting"></i>${vi ? "chưa quyết định" : "undecided"}</span></footer></section>
      <aside class="is1080-side">
        <section class="is1080-path"><header><strong>${vi ? "ĐƯỜNG ROOT → NODE HIỆN TẠI" : "ROOT → CURRENT NODE PATH"}</strong><span>${vi ? "Σ nằm dưới mỗi node" : "Σ is shown under each node"}</span></header><div>${currentPath}</div></section>
        <section class="is1080-decision ${decisionClass}"><small>${escapeHtml(decisionLabel)}</small><code>${escapeHtml(decisionFormula)}</code><p>${escapeHtml(decisionText)}</p></section>
        <section class="is1080-stack"><header><strong>RECURSION STACK</strong><span>${vi ? "dòng cuối đang chạy" : "last row is active"}</span></header><ol>${stackHtml}</ol></section>
      </aside>
    </div>
    <section class="is1080-action"><small>${escapeHtml(String(view.event || "dfs").toUpperCase())}</small><strong>${escapeHtml(localPick(step.title))}</strong><span>${escapeHtml(localPick(step.note))}</span></section>
    <footer class="is1080-result ${final ? "done" : ""}"><small>${vi ? "CÂY TRẢ VỀ" : "RETURNED TREE"}</small><strong>${final ? escapeHtml(view.resultTree || "[]") : "…"}</strong><span>${final ? (vi ? "Chỉ các node xanh còn lại trong kết quả." : "Only green nodes remain in the result.") : (vi ? "Quyết định được truyền từ lá ngược lên gốc." : "Decisions propagate from leaves back to the root.")}</span></footer>
  </section>`;
  renderTree(step, "is1080Tree");
}

function renderUnivalue250View(step) {
  const view = step.univalue250View || {};
  const vi = lang === "vi";
  const phaseIndex = Number(view.phaseIndex) || 0;
  const phases = [
    vi ? "1 · Postorder" : "1 · Postorder",
    vi ? "2 · Ghép kết quả con" : "2 · Combine children",
    vi ? "3 · Kết luận + đếm" : "3 · Decide + count",
    vi ? "4 · Đáp án" : "4 · Answer",
  ].map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index + 1}</b>${escapeHtml(label.replace(/^\d+ · /, ""))}</span>`).join("");

  const statuses = Array.isArray(view.statuses) ? view.statuses : [];
  const accepted = statuses.filter(item => item.state === "univalue");
  const rejected = statuses.filter(item => item.state === "rejected");
  const pending = statuses.filter(item => item.state === "pending");
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stack.length
    ? stack.map((frame, index) => `<span class="${index === stack.length - 1 ? "active" : ""}"><small>#${index + 1}</small><strong>${escapeHtml(frame.value)}</strong></span>`).join("<i>→</i>")
    : `<em>${view.phase === "done" ? (vi ? "stack đã rỗng" : "stack is empty") : (vi ? "chưa bắt đầu" : "not started")}</em>`;

  function childCard(side, child) {
    const label = side === "left" ? (vi ? "CON TRÁI" : "LEFT CHILD") : (vi ? "CON PHẢI" : "RIGHT CHILD");
    if (!child) return `<article class="empty"><small>${label}</small><strong>None</strong><span>${vi ? "None trả True" : "None returns True"}</span></article>`;
    const subtree = child.isUnivalue ? "True" : "False";
    const matches = child.matches ? "True" : "False";
    return `<article class="${child.isUnivalue && child.matches ? "pass" : "fail"}"><small>${label}</small><strong>${child.exists ? escapeHtml(child.value) : "None"}</strong><span>subtree UNI = <b>${subtree}</b></span><span>${vi ? "giá trị khớp" : "value matches"} = <b>${matches}</b></span></article>`;
  }

  const checksHtml = view.current
    ? `<section class="uv250-checks"><header><strong>${vi ? `KIỂM TRA NODE ${escapeHtml(view.current.value)}` : `CHECK NODE ${escapeHtml(view.current.value)}`}</strong><span>${vi ? "cần đủ 4 điều kiện" : "all four conditions are required"}</span></header><div>${childCard("left", view.left)}<i>AND</i>${childCard("right", view.right)}</div><code>${escapeHtml(view.formula || (vi ? "đang chờ hai con" : "waiting for both children"))}</code></section>`
    : `<section class="uv250-rule"><strong>${vi ? "SUBTREE ĐỒNG NHẤT KHI" : "A SUBTREE IS UNIVALUE WHEN"}</strong><code>left UNI ∧ right UNI ∧ left matches ∧ right matches</code></section>`;

  const statusHtml = statuses.length
    ? statuses.map(item => `<span class="${escapeHtml(item.state)}"><small>node</small><b>${escapeHtml(item.value)}</b><em>${item.state === "univalue" ? "UNI" : item.state === "rejected" ? (vi ? "KHÔNG" : "NO") : "?"}</em></span>`).join("")
    : `<em>—</em>`;
  const countChanged = Number(view.countAfter) > Number(view.countBefore);
  const final = Boolean(step.final || view.phase === "done");
  const summary = vi
    ? `LeetCode 250, pha ${view.phase || "postorder"}, count ${view.countAfter || 0}, ${accepted.length} subtree đồng nhất.`
    : `LeetCode 250, ${view.phase || "postorder"} phase, count ${view.countAfter || 0}, ${accepted.length} univalue subtrees.`;

  $("treeView").innerHTML = `<section class="uv250-viz phase-${escapeHtml(view.phase || "descend")}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>POSTORDER DFS · BOOLEAN RETURN · #250</small><strong>COUNT UNIVALUE SUBTREES</strong></div><span>count = ${escapeHtml(view.countAfter || 0)}</span></header>
    <div class="uv250-phases">${phases}</div>
    ${checksHtml}
    <div class="uv250-layout">
      <section class="uv250-tree-card"><header><strong>${vi ? "CÂY VÀ KẾT LUẬN TỪNG SUBTREE" : "TREE AND EACH SUBTREE'S VERDICT"}</strong><span>${vi ? "cam = current · xanh = UNI · đỏ = không UNI" : "amber = current · green = UNI · red = not UNI"}</span></header><div id="uv250Tree" class="uv250-tree"></div></section>
      <aside class="uv250-side">
        <section class="uv250-count ${countChanged ? "changed" : ""}"><small>COUNT</small><strong>${escapeHtml(view.countAfter || 0)}</strong><span>${countChanged ? `+1 (${view.countBefore} → ${view.countAfter})` : (vi ? "không đổi ở bước này" : "unchanged in this step")}</span></section>
        <section class="uv250-stack"><header><strong>RECURSION STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><div>${stackHtml}</div></section>
        <section class="uv250-totals"><div class="pass"><small>UNI</small><strong>${accepted.length}</strong></div><div class="fail"><small>${vi ? "KHÔNG UNI" : "NOT UNI"}</small><strong>${rejected.length}</strong></div><div><small>${vi ? "CHỜ" : "PENDING"}</small><strong>${pending.length}</strong></div></section>
        <section class="uv250-status"><header><strong>${vi ? "TRẠNG THÁI MỖI NODE" : "NODE VERDICTS"}</strong></header><div>${statusHtml}</div></section>
      </aside>
    </div>
    <footer class="${final ? "done" : ""}"><small>${escapeHtml(String(view.operation || "postorder").toUpperCase())}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></footer>
  </section>`;
  renderTree({ tree: step.tree }, "uv250Tree");
}

function renderLongestConsecutive298View(step) {
  const view = step.longestConsecutive298View || {};
  const vi = lang === "vi";
  const current = view.current || null;
  const parent = view.parent || null;
  const chain = Array.isArray(view.chain) ? view.chain : [];
  const bestChain = Array.isArray(view.bestChain) ? view.bestChain : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const phaseIndex = Number(view.phaseIndex) || 0;
  const numberText = value => Number.isFinite(value) ? String(value) : "—";
  const phaseLabels = vi
    ? ["Khởi tạo", "Vào node + so sánh", "Cập nhật longest", "DFS hai con", "Kết quả"]
    : ["Initialize", "Enter + compare", "Update longest", "DFS children", "Answer"];
  const phases = phaseLabels.map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const relationClass = view.relation || "waiting";
  const relationTitle = view.relation === "continues"
    ? (vi ? "NỐI TIẾP CHUỖI" : "EXTEND THE CHAIN")
    : view.relation === "breaks"
      ? (vi ? "CHUỖI BỊ ĐỨT" : "CHAIN BREAKS")
      : view.relation === "root"
        ? (vi ? "ROOT BẮT ĐẦU CHUỖI" : "ROOT STARTS A CHAIN")
        : view.relation === "null"
          ? (vi ? "NHÁNH RỖNG" : "EMPTY BRANCH")
          : (vi ? "CHỜ NODE" : "WAITING FOR A NODE");
  const relationDetail = view.relation === "continues"
    ? `${numberText(current && current.value)} = ${numberText(parent && parent.value)} + 1 → length + 1`
    : view.relation === "breaks"
      ? `${numberText(current && current.value)} ≠ ${numberText(view.expectedValue)} → length = 1`
      : view.relation === "root"
        ? `${numberText(current && current.value)} → length = 1`
        : view.relation === "null"
          ? (vi ? "return · không đổi longest" : "return · longest is unchanged")
          : "node.val ? parent_val + 1";

  const chips = (items, emptyText) => items.length
    ? items.map((item, index) => `<span><small>${index + 1}</small><b>${escapeHtml(numberText(item.value))}</b></span>`).join("<i>→</i>")
    : `<em>${escapeHtml(emptyText)}</em>`;
  const chainHtml = chips(chain, vi ? "chưa có chuỗi hiện tại" : "no current chain");
  const bestHtml = chips(bestChain, vi ? "chưa có kỷ lục" : "no record yet");
  const stackHtml = stack.length
    ? stack.map((frame, index) => `<span class="${index === stack.length - 1 ? "active" : ""}"><small>#${index + 1}</small><b>${escapeHtml(numberText(frame.value))}</b><em>len ${escapeHtml(numberText(frame.length))}</em></span>`).join("<i>→</i>")
    : `<em>${view.final ? (vi ? "stack đã rỗng" : "stack is empty") : (vi ? "chưa bắt đầu" : "not started")}</em>`;
  const updated = Number(view.longest) > Number(view.longestBefore);
  const sideText = view.side === "left" ? (vi ? "TRÁI" : "LEFT") : view.side === "right" ? (vi ? "PHẢI" : "RIGHT") : view.side === "root" ? "ROOT" : "—";
  const nextText = view.next ? numberText(view.next.value) : view.side ? "None" : "—";
  const final = Boolean(view.final);
  const summary = vi
    ? `Bài 298: node ${numberText(current && current.value)}, length ${view.currentLength || 0}, longest ${view.longest || 0}.`
    : `Problem 298: node ${numberText(current && current.value)}, length ${view.currentLength || 0}, longest ${view.longest || 0}.`;

  $("treeView").innerHTML = `<section class="lc298-viz phase-${escapeHtml(view.phase || "initialize")}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>TOP-DOWN DFS · PATH STATE · #298</small><strong>${vi ? "CHUỖI CHA → CON LIÊN TIẾP DÀI NHẤT" : "LONGEST PARENT → CHILD CONSECUTIVE CHAIN"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="lc298-phases">${phases}</div>
    <section class="lc298-rule"><strong>${vi ? "ĐIỀU KIỆN DUY NHẤT" : "THE ONE CONDITION"}</strong><code>node.val == parent_val + 1</code><span>${vi ? "đúng: length + 1 · sai: reset về 1" : "true: length + 1 · false: reset to 1"}</span></section>
    <div class="lc298-layout">
      <section class="lc298-tree-card"><header><strong>${vi ? "CÂY + CHUỖI TỐT NHẤT" : "TREE + BEST CHAIN"}</strong><span>${vi ? "cam = current · tím = parent · xanh = best" : "amber = current · purple = parent · green = best"}</span></header><div id="lc298Tree" class="lc298-tree"></div></section>
      <aside class="lc298-side">
        <section class="lc298-values"><div><small>parent_val</small><strong>${escapeHtml(numberText(parent && parent.value))}</strong></div><div><small>node.val</small><strong>${escapeHtml(numberText(current && current.value))}</strong></div><div><small>${vi ? "cần bằng" : "expected"}</small><strong>${escapeHtml(numberText(view.expectedValue))}</strong></div></section>
        <section class="lc298-relation ${relationClass}"><small>${escapeHtml(relationTitle)}</small><strong>${escapeHtml(relationDetail)}</strong><span>${vi ? "state chỉ đi từ cha xuống con" : "state only flows from parent to child"}</span></section>
        <section class="lc298-length ${updated ? "updated" : ""}"><header><strong>${vi ? "ĐỘ DÀI" : "LENGTHS"}</strong><span>${updated ? (vi ? "kỷ lục mới" : "new record") : (vi ? "so với kỷ lục" : "versus record")}</span></header><div><article><small>length</small><b>${escapeHtml(numberText(view.currentLength))}</b></article><i>${updated ? "→" : "≤"}</i><article><small>longest</small><b>${escapeHtml(numberText(view.longest))}</b></article></div></section>
        <section class="lc298-next ${view.side || "idle"}"><small>${vi ? "NHÁNH ĐANG GỌI" : "NEXT DFS CALL"}</small><strong>${escapeHtml(sideText)} → ${escapeHtml(nextText)}</strong><span>parent_val = ${escapeHtml(numberText(current && current.value))} · length = ${escapeHtml(numberText(view.currentLength))}</span></section>
        <section class="lc298-stack"><header><strong>RECURSION STACK</strong><span>${stack.length} frame(s)</span></header><div>${stackHtml}</div></section>
      </aside>
    </div>
    <section class="lc298-chains"><article><header><strong>${vi ? "CHUỖI HIỆN TẠI" : "CURRENT CHAIN"}</strong><span>length = ${escapeHtml(numberText(view.currentLength))}</span></header><div>${chainHtml}</div></article><article class="best"><header><strong>${vi ? "CHUỖI TỐT NHẤT" : "BEST CHAIN"}</strong><span>longest = ${escapeHtml(numberText(view.longest))}</span></header><div>${bestHtml}</div></article></section>
    <section class="lc298-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="lc298-result ${final ? "done" : ""}"><small>LONGEST</small><strong>${final ? escapeHtml(numberText(view.answer)) : "…"}</strong><span>${final ? (vi ? `Chuỗi tốt nhất: ${bestChain.map(item => item.value).join(" → ") || "∅"}.` : `Best chain: ${bestChain.map(item => item.value).join(" → ") || "∅"}.`) : (vi ? "Mỗi nhánh giữ một bản length độc lập." : "Each branch receives an independent length value.")}</span></footer>
  </section>`;
  renderTree({ tree: step.tree }, "lc298Tree");
}

function renderVerticalOrder314View(step) {
  const view = step.verticalOrder314View || {};
  const vi = lang === "vi";
  const columns = Array.isArray(view.columns) ? view.columns : [];
  const queue = Array.isArray(view.queue) ? view.queue : [];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const phaseLabels = vi
    ? ["Khởi tạo", "Lấy khỏi queue", "Gom vào cột", "Thêm hai con", "Đọc kết quả"]
    : ["Initialize", "Dequeue", "Group by column", "Enqueue children", "Read result"];
  const phases = phaseLabels.map((label, index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const queueHtml = queue.length
    ? queue.map((item, index) => `<span class="${index === 0 ? "front" : ""}"><small>${index === 0 ? "FRONT" : `#${index + 1}`} · row ${escapeHtml(String(item.row))}</small><b>${escapeHtml(String(item.value))}</b><em>C${item.col >= 0 ? "+" : ""}${escapeHtml(String(item.col))}</em></span>`).join("<i>→</i>")
    : `<em>${vi ? "queue rỗng" : "empty queue"}</em>`;

  const columnHtml = columns.length
    ? columns.map((entry) => {
      const active = view.currentCol === entry.col;
      const values = Array.isArray(entry.values) ? entry.values : [];
      const valuesHtml = values.map((value, index) => `<span class="${view.appendedValue === value && index === values.length - 1 && active ? "new" : ""}"><small>${vi ? "thứ" : "order"} ${index + 1}</small><b>${escapeHtml(String(value))}</b></span>`).join("<i>↓</i>");
      return `<article class="${active ? "active" : ""}"><header><small>COLUMN</small><strong>${entry.col >= 0 ? "+" : ""}${escapeHtml(String(entry.col))}</strong></header><div>${valuesHtml}</div></article>`;
    }).join("")
    : `<em class="vo314-empty">${vi ? "Map columns còn rỗng — node đầu tiên sẽ được thêm sau khi popleft." : "The columns map is empty — the first node is added after popleft."}</em>`;

  const childSide = view.childSide === "left" ? (vi ? "CON TRÁI" : "LEFT CHILD") : (vi ? "CON PHẢI" : "RIGHT CHILD");
  const childHtml = view.childSide
    ? `<section class="vo314-child ${view.childExists ? "exists" : "missing"}"><small>${escapeHtml(childSide)}</small><strong>${view.childExists && view.child ? escapeHtml(String(view.child.value)) : "None"}</strong><code>${view.childSide === "left" ? "col - 1" : "col + 1"} = ${view.childCol === null ? "?" : escapeHtml(String(view.childCol))}</code><span>${view.childExists ? (vi ? "có node → thêm vào cuối queue" : "node exists → append to queue tail") : (vi ? "không có node → queue không đổi" : "no node → queue stays unchanged")}</span></section>`
    : `<section class="vo314-child idle"><small>${vi ? "QUY TẮC NODE CON" : "CHILD RULE"}</small><strong>LEFT −1 · RIGHT +1</strong><span>${vi ? "Cột được truyền cùng node trong queue." : "The column travels with the node in the queue."}</span></section>`;

  const result = Array.isArray(view.result) ? view.result : columns.map((entry) => entry.values);
  const resultHtml = result.length
    ? result.map((values, index) => `<span><small>C${columns[index] ? (columns[index].col >= 0 ? "+" : "") + columns[index].col : index}</small><b>[${(values || []).map(value => escapeHtml(String(value))).join(", ")}]</b></span>`).join("")
    : `<em>[]</em>`;
  const currentValue = view.current ? String(view.current.value) : "—";
  const currentCol = Number.isFinite(view.currentCol) ? `${view.currentCol >= 0 ? "+" : ""}${view.currentCol}` : "—";
  const currentRow = Number.isFinite(view.currentRow) ? String(view.currentRow) : "—";
  const final = Boolean(view.final);
  const summary = vi
    ? `Bài 314: BFS theo cột; node hiện tại ${currentValue}, queue có ${queue.length} node.`
    : `Problem 314: column-aware BFS; current node ${currentValue}, queue contains ${queue.length} node(s).`;

  $("treeView").innerHTML = `<section class="vo314-viz phase-${escapeHtml(view.phase || "initialize")}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>BFS · COLUMN MAP · #314</small><strong>${vi ? "DUYỆT CÂY THEO CỘT DỌC" : "BINARY TREE VERTICAL ORDER"}</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="vo314-phases">${phases}</div>
    <section class="vo314-rule"><strong>${vi ? "QUY TẮC CỘT" : "COLUMN RULE"}</strong><div><span>LEFT</span><code>col − 1</code></div><div><span>ROOT</span><code>col = 0</code></div><div><span>RIGHT</span><code>col + 1</code></div><em>${vi ? "BFS giữ đúng thứ tự trên ↓ dưới, rồi trái → phải khi cùng hàng." : "BFS preserves top ↓ bottom, then left → right on the same row."}</em></section>
    <div class="vo314-layout">
      <section class="vo314-tree-card"><header><strong>${vi ? "CÂY + NHÃN CỘT" : "TREE + COLUMN LABELS"}</strong><span>${vi ? "cam = current · xanh = trong queue" : "amber = current · blue = queued"}</span></header><div id="vo314Tree" class="vo314-tree"></div></section>
      <aside class="vo314-side">
        <section class="vo314-current"><div><small>CURRENT</small><strong>${escapeHtml(currentValue)}</strong></div><div><small>ROW</small><strong>${escapeHtml(currentRow)}</strong></div><div><small>COLUMN</small><strong>${escapeHtml(currentCol)}</strong></div></section>
        <section class="vo314-bounds"><header><strong>${vi ? "BIÊN CỘT" : "COLUMN BOUNDS"}</strong><span>${vi ? "để đọc trái → phải" : "for left → right output"}</span></header><div><code>min_col</code><b>${escapeHtml(String(view.minCol ?? 0))}</b><i>…</i><b>${escapeHtml(String(view.maxCol ?? 0))}</b><code>max_col</code></div></section>
        ${childHtml}
      </aside>
    </div>
    <section class="vo314-queue"><header><strong>QUEUE — FIFO</strong><span>${vi ? "lấy ở FRONT · thêm vào BACK" : "remove at FRONT · append at BACK"}</span></header><div>${queueHtml}</div></section>
    <section class="vo314-columns"><header><strong>columns[col]</strong><span>${vi ? "mỗi cột giữ nguyên thứ tự BFS" : "each column preserves BFS order"}</span></header><div>${columnHtml}</div></section>
    <section class="vo314-action"><small>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"} · ${escapeHtml(String(view.operation || ""))}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    <footer class="vo314-result ${final ? "done" : ""}"><strong>${vi ? "KẾT QUẢ TRÁI → PHẢI" : "LEFT → RIGHT RESULT"}</strong><div>${resultHtml}</div><span>${final ? (vi ? "Hoàn tất: đọc từ min_col đến max_col." : "Complete: read from min_col through max_col.") : (vi ? "Kết quả tạm thời; BFS vẫn đang chạy." : "Partial result while BFS is still running.")}</span></footer>
  </section>`;
  renderTree({ tree: step.tree }, "vo314Tree");
}

function renderUpsideDown156View(step) {
  const view = step.upsideDown156View || {};
  const vi = lang === "vi";
  const phaseIndex = Number(view.phaseIndex) || 0;
  const phases = [
    [vi ? "1 · Đi xuống trái" : "1 · Descend left", vi ? "tìm node cuối" : "find the last node"],
    [vi ? "2 · Base case" : "2 · Base case", vi ? "chọn gốc mới" : "choose new root"],
    [vi ? "3 · Quay lui" : "3 · Unwind", vi ? "đổi các cạnh" : "rewire edges"],
    [vi ? "4 · Hoàn tất" : "4 · Complete", vi ? "trả cây mới" : "return new tree"],
  ].map(([label, detail], index) => `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${escapeHtml(label)}</b><small>${escapeHtml(detail)}</small></span>`).join("");

  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stack.length
    ? stack.map((value, index) => `<span class="${index === stack.length - 1 ? "active" : ""}"><small>#${index + 1}</small><strong>${escapeHtml(value)}</strong></span>`).join("<i>→</i>")
    : `<em>${view.phase === "done" ? (vi ? "stack đã rỗng" : "stack is empty") : (vi ? "chưa gọi đệ quy" : "recursion has not started")}</em>`;

  const pivot = view.pivot;
  const value = item => item === null || item === undefined ? "∅" : escapeHtml(item);
  const rotationHtml = pivot ? `<section class="ud156-rotation ${view.operation === "rewired" ? "is-done" : ""}">
    <header><strong>${vi ? "PHÉP LẬT ĐANG XÉT" : "CURRENT LOCAL ROTATION"}</strong><span>${vi ? "chỉ 3 node thay đổi vai trò" : "only three nodes change roles"}</span></header>
    <div class="ud156-before">
      <small>${vi ? "TRƯỚC" : "BEFORE"}</small>
      <div class="ud156-parent"><span>${vi ? "cha cũ" : "old parent"}</span><strong>${value(pivot.parent)}</strong></div>
      <div class="ud156-children"><div><span>${vi ? "trái cũ" : "old left"}</span><strong>${value(pivot.left)}</strong></div><div><span>${vi ? "phải cũ" : "old right"}</span><strong>${value(pivot.right)}</strong></div></div>
    </div>
    <div class="ud156-turn"><b>↻</b><small>${vi ? "lật" : "turn"}</small></div>
    <div class="ud156-after">
      <small>${vi ? "SAU" : "AFTER"}</small>
      <div class="ud156-parent"><span>${vi ? "cha mới" : "new parent"}</span><strong>${value(pivot.left)}</strong></div>
      <div class="ud156-children"><div><span>${vi ? "con trái mới" : "new left"}</span><strong>${value(pivot.right)}</strong></div><div><span>${vi ? "con phải mới" : "new right"}</span><strong>${value(pivot.parent)}</strong></div></div>
    </div>
  </section>` : `<section class="ud156-concept">
    <div><small>${vi ? "CON TRÁI CŨ" : "OLD LEFT"}</small><strong>${vi ? "cha mới" : "new parent"}</strong></div><i>·</i>
    <div><small>${vi ? "CON PHẢI CŨ" : "OLD RIGHT"}</small><strong>${vi ? "con trái mới" : "new left"}</strong></div><i>·</i>
    <div><small>${vi ? "CHA CŨ" : "OLD PARENT"}</small><strong>${vi ? "con phải mới" : "new right"}</strong></div>
  </section>`;

  const currentValues = Array.isArray(view.currentValues) ? view.currentValues : [];
  const originalValues = Array.isArray(view.originalValues) ? view.originalValues : [];
  const formatValues = values => `[${values.map(item => item === null ? "null" : item).join(", ")}]`;
  const rotated = Array.isArray(view.rotated) ? view.rotated : [];
  const treeHeading = view.phase === "done"
    ? (vi ? "CÂY SAU KHI LẬT" : "UPSIDE-DOWN TREE")
    : view.phase === "rewire"
      ? (vi ? "CÂY ĐANG ĐƯỢC DỰNG TỪ GỐC MỚI" : "TREE GROWING FROM THE NEW ROOT")
      : (vi ? "CÂY BAN ĐẦU" : "ORIGINAL TREE");
  const summary = vi
    ? `LeetCode 156, pha ${view.phase || "intro"}, node hiện tại ${view.current ?? "không có"}, gốc mới ${view.newRoot ?? "chưa chọn"}.`
    : `LeetCode 156, ${view.phase || "intro"} phase, current node ${view.current ?? "none"}, new root ${view.newRoot ?? "not selected"}.`;

  $("treeView").innerHTML = `<section class="ud156-viz phase-${escapeHtml(view.phase || "intro")}" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>RECURSION · POINTER REWIRING · #156</small><strong>UPSIDE DOWN</strong></div><span>${view.newRoot === null || view.newRoot === undefined ? (vi ? "gốc mới: ?" : "new root: ?") : `${vi ? "gốc mới" : "new root"}: ${escapeHtml(view.newRoot)}`}</span></header>
    <div class="ud156-phases">${phases}</div>
    <section class="ud156-rule"><b>${vi ? "NHỚ 1 CÂU" : "ONE RULE"}</b><strong>${vi ? "Đi xuống bằng cạnh trái, đổi cạnh khi quay lui." : "Descend through left edges; rewire while unwinding."}</strong></section>
    ${rotationHtml}
    <div class="ud156-layout">
      <section class="ud156-tree-panel"><header><strong>${escapeHtml(treeHeading)}</strong><span>${vi ? "cam = đang đổi · xanh = đã gắn vào cây mới" : "amber = changing · green = attached to the new tree"}</span></header><div id="ud156Tree" class="ud156-tree"></div></section>
      <aside class="ud156-side">
        <section class="ud156-stack"><header><strong>RECURSION STACK</strong><span>${vi ? "đi trái →, quay lui ←" : "descend →, unwind ←"}</span></header><div>${stackHtml}</div></section>
        <section class="ud156-progress"><small>${vi ? "CHA ĐÃ LẬT" : "ROTATED PARENTS"}</small><strong>${rotated.length ? rotated.join(" → ") : "—"}</strong><span>${vi ? `${rotated.length} phép lật hoàn tất` : `${rotated.length} rotations complete`}</span></section>
        <section class="ud156-state"><div><small>${vi ? "BAN ĐẦU" : "ORIGINAL"}</small><code>${escapeHtml(formatValues(originalValues))}</code></div><div><small>${vi ? "HIỆN TẠI" : "CURRENT"}</small><code>${escapeHtml(formatValues(currentValues))}</code></div></section>
      </aside>
    </div>
    <footer class="${step.final ? "done" : ""}"><small>${vi ? "Ý NGHĨA BƯỚC NÀY" : "WHY THIS STEP MATTERS"}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></footer>
  </section>`;
  renderTree({ tree: step.tree }, "ud156Tree");
}

function renderTwoSum653View(step) {
  const view = step.twoSum653View || {};
  const values = Array.isArray(view.values) ? view.values : [];
  const left = Number.isInteger(view.left) ? view.left : -1;
  const right = Number.isInteger(view.right) ? view.right : -1;
  const hasPair = left >= 0 && right >= 0 && Number.isFinite(view.sum);
  const vi = lang === "vi";
  const cells = values.map((value, index) => {
    const roles = [index === left ? "left" : "", index === right ? "right" : ""].filter(Boolean);
    const pointer = index === left && index === right ? "L/R" : index === left ? "L" : index === right ? "R" : "";
    return `<div class="ts653-cell ${roles.join(" ")}"><small>${index}</small><strong>${escapeHtml(value)}</strong>${pointer ? `<em>${pointer}</em>` : ""}</div>`;
  }).join("");
  const equation = hasPair
    ? view.sum === view.target
      ? `${values[left]} + ${values[right]} = ${view.target} ✓`
      : `${values[left]} + ${values[right]} = ${view.sum} ${view.sum < view.target ? "<" : ">"} k = ${view.target}`
    : (vi ? `target k = ${view.target}` : `target k = ${view.target}`);
  $("treeView").innerHTML = `<section class="ts653-viz">
    <header><strong>${vi ? "INORDER → HAI CON TRỎ" : "INORDER → TWO POINTERS"}</strong><span>${vi ? "mảng tăng dần" : "sorted values"}</span></header>
    <div class="ts653-array">${cells || "∅"}</div>
    <div class="ts653-equation">${escapeHtml(equation)}</div>
    <div class="ts653-tree"><div id="twoSum653Tree"></div></div>
  </section>`;
  renderTree({ tree: step.tree }, "twoSum653Tree");
}

function renderTwoSumIIView(step) {
  const view = step.twoSumIIView || {};
  const values = Array.isArray(view.values) ? view.values : [];
  const left = Number.isInteger(view.left) ? view.left : -1;
  const right = Number.isInteger(view.right) ? view.right : -1;
  const discardedLeft = new Set(view.discardedLeft || []);
  const discardedRight = new Set(view.discardedRight || []);
  const vi = lang === "vi";
  const decision = view.decision || "start";
  const movedFrom = Number.isInteger(view.movedFrom) ? view.movedFrom : null;
  const isComparison = Number.isFinite(view.sum);
  const relation = isComparison ? (view.sum === view.target ? "=" : view.sum < view.target ? "<" : ">") : "";
  const cells = values.map((value, index) => {
    const classes = ["ts167-cell"];
    if (discardedLeft.has(index) || discardedRight.has(index)) classes.push("discarded");
    if (index === left) classes.push("left");
    if (index === right) classes.push("right");
    if (view.found && (index === left || index === right)) classes.push("found");
    const pointers = [index === left ? "L" : "", index === right ? "R" : ""].filter(Boolean).join("/");
    const state = discardedLeft.has(index) ? (vi ? "loại: quá nhỏ" : "discarded: too small") : discardedRight.has(index) ? (vi ? "loại: quá lớn" : "discarded: too large") : index >= left && index <= right ? (vi ? "còn xét" : "still possible") : "";
    return `<div class="${classes.join(" ")}"><div class="ts167-pointer">${pointers ? `<b>${pointers}</b><i>▼</i>` : ""}</div><small>index ${index + 1}</small><strong>${escapeHtml(value)}</strong><em>${escapeHtml(state)}</em></div>`;
  }).join("");
  const equation = isComparison
    ? `${values[left]} + ${values[right]} = ${view.sum} ${relation} ${view.target}${view.found ? " ✓" : ""}`
    : `target = ${view.target}`;
  const rule = decision === "advance-left"
    ? (vi ? `left đã tăng; index ${movedFrom + 1} bị loại vì tổng luôn quá nhỏ.` : `left advanced; index ${movedFrom + 1} is discarded because every sum stays too small.`)
    : decision === "advance-right"
      ? (vi ? `right đã giảm; index ${movedFrom + 1} bị loại vì tổng luôn quá lớn.` : `right decreased; index ${movedFrom + 1} is discarded because every sum stays too large.`)
      : decision === "check-loop"
        ? (view.condition ? (vi ? "Điều kiện đúng: cửa sổ còn một cặp để thử." : "Condition is true: the window still contains a pair to test.") : (vi ? "Điều kiện sai: hai con trỏ đã gặp nhau." : "Condition is false: the pointers have met."))
        : decision === "check-target"
          ? (view.condition ? (vi ? "Điều kiện đúng: trả về hai chỉ số 1-based." : "Condition is true: return the two 1-based indices.") : (vi ? "Điều kiện sai: chưa tìm thấy đáp án." : "Condition is false: the answer is not found yet."))
          : decision === "check-smaller"
            ? (view.condition ? (vi ? "Điều kiện đúng: tổng quá nhỏ, nên tăng left." : "Condition is true: the sum is too small, so advance left.") : (vi ? "Điều kiện sai: tổng quá lớn, nên giảm right." : "Condition is false: the sum is too large, so decrease right."))
            : decision === "else"
              ? (vi ? "Đi vào else: chuẩn bị giảm right." : "Enter else: prepare to decrease right.")
              : decision === "compute"
                ? (vi ? "Đã tính total từ hai biên hiện tại." : "Calculated total from the current two boundaries.")
                : decision === "move-left"
    ? (vi ? `L++ · loại index ${left + 1}: ghép với mọi số còn lại cũng không đủ target.` : `L++ · discard index ${left + 1}: pairing it with every remaining number is still below target.`)
    : decision === "move-right"
      ? (vi ? `R-- · loại index ${right + 1}: ghép với mọi số còn lại vẫn vượt target.` : `R-- · discard index ${right + 1}: pairing it with every remaining number still exceeds target.`)
      : decision === "found"
        ? (vi ? `Đáp án 1-based: [${left + 1}, ${right + 1}]` : `1-based answer: [${left + 1}, ${right + 1}]`)
        : decision === "not-found"
          ? (vi ? "Không còn cặp nào trong cửa sổ." : "No pair remains in the window.")
          : (vi ? "L và R đánh dấu hai biên duy nhất cần kiểm tra." : "L and R mark the only two boundaries that need checking.");
  const summary = vi
    ? `Two Sum II, target ${view.target}; L tại index ${left + 1}, R tại index ${right + 1}. ${rule}`
    : `Two Sum II, target ${view.target}; L at index ${left + 1}, R at index ${right + 1}. ${rule}`;
  $("treeView").innerHTML = `<section class="ts167-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><div><small>TWO POINTERS · SORTED ARRAY · #167</small><strong>${vi ? "CHỈ LOẠI BỎ KHI ĐÃ CÓ BẰNG CHỨNG" : "DISCARD ONLY WHEN PROVEN"}</strong></div><span>target = ${escapeHtml(view.target)}</span></header>
    <section class="ts167-window"><header><strong>${vi ? "CỬA SỔ CÒN KHẢ THI" : "STILL-POSSIBLE WINDOW"}</strong><span>${left < right ? `[${left + 1} … ${right + 1}]` : "∅"}</span></header><div class="ts167-array">${cells || "∅"}</div></section>
    <section class="ts167-check"><div><small>numbers[L]</small><strong>${left >= 0 ? escapeHtml(values[left]) : "—"}</strong></div><b>+</b><div><small>numbers[R]</small><strong>${right >= 0 ? escapeHtml(values[right]) : "—"}</strong></div><b>=</b><div class="sum"><small>sum</small><strong>${isComparison ? escapeHtml(view.sum) : "—"}</strong></div><b>${relation || "?"}</b><div class="target"><small>target</small><strong>${escapeHtml(view.target)}</strong></div></section>
    <div class="ts167-rule ${decision}">${escapeHtml(rule)}</div>
    <div class="ts167-legend"><span><i class="left"></i>L: ${vi ? "biên nhỏ nhất còn lại" : "smallest remaining"}</span><span><i class="right"></i>R: ${vi ? "biên lớn nhất còn lại" : "largest remaining"}</span><span><i class="discarded"></i>${vi ? "đã loại bằng tính tăng dần" : "discarded by sortedness"}</span></div>
  </section>`;
}

function renderTwoSum653HashView(step) {
  const view = step.twoSum653HashView || {};
  const vi = lang === "vi";
  const seen = Array.isArray(view.seen) ? view.seen : [];
  const hasCurrent = Number.isFinite(view.current) && Number.isFinite(view.need);
  const hasMatch = hasCurrent && seen.includes(view.need);
  const pair = Array.isArray(view.pair) ? view.pair : null;
  const status = pair
    ? `${pair[0]} + ${pair[1]} = ${view.target} ✓`
    : hasCurrent
      ? `${view.target} − ${view.current} = ${view.need} ${hasMatch ? "∈" : "∉"} seen`
      : (vi ? "Chờ DFS chọn node" : "Waiting for DFS to choose a node");
  const chips = seen.length
    ? seen.map((value) => `<span class="ts653h-chip ${value === view.need ? "needed" : ""}">${escapeHtml(String(value))}</span>`).join("")
    : `<em>${vi ? "∅ · chưa có node đã duyệt" : "∅ · no earlier nodes"}</em>`;
  const phase = {
    init: vi ? "khởi tạo" : "initialize",
    check: vi ? "kiểm tra complement" : "check complement",
    add: vi ? "thêm vào seen" : "add to seen",
    left: vi ? "DFS trái" : "DFS left",
    right: vi ? "DFS phải" : "DFS right",
    found: vi ? "đã tìm thấy" : "found",
    result: vi ? "kết quả" : "result",
  }[view.phase] || view.phase || "—";
  $("treeView").innerHTML = `<section class="ts653h-viz">
    <header><strong>${vi ? "DFS → HASH SET" : "DFS → HASH SET"}</strong><span>${escapeHtml(phase)}</span></header>
    <section class="ts653h-check"><div><small>${vi ? "NODE HIỆN TẠI" : "CURRENT NODE"}</small><strong>${view.current ?? "—"}</strong></div><b>→</b><div><small>${vi ? "CẦN TÌM" : "NEED"}</small><strong>${view.need ?? "—"}</strong></div><b>→</b><div class="result"><small>seen?</small><strong>${hasCurrent ? (hasMatch ? "YES" : "NO") : "—"}</strong></div></section>
    <section class="ts653h-seen"><header><strong>seen</strong><span>${vi ? "chỉ gồm node đã duyệt trước đó" : "only earlier DFS nodes"}</span></header><div>${chips}</div></section>
    <div class="ts653h-equation">${escapeHtml(status)}</div>
    <div class="ts653h-tree"><div id="twoSum653HashTree"></div></div>
  </section>`;
  renderTree({ tree: step.tree }, "twoSum653HashTree");
}

function renderTree(step, targetId = "treeView") {
  if (step.insufficient1080View && targetId === "treeView") {
    renderInsufficient1080View(step);
    return;
  }
  if (step.pathSumView && targetId === "treeView") {
    const view = step.pathSumView || {};
    const vi = lang === "vi";
    const phaseLabels = {
      intro: vi ? "Quy tắc" : "Rule",
      "call-root": vi ? "Gọi root" : "Call root",
      enter: vi ? "Vào hàm" : "Enter call",
      "check-null": vi ? "Kiểm tra None" : "Check None",
      "return-null": vi ? "None trả False" : "None returns False",
      subtract: vi ? "Trừ giá trị node" : "Subtract node value",
      "check-leaf": vi ? "Kiểm tra lá" : "Check leaf",
      "return-leaf": vi ? "Lá trả kết quả" : "Leaf returns result",
      "call-left": vi ? "Gọi trái" : "Call left",
      "left-return": vi ? "Trái trả về" : "Left returned",
      "call-right": vi ? "Gọi phải" : "Call right",
      "return-right": vi ? "Phải trả về" : "Right returned",
      "short-circuit": vi ? "Short-circuit" : "Short-circuit",
      done: vi ? "Hoàn tất" : "Complete",
    };
    const phase = phaseLabels[view.phase] || view.phase || "—";
    const stack = Array.isArray(view.stack) ? view.stack : [];
    const stackHtml = stack.length
      ? stack.map((frame, index) => `<li class="ps112-frame${index === stack.length - 1 ? " active" : ""}">
          <span>#${index + 1}</span><strong>${escapeHtml(frame.value === null ? "None" : frame.value)}</strong>
          <small>${escapeHtml(`target=${frame.target} · remain=${frame.remaining === null ? "—" : frame.remaining}`)}</small>
          <em>${escapeHtml(frame.stage || "")}</em>
        </li>`).join("")
      : `<li class="ps112-empty">${vi ? "Stack rỗng: lời gọi root đã return." : "Empty stack: the root call has returned."}</li>`;
    const activePath = Array.isArray(view.activePath) && view.activePath.length ? view.activePath.join(" → ") : "—";
    const successPath = Array.isArray(view.successfulPath) && view.successfulPath.length ? view.successfulPath.join(" → ") : (vi ? "chưa tìm thấy" : "not found yet");
    const nextText = view.nextCall
      ? `${view.nextCall.side} → ${view.nextCall.value === null ? "None" : view.nextCall.value} · target=${view.nextCall.target}`
      : (view.shortCircuit ? (vi ? "Nhánh phải bị bỏ qua" : "Right branch is skipped") : (vi ? "không có lời gọi chờ" : "no pending call"));
    const remaining = view.remaining === undefined ? "—" : view.remaining;
    const leafDecision = view.isLeaf === undefined ? "—" : view.isLeaf ? (vi ? "LÁ" : "LEAF") : (vi ? "chưa phải lá" : "not a leaf");
    const result = view.returnValue === undefined ? "—" : String(view.returnValue);
    const target = $(targetId);
    target.innerHTML = `<div class="ps112-viz">
      <section class="ps112-rule"><strong>${vi ? "ĐIỀU KIỆN TRUE" : "TRUE CONDITION"}</strong><code>leaf and remaining == 0</code><span>${vi ? "Không phải lá thì phải tiếp tục DFS. `or` dừng sớm khi nhánh trái là True." : "A non-leaf must keep searching. `or` short-circuits once the left branch is True."}</span></section>
      <div class="ps112-layout">
        <section class="ps112-tree-card"><header><strong>${vi ? "CÂY VÀ KẾT QUẢ CÁC LỜI GỌI" : "TREE AND CALL RESULTS"}</strong><span>${vi ? "cam = đang chạy · xanh = True · đỏ = False" : "amber = running · green = True · red = False"}</span></header><div id="ps112Tree" class="ps112-tree"></div></section>
        <aside class="ps112-side">
          <section class="ps112-phase"><span>${vi ? "PHA HIỆN TẠI" : "CURRENT PHASE"}</span><strong>${escapeHtml(phase)}</strong><small>${view.current ? `${vi ? "node" : "node"} ${view.current.value}` : "—"}</small></section>
          <section class="ps112-state"><div><span>target</span><strong>${escapeHtml(view.target === undefined ? "—" : view.target)}</strong></div><div><span>remaining</span><strong>${escapeHtml(remaining)}</strong></div><div><span>${vi ? "trạng thái" : "state"}</span><strong>${escapeHtml(leafDecision)}</strong></div></section>
          <section class="ps112-path"><span>${vi ? "ĐƯỜNG ĐANG XÉT" : "ACTIVE PATH"}</span><strong>${escapeHtml(activePath)}</strong><small>${vi ? "ĐƯỜNG TÌM ĐƯỢC" : "FOUND PATH"}: ${escapeHtml(successPath)}</small></section>
          <section class="ps112-stack"><header><strong>CALL STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
          <section class="ps112-branch"><div><span>left</span><strong>${escapeHtml(view.leftResult === undefined ? "—" : view.leftResult)}</strong></div><div><span>right</span><strong>${escapeHtml(view.rightResult === undefined ? "—" : view.rightResult)}</strong></div><div><span>return</span><strong>${escapeHtml(result)}</strong></div></section>
          <section class="ps112-next${view.shortCircuit ? " skipped" : ""}"><span>${view.shortCircuit ? (vi ? "SHORT-CIRCUIT" : "SHORT-CIRCUIT") : (vi ? "LỜI GỌI TIẾP THEO" : "NEXT CALL")}</span><strong>${escapeHtml(nextText)}</strong></section>
        </aside>
      </div>
    </div>`;
    renderTree(step, "ps112Tree");
    return;
  }
  if (step.maxDepthView && targetId === "treeView") {
    const view = step.maxDepthView || {};
    const vi = lang === "vi";
    const phaseLabels = {
      intro: vi ? "Quy tắc" : "Rule",
      "call-root": vi ? "Gọi root" : "Call root",
      enter: vi ? "Vào hàm" : "Enter call",
      "check-base": vi ? "Kiểm tra base case" : "Check base case",
      "return-null": vi ? "None trả 0" : "None returns 0",
      "call-left": vi ? "Gọi trái" : "Call left",
      "left-return": vi ? "Trái trả về" : "Left returned",
      "call-right": vi ? "Gọi phải" : "Call right",
      "right-return": vi ? "Phải trả về" : "Right returned",
      compute: vi ? "Tính công thức" : "Compute formula",
      "return-node": vi ? "Trả về cha" : "Return to parent",
      done: vi ? "Hoàn tất" : "Complete",
    };
    const phase = phaseLabels[view.phase] || view.phase || "—";
    const stack = Array.isArray(view.stack) ? view.stack : [];
    const stackHtml = stack.length
      ? stack.map((frame, index) => `<li class="md104-frame${index === stack.length - 1 ? " active" : ""}">
          <span>#${index + 1}</span><strong>${escapeHtml(frame.value === null ? "None" : frame.value)}</strong>
          <small>${escapeHtml((vi ? "level " : "level ") + frame.level + " · " + (frame.side || "root"))}</small>
          <em>${escapeHtml(frame.stage || "")}</em>
        </li>`).join("")
      : `<li class="md104-stack-empty">${vi ? "Stack rỗng: tất cả lời gọi đã return." : "Empty stack: every call has returned."}</li>`;
    const currentText = view.current
      ? `${vi ? "node" : "node"} ${view.current.value} · ${vi ? "level" : "level"} ${view.currentLevel}`
      : (view.phase === "return-null" ? "None" : (vi ? "chưa có / đã xong" : "not started / complete"));
    const nextText = view.nextCall
      ? `${view.nextCall.side} → ${view.nextCall.value === null ? "None" : view.nextCall.value} (${vi ? "level" : "level"} ${view.nextCall.level})`
      : (vi ? "không có lời gọi tiếp theo" : "no pending call");
    const left = view.leftDepth === undefined ? "—" : view.leftDepth;
    const right = view.rightDepth === undefined ? "—" : view.rightDepth;
    const formula = view.formula || (vi ? "Chờ hai nhánh trả về." : "Waiting for both branches to return.");
    const maxBefore = view.visualMaxBefore === undefined ? "—" : view.visualMaxBefore;
    const maxAfter = view.visualMaxAfter === undefined ? "—" : view.visualMaxAfter;
    const updateText = view.maxUpdated
      ? (vi ? "CẬP NHẬT" : "UPDATED")
      : (view.visualMaxAfter === undefined ? (vi ? "chưa tính" : "not computed") : (vi ? "không đổi" : "unchanged"));
    const target = $(targetId);
    target.innerHTML = `<div class="md104-viz">
      <section class="md104-rule">
        <strong>${vi ? "CÔNG THỨC CỦA MỖI NODE" : "EVERY NODE'S FORMULA"}</strong>
        <code>depth(node) = 1 + max(depth(left), depth(right))</code>
        <span>${vi ? "Base case: None → 0 · lá → 1 · tính hậu tự từ dưới lên" : "Base case: None → 0 · leaf → 1 · postorder, bottom-up"}</span>
      </section>
      <div class="md104-layout">
        <section class="md104-tree-card"><header><strong>${vi ? "CÂY VÀ GIÁ TRỊ ĐÃ TRẢ" : "TREE AND RETURNED VALUES"}</strong><span>${vi ? "cam = lời gọi hiện tại · xanh = đã return" : "amber = active call · green = returned"}</span></header><div id="md104Tree" class="md104-tree"></div></section>
        <aside class="md104-side">
          <section class="md104-phase"><span>${vi ? "PHA HIỆN TẠI" : "CURRENT PHASE"}</span><strong>${escapeHtml(phase)}</strong><small>${escapeHtml(currentText)}</small></section>
          <section class="md104-call"><span>${vi ? "LỜI GỌI TIẾP THEO" : "NEXT CALL"}</span><strong>${escapeHtml(nextText)}</strong></section>
          <section class="md104-stack"><header><strong>${vi ? "CALL STACK" : "CALL STACK"}</strong><span>${vi ? "dòng cuối là active" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
          <section class="md104-returns"><div><span>left</span><strong>${escapeHtml(left)}</strong></div><div><span>right</span><strong>${escapeHtml(right)}</strong></div><div><span>${vi ? "return" : "return"}</span><strong>${escapeHtml(view.returnDepth === undefined ? "—" : view.returnDepth)}</strong></div></section>
          <section class="md104-formula"><span>${vi ? "CÔNG THỨC / QUYẾT ĐỊNH" : "FORMULA / DECISION"}</span><code>${escapeHtml(formula)}</code></section>
          <section class="md104-meter${view.maxUpdated ? " updated" : ""}"><span>${vi ? "TALLEST SEEN (chỉ để minh họa)" : "TALLEST SEEN (visual aid only)"}</span><strong>${escapeHtml(maxBefore)} → ${escapeHtml(maxAfter)}</strong><em>${escapeHtml(updateText)}</em></section>
        </aside>
      </div>
    </div>`;
    renderTree(step, "md104Tree");
    return;
  }
  const nodes = step.tree.nodes;
  const arrowId = `tree-arrow-${String(targetId).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const treeAnnotations = step.tree.annotations || {}; // { nodeId: "label" | { label, kind } }
  const annotationItems = (annotation) => {
    if (annotation && typeof annotation === "object" && Array.isArray(annotation.labels)) {
      return annotation.labels.map((item) => (
        item && typeof item === "object"
          ? { label: item.label, kind: item.kind || "" }
          : { label: item, kind: "" }
      ));
    }
    if (annotation && typeof annotation === "object") {
      return [{ label: annotation.label, kind: annotation.kind || "" }];
    }
    return annotation === undefined ? [] : [{ label: annotation, kind: "" }];
  };
  const minX = Math.min(0, ...nodes.map((n) => n.x));
  const maxX = Math.max(0, ...nodes.map((n) => n.x));
  const maxY = Math.max(0, ...nodes.map((n) => n.y));
  const hasMultiLineLabels = nodes.some((n) => Array.isArray(n.labelLines) && n.labelLines.length > 1);
  const hasSubLabels = nodes.some((n) => n.sub !== undefined && n.sub !== null);
  const isBstIteratorTree = targetId === "bstiTree";
  const r = hasMultiLineLabels ? (isBstIteratorTree ? 32 : 30) : 18;
  // For single-line labels, widen the node into a pill shape when the text
  // wouldn't fit in a plain circle (e.g. "-1, leetcode"), instead of shrinking
  // the font until it's unreadable.
  const charW = 7.6;
  const hPad = 14;
  const maxHalfWidth = hasMultiLineLabels
    ? r
    : Math.max(r, ...nodes.map((n) => (String(n.label || "").length * charW) / 2 + hPad));
  const maxAnnotationLines = Math.max(0, ...nodes.map((n) => annotationItems(treeAnnotations[n.id]).length));
  const maxAnnotationHalfWidth = Math.max(0, ...nodes.flatMap((n) => (
    annotationItems(treeAnnotations[n.id]).map((item) => String(item.label ?? "").length * 6.6 / 2)
  )));
  // Sub-labels are centered under the node; include their width so edge nodes
  // (leftmost/rightmost) are not clipped by the SVG bounds.
  const maxSubHalfWidth = Math.max(0, ...nodes.map((n) => (
    n.sub !== undefined && n.sub !== null ? String(n.sub).length * 6 / 2 : 0
  )));
  const colW = hasMultiLineLabels ? (isBstIteratorTree ? 96 : 84) : Math.max(60, maxHalfWidth * 2 + 14);
  const annotationExtra = Math.max(0, maxAnnotationLines - 1) * 14;
  const rowH = (hasMultiLineLabels ? (isBstIteratorTree ? 104 : 96) : 78) + (hasSubLabels ? 16 : 0) + annotationExtra;
  const naturalBasePad = hasMultiLineLabels
    ? Math.max(44, maxAnnotationHalfWidth + 6, maxSubHalfWidth + 6)
    : Math.max(34, maxHalfWidth + 4, maxAnnotationHalfWidth + 6, maxSubHalfWidth + 6);
  const basePad = Math.max(naturalBasePad, maxAnnotationLines ? r + 18 + annotationExtra : 0);
  const showLevelLabels = step.tree.showLevels !== false && maxY > 0;
  const configuredLevelGutter = Number(step.tree.levelLabelGutter);
  const leftGutter = showLevelLabels
    ? Math.max(52, Number.isFinite(configuredLevelGutter) ? configuredLevelGutter : 52)
    : 0;
  const width = basePad * 2 + leftGutter + (maxX - minX) * colW;
  const height = basePad * 2 + maxY * rowH + (hasSubLabels ? 12 : 0);
  const px = (x) => basePad + leftGutter + (x - minX) * colW;
  const py = (y) => basePad + y * rowH;

  const pos = {};
  nodes.forEach((n) => {
    pos[n.id] = { x: px(n.x), y: py(n.y) };
  });

  // Per-node horizontal half-width (pill radius); vertical stays r.
  const hw = {};
  nodes.forEach((n) => {
    hw[n.id] = hasMultiLineLabels ? r : Math.max(r, (String(n.label || "").length * charW) / 2 + hPad);
  });

  let edges = "";
  nodes.forEach((n) => {
    if (n.parentId === null || n.parentId === undefined) return;
    const p = pos[n.parentId];
    const c = pos[n.id];
    if (!p) return;
    // Shorten line so arrowhead doesn't overlap the node shape
    const dx = c.x - p.x, dy = c.y - p.y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const ux = dx/len, uy = dy/len;
    const x1 = p.x + ux * (r + 2), y1 = p.y + uy * (r + 2);
    const x2 = c.x - ux * (r + 4), y2 = c.y - uy * (r + 4);
    edges += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="tree-edge${n.isNull ? " null-edge" : ""}" marker-end="url(#${arrowId})" />`;
  });

  let circles = "";
  nodes.forEach((n) => {
    const c = pos[n.id];
    const nodeHw = hw[n.id];
    const isPill = nodeHw > r + 0.5;
    const cls = "tree-node" + (n.hl ? " hl" : "") + (n.isWord ? " word" : "") + (n.isPruned ? " pruned" : "") + (n.isNull ? " null" : "");
    circles += `<g class="${cls}">`;
    if (isPill) {
      if (n.isWord) circles += `<rect x="${c.x - nodeHw - 4}" y="${c.y - r - 4}" width="${(nodeHw + 4) * 2}" height="${(r + 4) * 2}" rx="${r + 4}" class="tree-ring" />`;
      circles += `<rect x="${c.x - nodeHw}" y="${c.y - r}" width="${nodeHw * 2}" height="${r * 2}" rx="${r}" />`;
    } else {
      if (n.isWord) circles += `<circle cx="${c.x}" cy="${c.y}" r="${r + 4}" class="tree-ring" />`;
      circles += `<circle cx="${c.x}" cy="${c.y}" r="${r}" />`;
    }
    if (Array.isArray(n.labelLines) && n.labelLines.length > 0) {
      const lineGap = isBstIteratorTree ? 12 : 11;
      const labelFontSize = isBstIteratorTree ? 10.5 : 9.5;
      const firstY = c.y - ((n.labelLines.length - 1) * lineGap) / 2;
      circles += `<text x="${c.x}" y="${firstY}" text-anchor="middle" font-size="${labelFontSize}">`;
      n.labelLines.forEach((line, index) => {
        circles += `<tspan x="${c.x}" dy="${index === 0 ? 0 : lineGap}">${escapeXml(line)}</tspan>`;
      });
      circles += `</text>`;
    } else {
      circles += `<text x="${c.x}" y="${c.y}" dy="0.35em" text-anchor="middle">${escapeXml(n.label)}</text>`;
    }
    // Annotation above node (e.g. "l1", "l2", "cur", "slow")
    if (treeAnnotations[n.id] !== undefined) {
      const annotation = treeAnnotations[n.id];
      const items = annotationItems(annotation);
      const isRichAnnotation = annotation && typeof annotation === "object";
      const color = n.hl ? "#f59e0b" : n.isWord ? "#22c55e" : "#6366f1";
      const firstY = c.y - r - 7 - Math.max(0, items.length - 1) * 14;
      items.forEach((item, index) => {
        const annotationKind = String(item.kind || "").replace(/[^a-zA-Z0-9_-]/g, "");
        const annotationClass = `tree-annotation${annotationKind ? ` ${annotationKind}` : ""}`;
        const fill = isRichAnnotation ? "" : ` fill="${color}"`;
        circles += `<text x="${c.x}" y="${firstY + index * 14}" text-anchor="middle" class="${annotationClass}"${fill}>${escapeXml(item.label)}</text>`;
      });
    }
    // Sub-label below node (e.g. heap array index)
    if (n.sub !== undefined && n.sub !== null) {
      circles += `<text x="${c.x}" y="${c.y + r + 14}" text-anchor="middle" class="tree-sub">${escapeXml(n.sub)}</text>`;
    }
    circles += `</g>`;
  });

  // Level labels ("Level 0", "Level 1", ...) on the left edge of each row,
  // only rendered when the tree has more than one row (skip trivial trees).
  let levelLabels = "";
  if (showLevelLabels) {
    const rowsPresent = [...new Set(nodes.map((n) => n.y))].sort((a, b) => a - b);
    rowsPresent.forEach((y) => {
      const labelY = py(y);
      levelLabels += `<text x="6" y="${labelY}" dy="0.35em" text-anchor="start" class="tree-level-label">Level ${y}</text>`;
    });
  }

  const treeHtml =
    `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="tree-svg${width <= 520 ? " tree-svg-fit" : ""}${step.lcaDeepestView ? " lca-deepest-tree" : ""}${step.maxDepthView ? " md104-tree-svg" : ""}">` +
    `<defs><marker id="${arrowId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" class="tree-arrow"/></marker></defs>` +
    edges +
    circles +
    levelLabels +
    `</svg>`;

  const decisionHeader = step.tree.decisionTree || targetId === "decisionTreeView"
    ? `<div class="decision-tree-header">
        <strong>${lang === "vi" ? "Cây quyết định" : "Decision tree"}</strong>
        <span class="decision-tree-legend">
          <i class="dt-current"></i>${lang === "vi" ? "đang chạy" : "current"}
          <i class="dt-answer"></i>${lang === "vi" ? "đáp án" : "answer"}
          <i class="dt-pruned"></i>${lang === "vi" ? "prune / không hợp lệ" : "pruned / invalid"}
        </span>
        ${step.tree.truncated ? `<small>${lang === "vi" ? "Hiển thị 140 node đầu" : "Showing first 140 nodes"}</small>` : ""}
      </div>`
    : "";
  const distanceKGuide = step.distanceKView ? distanceKGuideHtml(step.distanceKView) : "";
  const lcaDeepestGuide = step.lcaDeepestView ? lcaDeepestGuideHtml(step.lcaDeepestView) : "";
  const rightSideBfsGuide = step.rightSideBfsView ? rightSideBfsGuideHtml(step.rightSideBfsView) : "";
  const rightSideDfsGuide = step.rightSideDfsView ? rightSideDfsGuideHtml(step.rightSideDfsView) : "";
  $(targetId).innerHTML = decisionHeader + distanceKGuide + lcaDeepestGuide + rightSideBfsGuide + rightSideDfsGuide + (step.queueView
    ? `<div class="tree-queue-layout${step.queueView.layout === "stacked" ? " tree-queue-stacked" : ""}">
        <div class="tree-queue-tree">${treeHtml}</div>
        <div class="tree-queue-panel">${queueViewHtml(step.queueView, true)}</div>
      </div>`
    : treeHtml);
}

function renderPalindromePathView(step) {
  const view = step.palPathView || {};
  const vi = lang === "vi";
  const current = view.current;
  const phase = view.phase || "idea";
  const phaseOrder = ["idea", "build", "rule", "count", "store", "done"];
  const phaseIndex = Math.max(0, phaseOrder.indexOf(phase));
  const phaseLabels = vi
    ? ["1 · Ý tưởng parity", "2 · Tính mask từ root", "3 · Quy tắc XOR", "4 · Đếm cặp", "5 · Lưu counter", "6 · Kết quả"]
    : ["1 · Parity idea", "2 · Build masks", "3 · XOR rule", "4 · Count pairs", "5 · Store counter", "6 · Result"];
  const phases = phaseLabels.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // A letter-parity row is far easier to read than a raw 26-bit integer.
  const parityHtml = (parity, extraClass) => {
    if (!Array.isArray(parity) || !parity.length) return `<span class="pal2791-parity-empty">∅</span>`;
    return `<span class="pal2791-parity ${extraClass || ""}">${parity.map((cell) => `<b class="${cell.odd ? "odd" : "even"}">${escapeHtml(cell.letter)}<i>${cell.odd ? "1" : "0"}</i></b>`).join("")}</span>`;
  };

  const xorStep = view.xorStep;
  const lookups = Array.isArray(view.lookups) ? view.lookups : [];
  const counter = Array.isArray(view.counter) ? view.counter : [];
  const pairsFound = Array.isArray(view.pairsFound) ? view.pairsFound : [];
  const allPairsList = Array.isArray(view.allPairsList) ? view.allPairsList : [];
  const recentPairs = Array.isArray(view.recentPairs) ? view.recentPairs : [];

  const ruleCard = `<section class="pal2791-rule">
    <strong>${vi ? "QUY TẮC" : "RULE"}</strong>
    <div class="pal2791-rule-cases">
      <span class="even"><b>0</b>${vi ? "chữ lẻ → palindrome chẵn" : "odd letters → even palindrome"}<em>abba</em></span>
      <span class="one"><b>1</b>${vi ? "chữ lẻ → chữ đó ở giữa" : "odd letter → it sits in the middle"}<em>aba</em></span>
      <span class="bad"><b>≥2</b>${vi ? "chữ lẻ → không thể" : "odd letters → impossible"}<em>aabb✗</em></span>
    </div>
    <code>path(u,v) = mask[u] XOR mask[v]</code>
  </section>`;

  let focusHtml;
  if (phase === "build" && xorStep) {
    const waitingForMask = xorStep.stage === "bit";
    focusHtml = `<section class="pal2791-xor">
      <small>${vi ? "TÍNH MASK" : "BUILD MASK"}</small>
      <div class="pal2791-xor-row"><span>mask[${escapeHtml(xorStep.parentNode)}]</span>${parityHtml(xorStep.parentParity)}</div>
      <div class="pal2791-xor-op">bit('${escapeHtml(xorStep.letter)}') = 1 &lt;&lt; ${escapeHtml(xorStep.bitIndex ?? "?")} = <b>${escapeHtml(xorStep.bitValue ?? "?")}</b></div>
      ${waitingForMask
        ? `<div class="pal2791-xor-row result"><span>mask[${escapeHtml(current.node)}]</span><strong>${vi ? "chờ dòng 15" : "waiting for line 15"}</strong></div>`
        : `<div class="pal2791-xor-op">XOR <b>'${escapeHtml(xorStep.letter)}'</b></div><div class="pal2791-xor-row result"><span>mask[${escapeHtml(current.node)}]</span>${parityHtml(current.parity, "highlight")}</div>`}
      <p>${waitingForMask
        ? (vi ? "Dòng 14 mới tính bit; mask của child chưa thay đổi." : "Line 14 only computes the bit; the child mask has not changed yet.")
        : (vi ? `Dòng 15 đảo parity của '${xorStep.letter}' và lưu mask mới.` : `Line 15 flips '${xorStep.letter}' parity and stores the new mask.`)}</p>
    </section>`;
  } else if (phase === "rule") {
    focusHtml = `<section class="pal2791-cancel">
      <small>${vi ? "ĐOẠN CHUNG TỰ TRIỆT TIÊU" : "SHARED PREFIX CANCELS"}</small>
      <div class="pal2791-cancel-rows">
        <span>root → u<i>= (root→LCA) + (LCA→u)</i></span>
        <span>root → v<i>= (root→LCA) + (LCA→v)</i></span>
        <b>XOR</b>
        <span class="result">u ↔ v<i>= (LCA→u) + (LCA→v)</i></span>
      </div>
      <p>${vi ? "Đoạn root→LCA xuất hiện 2 lần nên parity của nó bằng 0 và biến mất." : "The root→LCA part appears twice, so its parity becomes 0 and disappears."}</p>
    </section>`;
  } else if (current) {
    focusHtml = `<section class="pal2791-current">
      <small>${vi ? "NODE ĐANG XÉT" : "CURRENT NODE"}</small>
      <strong>node ${escapeHtml(current.node)}</strong>
      <code>${escapeHtml(current.edge)}</code>
      ${current.pending
        ? `<span class="pal2791-parity-empty">${vi ? "mask chưa được tính" : "mask not computed yet"}</span>`
        : parityHtml(current.parity, "highlight")}
      <em>${vi ? "chữ lẻ" : "odd letters"}: ${escapeHtml(current.odd)} · popcount ${escapeHtml(current.popcount)}</em>
    </section>`;
  } else {
    focusHtml = `<section class="pal2791-current done">
      <small>${vi ? "TỔNG SỐ ĐƯỜNG" : "TOTAL PATHS"}</small>
      <strong>${escapeHtml(view.answerAfter ?? 0)}</strong>
    </section>`;
  }

  const lookupHtml = lookups.length
    ? `<section class="pal2791-lookups">
        <header><strong>${vi ? "TRA COUNTER" : "COUNTER PROBES"}</strong><span>${view.lookupCaption
          ? escapeHtml(view.lookupCaption)
          : (vi ? `1 mask giống + ${lookups.length - 1} phép lật 1 chữ` : `1 equal mask + ${lookups.length - 1} one-letter flips`)}</span></header>
        <div>${lookups.map((item) => {
          const probeState = item.pending ? "pending" : item.count > 0 ? "hit" : "miss";
          return `<span class="pal2791-probe ${probeState} ${item.kind}">
            <small>${item.kind === "exact" ? (vi ? "giống hệt" : "equal") : `flip '${escapeHtml(item.flipLetter)}'`}</small>
            <b>${escapeHtml(item.label)}</b>
            <em>${item.pending
              ? (vi ? "chờ thực thi dòng 23" : "waiting for line 23")
              : item.count > 0
                ? `+${escapeHtml(item.count)} → node ${escapeHtml((item.nodes || []).join(", "))}`
                : (vi ? "trượt" : "miss")}</em>
          </span>`;
        }).join("")}</div>
        ${view.skippedFlips ? `<p class="pal2791-skip">${vi ? `Bỏ qua ${view.skippedFlips} phép lật còn lại: các chữ đó không có trong cây nên luôn trượt.` : `Skipped the other ${view.skippedFlips} flips: those letters never appear in the tree, so they always miss.`}</p>` : ""}
      </section>`
    : "";

  const pairsHtml = pairsFound.length
    ? `<section class="pal2791-pairs">
        <header><strong>${vi ? "CẶP PALINDROME VỪA TÌM" : "PALINDROME PAIRS JUST FOUND"}</strong><span>${pairsFound.length}</span></header>
        <div>${pairsFound.map((pair) => `<span class="pal2791-pair ${pair.kind}">
            <b>(${escapeHtml(pair.u)}, ${escapeHtml(pair.v)})</b>
            <small>LCA ${escapeHtml(pair.lca)} · ${vi ? "chữ" : "letters"} "${escapeHtml(pair.letters)}"</small>
            <em>→ "${escapeHtml(pair.palindrome)}"</em>
            <i>${pair.xorPopcount === 0 ? (vi ? "0 chữ lẻ" : "0 odd") : `1 ${vi ? "chữ lẻ" : "odd"}: ${escapeHtml(pair.xorOdd)}`}</i>
          </span>`).join("")}</div>
      </section>`
    : "";

  const finalPairs = allPairsList.length ? allPairsList : recentPairs;
  const summaryPairsHtml = phase === "done" && finalPairs.length
    ? `<section class="pal2791-pairs all">
        <header><strong>${vi ? "TẤT CẢ ĐƯỜNG PALINDROME" : "ALL PALINDROME PATHS"}</strong><span>${finalPairs.length}</span></header>
        <div>${finalPairs.map((pair) => `<span class="pal2791-pair ${pair.kind}"><b>(${escapeHtml(pair.u)}, ${escapeHtml(pair.v)})</b><small>"${escapeHtml(pair.letters)}"</small><em>→ "${escapeHtml(pair.palindrome)}"</em></span>`).join("")}</div>
      </section>`
    : "";

  const counterHtml = counter.length
    ? counter.map((item) => `<span class="pal2791-counter-item ${item.matched ? "matched" : ""}">
        ${parityHtml(item.parity)}
        <strong>${escapeHtml(item.odd)}</strong>
        <em>×${escapeHtml(item.count)}</em>
        <small>node ${escapeHtml((item.nodes || []).join(", "))}</small>
      </span>`).join("")
    : `<span class="pal2791-counter-empty">${vi ? "counter đang rỗng" : "counter is empty"}</span>`;

  const summary = vi
    ? `LeetCode 2791: pha ${phase}, node ${current ? current.node : "xong"}, đáp án ${view.answerAfter ?? 0}.`
    : `LeetCode 2791: ${phase} phase, node ${current ? current.node : "done"}, answer ${view.answerAfter ?? 0}.`;

  $("treeView").innerHTML = `<section class="pal2791-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="pal2791-phases">${phases}</div>
    ${ruleCard}
    <div class="pal2791-layout">
      <section class="pal2791-tree-card">
        <header><strong>${vi ? "CÂY PARITY" : "PARITY TREE"}</strong><span>${vi ? "mỗi node hiện các chữ xuất hiện LẺ lần từ root" : "each node shows letters with ODD parity from the root"}</span></header>
        <div class="pal2791-tree-legend">
          <span><i class="saved"></i>${vi ? "đã lưu trong counter" : "stored in counter"}</span>
          <span><i class="current"></i>${vi ? "node đang xét" : "current node"}</span>
          <span><i class="pair"></i>${vi ? "node ghép được" : "matching node"}</span>
          <span><code>+c</code>${vi ? "chữ trên cạnh đi vào" : "incoming edge letter"}</span>
          <span><code>odd:{ac}</code>${vi ? "các chữ đang lẻ" : "letters with odd parity"}</span>
        </div>
        <div id="pal2791Tree" class="pal2791-tree"></div>
      </section>
      <aside class="pal2791-side">
        ${focusHtml}
        <section class="pal2791-formula ${Number(view.add || 0) > 0 ? "adds" : ""}">
          <small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small>
          <strong>${escapeHtml(view.answerBefore ?? 0)} + ${escapeHtml(view.add ?? 0)} = ${escapeHtml(view.answerAfter ?? 0)}</strong>
        </section>
        <section class="pal2791-counter">
          <header><strong>COUNTER <code>seen</code></strong><span>${vi ? "mask đã lưu" : "stored masks"}</span></header>
          <div>${counterHtml}</div>
        </section>
      </aside>
    </div>
    ${lookupHtml}
    ${pairsHtml}
    ${summaryPairsHtml}
  </section>`;
  renderTree(step, "pal2791Tree");
}

function renderRecoverBstView(step) {
  const view = step.recoverBstView;
  const treeView = $("treeView");
  const vi = lang === "vi";
  const pointerSpecs = [
    { key: "current", label: "curr", roleVi: "node đang xử lý", roleEn: "node being processed" },
    { key: "prev", label: "prev", roleVi: "node vừa thăm trước đó", roleEn: "previous inorder node" },
    { key: "first", label: "first", roleVi: "node lớn của inversion đầu", roleEn: "larger node in first inversion" },
    { key: "second", label: "second", roleVi: "node nhỏ của inversion mới nhất", roleEn: "smaller node in latest inversion" },
  ];
  const pointerHtml = pointerSpecs.map((spec) => {
    const pointer = view[spec.key] || { state: "none", text: "None" };
    const stateClass = pointer.state === "node" ? "has-node" : pointer.state === "sentinel" ? "sentinel" : "is-none";
    const beforeValue = view.swapped && spec.key === "first"
      ? view.swapped.firstBefore
      : view.swapped && spec.key === "second"
        ? view.swapped.secondBefore
        : null;
    const pointerText = beforeValue === null
      ? pointer.text
      : `${pointer.text} · ${vi ? "trước" : "was"} ${beforeValue}`;
    return `<div class="recover-pointer ${spec.key} ${stateClass}">
      <span>${spec.label}</span>
      <strong>${escapeHtml(pointerText)}</strong>
      <small>${escapeHtml(vi ? spec.roleVi : spec.roleEn)}</small>
    </div>`;
  }).join("");

  let comparisonHtml;
  if (view.swapped) {
    comparisonHtml = `<strong>${vi ? "Phục hồi" : "Recover"}</strong><code>${escapeHtml(view.swapped.firstBefore)} ↔ ${escapeHtml(view.swapped.secondBefore)}</code><span>→ ${vi ? "inorder tăng dần" : "ascending inorder"}</span>`;
  } else if (view.comparison) {
    comparisonHtml = `<strong>${vi ? "Kiểm tra inversion" : "Check inversion"}</strong><code>${escapeHtml(view.comparison.expression)}</code><span class="${view.comparison.inversion ? "is-inversion" : "is-valid"}">${view.comparison.inversion ? (vi ? "ĐÚNG → phát hiện inversion" : "TRUE → inversion found") : (vi ? "SAI → thứ tự hợp lệ" : "FALSE → valid order")}</span>`;
  } else {
    comparisonHtml = `<strong>${vi ? "Quy tắc" : "Rule"}</strong><code>${escapeHtml(view.condition || "prev.val > curr.val")}</code><span>${vi ? "thì thứ tự inorder bị giảm" : "means inorder decreases"}</span>`;
  }

  const inorderHtml = view.inorder.length
    ? view.inorder.map((value, index) => `<span class="recover-inorder-value${index === view.inorder.length - 1 ? " latest" : ""}">${escapeHtml(value)}</span>`).join(`<i>→</i>`)
    : `<span class="recover-empty">∅</span>`;
  const stackHtml = view.callStack.length
    ? view.callStack.map((value) => `<span>${escapeHtml(value)}</span>`).join(`<i>→</i>`)
    : `<span class="recover-empty">∅</span>`;
  const summary = vi
    ? `Khôi phục BST: curr ${view.current.text}, prev ${view.prev.text}, first ${view.first.text}, second ${view.second.text}.`
    : `Recover BST: curr ${view.current.text}, prev ${view.prev.text}, first ${view.first.text}, second ${view.second.text}.`;

  treeView.innerHTML = `<div class="recover-bst-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="recover-pointer-row">${pointerHtml}</div>
    <div class="recover-comparison">${comparisonHtml}</div>
    <div id="recoverBstTree" class="recover-tree"></div>
    <div class="recover-traversal-row">
      <div><b>${vi ? "Inorder đã thăm" : "Visited inorder"}</b><span class="recover-sequence">${inorderHtml}</span></div>
      <div><b>Call stack</b><span class="recover-sequence">${stackHtml}</span></div>
      <em>${vi ? "inversion" : "inversions"}: ${escapeHtml(view.inversionCount)}</em>
    </div>
  </div>`;
  renderTree(step, "recoverBstTree");
}

function renderWordSearchView(step) {
  const view = step.wordSearchView;
  const treeView = $("treeView");
  const vi = lang === "vi";
  const pathMap = new Map((view.path || []).map((item, index) => [`${item.r},${item.c}`, { ...item, order: index + 1 }]));
  const triedStarts = new Set((view.triedStarts || []).map(([r, c]) => `${r},${c}`));
  const sameCell = (cell, r, c) => cell && cell.r === r && cell.c === c;
  const isInside = (cell) => cell && cell.r >= 0 && cell.r < view.rows && cell.c >= 0 && cell.c < view.cols;
  const focus = view.target || view.current;
  const actionLabels = {
    init: vi ? "Chuẩn bị DFS từ từng ô" : "Prepare DFS from every cell",
    "row-loop": vi ? "Dòng 20 · chọn hàng bắt đầu" : "Line 20 · select a start row",
    "col-loop": vi ? "Dòng 21 · chọn cột bắt đầu" : "Line 21 · select a start column",
    start: vi ? "Thử một điểm bắt đầu mới" : "Try a new start cell",
    call: vi ? "Tạo một frame DFS mới" : "Create a new DFS frame",
    "base-check": vi ? "Dòng 6 · đã ghép đủ word chưa?" : "Line 6 · is the word complete?",
    validate: vi ? "Dòng 8 · tọa độ và ký tự hợp lệ" : "Line 8 · valid coordinate and character",
    "reject-check": vi ? "Dòng 8 · điều kiện invalid là True" : "Line 8 · invalid condition is True",
    match: vi ? "Ký tự khớp → thêm ô vào path" : "Character matches → add cell to path",
    "save-char": vi ? "Dòng 11 · lưu ký tự vào tmp" : "Line 11 · save the character in tmp",
    "found-start": vi ? "Dòng 13 · bắt đầu biểu thức OR" : "Line 13 · begin the OR expression",
    "found-value": vi ? "Dòng 16 · gán kết quả cho found" : "Line 16 · assign the result to found",
    explore: vi ? "Thử ô kề theo thứ tự ↓ ↑ → ←" : "Try a neighbor in ↓ ↑ → ← order",
    reject: view.reason === "outside"
      ? (vi ? "Nhánh sai: tọa độ vượt biên" : "Reject: coordinate is outside the board")
      : view.reason === "reused"
        ? (vi ? "Nhánh sai: ô đã có trong path" : "Reject: cell is already in the path")
        : (vi ? "Nhánh sai: ký tự không khớp" : "Reject: character mismatch"),
    backtrack: vi ? "Bế tắc → khôi phục ô và lùi lại" : "Dead end → restore the cell and backtrack",
    restore: vi ? "Dòng 17 · khôi phục board[r][c]" : "Line 17 · restore board[r][c]",
    "return-found": vi ? "Dòng 18 · trả found về frame cha" : "Line 18 · return found to the parent",
    found: vi ? "Đã khớp đủ mọi ký tự" : "Every character has been matched",
    "return-true": vi ? "Nhánh con thành công → truyền True lên" : "Child succeeded → propagate True",
    "result-true": vi ? "Tìm thấy đường đi hợp lệ" : "A valid path was found",
    "result-false": vi ? "Đã thử hết nhưng không có đường hợp lệ" : "All starts exhausted; no valid path",
  };

  const rejectedAction = view.action === "reject" || view.action === "reject-check";
  const completed = view.result === true || view.action === "found" || view.action === "result-true";
  const matchedCount = completed ? view.word.length : Math.min(view.word.length, (view.path || []).length);
  const wordHtml = [...view.word].map((letter, index) => {
    const classes = ["word-search-letter"];
    if (index < matchedCount) classes.push("matched");
    else if (index === view.index) classes.push(rejectedAction ? "rejected" : "needed");
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${escapeHtml(letter)}</strong></span>`;
  }).join('<i class="word-search-word-arrow">→</i>');

  const cellsHtml = (view.board || []).flatMap((row, r) => row.map((letter, c) => {
    const key = `${r},${c}`;
    const pathItem = pathMap.get(key);
    const classes = ["word-search-cell"];
    let state = "";
    if (triedStarts.has(key)) classes.push("tried-start");
    if (pathItem) {
      classes.push(completed ? "found-path" : "in-path");
      state = `${vi ? "bước" : "step"} ${pathItem.order}`;
    }
    if (sameCell(view.target, r, c) && !sameCell(view.current, r, c)) {
      classes.push("target");
      state = vi ? "sắp thử" : "next";
    }
    if (sameCell(view.current, r, c)) {
      classes.push(rejectedAction ? "rejected" : "current");
      state = rejectedAction ? (vi ? "không hợp lệ" : "invalid") : (vi ? "đang xét" : "current");
    }
    if (sameCell(view.restored, r, c)) {
      classes.push("restored");
      state = vi ? "đã khôi phục" : "restored";
    }
    return `<div class="${classes.join(" ")}">
      <small>(${r},${c})</small>
      <strong>${escapeHtml(letter)}</strong>
      <span>${escapeHtml(state)}</span>
      ${pathItem ? `<b>${pathItem.order}</b>` : ""}
    </div>`;
  })).join("");

  const actual = isInside(focus) ? view.board[focus.r][focus.c] : (focus ? (vi ? "ngoài bảng" : "outside") : "—");
  const expected = view.index >= view.word.length ? "✓" : (view.word[view.index] || "—");
  const comparisonClass = rejectedAction ? "is-rejected" : view.action === "match" || completed ? "is-matched" : "";
  const focusText = focus ? `(${focus.r},${focus.c})` : "—";

  const directionOrder = [
    { key: "down", symbol: "↓", label: vi ? "xuống" : "down" },
    { key: "up", symbol: "↑", label: vi ? "lên" : "up" },
    { key: "right", symbol: "→", label: vi ? "phải" : "right" },
    { key: "left", symbol: "←", label: vi ? "trái" : "left" },
  ];
  const directionsHtml = directionOrder.map((direction, index) => {
    const classes = ["word-search-direction"];
    if (index < view.directionIndex) classes.push("tried");
    if (index === view.directionIndex) classes.push(view.result === true ? "success" : "active");
    return `<span class="${classes.join(" ")}"><b>${direction.symbol}</b><small>${direction.label}</small></span>`;
  }).join("");

  const stackHtml = (view.stack || []).length
    ? view.stack.map((frame, index) => `<span class="word-search-frame${index === view.stack.length - 1 ? " active" : ""}"><small>i=${frame.i}</small><strong>(${frame.r},${frame.c})</strong></span>`).join('<i class="word-search-stack-arrow">→</i>')
    : `<span class="word-search-empty">∅</span>`;
  const pathHtml = (view.path || []).length
    ? view.path.map((item) => `<span><small>${item.index}</small><strong>${escapeHtml(item.char)}</strong><em>(${item.r},${item.c})</em></span>`).join('<i>→</i>')
    : `<span class="word-search-empty">∅</span>`;
  const summary = vi
    ? `Tìm từ ${view.word}. Đã khớp ${matchedCount} trên ${view.word.length} ký tự; đang xét ${focusText}.`
    : `Searching for ${view.word}. Matched ${matchedCount} of ${view.word.length} characters; inspecting ${focusText}.`;

  treeView.innerHTML = `<div class="word-search-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="word-search-word"><span>${vi ? "Từ cần tìm" : "Target word"}</span><div>${wordHtml || '<span class="word-search-empty">empty</span>'}</div><em>${matchedCount}/${view.word.length}</em></div>
    <div class="word-search-action ${comparisonClass}"><strong>${escapeHtml(actionLabels[view.action] || pick(step.title))}</strong><span>${escapeHtml(focusText)}</span><code>${escapeHtml(actual)} ${rejectedAction ? "≠" : "→"} ${escapeHtml(expected)}</code></div>
    <div class="word-search-main">
      <div class="word-search-board" style="grid-template-columns: repeat(${Math.max(1, view.cols)}, minmax(48px, 62px))">${cellsHtml}</div>
      <div class="word-search-trace">
        <div><b>${vi ? "Thứ tự thử hướng" : "Direction order"}</b><span class="word-search-directions">${directionsHtml}</span></div>
        <div><b>Call stack</b><span class="word-search-stack">${stackHtml}</span></div>
      </div>
    </div>
    <div class="word-search-path"><b>path</b><span>${pathHtml}</span></div>
    <div class="word-search-legend">
      <span><i class="current"></i>${vi ? "đang xét" : "current"}</span>
      <span><i class="target"></i>${vi ? "ô kế tiếp" : "next cell"}</span>
      <span><i class="path"></i>${vi ? "đường hiện tại" : "current path"}</span>
      <span><i class="rejected"></i>${vi ? "nhánh sai" : "rejected"}</span>
      <span><i class="restored"></i>backtrack</span>
    </div>
  </div>`;
}

function renderSameTreeView(step) {
  const view = step.sameTreeView;
  const treeView = $("treeView");
  const pValue = pick(view.pValue);
  const qValue = pick(view.qValue);
  const statusClass = view.status === "match"
    ? "is-match"
    : view.status === "mismatch"
      ? "is-mismatch"
      : "is-checking";
  const resultLabel = view.result === true
    ? (lang === "vi" ? "True · giống" : "True · same")
    : view.result === false
      ? (lang === "vi" ? "False · khác" : "False · different")
      : pick(view.statusText);
  const pathLabel = view.path === "done" ? (lang === "vi" ? "hoàn tất" : "complete") : view.path;
  const summary = lang === "vi"
    ? `So sánh cây p và q tại ${pathLabel}: ${pValue} ${view.relation} ${qValue}. ${pick(view.statusText)}.`
    : `Comparing trees p and q at ${pathLabel}: ${pValue} ${view.relation} ${qValue}. ${pick(view.statusText)}.`;

  treeView.innerHTML = `<div class="same-tree-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="same-tree-compare">
      <span class="same-tree-path"><small>${lang === "vi" ? "VỊ TRÍ" : "PATH"}</small><code>${escapeHtml(pathLabel)}</code></span>
      <div class="same-tree-pair" aria-hidden="true">
        <span class="same-tree-value"><small>p</small><strong>${escapeHtml(pValue)}</strong></span>
        <span class="same-tree-relation">${escapeHtml(view.relation)}</span>
        <span class="same-tree-value"><small>q</small><strong>${escapeHtml(qValue)}</strong></span>
      </div>
      <span class="same-tree-status ${statusClass}">${escapeHtml(resultLabel)}</span>
    </div>
    <div class="same-tree-columns">
      <section class="same-tree-column" aria-label="${lang === "vi" ? "Cây p" : "Tree p"}">
        <h4><code>p</code><span>${lang === "vi" ? "cây thứ nhất" : "first tree"}</span></h4>
        <div id="sameTreeP" class="same-tree-canvas"></div>
      </section>
      <section class="same-tree-column" aria-label="${lang === "vi" ? "Cây q" : "Tree q"}">
        <h4><code>q</code><span>${lang === "vi" ? "cây thứ hai" : "second tree"}</span></h4>
        <div id="sameTreeQ" class="same-tree-canvas"></div>
      </section>
    </div>
    <div class="same-tree-legend" aria-hidden="true">
      <span><i class="current"></i>${lang === "vi" ? "đang so sánh" : "current pair"}</span>
      <span><i class="matched"></i>${lang === "vi" ? "đã khớp" : "matched"}</span>
      <span><i class="unchecked"></i>${lang === "vi" ? "chưa kiểm tra" : "unchecked"}</span>
    </div>
  </div>`;

  const renderSide = (tree, targetId) => {
    if (tree.nodes.length === 0) {
      $(targetId).innerHTML = `<span class="same-tree-empty">∅</span>`;
      return;
    }
    renderTree({ tree }, targetId);
  };
  renderSide(view.pTree, "sameTreeP");
  renderSide(view.qTree, "sameTreeQ");
}

function renderBfsLevelView(step) {
  const view = step.bfsLevelView || {};
  const vi = lang === "vi";
  const target = $("treeView");
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (Array.isArray(value)) return JSON.stringify(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages.map((stage, index) => {
    const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(pick(stage))}</b></span>`;
  }).join("");
  const queue = Array.isArray(view.queue) ? view.queue : [];
  const queueHtml = queue.length
    ? queue.map((item, index) => {
      const role = item.role === "current-level" ? "current-level" : item.role === "next-level" ? "next-level" : "";
      const label = item.label
        ? text(item.label)
        : role === "next-level"
          ? "NEXT"
          : index === 0
            ? "FRONT"
            : role === "current-level" ? "THIS LEVEL" : `#${index}`;
      const queueLabel = item.meta ? `${label} · ${text(item.meta)}` : label;
      return `<span class="${role}"><small>${escapeHtml(queueLabel)}</small><strong>${escapeHtml(text(item.value))}</strong></span>`;
    }).join('<i aria-hidden="true">→</i>')
    : `<em>∅</em>`;
  const valueTokens = (values) => (Array.isArray(values) ? values : []).map((item) => `<span class="bl-token ${escapeHtml(item.tone || "neutral")}">
    <strong>${escapeHtml(text(item.value))}</strong>${item.meta ? `<small>${escapeHtml(text(item.meta))}</small>` : ""}
  </span>`).join("");
  const compactTokens = (values, tone = "neutral", active = []) => (Array.isArray(values) ? values : []).map((value, index) => `<b class="${tone}${active.includes(index) ? " active" : ""}">${escapeHtml(text(value))}</b>`).join("");
  const rows = Array.isArray(view.rows) ? view.rows : [];
  const rowHtml = rows.length ? rows.map((row) => {
    const status = row.status === "fail" ? "danger" : row.status === "sorted" || row.tone === "success" ? "success" : "";
    const beforeAfter = Array.isArray(row.before) || Array.isArray(row.secondary) || Array.isArray(row.working)
      ? `<div class="bl-transform">
          ${Array.isArray(row.before) ? `<span><small>${vi ? "TRƯỚC" : "BEFORE"}</small><i>${compactTokens(row.before)}</i></span>` : ""}
          ${Array.isArray(row.secondary) ? `<span><small>${view.mode === "level-sort" ? "TARGET" : (vi ? "SAU" : "AFTER")}</small><i>${compactTokens(row.secondary, view.mode === "level-sort" ? "target" : "success")}</i></span>` : ""}
          ${Array.isArray(row.working) ? `<span><small>${vi ? "HIỆN TẠI" : "CURRENT"}</small><i>${compactTokens(row.working, "working", row.swap || [])}</i></span>` : ""}
        </div>`
      : "";
    return `<section class="bl-row ${status}">
      <header><span><small>LEVEL</small><strong>${escapeHtml(row.level ?? 0)}</strong></span>${row.metric ? `<code><small>${escapeHtml(text(row.metric.label))}</small>${escapeHtml(text(row.metric.value))}</code>` : ""}</header>
      <div class="bl-values">${valueTokens(row.values)}</div>
      ${beforeAfter}
    </section>`;
  }).join("") : `<div class="bl-empty">${vi ? "Chưa xử lý tầng nào" : "No level processed yet"}</div>`;
  const cards = Array.isArray(view.cards) ? view.cards : [];
  const cardsHtml = cards.length ? `<div class="bl-cards">${cards.map((card) => `<section class="${escapeHtml(card.tone || "neutral")}"><small>${escapeHtml(text(card.label))}</small><strong>${escapeHtml(text(card.value))}</strong>${card.detail ? `<span>${escapeHtml(text(card.detail))}</span>` : ""}</section>`).join("")}</div>` : "";
  const status = view.status === "danger" ? "danger" : view.status === "success" ? "success" : "checking";
  const summary = vi
    ? `Bài ${view.problemId}, bước ${pick(step.title)}. Queue có ${queue.length} node và đã hiển thị ${rows.length} tầng.`
    : `Problem ${view.problemId}, step ${pick(step.title)}. The queue has ${queue.length} nodes and ${rows.length} levels are shown.`;

  target.innerHTML = `<section class="bl-viz bl-${escapeHtml(view.mode || "level-order")}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="bl-phases">${phases}</div>
    <section class="bl-action ${status}"><span><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(pick(step.title))}</strong></span><em>${escapeHtml(String(view.event || "BFS").replaceAll("-", " "))}</em></section>
    <div class="bl-layout">
      <section class="bl-tree-panel"><header><strong>${vi ? "CÂY · MỖI HÀNG LÀ MỘT LEVEL" : "TREE · EACH ROW IS ONE LEVEL"}</strong><span>${vi ? "cam = đang xét · xanh = đã xử lý" : "amber = current · green = processed"}</span></header><div id="bfsLevelTree" class="bl-tree"></div></section>
      <section class="bl-board"><header><strong>${vi ? "BẢNG THEO TẦNG" : "LEVEL BOARD"}</strong><span>${vi ? "đọc từ trái sang phải" : "read left to right"}</span></header><div class="bl-rows">${rowHtml}</div></section>
    </div>
    <section class="bl-queue"><header><strong>${escapeHtml(view.queueTitle ? text(view.queueTitle) : "QUEUE")}</strong><span>${escapeHtml(view.queueNote ? text(view.queueNote) : (vi ? "front được lấy ra trước" : "front is removed first"))}</span></header><div>${queueHtml}</div></section>
    ${view.formula ? `<section class="bl-formula"><small>${vi ? "PHÉP TÍNH / ĐIỀU KIỆN" : "COMPUTATION / CONDITION"}</small><code>${escapeHtml(text(view.formula))}</code></section>` : ""}
    ${cardsHtml}
    <div class="bl-legend" aria-hidden="true"><span><i class="current"></i>${vi ? "đang xét" : "current"}</span><span><i class="done"></i>${vi ? "đã xử lý / chọn" : "processed / selected"}</span><span><i class="bad"></i>${vi ? "vi phạm" : "violation"}</span></div>
  </section>`;

  if (step.tree && Array.isArray(step.tree.nodes) && step.tree.nodes.length) renderTree(step, "bfsLevelTree");
  else $("bfsLevelTree").innerHTML = `<span class="bl-tree-empty">∅</span>`;
}


function renderRootLeafNumber129View(step) {
  const view = step.rootLeafNumber129View || {};
  const target = $("treeView");
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const hasValue = (value) => value !== null && value !== undefined;
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages.map((stage, index) => {
    const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
  }).join("");

  const path = Array.isArray(view.path) ? view.path : [];
  const pathHtml = path.length
    ? path.map((item, index) => `<span class="${item.current ? "current" : ""}"><small>DIGIT</small><strong>${escapeHtml(item.digit)}</strong><em>${vi ? "số" : "number"} ${escapeHtml(item.number)}</em></span>${index < path.length - 1 ? "<i>→</i>" : ""}`).join("")
    : `<b class="rln129-empty">∅ ${vi ? "path đã rỗng" : "path is empty"}</b>`;

  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stack.length
    ? stack.map((frame, index) => `<li class="${index === stack.length - 1 ? "active" : ""}"><span>#${index + 1}</span><strong>${escapeHtml(frame.value)}</strong><small>${escapeHtml(frame.side)} · in=${escapeHtml(frame.incoming)} · now=${escapeHtml(frame.number)}</small><em>${escapeHtml(frame.stage)}</em></li>`).join("")
    : `<li class="empty">${vi ? "Call stack rỗng" : "Call stack is empty"}</li>`;

  const leaves = Array.isArray(view.leaves) ? view.leaves : [];
  const leavesHtml = leaves.length
    ? leaves.map((leaf, index) => `<span class="${leaf.fresh ? "fresh" : ""}"><small>${vi ? `LÁ #${index + 1}` : `LEAF #${index + 1}`}</small><strong>${escapeHtml(leaf.digits)}</strong><em>${vi ? "giá trị" : "value"} ${escapeHtml(leaf.number)}</em></span>`).join("")
    : `<b class="rln129-empty">${vi ? "Chưa tới lá nào" : "No leaf reached yet"}</b>`;

  const builtNumber = view.current && view.phase !== "enter";
  const formulaHtml = view.current
    ? `<div class="rln129-equation ${builtNumber ? "ready" : "waiting"}">
        <span><small>${vi ? "SỐ TỪ CHA" : "FROM PARENT"}</small><strong>${escapeHtml(view.incoming)}</strong></span><b>× 10</b><i>+</i><span><small>DIGIT</small><strong>${escapeHtml(view.digit)}</strong></span><b>=</b><span class="result"><small>current</small><strong>${builtNumber ? escapeHtml(view.number) : "?"}</strong></span>
      </div>`
    : `<div class="rln129-equation empty"><code>current = current × 10 + digit</code></div>`;

  const hasLeft = hasValue(view.leftResult);
  const hasRight = hasValue(view.rightResult);
  const returnBody = view.isLeaf
    ? `<div class="direct"><span><small>${vi ? "SỐ HOÀN CHỈNH" : "COMPLETED NUMBER"}</small><strong>${escapeHtml(view.number)}</strong></span><b>→</b><span class="result"><small>RETURN</small><strong>${escapeHtml(view.returnValue ?? view.number)}</strong></span></div><p>${vi ? "Đã tới lá: trả thẳng số vừa tạo, không gọi hai nhánh None." : "At a leaf: return the completed number directly; do not recurse into its two None children."}</p>`
    : `<div><span><small>LEFT</small><strong>${hasLeft ? escapeHtml(view.leftResult) : "?"}</strong></span><b>+</b><span><small>RIGHT</small><strong>${hasRight ? escapeHtml(view.rightResult) : "?"}</strong></span><b>=</b><span class="result"><small>RETURN</small><strong>${hasValue(view.returnValue) ? escapeHtml(view.returnValue) : "?"}</strong></span></div>`;
  const returnHtml = `<section class="rln129-return ${view.event === "combine" || view.event === "done" || view.event === "leaf-return" ? "ready" : ""}">
    <header><strong>${vi ? "GIÁ TRỊ TRẢ VỀ CHO CHA" : "VALUE RETURNED TO PARENT"}</strong><span>${view.isLeaf ? (vi ? "lá trả current trực tiếp" : "a leaf returns current directly") : (vi ? "node thường cộng 2 cây con" : "an internal node adds both subtrees")}</span></header>
    ${returnBody}
  </section>`;

  const tone = view.event === "leaf-return" ? "leaf" : view.event === "combine" || view.event === "done" ? "sum" : "";
  const summary = vi
    ? `Bài 129, ${text(step.title)}. Đã hoàn thành ${leaves.length} số, tổng ${view.leafTotal}.`
    : `Problem 129, ${text(step.title)}. ${leaves.length} numbers completed, totaling ${view.leafTotal}.`;

  target.innerHTML = `<section class="rln129-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rln129-phases">${phases}</div>
    <section class="rln129-rule"><span><small>${vi ? "QUY TẮC NỐI DIGIT" : "APPEND-DIGIT RULE"}</small><strong>current = current × 10 + node.val</strong></span><code>49 → 49 × 10 + 5 = 495</code></section>
    <section class="rln129-action ${tone}"><span><small>${escapeHtml(String(view.event || "dfs").replaceAll("-", " ").toUpperCase())}</small><strong>${escapeHtml(text(step.title))}</strong></span><em>${vi ? "Tổng lá" : "Leaf total"}: ${escapeHtml(view.leafTotal ?? 0)}</em></section>
    <div class="rln129-layout">
      <section class="rln129-tree-card"><header><strong>${vi ? "CÂY · PATH ROOT → CURRENT" : "TREE · ROOT → CURRENT PATH"}</strong><span>${vi ? "cam = current · xanh = path / lá xong" : "amber = current · green = path / completed leaf"}</span></header><div id="rln129Tree" class="rln129-tree"></div></section>
      <aside class="rln129-side">
        <section class="rln129-stats"><div><small>${vi ? "SỐ TỪ CHA" : "INCOMING"}</small><strong>${escapeHtml(view.incoming ?? "—")}</strong></div><div><small>DIGIT</small><strong>${escapeHtml(view.digit ?? "—")}</strong></div><div><small>CURRENT</small><strong>${escapeHtml(view.number ?? "—")}</strong></div><div><small>${vi ? "TỔNG LÁ" : "LEAF TOTAL"}</small><strong>${escapeHtml(view.leafTotal ?? 0)}</strong></div></section>
        ${formulaHtml}
        <section class="rln129-stack"><header><strong>CALL STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
      </aside>
    </div>
    <section class="rln129-path"><header><strong>${vi ? "CÁC DIGIT TRÊN PATH HIỆN TẠI" : "DIGITS ON THE CURRENT PATH"}</strong><span>${vi ? "mỗi bước nhân 10 rồi nối digit" : "multiply by 10, then append each digit"}</span></header><div>${pathHtml}</div></section>
    ${returnHtml}
    <section class="rln129-leaves"><header><strong>${vi ? "CÁC SỐ ROOT → LEAF ĐÃ HOÀN THÀNH" : "COMPLETED ROOT → LEAF NUMBERS"}</strong><span>${leaves.length ? `${leaves.map((leaf) => leaf.number).join(" + ")} = ${view.leafTotal}` : (vi ? "chỉ thêm khi tới lá" : "added only at a leaf")}</span></header><div>${leavesHtml}</div></section>
  </section>`;

  if (step.tree && Array.isArray(step.tree.nodes) && step.tree.nodes.length) renderTree(step, "rln129Tree");
  else $("rln129Tree").innerHTML = `<span class="rln129-tree-empty">∅</span>`;
}

function renderSmallestLeaf988View(step) {
  const view = step.smallestLeaf988View || {};
  const target = $("treeView");
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages.map((stage, index) => {
    const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
  }).join("");

  const rootPath = Array.isArray(view.rootPath) ? view.rootPath : [];
  const rootPathHtml = rootPath.length
    ? rootPath.map((node, index) => `<span class="${node.current ? "current" : ""}"><small>${node.value}</small><strong>${escapeHtml(node.letter)}</strong></span>${index < rootPath.length - 1 ? "<i>→</i>" : ""}`).join("")
    : `<b class="sl988-empty">∅</b>`;
  const upwardPath = [...rootPath].reverse();
  const upwardHtml = upwardPath.length
    ? upwardPath.map((node, index) => `<span class="${index === 0 ? "leaf-end" : ""}"><strong>${escapeHtml(node.letter)}</strong></span>${index < upwardPath.length - 1 ? "<i>→</i>" : ""}`).join("")
    : `<b class="sl988-empty">∅</b>`;

  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stack.length
    ? stack.map((frame, index) => `<li class="${index === stack.length - 1 ? "active" : ""}"><span>#${index + 1}</span><strong>${escapeHtml(frame.letter)}</strong><small>${escapeHtml(frame.side)} · in="${escapeHtml(frame.incoming)}" · path="${escapeHtml(frame.path)}"</small><em>${escapeHtml(frame.stage)}</em></li>`).join("")
    : `<li class="empty">${vi ? "Call stack rỗng" : "Call stack is empty"}</li>`;

  const stringCells = (value, focusIndex, tone) => {
    if (value === null || value === undefined) return `<b class="sl988-empty">${vi ? "chưa có" : "none yet"}</b>`;
    if (value === "") return `<b class="sl988-empty">""</b>`;
    return [...String(value)].map((letter, index) => `<span class="${index === focusIndex ? `focus ${tone}` : ""}"><small>${index}</small><strong>${escapeHtml(letter)}</strong></span>`).join("");
  };
  const candidate = view.candidate;
  const previousBest = view.previousBest;
  const compareIndex = Number.isInteger(view.compareIndex) ? view.compareIndex : -1;
  const hasComparison = candidate !== null && candidate !== undefined;
  const compareSymbol = previousBest === null || previousBest === undefined
    ? "→"
    : candidate < previousBest ? "<" : candidate === previousBest ? "=" : ">";
  const compareVerdict = !hasComparison
    ? (vi ? "Chỉ so sánh khi tới lá" : "Compare only at a leaf")
    : previousBest === null || previousBest === undefined
      ? (vi ? "Candidate đầu tiên → trở thành best" : "First candidate → becomes best")
      : candidate < previousBest
        ? (vi ? `'${candidate}' nhỏ hơn → UPDATE BEST` : `'${candidate}' is smaller → UPDATE BEST`)
        : (vi ? `'${candidate}' không nhỏ hơn → GIỮ BEST` : `'${candidate}' is not smaller → KEEP BEST`);
  const compareTone = view.decision === "update" ? "update" : view.decision === "keep" ? "keep" : "waiting";
  const comparisonHtml = `<section class="sl988-compare ${compareTone}">
    <header><strong>${vi ? "SO SÁNH TỪ TRÁI SANG PHẢI" : "COMPARE LEFT TO RIGHT"}</strong><span>${vi ? "ký tự khác nhau đầu tiên quyết định" : "the first differing letter decides"}</span></header>
    <div class="sl988-compare-row"><section><small>CANDIDATE</small><div>${stringCells(candidate, compareIndex, "candidate")}</div></section><b>${compareSymbol}</b><section><small>${vi ? "BEST TRƯỚC ĐÓ" : "PREVIOUS BEST"}</small><div>${stringCells(previousBest, compareIndex, "best")}</div></section></div>
    <p>${escapeHtml(compareVerdict)}</p>
  </section>`;

  const candidates = Array.isArray(view.candidates) ? view.candidates : [];
  const candidatesHtml = candidates.length
    ? candidates.map((record, index) => `<span class="${record.isBest ? "best" : "tried"}"><small>#${index + 1} · root→leaf ${escapeHtml(record.rootToLeaf)}</small><strong>${escapeHtml(record.candidate)}</strong><em>${record.isBest ? "BEST" : (vi ? "đã xét" : "checked")}</em></span>`).join("")
    : `<b class="sl988-empty">${vi ? "Chưa có candidate" : "No candidate yet"}</b>`;

  const currentLetter = view.current?.letter ?? "—";
  const tone = view.decision === "update" ? "update" : view.decision === "keep" ? "keep" : view.event === "done" ? "done" : "";
  const summary = vi
    ? `Bài 988, ${text(step.title)}. Best hiện tại là ${view.best ?? "chưa có"}.`
    : `Problem 988, ${text(step.title)}. The current best is ${view.best ?? "none"}.`;

  target.innerHTML = `<section class="sl988-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="sl988-phases">${phases}</div>
    <section class="sl988-rule"><span><small>${vi ? "GIỮ PATH ĐÚNG CHIỀU LEAF → ROOT" : "KEEP PATH IN LEAF → ROOT ORDER"}</small><strong>path = letter + path</strong></span><code>'d' + 'ba' = 'dba'</code></section>
    <section class="sl988-action ${tone}"><span><small>${escapeHtml(String(view.event || "dfs").replaceAll("-", " ").toUpperCase())}</small><strong>${escapeHtml(text(step.title))}</strong></span><em>BEST: ${escapeHtml(view.best ?? "None")}</em></section>
    <div class="sl988-layout">
      <section class="sl988-tree-card"><header><strong>${vi ? "CÂY · NODE HIỂN THỊ LETTER" : "TREE · NODES SHOW LETTERS"}</strong><span>${vi ? "số gốc nằm dưới letter" : "the original number is below each letter"}</span></header><div id="sl988Tree" class="sl988-tree"></div></section>
      <aside class="sl988-side">
        <section class="sl988-stats"><div><small>NODE VALUE</small><strong>${escapeHtml(view.current?.value ?? "—")}</strong></div><div><small>LETTER</small><strong>${escapeHtml(currentLetter)}</strong></div><div><small>PATH</small><strong>${escapeHtml(view.pathString ?? "—")}</strong></div><div><small>BEST</small><strong>${escapeHtml(view.best ?? "None")}</strong></div></section>
        <section class="sl988-direction"><header><strong>${vi ? "CÙNG MỘT PATH, HAI CHIỀU ĐỌC" : "ONE PATH, TWO READING DIRECTIONS"}</strong><span>${vi ? "đáp án dùng hàng thứ hai" : "the answer uses the second row"}</span></header><div><small>ROOT → CURRENT</small><section>${rootPathHtml}</section></div><div class="answer-order"><small>LEAF / CURRENT → ROOT</small><section>${upwardHtml}</section><code>${escapeHtml(view.pathString ?? "")}</code></div></section>
        <section class="sl988-stack"><header><strong>CALL STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
      </aside>
    </div>
    ${comparisonHtml}
    <section class="sl988-candidates"><header><strong>${vi ? "CÁC CHUỖI LEAF → ROOT ĐÃ XÉT" : "CHECKED LEAF → ROOT STRINGS"}</strong><span>${vi ? "viền xanh = best hiện tại" : "green border = current best"}</span></header><div>${candidatesHtml}</div></section>
  </section>`;

  if (step.tree && Array.isArray(step.tree.nodes) && step.tree.nodes.length) renderTree(step, "sl988Tree");
  else $("sl988Tree").innerHTML = `<span class="sl988-tree-empty">∅</span>`;
}

function renderPseudoPalindrome1457View(step) {
  const view = step.pseudoPalindrome1457View || {};
  const target = $("treeView");
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages.map((stage, index) => {
    const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
  }).join("");

  const frequencies = Array.isArray(view.frequencies) ? view.frequencies : [];
  const parityHtml = frequencies.length
    ? frequencies.map((item) => `<span class="${item.odd ? "odd" : item.count ? "even" : "zero"} ${item.active ? "active" : ""}"><small>DIGIT</small><strong>${escapeHtml(item.digit)}</strong><em>${escapeHtml(item.count)}× · ${item.odd ? "ODD" : "EVEN"}</em></span>`).join("")
    : `<b class="pp1457-empty">${vi ? "Chưa có digit trên path" : "No digit on the path yet"}</b>`;

  const path = Array.isArray(view.path) ? view.path : [];
  const pathHtml = path.length
    ? path.map((item, index) => `<span class="${item.current ? "current" : ""}"><small>NODE</small><strong>${escapeHtml(item.value)}</strong><em>mask ${escapeHtml(item.mask)}</em></span>${index < path.length - 1 ? "<i>→</i>" : ""}`).join("")
    : `<b class="pp1457-empty">∅ ${vi ? "path đã rỗng" : "path is empty"}</b>`;

  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stack.length
    ? stack.map((frame, index) => `<li class="${index === stack.length - 1 ? "active" : ""}"><span>#${index + 1}</span><strong>${escapeHtml(frame.value)}</strong><small>${escapeHtml(frame.side)} · in=${escapeHtml(frame.incomingMask)} · now=${escapeHtml(frame.mask)}</small><em>${escapeHtml(frame.stage)}</em></li>`).join("")
    : `<li class="empty">${vi ? "Call stack rỗng" : "Call stack is empty"}</li>`;

  const leafReady = Boolean(view.isLeaf);
  const bitResult = leafReady ? (Number(view.mask) & (Number(view.mask) - 1)) : null;
  const testTone = !leafReady ? "waiting" : view.valid === true ? "pass" : view.valid === false ? "fail" : "ready";
  const verdict = !leafReady
    ? (vi ? "Chỉ chạy phép test này khi tới node lá" : "Run this test only after reaching a leaf")
    : view.valid === true
      ? (vi ? "0 → tối đa 1 bit bật → PASS" : "0 → at most 1 set bit → PASS")
      : view.valid === false
        ? (vi ? `${bitResult} ≠ 0 → nhiều hơn 1 bit bật → FAIL` : `${bitResult} ≠ 0 → more than 1 set bit → FAIL`)
        : (vi ? "Node này là lá; bước kế tiếp sẽ quyết định" : "This node is a leaf; the next step makes the decision");
  const bitTestHtml = `<section class="pp1457-test ${testTone}">
    <header><strong>${vi ? "PHÉP TEST TẠI LÁ" : "THE LEAF TEST"}</strong><span>${vi ? "xóa bit 1 thấp nhất rồi AND" : "remove the lowest set bit, then AND"}</span></header>
    <div><span><small>mask</small><strong>${leafReady ? escapeHtml(view.mask) : "?"}</strong></span><b>&amp;</b><span><small>mask − 1</small><strong>${leafReady ? escapeHtml(Number(view.mask) - 1) : "?"}</strong></span><b>=</b><span class="result"><small>RESULT</small><strong>${leafReady ? escapeHtml(bitResult) : "?"}</strong></span></div>
    <code>${leafReady ? `${escapeHtml(view.mask)} &amp; ${escapeHtml(Number(view.mask) - 1)} = ${escapeHtml(bitResult)}` : "mask &amp; (mask - 1) == 0"}</code>
    <p>${escapeHtml(verdict)}</p>
  </section>`;

  const leaves = Array.isArray(view.leaves) ? view.leaves : [];
  const leavesHtml = leaves.length
    ? leaves.map((leaf, index) => `<span class="${leaf.valid ? "pass" : "fail"} ${leaf.fresh ? "fresh" : ""}"><small>${vi ? `LÁ #${index + 1}` : `LEAF #${index + 1}`}</small><strong>${escapeHtml(leaf.path.join(" → "))}</strong><em>${leaf.oddDigits.length ? `${vi ? "lẻ" : "odd"}: ${escapeHtml(leaf.oddDigits.join(", "))}` : (vi ? "không digit lẻ" : "no odd digits")}</em><b>${leaf.valid ? `✓ PASS · ${escapeHtml(leaf.palindrome)}` : "✕ FAIL"}</b></span>`).join("")
    : `<b class="pp1457-empty">${vi ? "Chưa kiểm tra path root→leaf nào" : "No root-to-leaf path checked yet"}</b>`;

  const oddDigits = Array.isArray(view.oddDigits) ? view.oddDigits : [];
  const tone = view.event === "leaf-pass" ? "pass" : view.event === "leaf-fail" ? "fail" : view.event === "done" ? "done" : "";
  const summary = vi
    ? `Bài 1457, ${text(step.title)}. Có ${view.acceptedTotal || 0} path hợp lệ.`
    : `Problem 1457, ${text(step.title)}. ${view.acceptedTotal || 0} valid paths found.`;

  target.innerHTML = `<section class="pp1457-viz ${step.final ? "final" : ""}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="pp1457-phases">${phases}</div>
    <section class="pp1457-rule"><span><small>${vi ? "KHI ĐI QUA DIGIT" : "WHEN VISITING A DIGIT"}</small><strong>mask ^= 1 &lt;&lt; digit</strong></span><b>→</b><span><small>${vi ? "CHỈ TẠI NODE LÁ" : "ONLY AT A LEAF"}</small><strong>mask &amp; (mask − 1) == 0</strong></span></section>
    <section class="pp1457-action ${tone}"><span><small>${escapeHtml(String(view.event || "dfs").replaceAll("-", " ").toUpperCase())}</small><strong>${escapeHtml(text(step.title))}</strong></span><em>${vi ? "Path hợp lệ" : "Valid paths"}: ${escapeHtml(view.acceptedTotal || 0)}</em></section>
    <div class="pp1457-layout">
      <section class="pp1457-tree-card"><header><strong>${vi ? "CÂY · PATH ROOT → CURRENT" : "TREE · ROOT → CURRENT PATH"}</strong><span>${vi ? "cam = current · xanh = path đang xét" : "amber = current · blue = active path"}</span></header><div id="pp1457Tree" class="pp1457-tree"></div></section>
      <aside class="pp1457-side">
        <section class="pp1457-stats"><div><small>DIGIT</small><strong>${escapeHtml(view.current?.value ?? "—")}</strong></div><div><small>MASK</small><strong>${escapeHtml(view.mask ?? 0)}</strong></div><div><small>BINARY</small><strong>${escapeHtml(view.binaryMask ?? "0000000000")}</strong></div><div><small>${vi ? "SỐ DIGIT LẺ" : "ODD DIGITS"}</small><strong>${escapeHtml(view.oddCount ?? 0)}</strong></div></section>
        <section class="pp1457-parity"><header><strong>${vi ? "BẢNG CHẴN / LẺ TRÊN PATH" : "PATH PARITY BOARD"}</strong><span>${oddDigits.length ? `${vi ? "đang lẻ" : "odd now"}: ${escapeHtml(oddDigits.join(", "))}` : (vi ? "mọi count đều chẵn" : "all counts are even")}</span></header><div>${parityHtml}</div></section>
        <section class="pp1457-stack"><header><strong>CALL STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
      </aside>
    </div>
    <section class="pp1457-path"><header><strong>${vi ? "PATH VÀ MASK SAU MỖI NODE" : "PATH AND MASK AFTER EACH NODE"}</strong><span>${vi ? "gặp lại digit sẽ toggle bit về 0" : "seeing a digit again toggles its bit back to 0"}</span></header><div>${pathHtml}</div></section>
    ${bitTestHtml}
    <section class="pp1457-leaves"><header><strong>${vi ? "KẾT QUẢ TỪNG PATH ROOT → LEAF" : "EACH ROOT → LEAF RESULT"}</strong><span>${vi ? "PASS kèm một palindrome có thể tạo" : "PASS includes one possible palindrome"}</span></header><div>${leavesHtml}</div></section>
  </section>`;

  if (step.tree && Array.isArray(step.tree.nodes) && step.tree.nodes.length) renderTree(step, "pp1457Tree");
  else $("pp1457Tree").innerHTML = `<span class="pp1457-tree-empty">∅</span>`;
}

function renderUnivaluePath687View(step) {
  const view = step.univaluePath687View || {};
  const target = $("treeView");
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const hasValue = (value) => value !== null && value !== undefined;
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages.map((stage, index) => {
    const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
  }).join("");

  const path = Array.isArray(view.path) ? view.path : [];
  const pathHtml = path.length
    ? path.map((item, index) => `<span class="${item.current ? "current" : ""}"><small>NODE</small><strong>${escapeHtml(item.value)}</strong></span>${index < path.length - 1 ? "<i>→</i>" : ""}`).join("")
    : `<b class="uv687-empty">∅ ${vi ? "DFS đã quay về khỏi root" : "DFS has returned from the root"}</b>`;

  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stack.length
    ? stack.map((frame, index) => `<li class="${index === stack.length - 1 ? "active" : ""}"><span>#${index + 1}</span><strong>${escapeHtml(frame.value)}</strong><small>${escapeHtml(frame.side)} · L=${escapeHtml(frame.leftRaw ?? "?")} · R=${escapeHtml(frame.rightRaw ?? "?")}</small><em>${escapeHtml(frame.stage)}</em></li>`).join("")
    : `<li class="empty">${vi ? "Call stack rỗng" : "Call stack is empty"}</li>`;

  const edgeGate = (side, child, arrow) => {
    const filtered = hasValue(arrow);
    const rawReady = Boolean(child && hasValue(child.raw));
    const childValue = child && child.value !== null ? child.value : "None";
    const parentValue = view.current?.value ?? "?";
    const tone = !filtered ? "waiting" : child?.match ? "keep" : "block";
    const status = !filtered
      ? (rawReady ? (vi ? "RAW GAIN ĐÃ VỀ" : "RAW GAIN READY") : (vi ? "ĐANG CHỜ" : "WAITING"))
      : child?.match ? "✓ MATCH" : "✕ BLOCK";
    const formula = !filtered
      ? `${side}_arrow = ?`
      : child?.match ? `${child.raw} + 1 = ${arrow}` : `${side}_arrow = 0`;
    return `<section class="uv687-gate ${tone}"><header><strong>${side.toUpperCase()} EDGE</strong><b>${status}</b></header><div><span><small>PARENT</small><strong>${escapeHtml(parentValue)}</strong></span><i>${filtered ? (child?.match ? "=" : "≠") : "?"}</i><span><small>CHILD</small><strong>${escapeHtml(childValue)}</strong></span></div><code>${escapeHtml(formula)}</code></section>`;
  };

  const leftArrow = hasValue(view.leftArrow) ? view.leftArrow : "?";
  const rightArrow = hasValue(view.rightArrow) ? view.rightArrow : "?";
  const through = hasValue(view.through) ? view.through : "?";
  const equationTone = view.bestUpdated ? "updated" : hasValue(view.through) ? "ready" : "waiting";
  const bestLine = hasValue(view.through)
    ? view.bestUpdated
      ? `${view.bestBefore} → ${view.best}`
      : `${view.best} (${vi ? "không đổi" : "unchanged"})`
    : (vi ? "chờ hai arrow" : "waiting for both arrows");

  const returnReady = hasValue(view.returnGain);
  const returnChoice = view.chosenArm === "left"
    ? (vi ? "chọn tay trái" : "choose the left arm")
    : view.chosenArm === "right"
      ? (vi ? "chọn tay phải" : "choose the right arm")
      : view.chosenArm === "none"
        ? (vi ? "không có cạnh nối được" : "no connectable edge")
        : (vi ? "chưa return" : "not returned yet");
  const bestPath = Array.isArray(view.bestPath) ? view.bestPath : [];
  const bestPathText = bestPath.length ? bestPath.join(" → ") : "—";

  const calculationsHtml = view.event === "done"
    ? `<div class="uv687-calculations">
      <section class="uv687-through ready"><small>${vi ? "PATH TỐT NHẤT TOÀN CỤC" : "GLOBAL BEST PATH"}</small><div><span class="result"><em>BEST</em><strong>${escapeHtml(view.best || 0)}</strong></span></div><p>${vi ? "Path" : "Path"}: ${escapeHtml(bestPathText)}</p></section>
      <section class="uv687-return ready"><small>${vi ? "GAIN MỘT TAY CỦA ROOT" : "ROOT'S ONE-ARM GAIN"}</small><code>root return = ${escapeHtml(view.returnGain ?? 0)}</code><strong>${vi ? "DFS đã hoàn tất" : "DFS complete"}</strong><p>${vi ? "Đáp án dùng global best; giá trị return chỉ mang được một tay lên cha." : "The answer uses the global best; a return value can carry only one arm to its parent."}</p></section>
    </div>`
    : `<div class="uv687-calculations">
      <section class="uv687-through ${equationTone}"><small>${vi ? "PATH ĐI QUA NODE HIỆN TẠI" : "PATH THROUGH THE CURRENT NODE"}</small><div><span><em>LEFT ARROW</em><strong>${escapeHtml(leftArrow)}</strong></span><b>+</b><span><em>RIGHT ARROW</em><strong>${escapeHtml(rightArrow)}</strong></span><b>=</b><span class="result"><em>THROUGH</em><strong>${escapeHtml(through)}</strong></span></div><p>best: ${escapeHtml(bestLine)}</p></section>
      <section class="uv687-return ${returnReady ? "ready" : ""}"><small>${vi ? "GAIN TRẢ LÊN CHA" : "GAIN RETURNED TO PARENT"}</small><code>max(${escapeHtml(leftArrow)}, ${escapeHtml(rightArrow)}) = ${returnReady ? escapeHtml(view.returnGain) : "?"}</code><strong>${escapeHtml(returnChoice)}</strong><p>${vi ? "Chỉ một tay có thể tiếp tục lên cha." : "Only one arm can continue to the parent."}</p></section>
    </div>`;

  const processed = Array.isArray(view.processed) ? view.processed : [];
  const processedHtml = processed.length
    ? processed.map((item, index) => `<span class="${index === processed.length - 1 && view.event === "return-gain" ? "fresh" : ""}"><small>NODE ${escapeHtml(item.value)}</small><strong>${escapeHtml(item.leftArrow)} + ${escapeHtml(item.rightArrow)} = ${escapeHtml(item.through)}</strong><em>return ${escapeHtml(item.returnGain)} · best ${escapeHtml(item.bestAfter)}</em></span>`).join("")
    : `<b class="uv687-empty">${vi ? "Chưa node nào hoàn tất postorder" : "No node has completed postorder yet"}</b>`;

  const tone = view.event === "best-update" ? "updated" : view.event === "done" ? "done" : view.event === "filter-left" || view.event === "filter-right" ? "filter" : "";
  const summary = vi
    ? `Bài 687, ${text(step.title)}. Best hiện tại là ${view.best || 0} cạnh.`
    : `Problem 687, ${text(step.title)}. The current best is ${view.best || 0} edges.`;

  target.innerHTML = `<section class="uv687-viz ${step.final ? "final" : ""}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="uv687-phases">${phases}</div>
    <section class="uv687-rule"><span><small>${vi ? "NỐI MỖI TAY" : "EXTEND EACH ARM"}</small><strong>child.val == node.val ? child_gain + 1 : 0</strong></span><b>→</b><span><small>${vi ? "HAI KẾT QUẢ KHÁC NHAU" : "TWO DIFFERENT RESULTS"}</small><strong>best ← left + right · return max(left, right)</strong></span></section>
    <section class="uv687-action ${tone}"><span><small>${escapeHtml(String(view.event || "dfs").replaceAll("-", " ").toUpperCase())}</small><strong>${escapeHtml(text(step.title))}</strong></span><em>BEST: ${escapeHtml(view.best || 0)} ${vi ? "cạnh" : "edges"}</em></section>
    <div class="uv687-layout">
      <section class="uv687-tree-card"><header><strong>${vi ? "CÂY · POSTORDER TỪ DƯỚI LÊN" : "TREE · BOTTOM-UP POSTORDER"}</strong><span>${step.final ? `${vi ? "path tốt nhất" : "best path"}: ${escapeHtml(bestPathText)}` : (vi ? "cam = current · xanh dương = call path" : "amber = current · blue = call path")}</span></header><div id="uv687Tree" class="uv687-tree"></div></section>
      <aside class="uv687-side">
        <section class="uv687-stats"><div><small>NODE</small><strong>${escapeHtml(view.current?.value ?? "—")}</strong></div><div><small>LEFT RAW</small><strong>${escapeHtml(view.leftRaw ?? "—")}</strong></div><div><small>RIGHT RAW</small><strong>${escapeHtml(view.rightRaw ?? "—")}</strong></div><div><small>BEST</small><strong>${escapeHtml(view.best || 0)}</strong></div></section>
        <div class="uv687-gates">${edgeGate("left", view.left, view.leftArrow)}${edgeGate("right", view.right, view.rightArrow)}</div>
        <section class="uv687-stack"><header><strong>CALL STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
      </aside>
    </div>
    <section class="uv687-path"><header><strong>${vi ? "ĐƯỜNG DFS ĐANG HOẠT ĐỘNG" : "ACTIVE DFS PATH"}</strong><span>${vi ? "postorder: child return trước parent" : "postorder: children return before their parent"}</span></header><div>${pathHtml}</div></section>
    ${calculationsHtml}
    <section class="uv687-processed"><header><strong>${vi ? "CÁC NODE ĐÃ CHỐT GAIN" : "NODES WITH RESOLVED GAINS"}</strong><span>${vi ? "mỗi ô: through, return và best" : "each tile: through, return, and best"}</span></header><div>${processedHtml}</div></section>
  </section>`;

  if (step.tree && Array.isArray(step.tree.nodes) && step.tree.nodes.length) renderTree(step, "uv687Tree");
  else $("uv687Tree").innerHTML = `<span class="uv687-tree-empty">∅</span>`;
}

function renderLongestZigzag1372View(step) {
  const view = step.zigzag1372View || {};
  const target = $("treeView");
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const hasValue = (value) => value !== null && value !== undefined;
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages.map((stage, index) => {
    const state = view.event === "done" ? "done" : index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
  }).join("");

  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stack.length
    ? stack.map((frame, index) => {
      const left = frame.leftPair ? `(${frame.leftPair.left},${frame.leftPair.right})` : "?";
      const right = frame.rightPair ? `(${frame.rightPair.left},${frame.rightPair.right})` : "?";
      return `<li class="${index === stack.length - 1 ? "active" : ""}"><span>#${index + 1}</span><strong>${escapeHtml(frame.value)}</strong><small>${escapeHtml(frame.side)} · left=${escapeHtml(left)} · right=${escapeHtml(right)}</small><em>${escapeHtml(frame.stage)}</em></li>`;
    }).join("")
    : `<li class="empty">${vi ? "Call stack rỗng" : "Call stack is empty"}</li>`;

  const activePath = Array.isArray(view.path) ? view.path : [];
  const activePathHtml = activePath.length
    ? activePath.map((node, index) => `<span class="${node.current ? "current" : ""}"><small>NODE</small><strong>${escapeHtml(node.value)}</strong></span>${index < activePath.length - 1 ? "<i>↓</i>" : ""}`).join("")
    : `<b class="zz1372-empty">∅ ${vi ? "không có node active" : "no active node"}</b>`;

  const pathRow = (values, directions) => {
    if (!Array.isArray(values) || !values.length) return `<b class="zz1372-empty">${vi ? "chưa có path" : "no path yet"}</b>`;
    return values.map((value, index) => {
      const direction = directions[index];
      const arrow = direction === "L" ? "↙ L" : direction === "R" ? "R ↘" : "";
      return `<span><strong>${escapeHtml(value)}</strong></span>${index < values.length - 1 ? `<i>${escapeHtml(arrow)}</i>` : ""}`;
    }).join("");
  };

  const pairCard = (side, child, goValue) => {
    const isLeft = side === "left";
    const ready = Boolean(child && child.ready);
    const needed = ready ? (isLeft ? child.right : child.left) : null;
    const nextDirection = isLeft ? "R" : "L";
    const firstDirection = isLeft ? "L" : "R";
    const childValue = !view.current ? "—" : child && child.value !== null ? child.value : "None";
    const built = hasValue(goValue);
    const tone = built ? "built" : ready ? "ready" : "waiting";
    return `<section class="zz1372-choice ${tone}">
      <header><strong>${vi ? "BẮT ĐẦU" : "START"} ${firstDirection}</strong><b>${firstDirection} → ${nextDirection} → ${firstDirection}…</b></header>
      <div class="zz1372-child"><span><small>CHILD</small><strong>${escapeHtml(childValue)}</strong></span><span><small>${vi ? "CẶP CHILD" : "CHILD PAIR"}</small><strong>${ready ? `(L=${escapeHtml(child.left)}, R=${escapeHtml(child.right)})` : "(L=?, R=?)"}</strong></span></div>
      <code>go_${side} = 1 + child.${nextDirection}</code>
      <div class="zz1372-math"><span>1</span><b>+</b><span class="needed">${hasValue(needed) ? escapeHtml(needed) : "?"}</span><b>=</b><strong>${built ? escapeHtml(goValue) : "?"}</strong></div>
    </section>`;
  };

  const candidatePath = Array.isArray(view.candidatePath) ? view.candidatePath : [];
  const candidateDirections = Array.isArray(view.candidateDirections) ? view.candidateDirections : [];
  const bestPath = Array.isArray(view.bestPath) ? view.bestPath : [];
  const bestDirections = Array.isArray(view.bestDirections) ? view.bestDirections : [];
  const displayedPath = view.event === "done" ? bestPath : candidatePath;
  const displayedDirections = view.event === "done" ? bestDirections : candidateDirections;
  const choicesHtml = view.event === "done"
    ? ""
    : `<div class="zz1372-choices">${pairCard("left", view.leftChild, view.goLeft)}${pairCard("right", view.rightChild, view.goRight)}</div>`;
  const processed = Array.isArray(view.processed) ? view.processed : [];
  const processedHtml = processed.length
    ? processed.map((item, index) => `<span class="${index === processed.length - 1 && view.event === "return-pair" ? "fresh" : ""}"><small>NODE ${escapeHtml(item.value)}</small><strong>L ${escapeHtml(item.goLeft)} · R ${escapeHtml(item.goRight)}</strong><em>local ${escapeHtml(item.localBest)} · best ${escapeHtml(item.bestAfter)}</em></span>`).join("")
    : `<b class="zz1372-empty">${vi ? "Chưa node nào return cặp" : "No node has returned a pair yet"}</b>`;

  const returnPair = view.returnPair;
  const returnHtml = view.event === "done"
    ? `<section class="zz1372-return done"><small>${vi ? "KẾT QUẢ TOÀN CỤC" : "GLOBAL RESULT"}</small><strong>${escapeHtml(view.best || 0)} ${vi ? "cạnh" : "edges"}</strong><code>${bestDirections.length ? bestDirections.join(" → ") : (vi ? "không có cạnh" : "no edge")}</code><p>${vi ? "Path có thể bắt đầu tại bất kỳ node nào." : "The path may start at any node."}</p></section>`
    : `<section class="zz1372-return ${returnPair ? "ready" : ""}"><small>${vi ? "CẶP TRẢ VỀ CHO CHA" : "PAIR RETURNED TO PARENT"}</small><strong>${returnPair ? `(L=${escapeHtml(returnPair.left)}, R=${escapeHtml(returnPair.right)})` : "(L=?, R=?)"}</strong><code>return go_left, go_right</code><p>${vi ? "Cha sẽ dùng đúng một thành phần để tiếp tục đổi hướng." : "The parent will use exactly one component to keep alternating."}</p></section>`;

  const bestBefore = hasValue(view.bestBefore) ? view.bestBefore : view.best;
  const localBest = hasValue(view.localBest) ? view.localBest : "?";
  const localHtml = view.event === "done"
    ? `<section class="zz1372-local updated"><small>${vi ? "ĐẾM SỐ CẠNH" : "COUNT THE EDGES"}</small><code>${bestDirections.length ? bestDirections.join(" → ") : (vi ? "không có hướng" : "no direction")}</code><strong>${bestDirections.length} ${vi ? "hướng =" : "directions ="} ${escapeHtml(view.best || 0)} ${vi ? "cạnh" : "edges"}</strong></section>`
    : `<section class="zz1372-local ${view.bestUpdated ? "updated" : ""}"><small>${vi ? "SO SÁNH TẠI NODE" : "COMPARE AT THIS NODE"}</small><code>local = max(${escapeHtml(view.goLeft ?? "?")}, ${escapeHtml(view.goRight ?? "?")}) = ${escapeHtml(localBest)}</code><strong>best: ${escapeHtml(bestBefore ?? 0)} ${view.bestUpdated ? "→" : "="} ${escapeHtml(view.best || 0)}</strong></section>`;
  const tone = view.event === "best-update" ? "updated" : view.event === "done" ? "done" : view.event === "build-left" || view.event === "build-right" ? "switch" : "";
  const summary = vi
    ? `Bài 1372, ${text(step.title)}. Best hiện tại là ${view.best || 0} cạnh.`
    : `Problem 1372, ${text(step.title)}. The current best is ${view.best || 0} edges.`;

  target.innerHTML = `<section class="zz1372-viz ${step.final ? "final" : ""}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="zz1372-phases">${phases}</div>
    <section class="zz1372-rule"><span><small>${vi ? "ĐI TRÁI TRƯỚC" : "START LEFT"}</small><strong>go_left = 1 + left_child.go_right</strong></span><b>⇄</b><span><small>${vi ? "ĐI PHẢI TRƯỚC" : "START RIGHT"}</small><strong>go_right = 1 + right_child.go_left</strong></span></section>
    <section class="zz1372-action ${tone}"><span><small>${escapeHtml(String(view.event || "dfs").replaceAll("-", " ").toUpperCase())}</small><strong>${escapeHtml(text(step.title))}</strong></span><em>BEST: ${escapeHtml(view.best || 0)} ${vi ? "cạnh" : "edges"}</em></section>
    <div class="zz1372-layout">
      <section class="zz1372-tree-card"><header><strong>${vi ? "CÂY · POSTORDER TỪ DƯỚI LÊN" : "TREE · BOTTOM-UP POSTORDER"}</strong><span>${step.final ? (vi ? "xanh lá = best path" : "green = best path") : (vi ? "cam = current · xanh dương = call path" : "amber = current · blue = call path")}</span></header><div id="zz1372Tree" class="zz1372-tree"></div></section>
      <aside class="zz1372-side">
        <section class="zz1372-stats"><div><small>NODE</small><strong>${escapeHtml(view.current?.value ?? "—")}</strong></div><div><small>GO LEFT</small><strong>${escapeHtml(view.goLeft ?? "—")}</strong></div><div><small>GO RIGHT</small><strong>${escapeHtml(view.goRight ?? "—")}</strong></div><div><small>BEST</small><strong>${escapeHtml(view.best || 0)}</strong></div></section>
        <section class="zz1372-stack"><header><strong>CALL STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
      </aside>
    </div>
    ${choicesHtml}
    <section class="zz1372-path"><header><strong>${view.event === "done" ? (vi ? "PATH ZIGZAG TỐT NHẤT" : "BEST ZIGZAG PATH") : (vi ? "PATH ỨNG VIÊN TẠI NODE" : "CANDIDATE PATH AT THIS NODE")}</strong><span>${vi ? "mỗi mũi tên phải đổi hướng" : "every arrow must switch direction"}</span></header><div>${pathRow(displayedPath, displayedDirections)}</div></section>
    <div class="zz1372-bottom">
      ${localHtml}
      ${returnHtml}
    </div>
    <section class="zz1372-active"><header><strong>${vi ? "PATH DFS ĐANG HOẠT ĐỘNG" : "ACTIVE DFS PATH"}</strong><span>postorder</span></header><div>${activePathHtml}</div></section>
    <section class="zz1372-processed"><header><strong>${vi ? "CÁC NODE ĐÃ CHỐT CẶP (L, R)" : "NODES WITH RESOLVED (L, R) PAIRS"}</strong><span>${vi ? "L/R = hướng của cạnh đầu tiên" : "L/R = direction of the first edge"}</span></header><div>${processedHtml}</div></section>
  </section>`;

  if (step.tree && Array.isArray(step.tree.nodes) && step.tree.nodes.length) renderTree(step, "zz1372Tree");
  else $("zz1372Tree").innerHTML = `<span class="zz1372-tree-empty">∅</span>`;
}

function renderLca236View(step) {
  const view = step.lca236View || {};
  const target = $("treeView");
  const vi = lang === "vi";
  const text = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) return pick(value);
    if (value === null || value === undefined) return "—";
    return String(value);
  };
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phases = stages.map((stage, index) => {
    const state = view.event === "done" ? "done" : index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(text(stage))}</b></span>`;
  }).join("");

  const valueOf = (node, ready) => !ready ? "?" : node ? node.value : "None";
  const targetStopsHere = String(view.decision || "").startsWith("target");
  const leftValue = targetStopsHere && !view.leftReady ? "SKIP" : valueOf(view.leftResult, view.leftReady);
  const rightValue = targetStopsHere && !view.rightReady ? "SKIP" : valueOf(view.rightResult, view.rightReady);
  const returnReady = Object.prototype.hasOwnProperty.call(view, "returnValue");
  const returnValue = valueOf(view.returnValue, returnReady);
  const decisionLabels = {
    waiting: vi ? "đang chờ" : "waiting",
    none: "RETURN NONE",
    "target-p": "RETURN P",
    "target-q": "RETURN Q",
    split: "SPLIT → LCA",
    "bubble-left": vi ? "BUBBLE TRÁI" : "BUBBLE LEFT",
    "bubble-right": vi ? "BUBBLE PHẢI" : "BUBBLE RIGHT",
    done: "LCA FOUND",
  };

  const stack = Array.isArray(view.stack) ? view.stack : [];
  const stackHtml = stack.length
    ? stack.map((frame, index) => `<li class="${index === stack.length - 1 ? "active" : ""}"><span>#${index + 1}</span><strong>${escapeHtml(frame.value)}</strong><small>${escapeHtml(frame.side)} · L=${escapeHtml(frame.left)} · R=${escapeHtml(frame.right)}</small><em>${escapeHtml(frame.stage)}</em></li>`).join("")
    : `<li class="empty">${vi ? "Call stack rỗng" : "Call stack is empty"}</li>`;

  const path = Array.isArray(view.path) ? view.path : [];
  const pathHtml = path.length
    ? path.map((node, index) => `<span class="${node.current ? "current" : ""}"><small>NODE</small><strong>${escapeHtml(node.value)}</strong></span>${index < path.length - 1 ? "<i>↓</i>" : ""}`).join("")
    : `<b class="lca236-empty">∅ ${vi ? "không có node active" : "no active node"}</b>`;

  const routeRow = (values, targetName) => {
    if (!Array.isArray(values) || !values.length) return `<b class="lca236-empty">—</b>`;
    return values.map((value, index) => `<span class="${index === 0 ? "lca" : index === values.length - 1 ? targetName.toLowerCase() : ""}"><strong>${escapeHtml(value)}</strong></span>${index < values.length - 1 ? "<i>→</i>" : ""}`).join("");
  };
  const finalRoutes = view.event === "done"
    ? `<section class="lca236-routes"><header><strong>${vi ? "HAI ĐƯỜNG TỪ LCA" : "TWO ROUTES FROM THE LCA"}</strong><span>${vi ? "node đầu tiên chung và thấp nhất" : "the first node is the lowest shared node"}</span></header><div><section><small>LCA → P</small><div>${routeRow(view.routeP, "P")}</div></section><section><small>LCA → Q</small><div>${routeRow(view.routeQ, "Q")}</div></section></div></section>`
    : "";

  const processed = Array.isArray(view.processed) ? view.processed : [];
  const processedHtml = processed.length
    ? processed.map((item, index) => `<span class="${index === processed.length - 1 && view.event !== "done" ? "fresh" : ""}"><small>NODE ${escapeHtml(item.value)}</small><strong>L ${escapeHtml(item.left)} · R ${escapeHtml(item.right)}</strong><em>${escapeHtml(String(item.decision).replaceAll("-", " "))} → ${escapeHtml(item.returned)}</em></span>`).join("")
    : `<b class="lca236-empty">${vi ? "Chưa lời gọi nào return" : "No call has returned yet"}</b>`;

  const decisions = [
    { key: "target", active: view.decision === "target-p" || view.decision === "target-q", label: vi ? "NODE LÀ P / Q" : "NODE IS P / Q", formula: "return node" },
    { key: "split", active: view.decision === "split", label: vi ? "LEFT VÀ RIGHT CÓ NODE" : "LEFT AND RIGHT HAVE NODES", formula: "return node  ← LCA" },
    { key: "bubble", active: view.decision === "bubble-left" || view.decision === "bubble-right", label: vi ? "CHỈ MỘT BÊN CÓ NODE" : "ONLY ONE SIDE HAS A NODE", formula: "return left or right" },
  ];
  const decisionHtml = decisions.map(item => `<span class="${item.active ? `active ${item.key}` : ""}"><small>${escapeHtml(item.label)}</small><strong>${escapeHtml(item.formula)}</strong></span>`).join("");
  const tone = view.decision === "split" || view.event === "done" ? "split" : String(view.decision || "").startsWith("target") ? "target" : String(view.decision || "").startsWith("bubble") ? "bubble" : "";
  const summary = vi
    ? `Bài 236, ${text(step.title)}. LCA hiện tại là ${view.lca?.value ?? "chưa xác định"}.`
    : `Problem 236, ${text(step.title)}. The current LCA is ${view.lca?.value ?? "not determined"}.`;

  target.innerHTML = `<section class="lca236-viz ${step.final ? "final" : ""}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="lca236-phases">${phases}</div>
    <section class="lca236-rule"><span><small>BASE / TARGET</small><strong>None → None · p/q → itself</strong></span><b>→</b><span><small>${vi ? "SAU HAI LỜI GỌI" : "AFTER BOTH CALLS"}</small><strong>both → node · one → bubble · none → None</strong></span></section>
    <section class="lca236-action ${tone}"><span><small>${escapeHtml(String(view.event || "dfs").replaceAll("-", " ").toUpperCase())}</small><strong>${escapeHtml(text(step.title))}</strong></span><em>${escapeHtml(decisionLabels[view.event === "done" ? "done" : view.decision] || view.decision || "waiting")}</em></section>
    <div class="lca236-layout">
      <section class="lca236-tree-card"><header><strong>${vi ? "CÂY VÀ TÍN HIỆU RETURN" : "TREE AND RETURN SIGNALS"}</strong><span>${step.final ? (vi ? "xanh lá = hai route từ LCA" : "green = both routes from LCA") : (vi ? "cam = current · P/Q luôn được gắn nhãn" : "amber = current · P/Q stay labeled")}</span></header><div id="lca236Tree" class="lca236-tree"></div></section>
      <aside class="lca236-side">
        <section class="lca236-targets"><div class="p"><small>P</small><strong>${escapeHtml(view.p?.value ?? "—")}</strong></div><div class="q"><small>Q</small><strong>${escapeHtml(view.q?.value ?? "—")}</strong></div><div><small>CURRENT</small><strong>${escapeHtml(view.current?.value ?? "—")}</strong></div><div class="answer"><small>LCA</small><strong>${escapeHtml(view.lca?.value ?? "—")}</strong></div></section>
        <section class="lca236-returns"><header><strong>${vi ? "KẾT QUẢ TRỞ VỀ NODE HIỆN TẠI" : "RESULTS RETURNED TO THE CURRENT NODE"}</strong><span>${vi ? "None = không thấy target" : "None = no target found"}</span></header><div><span><small>LEFT</small><strong>${escapeHtml(leftValue)}</strong></span><b>+</b><span><small>RIGHT</small><strong>${escapeHtml(rightValue)}</strong></span><b>→</b><span class="result"><small>RETURN</small><strong>${escapeHtml(returnValue)}</strong></span></div></section>
        <section class="lca236-stack"><header><strong>CALL STACK</strong><span>${vi ? "frame cuối đang chạy" : "last frame is active"}</span></header><ol>${stackHtml}</ol></section>
      </aside>
    </div>
    <section class="lca236-decisions"><header><strong>${vi ? "BA TRƯỜNG HỢP TRẢ NODE" : "THREE NODE-RETURN CASES"}</strong><span>${vi ? "ô sáng là quyết định hiện tại" : "the highlighted case is active"}</span></header><div>${decisionHtml}</div></section>
    ${finalRoutes}
    <section class="lca236-path"><header><strong>${vi ? "PATH DFS ĐANG HOẠT ĐỘNG" : "ACTIVE DFS PATH"}</strong><span>root → current</span></header><div>${pathHtml}</div></section>
    <section class="lca236-processed"><header><strong>${vi ? "CÁC LỜI GỌI ĐÃ RETURN" : "CALLS THAT HAVE RETURNED"}</strong><span>${vi ? "left · right · quyết định · kết quả" : "left · right · decision · result"}</span></header><div>${processedHtml}</div></section>
  </section>`;

  if (step.tree && Array.isArray(step.tree.nodes) && step.tree.nodes.length) renderTree(step, "lca236Tree");
  else $("lca236Tree").innerHTML = `<span class="lca236-tree-empty">∅</span>`;
}

function renderTreeEssentialsView(step) {
  const view = step.treeEssentialsView || {};
  const target = $("treeView");
  const vi = lang === "vi";
  const stages = Array.isArray(view.stages) ? view.stages : [];
  const stageIndex = Number.isInteger(view.stage) ? view.stage : 0;
  const phaseHtml = stages.map((stage, index) => {
    const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><i>${state === "done" ? "✓" : index + 1}</i><b>${escapeHtml(pick(stage))}</b></span>`;
  }).join("");
  const statusClass = view.status === "match" ? "success" : view.status === "mismatch" ? "danger" : "checking";
  const defaultStatus = view.status === "match"
    ? (vi ? "Khớp" : "Match")
    : view.status === "mismatch"
      ? (vi ? "Không khớp" : "Mismatch")
      : (vi ? "Đang xét" : "Checking");
  const panels = Array.isArray(view.panels) ? view.panels : [];
  const panelHtml = panels.map((panel, index) => `<section class="te-tree-panel">
    <header><strong>${escapeHtml(pick(panel.label))}</strong><span>${escapeHtml(pick(panel.caption || ""))}</span></header>
    <div id="treeEssentialsTree${index}" class="te-tree-canvas"></div>
  </section>`).join("");
  const cards = Array.isArray(view.cards) ? view.cards : [];
  const cardsHtml = cards.length ? `<div class="te-cards">${cards.map((card) => `<section class="te-card ${escapeHtml(card.tone || "neutral")}">
    <small>${escapeHtml(pick(card.label))}</small><strong>${escapeHtml(card.value)}</strong>${card.detail ? `<span>${escapeHtml(pick(card.detail))}</span>` : ""}
  </section>`).join("")}</div>` : "";
  const sequences = Array.isArray(view.sequences) ? view.sequences : [];
  const sequenceHtml = sequences.length ? `<section class="te-sequences">${sequences.map((sequence) => {
    const values = Array.isArray(sequence.values) ? sequence.values : [];
    const tokens = values.length
      ? values.map((value, index) => `<b class="${index === sequence.activeIndex ? "active" : ""}">${escapeHtml(value)}</b>`).join("<i>→</i>")
      : `<em>∅</em>`;
    return `<div class="${escapeHtml(sequence.tone || "neutral")}"><small>${escapeHtml(pick(sequence.label))}</small><span>${tokens}</span></div>`;
  }).join("")}</section>` : "";
  const summary = vi
    ? `Bài ${view.problemId}: ${pick(step.title)}. ${pick(view.statusText) || defaultStatus}.`
    : `Problem ${view.problemId}: ${pick(step.title)}. ${pick(view.statusText) || defaultStatus}.`;
  const mirror = view.mirror;
  const mirrorValue = (side) => side && side.value !== undefined ? side.value : "∅";
  const mirrorPath = (side, compact) => side && (compact ? side.shortPath || side.path : side.path) ? (compact ? side.shortPath || side.path : side.path) : "—";
  const mirrorPairHtml = (pair, compact = false) => {
    if (!pair) return "";
    const pairStatus = pair.verdict === "match" ? "match" : pair.verdict === "mismatch" ? "mismatch" : "waiting";
    return `<article class="te-mirror-pair ${pairStatus}${compact ? " compact" : ""}">
      <div><small>${escapeHtml(pair.role || (vi ? "CẶP GƯƠNG" : "MIRROR PAIR"))}</small><strong>${escapeHtml(mirrorValue(pair.left))}</strong><code>${escapeHtml(mirrorPath(pair.left, compact))}</code></div>
      <span><b>↔</b><em>${pairStatus === "match" ? "MATCH" : pairStatus === "mismatch" ? "MISMATCH" : (vi ? "SO SÁNH" : "COMPARE")}</em></span>
      <div><small>${escapeHtml(pair.role || (vi ? "CẶP GƯƠNG" : "MIRROR PAIR"))}</small><strong>${escapeHtml(mirrorValue(pair.right))}</strong><code>${escapeHtml(mirrorPath(pair.right, compact))}</code></div>
    </article>`;
  };
  const mirrorHtml = mirror ? `<section class="te-mirror-guide">
    <header><span><small>${vi ? "MỘT QUY TẮC DUY NHẤT" : "ONE RULE TO REMEMBER"}</small><strong>${vi ? "SO CHÉO QUA TRỤC GIỮA" : "COMPARE ACROSS THE CENTER AXIS"}</strong></span><code>OUTER: L.left ↔ R.right&nbsp;&nbsp;·&nbsp;&nbsp;INNER: L.right ↔ R.left</code></header>
    ${mirrorPairHtml(mirror.current)}
    ${Array.isArray(mirror.nextPairs) && mirror.nextPairs.length ? `<div class="te-mirror-branches"><span>${vi ? "HAI LỜI GỌI CON" : "TWO CHILD CALLS"}</span>${mirror.nextPairs.map((pair) => mirrorPairHtml(pair, true)).join("")}</div>` : ""}
  </section>` : "";

  target.innerHTML = `<section class="te-viz te-${escapeHtml(view.mode || "tree")}" role="img" aria-label="${escapeHtml(summary)}">
    <div class="te-phases">${phaseHtml}</div>
    <section class="te-action ${statusClass}">
      <span><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${escapeHtml(pick(step.title))}</strong></span>
      <em>${escapeHtml(pick(view.statusText) || defaultStatus)}</em>
    </section>
    ${mirrorHtml}
    <div class="te-tree-grid count-${panels.length}">${panelHtml}</div>
    ${cardsHtml}
    ${sequenceHtml}
    <div class="te-legend" aria-hidden="true">
      <span><i class="current"></i>${vi ? "node hiện tại" : "current node"}</span>
      <span><i class="done"></i>${vi ? "đã khớp / đã xử lý" : "matched / processed"}</span>
      <span><i class="bad"></i>${vi ? "không khớp / bị loại" : "mismatch / rejected"}</span>
    </div>
  </section>`;

  panels.forEach((panel, index) => {
    const panelTarget = $(`treeEssentialsTree${index}`);
    if (!panel.tree || !Array.isArray(panel.tree.nodes) || panel.tree.nodes.length === 0) {
      panelTarget.innerHTML = `<span class="te-empty">∅</span>`;
      return;
    }
    renderTree({ tree: panel.tree }, `treeEssentialsTree${index}`);
  });
}

function renderSortedListBstView(step) {
  const view = step.sortedListBstView;
  const treeView = $("treeView");
  const isArrayMode = view.mode === "array";
  const activeRange = Array.isArray(view.activeRange) ? view.activeRange : null;
  const arrayRange = Array.isArray(view.arrayRange) ? view.arrayRange : null;
  const arrayValues = Array.isArray(view.arrayValues) ? view.arrayValues : [];
  const cuts = new Set(view.cuts || []);
  const picked = new Set(view.picked || []);
  const pointers = view.pointers || {};
  const pointerNames = isArrayMode ? ["head"] : ["head", "prev", "slow", "fast"];
  const pointerClasses = { head: "head", prev: "prev", slow: "slow", fast: "fast" };
  const pointerMap = new Map();

  pointerNames.forEach((name) => {
    const pointer = pointers[name];
    if (!pointer || pointer.state !== "index") return;
    if (!pointerMap.has(pointer.index)) pointerMap.set(pointer.index, []);
    pointerMap.get(pointer.index).push(name);
  });

  const pointerValue = (name) => {
    const pointer = pointers[name] || { state: "unset" };
    if (pointer.state === "unset") return lang === "vi" ? "chưa gán" : "unset";
    if (pointer.state === "null") return "null";
    const value = view.values[pointer.index];
    return `${value} [${pointer.index}]`;
  };

  const listHtml = view.values.map((value, index) => {
    const inRange = activeRange && index >= activeRange[0] && index <= activeRange[1];
    const labels = pointerMap.get(index) || [];
    const nodeClasses = ["slb-node"];
    if (activeRange && !inRange) nodeClasses.push("outside");
    if (isArrayMode && index < (view.copiedCount || 0)) nodeClasses.push("copied");
    if (!isArrayMode && picked.has(index)) nodeClasses.push("picked");
    if (labels.length) nodeClasses.push("pointed");
    const tags = labels.map((name) => `<span class="slb-pointer ${pointerClasses[name]}">${name}</span>`).join("");
    const connector = index < view.values.length - 1
      ? `<span class="slb-link${cuts.has(index) ? " is-cut" : ""}">
          <strong>${cuts.has(index) ? "×" : "→"}</strong>
          ${cuts.has(index) ? `<small>${lang === "vi" ? "đã cắt" : "cut"}</small>` : ""}
        </span>`
      : "";
    return `<div class="slb-list-item">
      <div class="slb-pointer-stack">${tags}</div>
      <div class="${nodeClasses.join(" ")}">
        <strong>${escapeHtml(value)}</strong>
        <small>[${index}]</small>
      </div>
    </div>${connector}`;
  }).join("");

  const statusItem = (name, value, className = "") => `<span class="slb-status ${className}">
    <code>${name}</code><strong>${escapeHtml(value)}</strong>
  </span>`;
  const unsetLabel = lang === "vi" ? "chưa gán" : "unset";
  const statusHtml = isArrayMode
    ? [
        statusItem("head", pointerValue("head"), "head"),
        statusItem("vals", `[${arrayValues.join(", ")}]`, "array"),
        statusItem("lo", view.lo === null || view.lo === undefined ? unsetLabel : view.lo, "range"),
        statusItem("hi", view.hi === null || view.hi === undefined ? unsetLabel : view.hi, "range"),
        statusItem("mid", view.midAssigned ? `${view.mid} → ${view.values[view.mid]}` : unsetLabel, "mid"),
      ].join("")
    : pointerNames.map((name) => statusItem(name, pointerValue(name), pointerClasses[name])).join("");

  const stackHtml = (view.callStack || []).length
    ? view.callStack.map((frame, index) => {
        const range = frame.lo <= frame.hi ? `[${frame.lo}..${frame.hi}]` : "∅";
        const active = index === view.callStack.length - 1 ? " active" : "";
        return `<span class="slb-frame${active}"><small>${escapeHtml(frame.side)}</small><code>${range}</code></span>`;
      }).join('<span class="slb-stack-arrow">›</span>')
    : isArrayMode && view.phase !== "done"
      ? `<span class="slb-frame active"><small>${lang === "vi" ? "hàm chính" : "main"}</small><code>sortedListToBST</code></span>`
      : `<span class="slb-frame active"><small>${lang === "vi" ? "xong" : "done"}</small><code>root</code></span>`;

  const activeLabel = activeRange
    ? `[${activeRange[0]}..${activeRange[1]}]`
    : "∅";
  const arrayRangeLabel = arrayRange ? `[${arrayRange[0]}..${arrayRange[1]}]` : "∅";
  const summary = isArrayMode
    ? lang === "vi"
      ? `Đã copy ${view.copiedCount || 0} trên ${view.values.length} node vào vals. Đoạn preorder hiện tại ${arrayRangeLabel}.`
      : `Copied ${view.copiedCount || 0} of ${view.values.length} nodes into vals. Current preorder range ${arrayRangeLabel}.`
    : lang === "vi"
      ? `Đoạn list hiện tại ${activeLabel}. head ${pointerValue("head")}, prev ${pointerValue("prev")}, slow ${pointerValue("slow")}, fast ${pointerValue("fast")}.`
      : `Current list segment ${activeLabel}. head ${pointerValue("head")}, prev ${pointerValue("prev")}, slow ${pointerValue("slow")}, fast ${pointerValue("fast")}.`;

  const arrayCells = isArrayMode
    ? view.values.map((_, index) => {
        const classes = ["slb-array-cell"];
        const filled = index < arrayValues.length;
        if (filled) classes.push("filled");
        if (arrayRange && index >= arrayRange[0] && index <= arrayRange[1]) classes.push("in-range");
        if (picked.has(index)) classes.push("picked");
        if (view.midAssigned && index === view.mid) classes.push("mid");
        return `<div class="${classes.join(" ")}">
          <span>${index}</span>
          <strong>${filled ? escapeHtml(arrayValues[index]) : "·"}</strong>
          ${view.midAssigned && index === view.mid ? "<small>mid</small>" : ""}
        </div>`;
      }).join("")
    : "";

  const arrayPanel = isArrayMode
    ? `<section class="slb-array-panel">
        <div class="slb-section-title">
          <strong><code>vals</code></strong>
          <span>${arrayValues.length}/${view.values.length} ${lang === "vi" ? "phần tử đã copy" : "values copied"} · ${lang === "vi" ? "đoạn preorder" : "preorder range"} <code>${arrayRangeLabel}</code></span>
        </div>
        <div class="slb-array-scroll"><div class="slb-array-row">${arrayCells}</div></div>
      </section>`
    : "";

  const legendHtml = isArrayMode
    ? `<span><i class="copied-node"></i>${lang === "vi" ? "đã copy vào vals" : "copied into vals"}</span>
       <span><i class="active-range"></i>${lang === "vi" ? "vals[lo..hi]" : "vals[lo..hi]"}</span>
       <span><i class="mid-node"></i>${lang === "vi" ? "mid / root mới" : "mid / new root"}</span>`
    : `<span><i class="active-range"></i>${lang === "vi" ? "đoạn hiện tại" : "active segment"}</span>
       <span><i class="picked-node"></i>${lang === "vi" ? "đã đưa vào BST" : "moved to BST"}</span>
       <span><i class="cut-link"></i>prev.next = None</span>`;

  treeView.innerHTML = `<div class="sorted-list-bst-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="slb-call-stack">
      <strong>${lang === "vi" ? "STACK ĐỆ QUY" : "RECURSION STACK"}</strong>
      <div>${stackHtml}</div>
    </div>
    <div class="slb-status-row${isArrayMode ? " array-mode" : ""}">${statusHtml}</div>
    <section class="slb-list-panel">
      <div class="slb-section-title">
        <strong>${isArrayMode ? (lang === "vi" ? "Linked list nguồn" : "Source linked list") : "Linked list"}</strong>
        <span>${isArrayMode
          ? `${view.copiedCount || 0}/${view.values.length} ${lang === "vi" ? "node đã đọc" : "nodes read"}`
          : `${lang === "vi" ? "đoạn đang xử lý" : "active segment"} <code>${activeLabel}</code>`}</span>
      </div>
      <div class="slb-list-scroll"><div class="slb-list-row">${listHtml}</div></div>
    </section>
    ${arrayPanel}
    <section class="slb-tree-panel">
      <div class="slb-section-title">
        <strong>${lang === "vi" ? "BST đang dựng" : "BST under construction"}</strong>
        <span>${picked.size}/${view.values.length} ${lang === "vi" ? "node đã chọn làm root" : "nodes selected as roots"}</span>
      </div>
      <div id="sortedListBstTree" class="slb-tree-canvas"></div>
    </section>
    <div class="slb-legend" aria-hidden="true">
      ${legendHtml}
    </div>
  </div>`;

  if (view.tree && view.tree.nodes && view.tree.nodes.length) {
    renderTree({ tree: view.tree }, "sortedListBstTree");
  } else {
    $("sortedListBstTree").innerHTML = `<span class="slb-tree-empty">∅</span>`;
  }
}

function renderKeypadPushView(step) {
  const view = step.keypadPushView;
  const treeView = $("treeView");
  const assignments = Array.isArray(view.assignments) ? view.assignments : [];
  const assignmentBySlot = new Map(assignments.map((item) => [`${item.key}:${item.cost}`, item]));
  const currentAssignment = assignments.find((item) => item.index === view.currentIndex);
  const unset = lang === "vi" ? "chưa gán" : "unset";
  const pushLabel = (count) => lang === "vi" ? `${count} lần` : `${count} push${count === 1 ? "" : "es"}`;

  const wordHtml = view.word.map((ch, index) => {
    const assignment = assignments.find((item) => item.index === index);
    const classes = ["kp-word-cell"];
    if (index < view.processedCount) classes.push("done");
    if (index === view.currentIndex) classes.push("current");
    const detail = assignment
      ? `${lang === "vi" ? "phím" : "key"} ${assignment.key} · ${pushLabel(assignment.cost)}`
      : index === view.currentIndex
        ? (lang === "vi" ? "đang xử lý" : "processing")
        : "—";
    return `<div class="${classes.join(" ")}">
      <small>[${index}]</small>
      <strong>${escapeHtml(ch)}</strong>
      <span>${escapeHtml(detail)}</span>
    </div>`;
  }).join("");

  const headerHtml = Array.from({ length: 8 }, (_, offset) => {
    const key = offset + 2;
    const active = key === view.key ? " active" : "";
    return `<div class="kp-key-head${active}"><small>${lang === "vi" ? "PHÍM" : "KEY"}</small><strong>${key}</strong></div>`;
  }).join("");

  const layerRows = Array.from({ length: 4 }, (_, layerIndex) => {
    const cost = layerIndex + 1;
    const slots = Array.from({ length: 8 }, (_, offset) => {
      const key = offset + 2;
      const assigned = assignmentBySlot.get(`${key}:${cost}`);
      const isTarget = key === view.key && cost === view.cost;
      const isPending = isTarget && !assigned && view.currentIndex !== null;
      const classes = ["kp-slot"];
      if (assigned) classes.push("filled");
      if (isTarget) classes.push("active");
      if (isPending) classes.push("pending");
      const letter = assigned ? assigned.ch : isPending ? view.word[view.currentIndex] : "·";
      const slotState = assigned
        ? `${lang === "vi" ? "đã gán" : "assigned"} ${assigned.ch}`
        : isPending
          ? `${lang === "vi" ? "sắp gán" : "pending"} ${view.word[view.currentIndex]}`
          : (lang === "vi" ? "trống" : "empty");
      return `<div class="${classes.join(" ")}" aria-label="${lang === "vi" ? "Phím" : "Key"} ${key}, ${pushLabel(cost)}, ${escapeHtml(slotState)}">
        <strong>${escapeHtml(letter)}</strong>
      </div>`;
    }).join("");
    const activeLayer = cost === view.cost ? " active" : "";
    return `<div class="kp-layer-label${activeLayer}"><strong>${cost}×</strong></div>${slots}`;
  }).join("");

  const iValue = view.currentIndex === null ? unset : view.currentIndex;
  const chValue = view.currentIndex === null ? unset : `'${view.word[view.currentIndex]}'`;
  const groupValue = view.currentIndex === null
    ? unset
    : `[${Math.floor(view.currentIndex / 8) * 8}..${Math.min(Math.floor(view.currentIndex / 8) * 8 + 7, view.word.length - 1)}]`;
  const costValue = view.cost === null ? unset : `${view.currentIndex} // 8 + 1 = ${view.cost}`;
  const summary = lang === "vi"
    ? `Đã gán ${assignments.length} trên ${view.word.length} chữ. Tổng hiện tại ${view.pushes} lần nhấn.`
    : `Assigned ${assignments.length} of ${view.word.length} letters. Current total: ${view.pushes} pushes.`;

  treeView.innerHTML = `<div class="keypad-push-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="kp-status-row">
      <span><small>i / word[i]</small><strong>${escapeHtml(iValue)} / ${escapeHtml(chValue)}</strong></span>
      <span class="${view.currentIndex !== null ? "active" : ""}"><small>${lang === "vi" ? "nhóm 8 ký tự" : "group of 8"}</small><strong>${escapeHtml(groupValue)}</strong></span>
      <span class="${view.cost !== null ? "active" : ""}"><small>i // 8 + 1</small><strong>${escapeHtml(costValue)}</strong></span>
      <span class="total"><small>pushes</small><strong>${escapeHtml(view.pushes)}</strong></span>
    </div>
    <section class="kp-word-section">
      <div class="kp-section-title"><strong>word</strong><span>${assignments.length}/${view.word.length} ${lang === "vi" ? "chữ đã gán" : "letters assigned"}</span></div>
      <div class="kp-word-scroll"><div class="kp-word-row">${wordHtml}</div></div>
    </section>
    <section class="kp-board-section">
      <div class="kp-section-title"><strong>${lang === "vi" ? "Bản đồ phím 2–9" : "Key map 2–9"}</strong><span>${lang === "vi" ? "tầng càng sâu → nhấn càng nhiều" : "deeper layer → more pushes"}</span></div>
      <div class="kp-board-scroll">
        <div class="kp-board-grid">
          <div class="kp-board-corner">${lang === "vi" ? "CHI PHÍ" : "COST"}</div>
          ${headerHtml}
          ${layerRows}
        </div>
      </div>
    </section>
    <div class="kp-current-action">
      ${currentAssignment
        ? `<strong>pushes += ${currentAssignment.cost}</strong><span>${lang === "vi" ? `cho word[${currentAssignment.index}] = '${escapeHtml(currentAssignment.ch)}'` : `for word[${currentAssignment.index}] = '${escapeHtml(currentAssignment.ch)}'`}</span>`
        : view.currentIndex !== null
          ? `<strong>'${escapeHtml(view.word[view.currentIndex])}'</strong><span>${view.cost !== null
              ? `→ ${lang === "vi" ? "phím" : "key"} ${view.key}, ${pushLabel(view.cost)}`
              : view.key !== null
                ? `→ ${lang === "vi" ? "phím" : "key"} ${view.key}`
                : `→ ${lang === "vi" ? "đang đọc word[i]" : "reading word[i]"}`}</span>`
          : `<strong>${view.phase === "done" ? (lang === "vi" ? "HOÀN TẤT" : "COMPLETE") : "word"}</strong><span>${view.phase === "done" ? `${view.pushes} ${lang === "vi" ? "lần nhấn" : "pushes"}` : (lang === "vi" ? "chưa gán chữ nào" : "no letters assigned yet")}</span>`}
    </div>
  </div>`;
}

function renderKeypadHeapView(step) {
  const view = step.keypadHeapView;
  const treeView = $("treeView");
  const isVi = lang === "vi";
  const unset = isVi ? "chưa gán" : "unset";
  const assignments = Array.isArray(view.assignments) ? view.assignments : [];
  const assignmentBySlot = new Map(assignments.map((item) => [`${item.key}:${item.cost}`, item]));
  const phaseStages = {
    input: 0, count: 0,
    "heap-init": 1, "heap-loop": 1, "heap-push": 1,
    "ans-init": 2, "index-init": 2, while: 2, pop: 2, presses: 2, add: 2, increment: 2, "while-done": 2,
    done: 3,
  };
  const activeStage = phaseStages[view.phase] ?? 0;
  const stageLabels = isVi
    ? ["1 · Đếm tần suất", "2 · Tạo max heap", "3 · Lấy lớn nhất trước", "4 · Trả kết quả"]
    : ["1 · Count frequencies", "2 · Build max heap", "3 · Process largest first", "4 · Return result"];
  const stagesHtml = stageLabels.map((label, index) => {
    const state = index < activeStage ? "done" : index === activeStage ? "active" : "pending";
    return `<span class="${state}">${escapeHtml(label)}</span>`;
  }).join("");

  const frequencyHtml = view.freqEntries.map((entry, index) => {
    const visible = index < view.visibleFreqCount;
    const active = index === view.activeFreqIndex ? " active" : "";
    return `<span class="kph-frequency${visible ? " visible" : " hidden-value"}${active}">
      <strong>${visible ? escapeHtml(entry.ch) : "·"}</strong>
      <small>${visible ? `f=${escapeHtml(entry.count)}` : "?"}</small>
    </span>`;
  }).join("");

  const heapHtml = view.heap.length
    ? view.heap.map((stored, index) => `<span class="kph-heap-item${index === 0 ? " root" : ""}">
        <small>${index === 0 ? "ROOT" : `[${index}]`}</small>
        <strong>${escapeHtml(stored)}</strong>
        <em>f=${escapeHtml(-stored)}</em>
      </span>`).join("")
    : `<span class="kph-empty">[]</span>`;

  const headerHtml = Array.from({ length: 8 }, (_, offset) => {
    const key = offset + 2;
    const activeIndex = view.activeAssignmentIndex;
    const activeKey = activeIndex === null ? null : 2 + (activeIndex % 8);
    return `<div class="kp-key-head${key === activeKey ? " active" : ""}"><small>${isVi ? "PHÍM" : "KEY"}</small><strong>${key}</strong></div>`;
  }).join("");

  const layerRows = Array.from({ length: 4 }, (_, layerIndex) => {
    const cost = layerIndex + 1;
    const slots = Array.from({ length: 8 }, (_, offset) => {
      const key = offset + 2;
      const assigned = assignmentBySlot.get(`${key}:${cost}`);
      const isActive = assigned && assigned.index === view.activeAssignmentIndex;
      const pendingIndex = view.activeAssignmentIndex;
      const pendingKey = pendingIndex === null ? null : 2 + (pendingIndex % 8);
      const isPending = !assigned && view.presses !== null && key === pendingKey && cost === view.presses;
      const classes = ["kp-slot", "kph-slot"];
      if (assigned) classes.push("filled");
      if (isActive || isPending) classes.push("active");
      if (isPending) classes.push("pending");
      const frequency = assigned ? assigned.frequency : isPending ? view.frequency : null;
      const contribution = assigned ? assigned.contribution : isPending ? view.frequency * view.presses : null;
      const slotLabel = frequency === null
        ? (isVi ? "trống" : "empty")
        : `frequency ${frequency}, ${cost} ${isVi ? "lần nhấn" : (cost === 1 ? "push" : "pushes")}, +${contribution}`;
      return `<div class="${classes.join(" ")}" aria-label="${isVi ? "Phím" : "Key"} ${key}, ${cost}×, ${escapeHtml(slotLabel)}">
        <strong>${frequency === null ? "·" : `f${escapeHtml(frequency)}`}</strong>
        ${frequency === null ? "" : `<small>+${escapeHtml(contribution)}</small>`}
      </div>`;
    }).join("");
    return `<div class="kp-layer-label${cost === view.presses ? " active" : ""}"><strong>${cost}×</strong></div>${slots}`;
  }).join("");

  const actionByPhase = {
    input: ["word", isVi ? "chờ Counter(word)" : "waiting for Counter(word)"],
    count: ["Counter(word)", `${view.freqEntries.length} ${isVi ? "tần suất" : "frequencies"}`],
    "heap-init": ["max_heap = []", isVi ? "heap đang rỗng" : "the heap is empty"],
    "heap-loop": [`f = ${view.frequency}`, "freq.values()"],
    "heap-push": [`heappush(-${view.frequency})`, isVi ? "số âm nhỏ nhất ở root" : "smallest negative value at root"],
    "ans-init": ["ans = 0", isVi ? "bắt đầu cộng kết quả" : "start accumulating"],
    "index-init": ["index = 0", isVi ? "ô rẻ nhất đầu tiên" : "first cheapest slot"],
    while: ["while max_heap", `${view.heap.length} ${isVi ? "phần tử còn lại" : "items remain"}`],
    pop: [`frequency = ${view.frequency}`, "-heappop(max_heap)"],
    presses: [`presses = ${view.presses}`, `${view.index} // 8 + 1`],
    add: [`ans += ${view.frequency} × ${view.presses}`, `ans = ${view.ans}`],
    increment: [`index += 1`, `index = ${view.index}`],
    "while-done": ["max_heap = []", isVi ? "thoát vòng while" : "exit the while loop"],
    done: [`return ${view.ans}`, isVi ? "hoàn tất" : "complete"],
  };
  const [actionMain, actionDetail] = actionByPhase[view.phase] || ["", ""];
  const summary = isVi
    ? `Heap có ${view.heap.length} phần tử, index ${view.index ?? "chưa gán"}, ans ${view.ans ?? "chưa gán"}.`
    : `The heap has ${view.heap.length} items, index ${view.index ?? "unset"}, ans ${view.ans ?? "unset"}.`;

  treeView.innerHTML = `<div class="keypad-heap-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="kph-phases">${stagesHtml}</div>
    <div class="kp-status-row">
      <span><small>frequency</small><strong>${view.frequency === null ? unset : escapeHtml(view.frequency)}</strong></span>
      <span class="${view.presses !== null ? "active" : ""}"><small>presses</small><strong>${view.presses === null ? unset : escapeHtml(view.presses)}</strong></span>
      <span class="${view.index !== null ? "active" : ""}"><small>index</small><strong>${view.index === null ? unset : escapeHtml(view.index)}</strong></span>
      <span class="total"><small>ans</small><strong>${view.ans === null ? unset : escapeHtml(view.ans)}</strong></span>
    </div>
    <div class="kph-data-grid">
      <section class="kph-data-section">
        <div class="kp-section-title"><strong>freq = Counter(word)</strong><span>${view.visibleFreqCount}/${view.freqEntries.length}</span></div>
        <div class="kph-frequency-row">${frequencyHtml}</div>
      </section>
      <section class="kph-data-section">
        <div class="kp-section-title"><strong>max_heap</strong><span>${isVi ? "lưu -f" : "stores -f"}</span></div>
        <div class="kph-heap-row">${heapHtml}</div>
      </section>
    </div>
    <section class="kp-board-section">
      <div class="kp-section-title"><strong>${isVi ? "Gán tần suất vào phím 2–9" : "Assign frequencies to keys 2–9"}</strong><span>f × presses → ans</span></div>
      <div class="kp-board-scroll">
        <div class="kp-board-grid">
          <div class="kp-board-corner">${isVi ? "CHI PHÍ" : "COST"}</div>
          ${headerHtml}
          ${layerRows}
        </div>
      </div>
    </section>
    <div class="kp-current-action"><strong>${escapeHtml(actionMain)}</strong><span>${escapeHtml(actionDetail)}</span></div>
  </div>`;
}

function renderDecisionTree(step) {
  renderTree({ tree: step.decisionTree }, "decisionTreeView");
}
