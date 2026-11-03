"use strict";

class MinimumCostWalk3108Visualizer {
  constructor({ host, language = "en" }) {
    this.host = host;
    this.language = language;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }

  positions(count) {
    const cx = 290, cy = 132, rx = count <= 4 ? 125 : 205, ry = count <= 4 ? 88 : 105;
    return Array.from({ length: count }, (_, id) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * id) / count;
      return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
    });
  }

  methodTable() {
    const methods = [
      ["Brute Force (DFS/BFS cho từng query)", "Brute force (DFS/BFS per query)", "O(Q(V+E))*", "O(V+E)"],
      ["DFS + Connected Components", "DFS + connected components", "O(V+E+Q)", "O(V+E)"],
      ["BFS + Connected Components", "BFS + connected components", "O(V+E+Q)", "O(V+E)"],
      ["Union Find (DSU) – 2 Passes", "Union Find (DSU) – 2 passes", "O(Eα(V)+V+Q)", "O(V)"],
      ["Union Find (DSU) – 1 Pass", "Union Find (DSU) – 1 pass", "O((E+Q)α(V)+V)", "O(V)"],
    ];
    return `<section class="mcw3108-methods"><header><strong>${this.t("5 cách · chọn để xem", "5 approaches · select to explore")}</strong><small>${this.t("DSU 1 pass gộp nhóm + AND", "1-pass DSU merges components + AND")}</small></header>
      <div class="mcw3108-table-wrap"><table><thead><tr><th>#</th><th>${this.t("Cách giải", "Approach")}</th><th>Time</th><th>Space</th></tr></thead><tbody>
      ${methods.map((row, i) => `<tr class="${i === 4 ? "recommended" : ""}"><th>${i + 1}</th><td>${this.language === "vi" ? row[0] : row[1]}</td><td><code>${row[2]}</code></td><td><code>${row[3]}</code></td></tr>`).join("")}
      </tbody></table></div>
    </section>`;
  }

  render(step) {
    const v = step.minimumCostWalk3108View;
    if (!v) return;
    const points = this.positions(v.n);
    const palette = ["#187fc0", "#13a078", "#dc8522", "#8657c9", "#d34c74", "#39a1a5", "#b39a1d", "#617da5", "#b35b36", "#4d9952", "#a24a9a", "#607080"];
    const rootColor = (node) => v.component[node] < 0 ? "#8693a3" : palette[v.component[node] % palette.length];
    const andEdges = new Set(v.andEdges || []);
    const edgeMarkup = v.edges.map(([a, b, weight], id) => {
      const [x1, y1] = points[a], [x2, y2] = points[b];
      const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy) || 1;
      const mx = (x1 + x2) / 2 - (dy / length) * 10, my = (y1 + y2) / 2 + (dx / length) * 10;
      const active = v.activeEdge === id ? " active" : "";
      const aggregated = andEdges.has(id) ? " aggregated" : "";
      return `<g class="mcw3108-edge${active}${aggregated}" data-edge="${id}"><path d="M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}"/><rect x="${mx - 20}" y="${my - 11}" width="40" height="22" rx="11"/><text x="${mx}" y="${my + 4}">${weight}</text></g>`;
    }).join("");
    const seen = new Set(v.visited);
    const nodeMarkup = points.map(([x, y], node) => {
      const current = v.currentNode === node ? " current" : "";
      const reached = seen.has(node) ? " reached" : "";
      const query = v.currentQuery === null ? null : v.queries[v.currentQuery];
      const endpoint = query && (query[0] === node || query[1] === node);
      return `<g class="mcw3108-node${current}${reached}${endpoint ? " endpoint" : ""}" transform="translate(${x} ${y})" style="--node-color:${rootColor(node)}"><circle r="23"/><text y="6">${node}</text></g>`;
    }).join("");
    const queryRows = v.queries.map(([u, w], id) => {
      const result = v.answer[id];
      return `<div class="mcw3108-query${id === v.currentQuery ? " current" : ""}${result === null ? "" : result < 0 ? " no" : " yes"}"><b>Q${id + 1}</b><span>${u} → ${w}</span><strong>${result === null ? "·" : result < 0 ? "× −1" : result}</strong></div>`;
    }).join("");
    const results = v.answer.map((value) => value === null ? "·" : value < 0 ? "×" : value).join("  ") || "∅";
    const groups = new Map();
    v.component.forEach((root, node) => {
      if (root < 0) return;
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(node);
    });
    const groupMarkup = [...groups.values()].map((members) => `<span>{${members.join(",")}}</span>`).join(" ") || "—";
    this.host.innerHTML = `<section class="mcw3108-viz${v.final ? " final" : ""}">
      <header class="mcw3108-heading"><strong>#3108 · ${this.t("Minimum Cost Walk", "Minimum Cost Walk")}</strong><span>${v.final ? this.t("KẾT QUẢ", "RESULT") : this.t(`CÁCH ${v.approach}`, `APPROACH ${v.approach}`)}</span></header>
      ${this.methodTable()}
      <div class="mcw3108-main">
        <section class="mcw3108-board"><header><b>${this.t("Các cạnh & thành phần", "Edges & components")}</b><small>${v.phase}</small></header><svg viewBox="0 0 580 270" role="img" aria-label="${this.t("Đồ thị trọng số, màu node là thành phần", "Weighted graph, node colors show components")}">${edgeMarkup}${nodeMarkup}</svg>
          <div class="mcw3108-legend"><span class="component">● ${this.t("cùng màu = cùng nhóm", "same color = same component")}</span><span class="active">━ ${this.t("đang xét", "current edge")}</span></div>
        </section>
        <section class="mcw3108-side"><header><b>${this.t("Queries", "Queries")}</b><strong>${results}</strong></header><div class="mcw3108-queries">${queryRows}</div>
          <div class="mcw3108-state"><small>${this.t("NHÓM", "COMPONENTS")}</small><strong>${groupMarkup}</strong>
            <div><small>${this.t("AND đang tính", "CURRENT AND")}</small><b>${v.currentCost < 0 ? "−1" : `0b${v.currentCost.toString(2)}`}</b></div>
            ${v.pass ? `<em>${v.pass}</em>` : ""}
          </div>
        </section>
      </div>
      <footer><span>${this.t("AND mọi cạnh trong component", "AND of every edge in the component")}</span><b>${results}</b></footer>
    </section>`;
  }
}

function renderMinimumCostWalk3108(step) {
  new MinimumCostWalk3108Visualizer({ host: $("treeView"), language: lang }).render(step);
}

if (typeof ORDERED_RENDERER_REGISTRY !== "undefined" &&
    !ORDERED_RENDERER_REGISTRY.some((entry) => entry.id === "minimum-cost-walk-3108")) {
  ORDERED_RENDERER_REGISTRY.unshift({
    id: "minimum-cost-walk-3108",
    predicate: (step) => Boolean(step.minimumCostWalk3108View),
    surface: "treeView",
    render: renderMinimumCostWalk3108,
  });
}
