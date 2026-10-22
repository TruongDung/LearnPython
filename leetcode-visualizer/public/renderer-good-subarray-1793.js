function renderGoodSubarray1793View(step, selection = {}) {
  const v = step.good1793View, final = Boolean(step.final), summary = v.mode === 'summary';
  const t = (vi, en) => lang === 'vi' ? vi : en, esc = x => escapeHtml(String(x));
  const host = $('treeView'), gap = 62, x0 = 46, floor = 212;
  const width = Math.max(640, v.nums.length * gap + 100), high = Math.max(...v.nums);
  const height = value => 155 * value / high, x = index => x0 + (index - v.offset) * gap;
  const replay = final && !summary && selection.round !== undefined ? v.history[selection.round] : null;
  const chosen = replay || (final ? v.best : null), left = chosen?.left ?? v.left, right = chosen?.right ?? v.right;
  const minimum = chosen?.minimum ?? v.minimum, currentScore = chosen?.score ?? v.score;
  let bars = '', overlays = '', pointers = '';
  const within = index => index >= v.offset && index < v.offset + v.nums.length;
  const ready = chosen || (!v.pending && v.score !== null);
  if (minimum !== null && left !== null && ready) {
    const a = Math.max(left, v.offset), b = Math.min(right, v.offset + v.nums.length - 1);
    if (a <= b) overlays += `<rect class="g1793-area" x="${x(a) - 5}" y="${floor - height(minimum)}" width="${(b - a) * gap + 52}" height="${height(minimum)}" rx="5"/>`;
  }
  v.nums.forEach((value, j) => {
    const i = v.offset + j, included = left !== null && i >= left && i <= right;
    const neighbor = !final && v.line === 10 && (i === v.left - 1 || i === v.right + 1);
    const isMin = included && minimum === value;
    const css = `${included ? ' inside' : ''}${i === v.k ? ' anchor' : ''}${isMin ? ' lowest' : ''}${neighbor ? ' neighbor' : ''}${!final && v.moved === i ? ' moved' : ''}`;
    bars += `<g class="g1793-bar${css}"><rect x="${x(i)}" y="${floor - height(value)}" width="42" height="${Math.max(2, height(value))}" rx="6"/><text class="value" x="${x(i) + 21}" y="${floor - height(value) - 9}" text-anchor="middle">${value}</text><text class="index" x="${x(i) + 21}" y="${floor + 23}" text-anchor="middle">${i}</text>${i === v.k ? `<text class="k-label" x="${x(i) + 21}" y="${floor + 48}" text-anchor="middle">★ k</text>` : ''}</g>`;
  });
  if (left !== null) {
    const a = Math.max(left, v.offset), b = Math.min(right, v.offset + v.nums.length - 1);
    if (a <= b) pointers += `<path class="g1793-bracket" d="M${x(a) - 4},270 v9 H${x(b) + 46} v-9"/><text class="g1793-caption" x="${(x(a) + x(b) + 42) / 2}" y="302" text-anchor="middle">[${left} .. ${right}] · ${right - left + 1} ${t('số', 'values')}${summary && (a !== left || b !== right) ? ' · ' + t('đã cắt hình', 'cropped') : ''}</text>`;
    for (const [index, label] of [[left, 'L'], [right, 'R']]) if (within(index)) pointers += `<text class="g1793-pointer" x="${x(index) + (left === right ? (label === 'L' ? 7 : 35) : 21)}" y="326" text-anchor="middle">${label}</text>`;
  }
  const phase = final ? -1 : v.line === 9 || v.line === 10 ? 0 : v.line === 11 || v.line === 13 ? 1 : v.line === 14 ? 2 : v.line === 15 || v.line === 16 ? 3 : v.line === 17 ? 4 : -1;
  const phases = [t('So hai phía', 'Compare sides'), t('Mở đoạn', 'Expand'), 'min', t('Tính điểm', 'Score'), t('Giữ max', 'Keep max')].map((label, i) => `<span class="${i === phase ? 'active' : ''}"><b>${i + 1}</b>${label}</span>`).join('');
  const c = v.choice;
  const decision = !final && c ? `<div class="g1793-choice"><span class="${c.side === 'left' ? 'picked' : ''}">← ${c.leftValue ?? '∅'}</span><small>${c.reason === 'tie' ? t('Bằng nhau → trái', 'Tie → left') : c.reason.endsWith('boundary') ? t('Chỉ còn một phía', 'Only one side remains') : t('Chọn số kề lớn hơn', 'Pick the larger neighbor')}</small><span class="${c.side === 'right' ? 'picked' : ''}">${c.rightValue ?? '∅'} →</span></div>` : '';
  const scoreWidth = chosen ? chosen.right - chosen.left + 1 : v.width;
  const updating = !final && v.pending;
  const math = `<div class="g1793-math"><div><small>minimum</small><strong>${minimum ?? '—'}</strong></div><b>×</b><div><small>${t('độ dài · width', 'width')}</small><strong>${scoreWidth ?? '—'}</strong></div><b>${updating ? '⋯' : '='}</b><div><small>${updating ? t('score cũ', 'previous score') : 'score'}</small><strong>${currentScore ?? '—'}</strong></div><b>→</b><div class="best"><small>${t('tốt nhất · answer', 'best · answer')}</small><strong>${v.answer ?? '—'}</strong></div></div>`;
  const pending = !final && v.pending ? `<div class="g1793-pending">${t('Biến đang cập nhật · xem dòng code tiếp theo', 'Variables updating · advance to the next code line')}</div>` : '';
  const best = v.best;
  const bestStrip = best ? `<div class="g1793-best"><strong>🏆 [${best.left} .. ${best.right}]</strong><span>${best.minimum} × ${best.right - best.left + 1} = <b>${best.score}</b></span><div class="g1793-mini">${v.nums.map((value, j) => { const i = v.offset + j; return `<i class="${i >= best.left && i <= best.right ? 'selected' : ''}${i === v.k ? ' k' : ''}" title="${i}: ${value}">${v.nums.length <= 12 ? value : ''}</i>`; }).join('')}</div></div>` : '';
  const replayPanel = final && !summary ? `<label class="g1793-replay">${t('Xem lại các đoạn đã thử', 'Replay tested ranges')} <input type="range" min="0" max="${v.history.length - 1}" value="${selection.round ?? v.history.findIndex(h => h.left === best.left && h.right === best.right)}" data-g1793-replay aria-label="${esc(t('Chọn đoạn để xem lại', 'Choose a range to replay'))}"/></label>` : '';
  const history = !summary && final ? `<div class="g1793-history">${v.history.map((h, i) => `<button type="button" data-g1793-round="${i}" aria-pressed="${chosen?.left === h.left && chosen?.right === h.right}"><span>[${h.left}..${h.right}]</span><div class="g1793-tiny">${v.nums.map((_, j) => `<i class="${j >= h.left && j <= h.right ? 'on' : ''}${j === v.k ? ' k' : ''}"></i>`).join('')}</div><b>${h.minimum} × ${h.right - h.left + 1} = ${h.score}</b></button>`).join('')}</div>` : '';
  host.innerHTML = `<section class="g1793-viz" aria-label="1793 · Maximum Score of a Good Subarray"><header><strong>1793 · ${t('Đoạn tốt nhất chứa k', 'Best range containing k')}</strong><button type="button" data-g1793-next ${final ? 'disabled' : ''}>${t('Xong lượt', 'Finish round')} ⏭</button><button type="button" data-g1793-result>${t('Kết quả', 'Result')}</button></header>
    ${summary ? `<div class="g1793-summary">${t('Đã tính đủ', 'Computed all')} ${v.total} ${t('số. Hình xem trước 12 số quanh đoạn tốt nhất. Debug từng dòng với ≤30 số.', 'values. Preview shows 12 values near the best range. Line debug for ≤30 values.')}</div>` : `<div class="g1793-phases">${phases}</div><div class="g1793-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}
    ${final ? `<div class="g1793-result">return <strong>${v.answer}</strong> · ${replay ? t('đang xem lại một đoạn đã thử', 'replaying a tested range') : t('đoạn tốt nhất', 'best range')}</div>` : ''}${decision}${math}${pending}
    <div class="g1793-diagram"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 345" style="width:${width}px;height:345px" role="img" aria-label="${esc(t('Cột giá trị, đoạn chứa k và diện tích minimum nhân độ dài', 'Value bars, a range containing k, and the minimum times width area'))}">${bars}${overlays}${pointers}</svg></div>
    <div class="g1793-legend"><span class="anchor">★ k</span><span class="inside">■ [left, right]</span><span class="lowest">━ minimum</span><span>${t('Vùng tô = min × độ dài', 'Shaded area = minimum × width')}</span></div>
    ${bestStrip}${replayPanel}${history}<div class="g1793-examples">${[t('Ví dụ · k=3', 'Example · k=3'), t('k ở đầu', 'k at start'), t('Hai phía bằng nhau', 'Equal neighbors'), t('Một số', 'One value')].map((label, i) => `<button type="button" data-g1793-example="${i}">${label}</button>`).join('')}</div></section>`;
  host.querySelector('[data-g1793-result]').addEventListener('click', () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelector('[data-g1793-next]').addEventListener('click', () => { const next = steps.findIndex((s, i) => i > stepIndex && s.good1793View?.line === 17); stopPlay(); stepIndex = next < 0 ? steps.length - 1 : next; renderStep(); });
  host.querySelector('[data-g1793-replay]')?.addEventListener('input', event => renderGoodSubarray1793View(step, { round: Number(event.target.value) }));
  host.querySelectorAll('[data-g1793-round]').forEach(button => button.addEventListener('click', () => renderGoodSubarray1793View(step, { round: Number(button.dataset.g1793Round) })));
  host.querySelectorAll('[data-g1793-example]').forEach(button => button.addEventListener('click', () => {
    const [nums, k] = [[[1,4,3,7,4,5],3], [[5,5,4,5,4,1,1,1],0], [[4,2,4],1], [[7],0]][Number(button.dataset.g1793Example)];
    $('arrInput').value = nums.join(','); $('extraParams').querySelector('[data-param="k"]').value = k; runViz();
  }));
  const diagram = host.querySelector('.g1793-diagram');
  if (diagram && width > diagram.clientWidth && left !== null) diagram.scrollLeft = Math.max(0, x((left + right) / 2) - diagram.clientWidth / 2);
}
