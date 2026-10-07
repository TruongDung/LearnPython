function renderPalindrome409View(step) {
  const v = step.palindrome409View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const input = [...v.s].map((letter, i) => `<span class="pal409-char${i < v.processed ? " counted" : ""}${v.index === i ? " current" : ""}" aria-label="s[${i}] = ${letter}"><small>${i}</small><b>${letter}</b>${v.index === i ? '<em>ch</em>' : ''}</span>`).join("");
  const cards = v.letters.map(letter => {
    const current = letter === v.ch;
    const paired = Object.prototype.hasOwnProperty.call(v.used, letter);
    const total = v.count[letter] || 0;
    const isCenter = letter === v.center;
    const status = isCenter ? text("Chọn làm tâm", "Chosen center") : v.oddLetters.includes(letter) ? text("Dư 1 chữ", "1 spare letter") : v.checked.includes(letter) ? text("Dùng hết", "All used") : v.processed < v.s.length ? text("Đang đếm", "Counting") : text("Chưa xong", "Pending");
    return `<article class="pal409-frequency${current ? " current" : ""}${v.checked.includes(letter) ? " checked" : ""}${isCenter ? " center" : ""}"><strong>${letter}</strong><div><span>${text("Đếm", "Count")}</span><b>${total}</b></div><div><span>${text("Cặp", "Pairs")}</span><b>${v.pairCounts[letter] === undefined ? "—" : v.pairCounts[letter]}</b></div><div><span>${text("Dùng đôi", "Paired")}</span><b>${paired ? v.used[letter] : "—"}</b></div><small>${status}</small></article>`;
  }).join("");
  const half = (letters, side) => [...letters].map((letter, i) => `<span class="pal409-piece" aria-label="${text("Nửa", "Half")} ${side}[${i}] = ${letter}">${letter}</span>`).join("");
  const built = v.left.length * 2 + (v.center === null ? 0 : 1);
  const arrangement = built === 0 ? `<span class="pal409-empty">${text("Chưa ghép chữ nào", "No letters assembled yet")}</span>` : `${half(v.left, "L")}${v.center === null ? '' : `<span class="pal409-piece center" aria-label="${text("Tâm", "Center")} = ${v.center}">${v.center}</span>`}${half([...v.left].reverse().join(''), "R")}`;
  const unused = v.phase === "done" ? v.oddLetters.filter(letter => letter !== v.center) : [];
  const phases = { init: text("Khởi tạo", "Initialize"), read: text("Đọc ký tự", "Read a letter"), count: text("Đếm tần suất", "Count frequencies"), prepare: text("Chuẩn bị ghép", "Prepare pairs"), select: text("Xét một chữ", "Inspect a letter"), pairs: text("Tính số cặp", "Compute pairs"), add: text("Cộng độ dài", "Add paired length"), "odd-check": text("Kiểm tra dư lẻ", "Check odd count"), center: text("Tâm tối đa một chữ", "At most one center"), done: text("Hoàn tất", "Complete") };
  let focus = text("Đếm trước, rồi lấy các cặp đối xứng", "Count first, then take mirrored pairs");
  if (v.index !== null) focus = `s[${v.index}] = '${v.ch}' · count['${v.ch}'] = ${v.count[v.ch] || 0}`;
  else if (v.length !== null) focus = `length = ${v.length} · has_odd = ${v.hasOdd ? "True" : "False"}${v.answer === null ? "" : ` → ${v.answer}`}`;
  $("treeView").innerHTML = `<section class="pal409-viz" aria-label="${text("Mô phỏng Longest Palindrome 409", "409 Longest Palindrome visualization")}">
    <header><div><small>409 · ${phases[v.phase]}</small><h3>${text("Lấy các cặp, thêm một tâm", "Take pairs, add one center")}</h3></div><div class="pal409-metric"><strong>${v.answer === null ? built : v.answer}</strong><small>${text("độ dài ghép", "assembled length")}</small></div></header>
    <div class="pal409-input-label"><strong>s</strong><small>${v.processed}/${v.s.length} ${text("đã đếm", "counted")} · A ≠ a</small></div>
    <div class="pal409-characters">${input}</div>
    <div class="pal409-legend"><span>${text("Tím: chữ đang xét", "Purple: current letter")}</span><span>${text("Xanh: các cặp", "Green: paired letters")}</span><span>${text("Cam: một tâm", "Orange: one center")}</span></div>
    <div class="pal409-frequencies">${cards}</div>
    <div class="pal409-example"><div><strong>${text("Một cách ghép", "One arrangement")}</strong><small>${built} ${text("ký tự", "letters")}</small></div><div class="pal409-palindrome">${arrangement}</div><p>${text("Hai bên là ảnh gương. Đề chỉ yêu cầu độ dài.", "Both sides mirror each other. The requested answer is the length.")}</p>${v.phase === "done" ? `<p>${text("Chữ không dùng", "Unused letters")}: <code>${unused.length ? unused.join(' ') : text("không có", "none")}</code></p>` : ''}</div>
    <div class="pal409-focus"><strong>${escapeHtml(focus)}</strong><p>${escapeHtml(pick(step.note))}</p></div>
  </section>`;
}
