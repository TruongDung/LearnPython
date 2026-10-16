class SafeDijkstra9021Visualizer extends SafePath9021Visualizer {
  edgeMarkup(view, points) {
    const built = new Set(view.builtEdges), path = new Set(view.final ? view.pathEdges : view.currentPathEdges);
    return view.edges.map((edge, id) => ({ edge, id, geometry: this.edgeGeometry(edge[0], edge[1], points) }))
      .sort((a, b) => Number(a.geometry.curved) - Number(b.geometry.curved))
      .map(({ edge: [a, b, weight], id, geometry: g }) => {
        const active = id === view.activeEdge, route = path.has(id), bottleneck = view.final && route && weight === view.answer;
        return `<g class="sd9021-edge${built.has(id) ? " built" : ""}${active ? " active" : ""}${route ? " route" : ""}${bottleneck ? " bottleneck" : ""}" data-edge="${id}" data-weight="${weight}">${g.curved ? `<path class="sd9021-bridge" d="${g.path}"/>` : ""}<path class="sd9021-link" d="${g.path}"/><g transform="translate(${g.labelX},${g.labelY})"><rect x="-16" y="-13" width="32" height="26" rx="12"/><text y="5">${weight}</text></g></g>`;
      }).join("");
  }
  nodeMarkup(view, points) {
    const settled = new Set(view.settled), queued = new Set(view.heap.map(entry => entry[1])), path = new Set(view.final ? view.pathNodes : view.currentPath);
    return points.map(([x, y], node) => {
      const current = node === view.current, next = view.phase === "pop" && node === view.heap[0]?.[1];
      const classes = `${settled.has(node) ? " settled" : ""}${queued.has(node) ? " queued" : ""}${path.has(node) ? " route" : ""}${current ? " current" : ""}${node === view.neighbor ? " neighbor" : ""}${next ? " next" : ""}${current && view.stale ? " stale" : ""}`;
      const endpoint = node === view.u && node === view.v ? "u = v" : node === view.u ? "u" : node === view.v ? "v" : "";
      const labelY = view.n === 7 && !endpoint ? -55 : 30;
      return `<g class="sd9021-node${classes}" transform="translate(${x},${y})" data-node="${node}" data-best="${view.best?.[node] ?? "?"}"><circle class="halo" r="31"/><circle class="room" r="24"/><text class="id" y="6">${node}</text>${endpoint ? `<text class="endpoint" y="-36">${endpoint}</text>` : ""}<rect class="best-label" x="-27" y="${labelY}" width="54" height="23" rx="8"/><text class="best" y="${labelY + 16}">${view.best?.[node] ?? "?"}</text></g>`;
    }).join("");
  }
  heapMarkup(v) {
    const items = v.heap.map(([cost, node], index) => ({ cost, node, index })).sort((a, b) => a.cost - b.cost || a.node - b.node);
    const caption = v.final ? v.answer === -1 ? this.t("Heap rỗng", "Heap empty") : this.t("Đã dừng ở đích · heap còn lại", "Stopped at target · remaining heap") : this.t("cost nhỏ nhất → pop", "smallest cost → pop");
    return `<section class="sd9021-card sd9021-heap"><header><strong>MIN-HEAP</strong><small>${caption} · ${v.heap.length}</small></header><div class="sd9021-heap-items">${items.length ? items.map(({ cost, node, index }, i) => `<div class="sd9021-entry${i === 0 && !v.final ? " top" : ""}${v.best && cost !== v.best[node] ? " stale" : ""}" data-index="${index}" data-cost="${cost}" data-node="${node}"><small>${i === 0 && !v.final ? "▼ POP" : "·"}</small><strong>${cost}</strong><span>node ${node}</span></div>`).join("") : '<span class="sd9021-empty">∅</span>'}</div></section>`;
  }
  relaxation(v) {
    if (v.neighbor === null || !["max", "compare", "update", "push"].includes(v.phase)) return "";
    const hasCandidate = v.candidate !== null, improves = hasCandidate && (v.oldBest === "∞" || v.candidate < v.oldBest);
    return `<section class="sd9021-card sd9021-relax"><header><strong>${v.current} → ${v.neighbor}</strong><small>candidate = max(cost, weight)</small></header><div class="sd9021-equation"><div><small>cost</small><b>${v.cost}</b></div><strong>max</strong><div class="edge"><small>${this.t("cạnh", "edge")}</small><b>${v.weight}</b></div><strong>=</strong><div class="candidate"><small>candidate</small><b>${v.candidate ?? "?"}</b></div></div><div class="sd9021-compare${hasCandidate ? improves ? " good" : " bad" : ""}"><span>${v.candidate ?? "?"} &lt; best[${v.neighbor}] = ${v.oldBest}</span><b>${hasCandidate ? improves ? "✓" : "✕" : "…"}</b><small>${!hasCandidate ? this.t("Chờ dòng max", "Awaiting max") : improves ? v.phase === "push" ? this.t("best đã đổi · tiếp theo push", "best updated · push next") : this.t("Cải thiện → cập nhật", "Improves → update") : this.t("Giữ best · bỏ đường này", "Keep best · skip this route")}</small></div></section>`;
  }
  pathMarkup(v) {
    const nodes = v.final ? v.pathNodes : v.currentPath;
    if (v.final && v.answer === -1) return `<div class="sd9021-path no-path"><b>${v.u}</b><span>↛</span><b>${v.v}</b><strong>−1</strong></div>`;
    if (!nodes.length) return "";
    const ids = v.final ? v.pathEdges : v.currentPathEdges;
    return `<div class="sd9021-path${v.final ? " final" : ""}">${nodes.map((node, i) => `${i ? `<span class="sd9021-path-edge${v.final && v.edges[ids[i - 1]][2] === v.answer ? " bottleneck" : ""}"><small>${v.edges[ids[i - 1]][2]}</small>→</span>` : ""}<b>${node}</b>`).join("")}${v.final ? `<strong>max = ${v.answer}</strong>` : ""}</div>`;
  }
  render(step) {
    const v = step.safeDijkstra9021View; if (!v) return;
    const phases = { graph: this.t("Dựng đồ thị", "Build graph"), "next-edge": this.t("Lấy cạnh tiếp theo", "Next edge"), "add-forward": this.t("Thêm chiều đi", "Add forward edge"), "add-backward": this.t("Thêm chiều về", "Add reverse edge"), best: this.t("Khởi tạo best", "Initialize best"), start: this.t("Gốc có cost = 0", "Source cost is zero"), heap: this.t("Đưa gốc vào heap", "Seed the heap"), while: this.t("Heap còn phần tử?", "Heap nonempty?"), pop: this.t("Pop cost nhỏ nhất", "Pop smallest cost"), stale: this.t("Bản ghi còn hợp lệ?", "Is the entry current?"), "skip-stale": this.t("Bỏ bản ghi cũ", "Skip stale entry"), target: this.t("Đã tới đích?", "At the target?"), "next-neighbor": this.t("Xét hàng xóm", "Next neighbor"), max: this.t("Lấy cạnh lớn nhất trên đường", "Take the path's largest edge"), compare: this.t("Đường mới có tốt hơn?", "Does this route improve best?"), update: this.t("Cập nhật best", "Update best"), push: this.t("Đưa bản ghi mới vào heap", "Push the improved state"), found: this.t("Mức safe tối thiểu", "Minimum safe level"), unreachable: this.t("Không có đường đi", "No path exists") };
    const points = this.positions(v.n);
    const stale = ["stale", "skip-stale"].includes(v.phase) && v.stale ? `<div class="sd9021-stale-banner"><b>(${v.cost}, ${v.current})</b><span>≠ best[${v.current}] = ${v.best[v.current]}</span><strong>✕ ${this.t("Bản ghi cũ", "Stale entry")}</strong></div>` : "";
    const keyIcon = '<svg class="sd9021-key-icon" viewBox="0 0 48 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M20 12h24m-7 0v7m-7-7v5"/></svg>';
    this.host.innerHTML = `<section class="sd9021-viz${v.final ? " is-final" : ""}" aria-label="9021 Dijkstra Minimax Path"><header><strong>9021 · Dijkstra — Minimax Path</strong><span>${this.t("Trước dòng", "Before line")} ${v.source.line}</span></header><div class="sd9021-source"><code>${this.escape(v.source.text.trim())}</code><small>${phases[v.phase]}</small></div><div class="sd9021-status"><div><small>${this.t("Đang xét", "Current")}</small><b>${v.current ?? "?"}</b></div><div class="sd9021-key"><small>${v.final ? this.t("Đáp án", "Answer") : "cost"}</small><b>${keyIcon}${v.final ? v.answer : v.cost ?? "?"}</b></div><div><small>${this.t("Đích", "Target")}</small><b>${v.v}</b></div></div>${stale}<div class="sd9021-graph"><svg viewBox="0 -16 576 356" role="img" aria-label="${this.t("Đồ thị, mức cạnh và best tại mỗi node", "Graph, edge levels and best value at each node")}">${this.edgeMarkup(v, points)}${this.nodeMarkup(v, points)}</svg></div><div class="sd9021-legend"><span class="current">● ${this.t("đang xét", "current")}</span><span class="queued">◌ heap</span><span class="settled">● ${this.t("đã chốt", "settled")}</span><span>▣ best[node]</span></div>${this.pathMarkup(v)}${this.relaxation(v)}${this.heapMarkup(v)}${v.final && v.answer >= 0 ? `<small class="sd9021-proof">${this.t("Cạnh vàng = nút thắt · S là cạnh lớn nhất trên đường", "Gold edge = bottleneck · S is the largest edge on the route")}</small>` : ""}</section>`;
  }
}
function renderSafeDijkstra9021View(step) {
  new SafeDijkstra9021Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
