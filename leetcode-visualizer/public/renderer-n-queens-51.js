"use strict";
function nq51Escape(value){return escapeHtml(String(value??""));}
function nq51Queen(extra=""){return `<svg class="nq51-qicon ${extra}" viewBox="0 0 40 40" aria-hidden="true"><use href="#nq51Queen"/></svg>`;}
function nq51Unit(type){return `<svg class="nq51-unit-icon ${type}" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="${type==='column'?'M12 3V21':type==='down'?'M4 4L20 20':'M20 4L4 20'}"/></svg>`;}
function nq51Defs(){return '<svg class="nq51-defs" aria-hidden="true"><defs><symbol id="nq51Queen" viewBox="0 0 40 40" fill="currentColor"><circle cx="6" cy="10" r="3"/><circle cx="20" cy="6" r="3"/><circle cx="34" cy="10" r="3"/><path d="M7 15L12 29H28L33 15L25 22L20 11L15 22Z M11 32H29V36H11Z"/></symbol></defs></svg>';}
function nq51Board(v,rows,mini=false,options={}){
  const n=v.n,cell=38,pad=22,w=n*cell+pad*2,a=mini?null:v.active,checked=!mini&&v.check!==null;
  const center=(r,c)=>[pad+(c+.5)*cell,pad+(r+.5)*cell];
  const queens=rows.flatMap((row,r)=>[...row].flatMap((value,c)=>value==='Q'?[[r,c]]:[]));
  const solved=mini||options.solved||['save','return-solution'].includes(v.phase);
  let rays='';
  if(a){
    const k=Math.min(a.row,a.col),j=Math.min(n-1-a.row,n-1-a.col),k2=Math.min(a.row,n-1-a.col),j2=Math.min(n-1-a.row,a.col);
    const lines=[['column',[0,a.col],[n-1,a.col]],['down',[a.row-k,a.col-k],[a.row+j,a.col+j]],['up',[a.row-k2,a.col+k2],[a.row+j2,a.col-j2]]];
    rays=lines.map(([type,start,end])=>{const x=center(...start),y=center(...end);const conflict=checked&&!v.check.allowed&&v.attacks.some(([r,c])=>type==='column'?c===a.col:type==='down'?r-c===a.row-a.col:r+c===a.row+a.col);return `<path class="nq51-ray ${type} ${conflict?'danger':''}" d="M${x[0]},${x[1]} L${y[0]},${y[1]}"/>`;}).join('');
  }
  const cells=rows.map((row,r)=>[...row].map((value,c)=>{
    const selected=a?.row===r&&a?.col===c,attacker=checked&&!v.check.allowed&&v.attacks.some(([qr,qc])=>qr===r&&qc===c);
    const preview=selected&&value==='.'&&['choose','allow','blocked'].includes(v.phase),cx=pad+c*cell,cy=pad+r*cell;
    const threatened=!mini&&value==='.'&&queens.some(([qr,qc])=>qr!==r&&(qc===c||qr-qc===r-c||qr+qc===r+c));
    const heat=!mini&&r===v.activeRow&&value==='.'&&['choose','allow','blocked'].includes(v.phase)&&!selected;
    return `<g class="nq51-cell ${(r+c)%2?'dark':'light'} ${selected?'selected':''} ${selected&&v.phase==='blocked'?'blocked':''} ${attacker?'attacker':''}" ${mini?'':`data-cell="${r}-${c}" data-value="${value}" data-preview="${preview}" data-attacker="${attacker}"`}><rect x="${cx}" y="${cy}" width="${cell}" height="${cell}"/>${!mini?`<title>(${r}, ${c}) ${value==='Q'?'♛':'·'}</title>`:''}${heat?`<circle class="nq51-heat ${threatened?'unsafe':'safe'}" cx="${cx+19}" cy="${cy+19}" r="3"/>`:''}${value==='Q'||preview?`<use class="nq51-queen ${preview?'preview':''} ${attacker?'danger':''} ${selected?'focus':''}" href="#nq51Queen" x="${cx+5}" y="${cy+5}" width="28" height="28"/>`:''}${selected&&v.phase==='blocked'?`<path class="nq51-cross" d="M${cx+27},${cy+5} l6,6 m0,-6 l-6,6"/>`:''}</g>`;
  }).join('')).join('');
  const indices=mini?'':Array.from({length:n},(_,i)=>`<text class="nq51-index" x="${pad+(i+.5)*cell}" y="14">${i}</text><text class="nq51-index" x="10" y="${pad+(i+.5)*cell+4}">${i}</text>`).join('');
  return `<svg class="nq51-board ${solved?'solved':''} ${mini?'mini':''}" viewBox="0 0 ${w} ${w}" role="img" aria-label="${nq51Escape(mini?rows.join(' / '):`n=${n}; ${v.queens.length} queens${a?`; (${a.row}, ${a.col})`:''}`)}">${cells}${!mini&&v.activeRow!==null?`<rect class="nq51-row-band" x="${pad}" y="${pad+v.activeRow*cell}" width="${n*cell}" height="${cell}"/>`:''}${rays}<rect class="nq51-border" x="${pad}" y="${pad}" width="${n*cell}" height="${n*cell}"/>${indices}</svg>`;
}
function renderNQueens51Pictures(step){
  const v=step.nQueens51View,vi=lang==='vi',a=v.active,x=v.locals,label=(vn,en)=>vi?vn:en,esc=nq51Escape;
  const entries=[{name:'cols',type:'column',expression:'col',key:a?.col,verdict:v.check?.column},{name:'diag_down',type:'down',expression:'row − col',key:a?a.row-a.col:undefined,verdict:v.check?.down},{name:'diag_up',type:'up',expression:'row + col',key:a?a.row+a.col:undefined,verdict:v.check?.up}];
  const units=entries.map(item=>`<section class="nq51-card nq51-unit ${item.type}"><header><span>${nq51Unit(item.type)}<code>${item.name}</code></span>${item.verdict===true?'<b class="nq51-good">✓</b>':item.verdict===false?'<b class="nq51-bad">✕</b>':''}</header><div class="nq51-equation"><code>${item.expression}</code><b>= ${item.key??'—'}</b></div><div class="nq51-set" data-set="${item.name}">${v.sets[item.name]===null?'<span class="nq51-empty">—</span>':v.sets[item.name].map(value=>`<b class="${value===item.key?'key':''}" data-set-value="${value}">${value}</b>`).join('')||'<span class="nq51-empty">∅</span>'}</div></section>`).join('');
  let operation;
  if(v.phase==='choose')operation=`${nq51Queen('preview')}<strong>?</strong><code>(${a.row}, ${a.col})</code>`;
  else if(v.phase==='allow'||v.phase==='blocked')operation=`${nq51Queen()}${entries.map(item=>`<span class="nq51-verdict ${item.type} ${item.verdict===false?'bad':''}">${nq51Unit(item.type)}<b>${item.verdict===null?'—':item.verdict?'✓':'✕'}</b></span>`).join('')}<strong class="${v.check.allowed?'nq51-good':'nq51-bad'}">${v.check.allowed?'✓':'✕'}</strong>`;
  else if(v.phase==='place')operation=`${nq51Queen()}<strong>↓</strong><code>board[${a.row}][${a.col}] = 'Q'</code>`;
  else if(v.phase==='remove')operation=`${nq51Queen('removed')}<strong>↩</strong><code>board[${a.row}][${a.col}] = '.'</code>`;
  else if(/^(cols|down|up)-(add|remove)$/.test(v.phase)){const [kind,action]=v.phase.split('-'),item=entries.find(item=>item.name==={cols:'cols',down:'diag_down',up:'diag_up'}[kind]);operation=`${nq51Unit(item.type)}<code>${item.name}</code><strong>${action==='add'?'＋':'−'}</strong><b class="nq51-key">${item.key}</b>`;}
  else if(v.phase==='save')operation=`${nq51Queen('good')}<strong>→</strong><b class="nq51-good">result[${v.resultCount-1}] ✓</b>`;
  else if(v.phase==='complete-check')operation=`<code>row == n</code><b>${x.row} = ${v.n}</b><strong class="${x.row===v.n?'nq51-good':''}">${x.row===v.n?'✓':'…'}</strong>`;
  else if(v.phase==='done')operation=`<strong class="${v.resultCount?'nq51-good':''}">${v.resultCount} ${v.resultCount?'✓':'∅'}</strong><code>${label('bàn cờ hợp lệ','valid boards')}</code>`;
  else if(['resume','return-solution','root-return','exhausted'].includes(v.phase))operation=`<strong>↩</strong><code>backtrack(${x.row??0})</code>`;
  else operation=`<code>${{'result-init':'result = []','board-init':'board = […]','cols-init':'cols = set()','down-init':'diag_down = set()','up-init':'diag_up = set()',define:'def backtrack(row)'}[v.phase]}</code>`;
  const output=`<section class="nq51-card nq51-results-card"><header><span>result · ${v.resultCount}</span><button type="button" id="nq51NextSolution" title="${label('Đến lời giải kế tiếp','Jump to next solution')}" ${step.final?'disabled':''}>→ ♛</button></header><div class="nq51-results">${v.results.map((rows,i)=>`<figure data-solution="${rows.join('/')}"><figcaption>#${v.shownFrom+i+1}</figcaption>${nq51Board(v,rows,true)}</figure>`).join('')||'<span class="nq51-empty">∅</span>'}</div>${v.shownFrom?`<small>+${v.shownFrom} ${label('bàn cờ trước','earlier boards')}</small>`:''}</section>`;
  const frames=v.stack.map((frame,i)=>`${i?'<span class="nq51-stack-arrow">→</span>':''}<span class="nq51-frame ${i===v.stack.length-1?'active':''}" data-frame="${frame.id}"><b>r ${frame.row}</b><small>c ${frame.col??'—'}</small></span>`).join('')||'<span class="nq51-empty">∅</span>';
  const moves=v.moves.map(move=>`<span class="nq51-move ${move.type}" data-move="${move.type}"><small>(${move.row},${move.col})</small><b>${move.type==='undo'?'↩':'＋'}</b>${nq51Queen(move.type==='undo'?'removed':'')}</span>`).join('')||'<span class="nq51-empty">∅</span>';
  const defs=nq51Defs();
  $('treeView').innerHTML=`<div class="nq51-viz">${defs}<header class="nq51-heading"><span>#51 · N-Queens</span><b>L${v.source.line} ✓</b><span>${label('Sau dòng','After line')} ${v.source.line}</span></header><div class="nq51-operation">${operation}</div>${step.final?output:`<div class="nq51-workspace"><section class="nq51-card"><header><span>board</span><strong>${v.board?v.queens.length:'—'} / ${v.n} ♛</strong></header>${v.board?nq51Board(v,v.board):'<div class="nq51-uninitialized">board = —</div>'}<footer class="nq51-legend"><span class="column">│ col</span><span class="down">╲ r−c</span><span class="up">╱ r+c</span><span>${label('⋯ ô thử','⋯ trial')}</span></footer></section><div class="nq51-units">${units}</div></div>${output}`}<section class="nq51-card"><header><span>Call stack · row</span><small>${label('Chung một board','One shared board')}</small></header><div class="nq51-stack">${frames}</div></section><section class="nq51-card"><header><span>${label('Đặt / bỏ gần nhất','Recent place / undo')}</span></header><div class="nq51-moves">${moves}</div></section></div>`;
  const root=$('treeView'),stack=root.querySelector?.('.nq51-stack');if(stack)stack.scrollLeft=stack.scrollWidth;
  root.querySelector?.('#nq51NextSolution')?.addEventListener('click',()=>{stopPlay();const next=steps.findIndex((candidate,index)=>index>stepIndex&&candidate.nQueens51View?.phase==='save');stepIndex=next>=0?next:steps.length-1;renderStep();});
}
