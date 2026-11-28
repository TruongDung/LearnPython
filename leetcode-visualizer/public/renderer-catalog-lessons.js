"use strict";
function catalogLessonJump(kind) {
  if(typeof steps==='undefined'||typeof renderStep!=='function')return;
  if(typeof stopPlay==='function')stopPlay();
  const next=steps.findIndex((s,i)=>i>stepIndex&&s.catalogLessonView&&(kind==='answer'?s.final:kind==='decision'?s.catalogLessonView.branch!==null:s.catalogLessonView.changed.length>0));
  if(next>=0){stepIndex=next;renderStep();}
}

// A data-driven picture vocabulary: real arrays become cells, real grids become
// boards, and allocated nodes become graphs. No evaluated input or HTML is used.
function renderCatalogLesson(step) {
  const v = step.catalogLessonView;
  const vi = typeof lang !== "undefined" && lang === "vi";
  const t = (a,b) => vi ? a : b;
  const esc = value => String(value ?? "∅").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const format = value => typeof value === "object" ? JSON.stringify(value) : value === true ? "True" : value === false ? "False" : value === null ? "None" : String(value);
  const x = v.locals;
  const isRef = value => value && typeof value === "object" && typeof value.id === "string" && value.type;
  const scalar = value => value === null || ["string","number","boolean"].includes(typeof value);
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  const pointerNames = ["i","j","index","cursor","left","right","lo","hi","mid","start","end","head"];
  const pointers = pointerNames.filter(name=>Number.isInteger(x[name])).map(name=>({name,index:x[name]}));
  const visitedPairs = [x.seen,x.crushed,v.id===885?x.answer:null].filter(Array.isArray).flat();
  const selectedPairs = new Set(visitedPairs.filter(p=>Array.isArray(p)&&p.length===2).map(p=>p.join(',')));
  const changed = new Set(v.changed || []);

  function arrayPicture(values,name) {
    const old = v.oldValues?.[name];
    const showPointers = ["nums","s","word","preorder","inorder","postorder","values","citations","ordered","dp","row","sequence","digits","data","distance","answer","output"].includes(name);
    const cells = values.map((value,i)=>{
      const labels = showPointers ? pointers.filter(p=>p.index===i).map(p=>p.name) : [];
      const updated = Array.isArray(old) && !same(old[i],value);
      return `<span class="cl-cell${labels.length?" is-current":""}${updated?" is-changed":""}" data-cell-index="${i}"><small>${i}</small><b>${esc(value === " " ? "␠" : value === "\n" ? "↵" : value === "\t" ? "⇥" : value)}</b>${labels.length?`<em>${esc(labels.join(" · "))}</em>`:""}</span>`;
    }).join("");
    return `<div class="cl-cells" aria-label="${esc(name)}">${cells || '<span class="cl-empty">[]</span>'}</div>`;
  }
  function tablePicture(rows) {
    const columns=[...new Set(rows.flatMap(r=>Object.keys(r)))];
    const active=[x.person,x.employee,x.trip,x.row,x.customer].filter(r=>r&&typeof r==="object"&&!Array.isArray(r));
    return `<div class="cl-table-scroll"><table><thead><tr>${columns.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r,i)=>`<tr class="${active.some(a=>same(a,r))?"is-current":""}" data-row="${i}">${columns.map(c=>`<td>${esc(r[c]===null?"NULL":format(r[c]??null))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function matrixPicture(matrix,name) {
    const rows=matrix.length,cols=matrix[0]?.length||0;
    const activeR=v.id===519&&Number.isInteger(x.cell)?Math.floor(x.cell/v.args[1]):v.id===351&&Number.isInteger(x.last)?Math.floor((x.last-1)/3):x.r ?? x.nr ?? x.row;
    const activeC=v.id===519&&Number.isInteger(x.cell)?x.cell%v.args[1]:v.id===351&&Number.isInteger(x.last)?(x.last-1)%3:x.c ?? x.nc ?? x.col;
    const old=v.oldValues?.[name];
    const cells=matrix.flatMap((row,r)=>Array.from(row).map((value,c)=>{
      const current=r===activeR&&c===activeC;
      const visited=selectedPairs.has(`${r},${c}`)||(v.id===351&&Array.isArray(x.used)&&x.used.includes(r*3+c+1));
      const edited=Array.isArray(old)&&old[r]&&old[r][c]!==value;
      const bounds=Number.isInteger(x.top)&&Number.isInteger(x.bottom)&&Number.isInteger(x.left)&&Number.isInteger(x.right)&&r>=x.top&&r<=x.bottom&&c>=x.left&&c<=x.right;
      const binary=["board","grid","image","maze","picture"].includes(name)&&![723,807,840,883,892,1706,1810,1878,1895,1901].includes(v.id);
      const piece=v.id===1706&&name==='grid'?(value===1?'↘':'↙'):binary&&(value===1||value==="1"||value==='B')?"●":binary&&(value===0||value==="0"||value==='W')?"·":value;
      return `<span class="cl-square${current?" is-current":""}${visited?" is-visited":""}${edited?" is-changed":""}${bounds?" in-bounds":""}" data-r="${r}" data-c="${c}"><b>${esc(piece)}</b><small>${r},${c}</small></span>`;
    })).join("");
    return `<div class="cl-board-scroll" tabindex="0" aria-label="${esc(name)}"><div class="cl-board" style="--cl-cols:${cols}" data-rows="${rows}" data-cols="${cols}">${cells}</div></div>`;
  }
  function nestedPicture(value,depth=0) {
    if(depth>6)return `<code>${esc(format(value))}</code>`;
    if(Array.isArray(value))return `<span class="cl-nest depth-${depth%3}"><small>[</small>${value.map(item=>nestedPicture(item,depth+1)).join("")}<small>]</small></span>`;
    if(value&&Array.isArray(value.__pairs__))return `<span class="cl-pairs">${value.__pairs__.map(([key,item])=>`<span><small>${esc(format(key))}</small>${nestedPicture(item,depth+1)}</span>`).join("")}</span>`;
    if(isRef(value))return `<span class="cl-node-ref">${esc(value.id)}</span>`;
    if(value&&typeof value==="object")return `<span class="cl-pairs">${Object.entries(value).map(([k,val])=>`<span><small>${esc(k)}</small>${nestedPicture(val,depth+1)}</span>`).join("")}</span>`;
    return `<b class="cl-leaf">${esc(format(value))}</b>`;
  }
  function picture(value,name) {
    if(([519,885].includes(v.id)||v.teaching?.diagram==='coordinates')&&['answer','result','cells'].includes(name)&&Array.isArray(value))return arrayPicture(value.map(point=>`(${point.join(', ')})`),name);
    if(v.teaching?.diagram==='table'&&['answer','result'].includes(name)&&Array.isArray(value)&&value.length&&Array.isArray(value[0]))return tablePicture(value.slice(1).map(row=>Object.fromEntries(value[0].map((key,i)=>[key,row[i]]))));
    if(typeof value==='string'&&/^Fraction\(-?\d+, \d+\)$/.test(value)){const parts=value.slice(9,-1).split(', ');return `<span class="cl-fraction"><b>${esc(parts[0])}</b><b>${esc(parts[1])}</b></span>`;}
    if(v.id===773&&name==='state'&&typeof value==='string'&&value.length===6)return matrixPicture([value.slice(0,3),value.slice(3)],'board');
    if(Array.isArray(value)){
      if(!value.length)return '<span class="cl-empty">[]</span>';
      if(value.every(r=>r&&typeof r==="object"&&!Array.isArray(r)&&!isRef(r)))return tablePicture(value);
      const rows=value.every(r=>Array.isArray(r))&&value.every(r=>r.length===value[0].length)&&value.every(r=>r.every(scalar));
      const textGrid=["image","grid","picture","board","strs","binaryMatrix","pizza"].includes(name)&&value.every(r=>typeof r==="string"&&r.length===value[0].length);
      if((rows||textGrid)&&value.length&&value[0].length)return matrixPicture(value,name);
      if(value.every(scalar))return arrayPicture(value,name);
      return nestedPicture(value);
    }
    if(typeof value==="string"&&value.length&&value.length<=100&&!value.includes("\n"))return arrayPicture([...value],name);
    if(typeof value==="string"&&value.includes("\n"))return `<div class="cl-text-lines">${value.split("\n").map((line,i)=>`<div><small>${i+1}</small><code>${esc(line)}</code></div>`).join("")}</div>`;
    if(isRef(value))return `<span class="cl-node-ref">${esc(value.id)}</span>`;
    return value&&typeof value==="object"?nestedPicture(value):`<strong class="cl-number">${esc(format(value))}</strong>`;
  }
  function objectGraph() {
    const objects=(v.objects||[]).filter(object=>Object.hasOwn(object.fields,"val"));
    if(!objects.length)return "";
    const byId=new Map(objects.map(o=>[o.id,o])),links=[];
    for(const node of objects){for(const name of ["left","right","next","random"])if(isRef(node.fields[name])&&byId.has(node.fields[name].id))links.push({from:node.id,to:node.fields[name].id,name});if(Array.isArray(node.fields.children))node.fields.children.forEach((child,i)=>{if(isRef(child)&&byId.has(child.id))links.push({from:node.id,to:child.id,name:`children[${i}]`});});}
    const list=objects.every(o=>o.type==="ListNode");
    const coordinates=new Map(),incoming=new Set(links.map(l=>l.to));
    const roots=objects.filter(o=>!incoming.has(o.id));
    let column=0,maxDepth=0;
    function place(id,depth,seen){
      if(coordinates.has(id)||seen.has(id))return;
      seen.add(id);
      const node=byId.get(id);if(!node)return;
      if(!list&&isRef(node.fields.left))place(node.fields.left.id,depth+1,seen);
      const rank=column++;
      coordinates.set(id,list?{x:50+(rank%6)*105,y:50+Math.floor(rank/6)*100}:{x:45+rank*76,y:45+depth*90});
      maxDepth=Math.max(maxDepth,depth);
      if(!list&&isRef(node.fields.right))place(node.fields.right.id,depth+1,seen);
      if(list&&isRef(node.fields.next))place(node.fields.next.id,depth,seen);
    }
    for(const root of roots)place(root.id,0,new Set());
    for(const node of objects)place(node.id,0,new Set());
    const width=list?Math.min(6,objects.length)*105+10:Math.max(330,objects.length*76+14),height=list?Math.ceil(objects.length/6)*100+10:Math.max(180,maxDepth*90+100);
    const refs=new Map();for(const [name,value]of Object.entries(x))if(isRef(value)){if(!refs.has(value.id))refs.set(value.id,[]);refs.get(value.id).push(name);}
    const lines=links.map(l=>{const a=coordinates.get(l.from),b=coordinates.get(l.to);if(!a||!b)return"";const loop=b.x<=a.x&&b.y===a.y;return `<path class="cl-edge${l.name==="right"?" is-right":""}${l.name==='random'?' is-random':''}" d="${loop?`M${a.x},${a.y-23} Q${(a.x+b.x)/2},${a.y-65} ${b.x},${b.y-23}`:`M${a.x},${a.y+8} L${b.x},${b.y-8}`}" marker-end="url(#cl-arrow-${v.id})"><title>${esc(l.name)}</title></path>`;}).join("");
    const nodes=objects.map(o=>{const p=coordinates.get(o.id),labels=refs.get(o.id)||[];return `<g class="cl-object${labels.length?" is-current":""}" data-object-id="${esc(o.id)}"><circle cx="${p.x}" cy="${p.y}" r="24"/><text x="${p.x}" y="${p.y+5}">${esc(o.fields.val===""&&o.fields.len?o.fields.len:o.fields.val)}</text><text class="cl-object-id" x="${p.x}" y="${p.y+40}">${esc(o.id.replace("object:","#"))}</text>${labels.length?`<text class="cl-pointer-label" x="${p.x}" y="${p.y-31}">${esc(labels.join(" / "))}</text>`:""}</g>`;}).join("");
    return `<section class="cl-card cl-objects"><header>${t("CÁC NODE VÀ CON TRỎ", "NODES AND POINTERS")} <small>${t("đường nét đứt: nhánh phải", "dashed: right child")}</small></header><div class="cl-svg-scroll" tabindex="0"><svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t("Trạng thái node thực tế", "Actual node state")}"><defs><marker id="cl-arrow-${v.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z"/></marker></defs>${lines}${nodes}</svg></div></section>`;
  }
  function geometry() {
    let points=null,path=false,closed=false,mirror=null,circle=null;
    if([356,447,469].includes(v.id)){points=v.args[0];closed=v.id===469;if(v.id===356&&points.length)mirror=(Math.min(...points.map(p=>p[0]))+Math.max(...points.map(p=>p[0])))/2;}
    if(v.id===593){points=v.args;}
    if([612,812,1037,1232,1266,1453].includes(v.id)){points=v.args[0];path=v.id===1266;}
    if([1515,1620,1637,1924,1956].includes(v.id))points=v.args[0].map(p=>p.slice(0,2));
    if(v.id===1779)points=[[v.args[0],v.args[1]],...v.args[2]];
    if(v.id===1828)points=v.args[0];
    if([1515,1620,1956].includes(v.id)&&Number.isFinite(x.x)&&Number.isFinite(x.y))points=[...points,[x.x,x.y]];
    if(v.id===1828&&Number.isFinite(x.radius)){circle={cx:x.x,cy:x.y,r:x.radius};points=[[x.x-x.radius,x.y-x.radius],[x.x+x.radius,x.y+x.radius],...points];}
    if(v.id===1924&&Array.isArray(x.best)){const[cx,cy,r]=x.best;circle={cx,cy,r};points=[[cx-r,cy-r],[cx+r,cy+r],...points];}
    if([657,874,1041,1496].includes(v.id)&&v.motion?.length){points=v.motion;path=true;}
    if(v.id===1453&&Number.isFinite(x.cx)&&Number.isFinite(x.cy)){circle={r:v.args[1],cx:x.cx,cy:x.cy};points=[[x.cx-circle.r,x.cy-circle.r],[x.cx+circle.r,x.cy+circle.r],...v.args[0]];}
    if(v.id===335){points=[[0,0]];const dirs=[[0,1],[-1,0],[0,-1],[1,0]];v.args[0].forEach((d,i)=>{const p=points.at(-1);points.push([p[0]+dirs[i%4][0]*d,p[1]+dirs[i%4][1]*d]);});path=true;}
    if(v.id===478){const[r,cx,cy]=v.args;circle={r,cx,cy};points=[[cx-r,cy-r],[cx+r,cy+r]];if(Array.isArray(v.result))points.push(v.result);else if(Number.isFinite(x.x)&&Number.isFinite(x.y))points.push([x.x,x.y]);}
    if(!points?.length)return "";
    const minX=Math.min(...points.map(p=>p[0]))-1,maxX=Math.max(...points.map(p=>p[0]))+1,minY=Math.min(...points.map(p=>p[1]))-1,maxY=Math.max(...points.map(p=>p[1]))+1;
    const scale=Math.min(480/(maxX-minX),230/(maxY-minY));
    const px=a=>275+(a-(minX+maxX)/2)*scale,py=a=>155-(a-(minY+maxY)/2)*scale;
    let art=`<path class="cl-axis" d="M35,${py(0)} H515 M${px(0)},40 V270"/>`;
    if(path||closed){const shown=v.id===335&&Number.isInteger(x.i)?Math.min(points.length,x.i+2):points.length;art+=`<polyline class="cl-geoline" points="${points.slice(0,shown).map(p=>`${px(p[0])},${py(p[1])}`).join(" ")}${closed?` ${px(points[0][0])},${py(points[0][1])}`:""}"/>`;}
    if(mirror!==null)art+=`<path class="cl-mirror" d="M${px(mirror)},30 V280"/>`;
    if(circle)art+=`<ellipse class="cl-geoline" cx="${px(circle.cx)}" cy="${py(circle.cy)}" rx="${Math.abs(px(circle.cx+circle.r)-px(circle.cx))}" ry="${Math.abs(py(circle.cy+circle.r)-py(circle.cy))}"/>`;
    art+=points.map((p,i)=>circle&&i<2?"":`<g><circle class="cl-point${i===x.i||circle?" is-current":""}" cx="${px(p[0])}" cy="${py(p[1])}" r="6"/><text class="cl-coordinate" x="${px(p[0])+9}" y="${py(p[1])-8}">${esc(p.map(n=>Number(n.toFixed(3))).join(","))}</text></g>`).join("");
    return `<section class="cl-card"><header>${t("HÌNH HỌC", "GEOMETRY")}</header><svg class="cl-geometry" viewBox="0 0 550 310" role="img" aria-label="${t("Hình tọa độ", "Coordinate picture")}">${art}</svg></section>`;
  }
  function gameBoard() {
    if(![348,351,353].includes(v.id))return "";
    let rows,cols,values;
    if(v.id===348){rows=cols=v.args[0];values=Array.from({length:rows},()=>Array(cols).fill("·"));for(const[r,c,player]of v.args[1])if(selectedPairs.has(`${r},${c}`)||Array.isArray(x.occupied)&&x.occupied.some(p=>p[0]===r&&p[1]===c))values[r][c]=player===1?"X":"O";}
    if(v.id===351){rows=cols=3;values=Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>r*3+c+1));}
    if(v.id===353){cols=v.args[0];rows=v.args[1];if(cols>20||rows>20)return"";values=Array.from({length:rows},()=>Array(cols).fill("·"));const food=v.args[2]?.[x.score||0];if(food)values[food[0]][food[1]]="◆";if(Array.isArray(x.snake))x.snake.forEach(([r,c],i)=>{if(values[r]?.[c]!==undefined)values[r][c]=i===0?"◉":"●";});}
    if(rows>20)return"";
    return `<section class="cl-card"><header>${t("BÀN CHƠI", "BOARD")}</header>${matrixPicture(values,"game")}</section>`;
  }
  function bitPicture() {
    if(v.group!=="bits")return "";
    const values=Object.entries(x).filter(([,value])=>Number.isInteger(value)).slice(-5);
    return `<section class="cl-card cl-bits"><header>${t("BIỂU DIỄN NHỊ PHÂN · 32 BIT THẤP", "BINARY · LOW 32 BITS")}</header>${values.map(([name,value])=>`<div><code>${esc(name)} = ${esc(value)}</code><span>${(value>>>0).toString(2).padStart(32,"0").split("").map((bit,i)=>`<b class="${bit==="1"?"is-one":""}${Number.isInteger(x.bit)&&31-i===x.bit?" is-current":""}">${bit}</b>`).join("")}</span></div>`).join("")}</section>`;
  }

  function teachingDiagram() {
    if(!v.teaching)return '';
    if(v.id===1603){const slots=x.slots||[0,...v.args.slice(0,3)];return `<section class="cl-card"><header>${t('BÃI XE · CHỖ CÒN LẠI','PARKING · AVAILABLE SPACES')}</header>${tablePicture(slots.slice(1).map((remaining,i)=>({type:['big','medium','small'][i],remaining,current:x.carType===i+1?'←':''})))}</section>`;}
    if([1938,1993].includes(v.id)){
      const parents=v.args[0];if(parents.length<=24){const levels=[],depth=parents.map((p,i)=>{let d=0,node=i;while(parents[node]!==-1&&d<parents.length){d++;node=parents[node];}return d;});depth.forEach((d,i)=>(levels[d]??=[]).push(i));const width=Math.max(360,...levels.map(row=>row.length*75)),height=levels.length*85+40,coords=parents.map((p,i)=>({x:(levels[depth[i]].indexOf(i)+.5)*width/levels[depth[i]].length,y:40+depth[i]*85}));const locks=x.locks||{};
        return `<section class="cl-card cl-objects"><header>${v.id===1993?t('KHÓA TRÊN CÂY · NHÃN DƯỚI NODE LÀ USER GIỮ KHÓA','TREE LOCKS · LABELS SHOW THE LOCK OWNER'):t('ĐƯỜNG TỔ TIÊN · NODE ĐANG XÉT VIỀN VÀNG','ANCESTOR PATH · CURRENT NODE IN GOLD')}</header><div class="cl-svg-scroll"><svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Parent tree">${parents.map((p,i)=>p<0?'':`<path class="cl-edge" d="M${coords[p].x},${coords[p].y+20} L${coords[i].x},${coords[i].y-20}"/>`).join('')}${coords.map((p,i)=>`<g class="cl-object ${[x.node,x.ancestor].includes(i)?'is-current':''}"><circle cx="${p.x}" cy="${p.y}" r="21"/><text x="${p.x}" y="${p.y+5}">${i}</text><text class="cl-object-id" x="${p.x}" y="${p.y+38}">${Object.hasOwn(locks,i)?esc('🔒 user '+locks[i]):v.id===1993?t('mở','open'):Array.isArray(x.path)&&x.path.includes(i)?'↑':''}</text></g>`).join('')}</svg></div></section>`;
      }
    }
    if(v.id===1820){const grid=v.args[0],boys=grid.length,girls=grid[0].length;if(boys<=8&&girls<=8){const width=Math.max(boys,girls)*65+40,at=(i,n)=>40+i*(width-80)/Math.max(1,n-1);return `<section class="cl-card cl-objects"><header>${t('GHÉP CẶP · XANH = CẶP HIỆN TẠI','MATCHING · GREEN = CURRENT PAIRS')}</header><svg viewBox="0 0 ${width} 220" role="img" aria-label="Bipartite matching">${grid.flatMap((row,b)=>row.flatMap((allowed,g)=>allowed?[`<path class="cl-edge" style="opacity:${x.partner?.[g]===b?1:.2};stroke:${x.partner?.[g]===b?'var(--cl-change)':'var(--cl-line)'}" d="M${at(b,boys)},50 L${at(g,girls)},160"/>`]:[])).join('')}${[[boys,40,'B',x.boy],[girls,170,'G',x.girl]].map(([n,y,label,current])=>Array.from({length:n},(_,i)=>`<g class="cl-object ${i===current?'is-current':''}"><circle cx="${at(i,n)}" cy="${y}" r="20"/><text x="${at(i,n)}" y="${y+5}">${label}${i}</text></g>`).join('')).join('')}</svg></section>`;}}
    if(v.id===1948){const paths=v.final&&Array.isArray(v.result)?v.result:v.args[0];return `<section class="cl-card"><header>${v.final?t('THƯ MỤC CÒN LẠI','REMAINING FOLDERS'):t('CẤU TRÚC THƯ MỤC ĐẦU VÀO','INPUT FOLDER STRUCTURE')}</header><div class="cl-folders">${paths.map(path=>`<div style="padding-left:${Math.min(path.length-1,10)*20}px"><span>📁</span> ${esc(path.join('/'))}</div>`).join('')}</div></section>`;}
    if(v.id===1093){const counts=v.args[0],maximum=Math.max(...counts);return `<section class="cl-card"><header>${t('PHÂN PHỐI MẪU · CHỈ VẼ GIÁ TRỊ CÓ TẦN SUẤT DƯƠNG','SAMPLE DISTRIBUTION · NONZERO BINS ONLY')}</header><div class="cl-histogram">${counts.flatMap((count,value)=>count?[`<div class="${value===x.value?'is-current':''}" title="${value}: ${count}"><small>${count}</small><i style="height:${Math.max(3,130*count/maximum)}px"></i><b>${value}</b></div>`]:[]).join('')}</div></section>`;}
    if(v.group==='concurrency'){
      if(v.id===1226&&Array.isArray(x.stage)){
        const labels=vi?['Chờ suất','Lấy nĩa trái','Lấy nĩa phải','Ăn','Trả nĩa trái','Trả nĩa phải','Trả suất','Xong']:['Wait seat','Take left','Take right','Eat','Put left','Put right','Release seat','Done'];
        const point=(i,r)=>({x:225+r*Math.cos((i-1.25)*2*Math.PI/5),y:165+r*Math.sin((i-1.25)*2*Math.PI/5)});
        return `<section class="cl-card cl-objects"><header>${t('BÀN ĂN · SUẤT TRỐNG','DINING TABLE · FREE SEATS')} ${esc(x.slots??4)} / 4</header><svg viewBox="0 0 450 340" role="img" aria-label="Dining philosophers and fork ownership"><circle cx="225" cy="165" r="80" fill="none" stroke="currentColor" opacity=".2"/>${x.stage.map((stage,i)=>{const p=point(i,125),f=point(i-.5,75);const owner=x.forks?.[i]??-1;return `<g class="cl-object ${i===x.philosopher?'is-current':''}"><circle cx="${p.x}" cy="${p.y}" r="21"/><text x="${p.x}" y="${p.y+4}">P${i}</text><text class="cl-object-id" x="${p.x}" y="${p.y+36}">${esc(labels[stage])}</text></g><text class="cl-coordinate" x="${f.x-15}" y="${f.y}" fill="${owner<0?'currentColor':'#d97706'}">F${i}${owner<0?' ·':' →P'+owner}</text>`;}).join('')}</svg><small>${t('Nhãn dưới P là bước tiếp theo; F→P cho biết người đang giữ nĩa. Không bao giờ hai người giữ cùng một nĩa.','The label below P is its next action; F→P shows fork ownership. A fork has at most one owner.')}</small></section>`;
      }
      let rows=[];
      if(v.id===1188&&Array.isArray(x.pending)){rows=x.pending.map(thread=>{const op=v.args[1][thread],size=x.queue?.length||0;return {thread,operation:op.join(' '),state:op[0]==='enqueue'?(size<v.args[0]?t('có chỗ','space available'):t('chờ chỗ trống','wait for space')):(size?t('có dữ liệu','item available'):t('chờ dữ liệu','wait for item'))};});}
      else if(x.waiting&&typeof x.waiting==='object'){rows=Object.entries(x.waiting).map(([thread,count])=>({thread,waiting:count}));}
      else if(Array.isArray(x.arrival)){let permit=x.turn;if(v.id===1195&&x.value<=v.args[0])permit=x.value%15===0?'fizzbuzz':x.value%3===0?'fizz':x.value%5===0?'buzz':'number';rows=x.arrival.map(thread=>{const done=v.final||(v.id===1114&&Array.isArray(x.pending)&&!x.pending.includes(thread))||(v.id===1115&&x.completed?.[thread]>=v.args[0])||([1116,1195].includes(v.id)&&x.value>v.args[0]);return {thread,state:done?t('đã hoàn tất','done'):thread===permit?t('được phép chạy','may run'):t('chờ tín hiệu','wait for signal'),...(x.completed?{completed:x.completed[thread]}:{})};});}
      else if(Array.isArray(x.pending)){rows=x.pending.map(thread=>({thread,state:thread===x.turn?t('được phép chạy','may run'):t('chờ tín hiệu','wait for signal')}));}
      else if(Array.isArray(x.batch)){rows=x.batch.map((url,worker)=>({worker,url}));}
      else if(x.car){rows=[{car:x.car.car_id,road:x.car.road_id,green:x.green,mutex:x.locked?t('đang giữ','locked'):t('đã thả','unlocked')}];}
      return `<section class="cl-card"><header>${t('MÔ PHỎNG LỊCH · TRẠNG THÁI CHỜ VÀ TÍN HIỆU','SCHEDULE MODEL · WAITING AND SIGNAL STATE')}</header>${rows.length?tablePicture(rows):`<p>${t('Các tác vụ và tín hiệu sẽ xuất hiện khi scheduler khởi tạo. Đây là lịch mô phỏng, không tạo luồng hệ điều hành.','Tasks and signals appear when the scheduler initializes. This replay models a schedule without creating operating-system threads.')}</p>`}</section>`;
    }
    if(v.id===519){const [rows,cols]=v.args;if(rows>15||cols>15)return '';const flipped=new Set((x.answer||[]).map(p=>p.join(',')));const board=Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>flipped.has(`${r},${c}`)?1:0));return `<section class="cl-card"><header>${t('Ô ĐÃ LẬT ● · MỖI Ô CHỈ ĐƯỢC CHỌN MỘT LẦN','FLIPPED CELLS ● · EACH CELL IS SELECTED ONCE')}</header>${matrixPicture(board,'grid')}</section>`;}
    if([807,883,892].includes(v.id)){const grid=v.args[0],rows=grid.length,cols=grid[0]?.length||0,max=Math.max(...grid.flat());if(rows>8||cols>8||max>15)return '';const width=(rows+cols)*24+80,height=(rows+cols)*12+max*12+70;return `<section class="cl-card"><header>${t('CÁC CỘT KHỐI LẬP PHƯƠNG · SỐ TRÊN CỘT LÀ CHIỀU CAO','STACKED UNIT CUBES · LABELS SHOW COLUMN HEIGHT')}</header><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="3D height grid">${grid.flatMap((row,r)=>row.map((h,c)=>{if(!h)return '';const cx=rows*24+40+(c-r)*24,cy=max*12+28+(r+c)*12,top=cy-h*12;return `<path d="M${cx},${cy} l-24,-12 V${top-12} l24,12 Z" fill="#3b82f6" stroke="#475569"/><path d="M${cx},${cy} l24,-12 V${top-12} l-24,12 Z" fill="#0ea5e9" stroke="#475569"/><path d="M${cx},${top} l-24,-12 l24,-12 l24,12 Z" fill="#93c5fd" stroke="#475569"/><text x="${cx}" y="${top-8}" text-anchor="middle" fill="#0f172a" font-size="10">${h}</text>`;})).join('')}</svg></section>`;}
    if(v.id===935){const keys=[[1,2,3],[4,5,6],[7,8,9],['',0,'']];return `<section class="cl-card"><header>${t('BÀN PHÍM · SỐ CÁCH KẾT THÚC Ở TỪNG PHÍM','KEYPAD · WAYS ENDING AT EACH DIGIT')}</header>${matrixPicture(keys.map(row=>row.map(key=>key===''?'':`${key}: ${x.dp?.[key]??'·'}`)),'keypad')}<small>${t('Quân mã nhảy 2 ô theo một chiều và 1 ô theo chiều vuông góc. Phím 5 không có bước nhảy.','A knight moves two cells in one direction and one perpendicular. Digit 5 has no outgoing move.')}</small></section>`;}
    if(v.id===885){const [rows,cols]=v.args;if(rows>12||cols>12)return '';const values=Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>selectedPairs.has(`${r},${c}`)?'●':'·'));return `<section class="cl-card"><header>${t('ĐƯỜNG XOẮN ỐC · Ô ĐÃ ĐI QUA TRONG BẢNG','SPIRAL WALK · VISITED CELLS INSIDE THE BOARD')}</header>${matrixPicture(values,'walk')}</section>`;}
    if(v.id===909){const board=v.args[0],n=board.length;const values=board.map((row,r)=>row.map((jump,c)=>{const bottom=n-1-r;const square=bottom*n+(bottom%2?n-c:c+1);return `${square}${jump<0?'':' → '+jump}${square===x.square?' ◉':''}`;}));return `<section class="cl-card"><header>${t('BẢNG ZÍC-ZẮC · ◉ Ô ĐANG XÉT · → RẮN/THANG','ZIGZAG BOARD · ◉ CURRENT SQUARE · → SNAKE/LADDER')}</header>${matrixPicture(values,'snakes')}</section>`;}
    if(v.id===855){const n=v.args[0],occupied=Array.isArray(x.occupied)?x.occupied:[];return `<section class="cl-card"><header>${t('PHÒNG THI · GHẾ ĐÃ CÓ NGƯỜI','EXAM ROOM · OCCUPIED SEATS')}</header><svg viewBox="0 0 550 95" role="img" aria-label="Exam room seats"><path class="cl-axis" d="M30,45 H520"/>${[...new Set([0,n-1,...occupied])].map(seat=>{const at=30+490*seat/Math.max(1,n-1);return `<circle class="cl-point ${seat===x.seat?'is-current':''}" cx="${at}" cy="45" r="${occupied.includes(seat)?8:3}"/><text class="cl-coordinate" x="${at}" y="75">${seat}</text>`;}).join('')}</svg></section>`;}
    if(v.id===959){const grid=v.args[0],n=grid.length,parent=x.parent;if(n>10||!Array.isArray(parent))return '';function root(i){let steps=0;while(parent[i]!==i&&steps++<parent.length)i=parent[i];return i;}return `<section class="cl-card"><header>${t('MỖI Ô CHIA 4 TAM GIÁC · CÙNG NHÓM DSU CÙNG MÀU','FOUR TRIANGLES PER CELL · SAME DSU GROUP, SAME COLOR')}</header><svg viewBox="0 0 ${n*60} ${n*60}" role="img" aria-label="Slash regions">${grid.flatMap((row,r)=>[...row].map((ch,c)=>{const l=c*60,t=r*60,b=4*(r*n+c),pts=[`${l},${t} ${l+60},${t} ${l+30},${t+30}`,`${l+60},${t} ${l+60},${t+60} ${l+30},${t+30}`,`${l+60},${t+60} ${l},${t+60} ${l+30},${t+30}`,`${l},${t+60} ${l},${t} ${l+30},${t+30}`];return pts.map((points,i)=>`<polygon points="${points}" fill="hsl(${(root(b+i)*137.508)%360} 70% 65%)" opacity=".6" stroke="#475569" stroke-width=".4"><title>${root(b+i)}</title></polygon>`).join('')+(ch==='/'?`<path d="M${l+60},${t} L${l},${t+60}" stroke="#0f172a" stroke-width="3"/>`:ch===String.fromCharCode(92)?`<path d="M${l},${t} L${l+60},${t+60}" stroke="#0f172a" stroke-width="3"/>`:'');})).join('')}</svg><small>${t('Màu thể hiện phép gộp đang chạy, chưa phải kết quả cuối trước khi hoàn tất. Rê chuột xem ID nhóm.','Colors reflect merges so far; only the final frame has all unions. Hover a triangle for its group ID.')}</small></section>`;}
    if(v.id===554){const wall=v.args[0],width=wall[0].reduce((a,b)=>a+b,0);return `<section class="cl-card"><header>${t('BỨC TƯỜNG · ĐƯỜNG CẮT QUA KHE KHÔNG PHÁ GẠCH','WALL · CUTTING A GAP AVOIDS A BRICK')}</header><div class="cl-wall">${wall.map(row=>`<div>${row.map(size=>`<span style="flex:${size}">${size}</span>`).join('')}</div>`).join('')}</div><small>${t('Chỉ đếm khe bên trong; không chọn hai mép ngoài.','Count interior gaps only; the outer edges are excluded.')} · ${width}</small></section>`;}
    if([559,589,590,1490].includes(v.id)){
      const nodes=[],edges=[];let col=0,depth=0;
      function visit(node,level){if(!node)return null;const id=nodes.length;nodes.push({id,value:node[0],level,x:0});depth=Math.max(depth,level);const children=(node[1]||[]).map(child=>visit(child,level+1));nodes[id].x=children.length?children.reduce((sum,c)=>sum+nodes[c].x,0)/children.length:40+col++*80;children.forEach(c=>edges.push([id,c]));return id;}
      visit(v.args[0],0);const current=Array.isArray(x.node)?x.node[0]:null;
      return `<section class="cl-card cl-objects"><header>${t('CÂY NHIỀU CON · THEO THỨ TỰ TRÁI SANG PHẢI','N-ARY TREE · CHILDREN FROM LEFT TO RIGHT')}</header><div class="cl-svg-scroll"><svg width="${Math.max(250,col*80)}" height="${(depth+1)*80+20}" role="img" aria-label="N-ary tree">${edges.map(([a,b])=>`<path class="cl-edge" d="M${nodes[a].x},${nodes[a].level*80+40} L${nodes[b].x},${nodes[b].level*80+40}"/>`).join('')}${nodes.map(o=>`<g class="cl-object ${o.value===current?'is-current':''}"><circle cx="${o.x}" cy="${o.level*80+40}" r="23"/><text x="${o.x}" y="${o.level*80+45}">${esc(o.value)}</text></g>`).join('')}</svg></div></section>`;
    }
    if(v.id===558){function quad(node,left,top,size){if(node.isLeaf)return `<rect x="${left}" y="${top}" width="${size}" height="${size}" fill="${node.val?'#22c55e':'#e2e8f0'}" stroke="#475569"/>`;const keys=['topLeft','topRight','bottomLeft','bottomRight'];return keys.map((k,i)=>quad(node[k],left+(i%2)*size/2,top+Math.floor(i/2)*size/2,size/2)).join('');}const trees=[...v.args,...(v.final?[v.result]:[])];return `<section class="cl-card"><header>${t('QUAD-TREE · XANH = 1, TRẮNG = 0','QUAD-TREE · GREEN = 1, WHITE = 0')}</header><svg viewBox="0 0 ${trees.length*130} 145" role="img" aria-label="Quad-tree OR">${trees.map((node,i)=>`<text class="cl-coordinate" x="${i*130+5}" y="15">${i===2?'OR':i===0?'A':'B'}</text>${quad(node,i*130+5,25,110)}`).join('')}</svg></section>`;}
    const graphInput=v.names.includes('graph')?v.args[v.names.indexOf('graph')]:v.group==='graph'?x.graph:null;
    if(Array.isArray(graphInput)){
      const graph=graphInput;if(graph.length>16||!graph.every(row=>Array.isArray(row)&&row.every(Number.isInteger)))return '';
      const n=graph.length,coords=Array.from({length:n},(_,i)=>({x:160+115*Math.cos(i*2*Math.PI/Math.max(1,n)),y:145+110*Math.sin(i*2*Math.PI/Math.max(1,n))}));
      return `<section class="cl-card cl-objects"><header>${t('ĐỒ THỊ · MŨI TÊN CHỈ ĐƯỜNG ĐI','GRAPH · ARROWS SHOW DIRECTED EDGES')}</header><svg viewBox="0 0 320 290" role="img" aria-label="Directed graph"><defs><marker id="cl-directed-${v.id}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z"/></marker></defs>${graph.flatMap((row,i)=>row.filter(j=>coords[j]).map(j=>{const a=coords[i],b=coords[j],d=Math.hypot(b.x-a.x,b.y-a.y)||1;return `<path class="cl-edge" marker-end="url(#cl-directed-${v.id})" d="M${a.x+(b.x-a.x)*23/d},${a.y+(b.y-a.y)*23/d} L${b.x-(b.x-a.x)*23/d},${b.y-(b.y-a.y)*23/d}"/>`;})).join('')}${coords.map((c,i)=>`<g class="cl-object ${[x.node,x.u,x.current].includes(i)?'is-current':''}"><circle cx="${c.x}" cy="${c.y}" r="23"/><text x="${c.x}" y="${c.y+5}">${i}</text></g>`).join('')}</svg></section>`;
    }
    return '';
  }

  const entries=Object.entries(x).filter(([name,value])=>name!=="self"&&!(typeof value==="string"&&value.startsWith("<")));
  const visuals=entries.filter(([,value])=>!isRef(value)&&(Array.isArray(value)||typeof value==="string"||value&&typeof value==="object"));
  const priority=[...(v.teaching?.focus||[]),"dp","nums","matrix","board","grid","image","path","answer","output","rows","stack","queue","snake","buckets","digits","debts","parts","mapping","groups","counts","prefix","candidates","preorder","inorder","postorder"];
  visuals.sort(([a],[b])=>Number(changed.has(b))-Number(changed.has(a))||(priority.includes(a)?priority.indexOf(a):99)-(priority.includes(b)?priority.indexOf(b):99));
  const cards=visuals.map(([name,value],index)=>{
    const content=`<section class="cl-card${changed.has(name)?" is-updated":""}"><header><code>${esc(name)}</code>${changed.has(name)?`<small class="cl-update">${t("vừa đổi", "changed")}</small>`:""}</header>${picture(value,name)}</section>`;
    return index<(v.teaching?3:5)?content:`<details class="cl-extra"><summary>${esc(name)}</summary>${content}</details>`;
  }).join("");
  const primitives=entries.filter(([,value])=>scalar(value)&&typeof value!=="string"||isRef(value));
  const vars=primitives.map(([name,value])=>`<div class="${changed.has(name)?"is-updated":""}"><small>${esc(name)}</small><b>${esc(isRef(value)?value.id:format(value))}</b></div>`).join("");
  const inputs=v.args.map((value,i)=>`<details class="cl-input"${!v.teaching?.scene?.compact&&!visuals.length&&!v.objects.length?" open":""}><summary>${esc(v.names[i]||`arg${i}`)} · ${t("đầu vào", "input")}</summary>${picture(value,v.names[i])}</details>`).join("");
  const stack=v.frames.length>1?`<section class="cl-stack"><small>${t("NGĂN XẾP GỌI HÀM", "CALL STACK")}</small><div>${v.frames.map((frame,i)=>`<span class="${i===v.frames.length-1?"is-current":""}"><b>${esc(frame.name)}</b><small>${Object.entries(frame.locals).filter(([,val])=>scalar(val)).slice(0,3).map(([k,val])=>`${esc(k)}=${esc(format(val))}`).join(" · ")}</small></span>`).join('<i>→</i>')}</div></section>`:"";
  const branch=v.branch===null?"":`<span class="cl-branch ${v.branch?"is-true":"is-false"}">${v.branch?"True ✓":"False ✕"}</span>`;
  const short=value=>{const text=format(value);return text.length>95?text.slice(0,92)+'…':text;};
  const changes=v.teaching?(v.changed||[]).filter(name=>name!=='self').slice(0,4).map(name=>`<div><b>${esc(name)}</b><span>${Object.hasOwn(v.oldValues||{},name)?esc(short(v.oldValues[name])):t('chưa có','unset')} → <strong>${esc(short(x[name]))}</strong></span></div>`).join(''):'';
  const teaching=v.teaching?`<section class="cl-teaching"><b>${t('Ý TƯỞNG CẦN NHỚ','KEY IDEA')}</b><p>${esc(vi?v.teaching.vi:v.teaching.en)}</p><div class="cl-step-explanation">${v.final?t('Đã chạy tới lệnh trả về. Kết quả bên dưới là giá trị thuật toán thực sự trả về.','Execution reached the return. The result below is the actual returned value.'):v.branch!==null?(v.branch?t('Điều kiện đúng → tiếp tục vào nhánh / vòng lặp.','Condition is true → enter the branch / loop.'):t('Điều kiện sai → bỏ nhánh này hoặc kết thúc vòng lặp.','Condition is false → skip this branch or finish the loop.')):t('Ảnh bên dưới là trạng thái sau dòng code đang sáng; ô viền vàng vừa đổi giá trị.','The pictures show the state after the highlighted statement; gold outlines mark changed values.')}</div>${changes?`<details class="cl-changes"><summary>${t('Vừa thay đổi gì?','What changed?')}</summary>${changes}</details>`:''}</section>`:'';
  const actions=v.teaching?`<nav class="cl-actions">${[['change',t('Lần cập nhật tiếp →','Next update →')],['decision',t('Điều kiện tiếp →','Next decision →')],['answer',t('Kết quả ✓','Result ✓')]].map(([kind,label])=>`<button type="button" data-catalog-jump="${kind}"${v.final?' disabled':''}>${label}</button>`).join('')}</nav>`:'';
  const guided=v.teaching?.mode==='guided'&&typeof renderGuidedScene==='function';
  const illustrated=guided&&v.teaching?.scene?.compact;
  const scene=guided?renderGuidedScene(v,vi?'vi':'en'):'';
  const html=`<section class="cl-viz" data-lesson-id="${v.id}">
    ${illustrated?'':`<header class="cl-top"><b>#${v.id}</b><h3>${t("Theo dõi thuật toán qua từng bước", "Follow the algorithm one statement at a time")}</h3><span>${v.line}/${typeof problemData!=="undefined"?problemData.code.length:""}</span></header>`}
    ${scene}${guided?`<details class="cl-guided-details"><summary>${t('Xem ý tưởng và dòng code vừa chạy','Show the idea and executed statement')}</summary>`:''}${teaching}<div class="cl-source"><b>L${v.line}</b><code>${esc(v.source.trim())}</code>${branch}</div>${guided?'</details>':''}
    ${illustrated?'':`<div class="cl-legend"><span class="is-current">● ${t("đang xét / con trỏ", "current / pointer")}</span><span class="is-changed">● ${t("vừa cập nhật", "just changed")}</span><span class="is-visited">● ${t("đã thăm", "visited")}</span></div>${teachingDiagram()}${geometry()}${gameBoard()}${objectGraph()}${bitPicture()}`}
    ${guided?`<details class="cl-guided-details"><summary>${t('Chi tiết biến và ngăn xếp','Variable and call-stack details')}</summary>`:''}${vars?`<div class="cl-values">${vars}</div>`:""}${stack}${cards}${guided?'</details>':''}
    ${v.final?`<section class="cl-result"><header>✓ ${t("KẾT QUẢ", "RESULT")}</header>${picture(v.result,"result")}</section>`:""}
    ${actions}<section class="cl-inputs">${inputs}</section>
  </section>`;
  const host=typeof $==="function"?$("treeView"):document.getElementById("treeView");
  host.innerHTML=html;
  host.querySelectorAll?.('[data-catalog-jump]').forEach(button=>button.addEventListener('click',()=>catalogLessonJump(button.dataset.catalogJump)));
  host.querySelectorAll?.('[data-iv-step]').forEach(button=>button.addEventListener('click',()=>illustratedLessonStep(Number(button.dataset.ivStep))));
  if(v.id===887){
    const current=host.querySelector?.('.egg887-array .current,.egg887-array .answer'),strip=current?.closest('.pd-scroll');
    if(strip){const cell=current.getBoundingClientRect(),viewport=strip.getBoundingClientRect();if(cell.left<viewport.left||cell.right>viewport.right)strip.scrollLeft+=cell.left-viewport.left-(viewport.width-cell.width)/2;}
  }
}
