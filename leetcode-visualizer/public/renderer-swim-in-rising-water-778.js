class SwimRising778Visualizer {
  constructor({host,language="en",escape=escapeHtml}){this.host=host;this.language=language;this.escape=escape;}
  t(vi,en){return this.language==="vi"?vi:en;}
  coord(cell){return cell?`(${cell[0]}, ${cell[1]})`:"?";}
  grid(v){
    const s=72,left=34,top=28,w=left+v.cols.length*s+10,h=top+v.rows.length*s+10;
    const path=new Map(v.path.map((cell,i)=>[cell[0]+":"+cell[1],i]));
    const cellMarkup=v.cells.flatMap((row,ri)=>row.map((cell,ci)=>{
      const current=!v.final&&v.current?.[0]===cell.r&&v.current?.[1]===cell.c;
      const probe=v.probe?.inside&&v.probe.r===cell.r&&v.probe.c===cell.c;
      const id=cell.r+":"+cell.c,onPath=path.has(id),bottleneck=onPath&&cell.height===v.answer;
      const endpoint=cell.r===0&&cell.c===0&&v.n===1?"S / T":cell.r===0&&cell.c===0?"S":cell.r===v.n-1&&cell.c===v.n-1?"T":"";
      const css=[cell.wet?"wet":"dry",cell.queued?"queued":"",cell.settled?"settled":"",current?"current":"",probe?"probe":"",onPath?"path":"",bottleneck?"bottleneck":""].filter(Boolean).join(" ");
      const hillY=55-Math.round(30*cell.height/Math.max(1,v.n*v.n-1));
      return `<g class="sr778-cell ${css}" transform="translate(${left+ci*s},${top+ri*s})" data-r="${cell.r}" data-c="${cell.c}" data-best="${cell.best??"?"}"><title>${this.coord([cell.r,cell.c])} · h=${cell.height} · best=${cell.best??"?"} · ${cell.wet?this.t("đã ngập","submerged"):this.t("chưa ngập","dry")}</title><rect class="surface" x="5" y="5" width="62" height="62" rx="10"/>${cell.wet?'<rect class="water" x="7" y="28" width="58" height="36" rx="7"/><path class="wave" d="M 7 29 Q 17 23 27 29 T 47 29 T 65 29"/>':`<path class="hill" d="M 9 63 L 35 ${hillY} L 64 63 Z"/>`}<rect class="halo" x="1" y="1" width="70" height="70" rx="13"/>${endpoint?`<text class="endpoint" x="14" y="20">${endpoint}</text>`:""}<text class="height" x="36" y="42">${cell.height}</text><text class="best" x="36" y="59">b: ${cell.best??"?"}</text></g>`;
    })).join("");
    const axis=v.cols.map((col,i)=>`<text class="axis" x="${left+i*s+36}" y="18">${i&&col>v.cols[i-1]+1?"…":""}${col}</text>`).join("")+v.rows.map((row,i)=>`<text class="axis" x="17" y="${top+i*s+40}">${i&&row>v.rows[i-1]+1?"…":""}${row}</text>`).join("");
    const links=v.path.slice(1).map((cell,i)=>{
      const prev=v.path[i],r1=v.rows.indexOf(prev[0]),c1=v.cols.indexOf(prev[1]),r2=v.rows.indexOf(cell[0]),c2=v.cols.indexOf(cell[1]);
      if([r1,c1,r2,c2].includes(-1))return "";
      const dx=cell[1]-prev[1],dy=cell[0]-prev[0];
      return `<path class="sr778-path-link" d="M ${left+c1*s+36+dx*31} ${top+r1*s+36+dy*31} L ${left+c2*s+36-dx*31} ${top+r2*s+36-dy*31}"/>`;
    }).join("");
    return `<section class="sr778-card sr778-map"><header><strong>${this.t("Độ cao từng ô","Cell elevations")}</strong><small>${this.t("số lớn = h · b = best","large number = h · b = best")}</small></header><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${this.t("Lưới ngập nước, heap và đường đi","Flooded grid, heap frontier and route")}">${axis}${cellMarkup}${links}</svg><div class="sr778-legend"><span class="wet">≈ ${this.t("đã ngập","submerged")}</span><span class="queued">□ heap</span><span class="settled">□ ${this.t("đã chốt","settled")}</span><span class="current">□ ${this.t("đang xét","current")}</span></div>${v.cropped?`<small>${this.t("Lưới rút gọn · giữ nguyên tọa độ · … là khoảng đã ẩn","Grid condensed · coordinates preserved · … marks a hidden span")}</small>`:""}</section>`;
  }
  relax(v){
    if(!v.probe||!["bounds","max","compare","update","push"].includes(v.phase))return "";
    const p=v.probe;
    if(!p.inside)return `<div class="sr778-outside">${this.coord(v.current)} ↛ (${p.r}, ${p.c})<b>✕ ${this.t("vượt biên","out of bounds")}</b></div>`;
    const known=p.newTime!==null,improves=known&&(p.oldBest==="∞"||p.newTime<p.oldBest);
    return `<section class="sr778-card"><header><strong>${this.coord(v.current)} → (${p.r}, ${p.c})</strong><small>new_time = max(time, h)</small></header><div class="sr778-max"><div class="time"><small>${this.t("nước hiện tại","current water")}</small><b>${v.level??"?"}</b><span>≈</span></div><strong>max</strong><div class="height"><small>h(${p.r},${p.c})</small><b>${p.height}</b><span>▲</span></div><strong>=</strong><div class="candidate"><small>new_time</small><b>${p.newTime??"?"}</b><span>${known&&p.newTime>v.level?"↑":"≈"}</span></div></div><div class="sr778-compare"><span>${p.newTime??"?"} &lt; best[${p.r}][${p.c}] = ${p.oldBest}</span><b class="${known?improves?"good":"bad":""}">${known?improves?"✓":"✕":"…"}</b><small>${!known?this.t("Chờ dòng max","Awaiting max"):!improves?this.t("Giữ best","Keep best"):v.phase==="push"?this.t("best đã đổi · tiếp theo push","best updated · push next"):this.t("Đường tới sớm hơn → cập nhật","Earlier arrival → update")}</small></div></section>`;
  }
  heap(v){
    const items=v.heap.map((entry,index)=>({entry,index})).sort((a,b)=>a.entry[0]-b.entry[0]||a.entry[1]-b.entry[1]||a.entry[2]-b.entry[2]);
    return `<section class="sr778-card"><header><strong>MIN-HEAP · ${items.length}</strong><small>${v.final?this.t("Đã dừng ở đích","Stopped at target"):this.t("time nhỏ nhất → pop","smallest time → pop")}</small></header><div class="sr778-heap">${items.slice(0,8).map(({entry:[time,r,c],index},i)=>`<div class="${i===0&&!v.final?"top":""}" data-heap-index="${index}"><small>${i===0&&!v.final?"▼ POP":"·"}</small><b>${time}</b><span>(${r},${c})</span></div>`).join("")||'<span class="sr778-empty">∅</span>'}${items.length>8?`<small>+${items.length-8}</small>`:""}</div></section>`;
  }
  proof(v){
    if(!v.final)return "";
    const ids=v.path.length<=20?v.path.map((_,i)=>i):[0,1,2,3,4,...Array.from({length:5},(_,i)=>v.path.length-5+i)];
    return `<div class="sr778-proof"><div class="good"><b>t = ${v.answer}</b><span>S → T ✓</span></div><div class="bad"><b>t = ${v.answer-1}</b><span>S ↛ T ✕</span></div></div><details class="sr778-card sr778-route"><summary>${this.t("Đường đi","Route")} · ${v.path.length} ${this.t("ô","cells")} · max(h) = ${v.answer}</summary><div>${ids.map((id,i)=>`${i?`<span>${id>ids[i-1]+1?"…":"→"}</span>`:""}<div class="${v.path[id][2]===v.answer?"bottleneck":""}"><small>(${v.path[id][0]},${v.path[id][1]})</small><b>${v.path[id][2]}</b></div>`).join("")}</div></details>`;
  }
  render(step){
    const v=step.swimDijkstra778View;if(!v)return;
    const phases={size:this.t("Lấy kích thước lưới","Read grid size"),best:this.t("Khởi tạo best = ∞","Initialize best to infinity"),start:this.t("Chờ nước phủ ô xuất phát","Wait for water to cover the start"),seed:this.t("Đưa ô xuất phát vào heap","Seed the heap"),directions:this.t("Chuẩn bị bốn hướng","Prepare four directions"),while:this.t("Heap còn phần tử?","Heap nonempty?"),pop:this.t("Pop time nhỏ nhất","Pop smallest time"),stale:this.t("Bản ghi còn hợp lệ?","Is this entry current?"),"skip-stale":this.t("Bỏ bản ghi cũ","Skip stale entry"),target:this.t("Đã tới đích?","At the target?"),direction:this.t("Xét hướng tiếp theo","Next direction"),neighbor:this.t("Tính tọa độ ô kế","Compute next coordinates"),bounds:this.t("Ô kế có trong lưới?","Is the next cell in bounds?"),max:this.t("Chờ đủ nước để bước sang","Wait for enough water to move"),compare:this.t("Tới sớm hơn best?","Earlier than best?"),update:this.t("Cập nhật best","Update best"),push:this.t("Đưa ô kế vào heap","Push the improved cell"),found:this.t("Mực nước tối thiểu","Minimum water level")};
    const waterIcon='<svg viewBox="0 0 32 40" aria-hidden="true"><path d="M16 2C12 11 3 18 3 26a13 13 0 0 0 26 0C29 18 20 11 16 2Z" fill="currentColor"/><path d="M9 26a7 7 0 0 0 7 7" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>';
    this.host.innerHTML=`<section class="sr778-viz" aria-label="778 Swim in Rising Water"><header><strong>778 · Dijkstra Minimax</strong><span>${this.t("Trước dòng","Before line")} ${v.source.line}</span></header><div class="sr778-source"><code>${this.escape(v.source.text.trim())}</code><small>${phases[v.phase]}</small></div>${v.trace.truncated?`<div class="sr778-notice">${this.t("Trace rút gọn","Trace condensed")} · ${v.trace.omitted} ${this.t("dòng đã lược · đáp án tính toàn bộ","line events omitted · complete answer computed")}</div>`:""}<div class="sr778-status"><div class="sr778-water-level">${waterIcon}<div><small>${this.t("Mực nước","Water level")}</small><b>t = ${v.level??"?"}</b></div></div><div class="sr778-current"><small>${this.t("Ô vừa pop","Popped cell")}</small><b>${this.coord(v.current)}</b></div></div>${this.grid(v)}${this.relax(v)}${this.proof(v)}${this.heap(v)}</section>`;
  }
}
function renderSwimRising778View(step){new SwimRising778Visualizer({host:$("treeView"),language:lang,escape:escapeHtml}).render(step);}
