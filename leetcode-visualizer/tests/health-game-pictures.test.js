'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const {SUPPORTED}=require('../problems'),host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-health-game-pictures.js'),'utf8'),ctx);
const plain=x=>JSON.parse(JSON.stringify(x)),presets=plain(vm.runInContext('HG_PRESETS',ctx));
const build=(id,input=SUPPORTED[id].defaultInput,params={})=>SUPPORTED[id].builder(input,params);
let seed=2214;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function armorOracle(damage,armor,choice=null){for(let start=1;start<=damage.reduce((a,b)=>a+b,0)+1;start++)for(const shield of choice===null?damage.map((_,i)=>i):[choice]){let hp=start;for(let i=0;i<damage.length;i++){hp-=damage[i]-(i===shield?Math.min(damage[i],armor):0);if(hp<=0)break;}if(hp>0)return start;}}
function dungeonOracle(grid,row=0,col=0){let best=Infinity;function walk(r,c,total,minimum){total+=grid[r][c];minimum=Math.min(minimum,total);if(r===grid.length-1&&c===grid[0].length-1){best=Math.min(best,1-minimum);return;}if(r+1<grid.length)walk(r+1,c,total,minimum);if(c+1<grid[0].length)walk(r,c+1,total,minimum);}walk(row,col,0,0);return best;}
const armorCases=[...presets[2214].map(p=>[p.input,p.armor]),[[0,0,0],0],[[4,4,4],2],[[10,1,1],0],...Array.from({length:24},()=>[Array.from({length:1+rand(8)},()=>rand(10)),rand(13)])];
const dungeonCases=[...presets[174].map(p=>p.input),[[-5]],[[0]],[[5,-8,4]],[[1],[-2],[3]],[[-2,-2],[-2,-2]],...Array.from({length:18},()=>{const rows=1+rand(4),cols=1+rand(4);return Array.from({length:rows},()=>Array.from({length:cols},()=>rand(21)-10));})];

test('2214 minimum health matches exhaustive health and shield choices, with native sum/max state',()=>{
  for(const [damage,armor]of armorCases){const r=build(2214,damage,{armor}),v=r.steps.at(-1).healthGameView;assert.equal(r.answer,armorOracle(damage,armor));assert.equal(v.total,damage.reduce((a,b)=>a+b,0));assert.equal(v.peak,Math.max(...damage));assert.equal(v.saved,Math.min(v.peak,armor));assert.equal(damage[v.shieldIndex],v.peak);
    for(const st of r.steps){const v=st.healthGameView;assert.equal(SUPPORTED[2214].code[v.line-1].trim(),v.source);assert.equal(v.trace.truncated,false);if(v.total!==null)assert.equal(v.total,damage.slice(0,v.processed).reduce((a,b)=>a+b,0));}
  }
});

test('2214 each selectable shield is used once, never blocks more than the hit, and HP−1 fails',()=>{
  for(const [damage,armor]of armorCases.slice(0,13)){const v=build(2214,damage,{armor}).steps.at(-1).healthGameView;for(let index=0;index<damage.length;index++){
    const p=ctx.hgPlan(v,index,false),bad=ctx.hgPlan(v,index,true);assert.equal(p.required,armorOracle(damage,armor,index));assert.ok(p.saved<=armor&&p.saved<=damage[index]);assert.ok(p.required>=v.answer);assert.equal(p.simulation.death,null);assert.equal(p.simulation.rows.at(-1).after,1);assert.notEqual(bad.simulation.death,null);
    p.deltas.forEach((delta,i)=>assert.equal(delta,-damage[i]+(i===index?p.saved:0)));for(let i=(bad.simulation.death??-1)+1;i<damage.length;i++)assert.equal(bad.simulation.rows[i],null);
  }}
  const v=build(2214,[2,7,4,3],{armor:4}).steps.at(-1).healthGameView;assert.equal(ctx.hgPlan(v,1,false).required,13);assert.equal(ctx.hgPlan(v,2,false).required,13);assert.equal(ctx.hgPlan(v,0,false).required,15);
});

test('174 only reveals computed cells, each written once in reverse dependency order',()=>{
  for(const grid of dungeonCases){const r=build(174,grid),expected=dungeonOracle(grid);assert.equal(r.answer,expected);let previous=0;
    for(const st of r.steps){const v=st.healthGameView;assert.equal(SUPPORTED[174].code[v.line-1].trim(),v.source);assert.equal(v.trace.truncated,false);const count=v.computed.flat().filter(Boolean).length;assert.ok(count===previous||count===previous+1);previous=count;
      if(v.dp)for(let row=0;row<v.rows;row++)for(let col=0;col<v.cols;col++){if(v.computed[row][col])assert.equal(v.dp[row][col],dungeonOracle(grid,row,col));else assert.equal(v.dp[row][col],null);}
      if(v.phase==='write'){assert.ok(v.neighbors.every(n=>n.need!==null&&n.need>=1));assert.equal(v.nextNeed,v.neighbors.length?Math.min(...v.neighbors.map(n=>n.need)):1);assert.equal(v.required,Math.max(1,v.nextNeed-v.delta));assert.equal(v.rawDP[v.active[0]][v.active[1]],v.required);}
    }
    assert.equal(previous,grid.length*grid[0].length);assert.equal(r.steps.at(-1).healthGameView.writes.length,previous);assert.equal(new Set(r.steps.at(-1).healthGameView.writes.map(w=>w.cell.join(':'))).size,previous);
    assert.ok(r.steps.slice(0,2).every(s=>s.healthGameView.computed.flat().every(n=>!n)));
  }
});

test('174 optimal paths move only right/down and survive every room at the reported HP',()=>{
  for(const grid of dungeonCases){const v=build(174,grid).steps.at(-1).healthGameView,p=ctx.hgPlan(v,null,false),bad=ctx.hgPlan(v,null,true);assert.equal(v.path.length,v.rows+v.cols-1);assert.deepEqual(v.path[0],[0,0]);assert.deepEqual(v.path.at(-1),[v.rows-1,v.cols-1]);for(let i=1;i<v.path.length;i++){const [r,c]=v.path[i],[a,b]=v.path[i-1];assert.ok(r-a===1&&c===b||c-b===1&&r===a);}
    assert.equal(p.simulation.death,null);assert.ok(p.simulation.rows.every(row=>row.alive&&row.after>=1));assert.notEqual(bad.simulation.death,null);assert.deepEqual(plain(p.deltas),v.path.map(([r,c])=>grid[r][c]));
  }
});

test('health simulations never revive after HP0, even when the next room heals',()=>{
  const initial=ctx.hgSimulate([5],0);assert.equal(initial.death,-1);assert.equal(initial.last,-1);assert.equal(initial.rows[0],null);
  const died=ctx.hgSimulate([-1,100,-1],1);assert.equal(died.rows[0].after,0);assert.equal(died.rows[0].alive,false);assert.equal(died.rows[1],null);assert.equal(died.rows[2],null);
  const trap=build(174,[[-1,-100],[100,-1]]);assert.equal(trap.answer,2);const v=trap.steps.at(-1).healthGameView;assert.equal(ctx.hgPlan(v,null,true).simulation.death,0);
  assert.equal(build(174,[[5]]).answer,1);assert.equal(build(2214,[5],{armor:10}).answer,1);
});

test('2214 and 174 render every immutable native frame and every HP trial in VI and EN',()=>{
  function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);Object.values(x).forEach(freeze);}return x;}
  for(const id of[2214,174])for(const p of presets[id]){const r=freeze(build(id,p.input,id===2214?{armor:p.armor}:{})),before=JSON.stringify(r);ctx.steps=r.steps;
    for(const language of['vi','en']){ctx.lang=language;r.steps.forEach((st,i)=>{ctx.stepIndex=i;ctx.renderHealthGamePictures(st);assert.match(host.innerHTML,new RegExp(`data-health-problem="${id}"`));assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);if(id===174)assert.equal((host.innerHTML.match(/data-hg-room=/g)||[]).length,p.input.length*p.input[0].length);});
      const st=r.steps.at(-1),v=st.healthGameView;ctx.stepIndex=r.steps.length-1;
      for(const trial of['0','1']){host.dataset.hgTrialState=trial;delete host.dataset.hgCursorState;ctx.renderHealthGamePictures(st);const plan=ctx.hgPlan(v,v.shieldIndex,trial==='1');assert.equal(Number(host.innerHTML.match(/data-hg-hp="(-?\d+)"/)[1]),plan.simulation.last>=0?plan.simulation.rows[plan.simulation.last].after:plan.simulation.start);}
    }assert.equal(JSON.stringify(r),before);
  }
});

test('health lesson inputs reject malformed values and retain complete maximum-sized visualizations',()=>{
  for(const input of[[],[-1],[1.2],Array(25).fill(1),'1,,2',null])assert.throws(()=>build(2214,input,{armor:4}),/2214/);
  for(const armor of[-1,1.1,100001])assert.throws(()=>build(2214,[1],{armor}),/2214/);
  for(const grid of['',null,[],[[1],[]],[[1,2],[3]],[[1001]],'1,;2,3',Array.from({length:7},()=>[1])])assert.throws(()=>build(174,grid),/174/);
  assert.equal(build(174,'-2,-3,3;-5,-10,1;10,30,-5').answer,7);assert.equal(build(174,'[[-5]]').answer,6);
  const armor=build(2214,Array(24).fill(100000),{armor:100000});assert.equal(armor.answer,2300001);assert.equal(armor.steps.at(-1).healthGameView.trace.truncated,false);
  const dungeon=build(174,Array.from({length:6},()=>Array(6).fill(-1000)));assert.equal(dungeon.answer,11001);assert.equal(dungeon.steps.at(-1).healthGameView.trace.truncated,false);
});

test('Python files match displayed source, handle full-sized inputs and agree with both independent oracles',()=>{
  const paths={174:require.resolve('../../Leetcode-sln/dynamic-programming/Leetcode_174.py'),2214:require.resolve('../../Leetcode-sln/greedy/Leetcode_2214.py')};for(const id of[174,2214])assert.equal(fs.readFileSync(paths[id],'utf8').trim(),SUPPORTED[id].code.join('\n'));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\na=runpy.run_path(p['paths']['2214'])['Solution']()\nd=runpy.run_path(p['paths']['174'])['Solution']()\nassert a.minimumHealth([100000]*100000,100000)==9999900001\nassert d.calculateMinimumHP([[-1]*200 for _ in range(200)])==400\nprint(json.dumps({'armor':[a.minimumHealth(x,y) for x,y in p['armor']],'dungeon':[d.calculateMinimumHP(g) for g in p['dungeon']]}))";
  const r=spawnSync(process.env.PYTHON||'python3',['-c',script],{encoding:'utf8',input:JSON.stringify({paths,armor:armorCases,dungeon:dungeonCases})});assert.equal(r.status,0,r.stderr);assert.deepEqual(JSON.parse(r.stdout),{armor:armorCases.map(([d,a])=>armorOracle(d,a)),dungeon:dungeonCases.map(g=>dungeonOracle(g))});
  assert.deepEqual(SUPPORTED[2214].liveArgs('2,7,4,3',{armor:4}),[[2,7,4,3],4]);assert.deepEqual(SUPPORTED[174].liveArgs('[[5]]'),[[[5]]]);
});

test('health assets load only for their lessons and include light/dark and narrow-screen styles',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/health-game-pictures.css'),'utf8');for(const name of['renderer-health-game-pictures.js','health-game-pictures.css'])assert.equal(html.split(name+'?').length-1,1);assert.match(css,/\[data-theme="light"\]/);assert.match(css,/@media\(max-width:480px\)/);assert.equal(SUPPORTED[174].debugMode,'line-by-line');assert.equal(SUPPORTED[2214].premium,true);
});
