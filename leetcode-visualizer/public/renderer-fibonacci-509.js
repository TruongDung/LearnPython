function renderFibonacci509View(step) {
  const view = step.fibonacciView;
  if (!view) return;
  const host = $("treeView");
  const t = (vi, en) => lang === "vi" ? vi : en;
  const terms = view.stairs;
  const rolling = view.rolling;
  const focus = view.target ?? rolling?.curr?.step ?? rolling?.prev1?.step ?? Math.min(1, view.n);
  const width = Math.max(220, (host.clientWidth || 526) - 26);
  const valueAt = index => terms[index]?.ways ?? null;
  const left = valueAt(focus - 2);
  const right = valueAt(focus - 1);
  const result = valueAt(focus);
  const compact = focus >= 2 && (left ?? 0) + (right ?? 0) > 50;
  const shifted = ["shift-prev2", "shift-prev1"].includes(view.phase);
  const circles = (count, color, w, startY = 58, columns = 5, offset = 0, total = count) => {
    if (count === null) return "";
    const cols = Math.min(columns, Math.max(1, total));
    const spacing = 10;
    const origin = (w - (cols - 1) * spacing) / 2;
    return Array.from({ length: count }, (_, i) => {
      const position = offset + i;
      return `<circle class="fib509-unit ${color}" cx="${origin + position % cols * spacing}" cy="${startY + Math.floor(position / cols) * spacing}" r="3"/>`;
    }).join("");
  };
  const pool = (x, y, w, h, index, value, color, content) => `<g class="fib509-pool ${color} ${value === null ? "pending" : ""}" transform="translate(${x},${y})" data-index="${index}" data-value="${value ?? "?"}"><rect width="${w}" height="${h}" rx="10"/><text class="fib509-label" x="${w / 2}" y="18" text-anchor="middle">F(${index})</text><text class="fib509-value ${String(value).length > 4 ? "long" : ""}" x="${w / 2}" y="42" text-anchor="middle">${value ?? "?"}</text>${content}</g>`;
  const poolWidth = Math.min(160, (width - 64) / 2);
  const sourceHeight = compact ? 82 : 110;
  let scene;
  if (focus < 2) {
    const seeds = terms.slice(0, Math.min(2, view.n + 1));
    scene = `<svg class="fib509-scene" viewBox="0 0 ${width} 132" role="img" aria-label="${seeds.map(term => `F(${term.step}) = ${term.ways ?? '?'}`).join(', ')}">${seeds.map((term, index) => {
      const center = seeds.length === 1 ? width / 2 : index === 0 ? width / 4 : width * 3 / 4;
      return pool(center - poolWidth / 2, 8, poolWidth, 110, term.step, term.ways, index === 0 ? "left" : "right", circles(term.ways, index === 0 ? "left" : "right", poolWidth));
    }).join("")}</svg>`;
  } else {
    const targetWidth = Math.min(320, width - 24);
    const targetY = sourceHeight + 58;
    const targetHeight = compact ? 82 : 110;
    const sourceContent = (value, color) => compact
      ? value ? `<rect class="fib509-group-bar ${color}" x="12" y="59" width="${poolWidth - 24}" height="10" rx="4"/>` : ""
      : circles(value, color, poolWidth);
    const targetContent = result === null ? "" : compact
      ? `<rect class="fib509-group-bar left" x="12" y="59" width="${(targetWidth - 24) * left / result}" height="10"/><rect class="fib509-group-bar right" x="${12 + (targetWidth - 24) * left / result}" y="59" width="${(targetWidth - 24) * right / result}" height="10"/>`
      : circles(left, "left", targetWidth, 58, 10, 0, result) + circles(right, "right", targetWidth, 58, 10, left, result);
    scene = `<svg class="fib509-scene" viewBox="0 0 ${width} ${targetY + targetHeight + 12}" role="img" aria-label="${escapeHtml(`${left} + ${right} = ${result ?? '?'}`)}"><defs>${["left", "right"].map(color => `<marker id="fib509-arrow-${color}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path class="fib509-arrow ${color}" d="M0 0L10 5L0 10Z"/></marker>`).join("")}</defs>
      ${pool(width / 4 - poolWidth / 2, 8, poolWidth, sourceHeight, focus - 2, left, "left", sourceContent(left, "left"))}
      ${pool(width * 3 / 4 - poolWidth / 2, 8, poolWidth, sourceHeight, focus - 1, right, "right", sourceContent(right, "right"))}
      <text class="fib509-plus" x="${width / 2}" y="54" text-anchor="middle">+</text>
      ${["left", "right"].map((color, index) => { const from = index === 0 ? width / 4 : width * 3 / 4; const to = width / 2 + (index === 0 ? -18 : 18); return `<path class="fib509-wire ${color} ${result === null ? 'pending' : ''}" d="M${from},${sourceHeight + 8} C${from},${targetY - 15} ${to},${sourceHeight + 24} ${to},${targetY - 3}" marker-end="url(#fib509-arrow-${color})"/>`; }).join("")}
      ${pool((width - targetWidth) / 2, targetY, targetWidth, targetHeight, focus, result, "target", targetContent)}
    </svg>`;
  }
  let memory = "";
  if (rolling) {
    const items = [["prev2", rolling.prev2, "left"], ["prev1", rolling.prev1, "right"], ["curr", rolling.curr, "target"]];
    const boxWidth = (width - 32) / 3;
    const top = shifted ? 40 : 8;
    const from = view.phase === "shift-prev2" ? 1 : 2;
    const to = from - 1;
    const copyColor = to === 0 ? 'left' : 'right';
    const copy = shifted ? `<defs><marker id="fib509-copy-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path class="fib509-arrow ${copyColor}" d="M0 0L10 5L0 10Z"/></marker></defs><path class="fib509-copy ${copyColor}" d="M${8 + from * (boxWidth + 8) + boxWidth / 2},${top - 4} Q${width / 2},6 ${8 + to * (boxWidth + 8) + boxWidth / 2},${top - 4}" marker-end="url(#fib509-copy-head)"/><text class="fib509-copy-label" x="${width / 2}" y="12" text-anchor="middle">${from === 1 ? 'prev1 → prev2' : 'curr → prev1'}</text>` : "";
    memory = `<svg class="fib509-memory" viewBox="0 0 ${width} ${top + 92}" role="img" aria-label="${escapeHtml(items.map(([name, item]) => `${name}=${item?.value ?? '—'}`).join(', '))}">${copy}${items.map(([name, item, color], index) => `<g class="fib509-register ${color} ${view.phase === `shift-${name}` ? 'updated' : ''}" transform="translate(${8 + index * (boxWidth + 8)},${top})" data-name="${name}" data-value="${item?.value ?? '—'}"><rect width="${boxWidth}" height="80" rx="8"/><text class="fib509-label" x="${boxWidth / 2}" y="18" text-anchor="middle">${name}</text><text class="fib509-register-value" x="${boxWidth / 2}" y="44" text-anchor="middle">${item?.value ?? '—'}</text><text class="fib509-label" x="${boxWidth / 2}" y="65" text-anchor="middle">${item ? `F(${item.step})` : ''}</text></g>`).join("")}</svg>`;
  }
  const start = Math.max(0, focus - 6);
  const shown = terms.slice(start, start + 7);
  const strip = `${start ? `<span class="fib509-ellipsis">0…${start - 1}</span>` : ""}${shown.map(term => `<article class="fib509-term ${term.step === focus ? 'target' : term.step === focus - 2 ? 'left' : term.step === focus - 1 ? 'right' : term.ways === null ? 'future' : 'known'}"><small>F(${term.step})</small><b>${term.ways ?? '?'}</b></article>`).join("")}${start + shown.length < terms.length ? '<span class="fib509-ellipsis">…</span>' : ''}`;
  host.innerHTML = `<section class="fib509-viz" aria-label="${t('Fibonacci: hai nhóm gộp thành số tiếp theo', 'Fibonacci: combine two groups into the next value')}">
    <header><span>#509 · ${Number(view.approach) === 2 ? 'O(1)' : 'DP'}</span><strong>F(${view.n}) = ${valueAt(view.n) ?? '?'}</strong></header>
    ${shifted ? memory : scene + memory}
    <div class="fib509-history"><small>${Number(view.approach) === 2 ? t('Dãy · minh họa', 'Sequence · trace') : 'dp'}</small><div>${strip}</div></div>
    <footer><span class="left">● F(i−2)</span><span class="right">● F(i−1)</span><span>${compact ? t('Khối khi số lớn', 'Blocks for large values') : '● = 1'}</span></footer>
  </section>`;
  host._fibonacci509Step = step;
  host._fibonacci509Width = host.clientWidth;
  if (typeof ResizeObserver !== "undefined" && !host._fibonacci509Observer) {
    host._fibonacci509Observer = new ResizeObserver(() => {
      if (host.querySelector('.fib509-viz') && host.clientWidth !== host._fibonacci509Width) renderFibonacci509View(host._fibonacci509Step);
    });
    host._fibonacci509Observer.observe(host);
  }
}
