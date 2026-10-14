class Koko875Visualizer {
  constructor({host,language="en",escape=escapeHtml}){this.host=host;this.language=language;this.escape=escape;}
  t(vi,en){return this.language==="vi"?vi:en;}
  range(v){
    const {lo,hi,mid,maximum}=v;
    const ids=maximum<=20?Array.from({length:maximum},(_,i)=>i+1):[...new Set([1,lo&&lo-1,lo,mid,hi,hi&&hi+1,maximum])].filter(k=>k>=1&&k<=maximum).sort((a,b)=>a-b);
    let previous=0;
    const cells=ids.map(k=>{
      const gap=previous&&k>previous+1?'<span class="k875-gap">…</span>':"";previous=k;
      const state=v.final?(k<v.answer?"slow":k===v.answer?"answer":"fast"):lo!==null&&k<lo?"slow":hi!==null&&k>hi?"fast":"unknown";
      const mark=v.final&&k===v.answer?"✓":k===mid?"mid":k===lo&&k===hi?v.lowerName+"="+v.upperName:k===lo?v.lowerName:k===hi?v.upperName:"";
      return `${gap}<div class="k875-speed ${state}${k===mid&&!v.final?" mid":""}"><small>${mark||"·"}</small><b>${k}</b><span>${state==="slow"?"✕":state==="fast"||state==="answer"?"✓":"?"}</span></div>`;
    }).join("");
    return `<section class="k875-card"><header><strong>${this.t("Tốc độ nhỏ nhất?","Smallest speed?")}</strong><span>[${lo??"?"}, ${hi??"?"}]</span></header><div class="k875-speeds">${cells}</div>${v.nextLo!==undefined?`<div class="k875-shrink">[${lo}, ${hi}] → <b>[${v.nextLo}, ${v.nextHi}]</b> · ${v.feasible?this.t("giữ mid","keep mid"):this.t("bỏ mid","discard mid")}</div>`:""}</section>`;
  }
  piles(v){
    const rows=v.piles.map(p=>{
      const count=p.needed;
      const visible=count!==null&&(v.calculating||v.final)&&(p.done||p.active||v.final);
      const boxes=visible?Array.from({length:Math.min(count,6)},(_,hour)=>{
        const eaten=Math.min(v.speed,p.pile-hour*v.speed);
        return `<div class="k875-hour${p.active&&!p.done&&!v.final?" preview":""}"><small>◷ ${hour+1}</small><span class="k875-bananas" aria-hidden="true">${"🍌".repeat(Math.min(eaten,3))}</span><b>${eaten}</b><div class="k875-capacity"><span style="width:${100*eaten/v.speed}%"></span></div></div>`;
      }).join("")+(count>6?`<span class="k875-more">+${count-6}h</span>`:""): '<span class="k875-wait">…</span>';
      return `<div class="k875-pile${p.active?" active":""}${p.done||v.final?" done":""}" data-index="${p.index}" data-pile="${p.pile}" data-hours="${visible?count:"pending"}"><div class="k875-basket"><small>P${p.index}</small><span aria-hidden="true">🍌🍌🍌</span><b>${p.pile}</b></div><span class="k875-arrow">→</span><div class="k875-hours">${boxes}</div><span class="k875-pile-total">${visible?`${count}h`:"?"}</span></div>`;
    }).join("");
    const preview=v.phase==="add"?v.piles.find(p=>p.active):null;
    return `<section class="k875-card"><header><strong>🐒 ${v.speed??"?"} 🍌 / h</strong><small>${this.t("1 ô = 1 giờ · mỗi giờ 1 đống","1 box = 1 hour · one pile per hour")}</small></header><div class="k875-piles">${rows}</div>${v.n>v.piles.length?`<small>${this.t("Một số đống minh họa","Selected piles shown")} · n = ${v.n}</small>`:""}${preview?`<div class="k875-add">hours: ${v.hours} <span>+ ${preview.needed}</span> → ${v.hours+preview.needed} <small>${this.t("sau dòng này","after this line")}</small></div>`:""}</section>`;
  }
  total(v){
    const value=v.final?v.answerHours:v.calculating?v.hours:null;
    const ready=v.final||["check","shrink-hi","shrink-lo","while"].includes(v.phase)&&v.processed===v.n;
    const ok=value!==null&&value<=v.h;
    return `<div class="k875-time${ready?(ok?" good":" bad"):""}"><span>◷ ${value??"?"}h ${ready?(ok?"≤":">"):"/"} ${v.h}h</span><strong>${ready?(ok?"✓":"✕"):"…"}</strong><small>${ready?(ok?this.t("Kịp giờ","On time"):this.t("Quá chậm","Too slow")):this.t("Đang cộng giờ","Adding hours")}</small></div>`;
  }
  render(step){
    const v=step.koko875View;if(!v)return;
    const phases={init:this.t("Khởi tạo","Initialize"),while:this.t("Kiểm tra khoảng","Check range"),mid:this.t("Chọn tốc độ","Choose speed"),reset:this.t("Đặt lại giờ","Reset hours"),remainder:this.t("Kiểm tra phần dư","Check remainder"),loop:this.t("Đống tiếp theo","Next pile"),add:this.t("Cộng giờ của đống","Add pile hours"),check:this.t("Có kịp giờ?","On time?"),"shrink-hi":this.t("Giữ nửa trái","Keep left half"),"shrink-lo":this.t("Giữ nửa phải","Keep right half"),result:this.t("Tốc độ tối thiểu","Minimum speed")};
    const proof=v.final?`<div class="k875-proof">${v.answer>1?`<div class="bad"><b>${v.answer-1} 🍌/h</b><span>${v.slowerHours}h > ${v.h}h ✕</span></div>`:""}<div class="good"><b>${v.answer} 🍌/h</b><span>${v.answerHours}h ≤ ${v.h}h ✓</span></div></div>`:"";
    this.host.innerHTML=`<section class="k875-viz" aria-label="875 Koko Eating Bananas"><header><strong>875 · ${phases[v.phase]}</strong><span>${this.t("Trước dòng","Before line")} ${v.source.line}</span></header><div class="k875-current-code"><code>${this.escape(v.source.text.trim())}</code></div>${this.range(v)}${this.piles(v)}${this.total(v)}${proof}${v.truncated?`<small>${this.t("Trace đã rút gọn · đáp án tính toàn bộ input","Trace shortened · answer uses the complete input")}</small>`:""}</section>`;
  }
}
function renderKoko875View(step){new Koko875Visualizer({host:$("treeView"),language:lang,escape:escapeHtml}).render(step);}
