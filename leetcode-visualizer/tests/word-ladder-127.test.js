const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),vm=require('node:vm');
const problem=require('../problems').SUPPORTED[127];
const differs=(a,b)=>[...a].filter((ch,i)=>ch!==b[i]).length===1;
function oracle(begin,end,words) {
  if(!words.includes(end))return 0;
  const queue=[[begin,1]],seen=new Set([begin]);
  for(let head=0;head<queue.length;head++){const [word,depth]=queue[head];if(word===end)return depth;for(const next of words)if(!seen.has(next)&&differs(word,next)){seen.add(next);queue.push([next,depth+1]);}}
  return 0;
}
const cases=[
  ['hit','cog',['hot','dot','dog','lot','log','cog']],['hit','cog',['hot','dot','dog','lot','log']],
  ['hit','cog',['hot','dot','cog']],['a','c',['a','b','c']],['aaa','bbb',['aab','abb','bbb']],
  ['hit','cog',[]],['cat','dog',['cat','cot','cog','dog','dat','dot']],['aa','bb',['ba','ab','bb']],
  ['ab','ac',['ab','ac']],['aaa','bbb',['aab','aba','baa','abb','bab','bba','bbb']],
];
let seed=127;
const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const universe=Array.from({length:27},(_,i)=>'abc'[Math.floor(i/9)]+'abc'[Math.floor(i/3)%3]+'abc'[i%3]);
for(let trial=0;trial<65;trial++){
  const begin=universe[random(27)];let end=universe[random(27)];if(end===begin)end=universe[(universe.indexOf(end)+1)%27];
  const words=[...universe];
  for(let i=words.length-1;i>0;i--){const j=random(i+1);[words[i],words[j]]=[words[j],words[i]];}
  cases.push([begin,end,words.slice(0,1+random(11))]);
}

for(const approach of [1,2]) test(`127 approach ${approach}: minimum word count and illustrated path match an independent graph BFS`,()=>{
  const build=approach===1?problem.builder:problem.builder2;
  for(const [begin,end,words] of cases){
    const before=JSON.stringify(words),run=build(words,{beginWord:begin,endWord:end}),last=run.steps.at(-1).ladder127View;
    assert.equal(run.answer,oracle(begin,end,words),JSON.stringify([begin,end,words]));
    assert.equal(JSON.stringify(words),before);
    assert.equal(last.path.length,run.answer);
    assert.equal(run.steps.at(-1).final,true);
    if(run.answer){assert.equal(last.path[0],begin);assert.equal(last.path.at(-1),end);assert.ok(last.path.slice(1).every((w,i)=>words.includes(w)&&differs(last.path[i],w)));assert.equal(new Set(last.path).size,last.path.length);}
    assert.ok(run.steps.slice(0,-1).every(s=>s.ladder127View.answer===null&&s.ladder127View.path.length===0));
  }
});

for(const approach of [1,2]) test(`127 approach ${approach}: all executed lines and complete locals match CPython`,()=>{
  const source=approach===1?problem.code:problem.code2,build=approach===1?problem.builder:problem.builder2;
  const python=`import json,sys
from collections import deque
data=json.load(sys.stdin)
ns={}
exec(compile(data['code'],'<127>','exec'),ns)
def safe(value):
    if isinstance(value,dict): return {k:safe(v) for k,v in value.items()}
    if isinstance(value,set): return sorted(value)
    if isinstance(value,(list,tuple,deque)): return [safe(v) for v in value]
    return value
out=[]
for begin,end,words in data['cases']:
    events,pending=[],None
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_filename!='<127>' or frame.f_code.co_name!='ladderLength': return trace
        if event in ('line','return'):
            if pending is not None:
                values=dict(frame.f_locals)
                values['self']={}
                events.append({'line':pending,'locals':safe(values)})
            pending=frame.f_lineno if event=='line' else None
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().ladderLength(begin,end,words)
    sys.settrace(None)
    out.append({'answer':answer,'events':events})
print(json.dumps(out))`;
  const run=spawnSync('python',['-c',python],{input:JSON.stringify({code:source.join('\n'),cases}),encoding:'utf8',maxBuffer:48*1024*1024});
  assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((actual,i)=>{
    const [begin,end,words]=cases[i],expected=build(words,{beginWord:begin,endWord:end});
    assert.equal(expected.answer,actual.answer);
    assert.deepEqual(expected.steps.map(s=>({line:s.codeLines[0],locals:Object.fromEntries(s.vars.map(v=>[v.name,v.rawValue]))})),actual.events,JSON.stringify(cases[i]));
  });
});

test('127 trace records mark-before-enqueue, bucket clearing, small-frontier swaps and actual meeting',()=>{
  const run=problem.builder(problem.defaultInput,{beginWord:'hit',endWord:'cog'});
  for(const step of run.steps){
    const v=step.ladder127View;
    assert.equal(v.source,problem.code[v.line-1].trim());
    if(v.event==='discover'){assert.ok(v.seen.includes(v.candidate));assert.ok(!v.queue.some(([word])=>word===v.candidate));}
    if(v.event==='enqueue')assert.equal(v.queue.at(-1)[0],v.candidate);
    if(v.event==='clear')assert.deepEqual(v.bucket,[]);
    if(v.event==='pop')assert.equal(v.word,step.vars.find(v=>v.name==='word').rawValue);
  }
  const two=problem.builder2(problem.defaultInput,{beginWord:'hit',endWord:'cog'});
  assert.ok(two.steps.some(s=>s.ladder127View.event==='swap-front'));
  assert.ok(two.steps.some(s=>s.ladder127View.event==='meet-check'&&s.ladder127View.check));
  const swap=two.steps.findIndex(s=>s.ladder127View.event==='swap-front');
  assert.deepEqual(two.steps[swap].ladder127View.front,two.steps[swap-1].ladder127View.back);
  assert.equal(two.steps[swap+1].ladder127View.event,'swap-distance');
  assert.equal(run.steps[0].ladder127View.bucket.length,0);
  assert.deepEqual(run.steps.find(s=>s.ladder127View.event==='buckets').vars.find(v=>v.name==='buckets').rawValue,{});
});

test('127 input validation and live arguments preserve begin/end and dictionary ordering',()=>{
  assert.deepEqual(problem.liveArgs('hot,dot,cog',{beginWord:'hit',endWord:'cog'}),['hit','cog',['hot','dot','cog']]);
  assert.deepEqual(problem.liveArgs('["hot","cog"]',{beginWord:'hit',endWord:'cog'}),['hit','cog',['hot','cog']]);
  assert.deepEqual(problem.liveArgs('',{beginWord:'hit',endWord:'cog'}),['hit','cog',[]]);
  for(const [input,params] of [['hot,,cog',{}],['hot,hot',{}],['HiT',{}],['a',{}],['hot',{beginWord:'hit',endWord:'hit'}],['hot',{beginWord:'HIT',endWord:'cog'}],['hot',{beginWord:'hi',endWord:'cog'}],[['hot',true],{}],[null,{}],[Array(5001).fill('hot'),{}]]){
    assert.throws(()=>problem.builder(input,params));assert.throws(()=>problem.builder2(input,params));assert.throws(()=>problem.liveArgs(input,params));
  }
});

test('127 both approaches compute a full large dictionary with a bounded, honest preview',()=>{
  const words=[];
  for(let i=0;i<5000;i++)words.push(String.fromCharCode(97+Math.floor(i/676),97+Math.floor(i/26)%26,97+i%26));
  for(const build of [problem.builder,problem.builder2]){
    const run=build(words,{beginWord:'zzz',endWord:'hka'}),last=run.steps[0];
    assert.equal(run.answer,5);assert.equal(run.steps.length,1);assert.equal(last.ladder127View.mode,'summary');assert.deepEqual(last.codeLines,[]);assert.deepEqual(last.vars,[]);assert.ok(last.ladder127View.graph.nodes.length<=18);
    assert.equal(last.ladder127View.path.at(-1),'hka');
    const connected=build(words,{beginWord:'zzz',endWord:'azz'});
    assert.equal(connected.answer,2);assert.deepEqual(connected.steps[0].ladder127View.path,['zzz','azz']);
  }
});

function renderer(){
  const listeners={},host={innerHTML:'',querySelector:selector=>({clientWidth:600,addEventListener:(_,cb)=>{listeners[selector]=cb;}}),querySelectorAll:()=>[]};
  const context={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('<','&lt;').replaceAll('"','&quot;'),stopPlay(){},renderStep(){},steps:[],stepIndex:0};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-word-ladder-127.js'),'utf8'),context);return {context,listeners,host};
}
test('127 all diagrams render in both languages, graph edges are legal and navigation follows actual expansions',()=>{
  const {context,listeners,host}=renderer();
  for(const language of ['vi','en'])for(const approach of [1,2])for(const [begin,end,words] of cases.slice(0,10)){
    context.lang=language;const run=(approach===1?problem.builder:problem.builder2)(words,{beginWord:begin,endWord:end});
    for(const step of run.steps){
      context.renderWordLadder127Pictures(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);
      const v=step.ladder127View;assert.ok(v.graph.edges.every(([a,b])=>differs(a,b)));
      if(!words.includes(end))assert.ok(v.graph.edges.every(pair=>!pair.includes(end)));
      const positions=context.wordLadder127Layout(v.graph,begin.length).positions;
      for(const word of v.graph.nodes)assert.ok(Number.isFinite(positions.get(word).x)&&Number.isFinite(positions.get(word).y));
    }
    assert.match(host.innerHTML,run.answer?/l127-answer/:/l127-no-path/);
  }
  context.steps=problem.builder(problem.defaultInput,{beginWord:'hit',endWord:'cog'}).steps;context.renderWordLadder127Pictures(context.steps[0]);listeners['[data-l127-next]']();assert.equal(context.steps[context.stepIndex].ladder127View.event,'pop');listeners['[data-l127-result]']();assert.equal(context.stepIndex,context.steps.length-1);
});

for(const approach of [1,2])test(`127 approach ${approach}: real editable-code runner executes the selected Python`,()=>{
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8'),tracer=vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const python=tracer+`\nimport json,sys\ndata=json.load(sys.stdin)\nprint(json.dumps([__viz_run_trace(data['code'],'ladderLength',args) for args in data['args']]))`;
  const execution=spawnSync('python',['-c',python],{input:JSON.stringify({code:(approach===1?problem.code:problem.code2).join('\n'),args:cases.slice(0,10).map(([beginWord,endWord,words])=>problem.liveArgs(words,{beginWord,endWord}))}),encoding:'utf8',maxBuffer:16*1024*1024});
  assert.equal(execution.status,0,execution.stderr);
  JSON.parse(execution.stdout).forEach((run,i)=>assert.equal(run.result,oracle(...cases[i])));
});
