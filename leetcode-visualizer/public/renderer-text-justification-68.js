function tj68Escape(value) {
  return escapeHtml(String(value ?? ""));
}

function tj68VisibleSpaces(value) {
  return String(value ?? "").replace(/ /g, "·");
}

function tj68BuildCells(view, lineWords, gapWidths, maxWidth) {
  const cells = [];
  const activeGap = Number.isInteger(view.activeGap) ? view.activeGap : -1;
  const extraSpaces = Number.isInteger(view.extraSpaces) ? view.extraSpaces : 0;
  const hasStructuredLine = lineWords.length > 0;

  if (hasStructuredLine) {
    lineWords.forEach((word, wordIndex) => {
      [...word].forEach((character) => cells.push({ character, kind: "letter", gap: -1 }));
      if (wordIndex >= lineWords.length - 1) return;

      const width = Number.isInteger(gapWidths[wordIndex]) ? gapWidths[wordIndex] : 1;
      for (let offset = 0; offset < width; offset += 1) {
        cells.push({
          character: " ",
          kind: wordIndex < extraSpaces && !view.isLastLine && !view.isSingleWord ? "extra-space" : "gap-space",
          gap: wordIndex,
          active: wordIndex === activeGap,
        });
      }
    });

    const trailingSpaces = Number.isInteger(view.trailingSpaces) ? view.trailingSpaces : 0;
    for (let offset = 0; offset < trailingSpaces; offset += 1) {
      cells.push({ character: " ", kind: "trailing-space", gap: -1 });
    }
  } else if (view.renderedLine) {
    [...String(view.renderedLine)].forEach((character) => {
      cells.push({ character, kind: character === " " ? "gap-space" : "letter", gap: -1 });
    });
  }

  while (cells.length < maxWidth) {
    cells.push({ character: " ", kind: "empty", gap: -1 });
  }
  return cells.slice(0, maxWidth);
}

function renderTextJustification68View(step) {
  const view = step.textJustification68View || {};
  const vi = lang === "vi";
  const words = Array.isArray(view.words) ? view.words.map(String) : [];
  const output = Array.isArray(view.output) ? view.output.map(String) : [];
  const lineWords = Array.isArray(view.lineWords) ? view.lineWords.map(String) : [];
  const gapWidths = Array.isArray(view.gapWidths)
    ? view.gapWidths.map((width) => Number(width)).filter(Number.isFinite)
    : [];
  const maxWidth = Math.max(1, Number(view.maxWidth) || 1);
  const start = Number.isInteger(view.start) ? view.start : 0;
  const end = Number.isInteger(view.end) ? view.end : start;
  const candidateIndex = Number.isInteger(view.candidateIndex) ? view.candidateIndex : -1;
  const phase = String(view.phase || "init");
  const fit = view.fit && typeof view.fit === "object" ? view.fit : null;
  const completedGaps = Number.isInteger(view.completedGaps) ? view.completedGaps : 0;

  const phaseIndex = ["init", "line-start", "scan", "accept", "reject"].includes(phase) ? 0
    : phase === "packed" ? 1
      : ["left-justify", "distribute", "gap", "assembled"].includes(phase) ? 2 : 3;
  const phaseLabels = vi
    ? ["Xếp từ", "Phân loại dòng", "Phân phối khoảng trắng", "Lưu dòng"]
    : ["Pack words", "Classify line", "Distribute spaces", "Emit line"];
  const phases = phaseLabels.map((label, index) => {
    const state = index === phaseIndex ? "active" : index < phaseIndex ? "done" : "";
    return `<span class="${state}"><b>${index < phaseIndex ? "✓" : index + 1}</b>${tj68Escape(label)}</span>`;
  }).join("");

  const sourceWords = words.map((word, index) => {
    const classes = ["tj68-word"];
    let label = vi ? "chờ" : "pending";
    if (index < start || (view.final && index < words.length)) {
      classes.push("processed");
      label = vi ? "xong" : "done";
    } else if (index === candidateIndex) {
      classes.push(fit && fit.fits ? "candidate-fits" : "candidate-rejects");
      label = fit && fit.fits ? (vi ? "vừa" : "fits") : (vi ? "không vừa" : "no fit");
    } else if (index >= start && index < end) {
      classes.push("packed");
      label = vi ? "trong dòng" : "packed";
    }
    return `<span class="${classes.join(" ")}"><small>${index}</small><strong>${tj68Escape(word)}</strong><em>${tj68Escape(label)}</em></span>`;
  }).join("");

  const cells = tj68BuildCells(view, lineWords, gapWidths, maxWidth);
  const ruler = cells.map((_cell, index) => `<span>${index + 1}</span>`).join("");
  const lineCells = cells.map((cell, index) => {
    const classes = ["tj68-cell", cell.kind];
    if (cell.active) classes.push("active-gap");
    const label = cell.character === " "
      ? (vi ? `cột ${index + 1}: khoảng trắng` : `column ${index + 1}: space`)
      : (vi ? `cột ${index + 1}: ${cell.character}` : `column ${index + 1}: ${cell.character}`);
    return `<span class="${classes.join(" ")}" aria-label="${tj68Escape(label)}">${cell.character === " " ? "·" : tj68Escape(cell.character)}</span>`;
  }).join("");

  const fitCard = fit
    ? `<section class="tj68-fit ${fit.fits ? "fits" : "rejects"}">
        <header><strong>${fit.fits ? (vi ? "VỪA DÒNG" : "FITS") : (vi ? "KHÔNG VỪA" : "DOES NOT FIT")}</strong><span>${fit.fits ? "≤" : ">"} maxWidth</span></header>
        <div><b>${Number(fit.lettersBefore) || 0}</b><i>+</i><b>${Number(fit.candidateLength) || 0}</b><i>+</i><b>${Number(fit.prospectiveGaps) || 0}</b><i>=</i><strong>${Number(fit.usedWithMinimumSpaces) || 0}</strong><i>${fit.fits ? "≤" : ">"}</i><b>${maxWidth}</b></div>
        <p>${vi ? "chữ đã chọn + từ mới + số khe tối thiểu" : "packed letters + candidate + minimum gaps"}</p>
      </section>`
    : `<section class="tj68-fit idle"><header><strong>${vi ? "ĐIỀU KIỆN VỪA DÒNG" : "LINE-FIT CHECK"}</strong><span>letters + next + gaps ≤ ${maxWidth}</span></header><p>${vi ? "Chọn nhiều từ nhất có thể mà không cắt từ." : "Take the maximum words possible without splitting one."}</p></section>`;

  const metric = (label, value, accent = "") => `<div class="${accent}"><small>${tj68Escape(label)}</small><strong>${value === null || value === undefined ? "—" : tj68Escape(value)}</strong></div>`;
  const metrics = [
    metric("maxWidth", maxWidth, "width"),
    metric(vi ? "ký tự chữ" : "letters", Number(view.letters) || 0),
    metric(vi ? "tổng spaces" : "total spaces", view.totalSpaces),
    metric(vi ? "số khe" : "gaps", Number(view.gapCount) || 0),
  ].join("");

  let gapCards;
  if (gapWidths.length) {
    gapCards = gapWidths.map((width, index) => {
      const getsExtra = index < (Number(view.extraSpaces) || 0) && !view.isLastLine && !view.isSingleWord;
      const classes = ["tj68-gap"];
      if (getsExtra) classes.push("extra");
      if (index < completedGaps) classes.push("allocated");
      if (index === view.activeGap) classes.push("active");
      return `<span class="${classes.join(" ")}"><small>${tj68Escape(lineWords[index] || "")} ↔ ${tj68Escape(lineWords[index + 1] || "")}</small><strong>${width}</strong><em>${getsExtra ? (vi ? "base + 1" : "base + 1") : (vi ? "base" : "base")}</em></span>`;
    }).join("");
  } else {
    gapCards = `<p class="tj68-no-gaps">${vi ? "Chưa có khe cần phân phối." : "No gaps to distribute yet."}</p>`;
  }

  const formula = view.baseSpaces === null || view.baseSpaces === undefined
    ? (vi ? "Chờ khóa dòng để tính khoảng trắng." : "Lock the line before calculating spaces.")
    : view.isLastLine || view.isSingleWord
      ? `${Number(view.gapCount) || 0} × 1 + ${Number(view.trailingSpaces) || 0} ${vi ? "ở cuối" : "trailing"}`
      : `${view.totalSpaces} = ${view.gapCount} × ${view.baseSpaces} + ${view.extraSpaces}`;

  const outputLines = output.length
    ? output.map((line, index) => `<div class="tj68-output-line"><small>${vi ? "dòng" : "line"} ${index + 1}</small><code>${tj68Escape(tj68VisibleSpaces(line))}</code><em>${line.length}/${maxWidth}</em></div>`).join("")
    : `<p>${vi ? "Các dòng hoàn chỉnh sẽ xuất hiện ở đây." : "Completed lines will appear here."}</p>`;

  const currentRange = end > start ? `[${start}, ${end})` : "—";
  const summary = vi
    ? `Bài 68, giai đoạn ${phase}, phạm vi dòng ${currentRange}, đã lưu ${output.length} dòng.`
    : `Problem 68, phase ${phase}, current range ${currentRange}, ${output.length} lines emitted.`;
  const resultText = view.final
    ? (vi ? `${output.length} dòng · mỗi dòng ${maxWidth} ký tự` : `${output.length} lines · ${maxWidth} characters each`)
    : (vi ? "Đang căn đều…" : "Justifying…");

  $("treeView").innerHTML = `<section class="tj68-viz phase-${tj68Escape(phase)}" style="--tj68-width:${maxWidth}" role="img" aria-label="${tj68Escape(summary)}">
    <header class="tj68-header"><div><small>STRING · GREEDY · #68</small><h2>${vi ? "CĂN ĐỀU VĂN BẢN" : "TEXT JUSTIFICATION"}</h2></div><span><b>${vi ? "DÒNG" : "LINE"} ${(step.codeLines || [])[0] ?? "—"}</b>${tj68Escape(pick(step.title))}</span></header>
    <div class="tj68-phases">${phases}</div>
    <section class="tj68-source tj68-card"><header><strong>${vi ? "HÀNG ĐỢI TỪ" : "WORD QUEUE"}</strong><span>${vi ? "xanh = đã chọn · đỏ = không vừa" : "blue = packed · red = rejected"}</span></header><div>${sourceWords}</div></section>
    <div class="tj68-workspace">
      <section class="tj68-line tj68-card"><header><strong>${vi ? "DÒNG ĐỘ RỘNG CỐ ĐỊNH" : "FIXED-WIDTH LINE"}</strong><span>${currentRange} · ${lineWords.length} ${vi ? "từ" : "word(s)"}</span></header><div class="tj68-line-scroll"><div class="tj68-ruler">${ruler}</div><div class="tj68-cells">${lineCells}</div></div><div class="tj68-legend"><span><i class="letter"></i>${vi ? "ký tự" : "letter"}</span><span><i class="gap"></i>${vi ? "khe cơ sở" : "base gap"}</span><span><i class="extra"></i>${vi ? "space dư bên trái" : "left extra"}</span><span><i class="trailing"></i>${vi ? "bù bên phải" : "right padding"}</span></div></section>
      <aside class="tj68-side"><div class="tj68-metrics">${metrics}</div>${fitCard}</aside>
    </div>
    <section class="tj68-distribution tj68-card"><header><strong>${vi ? "PHÂN PHỐI KHOẢNG TRẮNG" : "SPACE DISTRIBUTION"}</strong><span>${tj68Escape(formula)}</span></header><div>${gapCards}</div>${view.partialLine ? `<code>${tj68Escape(tj68VisibleSpaces(view.partialLine))}</code>` : ""}</section>
    <section class="tj68-output tj68-card"><header><strong>${vi ? "CÁC DÒNG ĐÃ LƯU" : "EMITTED LINES"}</strong><span>${output.length}</span></header><div>${outputLines}</div></section>
    <section class="tj68-action"><small>${vi ? "BƯỚC HIỆN TẠI" : "CURRENT STEP"}</small><strong>${tj68Escape(pick(step.title))}</strong><p>${tj68Escape(pick(step.note))}</p></section>
    <footer class="tj68-result ${view.final ? "done" : ""}"><small>${vi ? "KẾT QUẢ" : "RESULT"}</small><strong>${tj68Escape(resultText)}</strong></footer>
  </section>`;
}
