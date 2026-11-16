'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {SUPPORTED:P}=require('../problems');
const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]};
const context={lang:'vi',$:()=>host};vm.createContext(context);
for(const name of['longest-increasing-path-329','cherry-pickup-741'])vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-'+name+'.js'),'utf8'),context);
function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);Object.values(x).forEach(freeze);}return x;}
function legalIncreasing(matrix,path){
 for(let i=1;i<path.length;i++){
  const[r,c]=path[i-1],[a,b]=path[i];assert.equal(Math.abs(r-a)+Math.abs(c-b),1);assert.ok(matrix[a][b]>matrix[r][c]);
 }
}
test('every computed memo cell yields a legal increasing witness without solving unknown cells',()=>{
 const matrices=[[[9,9,4],[6,6,8],[2,1,1]],[[1,2,3],[6,5,4]],[[2,2],[2,2]],[[-4,-3],[-1,-2]],[[7]]];
 for(const matrix of matrices){
  const run=freeze(P[329].builder(matrix)),before=JSON.stringify(run);
  for(const step of run.steps){const v=step.longestIncreasingPath329View;
   for(let r=0;r<matrix.length;r++)for(let c=0;c<matrix[0].length;c++){
    const path=context.lp329MemoPath(v,[r,c]);assert.equal(path.length,v.dp?.[r][c]??0);legalIncreasing(matrix,path);
   }
  }
  const final=run.steps.at(-1).longestIncreasingPath329View;
  for(let r=0;r<matrix.length;r++)for(let c=0;c<matrix[0].length;c++){
   const scene=context.lp329Scene(final,{lp329CellState:`${r}:${c}`});assert.equal(scene.path.length,final.dp[r][c]);assert.deepEqual(Array.from(scene.path[0]),[r,c]);
  }
  assert.equal(JSON.stringify(run),before);
 }
});
test('all enumerated routes remain selectable by coordinates, including duplicate value sequences',()=>{
 const run=freeze(P[329].builder2('1,1;3,4')),v=run.steps.at(-1).longestIncreasingPath329View,before=JSON.stringify(run),coordinates=new Set();
 v.groups.forEach((group,g)=>group.paths.forEach((path,p)=>{
  const scene=context.lp329Scene(v,{lp329PathState:`${g}:${p}`});assert.equal(scene.path.length,group.length);legalIncreasing(v.matrix,scene.path);coordinates.add(JSON.stringify(scene.path));
 }));
 assert.equal(coordinates.size,v.count);assert.equal(JSON.stringify(run),before);
});
test('two-grid trip and synchronized replays collect each coordinate at most once',()=>{
 for(const input of['0,1,-1|1,0,-1|1,1,1','1','0','1,1|1,1','0,0|0,0','0,-1|-1,1']){
  const run=freeze(P[741].builder(input)),before=JSON.stringify(run),state=context.cp741Normalize(run.steps.at(-1));
  for(const mode of['trip','sync']){
   const end=context.cp741PairModel(state,mode);
   if(!state.witness.reachable){assert.equal(end.witness,null);assert.equal(end.total,0);continue;}
   let previous=-1;
   for(let time=0;time<=end.limit;time++){
    const model=context.cp741PairModel(state,mode,time),a=model.roles[0].trail,b=model.roles[1].trail;
    const picked=new Set([...a,...b].filter(([r,c])=>state.board[r][c]===1).map(cell=>cell.join(',')));
    assert.equal(model.total,picked.size);assert.equal(model.scoreA+model.scoreB,model.total);assert.ok(model.total>=previous);previous=model.total;
    if(time)assert.equal(model.gain,model.total-context.cp741PairModel(state,mode,time-1).total);
    for(const[role,path]of[[0,a],[1,b]])for(let i=1;i<path.length;i++){
     const[r,c]=path[i-1],[x,y]=path[i],delta=mode==='trip'&&role===1?-1:1;
     assert.equal((x-r)+(y-c),delta);assert.equal(Math.abs(x-r)+Math.abs(y-c),1);assert.notEqual(state.board[x][y],-1);
    }
   }
   assert.equal(end.total,run.answer);
  }
  context.steps=run.steps;
  for(const locale of['vi','en']){context.lang=locale;for(const step of run.steps){context.renderCherryPickup741View(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);assert.equal((host.innerHTML.match(/class="cp741-dual-card /g)||[]).length,2);}}
  assert.equal(JSON.stringify(run),before);
 }
});
