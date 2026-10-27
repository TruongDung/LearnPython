"use strict";
const SUDOKU37_UNDO_EXAMPLE = "53.67...2;6.....34.;.9...2...;.59.6..23;..6.5..9.;..3..4..6;.6....2..;287.1.6.5;.4..86.7.";
function s37Escape(value) { return escapeHtml(String(value ?? "")); }
function s37Cell(value,kind="") { return `<span class="s37-mini-cell ${kind}">${s37Escape(value)}</span>`; }
function s37UnitIcon(type) {
  return `<svg viewBox="0 0 28 28" aria-hidden="true">${Array.from({length:9},(_,i)=>`<rect x="${2+i%3*8}" y="${2+Math.floor(i/3)*8}" width="6" height="6" rx="1" class="${type==='row'?Math.floor(i/3)===1?'lit':'':type==='col'?i%3===1?'lit':'':'lit'}"/>`).join('')}</svg>`;
}
function s37Board(v,vi) {
  const a=v.active,d=v.locals.digit, size=36, start=26;
  const countMap=new Map((v.locals.choices||[]).map(([count,r,c])=>[`${r}-${c}`,count]));
  const min=countMap.size?Math.min(...countMap.values()):null;
  const counting=!a && countMap.size>0;
  const peers=a?`<rect class="s37-row-area" x="${start}" y="${start+a.r*size}" width="324" height="36"/><rect class="s37-col-area" x="${start+a.c*size}" y="${start}" width="36" height="324"/><rect class="s37-box-area" x="${start+Math.floor(a.c/3)*108}" y="${start+Math.floor(a.r/3)*108}" width="108" height="108"/>`:'';
  const cells=v.board.map((row,r)=>[...row].map((char,c)=>{
    const selected=a?.r===r&&a?.c===c, given=v.givens[r][c]!=='.';
    const peer=a&&(a.r===r||a.c===c||Math.floor(r/3)===Math.floor(a.r/3)&&Math.floor(c/3)===Math.floor(a.c/3));
    const conflict=v.check&&Object.values(v.check).some(Boolean)&&peer&&!selected&&char===d;
    const preview=selected&&char==='.'&&d!==undefined&&['try','blocked','allowed','skip'].includes(v.phase);
    const count=countMap.get(`${r}-${c}`),cx=start+c*size,cy=start+r*size;
    return `<g class="s37-cell ${given?'given':char!=='.'?'filled':''} ${selected?'selected':''} ${preview?'previewing':''} ${conflict?'conflict':''} ${counting&&count===min?'mrv':''} ${v.solved===true&&!given?'solved':''}" data-cell="${r}-${c}" data-value="${char}" ${conflict?`data-conflict="${r}-${c}"`:''}>
      <title>(${r}, ${c}) ${char==='.'?'∅':char}</title><rect x="${cx+2}" y="${cy+2}" width="32" height="32" rx="5"/><text x="${cx+18}" y="${cy+25}" class="${preview?'preview':char==='.'&&!counting?'empty':''}">${char!=='.'?char:preview?d:counting?count??'·':'·'}</text>${conflict?`<path class="s37-conflict-mark" d="M${cx+26},${cy+4} l5,5 m0,-5 l-5,5"/>`:''}</g>`;
  }).join('')).join('');
  const lines=Array.from({length:10},(_,i)=>`<path class="s37-grid ${i%3===0?'thick':''}" d="M${start+i*size},${start} V350 M${start},${start+i*size} H350"/>`).join('');
  const indices=Array.from({length:9},(_,i)=>`<text class="s37-index" x="${start+i*size+18}" y="16">${i}</text><text class="s37-index" x="13" y="${start+i*size+24}">${i}</text>`).join('');
  return `<svg class="s37-board" viewBox="0 0 366 366" role="img" aria-label="${s37Escape(vi?'Bảng Sudoku: ô vàng đang xét, ô đỏ gây trùng':'Sudoku: gold cell is active, red cells conflict')}"><rect class="s37-board-bg" x="26" y="26" width="324" height="324" rx="5"/>${peers}${cells}${lines}${indices}</svg>`;
}
function renderSudoku37Pictures(step) {
  const v=step.sudoku37View,vi=lang==='vi',x=v.locals,a=v.active,d=x.digit,esc=s37Escape;
  const label=(vn,en)=>vi?vn:en;
  const filled=v.board.join('').replaceAll('.','').length, line=step.codeLines[0];
  const empty=s37Cell('·'), digit=s37Cell(d??'?',v.phase==='undo'?'removed':'digit');
  let operation;
  if(v.phase==='undo') operation=`${digit}<strong>↩</strong>${empty}<code>board[${a.r}][${a.c}] = '.'</code>`;
  else if(v.phase==='place') operation=`${empty}<strong>→</strong>${digit}<span class="s37-good">✓</span>`;
  else if(['blocked','skip'].includes(v.phase)) operation=`${digit}<strong class="s37-bad">✕</strong>${['row','col','box'].map(type=>`<span class="s37-verdict ${v.check[type]?'bad':'good'}">${s37UnitIcon(type)}${v.check[type]?'✕':'✓'}</span>`).join('')}`;
  else if(v.phase==='allowed') operation=`${digit}<strong class="s37-good">✓</strong><code>${label('Không trùng hàng · cột · box','No row · column · box conflict')}</code>`;
  else if(v.phase==='try') operation=`${digit}<strong>→</strong>${empty}<code>(${a.r}, ${a.c})</code>`;
  else if(/^(row|col|box)-(add|remove)$/.test(v.phase)) {
    const [type,action]=v.phase.split('-'),name={row:'rows',col:'cols',box:'boxes'}[type],i={row:a.r,col:a.c,box:a.b}[type];
    operation=`<span class="s37-op-unit ${type}">${s37UnitIcon(type)}</span><code>${name}[${i}]</code><strong>${action==='add'?'＋':'−'}</strong>${digit}`;
  } else if(v.phase==='resume') operation=`<strong>↩</strong><b class="${v.childResult?'s37-good':'s37-bad'}">${v.childResult?'True ✓':'False ✕'}</b>`;
  else if(['solution','return-true'].includes(v.phase)||v.solved===true) operation=`<strong class="s37-good">${v.phase==='return-true'?'↩ True':'81 / 81 ✓'}</strong>`;
  else if(['return-false','exhausted'].includes(v.phase)||v.solved===false) operation=`<strong class="s37-bad">${v.solved===false?label('Không có nghiệm','No solution'):'1 … 9 ✕ ↩'}</strong>`;
  else if(v.phase==='select') operation=`<code>min(choices)</code><strong>→</strong>${s37Cell(x._)}<code>(${a.r}, ${a.c})</code>`;
  else if(v.phase==='choices'||v.phase==='complete-check') operation=`<span>MRV</span><strong>${x.choices.length?`min = ${Math.min(...x.choices.map(c=>c[0]))}`:'0 ✓'}</strong><code>${label('Ứng viên / ô','Candidates / cell')}</code>`;
  else operation=`<code>${esc({rows:'rows = [set(), …]',cols:'cols = [set(), …]',boxes:'boxes = [set(), …]',empties:'empties = […]',define:'def backtrack():','box-id':`b = ${x.b}`}[v.phase]||'backtrack()')}</code>`;
  const candidateChips=Array.from({length:9},(_,i)=>{const value=String(i+1),allowed=v.candidates?.includes(value);return `<span class="s37-candidate ${v.candidates===null?'pending':allowed?'available':'excluded'} ${d===value?'trial':''}" data-candidate="${value}">${value}${d===value&&v.check?`<small class="${Object.values(v.check).some(Boolean)?'s37-bad':'s37-good'}">${Object.values(v.check).some(Boolean)?'✕':'✓'}</small>`:''}</span>`;}).join('');
  const units=['row','col','box'].map(type=>{
    const key={row:'rows',col:'cols',box:'boxes'}[type],index=a?{row:a.r,col:a.c,box:a.b}[type]:'—';
    return `<div class="s37-unit ${type}"><header>${s37UnitIcon(type)}<code>${key}[${index}]</code><b>${v.check?v.check[type]?'✕':'✓':'?'}</b></header><div>${Array.from({length:9},(_,i)=>{const value=String(i+1),used=v.sets[type]?.includes(value);return `<span class="${used?'used':''}" data-set="${type}" data-set-digit="${value}" data-used="${Boolean(used)}">${used?value:'·'}</span>`;}).join('')}</div></div>`;
  }).join('');
  const frames=v.stack.map((f,i)=>`${i?'<span class="s37-stack-arrow">→</span>':''}<span class="s37-frame ${i===v.stack.length-1?'active':''}" data-frame="${f.id}"><small>#${i}</small><b>${f.r===undefined?'…':`(${f.r},${f.c})`}</b>${f.digit===undefined?'':s37Cell(f.digit)}</span>`).join('');
  const moves=v.moves.map(move=>`<span class="s37-move ${move.type}" data-move="${move.type}"><small>(${move.r},${move.c})</small><b>${move.type==='undo'?'↩':'＋'}</b>${s37Cell(move.digit,move.type==='undo'?'removed':'digit')}</span>`).join('');
  $('treeView').innerHTML=`<div class="s37-viz"><header class="s37-heading"><span>#37 · Sudoku</span><b>L${line} ✓</b><span>${label('Sau dòng','After line')} ${line}</span></header><div class="s37-operation">${operation}</div>
    <div class="s37-workspace"><section class="s37-card s37-board-card"><header><span>board</span><strong>${filled} / 81</strong></header>${s37Board(v,vi)}<div class="s37-legend"><span><i class="given"></i>${label('Cho sẵn','Given')}</span><span><i class="filled"></i>${label('Đã điền','Placed')}</span><span><i class="selected"></i>${label('Đang xét','Current')}</span><span><i class="conflict"></i>${label('Trùng','Conflict')}</span></div></section>
    <div class="s37-side"><section class="s37-card"><header><span>${label('Ứng viên lúc chọn ô','Candidates on selection')}</span><strong>${v.candidates?.length??'—'}</strong></header><div class="s37-candidates">${candidateChips}</div></section><section class="s37-card s37-units">${units}</section></div></div>
    <section class="s37-card"><header><span>Call stack</span><small>${label('Chung một board','One shared board')}</small></header><div class="s37-stack">${frames||'<span class="s37-empty">∅</span>'}</div></section>
    <section class="s37-card"><header><span>${label('Đặt / xoá gần nhất','Recent place / undo')}</span><button type="button" id="s37UndoExample">↩ ${label('Ví dụ quay lui','Undo example')}</button></header><div class="s37-moves">${moves||'<span class="s37-empty">∅</span>'}</div></section></div>`;
  const root=$('treeView'),scroller=root.querySelector?.('.s37-stack');
  if(scroller)scroller.scrollLeft=scroller.scrollWidth;
  root.querySelector?.('#s37UndoExample')?.addEventListener('click',async()=>{
    $('arrInput').value=SUDOKU37_UNDO_EXAMPLE;
    await runViz();
    const firstUndo=steps.findIndex(candidate=>candidate.sudoku37View?.phase==='undo');
    if(firstUndo>=0){stopPlay();stepIndex=firstUndo;renderStep();}
  });
}
