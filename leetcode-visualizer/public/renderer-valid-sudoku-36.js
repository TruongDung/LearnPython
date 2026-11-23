function renderValidSudoku36View(step) {
  const v=step.sudoku36View,host=$('treeView'),vi=lang==='vi',t=(vn,en)=>vi?vn:en;
  const a=v.active,bad=Boolean(v.conflict),done=v.final;
  const same=(cell,r,c)=>cell.r===r&&cell.c===c;
  const duplicates=bad?Object.values(v.conflict.checks).flat():[];
  const checked=new Set(v.checked.map(cell=>`${cell.r}-${cell.c}`));
  const filled=v.board.join('').replaceAll('.','').length;
  const isPeer=(r,c)=>a&&(a.r===r||a.c===c||Math.floor(r/3)===Math.floor(a.r/3)&&Math.floor(c/3)===Math.floor(a.c/3));
  const board=`<table class="cc36-board" aria-label="${t('Sudoku 9×9, chọn ô để xem bước kiểm tra','9×9 Sudoku, select a cell to inspect its validation')}"><thead><tr><th></th>${Array.from({length:9},(_,i)=>`<th scope="col">${i+1}</th>`).join('')}</tr></thead><tbody>${v.board.map((row,r)=>`<tr><th scope="row">${r+1}</th>${[...row].map((digit,c)=>{
    const selected=a&&same(a,r,c),conflicting=duplicates.some(cell=>same(cell,r,c))||bad&&selected;
    return `<td class="${c%3===0?'box-left ':''}${r%3===0?'box-top ':''}${isPeer(r,c)?'peer ':''}${checked.has(`${r}-${c}`)?'seen ':''}${selected?'active ':''}${conflicting?'conflict':''}"><button data-s36-cell="${r}-${c}" aria-label="${t('Hàng','Row')} ${r+1}, ${t('cột','column')} ${c+1}: ${digit==='.'?t('trống','empty'):digit}">${digit==='.'?'·':digit}</button></td>`;
  }).join('')}</tr>`).join('')}</tbody></table>`;
  const unitCells=type=>Array.from({length:9},(_,i)=>type==='row'?{r:a.r,c:i}:type==='col'?{r:i,c:a.c}:{r:Math.floor(a.r/3)*3+Math.floor(i/3),c:Math.floor(a.c/3)*3+i%3});
  const checks=['row','col','box'].map(type=>{
    const count=v.checks?.[type].length??0;
    const label=type==='row'?t('Hàng','Row'):type==='col'?t('Cột','Column'):t('Box 3×3','3×3 box');
    const number=a?(type==='row'?a.r+1:type==='col'?a.c+1:a.box+1):null;
    const status=bad&&count?t(`✕ Trùng số ${a.digit}`,`✕ Duplicate ${a.digit}`):done&&!bad?t('✓ Không trùng','✓ No duplicates'):a?.digit==='.'?t('Bỏ qua ô trống','Ignore blanks'):v.checks?t('✓ Chưa gặp lại','✓ Not seen before'):t('Chờ kiểm tra','Waiting');
    return `<article class="cc36-unit ${type}${bad&&count?' bad':''}"><header><b>${label}${number===null?'':` ${number}`}</b><strong>${status}</strong></header>${a?`<div class="cc36-mini ${type==='box'?'box':'strip'}">${unitCells(type).map(({r,c})=>`<span class="${same(a,r,c)?'active ':''}${bad&&(same(a,r,c)||v.conflict.checks[type].some(cell=>same(cell,r,c)))?'bad':''}">${v.board[r][c]==='.'?'·':v.board[r][c]}</span>`).join('')}</div>`:`<p>${t('Kiểm tra tất cả 9 '+(type==='row'?'hàng':type==='col'?'cột':'box'),'Check all 9 '+(type==='row'?'rows':type==='col'?'columns':'boxes'))}</p>`}</article>`;
  }).join('');
  const message=bad?t(`Số ${a.digit} bị lặp: hai ô đỏ chỉ ra lỗi.`,`Digit ${a.digit} repeats: the red cells show the conflict.`):done?t('Các số đã điền đều không trùng. Các ô trống được giữ nguyên.','All filled digits pass the checks. Blank cells remain unchanged.'):a?t(`Ô (${a.r+1}, ${a.c+1}) ${a.digit==='.'?'trống → bỏ qua':`có số ${a.digit} → kiểm tra 3 nơi`}.`,`Cell (${a.r+1}, ${a.c+1}) ${a.digit==='.'?'is blank → skip':`contains ${a.digit} → check 3 places`}.`):t('Một số phải khác mọi số trong cùng hàng, cột và box.','A digit must differ from every other digit in its row, column and box.');
  host.innerHTML=`<section class="cc-viz cc36-viz" aria-label="36 · Valid Sudoku"><header class="cc-title"><div><small>36 · Sudoku</small><h3>${t('Một ô → kiểm tra 3 nơi','One cell → check 3 places')}</h3></div><b class="cc-result${bad?' bad':done?' good':''}">${bad?'False':done?'True':t('Đang kiểm tra','Checking')}</b></header><div class="cc-buttons"><button data-s36-example="valid">${t('Bảng hợp lệ','Valid board')}</button><button data-s36-example="row">${t('Trùng hàng','Row conflict')}</button><button data-s36-example="col">${t('Trùng cột','Column conflict')}</button><button data-s36-example="box">${t('Trùng box','Box conflict')}</button>${!done?`<button data-s36-next>${t('Ô đã điền tiếp →','Next filled cell →')}</button><button data-s36-result>${t('Xem kết quả','See result')}</button>`:''}</div><div class="cc-action${bad?' bad':''}"><strong>${escapeHtml(message)}</strong></div><div class="cc36-layout"><div>${board}<p class="cc36-board-note">${t('Chọn ô để xem kiểm tra · ô đỏ = trùng số','Select a cell to inspect · red cells = duplicates')}</p></div><div class="cc36-checks">${a?`<div class="cc36-current"><b>${a.digit==='.'?'·':a.digit}</b><span>${t('Ô đang xét','Current cell')}<strong>(${a.r+1}, ${a.c+1})</strong></span></div>`:''}${checks}</div></div><div class="cc36-footer"><b>${v.checked.length} / ${filled}</b><span>${t('ô đã điền đã ghi nhận; ô trống không tham gia kiểm tra','filled cells recorded; empty cells are ignored')}</span></div><p class="cc-note">${t('True chỉ có nghĩa là chưa vi phạm quy tắc, không khẳng định bảng có lời giải.','True means the current constraints hold; it does not guarantee a solution exists.')}</p></section>`;
  const blank=()=>Array.from({length:9},()=>Array(9).fill('.'));
  const valid='53..7....;6..195...;.98....6.;8...6...3;4..8.3..1;7...2...6;.6....28.;...419..5;....8..79';
  host.querySelectorAll?.('[data-s36-example]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.s36Example;
    if(key==='valid')$('arrInput').value=valid;
    else {const b=blank();b[0][0]='5';const [r,c]=key==='row'?[0,4]:key==='col'?[4,0]:[1,1];b[r][c]='5';$('arrInput').value=b.map(row=>row.join('')).join(';');}
    $('runBtn').click();
  }));
  const jump=index=>{if(index>=0){stopPlay();stepIndex=index;renderStep();}};
  host.querySelectorAll?.('[data-s36-cell]').forEach(button=>button.addEventListener('click',()=>{
    const [r,c]=button.dataset.s36Cell.split('-').map(Number);
    jump(steps.findIndex(s=>s.sudoku36View?.active?.r===r&&s.sudoku36View.active.c===c&&['check','conflict','empty'].includes(s.sudoku36View.event)));
  }));
  host.querySelector?.('[data-s36-next]')?.addEventListener('click',()=>jump(steps.findIndex((s,i)=>i>stepIndex&&(['check','conflict'].includes(s.sudoku36View?.event)||s.final))));
  host.querySelector?.('[data-s36-result]')?.addEventListener('click',()=>$('lastBtn').click());
}
