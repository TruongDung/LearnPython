'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const {SUPPORTED}=require('../problems'),d=SUPPORTED[1973],m=SUPPORTED[2003];
const trees=['10,3,4,2,1','0','5','0,0,0','2,3,null,2,null','1,null,1,0','6,3,3,1,2,0,3','100000,0,100000'];
const genes=[{parents:[-1,0,0,2],nums:[1,2,3,4]},{parents:[-1,0,0,1,1,2],nums:[5,4,6,2,1,3]},{parents:[-1],nums:[1]},{parents:[-1],nums:[8]},{parents:[-1,0,1,2,3],nums:[9,7,4,1,2]},{parents:[-1,0,0],nums:[999999,1,1000000]},{parents:[-1,0,0],nums:[4,7,9]}];
trees.push([0,...Array.from({length:30},()=>[0,null]).flat()].join(','));
genes.push({parents:[-1,...Array.from({length:23},(_,j)=>j)],nums:Array.from({length:24},(_,j)=>24-j)},{parents:[-1,2,0,2],nums:[4,1,3,2]});
function python(source,payload){const proc=spawnSync('python3',['-c',source],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:64*1024*1024});assert.equal(proc.status,0,proc.stderr);return JSON.parse(proc.stdout);}
test('1973 matches every completed CPython line, all recursive locals, global answer and None returns',()=>{
 const refs=python(`import sys,json
data=json.load(sys.stdin);out=[]
class TreeNode:
 def __init__(self,val):self.val,self.left,self.right=val,None,None
def encode(v):
 if isinstance(v,TreeNode):return {'val':v.val,'left':encode(v.left),'right':encode(v.right)}
 return v
keys=['root','node','left_sum','right_sum','descendant_sum','answer']
def local(f):return {k:encode(f.f_locals[k]) for k in keys if k in f.f_locals}
for values in data['trees']:
 root=TreeNode(values[0]);nodes=[root];cursor=1
 for parent in nodes:
  for side in ('left','right'):
   if cursor<len(values) and values[cursor] is not None:
    child=TreeNode(values[cursor]);setattr(parent,side,child);nodes.append(child)
   cursor+=1
 scope={};filename='<1973>';exec(compile(data['code'],filename,'exec'),scope);events=[];pending={}
 def trace(f,event,arg):
  if f.f_code.co_filename!=filename or f.f_code.co_name not in ('dfs','equalToDescendants'):return trace
  if event in ('line','return'):
   if f in pending:
    cursor=f;outer=f;frames=[]
    while cursor:
     if cursor.f_code.co_filename==filename:
      if cursor.f_code.co_name=='equalToDescendants':outer=cursor
      if cursor.f_code.co_name=='dfs':frames.append(local(cursor))
     cursor=cursor.f_back
    events.append({'line':pending.pop(f),'scope':f.f_code.co_name,'locals':local(f),'methodLocals':local(outer),'frames':list(reversed(frames))})
   if event=='line':pending[f]=f.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().equalToDescendants(root);sys.settrace(None);out.append({'answer':answer,'events':events})
print(json.dumps(out))`,{code:d.code.join('\n'),trees:trees.map(s=>d.liveArgs(s)[0].values)});
 refs.forEach((ref,j)=>{const run=d.builder(trees[j]);assert.equal(run.answer,ref.answer);assert.equal(run.steps.length,ref.events.length,trees[j]);run.steps.forEach((s,i)=>{const v=s.descendantSum1973View,e=ref.events[i],label=`${trees[j]} event ${i} L${e.line}`;assert.deepEqual(s.codeLines,[e.line],label);assert.equal(v.scope,e.scope,label);assert.deepEqual(v.locals,e.locals,label);assert.deepEqual(v.methodLocals,e.methodLocals,label);assert.deepEqual(v.frames.map(f=>f.locals),e.frames,label);for(const w of s.vars)assert.deepEqual(w.rawValue,e.locals[w.name]??(w.name==='node'?null:'—'),label+' '+w.name);});});
});
test('2003 exact CPython trace includes failed index lookup, child-list construction, blocked continue, mex and answer updates',()=>{
 const refs=python(`import sys,json,copy
data=json.load(sys.stdin);out=[]
for case in data['cases']:
 scope={};filename='<2003>';exec(compile(data['code'],filename,'exec'),scope);events=[];pending=None
 def local(f):return {k:sorted(v) if isinstance(v,set) else copy.deepcopy(v) for k,v in f.f_locals.items() if k!='self'}
 def trace(f,event,arg):
  global pending
  if f.f_code.co_filename!=filename or f.f_code.co_name!='smallestMissingValueSubtree':return trace
  if event in ('line','return'):
   if pending is not None:events.append({'line':pending,'locals':local(f)})
   pending=f.f_lineno if event=='line' else None
  return trace
 sys.settrace(trace);answer=scope['Solution']().smallestMissingValueSubtree(case['parents'],case['nums']);sys.settrace(None);out.append({'answer':answer,'events':events})
print(json.dumps(out))`,{code:m.code.join('\n'),cases:genes});
 refs.forEach((ref,j)=>{const c=genes[j],run=m.builder(JSON.stringify(c.parents),{nums:c.nums});assert.deepEqual(run.answer,ref.answer);assert.equal(run.steps.length,ref.events.length,JSON.stringify(c));run.steps.forEach((s,i)=>{const v=s.genetic2003View,e=ref.events[i],label=`case ${j} event ${i} L${e.line}`;assert.deepEqual(s.codeLines,[e.line],label);assert.deepEqual(v.locals,e.locals,label);assert.equal(v.source.text,m.code[e.line-1]);for(const w of s.vars)assert.deepEqual(w.value,e.locals[w.name]??'—',label+' '+w.name);});});
});
function mexOracle(parents,nums){return nums.map((_,root)=>{const values=new Set();for(let id=0;id<nums.length;id++){let cursor=id;while(cursor!==-1&&cursor!==root)cursor=parents[cursor];if(cursor===root)values.add(nums[id]);}let mex=1;while(values.has(mex))mex++;return mex;});}
test('2003 answers match an independent per-subtree oracle for all increasing-parent trees up to six nodes with moved gene 1',()=>{
 function parentTrees(n,p=[-1]){if(p.length===n)return [p];return Array.from({length:p.length},(_,id)=>parentTrees(n,[...p,id])).flat();}
 for(let n=1;n<=6;n++)for(const parents of parentTrees(n))for(let shift=0;shift<=n;shift++){const nums=Array.from({length:n},(_,j)=>shift===n?j+2:(j+shift)%n+1),run=m.builder(JSON.stringify(parents),{nums});assert.deepEqual(run.answer,mexOracle(parents,nums));assert.equal(run.steps.filter(s=>s.final).length,1);const final=run.steps.at(-1).genetic2003View;assert.equal(final.event,'done');assert.equal(new Set(final.scanned).size,final.scanned.length);}
});
test('1973 and 2003 publish comparisons, counts, returned sums, scans, mex and answers only after their source statements',()=>{
 for(const input of trees){const run=d.builder(input);let previous;for(const s of run.steps){const v=s.descendantSum1973View;assert.equal(v.answer,v.nodes.filter(n=>n.counted).length);for(const n of v.nodes){if(n.subtreeSum!==null)assert.equal(n.subtreeSum,n.val+n.descendantSum);if(n.counted)assert.equal(n.match,true);}if(previous){if(v.answer!==previous.answer)assert.equal(v.event,'count');for(const n of v.nodes){const old=previous.nodes[n.id];if(old.match===null&&n.match!==null)assert.ok(['match','miss'].includes(v.event));if(old.subtreeSum===null&&n.subtreeSum!==null)assert.equal(v.event,'return');if(old.descendantSum===null&&n.descendantSum!==null)assert.equal(v.event,'combine');}}previous=v;}}
 for(const c of genes){let before;const run=m.builder(JSON.stringify(c.parents),{nums:c.nums});for(const s of run.steps){const v=s.genetic2003View;if(before){if(v.scanned.length>before.scanned.length)assert.equal(v.event,'see');if(before.mex!==null&&v.mex!==before.mex){assert.equal(v.event,'mex');assert.equal(v.mex,before.mex+1);}if(v.answer&&before.answer&&JSON.stringify(v.answer)!==JSON.stringify(before.answer))assert.equal(v.event,'write');}if(v.event==='skip'){assert.equal(v.current,v.blocked);assert.ok(v.scanned.includes(v.current));}if(v.event==='write'){assert.equal(v.seen.includes(v.mex),false);for(let g=1;g<v.mex;g++)assert.ok(v.seen.includes(g));}before=v;}assert.equal(run.steps.filter(s=>s.genetic2003View.event==='see').length,new Set(run.steps.flatMap(s=>s.genetic2003View.event==='see'?[s.genetic2003View.current]:[])).size);}
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},ctx={lang,$:()=>host,escapeHtml:x=>String(x),...extra};vm.createContext(ctx);for(const file of ['renderer-flood-pictures.js','renderer-descendants-1973.js','renderer-genetic-mex-2003.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);return {ctx,host,render:s=>{if(s.genetic2003View)ctx.renderGenetic2003Pictures(s);else ctx.renderDescendants1973Pictures(s);return host.innerHTML;}};}
test('both picture renderers show exact node identities, actual sums/counts, sets, worklists and array values in both languages and on rewind',()=>{
 for(const lang of ['vi','en']){const {render}=renderer(lang);for(const run of [...trees.map(s=>d.builder(s)),...genes.map(c=>m.builder(JSON.stringify(c.parents),{nums:c.nums}))]){const saved=JSON.stringify(run);for(const s of run.steps){const html=render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<table\b/);if(s.genetic2003View){const v=s.genetic2003View;assert.deepEqual([...html.matchAll(/data-seen-gene="(\d+)"/g)].map(m=>+m[1]),v.seen??[]);assert.deepEqual([...html.matchAll(/data-work="(\d+)"/g)].map(m=>+m[1]),v.work??[]);assert.deepEqual([...html.matchAll(/data-answer-node="(\d+)" data-answer="(\d*)"/g)].map(m=>[+m[1],m[2]]),v.nums.map((g,id)=>[id,v.answer===null?'':String(v.answer[id])]));}else{const v=s.descendantSum1973View;assert.equal(+html.match(/data-answer="(\d+)"/)[1],v.answer);assert.deepEqual([...html.matchAll(/data-node="(\d+)" data-match="(unknown|true|false)" data-counted="(true|false)" data-return="(\d*)"/g)].map(m=>[+m[1],m[2],m[3],m[4]]),v.nodes.map(n=>[n.id,n.match===null?'unknown':String(n.match),String(n.counted),n.subtreeSum===null?'':String(n.subtreeSum)]));}}const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),saved);}}
});
test('picture navigation reaches real events and safely terminates when no further increment or gene 1 exists',()=>{
 for(const [problem,run,prefix]of [[d,d.builder(d.defaultInput),'d1973'],[m,m.builder(JSON.stringify(genes[1].parents),{nums:genes[1].nums}),'m2003']]){const handlers={},host={innerHTML:'',querySelector:s=>({addEventListener:(_,fn)=>handlers[s]=fn})},{ctx,render}=renderer('vi',{$:()=>host,steps:run.steps,stepIndex:0,stopPlay(){},renderStep(){}});render(run.steps[0]);if(problem===d){handlers['#d1973NextCompare']();assert.ok(['match','miss'].includes(ctx.steps[ctx.stepIndex].descendantSum1973View.event));handlers['#d1973NextCount']();assert.equal(ctx.steps[ctx.stepIndex].descendantSum1973View.event,'count');handlers['#d1973NextReturn']();assert.equal(ctx.steps[ctx.stepIndex].descendantSum1973View.event,'return');}else{for(const [id,event]of [['Seen','see'],['Mex','mex'],['Answer','write'],['Climb','climb']]){handlers['#m2003Next'+id]();assert.equal(ctx.steps[ctx.stepIndex].genetic2003View.event,event);}}for(let j=0;j<100;j++)handlers[problem===d?'#d1973NextCount':'#m2003NextAnswer']();assert.equal(ctx.stepIndex,run.steps.length-1);}
 const {render}=renderer('vi');assert.match(render(m.builder('[-1,0]',{nums:'[4,5]'}).steps.at(-1)),/return answer/);
});
