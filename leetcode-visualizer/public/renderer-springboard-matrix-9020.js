function renderSpringboardMatrix9020View(step) {
  const view = step.springboardMatrix9020View || {};
  if (view.method === 2) return renderSpringboardPaths9020View(step);
  const usesSet = view.method === 3;
  const vi = lang === "vi";
  const text = (viText, enText) => vi ? viText : enText;
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const rows = matrix.length;
  const cols = rows ? matrix[0].length : 0;
  const keyOf = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const currentKey = keyOf(view.current);
  const nextKey = keyOf(view.next);
  const visitedOrder = new Map((view.path || []).map((cell, index) => [keyOf(cell), index + 1]));
  const candidateByCell = new Map((view.candidates || [])
    .filter((candidate) => candidate.height !== null)
    .map((candidate) => [keyOf(candidate.cell), candidate]));
  const bestOrder = new Map((view.bestPath || []).map((cell, index) => [keyOf(cell), index + 1]));

  const phaseLabels = [
    ["setup", usesSet ? "visited = set()" : text("Mã hóa", "Encode")],
    ["search", text("Tìm kiếm", "Search")],
    ["replay", usesSet ? text("Quay lui", "Backtrack") : text("Replay physics", "Replay physics")],
    ["done", text("Kết quả", "Result")],
  ];
  const phaseIndex = usesSet
    ? ["setup", "init"].includes(view.phase) ? 0 : view.phase === "done" ? 3 : ["remove", "return", "update", "root-done"].includes(view.phase) ? 2 : 1
    : view.phase === "setup" ? 0 : view.phase === "search" ? 1 : view.phase === "done" ? 3 : 2;
  const phases = phaseLabels.map(([, label], index) => (
    `<span class="${index < phaseIndex ? "done" : index === phaseIndex ? "active" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${label}</span>`
  )).join("");

  const ruleLabels = {
    launch: text("RƠI XUỐNG · NHẬN ĐÀ", "DROP · GAIN MOMENTUM"),
    coast: text("ĐI XUỐNG · ĐÀ YẾU ĐI", "DESCEND · MOMENTUM WEAKENS"),
    spring: text("BẬT LÊN · HẾT ĐÀ", "SPRING UP · SPEND MOMENTUM"),
  };
  const activeRule = view.nextMove?.rule || null;
  const rules = [
    ["launch", text("Đứng yên", "At rest"), "B ≤ A", text("đi xuống → có đà, trần = A", "drop → momentum, ceiling = A")],
    ["coast", text("Còn đà · đi xuống", "Momentum · descend"), "C ≤ B", text("còn đà, trần mới = B", "keep momentum, new ceiling = B")],
    ["spring", text("Còn đà · bật lên", "Momentum · spring"), "B < C ≤ ceiling", text("đứng yên tại C", "return to rest at C")],
  ].map(([key, title, formula, caption]) => (
    `<article class="spring9020-rule ${activeRule === key ? "active" : ""}"><small>${title}</small><strong>${formula}</strong><span>${caption}</span></article>`
  )).join("");

  const cells = matrix.flatMap((row, r) => row.map((height, c) => {
    const key = `${r},${c}`;
    const candidate = candidateByCell.get(key);
    const classes = ["spring9020-cell"];
    if (visitedOrder.has(key)) classes.push("visited");
    if (currentKey === key) classes.push("current");
    if (nextKey === key) classes.push("next");
    if (candidate) classes.push(candidate.allowed ? "candidate-ok" : "candidate-no");
    if (view.phase === "done" && bestOrder.has(key)) classes.push("best");
    const badge = currentKey === key
      ? text("ĐANG Ở ĐÂY", "CURRENT")
      : nextKey === key
        ? text("SẮP TỚI", "NEXT")
        : visitedOrder.has(key)
          ? `#${visitedOrder.get(key)}`
          : candidate
            ? candidate.allowed ? "✓" : "×"
            : "";
    return `<article class="${classes.join(" ")}"><header><span>(${r},${c})</span><b>${badge}</b></header><strong>${escapeHtml(String(height))}</strong><footer>${text("độ cao", "height")}</footer></article>`;
  })).join("");

  const reasonFor = (candidate) => {
    if (candidate.rule === "outside") return text("ngoài matrix", "outside matrix");
    if (candidate.visited) return text("đã ghé → không được dùng lại", "already visited → cannot reuse");
    if (candidate.allowed) return ruleLabels[candidate.rule] || "✓";
    if (candidate.rule === "too-high") return text("đứng yên nhưng cell cao hơn", "at rest, but the cell is higher");
    if (candidate.rule === "above-ceiling") return text(`vượt trần ${view.ceiling}`, `above ceiling ${view.ceiling}`);
    return text("không hợp lệ", "not allowed");
  };
  const candidates = (view.candidates || []).map((candidate) => {
    const tone = candidate.allowed ? "ok" : "no";
    const coordinate = candidate.height === null ? "—" : `(${candidate.cell[0]},${candidate.cell[1]})`;
    const height = candidate.height === null ? "" : `h=${candidate.height}`;
    return `<article class="spring9020-candidate ${tone}"><b>${candidate.arrow}</b><span><strong>${candidate.direction}</strong><small>${coordinate} ${height}</small></span><em>${reasonFor(candidate)}</em></article>`;
  }).join("");

  const moveKey = (move) => `${keyOf(move.from)}>${keyOf(move.to)}`;
  const completedMoves = new Set((view.moves || []).map(moveKey));
  const activeMoveKey = view.nextMove ? moveKey(view.nextMove) : "";
  const route = (view.bestPath || []).map((cell, index, all) => {
    const height = matrix[cell[0]][cell[1]];
    const node = `<span class="spring9020-route-node ${index < (view.path || []).length ? "done" : ""} ${keyOf(cell) === currentKey ? "current" : ""}"><small>#${index + 1} · (${cell[0]},${cell[1]})</small><b>${escapeHtml(String(height))}</b></span>`;
    if (index === all.length - 1) return node;
    const from = cell;
    const to = all[index + 1];
    const move = index < (view.moves || []).length
      ? view.moves[index]
      : activeMoveKey && keyOf(from) === keyOf(view.nextMove.from) && keyOf(to) === keyOf(view.nextMove.to)
        ? view.nextMove
        : null;
    const key = `${keyOf(from)}>${keyOf(to)}`;
    const rule = move?.rule || "future";
    const symbol = rule === "spring" ? "⇡" : rule === "future" ? "→" : "⇣";
    const label = rule === "launch" ? text("nhận đà", "gain") : rule === "coast" ? text("còn đà", "coast") : rule === "spring" ? text("hết đà", "rest") : "";
    return `${node}<span class="spring9020-route-edge ${completedMoves.has(key) ? "done" : ""} ${activeMoveKey === key ? "active" : ""} ${rule}"><b>${symbol}</b><small>${label}</small></span>`;
  }).join("");

  const currentHeight = view.currentHeight == null ? "—" : view.currentHeight;
  const modeText = view.mode === "momentum" ? text("CÒN ĐÀ", "MOMENTUM") : text("ĐỨNG YÊN", "AT REST");
  const ceilingText = view.mode === "momentum" ? view.ceiling : "—";
  const positionText = Array.isArray(view.current) ? `(${view.current[0]},${view.current[1]})` : "—";
  const stepTitle = escapeHtml(pick(step.title) || "");
  const stepNote = escapeHtml(pick(step.note) || "");

  $("treeView").innerHTML = `<section class="spring9020-viz" aria-label="Springboard matrix physics visualization">
    <header class="spring9020-header">
      <div><small>9020 · DFS + ${usesSet ? "VISITED SET" : "BITMASK"}</small><h3>${text("Đường nhảy lò xo dài nhất", "Longest springboard physics path")}</h3></div>
      <div class="spring9020-answer"><span>${text("đường tối ưu", "best path")}</span><b>${view.answer}</b></div>
    </header>
    <nav class="spring9020-phases" aria-label="Progress">${phases}</nav>
    <section class="spring9020-step"><b>${text("DÒNG", "LINE")} ${view.line}</b><strong>${stepTitle}</strong><p>${stepNote}</p></section>
    <section class="spring9020-metrics">
      <article><span>${text("vị trí", "position")}</span><b>${positionText}</b></article>
      <article><span>${text("độ cao", "height")}</span><b>${currentHeight}</b></article>
      <article class="mode ${view.mode}"><span>${text("trạng thái", "state")}</span><b>${modeText}</b></article>
      <article><span>${text("trần bật", "ceiling")}</span><b>${ceilingText}</b></article>
      <article><span>${usesSet ? "best / answer" : text("đã ghé", "visited")}</span><b>${usesSet ? `${view.localBest ?? "—"} / ${view.answer}` : `${(view.path || []).length}/${view.answer}`}</b></article>
    </section>
    ${usesSet ? `<section class="spring9020-visited-set ${view.phase}" aria-label="Visited set">
      <header><strong>visited</strong><span>${(view.visited || []).length} ${text("cell trong nhánh", "cells in branch")}</span></header>
      <div><b>{</b>${(view.visited || []).map((cell) => `<code class="${keyOf(cell) === currentKey && view.phase === "add" ? "added" : ""}">(${cell.join(", ")})</code>`).join("") || `<span>∅</span>`}<b>}</b>${view.removed ? `<code class="removed">− (${view.removed.join(", ")})</code>` : ""}</div>
      <footer>${view.phase === "add" ? `<code>visited.add((${view.current.join(", ")}))</code> → ${text("chặn ghé lại", "block revisits")}` : view.removed ? `<code>visited.remove((${view.removed.join(", ")}))</code> → ${text("thử nhánh khác", "try another branch")}` : view.returned != null ? `<code>return ${view.returned}</code>` : text("Thêm khi đi sâu · xóa khi quay lui", "Add on entry · remove on backtrack")}</footer>
    </section>` : ""}
    <section class="spring9020-rules" aria-label="Physics rules">${rules}</section>
    <div class="spring9020-main">
      <section class="spring9020-board-wrap">
        <header><strong>${text("BẢN ĐỒ ĐỘ CAO", "HEIGHT MAP")}</strong><span>${rows}×${cols}</span></header>
        <div class="spring9020-board" style="--spring9020-cols:${Math.max(cols, 1)}">${cells}</div>
        <footer><span><i class="visited"></i>${text("đã đi", "visited")}</span><span><i class="current"></i>${text("hiện tại", "current")}</span><span><i class="ok"></i>${text("đi được", "allowed")}</span><span><i class="no"></i>${text("bị loại", "rejected")}</span></footer>
      </section>
      <section class="spring9020-neighbors">
        <header><strong>${text("BỐN HƯỚNG TỪ CELL HIỆN TẠI", "FOUR DIRECTIONS FROM CURRENT CELL")}</strong><span>${view.phase === "inspect" ? text("đang xét", "checking") : ""}</span></header>
        <div>${candidates || `<p>${text("Chưa có cell hiện tại.", "No current cell yet.")}</p>`}</div>
      </section>
    </div>
    <section class="spring9020-route">
      <header><strong>${usesSet && view.phase !== "done" ? text("NHÁNH DFS ĐANG CHẠY", "ACTIVE DFS BRANCH") : text("REPLAY ĐƯỜNG TỐI ƯU", "OPTIMAL PATH REPLAY")}</strong><span>${text("mỗi cell chỉ xuất hiện một lần", "every cell appears once")}</span></header>
      <div>${route}</div>
    </section>
    <footer class="spring9020-footer"><span><b>${view.statesExplored}</b> ${text("state đã xét", "states searched")}</span><span><code>${usesSet ? "visited" : "mask"}</code> ${text("chặn cell đã ghé", "blocks revisits")}</span><span>${usesSet ? `${view.processedRoots}/${view.totalRoots} ${text("điểm bắt đầu đã thử", "starting cells tried")}` : `<code>ceiling</code> ${text("giảm sau mỗi bước đi xuống", "drops after every descent")}`}</span></footer>
  </section>`;
}

function renderSpringboardPaths9020View(step) {
  const view = step.springboardMatrix9020View || {};
  const vi = lang === "vi";
  const text = (viText, enText) => vi ? viText : enText;
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const rows = matrix.length;
  const cols = rows ? matrix[0].length : 0;
  const keyOf = (cell) => Array.isArray(cell) ? `${cell[0]},${cell[1]}` : "";
  const activeOrder = new Map((view.path || []).map((cell, index) => [keyOf(cell), index + 1]));
  const savedOrder = new Map((view.savedPath || []).map((cell, index) => [keyOf(cell), index + 1]));
  const currentKey = keyOf(view.current);
  const nextKey = keyOf(view.next);

  const cells = matrix.flatMap((row, r) => row.map((height, c) => {
    const key = `${r},${c}`;
    const classes = ["spring9020-cell"];
    if (activeOrder.has(key)) classes.push("visited");
    else if (view.phase === "record" && savedOrder.has(key)) classes.push("saved");
    if (key === currentKey) classes.push("current");
    if (key === nextKey) classes.push("next");
    const badge = key === currentKey
      ? text("HIỆN TẠI", "CURRENT")
      : key === nextKey
        ? text("MỞ RỘNG", "EXTEND")
        : activeOrder.has(key)
          ? `#${activeOrder.get(key)}`
          : "";
    return `<article class="${classes.join(" ")}"><header><span>(${r},${c})</span><b>${badge}</b></header><strong>${escapeHtml(String(height))}</strong><footer>${text("độ cao", "height")}</footer></article>`;
  })).join("");

  const pathRibbon = (view.path || []).length
    ? view.path.map(([r, c], index) => `<span><small>#${index + 1} · (${r},${c})</small><b>${escapeHtml(String(matrix[r][c]))}</b></span>`).join("<em>→</em>")
    : `<p>${text("Path rỗng — đang chọn root mới hoặc đã backtrack xong.", "Path is empty — choosing a new root or finished backtracking.")}</p>`;
  const savedRibbon = (view.savedPath || []).length
    ? view.savedPath.map(([r, c]) => `<b>${escapeHtml(String(matrix[r][c]))}</b>`).join("<em>→</em>")
    : "—";
  const countBars = (view.counts || []).map((group) => {
    const width = view.count ? Math.max(5, Math.round(group.count / view.count * 100)) : 0;
    return `<span><small>${text("dài", "length")} ${group.length}</small><i><b style="width:${width}%"></b></i><strong>${group.count}</strong></span>`;
  }).join("");

  const groupList = (view.groups || []).length
    ? `<section class="spring9020-list-output"><header><strong>${text("DANH SÁCH ĐẦY ĐỦ THEO ĐỘ DÀI", "COMPLETE LIST GROUPED BY LENGTH")}</strong><span>${view.count} ${text("đường", "paths")}</span></header>${view.groups.map((group) => (
      `<details class="${group.longest ? "longest" : ""}" ${group.longest ? "open" : ""}><summary><b>${text("Độ dài", "Length")} ${group.length}</b><span>${group.paths.length} ${text("đường", "paths")}</span>${group.longest ? `<strong>${text("DÀI NHẤT", "LONGEST")}</strong>` : ""}</summary><ol>${group.paths.map((path, index) => `<li><small>#${index + 1}</small><b>[${path.values.map((value) => escapeHtml(String(value))).join(" → ")}]</b><code>${path.coordinates.map((cell) => `(${cell[0]},${cell[1]})`).join(" → ")}</code></li>`).join("")}</ol></details>`
    )).join("")}</section>`
    : `<section class="spring9020-list-output empty"><p>${text("Danh sách đầy đủ xuất hiện ở bước cuối; bộ đếm bên dưới cập nhật sau mỗi path.copy().", "The complete list appears at the final step; the counters below update after every path.copy().")}</p></section>`;

  const moveLabel = view.move?.rule === "spring"
    ? text("bật lên · hết đà", "spring up · return to rest")
    : view.move
      ? text("đi xuống · còn đà", "descend · keep momentum")
      : "";
  const modeText = view.mode === "momentum" ? text("CÒN ĐÀ", "MOMENTUM") : text("ĐỨNG YÊN", "AT REST");
  const positionText = Array.isArray(view.current) ? `(${view.current[0]},${view.current[1]})` : "—";

  $("treeView").innerHTML = `<section class="spring9020-viz spring9020-list-viz" aria-label="Springboard path enumeration visualization">
    <header class="spring9020-header">
      <div><small>9020 · DFS + BACKTRACKING · FOLLOW-UP</small><h3>${text("Lưu mọi đường đi hợp lệ", "Store every valid path")}</h3></div>
      <div class="spring9020-answer"><span>${text("dài nhất", "longest")}</span><b>${view.longest}</b></div>
    </header>
    <section class="spring9020-step"><b>${text("DÒNG", "LINE")} ${view.line}</b><strong>${escapeHtml(pick(step.title) || "")}</strong><p>${escapeHtml(pick(step.note) || "")}</p></section>
    <section class="spring9020-list-metrics">
      <article><span>${text("đã lưu", "stored")}</span><b>${view.count}</b><small>${text("đường", "paths")}</small></article>
      <article><span>${text("dài nhất", "longest")}</span><b>${view.longest}</b><small>${text("cell", "cells")}</small></article>
      <article><span>${text("root hoàn tất", "roots done")}</span><b>${view.processedRoots}/${view.totalRoots}</b><small>${text("điểm bắt đầu", "starts")}</small></article>
      <article class="mode ${view.mode}"><span>${text("physics", "physics")}</span><b>${modeText}</b><small>${view.mode === "momentum" ? `${text("trần", "ceiling")} ${view.ceiling}` : "—"}</small></article>
    </section>
    <div class="spring9020-list-main">
      <section class="spring9020-board-wrap">
        <header><strong>${text("NHÁNH DFS TRÊN MATRIX", "DFS BRANCH ON MATRIX")}</strong><span>${positionText}</span></header>
        <div class="spring9020-board" style="--spring9020-cols:${Math.max(cols, 1)}">${cells}</div>
        <footer><span><i class="visited"></i>${text("trong path", "in path")}</span><span><i class="current"></i>${text("hiện tại", "current")}</span><span><i class="ok"></i>${text("sắp mở rộng", "next extension")}</span></footer>
      </section>
      <section class="spring9020-list-summary">
        <header><strong>${text("SỐ ĐƯỜNG THEO ĐỘ DÀI", "PATH COUNTS BY LENGTH")}</strong><span>${view.count}</span></header>
        <div>${countBars || `<p>${text("Chưa lưu đường nào.", "No paths stored yet.")}</p>`}</div>
      </section>
    </div>
    <section class="spring9020-active-branch">
      <header><strong>path · ${text("nhánh đang chạy", "active branch")}</strong><span>${(view.path || []).length} ${text("cell", "cells")}</span></header>
      <div>${pathRibbon}</div>
      ${view.move ? `<p><b>${moveLabel}</b> · (${view.move.from.join(",")}) → (${view.move.to.join(",")})</p>` : ""}
    </section>
    <section class="spring9020-last-saved"><span>${text("Bản copy gần nhất", "Latest saved copy")}</span><div>${savedRibbon}</div><code>paths.append(path.copy())</code></section>
    ${groupList}
    <footer class="spring9020-footer"><span><code>path.append()</code> ${text("đi sâu", "descend")}</span><span><code>path.copy()</code> ${text("lưu độc lập", "save independently")}</span><span><code>path.pop()</code> ${text("backtrack", "backtrack")}</span></footer>
  </section>`;
}
