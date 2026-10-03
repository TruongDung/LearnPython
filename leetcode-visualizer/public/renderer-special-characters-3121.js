function renderSpecialCharacters3121View(step) {
  const view = step.specialCharacters3121View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const n = view.word.length;
  const slot = view.activeLetter ? view.activeLetter.charCodeAt(0) - 97 : null;
  const last = slot !== null && view.lastLower ? view.lastLower[slot] : -1;
  const first = slot !== null && view.firstUpper ? view.firstUpper[slot] : n;
  const both = last >= 0 && first < n;
  const inOrder = both && last < first;
  const scanning = view.phase === "scan" || view.phase === "initialize";
  const phases = { initialize: text("Khởi tạo", "Initialize"), scan: text("1 · Quét vị trí", "1 · Scan positions"), check: text("2 · Kiểm tra 26 chữ cái", "2 · Check all 26 letters"), done: text("Hoàn tất", "Complete") };
  const position = (value, lowercase) => value === null ? "—" : value === (lowercase ? -1 : n) ? `${value} (${text("chưa thấy", "unseen")})` : String(value);
  const chars = [...view.word].map((ch, index) => {
    const related = view.activeLetter && ch.toLowerCase() === view.activeLetter;
    const classes = ["sc3121-char", ch === ch.toLowerCase() ? "lower" : "upper"];
    if (related) classes.push("related");
    if (view.index === index) classes.push("current");
    if (related && index === last) classes.push("last-lower");
    if (related && index === first) classes.push("first-upper");
    if (scanning && (view.index === null || index > view.index)) classes.push("future");
    return `<div class="${classes.join(" ")}" data-index="${index}"><small>${index === last && related ? "L ↓" : index === first && related ? "U ↓" : view.index === index ? "i ↓" : "&nbsp;"}</small><strong>${ch}</strong><span>${index}</span></div>`;
  }).join("");
  let arrow = "";
  const timelineWidth = n * 58 - 6;
  if (both) {
    const start = last * 58 + 26;
    const end = first * 58 + 26;
    arrow = `<svg class="sc3121-order ${inOrder ? "valid" : "invalid"}" width="${timelineWidth}" height="34" role="img" aria-label="${text("Thứ tự L đến U", "Order from L to U")}"><defs><marker id="sc3121-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" /></marker></defs><path d="M${start},30 Q${(start + end) / 2},-12 ${end},30" marker-end="url(#sc3121-arrow)" /></svg>`;
  }
  const focus = view.activeLetter ? `<div class="sc3121-focus ${both ? inOrder ? "valid" : "invalid" : "pending"}">
    <header><strong>${view.activeLetter} / ${view.activeLetter.toUpperCase()}</strong><span>${scanning ? text("Tạm thời theo phần đã quét", "Provisional for scanned prefix") : text("Vị trí trong toàn bộ chuỗi", "Positions in the complete word")}</span></header>
    <div class="sc3121-boundaries"><div><small>last_lower · L</small><b>${position(view.lastLower ? last : null, true)}</b></div><span>${inOrder ? "<" : both ? "≥" : "?"}</span><div><small>first_upper · U</small><b>${position(view.firstUpper ? first : null, false)}</b></div></div>
    <div class="sc3121-conditions"><span class="${last >= 0 ? "yes" : "no"}">${last >= 0 ? "✓" : "○"} ${text("Có chữ thường", "Lowercase exists")}</span><span class="${first < n ? "yes" : "no"}">${first < n ? "✓" : "○"} ${text("Có chữ hoa", "Uppercase exists")}</span><span class="${inOrder ? "yes" : "no"}">${inOrder ? "✓" : "○"} L &lt; U</span></div>
    <p>${!both ? text("Thiếu một dạng chữ, chưa đủ điều kiện.", "A case is missing, so the conditions are not satisfied.") : inOrder ? text("Chữ thường cuối cùng đứng trước chữ hoa đầu tiên.", "The last lowercase comes before the first uppercase.") : text("Có chữ thường sau chữ hoa đầu tiên → không đặc biệt.", "A lowercase occurs after the first uppercase → not special.")}</p>
  </div>` : `<div class="sc3121-focus pending"><p>${text("Lưu chữ thường cuối cùng (L) và chữ hoa đầu tiên (U), rồi kiểm tra L < U. Phải có cả hai dạng chữ.", "Track the last lowercase (L) and first uppercase (U), then check L < U. Both cases must occur.")}</p></div>`;
  const relevant = new Set([...view.word.toLowerCase()]);
  if (view.activeLetter) relevant.add(view.activeLetter);
  const cards = [...relevant].sort().map(letter => {
    const k = letter.charCodeAt(0) - 97;
    const l = view.lastLower?.[k] ?? null;
    const u = view.firstUpper?.[k] ?? null;
    const counted = view.counted.includes(letter);
    const status = counted ? "counted" : view.checked[k] === true ? "passes" : view.checked[k] === false ? "rejected" : "pending";
    const labels = { counted: text("✓ Đã đếm", "✓ Counted"), passes: text("✓ Hợp lệ, chờ đếm", "✓ Passes, not counted yet"), rejected: text("✕ Không đặc biệt", "✕ Not special"), pending: scanning ? text("Chưa kết luận", "Pending scan") : text("Chưa kiểm tra", "Not checked yet") };
    return `<article class="sc3121-letter ${status}${letter === view.activeLetter ? " active" : ""}" data-letter="${letter}"><header><b>${letter} / ${letter.toUpperCase()}</b><small>[${k}]</small></header><dl><dt>L</dt><dd>${position(l, true)}</dd><dt>U</dt><dd>${position(u, false)}</dd></dl><span>${labels[status]}</span></article>`;
  }).join("");
  const omitted = 26 - relevant.size;
  $("treeView").innerHTML = `<section class="sc3121-viz" aria-label="${text("Mô phỏng chữ cái đặc biệt 3121", "3121 special-letter simulation")}">
    <header class="sc3121-heading"><div><small>3121 · ${phases[view.phase]}</small><h3>${text("Chữ thường cuối → chữ hoa đầu", "Last lowercase → first uppercase")}</h3></div><div class="sc3121-answer"><small>ans</small><b>${view.answer ?? "—"}</b></div></header>
    <section class="sc3121-word-panel"><header><strong>word</strong><span>${text("Vị trí bắt đầu từ 0", "Zero-based positions")} · n = ${n}</span></header><div class="sc3121-scroll"><div class="sc3121-timeline" style="width:${timelineWidth}px"><div class="sc3121-arrow-space">${arrow}</div><div class="sc3121-word">${chars}</div></div></div><div class="sc3121-legend"><span class="lower">${text("Chữ thường", "Lowercase")}</span><span class="upper">${text("Chữ hoa", "Uppercase")}</span><span>L = last_lower · U = first_upper</span></div></section>
    <div class="sc3121-action"><strong>${escapeHtml(pick(step.title))}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    ${focus}
    <section class="sc3121-table"><header><strong>${text("Hai mảng vị trí · 26 ô", "Position arrays · 26 slots")}</strong><span>${scanning ? text("Đang cập nhật", "Updating") : text("Đếm mỗi chữ một lần", "Count each letter once")}</span></header><div class="sc3121-letters">${cards}</div>${omitted ? `<p>${omitted} ${text("chữ cái không có trong word được thu gọn; vòng lặp vẫn kiểm tra đủ 26 ô.", "letters absent from word are collapsed; the loop still checks all 26 slots.")}</p>` : ""}</section>
    <footer class="sc3121-results"><strong>${text("Đã đếm", "Counted")}: ${view.counted.join(", ") || "∅"}</strong><span>${view.counted.length} / 26</span></footer>
  </section>`;
  const strip = $("treeView").querySelector(".sc3121-scroll");
  const target = strip.querySelector(".current") || strip.querySelector(".last-lower") || strip.querySelector(".first-upper");
  if (target) strip.scrollLeft = Math.max(0, target.offsetLeft - strip.clientWidth / 2 + target.offsetWidth / 2);
}
