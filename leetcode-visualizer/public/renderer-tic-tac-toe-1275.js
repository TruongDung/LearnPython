function renderTicTacToe1275(step) {
  const v = step.ticTacToe1275View, t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value));
  const playing = ["choose", "place"].includes(v.phase), checking = ["player", "line", "check"].includes(v.phase);
  const won = v.answer === "A" || v.answer === "B";
  const movingPlayer = v.moveIndex === null ? null : v.moveIndex % 2 === 0 ? "A" : "B";
  const activePlayer = won ? v.answer : playing ? movingPlayer : checking ? v.player : null;
  const candidate = playing ? v.moves[v.moveIndex] : null;
  const line = v.activeLine === null ? null : v.lines[v.activeLine];
  const examined = new Set(line?.cells || []), winning = new Set(won ? line.cells : []);
  const mark = (player, x, y, size = 20, extra = "") => player ? `<g class="tt1275-mark ${player} ${extra}" style="--tt1275-pen:${Math.max(2, size / 4)}">${player === "A"
    ? `<path d="M${x - size} ${y - size}L${x + size} ${y + size}M${x + size} ${y - size}L${x - size} ${y + size}"/>`
    : `<circle cx="${x}" cy="${y}" r="${size}"/>`}</g>` : `<circle class="tt1275-empty-dot" cx="${x}" cy="${y}" r="3"/>`;
  const icon = (player, size = 10) => `<svg class="tt1275-icon" viewBox="0 0 40 40" aria-hidden="true">${mark(player, 20, 20, size)}</svg>`;
  const playerCards = ["A", "B"].map(player => `<span class="tt1275-player ${player} ${activePlayer === player ? "active" : ""} ${v.answer === player ? "won" : ""}">${icon(player)}<b>${player}</b>${v.answer === player ? '<span aria-hidden="true">✓</span>' : ""}</span>`).join("");

  const pitch = 92, margin = 28, center = cell => [margin + (cell % 3) * pitch + 41, margin + Math.floor(cell / 3) * pitch + 41];
  const cells = [], pieces = [], axes = [];
  for (let i = 0; i < 3; i++) {
    axes.push(`<text class="tt1275-axis" x="${center(i)[0]}" y="14">${i}</text><text class="tt1275-axis" x="13" y="${center(i * 3)[1]}">${i}</text>`);
  }
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const id = r * 3 + c, player = v.board[r][c], x = margin + c * pitch, y = margin + r * pitch;
    const current = candidate?.[0] === r && candidate[1] === c;
    cells.push(`<g class="tt1275-cell ${player || "empty"} ${current ? "current" : ""} ${examined.has(id) ? "examined" : ""} ${winning.has(id) ? "winning" : ""}" data-cell="${r},${c}" data-player="${player}"><title>${esc(`(${r},${c}) · ${player || t("trống", "empty")}${v.order[r][c] ? ` · #${v.order[r][c]}` : ""}`)}</title><rect x="${x}" y="${y}" width="82" height="82" rx="15"/></g>`);
    pieces.push(`<g data-board-mark="${r},${c}">${mark(player || (current && v.phase === "choose" ? movingPlayer : ""), x + 41, y + 43, 21, !player ? "preview" : "")}${v.order[r][c] ? `<circle class="tt1275-order-bg" cx="${x + 67}" cy="${y + 14}" r="10"/><text class="tt1275-order" x="${x + 67}" y="${y + 14}">${v.order[r][c]}</text>` : ""}</g>`);
  }
  let scanLine = "";
  if (line) {
    const [x1, y1] = center(line.cells[0]), [x2, y2] = center(line.cells[2]);
    scanLine = `<path class="${won ? "tt1275-winning-line" : "tt1275-check-line"} ${v.match ? "matched" : ""}" data-line-cells="${line.cells.join(",")}" d="M${x1} ${y1 + 2}L${x2} ${y2 + 2}"/>`;
  }
  const board = `<svg class="tt1275-board" viewBox="0 0 316 316" role="img" aria-label="${esc(t("Bàn cờ 3×3: A là X, B là O; số nhỏ là thứ tự nước đi", "3×3 board: A is X, B is O; small numbers are move order"))}">${axes.join("")}${cells.join("")}${scanLine}${pieces.join("")}</svg>`;

  let inspector;
  if (won) {
    inspector = `<div class="tt1275-outcome">🏆</div><svg class="tt1275-big-mark" viewBox="0 0 100 88" aria-hidden="true">${mark(v.answer, 50, 44, 27)}</svg><strong>${v.answer} ${t("thắng", "wins")}</strong><code>return "${v.answer}"</code>`;
  } else if (v.answer === "Draw") {
    inspector = `<div class="tt1275-outcome draw" aria-hidden="true">=</div><strong>${t("Hòa", "Draw")}</strong><code>Draw · 9/9</code>`;
  } else if (v.answer === "Pending") {
    inspector = `<svg class="tt1275-clock" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="29"/><path d="M40 20V40L54 48"/></svg><strong>Pending</strong><span>${9 - v.placed} ${t("ô trống", "empty cells")}</span>`;
  } else if (playing) {
    inspector = `<svg class="tt1275-big-mark" viewBox="0 0 100 88" aria-hidden="true">${mark(movingPlayer, 50, 44, 27)}</svg><strong class="tt1275-drop">↙</strong><b>#${v.moveIndex + 1} → (${candidate.join(",")})</b>`;
  } else if (line) {
    const count = line.cells.filter(cell => v.board[Math.floor(cell / 3)][cell % 3] === v.player).length;
    inspector = `<header>${icon(v.player, 9)}<b>${t("Bộ 3", "Line of 3")}</b></header><div class="tt1275-line-pieces">${line.cells.map(cell => {
      const actual = v.board[Math.floor(cell / 3)][cell % 3];
      return `<svg class="${v.match === null ? "" : actual === v.player ? "matches" : "misses"}" viewBox="0 0 44 48" data-check-cell="${cell}" role="img" aria-label="${esc(actual || t("trống", "empty"))}"><rect x="1" y="1" width="42" height="44" rx="9"/>${mark(actual, 22, 23, 10)}</svg>`;
    }).join("")}</div><strong class="tt1275-match ${v.match ? "success" : ""}">${v.match === null ? "? / 3" : `${count} / 3${v.match ? " ✓" : ""}`}</strong>`;
  } else {
    inspector = `<div class="tt1275-goal">${["A", "B"].map(player => `<svg viewBox="0 0 132 40" aria-hidden="true">${[22, 66, 110].map(x => mark(player, x, 20, 10)).join("")}</svg>`).join("")}</div><strong>3 → ✓</strong><span>${t("Thẳng hàng", "In a row")}</span>`;
  }

  const patterns = v.lines.map((pattern, index) => {
    const selected = v.activeLine === index, result = v.player ? v.tests[v.player][index] : null;
    const [x1, y1] = [8 + pattern.cells[0] % 3 * 16, 8 + Math.floor(pattern.cells[0] / 3) * 16];
    const [x2, y2] = [8 + pattern.cells[2] % 3 * 16, 8 + Math.floor(pattern.cells[2] / 3) * 16];
    const description = pattern.kind === "row" ? `${t("Hàng", "Row")} ${pattern.index}` : pattern.kind === "column" ? `${t("Cột", "Column")} ${pattern.index}` : pattern.index ? t("Chéo phụ", "Anti-diagonal") : t("Chéo chính", "Main diagonal");
    return `<figure class="tt1275-pattern ${selected ? "active" : ""} ${result === true ? "passed" : result === false ? "tested" : ""}" data-pattern="${index}" data-result="${result}"><svg viewBox="0 0 48 48" role="img" aria-label="${esc(description)}"><path class="tt1275-mini-grid" d="M16 1V47M32 1V47M1 16H47M1 32H47"/><path class="tt1275-mini-line" d="M${x1} ${y1}L${x2} ${y2}"/>${pattern.cells.map(cell => `<circle cx="${8 + cell % 3 * 16}" cy="${8 + Math.floor(cell / 3) * 16}" r="3"/>`).join("")}</svg><figcaption>${result === true ? "✓" : result === false ? "−" : "·"}</figcaption></figure>`;
  }).join("");
  const moves = v.moves.map(([r, c], index) => `<span class="tt1275-move ${index < v.placed ? "played" : "future"} ${playing && v.moveIndex === index ? "active" : ""}" data-move-index="${index}" data-played="${index < v.placed}"><small>#${index + 1}</small>${icon(index % 2 === 0 ? "A" : "B", 8)}<b>(${r},${c})</b></span>`).join("");
  const stage = v.phase === "done" ? t("Kết quả", "Result") : checking ? t("Dò bộ 3", "Find a line of 3") : t("Đặt quân", "Place pieces");
  const summary = `${t("Tic-Tac-Toe", "Tic-Tac-Toe")}: ${v.placed}/9. ${v.answer || stage}`;
  $("treeView").innerHTML = `<section class="tt1275-viz" role="group" aria-label="${esc(summary)}"><header class="tt1275-heading"><div>${playerCards}</div><span>${stage} · ${v.placed}/9</span></header><div class="tt1275-work"><div class="tt1275-board-panel">${board}</div><aside class="tt1275-inspector ${won ? "success" : ""}">${inspector}</aside></div><div class="tt1275-patterns" aria-label="${esc(t("Tám đường có thể thắng", "Eight possible winning lines"))}">${patterns}</div><div class="tt1275-moves" aria-label="${esc(t("Thứ tự nước đi", "Move sequence"))}">${moves || "∅"}</div></section>`;
}
