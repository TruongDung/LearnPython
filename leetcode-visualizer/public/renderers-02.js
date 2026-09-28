// ---- Linked List renderer (horizontal box nodes with next arrows + curved random arrows) ----
function renderLinkedList(step) {
  const { nodes, hlIdx, markIdx } = step.linkedList;
  // nodes: [{ val, randomTarget (val or null), randomIdx }]
  const n = nodes.length;
  const boxW = 90, boxH = 50, gap = 44, padX = 30, padY = 60;
  const totalW = padX * 2 + n * boxW + (n - 1) * gap;
  const totalH = padY * 2 + boxH + 80; // extra space for curved arrows below

  const hlSet = new Set(hlIdx || []);
  const markSet = new Set(markIdx || []);
  const light = document.documentElement.getAttribute("data-theme") === "light";

  const boxFill = light ? "#dbeafe" : "rgba(99,130,200,0.2)";
  const boxStroke = light ? "#3b82f6" : "#6366f1";
  const boxHlFill = light ? "#fef3c7" : "rgba(251,191,36,0.2)";
  const boxHlStroke = light ? "#f59e0b" : "#fbbf24";
  const boxMarkFill = light ? "#dcfce7" : "rgba(34,197,94,0.15)";
  const boxMarkStroke = light ? "#22c55e" : "#34d399";
  const textColor = light ? "#1e293b" : "#e2e8f0";
  const subColor = light ? "#64748b" : "#94a3b8";
  const arrowColor = light ? "#475569" : "#94a3b8";
  const randomColor = light ? "#7c3aed" : "#a78bfa";

  function nodeX(i) { return padX + i * (boxW + gap); }
  const nodeY = padY;

  let svg = "";

  // Arrowhead markers
  svg += `<defs>
    <marker id="ll-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${arrowColor}"/></marker>
    <marker id="ll-random-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${randomColor}"/></marker>
  </defs>`;

  // Next arrows (horizontal between boxes — from right dot to left edge of next box)
  for (let i = 0; i < n - 1; i++) {
    const x1 = nodeX(i) + boxW - 4;
    const x2 = nodeX(i + 1);
    const y = nodeY + boxH / 4;
    svg += `<line x1="${x1}" y1="${y}" x2="${x2 - 2}" y2="${y}" stroke="${arrowColor}" stroke-width="1.5" marker-end="url(#ll-arrow)" />`;
  }
  // Arrow to null box
  const nullX = nodeX(n - 1) + boxW + gap / 2;
  svg += `<line x1="${nodeX(n-1)+boxW-4}" y1="${nodeY+boxH/4}" x2="${nullX}" y2="${nodeY+boxH/4}" stroke="${arrowColor}" stroke-width="1.5" marker-end="url(#ll-arrow)" />`;
  svg += `<rect x="${nullX}" y="${nodeY + 4}" width="36" height="${boxH - 8}" rx="4" fill="none" stroke="${arrowColor}" stroke-dasharray="4 2" />`;
  svg += `<text x="${nullX+18}" y="${nodeY+boxH/2}" dy="0.35em" text-anchor="middle" font-size="11" fill="${subColor}">null</text>`;

  const hasCustomLabels = nodes.some((node) => typeof node.label === "string" && node.label.length > 0);

  // Random arrows (curved below)
  for (let i = 0; i < n; i++) {
    const rIdx = Number.isInteger(nodes[i].randomIdx) ? nodes[i].randomIdx : -1;
    if (rIdx < 0) continue; // null random
    const fromX = nodeX(i) + boxW / 2;
    const fromY = nodeY + boxH;
    const toX = nodeX(rIdx) + boxW / 2;
    const toY = nodeY + boxH;
    const dist = Math.abs(rIdx - i);
    const curveY = fromY + 20 + dist * 12; // curve depth proportional to distance
    svg += `<path d="M${fromX} ${fromY} C${fromX} ${curveY}, ${toX} ${curveY}, ${toX} ${toY}" fill="none" stroke="${randomColor}" stroke-width="1.2" stroke-dasharray="4 2" marker-end="url(#ll-random-arrow)" />`;
  }

  // Boxes
  for (let i = 0; i < n; i++) {
    const x = nodeX(i), y = nodeY;
    let fill = boxFill, stroke = boxStroke;
    if (hlSet.has(i)) { fill = boxHlFill; stroke = boxHlStroke; }
    else if (markSet.has(i)) { fill = boxMarkFill; stroke = boxMarkStroke; }

    svg += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />`;
    // Divider line
    svg += `<line x1="${x}" y1="${y + boxH/2}" x2="${x + boxW}" y2="${y + boxH/2}" stroke="${stroke}" stroke-width="0.5" opacity="0.5" />`;
    // Value (top half — centered, large)
    svg += `<text x="${x + boxW/2}" y="${y + boxH/4}" dy="0.35em" text-anchor="middle" font-size="14" font-weight="700" fill="${textColor}">${nodes[i].val}</text>`;
    // Bottom label: custom pointer/role label when provided; otherwise random pointer text.
    const bottomLabel = hasCustomLabels
      ? (nodes[i].label || "")
      : `rand→${nodes[i].randomIdx >= 0 ? nodes[nodes[i].randomIdx].val : "∅"}`;
    svg += `<text x="${x + boxW/2}" y="${y + 3*boxH/4}" dy="0.35em" text-anchor="middle" font-size="10" font-weight="700" fill="${hasCustomLabels ? subColor : randomColor}">${escapeHtml(bottomLabel)}</text>`;
    // Small dot at right edge top (next pointer origin)
    svg += `<circle cx="${x + boxW - 8}" cy="${y + boxH/4}" r="4" fill="${arrowColor}" opacity="0.5" />`;
    // Small dot at bottom center (random pointer origin)
    if (!hasCustomLabels) {
      svg += `<circle cx="${x + boxW/2}" cy="${y + boxH}" r="3" fill="${randomColor}" opacity="0.6" />`;
    }
  }

  $("treeView").innerHTML = `<svg viewBox="0 0 ${totalW + 50} ${totalH}" width="${totalW + 50}" height="${totalH}" class="tree-svg">${svg}</svg>`;
}

function renderOnlineElectionView(step) {
  const view = step.onlineElectionView;
  const el = $("treeView");
  const vi = lang === "vi";
  const queryAnswerStep = view.event === "return-query";
  const phaseIndex = view.phase === "done"
    ? 4
    : view.phase === "query"
      ? queryAnswerStep ? 3 : 2
      : ["store-leader", "preprocess-complete"].includes(view.event) ? 1 : 0;
  const phaseLabels = vi
    ? ["1 · Đếm phiếu", "2 · Lưu leader theo time", "3 · Binary search q(t)", "4 · Trả leader gần nhất"]
    : ["1 · Count votes", "2 · Save leader by time", "3 · Binary-search q(t)", "4 · Return latest leader"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  const queryMode = view.phase === "query";
  const finalMode = view.phase === "done";
  const timeline = view.times.map((time, index) => {
    const tags = [];
    if (queryMode && index === view.left) tags.push("L");
    if (queryMode && view.right !== null && index === view.right - 1) tags.push("R−1");
    if (queryMode && index === view.mid) tags.push("M");
    if (index === view.answerIndex) tags.push(vi ? "đáp án" : "answer");
    let state = "future";
    if (finalMode) state = "processed";
    else if (!queryMode) {
      if (index < view.processedCount) state = "processed";
      if (index === view.voteIndex) state = "current";
    } else if (view.left === null || view.right === null) {
      state = "active";
    } else if (index < view.left) {
      state = "before";
    } else if (index >= view.right) {
      state = "after";
    } else {
      state = "active";
    }
    if (index === view.mid) state += " mid";
    if (index === view.answerIndex) state += " answer";
    const storedLeader = queryMode || finalMode
      ? view.leaders[index]
      : index < view.storedLeaders.length ? view.storedLeaders[index] : null;
    return `<div class="election-point ${state}">
      <small>${escapeHtml(tags.join(" · ") || `i=${index}`)}</small>
      <strong>t=${time}</strong>
      <span>${vi ? "phiếu" : "vote"}: P${view.persons[index]}</span>
      <b>${storedLeader === null || storedLeader === undefined ? "leader: ?" : `leader: P${storedLeader}`}</b>
    </div>`;
  }).join("");
  const sentinel = queryMode
    ? `<div class="election-sentinel${view.left === view.times.length ? " pointer" : ""}"><small>${view.left === view.times.length ? "L" : ""}</small><strong>n=${view.times.length}</strong><span>${vi ? "biên phải" : "right edge"}</span></div>`
    : "";

  const scoreCards = view.scores.map((item) => {
    const isLeader = item.person === view.currentLeader;
    const isCurrent = item.person === view.currentPerson;
    return `<span class="election-score${isLeader ? " leader" : ""}${isCurrent ? " current" : ""}"><small>P${item.person}${isLeader ? ` · ${vi ? "leader" : "leader"}` : ""}</small><strong>${item.votes}</strong><i>${vi ? "phiếu" : "votes"}</i></span>`;
  }).join("");

  const results = view.queries.map((query, index) => {
    const completed = index < view.completedQueries || finalMode;
    const active = index === view.queryIndex && !finalMode;
    return `<span class="election-query-chip${completed ? " done" : ""}${active ? " active" : ""}"><small>q(${query})</small><strong>${completed ? `P${view.answers[index]}` : active ? "…" : "?"}</strong></span>`;
  }).join("");

  let actionHtml;
  if (view.event === "constructor-call") {
    actionHtml = `<div class="election-action setup"><small>CONSTRUCTOR</small><strong>${vi ? "Duyệt phiếu theo thứ tự thời gian" : "Process votes chronologically"}</strong><span>${vi ? "Mỗi vị trí i sẽ lưu leader ngay sau phiếu tại times[i]" : "Each index i stores the leader immediately after the vote at times[i]"}</span></div>`;
  } else if (["store-times", "init-leaders", "init-votes", "init-leader"].includes(view.event)) {
    actionHtml = `<div class="election-action setup"><small>${vi ? "KHỞI TẠO" : "INITIALIZE"}</small><strong>${escapeHtml(step.title[lang] || step.title.en)}</strong><span>${vi ? "Chuẩn bị timeline, bảng đếm và leader hiện tại" : "Prepare the timeline, vote counts, and current leader"}</span></div>`;
  } else if (view.event === "read-vote") {
    actionHtml = `<div class="election-action vote"><small>${vi ? "ĐỌC PHIẾU" : "READ VOTE"}</small><strong>t=${view.times[view.voteIndex]} → P${view.currentPerson}</strong><span>${vi ? "Phiếu chưa được cộng ở bước này" : "The vote has not been counted yet"}</span></div>`;
  } else if (view.event === "count-vote") {
    actionHtml = `<div class="election-action vote"><small>${vi ? "CỘNG PHIẾU" : "COUNT VOTE"}</small><strong>P${view.currentPerson}: ${view.currentScore} ${vi ? "phiếu" : "vote(s)"}</strong><span>votes[P${view.currentPerson}] += 1</span></div>`;
  } else if (view.event === "compare-leader") {
    const relation = view.currentScore >= view.previousLeaderScore ? "≥" : "<";
    actionHtml = `<div class="election-action compare${view.tieBreak ? " tie" : ""}"><small>${view.tieBreak ? (vi ? "HÒA → PHIẾU MỚI NHẤT THẮNG" : "TIE → MOST RECENT WINS") : (vi ? "SO PHIẾU" : "COMPARE COUNTS")}</small><strong>${view.currentScore} ${relation} ${view.previousLeaderScore ?? 0}</strong><span>${view.tieBreak ? `P${view.currentPerson} ${vi ? "trở thành leader vì vừa nhận phiếu" : "becomes leader because this vote is most recent"}` : (vi ? "Dùng >= để xử lý trường hợp hòa" : "Use >= to handle ties")}</span></div>`;
  } else if (view.event === "set-leader") {
    actionHtml = `<div class="election-action leader"><small>${vi ? "CẬP NHẬT LEADER" : "UPDATE LEADER"}</small><strong>leader = P${view.currentLeader}</strong><span>${view.tieBreak ? (vi ? "Hòa phiếu; người vừa nhận phiếu thắng" : "Tied count; the latest vote wins") : (vi ? "Ứng viên này đang có số phiếu cao nhất" : "This candidate now has the highest count")}</span></div>`;
  } else if (view.event === "store-leader") {
    actionHtml = `<div class="election-action leader"><small>${vi ? "LƯU SNAPSHOT" : "SAVE SNAPSHOT"}</small><strong>leaders[${view.voteIndex}] = P${view.currentLeader}</strong><span>time ${view.times[view.voteIndex]} → leader P${view.currentLeader}</span></div>`;
  } else if (view.event === "preprocess-complete") {
    actionHtml = `<div class="election-action ready"><small>${vi ? "TIỀN XỬ LÝ XONG" : "PREPROCESSING COMPLETE"}</small><strong>leaders = [${view.leaders.map((leader) => `P${leader}`).join(", ")}]</strong><span>${vi ? "Mỗi q(t) giờ chỉ cần tìm vị trí trên times" : "Each q(t) now only searches for a position in times"}</span></div>`;
  } else if (view.event === "query-call") {
    actionHtml = `<div class="election-action query"><small>${vi ? "TRUY VẤN" : "QUERY"}</small><strong>q(${view.queryTime})</strong><span>${vi ? `Tìm time đầu tiên > ${view.queryTime}, rồi lùi 1 vị trí` : `Find the first time > ${view.queryTime}, then step back once`}</span></div>`;
  } else if (view.event === "query-range") {
    actionHtml = `<div class="election-action query"><small>${vi ? "KHOẢNG NỬA MỞ" : "HALF-OPEN RANGE"}</small><strong>[L, R) = [${view.left}, ${view.right})</strong><span>${vi ? "R có thể bằng n và không phải index của phiếu" : "R may equal n and is not a vote index"}</span></div>`;
  } else if (view.event === "while-check") {
    actionHtml = `<div class="election-action condition ${view.whileResult ? "yes" : "no"}"><small>WHILE L &lt; R</small><strong>${view.left} &lt; ${view.right} → ${view.whileResult}</strong><span>${view.whileResult ? (vi ? "Khoảng vẫn còn vị trí cần kiểm tra" : "The range still has positions to inspect") : (vi ? "L là index đầu tiên có time > t" : "L is the first index with time > t")}</span></div>`;
  } else if (view.event === "compute-mid") {
    actionHtml = `<div class="election-action mid"><small>COMPUTE MID</small><strong>M=${view.mid} → times[M]=${view.times[view.mid]}</strong><span>${view.times[view.mid]} ${view.times[view.mid] <= view.queryTime ? "≤" : ">"} q=${view.queryTime}</span></div>`;
  } else if (view.event === "compare-time") {
    const moveLeft = view.times[view.mid] <= view.queryTime;
    actionHtml = `<div class="election-action compare ${moveLeft ? "past" : "future"}"><small>times[M] &lt;= t</small><strong>${view.times[view.mid]} ${moveLeft ? "≤" : ">"} ${view.queryTime}</strong><span>${moveLeft ? (vi ? "Phiếu này đã xảy ra; tìm time muộn hơn" : "This vote has happened; search later") : (vi ? "Phiếu này ở tương lai; giữ M và tìm bên trái" : "This vote is in the future; keep M and search left")}</span></div>`;
  } else if (view.event === "move-left") {
    actionHtml = `<div class="election-action move past"><small>${vi ? "BỎ PHẦN ĐÃ XẢY RA" : "REMOVE PAST PREFIX"}</small><strong>L = M + 1 = ${view.left}</strong><span>${vi ? "Mọi index ≤ M đều có time ≤ t" : "Every index ≤ M has time ≤ t"}</span></div>`;
  } else if (view.event === "else-branch") {
    actionHtml = `<div class="election-action compare future"><small>ELSE</small><strong>times[M] &gt; t</strong><span>${vi ? "Tiếp theo đặt R=M; không bỏ M" : "Next set R=M; do not remove M"}</span></div>`;
  } else if (view.event === "move-right") {
    actionHtml = `<div class="election-action move future"><small>${vi ? "GIỮ M, THU HẸP BÊN TRÁI" : "KEEP M, SHRINK LEFT"}</small><strong>R = M = ${view.right}</strong><span>${vi ? "M vẫn có thể là time đầu tiên > t" : "M may still be the first time > t"}</span></div>`;
  } else if (view.event === "return-query") {
    actionHtml = `<div class="election-action result"><small>${vi ? "LÙI MỘT VỊ TRÍ" : "STEP BACK ONCE"}</small><strong>L=${view.left} → L−1=${view.answerIndex}</strong><span>leaders[${view.answerIndex}] = P${view.leaders[view.answerIndex]}</span></div>`;
  } else {
    actionHtml = `<div class="election-action result"><small>${vi ? "HOÀN TẤT" : "COMPLETE"}</small><strong>[${view.answers.map((answer) => `P${answer}`).join(", ")}]</strong><span>${vi ? "Mỗi truy vấn dùng O(log n) sau O(n) tiền xử lý" : "Each query takes O(log n) after O(n) preprocessing"}</span></div>`;
  }

  const queryGuide = queryMode
    ? `<div class="election-query-guide"><span><small>${vi ? "MỤC TIÊU" : "GOAL"}</small><strong>${vi ? `time đầu tiên > ${view.queryTime}` : `first time > ${view.queryTime}`}</strong></span><i>→</i><span><small>${vi ? "LEADER CẦN TRẢ" : "LEADER TO RETURN"}</small><strong>${view.answerIndex === null ? `leaders[L−1]` : `leaders[${view.answerIndex}] = P${view.leaders[view.answerIndex]}`}</strong></span></div>`
    : "";
  const legendHtml = queryMode
    ? `<span><i class="before"></i>${vi ? "time ≤ query / đã bỏ" : "time ≤ query / removed"}</span><span><i class="active"></i>${vi ? "đang tìm" : "active"}</span><span><i class="after"></i>${vi ? "time > query" : "time > query"}</span><span><i class="answer"></i>${vi ? "leader được trả" : "returned leader"}</span>`
    : `<span><i class="before"></i>${vi ? "đã lưu leader" : "leader saved"}</span><span><i class="current"></i>${vi ? "phiếu hiện tại" : "current vote"}</span><span><i class="future"></i>${vi ? "chưa xử lý" : "not processed"}</span>`;

  el.innerHTML = `<div class="election-viz">
    <div class="election-phases">${phases}</div>
    <div class="election-summary">
      <span><small>${vi ? "PHIẾU ĐÃ LƯU" : "STORED VOTES"}</small><strong>${queryMode || finalMode ? view.times.length : view.processedCount} / ${view.times.length}</strong></span>
      <span><small>${vi ? "TRUY VẤN HIỆN TẠI" : "CURRENT QUERY"}</small><strong>${view.queryTime === null ? "—" : `q(${view.queryTime})`}</strong></span>
      <span><small>${vi ? "KHOẢNG [L,R)" : "RANGE [L,R)"}</small><strong>${view.left === null ? "—" : `[${view.left}, ${view.right})`}</strong></span>
    </div>
    <div class="election-timeline" role="img" aria-label="${escapeHtml(vi ? "Timeline phiếu và leader sau từng phiếu" : "Vote timeline and leader after each vote")}">${timeline}${sentinel}</div>
    <div class="election-legend">${legendHtml}</div>
    ${queryMode ? queryGuide : `<div class="election-scores"><small>${vi ? "BẢNG ĐẾM PHIẾU" : "VOTE COUNTS"}</small>${scoreCards}</div>`}
    ${actionHtml}
    <div class="election-queries"><small>${vi ? "KẾT QUẢ q(t)" : "q(t) RESULTS"}</small>${results}</div>
  </div>`;
}

function renderShipCapacityView(step) {
  const view = step.shipCapacityView;
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseIndex = { setup: 0, range: 1, simulate: 2, decision: 3, shrink: 3, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Chọn khoảng capacity", "2 · Thử capacity giữa", "3 · Xếp hàng theo từng ngày", "4 · Giữ nửa đúng"]
    : ["1 · Set capacity range", "2 · Try middle capacity", "3 · Load packages by day", "4 · Keep the correct half"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  const chosenCapacity = Number.isInteger(view.answer) ? view.answer : view.mid;
  const domainCount = view.initialHi - view.initialLo + 1;
  let capacities;
  if (domainCount <= 24) {
    capacities = Array.from({ length: domainCount }, (_, index) => view.initialLo + index);
  } else {
    capacities = [...new Set([
      view.initialLo,
      view.lo - 1,
      view.lo,
      view.mid,
      view.hi,
      view.hi + 1,
      view.initialHi,
      ...(view.tested || []).map((item) => item.capacity),
    ].filter((capacity) => Number.isInteger(capacity) && capacity >= view.initialLo && capacity <= view.initialHi))].sort((a, b) => a - b);
  }

  const capacityCells = capacities.map((capacity, index) => {
    const isAnswer = capacity === view.answer;
    const isMid = capacity === view.mid && !isAnswer;
    let zone = "active";
    if (view.event === "done") zone = capacity < view.answer ? "slow" : capacity > view.answer ? "works" : "answer";
    else if (capacity < view.lo) zone = "slow";
    else if (capacity > view.hi) zone = "works";
    const tested = (view.tested || []).find((item) => item.capacity === capacity);
    const gapBefore = index > 0 && capacity - capacities[index - 1] > 1;
    const labels = [
      isAnswer ? { text: vi ? "đáp án" : "answer", type: "is-answer" } : null,
      isMid ? { text: "mid", type: "is-mid" } : null,
      capacity === view.lo && capacity === view.hi
        ? { text: "lo = hi", type: "is-boundary" }
        : capacity === view.lo
          ? { text: "lo", type: "is-boundary" }
          : capacity === view.hi
            ? { text: "hi", type: "is-boundary" }
            : null,
    ].filter(Boolean);
    const labelHtml = labels.length
      ? labels.map((label) => `<span class="${label.type}">${escapeHtml(label.text)}</span>`).join("")
      : '<span aria-hidden="true">&nbsp;</span>';
    return `${gapBefore ? '<span class="koko-speed-gap">…</span>' : ""}<span class="koko-speed-cell ${zone}${isMid ? " mid" : ""}${isAnswer ? " answer" : ""}"><small class="ship-capacity-labels">${labelHtml}</small><strong>${capacity}</strong><em>${tested ? `${tested.neededDays}d` : ""}</em></span>`;
  }).join("");

  const waitingPackages = `<div class="ship-package-queue">${view.weights.map((weight, index) => `<span><small>#${index}</small><strong>${weight}</strong></span>`).join("")}</div>`;
  const scheduleRows = (view.schedule || []).map((day) => {
    const percentage = Math.min(100, (day.load / chosenCapacity) * 100);
    const packages = day.packages.map((pkg) => `<span class="ship-package" style="flex-grow:${Math.max(1, pkg.weight)}"><small>#${pkg.index}</small><strong>${pkg.weight}</strong></span>`).join("");
    return `<div class="ship-day-row">
      <span class="ship-day-label">${vi ? "Ngày" : "Day"} ${day.day}</span>
      <div class="ship-day-packages">${packages}</div>
      <div class="ship-load"><div><span style="width:${percentage}%"></span></div><strong>${day.load} / ${chosenCapacity}</strong></div>
    </div>`;
  }).join("");
  const scheduleHtml = Number.isInteger(chosenCapacity)
    ? `<div class="ship-days"><div class="ship-days-title"><strong>${vi ? "Xếp liên tiếp, giữ nguyên thứ tự" : "Load consecutively, preserving order"}</strong><span>capacity = ${chosenCapacity}</span></div>${scheduleRows}</div>`
    : `<div class="ship-days pending"><div class="ship-days-title"><strong>${vi ? "Hàng đợi kiện hàng" : "Package queue"}</strong><span>${vi ? "chưa chọn capacity" : "capacity not chosen"}</span></div>${waitingPackages}</div>`;

  const dayEquation = Number.isInteger(view.neededDays)
    ? `<div class="ship-days-equation"><span>${vi ? "Cần" : "Needs"}</span><strong>${view.neededDays} ${vi ? "ngày" : "days"}</strong><i>${view.neededDays <= view.days ? "≤" : ">"}</i><strong>${view.days} ${vi ? "ngày cho phép" : "allowed"}</strong><b class="${view.neededDays <= view.days ? "works" : "slow"}">${view.neededDays <= view.days ? (vi ? "CHỞ KỊP" : "FITS") : (vi ? "TÀU QUÁ NHỎ" : "TOO SMALL")}</b></div>`
    : "";

  let actionHtml;
  if (view.event === "init-range") {
    actionHtml = `<div class="koko-action setup"><small>${vi ? "CẬN AN TOÀN" : "SAFE BOUNDS"}</small><strong>max(weights) = ${view.initialLo} · sum(weights) = ${view.initialHi}</strong><span>${vi ? "Nhỏ hơn max: kiện nặng nhất không lên tàu · sum: chở tất cả trong 1 ngày" : "Below max: the heaviest package cannot fit · sum: ship everything in one day"}</span></div>`;
  } else if (view.event === "while-check") {
    actionHtml = `<div class="koko-action condition ${view.whileResult ? "yes" : "no"}"><small>WHILE lo &lt; hi</small><strong>${view.lo} &lt; ${view.hi} → ${view.whileResult}</strong><span>${view.whileResult ? (vi ? "Vẫn còn nhiều capacity cần phân biệt" : "Multiple capacities remain") : (vi ? "lo gặp hi: đã tìm biên khả thi đầu tiên" : "lo meets hi: first feasible capacity found")}</span></div>`;
  } else if (view.event === "compute-mid") {
    actionHtml = `<div class="koko-action mid"><small>COMPUTE MID</small><strong>(${view.lo} + ${view.hi}) // 2 = ${view.mid}</strong><span>${vi ? `Thử tàu có sức chứa ${view.mid}` : `Try a ship with capacity ${view.mid}`}</span></div>`;
  } else if (view.event === "calculate-days") {
    actionHtml = `<div class="koko-action count"><small>${vi ? "MÔ PHỎNG CHẤT HÀNG" : "SIMULATE LOADING"}</small><strong>needed_days = ${view.neededDays}</strong><span>${vi ? "Kiện tiếp theo không vừa thì bắt đầu ngày mới" : "Start a new day when the next package does not fit"}</span></div>`;
  } else if (view.event === "feasible-check") {
    actionHtml = `<div class="koko-action decision ${view.feasible ? "works" : "slow"}"><small>IF needed_days &lt;= days</small><strong>${view.neededDays} ${view.feasible ? "≤" : ">"} ${view.days} → ${view.feasible}</strong><span>${view.feasible ? (vi ? "capacity đủ; giữ mid và thử tàu nhỏ hơn" : "capacity works; keep mid and try smaller") : (vi ? "capacity quá nhỏ; mọi giá trị ≤ mid đều bị loại" : "capacity is too small; remove every value ≤ mid")}</span></div>`;
  } else if (view.event === "move-hi") {
    actionHtml = `<div class="koko-action move works"><small>${vi ? "GIỮ NỬA TRÁI" : "KEEP LEFT HALF"}</small><strong>hi = mid = ${view.mid}</strong><span>[${view.previousLo}, ${view.previousHi}] → [${view.lo}, ${view.hi}] · ${vi ? "giữ mid vì mid đang chở kịp" : "keep mid because it currently works"}</span></div>`;
  } else if (view.event === "else-branch") {
    actionHtml = `<div class="koko-action decision slow"><small>ELSE</small><strong>${view.neededDays} &gt; ${view.days}</strong><span>${vi ? "Điều kiện if sai; bước tiếp theo tăng lo" : "The if condition is false; increase lo next"}</span></div>`;
  } else if (view.event === "move-lo") {
    actionHtml = `<div class="koko-action move slow"><small>${vi ? "BỎ NỬA TRÁI" : "REMOVE LEFT HALF"}</small><strong>lo = mid + 1 = ${view.lo}</strong><span>[${view.previousLo}, ${view.previousHi}] → [${view.lo}, ${view.hi}] · ${vi ? `loại mọi capacity ≤ ${view.mid}` : `remove every capacity ≤ ${view.mid}`}</span></div>`;
  } else {
    const proof = view.smallerDays === null
      ? (vi ? `${view.answer}=max(weights), không thể dùng tàu nhỏ hơn` : `${view.answer}=max(weights), so no smaller ship can work`)
      : vi
        ? `C=${view.answer}: ${view.neededDays} ngày ≤ ${view.days} · C=${view.answer - 1}: ${view.smallerDays} ngày > ${view.days}`
        : `C=${view.answer}: ${view.neededDays}d ≤ ${view.days}d · C=${view.answer - 1}: ${view.smallerDays}d > ${view.days}d`;
    actionHtml = `<div class="koko-action result"><small>${vi ? "CHỨNG MINH NHỎ NHẤT" : "MINIMUM PROOF"}</small><strong>return ${view.answer}</strong><span>${proof}</span></div>`;
  }

  const testedHtml = (view.tested || []).length
    ? `<div class="koko-tested"><small>${vi ? "ĐÃ THỬ" : "TESTED"}</small>${view.tested.map((item) => `<span class="${item.feasible ? "works" : "slow"}">C=${item.capacity} → ${item.neededDays}d ${item.feasible ? "✓" : "✕"}</span>`).join("")}</div>`
    : "";
  const totalWeight = view.weights.reduce((sum, weight) => sum + weight, 0);

  el.innerHTML = `<div class="koko-speed-viz ship-capacity-viz">
    <div class="koko-phases">${phases}</div>
    <div class="koko-summary">
      <span><small>${vi ? "GIỚI HẠN" : "DEADLINE"}</small><strong>${view.days}d</strong></span>
      <span><small>${vi ? "KHOẢNG CAPACITY" : "CAPACITY RANGE"}</small><strong>[${view.lo}, ${view.hi}]</strong></span>
      <span><small>${vi ? "TỔNG KHỐI LƯỢNG" : "TOTAL WEIGHT"}</small><strong>${totalWeight}</strong></span>
    </div>
    <div class="koko-speed-line" role="img" aria-label="${escapeHtml(vi ? `Khoảng capacity đang tìm [${view.lo}, ${view.hi}]` : `Active capacity range [${view.lo}, ${view.hi}]`)}">${capacityCells}</div>
    <div class="koko-speed-legend"><span><i class="slow"></i>${vi ? "quá nhỏ / đã loại" : "too small / removed"}</span><span><i class="active"></i>${vi ? "đang tìm" : "active range"}</span><span><i class="works"></i>${vi ? "chở kịp" : "fits deadline"}</span></div>
    ${scheduleHtml}
    ${dayEquation}
    ${actionHtml}
    ${testedHtml}
  </div>`;
}

function renderKokoSpeedView(step) {
  const view = step.kokoSpeedView;
  const el = $("treeView");
  const vi = lang === "vi";
  const manualCeil = Number(view.approach) === 2;
  const lowerName = manualCeil ? "start" : "lo";
  const upperName = manualCeil ? "end" : "hi";
  const phaseIndex = { setup: 0, range: 1, hours: 2, decision: 3, shrink: 3, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Chọn khoảng tốc độ", "2 · Thử tốc độ giữa", "3 · Tính giờ từng đống", "4 · Giữ nửa đúng"]
    : ["1 · Set speed range", "2 · Try middle speed", "3 · Count each pile's hours", "4 · Keep the correct half"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  const chosenSpeed = Number.isInteger(view.answer) ? view.answer : view.mid;
  const activeRange = `[${view.lo}, ${view.hi}]`;
  const statusValue = view.totalHours === null
    ? (vi ? "chưa tính" : "not counted")
    : `${view.totalHours} / ${view.h} ${vi ? "giờ" : "hours"}`;

  const domainCount = view.initialHi - view.initialLo + 1;
  let speedValues;
  if (domainCount <= 24) {
    speedValues = Array.from({ length: domainCount }, (_, index) => view.initialLo + index);
  } else {
    speedValues = [...new Set([
      view.initialLo,
      view.lo - 1,
      view.lo,
      view.mid,
      view.hi,
      view.hi + 1,
      view.initialHi,
      ...(view.tested || []).map((item) => item.speed),
    ].filter((value) => Number.isInteger(value) && value >= view.initialLo && value <= view.initialHi))].sort((a, b) => a - b);
  }

  const speedCells = speedValues.map((speed, index) => {
    const isAnswer = speed === view.answer;
    const isMid = speed === view.mid && !isAnswer;
    let zone = "active";
    if (view.event === "done") zone = speed < view.answer ? "slow" : speed > view.answer ? "works" : "answer";
    else if (speed < view.lo) zone = "slow";
    else if (speed > view.hi) zone = "works";
    const tested = (view.tested || []).find((item) => item.speed === speed);
    const gapBefore = index > 0 && speed - speedValues[index - 1] > 1;
    const labels = [
      isAnswer ? { text: vi ? "đáp án" : "answer", type: "is-answer" } : null,
      isMid ? { text: "mid", type: "is-mid" } : null,
      speed === view.lo && speed === view.hi
        ? { text: `${lowerName}=${upperName}`, type: "is-boundary" }
        : speed === view.lo
          ? { text: lowerName, type: "is-boundary" }
          : speed === view.hi
            ? { text: upperName, type: "is-boundary" }
            : null,
    ].filter(Boolean);
    const labelHtml = labels.length
      ? labels.map((label) => `<span class="${label.type}">${escapeHtml(label.text)}</span>`).join("")
      : '<span aria-hidden="true">&nbsp;</span>';
    const hours = tested ? `${tested.hours}h` : "";
    return `${gapBefore ? '<span class="koko-speed-gap">…</span>' : ""}<span class="koko-speed-cell ${zone}${isMid ? " mid" : ""}${isAnswer ? " answer" : ""}"><small class="koko-speed-labels">${labelHtml}</small><strong>${speed}</strong><em>${hours}</em></span>`;
  }).join("");

  const perPile = view.perPile || [];
  const pileRows = view.piles.map((pile, index) => {
    const detail = perPile[index];
    if (!detail || !Number.isInteger(chosenSpeed)) {
      return `<div class="koko-pile-row"><span class="koko-pile-id">${vi ? "Đống" : "Pile"} ${index + 1}</span><strong>${pile} 🍌</strong><span class="koko-pile-wait">${vi ? "chờ chọn tốc độ" : "waiting for a speed"}</span></div>`;
    }
    const visibleHours = Math.min(detail.hours, 10);
    const hourChips = Array.from({ length: visibleHours }, (_, hourIndex) => {
      const eaten = hourIndex < detail.hours - 1 || detail.remainder === 0 ? chosenSpeed : detail.remainder;
      return `<span>${Math.min(eaten, pile)}<small>h${hourIndex + 1}</small></span>`;
    }).join("");
    const extra = detail.hours > visibleHours ? `<b>+${detail.hours - visibleHours}</b>` : "";
    return `<div class="koko-pile-row">
      <span class="koko-pile-id">${vi ? "Đống" : "Pile"} ${index + 1}</span>
      <strong>${pile} 🍌</strong>
      <div class="koko-hour-chips" aria-label="${escapeHtml(`${detail.hours} hours`)}">${hourChips}${extra}</div>
      <code>${manualCeil ? `${pile} // ${chosenSpeed}${detail.remainder === 0 ? "" : " + 1"}` : `ceil(${pile} / ${chosenSpeed})`} = ${detail.hours}h</code>
    </div>`;
  }).join("");

  const hourEquation = perPile.length
    ? `<div class="koko-hours-equation"><span>${perPile.map((item) => item.hours).join(" + ")}</span><i>=</i><strong>${view.totalHours}</strong><i>${view.totalHours <= view.h ? "≤" : ">"}</i><strong>h = ${view.h}</strong><b class="${view.totalHours <= view.h ? "works" : "slow"}">${view.totalHours <= view.h ? (vi ? "KỊP" : "WORKS") : (vi ? "QUÁ CHẬM" : "TOO SLOW")}</b></div>`
    : `<div class="koko-hours-equation pending"><span>${manualCeil
      ? (vi ? "Chọn mid, rồi dùng % và // để làm tròn từng đống" : "Choose mid, then use % and // to round each pile up")
      : (vi ? "Chọn mid rồi tính ceil(pile / mid) cho từng đống" : "Choose mid, then compute ceil(pile / mid) for every pile")}</span></div>`;

  let actionHtml;
  if (view.event === "init-range") {
    actionHtml = `<div class="koko-action setup"><small>${vi ? "KHOẢNG BAN ĐẦU" : "INITIAL RANGE"}</small><strong>${lowerName} = 1 · ${upperName} = max(piles) = ${view.initialHi}</strong><span>${vi ? `${upperName} luôn đủ nhanh: mỗi đống chỉ cần 1 giờ` : `${upperName} is guaranteed fast enough: every pile takes one hour`}</span></div>`;
  } else if (view.event === "while-check") {
    actionHtml = `<div class="koko-action condition ${view.whileResult ? "yes" : "no"}"><small>WHILE ${lowerName} &lt; ${upperName}</small><strong>${view.lo} &lt; ${view.hi} → ${view.whileResult}</strong><span>${view.whileResult ? (vi ? "Còn nhiều tốc độ cần phân biệt" : "Multiple candidate speeds remain") : (vi ? `${lowerName} gặp ${upperName}: đây là tốc độ khả thi đầu tiên` : `${lowerName} meets ${upperName}: this is the first feasible speed`)}</span></div>`;
  } else if (view.event === "compute-mid") {
    actionHtml = `<div class="koko-action mid"><small>COMPUTE MID</small><strong>(${view.lo} + ${view.hi}) // 2 = ${view.mid}</strong><span>${vi ? `Thử ăn ${view.mid} quả/giờ` : `Try eating ${view.mid} bananas/hour`}</span></div>`;
  } else if (view.event === "calculate-hours") {
    actionHtml = `<div class="koko-action count"><small>${vi ? "TÍNH TỔNG GIỜ" : "COUNT TOTAL HOURS"}</small><strong>hours = ${view.totalHours}</strong><span>${manualCeil ? (vi ? "Chia hết: pile // mid · Có dư: pile // mid + 1" : "Divisible: pile // mid · Remainder: pile // mid + 1") : (vi ? "Mỗi đống làm tròn lên riêng biệt bằng math.ceil" : "Round each pile up separately with math.ceil")}</span></div>`;
  } else if (view.event === "feasible-check") {
    actionHtml = `<div class="koko-action decision ${view.feasible ? "works" : "slow"}"><small>${manualCeil ? "IF hours &gt; h" : "IF hours &lt;= h"}</small><strong>${manualCeil ? `${view.totalHours} > ${view.h} → ${!view.feasible}` : `${view.totalHours} ${view.feasible ? "≤" : ">"} ${view.h} → ${view.feasible}`}</strong><span>${view.feasible ? (vi ? `mid kịp giờ; giữ mid bằng ${upperName} = mid` : `mid works; keep it with ${upperName} = mid`) : (vi ? `mid quá chậm; tăng ${lowerName} = mid + 1` : `mid is too slow; increase ${lowerName} = mid + 1`)}</span></div>`;
  } else if (view.event === "move-hi") {
    actionHtml = `<div class="koko-action move works"><small>${vi ? "GIỮ NỬA TRÁI" : "KEEP LEFT HALF"}</small><strong>${upperName} = mid = ${view.mid}</strong><span>[${view.previousLo}, ${view.previousHi}] → [${view.lo}, ${view.hi}] · ${vi ? "không bỏ mid vì mid có thể là đáp án" : "do not remove mid because it may be the answer"}</span></div>`;
  } else if (view.event === "else-branch") {
    actionHtml = manualCeil
      ? `<div class="koko-action decision works"><small>ELSE</small><strong>${view.totalHours} ≤ ${view.h}</strong><span>${vi ? `Kịp giờ; tiếp theo đặt ${upperName} = mid` : `On time; set ${upperName} = mid next`}</span></div>`
      : `<div class="koko-action decision slow"><small>ELSE</small><strong>${view.totalHours} &gt; ${view.h}</strong><span>${vi ? "Điều kiện if sai; tiếp theo tăng lo" : "The if condition is false; increase lo next"}</span></div>`;
  } else if (view.event === "move-lo") {
    actionHtml = `<div class="koko-action move slow"><small>${vi ? "BỎ NỬA TRÁI" : "REMOVE LEFT HALF"}</small><strong>${lowerName} = mid + 1 = ${view.lo}</strong><span>[${view.previousLo}, ${view.previousHi}] → [${view.lo}, ${view.hi}] · ${vi ? `loại mọi tốc độ ≤ ${view.mid}` : `remove every speed ≤ ${view.mid}`}</span></div>`;
  } else {
    const proof = view.answer === 1
      ? (vi ? `1 là tốc độ nhỏ nhất có thể và chỉ cần ${view.totalHours} giờ` : `1 is the smallest possible speed and needs only ${view.totalHours} hours`)
      : `${view.answer}: ${view.totalHours}h ≤ ${view.h}h · ${view.answer - 1}: ${view.slowerHours}h > ${view.h}h`;
    actionHtml = `<div class="koko-action result"><small>${vi ? "CHỨNG MINH NHỎ NHẤT" : "MINIMUM PROOF"}</small><strong>return ${lowerName} = ${view.answer}</strong><span>${proof}</span></div>`;
  }

  const testedHtml = (view.tested || []).length
    ? `<div class="koko-tested"><small>${vi ? "ĐÃ THỬ" : "TESTED"}</small>${view.tested.map((item) => `<span class="${item.feasible ? "works" : "slow"}">k=${item.speed} → ${item.hours}h ${item.feasible ? "✓" : "✕"}</span>`).join("")}</div>`
    : "";

  el.innerHTML = `<div class="koko-speed-viz">
    <div class="koko-phases">${phases}</div>
    <div class="koko-summary">
      <span><small>${vi ? "GIỚI HẠN" : "TIME LIMIT"}</small><strong>${view.h}h</strong></span>
      <span><small>${vi ? "KHOẢNG TỐC ĐỘ" : "SPEED RANGE"}</small><strong>${activeRange}</strong></span>
      <span><small>${vi ? "TỔNG GIỜ" : "TOTAL TIME"}</small><strong>${statusValue}</strong></span>
    </div>
    <div class="koko-speed-line" role="img" aria-label="${escapeHtml(vi ? `Khoảng tốc độ đang tìm ${activeRange}` : `Active speed range ${activeRange}`)}">${speedCells}</div>
    <div class="koko-speed-legend"><span><i class="slow"></i>${vi ? "quá chậm / đã loại" : "too slow / removed"}</span><span><i class="active"></i>${vi ? "đang tìm" : "active range"}</span><span><i class="works"></i>${vi ? "đủ nhanh" : "fast enough"}</span></div>
    <div class="koko-piles"><div class="koko-piles-title"><strong>${vi ? "Mỗi đống mất bao nhiêu giờ?" : "How many hours does each pile take?"}</strong><span>${Number.isInteger(chosenSpeed) ? `speed = ${chosenSpeed} 🍌/h` : "speed = ?"}</span></div>${pileRows}</div>
    ${hourEquation}
    ${actionHtml}
    ${testedHtml}
  </div>`;
}

// ---- 1520 Maximum Number of Non-Overlapping Substrings renderer ----
function renderNonOverlapView(step) {
  const view = step.nonOverlapView || {};
  const vi = lang === "vi";
  const s = String(view.s || "");
  const n = Number(view.n) || s.length;
  const phase = view.phase || "";
  const chars = Array.isArray(view.chars) ? view.chars : [];
  const intervals = Array.isArray(view.intervals) ? view.intervals : [];
  const selected = Array.isArray(view.selected) ? view.selected : [];
  const scanIndex = Number(view.scanIndex);
  const ex = view.expand || null;
  const end = Number(view.end);
  const curIv = Number(view.currentIv);

  // ── Phase strip ─────────────────────────────────────────────────────────
  const stageOf = { intro: 0, scan: 0, "first-last": 0, expand: 1, sorted: 2, greedy: 3, done: 4 };
  const stage = stageOf[phase] === undefined ? 0 : stageOf[phase];
  const stageLabels = vi
    ? ["1 · first/last mỗi ký tự", "2 · Mở rộng thành khoảng đóng", "3 · Sort theo điểm cuối", "4 · Chọn tham lam"]
    : ["1 · first/last per char", "2 · Expand to closed intervals", "3 · Sort by end", "4 · Greedy pick"];
  const stages = stageLabels.map((label, i) => {
    const cls = i < stage ? "done" : i === stage ? "active" : "pending";
    return `<span class="${cls}">${i < stage ? "✓" : i === stage ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // ── String strip + interval lanes (one SVG so they align) ───────────────
  const cellW = 34;
  const padL = 10;
  const svgW = Math.max(240, padL * 2 + n * cellW);
  const laneH = 17;
  const visibleIvs = intervals.filter((iv) => iv.state !== "discarded");
  const laneCount = Math.max(1, visibleIvs.length);
  const stripY = 52;
  const svgH = stripY + 30 + laneCount * laneH + 12;

  const selRanges = selected.map((x) => [x.l, x.r]);
  const inSelected = (i) => selRanges.some(([a, b]) => i >= a && i <= b);
  const inExpand = (i) => ex && !ex.done && i >= ex.l && i <= ex.r;

  let cells = "";
  for (let i = 0; i < n; i++) {
    const cx = padL + i * cellW + cellW / 2;
    const cls = ["no-cell"];
    if (phase === "scan") { if (i === scanIndex) cls.push("cur"); else if (i < scanIndex) cls.push("seen"); else cls.push("future"); }
    if (inSelected(i)) cls.push("picked");
    if (ex && inExpand(i)) cls.push("inwin");
    if (ex && ex.j === i && !ex.done) cls.push("cur");
    if (ex && ex.badChar && s[i] === ex.badChar && Number(ex.badFirst) === i) cls.push("bad");
    cells += `<g class="${cls.join(" ")}" transform="translate(${cx},${stripY})">
      <rect x="-15" y="-17" width="30" height="34" rx="5"></rect>
      <text class="no-ch" y="5">${escapeHtml(s[i])}</text>
      <text class="no-ix" y="28">${i}</text>
    </g>`;
  }

  // expand window bracket
  let winBar = "";
  if (ex) {
    const x1 = padL + ex.l * cellW + 2;
    const x2 = padL + (ex.r + 1) * cellW - 2;
    winBar = `<rect class="no-window ${ex.valid ? "" : "invalid"}" x="${x1}" y="${stripY - 24}" width="${Math.max(4, x2 - x1)}" height="48" rx="6"></rect>`;
  }

  // interval lanes
  let lanes = "";
  visibleIvs.forEach((iv, k) => {
    const y = stripY + 34 + k * laneH;
    const x1 = padL + iv.l * cellW + 3;
    const x2 = padL + (iv.r + 1) * cellW - 3;
    const isCur = curIv >= 0 && intervals.indexOf(iv) === curIv;
    const cls = ["no-bar", iv.state];
    if (isCur) cls.push("current");
    lanes += `<g class="${cls.join(" ")}">
      <rect x="${x1}" y="${y}" width="${Math.max(6, x2 - x1)}" height="${laneH - 5}" rx="4"></rect>
      <text x="${x1 + 4}" y="${y + laneH - 10}">${escapeHtml(iv.text.length > 14 ? iv.text.slice(0, 13) + "…" : iv.text)}</text>
    </g>`;
  });
  // greedy end marker
  let endMark = "";
  if ((phase === "greedy" || phase === "done") && end >= 0 && end < n) {
    const ex2 = padL + (end + 1) * cellW;
    endMark = `<line class="no-endline" x1="${ex2}" y1="${stripY - 26}" x2="${ex2}" y2="${svgH - 6}"></line>
      <text class="no-endlabel" x="${ex2 + 3}" y="${stripY - 30}">end=${end}</text>`;
  }

  const stripSvg = `<svg class="no-strip" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="${vi ? "Chuỗi và các khoảng ứng viên" : "String and candidate intervals"}">${winBar}${endMark}${cells}${lanes}</svg>`;

  // ── first/last table ────────────────────────────────────────────────────
  const charChips = chars.map((c) => {
    const active = ex && ex.ch === c.ch;
    const bad = ex && ex.badChar === c.ch;
    return `<span class="no-chip${active ? " active" : ""}${bad ? " bad" : ""}"><b>${escapeHtml(c.ch)}</b><small>[${c.first}, ${c.last}]</small></span>`;
  }).join("") || `<em class="no-empty">${vi ? "đang quét…" : "scanning…"}</em>`;

  // ── expand / decision panel ─────────────────────────────────────────────
  let decHtml = "";
  if (ex) {
    const cls = ex.valid ? (ex.done ? "ok" : "working") : "bad";
    const head = vi ? `extend('${ex.ch}')` : `extend('${ex.ch}')`;
    let body;
    if (!ex.valid) {
      body = vi
        ? `'${ex.badChar}' có first=${ex.badFirst} < l=${ex.l} → phải mở sang TRÁI → loại ứng viên này`
        : `'${ex.badChar}' has first=${ex.badFirst} < l=${ex.l} → would grow LEFT → discard this candidate`;
    } else if (ex.done) {
      body = vi ? `khoảng đóng hợp lệ [${ex.l}, ${ex.r}] = "${s.slice(ex.l, ex.r + 1)}"` : `valid closed interval [${ex.l}, ${ex.r}] = "${s.slice(ex.l, ex.r + 1)}"`;
    } else {
      body = vi ? `cửa sổ [${ex.l}, ${ex.r}], đang xét j=${ex.j} ('${s[ex.j]}')` : `window [${ex.l}, ${ex.r}], scanning j=${ex.j} ('${s[ex.j]}')`;
    }
    decHtml = `<section class="no-decision ${cls}"><small>${escapeHtml(head)}</small><strong>${escapeHtml(body)}</strong></section>`;
  } else if (phase === "greedy" && curIv >= 0 && intervals[curIv]) {
    const iv = intervals[curIv];
    const take = iv.state === "selected";
    decHtml = `<section class="no-decision ${take ? "ok" : "bad"}"><small>${vi ? "CHỌN THAM LAM" : "GREEDY PICK"}</small><strong>[${iv.l}, ${iv.r}] "${escapeHtml(iv.text)}" · l=${iv.l} ${iv.l > end ? ">" : "≤"} end=${end} → ${take ? (vi ? "NHẬN" : "TAKE") : (vi ? "BỎ" : "SKIP")}</strong></section>`;
  }

  // ── result ──────────────────────────────────────────────────────────────
  const done = view.answer !== null && view.answer !== undefined;
  const picks = selected.map((x) => `<span class="no-pick">"${escapeHtml(x.text)}"<small>[${x.l},${x.r}]</small></span>`).join("")
    || `<em class="no-empty">${vi ? "chưa chọn substring nào" : "no substring chosen yet"}</em>`;
  const resultHtml = `<section class="no-result ${done ? "complete" : ""}">
    <header><strong>${vi ? "ĐÃ CHỌN" : "SELECTED"}</strong><span>${selected.length} ${vi ? "substring" : selected.length === 1 ? "substring" : "substrings"}</span></header>
    <div>${picks}</div>
  </section>`;

  $("treeView").innerHTML = `<section class="no-viz">
    <div class="no-stages">${stages}</div>
    <section class="no-board">
      <header><strong>${vi ? "CHUỖI + KHOẢNG ỨNG VIÊN" : "STRING + CANDIDATE INTERVALS"}</strong><span>${vi ? "mỗi thanh = một substring hợp lệ" : "each bar = one valid substring"}</span></header>
      ${stripSvg}
      <div class="no-legend">
        <span><i class="lg-cand"></i>${vi ? "ứng viên" : "candidate"}</span>
        <span><i class="lg-sel"></i>${vi ? "đã chọn" : "selected"}</span>
        <span><i class="lg-skip"></i>${vi ? "bỏ (giao nhau)" : "skipped (overlap)"}</span>
        <span><i class="lg-win"></i>${vi ? "cửa sổ đang mở rộng" : "expanding window"}</span>
      </div>
    </section>
    <section class="no-chars"><header><strong>first / last</strong><span>${chars.length} ${vi ? "ký tự" : "chars"}</span></header><div>${charChips}</div></section>
    ${decHtml}
    ${resultHtml}
  </section>`;
}

// ---- 366 Find Leaves of Binary Tree ----
// The whole point is that a node's removal ROUND equals its HEIGHT above the
// leaves, so the tree is drawn with a height badge on every node and each node
// tinted by the group it lands in. Grid positions come from the builder (which
// reuses the shared tree layout), so nothing here invents coordinates.
const LV366_GEOM = { padX: 36, padY: 42, colW: 58, rowH: 82, r: 23 };

function renderLeaves366View(step) {
  const view = step.leaves366View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");
  const approach = Number(view.approach) || 1;
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const cols = Number(view.cols) || 1;
  const rows = Number(view.rows) || 1;
  const heights = view.heights || null;
  const resolved = new Set(view.resolved || []);
  const removed = new Set(view.removed || []);
  const roundIds = new Set(view.roundIds || []);
  const groups = Array.isArray(view.groups) ? view.groups : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const counters = view.counters || {};
  const cur = view.cur;
  const isDone = view.answer !== null && view.answer !== undefined;
  const G = LV366_GEOM;
  const PALETTE = 6;

  const px = (nd) => G.padX + nd.x * G.colW;
  const py = (nd) => G.padY + nd.y * G.rowH;
  const w = G.padX * 2 + (cols - 1) * G.colW;
  const h = G.padY * 2 + (rows - 1) * G.rowH;
  const byId = new Map(nodes.map((nd) => [nd.id, nd]));

  // Which group a node belongs to: its height for approach 1, or the round it was
  // stripped in for approach 2. Both are the same number, which is the lesson.
  const groupOf = (id) => {
    if (heights && heights[id] !== undefined) return heights[id];
    if (approach === 2) {
      for (let g = 0; g < groups.length; g++) {
        const nd = byId.get(id);
        if (nd && groups[g].includes(nd.val) && removed.has(id)) return g;
      }
    }
    return -1;
  };

  const edges = nodes.filter((nd) => nd.parentId !== null && byId.has(nd.parentId)).map((nd) => {
    const p = byId.get(nd.parentId);
    const dim = approach === 2 && (removed.has(nd.id) || removed.has(p.id));
    return `<line class="lv366-edge${dim ? " gone" : ""}" x1="${px(p)}" y1="${py(p)}" x2="${px(nd)}" y2="${py(nd)}"></line>`;
  }).join("");

  const circles = nodes.map((nd) => {
    const g = groupOf(nd.id);
    const cls = ["lv366-node"];
    if (g >= 0) cls.push("settled", `g${g % PALETTE}`);
    else cls.push("open");
    if (approach === 2 && removed.has(nd.id)) cls.push("removed");
    if (roundIds.has(nd.id)) cls.push("thisround");
    if (cur && cur.id === nd.id) cls.push("cur");
    if (approach === 1 && stack.includes(nd.id)) cls.push("onstack");
    const badge = heights && heights[nd.id] !== undefined
      ? String(heights[nd.id])
      : (approach === 2 && g >= 0 ? String(g) : "?");
    return `<g class="${cls.join(" ")}">
      <circle cx="${px(nd)}" cy="${py(nd)}" r="${G.r}"></circle>
      <text class="val" x="${px(nd)}" y="${py(nd) + 6}">${nd.val}</text>
      <g class="badge"><circle cx="${px(nd) + G.r - 3}" cy="${py(nd) - G.r + 3}" r="11"></circle>
      <text x="${px(nd) + G.r - 3}" y="${py(nd) - G.r + 7}">${escapeHtml(badge)}</text></g>
    </g>`;
  }).join("");

  const treeSvg = `<svg class="lv366-tree" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHtml(vi ? "Cây với chiều cao từng nút" : "The tree with each node's height")}">
    ${edges}${circles}
  </svg>`;

  // ── the h = 1 + max(...) computation, spelled out ──────────────────────────
  let calcHtml = "";
  if (approach === 1 && cur) {
    calcHtml = `<section class="lv366-panel">
      <header><strong>${vi ? `TÍNH CHIỀU CAO CHO NÚT ${cur.val}` : `COMPUTING THE HEIGHT OF NODE ${cur.val}`}</strong></header>
      <div class="lv366-calc">
        <span class="op">h =</span><span class="one">1</span><span class="op">+ max(</span>
        <span class="two">${cur.leftH}</span><span class="op">,</span><span class="two">${cur.rightH}</span>
        <span class="op">) =</span><strong class="g${cur.h % PALETTE}">${cur.h}</strong>
      </div>
      <div class="lv366-hint">${escapeHtml(cur.isLeaf
      ? (vi ? `${cur.val} là lá, cả hai con là null → cả hai trả −1, nên h = 1 + max(−1, −1) = 0. Chính quy ước null = −1 đặt lá vào đúng nhóm 0.`
        : `${cur.val} is a leaf, both children are null → both return −1, so h = 1 + max(−1, −1) = 0. The null = −1 convention is what puts leaves in group 0 exactly.`)
      : (vi ? `Postorder nên hai con đã xong trước. ${cur.val} chỉ thành lá sau khi nhánh SÂU HƠN (chiều cao ${Math.max(cur.leftH, cur.rightH)}) bị gỡ sạch, nên nó ra ở vòng ${cur.h} — dùng max, không phải min hay tổng.`
        : `Postorder means both children finished first. ${cur.val} only becomes a leaf once the DEEPER branch (height ${Math.max(cur.leftH, cur.rightH)}) has been stripped away, so it leaves in round ${cur.h} — hence max, not min or a sum.`))}</div>
    </section>`;
  }

  // ── groups filling up ─────────────────────────────────────────────────────
  const groupsHtml = groups.length
    ? groups.map((g, k) => `<div class="lv366-group g${k % PALETTE}${view.round === k && !isDone ? " cur" : ""}">
        <small>${vi ? "nhóm" : "group"} ${k}${approach === 1 ? ` · h = ${k}` : ` · ${vi ? "vòng" : "round"} ${k}`}</small>
        <div>${g.map((val) => `<span>${val}</span>`).join("")}</div>
      </div>`).join("")
    : `<em class="lv366-empty">${vi ? "chưa có nhóm nào" : "no group yet"}</em>`;

  const costHtml = `<section class="lv366-panel">
    <header><strong>${vi ? "CHI PHÍ" : "COST"}</strong><span>${vi ? `cây có ${counters.nodes || nodes.length} nút` : `${counters.nodes || nodes.length} nodes in the tree`}</span></header>
    <div class="lv366-cost">
      <div class="box${approach === 1 ? " active" : ""}"><small>${vi ? "LƯỢT DUYỆT" : "TRAVERSALS"}</small><b>${counters.passes === undefined ? "—" : counters.passes}</b><span>${approach === 1 ? (vi ? "một lượt là đủ" : "one is enough") : (vi ? "một lượt mỗi vòng" : "one per round")}</span></div>
      <div class="box${approach === 2 ? " warn" : " active"}"><small>${vi ? "LẦN THĂM NÚT" : "NODE VISITS"}</small><b>${counters.visits || 0}</b><span>${approach === 1 ? (vi ? `= số nút, tức O(n)` : `= the node count, i.e. O(n)`) : (vi ? `so với ${counters.nodes || nodes.length} của cách 1` : `against approach 1's ${counters.nodes || nodes.length}`)}</span></div>
      <div class="box"><small>${vi ? "SỐ NHÓM" : "GROUPS"}</small><b>${groups.length}</b><span>${vi ? "= chiều cao cây + 1" : "= tree height + 1"}</span></div>
    </div>
  </section>`;

  const statusHtml = isDone
    ? `<div class="lv366-answer">
        <small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small>
        <strong>${escapeHtml(String(view.answer))}</strong>
      </div>`
    : `<div class="lv366-progress">
        ${approach === 1
      ? `<span><small>${vi ? "ĐÃ TÍNH XONG" : "RESOLVED"}</small><b>${resolved.size}/${nodes.length}</b></span>
         <span><small>${vi ? "ĐANG Ở NÚT" : "AT NODE"}</small><b>${cur ? cur.val : "—"}</b></span>`
      : `<span><small>${vi ? "ĐÃ GỠ" : "STRIPPED"}</small><b>${removed.size}/${nodes.length}</b></span>
         <span><small>${vi ? "VÒNG" : "ROUND"}</small><b>${view.round === null || view.round === undefined ? "—" : view.round}</b></span>`}
        <span><small>${vi ? "NHÓM" : "GROUPS"}</small><b>${groups.length}</b></span>
      </div>`;

  $("treeView").innerHTML = `<section class="lv366-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa gỡ lá cây nhị phân" : "Find leaves of binary tree visualization")}">
    <div class="lv366-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(approach === 1
      ? "Một nút bị gỡ ở vòng nào? Lá ra ngay vòng 0. Một nút chỉ thành lá sau khi nhánh SÂU NHẤT của nó đã bị gỡ hết, nên nó ra ở vòng = chiều cao của nó tính từ lá: h = 1 + max(h(con)), với h(null) = −1. Vậy KHÔNG cần gỡ gì cả — một lượt postorder tính h cho mọi nút là mọi nhóm hiện ra cùng lúc."
      : "Làm đúng như đề: mỗi vòng duyệt cây, ghi lại mọi lá hiện tại rồi cắt chúng, lặp tới khi cây rỗng. Đúng và dễ tin, nhưng mỗi vòng phải duyệt lại phần cây còn sống nên tốn O(n·h) lần thăm. Để ý số ghi trên mỗi nút vẫn đúng bằng số vòng nó ra đi — đó là chiếc cầu sang cách 1.")}</span>
    </div>

    ${statusHtml}

    <section class="lv366-panel">
      <header>
        <strong>${vi ? "CÂY — số trong huy hiệu là chiều cao tính từ lá = số nhóm" : "THE TREE — the badge is the height above the leaves = the group number"}</strong>
        <span>${vi ? "? = chưa tính · màu = nhóm" : "? = not computed yet · colour = group"}</span>
      </header>
      <div class="lv366-treewrap">${treeSvg}</div>
      <div class="lv366-hint">${escapeHtml(vi
      ? "Chú ý các nút cùng huy hiệu đều ra CÙNG một vòng dù nằm ở độ sâu khác nhau trên cây — vì vòng phụ thuộc vào khoảng cách xuống lá, không phải khoảng cách xuống từ gốc."
      : "Note that nodes sharing a badge leave in the SAME round even when they sit at different depths — the round depends on the distance down to the leaves, not the distance from the root.")}</div>
    </section>

    ${calcHtml}

    <section class="lv366-panel">
      <header><strong>${vi ? "CÁC NHÓM KẾT QUẢ" : "THE OUTPUT GROUPS"}</strong><span>${groups.length}</span></header>
      <div class="lv366-groups">${groupsHtml}</div>
    </section>

    ${costHtml}

    <div class="lv366-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 359 Logger Rate Limiter ----
// A rate limiter is the one thing that really wants a timeline, so each message
// gets a lane, every printed call paints its 10-second cooldown bar, and a
// suppressed call is visibly just a call that landed inside one of those bars.
// Positions come from CSS grid columns (one per second) rather than pixel maths.
function renderLogger359View(step) {
  const view = step.logger359View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");
  const approach = Number(view.approach) || 1;
  const W = Number(view.window) || 10;
  const span = Number(view.span) || 1;
  const cols = span + 1;                       // one column per second, 0..span
  const messages = Array.isArray(view.messages) ? view.messages : [];
  const calls = Array.isArray(view.calls) ? view.calls : [];
  const verdicts = Array.isArray(view.verdicts) ? view.verdicts : [];
  const bars = Array.isArray(view.bars) ? view.bars : [];
  const queue = Array.isArray(view.queue) ? view.queue : null;
  const recent = Array.isArray(view.recent) ? view.recent : null;
  const evicted = Array.isArray(view.evicted) ? view.evicted : null;
  const nextAllowed = view.nextAllowed || null;
  const compare = view.compare;
  const callIndex = view.callIndex;
  const isDone = view.answer !== null && view.answer !== undefined;
  const PALETTE = 6;
  const hueOf = (msg) => messages.indexOf(msg) % PALETTE;

  // ── timeline ──────────────────────────────────────────────────────────────
  const tickStep = span > 30 ? 5 : span > 14 ? 2 : 1;
  const ruler = `<div class="lg359-lane ruler">
    <span class="lbl"></span>
    <div class="track" style="--lg-cols:${cols}">
      ${Array.from({ length: cols }, (_, k) => (k % tickStep === 0
    ? `<span class="tick" style="grid-column:${k + 1}">${k}</span>`
    : "")).join("")}
    </div>
  </div>`;

  const lanes = messages.map((msg) => {
    const myBars = bars.filter((b) => b.message === msg);
    const myCalls = calls.map((c, i) => ({ ...c, i })).filter((c) => c.message === msg);
    const barHtml = myBars.map((b) => `<div class="bar" style="grid-column:${b.from + 1} / ${Math.min(b.to, span) + 1}"></div>`).join("");
    const dotHtml = myCalls.map((c) => {
      const v = verdicts[c.i];
      const cls = ["dot"];
      if (v === true) cls.push("printed");
      else if (v === false) cls.push("blocked");
      else cls.push("pending");
      if (c.i === callIndex && !isDone) cls.push("cur");
      return `<div class="${cls.join(" ")}" style="grid-column:${c.ts + 1}" title="t=${c.ts}">${v === true ? "✓" : v === false ? "✕" : "·"}</div>`;
    }).join("");
    return `<div class="lg359-lane q${hueOf(msg)}">
      <span class="lbl">${escapeHtml(msg)}</span>
      <div class="track" style="--lg-cols:${cols}">${barHtml}${dotHtml}</div>
    </div>`;
  }).join("");

  // ── the comparison this call makes ────────────────────────────────────────
  let cmpHtml = "";
  if (compare) {
    const hasMark = compare.mark !== null && compare.mark !== undefined;
    cmpHtml = `<section class="lg359-panel">
      <header>
        <strong>${vi ? `PHÉP KIỂM CHO "${escapeHtml(compare.message)}" TẠI t = ${compare.ts}` : `THE TEST FOR "${escapeHtml(compare.message)}" AT t = ${compare.ts}`}</strong>
      </header>
      <div class="lg359-cmp ${compare.ok ? "ok" : "no"}">
        <span class="a">t = ${compare.ts}</span>
        <span class="op">${hasMark ? (compare.ok ? "≥" : "<") : ""}</span>
        <span class="b">${hasMark
      ? (approach === 1 ? `${vi ? "mốc" : "mark"} = ${compare.mark}` : `${vi ? "hết hạn lúc" : "expires at"} ${compare.mark}`)
      : (vi ? "chưa có mốc nào" : "no mark yet")}</span>
        <strong>${compare.ok ? (vi ? "IN" : "PRINT") : (vi ? "BỎ" : "SUPPRESS")}</strong>
      </div>
      <div class="lg359-hint">${escapeHtml(compare.ok
      ? (vi ? `Biên là ≥ chứ không phải >: in lúc t thì đúng tại t+${W} đã được in lại, nên cửa sổ chặn là [t+1, t+${W - 1}].`
        : `The boundary is ≥ and not >: printing at t means t+${W} is already allowed, so the blocking window is [t+1, t+${W - 1}].`)
      : (vi ? `Lời gọi bị bỏ KHÔNG cập nhật mốc / KHÔNG đẩy vào queue — nếu có thì một message bị gọi liên tục sẽ tự gia hạn cửa sổ và bị chặn vĩnh viễn.`
        : `A suppressed call does NOT update the mark / does NOT get queued — otherwise a message called repeatedly would keep extending its own window and be blocked forever.`))}</div>
    </section>`;
  }

  // ── the state each approach carries ───────────────────────────────────────
  let stateHtml = "";
  if (approach === 1 && nextAllowed) {
    const keys = Object.keys(nextAllowed);
    stateHtml = `<section class="lg359-panel">
      <header>
        <strong>${vi ? "next_allowed — mỗi message MỘT con số" : "next_allowed — ONE number per message"}</strong>
        <span>${keys.length} ${vi ? "mục" : "entries"}</span>
      </header>
      <div class="lg359-chips">${keys.length
      ? keys.map((k) => `<span class="chip q${hueOf(k)}${compare && compare.message === k ? " lit" : ""}"><b>${escapeHtml(k)}</b><i>→ ${nextAllowed[k]}</i></span>`).join("")
      : `<em class="lg359-empty">${vi ? "chưa có message nào" : "no message yet"}</em>`}</div>
      <div class="lg359-hint">${escapeHtml(vi
      ? "Map này chỉ tăng chứ không bao giờ giảm: một message gặp một lần rồi biến mất vẫn nằm đây mãi. Với luồng log dài đầy message lạ thì đó là chỗ tốn bộ nhớ — cách 2 giải quyết đúng điểm này."
      : "This map only grows and never shrinks: a message seen once and never again still sits here forever. On a long log stream full of one-off messages that is the memory problem — and it is exactly what approach 2 fixes.")}</div>
    </section>`;
  } else if (approach === 2 && queue) {
    stateHtml = `<section class="lg359-panel">
      <header>
        <strong>${vi ? `QUEUE + SET — chỉ những gì còn trong ${W}s` : `QUEUE + SET — only what is still inside the ${W}s window`}</strong>
        <span>${queue.length} ${vi ? "mục" : "entries"}</span>
      </header>
      <div class="lg359-chips">
        ${queue.length
      ? queue.map((q, k) => `<span class="chip q${hueOf(q.message)}${k === 0 ? " head" : ""}${compare && compare.message === q.message ? " lit" : ""}">${k === 0 ? `<em>${vi ? "đầu" : "head"}</em>` : ""}<b>${escapeHtml(q.message)}</b><i>@${q.ts}</i></span>`).join("")
      : `<em class="lg359-empty">${vi ? "queue rỗng" : "the queue is empty"}</em>`}
      </div>
      ${evicted && evicted.length
      ? `<div class="lg359-evict">${evicted.map((e) => `<span><b>${escapeHtml(e.message)}</b>@${e.ts} ${vi ? "hết hạn" : "expired"} ${e.ts + W}</span>`).join("")}</div>`
      : ""}
      <div class="lg359-hint">${escapeHtml(vi
      ? `Set recent = {${(recent || []).join(", ") || "∅"}} luôn đúng bằng tập message trong queue, nên mỗi message chỉ nằm trong queue nhiều nhất một lần. Điều kiện loại là thời điểm ≤ t − ${W} (dùng ≤, không phải <).`
      : `The set recent = {${(recent || []).join(", ") || "∅"}} always mirrors the messages in the queue, so a message is in the queue at most once. The eviction test is timestamp ≤ t − ${W} (≤, not <).`)}</div>
    </section>`;
  }

  // ── memory contrast, both numbers on screen ───────────────────────────────
  const seenSoFar = new Set(calls.slice(0, (callIndex === null || callIndex === undefined ? calls.length : callIndex + 1)).map((c) => c.message)).size;
  const memHtml = `<section class="lg359-panel">
    <header><strong>${vi ? "BỘ NHỚ" : "MEMORY"}</strong><span>${vi ? "so sánh hai cách" : "the two approaches side by side"}</span></header>
    <div class="lg359-mem">
      <div class="box${approach === 1 ? " active" : ""}"><small>${vi ? "CÁCH 1 · MAP" : "APPROACH 1 · MAP"}</small><b>${approach === 1 && nextAllowed ? Object.keys(nextAllowed).length : seenSoFar}</b><span>${vi ? "mọi message từng gặp" : "every message ever seen"}</span></div>
      <div class="box${approach === 2 ? " active" : ""}"><small>${vi ? "CÁCH 2 · QUEUE" : "APPROACH 2 · QUEUE"}</small><b>${queue ? queue.length : "—"}</b><span>${vi ? `chỉ trong ${W}s gần nhất` : `only within the last ${W}s`}</span></div>
      <div class="box"><small>${vi ? "ĐÃ IN" : "PRINTED"}</small><b>${view.printed === null || view.printed === undefined ? 0 : view.printed}/${calls.length}</b><span>${vi ? "lời gọi" : "calls"}</span></div>
    </div>
  </section>`;

  // ── call log ──────────────────────────────────────────────────────────────
  const logHtml = calls.map((c, i) => {
    const v = verdicts[i];
    const cls = ["lg359-call", `q${hueOf(c.message)}`];
    if (i === callIndex && !isDone) cls.push("cur");
    else if (v !== null && v !== undefined) cls.push("done");
    return `<div class="${cls.join(" ")}">
      <small>t=${c.ts}</small><strong>${escapeHtml(c.message)}</strong>
      <b class="${v === true ? "yes" : v === false ? "no" : "pending"}">${v === true ? "true" : v === false ? "false" : "?"}</b>
    </div>`;
  }).join("");

  const statusHtml = isDone
    ? `<div class="lg359-answer">
        <small>${vi ? "KẾT QUẢ" : "RESULTS"}</small>
        <strong>[${escapeHtml(String(view.answer))}]</strong>
        <span>${vi ? `${view.printed}/${calls.length} lời gọi được in` : `${view.printed}/${calls.length} calls printed`}</span>
      </div>`
    : `<div class="lg359-progress">
        <span><small>${vi ? "LỜI GỌI" : "CALL"}</small><b>${callIndex === null || callIndex === undefined ? "—" : `${callIndex + 1}/${calls.length}`}</b></span>
        <span><small>${vi ? "ĐÃ IN" : "PRINTED"}</small><b>${view.printed === null || view.printed === undefined ? 0 : view.printed}</b></span>
        <span><small>${vi ? "CỬA SỔ" : "WINDOW"}</small><b>${W}s</b></span>
      </div>`;

  $("treeView").innerHTML = `<section class="lg359-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa giới hạn tần suất log" : "Logger rate limiter visualization")}">
    <div class="lg359-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(approach === 1
      ? `Mỗi message chỉ cần nhớ MỘT con số: thời điểm sớm nhất nó được in lại. In ở t thì đặt mốc = t + ${W}. Mỗi lời gọi là một phép so sánh duy nhất, không cần lưu lịch sử. Trên timeline, mỗi lần in vẽ ra một thanh cooldown dài ${W}s — lời gọi nào rơi vào trong thanh đó thì bị bỏ.`
      : `Chỉ giữ những message còn ĐANG trong cửa sổ ${W}s: một queue các cặp (thời điểm, message) theo thứ tự thời gian, cộng một set để tra nhanh. Đầu mỗi lời gọi, loại khỏi đầu queue mọi mục đã quá hạn. Bộ nhớ vì thế không phụ thuộc vào tổng số message từng gặp — khác hẳn cách 1.`)}</span>
    </div>

    ${statusHtml}

    <section class="lg359-panel">
      <header>
        <strong>${vi ? `TIMELINE — mỗi message một hàng, mỗi lần in mở cửa sổ ${W}s` : `TIMELINE — one lane per message, each print opens a ${W}s window`}</strong>
        <span>${vi ? "✓ = in · ✕ = bị bỏ · vùng tô = đang trong cửa sổ" : "✓ = printed · ✕ = suppressed · shaded = inside a window"}</span>
      </header>
      <div class="lg359-timeline">${ruler}${lanes}</div>
      <div class="lg359-hint">${escapeHtml(vi
      ? `Mỗi ✕ đều nằm bên trong một vùng tô — đó chính là toàn bộ nội dung bài. Vùng tô bắt đầu ngay tại lần in và dài ${W}s, nên ô cuối bị chặn là t+${W - 1}, còn t+${W} đã được in lại.`
      : `Every ✕ sits inside a shaded band — that is the whole problem in one picture. A band starts at the print itself and runs ${W}s, so the last blocked second is t+${W - 1} while t+${W} prints again.`)}</div>
    </section>

    ${cmpHtml}
    ${stateHtml}
    ${memHtml}

    <section class="lg359-panel">
      <header><strong>${vi ? "CÁC LỜI GỌI shouldPrintMessage" : "THE shouldPrintMessage CALLS"}</strong><span>${calls.length}</span></header>
      <div class="lg359-log">${logHtml}</div>
    </section>

    <div class="lg359-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 900 RLE Iterator ----
// The encoding and the sequence it stands for are shown side by side, because the
// whole problem is keeping those two in sync while never building the second one.
// Consumption is strictly front-to-back, so the decoded strip can be derived from
// a single "consumed" count.
function renderRleIter900View(step) {
  const view = step.rleIter900View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");
  const runs = Array.isArray(view.runs) ? view.runs : [];
  const expanded = Array.isArray(view.expanded) ? view.expanded : [];
  const remaining = Array.isArray(view.remaining) ? view.remaining : null;
  const pref = Array.isArray(view.pref) ? view.pref : null;
  const queries = Array.isArray(view.queries) ? view.queries : [];
  const taken = Array.isArray(view.taken) ? view.taken : null;
  const approach = Number(view.approach) || 1;
  const total = Number(view.total) || 0;
  const consumed = view.consumed === null || view.consumed === undefined ? 0 : view.consumed;
  const cursor = view.i;
  const search = view.search;
  const isDone = view.answer !== null && view.answer !== undefined;
  const PALETTE = 5;

  const takenTotal = taken ? taken.reduce((t, x) => t + x.amount, 0) : 0;
  const takenFrom = consumed - takenTotal;
  const takenByRun = new Map();
  if (taken) for (const t of taken) takenByRun.set(t.runIdx, t.amount);

  // ── the encoding, one card per (count, value) pair ────────────────────────
  const runsHtml = runs.map((r, idx) => {
    const left = remaining ? remaining[idx] : r.count;
    const cls = ["rle900-run", `q${idx % PALETTE}`];
    if (r.count === 0) cls.push("zero");
    else if (left === 0) cls.push("drained");
    if (approach === 1 && idx === cursor && !isDone) cls.push("cursor");
    if (takenByRun.has(idx)) cls.push("took");
    const pct = r.count ? Math.round((left / r.count) * 100) : 0;
    return `<div class="${cls.join(" ")}">
      <small>${vi ? "cặp" : "pair"} ${idx}</small>
      <strong>${left} × ${r.value}</strong>
      ${r.count === 0
      ? `<span class="tag">${vi ? "rỗng — bỏ qua" : "empty — skipped"}</span>`
      : `<span class="bar"><i style="width:${pct}%"></i></span><span class="tag">${vi ? `còn ${left}/${r.count}` : `${left}/${r.count} left`}${takenByRun.has(idx) ? ` · ${vi ? "lấy" : "took"} ${takenByRun.get(idx)}` : ""}</span>`}
    </div>`;
  }).join("");

  // ── the decoded sequence, which the algorithm never actually builds ───────
  const seqHtml = expanded.length
    ? expanded.map((e, k) => {
      const cls = ["rle900-el", `q${e.runIdx % PALETTE}`];
      if (k < takenFrom) cls.push("gone");
      else if (k < consumed) cls.push("justgone");
      return `<span class="${cls.join(" ")}">${e.value}</span>`;
    }).join("")
    : `<em class="rle900-empty">${vi ? "dãy giải nén rỗng" : "the decoded sequence is empty"}</em>`;

  // ── the call in progress ──────────────────────────────────────────────────
  let callHtml = "";
  if (view.queryIndex !== null && view.queryIndex !== undefined) {
    const q = queries[view.queryIndex] || {};
    const res = q.status === "done" ? q.result : null;
    callHtml = `<section class="rle900-panel">
      <header>
        <strong>${vi ? `ĐANG XỬ LÝ next(${view.n})` : `HANDLING next(${view.n})`}</strong>
        <span>${view.nLeft !== null && view.nLeft !== undefined ? (vi ? `còn cần ${view.nLeft}` : `${view.nLeft} still needed`) : ""}</span>
      </header>
      <div class="rle900-call">
        <div class="box"><small>${vi ? "YÊU CẦU" : "REQUESTED"}</small><b>${view.n}</b></div>
        <div class="box"><small>${vi ? "ĐÃ LẤY TRONG LƯỢT NÀY" : "TAKEN THIS CALL"}</small><b>${takenTotal}</b><span>${taken && taken.length ? taken.map((t) => `${vi ? "cặp" : "pair"} ${t.runIdx}: ${t.amount}`).join(" · ") : "—"}</span></div>
        <div class="box${res === -1 ? " bad" : res === null ? "" : " good"}"><small>${vi ? "TRẢ VỀ" : "RETURNS"}</small><b>${res === null ? "…" : res}</b></div>
      </div>
    </section>`;
  }

  // ── approach 2: the prefix marks and the search ───────────────────────────
  let prefHtml = "";
  if (approach === 2 && pref) {
    const cells = pref.map((v, k) => {
      const cls = ["rle900-pc"];
      if (search && k === search.k) cls.push("found");
      if (k > 0 && runs[k - 1] && runs[k - 1].count === 0) cls.push("flat");
      return `<span class="${cls.join(" ")}"><b>${v}</b><i>${k === 0 ? "–" : `${vi ? "cặp" : "pair"} ${k - 1}`}</i></span>`;
    }).join("");
    prefHtml = `<section class="rle900-panel">
      <header>
        <strong>${vi ? "TIỀN TỐ CỘNG DỒN — pref[k] = tổng phần tử của k cặp đầu" : "PREFIX SUMS — pref[k] = elements held by the first k pairs"}</strong>
        <span>used = ${view.used === null || view.used === undefined ? 0 : view.used} / ${total}</span>
      </header>
      <div class="rle900-pref">${cells}</div>
      ${search
      ? `<div class="rle900-lk">${escapeHtml(vi
        ? `Mốc đầu tiên ≥ used = ${search.used} là pref[${search.k}] = ${search.prefAt}, nên phần tử thứ ${search.used} nằm trong cặp ${search.runIdx}.`
        : `The first mark ≥ used = ${search.used} is pref[${search.k}] = ${search.prefAt}, so element ${search.used} lives in pair ${search.runIdx}.`)}</div>`
      : ""}
      <div class="rle900-hint">${escapeHtml(vi
      ? "Ô nét đứt là mốc do cặp có số lần 0 tạo ra — tiền tố lặp lại giá trị ở đó. Vì luôn lấy mốc ĐẦU TIÊN ≥ used, các ô này luôn bị bỏ qua, nên không bao giờ trả về giá trị của một cặp rỗng."
      : "A dashed cell is a mark created by a zero-count pair — the prefix repeats its value there. Because we always take the FIRST mark ≥ used, those cells are always stepped past, so an empty pair's value is never returned.")}</div>
    </section>`;
  }

  // ── the call log ──────────────────────────────────────────────────────────
  const logHtml = queries.map((q, k) => {
    const cls = ["rle900-q"];
    if (q.status === "current" || k === view.queryIndex) cls.push("current");
    else if (q.status === "done") cls.push("done");
    return `<div class="${cls.join(" ")}">
      <small>${k}</small><strong>next(${q.n})</strong>
      <b class="${q.result === null || q.result === undefined ? "pending" : q.result === -1 ? "bad" : "good"}">${q.result === null || q.result === undefined ? "?" : q.result}</b>
    </div>`;
  }).join("");

  const statusHtml = isDone
    ? `<div class="rle900-answer">
        <small>${vi ? "KẾT QUẢ" : "RESULTS"}</small>
        <strong>[${escapeHtml(String(view.answer))}]</strong>
        <span>${vi ? `đã tiêu thụ ${consumed}/${total} phần tử` : `${consumed}/${total} elements exhausted`}</span>
      </div>`
    : `<div class="rle900-progress">
        <span><small>${vi ? "ĐÃ TIÊU THỤ" : "EXHAUSTED"}</small><b>${consumed}/${total}</b></span>
        ${approach === 1
      ? `<span><small>${vi ? "CON TRỎ i" : "CURSOR i"}</small><b>${cursor === null || cursor === undefined ? "—" : (cursor >= runs.length ? (vi ? "hết" : "past end") : `${vi ? "cặp" : "pair"} ${cursor}`)}</b></span>`
      : `<span><small>used</small><b>${view.used === null || view.used === undefined ? 0 : view.used}</b></span>`}
        <span><small>${vi ? "LẦN GỌI" : "CALL"}</small><b>${view.queryIndex === null || view.queryIndex === undefined ? "—" : `${view.queryIndex + 1}/${queries.length}`}</b></span>
      </div>`;

  $("treeView").innerHTML = `<section class="rle900-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa RLE Iterator" : "RLE Iterator visualization")}">
    <div class="rle900-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(approach === 1
      ? "Đừng bao giờ giải nén dãy — đề cho số lần tới 10⁹. Chỉ giữ con trỏ i trỏ vào cặp hiện tại. next(n): nếu cặp hiện tại còn đủ thì trừ n rồi trả giá trị của nó (con trỏ KHÔNG dịch); nếu không đủ thì lấy hết cặp đó, trừ vào n rồi sang cặp kế. Cặp có số lần 0 bị bước qua bởi chính vòng lặp đó. Hết cặp mà còn thiếu thì trả -1 — nhưng phần đã lấy vẫn bị tiêu thụ."
      : "Không sửa dữ liệu gốc: dựng trước tiền tố cộng dồn rồi chỉ giữ một biến used = số phần tử đã tiêu thụ. next(n) chỉ việc used += n và tìm nhị phân cặp đầu tiên có tiền tố ≥ used — O(log số cặp) mỗi lần gọi. Nếu used vượt tổng thì trả -1, và used KHÔNG được hoàn lại, đúng như cách 1 đã tiêu thụ nốt phần còn lại.")}</span>
    </div>

    ${statusHtml}

    <section class="rle900-panel">
      <header>
        <strong>${vi ? "ENCODING — các cặp (số lần, giá trị)" : "ENCODING — the (count, value) pairs"}</strong>
        <span>${vi ? `${runs.length} cặp · ${total} phần tử` : `${runs.length} pairs · ${total} elements`}</span>
      </header>
      <div class="rle900-runs">${runsHtml}</div>
    </section>

    <section class="rle900-panel">
      <header>
        <strong>${vi ? "DÃY GIẢI NÉN — thứ thuật toán KHÔNG bao giờ dựng ra" : "THE DECODED SEQUENCE — which the algorithm never builds"}</strong>
        <span>${vi ? "gạch ngang = đã tiêu thụ" : "struck through = exhausted"}</span>
      </header>
      <div class="rle900-seq">${seqHtml}</div>
      <div class="rle900-hint">${escapeHtml(vi
      ? "Chỉ vẽ ở đây để bạn đối chiếu. Việc tiêu thụ luôn diễn ra từ đầu dãy về sau, nên chỉ cần một con số \"đã tiêu thụ\" là biết chính xác phần nào đã mất."
      : "Drawn here only so you can check along. Consumption always runs front to back, so a single \"exhausted\" count says exactly which part is gone.")}</div>
    </section>

    ${callHtml}
    ${prefHtml}

    <section class="rle900-panel">
      <header><strong>${vi ? "CÁC LẦN GỌI next(n)" : "THE next(n) CALLS"}</strong><span>${queries.length}</span></header>
      <div class="rle900-log">${logHtml}</div>
    </section>

    <div class="rle900-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 792 Number of Matching Subsequences ----
// The waiting-list panel is the centrepiece: seeing words parked under the single
// character each one needs, and migrating when that character shows up, is what
// makes "one pass over s" obvious. The s strip is annotated with how many words
// each character woke, which shows directly that most characters do nothing.
function renderMatchSubseq792View(step) {
  const view = step.matchSubseq792View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");
  const s = String(view.s || "");
  const words = Array.isArray(view.words) ? view.words : [];
  const approach = Number(view.approach) || 1;
  const progress = Array.isArray(view.progress) ? view.progress : [];
  const status = Array.isArray(view.status) ? view.status : [];
  const wakeAt = Array.isArray(view.wakeAt) ? view.wakeAt : null;
  const buckets = view.buckets || null;
  const released = Array.isArray(view.released) ? view.released : null;
  const scan = view.scan;
  const counters = view.counters || {};
  const isDone = view.answer !== null && view.answer !== undefined;
  const si = view.si;
  const PALETTE = 5;

  // ── s, annotated with the wake count of each character ────────────────────
  const sHtml = s.split("").map((ch, i) => {
    const cls = ["ms792-ch"];
    const woke = wakeAt ? wakeAt[i] : null;
    if (i === si && !isDone) cls.push("cur");
    else if (si !== null && si !== undefined && i < si) cls.push("past");
    if (woke !== null && woke !== undefined) cls.push(woke > 0 ? "woke" : "idle");
    if (scan && scan.matchedAt === i) cls.push("hit");
    if (scan && scan.skipFrom !== null && scan.skipFrom !== undefined && i >= scan.skipFrom && i < scan.matchedAt) cls.push("skipped");
    return `<div class="${cls.join(" ")}">
      <strong>${escapeHtml(ch)}</strong>
      <span class="ix">${i}</span>
      ${woke === null || woke === undefined ? `<span class="wk">·</span>` : `<span class="wk">${woke > 0 ? `↑${woke}` : "–"}</span>`}
    </div>`;
  }).join("");

  // ── each word with its matched prefix and the character it now needs ──────
  const wordsHtml = words.map((w, wi) => {
    const j = progress[wi] || 0;
    const st = status[wi] || "waiting";
    const cls = ["ms792-word", st];
    if (approach === 2 && view.curWord === wi && !isDone) cls.push("cur");
    if (released && released.some((r) => r.wi === wi)) cls.push("moved");
    const chars = w.split("").map((c, k) => {
      const cc = ["c"];
      if (k < j) cc.push("done");
      else if (k === j) cc.push("need");
      return `<span class="${cc.join(" ")}">${escapeHtml(c)}</span>`;
    }).join("");
    const badge = st === "matched" ? "✓" : st === "failed" ? "✗" : `${j}/${w.length}`;
    // j can already equal w.length while the status is still "scanning": approach 2
    // reaches the final character one step before it records the verdict. Indexing
    // w[j] there would print "waits 'undefined'".
    const nx = st === "matched" ? (vi ? "xong" : "done")
      : st === "failed" ? (vi ? "không đủ" : "short")
        : j >= w.length ? (vi ? "đã đủ ký tự" : "all characters found")
          : (vi ? `chờ '${w[j]}'` : `waits '${w[j]}'`);
    return `<div class="${cls.join(" ")}">
      <span class="wl">w${wi}</span>
      <div class="chs">${chars}</div>
      <span class="bd">${badge}</span>
      <span class="nx">${escapeHtml(nx)}</span>
    </div>`;
  }).join("");

  // ── approach 1: the waiting lists ─────────────────────────────────────────
  let bucketHtml = "";
  if (approach === 1 && buckets) {
    const keys = Object.keys(buckets);
    const cards = keys.map((ch) => `<div class="ms792-bucket${ch === s[si] && !isDone ? " draining" : ""}">
        <small>${vi ? "chờ" : "waiting on"} '${escapeHtml(ch)}'</small>
        <div>${buckets[ch].map((e) => `<span class="q${e.wi % PALETTE}">${escapeHtml(words[e.wi])}<i>${e.j}</i></span>`).join("")}</div>
      </div>`).join("");
    const movedHtml = released
      ? `<div class="ms792-moves">${released.map((r) => `<span class="${r.done ? "done" : ""}">
            <b>${escapeHtml(words[r.wi])}</b>
            ${r.done
        ? (vi ? `khớp đủ ✓` : `fully matched ✓`)
        : `'${escapeHtml(r.from)}' → '${escapeHtml(r.to)}'`}
          </span>`).join("")}</div>`
      : "";
    bucketHtml = `<section class="ms792-panel">
      <header>
        <strong>${vi ? "DANH SÁCH CHỜ — mỗi từ nằm ở đúng MỘT ký tự nó đang cần" : "WAITING LISTS — each word sits under the ONE character it needs"}</strong>
        <span>${keys.length ? `${keys.length} ${vi ? "ký tự có từ chờ" : "characters have waiters"}` : (vi ? "không còn từ nào chờ" : "nothing left waiting")}</span>
      </header>
      <div class="ms792-buckets">${cards || `<em class="ms792-empty">${vi ? "mọi từ đã xong hoặc không thể khớp" : "every word is finished or unmatchable"}</em>`}</div>
      ${movedHtml}
      <div class="ms792-hint">${escapeHtml(vi
      ? "Phải DỌN SẠCH danh sách của ký tự hiện tại trước khi xử lý: một từ có thể được xếp lại vào chính ký tự đó nếu ký tự kế tiếp của nó cũng giống, và nếu không dọn trước thì nó sẽ bị xử lý hai lần trong cùng một bước."
      : "The current character's list must be EMPTIED before processing it: a word can be re-parked onto that same character when its next character matches, and without emptying first it would be processed twice in one step.")}</div>
    </section>`;
  }

  // ── cost panel ────────────────────────────────────────────────────────────
  const totalWordLen = words.reduce((t, w) => t + w.length, 0);
  const costHtml = `<section class="ms792-panel">
    <header><strong>${vi ? "CHI PHÍ" : "COST"}</strong><span>${vi ? `|s| = ${s.length} · tổng độ dài words = ${totalWordLen}` : `|s| = ${s.length} · total word length = ${totalWordLen}`}</span></header>
    <div class="ms792-cost">
      ${approach === 1
      ? `<div class="box"><small>${vi ? "ĐÃ ĐỌC s" : "s READ"}</small><b>${counters.sRead || 0}/${counters.sLen || s.length}</b><span>${vi ? "một lượt duy nhất" : "a single pass"}</span></div>
         <div class="box"><small>${vi ? "LẦN ĐÁNH THỨC" : "WAKEUPS"}</small><b>${counters.wakeups || 0}</b><span>${vi ? `chặn trên: ${totalWordLen}` : `bounded by ${totalWordLen}`}</span></div>
         <div class="box good"><small>${vi ? "CÁCH NGÂY THƠ SẼ TỐN" : "THE NAIVE WAY WOULD COST"}</small><b>${words.length * s.length}</b><span>${vi ? `${words.length} × ${s.length} lần so ký tự` : `${words.length} × ${s.length} comparisons`}</span></div>`
      : `<div class="box"><small>${vi ? "ĐÃ ĐỌC s" : "s READ"}</small><b>${counters.sReads || 0}/${words.length}</b><span>${vi ? "lần (một lần mỗi từ)" : "times (once per word)"}</span></div>
         <div class="box warn"><small>${vi ? "SO KÝ TỰ" : "CHAR COMPARES"}</small><b>${counters.charCompares || 0}</b><span>${vi ? `tối đa ${counters.naive || 0}` : `up to ${counters.naive || 0}`}</span></div>
         <div class="box good"><small>${vi ? "CÁCH 1 CHỈ CẦN" : "APPROACH 1 NEEDS ONLY"}</small><b>${s.length + totalWordLen}</b><span>${vi ? `${s.length} + ${totalWordLen}` : `${s.length} + ${totalWordLen}`}</span></div>`}
    </div>
  </section>`;

  const statusHtml = isDone
    ? `<div class="ms792-answer">
        <small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small>
        <strong>${view.answer}</strong>
        <span>${vi ? `trong ${words.length} từ là subsequence của s` : `of the ${words.length} words are subsequences of s`}</span>
      </div>`
    : `<div class="ms792-progress">
        <span><small>${vi ? "ĐÃ MATCH" : "MATCHED"}</small><b>${view.matched === null || view.matched === undefined ? 0 : view.matched}</b></span>
        <span><small>${vi ? "VỊ TRÍ TRONG s" : "POSITION IN s"}</small><b>${si === null || si === undefined ? "—" : `${si}/${s.length}`}</b></span>
        <span><small>${vi ? "SỐ TỪ" : "WORDS"}</small><b>${words.length}</b></span>
      </div>`;

  $("treeView").innerHTML = `<section class="ms792-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa đếm số từ là subsequence" : "Number of matching subsequences visualization")}">
    <div class="ms792-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(approach === 1
      ? (vi
        ? "Lật ngược vấn đề: tại mỗi thời điểm một từ chỉ quan tâm ĐÚNG MỘT ký tự — ký tự tiếp theo nó cần. Gửi nó vào danh sách chờ của ký tự đó rồi quét s MỘT LẦN; đến ký tự c thì chỉ đánh thức đúng những từ chờ c, cho mỗi từ tiến 1 ký tự và xếp lại vào danh sách mới. Từ nào còn nằm trong danh sách chờ khi s hết thì không phải subsequence."
        : "Turn it inside out: at any moment a word cares about exactly ONE character — the next one it needs. Park it in that character's waiting list, then walk s ONCE; reaching character c wakes only the words waiting on c, advances each by one, and re-parks it. Any word still waiting when s runs out is not a subsequence.")
      : (vi
        ? "Cách trực tiếp: mỗi từ một con trỏ, quét hết s một lần cho từng từ. Dễ hiểu nhưng s bị đọc lại |words| lần. Xem bảng chi phí ở dưới để so với cách 1."
        : "The direct way: one pointer per word, walking all of s once per word. Easy to follow but s gets re-read |words| times. Compare the cost panel below with approach 1."))}</span>
    </div>

    ${statusHtml}

    <section class="ms792-panel">
      <header>
        <strong>${vi ? `s — ${s.length} ký tự, đọc từ trái sang phải` : `s — ${s.length} characters, read left to right`}</strong>
        <span>${approach === 1 ? (vi ? "↑k = ký tự này đánh thức k từ · – = không đánh thức ai" : "↑k = this character woke k words · – = woke nobody") : (vi ? "ô mờ = bỏ qua khi tìm ký tự cần" : "dim = skipped while hunting the needed character")}</span>
      </header>
      <div class="ms792-strip">${sHtml}</div>
    </section>

    <section class="ms792-panel">
      <header><strong>${vi ? "CÁC TỪ — phần đã khớp và ký tự đang cần" : "THE WORDS — matched prefix and the character now needed"}</strong><span>${words.length}</span></header>
      <div class="ms792-words">${wordsHtml}</div>
    </section>

    ${bucketHtml}
    ${costHtml}

    <div class="ms792-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 552 Student Attendance Record II ----
// The whole problem collapses to a 6-node state machine, so the view draws that
// machine and animates the counts flowing along its edges. Node and label
// positions are hand-placed constants below; tests/ checks the emitted SVG for
// label overlap and viewBox overflow so the diagram cannot silently rot.
// Sizing rule: an edge label can grow to "P +1000000000" (13 glyphs of 14px
// Consolas plus the halo ≈ 104px wide), so every label slot must clear 52px each
// side of its centre without touching a node box or leaving the viewBox, and a
// node must fit a 10-digit count at 19px. The spacing and margins below are sized
// for those worst cases, not for the bare "P" that shows before any flow exists.
// The CSS max-width matches w so the diagram renders 1:1 instead of being scaled
// down, which is what made the text look tiny.
const AR552_LAYOUT = {
  w: 760, h: 460,
  nodeW: 124, nodeH: 58,
  // node centres, indexed by state = a * 3 + l
  nodes: [
    { x: 180, y: 150 }, { x: 430, y: 150 }, { x: 680, y: 150 },
    { x: 180, y: 320 }, { x: 430, y: 320 }, { x: 680, y: 320 },
  ],
};

function renderAttendance552View(step) {
  const view = step.attendance552View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");
  const n = Number(view.n) || 0;
  const approach = Number(view.approach) || 1;
  const states = Array.isArray(view.states) ? view.states : [];
  const dp = Array.isArray(view.dp) ? view.dp : null;
  const prevDp = Array.isArray(view.prevDp) ? view.prevDp : null;
  const flows = Array.isArray(view.flows) ? view.flows : [];
  const samples = Array.isArray(view.samples) ? view.samples : null;
  const isDone = view.answer !== null && view.answer !== undefined;
  const L = AR552_LAYOUT;
  const P = L.nodes;
  const flowOn = new Map();
  for (const f of flows) flowOn.set(`${f.from}>${f.to}:${f.ch}`, f.amount);

  // ── the state machine ─────────────────────────────────────────────────────
  // Each entry is [from, to, char, path, labelX, labelY]. Positions are fixed so
  // that the 13 labels never collide with each other or with a node box.
  const half = { w: L.nodeW / 2, h: L.nodeH / 2 };
  const edges = [
    // L moves: straight to the right along each row, labels centred in the 126px
    // gaps between node boxes
    [0, 1, "L", `M ${P[0].x + half.w} ${P[0].y} L ${P[1].x - half.w} ${P[1].y}`, 305, 138],
    [1, 2, "L", `M ${P[1].x + half.w} ${P[1].y} L ${P[2].x - half.w} ${P[2].y}`, 555, 138],
    [3, 4, "L", `M ${P[3].x + half.w} ${P[3].y} L ${P[4].x - half.w} ${P[4].y}`, 305, 332],
    [4, 5, "L", `M ${P[4].x + half.w} ${P[4].y} L ${P[5].x - half.w} ${P[5].y}`, 555, 332],
    // P moves: back to column 0 of the same row; a self-loop out to the left
    // margin for l = 0, which is why the left margin is 118px wide
    [0, 0, "P", `M ${P[0].x - half.w} ${P[0].y - 14} C 50 ${P[0].y - 34}, 50 ${P[0].y + 34}, ${P[0].x - half.w} ${P[0].y + 14}`, 56, 150],
    [3, 3, "P", `M ${P[3].x - half.w} ${P[3].y - 14} C 50 ${P[3].y - 34}, 50 ${P[3].y + 34}, ${P[3].x - half.w} ${P[3].y + 14}`, 56, 320],
    [1, 0, "P", `M ${P[1].x} ${P[1].y - half.h} C ${P[1].x} 88, ${P[0].x} 88, ${P[0].x} ${P[0].y - half.h}`, 305, 96],
    [2, 0, "P", `M ${P[2].x} ${P[2].y - half.h} C ${P[2].x} 29, ${P[0].x} 29, ${P[0].x} ${P[0].y - half.h}`, 430, 52],
    [4, 3, "P", `M ${P[4].x} ${P[4].y + half.h} C ${P[4].x} 382, ${P[3].x} 382, ${P[3].x} ${P[3].y + half.h}`, 305, 374],
    [5, 3, "P", `M ${P[5].x} ${P[5].y + half.h} C ${P[5].x} 441, ${P[3].x} 441, ${P[3].x} ${P[3].y + half.h}`, 430, 418],
    // A moves: only from the a = 0 row, all landing on (1, 0)
    [0, 3, "A", `M ${P[0].x} ${P[0].y + half.h} L ${P[3].x} ${P[3].y - half.h}`, 238, 235],
    [1, 3, "A", `M ${P[1].x} ${P[1].y + half.h} L ${P[3].x + half.w} ${P[3].y - 8}`, 360, 229],
    [2, 3, "A", `M ${P[2].x} ${P[2].y + half.h} L ${P[3].x + half.w} ${P[3].y + 8}`, 560, 220],
  ];

  const edgeSvg = edges.map(([from, to, ch, path, lx, ly]) => {
    const amount = flowOn.get(`${from}>${to}:${ch}`);
    const active = amount !== undefined && amount !== "0";
    return `<path class="ar552-edge c${ch}${active ? " on" : ""}" d="${path}" marker-end="url(#ar552arrow${active ? "on" : ""})"></path>
      <text class="ar552-elabel c${ch}${active ? " on" : ""}" x="${lx}" y="${ly}">${ch}${active ? ` +${amount}` : ""}</text>`;
  }).join("");

  const nodeSvg = states.map((st, s) => {
    const val = dp ? dp[s] : "0";
    const was = prevDp ? prevDp[s] : null;
    const grew = was !== null && val !== was;
    const cls = ["ar552-node", `a${st.a}`];
    if (val !== "0") cls.push("live");
    if (grew) cls.push("grew");
    return `<g class="${cls.join(" ")}">
      <rect x="${P[s].x - half.w}" y="${P[s].y - half.h}" width="${L.nodeW}" height="${L.nodeH}" rx="9"></rect>
      <text class="st" x="${P[s].x}" y="${P[s].y - 12}">a=${st.a} l=${st.l}</text>
      <text class="vl" x="${P[s].x}" y="${P[s].y + 15}">${val}</text>
    </g>`;
  }).join("");

  const machineSvg = `<svg class="ar552-machine" viewBox="0 0 ${L.w} ${L.h}" role="img" aria-label="${escapeHtml(vi ? "Máy trạng thái 6 đỉnh" : "Six-state machine")}">
    <defs>
      <marker id="ar552arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(148,163,184,0.7)"></path>
      </marker>
      <marker id="ar552arrowon" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"></path>
      </marker>
    </defs>
    ${edgeSvg}${nodeSvg}
  </svg>`;

  // ── dp table ──────────────────────────────────────────────────────────────
  const tableHtml = [0, 1].map((a) => `<div class="ar552-trow">
      <span class="rh">a=${a}</span>
      ${[0, 1, 2].map((l) => {
    const s = a * 3 + l;
    const val = dp ? dp[s] : "0";
    const was = prevDp ? prevDp[s] : null;
    const cls = ["tc"];
    if (val === "0") cls.push("zero");
    if (was !== null && val !== was) cls.push("grew");
    return `<span class="${cls.join(" ")}"><small>l=${l}</small><b>${val}</b>${was !== null && val !== was ? `<i>${was} →</i>` : ""}</span>`;
  }).join("")}
    </div>`).join("");

  // ── concrete records, so the numbers are not abstract ─────────────────────
  let samplesHtml = "";
  if (samples) {
    const CAP = 10;
    const cells = samples.map((list, s) => {
      const st = states[s];
      const shown = list.slice(0, CAP);
      return `<div class="ar552-scell${list.length ? "" : " empty"}">
        <small>a=${st.a} l=${st.l} · ${list.length}</small>
        <div>${shown.map((rec) => `<code>${escapeHtml(rec || "ε")}</code>`).join("")}${list.length > CAP ? `<em>+${list.length - CAP}</em>` : ""}</div>
      </div>`;
    }).join("");
    samplesHtml = `<section class="ar552-panel">
      <header>
        <strong>${vi ? "CÁC BẢN GHI THẬT ĐANG ĐƯỢC ĐẾM" : "THE ACTUAL RECORDS BEING COUNTED"}</strong>
        <span>${vi ? "liệt kê bằng vét cạn, chỉ để đối chiếu" : "enumerated by brute force, for checking only"}</span>
      </header>
      <div class="ar552-samples">${cells}</div>
      <div class="ar552-hint">${escapeHtml(vi
      ? "Đếm số chuỗi trong mỗi ô sẽ thấy đúng bằng con số dp của trạng thái đó. Thuật toán KHÔNG dựng các chuỗi này — nó chỉ giữ 6 con số, đó mới là điểm mạnh."
      : "Count the strings in each cell and you get exactly that state's dp number. The algorithm never builds these strings — it only keeps the 6 counts, which is the whole point.")}</div>
    </section>`;
  }

  // ── approach 2: matrices and the bits of n ────────────────────────────────
  let matrixHtml = "";
  if (approach === 2) {
    const grid = (M, label, cls) => `<div class="ar552-mx ${cls || ""}">
        <small>${escapeHtml(label)}</small>
        <div class="rows">${M.map((row, i) => `<div class="mrow">${row.map((v, j) => `<span class="${v === "0" ? "z" : ""}${i === 0 ? " r0" : ""}">${v}</span>`).join("")}</div>`).join("")}</div>
      </div>`;
    const bits = Array.isArray(view.bits) ? view.bits : [];
    const bitsHtml = bits.map((b, k) => `<span class="ar552-bit${b ? " one" : ""}${k === view.bitIndex ? " cur" : ""}"><b>${b}</b><i>2^${k}</i></span>`).reverse().join("");
    matrixHtml = `<section class="ar552-panel">
      <header>
        <strong>${vi ? `n = ${n} dạng nhị phân — bình phương liên tiếp` : `n = ${n} in binary — repeated squaring`}</strong>
        <span>${n.toString(2)}</span>
      </header>
      <div class="ar552-bits">${bitsHtml}</div>
      <div class="ar552-mxrow">
        ${view.matrix ? grid(view.matrix, view.matrixLabel || "T", "t") : ""}
        ${view.result ? grid(view.result, "R = T^(bits so far)", "r") : ""}
      </div>
      <div class="ar552-hint">${escapeHtml(vi
      ? "Hàng 0 được tô đậm: đáp án là TỔNG HÀNG 0 của R, vì trạng thái bắt đầu là (a=0, l=0) tức chỉ số 0, nên R[0][t] đếm số bản ghi đi từ đó tới trạng thái t."
      : "Row 0 is emphasised: the answer is the SUM OF ROW 0 of R, because the start state is (a=0, l=0) — index 0 — so R[0][t] counts the records going from there to state t.")}</div>
    </section>`;
  }

  const statusHtml = isDone
    ? `<div class="ar552-answer">
        <small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small>
        <strong>${view.answer}</strong>
        <span>${vi ? `bản ghi hợp lệ dài ${n} (mod 1e9+7)` : `eligible records of length ${n} (mod 1e9+7)`}</span>
      </div>`
    : `<div class="ar552-progress">
        <span><small>${vi ? "ĐỘ DÀI" : "LENGTH"}</small><b>${view.step === null || view.step === undefined ? "—" : `${view.step}/${n}`}</b></span>
        <span><small>${vi ? "TỔNG HIỆN TẠI" : "RUNNING TOTAL"}</small><b>${view.total === null || view.total === undefined ? "—" : view.total}</b></span>
        <span><small>${vi ? "SỐ TRẠNG THÁI" : "STATES"}</small><b>6</b></span>
      </div>`;

  $("treeView").innerHTML = `<section class="ar552-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa đếm bản ghi điểm danh hợp lệ" : "Student attendance record II visualization")}">
    <div class="ar552-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(approach === 1
      ? (vi
        ? "Muốn biết một tiền tố còn nối tiếp hợp lệ được hay không, chỉ cần nhớ ĐÚNG HAI thứ: đã dùng mấy chữ 'A' (0 hay 1) và đuôi có mấy chữ 'L' liền nhau (0, 1 hay 2). Vậy chỉ có 6 trạng thái — dù n bằng 5 hay 100000. Luật 'không 3 chữ L liền nhau' được cài sẵn vào máy: trạng thái l=2 đơn giản là không có cạnh 'L' đi ra."
        : "To know whether a prefix can still be extended legally, only TWO things matter: how many 'A' it used (0 or 1) and how long its trailing 'L' run is (0, 1 or 2). That is 6 states — whether n is 5 or 100000. The 'never 3 L's in a row' rule is baked into the machine: state l=2 simply has no outgoing 'L' edge.")
      : (vi
        ? "Mỗi bước của cách 1 là CÙNG MỘT phép biến đổi tuyến tính trên vector 6 trạng thái. Lặp n lần một phép biến đổi tuyến tính chính là luỹ thừa ma trận, và luỹ thừa tính được bằng bình phương liên tiếp — từ n bước xuống còn khoảng log₂(n) bước."
        : "Every step of approach 1 is the SAME linear map on the 6-state vector. Iterating one linear map n times is a matrix power, and powers come from repeated squaring — turning n steps into about log₂(n)."))}</span>
    </div>

    ${statusHtml}

    <section class="ar552-panel">
      <header>
        <strong>${vi ? "MÁY TRẠNG THÁI 6 ĐỈNH" : "THE SIX-STATE MACHINE"}</strong>
        <span>${vi ? "số trong đỉnh = dp · nhãn cạnh = lượng chuyển ở bước này" : "number in a node = dp · edge label = the amount flowing this step"}</span>
      </header>
      ${machineSvg}
      <div class="ar552-legend">
        <span class="lg cP">P — ${vi ? "đứt đuôi L, về l=0" : "breaks the L run, back to l=0"}</span>
        <span class="lg cA">A — ${vi ? "chỉ từ hàng a=0, sang (1,0)" : "only from row a=0, lands on (1,0)"}</span>
        <span class="lg cL">L — ${vi ? "l tăng 1, không có cạnh từ l=2" : "l grows by 1, no edge out of l=2"}</span>
      </div>
    </section>

    <section class="ar552-panel">
      <header><strong>${vi ? "BẢNG dp[a][l] — chỉ 6 con số cho cả bài" : "TABLE dp[a][l] — just 6 numbers for the whole problem"}</strong><span>${vi ? "tổng" : "total"} = ${view.total === null || view.total === undefined ? "—" : view.total}</span></header>
      <div class="ar552-table">${tableHtml}</div>
    </section>

    ${samplesHtml}
    ${matrixHtml}

    <div class="ar552-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 419 Battleships in a Board ----
// The whole trick is a two-cell test, so the board draws the two cells being
// tested (above and to the left) explicitly, and tints each ship so a reader can
// check the count by eye. Ship tinting is presentation only — approach 1 never
// computes it, which is exactly why it needs no memory.
function renderBattleships419View(step) {
  const view = step.battleships419View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");
  const rows = Number(view.rows) || 0;
  const cols = Number(view.cols) || 0;
  const grid = Array.isArray(view.grid) ? view.grid : [];
  const shipOf = Array.isArray(view.shipOf) ? view.shipOf : [];
  const approach = Number(view.approach) || 1;
  const cur = view.cur;
  const checks = view.checks;
  const skip = view.skip;
  const isDone = view.answer !== null && view.answer !== undefined;
  const PALETTE = 5;

  const countedSet = new Set((view.counted || []).map(([r, c]) => `${r},${c}`));
  const seenSet = new Set((view.seen || []).map(([r, c]) => `${r},${c}`));
  const stackSet = new Set((view.stack || []).map(([r, c]) => `${r},${c}`));
  const inSkip = (r, c) => {
    if (!skip) return false;
    const lin = r * cols + c;
    return lin >= skip.from[0] * cols + skip.from[1] && lin < skip.to[0] * cols + skip.to[1];
  };

  // ── the board ─────────────────────────────────────────────────────────────
  const boardHtml = grid.map((row, r) => row.map((ch, c) => {
    const cls = ["bs419-cell"];
    const isX = ch === "X";
    const ship = shipOf[r] ? shipOf[r][c] : -1;
    if (isX) cls.push("ship", `s${ship % PALETTE}`);
    else cls.push("water");
    if (countedSet.has(`${r},${c}`)) cls.push("counted");
    if (approach === 2) {
      if (stackSet.has(`${r},${c}`)) cls.push("instack");
      else if (seenSet.has(`${r},${c}`)) cls.push("seen");
    }
    if (inSkip(r, c)) cls.push("skipped");
    if (cur && cur.r === r && cur.c === c) cls.push("cur");
    // the two cells the O(1) test looks at
    if (approach === 1 && cur && checks) {
      if (r === cur.r - 1 && c === cur.c) cls.push("probe", checks.upIsX ? "probe-x" : "probe-free");
      if (r === cur.r && c === cur.c - 1) cls.push("probe", checks.leftIsX ? "probe-x" : "probe-free");
    }
    return `<div class="${cls.join(" ")}">${isX ? "X" : "·"}${countedSet.has(`${r},${c}`) ? `<i>★</i>` : ""}</div>`;
  }).join("")).join("");

  const shipsSeen = new Set(shipOf.flat().filter((x) => x >= 0));
  const legendHtml = [...shipsSeen].sort((a, b) => a - b).map((s) => `<span class="lg s${s % PALETTE}">${vi ? "tàu" : "ship"} ${s + 1}</span>`).join("");

  // ── approach 1: the two-cell test spelled out ─────────────────────────────
  let testHtml = "";
  if (approach === 1 && cur && checks) {
    const cell = (label, val, isX) => `<div class="one ${val === null ? "off" : isX ? "isx" : "free"}">
        <small>${escapeHtml(label)}</small>
        <strong>${val === null ? "—" : escapeHtml(val)}</strong>
        <span>${val === null ? (vi ? "ngoài bảng" : "off board") : isX ? (vi ? "là tàu" : "is ship") : (vi ? "trống" : "empty")}</span>
      </div>`;
    testHtml = `<section class="bs419-panel">
      <header>
        <strong>${vi ? `PHÉP KIỂM TẠI (${cur.r},${cur.c}) — chỉ nhìn LÊN và SANG TRÁI` : `THE TEST AT (${cur.r},${cur.c}) — look only UP and LEFT`}</strong>
        <span>${vi ? "2 ô, không cần bộ nhớ" : "two cells, no memory needed"}</span>
      </header>
      <div class="bs419-test ${checks.isStart ? "start" : "inside"}">
        ${cell(vi ? `trên (${cur.r - 1},${cur.c})` : `above (${cur.r - 1},${cur.c})`, checks.up, checks.upIsX)}
        ${cell(vi ? `trái (${cur.r},${cur.c - 1})` : `left (${cur.r},${cur.c - 1})`, checks.left, checks.leftIsX)}
        <div class="verdict">
          <strong>${checks.isStart ? (vi ? "ĐẦU TÀU → đếm" : "SHIP START → count") : (vi ? "THÂN TÀU → bỏ qua" : "INSIDE A SHIP → skip")}</strong>
          <span>${escapeHtml(checks.isStart
      ? (vi ? "không bên nào là 'X' nên đây là ô trên-trái nhất của tàu"
        : "neither is 'X', so this is the ship's top-left end")
      : (vi ? `đã có 'X' ở ${checks.upIsX ? "trên" : "bên trái"} nên tàu này đã được đếm rồi`
        : `there is already an 'X' ${checks.upIsX ? "above" : "to the left"}, so this ship is already counted`))}</span>
        </div>
      </div>
      <div class="bs419-hint">${escapeHtml(vi
      ? "Vì quét theo từng hàng từ trái sang phải, ô ở trên và ô bên trái luôn đã được xét trước — còn ô dưới và ô bên phải thì chưa. Đó là lý do phép kiểm chỉ cần hai hướng đó."
      : "Because the scan goes row by row, left to right, the cell above and the cell to the left have always been visited already — the ones below and to the right have not. That is why the test needs only those two directions.")}</div>
    </section>`;
  }

  // ── approach 2: the memory it has to carry ────────────────────────────────
  let memHtml = "";
  if (approach === 2) {
    const stack = view.stack || [];
    memHtml = `<section class="bs419-panel">
      <header>
        <strong>${vi ? "BỘ NHỚ PHẢI MANG THEO" : "THE MEMORY IT MUST CARRY"}</strong>
        <span>${vi ? `seen: ${(view.seen || []).length} ô · stack: ${stack.length} ô` : `seen: ${(view.seen || []).length} cells · stack: ${stack.length} cells`}</span>
      </header>
      <div class="bs419-mem">
        <div class="box"><small>seen</small><b>${(view.seen || []).length}</b><span>${vi ? `ô đã đánh dấu (O(m·n))` : `cells marked (O(m·n))`}</span></div>
        <div class="box stack"><small>stack</small><b>${stack.length}</b><span>${stack.length ? stack.map(([r, c]) => `(${r},${c})`).join(" ") : (vi ? "rỗng" : "empty")}</span></div>
      </div>
      <div class="bs419-hint">${escapeHtml(vi
      ? "So với cách 1 chỉ dùng một biến đếm: đây chính là cái giá của flood fill, và cũng là lý do đề bài đặt thêm câu hỏi follow-up."
      : "Compare approach 1, which uses a single counter: this is what flood fill costs, and it is why the problem adds its follow-up question.")}</div>
    </section>`;
  }

  const statusHtml = isDone
    ? `<div class="bs419-answer${view.answer === 0 ? " zero" : ""}">
        <small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small>
        <strong>${view.answer}</strong>
        <span>${view.answer === 0 ? (vi ? "không có tàu nào" : "no battleships") : (vi ? "tàu chiến" : "battleships")}</span>
        ${approach === 1 ? `<em>${vi ? "một lượt quét · O(1) bộ nhớ · bảng không bị sửa" : "one pass · O(1) memory · board untouched"}</em>` : ""}
      </div>`
    : `<div class="bs419-progress">
        <span><small>${vi ? "ĐÃ ĐẾM" : "COUNTED"}</small><b>${view.count === null || view.count === undefined ? 0 : view.count}</b></span>
        <span><small>${vi ? "TÀU TRÊN BẢNG" : "SHIPS ON BOARD"}</small><b>${view.shipCount || 0}</b></span>
        <span><small>${vi ? "Ô ĐANG XÉT" : "CURRENT CELL"}</small><b>${cur ? `${cur.r},${cur.c}` : "—"}</b></span>
      </div>`;

  $("treeView").innerHTML = `<section class="bs419-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa đếm tàu chiến trên bảng" : "Battleships in a board visualization")}">
    <div class="bs419-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(approach === 1
      ? (vi
        ? "Tàu là dãy THẲNG và hai tàu không bao giờ kề nhau. Hai điều đó khiến mỗi tàu có ĐÚNG MỘT ô không có 'X' ở trên và cũng không có 'X' ở bên trái — đầu trên-trái của nó. Đếm những ô đó là đếm tàu: một lượt quét, không cần visited, không sửa bảng."
        : "Ships are STRAIGHT runs and two ships never touch. Those two facts give every ship EXACTLY ONE cell with no 'X' above and no 'X' to its left — its top-left end. Counting those cells counts the ships: one pass, no visited array, no writes to the board.")
      : (vi
        ? "Mỗi tàu là một thành phần liên thông của ô 'X', nên loang ra từng thành phần và đếm. Đúng, dễ nghĩ, nhưng phải mang theo tập seen O(m·n) — đối chiếu với cách 1 để thấy follow-up của đề đòi gì."
        : "Each ship is a connected component of 'X' cells, so flood each component and count them. Correct and easy to think of, but it must carry an O(m·n) seen set — compare approach 1 to see what the problem's follow-up is asking for."))}</span>
    </div>

    ${statusHtml}

    <section class="bs419-panel">
      <header>
        <strong>${vi ? `BẢNG ${rows} × ${cols}` : `BOARD ${rows} × ${cols}`}</strong>
        <span>${vi ? "★ = ô được đếm" : "★ = the counted cell"}</span>
      </header>
      <div class="bs419-board" style="--bs-cols:${cols}">${boardHtml}</div>
      <div class="bs419-legend">${legendHtml || `<em class="bs419-empty">${vi ? "bảng không có tàu nào" : "the board has no ships"}</em>`}</div>
      <div class="bs419-hint">${escapeHtml(vi
      ? "Màu tàu chỉ để bạn đối chiếu bằng mắt — thuật toán KHÔNG tính ra nhóm nào thuộc tàu nào, và đó chính là lý do nó không cần bộ nhớ."
      : "The ship colours are only there so you can check by eye — the algorithm never works out which cells form which ship, and that is precisely why it needs no memory.")}</div>
    </section>

    ${testHtml}
    ${memHtml}

    <div class="bs419-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 418 Sentence Screen Fitting ----
// Both approaches draw the same screen, because the screen is what the problem is
// about. Approach 1 fills it word by word. Approach 2's pointer trick looks like
// sleight of hand, so the tape is drawn as labelled copies of s with the row's
// +cols jump and its back-up marked, which makes cur // m obviously the answer.
function renderScreenFit418View(step) {
  const view = step.screenFit418View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");
  const words = Array.isArray(view.words) ? view.words : [];
  const n = Number(view.n) || 0;
  const rows = Number(view.rows) || 0;
  const cols = Number(view.cols) || 0;
  const m = Number(view.m) || 1;
  const tape = String(view.tape || "");
  const approach = Number(view.approach) || 1;
  const screen = Array.isArray(view.screen) ? view.screen : [];
  const copy = Array.isArray(view.copy) ? view.copy : [];
  const fit = view.fit;
  const ptr = view.pointer;
  const isDone = view.answer !== null && view.answer !== undefined;
  const PALETTE = 5;
  const glyph = (ch) => (ch === null || ch === undefined ? "" : ch === " " ? "·" : ch);

  // ── the screen ────────────────────────────────────────────────────────────
  const screenHtml = screen.map((row, r) => row.map((ch, c) => {
    const cls = ["sf418-cell"];
    const cp = copy[r] ? copy[r][c] : -1;
    if (ch === null || ch === undefined) cls.push("blank");
    else {
      cls.push(cp >= 0 ? `q${cp % PALETTE}` : "plain");
      if (ch === " ") cls.push("sp");
    }
    if (r === view.rowIndex && !isDone) {
      cls.push("inrow");
      // approach 1: mark the cells just written, or the tail being left blank
      if (fit && fit.fits && c >= fit.used && c < fit.used + fit.need) cls.push("wrote");
      if (fit && !fit.fits && c >= fit.used) cls.push("left");
    }
    return `<div class="${cls.join(" ")}">${escapeHtml(glyph(ch))}</div>`;
  }).join("")).join("");

  const copiesUsed = new Set(copy.flat().filter((x) => x >= 0));
  const legendHtml = [...copiesUsed].sort((a, b) => a - b).map((cp) => `<span class="lg q${cp % PALETTE}">${vi ? "câu" : "sentence"} ${cp + 1}</span>`).join("");

  // ── approach 1: sentence strip and the fit arithmetic ─────────────────────
  let sentenceHtml = "";
  if (approach === 1) {
    const strip = words.map((w, i) => `<span class="sf418-w${i === view.wordIdx && !isDone ? " cur" : ""}">${escapeHtml(w)}<i>${w.length}</i></span>`).join("");
    const fitHtml = fit
      ? `<div class="sf418-fit ${fit.fits ? "ok" : "no"}">
          <small>${vi ? "THỬ NHÉT" : "TRY TO FIT"} "${escapeHtml(fit.word)}"</small>
          <div class="calc">
            <span class="a">used ${fit.used}</span><span class="op">+</span>
            <span class="b">${fit.need}</span><span class="op">${fit.fits ? "≤" : ">"}</span>
            <span class="c">cols ${fit.cols}</span>
            <strong>${fit.fits ? (vi ? "vừa" : "fits") : (vi ? "không vừa" : "no room")}</strong>
          </div>
          <span class="why">${escapeHtml(fit.need === fit.wordLen
        ? (vi ? `đầu dòng nên chỉ cần ${fit.wordLen} cột cho từ, không cần dấu cách`
          : `row is empty, so just ${fit.wordLen} columns for the word, no space needed`)
        : (vi ? `${fit.wordLen} cột cho từ + 1 cột cho dấu cách = ${fit.need}`
          : `${fit.wordLen} columns for the word + 1 for the space = ${fit.need}`))}</span>
          ${!fit.fits ? `<em>${escapeHtml(vi ? `để trống ${fit.remaining} cột cuối dòng, "${fit.word}" chuyển sang dòng sau` : `leave the last ${fit.remaining} columns blank; "${fit.word}" moves to the next row`)}</em>` : ""}
        </div>`
      : "";
    sentenceHtml = `<section class="sf418-panel">
      <header>
        <strong>${vi ? "CÂU — con trỏ từ chạy liên tục, không reset theo dòng" : "SENTENCE — the word pointer runs continuously, never resets per row"}</strong>
        <span>${vi ? `đã đặt ${view.placed || 0} từ` : `${view.placed || 0} words placed`}</span>
      </header>
      <div class="sf418-sentence">${strip}</div>
      ${fitHtml}
    </section>`;
  }

  // ── approach 2: the tape ──────────────────────────────────────────────────
  let tapeHtml = "";
  if (approach === 2 && ptr) {
    const hi = Math.max(ptr.cur, ptr.jumpTo === null || ptr.jumpTo === undefined ? ptr.cur : ptr.jumpTo);
    const firstCopy = Math.max(0, Math.floor(ptr.prevCur / m) - (Math.floor(hi / m) - Math.floor(ptr.prevCur / m) >= 2 ? 0 : 0));
    const lastCopy = Math.min(firstCopy + 3, Math.floor(hi / m) + 1);
    const groups = [];
    for (let cp = firstCopy; cp <= lastCopy; cp++) {
      const cells = Array.from({ length: m }, (_, k) => {
        const abs = cp * m + k;
        const cls = ["sf418-tc"];
        if (abs >= ptr.prevCur && abs < ptr.cur) cls.push("consumed");
        if (ptr.backedTo !== null && ptr.backedTo !== undefined && abs >= ptr.cur && abs <= (ptr.jumpTo === null ? -1 : ptr.jumpTo)) cls.push("rolled");
        if (abs === ptr.prevCur) cls.push("start");
        if (ptr.jumpTo !== null && ptr.jumpTo !== undefined && abs === ptr.jumpTo) cls.push("jump");
        if (abs === ptr.cur) cls.push("cur");
        if (tape[k] === " ") cls.push("sp");
        return `<span class="${cls.join(" ")}"><b>${escapeHtml(glyph(tape[k]))}</b><i>${abs}</i></span>`;
      }).join("");
      groups.push(`<div class="sf418-copy q${cp % PALETTE}">
        <small>${vi ? "câu" : "sentence"} ${cp + 1}</small>
        <div class="cells">${cells}</div>
      </div>`);
    }
    const doneCopies = Math.floor(ptr.cur / m);
    tapeHtml = `<section class="sf418-panel">
      <header>
        <strong>${vi ? `BĂNG s lặp vô hạn — mỗi bản lặp đúng m = ${m} ký tự` : `THE TAPE s repeated forever — each copy is exactly m = ${m} characters`}</strong>
        <span>${vi ? "số nhỏ = vị trí tuyệt đối" : "small number = absolute position"}</span>
      </header>
      <div class="sf418-tape">${groups.join("")}</div>
      <div class="sf418-tlegend">
        <span class="lg start">${vi ? "đầu dòng này" : "row starts here"}</span>
        ${ptr.jumpTo !== null && ptr.jumpTo !== undefined ? `<span class="lg jump">+cols → ${ptr.jumpTo}</span>` : ""}
        <span class="lg consumed">${vi ? "dòng này hiển thị" : "this row shows"}</span>
        ${ptr.backedTo !== null && ptr.backedTo !== undefined ? `<span class="lg rolled">${vi ? "đã lùi lại (từ bị cắt)" : "backed out (split word)"}</span>` : ""}
        <span class="lg cur">cur = ${ptr.cur}</span>
      </div>
      <div class="sf418-div">
        <span class="lbl">${vi ? "ĐÁP ÁN LÀ" : "THE ANSWER IS"}</span>
        <span class="eq">cur // m = ${ptr.cur} // ${m} = <strong>${doneCopies}</strong></span>
        <span class="bars">${Array.from({ length: Math.max(1, doneCopies + 1) }, (_, k) => `<i class="${k < doneCopies ? "full" : "part"}" style="--f:${k < doneCopies ? 100 : Math.round(((ptr.cur % m) / m) * 100)}%"></i>`).join("")}</span>
        <span class="note">${escapeHtml(vi
      ? `${doneCopies} bản lặp trọn vẹn${ptr.cur % m ? ` + ${ptr.cur % m}/${m} ký tự của bản kế tiếp (chưa trọn nên không tính)` : ""}`
      : `${doneCopies} whole copies${ptr.cur % m ? ` + ${ptr.cur % m}/${m} characters of the next one (incomplete, so it does not count)` : ""}`)}</span>
      </div>
    </section>`;
  }

  const tooLongHtml = view.tooLong
    ? `<div class="sf418-toolong">${escapeHtml(vi
      ? `Từ "${view.tooLong.word}" dài ${view.tooLong.len} ký tự nhưng một dòng chỉ có ${cols} cột. Không được cắt từ sang hai dòng nên nó không bao giờ viết được → đáp án 0.`
      : `Word "${view.tooLong.word}" is ${view.tooLong.len} characters but a row has only ${cols} columns. Words cannot be split across lines, so it can never be written → the answer is 0.`)}</div>`
    : "";

  const statusHtml = isDone
    ? `<div class="sf418-answer${view.answer === 0 ? " zero" : ""}">
        <small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small>
        <strong>${view.answer}</strong>
        <span>${view.answer === 0
      ? (vi ? "không câu nào viết trọn vẹn được" : "no sentence fits completely")
      : (vi ? `lần câu "${escapeHtml(words.join(" "))}" được viết trọn vẹn` : `complete copies of "${escapeHtml(words.join(" "))}"`)}</span>
      </div>`
    : `<div class="sf418-progress">
        ${approach === 1
      ? `<span><small>${vi ? "TỪ ĐÃ ĐẶT" : "WORDS PLACED"}</small><b>${view.placed || 0}</b></span>`
      : `<span><small>cur</small><b>${ptr ? ptr.cur : 0}</b></span>`}
        <span><small>${vi ? "CÂU TRỌN VẸN" : "COMPLETE SENTENCES"}</small><b>${view.completed || 0}</b></span>
        <span><small>${vi ? "DÒNG" : "ROW"}</small><b>${view.rowIndex === null || view.rowIndex === undefined ? "—" : `${view.rowIndex}/${rows - 1}`}</b></span>
      </div>`;

  $("treeView").innerHTML = `<section class="sf418-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa xếp câu vừa màn hình" : "Sentence screen fitting visualization")}">
    <div class="sf418-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(approach === 1
      ? (vi
        ? `Lấp từng dòng, mỗi lần thử nhét thêm một từ. Một từ tốn len(w) cột, CỘNG 1 cột nữa cho dấu cách nếu dòng đã có chữ. Con trỏ từ chạy liên tục qua các bản lặp của câu và không reset theo dòng — nên cuối cùng chỉ cần lấy (số từ đã đặt) // ${n}.`
        : `Fill each row, trying one more word each time. A word costs len(w) columns, PLUS 1 for the space if the row is not empty. The word pointer runs continuously across copies of the sentence and never resets per row — so at the end the answer is just (words placed) // ${n}.`)
      : (vi
        ? `Nối câu bằng dấu cách rồi THÊM MỘT DẤU CÁCH Ở CUỐI: s = "${tape.replace(/ /g, "·")}". Nhờ dấu cách cuối, lặp s vô hạn cho ra dòng chữ liên tục mà ranh giới giữa hai bản lặp cũng chỉ là một dấu cách bình thường. Mỗi dòng: cur += cols; nếu rơi vào dấu cách thì nuốt nó, còn rơi giữa từ thì lùi về đầu từ đó. Cuối cùng cur // m là đáp án vì mỗi câu trọn vẹn chiếm đúng m ký tự băng.`
        : `Join the sentence with spaces and APPEND ONE MORE SPACE: s = "${tape.replace(/ /g, "·")}". Thanks to that trailing space, repeating s forever spells continuous text where the seam between copies is just an ordinary space. Each row: cur += cols; if it lands on a space swallow it, if it lands mid-word back up to where that word starts. At the end cur // m is the answer, because each complete sentence occupies exactly m tape characters.`))}</span>
    </div>

    ${statusHtml}
    ${tooLongHtml}

    <section class="sf418-panel">
      <header>
        <strong>${vi ? `MÀN HÌNH ${rows} × ${cols}` : `SCREEN ${rows} × ${cols}`}</strong>
        <span>${vi ? "· = dấu cách · ô trống = cột bỏ trống" : "· = a space · empty cell = unused column"}</span>
      </header>
      <div class="sf418-screen" style="--sf-cols:${cols}">${screenHtml}</div>
      <div class="sf418-legend">${legendHtml || `<em class="sf418-empty">${vi ? "màn hình còn trống" : "the screen is empty"}</em>`}</div>
    </section>

    ${sentenceHtml}
    ${tapeHtml}

    <div class="sf418-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 1554 Strings Differ by One Character ----
// The masking trick is the whole problem, so the layout puts the pattern grid
// (word × masked index) front and centre: a repeat inside that grid IS the
// answer. Approach 2 swaps the grid for a pair matrix so the O(n²) cost it pays
// is visible next to approach 1's O(n·m) insertions.
function renderDifferByOne1554View(step) {
  const view = step.differByOne1554View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");
  const words = Array.isArray(view.words) ? view.words : [];
  const m = Number(view.m) || 0;
  const n = words.length;
  const approach = Number(view.approach) || 1;
  const isDone = view.answer !== null && view.answer !== undefined;
  const collide = view.collide;
  const counters = view.counters || {};
  const wi = view.wi;
  const pi = view.pi;
  const pair = view.pair;

  const partOfMatch = (idx) => collide && (collide.a === idx || collide.b === idx);

  // ── word list, each word as its own character row ─────────────────────────
  const wordsHtml = words.map((w, idx) => {
    const cls = ["dbo1554-word"];
    if (idx === wi && !isDone) cls.push("cur");
    if (partOfMatch(idx)) cls.push("match");
    if (pair && (pair.i === idx || pair.j === idx)) cls.push("inpair");
    return `<div class="${cls.join(" ")}">
      <span class="wl">w${idx}</span>
      <div class="chs">${w.split("").map((ch, p) => {
      const c = ["ch"];
      const masked = idx === wi && p === pi && !isDone;
      if (masked) c.push("masked");
      if (collide && collide.index === p && partOfMatch(idx)) c.push("diff");
      else if (collide && partOfMatch(idx)) c.push("same");
      else if (pair && (pair.i === idx || pair.j === idx)) {
        if (pair.diffs.includes(p)) c.push("diff");
        else if (p < pair.scanned) c.push("same");
      }
      return `<span class="${c.join(" ")}">${escapeHtml(masked ? "*" : ch)}</span>`;
    }).join("")}</div>
    </div>`;
  }).join("");

  const indexRuler = `<div class="dbo1554-ruler"><span class="wl"></span><div class="chs">${Array.from({ length: m }, (_, p) => `<span class="ch">${p}</span>`).join("")}</div></div>`;

  // ── approach 1: the pattern grid ──────────────────────────────────────────
  let gridHtml = "";
  if (view.table) {
    const head = `<div class="dbo1554-trow head"><span class="rh">${vi ? "che →" : "mask →"}</span>${Array.from({ length: m }, (_, p) => `<span class="tc${p === pi && !isDone ? " col" : ""}">${p}</span>`).join("")}</div>`;
    const body = view.table.map((row, r) => `<div class="dbo1554-trow">
        <span class="rh${r === wi && !isDone ? " lit" : ""}">w${r}</span>
        ${row.map((pat, p) => {
      const c = ["tc"];
      if (pat === null || pat === undefined) c.push("unbuilt");
      if (collide && pat === collide.pattern) c.push("collide");
      else if (r === wi && p === pi && !isDone) c.push("cur");
      return `<span class="${c.join(" ")}">${pat === null || pat === undefined ? "" : escapeHtml(pat)}</span>`;
    }).join("")}
      </div>`).join("");
    gridHtml = `<section class="dbo1554-panel">
      <header>
        <strong>${vi ? "BẢNG PATTERN — hàng = từ, cột = vị trí bị che" : "PATTERN GRID — row = word, column = masked index"}</strong>
        <span>${vi ? `${counters.built || 0}/${counters.total || 0} pattern` : `${counters.built || 0}/${counters.total || 0} patterns`}</span>
      </header>
      <div class="dbo1554-table">${head}${body}</div>
      <div class="dbo1554-hint">${escapeHtml(vi
      ? "Hai ô TRÙNG NHAU ở bất kỳ đâu trong bảng này chính là đáp án: chúng phải nằm ở cùng một cột (cùng vị trí bị che) và thuộc hai từ khác nhau."
      : "Any two IDENTICAL cells anywhere in this grid are the answer: they must sit in the same column (same masked index) and belong to two different words.")}</div>
    </section>`;
  }

  // ── approach 1: the set ───────────────────────────────────────────────────
  let seenHtml = "";
  if (view.seen) {
    const chips = view.seen.map((e) => {
      const hot = collide && e.pattern === collide.pattern;
      return `<div class="dbo1554-chip${hot ? " hot" : ""}"><strong>${escapeHtml(e.pattern)}</strong><span>w${e.wi}</span></div>`;
    }).join("");
    seenHtml = `<section class="dbo1554-panel">
      <header><strong>${vi ? "SET seen — pattern → từ đã thêm nó" : "SET seen — pattern → the word that inserted it"}</strong><span>${view.seen.length}</span></header>
      <div class="dbo1554-chips">${chips || `<em class="dbo1554-empty">${vi ? "set đang rỗng" : "the set is empty"}</em>`}</div>
    </section>`;
  }

  // ── approach 2: the pair matrix ───────────────────────────────────────────
  let matrixHtml = "";
  if (view.pairMatrix) {
    const head = `<div class="dbo1554-trow head"><span class="rh"></span>${words.map((_, j) => `<span class="tc${pair && pair.j === j ? " col" : ""}">w${j}</span>`).join("")}</div>`;
    const body = view.pairMatrix.map((row, i) => `<div class="dbo1554-trow">
        <span class="rh${pair && pair.i === i ? " lit" : ""}">w${i}</span>
        ${row.map((v, j) => {
      const c = ["tc"];
      if (j <= i) c.push("na");
      else if (v === null || v === undefined) c.push("unbuilt");
      else if (v === 1) c.push("collide");
      if (pair && pair.i === i && pair.j === j) c.push("cur");
      const label = j <= i ? "" : v === null || v === undefined ? "" : v === 1 ? "1" : v === 0 ? "0" : "≥2";
      return `<span class="${c.join(" ")}">${label}</span>`;
    }).join("")}
      </div>`).join("");
    matrixHtml = `<section class="dbo1554-panel">
      <header>
        <strong>${vi ? "MA TRẬN CẶP — số vị trí khác nhau" : "PAIR MATRIX — count of differing indices"}</strong>
        <span>${counters.comparedPairs || 0}/${counters.totalPairs || 0} ${vi ? "cặp" : "pairs"} · ${counters.charCompares || 0} ${vi ? "lần so ký tự" : "char compares"}</span>
      </header>
      <div class="dbo1554-table">${head}${body}</div>
      <div class="dbo1554-hint">${escapeHtml(vi
      ? `Cần tìm ô có giá trị đúng 1. Phải xét tới ${counters.totalPairs || 0} cặp — cách 1 chỉ cần ${counters.total || n * m} lần băm và không so cặp nào.`
      : `We are looking for a cell equal to exactly 1. Up to ${counters.totalPairs || 0} pairs must be examined — approach 1 needs only ${counters.total || n * m} hash insertions and compares no pairs at all.`)}</div>
    </section>`;
  }

  // ── the payoff: the two words aligned ─────────────────────────────────────
  let matchHtml = "";
  if (collide) {
    const a = words[collide.a];
    const b = words[collide.b];
    matchHtml = `<section class="dbo1554-match">
      <small>${vi ? "CẶP TÌM ĐƯỢC — khớp mọi vị trí, trừ đúng một" : "THE PAIR — matching everywhere except exactly one index"}</small>
      <div class="rows">
        <div class="row"><span class="wl">w${collide.a}</span>${a.split("").map((ch, p) => `<span class="ch ${p === collide.index ? "diff" : "same"}">${escapeHtml(ch)}</span>`).join("")}</div>
        <div class="row marks"><span class="wl"></span>${a.split("").map((_, p) => `<span class="ch">${p === collide.index ? "✕" : "="}</span>`).join("")}</div>
        <div class="row"><span class="wl">w${collide.b}</span>${b.split("").map((ch, p) => `<span class="ch ${p === collide.index ? "diff" : "same"}">${escapeHtml(ch)}</span>`).join("")}</div>
      </div>
      <em>${escapeHtml(vi
      ? `Chỉ vị trí ${collide.index} khác: '${a[collide.index]}' so với '${b[collide.index]}'.${collide.pattern ? ` Che vị trí đó thì cả hai đều thành "${collide.pattern}".` : ""}`
      : `Only index ${collide.index} differs: '${a[collide.index]}' versus '${b[collide.index]}'.${collide.pattern ? ` Masking it turns both into "${collide.pattern}".` : ""}`)}</em>
    </section>`;
  }

  const statusHtml = isDone
    ? `<div class="dbo1554-answer ${view.answer ? "yes" : "no"}">
        <small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small>
        <strong>${view.answer ? "true" : "false"}</strong>
        <span>${view.answer
      ? (vi ? "có hai từ khác nhau đúng một ký tự" : "two words differ by exactly one character")
      : (vi ? "mọi cặp đều khác nhau ở ≥ 2 vị trí" : "every pair differs at 2 or more indices")}</span>
      </div>`
    : `<div class="dbo1554-progress">
        ${approach === 1
      ? `<span><small>${vi ? "PATTERN ĐÃ SINH" : "PATTERNS BUILT"}</small><b>${counters.built || 0}/${counters.total || 0}</b></span>`
      : `<span><small>${vi ? "CẶP ĐÃ XÉT" : "PAIRS CHECKED"}</small><b>${counters.comparedPairs || 0}/${counters.totalPairs || 0}</b></span>
         <span><small>${vi ? "SO KÝ TỰ" : "CHAR COMPARES"}</small><b>${counters.charCompares || 0}</b></span>`}
      </div>`;

  $("treeView").innerHTML = `<section class="dbo1554-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa hai chuỗi khác nhau đúng một ký tự" : "Strings differ by one character visualization")}">
    <div class="dbo1554-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(approach === 1
      ? (vi
        ? "Nếu hai từ khác nhau ĐÚNG ở vị trí i, thì che vị trí i của cả hai (thay bằng '*') sẽ cho ra hai chuỗi GIỐNG HỆT nhau — và ngược lại. Vậy 'khác 1 ký tự' biến thành 'trùng pattern', mà cái đó thì hash set trả lời được, không cần so cặp nào."
        : "If two words differ EXACTLY at index i, masking index i in both (writing '*') yields IDENTICAL strings — and the converse holds. So 'differ by one character' becomes 'patterns collide', which a hash set answers without comparing any pair.")
      : (vi
        ? "Cách thẳng thắn: xét mọi cặp, đếm số vị trí khác, dừng sớm ở vị trí khác thứ hai. Dễ hiểu nhưng O(n²·m) nên TLE với giới hạn 10⁵ ký tự — đối chiếu với cách 1 để thấy mẹo che ký tự tiết kiệm bao nhiêu."
        : "The straightforward way: examine every pair, count differing indices, bail out at the second one. Easy to follow but O(n²·m), which times out against the 10⁵-character limit — compare it with approach 1 to see what the masking trick saves."))}</span>
    </div>

    ${statusHtml}

    <section class="dbo1554-panel">
      <header>
        <strong>${vi ? `dict — ${n} từ × ${m} ký tự` : `dict — ${n} words × ${m} characters`}</strong>
        <span>${vi ? "'*' = vị trí đang bị che" : "'*' = the index being masked"}</span>
      </header>
      <div class="dbo1554-words">${indexRuler}${wordsHtml}</div>
    </section>

    ${matchHtml}
    ${gridHtml}
    ${seenHtml}
    ${matrixHtml}

    <div class="dbo1554-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 1055 Shortest Way to Form String ----
// The answer counts SWEEPS over source, so the layout pairs two strips: target
// coloured by which sweep covered each character, and source showing the sweep in
// progress. Seeing target get partitioned is seeing the answer.
function renderShortestWay1055View(step) {
  const view = step.shortestWay1055View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");
  const source = String(view.source || "");
  const target = String(view.target || "");
  const passes = Array.isArray(view.passes) ? view.passes : [];
  const curPass = view.curPass;
  const approach = Number(view.approach) || 1;
  const isDone = view.answer !== null && view.answer !== undefined;
  const PALETTE = 6;
  const passColor = (idx) => (idx - 1) % PALETTE;

  // Which pass covered each target index, and which source index did it.
  const coverBy = new Array(target.length).fill(-1);
  const coverFrom = new Array(target.length).fill(-1);
  passes.forEach((p) => p.picks.forEach((k) => { coverBy[k.ti] = p.index; coverFrom[k.ti] = k.si; }));
  // Source indices consumed by the CURRENT pass only: source restarts each sweep,
  // so showing older passes' picks here would be misleading.
  const curPicks = new Map();
  const cp = passes.find((p) => p.index === curPass);
  if (cp) cp.picks.forEach((k) => curPicks.set(k.si, k.ti));

  // ── target strip ──────────────────────────────────────────────────────────
  const needIdx = approach === 1 ? view.i : view.i;
  const targetHtml = target.split("").map((ch, t) => {
    const cls = ["sw1055-ch"];
    if (coverBy[t] > 0) cls.push("covered", `p${passColor(coverBy[t])}`);
    else cls.push("todo");
    if (t === view.matchedTi) cls.push("justmatched");
    else if (t === needIdx && !isDone) cls.push("need");
    if (view.check && view.check.ti === t) cls.push(view.check.ok ? "checkok" : "checkbad");
    return `<div class="${cls.join(" ")}">
      <strong>${escapeHtml(ch)}</strong>
      <span class="ix">${t}</span>
      ${coverFrom[t] >= 0 ? `<span class="src">s${coverFrom[t]}</span>` : `<span class="src">·</span>`}
    </div>`;
  }).join("");

  // ── source strip ──────────────────────────────────────────────────────────
  const inSkip = (s) => view.skipFrom !== null && view.skipFrom !== undefined
    && s >= view.skipFrom && s <= view.skipTo;
  const ptr = approach === 1 ? view.j : view.j;
  const lk = view.lookup;
  const sourceHtml = source.split("").map((ch, s) => {
    const cls = ["sw1055-ch"];
    if (curPicks.has(s)) cls.push("picked", `p${passColor(curPass || 1)}`);
    else if (inSkip(s)) cls.push("skipped");
    else cls.push("plain");
    if (lk && lk.kind === "hit" && lk.value === s) cls.push("jumped");
    if (lk && lk.kind === "build" && lk.row === s) cls.push("building");
    if (s === ptr && !isDone) cls.push("ptr");
    return `<div class="${cls.join(" ")}">
      <strong>${escapeHtml(ch)}</strong>
      <span class="ix">${s}</span>
      ${curPicks.has(s) ? `<span class="src">t${curPicks.get(s)}</span>` : `<span class="src">·</span>`}
    </div>`;
  }).join("") + `<div class="sw1055-ch end${ptr === source.length && !isDone ? " ptr" : ""}"><strong>⊣</strong><span class="ix">${source.length}</span><span class="src">·</span></div>`;

  // ── runs: the partition of target, one run per subsequence ────────────────
  const runsHtml = passes.length
    ? passes.map((p) => {
      const text = p.to >= p.from ? target.slice(p.from, p.to + 1) : "";
      const srcIdx = p.picks.map((k) => k.si).join(",");
      return `<div class="sw1055-run p${passColor(p.index)}${p.index === curPass && !isDone ? " cur" : ""}">
          <small>${vi ? "lượt" : "sweep"} ${p.index}</small>
          <strong>${escapeHtml(text || "—")}</strong>
          <em>${vi ? "source" : "source"}[${escapeHtml(srcIdx || "—")}]</em>
        </div>`;
    }).join(`<b class="sw1055-plus">+</b>`)
    : `<em class="sw1055-empty">${vi ? "chưa có lượt nào" : "no sweep yet"}</em>`;

  // ── character availability ────────────────────────────────────────────────
  const letters = Array.isArray(view.sourceChars) ? view.sourceChars : [];
  const availHtml = `<div class="sw1055-avail">
    ${letters.map((c) => `<span class="lt${view.check && view.check.ch === c && view.check.ok ? " hit" : ""}">${escapeHtml(c)}</span>`).join("")}
    ${view.badChar ? `<span class="lt bad">${escapeHtml(view.badChar)} ✕</span>` : ""}
  </div>`;

  // ── next-occurrence table (approach 2) ────────────────────────────────────
  let tableHtml = "";
  if (view.nxtTable) {
    const tb = view.nxtTable;
    const cols = tb.n + 1;
    const head = `<div class="sw1055-trow head">
      <span class="rh">i →</span>
      ${Array.from({ length: cols }, (_, i) => `<span class="tc${lk && lk.row === i ? " col" : ""}">${i}${i < tb.n ? `<i>${escapeHtml(source[i])}</i>` : `<i>⊣</i>`}</span>`).join("")}
    </div>`;
    const body = tb.rows.map((row) => `<div class="sw1055-trow${lk && lk.ch === row.ch ? " lit" : ""}">
        <span class="rh">${escapeHtml(row.ch)}</span>
        ${row.cells.map((v, i) => {
      const cls = ["tc"];
      if (v === null || v === undefined) cls.push("unbuilt");
      else if (v === tb.n) cls.push("none");
      if (lk && lk.ch === row.ch && lk.row === i) cls.push(lk.kind === "miss" ? "miss" : "hit");
      if (lk && lk.kind === "miss" && lk.ch === row.ch && i === lk.restartRow) cls.push("restart");
      return `<span class="${cls.join(" ")}">${v === null || v === undefined ? "" : v}</span>`;
    }).join("")}
      </div>`).join("");
    tableHtml = `<section class="sw1055-panel">
      <header>
        <strong>${vi ? "BẢNG nxt[i][c] — vị trí ĐẦU TIÊN ≥ i trong source có ký tự c" : "TABLE nxt[i][c] — FIRST index ≥ i in source holding c"}</strong>
        <span>${vi ? `giá trị ${tb.n} = không còn` : `value ${tb.n} = none left`}</span>
      </header>
      <div class="sw1055-table">${head}${body}</div>
      ${lk && lk.kind === "miss"
        ? `<div class="sw1055-lkup miss">${escapeHtml(vi
          ? `nxt[${lk.row}]['${lk.ch}'] = ${lk.value} → hết source, phải mở lượt mới rồi tra lại nxt[0]['${lk.ch}'] = ${lk.restartValue}`
          : `nxt[${lk.row}]['${lk.ch}'] = ${lk.value} → source exhausted, open a new sweep and look up nxt[0]['${lk.ch}'] = ${lk.restartValue}`)}</div>`
        : lk && lk.kind === "hit"
          ? `<div class="sw1055-lkup hit">${escapeHtml(vi
            ? `nxt[${lk.row}]['${lk.ch}'] = ${lk.value} → nhảy thẳng tới source[${lk.value}], không quét`
            : `nxt[${lk.row}]['${lk.ch}'] = ${lk.value} → jump straight to source[${lk.value}], no scanning`)}</div>`
          : ""}
    </section>`;
  }

  const answerHtml = isDone
    ? `<div class="sw1055-answer${view.answer === -1 ? " none" : ""}">
        <small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small>
        <strong>${view.answer}</strong>
        <span>${view.answer === -1
      ? (vi ? "không thể ghép được" : "impossible")
      : (vi ? `subsequence của source ghép thành "${escapeHtml(target)}"` : `subsequences of source spell "${escapeHtml(target)}"`)}</span>
      </div>`
    : `<div class="sw1055-progress">
        <span><small>${vi ? "ĐÃ DÙNG" : "SWEEPS USED"}</small><b>${view.count === null || view.count === undefined ? 0 : view.count}</b></span>
        <span><small>${vi ? "PHỦ ĐƯỢC" : "COVERED"}</small><b>${coverBy.filter((x) => x > 0).length}/${target.length}</b></span>
      </div>`;

  $("treeView").innerHTML = `<section class="sw1055-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa ít subsequence nhất để ghép thành target" : "Fewest subsequences to form the target visualization")}">
    <div class="sw1055-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(vi
      ? "Mỗi subsequence = MỘT LƯỢT quét source từ trái sang phải, dọc đường nhặt ký tự khớp target theo thứ tự. Hết source mà target chưa xong thì buộc mở lượt mới. Nên đáp án chính là số lượt, và target bị cắt thành đúng số đoạn đó."
      : "Each subsequence is ONE SWEEP across source, left to right, picking up characters that match target in order. If source runs out while target is unfinished, a new sweep is forced. So the answer is the number of sweeps, and target is partitioned into exactly that many runs.")}</span>
    </div>

    ${answerHtml}

    <section class="sw1055-panel">
      <header>
        <strong>${vi ? "TARGET — màu = lượt nào phủ ký tự đó" : "TARGET — colour = which sweep covered it"}</strong>
        <span>${vi ? "sN = lấy từ source[N]" : "sN = taken from source[N]"}</span>
      </header>
      <div class="sw1055-strip">${targetHtml}</div>
    </section>

    <section class="sw1055-panel">
      <header>
        <strong>${vi ? `SOURCE — lượt quét ${curPass || "—"}` : `SOURCE — sweep ${curPass || "—"}`}</strong>
        <span>${vi ? "tN = dùng để phủ target[N] · ⊣ = hết source" : "tN = used to cover target[N] · ⊣ = end of source"}</span>
      </header>
      <div class="sw1055-strip">${sourceHtml}</div>
      ${availHtml}
    </section>

    <section class="sw1055-panel">
      <header><strong>${vi ? "TARGET CẮT THÀNH CÁC ĐOẠN — mỗi đoạn là một subsequence" : "TARGET SPLIT INTO RUNS — one run per subsequence"}</strong><span>${passes.length}</span></header>
      <div class="sw1055-runs">${runsHtml}</div>
    </section>

    ${tableHtml}

    <div class="sw1055-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 778 Swim in Rising Water ----
// Two things the generic bfsGrid renderer could not show, and both are the point:
//   1. The water. Dijkstra pops times in nondecreasing order, so the popped time
//      IS the current water level — the grid is drawn flooded up to it, and the
//      submerged region visibly grows as the algorithm runs.
//   2. That a route costs max(elevations), not their sum. Every relaxation shows
//      the max(...) with both operands, plus an explicit "not 13+16" reminder.
function renderSwimWater778View(step) {
  const view = step.swimWater778View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");

  if (view.error) {
    $("treeView").innerHTML = `<section class="sw778-viz"><div class="sw778-error">${escapeHtml(pick(view.error))}</div></section>`;
    return;
  }

  const n = Number(view.n) || 0;
  const maxVal = Number(view.maxVal) || 1;
  const compact = Boolean(view.compact);
  const cells = Array.isArray(view.cells) ? view.cells : [];
  const heap = Array.isArray(view.heap) ? view.heap : [];
  const levels = Array.isArray(view.levels) ? view.levels : [];
  const counters = view.counters || {};
  const cur = view.cur;
  const probe = view.probe;
  const level = view.level;
  const isDone = view.answer !== null && view.answer !== undefined;
  const fmtBest = (v) => (v === null || v === undefined ? "∞" : String(v));

  // ── Water gauge ───────────────────────────────────────────────────────────
  const submerged = cells.reduce((s, row) => s + row.filter((x) => x.wet).length, 0);
  const gauge = `<div class="sw778-water${level === null || level === undefined ? " idle" : ""}">
    <div class="lvl">
      <small>${vi ? "MỰC NƯỚC" : "WATER LEVEL"}</small>
      <strong>${level === null || level === undefined ? "—" : `t = ${level}`}</strong>
    </div>
    <div class="gauge"><i style="width:${level === null || level === undefined ? 0 : Math.round((level / maxVal) * 100)}%"></i></div>
    <span>${escapeHtml(level === null || level === undefined
    ? (vi ? "chưa bắt đầu" : "not started")
    : (vi ? `${submerged}/${n * n} ô đã chìm (độ cao ≤ ${level})` : `${submerged}/${n * n} cells submerged (elevation ≤ ${level})`))}</span>
  </div>`;

  // ── Grid ──────────────────────────────────────────────────────────────────
  const gridHtml = cells.map((row, r) => row.map((cell, c) => {
    const cls = ["sw778-cell", cell.wet ? "wet" : "dry"];
    if (cell.finalized) cls.push("settled");
    if (cell.inHeap) cls.push("inheap");
    if (cell.path) cls.push("path");
    if (cell.bottleneck) cls.push("bottleneck");
    if (cell.cur) cls.push("cur");
    if (cell.probe && cell.verdict) cls.push("probe", `v-${cell.verdict}`);
    const badge = cell.verdict === "improved" ? "↓"
      : cell.verdict === "noImprove" ? "=" : "";
    const role = cell.role === "start" ? "S" : cell.role === "target" ? "T" : "";
    return `<div class="${cls.join(" ")}" style="--h:${(cell.elev / maxVal).toFixed(3)}">
      ${role ? `<span class="rl">${role}</span>` : ""}
      <strong>${cell.elev}</strong>
      ${compact ? "" : `<span class="t">${cell.best === null || cell.best === undefined ? "∞" : `t${cell.best}`}</span>`}
      ${badge ? `<span class="vb">${badge}</span>` : ""}
    </div>`;
  }).join("")).join("");

  // ── The max(...) relaxation, spelled out ──────────────────────────────────
  let formulaHtml = "";
  if (probe && probe.verdict !== "oob") {
    const why = probe.needsRise
      ? (vi ? `ô cao ${probe.elev} > mực nước ${probe.fromTime} → phải chờ nước dâng lên ${probe.elev}`
        : `cell at ${probe.elev} > level ${probe.fromTime} → must wait for the water to rise to ${probe.elev}`)
      : (vi ? `ô cao ${probe.elev} đã chìm dưới mực nước ${probe.fromTime} → vào ngay, không chờ thêm`
        : `cell at ${probe.elev} is already under level ${probe.fromTime} → enter now, no extra wait`);
    formulaHtml = `<div class="sw778-formula v-${probe.verdict}">
      <small>${vi ? `THỜI ĐIỂM TỚI (${probe.r},${probe.c})` : `ARRIVAL TIME AT (${probe.r},${probe.c})`}</small>
      <div class="calc">
        <span class="op">max(</span><span class="a">${probe.fromTime}</span><span class="op">,</span><span class="b">${probe.elev}</span><span class="op">) =</span><strong>${probe.newTime}</strong>
      </div>
      <span class="why">${escapeHtml(why)}</span>
      <em class="cmp">best: ${fmtBest(probe.oldBest)} ${probe.verdict === "improved" ? `→ ${probe.newTime}` : `(${vi ? "giữ nguyên" : "unchanged"})`}</em>
      <span class="nosum">${escapeHtml(vi ? `không phải ${probe.fromTime} + ${probe.elev} = ${probe.fromTime + probe.elev}` : `not ${probe.fromTime} + ${probe.elev} = ${probe.fromTime + probe.elev}`)}</span>
    </div>`;
  } else if (probe) {
    formulaHtml = `<div class="sw778-formula v-oob">
      <small>${vi ? "NƯỚC ĐI" : "MOVE"}</small>
      <div class="calc"><span class="op">(${probe.r},${probe.c})</span></div>
      <span class="why">${escapeHtml(vi ? "ra ngoài lưới" : "outside the grid")}</span>
    </div>`;
  }

  const curHtml = cur
    ? `<div class="sw778-state"><small>${vi ? "ĐANG CHỐT" : "SETTLING"}</small><strong>(${cur.r},${cur.c})</strong><span>t = ${cur.time}</span></div>`
    : `<div class="sw778-state idle"><small>${vi ? "ĐANG CHỐT" : "SETTLING"}</small><strong>—</strong></div>`;

  const countersHtml = `<div class="sw778-counters">
    <span><b>${counters.popped || 0}</b>${vi ? "pop" : "popped"}</span>
    <span><b>${counters.pushed || 0}</b>${vi ? "push" : "pushed"}</span>
    <span class="cut"><b>${counters.notImproved || 0}</b>${vi ? "không tốt hơn" : "no better"}</span>
    <span class="cut"><b>${counters.skippedStale || 0}</b>${vi ? "bản cũ" : "stale"}</span>
  </div>`;

  // ── Heap ──────────────────────────────────────────────────────────────────
  const HMAX = 26;
  const heapHtml = heap.slice(0, HMAX).map((h) => `<div class="sw778-hchip${h.head ? " head" : ""}">
      ${h.head ? `<em>${vi ? "nhỏ nhất" : "min"}</em>` : ""}
      <strong>t${h.t}</strong><span>(${h.r},${h.c})</span>
    </div>`).join("") + (heap.length > HMAX ? `<div class="sw778-hmore">+${heap.length - HMAX}</div>` : "");

  // ── The rising sequence ───────────────────────────────────────────────────
  const levelsHtml = levels.length
    ? levels.map((t, i) => `<span class="sw778-lchip${i === levels.length - 1 ? " now" : ""}">${t}</span>`).join(`<i class="sw778-arr">→</i>`)
    : `<em class="sw778-empty">—</em>`;

  const answerHtml = isDone
    ? `<div class="sw778-answer${view.answer === -1 ? " none" : ""}">
        <div class="hd"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${view.answer}</strong><span>${view.answer === -1 ? (vi ? "không tới được" : "unreachable") : (vi ? "chờ tới t này là đủ và ít nhất" : "waiting until this t is sufficient and minimal")}</span></div>
        ${view.path ? `<div class="pth">${view.path.map(([r, c, e]) => {
      const bn = view.bottleneck && view.bottleneck[0] === r && view.bottleneck[1] === c;
      return `<span class="${bn ? "bn" : ""}">(${r},${c})<i>${e}</i></span>`;
    }).join(`<b>→</b>`)}</div>` : ""}
        ${view.bottleneck ? `<em>${escapeHtml(vi
      ? `ô bottleneck (${view.bottleneck[0]},${view.bottleneck[1]}) là ô cao nhất trên đường — nó một mình quyết định đáp án`
      : `the bottleneck cell (${view.bottleneck[0]},${view.bottleneck[1]}) is the highest on the route — it alone sets the answer`)}</em>` : ""}
      </div>`
    : "";

  $("treeView").innerHTML = `<section class="sw778-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa bơi trong nước đang dâng" : "Swim in rising water visualization")}">
    <div class="sw778-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(vi
      ? "Chi phí của một đường là ĐỘ CAO LỚN NHẤT trên đường đó, không phải tổng — vì chỉ cần nước phủ được ô cao nhất là đi hết đường được. Nên khi bước sang ô kề: new_time = max(time, độ cao ô kề). Dãy time mà heap pop ra không giảm, chính là mực nước dâng dần."
      : "A route's cost is the LARGEST elevation on it, not the sum — once the water covers its highest cell the whole route is usable. So stepping to a neighbour: new_time = max(time, neighbour elevation). The times the heap pops are nondecreasing: that is the water rising.")}</span>
    </div>

    ${gauge}

    <div class="sw778-main">
      <section class="sw778-panel">
        <header>
          <strong>${vi ? `LƯỚI ${n}×${n} — số lớn = độ cao` : `GRID ${n}×${n} — the big number is elevation`}</strong>
          <span>${vi ? (compact ? "xanh = đã chìm" : "xanh = đã chìm · t = mực nước nhỏ nhất đủ để tới ô") : (compact ? "blue = submerged" : "blue = submerged · t = lowest level that reaches the cell")}</span>
        </header>
        <div class="sw778-grid" style="--sw-cols:${n}">${gridHtml}</div>
        <div class="sw778-legend">
          <span class="lg wet">${vi ? "đã chìm" : "submerged"}</span>
          <span class="lg dry">${vi ? "còn trên mặt nước" : "still above water"}</span>
          <span class="lg cur">${vi ? "đang chốt" : "settling"}</span>
          <span class="lg inheap">${vi ? "trong heap" : "in heap"}</span>
          <span class="lg path">${vi ? "đường kết quả" : "final route"}</span>
          <span class="lg bn">${vi ? "bottleneck" : "bottleneck"}</span>
        </div>
      </section>
      <aside class="sw778-side">
        ${curHtml}
        ${formulaHtml}
        ${countersHtml}
      </aside>
    </div>

    <section class="sw778-panel">
      <header><strong>${vi ? "MIN-HEAP (time, hàng, cột) — luôn lấy time nhỏ nhất" : "MIN-HEAP (time, row, col) — always pops the smallest time"}</strong><span>${heap.length}</span></header>
      <div class="sw778-heap">${heapHtml || `<em class="sw778-empty">${vi ? "heap rỗng" : "heap is empty"}</em>`}</div>
      <div class="sw778-hint">${escapeHtml(vi
      ? `Vì chi phí là max() và time pop ra không giảm, lần relax đầu tiên của một ô đã là giá trị cuối cùng — mỗi ô vào heap đúng 1 lần. Nên dòng "if time > best[r][c]" trong code không bao giờ chạy ở bài này (bộ đếm "bản cũ" luôn = 0); nó chỉ là thói quen viết Dijkstra an toàn.`
      : `Because the cost is a max() and popped times never decrease, a cell's first relaxation is already final — each cell enters the heap exactly once. So the line "if time > best[r][c]" never fires here (the "stale" counter stays 0); it is just standard defensive Dijkstra.`)}</div>
    </section>

    <section class="sw778-panel">
      <header><strong>${vi ? "MỰC NƯỚC ĐÃ DÂNG QUA — dãy time pop ra, không bao giờ giảm" : "WATER LEVELS SO FAR — the popped times, never decreasing"}</strong><span>${levels.length}</span></header>
      <div class="sw778-levels">${levelsHtml}</div>
    </section>

    ${answerHtml}

    <div class="sw778-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 1293 Shortest Path in a Grid with Obstacles Elimination ----
// The generic bfsGrid renderer could only put ONE number in a cell, which hides
// the whole difficulty: a cell is k+1 separate nodes. Here every cell lists the
// remaining-k states created on it, so "this cell entered the queue twice" is
// something you can see rather than something the prose has to claim.
function renderGridElim1293View(step) {
  const view = step.gridElim1293View || {};
  const vi = lang === "vi";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");

  if (view.error) {
    $("treeView").innerHTML = `<section class="ge1293-viz"><div class="ge1293-error">${escapeHtml(pick(view.error))}</div></section>`;
    return;
  }

  const rows = Number(view.rows) || 0;
  const cols = Number(view.cols) || 0;
  const k = Number(view.k) || 0;
  const cells = Array.isArray(view.cells) ? view.cells : [];
  const queue = Array.isArray(view.queue) ? view.queue : [];
  const layers = Array.isArray(view.layers) ? view.layers : [];
  const multiState = Array.isArray(view.multiState) ? view.multiState : [];
  const counters = view.counters || {};
  const cur = view.cur;
  const probe = view.probe;
  const isDone = view.answer !== null && view.answer !== undefined;

  // ── Grid ──────────────────────────────────────────────────────────────────
  const gridHtml = cells.map((row, r) => row.map((cell, c) => {
    const cls = ["ge1293-cell", cell.wall ? "wall" : "empty"];
    if (cell.processed) cls.push("processed");
    if (cell.inQueue) cls.push("queued");
    if (cell.rems.length > 1) cls.push("multi");
    if (cell.path) cls.push("path");
    if (cell.cur) cls.push("cur");
    if (cell.probe && cell.verdict) cls.push("probe", `v-${cell.verdict}`);
    const badge = cell.verdict === "enqueued" ? "✓"
      : cell.verdict === "dominated" ? "⊘"
        : cell.verdict === "noK" ? "✕" : "";
    const glyph = cell.role === "start" ? "S" : cell.role === "target" ? "T" : cell.wall ? "■" : "·";
    const ks = cell.rems.length
      ? `<div class="ks">${cell.rems.map((v) => `<i>${v}</i>`).join("")}</div>`
      : `<div class="ks empty">·</div>`;
    return `<div class="${cls.join(" ")}">
      <span class="rc">${r},${c}</span>
      <strong class="glyph">${glyph}</strong>
      <span class="d">${cell.dist === null || cell.dist === undefined ? "—" : `d${cell.dist}`}</span>
      ${ks}
      ${badge ? `<span class="vb">${badge}</span>` : ""}
    </div>`;
  }).join("")).join("");

  // ── Side: the state being expanded and the move being tested ──────────────
  const verdictText = {
    oob: vi ? "ra ngoài lưới" : "outside the grid",
    noK: vi ? "hết quyền phá" : "no eliminations left",
    dominated: vi ? "bị state cũ dominate" : "dominated by an older state",
    enqueued: vi ? "hợp lệ → vào queue" : "valid → enqueued",
  };
  const curHtml = cur
    ? `<div class="ge1293-state cur">
        <small>${vi ? "ĐANG MỞ RỘNG" : "EXPANDING"}</small>
        <strong>(${cur.r},${cur.c})</strong>
        <span>k=${cur.rem} · d=${cur.dist}</span>
      </div>`
    : `<div class="ge1293-state idle"><small>${vi ? "ĐANG MỞ RỘNG" : "EXPANDING"}</small><strong>—</strong></div>`;
  const probeHtml = probe
    ? `<div class="ge1293-state probe v-${probe.verdict}">
        <small>${vi ? "THỬ NƯỚC ĐI" : "TESTING MOVE"}</small>
        <strong>(${probe.r},${probe.c})</strong>
        <span>${escapeHtml(verdictText[probe.verdict] || "")}</span>
      </div>`
    : "";

  const countersHtml = `<div class="ge1293-counters">
    <span><b>${counters.popped || 0}</b>${vi ? "pop" : "popped"}</span>
    <span><b>${counters.enqueued || 0}</b>${vi ? "vào queue" : "enqueued"}</span>
    <span class="cut"><b>${counters.prunedDominated || 0}</b>${vi ? "bị dominate" : "dominated"}</span>
    <span class="cut"><b>${counters.prunedNoK || 0}</b>${vi ? "thiếu k" : "no k"}</span>
  </div>`;

  // ── Queue ─────────────────────────────────────────────────────────────────
  const QMAX = 26;
  const shown = queue.slice(0, QMAX);
  const queueHtml = shown.map((q) => `<div class="ge1293-qchip${q.head ? " head" : ""}">
      ${q.head ? `<em>${vi ? "đầu" : "head"}</em>` : ""}
      <strong>${q.r},${q.c}</strong><span>k=${q.rem}</span><span>d=${q.dist}</span>
    </div>`).join("") + (queue.length > QMAX ? `<div class="ge1293-qmore">+${queue.length - QMAX}</div>` : "");

  // ── BFS waves by distance ─────────────────────────────────────────────────
  const maxLayer = layers.reduce((m, l) => Math.max(m, l.count), 1);
  const layersHtml = layers.map((l) => `<div class="ge1293-layer">
      <span class="lbl">d=${l.d}</span>
      <span class="bar"><i style="width:${Math.max(6, Math.round((l.count / maxLayer) * 100))}%"></i></span>
      <span class="cnt">${l.count}</span>
    </div>`).join("");

  // ── The payoff panel: cells that hold more than one state ─────────────────
  const multiHtml = multiState.length
    ? multiState.map((e) => `<span class="ge1293-multi"><b>(${e.r},${e.c})</b>${e.rems.map((v) => `<i>k=${v}</i>`).join("")}</span>`).join("")
    : `<em class="ge1293-empty">${vi ? "chưa có ô nào cần tới 2 state — cứ chạy tiếp" : "no cell needs two states yet — keep stepping"}</em>`;

  const shortcutHtml = view.shortcut
    ? `<div class="ge1293-shortcut${view.shortcut.applies ? " applies" : ""}">
        <small>${vi ? "KIỂM TRA ĐƯỜNG THẲNG" : "STRAIGHT-ROUTE CHECK"}</small>
        <strong>k = ${k} ${view.shortcut.applies ? "≥" : "<"} m+n-3 = ${view.shortcut.limit}</strong>
        <span>${escapeHtml(view.shortcut.applies
      ? (vi ? `Đường Manhattan ${view.shortcut.manhattan} bước chỉ qua ${view.shortcut.limit} ô trung gian; k đủ phá hết nên trả ngay ${view.shortcut.manhattan}.`
        : `A Manhattan route of ${view.shortcut.manhattan} moves crosses only ${view.shortcut.limit} intermediate cells; k clears them all, so return ${view.shortcut.manhattan}.`)
      : (vi ? "k chưa đủ để bảo đảm đi thẳng, nên phải BFS."
        : "k is not enough to guarantee a straight route, so BFS is required."))}</span>
      </div>`
    : "";

  const answerHtml = isDone
    ? `<div class="ge1293-answer${view.answer === -1 ? " none" : ""}">
        <small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${view.answer}</strong>
        <span>${view.answer === -1 ? (vi ? "không có đường nào" : "no route exists") : (vi ? "bước" : "moves")}</span>
        ${view.eliminated && view.eliminated.length
      ? `<em>${vi ? "đã phá" : "eliminated"}: ${view.eliminated.map(([r, c]) => `(${r},${c})`).join(", ")}</em>`
      : ""}
      </div>`
    : "";

  $("treeView").innerHTML = `<section class="ge1293-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa đường ngắn nhất khi được phá vật cản" : "Shortest path with obstacle elimination visualization")}">
    <div class="ge1293-idea">
      <small>${vi ? "Ý CHÍNH" : "THE KEY IDEA"}</small>
      <span>${escapeHtml(vi
      ? `Một ô KHÔNG phải một node. Đứng ở cùng ô mà còn 2 quyền phá khác hẳn còn 0 quyền, nên state là (hàng, cột, k còn lại) — mỗi ô có tới ${k + 1} state. Đánh dấu visited chỉ theo (hàng, cột) là sai.`
      : `A cell is NOT a node. Being on the same cell with 2 eliminations left differs from having 0, so a state is (row, col, k remaining) — up to ${k + 1} states per cell. Marking visited by (row, col) alone is wrong.`)}</span>
    </div>

    <div class="ge1293-main">
      <section class="ge1293-panel">
        <header>
          <strong>${vi ? `LƯỚI ${rows}×${cols}` : `GRID ${rows}×${cols}`}</strong>
          <span>${vi ? "d = số bước tới ô · ô vuông nhỏ = k còn lại của từng state" : "d = moves to reach · small squares = each state's remaining k"}</span>
        </header>
        <div class="ge1293-grid" style="--ge-cols:${cols}">${gridHtml}</div>
        <div class="ge1293-legend">
          <span class="lg s">S / T</span>
          <span class="lg wall">■ ${vi ? "vật cản" : "obstacle"}</span>
          <span class="lg cur">${vi ? "đang mở rộng" : "expanding"}</span>
          <span class="lg queued">${vi ? "trong queue" : "in queue"}</span>
          <span class="lg multi">${vi ? "≥2 state" : "≥2 states"}</span>
          <span class="lg path">${vi ? "đường kết quả" : "final route"}</span>
        </div>
      </section>
      <aside class="ge1293-side">
        ${curHtml}
        ${probeHtml}
        ${countersHtml}
        ${shortcutHtml}
      </aside>
    </div>

    <section class="ge1293-panel">
      <header><strong>${vi ? "QUEUE (FIFO) — lấy ra theo distance không giảm" : "QUEUE (FIFO) — popped in nondecreasing distance"}</strong><span>${queue.length}</span></header>
      <div class="ge1293-queue">${queueHtml || `<em class="ge1293-empty">${vi ? "queue rỗng" : "queue is empty"}</em>`}</div>
    </section>

    <div class="ge1293-cols2">
      <section class="ge1293-panel">
        <header><strong>${vi ? "SÓNG BFS — số state ở mỗi distance" : "BFS WAVES — states per distance"}</strong></header>
        <div class="ge1293-layers">${layersHtml || `<em class="ge1293-empty">—</em>`}</div>
      </section>
      <section class="ge1293-panel">
        <header><strong>${vi ? "Ô CÓ NHIỀU HƠN MỘT STATE" : "CELLS HOLDING MORE THAN ONE STATE"}</strong><span>${multiState.length}</span></header>
        <div class="ge1293-multis">${multiHtml}</div>
      </section>
    </div>

    ${answerHtml}

    <div class="ge1293-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 1627 Graph Connectivity With Threshold (divisor sieve + DSU) ----
// The point of this layout is that the three things a reader needs are on
// screen at once and lined up: the numbers 1..n coloured by group, the sieve
// ladder that says where each edge came from, and the resulting groups that
// answer the queries. No node-link diagram — for n = 24 that is a hairball and
// the divisor structure is invisible in it.
function renderGcThreshold1627View(step) {
  const view = step.gcThreshold1627View || {};
  const vi = lang === "vi";
  const n = Number(view.n) || 0;
  const threshold = Number(view.threshold) || 0;
  const phase = view.phase || "";
  const ladder = Array.isArray(view.ladder) ? view.ladder : [];
  const noLeader = Array.isArray(view.noLeader) ? view.noLeader : [];
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const groups = Array.isArray(view.groups) ? view.groups : [];
  const queries = Array.isArray(view.queries) ? view.queries : [];
  const curZ = view.curZ;
  const curMultiple = view.curMultiple;
  const marked = new Set(Array.isArray(view.marked) ? view.marked : []);
  const isDone = phase === "done";
  const pick = (d) => (!d ? "" : typeof d === "string" ? d : (vi ? d.vi : d.en) || "");

  // ── Phase bar. The "skip" phase only exists when threshold actually removes
  // rows, so it is dropped from the bar entirely when threshold = 0.
  const hasSkip = ladder.some((r) => r.status === "skipped");
  const labels = [];
  const stageKey = {};
  const add = (key, label) => { stageKey[key] = labels.length; labels.push(label); };
  add("init", vi ? "Mỗi số một nhóm" : "Every number alone");
  if (hasSkip) add("skip", vi ? `Bỏ z ≤ ${threshold}` : `Drop z ≤ ${threshold}`);
  add("sieve", vi ? "Sàng: nối z với bội số" : "Sieve: link z to multiples");
  add("query", vi ? "Trả lời truy vấn" : "Answer queries");
  const stageOf = {
    intro: stageKey.init, init: stageKey.init,
    skip: hasSkip ? stageKey.skip : stageKey.sieve,
    sieve: stageKey.sieve, union: stageKey.sieve, noLeader: stageKey.sieve,
    query: stageKey.query, done: labels.length,
  };
  const stage = stageOf[phase] === undefined ? 0 : stageOf[phase];
  const phaseHtml = labels.map((label, k) => {
    const cls = k < stage ? "done" : k === stage ? "active" : "";
    return `<span class="${cls}">${k < stage ? "✓" : k + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // ── The numbers 1..n, coloured by group ────────────────────────────────────
  const numsHtml = nodes.map((nd) => {
    const cls = ["gc1627-num"];
    if (nd.color >= 0) cls.push(`c${nd.color}`);
    else cls.push("alone");
    if (nd.id === curZ) cls.push("cur-z");
    if (nd.id === curMultiple) cls.push("cur-m");
    else if (marked.has(nd.id)) cls.push("marked");
    // While a sieve row is open, spell out the divisibility that creates the
    // edge: 12 under z=4 shows "3×" so the reason is on the chip itself.
    let sub = "";
    if (curZ && nd.id !== curZ && nd.id % curZ === 0) sub = `${nd.id / curZ}×`;
    else if (phase === "query" || isDone) sub = `R${nd.root}`;
    return `<div class="${cls.join(" ")}"><strong>${nd.id}</strong>${sub ? `<small>${escapeHtml(sub)}</small>` : ""}</div>`;
  }).join("");

  // ── Sieve ladder ──────────────────────────────────────────────────────────
  const ladderHtml = ladder.map((row) => {
    const mults = row.multiples.map((m) => {
      const st = row.status === "skipped" ? "skip"
        : m === curMultiple && row.status === "current" ? "cur"
          : row.outcome[m] || "pending";
      return `<span class="m ${st}">${m}</span>`;
    }).join("");
    const tag = row.status === "skipped"
      ? `<em class="gc1627-tag skip">${vi ? `z ≤ ${threshold} → bỏ` : `z ≤ ${threshold} → dropped`}</em>`
      : row.status === "done"
        ? `<em class="gc1627-tag done">✓</em>`
        : row.status === "current" ? `<em class="gc1627-tag cur">${vi ? "đang xét" : "running"}</em>` : "";
    return `<div class="gc1627-row ${row.status}">
      <span class="gc1627-z">z=${row.z}</span>
      <span class="gc1627-arr">→</span>
      <div class="gc1627-mults">${mults}</div>
      ${tag}
    </div>`;
  }).join("");

  // ── Groups ────────────────────────────────────────────────────────────────
  const multi = groups.filter((g) => g.members.length > 1);
  const singles = groups.filter((g) => g.members.length === 1).map((g) => g.key);
  const groupsHtml = multi.map((g) => `<div class="gc1627-group c${g.color}">
      <small>${vi ? "nhóm" : "group"} · ${g.members.length}</small>
      <div>${g.members.map((m) => `<span>${m}</span>`).join("")}</div>
    </div>`).join("") + (singles.length
      ? `<div class="gc1627-group alone">
          <small>${vi ? "còn một mình" : "still alone"} · ${singles.length}</small>
          <div>${singles.map((m) => `<span>${m}</span>`).join("")}</div>
        </div>`
      : "");

  // ── Queries ───────────────────────────────────────────────────────────────
  const queriesHtml = queries.map((q, i) => {
    const cls = ["gc1627-q"];
    if (q.status === "current") cls.push("current");
    else if (q.status === "done") cls.push("done");
    const roots = q.ra === null || q.ra === undefined
      ? `<span class="gc1627-roots">${vi ? "chưa xét" : "not yet"}</span>`
      : `<span class="gc1627-roots">R${q.ra} ${q.result ? "=" : "≠"} R${q.rb}</span>`;
    const res = q.result === null || q.result === undefined
      ? `<b class="pending">?</b>`
      : `<b class="${q.result ? "yes" : "no"}">${q.result}</b>`;
    return `<div class="${cls.join(" ")}"><small>${i + 1}</small><strong>${q.a} ↔ ${q.b}</strong>${roots}${res}</div>`;
  }).join("");

  const isolatedHtml = view.isolated && view.isolated.length
    ? `<div class="gc1627-isolated">
        <small>${vi ? "VÌ SAO CÁC SỐ NÀY ĐỨNG MỘT MÌNH" : "WHY THESE NUMBERS STAY ALONE"}</small>
        ${view.isolated.map((it) => {
      const why = [];
      if (it.maxDiv) why.push(vi ? `ước thật sự lớn nhất = ${it.maxDiv} ≤ ${threshold}` : `largest proper divisor = ${it.maxDiv} ≤ ${threshold}`);
      else why.push(vi ? "không có ước thật sự nào" : "no proper divisor at all");
      if (it.twiceOverN) why.push(vi ? `và 2×${it.id} > ${n} nên cũng không dẫn được nhóm nào` : `and 2×${it.id} > ${n} so it cannot lead a group either`);
      return `<span><b>${it.id}</b> ${escapeHtml(why.join(" "))}</span>`;
    }).join("")}
      </div>`
    : "";

  $("treeView").innerHTML = `<section class="gc1627-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa liên thông theo ngưỡng" : "Graph connectivity with threshold visualization")}">
    <div class="gc1627-phases">${phaseHtml}</div>

    <div class="gc1627-main">
      <section class="gc1627-panel">
        <header>
          <strong>${vi ? `CÁC SỐ 1..${n}` : `THE NUMBERS 1..${n}`}</strong>
          <span>${vi ? "cùng màu = cùng nhóm liên thông · xám = một mình" : "same colour = same group · grey = alone"}</span>
        </header>
        <div class="gc1627-nums">${numsHtml}</div>
        ${curZ ? `<div class="gc1627-hint">${escapeHtml(vi
      ? `Đang mở hàng z = ${curZ}. Số nào có nhãn ×k là bội của ${curZ} → chia hết cho ${curZ} > ${threshold} → phải cùng nhóm với ${curZ}.`
      : `Row z = ${curZ} is open. Chips tagged ×k are multiples of ${curZ} → divisible by ${curZ} > ${threshold} → must join ${curZ}'s group.`)}</div>` : ""}
      </section>
      <aside class="gc1627-side">
        <header><strong>${vi ? "NHÓM LIÊN THÔNG" : "CONNECTED GROUPS"}</strong><span>${multi.length + singles.length}</span></header>
        <div class="gc1627-groups">${groupsHtml}</div>
      </aside>
    </div>

    <section class="gc1627-panel">
      <header>
        <strong>${vi ? "SÀNG ƯỚC SỐ — mỗi hàng z nối z với mọi bội của z" : "DIVISOR SIEVE — each row z links z to every multiple of z"}</strong>
        <span>${vi ? `z chạy ${threshold + 1}..${n}` : `z runs ${threshold + 1}..${n}`}</span>
      </header>
      <div class="gc1627-ladder">${ladderHtml || `<em class="gc1627-empty">${vi ? "không có hàng z nào" : "no z rows"}</em>`}</div>
      ${noLeader.length ? `<div class="gc1627-noleader"><b>z = ${noLeader.join(", ")}</b> ${escapeHtml(vi
      ? `: 2z > ${n} nên không có bội số nào ≤ ${n} → không tạo cạnh. Sàng chỉ cần chạy tới ${Math.floor(n / 2)}.`
      : `: 2z > ${n} so there is no multiple ≤ ${n} → no edge. The sieve only needs to reach ${Math.floor(n / 2)}.`)}</div>` : ""}
      <div class="gc1627-legend">
        <span class="lg merged">${vi ? "gộp 2 nhóm" : "merged two groups"}</span>
        <span class="lg already">${vi ? "đã cùng nhóm (cạnh dư)" : "already together (redundant)"}</span>
        <span class="lg pending">${vi ? "chưa xét" : "not yet"}</span>
        <span class="lg skip">${vi ? "bị threshold loại" : "dropped by threshold"}</span>
      </div>
    </section>

    <section class="gc1627-panel">
      <header><strong>${vi ? "TRUY VẤN — chỉ là so sánh root" : "QUERIES — just a root comparison"}</strong><span>${queries.length}</span></header>
      <div class="gc1627-queries">${queriesHtml || `<em class="gc1627-empty">${vi ? "không có truy vấn" : "no queries"}</em>`}</div>
      ${view.answer ? `<div class="gc1627-answer">answer = [${view.answer.join(", ")}]</div>` : ""}
    </section>

    ${isolatedHtml}

    <div class="gc1627-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(pick(view.decision))}</strong>
    </div>
  </section>`;
}

// ---- 539 Minimum Time Difference (circular clock) ----
function renderClockDiffView(step) {
  const view = step.clockDiffView || {};
  const vi = lang === "vi";
  const entries = Array.isArray(view.entries) ? view.entries : [];
  const checked = Array.isArray(view.checked) ? view.checked : [];
  const cur = view.currentPair || null;
  const bestPair = view.bestPair || null;
  const best = view.best;
  const phase = view.phase || "";
  const parseIndex = Number.isInteger(view.parseIndex) ? view.parseIndex : -1;
  const sorted = !!view.sorted;
  const DAY = 1440;

  const fmt = (v) => `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;

  // ── Phase bar ───────────────────────────────────────────────────────────
  const stageOf = { intro: 0, parse: 0, sort: 1, wrap: 2, scan: 2, done: 3 };
  const stage = stageOf[phase] === undefined ? 0 : stageOf[phase];
  const labels = vi
    ? ["Đổi sang phút", "Sort", "Xét cặp liền kề + cặp vòng", "Kết quả"]
    : ["Convert to minutes", "Sort", "Adjacent + wrap pairs", "Result"];
  const phases = labels.map((label, k) => {
    const cls = k < stage ? "done" : k === stage ? "active" : "";
    return `<span class="${cls}">${k < stage ? "✓" : k + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // ── Clock face ──────────────────────────────────────────────────────────
  // Layout rule: hour numbers live INSIDE the ring, time-point labels OUTSIDE.
  // That keeps the two label families from ever competing for the same space
  // (they used to overlap near the top, along with the "midnight" annotation).
  // SZ is sized so the label ring plus its text always fits:
  //   C >= R + LABEL_LIFT + textWidth + pad
  const SZ = 372;
  const C = SZ / 2;
  const R = 118;
  const pt = (mins, radius) => {
    const th = (mins / DAY) * Math.PI * 2;           // 0 at top, clockwise
    return { x: C + radius * Math.sin(th), y: C - radius * Math.cos(th) };
  };
  const ptDeg = (deg, radius) => pt((deg / 360) * DAY, radius);
  const arcPath = (fromMin, spanMin, radius) => {
    const a = pt(fromMin, radius);
    const b = pt((fromMin + spanMin) % DAY, radius);
    const large = spanMin > DAY / 2 ? 1 : 0;
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  };

  // hour ticks + hour numbers placed INSIDE the ring
  let ticks = "";
  for (let h = 0; h < 24; h++) {
    const major = h % 6 === 0;
    const outer = pt(h * 60, R);
    const inner = pt(h * 60, R - (major ? 12 : 6));
    ticks += `<line class="cl539-tick${major ? " major" : ""}${h === 0 ? " midnight" : ""}" x1="${inner.x.toFixed(2)}" y1="${inner.y.toFixed(2)}" x2="${outer.x.toFixed(2)}" y2="${outer.y.toFixed(2)}"></line>`;
    if (major) {
      const lp = pt(h * 60, R - 28);
      ticks += `<text class="cl539-hour${h === 0 ? " midnight" : ""}" x="${lp.x.toFixed(2)}" y="${lp.y.toFixed(2)}">${String(h).padStart(2, "0")}</text>`;
    }
  }

  // gap arcs: the best one, plus the pair currently being measured
  let arcs = "";
  if (bestPair) {
    const span = bestPair.wrap ? DAY - bestPair.a + bestPair.b : bestPair.b - bestPair.a;
    arcs += `<path class="cl539-arc best" d="${arcPath(bestPair.a, span, R)}"></path>`;
  }
  if (cur) {
    const span = cur.wrap ? DAY - cur.a + cur.b : cur.b - cur.a;
    arcs += `<path class="cl539-arc current${cur.wrap ? " wrap" : ""}" d="${arcPath(cur.a, span, R)}"></path>`;
  }

  // time dots, with labels OUTSIDE the ring.
  //
  // Only the dots taking part in the current / best pair get a text label, so at
  // most four labels ever appear. Times can cluster arbitrarily tightly (five
  // inside ten minutes is legal input), so labelling every dot cannot be made
  // readable — the sorted strip underneath is where all the values are read.
  // The clock's job is to show circularity and the pair being measured.
  //
  // The labels all sit on ONE ring outside the dial and are spread apart
  // ANGULARLY, with leader lines tying each back to its dot. Spreading sideways
  // rather than stacking outward is what makes the no-overlap guarantee
  // possible: MIN_GAP degrees at LABEL_R is wider than the widest label box, and
  // four labels only ever need 48° of the 360° available.
  const curSet = new Set(cur ? [cur.a, cur.b] : []);
  const bestSet = new Set(bestPair ? [bestPair.a, bestPair.b] : []);
  const LABEL_R = R + 26;
  const MIN_GAP = 16;
  const seenMinute = new Set();
  const labelled = [];
  entries.forEach((e, idx) => {
    if (!curSet.has(e.minutes) && !bestSet.has(e.minutes)) return;
    if (seenMinute.has(e.minutes)) return;          // duplicates share one label
    seenMinute.add(e.minutes);
    labelled.push({ idx, deg: (e.minutes / DAY) * 360 });
  });
  const placedDeg = new Map();
  if (labelled.length) {
    const n = labelled.length;
    const order = labelled.slice().sort((a, b) => a.deg - b.deg);
    // Cut the circle at the widest empty arc so the run can be straightened out
    // without the first and last label colliding across the seam.
    let cut = 0;
    let widest = -1;
    for (let k = 0; k < n; k++) {
      const gap = (order[(k + 1) % n].deg - order[k].deg + 360) % 360;
      if (gap > widest) { widest = gap; cut = (k + 1) % n; }
    }
    const seq = [];
    for (let k = 0; k < n; k++) {
      const o = order[(cut + k) % n];
      let d = o.deg;
      if (k > 0) while (d < seq[k - 1].d) d += 360;
      seq.push({ d, orig: d, idx: o.idx });
    }
    for (let k = 1; k < n; k++) {
      if (seq[k].d - seq[k - 1].d < MIN_GAP) seq[k].d = seq[k - 1].d + MIN_GAP;
    }
    // Slide the whole run back so the spread stays centred on its dots instead
    // of always drifting clockwise.
    const shift = seq.reduce((s, o) => s + (o.d - o.orig), 0) / n;
    seq.forEach((o) => placedDeg.set(o.idx, ((o.d - shift) % 360 + 360) % 360));
  }

  const dots = entries.map((e, idx) => {
    const p = pt(e.minutes, R);
    const isCur = curSet.has(e.minutes);
    const isBest = !isCur && bestSet.has(e.minutes);
    const cls = ["cl539-dot"];
    if (isCur) cls.push("current");
    else if (isBest) cls.push("best");
    if (!sorted && idx === parseIndex) cls.push("parsing");

    let labelSvg = "";
    if (placedDeg.has(idx)) {
      const deg = placedDeg.get(idx);
      const lp = ptDeg(deg, LABEL_R);
      const stemTo = ptDeg(deg, LABEL_R - 11);
      const stemFrom = pt(e.minutes, R + 3);
      const sinv = Math.sin((deg / 360) * Math.PI * 2);
      const anchor = Math.abs(sinv) < 0.3 ? "middle" : (sinv > 0 ? "start" : "end");
      labelSvg = `<line class="cl539-stem" x1="${stemFrom.x.toFixed(2)}" y1="${stemFrom.y.toFixed(2)}" x2="${stemTo.x.toFixed(2)}" y2="${stemTo.y.toFixed(2)}"></line>
        <text x="${lp.x.toFixed(2)}" y="${lp.y.toFixed(2)}" text-anchor="${anchor}">${escapeHtml(e.time)}</text>`;
    }
    return `<g class="${cls.join(" ")}">${labelSvg}<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${isCur || isBest ? 7 : 5}"></circle></g>`;
  }).join("");

  // Midnight is marked by the pink 00 tick/number inside the ring plus this
  // short seam on the ring itself — no floating text to collide with anything.
  const midnightMark = `<line class="cl539-seam" x1="${C}" y1="${(C - R - 9).toFixed(2)}" x2="${C}" y2="${(C - R + 9).toFixed(2)}"></line>`;

  const clockSvg = `<svg class="cl539-clock" viewBox="0 0 ${SZ} ${SZ}" role="img" aria-label="${escapeHtml(vi ? "Mặt đồng hồ 24 giờ với các mốc thời gian" : "24-hour clock face with the time points")}">
    <circle class="cl539-face" cx="${C}" cy="${C}" r="${R}"></circle>
    ${ticks}${midnightMark}${arcs}${dots}
  </svg>`;

  // ── Sorted strip with gaps between neighbours ───────────────────────────
  let strip = "";
  if (entries.length) {
    strip = entries.map((e, idx) => {
      const isCur = cur && !cur.wrap && (idx === cur.aIdx || idx === cur.bIdx);
      const isBest = bestPair && !bestPair.wrap && (idx === bestPair.aIdx || idx === bestPair.bIdx);
      const cls = ["cl539-chip"];
      if (isCur) cls.push("current");
      else if (isBest) cls.push("best");
      if (!sorted && idx === parseIndex) cls.push("parsing");
      let gapHtml = "";
      if (idx > 0 && sorted) {
        const g = e.minutes - entries[idx - 1].minutes;
        const done = checked.some((c) => !c.wrap && c.bIdx === idx);
        const isG = cur && !cur.wrap && cur.bIdx === idx;
        const isBg = bestPair && !bestPair.wrap && bestPair.bIdx === idx;
        gapHtml = `<span class="cl539-gap${isG ? " current" : isBg ? " best" : done ? " done" : ""}">${done || isG ? g : "?"}</span>`;
      }
      return gapHtml + `<div class="${cls.join(" ")}"><strong>${escapeHtml(e.time)}</strong><small>${e.minutes}</small></div>`;
    }).join("");
  }

  // ── Wrap-pair callout ───────────────────────────────────────────────────
  let wrapHtml = "";
  if (sorted && entries.length >= 2) {
    const a = entries[entries.length - 1];
    const b = entries[0];
    const wd = DAY - a.minutes + b.minutes;
    const isCur = cur && cur.wrap;
    const isBest = bestPair && bestPair.wrap;
    wrapHtml = `<section class="cl539-wrap ${isCur ? "current" : isBest ? "best" : ""}">
      <small>${vi ? "CẶP VÒNG QUA NỬA ĐÊM" : "WRAP-AROUND PAIR"}</small>
      <strong>${escapeHtml(a.time)} → ${escapeHtml(b.time)}</strong>
      <code>1440 − ${a.minutes} + ${b.minutes} = ${wd}</code>
      <em>${isBest ? (vi ? "✓ đang là khoảng nhỏ nhất" : "✓ currently the smallest gap") : (vi ? "dễ bị bỏ sót nhất" : "the easiest pair to forget")}</em>
    </section>`;
  }

  // ── Decision copy ───────────────────────────────────────────────────────
  const decisionText = {
    intro: vi ? "Đồng hồ vòng tròn: khoảng cách phải tính cả chiều qua nửa đêm." : "The clock is circular: distances must also be measured through midnight.",
    parse: vi ? "h×60 + m cho số phút kể từ nửa đêm (0..1439)." : "h×60 + m gives minutes since midnight (0..1439).",
    sort: vi ? "Sau khi sort, cặp gần nhau nhất phải là hai mốc liền kề — hoặc cặp vòng." : "After sorting, the closest pair must be neighbours — or the wrap pair.",
    wrap: vi ? "Khởi tạo best bằng cặp vòng qua nửa đêm, không phải bằng vô cực." : "Seed best with the wrap-around pair, not with infinity.",
    improve: vi ? "Khoảng này nhỏ hơn best → cập nhật." : "This gap beats best → update it.",
    keep: vi ? "Khoảng này không nhỏ hơn best → giữ nguyên." : "This gap does not beat best → keep it.",
    duplicate: vi ? "Hai mốc trùng nhau → khoảng 0, đã là nhỏ nhất có thể." : "Two identical times → a gap of 0, the minimum possible.",
    pigeonhole: vi ? "Hơn 1440 mốc thì chắc chắn trùng → trả 0 ngay." : "More than 1440 times guarantees a duplicate → return 0 at once.",
    done: vi ? "Đã xét mọi cặp liền kề và cặp vòng." : "Every adjacent pair plus the wrap pair has been checked.",
  }[view.decision] || (vi ? "Đang xử lý." : "Processing.");

  const isDone = phase === "done";
  const dup = view.duplicate;

  $("treeView").innerHTML = `<section class="cl539-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa hiệu thời gian nhỏ nhất" : "Minimum time difference visualization")}">
    <div class="cl539-phases">${phases}</div>

    <div class="cl539-main">
      <section class="cl539-panel">
        <header><strong>${vi ? "MẶT ĐỒNG HỒ 24H" : "24-HOUR CLOCK"}</strong><span>${vi ? "cung vàng = đang đo · xanh = nhỏ nhất" : "amber arc = measuring · green = smallest"}</span></header>
        ${clockSvg}
        <div class="cl539-clock-legend">
          <span class="seam">${vi ? "vạch hồng ở 00 = mốc nửa đêm (chỗ vòng lại)" : "pink 00 mark = midnight, where the clock wraps"}</span>
          <span>${vi ? "số giờ ở trong · chỉ cặp đang xét / tốt nhất mới ghi nhãn ở ngoài" : "hours inside · only the current / best pair is labelled outside"}</span>
        </div>
      </section>
      <aside class="cl539-side">
        <section class="cl539-best ${isDone ? "done" : ""}">
          <small>${vi ? "KHOẢNG NHỎ NHẤT" : "SMALLEST GAP"}</small>
          <strong>${best === null || best === undefined ? "—" : best}</strong>
          <em>${vi ? "phút" : "minutes"}</em>
          ${bestPair ? `<span>${escapeHtml(fmt(bestPair.a))} → ${escapeHtml(fmt(bestPair.b))}${bestPair.wrap ? (vi ? " (qua nửa đêm)" : " (via midnight)") : ""}</span>` : ""}
        </section>
        ${wrapHtml}
      </aside>
    </div>

    <section class="cl539-panel">
      <header><strong>${sorted ? (vi ? "ĐÃ SORT · khoảng cách giữa các mốc liền kề" : "SORTED · gaps between neighbours") : (vi ? "ĐANG ĐỔI SANG PHÚT" : "CONVERTING TO MINUTES")}</strong><span>${entries.length} ${vi ? "mốc" : "times"}</span></header>
      <div class="cl539-strip">${strip || `<em class="cl539-empty">${vi ? "chưa có mốc nào" : "no times yet"}</em>`}</div>
    </section>

    ${dup ? `<div class="cl539-dup">${vi ? `Trùng nhau: ${escapeHtml(dup.a)} và ${escapeHtml(dup.b)} → 0 phút` : `Duplicate: ${escapeHtml(dup.a)} and ${escapeHtml(dup.b)} → 0 minutes`}</div>` : ""}

    <div class="cl539-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(decisionText)}</strong>
      <div>${cur ? `<span>${escapeHtml(fmt(cur.a))} → ${escapeHtml(fmt(cur.b))} = ${cur.diff}</span>` : ""}<span>best = ${best === null || best === undefined ? "—" : best}</span></div>
    </div>
  </section>`;
}

// ---- 777 Swap Adjacent in LR String (two-pointer invariant) ----
function renderLrSwapView(step) {
  const view = step.lrSwapView || {};
  const vi = lang === "vi";
  const start = String(view.start || "");
  const end = String(view.end || "");
  const n = Number(view.n) || start.length;
  const i = Number.isInteger(view.i) ? view.i : -1;
  const j = Number.isInteger(view.j) ? view.j : -1;
  const phase = view.phase || "";
  const pairs = Array.isArray(view.pairs) ? view.pairs : [];
  const verdict = view.verdict;
  const skipping = view.skipping;

  // ── Phase bar ───────────────────────────────────────────────────────────
  const stageOf = { intro: 0, skip: 1, compare: 1, constraint: 2, advance: 1, done: 3 };
  const stage = stageOf[phase] === undefined ? 0 : stageOf[phase];
  const labels = vi
    ? ["Ý tưởng bất biến", "Bỏ qua X · so chữ", "Kiểm tra hướng đi", "Kết luận"]
    : ["Invariant idea", "Skip X · match letters", "Direction check", "Verdict"];
  const phases = labels.map((label, k) => {
    const cls = k < stage ? "done" : k === stage ? "active" : "";
    return `<span class="${cls}">${k < stage ? "✓" : k + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // ── Character rows, index-aligned so the shift is visible ───────────────
  const matchedI = new Set(pairs.map((p) => p.i));
  const matchedJ = new Set(pairs.map((p) => p.j));
  const cellsFor = (s, ptr, matched, which) => s.split("").map((ch, k) => {
    const cls = ["lr777-cell", ch === "X" ? "x" : ch === "L" ? "l" : "r"];
    if (k === ptr) cls.push("cursor");
    if (matched.has(k)) cls.push("matched");
    if (k < ptr && ch !== "X" && !matched.has(k)) cls.push("passed");
    if (skipping === which && k === ptr) cls.push("skipping");
    return `<div class="${cls.join(" ")}"><small>${k}</small><strong>${ch}</strong></div>`;
  }).join("");

  const ptrRow = (ptr, label, cls) => Array.from({ length: n }, (_, k) =>
    `<div class="lr777-ptr ${k === ptr ? cls : ""}">${k === ptr ? label : ""}</div>`).join("");

  // ── Current letter + constraint ─────────────────────────────────────────
  let constraintHtml = "";
  if (i >= 0 && i < n && j >= 0 && j < n && (phase === "compare" || phase === "constraint")) {
    const a = start[i];
    const b = end[j];
    if (a === b && a !== "X") {
      const isL = a === "L";
      const ok = isL ? i >= j : i <= j;
      const need = isL ? `i ≥ j  (${i} ≥ ${j})` : `i ≤ j  (${i} ≤ ${j})`;
      const dist = isL ? i - j : j - i;
      const dirWord = isL ? (vi ? "TRÁI" : "LEFT") : (vi ? "PHẢI" : "RIGHT");
      const arrow = isL ? "←" : "→";
      constraintHtml = `<section class="lr777-constraint ${ok ? "ok" : "bad"}">
        <div class="lr777-letter ${isL ? "l" : "r"}">${a}</div>
        <div class="lr777-rule">
          <small>${isL ? (vi ? "L chỉ trượt sang TRÁI" : "an L may only slide LEFT") : (vi ? "R chỉ trượt sang PHẢI" : "an R may only slide RIGHT")}</small>
          <strong>${escapeHtml(need)} → ${ok ? "OK" : (vi ? "VI PHẠM" : "VIOLATED")}</strong>
          <em>${ok
            ? (dist === 0 ? (vi ? "ở đúng chỗ, không cần dịch" : "already in place, no shift needed") : `${arrow} ${vi ? `dịch ${dist} bước sang ${dirWord.toLowerCase()}` : `shifts ${dist} step(s) ${dirWord.toLowerCase()}`}`)
            : (vi ? `cần đi sang ${isL ? "phải" : "trái"} ${Math.abs(dist)} bước — không được phép` : `would need ${Math.abs(dist)} step(s) ${isL ? "right" : "left"} — not allowed`)}</em>
        </div>
      </section>`;
    } else if (a !== b) {
      constraintHtml = `<section class="lr777-constraint bad">
        <div class="lr777-letter mismatch">≠</div>
        <div class="lr777-rule">
          <small>${vi ? "DÃY L/R KHÔNG KHỚP" : "L/R SEQUENCE MISMATCH"}</small>
          <strong>start[${i}] = '${a}'  ≠  end[${j}] = '${b}'</strong>
          <em>${vi ? "L và R không bao giờ vượt qua nhau, nên thứ tự phải giống hệt." : "L and R can never cross, so the order must be identical."}</em>
        </div>
      </section>`;
    }
  }

  // ── Stripped sequences (the first invariant) ─────────────────────────────
  const sc = String(view.startClean || "");
  const ec = String(view.endClean || "");
  const cleanMatch = sc === ec;
  const cleanHtml = `<section class="lr777-clean ${cleanMatch ? "ok" : "bad"}">
    <div><small>start ${vi ? "bỏ X" : "without X"}</small><code>${escapeHtml(sc || "∅")}</code></div>
    <b>${cleanMatch ? "=" : "≠"}</b>
    <div><small>end ${vi ? "bỏ X" : "without X"}</small><code>${escapeHtml(ec || "∅")}</code></div>
  </section>`;

  // ── Matched pairs ───────────────────────────────────────────────────────
  const pairsHtml = pairs.length
    ? pairs.map((p) => {
      const arrow = p.shift === 0 ? "·" : (p.ch === "L" ? "←" : "→");
      return `<span class="lr777-pair ${p.ch === "L" ? "l" : "r"}"><b>${p.ch}</b><small>${p.i}${arrow}${p.j}</small></span>`;
    }).join("")
    : `<em class="lr777-empty">${vi ? "chưa khớp chữ nào" : "no letters matched yet"}</em>`;

  // ── Decision copy ───────────────────────────────────────────────────────
  const decisionText = {
    intro: vi ? "XL→LX cho L đi sang trái; RX→XR cho R đi sang phải. Không phép nào đổi thứ tự L/R." : "XL→LX moves an L left; RX→XR moves an R right. Neither changes the L/R order.",
    "skip-start": vi ? "X chỉ là ô trống — bỏ qua trong start." : "X is only empty space — skip it in start.",
    "skip-end": vi ? "X chỉ là ô trống — bỏ qua trong end." : "X is only empty space — skip it in end.",
    "letters-match": vi ? "Hai chữ giống nhau → kiểm tra tiếp hướng di chuyển." : "The letters match → now check the direction.",
    "letter-mismatch": vi ? "Hai chữ khác nhau → dãy L/R khác nhau → bất khả thi." : "The letters differ → different L/R sequences → impossible.",
    "L-ok": vi ? "L nằm bên phải đích, trượt sang trái là hợp lệ." : "The L sits right of its target, so sliding left is legal.",
    "L-bad": vi ? "L phải đi sang phải mới tới đích — không được phép." : "This L would need to move right to reach its target — not allowed.",
    "R-ok": vi ? "R nằm bên trái đích, trượt sang phải là hợp lệ." : "The R sits left of its target, so sliding right is legal.",
    "R-bad": vi ? "R phải đi sang trái mới tới đích — không được phép." : "This R would need to move left to reach its target — not allowed.",
    advance: vi ? "Cặp chữ này hợp lệ, sang cặp tiếp theo." : "This pair is valid; advance to the next.",
    "count-mismatch": vi ? "Một bên còn chữ, bên kia đã hết → số lượng L/R khác nhau." : "One side still has letters while the other ran out → different letter counts.",
    "done-true": vi ? "Mọi chữ khớp và đi đúng hướng → biến đổi được." : "Every letter matches and travels legally → the transformation exists.",
    "done-false": vi ? "Có điều kiện bị vi phạm → không biến đổi được." : "A condition was violated → no transformation exists.",
  }[view.decision] || (vi ? "Đang xử lý." : "Processing.");

  const isDone = phase === "done";
  const verdictCls = verdict === true ? "true" : verdict === false ? "false" : "";
  const verdictLabel = verdict === null || verdict === undefined
    ? (vi ? "chưa kết luận" : "no verdict yet")
    : String(verdict);

  $("treeView").innerHTML = `<section class="lr777-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa đổi chỗ liền kề LR" : "Swap adjacent in LR string visualization")}">
    <div class="lr777-phases">${phases}</div>
    ${cleanHtml}

    <section class="lr777-board">
      <header><strong>start</strong><span>i = ${i < 0 ? "—" : i}</span></header>
      <div class="lr777-ptrs" style="--lr777-cols:${Math.max(1, n)}">${ptrRow(i, "i", "i")}</div>
      <div class="lr777-row" style="--lr777-cols:${Math.max(1, n)}">${cellsFor(start, i, matchedI, "start")}</div>
      <div class="lr777-row" style="--lr777-cols:${Math.max(1, n)}">${cellsFor(end, j, matchedJ, "end")}</div>
      <div class="lr777-ptrs" style="--lr777-cols:${Math.max(1, n)}">${ptrRow(j, "j", "j")}</div>
      <header class="bottom"><strong>end</strong><span>j = ${j < 0 ? "—" : j}</span></header>
      <div class="lr777-legend">
        <span><i class="lg-l"></i>L (${vi ? "đi trái" : "moves left"})</span>
        <span><i class="lg-r"></i>R (${vi ? "đi phải" : "moves right"})</span>
        <span><i class="lg-x"></i>X (${vi ? "ô trống" : "empty space"})</span>
        <span><i class="lg-m"></i>${vi ? "đã khớp" : "matched"}</span>
      </div>
    </section>

    ${constraintHtml}

    <section class="lr777-board">
      <header><strong>${vi ? "CÁC CHỮ ĐÃ KHỚP" : "MATCHED LETTERS"}</strong><span>${pairs.length}</span></header>
      <div class="lr777-pairs">${pairsHtml}</div>
    </section>

    <div class="lr777-decision ${verdictCls}${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(decisionText)}</strong>
      <div><span>i = ${i < 0 ? "—" : i}</span><span>j = ${j < 0 ? "—" : j}</span><span>return = ${escapeHtml(verdictLabel)}</span></div>
    </div>
  </section>`;
}

// ---- 528 Random Pick with Weight (prefix sum + lower-bound search) ----
function renderRandomPickView(step) {
  const view = step.randomPickView || {};
  const vi = lang === "vi";
  const n = Number(view.n) || 0;
  const w = Array.isArray(view.w) ? view.w : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const total = Number(view.total) || 0;
  const tally = Array.isArray(view.tally) ? view.tally : [];
  const picks = Array.isArray(view.picks) ? view.picks : [];
  const targets = Array.isArray(view.targets) ? view.targets : [];
  const phase = view.phase || "";
  const buildIndex = Number.isInteger(view.buildIndex) ? view.buildIndex : -1;
  const target = Number.isInteger(view.target) ? view.target : null;
  const lo = Number.isInteger(view.lo) ? view.lo : null;
  const hi = Number.isInteger(view.hi) ? view.hi : null;
  const mid = Number.isInteger(view.mid) ? view.mid : null;
  const result = Number.isInteger(view.result) ? view.result : null;

  // ── Phase bar ───────────────────────────────────────────────────────────
  const stageOf = { intro: 0, build: 0, ready: 1, pick: 2, done: 3 };
  const stage = stageOf[phase] === undefined ? 0 : stageOf[phase];
  const labels = vi
    ? ["Dựng prefix sum", "Sẵn sàng", "pickIndex() · binary search", "Kết quả"]
    : ["Build prefix sum", "Ready", "pickIndex() · binary search", "Result"];
  const phases = labels.map((label, i) => {
    const cls = i < stage ? "done" : i === stage ? "active" : "";
    return `<span class="${cls}">${i < stage ? "✓" : i + 1}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // ── Weight blocks over the unit line 1..total ───────────────────────────
  // Each index spans exactly w[i] columns, so block width IS its probability.
  let blocks = "";
  if (prefix.length) {
    blocks = prefix.map((end, i) => {
      const start = i === 0 ? 1 : prefix[i - 1] + 1;
      const size = end - start + 1;
      const owns = target !== null && target >= start && target <= end;
      const cls = ["rp528-block"];
      if (owns) cls.push("hit");
      if (result === i) cls.push("picked");
      if (buildIndex === i) cls.push("building");
      const pct = total ? Math.round((w[i] / total) * 1000) / 10 : 0;
      return `<div class="${cls.join(" ")}" style="grid-column:${start} / span ${size}"
        aria-label="${escapeHtml(`index ${i}, weight ${w[i]}, units ${start} to ${end}`)}">
        <small>i=${i}</small>
        <strong>w=${w[i]}</strong>
        <em>${start}–${end} · ${pct}%</em>
      </div>`;
    }).join("");
  }
  // Tick row + the target marker
  const ticks = total && total <= 40
    ? Array.from({ length: total }, (_, k) => {
      const u = k + 1;
      const isTarget = target === u;
      return `<div class="rp528-tick${isTarget ? " target" : ""}" style="grid-column:${u} / span 1">${isTarget ? `<b>${u}</b>` : u}</div>`;
    }).join("")
    : "";

  const lineHtml = prefix.length
    ? `<div class="rp528-line" style="--rp528-units:${Math.max(1, total)}">${blocks}</div>
       <div class="rp528-ticks" style="--rp528-units:${Math.max(1, total)}">${ticks}</div>`
    : `<div class="rp528-empty">${vi ? "đang dựng prefix…" : "building prefix…"}</div>`;

  // ── prefix[] array with binary-search pointers ───────────────────────────
  const inWindow = (i) => lo !== null && hi !== null && i >= lo && i <= hi;
  const prefixCells = prefix.map((v, i) => {
    const cls = ["rp528-cell"];
    if (lo !== null && !inWindow(i)) cls.push("out");
    if (i === mid) cls.push("mid");
    if (result === i) cls.push("picked");
    if (buildIndex === i) cls.push("building");
    return `<div class="${cls.join(" ")}"><small>prefix[${i}]</small><strong>${v}</strong></div>`;
  }).join("");
  let pointers = "";
  if (lo !== null && hi !== null && phase === "pick") {
    pointers = `<div class="rp528-ptrs">
      <span class="lo">lo = ${lo}</span>
      ${mid !== null ? `<span class="mid">mid = ${mid}</span>` : ""}
      <span class="hi">hi = ${hi}</span>
    </div>`;
  }

  // ── Tally: observed picks vs the weight each index should get ────────────
  const tallyHtml = w.map((weight, i) => {
    const got = tally[i] || 0;
    const share = total ? Math.round((weight / total) * 1000) / 10 : 0;
    const cls = ["rp528-tally", result === i ? "picked" : ""].filter(Boolean).join(" ");
    return `<div class="${cls}"><small>i=${i}</small><strong>${got}</strong><em>${vi ? "kỳ vọng" : "expected"} ${share}%</em></div>`;
  }).join("");

  // ── Picks history ───────────────────────────────────────────────────────
  const picksHtml = targets.map((t, i) => {
    const done = i < picks.length;
    const cls = ["rp528-pick", done ? "done" : "", i === picks.length && phase === "pick" ? "active" : ""].filter(Boolean).join(" ");
    return `<span class="${cls}"><small>t=${t}</small><b>${done ? `→ i=${picks[i].index}` : "…"}</b></span>`;
  }).join("");

  // ── Decision copy ───────────────────────────────────────────────────────
  const decisionText = {
    intro: vi ? `Muốn P(chọn i) = w[i]/${total}. Biến w thành các khối liền nhau có độ dài bằng w[i].` : `We want P(pick i) = w[i]/${total}. Turn w into contiguous blocks whose lengths equal w[i].`,
    build: vi ? "Cộng dồn: prefix[i] là biên PHẢI của khối thuộc index i." : "Accumulate: prefix[i] is the RIGHT edge of index i's block.",
    ready: vi ? "prefix tăng dần → binary search được. Bề rộng khối chính là xác suất." : "prefix is increasing → binary-searchable. A block's width IS its probability.",
    draw: vi ? "Bốc một đơn vị ngẫu nhiên trong 1..total, rồi tìm khối chứa nó." : "Draw a random unit in 1..total, then find the block containing it.",
    "go-right": vi ? "prefix[mid] < target → khối của mid kết thúc quá sớm → lo = mid + 1." : "prefix[mid] < target → mid's block ends too early → lo = mid + 1.",
    "keep-mid": vi ? "prefix[mid] ≥ target → mid có thể là chủ sở hữu → hi = mid (giữ mid)." : "prefix[mid] ≥ target → mid may be the owner → hi = mid (keep mid).",
    resolved: vi ? "lo gặp hi → đó là index sở hữu target." : "lo meets hi → that is the index owning the target.",
    done: vi ? "Mỗi lần chọn O(log n); tần suất lâu dài tiến về w[i]/total." : "Each pick is O(log n); long-run frequencies approach w[i]/total.",
  }[view.decision] || (vi ? "Đang xử lý." : "Processing.");

  const isDone = phase === "done";
  const badge = target === null ? "" : `<span>target = ${target}</span>`;
  const resLine = result === null ? "" : `<span>return ${result}</span>`;

  $("treeView").innerHTML = `<section class="rp528-viz" aria-label="${escapeHtml(vi ? "Trực quan hóa chọn index theo trọng số" : "Random pick with weight visualization")}">
    <div class="rp528-phases">${phases}</div>

    <section class="rp528-block-wrap">
      <header><strong>${vi ? "DẢI ĐƠN VỊ 1.." : "UNIT LINE 1.."}${total}</strong><span>${vi ? "bề rộng khối = trọng số = xác suất" : "block width = weight = probability"}</span></header>
      ${lineHtml}
    </section>

    <section class="rp528-block-wrap">
      <header><strong>prefix[]</strong><span>${vi ? "mờ = đã loại khỏi vùng tìm kiếm" : "dimmed = eliminated from the search window"}</span></header>
      <div class="rp528-cells">${prefixCells}</div>
      ${pointers}
    </section>

    <div class="rp528-lower">
      <section class="rp528-block-wrap">
        <header><strong>${vi ? "SỐ LẦN ĐƯỢC CHỌN" : "TIMES PICKED"}</strong><span>${picks.length}/${targets.length} ${vi ? "lượt" : "calls"}</span></header>
        <div class="rp528-tallies">${tallyHtml}</div>
      </section>
      <section class="rp528-block-wrap">
        <header><strong>${vi ? "LỊCH SỬ pickIndex()" : "pickIndex() HISTORY"}</strong><span>target → index</span></header>
        <div class="rp528-picks">${picksHtml}</div>
      </section>
    </div>

    <div class="rp528-decision${isDone ? " done" : ""}">
      <small>${isDone ? (vi ? "Hoàn tất" : "Done") : (vi ? "Bước hiện tại" : "Current step")}</small>
      <strong>${escapeHtml(decisionText)}</strong>
      <div>${badge}${resLine}<span>total = ${total}</span></div>
    </div>
  </section>`;
}

// ---- 34 Find First and Last Position renderer ----
function renderSearchRangeView(step) {
  const view = step.searchRangeView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const n = nums.length;
  const target = Number(view.target);
  const x = Number(view.x);
  const halfOpen = !!view.halfOpen;
  const lo = Number(view.lo);
  const hi = Number(view.hi);
  const mid = Number(view.mid);
  const first = Number(view.first);
  const last = Number(view.last);
  const settled = Number(view.settled);
  const phase = view.phase || "";
  const searchIndex = Number(view.searchIndex) || 0;

  // An index is inside the live window: [lo, hi) half-open, [lo, hi] closed.
  const inWindow = (i) => (halfOpen ? (i >= lo && i < hi) : (i >= lo && i <= hi));
  const windowEmpty = halfOpen ? !(hi > lo) : !(hi >= lo);
  const searching = ["init", "loop", "mid", "compare", "move"].indexOf(phase) >= 0;

  // ── Phase strip: the two searches + combine ──────────────────────────────
  const stageLabels = vi
    ? ["1 · Tìm biên TRÁI", "2 · Kiểm tra tồn tại", "3 · Tìm biên PHẢI", "4 · Ghép [first, last]"]
    : ["1 · Find LEFT bound", "2 · Check exists", "3 · Find RIGHT bound", "4 · Combine [first, last]"];
  let stage = 0;
  if (phase === "start") stage = 0;
  else if (searchIndex === 1 && searching) stage = 0;
  else if (phase === "converged" || phase === "return") stage = searchIndex === 2 ? 2 : 0;
  else if (phase === "check") stage = 1;
  else if (phase === "notfound") stage = 3;
  else if (phase === "start2" || (searchIndex === 2 && searching)) stage = 2;
  else if (phase === "derive-last") stage = 2;
  else if (phase === "done") stage = 3;
  const stages = stageLabels.map((label, i) => {
    const cls = i < stage ? "done" : i === stage ? "active" : "pending";
    return `<span class="${cls}">${i < stage ? "✓" : i === stage ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // ── Array cells ─────────────────────────────────────────────────────────
  // Vertical layout (keep these in sync or labels will collide):
  //   L/R label text baseline .... y = 12
  //   L/R arrow (points down) .... y = 16 → 24
  //   cell box ................... y = 40 → 80   (translate 60, rect -20..20)
  //   index label ................ y = 93
  //   M arrow (points up) + label. y = 98 → 119
  //   first/last badge ........... y = 134
  const cellW = 54;
  const svgW = Math.max(220, n * cellW + 24);
  const svgH = 146;
  const CELL_Y = 60;
  let cells = "";
  for (let i = 0; i < n; i++) {
    const cx = 12 + i * cellW + cellW / 2;
    const active = inWindow(i);
    const isTargetVal = nums[i] === target;
    const isMid = i === mid;
    const isFirst = first >= 0 && i === first;
    const isLast = last >= 0 && i === last;
    const isSettled = settled >= 0 && i === settled;
    const cls = ["sr-cell"];
    if (!active) cls.push("out");
    if (isTargetVal) cls.push("is-target");
    if (isMid) cls.push("is-mid");
    if (isFirst) cls.push("is-first");
    if (isLast) cls.push("is-last");
    if (isSettled && !isFirst && !isLast) cls.push("is-settled");
    cells += `<g class="${cls.join(" ")}" transform="translate(${cx},${CELL_Y})">
      <rect x="-23" y="-20" width="46" height="40" rx="6"></rect>
      <text class="sr-val" y="6">${escapeHtml(nums[i])}</text>
      <text class="sr-idx" y="33">${i}</text>
    </g>`;
  }

  // Pointer arrows (L / M / R or S / M / E)
  const loName = halfOpen ? "L" : "S";
  const hiName = halfOpen ? "R" : "E";
  const ptrX = (i) => 12 + i * cellW + cellW / 2;
  let ptrs = "";
  if (searching || phase === "converged" || phase === "return") {
    // L and R can land on the same index; nudge them apart so labels stay legible.
    const sameSpot = lo === hi;
    if (lo >= 0 && lo <= n) {
      const px = (lo >= n ? svgW - 14 : ptrX(lo)) + (sameSpot ? -13 : 0);
      ptrs += `<g class="sr-ptr lo" transform="translate(${px},12)"><text y="0">${loName}=${lo}</text><path d="M0,24 L-5,16 L5,16 Z"></path></g>`;
    }
    if (hi >= 0 && hi <= n) {
      const px = (hi >= n ? svgW - 14 : ptrX(hi)) + (sameSpot ? 13 : 0);
      ptrs += `<g class="sr-ptr hi" transform="translate(${px},12)"><text y="0">${hiName}=${hi}${halfOpen && hi >= n ? " (n)" : ""}</text><path d="M0,24 L-5,16 L5,16 Z"></path></g>`;
    }
    if (mid >= 0 && mid < n) {
      ptrs += `<g class="sr-ptr mid" transform="translate(${ptrX(mid)},98)"><path d="M0,-2 L-5,6 L5,6 Z"></path><text y="19">M=${mid}</text></g>`;
    }
  }
  // Boundary badges once known — own row below the M label so they never collide.
  let badges = "";
  if (first >= 0 && first < n) {
    const label = (last === first) ? "first=last" : "first";
    badges += `<g class="sr-badge first" transform="translate(${ptrX(first)},134)"><text y="0">${label}</text></g>`;
  }
  if (last >= 0 && last < n && last !== first) {
    badges += `<g class="sr-badge last" transform="translate(${ptrX(last)},134)"><text y="0">last</text></g>`;
  }

  const arraySvg = `<svg class="sr-array" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="${vi ? "Mảng và vùng tìm kiếm" : "Array and search window"}">${cells}${ptrs}${badges}</svg>`;

  // ── Which search is running ─────────────────────────────────────────────
  const searchTitle = searchIndex === 0
    ? (vi ? "Chuẩn bị" : "Setup")
    : halfOpen
      ? `lowerBound(${x})`
      : (searchIndex === 1 ? "findFirst(nums, target)" : "findLast(nums, target)");
  const searchGoal = searchIndex === 0
    ? (vi ? `Mảng đã sắp xếp, target = ${target}` : `Sorted array, target = ${target}`)
    : halfOpen
      ? (searchIndex === 1
          ? (vi ? `chỉ số đầu tiên có nums[i] ≥ ${x}  →  first` : `first index with nums[i] ≥ ${x}  →  first`)
          : (vi ? `chỉ số đầu tiên có nums[i] ≥ ${x}, rồi −1  →  last` : `first index with nums[i] ≥ ${x}, then −1  →  last`))
      : (searchIndex === 1
          ? (vi ? "thu hẹp về vị trí xuất hiện ĐẦU TIÊN" : "narrow to the FIRST occurrence")
          : (vi ? "thu hẹp về vị trí xuất hiện CUỐI CÙNG" : "narrow to the LAST occurrence"));

  const windowLabel = windowEmpty
    ? (vi ? "rỗng" : "empty")
    : (halfOpen ? `[${lo}, ${hi})` : `[${lo}, ${hi}]`);
  const windowSize = windowEmpty ? 0 : (halfOpen ? hi - lo : hi - lo + 1);

  // ── Decision panel ──────────────────────────────────────────────────────
  let decHtml = "";
  const c = view.compare;
  if (c) {
    const truth = c.result ? "TRUE" : "FALSE";
    const cls = view.decision === "go-right" ? "go-right" : "keep-mid";
    const explain = view.decision === "go-right"
      ? (vi ? `Bỏ nửa TRÁI (kể cả M) → ${loName} = M + 1` : `Discard the LEFT half incl. M → ${loName} = M + 1`)
      : (vi ? `M có thể là đáp án → giữ M, bỏ nửa PHẢI → ${hiName} = M` : `M may be the answer → keep M, discard the RIGHT half → ${hiName} = M`);
    decHtml = `<section class="sr-decision ${cls}">
      <small>${vi ? "SO SÁNH" : "COMPARISON"}</small>
      <strong>${escapeHtml(c.leftLabel)} = ${escapeHtml(c.leftVal)} ${escapeHtml(c.op)} ${escapeHtml(c.rightLabel)} = ${escapeHtml(c.rightVal)} → ${truth}</strong>
      <p>${escapeHtml(explain)}</p>
    </section>`;
  } else if (phase === "check") {
    const exists = first >= 0;
    decHtml = `<section class="sr-decision ${exists ? "keep-mid" : "go-right"}">
      <small>${vi ? "KIỂM TRA TỒN TẠI" : "EXISTENCE CHECK"}</small>
      <strong>${exists ? (vi ? `nums[${first}] == ${target} ✓` : `nums[${first}] == ${target} ✓`) : (vi ? `${target} không có trong mảng` : `${target} is not in the array`)}</strong>
      <p>${exists ? (vi ? "target tồn tại → đi tìm biên phải." : "target exists → go find the right boundary.") : (vi ? "trả về [-1, -1]." : "return [-1, -1].")}</p>
    </section>`;
  }

  // ── Result panel ────────────────────────────────────────────────────────
  const ansText = view.answer !== null && view.answer !== undefined
    ? view.answer
    : `[${first >= 0 ? first : "?"}, ${last >= 0 ? last : "?"}]`;
  const complete = view.answer !== null && view.answer !== undefined;
  const resultHtml = `<section class="sr-result ${complete ? (view.answer === "[-1, -1]" ? "notfound" : "complete") : ""}">
    <div><small>target</small><strong>${escapeHtml(target)}</strong></div>
    <div><small>first</small><strong>${first >= 0 ? first : "—"}</strong></div>
    <div><small>last</small><strong>${last >= 0 ? last : "—"}</strong></div>
    <div class="sr-answer"><small>${vi ? "ĐÁP ÁN" : "ANSWER"}</small><strong>${escapeHtml(ansText)}</strong></div>
  </section>`;

  $("treeView").innerHTML = `<section class="sr-viz">
    <div class="sr-stages">${stages}</div>
    <section class="sr-search">
      <header><strong>${escapeHtml(searchTitle)}</strong><span>${escapeHtml(searchGoal)}</span></header>
      <div class="sr-window">${vi ? "Vùng tìm kiếm" : "Search window"}: <b>${escapeHtml(windowLabel)}</b> <em>(${windowSize} ${vi ? "phần tử" : windowSize === 1 ? "element" : "elements"})</em>${halfOpen ? `<i>${vi ? "nửa mở — R không thuộc vùng" : "half-open — R is excluded"}</i>` : `<i>${vi ? "đóng — cả S và E thuộc vùng" : "closed — both S and E included"}</i>`}</div>
      ${arraySvg}
      <div class="sr-legend">
        <span><i class="lg-target"></i>${vi ? `giá trị = ${target}` : `value = ${target}`}</span>
        <span><i class="lg-mid"></i>mid</span>
        <span><i class="lg-out"></i>${vi ? "đã loại" : "eliminated"}</span>
        <span><i class="lg-bound"></i>first / last</span>
      </div>
    </section>
    ${decHtml}
    ${resultHtml}
  </section>`;
}

// ---- 3161 Block Placement Queries renderer ----
function renderBlockQueriesView(step) {
  const view = step.blockQueriesView || {};
  const vi = lang === "vi";
  const n = Number(view.n) || 10;
  const obstacles = Array.isArray(view.obstacles) ? view.obstacles : [];
  const queries = Array.isArray(view.queries) ? view.queries : [];
  const answers = Array.isArray(view.answers) ? view.answers : [];
  const curQ = view.currentQuery;
  const curQIdx = Number(view.queryIndex ?? -1);

  // ── Phase strip ──────────────────────────────────────────────────────────
  const phaseIndex = { init: 0, preinsert: 0, build: 1, "reverse-start": 2, type1: 2, type2: 2, done: 3 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["0 · Khởi tạo", "1 · Xây Fenwick", "2 · Duyệt ngược", "3 · Xong"]
    : ["0 · Init", "1 · Build Fenwick", "2 · Reverse scan", "3 · Done"];
  const phases = phaseLabels.map((label, i) => {
    const cls = i < phaseIndex ? "done" : i === phaseIndex ? "active" : "pending";
    return `<span class="${cls}">${i < phaseIndex ? "✓" : i === phaseIndex ? "▶" : "○"}<b>${escapeHtml(label)}</b></span>`;
  }).join("");

  // ── Number line ─────────────────────────────────────────────────────────
  const displayN = Math.min(n, 30);
  const cellW = 26;
  const svgW = (displayN + 1) * cellW + 20;
  const svgH = 78;
  const obsSet = new Set(obstacles);
  const prevObs = view.prevObs !== null && view.prevObs !== undefined ? Number(view.prevObs) : -1;
  const nextObs = view.nextObs !== null && view.nextObs !== undefined ? Number(view.nextObs) : -1;
  const curX = curQ ? curQ[1] : -1;
  const fenwickQuery = view.fenwickQuery !== null && view.fenwickQuery !== undefined ? Number(view.fenwickQuery) : -1;

  let cells = "";
  for (let pos = 0; pos <= displayN; pos++) {
    const cx = 10 + pos * cellW;
    const isObs = obsSet.has(pos);
    const isCurX = pos === curX && curQ;
    const isPrev = pos === prevObs;
    const isNext = pos === nextObs;
    const isFenwickQ = pos === fenwickQuery;
    const isSentinel = pos === 0 || pos === n;
    let cls = "bq-cell";
    if (isSentinel) cls += " sentinel";
    if (isObs) cls += " obstacle";
    if (isPrev) cls += " prev-obs";
    if (isNext) cls += " next-obs";
    if (isCurX) cls += " cur-x";
    if (isFenwickQ && !isPrev) cls += " fenwick-q";
    cells += `<g class="${cls}" transform="translate(${cx},30)">
      <rect x="-10" y="-14" width="20" height="28" rx="4"></rect>
      <text class="bq-pos" x="0" y="5">${pos}</text>
      ${isObs ? `<circle class="bq-obs-dot" cx="0" cy="-20" r="5"></circle>` : ""}
    </g>`;
  }
  if (displayN < n) {
    cells += `<text x="${10 + (displayN + 0.5) * cellW}" y="34" class="bq-ellipsis">…${n}</text>`;
  }

  // highlight range [0..curX] for type-2 queries
  let rangeRect = "";
  if (curQ && curQ[0] === 2 && curX >= 0 && curX <= displayN) {
    rangeRect = `<rect x="0" y="16" width="${10 + curX * cellW + 10}" height="28" rx="4" class="bq-range"></rect>`;
  }

  const linesvg = `<svg class="bq-line" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="${vi ? "Trục số với chướng ngại vật" : "Number line with obstacles"}">${rangeRect}${cells}</svg>`;

  // ── Query list ─────────────────────────────────────────────────────────
  const type2Indices = queries.map((q, i) => q[0] === 2 ? i : -1).filter((i) => i >= 0);
  let ansIdx = 0;
  const qChips = queries.map((q, i) => {
    const isActive = i === curQIdx;
    const type = q[0];
    let state = "pending";
    let ansLabel = "";
    if (type === 2) {
      const answeredSoFar = answers.length;
      const thisRank = type2Indices.indexOf(i);
      if (thisRank < answeredSoFar) {
        state = answers[thisRank] ? "true" : "false";
        ansLabel = answers[thisRank] ? " → T" : " → F";
      }
    }
    const cls = `bq-qchip ${type === 1 ? "t1" : "t2"} ${state} ${isActive ? "active" : ""}`;
    const label = type === 1 ? `[1,${q[1]}]` : `[2,${q[1]},${q[2]}]`;
    return `<span class="${cls}"><small>#${i}</small><b>${escapeHtml(label)}${ansLabel}</b></span>`;
  }).join("");

  // ── Decision panel ────────────────────────────────────────────────────
  let decisionHtml = "";
  if (curQ) {
    if (curQ[0] === 1) {
      decisionHtml = `<section class="bq-decision t1">
        <small>${vi ? "LOẠI 1 · XÓA (ngược)" : "TYPE 1 · REMOVE (reversed)"}</small>
        <strong>x = ${curQ[1]}</strong>
        <div class="bq-formula">prev = ${prevObs} &nbsp;|&nbsp; next = ${nextObs} &nbsp;|&nbsp; gap = ${nextObs - prevObs}</div>
        <p>${vi ? `maximize(${nextObs}, ${nextObs - prevObs}) trên Fenwick` : `maximize(${nextObs}, ${nextObs - prevObs}) on Fenwick`}</p>
      </section>`;
    } else {
      const sz = curQ[2];
      const directGap = curX - prevObs;
      const fw = view.fenwickResult ?? 0;
      const ansClass = view.queryAnswer ? "bq-decision t2 true" : "bq-decision t2 false";
      decisionHtml = `<section class="${ansClass}">
        <small>${vi ? "LOẠI 2 · TRUY VẤN" : "TYPE 2 · QUERY"}</small>
        <strong>x=${curQ[1]}, sz=${sz}</strong>
        <div class="bq-formula">prev=${prevObs} &nbsp;|&nbsp; x−prev=${directGap} &nbsp;|&nbsp; fenwick.get(${fenwickQuery})=${fw}</div>
        <p>(${fw} ≥ ${sz}) OR (${directGap} ≥ ${sz}) = <b>${view.queryAnswer ? "TRUE ✓" : "FALSE ✗"}</b></p>
      </section>`;
    }
  }

  // ── Answers so far ────────────────────────────────────────────────────
  const answersHtml = answers.length
    ? answers.map((a, i) => `<span class="bq-ans ${a ? "true" : "false"}">${a ? "T" : "F"}</span>`).join("")
    : `<em class="bq-empty">${vi ? "chưa có đáp án" : "no answers yet"}</em>`;

  // ── Obstacles list ────────────────────────────────────────────────────
  const obsHtml = obstacles.map((o) => {
    const cls = o === prevObs ? "bq-obs-chip prev" : o === nextObs ? "bq-obs-chip next" : "bq-obs-chip";
    return `<span class="${cls}">${o}</span>`;
  }).join("");

  $("treeView").innerHTML = `<section class="bq-viz">
    <div class="bq-phases">${phases}</div>
    <section class="bq-line-wrap"><header><strong>${vi ? "TRỤC SỐ" : "NUMBER LINE"}</strong><span>${vi ? "■=chướng ngại vật · vàng=vị trí hiện tại · xanh=prev_obs" : "■=obstacle · amber=current x · green=prev_obs"}</span></header>${linesvg}</section>
    <div class="bq-main">
      <section class="bq-queries"><header><strong>${vi ? "DANH SÁCH TRUY VẤN" : "QUERY LIST"}</strong><span>${vi ? "duyệt ngược i→0" : "processed i→0"}</span></header><div class="bq-qlist">${qChips}</div></section>
      <section class="bq-obstacles"><header><strong>${vi ? "SORTED OBSTACLES" : "SORTED OBSTACLES"}</strong><span>${obstacles.length}</span></header><div class="bq-obs-row">${obsHtml}</div></section>
      ${decisionHtml}
      <section class="bq-answers"><header><strong>${vi ? "KẾT QUẢ TYPE-2" : "TYPE-2 ANSWERS"}</strong></header><div class="bq-ans-row">${answersHtml}</div></section>
    </div>
  </section>`;
}

function renderSqrtBinaryView(step) {
  const view = step.sqrtBinaryView;
  const el = $("treeView");
  const vi = lang === "vi";
  const phaseIndex = { setup: 0, range: 1, compare: 2, shrink: 3, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Tạo [lo, hi]", "2 · Kiểm tra while / mid", "3 · So mid² với x", "4 · Thu hẹp / trả về"]
    : ["1 · Build [lo, hi]", "2 · Check while / mid", "3 · Compare mid² to x", "4 · Shrink / return"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    return `<span class="${state}">${state === "done" ? "✓" : state === "active" ? "▶" : "○"} ${escapeHtml(label)}</span>`;
  }).join("");

  const baseCase = view.event === "base-case";
  const domainLo = baseCase ? 0 : view.initialLo;
  const domainHi = Math.max(baseCase ? 1 : view.initialHi, domainLo);
  const candidateCount = domainHi - domainLo + 1;
  const graphWidth = 680;
  const graphHeight = 285;
  const plotLeft = 70;
  const plotRight = graphWidth - 60;
  const axisY = 105;
  const bucketWidth = (plotRight - plotLeft) / Math.max(1, candidateCount);

  function centerX(value) {
    return plotLeft + (value - domainLo + 0.5) * bucketWidth;
  }

  function edgeX(value) {
    return plotLeft + (value - domainLo) * bucketWidth;
  }

  function segment(from, to, className) {
    const left = Math.max(domainLo, from);
    const right = Math.min(domainHi, to);
    if (left > right) return "";
    return `<rect class="sqrt-zone ${className}" x="${edgeX(left)}" y="${axisY - 18}" width="${edgeX(right + 1) - edgeX(left)}" height="36" rx="7"></rect>`;
  }

  const confirmedEnd = baseCase ? view.answer : Math.min(domainHi, view.lo - 1);
  const rejectedStart = baseCase ? domainHi + 1 : Math.max(domainLo, view.hi + 1);
  const activeFrom = Math.max(domainLo, view.lo);
  const activeTo = Math.min(domainHi, view.hi);
  const zones = baseCase
    ? segment(view.answer, view.answer, "answer")
    : `${segment(domainLo, confirmedEnd, "confirmed")}${segment(activeFrom, activeTo, "active")}${segment(rejectedStart, domainHi, "rejected")}`;

  let tickValues;
  if (candidateCount <= 16) {
    tickValues = Array.from({ length: candidateCount }, (_, index) => domainLo + index);
  } else {
    tickValues = [...new Set([
      domainLo,
      domainHi,
      view.lo,
      view.hi,
      view.mid,
      view.answer,
    ].filter((value) => Number.isInteger(value) && value >= domainLo && value <= domainHi))].sort((a, b) => a - b);
  }
  const ticks = tickValues.map((value) => `<g class="sqrt-tick${value === view.answer ? " answer" : ""}">
    <line x1="${centerX(value)}" y1="${axisY - 23}" x2="${centerX(value)}" y2="${axisY + 23}"></line>
    <text class="value" x="${centerX(value)}" y="${axisY + 43}">${value}</text>
    ${candidateCount <= 12 ? `<text class="square" x="${centerX(value)}" y="${axisY + 68}">${value}²=${value * value}</text>` : ""}
  </g>`).join("");

  let markers = "";
  if (!baseCase) {
    if (view.lo === view.hi && view.lo >= domainLo && view.lo <= domainHi) {
      markers += `<g class="sqrt-pointer both"><line x1="${centerX(view.lo)}" y1="${axisY + 20}" x2="${centerX(view.lo)}" y2="${axisY + 27}"></line><line x1="${centerX(view.lo)}" y1="${axisY + 79}" x2="${centerX(view.lo)}" y2="${axisY + 116}"></line><text x="${centerX(view.lo)}" y="${axisY + 140}">lo = hi = ${view.lo}</text></g>`;
    } else {
      if (view.lo >= domainLo && view.lo <= domainHi + 1) {
        const loX = view.lo > domainHi ? plotRight + 12 : centerX(view.lo);
        markers += `<g class="sqrt-pointer lo"><line x1="${loX}" y1="${axisY + 20}" x2="${loX}" y2="${axisY + 27}"></line><line x1="${loX}" y1="${axisY + 79}" x2="${loX}" y2="${axisY + 88}"></line><text x="${loX}" y="${axisY + 110}">lo=${view.lo}</text></g>`;
      }
      if (view.hi >= domainLo - 1 && view.hi <= domainHi) {
        const hiX = view.hi < domainLo ? plotLeft - 12 : centerX(view.hi);
        markers += `<g class="sqrt-pointer hi"><line x1="${hiX}" y1="${axisY + 20}" x2="${hiX}" y2="${axisY + 27}"></line><line x1="${hiX}" y1="${axisY + 79}" x2="${hiX}" y2="${axisY + 118}"></line><text x="${hiX}" y="${axisY + 142}">hi=${view.hi}</text></g>`;
      }
    }
  }
  if (Number.isInteger(view.mid)) {
    markers += `<g class="sqrt-pointer mid"><line x1="${centerX(view.mid)}" y1="${axisY - 20}" x2="${centerX(view.mid)}" y2="${axisY - 62}"></line><path d="M ${centerX(view.mid) - 8} ${axisY - 61} L ${centerX(view.mid) + 8} ${axisY - 61} L ${centerX(view.mid)} ${axisY - 48} Z"></path><text x="${centerX(view.mid)}" y="${axisY - 72}">mid=${view.mid} · ${view.mid}²=${view.square}</text></g>`;
  }

  const axisLabel = vi
    ? `Binary search các số nguyên từ ${domainLo} đến ${domainHi}; vùng xanh lá đã xác nhận nhỏ, vùng xanh dương đang tìm, vùng đỏ quá lớn.`
    : `Binary search over integers ${domainLo} through ${domainHi}; green is confirmed low, blue is active, and red is too large.`;
  const rangeSvg = `<svg class="sqrt-range-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" role="img" aria-label="${escapeHtml(axisLabel)}">
    ${zones}<line class="sqrt-axis" x1="${plotLeft}" y1="${axisY}" x2="${plotRight}" y2="${axisY}"></line>${ticks}${markers}
  </svg>`;

  let actionHtml;
  if (view.event === "base-case") {
    actionHtml = `<div class="sqrt-action result"><small>BASE CASE</small><strong>x = ${view.x} &lt; 2</strong><b>return ${view.answer}</b></div>`;
  } else if (view.event === "init-range") {
    actionHtml = `<div class="sqrt-action setup"><small>${vi ? "KHOẢNG BAN ĐẦU" : "INITIAL RANGE"}</small><strong>[1, x // 2]</strong><b>[${view.lo}, ${view.hi}]</b><span>${vi ? "Đáp án không thể lớn hơn x // 2 khi x ≥ 2" : "For x ≥ 2, the answer cannot exceed x // 2"}</span></div>`;
  } else if (view.event === "while-check") {
    actionHtml = `<div class="sqrt-action condition ${view.whileResult ? "yes" : "no"}"><small>WHILE CONDITION</small><strong>${view.lo} ≤ ${view.hi} → ${view.whileResult}</strong><span>${view.whileResult ? (vi ? "Khoảng còn ứng viên" : "Candidates remain") : (vi ? "lo đã vượt hi; chuyển tới return hi" : "lo crossed hi; proceed to return hi")}</span></div>`;
  } else if (view.event === "compute-mid") {
    actionHtml = `<div class="sqrt-action mid"><small>COMPUTE MID</small><strong>(${view.lo} + ${view.hi}) // 2 = ${view.mid}</strong><b>${view.mid}² = ${view.square}</b></div>`;
  } else if (view.event === "exact-check") {
    const exact = view.comparison === "equal";
    actionHtml = `<div class="sqrt-action compare ${exact ? "exact" : "not-exact"}"><small>EXACT?</small><strong>${view.square} ${exact ? "=" : "≠"} ${view.x}</strong><b>${exact ? `return ${view.mid}` : (vi ? "Tiếp tục so sánh" : "Continue comparing")}</b></div>`;
  } else if (view.event === "move-lo") {
    actionHtml = `<div class="sqrt-action move right"><small>${view.square} &lt; ${view.x}</small><strong>lo = mid + 1 = ${view.lo}</strong><b>[${view.previousLo}..${view.mid}] → ${vi ? "tìm bên phải" : "search right"}</b><span>${vi ? `mid=${view.mid} là ứng viên floor đã xác nhận` : `mid=${view.mid} is a confirmed floor candidate`}</span></div>`;
  } else if (view.event === "move-hi") {
    actionHtml = `<div class="sqrt-action move left"><small>${view.square} &gt; ${view.x}</small><strong>hi = mid - 1 = ${view.hi}</strong><b>[${view.mid}..${view.previousHi}] → ${vi ? "loại vì quá lớn" : "remove as too large"}</b></div>`;
  } else {
    actionHtml = `<div class="sqrt-action result"><small>${vi ? "CHỨNG MINH FLOOR" : "FLOOR PROOF"}</small><strong>${view.answer}² ≤ ${view.x} &lt; ${view.answer + 1}²</strong><b>${view.answer * view.answer} ≤ ${view.x} &lt; ${(view.answer + 1) * (view.answer + 1)}</b><span>return hi = ${view.answer}</span></div>`;
  }

  const rangeText = baseCase ? "—" : view.lo <= view.hi ? `[${view.lo}, ${view.hi}]` : "∅";
  const bestConfirmed = baseCase ? view.answer : view.answer ?? Math.max(1, view.lo - 1);
  const equation = Number.isInteger(view.mid)
    ? `<div class="sqrt-equation ${view.comparison || "pending"}"><span><small>mid</small><strong>${view.mid}</strong></span><i>→</i><span><small>mid²</small><strong>${view.square}</strong></span><i>${view.comparison === "less" ? "<" : view.comparison === "greater" ? ">" : view.comparison === "equal" ? "=" : "?"}</i><span><small>x</small><strong>${view.x}</strong></span></div>`
    : "";

  el.innerHTML = `<div class="sqrt-binary-viz">
    <div class="sqrt-phases">${phases}</div>
    <div class="sqrt-summary">
      <span><small>TARGET x</small><strong>${view.x}</strong></span>
      <span><small>${vi ? "KHOẢNG ĐANG TÌM" : "ACTIVE RANGE"}</small><strong>${rangeText}</strong></span>
      <span><small>${vi ? "ỨNG VIÊN ĐÃ XÁC NHẬN" : "CONFIRMED CANDIDATE"}</small><strong>${bestConfirmed ?? "—"}</strong></span>
    </div>
    <div class="sqrt-chart">${rangeSvg}<div class="sqrt-legend"><span><i class="confirmed"></i>${vi ? "đã tìm bên phải" : "searched right"}</span><span><i class="active"></i>${vi ? "đang tìm" : "active"}</span><span><i class="rejected"></i>${vi ? "quá lớn" : "too large"}</span></div></div>
    ${equation}
    ${actionHtml}
  </div>`;
}

function renderHistogramRectangleView(step) {
  const view = step.histogramRectangleView;
  const el = $("treeView");
  const vi = lang === "vi";
  const bars = view.bars || [];
  const n = view.originalLength || 0;
  const phaseIndex = { setup: 0, scan: 0, stack: 1, area: 2, done: 4 }[view.phase] ?? 0;
  const phaseLabels = vi
    ? ["1 · Đọc cột i", "2 · Pop khi top ≥ current", "3 · Tính width × height", "4 · Cập nhật max_area"]
    : ["1 · Read bar i", "2 · Pop while top ≥ current", "3 · Compute width × height", "4 · Update max_area"];
  const phases = phaseLabels.map((label, index) => {
    const state = phaseIndex > index ? "done" : phaseIndex === index ? "active" : "pending";
    const icon = state === "done" ? "✓" : state === "active" ? "▶" : "○";
    return `<span class="${state}">${icon} ${escapeHtml(label)}</span>`;
  }).join("");

  const graphWidth = Math.max(620, bars.length * 82 + 90);
  const graphHeight = 330;
  const plotLeft = 55;
  const plotRight = graphWidth - 35;
  const baseline = 245;
  const plotHeight = 165;
  const cellWidth = (plotRight - plotLeft) / Math.max(1, bars.length);
  const barWidth = Math.min(58, cellWidth * 0.68);
  const maxHeight = Math.max(1, ...bars);
  const stackSet = new Set(view.stack || []);
  const best = view.bestRect;
  const hasCandidate = Number.isInteger(view.leftBoundary)
    && Number.isInteger(view.rightBoundary)
    && view.rightBoundary >= view.leftBoundary
    && Number.isFinite(view.candidateHeight);

  function centerX(index) {
    return plotLeft + (index + 0.5) * cellWidth;
  }

  function rectForRange(left, right, height) {
    const x = centerX(left) - cellWidth / 2 + 4;
    const width = Math.max(2, (right - left + 1) * cellWidth - 8);
    const scaledHeight = height === 0 ? 2 : (height / maxHeight) * plotHeight;
    return { x, y: baseline - scaledHeight, width, height: scaledHeight };
  }

  let rangeSvg = "";
  if (best && view.event !== "done") {
    const rect = rectForRange(best.left, best.right, best.height);
    rangeSvg += `<rect class="hist-best-rect" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="5"></rect>`;
  }
  if (hasCandidate) {
    const rect = rectForRange(view.leftBoundary, view.rightBoundary, view.candidateHeight);
    const candidateClass = view.event === "done" ? "hist-final-rect" : "hist-candidate-rect";
    rangeSvg += `<rect class="${candidateClass}" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="5"></rect>`;
    const x1 = centerX(view.leftBoundary) - cellWidth / 2 + 7;
    const x2 = centerX(view.rightBoundary) + cellWidth / 2 - 7;
    rangeSvg += `<line class="hist-width-line" x1="${x1}" y1="${baseline + 34}" x2="${x2}" y2="${baseline + 34}"></line>
      <line class="hist-width-tick" x1="${x1}" y1="${baseline + 27}" x2="${x1}" y2="${baseline + 41}"></line>
      <line class="hist-width-tick" x1="${x2}" y1="${baseline + 27}" x2="${x2}" y2="${baseline + 41}"></line>
      <text class="hist-width-label" x="${(x1 + x2) / 2}" y="${baseline + 55}">${vi ? "rộng" : "width"} = ${view.width}</text>`;
  }

  const barsSvg = bars.map((height, index) => {
    const sentinel = index === view.sentinelIndex;
    const scaledHeight = height === 0 ? 2 : (height / maxHeight) * plotHeight;
    const x = centerX(index) - barWidth / 2;
    const y = baseline - scaledHeight;
    const classes = ["hist-bar"];
    if (sentinel) classes.push("sentinel");
    if (stackSet.has(index)) classes.push("in-stack");
    if (index === view.currentIndex) classes.push("current");
    if (index === view.poppedIndex) classes.push("popped");
    if (hasCandidate && index >= view.leftBoundary && index <= view.rightBoundary) classes.push("candidate-span");
    if (best && index >= best.left && index <= best.right) classes.push("best-span");
    const indexLabel = sentinel ? `S(${index})` : `[${index}]`;
    const stackMark = stackSet.has(index) ? `<text class="hist-stack-mark" x="${centerX(index)}" y="${Math.max(42, y - 27)}">STACK</text>` : "";
    const currentMark = index === view.currentIndex
      ? `<path class="hist-current-pointer" d="M ${centerX(index) - 8} 27 L ${centerX(index) + 8} 27 L ${centerX(index)} 39 Z"></path><text class="hist-current-label" x="${centerX(index)}" y="18">i</text>`
      : "";
    return `${currentMark}${stackMark}<g class="${classes.join(" ")}" aria-label="${sentinel ? "sentinel" : `bar ${index}`}, height ${height}">
      <rect x="${x}" y="${y}" width="${barWidth}" height="${scaledHeight}" rx="4"></rect>
      <text class="hist-height" x="${centerX(index)}" y="${Math.max(55, y - 8)}">${height}</text>
      <text class="hist-index" x="${centerX(index)}" y="${baseline + 20}">${indexLabel}</text>
    </g>`;
  }).join("");

  const chartLabel = vi
    ? "Histogram với cột hiện tại, các index trong stack và hình chữ nhật đang được tính."
    : "Histogram showing the current bar, stack indices, and rectangle being evaluated.";
  const chartSvg = `<svg class="histogram-rect-svg" viewBox="0 0 ${graphWidth} ${graphHeight}" role="img" aria-label="${escapeHtml(chartLabel)}">
    <line class="hist-baseline" x1="${plotLeft}" y1="${baseline}" x2="${plotRight}" y2="${baseline}"></line>
    ${barsSvg}${rangeSvg}
  </svg>`;

  const stackItems = (view.stack || []).length
    ? view.stack.map((index, position) => {
        const top = position === view.stack.length - 1;
        const sentinel = index === view.sentinelIndex;
        return `<span class="${top ? "top" : ""}"><small>${top ? "TOP" : `#${position + 1}`}</small><strong>${sentinel ? `S(${index})` : `index ${index}`}</strong><em>h = ${bars[index]}</em></span>`;
      }).join("<i>→</i>")
    : `<em class="hist-stack-empty">∅ ${vi ? "stack rỗng" : "empty stack"}</em>`;

  let actionHtml;
  if (view.event === "init-stack") {
    actionHtml = `<div class="hist-action rule"><small>STACK</small><strong>[]</strong><span>${vi ? "Lưu index theo chiều cao tăng nghiêm ngặt" : "Stores indices in strictly increasing height order"}</span></div>`;
  } else if (view.event === "init-max") {
    actionHtml = `<div class="hist-action rule"><small>MAXIMUM</small><strong>max_area = 0</strong><span>${vi ? "Chưa có candidate" : "No candidate yet"}</span></div>`;
  } else if (view.event === "add-sentinel") {
    actionHtml = `<div class="hist-action sentinel"><small>SENTINEL</small><strong>bars = heights + [0]</strong><span>${vi ? `Thêm S tại index ${view.sentinelIndex} để xả stack` : `Append S at index ${view.sentinelIndex} to flush the stack`}</span></div>`;
  } else if (view.event === "scan") {
    actionHtml = `<div class="hist-action scan"><small>${vi ? "CỘT HIỆN TẠI" : "CURRENT BAR"}</small><strong>i = ${view.currentIndex}</strong><b>bars[i] = ${view.currentHeight}</b><span>${view.currentIndex === view.sentinelIndex ? (vi ? "Sentinel bắt đầu xả stack" : "Sentinel starts flushing the stack") : (vi ? "So sánh với đỉnh stack" : "Compare with the stack top")}</span></div>`;
  } else if (view.event === "while-check") {
    const topIndex = view.poppedIndex;
    const expression = topIndex === null
      ? "stack is empty"
      : `${bars[topIndex]} ≥ ${view.currentHeight}`;
    actionHtml = `<div class="hist-action compare ${view.whileResult ? "yes" : "no"}"><small>WHILE CONDITION</small><strong>${escapeHtml(expression)} → ${view.whileResult}</strong><span>${view.whileResult ? (vi ? `Pop index ${topIndex}` : `Pop index ${topIndex}`) : (vi ? `Dừng pop và push index ${view.currentIndex}` : `Stop popping and push index ${view.currentIndex}`)}</span></div>`;
  } else if (view.event === "pop") {
    actionHtml = `<div class="hist-action pop"><small>POP</small><strong>top = ${view.poppedIndex}</strong><b>height = ${view.candidateHeight}</b><span>${vi ? `Biên phải độc quyền = i = ${view.currentIndex}` : `Exclusive right boundary = i = ${view.currentIndex}`}</span></div>`;
  } else if (view.event === "width") {
    const formula = view.leftBoundary === 0
      ? `width = i = ${view.width}`
      : `width = ${view.currentIndex} - ${view.leftBoundary - 1} - 1 = ${view.width}`;
    actionHtml = `<div class="hist-action width"><small>${vi ? "BIÊN HÌNH CHỮ NHẬT" : "RECTANGLE BOUNDS"}</small><strong>[${view.leftBoundary} .. ${view.rightBoundary}]</strong><b>${formula}</b><span>${vi ? "Hai biên chặn không thuộc hình chữ nhật" : "The blocking boundaries are excluded"}</span></div>`;
  } else if (view.event === "area") {
    const decision = view.improved
      ? (vi ? `${view.candidateArea} > ${view.previousMax} → UPDATE` : `${view.candidateArea} > ${view.previousMax} → UPDATE`)
      : (vi ? `${view.candidateArea} ≤ ${view.previousMax} → KEEP` : `${view.candidateArea} ≤ ${view.previousMax} → KEEP`);
    actionHtml = `<div class="hist-action area ${view.improved ? "improved" : "kept"}"><small>AREA</small><strong>${view.candidateHeight} × ${view.width} = ${view.candidateArea}</strong><b>${decision}</b><span>max_area = ${view.maxArea}</span></div>`;
  } else if (view.event === "push") {
    actionHtml = `<div class="hist-action push"><small>PUSH</small><strong>stack.append(${view.currentIndex})</strong><span>${view.currentIndex === view.sentinelIndex ? (vi ? "Stack cuối cùng chứa sentinel" : "The final stack contains the sentinel") : (vi ? "Đỉnh stack mới nằm bên phải" : "The new stack top is on the right")}</span></div>`;
  } else {
    actionHtml = `<div class="hist-action result"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>max_area = ${view.maxArea}</strong>${best ? `<b>[${best.left}..${best.right}] · h=${best.height} · w=${best.width}</b>` : ""}</div>`;
  }

  const bestHtml = best
    ? `<span><small>${vi ? "BEST RANGE" : "BEST RANGE"}</small><strong>[${best.left}..${best.right}]</strong></span>
       <span><small>HEIGHT × WIDTH</small><strong>${best.height} × ${best.width}</strong></span>
       <span><small>MAX AREA</small><strong>${best.area}</strong></span>`
    : `<span><small>${vi ? "BEST RANGE" : "BEST RANGE"}</small><strong>—</strong></span>
       <span><small>HEIGHT × WIDTH</small><strong>—</strong></span>
       <span><small>MAX AREA</small><strong>${view.maxArea}</strong></span>`;

  el.innerHTML = `<div class="histogram-rect-viz">
    <div class="hist-phases">${phases}</div>
    <div class="hist-best-summary">${bestHtml}</div>
    <div class="hist-chart">${chartSvg}
      <div class="hist-legend"><span><i class="current"></i>i</span><span><i class="stack"></i>stack</span><span><i class="candidate"></i>${vi ? "candidate" : "candidate"}</span><span><i class="best"></i>${vi ? "tốt nhất" : "best"}</span><span><i class="sentinel"></i>sentinel</span></div>
    </div>
    <div class="hist-detail-row">
      <div class="hist-stack-lane"><strong>MONOTONIC STACK <small>${vi ? "đáy → đỉnh" : "bottom → top"}</small></strong><div>${stackItems}</div></div>
      ${actionHtml}
    </div>
  </div>`;
}

function renderStackView(step) {
  const view = step.stackView || {};
  const stack = Array.isArray(view.items) ? view.items : [];
  const input = Array.isArray(view.input) ? view.input : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const expected = view.expected || "";
  const top = stack.length ? stack[stack.length - 1] : "";
  const stackTitle = view.title || "Stack";
  const emptyLabel = view.emptyLabel || "empty stack";

  function itemParts(item) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return {
        value: item.value ?? item.label ?? "",
        detail: item.detail ?? "",
      };
    }
    return { value: item, detail: "" };
  }

  const topParts = itemParts(top);
  const statuses = Array.isArray(view.status)
    ? view.status
    : [
        { label: "top", value: topParts.value || "empty" },
        { label: "expected", value: expected || "-" },
      ];

  const stackItems = stack.length
    ? stack
        .map((item, idx) => {
          const isTop = idx === stack.length - 1;
          const parts = itemParts(item);
          return `<div class="stack-cell${isTop ? " top" : ""}">
            <span class="stack-cell-content">
              <span class="stack-value">${escapeHtml(String(parts.value))}</span>
              ${parts.detail ? `<small class="stack-detail">${escapeHtml(String(parts.detail))}</small>` : ""}
            </span>
            ${isTop ? `<span class="stack-tag">top</span>` : ""}
          </div>`;
        })
        .reverse()
        .join("")
    : `<div class="stack-empty">${escapeHtml(String(emptyLabel))}</div>`;

  const statusItems = statuses
    .map(
      (item) => `<div>
        <span>${escapeHtml(String(item.label ?? ""))}</span>
        <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
      </div>`,
    )
    .join("");

  const inputItems = input
    .map((ch, idx) => {
      const cls = idx === current ? " current" : idx < current ? " done" : "";
      return `<div class="stack-input-token${cls}">
        <span>${escapeHtml(String(ch))}</span>
        <small>${idx}</small>
      </div>`;
    })
    .join("");

  $("treeView").innerHTML = `
    <div class="stack-viz">
      <div class="stack-panel">
        <div class="stack-title">${escapeHtml(String(stackTitle))}</div>
        <div class="stack-container">${stackItems}</div>
        <div class="stack-base"></div>
      </div>
      <div class="stack-side">
        <div class="stack-status">${statusItems}</div>
        <div>
          ${view.inputLabel ? `<div class="stack-input-label">${escapeHtml(String(view.inputLabel))}</div>` : ""}
          <div class="stack-input-row">${inputItems}</div>
        </div>
      </div>
    </div>`;
}

function queueViewHtml(view, compact = false) {
  const items = Array.isArray(view.items) ? view.items : [];
  const capacity = Math.max(Number(view.capacity) || 0, items.length, 1);
  const stream = Array.isArray(view.stream) ? view.stream : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const active = Number.isInteger(view.active) ? view.active : -1;
  const statuses = Array.isArray(view.status) ? view.status : [];

  const cells = Array.from({ length: capacity }, (_, idx) => {
    const hasValue = idx < items.length;
    const tags = [];
    if (hasValue && idx === 0) tags.push("FRONT");
    if (hasValue && idx === items.length - 1) tags.push("REAR");
    return `<div class="queue-cell${hasValue ? "" : " empty"}${idx === active ? " active" : ""}">
      <span class="queue-tags">${tags.map((tag) => `<small>${tag}</small>`).join("")}</span>
      <strong>${hasValue ? escapeHtml(String(items[idx])) : "empty"}</strong>
      <span class="queue-index">[${idx}]</span>
    </div>`;
  }).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  const streamItems = stream.map((value, idx) => {
    const cls = idx === current ? " current" : idx < current ? " done" : "";
    return `<div class="stack-input-token${cls}"><span>${escapeHtml(String(value))}</span><small>${idx}</small></div>`;
  }).join("");

  const streamHtml = stream.length ? `<div>
    <div class="stack-input-label">Incoming stream</div>
    <div class="stack-input-row">${streamItems}</div>
  </div>` : "";

  return `<div class="queue-viz${compact ? " queue-viz-compact" : ""}">
      <div class="queue-heading">${escapeHtml(String(view.title || "Queue"))}</div>
      <div class="queue-cells">${cells}</div>
      <div class="queue-status">${statusItems}</div>
      ${streamHtml}
    </div>`;
}

function renderQueueView(step) {
  $("treeView").innerHTML = queueViewHtml(step.queueView || {});
}

function renderMaxNonDecreasingView(step) {
  const view = step.maxNonDecreasingView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const dp = Array.isArray(view.dp) ? view.dp : [];
  const last = Array.isArray(view.last) ? view.last : [];
  const need = Array.isArray(view.need) ? view.need : [];
  const deque = Array.isArray(view.deque) ? view.deque : [];
  const partition = Array.isArray(view.partition) ? view.partition : [];
  const phases = [
    ["prefix", vi ? "1. Tính prefix" : "1. Prefix sums"],
    ["choose", vi ? "2. Chọn điểm cắt" : "2. Choose cut"],
    ["update", vi ? "3. Cập nhật DP" : "3. Update DP"],
    ["deque", vi ? "4. Giữ deque đơn điệu" : "4. Maintain deque"],
    ["result", vi ? "5. Kết quả" : "5. Result"],
  ];
  const phaseHtml = phases.map(([key, label]) => `<span class="${view.phase === key ? "active" : ""}">${label}</span>`).join("");
  const dequeSet = new Set(deque);
  const prefixHtml = prefix.map((value, index) => {
    const classes = ["ndp-prefix-cell"];
    if (index === view.current) classes.push("current");
    if (index === view.chosen) classes.push("chosen");
    if (index === view.compare) classes.push("compare");
    if (index === view.removed) classes.push("removed");
    if (dequeSet.has(index)) classes.push("queued");
    const solved = view.phase !== "prefix" && index <= (view.processed || 0);
    return `<div class="${classes.join(" ")}">
      <small>i = ${index}</small>
      <strong>P = ${value ?? "—"}</strong>
      <span>dp = ${solved ? dp[index] : "—"}</span>
      <span>last = ${solved ? last[index] : "—"}</span>
      <em>need = ${solved ? need[index] : "—"}</em>
    </div>`;
  }).join("");
  const dequeHtml = deque.length
    ? deque.map((index, position) => {
        const classes = ["ndp-deque-token"];
        if (index === view.chosen) classes.push("chosen");
        if (index === view.compare) classes.push("compare");
        return `<div class="${classes.join(" ")}">
          <div>${position === 0 ? "FRONT" : ""}${position === deque.length - 1 ? `${position === 0 ? " · " : ""}REAR` : ""}</div>
          <strong>j = ${index}</strong>
          <span>need = ${need[index]}</span>
          <small>dp ${dp[index]} · last ${last[index]}</small>
        </div>`;
      }).join("<b class=\"ndp-arrow\">→</b>")
    : `<em class="ndp-empty">${vi ? "deque đang rỗng trước khi push candidate mới" : "deque is empty before pushing the new candidate"}</em>`;
  let equationHtml = `<span>${vi ? "Chưa chọn đoạn mới" : "No new segment selected yet"}</span>`;
  if (view.segment) {
    const segment = view.segment;
    const valid = segment.sum >= segment.previousLast;
    equationHtml = `<div><small>${vi ? "ĐOẠN MỚI" : "NEW SEGMENT"}</small><strong>nums[${segment.start}..${segment.end - 1}]</strong></div>
      <div><small>${vi ? "TỔNG ĐOẠN" : "SEGMENT SUM"}</small><strong>P[${segment.end}] - P[${segment.start}] = ${segment.sum}</strong></div>
      <div class="${valid ? "valid" : "invalid"}"><small>${vi ? "ĐIỀU KIỆN KHÔNG GIẢM" : "NONDECREASING CHECK"}</small><strong>${segment.sum} ≥ last[${segment.start}] = ${segment.previousLast} ${valid ? "✓" : "×"}</strong></div>`;
  } else if (view.compare >= 0 && view.current > 0) {
    equationHtml = `<div><small>${vi ? "CANDIDATE KẾ TIẾP" : "NEXT CANDIDATE"}</small><strong>j = ${view.compare}</strong></div>
      <div><small>${vi ? "KIỂM TRA HỢP LỆ" : "VALIDITY CHECK"}</small><strong>need[${view.compare}] = ${need[view.compare]} ≤ P[${view.current}] = ${prefix[view.current]}</strong></div>`;
  }
  const partitionHtml = partition.length
    ? `<section class="ndp-partition"><header><strong>${vi ? "MỘT CÁCH CHIA TỐI ƯU" : "ONE OPTIMAL PARTITION"}</strong><span>${partition.length} ${vi ? "đoạn" : "segments"}</span></header><div>${partition.map((part, index) => `<span><small>${vi ? "đoạn" : "segment"} ${index + 1}</small><strong>[${part.values.join(", ")}]</strong><em>sum = ${part.sum}</em></span>`).join("<b>≤</b>")}</div></section>`
    : "";
  const summary = vi
    ? `DP prefix và deque đơn điệu cho ${nums.length} phần tử; đang xử lý prefix ${view.current || 0}.`
    : `Prefix DP and monotonic deque for ${nums.length} values; processing prefix ${view.current || 0}.`;

  $("treeView").innerHTML = `<section class="ndp-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="ndp-phases">${phaseHtml}</div>
    <div class="ndp-rule"><strong>need[j] = prefix[j] + last[j]</strong><span>${vi ? "Có thể nối j → i khi prefix[i] ≥ need[j]." : "Cut j can extend to i when prefix[i] ≥ need[j]."}</span></div>
    <section class="ndp-prefix"><header><strong>PREFIX STATE TABLE</strong><span>${vi ? "ô tím: i hiện tại · viền xanh: candidate trong deque" : "purple: current i · green border: deque candidate"}</span></header><div>${prefixHtml}</div></section>
    <section class="ndp-equation">${equationHtml}</section>
    <section class="ndp-deque"><header><strong>MONOTONIC DEQUE</strong><span>${vi ? "need tăng dần từ FRONT tới REAR" : "need increases from FRONT to REAR"}</span></header><div>${dequeHtml}</div></section>
    ${partitionHtml}
    <div class="ndp-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
  </section>`;
}

function renderBoundaryMaxView(step) {
  const view = step.boundaryMaxView || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const equalStarts = new Set(Array.isArray(view.equalStarts) ? view.equalStarts : []);
  const poppedIndices = new Set(view.popped && Array.isArray(view.popped.indices) ? view.popped.indices : []);
  const newRanges = Array.isArray(view.newRanges) ? view.newRanges : [];
  const allRanges = Array.isArray(view.allRanges) ? view.allRanges : [];
  const aliveIndices = new Set(stack.flatMap((entry) => Array.isArray(entry.indices) ? entry.indices : []));
  const phaseGroup = view.phase === "rule"
    ? "rule"
    : view.phase === "inspect" || view.phase === "pop"
      ? "filter"
      : view.phase === "push" || view.phase === "match"
        ? "pair"
        : view.phase === "count"
          ? "add"
          : "result";
  const phases = [
    ["rule", vi ? "1. Hiểu điều kiện" : "1. Understand rule"],
    ["filter", vi ? "2. Pop số nhỏ" : "2. Pop smaller"],
    ["pair", vi ? "3. Ghép hai biên" : "3. Pair boundaries"],
    ["add", vi ? "4. Cộng đoạn mới" : "4. Add new ranges"],
    ["result", vi ? "5. Kết quả" : "5. Result"],
  ].map(([key, label]) => `<span class="${phaseGroup === key ? "active" : ""}">${label}</span>`).join("");

  const inputHtml = nums.map((value, index) => {
    const classes = ["bmax-number"];
    let tag = index < current ? (vi ? "đã xét" : "seen") : "";
    if (aliveIndices.has(index)) classes.push("alive");
    if (poppedIndices.has(index)) {
      classes.push("popped");
      tag = "POP";
    }
    if (equalStarts.has(index)) {
      classes.push("left-boundary");
      tag = vi ? "BIÊN TRÁI" : "LEFT";
    }
    if (index === current) {
      classes.push("current");
      tag = vi ? "BIÊN PHẢI" : "RIGHT";
    }
    return `<div class="${classes.join(" ")}"><small>i = ${index}</small><strong>${escapeHtml(String(value))}</strong><span>${tag}</span></div>`;
  }).join("");

  const stackHtml = stack.length
    ? stack.map((entry, index) => {
        const isTop = index === stack.length - 1;
        const indices = Array.isArray(entry.indices) ? entry.indices : [];
        return `<div class="bmax-stack-group${isTop ? " top" : ""}">
          <small>${isTop ? "TOP" : vi ? "NHÓM" : "GROUP"}</small>
          <strong>value = ${escapeHtml(String(entry.value))}</strong>
          <span>count = ${escapeHtml(String(entry.count))}</span>
          <em>index: ${indices.map((item) => escapeHtml(String(item))).join(", ")}</em>
        </div>`;
      }).join("<b class=\"bmax-stack-arrow\">→</b>")
    : `<em class="bmax-empty">${vi ? "Stack đang rỗng" : "The stack is empty"}</em>`;

  const rangeChip = (range, fresh = false) => {
    const values = Array.isArray(range.values) ? range.values : [];
    return `<span class="bmax-range${fresh ? " fresh" : ""}">
      <small>[${range.start}..${range.end}]</small>
      <strong>[${values.map((value) => escapeHtml(String(value))).join(", ")}]</strong>
    </span>`;
  };
  const newRangesHtml = newRanges.length
    ? newRanges.map((range) => rangeChip(range, true)).join("")
    : `<em class="bmax-empty">${view.phase === "rule"
      ? (vi ? "Chưa xét phần tử nào" : "No value processed yet")
      : view.phase === "result"
        ? (vi ? "Đã duyệt xong toàn bộ mảng" : "The full array has been processed")
        : (vi ? "Chưa tạo đoạn mới ở bước này" : "No new range in this step")}</em>`;
  const allRangesHtml = allRanges.length
    ? allRanges.map((range) => rangeChip(range)).join("")
    : `<em class="bmax-empty">${vi ? "Danh sách đang rỗng" : "The list is empty"}</em>`;
  const poppedHtml = view.popped
    ? `<div class="bmax-pop-note"><small>POP</small><strong>${view.popped.value} × ${view.popped.count}</strong><span>${vi ? `bị chặn bởi nums[${current}] = ${nums[current]}` : `blocked by nums[${current}] = ${nums[current]}`}</span></div>`
    : "";
  const equation = view.phase === "count"
    ? `<strong>${view.ansBefore} + ${view.added} = ${view.ansAfter}</strong><span>${vi ? "ans trước + số đoạn mới = ans sau" : "previous ans + new ranges = next ans"}</span>`
    : view.phase === "result"
      ? `<strong>ans = ${view.ansAfter}</strong><span>${vi ? "Tổng số subarray hợp lệ" : "Total valid subarrays"}</span>`
      : `<strong>ans = ${view.ansAfter}</strong><span>${vi ? "Chỉ tăng ở bước 4" : "Only changes in step 4"}</span>`;
  const summary = vi
    ? `Đếm subarray có hai biên là maximum; đáp án hiện tại ${view.ansAfter}.`
    : `Counting subarrays whose boundaries are maximum; current answer ${view.ansAfter}.`;

  $("treeView").innerHTML = `<section class="bmax-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="bmax-phases">${phases}</div>
    <div class="bmax-rule">
      <strong>nums[L] = nums[R] = max(nums[L..R])</strong>
      <span>${vi ? "Mỗi [i..i] luôn hợp lệ. Muốn có đoạn dài hơn, tìm biên trái cùng giá trị và không có số lớn hơn nằm giữa." : "Every [i..i] is valid. For a longer range, find an equal left boundary with no larger value in between."}</span>
    </div>
    <section class="bmax-input"><header><strong>nums</strong><span>${vi ? "vàng: biên trái · tím: biên phải · đỏ: vừa bị pop" : "yellow: left · purple: right · red: just popped"}</span></header><div>${inputHtml}</div></section>
    <div class="bmax-work">
      <section class="bmax-stack"><header><strong>${vi ? "STACK GIẢM DẦN" : "DECREASING STACK"}</strong><span>${vi ? "đáy → top" : "bottom → top"}</span></header><div>${stackHtml}</div>${poppedHtml}</section>
      <section class="bmax-new"><header><strong>${vi ? "SUBARRAY MỚI KẾT THÚC TẠI i" : "NEW SUBARRAYS ENDING AT i"}</strong><span>${newRanges.length} ${vi ? "đoạn" : "ranges"}</span></header><div class="bmax-ranges">${newRangesHtml}</div><div class="bmax-equation">${equation}</div></section>
    </div>
    <section class="bmax-all"><header><strong>${vi ? "TẤT CẢ ĐOẠN ĐÃ ĐẾM" : "ALL COUNTED RANGES"}</strong><span>${allRanges.length} = ans</span></header><div class="bmax-ranges">${allRangesHtml}</div></section>
    <div class="bmax-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
  </section>`;
}

function renderSortedSubmatrixView(step) {
  const view = step.sortedSubmatrixView || {};
  const vi = lang === "vi";
  const grid = Array.isArray(view.grid) ? view.grid : [];
  const widths = Array.isArray(view.widths) ? view.widths : [];
  const endpointAdds = Array.isArray(view.endpointAdds) ? view.endpointAdds : [];
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const candidates = Array.isArray(view.candidates) ? view.candidates : [];
  const current = Array.isArray(view.current) ? view.current : null;
  const currentRow = current ? current[0] : -1;
  const currentCol = current ? current[1] : -1;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const segmentCells = new Set((view.rowSegment || []).map((cell) => `${cell[0]}:${cell[1]}`));
  const phaseGroup = view.phase === "width"
    ? "width"
    : view.phase === "pop"
      ? "stack"
      : view.phase === "count"
        ? "count"
        : view.phase === "result"
          ? "result"
          : "condition";
  const phases = [
    ["condition", vi ? "1. Kiểm tra ô" : "1. Check cell"],
    ["width", vi ? "2. Tính row width" : "2. Compute row width"],
    ["stack", vi ? "3. Cập nhật stack cột" : "3. Update column stack"],
    ["count", vi ? "4. Đếm theo góc phải-dưới" : "4. Count by bottom-right"],
    ["result", vi ? "5. Kết quả" : "5. Result"],
  ].map(([key, label]) => `<span class="${phaseGroup === key ? "active" : ""}">${label}</span>`).join("");

  const matrixHtml = grid.flatMap((rowValues, row) => rowValues.map((value, col) => {
    const width = widths[row]?.[col] || 0;
    const contribution = endpointAdds[row]?.[col] || 0;
    const classes = ["sortmat-cell"];
    if (value > view.k) classes.push("blocked");
    else if (width > 0) classes.push("ready");
    if (col === view.activeColumn) classes.push("active-column");
    if (segmentCells.has(`${row}:${col}`)) classes.push("row-segment");
    if (row === currentRow && col === currentCol) classes.push("current");
    return `<div class="${classes.join(" ")}">
      <small>[${row},${col}]</small>
      <strong>${escapeHtml(String(value))}</strong>
      <span>${value > view.k ? `> k` : width ? `width = ${width}` : "width = —"}</span>
      <em>${contribution ? `+${contribution} rect` : ""}</em>
    </div>`;
  })).join("");

  const stackHtml = stack.length
    ? stack.map((item, index) => {
        const sentinel = item.width === 0;
        const isTop = index === stack.length - 1;
        return `<div class="sortmat-stack-item${sentinel ? " sentinel" : ""}${isTop ? " top" : ""}">
          <small>${sentinel ? "SENTINEL" : isTop ? "TOP" : vi ? "NHÓM" : "GROUP"}</small>
          <strong>width = ${item.width}</strong>
          <span>row = ${item.row}</span>
          <em>acc = ${item.acc}</em>
        </div>`;
      }).join("<b class=\"sortmat-arrow\">→</b>")
    : `<em class="sortmat-empty">${vi ? "Chọn một ô để xem stack của cột" : "Select a cell to see its column stack"}</em>`;
  const poppedHtml = view.popped
    ? `<div class="sortmat-popped"><small>POP</small><strong>width ${view.popped.width}</strong><span>${vi ? `vì width hiện tại nhỏ hơn ${view.popped.width}` : `because the current width is smaller than ${view.popped.width}`}</span></div>`
    : "";

  const candidateHtml = candidates.length
    ? candidates.map((candidate) => `<div class="sortmat-candidate">
        <small>${vi ? "hàng trên" : "top"} = ${candidate.top} → ${vi ? "hàng dưới" : "bottom"} = ${candidate.bottom}</small>
        <strong>min width = ${candidate.minWidth}</strong>
        <span>${candidate.choices} ${vi ? "cách chọn biên trái" : "left-boundary choices"}</span>
      </div>`).join("")
    : `<em class="sortmat-empty">${view.phase === "result"
      ? (vi ? "Đã đếm xong mọi góc phải-dưới" : "Every bottom-right corner has been counted")
      : view.blocked
        ? (vi ? "Ô bị chặn nên đóng góp 0" : "Blocked cell contributes 0")
        : (vi ? "Các top row sẽ xuất hiện ở bước đếm" : "Top rows appear during the counting step")}</em>`;
  const rectangles = candidates.flatMap((candidate) => candidate.rectangles || []);
  const rectangleHtml = rectangles.length
    ? rectangles.map((rectangle) => `<span class="sortmat-rectangle">
        <small>${vi ? "hàng" : "rows"} ${rectangle.top}..${rectangle.bottom}</small>
        <strong>${vi ? "cột" : "cols"} ${rectangle.left}..${rectangle.right}</strong>
      </span>`).join("")
    : `<em class="sortmat-empty">${vi ? "Chưa có rectangle mới ở frame này" : "No new rectangle in this frame"}</em>`;

  let equationHtml = `<strong>ans = ${view.ansAfter}</strong><span>${vi ? "Đáp án chỉ tăng ở bước 4" : "The answer changes only in step 4"}</span>`;
  if (view.formula) {
    const f = view.formula;
    equationHtml = `<div><small>${vi ? "ĐÓNG GÓP TẠI Ô" : "ENDING HERE"}</small><strong>${f.inherited} + ${f.width} × ${f.height} = ${f.added}</strong><span>top.acc + width × height</span></div>
      <div><small>${vi ? "ĐÁP ÁN TÍCH LŨY" : "RUNNING ANSWER"}</small><strong>${view.ansBefore} + ${view.added} = ${view.ansAfter}</strong><span>ans + endingHere</span></div>`;
  } else if (view.phase === "width" && current) {
    equationHtml = `<strong>width[${currentRow}][${currentCol}] = ${widths[currentRow]?.[currentCol] || 0}</strong><span>${view.canExtend ? (vi ? "nối được với suffix bên trái" : "extends the suffix on the left") : (vi ? "bắt đầu suffix mới" : "starts a new suffix")}</span>`;
  } else if (view.phase === "reset" && current) {
    equationHtml = `<strong>${grid[currentRow][currentCol]} > k=${view.k} → width = 0</strong><span>${vi ? "reset stack cột hiện tại" : "reset the current column stack"}</span>`;
  } else if (view.phase === "pop" && view.popped) {
    equationHtml = `<strong>${widths[currentRow]?.[currentCol] || 0} < ${view.popped.width} → POP</strong><span>${vi ? "hàng dưới thu hẹp mọi rectangle kéo xuống" : "the lower row narrows every rectangle extended downward"}</span>`;
  } else if (view.phase === "result") {
    equationHtml = `<strong>ans = ${view.ansAfter}</strong><span>${vi ? "Tổng tất cả số +rect trong ma trận" : "Sum of every +rect value in the matrix"}</span>`;
  }

  const currentLabel = current
    ? `(${currentRow},${currentCol}) = ${grid[currentRow][currentCol]}`
    : "—";
  const summary = vi
    ? `Đếm sorted submatrix với k=${view.k}; đáp án hiện tại ${view.ansAfter}.`
    : `Counting sorted submatrices with k=${view.k}; current answer ${view.ansAfter}.`;

  $("treeView").innerHTML = `<section class="sortmat-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="sortmat-phases">${phases}</div>
    <div class="sortmat-rule"><strong>width[r][c] = ${vi ? "suffix không tăng dài nhất kết thúc tại c" : "longest non-increasing suffix ending at c"}</strong><span>${vi ? "Cố định góc phải-dưới: mỗi cách chọn hàng trên cùng đóng góp min(width) từ hàng đó xuống hàng dưới." : "Fix the bottom-right corner: each top row contributes the minimum width among the rectangle's rows."}</span></div>
    <div class="sortmat-main">
      <section class="sortmat-matrix"><header><strong>GRID / ROW WIDTH / +RECT</strong><span>k = ${view.k} · ${vi ? "viền tím: ô hiện tại" : "purple: current cell"}</span></header><div style="--sortmat-cols:${cols}">${matrixHtml}</div></section>
      <section class="sortmat-state"><header><strong>${vi ? "TRẠNG THÁI HIỆN TẠI" : "CURRENT STATE"}</strong><span>${currentLabel}</span></header><div class="sortmat-equation">${equationHtml}</div><div class="sortmat-legend"><span><i class="segment"></i>${vi ? "row suffix" : "row suffix"}</span><span><i class="column"></i>${vi ? "cột đang xét" : "active column"}</span><span><i class="blocked"></i>${vi ? "giá trị > k" : "value > k"}</span></div></section>
    </div>
    <section class="sortmat-stack"><header><strong>${vi ? `STACK TĂNG CỦA CỘT ${view.activeColumn >= 0 ? view.activeColumn : "—"}` : `INCREASING STACK FOR COLUMN ${view.activeColumn >= 0 ? view.activeColumn : "—"}`}</strong><span>${vi ? "đáy → top · acc = số rectangle kết thúc trong cột" : "bottom → top · acc = rectangles ending in this column"}</span></header><div>${stackHtml}</div>${poppedHtml}</section>
    <section class="sortmat-candidates"><header><strong>${vi ? "MỖI HÀNG TRÊN CÙNG ĐÓNG GÓP min(width)" : "EACH TOP ROW CONTRIBUTES min(width)"}</strong><span>${candidates.reduce((sum, item) => sum + item.choices, 0)} ${vi ? "rectangle mới" : "new rectangles"}</span></header><div>${candidateHtml}</div></section>
    <section class="sortmat-rectangles"><header><strong>${vi ? "CÁC RECTANGLE VỪA ĐƯỢC CỘNG" : "RECTANGLES ADDED IN THIS STEP"}</strong><span>${rectangles.length}</span></header><div>${rectangleHtml}</div></section>
    <div class="sortmat-action"><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></div>
  </section>`;
}

function renderCircularDequeView(step) {
  const view = step.circularDequeView || {};
  const buffer = Array.isArray(view.buffer) ? view.buffer : [];
  const capacity = Math.max(Number(view.capacity) || buffer.length, 1);
  const front = Number.isInteger(view.front) ? view.front : -1;
  const rear = Number.isInteger(view.rear) ? view.rear : -1;
  const active = Number.isInteger(view.active) ? view.active : -1;
  const size = Math.max(Number(view.size) || 0, 0);
  const cx = 210;
  const cy = 190;
  const radius = capacity <= 6 ? 112 : 125;
  const cellRadius = Math.max(25, Math.min(36, 104 / Math.sqrt(capacity)));

  const point = (idx, extra = 0) => {
    const angle = -Math.PI / 2 + (idx * Math.PI * 2) / capacity;
    return { x: cx + Math.cos(angle) * (radius + extra), y: cy + Math.sin(angle) * (radius + extra) };
  };

  const logicalPosition = (idx) => {
    if (size === 0 || front < 0) return -1;
    const offset = (idx - front + capacity) % capacity;
    return offset < size ? offset : -1;
  };

  const cells = Array.from({ length: capacity }, (_, idx) => {
    const p = point(idx);
    const value = buffer[idx];
    const occupied = value !== null && value !== undefined;
    const logical = logicalPosition(idx);
    const classes = ["cdeque-cell", occupied ? "occupied" : "empty", idx === active ? "active" : ""].filter(Boolean).join(" ");
    return `<g class="${classes}" transform="translate(${p.x} ${p.y})">
      <circle r="${cellRadius}"></circle>
      <text class="cdeque-value" text-anchor="middle" y="5">${occupied ? escapeXml(String(value)) : "∅"}</text>
      <text class="cdeque-index" text-anchor="middle" y="${cellRadius + 16}">[${idx}]${logical >= 0 ? ` · #${logical}` : ""}</text>
    </g>`;
  }).join("");

  const pointer = (idx, label, kind, shift) => {
    if (idx < 0) return "";
    const start = point(idx, cellRadius + 48 + shift);
    const end = point(idx, cellRadius + 8);
    return `<g class="cdeque-pointer ${kind}">
      <line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" marker-end="url(#cdeque-arrow)"></line>
      <text x="${start.x}" y="${start.y - 7}" text-anchor="middle">${label}</text>
    </g>`;
  };

  const rearShift = rear === front && size > 0 ? 24 : 0;
  $("treeView").innerHTML = `<div class="cdeque-viz">
    <svg viewBox="0 0 420 380" role="img" aria-label="Circular deque with ${size} of ${capacity} slots occupied">
      <defs><marker id="cdeque-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs>
      <circle class="cdeque-track" cx="${cx}" cy="${cy}" r="${radius}"></circle>
      ${cells}
      ${size > 0 ? pointer(front, "FRONT", "front", 0) : ""}
      ${size > 0 ? pointer(rear, "REAR", "rear", rearShift) : ""}
      <text class="cdeque-center-main" x="${cx}" y="${cy - 5}" text-anchor="middle">size ${size} / ${capacity}</text>
      <text class="cdeque-center-sub" x="${cx}" y="${cy + 20}" text-anchor="middle">clockwise = front → rear</text>
    </svg>
  </div>`;
}

function renderCalculator772View(step) {
  const view = step.calculator772View || {};
  const chars = Array.isArray(view.chars) ? view.chars : String(view.expression || "").split("");
  const i = Number.isInteger(view.i) ? view.i : -1;
  const value = view.value === null || view.value === undefined ? "-" : view.value;
  const numbers = Array.isArray(view.numbers) ? view.numbers : [];
  const operators = Array.isArray(view.operators) ? view.operators : [];
  const operation = view.operation || "-";
  const result = view.result === null || view.result === undefined ? "-" : view.result;
  const finished = view.result !== null && view.result !== undefined;
  const allDone = i >= chars.length;

  const stackHtml = (title, items, emptyLabel) => {
    const cells = items.length
      ? items
          .map((item, idx) => {
            const isTop = idx === items.length - 1;
            return `<div class="stack-cell${isTop ? " top" : ""}">
              <span class="stack-cell-content"><span class="stack-value">${escapeHtml(String(item))}</span></span>
              ${isTop ? `<span class="stack-tag">top</span>` : ""}
            </div>`;
          })
          .join("")
      : `<div class="stack-empty">${escapeHtml(emptyLabel)}</div>`;
    return `<div class="stack-panel">
      <div class="stack-title">${escapeHtml(title)}</div>
      <div class="stack-container">${cells}</div>
      <div class="stack-base"></div>
    </div>`;
  };

  const kind = (c) =>
    /^\d$/.test(c) ? "" : c === "(" || c === ")" ? " paren" : " op";

  const charRow = chars
    .map((c, idx) => {
      const cls = finished || allDone || (i >= 0 && idx < i)
        ? " done"
        : idx === i
          ? " current"
          : "";
      return `<div class="stack-input-token${kind(String(c))}${cls}">
        <span>${escapeHtml(String(c))}</span><small>${idx}</small>
      </div>`;
    })
    .join("");

  const iLabel = i < 0
    ? pick({ vi: "–", en: "–" })
    : i >= chars.length
      ? `${i} (= len)`
      : `${i} ('${chars[i]}')`;
  const exprText = String(view.originalExpression || view.expression || "");

  $("treeView").innerHTML = `
    <div class="calc772-viz">
      <div>
        <div class="stack-input-label">${escapeHtml(pick({ vi: `Biểu thức: ${exprText} · con trỏ i`, en: `Expression: ${exprText} · pointer i` }))}</div>
        <div class="stack-input-row calc772-tokens">${charRow || `<div class="stack-empty">${escapeHtml(pick({ vi: "trống", en: "empty" }))}</div>`}</div>
      </div>
      <div class="calc772-stacks">
        ${stackHtml("nums", numbers, pick({ vi: "rỗng", en: "empty" }))}
        ${stackHtml("ops", operators, pick({ vi: "rỗng", en: "empty" }))}
        <div class="stack-side">
          <div class="stack-status">
            <div><span>i</span><strong>${escapeHtml(iLabel)}</strong></div>
            <div><span>value</span><strong>${escapeHtml(String(value))}</strong></div>
            <div><span>${escapeHtml(pick({ vi: "dòng lệnh", en: "statement" }))}</span><strong>${escapeHtml(String(operation))}</strong></div>
            <div><span>${escapeHtml(pick({ vi: "kết quả", en: "result" }))}</span><strong>${escapeHtml(String(result))}</strong></div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderCalculator772BView(step) {
  const view = step.calculator772bView || {};
  const chars = Array.isArray(view.chars) ? view.chars : String(view.expression || "").split("");
  const i = Number.isInteger(view.i) ? view.i : -1;
  const num = view.num === null || view.num === undefined ? "-" : view.num;
  const prevOp = view.prevOp === null || view.prevOp === undefined ? "-" : view.prevOp;
  const stack = Array.isArray(view.stack) ? view.stack : [];
  const operation = view.operation || "-";
  const result = view.result === null || view.result === undefined ? "-" : view.result;
  const finished = view.result !== null && view.result !== undefined;

  const cells = stack.length
    ? stack
        .map((item, idx) => {
          const isTop = idx === stack.length - 1;
          const isOp = typeof item !== "number";
          return `<div class="stack-cell${isTop ? " top" : ""}${isOp ? " op-cell" : ""}">
            <span class="stack-cell-content"><span class="stack-value">${escapeHtml(isOp ? `'${item}'` : String(item))}</span></span>
            ${isTop ? `<span class="stack-tag">top</span>` : ""}
          </div>`;
        })
        .join("")
    : `<div class="stack-empty">${escapeHtml(pick({ vi: "rỗng", en: "empty" }))}</div>`;

  const kind = (c) =>
    /^\d$/.test(c) ? "" : c === "(" || c === ")" ? " paren" : " op";

  const charRow = chars
    .map((c, idx) => {
      const cls = finished || (i >= 0 && idx < i) ? " done" : idx === i ? " current" : "";
      return `<div class="stack-input-token${kind(String(c))}${cls}">
        <span>${escapeHtml(String(c))}</span><small>${idx}</small>
      </div>`;
    })
    .join("");

  const exprText = String(view.originalExpression || view.expression || "");

  $("treeView").innerHTML = `
    <div class="calc772-viz calc772b-viz">
      <div>
        <div class="stack-input-label">${escapeHtml(pick({ vi: `Biểu thức: ${exprText} · ký tự ch`, en: `Expression: ${exprText} · char ch` }))}</div>
        <div class="stack-input-row calc772-tokens">${charRow || `<div class="stack-empty">${escapeHtml(pick({ vi: "trống", en: "empty" }))}</div>`}</div>
      </div>
      <div class="calc772-stacks">
        <div class="stack-panel">
          <div class="stack-title">stack ${escapeHtml(pick({ vi: "(số có dấu + toán tử)", en: "(signed numbers + ops)" }))}</div>
          <div class="stack-container">${cells}</div>
          <div class="stack-base"></div>
        </div>
        <div class="stack-side">
          <div class="stack-status">
            <div><span>num</span><strong>${escapeHtml(String(num))}</strong></div>
            <div><span>prev_op</span><strong>${escapeHtml(String(prevOp))}</strong></div>
            <div><span>${escapeHtml(pick({ vi: "dòng lệnh", en: "statement" }))}</span><strong>${escapeHtml(String(operation))}</strong></div>
            <div><span>${escapeHtml(pick({ vi: "kết quả", en: "result" }))}</span><strong>${escapeHtml(String(result))}</strong></div>
          </div>
        </div>
      </div>
    </div>`;
}
function renderCamera968View(step) {
  const view = step.camera968View || {};
  const nodes = Array.isArray(view.nodes) ? view.nodes : [];
  const cams = new Set(view.cameraIds || []);
  const covered = new Set(view.coveredIds || []);
  const states = view.states || {};
  const currentId = view.currentId;
  const answer = view.answer;

  // Tidy layout: x = inorder position, y = depth.
  const order = [];
  const inorder = (id) => {
    if (id == null) return;
    const nd = nodes.find((n) => n.id === id);
    if (!nd) return;
    inorder(nd.leftId);
    order.push(id);
    inorder(nd.rightId);
  };
  if (nodes.length) inorder(nodes[0].parentId != null ? nodes.find((n) => n.parentId == null).id : nodes[0].id);
  const xPos = new Map(order.map((id, i) => [id, i]));
  const maxDepth = Math.max(1, ...nodes.map((n) => n.depth));
  const W = Math.max(order.length * 64, 240);
  const H = (maxDepth + 1) * 74 + 30;
  const px = (nd) => ({ x: ((xPos.get(nd.id) ?? 0) + 0.5) * (W / Math.max(order.length, 1)), y: 36 + nd.depth * 74 });

  const edges = nodes.map((nd) => {
    const p = px(nd);
    return [nd.leftId, nd.rightId].map((cid) => {
      if (cid == null) return "";
      const child = nodes.find((n) => n.id === cid);
      const c = px(child);
      return `<line class="cam968-edge${covered.has(cid) && covered.has(nd.id) ? " lit" : ""}" x1="${p.x}" y1="${p.y}" x2="${c.x}" y2="${c.y}"></line>`;
    }).join("");
  }).join("");

  const circles = nodes.map((nd) => {
    const p = px(nd);
    const st = states[nd.id];
    const cls = st === 1 ? "cam" : st === 2 ? "ok" : st === 0 ? "need" : "idle";
    const icon = st === 1 ? "📷" : "";
    return `<g class="cam968-node ${cls}${nd.id === currentId ? " current" : ""}" transform="translate(${p.x} ${p.y})">
      <circle r="21"></circle>
      <text class="cam968-val" y="4">${escapeHtml(String(nd.val))}</text>
      ${icon ? `<text class="cam968-icon" x="14" y="-12">${icon}</text>` : ""}
    </g>`;
  }).join("");

  $("treeView").innerHTML = `
    <div class="calc772-viz cam968-viz">
      <svg viewBox="0 0 ${W} ${H}" role="img">
        ${edges}${circles}
      </svg>
      <div class="stack-status cam968-status">
        <div><span>📷 cameras</span><strong>${cams.size}</strong></div>
        <div><span>${escapeHtml(pick({ vi: "đang xử lý", en: "processing" }))}</span><strong>${escapeHtml(currentId != null ? String(nodes.find((n) => n.id === currentId)?.val ?? "-") : "-")}</strong></div>
        <div><span>${escapeHtml(pick({ vi: "được cover", en: "covered" }))}</span><strong>${covered.size}/${nodes.length}</strong></div>
        <div><span>${escapeHtml(pick({ vi: "kết quả", en: "result" }))}</span><strong>${escapeHtml(answer == null ? "-" : String(answer))}</strong></div>
      </div>
      <div class="cam968-legend">
        <span class="cam968-key need"></span>${escapeHtml(pick({ vi: "cần camera", en: "needs camera" }))}
        <span class="cam968-key cam"></span>${escapeHtml(pick({ vi: "có camera", en: "has camera" }))}
        <span class="cam968-key ok"></span>${escapeHtml(pick({ vi: "đã cover", en: "covered" }))}
      </div>
    </div>`;
}

function renderMountain1095View(step) {
  const view = step.mountain1095View || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const target = view.target;
  const lo = Number.isInteger(view.lo) ? view.lo : -1;
  const hi = Number.isInteger(view.hi) ? view.hi : -1;
  const mid = Number.isInteger(view.mid) ? view.mid : null;
  const found = view.found;
  const peak = view.peak;
  const gets = view.gets ?? "-";
  const probed = new Set(view.probed || []);
  const finished = view.answer !== null && view.answer !== undefined;

  const maxVal = Math.max(...nums, 1);
  const bars = nums.map((v, idx) => {
    const inWindow = idx >= lo && idx <= hi;
    const hPct = Math.max(8, Math.round((v / maxVal) * 100));
    const cls = [
      "mtn-bar",
      idx === mid ? " mid" : "",
      idx === peak ? " peak" : "",
      finished && idx === view.answer ? " found" : "",
      probed.has(idx) ? " probed" : "",
      !probed.has(idx) ? " hidden-val" : "",
    ].join("");
    return `<div class="${cls}">
      <div class="mtn-fill" style="height:${hPct}%"><span>${escapeHtml(String(v))}</span></div>
      <small class="${inWindow ? " win" : ""}">${idx}</small>
    </div>`;
  }).join("");

  const pointerRow = nums.map((_, idx) => {
    const tags = [];
    if (idx === lo) tags.push("lo");
    if (idx === hi) tags.push("hi");
    if (idx === mid) tags.push("mid");
    if (idx === peak) tags.push("▲");
    return `<div class="mtn-ptr">${tags.map((t2) => `<em>${t2}</em>`).join("")}</div>`;
  }).join("");

  $("treeView").innerHTML = `
    <div class="calc772-viz mtn1095-viz">
      <div class="mtn-chart">${bars}</div>
      <div class="mtn-pointers">${pointerRow}</div>
      <div class="stack-status mtn-status">
        <div><span>lo</span><strong>${lo}</strong></div>
        <div><span>hi</span><strong>${hi}</strong></div>
        <div><span>mid</span><strong>${mid == null ? "-" : mid}</strong></div>
        <div><span>target</span><strong>${escapeHtml(String(target))}</strong></div>
        <div><span>get() calls</span><strong>${escapeHtml(String(gets))}</strong></div>
        <div><span>${escapeHtml(pick({ vi: "kết quả", en: "result" }))}</span><strong>${escapeHtml(finished ? String(view.answer) : "-")}</strong></div>
      </div>
  </div>`;
}

function renderTranspose867View(step) {
  const view = step.transpose867View || {};
  const vi = lang === "vi";
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const result = Array.isArray(view.result) ? view.result : [];
  const rows = Number(view.rows) || matrix.length;
  const cols = Number(view.cols) || (matrix[0] || []).length;
  const source = Array.isArray(view.source) ? view.source : null;
  const target = Array.isArray(view.target) ? view.target : null;
  const copied = new Set((view.copied || []).map(([row, col]) => `${row},${col}`));
  const phase = String(view.phase || "rows");
  const copiedCount = copied.size;
  const stageIndex = phase === "done" ? 3 : ["row", "column", "copy"].includes(phase) ? 1 : phase === "allocate" ? 0 : 0;
  const stages = [
    vi ? "Đọc kích thước" : "Read dimensions",
    vi ? "Đổi tọa độ" : "Swap coordinates",
    vi ? "Trả result" : "Return result",
  ].map((label, index) => {
    const state = phase === "done" || index < stageIndex ? "done" : index === stageIndex ? "active" : "pending";
    return `<span class="${state}"><small>${state === "done" ? "OK" : index + 1}</small><strong>${escapeHtml(label)}</strong></span>`;
  }).join("");

  const renderBoard = (data, kind, label, shape) => {
    const boardRows = data.length;
    const boardCols = data[0]?.length || 0;
    const cells = [`<span class="tr867-corner">r\\c</span>`];
    for (let col = 0; col < boardCols; col++) cells.push(`<span class="tr867-col">c=${col}</span>`);
    data.forEach((row, rowIndex) => {
      cells.push(`<span class="tr867-row">r=${rowIndex}</span>`);
      row.forEach((value, colIndex) => {
        const isSource = kind === "source" && source && source[0] === rowIndex && source[1] === colIndex;
        const isTarget = kind === "result" && target && target[0] === rowIndex && target[1] === colIndex;
        const wasCopied = kind === "source" && copied.has(`${rowIndex},${colIndex}`);
        const filled = value !== null && value !== undefined;
        const classes = ["tr867-cell", kind];
        if (isSource) classes.push("active-source");
        if (isTarget) classes.push("active-target");
        if (wasCopied) classes.push("copied");
        if (!filled) classes.push("empty");
        cells.push(`<span class="${classes.join(" ")}"><small>[${rowIndex},${colIndex}]</small><strong>${filled ? escapeHtml(String(value)) : "·"}</strong><em>${isSource ? "SOURCE" : isTarget ? "TARGET" : wasCopied ? "COPIED" : filled ? "" : "EMPTY"}</em></span>`);
      });
    });
    return `<section class="tr867-board ${kind}"><header><strong>${escapeHtml(label)}</strong><span>${shape}</span></header><div class="tr867-grid" style="--tr867-cols:${boardCols + 1}">${cells.join("")}</div></section>`;
  };

  const activeLine = Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const mapping = source && target
    ? `<section class="tr867-map active"><small>${vi ? "PHÉP GÁN ĐANG CHẠY" : "CURRENT ASSIGNMENT"}</small><strong>result[${target[0]}][${target[1]}] = matrix[${source[0]}][${source[1]}] = ${escapeHtml(String(matrix[source[0]][source[1]]))}</strong><span>(${source.join(",")}) &rarr; (${target.join(",")})</span></section>`
    : `<section class="tr867-map"><small>${vi ? "QUY TẮC CHUYỂN VỊ" : "TRANSPOSE RULE"}</small><strong>result[c][r] = matrix[r][c]</strong><span>(r,c) &rarr; (c,r)</span></section>`;
  const summary = vi
    ? `Transpose Matrix: đã sao chép ${copiedCount}/${rows * cols} ô.`
    : `Transpose Matrix: copied ${copiedCount}/${rows * cols} cells.`;

  $("treeView").innerHTML = `<section class="tr867-viz" role="img" aria-label="${escapeHtml(summary)}">
    <header><strong>TRANSPOSE MATRIX</strong><span>${rows} × ${cols} &rarr; ${cols} × ${rows}</span></header>
    <section class="tr867-stages">${stages}</section>
    <section class="tr867-action"><small>${vi ? "DÒNG" : "LINE"} ${activeLine ?? "—"} · ${escapeHtml(phase.toUpperCase())}</small><strong>${escapeHtml(pick(step.title))}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    ${mapping}
    <section class="tr867-boards">${renderBoard(matrix, "source", vi ? "MATRIX NGUỒN" : "SOURCE MATRIX", `${rows} × ${cols}`)}<div class="tr867-arrow" aria-hidden="true">&rarr;</div>${renderBoard(result, "result", vi ? "RESULT ĐÍCH" : "TARGET RESULT", `${cols} × ${rows}`)}</section>
    <section class="tr867-footer"><span><small>${vi ? "ĐÃ SAO CHÉP" : "COPIED"}</small><strong>${copiedCount} / ${rows * cols}</strong></span><span><small>${vi ? "CÔNG THỨC" : "FORMULA"}</small><strong>(r,c) &rarr; (c,r)</strong></span><span><small>${vi ? "KÍCH THƯỚC" : "SHAPE"}</small><strong>${cols} × ${rows}</strong></span></section>
  </section>`;
}

function renderTiling1240View(step) {
  const view = step.tiling1240View || {};
  const n = view.n ?? 0;
  const m = view.m ?? 0;
  const heights = Array.isArray(view.heights) ? view.heights : [];
  const done = view.phase === "done";
  const placements = done && Array.isArray(view.bestLayout) && view.bestLayout.length
    ? view.bestLayout
    : Array.isArray(view.placements) ? view.placements : [];

  // Paint coverage grid.
  const cover = Array.from({ length: n }, () => Array(m).fill(-1));
  placements.forEach(({ row, col, size }, sqIndex) => {
    for (let rr = row; rr < Math.min(n, row + size); rr++) {
      for (let cc = col; cc < Math.min(m, col + size); cc++) {
        if (rr >= 0 && rr < n && cc >= 0 && cc < m) cover[rr][cc] = sqIndex;
      }
    }
  });

  const hueOf = (sqIndex) => `hsl(${(sqIndex * 67 + 210) % 360} 65% 52%)`;
  const grid = Array.from({ length: n }, (_, rr) =>
    Array.from({ length: m }, (_, cc) => {
      const owner = cover[rr]?.[cc] ?? -1;
      const style = owner >= 0 ? `background:${hueOf(owner)}` : "";
      return `<div class="tlg-cell${owner >= 0 ? " filled" : ""}" style="${style}"></div>`;
    }).join(""),
  ).join("");

  const heightsRow = heights.map((h) => `<div class="tlg-h"><span>${h}</span></div>`).join("");

  $("treeView").innerHTML = `
    <div class="calc772-viz tlg1240-viz">
      <div class="tlg-frame">
        <div class="tlg-grid" style="grid-template-columns:repeat(${m}, 1fr);grid-template-rows:repeat(${n}, 1fr)">${grid}</div>
        <div class="tlg-heights" style="grid-template-columns:repeat(${m}, 1fr)">${heightsRow}</div>
      </div>
      <div class="stack-status tlg-status">
        <div><span>n × m</span><strong>${n} × ${m}</strong></div>
        <div><span>count</span><strong>${view.count ?? 0}</strong></div>
        <div><span>best</span><strong>${view.best == null ? "-" : view.best}</strong></div>
        <div><span>${escapeHtml(pick({ vi: "đặt sẵn", en: "on path" }))}</span><strong>${placements.length}</strong></div>
      </div>
    </div>`;
}

function renderStudents1349View(step) {
  const view = step.students1349View || {};
  const seatRows = Array.isArray(view.seatRows) ? view.seatRows : [];
  const width = view.width ?? 0;
  const currentRow = Number.isInteger(view.currentRow) ? view.currentRow : -1;
  const candMask = Number.isInteger(view.candidateMask) ? view.candidateMask : null;
  const prevMask = Number.isInteger(view.prevMask) ? view.prevMask : 0;
  const picks = Array.isArray(view.picks) ? view.picks : [];
  const accepted = Boolean(view.accepted);
  const finished = view.phase === "done";
  const bestTotal = Array.isArray(view.states) && view.states.length
    ? Math.max(...view.states.map((s) => s.total))
    : 0;

  const bitSet = (mask, c) => Number.isInteger(mask) && ((mask >> c) & 1) === 1;

  const body = seatRows.map((rowText, r) => {
    let rowMask = null;
    if (r < currentRow) rowMask = picks[r] ?? 0;
    else if (r === currentRow && finished) rowMask = picks[r] ?? 0;
    else if (r === currentRow && candMask != null && accepted) rowMask = candMask;
    const cells = rowText.split("").map((seat, c) => {
      const broken = seat === "#";
      const student = rowMask != null && bitSet(rowMask, c);
      const diagClash = r === currentRow && !finished && !accepted && candMask != null
        && bitSet(candMask, c)
        && (bitSet(prevMask, c - 1) || bitSet(prevMask, c + 1));
      const cls = [
        "stu-cell",
        broken ? " broken" : "",
        student ? " student" : "",
        diagClash ? " clash" : "",
      ].filter(Boolean).join("");
      return `<div class="${cls}">${broken ? "" : student ? "S" : ""}</div>`;
    }).join("");
    const label = `<div class="stu-rowlabel">${r === currentRow ? "▶" : "&nbsp;"} r${r}</div>`;
    return `<div class="stu-row">${label}<div class="stu-cells" style="grid-template-columns:repeat(${width}, 1fr)">${cells}</div></div>`;
  }).join("");

  const tableRows = (view.states || []).slice(0, 8).map((s) => {
    const cls = s.mask === candMask ? " hot" : s.mask === prevMask ? " prev" : "";
    return `<div class="stu-dprow${cls}"><code>${s.binary}</code><b>${s.total}</b></div>`;
  }).join("");

  $("treeView").innerHTML = `
    <div class="calc772-viz stu1349-viz">
      <div class="stu-board">${body}</div>
      <div class="stu-side">
        <div class="stack-input-label">dp {prev_mask → total}</div>
        <div class="stu-dptable">${tableRows || '<div class="stu-empty">∅</div>'}</div>
        <div class="stack-status stu-status">
          <div><span>${escapeHtml(pick({ vi: "hàng", en: "row" }))}</span><strong>${currentRow}</strong></div>
          <div><span>mask</span><strong>${candMask == null ? "-" : `0b${view.states?.find((s) => s.mask === candMask)?.binary ?? candMask.toString(2)}`}</strong></div>
          <div><span>prev</span><strong>${Number.isInteger(view.prevMask) ? `0b${binPad(view.prevMask, width)}` : "-"}</strong></div>
          <div><span>best</span><strong>${bestTotal}</strong></div>
        </div>
      </div>
    </div>`;
}

function renderSuperstring943View(step) {
  const view = step.superstring943View || {};
  const words = Array.isArray(view.words) ? view.words : [];
  const overlap = Array.isArray(view.overlap) ? view.overlap : [];
  const mask = Number.isInteger(view.mask) ? view.mask : 0;
  const bitOn = (index) => Boolean(mask & (1 << index));
  const phaseLabel = {
    prepare: pick({ vi: "Loại word da thua", en: "Prune contained words" }),
    overlap: pick({ vi: "Do overlap", en: "Measure overlap" }),
    seed: pick({ vi: "Khoi tao DP", en: "Seed DP" }),
    update: pick({ vi: "Noi them word", en: "Append word" }),
    done: pick({ vi: "Hoan tat", en: "Complete" }),
  }[view.phase] || String(view.phase || "DP");

  const wordCards = words.map((word, index) => {
    const classes = ["ss943-word", bitOn(index) ? "used" : "", index === view.last ? "source" : "", index === view.next ? "target" : ""].filter(Boolean).join(" ");
    return `<div class="${classes}"><small>word[${index}]</small><strong>${escapeHtml(word)}</strong><span>${bitOn(index) ? pick({ vi: "trong mask", en: "in mask" }) : pick({ vi: "chua dung", en: "not used" })}</span></div>`;
  }).join("");

  const overlapRows = words.map((word, row) => {
    const cells = words.map((_, col) => {
      const classes = ["ss943-overlap-cell", row === view.last && col === view.next ? "active" : "", row === col ? "same" : ""].filter(Boolean).join(" ");
      return `<div class="${classes}">${row === col ? "-" : (overlap[row]?.[col] ?? 0)}</div>`;
    }).join("");
    return `<div class="ss943-overlap-row" style="--ss943-cols:${words.length + 1}"><span>W${row}</span>${cells}</div>`;
  }).join("");
  const overlapHead = `<div class="ss943-overlap-row ss943-overlap-head" style="--ss943-cols:${words.length + 1}"><span>from / to</span>${words.map((_, index) => `<span>W${index}</span>`).join("")}</div>`;

  const endings = (Array.isArray(view.endings) ? view.endings : []).map((entry) => `<div class="ss943-ending${entry.last === view.next ? " active" : ""}"><small>end W${entry.last}</small><strong>${escapeHtml(String(entry.text))}</strong><span>${entry.length}</span></div>`).join("");
  const maskText = `0b${mask.toString(2).padStart(Math.max(words.length, 1), "0")}`;
  const mapping = view.last != null && view.next != null
    ? `<small>W${view.last} + suffix(W${view.next})</small><strong>${escapeHtml(words[view.last] || "?")} + ${escapeHtml(view.suffix || "")}</strong><span>${escapeHtml(view.candidate || "")}</span>`
    : `<small>state</small><strong>${escapeHtml(phaseLabel)}</strong><span>${escapeHtml(view.candidate || "")}</span>`;

  $("treeView").innerHTML = `
    <div class="ss943-viz">
      <header><strong>SHORTEST SUPERSTRING</strong><span>${escapeHtml(phaseLabel)}</span></header>
      <div class="ss943-words">${wordCards}</div>
      <div class="ss943-main">
        <section class="ss943-panel"><header><strong>OVERLAP TABLE</strong><span>Wrow -> Wcol</span></header><div class="ss943-overlap">${overlapHead}${overlapRows}</div></section>
        <section class="ss943-panel ss943-state"><header><strong>DP[mask][last]</strong><span>${maskText}</span></header><div class="ss943-map">${mapping}</div><div class="ss943-endings">${endings || `<div class="ss943-empty">${escapeHtml(pick({ vi: "Dang cho state DP", en: "Waiting for a DP state" }))}</div>`}</div></section>
      </div>
      <footer><span><small>mask</small><strong>${maskText}</strong></span><span><small>DP states</small><strong>${view.stateCount ?? 0}</strong></span><span class="${view.phase === "done" ? "answer" : ""}"><small>${escapeHtml(pick({ vi: "chuoi hien tai", en: "current string" }))}</small><strong>${escapeHtml(view.answer || view.candidate || "-")}</strong></span></footer>
    </div>`;
}

function renderGoodStrings1397View(step) {
  const view = step.goodStrings1397View || {};
  const lower = String(view.lower || "");
  const upper = String(view.upper || "");
  const evil = String(view.evil || "");
  const pos = Number.isInteger(view.pos) ? view.pos : 0;
  const prefix = String(view.prefix || "");
  const bound = (label, text, kind) => `<div class="good1397-bound ${kind}"><small>${label}</small><div>${[...text].map((char, index) => `<span class="${index === pos ? "cursor" : index < prefix.length ? "fixed" : ""}">${escapeHtml(char)}</span>`).join("")}</div></div>`;
  const pattern = [...evil].map((char, index) => `<span class="${index < (view.matched || 0) ? "matched" : ""}"><b>${escapeHtml(char)}</b><small>${view.lps?.[index] ?? 0}</small></span>`).join("");
  const state = [
    ["pos", pos],
    ["match", `${view.matched ?? 0}/${evil.length}`],
    ["low", view.tightLow ? "T" : "F"],
    ["high", view.tightHigh ? "T" : "F"],
  ].map(([label, value]) => `<span><small>${label}</small><strong>${escapeHtml(String(value))}</strong></span>`).join("");
  const memoRows = (Array.isArray(view.memoEntries) ? view.memoEntries : []).map((entry) => `<div class="good1397-memo"><code>(${entry.pos},${entry.matched},${entry.tightLow ? 1 : 0},${entry.tightHigh ? 1 : 0})</code><strong>${entry.value}</strong></div>`).join("");
  const action = view.phase === "blocked"
    ? pick({ vi: `Them '${view.char}' se tao evil: bo nhanh.`, en: `Adding '${view.char}' completes evil: skip it.` })
    : view.phase === "add"
      ? pick({ vi: `Chon '${view.char}' -> match ${view.nextMatched}; cong vao tong.`, en: `Choose '${view.char}' -> match ${view.nextMatched}; add its count.` })
      : view.phase === "done"
        ? pick({ vi: "Da dem xong tat ca good strings.", en: "All good strings are counted." })
        : pick({ vi: "KMP theo doi prefix evil dang khop.", en: "KMP tracks the matching evil prefix." });

  $("treeView").innerHTML = `
    <div class="good1397-viz">
      <header><strong>FIND ALL GOOD STRINGS</strong><span>${escapeHtml(view.phase || "dp")}</span></header>
      <div class="good1397-bounds">${bound("s1", lower, "lower")}${bound("prefix", `${prefix}${".".repeat(Math.max(0, lower.length - prefix.length))}`, "prefix")}${bound("s2", upper, "upper")}</div>
      <div class="good1397-main">
        <section class="good1397-panel"><header><strong>EVIL + KMP LPS</strong><span>matched prefix</span></header><div class="good1397-pattern">${pattern}</div><div class="good1397-action">${escapeHtml(action)}</div><div class="good1397-state">${state}</div></section>
        <section class="good1397-panel"><header><strong>MEMO STATE</strong><span>${view.memoEntries?.length ?? 0} shown</span></header><div class="good1397-memos">${memoRows || `<div class="good1397-empty">dp(pos, match, low, high)</div>`}</div></section>
      </div>
      <footer><span><small>${escapeHtml(pick({ vi: "ky tu dang thu", en: "character tried" }))}</small><strong>${escapeHtml(view.char || "-")}</strong></span><span><small>${escapeHtml(pick({ vi: "tong state", en: "state total" }))}</small><strong>${view.total ?? "-"}</strong></span><span class="${view.phase === "done" ? "answer" : ""}"><small>${escapeHtml(pick({ vi: "good strings", en: "good strings" }))}</small><strong>${view.answer ?? "-"}</strong></span></footer>
    </div>`;
}

function renderDistribute1655BacktrackView(step) {
  const view = step.distribute1655BacktrackView || {};
  const quantity = Array.isArray(view.quantity) ? view.quantity : [];
  const counts = Array.isArray(view.counts) ? view.counts : [];
  const initialCounts = Array.isArray(view.initialCounts) ? view.initialCounts : counts;
  const bucketLabels = Array.isArray(view.bucketLabels) ? view.bucketLabels : counts.map((_, i2) => i2);
  const idx = Number.isInteger(view.idx) ? view.idx : 0;
  const activeBucket = Number.isInteger(view.activeBucket) ? view.activeBucket : -1;
  const seenCounts = new Set(view.seenCounts || []);
  const path = Array.isArray(view.path) ? view.path : [];
  const finished = view.answer !== null && view.answer !== undefined;
  const success = finished && view.answer === true;
  const maxInitial = Math.max(...initialCounts, 1);

  const bucketOfCustomer = new Map(path.map((p) => [p.customer, p.bucket]));
  const customerTokens = quantity.map((q, i2) => {
    const assignedBucket = bucketOfCustomer.has(i2) ? bucketOfCustomer.get(i2) : null;
    const cls = assignedBucket != null
      ? " done"
      : !finished && i2 === idx
        ? " current"
        : "";
    const badge = assignedBucket != null ? `<em>#${assignedBucket}</em>` : "";
    return `<div class="stack-input-token${cls}"><span>${escapeHtml(String(q))}</span><small>customer ${i2}${badge}</small></div>`;
  }).join("");

  const buckets = counts.map((remaining, i2) => {
    const widthPct = Math.round((remaining / maxInitial) * 100);
    const isSeen = seenCounts.has(remaining);
    return `<div class="d1655-bucket${i2 === activeBucket ? " active" : ""}">
      <div class="d1655-bucket-head"><b>#${i2}</b><small>${escapeHtml(pick({ vi: `số ${bucketLabels[i2]}`, en: `num ${bucketLabels[i2]}` }))}</small></div>
      <div class="d1655-count">${remaining}</div>
      <div class="d1655-barwrap"><div class="d1655-bar" style="width:${Math.max(widthPct, 6)}%"></div></div>
      ${isSeen ? `<small class="d1655-seentag">seen ✓</small>` : ""}
    </div>`;
  }).join("");

  const needNow = idx < quantity.length ? quantity[idx] : "-";
  $("treeView").innerHTML = `
    <div class="calc772-viz d1655-viz">
      <div>
        <div class="stack-input-label">${escapeHtml(pick({ vi: `quantity↓ (customer cần) · idx=${idx}`, en: `quantity↓ (customer demands) · idx=${idx}` }))}</div>
        <div class="stack-input-row">${customerTokens}</div>
      </div>
      <div class="d1655-buckets">${buckets}</div>
      <div class="stack-status">
        <div><span>need</span><strong>${escapeHtml(String(needNow))}</strong></div>
        <div><span>seen</span><strong>{${[...seenCounts].join(", ") || " "}}</strong></div>
        <div><span>${escapeHtml(pick({ vi: "đã gán", en: "assigned" }))}</span><strong>${path.length}/${quantity.length}</strong></div>
        <div><span>${escapeHtml(pick({ vi: "kết quả", en: "result" }))}</span><strong>${success ? "True" : finished ? "False" : "-"}</strong></div>
      </div>
    </div>`;
}
function renderDistribute1655View(step) {
  const view = step.distribute1655View || {};
  const vi = lang === "vi";
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const originalQuantity = Array.isArray(view.originalQuantity) ? view.originalQuantity : [];
  const quantity = Array.isArray(view.quantity) ? view.quantity : [];
  const requestOrder = Array.isArray(view.requestOrder) ? view.requestOrder : quantity.map((_, index) => index);
  const groups = Array.isArray(view.groups)
    ? view.groups
    : (Array.isArray(view.counts) ? view.counts.map((count, index) => ({ value: index, count })) : []);
  const reachable = new Set(Array.isArray(view.reachable) ? view.reachable : []);
  const assignments = Array.isArray(view.assignments) ? view.assignments : [];
  const fullMask = Number.isInteger(view.fullMask) ? view.fullMask : (1 << quantity.length) - 1;
  const fromMask = Number.isInteger(view.fromMask) ? view.fromMask : 0;
  const addMask = Number.isInteger(view.addMask) ? view.addMask : 0;
  const newMask = Number.isInteger(view.newMask) ? view.newMask : (fromMask | addMask);
  const isTransition = view.phase === "transition" && addMask > 0;
  const currentBucket = Number.isInteger(view.bucketIndex) && view.bucketIndex >= 0 ? groups[view.bucketIndex] : null;
  const currentUsed = addMask > 0 && Array.isArray(view.subsetSums) ? view.subsetSums[addMask] || 0 : 0;
  const phaseMap = { compress: 0, "subset-sums": 1, init: 1, bucket: 2, transition: 3, "bucket-done": 4, done: 5 };
  const phaseIndex = phaseMap[view.phase] ?? 0;
  const phaseLabels = [
    vi ? "Gom số giống nhau" : "Group equal values",
    vi ? "Hiểu mask" : "Understand masks",
    vi ? "Chọn bucket" : "Pick a bucket",
    vi ? "Thử nhóm khách" : "Try customers",
    vi ? "Lưu state" : "Save states",
    vi ? "Kết luận" : "Decide",
  ];
  const phases = phaseLabels.map((label, index) => `<span class="${index === phaseIndex ? "active" : index < phaseIndex ? "done" : ""}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${escapeHtml(label)}</span>`).join("");

  const assignmentByBucket = new Map(assignments.map((assignment) => [assignment.bucketIndex, assignment]));
  const customerAssignment = new Map();
  assignments.forEach((assignment) => (assignment.customerSlots || []).forEach((slot) => customerAssignment.set(slot, assignment)));
  const customerHtml = quantity.map((need, slot) => {
    const originalIndex = requestOrder[slot] ?? slot;
    const added = isTransition && Boolean(addMask & (1 << slot));
    const servedBefore = Boolean(fromMask & (1 << slot));
    const servedAfter = view.phase === "done" ? Boolean(fullMask & (1 << slot)) : Boolean(newMask & (1 << slot));
    const assignment = customerAssignment.get(slot);
    const classes = ["dteach-customer"];
    if (servedBefore || (view.phase === "done" && servedAfter)) classes.push("served");
    if (added) classes.push("assigning");
    const tokens = Array.from({ length: need }, () => "<i></i>").join("");
    let status = vi ? "chưa được phục vụ" : "waiting";
    if (added && currentBucket) status = vi ? `nhận số ${currentBucket.value}` : `gets value ${currentBucket.value}`;
    else if (assignment) status = vi ? `nhận số ${assignment.value}` : `gets value ${assignment.value}`;
    else if (servedBefore) status = vi ? "đã đủ" : "fulfilled";
    return `<article class="${classes.join(" ")}">
      <header><strong>C${originalIndex}</strong><span>bit ${slot}</span></header>
      <div><b>${need}</b><small>${vi ? "bản sao bằng nhau" : "equal copies"}</small></div>
      <div class="dteach-demand" aria-label="${need} copies">${tokens}</div>
      <footer>${escapeHtml(status)}</footer>
    </article>`;
  }).join("");

  const bucketsHtml = groups.map((group, index) => {
    const assignment = assignmentByBucket.get(index);
    const active = index === view.bucketIndex;
    const done = index < view.bucketIndex || Boolean(assignment) || view.phase === "done";
    const used = active && isTransition ? currentUsed : assignment ? assignment.used : 0;
    const copies = Array.from({ length: group.count }, (_, copyIndex) => `<i class="${copyIndex < used ? "used" : ""}">${escapeHtml(String(group.value))}</i>`).join("");
    const assignedNames = assignment
      ? assignment.customerSlots.map((slot) => `C${requestOrder[slot] ?? slot}`).join(" + ")
      : "";
    const status = active
      ? (vi ? "bucket đang xét" : "current bucket")
      : assignment
        ? `${vi ? "giao cho" : "assigned to"} ${assignedNames}`
        : done
          ? (vi ? "đã xét" : "processed")
          : (vi ? "chưa xét" : "pending");
    return `<article class="dteach-bucket${active ? " active" : ""}${done ? " done" : ""}">
      <header><small>${vi ? "GIÁ TRỊ" : "VALUE"}</small><strong>${escapeHtml(String(group.value))}</strong></header>
      <div class="dteach-copies">${copies}</div>
      <footer><b>${group.count} ${vi ? "bản sao" : "copies"}</b><span>${escapeHtml(status)}</span></footer>
    </article>`;
  }).join("");

  const maskCode = (mask) => mask.toString(2).padStart(quantity.length, "0");
  const maskNames = (mask) => quantity
    .map((_, slot) => (mask & (1 << slot) ? `C${requestOrder[slot] ?? slot}` : null))
    .filter(Boolean);
  const maskBox = (label, mask, tone) => {
    const bitCells = quantity.map((_, slot) => {
      const on = Boolean(mask & (1 << slot));
      return `<i class="${on ? "on" : ""}"><small>C${requestOrder[slot] ?? slot}</small><b>${on ? 1 : 0}</b></i>`;
    }).join("");
    const names = maskNames(mask);
    return `<div class="dteach-mask ${tone}" style="--dteach-bits:${Math.max(quantity.length, 1)}"><header><small>${escapeHtml(label)}</small><code>${maskCode(mask)}</code></header><div>${bitCells}</div><footer>${names.length ? escapeHtml(names.join(" + ")) : (vi ? "chưa có customer" : "no customers yet")}</footer></div>`;
  };
  let transitionHtml = "";
  if (isTransition) {
    const fits = currentBucket && currentUsed <= currentBucket.count;
    transitionHtml = `<section class="dteach-transition">
      <header><strong>${vi ? "PHÉP CHUYỂN DP ĐANG THỰC HIỆN" : "CURRENT DP TRANSITION"}</strong><span>${vi ? "mỗi bit 1 là một customer đã đủ" : "each 1-bit is a fulfilled customer"}</span></header>
      <div class="dteach-mask-equation">${maskBox(vi ? "ĐÃ PHỤC VỤ" : "SERVED BEFORE", fromMask, "before")}<b>+</b>${maskBox(vi ? "GIAO BUCKET NÀY" : "ASSIGN THIS BUCKET", addMask, "adding")}<b>=</b>${maskBox(vi ? "STATE MỚI" : "NEW STATE", newMask, "after")}</div>
      <div class="dteach-capacity ${fits ? "fits" : "fails"}"><small>${vi ? "NHU CẦU NHÓM ĐƯỢC CHỌN" : "SELECTED DEMAND"}</small><strong>${quantity.filter((_, slot) => addMask & (1 << slot)).join(" + ")} = ${currentUsed}</strong><span>${fits ? "≤" : ">"} ${currentBucket ? currentBucket.count : 0} ${vi ? "bản sao có sẵn" : "available copies"}</span><b>${fits ? (vi ? "VỪA → LƯU STATE" : "FITS → SAVE STATE") : (vi ? "KHÔNG VỪA" : "DOES NOT FIT")}</b></div>
    </section>`;
  } else {
    const focusMask = view.phase === "done" ? fullMask : 0;
    const guidance = {
      compress: vi ? "Một customer phải nhận cùng một giá trị, vì vậy chỉ số lượng trong từng nhóm mới quan trọng." : "A customer must receive one equal value, so only each value group's frequency matters.",
      "subset-sums": vi ? "Bit i ứng với customer được xử lý ở slot i. Bật nhiều bit nghĩa là thử dùng cùng một bucket cho nhiều customer." : "Bit i represents the customer in slot i. Turning on several bits means trying one bucket for several customers.",
      init: vi ? "DP bắt đầu ở mask 000...0: chưa ai được phục vụ." : "DP starts at mask 000...0: nobody is fulfilled.",
      bucket: currentBucket ? (vi ? `Đang thử bucket số ${currentBucket.value}, có ${currentBucket.count} bản sao.` : `Trying value ${currentBucket.value}'s bucket with ${currentBucket.count} copies.`) : "",
      "bucket-done": vi ? "Các state màu xanh là những nhóm customer đã có cách phân phối hợp lệ sau bucket này." : "Green states are customer subsets with a valid distribution after this bucket.",
      done: view.answer ? (vi ? "Full mask đã xuất hiện: mọi customer đều được phục vụ." : "The full mask is reachable: every customer is fulfilled.") : (vi ? "Full mask vẫn chưa xuất hiện sau mọi bucket." : "The full mask is still unreachable after every bucket."),
    }[view.phase] || pick(step.note);
    transitionHtml = `<section class="dteach-explain"><div>${maskBox(view.phase === "done" ? "FULL MASK" : "START MASK", focusMask, view.phase === "done" ? (view.answer ? "after" : "failed") : "before")}</div><p>${escapeHtml(guidance)}</p></section>`;
  }

  const reachableMasks = [...reachable].sort((left, right) => left - right);
  if (!reachable.has(fullMask)) reachableMasks.push(fullMask);
  const statesHtml = reachableMasks.map((mask) => {
    const target = mask === fullMask;
    const active = mask === newMask && isTransition;
    const names = maskNames(mask);
    const status = target
      ? reachable.has(mask) ? "FULL ✓" : (vi ? "FULL · chưa đạt" : "FULL · not reached")
      : reachable.has(mask) ? (vi ? "đạt được" : "reachable") : (vi ? "chưa đạt" : "not yet");
    return `<article class="dteach-state${reachable.has(mask) ? " reachable" : ""}${target ? " target" : ""}${active ? " active" : ""}"><code>${maskCode(mask)}</code><strong>${names.length ? escapeHtml(names.join(", ")) : "∅"}</strong><span>${escapeHtml(status)}</span></article>`;
  }).join("");

  const planHtml = view.phase === "done" && view.answer && assignments.length
    ? `<section class="dteach-plan"><header><strong>${vi ? "MỘT CÁCH PHÂN PHỐI HỢP LỆ" : "ONE VALID DISTRIBUTION"}</strong><span>${vi ? "được dựng ngược từ parent của full mask" : "reconstructed from the full mask's parents"}</span></header><div>${assignments.map((assignment) => {
      const customers = assignment.customerSlots.map((slot) => `C${requestOrder[slot] ?? slot} (${quantity[slot]})`).join(" + ");
      return `<article><b>${escapeHtml(String(assignment.value))} × ${assignment.capacity}</b><span>→</span><strong>${escapeHtml(customers)}</strong><small>${assignment.used}/${assignment.capacity} ${vi ? "đã dùng" : "used"}</small></article>`;
    }).join("")}</div></section>`
    : "";
  const inputGroups = groups.map((group) => `${group.value} × ${group.count}`).join(" · ");

  $("treeView").innerHTML = `
    <div class="dist1655-viz dist1655-teach" role="img" aria-label="${escapeHtml(vi ? "Trực quan hóa Distribute Repeating Integers" : "Distribute Repeating Integers visualization")}">
      <header><div><small>BITMASK DP · #1655</small><strong>DISTRIBUTE REPEATING INTEGERS</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
      <div class="dteach-phases">${phases}</div>
      <section class="dteach-rule"><b>${vi ? "ĐIỀU KIỆN QUAN TRỌNG" : "KEY CONDITION"}</b><strong>${vi ? "Mỗi customer phải nhận đủ quantity[i] bản sao của CÙNG MỘT giá trị." : "Each customer needs quantity[i] copies of ONE equal value."}</strong></section>
      <section class="dteach-compress"><div><small>nums</small><code>[${escapeHtml(nums.join(", "))}]</code></div><b>→</b><div><small>${vi ? "frequency buckets" : "frequency buckets"}</small><strong>${escapeHtml(inputGroups)}</strong></div></section>
      <div class="dteach-main">
        <section class="dteach-section"><header><strong>${vi ? "CUSTOMER · quantity GỐC" : "CUSTOMERS · ORIGINAL quantity"}</strong><span>[${escapeHtml(originalQuantity.join(", "))}] → ${vi ? "xử lý nhu cầu lớn trước" : "largest demand first"}</span></header><div class="dteach-customers">${customerHtml}</div></section>
        <section class="dteach-section"><header><strong>${vi ? "BUCKET · CÁC SỐ BẰNG NHAU" : "BUCKETS · EQUAL VALUES"}</strong><span>${groups.length} ${vi ? "giá trị khác nhau" : "distinct values"}</span></header><div class="dteach-buckets">${bucketsHtml}</div></section>
      </div>
      ${transitionHtml}
      <section class="dteach-section dteach-states"><header><strong>${vi ? "CÁC MASK ĐÃ CÓ CÁCH PHÂN PHỐI" : "MASKS WITH A VALID DISTRIBUTION"}</strong><span>${reachable.size}/${fullMask + 1} states · target ${maskCode(fullMask)}</span></header><div>${statesHtml}</div></section>
      ${planHtml}
      <section class="dteach-result${view.phase === "done" ? view.answer ? " success" : " failure" : ""}"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>${view.answer == null ? (vi ? "Đang tính" : "Computing") : view.answer ? "TRUE" : "FALSE"}</strong><span>${escapeHtml(pick(step.note))}</span></section>
    </div>`;
}

function binPad(mask, width) {
  return (mask >>> 0).toString(2).padStart(width, "0").slice(-Math.max(width, 1));
}
function renderSentenceView(step) {
  const view = step.sentenceView || {};
  const sentence1 = Array.isArray(view.sentence1) ? view.sentence1 : [];
  const sentence2 = Array.isArray(view.sentence2) ? view.sentence2 : [];
  const states = Array.isArray(view.states) ? view.states : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const pairs = Array.isArray(view.pairs) ? view.pairs : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const length = Math.max(sentence1.length, sentence2.length);

  const symbolFor = (state) => ({
    identical: "=",
    similar: "<->",
    different: "x",
    pending: "?",
  })[state] || "?";

  const columns = Array.from({ length }, (_, idx) => {
    const state = states[idx] || "pending";
    const word1 = sentence1[idx] ?? "missing";
    const word2 = sentence2[idx] ?? "missing";
    return `<div class="sentence-column ${escapeHtml(state)}${idx === current ? " current" : ""}">
      <div class="sentence-word sentence-word-top">${escapeHtml(String(word1))}</div>
      <div class="sentence-relation" aria-label="${escapeHtml(state)}">${escapeHtml(symbolFor(state))}</div>
      <div class="sentence-word sentence-word-bottom">${escapeHtml(String(word2))}</div>
      <small>[${idx}]</small>
    </div>`;
  }).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  const pairItems = pairs.length
    ? pairs.map((pair) => `<span class="sentence-pair">${escapeHtml(String(pair))}</span>`).join("")
    : `<span class="sentence-pair empty">no similar pairs</span>`;

  $("treeView").innerHTML = `
    <div class="sentence-viz">
      <div class="sentence-title">Aligned word pairs</div>
      <div class="sentence-columns">${columns}</div>
      <div class="sentence-status">${statusItems}</div>
      <div>
        <div class="sentence-pairs-label">Similar pairs (bidirectional)</div>
        <div class="sentence-pairs">${pairItems}</div>
      </div>
    </div>`;
}

function renderSynonymSentenceView(step) {
  const view = step.synonymSentenceView || {};
  const vi = lang === "vi";
  const phases = vi
    ? ["Nối cặp", "Tạo nhóm", "Gắn lựa chọn", "Sinh câu"]
    : ["Union pairs", "Build groups", "Map choices", "Generate"];
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const pairs = Array.isArray(view.pairs) ? view.pairs : [];
  const groups = Array.isArray(view.groups) ? view.groups : [];
  const sentence = Array.isArray(view.sentence) ? view.sentence : [];
  const options = Array.isArray(view.options) ? view.options : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const completed = Array.isArray(view.completed) ? view.completed : [];
  const activeWords = new Set(Array.isArray(view.activeWords) ? view.activeWords : []);
  const activeWord = Number.isInteger(view.activeWord) ? view.activeWord : -1;
  const expected = Number.isFinite(view.expected) ? view.expected : 0;
  const originalWordLabel = vi ? "từ gốc" : "original word";
  const replacedWordLabel = vi ? "từ đã thay" : "replaced word";

  const phaseHtml = phases.map((label, index) => {
    const state = index < phaseIndex ? "done" : index === phaseIndex ? "active" : "pending";
    return `<div class="synonym-phase ${state}">
      <span>${index < phaseIndex ? "✓" : index + 1}</span>
      <strong>${escapeHtml(label)}</strong>
    </div>`;
  }).join("");

  const pairHtml = pairs.map((pair, index) => `<div class="synonym-pair-step ${escapeHtml(pair.state || "pending")}">
    <small>#${index + 1}</small>
    <span>${escapeHtml(pair.a)}</span>
    <b>↔</b>
    <span>${escapeHtml(pair.b)}</span>
  </div>`).join("");

  const groupsHtml = groups.length
    ? groups.map((group) => {
      const words = Array.isArray(group.words) ? group.words : [];
      const isActive = words.some((word) => activeWords.has(word));
      return `<div class="synonym-group${isActive ? " active" : ""}">
        <div class="synonym-group-root"><small>root</small><strong>${escapeHtml(group.root)}</strong></div>
        <div class="synonym-group-words">${words.map((word) => `<span class="${activeWords.has(word) ? "active" : ""}">${escapeHtml(word)}</span>`).join("")}</div>
      </div>`;
    }).join("")
    : `<div class="synonym-groups-empty"><code>groups = {}</code></div>`;

  const sentenceHtml = sentence.map((word, index) => {
    const choices = Array.isArray(options[index]) && options[index].length ? options[index] : [word];
    const hasChoice = choices.length > 1;
    const isChosen = index < prefix.length;
    const isActive = index === activeWord;
    const isPending = view.mode === "backtrack" && index >= prefix.length && !isActive;
    const shownWord = isChosen ? prefix[index] : word;
    const tileClass = [
      "synonym-word-slot",
      hasChoice ? "branch" : "fixed",
      isChosen ? "chosen" : "",
      isActive ? "active" : "",
      isPending ? "pending" : "",
    ].filter(Boolean).join(" ");
    return `<div class="${tileClass}">
      <div class="synonym-word-head"><small>[${index}]</small><span>${escapeHtml(word)}</span></div>
      <strong>${escapeHtml(shownWord)}</strong>
      <div class="synonym-word-options">${choices.map((choice) => {
        const selected = isChosen && prefix[index] === choice;
        const current = isActive && view.currentChoice === choice;
        return `<span class="${selected || current ? "selected" : ""}">${escapeHtml(choice)}</span>`;
      }).join("")}</div>
    </div>`;
  }).join("");

  const branchPositions = options
    .map((choices, index) => (Array.isArray(choices) && choices.length > 1 ? index : -1))
    .filter((index) => index >= 0);

  const dfsState = view.dfsState && typeof view.dfsState === "object" ? view.dfsState : null;
  const dfsEventLabels = vi
    ? {
      ready: "Sẵn sàng gọi dfs(0)", enter: "Vào hàm dfs", checkBase: "Kiểm tra base case",
      checkSynonym: "Kiểm tra từ có synonym", fixed: "Giữ nguyên từ cố định",
      choices: "Lấy danh sách synonym", iterate: "Vòng for chọn một nhánh",
      assign: "Gán từ vào câu", recurse: "Gọi dfs sâu hơn", append: "Thêm câu vào ans",
      return: "Return và backtrack", done: "DFS hoàn tất",
    }
    : {
      ready: "Ready to call dfs(0)", enter: "Enter dfs", checkBase: "Check base case",
      checkSynonym: "Check whether the word has synonyms", fixed: "Keep a fixed word",
      choices: "Read synonym choices", iterate: "For-loop selects a branch",
      assign: "Assign the word", recurse: "Recurse to the next index", append: "Append sentence to ans",
      return: "Return and backtrack", done: "DFS complete",
    };

  const dfsSection = phaseIndex >= 3 && dfsState
    ? (() => {
      const stack = Array.isArray(dfsState.callStack) ? dfsState.callStack : [];
      const workingWords = Array.isArray(dfsState.workingWords) ? dfsState.workingWords : sentence;
      const choices = Array.isArray(dfsState.choices) ? dfsState.choices : [];
      const exploredChoices = new Set(Array.isArray(dfsState.exploredChoices) ? dfsState.exploredChoices : []);
      const currentIndex = Number.isInteger(dfsState.currentIndex) ? dfsState.currentIndex : -1;
      const event = dfsState.event || "ready";
      const eventLabel = dfsEventLabels[event] || event;
      const stackHtml = stack.length
        ? stack.map((index, stackIndex) => `${stackIndex ? '<b aria-hidden="true">→</b>' : ""}<span class="${stackIndex === stack.length - 1 ? "active" : ""}">dfs(${index})</span>`).join("")
        : `<span class="empty">∅</span>`;
      const workingHtml = workingWords.map((word, index) => {
        const state = index === currentIndex ? "active" : index < currentIndex ? "processed" : "pending";
        const changed = sentence[index] !== word ? " changed" : "";
        return `<span class="synonym-dfs-word ${state}${changed}" aria-label="${escapeHtml(`[${index}] ${word}`)}"><small>[${index}]</small>${escapeHtml(word)}</span>`;
      }).join("");
      const choicesHtml = choices.length
        ? choices.map((choice) => {
          const isCurrent = dfsState.currentChoice === choice;
          const isExplored = exploredChoices.has(choice);
          const state = isCurrent ? "current" : isExplored ? "explored" : "pending";
          const marker = isCurrent ? "▶" : isExplored ? "✓" : "○";
          return `<span class="synonym-dfs-choice ${state}">${marker} ${escapeHtml(choice)}</span>`;
        }).join("")
        : `<span class="synonym-dfs-no-choices">${vi ? "Chưa đọc choices ở dòng 43–44" : "Choices are read at lines 43–44"}</span>`;

      return `<section class="synonym-dfs-section">
        <div class="synonym-section-heading">
          <strong>${vi ? "MÔ PHỎNG DFS / BACKTRACKING" : "DFS / BACKTRACKING SIMULATION"}</strong>
          <span>ind = ${currentIndex} / n = ${sentence.length}</span>
        </div>
        <div class="synonym-dfs-status">
          <div class="synonym-dfs-stack-block">
            <small>CALL STACK</small>
            <div class="synonym-dfs-stack">${stackHtml}</div>
          </div>
          <div class="synonym-dfs-event">
            <small>${vi ? "THAO TÁC HIỆN TẠI" : "CURRENT ACTION"}</small>
            <strong>${escapeHtml(eventLabel)}</strong>
          </div>
        </div>
        <div class="synonym-dfs-working">
          <small>${vi ? "WORDS ĐANG ĐƯỢC THAY ĐỔI TRỰC TIẾP" : "WORDS MUTATED IN PLACE"}</small>
          <div>${workingHtml}</div>
        </div>
        <div class="synonym-dfs-choices">
          <small>${vi ? "CÁC NHÁNH TẠI VỊ TRÍ HIỆN TẠI" : "BRANCHES AT THE CURRENT POSITION"}</small>
          <div>${choicesHtml}</div>
        </div>
      </section>`;
    })()
    : "";

  const decisionTreeSection = phaseIndex >= 3 && dfsState && branchPositions.length
    ? (() => {
      const completedEntries = completed.map((result, index) => {
        const resultWords = String(result).split(/\s+/).filter(Boolean);
        return { index, result, path: branchPositions.map((position) => resultWords[position]) };
      });
      const workingWords = Array.isArray(dfsState.workingWords) ? dfsState.workingWords : sentence;
      const currentIndex = Number.isInteger(dfsState.currentIndex) ? dfsState.currentIndex : -1;
      const eventUsesCurrentChoice = new Set(["iterate", "assign", "recurse", "return"]);
      const activePath = [];
      if (dfsState.event !== "done") {
        for (const position of branchPositions) {
          if (position < currentIndex) {
            activePath.push(workingWords[position]);
          } else if (position === currentIndex && dfsState.currentChoice && eventUsesCurrentChoice.has(dfsState.event)) {
            activePath.push(dfsState.currentChoice);
          } else {
            break;
          }
        }
      }

      const treePositions = [];
      let renderedLeafCount = 1;
      for (const position of branchPositions) {
        const nextLeafCount = renderedLeafCount * options[position].length;
        if (treePositions.length >= 3 || nextLeafCount > 24) break;
        treePositions.push(position);
        renderedLeafCount = nextLeafCount;
      }
      const truncated = treePositions.length < branchPositions.length;
      const pathStartsWith = (path, pathPrefix) => pathPrefix.every((choice, index) => path[index] === choice);
      const nodeHtml = (depth, pathPrefix) => {
        if (depth >= treePositions.length) return "";
        const position = treePositions[depth];
        const choices = Array.isArray(options[position]) ? options[position] : [];
        return `<ul>${choices.map((choice) => {
          const nextPrefix = [...pathPrefix, choice];
          const isCurrent = activePath.length >= nextPrefix.length && pathStartsWith(activePath, nextPrefix);
          const matchingCompleted = completedEntries.filter((entry) => pathStartsWith(entry.path, nextPrefix));
          const isExplored = matchingCompleted.length > 0;
          const state = isCurrent ? "current" : isExplored ? "explored" : "pending";
          const marker = isCurrent ? "▶" : isExplored ? "✓" : "○";
          const isLeaf = depth === treePositions.length - 1;
          const exactCompleted = !truncated && isLeaf
            ? matchingCompleted.find((entry) => entry.path.length === nextPrefix.length)
            : null;
          const leafLabel = exactCompleted
            ? `ans #${exactCompleted.index + 1}`
            : isLeaf ? (truncated ? (vi ? "còn nhánh…" : "more branches…") : (vi ? "câu" : "sentence")) : `[${position}]`;
          const accessibleLabel = exactCompleted
            ? `${choice}, ans ${exactCompleted.index + 1}: ${exactCompleted.result}`
            : `${choice}, ${state}`;
          return `<li>
            <div class="synonym-decision-node ${state}${isLeaf ? " leaf" : ""}" aria-label="${escapeHtml(accessibleLabel)}">
              <span aria-hidden="true">${marker}</span><strong>${escapeHtml(choice)}</strong><small>${escapeHtml(leafLabel)}</small>
            </div>
            ${nodeHtml(depth + 1, nextPrefix)}
          </li>`;
        }).join("")}</ul>`;
      };
      const branchLabels = treePositions.map((position, depth) => `${vi ? "Mức" : "Level"} ${depth + 1}: words[${position}]`).join(" · ");
      const rootState = dfsState.event === "done" ? "explored" : "current";
      const rootMarker = dfsState.event === "done" ? "✓" : "▶";

      return `<section class="synonym-decision-section">
        <div class="synonym-section-heading">
          <strong>DECISION TREE</strong>
          <span>${escapeHtml(branchLabels)}</span>
        </div>
        <div class="synonym-decision-legend">
          <span>▶ ${vi ? "đường đang duyệt" : "current path"}</span>
          <span>✓ ${vi ? "đã hoàn tất" : "completed"}</span>
          <span>○ ${vi ? "chưa duyệt" : "pending"}</span>
        </div>
        <div class="synonym-decision-tree" role="tree" aria-label="${vi ? "Cây quyết định sinh câu đồng nghĩa" : "Decision tree for synonym sentence generation"}">
          <ul><li>
            <div class="synonym-decision-node root ${rootState}"><span aria-hidden="true">${rootMarker}</span><strong>∅</strong><small>dfs(0)</small></div>
            ${nodeHtml(0, [])}
          </li></ul>
        </div>
        ${truncated ? `<div class="synonym-decision-note">${vi ? "Cây lớn: chỉ hiển thị 3 mức đầu, trace DFS vẫn mô phỏng đầy đủ." : "Large tree: showing the first 3 levels; the DFS trace remains complete."}</div>` : ""}
      </section>`;
    })()
    : "";

  const replaceablePositions = new Set(branchPositions);

  const renderResultSentence = (result) => String(result).split(/\s+/).filter(Boolean).map((word, index) => {
    if (!replaceablePositions.has(index)) {
      return `<span class="synonym-result-word">${escapeHtml(word)}</span>`;
    }
    const isOriginal = word === sentence[index];
    const state = isOriginal ? "original" : "replaced";
    const stateLabel = isOriginal ? originalWordLabel : replacedWordLabel;
    return `<span class="synonym-result-word replaceable ${state}" title="${escapeHtml(stateLabel)}" aria-label="${escapeHtml(`${word}: ${stateLabel}`)}">${escapeHtml(word)}</span>`;
  }).join(" ");

  const resultsHtml = completed.length
    ? completed.map((result, index) => `<div class="synonym-result-item${index === completed.length - 1 && view.mode !== "result" ? " newest" : ""}">
      <small class="synonym-result-index">${index + 1}</small><span class="synonym-result-sentence">${renderResultSentence(result)}</span>
    </div>`).join("")
    : `<div class="synonym-results-empty">${vi ? "Chưa có câu hoàn chỉnh" : "No completed sentence yet"}</div>`;

  const sentenceSection = phaseIndex >= 2
    ? `<section class="synonym-sentence-section">
        <div class="synonym-section-heading">
          <strong>${vi ? "CÂU VÀ LỰA CHỌN" : "SENTENCE CHOICES"}</strong>
          <span>${vi ? "ô xanh = có thể thay thế" : "green = replaceable"}</span>
        </div>
        <div class="synonym-sentence-grid">${sentenceHtml}</div>
      </section>`
    : "";

  const resultsSection = phaseIndex >= 3
    ? `<section class="synonym-results-section">
        <div class="synonym-section-heading">
          <strong>ans</strong>
          <span>${completed.length} / ${expected} ${vi ? "câu" : "sentences"}</span>
        </div>
        <div class="synonym-result-legend" aria-label="${vi ? "Chú thích từ trong kết quả" : "Result word legend"}">
          <span><i class="original"></i>${originalWordLabel}</span>
          <span><i class="replaced"></i>${replacedWordLabel}</span>
        </div>
        <div class="synonym-results-list">${resultsHtml}</div>
      </section>`
    : "";

  const summary = vi
    ? `Bước ${phases[phaseIndex]}. Có ${groups.length} nhóm synonym và ${completed.length} trên ${expected} câu đã hoàn thành.`
    : `${phases[phaseIndex]} phase. ${groups.length} synonym groups and ${completed.length} of ${expected} sentences completed.`;

  $("treeView").innerHTML = `<div class="synonym-sentence-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="synonym-phases">${phaseHtml}</div>
    <div class="synonym-action">${escapeHtml(pick(view.action) || "")}</div>
    <div class="synonym-pair-flow">${pairHtml}</div>
    <section class="synonym-groups-section">
      <div class="synonym-section-heading">
        <strong>${vi ? "NHÓM SYNONYM" : "SYNONYM GROUPS"}</strong>
        <span>${groups.length} ${vi ? "nhóm" : "groups"}</span>
      </div>
      <div class="synonym-groups">${groupsHtml}</div>
    </section>
    ${dfsSection}
    ${decisionTreeSection}
    ${sentenceSection}
    ${resultsSection}
  </div>`;
}

function renderReplaceWordsView(step) {
  const view = step.replaceWordsView || {};
  const treeView = $("treeView");
  const vi = lang === "vi";
  const roots = Array.isArray(view.roots) ? view.roots : [];
  const sentenceWords = Array.isArray(view.sentenceWords) ? view.sentenceWords : [];
  const resultWords = Array.isArray(view.resultWords) ? view.resultWords : [];
  const wordIndex = Number.isInteger(view.wordIndex) ? view.wordIndex : null;
  const charIndex = Number.isInteger(view.charIndex) ? view.charIndex : null;
  const currentWord = view.word || (wordIndex !== null ? sentenceWords[wordIndex] : "");
  const phase = view.phase || "build";
  const foundRoot = view.foundRoot || "";
  const replacement = view.replacement || "";
  const prefix = view.prefix || "";
  const missingChar = view.missingChar || "";

  const dictionaryHtml = roots.length
    ? roots.map((root) => {
      const active = currentWord === root || foundRoot === root || prefix === root;
      return `<span class="rw-root${active ? " active" : ""}">${escapeHtml(root)}</span>`;
    }).join("")
    : `<span class="rw-empty">∅</span>`;

  const sentenceHtml = sentenceWords.length
    ? sentenceWords.map((word, index) => {
      const classes = ["rw-word"];
      if (index < resultWords.length) classes.push("done");
      if (index === wordIndex) classes.push("current");
      const label = index < resultWords.length ? resultWords[index] : word;
      if (index < resultWords.length && resultWords[index] !== word) classes.push("changed");
      return `<span class="${classes.join(" ")}"><small>${escapeHtml(word)}</small><strong>${escapeHtml(label)}</strong></span>`;
    }).join("")
    : `<span class="rw-empty">${vi ? "Không có câu" : "No sentence"}</span>`;

  const charHtml = currentWord
    ? currentWord.split("").map((ch, index) => {
      const classes = ["rw-char"];
      if (index < prefix.length && phase !== "miss") classes.push("matched");
      if (index === charIndex) classes.push(phase === "miss" ? "missing" : "current");
      if (foundRoot && index < foundRoot.length) classes.push("root-prefix");
      return `<span class="${classes.join(" ")}"><b>${escapeHtml(ch)}</b><small>${index}</small></span>`;
    }).join("")
    : `<span class="rw-empty">∅</span>`;

  const resultHtml = resultWords.length
    ? resultWords.map((word) => `<span class="rw-result-token">${escapeHtml(word)}</span>`).join("")
    : `<span class="rw-empty">[]</span>`;

  const pathHtml = (Array.isArray(view.pathChars) && view.pathChars.length)
    ? view.pathChars.map((ch) => `<span>${escapeHtml(ch)}</span>`).join("<i>→</i>")
    : "<span>root</span>";

  const trieNodes = step.tree && Array.isArray(step.tree.nodes) ? step.tree.nodes : [];
  const activeTrieIds = new Set(trieNodes.filter((node) => node.hl).map((node) => node.id));
  const trieHtml = trieNodes.length
    ? (() => {
      const maxX = trieNodes.reduce((max, node) => Math.max(max, Number(node.x) || 0), 0);
      const maxY = trieNodes.reduce((max, node) => Math.max(max, Number(node.y) || 0), 0);
      const width = Math.max(560, (maxX + 1) * 92 + 80);
      const height = Math.max(220, (maxY + 1) * 92 + 72);
      const xFor = (node) => 40 + (Number(node.x) || 0) * 92;
      const yFor = (node) => 36 + (Number(node.y) || 0) * 92;
      const nodeById = new Map(trieNodes.map((node) => [node.id, node]));
      const shortenTrieWord = (word) => (String(word).length > 14 ? `${String(word).slice(0, 11)}...` : String(word));
      const edges = trieNodes
        .filter((node) => node.parentId !== null && node.parentId !== undefined && nodeById.has(node.parentId))
        .map((node) => ({ from: nodeById.get(node.parentId), to: node }))
        .sort((a, b) => (a.to.y - b.to.y) || (a.to.x - b.to.x));

      const edgeSvg = edges.map(({ from, to }) => {
        const active = activeTrieIds.has(from.id) && activeTrieIds.has(to.id);
        const x1 = xFor(from);
        const y1 = yFor(from);
        const x2 = xFor(to);
        const y2 = yFor(to);
        return `<g class="rw-trie-edge${active ? " active" : ""}">
          <line x1="${x1}" y1="${y1 + 18}" x2="${x2}" y2="${y2 - 18}"></line>
          <text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 4}">${escapeHtml(to.label)}</text>
        </g>`;
      }).join("");

      const nodeSvg = trieNodes.map((node) => {
        const classes = ["rw-trie-node"];
        if (node.isWord) classes.push("terminal");
        if (activeTrieIds.has(node.id)) classes.push("active");
        const label = node.parentId === null || node.parentId === undefined ? "root" : node.label;
        const showMeta = node.isWord || activeTrieIds.has(node.id);
        const metaWidth = node.isWord && node.sub
          ? Math.min(152, Math.max(94, 70 + String(node.sub).length * 7))
          : 92;
        const metaBadge = showMeta
          ? `<g class="rw-trie-meta${node.isWord ? " terminal" : ""}" transform="translate(${-metaWidth / 2} 32)">
              <rect width="${metaWidth}" height="${node.isWord ? 38 : 20}" rx="6"></rect>
              <text x="${metaWidth / 2}" y="14">is_root=${node.isWord ? "True" : "False"}</text>
              ${node.isWord && node.sub ? `<text class="rw-trie-word" x="${metaWidth / 2}" y="30">word="${escapeHtml(shortenTrieWord(node.sub))}"</text>` : ""}
            </g>`
          : "";
        return `<g class="${classes.join(" ")}" transform="translate(${xFor(node)} ${yFor(node)})">
          <circle r="21"></circle>
          <text y="5">${escapeHtml(label)}</text>
          ${node.isWord ? '<circle class="rw-trie-ring" r="26"></circle>' : ""}
          ${metaBadge}
        </g>`;
      }).join("");

      return `<div class="rw-trie-scroll">
        <svg class="rw-trie-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(vi ? "Cây Trie của dictionary" : "Dictionary Trie")}">
          ${edgeSvg}
          ${nodeSvg}
        </svg>
      </div>`;
    })()
    : `<div class="rw-trie-empty">${vi ? "Trie đang rỗng" : "Trie is empty"}</div>`;

  let decisionClass = "";
  let decisionMain = "";
  let decisionSub = "";
  if (phase === "replace") {
    decisionClass = "replace";
    decisionMain = `${currentWord} → ${replacement}`;
    decisionSub = vi ? "dùng root ngắn nhất đã gặp" : "use the shortest root found";
  } else if (phase === "keep") {
    decisionClass = "keep";
    decisionMain = currentWord;
    decisionSub = vi ? "không có root phù hợp, giữ nguyên" : "no matching root, keep original";
  } else if (phase === "miss") {
    decisionClass = "miss";
    decisionMain = vi ? `Thiếu cạnh '${missingChar}'` : `Missing edge '${missingChar}'`;
    decisionSub = vi ? "không thể tiếp tục theo Trie" : "cannot continue in the Trie";
  } else if (phase === "found-root" || phase === "candidate-root") {
    decisionClass = "found";
    decisionMain = foundRoot ? `root = ${foundRoot}` : prefix;
    decisionSub = vi ? "dừng sớm vì đây là root ngắn nhất" : "stop early because this is the shortest root";
  } else if (phase === "done") {
    decisionClass = "done";
    decisionMain = resultWords.join(" ");
    decisionSub = vi ? "câu sau khi thay thế" : "sentence after replacement";
  } else if (phase === "build" || phase === "mark-root") {
    decisionClass = "build";
    decisionMain = currentWord ? (phase === "mark-root" ? `${currentWord} ✓` : currentWord) : (vi ? "Xây Trie" : "Build Trie");
    decisionSub = vi ? "chèn root dictionary vào Trie" : "insert dictionary roots into the Trie";
  } else {
    decisionClass = "scan";
    decisionMain = prefix || currentWord || (vi ? "Bắt đầu tra từ" : "Start lookup");
    decisionSub = vi ? "đọc từng ký tự từ trái sang phải" : "read characters from left to right";
  }

  const summary = vi
    ? `Replace Words: ${roots.length} root và ${sentenceWords.length} từ trong câu.`
    : `Replace Words with ${roots.length} roots and ${sentenceWords.length} sentence words.`;

  treeView.innerHTML = `<section class="replace-words-viz" role="img" aria-label="${escapeHtml(summary)}">
    <div class="rw-section">
      <header><strong>Dictionary roots</strong><span>${vi ? "root càng ngắn càng ưu tiên" : "shorter root wins"}</span></header>
      <div class="rw-root-row">${dictionaryHtml}</div>
    </div>
    <div class="rw-section rw-trie-section">
      <header><strong>${vi ? "Cây Trie" : "Trie tree"}</strong><span>${vi ? "xanh = đường/prefix đang đi" : "green = active prefix path"}</span></header>
      ${trieHtml}
    </div>
    <div class="rw-section">
      <header><strong>Sentence</strong><span>${vi ? "trên: từ gốc, dưới: kết quả" : "top: original, bottom: output"}</span></header>
      <div class="rw-sentence-row">${sentenceHtml}</div>
    </div>
    <div class="rw-workspace">
      <div class="rw-section">
        <header><strong>${vi ? "Word đang xét" : "Current word"}</strong><span>${currentWord ? escapeHtml(currentWord) : "—"}</span></header>
        <div class="rw-char-row">${charHtml}</div>
        <div class="rw-path"><small>${vi ? "Đường đi Trie" : "Trie path"}</small><div>${pathHtml}</div></div>
      </div>
      <div class="rw-decision ${decisionClass}">
        <small>${vi ? "Quyết định" : "Decision"}</small>
        <strong>${escapeHtml(decisionMain || "—")}</strong>
        <span>${escapeHtml(decisionSub || "")}</span>
      </div>
    </div>
    <div class="rw-section result">
      <header><strong>${vi ? "Result đang có" : "Current result"}</strong><span>${resultWords.length}/${sentenceWords.length}</span></header>
      <div class="rw-result-row">${resultHtml}</div>
    </div>
  </section>`;

  if (Number(view.approach) === 2) {
    const trieHeading = treeView.querySelector(".rw-trie-section header strong");
    const trieHint = treeView.querySelector(".rw-trie-section header span");
    const pathHeading = treeView.querySelector(".rw-path small");
    if (trieHeading) trieHeading.textContent = vi ? "Nested dictionary" : "Nested dictionary";
    if (trieHint) trieHint.textContent = vi ? "mỗi dict con là một Trie node; $ đánh dấu root" : "each child dict is a Trie node; $ marks a root";
    if (pathHeading) pathHeading.textContent = vi ? "Đường đi dictionary" : "Dictionary path";

    treeView.querySelectorAll(".rw-trie-node:not(.terminal) .rw-trie-meta").forEach((meta) => meta.remove());
    const terminalData = trieNodes.filter((node) => node.isWord);
    treeView.querySelectorAll(".rw-trie-node.terminal").forEach((group, index) => {
      const rootWord = String((terminalData[index] && terminalData[index].sub) || "");
      const shortened = rootWord.length > 14 ? `${rootWord.slice(0, 11)}...` : rootWord;
      const texts = group.querySelectorAll(".rw-trie-meta text");
      if (texts[0]) texts[0].textContent = `$ = \"${shortened}\"`;
      if (texts[1]) texts[1].remove();
    });
  } else if (Number(view.approach) === 3) {
    const testedPrefixes = Array.isArray(view.testedPrefixes) ? view.testedPrefixes : [];
    const setTokens = roots.length
      ? roots.map((root) => {
        const active = root === prefix || root === foundRoot;
        return `<span class="rw-root${active ? " active" : ""}">${escapeHtml(root)}</span>`;
      }).join("")
      : `<span class="rw-empty">∅</span>`;
    const prefixTokens = testedPrefixes.length
      ? testedPrefixes.map((item, index) => {
        const isCurrent = index === testedPrefixes.length - 1;
        const isMatch = roots.includes(item);
        return `<span class="rw-root${isCurrent || isMatch ? " active" : ""}">${escapeHtml(item)}</span>`;
      }).join("<i>→</i>")
      : `<span class="rw-empty">${vi ? "Chưa thử prefix" : "No prefix tested"}</span>`;
    const setSection = treeView.querySelector(".rw-trie-section");
    if (setSection) {
      setSection.innerHTML = `<header><strong>${vi ? "Set lookup" : "Set lookup"}</strong><span>${vi ? "không xây Trie; kiểm tra prefix in roots" : "no Trie; check prefix in roots"}</span></header>
        <div class="rw-root-row">${setTokens}</div>`;
    }
    const workspacePath = treeView.querySelector(".rw-workspace .rw-path");
    if (workspacePath) {
      workspacePath.innerHTML = `<small>${vi ? "Các prefix đã thử" : "Tested prefixes"}</small><div>${prefixTokens}</div>`;
    }
  }
}

function renderPrefix2DView(step) {
  const view = step.prefix2DView || {};
  const matrix = Array.isArray(view.matrix) ? view.matrix : [];
  const prefix = Array.isArray(view.prefix) ? view.prefix : [];
  const terms = Array.isArray(view.terms) ? view.terms : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const region = view.region || null;
  const matrixCell = Array.isArray(view.matrixCell) ? view.matrixCell : null;
  const prefixCell = Array.isArray(view.prefixCell) ? view.prefixCell : null;

  const termMap = new Map();
  terms.forEach((term) => {
    const key = `${term.row}:${term.col}`;
    const previous = termMap.get(key);
    termMap.set(key, previous
      ? { ...term, kind: previous.kind === term.kind ? term.kind : "mixed", label: `${previous.label}, ${term.label}` }
      : term);
  });

  const table = (values, type) => {
    const rowCount = values.length;
    const colCount = rowCount && Array.isArray(values[0]) ? values[0].length : 0;
    const cells = [`<div class="prefix2d-axis corner"></div>`];
    for (let col = 0; col < colCount; col += 1) {
      cells.push(`<div class="prefix2d-axis">c${col}</div>`);
    }
    for (let row = 0; row < rowCount; row += 1) {
      cells.push(`<div class="prefix2d-axis">r${row}</div>`);
      for (let col = 0; col < colCount; col += 1) {
        const classes = ["prefix2d-cell"];
        let badge = "";
        if (type === "matrix") {
          if (region && row >= region.row1 && row <= region.row2 && col >= region.col1 && col <= region.col2) classes.push("in-region");
          if (matrixCell && row === matrixCell[0] && col === matrixCell[1]) classes.push("active");
        } else {
          const term = termMap.get(`${row}:${col}`);
          if (prefixCell && row === prefixCell[0] && col === prefixCell[1]) classes.push("active");
          if (term) {
            classes.push(`term-${term.kind}`);
            badge = `<small>${escapeHtml(String(term.label))}</small>`;
          }
        }
        cells.push(`<div class="${classes.join(" ")}"><strong>${escapeHtml(String(values[row][col]))}</strong>${badge}</div>`);
      }
    }
    return `<div class="prefix2d-table" style="grid-template-columns: 30px repeat(${colCount}, minmax(0, 1fr))">${cells.join("")}</div>`;
  };

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  $("treeView").innerHTML = `
    <div class="prefix2d-viz">
      <div class="prefix2d-panels">
        <section>
          <div class="prefix2d-heading">Matrix</div>
          ${table(matrix, "matrix")}
        </section>
        <section>
          <div class="prefix2d-heading">Prefix sum (padded)</div>
          ${table(prefix, "prefix")}
        </section>
      </div>
      <div class="prefix2d-status">${statusItems}</div>
    </div>`;
}

function renderPrefixSumCountView(step) {
  const view = step.prefixSumCountView || {};
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefixSums = Array.isArray(view.prefixSums) ? view.prefixSums : [];
  const entries = Array.isArray(view.entries) ? view.entries : [];
  const matchingPositions = Array.isArray(view.matchingPositions) ? view.matchingPositions : [];
  const newSubarrays = Array.isArray(view.newSubarrays) ? view.newSubarrays : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const hasNeeded = view.needed !== null && view.needed !== undefined;
  const pickText = (value) => value && typeof value === "object" && !Array.isArray(value)
    && (Object.prototype.hasOwnProperty.call(value, "vi") || Object.prototype.hasOwnProperty.call(value, "en"))
    ? pick(value)
    : value;
  const isMatching = (position) => matchingPositions.includes(position);
  const formatPositions = (positions) => positions.length ? positions.join(", ") : "none";
  const currentPrefix = current >= 0 ? prefixSums[current] : null;
  const guideHtml = current < 0
    ? `<div class="prefix-count-guide">
        <strong>${escapeHtml(pick({ vi: "Mục tiêu của bài", en: "Goal of this problem" }))}</strong>
        <span>${escapeHtml(pick({ vi: `Tìm mọi đoạn con liên tiếp có tổng đúng bằng k = ${view.k}. Ta sẽ dùng tổng tiền tố để biến việc tìm đoạn con thành phép trừ hai tổng.`, en: `Find every contiguous subarray whose sum is exactly k = ${view.k}. Prefix sums turn each subarray check into subtracting two prefix sums.` }))}</span>
      </div>`
    : !hasNeeded
      ? `<div class="prefix-count-guide">
          <strong>${escapeHtml(pick({ vi: `Đang tính P[${current}]`, en: `Computing P[${current}]` }))}</strong>
          <span>${escapeHtml(pick({ vi: `P[${current}] là tổng từ nums[0] đến nums[${current}]. Sau đó mới tính prefix cần tìm = P[${current}] - k.`, en: `P[${current}] is the sum from nums[0] through nums[${current}]. Next we will compute the needed prefix = P[${current}] - k.` }))}</span>
        </div>`
      : `<div class="prefix-count-guide">
          <strong>${escapeHtml(pick({ vi: `Tại index ${current}: tìm đoạn con kết thúc ở đây`, en: `At index ${current}: find subarrays ending here` }))}</strong>
          <span>${escapeHtml(pick({ vi: `P[${current}] = ${currentPrefix}. Cần P[j] = P[${current}] - k = ${currentPrefix} - (${view.k}) = ${view.needed}. Nếu có P[j] như vậy thì nums[j+1..${current}] có tổng bằng k.`, en: `P[${current}] = ${currentPrefix}. We need P[j] = P[${current}] - k = ${currentPrefix} - (${view.k}) = ${view.needed}. Each such P[j] makes nums[j+1..${current}] sum to k.` }))}</span>
        </div>`;

  const numCells = nums.map((num, index) => {
    const processed = prefixSums[index] !== null && prefixSums[index] !== undefined;
    const classes = ["remainder-cell"];
    if (processed) classes.push("processed");
    if (index === current) classes.push("current");
    return `<div class="${classes.join(" ")}">
      <span class="remainder-index">nums[${index}]</span>
      <strong>${escapeHtml(String(num))}</strong>
      <span>${escapeHtml(pick({ vi: processed ? "đã cộng" : "chưa đọc", en: processed ? "processed" : "pending" }))}</span>
    </div>`;
  }).join("");

  const prefixCells = [{ position: -1, value: 0 }]
    .concat(prefixSums
      .map((value, position) => ({ position, value }))
      .filter((item) => item.value !== null && item.value !== undefined))
    .map((item) => {
      const classes = ["remainder-cell"];
      if (isMatching(item.position)) classes.push("match");
      if (item.position === current) classes.push("current");
      const label = item.position === -1 ? "P[-1]" : `P[${item.position}]`;
      return `<div class="${classes.join(" ")}">
        <span class="remainder-index">${label}</span>
        <strong>${escapeHtml(String(item.value))}</strong>
        <span>${escapeHtml(item.position === -1 ? "empty prefix" : "prefix sum")}</span>
      </div>`;
    }).join("");

  const mapCells = entries.map((entry) => `<div class="remainder-map-cell">
    <span>${escapeHtml(pick({ vi: "tổng", en: "sum" }))} ${escapeHtml(String(entry.sum))}<br><small>P[${escapeHtml(formatPositions(entry.positions || []))}]</small></span>
    <strong>${escapeHtml(pick({ vi: "số lần", en: "count" }))} ${escapeHtml(String(entry.frequency))}</strong>
  </div>`).join("");

  const rangeCells = newSubarrays.length
    ? newSubarrays.map((range) => `<div class="remainder-map-cell">
        <span>${escapeHtml(pick({ vi: `nums[${range.start}..${range.end}]`, en: `nums[${range.start}..${range.end}]` }))}<br><small>P[${escapeHtml(String(range.previousPosition))}] → P[${escapeHtml(String(current))}]</small></span>
        <strong>sum = ${escapeHtml(String(view.k))}</strong>
      </div>`).join("")
    : `<div class="remainder-map-cell"><span>${escapeHtml(pick({ vi: "Chưa có đoạn phù hợp", en: "No matching range yet" }))}</span><strong>none</strong></div>`;

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(pickText(item.label) ?? ""))}</span>
    <strong>${escapeHtml(String(pickText(item.value) ?? "-"))}</strong>
  </div>`).join("");

  let proofHtml = "";
  if (current >= 0 && hasNeeded) {
    const currentPrefix = prefixSums[current];
    const added = newSubarrays.length;
    proofHtml = `<div class="remainder-proof ${added ? "valid" : "none"}">
      <div class="remainder-heading">${escapeHtml(pick({ vi: "Vì sao tạo được subarray tổng bằng k?", en: "Why these subarrays sum to k" }))}</div>
      <div class="remainder-proof-flow">
        <div class="remainder-proof-term">
          <span>${escapeHtml(pick({ vi: "Tổng hiện tại", en: "Current prefix" }))}</span>
          <strong>P[${escapeHtml(String(current))}] = ${escapeHtml(String(currentPrefix))}</strong>
          <small>${escapeHtml(String(currentPrefix))}</small>
        </div>
        <strong class="remainder-proof-operator">-</strong>
        <div class="remainder-proof-term">
          <span>${escapeHtml(pick({ vi: "Prefix trước đó cần có", en: "Earlier prefix we need" }))}</span>
          <strong>P[j] = ${escapeHtml(String(currentPrefix))} - ${escapeHtml(String(view.k ?? "k"))} = ${escapeHtml(String(view.needed))}</strong>
          <small>${escapeHtml(pick({ vi: "để phần còn lại có tổng k", en: "so the remaining range sums to k" }))}</small>
        </div>
        <strong class="remainder-proof-operator">=</strong>
        <div class="remainder-proof-term result">
          <span>${escapeHtml(pick({ vi: "Tổng đoạn con", en: "Subarray sum" }))}</span>
          <strong>${escapeHtml(String(currentPrefix))} - ${escapeHtml(String(view.needed))} = ${escapeHtml(String(view.k))}</strong>
          <small>${escapeHtml(pick({ vi: `${added} prefix khớp → ${added} đoạn con mới`, en: `${added} matching prefix(es) → ${added} new range(s)` }))}</small>
        </div>
      </div>
      <div class="remainder-proof-conclusion">${escapeHtml(added
        ? pick({ vi: `Các prefix tại P[${formatPositions(matchingPositions)}] đều bằng ${view.needed}; lấy hiệu với P[${current}] sẽ cho tổng đúng bằng k.`, en: `Prefixes at P[${formatPositions(matchingPositions)}] equal ${view.needed}; subtracting each from P[${current}] gives exactly k.` })
        : pick({ vi: `Không có prefix trước đó bằng ${view.needed}, nên chưa tạo đoạn con mới tại index ${current}.`, en: `No earlier prefix equals ${view.needed}, so index ${current} creates no new subarray.` }))}</div>
    </div>`;
  }

  $("treeView").innerHTML = `
    <div class="remainder-viz prefix-count-viz">
      ${guideHtml}
      <section>
        <div class="remainder-heading">${escapeHtml(pick({ vi: "Mảng nums — ô đang xét", en: "Input nums — current position" }))}</div>
        <div class="remainder-cells">${numCells}</div>
      </section>
      <section>
        <div class="remainder-heading">${escapeHtml(pick({ vi: "Các prefix sum đã tính: P[j]", en: "Computed prefix sums: P[j]" }))}</div>
        <div class="remainder-cells">${prefixCells}</div>
      </section>
      ${proofHtml}
      <section>
        <div class="remainder-heading">${escapeHtml(pick({ vi: "Đoạn con được cộng vào res ở bước này", en: "Subarrays added to res at this step" }))}</div>
        <div class="remainder-map">${rangeCells}</div>
      </section>
      <section>
        <div class="remainder-heading">${escapeHtml(pick({ vi: "count — mỗi prefix sum xuất hiện bao nhiêu lần", en: "count — frequency of each prefix sum" }))}</div>
        <div class="remainder-map">${mapCells}</div>
      </section>
      <div class="remainder-status">${statusItems}</div>
    </div>`;
}

function renderPrefixRemainderView(step) {
  const view = step.prefixRemainderView || {};
  const pickViewText = (value) => {
    const isLocalized = value && !Array.isArray(value) && typeof value === "object"
      && (Object.prototype.hasOwnProperty.call(value, "vi") || Object.prototype.hasOwnProperty.call(value, "en"));
    return isLocalized ? pick(value) : value;
  };
  const nums = Array.isArray(view.nums) ? view.nums : [];
  const prefixSums = Array.isArray(view.prefixSums) ? view.prefixSums : [];
  const remainders = Array.isArray(view.remainders) ? view.remainders : [];
  const entries = Array.isArray(view.entries) ? view.entries : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const current = Number.isInteger(view.current) ? view.current : -1;
  const matchStart = Number.isInteger(view.matchStart) ? view.matchStart : -1;
  const matchEnd = Number.isInteger(view.matchEnd) ? view.matchEnd : -1;
  const matchState = view.matchState === "too-short" ? "too-short" : "valid";
  const heading = pickViewText(view.heading) || pick({ vi: "Mảng / tổng tiền tố / phần dư", en: "Numbers / prefix / remainder" });
  const prefixLabel = pickViewText(view.prefixLabel) || pick({ vi: "tổng", en: "sum" });
  const remainderLabel = pickViewText(view.remainderLabel) || pick({ vi: "dư", en: "rem" });
  const mapTitle = pickViewText(view.mapTitle) || pick({ vi: "Chỉ số đầu tiên của mỗi phần dư", en: "Earliest remainder index" });
  const mapKeyLabel = pickViewText(view.mapKeyLabel) || pick({ vi: "dư", en: "remainder" });
  const mapValueLabel = pickViewText(view.mapValueLabel) || pick({ vi: "chỉ số", en: "index" });

  const cells = nums.map((num, index) => {
    const isCurrent = index === current;
    const isMatch = matchStart >= 0 && index >= matchStart && index <= matchEnd;
    const prefix = prefixSums[index];
    const remainder = remainders[index];
    return `<div class="remainder-cell${isMatch ? ` match ${matchState}` : ""}${isCurrent ? " current" : ""}">
      <span class="remainder-index">[${index}]</span>
      <strong>${escapeHtml(String(num))}</strong>
      <span>${escapeHtml(String(prefixLabel))} ${prefix == null ? "-" : escapeHtml(String(prefix))}</span>
      <span>${escapeHtml(String(remainderLabel))} ${remainder == null ? "-" : escapeHtml(String(remainder))}</span>
    </div>`;
  }).join("");

  const mapCells = entries.map((entry) => `<div class="remainder-map-cell">
    <span>${escapeHtml(String(mapKeyLabel))} ${escapeHtml(String(entry.remainder))}</span>
    <strong>${escapeHtml(String(mapValueLabel))} ${escapeHtml(String(entry.index))}</strong>
  </div>`).join("");

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(pickViewText(item.label) ?? ""))}</span>
    <strong>${escapeHtml(String(pickViewText(item.value) ?? "-"))}</strong>
  </div>`).join("");

  const proof = view.proof && typeof view.proof === "object" ? view.proof : null;
  let proofHtml = "";
  if (proof) {
    const state = ["candidate", "valid", "too-short"].includes(proof.state) ? proof.state : "candidate";
    const subarray = Array.isArray(proof.subarray) ? proof.subarray : [];
    const conclusion = state === "valid"
      ? pick({
          vi: `Cùng dư ${proof.remainder} nên hiệu chia hết cho ${proof.k}; độ dài ${proof.length} >= 2, đoạn con hợp lệ.`,
          en: `The equal remainder ${proof.remainder} makes the difference divisible by ${proof.k}; length ${proof.length} >= 2, so the subarray is valid.`,
        })
      : state === "too-short"
        ? pick({
            vi: `Tổng ${proof.subarraySum} chia hết cho ${proof.k}, nhưng độ dài ${proof.length} < 2 nên đoạn này chưa hợp lệ.`,
            en: `Sum ${proof.subarraySum} is divisible by ${proof.k}, but length ${proof.length} < 2, so this subarray is too short.`,
          })
        : pick({
            vi: `Hai tổng tiền tố cùng dư ${proof.remainder}; vì vậy hiệu của chúng chia hết cho ${proof.k}. Tiếp theo kiểm tra độ dài.`,
            en: `Both prefix sums have remainder ${proof.remainder}, so their difference is divisible by ${proof.k}. Next, check the length.`,
          });

    proofHtml = `<div class="remainder-proof ${state}">
      <div class="remainder-heading">${escapeHtml(pick({ vi: "Mô phỏng: trừ hai tổng tiền tố", en: "Simulation: subtract two prefix sums" }))}</div>
      <div class="remainder-proof-flow">
        <div class="remainder-proof-term">
          <span>${escapeHtml(pick({ vi: "Tổng đến chỉ số hiện tại", en: "Current prefix" }))}</span>
          <strong>P[${escapeHtml(String(proof.currentIndex))}] = ${escapeHtml(String(proof.currentSum))}</strong>
          <small>${escapeHtml(String(proof.currentSum))} % ${escapeHtml(String(proof.k))} = ${escapeHtml(String(proof.remainder))}</small>
        </div>
        <strong class="remainder-proof-operator">-</strong>
        <div class="remainder-proof-term">
          <span>${escapeHtml(pick({ vi: "Tổng trước đoạn con", en: "Prefix before subarray" }))}</span>
          <strong>P[${escapeHtml(String(proof.previousIndex))}] = ${escapeHtml(String(proof.previousSum))}</strong>
          <small>${escapeHtml(String(proof.previousSum))} % ${escapeHtml(String(proof.k))} = ${escapeHtml(String(proof.remainder))}</small>
        </div>
        <strong class="remainder-proof-operator">=</strong>
        <div class="remainder-proof-term result">
          <span>${escapeHtml(pick({ vi: "Tổng đoạn con", en: "Subarray sum" }))}</span>
          <strong>${escapeHtml(String(proof.currentSum))} - ${escapeHtml(String(proof.previousSum))} = ${escapeHtml(String(proof.subarraySum))}</strong>
          <small>nums[${escapeHtml(String(proof.start))}..${escapeHtml(String(proof.end))}] = [${escapeHtml(subarray.join(", "))}]</small>
        </div>
      </div>
      <div class="remainder-proof-conclusion">${escapeHtml(conclusion)}</div>
    </div>`;
  }

  $("treeView").innerHTML = `
    <div class="remainder-viz">
      <div>
        <div class="remainder-heading">${escapeHtml(String(heading))}</div>
        <div class="remainder-cells">${cells}</div>
      </div>
      <div>
        <div class="remainder-heading">${escapeHtml(String(mapTitle))}</div>
        <div class="remainder-map">${mapCells}</div>
      </div>
      ${proofHtml}
      <div class="remainder-status">${statusItems}</div>
    </div>`;
}

function renderDifferenceArrayView(step) {
  const view = step.differenceArrayView || {};
  const diff = Array.isArray(view.diff) ? view.diff : [];
  const result = Array.isArray(view.result) ? view.result : [];
  const updates = Array.isArray(view.updates) ? view.updates : [];
  const statuses = Array.isArray(view.status) ? view.status : [];
  const currentUpdate = Number.isInteger(view.currentUpdate) ? view.currentUpdate : -1;
  const activeStart = Number.isInteger(view.activeStart) ? view.activeStart : -1;
  const activeEnd = Number.isInteger(view.activeEnd) ? view.activeEnd : -1;
  const activeBoundary = Number.isInteger(view.activeBoundary) ? view.activeBoundary : -1;
  const currentResult = Number.isInteger(view.currentResult) ? view.currentResult : -1;

  const diffCells = diff.map((value, index) => {
    const inRange = activeStart >= 0 && index >= activeStart && index <= activeEnd;
    const isBoundary = index === activeBoundary;
    const isSentinel = index === diff.length - 1;
    const boundaryLabel = isBoundary && activeBoundary === activeStart ? "start" : isBoundary ? "end + 1" : "";
    const signClass = value > 0 ? " positive" : value < 0 ? " negative" : "";
    return `<div class="diff-cell${inRange ? " in-range" : ""}${isBoundary ? " boundary" : ""}${isSentinel ? " sentinel" : ""}">
      <span class="diff-index">[${index}]</span>
      <strong class="diff-value${signClass}">${escapeHtml(String(value))}</strong>
      ${boundaryLabel ? `<small class="diff-marker">${escapeHtml(boundaryLabel)}</small>` : ""}
      ${isSentinel ? "<small>end</small>" : ""}
    </div>`;
  }).join("");

  const resultCells = result.map((value, index) => `<div class="diff-cell result${index === currentResult ? " boundary" : ""}">
    <span class="diff-index">[${index}]</span>
    <strong class="diff-value">${value == null ? "-" : escapeHtml(String(value))}</strong>
  </div>`).join("");

  const updateItems = updates.length
    ? updates.map((update, index) => `<div class="diff-update${index === currentUpdate ? " current" : ""}">
      <span class="diff-update-index">update ${index}</span>
      <div class="diff-update-values">
        <span><small>start</small>${escapeHtml(String(update.start))}</span>
        <span><small>end</small>${escapeHtml(String(update.end))}</span>
        <span><small>inc</small>${escapeHtml(String(update.inc))}</span>
      </div>
    </div>`).join("")
    : `<div class="diff-update empty"><strong>no updates</strong></div>`;

  const statusItems = statuses.map((item) => `<div>
    <span>${escapeHtml(String(item.label ?? ""))}</span>
    <strong>${escapeHtml(String(item.value ?? "-"))}</strong>
  </div>`).join("");

  $("treeView").innerHTML = `
    <div class="diff-viz">
      <div>
        <div class="diff-heading">Updates</div>
        <div class="diff-updates">${updateItems}</div>
      </div>
      <div>
        <div class="diff-heading">Difference array</div>
        <div class="diff-cells">${diffCells}</div>
      </div>
      <div>
        <div class="diff-heading">Result prefix sum</div>
        <div class="diff-cells result-row">${resultCells}</div>
      </div>
      <div class="diff-status">${statusItems}</div>
    </div>`;
}

