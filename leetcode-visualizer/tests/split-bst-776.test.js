'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[776],{runTrace}=require('../problems/wasm-picture-trace');
const fixtures=[{tree:[4,2,6,1,3,5,7],target:2},{tree:[4,2,6,1,3,5,7],target:5},{tree:[4,2,6,1,3,5,7],target:0},{tree:[4,2,6,1,3,5,7],target:7},{tree:[10,4,15,null,8,12,18,6,9],target:7},{tree:[1],target:1},{tree:[1],target:0},{tree:[],target:2},{tree:[0],target:0},{tree:[2,2,2],target:2},{tree:[1000,999],target:999}];
const python=(source,payload)=>{const r=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);};
function makeTree(values){let root=null;for(const value of values){if(!root){root={value,left:null,right:null};continue;}let n=root;for(;;){const side=value<n.value?'left':'right';if(!n[side]){n[side]={value,left:null,right:null};break;}n=n[side];}}const out=[],queue=[root];for(let i=0;i<queue.length;i++){const n=queue[i];out.push(n?n.value:null);if(n)queue.push(n.left,n.right);}while(out.at(-1)===null)out.pop();return out;}
function ancestorOracle(original,target){
 const map=new Map(original.map(n=>[n.id,n])),out=new Map(original.map(n=>[n.id,{id:n.id,value:n.value,left:null,right:null}])),roots=[null,null];
 for(const n of original){const group=n.value<=target?0:1;let child=n,parent=map.get(n.parent);while(parent&&(parent.value<=target?0:1)!==group){child=parent;parent=map.get(parent.parent);}if(!parent)roots[group]=n.id;else out.get(parent.id)[parent.left===child.id?'left':'right']=n.id;}
 return{nodes:[...out.values()],roots};
}
function normalized(nodes){return nodes.map(n=>({id:n.id,value:n.value,left:n.left,right:n.right}));}
test('776 exposes the standard TreeNode signature, native line debugging, empty-tree base case and live arguments',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.match(p.code.join('\n'),/def splitBST\(self, root: Optional\[TreeNode\], target: int\)/);
 assert.deepEqual(p.liveArgs('[4,2,6]',{target:'2'}),[{__viz_type:'binary_tree',values:[4,2,6],tree_id:'root'},2]);
 assert.deepEqual(p.builder(p.defaultInput,{target:2}).answer,[[2,1],[4,3,6,null,null,5,7]]);
 assert.deepEqual(p.builder([]).answer,[[],[]]);assert.deepEqual(p.builder('[1]',{target:1}).answer,[[1],[]]);
});
test('actual Python splits match an independent nearest-ancestor forest oracle and retain all identities and same-group edges',()=>{
 const cases=[...fixtures];let seed=776;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let i=0;i<100;i++)cases.push({tree:makeTree(Array.from({length:1+rand(30)},()=>rand(1001))),target:rand(1001)});
 const result=python(`import json,sys
p=json.load(sys.stdin)
class TreeNode:
    def __init__(self,val,node_id):
        self.val,self.node_id=val,node_id
        self.left=self.right=None
def make(values):
    if not values:return None,[]
    root=TreeNode(values[0],'0:0')
    nodes=[root]
    index=1
    for n in nodes:
        for side in ('left','right'):
            if index>=len(values):break
            if values[index] is not None:
                child=TreeNode(values[index],f'0:{index}')
                setattr(n,side,child)
                nodes.append(child)
            index+=1
    return root,nodes
scope={'TreeNode':TreeNode}
exec(p['code'],scope)
out=[]
for c in p['cases']:
    root,nodes=make(c['tree'])
    identities=set(map(id,nodes))
    result=scope['Solution']().splitBST(root,c['target'])
    reached=[]
    queue=[n for n in result if n is not None]
    for n in queue:
        reached.append(id(n))
        queue.extend(child for child in (n.left,n.right) if child is not None)
    assert set(reached)==identities and len(reached)==len(identities)
    out.append({'roots':[n.node_id if n else None for n in result],'nodes':[{'id':n.node_id,'value':n.val,'left':n.left.node_id if n.left else None,'right':n.right.node_id if n.right else None} for n in nodes]})
print(json.dumps(out))`,{code:p.code.join('\n'),cases});
 cases.forEach((c,i)=>{const before=JSON.stringify(c),run=p.builder(c.tree,{target:c.target}),v=run.steps.at(-1).splitBst776View,expected=ancestorOracle(v.original,c.target);assert.equal(JSON.stringify(c),before);assert.deepEqual(result[i],expected);assert.deepEqual(normalized(v.nodes),expected.nodes);assert.deepEqual(v.roots,expected.roots);
  const groups=v.answer.map(a=>a.filter(n=>n!==null));assert.ok(groups[0].every(n=>n<=c.target));assert.ok(groups[1].every(n=>n>c.target));assert.deepEqual(groups.flat().sort((a,b)=>a-b),c.tree.filter(n=>n!==null).sort((a,b)=>a-b));
  for(const n of v.original)for(const side of['left','right'])if(n[side]!==null){const child=v.original.find(o=>o.id===n[side]);if((n.value<=c.target)===(child.value<=c.target))assert.equal(v.nodes.find(o=>o.id===n.id)[side],child.id);}
 });
});
test('every line, recursive frame, return reference, watched local and actual child-pointer snapshot matches native CPython',()=>{
 const items=fixtures.map(c=>({code:p.code.join('\n'),method:'splitBST',args:[c.tree,c.target],treeArgs:[0],captureTrees:true}));
 const native=python(`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace(item)) for item in p['items']]))`,{path:require.resolve('../problems/picture-trace.py'),items});
 native.forEach((n,i)=>{const run=p.builder(fixtures[i].tree,{target:fixtures[i].target});assert.equal(run.steps.length,n.events.length);n.events.forEach((event,j)=>{const s=run.steps[j],v=s.splitBst776View;assert.deepEqual(s.codeLines,[event.line]);assert.equal(v.source,p.code[event.line-1].trim());s.vars.forEach(w=>assert.deepEqual(w.value,event.locals[w.name]??'—'));assert.deepEqual(v.frames,event.frames.map(f=>({root:f.locals.root?.id??null,value:f.locals.root?.val??null})));assert.deepEqual(v.returned,event.returning?event.returned.map(node=>node?.id??null):null);assert.deepEqual(normalized(v.nodes),event.trees.map(n=>({id:n.id,value:n.val,left:n.left,right:n.right})));});});
});
test('edge drawings change only at the real assignment; recursion visits one path and history rewinds to executed writes',()=>{
 let cuts=0,links=0;
 for(const c of fixtures){const run=p.builder(c.tree,{target:c.target});let previous=null;const decisions=[];
  for(const [index,s]of run.steps.entries()){const v=s.splitBst776View;if(v.event==='decide')decisions.push(v.root);if(previous){const changed=[];for(const n of v.nodes)for(const side of['left','right'])if(previous.find(o=>o.id===n.id)[side]!==n[side])changed.push({id:n.id,side});if(changed.length){assert.equal(v.event,'rewire');assert.equal(changed.length,1);assert.equal(changed[0].id,v.change.node);assert.equal(changed[0].side,v.change.side);assert.equal(v.change.step,index);if(v.change.before!==null)cuts++;if(v.change.after!==null)links++;}}
   if(v.change){assert.ok(['root.left = large','root.right = small'].includes(v.source));assert.equal(v.nodes.find(n=>n.id===v.change.node)[v.change.side],v.change.after);}
   for(const h of v.history)assert.equal(run.steps[h.step].splitBst776View.event,'rewire');previous=v.nodes;
  }assert.equal(new Set(decisions).size,decisions.length);assert.ok(decisions.length<=Math.max(0,...run.steps[0].splitBst776View.nodes.map(n=>n.depth+1)));
 }assert.ok(cuts>0&&links>0);
});
test('50-node skewed trees keep the complete call stack and correct return; bounded tracing retains the outer return and final mutated graph',()=>{
 const tree=makeTree(Array.from({length:50},(_,i)=>i));const run=p.builder(tree,{target:24});assert.equal(Math.max(...run.steps.map(s=>s.splitBst776View.frames.length)),27);assert.equal(run.answer[0].filter(n=>n!==null).length,25);assert.equal(run.answer[1].filter(n=>n!==null).length,25);
 const trace=runTrace({code:p.code.join('\n'),method:'splitBST',args:[[4,2,6,1,3,5,7],2],treeArgs:[0],captureTrees:true,maxEvents:3});assert.equal(trace.trace.truncated,true);assert.deepEqual(trace.answer.map(n=>n?.val??null),[2,4]);assert.equal(trace.events.at(-1).locals.root.id,'0:0');assert.equal(trace.events.at(-1).frames.length,1);assert.equal(trace.events.at(-1).trees.find(n=>n.id==='0:0').left,'0:4');
});
test('renderer draws exact edges, cut ghosts, final forests and both languages without changing replay state',()=>{
 const host={innerHTML:''},context={lang:'vi',$:()=>host,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-split-bst-776.js'),'utf8'),context);
 for(const lang of['vi','en'])for(const c of fixtures){context.lang=lang;const run=p.builder(c.tree,{target:c.target}),before=JSON.stringify(run);context.steps=run.steps;for(const[index,s]of run.steps.entries()){context.stepIndex=index;const v=s.splitBst776View;context.renderSplitBst776View(s);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);assert.equal((host.innerHTML.match(/data-sb-node=/g)||[]).length,v.nodes.length);assert.equal((host.innerHTML.match(/data-sb-edge=/g)||[]).length,v.nodes.reduce((n,node)=>n+(node.left!==null)+(node.right!==null),0));assert.equal((host.innerHTML.match(/data-sb-removed=/g)||[]).length,!v.final&&v.change?.before!==null&&v.change&&v.change.before!==v.change.after?1:0);if(v.final)assert.match(host.innerHTML,/data-sb-answer="true"/);}
  context.stepIndex=0;context.renderSplitBst776View(run.steps[0]);const first=host.innerHTML;context.stepIndex=run.steps.length-1;context.renderSplitBst776View(run.steps.at(-1));context.stepIndex=0;context.renderSplitBst776View(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);
 }
});
test('776 rejects non-BST/disconnected trees, invalid values, oversize inputs and out-of-range targets',()=>{
 for(const tree of[{},'no tree',[1,null,null,2],[5,3,8,null,6],[-1],[1001],[1.1],makeTree(Array.from({length:51},(_,i)=>i))])assert.throws(()=>p.builder(tree));
 for(const target of['',true,{},-1,1001,1.5])assert.throws(()=>p.builder(p.defaultInput,{target}));assert.deepEqual(p.builder('4,2,6,1,3,5,7',{target:'2'}).answer,[[2,1],[4,3,6,null,null,5,7]]);
});
