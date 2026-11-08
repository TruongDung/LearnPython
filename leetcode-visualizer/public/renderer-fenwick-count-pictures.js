'use strict';
const FC_CASES = {
  775: [ [[1,0,2],{},'Liền kề','Adjacent only'], [[1,2,0],{},'Nghịch thế ở xa','Distant inversion'], [[0],{},'Một phần tử','One value'], [[0,1,2,3],{},'Đã sắp xếp','Already sorted'] ],
  1395: [ [[2,5,3,4,1],{},'Ví dụ','Example'], [[2,1,3],{},'Không có đội','No team'], [[1,2,3,4],{},'Tăng dần','Increasing'], [[4,3,2,1],{},'Giảm dần','Decreasing'] ],
  1505: [ ['4321',{k:4},'Kéo chữ số nhỏ lên','Pull a smaller digit'], ['100',{k:1},'Số 0 ở đầu','Leading zero'], ['36789',{k:1000},'Dư ngân sách','Large budget'], ['4321',{k:0},'k = 0','k = 0'] ],
  2179: [ [[2,0,1,3],{nums2:'[0,1,2,3]'},'Ví dụ','Example'], [[4,0,1,3,2],{nums2:'[4,1,0,2,3]'},'Hai thứ tự','Two orders'], [[0,1,2,3],{nums2:'[3,2,1,0]'},'Đảo ngược','Reversed'], [[0,1,2,3],{nums2:'[0,1,2,3]'},'Cùng thứ tự','Same order'] ],
  2250: [ ['[[1,2],[2,3],[2,5]]',{points:'[[1,1],[2,3]]'},'Ví dụ','Example'], ['[[1,1],[2,2],[3,3]]',{points:'[[1,1],[2,2],[3,3],[4,4]]'},'Điểm trên biên','Boundary points'], ['[[4,1],[1,4],[3,3]]',{points:'[[2,2],[4,1],[1,4]]'},'Rộng và cao','Width and height'], ['[[2,2],[2,2]]',{points:'[[2,2]]'},'Hai hình trùng','Duplicate rectangles'] ],
  2519: [ [[2,3,6,5,2,3],{k:2},'Ví dụ','Example'], [[1,1,1],{k:1},'Bằng nhau không tính','Equals excluded'], [[1,3,2],{k:1},'Một chỉ số','One index'], [[1,2,3,4],{k:1},'Thiếu bên phải','Missing right side'] ],
  4051: [ [[1,2,1],{goal:4,k:1},'Hai miền','Two tails'], [[2,-1,3],{goal:2,k:2},'Có số âm','Negative values'], [[0,0,0],{goal:0,k:1},'Prefix trùng','Repeated prefixes'], [[1,-1,2],{goal:3,k:0},'k = 0','k = 0'] ],
  4055: [ [[3,1,4,2,5],{},'Ví dụ','Example'], [[6,7,8,9],{},'Bị chắn','Blocked pairs'], [[2,2,3,3],{},'Giá trị trùng','Equal values'], [[5,1,4,2,6],{},'Hai nhánh','Two halves'] ],
  2426: [ [[3,2,5],{nums2:'[2,2,1]',diff:1},'Ví dụ','Example'], [[3,-1],{nums2:'[-2,2]',diff:-1},'diff âm','Negative diff'], [[2,2,2],{nums2:'[1,1,1]',diff:0},'Dấu ≤','Inclusive ≤'], [[1,2,3],{nums2:'[0,0,0]',diff:10},'Đếm hết','All pairs'] ],
  1649: [ [[1,5,6,2],{},'Chèn vào giữa','Insert between'], [[1,3,3,3,2,4,2,1,2],{},'Có phần tử bằng','Equal elements'], [[1,2,3,4],{},'Tăng dần','Increasing'], [[2,2,2],{},'Bằng nhau','All equal'] ],
  1409: [ [[3,1,2,1],{m:5},'Ví dụ','Example'], [[4,1,2,2],{m:4},'Hỏi lại phần tử đầu','Query front again'], [[7,5,5,8,3],{m:8},'Hoán vị lớn hơn','Larger permutation'], [[1],{m:1},'Một phần tử','One element'] ],
};
function fcEsc(v) { return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fcFmt(v) { return v === null || v === undefined ? '—' : typeof v === 'boolean' ? v ? 'True' : 'False' : typeof v === 'object' ? JSON.stringify(v) : String(v); }
function fcCard(title, body, hint = '', cls = '') { return `<section class="tr-card ${cls}"><header><b>${title}</b><small>${hint}</small></header>${body}</section>`; }
function fcStrip(name, values, current = null, classes = {}, button = '') {
  return fcCard(fcEsc(name), `<div class="fc-strip" data-fc-scroll="${fcEsc(name)}" data-native-array="${fcEsc(name)}" data-array-values="${fcEsc(JSON.stringify(values ?? null))}" tabindex="0">${values ? values.map((value,i)=>`<${button?'button type="button"':'span'} class="fc-tile ${current===i?'is-current':''} ${classes[i]??''}" ${button?`data-fc-${button}="${i}"`:''}><small>[${i}]</small><b>${fcEsc(fcFmt(value))}</b></${button?'button':'span'}>`).join('') || '[]' : '—'}</div>`);
}
function fcStat(name,value,cls='') { return `<div class="fc-stat ${cls}"><code>${name}</code><strong>${fcEsc(fcFmt(value))}</strong></div>`; }
function fcArrow() { return '<i class="fc-arrow">→</i>'; }
function fcDifference(v,vi) {
  const x=v.context,d=x.differences;
  return fcCard('nums1 − nums2 → d',`<div class="fc-strip fc-differences" data-fc-scroll="differences" tabindex="0">${v.nums.map((a,i)=>`<button type="button" data-fc-item="${i}" class="${i===v.current?'is-current':''}"><small>[${i}]</small><span>${a}</span><i>−</i><span>${v.nums2[i]}</span><i>↓</i><b>${d&&i<d.length?d[i]:'·'}</b></button>`).join('')}</div><div class="fc-formula"><code>d[i] ≤ d[j] + diff</code><span>i &lt; j</span></div>`,vi?'Hiệu được tạo sau từng dòng append':'Differences appear after each append');
}
function fcRanks(v,vi) {
  if (!v.coordinates) return '';
  const x=v.context,s=v.scratch, counts=new Map();
  for(const i of v.members){const value=v.id===4051?x.prefix[i]:v.id===2426?x.differences[i]:v.id===2179?x.mapped[i]:v.id===2250?v.nums[i][1]:v.nums[i];counts.set(value,(counts.get(value)??0)+1);}
  return fcCard(vi?'Giá trị → rank → tần suất':'Value → rank → frequency',`<div class="fc-strip" data-fc-scroll="ranks" tabindex="0">${v.coordinates.map((value,i)=>{
    const match=v.id===4051?(s.low!==undefined&&value<=s.low)||(s.high!==undefined&&value>=s.high):v.id===2426?s.threshold!==undefined&&value<=s.threshold:false;
    return `<div class="fc-rank ${match?'is-counted':''}"><small>rank ${i+1}</small><b>${value}</b><div class="fc-dots">${Array.from({length:counts.get(value)??0},()=>'<i>●</i>').join('')||'<i class="is-muted">○</i>'}</div><small>× ${counts.get(value)??0}</small></div>`;
  }).join('')}</div>`,vi?'● = một phần tử sau khi add() hoàn tất':'● = one member after add() completes');
}
function fcFenwick(v,vi) {
  if(!v.tree)return fcCard('Fenwick',`<div class="fc-placeholder">${vi?'Chưa khởi tạo':'Not initialized'}</div>`);
  const tree=v.tree,n=tree.length-1,h=v.helper,w=Math.max(360,n*70+40),pitch=70,x=i=>20+(i-.5)*pitch,
    level=i=>Math.log2(i&-i),maxLevel=Math.floor(Math.log2(Math.max(1,n))),y=i=>40+(maxLevel-level(i))*52,height=105+maxLevel*52;
  const nodes=tree.slice(1).map((value,j)=>{const i=j+1,active=h?.path.includes(i),cursor=h?.cursor===i,changed=v.change?.kind==='write'&&v.change.index===i;
    return `<g class="fc-node ${active?'is-path':''} ${cursor?'is-current':''} ${changed?'is-write':''}" data-fc-node="${i}" role="button" tabindex="0" aria-label="tree[${i}] = ${value}" data-native-node="${i}" data-native-value="${value}"><rect x="${x(i)-24}" y="${y(i)-18}" width="48" height="36" rx="9"/><text x="${x(i)}" y="${y(i)+5}">${value}</text><text class="fc-node-id" x="${x(i)}" y="${y(i)+33}">[${i}]</text></g>`;}).join('');
  const edges=tree.slice(1).map((_,j)=>{const i=j+1,p=i+(i&-i);return p<=n?`<path class="fc-parent" d="M${x(i)},${y(i)-19}L${x(p)},${y(p)+19}"/>`:'';}).join('');
  const intervals=tree.slice(1).map((_,j)=>{const i=j+1,lo=i-(i&-i)+1;return `<div class="fc-coverage ${h?.path.includes(i)?'is-path':''}" style="grid-column:${lo} / ${i+1}" title="tree[${i}] covers ranks ${lo}…${i}"><small>[${i}]</small><span>${lo}…${i}</span></div>`;}).join('');
  const query=h?`<div class="fc-helper"><span class="fc-badge ${h.kind==='add'?'is-update':''}">${h.kind==='add'?h.delta>0?'ADD +1':'REMOVE −1':h.kind==='kth'?'KTH':'QUERY'}</span><code>${fcEsc(h.purpose)}</code><div class="fc-path" data-helper-path="${h.path.join(',')}">${[h.start,...h.path.filter((node,i)=>i>0||node!==h.start)].map(node=>`<span>${node}</span>`).join(fcArrow())}${h.kind==='query'&&h.result!==null?`${fcArrow()}<b>Σ = ${h.result}</b>`:''}</div><div class="fc-stats">${h.kind==='query'?fcStat('total',h.total)+fcStat('index',h.cursor):h.kind==='kth'?fcStat('index',h.cursor)+fcStat('step',h.jump)+fcStat('order',h.order)+fcStat('return rank',h.result):fcStat('index',h.cursor)+fcStat('delta',h.delta)}</div></div>`:'';
  const write=v.change?.kind==='write'?`<div class="fc-formula is-update"><code>tree[${v.change.index}]</code><span>${fcFmt(v.change.before)} ${v.change.delta>0?'+':'−'} ${Math.abs(v.change.delta)}</span><i>=</i><b>${v.change.after}</b></div>`:'';
  const hint=v.id===1505?vi?'tree đếm các vị trí gốc đã lấy':'tree counts removed original slots':vi?'Mỗi thanh bên dưới = đoạn rank do nút đó quản lý':'Each bar below = the rank interval owned by that node';
  return fcCard(vi?'Fenwick · giá trị thật trong tree':'Fenwick · actual tree values',`${query}<div class="fc-svg-scroll" data-fc-scroll="fenwick" tabindex="0"><svg class="fc-tree" width="${w}" height="${height}" viewBox="0 0 ${w} ${height}" role="group">${edges}${nodes}</svg><div class="fc-coverages" style="width:${w}px;grid-template-columns:repeat(${n},70px)">${intervals}</div></div>${write}<div class="fc-legend"><span>□ tree[i]</span><span class="is-query">● ${vi?'đã đọc':'read'}</span><span class="is-update">● ${vi?'vừa đổi':'changed'}</span><span>lowbit(i) = i &amp; −i</span></div>`,hint);
}
function fcPrefix(v,vi) {
  const x=v.context,s=v.scratch;
  if(v.k===0)return fcCard('k = 0',`<div class="fc-formula"><span>|sum − ${v.goal}| ≥ 0</span><b>✓ ${vi?'Mọi đoạn con':'Every subarray'}</b></div><div class="fc-triangle">${v.nums.map((_,i)=>`<div>${v.nums.slice(i).map((_,j)=>`<button type="button" data-fc-proof="${i},${i+j}" aria-label="Subarray ${i},${i+j}">■</button>`).join('')}</div>`).join('')}</div><div class="fc-formula">${v.nums.length} × (${v.nums.length} + 1) ÷ 2 = <b>${v.nums.length*(v.nums.length+1)/2}</b></div>`);
  return fcStrip('nums',v.nums)+fcStrip('prefix',x.prefix,v.current,Object.fromEntries(v.members.map(i=>[i,'is-seen'])),'item')+
    fcCard(vi?'Hai miền được đếm':'Two counted ranges',`<div class="fc-tails"><div><span>← p ≤ low</span><strong>${fcFmt(s.low)}</strong><small>current − goal − k</small>${fcStat('left_count',s.left_count)}</div><div class="fc-gap"><span>×</span><code>${vi?'Không đếm miền giữa':'Middle excluded'}</code><small>goal = ${v.goal} · k = ${v.k}</small></div><div><span>high ≤ p →</span><strong>${fcFmt(s.high)}</strong><small>current − goal + k</small>${fcStat('right_count',s.right_count)}</div></div><div class="fc-formula"><code>prefix[j] − prefix[i]</code><span>→ sum</span><span>|sum − goal| ≥ k</span></div>`);
}
function fcInsertion(v,vi) {
  const x=v.context,s=v.scratch,value=v.current===null?null:v.nums[v.current],bag=v.members.filter(i=>i!==v.current).sort((a,b)=>v.nums[a]-v.nums[b]||a-b);
  const group=(op,fn,cls)=>`<div class="fc-bucket ${cls}"><code>${op} ${fcFmt(value)}</code><div>${bag.filter(i=>fn(v.nums[i])).map(i=>`<span><small>[${i}]</small><b>${v.nums[i]}</b></span>`).join('')||'<i>∅</i>'}</div></div>`;
  return fcStrip('instructions',v.nums,v.current,{},'item')+fcCard(vi?'Chèn vào mảng đã sắp xếp':'Insert into the sorted array',`<div class="fc-insertion">${group('&lt;',n=>n<value,'is-less')}${group('=',n=>n===value,'is-equal')}${group('&gt;',n=>n>value,'is-greater')}</div><div class="fc-formula"><span class="fc-current-value">↓ ${fcFmt(value)}</span><code>cost = min(less, greater)</code></div><div class="fc-stats">${fcStat('less',s.less,'is-less')}${fcStat('greater',s.greater,'is-greater')}${fcStat('cost',s.cost,'is-counted')}${fcStat('answer',x.answer)}</div>`,vi?'Phần tử bằng value không tính phí':'Equal values do not contribute to the cost');
}
function fcTriples(v,vi,selected) {
  const a=v.id===2179?v.context.mapped:v.nums,x=v.context,s=v.scratch,j=v.current,p=selected??v.newlyCounted[0]??v.accepted.at(-1);
  if(!a)return '';
  const n=a.length,w=Math.max(360,n*64+45),bottom=190,max=Math.max(...a),min=Math.min(...a),px=i=>44+i*64,py=value=>bottom-25-(value-min)/Math.max(1,max-min)*120;
  const line=p?`<path class="fc-team-path" d="M${px(p.i)},${py(a[p.i])}L${px(p.j)},${py(a[p.j])}L${px(p.k)},${py(a[p.k])}"/>`:'';
  const bars=a.map((value,i)=>`<g class="fc-bar ${i===j?'is-current':''} ${p&&[p.i,p.j,p.k].includes(i)?'is-counted':''}" data-fc-item="${i}" role="button" tabindex="0" aria-label="${i}: ${value}"><rect x="${px(i)-18}" y="${py(value)}" width="36" height="${bottom-py(value)}" rx="5"/><text x="${px(i)}" y="${py(value)-10}">${value}</text><text class="fc-node-id" x="${px(i)}" y="210">[${i}]</text></g>`).join('');
  const bucket=(side,op,fn)=>`<div class="fc-bucket"><code>${side} ${op} ${j===null?'—':a[j]}</code><div>${a.flatMap((value,i)=>(side==='L'?i<j:i>j)&&fn(value,a[j])?[`<span><small>[${i}]</small><b>${value}</b></span>`]:[]).join('')||'∅'}</div></div>`;
  const counts=v.id===2179?fcStat('left_count',s.left_count)+fcStat('right_count',s.right_count)+fcStat('×',s.contribution):
    fcStat('L <',x.answer!==undefined?x.left_less?.[j]:s.left_less)+fcStat('L >',x.answer!==undefined?x.left_greater?.[j]:s.left_greater)+fcStat('R <',s.right_less)+fcStat('R >',s.right_greater);
  return fcCard(v.id===2179?vi?'Vị trí trong nums2':'Positions in nums2':'rating · i < j < k',`<div class="fc-svg-scroll" data-fc-scroll="teams" tabindex="0"><svg class="fc-teams" width="${w}" height="230" role="group">${bars}${line}</svg></div>${p?`<div class="fc-formula is-counted">(${p.i}, ${p.j}, ${p.k}) · ${a[p.i]} ${a[p.i]<a[p.j]?'&lt;':'&gt;'} ${a[p.j]} ${a[p.j]<a[p.k]?'&lt;':'&gt;'} ${a[p.k]} ✓</div>`:''}<div class="fc-insertion fc-team-buckets">${bucket('L','&lt;',(a,b)=>a<b)}${v.id===1395?bucket('L','&gt;',(a,b)=>a>b):''}${v.id===1395?bucket('R','&lt;',(a,b)=>a<b):''}${bucket('R','&gt;',(a,b)=>a>b)}</div><div class="fc-stats">${counts}</div><div class="fc-formula"><code>${v.id===1395?'L&lt; × R&gt; + L&gt; × R&lt;':'left_count × right_count'}</code><b>${v.id===1395?fcFmt(s.increasing===undefined?null:s.increasing+(s.decreasing??0)):fcFmt(s.contribution)}</b></div>`,v.id===1395?vi?'Giữa cố định · ghép hai phía':'Fix the middle · combine both sides':'i < j < k · mapped[i] < mapped[j] < mapped[k]');
}
function fcMapping(v,vi,selected) {
  const x=v.context,a=v.nums,b=v.nums2,n=a.length,w=Math.max(360,n*64+45),px=i=>44+i*64,p=selected??v.newlyCounted[0]??v.accepted.at(-1),chosen=p?[p.i,p.j,p.k]:[];
  return fcCard(vi?'Cùng giá trị · hai vị trí':'Same values · two positions',`<div class="fc-svg-scroll" data-fc-scroll="mapping" tabindex="0"><svg class="fc-mapping" width="${w}" height="185" role="group">${x.mapped?a.map((value,i)=>`<path class="fc-map-link ${chosen.includes(i)?'is-counted':''}" d="M${px(i)},45L${px(x.mapped[i])},135"/>`).join(''):''}${[a,b].map((row,r)=>row.map((value,i)=>`<g><rect x="${px(i)-18}" y="${r?135:16}" width="36" height="30" rx="6"/><text x="${px(i)}" y="${r?155:36}">${value}</text><text class="fc-node-id" x="${px(i)}" y="${r?180:10}">${i}</text></g>`).join('')).join('')}</svg></div><div class="fc-formula"><code>nums1 → position in nums2</code></div>`)+fcStrip('mapped',x.mapped,v.current,{},'item');
}
function fcKBig(v,vi) {
  const x=v.context,j=v.current,s=v.scratch,value=j===null?null:v.nums[j],left=v.nums.flatMap((num,i)=>i<j&&num<value?[i]:[]),right=v.nums.flatMap((num,i)=>i>j&&num<value?[i]:[]),tokens=ids=>ids.map(i=>`<span><small>[${i}]</small><b>${v.nums[i]}</b></span>`).join('')||'∅';
  const l=x.answer!==undefined?x.left_count?.[j]:s.left_count,r=s.right_count;
  return fcStrip('nums',v.nums,j,Object.fromEntries(v.accepted.map(row=>[row.index,'is-counted'])),'item')+fcCard(vi?'Ít nhất k phần tử nhỏ hơn ở mỗi phía':'At least k smaller values on each side',`<div class="fc-side-checks"><div class="fc-bucket"><code>L &lt; ${fcFmt(value)}</code><div>${tokens(left)}</div><strong>${fcFmt(l)} ≥ ${v.k} ${l===undefined?'':l>=v.k?'✓':'×'}</strong></div><div class="fc-bucket"><code>R &lt; ${fcFmt(value)}</code><div>${tokens(right)}</div><strong>${fcFmt(r)} ≥ ${v.k} ${r===undefined?'':r>=v.k?'✓':'×'}</strong></div></div><div class="fc-formula"><span>j = ${fcFmt(j)}</span><b>${l===undefined||r===undefined?'—':l>=v.k&&r>=v.k?'✓ k-big':'×'}</b></div>`,vi?'Bằng nhau không được tính':'Equal values are excluded');
}
function fcInversions(v,vi,selection) {
  const a=v.nums,x=v.context,n=a.length,w=Math.max(360,n*60+50),px=i=>40+i*60,j=x.j,chosen=selection??(x.max_index>=0&&j!==undefined?[x.max_index,j]:null),pairs=[];
  for(let i=0;i<n;i++)for(let k=i+1;k<n;k++)if(a[i]>a[k])pairs.push([i,k]);
  return fcCard(vi?'Tìm một nghịch thế cách nhau ≥ 2':'Find an inversion at distance ≥ 2',`<div class="fc-svg-scroll" data-fc-scroll="inversions" tabindex="0"><svg class="fc-inversions" width="${w}" height="245" role="group">${a.map((value,i)=>{const h=22+value/Math.max(1,n-1)*112;return `<g class="fc-bar ${i===j?'is-current':''} ${i===x.max_index?'is-active':''} ${chosen?.includes(i)?'is-counted':''}"><rect x="${px(i)-17}" y="${190-h}" width="34" height="${h}" rx="5"/><text x="${px(i)}" y="${180-h}">${value}</text><text class="fc-node-id" x="${px(i)}" y="210">[${i}]</text>${j!==undefined&&i<=j-2?`<text class="fc-node-id" x="${px(i)}" y="231">MAX</text>`:i===j-1?`<text class="fc-node-id" x="${px(i)}" y="231">× skip</text>`:''}</g>`;}).join('')}${chosen?`<path class="fc-pair-arc" d="M${px(chosen[0])},35Q${(px(chosen[0])+px(chosen[1]))/2},2 ${px(chosen[1])},35"/>`:''}</svg></div><div class="fc-stats">${fcStat('max_index',x.max_index)}${fcStat('max_value',x.max_value)}${fcStat('nums[j]',j===undefined?null:a[j])}</div><div class="fc-formula"><code>max(nums[0 … j−2]) &gt; nums[j]</code>${v.change?.kind==='check'?`<b>${v.change.fail?'True → False':'False → continue'}</b>`:''}</div>`)+
    fcCard(vi?'Minh hoạ các cặp nghịch thế':'Inversion pair illustration',`<div class="fc-pairs">${pairs.map(([i,j])=>`<button type="button" class="${j===i+1?'is-counted':'is-distant'}" data-fc-inversion="${i},${j}">(${i},${j})<small>${a[i]} &gt; ${a[j]} · ${j===i+1?'local':'distant'}</small></button>`).join('')||'∅'}</div><div class="fc-stats">${fcStat('global',pairs.length)}${fcStat('local',pairs.filter(([i,j])=>j===i+1).length)}</div>`,vi?'Hình đối chiếu từ input · không thêm bước chạy':'Input-based reference picture · adds no execution steps');
}
function fcSwapOrder(row,tick) {
  const t=Math.min(row.from,Math.max(0,tick??row.from)),ids=[...row.before];
  ids.splice(row.from,1);ids.splice(row.from-t,0,row.position);
  return {t,ids};
}
function fcSwapTokens(nums,row,ids) {
  return ids.map(i=>`<span class="fc-tile ${i===row.position?'is-current':''}"><small>[${i}]</small><b>${nums[i]}</b></span>`).join('');
}
function fcDigits(v,vi,tick) {
  const x=v.context,q=x.positions,last=v.ledger.at(-1),remaining=q?q.flat().map(pos=>pos-1).sort((a,b)=>a-b):v.nums.map((_,i)=>i),rows=q?q.map((row,digit)=>`<div class="fc-digit-queue ${x.digit===digit?'is-current':''}"><b>${digit}</b><span>${row.map(p=>`<i>${p}</i>`).join('')||'∅'}</span></div>`).join(''):'—';
  let swap='';if(last){const {t,ids}=fcSwapOrder(last,tick);
    swap=fcCard(vi?'Minh hoạ từng lần đổi chỗ':'Illustrate each adjacent swap',`<div class="fc-strip" data-fc-scroll="swaps" data-swap-tick="${t}" data-swap-order="${ids.join(',')}" tabindex="0">${fcSwapTokens(v.nums,last,ids)}</div><label class="fc-swap-slider"><code>${t} / ${last.from} swaps</code><input aria-label="Adjacent swap illustration" type="range" min="0" max="${last.from}" value="${t}" data-fc-swap-tick></label>`,vi?'Thanh trượt minh hoạ · giữ nguyên dòng Python':'Illustration slider · preserves the Python line');}
  return fcStrip('num',[...v.num],null)+fcCard(vi?'Chọn chữ số nhỏ nhất đủ k':'Choose the smallest affordable digit',`<div class="fc-digit-queues" data-fc-scroll="digit-queues" tabindex="0">${rows}</div><div class="fc-stats">${fcStat('digit',x.digit)}${fcStat('position',v.scratch.position)}${fcStat('removed_before',v.scratch.removed_before)}${fcStat('swaps',v.scratch.swaps)}${fcStat('k remaining',x.k)}</div><div class="fc-formula"><code>swaps = position − 1 − removed_before</code></div>`,'queue → original slot, 1-based')+
    fcCard(vi?'Chưa chọn':'Remaining',`<div class="fc-strip" data-fc-scroll="remaining" tabindex="0">${remaining.map(i=>`<span class="fc-tile ${i===x.position-1?'is-current':''}"><small>[${i}]</small><b>${v.nums[i]}</b></span>`).join('')||'∅'}</div>`)+fcStrip('answer',x.answer)+swap;
}
function fcGeometry(v,vi,selection) {
  const x=v.context,point=selection?.point??v.current,selected=point===null?null:v.points[point],maxX=Math.max(...v.nums.map(r=>r[0]),...v.points.map(p=>p[0])),maxY=Math.max(...v.nums.map(r=>r[1]),...v.points.map(p=>p[1])),px=x=>40+x/maxX*350,py=y=>262-y/maxY*210;
  const hits=new Set(v.accepted.filter(p=>p.point===point).map(p=>p.rect));
  const shapes=v.nums.map(([w,h],i)=>`<g class="fc-rectangle ${v.members.includes(i)?'is-active':''} ${hits.has(i)?'is-counted':''}"><rect x="40" y="${py(h)}" width="${px(w)-40}" height="${262-py(h)}"/><text x="${Math.max(65,Math.min(360,px(w)-20))}" y="${py(h)-7}">R${i} (${w},${h})</text></g>`).join('');
  const dots=v.points.map(([a,b],i)=>`<g data-fc-point="${i}" role="button" tabindex="0" aria-label="point ${i}: ${a},${b}" class="fc-point ${i===point?'is-current':''}"><circle cx="${px(a)}" cy="${py(b)}" r="6"/><text x="${Math.max(65,Math.min(365,px(a)+22))}" y="${py(b)+20}">P${i}</text></g>`).join('');
  return fcCard(vi?'Hình chữ nhật chứa điểm · kể cả biên':'Rectangles containing a point · boundary included',`<div class="fc-svg-scroll" data-fc-scroll="geometry" tabindex="0"><svg class="fc-geometry" width="430" height="300" role="group"><path class="fc-parent" d="M40,30V262H410"/>${shapes}${selected?`<path class="fc-split" d="M${px(selected[0])},35V262M40,${py(selected[1])}H405"/>`:''}${dots}<text class="fc-node-id" x="25" y="280">(0,0)</text></svg></div><div class="fc-formula"><code>w ≥ x AND h ≥ y</code><b>${selected?`P${point} = (${selected.join(',')})`:'—'}</b></div><div class="fc-stats">${fcStat('rect_index',x.rect_index)}${fcStat('below y',v.scratch.below)}${fcStat('answer[point]',point===null?null:x.answer?.[point])}</div>`)+fcCard(vi?'Quét từ phải sang trái':'Sweep from right to left',`<div class="fc-strip" data-fc-scroll="rect-order" tabindex="0">${(x.ordered_rectangles??[]).map(([i,[w,h]])=>`<span class="fc-tile ${v.members.includes(i)?'is-seen':''}"><small>R${i}</small><b>${w} × ${h}</b></span>`).join('')||'—'}</div>`)+fcStrip('answer',x.answer);
}
function fcPermutation(v,vi) {
  const x=v.context,pos=new Map(x.positions?.__pairs__??[]),order=[...pos].filter(([value])=>v.members.includes(value)).sort((a,b)=>a[1]-b[1]);
  const occupied=new Map(order.map(([value,slot])=>[slot,value]));
  const slots=Array.from({length:(x.q??v.nums.length)+v.m},(_,i)=>i+1);
  return fcStrip('queries',v.nums,v.current,{},'item')+
    fcCard('P · '+(vi?'chỉ số từ 0':'zero-based index'),`<div class="fc-strip" data-fc-scroll="permutation" data-permutation="${order.map(p=>p[0]).join(',')}" tabindex="0">${order.map(([value],i)=>`<span class="fc-tile ${value===x.value?'is-current':''}"><small>${i}</small><b>${value}</b></span>`).join('')||'∅'}</div><div class="fc-formula"><span>${vi?'Tìm':'Find'} ${fcFmt(x.value)}</span>${fcArrow()}<code>query(position − 1)</code>${fcArrow()}<b>${fcFmt(v.scratch.index)}</b></div>`,vi?'Hàng thay đổi sau khi add() hoàn tất':'The row changes when add() completes')+
    fcCard(vi?'Các ô trống để đưa lên đầu':'Reserved slots for move to front',`<div class="fc-strip" data-fc-scroll="slots" tabindex="0">${slots.map(slot=>`<span class="fc-tile ${slot===x.front?'is-front':''} ${occupied.has(slot)?'is-seen':'is-empty'}"><small>slot ${slot}</small><b>${occupied.get(slot)??'·'}</b>${slot===x.front?'<small>↑ front</small>':''}</span>`).join('')}</div><div class="fc-formula"><span>−1 ${vi?'ở vị trí cũ':'at old slot'}</span>${fcArrow()}<span>+1 ${vi?'ở front':'at front'}</span></div>`)+fcStrip('answer',x.answer);
}
function fcCalls(v,vi) {
  const n=v.nums.length,w=Math.max(340,n*72),x=call=>36+(call.left+call.right)/2*72,y=call=>32+call.depth*64,map=new Map(v.calls.map(c=>[c.key,c]));
  return fcCard(vi?'Các lời gọi solve':'solve calls',`<div class="fc-svg-scroll" data-fc-scroll="calls" tabindex="0"><svg class="fc-calls" width="${w}" height="${Math.max(96,75+Math.max(0,...v.calls.map(c=>c.depth))*64)}" role="group">${v.calls.map(c=>{const p=map.get(c.parent);return p?`<path class="fc-parent" d="M${x(p)},${y(p)+16}L${x(c)},${y(c)-16}"/>`:'';}).join('')}${v.calls.map(c=>`<g data-fc-call="${c.step}" role="button" tabindex="0" aria-label="solve ${c.key}" class="${c.left===v.left&&c.right===v.right?'is-current':''}"><rect x="${x(c)-29}" y="${y(c)-17}" width="58" height="34" rx="8"/><text x="${x(c)}" y="${y(c)+1}">[${c.left},${c.right}]</text><text class="fc-node-id" x="${x(c)}" y="${y(c)+13}">Σ ${fcFmt(c.total)}</text></g>`).join('')}</svg></div>`,`${vi?'Đoạn hiện tại':'Current segment'} [${fcFmt(v.left)}, ${fcFmt(v.right)}]`);
}
function fcShadow(v,vi,selected) {
  const a=v.nums,n=a.length,w=Math.max(350,n*65+30),base=190,max=Math.max(...a),min=Math.min(...a),height=value=>26+(value-min)/Math.max(1,max-min)*100,x=i=>46+i*65,
    pair=selected??v.newlyCounted[0]??v.accepted.at(-1),upper=new Map(v.upper),lower=new Map(v.lower);
  const band=pair?`<rect class="fc-open-band" x="${x(pair.i)}" y="${base-height(a[pair.j])}" width="${(pair.j-pair.i)*65}" height="${height(a[pair.j])-height(a[pair.i])}"/><path class="fc-pair-arc" d="M${x(pair.i)},30Q${(x(pair.i)+x(pair.j))/2},0 ${x(pair.j)},30"/><text x="${(x(pair.i)+x(pair.j))/2}" y="15">(${pair.i}, ${pair.j}) ✓</text>`:'';
  const bars=a.map((value,i)=>`<g class="fc-bar ${i===v.current?'is-current':''} ${v.active.includes(i)?'is-active':''} ${pair&&(pair.i===i||pair.j===i)?'is-counted':''}" data-fc-item="${i}" role="button" tabindex="0" aria-label="nums ${i} = ${value}"><rect x="${x(i)-19}" y="${base-height(value)}" width="38" height="${height(value)}" rx="5"/><text x="${x(i)}" y="${base-height(value)-8}">${value}</text><text class="fc-node-id" x="${x(i)}" y="210">[${i}]</text></g>`).join('');
  const split=v.middle!==null?`<path class="fc-split" d="M${x(v.middle)+32},38V218"/>`:'';
  const bounds=`<div class="fc-bounds" data-fc-scroll="bounds" tabindex="0">${a.map((num,i)=>`<div class="${v.active.includes(i)?'is-active':''}"><small>[${i}] · ${num}</small><code>${i<=v.middle?'upper[i]':'lower[j]'}</code><b>${fcFmt(i<=v.middle?upper.get(i):lower.get(i))}</b></div>`).join('')}</div>`;
  return fcCard('nums · '+(vi?'cặp không bị chắn':'unblocked pairs'),`<div class="fc-svg-scroll" data-fc-scroll="shadow" tabindex="0"><svg class="fc-shadow" width="${w}" height="230" role="group">${band}${split}${bars}</svg></div><div class="fc-legend"><span>■ ${vi?'i đang active':'active i'}</span><span>▧ ${vi?'miền giá trị cấm (mở)':'forbidden value band (open)'}</span></div>`)+fcCalls(v,vi)+
    fcCard('lower[j] ≤ nums[i] &lt; nums[j] ≤ upper[i]',`${bounds}<div class="fc-stats">${fcStat('active',v.context.active)}${fcStat('below_lower',v.context.below_lower)}${fcStat('subtotal',v.context.answer)}</div>`,vi?'Biên bằng nhau vẫn hợp lệ':'Equality at either bound is allowed');
}
function fcProof(v,selected,vi) {
  const p=selected??v.newlyCounted[0]??v.accepted.at(-1);if(!p)return '';
  if(v.id===4051)return fcCard(`${vi?'Đoạn con':'Subarray'} [${p.start}, ${p.end}]`, `<div class="fc-proof-strip">${v.nums.map((num,i)=>`<span class="${i>=p.start&&i<=p.end?'is-counted':''}"><small>${i}</small><b>${num}</b></span>`).join('')}</div><div class="fc-formula"><span>sum = ${p.sum}</span>${fcArrow()}<b>|${p.sum} − (${v.goal})| = ${p.difference} ≥ ${v.k} ✓</b></div>`);
  if(v.id===2426){const d=v.context.differences;if(!d)return '';return fcCard(`(${p.i}, ${p.j}) · i &lt; j`, `<div class="fc-formula"><span>d[${p.i}] = ${d[p.i]}</span><strong>≤</strong><span>${d[p.j]} + (${v.diff}) = ${d[p.j]+v.diff}</span><b>✓</b></div><div class="fc-formula is-small">${v.nums[p.i]} − (${v.nums[p.j]}) ≤ ${v.nums2[p.i]} − (${v.nums2[p.j]}) + (${v.diff})</div>`);}
  return '';
}
function fcLedger(v,vi) {
  const pairs=v.accepted;
  const label=p=>v.id===4051?`[${p.start}…${p.end}]`:v.id===2519?`[${p.index}]`:v.id===2250?`R${p.rect} → P${p.point}`:p.k!==undefined?`(${p.i},${p.j},${p.k})`:`(${p.i},${p.j})`;
  const history=pairs.length?`<div class="fc-pairs" data-fc-scroll="pairs" tabindex="0">${pairs.map((p,i)=>`<button type="button" data-fc-pair="${i}" class="${v.newlyCounted.some(row=>row.step===p.step)?'is-counted':''}">${label(p)}<small>+1</small></button>`).join('')}</div>`:`<div class="fc-ledger" data-fc-scroll="ledger" tabindex="0">${v.ledger.map(row=>`<button type="button" data-fc-call="${row.step}"><small>[${row.current}]</small><b>${v.id===775?row.fail?'× distant':'✓':`${v.id===1409?'':'+'}${row.amount}`}</b></button>`).join('')||'<span>∅</span>'}</div>`;
  if(v.id===775)return fcCard(vi?'Các lần kiểm tra prefix':'Prefix checks',history+`<div class="fc-total"><code>return</code><strong>${fcFmt(v.answer)}</strong></div>`);
  const title=v.id===1409?'answer':v.id===1505?vi?'Số lần đổi chỗ đã dùng':'Adjacent swaps used':vi?'Đã cộng vào kết quả':'Added to the result';
  return fcCard(title,history+`<div class="fc-total"><code>${v.id===4055?'subtotal':'answer'}</code><strong data-native-answer="${fcEsc(JSON.stringify(v.context.answer??null))}">${fcEsc(fcFmt(v.context.answer))}</strong></div>`,vi?'Chọn một mục → dòng Python đã xử lý mục đó':'Select an item → the Python line that processed it');
}
function fcGo(index,options) {
  if(index<0||typeof steps==='undefined')return;
  if(typeof stopPlay==='function')stopPlay();
  stepIndex=index;renderStep();
  if(options)renderFenwickCountPictures(steps[stepIndex],options);
}
function fcBind(host) {
  const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>{el.addEventListener('click',()=>fn(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el);}});});
  bind('[data-fc-jump]',el=>{const kind=el.dataset.fcJump;const i=steps.findIndex((s,i)=>i>stepIndex&&s.fenwickCountView&&(kind==='line'||kind==='query'&&s.fenwickCountView.change?.kind==='read'||kind==='write'&&s.fenwickCountView.change?.kind==='write'||kind==='count'&&['count','check'].includes(s.fenwickCountView.change?.kind)||kind==='result'&&s.final));fcGo(i<0?steps.length-1:i);});
  bind('[data-fc-case]',el=>{const v=steps[stepIndex].fenwickCountView,c=FC_CASES[v.id][Number(el.dataset.fcCase)];document.getElementById('arrInput').value=Array.isArray(c[0])?c[0].join(','):c[0];for(const[key,value]of Object.entries(c[1])){const input=document.getElementById('param-'+key);if(input)input.value=String(value);}if(typeof runViz==='function')runViz();});
  bind('[data-fc-call]',el=>fcGo(Number(el.dataset.fcCall)));
  bind('[data-fc-pair]',el=>{const v=steps[stepIndex].fenwickCountView,p=v.accepted[Number(el.dataset.fcPair)];fcGo(p.step,{selected:p});});
  bind('[data-fc-proof]',el=>{const v=steps[stepIndex].fenwickCountView,[s,e]=el.dataset.fcProof.split(',').map(Number),p=v.accepted.find(p=>p.start===s&&p.end===e);if(p)fcGo(p.step,{selected:p});});
  bind('[data-fc-node]',el=>{const node=Number(el.dataset.fcNode),i=steps.findIndex((s,i)=>i>stepIndex&&s.fenwickCountView?.change?.index===node&&['write','read'].includes(s.fenwickCountView.change.kind));fcGo(i);});
  bind('[data-fc-item]',el=>{const item=Number(el.dataset.fcItem);fcGo(steps.findIndex(s=>s.fenwickCountView?.current===item&&s.fenwickCountView.change?.kind==='count'));});
  bind('[data-fc-inversion]',el=>{if(typeof stopPlay==='function')stopPlay();renderFenwickCountPictures(steps[stepIndex],{selectedPair:el.dataset.fcInversion.split(',').map(Number)});});
  bind('[data-fc-point]',el=>fcGo(steps.findIndex(s=>s.fenwickCountView?.current===Number(el.dataset.fcPoint)&&s.fenwickCountView.change?.kind==='count')));
  host.querySelectorAll('[data-fc-swap-tick]').forEach(el=>{el.addEventListener('input',()=>{
    if(typeof stopPlay==='function')stopPlay();
    const v=steps[stepIndex].fenwickCountView,last=v.ledger.at(-1),{t,ids}=fcSwapOrder(last,Number(el.value)),row=host.querySelector('[data-swap-order]');
    row.innerHTML=fcSwapTokens(v.nums,last,ids);row.dataset.swapTick=t;row.dataset.swapOrder=ids.join(',');
    el.closest('label').querySelector('code').textContent=`${t} / ${last.from} swaps`;
  });el.addEventListener('keydown',e=>e.stopPropagation());});
}
function renderFenwickCountPictures(step,options={}) {
  const v=step.fenwickCountView,host=document.getElementById('treeView');if(!host||!v)return;
  const vi=typeof lang!=='undefined'&&lang==='vi',scrolls=new Map([...host.querySelectorAll('[data-fc-scroll]')].map(el=>[el.dataset.fcScroll,{x:el.scrollLeft,y:el.scrollTop}])),open=host.querySelector('.fc-native')?.open??false;
  const titles={4051:vi?'Hai miền · một tổng':'Two tails · one sum',4055:vi?'Cặp nào nhìn thấy nhau?':'Which pairs see each other?',2426:vi?'Đếm cặp trên mảng hiệu':'Count pairs in the difference array',1649:vi?'Chèn ở đâu, tốn bao nhiêu?':'Where to insert, how much does it cost?',1409:vi?'Tìm vị trí · đưa lên đầu':'Find position · move to front',
    775:vi?'Liền kề hay ở xa?':'Adjacent or distant?',1395:vi?'Chọn giữa · ghép hai phía':'Fix the middle · combine both sides',1505:vi?'Kéo chữ số nhỏ lên trước':'Pull the smallest digit forward',2179:vi?'Bộ ba cùng thứ tự':'Triples in the same order',2250:vi?'Điểm này nằm trong hình nào?':'Which rectangles contain this point?',2519:vi?'Đủ k ở cả hai phía?':'At least k on both sides?'};
  const phases={prepare:vi?'Chuẩn bị':'Prepare',query:vi?'Truy vấn':'Query',insert:vi?'Cập nhật':'Update',left:vi?'Quét từ trái →':'Scan from left →',right:vi?'← Quét từ phải':'← Scan from right',split:vi?'Chia đôi':'Split',upper:'upper[i]',lower:'lower[j]',sweep:vi?'Đếm cặp chéo':'Crossing pairs',done:vi?'Hoàn tất':'Done'};
  let main=v.id===4051?fcPrefix(v,vi):v.id===2426?fcDifference(v,vi):v.id===1649?fcInsertion(v,vi):v.id===1409?fcPermutation(v,vi):v.id===1395?fcTriples(v,vi,options.selected):v.id===2179?fcMapping(v,vi,options.selected)+fcTriples(v,vi,options.selected):v.id===775?fcInversions(v,vi,options.selectedPair):v.id===1505?fcDigits(v,vi,options.swapTick):v.id===2250?fcGeometry(v,vi,options.selected):v.id===2519?fcKBig(v,vi):fcShadow(v,vi,options.selected);
  main+=fcProof(v,options.selected,vi);
  const hideBit=v.id===4051&&v.k===0||v.id===775;
  host.innerHTML=`<article class="tr-viz fc-viz" data-problem-id="${v.id}" data-source-line="${v.source.line}" role="region" aria-label="LeetCode ${v.id}"><header class="tr-header"><div><small>LEETCODE ${v.id} · ${v.id===775?'PREFIX MAX':'FENWICK'}</small><h2>${titles[v.id]}</h2></div><code>${phases[v.phase]??v.phase}</code></header><nav class="tr-presets" aria-label="Examples">${FC_CASES[v.id].map((c,i)=>`<button type="button" data-fc-case="${i}">${c[vi?2:3]}</button>`).join('')}</nav><div class="tr-source"><span>${vi?'Sau dòng':'After line'} <b>L${v.source.line}</b> · ${v.scope}</span><code>${fcEsc(v.source.text)}</code>${v.branch===null?'':`<strong class="${v.branch?'is-good':'is-muted'}">${v.branch?'True ✓':'False ×'}</strong>`}</div><div class="fc-board"><div class="fc-primary">${main}</div><div class="fc-secondary">${hideBit?'':v.id===1409?'':fcRanks(v,vi)}${hideBit?'':fcFenwick(v,vi)}${fcLedger(v,vi)}</div></div><details class="tr-native fc-native"><summary>${vi?'Biến Python · call stack':'Python locals · call stack'}</summary>${v.frames.map(frame=>`<div class="fc-frame"><code>${fcEsc(frame.name)}</code><pre>${fcEsc(JSON.stringify(frame.locals,null,2))}</pre></div>`).join('')}</details>${v.answer===null?'':`<output class="tr-answer" data-answer="${fcEsc(JSON.stringify(v.answer))}"><small>${vi?'Kết quả':'Result'}</small><strong>${fcEsc(fcFmt(v.answer))}</strong></output>`}<footer class="tr-footer"><div>${(v.id===775?[['line',vi?'Dòng →':'Line →'],['count',vi?'Kiểm tra →':'Check →'],['result',vi?'Kết quả ↠':'Result ↠']]:[['line',vi?'Dòng →':'Line →'],['query','Query →'],['write','Update →'],['count',vi?'Cộng kết quả →':'Count →'],['result',vi?'Kết quả ↠':'Result ↠']]).map(([key,label])=>`<button type="button" data-fc-jump="${key}">${label}</button>`).join('')}</div></footer></article>`;
  const details=host.querySelector('.fc-native');if(details)details.open=open;
  for(const el of host.querySelectorAll('[data-fc-scroll]')){const saved=scrolls.get(el.dataset.fcScroll);if(saved){el.scrollLeft=saved.x;el.scrollTop=saved.y;}}
  fcBind(host);
}
