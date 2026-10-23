function renderK3644View(step) {
  const v = step.k3644View || {};
  const vi = lang === 'vi';
  const t = (viText, enText = viText) => vi ? viText : enText;
  const currentIndex = v.current?.index ?? null;
  const tileRows = (v.nums || []).map(({ index, value, misplaced }, position, all) => {
    const current = index === currentIndex;
    const state = misplaced ? 'misplaced' : 'home';
    const gap = position > 0 && index - all[position - 1].index > 1 ? '<span class="k3644-gap">···</span>' : '';
    return `${gap}<div class="k3644-tile ${state} ${current ? 'current' : ''}"><small>i=${index}</small><strong>${value}</strong><span>${misplaced ? `↘ ${value}` : '✓'}</span></div>`;
  }).join('');
  const stages = [
    { label: t('Tìm số lệch', 'Find misplaced'), active: v.line === 4 || v.line === 5 },
    { label: t('Giao bit', 'Intersect bits'), active: v.line === 3 || v.line === 6 },
    { label: t('Lấy k lớn nhất', 'Largest k'), active: v.line === 7 || step.final },
  ].map(({ label, active }) => `<span class="${active ? 'active' : ''}"><i></i>${label}</span>`).join('');
  const update = v.maskUpdate;
  const rows = [];
  if (v.commonBits != null) rows.push({ label: 'k', bits: update ? v.beforeBits : v.commonBits, kind: 'common' });
  if (v.valueBits != null) rows.push({ label: t('số', 'value'), bits: v.valueBits, kind: 'value' });
  if (update) rows.push({ label: 'k mới', bits: v.afterBits, kind: 'result' });
  const bitCells = rows.map((row) => `<div class="k3644-bit-row ${row.kind}"><b>${row.label}</b>${[...row.bits].map((bit, offset) => {
    const index = offset;
    const removed = update && row.kind === 'common' && bit === '1' && update.after.toString(2).padStart(v.width, '0')[index] === '0';
    const resultBit = update && row.kind === 'result' && bit === '1';
    return `<span class="${removed ? 'removed' : resultBit ? 'kept' : bit === '1' ? 'on' : 'off'}">${bit}</span>`;
  }).join('')}</div>`).join('');
  const bitLabels = `<div class="k3644-bit-row bit-labels"><b></b>${Array.from({ length: v.width || 1 }, (_, offset) => `<small>${(v.width || 1) - offset - 1}</small>`).join('')}</div>`;
  const op = update
    ? `<div class="k3644-operation"><b>${update.before}</b><span>&amp;</span><b>${update.value}</b><span>=</span><strong>${update.after}</strong><small>${v.beforeBits} &amp; ${v.valueBits} = ${v.afterBits}</small></div>`
    : `<div class="k3644-operation idle"><strong>${v.commonBits ?? '—'}</strong><small>${v.comparison ? (v.comparison.misplaced ? t('sai chỗ → phải giữ bit chung', 'misplaced → must keep shared bits') : t('đúng chỗ → bỏ qua', 'already home → skip')) : t('bắt đầu từ toàn bit 1', 'start with every bit set')}</small></div>`;
  const line = Number.isInteger(v.line) ? `L${v.line}` : t('XONG', 'DONE');
  const title = step.title ? (typeof pick === 'function' ? pick(step.title) : step.title.vi || step.title.en || '') : '';
  const answer = step.final ? v.answer : null;
  const candidate = answer == null
    ? (v.common == null || (v.common === -1 && !v.loopFinished) ? '—' : Math.max(v.common, 0))
    : answer;
  const summary = Boolean(v.preview);

  $('treeView').innerHTML = `<section class="k3644-viz" aria-label="LeetCode 3644 Maximum K to Sort a Permutation">
    <header><div><small>LEETCODE 3644</small><strong>${t('SẮP XẾP HOÁN VỊ', 'SORT THE PERMUTATION')}</strong></div><b class="k3644-line">${summary ? t('HÌNH XEM TRƯỚC', 'PREVIEW') : line}</b></header>
    ${!summary ? `<div class="k3644-title">${title}</div>` : `<div class="k3644-title">${t('Mảng lớn được tính đầy đủ; hình chỉ hiện đầu và cuối.', 'The full array is processed; the picture shows its ends.')}</div>`}
    <nav class="k3644-stages">${stages}</nav>
    <section class="k3644-array"><header><b>${t('Vị trí', 'INDEX')}</b><span>${t('mũi tên = vị trí cần về', 'arrow = target index')}</span></header><div>${tileRows}</div><footer><span class="home">● ${t('đúng chỗ', 'home')}</span><span class="misplaced">● ${t('sai chỗ', 'misplaced')}</span><strong>${t(summary ? 'sai chỗ:' : 'đã gặp:', summary ? 'misplaced:' : 'checked:')} ${typeof v.misplaced === 'number' ? v.misplaced : v.misplacedCount}</strong></footer></section>
    <section class="k3644-mask"><header><b>${t('BIT GIAO NHAU', 'SHARED BITS')}</b><span>${update ? `${t('vị trí', 'index')} ${currentIndex}` : (v.commonBits ?? '')}</span></header>
      <div class="k3644-bits" style="--k3644-width:${v.width || 1}">${bitLabels}${bitCells}</div>${op}
      <footer><span class="kept">● ${t('bit còn chung', 'shared bit')}</span><span class="removed">● ${t('bit bị loại', 'dropped bit')}</span></footer>
    </section>
    <section class="k3644-answer"><span>${step.final ? t('K LỚN NHẤT', 'MAXIMUM K') : t('K CHUNG ĐẾN ĐÂY', 'COMMON K SO FAR')}</span><strong>${candidate}</strong>${step.final ? '' : `<small>${t('các bit 1 còn lại phải có trong mọi số sai chỗ', 'remaining 1-bits must exist in every misplaced value')}</small>`}</section>
  </section>`;
}
