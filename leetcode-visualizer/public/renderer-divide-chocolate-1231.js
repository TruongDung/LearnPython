"use strict";

function dc1231Escape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function dc1231Language() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function dc1231Action(view, language) {
  const vi = language === "vi";
  const value = view.scan.index === null ? null : view.input.sweetness[view.scan.index];
  const labels = {
    "count-pieces": vi ? `${view.input.k} bạn + bạn = ${view.input.pieces} phần` : `${view.input.k} friends + you = ${view.input.pieces} pieces`,
    "lower-bound": `left = min = ${view.search.initialLeft}`,
    "upper-bound": `right = ${view.input.sweetness.reduce((sum, item) => sum + item, 0)} ÷ ${view.input.pieces} = ${view.search.initialRight}`,
    "range-open": `[${view.search.left}, ${view.search.right}]`,
    "try-mid": `🎯 mid = ${view.search.mid}`,
    "start-trial": vi ? `Thử mỗi phần ≥ ${view.search.target}` : `Try every piece ≥ ${view.search.target}`,
    "empty-counter": vi ? "0 phần" : "0 pieces",
    "empty-piece": "sum = 0",
    "pick-block": `🍫 ${value}`,
    "add-block": `sum = ${view.scan.current}`,
    enough: `${view.scan.current} ≥ ${view.search.target}  ✂`,
    "need-more": `${view.scan.current} < ${view.search.target}  →`,
    "make-cut": `✂  ${view.scan.made} / ${view.input.pieces}`,
    "new-piece": "sum ↩ 0",
    shareable: `${view.scan.made} ≥ ${view.input.pieces}  ✓`,
    "not-shareable": `${view.scan.made} < ${view.input.pieces}  ✕`,
    "keep-mid": vi ? `${view.search.mid} làm được ✓` : `${view.search.mid} works ✓`,
    "move-left-up": `left → ${view.search.left}`,
    "reject-mid": vi ? `${view.search.mid} quá lớn ✕` : `${view.search.mid} is too high ✕`,
    "move-right-down": `right → ${view.search.right}`,
    answer: vi ? `Tối ưu = ${view.answer}` : `Optimal = ${view.answer}`,
  };
  return labels[view.action] || view.action;
}

function dc1231Stage(view) {
  if (view.final || view.phase === "done") return 2;
  if (["cut", "decide"].includes(view.phase)) return 1;
  return 0;
}

function dc1231Search(view, language) {
  const vi = language === "vi";
  const low = view.search.initialLeft;
  const high = view.search.initialRight;
  const range = Math.max(1, high - low);
  const percent = (value) => `${Math.max(0, Math.min(100, ((value - low) / range) * 100))}%`;
  const candidate = view.answer ?? view.search.target ?? view.search.mid ?? view.search.left;
  const state = view.final ? "good" : view.search.feasible === true ? "good" : view.search.feasible === false ? "bad" : "trying";
  const tested = view.tested.map((attempt) => {
    const status = attempt.feasible ? "good" : "bad";
    return `<i class="dc1231-test ${status}" style="--at:${percent(attempt.target)}" aria-label="${attempt.target}: ${status}"></i>`;
  }).join("");
  return `<section class="dc1231-search">
    <div class="dc1231-target ${state}"><small>${vi ? "MỖI PHẦN" : "EACH PIECE"}</small><strong>${candidate}</strong><span>${state === "good" ? "✓" : state === "bad" ? "✕" : "?"}</span></div>
    <div class="dc1231-ruler" aria-label="Binary search from ${low} to ${high}">
      <div class="dc1231-range" style="--start:${percent(view.search.left)};--end:${percent(view.search.right)}"></div>
      ${tested}
      <i class="dc1231-pin" style="--at:${percent(candidate)}"><b>${candidate}</b></i>
      <span class="left">${low}</span><span class="right">${high}</span>
    </div>
  </section>`;
}

function dc1231Chocolate(view) {
  const values = view.input.sweetness;
  const largest = Math.max(...values);
  const cutSet = new Set(view.scan.cuts.filter((cut) => cut > 0 && cut < values.length));
  if (view.final) {
    view.partition.slice(0, -1).forEach((piece) => cutSet.add(piece.end));
  }
  const blocks = values.map((value, index) => {
    const group = Number.isInteger(view.scan.groupOf[index]) ? view.scan.groupOf[index] : null;
    const beforeCut = cutSet.has(index) ? `<span class="dc1231-scissors" aria-hidden="true">✂</span>` : "";
    const active = view.scan.index === index && !view.final;
    const future = index >= view.scan.processed && !view.final;
    const height = 46 + Math.round((value / largest) * 44);
    return `${beforeCut}<li class="dc1231-chunk ${active ? "active" : ""} ${future ? "future" : ""} ${group === null ? "" : `piece-${group % 6}`}" style="--height:${height}%;--grow:${Math.max(1, Math.sqrt(value)).toFixed(2)}" data-index="${index}">
      <span class="dc1231-chocolate-face"><i></i><i></i><i></i><i></i></span><strong>${value}</strong><small>#${index}</small>
    </li>`;
  }).join("");
  return `<section class="dc1231-bar" aria-label="Chocolate bar"><ol>${blocks}</ol></section>`;
}

function dc1231Pieces(view, language) {
  const vi = language === "vi";
  let pieces = view.final ? view.partition : view.scan.pieces;
  if (!view.final && view.scan.processed > 0) {
    const present = new Set(pieces.map((piece) => piece.piece));
    const currentGroup = view.scan.groupOf[Math.max(0, view.scan.processed - 1)];
    if (Number.isInteger(currentGroup) && !present.has(currentGroup)) {
      const indices = view.scan.groupOf.map((group, index) => group === currentGroup ? index : -1).filter((index) => index >= 0);
      const values = indices.map((index) => view.input.sweetness[index]);
      pieces = [...pieces, { piece: currentGroup, values, sum: values.reduce((sum, value) => sum + value, 0), complete: false }];
    }
  }
  const cards = [];
  const visibleSlots = Math.min(view.input.pieces, 8);
  for (let slot = 0; slot < visibleSlots; slot += 1) {
    const piece = pieces.find((item) => item.piece === slot);
    const complete = Boolean(piece && (view.final || piece.complete));
    const mini = piece ? piece.values.map((value) => `<i>${value}</i>`).join("") : "";
    cards.push(`<li class="dc1231-piece piece-${slot % 6} ${complete ? "complete" : ""} ${piece ? "filled" : "empty"}">
      <span class="dc1231-person" aria-hidden="true"><i></i><b></b></span>
      <div><small>P${slot + 1}</small><span>${mini || "· · ·"}</span></div>
      <strong>${piece ? piece.sum : "—"}</strong>
      <em>${complete ? "✓" : piece ? "…" : ""}</em>
    </li>`);
  }
  if (view.input.pieces > visibleSlots) cards.push(`<li class="dc1231-piece more">+${view.input.pieces - visibleSlots}</li>`);
  return `<section class="dc1231-sharing"><header><span>${vi ? "CHIA CHO" : "SHARE WITH"}</span><strong>${view.scan.made} / ${view.input.pieces}</strong></header><ol>${cards.join("")}</ol></section>`;
}

function renderDivideChocolate1231View(step) {
  const host = typeof document !== "undefined" ? document.getElementById("treeView") : null;
  const view = step && step.divideChocolate1231View;
  if (!host || !view) return;
  const language = dc1231Language();
  const vi = language === "vi";
  const stage = dc1231Stage(view);
  const stageLabels = vi ? ["ĐOÁN", "CẮT", "CHỐT"] : ["GUESS", "CUT", "KEEP"];
  const stageIcons = ["🎯", "✂", "🍫"];
  const stages = stageLabels.map((label, index) => `<li class="${index === stage ? "active" : index < stage ? "done" : ""}"><span>${stageIcons[index]}</span><small>${label}</small></li>`).join("");
  const source = view.source && typeof view.source.text === "string" ? view.source.text.trim() : "";
  host.innerHTML = `<section class="dc1231-viz ${view.final ? "is-final" : ""}" aria-label="${vi ? "Minh họa bài 1231" : "Problem 1231 visualization"}">
    <header class="dc1231-header">
      <div><small>LEETCODE 1231</small><h2>Divide Chocolate</h2></div>
      <div class="dc1231-people"><span>${view.input.pieces}</span><i aria-hidden="true"></i><small>${vi ? "PHẦN" : "PIECES"}</small></div>
    </header>
    <ol class="dc1231-stages">${stages}</ol>
    <div class="dc1231-action" aria-live="polite"><strong>${dc1231Escape(dc1231Action(view, language))}</strong><span>${view.final ? `${view.input.pieces} / ${view.input.pieces}` : `${view.scan.current || 0} / ${view.search.target ?? "?"}`}</span></div>
    ${dc1231Search(view, language)}
    ${dc1231Chocolate(view)}
    ${dc1231Pieces(view, language)}
    <div class="dc1231-code"><span>${vi ? "DÒNG" : "LINE"} ${view.source.line}</span><code>${dc1231Escape(source)}</code></div>
  </section>`;
}

