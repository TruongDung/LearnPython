"use strict";

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
  const selectedPairs = Array.isArray(x.seen) ? new Set(x.seen.filter(p=>Array.isArray(p)&&p.length===2).map(p=>p.join(","))) : new Set();
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
    const activeR=v.id===351&&Number.isInteger(x.last)?Math.floor((x.last-1)/3):x.r ?? x.nr ?? x.row;
    const activeC=v.id===351&&Number.isInteger(x.last)?(x.last-1)%3:x.c ?? x.nc ?? x.col;
    const old=v.oldValues?.[name];
    const cells=matrix.flatMap((row,r)=>Array.from(row).map((value,c)=>{
      const current=r===activeR&&c===activeC;
      const visited=selectedPairs.has(`${r},${c}`)||(v.id===351&&Array.isArray(x.used)&&x.used.includes(r*3+c+1));
      const edited=Array.isArray(old)&&old[r]&&old[r][c]!==value;
      const bounds=Number.isInteger(x.top)&&Number.isInteger(x.bottom)&&Number.isInteger(x.left)&&Number.isInteger(x.right)&&r>=x.top&&r<=x.bottom&&c>=x.left&&c<=x.right;
      const binary=["board","grid","image","maze"].includes(name);
      const piece=binary&&(value===1||value==="1")?"●":binary&&(value===0||value==="0")?"·":value;
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
    if(Array.isArray(value)){
      if(!value.length)return '<span class="cl-empty">[]</span>';
      if(value.every(r=>r&&typeof r==="object"&&!Array.isArray(r)&&!isRef(r)))return tablePicture(value);
      const rows=value.every(r=>Array.isArray(r))&&value.every(r=>r.length===value[0].length)&&value.every(r=>r.every(scalar));
      const textGrid=["image","grid"].includes(name)&&value.every(r=>typeof r==="string"&&r.length===value[0].length);
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
    const objects=v.objects||[];
    if(!objects.length)return "";
    const byId=new Map(objects.map(o=>[o.id,o])),links=[];
    for(const node of objects)for(const name of ["left","right","next"])if(isRef(node.fields[name])&&byId.has(node.fields[name].id))links.push({from:node.id,to:node.fields[name].id,name});
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
    const lines=links.map(l=>{const a=coordinates.get(l.from),b=coordinates.get(l.to);if(!a||!b)return"";const loop=b.x<=a.x&&b.y===a.y;return `<path class="cl-edge${l.name==="right"?" is-right":""}" d="${loop?`M${a.x},${a.y-23} Q${(a.x+b.x)/2},${a.y-65} ${b.x},${b.y-23}`:`M${a.x},${a.y+8} L${b.x},${b.y-8}`}" marker-end="url(#cl-arrow-${v.id})"><title>${esc(l.name)}</title></path>`;}).join("");
    const nodes=objects.map(o=>{const p=coordinates.get(o.id),labels=refs.get(o.id)||[];return `<g class="cl-object${labels.length?" is-current":""}" data-object-id="${esc(o.id)}"><circle cx="${p.x}" cy="${p.y}" r="24"/><text x="${p.x}" y="${p.y+5}">${esc(o.fields.val)}</text><text class="cl-object-id" x="${p.x}" y="${p.y+40}">${esc(o.id.replace("object:","#"))}</text>${labels.length?`<text class="cl-pointer-label" x="${p.x}" y="${p.y-31}">${esc(labels.join(" / "))}</text>`:""}</g>`;}).join("");
    return `<section class="cl-card cl-objects"><header>${t("CÁC NODE VÀ CON TRỎ", "NODES AND POINTERS")} <small>${t("đường nét đứt: nhánh phải", "dashed: right child")}</small></header><div class="cl-svg-scroll" tabindex="0"><svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t("Trạng thái node thực tế", "Actual node state")}"><defs><marker id="cl-arrow-${v.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z"/></marker></defs>${lines}${nodes}</svg></div></section>`;
  }
  function geometry() {
    let points=null,path=false,closed=false,mirror=null,circle=null;
    if([356,447,469].includes(v.id)){points=v.args[0];closed=v.id===469;if(v.id===356&&points.length)mirror=(Math.min(...points.map(p=>p[0]))+Math.max(...points.map(p=>p[0])))/2;}
    if(v.id===335){points=[[0,0]];const dirs=[[0,1],[-1,0],[0,-1],[1,0]];v.args[0].forEach((d,i)=>{const p=points.at(-1);points.push([p[0]+dirs[i%4][0]*d,p[1]+dirs[i%4][1]*d]);});path=true;}
    if(v.id===478){const[r,cx,cy]=v.args;circle={r,cx,cy};points=[[cx-r,cy-r],[cx+r,cy+r]];if(Array.isArray(v.result))points.push(v.result);else if(Number.isFinite(x.x)&&Number.isFinite(x.y))points.push([x.x,x.y]);}
    if(!points?.length)return "";
    const minX=Math.min(...points.map(p=>p[0]))-1,maxX=Math.max(...points.map(p=>p[0]))+1,minY=Math.min(...points.map(p=>p[1]))-1,maxY=Math.max(...points.map(p=>p[1]))+1;
    const scale=Math.min(480/(maxX-minX),230/(maxY-minY));
    const px=a=>275+(a-(minX+maxX)/2)*scale,py=a=>155-(a-(minY+maxY)/2)*scale;
    let art=`<path class="cl-axis" d="M35,${py(0)} H515 M${px(0)},40 V270"/>`;
    if(path||closed){const shown=path&&Number.isInteger(x.i)?Math.min(points.length,x.i+2):points.length;art+=`<polyline class="cl-geoline" points="${points.slice(0,shown).map(p=>`${px(p[0])},${py(p[1])}`).join(" ")}${closed?` ${px(points[0][0])},${py(points[0][1])}`:""}"/>`;}
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

  const entries=Object.entries(x).filter(([name,value])=>name!=="self"&&!(typeof value==="string"&&value.startsWith("<")));
  const visuals=entries.filter(([,value])=>!isRef(value)&&(Array.isArray(value)||typeof value==="string"||value&&typeof value==="object"));
  const priority=["dp","nums","matrix","board","grid","image","path","answer","output","rows","stack","queue","snake","buckets","digits","debts","parts","mapping","groups","counts","prefix","candidates","preorder","inorder","postorder"];
  visuals.sort(([a],[b])=>Number(changed.has(b))-Number(changed.has(a))||(priority.includes(a)?priority.indexOf(a):99)-(priority.includes(b)?priority.indexOf(b):99));
  const cards=visuals.map(([name,value],index)=>{
    const content=`<section class="cl-card${changed.has(name)?" is-updated":""}"><header><code>${esc(name)}</code>${changed.has(name)?`<small class="cl-update">${t("vừa đổi", "changed")}</small>`:""}</header>${picture(value,name)}</section>`;
    return index<5?content:`<details class="cl-extra"><summary>${esc(name)}</summary>${content}</details>`;
  }).join("");
  const primitives=entries.filter(([,value])=>scalar(value)&&typeof value!=="string"||isRef(value));
  const vars=primitives.map(([name,value])=>`<div class="${changed.has(name)?"is-updated":""}"><small>${esc(name)}</small><b>${esc(isRef(value)?value.id:format(value))}</b></div>`).join("");
  const inputs=v.args.map((value,i)=>`<details class="cl-input"${!visuals.length&&!v.objects.length?" open":""}><summary>${esc(v.names[i]||`arg${i}`)} · ${t("đầu vào", "input")}</summary>${picture(value,v.names[i])}</details>`).join("");
  const stack=v.frames.length>1?`<section class="cl-stack"><small>${t("NGĂN XẾP GỌI HÀM", "CALL STACK")}</small><div>${v.frames.map((frame,i)=>`<span class="${i===v.frames.length-1?"is-current":""}"><b>${esc(frame.name)}</b><small>${Object.entries(frame.locals).filter(([,val])=>scalar(val)).slice(0,3).map(([k,val])=>`${esc(k)}=${esc(format(val))}`).join(" · ")}</small></span>`).join('<i>→</i>')}</div></section>`:"";
  const branch=v.branch===null?"":`<span class="cl-branch ${v.branch?"is-true":"is-false"}">${v.branch?"True ✓":"False ✕"}</span>`;
  const html=`<section class="cl-viz" data-lesson-id="${v.id}">
    <header class="cl-top"><b>#${v.id}</b><h3>${t("Theo dõi thuật toán qua từng bước", "Follow the algorithm one statement at a time")}</h3><span>${v.line}/${typeof problemData!=="undefined"?problemData.code.length:""}</span></header>
    <div class="cl-source"><b>L${v.line}</b><code>${esc(v.source.trim())}</code>${branch}</div>
    <div class="cl-legend"><span class="is-current">● ${t("đang xét / con trỏ", "current / pointer")}</span><span class="is-changed">● ${t("vừa cập nhật", "just changed")}</span><span class="is-visited">● ${t("đã thăm", "visited")}</span></div>
    ${geometry()}${gameBoard()}${objectGraph()}${bitPicture()}
    ${vars?`<div class="cl-values">${vars}</div>`:""}${stack}${cards}
    ${v.final?`<section class="cl-result"><header>✓ ${t("KẾT QUẢ", "RESULT")}</header>${picture(v.result,"result")}</section>`:""}
    <section class="cl-inputs">${inputs}</section>
  </section>`;
  const host=typeof $==="function"?$("treeView"):document.getElementById("treeView");
  host.innerHTML=html;
}
