function renderScheduler2365View(step) {
  const v = step.scheduler2365View, host = $('treeView');
  const t = (vi, en) => lang === 'vi' ? vi : en, esc = value => escapeHtml(String(value ?? '—'));
  const kinds = [...new Set(v.tasks)], colors = ['#38bdf8', '#c4a1ff', '#fbbf24', '#34d399', '#fb7185', '#2dd4bf', '#fb923c', '#a3e635'];
  const color = task => `--ts2365-task:${colors[kinds.indexOf(task) % colors.length]}`;
  const events = {initialize: t('Khởi tạo', 'Initialize'), select: t('Task kế tiếp', 'Next task'), advance: t('Ngày kế tiếp', 'Next day'),
    check: t('Tra lần trước', 'Look up last run'), wait: t('Nhảy qua ngày nghỉ', 'Jump over idle days'), ready: t('Đã đủ khoảng chờ', 'Cooldown satisfied'),
    execute: t('Làm task', 'Run task'), 'loop-end': t('Hết task', 'No more tasks'), return: t('Kết quả', 'Result')};
  const presets = [
    [t('Ví dụ 1', 'Example 1'), '1,2,1,2,3,1', 3],
    [t('Ví dụ 2', 'Example 2'), '5,8,8,5', 2],
    [t('Đã đủ khoảng chờ', 'Cooldown already met'), '1,2,3,1', 2],
    [t('Liên tục cùng loại', 'Repeated task'), '7,7,7,7,7', 5],
    [t('Một task', 'One task'), '9', 1],
  ];
  const later = event => steps.findIndex((s, i) => i > stepIndex && s.scheduler2365View?.event === event);
  const taskChip = task => `<b class="ts2365-task" style="${color(task)}">${esc(task)}</b>`;
  const runStep = index => v.scheduled.find(row => row.index === index)?.step ?? -1;
  const input = `<section class="ts2365-panel"><header><b>${t('Thứ tự cố định', 'Fixed order')}</b><small>${v.completed}/${v.tasks.length}</small></header><div class="ts2365-input">${v.tasks.map((task, i) => `<button type="button" class="${i === v.active ? 'current' : ''} ${i < v.completed ? 'done' : ''}" data-ts2365-index="${i}"${runStep(i) < 0 ? ' disabled' : ''}><small>${i}</small>${taskChip(task)}<span>${i < v.completed ? '✓' : i === v.active ? '▼' : '○'}</span></button>`).join('<i>→</i>')}</div></section>`;
  const completed = v.active !== null && v.scheduled.some(row => row.index === v.active);
  const ghost = v.active !== null && v.candidate !== null && !completed;
  const idleTile = (start, end, pending = false) => {
    const count = end - start + 1;
    if (count <= 6) return Array.from({length: count}, (_, i) => `<div class="ts2365-day rest ${pending ? 'pending' : ''}" data-ts2365-rest="${start + i}"><small>D${start + i}</small><b>☾</b></div>`).join('');
    return `<div class="ts2365-day rest range ${pending ? 'pending' : ''}" data-ts2365-rest-range="${start}:${end}"><small>D${start}–${end}</small><b>↠</b><span>${count} ${t('ngày nghỉ', 'idle days')}</span></div>`;
  };
  const taskTile = row => `<button type="button" class="ts2365-day ${row.index === v.active ? 'current' : ''}" data-ts2365-step="${row.step}" data-ts2365-day="${row.start}"><small>D${row.start}</small>${taskChip(row.task)}</button>`;
  const pendingRest = ghost && v.day > v.candidate ? idleTile(v.candidate, v.day - 1, true) : '';
  const timeline = `<section class="ts2365-panel"><header><b>${t('Lịch thực hiện', 'Schedule')}</b><small>☾ ${t('nghỉ', 'idle')} · ◌ ${t('sắp làm', 'pending')}</small></header><div class="ts2365-timeline" tabindex="0" role="region" aria-label="${t('Dòng thời gian theo ngày', 'Timeline by day')}">${v.timeline.map(row => row.kind === 'task' ? taskTile(row) : idleTile(row.start, row.end)).join('')}${pendingRest}${ghost ? `<div class="ts2365-day pending" data-ts2365-ghost="${v.day}"><small>D${v.day}</small>${taskChip(v.task)}</div>` : ''}${!v.timeline.length && !ghost ? '<div class="ts2365-empty">∅</div>' : ''}</div></section>`;
  const nextDay = v.candidate ?? '—';
  let rule = `<div class="ts2365-equation"><span>${t('Chọn task', 'Select a task')}</span><b>→</b><span>day + 1</span></div>`;
  if (v.completed === v.tasks.length && v.active === null) rule = `<div class="ts2365-equation"><b>${v.completed}</b><span>task +</span><b>${v.day - v.completed}</b><span>☾ =</span><b>${v.day}</b><span>${t('ngày', 'days')}</span></div>`;
  if (v.active !== null) {
    if (v.previous === null) rule = `<div class="ts2365-equation">${taskChip(v.task)}<span>${t('Lần đầu', 'First run')}</span><b>→ D${esc(nextDay)}</b></div>`;
    else {
      const days = v.space <= 6 ? Array.from({length: v.space}, (_, i) => {
        const day = v.previous + 1 + i, task = v.scheduled.find(row => row.start === day)?.task;
        return `<span class="ts2365-blocked"><small>D${day}</small>${task === undefined ? '<b>⏳</b>' : taskChip(task)}</span>`;
      }).join('') : `<span class="ts2365-blocked range"><small>D${v.previous + 1}–${v.earliest - 1}</small><b>⏳ ${v.space}</b></span>`;
      rule = `<small>${t('Cùng loại: phải có space ngày ở giữa', 'Same type: leave space days between runs')}</small><div class="ts2365-cooldown"><span class="ts2365-anchor"><small>D${v.previous}</small>${taskChip(v.task)}</span><div class="ts2365-window">${days}<small>space = ${v.space}</small></div><span class="ts2365-anchor ready"><small>≥ D${v.earliest}</small>${taskChip(v.task)}</span></div>
        <div class="ts2365-equation"><span>D${v.previous} + ${v.space} + 1</span><b>= D${v.earliest}</b></div>
        <div class="ts2365-max"><small>day = max(${esc(nextDay)}, ${v.earliest})</small><b>${['wait', 'ready', 'execute'].includes(v.event) ? `D${v.day}` : '…'}</b></div>`;
    }
  }
  const last = `<section class="ts2365-panel"><header><b>last[task]</b><small>${t('Ngày làm gần nhất', 'Last run day')}</small></header><div class="ts2365-map">${v.last.map(row => `<article class="${row.task === v.task ? 'current' : ''}">${taskChip(row.task)}<b>D${row.day}</b><small>${t('Lần sau', 'Next run')} ≥ D${row.day + v.space + 1}</small></article>`).join('') || '<span>∅</span>'}</div></section>`;
  host.innerHTML = `<section class="ts2365-viz"><header><b>#2365 · Task Scheduler II</b><small>${t('Dòng', 'Line')} ${v.line} · ${events[v.event]}</small></header><div class="ts2365-buttons">${presets.map(([label], i) => `<button type="button" data-ts2365-preset="${i}">${label}</button>`).join('')}</div><div class="ts2365-buttons">${['wait', 'execute'].map(event => `<button type="button" data-ts2365-event="${event}"${later(event) < 0 ? ' disabled' : ''}>${events[event]} →</button>`).join('')}</div>${input}<div class="ts2365-metrics"><article><small>day</small><b>${v.day}</b></article><article><small>space</small><b>${v.space}</b></article><article><small>${t('Đã làm', 'Completed')}</small><b>${v.completed}/${v.tasks.length}</b></article></div>${timeline}<section class="ts2365-panel ts2365-rule">${rule}</section>${last}${v.final ? `<div class="ts2365-answer" data-ts2365-answer="${v.answer}">✓ <b>${v.answer}</b> ${t('ngày', 'days')}</div>` : ''}<code class="ts2365-source">${esc(v.source)}</code></section>`;
  const jump = index => { if (index >= 0) { stepIndex = index; renderStep(); } };
  host.querySelectorAll?.('button').forEach(button => button.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
  }));
  host.querySelectorAll?.('[data-ts2365-preset]').forEach(button => button.addEventListener('click', () => {
    const preset = presets[Number(button.dataset.ts2365Preset)];
    $('arrInput').value = preset[1]; document.querySelector('[data-param="space"]').value = preset[2]; runViz();
  }));
  host.querySelectorAll?.('[data-ts2365-event]').forEach(button => button.addEventListener('click', () => jump(later(button.dataset.ts2365Event))));
  host.querySelectorAll?.('[data-ts2365-index]').forEach(button => button.addEventListener('click', () => jump(runStep(Number(button.dataset.ts2365Index)))));
  host.querySelectorAll?.('[data-ts2365-step]').forEach(button => button.addEventListener('click', () => jump(Number(button.dataset.ts2365Step))));
  const strip = host.querySelector?.('.ts2365-timeline');
  if (strip) strip.scrollLeft = strip.scrollWidth;
}
