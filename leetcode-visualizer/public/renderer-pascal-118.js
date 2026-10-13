function renderPascal118View(step) {
  const view = step.pascalTriangleView;
  if (!view) return;
  const host = $("treeView");
  const t = (vi, en) => lang === "vi" ? vi : en;
  const rows = view.rows.map(row => [...row]);
  if (view.workingRow) rows.push([...view.workingRow]);
  const last = rows.length - 1;
  // At completion, illustrate the middle of the last row using known values.
  const focus = view.formula || (view.phase === "done" && last >= 2 ? {
    row: last, col: Math.floor(last / 2),
    leftParent: rows[last - 1][Math.floor(last / 2) - 1],
    rightParent: rows[last - 1][Math.floor(last / 2)],
    result: rows[last][Math.floor(last / 2)],
  } : null);
  const width = Math.max(230, (host.clientWidth || 526) - 26);
  const active = focus ? { row: focus.row, col: focus.col } : view.active;
  const startRow = Math.max(0, last - 5);
  const pitch = Math.min(52, (width - 40) / Math.min(7, Math.max(1, rows.length)));
  const cellWidth = pitch - 7;
  const cellHeight = 30;
  const rowPitch = 47;
  const centerOffset = active && Number.isInteger(active.col) ? active.col - active.row / 2 : 0;
  const position = (row, col) => ({ x: width / 2 + (col - row / 2 - centerOffset) * pitch, y: 22 + (row - startRow) * rowPitch });
  let cells = "";
  for (let row = startRow; row <= last; row++) {
    const shown = [];
    for (let col = 0; col < rows[row].length; col++) {
      if (Math.abs(col - row / 2 - centerOffset) > 3.25) continue;
      const { x, y } = position(row, col);
      if (x - cellWidth / 2 < 14 || x + cellWidth / 2 > width - 14) continue;
      shown.push(col);
      const value = rows[row][col];
      const target = active?.row === row && active?.col === col;
      const left = focus && row === focus.row - 1 && col === focus.col - 1;
      const right = focus && row === focus.row - 1 && col === focus.col;
      const edge = value !== null && (col === 0 || col === row);
      const color = target ? "target" : left ? "left" : right ? "right" : edge ? "edge" : "";
      const text = value === null ? "?" : String(value).length > 5 ? "…" : value;
      cells += `<g class="p118-cell ${color} ${value === null ? 'pending' : ''}" data-row="${row}" data-col="${col}" data-value="${value ?? '?'}"><title>[${row},${col}] = ${value ?? '?'}</title><rect x="${x - cellWidth / 2}" y="${y}" width="${cellWidth}" height="${cellHeight}" rx="8"/><text x="${x}" y="${y + 20}" text-anchor="middle">${text}</text></g>`;
    }
    const y = position(row, 0).y + 21;
    if (shown[0] > 0) cells += `<text class="p118-more" x="5" y="${y}">…</text>`;
    if (shown.at(-1) < row) cells += `<text class="p118-more" x="${width - 12}" y="${y}">…</text>`;
  }
  let wires = "";
  if (focus) {
    const target = position(focus.row, focus.col);
    wires = ["left", "right"].map((color, i) => {
      const parent = position(focus.row - 1, focus.col - 1 + i);
      return `<path class="p118-wire ${color}" d="M${parent.x},${parent.y + cellHeight} L${target.x + (i ? 5 : -5)},${target.y - 2}" marker-end="url(#p118-head-${color})"/>`;
    }).join("");
  }
  const svgHeight = rows.length ? 22 + (last - startRow) * rowPitch + cellHeight + 10 : 80;
  const heads = ["left", "right"].map(color => `<marker id="p118-head-${color}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path class="p118-fill ${color}" d="M0 0L10 5L0 10Z"/></marker>`).join("");
  const triangle = `<svg class="p118-triangle" viewBox="0 0 ${width} ${svgHeight}" role="img" aria-label="${t('Tam giác Pascal đang xây', 'Pascal triangle under construction')}"><defs>${heads}</defs>${startRow ? `<text class="p118-more" x="${width / 2}" y="12" text-anchor="middle">↑ ${startRow} ${t('hàng trước', 'earlier rows')}</text>` : ''}${rows.length ? wires + cells : `<text class="p118-more" x="${width / 2}" y="45" text-anchor="middle">∅</text>`}</svg>`;
  let merge = "";
  if (focus) {
    const { leftParent: left, rightParent: right, result } = focus;
    const compact = result > 50;
    const dots = (count, color, boxWidth, offset = 0, total = count, cols = 5) => {
      const columns = Math.min(cols, Math.max(1, total));
      const x = (boxWidth - (columns - 1) * 9) / 2;
      return Array.from({ length: count }, (_, i) => `<circle class="p118-dot ${color}" cx="${x + (offset + i) % columns * 9}" cy="${45 + Math.floor((offset + i) / columns) * 9}" r="2.7"/>`).join('');
    };
    const boxWidth = Math.min(160, (width - 44) / 2);
    const boxHeight = compact ? 65 : Math.max(91, 54 + 9 * Math.ceil(Math.max(left, right) / 5));
    const targetWidth = Math.min(280, width - 20);
    const targetY = boxHeight + 29;
    const card = (x, y, w, value, color, body) => `<g class="p118-group ${color}" transform="translate(${x},${y})"><rect width="${w}" height="${boxHeight}" rx="9"/><text class="p118-number" x="${w / 2}" y="28" text-anchor="middle">${value}</text>${body}</g>`;
    const source = (value, color) => compact ? `<rect class="p118-fill ${color}" x="10" y="43" width="${boxWidth - 20}" height="9" rx="3"/>` : dots(value, color, boxWidth);
    const combined = compact ? `<rect class="p118-fill left" x="10" y="43" width="${(targetWidth - 20) * left / result}" height="9"/><rect class="p118-fill right" x="${10 + (targetWidth - 20) * left / result}" y="43" width="${(targetWidth - 20) * right / result}" height="9"/>` : dots(left, "left", targetWidth, 0, result, 10) + dots(right, "right", targetWidth, left, result, 10);
    merge = `<svg class="p118-merge" viewBox="0 0 ${width} ${targetY + boxHeight + 8}" role="img" aria-label="${left} + ${right} = ${result}">${card(width / 4 - boxWidth / 2, 0, boxWidth, left, 'left', source(left, 'left'))}${card(width * 3 / 4 - boxWidth / 2, 0, boxWidth, right, 'right', source(right, 'right'))}<text class="p118-plus" x="${width / 2}" y="30" text-anchor="middle">+</text>${['left', 'right'].map((color, i) => `<path class="p118-wire ${color}" d="M${width * (i ? 3 : 1) / 4},${boxHeight} L${width / 2 + (i ? 10 : -10)},${targetY - 3}" marker-end="url(#p118-head-${color})"/>`).join('')}${card((width - targetWidth) / 2, targetY, targetWidth, result, 'target', combined)}</svg>`;
  }
  host.innerHTML = `<section class="p118-viz"><header><small>#118 · Pascal</small><strong>${rows.length}/${view.numRows} ${t('hàng', 'rows')}</strong></header>${triangle}${merge}<footer><span class="edge">● ${t('biên', 'edges')} = 1</span><span class="left">● +</span><span class="right">●</span><span>→</span><span class="target">●</span>${focus ? `<span>${focus.result > 50 ? t('Khối khi số lớn', 'Blocks for large values') : '● = 1'}</span>` : ''}</footer></section>`;
  host._pascal118Step = step;
  host._pascal118Width = host.clientWidth;
  if (typeof ResizeObserver !== "undefined" && !host._pascal118Observer) {
    host._pascal118Observer = new ResizeObserver(() => {
      if (host.querySelector('.p118-viz') && host.clientWidth !== host._pascal118Width) renderPascal118View(host._pascal118Step);
    });
    host._pascal118Observer.observe(host);
  }
}
