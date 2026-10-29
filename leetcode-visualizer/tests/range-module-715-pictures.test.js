'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[715];
const cases=[JSON.parse(problem.defaultInput),[],[['queryRange',1,2]],[['addRange',10,20],['addRange',20,30],['removeRange',1,100],['queryRange',10,20]],[['addRange',1,1000000000],['removeRange',2,999999999],['queryRange',1,2],['queryRange',2,3],['queryRange',999999999,1000000000]]];
const build=ops=>problem.builder(JSON.stringify(ops));
test('715 records each real Python statement once, with exact points, i, j and boundary after execution',()=>{
 const script=`import sys,json
scope={}
exec(compile(${JSON.stringify(problem.code.join('\n'))},'range715.py','exec'),scope)
runs=[]
for ops in json.load(sys.stdin):
    events=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_filename!='range715.py': return trace
        if event in ('line','return'):
            if frame in pending:
                local=frame.f_locals
                events.append({'line':pending.pop(frame),'points':list(local['self'].points),'i':local.get('i'),'j':local.get('j'),'boundary':list(local['boundary']) if 'boundary' in local else None})
            if event=='line':pending[frame]=frame.f_lineno
        return trace
    sys.settrace(trace)
    instance=scope['RangeModule']()
    answers=[getattr(instance,name)(left,right) for name,left,right in ops]
    sys.settrace(None)
    runs.append({'events':events,'answers':answers})
print(json.dumps(runs))`;
 const result=spawnSync(process.env.PYTHON||'python',['-c',script],{input:JSON.stringify(cases),encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 assert.equal(problem.debugMode,'line-by-line');
 JSON.parse(result.stdout).forEach((reference,i)=>{const built=build(cases[i]);assert.deepEqual(built.answer,reference.answers);assert.deepEqual(built.steps.map(s=>{const v=s.rangeModuleView;return{line:s.codeLines[0],points:v.points,i:v.i,j:v.j,boundary:v.replacement};}),reference.events);assert.equal(built.steps.filter(s=>s.final).length,1);assert.ok(built.steps.every(s=>s.codeLines.length===1&&s.vars.length===8));});
});
test('715 shows changes only after the slice assignment and never mutates earlier snapshots',()=>{
 const built=build(cases[0]),before=JSON.stringify(built);
 const removal=built.steps.filter(s=>s.rangeModuleView.callIndex===1);
 for(const step of removal){const v=step.rangeModuleView;assert.deepEqual(v.points,v.phase==='applied'?[10,14,16,20]:[10,20]);}
 assert.deepEqual(removal.find(s=>s.codeLines[0]===25).rangeModuleView.replacement,[]);
 assert.deepEqual(removal.find(s=>s.codeLines[0]===27).rangeModuleView.replacement,[14]);
 assert.deepEqual(removal.find(s=>s.codeLines[0]===29).rangeModuleView.replacement,[14,16]);
 assert.equal(JSON.stringify(built),before);
});
test('715 plots actual coverage on both sides of every boundary and keeps unknown query results pending',()=>{
 const host={innerHTML:'',clientWidth:600},ctx={lang:'vi',$:()=>host,escapeHtml:String};ctx.pick=x=>x[ctx.lang]??x;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-range-module-715.js'),'utf8'),ctx);
 for(const language of['vi','en']){ctx.lang=language;for(const ops of cases){const built=build(ops),before=JSON.stringify(built);for(const step of built.steps){ctx.renderRangeModuleView(step);const html=host.innerHTML,v=step.rangeModuleView;assert.doesNotMatch(html,/undefined|NaN|Infinity|<p>/);assert.match(html,/rm715-pictures/);assert.ok(html.includes(`Line ${v.line}`)||html.includes(`Dòng ${v.line}`));
  const now=html.match(/<g data-coverage-row="now">([\s\S]*?)<\/g>/)[1];const cells=[...now.matchAll(/data-segment-left="(\d+)" data-segment-right="(\d+)" data-covered="(true|false)" data-requested="(true|false)"/g)];assert.equal(cells.length,v.coordinates.length-1);for(const cell of cells){const left=Number(cell[1]),expected=v.points.some((p,i)=>i%2===0&&p<=left&&left<v.points[i+1]);assert.equal(cell[3],String(expected));}
  if(v.current?.[0]==='queryRange')assert.ok(html.includes(`data-query-verdict="${v.phase==='result'?v.results[v.callIndex]:'pending'}"`));
  if(v.replacement!==null)assert.ok(html.includes(`data-boundary="${JSON.stringify(v.replacement)}"`));
  assert.match(html,/rm715p-cap open|points = \[\]/);
 }assert.equal(JSON.stringify(built),before);}}
});
