'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[416];
const python=process.env.PYTHON||(process.platform==='win32'?'python':'python3');
const cases=[[1,5,11,5],[1,2,3,5],[2,6],[1,1],[100],[2,2,3,5],[2,2,2,2],[1,2,5]];
test('416 adds the supplied DFS with English comments, separate take and skip calls, and exponential complexity',()=>{
 assert.deepEqual(p.extraParams[0].options.map(o=>o.value),[1,2,3]);assert.equal(p.debugMode,'line-by-line');assert.equal(p.complexity3.time,'O(2^n)');assert.equal(p.complexity3.space,'O(n)');
 const code=p.code3.join('\n');assert.match(code,/take = dfs\(i \+ 1, remain - nums\[i\]\)/);assert.match(code,/skip = dfs\(i \+ 1, remain\)/);assert.match(code,/return take or skip/);assert.doesNotMatch(code,/cache|memo/);
 for(const line of p.code3.filter(s=>s.trim().startsWith('#')))assert.match(line,/^[\x00-\x7f]+$/);
});
test('416 DFS line sequence and caller-local values match real Python, including skip after a successful take',()=>{
 const script=`import sys,json
namespace={}
exec(compile(${JSON.stringify(p.code3.join('\n'))},'dfs416.py','exec'),namespace)
out=[]
for nums in json.load(sys.stdin):
    records=[]
    def trace(frame,event,arg):
        if frame.f_code.co_filename!='dfs416.py': return trace
        if event=='line' or (event=='return' and frame.f_code.co_name=='canPartition' and frame.f_lineno==27):
            values={k:frame.f_locals[k] for k in ['i','remain','take','skip'] if k in frame.f_locals}
            records.append({'line':frame.f_lineno,'values':values})
        return trace
    sys.settrace(trace)
    answer=namespace['Solution']().canPartition(nums)
    sys.settrace(None)
    out.append({'answer':answer,'records':records})
print(json.dumps(out))`;
 const run=spawnSync(python,['-c',script],{input:JSON.stringify(cases),encoding:'utf8'});assert.equal(run.status,0,run.stderr);
 JSON.parse(run.stdout).forEach((expected,c)=>{const built=p.builder3(cases[c]);assert.equal(built.answer,expected.answer);assert.deepEqual(built.steps.map(s=>s.codeLines[0]),expected.records.map(r=>r.line));built.steps.forEach((s,i)=>{const n=s.equalSubset416DfsView.current;for(const[k,value]of Object.entries(expected.records[i].values))assert.equal(n[k],value,`case ${c}, step ${i}, ${k}`);});});
 const built=p.builder3([1,1]);assert.ok(built.steps.some(s=>s.equalSubset416DfsView.event==='skip'&&s.equalSubset416DfsView.current.take===true));
});
test('416 DFS agrees with enumeration, keeps occurrence identity and reconstructs valid disjoint groups',()=>{
 let seed=416;for(let trial=0;trial<60;trial++){const nums=Array.from({length:1+trial%8},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return 1+seed%9;});const before=[...nums],built=p.builder3(nums),target=nums.reduce((a,b)=>a+b,0)/2;
 let expected=false;for(let mask=0;mask<2**nums.length;mask++)if(nums.reduce((s,n,i)=>s+((mask>>i)&1?n:0),0)===target){expected=true;break;}
 assert.equal(built.answer,expected,String(nums));assert.deepEqual(nums,before);assert.equal(built.steps.filter(s=>s.final).length,1);
 const final=built.steps.at(-1).equalSubset416DfsView;if(expected){const{a,b}=final.partition;assert.deepEqual([...a,...b].sort((a,b)=>a-b),nums.map((_,i)=>i));for(const group of[a,b])assert.equal(group.reduce((s,i)=>s+nums[i],0),target);}else assert.equal(final.partition,null);
 for(const step of built.steps){const v=step.equalSubset416DfsView,n=v.current;if(n){assert.equal(n.remain,v.target-n.taken.reduce((s,i)=>s+nums[i],0));assert.ok(n.taken.every(i=>i<n.i));assert.equal(new Set(n.taken).size,n.taken.length);}assert.equal(step.vars.length,8);}
 }
 const long=p.builder3(Array(12).fill(2));assert.ok(long.steps.length<=451);assert.equal(long.steps.at(-1).equalSubset416DfsView.shortened,true);assert.equal(long.answer,true);assert.ok(JSON.stringify(long).length<2500000);
 for(const input of[[],[0],[101],Array(13).fill(1)])assert.throws(()=>p.builder3(input));
});
test('416 DFS pictures expose the current call, take/skip returns and real partition in both languages',()=>{
 const host={innerHTML:''},ctx={lang:'vi',$:()=>host,escapeHtml:String};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-partition-equal-subset-416.js'),'utf8'),ctx);
 for(const language of['vi','en']){ctx.lang=language;for(const nums of cases){const built=p.builder3(nums),before=JSON.stringify(built);for(const step of built.steps){ctx.renderEqualSubset416DfsView(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|<p>/);assert.match(host.innerHTML,/data-method="3"/);const v=step.equalSubset416DfsView;if(v.current){assert.ok(host.innerHTML.includes(`data-dfs-take="${v.current.take}"`));assert.ok(host.innerHTML.includes(`data-dfs-skip="${v.current.skip}"`));if(!v.final)assert.ok(host.innerHTML.includes(`data-dfs-remain="${v.current.remain}"`));}if(v.partition)assert.equal((host.innerHTML.match(/class="pe416-group"/g)||[]).length,2);}assert.equal(JSON.stringify(built),before);}}
});
