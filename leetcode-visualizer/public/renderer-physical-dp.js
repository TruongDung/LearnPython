'use strict';
function physicalDpTools(language){
 const vi=language==='vi',t=(a,b)=>vi?a:b,esc=n=>String(n??'·').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tile=(value,label='',cls='')=>`<span class="pd-tile tone-${(typeof value==='number'?value:String(value).charCodeAt(0)||0)%6} ${cls}"><small>${esc(label)}</small><b>${esc(value)}</b></span>`;
 const row=html=>`<div class="pd-scroll"><div class="pd-row">${html}</div></div>`;
 const panel=(label,html)=>`<section class="pd-panel"><h4>${label}</h4>${html}</section>`;
 const count=(label,value,attr='')=>`<div class="pd-count"><small>${label}</small><strong ${attr}>${esc(value)}</strong></div>`;
 const result=(id,value)=>`<footer class="pd-result" data-physical-result="${esc(value)}"><small>✓ ${t('Kết quả','Result')} · #${id}</small><strong>${esc(value)}</strong></footer>`;
 const shell=(id,html)=>`<section class="pd-scene" data-physical-id="${id}">${html}</section>`;
 return{t,esc,tile,row,panel,count,result,shell};
}
function renderPhysicalDp(v,language){
 const{t,esc,tile,row,panel,count,result,shell}=physicalDpTools(language),x=v.locals||{},id=v.id,args=v.args,plan=v.physicalDp.plan;
 let html='';
 if(id===546){
  const box=(value,label,cls='')=>tile(value,label,'box '+cls).replace('class=',`style="--pd-hue:${value*137.508%360}" class=`);
  const boxes=args[0],valid=Number.isInteger(x.l)&&Number.isInteger(x.r)&&x.l<=x.r;
  html+=panel(t('Xóa t hộp cùng màu liền nhau → t² điểm','Remove t adjacent equal boxes → t² points'),row(boxes.map((n,i)=>box(n,i,valid&&i>=x.l&&i<=x.r?'selected':valid?'muted':'')).join('')));
  if(valid&&!v.final){html+=`<div class="pd-equation">dp(${x.l}, ${x.r}, ${x.k})</div>`;html+=panel(t('k hộp cùng màu đã được gom bên trái','k matching boxes carried on the left'),row(Array.from({length:x.k},()=>box(boxes[x.l],'k','ghost')).join('')+'<b>+</b>'+box(boxes[x.l],x.l,'focus')));html+=`<div class="pd-equation">(${x.k} + 1)² = ${(x.k+1)**2}</div>`;if(Number.isInteger(x.m)&&x.m>x.l&&x.m<=x.r&&boxes[x.m]===boxes[x.l])html+=panel(t('Xóa phần giữa → ghép cùng màu','Clear the gap → join matching colors'),row(box(boxes[x.l],x.l,'focus')+'<strong>← … →</strong>'+box(boxes[x.m],x.m,'focus')));html+=count('res',x.res??v.returned);}
  if(v.final){html+=`<div class="pd-timeline">${plan.map((op,index)=>panel(`${index+1} · ${op.indices.length}² = +${op.points}`,row(op.before.map(i=>box(boxes[i],i,op.indices.includes(i)?'remove':'')).join(''))+'<div class="pd-down">↓</div>'+row(op.after.map(i=>box(boxes[i],i)).join('')||'<b>∅</b>')+`<small class="pd-total">Σ ${op.total}</small>`)).join('')}</div>`;html+=result(id,v.result);}
 }
 if(id===1000){
  const[stones,k]=args,valid=Number.isInteger(x.i)&&Number.isInteger(x.j)&&x.j===x.i+x.length-1;
  html+=panel(`${t('Gộp đúng','Merge exactly')} ${k} ${t('đống liền nhau','adjacent piles')}`,row(stones.map((n,i)=>tile(n,i,valid&&i>=x.i&&i<=x.j?'pile selected':'pile')).join('')));
  html+=`<p class="pd-caption">${t('Mỗi lần giảm','Each merge removes')} ${k-1} ${t('đống','piles')} · (${stones.length} − 1) % (${k} − 1) = ${(stones.length-1)%(k-1)}</p>`;
  if(valid&&!v.final){html+=panel(`[${x.i}…${x.j}]`,row(stones.slice(x.i,x.j+1).map((n,j)=>tile(n,x.i+j,'pile')).join('')));html+=count(`dp[${x.i}][${x.j}]`,x.dp?.[x.i]?.[x.j]);if(v.line===12&&(x.j-x.i)%(k-1)===0)html+=`<div class="pd-equation">+ (${stones.slice(x.i,x.j+1).join(' + ')})</div>`;}
  if(v.final){if(v.result===-1)html+=`<div class="pd-impossible">× ${t('Không thể còn đúng 1 đống','Cannot reach exactly one pile')}</div>`;else html+=`<div class="pd-timeline">${plan.map((op,i)=>panel(`${i+1} · ◉ +${op.cost}`,row(op.before.map(p=>tile(p.value,`${p.left}…${p.right}`,p.left>=op.left&&p.right<=op.right?'pile focus':'pile')).join(''))+'<div class="pd-down">↓</div>'+row(op.after.map(p=>tile(p.value,`${p.left}…${p.right}`,'pile')).join(''))+`<small class="pd-total">Σ ${op.total}</small>`)).join('')}</div>`;html+=result(id,v.result);}
 }
 if(id===1531){
  const[s,k]=args,kept=new Set(plan?.kept||[]);
  html+=panel(t('Xóa ký tự → ghép nhóm → nén','Delete characters → group → compress'),row([...s].map((c,i)=>tile(c,i,v.final?kept.has(i)?'kept':'remove':i===x.i?'focus':'')).join('')));
  if(!v.final){html+=`<div class="pd-counts">${count(t('Lượt xóa còn lại','Deletions left'),x.k_left??k)}${count(t('Nhóm đang mở','Open run'),x.last?x.last+(x.count>1?x.count:''):'∅')}</div>`;if([14,16,18,19,20].includes(v.line))html+=`<div class="pd-counts">${count('× '+t('Xóa','Delete'),x.delete)}${count('✓ '+t('Giữ','Keep'),[16,18,19,20].includes(v.line)?x.keep:undefined)}</div>`;if([1,9,99].includes(x.count))html+=`<p class="pd-caption">${x.last||'a'}${x.count>1?x.count:''} → ${x.last||'a'}${x.count+1} · +1 ${t('ký tự nén','encoded character')}</p>`;}
  else{html+=panel(t('Các ký tự giữ lại','Kept characters'),row(plan.kept.map(i=>tile(s[i],i,'kept')).join('')||'<b>∅</b>'));html+=`<div class="pd-down">↓</div>`+panel(t('Mỗi nhóm thành một mã','Encode each run'),row(plan.runs.map(r=>tile(r.char+(r.count>1?r.count:''),`${r.count} × ${r.char}`,'kept')).join('')||'<b>∅</b>'));html+=`<div class="pd-equation">${esc(plan.compressed||'∅')}</div><p class="pd-caption">× ${plan.deleted.length} / ${k}</p>`+result(id,v.result);}
 }
 if(id===1659){
  const[m,n,I,E]=args,cells=plan?[...plan.cells]:Array(m*n).fill(null);
  if(!plan)for(const frame of v.frames){const f=frame.locals;if(Number.isInteger(f.position)&&f.position>0&&f.position<=m*n&&Number.isInteger(f.mask))cells[f.position-1]=f.mask%3;}
  const preview=!v.final&&Number.isInteger(x.position)&&x.position<m*n&&v.line>=14&&v.line<=20&&v.branch!==false&&x.remaining>0?x.kind:null;
  if(preview)cells[x.position]=preview;
  const person=kind=>kind===1?'<span class="pd-person intro">●<small>−30 / '+t('hàng xóm','neighbor')+'</small></span>':kind===2?'<span class="pd-person extro">☺<small>+20 / '+t('hàng xóm','neighbor')+'</small></span>':'<span class="pd-empty">'+(kind===0?'·':'?')+'</span>';
  html+=`<div class="pd-counts">${count('● '+t('Hướng nội','Introverts'),I)}${count('☺ '+t('Hướng ngoại','Extroverts'),E)}</div>`;
  html+=panel(t('Chỉ tính cạnh trái và trên, mỗi cặp một lần','Count left / above edges, each pair once'),`<div class="pd-grid" style="--pd-cols:${n}">${cells.map((kind,i)=>`<div class="${!v.final&&i===x.position?'focus':''}" data-grid-cell="${i}" data-person="${kind??'pending'}"><small>${Math.floor(i/n)},${i%n}</small>${person(kind)}</div>`).join('')}</div>`);
  if(!v.final){html+=`<div class="pd-counts">${count('gain · '+t('ô đang thử','trial cell'),v.line>=16&&v.line<=20?x.gain:undefined)}${count('answer · '+t('từ trạng thái này','from this state'),x.answer)}</div>`;if(preview)html+=`<div class="pd-equation">${preview===1?'● 120':'☺ 40'} + ${t('ảnh hưởng hai chiều','mutual neighbor effects')}</div>`;}
  else{const Iused=cells.filter(c=>c===1).length,Eused=cells.filter(c=>c===2).length;let effects=0;for(let p=0;p<cells.length;p++)for(const q of[p%n<n-1?p+1:-1,p+n<cells.length?p+n:-1])if(q>=0&&cells[p]&&cells[q])effects+=(cells[p]===1?-30:20)+(cells[q]===1?-30:20);html+=`<div class="pd-equation">${Iused} × 120 + ${Eused} × 40 + (${effects}) = ${v.result}</div>`+result(id,v.result);}
 }
 if(id===887){
  const[K,N]=args,fast=v.physicalDp.approach===2,final=v.final,m=x.m??0,e=x.e??K,f=v.final?N:(x.f??N);let probe=!fast&&!v.final&&v.line>=9&&v.line<=13?x.x:null;
  if(v.final&&N>0){if(fast)probe=Math.min(N,(x.dp?.[m-1]?.[K-1]??0)+1);else if(K===1)probe=1;else for(let q=1;q<=N;q++)if(1+Math.max(x.dp[K-1][q-1],x.dp[K][N-q])===v.result){probe=q;break;}}
  const shown=f>18&&probe?[...new Set([f,f-1,f-2,probe+2,probe+1,probe,probe-1,probe-2,2,1].filter(n=>n>=1&&n<=f))].sort((a,b)=>b-a):Array.from({length:Math.min(f,18)},(_,i)=>f-i);
  html+=`<div class="pd-counts">${count(t('Trứng','Eggs'),K)}${count(t('Tầng','Floors'),N)}</div>`;
  html+=panel(t('Thả ở tầng vàng · vỡ xuống dưới / sống lên trên','Drop at gold floor · broken below / survives above'),`<div class="pd-egg-layout"><div class="pd-tower">${shown.map(floor=>`<div class="${floor===probe?'focus':probe&&floor<probe?'broken':probe&&floor>probe?'survived':''}"><span>${floor}</span><b>${floor===probe?'🥚 ↓':''}</b></div>`).join('')}${f>18?'<div>⋮</div>':''}${!f?'<div>0</div>':''}</div><div class="pd-branches"><div class="broken"><b>◇ ${t('Vỡ','Broken')}</b><span>${Math.max(0,e-1)} ${t('trứng','eggs')}</span><strong>${fast?x.dp?.[Math.max(0,m-1)]?.[Math.max(0,e-1)]??'·':final?x.dp?.[K-1]?.[Math.max(0,(probe??1)-1)]??0:v.line>=10&&v.line<=13?x.broken:'·'}</strong><small>${fast?t('tầng bao phủ','floors covered'):t('lượt còn cần','drops remaining')}</small></div><div class="survived"><b>🥚 ${t('Không vỡ','Survives')}</b><span>${e} ${t('trứng','eggs')}</span><strong>${fast?x.dp?.[Math.max(0,m-1)]?.[e]??'·':final?x.dp?.[K]?.[Math.max(0,N-(probe??0))]??0:v.line>=11&&v.line<=13?x.survived:'·'}</strong><small>${fast?t('tầng bao phủ','floors covered'):t('lượt còn cần','drops remaining')}</small></div></div></div>`);
  if(fast)html+=`<div class="pd-equation">${x.dp?.[Math.max(0,m-1)]?.[Math.max(0,e-1)]??0} + 1 + ${x.dp?.[Math.max(0,m-1)]?.[e]??0} → ${x.dp?.[m]?.[e]??0} ${t('tầng','floors')}</div>`+count(t('Số lượt đã dùng','Moves used'),m);
  else if(!final)html+=count('1 + max('+t('vỡ, không vỡ','broken, survived')+')',v.line>=12&&v.line<=13?x.worst:undefined);
  if(final&&!fast&&N>0)html+=`<div class="pd-equation">1 + max(${x.dp[K-1][Math.max(0,probe-1)]}, ${x.dp[K][N-probe]}) = ${v.result}</div>`;
  if(final)html+=result(id,v.result);
 }
 return shell(id,html);
}
function renderIntervalPhysical(step,language){
 const{t,esc,tile,row,panel,count,result,shell}=physicalDpTools(language);let html='';
 if(step.strangePrinter664View){const v=step.strangePrinter664View,s=v.input.s,i=v.cursors.i,j=v.cursors.j,k=v.cursors.k;
  html+=panel(t('Một lượt in một ký tự lên một đoạn, có thể ghi đè','One turn paints one character across an interval; overwriting is allowed'),row([...s].map((c,p)=>tile(c,p,Number.isInteger(i)&&p>=i&&p<=j?'selected':'')).join('')));
  if(Number.isInteger(k)&&Number.isInteger(j))html+=panel(t('Cùng ký tự → dùng chung lượt in','Matching characters → share a printing turn'),row(tile(s[k],k,'focus')+'<strong>← … →</strong>'+tile(s[j],j,s[k]===s[j]?'focus':'mismatch')));
  if(v.interval){const[a,b]=v.interval;html+=`<div class="pd-counts">${count(t('In riêng','Separate'),v.baseline?.value)}${count(t('Ghép lượt','Merge'),v.candidate?.value)}${count(`dp[${a}][${b}]`,v.computedMask[a][b]?v.dp[a][b]:undefined)}</div>`;}
  if(v.witness){html+=`<div class="pd-timeline">${v.witness.turns.map(turn=>panel(`${turn.turn} · ${t('In','Print')} ${esc(turn.char)} [${turn.left}…${turn.right}]`,row(turn.postCanvas.map((c,p)=>tile(c??'·',p,p>=turn.left&&p<=turn.right?'focus':'')).join('')))).join('')}</div>`;}
  if(v.final)html+=result(664,v.answer);return shell(664,html);
 }
 const v=step.burstBalloons312View,nums=v.input.values,values=v.padded.allocated?v.padded.values:nums;
 html+=panel(t('Chọn quả k để chọc cuối trong đoạn','Choose balloon k to burst last in the interval'),row(values.map((n,i)=>tile(n,v.padded.allocated?i===0||i===values.length-1?'1':i-1:i,`balloon ${i===v.cursor.k?'focus':''} ${v.padded.allocated&&(i===0||i===values.length-1)||i===v.cursor.left||i===v.cursor.right?'boundary':''}`)).join('')));
 if(v.multipliers.product!==null)html+=`<div class="pd-equation">${v.multipliers.values.left} × ${v.multipliers.values.k} × ${v.multipliers.values.right} = ${v.multipliers.product}</div>`;
 html+=`<div class="pd-counts">${count(t('Phần trái','Left part'),v.candidate.leftCoins)}${count(t('Chọc cuối','Last burst'),v.candidate.boundary)}${count(t('Phần phải','Right part'),v.candidate.rightCoins)}</div>`;
 if(v.candidate.total!==null)html+=count(t('Đang thử','Candidate'),v.candidate.total);
 const order=v.reconstruction.burstOrder.originalIndices;let live=nums.map((_,i)=>i),total=0;
 if(order.length){html+=`<div class="pd-timeline">${order.map((id,i)=>{const before=[...live],at=live.indexOf(id),a=at?nums[live[at-1]]:1,b=at<live.length-1?nums[live[at+1]]:1,coins=a*nums[id]*b;live.splice(at,1);total+=coins;return panel(`${i+1} · ${a} × ${nums[id]} × ${b} = +${coins}`,row(before.map(j=>tile(nums[j],j,j===id?'balloon remove':'balloon')).join(''))+'<div class="pd-down">↓</div>'+row(live.map(j=>tile(nums[j],j,'balloon')).join('')||'<b>∅</b>')+`<small class="pd-total">Σ ${total}</small>`);}).join('')}</div>`;}
 if(v.final)html+=result(312,v.answer);return shell(312,html);
}
