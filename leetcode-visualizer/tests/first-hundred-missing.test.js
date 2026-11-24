"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { createRequire } = require("node:module");
const lessons = require("../problems/first-hundred-missing");
const cases = [];
function run(id,input,params={}) {
  const result=lessons[id].builder(input,params);
  assert.ok(result.steps.length);
  assert.equal(result.steps.at(-1).final,true);
  assert.ok(result.steps.every(s=>s.firstHundredView.id===id && s.codeLines.every(l=>l>0&&l<=lessons[id].code.length)));
  cases.push({id,input,params,answer:result.answer});
  return result.answer;
}
test("all IDs 1–100 are registered; all new lessons render in both languages",()=>{
  const {SUPPORTED}=require("../problems");
  for(let id=1;id<=100;id++)assert.equal(typeof SUPPORTED[id]?.builder,"function",`#${id}`);
  const context=vm.createContext({lang:"en",pick:x=>typeof x==="object"?x[context.lang]:x,escapeHtml:s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),$:()=>context.element,element:{innerHTML:""}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../public/renderer-first-hundred.js"),"utf8"),context);
  for(const p of Object.values(lessons)){
    const input=p.inputKind==="string"?p.defaultInput:p.defaultInput.split(",").map(Number),params=Object.fromEntries(p.extraParams.map(x=>[x.key,x.default]));
    const result=p.builder(input,params);
    for(const language of ["vi","en"])for(const step of result.steps){context.lang=language;context.renderFirstHundredView(step);assert.match(context.element.innerHTML,/fh-viz/);assert.doesNotMatch(context.element.innerHTML,/undefined|NaN/);}
    cases.push({id:p.id,input,params,answer:result.answer});
  }
});
test("zigzag examples, single row, tall grid and literal input",()=>{
  assert.equal(run(6,"PAYPALISHIRING",{numRows:4}),"PINALSIGYAHRPI");
  assert.equal(run(6,"ABCD",{numRows:1}),"ABCD");
  assert.equal(run(6,"AB",{numRows:20}),"AB");
  assert.equal(run(6,"A,B.C",{numRows:2}),"ABC,.");
  for(let n=2;n<=8;n++){const s="ABCDEFGHIJKLMNOPQRSTUVWXYZ";const expected=Array.from({length:n},()=>[]);for(let i=0;i<s.length;i++){const k=i%(2*n-2);expected[Math.min(k,2*n-2-k)].push(s[i]);}assert.equal(run(6,s,{numRows:n}),expected.flat().join(""));}
  assert.throws(()=>run(6,"<script>",{numRows:3}));
});
test("Roman subtractive pairs and bounds",()=>{
  for(const [n,s]of [[1,"I"],[4,"IV"],[9,"IX"],[40,"XL"],[90,"XC"],[400,"CD"],[900,"CM"],[58,"LVIII"],[1994,"MCMXCIV"],[3999,"MMMCMXCIX"]])assert.equal(run(12,[n]),s);
  assert.throws(()=>run(12,[0]));assert.throws(()=>run(12,[4000]));
});
test("count and say terms are generated from runs",()=>{
  ["1","11","21","1211","111221","312211","13112221","1113213211","31131211131221","13211311123113112211"].forEach((s,i)=>assert.equal(run(38,[i+1]),s));
  assert.throws(()=>run(38,[11]));
});
test("jump frontiers match a shortest-path oracle",()=>{
  for(let mask=0;mask<256;mask++){
    const a=Array.from({length:5},(_,i)=>i===4?0:(mask>>(i*2))&3),dist=Array(5).fill(Infinity);dist[0]=0;
    for(let i=0;i<5;i++)for(let j=i+1;j<=Math.min(4,i+a[i]);j++)dist[j]=Math.min(dist[j],dist[i]+1);
    if(Number.isFinite(dist[4]))assert.equal(run(45,a),dist[4]);else assert.throws(()=>lessons[45].builder(a));
  }
  assert.equal(run(45,[0]),0);assert.equal(run(45,[1,0]),1);
});
test("spiral fills every number once and follows the clockwise boundary",()=>{
  assert.deepEqual(run(59,[1]),[[1]]);
  assert.deepEqual(run(59,[3]),[[1,2,3],[8,9,4],[7,6,5]]);
  for(let n=2;n<=12;n++){
    const matrix=run(59,[n]);assert.deepEqual([...matrix.flat()].sort((a,b)=>a-b),Array.from({length:n*n},(_,i)=>i+1));
    const positions=new Map(matrix.flatMap((row,r)=>row.map((v,c)=>[v,[r,c]])));
    for(let v=1;v<n*n;v++){const a=positions.get(v),b=positions.get(v+1);assert.equal(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]),1);}
  }
});
test("permutation ranks match exhaustive lexicographic enumeration",()=>{
  function perms(a){return a.length?a.flatMap((v,i)=>perms(a.filter((_,j)=>j!==i)).map(s=>v+s)):[""];}
  for(let n=1;n<=4;n++)perms(Array.from({length:n},(_,i)=>i+1)).forEach((s,i)=>assert.equal(run(60,[n],{k:i+1}),s));
  assert.equal(run(60,[9],{k:362880}),"987654321");assert.throws(()=>run(60,[3],{k:7}));
});
test("list partition preserves stable node identities including empty input",()=>{
  for(const [a,x]of [[[],3],[[1,4,3,2,5,2],3],[[3,1,3,1],3],[[-1,0,-2,4],0],[[7,7],1]]){
    const r=lessons[86].builder(JSON.stringify(a),{x}),nodes=r.steps.at(-1).firstHundredView.rows[0].items;
    assert.deepEqual(run(86,JSON.stringify(a),{x}),[...a.filter(v=>v<x),...a.filter(v=>v>=x)]);
    assert.deepEqual(nodes.map(v=>v.sub),[...a.map((v,i)=>({v,i})).filter(o=>o.v<x),...a.map((v,i)=>({v,i})).filter(o=>o.v>=x)].map(o=>`#${o.i}`));
  }
  assert.throws(()=>run(86,"1,,2",{x:3}));assert.throws(()=>run(86,"null",{x:3}));
});
test("Gray codes cover all values and change exactly one bit including wraparound",()=>{
  for(let n=1;n<=8;n++){const a=run(89,[n]);assert.equal(a.length,2**n);assert.equal(new Set(a).size,a.length);assert.equal(a[0],0);a.forEach((v,i)=>{const d=v^a[(i+1)%a.length];assert.equal(d&(d-1),0);assert.ok(d);});}
});
test("IP search handles leading zeros, impossible lengths and independent dot placements",()=>{
  function oracle(s){const out=[];for(let i=1;i<s.length;i++)for(let j=i+1;j<s.length;j++)for(let k=j+1;k<s.length;k++){const parts=[s.slice(0,i),s.slice(i,j),s.slice(j,k),s.slice(k)];if(parts.every(p=>p.length<=3&&Number(p)<=255&&(p.length===1||p[0]!=="0")))out.push(parts.join("."));}return out.sort();}
  for(const s of ["25525511135","0000","101023","010010","1111","1","12345678901234567890","999999999999","256256256256","00000"])assert.deepEqual(run(93,s).sort(),oracle(s));
});
test("BST enumeration has unique valid trees and agrees with Catalan counts",()=>{
  function inorder(a){const nodes=a.map(v=>v===null?null:{v}),q=[nodes[0]];let i=1;for(let p=0;p<q.length;p++)for(const side of ["left","right"]){if(i>=nodes.length)break;q[p][side]=nodes[i++];if(q[p][side])q.push(q[p][side]);}const values=[];function walk(t){if(t){walk(t.left);values.push(t.v);walk(t.right);}}walk(q[0]);return values;}
  const catalan=[1,1,2,5,14,42];
  for(let n=1;n<=5;n++){const trees=run(95,[n]);assert.equal(trees.length,catalan[n]);assert.equal(new Set(trees.map(JSON.stringify)).size,trees.length);for(const t of trees)assert.deepEqual(inorder(t),Array.from({length:n},(_,i)=>i+1));assert.equal(run(96,[n]),trees.length);}
  assert.equal(run(96,[19]),1767263190);assert.throws(()=>run(95,[6]));
});
const python=process.env.LEETCODE_PYTHON;
test("server catalog, metadata, solve, live args, validation and lazy assets integrate",()=>{
  const routes=new Map(),app={use(){},get(url,fn){routes.set(`GET ${url}`,fn);},post(url,fn){routes.set(`POST ${url}`,fn);},listen(){}};
  const express=()=>app;express.json=express.static=()=>()=>{};
  const file=path.join(__dirname,"../server.js"),localRequire=createRequire(file);
  vm.runInNewContext(fs.readFileSync(file,"utf8"),{require:name=>name==="express"?express:name==="compression"?()=>()=>{}:localRequire(name),__dirname:path.dirname(file),process:{env:{}},console});
  function request(key,id,body={}){const response={statusCode:200,status(code){this.statusCode=code;return this;},json(value){this.body=value;return this;}};routes.get(key)({params:{id},body},response);return response;}
  const catalog=request("GET /api/problems").body;
  const html=fs.readFileSync(path.join(__dirname,"../public/index.html"),"utf8");
  const script=fs.readFileSync(path.join(__dirname,"../public/script.js"),"utf8");
  assert.match(script,/predicate: \(step\) => Boolean\(step.firstHundredView\)/);
  assert.match(html,/script\.js\?firstHundred=11-v1&/);
  for(const p of Object.values(lessons)){
    assert.ok(JSON.stringify(catalog).includes(`"id":${p.id},`),`catalog #${p.id}`);
    const metadata=request("GET /api/problem/:id",p.id);assert.equal(metadata.body.debugMode,"semantic");assert.equal(metadata.body.hasLiveArgs,true);
    const input=p.inputKind==="string"?p.defaultInput:p.defaultInput.split(",").map(Number),params=Object.fromEntries(p.extraParams.map(x=>[x.key,x.default]));
    const solve=request("POST /api/problem/:id/solve",p.id,{input,params});assert.equal(solve.statusCode,200,JSON.stringify(solve.body));assert.deepEqual(solve.body.answer,p.builder(input,params).answer);assert.ok(solve.body.steps.every(s=>s.codeBlock===1));
    const live=request("POST /api/problem/:id/live-args",p.id,{input,params});assert.equal(live.statusCode,200);assert.deepEqual(live.body.args,p.liveArgs(input,params));
    for(const asset of ["first-hundred.css","renderer-first-hundred.js"]){const tag=html.split("\n").find(line=>line.includes(asset));assert.ok(tag.includes(`data-problem-ids="6 12 38 45 59 60 86 89 93 95 96"`));}
  }
  assert.equal(request("POST /api/problem/:id/solve",86,{input:"[]",params:{x:3}}).statusCode,200);
  assert.equal(request("POST /api/problem/:id/solve",60,{input:[3],params:{k:7}}).statusCode,400);
  assert.equal(request("POST /api/problem/:id/solve",6,{input:"ABC",params:{numRows:0}}).statusCode,400);
});
test("displayed Python solutions agree with builders for all tested cases",{skip:!python},()=>{
  const program=`import json,sys\nfrom typing import Optional\nclass ListNode:\n def __init__(self,val=0,next=None): self.val,self.next=val,next\nclass TreeNode:\n def __init__(self,val=0,left=None,right=None): self.val,self.left,self.right=val,left,right\ndef linked(a):\n head=None\n for v in reversed(a): head=ListNode(v,head)\n return head\ndef serial(t):\n if t is None: return []\n q=[t];out=[]\n for node in q:\n  out.append(node.val if node else None)\n  if node: q.extend([node.left,node.right])\n while out and out[-1] is None: out.pop()\n return out\nresults=[]\nfor case in json.load(sys.stdin):\n scope=dict(globals());exec(case['code'],scope)\n args=case['args']\n if case['id']==86: args[0]=linked(args[0]['values'])\n obj=scope['Solution']();method=next(v for k,v in scope['Solution'].__dict__.items() if not k.startswith('_'))\n result=method(obj,*args)\n if case['id']==86:\n  a=[]\n  while result: a.append(result.val);result=result.next\n  result=a\n if case['id']==95: result=[serial(t) for t in result]\n results.append(result)\nprint(json.dumps(results))`;
  const payload=cases.map(c=>({...c,code:lessons[c.id].code.join("\n"),args:lessons[c.id].liveArgs(c.input,c.params)}));
  const result=spawnSync(python,["-c",program],{input:JSON.stringify(payload),encoding:"utf8",maxBuffer:8*1024*1024});
  assert.equal(result.status,0,result.stderr);const answers=JSON.parse(result.stdout);
  cases.forEach((c,i)=>assert.deepEqual(answers[i],c.answer,`Python #${c.id} ${JSON.stringify(c.input)}`));
});
