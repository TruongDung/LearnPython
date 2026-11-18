'use strict';
function circular918Next(kind){
  if(typeof steps==='undefined'||typeof stepIndex==='undefined')return -1;
  for(let i=stepIndex+1;i<steps.length;i++){
    const v=steps[i].circular918PictureView;
    if(v&&(kind==='line'||kind==='result'&&steps[i].final||kind==='compare'&&v.line===12||kind==='cell'&&v.line===6))return i;
  }return -1;
}
function renderCircular918Pictures(step){
  const v=step.circular918PictureView,p=v.pythonLocals,final=step.final;
  const t=(vi,en)=>lang==='vi'?vi:en;
  const esc=value=>String(value??'—').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const num=value=>value===null?'?':Number(value).toLocaleString('en-US').replace('-','−');
  const inside=(index,range)=>range!==null&&index>=range[0]&&index<=range[1];
  const wrapReady=v.guard===false,wrapValid=wrapReady&&!v.wrapEmpty;
  let mode=final?v.winner==='wrap'?'wrap':'normal':v.line===14&&wrapValid?'wrap':[9,10].includes(v.line)?'cut':'normal';
  const host=document.getElementById('treeView');
  function strip(kind){
    return v.cells.map((cell,index)=>`${index&&cell.index-v.cells[index-1].index>1?'<i>…</i>':''}<span class="${kind==='normal'&&inside(cell.index,v.maxRange)?'normal':kind==='cut'&&inside(cell.index,v.minRange)?'cut':kind==='wrap'?inside(cell.index,v.minRange)?'cut':'keep':''}">${num(cell.value)}</span>`).join('');
  }
  function draw(){
    const nodes=[];
    v.cells.forEach((cell,index)=>{
      if(index&&cell.index-v.cells[index-1].index>1)nodes.push({gap:cell.index-v.cells[index-1].index-1});nodes.push(cell);
    });
    const radius=110,cx=180,cy=154;
    const point=angle=>({x:cx+radius*Math.sin(angle),y:cy-radius*Math.cos(angle)});
    const selected=index=>mode==='normal'?inside(index,v.maxRange):mode==='wrap'&&!inside(index,v.minRange);
    const edges=nodes.length>1?nodes.map((node,index)=>{
      const next=nodes[(index+1)%nodes.length],a=2*Math.PI*index/nodes.length,b=2*Math.PI*(index+1)/nodes.length;
      const start=point(a),end=point(b);
      const seam=index===nodes.length-1;
      const kept=!node.gap&&!next.gap&&selected(node.index)&&selected(next.index)&&(mode==='wrap'||!seam);
      return `<path class="r918-edge ${kept?'selected':''} ${seam?'seam':''}" d="M${start.x.toFixed(2)},${start.y.toFixed(2)} A110,110 0 0,1 ${end.x.toFixed(2)},${end.y.toFixed(2)}"/>`;
    }).join(''):'';
    const circles=nodes.map((node,index)=>{
      const at=point(index*2*Math.PI/nodes.length),r=nodes.length>12?14:nodes.length>7?18:23;
      if(node.gap)return `<g class="r918-gap"><title>${node.gap} ${t('ô đã ẩn','hidden cells')}</title><circle cx="${at.x}" cy="${at.y}" r="12"/><text x="${at.x}" y="${at.y+4}">…</text></g>`;
      const state=mode==='cut'&&inside(node.index,v.minRange)||mode==='wrap'&&inside(node.index,v.minRange)?'cut':selected(node.index)?mode==='normal'?'normal':'keep':'';
      const cursor=!final&&node.index===(p.i??(p.max_sum!==null?0:-1));
      return `<g class="r918-node ${state} ${cursor?'cursor':''}" data-index="${node.index}" data-state="${state}"><title>nums[${node.index}] = ${node.value}</title><circle cx="${at.x}" cy="${at.y}" r="${r}"/><text class="value ${String(node.value).length>4?'small':''}" x="${at.x}" y="${at.y+5}">${num(node.value)}</text><text class="index" x="${at.x}" y="${at.y+r+12}">${node.index}</text>${state==='cut'?`<path class="r918-cross" d="M${at.x-r+4},${at.y+r-4} L${at.x+r-4},${at.y-r+4}"/>`:''}</g>`;
    }).join('');
    const center=mode==='normal'?p.max_sum:mode==='cut'?p.min_sum:p.circular_sum;
    const label=mode==='normal'?'MAX':mode==='cut'?'MIN':t('GIỮ LẠI','KEEP');
    const pending=v.pending;
    const effect=pending?`<div class="r918-effect"><small>${pending.kind==='condition'?t('Kiểm tra','Test'):pending.kind==='return'?t('Trả về','Return'):t('Sắp ghi','Next write')}</small><code>${esc(pending.target)}</code>${pending.kind==='condition'?`<b>${pending.after?'True':'False'}</b>`:`${pending.before!==undefined?`<b>${num(pending.before)}</b><span>→</span>`:''}<b class="pending">${num(pending.after)}</b>`}</div>`:`<small>${esc(t(v.event.vi,v.event.en))}</small>`;
    const options=pending?.options?`<div class="r918-options"><span>${t('Bắt đầu','Restart')} <b>${num(pending.options.restart)}</b></span><i>${pending.options.kind}</i><span>${t('Nối tiếp','Extend')} <b>${num(pending.options.extend)}</b></span></div>`:'';
    const invalid=v.guard===true||wrapReady&&v.wrapEmpty;
    const path=v.witness?v.witness.ranges.map(([left,right],rangeIndex)=>{
      const cells=v.cells.filter(cell=>cell.index>=left&&cell.index<=right);
      return `${rangeIndex?'<b class="r918-join">↻</b>':''}${cells.length&&cells[0].index>left?'<i>…</i>':''}${cells.map((cell,index)=>`${index?cell.index-cells[index-1].index>1?'<i>…</i>':'<b>+</b>':''}<span>${num(cell.value)}</span>`).join('')}${cells.length&&cells.at(-1).index<right?'<i>…</i>':''}`;
    }).join(''):'';
    host.innerHTML=`<section class="r918-viz" aria-label="918 · Maximum Sum Circular Subarray"><header class="r918-head"><div><small>918 · CIRCULAR SUBARRAY</small><h2>${t('Cuối nối đầu ↻','End meets start ↻')}</h2></div><output><strong>${final?num(v.answer):p.i??'—'}</strong><span>${final?t('tổng lớn nhất','maximum sum'):'index i'}</span></output></header>
      <section class="r918-debug"><header><b>▶ L${v.line}</b><span>${t('Sắp chạy','Before execution')}</span>${p.x!==null?`<code>x = ${num(p.x)}</code>`:''}<button type="button" data-r918-jump="line"${circular918Next('line')<0?' disabled':''}>${t('Dòng →','Line →')} F10</button></header><code>${esc(v.source.trim())}</code>${effect}${options}</section>
      ${!v.detailed?`<small class="r918-caption">${t('Trace rút gọn · n ≤ 40 để debug đủ từng dòng.','Shortened trace · use n ≤ 40 to debug every line.')}</small>`:''}
      <nav class="r918-modes">${[['normal',t('Giữ MAX','Keep MAX'),p.max_sum===null],['cut',t('Bỏ MIN','Remove MIN'),p.min_sum===null],['wrap',t('Nối vòng ↻','Wrap ↻'),!wrapValid]].map(([kind,title,disabled])=>`<button type="button" data-r918-mode="${kind}" aria-pressed="${mode===kind}"${disabled?' disabled':''}>${title}</button>`).join('')}</nav>
      <div class="r918-circle ${mode}" aria-label="${t('Mảng vòng tròn; số nhỏ là chỉ số','Circular array; small numbers are indices')}"><svg viewBox="0 0 360 310" role="img" aria-label="${t('Vòng số','Number ring')}"><circle class="r918-guide" cx="180" cy="154" r="110"/>${edges}<text class="r918-seam-label" x="16" y="21">${v.n-1} → 0 ↻</text>${circles}<text class="r918-center-label" x="180" y="139">${label}</text><text class="r918-center-value" x="180" y="176">${num(center)}</text></svg></div>
      ${v.omitted?`<small class="r918-caption">… = ${t('ô đã ẩn','hidden cells')} · ${t('đã tính đủ','all computed')} ${num(v.n)} ${t('ô','cells')}</small>`:''}
      ${wrapReady?`<div class="r918-equation">${num(p.total)} − (${num(p.min_sum)}) = <b>${num(p.circular_sum)}</b>${invalid?`<span>∅ ✕ ${t('Không chọn rỗng','No empty selection')}</span>`:''}</div>`:''}
      <div class="r918-candidates"><button type="button" class="r918-candidate normal ${final&&v.winner==='normal'?'winner':''}" data-r918-mode="normal"><header>A · ${t('Giữ MAX','Keep MAX')} ${final&&v.winner==='normal'?'✓':''}</header><div class="r918-strip">${strip('normal')}</div><strong>${num(p.max_sum)}</strong></button><button type="button" class="r918-candidate wrap ${final&&v.winner==='wrap'?'winner':''} ${invalid?'invalid':''}" data-r918-mode="${wrapValid?'wrap':'cut'}"><header>B · ${wrapReady?t('Toàn mảng − MIN','Whole array − MIN'):t('Tìm MIN','Find MIN')} ${final&&v.winner==='wrap'?'✓':''}</header><div class="r918-strip">${strip(wrapValid?'wrap':'cut')}</div><strong>${invalid?'∅ ✕':num(wrapReady?p.circular_sum:p.min_sum)}</strong>${invalid?`<small>${t('Không được bỏ hết','Cannot remove everything')}</small>`:''}</button></div>
      ${final?`<div class="r918-result"><div>${path}</div><output>= ${num(v.answer)}</output></div>`:''}
      <details class="r918-details"><summary>${t('Biến & công thức','Variables & formula')}</summary><div class="r918-registers">${Object.entries(p).map(([key,value])=>`<span><small>${key}</small><b>${num(value)}</b></span>`).join('')}</div><p>MAX = max(x, MAX + x) · MIN = min(x, MIN + x)</p><p>${t('Không rỗng · mỗi ô chỉ dùng một lần.','Nonempty · use each cell at most once.')}</p></details>
      <nav class="r918-controls">${[['cell',t('Ô tiếp →','Next cell →')],['compare',t('So sánh ↠','Compare ↠')],['result',t('Kết quả ↠','Result ↠')]].map(([kind,title])=>`<button type="button" data-r918-jump="${kind}"${circular918Next(kind)<0?' disabled':''}>${title}</button>`).join('')}</nav>
      <nav class="r918-examples">${[[5,-3,5],[1,-2,3,-2],[-3,-2,-3],[0],[3,-2,2,-3]].map((nums,index)=>`<button type="button" data-r918-example="${index}">[${nums.join(',')}]</button>`).join('')}</nav></section>`;
    host.querySelectorAll('[data-r918-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.r918Mode;draw();}));
    host.querySelectorAll('[data-r918-jump]').forEach(button=>button.addEventListener('click',()=>{const next=circular918Next(button.dataset.r918Jump);if(next<0)return;if(typeof stopPlay==='function')stopPlay();stepIndex=next;renderStep();}));
    host.querySelectorAll('[data-r918-example]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('arrInput').value=[[5,-3,5],[1,-2,3,-2],[-3,-2,-3],[0],[3,-2,2,-3]][Number(button.dataset.r918Example)].join(',');runViz();}));
  }draw();
}
