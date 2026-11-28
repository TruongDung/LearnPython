'use strict';
const {defineEasy}=require('./easy-lesson');
const bi=(vi,en)=>({vi,en});
function numbers(input){if(Array.isArray(input))return [...input];try{const s=String(input).trim();return s.startsWith('[')?JSON.parse(s):s.split(',').map(Number);}catch{return null;}}
function memoMap(value){return new Map((value?.__pairs__||[]).map(([key,n])=>[JSON.stringify(key),n]));}
function removalPlan(boxes,memo){
 const values=memoMap(memo),get=(l,r,k)=>{if(l>r)return 0;while(l<r&&boxes[l+1]===boxes[l]){l++;k++;}return values.get(JSON.stringify([l,r,k]));};
 function visit(l,r,carry){if(l>r)return [];while(l<r&&boxes[l+1]===boxes[l]){carry=[...carry,l];l++;}const k=carry.length,target=get(l,r,k);if(target===(k+1)**2+get(l+1,r,0))return[{indices:[...carry,l],color:boxes[l],points:(k+1)**2},...visit(l+1,r,[])];for(let m=l+1;m<=r;m++)if(boxes[m]===boxes[l]&&target===get(m,r,k+1)+get(l+1,m-1,0))return[...visit(l+1,m-1,[]),...visit(m,r,[...carry,l])];throw Error('Missing executed removal choice');}
 let live=boxes.map((_,i)=>i),total=0;return visit(0,boxes.length-1,[]).map(op=>{const positions=op.indices.map(i=>live.indexOf(i));positions.sort((a,b)=>a-b);if(positions.some((p,i)=>p<0||i&&p!==positions[i-1]+1))throw Error('Nonadjacent removal witness');const before=[...live];live=live.filter(i=>!op.indices.includes(i));total+=op.points;return{...op,before,after:[...live],total};});
}
function mergePlan(stones,k,dp){
 const operations=[];function visit(l,r){if(l===r)return[{left:l,right:r,value:stones[l]}];const sum=stones.slice(l,r+1).reduce((a,b)=>a+b,0),merge=(r-l)%(k-1)===0;for(let m=l;m<r;m+=k-1)if(dp[l][m]+dp[m+1][r]+(merge?sum:0)===dp[l][r]){const groups=[...visit(l,m),...visit(m+1,r)];if(merge){if(groups.length!==k)throw Error('Invalid merge arity');operations.push({left:l,right:r,groups:groups.map(g=>({...g})),cost:sum});return[{left:l,right:r,value:sum}];}return groups;}throw Error('Missing executed merge split');}
 visit(0,stones.length-1);let piles=stones.map((value,i)=>({left:i,right:i,value})),total=0;return operations.map(op=>{const first=piles.findIndex(p=>p.left===op.left),last=piles.findIndex(p=>p.right===op.right);if(last-first+1!==k)throw Error('Nonadjacent merge witness');const before=piles.map(p=>({...p}));piles.splice(first,k,{left:op.left,right:op.right,value:op.cost});total+=op.cost;return{...op,before,after:piles.map(p=>({...p})),total};});
}
function compressionPlan(s,k,memo){
 const values=memoMap(memo),get=(i,last,count,left)=>left<0?Infinity:i===s.length?0:values.get(JSON.stringify([i,last,count,left]));let last='',count=0,left=k;const kept=[],deleted=[];
 for(let i=0;i<s.length;i++){const target=get(i,last,count,left);if(target===get(i+1,last,count,left-1)){deleted.push(i);left--;}else{kept.push(i);if(s[i]===last)count++;else{last=s[i];count=1;}}}
 const runs=[];for(const i of kept){if(runs.at(-1)?.char===s[i])runs.at(-1).count++;else runs.push({char:s[i],count:1});}return{kept,deleted,runs,compressed:runs.map(r=>r.char+(r.count>1?r.count:'')).join('')};
}
function factory(id,original,source,parse,limits,decorate){
 const names={546:['boxes'],1000:['stones','k'],1531:['s','k'],887:['k','n'],1659:['m','n','introvertsCount','extrovertsCount']}[id];
 const sample=parse(original.defaultInput,Object.fromEntries((original.extraParams||[]).map(p=>[p.key,p.default])));
 const lesson=defineEasy(id,typeof original.title==='object'?original.title.en:original.title,'dp',sample,({546:23,1000:20,1531:4,887:3,1659:150})[id],source,limits.vi,original.complexity?.time||'See source',original.complexity?.space||'See source',{
  provenance:original.__catalog?.provenance||{origin:'Project implementation',license:'local'},engine:'wasm',names,prelude:id===546?'from typing import List':'',difficulty:'hard',maxArrayLength:12,teachingMode:'guided',scene:{compact:true,debug:true,kind:'physical-dp'},guide:limits.en,traceOptions:{maxEvents:30000,summarizeLocals:id===1531?{memo:0}:{}}
 });
 const execute=lesson.builder,live=lesson.liveArgs;
 Object.assign(lesson,{defaultInput:original.defaultInput,inputKind:original.inputKind,extraParams:original.extraParams||[],inputLabel:original.inputLabel,liveEditorDisabled:true,sourceLanguage:'python'});
 lesson.builder=(input,params={})=>{const args=parse(input,params),run=execute(JSON.stringify(args)),context={};for(const step of run.steps){const v=step.catalogLessonView;v.physicalDp={id,plan:null};if(decorate)decorate(v,args,run,context);if(id===546||id===1531){const summary=value=>({__summary__:true,count:value?.__pairs__?.length??0});for(const frame of v.frames)if(frame.locals?.memo)frame.locals.memo=summary(frame.locals.memo);if(v.locals.memo)v.locals.memo=summary(v.locals.memo);if(v.oldValues.memo)v.oldValues.memo=summary(v.oldValues.memo);for(const item of step.vars)if(item.name==='memo'){item.value=summary(item.rawValue);item.rawValue=item.value;}}if([546,1531,1659].includes(id)){const keys=id===546?['l','r','k','color','m','res']:id===1531?['i','last','count','k_left','delete','keep']:['position','mask','intro','extro','kind','gain','answer'];for(const frame of v.frames)frame.locals=Object.fromEntries(Object.entries(frame.locals||{}).filter(([name])=>keys.includes(name)));step.vars=step.vars.filter(item=>keys.includes(item.name));}}return run;};
 lesson.liveArgs=(input,params)=>live(JSON.stringify(parse(input,params)));
 lesson.statement=bi(limits.vi,limits.en);return lesson;
}
function create(originals){
 const result={};
 const boxSource=originals[546].code.join('\n').replace('            if (l, r, k) in memo:', '            while l < r and boxes[l + 1] == boxes[l]:\n                l, k = l + 1, k + 1\n            if (l, r, k) in memo:');
 result[546]=factory(546,originals[546],boxSource,input=>{const a=numbers(input);if(!Array.isArray(a)||!a.length||a.length>10||a.some(n=>!Number.isInteger(n)||n<1||n>100))throw Error('546: 1–10 hộp màu 1–100 / 1–10 boxes, colors 1–100.');return[a];},{vi:'Xóa các hộp cùng màu liền nhau: t hộp nhận t² điểm. Có thể xóa phần giữa để ghép các hộp cùng màu. Mô phỏng: 1–10 hộp.',en:'Remove adjacent equal-colored boxes: t boxes earn t² points. Clear gaps to join matching colors. Visual limit: 1–10 boxes.'},(v,[boxes])=>{if(v.final){v.physicalDp.plan=removalPlan(boxes,v.locals.memo);if((v.physicalDp.plan.at(-1)?.total??0)!==v.result)throw Error('Removal witness score mismatch');}});
 result[1000]=factory(1000,originals[1000],originals[1000].code.join('\n'),(input,params={})=>{const a=numbers(input),k=Number(params.k??2);if(!Array.isArray(a)||!a.length||a.length>10||a.some(n=>!Number.isInteger(n)||n<1||n>100)||!Number.isInteger(k)||k<2||k>10)throw Error('1000: 1–10 đống, mỗi đống 1–100 đá; k=2–10 / 1–10 piles of 1–100 stones; k=2–10.');return[a,k];},{vi:'Mỗi lần gộp đúng k đống liền nhau, trả phí bằng tổng số đá. Tìm phí nhỏ nhất để còn một đống; trả -1 nếu không thể. Mô phỏng: 1–10 đống.',en:'Merge exactly k adjacent piles, paying their total stones. Minimize the cost to reach one pile; return -1 if impossible. Visual limit: 1–10 piles.'},(v,[stones,k])=>{if(v.final&&v.result>=0){v.physicalDp.plan=mergePlan(stones,k,v.locals.dp);if((v.physicalDp.plan.at(-1)?.total??0)!==v.result)throw Error('Merge witness cost mismatch');}});
 result[1531]=factory(1531,originals[1531],originals[1531].code.join('\n'),(input,params={})=>{const s=String(input),k=Number(params.k??2);if(!/^[a-z]{1,12}$/.test(s)||!Number.isInteger(k)||k<0||k>s.length)throw Error('1531: 1–12 chữ thường, 0≤k≤n / 1–12 lowercase letters, 0≤k≤n.');return[s,k];},{vi:'Xóa tối đa k ký tự để chuỗi nén RLE ngắn nhất. Ví dụ aaa → a3. Mô phỏng: 1–12 ký tự.',en:'Delete at most k characters to minimize run-length encoding. Example: aaa → a3. Visual limit: 1–12 characters.'},(v,[s,k],run,context)=>{context.memo??=new Map();if(v.line===19){const number=x=>x==='∞'?Infinity:x;context.memo.set(JSON.stringify(v.locals.key),Math.min(number(v.locals.delete),number(v.locals.keep)));}if(v.final){v.physicalDp.plan=compressionPlan(s,k,{__pairs__:[...context.memo].map(([key,n])=>[JSON.parse(key),n])});if(v.physicalDp.plan.compressed.length!==v.result||v.physicalDp.plan.deleted.length>k)throw Error('Compression witness length mismatch');}});
 const eggParse=(input,params={})=>{const a=numbers(input),k=Number(a?.[0]),n=Number(params.n??6);if(!Array.isArray(a)||a.length!==1||!Number.isInteger(k)||k<1||k>8||!Number.isInteger(n)||n<0||n>200)throw Error('887: 1–8 trứng, 0–200 tầng / 1–8 eggs, 0–200 floors.');return[k,n];};
 const limits={vi:'dp[i] là số tầng tối đa kiểm tra được với i trứng sau moves lượt. Cập nhật từ phải sang trái để cả hai giá trị đọc đều thuộc lượt trước. Mô phỏng: 1–8 trứng, 0–200 tầng.',en:'dp[i] is the maximum number of floors covered with i eggs after moves drops. Update right to left so both reads use the previous move. Visual limits: 1–8 eggs, 0–200 floors.'};
 const egg=factory(887,originals[887],require('./egg-drop-887-source.json'),eggParse,limits,(v,[k],run,context)=>{
  const x=v.locals;context.updated??=[];context.history??=[];
  if(Array.isArray(x.dp)&&!context.before)context.before=[...x.dp];
  if(v.line===7){context.before=[...x.dp];context.updated=[];context.complete=false;}
  if(v.line===9&&!context.updated.includes(x.i))context.updated.push(x.i);
  if(v.line===8&&v.branch===false){context.complete=true;if(context.history.at(-1)?.moves!==x.moves)context.history.push({moves:x.moves,coverage:x.dp[k]});}
  v.egg887={previous:[...(context.before||[])],updated:[...context.updated],history:context.history.slice(-6).map(row=>({...row})),complete:context.complete??true};
 });
 egg.extraParams=[{key:'n',type:'number',label:bi('n (số tầng)','n (floors)'),min:0,max:200,default:6}];
 egg.__catalog.provenance={origin:'User-provided Python source',license:'local',url:'https://leetcode.com/problems/super-egg-drop/'};
 egg.codeLabel=bi('Python · DP 1 chiều · phải → trái','Python · 1D DP · right → left');
 egg.complexity={time:'O(k × moves)',space:'O(k)',note:bi('Không tính lịch sử debug; code giữ đúng một mảng dp.','Excludes replay history; the source stores one dp array.')};
 result[887]=egg;
 return result;
}
function gridLesson(original){
 const source=original.code.join('\n');let values;
 return factory(1659,original,source,input=>{let args;try{args=JSON.parse(input);}catch{}if(!Array.isArray(args)||args.length!==4||args.some(n=>!Number.isInteger(n))||args[0]<1||args[1]<1||args[0]>3||args[1]>3||args[0]*args[1]>6||args[2]<0||args[3]<0||args[2]>6||args[3]>6)throw Error('1659: tối đa 6 ô, 0–6 người mỗi loại / Up to 6 cells, 0–6 people of each type.');values=new Map();return args;},{vi:'Đặt người hướng nội (+120) và hướng ngoại (+40) lên lưới. Mỗi hàng xóm làm điểm cả hai người thay đổi. Tối đa hóa hạnh phúc; mô phỏng tối đa 6 ô.',en:'Place introverts (+120) and extroverts (+40) on a grid. Each neighbor changes both occupants’ scores. Maximize happiness; visual limit: 6 cells.'},(v,[m,n,I,E])=>{
  const x=v.locals,key=(p,mask,i,e)=>JSON.stringify([p,mask,i,e]);if(v.line===21&&Number.isInteger(x.position))values.set(key(x.position,x.mask,x.intro,x.extro),x.answer);
  if(v.final){const get=(p,mask,i,e)=>p===m*n?0:values.get(key(p,mask,i,e));let mask=0,i=I,e=E;const cells=[];for(let p=0;p<m*n;p++){const above=Math.floor(mask/3**(n-1)),left=p%n?mask%3:0,next=mask%3**(n-1)*3,target=get(p,mask,i,e);let kind=0;if(target!==get(p+1,next,i,e)){for(const type of[1,2])if(type===1?i:e){let gain=type===1?120:40;for(const other of[left,above])if(other)gain+=(type===1?-30:20)+(other===1?-30:20);if(gain+get(p+1,next+type,i-(type===1),e-(type===2))===target){kind=type;break;}}}cells.push(kind);mask=next+kind;i-=kind===1;e-=kind===2;}v.physicalDp.plan={cells,m,n};}
 });
}
module.exports=create;module.exports.gridLesson=gridLesson;
