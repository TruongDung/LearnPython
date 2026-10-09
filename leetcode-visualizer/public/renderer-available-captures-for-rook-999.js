"use strict";

const ROOK999_COPY = Object.freeze({
  vi: Object.freeze({
    kicker: "999 · QUÉT BỐN HƯỚNG", board: "Bàn cờ 8×8", boardHint: "Tia sáng đi qua ô trống và dừng ở quân đầu tiên.",
    captures: "Số tốt bắt được", directions: "Kết quả bốn hướng", currentRay: "Tia đang xét", noRay: "Đang tìm quân xe trước khi quét tia.", complete: "Đã quét xong cả bốn hướng.",
    pending: "chưa xét", active: "đang quét", captured: "bắt tốt", blocked: "bị tượng chặn", edge: "chạm biên",
    rook: "xe trắng", bishop: "tượng chắn", pawn: "tốt đen", scanned: "đã nhìn qua", current: "ô hiện tại", capturedPawn: "bắt được",
    firstPiece: "Quân đầu tiên quyết định", empty: "trống", result: "Kết quả", line: "DÒNG", phase: "PHA",
  }),
  en: Object.freeze({
    kicker: "999 · FOUR-DIRECTION SCAN", board: "8×8 board", boardHint: "A ray passes through empty squares and stops at the first piece.",
    captures: "Capturable pawns", directions: "Four-direction result", currentRay: "Current ray", noRay: "Locate the rook before casting a ray.", complete: "All four directions have been scanned.",
    pending: "pending", active: "scanning", captured: "pawn captured", blocked: "bishop blocks", edge: "board edge",
    rook: "white rook", bishop: "blocking bishop", pawn: "black pawn", scanned: "seen by rook", current: "current square", capturedPawn: "captured",
    firstPiece: "The first piece decides", empty: "empty", result: "Result", line: "LINE", phase: "PHASE",
  }),
});

function rook999Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function rook999Text(value) {
  return value && typeof value === "object" ? value[lang] : value;
}

function rook999Piece(piece) {
  if (piece === "R") return "♖";
  if (piece === "B") return "♗";
  if (piece === "p") return "♟";
  return "";
}

function rook999Board(view, copy) {
  const scanned = new Map(view.scanned.map((cell) => [`${cell.row},${cell.col}`, cell]));
  const captured = new Set(view.captured.map(([row, col]) => `${row},${col}`));
  const current = view.current ? `${view.current[0]},${view.current[1]}` : null;
  const rook = view.rook ? `${view.rook[0]},${view.rook[1]}` : null;
  const cells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const key = `${row},${col}`;
      const piece = view.board[row][col];
      const seen = scanned.get(key);
      const classes = ["rook999-cell", (row + col) % 2 ? "is-dark" : "is-light"];
      if (seen) classes.push("is-scanned", `ray-${seen.direction}`);
      if (key === current) classes.push("is-current");
      if (key === rook) classes.push("is-rook");
      if (captured.has(key)) classes.push("is-captured");
      if (piece === "B" && key === current) classes.push("is-blocker");
      cells.push(`<div class="${classes.join(" ")}" data-row="${row}" data-col="${col}" data-piece="${piece}" aria-label="row ${row}, column ${col}, ${piece === "." ? copy.empty : piece}">
        <small>${row},${col}</small><span class="piece piece-${piece === "p" ? "pawn" : piece === "R" ? "rook" : piece === "B" ? "bishop" : "empty"}">${rook999Piece(piece)}</span>
      </div>`);
    }
  }
  return `<section class="rook999-board-panel"><header><div><strong>${copy.board}</strong><small>${copy.boardHint}</small></div><span>${view.scanned.length}/14</span></header><div class="rook999-board" role="grid" aria-label="${copy.board}">${cells.join("")}</div><div class="rook999-legend"><span class="rook">♖ ${copy.rook}</span><span class="bishop">♗ ${copy.bishop}</span><span class="pawn">♟ ${copy.pawn}</span><span class="seen">${copy.scanned}</span><span class="active">${copy.current}</span><span class="caught">${copy.capturedPawn}</span></div></section>`;
}

function rook999DirectionCards(view, copy) {
  const directions = [
    { key: "up", symbol: "↑", vi: "Lên", en: "Up" },
    { key: "right", symbol: "→", vi: "Phải", en: "Right" },
    { key: "down", symbol: "↓", vi: "Xuống", en: "Down" },
    { key: "left", symbol: "←", vi: "Trái", en: "Left" },
  ];
  const cards = directions.map((direction) => {
    const status = view.directionStates[direction.key] || "pending";
    return `<li class="is-${status}${view.direction && view.direction.key === direction.key ? " is-selected" : ""}"><b>${direction.symbol}</b><span>${direction[lang]}</span><small>${copy[status]}</small></li>`;
  }).join("");
  return `<section class="rook999-directions"><header><strong>${copy.directions}</strong><span>${copy.firstPiece}</span></header><ol>${cards}</ol></section>`;
}

function rook999Ray(view, copy) {
  if (!view.direction) return `<section class="rook999-ray"><header><strong>${copy.currentRay}</strong></header><p>${view.final ? copy.complete : copy.noRay}</p></section>`;
  const cells = view.scanned.filter((cell) => cell.direction === view.direction.key);
  const tokens = [`<span class="is-rook"><b>♖</b><small>R</small></span>`];
  for (const cell of cells) {
    const finalPiece = cell.piece === "B" || cell.piece === "p";
    tokens.push(`<i>${view.direction.symbol}</i><span class="${finalPiece ? cell.piece === "B" ? "is-bishop" : "is-pawn" : "is-empty"}${view.current && view.current[0] === cell.row && view.current[1] === cell.col ? " is-current" : ""}"><b>${rook999Piece(cell.piece) || "·"}</b><small>${cell.row},${cell.col}</small></span>`);
  }
  if (view.directionStates[view.direction.key] === "edge") tokens.push(`<i>${view.direction.symbol}</i><span class="is-edge"><b>∅</b><small>edge</small></span>`);
  return `<section class="rook999-ray"><header><strong>${copy.currentRay}</strong><span>${view.direction.symbol} ${rook999Escape(view.direction[lang])}</span></header><div>${tokens.join("")}</div></section>`;
}

function renderAvailableCapturesForRook999View(step) {
  const view = step.rook999View;
  const copy = ROOK999_COPY[lang === "en" ? "en" : "vi"];
  const condition = view.condition ? `<span class="rook999-condition ${view.condition.result ? "is-true" : "is-false"}"><code>${rook999Escape(view.condition.expression)}</code><b>${view.condition.result ? "TRUE" : "FALSE"}</b></span>` : "";
  const root = $("treeView");
  root.innerHTML = `<section class="rook999-viz" role="img" aria-label="Available Captures for Rook visualization">
    <header class="rook999-heading"><div><small>${copy.kicker}</small><h3>${rook999Escape(rook999Text(step.title))}</h3></div><span>${copy.line} ${view.line} · ${copy.phase} ${rook999Escape(view.phase.toUpperCase())}</span></header>
    <section class="rook999-action"><div><code>${rook999Escape(view.source.trim())}</code>${condition}</div><p>${rook999Escape(rook999Text(step.note))}</p></section>
    <div class="rook999-summary"><section><small>${copy.captures}</small><strong>${view.captures}</strong><span>/ 4</span></section>${rook999DirectionCards(view, copy)}</div>
    <div class="rook999-main">${rook999Board(view, copy)}<div>${rook999Ray(view, copy)}<section class="rook999-result ${view.final ? "is-final" : ""}"><small>${copy.result}</small><strong>${view.final ? view.captures : "—"}</strong><p>${view.final ? `${view.captures} / 4` : rook999Escape(rook999Text(step.title))}</p></section></div></div>
  </section>`;
}
