function renderDefang1108View(step) {
  const v = step.defang1108View;
  const text = (vi, en) => lang === "vi" ? vi : en;
  const done = v.phase === "done";
  const cell = (value, index, output) => {
    const written = !output || index < v.result.length;
    const current = !done && index === v.index;
    const dot = v.address[index] === ".";
    return `<div class="df1108-cell${current ? " current" : ""}${dot ? " dot" : ""}${output && written && dot ? " replaced" : ""}${!written ? " pending" : ""}" aria-label="${escapeHtml(`${index}: ${written ? value : text("chưa ghi", "not written")}`)}"><small>${index}</small><b>${written ? escapeHtml(value) : "·"}</b><span>${current ? "i" : output && written && dot ? "✓" : ""}</span></div>`;
  };
  const source = [...v.address].map((ch, i) => cell(ch, i, false)).join("");
  const output = [...v.address].map((_, i) => cell(v.result[i], i, true)).join("");
  const phases = { init:text("Khởi tạo", "Initialize"), read:text("Đọc ký tự", "Read character"), check:text("Kiểm tra dấu chấm", "Check for a dot"), else:text("Giữ chữ số", "Keep digit"), "append-dot":text("Thêm [.]", "Append [.]"), "append-digit":text("Thêm chữ số", "Append digit"), done:text("Hoàn tất", "Complete") };
  let decision = text("Một ký tự input → một nhóm output", "One input character → one output group");
  if (done) decision = text("Đã thay đủ 3 dấu chấm bằng [.]", "All 3 dots have been replaced with [.]" );
  else if (v.index !== null) decision = v.isDot === null ? text("Chưa kiểm tra ký tự này", "This character has not been checked yet") : v.isDot
    ? `. → [.] · ${v.phase === "append-dot" ? text("đã ghi", "appended") : text("chờ ghi", "not appended yet")}`
    : `${v.ch} → ${v.ch} · ${text("giữ nguyên chữ số", "keep the digit unchanged")}`;
  $("treeView").innerHTML = `<section class="df1108-viz" aria-label="${text("Mô phỏng thay dấu chấm trong IP 1108", "1108 IP address defanging")}">
    <header><div><small>1108 · ${phases[v.phase]}</small><h3>. → <span>[.]</span></h3></div><strong>${v.replaced} / 3 ${text("dấu chấm", "dots")}</strong></header>
    <p class="df1108-rule">${text("Chỉ đặt ngoặc quanh dấu chấm. Giữ nguyên các chữ số.", "Bracket only the dots. Keep all digits unchanged.")}</p>
    <div class="df1108-scroll"><div class="df1108-row"><strong>address</strong><div>${source}</div></div><div class="df1108-row"><strong>result</strong><div>${output}</div></div></div>
    <div class="df1108-legend"><span>i = ${text("vị trí đang xét", "current index")}</span><span>[.] = ${text("3 ký tự trong một nhóm", "3 characters in one group")}</span><span>· = ${text("chưa ghi", "not written")}</span></div>
    <div class="df1108-decision"><strong>${decision}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="df1108-result"><small>${done ? text("Kết quả", "Answer") : text("Chuỗi đã tạo đến hiện tại", "Result so far")}</small><code>${escapeHtml(JSON.stringify(v.result.join("")))}</code><span>${v.result.length}/${v.address.length} ${text("ký tự input đã xử lý", "input characters processed")} · ${v.result.join("").length} ${text("ký tự output", "output characters")}</span></div>
  </section>`;
  const strip = $("treeView").querySelector(".df1108-scroll");
  const current = strip.querySelector(".current");
  if (current) strip.scrollLeft = Math.max(0, current.offsetLeft - strip.clientWidth / 2);
}
