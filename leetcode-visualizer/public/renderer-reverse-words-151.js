function renderReverseWords151View(step) {
  const v = step.reverseWords151View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const phaseNames = {
    split: text("Tách từ", "Split words"),
    pointers: text("Đặt hai con trỏ", "Set pointers"),
    check: text("Kiểm tra vòng lặp", "Check loop"),
    "check-done": text("Dừng vòng lặp", "Stop loop"),
    swap: text("Đổi cặp từ", "Swap word pair"),
    "move-left": text("Dịch left", "Move left"),
    "move-right": text("Dịch right", "Move right"),
    done: text("Hoàn tất", "Complete"),
  };
  const sourceSegments = v.segments.map((segment) => {
    if (segment.space) {
      return `<span class="rw151-source-space" title="${text("Khoảng trắng bị loại bởi split()", "Whitespace removed by split()")}"><b>␠</b><small>×${segment.text.length}</small></span>`;
    }
    return `<span class="rw151-source-word"><small>${segment.start}…${segment.end}</small><b>${escapeHtml(segment.text)}</b></span>`;
  }).join("");
  const wordCards = v.words.map((word, index) => {
    const pointers = [v.left === index ? "L" : "", v.right === index ? "R" : ""].filter(Boolean).join("/");
    const swapped = v.swap && (v.swap.left === index || v.swap.right === index);
    const moved = v.origins[index] !== index;
    return `<article class="rw151-word${pointers ? " pointed" : ""}${swapped ? " swapped" : ""}${moved ? " moved" : ""}">
      <small>${text("vị trí", "position")} ${index}</small>
      <b>${escapeHtml(word)}</b>
      <span>${pointers || "&nbsp;"}</span>
      <em>${text("từ gốc", "source word")} #${v.origins[index] + 1}</em>
    </article>`;
  }).join("");
  const completed = v.phase === "done";
  $("treeView").innerHTML = `<section class="rw151-viz" aria-label="${text("Mô phỏng đảo thứ tự từ 151", "151 reverse word order simulation")}">
    <header>
      <div><small>151 · ${phaseNames[v.phase]}</small><h3>${text("Đảo thứ tự từ và chuẩn hóa khoảng trắng", "Reverse word order and normalize spaces")}</h3></div>
      <strong>${v.swaps}<small>${text("lần đổi", "swaps")}</small></strong>
    </header>
    <div class="rw151-source-panel">
      <div><small>${text("Chuỗi gốc", "Original string")}</small><code>${escapeHtml(JSON.stringify(v.s))}</code></div>
      <div class="rw151-segments">${sourceSegments}</div>
      <p><span>split()</span> ${text(`giữ ${v.originalWords.length} từ · loại ${v.discardedSpaces} dấu cách`, `keeps ${v.originalWords.length} words · removes ${v.discardedSpaces} spaces`)}</p>
    </div>
    <div class="rw151-direction"><span>${text("đầu", "front")}</span><i></i><b>${text("đảo từ ngoài vào trong", "swap outside-in")}</b><i></i><span>${text("cuối", "back")}</span></div>
    <div class="rw151-words">${wordCards}</div>
    <div class="rw151-note"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="rw151-result${completed ? " complete" : ""}"><small>${completed ? text("Kết quả", "Answer") : text("Kết quả tạm thời", "Current output")}</small><code>${escapeHtml(JSON.stringify(v.output))}</code></div>
  </section>`;
}
