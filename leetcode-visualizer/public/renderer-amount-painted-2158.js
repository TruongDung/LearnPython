"use strict";

const AP2158_COPY = {
  en: {
    eyebrow: "#2158 · GOOGLE INTERVIEW · SUCCESSOR DSU",
    ruleTitle: "Core invariant",
    rule: "parent[x] exists only after unit [x, x+1) is painted",
    ruleCode: "find(x) = first unpainted coordinate ≥ x",
    days: "Paint plan and daily answer",
    day: "Day",
    current: "current",
    done: "done",
    upcoming: "upcoming",
    newArea: "new area",
    interval: "interval length",
    oldArea: "painted before today",
    freshArea: "new today",
    remaining: "still unpainted",
    numberLine: "Unit number line",
    halfOpen: "Each tile is one half-open unit [x, x+1)",
    free: "unpainted",
    old: "painted earlier",
    fresh: "new today",
    cursor: "current x",
    findPath: "What find(x) is doing",
    parentMap: "Successor links",
    missing: "Missing key = this unit is free",
    findResult: "first unpainted",
    noLinks: "No successor links yet",
    compressed: "path compression",
    action: "Why this step matters",
    results: "result so far",
    largeRange: "The coordinate span is too wide for unit tiles; interval bars and DSU links remain exact.",
  },
  vi: {
    eyebrow: "#2158 · PHỎNG VẤN GOOGLE · SUCCESSOR DSU",
    ruleTitle: "Bất biến cốt lõi",
    rule: "parent[x] chỉ tồn tại sau khi đơn vị [x, x+1) đã được sơn",
    ruleCode: "find(x) = tọa độ chưa sơn đầu tiên ≥ x",
    days: "Kế hoạch sơn và đáp án từng ngày",
    day: "Ngày",
    current: "đang xử lý",
    done: "xong",
    upcoming: "chưa tới",
    newArea: "diện tích mới",
    interval: "độ dài đoạn",
    oldArea: "đã sơn trước hôm nay",
    freshArea: "mới sơn hôm nay",
    remaining: "còn chưa sơn",
    numberLine: "Trục các đơn vị diện tích",
    halfOpen: "Mỗi ô là một đơn vị half-open [x, x+1)",
    free: "chưa sơn",
    old: "đã sơn trước",
    fresh: "mới hôm nay",
    cursor: "x hiện tại",
    findPath: "find(x) đang làm gì",
    parentMap: "Các liên kết successor",
    missing: "Không có key = đơn vị này còn trống",
    findResult: "đơn vị trống đầu tiên",
    noLinks: "Chưa có liên kết successor",
    compressed: "nén đường đi",
    action: "Vì sao bước này quan trọng",
    results: "kết quả hiện tại",
    largeRange: "Khoảng tọa độ quá rộng để vẽ từng đơn vị; các thanh interval và liên kết DSU vẫn chính xác.",
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
  const result = Array.isArray(view.result) ? view.result : [];

  const daysHtml = dayRows.map((row) => {
    const left = Math.max(0, Math.min(100, ((row.start - lo) / width) * 100));
    const barWidth = Math.max(1.5, Math.min(100 - left, ((row.end - row.start) / width) * 100));
    const statusLabel = row.status === "done" ? copy.done : row.status === "active" ? copy.current : copy.upcoming;
    const answer = row.newArea === null || row.newArea === undefined ? "—" : row.newArea;
    const old = row.oldArea === null || row.oldArea === undefined ? "—" : row.oldArea;
    return `<div class="ap2158-day is-${ap2158Escape(row.status)}">
      <div class="ap2158-day-label"><strong>${copy.day} ${row.day}</strong><span>${statusLabel}</span></div>
      <div class="ap2158-track" aria-label="[${row.start}, ${row.end})">
        <div class="ap2158-bar" style="--left:${left.toFixed(3)}%;--width:${barWidth.toFixed(3)}%"><span>[${row.start}, ${row.end})</span></div>
      </div>
      <div class="ap2158-day-math"><span>${copy.oldArea}: <b>${old}</b></span><span>${copy.newArea}: <b>${answer}</b></span></div>
    </div>`;
  }).join("");

  const unitsHtml = view.showUnits ? units.map((unit) => {
    const state = unit.fresh ? "is-fresh" : unit.painted ? "is-old" : "is-free";
    const classes = [state, unit.inToday ? "in-today" : "", unit.current ? "is-cursor" : "", unit.onFindPath ? "on-find" : ""].filter(Boolean).join(" ");
    const stateLabel = unit.fresh ? copy.fresh : unit.painted ? copy.old : copy.free;
    const owner = unit.firstPaintDay === null ? "" : `<small>D${unit.firstPaintDay}</small>`;
    const parent = unit.parent === null ? `<em>parent: ∅</em>` : `<em>parent: ${unit.parent}</em>`;
    const cursor = unit.current ? `<mark>x</mark>` : "";
    return `<div class="ap2158-unit ${classes}">
      <span>[${unit.coordinate}, ${unit.nextCoordinate})</span>
      <strong>${unit.coordinate}</strong>${cursor}
      <b>${stateLabel}</b>${owner}${parent}
    </div>`;
  }).join("") : `<p class="ap2158-wide-note">${copy.largeRange}</p>`;

  let path = Array.isArray(find.path) ? [...find.path] : [];
  if (!path.length && find.input !== null && find.input !== undefined) {
    path = [find.input];
    if (find.target !== null && find.target !== undefined && find.target !== find.input) path.push(find.target);
  }
  const pathHtml = path.length ? path.map((node, index) => `<span class="${index === path.length - 1 ? "is-target" : ""}">${node}</span>${index < path.length - 1 ? "<i>→</i>" : ""}`).join("") : `<span class="is-empty">—</span>`;
  const findInput = find.input === null || find.input === undefined ? "—" : find.input;
  const findResult = find.result === null || find.result === undefined
    ? find.hasParent === false && find.target !== null && find.target !== undefined ? find.target : "—"
    : find.result;

  const linksHtml = parentLinks.length ? parentLinks.map((link) => {
    const active = link.from === view.lastPaintedUnit || (view.compression && link.from === view.compression.from);
    return `<div class="ap2158-link${active ? " is-active" : ""}"><code>${link.from}</code><i>→</i><code>${link.to}</code></div>`;
  }).join("") : `<p class="ap2158-empty">${copy.noLinks}</p>`;

  const resultHtml = dayRows.map((row) => `<div class="${row.status === "done" ? "is-done" : row.status === "active" ? "is-active" : ""}"><span>D${row.day}</span><b>${row.newArea ?? "—"}</b></div>`).join("");
  const oldArea = view.oldArea === null || view.oldArea === undefined ? "—" : view.oldArea;
  const remaining = view.remainingArea === null || view.remainingArea === undefined ? "—" : view.remainingArea;
  const interval = view.start === null || view.start === undefined ? "—" : `[${view.start}, ${view.end})`;
  const compressionHtml = view.compression
    ? `<div class="ap2158-compression"><span>${copy.compressed}</span><code>parent[${view.compression.from}] = ${view.compression.to}</code></div>`
    : "";

  $("treeView").innerHTML = `<section class="ap2158-viz">
    <header class="ap2158-header">
      <div><p>${copy.eyebrow}</p><h3>${ap2158Escape(ap2158Text(step.title))}</h3></div>
      <div class="ap2158-source"><b>L${view.line}</b><code>${ap2158Escape(view.source)}</code></div>
    </header>

    <div class="ap2158-rule"><div><small>${copy.ruleTitle}</small><strong>${copy.rule}</strong></div><code>${copy.ruleCode}</code></div>

    <div class="ap2158-stats">
      <div><small>${copy.interval}</small><strong>${interval}</strong><span>${view.span || 0}</span></div>
      <div><small>${copy.oldArea}</small><strong>${oldArea}</strong><span>old</span></div>
      <div class="is-fresh"><small>${copy.freshArea}</small><strong>${view.currentDay < 0 ? "—" : view.count}</strong><span>count</span></div>
      <div><small>${copy.remaining}</small><strong>${remaining}</strong><span>end − x</span></div>
    </div>

    <article class="ap2158-section ap2158-number-line">
      <header><div><h4>${copy.numberLine}</h4><p>${copy.halfOpen}</p></div><div class="ap2158-legend"><span class="free">${copy.free}</span><span class="old">${copy.old}</span><span class="fresh">${copy.fresh}</span><span class="cursor">${copy.cursor}</span></div></header>
      <div class="ap2158-units">${unitsHtml}</div>
    </article>

    <article class="ap2158-section ap2158-days"><header><h4>${copy.days}</h4><span>${lo} … ${hi}</span></header>${daysHtml}</article>

    <div class="ap2158-detail-grid">
      <article class="ap2158-section ap2158-find">
        <header><h4>${copy.findPath}</h4><code>find(${findInput})</code></header>
        <div class="ap2158-find-chain">${pathHtml}</div>
        <div class="ap2158-find-result"><span>${copy.findResult}</span><strong>${findResult}</strong></div>
        ${compressionHtml}
        <p>${copy.missing}</p>
      </article>
      <article class="ap2158-section ap2158-parent">
        <header><h4>${copy.parentMap}</h4><span>${parentLinks.length} links</span></header>
        <div class="ap2158-links">${linksHtml}</div>
      </article>
    </div>

    <footer class="ap2158-explanation">
      <div><small>${copy.action}</small><strong>${ap2158Escape(ap2158Text(step.note))}</strong></div>
      <div class="ap2158-results"><small>${copy.results}</small><div>${resultHtml}</div><code>[${result.join(", ")}]</code></div>
    </footer>
  </section>`;
}
