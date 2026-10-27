function renderReduceZero1342Pictures(step) {
 const host=$('treeView'),v=step.reduceZero1342View;if(!host||!v)return;
 const t=(vi,en)=>lang==='vi'?vi:en,operation=['subtract','halve','count'].includes(v.action)?v.history.at(-1):null;
 const width=v.num===0&&!operation?1:v.width,cell=Math.min(43,Math.max(25,((host.clientWidth||550)-48)/width)),w=Math.max(200,width*cell+24),left=(w-width*cell)/2;
 const before=operation?operation.before:v.num,after=operation?.after;
 const beforeBits=before.toString(2).padStart(width,'0'),afterBits=operation?after.toString(2).padStart(width,'0'):null;
 const x=i=>left+(i+.5)*cell,rect=(bit,i,y,which)=>{
  const last=i===width-1,changed=last&&operation?.kind==='subtract',dropped=last&&which==='before'&&operation?.kind==='halve';
  return `<g class="r1342-bit ${bit==='0'?'zero':'one'} ${last?'lsb':''} ${changed?'changed':''} ${dropped?'dropped':''}" data-bit-row="${which}" data-bit="${bit}"><rect x="${left+i*cell+2}" y="${y}" width="${cell-4}" height="30" rx="5"/><text x="${x(i)}" y="${y+22}" text-anchor="middle">${bit}</text></g>`;
 };
 const top=[...beforeBits].map((bit,i)=>rect(bit,i,35,'before')).join('');
 const bottom=operation?[...afterBits].map((bit,i)=>rect(bit,i,111,'after')).join(''):'';
 let wires='';
 if(operation?.kind==='halve'){
  wires=Array.from({length:Math.max(0,width-1)},(_,i)=>`<path class="r1342-wire" d="M${x(i)},65L${x(i+1)},111" marker-end="url(#r1342-shift)"/>`).join('');
  wires+=`<path class="r1342-drop" d="M${x(width-1)},65V82M${x(width-1)-4},83L${x(width-1)+4},91M${x(width-1)+4},83L${x(width-1)-4},91"/>`;
 }else if(operation)wires=`<path class="r1342-change-wire" d="M${x(width-1)},65V111" marker-end="url(#r1342-shift)"/>`;
 const bits=`<section class="r1342-binary"><header><small>${t('nhị phân','binary')}</small><small>${operation?.kind==='halve'?'>> 1 = ÷ 2':operation?.kind==='subtract'?'1 → 0':t('bit cuối → chẵn / lẻ','last bit → even / odd')}</small></header><div class="r1342-bit-scroll"><svg width="${w}" height="${operation?169:85}" viewBox="0 0 ${w} ${operation?169:85}" role="img" aria-label="${t('Các bit trước và sau phép toán','Bits before and after the operation')}"><defs><marker id="r1342-shift" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0L5,2.5L0,5Z"/></marker></defs><text class="r1342-bit-caption" x="12" y="14">${operation?t('trước','before'):'num'} = ${before}</text><text class="r1342-bit-index" x="${x(width-1)}" y="29" text-anchor="middle">bit 0</text>${wires}${top}${bottom}${operation?`<text class="r1342-bit-caption" x="12" y="160">num = ${after}</text>`:''}</svg></div></section>`;
 const branch=v.branch,rule=!(v.num===0&&!operation)?`<svg class="r1342-rule" viewBox="0 0 260 134" role="img" aria-label="${t('Bit cuối 0 chia hai; bit cuối 1 trừ một','Last bit zero: divide by two; last bit one: subtract one')}"><text class="r1342-bit-caption" x="130" y="14" text-anchor="middle">num &amp; 1</text><rect class="r1342-root" x="108" y="22" width="44" height="30" rx="7"/><text class="r1342-root-bit" x="130" y="45" text-anchor="middle">${branch??'?'}</text><g class="r1342-choice halve ${branch===0?'active':''}"><path d="M130,52L65,84"/><rect x="25" y="84" width="80" height="29" rx="7"/><text x="65" y="106" text-anchor="middle">÷ 2</text><text class="r1342-choice-label" x="65" y="129" text-anchor="middle">0 · ${t('chẵn','even')}</text></g><g class="r1342-choice subtract ${branch===1?'active':''}"><path d="M130,52L195,84"/><rect x="155" y="84" width="80" height="29" rx="7"/><text x="195" y="106" text-anchor="middle">− 1</text><text class="r1342-choice-label" x="195" y="129" text-anchor="middle">1 · ${t('lẻ','odd')}</text></g></svg>`:'';
 const equation=operation?`<div class="r1342-equation"><b>${operation.before}</b><span class="${operation.kind}">${operation.kind==='halve'?'÷ 2':'− 1'}</span><strong>→</strong><b>${operation.after}</b></div>`:'';
 let dots='';
 if(operation&&operation.before<=24){
  let groups='';
  if(operation.kind==='halve')groups=Array.from({length:operation.before/2},()=>'<span class="r1342-pair"><i></i><i class="removed"></i></span>').join('');
  else groups=Array.from({length:operation.before},(_,i)=>`<i class="${i===operation.before-1?'removed':''}"></i>`).join('');
  dots=`<div class="r1342-dots" aria-label="${operation.before} → ${operation.after}"><div class="r1342-before-dots">${groups}</div><span>↓</span><div class="r1342-after-dots">${Array.from({length:operation.after},()=>'<i></i>').join('')||'<b>0</b>'}</div></div>`;
 }
 const pending=v.history.length>v.count;
 const condition=v.condition?`<div class="r1342-condition"><code>${v.condition.expression}${v.condition.value!==undefined?' = '+v.condition.value:''}</code><b class="${v.condition.result?'r1342-yes':'r1342-no'}">${v.condition.result?'True':'False'}</b></div>`:'';
 const trail=v.history.map(item=>`<article class="r1342-history-item ${item.id>v.count?'pending':''} ${item.id===v.history.length&&operation?'current':''}" data-operation="${item.id}" data-counted="${item.id<=v.count}"><small>#${item.id} ${item.id<=v.count?'✓':'…'}</small><div><b>${item.before}</b><span>→</span><b>${item.after}</b></div><small class="${item.kind}">${item.kind==='halve'?'÷ 2':'− 1'}</small></article>`).join('');
 host.innerHTML=`<section class="r1342-viz"><header><strong>${v.original} → 0</strong><small>${t('sau dòng','after line')} ${v.source.line}</small></header><div class="r1342-metrics"><div class="r1342-number"><small>num</small><strong>${v.num}</strong></div><div class="r1342-count ${v.action==='count'?'changed':''}"><small>steps</small><strong>${v.count}</strong>${pending?'<small class="r1342-pending">+1 …</small>':''}</div></div>${equation}${condition}${rule}${bits}${dots}${v.action==='return'?`<div class="r1342-finish">0 ✓ · ${v.count} ${t('bước','steps')}</div>`:''}${trail?`<section class="r1342-history"><header><b>${t('Các phép toán','Operations')}</b><small>${v.count} ✓</small></header><div>${trail}</div></section>`:''}</section>`;
 const viewport=host.querySelector?.('.r1342-bit-scroll');if(viewport)viewport.scrollLeft=viewport.scrollWidth-viewport.clientWidth;
}
