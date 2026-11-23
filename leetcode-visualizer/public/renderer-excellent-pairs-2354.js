'use strict';
let ep2354Selection = { run: null, pair: null };

function renderExcellentPairs2354View(step) {
  const v = step.excellentPairs2354View, host = $('treeView');
  const t = (vi, en) => lang === 'vi' ? vi : en, esc = value => escapeHtml(String(value));
  const pc = value => value.toString(2).replaceAll('0', '').length;
  if (ep2354Selection.run !== steps) ep2354Selection = { run: steps, pair: null };
  const pairPhase = ['inner', 'check', 'add'].includes(v.phase);
  const groupBits = [...new Set(v.unique.map(pc))].sort((a, b) => a - b);
  const groupSize = bits => v.groups.find(group => group.bits === bits)?.amount ?? 0;
  let autoPair = [v.unique.at(-1), v.unique[0]];
  if (pairPhase) autoPair = [v.unique.find(x => pc(x) === v.a), v.unique.find(x => pc(x) === v.b)];
  else if (v.index !== null) autoPair = [v.x, v.unique.find(x => x !== v.x) ?? v.x];
  const manual = ep2354Selection.pair !== null, [x, y] = ep2354Selection.pair ?? autoPair;
  const width = Math.max(x, y).toString(2).length, or = x | y, and = x & y;
  const bitRow = (label, value, kind) => `<div class="ep2354-bit-row ${kind}"><code>${label}</code><span class="ep2354-bits">${value.toString(2).padStart(width, '0').split('').map((bit, i) => `<b class="${bit === '1' ? 'one' : 'zero'}" title="2^${width - i - 1}">${bit}</b>`).join('')}</span><strong>${pc(value)}</strong></div>`;
  const proof = `<section class="ep2354-proof"><header><b>${t('Soi bit', 'Inspect bits')} · (${x}, ${y})</b><small>popcount</small></header><div class="ep2354-bit-scroll">${bitRow('x', x, 'x')}${bitRow('y', y, 'y')}${bitRow('x | y', or, 'or')}${bitRow('x & y', and, 'and')}</div><div class="ep2354-identity"><span>${pc(or)} + ${pc(and)}</span><b>=</b><span>${pc(x)} + ${pc(y)}</span><b>= ${pc(x) + pc(y)}</b></div><div class="ep2354-proof-test ${pc(x) + pc(y) >= v.k ? 'yes' : 'no'}">${pc(x) + pc(y)} ≥ k (${v.k}) <b>${pc(x) + pc(y) >= v.k ? '✓' : '×'}</b></div>${manual ? `<button type="button" data-ep2354-follow>${t('Theo code', 'Follow code')}</button>` : ''}</section>`;
  const cells = v.unique.flatMap(first => [`<strong class="ep2354-axis" title="x = ${first}">${first}</strong>`, ...v.unique.map(second => {
    const a = pc(first), b = pc(second), test = v.tests.find(test => test.a === a && test.b === b);
    const state = test?.applied ? test.accepted ? 'yes' : 'no' : test ? 'pending' : 'waiting';
    const active = pairPhase && a === v.a && b === v.b;
    return `<button type="button" class="ep2354-cell ${state}${active ? ' active' : ''}${first === x && second === y ? ' selected' : ''}" data-ep2354-pair="${first},${second}" title="(${first}, ${second}) · ${a} + ${b} ${a + b >= v.k ? '≥' : '<'} ${v.k}" aria-label="(${first}, ${second}) · ${state}" aria-pressed="${first === x && second === y}">${state === 'yes' ? '✓' : state === 'no' ? '×' : state === 'pending' ? '…' : '·'}</button>`;
  })]).join('');
  const matrix = `<section class="ep2354-matrix"><header><b>${t('Cặp có thứ tự', 'Ordered pairs')}</b><small>(x, y)</small></header><div class="ep2354-matrix-scroll"><div class="ep2354-grid" style="--n:${v.unique.length}"><small class="ep2354-axis">x↓ y→</small>${v.unique.map(value => `<strong class="ep2354-axis" title="y = ${value}">${value}</strong>`).join('')}${cells}</div></div><div class="ep2354-legend"><span>· ${t('Chưa xét', 'Waiting')}</span><span class="yes">✓ +1</span><span class="no">× +0</span></div><small class="tp-muted">${t('Bấm một ô để soi OR / AND. Đường chéo (x, x) vẫn tính.', 'Select a cell to inspect OR / AND. Diagonal (x, x) pairs count too.')}</small></section>`;
  const groups = groupBits.map(bits => {
    const members = v.unique.filter(value => pc(value) === bits), amount = groupSize(bits);
    const activeA = pairPhase && bits === v.a, activeB = pairPhase && bits === v.b;
    return `<div class="ep2354-bucket${activeA ? ' bucket-a' : ''}${activeB ? ' bucket-b' : ''}${['bits', 'bucket'].includes(v.phase) && v.bits === bits ? ' counting' : ''}"><header><code>${bits} <small>bit 1</small></code><b>×${amount}</b></header><div class="ep2354-members">${members.map(value => `<span class="${v.unique.indexOf(value) < v.processed ? 'counted' : ''}${v.index !== null && value === v.x ? ' reading' : ''}">${value}</span>`).join('')}</div>${activeA || activeB ? `<small class="ep2354-bucket-label">${[activeA ? 'a' : '', activeB ? 'b' : ''].filter(Boolean).join(' = ')}</small>` : ''}</div>`;
  }).join('');
  const seen = new Set();
  const input = v.nums.map(value => { const duplicate = seen.has(value); seen.add(value); return `<span class="${duplicate ? 'duplicate' : ''}" title="${duplicate ? t('Giá trị trùng', 'Duplicate value') : 'unique'}">${value}${duplicate ? '<small>×</small>' : ''}</span>`; }).join('');
  const d = v.decision;
  let operation = `<span class="tp-muted">${t('Nhóm theo số bit 1', 'Group by set-bit count')}</span><code>${v.processed} / ${v.unique.length}</code>`;
  if (pairPhase) operation = `<div class="ep2354-comparison"><code class="a">a = ${v.a}</code><b>+</b><code class="b">b = ${v.b}</code><b>≥</b><code>k = ${v.k}</code>${d ? `<strong class="${d.accepted ? 'yes' : 'no'}">${d.accepted ? '✓' : '×'}</strong>` : '<strong>?</strong>'}</div><div class="ep2354-product">${d ? d.accepted ? `<code>${groupSize(v.a)}</code><b>×</b><code>${groupSize(v.b)}</code><b>= +${d.ways}</b><span>${d.after === null ? t('chờ cộng', 'pending') : `${d.before} → ${d.after}`}</span>` : `<span class="no">+0</span>` : `<span class="tp-muted">${t('Sắp kiểm tra hai nhóm', 'Ready to test the two buckets')}</span>`}</div>`;
  else if (v.final || ['inner-end', 'outer-end'].includes(v.phase)) operation = `<span>${t('Đã đếm', 'Counted')}</span><strong class="yes">${v.answer}</strong><small>${t('cặp giá trị khác nhau', 'distinct value pairs')}</small>`;
  const stage = ['dedupe'].includes(v.phase) ? 0 : ['allocate', 'read', 'bits', 'bucket', 'values-end'].includes(v.phase) ? 1 : 2;
  const presets = [
    { nums: '1,2,3,1', k: 3, label: t('Có số trùng', 'Duplicates') },
    { nums: '5,1,1', k: 10, label: t('Không có cặp', 'No pairs') },
    { nums: '7,7,7', k: 6, label: '(x, x)' },
    { nums: '1,2,4,3,5,6,7', k: 4, label: t('Nhiều nhóm bit', 'More bit buckets') },
  ];
  host.innerHTML = `<section class="tp-viz ep2354-viz" aria-label="2354 · Excellent pairs">
    <header class="tp-head"><div><small>2354 · EXCELLENT PAIRS</small><h2>${t('Đếm bit, ghép cặp', 'Count bits, pair values')}</h2></div><div class="tp-total"><strong>${v.answer ?? '—'}</strong><span>answer</span></div></header>
    <nav class="tp-phases">${[t('Bỏ trùng', 'Deduplicate'), t('Đếm bit 1', 'Count set bits'), t('Ghép nhóm', 'Pair buckets')].map((label, index) => `<span class="${index === stage ? 'active' : ''}">${index + 1} · ${label}</span>`).join('')}</nav>
    <div class="ep2354-input"><code>nums</code>${input}<span class="ep2354-unique">${v.nums.length} → ${v.unique.length}</span></div>
    <div class="ep2354-buckets">${groups}</div>
    <div class="ep2354-operation">${operation}</div>
    <div class="ep2354-middle">${matrix}${proof}</div>
    <div class="tp-debug"><header><b>${t('Dòng', 'Line')} ${v.line}</b><span>countExcellentPairs</span></header><div><code>${esc(v.source)}</code>${d && v.phase === 'check' ? `<b class="${d.accepted ? 'yes' : 'no'}">${d.accepted ? 'True' : 'False'}</b>` : ''}</div></div>
    <nav class="tp-actions">${[['reset', t('Làm lại', 'Restart')], ['line', t('Dòng tiếp', 'Next line') + ' <kbd>F10</kbd>'], ['pair', t('Cặp nhóm tiếp', 'Next bucket pair')], ['last', t('Kết quả', 'Result')]].map(([action, label]) => `<button type="button" data-ep2354-nav="${action}"${(action === 'reset' ? stepIndex === 0 : stepIndex >= steps.length - 1) ? ' disabled' : ''}>${label}</button>`).join('')}</nav>
    <nav class="tp-presets">${presets.map((preset, index) => `<button type="button" data-ep2354-preset="${index}">${preset.label}</button>`).join('')}</nav>
  </section>`;
  const go = index => { stopPlay(); ep2354Selection.pair = null; stepIndex = index; renderStep(); };
  host.querySelectorAll('[data-ep2354-nav]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.ep2354Nav;
    if (action === 'reset') return go(0);
    if (action === 'last') return go(steps.length - 1);
    if (action === 'line') return go(Math.min(stepIndex + 1, steps.length - 1));
    const index = steps.findIndex((frame, i) => i > stepIndex && frame.excellentPairs2354View?.phase === 'check');
    go(index < 0 ? steps.length - 1 : index);
  }));
  host.querySelectorAll('[data-ep2354-pair]').forEach(button => button.addEventListener('click', () => { stopPlay(); ep2354Selection.pair = button.dataset.ep2354Pair.split(',').map(Number); renderExcellentPairs2354View(step); }));
  host.querySelectorAll('[data-ep2354-follow]').forEach(button => button.addEventListener('click', () => { ep2354Selection.pair = null; renderExcellentPairs2354View(step); }));
  host.querySelectorAll('[data-ep2354-preset]').forEach(button => button.addEventListener('click', () => { stopPlay(); const preset = presets[Number(button.dataset.ep2354Preset)]; $('arrInput').value = preset.nums; $('param-k').value = preset.k; runViz(); }));
}
