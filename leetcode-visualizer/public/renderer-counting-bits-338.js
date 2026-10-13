function renderCountingBits338View(step) {
  const view = step.countBitsView;
  if (!view) return;
  const host = $("treeView");
  const t = (vi, en) => lang === "vi" ? vi : en;
  const current = Math.max(0, view.currentIndex);
  const cell = view.cells[current];
  // The final diagram reuses completed cells, without calculating future DP values.
  const half = current >> 1;
  const source = view.cells[half];
  const left = current > 0 ? source.value : 0;
  const right = current & 1;
  const result = cell.value;
  const width = Math.max(230, (host.clientWidth || 526) - 26);
  const bitWidth = Math.min(26, (width - 28) / view.width);
  const bits = (binary, center, y, spacing, last = false) => {
    const start = center - binary.length * spacing / 2;
    return binary.split('').map((bit, index) => `<g class="b338-bit ${last && index === binary.length - 1 ? 'right' : 'left'} ${bit === '1' ? 'on' : 'off'}" data-bit="${bit}"><rect x="${start + index * spacing + 2}" y="${y}" width="${spacing - 4}" height="26" rx="5"/><text x="${start + (index + .5) * spacing}" y="${y + 18}" text-anchor="middle">${bit}</text></g>`).join('');
  };
  const dots = (count, color, w, offset = 0, total = count, y = 90) => {
    const spacing = 11;
    return Array.from({ length: count }, (_, index) => `<circle class="b338-dot ${color}" cx="${(w - (total - 1) * spacing) / 2 + (offset + index) * spacing}" cy="${y}" r="3.5"/>`).join('');
  };
  const heads = ['left', 'right'].map(color => `<marker id="b338-head-${color}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path class="b338-fill ${color}" d="M0 0L10 5L0 10Z"/></marker>`).join('');
  let scene;
  if (current === 0) {
    scene = `<svg class="b338-scene" viewBox="0 0 ${width} 126" role="img" aria-label="0 in binary has zero set bits"><text class="b338-label" x="${width / 2}" y="18" text-anchor="middle">i = 0</text>${bits(cell.binary, width / 2, 30, bitWidth)}<text class="b338-number" x="${width / 2}" y="98" text-anchor="middle">dp[0] = 0</text></svg>`;
  } else {
    const boxWidth = Math.min(190, (width - 36) / 2);
    const sourceY = 107;
    const sourceHeight = 108;
    const targetY = sourceY + sourceHeight + 37;
    const targetWidth = Math.min(300, width - 20);
    const card = (x, y, w, color, body) => `<g class="b338-card ${color}" transform="translate(${x},${y})"><rect width="${w}" height="${sourceHeight}" rx="10"/>${body}</g>`;
    const sourceBody = `<text class="b338-label" x="${boxWidth / 2}" y="20" text-anchor="middle">i &gt;&gt; 1 = ${half}</text>${bits(source.binary, boxWidth / 2, 30, Math.min(23, (boxWidth - 8) / view.width))}<text class="b338-count" x="${boxWidth / 2}" y="76" text-anchor="middle">dp[${half}] = ${left}</text>${dots(left, 'left', boxWidth)}`;
    const lastBody = `<text class="b338-label" x="${boxWidth / 2}" y="20" text-anchor="middle">i &amp; 1 = ${right}</text>${bits(String(right), boxWidth / 2, 30, 26, true)}<text class="b338-count" x="${boxWidth / 2}" y="76" text-anchor="middle">+ ${right}</text>${dots(right, 'right', boxWidth)}`;
    const targetBody = `<text class="b338-label" x="${targetWidth / 2}" y="20" text-anchor="middle">dp[${current}]</text><text class="b338-number" x="${targetWidth / 2}" y="55" text-anchor="middle">${result}</text>${dots(left, 'left', targetWidth, 0, result, 78)}${dots(right, 'right', targetWidth, left, result, 78)}`;
    scene = `<svg class="b338-scene" viewBox="0 0 ${width} ${targetY + sourceHeight + 8}" role="img" aria-label="${current}: ${left} + ${right} = ${result}"><defs>${heads}</defs><text class="b338-label" x="${width / 2}" y="18" text-anchor="middle">i = ${current}</text><g class="b338-input">${bits(cell.binary, width / 2, 28, bitWidth, true)}</g>
      <path class="b338-wire left" d="M${width / 2 - bitWidth / 2},57 L${width / 4},${sourceY - 4}" marker-end="url(#b338-head-left)"/>
      <path class="b338-wire right" d="M${width / 2 + (view.width - 1) * bitWidth / 2},57 L${width * 3 / 4},${sourceY - 4}" marker-end="url(#b338-head-right)"/>
      ${card(width / 4 - boxWidth / 2, sourceY, boxWidth, 'left', sourceBody)}${card(width * 3 / 4 - boxWidth / 2, sourceY, boxWidth, 'right', lastBody)}
      <text class="b338-plus" x="${width / 2}" y="${sourceY + 76}" text-anchor="middle">+</text>
      ${['left', 'right'].map((color, index) => `<path class="b338-wire ${color}" d="M${width * (index ? 3 : 1) / 4},${sourceY + sourceHeight} L${width / 2 + (index ? 10 : -10)},${targetY - 4}" marker-end="url(#b338-head-${color})"/>`).join('')}
      ${card((width - targetWidth) / 2, targetY, targetWidth, 'target', targetBody)}
    </svg>`;
  }
  const start = Math.max(0, current - 7);
  const shown = view.cells.slice(start, start + 10);
  const history = `${start ? `<span class="b338-more">0…${start - 1}</span>` : ''}${shown.map(item => `<article class="b338-term ${item.num === current ? 'target' : current > 0 && item.num === half ? 'left' : item.value === null ? 'future' : ''}" data-index="${item.num}" data-value="${item.value ?? '?'}"><small>${item.num}</small><b>${item.value ?? '?'}</b></article>`).join('')}${start + shown.length < view.cells.length ? '<span class="b338-more">…</span>' : ''}`;
  const cached = current > 0 && half < start ? `<article class="b338-cache"><small>dp[${half}]</small><b>${source.value}</b><span>↗</span></article>` : '';
  host.innerHTML = `<section class="b338-viz"><header><small>#338 · Bit DP</small><strong>${current}/${view.n}</strong></header>${scene}<section class="b338-history"><small>dp</small>${cached}<div>${history}</div></section><footer><span class="left">● ${t('đã biết', 'cached')}</span><span class="right">● ${t('bit cuối', 'last bit')}</span><span>● = 1</span></footer></section>`;
  host._countingBits338Step = step;
  host._countingBits338Width = host.clientWidth;
  if (typeof ResizeObserver !== "undefined" && !host._countingBits338Observer) {
    host._countingBits338Observer = new ResizeObserver(() => {
      if (host.querySelector('.b338-viz') && host.clientWidth !== host._countingBits338Width) renderCountingBits338View(host._countingBits338Step);
    });
    host._countingBits338Observer.observe(host);
  }
}
