function renderEquivalent1662View(step) {
  const v = step.equivalent1662View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const ready = v.s1 !== null && v.s2 !== null;
  const differentLength = ready && v.s1.length !== v.s2.length && ["length","done"].includes(v.phase);
  const mismatch = v.same === false;
  const maximum = Math.max(v.word1.join("").length, v.word2.join("").length);
  const minimum = Math.min(v.word1.join("").length, v.word2.join("").length);
  const parts = (words, name) => `<div class="eq1662-parts"><strong>${name}</strong>${words.map((word, i) => `<span><small>[${i}]</small><code>${escapeHtml(JSON.stringify(word))}</code></span>`).join('<b>+</b>')}</div>`;
  const row = (words, joined, name) => {
    let position = 0;
    const cells = words.flatMap((word, chunk) => [...word].map((ch, offset) => {
      const i = position++;
      const current = ready && v.index === i && !(v.phase === "done" && v.answer === true);
      const status = joined === null ? " pending" : current && mismatch ? " mismatch" : i < v.matched ? " matched" : differentLength && i >= minimum ? " extra" : "";
      return `<div class="eq1662-cell${status}${current ? " current" : ""}${offset === 0 ? " chunk-start" : ""}" aria-label="${name}[${i}] = ${ch}, word${name === "s1" ? 1 : 2}[${chunk}][${offset}]"><small>${i}</small><b>${ch}</b><span>[${chunk}][${offset}]</span></div>`;
    }));
    for (let i = position; i < maximum; i++) cells.push(`<div class="eq1662-cell absent"><small>${i}</small><b>∅</b><span>${text("hết chuỗi", "end")}</span></div>`);
    return `<div class="eq1662-row"><strong>${name}<small>${joined === null ? text("chưa nối", "not joined") : `n = ${joined.length}`}</small></strong><div>${cells.join("")}</div></div>`;
  };
  const phases = { init:text("Hai mảng đầu vào", "Input arrays"), "join-first":text("Nối word1", "Join word1"), "join-second":text("Nối word2", "Join word2"), length:text("Kiểm tra độ dài", "Check lengths"), read:text("Đọc cùng vị trí", "Read matching positions"), compare:text("So sánh ký tự", "Compare characters"), done:text("Hoàn tất", "Complete") };
  const verdict = v.answer === null ? "—" : v.answer ? "True" : "False";
  let focus = text("Nối phần tử trước, rồi so sánh chuỗi.", "Join the chunks first, then compare the strings.");
  if (differentLength) focus = `${v.s1.length} ≠ ${v.s2.length} · ${text("khác độ dài", "different lengths")}`;
  else if (v.answer === true) focus = `${v.matched}/${v.s1.length} · ${text("mọi ký tự đều trùng", "all characters match")}`;
  else if (v.index !== null) focus = `i = ${v.index}: ${v.s1[v.index]} ${v.same === null ? "?" : v.same ? "=" : "≠"} ${v.s2[v.index]}`;
  $("treeView").innerHTML = `<section class="eq1662-viz" aria-label="${text("Mô phỏng hai mảng chuỗi 1662", "1662 string array comparison")}">
    <header><div><small>1662 · ${phases[v.phase]}</small><h3>${text("Cách chia khác, chuỗi có giống?", "Different chunks, same string?")}</h3></div><strong class="eq1662-verdict ${v.answer === true ? "yes" : v.answer === false ? "no" : ""}">${verdict}</strong></header>
    <div class="eq1662-inputs">${parts(v.word1,"word1")}${parts(v.word2,"word2")}</div>
    <div class="eq1662-scroll">${row(v.word1,v.s1,"s1")}${row(v.word2,v.s2,"s2")}</div>
    <div class="eq1662-legend"><span>${text("Số trên: vị trí trong chuỗi đã nối", "Top number: position in the joined string")}</span><span>${text("Số dưới: [phần tử][ký tự] gốc", "Bottom: original [chunk][character]")}</span><span>∅ = ${text("không còn ký tự", "no character")}</span></div>
    <div class="eq1662-focus${mismatch || differentLength ? " no" : ""}"><strong>${focus}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="eq1662-strings"><code>s1 = ${v.s1 === null ? "—" : escapeHtml(JSON.stringify(v.s1))}</code><code>s2 = ${v.s2 === null ? "—" : escapeHtml(JSON.stringify(v.s2))}</code></div>
  </section>`;
  const strip = $("treeView").querySelector(".eq1662-scroll");
  const target = strip.querySelector(".current") || strip.querySelector(".extra");
  if (target) strip.scrollLeft = Math.max(0, target.offsetLeft - strip.clientWidth / 2);
}
