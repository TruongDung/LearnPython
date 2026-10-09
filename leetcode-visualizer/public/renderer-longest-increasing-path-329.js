function renderLongestIncreasingPath329View(step) {
  const v = step.longestIncreasingPath329View;
  if (v.method === 2) return renderLongestIncreasingPaths329View(step);
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
  $("treeView").innerHTML = `<section class="lip329-viz" data-method="1">
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

function renderLongestIncreasingPaths329View(step) {
  const v=step.longestIncreasingPath329View;
  const t=(vi,en)=>lang==='vi'?vi:en;
  const values=path=>'['+path.map(cell=>cell.value).join(' → ')+']';
  const coords=path=>path.map(cell=>'('+cell.r+','+cell.c+')').join(' → ');
  const active=new Map(v.path.map((cell,index)=>[cell.join(','),index+1]));
  const same=(point,r,c)=>point&&point[0]===r&&point[1]===c;
  const grid=`<div class="lip329-grid-scroll"><table class="lip329-grid"><thead><tr><th>r/c</th>${v.matrix[0].map((_,c)=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${v.matrix.map((row,r)=>`<tr><th>${r}</th>${row.map((value,c)=>`<td class="${active.has(r+','+c)?'path':''} ${same(v.neighbor,r,c)?'neighbor':''} ${same(v.current,r,c)?'current':''}"><b>${value}</b>${active.has(r+','+c)?`<small>#${active.get(r+','+c)}</small>`:''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const groups=v.groups.length?`<section class="lip329-output"><header><strong>${t('Danh sách đầy đủ, nhóm theo độ dài','Complete list, grouped by length')}</strong><span>${v.groups.reduce((sum,g)=>sum+g.paths.length,0)} ${t('đường','paths')}</span></header>${v.groups.map(group=>`<article class="${group.longest?'longest':''}"><h4>${t('Đường đi độ dài','Paths with length')} ${group.length} <small>(${group.paths.length})</small>${group.longest?`<b class="lip329-longest-tag">${t('Dài nhất','Longest')}</b>`:''}</h4><p>${group.paths.map(values).join(', ')}.</p><details><summary>${t('Xem tọa độ từng đường','Show each path’s coordinates')}</summary><ol>${group.paths.map(path=>`<li><strong>${values(path)}</strong><code>${coords(path)}</code></li>`).join('')}</ol></details></article>`).join('')}</section>`:`<section class="lip329-output"><p>${t('Danh sách đầy đủ xuất hiện ở các bước print và bước cuối.','The complete list appears at print steps and the final step.')}</p></section>`;
  const calc=v.calculation;
  $('treeView').innerHTML=`<section class="lip329-viz" data-method="2" data-phase="${v.phase}">
    <header class="lip329-heading"><div><small>329 · DFS + BACKTRACKING</small><h3>${t('Liệt kê đường đi, tìm đường dài nhất','List every path, find the longest')}</h3><p>${t('Giữ cả các đường ngắn. res là độ dài lớn nhất, không phải số đường.','Keep shorter paths too. res is the maximum length, not the path count.')}</p></div><div class="lip329-res"><small>res · ${t('độ dài lớn nhất','maximum length')}</small><strong>${v.res??'—'}</strong></div></header>
    <section class="lip329-action"><small>${t('BƯỚC HIỆN TẠI','CURRENT STEP')}</small><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></section>
    <section class="lip329-path-grid"><header><strong>matrix · ${t('Nhánh DFS hiện tại','Current DFS branch')}</strong><span>${v.processed}/${v.matrix.length*v.matrix[0].length} ${t('ô gốc đã duyệt','roots explored')}</span></header>${grid}<div class="lip329-legend"><span class="current">● ${t('Ô hiện tại','Current cell')}</span><span class="neighbor">● ${t('Ô kề đang xét','Neighbor being checked')}</span><span class="computed">● ${t('Các ô trong path','Cells in path')}</span></div></section>
    <section class="lip329-active-path"><header><strong>path · ${t('Nhánh đang thử','Branch being explored')}</strong><span>${v.path.length} ${t('ô','cells')}</span></header><div>${v.path.map(([r,c])=>`<span><b>${v.matrix[r][c]}</b><small>(${r},${c})</small></span>`).join('<em>→</em>') || `<p>${t('Rỗng — trước ô gốc hoặc sau khi backtrack.','Empty — before a root or after backtracking.')}</p>`}</div><p>${t('Lưu path.copy() rồi path.pop() để khôi phục nhánh cha.','Save path.copy(), then use path.pop() to restore the parent branch.')}</p></section>
    ${calc?`<section class="lip329-formula"><code>res = max(${calc.before}, ${calc.length}) = ${calc.after}</code><span>${t('So độ dài đường vừa lưu với độ dài lớn nhất.','Compare the saved path’s length with the maximum length.')}</span></section>`:''}
    <section class="lip329-path-summary"><header><strong>${v.count} ${t('đường đã tìm','paths found')}</strong><span>${v.longestCount===null?t('Số lượng khác với res','Count differs from res'):v.longestCount+' '+t('đường dài nhất','longest paths')}</span></header><div>${v.counts.map(group=>`<span>${t('Dài','Length')} ${group.length}: <b>${group.count}</b></span>`).join('') || `<p>${t('Chưa tìm thấy đường.','No paths found yet.')}</p>`}</div></section>
    ${groups}
    <footer class="lip329-path-note">${t('Hai đường trùng giá trị vẫn khác nhau nếu tọa độ khác. Giới hạn liệt kê: 5000 đường.','Identical value sequences at different coordinates remain distinct paths. Enumeration limit: 5000 paths.')}${v.omitted?' '+t('Đã rút gọn','Condensed')+' '+v.omitted+' '+t('bước; danh sách cuối vẫn đầy đủ.','trace steps; the final list is complete.'):''}</footer>
  </section>`;
}
