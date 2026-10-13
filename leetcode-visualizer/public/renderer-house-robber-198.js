function renderHouseRobber198View(step) {
  const view = step.houseRobberView;
  if (!view || view.method === 'circular') return;
  const host = $("treeView");
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const nums = view.nums;
  const i = view.currentIndex;
  const rolling = view.method === 'rolling';
  const done = view.phase === 'done';
  const selected = new Set(view.robbed || []);
  const money = value => escapeHtml(String(value));
  const houseIcon = (value, mini = false) => `<svg class="h198-icon ${mini ? 'mini' : ''}" viewBox="0 0 64 60" aria-hidden="true"><path d="M5 25L32 5L59 25M11 22V55H53V22"/><text x="32" y="43" text-anchor="middle" class="${String(value).length > 4 ? 'small' : ''}">${money(value)}</text></svg>`;
  const start = nums.length <= 10 ? 0 : Math.max(0, i - 5);
  const end = Math.min(nums.length, start + 10);
  const houses = `${start ? `<span class="h198-more">0…${start - 1}</span>` : ''}${nums.slice(start, end).map((value, offset) => {
    const index = start + offset;
    const robbed = selected.has(index);
    const blocked = !robbed && (selected.has(index - 1) || selected.has(index + 1));
    return `<article class="h198-house ${robbed ? 'picked' : ''} ${index === i && !done ? 'current' : ''} ${index > i && !done ? 'future' : ''}" data-index="${index}" data-picked="${robbed}"><small>${index}</small>${houseIcon(value)}<b>${robbed ? '✓' : blocked ? '×' : '·'}</b></article>`;
  }).join('')}${end < nums.length ? '<span class="h198-more">…</span>' : ''}`;
  const plan = (indices, limit = 6) => indices.length ? `${indices.slice(0, limit).map(index => `<span class="h198-plan-house" title="${index}: ${money(nums[index])}"><small>${index}</small>${houseIcon(nums[index], true)}</span>`).join('')}${indices.length > limit ? `<small>+${indices.length - limit}</small>` : ''}` : '<span class="h198-empty">∅</span>';
  let choices = '';
  let f = view.formula;
  if (f) {
    const skip = rolling ? f.maxRob : f.skip.value;
    const before = rolling ? f.prevRob : f.rob.value;
    const amount = rolling ? f.money : f.rob.money;
    const rob = rolling ? f.robVal : f.rob.total;
    const best = rolling ? f.temp : f.result;
    const skipPath = rolling ? f.skipHouses : f.skip.houses;
    const robPath = rolling ? f.robHouses : f.rob.houses;
    const choice = (kind, value, indices, expression) => `<article class="h198-choice ${kind} ${f.chosen === kind ? 'winner' : ''}" data-choice="${kind}" data-value="${value}"><header><span>${kind === 'skip' ? t('Bỏ', 'Skip') : t('Lấy', 'Take')} ${i}</span><b>${f.chosen === kind ? '✓' : ''}</b></header><div class="h198-plan">${plan(indices)}</div><small>${expression}</small><strong>${money(value)}</strong></article>`;
    choices = `<div class="h198-choices">${choice('skip', skip, skipPath, rolling ? 'max_rob' : i > 0 ? `dp[${i - 1}]` : '0')}<span class="h198-max">max</span>${choice('rob', rob, robPath, `${before} + ${amount}`)}</div><div class="h198-flow ${view.pending ? 'pending' : ''}">↘ <b>${money(best)}</b> ↙${view.pending ? `<small>${t('sắp ghi','next write')}${rolling ? view.phase === 'assign' ? ' max_rob' : ' temp' : ` dp[${i}]`}</small>` : ''}</div>`;
  }
  let memory;
  if (rolling) {
    const r = view.rolling;
    memory = `<div class="h198-memory">${['assign','shift'].includes(view.phase) ? '<div class="h198-copy">max_rob → prev_rob · temp → max_rob</div>' : ''}<div>${[['prev_rob', r.prevRob], ['max_rob', r.maxRob], ['temp', r.temp]].map(([name, value]) => `<article data-register="${name}" data-value="${value ?? '—'}"><small>${name}</small><b>${value ?? '—'}</b></article>`).join('')}</div></div>`;
  } else {
    memory = view.dp ? `<div class="h198-dp"><small>dp</small><div>${view.dp.slice(start, end).map((value, offset) => `<article class="${start + offset === i ? 'current' : ''}" data-index="${start + offset}" data-value="${value ?? '?'}"><small>${start + offset}</small><b>${value ?? '?'}</b></article>`).join('')}</div></div>` : `<small class="h198-copy">${t('Chưa tạo dp','DP not allocated yet')}</small>`;
  }
  const loot = done ? `<section class="h198-loot"><div>${[...selected].map(index => plan([index])).join('<span aria-hidden="true">+</span>') || '<span class="h198-empty">∅</span>'}</div><output>= ${money(view.answer)}</output></section>` : '';
  host.innerHTML = `<section class="h198-viz"><header><small>#198 · ${rolling ? 'O(1)' : 'DP'} · L${view.debugLine}</small><strong>${done ? money(view.answer) : `${view.processedIndex + 1}/${nums.length}`}</strong></header><div class="h198-street">${houses}</div>${choices}${loot}${memory}<footer><span class="picked">✓ ${t('lấy', 'take')}</span><span>× ${t('liền kề', 'adjacent')}</span>${rolling ? `<span>${t('Nhóm nhà: truy vết minh họa', 'House selection: visual trace')}</span>` : ''}</footer></section>`;
}
