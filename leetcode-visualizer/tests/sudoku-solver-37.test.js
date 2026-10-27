"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[37];
const solved=['534678912','672195348','198342567','859761423','426853791','713924856','961537284','287419635','345286179'];
const undo='53.67...2;6.....34.;.9...2...;.59.6..23;..6.5..9.;..3..4..6;.6....2..;287.1.6.5;.4..86.7.';
const impossible=problem.defaultInput.replace('53..7....','531.7....');
const one=solved.map((row,i)=>i===4?row.slice(0,4)+'.'+row.slice(5):row).join(';');
const cases=[problem.defaultInput,undo,solved.join(';'),one,impossible];
function validAnswer(answer,givens){
  const expected='123456789',flat=answer.map(row=>row.join(''));
  for(let r=0;r<9;r++) {
    assert.equal([...flat[r]].sort().join(''),expected);
    assert.equal(answer.map(row=>row[r]).sort().join(''),expected);
    for(let c=0;c<9;c++)if(givens[r][c]!=='.')assert.equal(answer[r][c],givens[r][c]);
  }
  for(let r=0;r<9;r+=3)for(let c=0;c<9;c+=3)assert.equal(answer.slice(r,r+3).flatMap(row=>row.slice(c,c+3)).sort().join(''),expected);
}

test('37 solves the official example, completed boards, blank boards and randomized missing cells without altering givens',()=>{
  let seed=37;const rand=n=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)%n;
  const samples=[...cases.filter(s=>s!==impossible),Array(9).fill('.........').join(';')];
  for(let j=0;j<12;j++)samples.push(solved.map(row=>[...row].map(d=>rand(3)===0?'.':d).join('')).join(';'));
  for(const input of samples){const run=problem.builder(input);validAnswer(run.answer,run.original);assert.equal(run.steps.at(-1).sudoku37View.solved,true);assert.equal(run.steps.filter(s=>s.final).length,1);}
  assert.deepEqual(problem.builder(problem.defaultInput).answer.map(r=>r.join('')),solved);
});

test('37 matches every executed CPython statement, frame local, board mutation and live row/column/box set',()=>{
  const boards=cases.map(input=>problem.liveArgs(input)[0]);
  const python=`import sys,json,copy
payload=json.load(sys.stdin);scope={};filename='<sudoku37>';exec(compile(payload['source'],filename,'exec'),scope)
runs=[]
for board in payload['boards']:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('solveSudoku','backtrack'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;callers=[];cursor=frame
    while cursor:
     if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='backtrack':callers.append({k:cursor.f_locals[k] for k in ('r','c','b','digit') if k in cursor.f_locals})
     cursor=cursor.f_back
    active='r' in x and frame.f_code.co_name=='backtrack'
    sets={'row':sorted(x['rows'][x['r']]),'col':sorted(x['cols'][x['c']]),'box':sorted(x['boxes'][(x['r']//3)*3+x['c']//3])} if active else {'row':None,'col':None,'box':None}
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in ('choices','_','r','c','b','digit','solved') if k in x}),'board':[''.join(row) for row in x['board']],'sets':sets,'stack':list(reversed(callers)),'ready':{key:key in x for key in ('rows','cols','boxes','empties')}})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);returned=scope['Solution']().solveSudoku(board);sys.settrace(None)
 runs.append({'answer':board,'events':events,'returned':returned})
print(json.dumps(runs))`;
  const proc=spawnSync('python3',['-c',python],{input:JSON.stringify({source:problem.code.join('\n'),boards}),encoding:'utf8',maxBuffer:48*1024*1024});
  assert.equal(proc.status,0,proc.stderr);
  JSON.parse(proc.stdout).forEach((reference,c)=>{
    const run=problem.builder(cases[c]);assert.equal(reference.returned,null);assert.deepEqual(run.answer,reference.answer);assert.equal(run.steps.length,reference.events.length,`case ${c}`);
    run.steps.forEach((step,i)=>{const v=step.sudoku37View,e=reference.events[i];
      assert.deepEqual(step.codeLines,[e.line],`case ${c} event ${i}`);assert.equal(v.scope,e.scope);assert.deepEqual(v.locals,e.locals);
      assert.deepEqual(v.board,e.board);assert.deepEqual(v.sets,e.sets);assert.deepEqual(v.ready,e.ready);
      assert.deepEqual(v.stack.map(({id,...f})=>f),e.stack);
      const f=e.stack.at(-1);assert.deepEqual(step.vars.map(w=>w.value),[f?.r??'—',f?.c??'—',f?.b??'—',f?.digit??'—',f?e.stack.length-1:'—',e.locals.solved??'—']);
      assert.equal(v.source.line,e.line);assert.equal(v.source.timing,'after');
    });
  });
});

test('37 exposes real rejection, recursive failure, undo and individual set updates, preserving prior snapshots',()=>{
  const run=problem.builder(undo),before=JSON.stringify(run);
  assert.equal(run.steps.filter(s=>s.sudoku37View.phase==='undo').length,5);
  let previous;
  for(const step of run.steps){const v=step.sudoku37View,a=v.active,d=v.locals.digit;
    if(v.phase==='try')assert.equal(v.board[a.r][a.c],'.');
    if(v.phase==='blocked')assert.ok(Object.values(v.check).some(Boolean));
    if(v.phase==='allowed')assert.ok(Object.values(v.check).every(x=>!x));
    if(v.phase==='place'){
      assert.equal(v.board[a.r][a.c],d);assert.equal(previous.board[a.r][a.c],'.');
      assert.ok(!v.sets.row.includes(d)&&!v.sets.col.includes(d)&&!v.sets.box.includes(d));
    }
    if(v.phase==='row-add')assert.ok(v.sets.row.includes(d)&&!v.sets.col.includes(d)&&!v.sets.box.includes(d));
    if(v.phase==='col-add')assert.ok(v.sets.row.includes(d)&&v.sets.col.includes(d)&&!v.sets.box.includes(d));
    if(v.phase==='undo'){
      assert.equal(previous.phase,'resume');assert.equal(previous.childResult,false);
      assert.equal(v.board[a.r][a.c],'.');assert.equal(previous.board[a.r][a.c],d);
      assert.ok(v.sets.row.includes(d)&&v.sets.col.includes(d)&&v.sets.box.includes(d));
    }
    previous=v;
  }
  assert.equal(JSON.stringify(run),before);
  const failed=problem.builder(impossible);assert.equal(failed.steps.at(-1).sudoku37View.solved,false);assert.deepEqual(failed.answer,failed.original);
});

test('37 retains long complete traces and rejects oversized traces instead of silently jumping to a solution',()=>{
  const hard='1....7.9.;.3..2...8;..96..5..;..53..9..;.1..8...2;6....4...;3......1.;.4......7;..7...3..';
  const run=problem.builder(hard);assert.ok(run.steps.length>6000);assert.equal(run.steps.at(-1).sudoku37View.solved,true);validAnswer(run.answer,run.original);
  assert.throws(()=>problem.builder('.......1.;4........;.2.......;....5.4.7;..8...3..;..1.9....;3..4..2..;.5.1.....;...8.6...'),/trace too long/);
});

test('37 validates shape, digits and duplicate givens consistently for visualization and Python live arguments',()=>{
  for(const input of [null,undefined,[],{},'', '123','.........;'.repeat(9),problem.defaultInput.replace('53..7....','55..7....'),problem.defaultInput.replace('53..7....','63..7....'),problem.defaultInput.replace('53..7....','56..7....'),problem.defaultInput.replace('53..7....','53A.7....')]){
    assert.throws(()=>problem.builder(input),/37/);assert.throws(()=>problem.liveArgs(input),/37/);
  }
  const zeros=problem.defaultInput.replaceAll('.','0');assert.deepEqual(problem.liveArgs(zeros),problem.liveArgs(problem.defaultInput));
  const commas=problem.defaultInput.split(';').map(row=>[...row].join(',')).join('|');assert.deepEqual(problem.liveArgs(commas),problem.liveArgs(problem.defaultInput));
});

function renderer(lang,extra={}){
  const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,escapeHtml:x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),...extra};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-sudoku-37.js'),'utf8'),context);
  return {context,render:step=>{context.renderSudoku37Pictures(step);return host.innerHTML;}};
}

test('37 pictures show all 81 actual cells, entry candidates, tested conflicts, sets and shared recursion frames without changing a snapshot',()=>{
  for(const lang of ['vi','en']){
    const {render}=renderer(lang);
    for(const input of [problem.defaultInput,undo,impossible]){
      const run=problem.builder(input),original=JSON.stringify(run);
      for(const step of run.steps){const html=render(step),v=step.sudoku37View;
        assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        assert.deepEqual([...html.matchAll(/data-cell="(\d)-(\d)" data-value="([.1-9])"/g)].map(m=>m[3]).join(''),v.board.join(''));
        assert.equal((html.match(/data-candidate=/g)||[]).length,9);
        for(const type of ['row','col','box'])assert.deepEqual([...html.matchAll(new RegExp(`data-set="${type}" data-set-digit="([1-9])" data-used="true"`,'g'))].map(m=>m[1]),v.sets[type]||[]);
        assert.deepEqual([...html.matchAll(/data-frame="(\d+)"/g)].map(m=>Number(m[1])),v.stack.map(f=>f.id));
        if(v.phase==='blocked')assert.match(html,/data-conflict=/);
        if(v.phase==='try')assert.doesNotMatch(html,/data-conflict=/);
      }
      const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),original);
    }
  }
});

test('37 undo example navigates to an actual recorded removal and updates the visible board input',async()=>{
  let handler,played=false,rendered=false;const input={value:''},button={addEventListener:(type,fn)=>{handler=fn;}},host={innerHTML:'',querySelector:selector=>selector==='#s37UndoExample'?button:null};
  const extra={$:id=>id==='treeView'?host:input,steps:[],stepIndex:0,stopPlay:()=>{played=true;},renderStep:()=>{rendered=true;}};
  const {context,render}=renderer('vi',extra);
  context.runViz=async()=>{context.steps=problem.builder(input.value).steps;};
  render(problem.builder(problem.defaultInput).steps[0]);await handler();
  assert.equal(input.value,undo);assert.ok(played&&rendered);assert.equal(context.steps[context.stepIndex].sudoku37View.phase,'undo');
});

test('37 lazily loads scoped light/dark styles, fixed watches and horizontally scrolling source',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/sudoku-37.css'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  assert.equal(problem.debugMode,'line-by-line');
  assert.match(html,/sudoku-37\.css[^\n]*data-problem-ids="37"/);assert.match(html,/renderer-sudoku-37\.js[^\n]*data-problem-ids="37"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/(?:renderer-)?sudoku-37\.(?:css|js)/);
  assert.match(script,/Boolean\(step.sudoku37View\)[^\n]*renderSudoku37Pictures\(step\)/);
  assert.match(css,/\[data-theme="light"\] \.s37-viz/);assert.match(css,/#varsPanel[^}]*position:sticky/);
  assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/\.code-line\s*\{[^}]*white-space:pre/);
});
