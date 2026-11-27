"use strict";
function mathPicture(v,language){
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
  if(x.block!==undefined&&v.line>=8&&v.line<=13)body+=section(t('Mỗi khối có block hoán vị','Each block has block permutations'),row((x.available||[]).map((n,i)=>tile(n,`${i*x.block}…${(i+1)*x.block-1}`,i===x.index&&v.line>=9&&v.line<=11?'current':''))));
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
  body+=section(t('Mỗi bội của power cho thêm một thừa số 5','Each multiple of power supplies another factor of 5'),row([tile(x.power,'power','current'),tile(x.groups,t('Số nhóm đã tính','Computed groups'),'next')]));
  body+=row(h.map(c=>tile('+'+c.groups,`⌊${a[0]} / ${c.power}⌋`,'plus')));
  body+=number(t('Số chữ số 0','Trailing zero count'),x.zeros);
 }else if(v.id===204){
  title=t('Sàng số nguyên tố','Sieve of Eratosthenes');
  const flags=x.prime||Array(a[0]).fill(null),active=v.line>=14?x.value:x.multiple;
  body+=section(t('Chưa gạch = ứng viên · gạch bội số từ p²','Uncrossed = candidate · cross multiples from p²'),`<div class="mp-sieve">${flags.map((prime,i)=>`<div class="${i===x.p&&v.line<14?'current':''} ${i===active?'focus':''} ${prime===false?'crossed':''} ${v.final&&prime&&i>=2?'plus':''}">${prime===false?'<s>'+i+'</s>':i}</div>`).join('')}</div>`);
  body+=row([number('p',x.p),number(t('Bội đang gạch','Current multiple'),x.multiple),number(t('Đã đếm','Counted primes'),x.count)]);
 }else if(v.id===4123){
  title=t('Xét đoạn xóa · chỉ tính hai đầu','Consider a deletion · pay only for endpoints');const nums=a[0],left=x.left,end=x.end,right=x.right;
  body+=section(t('Đoạn đang xét','Current interval'),row(nums.map((n,i)=>tile(n,i,`${i===left||i===end?'current':''} ${i>=left&&i<=right?'next':''}`))));
  if(Number.isInteger(left)&&Number.isInteger(end))body+=equation(`${nums[left]} <b>+</b> ${nums[end]} <b>=</b> ${nums[left]+nums[end]}`);
  for(const[name,label]of[['full',t('Xóa hết đoạn','Delete the whole interval')],['free',t('Cho phép giữ lại','May retain interior items')]])if(Array.isArray(x[name]))body+=section(label,`<div class="mp-scroll"><div class="mp-matrix" style="--mp-cols:${nums.length}">${x[name].flatMap((row,i)=>row.map((n,j)=>`<div class="${i===left&&j===right?'current':''} ${j<i?'unused':''}"><small>${i},${j}</small><b>${esc(n)}</b></div>`)).join('')}</div></div>`);
 }
 const result=v.final?`<footer class="mp-final"><small>✓ ${t('Kết quả','Result')}</small><strong>${fmt(v.result)}</strong></footer>`:'';
 return `<section class="mp-scene" data-math-id="${v.id}"><h3>${title}</h3>${body}${result}</section>`;
}
function renderMathReplay(step){const host=$('treeView');if(host)host.innerHTML=mathPicture(step.mathReplayView,typeof lang==='undefined'?'en':lang);}
