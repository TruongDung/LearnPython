'use strict';
let layers1526Selection={step:null,id:null};
function renderIncrementLayers1526View(step){
  const v=step.incrementLayers1526View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en,esc=value=>escapeHtml(String(value));
  if(layers1526Selection.step!==step)layers1526Selection={step,id:null};
  const known=v.operations.filter(op=>op.known),selected=known.find(op=>op.id===layers1526Selection.id)??known.at(-1)??null;
  const max=Math.max(1,...v.target),pitch=37,unit=Math.min(28,210/max),left=32,top=28,width=Math.max(280,left+v.target.length*pitch+12),height=max*unit+64;
  const px=index=>left+index*pitch,py=level=>top+(max-level)*unit;
  const palette=['#38bdf8','#a78bfa','#34d399','#fbbf24','#fb7185','#2dd4bf'];
  const units=v.target.flatMap((value,index)=>Array.from({length:value},(_,j)=>{
    const level=j+1,op=v.operations.find(op=>op.level===level&&index>=op.start&&index<=op.end),fresh=op.start===v.current;
    return `<rect class="layer1526-unit ${op.known?'known':'waiting'}${fresh&&op.known?' fresh':''}" data-layer-index="${index}" data-layer-level="${level}" data-layer-owner="${op.id}" x="${px(index)}" y="${py(level)}" width="31" height="${unit-3}" rx="2" style="--layer-color:${palette[op.id%palette.length]}"/>`;
  })).join('');
  const columns=v.target.map((value,index)=>`<g role="button" tabindex="0" data-layers1526-index="${index}" aria-label="target[${index}] = ${value}"><rect class="layer1526-column${index===v.current?' current':''}" x="${px(index)-2}" y="16" width="35" height="${max*unit+22}" rx="5"/><text class="layer1526-value" x="${px(index)+15.5}" y="${py(value)-6}">${value}</text><text class="layer1526-index" x="${px(index)+15.5}" y="${height-5}">${index}</text></g>`).join('');
  const band=selected?`<rect class="layer1526-band" data-selected-operation="${selected.id}" x="${px(selected.start)-2}" y="${py(selected.level)-2}" width="${(selected.end-selected.start)*pitch+35}" height="${unit+1}" rx="3"/>`:'';
  const chart=`<section class="layer1526-card"><header><b>target</b><small>${t('1 lớp liên tục = 1 phép +1','1 continuous layer = 1 increment')}</small></header><div class="layer1526-chart"><svg role="img" aria-label="${t('Các lớp tạo target','Layers forming target')}" viewBox="0 0 ${width} ${height}" style="width:${width}px;height:${height}px"><path class="layer1526-axis" d="M${left-6} ${top+max*unit+3}H${width-6}"/>${units}${columns}${band}</svg></div><div class="layer1526-caption">${t('Bấm cột để tới dòng xét cột đó. Khung xanh: một đoạn được tăng cùng lúc.','Select a column to debug it. Green outline: one subarray increment.')}</div></section>`;
  const rise=Math.max(0,v.delta),change=v.change;
  const formula=v.current===0?`target[0] = ${v.target[0]}`:`max(0, ${v.target[v.current]} − ${v.previous}) = ${rise}`;
  const operation=`<div class="layer1526-comparison"><code>${formula}</code>${v.condition===null?'':`<b class="${v.condition?'yes':'no'}">${v.condition?'True ✓':'False ×'}</b>`}</div><div class="layer1526-equation">${change?`<code>answer</code><strong>${change.before} + ${change.added} = <b>${change.after}</b></strong>`:`<code>answer = ${v.answer}</code><span>${v.contributions[v.current]===null?t('chờ cộng','pending addition')+' +'+rise:'+'+(v.contributions[v.current]??0)}</span>`}</div>`;
  const contributions=`<div class="layer1526-contributions">${v.contributions.map((amount,index)=>`<button type="button" data-layers1526-index="${index}" class="${index===v.current?'current':''}"><small>${index}</small><b>${amount===null?'?':'+'+amount}</b></button>`).join('')}</div>`;
  let replay='<span class="tp-muted">∅ · +0</span>';
  if(selected){
    const position=known.findIndex(op=>op.id===selected.id);
    const before=v.target.map((_,index)=>known.slice(0,position).filter(op=>index>=op.start&&index<=op.end).length);
    const after=before.map((value,index)=>value+(index>=selected.start&&index<=selected.end?1:0));
    const lane=(values,name)=>`<div class="layer1526-replay-row"><small>${name}</small><div>${values.map((value,index)=>`<span class="${index>=selected.start&&index<=selected.end?'inside':''}">${value}</span>`).join('')}</div></div>`;
    replay=`<div class="layer1526-replay-label"><code>[${selected.start}…${selected.end}] +1</code><span>${t('lớp','level')} ${selected.level}</span></div>${lane(before,t('Trước','Before'))}${lane(after,t('Sau','After'))}`;
  }
  const plan=`<section class="layer1526-card"><header><b>${t('Một cách xây target','One way to build target')}</b><small>${known.length} ${t('phép +1','increments')}</small></header><div class="layer1526-operations">${known.map(op=>`<button type="button" data-layers1526-operation="${op.id}" class="${op.id===selected?.id?'selected':''}" aria-pressed="${op.id===selected?.id}"><small>#${op.id+1}</small><code>[${op.start}…${op.end}]</code></button>`).join('')||'<span class="tp-muted">∅</span>'}</div><div class="layer1526-replay">${replay}</div></section>`;
  const presets=[['1,2,3,2,1',t('Ngọn núi','Mountain')],['3,1,5,4,2',t('Hai đỉnh','Two peaks')],['3,3,3,3',t('Bằng nhau','Plateau')],['5,4,3,2,1',t('Giảm dần','Descending')],['0,2,0,2',t('Tách đoạn','Separated spans')]];
  const next=()=>steps.findIndex((frame,index)=>index>stepIndex&&[3,6].includes(frame.incrementLayers1526View?.line));
  host.innerHTML=`<section class="tp-viz layer1526-viz" aria-label="1526 · Subarray increment layers" data-source-line="${v.line}"><header class="tp-head"><div><small>1526 · SUBARRAY INCREMENTS</small><h2>${t('Kéo dài lớp, mở lớp mới','Extend layers, start new ones')}</h2></div><div class="tp-total"><strong>${v.answer}</strong><span>answer</span></div></header>${chart}<section class="layer1526-card">${operation}${contributions}</section>${plan}<div class="tp-debug"><header><b>${t('Dòng','Line')} ${v.line}</b><span>minNumberOperations</span></header><div><code>${esc(v.source)}</code></div></div><nav class="tp-actions">${[['reset',t('Làm lại','Restart')],['line',t('Dòng tiếp','Next line')+' <kbd>F10</kbd>'],['rise',t('Lần cộng tiếp','Next addition')],['last',t('Kết quả','Result')]].map(([action,label])=>`<button type="button" data-layers1526-nav="${action}"${(action==='reset'?stepIndex===0:action==='rise'?next()<0:stepIndex===steps.length-1)?' disabled':''}>${label}</button>`).join('')}</nav><nav class="tp-presets">${presets.map((item,index)=>`<button type="button" data-layers1526-preset="${index}">${item[1]}</button>`).join('')}</nav></section>`;
  const go=index=>{stopPlay();stepIndex=index;renderStep();};
  host.querySelectorAll('[data-layers1526-nav]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.layers1526Nav,index=action==='reset'?0:action==='last'?steps.length-1:action==='line'?Math.min(steps.length-1,stepIndex+1):next();if(index>=0)go(index);}));
  host.querySelectorAll('[data-layers1526-index]').forEach(button=>{
    const act=()=>{const target=Number(button.dataset.layers1526Index),index=steps.findIndex(frame=>frame.incrementLayers1526View?.current===target&&frame.incrementLayers1526View?.line===(target===0?3:5));if(index>=0)go(index);};
    button.addEventListener('click',act);
    if(button.tagName.toLowerCase()==='g')button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();act();}});
  });
  host.querySelectorAll('[data-layers1526-operation]').forEach(button=>button.addEventListener('click',()=>{stopPlay();layers1526Selection.id=Number(button.dataset.layers1526Operation);renderIncrementLayers1526View(step);}));
  host.querySelectorAll('[data-layers1526-preset]').forEach(button=>button.addEventListener('click',()=>{stopPlay();$('arrInput').value=presets[Number(button.dataset.layers1526Preset)][0];runViz();}));
  const chartHost=host.querySelector?.('.layer1526-chart');
  if(chartHost){const center=layers1526Selection.id!==null&&selected?(px(selected.start)+px(selected.end)+31)/2:px(v.current)+15.5;chartHost.scrollLeft=Math.max(0,center-chartHost.clientWidth/2);}
  const operationHost=host.querySelector?.('.layer1526-operations'),activeOperation=operationHost?.querySelector('.selected');
  if(activeOperation)operationHost.scrollTop=Math.max(0,activeOperation.offsetTop-operationHost.clientHeight/2+activeOperation.offsetHeight/2);
}
