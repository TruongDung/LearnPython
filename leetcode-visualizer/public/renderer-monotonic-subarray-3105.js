function renderMonotonicSubarray3105(step) {
  const view = step.monotonic3105View;
  const host = $('treeView');
  const isVi = lang === 'vi';
  const t = (vi, en) => isVi ? vi : en;
  const esc = value => escapeHtml(String(value ?? '—'));
  const nums = step.arr || [];
  const direction = view.relation === 'up' ? 'up'
    : view.relation === 'down' ? 'down'
      : view.relation === 'equal' ? 'equal' : 'none';
  const maxVisible = 20;
  const focusIndex = view.index ?? view.bestStart ?? 0;
  let start = 0;
  let end = nums.length;
  if (nums.length > maxVisible) {
    start = Math.max(0, Math.min(nums.length - maxVisible, focusIndex - Math.floor(maxVisible / 2)));
    end = start + maxVisible;
  }
  const inRange = (index, range) => range !== null && index >= range[0] && index <= range[1];
  const cells = [];
  if (start > 0) cells.push(`<span class="mono3105-gap">${start}…</span>`);
  for (let index = start; index < end; index += 1) {
    const currentUp = inRange(index, view.increasingRange);
    const currentDown = inRange(index, view.decreasingRange);
    const best = view.bestStart !== null && index >= view.bestStart && index <= view.bestEnd;
    const current = index === view.index;
    const previous = index === view.previousIndex;
    const scanned = index <= view.scannedThrough || current;
    const classes = [
      'mono3105-cell',
      currentUp ? 'run-up' : '',
      currentDown ? 'run-down' : '',
      best ? 'best' : '',
      current ? 'current' : '',
      previous ? 'previous' : '',
      !scanned ? 'future' : '',
    ].filter(Boolean).join(' ');
    cells.push(`<div class="${classes}" aria-label="${t('Chỉ số','Index')} ${index}: ${esc(nums[index])}">
      <small>${index}</small><b>${esc(nums[index])}</b><span class="mono3105-pointer">${current ? '▼' : ''}</span>
    </div>`);
    if (index < end - 1) {
      const compared = index === view.previousIndex && index + 1 === view.index;
      const edgeScanned = index + 1 <= view.scannedThrough || index + 1 === view.index;
      const relation = nums[index + 1] > nums[index] ? 'up'
        : nums[index + 1] < nums[index] ? 'down' : 'equal';
      const edgeClass = [
        'mono3105-edge',
        edgeScanned ? `edge-${relation}` : 'edge-future',
        compared ? 'edge-active' : '',
      ].filter(Boolean).join(' ');
      const mark = !edgeScanned ? '·' : relation === 'up' ? '↗' : relation === 'down' ? '↘' : '×';
      cells.push(`<span class="${edgeClass}" aria-hidden="true">${mark}</span>`);
    }
  }
  if (end < nums.length) cells.push(`<span class="mono3105-gap">…${nums.length - end}</span>`);

  const runText = range => {
    if (!range) return '';
    const [first, last] = range;
    const length = last - first + 1;
    const indices = length <= 10
      ? Array.from({ length }, (_, offset) => first + offset)
      : [
        ...Array.from({ length: 5 }, (_, offset) => first + offset),
        ...Array.from({ length: 5 }, (_, offset) => last - 4 + offset),
      ];
    const sequence = indices.map((index, offset) =>
      `${offset && index > indices[offset - 1] + 1 ? '<i>…</i>' : ''}<b>${esc(nums[index])}</b>`).join('<i>›</i>');
    return `<span class="mono3105-sequence">${sequence}</span><small>${first}–${last}</small>`;
  };
  const bestRange = view.bestStart === null ? null : [view.bestStart, view.bestEnd];
  const bestDirection = view.bestDirection === 'up' ? '↗' : view.bestDirection === 'down' ? '↘' : '•';
  const result = view.final
    ? `<section class="mono3105-result" aria-label="${t('Đáp án','Answer')}"><b>★ ${view.best}</b><span>${bestDirection}</span>${runText(bestRange)}</section>`
    : '';
  const comparison = view.relation === null ? '' : `
    <div class="mono3105-compare ${direction}" aria-label="${t('So sánh hai số kề nhau','Compare adjacent values')}">
      <span>${esc(view.previousValue)}</span>
      <b>${view.relation === 'up' ? '&lt;' : view.relation === 'down' ? '&gt;' : '='}</b>
      <span>${esc(view.value)}</span>
      <strong>${view.relation === 'up' ? '↗' : view.relation === 'down' ? '↘' : '×'}</strong>
    </div>`;

  host.innerHTML = `<section class="mono3105-viz">
    <header class="mono3105-heading"><strong>#3105</strong><span>${stepIndex + 1}/${steps.length}</span></header>
    <div class="mono3105-metrics">
      <article class="up" aria-label="${t('Độ dài tăng','Increasing length')}"><small>↗</small><b>${view.increasing}</b></article>
      <article class="down" aria-label="${t('Độ dài giảm','Decreasing length')}"><small>↘</small><b>${view.decreasing}</b></article>
      <article class="best" aria-label="${t('Độ dài tốt nhất','Best length')}"><small>★</small><b>${view.best}</b></article>
    </div>
    <section class="mono3105-panel">
      <div class="mono3105-array-scroll"><div class="mono3105-array">${cells.join('') || `<span class="mono3105-empty">${t('Mảng rỗng','Empty array')}</span>`}</div></div>
      <div class="mono3105-legend" aria-hidden="true"><span class="legend-up">↗ ${t('tăng','up')}</span><span class="legend-down">↘ ${t('giảm','down')}</span><span class="legend-best">★ ${t('tốt nhất','best')}</span><span class="legend-current">▼ ${t('đang xét','current')}</span></div>
    </section>
    ${comparison}
    ${result}
  </section>`;
}

if (!ORDERED_RENDERER_REGISTRY.some(({ predicate }) => predicate({ monotonic3105View: {} }))) {
  ORDERED_RENDERER_REGISTRY.push({
    predicate: (step) => Boolean(step.monotonic3105View),
    surface: 'treeView',
    render: (step) => { renderMonotonicSubarray3105(step); },
  });
}
