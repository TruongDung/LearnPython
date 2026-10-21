function merge23HeapLayout(length){
  const levels=length?Math.floor(Math.log2(length))+1:1,width=Math.max(330,2**(levels-1)*76),height=levels*69+20;
  const xy=index=>{const level=Math.floor(Math.log2(index+1)),first=2**level-1;return {x:(index-first+.5)*width/2**level,y:32+level*69};};
  return {width,height,xy};
}
function renderMergeKLists23Pictures(step){
  const v=step.merge23View,t=(vi,en)=>lang==='vi'?vi:en,esc=x=>escapeHtml(String(x)),two=v.approach===2,final=Boolean(step.final),summary=v.mode==='summary';
  const byId=new Map(v.nodes.map(node=>[node.id,node])),confirmed=new Set(v.confirmed),queued=new Set(v.heap.map(item=>item.id));
  const name=id=>id===undefined?'—':id===null?'None':id<0?'D'+(-id):'#'+(id+1),value=id=>id===null||id===undefined?'None':byId.get(id)?.value??'?';
  function heapPicture(){
    const {width,height,xy}=merge23HeapLayout(v.heap.length);
    if(!v.heap.length)return `<div class="k23-empty">heap = ∅</div>`;
    const edges=v.heap.slice(1).map((item,j)=>{const a=xy((j>>1)),b=xy(j+1);return `<path class="k23-heap-edge" d="M${a.x},${a.y} L${b.x},${b.y}"/>`;}).join('');
    const nodes=v.heap.map((item,i)=>{const p=xy(i);return `<g class="k23-heap-node origin-${item.origin%6}${i===0?' minimum':''}" transform="translate(${p.x},${p.y})"><title>${item.value} · L${item.origin} · ${name(item.id)}</title><circle r="23"/><text class="k23-value" y="5" text-anchor="middle">${item.value}</text><text class="k23-id" y="37" text-anchor="middle">${name(item.id)} · L${item.origin}</text></g>`;}).join('');
    return `<div class="k23-heap-svg"><svg viewBox="0 0 ${width} ${height}" style="width:${width}px;height:${height}px" role="img" aria-label="${t('Min-heap theo giá trị rồi số hiệu list','Min-heap ordered by value then list index')}">${edges}${nodes}</svg></div>`;
  }
  function sourceRows(){
    return `<div class="k23-sources"><small>${t('Nguồn ban đầu · # là số hiệu node','Original sources · # identifies a node')}</small>${v.original.map((ids,i)=>`<div class="k23-source origin-${i%6}${v.pair.includes(i)&&two&&!final?' paired':''}"><b>L${i}</b><div>${ids.map((id,j)=>`${j?'<i>⇢</i>':''}<span class="${queued.has(id)?'queued ':''}${confirmed.has(id)?'used ':''}${v.selected===id?'selected ':''}${[v.pointers.left,v.pointers.right].includes(id)&&two&&!final?'pointed':''}"><strong>${value(id)}</strong><small>${name(id)}</small></span>`).join('')||'<i>None</i>'}${summary&&v.rowLengths[i]>ids.length?'<i>…</i>':''}</div></div>`).join('')||'<div class="k23-empty">lists = []</div>'}${summary&&v.totalLists>v.original.length?`<small>+${v.totalLists-v.original.length} ${t('list ngoài hình','off-screen lists')}</small>`:''}</div>`;
  }
  function chainPicture(){
    const dummy=v.pointers.dummy,showDummy=!final&&dummy!==undefined&&byId.has(dummy),ids=[...(showDummy?[dummy]:[]),...v.chain],width=Math.max(360,ids.length*64+70),y=56;
    if(!ids.length)return `<div class="k23-empty">${final?'None':t('Chưa tạo dummy','Dummy not created yet')}</div>`;
    const xy=i=>({x:33+i*64,y});
    const edges=ids.map((id,i)=>{
      const next=byId.get(id).next;if(next===null)return `<text class="k23-none" x="${xy(i).x+32}" y="${y+5}">→ None</text>`;
      const target=ids.indexOf(next);if(target<0)return `<text class="k23-none" x="${xy(i).x+32}" y="${y+5}">→ …</text>`;
      const a=xy(i),b=xy(target),changed=v.change?.from===id;
      return `<path class="k23-next${changed?' changed':''}${confirmed.has(id)&&confirmed.has(next)?' done':''}" d="M${a.x+23},${y} H${b.x-24}" marker-end="url(#k23-arrow)"/>`;
    }).join('');
    const cells=ids.map((id,i)=>{const p=xy(i),node=byId.get(id),pointers=Object.entries(v.pointers).filter(([key,target])=>target===id&&['tail','node','left','right'].includes(key)).map(([key])=>key);
      return `<g class="k23-chain-node origin-${(node.origin??0)%6}${id<0?' dummy':confirmed.has(id)?' confirmed':' pending'}${v.selected===id?' selected':''}" transform="translate(${p.x},${p.y})"><title>${name(id)}${id<0?'':` · L${node.origin}`}</title>${id<0?'<rect x="-23" y="-23" width="46" height="46" rx="8"/>':'<circle r="23"/>'}<text class="k23-value" text-anchor="middle" y="5">${id<0?'D':node.value}</text><text class="k23-id" text-anchor="middle" y="38">${name(id)}</text>${pointers.length?`<text class="k23-pointer" text-anchor="middle" y="-32">${pointers.join('/')}</text>`:''}</g>`;
    }).join('');
    return `<div class="k23-chain"><svg viewBox="0 0 ${width} 111" style="width:${width}px;height:111px" role="img" aria-label="${t('Các liên kết next thực tế từ dummy.next','Actual next links from dummy.next')}"><defs><marker id="k23-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z"/></marker></defs>${edges}${cells}</svg></div>`;
  }
  const pointers=(two?['left','right','tail']:['node','tail']).map(key=>`<span><small>${key}</small><b>${name(v.pointers[key])}</b><small>${v.pointers[key]===null||v.pointers[key]===undefined?'':value(v.pointers[key])}</small></span>`).join('');
  const pair=two&&!final?`<div class="k23-pair">width = ${v.width??'—'}${v.pair.length?` · lists[${v.pair[0]}] + lists[${v.pair[1]}]`:''}</div>`:'';
  const comparison=two&&v.event==='compare'?`<div class="k23-compare"><b>${value(v.pointers.left)}</b><span>≤</span><b>${value(v.pointers.right)}</b><strong>${v.check?'True ✓':'False ✕'}</strong></div>`:'';
  const change=v.change?`<div class="k23-change"><code>${name(v.change.from)}.next</code><s>${name(v.change.before)}</s><span>→</span><b>${name(v.change.after)}</b></div>`:'';
  $('treeView').innerHTML=`<section class="k23-viz" aria-label="23 · Merge k sorted lists">
    <header><strong>23 · ${two?t('Gộp từng cặp','Merge pairs'):'Min-heap'}</strong><button type="button" data-k23-next ${final?'disabled':''}>${two?t('Cặp tiếp','Next pair'):t('Lấy node tiếp','Next pop')} ⏭</button><button type="button" data-k23-result>${t('Kết quả','Result')}</button></header>
    ${summary?`<div class="k23-summary">${v.totalLists} list · ${v.totalNodes} node · ${t('đã gộp đủ. Hình xem trước 4 list và 12 node kết quả. Debug từng dòng với ≤6 list, ≤16 node.','fully merged. Pictures preview 4 lists and 12 result nodes. Full line debug for ≤6 lists, ≤16 nodes.')}</div>`:`<div class="k23-line"><b>L${v.line}</b><code>${esc(v.source)}</code></div>`}
    ${sourceRows()}
    ${!final?`<div class="k23-pointers">${pointers}</div>${pair}${two?comparison:`<div class="k23-heap"><small>heap · ${t('mỗi list ≤1 node · hòa giá trị thì chọn L nhỏ hơn','≤1 node per list · equal values use the smaller L index')}</small>${heapPicture()}</div>`}`:''}
    ${change}<div class="k23-chain-label">${final?t('Kết quả','Result'):t('D.next · liên kết hiện tại','D.next · current links')}</div>${chainPicture()}
    ${final?`<div class="k23-answer">✓ ${v.totalNodes} node · ${v.totalNodes?t('tăng dần · dùng lại node gốc','sorted · original nodes reused'):t('rỗng → None','empty → None')}${summary&&v.totalNodes>v.chain.length?' · …':''}</div>`:`<div class="k23-legend"><span>${t('Xanh: đã gộp','Green: merged')}</span><span>${t('Xám: đuôi chưa gộp đang đi kèm','Gray: attached suffix not merged yet')}</span></div>`}
    <div class="k23-examples">${[t('Ví dụ','Example'),t('Không có list','No lists'),t('List rỗng','Empty lists'),t('Số âm / trùng','Negative / duplicate')].map((label,i)=>`<button type="button" data-k23-example="${i}">${label}</button>`).join('')}</div>
  </section>`;
  const host=$('treeView');
  host.querySelector('[data-k23-result]').addEventListener('click',()=>{stopPlay();stepIndex=steps.length-1;renderStep();});
  host.querySelector('[data-k23-next]').addEventListener('click',()=>{const index=steps.findIndex((s,i)=>i>stepIndex&&s.merge23View?.event===(two?'pair':'pop'));stopPlay();stepIndex=index<0?steps.length-1:index;renderStep();});
  host.querySelectorAll('[data-k23-example]').forEach(button=>button.addEventListener('click',()=>{$('arrInput').value=['1,4,5;1,3,4;2,6','[]','[[],[],[]]','[[-3,-1,2],[-3,0],[0,2]]'][Number(button.dataset.k23Example)];runViz();}));
  const chain=host.querySelector('.k23-chain');if(chain&&v.pointers.tail!==undefined){const index=v.chain.indexOf(v.pointers.tail)+(v.pointers.dummy!==undefined?1:0);chain.scrollLeft=Math.max(0,index*64-chain.clientWidth/2);}
}
