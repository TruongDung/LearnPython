"use strict";

function mf1552Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mf1552Language() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function mf1552Stage(view) {
  if (view.final) return 3;
  if (view.phase === "decide") return 2;
  if (view.phase === "place") return 1;
  return 0;
}

function mf1552Action(view, language) {
  const vi = language === "vi";
  const current = view.scan.currentIndex === null ? null : view.input.position[view.scan.currentIndex];
  const last = view.scan.lastIndex === null ? null : view.input.position[view.scan.lastIndex];
  const actions = {
    "sort-positions": `[${view.input.position.join(", ")}]`,
    "set-range": `[${view.search.initialLeft}, ${view.search.initialRight}]`,
    "range-open": `[${view.search.left}, ${view.search.right}]`,
    "choose-distance": `d = ${view.search.mid}`,
    "place-first": `● → ${view.input.position[0]}`,
    "remember-last": `last = ${view.input.position[0]}`,
    "pick-basket": `${current} − ${last}`,
    "gap-fits": `${view.scan.gap} ≥ ${view.search.distance}  ✓`,
    "too-close": `${view.scan.gap} < ${view.search.distance}  ✕`,
    "place-ball": `● ${view.scan.balls} / ${view.input.m}`,
    "move-last": `last = ${last}`,
    enough: `● ${view.scan.balls} ≥ ${view.input.m}  ✓`,
    "not-enough": `● ${view.scan.balls} < ${view.input.m}  ✕`,
    "try-farther": `L → ${view.search.left}`,
    "come-closer": `R ← ${view.search.right}`,
    answer: vi ? `Xa nhất: d = ${view.answer}` : `Maximum: d = ${view.answer}`,
  };
  return actions[view.action] || view.action;
}

function mf1552Range(view) {
  const min = view.search.initialLeft;
  const max = view.search.initialRight;
  const scale = (value) => {
    if (max === min) return 50;
    return Math.max(0, Math.min(100, 100 * (value - min) / (max - min)));
  };
  const feasibleEnd = scale(view.search.left - 1);
  const rejectedStart = scale(view.search.right + 1);
  const mid = view.search.mid === null ? null : scale(view.search.mid);
  const attempts = view.tested.map((attempt) => `<i class="${attempt.feasible ? "good" : "bad"}" style="left:${scale(attempt.distance)}%" aria-label="distance ${attempt.distance}: ${attempt.balls} balls"></i>`).join("");
  return `<section class="mf1552-range" aria-label="Binary search distance range">
    <div class="mf1552-track">
      <span class="mf1552-feasible" style="width:${feasibleEnd}%"></span>
      <span class="mf1552-too-far" style="left:${rejectedStart}%;width:${100 - rejectedStart}%"></span>
      ${attempts}
      ${mid === null ? "" : `<b class="mf1552-mid" style="left:${mid}%"><em>M</em><strong>${view.search.mid}</strong></b>`}
    </div>
    <div class="mf1552-bounds"><span><b>L</b>${view.search.left}</span><span><b>R</b>${view.search.right}</span></div>
  </section>`;
}

function mf1552Rail(view, language) {
  const vi = language === "vi";
  const placed = new Set(view.scan.placed);
  const slots = view.input.position.map((position, index) => {
    const active = index === view.scan.currentIndex;
    const hasBall = placed.has(index);
    const checked = index < view.scan.processedCount;
    const rejected = active && view.scan.accepted === false;
    const accepted = active && view.scan.accepted === true;
    const adjacentGap = index === 0 ? null : position - view.input.position[index - 1];
    const classes = ["mf1552-slot", hasBall ? "placed" : "empty", active ? "active" : "", rejected ? "rejected" : "", accepted ? "accepted" : "", !checked && !active ? "pending" : ""].filter(Boolean).join(" ");
    return `<article class="${classes}" aria-label="${vi ? "Vị trí" : "Position"} ${position}${hasBall ? `, ${vi ? "có bóng" : "ball placed"}` : ""}">
      ${index === 0 ? "" : `<span class="mf1552-connector" aria-hidden="true"><i></i><b>${adjacentGap}</b></span>`}
      <span class="mf1552-basket" aria-hidden="true"><i class="mf1552-ball"></i><i class="mf1552-rim"></i><i class="mf1552-bin"></i></span>
      <strong>${position}</strong><small>#${index}</small>
    </article>`;
  }).join("");
  const gap = view.scan.gap === null ? "" : `<div class="mf1552-gap ${view.scan.accepted === true ? "good" : view.scan.accepted === false ? "bad" : ""}"><span>${view.input.position[view.scan.lastIndex]}</span><i>↔</i><strong>${view.scan.gap}</strong><i>↔</i><span>${view.input.position[view.scan.currentIndex]}</span><b>${view.scan.accepted === null ? "?" : view.scan.accepted ? "✓" : "✕"}</b></div>`;
  return `<section class="mf1552-yard" style="--slots:${Math.min(view.input.position.length, 10)}" aria-label="${vi ? "Các rổ và bóng đã đặt" : "Baskets and placed balls"}">
    <div class="mf1552-rail">${slots}</div>
    ${gap}
  </section>`;
}

function mf1552Placements(view) {
  const positions = view.scan.placed.map((index) => view.input.position[index]);
  const chain = positions.map((position, index) => {
    const previous = index === 0 ? "" : `<i><span>↔</span><b>${position - positions[index - 1]}</b></i>`;
    return `${previous}<span class="mf1552-chain-ball"><i></i><b>${position}</b></span>`;
  }).join("");
  const visible = Math.min(view.input.m, 7);
  const meter = Array.from({ length: visible }, (_, index) => `<span class="${index < view.scan.balls ? "filled" : ""}">●</span>`).join("");
  const decided = ["feasible", "too-far", "done"].includes(view.search.decision);
  const good = view.search.decision === "feasible" || view.search.decision === "done";
  return `<section class="mf1552-placement ${decided ? good ? "good" : "bad" : ""}">
    <div class="mf1552-chain" aria-label="Placed positions">${chain}</div>
    <div class="mf1552-meter" aria-label="${view.scan.balls} of ${view.input.m} balls">${meter}${view.input.m > visible ? `<em>+${view.input.m - visible}</em>` : ""}<strong>${view.scan.balls}<small>/ ${view.input.m}</small></strong></div>
  </section>`;
}

function mf1552Proof(view, language) {
  if (!view.final) return "";
  const vi = language === "vi";
  return `<section class="mf1552-proof">
    <div class="good"><b>d = ${view.answer}</b><span>${view.scan.balls} ● ≥ ${view.input.m}</span><strong>✓</strong></div>
    <div class="bad"><b>d = ${view.answer + 1}</b><span>${view.higherBalls} ● &lt; ${view.input.m}</span><strong>✕</strong></div>
    <p>${vi ? "lớn nhất" : "maximum"} = <b>${view.answer}</b></p>
  </section>`;
}

function renderMagneticForce1552View(step) {
  const host = typeof document !== "undefined" ? document.getElementById("treeView") : null;
  const view = step && step.magnetic1552View;
  if (!host || !view) return;
  const language = mf1552Language();
  const vi = language === "vi";
  const stage = mf1552Stage(view);
  const labels = vi ? ["KHOẢNG d", "ĐẶT BÓNG", "ĐỦ m?", "CUỐI ✓"] : ["DISTANCE d", "PLACE", "ENOUGH?", "LAST ✓"];
  host.innerHTML = `<section class="mf1552-viz ${view.final ? "is-final" : ""}" aria-label="${vi ? "Minh họa bài 1552" : "Problem 1552 visualization"}">
    <header class="mf1552-header"><div><small>LEETCODE 1552</small><h2>Magnetic Force</h2></div><div class="mf1552-goal"><span>${view.input.m}</span><b>●</b></div></header>
    <ol class="mf1552-stages">${labels.map((label, index) => `<li class="${index === stage ? "active" : index < stage ? "done" : ""}"><span>${["↔", "●", "⚖", "★"][index]}</span><small>${label}</small></li>`).join("")}</ol>
    <div class="mf1552-action" aria-live="polite"><strong>${mf1552Escape(mf1552Action(view, language))}</strong><span>${vi ? "DÒNG" : "LINE"} ${view.source.line}</span></div>
    ${mf1552Range(view)}
    ${mf1552Rail(view, language)}
    ${mf1552Placements(view)}
    ${mf1552Proof(view, language)}
    <div class="mf1552-code"><code>${mf1552Escape(view.source.text.trim())}</code></div>
  </section>`;
}
