'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[1284],methods=require('../problems/minimum-flips-1284-methods');
const build=(m,input)=>p[`builder${m===1?'':m}`](input),pack=mat=>mat.flat().reduce((mask,bit,i)=>mask|(bit<<i),0);
function flips(rows,cols){return Array.from({length:rows*cols},(_,i)=>{let mask=0;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(Math.abs(r-Math.floor(i/cols))+Math.abs(c-i%cols)<=1)mask|=1<<(r*cols+c);return mask;});}
function oracle(rows,cols){const moves=flips(rows,cols),best=Array(1<<(rows*cols)).fill(-1);for(let subset=0;subset<best.length;subset++){let mask=0,cost=0;for(let i=0;i<moves.length;i++)if(subset&(1<<i)){mask^=moves[i];cost++;}if(best[mask]<0||cost<best[mask])best[mask]=cost;}return best;}
const fixtures=[[[0]],[[1]],[[0,0],[0,1]],[[1,0,0],[1,0,0]],[[1],[0],[1]],[[1,1,0],[0,1,0]],[[0,0,0],[0,0,0],[0,0,0]]];
test('1284 registers seven complete methods, keeps every official matrix size, and rejects malformed binary input',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.equal(p.extraParams[0].options.length,7);assert.deepEqual(p.liveArgs('00;01'),[[[0,0],[0,1]]]);assert.deepEqual(p.liveArgs('0,0|0,1'),p.liveArgs('[[0,0],[0,1]]'));
 for(const bad of['','0,;1,0','01;1','0000','2','bad',[],[[]],[[true]],[[0],[1],[0],[1]],[[0.5]]])for(let m=1;m<=7;m++)assert.throws(()=>build(m,bad),/1284/);
 for(let m=1;m<=7;m++){assert.equal(typeof p[`builder${m===1?'':m}`],'function');assert.deepEqual(p[`code${m===1?'':m}`],methods[m-1].code);}
});
test('all seven displayed Python algorithms solve all 682 binary boards of sizes 1×1 through 3×3',()=>{
 const cases=[];for(let rows=1;rows<=3;rows++)for(let cols=1;cols<=3;cols++){const expected=oracle(rows,cols);for(let mask=0;mask<expected.length;mask++)cases.push({mat:Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>(mask>>(r*cols+c))&1)),answer:expected[mask]});}
 assert.equal(cases.length,682);
 const source=`import json,sys
p=json.load(sys.stdin)
out=[]
for code in p['codes']:
    scope={}
    exec(code,scope)
    out.append([scope['Solution']().minFlips(case['mat']) for case in p['cases']])
print(json.dumps(out))`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({codes:methods.map(m=>m.code.join('\n')),cases}),encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(proc.status,0,proc.stderr);JSON.parse(proc.stdout).forEach((answers,i)=>assert.deepEqual(answers,cases.map(c=>c.answer),`method ${i+1}`));
});
test('1284 states preserve exact XOR transitions, queue previews, real solutions and immutable inputs for all methods',()=>{
 for(let m=1;m<=7;m++)for(const mat of fixtures){const before=JSON.stringify(mat),run=build(m,mat),expected=oracle(mat.length,mat[0].length)[pack(mat)];assert.equal(run.answer,expected);assert.equal(JSON.stringify(mat),before);assert.equal(run.steps.filter(s=>s.final).length,1);
 for(const s of run.steps){const v=s.flips1284View;assert.deepEqual(s.codeLines,[v.line]);assert.equal(s.codeBlock,m);assert.equal(v.source,methods[m-1].code[v.line-1].trim());assert.ok(v.current>=0&&v.current<1<<v.total);if(v.transition){const a=v.transition;assert.equal(a.from^a.flip,a.to);assert.equal(a.flip,a.skip?0:flips(v.rows,v.cols)[a.index]);if(a.skip)assert.equal(a.from,a.to);}
  if(v.queueSize!==null)assert.equal(v.queue.length,Math.min(6,v.queueSize));
  for(const item of v.queue){const mask=item.path.reduce((at,index)=>at^v.allFlips[index],v.start);assert.equal(item.mask,mask);}
  if(v.solution!==null)assert.equal(v.solution.reduce((at,index)=>at^v.allFlips[index],v.start),0);
  for(const frame of v.stack){assert.ok(frame.index>=0&&frame.index<=v.total);assert.equal(frame.mask,frame.path.reduce((at,index)=>at^v.allFlips[index],v.start));}
 }const final=run.steps.at(-1).flips1284View;assert.equal(final.answer,expected);if(expected<0)assert.equal(final.solution,null);else assert.equal(final.solution.length,expected);
 }
 for(const m of[6,7]){const run=build(m,[[1,0,1],[0,1,0],[1,0,1]]);assert.equal(run.answer,9);assert.equal(run.steps.at(-1).flips1284View.solution.length,9);}
});
test('native CPython confirms every completed statement, helper scope and debugger watch for all seven sources',()=>{
 const source=`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace(item))['events'] for item in p['items']]))`;
 const items=methods.map(m=>({code:m.code.join('\n'),method:'minFlips',args:[fixtures[2]],...p.traceOptions}));const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(proc.status,0,proc.stderr);
 JSON.parse(proc.stdout).forEach((events,i)=>{const run=build(i+1,fixtures[2]);assert.equal(run.steps.length,events.length);events.forEach((event,j)=>{const s=run.steps[j],v=s.flips1284View,x={...event.outer,...event.locals};assert.equal(v.line,event.line);assert.equal(v.scope,event.scope);s.vars.forEach(w=>assert.deepEqual(w.value,x[w.name]??'—'));if(v.phase!=='encode'&&i===1&&x.board)assert.equal(v.current,pack(x.board));if(i!==1&&v.phase!=='encode'&&x.mask!==undefined&&i!==6)assert.equal(v.current,x.mask);});});
});
test('matrix BFS summaries retain exact queue heads and counts without changing source events or answers',()=>{
 const source=`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
full=json.loads(trace(p['item']))
p['item'].update(p['options'])
small=json.loads(trace(p['item']))
for a,b in zip(full['events'],small['events']):
    assert a['line']==b['line'] and a['scope']==b['scope']
    for name in ('q','seen'):
        if name in a['outer']:
            assert b['outer']['len('+name+')']==len(a['outer'][name])
    if 'q' in a['outer']:
        assert b['outer']['list(q)[:6]']==a['outer']['q'][:6]
assert len(full['events'])==len(small['events']) and full['answer']==small['answer']
print('ok')`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),item:{code:methods[1].code.join('\n'),method:'minFlips',args:[fixtures[2]]},options:p.traceOptions}),encoding:'utf8'});assert.equal(proc.status,0,proc.stderr);assert.equal(proc.stdout.trim(),'ok');
});
test('DFS skip edges keep the board unchanged and bidirectional labels survive individual swap statements',()=>{
 const dfs=build(5,fixtures[2]);assert.ok(dfs.steps.some(s=>s.flips1284View.transition?.skip));
 for(const s of dfs.steps){const v=s.flips1284View,move=v.transition;if(!move)continue;const child=v.stack.at(-1),parent=v.stack.at(-2);assert.equal(move.from,parent.mask);assert.equal(move.to,child.mask);assert.equal(move.skip,child.path.length===parent.path.length);}
 const bfs=build(3,fixtures[2]);assert.ok(bfs.steps.some(s=>s.flips1284View.source==='front, back = back, front'));
 for(const s of bfs.steps){const v=s.flips1284View;for(const[name,origin]of[['front',v.frontOrigin],['back',v.backOrigin]])for(const entry of v[name])assert.equal(entry.path.reduce((mask,index)=>mask^v.allFlips[index],origin==='mat'?v.start:0),entry.mask);}
});
test('pictures render exact cell bits, actual queue heads, RREF rows, solutions and replay in Vietnamese and English',()=>{
 const host={innerHTML:''},ctx={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-flips-1284.js'),'utf8'),ctx);
 for(const language of['vi','en']){ctx.lang=language;for(let m=1;m<=7;m++)for(const mat of[fixtures[2],fixtures[3]]){const run=build(m,mat),before=JSON.stringify(run);for(const s of run.steps){const v=s.flips1284View;ctx.renderMinimumFlips1284View(s);const html=host.innerHTML;assert.doesNotMatch(html,/undefined|NaN|Infinity/);assert.match(html,/mf1284-viz/);
  const masks=[...html.matchAll(/data-board-mask="(\d+)"[^>]*>([\s\S]*?)<\/div>/g)];for(const[,mask,content]of masks){const bits=[...content.matchAll(/data-bit="(\d)"/g)].map(x=>Number(x[1]));assert.equal(bits.length,v.total);assert.deepEqual(bits,Array.from({length:v.total},(_,i)=>(Number(mask)>>i)&1));}
  assert.deepEqual([...html.matchAll(/data-queue-index="\d+" data-state-mask="(\d+)"/g)].map(x=>Number(x[1])),v.queue.map(q=>q.mask));
  assert.deepEqual([...html.matchAll(/data-equation-value="(\d+)"/g)].map(x=>Number(x[1])),v.equations??[]);
  if(v.solution!==null)assert.equal(Number([...html.matchAll(/data-route-mask="(\d+)"/g)].at(-1)[1]),0);
 }ctx.renderMinimumFlips1284View(run.steps[0]);const first=host.innerHTML;ctx.renderMinimumFlips1284View(run.steps.at(-1));ctx.renderMinimumFlips1284View(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);}}
});
