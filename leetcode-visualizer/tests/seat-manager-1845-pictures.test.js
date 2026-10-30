'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[1845];
const cases=[{n:5,ops:JSON.parse(p.defaultInput)},{n:1,ops:[['reserve'],['unreserve',1],['reserve']]},{n:5,ops:[['reserve'],['reserve'],['reserve'],['unreserve',3],['unreserve',1],['reserve'],['reserve']]},{n:40,ops:[...Array.from({length:40},()=>['reserve']),...Array.from({length:10},(_,i)=>['unreserve',i+1]),...Array.from({length:10},()=>['reserve'])]}];
const build=c=>p.builder(JSON.stringify(c.ops),{n:c.n});
test('1845 records each executed Python line with the exact heap storage, not a sorted substitute',()=>{
 const source=`import sys,json
scope={}
exec(compile(${JSON.stringify(p.code.join('\n'))},'seats1845.py','exec'),scope)
runs=[]
for case in json.load(sys.stdin):
    events=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_filename!='seats1845.py':return trace
        if event in ('line','return'):
            if frame in pending:
                events.append({'line':pending.pop(frame),'heap':list(frame.f_locals['self'].available)})
            if event=='line':pending[frame]=frame.f_lineno
        return trace
    sys.settrace(trace)
    instance=scope['SeatManager'](case['n'])
    outputs=[getattr(instance,op[0])(*op[1:]) for op in case['ops']]
    sys.settrace(None)
    runs.append({'events':events,'outputs':outputs})
print(json.dumps(runs))`;
 const run=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(cases),encoding:'utf8'});assert.equal(run.status,0,run.stderr);
 JSON.parse(run.stdout).forEach((expected,i)=>{const built=build(cases[i]);assert.deepEqual(built.answer,expected.outputs);assert.deepEqual(built.steps.map(s=>({line:s.codeLines[0],heap:s.seatManager1845View.heap})),expected.events);assert.equal(built.steps.length,2+cases[i].ops.length);assert.equal(built.steps.filter(s=>s.final).length,1);assert.ok(built.steps.every(s=>s.vars.length===8&&!s.hardProblemView.traceTruncated));});
});
test('1845 separates the returned seat from the new root and reserves the smallest seat regardless of release order',()=>{
 const built=build(cases[0]),v=built.steps[2].seatManager1845View;assert.equal(v.current.result,1);assert.equal(v.beforeHeap[0],1);assert.equal(v.heap[0],2);assert.notDeepEqual(v.heap,[...v.heap].sort((a,b)=>a-b));
 assert.deepEqual(build(cases[2]).answer,[1,2,3,null,null,1,3]);
 for(const c of cases){const run=build(c);for(const s of run.steps){const v=s.seatManager1845View;assert.deepEqual([...v.free,...v.reserved].sort((a,b)=>a-b),Array.from({length:c.n},(_,i)=>i+1));assert.deepEqual([...v.heap].sort((a,b)=>a-b),v.free);for(let i=1;i<v.heap.length;i++)assert.ok(v.heap[Math.floor((i-1)/2)]<v.heap[i]);}}
});
test('1845 diagrams map every chair, heap index, edge and before/after item to the actual snapshot in both languages',()=>{
 const host={innerHTML:'',clientWidth:600},ctx={lang:'vi',$:()=>host,escapeHtml:String};ctx.pick=x=>x[ctx.lang]??x;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-seat-manager-1845.js'),'utf8'),ctx);
 for(const language of['vi','en']){ctx.lang=language;for(const c of cases){const built=build(c),before=JSON.stringify(built);for(const step of built.steps){const v=step.seatManager1845View;ctx.renderSeatManager1845Pictures(step);const html=host.innerHTML;assert.doesNotMatch(html,/undefined|NaN|Infinity|<p>/);
 const chairs=[...html.matchAll(/data-seat-number="(\d+)" data-seat-state="(free|reserved)"/g)];assert.equal(chairs.length,c.n);chairs.forEach(([,seat,state])=>assert.equal(state,v.free.includes(Number(seat))?'free':'reserved'));
 const nodes=[...html.matchAll(/data-heap-index="(\d+)" data-heap-value="(\d+)"/g)];assert.deepEqual(nodes.map(m=>Number(m[2])),v.heapReady?v.heap:[]);nodes.forEach((m,i)=>assert.equal(Number(m[1]),i));
 const edges=[...html.matchAll(/data-heap-edge="(\d+),(\d+)"/g)];assert.equal(edges.length,v.heapReady?Math.max(0,v.heap.length-1):0);edges.forEach(([,parent,child])=>assert.equal(Number(parent),Math.floor((Number(child)-1)/2)));
 assert.deepEqual([...html.matchAll(/data-array-row="now" data-array-index="\d+" data-array-value="(\d+)"/g)].map(m=>Number(m[1])),v.heap);
 if(v.current){assert.ok(html.includes(`data-seat-return="${v.current.result}"`));assert.ok(html.includes(`data-min-after="${v.heap[0]??'empty'}"`));assert.deepEqual([...html.matchAll(/data-array-row="before" data-array-index="\d+" data-array-value="(\d+)"/g)].map(m=>Number(m[1])),v.beforeHeap);}
 }assert.equal(JSON.stringify(built),before);}}
});
