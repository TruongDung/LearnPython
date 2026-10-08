function renderClose1657View(step) {
  const v = step.close1657View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const row = (name, word, processed) => `<div class="close1657-label"><strong>${name}</strong><small>${processed}/${word.length} ${text("đã đếm", "counted")}</small></div><div class="close1657-word">${[...word].map((letter, i) => `<span class="close1657-char${i < processed ? ' counted' : ''}${v.source === name && v.index === i ? ' current' : ''}"><small>${i}</small><b>${letter}</b></span>`).join('')}</div>`;
  const counts = v.letters.map(letter => {
    const a = v.count1[letter] || 0, b = v.count2[letter] || 0;
    const tested = v.sameLetters !== null;
    const missing = tested && (!a || !b);
    return `<article class="close1657-count${v.ch === letter ? ' current' : ''}${missing ? ' no' : tested ? ' yes' : ''}"><strong>${letter}</strong><div><small>word1</small><b>${a}</b></div><div><small>word2</small><b>${b}</b></div><small>${missing ? text("Thiếu chữ", "Missing letter") : tested ? text("Có ở cả hai", "In both") : text("Đang đếm", "Counting")}</small></article>`;
  }).join('');
  const sortedEntries = counter => Object.entries(counter).sort((a,b)=>a[1]-b[1] || a[0].localeCompare(b[0]));
  const entries1 = sortedEntries(v.count1), entries2 = sortedEntries(v.count2);
  const sorted = v.freq1 === null ? `<p class="close1657-muted">${text("Chỉ so sánh tần suất sau khi tập chữ đã khớp.", "Compare frequencies after the letter sets match.")}</p>` : `<div class="close1657-pairs">${v.freq1.map((frequency, i) => {
    const ready = v.freq2 !== null, current = v.rank === i, matched = i < v.checked;
    const mismatch = current && ready && frequency !== v.freq2[i];
    return `<article class="close1657-pair${current ? ' current' : ''}${matched ? ' yes' : mismatch ? ' no' : ''}"><small>#${i + 1}</small><div><b>${frequency}</b><span>${ready ? matched ? '=' : mismatch ? '≠' : '?' : '…'}</span><b>${ready ? v.freq2[i] : '—'}</b></div><small>${entries1[i][0]} ${ready ? `↔ ${entries2[i][0]}` : ''}</small></article>`;
  }).join('')}</div>`;
  const phases = { length:text("Kiểm tra độ dài","Check lengths"), init:text("Khởi tạo","Initialize"), read:text("Đọc ký tự","Read a letter"), count:text("Đếm ký tự","Count a letter"), letters:text("So sánh tập chữ","Compare letter sets"), sort1:text("Sắp xếp word1","Sort word1"), sort2:text("Sắp xếp word2","Sort word2"), compare:text("Ghép cặp tần suất","Pair frequencies"), done:text("Hoàn tất","Complete") };
  const status = (value) => value === null ? '—' : value ? '✓' : '✕';
  const sameFrequencies = v.answer !== null && v.freq2 !== null ? v.answer : null;
  const badge = (value, label) => `<div class="close1657-check${value === true ? ' yes' : value === false ? ' no' : ''}"><strong>${status(value)}</strong><span>${label}</span></div>`;
  $("treeView").innerHTML = `<section class="close1657-viz" aria-label="${text("Mô phỏng hai chuỗi gần nhau 1657", "1657 close strings visualization")}">
    <header><div><small>1657 · ${phases[v.phase]}</small><h3>${text("Cùng tập chữ, ghép được tần suất", "Same letters, matching frequency lists")}</h3></div><strong class="close1657-verdict${v.answer === true ? ' yes' : v.answer === false ? ' no' : ''}">${v.answer === null ? '—' : v.answer ? 'True' : 'False'}</strong></header>
    <p class="close1657-rule">${text("Đổi vị trí giữ nguyên tần suất. Đổi toàn bộ hai chữ đã có sẽ hoán đổi tần suất của chúng.", "Position swaps preserve frequencies. Exchanging two existing letter identities swaps their frequencies.")}</p>
    ${row('word1',v.word1,v.processed1)}${row('word2',v.word2,v.processed2)}
    <div class="close1657-checks">${badge(v.sameLetters,text("1. Cùng tập chữ xuất hiện", "1. Same existing letter set"))}${badge(sameFrequencies,text("2. Cùng danh sách tần suất", "2. Same frequency list"))}</div>
    <div class="close1657-label"><strong>${text("Bảng đếm theo chữ", "Counters by letter")}</strong><small>${text("Chữ vắng mặt = 0", "Absent letter = 0")}</small></div>
    <div class="close1657-counts">${counts}</div>
    <div class="close1657-label"><strong>${text("Tần suất đã sắp xếp", "Sorted frequencies")}</strong><small>word1 ↔ word2</small></div>
    ${sorted}
    <p class="close1657-muted">${text("Giữ các tần suất lặp. Các chữ dưới mỗi cặp là nhãn để ghép tần suất, không phải một phép đổi duy nhất.", "Retain repeated frequencies. Letters under each pair label a frequency pairing, not a single swap operation.")}</p>
    <div class="close1657-focus${v.answer === false ? ' no' : ''}"><strong>${v.source === null ? `len(word1) = ${v.word1.length} · len(word2) = ${v.word2.length}` : `${v.source}[${v.index}] = '${v.ch}'`}</strong><p>${escapeHtml(pick(step.note))}</p></div>
  </section>`;
}
