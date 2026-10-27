const base=require('./backtracking')[77];
const bi=(vi,en)=>({vi,en});
const copy=value=>Array.isArray(value)?value.map(copy):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,copy(v)])):value;
const CODE=[
 'class Solution:',
 '    def combine(self, n: int, k: int):',
 '        result = []',
 '        current = []',
 '        def backtrack(start):',
 '            if len(current) == k:',
 '                result.append(current[:])',
 '                return',
 '            for i in range(start, n + 1):',
 '                needed = k - len(current)',
 '                remaining = n - i + 1',
 '                if remaining < needed:',
 '                    break',
 '                current.append(i)',
 '                backtrack(i + 1)',
 '                current.pop()',
 '        backtrack(1)',
 '        return result',
];
function parse77(input,params={}){
 const n=Number(Array.isArray(input)?input[0]:input),k=Number(params.k??2);
 if(!Number.isInteger(n)||n<1||n>8)throw new RangeError('77: n là số nguyên từ 1 đến 8 / n must be an integer from 1 to 8.');
 if(!Number.isInteger(k)||k<1||k>n)throw new RangeError('77: k là số nguyên từ 1 đến n / k must be an integer from 1 to n.');
 return {n,k};
}
function buildCombinations77(input,params={}){
 const {n,k}=parse77(input,params),result=[],current=[],stack=[],steps=[],outer={n,k};
 let total=1;for(let i=1;i<=k;i++)total=total*(n-i+1)/i;total=Math.round(total);
 const titles={
  'init-result':bi('Khay kết quả trống','Empty result tray'),'init-current':bi('Chuẩn bị k ô chọn','Prepare k slots'),
  define:bi('Chuẩn bị quay lui','Define backtracking'),complete:bi('Đã chọn đủ k số?','Picked k numbers?'),
  save:bi('Lưu một bản sao ✓','Save a copy ✓'),return:bi('Trở về nhánh cha ↶','Return to parent ↶'),
  loop:bi('Xét số tiếp theo','Consider the next number'),needed:bi('Còn thiếu bao nhiêu ô?','How many slots remain?'),
  remaining:bi('Còn bao nhiêu số?','How many numbers remain?'),
  'check-prune':bi('Còn đủ số để chọn?','Enough numbers left?'),prune:bi('Không đủ số · dừng nhánh ×','Not enough numbers · stop ×'),
  append:bi('Chọn số +','Pick a number +'),'child-return':bi('Nhánh con đã xong ↶','Child call finished ↶'),
  pop:bi('Bỏ số vừa chọn ↶','Undo the last pick ↶'),done:bi('Duyệt xong','Search finished'),final:bi('Tất cả tổ hợp ✓','All combinations ✓'),
 };
 function emit(line,action,options={}){
  const frame=stack.at(-1),locals=copy(frame?{...frame.locals,n,k,current,result}:outer);
  const view={n,k,total,source:{line,text:CODE[line-1],timing:'after',scope:frame?'backtrack':'combine'},locals,
   current:[...current],result:copy(result),stack:stack.map(item=>({...item.locals,path:[...item.path]})),
   start:frame?.locals.start??null,i:frame?.locals.i??null,needed:frame?.locals.needed??null,remaining:frame?.locals.remaining??null,
   action,condition:options.condition??null,change:options.change??null};
  const title=titles[action];
  steps.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),note:bi('',''),arr:[],highlight:[],mark:[],
   codeLines:[line],debugLine:line,final:action==='final',
   vars:Object.entries(locals).map(([name,value])=>({name,value:typeof value==='object'?JSON.stringify(value):value})),combinations77View:view});
 }
 outer.result=result;emit(3,'init-result');outer.current=current;emit(4,'init-current');emit(5,'define');
 function backtrack(start){
  const frame={locals:{start},path:[...current]};stack.push(frame);
  const full=current.length===k;emit(6,'complete',{condition:{expression:'len(current) == k',result:full}});
  if(full){result.push([...current]);emit(7,'save',{change:{kind:'save',values:[...current],index:result.length-1}});emit(8,'return');stack.pop();return;}
  for(let i=start;i<=n;i++){
   frame.locals.i=i;emit(9,'loop',{condition:{expression:'for i',result:true}});
   frame.locals.needed=k-current.length;emit(10,'needed');
   frame.locals.remaining=n-i+1;emit(11,'remaining');
   const prune=frame.locals.remaining<frame.locals.needed;
   emit(12,'check-prune',{condition:{expression:'remaining < needed',result:prune}});
   if(prune){emit(13,'prune');stack.pop();return;}
   current.push(i);emit(14,'append',{change:{kind:'append',value:i}});
   backtrack(i+1);emit(15,'child-return');
   const value=current.pop();emit(16,'pop',{change:{kind:'pop',value}});
  }
  emit(9,'loop',{condition:{expression:'for i',result:false}});stack.pop();
 }
 backtrack(1);emit(17,'done');emit(18,'final');
 return {n,answer:copy(result),steps};
}
module.exports={77:{...base,code:CODE,debugMode:'line-by-line',builder:buildCombinations77,
 approach:[bi('Đi từ trái sang phải: chọn → gọi nhánh con → bỏ chọn.','Move left to right: pick → recurse → undo.'),bi('Đủ k số thì lưu bản sao; không đủ số còn lại thì dừng.','Save a copy at k numbers; stop when too few numbers remain.')],
 liveArgs:(input,params)=>{const {n,k}=parse77(input,params);return [n,k];}}};
