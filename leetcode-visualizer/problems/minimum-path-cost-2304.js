'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const code=`class Solution:
    def minPathCost(self, grid, moveCost):
        rows, cols = len(grid), len(grid[0])
        dp = [grid[0][:]] + [[float("inf")] * cols for _ in range(rows - 1)]
        parent = [[-1] * cols for _ in range(rows)]
        for row in range(rows - 1):
            for col in range(cols):
                value = grid[row][col]
                for nxt in range(cols):
                    step_cost = moveCost[value][nxt]
                    candidate = dp[row][col] + step_cost + grid[row + 1][nxt]
                    if candidate < dp[row + 1][nxt]:
                        dp[row + 1][nxt] = candidate
                        parent[row + 1][nxt] = col
        return min(dp[-1])`.split('\n');
const exampleGrid=[[5,3],[4,0],[2,1]];
const exampleCosts=[[9,8],[1,5],[10,12],[18,6],[2,4],[14,3]];
function matrix(value,name){
  let out=value;
  if(typeof value==='string'){
    const text=value.trim();
    try{out=text.startsWith('[')?JSON.parse(text):text.split(/[;\n]/).filter(s=>s.trim()).map(row=>row.split(',').map(s=>s.trim()?Number(s):NaN));}catch{out=null;}
  }
  if(!Array.isArray(out)||!out.length||out.some(row=>!Array.isArray(row)||!row.length||row.some(n=>!Number.isSafeInteger(n)))||out.some(row=>row.length!==out[0].length))throw Error(`2304: ${name} must be a rectangular integer matrix, as JSON or rows separated by semicolons.`);
  return out.map(row=>[...row]);
}
function parse(input,params={}){
  const grid=matrix(input,'grid'),rows=grid.length,cols=grid[0].length;
  if(rows<2||rows>6||cols<2||cols>5)throw Error('2304: use 2–6 rows and 2–5 columns for the visualization.');
  const values=grid.flat();
  if(new Set(values).size!==rows*cols||values.some(n=>n<0||n>=rows*cols))throw Error('2304: grid must contain every value 0…m*n−1 exactly once.');
  const moveCost=matrix(params.moveCost??exampleCosts,'moveCost');
  if(moveCost.length!==rows*cols||moveCost[0].length!==cols||moveCost.some(row=>row.some(n=>n<1||n>100)))throw Error('2304: moveCost must have m*n rows, n columns, and costs in 1…100.');
  return {grid,moveCost,rows,cols};
}
function pathTo(parent,row,col){
  const path=[];
  for(let r=row,c=col;r>=0;r--){path.unshift([r,c]);if(r===0)break;const p=parent?.[r]?.[c];if(!Number.isInteger(p)||p<0)return[];c=p;}
  return path;
}
function build(input,params={}){
  const {grid,moveCost,rows,cols}=parse(input,params),trace=runTrace({code:code.join('\n'),method:'minPathCost',args:[grid,moveCost]});
  let source=null,target=null,before=null,readyRows=-1;
  const history=[];
  const steps=trace.events.map((record,index)=>{
    const x=record.locals,line=record.line,final=index===trace.events.length-1;
    const dp=Array.isArray(x.dp)?x.dp.map(row=>row.map(n=>typeof n==='number'?n:null)):null;
    const parent=Array.isArray(x.parent)?x.parent.map(row=>[...row]):null;
    let phase='setup';
    if(line===4)readyRows=0;
    if(line===6){source=null;target=null;phase=record.branch?'row':'rows-done';}
    if(line===7){target=null;if(record.branch){source=[x.row,x.col];phase='source';}else{source=null;readyRows=Math.max(readyRows,x.row+1);phase='row-done';}}
    if(line===8){source=[x.row,x.col];target=null;phase='source';}
    if(line===9){if(record.branch){target=[x.row+1,x.nxt];before=dp[target[0]][target[1]];phase='edge';}else{target=null;phase='source';}}
    if(line===10)phase='lookup';
    if(line===11)phase='candidate';
    if(line===12)phase=record.branch?'improve':'keep';
    if(line===13)phase='write';
    if(line===14)phase='accept';
    const candidate=target&&line>=11&&line<=14?x.candidate:null;
    const stepCost=target&&line>=10&&line<=14?x.step_cost:null;
    if((line===12&&!record.branch)||line===14)history.push({source:[...source],target:[...target],candidate:x.candidate,before,accepted:line===14,step:index});
    let answer=null,bestEnd=null,path=[];
    if(final){phase='result';readyRows=rows-1;source=null;target=null;answer=trace.answer;bestEnd=dp.at(-1).indexOf(answer);path=pathTo(parent,rows-1,bestEnd);}
    const prefixPath=source?pathTo(parent,...source):[];
    const view={grid,moveCost,rows,cols,dp,parent,source:source&&[...source],target:target&&[...target],before,stepCost,candidate,phase,readyRows,
      prefixPath,candidatePath:target&&candidate!==null?[...prefixPath,[...target]]:[],history:structuredClone(history),pendingParent:line===13,answer,bestEnd,path,
      line,sourceText:code[line-1].trim(),branch:record.branch,trace:trace.trace,final};
    return {arr:[],codeLines:[line],final,title:bi(view.sourceText,view.sourceText),note:bi('',''),
      vars:['row','col','value','nxt','step_cost','candidate'].map(name=>({name,value:x[name]??'—'})),minPathCost2304View:view};
  });
  return {original:grid,moveCost,answer:trace.answer,steps};
}
module.exports={2304:{id:2304,difficulty:'medium',slug:'minimum-path-cost-in-a-grid',
  category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},tags:[{key:'matrix',vi:'Ma trận',en:'Matrix'},{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'}],
  title:bi('Minimum Path Cost in a Grid','Minimum Path Cost in a Grid'),titleVi:bi('Chi phí đường đi nhỏ nhất trong lưới','Minimum Path Cost in a Grid'),
  statement:bi('Bắt đầu ở một ô bất kỳ của hàng đầu. Mỗi bước sang một ô bất kỳ của hàng kế tiếp. Cộng giá trị các ô đi qua và moveCost[giá trị ô đi][cột đến]. Tìm tổng nhỏ nhất khi tới hàng cuối.',
    'Start anywhere in the first row and move to any column in the next row. Pay each visited cell value and moveCost[source cell value][destination column]. Minimize the total at the last row.'),
  defaultInput:JSON.stringify(exampleGrid),inputKind:'string',inputLabel:bi('grid · JSON hoặc các hàng cách bởi ; · 2–6 hàng, 2–5 cột','grid · JSON or semicolon-separated rows · 2–6 rows, 2–5 columns'),
  extraParams:[{key:'moveCost',type:'string',default:JSON.stringify(exampleCosts),label:bi('moveCost · JSON · m*n hàng, n cột','moveCost · JSON · m*n rows, n columns')}],
  code,debugMode:'line-by-line',visualizationLimits:{maxRows:6,maxColumns:5,completeTrace:true},
  approach:[bi('dp[r][c] là tổng nhỏ nhất để tới ô (r,c). Từ mỗi ô, thử mọi cột ở hàng tiếp theo; chỉ giữ phương án rẻ hơn.','dp[r][c] is the cheapest total reaching (r,c). Try every next-row column and retain cheaper candidates.')],
  complexity:{time:'O(mn²)',space:'O(mn)',note:bi('Lưu bảng dp và parent để minh hoạ đường đi.','Store dp and parent to reconstruct the illustrated path.')},
  builder:build,liveArgs:(input,params)=>{const p=parse(input,params);return[p.grid,p.moveCost];},
  reference:'https://leetcode.com/problems/minimum-path-cost-in-a-grid/description/',
}};
