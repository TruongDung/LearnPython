'use strict';
const base = require('./hashmap');
const {runTrace} = require('./wasm-picture-trace');
const bi = (vi,en) => ({vi,en});
const CODE = {
  3020: "from collections import Counter\n"+base[3020].code.join("\n"),
  205: base[205].code.join('\n'),
  217: `class Solution:
    def containsDuplicate(self, nums):
        seen = set()
        for i, num in enumerate(nums):
            if num in seen:
                return True
            seen.add(num)
        return False`,
  219: `class Solution:
    def containsNearbyDuplicate(self, nums, k):
        last = {}
        for i, num in enumerate(nums):
            if num in last:
                distance = i - last[num]
                if distance <= k:
                    return True
            last[num] = i
        return False`,
  383: `class Solution:
    def canConstruct(self, ransomNote, magazine):
        available = {}
        for index, ch in enumerate(magazine):
            available[ch] = available.get(ch, 0) + 1
        for i, ch in enumerate(ransomNote):
            if available.get(ch, 0) == 0:
                return False
            available[ch] -= 1
        return True`,
};
function numbers(input,id,live) {
  let nums=input;
  if(typeof input==='string')try{nums=input.trim().startsWith('[')?JSON.parse(input):input.split(',').map(x=>/^-?\d+$/.test(x.trim())?Number(x):NaN);}catch(_){nums=null;}
  const max=live?100000:24;
  if(!Array.isArray(nums)||!nums.length||nums.length>max||!Array.from(nums).every(n=>typeof n==='number'&&Number.isInteger(n)&&Math.abs(n)<=1e9&&(id!==3020||n>0)))throw new RangeError(`${id}: cần 1–${max} số nguyên trong [−10⁹,10⁹] / invalid nums.`);
  return [...nums];
}
function text(value,id,name,live) {
  const max=live?id===205?50000:100000:24,alphabet=id===205?/^[\x00-\x7f]+$/:/^[a-z]+$/;
  if(typeof value!=='string'||!value.length||value.length>max||!alphabet.test(value))throw new RangeError(`${id}: ${name} cần 1–${max} ${id===205?'ký tự ASCII':'chữ a–z'} / invalid ${name}.`);
  return value;
}
function argsFor(id,input,params={},live=false) {
  if(!params||typeof params!=='object'||Array.isArray(params))throw new TypeError(`${id}: invalid parameters.`);
  if(id===205)return[text(input,id,'s',live),text(params.t??'add',id,'t',live)];
  if(id===383)return[text(input,id,'ransomNote',live),text(params.magazine??'aab',id,'magazine',live)];
  const nums=numbers(input,id,live);
  if(id===217||id===3020)return[nums];
  const k=params.k??3;
  if(typeof k!=='number'||!Number.isInteger(k)||k<0||k>100000)throw new RangeError('219: cần 0 ≤ k ≤ 100000 / invalid k.');
  return[nums,k];
}
function build(id,input,params={}) {
  const args=argsFor(id,input,params),method={205:'isIsomorphic',217:'containsDuplicate',219:'containsNearbyDuplicate',383:'canConstruct',3020:'maximumLength'}[id],code=CODE[id].split('\n');
  const native=runTrace({code:CODE[id],method,args});
  if(native.trace.truncated)throw new Error(`${id}: incomplete Python trace.`);
  const forwardSteps=new Map(),reverseSteps=new Map(),saved=new Map();
  let comparison=null,conflict=null,processed=0,consumedCount=0,pairs=[],pattern=null,bestPattern=null,bestLength=0,exactCur=null;const gallery=[];
  const steps=native.events.map((event,index)=>{
    const x=event.locals,line=event.line,final=event.returning;let view;
    if(id===3020) {
      const freq=x.freq?.__pairs__??[];
      if(line===5){bestPattern=[args[0][0]];bestLength=1;}
      if(line===6&&event.branch){pairs=[];pattern=null;}
      if(line===12)exactCur=String(x.cur);
      if(line===14)pairs.push(x.cur);
      if(line===15)exactCur=String(BigInt(exactCur)**2n);
      if(line===9)pattern=Array(x.cnt-(x.cnt%2===0?1:0)).fill(1);
      if(line===16){const peak=freq.some(([n,count])=>n===x.cur&&count>0);pattern=peak?[...pairs,x.cur,...pairs.slice().reverse()]:[...pairs.slice(0,-1),pairs.at(-1),...pairs.slice(0,-1).reverse()];}
      if([9,17].includes(line)){gallery.push({values:[...pattern],step:index});if(pattern.length>bestLength){bestLength=pattern.length;bestPattern=[...pattern];}}
      const current=line>=12&&line<=17?exactCur:null;
      view={nums:[...args[0]],freq:freq.map(([value,count])=>({value,count})),base:x.x??null,current:line>=12&&line<=17?current:null,pairs:[...pairs],pattern:pattern?[...pattern]:null,bestPattern:bestPattern?[...bestPattern]:null,count:x.cnt??null,best:x.ans??null,gallery:gallery.slice(-6).map(e=>({...e,values:[...e.values]}))};
    }else if(id===205) {
      const active=line>=7&&line<=16&&!(line===7&&event.branch===false),paired=active&&line>=8;
      if(line===3&&event.branch)conflict='length';
      if(line===10){if(event.branch)conflict='source';else processed=x.i+1;}
      if(line===13&&event.branch)conflict='target';
      if(line===15)forwardSteps.set(x.char_s,index);
      if(line===16){reverseSteps.set(x.char_t,index);processed=x.i+1;}
      view={s:args[0],t:args[1],read:active?x.i:null,a:paired?x.char_s:null,b:paired?x.char_t:null,processed,conflict,
        forward:Object.entries(x.s_to_t??{}).map(([from,to])=>({from,to,step:forwardSteps.get(from)})),
        reverse:Object.entries(x.t_to_s??{}).map(([from,to])=>({from,to,step:reverseSteps.get(from)}))};
    }else if(id===383) {
      const building=line<=5,reading=line>=6&&line<=9&&!(line===6&&event.branch===false);
      if(line===9)consumedCount=x.i+1;
      const consumed=line===9,missing=[7,8].includes(line)&&(line===8||event.branch===true);
      view={note:args[0],magazine:args[1],building,readMagazine:line>=4&&line<=5&&!(line===4&&event.branch===false)?x.index:null,
        read:reading?x.i:null,char:building?line>=4&&!(line===4&&event.branch===false)?x.ch??null:null:reading?x.ch:null,available:Object.entries(x.available??{}).map(([char,count])=>({char,count})),
        used:consumedCount,consumed,missing};
    }else {
      const repeat=id===217,checkLine=5,writeLine=repeat?7:9,returnLine=repeat?6:8;
      if(line===4&&event.branch)comparison=null;
      if(line===checkLine&&event.branch===true)comparison={left:saved.get(x.num).index,right:x.i,value:x.num,distance:null,within:null};
      if(!repeat&&line===6)comparison.distance=x.distance;
      if(!repeat&&line===7)comparison.within=event.branch;
      if(repeat&&line===6)comparison.within=true;
      const old=saved.get(x.num),write=line===writeLine?{value:x.num,index:x.i,previous:old?.index??null}:null;
      if(write)saved.set(x.num,{value:x.num,index:x.i,step:index});
      const active=line>=4&&line<=(repeat?7:9)&&!(line===4&&event.branch===false),raw=repeat?x.seen??[]:(x.last?.__pairs__??[]).map(([n])=>n);
      view={nums:[...args[0]],k:repeat?null:args[1],read:active?x.i:null,current:active?x.num:null,
        memory:raw.map(n=>({...saved.get(n)})),write,comparison:comparison?{...comparison}:null,
        hit:repeat?[5,returnLine].includes(line)&&(line===returnLine||event.branch===true):[7,returnLine].includes(line)&&(line===returnLine||event.branch===true)};
    }
    return {title:bi(`Dòng ${line} · ${code[line-1].trim()}`,`Line ${line} · ${code[line-1].trim()}`),note:bi('',''),arr:[],highlight:[],mark:[],codeLines:[line],final,
      vars:Object.entries(x).map(([name,value])=>({name,value:id===3020&&name==='cur'&&!Number.isSafeInteger(value)?exactCur:value})),lessonPictureView:{id,line,source:code[line-1].trim(),scope:event.scope,condition:event.branch,final,value:final?native.answer:null,...view}};
  });
  return{original:args[0],answer:native.answer,steps};
}
const definitions={
  3020:{...base[3020],defaultInput:'2,2,4,4,16',inputLabel:bi('nums · 1–24 số nguyên dương ≤10⁹','nums · 1–24 positive integers ≤10⁹'),approach:[bi('Mỗi tầng ngoài cần hai bản sao; tầng giữa chỉ cần một. Bình phương để lên tầng kế, còn số 1 chỉ lấy số lượng lẻ lớn nhất.','Each outer level needs two copies; the center needs one. Square to reach the next level; for 1, take the largest odd count.')],complexity:{time:'O(n + d·log log M)',space:'O(d)',note:bi('d giá trị khác nhau; M ≤10⁹. Minh hoạ tối đa 24 số; live code hỗ trợ 100.000 số.','d distinct values; M ≤10⁹. Visualization: up to 24 values; live code accepts 100,000.')}},
  205:{...base[205],requireEqualLength:false,preserveInputWhitespace:true,inputLabel:bi('s · 1–24 ký tự ASCII, giữ nguyên khoảng trắng','s · 1–24 ASCII characters, whitespace preserved'),approach:[bi('Mỗi chữ trong s chỉ có một đích, mỗi chữ trong t chỉ có một nguồn. Kiểm tra cả hai chiều trước khi tạo cặp mới.','Each s character has one target; each t character has one source. Check both directions before adding a pair.')],complexity:{time:'O(n)',space:'O(1)',note:bi('Hai bảng ánh xạ giới hạn bởi bảng ký tự ASCII; live code hỗ trợ 50.000 ký tự.','Two maps bounded by the ASCII alphabet; live code accepts 50,000 characters.')}},
  217:{...base[217],defaultInput:'1,2,3,1',inputLabel:bi('nums · 1–24 số nguyên trong [−10⁹,10⁹]','nums · 1–24 integers in [−10⁹,10⁹]'),approach:[bi('Kiểm tra số đang đọc trong seen trước khi thêm. Gặp một số đã có là tìm được hai vị trí trùng nhau.','Check the current value in seen before adding it. A repeat identifies two distinct equal positions.')],complexity:{time:'O(n)',space:'O(n)',note:bi('Minh hoạ tối đa 24 số; live code hỗ trợ 100.000 số.','Visualization: up to 24 values; live code accepts 100,000.')}},
  219:{...base[219],defaultInput:'1,2,3,1',inputLabel:bi('nums · 1–24 số nguyên trong [−10⁹,10⁹]','nums · 1–24 integers in [−10⁹,10⁹]'),extraParams:[{key:'k',type:'number',default:3,min:0,max:100000,label:bi('k · khoảng cách tối đa','k · maximum distance')}],approach:[bi('last lưu vị trí gần nhất của mỗi số. Gặp lại thì đo khoảng cách; nếu quá k, cập nhật last để lần sau dùng vị trí mới hơn.','last stores each value’s latest position. Measure the gap on a repeat; if it exceeds k, update last for the next occurrence.')],complexity:{time:'O(n)',space:'O(n)',note:bi('Minh hoạ tối đa 24 số; live code hỗ trợ 100.000 số và k ≤ 100.000.','Visualization: up to 24 values; live code accepts 100,000 values and k ≤ 100,000.')}},
  383:{...base[383],inputLabel:bi('ransomNote · 1–24 chữ a–z','ransomNote · 1–24 lowercase letters'),extraParams:[{key:'magazine',type:'string',default:'aab',label:bi('magazine · 1–24 chữ a–z','magazine · 1–24 lowercase letters')}],approach:[bi('Đếm kho chữ magazine. Mỗi chữ trong ransomNote lấy đúng một bản; hết chữ cần lấy thì trả False.','Count the magazine inventory. Each ransomNote character consumes one copy; return False when a required letter runs out.')],complexity:{time:'O(m+n)',space:'O(1)',note:bi('Tối đa 26 bộ đếm; live code hỗ trợ mỗi chuỗi dài 100.000 chữ.','At most 26 counters; live code accepts 100,000 letters per string.')}},
};
for(const [key,p]of Object.entries(definitions)){const id=Number(key);Object.assign(p,{inputKind:'string',debugMode:'line-by-line',code:CODE[id].split('\n'),builder:(input,params)=>build(id,input,params),liveArgs:(input,params)=>argsFor(id,input,params,true)});}
module.exports=definitions;
