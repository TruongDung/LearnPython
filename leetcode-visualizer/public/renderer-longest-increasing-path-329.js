function renderLongestIncreasingPath329View(step) {
  const v = step.longestIncreasingPath329View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const esc = escapeHtml;
  const same = (a, r, c) => a && a[0] === r && a[1] === c;
  const key = cell => cell.join(",");
  const path = new Map(v.path.map((cell, index) => [key(cell), index + 1]));
  const current = v.stack.at(-1);
  const directions = [text("↓ xuống", "↓ down"), text("↑ lên", "↑ up"), text("→ phải", "→ right"), text("← trái", "← left")];
  const grid = memo => {
    const heads = v.matrix[0].map((_, c) => `<th scope="col">${c}</th>`).join("");
    const rows = v.matrix.map((row, r) => `<tr><th scope="row">${r}</th>${row.map((value, c) => {
      const rank = path.get(`${r},${c}`);
      const cls = [same(v.current, r, c) ? "current" : "", same(v.neighbor, r, c) ? "neighbor" : "", rank ? "path" : "", memo && v.dp && v.dp[r][c] > 0 ? "computed" : "", memo && ["cache-check", "cache-return"].includes(v.phase) && same(v.current, r, c) && v.dp[r][c] ? "cached" : "", memo && v.phase === "dp-write" && same(v.current, r, c) ? "written" : ""].filter(Boolean).join(" ");
      const label = memo ? v.dp ? v.dp[r][c] : "—" : value;
      return `<td class="${cls}" aria-label="${memo ? "dp" : "matrix"}[${r}][${c}] = ${label}"><b>${esc(label)}</b>${!memo && rank ? `<small>#${rank}</small>` : ""}</td>`;
    }).join("")}</tr>`).join("");
    return `<div class="lip329-grid-scroll"><table class="lip329-grid"><thead><tr><th></th>${heads}</tr></thead><tbody>${rows}</tbody></table></div>`;
  };
  const compare = v.neighbor && v.current ? (() => {
    const [r, c] = v.current, [nr, nc] = v.neighbor;
    const inside = nr >= 0 && nr < v.matrix.length && nc >= 0 && nc < v.matrix[0].length;
    const decided = (v.condition !== null && ["accept", "reject"].includes(v.phase)) || ["call", "best-update"].includes(v.phase);
    const accepted = v.condition === true || ["call", "best-update"].includes(v.phase);
    const verdict = v.phase === "best-update" ? text("DFS CON ĐÃ TRẢ", "CHILD DFS RETURNED") : !decided ? text("Đang xét ô kề", "Examining neighbor") : accepted ? text("ĐƯỢC ĐI", "MAY MOVE") : text("BỎ QUA", "SKIP");
    return `<div class="lip329-compare ${decided ? accepted ? "yes" : "no" : ""}"><small>${current.direction === null ? "" : directions[current.direction]}</small><strong>(${r},${c}) → (${nr},${nc})</strong><span>${inside ? `${v.matrix[r][c]} → ${v.matrix[nr][nc]}` : text("Ngoài biên ma trận", "Outside the matrix")}</span><b>${verdict}</b></div>`;
  })() : "";
  const calc = v.calculation;
  const calculation = calc ? `<div class="lip329-formula"><code>${v.phase === "res-update" ? `res = max(${calc.before}, ${calc.rootLength}) = ${calc.after}` : `best = max(${calc.before}, 1 + ${calc.child}) = ${calc.after}`}</code><span>${v.phase === "res-update" ? text("Chọn kết quả tốt nhất trong mọi ô gốc.", "Choose the best result across all roots.") : text("1 là ô hiện tại; phần còn lại là đường từ ô con.", "1 is the current cell; the rest is the path from the child.")}</span></div>` : "";
  const stack = v.stack.length ? `<ol>${v.stack.map((frame, index) => `<li class="${index === v.stack.length - 1 ? "active" : ""}"><code>dfs(${frame.r},${frame.c})</code><span>best = ${frame.best === null ? "—" : frame.best}</span><small>${index === v.stack.length - 1 ? text("đang chạy", "running") : text("chờ DFS con", "waiting for child")}</small></li>`).join("")}</ol>` : `<p>${v.phase === "done" ? text("DFS đã hoàn tất.", "DFS is complete.") : text("Chưa có lời gọi DFS đang chạy.", "No DFS call is running.")}</p>`;
  const witness = v.path.length ? `<section class="lip329-witness"><header><strong>${text("Một đường đạt res", "One path achieving res")}</strong><small>${text("Minh họa từ dp đã tính", "Illustration from completed dp")}</small></header><div>${v.path.map(([r, c], index) => `<span><small>#${index + 1}</small><b>${v.matrix[r][c]}</b><code>(${r},${c})</code></span>${index + 1 < v.path.length ? '<em>→</em>' : ""}`).join("")}</div></section>` : "";
  $("treeView").innerHTML = `<section class="lip329-viz">
    <header class="lip329-heading"><div><small>329 · DFS + MEMOIZATION</small><h3>${text("Mỗi ô nhớ đường dài nhất bắt đầu từ nó", "Each cell remembers its longest starting path")}</h3></div><div class="lip329-res"><small>res · ${text("toàn ma trận", "whole matrix")}</small><strong>${v.res === null ? "—" : v.res}</strong></div></header>
    <section class="lip329-action"><small>${text("BƯỚC HIỆN TẠI", "CURRENT STEP")} · ${text("dòng", "line")} ${step.codeLines[0]}</small><strong>${esc(pick(step.title))}</strong><p>${esc(pick(step.note))}</p></section>
    <div class="lip329-grids"><section><header><strong>matrix · ${text("giá trị ô", "cell values")}</strong></header>${grid(false)}</section><section><header><strong>dp · ${text("độ dài từ ô này", "length from this cell")}</strong></header>${grid(true)}<p>${text("0 = chưa tính · số dương = đã tính xong", "0 = uncomputed · positive = complete")}</p></section></div>
    <div class="lip329-legend"><span class="current">${text("Xanh dương: DFS hiện tại", "Blue: current DFS")}</span><span class="neighbor">${text("Cam: ô kề đang xét", "Orange: neighbor under consideration")}</span><span class="computed">${text("Xanh lá: dp đã có kết quả", "Green: completed dp")}</span></div>
    ${compare}${calculation}
    <section class="lip329-stack"><header><strong>${text("Các lời gọi DFS", "DFS calls")}</strong><span>${text("Mỗi lời gọi có best riêng", "Each call has its own best")}</span></header>${stack}</section>
    <footer class="lip329-counts"><span><b>${v.writes}/${v.matrix.length * v.matrix[0].length}</b> ${text("ô đã lưu dp", "cells stored in dp")}</span><span><b>${v.cacheHits}</b> ${text("lần dùng lại dp", "dp reuses")}</span></footer>
    ${witness}
  </section>`;
}
