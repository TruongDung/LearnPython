'use strict';
const bi=(vi,en)=>({vi,en});
const CODE=[
  'from collections import Counter', 'from typing import List', '', 'class Solution:',
  '    def maxEqualFreq(self, nums: List[int]) -> int:',
  '        count = Counter()',
  '        freq = Counter()',
  '        max_freq = 0',
  '        answer = 0',
  '        for length, x in enumerate(nums, 1):',
  '            old = count[x]',
  '            if old > 0:',
  '                freq[old] -= 1',
  '            count[x] += 1',
  '            freq[count[x]] += 1',
  '            max_freq = max(max_freq, count[x])',
  '',
  '            all_once = max_freq == 1',
  '            drop_single = freq[1] == 1 and freq[max_freq] * max_freq + 1 == length',
  '            trim_tallest = freq[max_freq] == 1 and freq[max_freq - 1] * (max_freq - 1) + max_freq == length',
  '            if all_once or drop_single or trim_tallest:',
  '                answer = length',
  '        return answer',
];
function parse(input,limit=20){
  let nums=input;
  if(typeof input==='string')try{const raw=input.trim();nums=raw.startsWith('[')?JSON.parse(raw):raw.split(',').map(part=>/^\d+$/.test(part.trim())?Number(part):NaN);}catch(_){nums=null;}
  if(!Array.isArray(nums)||!nums.length||nums.length>limit||!Array.from(nums).every(value=>typeof value==='number'&&Number.isInteger(value)&&value>=1&&value<=100000))throw new RangeError(`1224: nums cần 1–${limit} số nguyên 1…100000 / use 1–${limit} integers in 1…100000.`);
  return [...nums];
}
function builder(input){
  const nums=parse(input),steps=[],history=[],count=new Map(),freq=new Map(),get=(map,key)=>map.get(key)??0;
  let countReady=false,freqReady=false,maxFreq,answer,length,x,old,allOnce,dropSingle,trimTallest,checks={once:null,single:null,tallest:null};
  const titles={6:['Tạo count','Create count'],7:['Tạo freq','Create freq'],8:['Khởi tạo max_freq','Initialize max_freq'],9:['Khởi tạo answer','Initialize answer'],10:['Đọc số tiếp theo','Read the next value'],11:['Đọc tần suất cũ','Read the old frequency'],12:['Số này đã xuất hiện?','Has this value appeared?'],13:['Rời nhóm tần suất cũ','Leave the old frequency bucket'],14:['Thêm một lần xuất hiện','Add one occurrence'],15:['Vào nhóm tần suất mới','Enter the new frequency bucket'],16:['Cập nhật cột cao nhất','Update the tallest column'],18:['Mọi cột cao 1?','Are all columns height 1?'],19:['Chỉ một cột cao 1?','Is there one singleton column?'],20:['Chỉ một cột dư 1 ô?','Does just one column have an extra cell?'],21:['Xoá đúng một ô có được không?','Can exactly one cell be removed?'],22:['Ghi nhận prefix dài hơn','Record a longer prefix'],23:['Trả độ dài tốt nhất','Return the best length']};
  function emit(line,phase,condition=null,change=null){
    const values={nums:[...nums]};if(countReady)values.count=Object.fromEntries(count);if(freqReady)values.freq=Object.fromEntries(freq);
    for(const [name,value]of Object.entries({max_freq:maxFreq,answer,length,x,old,all_once:allOnce,drop_single:dropSingle,trim_tallest:trimTallest}))if(value!==undefined)values[name]=value;
    const title=titles[line];
    steps.push({title:bi(`Dòng ${line} · ${title[0]}`,`Line ${line} · ${title[1]}`),note:bi('',''),arr:[],highlight:[],mark:[],codeLines:[line],final:line===23,
      vars:Object.entries(values).map(([name,value])=>({name,value})),
      equalFreq1224View:{nums:[...nums],line,source:CODE[line-1].trim(),phase,condition,change:change?{...change}:null,
        counts:[...count].map(([value,amount])=>({value,amount})),frequencies:[...freq].sort((a,b)=>a[0]-b[0]).map(([frequency,amount])=>({frequency,amount})),
        maxFreq:maxFreq??null,answer:answer??null,length:length??0,x:x??null,old:old??null,checks:{...checks},history:history.map(item=>({...item})),locals:values,final:line===23},
    });
  }
  countReady=true;emit(6,'init');freqReady=true;emit(7,'init');maxFreq=0;emit(8,'init');answer=0;emit(9,'init');
  for(let index=0;index<nums.length;index++){
    length=index+1;x=nums[index];checks={once:null,single:null,tallest:null};emit(10,'read');
    old=get(count,x);emit(11,'old');emit(12,'old-check',old>0);
    if(old>0){const before=get(freq,old);freq.set(old,before-1);emit(13,'leave',null,{name:`freq[${old}]`,before,added:-1,after:before-1});}
    count.set(x,old+1);emit(14,'count',null,{name:`count[${x}]`,before:old,added:1,after:old+1});
    const before=get(freq,old+1);freq.set(old+1,before+1);emit(15,'enter',null,{name:`freq[${old+1}]`,before,added:1,after:before+1});
    const previousMax=maxFreq;maxFreq=Math.max(maxFreq,get(count,x));emit(16,'max',null,{name:'max_freq',before:previousMax,after:maxFreq});
    allOnce=maxFreq===1;checks.once=allOnce;emit(18,'once',allOnce);
    dropSingle=get(freq,1)===1&&get(freq,maxFreq)*maxFreq+1===length;checks.single=dropSingle;emit(19,'single',dropSingle);
    trimTallest=get(freq,maxFreq)===1&&get(freq,maxFreq-1)*(maxFreq-1)+maxFreq===length;checks.tallest=trimTallest;emit(20,'tallest',trimTallest);
    const valid=allOnce||dropSingle||trimTallest;
    let remove=null;
    if(valid)remove=allOnce?[...count.keys()][0]:[...count].find(([,amount])=>amount===(dropSingle?1:maxFreq))[0];
    const record={length,valid,remove,once:allOnce,single:dropSingle,tallest:trimTallest,step:steps.length,counted:false};history.push(record);emit(21,'check',valid);
    if(valid){const before=answer;answer=length;record.counted=true;record.answerStep=steps.length;emit(22,'answer',null,{name:'answer',before,after:answer});}
  }
  emit(10,'end',false);emit(23,'done');return{original:nums,answer,steps};
}
module.exports={1224:{
  id:1224,slug:'maximum-equal-frequency',difficulty:'hard',category:{key:'hashmap',vi:'Hash Map',en:'Hash Map'},
  tags:[{key:'array',vi:'Mảng',en:'Array'},{key:'counting',vi:'Đếm',en:'Counting'}],
  title:bi('Maximum Equal Frequency','Maximum Equal Frequency'),titleVi:bi('Prefix dài nhất có thể cân bằng tần suất','Longest prefix whose frequencies can be equalized'),
  statement:bi('Tìm prefix dài nhất sao cho xoá đúng một phần tử thì mọi giá trị còn lại có tần suất bằng nhau. Xoá hết phần tử duy nhất cũng hợp lệ.','Find the longest prefix where removing exactly one element leaves all remaining values with equal frequencies. Removing the only element is valid too.'),
  inputKind:'string',inputLabel:bi('nums · 1–20 số nguyên 1…100000','nums · 1–20 integers in 1…100000'),defaultInput:'2,2,1,1,5,3,3,5',extraParams:[],debugMode:'line-by-line',code:CODE,builder,
  approach:[bi('count[x]: số ô trong cột x. freq[f]: số cột cao f. Thử ba dạng có thể cân bằng sau đúng một lần xoá.','count[x]: cells in column x. freq[f]: columns of height f. Test three shapes that can be equalized by one deletion.')],
  complexity:{time:'O(n)',space:'O(n)',note:bi('Mỗi số cập nhật hai bảng đếm. Minh hoạ tối đa 20 phần tử.','Each value updates two count tables. Visualization up to 20 elements.')},
  liveArgs:input=>[parse(input,100000)],
}};
