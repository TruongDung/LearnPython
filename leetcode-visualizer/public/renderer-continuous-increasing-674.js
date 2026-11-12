function renderContinuousIncreasing674(step) {
  const view = step.continuous674View;
  const host = $('treeView');
  const isVi = lang === 'vi';
  const t = (vi, en) => isVi ? vi : en;
  const esc = value => escapeHtml(String(value ?? '—'));
  const nums = step.arr || [];
  const actionLabels = {
    scan: t('Bắt đầu quét mảng', 'Start scanning the array'),
    seed: t('Khởi tạo đoạn đầu tiên', 'Initialize the first run'),
    compare: t('So sánh hai phần tử kề nhau', 'Compare adjacent elements'),
    extend: t('Nối dài đoạn tăng', 'Extend the increasing run'),
    reset: t('Đứt đoạn · bắt đầu lại', 'Run breaks · reset'),
    best: t('Cập nhật kỷ lục', 'Check the longest run'),
    done: t('Kết quả cuối cùng', 'Final result'),
  };
  const actionTitle = actionLabels[view.action] || actionLabels.scan;
  const currentLength = view.cur || 0;
  const compareText = view.previousIndex === null
    ? t('Chưa có cặp nào được so sánh.', 'No pair has been compared yet.')
    : `${view.previousValue} ${view.increasing ? '<' : '≥'} ${view.value}`;
  const comparisonStatus = view.increasing === null
    ? 'pending'
    : view.increasing ? 'rising' : 'break';
  const comparisonMessage = view.action === 'compare'
    ? view.increasing
      ? t('Tăng nghiêm ngặt: nếu điều kiện đúng, cur sẽ tăng 1.', 'Strictly increasing: if true, cur grows by 1.')
      : t('Không tăng: đoạn cũ kết thúc, cur được đặt lại thành 1.', 'Not increasing: the old run ends and cur resets to 1.')
    : view.action === 'extend'
      ? t('Nối nums[i] vào cuối đoạn hiện tại.', 'Append nums[i] to the current run.')
      : view.action === 'reset'
        ? t('Đoạn cũ kết thúc vì số hiện tại không lớn hơn số trước; bắt đầu lại từ nums[i].', 'The previous run ends because the current value is not larger; restart at nums[i].')
        : view.action === 'best'
          ? view.improved
            ? t('Đoạn hiện tại dài hơn kỷ lục · cập nhật best.', 'The current run beats the record · update best.')
            : t('Đoạn hiện tại không dài hơn kỷ lục.', 'The current run does not beat the record.')
          : t('Chỉ nối khi số hiện tại lớn hơn số đứng ngay trước nó.', 'Extend only when the current value is greater than its immediate predecessor.');
  const maxVisible = 28;
  const focusIndex = view.index ?? view.bestStart ?? 0;
  let start = 0, end = nums.length;
  if (nums.length > maxVisible) {
    start = Math.max(0, Math.min(nums.length - maxVisible, focusIndex - Math.floor(maxVisible / 2)));
    end = start + maxVisible;
  }
  const cells = [];
  if (start > 0) cells.push(`<span class="ci674-ellipsis">${start} ${t('ẩn','hidden')}</span>`);
  for (let index = start; index < end; index++) {
    const active = view.runStart !== null && index >= view.runStart && index <= view.runEnd;
    const best = view.bestStart !== null && index >= view.bestStart && index <= view.bestEnd;
    const previous = index === view.previousIndex;
    const current = index === view.index;
    const future = index > view.scannedThrough;
    const classes = [
      'ci674-cell',
      active ? 'active-run' : '',
      best ? 'best-run' : '',
      previous ? 'previous-value' : '',
      current ? 'current-value' : '',
      future ? 'future-value' : '',
    ].filter(Boolean).join(' ');
    cells.push(`<div class="${classes}" aria-label="${t('Chỉ số','Index')} ${index}: ${esc(nums[index])}">
      <small>[${index}]</small><b>${esc(nums[index])}</b>
      ${step.sub?.[index] ? `<span>${t('dài','len')} ${esc(step.sub[index])}</span>` : '<span>·</span>'}
    </div>`);
  }
  if (end < nums.length) cells.push(`<span class="ci674-ellipsis">${nums.length - end} ${t('ẩn','hidden')}</span>`);

  const runText = (first, last, limit = 12) => {
    if (first === null || last === null || last < first) return `<span class="ci674-empty">${t('chưa có','none yet')}</span>`;
    const count = last - first + 1;
    const indices = count <= limit
      ? Array.from({ length: count }, (_, offset) => first + offset)
      : [...Array.from({ length: Math.ceil(limit / 2) }, (_, offset) => first + offset),
        ...Array.from({ length: Math.floor(limit / 2) }, (_, offset) => last - Math.floor(limit / 2) + 1 + offset)];
    return `<span class="ci674-run-indices">${indices.map((index, i) => `${i && index > indices[i - 1] + 1 ? '<i>…</i>' : ''}<b>${esc(nums[index])}</b>`).join('<i>→</i>')}</span>
      <small>${t('chỉ số','indices')} ${first}–${last} · ${count} ${t('phần tử','elements')}</small>`;
  };
  const progress = view.n === 0 ? 0 : Math.max(0, (view.scannedThrough + 1) / view.n * 100);
  const bestLeft = view.n && view.bestStart !== null ? view.bestStart / view.n * 100 : 0;
  const bestWidth = view.n && view.best > 0 ? view.best / view.n * 100 : 0;
  const cursorLeft = view.n && view.index !== null ? Math.min(100, (view.index + 0.5) / view.n * 100) : 0;
  const answerRange = view.bestStart === null
    ? `<span>${t('Mảng rỗng','Empty array')}</span>`
    : `<span>[${view.bestStart}…${view.bestEnd}]</span>${runText(view.bestStart, view.bestEnd)}`;
  const answer = view.final
    ? `<section class="ci674-answer"><small>${t('ĐỘ DÀI ĐOẠN TĂNG LIÊN TỤC DÀI NHẤT','LONGEST CONTIGUOUS INCREASING LENGTH')}</small><b>${view.best}</b><div>${answerRange}</div></section>`
    : '';

  host.innerHTML = `<section class="ci674-viz">
    <header class="ci674-heading"><b>#674 · ${t('Đoạn tăng liên tục dài nhất','Longest Continuous Increasing Subsequence')}</b>
      <span>${t('Bước','Step')} ${stepIndex + 1}/${steps.length}</span></header>
    <div class="ci674-metrics">
      <article><small>i</small><b>${view.index === null ? '—' : view.index}</b><span>${t('vị trí đang xét','current index')}</span></article>
      <article class="cur"><small>cur</small><b>${currentLength}</b><span>${t('đoạn tăng hiện tại','current run')}</span></article>
      <article class="best"><small>best</small><b>${view.best}</b><span>${t('kỷ lục đến lúc này','longest so far')}</span></article>
    </div>
    <section class="ci674-panel">
      <header><b>${t('Quét từ trái sang phải','Scan from left to right')}</b><small>${view.n} ${t('phần tử','elements')}</small></header>
      <div class="ci674-progress"><span style="width:${progress}%"></span><i style="left:${cursorLeft}%"></i><b style="left:${bestLeft}%;width:${bestWidth}%"></b></div>
      <div class="ci674-legend"><span class="current-legend">● ${t('đang xét','current')}</span><span class="run-legend">● ${t('đoạn hiện tại','current run')}</span><span class="best-legend">● ${t('đoạn tốt nhất','best run')}</span></div>
      <div class="ci674-array">${cells.join('') || `<span class="ci674-empty">${t('Mảng rỗng','Empty array')}</span>`}</div>
      <small class="ci674-array-help">${t('Số nhỏ dưới mỗi ô là độ dài đoạn tăng kết thúc tại chỉ số đó.','The small number under each cell is the increasing-run length ending at that index.')}</small>
    </section>
    <div class="ci674-explain-grid">
      <section class="ci674-panel ci674-comparison ${comparisonStatus}">
        <small>${t('SO SÁNH HAI SỐ KỀ NHAU','COMPARE ADJACENT VALUES')}</small>
        <b>${esc(compareText)}</b><span>${esc(comparisonMessage)}</span>
      </section>
      <section class="ci674-panel ci674-run-panel">
        <div><small>${t('ĐOẠN HIỆN TẠI · cur','CURRENT RUN · cur')}</small><b>${currentLength}</b>${runText(view.runStart, view.runEnd)}</div>
        <div><small>${t('KỶ LỤC · best','LONGEST SO FAR · best')}</small><b>${view.best}</b>${runText(view.bestStart, view.bestEnd)}</div>
      </section>
    </div>
    ${answer}
    <p class="ci674-rule">${t('Quy tắc: nums[i] > nums[i−1] thì nối dài đoạn hiện tại; bằng hoặc nhỏ hơn thì bắt đầu lại từ 1. best luôn giữ đoạn dài nhất đã gặp.', 'Rule: if nums[i] > nums[i−1], extend the current run; if equal or smaller, restart at 1. best remembers the longest run seen.')}</p>
  </section>`;
}
