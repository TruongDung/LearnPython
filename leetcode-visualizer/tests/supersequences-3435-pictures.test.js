"use strict";
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {SUPPORTED,TOPOLOGICAL_SORT_SUBTABS}=require('../problems');
const problem=SUPPORTED[3435],view=step=>step.supersequences3435View;
const normalized=rows=>rows.map(row=>row.join(',')).sort();
const examples=[['ab','ba'],['aa','ac'],['aa','bb','cc'],['ab','bc','ca'],['ab','bc'],['zz'],['az','za','aa'],['ab','ba','cd','dc'],['ac','bc','cb','aa']];
test('3435 handles official examples, cycles, self loops and separate components',()=>{
  const expected=[[[2,1],[1,2]],[[2,0,1]],[[2,2,2]],[[2,1,1],[1,2,1],[1,1,2]],[[1,1,1]]];
  examples.slice(0,5).forEach((words,i)=>{const result=problem.builder(words);assert.deepEqual(normalized(result.answer),normalized(expected[i].map(row=>[...row,...Array(26-row.length).fill(0)])));});
  assert.equal(problem.builder(['zz']).answer[0][25],2);
  assert.equal(problem.builder(['ab','ba','cd','dc']).answer.length,4);
  assert.deepEqual(problem.liveArgs('ab,ba'),[['ab','ba']]);
});
test('3435 every executed source line and bound local matches CPython, including both call scopes',()=>{
  const script=String.raw`import sys,json,types
from collections import deque
p=json.load(sys.stdin)
ns={}
exec(compile(p['code'],'lesson','exec'),ns)
def normal(v):
    if isinstance(v,(list,tuple,deque)): return [normal(x) for x in v]
    if isinstance(v,dict): return {str(k):normal(x) for k,x in v.items()}
    return v
output=[]
for words in p['cases']:
    events=[];pending={}
    def trace(f,event,arg):
        if f.f_code.co_filename!='lesson' or f.f_code.co_name not in ('supersequences','is_dag'): return None
        if event in ('line','return'):
            if f in pending:
                events.append({'line':pending.pop(f),'scope':f.f_code.co_name,'locals':{k:normal(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.GeneratorType)}})
            if event=='line': pending[f]=f.f_lineno
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().supersequences(words)
    sys.settrace(None)
    output.append({'answer':answer,'events':events})
print(json.dumps(output))`;
  const result=spawnSync(process.env.PYTHON||'python',['-X','utf8','-c',script],{input:JSON.stringify({code:problem.code.join('\n'),cases:examples}),encoding:'utf8',maxBuffer:30*1024*1024});
  assert.equal(result.status,0,result.stderr||String(result.error));
  JSON.parse(result.stdout).forEach((ref,i)=>{
    const run=problem.builder(examples[i]);assert.deepEqual(run.answer,ref.answer);
    assert.equal(run.steps.length,ref.events.length,`case ${i} frame count`);
    run.steps.forEach((step,j)=>{assert.deepEqual({line:step.codeLines[0],scope:step.source.scope,locals:step.locals},ref.events[j],`case ${i} frame ${j+1}`);assert.equal(step.source.text,problem.code[step.source.line-1]);assert.equal(step.codeLines.length,1);});
  });
});
test('3435 matches independently enumerated shortest strings for ALL 511 word sets over a,b,c',()=>{
  const allWords=[... 'abc'].flatMap(a=>[...'abc'].map(b=>a+b)),strings=[];
  function visit(text,max){if(text){let covered=0;allWords.forEach((word,i)=>{const a=text.indexOf(word[0]);if(a>=0&&text.indexOf(word[1],a+1)>=0)covered|=1<<i;});const counts=Array(26).fill(0);for(const ch of text)counts[ch.charCodeAt(0)-97]++;strings.push({length:text.length,covered,counts});}if(text.length<max)for(const ch of 'abc')visit(text+ch,max);}
  visit('',6);strings.sort((a,b)=>a.length-b.length);
  for(let mask=1;mask<1<<9;mask++){
    const words=allWords.filter((_,i)=>mask&1<<i);let length=Infinity;const freq=new Set();
    for(const candidate of strings){if(candidate.length>length)break;if((candidate.covered&mask)===mask){length=candidate.length;freq.add(candidate.counts.join(','));}}
    const result=problem.builder(words);assert.deepEqual(normalized(result.answer),[...freq].sort(),words.join(','));
    assert.ok(result.answer.every(row=>row.reduce((a,b)=>a+b,0)===length));
  }
});
test('3435 pictures expose cycles, duplicated letters, queues and frequency bars without mutating snapshots',()=>{
  const host={innerHTML:'',dataset:{},clientWidth:550},ctx={$:()=>host,lang:'vi'};vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-supersequences-3435.js'),'utf8'),ctx);
  for(const words of examples){const run=problem.builder(words),before=JSON.stringify(run);
    for(const lang of ['vi','en']){ctx.lang=lang;for(const step of run.steps){ctx.renderSupersequences3435Pictures(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|<script/);assert.match(host.innerHTML,/class="ss3435-viz"/);if(view(step).phase==='search')assert.equal((host.innerHTML.match(/data-word="/g)||[]).length,words.length);if(view(step).cycle.length)assert.match(host.innerHTML,/ss3435-card cycle/);}}
    assert.equal(JSON.stringify(run),before);assert.match(host.innerHTML,/Show all 26 entries/);
    for(let i=0;i<run.answer.length;i++){
      host.dataset.ss3435Selected=String(i);ctx.renderSupersequences3435Pictures(run.steps.at(-1));
      const html=host.innerHTML.match(/<div class="ss3435-sequence">([\s\S]*?)<\/div>/)[1],text=[...html.matchAll(/<b>([a-z])<\/b>/g)].map(match=>match[1]).join(''),frequency=Array(26).fill(0);
      for(const ch of text)frequency[ch.charCodeAt(0)-97]++;
      assert.deepEqual(frequency,run.answer[i]);
      for(const word of words){const first=text.indexOf(word[0]);assert.ok(first>=0&&text.indexOf(word[1],first+1)>=0,`${word} in ${text}`);}
    }
  }
});
test('3435 accepts all 16 letters and caps only the presentation, preserving a complete result',()=>{
  const words=[...'abcdefghijklmnop'].map(ch=>ch+ch),start=Date.now(),run=problem.builder(words);
  assert.equal(run.answer.length,1);assert.deepEqual(run.answer[0],[...Array(16).fill(2),...Array(10).fill(0)]);
  assert.equal(run.steps.length,4001);assert.ok(view(run.steps.at(-1)).omitted>0);assert.equal(run.steps.at(-1).final,true);
  assert.ok(Date.now()-start<20000);
});
test('3435 rejects malformed or duplicate words and is selectable in the topological catalog',()=>{
  for(const input of ['',[],['abc'],['Aq'],['ab','ab'],'["ab",',Array.from({length:17},(_,i)=>String.fromCharCode(97+i).repeat(2))])assert.throws(()=>problem.builder(input),/3435/);
  assert.ok(TOPOLOGICAL_SORT_SUBTABS[0].roster.find(p=>p.id===3435).available);
  assert.ok(problem.tags.some(t=>t.key==='topological-sort'));
});
