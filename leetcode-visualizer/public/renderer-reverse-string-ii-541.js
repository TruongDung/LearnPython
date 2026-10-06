function renderReverseString541View(step) {
  const v=step.reverseString541View;
  const text=(vi,en)=>lang==="vi"?vi:en;
  const done=v.phase==="done";
  const blocks=[];
  const cell=(ch,index,working)=>{
    const start=Math.floor(index/(2*v.k))*2*v.k;
    const reverse=index<Math.min(start+v.k,v.s.length);
    const completed=done || (v.start!==null && start<v.start) || (start===v.start && v.phase==="block-done");
    const active=working && start===v.start;
    const pointer=active?[v.left===index?"L":"",v.right===index?"R":""].filter(Boolean).join("/"):"";
    const swapped=working && v.swap && [v.swap.left,v.swap.right].includes(index);
    return `<div class="rs541-cell${working?(reverse?" reverse":" keep"):" original"}${working&&reverse&&completed?" completed":""}${swapped?" swapped":""}${pointer?" pointer":""}" aria-label="${working?"chars":"s"}[${index}] = ${ch}"><small>${index}</small><b>${ch}</b><span>${pointer}</span></div>`;
  };
  for(let start=0;start<v.s.length;start+=2*v.k){
    const end=Math.min(start+2*v.k,v.s.length);
    const reverseEnd=Math.min(start+v.k,v.s.length);
    const source=Array.from({length:end-start},(_,offset)=>cell(v.s[start+offset],start+offset,false)).join("");
    const working=Array.from({length:end-start},(_,offset)=>cell(v.chars[start+offset],start+offset,true)).join("");
    blocks.push(`<article class="rs541-block${start===v.start?" active":""}"><header>${text("Đoạn", "Block")} ${Math.floor(start/(2*v.k))+1} · [${start}…${end-1}]</header><div class="rs541-row"><small>s</small><div>${source}</div></div><div class="rs541-row"><small>chars</small><div>${working}</div></div><footer><span>${text("Đảo", "Reverse")}: ${reverseEnd-start}</span><span>${text("Giữ", "Keep")}: ${end-reverseEnd}</span></footer></article>`);
  }
  const phases={init:text("Khởi tạo", "Initialize"),block:text("Chọn đoạn 2k", "Select a 2k block"),left:text("Đặt left", "Set left"),right:text("Đặt right", "Set right"),check:text("Kiểm tra hai con trỏ", "Check pointers"),swap:text("Đổi chỗ", "Swap"),"move-left":text("Dịch left", "Move left"),"move-right":text("Dịch right", "Move right"),"block-done":text("Đoạn hoàn tất", "Block complete"),done:text("Hoàn tất", "Complete")};
  let focus=text("Đảo phần đầu; giữ phần sau của mỗi đoạn 2k", "Reverse the first part; keep the second part of each 2k block");
  if(v.start!==null){
    const end=Math.min(v.start+2*v.k,v.s.length)-1;
    const reverseEnd=Math.min(v.start+v.k,v.s.length)-1;
    focus=`${text("Đảo", "Reverse")} [${v.start}…${reverseEnd}] · ${text("Giữ", "Keep")} ${reverseEnd<end?`[${reverseEnd+1}…${end}]`:text("không có", "none")}`;
  }
  if(v.swap)focus=`${v.swap.before[0]} (${v.swap.left}) ↔ ${v.swap.before[1]} (${v.swap.right})`;
  $("treeView").innerHTML=`<section class="rs541-viz" aria-label="${text("Mô phỏng đảo từng đoạn chuỗi 541", "541 block reversal simulation")}">
    <header><div><small>541 · ${phases[v.phase]}</small><h3>${text("Đảo k, giữ k, rồi đi tiếp", "Reverse k, keep k, move on")}</h3></div><strong>k = ${v.k}<small>2k = ${2*v.k}</small></strong></header>
    <div class="rs541-legend"><span class="reverse">${text("Phần cần đảo", "Reversal range")}</span><span class="keep">${text("Phần giữ nguyên", "Kept range")}</span><span>L / R = left / right</span><span class="swap">${text("Cặp vừa đổi", "Just swapped")}</span></div>
    <div class="rs541-scroll"><div class="rs541-blocks">${blocks.join("")}</div></div>
    <div class="rs541-focus"><strong>${focus}</strong><p>${escapeHtml(pick(step.note))}</p></div>
    <div class="rs541-result"><small>${done?text("Kết quả", "Answer"):text("Chuỗi hiện tại", "Current string")}</small><code>${escapeHtml(JSON.stringify(v.chars.join("")))}</code></div>
  </section>`;
  const strip=$("treeView").querySelector(".rs541-scroll");
  const target=strip.querySelector(".swapped") || strip.querySelector(".pointer") || strip.querySelector(".active");
  if(target)strip.scrollLeft=Math.max(0,target.offsetLeft-strip.clientWidth/2);
}
