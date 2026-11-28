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
function renderEggDrop887(v,language){
 const{t,esc,panel,count,result,shell}=physicalDpTools(language),x=v.locals||{},p=v.egg887,[K,N]=v.args,dp=x.dp||[],moves=x.moves;
 const active=(v.line===8&&v.branch===true||v.line===9)&&Number.isInteger(x.i),e=active?x.i:K,oldSame=p.previous[e]??0,oldLower=p.previous[e-1]??0,coverage=dp[K]??0;
 const wrote=active&&v.line===9,newValue=wrote?dp[e]:v.final?dp[K]:null;
 let html=`<header class="egg887-head"><b>${t('Một mảng dp · cập nhật phải → trái','One dp array · update right → left')}</b><span>O(k × moves) · O(k)</span></header><div class="pd-counts">${count(t('Trứng','Eggs'),K)}${count(t('Mục tiêu số tầng','Target floors'),N)}${count('moves',moves)}</div>`;
 html+=panel(t('dp[e] = số tầng tối đa với e trứng','dp[e] = maximum floors with e eggs'),`<div class="egg887-direction">← i = ${K}, …, 1</div><div class="pd-scroll"><div class="egg887-array">${dp.map((value,i)=>`<div class="${active&&i===e?'current':''} ${active&&i===e-1?'read':''} ${p.updated.includes(i)?'updated':'old'} ${i===0?'zero':''}" data-egg-index="${i}" data-egg-value="${value}"><small>🥚 × ${i}</small><b>${value}</b><span>${i===0?'0':p.updated.includes(i)?t('mới','new'):t('cũ','old')}</span></div>`).join('')}</div></div><p class="pd-caption">${t('Đi từ phải sang trái để dp[i−1] còn là giá trị lượt trước.','Right to left keeps dp[i−1] from the previous move.')}</p>`);
 if(active||v.final&&moves>0){
  html+=panel(`${t('Lượt','Move')} ${moves} · ${t('xét','update')} i = ${e}`,`<div class="egg887-coverage"><div class="broken"><b>◇ ${t('Vỡ','Broken')}</b><small>${e-1} ${t('trứng','eggs')}</small><strong data-egg-old-lower="${oldLower}">${oldLower}</strong><span>${t('tầng phía dưới','floors below')}</span><code>dp[${e-1}] ${t('cũ','old')}</code></div><b>+</b><div class="drop"><b>🥚 ↓</b><strong>1</strong><span>${t('tầng thử','test floor')}</span></div><b>+</b><div class="survived"><b>🥚 ${t('Không vỡ','Survives')}</b><small>${e} ${t('trứng','eggs')}</small><strong data-egg-old-same="${oldSame}">${oldSame}</strong><span>${t('tầng phía trên','floors above')}</span><code>dp[${e}] ${t('cũ','old')}</code></div></div><div class="pd-equation" data-egg-new-value="${newValue??'pending'}">1 + ${oldSame} + ${oldLower} ${newValue===null?'→ ?':'= '+newValue}</div><p class="pd-caption">${wrote?'✓ '+t('Chỉ ô i vừa đổi; các ô nhỏ hơn vẫn cũ.','Only cell i changed; smaller indices are still old.'):v.final?t('Hai nhánh dùng năng lực của lượt trước.','Both branches use the previous move’s capacity.'):t('Đang đọc hai ô cũ · chưa ghi dp[i].','Reading two old cells · dp[i] is not written yet.')}</p>`);
 }
 html+=`<section class="egg887-progress"><header><b data-egg-coverage="${coverage}">${coverage}</b><span>/ ${N} ${t('tầng cần phủ','floors to cover')}</span></header><div role="progressbar" aria-valuemin="0" aria-valuemax="${Math.max(1,N)}" aria-valuenow="${Math.min(N,coverage)}"><i style="width:${N?Math.min(100,coverage/N*100):100}%"></i></div><small>${coverage>=N?'✓ '+t('Đủ phủ mục tiêu','Target covered'):t('Chưa đủ → cần thêm lượt','Not enough → another move')}${!p.complete&&coverage>=N?' · '+t('đang hoàn tất vòng for','finishing the for loop'):''}</small></section>`;
 if(p.history.length){const maximum=Math.max(1,...p.history.map(row=>row.coverage));html+=panel(t('Các lượt đã hoàn tất','Completed moves'),`<div class="egg887-history">${p.history.map(row=>`<div data-completed-move="${row.moves}"><b>${row.coverage}</b><i style="height:${10+row.coverage/maximum*60}px"></i><small>${t('Lượt','Move')} ${row.moves}</small></div>`).join('')}</div>`);}
 if(v.final){if(N>0)html+=`<p class="pd-caption">🥚 ↓ ${t('Có thể bắt đầu thả ở tầng','One optimal first drop is floor')} <b data-egg-first-drop="${Math.min(N,oldLower+1)}">${Math.min(N,oldLower+1)}</b></p>`;html+=result(887,v.result);}
 if(typeof steps!=='undefined'&&typeof stepIndex!=='undefined'&&!v.final){const next=steps.findIndex((step,i)=>i>stepIndex&&step.catalogLessonView?.id===887&&step.catalogLessonView.line===8&&step.catalogLessonView.branch===false);if(next>stepIndex)html+=`<button type="button" class="egg887-next" data-iv-step="${next-stepIndex}">${t('Hoàn tất lượt này','Complete this move')} ↓</button>`;}
 return shell(887,html);
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
 if(id===887)return renderEggDrop887(v,language);
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
