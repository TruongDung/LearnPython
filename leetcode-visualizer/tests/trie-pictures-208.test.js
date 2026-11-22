'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[208];
const {prepareDesignLiveRun}=require('../live-args');
const cases=[['apple,apply','app','app'],['apple,app','app','appl'],['cat,car','cap','ca'],['a,ab,abc','ab','abc'],['apple,apple','apple','appl'],['a','ab','ab'],['ab,ac','a','a']];

test('208 both representations return correct word and prefix results',()=>{
  const samples=[...cases];let seed=208;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  for(let t=0;t<60;t++){
    const words=Array.from({length:1+rand(5)},()=>Array.from({length:1+rand(5)},()=>'abc'[rand(3)]).join(''));
    samples.push([words.join(','),words[rand(words.length)].slice(0,1+rand(4)),rand(2)?words[rand(words.length)].slice(0,2):'z']);
  }
  for(const [input,search,prefix] of samples)for(const block of [1,2]){
    const result=(block===1?p.builder:p.builder2)(input,{search,prefix}),words=input.split(',');
    assert.deepEqual(result.answer,{search:words.includes(search),startsWith:words.some(w=>w.startsWith(prefix))});
    assert.equal(result.steps.at(-1).final,true);assert.equal(result.steps.filter(s=>s.final).length,1);
    assert.ok(result.steps.every(s=>s.codeLines.length===1&&s.codeBlock===block));
    const final=result.steps.at(-1).trie208View;
    assert.equal(final.nodes.length,new Set(['',...words.flatMap(w=>Array.from({length:w.length},(_,i)=>w.slice(0,i+1)))]).size);
    assert.deepEqual(final.nodes.filter(n=>n.isWord).map(n=>n.prefix).sort(),[...new Set(words)].sort());
  }
});

test('208 constructors, insert, search and startsWith frames match CPython for both approaches',()=>{
  const script=`import sys,json
source_data=json.load(sys.stdin)
def encode(v):
    if isinstance(v,dict):return {k:encode(x) for k,x in v.items()}
    if isinstance(v,(list,tuple)):return [encode(x) for x in v]
    if isinstance(v,(str,int,bool)) or v is None:return v
    return encode(vars(v))
out=[]
for source in source_data['sources']:
    ns={}
    exec(compile(source,'<trie208>','exec'),ns)
    runs=[]
    for words,search,prefix in source_data['cases']:
        events=[]
        pending={}
        def trace(frame,event,arg):
            if frame.f_code.co_filename!='<trie208>':return trace
            key=id(frame)
            if event in ('line','return'):
                if key in pending:
                    scope=frame.f_code.co_name
                    if scope=='__init__':scope=type(frame.f_locals['self']).__name__+'.__init__'
                    events.append({'line':pending[key],'scope':scope,'vars':encode(dict(frame.f_locals))})
                if event=='line':pending[key]=frame.f_lineno
                else:pending.pop(key,None)
            return trace
        sys.settrace(trace)
        trie=ns['Trie']()
        for word in words.split(','):trie.insert(word)
        answer={'search':trie.search(search),'startsWith':trie.startsWith(prefix)}
        sys.settrace(None)
        runs.append({'answer':answer,'events':events})
    out.append(runs)
print(json.dumps(out))`;
  const run=spawnSync('python3',['-c',script],{input:JSON.stringify({sources:[p.code.join('\n'),p.code2.join('\n')],cases}),encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((approach,block)=>approach.forEach((expected,i)=>{
    const [input,search,prefix]=cases[i],result=(block===0?p.builder:p.builder2)(input,{search,prefix});assert.deepEqual(result.answer,expected.answer);
    assert.deepEqual(result.steps.map(s=>({line:s.codeLines[0],scope:s.trie208View.scope,vars:Object.fromEntries(s.vars.map(v=>[v.name,Object.hasOwn(v,'rawValue')?v.rawValue:v.value]))})),expected.events,`block ${block+1}, ${input}`);
  }));
});

test('208 distinguishes an unfinished prefix from a word and preserves snapshots',()=>{
  const r=p.builder('apple,apply',{search:'app',prefix:'app'});
  const ret=r.steps.find(s=>s.trie208View.scope==='search'&&s.trie208View.event==='return').trie208View;
  assert.equal(ret.terminal,false);assert.equal(ret.result,false);assert.equal(ret.missing,false);
  assert.deepEqual(r.answer,{search:false,startsWith:true});
  assert.equal(r.steps[0].trie208View.nodes.length,0);assert.deepEqual(r.steps[0].vars[0].rawValue,{children:{}});
  assert.equal(r.steps.find(s=>s.trie208View.event==='mark').trie208View.nodes.filter(n=>n.isWord).length,1);
  assert.ok(r.steps.some(s=>s.trie208View.pending));
});

test('208 validates visual limits and preserves Edit & Run operations',()=>{
  for(const input of ['', 'a,,b','A','a.b','a\nb','a'.repeat(13),Array(13).fill('a').join(',')])assert.throws(()=>p.builder(input,{search:'a',prefix:'a'}),/208/);
  for(const query of ['', 'A','a*','a'.repeat(13)])assert.throws(()=>p.builder('a',{search:query,prefix:'a'}),/208/);
  const config=prepareDesignLiveRun(p,'apple,apply',{search:'app',prefix:'app'});
  assert.equal(config.className,'Trie');assert.deepEqual(config.operations,[{name:'insert',args:['apple']},{name:'insert',args:['apply']},{name:'search',args:['app']},{name:'startsWith',args:['app']}]);
});

test('208 pictures render both source approaches and both languages',()=>{
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host,escapeHtml:String,stepIndex:0,steps:[]};vm.createContext(ctx);
  for(const file of ['trie-picture-ui.js','renderer-trie-pictures-208.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
  for(const lang of ['vi','en'])for(const block of [1,2])for(const [input,search,prefix] of cases){
    ctx.lang=lang;ctx.steps=(block===1?p.builder:p.builder2)(input,{search,prefix}).steps;
    ctx.steps.forEach((step,i)=>{ctx.stepIndex=i;ctx.renderTrie208View(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN/);assert.match(host.innerHTML,/t208-tests/);assert.match(host.innerHTML,/tp-graph/);});
    assert.match(host.innerHTML,/True|False/);
  }
});
