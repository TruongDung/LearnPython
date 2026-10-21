function renderSwap24Pictures(step) {
  const v = step.swap24View, t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value)), summary = v.mode === 'summary';
  const label = id => id === null ? 'None' : id === -1 ? 'D' : '#' + (id + 1);
  const byId = new Map(v.nodes.map(node => [node.id, node]));
  const visible = [-1, ...(summary ? v.order.slice(0, 12) : v.original.map((_, i) => i))], visibleSet = new Set(visible);
  const gap = 96, width = Math.max(420, (visible.length + 1) * gap), y = 125;
  const positions = new Map(visible.map((id, index) => [id, { x: 48 + index * gap, y }]));
  const end = { x: 48 + visible.length * gap, y }, clipped = summary && v.order.length > 12;
  const pointerNames = ['head', 'prev', 'first', 'second'];
  function edge(from, to, removed = false) {
    const a = positions.get(from), b = to === null || !visibleSet.has(to) ? end : positions.get(to);
    if (!a || !b) return '';
    const forward = b.x > a.x, sign = forward ? 1 : -1;
    const x1 = a.x + 26 * sign, x2 = b.x - 29 * sign;
    const path = forward && b.x - a.x <= gap * 1.1 ? `M${x1},${y} L${x2},${y}`
      : `M${x1},${y} C${x1 + 22 * sign},${y + (forward ? -78 : 72)} ${x2 - 22 * sign},${y + (forward ? -78 : 72)} ${x2},${y}`;
    const changed = !removed && v.change?.from === from && v.change?.after === to;
    return `<path class="p24-edge${removed ? ' removed' : changed ? ' changed' : ''}" d="${path}" marker-end="url(#p24-${removed ? 'old' : changed ? 'new' : 'normal'}-arrow)"/>`;
  }
  let edges = visible.map(id => edge(id, byId.get(id).next)).join('');
  if (v.change && v.change.before !== v.change.after) edges = edge(v.change.from, v.change.before, true) + edges;
  const nodes = visible.map(id => {
    const node = byId.get(id), p = positions.get(id);
    const aliases = pointerNames.filter(name => Object.hasOwn(v.pointers, name) && v.pointers[name] === id);
    const classes = ['p24-node', id === -1 ? 'dummy' : '', v.pair.includes(id) ? 'pair' : '', v.completed.includes(id) ? 'done' : '', v.detached.includes(id) ? 'detached' : '', v.change?.from === id ? 'writing' : ''].filter(Boolean).join(' ');
    return `<g class="${classes}" transform="translate(${p.x},${p.y})"><title>${label(id)} · val=${node.value} · next=${label(node.next)}</title>${id === -1 ? '<rect x="-25" y="-25" width="50" height="50" rx="8"/>' : '<circle r="25"/>'}<text class="p24-value" y="6" text-anchor="middle">${id === -1 ? 'D' : node.value}</text><text class="p24-id" y="43" text-anchor="middle">${id === -1 ? 'dummy' : label(id)}</text>${aliases.map((name, i) => `<text class="p24-alias ${name}" y="${65 + i * 17}" text-anchor="middle">${name}</text>`).join('')}</g>`;
  }).join('');
  const noneAliases = pointerNames.filter(name => Object.hasOwn(v.pointers, name) && v.pointers[name] === null);
  const terminal = `<g class="p24-terminal" transform="translate(${end.x},${end.y})"><rect x="-29" y="-16" width="58" height="32" rx="7"/><text y="5" text-anchor="middle">${clipped ? '…' : 'None'}</text>${noneAliases.map((name, i) => `<text class="p24-alias ${name}" y="${65 + i * 17}" text-anchor="middle">${name}</text>`).join('')}</g>`;
  const cards = pointerNames.map(name => `<span class="${name}"><small>${name}</small><b>${Object.hasOwn(v.pointers, name) ? label(v.pointers[name]) : '—'}</b></span>`).join('');
  const detached = v.detached.map(id => `${pointerNames.filter(name => v.pointers[name] === id).join('/')} → ${label(id)}`).join(' · ');
  const change = v.change ? `<div class="p24-change"><code>${label(v.change.from)}.next</code><s>${label(v.change.before)}</s><span>→</span><strong>${label(v.change.after)}</strong></div>` : '';
  const chain = v.order.slice(0, 12).map(id => `<span><b>${byId.get(id).value}</b><small>${label(id)}</small></span>`).join('<i>→</i>');
  const stage = v.line === 8 ? 1 : v.line === 9 ? 2 : v.line === 10 || v.line === 11 ? 3 : 0;
  const miniSteps = [['first', t('còn lại', 'rest')], ['second', 'first'], ['prev', 'second']].map(([a,b], i) => `<span class="${i + 1 === stage ? 'active' : ''}${i + 1 <= stage ? ' done' : ''}"><small>${i + 1}</small><code>${a} → ${b}</code>${i + 1 <= stage ? '<b>✓</b>' : ''}</span>`).join('');
  $('treeView').innerHTML = `<section class="p24-viz" aria-label="${t('24 · Hoán đổi node từng cặp', '24 · Swap adjacent nodes')}">
    <header><strong>24 · Swap pairs</strong><button type="button" data-p24-finish ${summary || v.pair.length !== 2 || v.event === 'advance' ? 'disabled' : ''}>${t('Xong cặp', 'Finish pair')} ⏭</button><button type="button" data-p24-result>${t('Kết quả', 'Result')}</button></header>
    ${summary ? `<div class="p24-summary">${t('Đã hoán đổi đủ', 'Swapped all')} ${v.original.length} ${t('node · hình xem trước 12 node. Debug từng dòng với ≤12 node.', 'nodes · pictures preview 12 nodes. Line debug for ≤12 nodes.')}</div>` : `<div class="p24-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div><div class="p24-pointers">${cards}</div>`}
    ${!summary && v.pair.length === 2 ? `<div class="p24-steps">${miniSteps}</div>` : ''}
    ${v.condition === false ? `<div class="p24-check">${v.original.length === 0 ? t('List rỗng', 'Empty list') : v.original.length % 2 ? t('Còn 1 node → giữ nguyên', 'One node remains → keep it') : t('Không còn node → dừng', 'No nodes remain → stop')}</div>` : ''}
    <div class="p24-graph"><svg viewBox="0 0 ${width} 270" style="width:${width}px;height:270px" role="img" aria-label="${t('Liên kết next tại dòng hiện tại; # là số hiệu node', 'Actual next links at current line; # identifies nodes')}"><defs>${['normal','old','new'].map(kind => `<marker id="p24-${kind}-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z"/></marker>`).join('')}</defs>${edges}${nodes}${terminal}</svg></div>
    <div class="p24-legend"><span class="new">→ ${t('nối mới', 'new link')}</span><span class="old">⇢ ${t('liên kết cũ', 'old link')}</span><span># = ${t('số hiệu node', 'node identity')}</span></div>
    ${detached ? `<div class="p24-detached"><code>${detached}</code><span>${t('vẫn giữ node rời', 'keeps the detached node')}</span></div>` : ''}${change}
    <div class="p24-chain"><small>${step.final ? 'return dummy.next' : t('Đi từ D.next', 'Follow D.next')}</small><div>${chain || '<code>[]</code>'}${v.order.length > 12 ? '<i>→ …</i>' : chain ? '<i>→ None</i>' : ''}</div></div>
    ${step.final ? `<div class="p24-answer">✓ ${t('Kết quả', 'Result')}: [${v.order.map(id => byId.get(id).value).join(', ')}]</div>` : ''}
    <div class="p24-examples">${[t('Rỗng','Empty'), t('Số node lẻ','Odd length'), t('Số node chẵn','Even length'), t('Giá trị trùng','Duplicate values')].map((name, i) => `<button type="button" data-p24-example="${i}">${name}</button>`).join('')}</div>
  </section>`;
  const host = $('treeView');
  host.querySelector('[data-p24-result]').addEventListener('click', () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelector('[data-p24-finish]').addEventListener('click', () => {
    const target = steps.findIndex((s, i) => i >= stepIndex && s.swap24View?.round === v.round && s.swap24View.event === 'advance');
    if (target >= 0) { stopPlay(); stepIndex = target; renderStep(); }
  });
  host.querySelectorAll('[data-p24-example]').forEach(button => button.addEventListener('click', () => { $('arrInput').value = ['[]','1,2,3,4,5','1,2,3,4','7,7,7,7'][Number(button.dataset.p24Example)]; runViz(); }));
  const graph = host.querySelector('.p24-graph'), focus = positions.get(v.change?.from ?? v.pair[0] ?? v.pointers.prev);
  if (graph && focus && width > graph.clientWidth) graph.scrollLeft = Math.max(0, focus.x - graph.clientWidth / 2);
}
