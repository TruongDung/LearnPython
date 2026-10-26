let rotateImage48Selection = { key: null, id: 0 };

function renderRotateImage48Pictures(step, followSelection = false) {
  const v = step.rotate48View, n = v.n, t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value)), key = JSON.stringify(v.original);
  if (rotateImage48Selection.key !== key) rotateImage48Selection = { key, id: n > 1 ? 1 : 0 };
  const tracked = rotateImage48Selection.id, flatIndex = v.ids.flat().indexOf(tracked);
  const from = [Math.floor(tracked / n), tracked % n], to = [Math.floor(flatIndex / n), flatIndex % n];
  const currentCell = n <= 6 ? 48 : n <= 10 ? 42 : 36;
  const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  const identities = v.original.map((row, r) => row.map((_, c) => r * n + c));
  function draw(matrix, ids, board) {
    const mini = board === "original", cell = mini ? 25 : currentCell, offset = mini ? 8 : 25;
    const size = offset + n * cell + 5;
    const axis = mini ? "" : `<text class="ri48-axis" x="10" y="13">r/c</text>` + Array.from({ length: n }, (_, index) =>
      `<text class="ri48-axis" x="${offset + (index + .5) * cell}" y="13">${index}</text><text class="ri48-axis" x="10" y="${offset + (index + .5) * cell + 4}">${index}</text>`).join("");
    const rowBand = !mini && v.stage === "reverse" && v.activeRow !== null
      ? `<rect class="ri48-row-band" x="${offset - 2}" y="${offset + v.activeRow * cell - 2}" width="${n * cell + 4}" height="${cell + 4}" rx="6"/>` : "";
    const cells = matrix.map((row, r) => row.map((value, c) => {
      const id = ids[r][c], a = !mini && v.swap?.kind !== "row-reverse" && same(v.activeCells[0], [r, c]);
      const b = !mini && v.swap?.kind !== "row-reverse" && same(v.activeCells[1], [r, c]);
      const x = offset + c * cell, y = offset + r * cell;
      const raw = String(value), label = raw.length > 8 ? `≈${value.toExponential(0)}` : raw;
      const font = Math.min(mini ? 12 : 20, (cell - 8) / (label.length * .62));
      return `<g class="ri48-cell tone-${Math.floor(id / n) % 6}${!mini && v.stage === "transpose" && r === c ? " ri48-diag-cell" : ""}${id === tracked ? " tracked" : ""}${a ? " active-a" : b ? " active-b" : ""}" data-ri48-id="${id}" data-ri48-board="${board}" role="button" tabindex="0" aria-pressed="${id === tracked}" aria-label="${esc(`[${r},${c}] = ${value}; ${t("gốc", "origin")} [${Math.floor(id / n)},${id % n}]`)}"><title>${esc(`[${r},${c}] = ${value} · #${id}`)}</title><rect x="${x + 2}" y="${y + 2}" width="${cell - 4}" height="${cell - 4}" rx="5"/><text x="${x + cell / 2}" y="${y + cell / 2 + font * .35}" style="font-size:${font}px">${esc(label)}</text>${id === tracked ? `<circle class="ri48-tracked-dot" cx="${x + cell - 8}" cy="${y + 8}" r="3"/>` : ""}</g>`;
    }).join("")).join("");
    const diagonal = !mini && v.stage === "transpose" ? `<path class="ri48-diagonal" d="M${offset + 1},${offset + 1} L${offset + n * cell - 1},${offset + n * cell - 1}"/>` : "";
    let arrows = "";
    if (!mini && v.activeCells.length === 2 && v.swap?.kind !== "row-reverse") {
      const [a, b] = v.activeCells, p = { x: offset + (a[1] + .5) * cell, y: offset + (a[0] + .5) * cell }, q = { x: offset + (b[1] + .5) * cell, y: offset + (b[0] + .5) * cell };
      const dx = q.x - p.x, dy = q.y - p.y, length = Math.hypot(dx, dy);
      if (length) {
        const ux = dx / length, uy = dy / length, inset = Math.min(cell * .4, length * .3);
        const midX = (p.x + q.x) / 2, midY = (p.y + q.y) / 2;
        arrows = `<g class="ri48-arrows${v.phase === "pair" ? " preview" : ""}"><path d="M${p.x + ux * inset},${p.y + uy * inset} Q${midX - uy * 18},${midY + ux * 18} ${q.x - ux * inset},${q.y - uy * inset}" marker-end="url(#ri48-arrow)"/><path d="M${q.x - ux * inset},${q.y - uy * inset} Q${midX + uy * 18},${midY - ux * 18} ${p.x + ux * inset},${p.y + uy * inset}" marker-end="url(#ri48-arrow)"/></g>`;
      }
    }
    return `<svg class="ri48-grid" viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px" role="group" aria-label="${esc(mini ? t("Ma trận gốc", "Original matrix") : "matrix")}">${mini ? "" : '<defs><marker id="ri48-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z"/></marker></defs>'}${axis}${rowBand}${diagonal}${cells}${arrows}</svg>`;
  }
  const token = (value, cls = "") => `<span class="ri48-token ${cls}">${esc(value)}</span>`;
  let work = "";
  if (v.swap?.kind === "row-reverse") {
    work = `<div class="ri48-row-change"><div>${v.swap.beforeRow.map(value => token(value)).join("")}</div><i>↓ row.reverse()</i><div>${v.swap.afterRow.map(value => token(value, "after")).join("")}</div></div>`;
  } else if (v.swap) {
    work = `<div class="ri48-swap"><span><small>[${v.swap.a}]</small>${token(v.swap.before[0], "a")}<i>→</i>${token(v.swap.after[0], "after")}</span><span><small>[${v.swap.b}]</small>${token(v.swap.before[1], "b")}<i>→</i>${token(v.swap.after[1], "after")}</span></div>`;
  } else if (!step.final) work = `<code class="ri48-equation">${esc(v.equation)}</code>`;
  const phaseIndex = v.stage === "done" ? 2 : v.stage === "reverse" ? 1 : 0;
  const captions = t(["Chuyển vị", "Lật hàng", "90° ↻"], ["Transpose", "Flip rows", "90° ↻"]);
  $("treeView").innerHTML = `<section class="ri48-viz" aria-label="${esc(t("Xoay ma trận từng bước", "Rotate the matrix step by step"))}">
    <header class="ri48-heading"><b>48 · Rotate Image</b><span>${t("Cách", "Approach")} ${v.approach} · L${v.source.line}</span></header>
    <div class="ri48-stages">${captions.map((caption, index) => `<span class="${index < phaseIndex || step.final ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex || step.final ? "✓" : index + 1}</b>${caption}</span>`).join("")}</div>
    <div class="ri48-progress"><span>↘↗ ${v.transposeSwaps}/${v.totalTransposeSwaps}</span><span>↔ ${v.reversedRows.length}/${n} ${t("hàng", "rows")}</span></div>
    <div class="ri48-compare"><section class="ri48-original"><small>${t("Gốc", "Original")}</small><div class="ri48-original-canvas">${draw(v.original, identities, "original")}</div></section><i class="ri48-between">${step.final ? "↻" : "→"}</i><section class="ri48-current"><small>matrix ${step.final ? "✓" : ""}</small><div class="ri48-current-canvas" tabindex="0">${draw(v.matrix, v.ids, "current")}</div></section></div>
    <div class="ri48-tracking"><small>${t("Theo dõi ô", "Track cell")}</small>${token(v.original[from[0]][from[1]], `tone-${from[0] % 6}`)}<span><small>${t("gốc", "origin")}</small><code>(${from})</code></span><i>→</i><span><small>${t("hiện tại", "current")}</small><code>(${to})</code></span></div>
    ${work ? `<section class="ri48-operation"><small>${v.swap?.kind === "row-reverse" ? "row.reverse()" : v.phase === "pair" ? t("Chọn cặp · chưa đổi", "Select pair · before swap") : v.swap ? "↔" : esc(v.source.text.trim())}</small>${work}</section>` : ""}
    <footer class="ri48-hint">${step.final ? "✓ (r,c) → (c,n−1−r)" : t("Chọn ô để theo dõi · màu theo hàng gốc", "Select a cell to follow · colors show original rows")}</footer>
  </section>`;
  const host = $("treeView");
  host.querySelectorAll?.("[data-ri48-id]").forEach(button => {
    const choose = event => {
      event.preventDefault(); event.stopPropagation();
      rotateImage48Selection.id = Number(button.dataset.ri48Id);
      const board = button.dataset.ri48Board;
      renderRotateImage48Pictures(step, true);
      host.querySelector?.(`[data-ri48-board="${board}"][data-ri48-id="${rotateImage48Selection.id}"]`)?.focus?.({ preventScroll: true });
    };
    button.addEventListener("click", choose);
    button.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") choose(event); });
  });
  for (const board of ["original", "current"]) {
    const canvas = host.querySelector?.(`.ri48-${board}-canvas`);
    if (!canvas) continue;
    const cell = board === "original" ? 25 : currentCell, offset = board === "original" ? 8 : 25;
    const focus = board === "original" ? from : followSelection ? to : v.activeCells[0] ?? (v.activeRow === null ? to : [v.activeRow, 0]);
    canvas.scrollLeft = Math.max(0, offset + (focus[1] + .5) * cell - canvas.clientWidth / 2);
    canvas.scrollTop = Math.max(0, offset + (focus[0] + .5) * cell - canvas.clientHeight / 2);
  }
}
