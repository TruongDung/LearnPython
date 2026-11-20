'use strict';
const bi=(vi,en)=>({vi,en}),copy=mat=>mat.map(row=>[...row]);
const CODE=[
  'class Solution:',
  '    def matrixReshape(self, mat, r, c):',
  '        m, n = len(mat), len(mat[0])',
  '        if m * n != r * c:',
  '            return mat',
  '        result = []',
  '        for row in range(r):',
  '            result.append([0] * c)',
  '        for index in range(m * n):',
  '            src_r, src_c = divmod(index, n)',
  '            dst_r, dst_c = divmod(index, c)',
  '            result[dst_r][dst_c] = mat[src_r][src_c]',
  '        return result',
];
function parse(input,params={}){
  let mat;
  try{if(typeof input!=='string'||!input.trim())throw new Error();const text=input.trim();mat=text.startsWith('[')?JSON.parse(text):text.split(/[;|\n]/).map(row=>row.split(',').map(value=>{if(!value.trim())throw new Error();return Number(value.trim());}));}catch{throw new Error('566: mat cần ma trận JSON hoặc các hàng cách bằng ;. / Use a JSON matrix or semicolon-separated rows.');}
  if(!Array.isArray(mat)||mat.length<1||mat.length>100||!Array.isArray(mat[0])||mat[0].length<1||mat[0].length>100||mat.some(row=>!Array.isArray(row)||row.length!==mat[0].length||row.some(x=>!Number.isInteger(x)||x< -1000||x>1000)))throw new Error('566: cần ma trận 1..100 hàng/cột, số nguyên −1000..1000. / Use a rectangular 1..100 matrix of integers in −1000..1000.');
  const values={r:params.r??1,c:params.c??4},dimensions={};
  for(const key of ['r','c']){const raw=values[key],value=Number(raw);if(params[key]===null||typeof raw!=='number'&&typeof raw!=='string'||typeof raw==='string'&&!raw.trim()||!Number.isInteger(value)||value<1||value>300)throw new Error(`566: ${key} phải là số nguyên 1..300. / ${key} must be an integer in 1..300.`);dimensions[key]=value;}
  return{mat:copy(mat),...dimensions};
}
function buildSteps(input,params={}){
  const {mat,r,c}=parse(input,params),m=mat.length,n=mat[0].length,size=m*n,targetSize=r*c,valid=size===targetSize,original=copy(mat),full=size<=36,steps=[];
  const py={mat,r,c,m:null,n:null,result:null,row:null,index:null,src_r:null,src_c:null,dst_r:null,dst_c:null};let count=0,cursor=0,ordinal=0,previousOrdinal=0;
  function emit(line,pending=null,final=false,record=true){
    ordinal++;if(!record)return;const skippedBefore=ordinal-previousOrdinal-1;previousOrdinal=ordinal;
    steps.push({title:bi(`Dòng ${line} · ${final?valid?'Đổi khuôn hoàn tất':'Giữ bảng gốc':line===4?'So số ô':line===8?'Tạo một hàng':line===12?'Chép một ô':'Giữ thứ tự, đổi tọa độ'}`,`Line ${line} · ${final?valid?'Reshape complete':'Keep original':line===4?'Compare cell counts':line===8?'Allocate a row':line===12?'Copy one cell':'Same order, new coordinates'}`),note:bi('',''),arr:[],highlight:[],mark:[],vars:[],codeBlock:1,codeLines:[line],debugLine:line,final,
      reshape566View:{m,n,r,c,size,targetSize,valid,original,line,source:CODE[line-1],timing:'before',pythonLocals:JSON.parse(JSON.stringify(py)),pending,count,cursor,trace:{full,ordinal,skippedBefore},final}});
  }
  emit(3);py.m=m;py.n=n;emit(4,{kind:'guard',sourceSize:size,targetSize,condition:!valid});
  if(!valid){emit(5,{kind:'return-original'},true);return{original,answer:original,steps};}
  emit(6);py.result=[];emit(7);
  for(let row=0;row<r;row++){py.row=row;const keep=full||row<2||row>=r-2;emit(8,{kind:'allocate',row,cols:c},false,keep);py.result.push(Array(c).fill(0));emit(7,null,false,keep);}
  emit(9);
  for(let index=0;index<size;index++){
    py.index=index;cursor=index;const keep=full||index<2||index>=size-2;
    emit(10,{kind:'source',index,row:Math.floor(index/n),col:index%n},false,keep);py.src_r=Math.floor(index/n);py.src_c=index%n;
    emit(11,{kind:'target',index,row:Math.floor(index/c),col:index%c},false,keep);py.dst_r=Math.floor(index/c);py.dst_c=index%c;
    emit(12,{kind:'write',index,source:[py.src_r,py.src_c],target:[py.dst_r,py.dst_c],value:mat[py.src_r][py.src_c]},false,keep);py.result[py.dst_r][py.dst_c]=mat[py.src_r][py.src_c];count++;emit(9,null,false,keep);
  }
  emit(13,null,true);return{original,answer:copy(py.result),steps};
}
module.exports={566:{id:566,difficulty:'easy',slug:'reshape-the-matrix',category:{key:'array',vi:'Mảng',en:'Array'},tags:[{key:'2d-array',vi:'Mảng 2D',en:'2D Array'}],title:bi('Reshape the Matrix','Reshape the Matrix'),titleVi:bi('Đổi khuôn · giữ nguyên thứ tự','New shape · same order'),
  statement:bi('Xếp lại mat thành r hàng × c cột, giữ thứ tự đọc từng hàng. Nếu số ô khác nhau, trả lại mat ban đầu.','Reshape mat into r rows × c columns, keeping row-by-row reading order. If cell counts differ, return the original mat.'),defaultInput:'1,2;3,4',inputKind:'string',inputLabel:bi('mat · JSON hoặc hàng cách bằng ;','mat · JSON or semicolon-separated rows'),
  extraParams:[{key:'r',label:bi('Số hàng mới r','New rows r'),default:1,min:1,max:300},{key:'c',label:bi('Số cột mới c','New columns c'),default:4,min:1,max:300}],code:CODE,debugMode:'line',builder:buildSteps,liveArgs:(input,params)=>{const {mat,r,c}=parse(input,params);return[mat,r,c];},
  approach:[bi('Số ô phải bằng nhau: m×n = r×c.','Cell counts must match: m×n = r×c.'),bi('Ô thứ i giữ nguyên thứ tự; tọa độ đổi từ divmod(i,n) sang divmod(i,c).','Cell i keeps its order; coordinates change from divmod(i,n) to divmod(i,c).')],
  complexity:{time:'O(m · n)',space:'O(m · n)',note:bi('Không đổi được: O(1), trả lại mat. ≤36 ô: debug mọi dòng; bảng lớn tính đủ, gộp vòng lặp giữa và báo số dòng đã gộp.','Invalid reshape: O(1), return mat. ≤36 cells: every line; larger grids are fully computed with explicit summaries of middle iterations.')},
}};
