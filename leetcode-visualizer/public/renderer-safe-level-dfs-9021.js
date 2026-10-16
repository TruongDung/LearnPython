class SafeDfs9021Visualizer extends SafePath9021Visualizer {
  graph(v) {
    const points = this.positions(v.n), built = new Set(v.builtEdges), route = new Set(v.pathEdges);
    const edges = v.edges.map((edge, id) => ({ edge, id, shape: this.edgeGeometry(edge[0], edge[1], points) }))
      .sort((a, b) => Number(a.shape.curved) - Number(b.shape.curved)).map(({ edge: [a, b, weight], id, shape: g }) => {
        const open = v.limit !== null && weight <= v.limit;
        const css = [built.has(id) ? "built" : "", open ? "open" : "locked", id === v.activeEdge ? "active" : "", route.has(id) ? "route" : "", v.final && route.has(id) && weight === v.answer ? "bottleneck" : ""].filter(Boolean).join(" ");
        return `<g class="sf9021-edge ${css}" data-edge="${id}" data-weight="${weight}">${g.curved ? `<path class="bridge" d="${g.path}"/>` : ""}<path class="link" d="${g.path}"/><g transform="translate(${g.labelX},${g.labelY})"><rect x="-20" y="-13" width="40" height="26" rx="12"/><text y="5">${weight} ${open ? "✓" : "×"}</text></g></g>`;
      }).join("");
    const seen = new Set(v.seen), queued = new Set(v.stack), path = new Set(v.pathNodes);
    const nodes = points.map(([x, y], node) => {
      const css = [seen.has(node) ? "seen" : "", queued.has(node) ? "queued" : "", node === v.current ? "current" : "", path.has(node) ? "route" : ""].filter(Boolean).join(" ");
      const flag = node === v.u && node === v.v ? "u = v" : node === v.u ? "u" : node === v.v ? "v" : "";
      return `<g class="sf9021-node ${css}" transform="translate(${x},${y})" data-node="${node}"><circle class="halo" r="31"/><circle class="room" r="24"/><text class="id" y="6">${node}</text>${flag ? `<text class="flag" y="-36">${flag}</text>` : ""}</g>`;
    }).join("");
    return `<div class="sf9021-graph"><svg viewBox="0 -16 576 346" role="img" aria-label="${this.t("DFS qua cạnh mở, node đã thấy và stack", "DFS through open edges, discovered nodes and stack")}">${edges}${nodes}</svg></div><div class="sf9021-legend"><span class="open">✓ ≤ S</span><span class="locked">× &gt; S</span><span class="queued">◌ stack</span><span class="current">● node</span><span class="route">━ ${this.t("đường đi", "route")}</span></div>`;
  }

  search(v) {
    const maximum = v.maxLevel ?? 0, span = maximum || 1;
    const left = v.left ?? 0, right = v.right ?? maximum;
    const position = value => Math.min(100, Math.max(0, value / span * 100));
    const caption = v.final && v.left !== null ? "left = right" : v.checkKind === "precheck" ? this.t("Kiểm tra có đường đi trước", "Check connectivity first") : `mid = ${v.mid ?? "?"}`;
    return `<section class="sf9021-card"><header><strong>Binary Search · [${v.left ?? "?"}, ${v.right ?? "?"}]</strong><small>${caption}</small></header><div class="sf9021-rail"><div class="range" style="left:${position(left)}%;width:${position(right) - position(left)}%"></div>${v.limit !== null ? `<i style="left:${position(v.limit)}%" title="S = ${v.limit}"></i>` : ""}</div><div class="sf9021-scale"><span>0</span><span>W = ${maximum}</span></div><div class="sf9021-history">${v.history.map(item => `<span class="${item.reachable ? "yes" : "no"}"><small>${item.kind === "precheck" ? this.t("kiểm tra", "precheck") : "S"}</small><b>${item.limit}</b><i>${item.reachable ? "✓" : "✕"}</i></span>`).join("") || `<small>${this.t("Chưa thử ngưỡng nào", "No thresholds tested yet")}</small>`}</div></section>`;
  }

  condition(v) {
    if (v.activeEdge === null || v.neighbor === null || !["inspect", "locked", "seen", "mark", "push"].includes(v.phase)) return "";
    const weight = v.edges[v.activeEdge][2], open = weight <= v.limit, fresh = !v.neighborSeen;
    return `<div class="sf9021-condition"><strong>${v.current} → ${v.neighbor}</strong><span class="${open ? "good" : "bad"}">${weight} ≤ ${v.limit} ${open ? "✓" : "✕"}</span><span class="${fresh ? "good" : "bad"}">${this.t("chưa thấy", "unseen")} ${v.neighbor} ${fresh ? "✓" : "✕"}</span><b class="${open && fresh ? "good" : "bad"}">${open && fresh ? (v.phase === "push" ? this.t("PUSH tiếp theo", "PUSH next") : "✓") : this.t("bỏ qua", "skip")}</b></div>`;
  }

  stack(v) {
    return `<section class="sf9021-card"><header><strong>STACK · LIFO</strong><small>${this.t("push / pop ở bên phải", "push / pop at the right")}</small></header><div class="sf9021-stack">${v.stack.map((node, i) => `<div class="${i === v.stack.length - 1 ? "top" : ""}" data-stack-index="${i}"><small>${i === v.stack.length - 1 ? "▼ POP" : "·"}</small><b>${node}</b></div>`).join("") || '<span class="sf9021-empty">∅</span>'}</div><div class="sf9021-seen"><small>visited</small>${Array.from({ length: v.n }, (_, node) => `<span class="${v.seen.includes(node) ? "yes" : ""}">${node}${v.seen.includes(node) ? " ✓" : ""}</span>`).join("")}</div></section>`;
  }

  path(v) {
    if (v.final && v.answer === -1) return `<div class="sf9021-path bad"><b>${v.u}</b><span>↛</span><b>${v.v}</b><strong>−1</strong></div>`;
    if (!v.pathNodes.length) return "";
    return `<div class="sf9021-path">${v.pathNodes.map((node, i) => `${i ? `<span><small>${v.edges[v.pathEdges[i - 1]][2]}</small>→</span>` : ""}<b>${node}</b>`).join("")}${v.final ? `<strong>max = ${v.answer}</strong>` : ""}</div>`;
  }

  render(step) {
    const v = step.safeDfs9021View; if (!v) return;
    const phases = {
      "same-node": ["u và v trùng nhau?", "Are u and v identical?"], graph: ["Khởi tạo đồ thị", "Initialize graph"], "max-level": ["Khởi tạo ngưỡng lớn nhất", "Initialize maximum level"], "next-edge": ["Cạnh tiếp theo", "Next edge"], "add-forward": ["Thêm chiều đi", "Add forward direction"], "add-backward": ["Thêm chiều về", "Add reverse direction"], "raise-max": ["Ghi nhận trọng số lớn nhất", "Track maximum weight"], "define-dfs": ["Định nghĩa DFS dùng stack", "Define iterative DFS"], precheck: ["Đồ thị có nối u với v?", "Does any u–v path exist?"], bounds: ["Tìm đáp án trong [0, W]", "Search for the answer in [0, W]"], "while-search": ["Khoảng tìm kiếm còn rộng?", "Is the search interval nonempty?"], mid: ["Lấy ngưỡng giữa", "Choose the middle threshold"], "check-mid": ["DFS với ngưỡng mid", "Run DFS at mid"], "lower-right": ["Tới được → giảm right", "Reachable → lower right"], "raise-left": ["Chưa tới → tăng left", "Blocked → raise left"], stack: ["Khởi tạo stack = [u]", "Initialize stack = [u]"], visited: ["Đánh dấu u", "Mark u as discovered"], "while-stack": ["Stack còn node?", "Stack nonempty?"], pop: ["Pop node ở đỉnh stack", "Pop the stack’s top node"], target: ["Đã tới v?", "At v?"], "next-neighbor": ["Xét hàng xóm tiếp theo", "Inspect the next neighbor"], inspect: ["Cạnh mở và node chưa thấy?", "Open edge and unseen neighbor?"], locked: ["Cạnh vượt ngưỡng → bỏ qua", "Edge exceeds threshold → skip"], seen: ["Node đã thấy → bỏ qua", "Neighbor already discovered → skip"], mark: ["Đánh dấu trước khi push", "Mark before pushing"], push: ["Thêm node vào đỉnh stack", "Push the neighbor onto the stack"], success: ["DFS trả True", "DFS returns True"], failure: ["Hết stack → False", "Empty stack → False"], found: ["Mức safe nhỏ nhất", "Minimum safe level"], unreachable: ["Không có đường đi", "No path exists"],
    };
    const phase = phases[v.phase] || [v.phase, v.phase];
    const result = v.reachable === null ? "…" : v.reachable ? "✓" : "✕";
    this.host.innerHTML = `<section class="sf9021-viz${v.final ? " is-final" : ""}" aria-label="9021 Binary Search and DFS"><header><strong>9021 · Binary Search + DFS</strong><span>${this.t("Trước dòng", "Before line")} ${v.source.line} · ${v.source.scope}</span></header><div class="sf9021-source"><code>${this.escape(v.source.text.trim())}</code><small>${this.t(...phase)}</small></div><div class="sf9021-status"><div><small>${this.t("Chìa khóa", "Key")} S</small><b>⚿ ${v.final ? v.answer : v.limit ?? "?"}</b></div><div><small>${this.t("DFS tới v?", "DFS reaches v?")}</small><b class="${v.reachable === true ? "good" : v.reachable === false ? "bad" : ""}">${v.final && v.answer === 0 ? "✓" : result}</b></div></div>${this.search(v)}${this.graph(v)}${this.condition(v)}${this.path(v)}${v.final ? "" : this.stack(v)}</section>`;
  }
}
function renderSafeDfs9021View(step) { new SafeDfs9021Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step); }
