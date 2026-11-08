"use strict";
function c1267Escape(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]); }
function c1267Copy() {
  const vi = typeof lang !== "undefined" && lang === "vi";
  return { vi, after:vi?"Sau dòng":"After line", count:vi?"Đếm theo hàng/cột":"Count rows/columns", check:vi?"Server nào liên lạc?":"Which servers communicate?", result:vi?"server liên lạc":"communicating servers", empty:vi?"Ô trống → bỏ qua":"Empty cell → skip", isolated:vi?"Đứng riêng":"Isolated", accepted:vi?"Đã cộng":"Counted", pending:vi?"Chưa kiểm tra":"Unchecked", unbound:vi?"Chưa tạo":"Unbound", row:vi?"Cùng hàng":"Same row", col:vi?"Cùng cột":"Same column", once:vi?"OR → cộng tối đa 1 lần":"OR → count at most once", window:vi?"Khung xem":"Picture window", bounded:vi?"Trace rút gọn · kết quả tính đủ":"Condensed replay · full answer", presets:vi?["Có nhóm và đứng riêng","3 server liên lạc","Chỉ chéo nhau","Cả hàng lẫn cột","Qua ô trống","Không có server","Một server"]:["Groups and isolated","3 connected servers","Diagonal only","Row and column","Across empty cells","No servers","One server"] };
}
const C1267_CASES = [
  [[1,1,0,0],[0,0,1,0],[0,0,1,0],[0,0,0,1]], [[1,0],[1,1]], [[1,0],[0,1]],
  [[0,1,0],[1,1,1],[0,1,0]], [[1,0,0,1]], [[0,0],[0,0]], [[1]],
];
function c1267Point(r, c) { return { x:56+c*60+28, y:90+r*60+28 }; }
function c1267Map(v,t) {
  const m=v.window.length,n=v.window[0].length,width=56+n*60+90,height=90+m*60+26;
  const current=v.active?[v.active[0]-v.rowStart,v.active[1]-v.colStart]:null;
  const server=current!==null&&v.window[current[0]][current[1]]===1;
  const backgrounds=v.window.map((row,r)=>row.map((value,c)=>{
    const sameRow=current&&r===current[0],sameCol=current&&c===current[1];
    return `<rect class="c1267-cell-bg ${sameRow?"is-row":""} ${sameCol?"is-col":""}" x="${56+c*60}" y="${90+r*60}" width="56" height="56" rx="9"/>`;
  }).join("")).join("");
  let links="";
  if(v.phase!=="count") {
    for(let r=0;r<m;r++) {
      const members=v.window[r].map((x,c)=>x?c:-1).filter(c=>c>=0);
      if(members.length>1&&(v.phase==="done"||server&&r===current[0])){const a=c1267Point(r,members[0]),b=c1267Point(r,members.at(-1));links+=`<path class="c1267-link is-row" data-row-link="${v.rowStart+r}" d="M${a.x},${a.y} H${b.x}"/>`;}
    }
    for(let c=0;c<n;c++) {
      const members=v.window.map((row,r)=>row[c]?r:-1).filter(r=>r>=0);
      if(members.length>1&&(v.phase==="done"||server&&c===current[1])){const a=c1267Point(members[0],c),b=c1267Point(members.at(-1),c);links+=`<path class="c1267-link is-col" data-col-link="${v.colStart+c}" d="M${a.x},${a.y} V${b.y}"/>`;}
    }
  }
  let update="";
  if(v.change?.kind==="counter"&&current){const p=c1267Point(...current),row=v.change.axis==="row",x=row?56+n*60+17:p.x,y=row?p.y:54;update=`<path class="c1267-count-arrow ${row?"is-row":"is-col"}" d="M${row?p.x+20:p.x},${row?p.y:p.y-20} L${x},${y}" marker-end="url(#c1267-${row?"row":"col"}-head)"/>`;}
  const cells=v.window.map((row,r)=>row.map((value,c)=>{
    const rr=r+v.rowStart,cc=c+v.colStart,p=c1267Point(r,c),state=v.previewStates[r][c],active=v.active?.[0]===rr&&v.active?.[1]===cc;
    const peer=server&&value&&!active?(r===current[0]?"is-row-peer":c===current[1]?"is-col-peer":""):"";
    const icon=value?`<rect class="c1267-server-body" x="${p.x-16}" y="${p.y-18}" width="32" height="36" rx="6"/><path class="c1267-vents" d="M${p.x-10},${p.y-9} H${p.x+9} M${p.x-10},${p.y-1} H${p.x+9} M${p.x-10},${p.y+7} H${p.x+3}"/><circle class="c1267-led" cx="${p.x+9}" cy="${p.y+11}" r="2"/>${["accepted","isolated"].includes(state)?`<g class="c1267-status"><circle cx="${p.x+19}" cy="${p.y-20}" r="8"/><text x="${p.x+19}" y="${p.y-16}">${state==="accepted"?"✓":"×"}</text></g>`:""}`:`<circle class="c1267-zero" cx="${p.x}" cy="${p.y}" r="3"/>`;
    return `<g class="c1267-cell is-${state} ${active?"is-active":""} ${peer}" data-c1267-cell="${rr},${cc}" data-cell-value="${value}" data-cell-status="${state}" tabindex="0" role="button" aria-label="grid[${rr}][${cc}] = ${value}"><rect class="c1267-focus" x="${p.x-27}" y="${p.y-27}" width="54" height="54" rx="9"/>${icon}</g>`;
  }).join("")).join("");
  const rowCounts=Array.from({length:m},(_,r)=>{const index=r+v.rowStart,p=c1267Point(r,n),x=56+n*60+44,value=v.rowCounts?.[index]??null,changed=v.change?.kind==="counter"&&v.change.axis==="row"&&v.change.index===index;return `<g class="c1267-counter is-row ${changed?"is-new":""}" data-counter-axis="row" data-counter-index="${index}" data-counter-value="${value}"><text class="c1267-index" x="24" y="${p.y+4}">r${index}</text><rect x="${x-26}" y="${p.y-16}" width="52" height="32" rx="8"/><text x="${x}" y="${p.y+6}">${value??"—"}</text></g>`;}).join("");
  const colCounts=Array.from({length:n},(_,c)=>{const index=c+v.colStart,p=c1267Point(0,c),value=v.colCounts?.[index]??null,changed=v.change?.kind==="counter"&&v.change.axis==="col"&&v.change.index===index;return `<g class="c1267-counter is-col ${changed?"is-new":""}" data-counter-axis="col" data-counter-index="${index}" data-counter-value="${value}"><rect x="${p.x-22}" y="22" width="44" height="30" rx="8"/><text x="${p.x}" y="43">${value??"—"}</text><text class="c1267-index" x="${p.x}" y="76">c${index}</text></g>`;}).join("");
  return `<section class="tr-card c1267-grid-card"><header><code>grid</code><small>${t.vi?"Chọn ô → dòng kiểm tra":"Select a cell → its source check"}</small></header><div class="c1267-map-scroll" data-c1267-scroll="grid" tabindex="0"><svg class="c1267-map ${n<=6?"is-small":""}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="group" aria-label="${t.vi?"Server, số đếm hàng và cột":"Servers and row/column counts"}"><defs>${["row","col"].map(name=>`<marker id="c1267-${name}-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z"/></marker>`).join("")}</defs><text class="c1267-axis-title is-col" x="${56+n*30}" y="12">col_count</text><text class="c1267-axis-title is-row" x="${56+n*60+44}" y="76">row_count</text>${backgrounds}${links}${update}${cells}${rowCounts}${colCounts}</svg></div><div class="c1267-legend"><span>▤ = 1 · · = 0</span><span class="is-row">━ ${t.row}</span><span class="is-col">┃ ${t.col}</span><span class="is-accepted">✓ ${t.accepted}</span><span class="is-isolated">× ${t.isolated}</span></div></section>`;
}
function c1267Decision(v,t) {
  if(!v.active)return "";
  const [r,c]=v.active,value=v.window[r-v.rowStart][c-v.colStart],a=v.rowCounts?.[r]??null,b=v.colCounts?.[c]??null;
  if(!value)return `<div class="c1267-empty" data-empty-cell="${r},${c}"><code>grid[${r}][${c}] = 0</code><strong>·</strong><span>${t.empty}</span></div>`;
  const axes=[["row",a,v.checks.row,t.row,r],["col",b,v.checks.col,t.col,c]];
  return `<section class="tr-card c1267-decision"><header><code>grid[${r}][${c}] = 1</code><small>${v.phase==="count"?(t.vi?"Đếm riêng hai mảng":"Update the two arrays separately"):t.once}</small></header><div class="c1267-tests">${axes.map(([axis,count,pass,label,index])=>`<div class="c1267-test is-${axis}" data-share-axis="${axis}" data-share-value="${pass}"><small>${label}</small><code>${axis}_count[${index}]</code><strong>${count??"—"}${v.phase==="check"?" > 1":""}</strong>${v.phase==="check"?`<b class="${pass===null?"is-wait":pass?"is-pass":"is-fail"}">${pass===null?"…":pass?"True ✓":"False ×"}</b>`:""}</div>`).join("")}</div>${v.phase==="check"?`<div class="c1267-or"><code>shares_row OR shares_col</code><strong data-or-result="${v.checks.pass}">${v.checks.pass===null?"…":v.checks.pass?"True ✓":"False ×"}</strong>${v.change?.kind==="answer"?'<b class="c1267-add">+1</b>':""}</div>`:""}</section>`;
}
function c1267CounterChange(v) {
  const change=v.change;if(change?.kind!=="counter")return "";
  return `<div class="c1267-update is-${change.axis}"><code>${change.axis}_count[${change.index}]</code><strong>${change.before}</strong><i>+ 1 →</i><strong>${change.after}</strong></div>`;
}
function c1267Jump(kind) {
  if(typeof steps==="undefined"||typeof renderStep!=="function")return;
  if(typeof stopPlay==="function")stopPlay();
  const index=steps.findIndex((step,i)=>{const v=step.servers1267View;return i>stepIndex&&v&&(kind==="count"?v.change?.kind==="counter":kind==="check"?v.source.line===16:kind==="add"?v.change?.kind==="answer":step.final);});
  stepIndex=index<0?steps.length-1:index;renderStep();
}
function c1267Bind(host) {
  const bind=(selector,action)=>host.querySelectorAll(selector).forEach(el=>{el.addEventListener("click",()=>action(el));el.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();event.stopPropagation();action(el);}});});
  bind("[data-c1267-jump]",el=>c1267Jump(el.dataset.c1267Jump));
  bind("[data-c1267-cell]",el=>{
    if(typeof steps==="undefined")return;const [r,c]=el.dataset.c1267Cell.split(",").map(Number),at=v=>v.active?.[0]===r&&v.active?.[1]===c;
    let index=steps.findIndex(s=>s.servers1267View&&at(s.servers1267View)&&s.servers1267View.source.line===15);
    if(index<0)index=steps.findIndex(s=>s.servers1267View&&at(s.servers1267View));
    if(index<0)return;if(typeof stopPlay==="function")stopPlay();stepIndex=index;renderStep();
  });
  bind("[data-c1267-case]",el=>{document.getElementById("arrInput").value=JSON.stringify(C1267_CASES[Number(el.dataset.c1267Case)]);if(typeof runViz==="function")runViz();});
}
function renderServers1267Pictures(step) {
  const host=document.getElementById("treeView"),v=step.servers1267View;if(!host||!v)return;const t=c1267Copy(),old=host.querySelector(".c1267-map-scroll"),scroll={x:old?.scrollLeft??0,y:old?.scrollTop??0};
  const title=v.phase==="done"?`${v.answer} ${t.result}`:v.phase==="count"?t.count:t.check;
  host.innerHTML=`<article class="tr-viz c1267-viz" role="region" data-phase="${v.phase}" data-source-line="${v.source.line}" aria-label="LeetCode 1267"><header class="tr-header"><div><small>LEETCODE 1267 · ROW / COLUMN COUNTS</small><h2>${title}</h2></div><code>${v.rows} × ${v.cols}</code></header><nav class="tr-presets" aria-label="Examples">${t.presets.map((name,i)=>`<button type="button" data-c1267-case="${i}">${name}</button>`).join("")}</nav><div class="c1267-passes"><span class="${v.phase==="count"?"is-current":"is-complete"}">1 · row_count / col_count</span><i>→</i><span class="${v.phase==="check"?"is-current":v.phase==="done"?"is-complete":""}">2 · OR → answer</span></div><div class="tr-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${c1267Escape(v.source.text)}</code>${v.branch===null?"":`<strong class="${v.branch?"is-good":"is-muted"}">${v.branch?"True ✓":"False ×"}</strong>`}</div>${v.cropped||v.trace.truncated?`<div class="c1267-preview"><small>${t.window}: r${v.rowStart}–${v.rowStart+v.window.length-1} · c${v.colStart}–${v.colStart+v.window[0].length-1}${v.trace.truncated?` · ${t.bounded}`:""}</small></div>`:""}${c1267Map(v,t)}${c1267CounterChange(v)}${c1267Decision(v,t)}<section class="tr-card c1267-answer"><header><code>answer</code><small>${t.once}</small></header><div class="c1267-answer-value"><strong data-native-answer="${v.counted}">${v.counted??"—"}</strong>${v.change?.kind==="answer"?`<span data-answer-before="${v.change.before}">${v.change.before} → ${v.change.after} <b>+1</b></span>`:""}</div>${v.answer===null?"":`<output data-answer="${v.answer}">return ${v.answer}</output>`}</section><footer class="tr-footer"><div>${[["count",t.vi?"Đếm tiếp →":"Next count →"],["check",t.vi?"Kiểm tra →":"Next server →"],["add","+1 →"],["result",t.vi?"Kết quả ↠":"Result ↠"]].map(([kind,label])=>`<button type="button" data-c1267-jump="${kind}">${label}</button>`).join("")}</div><small>O(MN) · O(M+N)</small></footer></article>`;
  const map=host.querySelector(".c1267-map-scroll");if(map){map.scrollLeft=scroll.x;map.scrollTop=scroll.y;const target=v.active?host.querySelector(`[data-c1267-cell="${v.active.join(",")}"]`):null;if(target){const b=map.getBoundingClientRect(),p=target.getBoundingClientRect(),pad=12;if(p.left<b.left+pad)map.scrollLeft-=b.left+pad-p.left;if(p.right>b.right-pad)map.scrollLeft+=p.right-b.right+pad;if(p.top<b.top+pad)map.scrollTop-=b.top+pad-p.top;if(p.bottom>b.bottom-pad)map.scrollTop+=p.bottom-b.bottom+pad;}}
  c1267Bind(host);
}
