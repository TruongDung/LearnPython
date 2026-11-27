'use strict';

function illustratedLessonStep(direction) {
  if (typeof steps === 'undefined' || typeof renderStep !== 'function') return;
  if (typeof stopPlay === 'function') stopPlay();
  stepIndex = Math.max(0, Math.min(steps.length - 1, stepIndex + direction));
  renderStep();
}

// All drawings consume executed snapshots. No answer is predicted by the scene.
function renderIllustratedLesson(v, language) {
  if(v.id===4124&&typeof renderMountain4124==='function')return renderMountain4124(v,language);
  if(v.id===4123&&typeof mathPicture==='function')return mathPicture(v,language);
  if(v.id===3946&&typeof renderSaleItems3946==='function')return renderSaleItems3946(v,language);
  const vi = language === 'vi', t = (a,b) => vi ? a : b;
  const esc = value => String(value ?? '∅').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const x = v.locals || {}, kind = v.teaching.scene.kind;
  const scalar = value => value === null || ['number','string','boolean'].includes(typeof value);
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  const text = value => value === null ? '∅' : value === true ? '✓' : value === false ? '✕' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  const brief = value => { const s = text(value); return s.length > 65 ? s.slice(0,62) + '…' : s; };
  const arg = name => v.args[v.names.indexOf(name)];
  const value = name => Object.hasOwn(x,name) ? x[name] : arg(name);
  const ref = value => value && typeof value === 'object' && typeof value.id === 'string' && value.type;
  const labels = {
    dp:['Trạng thái nhỏ','Subproblem states'], nums:['Mảng','Array'], s:['Chuỗi','String'], grid:['Bảng ô','Grid'],
    count:['Số lượng','Count'], counts:['Tần suất','Frequencies'], cnt:['Bộ đếm','Counter'], ans:['Đang tích lũy','Accumulating'],
    answer:['Đang tích lũy','Accumulating'], result:['Đang tạo','Working result'], best:['Tốt nhất hiện tại','Best so far'],
    left:['Trái','Left'], right:['Phải','Right'], mid:['Giữa','Midpoint'], mask:['Tập đã chọn','Selected set'],
    queue:['Hàng chờ','Queue'], q:['Hàng chờ','Queue'], heap:['Hàng ưu tiên','Priority queue'], stack:['Ngăn xếp','Stack'],
    parent:['Cha / nhóm','Parent / component'], distance:['Khoảng cách','Distances'], seen:['Đã thăm','Visited'],
    prefix:['Tổng tiền tố','Prefix sums'], rows:['Các hàng hiện tại','Current rows'], operations:['Các lệnh','Commands']
  };
  const label = name => labels[name]?.[vi ? 0 : 1] || name;
  function cells(values,name,characters=false) {
    const old = v.oldValues?.[name], previous = typeof old === 'string' ? [...old] : old;
    const pointers = ['i','j','index','position','cursor','left','right','l','r','mid','start','end'].filter(p => Number.isInteger(x[p]) && x[p] >= 0 && x[p] < values.length);
    const left = x.left ?? x.l, right = x.right ?? x.r;
    return `<div class="iv-cells" role="list" aria-label="${esc(name)}">${values.slice(0,80).map((item,i) => {
      const at = pointers.filter(p => x[p] === i), changed = Array.isArray(previous) && !same(previous[i],item);
      const selected = Number.isInteger(left) && Number.isInteger(right) && left <= i && i <= right;
      return `<div role="listitem" class="iv-cell ${at.length?'current':''} ${changed?'changed':''} ${selected?'selected':''}" data-index="${i}"><small>${i}</small><b>${esc(item === ' ' ? '␠' : characters && item === '\n' ? '↵' : brief(item))}</b><span>${esc(at.join(' · ')) || '&nbsp;'}</span></div>`;
    }).join('')}</div>${values.length>80?`<small>80 / ${values.length}</small>`:''}`;
  }
  function matrix(rows,name) {
    const normalized = rows.map(row => typeof row === 'string' ? [...row] : row), columns = normalized[0]?.length || 1;
    const rr = x.row ?? x.r ?? x.i, cc = x.col ?? x.c ?? x.j, old = v.oldValues?.[name];
    const path = new Set([x.path,x.shared,x.visited].filter(Array.isArray).flat().filter(p => Array.isArray(p) && p.length===2).map(p => p.join(',')));
    return `<div class="iv-scroll"><div class="iv-matrix" style="--iv-columns:${Math.min(columns,32)}" aria-label="${esc(name)}">${normalized.slice(0,32).flatMap((row,r) => row.slice(0,32).map((item,c) => {
      const wall = item === '#', changed = Array.isArray(old) && old[r] && !same(old[r][c],item);
      return `<div class="iv-square ${wall?'wall':''} ${r===rr&&c===cc?'current':''} ${changed?'changed':''} ${path.has(r+','+c)?'selected':''}"><b>${esc(wall?'▧':item==='.'?'·':brief(item))}</b><small>${r},${c}</small></div>`;
    })).join('')}</div></div>${rows.length>32||columns>32?`<small>${t('Góc 32×32 của bảng','Showing the first 32×32 cells')}</small>`:''}`;
  }
  function table(rows) {
    const columns = [...new Set(rows.slice(0,20).flatMap(row => Object.keys(row)))];
    const current = [x.row,x.item,x.person,x.customer,x.employee].filter(a => a && typeof a === 'object');
    return `<div class="iv-scroll"><table><thead><tr>${columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,20).map(row=>`<tr class="${current.some(a=>same(a,row))?'current':''}">${columns.map(c=>`<td>${esc(brief(row[c]??null))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${rows.length>20?`<small>20 / ${rows.length}</small>`:''}`;
  }
  function bars(pairs) {
    const maximum = Math.max(1,...pairs.map(([,v])=>Math.abs(v)));
    return `<div class="iv-bars">${pairs.slice(0,24).map(([key,v])=>`<div><code>${esc(brief(key))}</code><span><i style="width:${Math.abs(v)/maximum*100}%"></i></span><b>${esc(v)}</b></div>`).join('')}</div>`;
  }
  function picture(item,name,depth=0) {
    if (depth>3) return `<span class="iv-value">${esc(brief(item))}</span>`;
    if (typeof item==='string' && item.length<=100 && !item.includes('\n')) return cells([...item],name,true);
    if (Array.isArray(item)) {
      if (!item.length) return '<span class="iv-empty">∅</span>';
      if(v.id===3337&&name==='counts'&&item.length===26)return bars(item.map((count,i)=>[String.fromCharCode(97+i),count]).filter(([,count])=>count!==0));
      if(v.id===3337&&name==='transition'&&Array.isArray(item[0]))return table(item.map((row,i)=>({from:String.fromCharCode(97+i),to:row.map((count,j)=>count?String.fromCharCode(97+j)+(count===1?'':'×'+count):'').filter(Boolean).join(' ')})).filter(row=>row.to));
      if (item.every(row => row && typeof row==='object' && !Array.isArray(row) && !ref(row) && !row.__pairs__)) return table(item);
      if (item.every(scalar)) {
        if (['grid','board','matrix'].includes(name) && item.every(row=>typeof row==='string' && row.length===item[0].length)) return matrix(item,name);
        return cells(item,name);
      }
      if (item.every(row=>Array.isArray(row) && row.length===item[0].length && row.every(scalar))) return matrix(item,name);
      return `<div class="iv-nested">${item.slice(0,12).map((row,i)=>`<div><small>${i}</small>${picture(row,name+'['+i+']',depth+1)}</div>`).join('')}</div>`;
    }
    if (ref(item)) {const node=(v.objects||[]).find(node=>node.id===item.id);return `<span class="iv-node-ref" title="${esc(item.id)}">↗ ${esc(node?node.fields.val:item.id)}</span>`;}
    if (item && typeof item==='object') {
      const pairs = item.__pairs__ || Object.entries(item).filter(([k])=>k!=='type');
      if (pairs.length && pairs.every(([,n])=>typeof n==='number' && Number.isFinite(n)) && /count|freq|counter|occurrence|histogram|^dp$/.test(name)) return bars(pairs);
      if(!item.__pairs__&&pairs.length&&pairs.every(([,v])=>scalar(v)))return table([item]);
      return pairs.length ? `<div class="iv-nested">${pairs.slice(0,12).map(([key,v])=>`<div><small>${esc(brief(key))}</small>${picture(v,brief(key),depth+1)}</div>`).join('')}</div>` : '<span class="iv-empty">∅</span>';
    }
    return `<strong class="iv-value">${esc(brief(item))}</strong>`;
  }
  function graph() {
    let vertices=[], edges=[], root=0, directed=v.teaching.scene.directed;
    const objects=(v.objects||[]).filter(node=>Object.hasOwn(node.fields,'val'));
    if (objects.length) {
      vertices=objects.map(node=>({id:node.id,label:node.fields.val}));
      for (const node of objects) for (const key of ['left','right','next','prev']) if (ref(node.fields[key])) edges.push([node.id,node.fields[key].id,key]);
      root=vertices.find(node=>!edges.some(edge=>edge[1]===node.id&&edge[2]!=='prev'))?.id ?? vertices[0]?.id;
      directed=true;
    } else {
      const edgeName=v.names.find(n=>['edges','roads','connections','prerequisites'].includes(n));
      const input=arg(edgeName);
      if (Array.isArray(input) && input.every(row=>Array.isArray(row)&&row.length>=2&&row.slice(0,2).every(Number.isInteger))) edges=input;
      const parents=value('par')??value('parent');
      if (!edges.length && Array.isArray(parents) && parents.every(Number.isInteger)) edges=parents.flatMap((parent,node)=>parent<0||parent===node?[]:[[parent,node]]);
      let ids=[...new Set(edges.flatMap(edge=>edge.slice(0,2)))].sort((a,b)=>a-b);
      const n=arg('n');
      if (Number.isInteger(n)&&n<=30) { const first=ids.length&&ids.every(id=>id>=1)?1:0; ids=Array.from({length:n},(_,i)=>i+first); root=first; }
      vertices=ids.map(id=>({id,label:arg('label')?.[id] ? id+' · '+arg('label')[id] : id}));
    }
    if (!vertices.length || vertices.length>32) return '';
    const ids=new Set(vertices.map(node=>node.id)); edges=edges.filter(edge=>ids.has(edge[0])&&ids.has(edge[1]));
    const coords=new Map(), tree=kind==='tree'||kind==='list';
    if (tree) {
      let column=0;
      function place(id,depth,seen) { if(seen.has(id)||coords.has(id))return; seen.add(id); coords.set(id,{x:50+column++*80,y:45+depth*65}); for(const [a,b] of edges) if(a===id) place(b,kind==='list'?depth:depth+1,seen); }
      place(root,0,new Set()); for(const node of vertices)place(node.id,0,new Set());
    } else vertices.forEach((node,i)=>coords.set(node.id,{x:240+170*Math.cos(i*2*Math.PI/vertices.length),y:155+115*Math.sin(i*2*Math.PI/vertices.length)}));
    const width=Math.max(480,...[...coords.values()].map(p=>p.x+45)),height=Math.max(300,...[...coords.values()].map(p=>p.y+45));
    const active=[x.node,x.node?.id,x.u,x.u?.id,x.v,x.v?.id,x.current,x.current?.id,x.curr?.id,x.head?.id],visited=x.seen??x.visited;
    return `<div class="iv-graph-scroll"><svg class="iv-graph" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t('Đồ thị trạng thái hiện tại','Current graph state'))}"><defs><marker id="iv-arrow" viewBox="0 0 10 10" refX="32" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z"/></marker></defs>${edges.map(([a,b,w])=>{const p=coords.get(a),q=coords.get(b);return `<path class="iv-edge" d="${w==='prev'?`M${p.x},${p.y} Q${(p.x+q.x)/2},${p.y+38} ${q.x},${q.y}`:`M${p.x},${p.y} L${q.x},${q.y}`}" ${directed?'marker-end="url(#iv-arrow)"':''}/>${typeof w==='number'?`<text class="iv-weight" x="${(p.x+q.x)/2}" y="${(p.y+q.y)/2-8}" text-anchor="middle">${w}</text>`:''}`;}).join('')}${vertices.map(node=>{const p=coords.get(node.id),seen=Array.isArray(visited)&&visited.includes(node.id);return `<g class="${active.includes(node.id)?'current':''} ${seen?'visited':''}"><circle cx="${p.x}" cy="${p.y}" r="23"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle">${esc(node.label)}</text></g>`;}).join('')}</svg></div>`;
  }
  function chess() {
    const [a,b,c,d,e,f]=v.args,pieces=[[a,b,'♜'],[c,d,'♝'],[e,f,'♛']],reach=new Set();
    for (const [row,col,directions] of [[a,b,[[1,0],[-1,0],[0,1],[0,-1]]],[c,d,[[1,1],[1,-1],[-1,1],[-1,-1]]]]) for (const [dr,dc] of directions) {
      let r=row+dr,s=col+dc;
      while(r>=1&&r<=8&&s>=1&&s<=8){reach.add(r+','+s);if(pieces.some(p=>p[0]===r&&p[1]===s))break;r+=dr;s+=dc;}
    }
    return `<svg class="iv-chess" viewBox="0 0 410 410" role="img" aria-label="${esc(t('Bàn cờ: xe, tượng, hậu','Chessboard: rook, bishop, queen'))}">${Array.from({length:64},(_,i)=>{const row=8-Math.floor(i/8),col=i%8+1;return `<rect class="${(row+col)%2?'dark-square':''} ${reach.has(row+','+col)?'reachable':''}" x="${25+(col-1)*45}" y="${20+(8-row)*45}" width="45" height="45"/>`;}).join('')}${pieces.map(([r,c,p])=>`<text class="iv-piece" x="${47.5+(c-1)*45}" y="${55+(8-r)*45}" text-anchor="middle">${p}</text>`).join('')}${Array.from({length:8},(_,i)=>`<text x="${47.5+i*45}" y="399" text-anchor="middle">${i+1}</text><text x="10" y="${49+i*45}" text-anchor="middle">${8-i}</text>`).join('')}</svg><small>${t('Ô tô màu: có thể tới trong một bước, dừng khi gặp quân cản.','Highlighted: reachable in one move, stopping at the first blocking piece.')}</small>`;
  }
  function points() {
    let input=arg('points');
    if(!Array.isArray(input)&&Array.isArray(arg('xCoord')))input=arg('xCoord').map((x,i)=>[x,arg('yCoord')[i]]);
    if(!Array.isArray(input)||!input.length||!input.every(p=>Array.isArray(p)&&p.length>=2&&p.slice(0,2).every(Number.isFinite)))return '';
    const xs=input.map(p=>p[0]),ys=input.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const px=x=>55+(x-minX)/Math.max(1,maxX-minX)*350,py=y=>250-(y-minY)/Math.max(1,maxY-minY)*205;
    return `<svg class="iv-points" viewBox="0 0 460 290" role="img" aria-label="${esc(t('Các điểm trên mặt phẳng','Points on the plane'))}"><path class="iv-edge" d="M35 260 H430 M45 270 V25"/>${[x.x1,x.y1,x.x2,x.y2].every(Number.isFinite)?`<rect class="iv-region" x="${px(Math.min(x.x1,x.x2))}" y="${py(Math.max(x.y1,x.y2))}" width="${Math.abs(px(x.x1)-px(x.x2))}" height="${Math.abs(py(x.y1)-py(x.y2))}"/>`:''}${input.slice(0,40).map(([a,b,z],i)=>`<g class="${[x.i,x.j,x.index].includes(i)?'current':''}"><circle cx="${px(a)}" cy="${py(b)}" r="7"/><text x="${px(a)+10}" y="${py(b)-10}">${esc('('+a+', '+b+(z===undefined?'':', '+z)+')')}</text></g>`).join('')}</svg>`;
  }
  function circles() {
    const circles=arg('circles'),width=arg('xCorner')??arg('X'),height=arg('yCorner')??arg('Y');
    if(!Array.isArray(circles)||!Number.isFinite(width)||!Number.isFinite(height))return '';
    const maximumX=Math.max(width,...circles.map(([x,,r])=>x+r)),maximumY=Math.max(height,...circles.map(([,y,r])=>y+r));
    const scale=300/Math.max(maximumX,maximumY,1),px=x=>40+x*scale,py=y=>350-y*scale;
    return `<svg class="iv-points" viewBox="0 0 420 400" role="img" aria-label="${esc(t('Hình chữ nhật và các đĩa tròn cản đường','Rectangle and circular obstacles'))}"><rect class="iv-region" x="40" y="${py(height)}" width="${width*scale}" height="${height*scale}"/>${circles.map(([a,b,r],i)=>`<circle class="iv-obstacle ${x.i===i?'active':''}" cx="${px(a)}" cy="${py(b)}" r="${r*scale}"/>`).join('')}<circle cx="40" cy="350" r="5"/><circle cx="${px(width)}" cy="${py(height)}" r="5"/><text x="40" y="375">(0,0)</text><text x="${px(width)}" y="${py(height)-12}">(${width},${height})</text></svg>`;
  }
  function ring(name) {
    const raw=value(name),items=typeof raw==='string'?[...raw]:raw;
    if(!Array.isArray(items)||!items.length||items.length>24)return '';
    const at=i=>({x:220+140*Math.cos(-Math.PI/2+i*2*Math.PI/items.length),y:160+115*Math.sin(-Math.PI/2+i*2*Math.PI/items.length)});
    return `<svg class="iv-graph" viewBox="0 0 440 320" role="img" aria-label="${esc(t('Mảng vòng tròn: ô cuối nối ô đầu','Circular array: the last cell joins the first'))}">${items.map((_,i)=>{const a=at(i),b=at((i+1)%items.length);return `<path class="iv-edge" d="M${a.x},${a.y} L${b.x},${b.y}"/>`;}).join('')}${items.map((item,i)=>{const p=at(i);return `<g class="${[x.i,x.index,x.start].includes(i)?'current':''}"><circle cx="${p.x}" cy="${p.y}" r="22"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle">${esc(item)}</text><text x="${p.x}" y="${p.y+40}" text-anchor="middle">${i}</text></g>`;}).join('')}</svg>`;
  }
  function bits() {
    const names=[...new Set([...(v.changed||[]),...v.names,'mask','ans','answer','once','twice','value','query'])].filter(name=>Number.isSafeInteger(value(name))).slice(0,5);
    if(!names.length)return '';
    const width=Math.min(52,Math.max(4,...names.map(name=>value(name)<0?32:BigInt(value(name)).toString(2).length)));
    return `<div class="iv-bit-rows">${names.map(name=>{const number=value(name),bitstring=BigInt.asUintN(width,BigInt(number)).toString(2).padStart(width,'0');return `<div><header><b>${esc(name)}</b><span>${number}</span></header><div class="iv-bit-grid">${[...bitstring].map((bit,i)=>`<span class="${bit==='1'?'on':''}"><small>${width-i-1}</small><b>${bit}</b></span>`).join('')}</div></div>`;}).join('')}</div>`;
  }
  function intervals() {
    const name=v.names.find(n=>['intervals','segments','ranges','events'].includes(n)),rows=arg(name);
    if(!Array.isArray(rows)||!rows.length||!rows.every(row=>Array.isArray(row)&&row.length>=2&&row.slice(0,2).every(Number.isFinite)))return '';
    const min=Math.min(...rows.map(row=>row[0])),max=Math.max(...rows.map(row=>row[1])),at=n=>60+(n-min)/Math.max(1,max-min)*350;
    return `<svg class="iv-intervals" viewBox="0 0 460 ${rows.slice(0,15).length*35+20}" role="img" aria-label="${esc(t('Các đoạn trên trục số','Intervals on a number line'))}">${rows.slice(0,15).map(([a,b],i)=>`<g class="${[x.i,x.j,x.index].includes(i)?'current':''}"><text x="8" y="${i*35+24}">#${i}</text><path d="M${at(a)} ${i*35+20} H${at(b)}"/><circle cx="${at(a)}" cy="${i*35+20}" r="4"/><circle cx="${at(b)}" cy="${i*35+20}" r="4"/><text x="${at(a)}" y="${i*35+11}">${a}</text><text x="${at(b)}" y="${i*35+34}">${b}</text></g>`).join('')}</svg>`;
  }
  function numberLine() {
    const names=[...new Set([...v.names,...(v.changed||[]),'left','right','mid','answer','count'])].filter(name=>Number.isFinite(value(name))).slice(0,6);
    if(!names.length)return '';
    const minimum=Math.min(0,...names.map(name=>value(name))),maximum=Math.max(1,...names.map(name=>value(name))),at=n=>100+(n-minimum)/Math.max(1,maximum-minimum)*280;
    return `<svg class="iv-numbers" viewBox="0 0 440 ${names.length*36+35}" role="img" aria-label="${esc(t('Các giá trị trên cùng thang số','Values on a shared number scale'))}">${names.map((name,i)=>{const y=25+i*36,n=value(name);return `<g class="${(v.changed||[]).includes(name)?'current':''}"><text x="5" y="${y+4}">${esc(name)}</text><path d="M100 ${y} H380"/><circle cx="${at(n)}" cy="${y}" r="6"/><text x="${at(n)}" y="${y+19}" text-anchor="middle">${n}</text></g>`;}).join('')}</svg>`;
  }
  const primaryNames=['grid','matrix','board','nums','s','arr','colors','word','text','values','heights','nums1','cost','digitSum','time','points','stream','pattern'];
  let primary=v.teaching.scene.primary||primaryNames.find(name=>v.names.includes(name))||v.names.find(name=>Array.isArray(arg(name))||typeof arg(name)==='string')||v.names[0];
  let art='',heroName=primary;
  const rangeScene=typeof renderRange4000Scene==='function'&&v.id>=4000&&v.id<=5000?renderRange4000Scene(v,language):null;
  if(rangeScene){art=rangeScene.html;heroName=rangeScene.name;}
  else if(kind==='binary-subsequence'&&typeof renderBinarySubsequence3998==='function'){art=renderBinarySubsequence3998(v,language);heroName=t('Biến đổi chuỗi','String transformation');}
  else if(kind==='parity-rotation'&&typeof renderRotationGroups3999==='function'){art=renderRotationGroups3999(v,language);heroName=t('Quay vòng chẵn / lẻ','Even / odd rotations');}
  else if(kind==='chess'){art=chess();heroName=t('Bàn cờ','Chessboard');}
  else if(kind==='circles'){art=circles();heroName=t('Vùng bị chắn','Blocked regions');}
  else if(kind==='circular')art=ring(primary);
  else if(['tree','graph','list'].includes(kind))art=graph();
  else if(kind==='points')art=points();
  else if(kind==='bits')art=bits();
  else if(kind==='number')art=numberLine();
  else if(kind==='tokens'&&Array.isArray(arg('nums'))){art=`<div class="iv-token-row">${arg('nums').map((number,i)=>`<div><span>${arg('s')[i]==='1'?'●':'○'}</span><b>${esc(number)}</b><small>${i}</small></div>`).join('')}</div>`;}
  if(!art)art=intervals();
  if(kind==='table') {
    const tables=arg('tables')||v.args[0],rows=Array.isArray(x.rows)?x.rows:Array.isArray(x.result)?x.result:x.intermediate?.at(-1)?.rows;
    if(rows){heroName=x.stage||'rows';art=picture(rows,heroName);}
    else if(tables&&typeof tables==='object'&&!Array.isArray(tables)){heroName=Object.keys(tables)[0];art=picture(tables[heroName],heroName);}
  }
  if(kind==='path-grid'&&v.final&&Array.isArray(v.result)&&v.result.length){heroName='grid';art=matrix(v.result,'grid');}
  if(v.id===3337&&Array.isArray(x.counts)){heroName='counts';art=picture(x.counts,'counts');}
  if(kind==='dp'&&x.dp&&typeof x.dp==='object'){heroName='dp';art=picture(x.dp,'dp');}
  if(!art&&primary)art=picture(value(primary),primary);
  if(!art)art='<span class="iv-empty">'+t('Chờ dữ liệu của bước đầu','Waiting for the first step')+'</span>';
  const ignored=new Set(['self','connection','query','statement','definitions','placeholders','columns','pendingTimers',heroName,...(v.id===4096?['before']:[])]);
  const candidates=[...new Set([...(v.changed||[]),...(v.teaching.focus||[]),'dp','counts','count','heap','queue','stack','parent'])].filter(name=>!ignored.has(name)&&x[name]!==undefined&&x[name]!==null&&typeof x[name]==='object'&&!ref(x[name]));
  const states=['parity-rotation','binary-subsequence'].includes(kind)?[]:candidates.filter(name=>!(kind==='list'&&Array.isArray(x[name])&&x[name].every(ref))).slice(0,2);
  // Keep the current command visible even when its object has no stored fields yet.
  const command=x.operation ? `<span class="iv-command">${esc(x.operation)}(${esc(brief(x.args||[]))})</span>` : '';
  const metrics=['parity-rotation','binary-subsequence'].includes(kind)?[]:[...new Set([...(v.changed||[]),'ans','answer','count','best','left','right','mid'])].filter(name=>!ignored.has(name)&&scalar(x[name])&&x[name]!==undefined&&String(x[name]).length<40&&!['operations','arguments'].includes(name)).slice(0,4);
  const lines=typeof problemData!=='undefined'&&Array.isArray(problemData.code)?problemData.code:[];
  const first=Math.max(0,v.line-4),last=Math.min(lines.length,v.line+3);
  const code=(lines.length?lines.slice(first,last).map((line,index)=>({number:first+index+1,line})):[{number:v.line,line:v.source}]).map(({number,line})=>`<div class="${number===v.line?'current':''}" data-code-line="${number}" ${number===v.line?'aria-current="step"':''}><span>${number}</span><code>${esc(line)}</code></div>`).join('');
  const hint=String(vi?v.teaching.vi:v.teaching.en).split(/(?<=[.!?])\s+/)[0];
  const changed=['parity-rotation','binary-subsequence'].includes(kind)?[]:(v.changed||[]).filter(name=>!ignored.has(name)&&Object.hasOwn(v.oldValues||{},name)&&scalar(x[name])&&scalar(v.oldValues[name])).slice(0,2);
  const transition=changed.map(name=>`<span><code>${esc(name)}</code> <del>${esc(brief(v.oldValues[name]))}</del> → <b>${esc(brief(x[name]))}</b></span>`).join('');
  const branch=v.branch===null?'':`<span class="iv-branch ${v.branch?'yes':'no'}">${v.branch?'✓':'✕'} ${t(v.branch?'Đúng':'Sai',v.branch?'True':'False')}</span>`;
  return `<section class="iv-scene" data-guided-id="${v.id}" data-illustrated-kind="${esc(kind)}"><header class="iv-heading"><strong>${v.final?'✓ '+t('KẾT QUẢ','RESULT'):t('BƯỚC ĐANG XÉT','CURRENT STEP')}</strong><span><i class="iv-dot gold"></i>${t('đang xét','current')} <i class="iv-dot green"></i>${t('vừa đổi','changed')}</span></header><p class="iv-hint">${esc(hint)}</p><div class="iv-hero"><header><b>${esc(label(heroName||kind))}</b>${command}${branch}</header>${art}</div>${transition?`<div class="iv-transition">${transition}</div>`:''}${states.length?`<div class="iv-states">${states.map(name=>`<section><header>${esc(label(name))}<code>${esc(name)}</code></header>${picture(x[name],name)}</section>`).join('')}</div>`:''}${metrics.length?`<div class="iv-metrics">${metrics.map(name=>`<div><small>${esc(label(name))}</small><b>${esc(brief(x[name]))}</b></div>`).join('')}</div>`:''}<section class="iv-debug"><header><strong>${t('Dòng','Line')} ${v.line}</strong><span class="iv-scope">${esc(v.frames?.at(-1)?.name||'')}</span><nav><button type="button" data-iv-step="-1" aria-label="${esc(t('Lùi một dòng','Previous line'))}" title="${esc(t('Lùi một dòng','Previous line'))}">←</button><button type="button" data-iv-step="1" aria-label="${esc(t('Tiến một dòng','Next line'))}" title="${esc(t('Tiến một dòng','Next line'))}">→</button></nav></header><div class="iv-source">${code}</div></section></section>`;
}
