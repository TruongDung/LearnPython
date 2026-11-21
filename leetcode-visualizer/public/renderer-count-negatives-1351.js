'use strict';

function renderNegative1351Pictures(step) {
  const { matrix, rows, cols, r, c, count, countedFrom, preview, added, move } = step.negative1351View;
  const vi = lang === "vi";
  const inBounds = r < rows && c >= 0;
  const cells = matrix.flatMap((row, y) => [
    `<small class="neg1351-axis">${y}</small>`,
    ...row.map((value, x) => {
      const counted = y >= countedFrom[x];
      const highlight = (preview === "column" && x === c && y >= r)
        || (preview === "row" && y === r && x <= c);
      const current = y === r && x === c;
      const origin = move?.from[0] === y && move.from[1] === x;
      const state = counted ? "counted" : y < r || x > c ? "passed" : "";
      const marker = origin ? move.direction : counted ? "✓" : "";
      const classes = [state, highlight && `preview-${preview}`, current && "current",
        added && counted && x === c && "new"].filter(Boolean).join(" ");
      return `<span class="neg1351-cell ${classes}" title="grid[${y}][${x}] = ${value}">
        <b>${value}</b>${marker ? `<small class="${origin ? "move" : ""}" aria-hidden="true">${marker}</small>` : ""}
      </span>`;
    }),
  ]).join("");
  const header = Array.from({ length: cols }, (_, x) => `<small class="neg1351-axis">${x}</small>`).join("");
  const legend = [
    ["current", vi ? "Đang xét" : "Current"],
    ["counted", vi ? "Đã đếm" : "Counted"],
    ["passed", vi ? "Đã bỏ qua" : "Skipped"],
  ].map(([key, label]) => `<span><i class="${key}"></i>${label}</span>`).join("");
  const total = count === undefined ? "–" : count;
  const summary = vi ? `Ma trận ${rows} × ${cols}, đã đếm ${total}` : `${rows} × ${cols} matrix, count ${total}`;
  const host = $("treeView");
  host.innerHTML = `<section class="neg1351-viz" aria-label="${summary}">
    <header><code>L${step.codeLines[0]}</code><code>(r, c) = (${r}, ${c})${inBounds ? "" : " · ∅"}</code>
      <div class="neg1351-total"><code>count</code> <strong>${total}</strong>${added ? `<b>+${added}</b>` : ""}</div>
    </header>
    <div class="neg1351-scroll"><div class="neg1351-grid" style="--neg1351-cols:${cols}">
      <span></span>${header}${cells}
    </div></div>
    <div class="neg1351-legend">${legend}</div>
  </section>`;
  const scroll = host.querySelector(".neg1351-scroll");
  const focus = host.querySelector(".neg1351-cell.current") ?? host.querySelector(".neg1351-cell:has(.move)");
  if (scroll && focus) {
    scroll.scrollLeft = focus.offsetLeft - (scroll.clientWidth - focus.offsetWidth) / 2;
    scroll.scrollTop = focus.offsetTop - (scroll.clientHeight - focus.offsetHeight) / 2;
  }
}
