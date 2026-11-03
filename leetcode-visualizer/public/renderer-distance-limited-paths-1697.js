"use strict";

class DistanceLimited1697Visualizer {
  constructor({ host, language = "en" }) {
    this.host = host;
    this.language = language;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }

  positions(count) {
    const cx = 300, cy = 144, rx = count <= 4 ? 125 : 205, ry = count <= 4 ? 92 : 108;
    return Array.from({ length: count }, (_, id) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * id) / count;
      return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
    });
  }

  table() {
    const rows = [
      ["Brute Force DFS", "Brute-force DFS", "O(Q × (V + E))", "Dễ hiểu · TLE", "Easy · TLE"],
      ["BFS cho từng Query", "BFS per query", "O(Q × (V + E))", "Dễ hiểu · TLE", "Easy · TLE"],
      ["Sorting + Union-Find", "Sorting + Union-Find", "O(E log E + Q log Q + (E+Q)α(V))", "Tối ưu · Nên học", "Optimal · Learn this"],
      ["Dijkstra (Minimax Path)", "Dijkstra (minimax path)", "O(Q × (V+E) log V)", "Đúng · Chậm", "Correct · Slow"],
      ["MST + LCA", "MST + LCA", "O(E log E + V log V + Q log V)", "Nâng cao", "Advanced"],
      ["Parallel Binary Search + DSU", "Parallel binary search + DSU", "O((E+Q) log E × α(V) + E log E)", "Nâng cao · Phức tạp", "Advanced · Complex"],
    ];
    return `<section class="dl1697-methods" aria-label="${this.t("So sánh cách giải", "Approach comparison")}">
      <header><strong>${this.t("6 cách · chọn để xem", "6 approaches · select to explore")}</strong><small>${this.t("cách 3 được khuyên học", "approach 3 is recommended")}</small></header>
      <div class="dl1697-table-wrap"><table><thead><tr><th>#</th><th>${this.t("Cách giải", "Approach")}</th><th>Time</th><th>${this.t("Đánh giá", "Rating")}</th></tr></thead><tbody>
      ${rows.map((row, i) => `<tr class="${i === 2 ? "recommended" : ""}"><th>${i + 1}</th><td>${this.language === "vi" ? row[0] : row[1]}</td><td><code>${row[2]}</code></td><td>${this.language === "vi" ? row[3] : row[4]}</td></tr>`).join("")}
      </tbody></table></div>
    </section>`;
  }

  render(step) {
    const v = step.distanceLimited1697View;
    if (!v) return;
    const points = this.positions(v.n), roots = v.components || [];
    const palette = ["#1685cf", "#18a77c", "#e08727", "#875bd1", "#d34c7b", "#43a6ac", "#c5a524", "#556c9a", "#b35b36", "#4b9a50", "#a14c9a", "#64748b"];
    const color = (node) => roots.length ? palette[roots[node] % palette.length] : "#73849b";
    const classes = new Map(v.accepted.map((id) => [id, true]));
    const edgeMarkup = v.edgeList.map(([a, b, weight], id) => {
      const [x1, y1] = points[a], [x2, y2] = points[b];
      const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy) || 1;
      const mx = (x1 + x2) / 2 + (-dy / length) * 10, my = (y1 + y2) / 2 + (dx / length) * 10;
      const path = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
      const status = v.threshold === null ? "" : weight < v.threshold ? " eligible" : " blocked";
      const active = v.activeEdge === id ? " active" : "";
      const accepted = classes.has(id) || v.forest.includes(id) ? " accepted" : "";
      return `<g class="dl1697-edge${status}${active}${accepted}"><path d="${path}"/><rect x="${mx - 19}" y="${my - 11}" width="38" height="22" rx="11"/><text x="${mx}" y="${my + 4}">${weight}</text></g>`;
    }).join("");
    const seen = new Set(v.seen);
    const nodeMarkup = points.map(([x, y], node) => {
      const current = v.currentNode === node ? " current" : "";
      const reached = seen.has(node) ? " reached" : "";
      const query = v.currentQuery === null ? null : v.queries[v.currentQuery];
      const endpoint = query && (query[0] === node || query[1] === node);
      return `<g class="dl1697-node${current}${reached}${endpoint ? " endpoint" : ""}" transform="translate(${x} ${y})" style="--node-color:${color(node)}"><circle r="23"/><text y="6">${node}</text></g>`;
    }).join("");
    const queryRows = v.queries.map(([u, w, limit], id) => {
      const result = v.answer[id];
      return `<div class="dl1697-query${id === v.currentQuery ? " current" : ""}${result === true ? " yes" : result === false ? " no" : ""}"><b>Q${id + 1}</b><span>${u} → ${w}</span><small>&lt; ${limit}</small><strong>${result === true ? "✓" : result === false ? "×" : "·"}</strong></div>`;
    }).join("");
    const resultLine = v.answer.map((result) => result === true ? "✓" : result === false ? "×" : "·").join("  ") || "∅";
    const detail = v.detail || {};
    const queue = v.queue.length ? v.queue.join(" → ") : "∅";
    const seenLine = v.seen.length ? v.seen.join(", ") : "∅";
    const meta = v.threshold === null ? this.t("Cạnh đang dựng", "Building graph") : `${this.t("chỉ qua", "allow")} weight &lt; ${v.threshold}`;
    this.host.innerHTML = `<section class="dl1697-viz${v.final ? " final" : ""}">
      <header class="dl1697-heading"><strong>#1697 · ${this.t("Mọi cạnh phải nhỏ hơn limit", "Every edge must be below limit")}</strong><span>${v.final ? this.t("KẾT QUẢ", "RESULT") : this.t(`CÁCH ${v.approach}`, `APPROACH ${v.approach}`)}</span></header>
      ${this.table()}
      <div class="dl1697-main">
        <section class="dl1697-board"><header><b>${this.t("Đồ thị", "Graph")}</b><small>${meta}</small></header><svg viewBox="0 0 600 290" role="img" aria-label="${this.t("Đồ thị có trọng số", "Weighted graph")}">${edgeMarkup}${nodeMarkup}</svg>
          <div class="dl1697-legend"><span class="allowed">━ ${this.t("weight &lt; limit", "weight &lt; limit")}</span><span class="blocked">┄ ${this.t("cạnh quá lớn", "too heavy")}</span><span class="active">━ ${this.t("đang xét", "current")}</span></div>
        </section>
        <section class="dl1697-side"><header><b>${this.t("Truy vấn", "Queries")}</b><strong>${resultLine}</strong></header><div class="dl1697-queries">${queryRows}</div>
          <div class="dl1697-state"><small>${this.t("BƯỚC", "STEP")}</small><b>${v.phase}</b>
            <div><small>${v.approach === 1 ? "STACK" : v.approach === 2 ? "QUEUE" : v.approach === 4 ? "BEST BOTTLENECK" : this.t("ĐANG XÉT", "CURRENT")}</small><strong>${v.approach <= 2 ? queue : v.approach === 4 ? (detail.best || v.distance).map((x) => Number.isFinite(x) ? x : "∞").join(" · ") || "∅" : v.currentQuery === null ? "—" : `Q${v.currentQuery + 1}`}</strong></div>
            <div><small>${this.t("ĐÃ THẤY / NHÓM", "SEEN / COMPONENTS")}</small><strong>${v.approach <= 2 ? seenLine : v.components.length ? [...new Set(v.components)].map((root) => `{${v.components.map((r, i) => r === root ? i : null).filter((x) => x !== null).join(",")}}`).join(" ") : "—"}</strong></div>
          </div>
        </section>
      </div>
      <footer><span>${this.t("Kết quả theo thứ tự query", "Answers in query order")}</span><b>${resultLine}</b></footer>
    </section>`;
  }
}

function renderDistanceLimited1697View(step) {
  new DistanceLimited1697Visualizer({ host: $("treeView"), language: lang }).render(step);
}

if (typeof ORDERED_RENDERER_REGISTRY !== "undefined" &&
    !ORDERED_RENDERER_REGISTRY.some((entry) => entry.id === "distance-limited-paths-1697")) {
  ORDERED_RENDERER_REGISTRY.unshift({
    id: "distance-limited-paths-1697",
    predicate: (step) => Boolean(step.distanceLimited1697View),
    surface: "treeView",
    render: renderDistanceLimited1697View,
  });
}
