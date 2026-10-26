function renderWeakestRows1337(step) {
  const v = step.weakRows1337View, vi = lang === "vi", t = (a, b) => vi ? a : b;
  const esc = value => escapeHtml(String(value));
  const matrix = v.matrix, rows = matrix.length, cols = matrix[0].length;
  const sorted = v.phase === "sort" || v.phase === "pick", picked = v.phase === "pick";
  const known = new Map(v.strength.map(([count, row]) => [row, count]));
  const selected = new Set(v.answer);
  const pitch = 36, rowHeight = 53, top = 44;
  const countX = 48 + cols * pitch, rankX = countX + 72, width = rankX + 154;
  const height = top + rows * rowHeight + 8;
  const icon = (kind, x, y, size = 26) => `<use href="#wr1337-${kind}" x="${x}" y="${y}" width="${size}" height="${size + 4}"/>`;
  const rowId = (row, x, y) => `<g class="wr1337-row-id color-${row % 6}"><rect x="${x}" y="${y}" width="32" height="26" rx="8"/><text x="${x + 16}" y="${y + 13}">#${row}</text></g>`;
  const definitions = `<defs>
    <symbol id="wr1337-soldier" viewBox="0 0 24 28"><path class="wr1337-person-fill" d="M4 10a8 8 0 0 1 16 0H4Z"/><path class="wr1337-person-stroke" d="M3 10h18 M6 10v3a6 6 0 0 0 12 0v-3"/><path class="wr1337-person-fill" d="M5 22a7 7 0 0 1 14 0v4H5Z"/><path class="wr1337-belt" d="m8 20 8 5"/></symbol>
    <symbol id="wr1337-civilian" viewBox="0 0 24 28"><circle class="wr1337-civilian-shape" cx="12" cy="8" r="5"/><path class="wr1337-civilian-shape" d="M5 25v-3a7 7 0 0 1 14 0v3Z"/></symbol>
    <marker id="wr1337-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 8 4 0 8Z"/></marker>
  </defs>`;
  const links = v.strength.map(([count, row], rank) => {
    const fromY = top + row * rowHeight + 23, toY = top + rank * rowHeight + 23;
    return `<path class="wr1337-link color-${row % 6}${picked && selected.has(row) ? " selected" : ""}" data-row-link="${row}:${rank}" d="M${countX + 28} ${fromY} C${countX + 55} ${fromY},${rankX - 20} ${toY},${rankX - 4} ${toY}" marker-end="url(#wr1337-arrow)"/>`;
  }).join("");
  const soldiers = matrix.map((values, row) => {
    const y = top + row * rowHeight, current = !sorted && v.row === row;
    return `<g class="wr1337-roster-row ${current ? "current" : ""} ${known.has(row) ? "counted" : "pending"} ${selected.has(row) ? "chosen" : ""}" data-roster-row="${row}"><title>${esc(`${t("Hàng", "Row")} ${row}: ${values.join(", ")}${known.has(row) ? ` → ${known.get(row)} ${t("lính", "soldiers")}` : ""}`)}</title>
      <rect class="wr1337-row-bg" x="0" y="${y}" width="${countX + 33}" height="45" rx="10"/>
      ${rowId(row, 5, y + 10)}
      ${values.map((value, col) => `<g class="wr1337-person ${value ? "soldier" : "civilian"}" data-matrix-cell="${row},${col}">${icon(value ? "soldier" : "civilian", 46 + col * pitch, y + 7)}</g>`).join("")}
      <text class="wr1337-count" x="${countX + 12}" y="${y + 23}">${known.has(row) ? known.get(row) : "?"}</text>
    </g>`;
  }).join("");
  const ranking = Array.from({ length: rows }, (_, rank) => {
    const pair = v.strength[rank], y = top + rank * rowHeight;
    if (!pair) return `<g class="wr1337-rank placeholder"><rect x="${rankX}" y="${y}" width="148" height="45" rx="10"/><text class="wr1337-slot" x="${rankX + 74}" y="${y + 23}">· · ·</text></g>`;
    const [count, row] = pair, chosen = selected.has(row);
    return `<g class="wr1337-rank color-${row % 6} ${chosen ? "chosen" : ""}" data-rank-row="${row}" data-rank-count="${count}"><title>${esc(`${sorted ? `${t("Hạng", "Rank")} ${rank + 1}: ` : ""}${t("hàng", "row")} ${row}, ${count} ${t("lính", "soldiers")}${chosen ? ` · ${t("được chọn", "selected")}` : ""}`)}</title>
      <rect x="${rankX}" y="${y}" width="148" height="45" rx="10"/>
      <text class="wr1337-rank-index" x="${rankX + 12}" y="${y + 23}">${chosen ? "✓" : sorted ? rank + 1 : ""}</text>
      ${icon("soldier", rankX + 27, y + 8, 20)}<text class="wr1337-pair-count" x="${rankX + 62}" y="${y + 23}">${count}</text>
      ${rowId(row, rankX + 98, y + 10)}
    </g>`;
  }).join("");
  const cutoff = picked && v.k < rows ? `<path class="wr1337-cutoff" d="M${rankX - 7} ${top + v.k * rowHeight - 4}H${width - 2}"/>` : "";
  const scene = `<svg class="wr1337-scene" style="min-width:${Math.min(width, cols * 20 + 190)}px;max-width:${Math.max(480, width)}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t("Mỗi hình mũ sắt là một lính. Mũi tên nối hàng gốc với vị trí trong danh sách.", "Each helmet is a soldier. Arrows connect original rows to their list positions."))}">
    ${definitions}<text class="wr1337-header" x="${(countX + 30) / 2}" y="19">${t("Hàng gốc", "Original rows")}</text><text class="wr1337-header" x="${rankX + 74}" y="19">${sorted ? t("Yếu → mạnh", "Weak → strong") : t("(lính, hàng)", "(soldiers, row)")}</text>
    ${links}${soldiers}${ranking}${cutoff}
  </svg>`;
  const equal = sorted ? v.strength.findIndex((pair, i) => i > 0 && pair[0] === v.strength[i - 1][0]) : -1;
  const tie = equal > 0 ? (() => {
    const [count, second] = v.strength[equal], first = v.strength[equal - 1][1];
    return `<div class="wr1337-tie"><span>${count} = ${count}</span><span class="color-${first % 6}">#${first}</span><b>&lt;</b><span class="color-${second % 6}">#${second}</span><span>→ #${first} ${t("trước", "first")}</span></div>`;
  })() : "";
  const answer = Array.from({ length: v.k }, (_, i) => `<span class="wr1337-answer-cell ${picked ? `color-${v.answer[i] % 6} filled` : "empty"}"><small>${i + 1}</small><b>${picked ? `#${v.answer[i]}` : "?"}</b></span>`).join("");
  const summary = `${t("K hàng yếu nhất", "K weakest rows")}: k=${v.k}. ${picked ? `[${v.answer.join(", ")}]` : `${known.size}/${rows} ${t("hàng đã đếm", "rows counted")}`}`;
  $("treeView").innerHTML = `<section class="wr1337-viz" role="group" aria-label="${esc(summary)}">
    <div class="wr1337-key"><span class="wr1337-key-soldier"><svg viewBox="0 0 24 28" aria-hidden="true"><use href="#wr1337-soldier" width="24" height="28"/></svg><b>1</b> ${t("lính", "soldier")}</span><span class="wr1337-key-civilian"><svg viewBox="0 0 24 28" aria-hidden="true"><use href="#wr1337-civilian" width="24" height="28"/></svg><b>0</b> ${t("dân", "civilian")}</span><strong>k = ${v.k}</strong></div>
    <div class="wr1337-board">${scene}</div>
    ${tie}<div class="wr1337-answer"><strong>${t("Chọn k hàng", "Pick k rows")}</strong><div>${answer}</div></div>
  </section>`;
}
