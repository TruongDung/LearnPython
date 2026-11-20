'use strict';
const bi=(vi,en)=>({vi,en}),copy=matrix=>matrix.map(row=>[...row]);
const CODE=[
  'class Solution:',
  '    def flipAndInvertImage(self, image):',
  '        for r in range(len(image)):',
  '            image[r].reverse()',
  '            for c in range(len(image[r])):',
  '                image[r][c] ^= 1',
  '        return image',
];
function parse(input){
  let image;
  try{if(typeof input!=='string'||!input.trim())throw new Error();const text=input.trim();image=text.startsWith('[')?JSON.parse(text):text.split(/[;|\n]/).map(row=>row.split(',').map(value=>{if(!value.trim())throw new Error();return Number(value.trim());}));}catch{throw new Error('832: image phải là ma trận JSON hoặc các hàng cách bằng ;. / Use a JSON matrix or semicolon-separated rows.');}
  if(!Array.isArray(image)||image.length<1||image.length>20||!Array.isArray(image[0])||image[0].length<1||image[0].length>20||image.some(row=>!Array.isArray(row)||row.length!==image[0].length||row.some(value=>value!==0&&value!==1)))throw new Error('832: cần ma trận 1..20 hàng/cột, mỗi ô là 0 hoặc 1. / Use a rectangular matrix of 1..20 rows/columns containing only 0 and 1.');
  return copy(image);
}
function buildSteps(input){
  const original=parse(input),image=copy(original),rows=image.length,cols=image[0].length,steps=[];
  const py={image,r:null,c:null};let doneCells=0,lastWrite=null;
  function emit(line,pending=null,final=false){
    const cursor=final?null:line===6?py.c:line===5&&lastWrite?.kind==='bit'&&lastWrite.row===py.r?lastWrite.col:null;
    steps.push({title:bi(`Dòng ${line} · ${final?'Ảnh hoàn tất':line===4?'Lật ngang một hàng':line===6?'Đảo một bit':'Chọn hàng / cột'}`,`Line ${line} · ${final?'Image complete':line===4?'Flip one row':line===6?'Invert one bit':'Select a row / column'}`),note:bi('',''),arr:[],highlight:[],mark:[],codeBlock:1,codeLines:[line],debugLine:line,final,
      vars:[...(py.r===null?[]:[{name:'r',value:py.r}]),...(py.c===null?[]:[{name:'c',value:py.c}])],
      flip832View:{rows,cols,line,source:CODE[line-1],timing:'before',original,pythonLocals:{image:copy(image),r:py.r,c:py.c},pending,doneCells,cursor,lastWrite:lastWrite?{...lastWrite}:null,final},
    });
  }
  emit(3);
  for(let r=0;r<rows;r++){
    py.r=r;emit(4,{kind:'flip',row:r,before:[...image[r]],after:[...image[r]].reverse()});image[r].reverse();lastWrite={kind:'flip',row:r};emit(5);
    for(let c=0;c<cols;c++){
      py.c=c;const before=image[r][c],after=before^1;emit(6,{kind:'bit',row:r,col:c,before,after});image[r][c]=after;doneCells++;lastWrite={kind:'bit',row:r,col:c,before,after};emit(5);
    }
    emit(3);
  }
  emit(7,null,true);
  return{original:copy(original),answer:copy(image),steps};
}
module.exports={832:{id:832,difficulty:'easy',slug:'flipping-an-image',category:{key:'array',vi:'Mảng',en:'Array'},tags:[{key:'2d-array',vi:'Mảng 2D',en:'2D Array'}],title:bi('Flipping an Image','Flipping an Image'),titleVi:bi('Lật ngang ↔ rồi đảo 0 ⇄ 1','Flip horizontally ↔ then invert 0 ⇄ 1'),
  statement:bi('Lật trái ↔ phải trong từng hàng, rồi đảo mọi ô 0 ↔ 1. Không đổi thứ tự các hàng.','Reverse left ↔ right within each row, then invert every 0 ↔ 1. Keep the row order.'),
  defaultInput:'1,1,0;1,0,1;0,0,0',inputKind:'string',inputLabel:bi('image · ma trận JSON hoặc hàng cách bằng ;','image · JSON matrix or rows separated by ;'),extraParams:[],debugMode:'line',code:CODE,builder:buildSteps,liveArgs:input=>[parse(input)],
  approach:[bi('Lật ngang: cột c chuyển sang cột n−1−c trong cùng hàng.','Horizontal flip: column c moves to n−1−c in the same row.'),bi('Đảo bit: 0 ^ 1 = 1, 1 ^ 1 = 0.','Invert a bit: 0 ^ 1 = 1, 1 ^ 1 = 0.')],
  complexity:{time:'O(rows · cols)',space:'O(1)',note:bi('Sửa ảnh tại chỗ. Debug đủ từng dòng cho mọi kích thước được hỗ trợ, tối đa 20×20.','Modify the image in place. Every supported size, up to 20×20, is traced line by line.')},
}};
