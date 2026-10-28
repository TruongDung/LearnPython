/* Picture-first lessons. Algorithm state is supplied by the server, never mutated here. */
function renderTopologyLessonPictures(step) {
  const host = $('treeView'); if (!host) return;
  const t = (vi, en) => lang === 'vi' ? vi : en;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const badge = (value, cls = '', label = '') => `<span class="tl-chip ${cls}">${label ? `<small>${esc(label)}</small>` : ''}<b>${esc(value)}</b></span>`;
  const panel = (label, content, cls = '') => `<section class="tl-card ${cls}"><header>${label}</header>${content}</section>`;
  const chips = (values, cls = '') => `<div class="tl-chips">${values.map(x => badge(x, cls)).join('') || '<span class="tl-empty">∅</span>'}</div>`;
  const num = value => value === undefined || value === null ? '—' : value >= 1e18 ? '∞' : value;
  const s = step.locals || {}, final = Boolean(step.final), v = step.topologyLessonView;
  let body = '', label = '', footer = '';
  if (!v) {
    const a = step.substitutions3481View; if (!a) return;
    const f = a.stack.at(-1), chain = a.stack.filter(f => f.kind === 'resolve').map(f => `%${f.key}%`);
    const tokenString = source => `<div class="tl-tokens">${String(source ?? '').split(/(%[A-Z]%)/g).filter(Boolean).map(token => badge(token, /^%[A-Z]%$/.test(token) ? 'blue' : '')).join('') || '∅'}</div>`;
    label = final ? `✓ ${t('Đã thay hết biến','All placeholders expanded')}` : f?.kind === 'resolve' ? `🔎 resolve(${f.key})` : f ? '🧩 expand' : '🗂 values → memo';
    const dependencies = a.mappings.map(m => `<article class="tl-mapping ${m.status==='done'?'green':m.status==='working'?'amber':''}" data-key="${esc(m.key)}">${badge('%'+m.key+'%','blue')}<strong>→</strong>${tokenString(m.value)}<span class="tl-map-result">${m.expanded === null ? '…' : '✓ '+esc(m.expanded)}</span></article>`).join('');
    const parts = (f?.parts || []).map(p => badge(p.value || '∅', p.kind==='replacement'?'green':'', p.key ? `%${p.key}%` : '')).join('');
    body = panel('🔗 '+t('Phụ thuộc · con trước, cha sau','Dependencies · child before parent'), dependencies) +
      (chain.length ? panel('↳ DFS', `<div class="tl-chips">${chain.map((k,i)=>`${i?'<b>→</b>':''}${badge(k,i===chain.length-1?'amber':'blue')}`).join('')}</div>`) : '') +
      (f?.kind==='expand' ? panel(t('Chuỗi đang đọc','Current source'), tokenString(f.source) + `<div class="tl-chips">${f.match?badge(f.match.token,'amber',t('đang thay','replace')):''}${badge(f.start??'—','','start')}</div>`)+panel('parts → join', `<div class="tl-chips">${parts||'∅'}</div>`) : '') +
      panel('🗃 memo', `<div class="tl-chips">${Object.entries(a.memo).map(([k,val])=>badge(`${k} = ${val}`,'green')).join('')||'∅'}</div>`) +
      (final ? panel('✓ '+t('Kết quả','Result'), `<strong class="tl-output">${esc(a.answer)}</strong>`, 'green') : '');
    footer = `${a.stack.length} ${t('lời gọi','calls')} · L${step.codeLines[0]}`;
  } else {
    function graphView(options = {}) {
      const n = v.n, base = v.id === 1136 ? 1 : 0, nodes = Array.from({length:n},(_,i)=>i+base), edges = v.edges;
      const ranks = Object.fromEntries(nodes.map(i=>[i,0])), incoming = Object.fromEntries(nodes.map(i=>[i,0]));
      if (v.id === 3812) {
        const seen = new Set([0]), queue = [0];
        for(let i=0;i<queue.length;i++) for(const [a,b] of edges) {const u=queue[i],to=a===u?b:b===u?a:null;if(to!==null&&!seen.has(to)){seen.add(to);ranks[to]=ranks[u]+1;queue.push(to);}}
      } else {
        edges.forEach(([a,b])=>incoming[b]++); const queue=nodes.filter(i=>!incoming[i]);
        for(let i=0;i<queue.length;i++) for(const [a,b] of edges) if(a===queue[i]){ranks[b]=Math.max(ranks[b],ranks[a]+1);if(!--incoming[b])queue.push(b);}
        if(queue.length!==n) nodes.forEach((u,i)=>ranks[u]=i%3);
      }
      const levels = Math.max(...Object.values(ranks),0)+1, groups = Array.from({length:levels},()=>[]);
      nodes.forEach(u=>groups[ranks[u]].push(u));
      const width = Math.max(540,levels*110), height = Math.max(180,Math.max(...groups.map(g=>g.length))*140), pos={};
      groups.forEach((g,l)=>g.forEach((u,i)=>pos[u]={x:levels===1?width/2:45+l*(width-90)/(levels-1),y:(i+1)*height/(g.length+1)}));
      const arrow = v.id===3812?'':'marker-end="url(#tl-arrow)"';
      let lane=0;
      let svg='<defs><marker id="tl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker></defs>';
      edges.forEach(([a,b,c],i)=>{
        const p=pos[a],q=pos[b],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1, x1=p.x+dx/len*24,y1=p.y+dy/len*24,x2=q.x-dx/len*29,y2=q.y-dy/len*29;
        const cls=options.edge?.(a,b,c,i)||'', text=v.id===3812?'e'+i:c??'';
        const curved=Math.abs(ranks[b]-ranks[a])>1, bend=height+30+lane*30, direction=Math.sign(dx)||1;
        const path=curved?`M${x1},${y1} C${x1+40*direction},${bend} ${x2-40*direction},${bend} ${x2},${y2}`:`M${x1},${y1} L${x2},${y2}`;
        const labelX=(x1+x2)/2, labelY=curved?.125*(y1+y2)+.75*bend:(y1+y2)/2;
        if(curved)lane++;
        svg+=`<g class="tl-edge ${cls}" data-edge="${i}"><path d="${path}" ${arrow}/>${text!==''?`<rect x="${labelX-18}" y="${labelY-12}" width="36" height="22" rx="5"/><text x="${labelX}" y="${labelY+4}" text-anchor="middle">${esc(text)}</text>`:''}</g>`;
      });
      nodes.forEach(u=>{ const p=pos[u],item=options.node?.(u)||{};
        svg+=`<g class="tl-node ${item.cls||''}" data-node="${u}" transform="translate(${p.x},${p.y})"><circle r="23"/><text y="5" text-anchor="middle">${esc(item.label??u)}</text><text class="tl-node-info" y="41" text-anchor="middle">${esc(item.info??'')}</text></g>`;
      });
      return `<div class="tl-graph-wrap"><svg class="tl-graph" style="min-width:${Math.max(300,levels*78)}px" viewBox="0 0 ${width} ${height+60+lane*30}" role="img" aria-label="${esc(t('Đồ thị thuật toán','Algorithm graph'))}">${svg}</svg></div>`;
    }
    if (v.id === 1136) {
      const done = v.terms.flat(), current = v.current;
      label = final ? v.answer===-1 ? '↻ '+t('Còn môn bị khóa','Courses remain locked') : `✓ ${v.answer} ${t('học kỳ','semesters')}` : `🎓 ${t('Mở khóa môn học','Unlock courses')}`;
      body = panel('🎓 '+t('Học trước → học sau','Prerequisite → course'),graphView({node:u=>({cls:done.includes(u)?'green':v.queue.includes(u)?'blue':'',info:`in: ${v.indegree[u]??'—'}`}),edge:(a,b)=>s.u===a&&s.v===b?'amber':done.includes(a)?'green':''})) +
        panel('📅 '+t('Các học kỳ','Semesters'),`<div class="tl-terms">${v.terms.map((term,i)=>`<article><small>${t('Kỳ','Term')} ${i+1}</small>${chips(term,'green')}</article>`).join('')||'∅'}</div>`) +
        panel('→ queue · '+t('chờ tới lượt','waiting'),chips(v.queue,'blue')) +
        `<div class="tl-stats">${badge(`${s.count??0}/${v.n}`,'green',t('đã học','studied'))}${badge(num(s.size),'',t('số môn đầu kỳ','term batch'))}${badge(num(current),'amber',t('đang xét','current'))}</div>`;
    } else if (v.id === 2371) {
      label='▦ '+t('Giá trị nhỏ → rank nhỏ','Small value → small rank');
      const grid = (values, original=false) => {
        const digits=Math.max(1,...values.flat().map(x=>String(x).length)),size=Math.max(42,digits*8);
        return `<div class="tl-grid-wrap"><div class="tl-grid" style="--cols:${v.grid[0].length};min-width:${v.grid[0].length*size}px">${v.grid.flatMap((row,r)=>row.map((_,c)=>`<div class="tl-cell ${v.current?.[0]===r&&v.current?.[1]===c&&!final?'amber':''} ${!original&&values[r]?.[c]?'green':''}" data-cell="${r},${c}"><b style="font-size:${digits>4?Math.max(11,Math.floor(100/digits)):24}px">${esc(values[r]?.[c]||'·')}</b><small>${r},${c}</small></div>`)).join('')}</div></div>`;
      };
      const [r,c]=v.current||[];
      body = `<div class="tl-pair tl-matrix-pair ${v.grid[0].length>3?'wide':''}">${panel(t('Lưới gốc','Original grid'),grid(v.grid,true))}<strong>→</strong>${panel(t('Lưới mới','New grid'),grid(v.result))}</div>` +
        panel('↑ '+t('Duyệt từ nhỏ tới lớn','Process smallest first'),`<div class="tl-chips">${v.cells.map(([value,a,b])=>badge(value,a===r&&b===c&&!final?'amber':v.result[a]?.[b]?'green':'',`${a},${b}`)).join('')}</div>`) +
        (!final&&v.before?panel('rank = 1 + max(row, col)',`<div class="tl-equation">1 + max(${v.before[0]}, ${v.before[1]}) <strong>→ ${v.event==='cell'?'?':v.rank}</strong></div>`):'') +
        `<div class="tl-pair">${panel('row_max',chips(v.rowMax,'blue'))}${panel('col_max',chips(v.colMax,'blue'))}</div>` +
        (final?panel('✓ max',`<div class="tl-equation">${Math.max(...v.result.flat())}</div>`,'green'):'');
    } else if (v.id === 3530) {
      const mask=final?(1<<v.n)-1:v.mask, path=v.path[mask]||[], dp=v.dp[mask];
      label='🪙 '+t('Vị trí × điểm','Position × score');
      body = panel(t('Chỉ chọn khi đủ tiền nhiệm','Select after all prerequisites'),graphView({node:u=>({cls:mask&1<<u?'green':(mask&(v.pre[u]??0))===(v.pre[u]??0)?'blue':'',info:`score ${v.score[u]}`}),edge:(a)=>mask&1<<a?'green':''})) +
        panel('mask · '+mask.toString(2).padStart(v.n,'0'), `<div class="tl-slots">${Array.from({length:v.n},(_,i)=>`<article class="${path[i]===undefined?'':'green'}"><small>#${i+1}</small><b>${path[i]===undefined?'·':'v'+path[i]}</b><small>${path[i]===undefined?'':`${i+1} × ${v.score[path[i]]}`}</small></article>`).join('')}</div>`) +
        (!final&&v.event==='candidate'?panel(t('Thử thêm đỉnh','Try appending node'),`<div class="tl-equation">${num(dp)} + ${v.pos} × ${v.score[s.v]} <strong>= ${v.candidate}</strong></div>`):'') +
        panel(final?'✓ '+t('Lợi nhuận tối đa','Maximum profit'):'dp[mask]', `<div class="tl-equation">${num(dp)}</div>`,'green') +
        (!final?panel('dp · '+t('các tập đã có kết quả','resolved subsets'),`<div class="tl-chips">${v.dp.map((x,i)=>x>=0?badge(x,i===mask?'amber':i===v.next?'blue':'',i.toString(2).padStart(v.n,'0')):'').join('')}</div>`):'');
    } else if (v.id === 3812) {
      const impossible=final&&v.need[0]===1, f=v.stack.at(-1);
      label=final?impossible?'✗ [-1]':`✓ [${[...v.chosen].sort((a,b)=>a-b).join(', ')}]`:'🔄 '+t('Sửa từ lá lên gốc','Fix leaves toward the root');
      body=panel(t('Bit hiện tại · đích dưới mỗi nút','Current bit · target below each node'),graphView({node:u=>({label:v.need.length?Number(v.target[u])^v.need[u]:v.start[u],cls:v.need[u]===1?'red':v.need.length?'green':'',info:`v${u} → ${v.target[u]}`}),edge:(a,b,c,i)=>v.chosen.includes(i)?'green':f?.u===a&&f?.v===b||f?.u===b&&f?.v===a?'amber':''}))+
        panel('DFS ↳',`<div class="tl-chips">${v.stack.map((f,i)=>`${i?'<b>→</b>':''}${badge('v'+f.u,i===v.stack.length-1?'amber':'')}`).join('')||'∅'}</div>`) +
        panel(t('Cạnh đã chọn · chỉ số từ 0','Chosen edges · 0-based indices'),chips(v.chosen.map(i=>'e'+i),'green')) +
        (v.event==='flip'?panel('🔄 '+t('Lật cả hai đầu','Flip both endpoints'),`<div class="tl-equation">v${f.u} ↔ v${f.v} <strong>✓ ${t('con khớp đích','child matches target')}</strong></div>`):'') +
        (impossible?panel('✗ '+t('Gốc còn sai','Root still mismatches'),'<div class="tl-equation red">need[0] = 1 → [-1]</div>','red'):'') +
        `<div class="tl-stats">${badge(v.need.filter(Boolean).length,'red',t('bit còn sai','mismatches'))}${badge(v.chosen.length,'green',t('cạnh đã lật','edges toggled'))}</div>`;
    } else if (v.id === 3620) {
      const route = final ? v.witness?.path||[] : [], threshold=final?v.ans:v.probe;
      label=final?v.ans<0?'✗ '+t('Không có đường hợp lệ','No valid path'):`✓ ${t('Cạnh nhỏ nhất tốt nhất','Best bottleneck')} = ${v.ans}`:'🌐 '+t('Giữ cạnh đủ mạnh','Retain strong enough edges');
      body=panel('0 → '+(v.n-1),graphView({node:u=>({cls:!v.online[u]?'offline':route.includes(u)?'green':u===v.current?'amber':'',info:!v.online[u]?'✕ offline':final?'':`dist ${num(v.dist[u])}`}),edge:(a,b,c)=>!v.online[a]||!v.online[b]?'blocked':final?route.some((x,i)=>x===a&&route[i+1]===b)?'green':'muted':threshold!==null&&c<threshold?'blocked':v.edge?.[0]===a&&v.edge?.[1]===b?'amber':threshold!==null?'blue':''}))+
        panel(t('Tìm nhị phân ngưỡng','Binary-search threshold'),`<div class="tl-chips">${v.vals.map((x,i)=>badge(x,final?x===v.ans?'green':'muted':i===v.mid?'amber':i<v.lo||i>v.hi?'muted':'blue',final?x===v.ans?'✓':'':`${i===v.lo?'lo ':''}${i===v.mid?'mid ':''}${i===v.hi?'hi':''}`)).join('')||'∅'}</div>`) +
        (!final?`<div class="tl-stats">${badge(num(v.probe),'amber',t('ngưỡng thử','threshold'))}${badge(v.feasibleResult===null?'?':v.feasibleResult?'✓':'✕',v.feasibleResult?'green':'',`cost ≤ ${v.k}`)}${badge(v.ans,'green','ans')}</div>`:'')+
        (!final&&v.dist.length?panel(t('Chi phí tới đích · ngân sách','Cost to destination · budget'),`<div class="tl-equation">${num(v.dist[v.n-1])} / ${v.k} ${v.feasibleResult===null?'':v.feasibleResult?'✓':'✕'}</div><div class="tl-budget"><i style="width:${v.k?Math.min(100,100*v.dist[v.n-1]/v.k):0}%"></i></div>`):'')+
        (final&&v.witness?panel('✓ '+t('Đường hợp lệ','Valid path'),`<div class="tl-chips">${route.map((u,i)=>`${i?'<b>→</b>':''}${badge(u,'green')}`).join('')}</div><div class="tl-equation">${t('Tổng','Total')} ${v.witness.cost} ≤ ${v.k}</div><div class="tl-budget"><i style="width:${v.k?Math.min(100,100*v.witness.cost/v.k):0}%"></i></div>`,'green'):!final?panel('topo',chips(v.topo,'blue')):'');
    }
    footer=`L${step.codeLines[0]} · #${v.frame}${v.omitted?' · '+t('đã rút gọn','omitted')+' '+v.omitted:''}`;
  }
  const timeline = typeof steps==='undefined'?[]:steps, at=typeof stepIndex==='undefined'?-1:stepIndex;
  const targets = [['take','🎓'],['cell','▦'],['candidate','🪙'],['flip','🔄'],['relax','🌐'],['memo-save','🗃']];
  const nextEvents = targets.filter(([event])=>timeline.some((row,i)=>i>at&&(row.topologyLessonView||row.substitutions3481View)?.event===event));
  host.innerHTML=`<div class="tl-viz" data-lesson="${v?.id||3481}"><header class="tl-heading"><strong>${label}</strong><small>${footer}</small></header>${body}<nav class="tl-nav">${nextEvents.map(([event,icon])=>`<button type="button" data-tl-jump="${event}">${icon} ${t('Bước chính tiếp','Next key step')} →</button>`).join('')}${!final?`<button type="button" data-tl-jump="result">🏁 ${t('Kết quả','Result')}</button>`:''}</nav></div>`;
  host.querySelectorAll?.('[data-tl-jump]').forEach(button=>button.addEventListener('click',()=>{
    const wanted=button.dataset.tlJump; const next=timeline.findIndex((row,i)=>i>at&&(wanted==='result'?row.final:(row.topologyLessonView||row.substitutions3481View)?.event===wanted));
    if(next>=0){stepIndex=next;renderStep();}
  }));
}
