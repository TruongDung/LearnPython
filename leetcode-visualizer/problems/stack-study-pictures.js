"use strict";
const base=require('./monotonic-stack'),{runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en}),copy=v=>JSON.parse(JSON.stringify(v));
const STRENGTH_CODE=`class Solution:
    def totalStrength(self, strength):
        MOD = 10**9 + 7
        n = len(strength)
        left = [-1] * n
        stack = []
        for i, value in enumerate(strength):
            while stack and strength[stack[-1]] >= value:
                popped = stack.pop()
            left[i] = stack[-1] if stack else -1
            stack.append(i)
        right = [n] * n
        stack = []
        for i in range(n - 1, -1, -1):
            while stack and strength[stack[-1]] > strength[i]:
                popped = stack.pop()
            right[i] = stack[-1] if stack else n
            stack.append(i)
        prefix = [0]
        for value in strength:
            prefix.append(prefix[-1] + value)
        prefix2 = [0]
        for value in prefix:
            prefix2.append(prefix2[-1] + value)
        answer = 0
        for i, value in enumerate(strength):
            left_i = left[i]
            right_i = right[i]
            left_count = i - left_i
            right_count = right_i - i
            right_sums = (prefix2[right_i + 1] - prefix2[i + 1]) * left_count
            left_sums = (prefix2[i + 1] - prefix2[left_i + 1]) * right_count
            owned_sums = right_sums - left_sums
            contribution = value * owned_sums
            answer = (answer + contribution) % MOD
        return answer`.split('\n');
const REMOVAL_CODE=`class Solution:
    def totalSteps(self, nums):
        stack = []
        answer = 0
        for i, num in enumerate(nums):
            days = 0
            while stack and stack[-1][0] <= num:
                popped = stack.pop()
                days = max(days, popped[1])
            if stack:
                days += 1
            else:
                days = 0
            answer = max(answer, days)
            stack.append([num, days])
        return answer`.split('\n');
function parse(input,id){let values=input;try{if(typeof input==='string'){const s=input.trim();values=!s?[]:s.startsWith('[')?JSON.parse(s):s.split(',').map(t=>t.trim()?Number(t):NaN);}}catch{values=null;}const maxN=id===2281?7:14,maxValue=id===2281?1000000:1000000000;
 if(!Array.isArray(values)||!values.length)throw new RangeError('Use a non-empty integer array');
 if(values.length>maxN)throw new RangeError(`Use up to ${maxN} ${id===2281?'wizards':'numbers'} for a complete visual replay`);
 if(!Array.from(values).every(n=>Number.isInteger(n)&&n>=1&&n<=maxValue))throw new RangeError(`Each value must be between 1 and ${id===2281?'1,000,000':'1,000,000,000'}`);
 return [...values];
}
function ownedRanges(values,owner,prefix){if(!owner||owner.left===null||owner.right===null||!prefix)return [];const ranges=[];for(let s=owner.left+1;s<=owner.i;s++)for(let e=owner.i;e<owner.right;e++)ranges.push({start:s,end:e,sum:prefix[e+1]-prefix[s],owner:owner.i,total:values[owner.i]*(prefix[e+1]-prefix[s])});return ranges;}
function buildStrength(input){const values=parse(input,2281),trace=runTrace({code:STRENGTH_CODE.join('\n'),method:'totalStrength',args:[values]}),knownLeft=new Set(),knownRight=new Set(),ledger=[],contributions=values.map(()=>null);
 const rightLine=STRENGTH_CODE.indexOf('        right = [n] * n')+1,prefixLine=STRENGTH_CODE.indexOf('        prefix = [0]')+1,answerLine=STRENGTH_CODE.indexOf('        answer = 0')+1,contribLoop=STRENGTH_CODE.lastIndexOf('        for i, value in enumerate(strength):')+1;
 let phase='left',current=-1,comparison=null,popped=null,prefixIndex=-1,prefixArray=null,prefixRead=null,owner=null,previous=null;
 const steps=trace.events.map((r,step)=>{const x=r.locals,text=STRENGTH_CODE[r.line-1].trim(),nextPhase=r.returning?'done':r.line<rightLine?'left':r.line<prefixLine?'right':r.line<answerLine?'prefix':'contribution';let change=null,action='';
  if(nextPhase!==phase){phase=nextPhase;current=-1;comparison=null;popped=null;prefixIndex=-1;prefixArray=null;prefixRead=null;owner=null;}
  const mainLoop=text==='for i, value in enumerate(strength):'||text==='for i in range(n - 1, -1, -1):';
  if(mainLoop){current=r.branch?x.i:-1;comparison=null;popped=null;if(r.line===contribLoop)owner=r.branch?{i:x.i,left:null,right:null,leftCount:null,rightCount:null,rightSums:null,leftSums:null,ownedSums:null,contribution:null}:null;}
  if(text.startsWith('while stack and strength[')){popped=null;const top=x.stack.at(-1);comparison=top===undefined?null:{index:top,value:values[top],current:x.i,currentValue:values[x.i],op:phase==='left'?'≥':'>',pop:r.branch,line:r.line};if(comparison){const symbol=phase==='left'&&r.branch?'≥':comparison.value===comparison.currentValue?'=':comparison.value>comparison.currentValue?'>':'<';action=`${comparison.value} ${symbol} ${comparison.currentValue} → ${r.branch?'POP':'KEEP'}`;}}
  if(text==='popped = stack.pop()'){popped=x.popped;change={kind:'pop',index:x.popped};}
  if(text==='left[i] = stack[-1] if stack else -1'){knownLeft.add(x.i);change={kind:'left',index:x.i,value:x.left[x.i]};}
  if(text==='right[i] = stack[-1] if stack else n'){knownRight.add(x.i);change={kind:'right',index:x.i,value:x.right[x.i]};}
  if(text==='stack.append(i)')change={kind:'push',index:x.i};
  if(text==='prefix = [0]'){prefixArray='prefix';prefixIndex=0;prefixRead=null;current=-1;}
  if(text==='for value in strength:'){current=r.branch?x.prefix.length-1:-1;prefixRead=r.branch?{array:'strength',index:current}:null;}
  if(text==='for value in prefix:'){current=-1;prefixRead=r.branch?{array:'prefix',index:x.prefix2.length-1}:null;}
  if(text==='prefix2 = [0]'){prefixArray='prefix2';prefixIndex=0;prefixRead=null;current=-1;}
  if(text==='prefix.append(prefix[-1] + value)'||text==='prefix2.append(prefix2[-1] + value)'){const name=text.startsWith('prefix2')?'prefix2':'prefix',a=x[name];prefixArray=name;prefixIndex=a.length-1;current=name==='prefix'?prefixIndex-1:-1;change={kind:'prefix',name,index:prefixIndex,before:previous.locals[name].at(-1),addend:x.value,after:a.at(-1)};}
  if(owner){const fields={'left_i = left[i]':['left','left_i'],'right_i = right[i]':['right','right_i'],'left_count = i - left_i':['leftCount','left_count'],'right_count = right_i - i':['rightCount','right_count']};if(fields[text]){const[field,name]=fields[text];owner[field]=x[name];}if(text.startsWith('right_sums ='))owner.rightSums=x.right_sums;if(text.startsWith('left_sums ='))owner.leftSums=x.left_sums;if(text==='owned_sums = right_sums - left_sums')owner.ownedSums=x.owned_sums;if(text==='contribution = value * owned_sums'){owner.contribution=x.contribution;contributions[x.i]=x.contribution;change={kind:'contribution',index:x.i,value:x.contribution};}if(text==='answer = (answer + contribution) % MOD'){ledger.push({i:x.i,step,contribution:x.contribution,ownedSum:x.owned_sums,before:previous.locals.answer,answer:x.answer,left:x.left_i,right:x.right_i});change={kind:'answer',index:x.i,before:previous.locals.answer,after:x.answer};}}
  const view={id:2281,strength:values,phase,phaseIndex:['left','right','prefix','contribution','done'].indexOf(phase),current,comparison:copy(comparison),compared:comparison?.index??-1,popped:popped??-1,action,
   left:x.left??null,right:x.right??null,prefix:x.prefix??null,prefix2:x.prefix2??null,stack:x.stack??null,knownLeft:[...knownLeft],knownRight:[...knownRight],prefixIndex,prefixArray,prefixRead:copy(prefixRead),owner:copy(owner),ownedRanges:ownedRanges(values,owner,x.prefix),ledger:copy(ledger),contributions:[...contributions],total:x.answer??null,
   leftCount:owner?.leftCount??null,rightCount:owner?.rightCount??null,rightSums:owner?.rightSums??null,leftSums:owner?.leftSums??null,ownedSums:owner?.ownedSums??null,
   source:{line:r.line,text,timing:'after'},locals:x,outer:r.outer,scope:r.scope,frames:r.frames,branch:r.branch,returning:r.returning,returned:r.returned,trace:trace.trace,change,answer:r.returning?trace.answer:null};
  previous=view;return {arr:[],codeBlock:1,codeLines:[r.line],final:r.returning,title:bi(`L${r.line} · ${text}`,`L${r.line} · ${text}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),stackStudyView:view,totalStrength2281View:view};
 });return {original:values,answer:trace.answer,steps};
}
function buildRemoval(input){const values=parse(input,2289),trace=runTrace({code:REMOVAL_CODE.join('\n'),method:'totalSteps',args:[values]}),stackIds=[],death=values.map(()=>null),events=[];let current=null,comparison=null,removed=null,delay=null,gate=null,previous=null;
 const steps=trace.events.map((r,step)=>{const x=r.locals,text=REMOVAL_CODE[r.line-1].trim();let change=null;
  if(text==='for i, num in enumerate(nums):'){current=r.branch?x.i:null;comparison=null;removed=null;delay=null;gate=null;}
  if(text==='while stack and stack[-1][0] <= num:'){removed=null;const top=x.stack.at(-1);comparison=top?{index:stackIds.at(-1),value:top[0],days:top[1],num:x.num,pop:r.branch,line:r.line}:null;}
  if(text==='popped = stack.pop()'){const index=stackIds.pop();removed={index,value:x.popped[0],days:x.popped[1]};delay={before:x.days,popped:x.popped[1],after:null};change={kind:'pop',index};}
  if(text==='days = max(days, popped[1])'){delay.after=x.days;change={kind:'wait',before:delay.before,after:x.days};}
  if(text==='if stack:')gate=r.branch;
  if(text==='days += 1'||text==='days = 0'&&r.line>8){death[x.i]=x.days;events.push({i:x.i,days:x.days,step});change={kind:'day',index:x.i,value:x.days};}
  if(text==='answer = max(answer, days)')change={kind:'answer',before:previous.locals.answer,after:x.answer};
  if(text==='stack.append([num, days])'){stackIds.push(x.i);change={kind:'push',index:x.i};}
  const view={id:2289,nums:values,current,comparison:copy(comparison),removed:copy(removed),delay:copy(delay),gate,death:[...death],events:copy(events),stack:x.stack??null,stackIds:[...stackIds],source:{line:r.line,text,timing:'after'},locals:x,outer:r.outer,scope:r.scope,frames:r.frames,branch:r.branch,returning:r.returning,returned:r.returned,trace:trace.trace,change,answer:r.returning?trace.answer:null};
  previous=view;return {arr:[],codeBlock:1,codeLines:[r.line],final:r.returning,title:bi(`L${r.line} · ${text}`,`L${r.line} · ${text}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),stackStudyView:view};
 });return {original:values,answer:trace.answer,steps};
}
module.exports={2281:{...base[2281],code:STRENGTH_CODE,debugMode:'line-by-line',builder:buildStrength,inputLabel:bi('strength · 1–7 số, giá trị 1–1000000 · phát lại đầy đủ','strength · 1–7 values from 1–1000000 · complete replay'),
 statement:bi('Mỗi đoạn con đóng góp min × sum. Cộng mọi đoạn rồi lấy modulo 10⁹+7.','Each subarray contributes min × sum. Add every subarray modulo 10⁹+7.'),approach:[bi('Biên trái <, biên phải ≤ → mỗi đoạn thuộc một minimum. Hai lớp prefix cộng các tổng đoạn.','Previous < and next ≤ assign each subarray to one minimum. Two prefix layers sum its subarray totals.')],liveArgs:input=>[parse(input,2281)]},
2289:{...base[2289],code:REMOVAL_CODE,debugMode:'line-by-line',builder:buildRemoval,inputLabel:bi('nums · 1–14 số, giá trị 1–10⁹ · phát lại đầy đủ','nums · 1–14 values from 1–10⁹ · complete replay'),
 approach:[bi('Stack lưu [value, days]. Gộp thời gian của các phần tử bị pop; còn phần tử lớn hơn bên trái thì cộng 1, stack rỗng thì days = 0.','The stack stores [value, days]. Merge popped delays; add one if a larger left value remains, otherwise reset days to zero.')],liveArgs:input=>[parse(input,2289)]}};
