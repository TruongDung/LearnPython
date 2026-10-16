class Effort1631Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) { this.host = host; this.language = language; this.escape = escape; }
  t(vi, en) { return this.language === "vi" ? vi : en; }
  coord(cell) { return cell ? `(${cell[0]},${cell[1]})` : "?"; }
  key(a, b) { return `${Math.min(a, b)}:${Math.max(a, b)}`; }
  root(v, id) { if (!v.parent) return id; while (v.parent[id] !== id) id = v.parent[id]; return id; }

  grid(v) {
    const pitch = 108, offset = 28, top = 24, width = v.width;
    const byId = new Map(v.cells.flat().map(cell => [cell.r * width + cell.c, cell]));
    const pathEdges = new Set(v.path.slice(1).map((cell, i) => this.key(v.path[i][0] * width + v.path[i][1], cell[0] * width + cell[1])));
    const pathCells = new Set(v.path.map(([r, c]) => r * width + c));
    const accepted = new Set(v.accepted), active = v.activeEdge ? this.key(v.activeEdge[1], v.activeEdge[2]) : null;
    const probe = v.probe?.inside && v.current ? this.key(v.current[0] * width + v.current[1], v.probe.r * width + v.probe.c) : null;
    const center = cell => [offset + v.cols.indexOf(cell.c) * pitch + 36, top + v.rows.indexOf(cell.r) * pitch + 36];
    const edges = v.cells.flatMap(row => row.flatMap(cell => [[cell.r + 1, cell.c], [cell.r, cell.c + 1]].flatMap(([r, c]) => {
      if (r >= v.height || c >= width) return [];
      const next = byId.get(r * width + c); if (!next) return [];
      const id = cell.r * width + cell.c, nextId = r * width + c, key = this.key(id, nextId), diff = Math.abs(cell.value - next.value);
      const route = pathEdges.has(key), bottleneck = route && diff === v.answer;
      const css = [v.capacity !== null && diff <= v.capacity ? "allowed" : "", accepted.has(key) ? "accepted" : "", key === active || key === probe ? "active" : "", route ? "path" : "", bottleneck ? "bottleneck" : ""].filter(Boolean).join(" ");
      const [x1, y1] = center(cell), [x2, y2] = center(next), x = (x1 + x2) / 2, y = (y1 + y2) / 2;
      return [`<g class="ef1631-edge ${css}" data-edge="${key}" data-diff="${diff}"><title>|${cell.value} − ${next.value}| = ${diff}</title><path d="M ${x1} ${y1} L ${x2} ${y2}"/><rect x="${x - 16}" y="${y - 9}" width="32" height="18" rx="5"/><text x="${x}" y="${y + 4}" class="${diff > 9999 ? "long" : ""}">${diff}</text></g>`];
    }))).join("");
    const cells = v.cells.flatMap(row => row.map(cell => {
      const id = cell.r * width + cell.c, [x, y] = center(cell);
      const current = v.current?.[0] === cell.r && v.current?.[1] === cell.c && !v.final;
      const css = [cell.queued ? "queued" : "", cell.settled ? "settled" : "", current ? "current" : "", pathCells.has(id) ? "path" : ""].filter(Boolean).join(" ");
      const endpoint = id === 0 ? v.height * width === 1 ? "S/T" : "S" : id === v.height * width - 1 ? "T" : "";
      const meta = v.algorithm === "kruskal" ? `R${cell.root ?? "?"}` : `b: ${cell.best ?? "?"}`;
      return `<g class="ef1631-cell ${css}" transform="translate(${x - 36},${y - 36})" data-r="${cell.r}" data-c="${cell.c}" data-best="${cell.best ?? "?"}" data-root="${cell.root ?? "?"}"><title>${this.coord([cell.r, cell.c])} · h=${cell.value} · ${meta}</title><rect x="5" y="5" width="62" height="62" rx="12"/><text class="endpoint" x="13" y="19">${endpoint}</text><text class="height ${cell.value > 99999 ? "long" : ""}" x="36" y="41">${cell.value}</text><text class="meta" x="36" y="57">${meta}</text></g>`;
    })).join("");
    const axes = v.cols.map((col, i) => `<text class="ef1631-axis" x="${offset + i * pitch + 36}" y="14">${i && col > v.cols[i - 1] + 1 ? "…" : ""}${col}</text>`).join("") + v.rows.map((row, i) => `<text class="ef1631-axis" x="12" y="${top + i * pitch + 40}">${i && row > v.rows[i - 1] + 1 ? "…" : ""}${row}</text>`).join("");
    return `<section class="ef1631-card ef1631-map"><header><strong>${this.t("Cao ở ô · |diff| ở cạnh", "Heights in cells · |diff| on edges")}</strong><small>${v.algorithm === "kruskal" ? "R = root" : "b = best effort"}</small></header><svg viewBox="0 0 ${offset + (v.cols.length - 1) * pitch + 78} ${top + (v.rows.length - 1) * pitch + 78}" role="img" aria-label="${this.t("Lưới độ cao với cạnh chênh lệch và đường tối ưu", "Height grid with edge differences and optimal route")}">${axes}${edges}${cells}</svg><div class="ef1631-legend"><span class="active">━ ${this.t("đang xét", "active")}</span><span class="path">━ ${v.algorithm === "kruskal" ? "union" : this.t("đường đi", "route")}</span><span class="bottleneck">━ ${this.t("cạnh khó nhất", "bottleneck")}</span>${v.algorithm === "dijkstra" ? '<span class="queued">□ heap</span>' : ""}</div>${v.cropped ? `<small>${this.t("Lưới rút gọn · … là khoảng ẩn · giữ nguyên tọa độ", "Condensed grid · … marks hidden spans · coordinates preserved")}</small>` : ""}</section>`;
  }

  relax(v) {
    if (!v.probe || !["bounds", "diff", "max", "compare", "update", "push"].includes(v.phase)) return "";
    const p = v.probe;
    if (!p.inside) return `<div class="ef1631-outside">${this.coord(v.current)} ↛ (${p.r},${p.c}) · ✕ ${this.t("vượt biên", "out of bounds")}</div>`;
    const known = p.candidate !== null, improves = known && (p.oldBest === "∞" || p.candidate < p.oldBest);
    return `<section class="ef1631-card"><div class="ef1631-diff"><b>${p.fromValue}</b><span>↔</span><b>${p.value}</b><span>⇒</span><strong>|${p.fromValue} − ${p.value}| = ${p.diff ?? "?"}</strong></div><div class="ef1631-formula"><div><small>effort</small><b>${v.capacity}</b></div><strong>max</strong><div class="diff"><small>|diff|</small><b>${p.diff ?? "?"}</b></div><strong>=</strong><div class="candidate"><small>candidate</small><b>${p.candidate ?? "?"}</b></div></div><div class="ef1631-compare"><span>${p.candidate ?? "?"} &lt; best[${p.r}][${p.c}] = ${p.oldBest}</span><b class="${known ? improves ? "good" : "bad" : ""}">${known ? improves ? "✓" : "✕" : "…"}</b><small>${!known ? this.t("Chờ tính diff rồi max", "Await diff, then max") : !improves ? this.t("Giữ best", "Keep best") : v.phase === "push" ? this.t("best đã đổi · tiếp theo push", "best updated · push next") : this.t("Effort nhỏ hơn → cập nhật", "Smaller effort → update")}</small></div></section>`;
  }

  heap(v) {
    const sorted = v.heap.map((entry, index) => ({ entry, index })).sort((a, b) => a.entry[0] - b.entry[0] || a.entry[1] - b.entry[1] || a.entry[2] - b.entry[2]);
    return `<section class="ef1631-card"><header><strong>MIN-HEAP · ${sorted.length}</strong><small>${v.final ? this.t("Dừng tại đích", "Stopped at target") : this.t("effort nhỏ nhất → pop", "smallest effort → pop")}</small></header><div class="ef1631-heap">${sorted.slice(0, 8).map(({ entry: [effort, r, c], index }, i) => `<div class="${i === 0 && !v.final ? "top" : ""}" data-heap-index="${index}"><small>${i === 0 && !v.final ? "▼ POP" : "·"}</small><b>${effort}</b><span>(${r},${c})</span></div>`).join("") || '<span class="ef1631-empty">∅</span>'}${sorted.length > 8 ? `<small>+${sorted.length - 8}</small>` : ""}</div><details class="ef1631-raw"><summary>${this.t("Heap Python · hình xếp theo ưu tiên", "Python heap · picture ordered by priority")}</summary><code>${this.escape(JSON.stringify(v.heap))}</code></details></section>`;
  }

  dsu(v) {
    const edge = v.activeEdge, rootA = edge ? this.root(v, edge[1]) : null, rootB = edge ? this.root(v, edge[2]) : null;
    const x = v.source.scope === "find" ? v.locals.x : null;
    const relevant = v.parent ? [...new Set([...(v.parent.length <= 10 ? v.parent.map((_, i) => i) : [0, 1, v.parent.length - 1]), x, edge?.[1], edge?.[2], rootA, rootB])].filter(id => Number.isInteger(id)).sort((a, b) => a - b) : [];
    let chain = "";
    if (x !== null && v.parent) {
      const ids = [x]; while (v.parent[ids.at(-1)] !== ids.at(-1)) ids.push(v.parent[ids.at(-1)]);
      chain = `<div class="ef1631-find">find(${x}): ${ids.map((id, i) => `${i ? " → " : ""}<b>${id}</b>`).join("")} <span>R${ids.at(-1)}</span></div>`;
    }
    const startRoot = this.root(v, 0), targetRoot = this.root(v, v.height * v.width - 1);
    return `<section class="ef1631-card"><header><strong>UNION-FIND · ${v.accepted.length} ${this.t("cạnh đã nối", "edges joined")}</strong><small>${this.t("Nén đường đi + union theo size", "Path compression + union by size")}</small></header>${edge ? `<div class="ef1631-union"><span>#${edge[1]}</span><b>R${rootA}</b><strong>${rootA === rootB ? "=" : "≠"}</strong><b>R${rootB}</b><span>#${edge[2]}</span></div>` : ""}${chain}<div class="ef1631-parents">${relevant.map(id => `<div class="${id === x ? "current" : ""}"><small>#${id}</small><b>${v.parent[id]}</b><span>size ${v.sizes?.[id] ?? "?"}</span></div>`).join("") || '<span class="ef1631-empty">∅</span>'}</div><small>${this.t("#ô → parent · size chỉ có ý nghĩa ở root", "#cell → parent · size matters only at roots")}</small>${v.parent ? `<div class="ef1631-connected ${startRoot === targetRoot ? "good" : "bad"}">S: R${startRoot} ${startRoot === targetRoot ? "= ✓" : "≠"} T: R${targetRoot}</div>` : ""}</section>
      <section class="ef1631-card"><header><strong>${v.sorted ? this.t("Cạnh tăng dần", "Edges in ascending order") : this.t("Đang dựng cạnh", "Building edges")} · ${v.edges.length}</strong><small>${v.processed} ${this.t("đã xử lý", "processed")}</small></header><div class="ef1631-edge-list">${v.edges.slice(Math.max(0, v.processed - 1), v.processed + 7).map(([diff, a, b]) => `<div class="${v.activeEdge?.[1] === a && v.activeEdge?.[2] === b ? "active" : ""}"><b>${diff}</b><small>#${a} ↔ #${b}</small></div>`).join("") || '<span class="ef1631-empty">∅</span>'}</div></section>`;
  }

  proof(v) {
    if (!v.final) return "";
    const edges = v.path.slice(1).map((cell, i) => ({ from: v.path[i], to: cell, diff: Math.abs(cell[2] - v.path[i][2]) }));
    const ids = edges.length <= 10 ? edges.map((_, i) => i) : [0, 1, 2, ...Array.from({ length: 3 }, (_, i) => edges.length - 3 + i)];
    return `<div class="ef1631-proof"><div class="good"><b>≤ ${v.answer}</b><span>S → T ✓</span></div><div class="bad"><b>${v.answer === 0 ? "effort &lt; 0" : `≤ ${v.answer - 1}`}</b><span>${v.answer === 0 ? "✕ |diff| ≥ 0" : "S ↛ T ✕"}</span></div></div><details class="ef1631-card ef1631-route" open><summary>${this.t("Cạnh trên đường tối ưu", "Edges on the optimal route")} · max |diff| = ${v.answer}</summary><div>${ids.map((id, i) => `${i ? `<span>${id > ids[i - 1] + 1 ? "…" : "→"}</span>` : ""}<div class="${edges[id].diff === v.answer ? "bottleneck" : ""}"><small>${edges[id].from[2]} ↔ ${edges[id].to[2]}</small><b>${edges[id].diff}</b></div>`).join("") || `<small>${this.t("S = T · không có cạnh · effort = 0", "S = T · no edges · effort = 0")}</small>`}</div></details>`;
  }

  render(step) {
    const v = step.effort1631View; if (!v) return;
    const names = {
      size: ["Lấy kích thước", "Read dimensions"], best: ["Khởi tạo best = ∞", "Initialize best to infinity"], start: ["S chưa qua cạnh nào → effort = 0", "No edges traversed at S → effort = 0"], seed: ["Đưa S vào heap", "Seed the heap"], directions: ["Chuẩn bị bốn hướng", "Prepare four directions"], while: ["Heap còn phần tử?", "Heap nonempty?"], pop: ["Pop effort nhỏ nhất", "Pop the smallest effort"], stale: ["Effort còn khớp best?", "Does effort still match best?"], "skip-stale": ["Bỏ bản ghi cũ", "Skip a stale entry"], target: ["Đã tới T?", "At T?"], direction: ["Xét hướng tiếp theo", "Next direction"], neighbor: ["Tính tọa độ ô kế", "Compute neighbor coordinates"], bounds: ["Ô kế trong lưới?", "Is the neighbor in bounds?"], diff: ["Tính chênh lệch hai ô", "Compute the adjacent difference"], max: ["Giữ cạnh khó nhất trên đường", "Keep the hardest edge on the path"], compare: ["Candidate nhỏ hơn best?", "Is candidate smaller than best?"], update: ["Cập nhật best", "Update best"], push: ["Đẩy đường tốt hơn vào heap", "Push the improved path"], found: ["Effort tối thiểu", "Minimum effort"], edges: ["Khởi tạo cạnh", "Initialize edges"], row: ["Hàng tiếp theo", "Next row"], column: ["Ô tiếp theo", "Next cell"], down: ["Có ô bên dưới?", "Is there a cell below?"], right: ["Có ô bên phải?", "Is there a cell to the right?"], "edge-diff": ["Tính |diff| của cạnh", "Compute edge |difference|"], "append-edge": ["Thêm cạnh", "Append the edge"], sort: ["Sắp cạnh từ nhỏ tới lớn", "Sort edges from smallest to largest"], parents: ["Mỗi ô là một root", "Each cell starts as a root"], sizes: ["Mỗi component có size = 1", "Each component starts at size 1"], "define-find": ["Định nghĩa find", "Define find"], "next-edge": ["Cạnh nhỏ nhất tiếp theo", "Next smallest edge"], "find-pair": ["Tìm root của hai đầu cạnh", "Find both endpoint roots"], "find-check": ["Đã tới root?", "At the root?"], compress: ["Nén đường đi: trỏ tới ông", "Path halving: point to the grandparent"], climb: ["Đi lên parent", "Climb to the parent"], "find-root": ["Trả về root", "Return the root"], "same-root": ["Hai root trùng nhau?", "Are both roots equal?"], cycle: ["Bỏ cạnh tạo chu trình", "Skip a cycle edge"], "choose-root": ["Gắn component nhỏ vào lớn", "Attach the smaller component"], swap: ["Đổi root để giữ cây nông", "Swap roots to keep trees shallow"], link: ["Nối hai component", "Join the components"], grow: ["Cập nhật size của root", "Update the root size"], "check-connected": ["S và T cùng root?", "Do S and T share a root?"],
    };
    const phase = names[v.phase] || [v.phase, v.phase];
    this.host.innerHTML = `<section class="ef1631-viz" aria-label="1631 Minimum Effort"><header><strong>1631 · ${v.algorithm === "dijkstra" ? "Dijkstra MINIMAX" : "Kruskal + DSU"}</strong><span>${this.t("Trước dòng", "Before line")} ${v.source.line} · ${v.source.scope}</span></header><div class="ef1631-source"><code>${this.escape(v.source.text.trim())}</code><small>${this.t(...phase)}</small></div>${v.trace.truncated ? `<div class="ef1631-notice">${this.t("Trace rút gọn", "Trace condensed")} · ${v.trace.omitted} ${this.t("dòng đã lược · đáp án tính toàn bộ", "line events omitted · complete answer computed")}</div>` : ""}<div class="ef1631-status"><div><small>${v.algorithm === "dijkstra" ? "effort" : this.t("Ngưỡng |diff|", "|diff| threshold")}</small><b>${v.capacity ?? "?"}</b></div><div><small>${this.t("Ô đang xét", "Current cell")}</small><b>${this.coord(v.current)}</b></div></div>${this.grid(v)}${this.relax(v)}${this.proof(v)}${v.algorithm === "dijkstra" ? this.heap(v) : this.dsu(v)}</section>`;
  }
}
function renderEffort1631View(step) { new Effort1631Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step); }
