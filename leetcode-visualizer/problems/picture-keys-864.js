"use strict";
const base = require("./graph")[864], { trace, bi } = require("./picture-trace");
const code = [
  "from collections import deque", "class Solution:", "    def shortestPathAllKeys(self, grid):",
  "        rows, cols = len(grid), len(grid[0])", "        target = 0", "        for r, row in enumerate(grid):", "            for c, ch in enumerate(row):",
  "                if ch == '@':", "                    start = (r, c)", "                if 'a' <= ch <= 'f':", "                    target |= 1 << (ord(ch) - ord('a'))",
  "        q = deque([(start[0], start[1], 0, 0)])", "        seen = {(start[0], start[1], 0)}", "        while q:",
  "            r, c, mask, dist = q.popleft()", "            if mask == target:", "                return dist",
  "            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:", "                nr, nc = r + dr, c + dc",
  "                if not (0 <= nr < rows and 0 <= nc < cols):", "                    continue", "                ch = grid[nr][nc]",
  "                if ch == '#':", "                    continue", "                if 'A' <= ch <= 'F' and not (mask & (1 << (ord(ch) - ord('A')))):",
  "                    continue", "                next_mask = mask", "                if 'a' <= ch <= 'f':", "                    next_mask |= 1 << (ord(ch) - ord('a'))",
  "                state = (nr, nc, next_mask)", "                if state in seen:", "                    continue", "                seen.add(state)",
  "                q.append((nr, nc, next_mask, dist + 1))", "        return -1"
];
function parse(input) {
  let grid;
  try { grid=Array.isArray(input) ? [...input] : typeof input === "string" && input.trim().startsWith("[") ? JSON.parse(input) : typeof input === "string" ? input.trim().split(/[;|\n]/).map(s=>s.trim()) : null; } catch { grid=null; }
  if(!Array.isArray(grid) || !grid.length || grid.length>30 || !grid.every(row=>typeof row==="string" && /^[.@#a-fA-F]{1,30}$/.test(row) && row.length===grid[0].length) || grid.join("").split("@").length!==2) throw new Error("grid: lưới chữ nhật tối đa 30×30, đúng một @; dùng . # a-f A-F. Hàng cách nhau bằng ;.");
  const keys=grid.join("").match(/[a-f]/g)||[];
  if(new Set(keys).size!==keys.length) throw new Error("Mỗi chìa khóa a-f chỉ xuất hiện một lần.");
  return grid;
}
function builder(input) {
  const grid=parse(input), keyCount=(grid.join("").match(/[a-f]/g)||[]).length, T=trace(864,code,grid.length*grid[0].length<=36 && keyCount<=3);
  const l={self:{},grid}, q=[], seen=new Set(), parents=new Map(); let head=0, current=null, neighbor=null, path=[], queued=false, seenReady=false, answer=null, lastLine=0;
  const key=state=>state.slice(0,3).join(",");
  const getPath=state=>{ const result=[]; for(let k=key(state);k!==null;k=parents.get(k)??null) result.push(k.split(",").map(Number)); return result.reverse(); };
  const view=()=>({grid,current,neighbor,target:l.target??0,mask:current?l.mask:0,dist:current?l.dist:0,nextMask:neighbor&&lastLine>=27&&lastLine<=34?l.next_mask:null,
    queue:q.slice(head,head+8),queueTotal:q.length-head,visited:[...seen].map(k=>k.split(",").map(Number)),path,answer});
  const E=(line,event)=>{
    lastLine=line;if(!T.active)return;
    const locals={...l};
    if(queued)locals.q=q.slice(head);
    if(seenReady)locals.seen=[...seen].map(k=>k.split(",").map(Number)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
    T.emit(line,event,locals,view);
  };
  l.rows=grid.length;l.cols=grid[0].length;E(4,"grid size");l.target=0;E(5,"target");
  for(let r=0;r<grid.length;r++){
    l.r=r;l.row=grid[r];E(6,"scan row");
    for(let c=0;c<grid[r].length;c++){
      l.c=c;l.ch=grid[r][c];E(7,"scan cell");E(8,l.ch==="@"?"True":"False");
      if(l.ch==="@"){l.start=[r,c];E(9,"start");}
      E(10,l.ch>="a"&&l.ch<="f"?"True":"False");
      if(l.ch>="a"&&l.ch<="f"){l.target|=1<<(l.ch.charCodeAt(0)-97);E(11,"target |= key bit");}
    }E(7,"loop end");
  }E(6,"loop end");
  q.push([...l.start,0,0]);queued=true;parents.set(key(q[0]),null);E(12,"enqueue start");seen.add(key(q[0]));seenReady=true;E(13,"seen start");
  while(true){
    neighbor=null;E(14,head<q.length?"True":"False");if(head>=q.length)break;
    [l.r,l.c,l.mask,l.dist]=q[head++];current=[l.r,l.c];path=getPath([l.r,l.c,l.mask]);E(15,"dequeue");
    E(16,l.mask===l.target?"all keys":"more keys needed");
    if(l.mask===l.target){answer=l.dist;E(17,"return");return T.finish(answer,view,grid);}
    for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
      l.dr=dr;l.dc=dc;neighbor=null;E(18,"direction");l.nr=l.r+dr;l.nc=l.c+dc;neighbor=[l.nr,l.nc];E(19,"neighbor");
      const outside=!(l.nr>=0&&l.nr<l.rows&&l.nc>=0&&l.nc<l.cols);E(20,outside?"outside":"inside");if(outside){E(21,"continue");continue;}
      l.ch=grid[l.nr][l.nc];E(22,"cell");E(23,l.ch==="#"?"wall":"not wall");if(l.ch==="#"){E(24,"continue");continue;}
      const locked=l.ch>="A"&&l.ch<="F"&&!(l.mask&(1<<(l.ch.charCodeAt(0)-65)));E(25,locked?"locked":"passable");if(locked){E(26,"continue");continue;}
      l.next_mask=l.mask;E(27,"copy keys");const isKey=l.ch>="a"&&l.ch<="f";E(28,isKey?"key":"not key");
      if(isKey){l.next_mask|=1<<(l.ch.charCodeAt(0)-97);E(29,"pick up key");}
      l.state=[l.nr,l.nc,l.next_mask];E(30,"cell + keys");const visited=seen.has(key(l.state));E(31,visited?"seen state":"new state");if(visited){E(32,"continue");continue;}
      seen.add(key(l.state));E(33,"mark state");q.push([...l.state,l.dist+1]);parents.set(key(l.state),key([l.r,l.c,l.mask]));E(34,"enqueue");
    }neighbor=null;E(18,"loop end");
  }
  answer=-1;path=[];E(35,"return -1");return T.finish(answer,view,grid);
}
module.exports={864:{...base,code,builder,debugMode:"line-by-line",liveArgs:input=>[parse(input)],
  statement:bi("Đi 4 hướng, nhặt đủ chìa. Cửa cần chìa cùng chữ. BFS tìm đường ngắn nhất.","Move in four directions and collect all keys. Doors need matching keys. BFS finds the shortest route."),
  approach:[bi("Trạng thái = (ô, bộ chìa). Cùng ô, khác chìa → trạng thái mới.","State = (cell, keys). Same cell with different keys is a new state."),bi("a = 001 · b = 010 · a+b = 011")],
  complexity:{...base.complexity,note:bi("Debug lưới ≤36 ô, ≤3 chìa (tối đa 12000 bước hình). Lưới lớn tính đủ và hiển thị đường kết quả.","Line debug ≤36 cells and ≤3 keys (up to 12000 frames). Larger grids are fully solved with the resulting route displayed.")}
}};
