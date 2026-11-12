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
  const relationText = view.relation === null
    ? view.final
      ? t('Quét xong · xem kết quả bên dưới.', 'Scan complete · see the result below.')
      : t('Chưa có cặp nào cần so sánh.', 'No pair to compare yet.')
    : `${esc(view.previousValue)} ${view.relation === 'up' ? '<' : view.relation === 'down' ? '>' : '='} ${esc(view.value)}`;
  const explanation = view.action === 'compare'
    ? view.relation === 'up'
      ? t('Số sau lớn hơn số trước: đoạn tăng sẽ dài thêm 1.', 'The next value is larger: the increasing run will grow by 1.')
      : view.relation === 'down'
        ? t('Số sau nhỏ hơn số trước: đoạn giảm sẽ dài thêm 1.', 'The next value is smaller: the decreasing run will grow by 1.')
        : t('Hai số bằng nhau: không còn tăng hay giảm nghiêm ngặt.', 'The values are equal: neither strict increase nor decrease continues.')
    : view.action === 'update'
      ? view.relation === 'up'
        ? t('Tăng: giữ increasing và đặt decreasing về 1.', 'Up: extend increasing and reset decreasing to 1.')
        : view.relation === 'down'
          ? t('Giảm: giữ decreasing và đặt increasing về 1.', 'Down: extend decreasing and reset increasing to 1.')
          : t('Bằng nhau: bắt đầu lại cả hai độ dài từ 1.', 'Equal: restart both run lengths at 1.')
      : view.action === 'best'
        ? view.improved
          ? t('Đoạn đang chạy dài hơn kỷ lục cũ; cập nhật best.', 'A current run beats the previous record; update best.')
          : t('So sánh hai độ dài hiện tại với kỷ lục best.', 'Compare both current run lengths with best.')
        : view.final
          ? t('Đã xét hết mảng; đáp án là độ dài lớn nhất đã gặp.', 'The full array has been scanned; the answer is the longest run seen.')
          : t('Đoạn chỉ tiếp tục khi mọi cặp kề nhau đều tăng hoặc đều giảm nghiêm ngặt.', 'A run continues only while every adjacent pair is strictly increasing or strictly decreasing.');

  const maxVisible = 28;
  const focusIndex = view.index ?? view.bestStart ?? 0;
  let start = 0;
  let end = nums.length;
  if (nums.length > maxVisible) {
    start = Math.max(0, Math.min(nums.length - maxVisible, focusIndex - Math.floor(maxVisible / 2)));
    end = start + maxVisible;
  }
  const inRange = (index, range) => range !== null && index >= range[0] && index <= range[1];
  const cells = [];
  if (start > 0) cells.push(`<span class="mono3105-gap">${start} ${t('ẩn','hidden')}</span>`);
  for (let index = start; index < end; index += 1) {
    const currentUp = inRange(index, view.increasingRange);
    const currentDown = inRange(index, view.decreasingRange);
    const best = view.bestStart !== null && index >= view.bestStart && index <= view.bestEnd;
    const current = index === view.index;
    const previous = index === view.previousIndex;
    const scanned = index <= view.scannedThrough || index === view.index;
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
      <small>[${index}]</small><b>${esc(nums[index])}<${current ? 'i' : 'span'}>${current ? '●' : '·'}</${current ? 'i' : 'span'}></b>
    </div>`);
  }
  if (end < nums.length) cells.push(`<span class="mono3105-gap">${nums.length - end} ${t('ẩn','hidden')}</span>`);

  const runText = (range, maxItems = 12) => {
    if (!range) return `<small class="mono3105-empty">${t('chưa có','none yet')}</small>`;
    const [first, last] = range;
    const length = last - first + 1;
    const indices = length <= maxItems
      ? Array.from({ length }, (_, offset) => first + offset)
      : [
        ...Array.from({ length: Math.ceil(maxItems / 2) }, (_, offset) => first + offset),
        ...Array.from({ length: Math.floor(maxItems / 2) }, (_, offset) => last - Math.floor(maxItems / 2) + 1 + offset),
      ];
    const sequence = indices.map((index, offset) =>
      `${offset && index > indices[offset - 1] + 1 ? '<i>…</i>' : ''}<b>${esc(nums[index])}</b>`).join('<i>→</i>');
    return `<span class="mono3105-sequence">${sequence}</span><small>${t('chỉ số','indices')} ${first}–${last} · ${length} ${t('phần tử','values')}</small>`;
  };
  const bestRange = view.bestStart === null ? null : [view.bestStart, view.bestEnd];
  const bestDirection = view.bestDirection === 'up'
    ? t('tăng dần','increasing')
    : view.bestDirection === 'down'
      ? t('giảm dần','decreasing')
      : t('một phần tử','single value');
  const result = view.final
    ? `<section class="mono3105-result"><small>${t('ĐOẠN ĐƠN ĐIỆU DÀI NHẤT','LONGEST MONOTONIC SUBARRAY')}</small><strong>${view.best}</strong><div><b>${bestDirection}</b>${runText(bestRange)}</div></section>`
    : '';

  host.innerHTML = `<section class="mono3105-viz">
    <header class="mono3105-heading"><strong>#3105 · ${t('Đoạn tăng hoặc giảm nghiêm ngặt dài nhất','Longest Increasing or Decreasing Subarray')}</strong><span>${t('Bước','Step')} ${stepIndex + 1}/${steps.length}</span></header>
    <p class="mono3105-rule">${t('Đoạn con phải liên tục. Tất cả cặp kề nhau phải tăng nghiêm ngặt hoặc tất cả phải giảm nghiêm ngặt; hai số bằng nhau sẽ ngắt cả hai hướng.','The subarray must be contiguous. Every adjacent pair must strictly rise or every pair must strictly fall; equal values break both directions.')}</p>
    <div class="mono3105-metrics">
      <article class="up"><small>↗ ${t('tăng','increasing')}</small><b>${view.increasing}</b><span>${t('độ dài đoạn tăng hiện tại','current increasing run')}</span></article>
      <article class="down"><small>↘ ${t('giảm','decreasing')}</small><b>${view.decreasing}</b><span>${t('độ dài đoạn giảm hiện tại','current decreasing run')}</span></article>
      <article class="best"><small>★ best</small><b>${view.best}</b><span>${t('đoạn đơn điệu dài nhất','longest run so far')}</span></article>
    </div>
    <section class="mono3105-panel">
      <header><b>nums</b><span>${view.n} ${t('phần tử','values')}</span></header>
      <div class="mono3105-array-scroll"><div class="mono3105-array">${cells.join('') || `<span class="mono3105-empty">${t('Mảng rỗng','Empty array')}</span>`}</div></div>
      <div class="mono3105-legend"><span class="legend-up">↗ ${t('đoạn tăng hiện tại','current increasing run')}</span><span class="legend-down">↘ ${t('đoạn giảm hiện tại','current decreasing run')}</span><span class="legend-best">★ ${t('đoạn tốt nhất','best run')}</span><span class="legend-current">● ${t('đang xét','current value')}</span></div>
    </section>
    <div class="mono3105-explain">
      <section class="mono3105-panel mono3105-comparison ${direction}">
        <small>${t('SO SÁNH CẶP KỀ NHAU','ADJACENT COMPARISON')}</small><b>${relationText}</b><span>${explanation}</span>
      </section>
      <section class="mono3105-panel mono3105-runs">
        <div class="run-up"><small>↗ ${t('ĐOẠN TĂNG HIỆN TẠI','CURRENT INCREASING RUN')}</small><b>${view.increasing}</b>${runText(view.increasingRange)}</div>
        <div class="run-down"><small>↘ ${t('ĐOẠN GIẢM HIỆN TẠI','CURRENT DECREASING RUN')}</small><b>${view.decreasing}</b>${runText(view.decreasingRange)}</div>
      </section>
    </div>
    ${result}
    <footer class="mono3105-footnote">${t('Quy tắc: tăng thì chỉ kéo dài increasing; giảm thì chỉ kéo dài decreasing; bằng nhau thì cả hai khởi động lại từ 1.', 'Rule: rising extends only increasing; falling extends only decreasing; equality restarts both at 1.')}</footer>
  </section>`;
}

if (!ORDERED_RENDERER_REGISTRY.some(({ predicate }) => predicate({ monotonic3105View: {} }))) {
  ORDERED_RENDERER_REGISTRY.push({
    predicate: (step) => Boolean(step.monotonic3105View),
    surface: 'treeView',
    render: (step) => { renderMonotonicSubarray3105(step); },
  });
}
