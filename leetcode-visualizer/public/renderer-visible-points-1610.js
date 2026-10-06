"use strict";

const VP1610_COPY = Object.freeze({
  en: Object.freeze({
    kicker: "#1610 · GEOMETRY + SLIDING WINDOW",
    region: "Maximum Number of Visible Points visualization",
    line: "Line",
    observer: "Observer",
    field: "Field of view",
    currentWindow: "Current window",
    directionalBest: "Best directional",
    coincident: "At observer",
    runningAnswer: "Visible total",
    polarPlane: "Observer-centered polar plane",
    planeHelp: "Direction is exact; radius only separates points for readability.",
    current: "Current",
    best: "Best",
    pending: "Not converted",
    coincidentHelp: "Always visible, independent of direction",
    angleStrip: "Sorted + doubled angle strip",
    stripHelp: "The +360° copy makes a wrap-around window contiguous.",
    original: "original",
    copy: "+360° copy",
    noAngles: "All points coincide with the observer; no angular window is needed.",
    formula: "Answer formula",
    windowSpan: "Window span",
    inclusive: "Boundary rays are inclusive",
    final: "FINAL",
    scanning: "RUNNING",
  }),
  vi: Object.freeze({
    kicker: "#1610 · HÌNH HỌC + CỬA SỔ TRƯỢT",
    region: "Trực quan Số điểm nhìn thấy tối đa",
    line: "Dòng",
    observer: "Người quan sát",
    field: "Góc nhìn",
    currentWindow: "Cửa sổ hiện tại",
    directionalBest: "Hướng tốt nhất",
    coincident: "Trùng vị trí",
    runningAnswer: "Tổng nhìn thấy",
    polarPlane: "Mặt phẳng cực quanh người quan sát",
    planeHelp: "Hướng là chính xác; bán kính chỉ tách điểm để dễ đọc.",
    current: "Hiện tại",
    best: "Tốt nhất",
    pending: "Chưa đổi góc",
    coincidentHelp: "Luôn nhìn thấy, không phụ thuộc hướng",
    angleStrip: "Dãy góc đã sắp xếp + nhân đôi",
    stripHelp: "Bản sao +360° biến cửa sổ quấn vòng thành đoạn liên tiếp.",
    original: "gốc",
    copy: "bản sao +360°",
    noAngles: "Mọi điểm đều trùng người quan sát; không cần cửa sổ góc.",
    formula: "Công thức đáp án",
    windowSpan: "Độ rộng cửa sổ",
    inclusive: "Hai tia biên đều được tính",
    final: "CUỐI CÙNG",
    scanning: "ĐANG CHẠY",
  }),
});

function vp1610Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function vp1610Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function vp1610Text(value, locale, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return vp1610Text(value[locale] ?? value.en ?? value.vi, locale, fallback);
  }
  if (typeof value !== "string") return fallback;
  const clean = value.slice(0, 500).trim();
  return /^(?:undefined|nan|[+-]?infinity)$/i.test(clean) ? fallback : clean;
}

function vp1610Finite(value, fallback = null) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function vp1610Integer(value, min, max, fallback = null) {
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : fallback;
}

function vp1610Pair(value, fallback = [0, 0]) {
  if (!Array.isArray(value) || value.length !== 2) return fallback.slice();
  const x = vp1610Finite(value[0]);
  const y = vp1610Finite(value[1]);
  return x === null || y === null ? fallback.slice() : [x, y];
}

function vp1610Set(value, max) {
  if (!Array.isArray(value)) return new Set();
  return new Set(value.map((item) => vp1610Integer(item, 0, max - 1)).filter((item) => item !== null));
}

function vp1610Normalize(step) {
  const raw = step && step.visiblePoints1610View && typeof step.visiblePoints1610View === "object"
    ? step.visiblePoints1610View
    : {};
  const points = Array.isArray(raw.points)
    ? raw.points.slice(0, 24).map((point) => vp1610Pair(point))
    : [];
  const n = points.length;
  const location = vp1610Pair(raw.location);
  const angleLimit = Math.min(359, Math.max(0, vp1610Finite(raw.angleLimit, 0)));
  const normalizeAngular = (entry, slot) => {
    if (!entry || typeof entry !== "object") return null;
    const pointIndex = vp1610Integer(entry.pointIndex, 0, Math.max(0, n - 1));
    const angle = vp1610Finite(entry.angle);
    if (pointIndex === null || angle === null || Math.abs(angle) > 1080) return null;
    return {
      slot,
      pointIndex,
      angle,
      originalAngle: vp1610Finite(entry.originalAngle, ((angle % 360) + 360) % 360),
      copy: entry.copy === true,
    };
  };
  const angularPoints = Array.isArray(raw.angularPoints)
    ? raw.angularPoints.slice(0, 24).map((entry, slot) => normalizeAngular(entry, slot)).filter(Boolean)
    : [];
  const doubledAngles = Array.isArray(raw.doubledAngles)
    ? raw.doubledAngles.slice(0, 48).map((entry, slot) => normalizeAngular(entry, slot)).filter(Boolean)
    : [];
  const maxSlots = doubledAngles.length;
  const left = maxSlots ? vp1610Integer(raw.left, 0, maxSlots - 1) : null;
  const right = maxSlots ? vp1610Integer(raw.right, 0, maxSlots - 1) : null;
  const bestLeft = maxSlots ? vp1610Integer(raw.bestLeft, 0, maxSlots - 1) : null;
  const bestRight = maxSlots ? vp1610Integer(raw.bestRight, 0, maxSlots - 1) : null;
  const sourceFromStep = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const locale = vp1610Locale();
  return {
    points,
    n,
    location,
    angleLimit,
    angularPoints,
    doubledAngles,
    processed: vp1610Set(raw.processedPointIndices, n),
    coincident: vp1610Set(raw.coincidentIndices, n),
    active: vp1610Set(raw.activePointIndices, n),
    best: vp1610Set(raw.bestPointIndices, n),
    currentPointIndex: vp1610Integer(raw.currentPointIndex, 0, Math.max(0, n - 1)),
    removedPointIndex: vp1610Integer(raw.removedPointIndex, 0, Math.max(0, n - 1)),
    left,
    right,
    bestLeft,
    bestRight,
    currentWidth: Math.max(0, vp1610Finite(raw.currentWidth, 0)),
    overLimit: raw.overLimit === true,
    directionalCount: Math.max(0, vp1610Integer(raw.directionalCount, 0, 48, 0)),
    directionalBest: Math.max(0, vp1610Integer(raw.directionalBest, 0, 24, 0)),
    coincidentCount: Math.max(0, vp1610Integer(raw.coincidentCount, 0, 24, 0)),
    runningAnswer: Math.max(0, vp1610Integer(raw.runningAnswer, 0, 24, 0)),
    wedgeStart: vp1610Finite(raw.wedgeStart),
    event: vp1610Text(raw.event, locale, "setup").replace(/[^a-z0-9-]/gi, "").slice(0, 40),
    phase: vp1610Text(raw.phase, locale, "polar-conversion"),
    sourceLine: vp1610Integer(raw.sourceLine, 1, 22, vp1610Integer(sourceFromStep, 1, 22)),
    newBest: raw.newBest === true,
    final: raw.final === true || Boolean(step && step.final),
    title: vp1610Text(step && step.title, locale, locale === "vi" ? "Số điểm nhìn thấy tối đa" : "Maximum Number of Visible Points"),
    note: vp1610Text(step && step.note, locale, ""),
  };
}

function vp1610FormatAngle(value) {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 100) / 100;
  return `${Object.is(rounded, -0) ? 0 : rounded}°`;
}

function vp1610PolarPoint(cx, cy, radius, angle) {
  const radians = angle * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy - radius * Math.sin(radians),
  };
}

function vp1610SectorPath(cx, cy, radius, start, span) {
  const first = vp1610PolarPoint(cx, cy, radius, start);
  const last = vp1610PolarPoint(cx, cy, radius, start + span);
  const largeArc = span > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${first.x.toFixed(3)} ${first.y.toFixed(3)} A ${radius} ${radius} 0 ${largeArc} 0 ${last.x.toFixed(3)} ${last.y.toFixed(3)} Z`;
}

function vp1610RenderPlane(state, copy) {
  const cx = 220;
  const cy = 178;
  const outerRadius = 142;
  const nonCoincidentDistances = state.points
    .filter((_, index) => !state.coincident.has(index))
    .map(([x, y]) => Math.hypot(x - state.location[0], y - state.location[1]));
  const maxDistance = Math.max(1, ...nonCoincidentDistances);
  const wedgeStart = state.wedgeStart;
  let sector = "";
  if (wedgeStart !== null) {
    const startPoint = vp1610PolarPoint(cx, cy, outerRadius, wedgeStart);
    const endPoint = vp1610PolarPoint(cx, cy, outerRadius, wedgeStart + state.angleLimit);
    const body = state.angleLimit > 0
      ? `<path class="vp1610-sector ${state.overLimit ? "vp1610-is-over" : ""}" d="${vp1610SectorPath(cx, cy, outerRadius, wedgeStart, state.angleLimit)}"></path>`
      : "";
    sector = `${body}<line class="vp1610-boundary" x1="${cx}" y1="${cy}" x2="${startPoint.x.toFixed(2)}" y2="${startPoint.y.toFixed(2)}"></line><line class="vp1610-boundary vp1610-boundary-end" x1="${cx}" y1="${cy}" x2="${endPoint.x.toFixed(2)}" y2="${endPoint.y.toFixed(2)}"></line>`;
  }

  const duplicateRanks = new Map();
  const points = state.points.map((point, index) => {
    if (state.coincident.has(index)) return "";
    const dx = point[0] - state.location[0];
    const dy = point[1] - state.location[1];
    const direction = ((Math.atan2(dy, dx) * 180 / Math.PI) % 360 + 360) % 360;
    const distance = Math.hypot(dx, dy);
    const radius = 48 + (distance / maxDistance) * 78;
    const position = vp1610PolarPoint(cx, cy, radius, direction);
    const coordinateKey = `${point[0]},${point[1]}`;
    const duplicateRank = duplicateRanks.get(coordinateKey) || 0;
    duplicateRanks.set(coordinateKey, duplicateRank + 1);
    const pointRadius = 7 + duplicateRank * 2.5;
    const classes = [
      "vp1610-point",
      state.processed.has(index) ? "vp1610-is-processed" : "vp1610-is-pending",
      state.best.has(index) ? "vp1610-is-best" : "",
      state.active.has(index) ? "vp1610-is-active" : "",
      state.currentPointIndex === index ? "vp1610-is-current" : "",
      state.removedPointIndex === index ? "vp1610-is-removed" : "",
    ].filter(Boolean).join(" ");
    const ray = state.active.has(index)
      ? `<line class="vp1610-active-ray" x1="${cx}" y1="${cy}" x2="${position.x.toFixed(2)}" y2="${position.y.toFixed(2)}"></line>`
      : "";
    const labelY = position.y < 45 ? position.y + 24 : position.y - 13 - duplicateRank * 4;
    const aria = `P${index}, (${point[0]}, ${point[1]}), ${vp1610FormatAngle(direction)}`;
    return `${ray}<g class="${classes}" aria-label="${vp1610Escape(aria)}"><title>${vp1610Escape(aria)}</title><circle cx="${position.x.toFixed(2)}" cy="${position.y.toFixed(2)}" r="${pointRadius}"></circle><text x="${position.x.toFixed(2)}" y="${labelY.toFixed(2)}">P${index}</text></g>`;
  }).join("");

  const coincidentBadge = state.coincidentCount
    ? `<g class="vp1610-coincident-badge"><circle cx="${cx + 23}" cy="${cy - 21}" r="13"></circle><text x="${cx + 23}" y="${cy - 17}">+${state.coincidentCount}</text></g>`
    : "";
  const summary = `${copy.observer} (${state.location[0]}, ${state.location[1]}), ${copy.field} ${vp1610FormatAngle(state.angleLimit)}`;
  return `<section class="vp1610-card vp1610-plane-card"><header><div><h3>${vp1610Escape(copy.polarPlane)}</h3><p>${vp1610Escape(copy.planeHelp)}</p></div><span class="vp1610-angle-badge">∠ ${vp1610Escape(vp1610FormatAngle(state.angleLimit))}</span></header><div class="vp1610-plane-wrap"><svg class="vp1610-plane" viewBox="0 0 440 356" role="img" aria-label="${vp1610Escape(summary)}"><circle class="vp1610-ring vp1610-ring-outer" cx="${cx}" cy="${cy}" r="${outerRadius}"></circle><circle class="vp1610-ring" cx="${cx}" cy="${cy}" r="94"></circle><circle class="vp1610-ring" cx="${cx}" cy="${cy}" r="47"></circle><line class="vp1610-axis" x1="55" y1="${cy}" x2="385" y2="${cy}"></line><line class="vp1610-axis" x1="${cx}" y1="22" x2="${cx}" y2="334"></line><text class="vp1610-cardinal" x="390" y="${cy + 4}">0°</text><text class="vp1610-cardinal" x="${cx - 10}" y="16">90°</text><text class="vp1610-cardinal" x="24" y="${cy + 4}">180°</text><text class="vp1610-cardinal" x="${cx - 13}" y="350">270°</text>${sector}${points}<g class="vp1610-observer"><circle cx="${cx}" cy="${cy}" r="12"></circle><circle cx="${cx}" cy="${cy}" r="4"></circle><text x="${cx}" y="${cy + 31}">(${state.location[0]}, ${state.location[1]})</text></g>${coincidentBadge}</svg></div><div class="vp1610-legend"><span class="vp1610-legend-current">${vp1610Escape(copy.current)}</span><span class="vp1610-legend-best">${vp1610Escape(copy.best)}</span><span class="vp1610-legend-pending">${vp1610Escape(copy.pending)}</span>${state.coincidentCount ? `<span class="vp1610-legend-same">+${state.coincidentCount} ${vp1610Escape(copy.coincident)}</span>` : ""}</div></section>`;
}

function vp1610RenderTimeline(state, copy) {
  if (!state.doubledAngles.length) {
    return `<section class="vp1610-card vp1610-timeline-card"><header><div><h3>${vp1610Escape(copy.angleStrip)}</h3><p>${vp1610Escape(copy.stripHelp)}</p></div></header><div class="vp1610-empty">${vp1610Escape(copy.noAngles)}</div></section>`;
  }
  const cells = state.doubledAngles.map((entry, slot) => {
    const inWindow = state.left !== null && state.right !== null && slot >= state.left && slot <= state.right;
    const inBest = state.bestLeft !== null && state.bestRight !== null && slot >= state.bestLeft && slot <= state.bestRight;
    const pointers = [slot === state.left ? "L" : "", slot === state.right ? "R" : ""].filter(Boolean).join(" · ");
    const classes = [
      "vp1610-angle-cell",
      entry.copy ? "vp1610-is-copy" : "vp1610-is-original",
      inBest ? "vp1610-is-best" : "",
      inWindow ? "vp1610-is-window" : "",
      slot === state.left ? "vp1610-is-left" : "",
      slot === state.right ? "vp1610-is-right" : "",
      state.currentPointIndex === entry.pointIndex && slot === state.right ? "vp1610-is-current" : "",
      state.removedPointIndex === entry.pointIndex && slot < (state.left ?? 0) ? "vp1610-is-removed" : "",
    ].filter(Boolean).join(" ");
    const aria = `slot ${slot}, P${entry.pointIndex}, ${vp1610FormatAngle(entry.angle)}${entry.copy ? ", +360 copy" : ""}`;
    return `<li class="${classes}" aria-label="${vp1610Escape(aria)}"><span class="vp1610-pointer">${vp1610Escape(pointers || "·")}</span><small>#${slot} · P${entry.pointIndex}</small><strong>${vp1610Escape(vp1610FormatAngle(entry.angle))}</strong><em>${vp1610Escape(entry.copy ? copy.copy : copy.original)}</em></li>`;
  }).join("");
  const spanText = state.left === null || state.right === null
    ? "—"
    : `${vp1610FormatAngle(state.currentWidth)} / ${vp1610FormatAngle(state.angleLimit)}`;
  return `<section class="vp1610-card vp1610-timeline-card"><header><div><h3>${vp1610Escape(copy.angleStrip)}</h3><p>${vp1610Escape(copy.stripHelp)}</p></div><div class="vp1610-span ${state.overLimit ? "vp1610-is-over" : ""}"><small>${vp1610Escape(copy.windowSpan)}</small><strong>${vp1610Escape(spanText)}</strong></div></header><div class="vp1610-timeline-scroll"><ol class="vp1610-timeline" role="list">${cells}</ol></div><footer><span><i class="vp1610-key-original"></i>${vp1610Escape(copy.original)}</span><span><i class="vp1610-key-copy"></i>${vp1610Escape(copy.copy)}</span><b>${vp1610Escape(copy.inclusive)}</b></footer></section>`;
}

function vp1610Metric(label, value, tone) {
  return `<article class="vp1610-metric vp1610-metric-${tone}"><small>${vp1610Escape(label)}</small><strong>${vp1610Escape(String(value))}</strong></article>`;
}

function renderVisiblePoints1610View(step) {
  const host = typeof document !== "undefined" && document.getElementById
    ? document.getElementById("treeView")
    : typeof $ === "function" ? $("treeView") : null;
  if (!host) return;
  const locale = vp1610Locale();
  const copy = VP1610_COPY[locale];
  const state = vp1610Normalize(step);
  const status = state.final ? copy.final : copy.scanning;
  const windowLabel = state.left === null || state.right === null
    ? "—"
    : `${state.left}…${state.right} (${state.directionalCount})`;
  const summary = `${copy.region}. ${copy.line} ${state.sourceLine ?? "—"}. ${state.title}`;
  const note = state.note
    ? `<aside class="vp1610-note"><span>↳</span><p>${vp1610Escape(state.note)}</p></aside>`
    : "";
  const formula = `${state.coincidentCount} + ${state.directionalBest} = ${state.runningAnswer}`;

  host.innerHTML = `<article class="vp1610-viz ${state.final ? "vp1610-is-final" : ""} ${state.newBest ? "vp1610-has-new-best" : ""}" role="region" aria-label="${vp1610Escape(summary)}"><header class="vp1610-header"><div><span>${vp1610Escape(copy.kicker)}</span><h2>${vp1610Escape(state.title)}</h2></div><div class="vp1610-step"><b>${vp1610Escape(copy.line)} ${state.sourceLine ?? "—"}</b><strong>${vp1610Escape(status)}</strong><em>${vp1610Escape(state.event.replace(/-/g, " "))}</em></div></header><section class="vp1610-metrics">${vp1610Metric(copy.field, vp1610FormatAngle(state.angleLimit), "angle")}${vp1610Metric(copy.currentWindow, windowLabel, state.overLimit ? "danger" : "current")}${vp1610Metric(copy.directionalBest, state.directionalBest, "best")}${vp1610Metric(copy.coincident, state.coincidentCount, "same")}${vp1610Metric(copy.runningAnswer, state.runningAnswer, "answer")}</section><div class="vp1610-workspace">${vp1610RenderPlane(state, copy)}<section class="vp1610-side"><article class="vp1610-explainer"><small>${vp1610Escape(state.phase)}</small><strong>${vp1610Escape(state.event.replace(/-/g, " "))}</strong><p>${vp1610Escape(state.note)}</p></article><article class="vp1610-formula ${state.final ? "vp1610-is-final" : ""}"><small>${vp1610Escape(copy.formula)}</small><div><span>${vp1610Escape(copy.coincident)}</span><b>+</b><span>${vp1610Escape(copy.directionalBest)}</span><b>=</b><strong>${vp1610Escape(String(state.runningAnswer))}</strong></div><code>${vp1610Escape(formula)}</code></article></section></div>${vp1610RenderTimeline(state, copy)}${note}</article>`;
}
