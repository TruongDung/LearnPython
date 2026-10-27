function renderPalindrome131Pictures(step) {
  const v = step.palindrome131View, f = v.stack.at(-1), x = v.locals, c = v.candidate, done = v.phase === "done";
  const t = (vi, en) => lang === "vi" ? vi : en, esc = value => escapeHtml(String(value)), path = x.path || [];
  const chip = (text, start = 0, extra = "") => `<b class="pal131-piece pal131-c${start % 6} ${extra}" title="${start}:${start + text.length}">${esc(text)}</b>`;
  const partition = values => {
    let cursor = 0;
    return values.length ? values.map(text => { const result = chip(text, cursor); cursor += text.length; return result; }).join('<i class="pal131-cut" aria-hidden="true">│</i>') : '<span class="pal131-empty">∅</span>';
  };
  let cursor = 0;
  const ranges = path.map(text => { const start = cursor; cursor += text.length; return { start, end: cursor, text }; });
  const pitch = 32, left = 18, width = v.s.length * pitch + left * 2, center = i => left + i * pitch + 13;
  const letters = [...v.s].map((letter, i) => {
    const chosen = ranges.find(range => i >= range.start && i < range.end), active = c && i >= c.start && i < c.end;
    return `<g class="pal131-source ${chosen ? `chosen pal131-c${chosen.start % 6}` : ""} ${active ? c.checked === null ? "pending" : c.checked ? "pass" : "fail" : ""}" data-source-index="${i}" data-chosen="${Boolean(chosen)}" data-candidate="${Boolean(active)}"><rect x="${left + i * pitch}" y="25" width="26" height="34" rx="7"/><text class="pal131-letter" x="${center(i)}" y="48">${letter}</text><text class="pal131-index" x="${center(i)}" y="75">${i}</text></g>`;
  }).join("");
  const boundaries = f ? `<path class="pal131-start-line" d="M${left + f.start * pitch - 2} 16V63"/><text class="pal131-boundary start" x="${Math.min(left + f.start * pitch, width - 36)}" y="11">start</text>${c ? `<path class="pal131-end-line" d="M${left + c.end * pitch - 4} 22V82"/><text class="pal131-boundary end" x="${left + c.end * pitch - 4}" y="96">end</text>` : ""}` : "";
  const ribbon = `<div class="pal131-ribbon-scroll"><svg class="pal131-ribbon" style="min-width:${v.s.length > 12 ? v.s.length * 25 : 0}px;max-width:${Math.max(220, Math.min(700, v.s.length * 44 + 36))}px" viewBox="0 0 ${width} 103" role="img" aria-label="${esc(t(`Chuỗi ${v.s}; đoạn đang xét có viền, các mảnh trong path có màu`, `String ${v.s}; outlined candidate, colored chosen pieces`))}">${letters}${boundaries}</svg></div>`;
  let mirror;
  if (c) {
    const text = c.text, known = c.checked !== null, reversed = [...text].reverse(), w = Math.max(240, text.length * 34 + 44);
    const pairs = [...text].map((letter, i) => {
      const cx = w / 2 + (i - (text.length - 1) / 2) * 34, equal = letter === reversed[i];
      return `<g class="pal131-pair pal131-c${Math.min(i, text.length - 1 - i) % 6} ${known ? equal ? "match" : "miss" : "unknown"}" data-pair="${i}" data-match="${known ? equal : "unknown"}"><path d="M${cx} 57V108"/><rect x="${cx - 14}" y="22" width="28" height="34" rx="7"/><text class="pal131-letter" x="${cx}" y="45">${letter}</text><text class="pal131-equality" x="${cx}" y="88">${known ? equal ? "=" : "≠" : "?"}</text><rect class="reverse" x="${cx - 14}" y="112" width="28" height="34" rx="7"/><text class="pal131-letter reverse" x="${cx}" y="135">${known ? reversed[i] : "?"}</text></g>`;
    }).join("");
    mirror = `<header><b>${v.phase === "end" ? `s[${c.start}:${c.end}]` : "piece"}</b><span class="pal131-status ${known ? c.checked ? "pass" : "fail" : ""}" data-check="${known ? c.checked : "unknown"}">${known ? c.checked ? "✓" : "×" : "?"}</span><code>piece[::-1]</code></header><div class="pal131-mirror-scroll"><svg class="pal131-mirror" style="min-width:${text.length > 8 ? text.length * 28 + 44 : 0}px" viewBox="0 0 ${w} 170" role="img" aria-label="${esc(t(`So sánh ${text} với chuỗi đảo; ${known ? c.checked ? "khớp" : "không khớp" : "chưa kiểm tra"}`, `Compare ${text} with its reverse; ${known ? c.checked ? "match" : "mismatch" : "not checked yet"}`))}"><text class="pal131-direction" x="13" y="45">→</text><text class="pal131-direction" x="13" y="135">←</text>${pairs}</svg></div>`;
  } else mirror = `<div class="pal131-idle"><strong>${done ? "✓" : v.atEnd || v.phase === "save" || v.phase === "return" ? "⚑" : v.phase === "exhausted" || v.phase === "root-return" ? "↩" : "✂"}</strong><b>${done ? `${v.resultCount} ${t("cách tách", "partitions")}` : v.atEnd || v.phase === "save" || v.phase === "return" ? "END" : t("Cắt → soi gương", "Cut → mirror")}</b></div>`;
  const copyIcon = '<svg class="pal131-copy" viewBox="0 0 66 66" aria-hidden="true"><rect x="20" y="19" width="38" height="39" rx="8"/><path d="M12 43H9V9H43V12M29 32H48M29 42H44"/></svg>';
  let action;
  if (v.phase === "save") action = `${copyIcon}<strong class="pal131-success">#${v.resultCount} ✓</strong><code>list(path) → res</code>`;
  else if (v.phase === "append") action = `<strong>＋ ↓</strong>${chip(x.piece, x.start)}<code>path.append()</code>`;
  else if (v.phase === "pop") action = `<strong>↩</strong>${chip(v.removed, x.start, "removed")}<code>path.pop()</code>`;
  else if (v.phase === "resume") action = `<strong>↩</strong><code>bt(${x.end}, path)</code>`;
  else if (v.phase === "check") action = `<strong class="${c.checked ? "pal131-success" : "pal131-failure"}">${c.checked ? "✓ ↓" : "× ↪"}</strong><span>${c.checked ? "→ path" : "end →"}</span>`;
  else if (v.phase === "end" || v.phase === "piece") action = `<strong>✂</strong><b>${x.start}:${x.end}</b><code>${v.phase === "end" ? "s[start:end]" : "piece"}</code>`;
  else if (done) action = `<strong class="pal131-success">${v.resultCount}</strong><span>${t("đáp án", "answers")}</span>`;
  else action = `<strong>${v.phase === "return" || v.phase === "exhausted" || v.phase === "root-return" ? "↩" : "↓"}</strong><code>${f ? `bt(${f.start}, path)` : "bt(0, [])"}</code>`;
  const stack = v.stack.map((frame, depth) => `${depth ? '<i class="pal131-stack-arrow">→</i>' : ""}<article class="pal131-frame ${depth === v.stack.length - 1 ? "active" : ""}" data-frame-id="${frame.id}"><b>bt(${frame.start})</b>${frame.via ? chip(frame.via, frame.start - frame.via.length) : `<span class="pal131-root" title="${t("Gốc", "Root")}">⚑</span>`}<small>↔ path · ${frame.pathLength}</small></article>`).join("") || '<span class="pal131-empty">—</span>';
  const results = v.results.map((values, i) => `<article class="pal131-result ${v.phase === "save" && i === v.results.length - 1 ? "new" : ""}" data-result-number="${v.shownFrom + i + 1}"><small>#${v.shownFrom + i + 1}</small><div class="pal131-pieces" data-partition="${esc(values.join("|"))}">${partition(values)}</div></article>`).join("") || '<span class="pal131-empty">∅</span>';
  const host = $("treeView");
  host.innerHTML = `<section class="pal131-viz" role="group" aria-label="${esc(t(`Palindrome Partitioning, sau dòng ${v.source.line}`, `Palindrome Partitioning, after line ${v.source.line}`))}"><header class="pal131-heading"><b>${f ? `bt(${f.start}, path)` : "Palindrome Partitioning"}</b><span>${t("Sau dòng", "After line")} <strong>${v.source.line}</strong></span></header>${ribbon}<div class="pal131-work"><section class="pal131-mirror-panel">${mirror}</section><aside class="pal131-action">${action}</aside></div>${!done ? `<section class="pal131-path"><header><b>path</b><small>${x.path ? `${path.length} ${t("mảnh", "pieces")}` : "—"}</small></header><div class="pal131-pieces" data-path="${x.path ? esc(path.join("|")) : "unbound"}">${x.path ? partition(path) : '<span class="pal131-empty">—</span>'}</div></section><section class="pal131-stack"><header><b>↳ bt</b><small>↔ path</small></header><div>${stack}</div></section>` : ""}<section class="pal131-results"><header><b>res <strong>${v.resultCount}</strong></b><small>${v.shownFrom ? `+${v.shownFrom} ${t("đáp án trước", "earlier")}` : done ? t("Tất cả", "All") : "list(path)"}</small></header><div class="pal131-gallery">${results}</div></section></section>`;
  const stackPane = host.querySelector(".pal131-stack > div");
  if (stackPane) stackPane.scrollLeft = stackPane.scrollWidth;
  const gallery = host.querySelector(".pal131-gallery");
  if (gallery && v.phase === "save") gallery.scrollTop = gallery.scrollHeight;
  const scroll = host.querySelector(".pal131-ribbon-scroll"), svg = host.querySelector(".pal131-ribbon");
  if (scroll && svg && f) scroll.scrollLeft = Math.max(0, (center(c ? (c.start + c.end) / 2 : f.start) / width) * svg.getBoundingClientRect().width - scroll.clientWidth / 2);
}
