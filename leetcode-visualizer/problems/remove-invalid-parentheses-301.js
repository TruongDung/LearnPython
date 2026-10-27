"use strict";
const base = require('./backtracking')[301];
const bi = (vi, en) => ({vi, en});
const CODE = Object.freeze([
  'class Solution:',
  '    def removeInvalidParentheses(self, s):',
  '        def is_valid(text):',
  '            balance = 0',
  '            for index, ch in enumerate(text):',
  "                if ch == '(':",
  '                    balance += 1',
  "                if ch == ')':",
  '                    balance -= 1',
  '                if balance < 0:',
  '                    return False',
  '            return balance == 0',
  '        level = [s]',
  '        while level:',
  '            valid = []',
  '            for text in level:',
  '                if is_valid(text):',
  '                    valid.append(text)',
  '            if valid:',
  '                return valid',
  '            next_level = set()',
  '            for text in level:',
  '                for i in range(len(text)):',
  "                    if text[i] in '()':",
  '                        next_level.add(text[:i] + text[i+1:])',
  '            level = sorted(next_level)',
  "        return ['']",
]);
function parse(input) { return base.parseRemoveInvalidParentheses301Input(input); }
function build(input) {
  const s = parse(input), steps = [], history = [];
  let level, valid, next, text, i, helper = null, lastScan = null, focus = null;
  let depth = 0, statuses = new Map(), generation = false, removal = null, attempts = 0, duplicates = 0;
  const slice = (items, center = -1) => { const start = Math.max(0, Math.min(center - 3, items.length - 8)); return {start, total:items.length, items:items.slice(start, start + 8)}; };
  function emit(line, phase, title, final = false) {
    const locals = helper ? {...helper.locals} : {s, ...(text === undefined ? {} : {text}), ...(i === undefined ? {} : {i})};
    const scan = helper ? {...helper.locals, processed:helper.processed, active:helper.active, result:helper.result ?? null} : lastScan ? {...lastScan} : null;
    const current = slice(level || [], (level || []).indexOf(focus));
    const pending = slice(next ? [...next] : [], next ? next.size - 1 : -1);
    const context = {levelSize:level?.length ?? null, nextSize:next?.size ?? null, valid:valid ? [...valid] : null};
    const watched = helper ? [['text',locals.text],['index',locals.index ?? '—'],['ch',locals.ch ?? '—'],['balance',locals.balance],['len(text)',locals.text.length],['balance < 0',locals.balance < 0]] : [['text',text ?? '—'],['i',i ?? '—'],['len(level)',context.levelSize ?? '—'],['len(next_level)',context.nextSize ?? '—'],['len(valid)',valid?.length ?? '—'],['s',s]];
    steps.push({arr:[], codeLines:[line], title, note:bi('',''), final, vars:watched.map(([name,value])=>({name,value})),
      removeInvalid301View:{phase, source:{line,text:CODE[line-1],timing:'after'}, scope:helper ? 'is_valid' : 'removeInvalidParentheses', locals, context, depth, focus, scan,
        current:{...current,items:current.items.map(value=>({text:value,status:statuses.get(value) || 'pending'}))},
        next:pending, generation, removal:removal ? {...removal} : null, attempts, duplicates,
        history:history.map(row=>({...row})), results:valid ? [...valid] : [], minimum:history.at(-1)?.status === 'minimum', input:s}});
  }
  const title = (vi,en) => bi(vi,en);
  emit(3,'define',title('Tạo hàm kiểm tra','Define validator'));
  level=[s]; history.push({depth:0,total:1,checked:0,valid:0,status:'search'}); emit(13,'level-init',title('Bắt đầu từ chuỗi gốc','Start with the input'));
  function isValid(value) {
    helper={locals:{text:value,balance:0},processed:0,active:null}; statuses.set(value,'scanning');
    emit(4,'balance-init',title('balance = 0','balance = 0'));
    for(let index=0;index<value.length;index++) {
      const ch=value[index]; Object.assign(helper.locals,{index,ch}); helper.active=index;
      emit(5,'character',title(`Xét ký tự ${index}`,`Inspect character ${index}`));
      emit(6,'open-check',title("ch == '(' ?","ch == '(' ?"));
      if(ch==='(') {helper.locals.balance++;helper.processed=index+1;emit(7,'open-add',title('Ngoặc mở: +1','Open: +1'));}
      if(ch!==')') helper.processed=index+1;
      emit(8,'close-check',title("ch == ')' ?","ch == ')' ?"));
      if(ch===')') {helper.locals.balance--;helper.processed=index+1;emit(9,'close-sub',title('Ngoặc đóng: −1','Close: −1'));}
      emit(10,'negative-check',title('balance < 0 ?','balance < 0 ?'));
      if(helper.locals.balance<0) { finish(false,11); return false; }
    }
    helper.active=null; emit(5,'scan-end',title('Đã quét hết chuỗi','Scan complete'));
    const result=helper.locals.balance===0;finish(result,12);return result;
    function finish(result,line) {
      helper.result=result; statuses.set(value,result?'valid':'invalid');
      history.at(-1).checked++; if(result) history.at(-1).valid++;
      emit(line,result?'valid':'invalid',title(result?'✓ Hợp lệ':'✕ Chưa hợp lệ',result?'✓ Valid':'✕ Invalid'));
      lastScan={...helper.locals,processed:helper.processed,active:helper.active,result}; helper=null;
    }
  }
  while(level.length) {
    emit(14,'while',title(`Tầng −${depth}`,`Layer −${depth}`));
    valid=[];focus=null;lastScan=null;emit(15,'valid-init',title('valid = []','valid = []'));
    for(const value of level) {
      text=value;focus=text;lastScan=null;emit(16,'candidate',title('Chọn chuỗi để kiểm tra','Choose a candidate'));
      const result=isValid(text);emit(17,'validated',title(result?'✓ Giữ kết quả':'✕ Thử chuỗi khác',result?'✓ Keep result':'✕ Try another'));
      if(result) {valid.push(text);emit(18,'collect',title('Thêm vào valid','Append to valid'));}
    }
    emit(16,'candidates-end',title('Đã kiểm tra cả tầng','Whole layer checked'));
    history.at(-1).status=valid.length?'minimum':'rejected';
    emit(19,valid.length?'minimum':'reject-level',title(valid.length?`✓ Chỉ cần xóa ${depth} ngoặc`:'Không có chuỗi hợp lệ',valid.length?`✓ Minimum ${depth} removals`:'No valid candidate'));
    if(valid.length) {emit(20,'done',title(`${valid.length} kết quả · xóa ${depth} ngoặc`,`${valid.length} results · ${depth} removals`),true);return {original:s,answer:[...valid],steps};}
    next=new Set();generation=true;lastScan=null;removal=null;attempts=0;duplicates=0;emit(21,'next-init',title('Sinh tầng kế tiếp','Generate the next layer'));
    for(const value of level) {
      text=value;focus=text;removal=null;emit(22,'parent',title('Chọn chuỗi cha','Choose a parent'));
      for(let index=0;index<text.length;index++) {
        i=index;removal=null;emit(23,'delete-index',title(`Thử vị trí ${i}`,`Try index ${i}`));
        const removable='()'.includes(text[i]);emit(24,removable?'removable':'letter',title(removable?'Xóa được dấu ngoặc':'Giữ nguyên chữ cái',removable?'Parenthesis can be removed':'Keep this letter'));
        if(removable) {
          const child=text.slice(0,i)+text.slice(i+1),duplicate=next.has(child);next.add(child);attempts++;if(duplicate)duplicates++;
          removal={parent:text,index:i,char:text[i],child,duplicate};emit(25,duplicate?'duplicate':'delete',title(duplicate?'↺ Trùng: set giữ một bản':'−1 ngoặc → chuỗi mới',duplicate?'↺ Duplicate: keep one copy':'−1 parenthesis → new string'));
        }
      }
      removal=null;emit(23,'indices-end',title('Đã thử hết vị trí','All indices tried'));
    }
    emit(22,'parents-end',title('Đã sinh hết chuỗi con','All children generated'));
    level=[...next].sort();depth++;statuses=new Map();focus=null;lastScan=null;removal=null;generation=false;
    history.push({depth,total:level.length,checked:0,valid:0,status:'search'});emit(26,'promote',title(`Chuyển sang tầng −${depth}`,`Move to layer −${depth}`));
  }
  emit(27,'fallback',title('Trả chuỗi rỗng','Return the empty string'),true);return {original:s,answer:[''],steps};
}
module.exports={301:{...base,code:CODE,builder:build,liveArgs:input=>[parse(input)],
  statement:bi('Xóa ít dấu ngoặc nhất. Giữ nguyên chữ cái và tìm tất cả chuỗi hợp lệ khác nhau.','Remove the fewest parentheses. Keep letters and find every distinct valid string.'),
  approach:[bi('Mỗi tầng xóa thêm 1 ngoặc. Quét balance của cả tầng → gặp tầng có kết quả thì dừng.','Each layer removes one more parenthesis. Scan the whole layer → stop at the first layer with results.')],
  complexity:{time:'O(n² · 2ᵖ)',space:'O(n · 2ᵖ)',note:bi('p: số ngoặc; n ≤ 14. set loại chuỗi trùng.','p: number of parentheses; n ≤ 14. A set removes duplicates.')},
}};
