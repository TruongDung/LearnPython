function renderDifference389View(step) {
  const v = step.difference389View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const row = (name, word, processed) => `<div class="diff389-word"><div class="diff389-label"><strong>${name}</strong><small>${processed}/${word.length} ${name === "s" ? text("đã đếm", "counted") : text("đã ghép", "matched")}</small></div><div class="diff389-characters">${word.length === 0 ? `<span class="diff389-empty">∅ · ${text("chuỗi rỗng", "empty string")}</span>` : [...word].map((letter, i) => {
    const current = v.source === name && v.index === i;
    const extra = name === "t" && current && v.available === false;
    return `<span class="diff389-char${i < processed ? name === "s" ? " counted" : " matched" : ""}${current ? " current" : ""}${extra ? " extra" : ""}" aria-label="${name}[${i}] = ${letter}${extra ? text(", chữ thêm", ", added letter") : ''}"><small>${i}</small><b>${letter}</b>${current ? '<em>ch</em>' : ''}</span>`;
  }).join("")}</div></div>`;
  const cards = v.letters.map(letter => {
    const current = letter === v.ch;
    const extra = current && v.available === false;
    const total = v.total[letter] || 0, left = v.count[letter] || 0;
    return `<article class="diff389-frequency${current ? " current" : ""}${extra ? " extra" : ""}"><strong>${letter}</strong><div><span>${text("Trong s", "In s")}</span><b>${total}</b></div><div><span>${text("Còn lại", "Left")}</span><b>${left}</b></div><small>${extra ? text("Chữ thêm", "Added letter") : v.processedS < v.s.length ? text("Đang đếm", "Counting") : total - left > 0 ? `${total - left} ${text("đã ghép", "matched")}` : text("Chưa ghép", "Unmatched")}</small></article>`;
  }).join("");
  const phases = { init: text("Khởi tạo", "Initialize"), "read-s": text("Đọc s", "Read s"), count: text("Đếm s", "Count s"), "read-t": text("Đọc t", "Read t"), check: text("Kiểm tra lượt ghép", "Check remaining count"), consume: text("Trừ một lượt", "Consume one occurrence"), done: text("Tìm thấy chữ thêm", "Added letter found") };
  let focus = text("Đếm s trước, rồi ghép từng chữ của t", "Count s first, then match each letter in t");
  if (v.ch !== null) focus = `${v.source}[${v.index}] = '${v.ch}' · count.get('${v.ch}', 0) = ${v.count[v.ch] || 0}`;
  $("treeView").innerHTML = `<section class="diff389-viz" aria-label="${text("Mô phỏng Find the Difference 389", "389 Find the Difference visualization")}">
    <header><div><small>389 · ${phases[v.phase]}</small><h3>${text("Chữ nào không còn lượt ghép?", "Which letter has no match left?")}</h3></div><strong class="diff389-answer${v.answer !== null ? " found" : ""}">${v.answer === null ? "—" : escapeHtml(v.answer)}</strong></header>
    <div class="diff389-words">${row("s", v.s, v.processedS)}${row("t", v.t, v.consumedT)}</div>
    <div class="diff389-legend"><span>${text("Tím: chữ đang xét", "Purple: current letter")}</span><span>${text("Xanh: đã ghép", "Green: matched")}</span><span>${text("Cam: chữ thêm", "Orange: added letter")}</span></div>
    <div class="diff389-table-label"><strong>${text("Bảng đếm và lượt còn lại", "Counts and remaining matches")}</strong><small>${text("Chữ vắng mặt = 0", "Absent letter = 0")}</small></div>
    <div class="diff389-frequencies">${cards}</div>
    <div class="diff389-focus${v.available === false ? " found" : ""}"><strong>${escapeHtml(focus)}</strong><p>${escapeHtml(pick(step.note))}</p></div>
  </section>`;
}
