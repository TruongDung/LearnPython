'use strict';
let sub1504Selection = { step: null, key: null };

function renderAllOnes1504View(step) {
  const v = step.allOnes1504View, host = $('treeView');
  const t = (vi, en) => lang === 'vi' ? vi : en, esc = value => escapeHtml(String(value));
  if (sub1504Selection.step !== step) sub1504Selection = { step, key: null };
  const rectangle = v.rectangles.find(rect => rect.key === sub1504Selection.key)
    ?? v.rectangles.reduce((largest, rect) => !largest || rect.height * rect.width > largest.height * largest.width ? rect : largest, null);
  const inRectangle = (r, c) => rectangle && r >= rectangle.top && r <= rectangle.bottom && c >= rectangle.left && c <= rectangle.right;
  const focus = v.focus;
  const rows = v.mat.map((row, r) => `<small class="s1504-index">${r}</small>${row.map((value, c) => {
    const active = focus?.[0] === r && focus?.[1] === c, inside = inRectangle(r, c);
    const heightColumn = focus && c === focus[1] && v.updatedColumns.includes(c) && r <= focus[0] && r > focus[0] - v.heights[c];
    const contribution = v.contributions[r][c];
    return `<button type="button" data-s1504-cell="${r},${c}" data-value="${value}" class="s1504-cell${value ? ' one' : ' zero'}${active ? ' current' : ''}${inside ? ' inside' : ''}${heightColumn ? ' height-column' : ''}" title="(${r}, ${c}) · ${contribution === null ? t('Chưa cộng', 'Not counted yet') : '+' + contribution}" aria-label="(${r}, ${c}) = ${value}${contribution === null ? '' : ' · +' + contribution}"><b>${value}</b>${contribution === null ? '' : `<small>+${contribution}</small>`}${active ? '<i class="s1504-anchor"></i>' : ''}</button>`;
  }).join('')}`).join('');
  const matrix = `<section class="s1504-card"><header><b>mat</b><small>${focus ? `(${focus.join(', ')})` : 'r, c'}</small></header><div class="s1504-matrix" style="--cols:${v.cols}"><small></small>${Array.from({ length: v.cols }, (_, c) => `<small class="s1504-index">${c}</small>`).join('')}${rows}</div><div class="s1504-caption">${t('Bấm ô để tới bước cộng tại góc đó.', 'Select a cell to jump to its count.')}</div></section>`;
  const histogram = `<section class="s1504-card"><header><b>heights</b><small>r = ${v.heightRow ?? '—'}</small></header><div class="s1504-histogram" style="--cols:${v.cols}">${Array.from({ length: v.cols }, (_, c) => {
    const height = v.heights?.[c] ?? 0, updated = v.updatedColumns.includes(c), selected = focus?.[1] === c;
    return `<div class="s1504-column${updated ? '' : ' waiting'}${selected ? ' current' : ''}" data-height-column="${c}" data-height="${v.heights?.[c] ?? ''}"><code>${v.heights ? height : '—'}</code><div class="s1504-units">${Array.from({ length: v.rows }, (_, index) => {
      const level = v.rows - index;
      return `<i class="${level <= height ? 'filled' : ''}${rectangle && c >= rectangle.left && c <= rectangle.right && level <= rectangle.height ? ' inside' : ''}"></i>`;
    }).join('')}</div><small>${c}</small></div>`;
  }).join('')}</div><div class="s1504-caption">${t('Mờ: chưa cập nhật ở hàng này.', 'Dim: not updated in this row yet.')}</div></section>`;
  const miniature = (height, width, className = '') => `<span class="s1504-mini ${className}" style="--h:${height};--w:${width}" aria-hidden="true">${height ? '' : '∅'}</span>`;
  const stack = `<section class="s1504-card s1504-stack-card"><header><b>stack · (h, w)</b><small>${t('w = số cạnh trái', 'w = left-edge choices')}</small></header><div class="s1504-stack">${v.groups.map((group, index) => `<div class="s1504-group${index === v.groups.length - 1 ? ' top' : ''}" data-s1504-group="${group.index}" data-product="${group.contribution}"><small>${index === v.groups.length - 1 ? 'TOP' : `l = ${group.from}…${group.to}`}</small>${miniature(group.height, group.width)}<code>${group.height} × ${group.width}</code><b>${group.contribution}</b></div>`).join('') || `<span class="tp-muted">${v.stackInitialized ? '∅' : '—'}</span>`}${v.popped ? `<div class="s1504-group popped"><small>POP</small>${miniature(v.popped.height, v.popped.width)}<code>${v.popped.height} × ${v.popped.width}</code><b>−${v.popped.contribution}</b></div>` : ''}</div></section>`;
  let operation;
  const change = v.transition, comp = v.comparison;
  if (change) operation = `<code>${change.name}</code><div class="s1504-equation"><span>${change.before}</span>${change.reset ? '<b>→</b>' : `<b>${change.amount < 0 ? '−' : '+'}</b><span>${Math.abs(change.amount)}</span><b>=</b>`}<strong>${change.after}</strong></div>`;
  else if (comp) operation = comp.top === null ? '<code>stack = ∅</code><strong class="tp-muted">False</strong>' : `<code>TOP.h = ${comp.left}</code><b>≥</b><code>heights[c] = ${comp.right}</code><strong class="${comp.pass ? 'tp-good' : 's1504-false'}">${comp.pass ? 'True ✓' : 'False ×'}</strong>`;
  else if (v.line === 15) operation = `<b>POP (${v.popped.height}, ${v.popped.width})</b><span>${t('chờ trừ', 'pending subtraction')} ${v.popped.contribution}</span><code>row_sum = ${v.rowSum}</code>`;
  else if (v.line === 18) operation = `<b>PUSH (${v.heights[focus[1]]}, ${v.width})</b><span>${t('chờ cộng', 'pending addition')} ${v.heights[focus[1]] * v.width}</span><code>row_sum = ${v.rowSum}</code>`;
  else operation = `<code>row_sum <b>${v.rowSum ?? '—'}</b></code><code>width <b>${v.width ?? '—'}</b></code><code>answer <b>${v.answer ?? '—'}</b></code>`;
  const gallery = `<section class="s1504-card s1504-gallery-card"><header><b>row_sum = ${v.ready ? v.rowSum : '…'}</b><small>${v.ready ? v.counted ? t('Đã cộng', 'Counted') : t('Sắp cộng', 'Ready to add') : t('Đang xử lý stack', 'Processing the stack')}</small></header><div class="s1504-gallery" data-rectangle-count="${v.ready ? v.rectangles.length : ''}">${v.ready ? v.rectangles.map(rect => `<button type="button" data-s1504-rectangle="${rect.key}" class="${rect.key === rectangle?.key ? 'selected' : ''}" aria-pressed="${rect.key === rectangle?.key}" aria-label="${rect.height} × ${rect.width} · (${rect.top},${rect.left})…(${rect.bottom},${rect.right})">${miniature(rect.height, rect.width)}<small>${rect.height} × ${rect.width}</small></button>`).join('') || '<span class="tp-muted">∅ · +0</span>' : `<span class="s1504-preview">${miniature(1, 1)}${miniature(2, 1)}${miniature(2, 2)}<span>…</span></span>`}</div><div class="s1504-caption">${focus ? `${t('Chung góc phải dưới', 'Same bottom-right corner')} (${focus.join(', ')}). ` : ''}${t('Bấm hình để tô lên mat và heights.', 'Select a rectangle to highlight mat and heights.')}</div></section>`;
  const presets = [
    ['1,0,1;1,1,0;1,1,0', t('13 hình', '13 rectangles')],
    ['0,1,1,0;0,1,1,1;1,1,1,0', t('Gộp nhiều nhóm', 'Merge buckets')],
    ['1,1;1,1', t('Toàn số 1', 'All ones')],
    ['0,0;0,0', t('Toàn số 0', 'All zeroes')],
  ];
  const nextEvent = line => steps.findIndex((frame, index) => index > stepIndex && frame.allOnes1504View?.line === line);
  const disabled = action => action === 'reset' ? stepIndex === 0 : action === 'pop' ? nextEvent(15) < 0 : action === 'count' ? nextEvent(20) < 0 : stepIndex >= steps.length - 1;
  host.innerHTML = `<section class="tp-viz s1504-viz" aria-label="1504 · Count all-one submatrices" data-source-line="${v.line}"><header class="tp-head"><div><small>1504 · ALL-ONE RECTANGLES</small><h2>${t('Một góc, nhiều hình', 'One corner, many rectangles')}</h2></div><div class="tp-total"><strong>${v.answer ?? '—'}</strong><span>answer</span></div></header>
    <div class="s1504-pictures">${matrix}${histogram}</div>${stack}<div class="s1504-operation">${operation}</div>${gallery}
    <div class="tp-debug"><header><b>${t('Dòng', 'Line')} ${v.line}</b><span>numSubmat</span></header><div><code>${esc(v.source)}</code></div></div>
    <nav class="tp-actions">${[['reset', t('Làm lại', 'Restart')], ['line', t('Dòng tiếp', 'Next line') + ' <kbd>F10</kbd>'], ['pop', 'POP'], ['count', t('Góc tiếp', 'Next corner')], ['last', t('Kết quả', 'Result')]].map(([action, label]) => `<button type="button" data-s1504-nav="${action}"${disabled(action) ? ' disabled' : ''}>${label}</button>`).join('')}</nav>
    <nav class="tp-presets">${presets.map((preset, index) => `<button type="button" data-s1504-preset="${index}">${preset[1]}</button>`).join('')}</nav>
  </section>`;
  const go = index => { stopPlay(); stepIndex = index; renderStep(); };
  host.querySelectorAll('[data-s1504-nav]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.s1504Nav;
    if (action === 'reset') return go(0);
    if (action === 'last') return go(steps.length - 1);
    if (action === 'line') return go(Math.min(steps.length - 1, stepIndex + 1));
    const index = steps.findIndex((frame, index) => index > stepIndex && (action === 'pop' ? frame.allOnes1504View?.line === 15 : frame.allOnes1504View?.line === 20));
    if (index >= 0) go(index);
  }));
  host.querySelectorAll('[data-s1504-cell]').forEach(button => button.addEventListener('click', () => {
    const cell = button.dataset.s1504Cell;
    const index = steps.findIndex(frame => frame.allOnes1504View?.line === 20 && frame.allOnes1504View.focus?.join(',') === cell);
    if (index >= 0) go(index);
  }));
  host.querySelectorAll('[data-s1504-rectangle]').forEach(button => button.addEventListener('click', () => { stopPlay(); sub1504Selection.key = button.dataset.s1504Rectangle; renderAllOnes1504View(step); }));
  host.querySelectorAll('[data-s1504-preset]').forEach(button => button.addEventListener('click', () => { stopPlay(); $('arrInput').value = presets[Number(button.dataset.s1504Preset)][0]; runViz(); }));
}
