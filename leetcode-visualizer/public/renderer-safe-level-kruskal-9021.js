class SafeKruskal9021Visualizer extends SafePath9021Visualizer {
  color(root) { return `--sk-group:hsl(${[205,145,275,40,325,180,15,95,240][root]} 70% var(--sk-color-l))`; }
  graph(v) {
    const points = this.positions(v.n), accepted = new Set(v.accepted), skipped = new Set(v.skipped), route = new Set(v.pathEdges);
    const edges = v.edges.map((edge, id) => ({ edge, id, geo: this.edgeGeometry(edge[0], edge[1], points) })).sort((a,b) => Number(a.geo.curved)-Number(b.geo.curved)).map(({ edge:[a,b,weight], id, geo:g }) => {
      const active = id === v.activeEdge || id === v.sortEdge;
      return `<g class="sk9021-edge${accepted.has(id) ? " accepted" : ""}${skipped.has(id) ? " skipped" : ""}${active ? " active" : ""}${route.has(id) ? " route" : ""}${route.has(id)&&weight===v.answer ? " bottleneck" : ""}" style="${this.color(v.roots[a])}" data-edge="${id}" data-weight="${weight}">${g.curved ? `<path class="sk9021-bridge" d="${g.path}"/>` : ""}<path class="sk9021-link" d="${g.path}"/><g transform="translate(${g.labelX},${g.labelY})"><rect x="-16" y="-13" width="32" height="26" rx="12"/><text y="5">${weight}</text></g></g>`;
    }).join("");
    const nodes = points.map(([x,y],node) => {
      const endpoint = node===v.u&&node===v.v ? "u = v" : node===v.u ? "u" : node===v.v ? "v" : "";
      const focus = v.find?.x===node, onPath=v.pathNodes.includes(node);
      return `<g class="sk9021-node${focus ? " focus" : ""}${endpoint ? " endpoint" : ""}${onPath ? " route" : ""}" style="${this.color(v.roots[node])}" transform="translate(${x},${y})" data-node="${node}" data-root="${v.roots[node]}"><circle class="halo" r="31"/><circle class="room" r="24"/><text class="id" y="6">${node}</text>${endpoint ? `<text class="flag" y="-36">${endpoint}</text>` : ""}</g>`;
    }).join("");
    return `<div class="sk9021-graph"><svg viewBox="0 -16 576 336" role="img" aria-label="${this.t("Cạnh đường đi thật · màu node biểu thị nhóm DSU", "Real graph edges · node colors show DSU components")}">${edges}${nodes}</svg></div><div class="sk9021-legend"><span class="selected">━ ${this.t("đã chọn", "accepted")}</span><span class="cycle">┄ ${this.t("bỏ chu trình", "cycle skipped")}</span><span class="active">━ ${this.t("đang xét", "current")}</span></div>`;
  }
  edges(v) {
    if (!v.ordered.length) return "";
    return `<section class="sk9021-card"><header><strong>${this.t("Cạnh từ nhỏ → lớn", "Edges: low → high")}</strong><small>${this.t("dừng khi u nối v", "stop when u joins v")}</small></header><div class="sk9021-edge-rail">${v.ordered.map(e => `<div class="sk9021-edge-chip${e.id===v.activeEdge ? " active" : ""}${v.accepted.includes(e.id) ? " accepted" : ""}${v.skipped.includes(e.id) ? " skipped" : ""}" data-edge="${e.id}"><small>${e.a}—${e.b}</small><b>${e.weight}</b><span>${v.accepted.includes(e.id) ? "✓" : v.skipped.includes(e.id) ? "✕" : e.id===v.activeEdge ? "▼" : "·"}</span></div>`).join("")}</div></section>`;
  }
  components(v) {
    if (!v.parent) return "";
    return `<section class="sk9021-card"><header><strong>${v.components.length} ${this.t("nhóm", "components")}</strong><small>${this.t("cùng màu = cùng gốc", "same color = same root")}</small></header><div class="sk9021-components">${v.components.map(g => `<div class="sk9021-component" style="${this.color(g.root)}" data-root="${g.root}"><small>${this.t("gốc", "root")} ${g.root}</small><div>${g.nodes.map(node => `<b>${node}</b>`).join("")}</div></div>`).join("")}</div></section>`;
  }
  parents(v) {
    if (!v.parent) return "";
    return `<section class="sk9021-card"><header><strong>DSU · parent[node]</strong><small>${this.t("con trỏ nhóm · size chỉ dùng ở gốc", "group pointers · size used at roots")}</small></header><div class="sk9021-parents">${v.parent.map((p,node) => `<div class="sk9021-parent${v.find?.x===node ? " focus" : ""}" style="${this.color(v.roots[node])}" data-node="${node}" data-parent="${p}"><b>${node}</b><span>↓</span><strong>${p}</strong><small>${node===p && v.size ? `size ${v.size[node]}` : "·"}</small></div>`).join("")}</div></section>`;
  }
  bubble(node,v) { return `<b class="sk9021-bubble" style="${this.color(v.roots[node])}">${node}</b>`; }
  focus(v) {
    if (v.find) {
      const x=v.find.x, p=v.parent[x], grand=v.parent[p];
      return `<section class="sk9021-card sk9021-find"><header><strong>find(${x})</strong><small>${this.t("đi theo parent tới gốc", "follow parent to the root")}</small></header><div class="sk9021-chain">${v.find.chain.map((node,i)=>`${i ? "<span>→</span>" : ""}${this.bubble(node,v)}`).join("")}${p===x ? '<strong class="sk9021-root-check">✓ root</strong>' : ""}</div>${v.phase==="compress" ? `<div class="sk9021-compress"><small>parent[${x}]</small><span>${this.bubble(p,v)} → ${this.bubble(grand,v)}</span><strong>${this.t("Bỏ qua một bậc", "Skip one level")}</strong></div>` : ""}</section>`;
    }
    if (v.union && v.union.rootA!==null) {
      const a=v.union.rootA,b=v.union.rootB,same=a===b;
      const icon=same ? "=" : v.phase==="swap" ? "⇄" : "←";
      return `<section class="sk9021-card sk9021-union${same ? " cycle" : ""}"><header><strong>${same ? this.t("Cùng gốc → bỏ cạnh", "Same root → skip edge") : v.phase==="swap" ? this.t("Đổi gốc lớn hơn sang A", "Make A the larger root") : this.t("Gốc nhỏ nhập gốc lớn", "Smaller root joins larger root")}</strong><small>union(${v.union.a}, ${v.union.b})</small></header><div class="sk9021-merge"><div>${this.bubble(a,v)}<small>root_a · size ${v.size[a]}</small></div><strong>${icon}</strong><div>${this.bubble(b,v)}<small>root_b · size ${v.size[b]}</small></div></div>${v.phase==="link" ? `<div class="sk9021-next">parent[${b}]: ${v.parent[b]} → <b>${a}</b></div>` : v.phase==="grow" ? `<div class="sk9021-next">size[${a}]: ${v.size[a]} → <b>${v.size[a]+v.size[b]}</b></div>` : ""}</section>`;
    }
    return "";
  }
  path(v) {
    if (!v.final) return "";
    if (v.answer<0) return `<div class="sk9021-path no-path">${this.bubble(v.u,v)}<strong>↛</strong>${this.bubble(v.v,v)}<b>−1</b></div>`;
    return `<div class="sk9021-path">${v.pathNodes.map((node,i)=>`${i ? `<span class="${v.edges[v.pathEdges[i-1]][2]===v.answer ? "bottleneck" : ""}"><small>${v.edges[v.pathEdges[i-1]][2]}</small>→</span>` : ""}${this.bubble(node,v)}`).join("")}<strong>${v.u===v.v ? "u = v → 0" : `max = ${v.answer}`}</strong></div>`;
  }
  render(step) {
    const v=step.safeKruskal9021View;if(!v)return;
    const phases={"same-node":this.t("u và v đã trùng nhau?","Are u and v equal?"),parents:this.t("Mỗi node là một nhóm","One component per node"),sizes:this.t("Mỗi nhóm có size = 1","Each component starts with size 1"),"define-find":this.t("Hàm tìm gốc","Define root lookup"),"define-union":this.t("Hàm gộp nhóm","Define component union"),sort:this.t("Sắp xếp cạnh","Sort edges"),"sort-key":this.t("Lấy mức safe để sắp xếp","Sort by safe level"),"next-edge":this.t("Lấy cạnh tiếp theo","Next edge"),"try-union":this.t("Thử gộp hai nhóm","Try merging the components"),"find-pair":this.t("Tìm gốc hai đầu cạnh","Find both endpoint roots"),"find-check":this.t("Đã tới gốc?","At the root?"),compress:this.t("Nén đường đi","Compress the parent path"),climb:this.t("Đi lên parent","Climb to parent"),"find-root":this.t("Trả gốc","Return root"),"same-root":this.t("Hai gốc có giống nhau?","Are the roots equal?"),cycle:this.t("Bỏ cạnh tạo chu trình","Skip the cycle edge"),"choose-root":this.t("So sánh size","Compare component sizes"),swap:this.t("Đổi gốc theo size","Swap roots by size"),link:this.t("Gắn gốc nhỏ vào gốc lớn","Link smaller root to larger root"),grow:this.t("Cộng size","Update root size"),merged:this.t("Đã gộp hai nhóm","Components merged"),"check-connected":this.t("u đã nối v?","Are u and v connected?"),found:this.t("Mức safe tối thiểu","Minimum safe level"),unreachable:this.t("Không có đường đi","No path exists")};
    this.host.innerHTML=`<section class="sk9021-viz${v.final ? " is-final" : ""}" aria-label="9021 Kruskal Union-Find DSU"><header><strong>9021 · Kruskal + DSU</strong><span>${this.t("Trước dòng","Before line")} ${v.source.line} · ${this.escape(v.source.scope)}</span></header><div class="sk9021-source"><code>${this.escape(v.source.text.trim())}</code><small>${phases[v.phase]}</small></div><div class="sk9021-status"><div><small>u = ${v.u}</small>${this.bubble(v.roots[v.u],v)}<small>${this.t("gốc","root")}</small></div><strong class="${v.connected ? "connected" : ""}">${v.connected ? "↔ ✓" : "⋯"}</strong><div><small>v = ${v.v}</small>${this.bubble(v.roots[v.v],v)}<small>${this.t("gốc","root")}</small></div><div class="sk9021-level"><small>${v.final ? this.t("Đáp án S","Answer S") : this.t("Mức cạnh","Edge level")}</small><b>${v.final ? v.answer : v.weight ?? "?"}</b></div></div>${this.graph(v)}${this.path(v)}${this.focus(v)}${this.edges(v)}${this.components(v)}${this.parents(v)}${v.final&&v.answer>0 ? `<small class="sk9021-proof">${this.t("Cạnh vàng nối hai phía u, v lần đầu → mức nhỏ nhất","The gold edge first connects u and v → minimum level")}</small>` : ""}</section>`;
  }
}
function renderSafeKruskal9021View(step) {
  new SafeKruskal9021Visualizer({host:$("treeView"),language:lang,escape:escapeHtml}).render(step);
}
