'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[1606],run=(k=3,arrival=[1,2,3,4,5],load=[5,2,3,3,3])=>p.builder(arrival,{k,load}),view=s=>s.serverSchedulingView;
function oracle(k,arrival,load){const until=Array(k).fill(0),handled=Array(k).fill(0),choices=[];let dropped=0;arrival.forEach((t,i)=>{let server=null;for(let j=0;j<k;j++){const candidate=(i+j)%k;if(until[candidate]<=t){server=candidate;break;}}choices.push(server);if(server===null)dropped++;else{handled[server]++;until[server]=t+load[i];}});const best=Math.max(...handled);return {choices,handled,dropped,answer:handled.flatMap((count,id)=>count===best?[id]:[])};}
function ui(lang='vi',extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-busiest-servers-1606.js'),'utf8'),ctx);return {ctx,render:(s,options)=>{ctx.renderBusiestServers1606(s,options);return host.innerHTML;}};}
test('1606 uses actual Python statement replay and keeps release, slot selection, counting and assignment separate',()=>{
  const r=run();assert.deepEqual(r.answer,[1]);assert.equal(p.debugMode,'line-by-line');assert.equal(view(r.steps.at(-1)).trace.truncated,false);assert.equal(r.steps.filter(s=>s.final).length,1);
  for(const s of r.steps){const v=view(s);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(p.code[s.codeLines[0]-1].trim(),v.source.text);assert.equal(s.serverHeap1606View,v);}
  for(const kind of ['release','requeue','slot','choose','count','assign','drop'])assert.ok(r.steps.some(s=>view(s).change?.kind===kind));
});
test('cyclic choices, finish-at-arrival releases, drops and ties match an independent scan at every request',()=>{
  const cases=[[3,[1,2,3,4,5],[5,2,3,3,3]],[3,[1,2,3,4],[1,2,1,2]],[3,[1,2,3],[10,12,11]],[3,[1,2,3,10],[5,4,3,1]],[3,[1,2,3,4,5,6],[8,1,8,1,1,1]],[2,[1,2,3,4],[10,10,10,10]],[1,[1,2,3],[1,1,1]],[8,[999999999,1000000000],[1000000000,1000000000]]];
  for(const[k,arrival,load]of cases){const r=run(k,arrival,load),expected=oracle(k,arrival,load),last=view(r.steps.at(-1));assert.deepEqual(r.answer,expected.answer);assert.deepEqual(last.handled,expected.handled);assert.equal(last.droppedCount,expected.dropped);
    for(const s of r.steps){const v=view(s);if(v.change?.kind==='choose')assert.equal(v.change.server,expected.choices[v.i]);if(v.change?.kind==='drop')assert.equal(expected.choices[v.i],null);if(v.change?.kind==='release')assert.ok(v.change.finished<=v.clock);}
  }
  const wrap=run(...cases[4]);assert.ok(wrap.steps.some(s=>view(s).change?.kind==='choose'&&view(s).server<view(s).preferred));
  assert.deepEqual(view(run(...cases[3]).steps.at(-1)).ledger.filter(row=>row.kind==='release').map(row=>row.server),[0,1,2]);
});
test('free, busy and temporarily held servers always form an exact partition of all servers',()=>{
  for(const[k,arrival,load]of [[3,[1,2,3,4,5],[5,2,3,3,3]],[1,[1,2,3],[1,1,1]],[8,[1,2,3,4,5,6,7,8,9],[1,2,3,4,5,6,7,8,9]]])for(const s of run(k,arrival,load).steps){const v=view(s);if(v.free===null||v.busy===null)continue;
    const ids=[...v.free.map(slot=>slot%k),...v.busy.map(job=>job[1]),...(v.release?[v.release.server]:[]),...(v.reserved===null?[]:[v.reserved%k])];assert.equal(ids.length,k,`${v.source.text}/${v.i}`);assert.equal(new Set(ids).size,k);
    for(const server of v.servers){const free=v.free.find(slot=>slot%k===server.id),busy=v.busy.find(job=>job[1]===server.id);if(free!==undefined)assert.equal(server.state,'free');if(busy)assert.equal(server.until,busy[0]);if(v.release?.server===server.id)assert.equal(server.state,'returning');if(v.reserved!==null&&v.reserved%k===server.id)assert.equal(server.state,'reserved');}
    if(v.i!==null)assert.ok(v.free.every(slot=>slot>=v.i));
  }
});
test('every heap array and handled counter is native; job bars appear only after the busy push executes',()=>{
  const r=run();let previous;
  for(const s of r.steps){const v=view(s),x=v.locals;for(const name of ['free','busy','handled'])assert.deepEqual(v[name],x[name]??null);
    if(v.change?.kind==='release'){assert.equal(v.busy.length,previous.busy.length-1);assert.deepEqual(v.free,previous.free);assert.equal(v.change.server,x.server);assert.equal(v.change.finished,x.finished);}
    if(v.change?.kind==='requeue'){assert.equal(v.change.slot,v.i+((x.server-v.i)%v.k+v.k)%v.k);assert.ok(v.free.includes(v.change.slot));}
    if(v.change?.kind==='slot'){assert.equal(v.reserved,x.slot);assert.equal(v.server,null);assert.deepEqual(v.handled,previous.handled);}
    if(v.change?.kind==='count'){const counts=[...previous.handled];counts[x.server]++;assert.deepEqual(v.handled,counts);assert.equal(v.jobs.length,previous.jobs.length);}
    if(v.change?.kind==='assign'){assert.equal(v.jobs.length,previous.jobs.length+1);const row=v.jobs.at(-1);assert.deepEqual([row.end,row.server],[x.time+x.duration,x.server]);assert.ok(v.busy.some(job=>job[0]===row.end&&job[1]===row.server));}
    else if(previous)assert.equal(v.jobs.length,previous.jobs.length);
    for(const name of ['free','busy']){const a=v[name];if(a)for(let i=1;i<a.length;i++){const parent=a[Math.floor((i-1)/2)],child=a[i];assert.ok(name==='free'?parent<=child:parent[0]<child[0]||parent[0]===child[0]&&parent[1]<=child[1]);}}
    previous=v;
  }
});
test('all completed lines, branches, locals, frames and returns match CPython for complete and bounded replay',()=>{
  const cases=[[3,[1,2,3,4,5],[5,2,3,3,3]],[1,Array.from({length:200},(_,i)=>i+1),Array(200).fill(1)],[100000,[1],[1]]];
  const items=cases.map(([k,arrival,load])=>({code:p.code.join('\n'),method:'busiestServers',args:[k,arrival,load],...(k>8||arrival.length>16?{maxEvents:600,summarizeLocals:{arrival:16,load:16,free:16,busy:16,handled:16}}:{})}));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(...cases[i]);assert.deepEqual(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const v=view(r.steps[j]);for(const key of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[key],e[key],`${i}/${j}/${key}`);assert.deepEqual(r.steps[j].codeLines,[e.line]);for(const watch of r.steps[j].vars)assert.deepEqual(watch.rawValue,e.locals[watch.name]);});});
});
test('large runs keep full winners and drop/count totals while clearly bounding source replay and pictures',()=>{
  for(const[k,arrival,load]of [[1,Array.from({length:200},(_,i)=>i+1),Array(200).fill(1000)],[100000,[1],[1]]]){const r=run(k,arrival,load),last=view(r.steps.at(-1)),expected=oracle(k,arrival,load);assert.deepEqual(r.answer,expected.answer);assert.equal(last.droppedCount,expected.dropped);assert.equal(last.best,Math.max(...expected.handled));assert.deepEqual(last.handled,expected.handled.slice(0,16));assert.equal(last.preview,true);assert.ok(r.steps.length<=601);assert.ok(last.servers.length<=8);assert.ok(last.requests.length<=16);if(arrival.length===200)assert.equal(last.omitted,true);}
});
test('all example frames render faithfully in VI/EN, preserve snapshots and rewind deterministically',()=>{
  const cases=vm.runInContext('BS1606_CASES',ui().ctx).map(c=>[c[0],Array.from(c[1]),Array.from(c[2])]);cases.push([8,Array.from({length:16},(_,i)=>i+1),Array(16).fill(3)]);
  for(const c of cases){const r=run(...c),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){const renderer=ui(lang),first=renderer.render(r.steps[0]);for(const s of r.steps){const html=renderer.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${s.codeLines[0]}"`));}assert.equal(renderer.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),saved);}
});
test('large preview states render actual heap prefixes without fabricated counts or invalid values',()=>{
  for(const c of [[100000,[1],[1]],[1,Array.from({length:200},(_,i)=>i+1),Array(200).fill(1)]]){const r=run(...c),renderer=ui();for(const s of r.steps)assert.doesNotMatch(renderer.render(s),/undefined|NaN|Infinity|object Object/);const v=view(r.steps.at(-1));assert.ok(renderer.render(r.steps.at(-1)).includes('kết quả tính đầy đủ'));assert.ok(v.servers.every(server=>server.count===v.handled[server.id]));}
});
test('server inspection preserves native data; source/assign/release/drop/result navigation uses real events',()=>{
  const r=run(),renderer=ui('vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});for(const kind of ['line','release','assign','drop','result']){renderer.ctx.stepIndex=0;const target=renderer.ctx.bs1606Next(kind);assert.ok(target>0);renderer.ctx.bs1606Go(target);assert.equal(renderer.ctx.stepIndex,target);}renderer.ctx.stepIndex=r.steps.length-1;for(const kind of ['line','release','assign','drop','result'])assert.equal(renderer.ctx.bs1606Next(kind),-1);
  const s=r.steps.at(-1),saved=JSON.stringify(s);for(let i=0;i<3;i++)assert.ok(renderer.render(s,{selected:i}).includes(`data-inspect-server="${i}"`));assert.equal(JSON.stringify(s),saved);
});
test('strict arrays, matching loads, full constraints and immutable live arguments are enforced',()=>{
  for(const a of ['',[],Array(2),[true],[NaN],[0],[1.5],[1e9+1],'1,,2','[1,]'])assert.throws(()=>p.builder(a,{k:1,load:[1]}));
  for(const k of [0,100001,1.5,true,'3',null])assert.throws(()=>run(k,[1],[1]));
  for(const load of [[],[0],[true],[NaN],Array(1),'',null])assert.throws(()=>run(1,[1],load));
  assert.throws(()=>run(1,[1,1],[1,1]));assert.throws(()=>run(1,[2,1],[1,1]));assert.throws(()=>run(1,[1,2],[1]));assert.throws(()=>p.builder([1],null));
  const a=[1,2,3],load=[2,2,2],saved=JSON.stringify([a,load]);run(2,a,load);assert.equal(JSON.stringify([a,load]),saved);assert.deepEqual(p.liveArgs('[1,2,3]',{k:2,load:'2,2,2'}),[2,a,load]);
});
test('1606 assets are lazy and its dedicated renderer takes precedence over the legacy view',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/renderer-busiest-servers-1606|busiest-servers-1606\.css/);
  for(const asset of ['renderer-busiest-servers-1606.js','busiest-servers-1606.css','tree-replay-pictures.css'])assert.match(html.split('\n').find(line=>line.includes(asset)),/data-problem-ids="[^"]*1606/);
  const script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');assert.ok(script.indexOf('Boolean(step.serverSchedulingView)')<script.indexOf('Boolean(step.serverHeap1606View)'));
});
