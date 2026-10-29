function renderRangeModuleView(step) {
  const v = step.rangeModuleView, host = $('treeView'), esc = escapeHtml;
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const method = v.current?.[0], query = method === 'queryRange';
  const symbol = method === 'addRange' ? '+' : method === 'removeRange' ? '−' : '?';
  const outcome = v.phase === 'result' ? v.results[v.callIndex] : null;
  const state = value => value === null ? '…' : value ? '✓ True' : '× False';
  const tone = query ? 'query' : method === 'removeRange' ? 'remove' : 'add';
  const covered = (points, x) => points.some((left, i) => i % 2 === 0 && left <= x && x < points[i + 1]);
  const nums = values => values.length ? values.map(value => `<b>${value}</b>`).join('') : '<i>∅</i>';
  const ranges = points => points.length ? points.filter((_, i) => i % 2 === 0).map((left, i) => `<span>[${left}, ${points[2 * i + 1]})</span>`).join('') : '<span>∅</span>';
  const operations = v.operations.map(([name, left, right], i) => {
    const result = i < v.results.length ? v.results[i] : undefined;
    return `<span class="rm715p-op ${i === v.callIndex ? 'active' : ''}" data-operation="${i}" title="${name}(${left}, ${right})"><small>${i + 1}</small><b>${name === 'addRange' ? '+' : name === 'removeRange' ? '−' : '?'}</b><code>[${left}, ${right})</code>${typeof result === 'boolean' ? `<strong class="${result ? 'yes' : 'no'}">${result ? '✓' : '×'}</strong>` : result === null ? '<small>✓</small>' : ''}</span>`;
  }).join('');

  // Coordinates have equal spacing: narrow gaps remain visible near 10^9.
  const count = v.coordinates.length - 1;
  const digits = Math.max(...v.coordinates.map(x => String(x).length));
  const width = Math.max(240, (host.clientWidth || 600) - 52, count * (digits * 6 + 6) + 66);
  const x = value => 66 + (width - 80) * v.coordinates.indexOf(value) / count;
  const ticks = v.coordinates.map(value => `<g><path class="rm715p-gridline" d="M${x(value)} 24V${v.current ? 191 : 83}"/><text class="rm715p-tick" x="${x(value)}" y="17" text-anchor="middle">${value}</text></g>`).join('');
  function track(points, row, label, y, requestedOnly = false) {
    const cells = v.coordinates.slice(0, -1).map((left, i) => {
      const right = v.coordinates[i + 1], on = covered(points, left);
      const requested = !!v.current && v.current[1] <= left && right <= v.current[2];
      const gap = row === 'now' && outcome === false && requested && !on;
      const changed = row === 'now' && v.phase === 'applied' && on !== covered(v.before, left);
      const cls = requestedOnly ? requested ? tone : '' : gap ? 'gap' : on ? 'covered' : '';
      return `<rect class="rm715-cell ${cls} ${changed ? 'changed' : ''}" x="${x(left)}" y="${y}" width="${x(right) - x(left)}" height="24" data-segment-left="${left}" data-segment-right="${right}" data-covered="${on}" data-requested="${requested}"><title>[${left}, ${right})</title></rect>${gap ? `<text class="rm715p-gap-mark" x="${(x(left) + x(right)) / 2}" y="${y + 17}" text-anchor="middle">×</text>` : ''}`;
    }).join('');
    const caps = requestedOnly ? v.current ? [[v.current[1], v.current[2]]] : [] : points.filter((_, i) => i % 2 === 0).map((left, i) => [left, points[2 * i + 1]]);
    const markers = caps.map(([left, right]) => `<circle class="rm715p-cap closed ${requestedOnly ? tone : 'covered'}" cx="${x(left)}" cy="${y + 12}" r="4"/><circle class="rm715p-cap open ${requestedOnly ? tone : 'covered'}" cx="${x(right)}" cy="${y + 12}" r="4"/>`).join('');
    return `<g data-coverage-row="${row}"><text class="rm715p-row-label" x="0" y="${y + 17}">${label}</text>${cells}${markers}</g>`;
  }
  const chart = `<div class="rm715p-axis-scroll" tabindex="0" role="region" aria-label="${t('Trục khoảng theo dõi', 'Tracked interval axis')}"><svg class="rm715p-axis" style="width:${width}px" viewBox="0 0 ${width} ${v.current ? 198 : 88}" role="img" aria-label="${esc(v.current ? `${method} [${v.current[1]}, ${v.current[2]})` : 'points = []')}">${ticks}${v.current ? track(v.before, 'before', t('Trước', 'Before'), 38) + track([], 'request', symbol, 98, true) : ''}${track(v.points, 'now', t('Hiện tại', 'Now'), v.current ? 158 : 42)}</svg></div>`;

  const points = v.phase === 'applied' ? v.before : v.points;
  const endpointCards = [...points, null].map((value, i) => {
    const selected = v.replacement !== null && v.i <= i && i < v.j;
    return `<span class="rm715p-point ${value === null ? 'sentinel' : i % 2 ? 'end' : 'start'} ${selected ? 'slice' : ''} ${selected && v.phase === 'applied' ? 'removed' : ''}" data-endpoint-index="${i}" data-endpoint-value="${value ?? 'end'}"><em>${i === v.i ? 'i' : ''}${i === v.i && i === v.j ? ' · ' : ''}${i === v.j ? 'j' : ''}</em><small>[${i}]</small><b>${value ?? '∅'}</b><i>${value === null ? 'len' : i % 2 ? '○ )' : '● ['}</i></span>`;
  }).join('');
  const bound = (name, value, side, target) => `<div class="rm715p-bound ${v.binary?.variable === name ? 'active' : ''}"><code>${name} = bisect_${side}(${target})</code><strong data-bound="${name}" data-value="${value ?? 'pending'}">${value ?? '…'}</strong><small>${value === null ? '…' : `${value} % 2 = ${value % 2} · ${t(value % 2 ? 'lẻ' : 'chẵn', value % 2 ? 'odd' : 'even')}`}</small></div>`;
  const bounds = v.current ? `<div class="rm715p-bounds">${bound('i', v.i, query ? 'right' : 'left', v.current[1])}${bound('j', v.j, query ? 'left' : 'right', v.current[2])}</div>` : '';
  let action = '';
  if (query) {
    const known = v.phase === 'result';
    action = `<section class="rm715p-query" data-query-verdict="${known ? outcome : 'pending'}"><div><code>i == j</code><b>${known ? `${v.i} == ${v.j} ${v.i === v.j ? '✓' : '×'}` : '…'}</b></div><strong>and</strong><div><code>i % 2 == 1</code><b>${known ? `${v.i} % 2 = ${v.i % 2} ${v.i % 2 ? '✓' : '×'}` : '…'}</b></div><strong>→</strong><b class="${outcome === true ? 'yes' : outcome === false ? 'no' : ''}">${state(outcome)}</b></section>`;
  } else if (v.replacement !== null) {
    const parity = method === 'addRange' ? 0 : 1;
    const first = method === 'addRange' ? 10 : 25;
    const check = v.line === first + 1 ? ['i', v.i] : v.line === first + 3 ? ['j', v.j] : null;
    action = `<section class="rm715p-replace"><header><code>points[${v.i}:${v.j}] ← boundary</code><small>${v.phase === 'applied' ? '✓' : t('Chuẩn bị', 'Preparing')}</small></header>${check ? `<div class="rm715p-check"><code>${check[0]} % 2 == ${parity}</code><b>${check[1]} % 2 = ${check[1] % 2} → ${check[1] % 2 === parity ? '✓' : '×'}</b></div>` : ''}<div class="rm715p-swap"><div class="old" data-slice="${v.i}:${v.j}">${nums(points.slice(v.i, v.j))}</div><strong>→</strong><div class="replacement" data-boundary="${esc(JSON.stringify(v.replacement))}">${nums(v.replacement)}</div></div>${v.phase === 'applied' ? `<div class="rm715p-after"><code>points =</code>${nums(v.points)}</div>` : ''}</section>`;
  }
  host.innerHTML = `<section class="rm715-pictures" aria-label="Range Module #715"><header class="rm715p-heading"><b>#715 · Range Module</b><small>${t('Dòng', 'Line')} ${v.line}${step.final ? ' · ✓' : ''}</small></header><div class="rm715p-ops" tabindex="0" role="region" aria-label="${t('Các lệnh', 'Operations')}">${operations || '<span>∅</span>'}</div><header class="rm715p-current ${tone}">${v.current ? `<strong>${symbol}</strong><code>${method}(${v.current[1]}, ${v.current[2]})</code><b class="${outcome === true ? 'yes' : outcome === false ? 'no' : ''}">${outcome === null ? '' : state(outcome)}</b>` : '<code>self.points = []</code>'}</header><section class="rm715p-coverage"><header><b>${t('Các khoảng', 'Coverage')}</b><small>${t('Mốc cách đều', 'Equal spacing')}</small></header>${chart}<div class="rm715p-legend"><span>● [ ${t('lấy', 'include')}</span><span>○ ) ${t('không lấy', 'exclude')}</span><span class="yes">━ ${t('theo dõi', 'tracked')}</span></div><div class="rm715p-ranges">${ranges(v.points)}</div></section><section class="rm715p-endpoints"><header><b>${v.phase === 'applied' ? t('points trước', 'points before') : 'points'}</b><small>● [0,2,…] · ○ [1,3,…]</small></header><div class="rm715p-points" tabindex="0" role="region" aria-label="points">${endpointCards}</div>${bounds}</section>${action}<details class="rm715p-explain"><summary>${t('Vì sao?', 'Why?')}</summary><div>${esc(pick(v.explanation))}</div></details></section>`;
  const rail = host.querySelector?.('.rm715p-ops'), active = rail?.querySelector('.active');
  if (active) rail.scrollLeft = Math.max(0, active.offsetLeft - rail.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2);
  const axis = host.querySelector?.('.rm715p-axis-scroll');
  if (axis && v.current) axis.scrollLeft = width - axis.clientWidth < 80 ? 0 : Math.max(0, (x(v.current[1]) + x(v.current[2])) / 2 - axis.clientWidth / 2);
  const endpointList = host.querySelector?.('.rm715p-points');
  if (endpointList && v.i !== null) {
    const endpoint = endpointList.querySelector(`[data-endpoint-index="${v.i}"]`);
    if (endpoint) endpointList.scrollLeft = Math.max(0, endpoint.offsetLeft - endpointList.offsetLeft - endpointList.clientWidth / 2);
  }
  host._rangeModule715Step = step;
  host._rangeModule715Width = host.clientWidth;
  if (typeof ResizeObserver !== 'undefined' && !host._rangeModule715Observer) {
    host._rangeModule715Observer = new ResizeObserver(() => {
      if (host.querySelector('.rm715-pictures') && host.clientWidth !== host._rangeModule715Width) renderRangeModuleView(host._rangeModule715Step);
    });
    host._rangeModule715Observer.observe(host);
  }
}
