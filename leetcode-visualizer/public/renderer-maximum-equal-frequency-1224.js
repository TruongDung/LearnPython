'use strict';
let ef1224Selection={step:null,value:null};
function renderEqualFreq1224View(step){
  const v=step.equalFreq1224View,host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en,esc=value=>escapeHtml(String(value));
  if(ef1224Selection.step!==step)ef1224Selection={step,value:null};
  const record=v.history.find(item=>item.length===v.length),ready=Boolean(record);
  const remove=ready?(ef1224Selection.value??record.remove??v.x):null;
  const after=ready?v.counts.map(item=>({...item,amount:item.amount-(item.value===remove?1:0)})):[];
  const remaining=after.filter(item=>item.amount>0),equal=ready&&new Set(remaining.map(item=>item.amount)).size<=1;
  const maximum=Math.max(1,...v.counts.map(item=>item.amount)),unit=Math.min(24,150/maximum);
  function bars(items,isAfter=false){
    return `<div class="ef1224-bars" style="--unit:${unit}px">${items.map(item=>{
      const chosen=item.value===remove,active=item.value===v.x;
      return `<${isAfter?'div':'button'} ${isAfter?'':'type="button"'} ${isAfter?'':`data-ef1224-remove="${item.value}"${ready?'':' disabled'}`} style="--digits:${String(item.value).length}" class="ef1224-column${active?' current':''}${chosen?' chosen':''}${item.amount===0?' empty':''}" title="${item.value} · ${item.amount}" aria-label="${item.value}: ${item.amount}${isAfter?'':t(' · thử xoá một ô',' · try removing one cell')}"><strong>${item.amount}</strong><span class="ef1224-stack">${Array.from({length:maximum},(_,index)=>{const level=maximum-index,filled=level<=item.amount,cut=!isAfter&&chosen&&level===item.amount;return `<i class="${filled?'filled':''}${cut?' cut':''}">${cut?'×':''}</i>`;}).join('')}</span><code>${item.value}</code></${isAfter?'div':'button'}>`;
    }).join('')||'<span class="tp-muted">∅</span>'}</div>`;
  }
  const prefix=`<div class="ef1224-prefix">${v.nums.map((value,index)=>{const item=v.history.find(item=>item.length===index+1);return `<button type="button" data-ef1224-prefix="${index+1}" class="${v.length===index+1?'current':''}${index<(v.answer??0)?' best':''}${item?item.valid?' valid':' invalid':''}" title="prefix ${index+1}"><small>${index+1}</small><b>${value}</b><span>${item?item.valid?'✓':'×':'·'}</span></button>`;}).join('')}</div>`;
  const frequency=`<section class="ef1224-card ef1224-frequency"><header><b>freq[f]</b><small>${t('số cột cao f','columns of height f')}</small></header><div>${v.frequencies.map(item=>`<div data-ef1224-frequency="${item.frequency}" class="${item.amount?'':'zero'}"><code>f = ${item.frequency}</code><strong>${item.amount}</strong><span>${Array.from({length:item.amount},()=>`<i style="--f:${item.frequency}"></i>`).join('')||'∅'}</span></div>`).join('')||'<span class="tp-muted">∅</span>'}</div></section>`;
  const samples=[[1,1,1],[2,2,1],[2,2,3]],caseKeys=['once','single','tallest'];
  const labels=[t('Mỗi cột cao 1','Every column is 1'),t('Bỏ một cột cao 1','Drop a singleton'),t('Bớt cột cao nhất','Trim the tallest')];
  const cases=`<div class="ef1224-cases">${samples.map((heights,index)=>`<button type="button" data-ef1224-case="${18+index}" class="${v.line===18+index?'current':''}${v.checks[caseKeys[index]]===true?' passed':v.checks[caseKeys[index]]===false?' failed':''}"><header><b>${index+1}</b><strong>${v.checks[caseKeys[index]]===null?'…':v.checks[caseKeys[index]]?'✓':'×'}</strong></header><span class="ef1224-mini">${heights.map((height,c)=>`<span>${Array.from({length:height},(_,level)=>`<i class="${c===2&&level===height-1?'cut':''}">${c===2&&level===height-1?'×':''}</i>`).join('')}</span>`).join('')}</span><small>${labels[index]}</small></button>`).join('')}</div>`;
  const bucket=f=>v.frequencies.find(item=>item.frequency===f)?.amount??0;
  let operation;
  if(v.change){const a=v.change;operation=`<code>${esc(a.name)}</code><span>${a.before}${a.added===undefined?' → ':a.added<0?' − 1 = ':' + 1 = '}<b>${a.after}</b></span>`;}
  else if(v.line===18)operation=`<code>max_freq = ${v.maxFreq}</code><span>${v.maxFreq} == 1 <b>${v.checks.once?'True':'False'}</b></span>`;
  else if(v.line===19)operation=`<code>freq[1] = ${bucket(1)}</code><span>${v.maxFreq} × ${bucket(v.maxFreq)} + 1 == ${v.length} <b>${v.checks.single?'True':'False'}</b></span>`;
  else if(v.line===20)operation=`<code>freq[${v.maxFreq}] = ${bucket(v.maxFreq)}</code><span>${v.maxFreq-1} × ${bucket(v.maxFreq-1)} + ${v.maxFreq} == ${v.length} <b>${v.checks.tallest?'True':'False'}</b></span>`;
  else if(v.line===21)operation=`<code>all_once or drop_single or trim_tallest</code><b class="${record.valid?'yes':'no'}">${record.valid?'True ✓':'False ×'}</b>`;
  else operation=`<code>length = ${v.length}</code><code>max_freq = ${v.maxFreq??'—'}</code>${[13,14].includes(v.line)?`<span>${t('Đang chuyển nhóm','Moving between buckets')}</span>`:''}`;
  const inspection=ready?`<section class="ef1224-card"><header><b>${t('Xoá thử','Try removing')} ${remove} · −1</b><strong class="${equal?'yes':'no'}">${equal?'✓':'×'}</strong></header>${bars(after,true)}<div class="ef1224-caption">${remaining.length?t(equal?'Các cột còn lại bằng nhau':'Các cột còn lại chưa bằng nhau',equal?'Remaining columns are equal':'Remaining columns differ'):t('∅ · Xoá phần tử duy nhất vẫn hợp lệ','∅ · Removing the only element is valid')}</div></section>`:`<section class="ef1224-card ef1224-wait"><b>−1</b><span>${t('Chờ kiểm tra prefix','Waiting for prefix check')}</span></section>`;
  const presets=[['2,2,1,1,5,3,3,5',t('Prefix tốt nhất: 7','Best prefix: 7')],['1,1,2,2',t('Bằng nhau vẫn loại','Equal is not enough')],['1,1,2,2,3,3,3',t('Một cột dư 1','One extra cell')],['1,2,3,4',t('Mỗi số một lần','All distinct')],['4,4,4,4',t('Chỉ một giá trị','One distinct value')]];
  const next=line=>steps.findIndex((frame,index)=>index>stepIndex&&frame.equalFreq1224View?.line===line);
  host.innerHTML=`<section class="tp-viz ef1224-viz" aria-label="1224 · Equal frequency after one deletion" data-source-line="${v.line}"><header class="tp-head"><div><small>1224 · MAXIMUM EQUAL FREQUENCY</small><h2>${t('Xoá một ô, cân bằng cột','Remove one cell, equalize columns')}</h2></div><div class="tp-total"><strong>${v.answer??'—'}</strong><span>${t('prefix tốt nhất','best prefix')}</span></div></header><header class="ef1224-prefix-label"><code>nums[0…length−1]</code><button type="button" data-ef1224-best${v.answer?'':' disabled'}>${t('Xem prefix tốt nhất','View best prefix')}</button></header>${prefix}
    <div class="ef1224-pictures"><section class="ef1224-card"><header><b>count[x]</b><small>${t('1 ô = 1 lần xuất hiện','1 cell = 1 occurrence')}</small></header>${bars(v.counts)}<div class="ef1224-caption">${ready?t('Bấm cột để thử xoá đúng một ô.','Select a column to remove exactly one cell.'):[13,14].includes(v.line)?t('Đang cập nhật count và freq.','Updating count and freq.'):t('Các cột của prefix đang xét.','Columns for the current prefix.')}</div></section>${inspection}</div>
    ${frequency}${cases}<div class="ef1224-operation">${operation}</div><div class="tp-debug"><header><b>${t('Dòng','Line')} ${v.line}</b><span>maxEqualFreq</span></header><div><code>${esc(v.source)}</code>${v.condition===null?'':`<b>${v.condition?'True':'False'}</b>`}</div></div>
    <nav class="tp-actions">${[['reset',t('Làm lại','Restart')],['line',t('Dòng tiếp','Next line')+' <kbd>F10</kbd>'],['prefix',t('Prefix tiếp','Next prefix')],['last',t('Kết quả','Result')]].map(([action,label])=>`<button type="button" data-ef1224-nav="${action}"${(action==='reset'?stepIndex===0:action==='prefix'?next(21)<0:stepIndex===steps.length-1)?' disabled':''}>${label}</button>`).join('')}</nav><nav class="tp-presets">${presets.map((item,index)=>`<button type="button" data-ef1224-preset="${index}">${item[1]}</button>`).join('')}</nav></section>`;
  const go=index=>{stopPlay();stepIndex=index;renderStep();};
  host.querySelectorAll('[data-ef1224-nav]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.ef1224Nav,index=action==='reset'?0:action==='last'?steps.length-1:action==='line'?Math.min(steps.length-1,stepIndex+1):next(21);if(index>=0)go(index);}));
  host.querySelectorAll('[data-ef1224-prefix]').forEach(button=>button.addEventListener('click',()=>{const length=Number(button.dataset.ef1224Prefix),index=steps.findIndex(frame=>frame.equalFreq1224View?.line===21&&frame.equalFreq1224View.length===length);if(index>=0)go(index);}));
  host.querySelectorAll('[data-ef1224-best]').forEach(button=>button.addEventListener('click',()=>{const index=steps.findIndex(frame=>frame.equalFreq1224View?.line===22&&frame.equalFreq1224View.length===v.answer);if(index>=0)go(index);}));
  host.querySelectorAll('[data-ef1224-case]').forEach(button=>button.addEventListener('click',()=>{const line=Number(button.dataset.ef1224Case),length=v.length||1,index=steps.findIndex(frame=>frame.equalFreq1224View?.line===line&&frame.equalFreq1224View.length===length);if(index>=0)go(index);}));
  host.querySelectorAll('[data-ef1224-remove]').forEach(button=>button.addEventListener('click',()=>{stopPlay();ef1224Selection.value=Number(button.dataset.ef1224Remove);renderEqualFreq1224View(step);}));
  host.querySelectorAll('[data-ef1224-preset]').forEach(button=>button.addEventListener('click',()=>{stopPlay();$('arrInput').value=presets[Number(button.dataset.ef1224Preset)][0];runViz();}));
  const prefixHost=host.querySelector?.('.ef1224-prefix'),prefixActive=prefixHost?.querySelector('.current');
  if(prefixActive)prefixHost.scrollLeft=Math.max(0,prefixActive.offsetLeft-prefixHost.clientWidth/2+prefixActive.offsetWidth/2);
  const bucketHost=host.querySelector?.('.ef1224-frequency > div');
  const bucketTarget=v.line===19?1:v.line===13?v.old:v.line===15?v.counts.find(item=>item.value===v.x)?.amount:v.maxFreq;
  const activeBucket=bucketHost?.querySelector(`[data-ef1224-frequency="${bucketTarget}"]`);
  if(activeBucket)bucketHost.scrollLeft=Math.max(0,activeBucket.offsetLeft-bucketHost.clientWidth/2+activeBucket.offsetWidth/2);
  host.querySelectorAll('.ef1224-bars').forEach(chart=>{const active=chart.querySelector(ready?'.chosen':'.current');if(active)chart.scrollLeft=Math.max(0,active.offsetLeft-chart.clientWidth/2+active.offsetWidth/2);});
}
