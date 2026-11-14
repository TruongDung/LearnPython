'use strict';

function ways1976Routes(view, limit = 8) {
  const distance = view.nodes.map(node => node.distance === '∞' ? Infinity : Number(node.distance));
  const next = Array.from({ length: view.n }, () => []), previous = Array.from({ length: view.n }, () => []);
  for (const edge of view.edges) for (const [u, v] of [[edge.u, edge.v], [edge.v, edge.u]]) {
    if (Number.isFinite(distance[u]) && Number.isFinite(distance[v]) && distance[u] + edge.w === distance[v]) {
      next[u].push({ to: v, index: edge.index, weight: edge.w });
      previous[v].push({ from: u, index: edge.index });
    }
  }
  const goalNodes = new Set(), goalEdges = new Set();
  if (Number.isFinite(distance[view.target])) {
    const pending = [view.target]; goalNodes.add(view.target);
    for (let head = 0; head < pending.length; head++) for (const edge of previous[pending[head]]) {
      goalEdges.add(edge.index);
      if (!goalNodes.has(edge.from)) { goalNodes.add(edge.from); pending.push(edge.from); }
    }
  }
  const counts = Array(view.n).fill(0n); counts[0] = 1n;
  view.nodes.map(node => node.node).sort((a, b) => distance[a] - distance[b]).forEach(u => {
    for (const edge of next[u]) counts[edge.to] += counts[u];
  });
  const routes = [];
  function visit(node, nodes, edges, weights) {
    if (routes.length >= limit || !goalNodes.has(node)) return;
    if (node === view.target) { routes.push({ nodes, edges, weights, time: weights.reduce((sum, w) => sum + w, 0) }); return; }
    for (const edge of next[node]) {
      visit(edge.to, [...nodes, edge.to], [...edges, edge.index], [...weights, edge.weight]);
      if (routes.length >= limit) break;
    }
  }
  visit(0, [0], [], []);
  return { routes, total: counts[view.target].toString(), goalEdges: [...goalEdges], capped: counts[view.target] > BigInt(routes.length) };
}

function ways1976Layout(view) {
  const levels = [...new Set(view.nodes.map(node => view.positions[node.node].x))].sort((a, b) => a - b);
  const groups = levels.map(x => view.nodes.filter(node => view.positions[node.node].x === x).sort((a, b) => view.positions[a.node].y - view.positions[b.node].y));
  const numberWidth = String(Math.max(1, ...view.edges.map(edge => edge.w)) * Math.max(1, view.n)).length * 7 + 27;
  const labelWidth = Math.max(66, numberWidth), pitch = Math.max(132, labelWidth + 42);
  const width = Math.max(260, (levels.length - 1) * pitch + labelWidth + 85);
  const height = Math.max(270, Math.max(...groups.map(group => group.length)) * 128 + 130);
  const positions = [];
  groups.forEach((nodes, column) => nodes.forEach((node, row) => {
    positions[node.node] = { x: view.n === 1 ? width / 2 : labelWidth / 2 + 38 + column * pitch, y: 75 + (row + .5) * (height - 150) / nodes.length };
  }));
  const boxes = positions.map(p => ({ x: p.x - labelWidth / 2 - 6, y: p.y - 57, w: labelWidth + 12, h: 114 }));
  const overlaps = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const labels = [];
  let bypass = 0;
  const curves = view.edges.map((edge, i) => {
    let a = positions[edge.u], b = positions[edge.v];
    if (a.x > b.x || a.x === b.x && a.y > b.y) [a, b] = [b, a];
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
    let path, point;
    const blocked = positions.some(p => {
      if (p === a || p === b) return false;
      const f = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (length * length)));
      return Math.abs(p.x - a.x - f * dx) < labelWidth / 2 + 9 && Math.abs(p.y - a.y - f * dy) < 55;
    });
    if (a.x === b.x) {
      const bend = labelWidth + 52;
      path = `M${a.x + 25},${a.y} Q${a.x + bend},${(a.y + b.y) / 2} ${b.x + 25},${b.y}`;
      point = t => ({ x: a.x + 25 + 2 * t * (1 - t) * (bend - 25), y: a.y + t * dy });
    } else if (blocked) {
      const offset = 27 + Math.min(44, Math.floor(bypass / 2) * 22);
      const lane = bypass++ % 2 ? height - offset : offset, turn = Math.min(62, dx / 3);
      path = `M${a.x + 26},${a.y} C${a.x + turn},${a.y} ${a.x + turn},${lane} ${a.x + turn + 20},${lane} L${b.x - turn - 20},${lane} C${b.x - turn},${lane} ${b.x - turn},${b.y} ${b.x - 26},${b.y}`;
      point = t => ({ x: a.x + turn + 20 + t * (dx - 2 * turn - 40), y: lane });
    } else {
      path = `M${a.x + dx / length * 26},${a.y + dy / length * 26} L${b.x - dx / length * 26},${b.y - dy / length * 26}`;
      point = t => ({ x: a.x + dx * t, y: a.y + dy * t });
    }
    const labelW = Math.max(24, String(edge.w).length * 7 + 12), candidates = [];
    for (const fraction of [.5, .35, .65, .2, .8]) for (const offset of [0, 15, -15, 29, -29]) {
      const p = point(fraction), nx = a.x === b.x ? 1 : -dy / length, ny = a.x === b.x ? 0 : dx / length;
      const box = { x: p.x + nx * offset - labelW / 2, y: p.y + ny * offset - 10, w: labelW, h: 20 };
      const score = boxes.reduce((sum, b) => sum + overlaps(box, b), 0) * 5 + labels.reduce((sum, b) => sum + overlaps(box, b), 0);
      if (box.x >= 5 && box.y >= 5 && box.x + box.w <= width - 5 && box.y + box.h <= height - 5) candidates.push({ ...box, score });
    }
    candidates.sort((a, b) => a.score - b.score);
    const label = candidates[0] || { x: width / 2, y: 10, w: labelW, h: 20 };
    labels.push({ x: label.x - 3, y: label.y - 3, w: label.w + 6, h: label.h + 6 });
    return { path, label };
  });
  return { width, height, labelWidth, positions, curves };
}

function ways1976Car(cls = '') {
  return `<svg class="sw1976-car ${cls}" viewBox="0 0 26 18" aria-hidden="true"><path d="M2 7h3l3-5h9l4 5h3v7H2Z M6 7h13 M11 2v5"/><circle cx="7" cy="14" r="3"/><circle cx="20" cy="14" r="3"/></svg>`;
}

function renderShortestWays1976Pictures(step) {
  const v = step.countPaths1976View, host = $('treeView');
  if (!host || !v) return;
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const key = JSON.stringify([v.n, v.edges]), sameGraph = host.dataset?.sw1976Graph === key;
  if (!sameGraph || !host.sw1976Layout) host.sw1976Layout = ways1976Layout(v);
  const layout = host.sw1976Layout, final = Boolean(step.final);
  if (final && (!sameGraph || !host.sw1976Analysis)) host.sw1976Analysis = ways1976Routes(v);
  if (!final) host.sw1976Analysis = null;
  const analysis = final ? host.sw1976Analysis : null, routes = analysis?.routes || [];
  const sameFinal = final && sameGraph && host.dataset?.sw1976Final === '1';
  const selected = sameFinal ? Math.min(routes.length - 1, Number(host.dataset.sw1976Selected || 0)) : 0;
  const route = routes[selected];
  const progress = route ? sameFinal ? Math.max(0, Math.min(route.edges.length, Number(host.dataset.sw1976WalkPosition ?? route.edges.length))) : route.edges.length : 0;
  const current = route ? route.nodes[progress] : v.currentNode;
  const oldFocus = sameGraph ? host.dataset?.sw1976Focus : null, focus = String(current);
  const oldScroll = sameGraph ? host.querySelector?.('.sw1976-map') : null;
  const scroll = { left: oldScroll?.scrollLeft || 0, top: oldScroll?.scrollTop || 0 };
  const previousWidth = Number(host.dataset?.sw1976Width || 0);
  if (host.dataset) {
    host.dataset.sw1976Graph = key; host.dataset.sw1976Final = final ? '1' : '0';
    host.dataset.sw1976Selected = String(selected); host.dataset.sw1976WalkPosition = String(progress);
    host.dataset.sw1976Focus = focus; host.dataset.sw1976Width = String(host.clientWidth || 600);
  }
  const card = (label, body, cls = '') => `<section class="sw1976-card ${cls}"><header>${label}</header>${body}</section>`;
  const line = step.codeLines[0], edge = v.activeEdge;
  const relation = ['shorter', 'equal', 'longer'].includes(v.relation) ? v.relation : 'pending';
  const names = { shorter: t('Nhanh hơn → thay nhóm cũ', 'Earlier → replace old routes'), equal: t('Bằng giờ → cộng hai nhóm', 'Same time → add route groups'), longer: t('Chậm hơn → không tính', 'Later → do not count') };
  const heading = final ? t('Cùng nhanh nhất, có mấy đường?', 'How many equally fastest routes?') : names[relation] || (line === 21 ? t('Bỏ bản ghi cũ', 'Skip the stale entry') : line === 20 ? t('Kiểm tra giờ đến', 'Check the arrival time') : line === 18 || line === 19 ? t('Lấy giờ nhỏ nhất', 'Take the earliest time') : line <= 16 ? t('Xuất phát từ giao lộ 0', 'Start at intersection 0') : t('Thử nối thêm một đoạn đường', 'Try one more road'));
  const rules = `<div class="sw1976-rules">${[['shorter', '<', t('Thay', 'Replace')], ['equal', '=', t('Cộng', 'Add')], ['longer', '>', t('Bỏ', 'Skip')]].map(([name, icon, label]) => `<span class="${name} ${relation === name ? 'active' : ''}"><b>${esc(icon)}</b><small>${label}</small></span>`).join('')}</div>`;
  const selectedEdges = new Set(route?.edges || []), traveled = new Set(route?.edges.slice(0, progress) || []);
  const goalEdges = new Set(analysis?.goalEdges || []), knownEdges = new Set(v.shortestEdges.map(e => [Math.min(e.u, e.v), Math.max(e.u, e.v)].join(',')));
  const roads = v.edges.map((e, i) => {
    const active = !final && edge && (edge.u === e.u && edge.v === e.v || edge.u === e.v && edge.v === e.u) && edge.w === e.w;
    const cls = [final ? goalEdges.has(e.index) ? 'goal' : 'off' : knownEdges.has([Math.min(e.u, e.v), Math.max(e.u, e.v)].join(',')) ? 'known' : '', selectedEdges.has(e.index) ? 'selected' : '', traveled.has(e.index) ? 'traveled' : '', active ? 'active ' + relation : ''].join(' ');
    const { path, label } = layout.curves[i];
    return `<g class="sw1976-road ${cls}" data-road="${e.index}" data-weight="${e.w}"><path d="${path}"/><rect x="${label.x}" y="${label.y}" width="${label.w}" height="20" rx="6"/><text x="${label.x + label.w / 2}" y="${label.y + 14}" text-anchor="middle">${e.w}</text></g>`;
  }).join('');
  const nodes = v.nodes.map(node => {
    const p = layout.positions[node.node], cls = [node.isFinalized ? 'settled' : '', node.node === current ? 'current' : '', !final && node.isCandidate ? 'candidate' : ''].join(' ');
    const countW = Math.max(44, String(node.ways).length * 7 + 23);
    return `<g class="sw1976-node ${cls}" data-node="${node.node}" data-distance="${node.distance}" data-ways="${node.ways}"><circle class="sw1976-halo" cx="${p.x}" cy="${p.y}" r="29"/><circle class="sw1976-disc" cx="${p.x}" cy="${p.y}" r="23"/><text class="sw1976-id" x="${p.x}" y="${p.y + 6}" text-anchor="middle">${node.node}</text><rect class="sw1976-time-bg" x="${p.x - layout.labelWidth / 2}" y="${p.y - 54}" width="${layout.labelWidth}" height="22" rx="7"/><text class="sw1976-time" x="${p.x}" y="${p.y - 39}" text-anchor="middle">⏱ ${node.distance}</text><rect class="sw1976-count-bg" x="${p.x - countW / 2}" y="${p.y + 32}" width="${countW}" height="22" rx="7"/><text class="sw1976-count" x="${p.x}" y="${p.y + 47}" text-anchor="middle">× ${node.ways}</text>${node.isSource || node.isTarget ? `<text class="sw1976-endpoint" x="${p.x}" y="${p.y - 64}" text-anchor="middle">${node.isSource && node.isTarget ? 'S/T' : node.isSource ? 'S' : 'T'}</text>` : ''}</g>`;
  }).join('');
  const traveler = current !== null && current !== undefined && layout.positions[current] ? (() => { const p = layout.positions[current]; return `<g class="sw1976-traveler" transform="translate(${p.x + 28},${p.y - 4})"><path d="M0 6H3L6 1H15L18 6H21V13H0Z M4 6H17 M10 1V6"/><circle cx="5" cy="13" r="3"/><circle cx="17" cy="13" r="3"/></g>`; })() : '';
  const minWidth = v.n <= 8 ? Math.min(layout.width, Math.max(390, layout.width * .74)) : layout.width;
  const graph = `<div class="sw1976-map" tabindex="0" role="region" aria-label="${t('Bản đồ đường; kéo để xem', 'Road map; scroll to explore')}"><svg class="sw1976-graph" style="width:${layout.width}px;min-width:${minWidth}px;max-width:100%" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="${t('Trọng số trên đường, giờ đến và số cách tại giao lộ', 'Road times, arrival times and route counts')}">${roads}${nodes}${traveler}</svg></div>`;
  const map = card(`<b>0 → ${v.target}</b><small>⏱ ${t('nhanh nhất', 'earliest')} · × ${t('số cách', 'routes')}</small>`, graph + (minWidth > (host.clientWidth || 600) - 52 || layout.height > 490 ? `<small class="sw1976-scroll-hint">↔ ↕ ${t('Kéo để xem', 'Scroll to explore')}</small>` : ''));
  const fleet = (count, label, cls = '') => `<div class="sw1976-fleet ${cls}"><div>${count === 0 ? '<i>∅</i>' : Array.from({ length: Math.min(count, 5) }, () => ways1976Car()).join('')}${count > 5 ? '<i>…</i>' : ''}</div><b>${count}</b><small>${label}</small></div>`;
  let action = '';
  if (!final && edge && v.candidateTime !== null) {
    const from = v.nodes[edge.u], destination = v.nodes[edge.v];
    const comparison = v.previousDistance === null ? '' : `<i>${relation === 'shorter' ? '&lt;' : relation === 'equal' ? '=' : relation === 'longer' ? '&gt;' : '?'}</i><span>${v.previousDistance}</span>`;
    action = card(`${edge.u} → ${edge.v}`, `<div class="sw1976-distance-calc"><span>${from.distance}</span><i>+</i><span>${edge.w}</span><i>=</i><strong>${v.candidateTime}</strong>${comparison}</div>`);
    const incoming = v.incomingWays ?? from.ways, before = v.previousWays ?? (line < 26 ? destination.ways : null);
    if (relation === 'equal') {
      const total = (v.previousWays + incoming) % 1000000007;
      action += card(names.equal, `<div class="sw1976-merge">${fleet(v.previousWays, t('đã có', 'existing'), 'old')}<i>+</i>${fleet(incoming, t('qua', 'via') + ' ' + edge.u, 'incoming')}<i>→</i>${fleet(total, 'ways[' + edge.v + ']', line === 29 ? 'result' : 'preview')}</div>${v.previousWays + incoming >= 1000000007 ? '<small>mod 10⁹+7</small>' : ''}`, 'equal');
    } else if (relation === 'shorter') {
      action += card(names.shorter, `<div class="sw1976-merge">${before !== null ? fleet(before, t('bỏ nhóm cũ', 'discard old'), 'discard') + '<i>↻</i>' : ''}${fleet(incoming, t('qua', 'via') + ' ' + edge.u, 'incoming')}<i>→</i>${fleet(incoming, 'ways[' + edge.v + ']', line >= 26 ? 'result' : 'preview')}</div>`, 'shorter');
    } else if (relation === 'longer') action += `<div class="sw1976-skip">${ways1976Car()} <b>↛</b><span>× ${destination.ways}</span><small>${t('Giữ nguyên', 'Keep unchanged')}</small></div>`;
  }
  let result = '';
  if (final) {
    result = card(`<b>🏁 ${analysis.total} ${t('đường', 'routes')}</b><strong class="sw1976-best-time">⏱ ${v.nodes[v.target].distance}</strong>`, `<div class="sw1976-paths">${routes.map((item, i) => `<button type="button" class="${i === selected ? 'selected' : ''}" data-sw1976-route="${i}" aria-pressed="${i === selected}"><b>${i + 1}</b><span>${item.nodes.map((node, j) => `${j ? '<i>→</i>' : ''}<em>${node}</em>`).join('')}</span><strong>⏱ ${item.time}</strong></button>`).join('') || `<div class="sw1976-empty">0 ↛ ${v.target}</div>`}</div>${analysis.capped ? `<small>${t('Minh họa', 'Showing')} ${routes.length} / ${analysis.total}</small>` : ''}${analysis.total !== String(v.answer) ? `<small>ways[${v.target}] % (10⁹+7) = ${v.answer}</small>` : ''}<span class="sw1976-answer" data-answer="${v.answer}"></span>`);
    if (route) {
      const elapsed = route.weights.slice(0, progress).reduce((sum, w) => sum + w, 0);
      result += card(t('Đi thử đường đã chọn', 'Try the selected route'), `<div class="sw1976-walk">${ways1976Car()}<b>${route.nodes[progress]}</b><span data-sw1976-elapsed="${elapsed}">⏱ ${elapsed}</span><small>/ ${route.time}</small></div><div class="sw1976-sum">${route.weights.map((w, i) => `<span class="${i < progress ? 'passed' : ''}">${i ? '+ ' : ''}${w}</span>`).join('') || '<span>0</span>'}<b>= ${route.time}</b></div><nav class="sw1976-play"><button type="button" data-sw1976-progress="0" aria-label="${t('Đi lại từ đầu', 'Restart route')}">↺</button><button type="button" data-sw1976-progress="${progress - 1}" ${progress === 0 ? 'disabled' : ''}>←</button><button type="button" data-sw1976-progress="${progress + 1}" ${progress === route.edges.length ? 'disabled' : ''}>${t('Đi tiếp', 'Next')} →</button></nav>`);
    }
  }
  const heap = !final ? card('<b>MIN heap</b><small>⏱ ' + t('nhỏ nhất trước', 'earliest first') + '</small>', `<div class="sw1976-heap">${v.heap.map((item, i) => `<span class="${i === 0 ? 'min' : ''}" data-heap-entry="${item.time},${item.node}"><small>${item.node}</small><b>${item.time}</b></span>`).join('') || '<span class="sw1976-empty">∅</span>'}</div>`) : '';
  const presets = [
    { name: t('4 đường', '4 routes'), n: 7, roads: '0,6,7;0,1,2;1,2,3;1,3,3;6,3,3;3,5,1;6,5,1;2,5,1;0,4,5;4,6,2' },
    { name: t('Hình thoi', 'Diamond'), n: 4, roads: '0,1,1;0,2,1;1,3,1;2,3,1' },
    { name: t('Thay đường cũ', 'Replace old'), n: 4, roads: '0,3,9;0,1,1;1,2,1;2,3,1' },
  ];
  host.innerHTML = `<section class="sw1976-viz"><header class="sw1976-heading"><strong>${heading}</strong><small>#1976 · L${line}</small></header>${!final ? rules : ''}${map}${result}${action}${heap}${!final ? `<nav class="sw1976-jumps"><button type="button" data-sw1976-jump="copy">↻ ${t('Thay', 'Replace')}</button><button type="button" data-sw1976-jump="add">+ ${t('Cộng', 'Add')}</button><button type="button" data-sw1976-jump="result">🏁</button></nav>` : ''}<nav class="sw1976-presets"><small>${t('Ví dụ', 'Examples')}</small>${presets.map((p, i) => `<button type="button" data-sw1976-preset="${i}">${p.name}</button>`).join('')}</nav></section>`;
  const scroller = host.querySelector?.('.sw1976-map');
  if (scroller) {
    scroller.scrollLeft = scroll.left; scroller.scrollTop = scroll.top;
    if (oldFocus !== focus || previousWidth !== host.clientWidth) {
      const point = layout.positions[current ?? 0], svg = scroller.querySelector('svg');
      const svgBox = svg.getBoundingClientRect(), scale = svgBox.width / layout.width;
      const x = svgBox.left + point.x * scale, y = svgBox.top + point.y * scale, box = scroller.getBoundingClientRect();
      scroller.scrollLeft += x - box.left - box.width / 2; scroller.scrollTop += y - box.top - box.height / 2;
    }
  }
  const stop = () => { if (typeof stopPlay === 'function') stopPlay(); };
  host.querySelectorAll?.('button').forEach(button => button.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') event.stopPropagation(); }));
  host.querySelectorAll?.('[data-sw1976-route]').forEach(button => button.addEventListener('click', () => {
    stop(); host.dataset.sw1976Selected = button.dataset.sw1976Route; host.dataset.sw1976WalkPosition = '0'; renderShortestWays1976Pictures(step);
    host.querySelector(`[data-sw1976-route="${button.dataset.sw1976Route}"]`)?.focus({ preventScroll: true });
  }));
  host.querySelectorAll?.('[data-sw1976-progress]').forEach(button => button.addEventListener('click', () => {
    stop(); const position = [...button.parentElement.children].indexOf(button); host.dataset.sw1976WalkPosition = button.dataset.sw1976Progress; renderShortestWays1976Pictures(step);
    host.querySelectorAll('.sw1976-play button')[position]?.focus({ preventScroll: true });
  }));
  host.querySelectorAll?.('[data-sw1976-preset]').forEach(button => button.addEventListener('click', async () => {
    stop(); const preset = presets[Number(button.dataset.sw1976Preset)]; $('arrInput').value = preset.roads; $('param-n').value = preset.n; await runViz();
  }));
  host.querySelectorAll?.('[data-sw1976-jump]').forEach(button => button.addEventListener('click', () => {
    stop(); const codeLine = { copy: 26, add: 29, result: 30 }[button.dataset.sw1976Jump];
    const index = steps.findIndex((s, i) => i > stepIndex && s.codeLines[0] === codeLine); stepIndex = index >= 0 ? index : steps.length - 1; renderStep();
  }));
}
