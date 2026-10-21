function renderMinimumSwaps801Pictures(step) {
  const v = step.minSwaps801View, t = (vi, en) => lang === 'vi' ? vi : en, esc = x => escapeHtml(String(x));
  const summary = v.mode === 'summary', final = Boolean(step.final), current = v.i ?? 0;
  const cost = x => x === null || x === undefined ? '—' : x >= v.n + 1 ? '∞' : x;
  function rows(result = false) {
    const swapped = new Set(result ? v.shownSwapped : []);
    return `<div class="m801-array"><div class="m801-row-labels"><small>index</small><b>nums1</b><span></span><b>nums2</b></div><div class="m801-columns">${v.a.map((a, i) => {
      const exchange = swapped.has(i), b = v.b[i];
      return `<div class="m801-column${!final && i === current ? ' current' : !final && i === current - 1 ? ' previous' : ''}${exchange ? ' swapped' : ''}"><small>${i}${!final && v.i !== null ? i === current ? ' · i' : i === current - 1 ? ' · i−1' : '' : ''}</small><b>${result && exchange ? b : a}</b><span>${exchange ? '↕' : '·'}</span><b>${result && exchange ? a : b}</b></div>`;
    }).join('')}${v.a.length < v.n ? '<div class="m801-more">…</div>' : ''}</div></div>`;
  }
  function comparisons(kind) {
    const i = v.i, a = v.a[i - 1], b = v.b[i - 1], c = v.a[i], d = v.b[i], cross = kind === 'cross';
    const check = v.checks[kind], focus = cross ? v.line === 10 : v.line === 7;
    const first = cross ? d : c, second = cross ? c : d;
    const edge = (y0, y1, valid) => `<path class="${check === null ? 'unknown' : valid ? 'valid' : 'invalid'}" d="M80,${y0} L178,${y1}" marker-end="url(#m801-${check === null ? 'unknown' : valid ? 'valid' : 'invalid'})"/>`;
    return `<div class="m801-comparison${focus ? ' focus' : ''}"><header><b>${cross ? '╳' : '☰'} ${cross ? t('Chéo', 'Cross') : t('Thẳng', 'Straight')}</b><strong class="${check === null ? '' : check ? 'pass' : 'fail'}">${check === null ? '?' : check ? '✓' : '✕'}</strong></header><svg viewBox="0 0 260 108" role="img" aria-label="${cross ? t('So sánh chéo', 'Cross comparisons') : t('So sánh thẳng', 'Straight comparisons')}">${edge(27, cross ? 81 : 27, a < first)}${edge(81, cross ? 27 : 81, b < second)}${[[a,48,27],[b,48,81],[c,212,27],[d,212,81]].map(([value,x,y]) => `<rect x="${x - 28}" y="${y - 20}" width="56" height="40" rx="8"/><text x="${x}" y="${y + 6}" text-anchor="middle">${value}</text>`).join('')}</svg><div class="m801-equations"><code>${a} &lt; ${first} ${check === null ? '?' : a < first ? '✓' : '✕'}</code><code>${b} &lt; ${second} ${check === null ? '?' : b < second ? '✓' : '✕'}</code></div></div>`;
  }
  function transitions() {
    if (!v.previous) return `<div class="m801-start"><span><b>▤ ${t('Giữ cột 0', 'Keep column 0')}</b><strong>${cost(v.states?.keep)}</strong></span><span><b>↕ ${t('Đổi cột 0', 'Swap column 0')}</b><strong>${cost(v.states?.swap)}</strong></span></div>`;
    const nextVisible = v.event !== 'column';
    const node = (x,y,name,value,active) => `<g class="m801-state${active ? ' active' : ''}"><rect x="${x}" y="${y}" width="137" height="51" rx="9"/><text class="name" x="${x + 12}" y="${y + 20}">${name}</text><text class="cost" x="${x + 120}" y="${y + 36}" text-anchor="end">${cost(value)}</text></g>`;
    const edges = [['straight',8,'M167,49 L369,49',263,39,'+0'],['straight',9,'M167,148 L369,148',263,173,'+1'],['cross',11,'M167,148 L369,49',310,89,'+0'],['cross',12,'M167,49 L369,148',220,109,'+1']].map(([kind,line,path,x,y,label]) => {
      const valid = v.checks[kind], state = valid === null ? 'unknown' : valid ? 'valid' : 'invalid';
      return `<g class="m801-transition${line === v.line ? ' selected' : ''}"><path class="${state}" d="${path}" marker-end="url(#m801-${state})"/><text x="${x}" y="${y}" text-anchor="middle">${label}${valid === false ? ' ✕' : ''}</text></g>`;
    }).join('');
    return `<div class="m801-dp"><div class="m801-dp-labels"><small>${t('Cột trước', 'Previous column')} · ${current - 1}</small><small>${t('Cột hiện tại', 'Current column')} · ${current}</small></div><svg viewBox="0 0 540 185" role="img" aria-label="${t('DP: giữ hoặc đổi cột hiện tại; số là tổng lần đổi ít nhất', 'DP: keep or swap current column; numbers are minimum total swaps')}">${edges}${node(25,24,'keep',v.previous.keep,false)}${node(25,123,'swap',v.previous.swap,false)}${node(378,24,'next_keep',nextVisible ? v.states.next_keep : null,[8,11].includes(v.line))}${node(378,123,'next_swap',nextVisible ? v.states.next_swap : null,[9,12].includes(v.line))}</svg><small>∞ = ${t('chưa có đường hợp lệ', 'no valid path yet')} (≥${v.n + 1}) · +1 = ${t('đổi cột hiện tại', 'swap current column')}</small></div>`;
  }
  const history = v.history.length ? `<div class="m801-history"><div><small>i</small><b>keep</b><b>swap</b></div>${v.history.map(row => `<div class="${row.i === current ? 'current' : ''}"><small>${row.i}</small><b>${cost(row.keep)}</b><b>${cost(row.swap)}</b></div>`).join('')}</div>` : '';
  const proof = final ? `<div class="m801-answer"><strong>${v.answer}</strong><span>${t('lần đổi ít nhất', 'minimum swaps')}</span>${!summary ? `<code>min(${cost(v.states.keep)}, ${cost(v.states.swap)}) = ${v.answer}</code>` : ''}</div><div class="m801-proof"><header><b>↕ ${t('Một cách đổi tối ưu', 'One optimal set of swaps')}</b><code>${v.answer ? `[${v.swapped.join(', ')}${summary && v.answer > v.swapped.length ? ', …' : ''}]` : '∅'}</code></header>${rows(true)}<div class="m801-checks"><span>nums1 ${t('tăng', 'increases')} ✓</span><span>nums2 ${t('tăng', 'increases')} ✓</span></div></div>` : '';
  $('treeView').innerHTML = `<section class="m801-viz" aria-label="801 · Minimum swaps">
    <svg class="m801-defs" aria-hidden="true"><defs>${['valid','invalid','unknown'].map(kind => `<marker id="m801-${kind}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z"/></marker>`).join('')}</defs></svg>
    <header><strong>801 · ${t('Giữ ▤ hay đổi ↕?', 'Keep ▤ or swap ↕?')}</strong><button type="button" data-m801-column ${final ? 'disabled' : ''}>${t('Cột tiếp', 'Next column')} ⏭</button><button type="button" data-m801-result>${t('Kết quả', 'Result')}</button></header>
    ${summary ? `<div class="m801-summary">${v.n} ${t('cột · đã tính đủ · hình xem trước 12 cột. Debug từng dòng với ≤40 cột.', 'columns · fully computed · pictures preview 12 columns. Line debug for ≤40 columns.')}</div>` : `<div class="m801-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}
    <div class="m801-caption">${t('Chỉ đổi hai số trong cùng cột', 'Swap only within the same column')} ↕</div>${rows()}
    ${!final ? `<div class="m801-meaning"><span><b>keep ▤</b> ${t('giữ cột i', 'keep column i')}</span><span><b>swap ↕</b> ${t('đổi cột i', 'swap column i')}</span><small>${t('Số trong trạng thái = tổng lần đổi ít nhất từ cột 0 đến i', 'State value = minimum total swaps from column 0 through i')}</small></div>${v.i !== null ? `<div class="m801-comparisons">${comparisons('straight')}${comparisons('cross')}</div>` : ''}${transitions()}` : ''}
    ${!final && v.update ? `<div class="m801-update"><code>${v.update.name} = min(${cost(v.update.left)}, ${cost(v.update.right)}) = <b>${cost(v.update.result)}</b></code></div>` : ''}${proof}${history}
    <div class="m801-examples">${[t('Ví dụ 1 · đổi 1 cột','Example 1 · 1 swap'),t('Ví dụ 2','Example 2'),t('Không cần đổi','No swaps'),t('Cần đổi 2 cột','Needs 2 swaps')].map((label,i) => `<button type="button" data-m801-example="${i}">${label}</button>`).join('')}</div>
  </section>`;
  const host = $('treeView');
  host.querySelector('[data-m801-result]').addEventListener('click', () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelector('[data-m801-column]').addEventListener('click', () => {
    const target = steps.findIndex((s,i) => i > stepIndex && s.minSwaps801View?.event === 'column');
    stopPlay(); stepIndex = target < 0 ? steps.length - 1 : target; renderStep();
  });
  host.querySelectorAll('[data-m801-example]').forEach(button => button.addEventListener('click', () => {
    const pairs = [['1,3,5,4','1,2,3,7'],['0,3,5,8,9','2,1,4,6,9'],['1,2,3,4','2,3,4,5'],['0,4,2,6,4','1,1,5,3,7']];
    const [a,b] = pairs[Number(button.dataset.m801Example)]; $('arrInput').value = a; $('param-nums2').value = b; runViz();
  }));
  const strip = host.querySelector('.m801-columns');
  if (strip && !final) strip.scrollLeft = Math.max(0, (current - 2) * 62);
}
