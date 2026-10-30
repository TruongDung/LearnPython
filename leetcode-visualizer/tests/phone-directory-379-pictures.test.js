'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[379];
const cases=[{n:3,ops:JSON.parse(p.defaultInput)},{n:1,ops:[['get'],['get'],['release',0],['release',0],['check',0],['get'],['get']]},{n:3,ops:[['get'],['get'],['release',0],['get'],['get']]},{n:50,ops:Array.from({length:70},()=>['get'])}];
const build=c=>p.builder(JSON.stringify(c.ops),{maxNumbers:c.n});
test('379 snapshots match Python after every executed constructor and method line, without synthetic calls or truncation',()=>{
 const source=`import sys,json
scope={}
exec(compile(${JSON.stringify(p.code.join('\n'))},'phones379.py','exec'),scope)
runs=[]
for case in json.load(sys.stdin):
    events=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_filename!='phones379.py':return trace
        if event in ('line','return'):
            if frame in pending:
                local=frame.f_locals
                instance=local['self']
                events.append({'line':pending.pop(frame),'available':list(instance.available),'free':sorted(instance.free) if hasattr(instance,'free') else None,'number':local.get('number')})
            if event=='line':pending[frame]=frame.f_lineno
        return trace
    sys.settrace(trace)
    instance=scope['PhoneDirectory'](case['n'])
    outputs=[getattr(instance,op[0])(*op[1:]) for op in case['ops']]
    sys.settrace(None)
    runs.append({'events':events,'outputs':outputs})
print(json.dumps(runs))`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(cases),encoding:'utf8'});assert.equal(proc.status,0,proc.stderr);
 JSON.parse(proc.stdout).forEach((expected,i)=>{const run=build(cases[i]);assert.deepEqual(run.answer,expected.outputs);assert.deepEqual(run.steps.map(s=>{const v=s.phoneDirectory379View;return{line:v.line,available:v.available,free:v.free,number:v.current?.number??null};}),expected.events);assert.equal(run.steps.filter(s=>s.final).length,1);assert.equal(run.steps.at(-1).phoneDirectory379View.outputs.length,cases[i].ops.length);assert.ok(run.steps.every(s=>s.vars.length===8&&!s.hardProblemView.traceTruncated));});
});
function renderer(){const host={innerHTML:''},ctx={lang:'vi',$:()=>host,escapeHtml:String};ctx.pick=x=>x[ctx.lang]??x;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-phone-directory-379.js'),'utf8'),ctx);return{ctx,host,render:step=>{ctx.renderPhoneDirectory379Pictures(step);return host.innerHTML;}};}
test('379 marks in-transit numbers at the two partial mutation lines and draws exact queue order and set membership',()=>{
 const {ctx,render}=renderer();for(const language of['vi','en']){ctx.lang=language;for(const c of cases){const run=build(c),before=JSON.stringify(run);for(const step of run.steps){const v=step.phoneDirectory379View,html=render(step);assert.doesNotMatch(html,/undefined|NaN|Infinity|<p>/);const numbers=[...html.matchAll(/data-phone-number="(\d+)" data-phone-state="([a-z]+)"/g)];assert.equal(numbers.length,c.n);for(const[,num,state]of numbers){const n=Number(num),expected=v.free===null?'uninitialized':v.free.includes(n)!==v.available.includes(n)?'moving':v.free.includes(n)?'free':'assigned';assert.equal(state,expected);}
 assert.deepEqual([...html.matchAll(/data-queue-number="(\d+)"/g)].map(m=>Number(m[1])),v.available);assert.deepEqual([...html.matchAll(/data-set-number="(\d+)"/g)].map(m=>Number(m[1])),v.free??[]);if(v.event==='dequeue'||v.event==='free')assert.match(html,/data-phone-state="moving"/);
 }assert.equal(JSON.stringify(run),before);}}
});
test('379 check and repeated release preserve both containers; released numbers rejoin the BACK instead of jumping the queue',()=>{
 const run=build(cases[2]),release=run.steps.find(s=>s.phoneDirectory379View.line===22).phoneDirectory379View;
 assert.deepEqual(release.available,[2,0]);assert.deepEqual(release.free,[0,2]);assert.deepEqual(run.answer,[0,1,null,2,0]);
 for(const step of build(cases[1]).steps){const v=step.phoneDirectory379View;if(v.current?.name==='check'||v.event==='duplicate'){assert.deepEqual(v.available,v.before.available);assert.deepEqual(v.free,v.before.free);}}
});
