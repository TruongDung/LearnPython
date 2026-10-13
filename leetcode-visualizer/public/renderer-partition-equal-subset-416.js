function renderEqualSubset416View(step) {
  const view = step.equalSubset416View;
  if (!view) return;
  const host = $("treeView");
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const tr = view.transition;
  const item = view.itemIndex;
  const width = Math.max(230, (host.clientWidth || 526) - 26);
  const icon = value => value ? '✓' : '·';
  const reached = view.current?.[view.sums.indexOf(view.target)] === true;
  const witness = new Set(tr?.sourceWitness || []);
  const chip = (index, cls = '') => `<span class="pe416-input ${cls}" data-index="${index}"><small>${index}</small><b>${view.nums[index]}</b></span>`;
  const start = view.nums.length <= 12 ? 0 : Math.max(0, (item ?? 0) - 5);
  const end = Math.min(view.nums.length, start + 12);
  const inputs = `${start ? `<small class="pe416-more">0…${start - 1}</small>` : ''}${view.nums.slice(start, end).map((_, offset) => {
    const index = start + offset;
    return chip(index, `${index === item ? 'active' : witness.has(index) ? 'witness' : item !== null && index < item || view.event === 'return' ? 'processed' : ''}`);
  }).join('')}${end < view.nums.length ? `<small class="pe416-more">+${view.nums.length - end}</small>` : ''}`;
  let focus = '';
  if (tr) {
    const sourceX = width * .17;
    const numX = width * .5;
    const destX = width * .83;
    const box = Math.min(85, width * .26);
    const actual = view.event === 'inspect' ? tr.before : tr.after;
    const node = (x, y, sum, state, cls) => `<g class="pe416-node ${cls} ${state ? 'yes' : 'no'}" transform="translate(${x - box / 2},${y})"><rect width="${box}" height="76" rx="9"/><text class="pe416-svg-small" x="${box / 2}" y="17" text-anchor="middle">Σ</text><text class="pe416-svg-number ${String(sum).length > 4 ? 'long' : ''}" x="${box / 2}" y="43" text-anchor="middle">${sum}</text><text class="pe416-svg-state" x="${box / 2}" y="65" text-anchor="middle">${icon(state)}</text></g>`;
    focus = `<svg class="pe416-transfer" viewBox="0 0 ${width} 186" role="img" aria-label="${tr.source} + ${view.num} = ${tr.destination}; ${view.event}"><defs><marker id="pe416-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs>
      <text class="pe416-svg-small" x="${destX}" y="13" text-anchor="middle">${t('Bỏ', 'Skip')} · ${icon(tr.before)}</text>
      <path class="pe416-keep" d="M${destX},19 L${destX},75" marker-end="url(#pe416-arrow)"/>
      ${node(sourceX, 79, tr.source, tr.from, 'source')}
      <text class="pe416-svg-small" x="${numX}" y="90" text-anchor="middle">+ nums[${item}]</text>
      <g class="pe416-number" transform="translate(${numX - 20},99)"><rect width="40" height="40" rx="8"/><text x="20" y="27" text-anchor="middle">${view.num}</text></g>
      <path class="pe416-take ${tr.from ? '' : 'blocked'} ${view.event === 'inspect' ? 'preview' : ''}" d="M${sourceX + box / 2 + 2},119 L${numX - 24},119 M${numX + 24},119 L${destX - box / 2 - 4},119" marker-end="url(#pe416-arrow)"/>
      ${node(destX, 79, tr.destination, actual, 'destination')}
      <text class="pe416-svg-small" x="${destX}" y="176" text-anchor="middle">${view.event === 'inspect' ? t('Thử', 'Try') : t('Cập nhật', 'Update')}</text>
    </svg>`;
    if (tr.from) focus += `<div class="pe416-witness">${tr.sourceWitness.length ? tr.sourceWitness.slice(0, 8).map(index => chip(index, 'witness')).join('<i>+</i>') : '<i>∅</i>'}${tr.sourceWitness.length > 8 ? `<small>+${tr.sourceWitness.length - 8}</small>` : ''}<i>+</i>${chip(item, 'active')}<i>→</i><b>Σ ${tr.destination}</b></div>`;
  } else if (view.event === 'skip-large') {
    focus = `<div class="pe416-reject"><b>${view.num}</b><span>&gt;</span><b>${view.target}</b><span>×</span></div>`;
  }
  const row = (values, before) => `<section class="pe416-row"><header>${before ? t('Trước', 'Before') : t('Hiện tại', 'Now')} ${!before && item !== null ? '← j' : ''}</header><div class="pe416-cells">${view.sums.map((sum, index) => `${index && sum > view.sums[index - 1] + 1 ? '<small class="pe416-more">…</small>' : ''}<article class="pe416-cell ${values[index] ? 'yes' : 'no'} ${sum === view.target ? 'goal' : ''} ${before && tr?.source === sum ? 'source' : ''} ${!before && tr?.destination === sum ? 'destination' : ''} ${!before && !view.before[index] && values[index] ? 'new' : ''}" data-row="${before ? 'before' : 'now'}" data-sum="${sum}" data-reachable="${values[index]}"><small>${sum}</small><b>${icon(values[index])}</b></article>`).join('')}</div></section>`;
  const table = view.current ? `${item !== null ? row(view.before, true) : ''}${row(view.current, false)}` : '';
  const group = (label, indices) => {
    const sum = indices.reduce((total, index) => total + view.nums[index], 0);
    const shown = indices.slice(0, 8);
    const rest = indices.slice(8);
    return `<div class="pe416-group"><header><b>${label}</b><strong>Σ = ${sum}</strong></header><div>${shown.map(index => chip(index)).join('<i>+</i>')}</div>${rest.length ? `<details><summary>+${rest.length}</summary><div>${rest.map(index => chip(index)).join('')}</div></details>` : ''}</div>`;
  };
  const partition = view.partition ? `<section class="pe416-partition"><svg class="pe416-balance" viewBox="0 0 300 38" role="img" aria-label="${view.target} = ${view.target}"><path d="M20 14H280M75 14V33M225 14V33M150 14V33M136 33H164"/><text x="150" y="10" text-anchor="middle">=</text></svg><div>${group('A', view.partition.a)}${group('B', view.partition.b)}</div></section>` : '';
  const goal = view.total === null ? '' : `<div class="pe416-goal"><b>Σ ${view.total}</b><span>÷ 2 →</span><strong>${view.target ?? (view.answer === false ? `${view.total / 2} ×` : '?')}</strong><small>target</small></div>`;
  const direction = item !== null && !view.partition ? `<details class="pe416-direction"><summary>← ${t('Mỗi số 1 lần', 'Use each number once')}</summary><svg viewBox="0 0 300 112" role="img" aria-label="${t('Duyệt ngược: không dùng cùng số hai lần', 'Reverse traversal prevents reusing an occurrence')}"><g class="wrong"><text x="10" y="25">→</text><text x="50" y="25">0</text><path d="M70 20H105M137 20H173"/><text x="111" y="25">2</text><text x="180" y="25">4</text><text x="225" y="25">2 × 2 ✕</text></g><g class="correct"><text x="10" y="80">←</text><text x="50" y="80">4 ✕</text><path d="M94 74H140"/><text x="151" y="80">2 ✓</text><text x="225" y="80">2 × 1 ✓</text></g></svg></details>` : '';
  host.innerHTML = `<section class="pe416-viz" data-method="1" aria-label="${t('Mô phỏng chia hai nhóm tổng bằng nhau', 'Equal subset partition simulation')}"><header class="pe416-heading"><small>#416 · 0/1 DP</small><strong class="${view.answer === false ? 'false' : reached ? 'true' : ''}">${view.answer === false ? '× False' : view.answer === true ? '✓ True' : '?'}</strong></header>${goal}<div class="pe416-inputs">${inputs}</div>${focus}${partition}${view.partition ? `<details class="pe416-full-dp"><summary>dp</summary>${table}</details>` : table}${view.answer === false && view.target !== null ? `<div class="pe416-reject">Σ ${view.target} <b>×</b></div>` : ''}${direction}<footer><span>✓ ${t('tạo được', 'reachable')}</span><span>· ${t('chưa tạo được', 'unreachable')}</span>${view.cropped ? '<span>…</span>' : ''}${view.shortened ? `<span>${t('Trace rút gọn', 'Shortened trace')}</span>` : ''}</footer></section>`;
  host._equalSubset416Step = step;
  host._equalSubset416Width = host.clientWidth;
  if (typeof ResizeObserver !== 'undefined' && !host._equalSubset416Observer) {
    host._equalSubset416Observer = new ResizeObserver(() => {
      if (host.querySelector('.pe416-viz') && host.clientWidth !== host._equalSubset416Width) renderEqualSubset416View(host._equalSubset416Step);
    });
    host._equalSubset416Observer.observe(host);
  }
}

function renderEqualSubset416BitsetView(step) {
  const view = step.equalSubset416BitsetView;
  if (!view) return;
  const host = $("treeView");
  const t = (vi, en) => lang === "vi" ? vi : en;
  const icon = value => value ? "1" : "0";
  const start = view.nums.length <= 12 ? 0 : Math.max(0, (view.activeIndex ?? 0) - 5);
  const end = Math.min(view.nums.length, start + 12);
  const inputs = `${start ? `<small class="pe416-more">0…${start - 1}</small>` : ""}${view.nums.slice(start, end).map((num, offset) => {
    const index = start + offset;
    const cls = index === view.activeIndex ? "active" : index < (view.activeIndex ?? -1) || view.final ? "processed" : "";
    return `<span class="pe416-input ${cls}" data-index="${index}"><small>${index}</small><b>${num}</b></span>`;
  }).join("")}${end < view.nums.length ? `<small class="pe416-more">+${view.nums.length - end}</small>` : ""}`;
  const row = (name, label, values, count, extra = "") => `<section class="pe416-bit-row"><header>${label}<small>${count}</small></header><div>${view.sums.map((sum, index) => `${index && sum > view.sums[index - 1] + 1 ? '<small class="pe416-more">…</small>' : ""}<article class="${values[index] ? "on" : "off"} ${sum === view.target ? "goal" : ""} ${extra && view.before[index] === 0 && view.after[index] === 1 ? "new" : ""}" data-row="${name}" data-sum="${sum}" data-bit="${values[index]}"><small>${sum}</small><b>${icon(values[index])}</b></article>`).join("")}</div></section>`;
  const rows = view.target === null ? "" : `${view.phase === "shift-or" ? row("before", t("Trước", "Before"), view.before, view.beforeCount) : ""}${view.phase === "shift-or" ? row("shifted", `<< ${view.num}`, view.shifted, "") : ""}${row("after", view.phase === "shift-or" ? "OR" : t("Bitset hiện tại", "Current bitset"), view.after, view.afterCount, "new")}`;
  const result = view.final
    ? `<strong class="pe416-bit-answer ${view.answer ? "true" : "false"}">${view.answer ? "✓ True" : "× False"}</strong>`
    : "<strong>?</strong>";
  const status = view.target === null
    ? `<div class="pe416-bit-odd">${t("Tổng lẻ", "Odd total")} · ${view.total} <b>×</b></div>`
    : `<div class="pe416-bit-goal"><span>Σ ${view.total}</span><span>÷ 2 →</span><strong>${view.target}</strong><small>${t("bit cần bật", "target bit")}</small></div>`;
  host.innerHTML = `<section class="pe416-viz pe416-bitset" data-method="2" aria-label="${t("Mô phỏng bitset cho bài 416", "416 bitset visualization")}"><header class="pe416-heading"><small>#416 · BITSET</small>${result}</header>${status}<div class="pe416-inputs">${inputs}</div><div class="pe416-bit-explain"><b>${t("Mỗi ô = một tổng", "Each cell = one sum")}</b><span>${view.phase === "shift-or" ? `${t("Dịch trái", "Shift left")} ${view.num} → OR · +${view.addedCount} ${t("tổng mới", "new sums")}` : t("1: tạo được · 0: chưa tạo được", "1: reachable · 0: unreachable")}</span></div>${rows}<footer><span>${t("Dịch bitset cũ: mỗi tổng s bật thêm s + num.", "Shift the old bitset: each sum s also sets s + num.")}</span><span>${t("Dùng bản cũ để không tái sử dụng cùng số.", "Shift the old snapshot to avoid reusing a number.")}</span></footer></section>`;
}
