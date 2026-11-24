"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const {spawnSync}=require("node:child_process"),path=require("node:path");
const p=require("../problems").SUPPORTED[2];
const cases=[[[2,4,3],[5,6,4]],[[0],[0]],[[9,9],[1]],[[9,9,9,9,9,9,9],[9,9,9,9]],[[2,4,3],[5]],[[0],[1,2,3]],[[0,0,1],[0,0,9]]];
const input=(a,b)=>a.join(",")+";"+b.join(",");
const oracle=(a,b)=>(BigInt([...a].reverse().join(""))+BigInt([...b].reverse().join(""))).toString().split("").reverse().map(Number);
const run=(a,b)=>p.builder(input(a,b));
test("2 preserves the input format, validates digits and agrees with independent integer addition",()=>{
  let seed=2;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  const inputs=[...cases];for(let k=0;k<100;k++){const a=Array.from({length:random(14)+1},()=>random(10)),b=Array.from({length:random(14)+1},()=>random(10));a[a.length-1]||=1;b[b.length-1]||=1;inputs.push([a,b]);}
  for(const[a,b]of inputs){const before=JSON.stringify([a,b]),r=run(a,b);assert.deepEqual(r.answer,oracle(a,b));assert.equal(r.steps.filter(s=>s.final).length,1);assert.equal(r.steps.at(-1).final,true);assert.equal(JSON.stringify([a,b]),before);}
  assert.deepEqual(p.builder("[ [2,4,3], [5,6,4] ]").answer,[7,0,8]);assert.deepEqual(p.builder("[2,4,3];[5,6,4]").answer,[7,0,8]);
  for(const bad of ["","1","1;",";2","1;2;3","1,,2;3","1.0;2","10;2","-1;2","[];[]","[1,null];[2]","[[1],2]",input(Array(101).fill(1),[1]),null,[]])assert.throws(()=>p.builder(bad),RangeError);
  const max=run(Array(100).fill(9),[1]);assert.deepEqual(max.answer,[...Array(100).fill(0),1]);
  assert.deepEqual(p.liveArgs("2,4,3;5,6,4"),[{__viz_type:"linked_list",values:[2,4,3]},{__viz_type:"linked_list",values:[5,6,4]}]);
});
test("2 pictures follow actual read, sum, carry and append statements without revealing future digits",()=>{
  for(const[a,b]of cases){const r=run(a,b);let previous=[],round=-1;
    for(const step of r.steps){const v=step.addTwoNumbers2View,c=v.column,line=v.line;
      assert.equal(v.source,p.code[line-1].trim());assert.deepEqual(step.codeLines,[line]);
      if(line===6&&v.branch)round++;
      if(c){assert.equal(c.index,round);assert.ok(c.carryIn===0||c.carryIn===1);if(c.total!==null)assert.equal(c.total,c.a+c.b+c.carryIn);if(c.carryOut!==null)assert.equal(c.carryOut,Math.floor(c.total/10));if(c.written)assert.equal(c.digit,c.total%10);}
      if(line===11){assert.equal(v.output.length,previous.length+1);assert.deepEqual(v.output,[...previous,c.digit]);}else assert.deepEqual(v.output,previous);
      if(v.cursorA!==null)assert.ok(v.cursorA>=0&&v.cursorA<a.length);if(v.cursorB!==null)assert.ok(v.cursorB>=0&&v.cursorB<b.length);
      assert.equal(v.history.length,v.output.length);assert.deepEqual(v.history.map(h=>h.digit),v.output);previous=v.output;
    }
    assert.deepEqual(previous,r.answer);
  }
  const r=run([9,9],[1]),extra=r.steps.find(s=>s.addTwoNumbers2View.line===9&&s.addTwoNumbers2View.column.index===2).addTwoNumbers2View;
  assert.deepEqual([extra.column.a,extra.column.b,extra.column.carryIn,extra.column.total],[0,0,1,1]);
  const saved=JSON.stringify(r.steps[0]);run([1],[2]);assert.equal(JSON.stringify(r.steps[0]),saved);
});
function renderer(language,extra={}){
  const host={innerHTML:"",querySelectorAll:()=>[]},ctx=vm.createContext({lang:language,$:()=>host,...extra});
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-add-two-numbers-2.js"),"utf8"),ctx);
  return{ctx,host,render:step=>{ctx.renderAddTwoNumbers2(step);return host.innerHTML;}};
}
test("2 renders aligned lists, a total split into digit/carry, final numbers and empty-list zeros in both languages",()=>{
  for(const language of["vi","en"])for(const[a,b]of cases){const r=run(a,b),ui=renderer(language,{steps:r.steps,stepIndex:0});const before=JSON.stringify(r);
    for(const step of r.steps){const html=ui.render(step),v=step.addTwoNumbers2View;assert.doesNotMatch(html,/undefined|NaN|Infinity/);assert.match(html,/a2-chain a/);assert.match(html,/a2-chain b/);assert.match(html,/a2-chain result/);if(v.column){assert.match(html,/a2-equation/);assert.match(html,/a2-carry-out/);}if(v.final){assert.match(html,/a2-answer/);assert.ok(html.includes([...r.answer].reverse().join("")));}}
    assert.equal(JSON.stringify(r),before);
  }
});
test("2 shortcut buttons stop on real addition, node creation and return events",()=>{
  const r=run([2,4,3],[5,6,4]);for(const[kind,line]of[["sum",9],["write",11],["done",15]]){let stopped=0,rendered=0;const ui=renderer("vi",{steps:r.steps,stepIndex:0,stopPlay:()=>stopped++,renderStep:()=>rendered++});ui.ctx.add2Jump(kind);assert.equal(r.steps[ui.ctx.stepIndex].addTwoNumbers2View.line,line);assert.equal(stopped,1);assert.equal(rendered,1);ui.ctx.stepIndex=r.steps.length-1;ui.ctx.add2Jump(kind);assert.equal(ui.ctx.stepIndex,r.steps.length-1);}
});
test("2 uses native Python addition and reports the same statement and local-variable states",()=>{
  const python=process.env.PYTHON||path.resolve(__dirname,"../../.venv/Scripts/python.exe"),context=require("../problems/catalog-context");
  const payloads=cases.map(args=>({code:p.code.join("\n"),method:"addTwoNumbers",args,prelude:context+'\n_viz_config={"kinds":["list","list"],"answerKind":"list"}\n',captureAllocations:["ListNode"],stateClasses:["Solution"]}));
  const program="import sys,json,runpy\np=json.load(sys.stdin);f=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(case)) for case in p['cases']]))";
  const native=spawnSync(python,["-c",program],{input:JSON.stringify({path:require.resolve("../problems/picture-trace.py"),cases:payloads}),encoding:"utf8",maxBuffer:8e6});assert.equal(native.status,0,native.stderr);
  JSON.parse(native.stdout).forEach((ref,i)=>{const r=run(...cases[i]);assert.deepEqual(r.answer,ref.answer);assert.equal(r.steps.length,ref.events.length);ref.events.forEach((e,j)=>{assert.equal(r.steps[j].codeLines[0],e.line);assert.deepEqual(r.steps[j].vars.map(v=>[v.name,v.rawValue]),Object.entries(e.locals));});});
});
test("2 lazy assets and dedicated registration are present",()=>{
  const html=fs.readFileSync(require.resolve("../public/index.html"),"utf8");assert.match(html,/<template[^>]+data-problem-assets="styles">[\s\S]*add-two-numbers-2\.css/);assert.match(html,/<template[^>]+data-problem-assets="scripts">[\s\S]*renderer-add-two-numbers-2\.js/);assert.match(fs.readFileSync(require.resolve("../public/script.js"),"utf8"),/Boolean\(step\.addTwoNumbers2View\)/);
});
