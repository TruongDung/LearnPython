'use strict';
function lr146Text(vi, en) { return typeof lang !== 'undefined' && lang === 'vi' ? vi : en; }
function lr146Escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function lr146Entries(items) {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).flatMap(item => {
    if (!item || !Number.isFinite(item.key) || !Number.isFinite(item.value) || seen.has(item.key)) return [];
    seen.add(item.key); return [{ key: item.key, value: item.value }];
  });
}
function lr146View(step) {
  if (step?.lruCacheView) return step.lruCacheView;
  const v = step?.linkedDesignView;
  if (!v || v.id !== 146) return null;
  const byId = new Map(v.nodes.map(node => [node.id, node]));
  const record = id => { const fields = byId.get(id)?.fields; return fields && Number.isFinite(fields.key) && Number.isFinite(fields.value) ? { key: fields.key, value: fields.value } : null; };
  const order = v.items.map(record).filter(Boolean), entries = v.cache.map(([key, node]) => { const fields = byId.get(node.id)?.fields; return fields && Number.isFinite(fields.value) ? { key, value: fields.value } : null; }).filter(Boolean);
  const operations = v.operations.map(op => ({ type: op.name, key: op.args[0], ...(op.name === 'put' ? { value: op.args[1] } : {}) }));
  const activeOpIndex = v.operationIndex >= 0 ? v.operationIndex : null, command = activeOpIndex === null ? null : operations[activeOpIndex];
  const complete = activeOpIndex !== null && v.outputs.length > activeOpIndex;
  const stable = v.sentinels.length === 2 && v.chain.at(-1) === v.sentinels[1] && !v.cycle && v.items.length === v.cache.length && v.cache.every(([, node]) => v.items.includes(node.id)) && v.chain.slice(1).every((id, i) => byId.get(id)?.fields.prev?.id === v.chain[i]);
  const reference = value => value && typeof value === 'object' ? value.id : null;
  const name = id => id === null ? 'None' : id === v.sentinels[0] ? 'LEFT' : id === v.sentinels[1] ? 'RIGHT' : typeof id === 'string' ? 'N' + id.split(':').at(-1) : '—';
  const nodeId = v.bindings.node || reference(v.locals.lru), node = record(nodeId);
  const evicted = reference(v.locals.lru) ? record(reference(v.locals.lru)) : null;
  const detached = entries.find(entry => node && entry.key === node.key && !order.some(item => item.key === entry.key)) || entries.find(entry => !order.some(item => item.key === entry.key));
  const transient = evicted && !entries.some(item => item.key === evicted.key) ? { ...evicted, status: 'evicted' } : detached ? { ...detached, status: 'detached' } : null;
  const line = v.source.line;
  let phase = activeOpIndex === null ? v.initialized ? 'ready' : 'initializing' : complete ? command.type === 'get' ? entries.some(entry => entry.key === command.key) ? 'hit' : 'miss' : transient?.status === 'evicted' ? 'evict' : 'insert' : v.scope === 'remove' ? line === 18 ? 'remove-forward' : 'remove-backward' : v.scope === 'insert' ? 'insert-link' : line === 42 ? 'select-lru' : line === 39 ? 'new-node' : line === 29 || line === 31 ? 'lookup-hit' : 'lookup';
  if (transient?.status === 'evicted') phase = 'evict';
  const write = v.change?.kind === 'link' ? v.change : null;
  return { capacity: v.capacity ?? v.constructorArgs[0], operations, activeOpIndex, completedOps: v.outputs.length, results: v.outputs, order, entries, transient, phase, stable,
    activeKey: node?.key ?? (v.scope === 'put' && line >= 42 ? evicted?.key : command?.key) ?? null,
    pointerAction: write ? `${name(write.node)}.${write.field} → ${name(write.after)}` : v.source.text,
    pointerProgress: v.writes.slice(-4).map(item => `${name(item.node)}.${item.field} → ${name(item.after)}`),
    prevLabel: name(reference(v.locals.prev)), nodeLabel: name(nodeId), nextLabel: nodeId ? name(reference(byId.get(nodeId)?.fields.next)) : '—',
    nativeWrite: write, source: v.source, history: v.history };
}
function lr146Normalize(step) {
  const raw = lr146View(step) || {}, operations = Array.isArray(raw.operations) ? raw.operations.filter(op => op && ['put', 'get'].includes(op.type) && Number.isFinite(op.key) && (op.type === 'get' || Number.isFinite(op.value))).map(op => ({ type: op.type, key: op.key, ...(op.type === 'put' ? { value: op.value } : {}) })) : [];
  const activeOpIndex = Number.isInteger(raw.activeOpIndex) && raw.activeOpIndex >= 0 && raw.activeOpIndex < operations.length ? raw.activeOpIndex : null;
  const results = Array.isArray(raw.results) ? raw.results.map(value => value === null || Number.isFinite(value) ? value : null) : [];
  const transient = raw.transient && Number.isFinite(raw.transient.key) && Number.isFinite(raw.transient.value) ? { key: raw.transient.key, value: raw.transient.value, evicted: raw.transient.status === 'evicted' } : null;
  return { operations, activeOpIndex, results, completedOps: Math.max(0, Math.min(operations.length, Number.isInteger(raw.completedOps) ? raw.completedOps : 0)),
    capacity: Number.isSafeInteger(raw.capacity) && raw.capacity >= 1 ? raw.capacity : 1, order: lr146Entries(raw.order), entries: lr146Entries(raw.entries),
    transient, activeKey: Number.isFinite(raw.activeKey) ? raw.activeKey : null, phase: typeof raw.phase === 'string' ? raw.phase : 'idle', pointerAction: typeof raw.pointerAction === 'string' ? raw.pointerAction : '', pointerProgress: Array.isArray(raw.pointerProgress) ? raw.pointerProgress.filter(value => typeof value === 'string') : [],
    prevLabel: typeof raw.prevLabel === 'string' ? raw.prevLabel : '', nodeLabel: typeof raw.nodeLabel === 'string' ? raw.nodeLabel : '', nextLabel: typeof raw.nextLabel === 'string' ? raw.nextLabel : '',
    stable: raw.stable !== false, nativeWrite: raw.nativeWrite || null, final: Boolean(step?.final), line: Array.isArray(step?.codeLines) ? step.codeLines.find(line => Number.isInteger(line) && line > 0) ?? null : null };
}
function lr146CompletedIndex(timeline, ordinal) {
  let target = -1;
  timeline.forEach((step, i) => {
    const v = lr146View(step);
    if (v && (ordinal === 0 ? v.phase === 'ready' : v.activeOpIndex === ordinal - 1 && v.completedOps >= ordinal)) target = i;
  }); return target;
}
function lr146OperationState(v, timeline = []) {
  if (v.activeOpIndex === null) return null;
  const entry = timeline.map(lr146View).find(view => view?.activeOpIndex === v.activeOpIndex);
  const command = v.operations[v.activeOpIndex], before = entry ? lr146Entries(entry.order) : null, beforeEntries = entry ? lr146Entries(entry.entries) : null;
  const old = beforeEntries?.find(item => item.key === command.key), done = v.completedOps > v.activeOpIndex;
  const removed = done && before ? before.filter(item => !v.entries.some(current => current.key === item.key)) : [];
  return { command, before, old: old || null, hit: command.type === 'get' ? old ? true : beforeEntries ? false : null : null, done, removed };
}
function lr146Row(entries, selected, compact = false, evicting = null, stable = true) {
  return `<div class="lr146-scroll"><div class="lr146-row ${compact ? 'compact' : ''}">${entries.map((entry, i) => `<${compact ? 'span' : 'button type="button"'} class="lr146-node ${entry.key === selected ? 'selected' : ''} ${entry.key === evicting ? 'evicting' : ''} ${stable && i === entries.length - 1 ? 'mru' : ''}" ${compact ? '' : `data-lru146-key="${entry.key}"`} data-lru146-node="${entry.key}" data-value="${entry.value}"><small>${!stable ? i + 1 : i === 0 && i === entries.length - 1 ? 'LRU / MRU' : i === 0 ? 'LRU' : i === entries.length - 1 ? 'MRU' : i + 1}</small><b>${entry.key}</b><span>${entry.value}</span></${compact ? 'span' : 'button'}>`).join('') || '<span class="lr146-empty">∅</span>'}</div></div>`;
}
function renderLruCache146Pictures(step) {
  const host = $('treeView'); if (!host) return;
  const v = lr146Normalize(step), t = lr146Text, esc = lr146Escape, timeline = typeof steps === 'undefined' ? [] : steps;
  const operation = lr146OperationState(v, timeline), command = operation?.command;
  const frame = JSON.stringify([v.capacity, v.operations, v.activeOpIndex, v.phase, v.line, v.pointerAction, v.completedOps, v.final]);
  const same = host.dataset?.lr146FrameState === frame, open = host.querySelector?.('.lr146-details')?.open || false;
  const selected = same && host.dataset?.lr146SelectedState !== '' ? Number(host.dataset.lr146SelectedState) : v.activeKey ?? v.transient?.key ?? command?.key ?? v.order.at(-1)?.key ?? null;
  if (host.dataset) { host.dataset.lr146FrameState = frame; host.dataset.lr146SelectedState = selected === null ? '' : String(selected); }
  const entry = v.entries.find(item => item.key === selected), linked = v.order.some(item => item.key === selected);
  const card = (label, content, cls = '') => `<section class="lr146-card ${cls}"><header>${label}</header>${content}</section>`;
  const ordinal = v.activeOpIndex === null ? v.final ? v.operations.length : 0 : v.activeOpIndex + 1;
  const done = command ? operation.done : v.phase === 'ready' || v.final;
  const over = v.entries.length > v.capacity, pending = v.transient && !v.transient.evicted && !v.order.some(item => item.key === v.transient.key);
  const removed = v.transient?.evicted ? [v.transient] : operation?.removed || [];
  const heading = v.final && !command ? t('Thứ tự cache cuối cùng', 'Final cache order') : command ? command.type === 'get' ? `get(${command.key})` : `put(${command.key}, ${command.value})` : `LRUCache(${v.capacity})`;
  const outcome = command?.type === 'get' ? operation.hit === true ? `<div class="lr146-outcome hit" data-lru146-hit="true"><b>🔑 ${command.key}</b><i>→ MRU</i><span>value <strong>${operation.old.value}</strong></span><small>${done ? '✓ HIT' : t('tìm thấy', 'found')}</small></div>` : operation.hit === false ? `<div class="lr146-outcome miss" data-lru146-hit="false"><b>🔑 ${command.key}</b><i>×</i><strong>−1</strong><small>MISS · ${t('giữ nguyên thứ tự', 'keep the order')}</small></div>` : '' : command ? `<div class="lr146-outcome hit"><b>${operation.old ? '↻' : '＋'} ${command.key}:${command.value}</b><i>→ MRU</i><small>${done ? '✓' : t('đích', 'target')}</small></div>` : '';
  let body = outcome;
  body += card(`<b>${t('Đang giữ', 'Stored')} ${v.entries.length} / ${v.capacity}</b><small>${over ? '× ' + t('vượt chỗ → bỏ LRU', 'over capacity → evict LRU') : '✓ capacity'}</small>`, `<div class="lr146-capacity ${over ? 'over' : ''}" data-lru146-size="${v.entries.length}" data-lru146-capacity="${v.capacity}">${Array.from({ length: Math.min(16, Math.max(v.capacity, v.entries.length)) }, (_, i) => `<i class="${i < v.entries.length ? 'filled' : ''} ${i >= v.capacity ? 'extra' : ''}"></i>`).join('')}${Math.max(v.capacity, v.entries.length) > 16 ? '<small>…</small>' : ''}</div>`);
  if (operation?.before) body += card(`<b>${t('Trước thao tác', 'Before')}</b>`, lr146Row(operation.before, command.key, true), 'lr146-before');
  body += card(`<b>${v.stable ? 'LRU → MRU' : t('next hiện tại · đang nối', 'Current next links · rewiring')}</b><small>${v.stable ? t('Lâu chưa dùng → vừa dùng', 'Oldest use → most recent use') : '⏳'}</small>`, lr146Row(v.order, selected, false, v.phase === 'select-lru' ? v.order[0]?.key : null, v.stable), 'lr146-current');
  if (pending) body += `<div class="lr146-detached"><span>⇢</span><b>${v.transient.key}:${v.transient.value}</b><small>${v.phase.startsWith('remove') ? t('đã tháo, còn trong map', 'detached; still in the map') : t('đang nối vào MRU', 'linking at MRU')}</small><span>⇢</span></div>`;
  if (removed.length) body += `<div class="lr146-removed">${removed.map(item => `<span data-lru146-evicted="${item.key}"><small>LRU ×</small><s>${item.key}:${item.value}</s></span>`).join('')}<i>→</i><b>${t('ra khỏi cache', 'out of the cache')}</b></div>`;
  if (selected !== null) body += card(`<b>🔑 ${selected}</b><small>${t('Bấm key để tra map', 'Choose a key to inspect the map')}</small>`, `<div class="lr146-map-route" data-lru146-route="${selected}"><b>${selected}</b><i>→</i>${entry ? `<span><small>Node</small><strong>${entry.key}:${entry.value}</strong><small>${linked ? t('trong chuỗi', 'in the list') : t('ngoài chuỗi', 'outside the list')}</small></span>` : '<strong>∅</strong>'}</div>`);
  const complete = lr146CompletedIndex(timeline, ordinal), finalIndex = timeline.findIndex(s => s.final), currentIndex = typeof stepIndex === 'undefined' ? -1 : stepIndex;
  const next = v.final ? -1 : !done && complete > currentIndex ? complete : ordinal < v.operations.length ? lr146CompletedIndex(timeline, ordinal + 1) : finalIndex;
  const previous = v.final && !command ? lr146CompletedIndex(timeline, v.operations.length) : ordinal ? lr146CompletedIndex(timeline, ordinal - 1) : -1;
  body += `<nav class="lr146-play"><button type="button" data-lru146-go="${previous}" data-lru146-control="previous" ${previous < 0 ? 'disabled' : ''}>←</button><button type="button" data-lru146-go="${next}" data-lru146-control="next" ${next < 0 ? 'disabled' : ''}>${!done ? t('Xong thao tác', 'Finish operation') : t('Thao tác kế', 'Next operation')} →</button></nav>`;
  body += card(t('Bấm một thao tác để xem kết quả', 'Choose an operation to see its result'), `<div class="lr146-scroll"><div class="lr146-operations"><button type="button" data-lru146-operation="0" class="${!ordinal ? 'selected' : ''}">∅</button>${v.operations.map((op, i) => `<button type="button" data-lru146-operation="${i + 1}" class="${ordinal === i + 1 ? 'selected' : ''}"><small>${i + 1}</small><b>${op.type} ${op.key}${op.type === 'put' ? ':' + op.value : ''}</b>${i < v.completedOps ? `<em>${op.type === 'put' ? '✓' : v.results[i]}</em>` : ''}</button>`).join('')}</div></div>`);
  body += `<details class="lr146-details" ${open ? 'open' : ''}><summary>${t('Pointer · hash map · chi tiết', 'Pointers · hash maps · details')}</summary>${v.pointerAction ? `<div class="lr146-pointer-nodes"><span>${esc(v.prevLabel || 'LEFT')}</span><i>·</i><b>${esc(v.nodeLabel || '∅')}</b><i>·</i><span>${esc(v.nextLabel || 'RIGHT')}</span></div><code ${v.nativeWrite ? `data-lru146-write-node="${esc(v.nativeWrite.node)}" data-field="${esc(v.nativeWrite.field)}" data-target="${esc(v.nativeWrite.after || '')}"` : ''}>${esc(v.pointerAction)}</code><small>${t('Các pointer vừa ghi', 'Recent pointer writes')}</small><div class="lr146-pointer-progress">${v.pointerProgress.map(item => `<span>✓ ${esc(item)}</span>`).join('')}</div>` : ''}<div class="lr146-map-entries">${v.entries.map(item => `<span data-lru146-map-key="${item.key}"><b>${item.key}</b> → ${item.value} ${v.order.some(node => node.key === item.key) ? '✓' : '⇢'}</span>`).join('') || '<i>{ }</i>'}</div></details>`;
  const phaseLabel = v.pointerAction || { 'lookup-hit': t('Tra được key', 'Key found'), 'lookup-miss': t('Không có key', 'Key missing'), hit: t('Đưa key vào MRU rồi trả value', 'Move to MRU and return its value'), miss: 'return -1', evict: t('Xóa LRU khỏi map', 'Delete LRU from the map'), update: t('Đã cập nhật value và thứ tự', 'Value and order updated') }[v.phase] || '';
  const presets = [
    { input: 'put 1 1 | put 2 2 | get 1 | put 3 3 | get 2 | put 4 4 | get 1 | get 3 | get 4', capacity: 2, label: t('Ví dụ', 'Example') },
    { input: 'put 1 10 | put 2 20 | put 1 99 | get 1 | put 3 30 | get 2', capacity: 2, label: t('Cập nhật', 'Update') },
    { input: 'get 1 | put 1 0 | get 1 | get 2', capacity: 1, label: t('Miss / value 0', 'Miss / value 0') },
    { input: 'put 1 1 | put 2 2 | get 1 | get 2 | put 3 3 | get 2 | get 3', capacity: 1, label: 'capacity = 1' },
  ];
  host.innerHTML = `<section class="lr146-viz"><header class="lr146-heading"><strong>${heading}</strong><small>#146 · ${ordinal}/${v.operations.length}</small></header>${body}<div class="lr146-source"><b>L${v.line ?? '—'}</b><small>${esc(phaseLabel)}</small></div><nav class="lr146-examples">${presets.map((preset, i) => `<button type="button" data-lru146-example="${i}">${preset.label}</button>`).join('')}</nav></section>`;
  const stop = () => { if (typeof stopPlay === 'function') stopPlay(); };
  host.querySelectorAll?.('button,summary').forEach(button => button.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') event.stopPropagation(); }));
  const go = (index, selector) => { if (index < 0 || !timeline[index]) return; stop(); stepIndex = index; renderStep(); (host.querySelector(`${selector}:not(:disabled)`) || host.querySelector('.lr146-operations .selected'))?.focus({ preventScroll: true }); };
  host.querySelectorAll?.('[data-lru146-go]').forEach(button => button.addEventListener('click', () => go(Number(button.dataset.lru146Go), `[data-lru146-control="${button.dataset.lru146Control}"]`)));
  host.querySelectorAll?.('[data-lru146-operation]').forEach(button => button.addEventListener('click', () => go(lr146CompletedIndex(timeline, Number(button.dataset.lru146Operation)), `[data-lru146-operation="${button.dataset.lru146Operation}"]`)));
  host.querySelectorAll?.('[data-lru146-key]').forEach(button => button.addEventListener('click', () => { stop(); host.dataset.lr146SelectedState = button.dataset.lru146Key; renderLruCache146Pictures(step); host.querySelector(`[data-lru146-key="${button.dataset.lru146Key}"]`)?.focus({ preventScroll: true }); }));
  host.querySelectorAll?.('[data-lru146-example]').forEach(button => button.addEventListener('click', async () => { stop(); const preset = presets[Number(button.dataset.lru146Example)]; $('arrInput').value = preset.input; $('param-capacity').value = preset.capacity; await runViz(); }));
  const ops = host.querySelector?.('.lr146-operations'), active = ops?.querySelector('.selected');
  if (ops && active) { const a = ops.parentElement.getBoundingClientRect(), b = active.getBoundingClientRect(); ops.parentElement.scrollLeft += b.left - a.left - (a.width - b.width) / 2; }
  const track = host.querySelector?.('.lr146-current .lr146-scroll'), focus = track?.querySelector('.selected, .evicting');
  if (track && focus) { const a = track.getBoundingClientRect(), b = focus.getBoundingClientRect(); track.scrollLeft += b.left - a.left - (a.width - b.width) / 2; }
}
