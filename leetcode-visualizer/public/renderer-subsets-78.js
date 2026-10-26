function renderSubsets78Pictures(step) {
  const v = step.subsets78View, host = $("treeView"), esc = escapeHtml, vi = lang === "vi", bitmask = v.mode === "bitmask";
  const selected = new Set(v.selected), frame = v.stack?.at(-1), action = v.action;
  const tone = index => `var(--s78-c${index % 6})`;
  const chip = (index, extra = "") => `<b class="s78-value ${extra}" style="--s78-tone:${tone(index)}" title="nums[${index}]"><span>${esc(String(v.nums[index]))}</span></b>`;
  const activeIndex = ["check", "append", "pop"].includes(action?.kind) ? action.index : v.phase === "i" ? bitmask ? v.i : frame?.i : null;
  const nums = v.nums.map((value, i) => {
    const checked = v.checks?.[i], available = frame ? i >= frame.start : true;
    return `<div class="s78-source ${selected.has(i) ? "selected" : ""} ${i === activeIndex ? "focus" : ""} ${!available && !selected.has(i) ? "skipped" : ""}" style="--s78-tone:${tone(i)}">${bitmask ? `<span class="s78-switch ${checked === null || checked === undefined ? "pending" : checked ? "on" : "off"}" aria-label="bit ${i}"><i></i><b>${v.mask === undefined ? "—" : (v.mask >> i) & 1}</b></span><i class="s78-wire ${checked ? "on" : ""}"></i>` : `<small>${frame?.start === i ? "start ↓" : i === activeIndex ? "i ↓" : ""}</small>`}${chip(i)}<small>[${i}]${bitmask ? ` · 2ⁱ=${1 << i}` : ""}</small></div>`;
  }).join("");
  const subset = bitmask ? v.subset : v.current;
  const basket = subset === undefined || subset === null ? '<span class="s78-empty">—</span>' : subset.length ? v.selected.map(i => chip(i)).join("") : '<span class="s78-empty">∅</span>';
  let operation;
  if (action?.kind === "check") operation = `<code>${v.mask} & ${1 << action.index}</code><strong>${action.pass ? `${action.value} ✓` : "0 ×"}</strong>${chip(action.index, action.pass ? "preview" : "muted")}`;
  else if (action?.kind === "append") operation = `<strong>+</strong>${chip(action.index)}<strong>→</strong><code>${bitmask ? "subset" : "current"}</code>`;
  else if (action?.kind === "pop") operation = `<code>pop()</code>${chip(action.index, "removed")}<strong>↩</strong>`;
  else if (action?.kind === "save") operation = `<code>${bitmask ? "subset" : "current[:]"}</code><strong>→</strong><b class="s78-saved">#${v.result.length} ✓</b>`;
  else if (action?.kind === "return") operation = `<strong>↩</strong><code>start = ${frame.start}</code>`;
  else if (v.phase === "✓") operation = `<strong>✓</strong><b>${v.result.length} / ${v.total}</b>`;
  else operation = `<code>${esc(v.phase)}</code>`;
  const gallery = v.result.map((item, index) => `<article class="s78-subset ${action?.kind === "save" && action.index === index ? "new" : ""}" data-result-index="${index}" title="${esc(JSON.stringify(item))}"><small>${index + 1}</small><div>${item.length ? item.map(value => chip(v.nums.indexOf(value))).join("") : '<b class="s78-empty">∅</b>'}</div></article>`).join("") || '<span class="s78-empty">—</span>';
  let diagram = "", treeDiagram = "";
  if (bitmask) {
    diagram = `<section class="s78-input"><header><b>mask <strong>${v.mask ?? "—"}</strong></b><code>${v.mask === undefined ? "—" : `0b${v.mask.toString(2).padStart(v.n, "0")}`}</code><small>bit i ↔ nums[i]</small></header><div class="s78-sources">${nums}</div></section>`;
  } else {
    const tree = v.tree, activeIds = new Set(v.stack.map(f => f.id)), pending = action?.kind === "append" ? action.childId : null;
    const edges = tree.nodes.map(node => {
      if (node.parentId === null) return "";
      const p = tree.nodes[node.parentId], active = activeIds.has(node.id), preview = node.id === pending;
      return `<path class="s78-edge ${node.status === "future" ? "future" : ""} ${active ? "active" : ""} ${preview ? "preview" : ""}" d="M${p.x},${p.y + 34} L${node.x},${node.y}"/>`;
    }).join("");
    const nodes = tree.nodes.map(node => {
      const label = node.indices.length ? `[${node.indices.map(i => v.nums[i]).join(",")}]` : "∅";
      return `<g class="s78-node ${node.status} ${node.id === v.currentId ? "current" : ""} ${node.id === pending ? "preview" : ""}" data-node-id="${node.id}" transform="translate(${node.x - 41},${node.y})"><title>${esc(label)} · start ${node.start}</title><rect width="82" height="34" rx="9"/><text x="41" y="22" ${label.length > 11 ? 'textLength="72" lengthAdjust="spacingAndGlyphs"' : ""}>${esc(label)}</text>${node.saved ? '<circle class="s78-node-saved" cx="76" cy="4" r="3"/>' : ""}</g>`;
    }).join("");
    const back = action && ["return", "pop"].includes(action.kind) ? (() => {
      const from = tree.nodes[action.fromId], to = tree.nodes[action.toId];
      return `<path class="s78-return-edge" d="M${from.x + 10},${from.y} Q${from.x + 45},${to.y + 28} ${to.x + 15},${to.y + 34}" marker-end="url(#s78-return-arrow)"/>`;
    })() : "";
    const stack = v.stack.map((f, i) => `${i ? '<span>→</span>' : ""}<b class="${i === v.stack.length - 1 ? "current" : ""}">${f.start}</b>`).join("") || "∅";
    diagram = `<section class="s78-input"><header><b>nums</b><small>${vi ? "chỉ chọn các index ≥ start" : "choose indices ≥ start"}</small></header><div class="s78-sources">${nums}</div></section>`;
    treeDiagram = `<section class="s78-tree-panel"><header><b>backtrack(start)</b><div class="s78-stack">${stack}</div></header><div class="s78-tree-scroll" style="height:${Math.min(244, tree.height)}px"><svg width="${tree.width}" height="${tree.height}" viewBox="0 0 ${tree.width} ${tree.height}" role="img" aria-label="${vi ? "Cây tập con" : "Subset recursion tree"}"><defs><marker id="s78-return-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6"/></marker></defs>${edges}${back}${nodes}</svg></div></section>`;
  }
  host.innerHTML = `<section class="s78-viz" data-mode="${v.mode}" aria-label="Subsets · ${v.mode} · ${v.result.length}/${v.total}"><header class="s78-heading"><b>#78 · ${bitmask ? "BITMASK" : "BACKTRACKING"}</b><small>${vi ? "Dòng" : "Line"} ${v.line}</small></header>${diagram}<div class="s78-workrow"><div class="s78-operation">${operation}</div><section class="s78-basket"><header>${bitmask ? "subset" : "current"}</header><div>${basket}</div></section></div>${treeDiagram ? '<div class="s78-bottomgrid">' : ""}${treeDiagram}<section class="s78-results"><header><b>result</b><span>${v.result.length} / 2<sup>${v.n}</sup> = ${v.total}</span></header><div class="s78-progress"><i style="width:${v.result.length / v.total * 100}%"></i></div><div class="s78-gallery">${gallery}</div></section>${treeDiagram ? "</div>" : ""}</section>`;
  const tree = host.querySelector(".s78-tree-scroll"), focusId = action?.kind === "append" ? action.childId : v.currentId;
  const focus = tree?.querySelector(`[data-node-id="${focusId}"]`) || tree?.querySelector(".s78-node");
  if (focus) { const a = focus.getBoundingClientRect(), b = tree.getBoundingClientRect(); tree.scrollLeft = Math.max(0, a.x - b.x - tree.clientWidth / 2 + a.width / 2); tree.scrollTop = Math.max(0, a.y - b.y - tree.clientHeight / 2 + a.height / 2); }
  const grid = host.querySelector(".s78-gallery"), saved = grid?.querySelector(".new");
  if (grid) grid.scrollTop = saved ? Math.max(0, saved.offsetTop - grid.clientHeight / 2) : grid.scrollHeight;
}
