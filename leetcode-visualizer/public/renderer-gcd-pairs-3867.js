function renderGcd3867View(step, selection = {}) {
  const v = step.gcd3867View, final = Boolean(step.final), summary = v.mode === 'summary';
  const host = $('treeView'), t = (vi, en) => lang === 'vi' ? vi : en, esc = s => escapeHtml(String(s));
  const gap = 72, start = 108, prefixWidth = Math.max(660, v.nums.length * gap + 145);
  const x = i => start + i * gap;
  const cell = (px, y, value, cls = '', label = '') => `<g class="g3867-cell ${cls}"><rect x="${px}" y="${y}" width="56" height="39" rx="8"/><text x="${px + 28}" y="${y + 25}" text-anchor="middle" style="font-size:${String(value).length > 7 ? 10 : String(value).length > 4 ? 12 : 15}px">${esc(value)}</text>${label !== '' ? `<text class="g3867-small" x="${px + 28}" y="${y + 57}" text-anchor="middle">${esc(label)}</text>` : ''}</g>`;
  const svg = (content, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="width:${w}px;height:${h}px" role="img" aria-label="${esc(t('Max tiền tố, GCD từng cột, sắp xếp và ghép hai đầu', 'Prefix maxima, GCD by column, sorting and pairing the ends'))}">${content}</svg>`;
  let diagram = '', math = '', footer = '';
  const activeStage = v.phase === 'prefix' ? 0 : v.phase === 'sort' ? 1 : 2;
  const stages = [t('Max → GCD', 'Max → GCD'), t('Sắp xếp', 'Sort'), t('Ghép hai đầu', 'Pair ends')].map((label, i) => `<button type="button" data-g3867-stage="${i}" class="${activeStage === i ? 'active' : ''}" aria-current="${activeStage === i ? 'step' : 'false'}"><b>${i + 1}</b>${label}</button>`).join('');
  if (v.phase === 'prefix') {
    const high = Math.max(...v.nums);
    let parts = `<text class="g3867-row-label" x="12" y="96">nums</text><text class="g3867-row-label" x="12" y="235">prefix max</text><text class="g3867-row-label" x="12" y="317">prefixGcd</text>`;
    if (v.i !== null && v.event !== 'prefix-end') parts += `<rect class="g3867-prefix-zone" x="${start - 8}" y="23" width="${v.i * gap + 72}" height="157" rx="10"/>`;
    v.nums.forEach((value, i) => {
      const h = 26 + 85 * value / high, current = v.i === i && v.event !== 'prefix-end';
      parts += `<g class="g3867-bar ${current ? 'current' : ''}"><rect x="${x(i) + 6}" y="${150 - h}" width="44" height="${h}" rx="6"/><text x="${x(i) + 28}" y="${140 - h}" text-anchor="middle" style="font-size:${String(value).length > 7 ? 10 : 14}px">${value}</text><text class="g3867-small" x="${x(i) + 28}" y="172" text-anchor="middle">${current ? 'i=' : ''}${i}</text></g>`;
      parts += `<path class="g3867-flow" d="M${x(i) + 28},181 v21 m-4,-5 l4,5 l4,-5"/>`;
      parts += cell(x(i), 211, v.maxima[i] ?? '?', v.maxima[i] === undefined ? 'pending' : current ? 'current' : 'max');
      if (i > 0) parts += `<path class="g3867-max-link" d="M${x(i) - 13},230 h10 m-4,-4 l4,4 l-4,4"/>`;
      parts += `<path class="g3867-flow" d="M${x(i) + 28},254 v28 m-4,-5 l4,5 l4,-5"/>`;
      parts += cell(x(i), 292, v.built[i] ?? '?', v.built[i] === undefined ? 'pending' : 'good');
    });
    diagram = svg(parts, prefixWidth, 360);
    const knownG = v.line === 9 || v.line === 10 || v.event === 'prefix-end';
    math = `<div class="g3867-math"><span>mx</span><strong>${v.mxUpdate && v.mxUpdate.before !== v.mxUpdate.after ? `<s>${v.mxUpdate.before}</s> → ` : ''}${v.mx ?? '—'}</strong><span>·</span><span>gcd(${v.x ?? '?'}, ${v.mx ?? '?'})</span><strong>= ${knownG ? v.g : '?'}</strong>${v.line === 9 ? `<small>${t('chờ append vào prefixGcd', 'awaiting append to prefixGcd')}</small>` : ''}</div>`;
  } else if (v.phase === 'sort') {
    let links = '', cells = `<text class="g3867-row-label" x="12" y="88">${t('Trước', 'Before')}</text><text class="g3867-row-label" x="12" y="251">${t('Sau sort', 'After sort')}</text>`;
    v.built.forEach((value, i) => { cells += cell(x(i), 63, value, 'max', i); });
    v.sortOrder.forEach(({ value, from }, to) => {
      links += `<path class="g3867-sort-link" d="M${x(from) + 28},123 C${x(from) + 28},160 ${x(to) + 28},185 ${x(to) + 28},224"/>`;
      cells += cell(x(to), 226, value, 'good', to);
    });
    diagram = svg(links + cells, prefixWidth, 310);
    math = `<div class="g3867-math"><span>prefixGcd</span><strong>${t('tăng dần', 'ascending')} →</strong><small>${t('Chỉ đổi vị trí, không đổi giá trị', 'Positions change; values stay the same')}</small></div>`;
  } else {
    const selectedPair = final ? v.pairs[selection.pair ?? 0] : v.pair;
    const cols = v.sorted, pairWidth = Math.max(660, cols.length * gap + 150), pos = new Map(cols.map((c, i) => [c.index, x(i)]));
    const used = new Set(v.pairs.flatMap(p => [p.left, p.right]));
    const shown = new Set(selectedPair ? [selectedPair.left, selectedPair.right] : []);
    let drawing = `<text class="g3867-row-label" x="12" y="148">prefixGcd</text>`;
    cols.forEach(({ index, value }, i) => {
      const isMiddle = v.middle?.index === index;
      drawing += cell(x(i), 122, value, `${used.has(index) ? 'used' : ''} ${shown.has(index) ? 'selected' : ''} ${isMiddle ? 'middle' : ''}`, index);
      if (isMiddle) drawing += `<text class="g3867-middle-label" x="${x(i) + 28}" y="209" text-anchor="middle">${t('Bỏ qua', 'Skip')}</text>`;
      if (!final && v.left !== null && (v.left === index || v.right === index)) {
        if (v.left === index) drawing += `<text class="g3867-pointer" x="${x(i) + 28}" y="234" text-anchor="middle">L=${index}</text>`;
        if (v.right === index) drawing += `<text class="g3867-pointer" x="${x(i) + 28}" y="255" text-anchor="middle">R=${index}</text>`;
      }
    });
    if (summary && cols.length > 6 && cols[6].index - cols[5].index > 1) drawing += `<text class="g3867-small" x="${x(6) - 8}" y="115" text-anchor="middle">…</text>`;
    if (selectedPair && pos.has(selectedPair.left) && pos.has(selectedPair.right)) {
      const a = pos.get(selectedPair.left) + 28, b = pos.get(selectedPair.right) + 28;
      drawing += `<path class="g3867-pair-arc ${selectedPair.counted ? 'counted' : ''}" d="M${a},117 V88 Q${(a + b) / 2},12 ${b},88 V117"/><text class="g3867-pair-label" x="${(a + b) / 2}" y="38" text-anchor="middle">gcd(${selectedPair.a}, ${selectedPair.b}) = ${selectedPair.g}</text>`;
    }
    diagram = svg(drawing, pairWidth, 280);
    const addition = final && selectedPair ? { before: selectedPair.before, g: selectedPair.g, after: selectedPair.after } : v.addition;
    math = `<div class="g3867-math"><span>${final ? t('Xem lại cặp', 'Pair replay') : 'gcd'}</span><strong>${selectedPair ? `gcd(${selectedPair.a}, ${selectedPair.b}) = ${selectedPair.g}` : '?'}</strong>${addition ? `<span>→</span><strong>${addition.before} + ${addition.g} = ${addition.after}</strong>` : selectedPair ? `<small>${t('chờ cộng vào answer', 'awaiting addition to answer')}</small>` : ''}<span class="g3867-total">answer = ${v.answer ?? '—'}</span></div>`;
    if (v.middle) footer += `<div class="g3867-middle-note">${t('Bỏ phần tử giữa', 'Ignore middle element')} · sorted[${v.middle.index}] = ${v.middle.value} · +0</div>`;
    if (v.pairs.length) footer += `<div class="g3867-pairs">${v.pairs.map((p, i) => `<button type="button" data-g3867-pair="${i}" ${final ? '' : 'disabled'} aria-pressed="${final && (selection.pair ?? 0) === i}"><small>#${i + 1} · [${p.left}, ${p.right}]</small><div><b>${p.a}</b><span>↔</span><b>${p.b}</b><span>→</span><strong>+${p.g}</strong></div></button>`).join('')}</div>`;
    if (summary) footer += `<small class="g3867-preview-note">${t('Hình: 6 số đầu + 6 số cuối của mảng đã sort; thẻ: 6 cặp đầu', 'Picture: first 6 + last 6 sorted values; cards: first 6 pairs')} · ${v.pairCount} ${t('cặp đã tính đủ', 'pairs computed in full')}</small>`;
  }
  host.innerHTML = `<section class="g3867-viz" aria-label="3867 · Sum of GCD of Formed Pairs"><header><strong>3867 · ${t('Max → GCD → ghép cặp', 'Max → GCD → pair')}</strong><button type="button" data-g3867-next ${final ? 'disabled' : ''}>${t('Xong lượt', 'Finish round')} ⏭</button><button type="button" data-g3867-result>${t('Kết quả', 'Result')}</button></header>
    ${summary ? `<div class="g3867-summary">${t('Đã tính đủ', 'Computed all')} ${v.total} ${t('số. Đây là hình xem trước; debug từng dòng với ≤30 số.', 'values. This is a preview; line debug for ≤30 values.')}</div>` : `<nav class="g3867-stages" aria-label="${esc(t('Các giai đoạn', 'Stages'))}">${stages}</nav><div class="g3867-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}
    ${final ? `<div class="g3867-final">return <strong>${v.answer}</strong> · ${v.pairCount} ${t('cặp', 'pairs')}</div>` : ''}
    ${math}<div class="g3867-diagram">${diagram}</div>${footer}
    <div class="g3867-legend"><span class="current">● ${t('đang xét', 'current')}</span><span class="good">● ${t('đã ghi / cặp đã cộng', 'stored / counted pair')}</span><span>? ${t('chưa tính / chưa ghi', 'not computed / not stored')}</span></div>
    <div class="g3867-examples">${[t('Ví dụ · 5', 'Example · 5'), t('Mảng lẻ · 2', 'Odd array · 2'), t('Giá trị trùng', 'Duplicates'), t('Một số · 0', 'One value · 0')].map((label, i) => `<button type="button" data-g3867-example="${i}">${label}</button>`).join('')}</div></section>`;
  host.querySelector('[data-g3867-result]').addEventListener('click', () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelector('[data-g3867-next]').addEventListener('click', () => {
    const targetLines = v.phase === 'prefix' ? [10, 11] : v.phase === 'sort' ? [13] : [18];
    const next = steps.findIndex((s, i) => i > stepIndex && targetLines.includes(s.gcd3867View?.line)); stopPlay(); stepIndex = next < 0 ? steps.length - 1 : next; renderStep();
  });
  host.querySelectorAll('[data-g3867-stage]').forEach(button => button.addEventListener('click', () => {
    const line = [5, 11, 13][Number(button.dataset.g3867Stage)], next = steps.findIndex(s => s.gcd3867View?.line === line);
    if (next >= 0) { stopPlay(); stepIndex = next; renderStep(); }
  }));
  if (final) host.querySelectorAll('[data-g3867-pair]').forEach(button => button.addEventListener('click', () => {
    renderGcd3867View(step, { pair: Number(button.dataset.g3867Pair) }); host.querySelector(`[data-g3867-pair="${button.dataset.g3867Pair}"]`)?.focus?.();
  }));
  host.querySelectorAll('[data-g3867-example]').forEach(button => button.addEventListener('click', () => {
    $('arrInput').value = [[3,6,2,8],[2,6,4],[4,4,4,4],[7]][Number(button.dataset.g3867Example)].join(','); runViz();
  }));
  const scroller = host.querySelector('.g3867-diagram');
  if (scroller && v.phase === 'prefix' && v.i !== null && prefixWidth > scroller.clientWidth) scroller.scrollLeft = Math.max(0, x(v.i) - scroller.clientWidth * .6);
}
