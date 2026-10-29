'use strict';

const {runTrace} = require('./wasm-picture-trace');
const bi = (vi, en) => ({vi, en});
const code = [
  'class Solution:',
  '    def sortByAbsoluteValue(self, nums):',
  '        result = nums[:]',
  '        n = len(result)',
  '        for i in range(1, n):',
  '            value = result[i]',
  '            key = abs(value)',
  '            j = i - 1',
  '            while j >= 0 and abs(result[j]) > key:',
  '                result[j + 1] = result[j]',
  '                j -= 1',
  '            result[j + 1] = value',
  '        return result',
];
const code2 = [
  'class Solution:',
  '    def sortByAbsoluteValue(self, nums):',
  '        keys = []',
  '        def distance(value):',
  '            key = abs(value)',
  '            keys.append(key)',
  '            return key',
  '        result = sorted(nums, key=distance)',
  '        return result',
];

function parse(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100 ||
      !input.every(x => Number.isSafeInteger(x) && Math.abs(x) <= 100)) {
    throw new RangeError('#3667: nhập 1–100 số nguyên trong [-100,100] / enter 1–100 integers in [-100,100].');
  }
  return [...input];
}

function build(input, block) {
  const nums = parse(input), source = block === 1 ? code : code2;
  const run = runTrace({code:source.join('\n'), method:'sortByAbsoluteValue', args:[nums]});
  let prefix = 0, held = null, heldKey = null, gap = null, round = null, cursor = null;
  let checks = 0, shifts = 0, placed = 0, keyCursor = null;
  const steps = run.events.map((record, index) => {
    const line = record.line, text = source[line - 1].trim(), x = {...record.outer, ...record.locals};
    let event = 'step', comparison = null, move = null;
    if (block === 1) {
      if (line === 3) {prefix = 1; event = 'copy';}
      if (line === 5 && record.branch) {round = x.i; held = heldKey = gap = cursor = null; event = 'select';}
      if (line === 6) {held = x.value; gap = x.i; event = 'pick';}
      if (line === 7) {heldKey = x.key; event = 'key';}
      if (line === 8 || line === 11) cursor = x.j;
      if (line === 9) {
        event = 'compare'; checks++;
        comparison = {j:x.j, left:x.j >= 0 ? x.result[x.j] : null, key:x.key, shift:record.branch};
      }
      if (line === 10) {event = 'shift'; shifts++; gap = x.j; move = {from:x.j, to:x.j + 1, value:x.result[x.j]};}
      if (line === 12) {
        event = 'place'; placed++; prefix = x.i + 1;
        move = {from:'held', to:x.j + 1, value:x.value}; held = heldKey = gap = cursor = null;
      }
    } else {
      if (record.scope === 'distance') {
        event = line === 5 ? 'key' : line === 6 ? 'save-key' : 'return-key';
        keyCursor = line === 5 ? x.keys.length : x.keys.length - 1;
        held = x.value; heldKey = x.key;
      }
      if (line === 8 && record.scope === 'sortByAbsoluteValue') {
        event = 'sort'; prefix = nums.length; held = heldKey = keyCursor = null;
      }
    }
    const final = index === run.events.length - 1;
    if (final) {event = 'return'; prefix = nums.length; round = null;}
    const names = block === 1 ? ['i','j','value','key','n','result']
      : record.scope === 'distance' ? ['value','key','keys'] : ['keys','result'];
    return {
      arr:[], codeBlock:block, codeLines:[line], final, note:bi('',''),
      title:bi(`L${line} · ${event}`, `L${line} · ${event}`),
      vars:names.map(name => ({name, value:Object.hasOwn(record.locals,name) ? record.locals[name] : '—'})),
      absolute3667View:{block, source:{line, text, timing:'after'}, scope:record.scope,
        locals:record.locals, outer:record.outer, frames:record.frames,
        returning:record.returning, returned:record.returned, branch:record.branch,
        nums:[...nums], result:x.result ?? null, keys:x.keys ?? [], event, prefix,
        held, heldKey, gap, round, cursor, checks, shifts, placed, keyCursor, comparison, move,
        done:final, answer:final ? run.answer : null},
    };
  });
  return {original:nums, answer:run.answer, steps};
}

module.exports = {3667:{
  id:3667, difficulty:'easy', premium:true, slug:'sort-array-by-absolute-value',
  title:bi('Sort Array By Absolute Value','Sort Array By Absolute Value'),
  titleVi:bi('Sắp xếp theo khoảng cách tới 0','Sort by distance from zero'),
  category:{key:'array', vi:'Mảng', en:'Array'},
  tags:[{key:'sorting', vi:'Sắp xếp', en:'Sorting'}, {key:'math', vi:'Toán học', en:'Math'}],
  inputKind:'integer', defaultInput:[3,-1,-4,1,5],
  extraParams:[{key:'approach', label:bi('Cách làm','Approach'), type:'select', default:1,
    options:[{value:1,label:bi('1. Chèn từng bước','1. Insertion sort')},
      {value:2,label:bi('2. Sort theo |x|','2. Sort by |x|')}]}],
  debugMode:'line-by-line',
  inputLabel:bi('nums · 1–100 số trong [-100,100]','nums · 1–100 integers in [-100,100]'),
  statement:bi('Xếp các số theo |x| tăng dần. Giữ nguyên dấu; các số cùng |x| có thể đứng theo thứ tự bất kỳ.',
    'Order the numbers by increasing |x|. Keep their signs; equal absolute values may appear in either order.'),
  approach:[bi('Khoảng cách tới 0 → so sánh → dịch ô → chèn.', 'Distance from zero → compare → shift → insert.')],
  codeLabel:bi('1. Chèn từng bước','1. Insertion sort'),
  code2Label:bi('2. Sort theo |x|','2. Sort by |x|'),
  complexity:{time:'O(n²)', space:'O(n)', note:bi('Chèn từng ô; result là bản sao của nums.','Insert one item at a time; result copies nums.')},
  complexity2:{time:'O(n log n)', space:'O(n)', note:bi('Tính key một lần mỗi số; sorted sắp xếp trong một dòng.','Compute one key per value; sorted reorders the array in one statement.')},
  code, code2, liveArgs:input => [parse(input)], liveArgs2:input => [parse(input)],
  builder:(input,params={}) => build(input,Number(params.approach)===2?2:1), builder2:input => build(input,2),
}};
