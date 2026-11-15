'use strict';
const {runTrace}=require('./wasm-picture-trace'),bi=(vi,en)=>({vi,en});
const CODES={2501:`class Solution:
    def longestSquareStreak(self, nums):
        values = set(nums)
        best = 0
        for start in sorted(values):
            x = start
            length = 0
            while x in values:
                length += 1
                x *= x
            best = max(best, length)
        return best if best >= 2 else -1`,398:`import random

class Solution:
    def __init__(self, nums):
        self.nums = nums

    def pick(self, target):
        chosen = -1
        count = 0
        for i, value in enumerate(self.nums):
            if value == target:
                count += 1
                roll = random.randrange(count)
                if roll == 0:
                    chosen = i
        return chosen`,710:`import random

class Solution:
    def __init__(self, n, blacklist):
        self.bound = n - len(blacklist)
        self.mapping = {}
        blocked = set(blacklist)
        high = self.bound
        for low in blacklist:
            if low < self.bound:
                while high in blocked:
                    high += 1
                self.mapping[low] = high
                high += 1

    def pick(self):
        roll = random.randrange(self.bound)
        return self.mapping.get(roll, roll)`,497:`import random
from bisect import bisect_right

class Solution:
    def __init__(self, rects):
        self.rects = rects
        self.prefix = []
        self.total = 0
        for x1, y1, x2, y2 in rects:
            self.total += (x2 - x1 + 1) * (y2 - y1 + 1)
            self.prefix.append(self.total)

    def pick(self):
        ticket = random.randrange(self.total)
        index = bisect_right(self.prefix, ticket)
        before = self.prefix[index - 1] if index else 0
        offset = ticket - before
        x1, y1, x2, y2 = self.rects[index]
        width = x2 - x1 + 1
        return [x1 + offset % width, y1 + offset // width]`};
for(const id of Object.keys(CODES))CODES[id]=CODES[id].split('\n');
function array(input,id,empty=false){let a=input;try{if(typeof input==='string'){const s=input.trim();a=!s&&empty?[]:s.startsWith('[')?JSON.parse(s):s.split(',').map(x=>x.trim()?Number(x):NaN);}}catch{a=null;}if(!Array.isArray(a)||!empty&&!a.length||a.length>24||a.some(x=>!Number.isSafeInteger(x)))throw Error(`${id}: use ${empty?'0':'1'}–24 integers.`);return [...a];}
function parse(id,input,params={}){
 const draws=Number(params.draws??4),seed=Number(params.seed??Math.floor(Math.random()*1000001));if(id!==2501&&(!Number.isInteger(draws)||draws<1||draws>8||!Number.isSafeInteger(seed)||seed<0||seed>1000000))throw Error(`${id}: use 1–8 draws and a non-negative integer seed up to 1000000.`);
 if(id===2501){const nums=array(input,id);if(nums.length<2||nums.some(x=>x<2||x>100000))throw Error('2501: use 2–24 numbers in 2…100000.');return {nums,args:[nums]};}
 if(id===398){const nums=array(input,id),target=Number(params.target??3);if(!nums.includes(target)||nums.some(x=>x< -2147483648||x>2147483647))throw Error('398: target must occur in nums; values must fit int32.');return {nums,target,draws,seed,constructorArgs:[nums],args:[target]};}
 if(id===710){const blacklist=array(input,id,true),n=Number(params.n??7);if(!Number.isInteger(n)||n<1||n>24||blacklist.length>=n||new Set(blacklist).size!==blacklist.length||blacklist.some(x=>x<0||x>=n))throw Error('710: n must be in 1…24; blacklist must contain distinct values in 0…n−1 and leave at least one allowed number.');return {blacklist,n,draws,seed,constructorArgs:[n,blacklist],args:[]};}
 let rects=input;try{if(typeof input==='string')rects=JSON.parse(input);}catch{rects=null;}
 if(!Array.isArray(rects)||!rects.length||rects.length>4||rects.some(r=>!Array.isArray(r)||r.length!==4||r.some(x=>!Number.isInteger(x)||x< -8||x>8)||r[0]>=r[2]||r[1]>=r[3]))throw Error('497: use JSON with 1–4 rectangles [x1,y1,x2,y2], coordinates in −8…8, x1<x2 and y1<y2.');
 const points=new Set();for(const [x1,y1,x2,y2]of rects)for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++){const key=`${x}:${y}`;if(points.has(key))throw Error('497: rectangles must not share any integer point.');points.add(key);}if(points.size>120)throw Error('497: use at most 120 integer points for the visualization.');
 return {rects:rects.map(r=>[...r]),draws,seed,constructorArgs:[rects],args:[]};
}
function squareChains(nums){const values=new Set(nums),chains=[];for(const start of [...values].sort((a,b)=>a-b)){const path=[];let x=start;while(values.has(x)){path.push(x);x*=x;}chains.push({start,path,missing:x});}return chains;}
function build(id,input,params={}){
 const p=parse(id,input,params),code=CODES[id],payload={code:code.join('\n'),method:id===2501?'longestSquareStreak':'pick',args:p.args};
 if(id!==2501)Object.assign(payload,{constructorArgs:p.constructorArgs,calls:Array.from({length:p.draws},()=>({args:p.args})),randomSeed:p.seed,stateClasses:['Solution']});
 const native=runTrace(payload),samples=[],chains=id===2501?squareChains(p.nums):[];let operation=0,chain=[];
 const steps=native.events.map((e,index)=>{const x=e.locals,line=e.line,final=index===native.events.length-1,self=x.self??{},isPick=e.scope==='pick';
  if(isPick&&e.returning){samples.push({value:e.returned,roll:x.roll??x.ticket??null,index:x.index??null,step:index});operation++;}
  if(id===2501){if(line===6)chain=[];if(line===9)chain.push(x.x);}
  const mapping=Object.fromEntries(self.mapping?.__pairs__??[]),view={id,...p,constructorArgs:undefined,args:undefined,source:code[line-1].trim(),line,scope:e.scope,locals:x,self,mapping,operation:isPick?e.returning?operation:operation+1:0,samples:structuredClone(samples),chain:[...chain],chains:final?chains:[],phase:id===2501?'square':isPick?'pick':'build',branch:e.branch,trace:native.trace,answer:final?native.answer:null,final};
  return {arr:[],codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:Object.entries(x).filter(([name,value])=>name!=='self'&&['string','number','boolean'].includes(typeof value)).map(([name,value])=>({name,value})),randomSquarePictureView:view};
 });return {original:p.nums??p.blacklist??p.rects,answer:native.answer,steps};
}
function problem(id,title,vi,difficulty,input,inputKind,params,statement,complexity){return {id,title:bi(title,title),titleVi:bi(vi,title),difficulty,category:{key:'math',vi:'Toán & xác suất',en:'Math & probability'},defaultInput:input,inputKind,extraParams:params,statement,complexity,code:CODES[id],debugMode:'line-by-line',builder:(input,params)=>build(id,input,params),...(id===2501?{liveArgs:(input,params)=>parse(id,input,params).args}:{prepareLiveDesign:(input,params)=>{const p=parse(id,input,params);return {className:'Solution',constructorArgs:p.constructorArgs,operations:Array.from({length:p.draws},()=>({name:'pick',args:p.args}))};}})};}
const drawParam={key:'draws',default:4,min:1,max:8,label:bi('Số lượt bốc (1–8)','Number of draws (1–8)')};
module.exports={
 2501:problem(2501,'Longest Square Streak in an Array','Chuỗi bình phương dài nhất','medium',[4,3,6,16,8,2],'positive',[],bi('Chọn một dãy con có ít nhất 2 phần tử. Sau khi sắp tăng, mỗi số phải bằng bình phương số trước. Tìm độ dài lớn nhất, hoặc −1 nếu không có.','Choose a subsequence of at least two elements whose sorted values form a chain of squares. Return the maximum length, or −1 if none exists.'),{time:'O(n + u log u + u log log M)',space:'O(u)',note:bi('u là số giá trị khác nhau, M là giá trị lớn nhất.','u is the number of distinct values and M is the maximum value.')}),
 398:problem(398,'Random Pick Index','Bốc chỉ số ngẫu nhiên','medium',[1,2,3,3,3],'integer',[{key:'target',default:3,label:bi('target','target')},drawParam],bi('Mỗi lần pick(target), trả ngẫu nhiên một chỉ số chứa target. Các chỉ số hợp lệ phải có xác suất bằng nhau.','Each pick(target) returns a random index containing target, with equal probability for every matching index.'),{time:'O(n) per pick',space:'O(1) extra'}),
 710:{...problem(710,'Random Pick with Blacklist','Bốc số tránh blacklist','hard','2,3,5','string',[{key:'n',default:7,min:1,max:24,label:bi('n · dải 0…n−1','n · range 0…n−1')},drawParam],bi('Bốc đều một số trong 0…n−1 không thuộc blacklist. Ánh xạ vé bị cấm sang số hợp lệ ở phần cuối.','Pick uniformly from 0…n−1 excluding the blacklist. Remap blocked tickets to allowed values in the upper range.'),{time:'O(b) setup · O(1) per pick',space:'O(b)'}),allowEmptyInput:true,inputLabel:bi('blacklist · có thể để trống','blacklist · may be empty')},
 497:problem(497,'Random Point in Non-overlapping Rectangles','Bốc điểm nguyên trong các hình chữ nhật','medium','[[-2,-2,1,1],[2,2,4,6]]','string',[drawParam],bi('Bốc đều một điểm có tọa độ nguyên trong các hình chữ nhật không chồng nhau. Tính cả điểm trên biên.','Pick an integer point uniformly from non-overlapping rectangles, including boundary points.'),{time:'O(r) setup · O(log r) per pick',space:'O(r)'})
};
const slugs={2501:'longest-square-streak-in-an-array',398:'random-pick-index',710:'random-pick-with-blacklist',497:'random-point-in-non-overlapping-rectangles'};
for(const [id,p]of Object.entries(module.exports))p.slug=slugs[id];
