function renderPhone17Pictures(step) {
  const v = step.phone17View, f = v.stack.at(-1), activeLetter = v.locals.letter, current = v.locals.current || [], active = v.activeIndex, done = v.phase === "done";
  const t = (vi, en) => lang === "vi" ? vi : en, esc = x => escapeHtml(String(x));
  const glyph = (letter, position = 0, extra = "") => `<b class="ph17-letter ph17-c${position % 4} ${extra}">${esc(letter)}</b>`;
  const word = (text, extra = "") => `<span class="ph17-word ${extra}">${[...text].map((letter, i) => glyph(letter, i)).join("")}</span>`;
  const digit = active === null ? null : v.digits[active];
  const phoneKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key, i) => {
    const x = 14 + i % 3 * 52, y = 29 + Math.floor(i / 3) * 45, allowed = Boolean(v.keypad[key]);
    return `<g class="ph17-key ${allowed ? "allowed" : "disabled"} ${v.mappingReady && digit === key ? "active" : ""}" data-key="${key}"><title>${key}${allowed ? ` · ${v.keypad[key]}` : ""}</title><rect x="${x}" y="${y}" width="47" height="39" rx="7"/><text class="ph17-key-number" x="${x + 23.5}" y="${y + 18}">${key}</text><text class="ph17-key-letters" x="${x + 23.5}" y="${y + 32}">${allowed ? v.keypad[key] : key === "0" ? "+" : "·"}</text></g>`;
  }).join("");
  const phone = `<div class="ph17-phone ${v.mappingReady ? "" : "pending"} ph17-c${active === null ? 0 : active % 4}" data-mapping-ready="${v.mappingReady}"><svg viewBox="0 0 180 225" role="img" aria-label="${esc(t("Bàn phím điện thoại: các phím 2–9 chứa 3 hoặc 4 chữ cái", "Phone keypad: keys 2–9 contain 3 or 4 letters"))}"><rect class="ph17-shell" x="3" y="3" width="174" height="219" rx="18"/><path class="ph17-speaker" d="M73 15H107M76 213H104"/>${phoneKeys}</svg></div>`;
  const choosing = ["choose", "append", "resume"].includes(v.phase);
  const lanes = [...v.digits].map((key, position) => {
    const letters = [...v.keypad[key]], selected = current[position], isActive = active === position;
    const nodes = letters.map((letter, index) => {
      const cx = 12 + index * 72 / Math.max(1, letters.length - 1), picked = selected === letter;
      const focus = isActive && choosing && activeLetter === letter, visited = isActive && f.tried.includes(letter);
      return `<path class="ph17-branch ${picked ? "picked" : ""} ${focus ? "focus" : ""}" d="M48 38L${cx} 76"/><g class="ph17-choice ${picked ? "picked" : ""} ${focus ? "focus" : ""} ${visited ? "visited" : ""}" data-choice="${position}:${letter}" data-picked="${picked}"><title>${key} → ${letter}${visited ? ` · ${t("đã duyệt nhánh", "branch explored")}` : ""}</title><circle cx="${cx}" cy="88" r="10"/><text x="${cx}" y="93">${v.mappingReady ? letter : "?"}</text>${visited ? `<text class="ph17-visited" x="${cx + 8}" y="76">✓</text>` : ""}</g>`;
    }).join("");
    return `<article class="ph17-lane ph17-c${position % 4} ${isActive ? "active" : ""} ${v.mappingReady ? "" : "pending"}" data-position="${position}"><header>[${position}] ${isActive ? "· idx" : ""}</header><svg viewBox="0 0 96 114" role="img" aria-label="${esc(`${v.digits}[${position}] · ${key} → ${v.keypad[key]}`)}"><rect class="ph17-digit" x="34" y="5" width="28" height="33" rx="8"/><text class="ph17-digit-text" x="48" y="29">${key}</text>${nodes}</svg></article>`;
  }).join("") || '<div class="ph17-no-digits"><code>digits = ""</code><strong>∅</strong></div>';
  const slots = [...v.digits].map((key, position) => {
    const preview = v.phase === "choose" && active === position, letter = current[position];
    return `<div class="ph17-slot ph17-c${position % 4} ${letter ? "filled" : preview ? "preview" : "empty"}" data-current-position="${position}" data-current-value="${letter || ""}" data-preview="${preview}"><small>${key} · [${position}]</small><b>${letter || (preview ? activeLetter : v.currentReady ? "·" : "—")}</b></div>`;
  }).join("");
  let operation;
  if (v.phase === "choose") operation = `<span class="ph17-key-hint">${digit}</span><strong>→</strong>${glyph(activeLetter, active, "preview")}<code>${t("thử letter", "try letter")}</code>`;
  else if (v.phase === "append") operation = `<strong>＋</strong>${glyph(activeLetter, active)}<strong>↓</strong><code>current.append()</code>`;
  else if (v.phase === "pop") operation = `<code>pop()</code>${glyph(v.removed, active, "removed")}<strong>↩</strong>`;
  else if (v.phase === "save") operation = `${word(current.join(""))}<strong>⇢</strong><span class="ph17-saved">#${v.resultCount} ✓</span>`;
  else if (done) operation = `<strong class="ph17-success">${v.resultCount ? "✓" : "∅"}</strong><b>${v.resultCount}</b><span>${t("tổ hợp", "combinations")}</span>`;
  else if (v.phase === "end-check" && v.atEnd) operation = '<strong>⚑</strong><code>END → result</code>';
  else if (["return", "resume", "exhausted", "root-return"].includes(v.phase)) operation = `<strong>↩</strong><code>backtrack(${f ? f.idx : 0})</code>`;
  else operation = `<strong>${v.phase === "mapping" ? "☎" : "↓"}</strong><code>${v.phase === "result-init" ? "result = []" : v.phase === "current-init" ? "current = []" : v.phase === "mapping" ? "mapping" : f ? `digits[${f.idx}]` : v.phase === "empty-check" ? "if not digits" : "backtrack(idx)"}</code>`;
  const stack = v.stack.map((frame, i) => `${i ? '<i class="ph17-stack-arrow">→</i>' : ""}<article class="ph17-frame ph17-c${Math.max(0, frame.idx - 1) % 4} ${i === v.stack.length - 1 ? "active" : ""}" data-frame-id="${frame.id}"><b>idx ${frame.idx}</b>${frame.via ? glyph(frame.via, frame.idx - 1) : '<span class="ph17-root">⚑</span>'}</article>`).join("") || '<span class="ph17-empty">—</span>';
  const output = v.results.map((text, i) => `<article class="ph17-result ${v.phase === "save" && i === v.results.length - 1 ? "new" : ""}" data-result-number="${v.shownFrom + i + 1}" data-combination="${text}"><small>#${v.shownFrom + i + 1}</small>${word(text)}</article>`).join("") || `<span class="ph17-empty">${v.resultReady || done ? "∅" : "—"}</span>`;
  const columns = v.digits.length === 2 ? v.keypad[v.digits[1]].length : v.digits.length === 1 ? v.keypad[v.digits[0]].length : null;
  const host = $("treeView");
  host.innerHTML = `<section class="ph17-viz" role="group" aria-label="${esc(t(`Tổ hợp chữ cái điện thoại, sau dòng ${v.source.line}`, `Phone letter combinations, after line ${v.source.line}`))}"><header class="ph17-heading"><b>digits <strong>${v.digits || '""'}</strong></b><span>${t("Sau dòng", "After line")} <strong>${v.source.line}</strong></span></header><div class="ph17-overview">${phone}<div class="ph17-lanes-scroll"><div class="ph17-lanes" style="--ph17-positions:${Math.max(1, v.digits.length)};--ph17-mobile-columns:${Math.max(1, Math.min(2, v.digits.length))}">${lanes}</div></div></div>${!done && v.digits ? `<section class="ph17-current"><header><b>current</b><small>${v.currentReady ? `${current.length} / ${v.digits.length}` : "—"}</small></header><div class="ph17-slots">${slots}</div></section>` : ""}<div class="ph17-operation">${operation}</div>${!done && v.digits ? `<section class="ph17-stack"><header><b>backtrack(idx)</b><small>↔ current</small></header><div>${stack}</div></section>` : ""}<section class="ph17-results"><header><b>${done ? "return" : "result"} <strong>${v.resultReady || done ? v.resultCount : "—"}</strong></b><span>${v.total === null ? "—" : `${v.resultCount} / ${v.total}`}</span></header><div class="ph17-progress"><i style="width:${v.total ? v.resultCount / v.total * 100 : 0}%"></i></div><div class="ph17-gallery" ${columns ? `style="grid-template-columns:repeat(${columns},minmax(0,1fr))"` : ""}>${output}</div>${v.shownFrom ? `<small class="ph17-earlier">+${v.shownFrom} ${t("kết quả trước", "earlier results")}</small>` : ""}</section></section>`;
  const pane = host.querySelector(".ph17-lanes-scroll"), focus = host.querySelector(".ph17-lane.active");
  if (pane && focus) {
    const a = focus.getBoundingClientRect(), b = pane.getBoundingClientRect(); pane.scrollLeft = a.x - b.x - pane.clientWidth / 2 + a.width / 2;
  }
  const stackPane = host.querySelector(".ph17-stack > div");
  if (stackPane) stackPane.scrollLeft = stackPane.scrollWidth;
  const gallery = host.querySelector(".ph17-gallery");
  if (gallery && v.phase === "save") gallery.scrollTop = gallery.scrollHeight;
}
