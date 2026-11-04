'use strict';
class SubarrayOr3171Visualizer {
  constructor({host,language='en'}){this.host=host;this.language=language;}
  t(vi,en){return this.language==='vi'?vi:en;}
  bits(value,target,width){return Array.from({length:width},(_,i)=>{const bit=width-i-1,on=value!==null&&!!(value&(1<<bit));return `<span class="sor3171-bit ${on?'on':''} ${value!==null&&!!(target&(1<<bit))?'target':''}" data-bit="${bit}" data-on="${value===null?'pending':on}"><small>${bit}</small><b>${value===null?'·':on?'1':'0'}</b></span>`;}).join('');}
  render(step){
    const v=step.subarrayOr3171View;if(!v)return;
    const t=(vi,en)=>this.t(vi,en),esc=escapeHtml,width=Math.max(1,Math.max(v.k,...v.nums).toString(2).length),candidate=v.candidate,best=v.bestWindow;
    const names=['Suffix OR','Brute force','In-place','Bit counts','Prefix + BS','Sparse + BS','Tree + BS'];
    const window=v.queryWindow??(Number.isInteger(v.left)&&Number.isInteger(v.right)&&v.left>=0&&v.left<=v.right?{left:v.left,right:v.right}:null);
    const array=(values,label,working=false)=>`<div class="sor3171-array-label">${label}</div><div class="sor3171-array sor3171-window" tabindex="0" role="region" aria-label="${label}">${values.map((value,i)=>`<span class="sor3171-number ${window&&window.left<=i&&i<=window.right?'inside':''} ${v.right===i?'right':''} ${working&&value!==v.nums[i]?'changed':''}"><small>[${i}]</small><b>${value}</b>${i===v.left?'<i>L</i>':i===v.right?'<i>R</i>':'<i> </i>'}</span>`).join('')}</div>`;
    const bitRow=(label,value)=>`<div class="sor3171-bit-row" data-bit-row="${label}" data-bit-value="${value??'pending'}"><small>${label}</small><div class="sor3171-bits">${this.bits(value,v.k,width)}</div><b>${value??'…'}</b></div>`;
    let op=v.bitOperation,proof=false;
    if(candidate&&v.event==='evaluate'&&op?.value!==candidate.value){
      const a=v.nums.slice(candidate.left,candidate.right).reduce((value,num)=>value|num,0);
      op={a,b:v.nums[candidate.right],value:candidate.value,kind:'OR',line:v.line};proof=true;
    }
    const bitFormula=op?`${op.a} ${op.kind==='CLEAR'?'& ~':'|'} ${op.b} = ${op.value}`:'OR |';
    const bitDiagram=`<section class="sor3171-panel"><header><b>${bitFormula}</b><small>${proof?`[${candidate.left}…${candidate.right}] · ${t('OR của đoạn đã so','evaluated subarray OR')}`:op?`L${op.line} · ${t('phép tính gần nhất','latest operation')}`:''}</small></header><div class="sor3171-bit-scroll" tabindex="0" role="region" aria-label="${t('Các bit của phép tính','Bit operation')}">${op?bitRow('a',op.a)+bitRow(op.kind==='CLEAR'?'mask':'b',op.b)+bitRow('=',op.value):bitRow('OR',null)}${bitRow('k',v.k)}</div></section>`;
    const evaluation=candidate?`<div class="sor3171-evaluation" data-evaluated-window="${candidate.left},${candidate.right}" data-evaluated-or="${candidate.value}"><small>${t('Đã so','Evaluated')} [${candidate.left}…${candidate.right}]</small><b>|${candidate.value} − ${v.k}| = <strong>${candidate.difference}</strong></b></div>`:'';
    const result=`<footer class="sor3171-result"><small>${v.final?t('ĐÁP ÁN','ANSWER'):t('Tốt nhất','Best')}</small><strong data-best="${v.best??'pending'}">${v.best??'…'}</strong>${best?`<span>[${best.left}…${best.right}] · OR ${best.value}</span>`:''}</footer>`;
    let details='';
    if(v.method===1){
      const states=(values,current)=>values.length?values.map(item=>{const value=current?item[0]:item.value,left=current?item[1]:item.left;return `<span data-suffix-or="${value}"><b>${value}</b><small>[${left}…${current?v.right:item.right}]</small></span>`;}).join(''):'<i>∅</i>';
      details=`<section class="sor3171-panel"><header><b>OR suffix</b><small>${t('Gộp OR trùng','Merge duplicate ORs')}</small></header><small>suffix_ors</small><div class="sor3171-states">${states(v.candidates,false)}</div><small>current</small><div class="sor3171-states">${states(v.current,true)}</div></section>`;
    }
    if(v.method===3)details=`<section class="sor3171-panel">${array(v.work,t('nums · cập nhật tại chỗ','nums · in-place updates'),true)}</section>`;
    if(v.method===4&&v.counts){
      details=`<section class="sor3171-panel"><header><b>counts[bit]</b><small>window_or = ${v.windowOr}</small></header><div class="sor3171-counts" tabindex="0" role="region" aria-label="counts">${[...v.counts].reverse().map((count,i)=>{const bit=v.counts.length-1-i;return `<span class="${count?'on':''} ${bit===v.bit?'active':''}" data-count-bit="${bit}" data-count="${count}"><small>b${bit}</small><b>${count}</b></span>`;}).join('')}</div><small>count = 0 → ${t('tắt bit','clear bit')}</small></section>`;
    }
    if(v.method>=5&&v.lo!==null){details+=`<section class="sor3171-panel"><header><b>Binary search · r</b><small>${t('r tăng → OR không giảm','r grows → OR never decreases')}</small></header><div class="sor3171-bounds">${[['lo',v.lo],['mid',v.mid],['hi',v.hi]].map(([name,value])=>`<div><small>${name}</small><b>${value??'…'}</b></div>`).join('')}</div>${v.condition!==null?`<b class="sor3171-direction">value &lt; k → ${v.condition?'lo →':'← hi'}</b>`:''}</section>`;}
    if(v.method===5&&v.prefix){
      const a=window?.left,b=window?window.right+1:null;
      details+=`<section class="sor3171-panel"><header><b>prefix[:, ${v.prefixBit}]</b><small>bit ${v.prefixBit}</small></header><div class="sor3171-counts" tabindex="0" role="region" aria-label="prefix">${Array.from({length:v.nums.length+1},(_,i)=>`<span class="${i===a||i===b?'active':''}" data-prefix-index="${i}" data-prefix-value="${v.prefix[i]??'pending'}"><small>[${i}]</small><b>${v.prefix[i]??'·'}</b></span>`).join('')}</div>${a!==undefined&&b!==null&&v.prefix[a]!==undefined&&v.prefix[b]!==undefined?`<code>${v.prefix[b]} − ${v.prefix[a]} = ${v.prefix[b]-v.prefix[a]} → bit ${v.prefix[b]>v.prefix[a]?'1':'0'}</code>`:''}</section>`;
    }
    if(v.method===6&&v.table){
      const query=v.queryWindow;
      details+=`<section class="sor3171-panel"><header><b>Sparse table</b><small>OR(A) | OR(B)</small></header>${v.table.map((row,level)=>`<div class="sor3171-table-row"><small>2^${level}</small><div class="sor3171-counts">${row.map((value,i)=>`<span data-sparse-level="${level}" data-sparse-start="${i}" data-sparse-value="${value}" title="[${i},${i+2**level-1}]"><small>[${i}]</small><b>${value}</b></span>`).join('')}</div></div>`).join('')}${query&&v.block?['A','B'].map((name,i)=>{const left=i===0?query.left:query.right-v.block+1;return `<div class="sor3171-blockline"><small>${name}</small>${v.nums.map((num,j)=>`<span class="${left<=j&&j<left+v.block?'included':''}">${num}</span>`).join('')}</div>`;}).join(''):''}</section>`;
    }
    if(v.method===7&&v.tree){
      const levels=Math.log2(v.size)+1,digits=Math.max(...v.tree).toString().length,box=Math.max(34,digits*7+8),treeWidth=Math.max(280,(this.host.clientWidth||600)-52,v.size*(box+8));
      const xy=i=>{const depth=Math.floor(Math.log2(i));return{x:(i-2**depth+.5)*treeWidth/2**depth,y:26+depth*62};};
      const nodes=v.tree.slice(1).map((value,j)=>{const i=j+1,p=xy(i);return `<g class="sor3171-node ${v.queryNodes.includes(i)?'selected':''}" data-segment-node="${i}" data-segment-value="${value}"><rect x="${p.x-box/2}" y="${p.y-16}" width="${box}" height="32" rx="7"/><text x="${p.x}" y="${p.y+4}" text-anchor="middle">${value}</text><text class="index" x="${p.x}" y="${p.y+28}" text-anchor="middle">[${i}]</text></g>`;}).join('');
      const edges=v.tree.slice(2).map((_,j)=>{const i=j+2,a=xy(Math.floor(i/2)),b=xy(i);return `<path class="sor3171-edge" d="M${a.x} ${a.y+16}L${b.x} ${b.y-16}"/>`;}).join('');
      details+=`<section class="sor3171-panel"><header><b>Segment tree · OR</b><small>${t('Node vừa gộp','Last combined nodes')}: ${v.queryNodes.join(', ')||'…'}</small></header><div class="sor3171-tree-scroll" tabindex="0" role="region" aria-label="Segment tree"><svg style="width:${treeWidth}px" viewBox="0 0 ${treeWidth} ${levels*62}" role="img" aria-label="Segment tree OR">${edges}${nodes}</svg></div></section>`;
    }
    this.host.innerHTML=`<section class="sor3171-viz" data-method="${v.method}" aria-label="3171 Subarray OR"><header class="sor3171-heading"><b>#3171 · ${names[v.method-1]}</b><small>${t('Dòng','Line')} ${v.line}</small></header><div class="sor3171-methods">${names.map((name,i)=>`<button type="button" data-or-method="${i+1}" aria-pressed="${v.method===i+1}">${i+1} ${name}</button>`).join('')}</div><div class="sor3171-presets"><button type="button" data-or-preset="0">|OR − k| = 0</button><button type="button" data-or-preset="1">${t('OR trùng','Duplicate ORs')}</button><button type="button" data-or-preset="2">30 bits</button><button type="button" data-or-first>${t('So đầu tiên','First comparison')}</button></div>${array(v.nums,'input · nums')}${result}${evaluation}${bitDiagram}${details}<code class="sor3171-source">${esc(v.source)}</code>${v.frames.length>1?`<small class="sor3171-scope">${v.frames.map(esc).join(' → ')}${v.returning?` → ${v.returned}`:''}</small>`:''}</section>`;
    const scroll=this.host.querySelector?.('.sor3171-tree-scroll');if(scroll)scroll.scrollLeft=Math.max(0,(scroll.scrollWidth-scroll.clientWidth)/2);
    this.host.querySelectorAll?.('button').forEach(button=>button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')event.stopPropagation();}));
    this.host.querySelectorAll?.('[data-or-method]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('[data-param="approach"]').value=button.dataset.orMethod;runViz();}));
    this.host.querySelectorAll?.('[data-or-preset]').forEach(button=>button.addEventListener('click',()=>{const presets=[[[1,2,4,5],6],[[1,3,1,3],2],[[536870912,1,2],536870914]],chosen=presets[Number(button.dataset.orPreset)];$('arrInput').value=chosen[0].join(',');document.querySelector('[data-param="k"]').value=chosen[1];runViz();}));
    this.host.querySelectorAll?.('[data-or-first]').forEach(button=>button.addEventListener('click',()=>{const index=steps.findIndex(s=>s.subarrayOr3171View?.event==='evaluate');if(index>=0){stepIndex=index;renderStep();}}));
  }
}
function renderSubarrayOr3171View(step){new SubarrayOr3171Visualizer({host:$('treeView'),language:lang}).render(step);}
