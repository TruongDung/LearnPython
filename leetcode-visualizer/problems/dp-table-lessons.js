'use strict';

const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const source=text=>text.split('\n');
const CODES={
1277:source(`class Solution:
    def countSquares(self, matrix):
        rows, cols = len(matrix), len(matrix[0])
        dp = [[0] * cols for _ in range(rows)]
        total = 0
        for row in range(rows):
            for col in range(cols):
                if matrix[row][col] == 0:
                    dp[row][col] = 0
                elif row == 0 or col == 0:
                    dp[row][col] = 1
                else:
                    dp[row][col] = 1 + min(dp[row-1][col], dp[row][col-1], dp[row-1][col-1])
                total += dp[row][col]
        return total`),
1035:source(`class Solution:
    def maxUncrossedLines(self, nums1, nums2):
        rows, cols = len(nums1) + 1, len(nums2) + 1
        dp = [[0] * cols for _ in range(rows)]
        for row in range(1, rows):
            for col in range(1, cols):
                if nums1[row-1] == nums2[col-1]:
                    dp[row][col] = dp[row-1][col-1] + 1
                else:
                    dp[row][col] = max(dp[row-1][col], dp[row][col-1])
        return dp[rows-1][cols-1]`),
518:source(`class Solution:
    def change(self, amount, coins):
        rows, cols = len(coins) + 1, amount + 1
        dp = [[0] * cols for _ in range(rows)]
        for row in range(rows):
            dp[row][0] = 1
        for row in range(1, rows):
            coin = coins[row-1]
            for col in range(1, cols):
                skip = dp[row-1][col]
                take = 0
                if col >= coin:
                    take = dp[row][col-coin]
                dp[row][col] = skip + take
        return dp[rows-1][cols-1]`),
416:source(`class Solution:
    def canPartition(self, nums):
        total = sum(nums)
        if total % 2 != 0:
            return False
        target = total // 2
        rows, cols = len(nums) + 1, target + 1
        dp = [[False] * cols for _ in range(rows)]
        for row in range(rows):
            dp[row][0] = True
        for row in range(1, rows):
            num = nums[row-1]
            for col in range(1, cols):
                skip = dp[row-1][col]
                take = False
                if col >= num:
                    take = dp[row-1][col-num]
                dp[row][col] = skip or take
        return dp[rows-1][cols-1]`),
494:source(`class Solution:
    def findTargetSumWays(self, nums, target):
        total = sum(nums)
        if abs(target) > total or (total + target) % 2 != 0:
            return 0
        positive = (total + target) // 2
        rows, cols = len(nums) + 1, positive + 1
        dp = [[0] * cols for _ in range(rows)]
        dp[0][0] = 1
        for row in range(1, rows):
            num = nums[row-1]
            for col in range(cols):
                skip = dp[row-1][col]
                take = 0
                if col >= num:
                    take = dp[row-1][col-num]
                dp[row][col] = skip + take
        return dp[rows-1][cols-1]`),
};
const METHOD={1277:'countSquares',1035:'maxUncrossedLines',518:'change',416:'canPartition',494:'findTargetSumWays'};
const BLOCK={1277:1,1035:1,518:2,416:4,494:2};

function integer(raw,fallback,min,max,id,name){
 const value=raw===undefined?fallback:typeof raw==='number'||typeof raw==='string'&&raw.trim()?Number(raw):NaN;
 if(!Number.isSafeInteger(value)||value<min||value>max)throw Error(`#${id}: ${name} phải là số nguyên ${min}…${max} / use an integer in ${min}…${max}.`);
 return value;
}
function array(input,id,max=10,min=1){
 if(!Array.isArray(input)||!input.length||input.length>max||!input.every(n=>Number.isSafeInteger(n)&&n>=min&&n<=(id===1035?2000:100)))throw Error(`#${id}: dùng 1…${max} số nguyên ${min}…${id===1035?2000:100} / use 1…${max} integers.`);
 return [...input];
}
function parse(id,input,params={}){
 if(id===1277){
  let grid=input;
  try{if(typeof input==='string')grid=input.trim().startsWith('[')?JSON.parse(input):input.split(/[;|\n]/).map(row=>row.split(',').map(cell=>cell.trim()?Number(cell):NaN));}catch{grid=null;}
  if(!Array.isArray(grid)||!grid.length||grid.length>6||grid.some(row=>!Array.isArray(row)||!row.length||row.length>6||row.length!==grid[0].length||row.some(n=>n!==0&&n!==1)))throw Error('#1277: grid 1…6 × 1…6, chỉ gồm 0 và 1 / use a rectangular binary grid up to 6×6.');
  return [grid.map(row=>[...row])];
 }
 if(id===1035){
  let second=params.nums2??'1,2,4';
  try{if(typeof second==='string')second=second.trim().startsWith('[')?JSON.parse(second):second.split(',').map(x=>x.trim()?Number(x):NaN);}catch{second=null;}
  return [array(input,id,8),array(second,id,8)];
 }
 const nums=array(input,id,id===518?8:10,id===494?0:1);
 if(id===518){if(new Set(nums).size!==nums.length)throw Error('#518: các mệnh giá phải khác nhau / coin denominations must be unique.');return [integer(params.amount,5,0,30,id,'amount'),nums];}
 if(nums.reduce((a,b)=>a+b,0)>60)throw Error(`#${id}: DP 2D dùng tổng ≤ 60 để theo dõi từng ô / use total ≤ 60 for the 2D visualization.`);
 return id===494?[nums,integer(params.target,3,-1000,1000,id,'target')]:[nums];
}

function build(id,input,params={}){
 const args=parse(id,input,params),code=CODES[id],native=runTrace({code:code.join('\n'),method:METHOD[id],args});
 const grid=id===1277?args[0]:null,items=id===518?args[1]:args[0],second=id===1035?args[1]:null;
 const completed=[],writes=[];let current=null,skipRead=false,takeRead=false;
 const steps=native.events.map((event,index)=>{
  const x=event.locals,line=event.line,text=code[line-1].trim(),final=index===native.events.length-1,dp=x.dp??null;
  let phase='inspect',active=null;
  if(dp&&!completed.length){for(let row=0;row<dp.length;row++)completed.push(dp[row].map((_,col)=>id===1035?row===0||col===0:id!==1277&&row===0&&col>0));}
  if(text.startsWith('for row in '))current=null;
  if(text.startsWith('for col in ')){current=event.branch?[x.row,x.col]:null;skipRead=false;takeRead=false;}
  if(current)active=[...current];
  if(text.startsWith('dp = '))phase='allocate';
  if(text.startsWith('dp[row][0] = ')){active=[x.row,0];phase='base';}
  if(text==='dp[0][0] = 1'){active=[0,0];phase='base';}
  if(text.startsWith('skip = ')){skipRead=true;phase='read-skip';}
  if(text.startsWith('take = ')){takeRead=true;phase=text==='take = 0'||text==='take = False'?'clear-take':'read-take';}
  if(text.startsWith('dp[row][col] = '))phase='write';
  if(text.startsWith('total += '))phase='count';
  if((phase==='write'||phase==='base')&&active){completed[active[0]][active[1]]=true;writes.push({cell:[...active],value:dp[active[0]][active[1]],step:index});}
  const neighbors=[];
  if(active&&phase!=='base'){
   const [row,col]=active;
   if(id===1277&&grid[row][col]===1&&row>0&&col>0){for(const [a,b,role] of [[row-1,col,'top'],[row,col-1,'left'],[row-1,col-1,'diagonal']])neighbors.push({cell:[a,b],role,value:dp[a][b]});}
   else if(id===1035){const match=items[row-1]===second[col-1];for(const [a,b,role] of match?[[row-1,col-1,'diagonal']]:[[row-1,col,'top'],[row,col-1,'left']])neighbors.push({cell:[a,b],role,value:dp[a][b]});}
   else if(id!==1277&&id!==1035){const value=items[row-1];neighbors.push({cell:[row-1,col],role:'skip',value:dp[row-1][col]});if(col>=value)neighbors.push({cell:[id===518?row:row-1,col-value],role:'take',value:dp[id===518?row:row-1][col-value]});}
  }
  if(final){phase='result';active=dp?[dp.length-1,dp[0].length-1]:null;}
  const view={id,method:BLOCK[id],grid,items:id===1277?[]:items,second,dp,completed:structuredClone(completed),writes:structuredClone(writes),rows:dp?.length??x.rows??null,cols:dp?.[0].length??x.cols??null,
   active,neighbors,phase,line,source:text,trace:native.trace,final,answer:final?native.answer:null,total:x.total??null,target:id===494?args[1]:x.target??(id===518?args[0]:null),positive:x.positive??null,
   skip:current&&skipRead?x.skip:null,take:current&&takeRead?x.take:null,result:phase==='write'?dp[active[0]][active[1]]:null,
   match:id===1035&&current?items[current[0]-1]===second[current[1]-1]:null,execution:{event:event.event,timing:event.timing}};
  return {arr:[],codeBlock:BLOCK[id],codeLines:[line],title:bi(text,text),note:bi('',''),final,
   vars:['rows','cols','row','col','coin','num','skip','take','total','target','positive'].filter(name=>x[name]!==undefined).map(name=>({name,value:x[name]})),dpTableLessonView:view};
 });
 return {original:input,answer:native.answer,steps};
}

const category={key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'};
const newProblem=(id,title,slug,input,kind,label,params,statement,complexity)=>({id,title:bi(title,title),titleVi:bi(title,title),slug,difficulty:'medium',category,defaultInput:input,inputKind:kind,inputLabel:label,extraParams:params,statement,complexity,debugMode:'line-by-line',code:CODES[id],builder:(input,params)=>build(id,input,params),liveArgs:(input,params)=>parse(id,input,params)});
const p1277=newProblem(1277,'Count Square Submatrices with All Ones','count-square-submatrices-with-all-ones','0,1,1,1;1,1,1,1;0,1,1,1','string',bi('matrix · 0/1 · tối đa 6×6','matrix · binary · up to 6×6'),[],bi('Đếm tất cả hình vuông chỉ gồm số 1. dp[row][col] là cạnh lớn nhất có góc phải dưới tại ô đó; ô này đóng góp đúng dp[row][col] hình vuông.','Count all all-one squares. dp[row][col] is the largest side ending at this bottom-right corner; it contributes exactly dp[row][col] squares.'),{time:'O(rows × cols)',space:'O(rows × cols)'});
p1277.approach=[bi('Ô 0 → 0. Biên có số 1 → 1. Bên trong: 1 + min(trên, trái, chéo).','Zero → 0. A border one → 1. Inside: 1 + min(top, left, diagonal).'),bi('Cạnh k → k hình vuông: 1×1, 2×2, …, k×k. Cộng tất cả ô DP.','Side k → k squares: 1×1, 2×2, …, k×k. Sum every DP cell.')];
const p1035=newProblem(1035,'Uncrossed Lines','uncrossed-lines',[1,4,2],'positive',bi('nums1 · 1–8 số','nums1 · 1–8 numbers'),[{key:'nums2',type:'string',default:'1,2,4',label:bi('nums2 · CSV / JSON · 1–8 số','nums2 · CSV / JSON · 1–8 numbers')}],bi('Nối hai số bằng nhau giữa hai dãy. Mỗi phần tử dùng một lần; các đường không được giao nhau. Tìm số đường lớn nhất.','Connect equal numbers across two sequences. Use each occurrence once and keep lines from crossing. Maximize the number of lines.'),{time:'O(rows × cols)',space:'O(rows × cols)'});
p1035.approach=[bi('Hai số bằng nhau → chéo + 1. Khác nhau → max(trên, trái). Thứ tự chỉ số tăng ở cả hai dãy giữ các đường không giao nhau.','Equal numbers → diagonal + 1. Different → max(top, left). Increasing indices in both sequences keep the lines uncrossed.')];

function add2D(base,id,block){
 const label=bi(`Cách ${block}: Bảng DP 2D`, `Approach ${block}: 2D DP table`),existing=(base.extraParams??[]).find(p=>p.key==='approach');
 const selector=existing?{...existing,default:block,options:[...existing.options,{value:block,label}]}:{key:'approach',type:'select',default:block,label:bi('Cách giải','Approach'),options:[{value:1,label:bi('Cách 1: DP 1D','Approach 1: 1D DP')},{value:block,label}]};
 return {...base,extraParams:[...(base.extraParams??[]).filter(p=>p.key!=='approach'),selector],[`code${block}`]:CODES[id],[`code${block}Label`]:label,[`builder${block}`]:(input,params)=>build(id,input,params),
  [`complexity${block}`]:{time:'O(rows × cols)',space:'O(rows × cols)',note:bi('Bảng đầy đủ theo từng phần tử và từng tổng. Visualization: tối đa 8 loại xu / 10 số, amount ≤ 30 / tổng nums ≤ 60.','Full table by item prefix and sum. Visualization: up to 8 coin types / 10 values, amount ≤ 30 / total nums ≤ 60.')},
  approach:[...(base.approach??[]),bi(`Cách ${block}: dp[row][col] dùng ${id===518?'row loại xu đầu':'row số đầu'} để tạo tổng col. Nhánh lấy đọc ${id===518?'cùng hàng (dùng lại xu)':'hàng trước (mỗi phần tử một lần)'}.`,`Approach ${block}: dp[row][col] uses the first row ${id===518?'coin types':'values'} to form sum col. Taking reads ${id===518?'the same row (reuse a coin)':'the previous row (each occurrence once)'}.`)]};
}
module.exports={1277:p1277,1035:p1035,
 518:add2D(require('./dp')[518],518,2),
 416:add2D(require('./partition-equal-subset-416')[416],416,4),
 494:add2D(require('./target-sum-494')[494],494,2)};
