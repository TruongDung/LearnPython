function renderReverseWords151View(step) {
  const v = step.reverseWords151View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const done = v.phase === "done";
  const cells = [...v.s].map((ch, index) => {
    const active = v.range && index >= v.range.start && index <= v.range.end;
    const collected = v.words.some(word => index >= word.start && index <= word.end);
    const skipped = ch === " " && v.i !== null && index > v.i;
    const pointer = [v.i === index ? "i" : "", v.end === index ? "end" : ""].filter(Boolean).join("/");
    return `<div class="rw151-cell${active ? " active" : ""}${collected ? " collected" : ""}${skipped ? " skipped" : ""}${v.i === index ? " pointer" : ""}" aria-label="${escapeHtml(`s[${index}] = ${ch === " " ? text("dấu cách", "space") : ch}`)}"><small>${index}</small><b>${ch === " " ? "␠" : escapeHtml(ch)}</b><span>${pointer}</span></div>`;
  }).join("");
  const words = v.words.map((word, index) => `${index ? '<span class="rw151-separator">␠</span>' : ""}<article class="rw151-word${v.phase === "append" && index === v.words.length - 1 ? " latest" : ""}"><small>s[${word.start}:${word.end + 1}]</small><b>${escapeHtml(word.text)}</b></article>`).join("");
  $("treeView").innerHTML = `<section class="rw151-viz" aria-label="${text("Mô phỏng đảo thứ tự từ 151", "151 reverse word order simulation")}">
    <header><div><small>151 · ${text("Duyệt từ phải sang trái", "Scan right to left")}</small><h3>${text("Đảo thứ tự từ", "Reverse word order")}</h3></div><strong>${v.words.length}<small>${text("từ đã lấy", "words collected")}</small></strong></header>
    <div class="rw151-legend"><span>i ← ${text("quét sang trái", "scan left")}</span><span>${text("Tím: từ đang quét", "Purple: current word")}</span><span>${text("Xanh: từ đã lấy", "Green: collected word")}</span><span>␠ = ${text("dấu cách", "space")}</span></div>
    <div class="rw151-scroll"><div class="rw151-source"><div class="rw151-cell rw151-before${v.i === -1 ? " pointer" : ""}"><small>-1</small><b>∅</b><span>${v.i === -1 ? "i" : ""}</span></div>${cells}</div></div>
    <div class="rw151-focus"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <h4>words · ${text("thứ tự đầu ra", "output order")}</h4><div class="rw151-words">${words || `<span class="rw151-empty">${text("Chưa thêm từ", "No words appended yet")}</span>`}</div>
    <div class="rw151-result"><small>${done ? text("Kết quả", "Answer") : text("Kết quả đang xây dựng", "Output so far")}</small><code>${escapeHtml(JSON.stringify(v.words.map(word => word.text).join(" ")))}</code></div>
  </section>`;
}
