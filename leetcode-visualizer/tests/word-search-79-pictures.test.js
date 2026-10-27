const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[79];
const examples=[
 [problem.defaultInput,'ABCCED'],[problem.defaultInput,'SEE'],[problem.defaultInput,'ABCB'],
 ['A','A'],['A','B'],['A,B;B,A','ABBA'],['AA;AA','AAAA'],['ab;cd','abd'],
];

test('79 each source line and bound local matches recursive CPython after execution',()=>{
 const python=`import sys,json
data=json.load(sys.stdin)
ns={}
exec(data['code'],ns)
names={'board','word','rows','cols','available','needed','r','c','i','saved','dr','dc','found'}
def clean(value):
    if isinstance(value,list): return [clean(v) for v in value]
    if isinstance(value,dict): return {str(k):clean(v) for k,v in value.items()}
    return value
results=[]
for board,word in data['inputs']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name not in ('exist','dfs'): return None
        def snapshot(line):
            rows.append({'line':line,'scope':frame.f_code.co_name,'locals':{k:clean(v) for k,v in frame.f_locals.items() if k in names}})
        if event=='line':
            if frame in pending: snapshot(pending[frame])
            pending[frame]=frame.f_lineno
        elif event=='return':
            snapshot(pending.pop(frame))
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().exist(board,word)
    sys.settrace(None)
    results.append({'answer':answer,'rows':rows})
print(json.dumps(results))`;
 const inputs=examples.map(([input,word])=>problem.liveArgs(input,{word}));
 const output=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),inputs}),encoding:'utf8',maxBuffer:32*1024*1024});
 assert.equal(output.status,0,output.stderr);
 const expected=JSON.parse(output.stdout);
 examples.forEach(([input,word],index)=>{
  const run=problem.builder(input,{word}),reference=expected[index];
  assert.equal(run.answer,reference.answer);
  assert.equal(run.steps.length,reference.rows.length,`frame count for ${input}/${word}`);
  run.steps.forEach((step,k)=>{
   const view=step.wordSearchView,row=reference.rows[k];
   assert.deepEqual(step.codeLines,[row.line],`${word} frame ${k}`);
   assert.equal(view.source.scope,row.scope);
   assert.deepEqual(view.locals,row.locals,`${word} frame ${k}, line ${row.line}`);
   assert.deepEqual(view.board,view.locals.board);
  });
 });
});

test('79 marks, restores, rejects reuse and accepts complete words before bounds check',()=>{
 const run=problem.builder(problem.defaultInput,{word:'ABCCED'});
 for(const step of run.steps){
  const v=step.wordSearchView;
  if(v.change)assert.equal(v.board[v.change.r][v.change.c],v.change.to);
  assert.equal(v.source.timing,'after');
 }
 const terminal=problem.builder('A',{word:'A'}).steps.find(step=>step.wordSearchView.action==='found').wordSearchView;
 assert.equal(terminal.current.r,1);assert.equal(terminal.index,1);assert.equal(terminal.result,true);
 const failed=problem.builder('AB;BA',{word:'ABBA'});
 assert.ok(failed.steps.some(step=>step.wordSearchView.reason==='reused'));
 assert.ok(failed.steps.some(step=>step.wordSearchView.action==='restore'));
 for(const [input,word] of examples){const last=problem.builder(input,{word}).steps.at(-1);assert.deepEqual(last.wordSearchView.board,last.wordSearchView.original);assert.equal(last.final,true);}
 const count=problem.builder(problem.defaultInput,{word:'ABCB'});
 assert.equal(count.steps.at(-1).wordSearchView.reason,'count');
 assert.deepEqual(count.steps.at(-1).wordSearchView.missing,{B:1});
});

test('79 large traces keep the complete answer and disclose skipped snapshots',()=>{
 const run=problem.builder('B,A,A,A;A,A,A,A;A,A,A,B',{word:'AAAAAAAABB'}),last=run.steps.at(-1);
 assert.equal(run.answer,false);assert.equal(last.final,true);assert.ok(last.wordSearchView.omitted>0);
 assert.equal(run.steps.length,4001);assert.deepEqual(last.wordSearchView.board,last.wordSearchView.original);
});

test('79 pictures expose actual cell values, word progress and immutable snapshots in both languages',()=>{
 const host={innerHTML:'',clientWidth:240},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-word-search-79.js'),'utf8'),context);
 for(const [input,word] of examples){
  const run=problem.builder(input,{word}),before=JSON.stringify(run);
  for(const lang of ['vi','en'])for(const step of run.steps){
   context.lang=lang;context.renderWordSearch79Pictures(step);
   const v=step.wordSearchView;
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/data-cell=/g)||[]).length,v.rows*v.cols);
   assert.equal((host.innerHTML.match(/class="ws79-chip /g)||[]).length,word.length);
   assert.equal((host.innerHTML.match(/data-value="#"/g)||[]).length,v.board.flat().filter(ch=>ch==='#').length);
  }
  assert.equal(JSON.stringify(run),before);
 }
});

test('79 rejects malformed or oversized inputs without starting a search',()=>{
 for(const board of ['', 'AB;C','A,BC','A;1','ABCDEFG','A;A;A;A;A;A;A'])assert.throws(()=>problem.builder(board,{word:'A'}),/79:/);
 for(const word of ['', '#', 'ABCDEFGHIJKLMNOP'])assert.throws(()=>problem.builder('A',{word}),/79:/);
});
