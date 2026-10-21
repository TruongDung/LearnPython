const {test}=require('node:test'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),vm=require('node:vm');
const problem=require('../problems').SUPPORTED[23];
const cases=[[],[[]],[[],[],[]],[[1,4,5],[1,3,4],[2,6]],[[0]],[[1,1],[1,1]],[[1],[2],[3]],[[1,3],[],[2],[],[]],[[-3,-1,2],[-3,0],[0,2]],[[1,2,3,4],[-10]],[[0,0,0],[0],[0,0]]];
let seed=23;
const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
for(let trial=0;trial<75;trial++)cases.push(Array.from({length:random(6)},()=>Array.from({length:random(4)},()=>random(11)-5).sort((a,b)=>a-b)));
function order(nodes,head){const byId=new Map(nodes.map(node=>[node.id,node])),out=[],seen=new Set();while(head!==null){assert.ok(!seen.has(head),'pointer cycle');seen.add(head);out.push(head);head=byId.get(head).next;}return out;}
function expected(values){return values.flat().map((value,id)=>({value,id})).sort((a,b)=>a.value-b.value||a.id-b.id);}

for(const approach of [1,2])test(`23 approach ${approach}: sorted result reuses every original node, handles empty lists and stable ties`,()=>{
  const build=approach===1?problem.builder:problem.builder2;
  for(const values of cases){
    const before=JSON.stringify(values),run=build(values),sorted=expected(values),last=run.steps.at(-1).merge23View;
    assert.deepEqual(run.answer,sorted.map(item=>item.value));assert.equal(JSON.stringify(values),before);assert.deepEqual(last.chain,sorted.map(item=>item.id));
    assert.ok(run.steps.at(-1).final);
    for(const step of run.steps){
      const v=step.merge23View;
      assert.equal(step.codeBlock,approach);assert.equal(v.source,(approach===1?problem.code:problem.code2)[v.line-1].trim());
      for(const node of v.nodes){order(v.nodes,node.id);if(node.id>=0)assert.equal(node.value,values.flat()[node.id]);}
      const confirmed=v.confirmed.map(id=>v.nodes.find(node=>node.id===id).value);assert.ok(confirmed.every((value,i)=>i===0||confirmed[i-1]<=value));
      if(approach===1){assert.equal(new Set(v.heap.map(item=>item.origin)).size,v.heap.length);for(let i=1;i<v.heap.length;i++){const parent=v.heap[(i-1)>>1],item=v.heap[i];assert.ok(parent.value<item.value||parent.value===item.value&&parent.origin<=item.origin);}}
    }
  }
});

for(const approach of [1,2])test(`23 approach ${approach}: executed Python lines, complete locals, node identities and links match CPython`,()=>{
  const python=`import sys,json
data=json.load(sys.stdin)
registry=[]
dummy_id=-1
class ListNode:
    def __init__(self,val=0,next=None,ident=None,origin=None,index=None):
        global dummy_id
        if ident is None: ident=dummy_id; dummy_id-=1
        self.val,self.next,self.ident,self.origin,self.index=val,next,ident,origin,index
        registry.append(self)
ns={'ListNode':ListNode}
exec(compile(data['code'],'<23>','exec'),ns)
def encode(value):
    if isinstance(value,ListNode): return {'val':value.val,'next':encode(value.next)}
    if isinstance(value,(list,tuple)): return [encode(v) for v in value]
    if isinstance(value,(str,int,bool)) or value is None: return value
    return {}
out=[]
for values in data['cases']:
    registry=[]
    dummy_id=-1
    heads=[]
    for origin,row in enumerate(values):
        nodes=[ListNode(value,ident=len(registry),origin=origin,index=index) for index,value in enumerate(row)]
        for a,b in zip(nodes,nodes[1:]): a.next=b
        heads.append(nodes[0] if nodes else None)
    events,pending=[],None
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_filename!='<23>' or frame.f_code.co_name!='mergeKLists': return trace
        if event in ('line','return'):
            if pending is not None:
                values_now=dict(frame.f_locals)
                pointers={k:(v.ident if v else None) for k,v in values_now.items() if k in ('dummy','tail','node','left','right')}
                graph=[{'id':node.ident,'value':node.val,'origin':node.origin,'index':node.index,'next':node.next.ident if node.next else None} for node in registry]
                events.append({'line':pending,'locals':{k:encode(v) for k,v in values_now.items()},'pointers':pointers,'nodes':graph})
            pending=frame.f_lineno if event=='line' else None
        return trace
    sys.settrace(trace)
    result=ns['Solution']().mergeKLists(heads)
    sys.settrace(None)
    order=[]
    while result: order.append(result.ident);result=result.next
    out.append({'events':events,'order':order})
print(json.dumps(out))`;
  const build=approach===1?problem.builder:problem.builder2,source=approach===1?problem.code:problem.code2;
  const run=spawnSync('python',['-c',python],{input:JSON.stringify({code:source.join('\n'),cases}),encoding:'utf8',maxBuffer:48*1024*1024});
  assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((actual,i)=>{
    const expected=build(cases[i]);assert.deepEqual(expected.steps.at(-1).merge23View.chain,actual.order);
    assert.deepEqual(expected.steps.map(step=>({line:step.codeLines[0],locals:Object.fromEntries(step.vars.map(v=>[v.name,v.rawValue])),pointers:step.merge23View.pointers,nodes:step.merge23View.nodes})),actual.events,JSON.stringify(cases[i]));
  });
});

test('23 separates pop, pointer rewire and tail advance; gray suffix is not prematurely confirmed',()=>{
  const run=problem.builder(problem.defaultInput),pop=run.steps.find(s=>s.merge23View.event==='pop').merge23View,link=run.steps.find(s=>s.merge23View.event==='link').merge23View,tail=run.steps.find(s=>s.merge23View.event==='tail').merge23View;
  assert.equal(pop.selected,0);assert.equal(pop.heap.length,2);assert.deepEqual(pop.chain,[]);assert.deepEqual(pop.confirmed,[]);
  assert.deepEqual(link.change,{from:-1,before:null,after:0});assert.deepEqual(link.chain,[0,1,2]);assert.deepEqual(link.confirmed,[]);assert.equal(link.pointers.tail,-1);
  assert.deepEqual(tail.confirmed,[0]);assert.deepEqual(tail.chain,[0,1,2]);assert.equal(tail.pointers.tail,0);
  assert.deepEqual(run.steps[0].merge23View.heap,[]);
  const dc=problem.builder2(problem.defaultInput),firstPair=dc.steps.find(s=>s.merge23View.event==='store').merge23View;
  assert.deepEqual(firstPair.confirmed,firstPair.chain);assert.ok(firstPair.chain.length>1);assert.equal(firstPair.heads[0],firstPair.chain[0]);
});

test('23 validates sorted lists, parses empty list forms and builds real nested linked-list arguments',()=>{
  assert.deepEqual(problem.liveArgs('1,4;[];2'),[[{__viz_type:'linked_list',values:[1,4]},{__viz_type:'linked_list',values:[]},{__viz_type:'linked_list',values:[2]}]]);
  for(const input of ['', '[]']){assert.deepEqual(problem.builder(input).answer,[]);assert.deepEqual(problem.liveArgs(input),[[]]);}
  assert.deepEqual(problem.liveArgs('[[]]'),[[{__viz_type:'linked_list',values:[]}]]);
  assert.deepEqual(problem.builder(';').answer,[]);
  for(const input of ['1,,2','2,1','[1,2]','[[true]]','[[null]]','[[-10001]]','[[1.5]]',Array(10001).fill([]),[Array(501).fill(1)]]){
    assert.throws(()=>problem.builder(input));assert.throws(()=>problem.builder2(input));assert.throws(()=>problem.liveArgs(input));
  }
});

test('23 large inputs merge every node and explicitly bound only the visualization',()=>{
  const values=Array.from({length:20},(_,i)=>Array.from({length:500},(_,j)=>i+j*20-5000)),sorted=expected(values).map(item=>item.value);
  for(const build of [problem.builder,problem.builder2]){
    const run=build(values),step=run.steps[0];assert.deepEqual(run.answer,sorted);assert.equal(run.steps.length,1);assert.deepEqual(step.codeLines,[]);assert.deepEqual(step.vars,[]);assert.equal(step.merge23View.totalNodes,10000);assert.equal(step.merge23View.chain.length,12);assert.equal(step.merge23View.original.length,4);assert.ok(step.merge23View.nodes.length<=32);
    assert.deepEqual(build(Array(10000).fill([])).answer,[]);
  }
});

function renderer(){
  const listeners={},host={innerHTML:'',querySelector:selector=>({clientWidth:600,addEventListener:(_,cb)=>{listeners[selector]=cb;}}),querySelectorAll:()=>[]};
  const context={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('<','&lt;').replaceAll('"','&quot;'),stopPlay(){},renderStep(){},steps:[],stepIndex:0};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-merge-k-lists-23.js'),'utf8'),context);return {context,listeners,host};
}
test('23 pictures render each frame in both languages, retain pending suffix and navigate to real operations',()=>{
  const {context,listeners,host}=renderer();
  for(const language of ['vi','en'])for(const approach of [1,2])for(const values of [...cases.slice(0,11),Array(7).fill([1])]){
    context.lang=language;
    for(const step of (approach===1?problem.builder:problem.builder2)(values).steps){context.renderMergeKLists23Pictures(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);assert.match(host.innerHTML,/k23-sources/);if(step.merge23View.event==='link')assert.match(host.innerHTML,/k23-change/);}
    assert.match(host.innerHTML,/k23-answer/);
  }
  context.steps=problem.builder(problem.defaultInput).steps;context.renderMergeKLists23Pictures(context.steps[0]);listeners['[data-k23-next]']();assert.equal(context.steps[context.stepIndex].merge23View.event,'pop');listeners['[data-k23-result]']();assert.equal(context.stepIndex,context.steps.length-1);
  context.stepIndex=0;context.steps=problem.builder2(problem.defaultInput).steps;context.renderMergeKLists23Pictures(context.steps[0]);listeners['[data-k23-next]']();assert.equal(context.steps[context.stepIndex].merge23View.event,'pair');
  for(let n=1;n<=6;n++){const layout=context.merge23HeapLayout(n);for(let i=0;i<n;i++){const p=layout.xy(i);assert.ok(p.x>0&&p.x<layout.width);assert.ok(p.y>0&&p.y<layout.height);}}
});

for(const approach of [1,2])test(`23 approach ${approach}: real editable-code runner materializes every list and returns merged values`,()=>{
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8'),tracer=vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const python=tracer+`\nimport json,sys\ndata=json.load(sys.stdin)\nprint(json.dumps([__viz_run_trace(data['code'],'mergeKLists',args) for args in data['args']]))`;
  const chosen=cases.slice(0,11),execution=spawnSync('python',['-c',python],{input:JSON.stringify({code:(approach===1?problem.code:problem.code2).join('\n'),args:chosen.map(values=>problem.liveArgs(values))}),encoding:'utf8',maxBuffer:16*1024*1024});
  assert.equal(execution.status,0,execution.stderr);JSON.parse(execution.stdout).forEach((run,i)=>assert.deepEqual(run.result,chosen[i].flat().length?expected(chosen[i]).map(item=>item.value):null));
});
