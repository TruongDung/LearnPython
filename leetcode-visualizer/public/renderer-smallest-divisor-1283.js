"use strict";

function sd1283Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sd1283Language() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function sd1283Stage(view) {
  if (view.final) return 3;
  if (view.phase === "decide") return 2;
  if (view.phase === "divide") return 1;
  return 0;
}

function sd1283Action(view, language) {
  const vi = language === "vi";
  const actions = {
    "set-range": `[1, ${view.search.initialRight}]`,
    "range-open": `[${view.search.left}, ${view.search.right}]`,
    "choose-mid": `mid = ${view.search.mid}`,
    "reset-total": "Σ = 0",
    "pick-number": `${view.input.nums[view.scan.currentIndex]} ÷ ${view.search.mid}`,
    "add-ceiling": `Σ = ${view.scan.total}`,
    feasible: `${view.scan.total} ≤ ${view.input.threshold}  ✓`,
    "too-small": `${view.scan.total} > ${view.input.threshold}  ✕`,
    "keep-left": `right ← ${view.search.right}`,
    "discard-left": `left → ${view.search.left}`,
    answer: vi ? `Ước số nhỏ nhất = ${view.answer}` : `Smallest divisor = ${view.answer}`,
  };
  return actions[view.action] || view.action;
}

function sd1283Range(view) {
  const max = view.search.initialRight;
  const scale = (value) => max === 1 ? 50 : 100 * (value - 1) / (max - 1);
  const left = scale(view.search.left);
  const right = scale(view.search.right);
  const mid = view.search.mid === null ? null : scale(view.search.mid);
  const attempts = view.tested.map((attempt) => {
    const position = scale(attempt.divisor);
    return `<i class="${attempt.feasible ? "good" : "bad"}" style="left:${position}%" aria-label="${attempt.divisor}: ${attempt.total}"></i>`;
  }).join("");
  return `<section class="sd1283-range" aria-label="Binary search range">
    <div class="sd1283-track">
      <span class="sd1283-impossible" style="width:${left}%"></span>
      <span class="sd1283-possible" style="left:${right}%;width:${100 - right}%"></span>
      ${attempts}
      ${mid === null ? "" : `<b class="sd1283-mid" style="left:${mid}%"><em>M</em><strong>${view.search.mid}</strong></b>`}
    </div>
    <div class="sd1283-bounds"><span><b>L</b>${view.search.left}</span><span><b>R</b>${view.search.right}</span></div>
  </section>`;
}

function sd1283Chunks(num, divisor, quotient) {
  if (!divisor || quotient === null || quotient === undefined) {
    return '<span class="sd1283-unknown">?</span>';
  }
  const visible = Math.min(quotient, 6);
  const hidden = Math.max(0, quotient - visible);
  const parts = [];
  for (let index = 0; index < visible; index += 1) {
    const actualIndex = hidden > 0 && index === visible - 1 ? quotient - 1 : index;
    const used = actualIndex === quotient - 1 ? ((num - actualIndex * divisor) || divisor) : divisor;
    const fill = Math.max(8, Math.round(100 * used / divisor));
    parts.push(`<i class="${fill < 100 ? "partial" : "full"}" style="--fill:${fill}%"><span></span></i>`);
    if (hidden > 0 && index === visible - 2) parts.push(`<em>+${hidden}</em>`);
  }
  return parts.join("");
}

function sd1283Rows(view) {
  const divisor = view.search.mid || view.answer;
  const processed = view.scan.quotients.length;
  const indices = view.input.nums.length <= 8
    ? view.input.nums.map((_, index) => index)
    : [...new Set([0, 1, 2, 3, view.input.nums.length - 2, view.input.nums.length - 1, view.scan.currentIndex])]
      .filter((index) => Number.isInteger(index) && index >= 0 && index < view.input.nums.length)
      .sort((a, b) => a - b);
  let previous = -1;
  return indices.map((index) => {
    const gap = previous >= 0 && index > previous + 1 ? '<div class="sd1283-row-gap">•••</div>' : "";
    previous = index;
    const active = view.scan.currentIndex === index;
    const counted = index < processed;
    const preview = active && !counted;
    const quotient = counted ? view.scan.quotients[index] : preview ? view.scan.currentQuotient : view.final ? Math.ceil(view.input.nums[index] / divisor) : null;
    return `${gap}<article class="sd1283-row ${active ? "active" : ""} ${counted || view.final ? "counted" : "waiting"}">
      <strong class="sd1283-num">${view.input.nums[index]}</strong>
      <span class="sd1283-divide">÷ ${divisor || "?"}</span>
      <div class="sd1283-chunks" aria-label="${view.input.nums[index]} divided into ${quotient == null ? "unknown" : quotient} rounded groups">${sd1283Chunks(view.input.nums[index], divisor, quotient)}</div>
      <b class="sd1283-equals">⌈ ⌉ = ${quotient == null ? "?" : quotient}</b>
    </article>`;
  }).join("");
}

function sd1283Total(view, language) {
  const vi = language === "vi";
  const values = view.scan.quotients;
  const preview = view.scan.currentIndex !== null && view.scan.currentIndex === values.length ? view.scan.currentQuotient : null;
  const tiles = values.map((value) => `<span>${value}</span>`).join('<i>+</i>');
  const extra = preview === null ? "" : `${values.length ? "<i>+</i>" : ""}<span class="preview">${preview}</span>`;
  const total = view.scan.total === null ? "?" : view.scan.total;
  const decided = ["feasible", "too-small", "done"].includes(view.search.decision);
  const good = view.search.decision === "feasible" || view.search.decision === "done";
  return `<section class="sd1283-total ${decided ? good ? "good" : "bad" : ""}">
    <div class="sd1283-sum">${tiles || '<span class="empty">0</span>'}${extra}<b>= ${total}</b></div>
    <div class="sd1283-threshold"><small>threshold</small><strong>${view.input.threshold}</strong><em>${decided ? good ? "✓" : "✕" : "…"}</em></div>
    <p>${decided ? good ? `Σ ≤ ${view.input.threshold} · ${vi ? "thử nhỏ hơn" : "try smaller"} ←` : `Σ > ${view.input.threshold} · ${vi ? "cần lớn hơn" : "need larger"} →` : vi ? "Cộng các nhóm" : "Add the groups"}</p>
  </section>`;
}

function sd1283Proof(view) {
  if (!view.final) return "";
  const previous = view.previousTotal === null
    ? ""
    : `<div class="bad"><b>d = ${view.answer - 1}</b><span>Σ = ${view.previousTotal} > ${view.input.threshold}</span><strong>✕</strong></div>`;
  return `<section class="sd1283-proof">${previous}<div class="good"><b>d = ${view.answer}</b><span>Σ = ${view.scan.total} ≤ ${view.input.threshold}</span><strong>✓</strong></div></section>`;
}

function renderSmallestDivisor1283View(step) {
  const host = typeof document !== "undefined" ? document.getElementById("treeView") : null;
  const view = step && step.smallestDivisor1283View;
  if (!host || !view) return;
  const language = sd1283Language();
  const vi = language === "vi";
  const stage = sd1283Stage(view);
  const labels = vi ? ["KHOẢNG", "CHIA ⌈ ⌉", "SO NGƯỠNG", "ĐẦU TIÊN ✓"] : ["RANGE", "DIVIDE ⌈ ⌉", "CHECK", "FIRST ✓"];
  host.innerHTML = `<section class="sd1283-viz ${view.final ? "is-final" : ""}" aria-label="${vi ? "Minh họa bài 1283" : "Problem 1283 visualization"}">
    <header class="sd1283-header"><div><small>LEETCODE 1283</small><h2>Smallest Divisor</h2></div><div class="sd1283-target"><span>Σ ≤</span><strong>${view.input.threshold}</strong></div></header>
    <ol class="sd1283-stages">${labels.map((label, index) => `<li class="${index === stage ? "active" : index < stage ? "done" : ""}"><span>${["↔", "▦", "⚖", "★"][index]}</span><small>${label}</small></li>`).join("")}</ol>
    <div class="sd1283-action" aria-live="polite"><strong>${sd1283Escape(sd1283Action(view, language))}</strong><span>${vi ? "DÒNG" : "LINE"} ${view.source.line}</span></div>
    ${sd1283Range(view)}
    <section class="sd1283-machine"><div class="sd1283-divisor"><small>divisor</small><strong>${view.search.mid || view.answer || "?"}</strong></div><div class="sd1283-rows">${sd1283Rows(view)}</div></section>
    ${sd1283Total(view, language)}
    ${sd1283Proof(view)}
    <div class="sd1283-code"><code>${sd1283Escape(view.source.text.trim())}</code></div>
  </section>`;
}
