const VP1391_STREETS = Object.freeze({
  1: { openings: ["left", "right"] },
  2: { openings: ["up", "down"] },
  3: { openings: ["left", "down"] },
  4: { openings: ["right", "down"] },
  5: { openings: ["left", "up"] },
  6: { openings: ["right", "up"] },
});

const VP1391_COPY = Object.freeze({
  en: {
    region: "LeetCode 1391 valid street path visualization",
    eyebrow: "LEETCODE 1391 · BFS",
    title: "Can the streets connect from S to T?",
    ruleTitle: "The one rule that matters",
    rule: "A move is valid only when the current tile opens toward its neighbor AND the neighbor opens back.",
    grid: "Street map",
    gridCaption: "Street grid with row and column coordinates",
    decision: "Connection check",
    current: "Current tile",
    neighbor: "Neighbor tile",
    outside: "Outside grid",
    attempt: "Try moving",
    mustOpen: "Neighbor must open",
    openings: "Opens",
    queue: "BFS queue · first in, first out",
    queueEmpty: "Queue is empty",
    head: "HEAD",
    streetLegend: "Six street types",
    stateLegend: "BFS states",
    visited: "discovered",
    processed: "processed",
    queued: "waiting in queue",
    currentState: "current tile",
    candidate: "neighbor being checked",
    path: "final path",
    start: "start",
    target: "target",
    both: "start and target",
    seen: "SEEN",
    done: "DONE",
    now: "NOW",
    check: "CHECK",
    pathShort: "PATH",
    inBounds: "Neighbor stays inside the grid",
    notVisited: "Neighbor has not been discovered",
    reciprocal: "Neighbor has the opposite opening",
    noProbeInitialize: "Put S into the queue and mark it discovered immediately.",
    noProbeDequeue: "Remove the HEAD tile. BFS now checks only the two openings drawn on this street.",
    noProbeTarget: "The target was removed from the queue, so a valid chain of matching streets exists.",
    noProbeCompleteTrue: "Every consecutive pair on the numbered green route opens toward each other.",
    noProbeCompleteFalse: "The queue became empty before T was reached, so no connected street path exists.",
    invalid: "The input cannot be visualized",
    finalRoute: "Ordered route from S to T",
    answerTrue: "VALID PATH",
    answerFalse: "NO VALID PATH",
    pending: "Waiting for a connection check",
    verdicts: {
      "out-of-bounds": "Reject: this opening points outside the grid.",
      "already-visited": "Skip: this tile was already discovered, so BFS must not enqueue it twice.",
      broken: "Reject: the neighbor does not open back. The streets do not connect.",
      connected: "Connected: both tiles open toward each other.",
      enqueued: "Connected and enqueued: this neighbor will be processed later.",
    },
    phases: {
      invalid: "Invalid input",
      initialize: "1 · Initialize BFS",
      dequeue: "2 · Read the queue head",
      "bounds-reject": "3 · Check the grid boundary",
      "visited-reject": "3 · Avoid repeated work",
      "connection-check": "4 · Match both street openings",
      enqueue: "5 · Add a reachable neighbor",
      "target-reached": "Target reached",
      complete: "BFS complete",
    },
    directions: { up: "up", down: "down", left: "left", right: "right" },
    streetNames: {
      1: "left ↔ right",
      2: "up ↕ down",
      3: "left ↘ down",
      4: "right ↙ down",
      5: "left ↗ up",
      6: "right ↖ up",
    },
  },
  vi: {
    region: "Minh họa đường đi hợp lệ LeetCode 1391",
    eyebrow: "LEETCODE 1391 · BFS",
    title: "Các đoạn đường có nối được từ S đến T không?",
    ruleTitle: "Quy tắc quan trọng nhất",
    rule: "Chỉ đi được khi ô hiện tại mở về phía neighbor VÀ neighbor cũng mở ngược lại.",
    grid: "Bản đồ đường phố",
    gridCaption: "Lưới đường phố kèm tọa độ hàng và cột",
    decision: "Kiểm tra kết nối",
    current: "Ô hiện tại",
    neighbor: "Ô hàng xóm",
    outside: "Ngoài grid",
    attempt: "Thử đi",
    mustOpen: "Neighbor phải mở",
    openings: "Hai đầu mở",
    queue: "Queue BFS · vào trước, ra trước",
    queueEmpty: "Queue đang rỗng",
    head: "ĐẦU",
    streetLegend: "Sáu loại đường",
    stateLegend: "Trạng thái BFS",
    visited: "đã phát hiện",
    processed: "đã xử lý",
    queued: "đang chờ trong queue",
    currentState: "ô hiện tại",
    candidate: "neighbor đang kiểm tra",
    path: "đường kết quả",
    start: "điểm bắt đầu",
    target: "đích",
    both: "vừa là start vừa là target",
    seen: "ĐÃ THẤY",
    done: "XONG",
    now: "HIỆN TẠI",
    check: "ĐANG XÉT",
    pathShort: "ĐƯỜNG",
    inBounds: "Neighbor vẫn nằm trong grid",
    notVisited: "Neighbor chưa được phát hiện",
    reciprocal: "Neighbor có đầu mở ngược lại",
    noProbeInitialize: "Đưa S vào queue và đánh dấu đã phát hiện ngay lập tức.",
    noProbeDequeue: "Lấy ô ở ĐẦU queue. BFS chỉ thử đúng hai đầu mở được vẽ trên đoạn đường này.",
    noProbeTarget: "Target đã được lấy khỏi queue, nên tồn tại một chuỗi đường nối khớp từ S.",
    noProbeCompleteTrue: "Mỗi cặp ô liên tiếp trên đường xanh được đánh số đều mở về phía nhau.",
    noProbeCompleteFalse: "Queue rỗng trước khi tới T, nên không tồn tại đường phố nối liền hợp lệ.",
    invalid: "Không thể hiển thị input",
    finalRoute: "Thứ tự đường đi từ S đến T",
    answerTrue: "CÓ ĐƯỜNG HỢP LỆ",
    answerFalse: "KHÔNG CÓ ĐƯỜNG",
    pending: "Chưa có kết nối cần kiểm tra",
    verdicts: {
      "out-of-bounds": "Loại: đầu đường này hướng ra ngoài grid.",
      "already-visited": "Bỏ qua: ô này đã được phát hiện, BFS không enqueue hai lần.",
      broken: "Không nối: neighbor không mở ngược lại nên đường bị đứt.",
      connected: "Nối đúng: hai ô đều mở về phía nhau.",
      enqueued: "Nối đúng và đã enqueue: neighbor sẽ được xử lý sau.",
    },
    phases: {
      invalid: "Input không hợp lệ",
      initialize: "1 · Khởi tạo BFS",
      dequeue: "2 · Lấy đầu queue",
      "bounds-reject": "3 · Kiểm tra biên grid",
      "visited-reject": "3 · Tránh duyệt lặp",
      "connection-check": "4 · So khớp hai đầu đường",
      enqueue: "5 · Thêm neighbor đi được",
      "target-reached": "Đã tới target",
      complete: "BFS hoàn tất",
    },
    directions: { up: "lên", down: "xuống", left: "trái", right: "phải" },
    streetNames: {
      1: "trái ↔ phải",
      2: "trên ↕ dưới",
      3: "trái ↘ dưới",
      4: "phải ↙ dưới",
      5: "trái ↗ trên",
      6: "phải ↖ trên",
    },
  },
});

function vp1391Escape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function vp1391Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function vp1391Localized(value, locale, fallback = "") {
  if (value && typeof value === "object") return String(value[locale] ?? value.en ?? value.vi ?? fallback);
  return value === undefined || value === null ? fallback : String(value);
}

function vp1391Integer(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function vp1391Normalize(step) {
  const raw = step && step.validPath1391View && typeof step.validPath1391View === "object"
    ? step.validPath1391View
    : {};
  const rows = Math.max(0, Math.min(20, vp1391Integer(raw.rows)));
  const cols = Math.max(0, Math.min(20, vp1391Integer(raw.cols)));
  const cells = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, column) => {
      const cell = raw.cells && raw.cells[row] && raw.cells[row][column] || {};
      const type = VP1391_STREETS[vp1391Integer(cell.type)] ? vp1391Integer(cell.type) : 1;
      return {
        row,
        column,
        type,
        openings: [...VP1391_STREETS[type].openings],
        endpoint: ["start", "target", "both"].includes(cell.endpoint) ? cell.endpoint : null,
        visited: Boolean(cell.visited),
        processed: Boolean(cell.processed),
        queued: Boolean(cell.queued),
        current: Boolean(cell.current),
        candidate: Boolean(cell.candidate),
        path: Boolean(cell.path),
        pathOrder: Number.isInteger(cell.pathOrder) && cell.pathOrder > 0 ? cell.pathOrder : null,
      };
    })
  );
  const coordinate = (point) => point && Number.isInteger(point.row) && Number.isInteger(point.column)
    ? { row: point.row, column: point.column }
    : null;
  const queue = Array.isArray(raw.queue)
    ? raw.queue.map((cell, index) => ({ ...coordinate(cell), head: index === 0 })).filter((cell) => Number.isInteger(cell.row))
    : [];
  const path = Array.isArray(raw.path)
    ? raw.path.map((cell, index) => ({ ...coordinate(cell), order: index + 1 })).filter((cell) => Number.isInteger(cell.row))
    : [];
  const probeRaw = raw.probe && typeof raw.probe === "object" ? raw.probe : null;
  const probe = probeRaw ? {
    from: coordinate(probeRaw.from),
    to: coordinate(probeRaw.to),
    direction: ["up", "down", "left", "right"].includes(probeRaw.direction) ? probeRaw.direction : null,
    requiredBack: ["up", "down", "left", "right"].includes(probeRaw.requiredBack) ? probeRaw.requiredBack : null,
    inBounds: Boolean(probeRaw.inBounds),
    alreadyVisited: typeof probeRaw.alreadyVisited === "boolean" ? probeRaw.alreadyVisited : null,
    connectsBack: typeof probeRaw.connectsBack === "boolean" ? probeRaw.connectsBack : null,
    verdict: ["out-of-bounds", "already-visited", "broken", "connected", "enqueued"].includes(probeRaw.verdict)
      ? probeRaw.verdict
      : null,
  } : null;
  return {
    phase: typeof raw.phase === "string" ? raw.phase : "initialize",
    rows,
    cols,
    cells,
    current: coordinate(raw.current),
    probe,
    queue,
    path,
    counts: {
      visited: Math.max(0, vp1391Integer(raw.counts && raw.counts.visited)),
      processed: Math.max(0, vp1391Integer(raw.counts && raw.counts.processed)),
      queued: queue.length,
    },
    answer: typeof raw.answer === "boolean" ? raw.answer : null,
    error: raw.error || null,
  };
}

function vp1391DirectionSymbol(direction) {
  return { up: "↑", down: "↓", left: "←", right: "→" }[direction] || "·";
}

function vp1391StreetMarkup(type, compact = false) {
  const openings = VP1391_STREETS[type] ? VP1391_STREETS[type].openings : [];
  return `<span class="vp1391-road-map${compact ? " vp1391-road-map-compact" : ""}" aria-hidden="true">
    <span class="vp1391-road-center"></span>
    ${openings.map((direction) => `<span class="vp1391-road vp1391-road-${direction}"></span>`).join("")}
  </span>`;
}

function vp1391CellAt(view, point) {
  return point && point.row >= 0 && point.row < view.rows && point.column >= 0 && point.column < view.cols
    ? view.cells[point.row][point.column]
    : null;
}

function vp1391OpeningText(cell, copy) {
  return cell ? cell.openings.map((direction) => `${vp1391DirectionSymbol(direction)} ${copy.directions[direction]}`).join(" + ") : "—";
}

function vp1391CellAria(cell, copy) {
  const states = [];
  if (cell.endpoint) states.push(copy[cell.endpoint]);
  if (cell.visited) states.push(copy.visited);
  if (cell.processed) states.push(copy.processed);
  if (cell.queued) states.push(copy.queued);
  if (cell.current) states.push(copy.currentState);
  if (cell.candidate) states.push(copy.candidate);
  if (cell.path) states.push(`${copy.path} ${cell.pathOrder || ""}`.trim());
  return `row ${cell.row}, column ${cell.column}, street type ${cell.type}, ${copy.openings}: ${vp1391OpeningText(cell, copy)}${states.length ? `, ${states.join(", ")}` : ""}`;
}

function vp1391RenderCell(cell, copy) {
  const classes = ["vp1391-tile"];
  if (cell.visited) classes.push("is-visited");
  if (cell.processed) classes.push("is-processed");
  if (cell.queued) classes.push("is-queued");
  if (cell.current) classes.push("is-current");
  if (cell.candidate) classes.push("is-candidate");
  if (cell.path) classes.push("is-path");
  const flags = [];
  if (cell.endpoint === "start" || cell.endpoint === "both") flags.push('<span class="vp1391-flag is-start">S</span>');
  if (cell.endpoint === "target" || cell.endpoint === "both") flags.push('<span class="vp1391-flag is-target">T</span>');
  if (cell.current) flags.push(`<span class="vp1391-flag is-now">${copy.now}</span>`);
  else if (cell.candidate) flags.push(`<span class="vp1391-flag is-check">${copy.check}</span>`);
  else if (cell.queued) flags.push('<span class="vp1391-flag is-queue">Q</span>');
  else if (cell.processed) flags.push(`<span class="vp1391-flag is-done">${copy.done}</span>`);
  if (cell.path) flags.push(`<span class="vp1391-flag is-path-order">#${cell.pathOrder || "•"}</span>`);
  return `<td aria-label="${vp1391Escape(vp1391CellAria(cell, copy))}">
    <div class="${classes.join(" ")}">
      <span class="vp1391-coordinate">(${cell.row},${cell.column})</span>
      <span class="vp1391-type">TYPE ${cell.type}</span>
      ${vp1391StreetMarkup(cell.type)}
      <span class="vp1391-flags">${flags.join("")}</span>
    </div>
  </td>`;
}

function vp1391RenderGrid(view, copy) {
  if (!view.rows || !view.cols) {
    return `<div class="vp1391-empty-grid" role="status">${vp1391Escape(vp1391Localized(view.error, vp1391Locale(), copy.invalid))}</div>`;
  }
  const columnHeaders = Array.from({ length: view.cols }, (_, column) => `<th scope="col">c${column}</th>`).join("");
  const body = view.cells.map((row, rowIndex) => `<tr><th scope="row">r${rowIndex}</th>${row.map((cell) => vp1391RenderCell(cell, copy)).join("")}</tr>`).join("");
  return `<div class="vp1391-grid-scroll" role="region" tabindex="0" aria-label="${vp1391Escape(copy.gridCaption)}">
    <table class="vp1391-grid">
      <caption>${vp1391Escape(copy.gridCaption)}</caption>
      <thead><tr><th aria-hidden="true"></th>${columnHeaders}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
}

function vp1391RenderStreetCard(label, cell, copy, outside = false) {
  if (!cell || outside) {
    return `<div class="vp1391-street-card is-outside"><small>${vp1391Escape(label)}</small><strong>${vp1391Escape(copy.outside)}</strong></div>`;
  }
  return `<div class="vp1391-street-card">
    <small>${vp1391Escape(label)} · (${cell.row},${cell.column})</small>
    <div class="vp1391-street-card-main">${vp1391StreetMarkup(cell.type, true)}<strong>TYPE ${cell.type}</strong></div>
    <span>${vp1391Escape(copy.openings)}: ${vp1391Escape(vp1391OpeningText(cell, copy))}</span>
  </div>`;
}

function vp1391CheckRow(label, value) {
  const state = value === true ? "pass" : value === false ? "fail" : "pending";
  const icon = value === true ? "✓" : value === false ? "✕" : "—";
  return `<li class="is-${state}"><span aria-hidden="true">${icon}</span><strong>${vp1391Escape(label)}</strong></li>`;
}

function vp1391RenderDecision(view, copy) {
  if (!view.probe) {
    const message = view.phase === "initialize"
      ? copy.noProbeInitialize
      : view.phase === "dequeue"
        ? copy.noProbeDequeue
        : view.phase === "target-reached"
          ? copy.noProbeTarget
          : view.answer === true
            ? copy.noProbeCompleteTrue
            : view.answer === false
              ? copy.noProbeCompleteFalse
              : copy.pending;
    const outcome = view.answer === null ? "pending" : view.answer ? "pass" : "fail";
    return `<section class="vp1391-card vp1391-decision is-${outcome}" aria-live="polite">
      <h3>${vp1391Escape(copy.decision)}</h3>
      <p class="vp1391-decision-message">${vp1391Escape(message)}</p>
    </section>`;
  }

  const probe = view.probe;
  const fromCell = vp1391CellAt(view, probe.from);
  const toCell = vp1391CellAt(view, probe.to);
  const direction = probe.direction;
  const requiredBack = probe.requiredBack;
  const notVisited = probe.alreadyVisited === null ? null : !probe.alreadyVisited;
  const verdictClass = ["connected", "enqueued"].includes(probe.verdict)
    ? "pass"
    : ["broken", "out-of-bounds"].includes(probe.verdict)
      ? "fail"
      : "skip";
  const verdict = copy.verdicts[probe.verdict] || copy.pending;

  return `<section class="vp1391-card vp1391-decision is-${verdictClass}" aria-live="polite">
    <h3>${vp1391Escape(copy.decision)}</h3>
    <div class="vp1391-connection-flow">
      ${vp1391RenderStreetCard(copy.current, fromCell, copy)}
      <div class="vp1391-move-arrow">
        <small>${vp1391Escape(copy.attempt)}</small>
        <strong>${vp1391DirectionSymbol(direction)}</strong>
        <span>${vp1391Escape(copy.directions[direction] || direction)}</span>
      </div>
      ${vp1391RenderStreetCard(copy.neighbor, toCell, copy, !probe.inBounds)}
    </div>
    <div class="vp1391-required-opening">
      <span>${vp1391Escape(copy.mustOpen)}</span>
      <strong>${vp1391DirectionSymbol(requiredBack)} ${vp1391Escape(copy.directions[requiredBack] || requiredBack)}</strong>
    </div>
    <ol class="vp1391-checklist">
      ${vp1391CheckRow(copy.inBounds, probe.inBounds)}
      ${vp1391CheckRow(copy.notVisited, notVisited)}
      ${vp1391CheckRow(copy.reciprocal, probe.connectsBack)}
    </ol>
    <p class="vp1391-verdict"><span aria-hidden="true">${verdictClass === "pass" ? "✓" : verdictClass === "fail" ? "✕" : "↷"}</span>${vp1391Escape(verdict)}</p>
  </section>`;
}

function vp1391RenderQueue(view, copy) {
  const chips = view.queue.length
    ? view.queue.map((cell, index) => `<li class="${index === 0 ? "is-head" : ""}">${index === 0 ? `<span>${vp1391Escape(copy.head)}</span>` : ""}<strong>(${cell.row},${cell.column})</strong></li>`).join("")
    : `<li class="is-empty">${vp1391Escape(copy.queueEmpty)}</li>`;
  return `<section class="vp1391-card vp1391-queue-card">
    <div class="vp1391-section-heading"><h3>${vp1391Escape(copy.queue)}</h3><span>${view.queue.length}</span></div>
    <ol class="vp1391-queue">${chips}</ol>
  </section>`;
}

function vp1391RenderLegend(copy) {
  const streets = Object.keys(VP1391_STREETS).map((typeValue) => {
    const type = Number(typeValue);
    return `<li>${vp1391StreetMarkup(type, true)}<span><strong>TYPE ${type}</strong><small>${vp1391Escape(copy.streetNames[type])}</small></span></li>`;
  }).join("");
  const states = [
    ["is-current", copy.currentState, "NOW"],
    ["is-candidate", copy.candidate, "?"],
    ["is-queued", copy.queued, "Q"],
    ["is-processed", copy.processed, "✓"],
    ["is-path", copy.path, "#"],
  ].map(([className, label, symbol]) => `<li><i class="${className}">${symbol}</i><span>${vp1391Escape(label)}</span></li>`).join("");
  return `<section class="vp1391-card vp1391-legend-card">
    <h3>${vp1391Escape(copy.streetLegend)}</h3>
    <ul class="vp1391-street-legend">${streets}</ul>
    <h3>${vp1391Escape(copy.stateLegend)}</h3>
    <ul class="vp1391-state-legend">${states}</ul>
  </section>`;
}

function vp1391RenderPath(view, copy) {
  if (!view.path.length) return "";
  const chips = view.path.map((cell, index) => `${index ? '<span class="vp1391-path-arrow" aria-hidden="true">→</span>' : ""}<span class="vp1391-path-chip"><small>#${index + 1}</small><strong>(${cell.row},${cell.column})</strong></span>`).join("");
  return `<section class="vp1391-card vp1391-path-card"><h3>${vp1391Escape(copy.finalRoute)}</h3><div class="vp1391-path-scroll">${chips}</div></section>`;
}

function renderValidPath1391View(step) {
  const locale = vp1391Locale();
  const copy = VP1391_COPY[locale];
  const view = vp1391Normalize(step);
  const target = document.getElementById("treeView");
  if (!target) return;
  const phase = copy.phases[view.phase] || view.phase;
  const title = vp1391Localized(step && step.title, locale, copy.title);
  const answerBadge = view.answer === null
    ? ""
    : `<span class="vp1391-answer is-${view.answer ? "true" : "false"}">${vp1391Escape(view.answer ? copy.answerTrue : copy.answerFalse)}</span>`;

  target.innerHTML = `<div class="vp1391-viz" role="region" aria-label="${vp1391Escape(copy.region)}">
    <header class="vp1391-header">
      <div><span>${vp1391Escape(copy.eyebrow)}</span><h2>${vp1391Escape(title)}</h2><p>${vp1391Escape(phase)}</p></div>
      ${answerBadge}
    </header>
    <section class="vp1391-rule"><strong>${vp1391Escape(copy.ruleTitle)}</strong><span>${vp1391Escape(copy.rule)}</span><code>OPEN ${vp1391DirectionSymbol("right")} + OPEN ${vp1391DirectionSymbol("left")} = ✓</code></section>
    <div class="vp1391-metrics" aria-label="BFS counts">
      <span><strong>${view.counts.visited}</strong>${vp1391Escape(copy.visited)}</span>
      <span><strong>${view.counts.processed}</strong>${vp1391Escape(copy.processed)}</span>
      <span><strong>${view.counts.queued}</strong>${vp1391Escape(copy.queued)}</span>
    </div>
    <div class="vp1391-main">
      <section class="vp1391-card vp1391-grid-card"><h3>${vp1391Escape(copy.grid)}</h3>${vp1391RenderGrid(view, copy)}</section>
      ${vp1391RenderDecision(view, copy)}
    </div>
    <div class="vp1391-lower">
      ${vp1391RenderQueue(view, copy)}
      ${vp1391RenderLegend(copy)}
    </div>
    ${vp1391RenderPath(view, copy)}
  </div>`;
}
