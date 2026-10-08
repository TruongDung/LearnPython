function renderTriplets1876View(step) {
  const v = step.triplets1876View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const cells = [...v.s].map((letter, i) => {
    const active = v.left !== null && i >= v.left && i <= v.left + 2;
    return `<span class="trip1876-char${active ? ' active' : ''}${active && v.good === true ? ' yes' : active && v.good === false ? ' no' : ''}"><small>${i}</small><b>${letter}</b>${v.left === i ? '<em>L</em>' : v.left !== null && v.left + 2 === i ? '<em>R</em>' : ''}</span>`;
  }).join('');
  const phases = { init:text("Khởi tạo","Initialize"), short:text("Chuỗi quá ngắn","String too short"), move:text("Trượt cửa sổ","Slide the window"), window:text("Lấy 3 ký tự","Take three letters"), compare:text("Kiểm tra chữ lặp","Check repeated letters"), count:text("Tăng kết quả","Increment answer"), done:text("Hoàn tất","Complete") };
  const history = v.history.map(entry => `<article class="trip1876-entry${entry.good ? ' yes' : ' no'}"><small>[${entry.left}, ${entry.left+2}]</small><strong>${entry.window}</strong><span>${entry.good ? '✓ +1' : '✕ +0'}</span></article>`).join('');
  const current = v.window === null ? `<span>${text("Chưa lấy cửa sổ", "No window selected")}</span>` : `<strong>${v.window}</strong><span>set = {${[...new Set(v.window)].join(', ')}}</span><b>${v.distinct === null ? text("Chưa so sánh", "Not checked yet") : `${v.distinct} ${text("chữ khác nhau", "distinct letters")} ${v.good ? '✓' : '✕'}`}</b>`;
  $("treeView").innerHTML = `<section class="trip1876-viz" aria-label="${text("Mô phỏng cửa sổ 3 ký tự 1876", "1876 three-character sliding window visualization")}">
    <header><div><small>1876 · ${phases[v.phase]}</small><h3>${text("3 ký tự liền nhau, không lặp", "Three adjacent letters, no repeats")}</h3></div><div class="trip1876-answer"><small>answer</small><strong>${v.answer}</strong></div></header>
    <p class="trip1876-rule">${text("Tím: cửa sổ đang xét · Xanh: đủ 3 chữ khác nhau · Đỏ: có chữ lặp", "Purple: current window · Green: three distinct letters · Red: repeated letters")}</p>
    <div class="trip1876-input">${cells}</div>
    ${v.phase === 'done' ? '' : `<div class="trip1876-current${v.good === true ? ' yes' : v.good === false ? ' no' : ''}">${current}</div>`}
    <div class="trip1876-label"><strong>${text("Các cửa sổ đã kiểm tra", "Checked windows")}</strong><small>${v.history.length}/${Math.max(0,v.s.length-2)}</small></div>
    <div class="trip1876-history">${history || `<p>${text("Chưa có cửa sổ nào đã kiểm tra.", "No windows checked yet.")}</p>`}</div>
    <p class="trip1876-rule">${text("Cùng nội dung ở vị trí khác vẫn được tính riêng. Cửa sổ trượt sang phải một ký tự mỗi lần.", "Identical text at different positions counts separately. Move the window one character right each time.")}</p>
    <div class="trip1876-focus"><strong>${v.left === null ? `${text("Đã đếm", "Counted")}: ${v.answer}` : `s[${v.left}:${v.left+3}]`}</strong><p>${escapeHtml(pick(step.note))}</p></div>
  </section>`;
}
