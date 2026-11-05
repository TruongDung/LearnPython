'use strict';

const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en=vi)=>({vi,en});
const CODE=Object.freeze([
  'from collections import deque',
  '',
  'class Solution:',
  '    def findSafeWalk(self, grid, health):',
  '        m, n = len(grid), len(grid[0])',
  '        start_hp = health - grid[0][0]',
  '        if start_hp <= 0:',
  '            return False',
  '        dirs = [(0,1), (1,0), (0,-1), (-1,0)]',
  '        best = [[-1]*n for _ in range(m)]',
  '        best[0][0] = start_hp',
  '        parent = {(0,0,start_hp): None}',
  '        q = deque([(0,0,start_hp)])',
  '        while q:',
  '            r, c, hp = q.popleft()',
  '            if hp < best[r][c]:',
  '                continue',
  '            if (r,c) == (m-1,n-1):',
  '                return True',
  '            for dr, dc in dirs:',
  '                nr, nc = r+dr, c+dc',
  '                if not (0 <= nr < m and 0 <= nc < n):',
  '                    continue',
  '                nhp = hp - grid[nr][nc]',
  '                if nhp <= 0:',
  '                    continue',
  '                if nhp <= best[nr][nc]:',
  '                    continue',
  '                best[nr][nc] = nhp',
  '                parent[(nr,nc,nhp)] = (r,c,hp)',
  '                q.append((nr,nc,nhp))',
  '        return False',
]);

function parseInput(input) {
  let grid=input;
  if(typeof input==='string') {
    const text=input.trim();
    if(text.startsWith('[')) {
      try {grid=JSON.parse(text);}catch {throw new RangeError('3286: JSON lưới không hợp lệ / Invalid grid JSON.');}
    } else grid=text.split(/[|;\n]/).map(row=>row.split(',').map(value=>value.trim()?Number(value.trim()):NaN));
  }
  if(!Array.isArray(grid)||!grid.length||grid.length>50||!Array.isArray(grid[0])||!grid[0].length||grid[0].length>50||
    !Array.from(grid).every(row=>Array.isArray(row)&&row.length===grid[0].length&&Array.from(row).every(value=>value===0||value===1))) {
    throw new RangeError('3286: lưới chữ nhật 0/1, tối đa 50×50 / Rectangular 0/1 grid, at most 50×50.');
  }
  return grid.map(row=>[...row]);
}

function parseHealth(grid,params={}) {
  const health=Number(params.health??1),max=grid.length+grid[0].length;
  if(!Number.isInteger(health)||health<1||health>max)throw new RangeError(`3286: health là số nguyên từ 1 đến ${max} / health must be an integer from 1 to ${max}.`);
  return health;
}

function build(input,params={}) {
  const grid=parseInput(input),health=parseHealth(grid,params);
  const result=runTrace({profile:'safe3286',code:CODE.join('\n'),method:'findSafeWalk',args:[grid,health],maxEvents:1600});
  let previous=new Map();
  const steps=result.events.map(view=>{
    const updated=view.cells.flat().filter(cell=>previous.has(`${cell.r},${cell.c}`)&&previous.get(`${cell.r},${cell.c}`)!==cell.bestHp)
      .map(cell=>({cell:[cell.r,cell.c],before:previous.get(`${cell.r},${cell.c}`),after:cell.bestHp}));
    previous=new Map(view.cells.flat().map(cell=>[`${cell.r},${cell.c}`,cell.bestHp]));
    return {arr:[],highlight:[],mark:[],codeBlock:1,codeLines:[view.source.line],final:view.final,
      title:bi(`BFS · dòng ${view.source.line}`,`BFS · line ${view.source.line}`),note:bi(''),
      vars:Object.entries(view.locals).map(([name,value])=>({name,value})),safeWalk3286View:{...view,updated,trace:result.trace}};
  });
  return {original:grid,health,answer:result.answer,steps};
}

module.exports={3286:{
  id:3286,difficulty:'medium',slug:'find-a-safe-walk-through-a-grid',category:{key:'graph',vi:'Đồ thị',en:'Graph'},
  tags:[{key:'bfs',vi:'BFS',en:'BFS'}],title:bi('Find a Safe Walk Through a Grid'),
  titleVi:bi('Tới đích khi vẫn còn máu','Reach T with health left'),
  statement:bi('S → T, đi 4 hướng. Ô 1 trừ 1 máu, kể cả S và T. Luôn cần hp > 0.','Move S → T in four directions. Every 1 costs 1 health, including S and T. Keep hp > 0.'),
  defaultInput:'0,1,0,0,0|0,1,0,1,0|0,0,0,1,0',inputKind:'string',debugMode:'line-by-line',
  inputLabel:bi('grid · 0 = an toàn, 1 = −1 HP · JSON hoặc hàng ngăn bởi | / ;','grid · 0 = safe, 1 = −1 HP · JSON or rows separated by | / ;'),
  extraParams:[{key:'health',label:bi('health · máu ban đầu','health · initial health'),default:1,min:1,max:100}],
  approach:[bi('best[r][c] giữ lượng máu cao nhất đã tới ô. Chỉ đi tiếp khi hp > 0 và cải thiện best.','best[r][c] stores the most health seen at a cell. Continue only with hp > 0 and an improvement.')],
  complexity:{time:'O(MN·H)',space:'O(MN·H)',note:bi('H = health. best dùng O(MN); queue và parent có thể lưu nhiều trạng thái mỗi ô. Chỉ rút gọn hình/trace, không dừng tìm kiếm.','H = health. best uses O(MN); the queue and parents may store multiple states per cell. Only pictures/traces are condensed; search continues to completion.')},
  code:CODE,builder:build,parseInput,liveArgs:(input,params={})=>{const grid=parseInput(input);return[grid,parseHealth(grid,params)];},
}};
