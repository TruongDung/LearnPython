"use strict";

function km1539Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function km1539Language() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function km1539Action(view, language) {
  const vi = language === "vi";
  const actions = {
    "set-range": `[0, ${view.input.arr.length})`,
    "range-open": `[${view.search.left}, ${view.search.right})`,
    "choose-mid": `🎯 mid = ${view.search.mid}`,
    "count-holes": `${view.input.arr[view.search.mid]} − (${view.search.mid} + 1) = ${view.search.missing}`,
    "too-few": `${view.search.missing} < ${view.input.k}  →`,
    enough: `${view.search.missing} ≥ ${view.input.k}  ←`,
    "move-right": `left → ${view.search.left}`,
    "move-left": `right → ${view.search.right}`,
    answer: vi ? `Ô trống #${view.input.k} = ${view.answer}` : `Missing #${view.input.k} = ${view.answer}`,
  };
  return actions[view.action] || view.action;
}

function km1539Stage(view) {
  if (view.final) return 2;
  if (["count", "decide"].includes(view.phase)) return 1;
  return 0;
}

function km1539IndexStrip(view) {
  const cells = view.input.arr.map((value, index) => {
    const holes = value - (index + 1);
    const active = view.search.mid === index;
    const kept = index >= view.search.left && index < view.search.right;
    const history = view.history.find((item) => item.mid === index);
    const state = history ? history.decision : "";
    return `<li class="km1539-index ${active ? "active" : ""} ${kept || view.final ? "" : "discarded"} ${state}">
      <small>#${index}</small><strong>${value}</strong><span>${holes}</span>
      ${active ? '<i aria-hidden="true">⌄</i>' : ""}
    </li>`;
  }).join("");
  const insertion = view.final ? `<li class="km1539-index insertion"><small>#${view.insertionIndex}</small><strong>＋</strong><span>${view.input.k}</span></li>` : "";
  return `<section class="km1539-indices" aria-label="Binary search indices"><ol>${cells}${insertion}</ol></section>`;
}

function km1539VisibleNumbers(view) {
  const arr = view.input.arr;
  const focus = view.final ? view.answer : view.search.mid === null ? arr[0] : arr[view.search.mid];
  const limit = Math.max(arr[arr.length - 1], focus);
  if (limit <= 28) return Array.from({ length: limit }, (_, index) => index + 1);
  const chosen = new Set();
  for (let value = 1; value <= Math.min(7, limit); value += 1) chosen.add(value);
  for (let delta = -4; delta <= 4; delta += 1) {
    if (focus + delta >= 1 && focus + delta <= limit) chosen.add(focus + delta);
  }
  arr.forEach((value) => chosen.add(value));
  if (view.final) chosen.add(view.answer);
  return [...chosen].sort((a, b) => a - b);
}

function km1539NumberLine(view, language) {
  const vi = language === "vi";
  const arrSet = new Set(view.input.arr);
  const numbers = km1539VisibleNumbers(view);
  const focus = view.final ? view.answer : view.search.mid === null ? null : view.input.arr[view.search.mid];
  let previous = null;
  const slots = numbers.map((number) => {
    const gap = previous !== null && number > previous + 1 ? `<li class="km1539-ellipsis" aria-hidden="true">•••</li>` : "";
    previous = number;
    const present = arrSet.has(number);
    const missingRank = number - view.input.arr.filter((value) => value <= number).length;
    const target = view.final && number === view.answer;
    const scanned = focus !== null && number <= focus;
    const future = !view.final && focus !== null && number > focus;
    return `${gap}<li class="km1539-slot ${present ? "present" : "missing"} ${target ? "target" : ""} ${scanned ? "scanned" : ""} ${future ? "future" : ""}" data-number="${number}">
      ${target ? '<i aria-hidden="true">★</i>' : ""}<strong>${number}</strong><small>${present ? "●" : `○${missingRank}`}</small>
    </li>`;
  }).join("");
  return `<section class="km1539-line"><header><span>${vi ? "TRỤC SỐ" : "NUMBER LINE"}</span><strong>k = ${view.input.k}</strong></header><ol>${slots}</ol><div class="km1539-rail"></div></section>`;
}

function km1539GapPicture(view, language) {
  const vi = language === "vi";
  if (view.final) {
    const leftIcons = Array.from({ length: Math.min(view.insertionIndex, 7) }, () => "<i></i>").join("");
    const holeIcons = Array.from({ length: Math.min(view.input.k, 7) }, (_, index) => `<i class="hole ${index === Math.min(view.input.k, 7) - 1 ? "last" : ""}"></i>`).join("");
    return `<section class="km1539-picture final"><div><small>left = ${view.insertionIndex}</small><span>${leftIcons || "∅"}</span></div><b>＋</b><div><small>k = ${view.input.k}</small><span>${holeIcons}</span></div><b>＝</b><strong>${view.answer}</strong></section>`;
  }
  if (view.search.mid === null || view.search.missing === null) {
    return `<section class="km1539-picture waiting"><span>1</span><i></i><i></i><i></i><span>?</span></section>`;
  }
  const shown = Math.min(view.search.missing, 8);
  const holes = Array.from({ length: shown }, () => '<i class="hole"></i>').join("");
  const more = view.search.missing > shown ? `<em>+${view.search.missing - shown}</em>` : "";
  return `<section class="km1539-picture"><div class="expected"><small>${vi ? "ĐÚNG CHỖ" : "EXPECTED"}</small><strong>${view.search.mid + 1}</strong></div><span class="km1539-gap">${holes || '<i class="zero">0</i>'}${more}</span><div class="actual"><small>arr[mid]</small><strong>${view.input.arr[view.search.mid]}</strong></div></section>`;
}

function renderKthMissing1539View(step) {
  const host = typeof document !== "undefined" ? document.getElementById("treeView") : null;
  const view = step && step.kthMissing1539View;
  if (!host || !view) return;
  const language = km1539Language();
  const vi = language === "vi";
  const stage = km1539Stage(view);
  const labels = vi ? ["KHOANH", "ĐẾM LỖ", "ĐÁP ÁN"] : ["RANGE", "COUNT", "ANSWER"];
  const icons = ["⌗", "○", "★"];
  const stages = labels.map((label, index) => `<li class="${index === stage ? "active" : index < stage ? "done" : ""}"><span>${icons[index]}</span><small>${label}</small></li>`).join("");
  host.innerHTML = `<section class="km1539-viz ${view.final ? "is-final" : ""}" aria-label="${vi ? "Minh họa bài 1539" : "Problem 1539 visualization"}">
    <header class="km1539-header"><div><small>LEETCODE 1539</small><h2>Kth Missing Positive</h2></div><div class="km1539-goal"><span>k</span><strong>${view.input.k}</strong></div></header>
    <ol class="km1539-stages">${stages}</ol>
    <div class="km1539-action" aria-live="polite"><strong>${km1539Escape(km1539Action(view, language))}</strong><span>${view.search.left} · ${view.search.right}</span></div>
    ${km1539IndexStrip(view)}
    ${km1539GapPicture(view, language)}
    ${km1539NumberLine(view, language)}
    <div class="km1539-code"><span>${vi ? "DÒNG" : "LINE"} ${view.source.line}</span><code>${km1539Escape(view.source.text.trim())}</code></div>
  </section>`;
}

