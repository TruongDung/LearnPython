"use strict";
const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def maxIncreasingCells(self, mat):",
  "        rows, cols = len(mat), len(mat[0])",
  "        row_best = [0] * rows",
  "        col_best = [0] * cols",
  "        res = 0",
  "        groups = {}",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                groups.setdefault(mat[r][c], []).append((r, c))",
  "",
  "        for value in sorted(groups):",
  "            pending = []",
  "            for r, c in groups[value]:",
  "                length = 1 + max(row_best[r], col_best[c])",
  "                pending.append((r, c, length))",
  "",
  "            for r, c, length in pending:",
  "                row_best[r] = max(row_best[r], length)",
  "                col_best[c] = max(col_best[c], length)",
  "                res = max(res, length)",
  "",
  "        return res"
];
function parseInput(input) {
  let mat = input;
  if (typeof input === "string") {
    const text = input.trim();
    if(text.startsWith("[")) {
      try {mat=JSON.parse(text);} catch {throw new Error("2713: Invalid JSON matrix / Ma trận JSON không hợp lệ.");}
    } else {
      const parts=text.split(/[;|]/).map(row=>row.split(","));
      if(parts.some(row=>row.some(value=>!value.trim())))throw new Error("2713: Empty matrix entry / Có ô rỗng.");
      mat=parts.map(row=>row.map(value=>Number(value.trim())));
    }
  }
  if(!Array.isArray(mat)||mat.length<1||mat.length>100000||!Array.isArray(mat[0])||mat[0].length<1||mat[0].length>100000||mat.length*mat[0].length>100000||mat.some(row=>!Array.isArray(row)||row.length!==mat[0].length||row.some(value=>!Number.isInteger(value)||value < -100000 || value > 100000))) {
    throw new Error("2713: Use a rectangular matrix with 1–100000 cells and values -100000..100000 / Cần ma trận chữ nhật 1–100000 ô, giá trị -100000..100000.");
  }
  return mat.map(row=>[...row]);
}
function buildSteps(input) {
  const mat=parseInput(input),rows=mat.length,cols=mat[0].length,steps=[],groups=new Map(),done=new Set(),prev=new Int32Array(rows*cols).fill(-1);
  let rowBest=null,colBest=null,res=null,groupIndex=-1,current=null,groupValue=null,pending=[],processed=0,completedGroups=0,omitted=0,bestEnd=-1;
  const lengths=mat.map(row=>row.map(()=>null)),rowHead=new Int32Array(rows).fill(-1),colHead=new Int32Array(cols).fill(-1);
  let sorted=[];
  const coord=id=>id<0?null:[Math.floor(id/cols),id%cols];
  function emit(line,phase,title,note,extra={}) {
    if(steps.length>=600&&phase!=="done"){omitted++;return;}
    const focus=current||[0,0],r0=Math.max(0,Math.min(focus[0]-2,rows-6)),c0=Math.max(0,Math.min(focus[1]-2,cols-6));
    const window=Array.from({length:Math.min(6,rows-r0)},(_,i)=>Array.from({length:Math.min(6,cols-c0)},(_,j)=>{
      const r=r0+i,c=c0+j;
      return {r,c,value:mat[r][c],length:lengths[r][c],committed:done.has(r*cols+c),inGroup:groupValue!==null&&mat[r][c]===groupValue};
    }));
    const start=Math.max(0,groupIndex-1);
    steps.push({arr:[],codeLines:extra.codeLines||[line],title,note,final:phase==="done",
      vars:[{name:"rows",value:rows},{name:"cols",value:cols},...(res===null?[]:[{name:"res",value:res}]),...(groupValue===null?[]:[{name:"value",value:groupValue}]),...(current?[{name:"r, c",value:current.join(", ")}]:[])],
      increasingCells2713View:{rows,cols,total:rows*cols,window,phase,res,current:current?[...current]:null,
        groupValue,groupIndex,groupSize:groups.get(groupValue)?.length||0,processed,completedGroups,groupCount:groups.size,omitted,
        order:sorted.slice(start,start+6).map((value,i)=>({index:start+i,value,size:groups.get(value).length,complete:start+i<completedGroups})),
        rowView:Array.from({length:window.length},(_,i)=>({index:r0+i,best:rowBest?rowBest[r0+i]:null})),
        colView:window[0].map(cell=>({index:cell.c,best:colBest?colBest[cell.c]:null})),
        read:extra.read?{...extra.read}:null,calculation:extra.calculation?{...extra.calculation}:null,
        pending:pending.slice(0,6).map(item=>({r:item.r,c:item.c,length:item.length,committed:done.has(item.r*cols+item.c)})),
        pendingCount:pending.length,rowSource:extra.rowSource||null,colSource:extra.colSource||null,
        witness:extra.witness||[],answer:phase==="done"?res:null},
    });
  }
  emit(3,"dimensions",bi(`rows = ${rows}, cols = ${cols}`,`rows = ${rows}, cols = ${cols}`),bi("Chỉ số trong code và hình bắt đầu từ 0.","Code and visualization indices start at 0."));
  rowBest=Array(rows).fill(0);
  emit(4,"row-init",bi("row_best = 0 cho mỗi hàng","row_best = 0 for every row"),bi("row_best[r] là độ dài tốt nhất kết thúc ở hàng r, từ các giá trị đã xử lý.","row_best[r] is the best path ending in row r among processed values."));
  colBest=Array(cols).fill(0);
  emit(5,"col-init",bi("col_best = 0 cho mỗi cột","col_best = 0 for every column"),bi("col_best[c] tương tự cho cột c. Chưa có đường nào nên bằng 0.","col_best[c] is the corresponding best for column c. No paths exist yet, so it starts at 0."));
  res=0;
  emit(6,"res-init",bi("res = 0","res = 0"),bi("Kết quả là số ô trong đường, không phải số bước nhảy.","The result counts visited cells, not jumps."));
  emit(7,"groups-init",bi("groups = {}","groups = {}"),bi("Gom các ô có cùng giá trị vào một nhóm.","Group all cells with the same value."));
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++) {
    const value=mat[r][c];if(!groups.has(value))groups.set(value,[]);groups.get(value).push([r,c]);
  }
  sorted=[...groups.keys()].sort((a,b)=>a-b);
  emit(10,"groups-build",bi(`Gom ${rows*cols} ô thành ${groups.size} nhóm giá trị`,`Group ${rows*cols} cells into ${groups.size} value groups`),bi("Sắp xếp giá trị tăng dần để mọi tiền nhiệm nhỏ hơn đã sẵn sàng.","Sort values ascending so all strictly smaller predecessors are ready."),{codeLines:[8,9,10]});
  for(groupIndex=0;groupIndex<sorted.length;groupIndex++) {
    groupValue=sorted[groupIndex];current=null;
    emit(12,"group",bi(`Nhóm giá trị ${groupValue} · ${groups.get(groupValue).length} ô`,`Value group ${groupValue} · ${groups.get(groupValue).length} cells`),bi("Các ô trong nhóm này không được nối tới nhau vì giá trị bằng nhau.","Cells in this group cannot extend one another because their values are equal."));
    pending=[];
    emit(13,"pending-init",bi("pending = []","pending = []"),bi("Giai đoạn 1: chỉ tính độ dài. Chưa cập nhật row_best hoặc col_best.","Phase 1: compute lengths only. Do not update row_best or col_best yet."));
    for(const [r,c] of groups.get(groupValue)) {
      current=[r,c];
      emit(14,"cell",bi(`Xét ô (${r},${c}) = ${groupValue}`,`Read cell (${r},${c}) = ${groupValue}`),bi("Có thể tới ô này từ bất kỳ ô nhỏ hơn trong cùng hàng hoặc cột.","Reach this cell from any strictly smaller cell in the same row or column."));
      const rowBefore=rowBest[r],colBefore=colBest[c],length=1+Math.max(rowBefore,colBefore);
      prev[r*cols+c]=rowBefore>=colBefore?rowHead[r]:colHead[c];
      emit(15,"compute",bi(`length = 1 + max(${rowBefore}, ${colBefore}) = ${length}`,`length = 1 + max(${rowBefore}, ${colBefore}) = ${length}`),bi("1 tính ô hiện tại. Đọc bản tóm tắt của các giá trị nhỏ hơn; các ô bằng nhau vẫn chưa cập nhật.","1 counts the current cell. Read summaries of smaller values; equal-valued cells have not updated them."),{read:{row:rowBefore,col:colBefore,length},rowSource:coord(rowHead[r]),colSource:coord(colHead[c])});
      pending.push({r,c,length});lengths[r][c]=length;
      emit(16,"pending-add",bi(`Chờ lưu: (${r},${c}) → ${length}`,`Pending: (${r},${c}) → ${length}`),bi("Độ dài này đã tính nhưng chưa được nhóm khác dùng qua row_best/col_best.","This length is computed but is not yet available through row_best/col_best."),{read:{row:rowBefore,col:colBefore,length}});
    }
    current=null;
    for(const item of pending) {
      const {r,c,length}=item;current=[r,c];
      emit(18,"commit",bi(`Cập nhật từ pending: (${r},${c})`,`Commit pending cell (${r},${c})`),bi("Giai đoạn 2: mọi ô bằng nhau đã tính xong. Bây giờ mới cập nhật hàng/cột.","Phase 2: every equal-valued cell has been computed. Now update row and column summaries."));
      let before=rowBest[r];
      if(length>rowBest[r]){rowBest[r]=length;rowHead[r]=r*cols+c;}
      emit(19,"row-update",bi(`row_best[${r}] = max(${before}, ${length}) = ${rowBest[r]}`,`row_best[${r}] = max(${before}, ${length}) = ${rowBest[r]}`),bi("Lưu độ dài tốt nhất cho hàng này.","Store the best length for this row."),{calculation:{target:"row",index:r,before,length,after:rowBest[r]}});
      before=colBest[c];
      if(length>colBest[c]){colBest[c]=length;colHead[c]=r*cols+c;}
      emit(20,"col-update",bi(`col_best[${c}] = max(${before}, ${length}) = ${colBest[c]}`,`col_best[${c}] = max(${before}, ${length}) = ${colBest[c]}`),bi("Lưu độ dài tốt nhất cho cột này.","Store the best length for this column."),{calculation:{target:"col",index:c,before,length,after:colBest[c]}});
      before=res;if(length>res){res=length;bestEnd=r*cols+c;}
      done.add(r*cols+c);processed++;
      emit(21,"res-update",bi(`res = max(${before}, ${length}) = ${res}`,`res = max(${before}, ${length}) = ${res}`),bi("Độ dài này đã được lưu cho hàng/cột. res giữ kết quả tốt nhất toàn ma trận.","This length is stored for its row and column. res keeps the best result across the matrix."),{calculation:{target:"res",before,length,after:res}});
    }
    completedGroups++;
  }
  const path=[];
  for(let id=bestEnd;id>=0;id=prev[id])path.push(coord(id));path.reverse();
  const preview=path.length<=32?path.map((cell,index)=>({cell,index})):path.slice(0,16).map((cell,index)=>({cell,index})).concat(path.slice(-16).map((cell,index)=>({cell,index:path.length-16+index})));
  current=null;groupValue=null;groupIndex=-1;pending=[];
  emit(23,"done",bi(`Đường tăng dài nhất: ${res} ô`,`Longest increasing path: ${res} cells`),bi(`Đã xử lý ${processed} ô theo ${completedGroups} nhóm giá trị. Đường dưới là một ví dụ đạt res; mỗi bước chỉ cần cùng hàng hoặc cột.`,`Processed ${processed} cells in ${completedGroups} value groups. The path below is one example achieving res; each move only needs a shared row or column.`),{witness:preview.map(({cell:[r,c],index})=>({r,c,value:mat[r][c],index}))});
  return {original:mat,answer:res,dp:lengths.map(row=>[...row]),path,steps};
}
module.exports={2713:{
  id:2713,slug:"maximum-strictly-increasing-cells-in-a-matrix",difficulty:"hard",category:{key:"dp",vi:"Quy hoạch động",en:"Dynamic Programming"},
  tags:[{key:"matrix",vi:"Ma trận",en:"Matrix"},{key:"sorting",vi:"Sắp xếp",en:"Sorting"}],
  title:bi("Maximum Strictly Increasing Cells in a Matrix","Maximum Strictly Increasing Cells in a Matrix"),
  titleVi:bi("Nhảy cùng hàng/cột, xử lý nhóm bằng nhau cùng lúc","Jump along rows/columns; process equal values together"),
  statement:bi("Chọn bất kỳ ô làm điểm bắt đầu. Mỗi bước được nhảy tới bất kỳ ô trong cùng hàng hoặc cột có giá trị lớn hơn nghiêm ngặt, kể cả ô không kề nhau. Trả số ô lớn nhất có thể đi qua. [[3,1],[3,4]] → 2; [[3,1,6],[-9,5,7]] → 4.","Start at any cell. Each move may jump to any strictly larger cell in the same row or column, including nonadjacent cells. Return the maximum number of visited cells. [[3,1],[3,4]] → 2; [[3,1,6],[-9,5,7]] → 4."),
  inputKind:"string",inputLabel:bi("mat — hàng cách bằng ; hoặc |, hoặc JSON","mat — rows separated by ; or |, or JSON"),defaultInput:"3,1;3,4",extraParams:[],debugMode:"line-by-line",
  approach:[
    bi("Gom ô theo giá trị rồi xử lý từ nhỏ tới lớn.","Group cells by value, then process values ascending."),
    bi("row_best[r] / col_best[c] là độ dài tốt nhất kết thúc tại hàng r / cột c từ các nhóm nhỏ hơn.","row_best[r] / col_best[c] are the best ending lengths in row r / column c from smaller groups."),
    bi("Tính tất cả ô bằng nhau: length = 1 + max(row_best[r], col_best[c]); lưu pending, chưa cập nhật hàng/cột.","Compute all equal-valued cells: length = 1 + max(row_best[r], col_best[c]); collect pending without updating rows/columns."),
    bi("Sau khi cả nhóm tính xong, cập nhật row_best, col_best và res. Nhờ vậy không nối hai ô bằng nhau.","After computing the entire group, update row_best, col_best and res. This prevents transitions between equal values."),
  ],
  complexity:{time:"O(k log k)",space:"O(k + rows + cols)",note:bi("k = rows × cols ≤100000. Giá trị -100000..100000. Tính đầy đủ mọi ô; dữ liệu lớn hiển thị cửa sổ ≤6×6, tối đa 600 bước trước kết quả cuối. Bảng độ dài và tiền nhiệm chỉ phục vụ visualization.","k = rows × cols ≤100000; values -100000..100000. Every cell is processed; large inputs show a ≤6×6 window and at most 600 steps before the final result. Length and predecessor tables are only for the visualization.")},
  code:SOURCE,builder:buildSteps,liveArgs:input=>[parseInput(input)],
}};
