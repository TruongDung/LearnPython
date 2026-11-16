class CherryPickup1463Visualizer {
  constructor({ host, language = "en", escape = escapeHtml }) { this.host = host; this.language = language; this.escape = escape; }
  t(vi, en) { return this.language === "vi" ? vi : en; }
  robot(name, x, y) {
    return `<g class="cp1463-robot robot-${name.toLowerCase()}" transform="translate(${x} ${y})"><path d="M0 -9 V-14"/><rect x="-11" y="-9" width="22" height="18" rx="5"/><circle cx="-4" cy="-2" r="1.7"/><circle cx="4" cy="-2" r="1.7"/><path d="M-4 4 H4"/><text y="23" text-anchor="middle">${name}</text></g>`;
  }
  slots(indices) {
    let previous = -1;
    const slots = [];
    for (const index of indices) { if (previous >= 0 && index > previous + 1) slots.push(null); slots.push(index); previous = index; }
    return slots;
  }
  board(v) {
    const board = v.board, rs = this.slots(board.rowIndices), cs = this.slots(board.colIndices);
    const chosen = v.row !== null && v.row < v.rows - 1 ? (v.debug ? v.candidate : v.candidates.find(candidate => candidate.best)) : null;
    const cw = 65, ch = 80, width = 38 + cs.length * cw, height = 30 + rs.length * ch;
    const x = col => 38 + cs.indexOf(col) * cw, y = row => 30 + rs.indexOf(row) * ch;
    const cells = rs.map((r, rowSlot) => {
      if (r === null) return `<text class="cp1463-gap" x="20" y="${30 + rowSlot * ch + 40}">⋮</text>`;
      return `<text class="cp1463-axis" x="17" y="${y(r) + 43}">${r}</text>` + cs.map((c, colSlot) => {
        if (c === null) return `<text class="cp1463-gap" x="${38 + colSlot * cw + 32}" y="${y(r) + 43}">…</text>`;
        const pathRow = v.path.find(pair => pair.row === r);
        const nextA = chosen && r === v.row + 1 && c === chosen.c1;
        const nextB = chosen && r === v.row + 1 && c === chosen.c2;
        const hasA = pathRow ? pathRow.c1 === c : (r === v.row && c === v.c1) || nextA;
        const hasB = pathRow ? pathRow.c2 === c : (r === v.row && c === v.c2) || nextB;
        const activeA = r === v.row && c === v.c1, activeB = r === v.row && c === v.c2;
        const value = board.cells[board.rowIndices.indexOf(r)][board.colIndices.indexOf(c)];
        return `<g class="cp1463-cell${hasA ? " has-a" : ""}${hasB ? " has-b" : ""}${r === v.row ? " current-row" : ""}${nextA || nextB ? " next-row" : ""}" data-row="${r}" data-col="${c}" data-value="${value}" transform="translate(${x(c)} ${y(r)})"><rect x="3" y="3" width="59" height="74" rx="10"/>${activeA ? this.robot("A", activeB ? 21 : 32, 23) : ""}${activeB ? this.robot("B", activeA ? 44 : 32, 23) : ""}${nextA ? `<g class="cp1463-ghost">${this.robot("A", nextB ? 21 : 32, 23)}</g>` : ""}${nextB ? `<g class="cp1463-ghost">${this.robot("B", nextA ? 44 : 32, 23)}</g>` : ""}${hasA && !activeA && !nextA ? '<circle class="cp1463-trail trail-a" cx="23" cy="22" r="5"/>' : ""}${hasB && !activeB && !nextB ? '<rect class="cp1463-trail trail-b" x="35" y="17" width="10" height="10" rx="2"/>' : ""}<text class="cp1463-cherries" x="32" y="66" text-anchor="middle">🍒 ${value}</text></g>`;
      }).join("");
    }).join("");
    const lines = ["A", "B"].map(name => v.path.slice(1).map((pair, i) => {
      const prev = v.path[i], col = name === "A" ? pair.c1 : pair.c2, prevCol = name === "A" ? prev.c1 : prev.c2;
      if (![pair.row, prev.row].every(r => board.rowIndices.includes(r)) || ![col, prevCol].every(c => board.colIndices.includes(c))) return "";
      const offset = name === "A" ? 25 : 40;
      return `<path class="cp1463-path path-${name.toLowerCase()}" d="M${x(prevCol) + offset} ${y(prev.row) + 42} L${x(col) + offset} ${y(pair.row) + 15}"/>`;
    }).join("")).join("");
    const nextLines = chosen ? ["A", "B"].map(name => {
      const from = name === "A" ? v.c1 : v.c2, to = name === "A" ? chosen.c1 : chosen.c2;
      const offset = name === "A" ? 20 : 45;
      return `<path class="cp1463-path path-${name.toLowerCase()}" d="M${x(from) + offset} ${y(v.row) + 47} L${x(to) + offset} ${y(v.row + 1) + 11}"/>`;
    }).join("") : "";
    const headers = cs.map((c, i) => c === null ? "" : `<text class="cp1463-axis" x="${38 + i * cw + 32}" y="18" text-anchor="middle">${c}</text>`).join("");
    const name = this.t("Robot A và B trên vườn cherry; hai đường đi có màu và hình khác nhau", "Robots A and B in the cherry field; paths use distinct colors and shapes");
    return `<div class="cp1463-board-scroll"><svg class="cp1463-board" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${name}">${headers}${cells}${lines}${nextLines}</svg></div>${board.cropped ? `<small>${this.t("Vườn rút gọn · chỉ số ô giữ nguyên", "Condensed field · original cell indices")}</small>` : ""}`;
  }
  gain(v) {
    if(v.debug&&(!v.pairActive||!v.gainReady)){
      const label=v.gain===null?this.t('Cherry của cặp đang xét','Cherries for the current pair'):'cherries';
      return `<div class="cp1463-gain"><span>${label} = <b data-cp1463-gain="${v.gain??''}">${v.gain??'…'}</b></span><small>${!v.pairActive?this.t('Chờ chọn đủ hai cột','Await both columns'):v.gain===null?this.t('Chờ đọc ô A','Await reading A'):this.t('Đã đọc A · chờ kiểm tra / cộng B','A read · await checking / adding B')}</small></div>`;
    }
    const rowIndex = v.board.rowIndices.indexOf(v.row);
    const a = v.board.cells[rowIndex][v.board.colIndices.indexOf(v.c1)], b = v.board.cells[rowIndex][v.board.colIndices.indexOf(v.c2)];
    return `<div class="cp1463-gain"><span class="robot-a">A · 🍒 ${a}</span>${v.c1 === v.c2 ? `<span class="cp1463-overlap">A = B · ${this.t("nhặt 1 lần", "collect once")}</span>` : `<span>+</span><span class="robot-b">B · 🍒 ${b}</span>`}<span>=</span><strong>🍒 ${v.gain}</strong></div>`;
  }
  moveTiles(v) {
    const dirs = ["↙", "↓", "↘"];
    const tiles = v.candidates.map(c => `<div class="cp1463-move${c.valid ? "" : " invalid"}${c.best ? " best" : ""}" data-valid="${c.valid}" data-future="${c.future ?? ""}">${c.valid ? `<div class="cp1463-pair"><span class="robot-a">A:${c.c1}</span><span class="robot-b">B:${c.c2}</span></div><b>${c.future ?? "·"}</b><small>${c.best ? `✓ ${this.t("chọn", "pick")}` : c.c1 === c.c2 ? this.t("cùng ô", "same cell") : "🍒"}</small>` : `<b>×</b><small>${this.t("Ngoài vườn", "Outside")}</small>`}</div>`);
    return `<section class="cp1463-card"><header><strong>${this.t("9 cặp bước xuống", "9 pairs of downward moves")}</strong><small>${this.t("Số = tốt nhất từ hàng dưới", "Value = best from the next row")}</small></header><div class="cp1463-move-head"><span class="robot-a">A ↕</span><span class="robot-b">B ↔</span></div><div class="cp1463-moves"><span></span>${dirs.map(d => `<span class="cp1463-direction robot-b">${d}</span>`).join("")}${dirs.map((d, i) => `<span class="cp1463-direction robot-a">${d}</span>${tiles.slice(i * 3, i * 3 + 3).join("")}`).join("")}</div></section>`;
  }
  matrix(v) {
    if (!v.matrix) return "";
    const m = v.matrix;
    return `<details class="cp1463-matrix"><summary>${this.t("Xem lớp DP", "View DP layer")} · row ${m.row} · A × B</summary><div class="cp1463-matrix-scroll"><table><thead><tr><th>A ∖ B</th>${m.indices.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${m.indices.map((a, i) => `<tr><th>${a}</th>${m.cells[i].map((value, j) => `<td${a === v.c1 && m.indices[j] === v.c2 ? ' class="active"' : ""}>${value ?? "·"}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
  }
  debugLayer(layer,kind,v) {
    if(!layer)return `<section class="cp1463-debug-layer"><header><b>${kind}</b><small>${this.t('Chưa cấp phát','Not allocated')}</small></header></section>`;
    const current=kind==='current',base=!current&&layer.row===v.rows;
    const cells=layer.indices.map((a,i)=>`<tr><th scope="row">${a}</th>${layer.indices.map((b,j)=>{
      const raw=layer.cells[i][j],known=!current||layer.known[i][j],active=current&&v.pairActive&&layer.row===v.row&&a===v.c1&&b===v.c2,probe=!current&&v.candidate&&a===v.candidate.c1&&b===v.candidate.c2;
      return `<td><button type="button" data-cp1463-dp="${layer.row}:${a}:${b}" data-cp1463-layer="${kind}" data-cp1463-raw="${raw}" data-cp1463-value="${known?raw:''}" data-cp1463-known="${known}" class="${active?'active':''} ${probe?'probe':''} ${known?'known':'unknown'}" ${base?'disabled':''} title="${kind}[${a}][${b}] = ${raw}${known?'':this.t(' · khởi tạo, chưa tính',' · initialized, not computed')}">${known?raw:'·'}</button></td>`;
    }).join('')}</tr>`).join('');
    return `<section class="cp1463-debug-layer" data-cp1463-layer-row="${layer.row}"><header><b>${kind}</b><small>${base?this.t('Cơ sở','Base')+' · ':''}row ${layer.row}</small></header><div class="cp1463-debug-table-scroll"><table aria-label="${kind} row ${layer.row}"><thead><tr><th>A ∖ B</th>${layer.indices.map(c=>`<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${cells}</tbody></table></div>${current?`<small>· ${this.t('Chưa tính · giá trị khởi tạo là 0','Uncomputed · initialized to 0')}</small>`:''}</section>`;
  }
  renderDebug(step) {
    const v=step.cherryPickup1463View,host=this.host,state=host.dataset??{},key=JSON.stringify(v.board.cells);
    if(state.cp1463DebugKeyState!==key){state.cp1463DebugKeyState=key;delete state.cp1463ReplayState;}
    const at=typeof stepIndex==='number'?stepIndex:0,count=typeof steps!=='undefined'?steps.length:v.trace.captured;
    const cursor=Math.max(0,Math.min(v.path.length-1,Number(state.cp1463ReplayState??v.path.length-1)||0));
    const selected=v.final?v.path[cursor]:null,display=selected?{...v,row:selected.row,c1:selected.c1,c2:selected.c2,gain:selected.gain,gainReady:true,pairActive:true,path:v.path.slice(0,cursor+1),candidates:[],candidate:null}:v;
    const control=(action,label)=>`<button type="button" data-cp1463-control="${action}">${label}</button>`;
    const candidate=v.candidate,comparison=candidate?`<div class="cp1463-debug-compare"><small>next_dp[${candidate.c1}][${candidate.c2}]</small>${candidate.future===null?`<b>${this.t('Chờ đọc và so sánh','Await read and comparison')}</b>`:`<code>best_next = max(${candidate.before}, ${candidate.future}) = <b data-cp1463-best="${candidate.after}">${candidate.after}</b></code>`}</div>`:'';
    const equation=v.pairActive&&v.bestNext!==null?`<div class="cp1463-calculation"><span>${v.gain}</span><span>+</span><span>${v.bestNext}</span><span>=</span><strong data-cp1463-written-value="${v.total??''}">${v.total??'…'}</strong><small>${v.total===null?this.t('best_next hiện tại · chưa ghi current','Current best_next · current not written'):this.t('Đã ghi current','Written to current')}</small></div>`:'';
    const replay=selected?`<section class="cp1463-debug-replay"><header><b>${this.t('Phát lại đường tối ưu','Replay the optimal route')}</b><strong><span data-cp1463-collected="${selected.collected}">${selected.collected}</span> / <span data-cp1463-answer="${v.answer}">${v.answer}</span> 🍒</strong></header><nav>${v.path.map((pair,i)=>`<button type="button" data-cp1463-replay="${i}" aria-pressed="${i===cursor}">r${pair.row} · +${pair.gain}</button>`).join('')}</nav></section>`:'';
    host.innerHTML=`<section class="cp1463-viz cp1463-debug-viz" data-debug="line-by-line" data-source-line="${v.source.line}" data-phase="${v.phase}"><header><strong>1463 · ${this.t('Debug từng dòng','Line-by-line debug')}</strong><small>${at+1}/${count}</small></header><section class="cp1463-source-card"><header><b>L${v.source.line}</b><small>${typeof v.branch==='boolean'?(v.branch?'✓ True':'× False'):v.phase==='write'?this.t('Ghi DP','Write DP'):''}</small></header><code data-cp1463-source>${this.escape(v.source.text)}</code><div class="cp1463-debug-vars">${step.vars.map(variable=>`<span data-cp1463-var="${variable.name}">${variable.name}: <b>${this.escape(String(variable.value))}</b></span>`).join('')}</div></section><nav class="cp1463-debug-controls">${control('first','↶')}${control('previous','←')}${control('line',this.t('Từng dòng','Next line')+' →')}${control('compare',this.t('So sánh kế','Next comparison'))}${control('write',this.t('Ghi ô kế','Next write'))}${control('row',this.t('Xong hàng','Finish row'))}${control('last',this.t('Kết quả','Result')+' ⇥')}</nav>${v.phase==='promote'?`<div class="cp1463-debug-promote">next_dp ← current · row ${v.nextMatrix.row}</div>`:''}<div class="cp1463-debug-layers">${this.debugLayer(v.matrix,'current',v)}${this.debugLayer(v.nextMatrix,'next_dp',v)}</div>${replay}<div class="cp1463-main"><section class="cp1463-card cp1463-field"><header><span class="robot-a">● A</span><span class="robot-b">■ B</span><small>${v.final?this.t('Đường tối ưu ↓','Optimal route ↓'):this.t('Trạng thái DP đang xét','Current DP state')}</small></header>${this.board(display)}${this.gain(display)}</section><div class="cp1463-detail">${comparison}${equation}${v.pairActive?`<details class="cp1463-debug-choices"><summary>${this.t('Các cặp bước đã xét','Next-move pairs examined')}</summary>${this.moveTiles(v)}</details>`:''}</div></div></section>`;
  }
  render(step) {
    const v = step.cherryPickup1463View;
    if (!v) return;
    if (v.debug) return this.renderDebug(step);
    const phases = { intro: this.t("Hai robot", "Two robots"), focus: this.t("Thử một cặp cột", "Try a column pair"), compare: this.t("Chọn tốt nhất", "Pick the best"), write: this.t("Lưu DP", "Save DP"), path: this.t("Đi theo đường tối ưu", "Follow an optimal path"), result: this.t("Kết quả", "Result") };
    const replay = v.phase === "path" || v.final;
    const total = replay ? `<div class="cp1463-total"><span>${this.t("Đã nhặt", "Collected")}</span><strong>🍒 ${v.collected}</strong>${v.final ? '<span>✓ max</span>' : ""}</div>` : "";
    const calculation = v.bestNext !== null ? `<div class="cp1463-calculation"><span>🍒 ${v.gain}</span><span>+</span><span>${v.bestNext} <small>${this.t("hàng dưới", "next row")}</small></span><span>=</span><strong>${v.total ?? "?"}</strong></div>` : "";
    const intro = v.phase === "intro" ? `<div class="cp1463-rules"><span class="robot-a">A: ↙ ↓ ↘</span><span class="robot-b">B: ↙ ↓ ↘</span><span>A = B → 🍒 × 1</span></div>` : "";
    const base = v.row === v.rows - 1 && !replay && v.phase !== "intro" ? `<div class="cp1463-base">${this.t("Hàng cuối → không còn bước tiếp theo", "Last row → no next move")} · +0</div>` : "";
    const timeline = replay ? `<div class="cp1463-timeline">${v.path.map(p => `<span class="${p.row === v.row ? "active" : ""}"><small>r${p.row}</small><b>+${p.gain}</b></span>`).join("")}</div>` : "";
    this.host.innerHTML = `<section class="cp1463-viz"><header><strong>1463 · ${this.t("Tổng quan", "Overview")} · ${phases[v.phase]}</strong><span>${replay || v.phase === "intro" ? "↓" : "↑ DP"} ${this.t("hàng", "row")} ${v.row} / ${v.rows - 1}</span></header>${total}${intro}<div class="cp1463-main"><section class="cp1463-card cp1463-field"><header><span class="robot-a">● A</span><span class="robot-b">■ B</span><small>${v.rows} × ${v.cols}</small></header>${this.board(v)}${this.gain(v)}</section><div class="cp1463-detail">${v.candidates.length ? this.moveTiles(v) : ""}${base}${calculation}${!replay && v.phase !== "intro" ? `<small class="cp1463-layer">${this.t("DP tính từ dưới lên · đang thử A", "DP works upward · trying A")}:${v.c1}, B:${v.c2}</small>` : ""}</div></div>${timeline}${this.matrix(v)}${v.phase === "focus" ? `<small>${this.t("Chỉ minh họa một số cặp · thuật toán tính mọi cặp cột", "Selected pairs illustrated · algorithm computes every column pair")}</small>` : ""}</section>`;
  }
}
function renderCherryPickup1463View(step) {
  const host=$("treeView"),v=step.cherryPickup1463View;
  new CherryPickup1463Visualizer({ host, language: lang, escape: escapeHtml }).render(step);
  if(!v?.debug)return;
  const stop=()=>{if(typeof stopPlay==='function')stopPlay();},go=index=>{if(typeof steps==='undefined'||index<0||index>=steps.length)return;stop();stepIndex=index;renderStep();};
  host.querySelectorAll?.('[data-cp1463-control]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.cp1463Control;
    if(action==='first')return go(0);
    if(action==='previous')return go(Math.max(0,stepIndex-1));
    if(action==='line')return go(Math.min(steps.length-1,stepIndex+1));
    if(action==='last'){delete host.dataset.cp1463ReplayState;return go(steps.length-1);}
    const phase={compare:'compare',write:'write',row:'promote'}[action],index=steps.findIndex((s,i)=>i>stepIndex&&s.cherryPickup1463View?.phase===phase);go(index<0?steps.length-1:index);
  }));
  host.querySelectorAll?.('[data-cp1463-dp]').forEach(button=>button.addEventListener('click',()=>{
    const[row,c1,c2]=button.dataset.cp1463Dp.split(':').map(Number),index=steps.findIndex(s=>{const a=s.cherryPickup1463View;return a?.phase==='write'&&a.row===row&&a.c1===c1&&a.c2===c2;});go(index);
  }));
  host.querySelectorAll?.('[data-cp1463-replay]').forEach(button=>button.addEventListener('click',()=>{stop();host.dataset.cp1463ReplayState=button.dataset.cp1463Replay;renderStep();}));
  host.querySelectorAll?.('button,summary').forEach(button=>button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')event.stopPropagation();}));
}
