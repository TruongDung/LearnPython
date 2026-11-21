'use strict';

const subtree3331Text = (vi, en) => lang === 'vi' ? vi : en;

function subtree3331Tree(view, updated) {
  const parents = updated ? view.newParent : view.parent;
  const children = parents.map(() => []);
  for (let u = 1; u < parents.length; u++) children[parents[u]].push(u);
  const positions = [];
  let leaves = 0;
  let depth = 0;
  function place(u, level) {
    depth = Math.max(depth, level);
    const xs = children[u].map(v => place(v, level + 1));
    const x = xs.length ? (xs[0] + xs.at(-1)) / 2 : 40 + leaves++ * 66;
    positions[u] = [x, 31 + level * 67];
    return x;
  }
  place(0, 0);
  const width = Math.max(160, 80 + (leaves - 1) * 66);
  const height = 76 + depth * 67;
  const chain = new Set();
  if (!updated && view.current !== undefined && view.phase === 'move') {
    for (let u = view.current; parents[u] !== -1; u = parents[u]) chain.add(u);
  }

  const edges = parents.slice(1).map((p, i) => {
    const u = i + 1;
    const [x1, y1] = positions[p];
    const [x2, y2] = positions[u];
    const changed = view.parent[u] !== view.newParent[u];
    const transfer = updated && view.transfer?.from === u;
    const style = transfer ? 'transfer' : changed ? (updated ? 'added' : 'removed') : chain.has(u) ? 'path' : '';
    const mid = (y1 + y2) / 2;
    const arrow = transfer ? ` marker-end="url(#subtree3331-arrow)"` : '';
    const curve = transfer
      ? `M${x2} ${y2 - 19} C${x2} ${mid} ${x1} ${mid} ${x1} ${y1 + 26}`
      : `M${x1} ${y1 + 18} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2 - 18}`;
    return `<path class="s3331-edge ${style}" d="${curve}"${arrow}/>`;
  }).join('');

  const nodes = positions.map(([x, y], u) => {
    const state = u === view.current ? 'current'
      : u === view.match || (updated && u === view.transfer?.to) ? 'target' : '';
    const size = updated && view.size ? `<text class="s3331-size" y="37">${view.size[u]}</text>` : '';
    return `<g class="s3331-node ${state}" transform="translate(${x} ${y})" data-node="${u}">
      <title>#${u} · ${view.s[u]}${size ? ' · size = ' + view.size[u] : ''}</title>
      <text class="s3331-index" y="-22">#${u}</text><circle r="17"/>
      <text y="5">${view.s[u]}</text>${size}
    </g>`;
  }).join('');
  const title = updated ? subtree3331Text('Cây sau đổi cha', 'Reparented tree') : subtree3331Text('Cây gốc', 'Original tree');
  const marker = updated ? '<marker id="subtree3331-arrow" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8Z"/></marker>' : '';
  return `<section class="s3331-card"><h4>${title}</h4><div class="s3331-scroll">
    <svg viewBox="0 0 ${width} ${height}" style="min-width:${Math.min(width, 160)}px;width:${width}px"
      role="img" aria-label="${title}"><defs>${marker}</defs>${edges}${nodes}</svg>
    </div></section>`;
}

function renderSubtreeSizes3331(step) {
  const view = step.subtree3331View;
  const phase = {
    setup: subtree3331Text('Dựng cây', 'Build tree'),
    move: subtree3331Text('Chọn cha', 'Choose parent'),
    count: subtree3331Text('Cộng cây con', 'Add subtree sizes'),
  };
  const cells = view.size
    ? `<div class="s3331-strip"><code>size</code>${view.size.map((size, u) =>
      `<span class="${u === view.transfer?.to ? 'target' : ''}"><small>${u}</small><strong>${size}</strong></span>`).join('')}</div>`
    : view.phase === 'move' && view.current !== undefined
      ? `<div class="s3331-strip"><code>path['${view.s[view.current]}']</code>${view.same.length
        ? view.same.map(u => `<span class="${u === view.match ? 'target' : ''}"><strong>#${u}</strong></span>`).join('')
        : '<span>∅</span>'}</div>`
      : '';
  $('treeView').innerHTML = `<div class="s3331-viz">
    <div class="s3331-header"><code>L${view.line}</code><div class="s3331-phases">${Object.entries(phase).map(([key, label]) =>
      `<span${key === view.phase ? ' aria-current="step"' : ''}>${label}</span>`).join('<i aria-hidden="true">→</i>')}</div></div>
    <div class="s3331-trees">${subtree3331Tree(view, false)}${subtree3331Tree(view, true)}</div>
    <div class="s3331-legend">
      <span><i class="removed"></i>${subtree3331Text('Cạnh cũ', 'Old edge')}</span>
      <span><i class="added"></i>${subtree3331Text('Cạnh mới', 'New edge')}</span>
      ${view.size ? `<span><i class="transfer"></i>${subtree3331Text('Cộng về cha', 'Add to parent')}</span>` : ''}
    </div>${cells}
  </div>`;
}
