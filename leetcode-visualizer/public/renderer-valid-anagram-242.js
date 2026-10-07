function renderAnagram242View(step) {
  const v = step.anagram242View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const row = (name, word, processed) => `<div class="ana242-word"><div class="ana242-row-label"><strong>${name}</strong><small>${processed}/${word.length} ${text("đã đếm", "counted")}</small></div><div class="ana242-characters">${[...word].map((letter, i) => {
    const current = v.source === name && v.index === i;
    return `<span class="ana242-char${i < processed ? " counted" : ""}${current ? " current" : ""}" aria-label="${name}[${i}] = ${letter}"><small>${i}</small><b>${letter}</b>${current ? '<em>ch</em>' : ''}</span>`;
  }).join("")}</div></div>`;
  const comparing = ["select", "compare"].includes(v.phase) || (v.phase === "done" && v.source === null && v.ch !== null);
  const complete = v.processedS === v.s.length && v.processedT === v.t.length;
  const counts = v.letters.map(letter => {
    const a = v.countS[letter] || 0, b = v.countT[letter] || 0;
    const current = v.ch === letter;
    const match = v.checked.includes(letter);
    const mismatch = current && comparing && v.same === false;
    const status = match ? text("Đã khớp", "Matched") : mismatch ? text("Khác nhau", "Mismatch") : complete ? text("Chưa so sánh", "Unchecked") : v.processedS + v.processedT === 0 ? text("Chưa đếm", "Not counted") : text("Đang đếm", "Counting");
    return `<article class="ana242-frequency${current ? " current" : ""}${match ? " matched" : ""}${mismatch ? " mismatch" : ""}" aria-label="${letter}: s=${a}, t=${b}, ${status}"><strong>${letter}</strong><div><span>s</span><b>${a}</b></div><div><span>t</span><b>${b}</b></div><small>${status}</small></article>`;
  }).join("");
  const phases = { length: text("Kiểm tra độ dài", "Check lengths"), init: text("Khởi tạo", "Initialize"), read: text("Đọc ký tự", "Read a letter"), count: text("Tăng tần suất", "Increment a frequency"), select: text("Chọn chữ", "Select a letter"), compare: text("So sánh tần suất", "Compare frequencies"), done: text("Hoàn tất", "Complete") };
  const verdict = v.answer === null ? "—" : v.answer ? "True" : "False";
  let focus = `len(s) = ${v.s.length} · len(t) = ${v.t.length}`;
  if (v.source !== null) focus = `${v.source}[${v.index}] = '${v.ch}' · count_${v.source}['${v.ch}'] = ${(v.source === "s" ? v.countS : v.countT)[v.ch] || 0}`;
  else if (comparing) focus = `'${v.ch}': ${v.countS[v.ch] || 0} ${v.same === null ? "?" : v.same ? "=" : "≠"} ${v.countT[v.ch] || 0}`;
  else if (v.answer === true) focus = text("Mọi chữ đều có cùng tần suất", "Every letter has the same frequency");
  $("treeView").innerHTML = `<section class="ana242-viz" aria-label="${text("Mô phỏng Valid Anagram 242", "242 Valid Anagram visualization")}">
    <header><div><small>242 · ${phases[v.phase]}</small><h3>${text("Đổi thứ tự, giữ tần suất", "Different order, same frequencies")}</h3></div><strong class="ana242-verdict${v.answer === true ? " yes" : v.answer === false ? " no" : ""}">${verdict}</strong></header>
    <div class="ana242-words">${row("s", v.s, v.processedS)}${row("t", v.t, v.processedT)}</div>
    <div class="ana242-legend"><span>${text("Tím: chữ đang xét", "Purple: current letter")}</span><span>${text("Xanh dương: đã đếm", "Blue: counted")}</span><span>${text("Xanh lá: tần suất đã khớp", "Green: verified frequency")}</span></div>
    <div class="ana242-table-label"><strong>${text("Bảng tần suất", "Frequency counters")}</strong><small>${text("Chữ không xuất hiện = 0", "Absent letter = 0")}</small></div>
    <div class="ana242-frequencies">${counts}</div>
    <div class="ana242-focus${v.answer === false ? " no" : ""}"><strong>${escapeHtml(focus)}</strong><p>${escapeHtml(pick(step.note))}</p></div>
  </section>`;
}
