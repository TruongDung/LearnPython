"use strict";
const FT514_SOURCE = Object.freeze([
  "from collections import defaultdict",
  "",
  "class Solution:",
  "    def findRotateSteps(self, ring: str, key: str) -> int:",
  "        n = len(ring)",
  "",
  "        positions = defaultdict(list)",
  "        for i, char in enumerate(ring):",
  "            positions[char].append(i)",
  "",
  "        dp = {0: 0}",
  "",
  "        for char in key:",
  "            next_dp = {}",
  "",
  "            for target in positions[char]:",
  "                best = float(\"inf\")",
  "",
  "                for prev, cost in dp.items():",
  "                    diff = abs(target - prev)",
  "                    steps = min(diff, n - diff)",
  "",
  "                    best = min(best, cost + steps + 1)",
  "",
  "                next_dp[target] = best",
  "",
  "            dp = next_dp",
  "",
  "        return min(dp.values())"
]);
class FreedomTrail514Visualizer {
  constructor(host, language) { this.host = host; this.language = language; }
  t(vi,en) { return this.language === "vi" ? vi : en; }
  escape(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  arc(from, to, radius, clockwise, turns) {
    if (!turns) return "";
    const point = angle => [190 + radius * Math.sin(angle),195 - radius * Math.cos(angle)];
    const a = point(from), b = point(to);
    return "M"+a[0]+" "+a[1]+" A"+radius+" "+radius+" 0 "+(turns > this.n/2 ? 1 : 0)+" "+(clockwise?1:0)+" "+b[0]+" "+b[1];
  }
  wheel(v) {
    const ring = v.input.ring, n = ring.length; this.n = n;
    const aligned = v.replay?.aligned ?? v.cursor.aligned;
    const target = v.cursor.target, tr = v.transition;
    const ids = n <= 12 ? [...ring].map((_,i)=>i) : [...new Set([aligned,target,...[-2,-1,1,2].map(d=>(aligned+d+n)%n)])].filter(Number.isInteger);
    const angle = index => (index-aligned)*2*Math.PI/n;
    const ticks = [...ring].map((_,i) => {const a=angle(i);return '<path class="ft514-tick" d="M'+(190+119*Math.sin(a))+' '+(195-119*Math.cos(a))+' L'+(190+126*Math.sin(a))+' '+(195-126*Math.cos(a))+'"/>';}).join("");
    const nodes = ids.map(i => {
      const a=angle(i), x=190+108*Math.sin(a),y=195-108*Math.cos(a);
      return '<g class="ft514-letter'+(i===aligned?' aligned':'')+(i===target?' target':'')+'" transform="translate('+x+' '+y+')"><circle r="20"/><text class="ft514-letter-char" y="5" text-anchor="middle">'+ring[i]+'</text><text class="ft514-index" y="34" text-anchor="middle">'+i+'</text></g>';
    }).join("");
    const canCompare = tr && tr.clockwise !== null && !v.replay;
    const arcs = canCompare ? '<path class="ft514-arc cw" d="'+this.arc(angle(tr.to),0,156,true,tr.clockwise)+'" marker-end="url(#ft514-cw-arrow)"/><path class="ft514-arc ccw" d="'+this.arc(angle(tr.to),0,141,false,tr.counterclockwise)+'" marker-end="url(#ft514-ccw-arrow)"/>' : "";
    const press = v.event === "replay-press";
    const name = this.t("Vòng chữ; mũi tên chỉ hai hướng quay vật lý để đưa chữ đích lên 12 giờ","Letter wheel; arrows show physical rotation to bring the target to twelve o'clock");
    return '<svg class="ft514-ring-wheel" viewBox="0 0 380 385" role="img" aria-label="'+name+'"><defs><marker id="ft514-cw-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="ft514-cw-arrow" d="M0 0 L10 5 L0 10 Z"/></marker><marker id="ft514-ccw-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="ft514-ccw-arrow" d="M0 0 L10 5 L0 10 Z"/></marker></defs><circle class="ft514-track" cx="190" cy="195" r="108"/>'+ticks+arcs+nodes+'<path class="ft514-selector" d="M182 42 L198 42 L190 54 Z"/><text class="ft514-top-label" x="190" y="24" text-anchor="middle">12:00</text><g class="ft514-press'+(press?' pressed':'')+'"><circle cx="190" cy="195" r="47"/><text x="190" y="190" text-anchor="middle">'+this.t("BẤM","PRESS")+'</text><text class="ft514-press-cost" x="190" y="214" text-anchor="middle">+1</text></g><text class="ft514-aligned-label" x="190" y="370" text-anchor="middle">'+this.t("Ở 12 giờ","At twelve o’clock")+': '+ring[aligned]+' @'+aligned+'</text></svg>'+(n>12?'<small>'+n+' '+this.t("vị trí · hình rút gọn","positions · condensed wheel")+'</small>':"");
  }
  directions(v) {
    const tr=v.transition;
    if (!tr || tr.clockwise === null) return "";
    return '<div class="ft514-direction-grid">'+["clockwise","counterclockwise"].map((direction,i) => {
      const turns = tr[direction], chosen = direction === tr.direction || tr.direction === "stay" && i===0;
      const path = Array.from({length:Math.min(turns,6)},(_,step)=>v.input.ring[(tr.from+(i===0?-1:1)*(step+1)+v.input.length)%v.input.length]);
      return '<div class="ft514-direction '+(i===0?'cw':'ccw')+(chosen?' chosen':'')+'"><header><span class="ft514-turn-icon">'+(i===0?'↻':'↺')+'</span><span>'+this.t(i===0?"Cùng chiều":"Ngược chiều",i===0?"Clockwise":"Counterclockwise")+'</span></header><strong>'+turns+'</strong><div class="ft514-route">'+(turns===0?'•':path.map(char=>'<span>'+char+'</span>').join('<i>→</i>'))+(turns>6?' …':"")+'</div><small>'+(chosen?'✓ '+this.t("chọn","pick"):this.t("bước quay","turns"))+'</small></div>';
    }).join("")+'</div>';
  }
  key(v) {
    const key=v.input.key, active=v.final?key.length-1:Math.max(0,v.cursor.keyIndex);
    const left=Math.max(0,Math.min(active-4,key.length-12)),right=Math.min(key.length,left+12);
    const completed=v.replay?v.replay.presses:v.event==="commit-frontier"?v.cursor.keyIndex+1:Math.max(0,v.cursor.keyIndex);
    const chars=[...key.slice(left,right)].map((char,offset)=>{const i=left+offset;return '<span class="ft514-key-char'+(i<completed?' done':'')+(i===active&&!v.final?' current':'')+'"'+(i===active&&!v.final?' aria-current="step"':"")+'><small>'+i+'</small><b>'+char+'</b></span>';}).join("");
    return '<div class="ft514-key-list" aria-label="'+this.t("Các chữ cần nhập","Letters to spell")+'"><span>key</span>'+(left?'…':"")+chars+(right<key.length?'…':"")+'</div>';
  }
  positionMap(v) {
    const focus = v.cursor.keyChar || v.cursor.ringChar;
    const groups = v.positions.map(({char,indices}) => '<span class="ft514-position-group'+(char===focus?' current':'')+'"><b>'+char+'</b><span>'+indices.slice(0,8).map(index => '<i'+(index===v.cursor.ringIndex?' class="current"':"")+'>'+index+'</i>').join("")+(indices.length>8?'<i>+'+(indices.length-8)+'</i>':"")+'</span></span>').join("");
    return '<div class="ft514-position-map" aria-label="'+this.t("Chỉ mục ký tự","Character positions")+'"><small>'+this.t("Vị trí","INDEX")+'</small>'+groups+'</div>';
  }
  frontier(v) {
    if (v.replay) return "";
    const states = v.event==="commit-frontier"?v.frontier.dp:v.frontier.next.length?v.frontier.next:v.frontier.dp;
    return '<section class="ft514-dp-card"><header><strong>'+this.t("Giữ mọi vị trí trùng chữ","Keep every occurrence")+'</strong><small>'+this.t("vị trí → số bước tốt nhất","position → best total")+'</small></header><div class="ft514-states">'+states.map(s=>'<span class="'+(s.position===v.cursor.target?'active':"")+'"><small>'+v.input.ring[s.position]+' @'+s.position+'</small><b>'+s.cost+'</b></span>').join("")+'</div>'+(Math.max(v.frontier.count,v.frontier.nextCount)>states.length?'<small>'+this.t("Một số trạng thái minh họa","Selected states illustrated")+'</small>':"")+'</section>';
  }
  render(step) {
    const v=step.freedomTrail514View;if(!v||v.version!==2)return;
    const tr=v.transition, replay=v.replay;
    const labels={"set-ring-size":this.t("Độ dài vòng","Ring size"),"initialize-positions":this.t("Tạo chỉ mục","Index map"),"scan-ring-position":this.t("Đọc ký tự","Read letter"),"store-ring-position":this.t("Lưu vị trí","Store index"),"seed-dp":this.t("Khởi tạo DP","Seed DP"),"select-key-character":this.t("Chữ tiếp","Next key"),"initialize-next-layer":this.t("Lớp mới","New layer"),"select-target-position":this.t("Đích","Target"),"initialize-best-cost":this.t("Chi phí tốt nhất","Best cost"),"select-predecessor":this.t("Vị trí trước","Previous"),"compute-linear-distance":this.t("Khoảng cách","Distance"),"compute-distance":this.t("Quay ngắn nhất","Shortest turn"),"build-candidate":this.t("Cộng chi phí","Add cost"),"write-next-cost":this.t("Chọn nhỏ nhất","Keep minimum"),"commit-frontier":this.t("Chốt lớp","Commit layer"),"replay-rotate":this.t("Quay","Rotate"),"replay-press":this.t("Bấm","Press"),"final-return":this.t("Kết quả","Answer")};
    const candidate=tr&&tr.total!==null&&!replay?'<div class="ft514-cost"><span>'+tr.baseCost+'<small>'+this.t("trước đó","before")+'</small></span><i>+</i><span>'+tr.turns+'<small>↻ / ↺</small></span><i>+</i><span>1<small>'+this.t("bấm","press")+'</small></span><i>=</i><strong>'+tr.total+'</strong></div><div class="ft514-best"><span>min(</span><b>'+(tr.bestBefore==null?'∞':tr.bestBefore)+'</b><i>,</i><b>'+tr.total+'</b><span>)</span><i>=</i><strong>'+tr.best+'</strong><em class="'+(tr.accepted?'accepted':'kept')+'">'+(tr.accepted?'✓':'·')+'</em></div>':"";
    const count=replay?'<div class="ft514-cost"><span>'+replay.turns+'<small>'+this.t("quay","turns")+'</small></span><i>+</i><span>'+replay.presses+'<small>'+this.t("bấm","presses")+'</small></span><i>=</i><strong>'+(v.final?v.answer:replay.turns+replay.presses)+'</strong></div>':"";
    const typed=replay?'<div class="ft514-typed">'+this.t("Đã nhập","Typed")+': <b>'+this.escape(replay.typed||"∅")+'</b>'+(v.event==="replay-press"?'<span>→ '+this.escape(v.cursor.keyChar)+' · +1</span>':"")+'</div>':"";
    const summary=v.final?'<div class="ft514-witness">'+v.actions.map(a=>'<div><b>'+a.char+' <small>@'+a.to+'</small></b><span>'+(a.direction==="clockwise"?'↻':a.direction==="counterclockwise"?'↺':'•')+' '+a.turns+' + '+this.t("bấm 1","press 1")+'</span></div>').join("")+'</div>':"";
    this.host.innerHTML='<section class="ft514-viz" role="region" aria-label="514 Freedom Trail"><header><strong>514 · '+(labels[v.event]||"")+'</strong><span>'+(!replay&&tr?'@'+tr.from+' → @'+tr.to:'ring · '+v.input.length)+'</span></header>'+this.key(v)+this.positionMap(v)+'<div class="ft514-main"><div class="ft514-wheel-panel">'+this.wheel(v)+'</div><div class="ft514-detail">'+(replay?"":this.directions(v))+candidate+count+typed+'</div></div>'+this.frontier(v)+summary+(v.truncated?'<small>'+this.t("Đã rút gọn bước tính · vẫn giữ đường tối ưu","DP steps shortened · optimal route kept")+'</small>':"")+'</section>';
  }
}
function renderFreedomTrail514View(step) {
  const host=document.getElementById("treeView");
  if(host)new FreedomTrail514Visualizer(host,typeof lang!=="undefined"?lang:"en").render(step);
}
