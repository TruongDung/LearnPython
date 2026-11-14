'use strict';

function room3341Scene(view, legIndex = 0, stage = 'wait') {
  const route = view.winner || view.active?.route;
  const leg = view.winner?.legs[legIndex];
  const p = view.proposal;
  const transition = leg ? { ...leg, unlock: view.grid[leg.to[0]][leg.to[1]] }
    : p?.inside ? { ...p, start: view.active.time, wait: p.depart === null ? null : p.depart - view.active.time } : null;
  const clock = leg ? stage === 'wait' ? leg.start : stage === 'move' ? leg.depart : leg.arrival : view.clock;
  const position = leg ? stage === 'arrive' ? leg.to : leg.from : view.active ? [view.active.r, view.active.c] : [0, 0];
  return { route, transition, clock, position, stage, legIndex };
}

function room3341Dimensions(v) {
  const digits = String(Math.max(...v.grid.flat()) + v.rows * v.cols).length;
  const tileWidth = Math.max(100, Math.ceil((digits + 4) * 9.7 + 16)), tileHeight = 110;
  const pitchX = tileWidth + 30, pitchY = tileHeight + 30, pad = 22;
  const width = pad * 2 + v.cols * pitchX - 30, height = pad * 2 + v.rows * pitchY - 30;
  return { tileWidth, tileHeight, pitchX, pitchY, pad, width, height };
}

function room3341Grid(v, scene) {
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const { tileWidth, tileHeight, pitchX, pitchY, pad, width, height } = room3341Dimensions(v);
  const center = ([r, c]) => ({ x: pad + c * pitchX + tileWidth / 2, y: pad + r * pitchY + tileHeight / 2 });
  const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  const route = new Set(scene.route?.nodes.map(p => `${p.r},${p.c}`) || []), settled = new Set(v.final ? [] : v.settled);
  const link = (from, to, cls, arrow = false) => {
    const a = center(from), b = center(to), dx = to[1] - from[1], dy = to[0] - from[0];
    const x1 = a.x + dx * (tileWidth / 2 + 2), y1 = a.y + dy * (tileHeight / 2 + 2);
    const x2 = b.x - dx * (tileWidth / 2 + 5), y2 = b.y - dy * (tileHeight / 2 + 5);
    return `<path class="rr3341-corridor ${cls}" d="M${x1},${y1} L${x2},${y2}" ${arrow ? `marker-end="url(#rr3341-arrow-${cls})"` : ''}/>`;
  };
  let corridors = '';
  for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) {
    if (c + 1 < v.cols) corridors += link([r, c], [r, c + 1], '');
    if (r + 1 < v.rows) corridors += link([r, c], [r + 1, c], '');
  }
  for (const leg of scene.route?.legs || []) corridors += link(leg.from, leg.to, 'route', true);
  if (scene.transition) corridors += link(scene.transition.from, scene.transition.to, 'candidate', true);
  const rooms = v.grid.map((row, r) => row.map((gate, c) => {
    const p = [r, c], at = center(p), x = at.x - tileWidth / 2, y = at.y - tileHeight / 2;
    const start = r === 0 && c === 0, target = r === v.rows - 1 && c === v.cols - 1;
    const open = start || gate <= scene.clock, here = same(p, scene.position), next = same(p, scene.transition?.to);
    const distance = v.dist?.[r]?.[c] ?? '…';
    const cls = [open ? 'open' : 'locked', route.has(`${r},${c}`) ? 'route' : '', settled.has(`${r},${c}`) ? 'settled' : '', here ? 'here' : '', next ? 'next' : ''].join(' ');
    const dx = at.x - 10, dy = y + 22;
    const door = open ? `<path class="rr3341-door" d="M${dx},${dy + 29} V${dy} H${dx + 22} V${dy + 29} M${dx + 22},${dy} l-15,6 v29 l15,-6 Z"/><circle class="rr3341-knob" cx="${dx + 11}" cy="${dy + 19}" r="1.8"/>`
      : `<rect class="rr3341-door" x="${dx}" y="${dy}" width="22" height="31" rx="2"/><circle class="rr3341-knob" cx="${dx + 16}" cy="${dy + 17}" r="1.8"/><path class="rr3341-lock" d="M${dx + 7},${dy + 13} v-3 a4,4 0 0 1 8,0 v3 m-9,0 h10 v8 H${dx + 6} Z"/>`;
    return `<g class="rr3341-room ${cls}" data-room="${r},${c}" data-gate="${gate}" data-dist="${distance}" data-open="${open}"><title>(${r},${c}) · ${start ? t('đã ở đây từ t=0; bỏ qua', 'already here at t=0; ignore') : t('được bắt đầu đi vào từ', 'may start moving in at')} ${gate} · dist ${distance}</title><rect class="rr3341-room-box" x="${x}" y="${y}" width="${tileWidth}" height="${tileHeight}" rx="12"/><text class="rr3341-coord" x="${x + 8}" y="${y + 15}">${r},${c}</text><text class="rr3341-endpoint" x="${x + tileWidth - 9}" y="${y + 15}" text-anchor="end">${start ? 'S' : target ? 'T' : settled.has(`${r},${c}`) ? '✓' : ''}</text>${door}<text class="rr3341-gate ${start ? 'ignored' : ''}" x="${at.x}" y="${y + 72}" text-anchor="middle">≥ ${gate}</text><text class="rr3341-distance" x="${at.x}" y="${y + 98}" text-anchor="middle">t = ${distance}</text></g>`;
  }).join('')).join('');
  let traveler = center(scene.position);
  if (v.final && scene.stage === 'move' && scene.transition) {
    const a = center(scene.transition.from), b = center(scene.transition.to);
    traveler = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 3 };
  } else traveler = { x: traveler.x - tileWidth / 2 + 16, y: traveler.y - 13 };
  const person = `<g class="rr3341-person" data-traveler="${scene.position.join(',')}" transform="translate(${traveler.x},${traveler.y})"><circle cy="-6" r="4"/><path d="M0,-1 v12 M-6,4 L0,0 L6,4 M0,11 l-5,7 M0,11 l5,7"/></g>`;
  return `<svg class="rr3341-grid" style="width:${width}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('Các phòng, cửa chờ và thời điểm đến', 'Rooms, waiting gates and arrival times')}"><defs>${['route', 'candidate'].map(cls => `<marker id="rr3341-arrow-${cls}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10Z"/></marker>`).join('')}</defs>${corridors}${rooms}${person}</svg>`;
}

function room3341Heap(items) {
  if (!items?.length) return '<div class="rr3341-empty">∅</div>';
  const nodeWidth = Math.max(84, String(Math.max(...items.map(e => e[0]))).length * 8 + 30);
  const levels = Math.floor(Math.log2(items.length)) + 1;
  const width = Math.max(230, 2 ** (levels - 1) * (nodeWidth + 12)), height = levels * 63 + 5;
  const pos = i => { const depth = Math.floor(Math.log2(i + 1)); return { x: (i - 2 ** depth + 1.5) * width / 2 ** depth, y: 24 + depth * 63 }; };
  const lines = items.slice(1).map((_, i) => { const a = pos(Math.floor(i / 2)), b = pos(i + 1); return `<path d="M${a.x},${a.y + 20} L${b.x},${b.y - 20}"/>`; }).join('');
  return `<svg class="rr3341-heap" style="width:${width}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="Min heap">${lines}${items.map(([time, r, c], i) => { const p = pos(i); return `<g class="${i === 0 ? 'min' : ''}" data-heap-entry="${time},${r},${c}"><rect x="${p.x - nodeWidth / 2}" y="${p.y - 21}" width="${nodeWidth}" height="42" rx="9"/><text x="${p.x}" y="${p.y - 2}" text-anchor="middle">${time}s</text><text class="sub" x="${p.x}" y="${p.y + 14}" text-anchor="middle">(${r},${c})</text></g>`; }).join('')}</svg>`;
}

function renderLastRoom3341Pictures(step) {
  const v = step.timeRoomView, host = $('treeView');
  if (!host || v?.id !== 3341) return;
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const final = Boolean(v.final), gridKey = JSON.stringify(v.grid), key = gridKey + ':' + v.line + ':' + v.event;
  const same = host.dataset?.rr3341Frame === key;
  const legIndex = final && same ? Number(host.dataset.rr3341SelectedLeg || 0) : 0;
  const stage = final && same ? host.dataset.rr3341SelectedStage || 'wait' : 'wait';
  const scene = room3341Scene(v, legIndex, stage), a = scene.transition;
  const sameGrid = host.dataset?.rr3341Grid === gridKey;
  const previousScroll = sameGrid ? host.querySelector?.('.rr3341-map-scroll') : null;
  const oldScroll = { left: previousScroll?.scrollLeft || 0, top: previousScroll?.scrollTop || 0 };
  const oldFocus = sameGrid ? host.dataset?.rr3341Focus : null;
  const oldWidth = Number(host.dataset?.rr3341Width || 0);
  const focus = `${scene.position.join(',')}:${legIndex}:${stage}`;
  if (host.dataset) {
    host.dataset.rr3341Frame = key;
    host.dataset.rr3341Grid = gridKey;
    host.dataset.rr3341Width = String(host.clientWidth || 560);
    host.dataset.rr3341SelectedLeg = String(legIndex);
    host.dataset.rr3341SelectedStage = stage;
    host.dataset.rr3341Focus = focus;
  }
  const card = (title, body, cls = '') => `<section class="rr3341-card ${cls}"><header>${title}</header>${body}</section>`;
  const coord = point => `(${point.join(',')})`;
  const num = value => value === null || value === undefined ? '?' : value;
  const headings = {
    pop: t('Lấy phòng có giờ đến nhỏ nhất', 'Take the earliest arrival'),
    settle: t('Chốt giờ đến phòng này', 'Settle this arrival'),
    neighbor: t('Thử phòng bên cạnh', 'Try an adjacent room'),
    depart: t('Chờ đủ giờ rồi mới đi', 'Wait until departure is allowed'),
    candidate: t('Đi thêm đúng 1 giây', 'Move for exactly 1 second'),
    improve: t('Đến sớm hơn → cập nhật', 'Earlier → update'),
    reject: t('Không sớm hơn → giữ nguyên', 'No earlier → keep the best'),
    write: t('Lưu giờ đến mới', 'Save the new arrival'),
    push: t('Đưa vào hàng đợi', 'Add to the heap'),
    return: t('Đường đến đích sớm nhất', 'The earliest route to the goal'),
  };
  const clockText = final && stage === 'move' ? `${a.depart} → ${a.arrival}` : scene.clock;
  const clock = `<div class="rr3341-clock"><span>◷</span><strong data-display-time="${scene.clock}">${clockText}</strong><small>${t('giây', 'seconds')}</small>${final ? `<b data-time-answer="${v.answer}">🏁 ${v.answer}s</b>` : ''}</div>`;
  const dimensions = room3341Dimensions(v);
  const needsScroll = dimensions.height > 480 || dimensions.width > (host.clientWidth || 560) - 52;
  const map = card(`<b>S → T</b><small class="rr3341-blue">${t('≥ giờ được đi', '≥ allowed departure')}</small><small class="rr3341-green">t = ${t('giờ đến', 'arrival')}</small>`, `<div class="rr3341-map-scroll" tabindex="0" role="region" aria-label="${t('Bản đồ phòng; kéo để xem toàn bộ', 'Room map; scroll to explore')}">${room3341Grid(v, scene)}</div>${needsScroll ? `<small class="rr3341-scroll-hint">↔ ↕ ${t('Kéo để xem', 'Scroll to explore')}</small>` : ''}`);
  let transition = card(t('Đứng chờ → đi 1 giây', 'Wait here → move for 1 second'), '<div class="rr3341-rule"><span>♟</span><b>⏸</b><i>→</i><span>🚪</span><b>+1s</b><i>→</i><strong>✓</strong></div>');
  if (a) {
    const wait = a.wait;
    const blocks = wait === null ? '<b>?</b>' : wait === 0 ? '<span class="rr3341-no-wait">✓</span>' : Array.from({ length: Math.min(wait, 8) }, (_, i) => `<i>${wait > 8 && i === 4 ? '⋯' : ''}</i>`).join('');
    const oldDistance = v.dist?.[a.to[0]]?.[a.to[1]];
    const comparison = !final && a.accepted !== null && a.accepted !== undefined ? `<div class="rr3341-compare ${a.accepted ? 'yes' : 'no'}">${v.event === 'write' || v.event === 'push' ? `✓ t${coord(a.to)} ← ${num(a.arrival)}` : `${a.accepted ? '✓' : '×'} ${num(a.arrival)} ${a.accepted ? '&lt;' : '≥'} ${num(oldDistance)}`}</div>` : '';
    transition = card(`<b>${coord(a.from)} → ${coord(a.to)}</b><small>${final ? t('Chặng đang xem', 'Selected leg') : t('Đang thử', 'Candidate')}</small>`, `<div class="rr3341-time-flow" data-wait="${num(wait)}" data-depart="${num(a.depart)}" data-arrival="${num(a.arrival)}"><div class="rr3341-time-point"><small>${t('Đang ở', 'At')}</small><strong>${a.start}</strong></div><div class="rr3341-wait"><small>⏸ ${wait === 0 ? t('Không chờ', 'No wait') : num(wait) + 's'}</small><div class="rr3341-wait-blocks">${blocks}</div></div><div class="rr3341-time-point depart"><small>${t('Xuất phát', 'Depart')}</small><strong>${num(a.depart)}</strong></div><div class="rr3341-move"><b>→</b><small>+${num(a.duration)}s</small></div><div class="rr3341-time-point arrive"><small>${t('Đến', 'Arrive')}</small><strong>${num(a.arrival)}</strong></div></div><div class="rr3341-gate-rule"><span>🚪 ≥ ${a.unlock}</span><small>max(${a.start}, ${a.unlock}) + 1</small></div>${comparison}${final ? `<nav class="rr3341-stages">${[['wait', '⏸', t('Chờ', 'Wait')], ['move', '→', t('Đi 1s', 'Move 1s')], ['arrive', '✓', t('Đến', 'Arrive')]].map(([name, icon, label]) => `<button type="button" class="${stage === name ? 'selected' : ''}" data-rr3341-stage="${name}" aria-pressed="${stage === name}"><b>${icon}</b> ${label}</button>`).join('')}</nav>` : ''}`);
  } else if (v.proposal && !v.proposal.inside) {
    transition = card(t('Ngoài lưới', 'Outside the grid'), `<div class="rr3341-rule rr3341-muted">${coord(v.proposal.from)} <b>↛</b> ${coord(v.proposal.to)}</div>`);
  }
  const route = final ? card(t('Bấm một chặng để đi thử', 'Choose a leg to try'), `<div class="rr3341-route"><span>S<small>t = 0</small></span>${v.winner.legs.map((leg, i) => `<i>→</i><button type="button" class="${i === legIndex ? 'selected' : ''}" data-rr3341-leg="${i}" aria-pressed="${i === legIndex}"><b>${coord(leg.to)}</b><small>t = ${leg.arrival}</small></button>`).join('')}</div><div class="rr3341-total"><span>⏸ ${v.winner.legs.reduce((sum, leg) => sum + leg.wait, 0)}</span><i>+</i><span>→ ${v.winner.legs.length}</span><i>=</i><strong>${v.answer}s</strong></div>`) : '';
  const heap = !final && v.heap ? card(`<b>MIN heap</b><small>${v.heap.length} ${t('phòng chờ xét', 'pending rooms')}</small>`, `<div class="rr3341-heap-scroll" tabindex="0" role="region" aria-label="Min heap">${room3341Heap(v.heap)}</div>`) : '';
  const presets = [
    { label: t('Chờ 4s', 'Wait 4s'), grid: [[0, 4], [4, 4]] },
    { label: t('Đi ngay', 'No wait'), grid: [[0, 0, 0], [0, 0, 0]] },
    { label: t('Đi vòng', 'Detour'), grid: [[0, 0, 0], [9, 9, 0], [0, 0, 0]] },
    { label: '10⁹', grid: [[0, 1000000000], [1000000000, 0]] },
  ];
  const buttons = `<nav class="rr3341-presets"><small>${t('Ví dụ', 'Examples')}</small>${presets.map((p, i) => `<button type="button" data-rr3341-preset="${i}">${p.label}</button>`).join('')}</nav>`;
  const jumps = !final ? `<nav class="rr3341-jumps"><button type="button" data-rr3341-jump="pop">Pop →</button><button type="button" data-rr3341-jump="write">${t('Cập nhật', 'Update')} →</button><button type="button" data-rr3341-jump="return">🏁</button></nav>` : '';
  host.innerHTML = `<section class="rr3341-viz" data-event="${v.event}"><header class="rr3341-heading"><strong>${esc(headings[v.event] || t('Mỗi bước mất 1 giây', 'Every move takes 1 second'))}</strong><small>#3341 · L${v.line}</small></header>${clock}${map}${route}${transition}${heap}${jumps}${buttons}</section>`;
  const scroller = host.querySelector?.('.rr3341-map-scroll');
  if (scroller) {
    scroller.scrollLeft = oldScroll.left; scroller.scrollTop = oldScroll.top;
    if (oldFocus !== focus || oldWidth !== host.clientWidth) {
      const room = scroller.querySelector(`[data-room="${scene.position.join(',')}"]`);
      if (room) {
        const box = scroller.getBoundingClientRect(), point = room.getBoundingClientRect();
        scroller.scrollLeft += point.left + point.width / 2 - box.left - box.width / 2;
        scroller.scrollTop += point.top + point.height / 2 - box.top - box.height / 2;
      }
    }
  }
  const heapScroll = host.querySelector?.('.rr3341-heap-scroll');
  if (heapScroll) heapScroll.scrollLeft = Math.max(0, (heapScroll.scrollWidth - heapScroll.clientWidth) / 2);
  const stop = () => { if (typeof stopPlay === 'function') stopPlay(); };
  host.querySelectorAll?.('button').forEach(button => button.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
  }));
  host.querySelectorAll?.('[data-rr3341-stage]').forEach(button => button.addEventListener('click', () => {
    stop(); host.dataset.rr3341SelectedStage = button.dataset.rr3341Stage;
    renderLastRoom3341Pictures(step);
    host.querySelector(`[data-rr3341-stage="${button.dataset.rr3341Stage}"]`)?.focus({ preventScroll: true });
  }));
  host.querySelectorAll?.('[data-rr3341-leg]').forEach(button => button.addEventListener('click', () => {
    stop(); host.dataset.rr3341SelectedLeg = button.dataset.rr3341Leg; host.dataset.rr3341SelectedStage = 'wait';
    renderLastRoom3341Pictures(step);
    host.querySelector(`[data-rr3341-leg="${button.dataset.rr3341Leg}"]`)?.focus({ preventScroll: true });
  }));
  host.querySelectorAll?.('[data-rr3341-preset]').forEach(button => button.addEventListener('click', async () => {
    stop(); $('arrInput').value = JSON.stringify(presets[Number(button.dataset.rr3341Preset)].grid); await runViz();
  }));
  host.querySelectorAll?.('[data-rr3341-jump]').forEach(button => button.addEventListener('click', () => {
    stop(); const index = steps.findIndex((s, i) => i > stepIndex && s.timeRoomView?.event === button.dataset.rr3341Jump);
    stepIndex = index >= 0 ? index : steps.length - 1; renderStep();
  }));
}
