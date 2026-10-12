const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[653];
function bstInput(values) {
  let root=null;
  for(const value of values) {
    const node={val:value,left:null,right:null};if(!root){root=node;continue;}
    let current=root;
    for(;;){const side=value<current.val?'left':'right';if(!current[side]){current[side]=node;break;}current=current[side];}
  }
  if(!root)return [];const queue=[root],out=[];
  for(let i=0;i<queue.length;i++){const n=queue[i];out.push(n?n.val:null);if(n)queue.push(n.left,n.right);}
  while(out.at(-1)===null)out.pop();return out;
}
function oracle(values,k) {for(let i=0;i<values.length;i++)for(let j=i+1;j<values.length;j++)if(values[i]+values[j]===k)return true;return false;}
test('653 both approaches match distinct-node enumeration for sparse, negative, duplicate and random BSTs',()=>{
  const cases=[{values:[5,3,6,2,4,7],k:9},{values:[5,3,6,2,4,7],k:28},{values:[1],k:2},{values:[2,2,3],k:4},{values:[-2,-3,-1],k:-4},{values:[],k:0}];
  for(let seed=1;seed<=60;seed++){let x=seed;const values=Array.from({length:12},()=>{x=(x*1664525+1013904223)>>>0;return x%41-20;});cases.push({values,k:seed-30});}
  for(const {values,k} of cases)for(const builder of [p.builder,p.builder2]) {
    const input=bstInput(values),before=JSON.stringify(input),r=builder(input,{k}),last=r.steps.at(-1).bstTwoSum653View;
    assert.equal(r.answer,oracle(values,k));assert.equal(last.answer,r.answer);assert.equal(JSON.stringify(input),before);
    if(r.answer){assert.notEqual(last.pair[0].id,last.pair[1].id);assert.equal(last.pair[0].value+last.pair[1].value,k);}
  }
  for(const builder of [p.builder,p.builder2])assert.equal(builder('2,null,3,null,4',{k:6}).answer,true);
});
test('653 inorder grows in order and pointer movements discard the correct side',()=>{
  const input='5,3,6,2,4,null,7',sorted=[2,3,4,5,6,7];
  for(const k of [4,6,9,11,28]) {
    const r=p.builder(input,{k});let appended=0,moves=0;
    for(let i=0;i<r.steps.length;i++){
      const v=r.steps[i].bstTwoSum653View;
      assert.equal(r.steps[i].codeBlock,1);assert.ok(r.steps[i].codeLines.every(n=>n>=1&&n<=p.code.length));
      if(v.phase==='init')assert.deepEqual(v.values,[]);
      if(v.phase==='inorder'){appended++;assert.deepEqual(v.values.map(n=>n.value),sorted.slice(0,appended));assert.equal(v.current.value,sorted[appended-1]);}
      if(v.sum!==null){assert.ok(v.left<v.right);assert.equal(v.sum,sorted[v.left]+sorted[v.right]);}
      if(v.phase==='move'){
        const next=r.steps[i+1].bstTwoSum653View;moves++;
        if(v.move==='left'){assert.ok(v.sum<k);assert.equal(next.left,v.left+1);assert.equal(next.right,v.right);}
        else{assert.ok(v.sum>k);assert.equal(next.right,v.right-1);assert.equal(next.left,v.left);}
      }
    }
    assert.equal(appended,6);if(k!==9)assert.ok(moves>0);
  }
});
test('653 hash lookup happens before insertion and final matching node identities persist',()=>{
  const r=p.builder2('5,3,6,2,4,null,7',{k:9}),visited=new Map();
  for(const step of r.steps) {
    const v=step.bstTwoSum653View;assert.equal(step.codeBlock,2);assert.ok(step.codeLines.every(n=>n>=1&&n<=p.code2.length));
    if(v.phase==='need'||v.phase==='check'){
      assert.equal(v.need,v.target-v.current.value);assert.deepEqual(v.seen.map(n=>n.value),[...visited.keys()]);
      assert.ok(v.seen.every(n=>n.id!==v.current.id));
    }
    if(v.phase==='check')assert.equal(v.checked,visited.has(v.need));
    if(v.phase==='add')visited.set(v.current.value,v.current.id);
  }
  const last=r.steps.at(-1).bstTwoSum653View,found=r.steps.find(s=>s.bstTwoSum653View.phase==='found').bstTwoSum653View;
  assert.deepEqual(last.pair,found.pair);assert.equal(last.tree.filter(n=>n.role==='match').length,2);
  const single=p.builder2('5',{k:10});assert.equal(single.answer,false);assert.ok(single.steps.every(s=>s.bstTwoSum653View.tree.every(n=>n.role!=='partner'&&n.role!=='match')));
});
test('653 handles a 10000-node skewed BST without recursion and bounds its trace payload',()=>{
  const input=[];for(let i=0;i<10000;i++){if(i)input.push(null);input.push(i);}
  for(const builder of [p.builder,p.builder2]) {
    const r=builder(input,{k:30000}),last=r.steps.at(-1).bstTwoSum653View;
    assert.equal(r.answer,false);assert.equal(last.total,10000);assert.ok(last.omitted>0);assert.ok(r.steps.length<=601);
    assert.ok(r.steps.every(s=>s.bstTwoSum653View.tree.length<=63&&s.bstTwoSum653View.values.length<=24&&s.bstTwoSum653View.seen.length<=24));
    assert.ok(JSON.stringify(r).length<8000000);
  }
});
test('653 validates BST structure and supports compact and JSON level-order inputs',()=>{
  assert.equal(p.builder('[2,null,3,null,4]',{k:6}).answer,true);
  for(const input of ['2,3,1','2,null,null,4','2,,3','[1',null,[[1]],'10001'])assert.throws(()=>p.builder(input,{k:3}),/653/);
  for(const k of [1.5,100001,-100001,NaN])assert.throws(()=>p.builder('1',{k}),/653/);
  assert.equal(p.extraParams.find(n=>n.key==='k').allowNegative,true);
});
test('653 Python snippets agree with both algorithms for official and sparse examples',()=>{
  const setup='class TreeNode:\n    def __init__(self, val):\n        self.val, self.left, self.right = val, None, None\n\ndef make(values):\n    if not values: return None\n    root = TreeNode(values[0])\n    queue, i = [root], 1\n    for parent in queue:\n        for side in ("left", "right"):\n            if i >= len(values): break\n            value = values[i]\n            i += 1\n            if value is not None:\n                child = TreeNode(value)\n                setattr(parent, side, child)\n                queue.append(child)\n    return root\n';
  for(const [code,builder] of [[p.code,p.builder],[p.code2,p.builder2]]) {
    const cases=[[[5,3,6,2,4,null,7],9],[[5,3,6,2,4,null,7],28],[[2,null,3,null,4],6],[[1],2],[[-2,-3,-1],-4]];
    const checks=cases.map(([input,k])=>'assert Solution().findTarget(make('+JSON.stringify(input).replaceAll('null','None')+'), '+k+') == '+(builder(input,{k}).answer?'True':'False'));
    const run=spawnSync('python3',['-c',setup+code.join('\n')+'\n'+checks.join('\n')],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  }
});
test('653 renderer draws real tree edges, preserves final pairs and handles both languages',()=>{
  const element={innerHTML:''},context={$:()=>element,escapeHtml:String,lang:'en'};vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-two-sum-bst-653.js'),'utf8'),context);
  for(const lang of ['en','vi'])for(const builder of [p.builder,p.builder2])for(const input of ['5,3,6,2,4,null,7','1','null'])for(const k of [9,10,28]){
    context.lang=lang;for(const step of builder(input,{k}).steps){
      context.renderTwoSumBst653View(step);assert.doesNotMatch(element.innerHTML,/undefined|NaN|Infinity|object Object/);
      const v=step.bstTwoSum653View;
      if(v.total===6)assert.equal((element.innerHTML.match(/<line /g)||[]).length,5);
      if(v.phase==='done'&&!v.answer){assert.match(element.innerHTML,/× false/);assert.doesNotMatch(element.innerHTML,/bs653-equation success/);}
      if(v.phase==='done'&&v.answer){assert.match(element.innerHTML,/bs653-equation success/);assert.equal((element.innerHTML.match(/<g class="match /g)||[]).length,2);}
    }
  }
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  assert.match(html,/two-sum-bst-653\.css/);assert.match(html,/renderer-two-sum-bst-653\.js/);assert.match(script,/Boolean\(step\.bstTwoSum653View\)/);
});
