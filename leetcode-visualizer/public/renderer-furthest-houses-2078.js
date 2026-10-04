function renderFurthestHouses2078View(step) {
  if (step.furthestHouses2078ScanView) return renderFurthestHouses2078ScanView(step);
  const view = step.furthestHouses2078View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const distinct = [...new Set(view.colors)].sort((a, b) => a - b);
  const palette = ["#60a5fa", "#fb7185", "#34d399", "#fbbf24", "#a78bfa", "#22d3ee", "#fb923c", "#f472b6"];
  const paint = color => {
    const position = distinct.indexOf(color);
    return position < palette.length ? palette[position] : `hsl(${position * 137.508 % 360} 65% 65%)`;
  };
  function lane(first) {
    const anchor = first ? 0 : view.n - 1;
    const pointer = first ? view.right : view.left;
    const found = first ? view.firstFound : view.lastFound;
    const pair = first ? view.firstPair : view.lastPair;
    const active = view.phase === (first ? "first" : "last");
    const won = view.answer !== null && pair && pair[1] - pair[0] === view.answer;
    const status = found ? text("Đã tìm thấy", "Found") : pointer === null ? text("Chưa bắt đầu", "Not started") : active && view.check === true ? text("Cùng màu → bỏ qua", "Same color → skip") : text("Đang tìm", "Searching");
    const houses = view.colors.map((color, index) => {
      const isAnchor = index === anchor;
      const isPointer = index === pointer;
      const skipped = pointer !== null && (first ? index > pointer : index < pointer);
      const endpoint = pair && (index === pair[0] || index === pair[1]);
      const between = pair && index > pair[0] && index < pair[1];
      const marker = [isAnchor ? text("cố định", "fixed") : "", isPointer ? (first ? "right ↓" : "left ↓") : ""].filter(Boolean).join(" · ");
      return `<div class="fh2078-house${isAnchor ? " anchor" : ""}${isPointer ? " pointer" : ""}${skipped ? " skipped" : ""}${endpoint ? " endpoint" : ""}${pair && index === pair[0] ? " pair-start" : ""}${pair && index === pair[1] ? " pair-end" : ""}${between ? " between" : ""}" data-index="${index}" data-color="${color}" style="--house-color:${paint(color)}"><small class="fh2078-marker">${marker || "&nbsp;"}</small><div class="fh2078-building"><div class="fh2078-roof"></div><div class="fh2078-wall"><b>${color}</b><span></span></div></div><small class="fh2078-index">[${index}]</small><span class="fh2078-road"></span></div>`;
    }).join("");
    const distance = pair ? `${pair[1]} − ${pair[0]} = <b>${pair[1] - pair[0]}</b>` : "—";
    return `<section class="fh2078-lane${active ? " active" : ""}${won ? " winner" : ""}${pointer === null ? " pending" : ""}" data-lane="${first ? "first" : "last"}"><header><div><strong>${first ? text("1 · Giữ nhà đầu tiên", "1 · Fix the first house") : text("2 · Giữ nhà cuối cùng", "2 · Fix the last house")}</strong><small>${first ? text("Quét right từ phải sang trái ←", "Scan right from right to left ←") : text("Quét left từ trái sang phải →", "Scan left from left to right →")}</small></div><span>${won ? text("Đạt lớn nhất ✓", "Maximum ✓") : status}</span></header><div class="fh2078-street">${houses}</div><div class="fh2078-distance"><span>${pair ? text(`Cặp (${pair[0]}, ${pair[1]}) · khác màu`, `Pair (${pair[0]}, ${pair[1]}) · different colors`) : text("Chưa có cặp hợp lệ", "No valid pair yet")}</span><code>${distance}</code></div></section>`;
  }
  const comparison = view.fromFirst === null && view.fromLast === null ? "" : `<section class="fh2078-comparison"><strong>${text("SO SÁNH HAI KHOẢNG CÁCH", "COMPARE BOTH DISTANCES")}</strong><div><article><small>from_first</small><b>${view.fromFirst ?? "—"}</b></article><span>max</span><article><small>from_last</small><b>${view.fromLast ?? "—"}</b></article><span>→</span><article class="answer"><small>${text("đáp án", "answer")}</small><b>${view.answer ?? "—"}</b></article></div><p>${view.answer === null ? text("Biến còn dấu — chưa được gán ở dòng code hiện tại.", "A variable shown as — has not been assigned at the current code line.") : view.fromFirst === view.fromLast ? text("Hai cặp cùng khoảng cách: cả hai đều đạt đáp án.", "Both pairs have the same distance and achieve the answer.") : text("Cặp được đánh dấu xanh có khoảng cách lớn hơn.", "The pair marked green has the larger distance.")}</p></section>`;
  $("treeView").innerHTML = `<section class="fh2078-viz" aria-label="${text("Mô phỏng hai nhà khác màu xa nhất 2078", "2078 furthest differently colored houses simulation")}"><header class="fh2078-heading"><div><small>2078 · GREEDY</small><h3>${text("Hai nhà khác màu xa nhất", "Furthest houses with different colors")}</h3></div><span>${view.answer === null ? text("Đang quét", "Scanning") : `${text("Đáp án", "Answer")}: ${view.answer}`}</span></header><div class="fh2078-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>${lane(true)}${lane(false)}${comparison}<p class="fh2078-legend">${text("Số trên nhà là mã màu; [i] là chỉ số. Viền vàng: con trỏ. Nhà mờ: đã bỏ qua vì cùng màu. Đường xanh: khoảng cách của cặp hợp lệ.", "Number on each house = color ID; [i] = index. Gold outline = pointer. Faded houses = skipped matching colors. Green road = valid pair distance.")}</p><details class="fh2078-proof"><summary>${text("Vì sao chỉ cần giữ hai đầu?", "Why do endpoints suffice?")}</summary><p>${text("Hai đầu khác màu thì đạt ngay n−1, là khoảng cách lớn nhất có thể. Nếu hai đầu cùng màu C, một cặp khác màu luôn có nhà khác C. Giữ nhà đó, kéo nhà còn lại về đầu đường bên ngoài cặp: vẫn khác màu và khoảng cách không giảm. Vì vậy chỉ cần xét các cặp có nhà 0 hoặc nhà n−1.", "Different endpoint colors give n−1, the largest possible distance. If both endpoints have color C, every valid pair has a house unlike C. Keep that house and extend the other to an endpoint outside the pair: the colors still differ and distance cannot decrease. Thus pairs containing house 0 or house n−1 suffice.")}</p></details></section>`;
  for (const first of [true, false]) {
    const street = $("treeView").querySelector(`[data-lane="${first ? "first" : "last"}"] .fh2078-street`);
    const pointer = street.querySelector(".pointer");
    if (pointer) street.scrollLeft = Math.max(0, pointer.offsetLeft - street.offsetLeft - street.clientWidth / 2 + pointer.offsetWidth / 2);
  }
}

function renderFurthestHouses2078ScanView(step) {
  const view = step.furthestHouses2078ScanView;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const distinct = [...new Set(view.colors)].sort((a, b) => a - b);
  const palette = ["#60a5fa", "#fb7185", "#34d399", "#fbbf24", "#a78bfa", "#22d3ee", "#fb923c", "#f472b6"];
  function lane(first) {
    const anchor = first ? 0 : view.n - 1;
    const cursor = first ? view.mirrored : view.i;
    const variable = first ? "left" : "right";
    const best = first ? view.left : view.right;
    const pair = first ? view.firstPair : view.lastPair;
    const active = view.branch === variable;
    const won = view.answer !== null && pair && best === view.answer;
    const houses = view.colors.map((color, index) => {
      const position = distinct.indexOf(color);
      const paint = position < palette.length ? palette[position] : `hsl(${position * 137.508 % 360} 65% 65%)`;
      const isAnchor = index === anchor;
      const isCursor = index === cursor;
      const endpoint = pair && (index === pair[0] || index === pair[1]);
      const visited = cursor !== null && (first ? index > cursor : index < cursor) && !endpoint && !isAnchor;
      const marker = [isAnchor ? text("cố định", "fixed") : "", isCursor ? (first ? "n−1−i ↓" : "i ↓") : ""].filter(Boolean).join(" · ");
      return `<div class="fh2078-house${isAnchor ? " anchor" : ""}${isCursor ? " pointer" : ""}${visited ? " visited" : ""}${endpoint ? " endpoint" : ""}${pair && index === pair[0] ? " pair-start" : ""}${pair && index === pair[1] ? " pair-end" : ""}${pair && index > pair[0] && index < pair[1] ? " between" : ""}" data-index="${index}" data-color="${color}" style="--house-color:${paint}"><small class="fh2078-marker">${marker || "&nbsp;"}</small><div class="fh2078-building"><div class="fh2078-roof"></div><div class="fh2078-wall"><b>${color}</b><span></span></div></div><small class="fh2078-index">[${index}]</small><span class="fh2078-road"></span></div>`;
    }).join("");
    const candidate = active ? `<div class="fh2078-candidate${view.different ? " valid" : " rejected"}">${view.different ? text(`Ứng viên: khoảng cách ${view.mirrored}`, `Candidate: distance ${view.mirrored}`) : text("Cùng màu → bỏ qua cặp hiện tại", "Same color → skip current pair")}${view.different ? `<code>${variable} = max(${view.before}, ${view.mirrored})${view.updated === null ? ` · ${text("chưa chạy", "pending")}` : ` = ${best}`}</code>` : ""}${view.updated !== null ? `<small>${view.updated ? text("Tăng kết quả, lưu cặp mới", "Increase best, retain new pair") : text("Giữ kết quả và cặp cũ", "Keep previous best and pair")}</small>` : ""}</div>` : "";
    return `<section class="fh2078-lane${active ? " active" : ""}${won ? " winner" : ""}" data-lane="${first ? "first" : "last"}"><header><div><strong>${variable} · ${first ? text("xa nhất với nhà 0", "furthest from house 0") : text(`xa nhất với nhà ${anchor}`, `furthest from house ${anchor}`)}</strong><small>${first ? text("Vị trí n−1−i quét sang trái ←", "Position n−1−i scans left ←") : text("Vị trí i quét sang phải →", "Position i scans right →")}</small></div><span>${won ? text("Đạt lớn nhất ✓", "Maximum ✓") : `${text("Tốt nhất", "Best")}: ${best ?? "—"}`}</span></header><div class="fh2078-street">${houses}</div><div class="fh2078-distance"><span>${pair ? text(`Cặp tốt nhất (${pair[0]}, ${pair[1]})`, `Best pair (${pair[0]}, ${pair[1]})`) : text("Chưa có cặp hợp lệ", "No valid pair yet")}</span><code>${pair ? `${pair[1]} − ${pair[0]} = <b>${best}</b>` : "—"}</code></div>${candidate}</section>`;
  }
  const beforeVars = Object.fromEntries(view.beforeVars.map(entry => [entry.name, entry.value]));
  const afterVars = Object.fromEntries(step.vars.map(entry => [entry.name, entry.value]));
  const changes = ["n", "i", "left", "right"].map(name => {
    const before = beforeVars[name];
    const after = afterVars[name];
    return `<article class="${before !== after ? "changed" : ""}" data-var="${name}"><small>${name}</small><span>${before ?? "—"} → <b>${after ?? "—"}</b></span></article>`;
  }).join("");
  const debuggerHtml = `<section class="fh2078-debug" data-line="${view.line}"><header><strong>${text("DEBUG TỪNG DÒNG", "LINE-BY-LINE DEBUG")}</strong><span>${text("Đã chạy dòng", "Executed line")} ${view.line}</span></header><pre class="fh2078-debug-source"><code>${escapeHtml(view.source.trim())}</code></pre><div class="fh2078-debug-values">${changes}</div><p>${text("Biến trước → sau dòng vừa chạy. — nghĩa là chưa được gán.", "Variables before → after the executed line. — means not assigned yet.")}</p>${view.skippedLine !== null ? `<p class="fh2078-skip">${text(`if là False → bỏ qua dòng ${view.skippedLine}.`, `if is False → skip line ${view.skippedLine}.`)}</p>` : ""}<div class="fh2078-debug-next">${view.nextLine === null ? text(`Hàm đã trả về ${view.answer}.`, `The function returned ${view.answer}.`) : `${text("Tiếp theo", "Next")}: ${text("dòng", "line")} ${view.nextLine}<code>${escapeHtml(view.nextSource.trim())}</code>`}</div></section>`;
  const counters = `<section class="fh2078-comparison"><strong>${text("left/right LƯU KHOẢNG CÁCH, KHÔNG PHẢI VỊ TRÍ", "left/right STORE DISTANCES, NOT POSITIONS")}</strong><div><article><small>left · ${text("với nhà đầu", "first house")}</small><b>${view.left ?? "—"}</b></article><span>max</span><article><small>right · ${text("với nhà cuối", "last house")}</small><b>${view.right ?? "—"}</b></article><span>→</span><article class="answer"><small>${text("trả về", "return")}</small><b>${view.answer ?? "—"}</b></article></div>${view.answer !== null ? `<p>${view.left === view.right ? text("Hai nhóm cặp cùng đạt đáp án.", "Both groups of pairs achieve the answer.") : text("Lấy khoảng cách lớn hơn giữa left và right.", "Take the larger distance between left and right.")}</p>` : ""}</section>`;
  $("treeView").innerHTML = `<section class="fh2078-viz fh2078-scan-viz" aria-label="${text("2078 cách 2 quét đồng thời hai đầu", "2078 approach 2 scan both ends")}"><header class="fh2078-heading"><div><small>2078 · ${text("CÁCH 2", "APPROACH 2")}</small><h3>${text("Một vòng for, xét từ hai đầu", "One for loop, both ends")}</h3></div><span>${view.answer === null ? (view.loopFinished ? text("Hết vòng for", "Loop finished") : view.i === null ? text("Khởi tạo", "Initialize") : `i = ${view.i}`) : `${text("Đáp án", "Answer")}: ${view.answer}`}</span></header><div class="fh2078-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>${debuggerHtml}<div class="fh2078-round">${view.i !== null ? `${text("Vòng", "Round")} ${view.i + 1}/${view.n}: <code>i = ${view.i}</code> · <code>n−1−i = ${view.mirrored}</code>` : view.loopFinished ? text(`Đã xét đủ ${view.n} vòng`, `Completed all ${view.n} rounds`) : text("Chưa bắt đầu vòng for", "The for loop has not started")}</div>${lane(false)}${lane(true)}${counters}<p class="fh2078-legend">${text("Số trên nhà là mã màu; [i] là chỉ số. Viền vàng: vị trí đang xét. Đường xanh: cặp tốt nhất đã lưu, có thể khác cặp đang xét. Nhà mờ: đã xét ở vòng trước.", "Number on each house = color ID; [i] = index. Gold outline = current position. Green road = retained best pair, which may differ from the current pair. Faded houses = examined in earlier rounds.")}</p></section>`;
  for (const first of [true, false]) {
    const street = $("treeView").querySelector(`[data-lane="${first ? "first" : "last"}"] .fh2078-street`);
    const focus = street.querySelector(view.answer === null ? ".pointer" : (first ? ".pair-end" : ".pair-start"));
    if (focus) street.scrollLeft = Math.max(0, focus.offsetLeft - street.offsetLeft - street.clientWidth / 2 + focus.offsetWidth / 2);
  }
}
