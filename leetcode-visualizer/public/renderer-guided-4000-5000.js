// Draw only current executed state or the supplied input; never infer a future result.
function renderRange4000Scene(v,language) {
 const x=v.locals||{},vi=language==='vi',t=(a,b)=>vi?a:b;
 const esc=n=>String(n??'∅').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const arg=n=>v.args[v.names.indexOf(n)],val=n=>Object.hasOwn(x,n)?x[n]:arg(n);
 const svg=(body,w,h,label)=>`<svg class="iv-range-picture" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${body}</svg>`;
 const cell=(body,cls='')=>`<span class="iv-range-cell ${cls}">${body}</span>`;
 let html='',name='';
 if([4020,4023,4029].includes(v.id)) {
  name=t('Thang máy · tầng / yêu cầu','Elevator · floors / requests');
  const requests=arg('requests')||[],floors=requests.map(a=>Array.isArray(a)?a[1]:a),current=x.position??x.floor??x.prev??arg('start')??0;
  const all=[...new Set([0,current,...floors])].sort((a,b)=>b-a).slice(0,22);
  html=`<div class="iv-elevator">${all.map(f=>`<div><b>${esc(f)}</b><span class="iv-shaft ${f===current?'current':''}">${f===current?'▣':''}</span><span>${requests.map((a,i)=>(Array.isArray(a)?a[1]:a)===f?cell(`${i+1}${Array.isArray(a)?' · t='+esc(a[0]):''}`,Number.isInteger(x.mask)&&(x.mask&(1<<i))?'changed':''):'').join('')}</span></div>`).join('')}</div><small>${t('▣ vị trí hiện tại · số trên thẻ là yêu cầu','▣ current position · cards show requests')}</small>`;
 } else if(v.id===4001) {
  name=t('Hai chuỗi thời gian','Two time series');
  const first=arg('series1'),second=arg('series2'),times=[...new Set([...first,...second].map(a=>a[0]))].sort((a,b)=>a-b);
  const rows=[['t',times],['A',times.map(time=>first.find(a=>a[0]>=time)?.[1]??0)],['B',times.map(time=>second.find(a=>a[0]>=time)?.[1]??0)]];
  const answer=x.ans||[];rows.push(['A+B',times.map(time=>answer.find(a=>a[0]===time)?.[1]??'·')]);
  html=`<div class="iv-scroll"><div class="iv-series">${rows.map(([label,values])=>`<div><b>${label}</b>${values.slice(0,24).map((a,i)=>cell(esc(a),[x.t1,x.t2].includes(times[i])?'current':'')).join('')}</div>`).join('')}</div></div><small>${t('A/B lấy mốc kế tiếp; hàng cuối chỉ hiện tổng đã tính.','A/B use the next timestamp; the last row shows only computed sums.')}</small>`;
 } else if(v.id===4096) {
  name=t('Thùng rơi và bom','Falling boxes and bombs');
  const grid=val('grid'),destroyed=new Set((x.destroyed||[]).map(a=>Array.isArray(a)?a.join(','):String(a))),bombs=x.exploding||[];
  html=`<div class="iv-scroll"><div class="iv-bomb-grid" style="--columns:${Math.min(grid[0]?.length||1,32)}">${grid.slice(0,32).flatMap((row,r)=>[...row].slice(0,32).map((a,c)=>cell(`<b>${a==='#'?'▣':a==='*'?'✹':'·'}</b><small>${r},${c}</small>`,`${a==='#'?'box':a==='*'?'bomb':''} ${destroyed.has(r+','+c)?'current':''}`))).join('')}</div></div><small>▣ ${t('thùng · ✹ bom · ↓ trọng lực','box · ✹ bomb · ↓ gravity')}</small>`;
 } else if(v.id===4077&&Array.isArray(x.children)) {
  name=t('Cây tiền tố · thứ tự nhánh','Prefix trie · branch order');
  const children=x.children,prefixes=x.prefixes||[],nodes=children.slice(0,50),depth=prefixes.map(a=>typeof a==='string'?a.length:0),levelCount={};
  const points=nodes.map((_,i)=>{const d=depth[i]||0,j=levelCount[d]||0;levelCount[d]=j+1;return[45+j*90,35+d*65];});
  html=svg(nodes.map((edges,i)=>Object.entries(edges).map(([letter,j])=>{if(!points[j])return'';const[a,b]=points[i],[c,d]=points[j];return`<path d="M${a} ${b}L${c} ${d}"/><text x="${(a+c)/2+7}" y="${(b+d)/2}">${esc(letter)}</text>`;}).join('')).join('')+points.map(([a,b],i)=>`<g class="${x.node===i?'current':''}"><circle cx="${a}" cy="${b}" r="18"/><text x="${a}" y="${b+5}" text-anchor="middle">${i}</text></g>`).join(''),Math.max(180,...Object.values(levelCount).map(n=>n*90)),Math.max(110,...points.map(a=>a[1]+30)),name);
 } else if([4034,4061].includes(v.id)) {
  name=t('Bàn cờ','Chessboard');const source=arg('source'),target=arg('target');
  html=svg(Array.from({length:64},(_,i)=>{let r=8-Math.floor(i/8),c=i%8+1,isSource=source[0]===r&&source[1]===c,isTarget=target[0]===r&&target[1]===c;return`<g><rect class="${(r+c)%2?'iv-square-dark':''} ${isSource?'current':''}" x="${(c-1)*40+25}" y="${(8-r)*40+10}" width="40" height="40"/>${isSource||isTarget?`<text x="${(c-1)*40+45}" y="${(8-r)*40+39}" text-anchor="middle" class="iv-piece">${isTarget?'◎':v.id===4034?'♝':'♛'}</text>`:''}</g>`;}).join('')+Array.from({length:8},(_,i)=>`<text x="${45+i*40}" y="350" text-anchor="middle">${i+1}</text><text x="8" y="${35+i*40}">${8-i}</text>`).join(''),355,360,name);
 } else if([4070,4071].includes(v.id)) {
  name=t('Mặt số · 0 nối 9','Dial · 0 connects to 9');const current=Number(x.prev??x.pre??0);
  html=svg(Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,c=170+115*Math.cos(a),d=145+115*Math.sin(a);return`<g class="${current===i?'current':''}"><circle cx="${c}" cy="${d}" r="20"/><text x="${c}" y="${d+5}" text-anchor="middle">${i}</text></g>`;}).join(''),340,290,name);
 } else if([4085,4108].includes(v.id)) {
  name=t('Cây · màu ban đầu','Tree · initial colors');const colors=arg('colors'),edges=arg('edges'),n=colors.length;
  if(n<=40){
   const root=Number.isInteger(x.root)?x.root:0,graph=Array.from({length:n},()=>[]),points=new Map(),levels=new Map(),queue=[[root,-1,0]];
   for(const[a,b]of edges){graph[a].push(b);graph[b].push(a);}
   for(const[u,parent,depth]of queue){const column=levels.get(depth)||0;levels.set(depth,column+1);points.set(u,[45+column*85,35+depth*70]);for(const child of graph[u])if(child!==parent)queue.push([child,u,depth+1]);}
   const width=Math.max(200,...[...levels.values()].map(count=>count*85)),height=Math.max(110,...[...points.values()].map(p=>p[1]+35));
   html=svg(edges.map(([a,b])=>`<path d="M${points.get(a).join(' ')}L${points.get(b).join(' ')}"/>`).join('')+[...points].map(([u,[a,b]])=>`<g class="iv-tree-color color-${esc(colors[u])} ${x.node===u||x.u===u?'current':''}"><circle cx="${a}" cy="${b}" r="22"/><text x="${a}" y="${b+5}" text-anchor="middle">${u} · ${esc(colors[u])}</text></g>`).join(''),width,height,name);
   html+=`<small>R ${t('đỏ','red')} · B ${t('xanh','blue')}${v.id===4085?' · W '+t('trắng','white'):''}</small>`;
  }
 } else if(v.id===4080) {
  name=t('Ghế xe buýt · tiền lên xe','Bus seats · boarding cost');const state=x.instance||x.self||{},rows=state.cost_data||[];
  html=`<div class="iv-bus">${rows.slice(0,30).map((row,i)=>`<div><b>${i+1}</b>${row.map((cost,j)=>cell(`<b>${String.fromCharCode(65+j)}${i+1}</b><small>${cost?'● '+cost:'○'}</small>`,cost?'changed':'')+(j===1?'<i>↕</i>':'')).join('')}</div>`).join('')}</div><small>${t('○ trống · ● đã đặt · số dưới ghế là phí thực tế','○ vacant · ● booked · number below a seat is its actual boarding cost')}</small>`;
 } else if(v.id===4045) {
  name=t('Robot đi cùng chiều','Robots moving in one direction');const positions=arg('position'),speeds=arg('speed'),minimum=Math.min(...positions),maximum=Math.max(...positions),at=n=>45+(n-minimum)/Math.max(1,maximum-minimum)*380;
  html=svg(positions.slice(0,24).map((pos,i)=>`<g class="${x.index===i?'current':''}"><path d="M${at(pos)} ${30+i*28}h30"/><text x="${at(pos)}" y="${24+i*28}">▣ ${esc(pos)} → ${esc(speeds[i])}</text></g>`).join(''),500,positions.slice(0,24).length*28+30,name);
 }
 return html?{html,name}:null;
}
