'use strict';

// Source-backed pictures shared by the interval / difference / scheduling study path.
// Geometry, heap trees, DP cells and interval endpoints each have a native diagram.
function sweepStudyEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
function sweepStudyFormat(value) {
  if (typeof value === 'number' && !Number.isInteger(value)) return Number(value.toFixed(5)).toString();
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value ?? '—');
}
function sweepStudyHTML(step, language = 'en') {
  const v = step.sweepStudyView;
  if (!v) return '';
  const vi = language === 'vi', s = { ...(v.check || {}), ...v.state }, o = v.original, c = v.config;
  const esc = sweepStudyEscape, fmt = value => esc(sweepStudyFormat(value));
  const text = (a,b) => vi ? a : b;
  const get = key => Object.hasOwn(s,key) ? s[key] : o[key];
  const colors = ['#38bdf8','#a78bfa','#34d399','#fbbf24','#fb7185','#2dd4bf'];
  const validPoint = p => Array.isArray(p) && p.length >= 2 && p.slice(0,2).every(Number.isFinite);
  const heading = label => `<h4>${esc(label)}</h4>`;
  function cells(name, values, active = s.i) {
    if (!Array.isArray(values)) return '';
    return `<div class="swp-data">${heading(name)}<div class="swp-cells" role="list">${values.map((value,index) =>
      `<div class="swp-cell${index === active ? ' is-current' : ''}" role="listitem" data-cell="${esc(name)}:${index}"><small>${index}</small><strong>${fmt(value)}</strong></div>`).join('') || `<span>${text('Rỗng','Empty')}</span>`}</div></div>`;
  }
  function intervals() {
    const lanes = [];
    if(c.employees && Array.isArray(o.schedule)) o.schedule.forEach((employee,i)=>lanes.push({name:`${text('Nhân viên','Employee')} ${i}`,rows:employee}));
    if(c.lights && Array.isArray(o.lights)) {
      lanes.push({ name: text('Vùng sáng','Light ranges'), rows: o.lights.map(([p,r])=>[Math.max(o.n ? 0 : -Infinity,p-r), Math.min(o.n ? o.n-1 : Infinity,p+r)]) });
    }
    if(c.taskDurations && Array.isArray(o.tasks)) lanes.push({ name:text('Đến → thời lượng','Arrival → duration'), rows:o.tasks.map(([a,d],i)=>[a,a+d,`T${i}`]) });
    for(const name of c.lanes || []) {
      let values = get(name);
      if(!Array.isArray(values)) continue;
      if(values.length && !Array.isArray(values[0]) && values.length===2) values=[values];
      if(values.every(validPoint)) lanes.push({ name, rows:values });
    }
    if(!lanes.length) return '';
    let lo = Math.min(...lanes.flatMap(l=>l.rows.flatMap(r=>r.slice(0,2))),0), hi = Math.max(...lanes.flatMap(l=>l.rows.flatMap(r=>r.slice(0,2))),1);
    if(Number.isFinite(o.days)) hi=Math.max(hi,o.days);
    if(Number.isFinite(o.n)) hi=Math.max(hi,o.n-1);
    const x = value => 108 + (value-lo) / Math.max(1,hi-lo) * 315;
    let y=36;
    const parts=[];
    for(let i=0;i<=5;i++) {
      const value=lo+(hi-lo)*i/5;
      parts.push(`<text class="swp-tick" x="${x(value)}" y="17" text-anchor="middle">${fmt(value)}</text>`);
    }
    lanes.forEach((lane,group)=>{
      parts.push(`<text class="swp-label" x="8" y="${y+4}">${esc(lane.name)}</text>`);
      if(!lane.rows.length) {parts.push(`<text class="swp-tick" x="124" y="${y+4}">∅</text>`);y+=24;}
      lane.rows.forEach((row,index)=>{
        const [a,b,weight]=row;
        const cursorIndex = /secondList|slots2/.test(lane.name) ? s.j : s.i;
        const current = !v.final && (cursorIndex===index || (s.start===a && (s.end===b || s.finish===b)));
        const color = /removed|toBeRemoved/.test(lane.name) ? '#fb7185' : /result|gaps|kept|attended|selected/.test(lane.name) ? '#34d399' : colors[group%colors.length];
        const closed = c.closed && !['operations','segments'].includes(lane.name);
        const annotation = lane.name==='assignments' ? ` · ${text('ghế','chair')} ${fmt(weight)} · F${fmt(row[3])}`
          : lane.name==='timeline' ? ` · ${v.id===1882?'S':'T'}${fmt(weight)}${row[3]!==undefined?` · T${fmt(row[3])}`:''}`
          : weight!==undefined?` · ${fmt(weight)}`:'';
        parts.push(`<g data-interval="${esc(lane.name)}:${index}" class="${current?'is-current':''}"><line x1="${x(a)}" y1="${y}" x2="${x(b)}" y2="${y}" stroke="${color}" stroke-width="${current?12:7}" opacity="${current?1:.65}"/><circle cx="${x(a)}" cy="${y}" r="4" fill="${color}"/><circle cx="${x(b)}" cy="${y}" r="4" fill="${closed?color:'var(--swp-bg)'}" stroke="${color}" stroke-width="2"/><text class="swp-value" x="446" y="${y+4}">${index}: [${fmt(a)}, ${fmt(b)}${closed?']':')'}${annotation}</text></g>`);
        y+=24;
      });
      y+=16;
    });
    const cursor = [s.x,s.time,s.day].find(Number.isFinite);
    if(cursor!==undefined && cursor>=lo && cursor<=hi) parts.push(`<line class="swp-cursor" x1="${x(cursor)}" x2="${x(cursor)}" y1="23" y2="${y-8}"/><text class="swp-tick" x="${x(cursor)}" y="${y+8}" text-anchor="middle">${fmt(cursor)}</text>`);
    return `<div class="swp-chart">${heading(text('Khoảng trên cùng trục tọa độ','Intervals on a shared axis'))}<svg viewBox="0 0 690 ${y+22}" role="img" aria-label="${text('Các khoảng và con trỏ quét','Intervals and sweep cursor')}">${parts.join('')}</svg><p class="swp-legend">● ${text('Có tính đầu mút','Included endpoint')} · ○ ${text('Không tính đầu mút','Excluded endpoint')} · ${text('Thanh dày: khoảng đang xét','Thick bar: current interval')}</p></div>`;
  }
  function coverage() {
    if(v.kind!=='difference') return '';
    const target = Array.isArray(o.requirement) ? o.requirement : Array.isArray(o.nums) && o.nums.every(Number.isFinite) ? o.nums : null;
    const actual = s.capacity || s.coverage || s.brightness || (v.id===1109?s.result:null);
    if(!Array.isArray(actual) && !target) return '';
    const size=Math.max(actual?.length||0,target?.length||0), width=Math.max(500,size*32+70);
    const max=Math.max(1,...(actual||[]).filter(Number.isFinite),...(target||[]));
    const barW=(width-70)/Math.max(1,size), base=139, scale=100/max;
    const parts=[`<line class="swp-axis" x1="40" x2="${width-15}" y1="${base}" y2="${base}"/>`];
    for(let i=0;i<size;i++) {
      const x=40+i*barW;
      if(target) parts.push(`<rect x="${x+2}" y="${base-target[i]*scale}" width="${barW-5}" height="${target[i]*scale}" fill="#fb7185" opacity=".25"/><text class="swp-tick" x="${x+barW/2}" y="${base-target[i]*scale-5}" text-anchor="middle">${fmt(target[i])}</text>`);
      if(actual && i<actual.length) parts.push(`<rect data-coverage="${i}" x="${x+barW*.25}" y="${base-actual[i]*scale}" width="${barW*.45}" height="${Math.max(1,actual[i]*scale)}" fill="${target && actual[i]<target[i]?'#fb7185':'#34d399'}"/><text class="swp-value" x="${x+barW/2}" y="${base-actual[i]*scale-5}" text-anchor="middle">${fmt(actual[i])}</text>`);
      parts.push(`<text class="swp-tick" x="${x+barW/2}" y="158" text-anchor="middle">${i+(c.indexBase||0)}</text>`);
      if(i===s.i) parts.push(`<path d="M ${x+barW/2-5} 172 L ${x+barW/2+5} 172 L ${x+barW/2} 164 Z" fill="#fbbf24"/>`);
    }
    return `<div class="swp-chart">${heading(text('Độ phủ / sức giảm tại từng vị trí','Coverage / decrement capacity per position'))}<svg viewBox="0 0 ${width} 180" role="img" aria-label="coverage histogram">${parts.join('')}</svg><p class="swp-legend">${text('Xanh: đủ độ phủ · Đỏ nhạt: yêu cầu · Đỏ: còn thiếu','Green: sufficient capacity · Pale red: requirement · Red: deficit')}</p></div>`;
  }
  function heap(name, values) {
    if(!Array.isArray(values)) return '';
    const n=values.length, levels=Math.ceil(Math.log2(n+1));
    const nodeWidth=Math.max(80,...values.map(value=>sweepStudyFormat(value).length*8+16));
    const w=Math.max(480,2**Math.max(0,levels-1)*(nodeWidth+12)),h=Math.max(60,levels*68);
    const pos=i=>{const level=Math.floor(Math.log2(i+1));return {x:(i-(2**level-1)+.5)*w/2**level,y:22+level*68};};
    const shapes=[];
    values.forEach((value,i)=>{
      const p=pos(i);
      if(i) {const parent=pos((i-1)>>1);shapes.push(`<line class="swp-axis" x1="${parent.x}" y1="${parent.y+15}" x2="${p.x}" y2="${p.y-15}"/>`);}
      shapes.push(`<rect class="swp-heap-node${i===0?' is-root':''}" x="${p.x-nodeWidth/2}" y="${p.y-15}" width="${nodeWidth}" height="30" rx="9"/><text class="swp-value" x="${p.x}" y="${p.y+4}" text-anchor="middle">${fmt(value)}</text>`);
    });
    return `<div class="swp-chart">${heading(`${name} · ${n} ${text('phần tử','items')}`)}<svg style="min-width:${Math.min(w,Math.max(480,w-80))}px" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(name)} heap">${shapes.join('')||'<text class="swp-tick" x="20" y="30">∅</text>'}</svg><p class="swp-legend">${text('Gốc heap được tô vàng. Số âm mô phỏng max-heap của Python. Tuple so sánh từ trái qua phải.','The heap root is gold. Negative keys implement a Python max-heap. Tuples compare left to right.')}</p></div>`;
  }
  function dpTable(name,table) {
    if(!Array.isArray(table)||!table.length) return '';
    return `<div class="swp-data">${heading(`${name}[${text('sự kiện','event')}][${text('số được chọn','allowed count')}]`)}<div class="swp-table-wrap"><table><thead><tr><th>i \\ k</th>${table[0].map((_,i)=>`<th>${i}</th>`).join('')}</tr></thead><tbody>${table.map((row,i)=>`<tr><th>${i}</th>${row.map((value,k)=>`<td data-dp="${i}:${k}" class="${i===s.i&&k===s.count?'is-current':''}">${fmt(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  }
  function geometry() {
    if(v.kind!=='geometry') return '';
    const points=c.points?(o[c.points]||[]):[], rects=c.rectangles?(o.rectangles||[]):[], squares=c.squares?(o.squares||[]):[];
    const bounds=[...points,...rects.flatMap(([a,b,d,e])=>[[a,b],[d,e]]),...squares.flatMap(([x,y,l])=>[[x,y],[x+l,y+l]])];
    if(!bounds.length) return '';
    const minX=Math.min(...bounds.map(p=>p[0])), maxX=Math.max(...bounds.map(p=>p[0]));
    const minY=Math.min(...bounds.map(p=>p[1])), maxY=Math.max(...bounds.map(p=>p[1]));
    const scale=Math.min(590/Math.max(1,maxX-minX),330/Math.max(1,maxY-minY));
    const x=value=>65+(value-minX)*scale, y=value=>385-(value-minY)*scale;
    const parts=[];
    for(let tick=0;tick<=5;tick++) {
      const vx=minX+(maxX-minX)*tick/5,vy=minY+(maxY-minY)*tick/5;
      parts.push(`<line class="swp-gridline" x1="${x(vx)}" x2="${x(vx)}" y1="${y(minY)}" y2="${y(maxY)}"/><text class="swp-tick" x="${x(vx)}" y="408" text-anchor="middle">${fmt(vx)}</text><line class="swp-gridline" x1="${x(minX)}" x2="${x(maxX)}" y1="${y(vy)}" y2="${y(vy)}"/><text class="swp-tick" x="52" y="${y(vy)+4}" text-anchor="end">${fmt(vy)}</text>`);
    }
    const shapes=[...rects,...squares.map(([a,b,l])=>[a,b,a+l,b+l])];
    if(c.union) {
      // A mask renders the union once, so overlaps are not darkened like in 3453.
      parts.push(`<defs><mask id="swp-union-mask">${shapes.map(([a,b,d,e])=>`<rect x="${x(a)}" y="${y(e)}" width="${(d-a)*scale}" height="${(e-b)*scale}" fill="white"/>`).join('')}</mask></defs><rect x="0" y="0" width="720" height="430" fill="#38bdf8" opacity=".3" mask="url(#swp-union-mask)"/>`);
    }
    shapes.forEach(([a,b,d,e],i)=>parts.push(`<rect data-shape="${i}" x="${x(a)}" y="${y(e)}" width="${(d-a)*scale}" height="${(e-b)*scale}" fill="${c.union?'none':colors[i%colors.length]}" fill-opacity=".24" stroke="${colors[i%colors.length]}" stroke-width="${s.i===i?4:1.7}"/><text class="swp-tick" x="${x(a)+4}" y="${y(e)+14}">${i}</text>`));
    if(c.rectangles) parts.push(`<rect x="${x(minX)}" y="${y(maxY)}" width="${(maxX-minX)*scale}" height="${(maxY-minY)*scale}" fill="none" stroke="#fbbf24" stroke-dasharray="5 5"/>`);
    const polygon=(list,color,closed=true)=>{
      if(!Array.isArray(list)||!list.length||!list.every(validPoint)) return;
      parts.push(`<${closed?'polygon':'polyline'} points="${list.map(p=>`${x(p[0])},${y(p[1])}`).join(' ')}" fill="${closed?color:'none'}" fill-opacity=".12" stroke="${color}" stroke-width="3"/>`);
    };
    if(Array.isArray(s.rectangle)) polygon(s.rectangle,'#fbbf24');
    if(Array.isArray(s.best_box)) polygon(s.best_box,'#34d399');
    if(c.hull) { polygon(s.lower,'#34d399',false);polygon(s.upper,'#a78bfa',false); }
    const cornerPoints=Array.isArray(s.corners)?s.corners:[];
    const visible=[...points,...cornerPoints];
    visible.forEach(p=>{
      if(!validPoint(p)) return;
      const current=Array.isArray(s.point)&&s.point[0]===p[0]&&s.point[1]===p[1];
      const hull=Array.isArray(s.result)&&s.result.some(r=>validPoint(r)&&r[0]===p[0]&&r[1]===p[1]);
      parts.push(`<circle data-point="${esc(p.join(','))}" cx="${x(p[0])}" cy="${y(p[1])}" r="${current?7:4.5}" fill="${current?'#fbbf24':hull?'#34d399':'#e2e8f0'}" stroke="#334155"/><text class="swp-tick" x="${x(p[0])+9}" y="${y(p[1])-8}">(${fmt(p[0])},${fmt(p[1])})</text>`);
    });
    const horizontal=Number.isFinite(s.cut)?s.cut:c.squares&&Number.isFinite(s.y)?s.y:null;
    if(horizontal!==null) parts.push(`<line class="swp-cursor" x1="${x(minX)-8}" x2="${x(maxX)+15}" y1="${y(horizontal)}" y2="${y(horizontal)}"/><text class="swp-value" x="${x(minX)}" y="${y(horizontal)-9}">y = ${fmt(horizontal)}</text>`);
    if(!c.squares&&Number.isFinite(s.x)) parts.push(`<line class="swp-cursor" x1="${x(s.x)}" x2="${x(s.x)}" y1="${y(minY)+5}" y2="${y(maxY)-5}"/>`);
    let out=`<div class="swp-chart">${heading(text('Mặt phẳng tọa độ','Coordinate plane'))}<svg viewBox="0 0 740 430" role="img" aria-label="geometry visualization">${parts.join('')}</svg><p class="swp-legend">${c.squares?text(c.union?'Diện tích hợp: phần giao chỉ tính một lần.':'Tổng diện tích: phần giao được tính theo từng hình.',c.union?'Union area: overlaps count once.':'Total area: overlaps count once per square.'):text('Vàng: ứng viên / điểm đang xét · Xanh: kết quả tốt nhất / biên','Gold: candidate / current point · Green: best rectangle / boundary')}</p></div>`;
    if(Array.isArray(s.slabs)) out+=`<div class="swp-data">${heading(text('Các dải y · diện tích = chiều cao × bề rộng','Y slabs · area = height × width'))}<div class="swp-cells">${s.slabs.map(([a,b,w])=>`<div class="swp-slab"><small>[${fmt(a)}, ${fmt(b)}]</small><strong>${fmt(w)} × ${fmt(b-a)} = ${fmt(w*(b-a))}</strong></div>`).join('')}</div></div>`;
    if(c.union&&Array.isArray(s.xs)&&Array.isArray(s.count)) out+=segmentTree();
    return out;
  }
  function segmentTree() {
    const xs=s.xs,m=xs.length-1,levels=Math.ceil(Math.log2(Math.max(1,m)))+1,w=Math.max(700,m*72),parts=[];
    function node(index,left,right,level,slot,slots) {
      const px=(slot+.5)*w/slots,py=25+level*70;
      if(right-left>1) {
        const mid=(left+right)>>1;
        for(const [child,a,b,childSlot] of [[index*2,left,mid,slot*2],[index*2+1,mid,right,slot*2+1]]) {
          const cx=(childSlot+.5)*w/(slots*2);
          parts.push(`<line class="swp-axis" x1="${px}" y1="${py+20}" x2="${cx}" y2="${py+50}"/>`);
          node(child,a,b,level+1,childSlot,slots*2);
        }
      }
      parts.push(`<rect class="swp-heap-node${s.node===index?' is-root':''}" x="${px-36}" y="${py-18}" width="72" height="40" rx="7"/><text class="swp-tick" x="${px}" y="${py-5}" text-anchor="middle">[${fmt(xs[left])},${fmt(xs[right])})</text><text class="swp-value" x="${px}" y="${py+12}" text-anchor="middle">${s.count[index]||0} · ${fmt(s.length?.[index]||0)}</text>`);
    }
    node(1,0,m,0,0,1);
    return `<div class="swp-chart">${heading(text('Segment tree · số lần phủ / độ dài hợp','Segment tree · cover count / union length'))}<svg viewBox="0 0 ${w} ${levels*70}" role="img" aria-label="coverage segment tree">${parts.join('')}</svg></div>`;
  }
  function cards() {
    let html='';
    if(c.projects) html+=`<div class="swp-data">${heading(text('Dự án · vốn yêu cầu → lợi nhuận','Projects · required capital → profit'))}<div class="swp-cells">${o.profits.map((profit,i)=>`<div class="swp-slab${o.capital[i]<=s.w?' is-current':''}"><small>#${i}</small><strong>${o.capital[i]} → +${profit}</strong></div>`).join('')}</div></div>`;
    if(c.courses) html+=`<div class="swp-data">${heading(text('Khóa học · thời lượng / deadline','Courses · duration / deadline'))}<div class="swp-cells">${(s.courses||o.courses).map(([d,e])=>`<div class="swp-slab${d===s.duration&&e===s.deadline?' is-current':''}"><strong>${d} / ${e}</strong><small>${text('thời gian đã chọn','selected time')}: ${fmt(s.total)}</small></div>`).join('')}</div></div>`;
    if(c.workers) html+=`<div class="swp-data">${heading(text('Nhân công · quality / wage / tỉ lệ tối thiểu','Workers · quality / wage / minimum ratio'))}<div class="swp-cells">${o.quality.map((q,i)=>`<div class="swp-slab${i===s.index?' is-current':''}"><small>#${i}</small><strong>${q} / ${o.wage[i]} / ${fmt(o.wage[i]/q)}</strong></div>`).join('')}</div></div>`;
    return html;
  }
  function events() {
    let html='';
    for(const name of c.maps||[]) {
      const value=s[name], entries=value?.__pairs__ || (value&&typeof value==='object'?Object.entries(value):null);
      if(!entries) continue;
      html+=`<div class="swp-data">${heading(`${name} · ${text('tọa độ → thay đổi','coordinate → delta')}`)}<div class="swp-cells">${entries.slice().sort((a,b)=>a[0]-b[0]).map(([key,value])=>`<div class="swp-slab${key===s.x?' is-current':''}"><small>${fmt(key)}</small><strong>${Number(value)>0?'+':''}${fmt(value)}</strong></div>`).join('')}</div></div>`;
    }
    return html;
  }
  const scalarNames=['i','j','start','end','left','right','x','y','day','time','active','need','used','count','lo','mid','hi','w','profit','total','deadline','chair','friend','ratio','total_quality','cost','answer','best','width','area','target','accumulated','cut','skip','take','node','ql','qr'];
  const scalars=scalarNames.filter(key=>Object.hasOwn(s,key)&&!Array.isArray(s[key])&&typeof s[key]!=='object');
  let body=intervals()+coverage()+geometry()+cards()+events();
  for(const name of c.heaps||[]) body+=heap(name,s[name]);
  for(const name of c.tables||[]) body+=dpTable(name,s[name]);
  for(const name of c.arrays||[]) {
    if(c.union&&['count','length'].includes(name)) continue;
    body+=cells(name,get(name),name==='xs'?s.left:s.i);
  }
  for(const name of c.results||[]) body+=cells(name,s[name],-1);
  return `<section class="swp-study${v.final?' is-final':''}" data-problem="${v.id}" data-source-line="${v.line}"><div class="swp-heading"><span class="swp-badge">#${v.id}</span><h3>${esc(v.title[language]||v.title.en)}</h3>${v.final?`<span class="swp-result">${text('Kết quả','Result')}: ${fmt(v.answer)}</span>`:''}</div><p class="swp-hint">${esc(v.hint[language]||v.hint.en)}</p><div class="swp-now"><span>L${v.line}</span><code>${esc(v.source)}</code>${v.branch===null?'':`<b class="${v.branch?'is-true':'is-false'}">${v.branch?'True':'False'}</b>`}</div>${v.check?`<p class="swp-legend">${text('Giữ hình từ lần kiểm tra prefix','Retained picture from checked prefix')} k = ${fmt(v.check.count)}</p>`:''}<div class="swp-scalars">${scalars.map(key=>`<span><small>${esc(key)}</small><strong>${fmt(s[key])}</strong></span>`).join('')}</div>${body}</section>`;
}
function renderSweepStudy(step) {
  document.getElementById('treeView').innerHTML=sweepStudyHTML(step,typeof lang!=='undefined'?lang:'en');
}
