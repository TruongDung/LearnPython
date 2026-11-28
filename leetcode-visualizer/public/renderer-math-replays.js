"use strict";
// Backtrack only completed, executed DP tables. Indices stay in the original
// array so repeated values cannot change which endpoint an operation removes.
function deletion4123Plan(nums,full,free){
 const pairs=[],cost=(table,l,r,empty=0)=>l>r?empty:table[l][r];
 function visit(l,r,optional){
  if(l>r||optional&&l===r)return;
  if(optional&&free[l][r]===free[l+1][r]){visit(l+1,r,true);return;}
  for(let e=l+1;e<=r;e++){
   if(optional){
    if(free[l][r]===full[l][e]+cost(free,e+1,r)){visit(l,e,false);visit(e+1,r,true);return;}
   }else if(full[l][r]===nums[l]+nums[e]+cost(free,l+1,e-1)+cost(full,e+1,r)){
    visit(l+1,e-1,true);visit(e+1,r,false);pairs.push([l,e]);return;
   }
  }
  throw new Error('No matching executed deletion state');
 }
 visit(0,nums.length-1,false);
 let remaining=nums.map((_,i)=>i),total=0;
 return pairs.map(([left,end])=>{
  const start=remaining.indexOf(left),stop=remaining.indexOf(end),before=[...remaining];
  if(start<0||stop<=start)throw new Error('Invalid deletion endpoints');
  const removed=remaining.splice(start,stop-start+1),charge=nums[left]+nums[end];total+=charge;
  return {before,removed,after:[...remaining],left,end,charge,total};
 });
}
function deletion4123Picture(v,language){
 const vi=language==='vi',t=(a,b)=>vi?a:b,nums=v.args[0],x=v.locals||{};
 const esc=value=>String(value??'·').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const value=n=>esc(n===Infinity?'∞':n),sum=(...terms)=>terms.every(Number.isFinite)?terms.reduce((a,b)=>a+b,0):'∞';
 const optional=v.line>=15&&v.line<=18,phase=v.final?'done':optional?'free':'full';
 const l=x.left,r=x.right,interval=Number.isInteger(l)&&Number.isInteger(r)&&r===l+x.length-1&&r<nums.length;
 const selecting=interval&&(v.line>=11&&v.line<=14||v.line>=16&&v.line<=18);
 const end=selecting&&Number.isInteger(x.end)&&x.end>l&&x.end<=r?x.end:null;
 const cells=(indices,style=()=>'',symbol=()=>'',small=false)=>`<div class="del4123-scroll"><div class="del4123-rail ${small?'compact':''}">${indices.length?indices.map(i=>`<div class="del4123-cell ${style(i)}" data-original-index="${i}"><small>${i}</small><b>${esc(nums[i])}</b><span>${esc(symbol(i))||'&nbsp;'}</span></div>`).join('<i aria-hidden="true">—</i>'):`<div class="del4123-empty">∅ <small>${t('Rỗng','Empty')}</small></div>`}</div></div>`;
 const panel=(label,html)=>`<section class="del4123-panel"><h4>${label}</h4>${html}</section>`;
 const part=(label,n,cls)=>`<div class="del4123-part ${cls}"><small>${label}</small><b>${value(n)}</b></div>`;
 let body='';
 if(v.final){
  const plan=deletion4123Plan(nums,x.full,x.free);
  body+=`<div class="del4123-summary"><span>${t('Xóa hết mảng','Delete the entire array')}</span><strong>${plan.length} <small>${t('lần xóa','deletions')}</small></strong></div>`;
  body+=`<div class="del4123-plan">${plan.map((op,index)=>`<section class="del4123-operation" data-deletion-operation="${index}" data-cost="${op.charge}"><header><b>${index+1}</b><span>${t('Chỉ trả phí hai đầu','Pay only for the endpoints')}</span><strong>${esc(nums[op.left])} + (${esc(nums[op.end])}) = <em>${op.charge}</em></strong></header>${cells(op.before,i=>i===op.left||i===op.end?'endpoint removed':op.removed.includes(i)?'removed':'kept',i=>i===op.left||i===op.end?'◎':op.removed.includes(i)?'×':'✓',true)}<div class="del4123-down" aria-hidden="true">↓ <span>${t('Xóa → nối lại','Delete → join')}</span></div>${cells(op.after,()=> 'kept',()=> '✓',true)}<footer>${t('Tổng','Total')} <b>${op.total}</b></footer></section>`).join('')}</div>`;
  body+=`<footer class="mp-final" data-deletion-result="${value(v.result)}"><small>✓ ${t('Chi phí nhỏ nhất','Minimum cost')}</small><strong>${value(v.result)}</strong></footer>`;
 }else{
  body+=`<div class="del4123-stages"><span class="${optional?'':'active'}">① ${t('Xóa hết đoạn','Delete all')}</span><span class="${optional?'active':''}">② ${t('Có thể giữ lại','May keep items')}</span></div>`;
  const mode=i=>!interval?'':i<l||i>r?'outside':end!==null?(optional?i<=end?'deleting':'tail':i===l||i===end?'endpoint':i<end?'inside':'tail'):optional&&v.line===15&&i===l?'kept':'selected';
  const symbol=i=>end!==null&&i>=l&&i<=r?optional?(i<=end?'×':'…'):i===l||i===end?'◎':i<end?'…':'→':optional&&v.line===15&&i===l?'✓':'';
  body+=panel(interval?`${t('Đoạn','Interval')} [${l}…${r}] · ${r-l+1} ${t('số','items')}`:t('Chọn một đoạn dài ít nhất 2','Choose at least two adjacent items'),cells(nums.map((_,i)=>i),mode,symbol));
  if(end!==null){
   body+=`<div class="del4123-legend">${optional?`<span class="red">× ${t('Xóa hết','Delete all')}</span>`:`<span class="gold">◎ ${t('Hai đầu trả phí','Paid endpoints')}</span><span class="blue">… ${t('Bên trong: có thể xóa trước','Inside: may delete first')}</span>`}<span class="purple">→ ${t('Phần đuôi','Tail')}</span></div>`;
   if(optional){
    body+=`<div class="del4123-parts">${part(`full[${l}][${end}]`,x.full[l][end],'red')}${part(`free[${end+1}][${r}]`,v.line>=17?x.tail:undefined,'purple')}</div>`;
   }else{
    body+=`<div class="del4123-parts">${part(`${nums[l]} + (${nums[end]})`,nums[l]+nums[end],'gold')}${part(t('Bên trong','Inside'),v.line>=12?x.inside:undefined,'blue')}${part(t('Đuôi','Tail'),v.line>=13?x.tail:undefined,'purple')}</div>`;
   }
   const ready=optional?v.line>=17:v.line>=13;
   if(ready){
    const candidate=optional?sum(x.full[l][end],x.tail):sum(nums[l],nums[end],x.inside,x.tail),table=optional?'free':'full',committed=optional?v.line===18:v.line===14;
    const before=committed?(v.oldValues?.[table]?.[l]?.[r]??x[table][l][r]):x[table][l][r];
    body+=`<div class="del4123-compare" data-deletion-candidate="${value(candidate)}">${part(t('Đang thử','Trying'),candidate,'blue')}<span>${committed?'→ min':'vs'}</span>${part(committed?t('Đã giữ','Stored best'):t('Tốt nhất đang có','Best so far'),x[table][l][r],'green')}${committed?`<small>${value(before)} → ${value(x[table][l][r])}</small>`:''}</div>`;
   }
  }else if(optional&&v.line===15){
   body+=`<div class="del4123-keep">✓ ${t('Giữ lại ô đầu · xét phần còn lại','Keep the first item · consider the rest')}<b>free[${l}][${r}] ← ${value(x.free[l][r])}</b></div>`;
  }else body+=`<p class="del4123-caption">◎ + ◎ = ${t('phí xóa · các ô ở giữa không cộng thêm','deletion cost · interior items add no extra charge')}</p>`;
  if(interval&&x.full&&x.free){
   body+=`<div class="del4123-states">${part(`full[${l}][${r}] · ${t('xóa hết','delete all')}`,x.full[l][r],'red')}${part(`free[${l}][${r}] · ${t('có thể giữ','may keep')}`,x.free[l][r],'blue')}</div>`;
   body+=`<details class="del4123-table"><summary>${t('Bảng DP','DP tables')}</summary>${['full','free'].map(name=>`<h4>${name}</h4><div class="mp-scroll"><div class="mp-matrix" style="--mp-cols:${nums.length}">${x[name].flatMap((row,i)=>row.map((n,j)=>`<div class="${i===l&&j===r?'current':''} ${j<i?'unused':''}"><small>${i},${j}</small><b>${value(n)}</b></div>`)).join('')}</div></div>`).join('')}</details>`;
  }
 }
 return `<section class="mp-scene del4123" data-math-id="4123" data-deletion-phase="${phase}"><h3>${t('Xóa đoạn · tính phí hai đầu','Delete a segment · pay its endpoints')}</h3>${body}</section>`;
}
function mathPicture(v,language){
 if(v.id===4123)return deletion4123Picture(v,language);
 const vi=language==='vi',t=(a,b)=>vi?a:b,x=v.locals||{},a=v.args,h=v.history||[];
 const esc=n=>String(n??'·').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=n=>typeof n==='number'?(Number.isFinite(n)?Math.abs(n)!==0&&(Math.abs(n)>=1e9||Math.abs(n)<0.0001)?n.toExponential(5):Number(n.toPrecision(9)):String(n)):esc(n);
 const tile=(top,bottom,cls='')=>`<div class="mp-tile ${cls}"><b>${esc(top)}</b><small>${esc(bottom)}</small></div>`;
 const row=items=>`<div class="mp-row">${items.join('')}</div>`;
 const number=(label,value,cls='')=>`<div class="mp-number ${cls}"><small>${label}</small><strong>${fmt(value)}</strong></div>`;
 const equation=html=>`<div class="mp-equation">${html}</div>`;
 const section=(label,html)=>`<section class="mp-panel"><h4>${label}</h4>${html}</section>`;
 let title='',body='';
 if(v.id===13){
  title=t('La Mã → số nguyên','Roman → integer');const map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000},done=new Map(h.map(c=>[c.index,c]));
  body=section(t('Nhìn hai ký tự kề nhau','Compare neighboring symbols'),row([...a[0]].map((letter,i)=>tile(letter,map[letter],`${i===x.i?'current':''} ${i===x.i+1?'next':''} ${done.has(i)?done.get(i).delta<0?'minus':'plus':''}`))));
  if(x.current!==undefined&&v.line>=8&&v.line<=12)body+=equation(x.following?`<span>${x.current}</span><b>${x.subtract?'&lt;':'≥'}</b><span>${x.following}</span><b>→</b><strong class="${x.subtract?'minus':'plus'}">${x.subtract?'−':'+'}${x.current}</strong>`:`${t('Ký tự cuối','Last symbol')} → <b class="plus">+${x.current}</b>`);
  body+=number(t('Tổng đang có','Running total'),x.result);
  body+=row(h.map(c=>tile((c.delta>0?'+':'')+c.delta,c.symbol,c.delta<0?'minus':'plus')));
 }else if(v.id===29){
  title=t('Gấp đôi nhóm → trừ dần','Double groups → subtract');const total=Math.abs(a[0]),remain=x.remaining;
  body=equation(`<span>${a[0]}</span><b>÷</b><span>${a[1]}</span>`);
  if(remain!==undefined){body+=section(t('Phần còn lại','Remaining dividend'),`<div class="mp-bar"><i style="width:${total?remain/total*100:0}%"></i><strong>${remain}</strong></div>`);body+=row([tile(x.unit,t('Một nhóm','One group'),'next'),tile(x.block,t('Khối đang thử','Trial block'),'current'),tile(x.copies,t('Số nhóm','Group count'))]);}
  if(v.oldValues.block!==undefined)body+=equation(`${v.oldValues.block} <b>× 2 →</b> ${x.block}`);
  body+=section(t('Các khối đã trừ','Removed blocks'),row(h.map(c=>tile('−'+c.block,'+'+c.copies+' '+t('nhóm','groups'),'plus'))));
  body+=row([number(t('Thương','Quotient'),x.quotient),number(t('Dư','Remainder'),remain)]);
  if(x.negative)body+=equation(`− ${t('Hai số khác dấu','Opposite input signs')}`);
 }else if(v.id===50){
  title=t('Bình phương nhanh','Exponentiation by squaring');body=equation(`<span>${fmt(a[0])}<sup>${a[1]}</sup></span>`);
  if(x.n!==undefined)body+=section(t('Xét bit cuối của số mũ','Inspect the exponent’s last bit'),row([...Math.abs(x.n).toString(2)].map((bit,i,all)=>tile(bit,all.length-1-i,i===all.length-1?'current':''))));
  body+=row([number(t('Cơ số hiện tại','Current base'),x.x,'next'),number(t('Kết quả đang giữ','Accumulator'),x.result,'plus'),number(t('Số mũ còn lại','Remaining exponent'),x.n)]);
  if(v.oldValues.x!==undefined)body+=equation(`${fmt(v.oldValues.x)} <b>${v.source.includes('1 / x')?'→ 1/x':'× '+fmt(v.oldValues.x)+' →'}</b> ${fmt(x.x)}`);
  if(v.oldValues.n!==undefined&&x.n>=0)body+=equation(`${v.oldValues.n} <b>→</b> ${x.n}`);
  body+=section(t('Các lần đã nhân vào kết quả','Committed multiplications'),row(h.map(c=>tile('× '+fmt(c.base),'= '+fmt(c.after),'plus'))));
 }else if(v.id===60){
  title=t('Chọn theo khối giai thừa','Choose factorial blocks');body=equation(`n = ${a[0]} <b>·</b> k = ${a[1]}`);
  body+=section(t('Các chữ số còn lại','Available digits'),row((x.available||[]).map((n,i)=>tile(n,i,i===x.index&&v.line>=9&&v.line<=11?'current':''))));
  if(x.block!==undefined&&v.line>=8&&v.line<=11)body+=section(t('Mỗi khối có block hoán vị','Each block has block permutations'),row((x.available||[]).map((n,i)=>tile(n,`${i*x.block}…${(i+1)*x.block-1}`,i===x.index&&v.line>=9&&v.line<=11?'current':''))));
  body+=row([number(t('Thứ tự từ 0','Zero-based rank'),x.rank),number(t('Cỡ khối','Block size'),x.block),number(t('Khối chọn','Chosen block'),x.index)]);
  body+=section(t('Tiền tố đã ghép','Committed prefix'),row([...(x.answer||'')].map(c=>tile(c,'✓','plus'))));
 }else if(v.id===166){
  title=t('Chia dài · nhớ số dư','Long division · remember remainders');body=equation(`${a[0]} <b>÷</b> ${a[1]}`);
  const text=x.answer||'',start=text.indexOf('(');body+=`<div class="mp-decimal">${start<0?esc(text):esc(text.slice(0,start))+'<mark>'+esc(text.slice(start))+'</mark>'}</div>`;
  body+=row([number(t('Số chia','Divisor'),x.b),number(t('Số dư hiện tại','Current remainder'),x.remainder),number(t('Chữ số vừa tính','Current digit'),x.digit)]);
  const seen=x.seen?.__pairs__||Object.entries(x.seen||{});body+=section(t('Dư → vị trí · trùng dư thì lặp','Remainder → position · repeats start a cycle'),row(seen.slice(0,18).map(([remainder,position])=>tile(remainder,'→ '+position,Number(remainder)===x.remainder?'current':''))));
  body+=section(t('Các chữ số đã chia','Committed division digits'),row(h.slice(-12).map(c=>tile(c.digit,`${c.scaled} ÷ ${x.b}`,'plus'))));
 }else if(v.id===168){
  title=t('Số cột → chữ · giảm 1 trước','Column → letters · subtract 1 first');
  body+=row([number(t('Số đang chia','Current number'),x.n),number(t('Phần dư 0…25','Remainder 0…25'),x.digit)]);
  body+=section('0 → A · 25 → Z',row(Array.from({length:26},(_,i)=>tile(String.fromCharCode(65+i),i,v.line>=6&&v.line<=9&&i===x.digit?'current':''))));
  if(v.oldValues.n!==undefined)body+=equation(`${v.oldValues.n} <b>${v.source.includes('n -=')?'− 1 →':'÷ 26 →'}</b> ${x.n}`);
  body+=section(t('Chữ đã lấy · đảo lại để đọc','Collected letters · reverse to read'),row((x.letters||[]).map(c=>tile(c,'←','plus'))));
 }else if(v.id===171){
  title=t('Chữ cột → số · nhân 26 rồi cộng','Column → number · multiply by 26, then add');body+=section(t('Giá trị chữ','Letter values'),row([...a[0]].map((c,i)=>tile(c,c.charCodeAt(0)-64,i===x.index?'current':''))));
  body+=row([number(t('Đang giữ','Accumulator'),x.answer),number(t('Sau × 26','After × 26'),x.shifted),number(t('Chữ hiện tại','Current letter value'),x.digit)]);
  if(x.shifted!==undefined&&v.line>=5)body+=equation(`${fmt(x.shifted)} <b>+</b> ${x.digit} ${v.line>=6?'<b>=</b> '+fmt(x.answer):''}`);
 }else if(v.id===172){
  title=t('Số 0 tận cùng · đếm thừa số 5','Trailing zeroes · count factors of 5');body+=equation(`2 × 5 = 10 <b>→</b> …0`);
  body+=section(t('Mỗi bội của power cho thêm một thừa số 5','Each multiple of power supplies another factor of 5'),row([tile(x.power,'power','current'),tile(x.groups,x.groups===undefined?'groups':`⌊${a[0]} / ${v.line===6||v.line===7?x.power:h.at(-1)?.power??x.power}⌋`,'next')]));
  body+=row(h.map(c=>tile('+'+c.groups,`⌊${a[0]} / ${c.power}⌋`,'plus')));
  body+=number(t('Số chữ số 0','Trailing zero count'),x.zeros);
 }else if(v.id===204){
  title=t('Sàng số nguyên tố','Sieve of Eratosthenes');
  const flags=x.prime||Array(a[0]).fill(null),active=v.line>=14?x.value:x.multiple;
  body+=section(t('Chưa gạch = ứng viên · gạch bội số từ p²','Uncrossed = candidate · cross multiples from p²'),`<div class="mp-sieve">${flags.map((prime,i)=>`<div class="${i===x.p&&v.line<14?'current':''} ${i===active?'focus':''} ${prime===false?'crossed':''} ${v.final&&prime&&i>=2?'plus':''}">${prime===false?'<s>'+i+'</s>':i}</div>`).join('')}</div>`);
  body+=row([number('p',x.p),number(t('Bội đang gạch','Current multiple'),x.multiple),number(t('Đã đếm','Counted primes'),x.count)]);
 }
 const result=v.final?`<footer class="mp-final"><small>✓ ${t('Kết quả','Result')}</small><strong>${fmt(v.result)}</strong></footer>`:'';
 return `<section class="mp-scene" data-math-id="${v.id}"><h3>${title}</h3>${body}${result}</section>`;
}
function renderMathReplay(step){const host=$('treeView');if(host)host.innerHTML=mathPicture(step.mathReplayView,typeof lang==='undefined'?'en':lang);}
