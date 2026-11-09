'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[654],run=(a=p.defaultInput)=>p.builder(a),view=s=>s.maximumTreeView;
let seed=654;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function oracle(a){if(!a.length)return null;const val=Math.max(...a),i=a.indexOf(val);return {val,left:oracle(a.slice(0,i)),right:oracle(a.slice(i+1))};}
function strip(node){return node?{val:node.val,left:strip(node.left),right:strip(node.right)}:null;}
function serialize(root){const q=[root],out=[];for(let i=0;i<q.length;i++){const node=q[i];out.push(node?node.val:null);if(node)q.push(node.left,node.right);}while(out.at(-1)===null)out.pop();return out;}
function edges(v){return v.nodes.flatMap(n=>['left','right'].filter(side=>n[side]!==null).map(side=>[n.id,side,n[side]]));}
function nativeNodes(v){const found=new Map(),a=v.values;function walk(o){if(Array.isArray(o)){o.forEach(walk);return;}if(!o||o.type!=='TreeNode')return;const id=a.indexOf(o.val);const row={id,value:o.val,left:o.left?a.indexOf(o.left.val):null,right:o.right?a.indexOf(o.right.val):null};if(found.has(id)){assert.deepEqual(found.get(id),row);return;}found.set(id,row);walk(o.left);walk(o.right);}for(const frame of v.frames){Object.values(frame.locals).forEach(walk);if(frame.name==='__init__')walk({type:'TreeNode',...frame.locals.self});}walk(v.returned);return [...found.values()].sort((a,b)=>a.id-b.id);}
function ui(lang='vi',extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-maximum-tree-654.js'),'utf8'),ctx);return {ctx,render:(s,options)=>{ctx.renderMaximumTree654(s,options);return host.innerHTML;}};}
test('654 returns the complete maximum tree and replays all Python statements, including construction',()=>{
  const r=run();assert.deepEqual(r.answer,[6,3,5,null,2,0,null,null,1]);assert.equal(p.debugMode,'line-by-line');assert.equal(p.complexity.time,'O(n)');assert.equal(p.complexity.space,'O(n)');assert.equal(r.steps.filter(s=>s.final).length,1);assert.equal(view(r.steps.at(-1)).trace.truncated,false);
  assert.equal(r.steps.filter(s=>view(s).change?.kind==='create').length,6);
  for(const s of r.steps){const v=view(s);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(p.code[s.codeLines[0]-1].trim(),v.source.text);if(v.scope==='__init__'){assert.equal(s.final,false);assert.ok(v.locals.self);}}
});
test('maximum tree agrees with independent recursive maximum splitting for varied and randomized distinct inputs',()=>{
  const cases=[[3,2,1,6,0,5],[3,1,2],[0],[1000],Array.from({length:14},(_,i)=>i),Array.from({length:14},(_,i)=>14-i),[2,7,1,4,3,6,0]];
  for(let k=0;k<80;k++){const a=Array.from({length:1+rand(14)},(_,i)=>i*3);for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}cases.push(a);}
  for(const a of cases){const r=run(a),expected=oracle(a),last=view(r.steps.at(-1));assert.deepEqual(strip(r.nativeAnswer),expected);assert.deepEqual(r.answer,serialize(expected));assert.deepEqual(last.inorder,a);assert.equal(last.root,a.indexOf(Math.max(...a)));assert.equal(last.nodes.length,a.length);for(const node of last.nodes)for(const side of ['left','right'])if(node[side]!==null){assert.ok(node.value>a[node[side]]);assert.ok(side==='left'?node[side]<node.id:node[side]>node.id);}}
});
test('Python stack construction matches recursive splitting for every permutation up to size seven',()=>{
  const script=`from itertools import permutations\n${p.code.join('\n')}\ndef shape(node):\n return None if node is None else (node.val,shape(node.left),shape(node.right))\ndef expected(a):\n if not a:return None\n m=max(a);i=a.index(m)\n return (m,expected(a[:i]),expected(a[i+1:]))\nfor n in range(1,8):\n for a in permutations(range(n)):\n  assert shape(Solution().constructMaximumBinaryTree(list(a)))==expected(a),a\nprint('all small permutations passed')`;
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{encoding:'utf8'});assert.equal(ref.status,0,ref.stderr);
});
test('every visible pointer, node, stack binding and constructor state is captured from native Python',()=>{
  for(const a of [[3,2,1,6,0,5],[3,1,2],[1,2,3,4],[4,3,2,1],[0]])for(const s of run(a).steps){const v=view(s),x=v.outer;
    assert.deepEqual(v.nodes.map(({id,value,left,right})=>({id,value,left,right})),nativeNodes(v));
    assert.deepEqual(v.stack,x.stack?x.stack.map(n=>a.indexOf(n.val)):null);
    assert.equal(v.node,x.node?a.indexOf(x.node.val):null);assert.equal(v.popped,x.popped?a.indexOf(x.popped.val):null);
    if(v.constructing!==null)assert.equal(a[v.constructing],v.locals.self.val);
    if(v.inorder.length)assert.deepEqual(v.inorder,a.slice(0,v.nodes.length));
    for(const n of v.nodes){assert.ok(Number.isInteger(n.depth));for(const side of ['left','right'])if(n[side]!==null)assert.ok(v.nodes[n[side]].depth>n.depth);}
  }
});
test('popping never removes or rewrites a tree node; each native link changes exactly one pointer',()=>{
  let shared=false,replaced=false;
  for(const a of [[3,2,1,6,0,5],[3,1,2],[2,7,1,4,3,6,0]]){let previous;for(const s of run(a).steps){const v=view(s);
    if(v.change?.kind==='pop'){assert.deepEqual(edges(v),edges(previous));assert.equal(v.nodes.length,previous.nodes.length);assert.equal(v.held,v.change.index);assert.equal(v.stack.length,previous.stack.length-1);assert.equal(v.stack.includes(v.held),false);}
    if(v.change?.kind==='link'){const expected=previous.nodes.map(n=>({...n})),c=v.change;assert.equal(c.before,expected[c.from][c.side]);expected[c.from][c.side]=c.to;assert.deepEqual(v.nodes.map(({id,value,left,right})=>({id,value,left,right})),expected.map(({id,value,left,right})=>({id,value,left,right})));if(c.before!==null)replaced=true;}
    if(v.nodes.some(n=>n.incoming>1))shared=true;
    if(v.change?.kind==='push'){assert.ok(v.stack.every((id,i)=>!i||a[v.stack[i-1]]>a[id]));const spine=[];for(let node=v.nodes[v.stack[0]];node;node=node.right===null?null:v.nodes[node.right])spine.push(node.id);assert.deepEqual(v.stack,spine);}
    previous=v;
  }}assert.ok(shared);assert.ok(replaced);
});
test('source events, object locals, self state, suspended frames, branches and returned objects match CPython',()=>{
  const inputs=[[3,2,1,6,0,5],[3,1,2],[0]],items=inputs.map(a=>({code:p.code.join('\n'),method:'constructMaximumBinaryTree',args:[a],objectClasses:['TreeNode'],stateClasses:['TreeNode']}));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(inputs[i]);assert.deepEqual(r.nativeAnswer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const s=r.steps[j],v=view(s);assert.deepEqual(s.codeLines,[e.line]);for(const key of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[key],e[key],`${i}/${j}/${key}`);for(const watch of s.vars)assert.deepEqual(watch.rawValue,e.locals[watch.name]);});});
});
test('all presets and skewed trees render every frame in VI/EN, preserve data and rewind deterministically',()=>{
  const cases=vm.runInContext('MT654_CASES',ui().ctx).map(c=>Array.from(c[0]));cases.push(Array.from({length:14},(_,i)=>i),Array.from({length:14},(_,i)=>1000-i));
  for(const a of cases){const r=run(a),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){const renderer=ui(lang),first=renderer.render(r.steps[0]);for(const s of r.steps){const html=renderer.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${s.codeLines[0]}"`));for(const n of view(s).nodes)assert.ok(html.includes(`data-node-id="${n.id}" data-node-value="${n.value}" data-node-left="${n.left??''}" data-node-right="${n.right??''}"`));}assert.equal(renderer.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),saved);}
});
test('inspecting nodes shows their current native children without modifying snapshots',()=>{
  const r=run(),renderer=ui();for(const s of r.steps){const saved=JSON.stringify(s),v=view(s);for(const n of v.nodes){const html=renderer.render(s,{selected:n.id});assert.ok(html.includes(`data-inspect-id="${n.id}" data-inspect-left="${n.left??''}" data-inspect-right="${n.right??''}"`));}assert.equal(JSON.stringify(s),saved);}
});
test('distinct, nonnegative integer limits reject malformed and sparse inputs while preserving caller arrays',()=>{
  for(const a of ['',[],Array(2),'1,,2',[NaN],[true],[null],[-1],[1001],[1.5],[2,2],Array.from({length:15},(_,i)=>i),'[1,]'])assert.throws(()=>run(a));
  for(const a of [[0],[3,2,1,6,0,5]]){const saved=JSON.stringify(a);run(a);assert.equal(JSON.stringify(a),saved);assert.deepEqual(p.liveArgs(JSON.stringify(a)),[a]);assert.deepEqual(p.liveArgs(a.join(',')),[a]);}
});
test('create, pop, link, line and result controls land on native events and disable missing future events',()=>{
  const r=run(),renderer=ui('vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});for(const kind of ['line','create','pop','link','result']){renderer.ctx.stepIndex=0;const target=renderer.ctx.mt654Next(kind);assert.ok(target>0);renderer.ctx.mt654Go(target);assert.equal(renderer.ctx.stepIndex,target);if(kind==='result')assert.equal(r.steps[target].final,true);}renderer.ctx.stepIndex=r.steps.length-1;for(const kind of ['line','create','pop','link','result'])assert.equal(renderer.ctx.mt654Next(kind),-1);
});
test('654 assets are lazy and the dedicated tree renderer precedes shared fallbacks',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/renderer-maximum-tree-654|maximum-tree-654\.css/);
  for(const asset of ['renderer-maximum-tree-654.js','maximum-tree-654.css','tree-replay-pictures.css'])assert.match(html.split('\n').find(line=>line.includes(asset)),/data-problem-ids="[^"]*654/);
  const script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');assert.match(script,/Boolean\(step.maximumTreeView\), surface: "treeView", render: \(step\) => \{ renderMaximumTree654\(step\); \}/);
});
