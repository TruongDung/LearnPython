"use strict";

function renderKSum2386View(step) {
  const v = step.kSum2386View;
  if (!v) return;
  const t = (vi, en) => lang === "vi" ? vi : en;
  const esc = value => escapeHtml(String(value));
  function short(value) {
    if (Math.abs(value) < 100000) return String(value);
    const unit = Math.abs(value) >= 1e12 ? 1e12 : Math.abs(value) >= 1e9 ? 1e9 : Math.abs(value) >= 1e6 ? 1e6 : 1e3;
    const scaled = Number((value / unit).toPrecision(3));
    return `${scaled * unit === value ? "" : "≈"}${scaled}${unit === 1e12 ? "T" : unit === 1e9 ? "B" : unit === 1e6 ? "M" : "K"}`;
  }
  const icons = { maximum: "Σ+", normalize: "|x| ↗", seed: "→ heap", pop: "↓ min", "branch-add": "+ ADD", "branch-replace": "⇄ REPLACE", done: "✓", inspect: "·" };
  const numbers = v.numbers.filter((item, index) => index < 12 || item.flipped).slice(0, 18);
  const numberTiles = numbers.map(item => `<span class="ks2386-number ${item.selected ? "selected" : "skipped"}${item.flipped ? item.value > 0 ? " removed" : " added" : ""}" data-original-index="${item.index}" title="nums[${item.index}] = ${item.value}" aria-label="${esc(`nums[${item.index}] = ${item.value}, ${item.selected ? t("được chọn", "selected") : t("bỏ qua", "skipped")}`)}"><small>#${item.index}</small><b>${esc(short(item.value))}</b><i>${item.selected ? "✓" : "×"}${item.flipped ? " ↻" : ""}</i></span>`).join("");
  const focused = v.normalized.filter(item => item.chosen || item.active || item.next);
  const normalized = [...v.normalized.slice(0, 8).filter(item => !focused.includes(item)), ...focused].sort((a, b) => a.sortedIndex - b.sortedIndex);
  const costTiles = normalized.map(item => `<span class="ks2386-cost${item.chosen ? " chosen" : ""}${item.active ? " active" : ""}${item.next ? " next" : ""}" title="values[${item.sortedIndex}] = |nums[${item.originalIndex}]| = ${item.value}"><small>i=${item.sortedIndex}</small><b>${esc(short(item.value))}</b><small>#${item.originalIndex} · |${esc(short(item.originalValue))}|</small></span>`).join("");
  const selected = v.witnessTruncated ? numbers.filter(item => item.selected).map(item => item.value) : v.selectedValues;
  const hiddenWitness = v.witnessTruncated || selected.length > 12;
  const witness = selected.slice(0, 12).map((value, index) => `${index ? '<i>+</i>' : ''}<b>${esc(value < 0 ? `(${short(value)})` : short(value))}</b>`).join("") || (hiddenWitness ? "" : "<b>∅</b>");

  const heap = v.frontier.slice(0, 7);
  const width = 280, height = heap.length ? 76 + Math.floor(Math.log2(heap.length)) * 70 : 70;
  const point = position => {
    const level = Math.floor(Math.log2(position + 1));
    return { x: (position - (2 ** level - 1) + 0.5) * width / (2 ** level), y: 38 + level * 70 };
  };
  const edges = heap.slice(1).map((entry, index) => {
    const p = point(Math.floor(index / 2)), q = point(index + 1);
    return `<line x1="${p.x}" y1="${p.y + 22}" x2="${q.x}" y2="${q.y - 22}"/>`;
  }).join("");
  const nodes = heap.map((entry, position) => {
    const p = point(position);
    const incoming = entry.id === v.branch?.child.id;
    return `<g class="ks2386-state${position === 0 ? " root" : ""}${incoming ? " incoming" : ""}" data-state-id="${entry.id}" role="img" aria-label="${esc(`heap[${position}] = (${entry.loss}, ${entry.index})`)}"><title>${esc(`(${entry.loss}, ${entry.index}) · #${entry.id} · {${entry.chosen.join(",")}}`)}</title><rect x="${p.x - 31}" y="${p.y - 22}" width="62" height="44" rx="9"/><text x="${p.x}" y="${p.y - 1}">${esc(short(entry.loss))}</text><text class="ks2386-state-index" x="${p.x}" y="${p.y + 14}">i=${entry.index}</text></g>`;
  }).join("");
  const heapPicture = `<svg class="ks2386-heap" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t("Min-heap: loss nhỏ nhất ở gốc; mỗi ô là (loss, index)", "Min-heap: the smallest loss is at the root; each box is (loss, index)"))}">${edges}${nodes || `<text class="ks2386-empty" x="140" y="43">∅</text>`}</svg>`;

  function subsetTiles(state, added = null) {
    return state.chosenValues.map((value, index) => `<b class="${state.chosen[index] === added ? "new" : ""}" title="values[${state.chosen[index]}] = ${value}">${esc(short(value))}<small>${state.chosen[index]}</small></b>`).join("") || "<b>∅</b>";
  }
  let expansion = "";
  if (v.expansion) {
    const x = v.expansion;
    const children = ["add", "replace"].map(type => {
      const child = x[type];
      const equation = type === "add" ? `${x.parent.loss} + ${x.next.value}` : `${x.parent.loss} − ${x.parent.chosenValues.at(-1)} + ${x.next.value}`;
      const removed = type === "replace" ? `<s title="values[${x.parent.index}]">${esc(short(x.parent.chosenValues.at(-1)))}</s><i>→</i>` : "<i>+</i>";
      return `<article class="ks2386-child ${type}${child.queued ? " queued" : " preview"}${v.branch?.type === type ? " active" : ""}" data-queued="${child.queued}"><header><strong>${type === "add" ? "+ ADD" : "⇄ REPLACE"}</strong><span>${child.queued ? "✓ heap" : "…"}</span></header><div class="ks2386-change">${removed}<b class="new">${esc(short(x.next.value))}</b></div><div class="ks2386-subset">${subsetTiles(child.state, x.next.sortedIndex)}</div><footer><small>${esc(equation)} =</small><b>${esc(child.state.loss)}</b></footer></article>`;
    }).join("");
    expansion = `<section class="ks2386-expansion"><div class="ks2386-parent"><div class="ks2386-subset">${subsetTiles(x.parent)}</div><strong>Σ ${esc(x.parent.loss)}</strong></div><svg class="ks2386-fork" viewBox="0 0 400 34" preserveAspectRatio="none" aria-hidden="true"><path d="M200,0 V16 M100,34 V16 H300 V34"/></svg><div class="ks2386-children">${children}</div></section>`;
  } else if (v.current) {
    expansion = `<div class="ks2386-leaf">(${v.current.loss}, ${v.current.index}) <b>⊣</b></div>`;
  }

  const history = v.history.length <= 12 ? v.history : [...v.history.slice(0, 2), ...v.history.slice(-9)];
  const ranks = history.map((entry, index) => `${index && entry.rank !== history[index - 1].rank + 1 ? '<i>…</i>' : ''}<article class="ks2386-rank${entry.rank === v.rank ? " active" : ""}${entry.rank === v.k ? " target" : ""}" data-rank="${entry.rank}" title="maximum − loss = ${v.maximum} − ${entry.loss} = ${entry.sum}"><small>#${entry.rank}</small><b>${esc(short(entry.sum))}</b></article>`).join("");
  $("treeView").innerHTML = `<section class="ks2386-viz" aria-label="${esc(t("Xếp hạng tổng bằng cây min-heap", "Rank subsequence sums with a min-heap tree"))}">
    <header class="ks2386-heading"><span>${icons[v.phase] || "·"} <small>L${v.source.line}</small>${v.condition === null ? "" : `<em class="ks2386-condition ${v.condition ? "true" : "false"}">${v.condition ? "True" : "False"}</em>`}</span><strong>#${v.rank} / ${v.k}${step.final ? " ✓" : ""}</strong></header>
    <div class="ks2386-equation"><span><small>maximum</small><b>${esc(v.maximum)}</b></span><i>−</i><span class="loss"><small>loss</small><b>${esc(v.loss)}</b></span><i>=</i><span class="result"><small>${t("tổng", "sum")}</small><b>${esc(v.candidate)}</b></span></div>
    <section class="ks2386-selection"><div class="ks2386-label">nums · <span>✓ ${t("lấy", "take")} · × ${t("bỏ", "skip")} · ↻ flip</span></div><div class="ks2386-numbers">${numberTiles}${v.n > numbers.length ? `<small>… +${v.n - numbers.length}</small>` : ""}</div><div class="ks2386-witness">${witness}${hiddenWitness ? `<i>${selected.length ? "+ " : ""}…</i>` : ""}<i>=</i><strong>${esc(v.candidate)}</strong></div></section>
    ${v.source.line >= 7 ? `<section class="ks2386-normalized"><div class="ks2386-label">|nums| ↗ <span>${t("viền vàng: index · xanh lam: index + 1", "gold: index · cyan: index + 1")}</span></div><div class="ks2386-costs">${costTiles}${v.n > normalized.length ? `<small>… +${v.n - normalized.length}</small>` : ""}</div></section>` : ""}
    ${v.source.line >= 10 || v.current ? `<div class="ks2386-engine${expansion ? " paired" : ""}"><section class="ks2386-frontier"><header><strong>min-heap ↓</strong><span>${v.frontierSize}${v.frontierSize > heap.length ? ` · +${v.frontierSize - heap.length} ${t("ô khác", "more")}` : ""}</span></header>${heapPicture}</section>${expansion}</div>` : ""}
    <div class="ks2386-ranks" aria-label="${esc(t("Tổng theo từng thứ hạng; tổng trùng vẫn giữ hạng riêng", "Sums by rank; equal sums keep separate ranks"))}">${ranks}</div>
    ${v.traceTruncated ? `<small class="ks2386-caption">⏩ ${t("Bước giữa đã rút gọn", "Intermediate steps condensed")}</small>` : ""}
  </section>`;
}
