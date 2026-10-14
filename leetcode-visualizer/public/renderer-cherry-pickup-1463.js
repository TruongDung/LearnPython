class CherryPickup1463Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) { this.host = host; this.language = language; this.escape = escape; }
  t(vi, en) { return this.language === "vi" ? vi : en; }
  robot(name, x, y) {
    return `<g class="cp1463-robot robot-${name.toLowerCase()}" transform="translate(${x} ${y})"><path d="M0 -9 V-14"/><rect x="-11" y="-9" width="22" height="18" rx="5"/><circle cx="-4" cy="-2" r="1.7"/><circle cx="4" cy="-2" r="1.7"/><path d="M-4 4 H4"/><text y="23" text-anchor="middle">${name}</text></g>`;
  }
  slots(indices) {
    let previous = -1;
    const slots = [];
    for (const index of indices) { if (previous >= 0 && index > previous + 1) slots.push(null); slots.push(index); previous = index; }
    return slots;
  }
  board(v) {
    const board = v.board, rs = this.slots(board.rowIndices), cs = this.slots(board.colIndices);
    const chosen = v.candidates.find(candidate => candidate.best);
    const cw = 65, ch = 80, width = 38 + cs.length * cw, height = 30 + rs.length * ch;
    const x = col => 38 + cs.indexOf(col) * cw, y = row => 30 + rs.indexOf(row) * ch;
    const cells = rs.map((r, rowSlot) => {
      if (r === null) return `<text class="cp1463-gap" x="20" y="${30 + rowSlot * ch + 40}">⋮</text>`;
      return `<text class="cp1463-axis" x="17" y="${y(r) + 43}">${r}</text>` + cs.map((c, colSlot) => {
        if (c === null) return `<text class="cp1463-gap" x="${38 + colSlot * cw + 32}" y="${y(r) + 43}">…</text>`;
        const pathRow = v.path.find(pair => pair.row === r);
        const nextA = chosen && r === v.row + 1 && c === chosen.c1;
        const nextB = chosen && r === v.row + 1 && c === chosen.c2;
        const hasA = pathRow ? pathRow.c1 === c : (r === v.row && c === v.c1) || nextA;
        const hasB = pathRow ? pathRow.c2 === c : (r === v.row && c === v.c2) || nextB;
        const activeA = r === v.row && c === v.c1, activeB = r === v.row && c === v.c2;
        const value = board.cells[board.rowIndices.indexOf(r)][board.colIndices.indexOf(c)];
        return `<g class="cp1463-cell${hasA ? " has-a" : ""}${hasB ? " has-b" : ""}${r === v.row ? " current-row" : ""}${nextA || nextB ? " next-row" : ""}" data-row="${r}" data-col="${c}" data-value="${value}" transform="translate(${x(c)} ${y(r)})"><rect x="3" y="3" width="59" height="74" rx="10"/>${activeA ? this.robot("A", activeB ? 21 : 32, 23) : ""}${activeB ? this.robot("B", activeA ? 44 : 32, 23) : ""}${nextA ? `<g class="cp1463-ghost">${this.robot("A", nextB ? 21 : 32, 23)}</g>` : ""}${nextB ? `<g class="cp1463-ghost">${this.robot("B", nextA ? 44 : 32, 23)}</g>` : ""}${hasA && !activeA && !nextA ? '<circle class="cp1463-trail trail-a" cx="23" cy="22" r="5"/>' : ""}${hasB && !activeB && !nextB ? '<rect class="cp1463-trail trail-b" x="35" y="17" width="10" height="10" rx="2"/>' : ""}<text class="cp1463-cherries" x="32" y="66" text-anchor="middle">🍒 ${value}</text></g>`;
      }).join("");
    }).join("");
    const lines = ["A", "B"].map(name => v.path.slice(1).map((pair, i) => {
      const prev = v.path[i], col = name === "A" ? pair.c1 : pair.c2, prevCol = name === "A" ? prev.c1 : prev.c2;
      if (![pair.row, prev.row].every(r => board.rowIndices.includes(r)) || ![col, prevCol].every(c => board.colIndices.includes(c))) return "";
      const offset = name === "A" ? 25 : 40;
      return `<path class="cp1463-path path-${name.toLowerCase()}" d="M${x(prevCol) + offset} ${y(prev.row) + 42} L${x(col) + offset} ${y(pair.row) + 15}"/>`;
    }).join("")).join("");
    const nextLines = chosen ? ["A", "B"].map(name => {
      const from = name === "A" ? v.c1 : v.c2, to = name === "A" ? chosen.c1 : chosen.c2;
      const offset = name === "A" ? 20 : 45;
      return `<path class="cp1463-path path-${name.toLowerCase()}" d="M${x(from) + offset} ${y(v.row) + 47} L${x(to) + offset} ${y(v.row + 1) + 11}"/>`;
    }).join("") : "";
    const headers = cs.map((c, i) => c === null ? "" : `<text class="cp1463-axis" x="${38 + i * cw + 32}" y="18" text-anchor="middle">${c}</text>`).join("");
    const name = this.t("Robot A và B trên vườn cherry; hai đường đi có màu và hình khác nhau", "Robots A and B in the cherry field; paths use distinct colors and shapes");
    return `<div class="cp1463-board-scroll"><svg class="cp1463-board" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${name}">${headers}${cells}${lines}${nextLines}</svg></div>${board.cropped ? `<small>${this.t("Vườn rút gọn · chỉ số ô giữ nguyên", "Condensed field · original cell indices")}</small>` : ""}`;
  }
  gain(v) {
    const rowIndex = v.board.rowIndices.indexOf(v.row);
    const a = v.board.cells[rowIndex][v.board.colIndices.indexOf(v.c1)], b = v.board.cells[rowIndex][v.board.colIndices.indexOf(v.c2)];
    return `<div class="cp1463-gain"><span class="robot-a">A · 🍒 ${a}</span>${v.c1 === v.c2 ? `<span class="cp1463-overlap">A = B · ${this.t("nhặt 1 lần", "collect once")}</span>` : `<span>+</span><span class="robot-b">B · 🍒 ${b}</span>`}<span>=</span><strong>🍒 ${v.gain}</strong></div>`;
  }
  moveTiles(v) {
    const dirs = ["↙", "↓", "↘"];
    const tiles = v.candidates.map(c => `<div class="cp1463-move${c.valid ? "" : " invalid"}${c.best ? " best" : ""}" data-valid="${c.valid}" data-future="${c.future ?? ""}">${c.valid ? `<div class="cp1463-pair"><span class="robot-a">A:${c.c1}</span><span class="robot-b">B:${c.c2}</span></div><b>${c.future}</b><small>${c.best ? `✓ ${this.t("chọn", "pick")}` : c.c1 === c.c2 ? this.t("cùng ô", "same cell") : "🍒"}</small>` : `<b>×</b><small>${this.t("Ngoài vườn", "Outside")}</small>`}</div>`);
    return `<section class="cp1463-card"><header><strong>${this.t("9 cặp bước xuống", "9 pairs of downward moves")}</strong><small>${this.t("Số = tốt nhất từ hàng dưới", "Value = best from the next row")}</small></header><div class="cp1463-move-head"><span class="robot-a">A ↕</span><span class="robot-b">B ↔</span></div><div class="cp1463-moves"><span></span>${dirs.map(d => `<span class="cp1463-direction robot-b">${d}</span>`).join("")}${dirs.map((d, i) => `<span class="cp1463-direction robot-a">${d}</span>${tiles.slice(i * 3, i * 3 + 3).join("")}`).join("")}</div></section>`;
  }
  matrix(v) {
    if (!v.matrix) return "";
    const m = v.matrix;
    return `<details class="cp1463-matrix"><summary>${this.t("Xem lớp DP", "View DP layer")} · row ${m.row} · A × B</summary><div class="cp1463-matrix-scroll"><table><thead><tr><th>A ∖ B</th>${m.indices.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${m.indices.map((a, i) => `<tr><th>${a}</th>${m.cells[i].map((value, j) => `<td${a === v.c1 && m.indices[j] === v.c2 ? ' class="active"' : ""}>${value ?? "·"}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
  }
  render(step) {
    const v = step.cherryPickup1463View;
    if (!v) return;
    const phases = { intro: this.t("Hai robot", "Two robots"), focus: this.t("Thử một cặp cột", "Try a column pair"), compare: this.t("Chọn tốt nhất", "Pick the best"), write: this.t("Lưu DP", "Save DP"), path: this.t("Đi theo đường tối ưu", "Follow an optimal path"), result: this.t("Kết quả", "Result") };
    const replay = v.phase === "path" || v.final;
    const total = replay ? `<div class="cp1463-total"><span>${this.t("Đã nhặt", "Collected")}</span><strong>🍒 ${v.collected}</strong>${v.final ? '<span>✓ max</span>' : ""}</div>` : "";
    const calculation = v.bestNext !== null ? `<div class="cp1463-calculation"><span>🍒 ${v.gain}</span><span>+</span><span>${v.bestNext} <small>${this.t("hàng dưới", "next row")}</small></span><span>=</span><strong>${v.total ?? "?"}</strong></div>` : "";
    const intro = v.phase === "intro" ? `<div class="cp1463-rules"><span class="robot-a">A: ↙ ↓ ↘</span><span class="robot-b">B: ↙ ↓ ↘</span><span>A = B → 🍒 × 1</span></div>` : "";
    const base = v.row === v.rows - 1 && !replay && v.phase !== "intro" ? `<div class="cp1463-base">${this.t("Hàng cuối → không còn bước tiếp theo", "Last row → no next move")} · +0</div>` : "";
    const timeline = replay ? `<div class="cp1463-timeline">${v.path.map(p => `<span class="${p.row === v.row ? "active" : ""}"><small>r${p.row}</small><b>+${p.gain}</b></span>`).join("")}</div>` : "";
    this.host.innerHTML = `<section class="cp1463-viz"><header><strong>1463 · ${phases[v.phase]}</strong><span>${replay || v.phase === "intro" ? "↓" : "↑ DP"} ${this.t("hàng", "row")} ${v.row} / ${v.rows - 1}</span></header>${total}${intro}<div class="cp1463-main"><section class="cp1463-card cp1463-field"><header><span class="robot-a">● A</span><span class="robot-b">■ B</span><small>${v.rows} × ${v.cols}</small></header>${this.board(v)}${this.gain(v)}</section><div class="cp1463-detail">${v.candidates.length ? this.moveTiles(v) : ""}${base}${calculation}${!replay && v.phase !== "intro" ? `<small class="cp1463-layer">${this.t("DP tính từ dưới lên · đang thử A", "DP works upward · trying A")}:${v.c1}, B:${v.c2}</small>` : ""}</div></div>${timeline}${this.matrix(v)}${v.phase === "focus" ? `<small>${this.t("Chỉ minh họa một số cặp · thuật toán tính mọi cặp cột", "Selected pairs illustrated · algorithm computes every column pair")}</small>` : ""}</section>`;
  }
}
function renderCherryPickup1463View(step) {
  new CherryPickup1463Visualizer({ host: $("treeView"), language: lang, escape: escapeHtml }).render(step);
}
