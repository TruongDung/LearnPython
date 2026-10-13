class PathSum437Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) {
    this.host = host;
    this.language = language;
    this.escape = escape;
  }

  t(vi, en) { return this.language === "vi" ? vi : en; }
  number(value) { return value === null || value === undefined ? "?" : this.escape(String(value)); }
  font(value, normal = 19) { return String(value).length > 7 ? 8 : String(value).length > 4 ? 11 : normal; }

  tree(step, view) {
    const nodes = step.tree?.nodes || [];
    if (!nodes.length) return '<div class="p437-empty-tree">∅</div>';
    const active = new Set(view.path.map(node => node.id));
    const matches = new Set(view.matches.flatMap(match => match.ids));
    const minX = Math.min(...nodes.map(node => node.x));
    const width = Math.max(310, (Math.max(...nodes.map(node => node.x)) - minX) * 44 + 48);
    const height = Math.max(...nodes.map(node => node.y)) * 70 + 66;
    const span = (Math.max(...nodes.map(node => node.x)) - minX) * 44;
    const point = node => ({ x: (width - span) / 2 + (node.x - minX) * 44, y: 32 + node.y * 70 });
    const byId = new Map(nodes.map(node => [node.id, node]));
    const undo = view.event === "remove-prefix";
    const edges = nodes.filter(node => byId.has(node.parentId)).map(node => {
      const from = point(byId.get(node.parentId));
      const to = point(node);
      const state = matches.has(node.id) && matches.has(node.parentId) ? "matched" : active.has(node.id) && active.has(node.parentId) ? "active" : "";
      const leaving = undo && node.id === view.current?.id;
      const direction = leaving ? `M ${to.x} ${to.y - 19} L ${from.x} ${from.y + 22}` : `M ${from.x} ${from.y + 19} L ${to.x} ${to.y - 22}`;
      return `<path class="p437-edge ${state}${leaving ? " undo" : ""}" d="${direction}" marker-end="url(#p437-down-${leaving ? "purple" : state === "matched" ? "green" : state === "active" ? "blue" : "muted"})"/>`;
    }).join("");
    const circles = nodes.map(node => {
      const p = point(node);
      const current = node.id === view.current?.id;
      const state = matches.has(node.id) ? "matched" : current ? "current" : active.has(node.id) ? "active" : "";
      return `<g class="p437-node ${state}${undo && current ? " undo" : ""}" data-node-id="${node.id}" transform="translate(${p.x} ${p.y})"><title>node #${node.id} · ${this.escape(node.label)}</title><circle r="19"/><text y="6" style="font-size:${this.font(node.label)}px">${this.escape(node.label)}</text>${current ? `<text class="p437-cursor" y="-25">${undo ? "↩" : "▼"}</text>` : ""}</g>`;
    }).join("");
    return `<div class="p437-tree"><svg viewBox="0 0 ${width} ${height}" style="min-width:${width > 440 ? width : 0}px" role="img" aria-label="${this.t("Cây nhị phân: cam là node hiện tại, xanh lá là đường khớp target", "Binary tree: orange is current, green is a matching path")}"><defs>${["muted", "blue", "green", "purple"].map(color => `<marker id="p437-down-${color}" class="${color}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker>`).join("")}</defs>${edges}${circles}</svg></div>`;
  }

  pathBoard(view) {
    const path = view.path;
    const width = Math.max(310, path.length * 66 + 60);
    const offset = (width - (path.length * 66 + 60)) / 2;
    const x = index => 30 + offset + (index + 1) * 66;
    const starts = new Set(view.matches.map(match => path.findIndex(node => node.id === match.ids[0]) - 1));
    const matchedIds = new Set(view.matches.flatMap(match => match.ids));
    const undo = view.event === "remove-prefix";
    const linked = path.map((node, i) => i === 0 ? "" : `<path class="p437-chain ${matchedIds.has(node.id) && matchedIds.has(path[i - 1].id) ? "matched" : ""}" d="M ${x(i - 1) + 17} 28 H ${x(i) - 20}" marker-end="url(#p437-chain-${matchedIds.has(node.id) && matchedIds.has(path[i - 1].id) ? "green" : "blue"})"/>`).join("");
    const checkpoints = [{ id: null, value: null, prefix: 0 }, ...path].map((node, i) => {
      const index = i - 1;
      const cut = starts.has(index);
      const last = index === path.length - 1 && path.length > 0;
      return `<g class="p437-checkpoint${cut ? " cut" : ""}${undo && last ? " removed" : ""}" data-path-index="${index}" transform="translate(${x(index)} 0)">
        ${node.id === null ? '<text class="p437-before" y="33">∅</text>' : `<circle class="p437-path-node${matchedIds.has(node.id) ? " matched" : ""}" cy="28" r="17"/><text class="p437-path-value" y="34" style="font-size:${this.font(node.value, 17)}px">${this.number(node.value)}</text>`}
        <path class="p437-connector" d="M0 48V62"/><rect x="-25" y="66" width="50" height="33" rx="7"/>
        <text class="p437-prefix-value" y="88" style="font-size:${this.font(node.prefix, 17)}px">${this.number(node.prefix)}</text>
        <text class="p437-position" y="114">${index}</text>
        ${cut ? '<text class="p437-cut-arrow" x="31" y="86">✂</text>' : ""}
        ${undo && last ? '<path class="p437-cross" d="M-18 94L18 72"/>' : ""}
      </g>`;
    }).join("");
    return `<section class="p437-card"><header><strong>path ↓ prefix</strong><small>${undo ? this.t("↩ bỏ checkpoint cuối", "↩ remove last checkpoint") : this.t("✂ bỏ phần trước path khớp", "✂ remove the prefix before the match")}</small></header><div class="p437-checkpoints"><svg viewBox="0 0 ${width} 123" style="min-width:${path.length > 4 ? width : 0}px" role="img" aria-label="${this.t("Giá trị node, tổng prefix và vị trí trên đường DFS", "Node values, prefix sums, and positions on the DFS path")}"><defs>${["blue", "green"].map(color => `<marker id="p437-chain-${color}" class="${color}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker>`).join("")}</defs>${linked}${checkpoints}</svg></div></section>`;
  }

  formula(view) {
    const lookedUp = !["rule", "init", "enter", "null", "add", "need"].includes(view.phase) && view.needed !== null;
    // After storing a repeated sum, the map also includes the current node.
    // The lookup result must remain the count found BEFORE that insertion.
    const count = lookedUp ? view.added : null;
    return `<div class="p437-rule"><span class="p437-number blue"><small>∑ root</small><b>${this.number(view.running)}</b></span><i>−</i><span class="p437-number orange"><small>target</small><b>${this.number(view.target)}</b></span><i>=</i><span class="p437-number purple"><small>prefix ?</small><b>${this.number(view.needed)}</b></span><i>→</i><span class="p437-number ${count ? "green" : "muted"}" data-lookup-count="${count ?? "pending"}"><small>${this.t("path mới", "new paths")}</small><b>${this.number(count)}</b></span></div>`;
  }

  map(view) {
    const list = Number(view.approach) === 2;
    const undo = view.event === "remove-prefix";
    const stored = view.event === "store-prefix";
    const entries = view.prefixEntries.map(entry => {
      const positions = list ? entry.positions || [] : [];
      const icons = list ? positions.map(i => `<i class="p437-map-position">${i}</i>`).join("") : Array.from({ length: Math.min(6, entry.count) }, () => '<i class="p437-dot"></i>').join("");
      return `<span class="p437-map-entry${entry.sum === view.needed ? " needed" : ""}${stored && entry.sum === view.running ? " stored" : ""}"><b>${this.number(entry.sum)}</b><span>${icons}</span>${list ? "" : `<em>×${entry.count}</em>`}</span>`;
    }).join("");
    return `<section class="p437-card p437-map"><header><strong>${list ? "positions" : "prefix"}</strong><small>${undo ? `<span class="p437-undo-label">${list ? "positions" : "prefix"}[${this.number(view.running)}] ${list ? "↩ pop" : "−1"}</span>` : stored ? `${list ? "positions" : "prefix"}[${this.number(view.running)}] ${list ? `← ${view.path.length - 1}` : "+1"}` : this.t("chỉ nhánh hiện tại", "current branch only")}</small></header><div>${entries || "∅"}</div></section>`;
  }

  pathChips(values, operator = "↓") {
    return values.map((value, i) => `${i ? `<i>${operator}</i>` : ""}<span class="p437-path-chip">${this.number(value)}</span>`).join("");
  }

  matches(view) {
    if (!view.matches.length) return "";
    return `<section class="p437-matches">${view.matches.map(match => `<div class="p437-match" data-match-ids="${match.ids.join(",")}">${this.pathChips(match.values, "+")}<i>=</i><b>${this.number(view.target)}</b><span class="p437-tick">✓</span></div>`).join("")}</section>`;
  }

  results(view, final) {
    return `<details class="p437-found"${final ? " open" : ""}><summary>${Number(view.approach) === 2 ? "List" : this.t("Đã tìm thấy", "Found")} · ${view.foundPaths.length}</summary><div>${view.foundPaths.map((path, i) => `<div class="p437-result"><small>#${i + 1}</small>${this.pathChips(path.values)}<b>∑ ${this.number(view.target)}</b></div>`).join("") || '<span class="p437-empty">∅</span>'}</div></details>`;
  }

  render(step) {
    const view = step.pathSumIIIView;
    if (!view) return;
    const list = Number(view.approach) === 2;
    const action = step.final ? "✓" : view.event === "found" ? `✓ +${view.added}` : view.event === "remove-prefix" ? "↩ Backtrack" : view.event === "store-prefix" ? this.t("+ Lưu prefix", "+ Store prefix") : view.phase === "lookup" ? "× 0" : this.t("DFS ↓", "DFS ↓");
    this.host.innerHTML = `<section class="p437-viz"><header class="p437-heading"><strong>437 · Path Sum III</strong><span>${list ? "② List" : "① Count"}</span><b>✓ ${view.answer}</b></header>
      <section class="p437-card"><header><strong>${action}</strong><span class="p437-target">🎯 ${this.number(view.target)}</span></header>${this.tree(step, view)}<div class="p437-legend"><span>● ${this.t("đang xét", "current")}</span><span>● ${this.t("path khớp", "match")}</span></div></section>
      ${step.final ? "" : this.pathBoard(view) + this.formula(view) + this.matches(view)}${this.map(view)}${this.results(view, step.final)}</section>`;
    const tree = this.host.querySelector?.(".p437-tree");
    const current = tree?.querySelector(`[data-node-id="${view.current?.id}"]`);
    if (current) {
      const nodeBox = current.getBoundingClientRect();
      const box = tree.getBoundingClientRect();
      if (nodeBox.left < box.left || nodeBox.right > box.right) tree.scrollLeft += nodeBox.left - box.left - tree.clientWidth / 2 + nodeBox.width / 2;
      if (nodeBox.top < box.top || nodeBox.bottom > box.bottom) tree.scrollTop += nodeBox.top - box.top - tree.clientHeight / 2 + nodeBox.height / 2;
    }
  }
}

function renderPathSumIIIView(step) {
  new PathSum437Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
