function renderValidParenthesis678View(step) {
  const view = step.validParenthesis678View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const done = view.answer !== null;
  const range = view.committed;
  const input = [...view.s].map((ch, index) => `<span class="vp678-character ${ch === "*" ? "star" : ch === "(" ? "open" : "close"}${index === view.index ? " active" : ""}${index < range.length ? " read" : " future"}${!range.feasible && index === view.index ? " failed" : ""}" data-index="${index}"><small>${index === view.index ? "i ↓" : `[${index}]`}</small><b>${ch}</b></span>`).join("");
  const axisUpper = Math.max(5, range.high === null ? 0 : range.high + 1);
  const counts = Array.from({ length: axisUpper + 1 }, (_, count) => {
    const possible = range.feasible && count >= range.low && count <= range.high;
    return `<span class="vp678-count${possible ? " possible" : ""}${count === 0 ? " zero" : ""}${possible && count === range.low ? " minimum" : ""}${possible && count === range.high ? " maximum" : ""}" data-count="${count}" data-possible="${possible}" title="${count} ${text("ngoặc mở chưa đóng", "unmatched openings")}"><small>${possible && count === range.low && count === range.high ? "low = high" : possible && count === range.low ? "low ↓" : possible && count === range.high ? "high ↓" : count === 0 ? text("đích", "goal") : "&nbsp;"}</small><b>${count}</b><span>${possible ? "✓" : "·"}</span></span>`;
  }).join("");
  let meaning = `<p>${text("Mỗi ngoặc mở cần một ngoặc đóng nằm sau nó. Giữ khoảng số ngoặc mở có thể còn lại, thay vì thử từng cách gán *.", "Each opening needs a later closing bracket. Track the possible count range instead of trying every star assignment.")}</p>`;
  if (view.ch === "*") {
    const branch = (label, delta) => {
      const high = view.before.high + delta;
      const low = Math.max(0, view.before.low + delta);
      return `<div class="vp678-branch${high < 0 ? " impossible" : ""}"><small>* → ${label}</small><b>${delta > 0 ? "+1" : delta < 0 ? "−1" : "0"}</b><span>${high < 0 ? text("ngoặc đóng dư ✕", "extra closing ✕") : `[${low}, ${high}]`}</span></div>`;
    };
    meaning = `<div class="vp678-branches">${branch(")", -1)}${branch("ε", 0)}${branch("(", 1)}</div><p>${text("ε nghĩa là bỏ dấu *. Đây là ba lựa chọn có thể có, chưa chọn cố định một cách nào. low và high giữ hai đầu của tất cả khả năng hợp lệ.", "ε means remove the star. These are three possible choices; no assignment has been fixed. low and high retain the endpoints of all valid possibilities.")}</p>`;
  } else if (view.ch) {
    meaning = `<div class="vp678-rule"><b>${view.ch}</b><span>→</span><code>${view.ch === "(" ? "low + 1, high + 1" : "low − 1, high − 1"}</code></div><p>${view.ch === "(" ? text("Thêm một ngoặc mở cho mọi cách diễn giải đang còn hợp lệ.", "Every surviving interpretation gains one unmatched opening.") : text("Đóng một ngoặc mở. Cách nào chưa có ngoặc mở sẽ bị loại.", "Close one opening. Interpretations with no opening available are discarded.")}</p>`;
  }
  const status = view.answer === true ? "True" : view.answer === false ? "False" : text("Đang quét", "Scanning");
  let explanation;
  if (!range.feasible) explanation = text("Không còn khả năng hợp lệ: ngoặc đóng này không có ngoặc mở đứng trước để ghép. Các ký tự phía sau không sửa được prefix sai.", "No interpretation survives: this closing has no earlier opening to match. Later characters cannot repair an invalid prefix.");
  else if (view.answer === true) explanation = text("Khoảng cuối chứa 0 → có ít nhất một cách đóng hết ngoặc. high có thể lớn hơn 0 mà đáp án vẫn True.", "The final range contains 0 → at least one interpretation closes everything. high can be greater than 0 and the answer still True.");
  else if (view.answer === false) explanation = text(`Khoảng cuối không chứa 0: ít nhất ${view.low} ngoặc mở vẫn chưa đóng.`, `The final range excludes 0: at least ${view.low} openings remain unmatched.`);
  else explanation = text("Các ô xanh là mọi số ngoặc mở còn lại có thể có trong prefix đã chốt. Số 0 là mục tiêu ở cuối chuỗi.", "Green cells are all possible unmatched opening counts for the finalized prefix. Zero is the goal at the end of the string.");
  const history = view.history.map(row => `<div class="vp678-history-row"><code>[${row.index}] '${row.ch}'</code><span>[${row.beforeLow}, ${row.beforeHigh}] → <b>[${row.low}, ${row.high}]</b></span></div>`).join("");
  const witness = view.witness ? `<section class="vp678-witness"><header><strong>${text("MỘT CÁCH GÁN * HỢP LỆ", "ONE VALID STAR ASSIGNMENT")}</strong><span>${text("Ví dụ minh họa", "Teaching example")}</span></header><div class="vp678-assigned">${view.witness.assigned.map((ch, index) => `<span class="vp678-assignment${view.s[index] === "*" ? " star" : ""}" data-index="${index}"><small>${view.s[index]}</small><span>↓</span><b>${ch || "ε"}</b><small>[${index}]</small></span>`).join("")}</div><p>${text("Bỏ các ε, ta được", "Removing ε gives")} <code>${view.witness.resolved || "ε"}</code> · ${text("ngoặc cân bằng ✓", "balanced brackets ✓")}</p></section>` : "";
  $("treeView").innerHTML = `<section class="vp678-viz" aria-label="${text("Mô phỏng chuỗi ngoặc hợp lệ 678", "678 valid parenthesis string simulation")}">
    <header class="vp678-heading"><div><small>678 · GREEDY RANGE</small><h3>${text("Có thể còn bao nhiêu ngoặc mở?", "How many openings could remain?")}</h3></div><span class="${view.answer === true ? "valid" : view.answer === false ? "invalid" : ""}">${status}</span></header>
    <section class="vp678-input-panel"><header><strong>s</strong><span>${text("Quét từ trái sang phải", "Scan left to right")} →</span></header><div class="vp678-input-strip">${input}</div></section>
    <div class="vp678-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <section class="vp678-meaning">${meaning}</section>
    <section class="vp678-bounds"><header><strong>${view.calculating ? text("ĐANG TÍNH HAI BIÊN", "COMPUTING BOTH BOUNDS") : text("HAI BIÊN TRONG CODE", "BOUNDS IN CODE")}</strong><span>${view.calculating ? text("Chưa chốt prefix mới", "New prefix not finalized yet") : "low ≤ high"}</span></header><div><article><small>low · ${text("biên nhỏ nhất", "minimum bound")}</small><b>${view.low}</b><span>${view.index !== null ? `${view.before.low} → ${view.low}` : ""}</span></article><article><small>high · ${text("biên lớn nhất", "maximum bound")}</small><b>${view.high}</b><span>${view.index !== null ? `${view.before.high} → ${view.high}` : ""}</span></article></div>${view.calculating ? `<p>${text("Đây là giá trị biến ở đúng dòng code hiện tại. low có thể tạm âm; cập nhật cả hai biên, kiểm tra high, rồi chặn low về 0 mới có khoảng hợp lệ.", "These are variable values at this exact code line. low may be temporarily negative; update both bounds, check high, then clamp low to 0 to obtain the valid range.")}</p>` : ""}</section>
    <section class="vp678-range-panel ${!range.feasible || view.answer === false ? "invalid" : ""}"><header><strong>${text("SỐ NGOẶC MỞ CÓ THỂ CÒN LẠI", "POSSIBLE UNMATCHED OPENINGS")}</strong><span>${range.feasible ? `[${range.low}, ${range.high}]` : "∅"}</span></header><p class="vp678-prefix">${text("Đã chốt", "Finalized")} ${range.length}/${view.s.length} ${text("ký tự", "characters")}: <code>${view.s.slice(0, range.length) || "ε"}</code></p><div class="vp678-range-strip">${counts}</div><p>${explanation}</p></section>
    ${witness}
    <details class="vp678-history"${done ? " open" : ""}><summary>${text("Khoảng sau từng ký tự", "Range after each character")}</summary>${history || `<p>${text("Chưa chốt ký tự nào.", "No character has been finalized yet.")}</p>`}${view.historyOmitted ? `<p>${view.historyOmitted} ${text("prefix trước đã thu gọn.", "earlier prefixes are collapsed.")}</p>` : ""}</details>
  </section>`;
  const inputStrip = $("treeView").querySelector(".vp678-input-strip");
  const active = inputStrip.querySelector(".active");
  if (active) inputStrip.scrollLeft = Math.max(0, active.offsetLeft - inputStrip.offsetLeft - inputStrip.clientWidth / 2 + active.offsetWidth / 2);
  const rangeStrip = $("treeView").querySelector(".vp678-range-strip");
  const minimum = rangeStrip.querySelector(".minimum");
  if (minimum) rangeStrip.scrollLeft = Math.max(0, minimum.offsetLeft - rangeStrip.offsetLeft - rangeStrip.clientWidth / 2 + minimum.offsetWidth / 2);
}
