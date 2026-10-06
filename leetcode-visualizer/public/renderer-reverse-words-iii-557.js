function renderReverseWords557View(step){
  const v=step.reverseWords557View;
  const text=(vi,en)=>lang==="vi"?vi:en;
  const done=v.phase==="done";
  let wordNumber=0;
  const cell=(ch,index,working,space)=>{
    const pointer=working && v.wordRange?[v.left===index?"L":"",v.right===index?"R":""].filter(Boolean).join("/"):!working&&v.end===index?"E":"";
    const swapped=working && v.swap && [v.swap.left,v.swap.right].includes(index);
    return `<div class="rw557-cell${working?" working":" original"}${space?" space":""}${swapped?" swapped":""}${pointer?" pointer":""}" aria-label="${escapeHtml(`${working?"chars":"s"}[${index}] = ${space?text("khoảng trắng", "space"):ch}`)}"><small>${index}</small><b>${space?"␠":escapeHtml(ch)}</b><span>${pointer}</span></div>`;
  };
  const groups=v.segments.map(segment=>{
    const number=segment.space?null:++wordNumber;
    const active=v.wordRange?.start===segment.start;
    const completed=!segment.space&&number<=v.completedWords;
    const source=[...segment.text].map((ch,offset)=>cell(ch,segment.start+offset,false,segment.space)).join("");
    const working=[...segment.text].map((_,offset)=>cell(v.chars[segment.start+offset],segment.start+offset,true,segment.space)).join("");
    return `<article class="rw557-group${segment.space?" gap":""}${active?" active":""}${completed?" completed":""}"><header>${segment.space?text("Giữ khoảng trắng", "Keep spaces"):`${text("Từ", "Word")} ${number}`} · [${segment.start}…${segment.end}]</header><div class="rw557-row"><small>s</small><div>${source}</div></div><div class="rw557-row"><small>chars</small><div>${working}</div></div></article>`;
  }).join("");
  const phases={init:text("Khởi tạo", "Initialize"),start:text("Đặt start", "Set start"),scan:text("Quét end", "Scan end"),boundary:text("Kiểm tra ranh giới", "Check boundary"),pointers:text("Đặt hai con trỏ", "Set pointers"),check:text("Kiểm tra cặp", "Check pair"),swap:text("Đổi chỗ trong từ", "Swap within word"),"move-left":text("Dịch left", "Move left"),"move-right":text("Dịch right", "Move right"),"word-done":text("Từ hoàn tất", "Word complete"),advance:text("Sang từ tiếp theo", "Next word"),done:text("Hoàn tất", "Complete")};
  let focus=text("Đảo từng từ, không đổi vị trí từ", "Reverse each word without moving the words");
  if(v.wordRange)focus=`${text("Chỉ đảo", "Reverse only")} [${v.wordRange.start}…${v.wordRange.end}]`;
  else if(v.end!==null)focus=v.end===v.s.length?text("E ở cuối chuỗi: xử lý từ cuối", "E is at the end: process the final word"):`E = ${v.end}: ${escapeHtml(JSON.stringify(v.s[v.end]))}`;
  if(v.swap)focus=`${escapeHtml(JSON.stringify(v.swap.before[0]))} (${v.swap.left}) ↔ ${escapeHtml(JSON.stringify(v.swap.before[1]))} (${v.swap.right})`;
  $("treeView").innerHTML=`<section class="rw557-viz" aria-label="${text("Mô phỏng đảo từng từ 557", "557 word reversal simulation")}">
    <header><div><small>557 · ${phases[v.phase]}</small><h3>${text("Đảo chữ trong từ, giữ khoảng trắng", "Reverse words, preserve spaces")}</h3></div><strong>${v.completedWords}/${wordNumber}<small>${text("từ đã xong", "words complete")}</small></strong></header>
    <div class="rw557-legend"><span>E = end · ${text("quét ranh giới", "scan boundary")}</span><span>L/R = left/right · ${text("đảo từ", "reverse word")}</span><span>␠ = ${text("khoảng trắng giữ nguyên", "preserved space")}</span></div>
    <div class="rw557-scroll"><div class="rw557-groups">${groups}<div class="rw557-eof${v.end===v.s.length?" pointer":""}"><small>${v.s.length}</small><b>${text("Hết", "End")}</b><span>${v.end===v.s.length?"E":""}</span></div></div></div>
    <div class="rw557-focus"><strong>${focus}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="rw557-result"><small>${done?text("Kết quả", "Answer"):text("Chuỗi hiện tại", "Current string")}</small><code>${escapeHtml(JSON.stringify(v.chars.join("")))}</code></div>
  </section>`;
  const strip=$("treeView").querySelector(".rw557-scroll");
  const target=strip.querySelector(".swapped") || strip.querySelector(".working.pointer") || strip.querySelector(".pointer") || strip.querySelector(".active");
  if(target)strip.scrollLeft=Math.max(0,target.offsetLeft-strip.clientWidth/2);
}
