class SafePath9021Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }

  positions(count) {
    const custom = count === 7
      ? [[58, 152], [156, 62], [156, 242], [284, 76], [284, 226], [410, 116], [518, 188]]
      : null;
    if (custom) return custom;
    const cx = 288;
    const cy = 156;
    const radiusX = count <= 4 ? 170 : 220;
    const radiusY = count <= 4 ? 98 : 122;
    return Array.from({ length: count }, (_, index) => {
      const angle = Math.PI + (Math.PI * 2 * index) / count;
      return [cx + Math.cos(angle) * radiusX, cy + Math.sin(angle) * radiusY];
    });
  }

  edgeGeometry(a, b, points) {
    const [x1, y1] = points[a];
    const [x2, y2] = points[b];
    const pair = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (pair === "1:4") {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.hypot(dx, dy) || 1;
      const bridgeT = 0.545;
      const bridgeX = x1 + dx * bridgeT;
      const bridgeY = y1 + dy * bridgeT;
      const beforeX = bridgeX - (dx / length) * 13;
      const beforeY = bridgeY - (dy / length) * 13;
      const afterX = bridgeX + (dx / length) * 13;
      const afterY = bridgeY + (dy / length) * 13;
      const controlX = bridgeX - (dy / length) * 22;
      const controlY = bridgeY + (dx / length) * 22;
      return {
        path: `M ${x1} ${y1} L ${beforeX.toFixed(2)} ${beforeY.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${afterX.toFixed(2)} ${afterY.toFixed(2)} L ${x2} ${y2}`,
        labelX: x1 + dx * 0.3,
        labelY: y1 + dy * 0.3,
        curved: true,
      };
    }
    const labelT = pair === "2:3" ? 0.68 : 0.5;
    return { path: `M ${x1} ${y1} L ${x2} ${y2}`, labelX: x1 + (x2 - x1) * labelT, labelY: y1 + (y2 - y1) * labelT, curved: false };
  }

  edgeMarkup(view, points) {
    const checked = new Set(view.checkedEdges);
    const crossed = new Set(view.crossedEdges);
    const route = new Set(view.pathEdges);
    const built = new Set(view.builtEdges || view.edges.map((_, index) => index));
    const orderedEdges = view.edges.map((edge, edgeId) => ({ edge, edgeId, geometry: this.edgeGeometry(edge[0], edge[1], points) }))
      .sort((first, second) => Number(first.geometry.curved) - Number(second.geometry.curved));
    return orderedEdges.map(({ edge: [a, b, safe], edgeId, geometry }) => {
      const open = view.limit !== null && safe <= view.limit;
      const classes = [open ? "open" : "locked"];
      if (!built.has(edgeId)) classes.push("future");
      if (geometry.curved) classes.push("curved");
      if (checked.has(edgeId)) classes.push("checked");
      if (crossed.has(edgeId)) classes.push("crossed");
      if (view.activeEdge === edgeId) classes.push("active");
      if (route.has(edgeId)) classes.push("route");
      const label = open ? "✓" : "×";
      const pair = a < b ? `${a}-${b}` : `${b}-${a}`;
      return `<g class="sp9021-edge ${classes.join(" ")}" data-edge="${edgeId}" data-pair="${pair}" data-label-x="${geometry.labelX.toFixed(2)}" data-label-y="${geometry.labelY.toFixed(2)}">
        ${geometry.curved ? `<path class="sp9021-bridge-underlay" d="${geometry.path}" />` : ""}
        <path class="sp9021-link" d="${geometry.path}" />
        <g class="sp9021-lock" transform="translate(${geometry.labelX.toFixed(2)},${geometry.labelY.toFixed(2)})">
          <rect x="-20" y="-14" width="40" height="28" rx="14" />
          <text class="level" x="-4" y="5">${safe}</text><text class="state" x="11" y="5">${label}</text>
        </g>
      </g>`;
    }).join("");
  }

  nodeMarkup(view, points) {
    const seen = new Set(view.seen);
    const queued = new Set(view.queue);
    const route = new Set(view.pathNodes);
    return Array.from({ length: view.n }, (_, node) => {
      const [x, y] = points[node];
      const classes = [];
      if (node === view.u) classes.push("source");
      if (node === view.v) classes.push("target");
      if (seen.has(node)) classes.push("seen");
      if (queued.has(node)) classes.push("queued");
      if (node === view.current) classes.push("current");
      if (route.has(node)) classes.push("route");
      const flag = node === view.u ? "u" : node === view.v ? "v" : "";
      return `<g class="sp9021-node ${classes.join(" ")}" transform="translate(${x},${y})" role="listitem" aria-label="${this.escape(`${flag || "node"} ${node}`)}">
        <circle r="24"/><circle class="pulse" r="31"/><text class="id" y="6">${node}</text>
        ${flag ? `<text class="flag" y="-34">${flag}</text>` : ""}
      </g>`;
    }).join("");
  }

  keyRail(view) {
    const result = new Map(view.history.map((item) => [item.level, item.reachable]));
    return `<div class="sp9021-levels" aria-label="${this.t("Các mức chìa khóa", "Key levels")}">${view.levels.map((level, index) => {
      const state = result.has(level) ? (result.get(level) ? "yes" : "no") : "";
      const active = level === view.limit ? " active" : "";
      const inRange = Number.isInteger(view.left) && Number.isInteger(view.right) && index >= view.left && index <= view.right ? " in-range" : "";
      return `<span class="${state}${active}${inRange}" aria-label="${this.escape(`S ${level}${state === "yes" ? ": reachable" : state === "no" ? ": blocked" : ""}`)}"><i>${state === "yes" ? "✓" : state === "no" ? "×" : ""}</i><b>${level}</b></span>`;
    }).join("")}</div>`;
  }

  routeStrip(view) {
    if (view.final && !view.reachable) return `<div class="sp9021-route none"><span>u</span><i>×</i><span>v</span></div>`;
    const nodes = view.pathNodes.length ? view.pathNodes : [view.u, view.v];
    return `<div class="sp9021-route${view.pathNodes.length ? " found" : ""}">${nodes.map((node, index) => `${index ? "<i>→</i>" : ""}<span>${node}</span>`).join("")}</div>`;
  }

  render(step) {
    const view = step.safePath9021View;
    if (!view) return;
    const points = this.positions(view.n);
    const answer = view.final ? (view.reachable ? view.limit : "−1") : view.limit ?? "?";
    const status = view.reachable === true ? "yes" : view.reachable === false ? "no" : "";
    const statusMark = status === "yes" ? "✓" : status === "no" ? "×" : "…";
    const queue = view.queue.length
      ? view.queue.map((node) => `<span>${node}</span>`).join("<i>→</i>")
      : `<span class="empty">∅</span>`;
    this.host.innerHTML = `<section class="sp9021-viz ${view.final ? "is-final" : ""}" aria-label="${this.t("Mô phỏng mức safe nhỏ nhất", "Minimum safe level simulation")}">
      <header class="sp9021-heading"><strong>#9021 · ${this.t("Chìa khóa safe", "Safe key")}</strong><span>${view.final ? this.t("NHỎ NHẤT", "MINIMUM") : "BINARY SEARCH"}</span></header>
      <div class="sp9021-dashboard">
        <div class="sp9021-key ${status}"><div class="sp9021-key-shape"><i></i><b></b></div><small>S</small><output>${answer}</output><em>${statusMark}</em></div>
        <div class="sp9021-route-wrap"><small>u → v</small>${this.routeStrip(view)}</div>
      </div>
      ${this.keyRail(view)}
      <div class="sp9021-graph" role="list">
        <svg viewBox="0 0 576 306" role="img" aria-label="${this.t("Đồ thị với cạnh mở và cạnh khóa", "Graph with open and locked edges")}">
          ${this.edgeMarkup(view, points)}${this.nodeMarkup(view, points)}
        </svg>
      </div>
      <div class="sp9021-bottom">
        <div class="sp9021-queue"><b>BFS</b>${queue}</div>
        <div class="sp9021-legend"><span class="open">✓ ≤ S</span><span class="locked">× &gt; S</span><span class="route">● ${this.t("đường đi", "route")}</span></div>
      </div>
    </section>`;
  }
}

function renderSafePath9021View(step) {
  new SafePath9021Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
