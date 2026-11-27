"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[4124],source=require('../problems/mountain-array-4124-source.json');
const solve=nums=>p.builder(JSON.stringify([nums]));
function verifyWitness(nums,cost,target,peak){
 if(nums.length<3){assert.equal(cost,-1);assert.equal(target,null);return;}
 assert.equal(target.length,nums.length);assert.ok(target.every(Number.isSafeInteger));assert.ok(peak>0&&peak<nums.length-1);
 for(let i=0;i<peak;i++)assert.ok(target[i]<target[i+1]);for(let i=peak;i+1<nums.length;i++)assert.ok(target[i]>target[i+1]);
 assert.equal(target.reduce((sum,v,i)=>sum+Math.abs(v-nums[i]),0),cost);
}
function bruteHeights(nums){
 const n=nums.length;if(n<3)return-1;const low=Math.min(...nums)-n,high=Math.max(...nums)+n,heights=Array.from({length:high-low+1},(_,i)=>low+i);
 function rising(values){const rows=[heights.map(h=>Math.abs(values[0]-h))];for(const value of values.slice(1)){let best=Infinity;rows.push(heights.map((h,i)=>{if(i)best=Math.min(best,rows.at(-1)[i-1]);return Math.abs(value-h)+best;}));}return rows;}
 const left=rising(nums),right=rising([...nums].reverse()).reverse();let best=Infinity;
 for(let peak=1;peak<n-1;peak++)for(let h=0;h<heights.length;h++)best=Math.min(best,left[peak][h]+right[peak][h]-Math.abs(nums[peak]-heights[h]));return best;
}
test('4124 matches exhaustive height DP for signed arrays and constructs a witness of exactly the optimum cost',()=>{
 const cases=[];function generate(a,length){if(a.length===length){cases.push(a);return;}for(const value of[-1,0,2])generate([...a,value],length);}
 for(let n=0;n<=6;n++)generate([],n);let seed=4124;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let i=0;i<150;i++)cases.push(Array.from({length:3+random(7)},()=>random(15)-6));
 const pythonCode='import sys,json\np=json.load(sys.stdin)\nns={}\nexec(p["code"],ns)\nsnap={}\ndef record(frame,event,arg):\n if event=="return" and frame.f_code.co_name=="minOperations":\n  snap["target"]=frame.f_locals.get("adjusted")\n  snap["peak"]=frame.f_locals.get("best_peak")\nsys.setprofile(record)\nanswers=[]\nfor values in p["cases"]:\n value=ns["Solution"]().minOperations(values)\n answers.append({"cost":value,"target":snap.get("target"),"peak":snap.get("peak")})\nsys.setprofile(None)\nprint(json.dumps(answers))';
 const local=path.resolve(__dirname,'../.viz-python',process.platform==='win32'?'Scripts/python.exe':'bin/python'),python=fs.existsSync(local)?local:process.platform==='win32'?'python':'python3';
 const result=spawnSync(python,['-c',pythonCode],{input:JSON.stringify({code:source,cases}),encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:5*1024*1024});assert.equal(result.status,0,result.stderr);const results=JSON.parse(result.stdout);
 cases.forEach((nums,i)=>{assert.equal(results[i].cost,bruteHeights(nums),JSON.stringify(nums));verifyWitness(nums,results[i].cost,results[i].target,results[i].peak);});process.stdout.write(`Verified ${cases.length} signed-array optima and reconstructed witnesses\n`);
});
test('4124 executes the user example, zero/negative optima, large values and impossible cases through bundled Python',()=>{
 assert.equal(p.__catalog.engine,'wasm');assert.equal(p.debugMode,'line-by-line');assert.equal(p.__catalog.method,'minOperations');
 for(const[nums,expected]of[[[2,2,3],2],[[3,1,2,5,4],3],[[5,7,7,4],1],[[1,1,1,1,1],3],[[-4,-4,-4],1],[[3,7,2],0],[[1,2],-1],[[],-1],[[1e9,-1e9,1e9],2000000001]]){
  const run=solve(nums);assert.equal(run.answer,expected);const last=run.steps.at(-1).catalogLessonView;verifyWitness(nums,run.answer,last.locals.adjusted||null,last.locals.best_peak);assert.equal(last.trace.truncated,false);assert.equal(run.steps.filter(s=>s.final).length,1);
 }
 assert.ok(solve([3,1,2,5,4]).steps.at(-1).catalogLessonView.locals.adjusted.includes(0));
 for(const nums of[[1,2,NaN],[1,1.5,2],Array(41).fill(1),[1e9+1,2,3]])assert.throws(()=>solve(nums));
});
test('all bilingual pictures follow source lines and actual heaps; replay reveals no future mountain',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:p});
 for(const file of['renderer-mountain-4124.js','renderer-illustrated-lessons.js','renderer-guided-scenes.js','renderer-catalog-lessons.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
 for(const nums of[[3,1,2,5,4],[2,2,3],[1,1,1,1,1],[-5,-2,-3],[],[1,2]]){
  const run=solve(nums),saved=JSON.stringify(run);
  for(const language of['vi','en']){ctx.lang=language;for(const step of run.steps){const v=step.catalogLessonView,x=v.locals;assert.equal(v.source,p.code[v.line-1]);assert.equal(v.result,step.final?run.answer:null);
   if(Array.isArray(x.heap))assert.ok(x.heap.every((value,i)=>!i||x.heap[Math.floor((i-1)/2)]<=value));
   ctx.renderCatalogLesson(step);assert.match(host.innerHTML,/data-mountain-id="4124"/);assert.equal(host.innerHTML.includes('data-mountain-result='),step.final);assert.equal(host.innerHTML.includes('data-adjusted='),Array.isArray(x.adjusted)&&x.adjusted.length>0);assert.doesNotMatch(host.innerHTML,/class="iv-debug"|class="iv-source"|data-code-line=|\[object Object\]|NaN|<script|<img/);
  }}
  ctx.renderCatalogLesson(run.steps[0]);const first=host.innerHTML;ctx.renderCatalogLesson(run.steps.at(-1));ctx.renderCatalogLesson(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),saved);
 }
});
test('4124 registers all lazy picture assets in the correct order and uses independent light/dark colors',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');for(const asset of['mountain-4124.css','renderer-mountain-4124.js','illustrated-lessons.css','renderer-illustrated-lessons.js','guided-scenes.css','renderer-guided-scenes.js','catalog-lessons.css','renderer-catalog-lessons.js']){const row=html.split('\n').find(line=>line.includes(asset)),ids=row.match(/data-problem-ids="([^"]+)"/)[1].split(' ');assert.ok(ids.includes('4124'),asset);}
 assert.ok(html.indexOf('renderer-mountain-4124.js')<html.indexOf('renderer-illustrated-lessons.js'));
 const css=fs.readFileSync(require.resolve('../public/mountain-4124.css'),'utf8');assert.match(css,/\[data-theme="light"\]/);assert.match(css,/@media\(max-width:600px\)/);for(const key of['--mt-bg','--mt-fg','--mt-gold','--mt-green'])assert.ok(css.includes(key));
});
