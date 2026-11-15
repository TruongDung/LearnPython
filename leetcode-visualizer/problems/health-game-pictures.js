'use strict';
const {runTrace}=require('./wasm-picture-trace');
const dungeonBase=require('./dp')[174];
const bi=(vi,en)=>({vi,en});
const armorCode=`class Solution:
    def minimumHealth(self, damage, armor):
        total = 0
        peak = 0
        shield_at = 0
        for i, hit in enumerate(damage):
            total += hit
            if hit > peak:
                peak = hit
                shield_at = i
        saved = min(peak, armor)
        return total - saved + 1`.split('\n');
function parseDamage(input,params={}){
  let damage=input;
  try{if(typeof input==='string'){const s=input.trim();damage=s.startsWith('[')?JSON.parse(s):s.split(',').map(x=>x.trim()?Number(x):NaN);}}catch{damage=null;}
  const armor=Number(params.armor??4);
  if(!Array.isArray(damage)||damage.length<1||damage.length>24||damage.some(n=>!Number.isSafeInteger(n)||n<0||n>100000)||!Number.isSafeInteger(armor)||armor<0||armor>100000)throw Error('2214: use 1–24 non-negative damage values and armor in 0…100000.');
  return {damage:[...damage],armor};
}
function parseDungeon(input){
  let grid=input;
  try{if(typeof input==='string'){const s=input.trim();grid=s.startsWith('[')?JSON.parse(s):s.split(/[;\n]/).filter(r=>r.trim()).map(r=>r.split(',').map(x=>x.trim()?Number(x):NaN));}}catch{grid=null;}
  if(!Array.isArray(grid)||grid.length<1||grid.length>6||grid.some(r=>!Array.isArray(r)||r.length<1||r.length>6||r.some(n=>!Number.isSafeInteger(n)||n< -1000||n>1000))||grid.some(r=>r.length!==grid[0].length))throw Error('174: use a rectangular 1–6 by 1–6 grid with values in −1000…1000.');
  return grid.map(r=>[...r]);
}
function dungeonPath(dp){
  if(!dp?.length||dp[0][0]===null)return[];
  const rows=dp.length,cols=dp[0].length,path=[[0,0]];let r=0,c=0;
  while(r<rows-1||c<cols-1){if(r===rows-1)c++;else if(c===cols-1)r++;else if(dp[r+1][c]<=dp[r][c+1])r++;else c++;path.push([r,c]);}
  return path;
}
function buildArmor(input,params={}){
  const {damage,armor}=parseDamage(input,params),native=runTrace({code:armorCode.join('\n'),method:'minimumHealth',args:[damage,armor]});
  let processed=0;
  const steps=native.events.map((e,index)=>{
    const x=e.locals,line=e.line,final=index===native.events.length-1;
    if(line===7)processed=x.i+1;
    const phases={3:'init',4:'init',5:'init',6:e.branch?'read':'scan-done',7:'sum',8:'compare',9:'peak',10:'choose',11:'save',12:'result'};
    const view={id:2214,kind:'armor',damage,armor,total:x.total??null,peak:x.peak??null,shieldIndex:x.shield_at??null,saved:x.saved??null,
      active:line>=6&&line<=10&&!(line===6&&e.branch===false)?x.i??null:null,processed,phase:phases[line]||'init',line,source:armorCode[line-1].trim(),branch:e.branch,
      answer:final?native.answer:null,trace:native.trace,final};
    return {arr:[],codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:['i','hit','total','peak','shield_at','saved'].map(name=>({name,value:x[name]??'—'})),healthGameView:view};
  });return {original:damage,armor,answer:native.answer,steps};
}
function buildDungeon(input){
  const grid=parseDungeon(input),rows=grid.length,cols=grid[0].length,code=dungeonBase.code;
  const native=runTrace({code:code.join('\n'),method:'calculateMinimumHP',args:[grid]}),computed=grid.map(row=>row.map(()=>false)),writes=[];
  const steps=native.events.map((e,index)=>{
    const x=e.locals,line=e.line,final=index===native.events.length-1;let active=null,phase='init';
    if(line===5){active=[rows-1,cols-1];phase='write';}
    if((line===7&&e.branch)||line===8){active=[rows-1,x.j];phase=line===8?'write':'choose';}
    if((line===10&&e.branch)||line===11){active=[x.i,cols-1];phase=line===11?'write':'choose';}
    if((line===14&&e.branch)||line===15){active=[x.i,x.j];phase=line===15?'write':'choose';}
    if(phase==='write')computed[active[0]][active[1]]=true;
    const rawDP=Array.isArray(x.dp)?x.dp.map(r=>[...r]):null,dp=rawDP?rawDP.map((row,r)=>row.map((n,c)=>computed[r][c]?n:null)):null;
    const neighbors=[];
    if(active){const [r,c]=active;if(c+1<cols)neighbors.push({cell:[r,c+1],need:dp?.[r][c+1]??null,direction:'right'});if(r+1<rows)neighbors.push({cell:[r+1,c],need:dp?.[r+1][c]??null,direction:'down'});}
    const nextNeed=active?neighbors.length?Math.min(...neighbors.map(n=>n.need)):1:null;
    const delta=active?grid[active[0]][active[1]]:null,rawNeed=active&&nextNeed!==null?nextNeed-delta:null;
    if(phase==='write')writes.push({cell:[...active],need:dp[active[0]][active[1]],step:index});
    if(final){active=[0,0];phase='result';}
    const view={id:174,kind:'dungeon',grid,rows,cols,dp,rawDP,computed:computed.map(r=>[...r]),active,neighbors,nextNeed,delta,rawNeed,
      required:phase==='write'?dp[active[0]][active[1]]:null,writes:structuredClone(writes),phase,line,source:code[line-1].trim(),branch:e.branch,
      answer:final?native.answer:null,path:final?dungeonPath(dp):[],trace:native.trace,final};
    return {arr:[],codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:['i','j'].map(name=>({name,value:x[name]??'—'})),healthGameView:view};
  });return {original:grid,answer:native.answer,steps};
}
module.exports={
  2214:{id:2214,difficulty:'medium',premium:true,slug:'minimum-health-to-beat-game',category:{key:'greedy',vi:'Tham lam',en:'Greedy'},
    title:bi('Minimum Health to Beat Game','Minimum Health to Beat Game'),titleVi:bi('Máu ban đầu nhỏ nhất để thắng','Minimum Health to Beat Game'),
    tags:[{key:'array',vi:'Mảng',en:'Array'},{key:'greedy',vi:'Tham lam',en:'Greedy'}],
    statement:bi('Vượt các màn theo thứ tự, mỗi màn mất damage[i] HP. Giáp dùng tối đa một lần, chặn tối đa armor sát thương của một màn. HP phải luôn lớn hơn 0. Tìm HP ban đầu nhỏ nhất.',
      'Complete the levels in order, losing damage[i] health at each level. Use armor at most once to block up to armor damage from one level. Health must remain positive. Find the minimum initial health.'),
    defaultInput:[2,7,4,3],inputKind:'nonneg',inputLabel:bi('damage · 1–24 số không âm','damage · 1–24 non-negative integers'),
    extraParams:[{key:'armor',default:4,min:0,max:100000,label:bi('armor · giáp dùng một lần','armor · one use')}],
    approach:[bi('Chặn min(armor, max(damage)) sát thương. Máu ban đầu = tổng sát thương − phần được chặn + 1.','Block min(armor, max(damage)) damage. Initial health = total damage − blocked damage + 1.')],
    complexity:{time:'O(n)',space:'O(1)'},code:armorCode,debugMode:'line-by-line',visualizationLimits:{maxDamage:24,completeTrace:true},builder:buildArmor,
    liveArgs:(input,params)=>{const p=parseDamage(input,params);return[p.damage,p.armor];}},
  174:{...dungeonBase,inputLabel:bi('dungeon · JSON hoặc hàng cách ; · tối đa 6×6','dungeon · JSON or semicolon rows · up to 6×6'),
    approach:[bi('dp[r][c] là HP tối thiểu cần khi vào ô. Tính từ đích về đầu, chọn ô kế cần ít HP hơn, rồi trừ giá trị ô hiện tại.','dp[r][c] is the health required upon entering a cell. Work backward, choose the cheaper next requirement, then subtract the current room value.'),bi('Luôn chặn dưới ở 1 vì HP = 0 cũng là thua.','Clamp at 1: health equal to zero also loses.')],
    debugMode:'line-by-line',visualizationLimits:{maxRows:6,maxColumns:6,completeTrace:true},builder:buildDungeon,liveArgs:input=>[parseDungeon(input)]},
};
