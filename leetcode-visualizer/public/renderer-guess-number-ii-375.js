class GuessCost375Visualizer {
  constructor({host,language="en",escape=escapeHtml}){this.host=host;this.language=language;this.escape=escape;}
  t(vi,en){return this.language==="vi"?vi:en;}
  money(value){return value===null||value===undefined?"?":value==="∞"?"∞":`$${value}`;}
  decision(v){
    const f=v.focus,active=f.lo!==null&&f.hi!==null&&f.pick!==null&&f.pick>=f.lo&&f.pick<=f.hi;
    const ids=v.n<=12?Array.from({length:v.n},(_,i)=>i+1):[...new Set([1,f.lo,f.pick,f.hi,v.n])].filter(Number.isInteger).sort((a,b)=>a-b);
    const rail=ids.map((i,k)=>`${k&&i>ids[k-1]+1?'<span class="gc375-gap">…</span>':""}<b class="${f.lo!==null&&(i<f.lo||i>f.hi)?"out ":""}${active&&i===f.pick?"pivot":""}">${i}</b>`).join("");
    const singleton=active&&f.lo===f.hi;
    const left=active?`[${f.lo}, ${f.pick-1}]`:"?",right=active?`[${f.pick+1}, ${f.hi}]`:"?";
    const leftEmpty=active&&f.pick===f.lo,rightEmpty=active&&f.pick===f.hi;
    const total=v.final?v.answer:v.total;
    return `<section class="gc375-card"><header><strong>${v.final?this.t("Kiểm chứng chiến lược","Verify the strategy"):this.t("Khoảng đang xét","Current interval")}</strong><small>${f.lo===null?`[1, ${v.n}]`:`[${f.lo}, ${f.hi}]`}</small></header><div class="gc375-numbers">${rail}</div>${singleton?`<div class="gc375-single">✓ ${f.pick} → <b>$0</b><small>${this.t("Chỉ còn một số · đoán đúng miễn phí","One number remains · correct guesses are free")}</small></div>`:`<div class="gc375-pivot"><span>${this.t("Đoán","Guess")}</span><b>${active?f.pick:"?"}</b><small>${this.t("Sai → trả","Wrong → pay")} ${this.money(active?f.pick:null)}</small></div><div class="gc375-fork" aria-hidden="true">↙ <span>↓</span> ↘</div><div class="gc375-branches"><div class="${active&&!leftEmpty&&v.left>=v.right?"worst":""}"><small>${this.t("Nhỏ hơn","Lower")}</small><span>${leftEmpty?"∅":left}</span><b>${this.money(v.left)}</b></div><div class="correct"><small>${this.t("Đoán đúng","Correct")}</small><span>✓</span><b>$0</b></div><div class="${active&&!rightEmpty&&v.right>=v.left?"worst":""}"><small>${this.t("Lớn hơn","Higher")}</small><span>${rightEmpty?"∅":right}</span><b>${this.money(v.right)}</b></div></div><div class="gc375-equation"><span>${this.money(active?f.pick:null)}</span><b>+</b><span>max(${this.money(v.left)}, ${this.money(v.right)})</span><b>=</b><strong>${this.money(total)}</strong></div>`}</section>`;
  }
  candidates(v){
    if(v.focus.lo===null||v.focus.hi===null||v.focus.lo===v.focus.hi)return "";
    const costs=new Map(v.candidates.map(c=>[c.pick,c.cost])),width=v.focus.hi-v.focus.lo+1;
    const ids=width<=12?Array.from({length:width},(_,i)=>v.focus.lo+i):v.candidates.map(c=>c.pick);
    return `<section class="gc375-card"><header><strong>MIN · ${this.t("Chọn chi phí thấp nhất","Choose the lowest cost")}</strong><b class="gc375-best">${this.money(v.final?v.answer:v.best)}</b></header><div class="gc375-candidates">${ids.map(pick=>`<div class="${pick===v.selected?"chosen ":""}${!v.final&&pick===v.focus.pick?"active":""}" data-pick="${pick}"><small>${this.t("đoán","guess")} ${pick}</small><b>${this.money(costs.get(pick))}</b><span>${pick===v.selected?"✓":"·"}</span></div>`).join("")}</div>${width>12?`<small>${this.t("Hình rút gọn","Picture condensed")} · ${v.candidateCount}/${width}</small>`:""}</section>`;
  }
  table(v){
    if(!v.table)return "";
    return `<details class="gc375-card gc375-table"${v.phase==="save"?" open":""}><summary>▦ dp[lo][hi] ${v.n>10?this.t("· cửa sổ rút gọn","· condensed window"):""}</summary><div class="gc375-table-wrap"><table><thead><tr><th>lo \ hi</th>${v.indices.map(i=>`<th>${i}</th>`).join("")}</tr></thead><tbody>${v.table.map((row,i)=>`<tr><th>${v.indices[i]}</th>${row.map(cell=>`<td class="${cell.lo===v.focus.lo&&cell.hi===v.focus.hi?"current":""}${cell.ready?" ready":""}" data-lo="${cell.lo}" data-hi="${cell.hi}">${cell.lo>cell.hi?"":cell.ready?cell.value:"·"}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
  }
  proof(v){
    if(!v.final)return "";
    const path=v.worstPath.length<=12?v.worstPath:[...v.worstPath.slice(0,5),...v.worstPath.slice(-5)];
    return `<section class="gc375-card"><header><strong>${this.t("Một kịch bản xấu nhất","One worst-case scenario")}</strong><b>${this.money(v.answer)}</b></header><div class="gc375-proof">${path.map((s,i)=>`${i?'<span class="gc375-proof-arrow">→</span>':""}<div class="${s.paid===0?"correct":""}"><b>${s.pick}</b><span>${s.paid===0?"✓ $0":`✕ $${s.paid}`}</span><small>Σ $${s.total}</small></div>`).join("")}</div></section>`;
  }
  render(step){
    const v=step.guessCost375View;if(!v)return;
    const phase={init:this.t("Khởi tạo bảng","Initialize table"),length:this.t("Tăng độ dài khoảng","Increase interval length"),interval:this.t("Chọn đầu trái","Choose left endpoint"),right:this.t("Tính đầu phải","Compute right endpoint"),reset:this.t("Đặt best = ∞","Reset best to infinity"),pick:this.t("Thử lần đoán tiếp theo","Try the next guess"),max:this.t("Tính chi phí xấu nhất","Compute worst-case cost"),min:this.t("Giữ chi phí nhỏ nhất","Keep the minimum cost"),save:this.t("Lưu chi phí cho khoảng","Save this interval's cost"),result:this.t("Ngân sách bảo đảm tối thiểu","Minimum guaranteed budget")};
    this.host.innerHTML=`<section class="gc375-viz" aria-label="375 Guess Number Higher or Lower II"><header><strong>375 · MIN → MAX</strong><span>${this.t("Trước dòng","Before line")} ${v.source.line}</span></header><div class="gc375-source"><code>${this.escape(v.source.text.trim())}</code><small>${phase[v.phase]}</small></div>${v.trace.truncated?`<div class="gc375-notice">${this.t("Trace rút gọn","Trace condensed")} · ${v.trace.omitted} ${this.t("dòng đã lược · đáp án tính toàn bộ","line events omitted · complete answer computed")}</div>`:""}${this.decision(v)}${this.candidates(v)}${this.proof(v)}${this.table(v)}</section>`;
  }
}
function renderGuessCost375View(step){new GuessCost375Visualizer({host:$("treeView"),language:lang,escape:escapeHtml}).render(step);}
