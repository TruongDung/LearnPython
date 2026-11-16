'use strict';
const base=require('./dp'),{runTrace}=require('./wasm-picture-trace'),bi=(vi,en)=>({vi,en}),lines=s=>s.split('\n');
const CODES={
120:lines(`class Solution:
    def minimumTotal(self, triangle):
        dp = [row[:] for row in triangle]
        for row in range(len(triangle) - 2, -1, -1):
            for col in range(row + 1):
                left = dp[row + 1][col]
                right = dp[row + 1][col + 1]
                dp[row][col] = triangle[row][col] + min(left, right)
        return dp[0][0]`),
931:lines(`class Solution:
    def minFallingPathSum(self, matrix):
        n = len(matrix)
        dp = [row[:] for row in matrix]
        for row in range(n - 2, -1, -1):
            for col in range(n):
                best = dp[row + 1][col]
                if col > 0:
                    best = min(best, dp[row + 1][col - 1])
                if col + 1 < n:
                    best = min(best, dp[row + 1][col + 1])
                dp[row][col] = matrix[row][col] + best
        return min(dp[0])`),
1289:lines(`class Solution:
    def minFallingPathSum(self, grid):
        n = len(grid)
        previous = grid[0][:]
        for row in range(1, n):
            min_col = min(range(n), key=lambda col: previous[col])
            smallest = previous[min_col]
            second = min((previous[col], col) for col in range(n) if col != min_col)
            current = [0] * n
            for col in range(n):
                best, from_col = second if col == min_col else (smallest, min_col)
                current[col] = grid[row][col] + best
            previous = current
        return min(previous)`),
1594:lines(`class Solution:
    def maxProductPath(self, grid):
        MOD = 10**9 + 7
        rows, cols = len(grid), len(grid[0])
        low = [[0] * cols for _ in range(rows)]
        high = [[0] * cols for _ in range(rows)]
        for row in range(rows):
            for col in range(cols):
                value = grid[row][col]
                if row == 0 and col == 0:
                    low[row][col] = high[row][col] = value
                else:
                    candidates = []
                    if row > 0:
                        candidates.extend((low[row - 1][col] * value, high[row - 1][col] * value))
                    if col > 0:
                        candidates.extend((low[row][col - 1] * value, high[row][col - 1] * value))
                    low[row][col] = min(candidates)
                    high[row][col] = max(candidates)
        best = high[-1][-1]
        return -1 if best < 0 else best % MOD`),
1301:lines(`class Solution:
    def pathsWithMaxScore(self, board):
        MOD = 10**9 + 7
        n = len(board)
        score = [[-1] * n for _ in range(n)]
        ways = [[0] * n for _ in range(n)]
        score[n - 1][n - 1] = 0
        ways[n - 1][n - 1] = 1
        for row in range(n - 1, -1, -1):
            for col in range(n - 1, -1, -1):
                if board[row][col] == 'X' or (row == n - 1 and col == n - 1):
                    continue
                candidates = []
                for dr, dc in ((1, 0), (0, 1), (1, 1)):
                    nr, nc = row + dr, col + dc
                    if nr < n and nc < n and score[nr][nc] >= 0:
                        candidates.append((score[nr][nc], ways[nr][nc]))
                if not candidates:
                    continue
                best = max(value for value, count in candidates)
                value = 0 if board[row][col] == 'E' else int(board[row][col])
                score[row][col] = best + value
                ways[row][col] = sum(count for value, count in candidates if value == best) % MOD
        return [score[0][0], ways[0][0]] if score[0][0] >= 0 else [0, 0]`)
};
function parse(id,input){let grid=input;try{if(typeof input==='string'){const s=input.trim();grid=s.startsWith('[')?JSON.parse(s):s.split(/[;|\n]/).map(row=>id===1301?row.trim():row.split(',').map(x=>x.trim()?Number(x):NaN));}}catch{grid=null;}if(id===1301){if(!Array.isArray(grid)||grid.length<2||grid.length>6||!Array.from(grid).every(row=>typeof row==='string'&&row.length===grid.length&&/^[1-9EXS]+$/.test(row))||grid[0][0]!=='E'||grid.at(-1).at(-1)!=='S'||grid.join('').split('E').length!==2||grid.join('').split('S').length!==2)throw Error('1301: use a square 2–6 board, digits/X, E at top-left and S at bottom-right.');return grid.map(row=>[...row]);}
 const range=id===1594?4:id===120?10000:id===931?100:99;if(!Array.isArray(grid)||!grid.length||grid.length>6||!Array.from(grid).every((row,r)=>Array.isArray(row)&&row.length>0&&row.length<=6&&row.length===(id===120?r+1:id===931||id===1289?grid.length:grid[0].length)&&Array.from(row).every(x=>Number.isInteger(x)&&Math.abs(x)<=range)))throw Error(`${id}: use ${id===120?'a triangle':id===1594?'a rectangular grid':'a square grid'}, up to 6 rows/columns, integers in −${range}…${range}.`);return grid.map(row=>[...row]);}
const names={120:'minimumTotal',931:'minFallingPathSum',1289:'minFallingPathSum',1594:'maxProductPath',1301:'pathsWithMaxScore'};
function build(id,input){const grid=parse(id,input),args=[id===1301?grid.map(row=>row.join('')):grid],code=CODES[id],native=runTrace({code:code.join('\n'),method:names[id],args}),known=grid.map(row=>row.map(()=>false)),lowKnown=grid.map(row=>row.map(()=>false)),highKnown=grid.map(row=>row.map(()=>false)),dp=grid.map(row=>row.map(()=>null)),writes=[];let active=null,minimum=null,fromCol=null;
 function mark(row,col,index){if(!known[row][col])writes.push({row,col,step:index});known[row][col]=true;}
 const steps=native.events.map((e,index)=>{const x=e.locals,text=code[e.line-1].trim(),final=index===native.events.length-1;let phase='read';
  if(text.startsWith('for row in')){active=null;if(e.branch&&id===1289)minimum=null;}
  if(text.startsWith('for col in')){active=e.branch?[x.row,x.col]:null;fromCol=null;}
  if([120,931].includes(id)&&text.startsWith('dp =')){grid.at(-1).forEach((_,col)=>mark(grid.length-1,col,index));phase='base';}
  if([120,931].includes(id)&&text.startsWith('dp[row][col] =')){mark(x.row,x.col,index);phase='write';}
  if(id===1289){if(text==='previous = grid[0][:]'){dp[0]=[...x.previous];grid[0].forEach((_,col)=>mark(0,col,index));phase='base';}if(text.startsWith('min_col ='))minimum={col:x.min_col,smallest:null,second:null};if(text.startsWith('smallest ='))minimum.smallest=x.smallest;if(text.startsWith('second ='))minimum.second=[...x.second];if(text.startsWith('best, from_col ='))fromCol=x.from_col;if(text.startsWith('current[col] =')){dp[x.row][x.col]=x.current[x.col];mark(x.row,x.col,index);phase='write';}}
  if(id===1594){if(text==='low[row][col] = high[row][col] = value'){lowKnown[x.row][x.col]=true;highKnown[x.row][x.col]=true;mark(x.row,x.col,index);phase='write';}else if(text.startsWith('low[row][col] =')){lowKnown[x.row][x.col]=true;phase='low';}else if(text.startsWith('high[row][col] =')){highKnown[x.row][x.col]=true;mark(x.row,x.col,index);phase='write';}}
  if(id===1301){if(text==='score[n - 1][n - 1] = 0')lowKnown[grid.length-1][grid.length-1]=true;if(text==='ways[n - 1][n - 1] = 1'){highKnown[grid.length-1][grid.length-1]=true;mark(grid.length-1,grid.length-1,index);phase='base';}if(text.startsWith('if board[row][col]')&&e.branch||text==='if not candidates:'&&e.branch){lowKnown[x.row][x.col]=true;highKnown[x.row][x.col]=true;mark(x.row,x.col,index);phase='skip';}if(text==='score[row][col] = best + value'){lowKnown[x.row][x.col]=true;phase='score';}if(text.startsWith('ways[row][col] =')){highKnown[x.row][x.col]=true;mark(x.row,x.col,index);phase='write';}}
  if(final){active=null;phase='result';}
  const view={id,grid,dp:id===1289?dp.map(row=>[...row]):x.dp??x.high??x.score??null,low:x.low??null,high:x.high??null,ways:x.ways??null,known:known.map(row=>[...row]),lowKnown:lowKnown.map(row=>[...row]),highKnown:highKnown.map(row=>[...row]),writes:structuredClone(writes),active:active?[...active]:null,minimum:minimum?structuredClone(minimum):null,fromCol,previous:x.previous??null,phase,source:{line:e.line,text},trace:native.trace,scalars:Object.fromEntries(['row','col','value','best','left','right','min_col','smallest','second','from_col'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]])),final,answer:final?native.answer:null};return {arr:[],codeBlock:1,codeLines:[e.line],final,title:bi(text,text),note:bi('',''),vars:Object.entries(view.scalars).map(([name,value])=>({name,value})),gridChoiceView:view};
 });return{original:args[0],answer:native.answer,steps};}
const meta={120:['Triangle','triangle','medium','2|3,4|6,5,7|4,1,8,3'],931:['Minimum Falling Path Sum','minimum-falling-path-sum','medium','2,1,3|6,5,4|7,8,9'],1289:['Minimum Falling Path Sum II','minimum-falling-path-sum-ii','hard','1,2,3|4,5,6|7,8,9'],1594:['Maximum Non Negative Product in a Matrix','maximum-non-negative-product-in-a-matrix','medium','1,-2,1|1,-2,1|3,-4,1'],1301:['Number of Paths with Max Score','number-of-paths-with-max-score','hard','E23|2X2|12S']};
const statements={120:bi('Từ đỉnh tam giác xuống đáy. Mỗi bước chọn một trong hai ô ngay dưới; tìm tổng nhỏ nhất.','From the triangle top to its base, choose one of the two cells below. Minimize the sum.'),931:bi('Bắt đầu ở bất kỳ cột nào hàng đầu. Mỗi bước rơi ↙ ↓ ↘; tìm tổng nhỏ nhất.','Start anywhere in the top row. Fall ↙ ↓ ↘ one row at a time; minimize the sum.'),1289:bi('Chọn một số mỗi hàng. Hai hàng liên tiếp không được chọn cùng cột; tìm tổng nhỏ nhất.','Choose one value per row. Consecutive choices must use different columns. Minimize the sum.'),1594:bi('Từ góc trên trái đi → hoặc ↓. Tìm tích không âm lớn nhất; không có thì trả −1.','Move → or ↓ from top left. Maximize the nonnegative product; return −1 if impossible.'),1301:bi('Từ S về E, đi ↑ ← ↖, tránh X. Trả [điểm lớn nhất, số đường đạt điểm đó].','Move ↑ ← ↖ from S to E, avoiding X. Return [maximum score, number of paths attaining it].')};
const complexities={120:{time:'O(n²)',space:'O(n²)'},931:{time:'O(n²)',space:'O(n²)'},1289:{time:'O(n²)',space:'O(n)'},1594:{time:'O(mn)',space:'O(mn)'},1301:{time:'O(n²)',space:'O(n²)'}};
module.exports={};for(const[idText,[title,slug,difficulty,input]]of Object.entries(meta)){const id=Number(idText);module.exports[id]={...(base[id]??{}),id,title:bi(title,title),titleVi:bi(title,title),slug,difficulty,category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},statement:statements[id],defaultInput:input,inputKind:'string',extraParams:[],inputLabel:bi(id===120?'Tam giác · tối đa 6 hàng · ngăn hàng bằng |':id===1301?'Board · 2–6 hàng · E, S, X, chữ số · ngăn bằng |':'Grid · tối đa 6×6 · ngăn hàng bằng |',id===120?'Triangle · up to 6 rows · separate with |':id===1301?'Board · 2–6 rows · E, S, X, digits · separate with |':'Grid · up to 6×6 · separate rows with |'),code:CODES[id],debugMode:'line-by-line',complexity:{...complexities[id],note:bi('Bảng minh hoạ chỉ hiện giá trị sau khi dòng tương ứng chạy.','A cell is revealed only after its corresponding assignment executes.')},approach:[statements[id]],builder:input=>build(id,input),liveArgs:input=>{const g=parse(id,input);return[id===1301?g.map(row=>row.join('')):g];}};}
