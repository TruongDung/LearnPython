"use strict";

const AP2158_COPY = {
  en: {
    eyebrow: "#2158 · PAINT ONLY WHAT IS NEW",
    questionTitle: "What are we counting today?",
    questionIdle: "For each day, split its interval into area painted earlier and area painted for the first time today.",
    question: (day, start, end) => `Day ${day} wants to paint [${start}, ${end}). Count only units that were still empty before today.`,
    invariant: "A painted unit keeps a shortcut to the next possible empty unit.",
    recipe: "The same 4 moves repeat",
    moves: [
      ["1", "Find", "Start at find(start)"],
      ["2", "Paint", "Count one empty unit"],
      ["3", "Link & jump", "Skip painted units"],
      ["4", "Save", "Append today's count"],
    ],
    liveAction: "What this exact step does",
    total: "units in today's interval",
    old: "painted before today",
    fresh: "newly painted so far",
    left: "not processed yet",
    equation: "Today's interval",
    numberLine: "Read the paint one unit at a time",
    halfOpen: "[x, x+1) is one unit. The right endpoint is excluded.",
    free: "empty",
    oldState: "painted earlier",
    freshState: "painted today",
    cursor: "algorithm is here",
    firstDay: "first painted on D",
    jumpTitle: "Why find(x) can skip work",
    jumpEmpty: "No find path is active at this step.",
    jumpHint: "Follow arrows through painted units; stop at the first unit with no arrow.",
    stopAt: "first empty unit",
    shortcuts: "Shortcut arrows created so far",
    shortcutHint: "Example: 1 → 4 means unit 1 is already painted, so continue at 4.",
    noLinks: "No arrows yet — every unit is still empty.",
    compressed: "Shorten the route",
    days: "Daily answers",
    current: "in progress",
    done: "finished",
    upcoming: "later",
    answer: "new area",
    running: "count so far",
    results: "result",
    largeRange: "The range is too wide to draw every unit. The daily bars and shortcut arrows are still exact.",
  },
  vi: {
    eyebrow: "#2158 · CHỈ ĐẾM PHẦN SƠN MỚI",
    questionTitle: "Hôm nay cần đếm gì?",
    questionIdle: "Mỗi ngày, tách đoạn cần sơn thành phần đã sơn từ trước và phần lần đầu được sơn hôm nay.",
    question: (day, start, end) => `Ngày ${day} muốn sơn [${start}, ${end}). Chỉ đếm những ô còn trống trước ngày hôm nay.`,
    invariant: "Mỗi ô đã sơn giữ một đường tắt tới ô có thể còn trống tiếp theo.",
    recipe: "Luôn lặp lại 4 động tác",
    moves: [
      ["1", "Tìm", "Bắt đầu tại find(start)"],
      ["2", "Sơn", "Đếm một ô còn trống"],
      ["3", "Nối & nhảy", "Bỏ qua các ô đã sơn"],
      ["4", "Lưu", "Thêm count của ngày"],
    ],
    liveAction: "Bước code này đang làm gì?",
    total: "tổng ô trong đoạn hôm nay",
    old: "đã sơn trước hôm nay",
    fresh: "vừa sơn mới đến lúc này",
    left: "chưa xử lý",
    equation: "Đoạn sơn hôm nay",
    numberLine: "Đọc hình theo từng ô diện tích",
    halfOpen: "[x, x+1) là một đơn vị. Không tính đầu mút bên phải.",
    free: "còn trống",
    oldState: "đã sơn trước",
    freshState: "mới sơn hôm nay",
    cursor: "thuật toán đang ở đây",
    firstDay: "được sơn lần đầu ở D",
    jumpTitle: "Vì sao find(x) bỏ qua được nhiều ô?",
    jumpEmpty: "Bước này chưa chạy find.",
    jumpHint: "Đi theo mũi tên qua các ô đã sơn; dừng ở ô đầu tiên không có mũi tên.",
    stopAt: "ô trống đầu tiên",
    shortcuts: "Các đường tắt đã tạo",
    shortcutHint: "Ví dụ 1 → 4 nghĩa là ô 1 đã sơn, lần sau hãy xét tiếp từ ô 4.",
    noLinks: "Chưa có mũi tên — mọi ô vẫn còn trống.",
    compressed: "Rút ngắn đường đi",
    days: "Đáp án từng ngày",
    current: "đang chạy",
    done: "đã xong",
    upcoming: "chưa tới",
    answer: "diện tích mới",
    running: "count hiện tại",
    results: "kết quả",
    largeRange: "Khoảng tọa độ quá rộng để vẽ từng ô. Thanh từng ngày và các đường tắt vẫn hoàn toàn chính xác.",
  },
};

function ap2158Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function ap2158Text(value) {
  if (value && typeof value === "object") return value[lang] ?? value.en ?? value.vi ?? "";
  return value ?? "";
}

function ap2158Number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function ap2158Move(event) {
  if (["find-start", "find-open", "find-follow", "find-base", "compress-path", "find-return"].includes(event)) return 0;
  if (["range-continue", "paint-unit"].includes(event)) return 1;
  if (["link-successor", "jump-next"].includes(event)) return 2;
  if (["range-stop", "finish-day", "done"].includes(event)) return 3;
  return -1;
}

function ap2158Action(view, step) {
  const find = view.find || {};
  const target = find.target ?? find.input;
  const link = view.parentLinks?.find((item) => item.from === target);
  if (view.event === "find-follow" && link) {
    return lang === "vi"
      ? `Ô [${target}, ${target + 1}) đã sơn, nên đi theo đường tắt ${target} → ${link.to}.`
      : `Unit [${target}, ${target + 1}) is painted, so follow shortcut ${target} → ${link.to}.`;
  }
  if (["find-open", "find-base"].includes(view.event) && target !== null && target !== undefined) {
    return lang === "vi"
      ? `Ô [${target}, ${target + 1}) chưa có mũi tên, nghĩa là còn trống. find dừng tại ${target}.`
      : `Unit [${target}, ${target + 1}) has no arrow, so it is empty. find stops at ${target}.`;
  }
  if (view.event === "paint-unit" && view.lastPaintedUnit !== null) {
    return lang === "vi"
      ? `Sơn mới ô [${view.lastPaintedUnit}, ${view.lastPaintedUnit + 1}) và tăng count lên ${view.count}.`
      : `Paint unit [${view.lastPaintedUnit}, ${view.lastPaintedUnit + 1}) for the first time and increase count to ${view.count}.`;
  }
  if (view.event === "link-successor" && view.lastPaintedUnit !== null) {
    return lang === "vi"
      ? `Ô ${view.lastPaintedUnit} vừa sơn xong. Tìm chỗ trống sau nó để tạo đường tắt cho lần sau.`
      : `Unit ${view.lastPaintedUnit} is now painted. Find the next empty place and save a shortcut for later.`;
  }
  if (view.event === "jump-next" && view.lastPaintedUnit !== null) {
    const destination = view.find?.result ?? view.lastSuccessor ?? view.x;
    return lang === "vi"
      ? `Nhảy từ ${view.lastPaintedUnit} thẳng tới ${destination}; không kiểm tra lại các ô đã sơn ở giữa.`
      : `Jump from ${view.lastPaintedUnit} straight to ${destination}; do not scan painted units in between.`;
  }
  if (view.event === "range-stop") {
    return lang === "vi"
      ? `x = ${view.x} đã chạm end = ${view.end}. Ngày này kết thúc với count = ${view.count}.`
      : `x = ${view.x} reached end = ${view.end}. This day finishes with count = ${view.count}.`;
  }
  return ap2158Text(step.note);
}

function renderAmountPainted2158View(step) {
  const view = step.paint2158View;
  if (!view) return;
  const copy = AP2158_COPY[lang] || AP2158_COPY.en;
  const lo = ap2158Number(view.lo) ?? 0;
  const hi = ap2158Number(view.hi) ?? lo + 1;
  const width = Math.max(1, hi - lo);
  const dayRows = Array.isArray(view.dayRows) ? view.dayRows : [];
  const units = Array.isArray(view.units) ? view.units : [];
  const parentLinks = Array.isArray(view.parentLinks) ? view.parentLinks : [];
  const find = view.find || {};
  const activeMove = ap2158Move(view.event);

  const question = view.currentDay < 0 || view.start === null
    ? copy.questionIdle
    : copy.question(view.currentDay, view.start, view.end);
  const movesHtml = copy.moves.map(([number, title, description], index) => `<div class="ap2158-move${index === activeMove ? " is-active" : ""}${index < activeMove ? " is-past" : ""}">
    <span>${number}</span><div><strong>${title}</strong><small>${description}</small></div>
  </div>`).join("");

  const unitsHtml = view.showUnits ? units.map((unit) => {
    const state = unit.fresh ? "is-fresh" : unit.painted ? "is-old" : "is-free";
    const classes = [state, unit.inToday ? "in-today" : "is-outside", unit.onFindPath ? "on-find" : ""].filter(Boolean).join(" ");
    const stateLabel = unit.fresh ? copy.freshState : unit.painted ? copy.oldState : copy.free;
    const dayLabel = unit.firstPaintDay === null ? "" : `<small>${copy.firstDay}${unit.firstPaintDay}</small>`;
    const pointer = unit.current ? `<mark>▼ x = ${unit.coordinate}<small>${copy.cursor}</small></mark>` : "";
    const arrow = unit.parent === null ? "" : `<em><b>${unit.coordinate}</b> → <b>${unit.parent}</b></em>`;
    return `<div class="ap2158-unit-wrap">${pointer}<div class="ap2158-unit ${classes}">
      <span>[${unit.coordinate}, ${unit.nextCoordinate})</span><strong>${unit.coordinate}</strong><b>${stateLabel}</b>${dayLabel}${arrow}
    </div></div>`;
  }).join("") : `<p class="ap2158-wide-note">${copy.largeRange}</p>`;

  let path = Array.isArray(find.path) ? [...find.path] : [];
  if (!path.length && find.input !== null && find.input !== undefined) {
    path = [find.input];
    if (find.target !== null && find.target !== undefined && find.target !== find.input) path.push(find.target);
  }
  const pathHtml = path.length ? path.map((node, index) => {
    const unit = units.find((item) => item.coordinate === node);
    const isTarget = index === path.length - 1;
    const label = unit?.painted ? copy.oldState : copy.free;
    return `<div class="ap2158-path-node${isTarget ? " is-target" : ""}"><span>${node}</span><small>${label}</small></div>${index < path.length - 1 ? "<i>→</i>" : ""}`;
  }).join("") : `<p class="ap2158-empty">${copy.jumpEmpty}</p>`;
  const findResult = find.result ?? (find.hasParent === false ? find.target : null);

  const linksHtml = parentLinks.length ? parentLinks.map((link) => {
    const active = path.includes(link.from) || link.from === view.lastPaintedUnit || (view.compression && link.from === view.compression.from);
    return `<div class="ap2158-link${active ? " is-active" : ""}"><span class="is-painted">${link.from}</span><i>→</i><span>${link.to}</span></div>`;
  }).join("") : `<p class="ap2158-empty">${copy.noLinks}</p>`;

  const dayHtml = dayRows.map((row) => {
    const left = Math.max(0, Math.min(100, ((row.start - lo) / width) * 100));
    const barWidth = Math.max(2, Math.min(100 - left, ((row.end - row.start) / width) * 100));
    const statusLabel = row.status === "done" ? copy.done : row.status === "active" ? copy.current : copy.upcoming;
    const value = row.newArea ?? "—";
    const answerLabel = row.status === "active" ? copy.running : copy.answer;
    return `<div class="ap2158-day is-${ap2158Escape(row.status)}">
      <div class="ap2158-day-label"><strong>D${row.day}</strong><span>${statusLabel}</span></div>
      <div class="ap2158-track"><div class="ap2158-bar" style="--left:${left.toFixed(3)}%;--width:${barWidth.toFixed(3)}%"><span>[${row.start}, ${row.end})</span></div></div>
      <div class="ap2158-day-answer"><small>${answerLabel}</small><b>${value}</b></div>
    </div>`;
  }).join("");

  const total = view.span || 0;
  const oldArea = view.oldArea ?? 0;
  const fresh = view.currentDay < 0 ? 0 : view.count;
  const remaining = view.remainingArea ?? total;
  const equationReady = view.currentDay >= 0 && view.start !== null;
  const compressionHtml = view.compression
    ? `<div class="ap2158-compression"><span>${copy.compressed}</span><code>${view.compression.from} → ${view.compression.to}</code></div>`
    : "";
  const resultSlots = dayRows.map((row) => `<span class="${row.status === "done" ? "is-done" : row.status === "active" ? "is-active" : ""}">${row.newArea ?? "?"}</span>`).join("");

  $("treeView").innerHTML = `<section class="ap2158-viz">
    <header class="ap2158-header">
      <div><p>${copy.eyebrow}</p><h3>${ap2158Escape(ap2158Text(step.title))}</h3></div>
      <div class="ap2158-source"><span>L${view.line}</span><code>${ap2158Escape(view.source)}</code></div>
    </header>
    <section class="ap2158-question"><div><small>${copy.questionTitle}</small><strong>${ap2158Escape(question)}</strong></div><p>${copy.invariant}</p></section>
    <section class="ap2158-recipe" aria-label="${copy.recipe}"><h4>${copy.recipe}</h4><div>${movesHtml}</div></section>
    <section class="ap2158-action"><small>${copy.liveAction}</small><strong>${ap2158Escape(ap2158Action(view, step))}</strong></section>
    <section class="ap2158-equation${equationReady ? "" : " is-idle"}">
      <h4>${copy.equation}</h4><div><span><b>${total || "—"}</b><small>${copy.total}</small></span><i>=</i><span class="is-old"><b>${equationReady ? oldArea : "—"}</b><small>${copy.old}</small></span><i>+</i><span class="is-fresh"><b>${equationReady ? fresh : "—"}</b><small>${copy.fresh}</small></span><i>+</i><span><b>${equationReady ? remaining : "—"}</b><small>${copy.left}</small></span></div>
    </section>
    <article class="ap2158-section ap2158-number-line">
      <header><div><h4>${copy.numberLine}</h4><p>${copy.halfOpen}</p></div><div class="ap2158-legend"><span class="free">${copy.free}</span><span class="old">${copy.oldState}</span><span class="fresh">${copy.freshState}</span></div></header>
      <div class="ap2158-units">${unitsHtml}</div>
    </article>
    <div class="ap2158-detail-grid">
      <article class="ap2158-section ap2158-find">
        <header><div><h4>${copy.jumpTitle}</h4><p>${copy.jumpHint}</p></div><code>find(${find.input ?? "—"})</code></header>
        <div class="ap2158-find-chain">${pathHtml}</div>
        ${findResult === null || findResult === undefined ? "" : `<div class="ap2158-find-result"><span>${copy.stopAt}</span><strong>${findResult}</strong></div>`}${compressionHtml}
      </article>
      <article class="ap2158-section ap2158-parent"><header><div><h4>${copy.shortcuts}</h4><p>${copy.shortcutHint}</p></div></header><div class="ap2158-links">${linksHtml}</div></article>
    </div>
    <article class="ap2158-section ap2158-days">
      <header><h4>${copy.days}</h4><div class="ap2158-result-array"><small>${copy.results}</small><code>${resultSlots}</code></div></header>${dayHtml}
    </article>
  </section>`;
}
