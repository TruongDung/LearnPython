'use strict';

let range2832Selection = { step: null, index: null };
function renderMaximumRanges2832View(step) {
  const v = step.range2832View, host = $('treeView'), t = (vi, en) => lang === 'vi' ? vi : en, esc = value => escapeHtml(String(value));
  if (range2832Selection.step !== step) range2832Selection = { step, index: null };
  const selected = range2832Selection.index;
  const widest = v.ranges.reduce((best, range) => range && (!best || range.length > best.length) ? range : best, null);
  const inspecting = selected !== null;
  const activePop = !inspecting && !v.final && !(v.phase === 'compare' && v.condition) ? v.pop : null;
  const range = inspecting ? v.ranges[selected] : v.final ? widest : activePop;
  const focus = range?.mid ?? (v.phase === 'compare' ? v.comparison?.top : v.phase === 'push' ? v.i : null);
  const hasLeft = range?.left !== null && range?.left !== undefined;
  const resolved = v.ranges.filter(Boolean).length;
  const max = Math.max(...v.nums), x = index => 88 + index * 64, baseline = 202, height = value => Math.max(12, value / max * 136);
  const width = Math.max(464, (v.n + 2) * 64 + 32);
  const inRange = index => hasLeft && index > range.left && index < range.right;
  const blocker = index => range && (index === range.right || (hasLeft && index === range.left));
  const bars = v.nums.map((value, index) => {
    const h = height(value), current = v.i === index && !inspecting && !v.final;
    return `<g class="range2832-bar${inRange(index) ? ' included' : ''}${blocker(index) ? ' blocker' : ''}${index === focus ? ' focus' : ''}${current ? ' scanning' : ''}" data-range2832-bar="${index}"><title>nums[${index}] = ${value}</title><rect x="${x(index)-22}" y="${baseline-h}" width="44" height="${h}" rx="5"/><text class="value" x="${x(index)}" y="${baseline-h-10}">${value}</text><text class="index" x="${x(index)}" y="${baseline+19}">${index}</text>${current ? `<text class="pointer" x="${x(index)}" y="23">i ↓</text>` : ''}${index === focus ? `<text class="mid" x="${x(index)}" y="${baseline+40}">mid</text>` : ''}${blocker(index) ? `<text class="block-label" x="${x(index)}" y="${baseline+40}">${index === range.left ? 'L' : 'R'}</text>` : ''}</g>`;
  }).join('');
  const band = hasLeft ? `<rect class="range2832-band" x="${x(range.left+1)-29}" y="41" width="${(range.right-range.left-1)*64-6}" height="${baseline-31}" rx="7"/><path class="range2832-bracket" d="M${x(range.left+1)-22} 251 v7 H${x(range.right-1)+22} v-7"/><text class="range2832-length" x="${(x(range.left+1)+x(range.right-1))/2}" y="280">${t('Độ dài', 'Length')} ${range.right-range.left-1}</text>` : '';
  const guide = focus !== null && focus !== undefined ? `<path class="range2832-guide" d="M${x(0)-28} ${baseline-height(v.nums[focus])} H${x(v.n-1)+28}"/>` : '';
  const edge = (side, index) => `<g class="range2832-edge"><path d="M${x(index)} 47 V${baseline}"/><text x="${x(index)}" y="35">${side}</text><text x="${x(index)}" y="${baseline+20}">${index}</text></g>`;
  const leftEdge = hasLeft && range.left === -1 ? edge('L', -1) : '';
  const rightEdge = hasLeft && range.right === v.n && (inspecting || v.i !== v.n) ? edge('R', v.n) : '';
  const sentinel = !inspecting && v.i === v.n ? `<g class="range2832-sentinel"><rect x="${x(v.n)-22}" y="48" width="44" height="${baseline-48}" rx="5"/><text x="${x(v.n)}" y="36">${hasLeft ? 'R · i ↓' : 'i ↓'}</text><text x="${x(v.n)}" y="110">${v.phase === 'scan' ? '?' : '+∞'}</text><text x="${x(v.n)}" y="${baseline+20}">n</text></g>` : '';
  const stack = `<div class="range2832-stack">${v.stack.map((index, position) => `<div class="range2832-chip${position === v.stack.length-1 ? ' top' : ''}${v.phase === 'push' && index === v.i ? ' pushed' : ''}"><span style="height:${Math.max(12, v.nums[index]/max*44)}px"></span><b>${v.nums[index]}</b><small>#${index}${position === v.stack.length-1 ? ' · top' : ''}</small></div>`).join('') || '<span class="range2832-empty">∅</span>'}</div>`;
  const top = v.comparison?.top, comparing = v.phase === 'compare';
  const compare = comparing ? top === null || top === undefined ? `<span>${t('Stack rỗng', 'Empty stack')}</span><b>False</b>` : `<code>${v.nums[top]}</code><span>&lt;</span><code>${v.cur === '∞' ? '+∞' : v.cur}</code><b class="${v.condition ? 'yes' : 'no'}">${v.condition ? 'True ✓' : 'False ×'}</b>` : activePop ? `<span class="range2832-out">${t('Vừa pop', 'Popped')} <b>${v.nums[activePop.mid]}</b><code>mid = ${activePop.mid}</code></span>` : `<span>${v.phase === 'push' ? t('Push index', 'Push index') + ' ' + v.i : t('Đáy → đỉnh · giá trị giảm dần', 'Bottom → top · decreasing values')}</span>`;
  const formula = hasLeft ? `<div class="range2832-formula"><code>${range.assigned || v.ranges[range.mid] ? `ans[${range.mid}]` : t('Sắp ghi', 'Next write')}</code><span><b>${range.right}</b> − <b>(${range.left})</b> − 1 = <strong>${range.right-range.left-1}</strong></span><small>[${range.left+1}…${range.right-1}]</small></div>` : `<div class="range2832-formula waiting"><code>i − left − 1</code><span>${activePop ? t('Chờ dòng left = …', 'Waiting for left = …') : t('Gặp cột cao hơn → pop → biết khoảng', 'Taller bar → pop → range found')}</span></div>`;
  const answers = `<div class="range2832-answers">${v.nums.map((value, index) => `<button type="button" data-range2832-inspect="${index}"${v.ranges[index] ? '' : ' disabled'} class="${index === focus ? 'current ' : ''}${v.ranges[index] ? 'ready' : ''}" aria-label="${t('Xem khoảng của', 'Inspect range for')} nums[${index}] = ${value}"><small>#${index} · ${value}</small><b>${v.ans ? v.ans[index] || '·' : '·'}</b></button>`).join('')}</div>`;
  const presets = [['1,5,4,3,6', t('Ví dụ mẫu', 'Example')], ['5,4,3,2,1', t('Giảm dần', 'Decreasing')], ['1,2,3,4,5', t('Tăng dần', 'Increasing')], ['5,1,4,2,3', t('Chặn hai đầu', 'Two barriers')], ['42', t('Một cột', 'One bar')]];
  const nextRange = () => steps.findIndex((frame, index) => index > stepIndex && frame.range2832View?.line === 15);
  host.innerHTML = `<section class="tp-viz range2832-viz" data-source-line="${v.line}" aria-label="2832 · Maximum ranges"><header class="tp-head"><div><small>2832 · MAXIMAL RANGE</small><h2>${t('Một đỉnh, một khoảng', 'One peak, one range')}</h2></div><div class="tp-total"><strong>${resolved}/${v.n}</strong><span>${t('khoảng đã biết', 'ranges found')}</span></div></header><div class="range2832-legend"><span class="peak">◆ ${t('đỉnh mid', 'peak mid')}</span><span class="inside">━ ${t('khoảng hợp lệ', 'valid range')}</span><span class="barrier">▥ ${t('chặn lớn hơn', 'taller barrier')}</span><span class="scan">↓ i</span></div>
    <div class="range2832-chart"><svg role="img" aria-label="${t('Cột cao hơn chặn khoảng của mid', 'Taller bars bound the range of mid')}" viewBox="0 0 ${width} 294" style="width:${width}px;height:294px">${band}${guide}<path class="range2832-axis" d="M${x(0)-28} ${baseline} H${x(v.n-1)+28}"/>${bars}${leftEdge}${rightEdge}${sentinel}</svg></div>${formula}
    <div class="range2832-stack-panel"><header><b>stack <small>${t('lưu index', 'stores indices')}</small></b><span>${compare}</span></header>${stack}</div><header class="range2832-answer-label"><b>ans</b><span>${inspecting ? t('Đang xem khoảng đã ghi', 'Inspecting a stored range') : t('Bấm ô đã tính để xem khoảng', 'Select a computed cell to inspect')}</span>${inspecting ? `<button type="button" data-range2832-follow>${t('Về bước debug', 'Follow debugger')}</button>` : ''}</header>${answers}
    <div class="tp-debug"><header><b>${t('Dòng', 'Line')} ${v.line}</b><span>${v.i === v.n ? t('+∞: cột ảo để pop hết stack', '+∞: virtual bar drains the stack') : 'maximumLengthOfRanges'}</span></header><div><code>${esc(v.source)}</code>${v.condition === null ? '' : `<b>${v.condition ? 'True' : 'False'}</b>`}</div></div><nav class="tp-actions">${[['reset', t('Làm lại', 'Restart')], ['line', t('Dòng tiếp', 'Next line') + ' <kbd>F10</kbd>'], ['range', t('Khoảng tiếp', 'Next range')], ['last', t('Kết quả', 'Result')]].map(([action, label]) => `<button type="button" data-range2832-nav="${action}"${(action === 'reset' ? stepIndex === 0 : action === 'range' ? nextRange() < 0 : stepIndex === steps.length-1) ? ' disabled' : ''}>${label}</button>`).join('')}</nav><nav class="tp-presets">${presets.map((item, index) => `<button type="button" data-range2832-preset="${index}">${item[1]}</button>`).join('')}</nav></section>`;
  const go = index => { stopPlay(); stepIndex = index; renderStep(); };
  host.querySelectorAll('[data-range2832-nav]').forEach(button => button.addEventListener('click', () => { const action = button.dataset.range2832Nav; const index = action === 'reset' ? 0 : action === 'last' ? steps.length-1 : action === 'line' ? Math.min(steps.length-1, stepIndex+1) : nextRange(); if (index >= 0) go(index); }));
  host.querySelectorAll('[data-range2832-inspect]').forEach(button => button.addEventListener('click', () => { stopPlay(); range2832Selection.index = Number(button.dataset.range2832Inspect); renderMaximumRanges2832View(step); }));
  host.querySelectorAll('[data-range2832-follow]').forEach(button => button.addEventListener('click', () => { range2832Selection.index = null; renderMaximumRanges2832View(step); }));
  host.querySelectorAll('[data-range2832-preset]').forEach(button => button.addEventListener('click', () => { stopPlay(); $('arrInput').value = presets[Number(button.dataset.range2832Preset)][0]; runViz(); }));
  const chart = host.querySelector?.('.range2832-chart'), center = focus ?? (v.i !== null ? v.i : 0);
  if (chart) chart.scrollLeft = Math.max(0, x(center)-chart.clientWidth/2);
  const answerHost = host.querySelector?.('.range2832-answers'), active = answerHost?.querySelector('.current');
  if (active) answerHost.scrollLeft = Math.max(0, active.offsetLeft-answerHost.clientWidth/2+active.offsetWidth/2);
  const stackHost = host.querySelector?.('.range2832-stack'); if (stackHost) stackHost.scrollLeft = stackHost.scrollWidth;
}
