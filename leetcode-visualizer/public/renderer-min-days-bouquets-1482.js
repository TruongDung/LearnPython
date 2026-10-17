"use strict";

function bq1482Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bq1482Language() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function bq1482Stage(view) {
  if (view.final) return 3;
  if (view.phase === "decide") return 2;
  if (view.phase === "scan") return 1;
  return 0;
}

function bq1482Action(view, language) {
  const vi = language === "vi";
  const index = view.scan.currentIndex;
  const bloom = index === null ? null : view.input.bloomDay[index];
  const actions = {
    "capacity-check": `${view.input.m} × ${view.input.k} ${view.input.m * view.input.k <= view.input.bloomDay.length ? "≤" : ">"} ${view.input.bloomDay.length}`,
    impossible: vi ? "Không đủ hoa" : "Not enough flowers",
    "set-range": `[${view.search.initialLeft}, ${view.search.initialRight}]`,
    "range-open": `[${view.search.left}, ${view.search.right}]`,
    "choose-mid": `${vi ? "ngày" : "day"} = ${view.search.mid}`,
    "reset-bouquets": "💐 = 0",
    "reset-streak": `🌷 = 0 / ${view.input.k}`,
    "pick-flower": `#${index} · ${bloom}`,
    "bloom-ready": `${bloom} ≤ ${view.search.day}  ✓`,
    "grow-streak": `🌷 ${view.scan.consecutive} / ${view.input.k}`,
    "check-group": `${view.scan.consecutive} ${view.scan.consecutive === view.input.k ? "=" : "≠"} ${view.input.k}`,
    "make-bouquet": `💐 ${view.scan.bouquets} / ${view.input.m}`,
    "reset-after-bouquet": "🌷 → 0",
    barrier: `${bloom} > ${view.search.day}  ✕`,
    "break-streak": "🌷 → 0",
    enough: `💐 ${view.scan.bouquets} ≥ ${view.input.m}  ✓`,
    "not-enough": `💐 ${view.scan.bouquets} < ${view.input.m}  ✕`,
    "try-earlier": `R ← ${view.search.right}`,
    "wait-longer": `L → ${view.search.left}`,
    answer: vi ? `Sớm nhất: ngày ${view.answer}` : `Earliest: day ${view.answer}`,
  };
  return actions[view.action] || view.action;
}

function bq1482Range(view) {
  const min = view.search.initialLeft;
  const max = view.search.initialRight;
  const scale = (value) => max === min ? 50 : 100 * (value - min) / (max - min);
  const left = scale(view.search.left);
  const right = scale(view.search.right);
  const mid = view.search.mid === null ? null : scale(view.search.mid);
  const attempts = view.tested.map((attempt) => `<i class="${attempt.feasible ? "good" : "bad"}" style="left:${scale(attempt.day)}%" aria-label="day ${attempt.day}: ${attempt.bouquets} bouquets"></i>`).join("");
  return `<section class="bq1482-range" aria-label="Binary search day range">
    <div class="bq1482-track">
      <span class="bq1482-too-early" style="width:${Math.max(0, left)}%"></span>
      <span class="bq1482-feasible" style="left:${Math.min(100, right)}%;width:${Math.max(0, 100 - right)}%"></span>
      ${attempts}
      ${mid === null ? "" : `<b class="bq1482-mid" style="left:${mid}%"><em>M</em><strong>${view.search.mid}</strong></b>`}
    </div>
    <div class="bq1482-bounds"><span><b>L</b>${view.search.left}</span><span><b>R</b>${view.search.right}</span></div>
  </section>`;
}

function bq1482Garden(view, language) {
  const vi = language === "vi";
  const groupByIndex = new Map();
  view.scan.groups.forEach((group, groupIndex) => group.forEach((index, position) => {
    groupByIndex.set(index, { groupIndex, position, length: group.length });
  }));
  const current = view.scan.currentIndex;
  const streakStart = current === null ? -1 : current - view.scan.consecutive + 1;
  const flowers = view.input.bloomDay.map((bloom, index) => {
    const opened = view.search.day !== null && bloom <= view.search.day;
    const group = groupByIndex.get(index);
    const inStreak = view.scan.consecutive > 0 && index >= streakStart && index <= current && !group;
    const classes = [
      "bq1482-flower-tile",
      opened ? "open" : "closed",
      current === index ? "active" : "",
      group ? "grouped" : "",
      group && group.position === 0 ? "group-start" : "",
      group && group.position === group.length - 1 ? "group-end" : "",
      inStreak ? "streak" : "",
      !view.final && index >= view.scan.processedCount && index !== current ? "pending" : "",
    ].filter(Boolean).join(" ");
    const state = opened ? (vi ? "đã nở" : "bloomed") : (vi ? "chưa nở" : "not bloomed");
    return `<article class="${classes}" aria-label="#${index}, day ${bloom}, ${state}">
      <span class="bq1482-flower" aria-hidden="true"><i class="head"></i><i class="stem"></i><i class="leaf"></i></span>
      <strong>${bloom}</strong><small>#${index}</small>${group && group.position === group.length - 1 ? '<span class="bq1482-tie" aria-hidden="true">◆</span>' : ""}
    </article>`;
  }).join("");
  return `<section class="bq1482-garden" style="--flowers:${Math.min(view.input.bloomDay.length, 10)}" aria-label="${vi ? "Vườn hoa theo ngày đang thử" : "Garden at the trial day"}">
    <div class="bq1482-sun"><span>☀</span><strong>${view.search.day === null ? "?" : view.search.day}</strong></div>
    <div class="bq1482-flowers">${flowers}</div>
  </section>`;
}

function bq1482Meter(view, language) {
  const vi = language === "vi";
  const visible = Math.min(view.input.m, 6);
  const slots = Array.from({ length: visible }, (_, index) => `<span class="${index < view.scan.bouquets ? "filled" : ""}" aria-hidden="true">💐</span>`).join("");
  const decided = ["feasible", "too-early", "done"].includes(view.search.decision);
  const good = view.search.decision === "feasible" || view.search.decision === "done";
  return `<section class="bq1482-meter ${decided ? good ? "good" : "bad" : ""}" aria-label="${view.scan.bouquets} of ${view.input.m} bouquets">
    <div class="bq1482-slots">${slots}${view.input.m > visible ? `<em>+${view.input.m - visible}</em>` : ""}</div>
    <div class="bq1482-count"><strong>${view.scan.bouquets}</strong><span>/ ${view.input.m}</span><b>${decided ? good ? "✓" : "✕" : "…"}</b></div>
    <p>${decided ? good ? `← ${vi ? "sớm hơn" : "earlier"}` : `${vi ? "muộn hơn" : "later"} →` : `${view.input.k} 🌷 → 1 💐`}</p>
  </section>`;
}

function bq1482Proof(view, language) {
  if (!view.final) return "";
  const vi = language === "vi";
  if (view.impossible) {
    return `<section class="bq1482-proof impossible"><div><b>${view.input.m} × ${view.input.k}</b><span>&gt; ${view.input.bloomDay.length} 🌷</span><strong>−1</strong></div></section>`;
  }
  return `<section class="bq1482-proof">
    <div class="bad"><b>${vi ? "ngày" : "day"} ${view.answer - 1}</b><span>${view.previousBouquets} 💐 &lt; ${view.input.m}</span><strong>✕</strong></div>
    <div class="good"><b>${vi ? "ngày" : "day"} ${view.answer}</b><span>${view.scan.bouquets} 💐 ≥ ${view.input.m}</span><strong>✓</strong></div>
  </section>`;
}

function renderMinDaysBouquets1482View(step) {
  const host = typeof document !== "undefined" ? document.getElementById("treeView") : null;
  const view = step && step.bouquets1482View;
  if (!host || !view) return;
  const language = bq1482Language();
  const vi = language === "vi";
  const stage = bq1482Stage(view);
  const labels = vi ? ["NGÀY", "GOM k", "ĐỦ m?", "ĐẦU TIÊN ✓"] : ["DAY", "GROUP k", "ENOUGH?", "FIRST ✓"];
  host.innerHTML = `<section class="bq1482-viz ${view.final ? "is-final" : ""} ${view.impossible ? "is-impossible" : ""}" aria-label="${vi ? "Minh họa bài 1482" : "Problem 1482 visualization"}">
    <header class="bq1482-header"><div><small>LEETCODE 1482</small><h2>Make Bouquets</h2></div><div class="bq1482-goal"><span>${view.input.m}</span><b>×</b><span>${view.input.k} 🌷</span></div></header>
    <ol class="bq1482-stages">${labels.map((label, index) => `<li class="${index === stage ? "active" : index < stage ? "done" : ""}"><span>${["☀", "🌷", "💐", "★"][index]}</span><small>${label}</small></li>`).join("")}</ol>
    <div class="bq1482-action" aria-live="polite"><strong>${bq1482Escape(bq1482Action(view, language))}</strong><span>${vi ? "DÒNG" : "LINE"} ${view.source.line}</span></div>
    ${view.impossible ? "" : bq1482Range(view)}
    ${view.impossible ? "" : bq1482Garden(view, language)}
    ${view.impossible ? "" : bq1482Meter(view, language)}
    ${bq1482Proof(view, language)}
    <div class="bq1482-code"><code>${bq1482Escape(view.source.text.trim())}</code></div>
  </section>`;
}
