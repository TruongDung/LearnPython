'use strict';
const bi=(vi,en)=>({vi,en}),copy=grid=>grid.map(row=>[...row]);
const CODE=[
  'class Solution:',
  '    def shiftGrid(self, grid, k):',
  '        m, n = len(grid), len(grid[0])',
  '        result = [[0] * n for _ in range(m)]',
  '        for r in range(m):',
  '            for c in range(n):',
  '                old_pos = r * n + c',
  '                new_pos = (old_pos + k) % (m * n)',
  '                new_r, new_c = divmod(new_pos, n)',
  '                result[new_r][new_c] = grid[r][c]',
  '        return result',
];
const CODE2=[
  'class Solution:',
  '    def shiftGrid(self, grid, k):',
  '        m, n = len(grid), len(grid[0])',
  '        size = m * n',
  '        one_arr = []',
  '        for row in grid:',
  '            for x in row:',
  '                one_arr.append(x)',
  '        new_arr = [0] * size',
  '        for i in range(size):',
  '            new_index = (i + k) % size',
  '            new_arr[new_index] = one_arr[i]',
  '        for r in range(m):',
  '            for c in range(n):',
  '                grid[r][c] = new_arr[r * n + c]',
  '        return grid',
];
function parse(input,params={}){
  let grid;
  try{if(typeof input!=='string'||!input.trim())throw new Error();const text=input.trim();grid=text.startsWith('[')?JSON.parse(text):text.split(/[;|\n]/).map(row=>row.split(',').map(value=>{if(!value.trim())throw new Error();return Number(value.trim());}));}catch{throw new Error('1260: grid cần ma trận JSON hoặc các hàng cách bằng ;. / Use a JSON matrix or semicolon-separated rows.');}
  if(!Array.isArray(grid)||grid.length<1||grid.length>50||!Array.isArray(grid[0])||grid[0].length<1||grid[0].length>50||grid.some(row=>!Array.isArray(row)||row.length!==grid[0].length||row.some(x=>!Number.isInteger(x)||x< -1000||x>1000)))throw new Error('1260: cần ma trận 1..50 hàng/cột, số nguyên −1000..1000. / Use a rectangular 1..50 matrix of integers in −1000..1000.');
  const k=Number(params.k??1),approach=Number(params.approach??1);
  if(params.k!==undefined&&(typeof params.k!=='number'&&typeof params.k!=='string'||typeof params.k==='string'&&!params.k.trim())||!Number.isInteger(k)||k<0||k>100)throw new Error('1260: k phải là số nguyên 0..100. / k must be an integer in 0..100.');
  if(![1,2].includes(approach))throw new Error('1260: approach phải là 1 hoặc 2. / Choose approach 1 or 2.');
  return{grid:copy(grid),k,approach};
}
function buildSteps(input,params={}){
  const parsed=parse(input,params),grid=parsed.grid,original=copy(grid),{k,approach}=parsed,m=grid.length,n=grid[0].length,size=m*n,full=size<=36,steps=[],code=approach===1?CODE:CODE2;
  const py=approach===1?{grid,k,m:null,n:null,result:null,r:null,c:null,old_pos:null,new_pos:null,new_r:null,new_c:null}:{grid,k,m:null,n:null,size:null,one_arr:null,new_arr:null,row:null,x:null,i:null,r:null,c:null,new_index:null};
  let phase='setup',count=0,flatCount=0,rebuildCount=0,cursor=0,ordinal=0,previousOrdinal=0,lastWrite=null;
  const selected=i=>full||i<2||i>=size-2;
  function emit(line,pending=null,final=false,record=true){
    ordinal++;if(!record)return;
    const locals=JSON.parse(JSON.stringify(py)),skippedBefore=ordinal-previousOrdinal-1;previousOrdinal=ordinal;
    steps.push({title:bi(`Dòng ${line} · ${final?'Dịch bảng hoàn tất':phase==='flatten'?'Trải phẳng':phase==='rebuild'?'Ghép lại bảng':'Ô nguồn → ô đích'}`,`Line ${line} · ${final?'Shift complete':phase==='flatten'?'Flatten':phase==='rebuild'?'Rebuild the grid':'Source → destination'}`),note:bi('',''),arr:[],highlight:[],mark:[],vars:[],codeBlock:approach,codeLines:[line],debugLine:line,final,
      shift1260View:{m,n,size,k,shift:k%size,approach,line,source:code[line-1],timing:'before',original,pythonLocals:locals,phase,count,flatCount,rebuildCount,cursor,lastWrite:lastWrite?{...lastWrite}:null,pending,trace:{full,ordinal,skippedBefore},final}});
  }
  const target=i=>(i+k)%size;
  emit(3);py.m=m;py.n=n;
  if(approach===1){
    // Python 3.12+ traces the inlined list-comprehension line once per row
    // and once when its iterator finishes; result is unbound until assignment.
    for(let j=0;j<=m;j++)emit(4,null,false,full||j===0||j===m);
    py.result=Array.from({length:m},()=>Array(n).fill(0));phase='shift';emit(5);
    for(let r=0;r<m;r++){
      py.r=r;emit(6,null,false,selected(r*n));
      for(let c=0;c<n;c++){
        py.c=c;cursor=r*n+c;const keep=selected(cursor);
        emit(7,null,false,keep);py.old_pos=cursor;
        emit(8,{kind:'map',from:cursor,to:target(cursor),value:grid[r][c]},false,keep);py.new_pos=target(cursor);
        emit(9,null,false,keep);py.new_r=Math.floor(py.new_pos/n);py.new_c=py.new_pos%n;
        const pending={kind:'write',from:cursor,to:py.new_pos,value:grid[r][c]};emit(10,pending,false,keep);
        py.result[py.new_r][py.new_c]=grid[r][c];count++;lastWrite=pending;
        emit(6,null,false,keep);
      }
      emit(5,null,false,selected(r*n+n-1));
    }
    phase='done';emit(11,null,true);
  }else{
    emit(4);py.size=size;emit(5);py.one_arr=[];phase='flatten';emit(6);
    for(let r=0;r<m;r++){
      py.row=grid[r];emit(7,null,false,selected(r*n));
      for(let c=0;c<n;c++){
        cursor=r*n+c;py.x=py.row[c];const keep=selected(cursor),pending={kind:'append',from:cursor,to:flatCount,value:py.x};emit(8,pending,false,keep);py.one_arr.push(py.x);flatCount++;lastWrite=pending;emit(7,null,false,keep);
      }
      emit(6,null,false,selected(r*n+n-1));
    }
    emit(9);py.new_arr=Array(size).fill(0);phase='shift';emit(10);
    for(let i=0;i<size;i++){
      py.i=i;cursor=i;const keep=selected(i);emit(11,{kind:'map',from:i,to:target(i),value:py.one_arr[i]},false,keep);py.new_index=target(i);
      const pending={kind:'write',from:i,to:py.new_index,value:py.one_arr[i]};emit(12,pending,false,keep);py.new_arr[py.new_index]=py.one_arr[i];count++;lastWrite=pending;emit(10,null,false,keep);
    }
    phase='rebuild';emit(13);
    for(let r=0;r<m;r++){
      py.r=r;emit(14,null,false,selected(r*n));
      for(let c=0;c<n;c++){
        py.c=c;cursor=(r*n+c-k%size+size)%size;const keep=selected(r*n+c),pending={kind:'rebuild',from:r*n+c,to:r*n+c,value:py.new_arr[r*n+c]};emit(15,pending,false,keep);grid[r][c]=pending.value;rebuildCount++;lastWrite=pending;emit(14,null,false,keep);
      }
      emit(13,null,false,selected(r*n+n-1));
    }
    phase='done';emit(16,null,true);
  }
  return{original,answer:copy(approach===1?py.result:grid),steps};
}
module.exports={1260:{id:1260,difficulty:'easy',slug:'shift-2d-grid',category:{key:'array',vi:'Mảng',en:'Array'},tags:[{key:'2d-array',vi:'Mảng 2D',en:'2D Array'}],title:bi('Shift 2D Grid','Shift 2D Grid'),titleVi:bi('Dịch phải → xuống hàng ↳ vòng về đầu ↶','Right → next row ↳ wrap to start ↶'),
  statement:bi('Dịch mọi ô sang phải k lần. Cuối hàng sang đầu hàng kế; cuối bảng vòng về (0,0).','Shift every cell right k times. Row endings go to the next row; the last cell wraps to (0,0).'),
  defaultInput:'1,2,3;4,5,6;7,8,9',inputKind:'string',inputLabel:bi('grid · JSON hoặc hàng cách bằng ;','grid · JSON or semicolon-separated rows'),
  extraParams:[{key:'k',label:bi('Dịch k ô','Shift k cells'),default:1,min:0,max:100},{key:'approach',label:bi('Cách giải','Approach'),type:'select',default:1,options:[{value:1,label:bi('1 · Ánh xạ trực tiếp','1 · Direct mapping')},{value:2,label:bi('2 · Trải phẳng → dịch → ghép','2 · Flatten → shift → rebuild')}]}],
  code:CODE,code2:CODE2,codeLabel:bi('1 · Ánh xạ trực tiếp','1 · Direct mapping'),code2Label:bi('2 · Trải phẳng → dịch → ghép','2 · Flatten → shift → rebuild'),debugMode:'line',builder:buildSteps,liveArgs:(input,params)=>{const {grid,k}=parse(input,params);return[grid,k];},
  approach:[bi('Xem bảng như một dải ô đọc từ trái sang phải, từ trên xuống dưới.','Read the grid as one ribbon: left to right, top to bottom.'),bi('Vị trí mới = (vị trí cũ + k) % số ô.','New position = (old position + k) % number of cells.')],
  complexity:{time:'O(m · n)',space:'O(m · n)',note:bi('≤ 36 ô: debug đủ từng dòng. Bảng lớn vẫn tính đủ; gộp các vòng lặp ở giữa, có báo số dòng đã gộp.','≤ 36 cells: every line is traced. Larger grids are fully computed; middle iterations are summarized with explicit gap counts.')},
}};
