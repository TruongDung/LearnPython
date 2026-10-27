const base=require('./backtracking')[784];
const bi=(vi,en)=>({vi,en});
const copy=value=>Array.isArray(value)?value.map(copy):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,copy(v)])):value;
const CODE=[
 'class Solution:',
 '    def letterCasePermutation(self, s: str):',
 '        result = []',
 '        path = []',
 '        def backtrack(i):',
 '            if i == len(s):',
 "                result.append(''.join(path))",
 '                return',
 '            ch = s[i]',
 '            if ch.isdigit():',
 '                path.append(ch)',
 '                backtrack(i + 1)',
 '                path.pop()',
 '            else:',
 '                for choice in (ch.lower(), ch.upper()):',
 '                    path.append(choice)',
 '                    backtrack(i + 1)',
 '                    path.pop()',
 '        backtrack(0)',
 '        return result',
];
function parse784(input){
 const s=String(input);
 if(!/^[A-Za-z0-9]{1,12}$/.test(s))throw new RangeError('784: nhập 1–12 chữ cái hoặc chữ số / enter 1–12 ASCII letters or digits.');
 return s;
}
function buildLetterCase784(input){
 const s=parse784(input),path=[],result=[],steps=[],stack=[],outer={s};
 const letters=[...s].filter(ch=>/[A-Za-z]/.test(ch)).length,total=2**letters;
 let frames=0,omitted=0;
 const titles={
  'init-result':bi('Khay kết quả trống','Empty result tray'),'init-path':bi('Chuẩn bị chuỗi mới','Prepare the new string'),
  define:bi('Chuẩn bị quay lui','Define backtracking'),complete:bi('Đã ghép hết chuỗi?','String complete?'),
  save:bi('Lưu chuỗi ✓','Save the string ✓'),return:bi('Về nhánh cha ↶','Return to parent ↶'),
  read:bi('Đọc ký tự đang xét','Read the current character'),digit:bi('Là chữ số?','Is it a digit?'),
  choose:bi('Chọn thường / HOA','Choose lower / UPPER'),append:bi('Thêm ký tự +','Append a character +'),
  'append-digit':bi('Giữ nguyên chữ số +','Keep the digit +'),'child-return':bi('Nhánh con đã xong ↶','Child finished ↶'),
  pop:bi('Bỏ ký tự vừa thêm ↶','Undo the last character ↶'),done:bi('Duyệt xong','Search finished'),
  final:bi('Tất cả chuỗi ✓','All strings ✓'),
 };
 function emit(line,action,options={}){
  frames++;
  if(steps.length>=4000&&action!=='final'){omitted++;return;}
  const frame=stack.at(-1),locals=copy(frame?{...frame.locals,s,path,result}:outer);
  const view={s,letters,total,frame:frames,omitted,source:{line,text:CODE[line-1],timing:'after',scope:frame?'backtrack':'letterCasePermutation'},
   locals,path:[...path],result:[...result],stack:stack.map(item=>({...item.locals})),i:frame?.locals.i??null,
   ch:frame?.locals.ch??null,choice:frame?.locals.choice??null,action,condition:options.condition??null,change:options.change??null};
  const title=titles[action];
  steps.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),note:bi('',''),arr:[],highlight:[],mark:[],
   codeLines:[line],debugLine:line,final:action==='final',
   vars:Object.entries(locals).map(([name,value])=>({name,value:typeof value==='object'?JSON.stringify(value):value})),letterCase784View:view});
 }
 outer.result=result;emit(3,'init-result');outer.path=path;emit(4,'init-path');emit(5,'define');
 function backtrack(i){
  const frame={locals:{i}};stack.push(frame);
  const complete=i===s.length;emit(6,'complete',{condition:{expression:'i == len(s)',result:complete}});
  if(complete){
   result.push(path.join(''));emit(7,'save',{change:{kind:'save',value:result.at(-1),index:result.length-1}});
   emit(8,'return');stack.pop();return;
  }
  const ch=s[i];frame.locals.ch=ch;emit(9,'read');
  const digit=/[0-9]/.test(ch);emit(10,'digit',{condition:{expression:'ch.isdigit()',result:digit}});
  if(digit){
   path.push(ch);emit(11,'append-digit',{change:{kind:'append',value:ch}});
   backtrack(i+1);emit(12,'child-return');
   const value=path.pop();emit(13,'pop',{change:{kind:'pop',value}});
  }else{
   for(const choice of [ch.toLowerCase(),ch.toUpperCase()]){
    frame.locals.choice=choice;emit(15,'choose',{condition:{expression:'for choice',result:true}});
    path.push(choice);emit(16,'append',{change:{kind:'append',value:choice}});
    backtrack(i+1);emit(17,'child-return');
    const value=path.pop();emit(18,'pop',{change:{kind:'pop',value}});
   }
   emit(15,'choose',{condition:{expression:'for choice',result:false}});
  }
  stack.pop();
 }
 backtrack(0);emit(19,'done');emit(20,'final');
 return {s,answer:[...result],steps};
}
module.exports={784:{...base,code:CODE,debugMode:'line-by-line',builder:buildLetterCase784,
 approach:[bi('Chữ cái → hai nhánh thường / HOA. Chữ số → một đường đi.','Letters → lower / UPPER branches. Digits → one path.'),bi('Thêm ký tự → đệ quy → bỏ ký tự. Đủ độ dài thì lưu chuỗi.','Append → recurse → undo. Save the string at full length.')],
 liveArgs:input=>[parse784(input)]}};
