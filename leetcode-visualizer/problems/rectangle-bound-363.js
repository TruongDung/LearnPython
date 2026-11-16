'use strict';
const {runTrace}=require('./wasm-picture-trace'),base=require('./array')[363],bi=(vi,en)=>({vi,en});
const CODE=`import bisect

class Solution:
    def maxSumSubmatrix(self, matrix, k):
        rows, cols = len(matrix), len(matrix[0])
        best = float('-inf')
        rectangle = None
        for top in range(rows):
            col_sums = [0] * cols
            for bottom in range(top, rows):
                for col in range(cols):
                    col_sums[col] += matrix[bottom][col]
                prefixes = [(0, -1)]
                prefix = 0
                for right in range(cols):
                    prefix += col_sums[right]
                    threshold = prefix - k
                    pos = bisect.bisect_left(prefixes, (threshold, -1))
                    if pos < len(prefixes):
                        previous, left_index = prefixes[pos]
                        candidate = prefix - previous
                        if candidate > best:
                            best = candidate
                            rectangle = (top, left_index + 1, bottom, right)
                    bisect.insort(prefixes, (prefix, right))
        return best`.split('\n');
function argsFor(input,params={}){
 let grid=input;try{if(typeof grid==='string')grid=grid.trim().startsWith('[')?JSON.parse(grid):grid.trim().split(/[;|\n]/).map(row=>row.split(',').map(value=>value.trim()?Number(value):NaN));}catch{grid=null;}
 if(!Array.isArray(grid)||!grid.length||grid.length>6||grid.some(row=>!Array.isArray(row)||!row.length||row.length>6||row.length!==grid[0].length||row.some(n=>!Number.isSafeInteger(n)||n< -100||n>100)))throw Error('363: dùng grid chữ nhật 1–6 × 1–6, số nguyên −100…100 / use an integer grid up to 6×6.');
 const raw=params.k??2,k=typeof raw==='number'||typeof raw==='string'&&raw.trim()?Number(raw):NaN;
 if(!Number.isSafeInteger(k)||Math.abs(k)>100000)throw Error('363: k phải là số nguyên −100000…100000 / use an integer k.');
 return [grid.map(row=>[...row]),k];
}
function builder(input,params={}){
 const [grid,k]=argsFor(input,params),trace=runTrace({code:CODE.join('\n'),method:'maxSumSubmatrix',args:[grid,k]});
 if(trace.answer==='−∞')throw Error('363: không có hình chữ nhật nào có tổng ≤ k / no rectangle has sum ≤ k.');
 let queried=false,read=false,candidateReady=false,thresholdReady=false,searchPrefixes=null,band=null,bandReady=false;
 const steps=trace.events.map((e,index)=>{
  const x=e.locals,line=e.line,text=CODE[line-1].trim(),final=index===trace.events.length-1;let phase='inspect';
  if(text==='for top in range(rows):'){band=null;bandReady=false;}
  if(text==='for bottom in range(top, rows):'){band= e.branch?[x.top,x.bottom]:null;bandReady=false;}
  if(text==='col_sums = [0] * cols')phase='start-band';
  if(text.startsWith('col_sums[col] +='))phase='compress';
  if(text==='prefixes = [(0, -1)]'){phase='band-ready';bandReady=true;}
  if(text==='for right in range(cols):'){queried=false;read=false;candidateReady=false;thresholdReady=false;searchPrefixes=null;}
  if(text==='prefix += col_sums[right]')phase='prefix';
  if(text==='threshold = prefix - k'){thresholdReady=true;phase='threshold';}
  if(text.startsWith('pos = ')){queried=true;searchPrefixes=x.prefixes.map(pair=>[...pair]);phase='search';}
  if(text==='previous, left_index = prefixes[pos]'){read=true;phase='read';}
  if(text==='candidate = prefix - previous'){candidateReady=true;phase='candidate';}
  if(text.startsWith('rectangle = ('))phase='new-best';
  if(text.startsWith('bisect.insort'))phase='store';
  if(final)phase='result';
  const candidate=read?[x.top,x.left_index+1,x.bottom,x.right]:null;
  const view={id:363,grid,k,line,source:text,phase,band,bandReady,top:x.top??null,bottom:x.bottom??null,col:phase==='compress'?x.col:null,colSums:x.col_sums??null,
   right:x.right??null,prefix:x.prefix??null,threshold:thresholdReady?x.threshold:null,queried,position:queried?x.pos:null,searchPrefixes,prefixes:x.prefixes??[],
   selected:read?[x.previous,x.left_index]:null,candidate,candidateSum:candidateReady?x.candidate:null,best:x.best??null,rectangle:x.rectangle??null,
   final,answer:final?trace.answer:null,trace:trace.trace};
  return {arr:[],codeLines:[line],title:bi(text,text),note:bi('',''),vars:['top','bottom','col','right','prefix','threshold','pos','previous','left_index','candidate','best'].filter(name=>x[name]!==undefined).map(name=>({name,value:x[name]})),final,rectangleBound363View:view};
 });return {original:grid,answer:trace.answer,steps};
}
module.exports={363:{...base,code:CODE,builder,debugMode:'line-by-line',inputLabel:bi('matrix · JSON hoặc hàng cách ; · tối đa 6×6','matrix · JSON or semicolon rows · up to 6×6'),extraParams:[{key:'k',type:'number',default:2,min:-100000,max:100000,allowNegative:true,label:bi('k · tổng không vượt quá','k · maximum allowed sum')}],liveArgs:argsFor,
 statement:bi('Chọn hình chữ nhật có tổng không vượt k. Trong các hình hợp lệ, lấy tổng lớn nhất.','Choose a rectangle whose sum is at most k. Among valid rectangles, maximize the sum.'),
 approach:[bi('Cố định hai hàng top/bottom → nén thành col_sums. Mỗi đoạn liên tiếp của mảng nén là một hình chữ nhật.','Fix top/bottom rows → compress into col_sums. Every contiguous segment of this array is a rectangle.'),bi('prefix − previous ≤ k ⇔ previous ≥ prefix − k. Tìm prefix trước nhỏ nhất đạt ngưỡng để tổng hình lớn nhất.','prefix − previous ≤ k iff previous ≥ prefix − k. Find the smallest qualifying earlier prefix to maximize the rectangle sum.')],
 complexity:{time:'O(rows² × cols²)',space:'O(cols)',note:bi('Mã dùng list Python: bisect tìm O(log cols), nhưng insort chèn O(cols). Nếu thay bằng cây có thứ tự cân bằng, phần tìm/chèn còn O(log cols), tổng O(rows² × cols log cols).','This code uses a Python list: bisect searches in O(log cols), but insort takes O(cols). A balanced ordered structure reduces lookup/insertion to O(log cols), giving O(rows² × cols log cols).')}}};
