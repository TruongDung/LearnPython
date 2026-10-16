class CanIWin464Visualizer {
  constructor({host,language="en",escape=escapeHtml}){this.host=host;this.language=language;this.escape=escape;}
  t(vi,en){return this.language==="vi"?vi:en;}
  verdict(result){return result===null?"?":result?"WIN ✓":"LOSE ✕";}
  cards(v){
    const focused=["bit","used","skip","try","save-win","return-win"].includes(v.phase);
    return `<section class="ci464-card"><header><strong>${this.t("Chọn số chưa dùng","Choose an unused number")}</strong><small>mask = ${v.mask} · 1 = ${this.t("đã dùng","used")}</small></header><div class="ci464-numbers">${Array.from({length:v.m},(_,i)=>{const pick=i+1,used=!!(v.mask&(1<<i));return `<div class="${used?"used ":""}${focused&&pick===v.pick?"active ":""}${v.winningPick===pick?"winning":""}" data-pick="${pick}" data-used="${used}"><small>bit ${i}</small><b>${pick}</b><span>${used?"1 ✕":"0"}</span></div>`;}).join("")}</div></section>`;
  }
  branch(v){
    if(!["try","save-win","return-win"].includes(v.phase)||v.pick===null)return "";
    const immediate=v.pick>=v.remaining,answer=immediate?true:v.childResult===null?null:!v.childResult;
    return `<section class="ci464-card ci464-branch"><header><strong>P${v.player} ${this.t("chọn","picks")} ${v.pick}</strong><small>${immediate?`${v.pick} ≥ ${v.remaining}`:`${v.pick} < ${v.remaining}`}</small></header><div class="ci464-fork"><div class="ci464-player p${v.player}"><small>P${v.player}</small><b>${v.pick}</b><span>${this.verdict(answer)}</span></div><strong>→</strong><div class="ci464-player ${immediate?"good":"p"+(3-v.player)}"><small>${immediate?this.t("Đạt tổng","Target reached"):`P${3-v.player}`}</small><b>${immediate?"🏁":v.remaining-v.pick}</b><span>${immediate?"✓":this.verdict(v.childResult)}</span></div></div><div class="ci464-rule">${immediate?this.t("Đủ tổng ngay → thắng","Reach the target now → win"):v.childResult===false?this.t("Đối thủ LOSE → mình WIN","Opponent LOSE → current player WIN"):v.childResult===true?this.t("Đối thủ WIN → bỏ nước này","Opponent WIN → reject this move"):this.t("Đối thủ có chắc thắng không?","Can the opponent force a win?")}</div></section>`;
  }
  moves(v){
    if(!v.moves.length)return "";
    return `<section class="ci464-card"><header><strong>${this.t("Các nước đã thử","Moves tried")}</strong><small>${this.t("kết quả cho người đang tới lượt","result for the player to move")}</small></header><div class="ci464-moves">${v.moves.map(move=>`<div class="${move.winning?"good":"bad"}" data-move="${move.pick}" data-winning="${move.winning}"><b>${move.pick}</b><span>${move.winning?"✓ WIN":"✕ LOSE"}</span>${move.reason==="reach"?'<small>🏁</small>':move.response!==null?`<small>P${3-v.player} → ${move.response}</small>`:`<small>P${3-v.player} ${move.winning?"LOSE":"WIN"}</small>`}</div>`).join("")}</div></section>`;
  }
  stack(v){
    if(!v.stack.length)return "";
    const frames=v.stack.length<=6?v.stack:[v.stack[0],...v.stack.slice(-4)];
    return `<section class="ci464-card"><header><strong>${this.t("Đường đang xét","Current branch")}</strong><small>${this.t("còn thiếu","remaining")}</small></header><div class="ci464-stack">${frames.map((f,i)=>`${i?'<span>→</span>':""}<div class="p${f.player}"><small>P${f.player}${f.via===null?"":` · +${f.via}`}</small><b>${f.remaining}</b></div>`).join("")}</div></section>`;
  }
  memo(v){
    if(!v.memoReady)return "";
    return `<details class="ci464-card ci464-memo"${v.phase==="cache-return"?" open":""}><summary>♻ memo · ${v.memoCount} ${this.t("trạng thái","states")} · ${v.cacheHits} cache hits</summary><div class="ci464-memo-items">${v.memoRecent.map(entry=>`<span class="${entry.result?"good":"bad"}"><small>mask ${entry.mask}</small><b>${this.verdict(entry.result)}</b></span>`).join("")||"∅"}</div><small>${this.t("WIN / LOSE xét từ người tới lượt trong trạng thái đó","WIN / LOSE is relative to the player to move in that state")}</small></details>`;
  }
  render(step){
    const v=step.canIWin464View;if(!v)return;
    const phases={zero:this.t("Mục tiêu đã đạt?","Target already reached?"),sum:this.t("Tổng mọi số có đủ không?","Is the sum of all numbers enough?"),"early-win":this.t("Đã đạt mục tiêu → thắng","Target already reached → win"),unreachable:this.t("Tổng mọi số vẫn thiếu → không thể thắng","All numbers together are insufficient"),memo:this.t("Khởi tạo memo","Initialize memo"),define:this.t("Hàm xét người tới lượt","Define current-player evaluation"),start:this.t("Người 1 bắt đầu","Player 1 starts"),cache:this.t("Trạng thái đã biết?","Already evaluated?"),"cache-return":this.t("Dùng lại kết quả memo","Reuse memo result"),choose:this.t("Thử số tiếp theo","Try the next number"),bit:this.t("Tính bit của số vừa chọn","Compute this number's bit"),used:this.t("Số đã dùng?","Already used?"),skip:this.t("Bỏ số đã dùng","Skip a used number"),try:this.t("Thắng ngay hoặc làm đối thủ thua","Win now or make the opponent lose"),"save-win":this.t("Lưu trạng thái thắng","Memoize a winning state"),"return-win":this.t("Người tới lượt chắc thắng","The current player can force a win"),"save-loss":this.t("Mọi nước đi đều thua","Every move loses"),"return-loss":this.t("Người tới lượt không thể ép thắng","The current player cannot force a win")};
    const result=v.final?v.answer:v.phase==="cache-return"?v.memoValue:["return-win","return-loss"].includes(v.phase)?v.phase==="return-win":null;
    const total=v.target-v.remaining,progress=v.target>0?Math.max(0,Math.min(100,total/v.target*100)):100;
    this.host.innerHTML=`<section class="ci464-viz" aria-label="464 Can I Win"><header><strong>464 · WIN / LOSE</strong><span>${this.t("Trước dòng","Before line")} ${v.source.line} · ${v.source.scope}</span></header><div class="ci464-source"><code>${this.escape(v.source.text.trim())}</code><small>${phases[v.phase]}</small></div>${v.trace.truncated?`<div class="ci464-notice">${this.t("Trace rút gọn","Trace condensed")} · ${v.trace.omitted} ${this.t("dòng đã lược · đáp án tính toàn bộ","line events omitted · complete answer computed")}</div>`:""}<div class="ci464-dashboard"><div class="ci464-turn p${v.player}"><small>${this.t("Tới lượt","To move")}</small><b>P${v.player}</b></div><div class="ci464-target"><small>${this.t("Còn thiếu","Remaining")}</small><b>${Math.max(0,v.remaining)}</b><span>Σ ${total} / ${v.target}</span></div><div class="ci464-verdict${result===null?"":result?" good":" bad"}"><small>${v.final?this.t("Người 1","Player 1"):this.t("Người tới lượt","Current player")}</small><b>${this.verdict(result)}</b></div></div><div class="ci464-progress"><span style="width:${progress}%"></span></div>${this.cards(v)}${this.branch(v)}${this.moves(v)}${this.stack(v)}${this.memo(v)}</section>`;
  }
}
function renderCanIWin464View(step){new CanIWin464Visualizer({host:$("treeView"),language:lang,escape:escapeHtml}).render(step);}
