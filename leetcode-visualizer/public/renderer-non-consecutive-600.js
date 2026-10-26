function nc600Overview(view) {
  if(view.n<=31)return Array.from({length:view.n+1},(_,value)=>({value,bits:value.toString(2).padStart(view.bits.length,'0'),valid:!value.toString(2).includes('11')}));
  const values=new Set();
  for(const group of view.groups)for(const word of group.samples)if(values.size<8)values.add(parseInt(word,2));
  if(!view.bits.includes('11')&&values.size<8)values.add(view.n);
  return [...values].map(value=>({value,bits:value.toString(2).padStart(view.bits.length,'0'),valid:true}));
}

function renderNonConsecutive600View(step) {
  const view=step.nonConsecutive600View;
  if(!view)return;
  const host=$('treeView'),t=(vi,en)=>lang==='vi'?vi:en;
  const {n,bits,phase,position,total,f,groups,cutAt,line,event,answer,condition}=view;
  const width=Math.max(220,(host.clientWidth||550)-24),done=phase==='done';
  const preparing=phase==='prepare'||phase==='setup';
  const index=position??0,r=bits.length-index-1,prefix=bits.slice(0,index);
  const compact=word=>word.length>7?'…'+word.slice(-6):word||'∅';
  const binary=(word,active=-1,invalid=false,forceBad=false)=>[...word].map((bit,i)=>`<b class="nc600-bit ${i===active?'active':''} ${forceBad||invalid&&bit==='1'&&(word[i-1]==='1'||word[i+1]==='1')?'bad':''}">${bit}</b>`).join('');
  const child=(x,y,word,caption,status)=>`<g class="nc600-choice ${status}" transform="translate(${x},${y})"><rect x="-47" width="94" height="61" rx="8"/><text class="nc600-pattern" y="25" text-anchor="middle">${compact(word)}</text><text class="nc600-small" y="48" text-anchor="middle">${caption}</text>${status==='blocked'?'<path class="nc600-cross" d="M-40 5L40 55M40 5L-40 55"/>':''}</g>`;
  const fork=(root,left,right)=>`<svg class="nc600-scene" viewBox="0 0 ${width} 157" role="img" aria-label="${root}; ${left.word}: ${left.caption}; ${right.word}: ${right.caption}"><text class="nc600-root" x="${width/2}" y="20" text-anchor="middle">${compact(root)}</text><path class="nc600-wire" d="M${width/2},29L${width/4},70M${width/2},29L${width*3/4},70"/><text class="nc600-small" x="${width/3}" y="48" text-anchor="middle">0</text><text class="nc600-small" x="${width*2/3}" y="48" text-anchor="middle">1</text>${child(width/4,77,left.word,left.caption,left.status)}${child(width*3/4,77,right.word,right.caption,right.status)}</svg>`;
  let scene='',detail='',samples='';
  const currentGroup=groups.find(group=>group.position===index);
  if(preparing){
    const length=view.length??1;
    const a=length===1?1:f[length-1],b=length===1?1:f[length-2];
    const initialized=f.length>0;
    scene=fork(`${length} bit`,{word:length===1?'0':'0'+'·'.repeat(Math.min(4,length-1)),caption:initialized?String(a):'✓',status:initialized?'counted':''},{word:length===1?'1':'10'+'·'.repeat(Math.min(3,length-2)),caption:initialized?String(b):'✓',status:initialized?'counted':''});
    if(initialized){
      detail=`<div class="nc600-sum"><b>${a}</b><span>+</span><b>${b}</b><span>=</span><strong>${f[length]??'?'}</strong></div><div class="nc600-f-strip">${f.map((value,k)=>`<span class="${k===length?'target':k===length-1||k===length-2?'source':''}"><small>f[${k}]</small><b>${value}</b></span>`).slice(-4).join('')}${f[length]===undefined?`<span class="target"><small>f[${length}]</small><b>?</b></span>`:''}</div>`;
    }
  }else if(!done){
    const one=bits[index]==='1',blocked=cutAt===index;
    const amount=f[r];
    const leftCaption=one?(currentGroup?`+${amount}`:event==='bit-loop-enter'?'?':`${amount} ${t('mẫu','patterns')}`):t('theo n','follow n');
    scene=fork(prefix,{word:prefix+'0'+'·'.repeat(Math.min(3,r)),caption:leftCaption,status:currentGroup?'counted':!one?'following':''},{word:prefix+'1'+'·'.repeat(Math.min(3,r)),caption:!one?'> n':blocked?'11 ×':t('theo n','follow n'),status:!one||blocked?'blocked':'following'});
    if(currentGroup){
      samples=`<div class="nc600-samples"><small>${currentGroup.prefix}${'·'.repeat(Math.min(4,currentGroup.remaining))} · +${currentGroup.count}</small><div>${currentGroup.samples.map(word=>`<span class="nc600-witness"><span>${binary(compact(word))}</span><small>${parseInt(word,2)}</small></span>`).join('')}${currentGroup.count>6?`<small>+${currentGroup.count-6}</small>`:''}</div></div>`;
    }
    if(view.addition)detail=`<div class="nc600-sum" aria-live="polite"><b>${view.addition.before}</b><span>+</span><b>${view.addition.amount}</b><span>=</span><strong>${view.addition.after}</strong></div>`;
    if(event==='check-prev'||view.change){
      const before=view.change?.before??view.prev,after=view.change?.after??Number(bits[index]);
      detail=`<div class="nc600-register ${cutAt===index?'bad':''}"><span><small>prev</small><b>${before}</b></span><em>${view.change?'←':'·'}</em><span><small>bit</small><b>${after}</b></span>${cutAt===index?'<strong>11 ×</strong>':''}</div>`;
    }
  }
  const input=`<section class="nc600-input"><small>n = ${n}${position!==null?` · i = ${position}`:''}</small><div>${[...bits].map((bit,i)=>`<span class="nc600-indexed-bit"><small>${i}</small>${binary(bit,i===position&&event!=='bit-loop-exit'?0:-1,false,(phase==='cut'||done&&cutAt!==null)&&bit==='1'&&(bits[i-1]==='1'||bits[i+1]==='1'))}</span>`).join('')}</div></section>`;
  const key=`${n}:${view.frame}`;
  if(host._nc600Key!==key)host._nc600Value=n;
  const chosen=host._nc600Value;
  let result='';
  if(done){
    const valid=!chosen.toString(2).includes('11');
    const equation=groups.map(group=>group.count).concat(cutAt===null?[1]:[]);
    result=`<section class="nc600-results"><header><strong>${n<=31?t('0 → n','0 → n'):t('Ví dụ','Examples')}</strong><span>✓ / × 11</span></header><div class="nc600-numbers">${nc600Overview(view).map(item=>`<button type="button" class="nc600-number ${item.valid?'valid':'invalid'}" data-nc600-value="${item.value}" aria-pressed="${item.value===chosen}" aria-label="${item.value}: ${item.bits}${item.valid?' ✓':' × 11'}"><span class="nc600-number-bits">${binary(compact(item.bits),-1,!item.valid)}</span><span><b>${item.value}</b> ${item.valid?'✓':'×'}</span></button>`).join('')}</div><div class="nc600-proof" aria-live="polite"><span>${chosen} =</span><div>${binary(chosen.toString(2).padStart(bits.length,'0'),-1,true)}</div><strong class="${valid?'valid':'invalid'}">${valid?'✓':'× 11'}</strong></div><div class="nc600-return"><small>return ${cutAt===null?'total + 1':'total'}</small><div class="nc600-sum">${equation.map((value,k)=>`${k?'<span>+</span>':''}<b>${value}</b>`).join('')}<span>=</span><strong>${answer}</strong></div></div></section>`;
  }
  const contributions=groups.length?`<div class="nc600-groups">${groups.map(group=>`<span class="${group.position===index?'active':''}"><code>${compact(group.prefix+'·'.repeat(Math.min(4,group.remaining)))}</code><b>+${group.count}</b></span>`).join('')}</div>`:'';
  const titles={
    'set-bits':t('n → nhị phân','n → binary'),'seed-f':'f = [1, 2]',
    'f-loop-enter':t('Chuẩn bị ô mới','Next pattern count'),'append-f':t('Cộng 2 ô trước','Add previous two counts'),
    'f-loop-exit':t('Đủ bảng f','f table ready'),'initialize-scan':'total = 0 · prev = 0',
    'bit-loop-enter':t('Chọn bit','Select bit'),'set-remaining':`remaining = ${view.remaining}`,
    'check-bit':t('Kiểm tra bit','Check bit'),'add-group':t('Cộng cả nhánh','Count whole branch'),
    'check-prev':t('Có tạo 11?','Creates 11?'),'set-prev':t('Lưu bit vừa xét','Remember this bit'),
    'bit-loop-exit':t('Đã quét hết','Scan complete'),'return-cut':t(`Trả về ${answer}`,`Return ${answer}`),'return-valid':t(`Trả về ${answer}`,`Return ${answer}`),
  };
  const table=!preparing?`<details class="nc600-table"><summary>f[r]</summary><div>${f.map((value,k)=>`<span class="${k===view.remaining?'active':''}"><small>${k} bit</small><b>${value}</b></span>`).join('')}</div></details>`:'';
  host.innerHTML=`<section class="nc600-viz" style="--nc600-cell:${n>31?112:68}px"><header><strong>${titles[event]??''}</strong><span class="nc600-line">${t('Dòng','Line')} ${line}</span></header>${input}${condition?`<div class="nc600-condition ${condition.result?'yes':'no'}"><code>${condition.expression}</code><b>${condition.result?'True ✓':'False ×'}</b></div>`:''}${scene}${samples}${detail}${contributions}${result}<div class="nc600-total"><small>total</small><b>${total??'—'}</b></div>${table}</section>`;
  host._nc600Key=key;host._nc600Step=step;host._nc600Width=host.clientWidth;
  host.querySelectorAll?.('[data-nc600-value]').forEach(button=>button.addEventListener('click',()=>{
    const value=Number(button.dataset.nc600Value);host._nc600Value=value;
    renderNonConsecutive600View(host._nc600Step);
    [...host.querySelectorAll('[data-nc600-value]')].find(item=>Number(item.dataset.nc600Value)===value)?.focus({preventScroll:true});
  }));
  if(typeof ResizeObserver!=='undefined'&&!host._nc600Observer){
    host._nc600Observer=new ResizeObserver(()=>{if(host.querySelector('.nc600-viz')&&host.clientWidth!==host._nc600Width)renderNonConsecutive600View(host._nc600Step);});
    host._nc600Observer.observe(host);
  }
}
