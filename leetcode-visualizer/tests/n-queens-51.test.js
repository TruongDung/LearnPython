"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[51];
const build=n=>p.builder([n]);
const cases=[1,2,3,4,5,6,7,8];
const key=boards=>boards.map(rows=>rows.join('/')).sort();
function oracle(n){const a=Array.from({length:n},(_,i)=>i),out=[];function permute(k){if(k===n){if(a.every((c,r)=>a.every((d,s)=>r===s||Math.abs(c-d)!==Math.abs(r-s))))out.push(a.map(c=>'.'.repeat(c)+'Q'+'.'.repeat(n-c-1)));return;}for(let j=k;j<n;j++){[a[k],a[j]]=[a[j],a[k]];permute(k+1);[a[k],a[j]]=[a[j],a[k]];}}permute(0);return out;}
function queens(rows){return rows?rows.flatMap((row,r)=>[...row].flatMap((c,col)=>c==='Q'?[[r,col]]:[])):[];}

test('51 returns all valid boards for n=1…8, including both four-queen boards and all 92 eight-queen solutions',()=>{
  const counts=[0,1,0,0,2,10,4,40,92];
  for(const n of cases){const run=build(n);assert.equal(run.answer.length,counts[n]);assert.deepEqual(key(run.answer),key(oracle(n)));assert.equal(new Set(key(run.answer)).size,run.answer.length);assert.equal(run.steps.filter(s=>s.final).length,1);assert.deepEqual(run.steps.at(-1).nQueens51View.results,run.answer);}
  assert.deepEqual(build(4).answer,[['.Q..','...Q','Q...','..Q.'],['..Q.','Q...','...Q','.Q..']]);
});

test('51 matches every completed CPython statement, actual local, board, set and recursive frame across the full eight-queen trace',()=>{
  const python=`import sys,json,copy
payload=json.load(sys.stdin);scope={};filename='<nq51>';exec(compile(payload['source'],filename,'exec'),scope);runs=[]
for n in payload['cases']:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('solveNQueens','backtrack'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;board=[''.join(row) for row in x['board']] if 'board' in x else None
    count=sum(row.count('Q') for row in board) if board else 0
    frames=[];cursor=frame
    while cursor:
     if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='backtrack':frames.append({'row':cursor.f_locals['row'],**({'col':cursor.f_locals['col']} if 'col' in cursor.f_locals else {}),'queenCount':count})
     cursor=cursor.f_back
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':{k:x[k] for k in ('n','row','col') if k in x},'board':board,'sets':{k:sorted(x[k]) if k in x else None for k in ('cols','diag_down','diag_up')},'count':len(x['result']),'tail':copy.deepcopy(x['result'][-3:]),'stack':list(reversed(frames))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().solveNQueens(n);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const proc=spawnSync('python3',['-c',python],{input:JSON.stringify({source:p.code.join('\n'),cases}),encoding:'utf8',maxBuffer:128*1024*1024});assert.equal(proc.status,0,proc.stderr);
  JSON.parse(proc.stdout).forEach((reference,c)=>{const n=cases[c],run=build(n);assert.deepEqual(run.answer,reference.answer);assert.equal(run.steps.length,reference.events.length,`n=${n}`);
    run.steps.forEach((step,i)=>{const v=step.nQueens51View,e=reference.events[i],x=e.locals;
      assert.deepEqual(step.codeLines,[e.line],`n=${n}, event=${i}`);assert.equal(v.scope,e.scope);assert.deepEqual(v.locals,x);assert.deepEqual(v.board,e.board);assert.deepEqual(v.sets,e.sets);assert.deepEqual(v.stack.map(({id,...frame})=>frame),e.stack);
      assert.deepEqual(v.queens,queens(e.board));assert.equal(v.resultCount,e.count);assert.deepEqual(v.results,step.final?reference.answer:e.tail);
      assert.deepEqual(step.vars.map(w=>w.value),[x.row??'—',x.col??'—',e.sets.cols??'—',e.sets.diag_down??'—',e.sets.diag_up??'—',e.count]);
      assert.equal(v.activeRow,x.row!==undefined&&x.row<n?x.row:null);assert.equal(v.source.line,e.line);assert.equal(v.source.text,p.code[e.line-1]);assert.equal(v.source.timing,'after');
    });
  });
});

test('51 records short-circuited guards and individual set changes without hiding transient board/set differences',()=>{
  const run=build(4),original=JSON.stringify(run);let previous;
  for(const step of run.steps){const v=step.nQueens51View,x=v.locals,a=v.active;
    if(v.check){const column=!v.sets.cols.includes(a.col),down=column?!v.sets.diag_down.includes(a.row-a.col):null,up=column&&down?!v.sets.diag_up.includes(a.row+a.col):null;assert.deepEqual(v.check,{column,down,up,allowed:Boolean(column&&down&&up)});}else assert.notEqual(step.codeLines[0],13);
    if(v.phase==='blocked'){assert.ok(v.attacks.length);assert.equal(v.board[a.row][a.col],'.');}
    if(v.phase==='place'){assert.equal(v.board[a.row][a.col],'Q');assert.equal(previous.board[a.row][a.col],'.');assert.deepEqual(v.sets,previous.sets);}
    if(v.phase==='remove'){assert.equal(v.board[a.row][a.col],'.');assert.equal(previous.board[a.row][a.col],'Q');assert.deepEqual(v.sets,previous.sets);}
    if(['up-add','up-remove','allow','blocked','root-return','done'].includes(v.phase)){assert.deepEqual(v.sets.cols,v.queens.map(q=>q[1]).sort((a,b)=>a-b));assert.deepEqual(v.sets.diag_down,v.queens.map(([r,c])=>r-c).sort((a,b)=>a-b));assert.deepEqual(v.sets.diag_up,v.queens.map(([r,c])=>r+c).sort((a,b)=>a-b));}
    if(v.phase==='save'){assert.equal(x.row,v.n);assert.equal(v.activeRow,null);assert.equal(v.active,null);assert.deepEqual(v.results.at(-1),v.board);}
    if(a)assert.deepEqual(v.attacks,v.queens.filter(([r,c])=>r!==a.row||c!==a.col).filter(([r,c])=>c===a.col||r-c===a.row-a.col||r+c===a.row+a.col));
    previous=v;
  }
  assert.equal(JSON.stringify(run),original);assert.deepEqual(run.steps.find(s=>s.nQueens51View.phase==='save').nQueens51View.results,[run.answer[0]]);
  for(const n of [2,3]){const run=build(n),v=run.steps.at(-1).nQueens51View;assert.deepEqual(run.answer,[]);assert.ok(v.board.every(row=>row==='.'.repeat(n)));assert.deepEqual(v.sets,{cols:[],diag_down:[],diag_up:[]});assert.deepEqual(v.stack,[]);}
});

test('51 supports the complete bounded input range, typed live arguments and no truncated traces',()=>{
  assert.deepEqual(p.liveArgs([4]),[4]);assert.deepEqual(p.liveArgs(4),[4]);assert.equal(p.maxInput,8);
  for(const input of [0,9,-1,1.5,NaN,Infinity,null,undefined,'4',{},[],[4,5],[true]]){assert.throws(()=>p.builder(input),/51/);assert.throws(()=>p.liveArgs(input),/51/);}
  const run=build(8);assert.ok(run.steps.length>54000);assert.equal(run.steps.at(-1).nQueens51View.results.length,92);assert.equal(run.steps.at(-1).codeLines[0],24);
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,escapeHtml:x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-n-queens-51.js'),'utf8'),context);return {context,render:step=>{context.renderNQueens51Pictures(step);return host.innerHTML;}};}

test('51 renders every actual square, trial queen, attacker, occupied set, saved board and recursive frame in both themes/languages',()=>{
  for(const lang of ['vi','en']){const {render}=renderer(lang);
    for(const n of [1,2,3,4]){const run=build(n),before=JSON.stringify(run);
      for(const step of run.steps){const v=step.nQueens51View,html=render(step);assert.match(html,/nq51-viz/);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        assert.deepEqual([...html.matchAll(/data-solution="([.Q/]+)"/g)].map(m=>m[1]),v.results.map(rows=>rows.join('/')));
        assert.deepEqual([...html.matchAll(/data-frame="(\d+)"/g)].map(m=>Number(m[1])),v.stack.map(f=>f.id));
        const cells=[...html.matchAll(/data-cell="(\d+)-(\d+)" data-value="([.Q])" data-preview="(true|false)" data-attacker="(true|false)"/g)];
        if(!step.final&&v.board){assert.equal(cells.length,n*n);assert.equal(cells.map(m=>m[3]).join(''),v.board.join(''));
          assert.deepEqual(cells.filter(m=>m[5]==='true').map(m=>[Number(m[1]),Number(m[2])]),v.phase==='blocked'?v.attacks:[]);
          assert.deepEqual(cells.filter(m=>m[4]==='true').map(m=>[Number(m[1]),Number(m[2])]),v.active&&['choose','allow','blocked'].includes(v.phase)?[[v.active.row,v.active.col]]:[]);
        }else assert.equal(cells.length,0);
      }
      const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),before);
    }
    const big=build(8);for(const step of [big.steps.find(s=>s.nQueens51View.phase==='save'),big.steps.at(-1)]){const html=render(step);assert.doesNotMatch(html,/undefined|NaN|Infinity/);assert.equal((html.match(/data-solution=/g)||[]).length,step.nQueens51View.results.length);}assert.equal(big.steps.at(-1).nQueens51View.results.length,92);
  }
});

test('51 next-solution control only navigates to actual saved states and reaches the final empty result when no solution exists',()=>{
  let handler,rendered=0,stopped=0;const button={addEventListener:(type,fn)=>{handler=fn;}},host={innerHTML:'',querySelector:s=>s==='#nq51NextSolution'?button:null},run=build(4);
  const {context,render}=renderer('vi',{$:()=>host,steps:run.steps,stepIndex:0,stopPlay:()=>{stopped++;},renderStep:()=>{rendered++;}});
  render(run.steps[0]);handler();assert.equal(context.steps[context.stepIndex].nQueens51View.phase,'save');assert.equal(context.steps[context.stepIndex].nQueens51View.resultCount,1);handler();assert.equal(context.steps[context.stepIndex].nQueens51View.resultCount,2);handler();assert.equal(context.stepIndex,run.steps.length-1);assert.equal(stopped,3);assert.equal(rendered,3);
  context.steps=build(2).steps;context.stepIndex=0;render(context.steps[0]);handler();assert.equal(context.stepIndex,context.steps.length-1);assert.equal(context.steps[context.stepIndex].nQueens51View.resultCount,0);
});

test('51 loads scoped SVG pictures lazily with day/night, sticky variables and horizontal source scrolling',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/n-queens-51.css'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  assert.equal(p.debugMode,'line-by-line');assert.match(html,/n-queens-51\.css[^\n]*data-problem-ids="51(?: 52)?"/);assert.match(html,/renderer-n-queens-51\.js[^\n]*data-problem-ids="51(?: 52)?"/);assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/(?:renderer-)?n-queens-51\.(?:css|js)/);
  assert.match(script,/Boolean\(step.nQueens51View\)[^\n]*renderNQueens51Pictures\(step\)/);assert.match(css,/\[data-theme="light"\] \.nq51-viz/);assert.match(css,/#varsPanel[^}]*position:sticky/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/\.code-line\s*\{[^}]*white-space:pre/);
});
