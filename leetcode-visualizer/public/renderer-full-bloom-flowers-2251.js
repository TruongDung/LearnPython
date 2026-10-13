function renderFullBloomFlowers2251View(step) {
  const view = step.fullBloomFlowers2251View;
  if (!view) return;
  const host = $("treeView");
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const time = view.activePerson === null ? null : view.people[view.activePerson];
  const search = view.search;
  const bounds = view.bounds || { starts: null, ends: null };
  const width = Math.max(230, (host.clientWidth || 526) - 26);
  const bloom = (start, end, value) => start <= value && value <= end;
  const flower = (open, inline = false) => {
    const body = `<path class="stem" d="M12 12V27M12 23Q3 22 4 17Q10 17 12 23M12 20Q21 18 21 15Q15 15 12 20"/>${open ? '<g class="petals"><circle cx="12" cy="5" r="4"/><circle cx="6" cy="10" r="4"/><circle cx="18" cy="10" r="4"/><circle cx="12" cy="15" r="4"/></g><circle class="center" cx="12" cy="10" r="3"/>' : '<path class="closed" d="M8 12Q5 3 12 2Q19 3 16 12Z"/>'}`;
    return inline ? `<g class="fb2251-flower-icon ${open ? 'open' : 'bud'}">${body}</g>` : `<svg class="fb2251-flower-icon ${open ? 'open' : 'bud'}" width="20" height="28" viewBox="0 0 24 28" aria-hidden="true">${body}</svg>`;
  };
  const personBody = '<circle cx="10" cy="5" r="3"/><path d="M10 9V19M3 14L10 10L17 14M5 27L10 19L15 27"/>';
  const person = `<svg class="fb2251-person" width="20" height="28" viewBox="0 0 20 28" aria-hidden="true">${personBody}</svg>`;
  const visitor = index => `<article class="fb2251-visitor ${index === view.activePerson ? 'active' : ''}" data-person="${index}" data-time="${view.people[index]}" data-answer="${view.answers[index] ?? '?'}">${person}<small>P${index}</small><span>t=${view.people[index]}</span><b>${view.answers[index] ?? '?'}</b></article>`;
  let scene;
  if (view.final) {
    // Columns preserve people order, including repeated or unsorted visit times.
    const sections = [];
    for (let start = 0; start < view.people.length; start += 4) {
      const indices = Array.from({ length: Math.min(4, view.people.length - start) }, (_, offset) => start + offset);
      sections.push(`<section class="fb2251-garden" style="--fb-columns:${indices.length}"><div class="fb2251-garden-header"><span></span>${indices.map(visitor).join('')}</div>${view.flowers.map(([a, b], index) => `<div class="fb2251-garden-row"><span class="${start === 0 ? 'fb2251-flower' : 'fb2251-row-label'}" data-index="${index}"><small>F${index}</small><small>${a}–${b}</small></span>${indices.map(personIndex => { const open = bloom(a, b, view.people[personIndex]); return `<span class="fb2251-garden-cell ${open ? 'blooming' : ''}" data-flower="${index}" data-person="${personIndex}" data-blooming="${open}">${flower(open)}</span>`; }).join('')}</div>`).join('')}</section>`);
    }
    scene = sections.join('');
  } else {
    // Equal spacing represents observed events, not elapsed duration.
    const events = [...new Set([...view.flowers.flat(), ...view.people])].sort((a, b) => a - b);
    const left = 38;
    const right = width - 38;
    const x = value => events.length === 1 ? (left + right) / 2 : left + events.indexOf(value) / (events.length - 1) * (right - left);
    const height = 55 + view.flowers.length * 43 + 34;
    const ticks = [];
    const priority = [...new Set([time, events[0], events.at(-1), events[Math.floor(events.length / 2)], events[Math.floor(events.length / 4)]].filter(value => value !== null))];
    for (const value of priority) {
      if (ticks.every(other => Math.abs(x(value) - x(other)) > (String(value).length > 5 || String(other).length > 5 ? 64 : 28))) ticks.push(value);
    }
    const rows = view.flowers.map(([a, b], index) => {
      const open = time !== null && bloom(a, b, time);
      const y = 51 + index * 43;
      return `<g class="fb2251-flower ${open ? 'blooming' : ''}" data-index="${index}" data-start="${a}" data-end="${b}" data-blooming="${open}"><title>F${index}: [${a}, ${b}]</title><g transform="translate(2,${y - 12})">${flower(open, true)}</g><line class="fb2251-lifespan" x1="${x(a)}" x2="${x(b)}" y1="${y}" y2="${y}"/><circle class="fb2251-endpoint" cx="${x(a)}" cy="${y}" r="3.5"/><circle class="fb2251-endpoint" cx="${x(b)}" cy="${y}" r="3.5"/><text class="fb2251-interval-label" x="${left}" y="${y + 20}">F${index} · ${a}–${b}</text></g>`;
    }).join('');
    scene = `<div class="fb2251-clock"><span>${time === null ? t('Mốc thời gian', 'Event times') : `P${view.activePerson} · t = ${time}`}</span><small>${t('Không theo tỷ lệ', 'Not to scale')}</small></div><svg class="fb2251-timeline" viewBox="0 0 ${width} ${height}" role="img" aria-label="${time === null ? t('Các khoảng hoa nở', 'Bloom intervals') : `t = ${time}`}" data-active-time="${time ?? '?'}">${time === null ? '' : `<line class="fb2251-now" x1="${x(time)}" x2="${x(time)}" y1="20" y2="${height - 25}"/><g class="fb2251-person" transform="translate(${x(time) - 10},0)">${personBody}</g>`}${rows}<line class="fb2251-axis" x1="${left}" x2="${right}" y1="${height - 25}" y2="${height - 25}"/>${ticks.sort((a, b) => a - b).map(value => `<text class="fb2251-tick ${time === value ? 'active' : ''}" x="${x(value)}" y="${height - 8}" text-anchor="middle">${value}</text>`).join('')}</svg>`;
  }
  const arrays = ['starts', 'ends'].map(name => {
    const active = search?.phase === name;
    const boundary = bounds[name];
    const cut = `<span class="fb2251-cut" data-index="${boundary}"><b>↓</b><small>${boundary}</small></span>`;
    const cells = view[name].map((value, index) => `<span class="fb2251-slot">${boundary === index ? cut : ''}<span class="fb2251-value ${boundary !== null && index < boundary ? 'counted' : ''} ${active && index >= search.lo && index < search.hi ? 'in-range' : ''} ${active && search.mid === index ? 'mid' : ''}" data-index="${index}" data-value="${value}"><small>${index}</small><b>${value}</b></span></span>`).join('');
    return `<section class="fb2251-array ${active ? 'searching' : ''}" data-array="${name}"><header><small>${name} ${name === 'starts' ? '≤ t' : '&lt; t'}</small>${view.method === 2 ? `<code>${name === 'starts' ? 'bisect_right' : 'bisect_left'}</code>` : active ? `<small>[${search.lo}, ${search.hi})</small>` : ''}</header><div class="fb2251-values">${cells}${boundary === view[name].length ? cut : ''}</div></section>`;
  }).join('');
  const answer = time === null ? null : view.answers[view.activePerson];
  const counts = `<div class="fb2251-counts"><span><small>start ≤ t</small><b>${bounds.starts ?? '—'}</b></span><i>−</i><span><small>end &lt; t</small><b>${bounds.ends ?? '—'}</b></span><i>=</i><span><small>${t('hoa nở', 'blooming')}</small><b>${answer ?? '—'}</b></span></div>`;
  host.innerHTML = `<section class="fb2251-viz"><header class="fb2251-heading"><small>#2251 · ${view.method === 2 ? 'bisect' : 'binary search'}</small><strong>${view.final ? `[${view.answer.join(', ')}]` : time === null ? '?' : `t = ${time}`}</strong></header>${scene}${view.final ? `<details class="fb2251-search"><summary>starts / ends</summary>${arrays}${counts}</details>` : arrays + counts + `<div class="fb2251-visitors">${view.people.map((_, index) => visitor(index)).join('')}</div>`}<footer><span class="blooming">● ${t('đang nở', 'blooming')}</span><span>start = t ✓ · end = t ✓</span></footer></section>`;
  host._fullBloom2251Step = step;
  host._fullBloom2251Width = host.clientWidth;
  if (typeof ResizeObserver !== 'undefined' && !host._fullBloom2251Observer) {
    host._fullBloom2251Observer = new ResizeObserver(() => {
      if (host.querySelector('.fb2251-viz') && host.clientWidth !== host._fullBloom2251Width) renderFullBloomFlowers2251View(host._fullBloom2251Step);
    });
    host._fullBloom2251Observer.observe(host);
  }
}
