function renderMatrixZero73Pictures(step) {
  const v = step.matrixZero73View, t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value)), summary = v.mode === "summary";
  const rowMarks = new Set(v.markerRows), colMarks = new Set(v.markerCols);
  const phases = v.approach === 1 ? [["scan", t("1 · Tìm 0", "1 · Find zeroes")], ["apply", t("2 · Xóa", "2 · Clear")], ["done", "✓"]]
    : [["flags", t("1 · Nhớ mép", "1 · Save edges")], ["mark", t("2 · Marker", "2 · Markers")], ["apply", t("3 · Xóa lõi", "3 · Clear inner")], ["edges", t("4 · Xóa mép", "4 · Clear edges")], ["done", "✓"]];
  const equal = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  function draw(matrix, original) {
    const cell = original ? 36 : 54, offset = 25, m = matrix.length, n = matrix[0].length;
    const width = offset + n * cell + 7, height = offset + m * cell + 7;
    const centers = ([r, c]) => ({ x: offset + (c + .5) * cell, y: offset + (r + .5) * cell });
    const marking = !original && !["edges", "done", "flags"].includes(v.phase);
    let html = matrix[0].map((_, c) => `<text class="m73-axis${marking && colMarks.has(c) ? ' marked' : ''}" x="${offset + (c + .5) * cell}" y="15" text-anchor="middle">${c}</text>`).join("");
    html += matrix.map((row, r) => `<text class="m73-axis${marking && rowMarks.has(r) ? ' marked' : ''}" x="13" y="${offset + (r + .5) * cell + 4}" text-anchor="middle">${r}</text>` + row.map((value, c) => {
      const zero = v.original[r][c] === 0, changed = !original && v.changed?.r === r && v.changed?.c === c;
      const marker = !original && v.approach === 2 && ["mark", "apply"].includes(v.phase) && (r === 0 || c === 0) && value === 0;
      const cleared = !original && !zero && value === 0 && !marker;
      const target = marking && (rowMarks.has(r) || colMarks.has(c));
      const classes = ["m73-cell", zero ? "original-zero" : "", marker ? "marker" : "", cleared ? "cleared" : "", target ? "target" : "", !original && equal(v.active, [r, c]) ? "active" : "", !original && equal(v.cause, [r, c]) ? "cause" : "", changed ? "changed" : ""].filter(Boolean).join(" ");
      const x = offset + c * cell, y = offset + r * cell;
      const font = Math.min(original ? 14 : 20, (cell - 8) / (String(value).length * .62));
      return `<g class="${classes}"><title>[${r}][${c}] = ${value}${zero ? t(" · 0 gốc", " · original zero") : marker ? " · marker" : ""}</title><rect x="${x + 2}" y="${y + 2}" width="${cell - 4}" height="${cell - 4}" rx="6"/><text x="${x + cell / 2}" y="${y + cell / 2 + font / 3}" text-anchor="middle" style="font-size:${font}px">${value}</text>${zero ? `<circle class="m73-dot" cx="${x + cell - 8}" cy="${y + 8}" r="3"/>` : ''}</g>`;
    }).join("")).join("");
    function arrow(from, to) {
      if (equal(from, to)) return "";
      const a = centers(from), b = centers(to), distance = Math.hypot(b.x - a.x, b.y - a.y), dx = (b.x - a.x) / distance, dy = (b.y - a.y) / distance;
      return `<line class="m73-arrow" x1="${a.x + dx * cell * .3}" y1="${a.y + dy * cell * .3}" x2="${b.x - dx * cell * .34}" y2="${b.y - dy * cell * .34}" marker-end="url(#m73-arrowhead)"/>`;
    }
    if (!original && v.active) {
      if (v.cause) html += arrow(v.cause, v.active);
      else if (v.approach === 2 && v.phase === "apply" && v.decision !== false) {
        const [r, c] = v.active;
        if (v.matrix[r][0] === 0) html += arrow([r, 0], v.active);
        if (v.matrix[0][c] === 0) html += arrow([0, c], v.active);
      }
    }
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${original ? t("Ma trận ban đầu", "Original matrix") : t("Ma trận tại dòng hiện tại", "Matrix at current line")}">${original ? "" : '<defs><marker id="m73-arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z"/></marker></defs>'}${html}</svg>`;
  }
  const flag = (label, value) => `<span class="${value === true ? 'yes' : ''}"><small>${label}</small><b>${value === null ? '?' : value ? 'True' : 'False'}</b></span>`;
  const memory = v.approach === 1 ? `<div class="m73-memory"><span><small>zero_rows</small><b>{${v.markerRows.join(', ')}}</b></span><span><small>zero_cols</small><b>{${v.markerCols.join(', ')}}</b></span></div>`
    : `<div class="m73-memory">${flag(t('Hàng 0 có 0 gốc', 'Original row 0 has zero'), v.firstRow)}${flag(t('Cột 0 có 0 gốc', 'Original column 0 has zero'), v.firstCol)}<small>O(1)</small></div>`;
  const changed = v.changed ? `<div class="m73-change"><code>matrix[${v.changed.r}][${v.changed.c}]</code><b>${v.changed.before}</b><span>→</span><strong>0</strong></div>` : '';
  const decision = v.decision !== null ? `<div class="m73-decision"><code>${esc(v.source.replace(/^if /, '').replace(/:$/, ''))}</code><b class="${v.decision ? 'yes' : ''}">${v.decision ? 'True ✓' : 'False ✕'}</b></div>` : '';
  $("treeView").innerHTML = `<section class="m73-viz" aria-label="${t('73 · Xóa hàng và cột', '73 · Zero rows and columns')}">
    <header><strong>73 · ${t('Cách', 'Approach')} ${v.approach}</strong><button type="button" data-m73-result>${t('Kết quả', 'Result')}</button></header>
    <div class="m73-stages">${phases.map(([phase, label]) => `<button type="button" class="${v.phase === phase ? 'active' : ''}" data-m73-phase="${phase}" ${summary ? 'disabled' : ''}>${label}</button>`).join('')}</div>
    ${summary ? `<div class="m73-summary">${v.rows} × ${v.cols} · ${t('Đã tính toàn bộ. Hình xem trước 6 × 8 ô; debug từng dòng với ≤6 hàng × 8 cột.', 'Fully computed. Pictures preview 6 × 8 cells; line debug for ≤6 rows × 8 columns.')}</div>` : `<div class="m73-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}
    ${summary ? '' : memory}
    <div class="m73-compare"><div class="m73-original"><small>${t('Ban đầu', 'Before')}</small>${draw(v.original, true)}</div><b class="m73-between">→</b><div class="m73-current"><small>matrix ${step.final ? '✓' : ''}</small>${draw(v.matrix, false)}</div></div>
    <div class="m73-legend"><span class="original-zero">● ${t('0 gốc', 'original zero')}</span>${v.approach === 2 && !step.final ? '<span class="marker">■ marker</span>' : ''}<span class="cleared">■ ${t('đã đổi thành 0', 'changed to zero')}</span><span class="active">□ ${t('đang xét / ghi', 'current / write')}</span></div>
    ${changed}${decision}
    ${step.final ? `<div class="m73-done">✓ ${t('Đã cập nhật matrix tại chỗ', 'matrix updated in place')}</div>` : ''}
    <div class="m73-examples"><button type="button" data-m73-example="0">${t('0 ở giữa', 'Center zero')}</button><button type="button" data-m73-example="1">${t('0 ở mép', 'Edge zeroes')}</button><button type="button" data-m73-example="2">${t('Không có 0', 'No zeroes')}</button></div>
  </section>`;
  const host = $("treeView");
  host.querySelector('[data-m73-result]').addEventListener('click', () => { stopPlay(); stepIndex = steps.length - 1; renderStep(); });
  host.querySelectorAll('[data-m73-phase]').forEach(button => button.addEventListener('click', () => {
    const target = steps.findIndex(s => s.matrixZero73View?.phase === button.dataset.m73Phase);
    if (target >= 0) { stopPlay(); stepIndex = target; renderStep(); }
  }));
  host.querySelectorAll('[data-m73-example]').forEach(button => button.addEventListener('click', () => {
    $('arrInput').value = ['1,1,1;1,0,1;1,1,1', '0,1,2,0;3,4,5,2;1,3,1,5', '1,2,3;4,5,6'][Number(button.dataset.m73Example)];
    runViz();
  }));
}
