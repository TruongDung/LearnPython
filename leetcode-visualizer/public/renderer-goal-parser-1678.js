function renderGoalParser1678View(step) {
  const v = step.goalParser1678View;
  const text = (vi,en) => lang === "vi" ? vi : en;
  const phases = { init:text("Khởi tạo", "Initialize"), pointer:text("Đặt con trỏ", "Set pointer"), read:text("Đọc nhóm tiếp theo", "Read the next token"), "check-g":text("Kiểm tra G", "Check G"), "check-empty":text("Kiểm tra ()", "Check ()"), else:text("Nhận ra (al)", "Recognize (al)"), append:text("Thêm bản dịch", "Append translation"), advance:text("Nhảy qua nhóm", "Skip the token"), end:text("Hết input", "End of input"), done:text("Hoàn tất", "Complete") };
  const rules = [["G","G",1],["()","o",2],["(al)","al",4]].map(([token,output,width]) => `<div class="gp1678-rule${v.rule===token ? " active" : ""}"><b>${token} → ${output}</b><small>i += ${width}</small></div>`).join("");
  const groups = v.tokens.map((token,index) => {
    const current = v.i !== null && v.i >= token.start && v.i < token.end;
    const written = index < v.result.length;
    const consumed = v.i !== null && token.end <= v.i;
    const chars = [...token.text].map((ch,offset) => `<span><small>${token.start+offset}</small><b>${ch}</b><em>${v.i===token.start+offset ? "i ↑" : ""}</em></span>`).join("");
    return `<div class="gp1678-group${current ? " current" : ""}${consumed ? " consumed" : ""}" style="width:${Math.max(72,token.text.length*36+16)}px" aria-label="${token.text}, ${text("vị trí", "positions")} ${token.start}–${token.end-1}"><div class="gp1678-source">${chars}</div><div class="gp1678-arrow">↓</div><div class="gp1678-output${written ? " written" : ""}"><b>${written ? v.result[index] : "·"}</b><small>${written ? text("đã thêm", "appended") : text("chưa thêm", "not appended")}</small></div></div>`;
  }).join("");
  const atEnd = v.i === v.command.length;
  const focus = v.phase === "advance" ? `i: ${v.previous} → ${v.i} (+${v.i-v.previous})` : v.rule ? `${v.rule} → ${v.rule === "()" ? "o" : v.rule === "(al)" ? "al" : "G"}` : atEnd ? text("i đã đến cuối command", "i has reached the end of command") : text("Đọc từ trái sang phải, mỗi lần một nhóm", "Read left to right, one token at a time");
  $("treeView").innerHTML = `<section class="gp1678-viz" aria-label="${text("Mô phỏng Goal Parser 1678", "1678 Goal Parser simulation")}">
    <header><div><small>1678 · ${phases[v.phase]}</small><h3>${text("Đọc cả nhóm, rồi nhảy tới nhóm sau", "Read the token, then skip to the next")}</h3></div><strong>i = ${v.i === null ? "—" : v.i}</strong></header>
    <div class="gp1678-rules">${rules}</div>
    <div class="gp1678-labels"><b>command → result</b><span>${text("Số trên ô là vị trí trong command", "Numbers are positions in command")}</span></div>
    <div class="gp1678-scroll"><div class="gp1678-groups">${groups}<div class="gp1678-eof${atEnd ? " active" : ""}"><small>${v.command.length}</small><b>${text("Hết", "End")}</b><span>${atEnd ? "i ↑" : ""}</span></div></div></div>
    <div class="gp1678-focus"><strong>${focus}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="gp1678-result"><small>${v.phase==="done" ? text("Kết quả", "Answer") : text("Chuỗi đã tạo đến hiện tại", "Result so far")}</small><code>${escapeHtml(JSON.stringify(v.result.join("")))}</code><span>${v.result.length}/${v.tokens.length} ${text("nhóm đã thêm", "tokens appended")}</span></div>
  </section>`;
  const strip = $("treeView").querySelector(".gp1678-scroll");
  const target = strip.querySelector(".current") || strip.querySelector(".gp1678-eof.active");
  if (target) strip.scrollLeft = Math.max(0,target.offsetLeft-strip.clientWidth/2);
}
