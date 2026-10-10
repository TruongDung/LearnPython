"use strict";

function renderDetectSquares2013View(step) {
  const view = step.detectSquares2013View;
  if (!view) return;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const allCoordinates = view.points.map((point) => [point.x, point.y]);
  if (view.query) allCoordinates.push(view.query);
  if (view.square) allCoordinates.push(...view.square);
  if (!allCoordinates.length) allCoordinates.push([0, 0], [1, 1]);
  let minX = Math.min(...allCoordinates.map((point) => point[0]));
  let maxX = Math.max(...allCoordinates.map((point) => point[0]));
  let minY = Math.min(...allCoordinates.map((point) => point[1]));
  let maxY = Math.max(...allCoordinates.map((point) => point[1]));
  const span = Math.max(1, maxX - minX, maxY - minY);
  const padding = Math.max(1, Math.ceil(span * 0.16));
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;
  const sx = (x) => 38 + ((x - minX) / Math.max(1, maxX - minX)) * 344;
  const sy = (y) => 244 - ((y - minY) / Math.max(1, maxY - minY)) * 214;
  const ticks = Array.from({ length: 5 }, (_, index) => index / 4);
  const grid = ticks.map((ratio) => {
    const x = 38 + ratio * 344;
    const y = 30 + ratio * 214;
    return `<line x1="${x}" y1="30" x2="${x}" y2="244"/><line x1="38" y1="${y}" x2="382" y2="${y}"/>`;
  }).join("");
  const square = view.square
    ? `<polygon class="ds2013-square ${view.candidate?.complete ? "complete" : "missing"}" points="${view.square.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")}"/>`
    : "";
  const candidateKeys = new Set((view.square || []).map(([x, y]) => `${x},${y}`));
  const queryKey = view.query ? `${view.query[0]},${view.query[1]}` : null;
  const pointNodes = view.points.map((point) => {
    const key = `${point.x},${point.y}`;
    const classes = ["ds2013-point", candidateKeys.has(key) ? "corner" : "", key === queryKey ? "query" : ""].filter(Boolean).join(" ");
    return `<g class="${classes}"><circle cx="${sx(point.x)}" cy="${sy(point.y)}" r="9"/><text x="${sx(point.x)}" y="${sy(point.y) + 3}">${point.count}</text><text class="label" x="${sx(point.x)}" y="${sy(point.y) - 14}">(${point.x},${point.y})</text></g>`;
  }).join("");
  const storedQuery = queryKey && view.points.some((point) => `${point.x},${point.y}` === queryKey);
  const queryNode = view.query && !storedQuery
    ? `<g class="ds2013-point query ghost"><circle cx="${sx(view.query[0])}" cy="${sy(view.query[1])}" r="10"/><text x="${sx(view.query[0])}" y="${sy(view.query[1]) + 3}">Q</text><text class="label" x="${sx(view.query[0])}" y="${sy(view.query[1]) - 15}">(${view.query[0]},${view.query[1]})</text></g>`
    : "";
  const missingNodes = view.candidate
    ? view.candidate.otherCorners.map((point, index) => view.candidate.cornerCounts[index] === 0
      ? `<g class="ds2013-point missing"><circle cx="${sx(point[0])}" cy="${sy(point[1])}" r="9"/><text x="${sx(point[0])}" y="${sy(point[1]) + 3}">?</text><text class="label" x="${sx(point[0])}" y="${sy(point[1]) - 14}">(${point[0]},${point[1]})</text></g>`
      : "").join("")
    : "";

  const phases = [
    ["1. Lưu điểm", "1. Store points"],
    ["2. Chọn góc chéo", "2. Pick diagonal"],
    ["3. Kiểm tra 2 góc", "3. Check 2 corners"],
    ["4. Nhân multiplicity", "4. Multiply counts"],
  ];
  const phaseIndex = view.phase === "add" || view.phase === "init" ? 0
    : view.phase === "count-start" ? 1
      : view.phase === "missing" ? 2
        : ["match", "count-done", "done"].includes(view.phase) ? 3 : 0;
  const phaseHtml = phases.map((labels, index) => `<span class="${index === phaseIndex ? "active" : ""}${index < phaseIndex ? " done" : ""}">${text(...labels)}</span>`).join("");
  const formula = view.candidate
    ? `<div class="ds2013-formula"><span>diag <b>${view.candidate.diagonalCount}</b></span><i>×</i><span>corner A <b>${view.candidate.cornerCounts[0]}</b></span><i>×</i><span>corner B <b>${view.candidate.cornerCounts[1]}</b></span><i>=</i><strong>${view.candidate.contribution}</strong></div>`
    : `<div class="ds2013-formula empty">${text("Chọn góc chéo để tạo hai góc còn lại", "Choose a diagonal to determine the other two corners")}</div>`;
  const pointBank = view.points.length
    ? view.points.map((point) => `<span class="${candidateKeys.has(`${point.x},${point.y}`) ? "active" : ""}"><code>(${point.x},${point.y})</code><b>×${point.count}</b></span>`).join("")
    : `<p>${text("Chưa có điểm", "No stored points")}</p>`;
  const history = view.history.length
    ? view.history.slice(-8).map((entry) => `<li class="${entry.name}"><span>#${entry.index}</span><code>${entry.name}([${entry.point.join(",")}])</code><b>${entry.result === null ? "—" : entry.result}</b></li>`).join("")
    : `<li><span>—</span><em>${text("Chưa có thao tác", "No operations yet")}</em><b>—</b></li>`;
  const queryLabel = view.query ? `[${view.query.join(", ")}]` : "—";

  $("treeView").innerHTML = `<section class="ds2013-viz" aria-label="${text("Mô phỏng bài 2013", "Problem 2013 simulation")}">
    <header class="ds2013-heading"><div><small>#2013 · MEDIUM · DESIGN + GEOMETRY</small><h3>${text("Đếm hình vuông bằng góc chéo", "Count squares from diagonal corners")}</h3></div><div><small>count(${queryLabel})</small><b>${view.running}</b></div></header>
    <nav class="ds2013-phases" aria-label="${text("Các bước thuật toán", "Algorithm stages")}">${phaseHtml}</nav>
    <div class="ds2013-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="ds2013-layout">
      <section class="ds2013-board"><header><strong>${text("Mặt phẳng tọa độ", "Coordinate plane")}</strong><span>${text("Số trong điểm = multiplicity", "Number inside point = multiplicity")}</span></header><svg viewBox="0 0 420 270" role="img" aria-label="${text("Các điểm và hình vuông đang xét", "Stored points and current square")}"><g class="ds2013-grid">${grid}</g>${square}${pointNodes}${queryNode}${missingNodes}<text class="axis-label" x="386" y="258">x</text><text class="axis-label" x="23" y="26">y</text></svg></section>
      <aside class="ds2013-side"><section><header><strong>${text("Kho điểm", "Point bank")}</strong><span>${view.points.length} distinct</span></header><div class="ds2013-bank">${pointBank}</div></section><section><header><strong>${text("Lịch sử", "History")}</strong><span>${view.operationIndex === null ? view.operationCount : Math.min(view.operationIndex + 1, view.operationCount)}/${view.operationCount}</span></header><ol class="ds2013-history">${history}</ol></section></aside>
    </div>
    ${formula}
    <details class="ds2013-proof"${view.phase === "done" ? " open" : ""}><summary>${text("Vì sao chỉ cần duyệt góc chéo?", "Why is scanning diagonal corners enough?")}</summary><div><code>Q = (px, py)</code><span>+</span><code>D = (x, y)</code><span>⇒</span><code>A = (x, py)</code><span>+</span><code>B = (px, y)</code></div><p>${text("Điều kiện |x−px| = |y−py| > 0 bảo đảm chiều rộng bằng chiều cao. Với Q và D, hai góc A/B là duy nhất; tích multiplicity đếm mọi cách chọn điểm trùng.", "The condition |x−px| = |y−py| > 0 makes width equal height. Once Q and D are fixed, A/B are unique; multiplying multiplicities counts every duplicate-point choice.")}</p></details>
  </section>`;
}
