"use strict";

function p144Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
// The pictures are shared; source events retain the traversal's own view.
function p144View(step) { return step?.postorder145View ?? step?.inorder94View ?? step?.preorder144View; }
function p144Copy(problemId = 144) {
  const inorder = problemId === 94, postorder = problemId === 145;
  const vi = typeof lang !== "undefined" && lang === "vi";
  return { locale: vi ? "vi" : "en", region: postorder ? vi ? "Duyệt cây hậu thứ tự" : "Postorder tree traversal" : inorder ? vi ? "Duyệt cây trung thứ tự" : "Inorder tree traversal" : vi ? "Duyệt cây tiền thứ tự" : "Preorder tree traversal", after: vi ? "Sau dòng" : "After line",
    each: vi ? "Trong mỗi dfs(node)" : "In each dfs(node)", root: vi ? "Gốc" : "Root", left: vi ? "Trái" : "Left", right: vi ? "Phải" : "Right",
    tree: vi ? "Chọn nút → vào hàm" : "Select a node → enter its call", output: vi ? "Chọn ô → bước thêm vào res" : "Select a cell → its append step",
    current: vi ? "Hiện tại" : "Current", visited: vi ? "Đã thêm" : "Appended", done: vi ? "Đã xong" : "Finished", visitOrder: vi ? "lượt thăm" : "visit order",
    stack: "Stack · dfs(node)", implicit: vi ? "return ngầm" : "implicit return", result: vi ? "Kết quả" : "Result",
    nextCall: vi ? "Lần gọi tiếp →" : "Next call →", nextAppend: vi ? "Thêm tiếp →" : "Next append →", nextReturn: vi ? "Quay về ↑" : "Next return ↑", end: vi ? "Kết quả ↠" : "Result ↠",
    presets: [...(vi ? ["Cây đủ", "Thiếu nhánh", "Một nút", "Cây lệch", "Trùng giá trị", "Cây rỗng"]
      : ["Full tree", "Sparse tree", "One node", "Skewed tree", "Equal values", "Empty tree"]), ...(inorder ? ["BST"] : [])],
  };
}
function p144Arrow(a, b, kind, startRadius = 31, endRadius = 34) {
  const length = Math.hypot(b.x-a.x,b.y-a.y), ux = (b.x-a.x)/length, uy = (b.y-a.y)/length;
  return `<path class="p144-motion is-${kind}" d="M${a.x+ux*startRadius},${a.y+uy*startRadius} L${b.x-ux*endRadius},${b.y-uy*endRadius}" marker-end="url(#p144-${kind}-arrow)"/>`;
}
function p144Tree(v, t) {
  const width = Math.max(420, v.nodes.length * 64 + 64), depth = Math.max(0,...v.nodes.map(n=>n.depth));
  const height = Math.max(240, depth * 96 + (v.emptyCall?.parent ? 210 : 128));
  const positions = new Map(v.nodes.map(n=>[n.id,{x:(width-(v.nodes.length-1)*64)/2+n.rank*64,y:64+n.depth*96}]));
  const inStack = new Set(v.stack.map(f=>f.node)), visited = new Map(v.visited.map((id,i)=>[id,i+1])), completed = new Set(v.completed);
  const edges = v.nodes.filter(n=>n.parent).map(n=> {
    const a=positions.get(n.parent), b=positions.get(n.id), active=inStack.has(n.id)&&inStack.has(n.parent);
    return `<path class="p144-edge ${active?"is-active":""} ${completed.has(n.id)?"is-done":""}" data-edge-from="${n.parent}" data-edge-to="${n.id}" d="M${a.x},${a.y} L${b.x},${b.y}"/>`;
  }).join("");
  const nodes = v.nodes.map(n=> {
    const p=positions.get(n.id);
    return `<g class="p144-node ${n.id===v.active?"is-current":""} ${visited.has(n.id)?"is-visited":""} ${completed.has(n.id)?"is-done":""} ${inStack.has(n.id)?"is-call":""}" data-p144-call="node:${n.id}" data-node-id="${n.id}" data-node-value="${n.value}" data-node-order="${visited.get(n.id)??null}" data-node-complete="${completed.has(n.id)}" tabindex="0" role="button" aria-label="dfs(${n.value}), #${n.id.split(":")[1]}"><circle class="p144-ring" cx="${p.x}" cy="${p.y}" r="29"/><circle class="p144-disc" cx="${p.x}" cy="${p.y}" r="24"/><text class="p144-value" x="${p.x}" y="${p.y+5}">${n.value}</text><text class="p144-id" x="${p.x}" y="${p.y+44}">#${n.id.split(":")[1]}</text>${visited.has(n.id)?`<circle class="p144-order-disc" cx="${p.x+23}" cy="${p.y-23}" r="10"/><text class="p144-order" x="${p.x+23}" y="${p.y-19}">${visited.get(n.id)}</text>`:""}</g>`;
  }).join("");
  let ghost="", motion="";
  const call=v.calls.find(c=>c.id===v.callId);
  if(v.emptyCall||!v.nodes.length) {
    const parent=positions.get(v.emptyCall?.parent), p=parent?{x:parent.x+(v.emptyCall.side==="left"?-40:40),y:parent.y+80}:{x:width/2,y:90};
    ghost=`<g class="p144-null" data-empty-side="${v.emptyCall?.side??"root"}" ${v.emptyCall?`data-p144-call="${v.callId}" tabindex="0" role="button" aria-label="dfs(None)"`:""}>${parent?`<path d="M${parent.x},${parent.y+24} L${p.x},${p.y-18}"/>`:""}<circle cx="${p.x}" cy="${p.y}" r="18"/><text x="${p.x}" y="${p.y+5}">∅</text><text class="p144-null-label" x="${p.x}" y="${p.y+42}">${v.emptyCall?.returned?"↩ return":"None"}</text></g>`;
    if(parent) motion=v.returning?p144Arrow(p,parent,"return",20,34):p144Arrow(parent,p,"enter",31,22);
  } else if(call?.parent&&(v.source.line===5||v.returning)) {
    const a=positions.get(call.parent),b=positions.get(call.node);
    motion=v.returning?p144Arrow(b,a,"return"):p144Arrow(a,b,"enter");
  }
  const markers=["enter","return"].map(kind=>`<marker id="p144-${kind}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path class="p144-arrow-head is-${kind}" d="M0,0 L10,5 L0,10 Z"/></marker>`).join("");
  return `<section class="p144-tree-card"><header><b>${t.tree}</b><small>① = ${t.visitOrder} · # = ID</small></header><div class="p144-tree-scroll" tabindex="0" role="region" aria-label="${t.region}"><svg class="p144-tree-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="group" aria-label="${t.region}"><title>${t.region}</title><defs>${markers}</defs>${edges}${ghost}${motion}${nodes}</svg></div><div class="p144-legend"><span class="is-current">● ${t.current}</span><span class="is-visited">● ${t.visited}</span><span class="is-done">● ${t.done}</span></div></section>`;
}
function p144Flow(v,t) {
  const current=v.source.line===7?0:v.source.line===8?1:v.source.line===9?2:-1;
  const order=v.id===145?[t.left,t.right,t.root]:v.id===94?[t.left,t.root,t.right]:[t.root,t.left,t.right];
  return `<section class="p144-flow"><small>${t.each}</small><div>${order.map((name,i)=>`${i?"<i>→</i>":""}<span class="${i===current?"is-active":""}" data-flow-index="${i}" data-flow-active="${i===current}"><b>${i+1}</b>${name}</span>`).join("")}</div></section>`;
}
function p144Output(v,t) {
  const a=v.append;
  const bridge=a?`<div class="p144-append" data-append-node="${a.id}" data-append-index="${a.index}"><svg viewBox="0 0 240 80" role="img" aria-label="res.append(${a.value})"><circle cx="40" cy="38" r="23"/><text x="40" y="43">${a.value}</text><path d="M72,38 H154 M146,31 L154,38 L146,45"/><rect x="164" y="15" width="68" height="46" rx="8"/><text x="198" y="43">res[${a.index}]</text><text class="p144-append-label" x="40" y="76">node.val</text></svg></div>`:"";
  return `<section class="p144-output ${v.answer!==null?"is-final":""}" data-output-values="${p144Escape(JSON.stringify(v.res))}"><header><code>${v.answer===null?"res":t.result}</code><small>${v.output.length}/${v.nodes.length}</small></header>${bridge}<div class="p144-output-scroll" tabindex="0" role="region" aria-label="res">${v.output.length?v.output.map(item=>`<button class="p144-output-cell ${a?.id===item.id?"is-new":""}" data-p144-output="${item.id}" data-output-index="${item.index}" data-output-value="${item.value}" type="button"><small>[${item.index}]</small><b>${item.value}</b><small>#${item.id.split(":")[1]}</small></button>`).join(""):'<code class="p144-empty-output">[]</code>'}</div><small>${t.output}</small>${v.answer===null?"":`<output class="p144-answer" data-answer="${p144Escape(JSON.stringify(v.answer))}">${p144Escape(JSON.stringify(v.answer))}</output>`}</section>`;
}
function p144Stack(v,t) {
  if(!v.stack.length)return "";
  return `<section class="p144-stack"><header>${t.stack}<small>· ${v.stack.length}</small></header><div class="p144-stack-scroll">${v.stack.map((frame,i)=> {
    const state=v.states.find(r=>r.id===frame.node);
    const progress=state?(v.id===145?[["L",state.leftDone],["R",state.rightDone],["V",state.visited]]:v.id===94?[["L",state.leftDone],["V",state.visited],["R",state.rightDone]]:[["V",state.visited],["L",state.leftDone],["R",state.rightDone]]).map(([name,done])=>`${name} ${done?"✓":"·"}`).join("　"):v.returning?"↩":"∅";
    return `<button class="p144-frame ${i===v.stack.length-1?"is-current":""}" data-p144-call="${frame.id}" data-frame-index="${i}" data-frame-node="${frame.node}" data-frame-side="${frame.side}" data-frame-phase="${frame.phase}" type="button"><code>dfs(${frame.value??"None"})</code><small>${frame.node?`#${frame.node.split(":")[1]}`:"∅"}</small><span>${progress}</span></button>`;
  }).join("")}</div></section>`;
}
function p144Jump(kind) {
  if(typeof steps==="undefined"||typeof renderStep!=="function")return;
  if(typeof stopPlay==="function")stopPlay();
  const next=steps.findIndex((s,i)=> {
    const v=p144View(s);return i>stepIndex&&v&&(kind==="call"?v.source.line===5:kind==="append"?v.append!==null:kind==="return"?v.scope==="dfs"&&v.returning:v.answer!==null);
  });
  stepIndex=next<0?steps.length-1:next;renderStep();
}
function p144Bind(host) {
  const bind=(selector,action)=>host.querySelectorAll(selector).forEach(node=> {
    node.addEventListener("click",()=>action(node));
    node.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();event.stopPropagation();action(node);}});
  });
  bind("[data-p144-jump]",node=>p144Jump(node.dataset.p144Jump));
  const go=predicate=> {
    if(typeof steps==="undefined"||typeof renderStep!=="function")return;
    const index=steps.findIndex(s=>p144View(s)&&predicate(p144View(s)));
    if(index<0)return;if(typeof stopPlay==="function")stopPlay();stepIndex=index;renderStep();
  };
  bind("[data-p144-call]",node=>go(v=>v.source.line===5&&v.callId===node.dataset.p144Call));
  bind("[data-p144-output]",node=>go(v=>v.append?.id===node.dataset.p144Output));
  bind("[data-p144-case]",node=> {
    if(typeof runViz!=="function")return;
    const cases=[[1,2,3,4,5,6,7],[1,null,2,3],[5],[1,null,2,null,3,null,4],[0,0,0],[],[4,2,6,1,3,5,7]];
    document.getElementById("arrInput").value=JSON.stringify(cases[Number(node.dataset.p144Case)]);runViz();
  });
}
function renderPreorder144Pictures(step) {
  const host=document.getElementById("treeView"),v=p144View(step);if(!host||!v)return;
  const id=v.id??144,t=p144Copy(id),traversal=id===145?"POSTORDER":id===94?"INORDER":"PREORDER";
  const oldTree=host.querySelector(".p144-tree-scroll"),oldOutput=host.querySelector(".p144-output-scroll");
  const scroll={x:oldTree?.scrollLeft??0,y:oldTree?.scrollTop??0,output:oldOutput?.scrollLeft??0};
  host.innerHTML=`<article class="p144-viz" role="region" aria-label="${t.region}" data-problem-id="${id}" data-source-line="${v.source.line}"><header class="p144-header"><div><small>LEETCODE ${id} · ${traversal} DFS</small><h2>${p144Escape(v.phase[t.locale])}</h2></div><b class="p144-count">${v.visited.length}/${v.nodes.length}</b></header><nav class="p144-presets" aria-label="Examples">${t.presets.map((name,i)=>`<button type="button" data-p144-case="${i}">${name}</button>`).join("")}</nav><div class="p144-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${p144Escape(v.source.text)}</code>${v.branch===null?"":`<strong class="${v.branch?"is-true":"is-false"}">${v.branch?"True ✓":"False ×"}</strong>`}${v.scope==="dfs"&&v.returning?`<small class="p144-returning">↩ None${v.source.line===9?` · ${t.implicit}`:""}</small>`:""}</div>${p144Flow(v,t)}${p144Tree(v,t)}${p144Output(v,t)}${p144Stack(v,t)}<footer class="p144-footer"><div>${[["call",t.nextCall],["append",t.nextAppend],["return",t.nextReturn],["result",t.end]].map(([kind,label])=>`<button type="button" data-p144-jump="${kind}">${label}</button>`).join("")}</div><small>O(n) time · O(h) stack</small></footer></article>`;
  const tree=host.querySelector(".p144-tree-scroll");
  if(tree) {
    tree.scrollLeft=scroll.x;tree.scrollTop=scroll.y;
    const target=host.querySelector(v.emptyCall||!v.nodes.length?".p144-null":`.p144-node[data-node-id="${v.active??v.nodes[0].id}"]`);
    if(target) {
      const box=tree.getBoundingClientRect(),p=target.getBoundingClientRect(),pad=24;
      if(p.left<box.left+pad)tree.scrollLeft-=box.left+pad-p.left;
      if(p.right>box.right-pad)tree.scrollLeft+=p.right-box.right+pad;
      if(p.top<box.top+pad)tree.scrollTop-=box.top+pad-p.top;
      if(p.bottom>box.bottom-pad)tree.scrollTop+=p.bottom-box.bottom+pad;
    }
  }
  const output=host.querySelector(".p144-output-scroll");
  if(output) {
    output.scrollLeft=scroll.output;
    const cell=output.querySelector(".is-new");
    if(cell) {const box=output.getBoundingClientRect(),p=cell.getBoundingClientRect();if(p.left<box.left)output.scrollLeft-=box.left-p.left;if(p.right>box.right)output.scrollLeft+=p.right-box.right;}
  }
  const stack=host.querySelector(".p144-stack-scroll");if(stack)stack.scrollLeft=stack.scrollWidth;
  p144Bind(host);
}
function renderInorder94Pictures(step) { renderPreorder144Pictures(step); }
function renderPostorder145Pictures(step) { renderPreorder144Pictures(step); }
