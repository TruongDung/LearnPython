"use strict";

function mn76Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function mn76Copy() {
  const vi = typeof lang !== "undefined" && lang === "vi";
  return { locale: vi ? "vi" : "en", region: vi ? "Cửa sổ nhỏ nhất" : "Minimum window",
    after: vi ? "Sau dòng" : "After line", expand: vi ? "Mở R" : "Expand R", shrink: vi ? "Co L" : "Shrink L",
    update: vi ? "Đang cập nhật" : "Updating", covered: vi ? "Đủ → co L" : "Covered → shrink L",
    finalShort: vi ? "Cuối chuỗi · còn thiếu" : "End of input · still owed", finalCovered: vi ? "Đã đủ ký tự" : "Characters covered",
    owed: vi ? "Thiếu → mở R" : "Owed → expand R", missing: "missing", current: vi ? "Cửa sổ hiện tại" : "Current window",
    best: vi ? "Tốt nhất đã lưu" : "Saved best", answer: vi ? "Đáp án" : "Answer", none: vi ? "Chưa có" : "None yet",
    notFound: vi ? "Không có cửa sổ đủ t" : "No window covers t", result: vi ? "Kết quả ↠" : "Result ↠",
    emptyInput: vi ? "s hoặc t rỗng" : "s or t is empty",
    newBest: vi ? "✓ MỚI" : "✓ NEW",
    nextRight: vi ? "R tiếp →" : "Next R →", nextLeft: vi ? "L tiếp →" : "Next L →", nextBest: vi ? "Best tiếp →" : "Next best →",
    length: vi ? "Dài" : "Length", surplus: vi ? "Thừa" : "Surplus", required: vi ? "Cần phủ t" : "Cover t",
    window: vi ? "Cửa sổ" : "Window", pending: vi ? "Đang thêm/bỏ" : "Adding/removing", first: vi ? "Chưa có best → ghi lại" : "No best yet → save",
    presets: vi ? ["ABC", "AAB", "Ký tự thừa", "Không đủ", "A ≠ a", "t = ∅", "s = ∅"] : ["ABC", "AAB", "Surplus", "Not enough", "A ≠ a", "t = ∅", "s = ∅"],
  };
}

function mn76Tape(v, t) {
  const pitch = 50, top = 40, best = v.best, width = (v.s.length + 1) * pitch + 16;
  const band = v.windowLength > 0 ? `<div class="mn76-window-band ${v.covered ? "is-covered" : ""}" style="left:${5 + v.left * pitch}px;width:${v.windowLength * pitch}px" data-window-left="${v.left}" data-window-right="${v.right}"></div>` : "";
  const bestBand = best ? `<div class="mn76-best-band" style="left:${8 + best.start * pitch}px;width:${best.length * pitch - 6}px" data-best-start="${best.start}" data-best-end="${best.end}"></div>` : "";
  const tiles = [...v.chars, { index: v.s.length, char: "∅", eof: true }].map(c => {
    const isLeft = c.index === v.left, isRight = c.index === v.right;
    const pending = v.pending?.index === c.index ? v.pending.kind : null;
    return `<span class="mn76-tile ${c.eof ? "is-eof" : ""} ${c.inWindow ? "is-window" : ""} ${c.required ? "is-required" : ""} ${c.counted ? "is-counted" : ""} ${pending ? `is-${pending}` : ""}" style="left:${8 + c.index * pitch}px;top:${top}px" data-source-index="${c.index}" data-source-char="${mn76Escape(c.char)}" data-counted="${Boolean(c.counted)}"><small>${c.eof ? "END" : c.index}</small><b>${c.char}</b>${isLeft ? '<em class="mn76-l">L</em>' : ""}${isRight ? '<em class="mn76-r">R</em>' : ""}${pending ? `<i class="mn76-pending">${pending === "add" ? "+" : "−"}</i>` : ""}</span>`;
  }).join("");
  return `<section class="mn76-tape"><header><b>s</b><span>[${v.left ?? "—"}..${v.right ?? "—"}]</span></header><div class="mn76-tape-scroll" tabindex="0" role="region" aria-label="s"><div class="mn76-track" style="width:${width}px">${band}${bestBand}${tiles}</div></div><div class="mn76-overview" aria-label="${t.window}">${v.chars.map(c => `<span class="${c.inWindow ? "is-window" : ""} ${c.inBest ? "is-best" : ""}" title="${c.index}: ${c.char}"></span>`).join("")}</div><div class="mn76-legend"><span class="is-window">▱ ${t.window}</span><span class="is-best">━ best</span><span>+/− ${t.pending}</span></div></section>`;
}

function mn76Need(v, t) {
  return `<section class="mn76-target"><header><b>t = “${v.t || "∅"}”</b><small>${t.required}</small></header><div class="mn76-need-grid">${v.need.map(item => {
    const filled = item.inside === null ? 0 : Math.min(item.required, item.inside), surplus = item.count < 0 ? -item.count : 0;
    const selected = v.change?.char === item.char;
    return `<div class="mn76-need is-${item.state} ${selected ? "is-changing" : ""}" data-need-char="${item.char}" data-need-count="${item.count}"><header><b>${item.char}</b><span>need <strong>${item.count === null ? "—" : item.count > 0 ? `+${item.count}` : item.count}</strong></span></header><div class="mn76-quota">${Array.from({ length: item.required }, (_, i) => `<i class="${i < filled ? "is-in" : ""}">${item.char}</i>`).join("")}${surplus ? `<small class="mn76-surplus">+${surplus} ${t.surplus}</small>` : ""}</div></div>`;
  }).join("") || '<span class="mn76-empty">∅</span>'}</div></section>`;
}

function mn76Status(v, t) {
  const pending = v.pending !== null || v.missing === null;
  const atEnd = v.answer !== null || v.source.line === 11 && v.branch === false;
  const status = v.resultReason === "empty-input" ? t.emptyInput : pending ? t.update
    : atEnd ? v.covered ? t.finalCovered : t.finalShort : v.covered ? t.covered : t.owed;
  return `<div class="mn76-state"><div class="mn76-missing ${pending ? "is-pending" : v.covered ? "is-covered" : "is-owed"}"><small>missing</small><b data-missing="${v.missing}">${v.missing ?? "—"}</b><span>${status}</span></div><div class="mn76-current"><small>${t.current} · ${t.length} ${v.windowLength ?? "—"}</small><code>${v.windowText === null ? "—" : v.windowText || "∅"}</code></div></div>`;
}

function mn76Best(v, t) {
  const final = v.answer !== null, best = v.best;
  const comparison = v.comparison && !v.bestChange ? `<div class="mn76-compare" data-comparison="${v.comparison.better}">${v.comparison.first ? t.first : `${v.comparison.length} ${v.comparison.better ? "&lt;" : "≥"} ${v.comparison.oldBest.length}`} <b>${v.comparison.better ? "✓" : "↩"}</b></div>` : "";
  return `<section class="mn76-best ${v.bestChange ? "is-new" : ""} ${final ? "is-final" : ""}" data-best-text="${best?.text ?? ""}"><header><b>${final ? t.answer : t.best}</b><span>${v.bestChange ? t.newBest : best ? `${t.length} ${best.length}` : "—"}</span></header><strong class="mn76-best-value">${best?.text || "∅"}</strong><small>${best ? `s[${best.start}:${best.end}]` : v.resultReason === "empty-input" ? t.emptyInput : final ? t.notFound : t.none}</small>${comparison}</section>`;
}

function mn76Jump(kind) {
  if (typeof steps === "undefined" || typeof renderStep !== "function") return;
  if (typeof stopPlay === "function") stopPlay();
  const next = steps.findIndex((s, index) => {
    const v = s.minWindow76View;
    return index > stepIndex && v && (kind === "result" ? v.answer !== null
      : kind === "right" ? v.source.line === 11 && v.branch === true : kind === "left" ? v.source.line === 21 : v.source.line === 17);
  });
  stepIndex = next < 0 ? steps.length - 1 : next; renderStep();
}

function mn76Bind(host) {
  const bind = (selector, action) => host.querySelectorAll(selector).forEach(node => {
    node.addEventListener("click", () => action(node));
    node.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); action(node); }
    });
  });
  bind("[data-mn76-jump]", node => mn76Jump(node.dataset.mn76Jump));
  bind("[data-mn76-case]", node => {
    if (typeof runViz !== "function") return;
    const cases = [["ADOBECODEBANC", "ABC"], ["AAAB", "AAB"], ["bba", "ab"], ["a", "aa"], ["Ab", "ab"], ["ABC", ""], ["", "A"]];
    const [s, target] = cases[Number(node.dataset.mn76Case)];
    document.getElementById("arrInput").value = s;
    const field = document.querySelector('[data-param="t"]'); if (field) field.value = target;
    runViz();
  });
}

function renderMinimumWindow76Pictures(step) {
  const host = document.getElementById("treeView"), v = step.minWindow76View, t = mn76Copy();
  if (!host || !v) return;
  const oldScroll = host.querySelector(".mn76-tape-scroll")?.scrollLeft ?? 0;
  const phase = ["expand", "shrink", "done"].map((key, index) => `<span class="${v.stage === key ? "is-active" : ""}"><i>${["R →", "L →", "✓"][index]}</i>${key === "done" ? t.answer : t[key]}</span>`).join('<i class="mn76-phase-arrow">→</i>');
  const change = v.change ? `<div class="mn76-change" data-change-name="${v.change.name}"><code>${v.change.name}</code><span>${v.change.before}</span><i>→</i><b>${v.change.after}</b></div>` : "";
  host.innerHTML = `<article class="mn76-viz" role="region" aria-label="${t.region}" data-source-line="${v.source.line}">
    <header class="mn76-header"><div><small>LEETCODE 76 · SLIDING WINDOW</small><h2>${mn76Escape(v.phase[t.locale])}</h2></div><span class="mn76-target-size">|t| = ${v.t.length}</span></header>
    <nav class="mn76-presets" aria-label="Examples">${t.presets.map((label, index) => `<button type="button" data-mn76-case="${index}">${label}</button>`).join("")}</nav>
    <div class="mn76-phases">${phase}</div>
    <div class="mn76-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${mn76Escape(v.source.text)}</code>${v.branch === null ? "" : `<strong class="${v.branch ? "is-true" : "is-false"}" data-branch="${v.branch}">${v.branch ? "True ✓" : "False ×"}</strong>`}</div>
    ${mn76Tape(v, t)}${change}${mn76Need(v, t)}${mn76Status(v, t)}${mn76Best(v, t)}
    <footer class="mn76-footer"><div><button type="button" data-mn76-jump="right">${t.nextRight}</button><button type="button" data-mn76-jump="left">${t.nextLeft}</button><button type="button" data-mn76-jump="best">${t.nextBest}</button><button type="button" data-mn76-jump="result">${t.result}</button></div><small>O(|s| + |t|) time</small></footer>
  </article>`;
  const scroller = host.querySelector(".mn76-tape-scroll");
  if (scroller) {
    scroller.scrollLeft = oldScroll;
    // Keep both ends of a short window visible; pan to the executing cursor
    // when the whole window is wider than the local diagram viewport.
    const range = v.best && (v.answer !== null || v.source.line === 17) ? [v.best.start, v.best.end - 1]
      : v.windowLength > 0 ? [v.left, v.right] : null;
    let shownRange = false;
    if (range) {
      const first = host.querySelector(`[data-source-index="${range[0]}"]`), last = host.querySelector(`[data-source-index="${range[1]}"]`);
      if (first && last) {
        const box = scroller.getBoundingClientRect(), a = first.getBoundingClientRect(), b = last.getBoundingClientRect();
        if (b.right - a.left <= box.width - 4) {
          if (a.left < box.left + 2) scroller.scrollLeft -= box.left + 2 - a.left;
          else if (b.right > box.right - 2) scroller.scrollLeft += b.right - box.right + 2;
          shownRange = true;
        }
      }
    }
    const focus = v.answer !== null && v.best ? v.best.start : v.source.line === 17 ? v.best.start : v.change?.index ?? v.pending?.index ?? v.right ?? v.left;
    const target = host.querySelector(`[data-source-index="${focus}"]`);
    if (target && !shownRange) {
      const box = scroller.getBoundingClientRect(), tile = target.getBoundingClientRect(), pad = 8;
      if (tile.left < box.left + pad) scroller.scrollLeft -= box.left + pad - tile.left;
      if (tile.right > box.right - pad) scroller.scrollLeft += tile.right - box.right + pad;
    }
  }
  mn76Bind(host);
}
