"use strict";

const AP2158_COPY = {
  en: { title: "Paint only the new area", find: "Find", paint: "Paint", jump: "Jump", save: "Save", empty: "empty", old: "old", fresh: "new", day: "Day", result: "result", stop: "stop", wide: "Range too wide for unit cells" },
  vi: { title: "Chỉ sơn phần mới", find: "Tìm", paint: "Sơn", jump: "Nhảy", save: "Lưu", empty: "trống", old: "cũ", fresh: "mới", day: "Ngày", result: "kết quả", stop: "dừng", wide: "Khoảng quá rộng để vẽ từng ô" },
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

function ap2158Action(view, copy) {
  const target = view.find?.target ?? view.find?.input;
  const link = view.parentLinks?.find((item) => item.from === target);
  if (view.event === "find-follow" && link) return `${copy.find}: ${target} → ${link.to}`;
  if (["find-open", "find-base"].includes(view.event) && target !== null && target !== undefined) return `${copy.find}: ${target} ✓`;
  if (view.event === "paint-unit" && view.lastPaintedUnit !== null) return `+1 · [${view.lastPaintedUnit}, ${view.lastPaintedUnit + 1})`;
  if (view.event === "link-successor" && view.lastPaintedUnit !== null) return `${view.lastPaintedUnit} → find(${view.lastPaintedUnit + 1})`;
  if (view.event === "jump-next" && view.lastPaintedUnit !== null) {
    const destination = view.find?.result ?? view.lastSuccessor ?? view.x;
    return `${copy.jump}: ${view.lastPaintedUnit} → ${destination}`;
  }
  if (view.event === "range-stop") return `${view.x} ≥ ${view.end} · ${copy.stop}`;
  if (view.event === "finish-day") return `+${view.count}`;
  return "…";
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
  const moves = [["⌕", copy.find], ["▨", copy.paint], ["↪", copy.jump], ["✓", copy.save]];
  const movesHtml = moves.map(([icon, label], index) => `<div class="ap2158-move${index === activeMove ? " is-active" : ""}${index < activeMove ? " is-past" : ""}" aria-label="${ap2158Escape(label)}"><b>${icon}</b></div>`).join("");

  let path = Array.isArray(find.path) ? [...find.path] : [];
  if (!path.length && find.input !== null && find.input !== undefined) {
    path = [find.input];
    if (find.target !== null && find.target !== undefined && find.target !== find.input) path.push(find.target);
  }
  const findResult = find.result ?? (find.hasParent === false ? find.target : null);
  const pathHtml = path.length
    ? path.map((node, index) => `<span class="ap2158-path-node${index === path.length - 1 ? " is-target" : ""}">${node}</span>${index < path.length - 1 ? "<i>→</i>" : ""}`).join("")
    : "<span class=\"ap2158-empty\">—</span>";

  const unitsHtml = view.showUnits ? units.map((unit) => {
    const state = unit.fresh ? "is-fresh" : unit.painted ? "is-old" : "is-free";
    const classes = [state, unit.inToday ? "in-today" : "is-outside", unit.onFindPath ? "on-find" : "", unit.current ? "is-current" : ""].filter(Boolean).join(" ");
    const owner = unit.firstPaintDay === null ? "" : `<small>D${unit.firstPaintDay}</small>`;
    const pointer = unit.current ? `<div class="ap2158-brush" aria-label="x = ${unit.coordinate}"><span>▾</span><b>x</b></div>` : "";
    const shortcut = unit.parent === null ? "" : `<em>${unit.parent}</em>`;
    return `<div class="ap2158-unit-wrap">${pointer}<div class="ap2158-unit ${classes}" aria-label="${unit.coordinate}: ${state}"><span class="ap2158-paint-fill"></span>${owner}${shortcut}</div><b class="ap2158-tick">${unit.coordinate}</b></div>`;
  }).join("") : `<p class="ap2158-wide-note">${copy.wide}</p>`;

  const dayHtml = dayRows.map((row) => {
    const left = Math.max(0, Math.min(100, ((row.start - lo) / width) * 100));
    const barWidth = Math.max(2, Math.min(100 - left, ((row.end - row.start) / width) * 100));
    const value = row.newArea ?? "·";
    return `<div class="ap2158-day is-${ap2158Escape(row.status)}"><b>D${row.day}</b><div class="ap2158-track"><span class="ap2158-bar" style="--left:${left.toFixed(3)}%;--width:${barWidth.toFixed(3)}%"><i>${row.start}</i><i>${row.end}</i></span></div><strong>+${value}</strong></div>`;
  }).join("");

  const linksHtml = parentLinks.length ? parentLinks.map((link) => {
    const active = path.includes(link.from) || link.from === view.lastPaintedUnit || (view.compression && link.from === view.compression.from);
    return `<span class="ap2158-link${active ? " is-active" : ""}"><s>${link.from}</s><i>→</i><b>${link.to}</b></span>`;
  }).join("") : "<span class=\"ap2158-empty\">—</span>";

  const equationReady = view.currentDay >= 0 && view.start !== null;
  const total = equationReady ? view.span : "·";
  const oldArea = equationReady ? (view.oldArea ?? 0) : "·";
  const fresh = equationReady ? view.count : "·";
  const remaining = equationReady ? (view.remainingArea ?? view.span) : "·";
  const resultSlots = dayRows.map((row) => `<span class="${row.status === "done" ? "is-done" : row.status === "active" ? "is-active" : ""}">${row.newArea ?? "?"}</span>`).join("");
  const dayTitle = view.currentDay >= 0 ? `${copy.day} ${view.currentDay} · [${view.start}, ${view.end})` : copy.title;

  $("treeView").innerHTML = `<section class="ap2158-viz">
    <header class="ap2158-header"><div><p>#2158</p><h3>${dayTitle}</h3></div><code>L${view.line}</code></header>
    <section class="ap2158-stage" aria-label="algorithm phase">${movesHtml}<strong>${ap2158Escape(ap2158Action(view, copy))}</strong></section>
    <section class="ap2158-days" aria-label="${copy.day}">${dayHtml}</section>
    <section class="ap2158-number-line">
      <header><div class="ap2158-legend"><span class="old">${copy.old}</span><span class="fresh">${copy.fresh}</span><span class="free">${copy.empty}</span></div><div class="ap2158-equation"><b>${total}</b><i>=</i><span class="old">${oldArea}</span><i>+</i><span class="fresh">${fresh}</span><i>+</i><span>${remaining}</span></div></header>
      <div class="ap2158-units">${unitsHtml}</div><div class="ap2158-axis-end"><span>${lo}</span><span>${hi}</span></div>
    </section>
    <section class="ap2158-jump-map">
      <div class="ap2158-find"><code>find(${find.input ?? "·"})</code><div class="ap2158-find-chain">${pathHtml}${findResult === null || findResult === undefined ? "" : `<i>⇒</i><strong>${findResult}</strong>`}</div></div>
      <div class="ap2158-parent"><code>parent</code><div class="ap2158-links">${linksHtml}</div></div>
    </section>
    <footer class="ap2158-result"><span>${copy.result}</span><code>[${resultSlots}]</code></footer>
  </section>`;
}
