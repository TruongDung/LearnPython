'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[301];
const cases=['()())()','(a)())()',')(','a','(','()','abc','((a))','(()','())(()','a)b(c)d','())())','((((((((((((((','()()()()()()()'];
function valid(text){let balance=0;for(const ch of text){balance+=ch==='('?1:ch===')'?-1:0;if(balance<0)return false;}return balance===0;}
function oracle(s){const positions=[...s].flatMap((c,i)=>'()'.includes(c)?[i]:[]);let best=Infinity,out=new Set();for(let mask=0;mask<2**positions.length;mask++){const removed=new Set(positions.filter((_,j)=>mask&2**j));if(removed.size>best)continue;const text=[...s].filter((_,j)=>!removed.has(j)).join('');if(valid(text)){if(removed.size<best){best=removed.size;out=new Set();}out.add(text);}}return [...out].sort();}
function allStrings(length,prefix=''){if(!length)return [prefix];return [...'()a'].flatMap(ch=>allStrings(length-1,prefix+ch));}
test('301 returns every unique answer with minimum deletions, preserving letters, including max-length inputs',()=>{
  for(const s of [...cases,...[1,2,3,4,5].flatMap(n=>allStrings(n))]){const run=p.builder(s);assert.deepEqual(run.answer,oracle(s),s);assert.equal(run.steps.filter(step=>step.final).length,1);assert.equal(run.steps.at(-1).removeInvalid301View.minimum,true);assert.deepEqual(run.steps.at(-1).removeInvalid301View.results,run.answer);}
  for(const s of ['',null,undefined,1,[],['()'],'A','abc def','a'.repeat(15)]){assert.throws(()=>p.builder(s));assert.throws(()=>p.liveArgs(s));}
  assert.deepEqual(p.liveArgs('()'),['()']);
});
test('301 matches every completed CPython statement, helper local and persistent method local, with exact frontier counts',()=>{
  const python=`import sys,json,copy
payload=json.load(sys.stdin);scope={};filename='<rp301>';exec(compile(payload['source'],filename,'exec'),scope);runs=[]
for s in payload['cases']:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('removeInvalidParentheses','is_valid'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;outer=frame.f_back.f_locals if frame.f_code.co_name=='is_valid' else x
    keys=('text','balance','index','ch') if frame.f_code.co_name=='is_valid' else ('s','text','i')
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in keys if k in x}),'level':copy.deepcopy(outer.get('level',[])),'context':{'levelSize':len(outer['level']) if 'level' in outer else None,'nextSize':len(outer['next_level']) if 'next_level' in outer else None,'valid':copy.deepcopy(outer.get('valid'))}})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().removeInvalidParentheses(s);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const proc=spawnSync('python3',['-c',python],{input:JSON.stringify({source:p.code.join('\n'),cases}),encoding:'utf8',maxBuffer:64*1024*1024});assert.equal(proc.status,0,proc.stderr);
  JSON.parse(proc.stdout).forEach((reference,c)=>{const run=p.builder(cases[c]);assert.deepEqual(run.answer,reference.answer);assert.equal(run.steps.length,reference.events.length,cases[c]);
    run.steps.forEach((step,j)=>{const v=step.removeInvalid301View,e=reference.events[j],label=`${cases[c]} event ${j} L${e.line}`;
      assert.deepEqual(step.codeLines,[e.line],label);assert.equal(v.scope,e.scope,label);assert.deepEqual(v.locals,e.locals,label);assert.deepEqual(v.context,e.context,label);
      assert.deepEqual(v.current.items.map(item=>item.text),e.level.slice(v.current.start,v.current.start+8),label);assert.equal(v.current.total,e.level.length);assert.equal(v.source.timing,'after');assert.equal(v.source.text,p.code[e.line-1]);
      const x=e.locals;assert.deepEqual(step.vars.map(w=>w.value),e.scope==='is_valid'?[x.text,x.index??'—',x.ch??'—',x.balance,x.text.length,x.balance<0]:[x.text??'—',x.i??'—',e.context.levelSize??'—',e.context.nextSize??'—',e.context.valid?.length??'—',x.s],label);
    });
  });
});
test('301 reveals only processed scan segments, stops at the first negative prefix and proves minimality after the whole layer',()=>{
  for(const s of cases){const run=p.builder(s);let previous=null;
    for(const step of run.steps){const v=step.removeInvalid301View,scan=v.scan;
      if(scan){const prefix=scan.text.slice(0,scan.processed);assert.equal([...prefix].reduce((sum,c)=>sum+(c==='('?1:c===')'?-1:0),0),scan.balance);assert.ok(scan.processed<=scan.text.length);if(scan.result===true){assert.equal(scan.processed,scan.text.length);assert.equal(scan.balance,0);}if(scan.balance<0)assert.equal(scan.processed,scan.text.indexOf(')',scan.processed-1)+1);}
      if(v.phase==='minimum'){assert.equal(v.history.at(-1).checked,v.current.total);assert.ok(v.results.length>0);assert.ok(v.history.slice(0,-1).every(row=>row.status==='rejected'&&row.valid===0));}
      if(v.minimum)assert.equal(v.generation,false);
      if(v.removal){const r=v.removal;assert.ok('()'.includes(r.char));assert.equal(r.child,r.parent.slice(0,r.index)+r.parent.slice(r.index+1));assert.equal(v.next.total,previous.next.total+(r.duplicate?0:1));}
      if(v.phase==='letter'){assert.equal(v.removal,null);assert.match(v.locals.text[v.locals.i],/[a-z]/);}
      assert.ok(v.current.items.length<=8);assert.ok(v.next.items.length<=8);previous=v;
    }
    const final=run.steps.at(-1).removeInvalid301View;assert.equal(final.depth,s.length-run.answer[0].length);
  }
  const duplicate=p.builder('()())()').steps.find(step=>step.removeInvalid301View.phase==='duplicate');assert.ok(duplicate);
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},ctx={lang,$:()=>host,escapeHtml:value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-remove-invalid-301.js'),'utf8'),ctx);return {ctx,render:step=>{ctx.renderRemoveInvalidParentheses301View(step);return host.innerHTML;}};}
test('301 renders truthful diagrams in both languages, supports rewind and shows every result without duplicated prose/source rails',()=>{
  for(const lang of ['vi','en']){const {render}=renderer(lang);for(const s of cases.slice(0,12)){const run=p.builder(s),before=JSON.stringify(run);for(const step of run.steps){const v=step.removeInvalid301View,html=render(step);assert.match(html,/rp301-viz/);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<table\b|sourceRail/);assert.match(html,new RegExp(`L${v.source.line} ✓`));
      if(v.scan&&!v.generation&&!step.final){const segments=[...html.matchAll(/data-prefix="(\d+)" data-balance="(-?\d+)"/g)];assert.equal(segments.length,v.scan.processed);if(segments.length)assert.equal(Number(segments.at(-1)[2]),v.scan.balance);}
      if(step.final)assert.doesNotMatch(html,/rp301-inspect/);
      assert.equal((html.match(/data-result=/g)||[]).length,v.results.length);if(v.removal)assert.match(html,/data-child=/);else assert.doesNotMatch(html,/data-child=/);
    }const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),before);}
    assert.match(render(p.builder(')(').steps.at(-1)),/data-result=""/);
  }
});
test('301 event navigation jumps to actual deletion or appended result and finishes safely',()=>{
  let handler,stopped=0,rendered=0;const host={innerHTML:'',querySelector:()=>({addEventListener:(event,fn)=>handler=fn})},run=p.builder('()())()');const {ctx,render}=renderer('vi',{$:()=>host,steps:run.steps,stepIndex:0,stopPlay:()=>stopped++,renderStep:()=>rendered++});render(run.steps[0]);handler();assert.equal(ctx.steps[ctx.stepIndex].removeInvalid301View.phase,'delete');
  ctx.stepIndex=run.steps.length-1;handler();assert.equal(ctx.stepIndex,run.steps.length-1);assert.equal(stopped,2);assert.equal(rendered,2);
});
test('301 assets remain lazy and code scrolls horizontally in both themes with sticky scope watches',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/remove-invalid-301.css'),'utf8');
  assert.equal(p.debugMode,'line-by-line');assert.match(html,/remove-invalid-301\.css[^\n]*data-problem-ids="301"/);assert.match(html,/renderer-remove-invalid-301\.js[^\n]*data-problem-ids="301"/);assert.match(css,/\[data-theme="light"\] \.rp301-viz/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/\.code-line\s*\{[^}]*white-space:pre/);assert.match(css,/#varsPanel[^}]*position:sticky/);
});
