function renderOcean1762View(step, selection = {}) {
  const v = step.ocean1762View, final = Boolean(step.final), summary = v.mode === 'summary';
  const t = (vi, en) => lang === 'vi' ? vi : en, esc = s => escapeHtml(String(s)), host = $('treeView');
  const selected = final && !summary ? (selection.building ?? v.checks.find(c => !c.visible)?.i ?? 0) : null;
  const check = final ? v.checks.find(c => c.i === selected) : v.check;
  const scanning = !final && v.line >= 5 && v.line <= 8 && v.event !== 'loop-end';
  const active = final ? selected : scanning ? v.i : null, gap = 70, x0 = 40, floor = 244;
  const width = Math.max(640, v.heights.length * gap + 200), oceanX = width - 125;
  const maxHeight = Math.max(...v.heights), height = h => 24 + h / maxHeight * 145;
  const x = i => x0 + (i - v.offset) * gap, roof = i => floor - height(v.heights[i - v.offset]);
  const styles = i => summary ? (v.answer.includes(i) ? 'visible' : 'blocked') : v.states[i];
  let sky = `<rect class="o1762-sky" x="12" y="30" width="${width - 24}" height="${floor - 30}" rx="15"/><path class="o1762-scan" d="M${oceanX - 20},23 H${x0 + 16} l10,-5 m-10,5 l10,5"/><text class="o1762-muted" x="${(x0 + oceanX) / 2}" y="15" text-anchor="middle">${t('Quét từ phải sang trái', 'Scan right to left')} ←</text>`;
  let sea = `<rect class="o1762-sea" x="${oceanX}" y="80" width="111" height="${floor - 80}" rx="12"/><text class="o1762-ocean-label" x="${oceanX + 55}" y="112" text-anchor="middle">${t('BIỂN', 'OCEAN')} →</text>`;
  for (let row = 0; row < 5; row++) sea += `<path class="o1762-wave" d="M${oceanX + 12},${140 + row * 21} q10,-9 20,0 t20,0 t20,0 t20,0"/>`;
  let buildings = '', rays = '';
  v.heights.forEach((value, j) => {
    const i = v.offset + j, status = styles(i), isActive = i === active;
    let windows = '';
    for (let row = 0; row < Math.min(4, Math.floor((height(value) - 15) / 22)); row++) for (let col = 0; col < 3; col++) windows += `<rect class="o1762-window" x="${x(i) + 8 + col * 13}" y="${roof(i) + 12 + row * 22}" width="6" height="9" rx="1"/>`;
    const interactive = final && !summary;
    buildings += `<g class="o1762-building ${status}${isActive ? ' current' : ''}${check?.blocker === i ? ' obstruction' : ''}${check?.maxIndex === i ? ' tallest-right' : ''}"${interactive ? ` role="button" tabindex="0" data-o1762-building="${i}" aria-label="${esc(t('Tòa', 'Building'))} ${i}: ${value}" aria-pressed="${isActive}"` : ''}><title>${esc(t('Index', 'Index'))} ${i} · ${value}</title><rect class="o1762-tower" x="${x(i)}" y="${roof(i)}" width="50" height="${height(value)}" rx="5"/>${windows}<text class="o1762-value" x="${x(i) + 25}" y="${roof(i) - 10}" text-anchor="middle">${value}</text><text class="o1762-index" x="${x(i) + 25}" y="${floor + 23}" text-anchor="middle">${i}</text><text class="o1762-status" x="${x(i) + 25}" y="${floor + 45}" text-anchor="middle">${status === 'visible' ? '✓' : status === 'blocked' ? '×' : status === 'eligible' ? '+' : status === 'checking' ? '?' : '·'}</text>${isActive ? `<text class="o1762-current-label" x="${x(i) + 25}" y="${floor + 68}" text-anchor="middle">${final ? t('chọn', 'picked') : 'i'}=${i}</text>` : ''}</g>`;
  });
  if (check) {
    const y = roof(check.i) + 1, from = x(check.i) + 52, to = check.visible ? oceanX + 8 : x(check.blocker) - 3;
    rays = `<g class="o1762-ray ${check.visible ? 'clear' : 'blocked'}"><path d="M${from},${y} H${to}"/>${check.visible ? `<path d="M${to - 9},${y - 5} l9,5 l-9,5"/>` : `<path class="o1762-cross" d="M${to - 5},${y - 7} l10,14 m0,-14 l-10,14"/>`}</g>`;
  }
  const processed = !summary && scanning && v.i < v.total - 1 ? `<path class="o1762-processed" d="M${x(v.i) + 60},${floor + 80} H${oceanX - 12}"/><text class="o1762-muted" x="${oceanX - 15}" y="${floor + 99}" text-anchor="end">${t('phía phải đã xét', 'processed on the right')}</text>` : '';
  const phase = final || v.event === 'loop-end' ? -1 : v.line === 5 ? 0 : v.line === 6 ? 1 : v.line === 7 ? 2 : v.line === 8 ? 3 : v.line === 9 ? 4 : -1;
  const phases = [t('Sang trái', 'Move left'), t('So chiều cao', 'Compare'), t('Ghi index', 'Append'), 'max', t('Đảo list', 'Reverse')].map((label, i) => `<span class="${i === phase ? 'active' : ''}"><b>${i + 1}</b>${label}</span>`).join('');
  const compare = check ? `<div class="o1762-comparison ${check.visible ? 'clear' : 'blocked'}"><strong>${check.height} &gt; ${check.maxBefore} <b>${check.visible ? '✓' : '×'}</b></strong><span>${check.visible ? t('Nhìn thấy biển', 'Ocean view') : check.height === check.maxBefore ? t('Bằng max bên phải → bị chắn', 'Equal to right max → blocked') : t('Thấp hơn max bên phải → bị chắn', 'Below right max → blocked')}</span>${check.blocker !== null ? `<small>${t('Tòa chặn đầu tiên', 'First blocking building')}: #${check.blocker}</small>` : ''}</div>` : `<div class="o1762-rule">heights[i] &gt; ${t('max bên phải', 'max on the right')} ?</div>`;
  const maxCard = !final ? `<div class="o1762-max"><small>highest · ${t('biến trong code', 'code variable')}</small><strong>${v.update && v.update.before !== v.update.after ? `<s>${v.update.before}</s> → ` : ''}${v.highest ?? '—'}</strong>${v.highestIndex !== null ? `<small>#${v.highestIndex}</small>` : ''}</div>` : '';
  const answer = `<div class="o1762-answer"><small>${summary ? t('Index nhìn thấy biển trong hình', 'Visible indices in this preview') : 'answer · index'}${!summary && !final && v.line !== 9 && v.line !== 10 ? ' · ' + t('đang ghi phải → trái', 'appending right → left') : ''}</small><div>${v.answer.length ? v.answer.map(i => `<b>${i}</b>`).join('<span>→</span>') : '<code>[]</code>'}</div>${summary ? `<small>${v.answerCount} ${t('index trong kết quả đầy đủ', 'indices in the complete result')}</small>` : ''}</div>`;
  host.innerHTML = `<section class="o1762-viz" aria-label="1762 · Buildings With an Ocean View"><header><strong>1762 · ${t('Tòa nào nhìn thấy biển?', 'Which buildings see the ocean?')}</strong><button type="button" data-o1762-next ${final ? 'disabled' : ''}>${t('Xong một tòa', 'Finish building')} ⏭</button><button type="button" data-o1762-result>${t('Kết quả', 'Result')}</button></header>
    ${summary ? `<div class="o1762-summary">${t('Đã xét đủ', 'Processed all')} ${v.total} ${t('tòa · hình là 12 tòa cuối. Debug từng dòng với ≤30 tòa.', 'buildings · showing the last 12. Line debug for ≤30 buildings.')}</div>` : `<div class="o1762-phases">${phases}</div><div class="o1762-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}
    ${final ? `<div class="o1762-final">${summary ? `${t('Kết quả', 'Result')}: ${v.answerCount} ${t('tòa', 'buildings')}` : `return [${v.answer.join(', ')}] · ${t('Bấm một tòa để xem tia nhìn', 'Select a building to inspect its sightline')}`}</div>` : ''}
    ${!summary ? `<div class="o1762-cards">${compare}${maxCard}</div>` : ''}
    <div class="o1762-diagram"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 355" style="width:${width}px;height:355px" role="img" aria-label="${esc(t('Các tòa nhà từ trái sang phải, biển bên phải và tia nhìn đến tòa chặn đầu tiên', 'Buildings from left to right, ocean on the right, and a sightline to the first obstruction'))}">${sky}${sea}${buildings}${rays}${processed}</svg></div>
    <div class="o1762-legend"><span class="clear">✓ ${t('đã ghi index', 'index appended')}</span><span class="blocked">× ${t('bị chắn', 'blocked')}</span><span class="current">◉ ${t('đang xét / đang chọn', 'current / selected')}</span><span>+ ${t('đủ cao, chờ append', 'tall enough, awaiting append')}</span></div>
    ${answer}<div class="o1762-examples">${[t('Ví dụ', 'Example'), t('Cao bằng nhau', 'Equal heights'), t('Cao dần', 'Increasing'), t('Thấp dần', 'Decreasing'), t('Một tòa', 'One building')].map((label, i) => `<button type="button" data-o1762-example="${i}">${label}</button>`).join('')}</div></section>`;
  host.querySelector('[data-o1762-result]').addEventListener('click', () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelector('[data-o1762-next]').addEventListener('click', () => { const next = steps.findIndex((s, i) => i > stepIndex && s.ocean1762View?.line === 8); stopPlay(); stepIndex = next < 0 ? steps.length - 1 : next; renderStep(); });
  host.querySelectorAll('[data-o1762-building]').forEach(button => {
    const select = () => { renderOcean1762View(step, { building: Number(button.dataset.o1762Building) }); host.querySelector(`[data-o1762-building="${button.dataset.o1762Building}"]`)?.focus?.(); };
    button.addEventListener('click', select); button.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
  });
  host.querySelectorAll('[data-o1762-example]').forEach(button => button.addEventListener('click', () => { $('arrInput').value = [[4,2,3,1],[3,3,3],[1,2,3,4],[4,3,2,1],[7]][Number(button.dataset.o1762Example)].join(','); runViz(); }));
  const diagram = host.querySelector('.o1762-diagram');
  if (diagram && width > diagram.clientWidth && active !== null) diagram.scrollLeft = Math.max(0, x(active) - diagram.clientWidth * .25);
}
