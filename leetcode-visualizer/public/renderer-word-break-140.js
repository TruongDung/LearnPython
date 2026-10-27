function renderWordBreak140Pictures(step) {
  const v = step.wordBreak140View, f = v.stack.at(-1), locals = v.locals, c = v.candidate;
  const t = (vi, en) => lang === "vi" ? vi : en, esc = x => escapeHtml(String(x)), done = v.phase === "done";
  const tone = word => Math.max(0, v.dictionary.indexOf(word)) % 6;
  const wordChip = (word, extra = "") => `<b class="wb2-word wb2-c${tone(word)} ${extra}" data-word="${esc(word)}">${esc(word)}</b>`;
  const sentence = (text, extra = "") => text === "" ? `<b class="wb2-empty-tail ${extra}" title="${esc(t("Một tail rỗng hợp lệ", "One valid empty continuation"))}">""</b>` : text.split(" ").map(word => wordChip(word, extra)).join('<i class="wb2-space" aria-hidden="true">␣</i>');
  const drawer = start => `<svg class="wb2-drawer" viewBox="0 0 70 64" aria-hidden="true"><rect x="5" y="5" width="60" height="54" rx="9"/><path d="M5 23H65M5 41H65M31 14H39M31 32H39M31 50H39"/><circle cx="57" cy="54" r="10"/><text x="57" y="58">${start}</text></svg>`;
  const book = '<svg class="wb2-book" viewBox="0 0 70 54" aria-hidden="true"><path d="M35 12Q20 2 4 8V46Q20 40 35 50Q50 40 66 46V8Q50 2 35 12V50M12 17L27 20M12 27L27 30M43 20L58 17M43 30L58 27"/></svg>';
  const prefix = v.stack.slice(1).map(frame => frame.via).filter(Boolean);
  const pitch = 28, left = 15, width = left * 2 + v.s.length * pitch;
  const cellX = i => left + i * pitch;
  const chars = [...v.s].map((letter, i) => {
    const chosen = prefix.find(p => i >= p.start && i < p.end), selected = c && i >= c.start && i < c.end;
    return `<g class="wb2-character ${chosen ? `chosen wb2-c${tone(chosen.word)}` : ""} ${selected ? c.member === null ? "candidate" : c.member ? "match" : "reject" : ""}" data-char="${i}" data-selected="${Boolean(selected)}"><rect x="${cellX(i)}" y="25" width="24" height="32" rx="6"/><text class="wb2-letter" x="${cellX(i) + 12}" y="47">${letter}</text><text class="wb2-index" x="${cellX(i) + 12}" y="73">${i}</text></g>`;
  }).join("");
  const boundaries = f ? `<path class="wb2-start-line" d="M${cellX(f.start) - 2} 14V61"/><text class="wb2-boundary-label start" x="${Math.min(cellX(f.start), width - 37)}" y="10">start</text>${c ? `<path class="wb2-end-line" d="M${cellX(c.end) - 3} 22V82"/><text class="wb2-boundary-label end" x="${cellX(c.end) - 4}" y="97">end</text>` : ""}` : "";
  const ribbon = `<div class="wb2-ribbon-scroll"><svg class="wb2-ribbon" style="min-width:${v.s.length > 12 ? v.s.length * 25 : 0}px" viewBox="0 0 ${width} 105" role="img" aria-label="${esc(t(`Chuỗi ${v.s}; ${f ? `start ${f.start}` : "ngoài dfs"}${c ? `, end ${c.end}` : ""}`, `String ${v.s}; ${f ? `start ${f.start}` : "outside dfs"}${c ? `, end ${c.end}` : ""}`))}">${chars}${boundaries}</svg></div>`;
  const matchingWord = c?.member === true ? c.text : null;
  const shownWords = v.dictionary.slice(0, 18);
  if (matchingWord && !shownWords.includes(matchingWord)) shownWords.push(matchingWord);
  const dictionary = shownWords.map(word => wordChip(word, matchingWord === word ? "dictionary-match" : "")).join("") || '<span class="wb2-empty">∅</span>';
  let operation;
  if (done) operation = `<div class="wb2-finish"><strong>${v.answer.length ? "✓" : "∅"}</strong><b>${v.answer.length}</b><span>${t("câu hợp lệ", "valid sentences")}</span></div>`;
  else if (v.phase === "base-return" || v.phase === "end-check" && v.atEnd) operation = `<div class="wb2-base"><b>END</b><strong>→</strong>${v.phase === "base-return" ? '<span><b class="wb2-empty-tail">""</b><small>1 tail ✓</small></span><strong>↩</strong>' : '<span class="wb2-empty">?</span>'}</div>`;
  else if (v.phase === "memo-return" || v.phase === "memo-check" && v.memoHit) {
    const cache = v.cache || v.memo.find(m => m.start === f.start);
    operation = `<div class="wb2-cache-hit" data-cache-start="${f.start}">${drawer(f.start)}<strong>→</strong><div>${cache.count ? cache.preview.slice(0, 1).map(text => `<div class="wb2-sentence">${sentence(text)}</div>`).join("") : '<span class="wb2-empty">∅</span>'}<small>↩ ${cache.count} tail${cache.count === 1 ? "" : "s"}</small></div></div>`;
  } else if (v.phase === "tail" || v.phase === "append") {
    const joined = locals.word + (locals.tail ? ` ${locals.tail}` : "");
    operation = `<div class="wb2-join" data-joined="${esc(joined)}"><div class="wb2-join-parts"><span><small>word</small>${wordChip(locals.word)}</span><strong>+</strong><span><small>tail ${v.returned.kind === "memo" ? `↩ memo[${v.returned.start}]` : ""}</small><div class="wb2-sentence">${sentence(locals.tail)}</div></span></div><strong>↓</strong><div class="wb2-sentence wb2-joined ${v.phase === "tail" ? "preview" : "saved"}">${sentence(joined)}${v.phase === "append" ? '<b class="wb2-check">✓</b>' : ""}</div></div>`;
  } else if (v.phase === "memo-save") operation = `<div class="wb2-store"><div class="wb2-sentence">${locals.sentences.length ? sentence(locals.sentences.at(-1)) : '<span class="wb2-empty">∅</span>'}</div><strong>→</strong>${drawer(f.start)}<b>${locals.sentences.length}</b></div>`;
  else if (c && ["end", "slice", "dictionary", "skip"].includes(v.phase)) operation = `<div class="wb2-lookup ${c.member === null ? "pending" : c.member ? "pass" : "fail"}" data-membership="${c.member}"><span><small>${v.phase === "end" ? `s[${c.start}:${c.end}]` : "word"}</small>${wordChip(c.text)}</span><strong>${c.member === null ? "?" : c.member ? "∈ ✓" : "∉ ×"}</strong>${book}</div>`;
  else if (v.phase === "tails-done") operation = `<div class="wb2-empty-operation"><strong>${v.returned.count ? "✓" : "∅"}</strong><span>${v.returned.count} tails</span><b>↩</b></div>`;
  else if (v.phase === "return") operation = `<div class="wb2-empty-operation"><strong>↩</strong><span>${locals.sentences.length} ${t("câu", "sentences")}</span></div>`;
  else if (v.phase === "memo-check") operation = `<div class="wb2-empty-operation">${drawer(f.start)}<strong>?</strong><span>∉ memo</span></div>`;
  else operation = `<div class="wb2-empty-operation"><strong>${v.phase === "ends-done" ? "✓" : "✂"}</strong><code>${v.phase === "collect" ? "sentences = []" : v.phase === "memo-init" ? "memo = {}" : v.phase === "words" ? "words = set(wordDict)" : f ? `dfs(${f.start})` : "dfs(start)"}</code></div>`;
  const stack = v.stack.map((frame, depth) => `<article class="wb2-frame ${depth === v.stack.length - 1 ? "active" : ""}" data-frame-id="${frame.id}"><header><b>dfs(${frame.start})</b><small>d=${depth}</small></header><div>${frame.via ? wordChip(frame.via.word) : '<span class="wb2-empty">∅</span>'}<span class="wb2-frame-arrow">↓</span></div><footer>${frame.start === v.s.length ? "END" : esc(v.s.slice(frame.start))}<b>${frame.count === null ? "?" : frame.count}</b></footer></article>`).join("") || `<div class="wb2-stack-empty"><strong>${done ? "✓" : "↓"}</strong><code>dfs(0)</code></div>`;
  const keys = [...new Set([...v.memo.map(m => m.start), ...v.stack.filter(frame => frame.start < v.s.length).map(frame => frame.start)])].sort((a, b) => a - b);
  const memos = keys.map(start => {
    const entry = v.memo.find(m => m.start === start), hit = (v.phase === "memo-return" || v.phase === "memo-check" && v.memoHit) && f.start === start;
    const active = f?.start === start, empty = entry?.count === 0;
    return `<article class="wb2-memo ${entry ? empty ? "empty" : "ready" : "waiting"} ${active ? "active" : ""} ${hit ? "hit" : ""}" data-memo-start="${start}" data-memo-count="${entry ? entry.count : "unknown"}"><header><b>memo[${start}]</b><strong>${hit ? "↩ " : ""}${entry ? entry.count : "?"}</strong></header><div class="wb2-sentence">${entry ? empty ? '<span class="wb2-empty">∅</span>' : sentence(entry.preview[0]) : '<span class="wb2-cache-wait">⋯</span>'}</div>${entry && entry.count > 1 ? `<small>+${entry.count - 1}</small>` : ""}</article>`;
  }).join("") || `<span class="wb2-empty">${v.memoReady ? "∅" : "—"}</span>`;
  const sentences = done ? v.answer : locals.sentences, visible = sentences ? sentences.slice(-12) : [];
  const gallery = visible.map((text, i) => `<article class="wb2-result ${v.phase === "append" && i === visible.length - 1 ? "new" : ""}" data-sentence="${esc(text)}"><small>#${sentences.length - visible.length + i + 1}</small><div class="wb2-sentence">${sentence(text)}</div></article>`).join("") || `<span class="wb2-empty">${sentences ? "∅" : "—"}</span>`;
  // Final output contains every accepted sentence, not a rolling preview.
  const finalGallery = done ? v.answer.map((text, i) => `<article class="wb2-result" data-sentence="${esc(text)}"><small>#${i + 1}</small><div class="wb2-sentence">${sentence(text)}</div></article>`).join("") || '<span class="wb2-empty">∅</span>' : gallery;
  const host = $("treeView");
  host.innerHTML = `<section class="wb2-viz" role="group" aria-label="${esc(t(`Word Break II, sau dòng ${v.source.line}`, `Word Break II, after line ${v.source.line}`))}"><header class="wb2-heading"><b>${f ? `dfs(${f.start})` : done ? "✓ Word Break II" : "Word Break II"}</b><span>${t("Sau dòng", "After line")} <strong>${v.source.line}</strong></span></header><section class="wb2-dictionary"><header><b>words <strong>${v.dictionary.length}</strong></b></header><div>${dictionary}${v.dictionary.length > shownWords.length ? `<small>+${v.dictionary.length - shownWords.length}</small>` : ""}</div></section>${ribbon}${prefix.length ? `<div class="wb2-prefix"><small>${t("Đã chọn", "Chosen")}</small><div class="wb2-sentence">${prefix.map(p => wordChip(p.word)).join('<i class="wb2-space">␣</i>')}</div><strong>↓</strong></div>` : ""}<div class="wb2-main"><div class="wb2-work"><div class="wb2-operation">${operation}</div><section class="wb2-results"><header><b>${done ? "return" : "sentences"} <strong>${sentences ? sentences.length : "—"}</strong></b><small>${!done && sentences?.length > 12 ? `+${sentences.length - 12} ${t("câu trước", "earlier")}` : done ? t("Tất cả", "All") : f ? `s[${f.start}:]` : ""}</small></header><div class="wb2-gallery">${finalGallery}</div></section></div><section class="wb2-stack"><header><b>↳ dfs</b></header><div>${stack}</div></section></div><section class="wb2-cache"><header><b>memo</b><span>↩ ${v.memoHits}</span></header><div>${memos}</div></section></section>`;
  const stackPane = host.querySelector(".wb2-stack > div");
  if (stackPane) { stackPane.scrollLeft = stackPane.scrollWidth; stackPane.scrollTop = stackPane.scrollHeight; }
  const grid = host.querySelector(".wb2-gallery");
  if (grid && v.phase === "append") grid.scrollTop = grid.scrollHeight;
  const ribbonScroll = host.querySelector(".wb2-ribbon-scroll"), ribbonSvg = host.querySelector(".wb2-ribbon");
  if (ribbonScroll && ribbonSvg && f) ribbonScroll.scrollLeft = Math.max(0, (cellX(c ? (c.start + c.end) / 2 : f.start) / width) * ribbonSvg.getBoundingClientRect().width - ribbonScroll.clientWidth / 2);
}
