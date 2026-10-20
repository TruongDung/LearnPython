function renderSqrt69Pictures(step) {
  const v = step.sqrt69View, t = (vi, en) => lang === "vi" ? vi : en, esc = value => escapeHtml(String(value));
  const final = Boolean(step.final), side = v.visualSide, square = v.square === null ? null : BigInt(v.square);
  const cmp = square === null ? '?' : square < BigInt(v.x) ? '<' : square > BigInt(v.x) ? '>' : '=';
  function squarePicture() {
    if (side === null) return `<div class="s69-placeholder"><strong>${v.event === 'while' && !v.check ? '∅' : '?'}</strong><small>${v.event === 'while' && !v.check ? 'lo > hi' : t('Chọn mid để thử cạnh vuông', 'Pick mid to try a square side')}</small></div>`;
    if (side === 0) return `<div class="s69-placeholder"><strong>∅</strong><small>0 × 0 = 0</small></div>`;
    const exact = side <= 10, size = 146, cell = size / side;
    let cells = '';
    if (exact) {
      for (let r = 0; r < side; r++) for (let c = 0; c < side; c++) cells += `<rect class="${r * side + c < v.x ? 'filled' : 'missing'}" x="${28 + c * cell}" y="${28 + r * cell}" width="${cell}" height="${cell}"/>`;
    } else {
      const fraction = Math.min(1, v.x / Number(square)), h = size * fraction;
      cells = `<rect class="missing" x="28" y="28" width="${size}" height="${size}"/><rect class="filled" x="28" y="${28 + size - h}" width="${size}" height="${h}"/>`;
    }
    return `<svg viewBox="0 0 204 205" role="img" aria-label="${side} × ${side} = ${v.square}${exact ? '' : ' · ' + t('thu nhỏ', 'scaled')}"><text x="101" y="17" text-anchor="middle">${side}</text>${cells}<rect class="outline" x="28" y="28" width="${size}" height="${size}"/><text x="101" y="195" text-anchor="middle">${exact ? t('1 ô = 1 đơn vị', '1 cell = 1 unit') : t('Hình thu nhỏ', 'Scaled picture')}</text></svg>`;
  }
  function rangePicture() {
    if (final) return '';
    const domain = v.x <= 24 && v.x >= 2 ? { lo: 1, hi: Math.floor(v.x / 2) } : v.window;
    if (!domain || v.lo === null) return `<div class="s69-base">${v.x < 2 ? 'x &lt; 2 → ' + t('trả về x', 'return x') : t('Chuẩn bị khoảng tìm kiếm', 'Prepare the search range')}</div>`;
    if (v.lo > v.hi) return `<div class="s69-empty-range">∅ <code>lo = ${v.lo} &gt; hi = ${v.hi}</code></div>`;
    const count = domain.hi - domain.lo + 1;
    if (count <= 12 && domain.hi <= 9999) {
      const cells = Array.from({ length: count }, (_, i) => {
        const value = domain.lo + i, current = value === v.mid && side !== null;
        return `<span class="s69-candidate${value < v.lo || value > v.hi ? ' removed' : ''}${current ? ' current' : ''}"><small>${[value === v.lo ? 'lo' : '', current ? 'mid' : '', value === v.hi ? 'hi' : ''].filter(Boolean).join(' · ') || '·'}</small><b>${value}</b></span>`;
      }).join('');
      return `<div class="s69-range"><small>${t('Khoảng tìm kiếm', 'Search range')}</small><div class="s69-candidates">${cells}</div></div>`;
    }
    const position = value => 20 + Math.max(0, Math.min(count, value - domain.lo)) / count * 480;
    const left = position(v.lo), right = position(v.hi + 1), mid = v.mid === null ? 0 : position(v.mid + .5);
    return `<div class="s69-range"><small>${t('Phóng to khoảng vừa xét', 'Zoomed search window')} [${domain.lo}, ${domain.hi}]</small><svg class="s69-range-bar" viewBox="0 0 520 80" role="img" aria-label="lo=${v.lo}, hi=${v.hi}${side !== null ? ', mid=' + v.mid : ''}"><rect class="discarded" x="20" y="12" width="480" height="24" rx="5"/><rect class="remaining" x="${left}" y="12" width="${Math.max(0, right - left)}" height="24" rx="5"/>${side !== null ? `<path class="mid-pointer" d="M${mid - 5},47 L${mid + 5},47 L${mid},37 Z"/><text x="${Math.min(440, Math.max(80, mid))}" y="67" text-anchor="middle">mid = ${v.mid}</text>` : ''}</svg></div>`;
  }
  const delta = square === null ? null : BigInt(v.x) - square;
  const extraCells = delta !== null && delta > 0n && side <= 10 ? `<div class="s69-extra" aria-label="${delta} ${t('ô dư', 'spare cells')}">${Array.from({ length: Math.min(Number(delta), 12) }, () => '<i></i>').join('')}${delta > 12n ? `<small>+${delta - 12n}</small>` : ''}</div>` : '';
  const spare = delta === null ? '' : `<div class="s69-spare${delta < 0n ? ' missing' : ''}">${delta === 0n ? t('Vừa đủ ✓', 'Exact fit ✓') : delta > 0n ? `${t('Dư', 'Spare')} ${delta} ${t('ô', 'cells')}` : `${t('Thiếu', 'Missing')} ${-delta} ${t('ô', 'cells')}`}</div>${extraCells}`;
  const comparison = square === null ? '' : `<div class="s69-compare"><div><small>${final ? 'a × a' : 'mid × mid'} = ${side} × ${side}</small><strong>${v.square}</strong></div><b class="${cmp === '>' ? 'too-big' : 'fits'}">${esc(cmp)}</b><div><small>x</small><strong>${v.x}</strong></div></div>`;
  const moved = v.cut ? `<div class="s69-move"><b>${v.event === 'raise-lo' ? 'lo → ' + v.lo : 'hi ← ' + v.hi}</b><span>${t('Bỏ', 'Drop')} [${v.cut[0]}, ${v.cut[1]}]</span></div>` : '';
  const check = v.check === null ? '' : `<div class="s69-check"><code>${esc(v.source.replace(/^(if|while) /, '').replace(/:$/, ''))}</code><b>${v.check ? 'True ✓' : 'False ✕'}</b></div>`;
  const proof = final ? `<div class="s69-proof"><span>${t('Đáp án', 'Answer')}</span><strong>${v.answer}</strong><code>${v.square} ≤ ${v.x} &lt; ${BigInt(v.answer + 1) * BigInt(v.answer + 1)}</code><small>a² ≤ x &lt; (a+1)²</small></div>` : '';
  const history = v.history.map(item => `<span><small>[${item.lo}, ${item.hi}]</small><code>${item.mid}² ${BigInt(item.square) < BigInt(v.x) ? '&lt;' : BigInt(item.square) > BigInt(v.x) ? '&gt;' : '='} x</code><b>${item.move === 'found' ? '✓' : item.move === 'right' ? 'lo →' : '← hi'}</b></span>`).join('');
  $("treeView").innerHTML = `<section class="s69-viz" aria-label="${t('69 · Tìm căn nguyên', '69 · Integer square root')}">
    <header><strong>69 · Sqrt(x)</strong><button type="button" data-s69-next ${final ? 'disabled' : ''}>${t('Lượt tiếp', 'Next round')} ⏭</button><button type="button" data-s69-result>${t('Kết quả', 'Result')}</button></header>
    <div class="s69-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>
    <div class="s69-vars"><span><small>x</small><b>${v.x}</b></span><span><small>lo</small><b>${v.lo ?? '—'}</b></span><span><small>mid</small><b>${v.mid ?? '—'}</b></span><span><small>hi</small><b>${v.hi ?? '—'}</b></span></div>
    ${rangePicture()}
    <div class="s69-square-panel"><div class="s69-square"><small>${final ? t('Cạnh đáp án a', 'Answer side a') : 'mid × mid'}</small>${squarePicture()}</div><div class="s69-math">${comparison}${spare}${moved}${check}</div></div>
    ${proof}
    ${history ? `<div class="s69-history"><small>${t('Các lượt đã xong', 'Completed rounds')}</small><div>${history}</div></div>` : ''}
    <div class="s69-examples">${[0, 1, 8, 9, 2147483647].map(x => `<button type="button" data-s69-example="${x}">x = ${x}</button>`).join('')}</div>
  </section>`;
  const host = $("treeView");
  host.querySelector('[data-s69-result]').addEventListener('click', () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelector('[data-s69-next]').addEventListener('click', () => {
    const target = steps.findIndex((s, i) => i > stepIndex && s.sqrt69View?.event === 'mid');
    stopPlay(); stepIndex = target < 0 ? steps.length - 1 : target; renderStep();
  });
  host.querySelectorAll('[data-s69-example]').forEach(button => button.addEventListener('click', () => { $('arrInput').value = button.dataset.s69Example; runViz(); }));
}
