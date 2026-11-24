"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { createRequire } = require("node:module");
const lessons = Object.assign({},require("../problems/catalog-100-199"),require("../problems/catalog-200-299"),require("../problems/catalog-300-399"),require("../problems/catalog-400-500"));
const results = new Map();
const run = (id,args) => lessons[id].builder(JSON.stringify(args));
const answer = (id,args) => run(id,args).answer;
let seed=105;
const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function expected(actual,reference,message){
  if(reference?.oneOf)assert.ok(reference.oneOf.includes(actual),message);
  else if(reference?.permutation)assert.deepEqual([...actual].sort(),[...reference.permutation].sort(),message);
  else if(reference?.disk){const[r,x,y]=reference.disk;assert.ok(actual.length===2&&(actual[0]-x)**2+(actual[1]-y)**2<=r*r+1e-12,message);}
  else assert.deepEqual(actual,reference,message);
}
test("all 172 new lessons execute their example and all 1–500 IDs have a builder",()=>{
  const {SUPPORTED}=require("../problems");
  assert.equal(Object.keys(lessons).length,172);
  for(let id=1;id<=500;id++)assert.equal(typeof SUPPORTED[id]?.builder,"function",`Missing #${id}`);
  for(const p of Object.values(lessons)){
    assert.equal(SUPPORTED[p.id],p);
    assert.notEqual(p.complexity.time,"See algorithm");
    const result=p.builder(p.defaultInput);results.set(p.id,result);
    expected(result.answer,p.__catalog.expected,`Example #${p.id}`);
    assert.equal(result.steps.filter(s=>s.final).length,1);
    assert.equal(result.steps.at(-1).final,true);
    assert.equal(result.steps.at(-1).catalogLessonView.trace.truncated,false);
    for(const s of result.steps){assert.equal(s.catalogLessonView.id,p.id);assert.deepEqual(s.codeLines,[s.catalogLessonView.line]);assert.equal(s.catalogLessonView.source,p.code[s.codeLines[0]-1]);}
  }
});
test("every recorded frame renders as escaped pictures in VI and EN without changing snapshots",()=>{
  const host={innerHTML:""},ctx=vm.createContext({lang:"en",$:()=>host,problemData:{code:[]}});
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-catalog-lessons.js"),"utf8"),ctx);
  for(const p of Object.values(lessons)){
    const result=results.get(p.id)||p.builder(p.defaultInput),first=JSON.stringify(result.steps[0]);ctx.problemData=p;
    for(const language of ["vi","en"]){ctx.lang=language;for(const step of result.steps){ctx.renderCatalogLesson(step);assert.ok(host.innerHTML.includes(`data-lesson-id="${p.id}"`));assert.doesNotMatch(host.innerHTML,/NaN|undefined|\[object Object\]|<script|<img/);}}
    assert.equal(JSON.stringify(result.steps[0]),first);
    if([105,106,142,147,222,328,369,382,431,445,449].includes(p.id))assert.ok(result.steps.some(s=>s.catalogLessonView.objects.length),`Node pictures #${p.id}`);
  }
  const unsafe=run(161,['<img src=x onerror=alert(1)>','<img src=x onerror=alert(1)>!']).steps;
  for(const step of unsafe){ctx.renderCatalogLesson(step);assert.doesNotMatch(host.innerHTML,/<img|onerror="/);}
});
test("native CPython and the WASM runtime agree for all 172 default solutions",()=>{
  const python=process.env.PYTHON||path.resolve(__dirname,"../../.venv/Scripts/python.exe");
  const prelude=require("../problems/catalog-context");
  const payloads=Object.values(lessons).map(p=>{const e=p.__catalog;return{code:p.code.join("\n"),method:e.method,args:e.sample,prelude:prelude+"\n_viz_config = json.loads("+JSON.stringify(JSON.stringify({kinds:e.kinds||[],answerKind:e.answerKind}))+ ")\n",randomSeed:e.seed??105,maxEvents:e.traceOptions?.maxEvents||6000,failOnTruncate:true,summarizeLocals:e.traceOptions?.summarizeLocals||{},captureAllocations:["TreeNode","ListNode","Node"],stateClasses:["Solution"],objectClasses:["TreeNode","ListNode","Node"]};});
  const program="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nresults=[]\nfor payload in p['payloads']:\n r=json.loads(f(payload));results.append({'answer':r['answer'],'events':[[e['line'],e['scope'],e['branch'],e['returning']] for e in r['events']]})\nprint(json.dumps(results))";
  const native=spawnSync(python,["-c",program],{input:JSON.stringify({path:require.resolve("../problems/picture-trace.py"),payloads}),encoding:"utf8",maxBuffer:32e6});
  assert.equal(native.status,0,native.stderr);
  JSON.parse(native.stdout).forEach((reference,i)=>{
    const p=Object.values(lessons)[i],result=results.get(p.id)||p.builder(p.defaultInput);
    if(p.id===478)result.answer.forEach((v,j)=>assert.ok(Math.abs(v-reference.answer[j])<1e-12));else assert.deepEqual(result.answer,reference.answer,`Native answer #${p.id}`);
    // CPython versions can attribute a final return to an exhausted loop rather
    // than emit a separate return-line event. Compare data-changing statement
    // order, while each WASM frame's source alignment is checked above.
    const meaningful=([line])=>!/^\s*(?:if|elif|else|while|for|return|assert|def|class|import|from|break|continue|nonlocal|@)\b/.test(p.code[line-1]);
    const recorded=result.steps.map(s=>[s.catalogLessonView.line,s.catalogLessonView.frames.at(-1).name]);
    assert.deepEqual(recorded.filter(meaningful),reference.events.filter(meaningful).map(e=>e.slice(0,2)),`Native statement order #${p.id}`);
  });
});
function serialize(root){if(!root)return[];const queue=[root],values=[];for(const node of queue){values.push(node?node.value:null);if(node)queue.push(node.left,node.right);}while(values.at(-1)===null)values.pop();return values;}
function traversals(root){const pre=[],ino=[],post=[];function visit(n){if(!n)return;pre.push(n.value);visit(n.left);ino.push(n.value);visit(n.right);post.push(n.value);}visit(root);return{pre,ino,post};}
test("105/106 reconstruct random asymmetric trees, reject inconsistent traversals, and preserve input",()=>{
  function tree(values){if(!values.length)return null;const split=random(values.length);return{value:values[0],left:tree(values.slice(1,split+1)),right:tree(values.slice(split+1))};}
  for(let k=0;k<35;k++){const values=Array.from({length:random(13)},(_,i)=>i-6).sort(()=>random(3)-1),root=tree(values),{pre,ino,post}=traversals(root),expected=serialize(root);assert.deepEqual(answer(105,[pre,ino]),expected);assert.deepEqual(answer(106,[ino,post]),expected);}
  for(const id of[105,106]){assert.throws(()=>answer(id,[[1,2],[2,3]]));assert.throws(()=>answer(id,[[1,1],[1,1]]));}
});
test("linked-list sorting, odd/even chains, carry propagation and cycle entries",()=>{
  for(let k=0;k<30;k++){const a=Array.from({length:random(12)},()=>random(11)-5);assert.deepEqual(answer(147,[a]),[...a].sort((a,b)=>a-b));assert.deepEqual(answer(328,[a]),[...a.filter((_,i)=>i%2===0),...a.filter((_,i)=>i%2===1)]);const n=random(999999);assert.deepEqual(answer(369,[String(n).split("").map(Number)]),String(n+1).split("").map(Number));}
  assert.equal(answer(142,[[1],0]),0);assert.equal(answer(142,[[],-1]),-1);assert.equal(answer(142,[[1,2],-1]),-1);
  assert.deepEqual(answer(445,[[9,9,9],[1]]),[1,0,0,0]);assert.deepEqual(answer(237,[[4,5,1,9],0]),[5,1,9]);assert.throws(()=>answer(237,[[1],0]));
});
test("bit algorithms and prefix/window algorithms match independent small-input oracles",()=>{
  for(let k=0;k<70;k++){
    const a=Array.from({length:random(8)},()=>random(21)-10),target=random(15)-7;
    let longest=0;for(let i=0;i<a.length;i++){let sum=0;for(let j=i;j<a.length;j++){sum+=a[j];if(sum===target)longest=Math.max(longest,j-i+1);}}
    assert.equal(answer(325,[a,target]),longest);
    const gap=random(4)+1,tolerance=random(5),duplicate=a.some((v,i)=>a.some((w,j)=>i<j&&j-i<=gap&&Math.abs(v-w)<=tolerance));
    assert.equal(answer(220,[a,gap,tolerance]),duplicate);
    const x=random(2001)-1000,y=random(2001)-1000;assert.equal(answer(371,[x,y]),x+y);
    const lo=random(30),hi=lo+random(15);let and=lo;for(let v=lo+1;v<=hi;v++)and&=v;assert.equal(answer(201,[lo,hi]),and);
    const nums=a.map(Math.abs);let xor=0,hamming=0;for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++){xor=Math.max(xor,nums[i]^nums[j]);hamming+=(nums[i]^nums[j]).toString(2).replace(/0/g,"").length;}
    assert.equal(answer(421,[nums]),xor);assert.equal(answer(477,[nums]),hamming);
  }
  assert.equal(answer(137,[[-2,-2,-2,-7]]),-7);assert.deepEqual(answer(260,[[-2,1,1,3]]),[-2,3]);assert.equal(answer(190,[1]),2147483648);assert.equal(answer(405,[-2147483648]),"80000000");
});
test("arithmetic-subsequence DP and triplet detection agree with subset enumeration",()=>{
  for(let k=0;k<40;k++){
    const a=Array.from({length:random(8)},()=>random(9)-4);let count=0,triplet=false;
    for(let mask=0;mask<2**a.length;mask++){const b=a.filter((_,i)=>mask>>i&1);if(b.length>=3&&b.slice(2).every((v,i)=>v-b[i+1]===b[1]-b[0]))count++;if(b.length===3&&b[0]<b[1]&&b[1]<b[2])triplet=true;}
    assert.equal(answer(446,[a]),count);assert.equal(answer(334,[a]),triplet);
  }
});
test("calendar joins, SQL ties and ROUND_HALF_UP semantics",()=>{
  assert.equal(answer(176,[[100,100]]),null);assert.equal(answer(177,[[100,200,200],2]),100);
  assert.deepEqual(answer(178,[[2,2,1]]),[[2,1],[2,1],[1,2]]);
  assert.deepEqual(answer(197,[[{id:1,recordDate:"2024-02-28",temperature:1},{id:2,recordDate:"2024-03-01",temperature:9}]]),[]);
  const trips=Array.from({length:8},(_,i)=>({client_id:1,driver_id:2,status:i===0?"cancelled_by_client":"completed",request_at:"2024-01-01"}));
  assert.deepEqual(answer(262,[trips,[{users_id:1,banned:"No"},{users_id:2,banned:"No"}],"2024-01-01","2024-01-01"]),[{Day:"2024-01-01","Cancellation Rate":0.13}]);
  assert.deepEqual(answer(175,[[{personId:1,firstName:"A",lastName:"B"}],[]]),[{firstName:"A",lastName:"B",city:null,state:null}]);
});
test("string parsers, streaming reads, nested-list empty levels and codec round trips",()=>{
  const cases=[
    [158,["abc",[1,1,1,1,1]],["a","b","c","",""]],[161,["ab","ab"],false],[161,["","a"],true],
    [166,[-50,8],"-6.25"],[166,[1,6],"0.1(6)"],[165,["1.0.0","1"],0],
    [193,[["(123) 456-7890","123-456-7890","(123)456-7890","123-456-7890x"]],["(123) 456-7890","123-456-7890"]],
    [194,[""],""],[195,["one\ntwo"],""],[227,[" 3+5 / 2 "],5],[227,["14-3/2"],13],
    [245,[["a","b","a","a"],"a","a"],1],[271,[["","#","😀"]],{encoded:"0#1##1#😀",decoded:["","#","😀"]}],
    [306,["000"],true],[306,["1023"],false],[331,["#"],true],[331,["1,#"],false],
    [364,[[1,[[]]]],1],[364,[[[],[[]]]],0],[364,[[[[1]],2]],7],[385,["-3"],-3],[385,["[]"],[]],
    [388,["dir\n\tfile.txt"],12],[393,[[235,140,4]],false],[408,["apple","a01e"],false],
    [420,["a"],5],[420,["1337C0d3"],0],[420,["aaa111"],2],[420,["ABABABABABABABABABAB1"],2],
    [428,[null],{serialized:"",decoded:null}],[431,[null],{binary:[],decoded:null}],
    [439,["F?1:T?4:5"],"4"],[449,[[]],{serialized:"",decoded:[]}],
    [468,["2001:0db8:85a3:0:0:8A2E:0370:7334"],"IPv6"],[468,["172.16.254.01"],"Neither"],
    [483,["4681"],"8"],[484,["DDD"],[4,3,2,1]],[498,[[[1],[2],[3]]],[1,2,3]],
  ];
  for(const[id,args,value]of cases)assert.deepEqual(answer(id,args),value,`Edge #${id} ${JSON.stringify(args)}`);
});
test("lexicographic rank, decimal ones and good bases match enumeration",()=>{
  for(let n=1;n<=60;n++){
    const values=Array.from({length:n},(_,i)=>i+1).sort((a,b)=>String(a).localeCompare(String(b))),k=random(n)+1;
    assert.equal(answer(440,[n,k]),values[k-1]);
    assert.equal(answer(233,[n]),Array.from({length:n+1},(_,i)=>String(i)).join("").replace(/[^1]/g,"").length);
    if(n>=3){let base=2;for(;base<n;base++){let v=n;while(v>0&&v%base===1)v=Math.floor(v/base);if(v===0)break;}assert.equal(answer(483,[String(n)]),String(base));}
  }
});
test("Zuma supports indispensable pair splits and resolves chain reactions",()=>{
  for(const [board,hand,value]of [["RRWWRRBBRR","WB",2],["WWRRBBWW","WRBRW",2],["WRRBBW","RB",-1],["G","GGGGG",2]])assert.equal(answer(488,[board,hand]),value);
});
test("actual HTTP route handlers expose all lessons, validate inputs and load lazy assets",()=>{
  const routes=new Map(),app={use(){},get(p,f){routes.set(`GET ${p}`,f);},post(p,f){routes.set(`POST ${p}`,f);},listen(){}};
  const express=()=>app;express.json=express.static=()=>()=>{};
  const file=require.resolve("../server"),localRequire=createRequire(file);
  vm.runInNewContext(fs.readFileSync(file,"utf8"),{require:n=>n==="express"?express:n==="compression"?()=>()=>{}:localRequire(n),__dirname:path.dirname(file),process:{env:{}},console});
  const request=(key,id,body={})=>{const res={statusCode:200,status(code){this.statusCode=code;return this;},json(data){this.body=data;return this;}};routes.get(key)({params:{id},body},res);return res;};
  const catalog=request("GET /api/problems").body,html=fs.readFileSync(require.resolve("../public/index.html"),"utf8");
  for(const p of Object.values(lessons)){
    assert.ok(JSON.stringify(catalog).includes(`"id":${p.id},`));assert.equal(request("GET /api/problem/:id",p.id).body.hasLiveArgs,true);
    const res=request("POST /api/problem/:id/solve",p.id,{input:p.defaultInput});assert.equal(res.statusCode,200,`HTTP #${p.id} ${JSON.stringify(res.body)}`);expected(res.body.answer,p.__catalog.expected);
    const args=request("POST /api/problem/:id/live-args",p.id,{input:p.defaultInput});assert.equal(args.statusCode,200);
    for(const asset of ["catalog-lessons.css","renderer-catalog-lessons.js"]){const tag=html.split("\n").find(line=>line.includes(asset));assert.ok(tag.match(/data-problem-ids="([^"]+)"/)[1].split(" ").includes(String(p.id)));}
  }
  for(const input of ["bad json","null","[]",JSON.stringify([Number.MAX_SAFE_INTEGER+1])])assert.equal(request("POST /api/problem/:id/solve",105,{input}).statusCode,400);
  assert.deepEqual(lessons[222].liveArgs("[[1,2,3]]"),[{__viz_type:"binary_tree",values:[1,2,3]}]);
  assert.deepEqual(lessons[147].liveArgs("[[2,1]]"),[{__viz_type:"linked_list",values:[2,1]}]);
});
