'use strict';
const base=require('./sparse-vector')[1570],{runTrace}=require('./wasm-picture-trace'),bi=(vi,en)=>({vi,en});
const driver=`

# Example caller
class Solution:
    def run(self, nums1, nums2):
        left = SparseVector(nums1)
        right = SparseVector(nums2)
        return left.dotProduct(right)`;
const codes=Array.from({length:5},(_,i)=>[...base[`code${i?i+1:''}`],...driver.split('\n')]);
function parse(input){const vectors=base.parseSparseVectors(input);if(vectors.flat().some(v=>Math.abs(v)>1e6))throw new RangeError('1570: Use values −1000000…1000000 in the visual demo.');return vectors;}
function entries(state,method){if(method===1)return(state.nums??[]).map((value,index)=>[index,value]);if(method===2||method===3)return(state[method===2?'nums':'values']?.__pairs__??[]).map(p=>[...p]);return(state.pairs??[]).map(p=>[...p]);}
function build(input,params={},method=1){
 const dense=parse(input),code=codes[method-1],trace=runTrace({code:code.join('\n'),method:'run',args:dense,stateClasses:['SparseVector'],objectClasses:['SparseVector']});
 const states=[{},{}],history=[];let chosen=null,total=null,product=null,rangeReady=false;
 const steps=trace.events.map((r,index)=>{const x=r.locals,root=r.outer,source=code[r.line-1].trim(),final=index===trace.events.length-1;let event='step',buildSide=null,buildIndex=null,active=[null,null];
  if(r.scope==='__init__'){
   buildSide=Object.hasOwn(root,'left')?1:0;if(x.self)states[buildSide]=x.self;buildIndex=x.index??x.i??null;
   if(source.startsWith('if ')&&source.includes('!= 0'))event=r.branch?'nonzero':'zero';
   if(source.startsWith('self.')&&source.includes(' = ')||source.includes('self.pairs.append('))event='store';
  }
  if(r.scope==='dotProduct'){
   if(x.self)states[0]=x.self;
   if(source==='smaller, larger = self.values, other.values')chosen=0;
   if(source==='smaller, larger = other.values, self.values')chosen=1;
   if(source.startsWith('for ')&&r.branch){product=null;if(method===5)rangeReady=false;event='probe';}
   if(source==='left, right = 0, len(vec.pairs) - 1')rangeReady=true;
   const storage=states.map(s=>entries(s,method));
   if(method===1||method===2)active=[x.i??null,x.i??null];
   if(method===3)active=[x.index??null,x.index??null];
   if(method===4)active=[storage[0][x.left]?.[0]??null,storage[1][x.right]?.[0]??null];
   if(method===5)active=[x.i??null,rangeReady?storage[1][x.mid]?.[0]??null:null];
   if(source.startsWith('result +=')||source.startsWith('total +=')){
    const a=method===4?x.left_index:method===3?x.index:x.i,b=method===4?x.right_index:method===5?x.other_i:a;
    product={a,b,left:dense[0][a],right:dense[1][b],value:dense[0][a]*dense[1][b],after:x.total??x.result,step:index};history.push({...product});event='add';
   }
   if(source==='left += 1'||source==='right += 1'||source==='left = mid + 1'||source==='right = mid - 1'){product=null;event='move';}
   if(x.total!==undefined||x.result!==undefined)total=x.total??x.result;
   if((source==='if i in vec.nums:'||source==='if counterpart is not None:')&&!r.branch)event='miss';
  }
  if(final)event='return';
  const view={id:1570,method,line:r.line,source,scope:r.scope,event,dense:dense.map(a=>[...a]),storage:states.map(s=>entries(s,method)),buildSide,buildIndex,active,chosen,product:product?{...product}:null,total,history:history.map(h=>({...h})),range:method===5&&r.scope==='dotProduct'&&rangeReady?[x.left,x.right,x.mid??null]:null,answer:final?trace.answer:null,final};
  return{arr:[],codeBlock:method,codeLines:[r.line],final,title:bi(`Dòng ${r.line} · ${r.scope}`,`Line ${r.line} · ${r.scope}`),note:bi('',''),vars:['i','num','index','value','counterpart','left','right','mid','left_index','right_index','other_i','result','total'].map(name=>({name,value:x[name]??'—'})),numericPicture:view};
 });return{original:dense.map(a=>[...a]),answer:trace.answer,steps};
}
const problem={...base,statement:bi('Chỉ các chỉ số xuất hiện ở cả hai vector mới đóng góp vào tích vô hướng.','Only indices shared by both vectors contribute to the dot product.'),inputLabel:bi('A | B · cùng độ dài · 1–24 số/vector · giá trị ±10⁶','A | B · equal length · 1–24 entries/vector · values ±10⁶'),approach:[bi('Giữ phần tử khác 0 → so chỉ số → nhân và cộng khi trùng chỉ số.','Keep nonzero entries → match indices → multiply and add.')],liveArgs:input=>parse(input)};
['O(N)','O(L₁) average','O(min(L₁,L₂)) average','O(L₁ + L₂)','O(L₁ log L₂)'].forEach((time,i)=>{problem[`complexity${i?i+1:''}`]={time,space:i?'O(L₁ + L₂)':'O(N)',note:bi('L₁, L₂: số phần tử khác 0. Khởi tạo: O(N) mỗi vector.','L₁, L₂: nonzero counts. Construction: O(N) per vector.')};});
codes.forEach((code,i)=>{const suffix=i?i+1:'';problem[`code${suffix}`]=code;problem[`builder${suffix}`]=(input,params)=>build(input,params,i+1);});
module.exports={1570:problem};
