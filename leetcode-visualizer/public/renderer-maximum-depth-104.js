"use strict";

function d104Escape(value) {
  return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
}
function d104Copy() {
  const vi=typeof lang!=="undefined"&&lang==="vi";
  return {locale:vi?"vi":"en",region:vi?"Độ sâu cây nhị phân":"Binary tree depth",after:vi?"Sau dòng":"After line",
    tree:vi?"Tầng tính từ gốc":"Levels from the root",level:vi?"Tầng":"Level",height:vi?"↑h = độ sâu cây con":"↑h = subtree depth",
    nodeHint:vi?"Chọn nút → vào lời gọi":"Select a node → enter its call",formula:vi?"Mỗi nút đóng góp 1":"Each node contributes 1",
    empty:vi?"Nhánh trống":"Empty branch",stack:vi?"Stack tại dòng này":"Stack at this line",log:vi?"Độ sâu từng nút":"Depths by node",
    result:vi?"Độ sâu lớn nhất":"Maximum depth",path:vi?"Một đường gốc → lá":"One root → leaf path",nodes:vi?"nút":"nodes",
    current:vi?"Hiện tại":"Current",done:vi?"Đã trả về":"Returned",call:vi?"Lần gọi tiếp →":"Next call →",receive:vi?"Nhận nhánh →":"Next child result →",back:vi?"Trả về ↑":"Next return ↑",end:vi?"Kết quả ↠":"Result ↠",
    presets:vi?["Mẫu 3","Một nút 0","Cây lệch","Cây đủ","Trùng giá trị","Cây rỗng"]:["Example 3","One zero node","Skewed tree","Full tree","Equal values","Empty tree"],
  };
}
function d104Arrow(a,b,start=31,end=34) {
  const length=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/length,uy=(b.y-a.y)/length;
  return `<path class="d104-motion" d="M${a.x+ux*start},${a.y+uy*start} L${b.x-ux*end},${b.y-uy*end}" marker-end="url(#d104-arrow)"/>`;
}
function d104Tree(v,t) {
  const depth=Math.max(0,...v.nodes.map(n=>n.depth)),width=Math.max(460,128+(v.nodes.length-1)*64),height=Math.max(240,depth*96+(v.emptyCall?.parent?210:128));
  const points=new Map(v.nodes.map(n=>[n.id,{x:(width-(v.nodes.length-1)*64)/2+n.rank*64,y:64+n.depth*96}]));
  const path=new Set(v.path),pathEdges=new Set(v.path.slice(1).map((id,i)=>[id,v.path[i]].sort().join("|"))),stack=new Set(v.stack.map(f=>f.node));
  const rows=new Map(v.ledger.map(r=>[r.id,r]));
  const levels=v.nodes.length?Array.from({length:depth+1},(_,i)=>`<g class="d104-level"><path d="M42,${64+i*96} H${width-20}"/><text x="21" y="${68+i*96}">${i+1}</text></g>`).join(""):"";
  const edges=v.nodes.filter(n=>n.parent).map(n=> {
    const a=points.get(n.parent),b=points.get(n.id),selected=pathEdges.has([n.parent,n.id].sort().join("|"));
    return `<path class="d104-edge ${stack.has(n.parent)&&stack.has(n.id)?"is-call":""} ${selected?"is-path":""}" data-edge-from="${n.parent}" data-edge-to="${n.id}" data-path-edge="${selected}" d="M${a.x},${a.y} L${b.x},${b.y}"/>`;
  }).join("");
  const nodes=v.nodes.map(n=> {
    const p=points.get(n.id),row=rows.get(n.id),h=row?.height??null;
    return `<g class="d104-node ${n.id===v.active?"is-current":""} ${stack.has(n.id)?"is-call":""} ${h!==null?"is-done":""} ${path.has(n.id)?"is-path":""}" data-d104-call="node:${n.id}" data-node-id="${n.id}" data-node-value="${n.value}" data-node-height="${h}" data-node-level="${n.depth+1}" tabindex="0" role="button" aria-label="maxDepth(${n.value}), #${n.id.split(":")[1]}"><circle class="d104-ring" cx="${p.x}" cy="${p.y}" r="29"/><circle class="d104-disc" cx="${p.x}" cy="${p.y}" r="24"/><text class="d104-value" x="${p.x}" y="${p.y+5}">${n.value}</text><text class="d104-id" x="${p.x}" y="${p.y+43}">#${n.id.split(":")[1]}</text>${h===null?"":`<text class="d104-height" x="${p.x}" y="${p.y-36}">↑ ${h}</text>`}</g>`;
  }).join("");
  const call=v.stack.at(-1);let ghost="",motion="";
  if(v.emptyCall) {
    const parent=points.get(v.emptyCall.parent),p=parent?{x:parent.x+(v.emptyCall.side==="left"?-40:40),y:parent.y+80}:{x:width/2,y:90};
    ghost=`<g class="d104-null" data-empty-side="${v.emptyCall.side}" data-d104-call="${v.callId}" tabindex="0" role="button" aria-label="maxDepth(None)">${parent?`<path d="M${parent.x},${parent.y+24} L${p.x},${p.y-18}"/>`:""}<circle cx="${p.x}" cy="${p.y}" r="18"/><text x="${p.x}" y="${p.y+5}">∅</text><text class="d104-null-label" x="${p.x}" y="${p.y+42}">${v.emptyCall.returned===null?"None":"↑ 0"}</text></g>`;
    if(parent&&v.returning)motion=d104Arrow(p,parent,20,34);
  } else if(v.returning&&call.parent)motion=d104Arrow(points.get(call.node),points.get(call.parent));
  return `<section class="d104-tree-card"><header><b>${t.tree} · ${t.level} 1 = root</b><small>${t.height}</small></header><div class="d104-tree-scroll" tabindex="0" role="region" aria-label="${t.region}"><svg class="d104-tree-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="group" aria-label="${t.region}"><title>${t.region}</title><defs><marker id="d104-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z"/></marker></defs>${levels}${edges}${ghost}${motion}${nodes}</svg></div><div class="d104-legend"><span class="is-current">● ${t.current}</span><span class="is-done">● ${t.done}</span><small>${t.nodeHint} · # = ID</small></div></section>`;
}
function d104Calculation(v,t) {
  if(v.emptyCall)return `<section class="d104-empty"><small>${t.empty}</small><div><b>∅</b><i>→</i><strong data-empty-return="${v.emptyCall.returned}">${v.emptyCall.returned??"…"}</strong></div><code>maxDepth(None)</code></section>`;
  const row=v.current,ready=row.height!==null,left=ready&&row.chosen==="left",right=ready&&row.chosen==="right";
  const value=n=>n??"…";
  return `<section class="d104-calculation ${ready?"is-ready":""}"><header><b>${t.formula}</b><small>node.val = ${row.value}</small></header><svg viewBox="0 0 280 190" role="img" aria-label="1 + max(left, right)"><path class="${left?"is-chosen":""}" d="M55,126 L140,62"/><path class="${right?"is-chosen":""}" d="M225,126 L140,62"/><path class="d104-up ${ready?"is-chosen":""}" d="M140,36 V15 M132,23 L140,15 L148,23"/><circle cx="140" cy="62" r="26"/><text class="d104-plus" x="140" y="68">+1</text><circle class="${left?"is-chosen":""} ${v.source.line===5?"is-assigned":""}" cx="55" cy="126" r="26"/><text x="55" y="132" data-left-depth="${row.left}">${value(row.left)}</text><circle class="${right?"is-chosen":""} ${v.source.line===6?"is-assigned":""}" cx="225" cy="126" r="26"/><text x="225" y="132" data-right-depth="${row.right}">${value(row.right)}</text><text class="d104-label" x="55" y="174">left</text><text class="d104-label" x="225" y="174">right</text></svg><div class="d104-equation"><code>1 + max(${value(row.left)}, ${value(row.right)})</code><i>=</i><strong data-return-height="${row.height}">${value(row.height)}</strong></div></section>`;
}
function d104Stack(v,t) {
  return `<section class="d104-stack"><header>${t.stack}<small>· ${v.stack.length}</small></header><div class="d104-stack-scroll">${v.stack.map((frame,i)=>`<button class="${i===v.stack.length-1?"is-current":""}" data-d104-call="${frame.id}" data-frame-index="${i}" data-frame-node="${frame.node}" data-frame-left="${frame.left}" data-frame-right="${frame.right}" type="button"><code>maxDepth(${frame.value??"None"})</code><small>${frame.node?`#${frame.node.split(":")[1]}`:"∅"}</small><span>left: ${frame.left??"—"} · right: ${frame.right??"—"}</span>${i===v.stack.length-1&&v.returning?`<b>↑ ${v.returned}</b>`:""}</button>`).join("")}</div></section>`;
}
function d104Result(v,t) {
  if(v.answer===null)return "";
  const byId=new Map(v.nodes.map(n=>[n.id,n]));
  return `<section class="d104-result"><header><small>${t.result}</small><strong data-answer="${v.answer}">${v.answer}</strong></header><small>${t.path} · ${v.path.length} ${t.nodes}</small><div class="d104-path">${v.path.map((id,i)=>`${i?"<i>→</i>":""}<span data-witness-node="${id}"><small>${i+1}</small><b>${byId.get(id).value}</b><small>#${id.split(":")[1]}</small></span>`).join("")||"<b>∅</b>"}</div></section>`;
}
function d104Ledger(v,t,open) {
  return `<details class="d104-ledger" ${open?"open":""}><summary>${t.log} · ${v.completed.length}/${v.nodes.length}</summary><div class="d104-ledger-scroll"><table><thead><tr><th>#</th><th>val</th><th>left</th><th>right</th><th>↑ h</th></tr></thead><tbody>${v.ledger.map(row=>`<tr class="${row.id===v.active?"is-current":""}" data-d104-call="node:${row.id}" tabindex="0" role="button"><th>${row.id.split(":")[1]}</th><td>${row.value}</td>${["left","right","height"].map(name=>`<td data-ledger-node="${row.id}" data-ledger-field="${name}" data-ledger-value="${row[name]}">${row[name]??"·"}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
}
function d104Jump(kind) {
  if(typeof steps==="undefined"||typeof renderStep!=="function")return;
  if(typeof stopPlay==="function")stopPlay();
  const next=steps.findIndex((s,i)=>{const v=s.maxDepth104View;return i>stepIndex&&v&&(kind==="call"?v.source.line===3:kind==="receive"?[5,6].includes(v.source.line):kind==="return"?v.returning:v.answer!==null);});
  stepIndex=next<0?steps.length-1:next;renderStep();
}
function d104Bind(host) {
  const bind=(selector,action)=>host.querySelectorAll(selector).forEach(node=>{
    node.addEventListener("click",()=>action(node));
    node.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();event.stopPropagation();action(node);}});
  });
  bind("[data-d104-jump]",node=>d104Jump(node.dataset.d104Jump));
  bind("[data-d104-call]",node=>{
    if(typeof steps==="undefined"||typeof renderStep!=="function")return;
    const index=steps.findIndex(s=>s.maxDepth104View?.source.line===3&&s.maxDepth104View.callId===node.dataset.d104Call);
    if(index<0)return;if(typeof stopPlay==="function")stopPlay();stepIndex=index;renderStep();
  });
  bind("[data-d104-case]",node=>{
    if(typeof runViz!=="function")return;
    const cases=[[3,9,20,null,null,15,7],[0],[1,null,2,null,3,null,4],[1,2,3,4,5,6,7],[7,7,7,null,7],[]];
    document.getElementById("arrInput").value=JSON.stringify(cases[Number(node.dataset.d104Case)]);runViz();
  });
}
function renderMaxDepth104Pictures(step) {
  const host=document.getElementById("treeView"),v=step.maxDepth104View,t=d104Copy();if(!host||!v)return;
  const oldTree=host.querySelector(".d104-tree-scroll"),oldLog=host.querySelector(".d104-ledger-scroll");
  const scroll={x:oldTree?.scrollLeft??0,y:oldTree?.scrollTop??0,lx:oldLog?.scrollLeft??0,ly:oldLog?.scrollTop??0},open=host.querySelector(".d104-ledger")?.open??false;
  host.innerHTML=`<article class="d104-viz ${v.answer!==null?"is-final":""}" role="region" aria-label="${t.region}" data-source-line="${v.source.line}"><header class="d104-header"><div><small>LEETCODE 104 · DEPTH DFS</small><h2>${d104Escape(v.phase[t.locale])}</h2></div><code>∅ → 0<br>● → 1 + max(L, R)</code></header><nav class="d104-presets" aria-label="Examples">${t.presets.map((name,i)=>`<button type="button" data-d104-case="${i}">${name}</button>`).join("")}</nav><div class="d104-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${d104Escape(v.source.text)}</code>${v.branch===null?"":`<strong class="${v.branch?"is-true":"is-false"}">${v.branch?"True ✓":"False ×"}</strong>`}</div>${d104Tree(v,t)}${d104Calculation(v,t)}${d104Stack(v,t)}${d104Result(v,t)}${d104Ledger(v,t,open)}<footer class="d104-footer"><div>${[["call",t.call],["receive",t.receive],["return",t.back],["result",t.end]].map(([kind,label])=>`<button type="button" data-d104-jump="${kind}">${label}</button>`).join("")}</div><small>O(n) time · O(h) stack</small></footer></article>`;
  const tree=host.querySelector(".d104-tree-scroll");
  if(tree){tree.scrollLeft=scroll.x;tree.scrollTop=scroll.y;const target=host.querySelector(v.emptyCall?".d104-null":`.d104-node[data-node-id="${v.active}"]`);
    if(target){const b=tree.getBoundingClientRect(),p=target.getBoundingClientRect(),pad=24;
      if(p.left<b.left+pad)tree.scrollLeft-=b.left+pad-p.left;if(p.right>b.right-pad)tree.scrollLeft+=p.right-b.right+pad;
      if(p.top<b.top+pad)tree.scrollTop-=b.top+pad-p.top;if(p.bottom>b.bottom-pad)tree.scrollTop+=p.bottom-b.bottom+pad;}}
  const stack=host.querySelector(".d104-stack-scroll");if(stack)stack.scrollLeft=stack.scrollWidth;
  const log=host.querySelector(".d104-ledger-scroll");if(log&&open){log.scrollLeft=scroll.lx;log.scrollTop=scroll.ly;const row=log.querySelector("tr.is-current");
    if(row){const b=log.getBoundingClientRect(),p=row.getBoundingClientRect();if(p.top<b.top+30)log.scrollTop-=b.top+30-p.top;if(p.bottom>b.bottom)log.scrollTop+=p.bottom-b.bottom;
      const field={5:"left",6:"right",7:"height"}[v.source.line],cell=row.querySelector(field?`[data-ledger-field="${field}"]`:"td");
      if(cell){const c=cell.getBoundingClientRect();if(c.left<b.left+3)log.scrollLeft-=b.left+3-c.left;if(c.right>b.right-3)log.scrollLeft+=c.right-b.right+3;}}}
  d104Bind(host);
}
