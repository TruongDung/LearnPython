const bi = (vi, en) => ({vi, en});
const CODE = [
  'class Solution:',
  '    def findIntegers(self, n: int) -> int:',
  '        bits = bin(n)[2:]',
  '        f = [1, 2]',
  '        for length in range(2, len(bits)):',
  '            f.append(f[-1] + f[-2])',
  '        total, prev = 0, 0',
  '        for i, bit in enumerate(bits):',
  '            remaining = len(bits) - i - 1',
  "            if bit == '1':",
  '                total += f[remaining]',
  '                if prev == 1:',
  '                    return total',
  '            prev = int(bit)',
  '        return total + 1',
];

// Generate only a small witness sample, even when a branch represents millions.
function sample600(prefix, remaining, limit = 6) {
  const result = [];
  function visit(word, left) {
    if(result.length >= limit) return;
    if(left === 0) { result.push(word); return; }
    visit(word + '0', left - 1);
    if(!word.endsWith('1')) visit(word + '1', left - 1);
  }
  visit(prefix, remaining);
  return result;
}

function buildSteps600(input) {
  if(!Array.isArray(input) || input.length !== 1 || !Number.isSafeInteger(input[0]) || input[0] < 0 || input[0] > 1e9)
    throw new RangeError('#600: n phải là số nguyên từ 0 đến 10^9 / n must be an integer from 0 to 10^9.');
  const n = input[0], bits = n.toString(2), groups = [], steps = [];
  const locals = {n};
  let f = [], cutAt = null, answer = null;
  // Each snapshot is AFTER this one executed source line. Loop headers include
  // their final, exhausted evaluation; unbound Python locals stay absent.
  const snapshot = (line, phase, event, title, extra = {}, final = false) => {
    const position = locals.i ?? null;
    const localCopy = Object.fromEntries(Object.entries(locals).map(([key,value]) => [key,Array.isArray(value)?[...value]:value]));
    const view = {
      n, bits, phase, position, total:locals.total ?? null, prev:locals.prev ?? null,
      remaining:locals.remaining ?? null, cutAt, answer, f:[...f],
      length:locals.length ?? 1, line, event, timing:'after', locals:localCopy,
      condition:null, frame:steps.length,
      groups:groups.map(group => ({...group, samples:[...group.samples]})),
      ...extra,
    };
    steps.push({
      title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),
      note:bi('', ''), codeLines:[line], debugLine:line, final,
      arr:[...bits].map(Number), highlight:position === null ? [] : [position],
      vars:Object.entries(localCopy).map(([name,value]) => ({name,value:Array.isArray(value)?JSON.stringify(value):value})),
      nonConsecutive600View:view,
    });
  };
  locals.bits = bits;
  snapshot(3,'setup','set-bits',bi('n → nhị phân','n → binary'));
  f = [1,2]; locals.f = f;
  snapshot(4,'prepare','seed-f',bi('f = [1, 2]','f = [1, 2]'));
  for(let length=2;length<bits.length;length++) {
    locals.length = length;
    snapshot(5,'prepare','f-loop-enter',bi(`length = ${length}`,`length = ${length}`),{condition:{expression:'for length',result:true}});
    f.push(f.at(-1)+f.at(-2));
    snapshot(6,'prepare','append-f',bi(`f[${length}] = ${f[length]}`,`f[${length}] = ${f[length]}`));
  }
  snapshot(5,'prepare','f-loop-exit',bi('Đủ bảng f','f table complete'),{condition:{expression:'for length',result:false}});
  locals.total = 0; locals.prev = 0;
  snapshot(7,'prepare','initialize-scan',bi('total = 0 · prev = 0','total = 0 · prev = 0'));
  for(let i=0;i<bits.length;i++) {
    locals.i = i; locals.bit = bits[i];
    snapshot(8,'scan','bit-loop-enter',bi(`i = ${i} · bit = ${bits[i]}`,`i = ${i} · bit = ${bits[i]}`),{condition:{expression:'for i, bit',result:true}});
    const remaining = bits.length - i - 1;
    locals.remaining = remaining;
    snapshot(9,'scan','set-remaining',bi(`Còn ${remaining} bit`,`${remaining} bits left`));
    snapshot(10,'scan','check-bit',bi(bits[i]==='1'?'bit = 1 ✓':'bit = 0',bits[i]==='1'?'bit = 1 ✓':'bit = 0'),{condition:{expression:"bit == '1'",result:bits[i]==='1'}});
    if(bits[i] === '1') {
      const prefix = bits.slice(0,i) + '0';
      const before = locals.total;
      groups.push({position:i,prefix, remaining, count:f[remaining], samples:sample600(prefix,remaining)});
      locals.total += f[remaining];
      snapshot(11,'count','add-group',bi(`total += ${f[remaining]}`,`total += ${f[remaining]}`),{addition:{before,amount:f[remaining],after:locals.total}});
      const consecutive = locals.prev === 1;
      if(consecutive) cutAt = i;
      snapshot(12,consecutive?'cut':'scan','check-prev',bi(consecutive?'prev = 1 → gặp 11':'prev = 0 → đi tiếp',consecutive?'prev = 1 → found 11':'prev = 0 → continue'),{condition:{expression:'prev == 1',result:consecutive}});
      if(consecutive) {
        cutAt = i;
        answer = locals.total;
        snapshot(13,'done','return-cut',bi(`Trả về ${answer}`,`Return ${answer}`),{},true);
        return {n,answer,steps};
      }
    }
    const oldPrev = locals.prev;
    locals.prev = Number(bits[i]);
    snapshot(14,'follow','set-prev',bi(`prev ← ${locals.prev}`,`prev ← ${locals.prev}`),{change:{name:'prev',before:oldPrev,after:locals.prev}});
  }
  snapshot(8,'scan-end','bit-loop-exit',bi('Đã quét hết bit','All bits scanned'),{condition:{expression:'for i, bit',result:false}});
  answer = locals.total + 1;
  snapshot(15,'done','return-valid',bi(`${locals.total} + 1 = ${answer}`,`${locals.total} + 1 = ${answer}`),{},true);
  return {n,answer,steps};
}

module.exports = {
  600:{
    id:600,difficulty:'hard',slug:'non-negative-integers-without-consecutive-ones',
    title:bi('Non-negative Integers without Consecutive Ones','Non-negative Integers without Consecutive Ones'),
    titleVi:bi('Đếm số nhị phân không có 11','Count binary integers without 11'),
    category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},
    tags:[{key:'digit-dp',vi:'DP chữ số',en:'Digit DP'},{key:'bitmask',vi:'Bitmask',en:'Bitmask'}],
    statement:bi('Đếm các số trong [0, n] có biểu diễn nhị phân không chứa hai bit 1 liền nhau.','Count integers in [0, n] whose binary representation has no adjacent 1 bits.'),
    defaultInput:[5],inputKind:'nonneg',singleInput:true,maxInput:1e9,inputLabel:bi('n (0…10⁹)','n (0…10⁹)'),extraParams:[],
    debugMode:'line-by-line',
    approach:[bi('Quét bit từ trái sang phải. Gặp 1: thử 0 và đếm cả nhánh nhỏ hơn n.','Scan left to right. At a 1, choose 0 and count the entire branch below n.'),bi('Gặp 11 thì dừng; nếu đi hết, tính cả n.','Stop at 11; if the scan finishes, include n itself.')],
    complexity:{time:'O(log n)',space:'O(log n)',note:bi('Đếm cả nhóm bằng f[r], không duyệt từng số.','Count each group with f[r] instead of enumerating every integer.')},
    code:CODE,liveArgs:input=>[input[0]],builder:buildSteps600,
  },
};
