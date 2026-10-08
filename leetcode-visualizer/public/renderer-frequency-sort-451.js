function renderFrequency451View(step) {
  const v = step.frequency451View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const order = v.ordered || v.letters;
  const maximum = Math.max(1, ...Object.values(v.count));
  const input = [...v.s].map((letter, i) => `<span class="freq451-char${i < v.processed ? " counted" : ""}${v.index === i ? " current" : ""}" aria-label="s[${i}] = ${letter}"><small>${i}</small><b>${letter}</b></span>`).join("");
  const cards = order.map((letter, rank) => {
    const frequency = v.count[letter] || 0;
    const appended = v.result.some(chunk => chunk[0] === letter);
    return `<article class="freq451-card${v.ch === letter ? " current" : ""}${appended ? " appended" : ""}"><small>${v.ordered === null ? text("chưa xếp", "unranked") : `#${rank + 1}`}</small><strong>${letter}</strong><b>${frequency}</b><div class="freq451-track"><span style="width:${frequency / maximum * 100}%"></span></div><small>${appended ? text("Đã ghép", "Appended") : text("lần xuất hiện", "occurrences")}</small></article>`;
  }).join("");
  const output = v.result.map(chunk => `<div class="freq451-group${v.ch === chunk[0] ? " current" : ""}"><small>'${chunk[0]}' × ${chunk.length}</small><div>${[...chunk].map(letter => `<b>${letter}</b>`).join('')}</div></div>`).join("");
  const phases = { init: text("Khởi tạo", "Initialize"), read: text("Đọc ký tự", "Read a character"), count: text("Đếm tần suất", "Count frequencies"), sort: text("Sắp xếp các nhóm", "Sort groups"), prepare: text("Chuẩn bị kết quả", "Prepare result"), select: text("Chọn một nhóm", "Select a group"), append: text("Ghép nhóm", "Append group"), done: text("Hoàn tất", "Complete") };
  let focus = text("Đếm từng ký tự trước khi sắp xếp", "Count each character before sorting");
  if (v.index !== null) focus = `s[${v.index}] = '${v.ch}' · count['${v.ch}'] = ${v.count[v.ch] || 0}`;
  else if (v.ch !== null) focus = `'${v.ch}' × ${v.count[v.ch]}`;
  else if (v.ordered !== null) focus = v.ordered.map(letter => `${letter}:${v.count[letter]}`).join(' → ');
  $("treeView").innerHTML = `<section class="freq451-viz" aria-label="${text("Mô phỏng Sort Characters By Frequency 451", "451 Sort Characters By Frequency visualization")}">
    <header><div><small>451 · ${phases[v.phase]}</small><h3>${text("Nhóm xuất hiện nhiều đi trước", "Most frequent groups first")}</h3></div><strong>${v.result.join('').length}/${v.s.length}</strong></header>
    <div class="freq451-label"><strong>s</strong><small>${v.processed}/${v.s.length} ${text("đã đếm", "counted")} · A ≠ a</small></div>
    <div class="freq451-input">${input}</div>
    <div class="freq451-label"><strong>${text("Tần suất và thứ tự", "Frequencies and order")}</strong><small>${v.ordered === null ? text("Chưa sắp xếp", "Not sorted yet") : text("Tần suất giảm dần", "Descending frequency")}</small></div>
    <div class="freq451-cards">${cards}</div>
    <p class="freq451-rule">${text("Hòa tần suất: ví dụ chọn thứ tự mã ký tự; các thứ tự khác giữa các nhóm bằng nhau cũng đúng.", "Ties use character-code order here; other orders among tied groups are valid too.")}</p>
    <div class="freq451-output"><strong>${text("Kết quả đang ghép", "Output being assembled")}</strong><div>${output || `<span class="freq451-empty">${text("Chưa có nhóm nào", "No groups yet")}</span>`}</div>${v.answer === null ? '' : `<code>${escapeHtml(v.answer)}</code>`}</div>
    <div class="freq451-focus"><strong>${escapeHtml(focus)}</strong><p>${escapeHtml(pick(step.note))}</p></div>
  </section>`;
}
