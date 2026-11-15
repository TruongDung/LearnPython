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
const dungeonMemoCode=`from functools import lru_cache

class Solution:
    def calculateMinimumHP(self, dungeon):
        m, n = len(dungeon), len(dungeon[0])

        @lru_cache(None)
        def dfs(i, j):
            if i >= m or j >= n:
                return float('inf')

            if i == m - 1 and j == n - 1:
                return max(1, 1 - dungeon[i][j])

            down = dfs(i + 1, j)
            right = dfs(i, j + 1)

            return max(1, min(down, right) - dungeon[i][j])

        return dfs(0, 0)`.split('\n');
const dungeonPaddedCode=`from typing import List

class Solution:
    def calculateMinimumHP(self, dungeon: List[List[int]]) -> int:
        m, n = len(dungeon), len(dungeon[0])

        dp = [[float('inf')] * (n + 1) for _ in range(m + 1)]

        dp[m][n - 1] = 1
        dp[m - 1][n] = 1

        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                down = dp[i + 1][j]
                right = dp[i][j + 1]

                dp[i][j] = max(
                    1,
                    min(down, right) - dungeon[i][j]
                )

        return dp[0][0]`.split('\n');
const dungeonLabels=[bi('1. DP từ đích về đầu','1. Bottom-up DP'),bi('2. DFS + lru_cache','2. DFS + lru_cache'),bi('3. DP có viền ∞','3. DP with ∞ padding')];
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
    const view={id:174,kind:'dungeon',method:1,grid,rows,cols,dp,rawDP,computed:computed.map(r=>[...r]),active,neighbors,nextNeed,delta,rawNeed,
      required:phase==='write'?dp[active[0]][active[1]]:null,writes:structuredClone(writes),phase,line,source:code[line-1].trim(),branch:e.branch,
      answer:final?native.answer:null,path:final?dungeonPath(dp):[],trace:native.trace,final};
    return {arr:[],codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:['i','j'].map(name=>({name,value:x[name]??'—'})),healthGameView:view};
  });return {original:grid,answer:native.answer,steps};
}
function buildDungeonMemo(input){
  const grid=parseDungeon(input),rows=grid.length,cols=grid[0].length,code=dungeonMemoCode,native=runTrace({code:code.join('\n'),method:'calculateMinimumHP',args:[grid],traceCalls:['dfs']});
  const memo=grid.map(row=>row.map(()=>null)),cached=new Map(),writes=[];let cacheHits=0;
  const inside=cell=>cell&&cell[0]>=0&&cell[0]<rows&&cell[1]>=0&&cell[1]<cols;
  const steps=native.events.map((e,index)=>{
    const x=e.locals,line=e.line,final=index===native.events.length-1,cell=e.scope==='dfs'?[x.i,x.j]:null;
    const stack=e.frames.filter(f=>f.name==='dfs').map((f,i,frames)=>({cell:[f.locals.i,f.locals.j],line:f.line,down:f.locals.down??null,right:f.locals.right??null,status:i===frames.length-1?'active':'waiting'}));
    let active=inside(cell)?cell:null,phase=cell?(inside(cell)?'guard':'outside'):'init',cacheHit=null,pendingCall=null,received=null;
    if(e.event==='call'){
      const target=line===20?[0,0]:line===15?[x.i+1,x.j]:[x.i,x.j+1];
      pendingCall={cell:target,variable:line===15?'down':line===16?'right':null,cached:cached.has(target.join(':'))};phase='call';
      if(stack.length)stack.at(-1).status='calling';
    }else if(cell&&e.returning){
      if(stack.length)stack.at(-1).status='returning';
      cached.set(cell.join(':'),e.returned);
      if(active){memo[x.i][x.j]=e.returned;writes.push({cell:[...active],need:e.returned,step:index});phase='write';}
    }else if(cell&&(line===15||line===16)){
      const target=line===15?[x.i+1,x.j]:[x.i,x.j+1],previous=native.events[index-1];
      const expanded=previous?.returning&&previous.scope==='dfs'&&previous.locals.i===target[0]&&previous.locals.j===target[1];
      if(!expanded){
        const need=line===15?x.down:x.right;
        if(cached.get(target.join(':'))!==need)throw Error('174: cached return does not match the native DFS trace.');
        cacheHits++;cacheHit={cell:target,need};phase='cache-hit';
      }else phase='receive';
      received={cell:target,variable:line===15?'down':'right',need:line===15?x.down:x.right,cached:!expanded};
    }
    const goal=active&&x.i===rows-1&&x.j===cols-1;
    const neighbors=active&&!goal?[[[x.i+1,x.j],'down'],[[x.i,x.j+1],'right']].map(([next,direction])=>({cell:next,direction,need:x[direction]??null})):[];
    const requirementsReady=active&&(goal?phase==='write':x.down!==undefined&&x.right!==undefined);
    const nextNeed=phase==='write'?(goal?1:Math.min(...neighbors.map(n=>n.need==='∞'?Infinity:n.need))):null;
    const delta=active?grid[x.i][x.j]:null,rawNeed=nextNeed===null?null:nextNeed-delta;
    if(final){active=[0,0];phase='result';}
    const view={id:174,kind:'dungeon',method:2,grid,rows,cols,dp:structuredClone(memo),computed:memo.map(row=>row.map(n=>n!==null)),active,neighbors,nextNeed,delta,rawNeed,
      required:phase==='write'?e.returned:null,requirementsReady:Boolean(requirementsReady),writes:structuredClone(writes),stack,cacheHits,cacheHit,pendingCall,received,execution:{event:e.event,timing:e.timing,scope:e.scope},outside:cell&&!inside(cell)?cell:null,returned:e.returning?e.returned:null,
      phase,line,source:code[line-1].trim(),branch:e.branch,answer:final?native.answer:null,path:final?dungeonPath(memo):[],trace:native.trace,final};
    return {arr:[],codeBlock:2,codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:['i','j','down','right'].map(name=>({name,value:x[name]??'—'})),healthGameView:view};
  });return {original:grid,answer:native.answer,steps};
}
function buildDungeonPadded(input){
  const grid=parseDungeon(input),rows=grid.length,cols=grid[0].length,code=dungeonPaddedCode,native=runTrace({code:code.join('\n'),method:'calculateMinimumHP',args:[grid]});
  const computed=grid.map(row=>row.map(()=>false)),writes=[];
  const steps=native.events.map((e,index)=>{
    const x=e.locals,line=e.line,final=index===native.events.length-1,rawDP=x.dp?structuredClone(x.dp):null;
    let active=null,dpActive=null,phase='init';
    if(line===9||line===10){dpActive=line===9?[rows,cols-1]:[rows-1,cols];phase='base';}
    if(line===13&&e.branch||[14,15,17,18,19].includes(line)){active=[x.i,x.j];dpActive=active;phase='choose';}
    if(active&&typeof rawDP?.[x.i][x.j]==='number'&&!computed[x.i][x.j]){
      computed[x.i][x.j]=true;phase='write';writes.push({cell:[...active],need:rawDP[x.i][x.j],step:index});
    }
    const dp=rawDP?grid.map((row,r)=>row.map((_,c)=>computed[r][c]?rawDP[r][c]:null)):null;
    const neighbors=active?[{cell:[x.i+1,x.j],direction:'down',need:rawDP[x.i+1][x.j]},{cell:[x.i,x.j+1],direction:'right',need:rawDP[x.i][x.j+1]}]:[];
    const nextNeed=active&&line>=15?Math.min(...neighbors.map(n=>n.need==='∞'?Infinity:n.need)):null,delta=active?grid[x.i][x.j]:null,rawNeed=nextNeed===null?null:nextNeed-delta;
    if(final){active=[0,0];dpActive=active;phase='result';}
    const view={id:174,kind:'dungeon',method:3,grid,rows,cols,dp,rawDP,paddedDP:rawDP,computed:computed.map(row=>[...row]),active,dpActive,neighbors,nextNeed,delta,rawNeed,
      required:phase==='write'?rawDP[active[0]][active[1]]:null,writes:structuredClone(writes),phase,line,source:code[line-1].trim(),branch:e.branch,
      answer:final?native.answer:null,path:final?dungeonPath(dp):[],trace:native.trace,final};
    return {arr:[],codeBlock:3,codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:['i','j','down','right'].map(name=>({name,value:x[name]??'—'})),healthGameView:view};
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
    extraParams:[{key:'approach',type:'select',default:'1',label:bi('Cách giải','Approach'),options:dungeonLabels.map((label,i)=>({value:String(i+1),label}))}],
    codeLabel:dungeonLabels[0],code2:dungeonMemoCode,code2Label:dungeonLabels[1],code3:dungeonPaddedCode,code3Label:dungeonLabels[2],
    complexity2:{time:'O(m × n)',space:'O(m × n)',note:bi('Mỗi ô tính một lần; lời gọi lặp dùng kết quả từ lru_cache. Stack sâu tối đa m + n.','Each room is evaluated once; repeated calls use lru_cache. Stack depth is at most m + n.')},
    complexity3:{time:'O(m × n)',space:'O(m × n)',note:bi('Bảng (m+1) × (n+1) khởi tạo ∞; hai ô cạnh đích bằng 1.','Initialize an (m+1) × (n+1) table with ∞; the two cells beside the exit are 1.')},
    approach:[bi('1. DP: tính HP cần khi vào từng ô từ đích về đầu; luôn chặn dưới ở 1.','1. Bottom-up DP: work backward to find each room’s required entry HP, clamped at 1.'),bi('2. DFS + lru_cache: gọi xuống/phải, trả kết quả về và tái sử dụng ô đã tính.','2. DFS + lru_cache: recurse down/right, return each requirement, and reuse cached cells.'),bi('3. DP có đệm: thêm hàng/cột ∞, đặt hai ô cạnh đích bằng 1 để dùng chung một công thức.','3. Padded DP: add an ∞ row/column and set the two cells beside the exit to 1 for a single recurrence.')],
    debugMode:'line-by-line',visualizationLimits:{maxRows:6,maxColumns:6,completeTrace:true},builder:buildDungeon,builder2:buildDungeonMemo,builder3:buildDungeonPadded,liveArgs:input=>[parseDungeon(input)]},
};
