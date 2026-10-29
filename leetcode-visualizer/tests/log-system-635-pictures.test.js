'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[635],grains=['Year','Month','Day','Hour','Minute','Second'];
const cases=[JSON.parse(p.defaultInput),[['retrieve','2017:01:01:00:00:00','2017:12:31:23:59:59','Year']],[['put',1,'2020:06:15:10:00:00'],['put',2,'2020:06:15:11:00:00'],['put',3,'2020:06:15:12:00:00'],['retrieve','2020:06:15:10:00:00','2020:06:15:11:00:00','Second']],[['put',1,'2016:12:31:23:59:59'],['put',2,'2017:01:01:00:00:00'],['put',3,'2017:06:15:12:30:45'],...grains.map(g=>['retrieve','2017:01:01:00:00:00','2017:12:31:23:59:59',g])],[['put',10000,'9999:12:31:23:59:59'],['retrieve','9999:12:31:23:59:59','9999:12:31:23:59:59','Second']]];
const build=ops=>p.builder(JSON.stringify(ops));
test('635 records each completed Python statement with exact locals, including retained key values and the exhausted for loop',()=>{
 const source=`import sys,json,copy
namespace={}
exec(compile(${JSON.stringify(p.code.join('\n'))},'logs635.py','exec'),namespace)
runs=[]
for ops in json.load(sys.stdin):
    events=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_filename!='logs635.py':return trace
        if event in ('line','return'):
            if frame in pending:
                local=frame.f_locals
                events.append({'line':pending.pop(frame),'logs':[list(log) for log in local['self'].logs],'values':copy.deepcopy({k:local.get(k) for k in ['length','start_key','end_key','log_id','timestamp','key','result']})})
            if event=='line':pending[frame]=frame.f_lineno
        return trace
    sys.settrace(trace)
    instance=namespace['LogSystem']()
    outputs=[getattr(instance,op[0])(*op[1:]) for op in ops]
    sys.settrace(None)
    runs.append({'events':events,'outputs':outputs})
print(json.dumps(runs))`;
 const run=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(cases),encoding:'utf8'});assert.equal(run.status,0,run.stderr);
 JSON.parse(run.stdout).forEach((expected,i)=>{const built=build(cases[i]);assert.deepEqual(built.answer,expected.outputs);assert.deepEqual(built.steps.map(s=>{const v=s.logSystem635View,q=v.query,c=v.current;return{line:v.line,logs:v.logs.map(log=>[log.id,log.timestamp]),values:{length:q?.length??null,start_key:q?.startKey??null,end_key:q?.endKey??null,log_id:q?.logId??c?.logId??null,timestamp:q?.timestamp??(c?.name==='put'?c.args[1]:null),key:q?.key??null,result:q?.matches??null}};}),expected.events);assert.ok(built.steps.every(s=>s.vars.length===8));assert.equal(built.steps.filter(s=>s.final).length,1);});
});
test('635 includes BOTH boundaries, appends only on line 19, and preserves put order instead of timestamp order',()=>{
 const run=build(cases[0]);assert.deepEqual(run.answer,[null,null,null,[1,2,3],[1,2]]);
 for(const step of run.steps){const v=step.logSystem635View,q=v.query;if(!q)continue;if(v.line===18&&q.verdict)assert.ok(!q.matches.includes(q.logId));if(v.line===19)assert.equal(q.matches.at(-1),q.logId);if(v.line===16&&q.activeIndex===0)assert.equal(q.key,null);}
 assert.deepEqual(build(cases[2]).answer.at(-1),[1,2]);assert.deepEqual(build(cases[4]).answer.at(-1),[10000]);
 const worst=[...Array.from({length:14},(_,i)=>['put',i+1,`2017:01:${String(i+1).padStart(2,'0')}:00:00:00`]),...Array.from({length:16},()=>['retrieve','2017:01:01:00:00:00','2017:12:31:23:59:59','Year'])];
 const full=build(worst);assert.equal(full.steps.length,1007);assert.equal(full.steps.at(-1).logSystem635View.outputs.length,30);assert.ok(full.steps.every(s=>!s.hardProblemView.traceTruncated));
});
test('635 colors only granularity fields, keeps untested logs pending and draws only IDs actually appended to result',()=>{
 const host={innerHTML:''},ctx={lang:'vi',$:()=>host,escapeHtml:String};ctx.pick=x=>x[ctx.lang]??x;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-log-system-635.js'),'utf8'),ctx);
 for(const language of['vi','en']){ctx.lang=language;for(const ops of cases){const built=build(ops),before=JSON.stringify(built);for(const step of built.steps){const v=step.logSystem635View,q=v.query;ctx.renderLogSystem635Pictures(step);const html=host.innerHTML;assert.doesNotMatch(html,/undefined|NaN|Infinity|<p>/);
 assert.deepEqual([...html.matchAll(/data-result-id="(\d+)"/g)].map(m=>Number(m[1])),q?.matches??[]);
 for(const [,id,status]of html.matchAll(/data-log-id="(\d+)" data-log-status="([a-z]+)"/g)){const decision=q?.decisions.find(d=>d.id===Number(id));const expected=!q?(Number(id)===v.current?.logId?'new':'stored'):q.matches?.includes(Number(id))?'included':decision?decision.matches?'hit':'miss':'pending';assert.equal(status,expected);}
 if(q){assert.ok(html.includes(`data-log-result="${q.matches===null?'pending':JSON.stringify(q.matches)}"`));for(const field of[0,1,2,3,4,5])assert.ok(html.includes(`data-time-field="${field}" data-kept="${[4,7,10,13,16,19][field]<=q.length}"`));assert.ok(html.includes(`data-log-granularity="${q.granularity}" aria-pressed="true"`));}
 }assert.equal(JSON.stringify(built),before);}}
});
