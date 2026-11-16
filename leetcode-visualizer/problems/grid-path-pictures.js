'use strict';
const {runTrace}=require('./wasm-picture-trace'),base=require('./dp'),bi=(vi,en)=>({vi,en});
const memo62=require('./unique-paths-memo-62');
const memo63=require('./unique-paths-memo-63');
const COUNT=`class Solution:
    def uniquePaths(self, m, n):
        dp = [[1]*n for _ in range(m)]
        for r in range(1, m):
            for c in range(1, n):
                dp[r][c] = dp[r-1][c] + dp[r][c-1]
        return dp[m-1][n-1]`.split('\n');
const OBSTACLES=`class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid):
        m, n = len(obstacleGrid), len(obstacleGrid[0])
        dp = [[0]*n for _ in range(m)]
        for r in range(m):
            for c in range(n):
                if obstacleGrid[r][c] == 1:
                    dp[r][c] = 0
                elif r == 0 and c == 0:
                    dp[r][c] = 1
                else:
                    top = dp[r-1][c] if r > 0 else 0
                    left = dp[r][c-1] if c > 0 else 0
                    dp[r][c] = top + left
        return dp[m-1][n-1]`.split('\n');
const COST=`class Solution:
    def minPathSum(self, grid):
        m, n = len(grid), len(grid[0])
        dp = [[0]*n for _ in range(m)]
        dp[0][0] = grid[0][0]
        for c in range(1, n):
            dp[0][c] = dp[0][c-1] + grid[0][c]
        for r in range(1, m):
            dp[r][0] = dp[r-1][0] + grid[r][0]
        for r in range(1, m):
            for c in range(1, n):
                dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])
        return dp[m-1][n-1]`.split('\n');
const MOD=`class Solution:
    def numberOfPaths(self, grid, k):
        MOD = 10**9 + 7
        m, n = len(grid), len(grid[0])
        dp = [[[0]*k for _ in range(n)] for _ in range(m)]
        dp[0][0][grid[0][0] % k] = 1
        for r in range(m):
            for c in range(n):
                if r == 0 and c == 0:
                    continue
                for rem in range(k):
                    previous = (rem - grid[r][c]) % k
                    top = dp[r-1][c][previous] if r > 0 else 0
                    left = dp[r][c-1][previous] if c > 0 else 0
                    dp[r][c][rem] = (top + left) % MOD
        return dp[m-1][n-1][0]`.split('\n');
function matrix(input,id,max=6){let grid=input;try{if(typeof input==='string'){const s=input.trim();grid=s.startsWith('[')?JSON.parse(s):s.split(/[;|\n]/).filter(x=>x.trim()).map(row=>row.split(',').map(x=>x.trim()?Number(x):NaN));}}catch{grid=null;}if(!Array.isArray(grid)||!grid.length||grid.length>max||grid.some(row=>!Array.isArray(row)||!row.length||row.length>max||row.length!==grid[0].length||row.some(x=>!Number.isSafeInteger(x)||x<0||x>100)))throw Error(`${id}: use a rectangular 1–${max} × 1–${max} grid, with integers in 0…100.`);return grid.map(row=>[...row]);}
function argumentsFor(id,input,params={}){if(id===62){const m=Number(params.m??input?.[0]),n=Number(params.n??7);if(!Array.isArray(input)||input.length!==1||![m,n].every(x=>Number.isInteger(x)&&x>=1&&x<=8))throw Error('62: m and n must be integers in 1…8.');return[m,n];}const grid=matrix(input,id,id===2435?5:6),k=Number(params.k??3);if(id===63&&grid.some(row=>row.some(x=>x!==0&&x!==1)))throw Error('63: obstacleGrid values must be 0 (open) or 1 (blocked).');if(id===2435&&(!Number.isInteger(k)||k<1||k>6))throw Error('2435: k must be in 1…6 for the visualization.');return id===2435?[grid,k]:[grid];}
function costPath(dp){const path=[];let r=dp.length-1,c=dp[0].length-1;while(true){path.push([r,c]);if(!r&&!c)break;if(!r)c--;else if(!c)r--;else if(dp[r-1][c]<=dp[r][c-1])r--;else c--;}return path.reverse();}
function divisiblePaths(grid,k){const found=[],path=[];function walk(r,c,sum){path.push([r,c]);sum+=grid[r][c];if(r===grid.length-1&&c===grid[0].length-1){if(sum%k===0)found.push(path.map(cell=>[...cell]));}else{if(r+1<grid.length)walk(r+1,c,sum);if(c+1<grid[0].length)walk(r,c+1,sum);}path.pop();}walk(0,0,0);return found;}
function obstaclePaths(grid){const found=[],path=[];function walk(r,c){if(grid[r][c]===1)return;path.push([r,c]);if(r===grid.length-1&&c===grid[0].length-1)found.push(path.map(cell=>[...cell]));else{if(r+1<grid.length)walk(r+1,c);if(c+1<grid[0].length)walk(r,c+1);}path.pop();}walk(0,0);return found;}
function build(id,input,params={}){
 const args=argumentsFor(id,input,params),grid=id===62?Array.from({length:args[0]},()=>Array(args[1]).fill(0)):args[0],rows=grid.length,cols=grid[0].length,k=id===2435?args[1]:1,code=id===62?COUNT:id===63?OBSTACLES:id===64?COST:MOD;
 const native=runTrace({code:code.join('\n'),method:id===62?'uniquePaths':id===63?'uniquePathsWithObstacles':id===64?'minPathSum':'numberOfPaths',args}),known=grid.map(row=>row.map(()=>Array(k).fill(false))),completed=id===62?structuredClone(known):null,writes=[];
 const steps=native.events.map((e,index)=>{const x=e.locals,line=e.line,final=index===native.events.length-1;let active=null,phase='init',rem=id===2435?x.rem??0:0;
  if(id===62){if(line===3)for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){known[r][c][0]=true;completed[r][c][0]=!r||!c;}if(line===5&&e.branch||line===6){active=[x.r,x.c];phase=line===6?'write':'choose';}}
  else if(id===63){if(line===6&&e.branch||[7,8,9,10,12,13,14].includes(line)){active=[x.r,x.c];phase=[8,10,14].includes(line)?'write':'choose';}}
  else if(id===64){if(line===5){active=[0,0];phase='write';}if(line===6&&e.branch||line===7){active=[0,x.c];phase=line===7?'write':'choose';}if(line===8&&e.branch||line===9){active=[x.r,0];phase=line===9?'write':'choose';}if(line===11&&e.branch||line===12){active=[x.r,x.c];phase=line===12?'write':'choose';}}
  else{if(line===6){active=[0,0];rem=grid[0][0]%k;known[0][0].fill(true);phase='write';}if(line===11&&e.branch||[12,13,14,15].includes(line)){active=[x.r,x.c];phase=line===15?'write':'choose';}}
  if(final&&id===2435)rem=0;
  if(phase==='write'){known[active[0]][active[1]][rem]=true;if(completed)completed[active[0]][active[1]][rem]=true;writes.push({cell:[...active],rem,step:index});}
  const rawDP=x.dp??null,counts=rawDP?grid.map((row,r)=>row.map((_,c)=>Array.from({length:k},(_,t)=>known[r][c][t]?(id===2435?rawDP[r][c][t]:rawDP[r][c]):null))):null;
  const previous=id===2435&&active?(rem-grid[active[0]][active[1]]%k+k)%k:0,neighbors=[],blocked=id===63&&active?grid[active[0]][active[1]]===1:false;
  if(active&&!blocked){const[r,c]=active;for(const [a,b,direction]of[[r-1,c,'up'],[r,c-1,'left']])if(a>=0&&b>=0)neighbors.push({cell:[a,b],direction,value:counts?.[a][b][previous]??null});}
  const resultPaths=final?id===2435?divisiblePaths(grid,k):id===63?obstaclePaths(grid):[]:[],path=final&&id===64?costPath(rawDP):resultPaths[0]??[];
  const view={id,kind:id===62?'count':id===63?'obstacles':id===64?'cost':'mod',grid,rows,cols,k,counts,known:structuredClone(known),...(completed?{completed:structuredClone(completed)}:{}),rawDP,active,blocked,rem,previous,neighbors,phase,writes:structuredClone(writes),line,source:code[line-1].trim(),branch:e.branch,trace:native.trace,final,answer:final?native.answer:null,path,paths:resultPaths};
  return {arr:[],codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:['r','c','rem','previous','top','left'].map(name=>({name,value:x[name]??'—'})),gridPathPictureView:view};
 });return {original:id===62?[args[0]]:grid,answer:native.answer,steps};
}
module.exports={
 62:{...base[62],extraParams:[{key:'n',default:7,min:1,max:8,label:bi('n · số cột','n · columns')},{key:'approach',type:'select',default:1,label:bi('Cách giải','Approach'),options:[
   {value:1,label:bi('1. DP bottom-up','1. Bottom-up DP')},{value:2,label:bi('2. DFS + lru_cache','2. DFS + lru_cache')},
  ]}],inputLabel:bi('m · số hàng (1–8)','m · rows (1–8)'),code:COUNT,codeLabel:bi('1. DP bottom-up','1. Bottom-up DP'),code2:memo62.CODE,code2Label:bi('2. DFS + lru_cache','2. DFS + lru_cache'),
  complexity2:{time:'O(rows × cols)',space:'O(rows × cols)',note:bi('dfs(row,col) đếm đường từ ô hiện tại tới đích. Mỗi ô tính một lần; stack sâu tối đa rows + cols.','dfs(row,col) counts paths from this cell to the destination. Compute each cell once; stack depth is at most rows + cols.')},
  approach:[bi('Cách 1: cộng số đường từ ô trên và ô trái trong bảng DP.','Approach 1: add paths from the cell above and the cell to the left.'),bi('Cách 2: ra ngoài grid → 0, tới đích → 1, còn lại dfs(row,col) = down + right. @lru_cache(None) dùng lại kết quả đã tính.','Approach 2: outside → 0, destination → 1; otherwise dfs(row,col) = down + right. @lru_cache(None) reuses completed results.')],
  debugMode:'line-by-line',builder:(input,params)=>build(62,input,params),builder2:(input,params)=>memo62.build(...argumentsFor(62,input,params)),liveArgs:(input,params)=>argumentsFor(62,input,params)},
 63:{...base[63],inputLabel:bi('obstacleGrid · 0 trống / 1 chặn · tối đa 6×6','obstacleGrid · 0 open / 1 blocked · up to 6×6'),
  extraParams:[{key:'approach',type:'select',default:1,label:bi('Cách giải','Approach'),options:[{value:1,label:bi('1. DP bottom-up','1. Bottom-up DP')},{value:2,label:bi('2. DFS + lru_cache','2. DFS + lru_cache')}]}],
  code:OBSTACLES,codeLabel:bi('1. DP bottom-up','1. Bottom-up DP'),code2:memo63.CODE,code2Label:bi('2. DFS + lru_cache','2. DFS + lru_cache'),
  complexity2:{time:'O(rows × cols)',space:'O(rows × cols)',note:bi('dfs(row,col) đếm đường từ ô hiện tại tới đích. Ô chặn hoặc ngoài grid trả 0; đích trống trả 1. Mỗi trạng thái chỉ tính một lần.','dfs(row,col) counts paths from this cell to the destination. Blocked or outside returns 0; an open destination returns 1. Compute each state once.')},
  approach:[bi('DP bottom-up: ô chặn → 0, ô trống → cộng số đường từ trên và trái.','Bottom-up DP: blocked → 0, open → add paths from above and the left.'),bi('DFS + lru_cache: kiểm tra ngoài grid và ô chặn trước, sau đó mới xét đích. Cộng down + right, dùng lại cả kết quả 0 đã cache.','DFS + lru_cache: check bounds and obstacles before the destination. Add down + right and reuse cached results, including zero.')],
  debugMode:'line-by-line',builder:(input,params)=>build(63,input,params),builder2:(input,params)=>memo63.build(...argumentsFor(63,input,params)),liveArgs:(input,params)=>argumentsFor(63,input,params)},
 64:{...base[64],inputLabel:bi('grid · JSON hoặc hàng cách ; / | · tối đa 6×6','grid · JSON or ; / | rows · up to 6×6'),code:COST,debugMode:'line-by-line',builder:(input,params)=>build(64,input,params),liveArgs:(input,params)=>argumentsFor(64,input,params)},
 2435:{id:2435,difficulty:'hard',slug:'paths-in-matrix-whose-sum-is-divisible-by-k',category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},title:bi('Paths in Matrix Whose Sum Is Divisible by K','Paths in Matrix Whose Sum Is Divisible by K'),titleVi:bi('Đếm đường có tổng chia hết cho K','Count paths divisible by K'),statement:bi('Đi phải hoặc xuống từ góc trái trên tới góc phải dưới. Đếm đường có tổng các ô chia hết cho k, lấy modulo 10⁹+7.','Move right or down from the top-left to the bottom-right. Count paths whose cell sum is divisible by k, modulo 10⁹+7.'),defaultInput:'5,2,4;3,0,5;0,7,2',inputKind:'string',inputLabel:bi('grid · JSON hoặc hàng cách ; · tối đa 5×5','grid · JSON or semicolon rows · up to 5×5'),extraParams:[{key:'k',default:3,min:1,max:6,label:bi('k · số lớp dư (1–6)','k · remainder layers (1–6)')}],code:MOD,complexity:{time:'O(m × n × k)',space:'O(m × n × k)'},approach:[bi('dp[r][c][rem] đếm đường đến ô (r,c) với tổng có dư rem. Cộng số đường từ trên và trái ở lớp dư trước đó.','dp[r][c][rem] counts paths reaching (r,c) with remainder rem. Add the counts from the upper and left cells at the predecessor remainder.')],debugMode:'line-by-line',builder:(input,params)=>build(2435,input,params),liveArgs:(input,params)=>argumentsFor(2435,input,params)}
};
