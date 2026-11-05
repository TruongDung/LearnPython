'use strict';
const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[1214],build=(method,input,params)=>p[method===1?'builder':'builder2'](input,params);
const fixtures=[
 {root1:[2,1,4],root2:[1,0,3],target:5},
 {root1:[0,-10,10],root2:[5,1,7,0,2],target:18},
 {root1:[5],root2:[5],target:10},
 {root1:[2,1,3],root2:[10],target:4},
 {root1:[0,-3,2],root2:[1,-2,4],target:-5},
 {root1:[2,1,4],root2:[1,0,3],target:2},
 {root1:[2,1,4],root2:[1,0,3],target:6},
 {root1:[0],root2:[0],target:0},
 {root1:[1,null,2,null,3,null,4],root2:[5,4,null,3,null,2],target:7},
 {root1:[2,2,2],root2:[-2,-2,-2],target:0},
 {root1:[-1000000000],root2:[1000000000],target:0},
 {root1:[1000000000],root2:[1000000000],target:1000000000}
];
const oracle=c=>c.root1.some(a=>a!==null&&c.root2.some(b=>b!==null&&a+b===c.target));
const python=(source,payload)=>{const r=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);};
function makeTree(values){let root=null;for(const value of values){if(!root){root={value,left:null,right:null};continue;}let node=root;for(;;){const side=value<node.value?'left':'right';if(!node[side]){node[side]={value,left:null,right:null};break;}node=node[side];}}const queue=[root],out=[];for(const node of queue){out.push(node?node.value:null);if(node)queue.push(node.left,node.right);}while(out.at(-1)===null)out.pop();return out;}
test('1214 registers two native-debug approaches, independent tree identities and live tree arguments',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.deepEqual(p.extraParams.find(x=>x.key==='approach').options.map(x=>x.value),[1,2]);
 assert.deepEqual(p.liveArgs(p.defaultInput,{target:5}),[{__viz_type:'binary_tree',values:[2,1,4],tree_id:'root1'},{__viz_type:'binary_tree',values:[1,0,3],tree_id:'root2'},5]);
 assert.equal(p.builder('2,1,4 | 1,0,3',{target:'5'}).answer,true);
 for(const m of[1,2]){const v=build(m,{root1:[5],root2:[5],target:10}).steps.at(-1).bstPair1214View;assert.deepEqual(v.pair,['0:0','1:0']);assert.equal(v.answer,true);assert.equal(build(m,fixtures[3]).answer,false);}
});
test('both displayed Python algorithms match cross-tree brute force on examples and 120 random BST pairs',()=>{
 const cases=[...fixtures];let seed=1214;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let i=0;i<120;i++)cases.push({root1:makeTree(Array.from({length:1+rand(16)},()=>rand(41)-20)),root2:makeTree(Array.from({length:1+rand(16)},()=>rand(41)-20)),target:rand(101)-50});
 const result=python(`import json,sys
p=json.load(sys.stdin)
class TreeNode:
    def __init__(self,val):
        self.val=val
        self.left=self.right=None
def tree(values):
    nodes=iter(values)
    root=TreeNode(next(nodes))
    queue=[root]
    for parent in queue:
        for side in ('left','right'):
            value=next(nodes,None)
            if value is not None:
                child=TreeNode(value)
                setattr(parent,side,child)
                queue.append(child)
    return root
answers=[]
for code in p['codes']:
    scope={'TreeNode':TreeNode}
    exec(code,scope)
    answers.append([scope['Solution']().twoSumBSTs(tree(c['root1']),tree(c['root2']),c['target']) for c in p['cases']])
print(json.dumps(answers))`,{codes:[p.code.join('\n'),p.code2.join('\n')],cases});
 result.forEach(answers=>assert.deepEqual(answers,cases.map(oracle)));
 for(const c of cases.slice(0,30))for(const m of[1,2])assert.equal(build(m,c).answer,oracle(c),JSON.stringify(c));
});
test('every native Python line, watch, partial inorder list, stack and seen set matches the replay',()=>{
 const items=[];for(const c of fixtures.slice(0,8))for(const m of[1,2])items.push({method:'twoSumBSTs',code:(m===1?p.code:p.code2).join('\n'),treeArgs:[0,1],args:[c.root1,c.root2,c.target],m});
 const results=python(`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace(item)) for item in p['items']]))`,{path:require.resolve('../problems/picture-trace.py'),items});
 results.forEach((native,i)=>{const item=items[i],run=build(item.m,{root1:item.args[0],root2:item.args[1],target:item.args[2]});assert.equal(run.answer,native.answer);assert.equal(run.steps.length,native.events.length);
  native.events.forEach((event,j)=>{const s=run.steps[j],v=s.bstPair1214View,x={...event.outer,...event.locals};assert.deepEqual(s.codeLines,[event.line]);assert.equal(s.codeBlock,item.m);assert.equal(v.scope,event.scope);s.vars.forEach(w=>assert.deepEqual(w.value,x[w.name]??'—'));
   if(item.m===1&&event.scope==='inorder'){const owner=Number(event.locals.root.id.split(':')[0]);assert.deepEqual(v.arrays[owner].values,event.locals.values??[]);assert.deepEqual(v.stack[owner],(event.locals.stack??[]).map(n=>n.id));}
   else if(item.m===1){for(const [index,name]of['a','b'].entries())if(event.outer[name])assert.deepEqual(v.arrays[index].values,event.outer[name]);assert.deepEqual(v.pointers,[event.outer.i??null,event.outer.j??null]);}
   else{assert.deepEqual(v.seen,event.outer.seen??[]);assert.deepEqual(v.stack,[(event.outer.stack1??[]).map(n=>n.id),(event.outer.stack2??[]).map(n=>n.id)]);}
  });
 });
});
test('two-pointer decisions and hash lookups preserve real arithmetic and valid cross-tree witnesses',()=>{
 let increase=0,decrease=0,hit=0,miss=0;
 for(const c of fixtures)for(const m of[1,2]){const before=JSON.stringify(c),run=build(m,c);assert.equal(run.answer,oracle(c));assert.equal(JSON.stringify(c),before);
  for(const s of run.steps){const v=s.bstPair1214View,byId=new Map(v.trees.flat().map(n=>[n.id,n]));assert.equal(v.trees[0].length,c.root1.filter(x=>x!==null).length);assert.equal(v.trees[1].length,c.root2.filter(x=>x!==null).length);
   if(v.comparison){const q=v.comparison;assert.ok(q.a.startsWith('0:')&&q.b.startsWith('1:'));assert.equal(q.sum,q.left+q.right);assert.equal(byId.get(q.a).value,q.left);assert.equal(byId.get(q.b).value,q.right);}
   if(v.move){assert.equal(v.comparison,null);v.move==='a'?increase++:decrease++;}
   if(v.checked!==null){assert.equal(v.checked,v.seen.includes(v.need));v.checked?hit++:miss++;}
   if(v.pair){assert.ok(v.pair[0].startsWith('0:')&&v.pair[1].startsWith('1:'));assert.equal(byId.get(v.pair[0]).value+byId.get(v.pair[1]).value,c.target);}
   for(const h of v.history)assert.equal(run.steps[h.step].bstPair1214View.source,m===1?'total = a[i] + b[j]':'if need in seen:');
  }assert.equal(run.steps.at(-1).bstPair1214View.answer,run.answer);
 }assert.ok(increase&&decrease&&hit&&miss);
});
test('31-node skewed trees and billion-sized values retain complete answers without dropping source steps',()=>{
 const root1=makeTree(Array.from({length:31},(_,i)=>i-15)),root2=makeTree(Array.from({length:31},(_,i)=>1000000000-i));
 for(const m of[1,2]){const r=build(m,{root1,root2,target:999999970});assert.equal(r.answer,true);assert.equal(r.steps.at(-1).bstPair1214View.trees[0].length,31);assert.equal(r.steps.at(-1).bstPair1214View.trees[1].length,31);assert.ok(r.steps.length>100);}
});
test('rendering every source frame in both languages preserves actual node/array/set values and rewind state',()=>{
 const host={innerHTML:''},context={lang:'vi',$:()=>host,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-two-sum-bsts-1214.js'),'utf8'),context);
 for(const lang of['vi','en'])for(const m of[1,2])for(const c of fixtures.slice(0,7)){context.lang=lang;const run=build(m,c),before=JSON.stringify(run);for(const s of run.steps){const v=s.bstPair1214View;context.renderBstPair1214View(s);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);assert.equal((host.innerHTML.match(/data-bp-node=/g)||[]).length,v.trees.flat().length);assert.equal((host.innerHTML.match(/data-bp-array=/g)||[]).length,v.arrays.reduce((n,a)=>n+a.values.length,0));assert.equal((host.innerHTML.match(/data-bp-seen=/g)||[]).length,v.seen.length);assert.equal((host.innerHTML.match(/data-bp-method=/g)||[]).length,2);if(v.final)assert.match(host.innerHTML,new RegExp(`data-bp-answer="${run.answer}"`));}context.renderBstPair1214View(run.steps[0]);const first=host.innerHTML;context.renderBstPair1214View(run.steps.at(-1));context.renderBstPair1214View(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);}
});
test('strict input validation rejects disconnected/non-BST trees, invalid numbers and oversized visual demos',()=>{
 const invalid=[null,[],{},'not JSON',{root1:[],root2:[1]},{root1:[null],root2:[1]},{root1:[1,null,null,2],root2:[1]},{root1:[5,3,8,null,6],root2:[1]},{root1:[1.5],root2:[1]},{root1:[1e9+1],root2:[1]},{root1:makeTree(Array.from({length:32},(_,i)=>i)),root2:[1]}];
 for(const input of invalid)for(const m of[1,2])assert.throws(()=>build(m,input));
 for(const target of['',true,{},1.1,1e9+1,Infinity])assert.throws(()=>p.builder(p.defaultInput,{target}));
});
