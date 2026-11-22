'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[3045];
const oracle=words=>words.reduce((n,w,j)=>n+words.slice(0,j).filter(before=>w.startsWith(before)&&w.endsWith(before)).length,0);

test('3045 agrees with a pair-scan oracle, including duplicates, overlaps and index order',()=>{
  const cases=[['a','aba','ababa','aa'],['pa','papa','ma','mama'],['abab','ab'],['ab','abc'],['ab','cab'],['a','a','a'],['a','aaa','aaaaa']];
  let seed=3045;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  for(let i=0;i<100;i++)cases.push(Array.from({length:1+rand(6)},()=>Array.from({length:1+rand(6)},()=>'ab'[rand(2)]).join('')));
  for(const words of cases){const result=p.builder(words);assert.equal(result.answer,oracle(words),JSON.stringify(words));assert.equal(result.steps.at(-1).final,true);assert.equal(result.steps.filter(s=>s.final).length,1);assert.ok(result.steps.every(s=>s.codeLines.length===1));}
});

test('3045 every displayed line and local matches CPython',()=>{
  const cases=[['a'],['a','aba','ababa','aa'],['a','a','a'],['ab','abc','ab'],['abab','ab']];
  const script=`import sys,json
+source,cases=json.load(sys.stdin)
+ns={}
+exec(compile(source,'<pairs>','exec'),ns)
+def encode(v):
+    if isinstance(v,dict): return {','.join(k) if isinstance(k,tuple) else k:encode(x) for k,x in v.items()}
+    if isinstance(v,(list,tuple)): return [encode(x) for x in v]
+    return v
+out=[]
+for words in cases:
+    events=[]
+    pending=None
+    def trace(frame,event,arg):
+        global pending
+        if frame.f_code.co_name!='countPrefixSuffixPairs':return trace
+        if event in ('line','return'):
+            if pending is not None:events.append({'line':pending,'vars':encode({k:v for k,v in frame.f_locals.items() if k not in ('self','words')})})
+            pending=frame.f_lineno if event=='line' else None
+        return trace
+    sys.settrace(trace)
+    answer=ns['Solution']().countPrefixSuffixPairs(words)
+    sys.settrace(None)
+    out.append({'answer':answer,'events':events})
+print(json.dumps(out))`.replaceAll('\n+','\n');
  const run=spawnSync('python3',['-c',script],{input:JSON.stringify([p.code.join('\n'),cases]),encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((r,i)=>{const actual=p.builder(cases[i]);assert.equal(actual.answer,r.answer);assert.deepEqual(actual.steps.map(s=>({line:s.codeLines[0],vars:Object.fromEntries(s.vars.map(v=>[v.name,v.value]))})),r.events,JSON.stringify(cases[i]));});
});

test('3045 terminal counts, pair witnesses and snapshots are accurate',()=>{
  const result=p.builder(['a','a','a']);
  const add=result.steps.find(s=>s.prefixSuffix3045View.add?.count===2).prefixSuffix3045View;
  assert.deepEqual(add.add.indices,[0,1]);assert.deepEqual(add.add,{before:1,count:2,after:3,indices:[0,1],length:1});
  assert.ok(add.matches.every(m=>m.i<m.j));assert.equal(add.nodes.find(n=>n.id===add.node).terminal,2);
  const final=result.steps.at(-1).prefixSuffix3045View;assert.equal(final.nodes.find(n=>n.id===1).terminal,3);
  assert.equal(result.steps[0].prefixSuffix3045View.nodes[0].terminal,null);
  assert.equal(result.steps[1].prefixSuffix3045View.nodes[0].terminal,0);
  for(const m of final.matches){assert.equal(result.original[m.i],m.word);assert.ok(result.original[m.j].startsWith(m.word)&&result.original[m.j].endsWith(m.word));}
});

test('3045 retains full input limits, large answers and bounded sampled traces',()=>{
  const words=Array(100000).fill('a'),r=p.builder(words);
  assert.equal(r.answer,4999950000);assert.ok(r.steps.length<=320);assert.equal(r.steps.at(-1).prefixSuffix3045View.detailed,false);
  assert.equal(r.steps.at(-1).prefixSuffix3045View.inserted,100000);
  const long='a'.repeat(100000),large=p.builder([long,long]);assert.equal(large.answer,1);assert.ok(large.steps.length<=320);
  assert.ok(large.steps.every(s=>s.prefixSuffix3045View.nodes.length<=60));
  for(const input of [[],[''],['A'],['a b'],['ab\n'],['a'.repeat(100001)]])assert.throws(()=>p.builder(input));
});

test('3045 native pictures render all phases, both languages and large summaries',()=>{
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
  const ctx={lang:'vi',$:()=>host,escapeHtml:String,stepIndex:0,steps:[]};vm.createContext(ctx);
  for(const file of ['trie-picture-ui.js','renderer-prefix-suffix-pairs-3045.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
  for(const lang of ['vi','en'])for(const words of [['a','aba','ababa','aa'],['ab','cab'],['a','a','a'],Array(13).fill('a')]){
    ctx.lang=lang;ctx.steps=p.builder(words).steps;ctx.steps.forEach((step,index)=>{ctx.stepIndex=index;ctx.renderPrefixSuffix3045View(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN/);assert.match(host.innerHTML,/ps3045-pairs/);assert.match(host.innerHTML,/tp-graph/);});
    assert.match(host.innerHTML,new RegExp(String(oracle(words))));
  }
});
