"use strict";

function b102Escape(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);}
function b102Copy(){
  const vi=typeof lang!=="undefined"&&lang==="vi";
  return {locale:vi?"vi":"en",region:vi?"BFS theo tầng":"BFS by level",after:vi?"Sau dòng":"After line",level:vi?"Tầng":"Level",unbound:vi?"Chưa tạo":"Unbound",
    tree:vi?"Chọn nút → bước for n":"Select a node → its for n step",next:vi?"Gom con cho tầng kế":"Collect children for the next level",keep:vi?"Giữ nguyên trong vòng for":"Unchanged during the for loop",
    alias:vi?"queue và nxt cùng danh sách":"queue and nxt share one list",values:vi?"Chỉ lấy giá trị":"Take values only",result:vi?"Các tầng đã ghi":"Recorded levels",current:vi?"n hiện tại":"Current n",skip:vi?"Không thêm None":"Do not append None",
    call:vi?"Tầng tiếp →":"Next level →",record:vi?"Ghi tầng →":"Record level →",child:vi?"Thêm con →":"Append child →",end:vi?"Kết quả ↠":"Result ↠",
    presets:vi?["Mẫu 3 tầng","Cây đủ","Thiếu nhánh","Cây lệch","Trùng giá trị","Một nút 0","Cây rỗng"]:["Three levels","Full tree","Sparse tree","Skewed tree","Equal values","One zero node","Empty tree"],
  };
}
function b102Tree(v,t){
  const depth=Math.max(0,...v.nodes.map(n=>n.depth)),width=Math.max(460,128+(v.nodes.length-1)*64),ghost=v.probe&&!v.probe.exists;
  const height=Math.max(240,depth*96+(ghost?210:128)),points=new Map(v.nodes.map(n=>[n.id,{x:(width-(v.nodes.length-1)*64)/2+n.rank*64,y:64+n.depth*96}]));
  const queued=new Set(v.queue??[]),next=new Set(v.alias?[]:v.nxt??[]),recorded=new Set(v.recorded);
  const bands=v.nodes.length?Array.from({length:depth+1},(_,i)=>`<g class="b102-band"><path d="M42,${64+i*96} H${width-20}"/><text x="21" y="${68+i*96}">${i+1}</text></g>`).join(""):"";
  const edges=v.nodes.filter(n=>n.parent).map(n=>{const a=points.get(n.parent),b=points.get(n.id),added=v.change?.kind==="enqueue"&&v.change.child===n.id;
    return `<path class="b102-edge ${added?"is-added":""}" d="M${a.x},${a.y} L${b.x},${b.y}"/>`;}).join("");
  const nodes=v.nodes.map(n=>{const p=points.get(n.id);return `<g class="b102-node ${queued.has(n.id)?"is-queue":""} ${next.has(n.id)?"is-next":""} ${recorded.has(n.id)?"is-recorded":""} ${v.current===n.id?"is-current":""}" data-b102-node="${n.id}" data-node-value="${n.value}" data-node-queued="${queued.has(n.id)}" data-node-next="${next.has(n.id)}" data-node-recorded="${recorded.has(n.id)}" tabindex="0" role="button" aria-label="n = ${n.value}, #${n.id.split(":")[1]}"><circle class="b102-ring" cx="${p.x}" cy="${p.y}" r="29"/><circle class="b102-disc" cx="${p.x}" cy="${p.y}" r="24"/><text class="b102-value" x="${p.x}" y="${p.y+5}">${n.value}</text><text class="b102-id" x="${p.x}" y="${p.y+43}">#${n.id.split(":")[1]}</text></g>`;}).join("");
  let empty="";
  if(ghost){const parent=points.get(v.probe.parent),x=parent.x+(v.probe.side==="left"?-40:40),y=parent.y+80;empty=`<g class="b102-null"><path d="M${parent.x},${parent.y+24} L${x},${y-18}"/><circle cx="${x}" cy="${y}" r="18"/><text x="${x}" y="${y+5}">∅</text><text class="b102-null-label" x="${x}" y="${y+42}">× nxt</text></g>`;}
  if(!v.nodes.length)empty=`<g class="b102-null"><circle cx="${width/2}" cy="90" r="22"/><text x="${width/2}" y="95">∅</text></g>`;
  return `<section class="b102-tree-card"><header><b>${t.tree}</b><small>${t.level} 1 = root · # = ID</small></header><div class="b102-tree-scroll" tabindex="0" role="region" aria-label="${t.region}"><svg class="b102-tree-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="group" aria-label="${t.region}"><title>${t.region}</title>${bands}${edges}${nodes}${empty}</svg></div><div class="b102-legend"><span class="is-queue">● queue</span><span class="is-next">● nxt</span><span class="is-current">● ${t.current}</span></div></section>`;
}
function b102Buffer(v,name,t){
  const list=v[name],byId=new Map(v.nodes.map(n=>[n.id,n]));
  const active=name==="queue"?v.current:v.change?.kind==="enqueue"?v.change.child:null;
  const activeLine=name==="queue"?[5,15].includes(v.source.line):[9,12,14].includes(v.source.line);
  return `<section class="b102-buffer is-${name} ${activeLine?"is-assigned":""}" data-buffer="${name}" data-buffer-ids="${b102Escape(JSON.stringify(list))}"><header><code>${name}</code><small>${list===null?t.unbound:list.length}</small></header><div class="b102-buffer-scroll" tabindex="0">${list===null?'<b class="b102-placeholder">—</b>':!list.length?'<code class="b102-placeholder">[]</code>':list.map((id,i)=>`<button class="b102-tile ${id===active?"is-current":""}" data-b102-node="${id}" data-buffer-index="${i}" type="button"><small>[${i}]${name==="queue"&&v.cursor===i?" ← n":""}</small><b>${byId.get(id).value}</b><small>#${id.split(":")[1]}</small></button>`).join("")}</div><small>${name==="queue"?t.keep:v.alias?"queue is nxt":t.next}</small></section>`;
}
function b102Probe(v,t){
  const p=v.probe;if(!p)return "";
  const byId=new Map(v.nodes.map(n=>[n.id,n])),value=p.child===null?"∅":byId.get(p.child).value;
  return `<section class="b102-probe ${p.appended?"is-added":""}" data-probe-child="${p.child}" data-probe-appended="${p.appended}"><code>n.${p.side}</code><b>${value}</b><i>→</i>${p.appended?'<strong>nxt.append ✓</strong>':p.exists?'<strong>True ✓</strong>':`<strong>× ${t.skip}</strong>`}</section>`;
}
function b102Level(v,t){
  const byId=new Map(v.nodes.map(n=>[n.id,n]));
  return `<section class="b102-level ${v.source.line===7?"is-active":""}"><header><code>level</code><small>${t.values}${v.levelNumber===null?"":` · ${t.level} ${v.levelNumber}`}</small></header><div class="b102-level-scroll" tabindex="0">${v.level===null?'<b class="b102-placeholder">—</b>':v.level.map((value,i)=>`<button class="b102-value-tile" data-b102-node="${v.levelIds[i]}" data-level-index="${i}" data-level-value="${value}" type="button"><b>${value}</b><small>#${byId.get(v.levelIds[i]).id.split(":")[1]}</small></button>`).join("")}</div></section>`;
}
function b102Results(v,t){
  const result=v.answer!==null?v.answer:v.res;
  return `<section class="b102-results ${v.answer!==null?"is-final":""}" data-result-values="${b102Escape(JSON.stringify(result))}"><header><code>${v.answer!==null?"return":"res"}</code><small>${t.result} · ${result?.length??0}</small></header>${result===null?'<b class="b102-placeholder">—</b>':!result.length?'<code class="b102-placeholder">[]</code>':`<div class="b102-result-scroll">${result.map((row,index)=>`<div class="b102-result-row ${v.change?.kind==="record"&&v.change.index===index?"is-new":""}" data-result-row="${index}"><button class="b102-level-number" data-b102-result="${index}" type="button">${t.level} ${index+1}</button><div>${row.map((value,i)=>`<button class="b102-value-tile" data-b102-node="${v.resultIds[index][i]}" data-result-index="${index}" data-result-value="${value}" type="button"><b>${value}</b><small>#${v.resultIds[index][i].split(":")[1]}</small></button>`).join("")}</div></div>`).join("")}</div>`}${v.answer===null?"":`<output class="b102-answer" data-answer="${b102Escape(JSON.stringify(v.answer))}">${b102Escape(JSON.stringify(v.answer))}</output>`}</section>`;
}
function b102Jump(kind){
  if(typeof steps==="undefined"||typeof renderStep!=="function")return;
  if(typeof stopPlay==="function")stopPlay();
  const next=steps.findIndex((s,i)=>{const v=s.levelOrder102View;return i>stepIndex&&v&&(kind==="level"?v.source.line===6&&v.branch:kind==="record"?v.source.line===8:kind==="child"?v.change?.kind==="enqueue":v.answer!==null);});
  stepIndex=next<0?steps.length-1:next;renderStep();
}
function b102Bind(host){
  const bind=(selector,action)=>host.querySelectorAll(selector).forEach(node=>{node.addEventListener("click",()=>action(node));node.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();event.stopPropagation();action(node);}});});
  const go=predicate=>{if(typeof steps==="undefined"||typeof renderStep!=="function")return;const index=steps.findIndex(s=>s.levelOrder102View&&predicate(s.levelOrder102View));if(index<0)return;if(typeof stopPlay==="function")stopPlay();stepIndex=index;renderStep();};
  bind("[data-b102-jump]",node=>b102Jump(node.dataset.b102Jump));
  bind("[data-b102-node]",node=>go(v=>v.source.line===10&&v.branch&&v.current===node.dataset.b102Node));
  bind("[data-b102-result]",node=>go(v=>v.change?.kind==="record"&&v.change.index===Number(node.dataset.b102Result)));
  bind("[data-b102-case]",node=>{if(typeof runViz!=="function")return;const cases=[[3,9,20,null,null,15,7],[1,2,3,4,5,6,7],[1,null,2,3],[1,null,2,null,3,null,4],[0,0,0],[0],[]];document.getElementById("arrInput").value=JSON.stringify(cases[Number(node.dataset.b102Case)]);runViz();});
}
function renderLevelOrder102Pictures(step){
  const host=document.getElementById("treeView"),v=step.levelOrder102View,t=b102Copy();if(!host||!v)return;
  const oldTree=host.querySelector(".b102-tree-scroll"),oldResults=host.querySelector(".b102-result-scroll"),oldLevel=host.querySelector(".b102-level-scroll");
  const scroll={x:oldTree?.scrollLeft??0,y:oldTree?.scrollTop??0,results:oldResults?.scrollTop??0,rx:oldResults?.scrollLeft??0,level:oldLevel?.scrollLeft??0};
  const buffers=Object.fromEntries(["queue","nxt"].map(name=>[name,host.querySelector(`[data-buffer="${name}"] .b102-buffer-scroll`)?.scrollLeft??0]));
  host.innerHTML=`<article class="b102-viz" role="region" aria-label="${t.region}" data-source-line="${v.source.line}"><header class="b102-header"><div><small>LEETCODE 102 · LEVEL ORDER BFS</small><h2>${b102Escape(v.phase[t.locale])}</h2></div><code>queue → level → res<br>children → nxt → queue</code></header><nav class="b102-presets" aria-label="Examples">${t.presets.map((name,i)=>`<button type="button" data-b102-case="${i}">${name}</button>`).join("")}</nav><div class="b102-source"><span>${t.after} <b>L${v.source.line}</b></span><code>${b102Escape(v.source.text)}</code>${v.branch===null?"":`<strong class="${v.branch?"is-true":"is-false"}">${v.branch?"True ✓":"False ×"}</strong>`}</div>${b102Tree(v,t)}<div class="b102-buffers">${b102Buffer(v,"queue",t)}${b102Buffer(v,"nxt",t)}</div>${v.alias?`<div class="b102-alias" data-queue-alias="true"><code>queue is nxt</code><small>${t.alias}</small></div>`:""}${b102Probe(v,t)}${b102Level(v,t)}${b102Results(v,t)}<footer class="b102-footer"><div>${[["level",t.call],["record",t.record],["child",t.child],["result",t.end]].map(([kind,label])=>`<button type="button" data-b102-jump="${kind}">${label}</button>`).join("")}</div><small>O(n) time · O(n) space</small></footer></article>`;
  const tree=host.querySelector(".b102-tree-scroll");if(tree){tree.scrollLeft=scroll.x;tree.scrollTop=scroll.y;
    const focus=v.change?.kind==="enqueue"?v.change.child:v.current??v.queue?.[0]??v.nodes[0]?.id;
    const target=host.querySelector(v.probe&&!v.probe.exists||!v.nodes.length?".b102-null":`.b102-node[data-b102-node="${focus}"]`);
    if(target){const b=tree.getBoundingClientRect(),p=target.getBoundingClientRect(),pad=24;
      if(p.left<b.left+pad)tree.scrollLeft-=b.left+pad-p.left;if(p.right>b.right-pad)tree.scrollLeft+=p.right-b.right+pad;
      if(p.top<b.top+pad)tree.scrollTop-=b.top+pad-p.top;if(p.bottom>b.bottom-pad)tree.scrollTop+=p.bottom-b.bottom+pad;}}
  for(const name of ["queue","nxt"]){const list=host.querySelector(`[data-buffer="${name}"] .b102-buffer-scroll`);if(!list)continue;list.scrollLeft=buffers[name];const active=list.querySelector(".is-current");if(active){const b=list.getBoundingClientRect(),p=active.getBoundingClientRect();if(p.left<b.left)list.scrollLeft-=b.left-p.left;if(p.right>b.right)list.scrollLeft+=p.right-b.right;}}
  const level=host.querySelector(".b102-level-scroll");if(level)level.scrollLeft=scroll.level;
  const results=host.querySelector(".b102-result-scroll");if(results){results.scrollTop=scroll.results;results.scrollLeft=scroll.rx;const current=results.querySelector(".is-new");if(current){const b=results.getBoundingClientRect(),p=current.getBoundingClientRect();if(p.top<b.top)results.scrollTop-=b.top-p.top;if(p.bottom>b.bottom)results.scrollTop+=p.bottom-b.bottom;}}
  b102Bind(host);
}
