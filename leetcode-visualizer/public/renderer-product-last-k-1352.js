'use strict';

function renderProductLastK1352View(step) {
  const v = step.product1352View, host = $('treeView'), t = (vi, en) => lang === 'vi' ? vi : en, esc = value => escapeHtml(String(value));
  const query = v.method === 'getProduct', pending = v.phase === 'zero-check', start = query ? v.stream.length-v.k : -1;
  const crossesZero = query && v.k >= v.prefix.length, denominatorIndex = query && !crossesZero ? v.prefix.length-v.k-1 : null;
  const active = v.stream.slice(v.lastZero+1), completed = new Map(v.history.map(item => [item.opIndex, item.result]));
  const operations = `<div class="pk1352-operations"><button type="button" data-pk1352-op="-1" class="${v.opIndex === -1 ? 'current' : 'done'}"><code>new()</code><small>prefix = [1]</small></button>${v.operations.map((op,index) => {
    const done = completed.has(index), isQuery = op.name === 'getProduct';
    return `<button type="button" data-pk1352-op="${index}" class="${index === v.opIndex ? 'current ' : ''}${done ? 'done ' : ''}${isQuery ? 'query' : ''}" title="${esc(op.label)}"><code>${isQuery ? `get(${op.args[0]})` : `+ ${op.args[0]}`}</code><small>${done ? isQuery ? `<b class="${completed.get(index) === 0 ? 'zero-result' : ''}">${completed.get(index)}</b>` : '✓' : '·'}</small></button>`;
  }).join('')}</div>`;
  const stream = `<div class="pk1352-stream">${v.stream.map((value,index) => `<div data-pk1352-value="${index}" class="pk1352-number${value === 0 ? ' zero' : ''}${index <= v.lastZero ? ' past' : ''}${query && index >= start ? crossesZero ? ' selected blocked' : ' selected' : ''}${!query && !pending && index === v.stream.length-1 ? ' added' : ''}"><small>${index}</small><strong>${value}</strong><span>${value === 0 ? '✂' : query && index >= start ? '✓' : '·'}</span></div>`).join('')}${pending ? `<div class="pk1352-number pending"><small>+ num</small><strong>${v.num}</strong><span>↓</span></div>` : ''}${!v.stream.length && !pending ? '<span class="pk1352-empty">∅</span>' : ''}</div>`;
  const chain = `<div class="pk1352-chain">${v.prefix.map((value,index) => `${index ? `<span class="pk1352-link"><small>× ${active[index-1]}</small><span>→</span></span>` : ''}<div data-pk1352-prefix="${index}" class="pk1352-prefix${index === 0 ? ' identity' : ''}${query && !crossesZero && index === v.prefix.length-1 ? ' numerator' : ''}${index === denominatorIndex ? ' denominator' : ''}${v.phase === 'multiply' && index === v.prefix.length-1 ? ' fresh' : ''}"><small>[${index}]</small><strong>${value}</strong><code>${query && !crossesZero && index === v.prefix.length-1 ? '[-1]' : index === denominatorIndex ? '[-k−1]' : index === 0 ? t('mốc 1', 'identity') : '·'}</code></div>`).join('')}</div>`;
  const selection = query ? `<div class="pk1352-window ${crossesZero ? 'blocked' : ''}"><b>k = ${v.k}</b><span>[${start}…${v.stream.length-1}]</span><span>${crossesZero ? '✂ ' + t('gặp số 0', 'contains zero') : t('sau số 0 cuối', 'after the last zero')}</span></div>` : `<div class="pk1352-window"><span>${pending ? t('Số mới đang chờ thêm', 'New value is waiting to be added') : v.lastZero >= 0 ? t('Màu mờ: trước lần reset gần nhất', 'Faded: before the latest reset') : t('Mỗi ô là một số đã thêm', 'Each tile is an added value')}</span></div>`;
  const factors = (items, cancelled) => items.map((value,index) => `${index ? '<span>×</span>' : ''}<b class="${cancelled ? 'cancelled' : 'kept'}">${value}</b>`).join('') || '<b class="identity-factor">1</b>';
  let picture;
  if (v.phase === 'reset' || (v.phase === 'add-done' && v.num === 0)) {
    picture = `<div class="pk1352-reset"><div class="pk1352-discarded">${v.beforePrefix.map(value => `<del>${value}</del>`).join('')}</div><span class="pk1352-scissors">0 ✂</span><div class="pk1352-restart"><strong>1</strong><small>prefix = [1]</small></div></div>`;
  } else if (v.phase === 'multiply') {
    const c = v.calculation;
    picture = `<div class="pk1352-multiply"><code>${c.before}</code><span>×</span><code>${c.num}</code><span>=</span><strong>${c.after}</strong></div>`;
  } else if (v.phase === 'divide') {
    const c = v.calculation, cancelled = active.slice(0,denominatorIndex), kept = active.slice(denominatorIndex);
    picture = `<div class="pk1352-division"><div class="pk1352-fraction"><div class="pk1352-numerator"><code>${c.numerator}</code><small>prefix[-1]</small></div><div class="pk1352-denominator"><code>${c.denominator}</code><small>prefix[-k−1]</small></div></div><span class="pk1352-equals">=</span><strong class="pk1352-result">${v.result}</strong></div><div class="pk1352-cancellation"><div class="pk1352-fraction"><div>${cancelled.length ? factors(cancelled,true)+'<span>×</span>' : ''}${factors(kept,false)}</div><div>${factors(cancelled,true)}</div></div><span>=</span><div>${factors(kept,false)}</div></div>`;
  } else if (v.phase === 'zero-result') {
    picture = `<div class="pk1352-zero-equation"><div>${v.stream.slice(start).map((value,index) => `${index ? '<span>×</span>' : ''}<b class="${value === 0 ? 'zero-factor' : ''}">${value}</b>`).join('')}</div><span>=</span><strong>0</strong></div>`;
  } else if (query) {
    picture = `<div class="pk1352-check"><code>${v.k} ≥ ${v.prefix.length}</code><b class="${v.condition ? 'yes' : 'no'}">${v.condition ? 'True' : 'False'}</b><small>k ≥ len(prefix)</small></div>`;
  } else if (pending) {
    picture = `<div class="pk1352-check"><code>${v.num} == 0</code><b class="${v.condition ? 'yes' : 'no'}">${v.condition ? 'True ✂' : 'False'}</b></div>`;
  } else picture = `<div class="pk1352-start"><strong>1</strong><span>× a × b …</span></div>`;
  const presets = [
    ['add(3);add(0);add(2);add(5);add(4);getProduct(2);getProduct(3);getProduct(4);add(8);getProduct(2)', t('Ví dụ mẫu', 'Example')],
    ['add(2);add(3);add(4);getProduct(2);getProduct(3)', t('Chia hai mốc', 'Divide two prefixes')],
    ['add(5);add(0);getProduct(1);add(2);getProduct(1);getProduct(2)', t('Qua số 0', 'Across zero')],
    ['add(0);add(0);getProduct(2);add(7);getProduct(1);getProduct(3)', t('Hai số 0', 'Two zeros')],
    ['add(1);add(1);add(6);getProduct(1);getProduct(3)', t('Mốc 1', 'Identity 1')],
  ];
  const nextOperation = () => steps.findIndex((frame,index) => index > stepIndex && frame.product1352View?.opIndex > v.opIndex);
  host.innerHTML = `<section class="tp-viz pk1352-viz" data-source-line="${v.line}" aria-label="1352 · Product of the Last K Numbers"><header class="tp-head"><div><small>1352 · PRODUCT OF THE LAST K NUMBERS</small><h2>${t('Nối tích, cắt tại số 0', 'Multiply, reset at zero')}</h2></div><div class="tp-total"><strong>${v.stream.length}</strong><span>${t('số đã thêm', 'values added')}</span></div></header>${operations}
    <section class="pk1352-card"><header><b>${t('Dãy số', 'Stream')}</b><span>${query ? `getProduct(${v.k})` : v.opIndex < 0 ? 'ProductOfNumbers()' : `add(${v.num})`}</span></header>${stream}${selection}</section>
    <section class="pk1352-card"><header><b>self.prefix</b><span>${v.lastZero >= 0 ? t('Tích sau số 0 cuối', 'Products after the last zero') : t('Các mốc tích', 'Cumulative products')}</span></header>${chain}</section>
    <section class="pk1352-picture" aria-label="${t('Phép tính đang thực hiện', 'Current calculation')}">${picture}</section>
    <div class="tp-debug"><header><b>${t('Dòng', 'Line')} ${v.line}</b><span>${v.method === '__init__' ? 'ProductOfNumbers.__init__' : v.method}${v.resultReady ? ` · return ${query ? v.result : 'None'}` : ''}</span></header><div><code>${esc(v.source)}</code>${v.condition === null ? '' : `<b>${v.condition ? 'True' : 'False'}</b>`}</div></div>
    <nav class="tp-actions">${[['reset',t('Làm lại','Restart')],['line',t('Dòng tiếp','Next line')+' <kbd>F10</kbd>'],['operation',t('Lệnh tiếp','Next operation')],['last',t('Kết quả','Result')]].map(([action,label]) => `<button type="button" data-pk1352-nav="${action}"${(action === 'reset' ? stepIndex === 0 : action === 'operation' ? nextOperation() < 0 : stepIndex === steps.length-1) ? ' disabled' : ''}>${label}</button>`).join('')}</nav><nav class="tp-presets">${presets.map((item,index) => `<button type="button" data-pk1352-preset="${index}">${item[1]}</button>`).join('')}</nav></section>`;
  const go = index => { stopPlay(); stepIndex = index; renderStep(); };
  host.querySelectorAll('[data-pk1352-nav]').forEach(button => button.addEventListener('click', () => { const action = button.dataset.pk1352Nav, index = action === 'reset' ? 0 : action === 'last' ? steps.length-1 : action === 'line' ? Math.min(steps.length-1,stepIndex+1) : nextOperation(); if(index >= 0) go(index); }));
  host.querySelectorAll('[data-pk1352-op]').forEach(button => button.addEventListener('click', () => { const target = Number(button.dataset.pk1352Op), index = steps.findLastIndex(frame => frame.product1352View?.opIndex === target); if(index >= 0) go(index); }));
  host.querySelectorAll('[data-pk1352-preset]').forEach(button => button.addEventListener('click', () => { stopPlay(); $('arrInput').value = presets[Number(button.dataset.pk1352Preset)][0]; runViz(); }));
  for (const [selector,target] of [['.pk1352-operations','.current'],['.pk1352-stream',query ? '.selected' : pending ? '.pending' : '.added'],['.pk1352-chain',query && !crossesZero ? '.denominator' : '.fresh']]) {
    const scroller = host.querySelector?.(selector), item = scroller?.querySelector(target);
    if(item) scroller.scrollLeft = Math.max(0,item.offsetLeft-scroller.clientWidth/2+item.offsetWidth/2);
  }
}
