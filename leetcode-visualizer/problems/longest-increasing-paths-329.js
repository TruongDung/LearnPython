"use strict";
const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def longestIncreasingPath(self, matrix):",
  "        rows, cols = len(matrix), len(matrix[0])",
  "        paths = []",
  "        path = []",
  "        res = 0",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "",
  "        def dfs(r, c):",
  "            nonlocal res",
  "            path.append((r, c))",
  "            paths.append(path.copy())",
  "            if len(paths) > 5000:",
  "                raise ValueError(\"More than 5000 paths; use approach 1.\")",
  "",
  "            res = max(res, len(path))",
  "",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "                if (0 <= nr < rows and",
  "                    0 <= nc < cols and",
  "                    matrix[nr][nc] > matrix[r][c]):",
  "                    dfs(nr, nc)",
  "",
  "            path.pop()",
  "",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                dfs(r, c)",
  "",
  "        groups = {}",
  "        for cells in paths:",
  "            values = [matrix[r][c] for r, c in cells]",
  "            groups.setdefault(len(values), []).append(values)",
  "",
  "        for length in sorted(groups):",
  "            formatted = \", \".join(",
  "                \"[\" + \" -> \".join(map(str, values)) + \"]\"",
  "                for values in groups[length]",
  "            )",
  "            print(f\"Paths with length {length}: {formatted}.\")",
  "",
  "        return res"
];
const line = text => SOURCE.indexOf(text) + 1;
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
const L = { setup: line("        rows, cols = len(matrix), len(matrix[0])"),
  paths: line("        paths = []"), path: line("        path = []"), res: line("        res = 0"),
  directions: line("        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]"),
  define: line("        def dfs(r, c):"), nonlocal: line("            nonlocal res"),
  append: line("            path.append((r, c))"), record: line("            paths.append(path.copy())"),
  limit: line("            if len(paths) > 5000:"), update: line("            res = max(res, len(path))"),
  direction: line("            for dr, dc in directions:"), neighbor: line("                nr, nc = r + dr, c + dc"),
  condition: line("                if (0 <= nr < rows and"), call: line("                    dfs(nr, nc)"),
  pop: line("            path.pop()"), row: line("        for r in range(rows):"), root: line("            for c in range(cols):"), rootCall: line("                dfs(r, c)"),
  groups: line("        groups = {}"), cells: line("        for cells in paths:"), values: line("            values = [matrix[r][c] for r, c in cells]"),
  groupAdd: line("            groups.setdefault(len(values), []).append(values)"), length: line("        for length in sorted(groups):"),
  format: line('            formatted = ", ".join('), print: line('            print(f"Paths with length {length}: {formatted}.")'),
  done: line("        return res") };
function buildSteps(matrix) {
  const rows = matrix.length, cols = matrix[0].length, steps = [], paths = [], path = [], counts = new Map(), groups = new Map(), printed = [];
  let res = null, current = null, root = null, neighbor = null, processed = 0, omitted = 0;
  const values = cells => cells.map(([r,c])=>({r,c,value:matrix[r][c]}));
  const copyPath = cells => cells.map(cell=>[...cell]);
  function emit(sourceLine, phase, title, note, extra = {}) {
    if(steps.length >= 600 && phase !== "done") {omitted++;return;}
    steps.push({arr:[],codeBlock:2,codeLines:extra.codeLines || [sourceLine],title,note,final:phase==="done",
      vars:[{name:"rows",value:rows},{name:"cols",value:cols},...(res===null?[]:[{name:"res",value:res}]),{name:"len(paths)",value:paths.length},
        {name:"path",value:path.map(cell=>"("+cell.join(",")+")").join(" → ") || "[]"}],
      longestIncreasingPath329View:{method:2,matrix:matrix.map(row=>[...row]),res,phase,root:root?[...root]:null,current:current?[...current]:null,
        neighbor:neighbor?[...neighbor]:null,path:copyPath(path),lastPath:paths.length?copyPath(paths.at(-1)):[],count:paths.length,processed,omitted,
        condition:extra.condition??null,calculation:extra.calculation?{...extra.calculation}:null,
        counts:[...counts].sort((a,b)=>a[0]-b[0]).map(([length,count])=>({length,count})),
        groups:(phase==="done"?[...groups.keys()].sort((a,b)=>a-b):printed).map(length=>({length,paths:groups.get(length).map(values),longest:length===res})),
        longestCount:phase==="done"?(groups.get(res)?.length || 0):null,answer:phase==="done"?res:null},
    });
  }
  emit(L.setup,"setup",bi(`rows = ${rows}, cols = ${cols}`,`rows = ${rows}, cols = ${cols}`),bi("Liệt kê đường tăng bắt đầu từ mọi ô.","Enumerate increasing paths starting at every cell."));
  emit(L.paths,"paths-init",bi("paths = []","paths = []"),bi("Giữ một bản sao của mỗi đường; không gộp các đường trùng giá trị.","Keep a copy of each path; do not merge identical value sequences."));
  emit(L.path,"path-init",bi("path = []","path = []"),bi("Đây là nhánh DFS đang thử, sẽ được khôi phục khi backtrack.","This is the current DFS branch; backtracking restores it."));
  res = 0;
  emit(L.res,"res-init",bi("res = 0: độ dài lớn nhất","res = 0: maximum length"),bi("res là độ dài, khác len(paths) là số đường đã tìm.","res is a length; len(paths) is the number of discovered paths."));
  emit(L.directions,"directions",bi("Xuống → lên → phải → trái","Down → up → right → left"),bi("Chỉ đi tới giá trị lớn hơn, không đi chéo.","Only move to larger values; no diagonals."));
  emit(L.define,"define",bi("DFS + backtracking lưu mọi prefix","DFS + backtracking saves every prefix"),bi("Cách 2 giữ từng đường riêng, không dùng memoization để bỏ qua nhánh.","Approach 2 preserves each path; it does not memoize away branches."));
  function dfs(r,c) {
    current=[r,c];neighbor=null;
    emit(L.nonlocal,"nonlocal",bi("DFS dùng chung res","DFS shares res"),bi("Mọi lời gọi cùng cập nhật độ dài tốt nhất.","All calls update the same best length."));
    path.push([r,c]);
    emit(L.append,"append",bi(`Thêm (${r},${c}) vào path`,`Append (${r},${c}) to path`),bi("Đường có thể kết thúc ngay tại ô này.","A path may end at this cell."));
    paths.push(copyPath(path));
    if(paths.length>5000)throw new Error("329 · Cách 2: hơn 5000 đường, dùng cách 1 để tìm độ dài / Approach 2: more than 5000 paths; use approach 1 to find the length.");
    counts.set(path.length,(counts.get(path.length)||0)+1);
    emit(L.record,"record",bi(`Lưu đường #${paths.length}, dài ${path.length}`,`Save path #${paths.length}, length ${path.length}`),bi("path.copy() giữ đường này nguyên vẹn khi path thay đổi.","path.copy() preserves this path when path changes."));
    emit(L.limit,"limit",bi(`${paths.length} ≤ 5000`,`${paths.length} ≤ 5000`),bi("Tiếp tục in đầy đủ; nếu vượt giới hạn sẽ báo lỗi.","Continue complete enumeration; exceeding the limit reports an error."));
    const before=res;res=Math.max(res,path.length);
    emit(L.update,"res-update",bi(`res = max(${before}, ${path.length}) = ${res}`,`res = max(${before}, ${path.length}) = ${res}`),bi("Lưu độ dài lớn nhất, không cộng số đường vào res.","Keep the maximum length; do not add path counts to res."),{calculation:{before,length:path.length,after:res}});
    for(const [dr,dc] of DIRS) {
      current=[r,c];neighbor=null;
      emit(L.direction,"direction",bi(`Xét hướng (${dr},${dc})`,`Check direction (${dr},${dc})`),bi("Thử kéo dài đường hiện tại.","Try extending the current path."));
      const nr=r+dr,nc=c+dc;neighbor=[nr,nc];
      emit(L.neighbor,"neighbor",bi(`Ô kề (${nr},${nc})`,`Neighbor (${nr},${nc})`),bi("Kiểm tra biên và giá trị tăng nghiêm ngặt.","Check bounds and strictly increasing value."));
      const rowValid=nr>=0&&nr<rows,colValid=nc>=0&&nc<cols,valid=rowValid&&colValid&&matrix[nr][nc]>matrix[r][c];
      const note=!rowValid||!colValid?bi("Ngoài ma trận → bỏ qua.","Outside the matrix → skip."):valid?bi(`${matrix[nr][nc]} > ${matrix[r][c]} → được nối.`,`${matrix[nr][nc]} > ${matrix[r][c]} → may extend.`):bi(`${matrix[nr][nc]} ≤ ${matrix[r][c]} → bỏ qua.`,`${matrix[nr][nc]} ≤ ${matrix[r][c]} → skip.`);
      emit(L.condition,valid?"accept":"reject",valid?bi("Kéo dài đường tăng","Extend the increasing path"):bi("Bỏ qua ô kề","Skip the neighbor"),note,{condition:valid,codeLines:!rowValid?[L.condition]:!colValid?[L.condition,L.condition+1]:[L.condition,L.condition+1,L.condition+2]});
      if(valid) {
        emit(L.call,"call",bi(`Gọi dfs(${nr},${nc})`,`Call dfs(${nr},${nc})`),bi("Giữ các ô cha trong path rồi thêm ô con.","Keep parent cells in path, then append the child."));
        dfs(nr,nc);current=[r,c];neighbor=[nr,nc];
      }
    }
    path.pop();neighbor=null;
    emit(L.pop,"pop",bi(`Bỏ (${r},${c}) khỏi path`,`Remove (${r},${c}) from path`),bi("Trở về nhánh cha để thử hướng khác; paths vẫn giữ các bản sao.","Restore the parent's branch for other directions; paths retains saved copies."));
  }
  for(let r=0;r<rows;r++) {
    emit(L.row,"row",bi(`Duyệt hàng ${r}`,`Scan row ${r}`),bi("Mỗi ô đều có thể là điểm bắt đầu.","Any cell can be a starting point."));
    for(let c=0;c<cols;c++) {
      root=[r,c];current=[r,c];
      emit(L.root,"root",bi(`Ô gốc (${r},${c})`,`Root (${r},${c})`),bi("path rỗng trước mỗi ô gốc.","path is empty before each root."));
      emit(L.rootCall,"root-call",bi(`Gọi dfs(${r},${c})`,`Call dfs(${r},${c})`),bi("Liệt kê mọi đường bắt đầu ở ô gốc này.","Enumerate every path starting at this root."));
      dfs(r,c);processed++;
    }
  }
  current=null;root=null;
  emit(L.groups,"groups-init",bi("Nhóm đường theo độ dài","Group paths by length"),bi("Độ dài là số ô trong đường.","Length is the number of cells in the path."));
  for(const cells of paths) {
    emit(L.cells,"group-path",bi(`Đường dài ${cells.length}`,`Length-${cells.length} path`),bi("Giữ nguyên từng dãy tọa độ.","Preserve each coordinate sequence."));
    emit(L.values,"values",bi("Lấy giá trị từ tọa độ","Read values at the coordinates"),bi("Hai đường trùng giá trị vẫn được in riêng.","Identical value sequences are still printed separately."));
    if(!groups.has(cells.length))groups.set(cells.length,[]);
    groups.get(cells.length).push(cells);
    emit(L.groupAdd,"group-add",bi(`Thêm vào nhóm dài ${cells.length}`,`Add to length-${cells.length} group`),bi("Không loại trùng bằng giá trị.","Do not deduplicate by values."));
  }
  for(const length of [...groups.keys()].sort((a,b)=>a-b)) {
    emit(L.length,"length",bi(`In nhóm dài ${length}`,`Print length-${length} group`),bi("Thứ tự độ dài tăng dần.","Print in ascending length order."));
    emit(L.format,"format",bi("Định dạng [giá trị → giá trị]","Format [value → value]"),bi("Mỗi đường nằm trong một cặp ngoặc vuông.","Each path is enclosed in square brackets."),{codeLines:[L.format,L.format+1,L.format+2,L.format+3]});
    printed.push(length);
    emit(L.print,"print",bi(`In ${groups.get(length).length} đường dài ${length}`,`Print ${groups.get(length).length} length-${length} paths`),bi("Nhóm này có đầy đủ các đường của độ dài đó.","This group contains every path of that length."));
  }
  emit(L.done,"done",bi(`Độ dài lớn nhất = ${res} · ${paths.length} đường`,`Maximum length = ${res} · ${paths.length} paths`),bi(`Liệt kê đủ ${paths.length} đường. Nhóm độ dài ${res} là các đường dài nhất, được đánh dấu xanh.`,`Listed all ${paths.length} paths. The length-${res} group contains the longest paths, highlighted in green.`));
  return {original:matrix,answer:res,allPaths:paths.map(values),steps};
}
module.exports = {SOURCE,buildSteps};
