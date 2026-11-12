function renderContinuousIncreasing674(step) {
  const view = step.continuous674View;
  const host = $('treeView');
  const isVi = lang === 'vi';
  const t = (vi, en) => isVi ? vi : en;
  const esc = value => escapeHtml(String(value ?? '—'));
  const nums = step.arr || [];
  const maxVisible = 20;
  const focusIndex = view.index ?? view.bestStart ?? 0;
  let start = 0;
  let end = nums.length;
  if (nums.length > maxVisible) {
    start = Math.max(0, Math.min(nums.length - maxVisible, focusIndex - Math.floor(maxVisible / 2)));
    end = start + maxVisible;
  }

  const inRange = (index, first, last) => first !== null && last !== null && index >= first && index <= last;
  const cells = [];
  if (start > 0) cells.push(`<span class="ci674-gap">${start}…</span>`);
  for (let index = start; index < end; index += 1) {
    const active = inRange(index, view.runStart, view.runEnd);
    const best = inRange(index, view.bestStart, view.bestEnd);
    const current = index === view.index;
    const previous = index === view.previousIndex;
    const future = index > view.scannedThrough && !current;
    const classes = [
      'ci674-cell',
      active ? 'active-run' : '',
      best ? 'best-run' : '',
      current ? 'current-value' : '',
      previous ? 'previous-value' : '',
      future ? 'future-value' : '',
    ].filter(Boolean).join(' ');
    cells.push(`<div class="${classes}" aria-label="${t('Chỉ số','Index')} ${index}: ${esc(nums[index])}">
      <small>${index}</small><b>${esc(nums[index])}</b>
      <span>${step.sub?.[index] || '·'}</span>
    </div>`);
    if (index < end - 1) {
      const compared = index === view.previousIndex && index + 1 === view.index;
      const rising = nums[index + 1] > nums[index];
      const scanned = index + 1 <= view.scannedThrough || index + 1 === view.index;
      const edgeClass = [
        'ci674-edge',
        compared ? (view.increasing ? 'edge-pass' : 'edge-break') : '',
        !scanned ? 'edge-future' : '',
      ].filter(Boolean).join(' ');
      cells.push(`<span class="${edgeClass}" aria-hidden="true">${scanned ? (rising ? '↗' : '↘') : '·'}</span>`);
    }
  }
  if (end < nums.length) cells.push(`<span class="ci674-gap">…${nums.length - end}</span>`);

  const runCells = (first, last, limit = 10) => {
    if (first === null || last === null || last < first) return `<b class="ci674-none">∅</b>`;
    const count = last - first + 1;
    const indices = count <= limit
      ? Array.from({ length: count }, (_, offset) => first + offset)
      : [
        ...Array.from({ length: Math.ceil(limit / 2) }, (_, offset) => first + offset),
        ...Array.from({ length: Math.floor(limit / 2) }, (_, offset) => last - Math.floor(limit / 2) + 1 + offset),
      ];
    return indices.map((index, offset) =>
      `${offset && index > indices[offset - 1] + 1 ? '<i>…</i>' : ''}<b>${esc(nums[index])}</b>`).join('<i>›</i>');
  };

  const progress = view.n === 0 ? 0 : Math.max(0, (view.scannedThrough + 1) / view.n * 100);
  const cursor = view.n && view.index !== null ? Math.min(100, (view.index + 0.5) / view.n * 100) : 0;
  const comparison = view.previousIndex === null
    ? `<span class="ci674-no-compare">—</span>`
    : `<b>${esc(view.previousValue)}</b><span class="ci674-operator">${view.increasing ? '<' : '≥'}</span><b>${esc(view.value)}</b><strong class="${view.increasing ? 'pass' : 'break'}">${view.increasing ? '✓' : '↻'}</strong>`;
  const result = view.final
    ? `<footer class="ci674-result"><span>★ ${view.best}</span><div>${runCells(view.bestStart, view.bestEnd)}</div></footer>`
    : '';

  const directionText = view.action === 'reset'
    ? t('bắt đầu lại','restart')
    : view.action === 'extend'
      ? t('nối dài','extend')
      : view.action === 'best'
        ? (view.improved ? t('kỷ lục mới','new record') : t('giữ kỷ lục','record holds'))
        : view.final
          ? t('xong','done')
          : '';
  const empty = nums.length === 0;

  host.innerHTML = `<section class="ci674-viz">
    <header class="ci674-heading"><b>#674 · ${t('Đoạn tăng liên tục dài nhất','Longest Increasing Run')}</b><span>${stepIndex + 1}/${steps.length}</span></header>
    <div class="ci674-metrics">
      <div><small>i</small><b>${view.index === null ? '—' : view.index}</b></div>
      <div class="cur"><small>cur</small><b>${view.cur}</b></div>
      <div class="best"><small>best</small><b>${view.best}</b></div>
    </div>
    <section class="ci674-diagram">
      <div class="ci674-progress"><span style="width:${progress}%"></span><i style="left:${cursor}%"></i></div>
      <div class="ci674-array">${cells.join('') || `<span class="ci674-empty">${t('∅ mảng rỗng','∅ empty array')}</span>`}</div>
      <div class="ci674-key"><span class="key-current">● ${t('đang xét','checking')}</span><span class="key-run">━ ${t('cur','current')}</span><span class="key-best">━ ${t('best','longest')}</span></div>
    </section>
    <div class="ci674-compare-row">
      <div class="ci674-comparison ${view.increasing === null ? 'pending' : view.increasing ? 'rising' : 'break'}">${comparison}</div>
      <strong class="ci674-action">${empty ? '∅' : directionText}</strong>
    </div>
    <div class="ci674-runs">
      <section class="cur"><small>cur · ${view.cur}</small><div>${runCells(view.runStart, view.runEnd)}</div></section>
      <section class="best"><small>best · ${view.best}</small><div>${runCells(view.bestStart, view.bestEnd)}</div></section>
    </div>
    ${result}
  </section>`;
}
