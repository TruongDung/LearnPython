function visited2876Walk(edges, start) {
  const nodes = [], seen = new Map();
  let node = start;
  while (!seen.has(node)) {
    seen.set(node, nodes.length);
    nodes.push(node);
    node = edges[node];
  }
  return { nodes, repeat: node, cycleAt: seen.get(node) };
}

// Keep positions fixed while pruning and filling answers. Each component has
// its own loop on the left and incoming branches in columns on the right.
function visited2876Layout(edges) {
  const walks = edges.map((_, node) => visited2876Walk(edges, node));
  const rings = [], assigned = new Set(), positions = [];
  let width = 260, height = 0;
  walks.forEach(walk => {
    if (assigned.has(walk.repeat)) return;
    const ring = walk.nodes.slice(walk.cycleAt);
    ring.forEach(node => assigned.add(node));
    rings.push(ring);
  });
  const components = rings.map(ring => {
    const members = walks.flatMap((walk, node) => ring.includes(walk.repeat) ? [node] : []);
    const levels = [];
    members.forEach(node => {
      const depth = walks[node].cycleAt;
      if (depth) (levels[depth] ??= []).push(node);
    });
    const radius = ring.length === 1 ? 0 : Math.max(54, ring.length * 13);
    const rows = Math.max(0, ...levels.filter(Boolean).map(level => level.length));
    const h = Math.max(210, radius * 2 + 128, rows * 76 + 60);
    const cx = radius + 66, cy = height + h / 2, first = radius * 2 + 172;
    ring.forEach((node, i) => {
      const angle = i * Math.PI * 2 / ring.length;
      positions[node] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });
    levels.forEach((nodes, depth) => {
      nodes.sort((a, b) => positions[edges[a]].y - positions[edges[b]].y || a - b);
      nodes.forEach((node, i) => {
        positions[node] = { x: first + (depth - 1) * 96, y: height + (i + 1) * h / (nodes.length + 1) };
      });
    });
    const w = levels.length ? first + (levels.length - 2) * 96 + 56 : radius * 2 + 132;
    width = Math.max(width, w);
    const component = { ring, cx, cy, radius, top: height, height: h };
    height += h;
    return component;
  });
  return { width, height, positions, components, walks };
}

function renderCountVisited2876Pictures(step) {
  const host = $('treeView'), v = step.visited2876View;
  if (!host || !v) return;
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const final = Boolean(step.final), layout = visited2876Layout(v.edges);
  const graphKey = JSON.stringify(v.edges), frameKey = graphKey + ':' + v.frame;
  const same = host.dataset?.v2876Frame === frameKey;
  const previousSelected = same ? Number(host.dataset.v2876RenderedSelected) : -1;
  const previousWidth = Number(host.dataset?.v2876Width || 0);
  const defaultNode = v.answer.indexOf(Math.max(...v.answer));
  const selected = final && same ? Number(host.dataset.v2876Selected) : defaultNode;
  const walk = layout.walks[selected], length = walk.nodes.length;
  const progress = final && same ? Math.max(1, Math.min(length + 1, Number(host.dataset.v2876Progress))) : length + 1;
  const counted = new Set(final ? walk.nodes.slice(0, progress) : []);
  const repeated = final && progress > length;
  const scroll = host.dataset?.v2876Graph === graphKey ? host.querySelector?.('.v2876-board')?.scrollLeft || 0 : 0;
  if (host.dataset) {
    host.dataset.v2876Graph = graphKey;
    host.dataset.v2876Frame = frameKey;
    host.dataset.v2876Selected = String(selected);
    host.dataset.v2876RenderedSelected = String(selected);
    host.dataset.v2876Width = String(host.clientWidth || 560);
    host.dataset.v2876Progress = String(progress);
  }
  const pruned = new Set(v.pruned), knownCycles = new Set(v.cycleNodes);
  if (v.phase === 'cycle' || v.phase === 'backfill') {
    v.edges.forEach((_, node) => { if (!pruned.has(node)) knownCycles.add(node); });
  }
  const phase = ['prune', 'cycle', 'backfill', 'done'].indexOf(v.phase);
  const tile = (node, tone = '', extra = '') => `<span class="v2876-tile ${tone}"><b>${node}</b>${extra ? `<small>${extra}</small>` : ''}</span>`;
  const chips = (nodes, tone = '', arrows = false) => nodes.map((node, i) => `${arrows && i ? '<i>→</i>' : ''}${tile(node, typeof tone === 'function' ? tone(node) : tone)}`).join('') || '<span class="v2876-empty">∅</span>';
  const card = (label, content, tone = '') => `<section class="v2876-card ${tone}"><header>${label}</header>${content}</section>`;
  const tone = node => knownCycles.has(node) ? 'loop' : 'branch';
  const phases = `<div class="v2876-phases">${[
    ['✂', t('Tỉa nhánh', 'Peel branches')], ['↻', t('Đếm vòng', 'Count the loop')], ['+1', t('Cộng ngược', 'Fill back')],
  ].map(([icon, label], i) => `<span class="${phase === i ? 'active' : phase > i ? 'complete' : ''}"><b>${icon}</b><small>${label}</small></span>`).join('')}</div>`;

  const pathEdges = new Set();
  if (final) {
    walk.nodes.slice(1, Math.min(progress, length)).forEach((node, i) => pathEdges.add(walk.nodes[i] + ',' + node));
  }
  function edgePath(node, target) {
    const a = layout.positions[node], b = layout.positions[target];
    if (node === target) return `M${a.x - 16},${a.y - 17} C${a.x - 60},${a.y - 84} ${a.x + 60},${a.y - 84} ${a.x + 16},${a.y - 17}`;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    const start = { x: a.x + dx / len * 25, y: a.y + dy / len * 25 };
    const end = { x: b.x - dx / len * 29, y: b.y - dy / len * 29 };
    if (v.edges[target] === node) return `M${start.x},${start.y} Q${(a.x + b.x) / 2 - dy / len * 32},${(a.y + b.y) / 2 + dx / len * 32} ${end.x},${end.y}`;
    const component = layout.components.find(c => c.ring.includes(target) && !c.ring.includes(node));
    if (component) {
      const blocked = component.ring.some(other => {
        if (other === target) return false;
        const p = layout.positions[other], f = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (len * len)));
        return Math.hypot(p.x - a.x - f * dx, p.y - a.y - f * dy) < 36;
      });
      if (blocked) {
        const sign = b.y < component.cy ? -1 : 1, lane = component.cy + sign * (component.radius + 48);
        return `M${a.x - 25},${a.y} C${a.x - 48},${lane} ${b.x},${lane} ${b.x},${b.y + sign * 29}`;
      }
    }
    return `M${start.x},${start.y} L${end.x},${end.y}`;
  }
  const edges = v.edges.map((target, node) => {
    const key = node + ',' + target;
    const active = !final && v.current === node && v.next === target;
    const repeatEdge = repeated && node === walk.nodes.at(-1) && target === walk.repeat;
    const cls = repeatEdge ? 'repeat' : pathEdges.has(key) ? 'walk' : active ? 'active' : knownCycles.has(node) ? 'loop' : pruned.has(node) && !v.answer[node] ? 'cut' : '';
    return `<path class="v2876-edge ${cls}" data-edge="${key}" d="${edgePath(node, target)}" marker-end="url(#v2876-arrow-${cls || 'base'})"/>`;
  }).join('');
  const nodes = v.edges.map((_, node) => {
    const p = layout.positions[node], isCurrent = !final && v.current === node;
    const cls = [knownCycles.has(node) ? 'loop' : 'branch', pruned.has(node) && !v.answer[node] ? 'peeled' : '', counted.has(node) ? 'counted' : '', isCurrent || final && selected === node ? 'selected' : ''].join(' ');
    const caption = phase === 0 && v.event !== 'input' ? '↓ ' + v.indegree[node] : v.answer[node] ? '= ' + v.answer[node] : '';
    const accessible = final ? `role="button" tabindex="0" data-v2876-select="${node}" aria-pressed="${selected === node}" aria-label="${esc(t('Đỉnh', 'Node'))} ${node}, ${t('đáp án', 'answer')} ${v.answer[node]}"` : '';
    return `<g class="v2876-node ${cls}" data-node="${node}" transform="translate(${p.x},${p.y})" ${accessible}><title>${esc(t('Đỉnh', 'Node'))} ${node} → ${v.edges[node]}${v.answer[node] ? ', ' + t('đếm', 'count') + ' ' + v.answer[node] : ''}</title>${knownCycles.has(node) ? '<circle class="v2876-ring" r="29"/>' : ''}<circle class="v2876-disc" r="22"/><text class="v2876-id" text-anchor="middle" y="${caption ? -2 : 6}">${node}</text>${caption ? `<text class="v2876-sub" text-anchor="middle" y="14">${caption}</text>` : ''}${counted.has(node) ? '<circle class="v2876-check-disc" cx="18" cy="-19" r="9"/><text class="v2876-check" x="18" y="-15" text-anchor="middle">✓</text>' : pruned.has(node) && !v.answer[node] ? '<text class="v2876-cut-mark" x="20" y="-18">×</text>' : ''}</g>`;
  }).join('');
  const separators = layout.components.slice(1).map(c => `<path class="v2876-divider" d="M20,${c.top} H${layout.width - 20}"/>`).join('');
  const minWidth = Math.min(layout.width, Math.max(280, layout.width * 0.83));
  const scrollHint = minWidth > (host.clientWidth || 560) - 48 ? `<small class="v2876-scroll-hint">↔ ${t('Kéo ngang', 'Scroll sideways')}</small>` : '';
  const board = `<div class="v2876-board"><svg class="v2876-graph" style="min-width:${minWidth}px;max-width:${layout.width}px" viewBox="0 0 ${layout.width} ${layout.height}" role="group" aria-label="${esc(t('Mũi tên chỉ đường đi; trong đỉnh là số cạnh vào hoặc đáp án', 'Arrows show the walk; nodes show indegree or answer'))}"><defs>${['base', 'loop', 'cut', 'active', 'walk', 'repeat'].map(cls => `<marker id="v2876-arrow-${cls}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path class="${cls}" d="M0 0 L10 5 L0 10Z"/></marker>`).join('')}</defs>${separators}${edges}${nodes}</svg></div>${scrollHint}`;
  const legend = `<div class="v2876-legend"><span class="branch">● ${t('nhánh', 'branch')}</span><span class="loop">◎ ${t('vòng', 'loop')}</span><span>${v.event === 'input' ? '→ edges[i]' : phase === 0 ? '↓ ' + t('số cạnh vào', 'incoming edges') : '= ' + t('số đỉnh đếm được', 'distinct nodes')}</span></div>`;
  let detail = '';
  if (v.event === 'input') {
    const preview = layout.walks.reduce((best, item) => item.nodes.length > best.nodes.length ? item : best);
    detail = card(t('Mỗi đỉnh +1 · gặp lại thì dừng', 'Each node +1 · stop at a repeat'), `<div class="v2876-route">${preview.nodes.map((node, i) => `${i ? '<i>→</i>' : ''}${tile(node, i < preview.cycleAt ? 'branch' : 'loop', '+1')}`).join('')}<i>→</i>${tile(preview.repeat, 'repeat', '+0')}</div>`);
  } else if (phase === 0) {
    detail = `<div class="v2876-pair">${card('queue', `<div class="v2876-row">${chips(v.queue, 'waiting')}</div>`)}${card(t('Thứ tự tỉa', 'Peel order'), `<div class="v2876-row">${chips(v.removed, 'peeled', true)}</div>`)}</div>`;
    if (v.change) detail += `<div class="v2876-equation"><small>↓ ${v.change.node}</small><span>${v.change.from}</span><i>− 1 →</i><strong>${v.change.to}</strong></div>`;
  } else if (phase === 1) {
    const cycle = v.cycle;
    detail = card(cycle.length ? '↻ ' + t('Một vòng, không đếm lần thứ hai', 'One loop, no second count') : t('Các đỉnh còn lại', 'The remaining nodes'), `<div class="v2876-route">${chips(cycle.length ? cycle : [...knownCycles], 'loop', cycle.length > 0)}${cycle.length && v.next === cycle[0] || v.event === 'cycle' ? `<i>↶</i>${tile(cycle[0], 'repeat', '+0')}` : ''}</div>${v.event === 'cycle' ? `<div class="v2876-equation"><span>${cycle.length} ${t('đỉnh', 'nodes')}</span><i>→</i><strong>${cycle.length}</strong><small>${t('cho mỗi đỉnh trên vòng', 'for each loop node')}</small></div>` : ''}`);
  } else if (phase === 2) {
    const suffix = visited2876Walk(v.edges, v.next).nodes;
    detail = card(t('Thêm mình vào đường đã biết', 'Add yourself to the known walk'), `<div class="v2876-route">${tile(v.current, 'new', '+1')}<i>+</i><div class="v2876-suffix">${chips(suffix, tone, true)}</div></div><div class="v2876-equation"><span>1</span><i>+</i><span>${v.change.base}</span><i>=</i><strong>${v.change.to}</strong></div>`);
    detail += card('← ' + t('Tính ngược thứ tự tỉa', 'Reverse the peel order'), `<div class="v2876-row">${chips([...v.removed].reverse(), node => node === v.current ? 'new' : v.answer[node] ? 'branch' : 'peeled', true)}</div>`);
  }
  const answers = card(final ? t('Bấm đỉnh xuất phát', 'Choose a starting node') : 'answer', `<div class="v2876-answers">${v.answer.map((value, node) => `<${final ? 'button type="button"' : 'span'} class="v2876-answer ${tone(node)} ${final && selected === node ? 'selected' : ''}" ${final ? `data-v2876-select="${node}" aria-pressed="${selected === node}" aria-label="${esc(t('Bắt đầu tại', 'Start at'))} ${node}, ${t('đáp án', 'answer')} ${value}"` : ''}><small>${node}</small><b>${value || '?'}</b></${final ? 'button' : 'span'}>`).join('')}</div>`);
  if (final) {
    detail = card(t('Đi thử · ✓ chỉ đếm một lần', 'Try the walk · count each ✓ once'), `<div class="v2876-route">${walk.nodes.map((node, i) => `<i>${i ? '→' : ''}</i><button type="button" class="v2876-tile ${i < walk.cycleAt ? 'branch' : 'loop'} ${i < progress ? '' : 'pending'}" data-v2876-progress="${i + 1}"><b>${node}</b><small>${i < progress ? '✓' : '+1'}</small></button>`).join('')}<i>→</i><button type="button" class="v2876-tile repeat ${repeated ? '' : 'pending'}" data-v2876-progress="${length + 1}"><b>${walk.repeat}</b><small>+0</small></button></div><div class="v2876-count"><span>${t('Đã đếm', 'Counted')} <strong data-v2876-count="${Math.min(progress, length)}">${Math.min(progress, length)}</strong> / ${length}</span><b class="${repeated ? 'repeat' : ''}">${repeated ? '↶ ' + t('Gặp lại · dừng', 'Repeat · stop') : '→ ' + t('Đi tiếp', 'Keep going')}</b></div><nav class="v2876-play"><button type="button" data-v2876-progress="1" aria-label="${t('Đi lại từ đầu', 'Restart walk')}">↺</button><button type="button" data-v2876-progress="${progress - 1}" ${progress === 1 ? 'disabled' : ''}>←</button><button type="button" data-v2876-progress="${progress + 1}" ${repeated ? 'disabled' : ''}>${t('Đi tiếp', 'Next')} →</button></nav><div class="v2876-equation"><span class="branch">${walk.cycleAt}<small>${t('nhánh', 'branch')}</small></span><i>+</i><span class="loop">${length - walk.cycleAt}<small>${t('vòng', 'loop')}</small></span><i>=</i><strong>${length}</strong></div>`);
  }
  const presets = `<nav class="v2876-presets"><small>${t('Ví dụ', 'Examples')}</small><button type="button" data-v2876-example="simple">↻ + 1</button><button type="button" data-v2876-example="branches">${t('Nhiều nhánh', 'Branches')}</button><button type="button" data-v2876-example="loops">${t('Hai vòng', 'Two loops')}</button><button type="button" data-v2876-example="ring">${t('Toàn vòng', 'All loop')}</button></nav>`;
  host.innerHTML = `<section class="v2876-viz"><header class="v2876-heading"><strong>${esc(lang === 'vi' ? step.title.vi : step.title.en)}</strong><small>#2876</small></header>${phases}${card(t('Đi theo chiều mũi tên', 'Follow the arrows'), board + legend)}${final ? answers + detail : detail + answers}${presets}</section>`;
  const wrap = host.querySelector?.('.v2876-board');
  if (wrap) {
    wrap.scrollLeft = scroll;
    if (final && (previousSelected !== selected || previousWidth !== host.clientWidth)) {
      const node = wrap.querySelector(`[data-node="${selected}"]`);
      if (node) {
        const a = wrap.getBoundingClientRect(), b = node.getBoundingClientRect();
        wrap.scrollLeft += b.left + b.width / 2 - a.left - a.width / 2;
      }
    }
  }
  host.querySelectorAll?.('[data-v2876-select]').forEach(button => {
    const select = () => {
      host.dataset.v2876Selected = button.dataset.v2876Select;
      host.dataset.v2876Progress = String(layout.walks[Number(button.dataset.v2876Select)].nodes.length + 1);
      renderCountVisited2876Pictures(step);
    };
    button.addEventListener('click', select);
    if (button.tagName.toLowerCase() === 'g') button.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); }
    });
  });
  host.querySelectorAll?.('[data-v2876-progress]').forEach(button => button.addEventListener('click', () => {
    host.dataset.v2876Progress = button.dataset.v2876Progress;
    renderCountVisited2876Pictures(step);
  }));
  host.querySelectorAll?.('[data-v2876-example]').forEach(button => button.addEventListener('click', async () => {
    const presets = { simple: [1, 2, 0, 0], branches: [1, 2, 0, 0, 3, 4, 3], loops: [1, 0, 3, 4, 2, 4, 5, 0], ring: [1, 2, 3, 4, 0] };
    $('arrInput').value = JSON.stringify(presets[button.dataset.v2876Example]);
    await runViz();
  }));
}
