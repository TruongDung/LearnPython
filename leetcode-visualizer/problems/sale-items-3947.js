'use strict';
const {defineEasy}=require('./easy-lesson');
const source=`class Solution:
    def maximumSaleItems(self, items, budget):
        n = len(items)
        max_factor = max(factor for factor, _ in items)
        freq = [0] * (max_factor + 1)
        for factor, price in items:
            freq[factor] += 1
        multiples = [0] * (max_factor + 1)
        for d in range(1, max_factor + 1):
            for m in range(d, max_factor + 1, d):
                multiples[d] += freq[m]
        boosted = []
        for index, (factor, price) in enumerate(items):
            limit = multiples[factor] - 1
            boosted.append((price, limit, index))
        boosted.sort()
        cheapest = min(price for _, price in items)
        total = 0
        for price, limit, index in boosted:
            if price >= 2 * cheapest:
                break
            take = min(limit, budget // price)
            total += 2 * take
            budget -= take * price
            if take < limit:
                break
        extra = budget // cheapest
        total += extra
        budget -= extra * cheapest
        return total
`;
const bi=(vi,en)=>({vi,en});
const lesson=defineEasy(3947,'Maximum Number of Items From Sale II','greedy',[[[1,6],[2,4],[3,5]],19],5,source,
 'Một bản mua nhận tối đa một quà. Mỗi cặp loại chỉ dùng một lần; mua các lượt có quà rẻ trước rồi dùng tiền dư mua món rẻ nhất.',
 'O(n log n + M log M)','O(n + M)',{
  vi:'Số lượng món hàng tối đa từ đợt giảm giá II',engine:'wasm',method:'maximumSaleItems',names:['items','budget'],difficulty:'medium',maxArrayLength:24,
  guide:'One purchase earns at most one gift. Use each ordered pair once; buy cheaper gift-bearing slots first, then spend the remainder on the cheapest item.',
  focus:['freq','multiples','boosted','index','take','total','budget'],teachingMode:'guided',
  scene:{compact:true,debug:true,kind:'sale-pairs'},traceOptions:{maxEvents:5000},
  provenance:{origin:'Project implementation',license:'local',url:'https://leetcode.com/problems/maximum-number-of-items-from-sale-ii/',modifications:'Executable multiples sieve, sorted gift-bearing slots and budget updates, with original item identities retained for pictures.'}
 });
function argumentsFor(input,params={}){
 if(typeof input!=='string'||!input.trim()||input.length>4000)throw Error('Nhập factor,price;factor,price / Enter factor,price;factor,price.');
 const parts=input.split(';').map(part=>part.trim()).filter(Boolean);
 if(!parts.length)throw Error('Nhập ít nhất 1 loại hàng / Enter at least 1 item type.');
 if(parts.some(part=>!/^\s*\d+\s*,\s*\d+\s*$/.test(part)))throw Error('Mỗi món có dạng factor,price; phân cách bằng ; / Use factor,price pairs separated by ;.');
 const items=parts.map(part=>part.split(',').map(Number)),budget=Number(params.budget??19),n=items.length;
 if(n>24||!Number.isInteger(budget)||budget<1||budget>1e9||items.some(([f,p])=>!Number.isInteger(f)||f<1||f>n||!Number.isInteger(p)||p<1||p>1e9))throw Error('Dùng 1–24 loại, factor ∈ [1,n], price và budget ∈ [1,10⁹] / Use 1–24 types, factor ∈ [1,n], price and budget ∈ [1,10⁹].');
 return [items,budget];
}
const execute=lesson.builder,liveArgs=lesson.liveArgs;
lesson.builder=(input,params)=>{
 const args=argumentsFor(input,params),run=execute(JSON.stringify(args)),items=args[0],batches=[];
 let pending=false,offer=null;
 for(const step of run.steps){
  const v=step.catalogLessonView,x=v.locals,s=v.source.trim();
  if(s.startsWith('for price, limit, index'))offer=null;
  if(s.startsWith('take ='))offer={index:x.index,price:x.price,limit:x.limit,budget:x.budget,take:x.take};
  if(s==='total += 2 * take'&&x.take>0){
   const gifts=items.flatMap(([f],j)=>j!==x.index&&f%items[x.index][0]===0?[j]:[]).slice(0,x.take);
   batches.push({index:x.index,count:x.take,price:x.price,gifts});pending=true;
  }
  if(s==='total += extra'&&x.extra>0){
   batches.push({index:items.findIndex(([,p])=>p===x.cheapest),count:x.extra,price:x.cheapest,gifts:[]});pending=true;
  }
  if(s.startsWith('budget -='))pending=false;
  const phase=v.final?'result':v.line<8?'count':v.line<12?'gain':v.line<19?'sort':v.line<27?'shop':'regular';
  v.sale3947={phase,pending,offer:offer&&{...offer},batches:batches.map(batch=>({...batch,gifts:[...batch.gifts]}))};
 }
 return run;
};
lesson.defaultInput='1,6;2,4;3,5';
lesson.inputLabel=bi('items (factor,price; …)','items (factor,price; …)');
lesson.extraParams=[{key:'budget',label:bi('Ngân sách','Budget'),type:'number',min:1,max:1e9,default:19}];
lesson.liveArgs=(input,params)=>liveArgs(JSON.stringify(argumentsFor(input,params)));
lesson.statement=bi('Mỗi bản mua được tối đa một quà khác loại có hệ số là bội của hệ số món mua. Mỗi cặp có thứ tự (mua, quà) chỉ dùng một lần; quà không sinh thêm quà. Tối đa hóa số bản mua + quà trong ngân sách. Mô phỏng: 1–24 loại.', 'Each purchased copy earns at most one other item whose factor is divisible by the purchased factor. Each ordered (purchase, gift) pair is used once; gifts earn no further gifts. Maximize purchased copies plus gifts within budget. Visual limit: 1–24 types.');
lesson.liveEditorDisabled=true;lesson.sourceLanguage='python';
lesson.complexity.note=bi('M = max(factor) ≤ n; không tính lịch sử debug.','M = max(factor) ≤ n; excludes replay history.');
module.exports=lesson;
