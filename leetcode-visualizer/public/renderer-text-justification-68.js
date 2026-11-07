"use strict";

function tj68Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function tj68Copy() {
  const vi = typeof lang !== "undefined" && lang === "vi";
  return { locale: vi ? "vi" : "en", region: vi ? "Căn đều từng dòng" : "Justify each line",
    after: vi ? "Sau dòng" : "After line", pack: vi ? "Gom" : "Pack", divide: vi ? "Chia" : "Divide",
    build: vi ? "Ghép" : "Build", save: vi ? "Lưu" : "Save", done: vi ? "Xong" : "Done",
    draft: vi ? "Nháp · mỗi khe 1 dấu cách" : "Draft · one space per gap", parts: "parts", line: "line",
    fit: vi ? "Vừa" : "Fits", noFit: vi ? "Sang dòng sau" : "Next line", letters: vi ? "Chữ" : "Letters",
    gap: vi ? "Khe" : "Gap", nextWord: vi ? "Từ tiếp →" : "Next word →", nextGap: vi ? "Khe tiếp →" : "Next gap →",
    result: vi ? "Kết quả ↠" : "Result ↠", output: vi ? "Dòng đã lưu" : "Saved lines",
    space: vi ? "Khoảng trắng" : "Spaces", extra: vi ? "+1 bên trái" : "+1 on the left",
    padding: vi ? "Bù bên phải" : "Right padding", single: vi ? "1 từ → căn trái" : "One word → left align",
    last: vi ? "Dòng cuối → căn trái" : "Last line → left align", target: vi ? "Cần" : "Needs",
  };
}

function tj68Queue(v) {
  return `<div class="j68-words">${v.words.map((word, index) => {
    const done = index < v.completedWords, selected = v.range && index >= v.range.start && index < v.range.end;
    const candidate = v.fit?.index === index;
    return `<span class="j68-word ${done ? "is-done" : selected ? "is-selected" : ""} ${candidate ? v.fit.fits ? "is-fits" : "is-rejected" : ""}" data-word-index="${index}"><small>${index}</small><b>${tj68Escape(word)}</b>${candidate ? `<i>${v.fit.fits ? "✓" : "↳"}</i>` : ""}</span>`;
  }).join("")}</div>`;
}

function tj68Board(v, t, showSpaces) {
  const ruler = Array.from({ length: v.maxWidth }, (_, i) => `<span>${i + 1}</span>`).join("");
  const cells = Array.from({ length: v.maxWidth }, (_, i) => {
    const cell = v.cells[i], written = cell && v.written && i >= v.written.from && i < v.written.to;
    const char = cell?.char ?? "", kind = cell?.kind ?? "empty";
    return `<span class="j68-cell is-${kind} ${written ? "is-written" : ""}" data-col="${i + 1}" data-char="${tj68Escape(char)}" data-cell-kind="${kind}" aria-label="${i + 1}: ${char === " " ? t.space : char || "—"}">${char === " " ? showSpaces ? "·" : "&nbsp;" : tj68Escape(char)}</span>`;
  }).join("");
  return `<section class="j68-board"><header><b>${t[v.boardMode]}</b><span>${v.cells.length} / ${v.maxWidth}</span></header><div class="j68-cell-scroll" tabindex="0" role="region" aria-label="maxWidth ${v.maxWidth}"><div class="j68-ruler">${ruler}</div><div class="j68-cells">${cells}</div></div><div class="j68-legend"><span class="is-letter">▰ ${t.letters}</span><span class="is-gap">· ${t.space}</span><span class="is-extra">· ${t.extra}</span><span class="is-padding">· ${t.padding}</span></div></section>`;
}

function tj68Fit(v, t) {
  if (!v.fit) return "";
  const f = v.fit;
  return `<div class="j68-fit ${f.fits ? "is-fits" : "is-rejected"}" data-fit="${f.fits}"><span class="j68-fit-word">+ ${tj68Escape(f.word)}</span><div class="j68-equation"><b>${f.letters}</b><i>+</i><b>${f.wordLength}</b><i>+</i><b>${f.gaps}</b><i>=</i><strong>${f.needed}</strong><i>${f.fits ? "≤" : ">"}</i><b>${v.maxWidth}</b></div><small>${f.fits ? `✓ ${t.fit}` : `↳ ${t.noFit}`}</small></div>`;
}

function tj68Distribution(v, t) {
  if (v.mode === "left") {
    const padding = v.lineReady ? v.cells.filter(cell => cell.kind === "padding").length : null;
    return `<div class="j68-left" data-align="left"><b>${v.reason === "last" ? t.last : t.single}</b><span>${padding === null ? "…" : `${padding} × · →`} ${t.padding}</span></div>`;
  }
  if (!v.plan) return "";
  const p = v.plan;
  return `<section class="j68-distribution"><div class="j68-division"><b>${p.total}</b><i>÷</i><b>${p.gaps}</b><i>→</i><span>spaces <b>${p.base}</b></span><span>extra <b>${p.extra}</b></span></div><div class="j68-gap-cards">${p.widths.map((width, gap) => {
    const active = v.activeGap === gap, applied = v.allocated[gap] !== null;
    const dots = Array.from({ length: width }, (_, offset) => `<i class="${offset >= p.base ? "is-extra" : ""}">·</i>`).join("");
    return `<div class="j68-gap ${active ? "is-active" : ""} ${applied ? "is-applied" : ""}" data-gap-index="${gap}" data-gap-planned="${width}" data-gap-applied="${v.allocated[gap]}"><small>${t.gap} ${gap + 1}${applied ? " ✓" : ""}</small><div class="j68-gap-dots">${dots}</div><b>${active && v.currentWidth !== null ? `width = ${v.currentWidth}` : `${p.base}${gap < p.extra ? " + 1" : ""}`}</b><span>${tj68Escape(v.lineWords[gap])} ↔ ${tj68Escape(v.lineWords[gap + 1])}</span></div>`;
  }).join("")}</div></section>`;
}

function tj68Output(v, t, showSpaces) {
  if (!v.output?.length) return "";
  return `<section class="j68-output ${v.answer !== null ? "is-final" : ""}"><header><b>${t.output}</b><span>${v.output.length}${v.answer !== null ? " ✓" : ""}</span></header>${v.output.map((line, index) => `<div class="j68-output-row" data-output-index="${index}" data-output-value="${tj68Escape(line)}"><small>${index + 1}</small><code>${tj68Escape(showSpaces ? line.replace(/ /g, "·") : line)}</code><b>${line.length}/${v.maxWidth}</b></div>`).join("")}</section>`;
}

function tj68Jump(kind) {
  if (typeof steps === "undefined" || typeof renderStep !== "function") return;
  if (typeof stopPlay === "function") stopPlay();
  const index = steps.findIndex((s, i) => {
    const v = s.textJustification68View;
    return i > stepIndex && v && (kind === "result" ? v.answer !== null : kind === "word" ? v.source.line === 12 || v.source.line === 8 : v.source.line === 22);
  });
  stepIndex = index < 0 ? steps.length - 1 : index; renderStep();
}

function tj68Bind(host) {
  const bind = (selector, action) => host.querySelectorAll(selector).forEach(node => {
    node.addEventListener("click", () => action(node));
    node.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); action(node); }
    });
  });
  bind("[data-j68-jump]", node => tj68Jump(node.dataset.j68Jump));
  bind("[data-j68-spaces]", () => {
    host.dataset.tj68Spaces = host.dataset.tj68Spaces === "hidden" ? "visible" : "hidden";
    if (typeof renderStep === "function") renderStep();
  });
  bind("[data-j68-case]", node => {
    if (typeof runViz !== "function") return;
    const cases = [
      [["This", "is", "an", "example", "of", "text", "justification."], 16],
      [["ab", "c", "d", "efghi"], 7],
      [["What", "must", "be", "acknowledgment", "shall", "be"], 16],
      [["a", "bb", "c"], 8], [["a", "b", "c"], 1],
    ];
    const [words, width] = cases[Number(node.dataset.j68Case)];
    document.getElementById("arrInput").value = JSON.stringify(words);
    const field = document.querySelector('[data-param="maxWidth"]'); if (field) field.value = width;
    runViz();
  });
}

function renderTextJustification68View(step) {
  const host = document.getElementById("treeView"), v = step.textJustification68View, t = tj68Copy();
  if (!host || !v) return;
  const showSpaces = host.dataset?.tj68Spaces !== "hidden", oldScroll = host.querySelector(".j68-cell-scroll")?.scrollLeft ?? 0;
  const phases = ["pack", "divide", "build", "save"].map((key, index) => `<span class="${v.stage === key || v.stage === "done" && key === "save" ? "is-active" : ""}"><i>${["▤", "÷", "⇢", "✓"][index]}</i>${t[key]}</span>`).join('<i class="j68-phase-arrow">→</i>');
  const presetNames = t.locale === "vi" ? ["Mẫu · 16", "Dư 1", "1 từ", "Dòng cuối", "Rộng 1"]
    : ["Example · 16", "1 extra", "1 word", "Last line", "Width 1"];
  host.innerHTML = `<article class="j68-viz" style="--j68-columns:${v.maxWidth}" role="region" aria-label="${t.region}" data-source-line="${v.source.line}">
    <header class="j68-header"><div><small>LEETCODE 68 · GREEDY</small><h2>${tj68Escape(v.phase[t.locale])}</h2></div><b class="j68-width">↔ ${v.maxWidth}</b></header>
    <nav class="j68-presets" aria-label="Examples">${presetNames.map((label, index) => `<button type="button" data-j68-case="${index}">${label}</button>`).join("")}<button type="button" data-j68-spaces aria-pressed="${showSpaces}" aria-label="${t.space}">· ${t.space}</button></nav>
    ${tj68Queue(v)}<div class="j68-phases">${phases}</div>
    <div class="j68-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${tj68Escape(v.source.text)}</code>${v.branch === null ? "" : `<strong class="${v.branch ? "is-true" : "is-false"}" data-branch="${v.branch}">${v.branch ? "True ✓" : "False ×"}</strong>`}</div>
    ${tj68Fit(v, t)}${tj68Board(v, t, showSpaces)}${tj68Distribution(v, t)}${tj68Output(v, t, showSpaces)}
    <footer class="j68-footer"><div><button type="button" data-j68-jump="word">${t.nextWord}</button><button type="button" data-j68-jump="gap">${t.nextGap}</button><button type="button" data-j68-jump="result">${t.result}</button></div><small>${v.answer !== null ? `${t.done} ✓` : "Greedy · divmod"}</small></footer>
  </article>`;
  const scroller = host.querySelector(".j68-cell-scroll");
  if (scroller) {
    scroller.scrollLeft = oldScroll;
    const written = host.querySelectorAll(".j68-cell.is-written"), target = written[written.length - 1];
    if (target) {
      const box = scroller.getBoundingClientRect(), cell = target.getBoundingClientRect(), pad = 8;
      if (cell.left < box.left + pad) scroller.scrollLeft -= box.left + pad - cell.left;
      if (cell.right > box.right - pad) scroller.scrollLeft += cell.right - box.right + pad;
    }
  }
  tj68Bind(host);
}
