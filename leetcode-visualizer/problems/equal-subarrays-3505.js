'use strict';
const {runTrace}=require('./wasm-picture-trace'),methods=require('./equal-subarrays-3505-methods');
const bi=(vi,en)=>({vi,en}),pairs=value=>value?.__pairs__??[];
function parse(input,params={}){
 let nums=input;
 if(typeof input==='string'){
  if(input.trim().startsWith('[')){try{nums=JSON.parse(input);}catch(_){nums=null;}}
  else nums=input.trim()?input.split(',').map(value=>value.trim()?Number(value):NaN):[];
 }
 const x=Number(params.x??3),k=Number(params.k??2);
 if(!Array.isArray(nums)||nums.length<2||nums.length>18||nums.some(value=>!Number.isInteger(value)||Math.abs(value)>1e6)||!Number.isInteger(x)||x<2||x>nums.length||!Number.isInteger(k)||k<1||k>15||k*x>nums.length)throw new RangeError('3505: enter 2–18 integers in [-1000000,1000000], 2 ≤ x ≤ nums.length and 1 ≤ k ≤ 15 with k × x ≤ nums.length.');
 return{nums:[...nums],x,k};
}
// This final-only certificate illustrates one optimum; it is not a Python local.
function certificate(nums,cost,x,k){
 const n=nums.length,dp=Array.from({length:n+1},()=>Array(k+1).fill(Infinity)),take=Array.from({length:n+1},()=>Array(k+1).fill(false));
 for(let i=0;i<=n;i++)dp[i][0]=0;
 for(let i=1;i<=n;i++)for(let j=1;j<=k;j++){dp[i][j]=dp[i-1][j];if(i>=x&&dp[i-x][j-1]+cost[i-x]<dp[i][j]){dp[i][j]=dp[i-x][j-1]+cost[i-x];take[i][j]=true;}}
 let i=n,j=k;const starts=[];while(j){if(take[i][j]){starts.unshift(i-x);i-=x;j--;}else i--;}
 const after=[...nums],groups=starts.map(start=>{const values=nums.slice(start,start+x).sort((a,b)=>a-b),median=values[Math.floor((x-1)/2)];for(let index=start;index<start+x;index++)after[index]=median;return{start,end:start+x-1,median,cost:cost[start]};});
 return{groups,after,total:dp[n][k]};
}
const windowWatches=[['start','window','median','index','value','current'],['start','window','median','low_sum','high_sum','current'],['start','value','low_size','high_size','low_sum','high_sum','median','current'],['start','index','end','need','nxt','median_rank','median','current']];
function build(input,params={},method=1){
 const {nums,x,k}=parse(input,params),n=nums.length,definition=methods[method-1],trace=runTrace({code:definition.code.join('\n'),method:'minOperations',args:[nums,x,k]});
 let phase='windows',start=0,median=null,current=null,processed=0,cell=null,decision=null,prevUsed=0,currUsed=null;
 const medians=Array(n-x+1).fill(null),written=new Set(),currWritten=new Set();
 const steps=trace.events.map((record,at)=>{
  const root=record.outer,local=record.locals,context={...root,...local},source=definition.code[record.line-1].trim(),final=at===trace.events.length-1;let event='line';
  if(source==='for start in range(n - x + 1):'&&record.branch){start=root.start;median=null;current=null;processed=0;event='window';}
  if(source.startsWith('median =')){median=root.median;event='median';}
  if(source==='current = 0'){current=0;processed=0;}
  if(source==='current += abs(value - median)'){current=root.current;processed=root.index+1;event='distance';}
  if(source.startsWith('current = median')){current=root.current;processed=x;event='distance';}
  if(source==='cost[start] = current'){medians[root.start]=root.median;event='cost';}
  if(['dp = []','memo = {}','prev = [0] * (n + 1)','best = float("inf")'].includes(source)){phase=method===7?'dfs':'dp';start=null;cell=null;decision=null;}
  if(phase==='dp'&&method!==5){
   if(source==='for used in range(1, k + 1):'){decision=null;cell=record.branch&&method!==6?[root.i,root.used]:null;}
   if(source==='for i in range(1, n + 1):'){decision=null;cell=record.branch&&method===6?[root.i,root.used]:null;}
   if(source==='dp[0][0] = 0'){written.add('0,0');cell=[0,0];}
   if(source==='dp[i][0] = 0'){written.add(`${root.i},0`);cell=[root.i,0];decision=null;}
   if(source==='curr = [float("inf")] * (n + 1)'){currUsed=root.used;currWritten.clear();decision=null;cell=null;}
   if(source==='prev = curr'){prevUsed=root.used;}
   if(source.startsWith('skip =')){cell=[root.i,root.used];decision={skip:root.skip,take:null,base:null,cost:null,start:null,result:null};event='skip';}
   if(source==='take = float("inf")'&&decision)decision.take=root.take;
   if(source.startsWith('take = ')&&source!=='take = float("inf")'&&decision){const w=root.i-x;decision={...decision,take:root.take,base:method===6?root.prev[root.i-x]:root.dp[root.i-x][root.used-1],cost:root.cost[w],start:w};event='take';}
   if(source==='dp[i][used] = min(skip, take)'){written.add(`${root.i},${root.used}`);decision={...decision,result:root.dp[root.i][root.used]};event='write';}
   if(source==='curr[i] = min(skip, take)'){currWritten.add(root.i);decision={...decision,result:root.curr[root.i]};event='write';}
  }
  if(method===5&&phase==='dp'){
   cell=record.scope==='solve'?[local.i,local.left]:null;
   decision=record.scope==='solve'&&local.skip!==undefined?{skip:local.skip,take:local.take??null,base:local.take===undefined?null:typeof local.take==='number'?local.take-root.cost[local.i]:'∞',cost:local.take===undefined?null:root.cost[local.i],start:local.take===undefined?null:local.i,result:source==='memo[key] = min(skip, take)'?Math.min(local.skip==='∞'?Infinity:local.skip,local.take==='∞'?Infinity:local.take):null}:null;
   if(source==='memo[key] = min(skip, take)'){if(decision.result===Infinity)decision.result='∞';event='write';}
   if(source.startsWith('skip ='))event='skip';if(source.startsWith('take ='))event='take';
  }
  const activeStart=phase==='windows'?start:method===7&&record.scope==='search'&&local.i<=n-x?local.i:decision?.start??null;
  const activeMedian=phase==='windows'?median:activeStart===null?null:medians[activeStart];
  if(source.includes('heappush(')||source.includes('heappop('))event='heap';
  if(source.startsWith('bit_count[')||source.startsWith('bit_sum['))event='fenwick';
  if(record.returning&&record.scope==='minOperations')event='return';
  const costs=root.cost?[...root.cost]:null;
  const view={method,line:record.line,source,scope:record.scope,event,branch:record.branch,phase,nums:[...nums],n,x,k,start:activeStart,median:activeMedian,
   current:phase==='windows'?current:activeStart===null?null:root.cost[activeStart],processed:phase==='windows'?processed:activeStart===null?0:x,cost:costs,medians:[...medians],
   window:root.window?[...root.window]:null,low:root.low?[...root.low]:null,high:root.high?[...root.high]:null,lowSize:root.low_size??null,highSize:root.high_size??null,lowSum:root.low_sum??null,highSum:root.high_sum??null,delayed:pairs(root.delayed).map(pair=>[...pair]),
   coords:root.coords?[...root.coords]:null,bitCount:root.bit_count?[...root.bit_count]:null,bitSum:root.bit_sum?[...root.bit_sum]:null,helperIndex:record.scope==='add'||record.scope==='kth'?local.index:record.scope==='prefix'?local.end:null,
   dp:root.dp?root.dp.map(row=>[...row]):null,written:[...written],memo:pairs(root.memo).map(([key,value])=>({i:key[0],left:key[1],value})),
   prev:root.prev?[...root.prev]:null,curr:root.curr?[...root.curr]:null,prevUsed,currUsed,currWritten:[...currWritten],cell:cell?[...cell]:null,decision:decision?{...decision}:null,
   stack:record.frames.filter(f=>f.name==='solve'||f.name==='search').map(f=>({name:f.name,i:f.locals.i,left:f.locals.left,spent:f.locals.spent??null,path:f.locals.path?[...f.locals.path]:null})),
   path:record.scope==='search'?[...local.path]:[],spent:record.scope==='search'?local.spent:null,best:root.best??null,
   certificate:final?certificate(nums,root.cost,x,k):null,answer:final?trace.answer:null,final};
  const names=phase==='windows'?windowWatches[(method<=4?method:1)-1]:method===5?['i','left','skip','take','key']:method===7?['i','left','spent','path','best']:['i','used','skip','take'];
  return{arr:[],codeLines:[record.line],codeBlock:method,final,title:bi(`Dòng ${record.line} · ${record.scope}`,`Line ${record.line} · ${record.scope}`),note:bi('',''),vars:names.map(name=>({name,value:context[name]??'—'})),equalSubarrays3505View:view};
 });return{original:nums,answer:trace.answer,steps};
}
const problem={id:3505,difficulty:'hard',slug:'minimum-operations-to-make-elements-within-k-subarrays-equal',category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},tags:[{key:'sliding',vi:'Cửa sổ trượt',en:'Sliding Window'},{key:'heap',vi:'Heap',en:'Heap'},{key:'fenwick-tree',vi:'Fenwick Tree',en:'Fenwick Tree'}],title:bi('Ít phép đổi nhất cho k đoạn bằng nhau','Minimum Operations Within K Equal Subarrays'),titleVi:bi('Median cho mỗi cửa sổ → DP chọn đoạn','Window medians → choose disjoint windows with DP'),statement:bi('Mỗi phép tăng hoặc giảm một số đi 1. Tạo ít nhất k đoạn không chồng lấn, dài x, mỗi đoạn có các số bằng nhau. Các đoạn có thể dùng giá trị khác nhau.','Each operation changes one number by ±1. Make at least k disjoint length-x subarrays internally equal. Different subarrays may use different target values.'),defaultInput:'5,-2,1,3,7,3,6,4,-1',inputKind:'string',inputLabel:bi('nums · 2–18 số nguyên · hỗ trợ số âm','nums · 2–18 integers · negative values supported'),debugMode:'line-by-line',
 extraParams:[{key:'x',type:'number',label:bi('Độ dài x','Window length x'),default:3,min:2,max:18},{key:'k',type:'number',label:bi('Số đoạn k','Subarray count k'),default:2,min:1,max:15},{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:methods.map((m,i)=>({value:i+1,label:bi(`${i+1}. ${m.label.vi}`,`${i+1}. ${m.label.en}`)}))}],
 approach:[bi('Median tối thiểu hóa tổng khoảng cách tuyệt đối trong mỗi cửa sổ.','The median minimizes the sum of absolute distances in each window.'),bi('Chọn đoạn [i-x,i) thì trạng thái trước phải dừng tại i-x, để không chồng lấn.','Taking [i-x,i) uses a previous state ending at i-x, so windows cannot overlap.')],liveArgs:(input,params)=>{const {nums,x,k}=parse(input,params);return[nums,x,k];}};
methods.forEach((m,i)=>{const suffix=i?i+1:'';problem[`code${suffix}`]=m.code;problem[`code${suffix}Label`]=m.label;problem[`builder${suffix}`]=(input,params)=>build(input,params,i+1);problem[`complexity${suffix}`]={time:m.time,space:m.space,note:bi('n=số phần tử. List Python dịch O(x) khi chèn/xóa; lazy heap có thể giữ O(n) bản chưa dọn. DFS cuối dùng để đối chiếu trên mẫu nhỏ.','n=array length. Python list shifts cost O(x); lazy heaps may retain O(n) entries. The last DFS is a small-input baseline.')};});
module.exports={3505:problem};
