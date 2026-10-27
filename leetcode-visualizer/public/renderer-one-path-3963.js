function renderOnePath3963Pictures(step) {
  const v = step.onePath3963View, esc = value => escapeHtml(String(value)), t = (vi, en) => lang === "vi" ? vi : en;
  const done = v.phase === "done", selecting = v.phase.startsWith("select"), writing = v.phase.startsWith("open");
  const stage = v.phase === "init" ? 0 : v.phase.includes("top") ? 1 : 2;
  const pitch = 52, left = 32, top = 30, width = left + v.n * pitch + 6, height = top + v.m * pitch + 12;
  const center = ([r, c]) => [left + c * pitch + 23, top + r * pitch + 23];
  const key = point => point ? point.join(",") : "";
  const focusKey = key(v.focus), routeOrder = new Map(v.route.map((point, i) => [key(point), i + 1]));
  let tiles = "", labels = "", axes = "";
  for (let c = 0; c < v.n; c++) axes += `<text class="op3963-axis" x="${center([0, c])[0]}" y="17">${c}</text>`;
  for (let r = 0; r < v.m; r++) {
    axes += `<text class="op3963-axis" x="15" y="${center([r, 0])[1] + 4}">${r}</text>`;
    for (let c = 0; c < v.n; c++) {
      const cellKey = `${r},${c}`, value = v.grid[r][c], free = value === ".", active = cellKey === focusKey;
      const x = left + c * pitch, y = top + r * pitch, start = r === 0 && c === 0, target = r === v.m - 1 && c === v.n - 1;
      tiles += `<g class="op3963-cell ${free ? "free" : "wall"} ${r === 0 ? "top-row" : "right-column"} ${active ? "focus" : ""} ${selecting && active ? "preview" : ""}" data-cell="${cellKey}" data-value="${value}"><title>(${cellKey}) · ${value}${start ? " · S" : ""}${target ? " · T" : ""}</title><rect x="${x}" y="${y}" width="46" height="46" rx="9"/>${free ? "" : `<rect class="op3963-hatch" x="${x + 1}" y="${y + 1}" width="44" height="44" rx="8"/>`}</g>`;
      const symbol = start && target ? "S/T" : start ? "S" : target ? "T" : free ? "·" : "#";
      labels += `<g class="op3963-cell-label ${free ? "free" : "wall"} ${start ? "start" : ""} ${target ? "target" : ""}" aria-hidden="true"><text x="${x + 23}" y="${y + 29}" class="op3963-symbol ${start && target ? "combined" : ""}">${symbol}</text>${free ? `<text class="op3963-order" x="${x + 38}" y="${y + 40}">${routeOrder.get(cellKey)}</text>` : ""}</g>`;
    }
  }
  const routeLine = v.route.length > 1 ? `<path class="op3963-route" d="${v.route.map((p, i) => `${i ? "L" : "M"}${center(p).join(" ")}`).join("")}"/>` : "";
  const arrows = v.route.slice(1).map((to, i) => {
    const from = v.route[i], [x1, y1] = center(from), [x2, y2] = center(to), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return `<path class="op3963-direction" data-route-edge="${key(from)}:${key(to)}" d="${from[0] === to[0] ? `M${mx - 5} ${my}H${mx + 4}` : `M${mx} ${my - 5}V${my + 4}`}" marker-end="url(#op3963-arrow)"/>`;
  }).join("");
  const blockedTurns = v.m > 1 ? v.route.filter(([r, c]) => r === 0 && c < v.n - 1).map(([, c]) => {
    const [x, y] = center([0, c]);
    return `<path class="op3963-blocked-turn" d="M${x} ${y + 15}v20m-4 -4l8 8m-8 0l8 -8"/>`;
  }).join("") : "";
  const board = `<div class="op3963-board-scroll"><svg class="op3963-board" style="min-width:${v.n > 8 ? v.n * 34 + left : 0}px;max-width:${Math.max(130, v.n * 78 + left)}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t(`Lưới ${v.m} hàng, ${v.n} cột; ${v.openCount} ô trống; ${v.pathCount} đường từ S đến T`, `${v.m} rows, ${v.n} columns; ${v.openCount} free cells; ${v.pathCount} paths from S to T`))}"><defs><pattern id="op3963-hatch" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 7L7 0M6 8L8 6"/></pattern><marker id="op3963-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5"/></marker></defs>${axes}${tiles}${routeLine}${blockedTurns}${arrows}${labels}</svg></div>`;
  const mini = index => `<svg viewBox="0 0 64 48" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<rect class="${index === 0 ? "blocked" : i < 4 || index === 2 && i % 4 === 3 ? "opened" : "blocked"}" x="${4 + i % 4 * 15}" y="${4 + Math.floor(i / 4) * 15}" width="11" height="11" rx="2"/>`).join("")}${index ? `<path d="${index === 1 ? "M9 9H54" : "M9 9H54V39"}"/>` : ""}</svg>`;
  const stages = [t("Chặn", "Block"), "→", "↓"].map((label, i) => `<span class="op3963-phase ${done || i < stage ? "complete" : i === stage ? "active" : ""}" title="${esc(label)}">${mini(i)}<b>${i === 0 ? "#" : label}</b></span>`).join('<i aria-hidden="true">›</i>');
  let operation;
  if (done) operation = `<span class="op3963-finish" aria-hidden="true">⚑</span><strong class="op3963-path-count">1 <small>✓</small></strong><b>${t("Đường duy nhất", "Unique path")}</b><code>S → T</code>`;
  else if (selecting || writing) operation = `<div class="op3963-flip"><b class="op3963-wall-sample">#</b><strong>${selecting ? "⇢" : "→"}</strong><b class="op3963-free-sample ${selecting ? "preview" : ""}">.</b></div><b>(${v.focus.join(",")})</b><span>${selecting ? t("Ô sắp mở", "Next cell") : t("Đã mở", "Opened")}</span><code>${v.focus[0] === 0 ? "grid[0][c]" : "grid[r][n − 1]"}</code>`;
  else if (v.phase === "init") operation = `<b class="op3963-wall-sample large">#</b><strong>× ${v.m * v.n}</strong>`;
  else operation = `<strong class="op3963-loop-done">${v.phase === "top-done" ? "→" : "↓"} ✓</strong><span>${v.phase === "top-done" ? t("Hàng trên", "Top row") : t("Cột phải", "Right column")}</span>`;
  const outputValue = (row, r) => {
    const symbols = row.map((value, c) => `<span class="${value === "." ? "open" : "wall"} ${key([r, c]) === focusKey ? "current" : ""}">${done ? value : `'${value}'`}</span>`);
    return done ? `"${symbols.join("")}"` : `[${symbols.join(", ")}]`;
  };
  const output = v.grid.map((row, r) => `<div class="op3963-output-row ${v.focus?.[0] === r ? "focus" : ""}" data-output-row="${r}"><small>${r}</small><code>${outputValue(row, r)}</code></div>`).join("");
  const host = $("treeView");
  host.innerHTML = `<section class="op3963-viz ${done ? "done" : ""}" role="group" aria-label="${esc(t(`Tạo lưới có một đường đi; sau dòng ${v.source.line}`, `Create a one-path grid; after line ${v.source.line}`))}"><header class="op3963-heading"><b>${v.m} × ${v.n}</b><span>${t("Sau dòng", "After line")} <strong>${v.source.line}</strong></span></header><div class="op3963-phases">${stages}</div><div class="op3963-work">${board}<aside class="op3963-inspector">${operation}</aside></div><div class="op3963-counters"><span><i class="op3963-dot"></i><b>${v.openCount} / ${v.totalOpen}</b> ${t("ô mở", "open")}</span><span><b># ${v.wallCount}</b></span><span class="${v.pathCount ? "connected" : ""}">S → T <strong>${v.pathCount}</strong></span></div><div class="op3963-progress"><i style="width:${100 * v.openCount / v.totalOpen}%"></i></div><section class="op3963-output"><header><b>${done ? "return" : "grid"}</b><small>${done ? "list[str]" : "list[list[str]]"}</small></header><div class="op3963-output-scroll">${output}</div></section><footer><span><b>S</b> ${t("Đầu", "Start")}</span><span><b>T</b> ${t("Đích", "Goal")}</span><span><b>#</b> ${t("Cản", "Wall")}</span><span>→ ↓</span></footer></section>`;
  const scroll = host.querySelector(".op3963-board-scroll"), focus = host.querySelector(".op3963-cell.focus");
  if (scroll && focus) {
    const box = focus.getBoundingClientRect(), viewport = scroll.getBoundingClientRect();
    scroll.scrollLeft += box.x - viewport.x - scroll.clientWidth / 2 + box.width / 2;
    scroll.scrollTop += box.y - viewport.y - scroll.clientHeight / 2 + box.height / 2;
  }
  const outputScroll = host.querySelector(".op3963-output-scroll"), outputFocus = host.querySelector(".op3963-output-row.focus");
  if (outputScroll && outputFocus) outputScroll.scrollTop = outputFocus.offsetTop - outputScroll.offsetTop - outputScroll.clientHeight / 2;
}
