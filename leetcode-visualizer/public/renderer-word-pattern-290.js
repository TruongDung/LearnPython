function renderWordPattern290View(step) {
  const v = step.wordPattern290View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const differentLength = v.pattern.length !== v.words.length && ["length", "done"].includes(v.phase);
  const conflict = v.forwardConflict === true || v.reverseConflict === true;
  const slots = Array.from({ length: Math.max(v.pattern.length, v.words.length) }, (_, i) => {
    const current = v.index === i && v.answer !== true;
    const missing = i >= v.pattern.length || i >= v.words.length;
    return `<article class="wp290-pair${i < v.matched ? " matched" : ""}${current ? " current" : ""}${current && conflict || differentLength && missing ? " conflict" : ""}"><small>${i}</small><div><span>pattern</span><b>${v.pattern[i] || "∅"}</b></div><div><span>word</span><code>${v.words[i] === undefined ? "∅" : escapeHtml(v.words[i])}</code></div></article>`;
  }).join("");
  const table = (entries, name, forward) => `<div class="wp290-map"><strong>${name}</strong>${entries.length ? entries.map(([key, value]) => {
    const current = forward ? key === v.ch : key === v.word;
    const bad = current && (forward ? v.forwardConflict : v.reverseConflict) === true;
    return `<div class="wp290-map-entry${current ? " current" : ""}${bad ? " conflict" : ""}"><code>${escapeHtml(key)}</code><b>→</b><code>${escapeHtml(value)}</code></div>`;
  }).join("") : `<p>${v.initialized ? text("Chưa có ánh xạ", "No mappings yet") : text("Chưa khởi tạo", "Not initialized")}</p>`}</div>`;
  const phases = { split: text("Tách từ", "Split words"), length: text("Kiểm tra số lượng", "Check counts"), init: text("Khởi tạo", "Initialize"), read: text("Đọc một cặp", "Read a pair"), "forward-check": text("Ký tự → từ", "Letter → word"), "reverse-check": text("Từ → ký tự", "Word → letter"), "store-forward": text("Lưu chiều thuận", "Store forward mapping"), "store-reverse": text("Lưu chiều ngược", "Store reverse mapping"), done: text("Hoàn tất", "Complete") };
  const verdict = v.answer === null ? "—" : v.answer ? "True" : "False";
  let focus = `${v.pattern.length} ${text("ký tự", "letters")} · ${v.words.length} ${text("từ", "words")}`;
  if (v.ch !== null) focus = `i = ${v.index}: '${v.ch}' ↔ '${v.word}'`;
  if (v.answer === true) focus = `${v.matched}/${v.pattern.length} ${text("vị trí đã khớp", "positions verified")}`;
  $("treeView").innerHTML = `<section class="wp290-viz" aria-label="${text("Mô phỏng Word Pattern 290", "290 Word Pattern visualization")}">
    <header><div><small>290 · ${phases[v.phase]}</small><h3>${text("Một ký tự ↔ một từ", "One letter ↔ one word")}</h3></div><strong class="wp290-verdict${v.answer === true ? " yes" : v.answer === false ? " no" : ""}">${verdict}</strong></header>
    <div class="wp290-pairs">${slots}</div>
    <div class="wp290-legend"><span>${text("Tím: cặp đang xét", "Purple: current pair")}</span><span>${text("Xanh: đã khớp", "Green: verified")}</span><span>${text("Đỏ: xung đột", "Red: conflict")}</span><span>∅ = ${text("không có", "missing")}</span></div>
    <div class="wp290-maps">${table(v.charToWord, "char_to_word", true)}${table(v.wordToChar, "word_to_char", false)}</div>
    <div class="wp290-rule">${text("Không đổi từ của một ký tự. Không cho hai ký tự dùng chung một từ.", "A letter keeps its word. Different letters cannot share a word.")}</div>
    <div class="wp290-focus${conflict || differentLength ? " no" : ""}"><strong>${escapeHtml(focus)}</strong><p>${escapeHtml(pick(step.note))}</p></div>
  </section>`;
}
