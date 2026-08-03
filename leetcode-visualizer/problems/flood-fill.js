// Detailed line-by-line visualizations for the Flood Fill learning path.

const tr = (vi, en) => ({ vi, en });
const floodFillTag = { key: "flood-fill", vi: "Flood Fill", en: "Flood Fill" };

function splitRows(input) {
  return String(input).split("|").map((row) => row.trim()).filter(Boolean)
    .map((row) => (row.includes(",") ? row.split(",") : row.split(""))
      .map((value) => value.trim().replace(/^"|"$/g, "")));
}

function parseBinary(input, asString = false) {
  const raw = splitRows(input);
  const valid = raw.length > 0 && raw[0].length > 0 && raw.every((row) =>
    row.length === raw[0].length && row.every((value) => value === "0" || value === "1")
  );
  return { valid, grid: raw.map((row) => row.map((value) => asString ? value : Number(value))) };
}

function parseNumbers(input) {
  const raw = splitRows(input);
  const valid = raw.length > 0 && raw[0].length > 0 && raw.every((row) =>
    row.length === raw[0].length && row.every((value) => /^-?\d+$/.test(value))
  );
  return { valid, grid: raw.map((row) => row.map(Number)) };
}

function invalid(original, note) {
  return { original, answer: [], steps: [{
    title: tr("Đầu vào không hợp lệ", "Invalid input"), arr: [],
    bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
    highlight: [], mark: [], final: true, codeLines: [4],
    vars: [{ name: "answer", value: "invalid" }], note,
  }] };
}

function stackText(stack) {
  return `[${stack.map(([row, col]) => `(${row},${col})`).join(", ")}]`;
}

function recorder(rows, cols, getCells, getStack) {
  const steps = [];
  function push(line, title, note, options = {}) {
    const vars = [...(options.vars || [])];
    if (!vars.some((item) => item.name === "stack")) vars.push({ name: "stack", value: stackText(getStack()) });
    const step = { title, arr: [], bfsGrid: { rows, cols, cells: getCells(options.current || null, options.discovered || null) },
      highlight: [], mark: [], final: Boolean(options.final), codeLines: [line], vars, note };
    if (options.floodFillView) step.floodFillView = options.floodFillView;
    steps.push(step);
  }
  return { steps, push };
}

function buildSteps733(input, params = {}) {
  const parsed = parseNumbers(input);
  const original = parsed.grid.map((row) => [...row]);
  if (!parsed.valid) return invalid(original, tr("Image phải là ma trận chữ nhật gồm số nguyên.", "Image must be a rectangular integer matrix."));
  const image = parsed.grid.map((row) => [...row]);
  const rows = image.length, cols = image[0].length;
  const startRow = Number(params.start_row ?? params.sr ?? 1);
  const startCol = Number(params.start_col ?? params.sc ?? 1);
  const color = Number(params.color ?? 2);
  if (!Number.isInteger(startRow) || !Number.isInteger(startCol) || !Number.isInteger(color) || startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols) {
    return invalid(original, tr("start_row/start_col phải nằm trong image và color phải là số nguyên.", "start_row/start_col must be inside the image and color must be an integer."));
  }
  const originalColor = image[startRow][startCol];
  const directions = [[1,0],[-1,0],[0,1],[0,-1]];
  let stack = [];
  const changed = Array.from({ length: rows }, () => Array(cols).fill(false));
  let phase = "enter";
  let currentCell = null;
  let neighborCell = null;
  let activeDirection = null;
  let insideGrid = null;
  let matchesOriginal = null;
  let canFillNeighbor = null;
  let dimensionsKnown = false;
  let originalKnown = false;
  let directionsKnown = false;
  let stackKnown = false;
  function cells(current, discovered) {
    const queued = new Set(stack.map(([row,col]) => `${row},${col}`));
    return image.map((matrixRow,row) => matrixRow.map((value,col) => {
      let cls = changed[row][col] ? "visited" : "empty";
      if (queued.has(`${row},${col}`)) cls = "queued";
      if (discovered && discovered[0]===row && discovered[1]===col) cls="path";
      if (current && current[0]===row && current[1]===col) cls="current";
      return { label: String(value), cls };
    }));
  }
  const { steps, push: recordStep } = recorder(rows, cols, cells, () => stack);
  function push(line, title, note, options = {}) {
    const filledCount = changed.reduce((total, row) => total + row.filter(Boolean).length, 0);
    recordStep(line, title, note, {
      ...options,
      floodFillView: {
        phase,
        rows,
        cols,
        image: image.map((row) => [...row]),
        original: original.map((row) => [...row]),
        changed: changed.map((row) => [...row]),
        start: [startRow, startCol],
        current: currentCell ? [...currentCell] : null,
        neighbor: neighborCell ? [...neighborCell] : null,
        direction: activeDirection ? [...activeDirection] : null,
        insideGrid,
        matchesOriginal,
        canFill: canFillNeighbor,
        originalColor: originalKnown ? originalColor : null,
        newColor: color,
        dimensionsKnown,
        directionsKnown,
        stackKnown,
        stack: stack.map((cell) => [...cell]),
        filledCount,
      },
    });
  }
  push(4,tr("Bắt đầu floodFill","Enter floodFill"),tr("Tô toàn bộ component có cùng màu với ô bắt đầu.","Recolor the component matching the start cell."),{vars:[{name:"start",value:`(${startRow},${startCol})`},{name:"color",value:color}]});
  dimensionsKnown = true;
  phase = "dimensions";
  push(5,tr(`rows=${rows}, cols=${cols}`,`rows=${rows}, cols=${cols}`),tr("Lưu kích thước image.","Store image dimensions."),{vars:[{name:"rows",value:rows},{name:"cols",value:cols}]});
  originalKnown = true;
  currentCell = [startRow,startCol];
  phase = "read-color";
  push(6,tr(`original_color = ${originalColor}`,`original_color = ${originalColor}`),tr("Chỉ các ô nối liền có màu này mới được tô.","Only connected cells with this color are filled."),{current:[startRow,startCol],vars:[{name:"original_color",value:originalColor}]});
  const unchanged = originalColor === color;
  phase = "same-color-check";
  push(7,tr(`original_color == color → ${unchanged}`,`original_color == color → ${unchanged}`),unchanged?tr("Màu mới giống màu cũ; trả image ngay để tránh lặp vô hạn.","The new color matches the old one; return immediately."):tr("Màu khác nhau; tiếp tục DFS.","The colors differ; continue DFS."),{current:[startRow,startCol],vars:[{name:"same color?",value:unchanged}]});
  if (unchanged) { phase="done"; push(7,tr("return image","return image"),tr("Image không thay đổi.","The image is unchanged."),{final:true,vars:[{name:"answer",value:JSON.stringify(image)}]}); return {original,answer:image,steps}; }
  canFillNeighbor = null;
  currentCell = null;
  directionsKnown = true;
  phase = "directions";
  push(8,tr("Khai báo 4 hướng","Define four directions"),tr("Flood fill nối theo cạnh, không nối chéo.","Flood fill uses edges, not diagonals."),{vars:[{name:"directions",value:"down, up, right, left"}]});
  stack=[[startRow,startCol]];
  stackKnown = true;
  currentCell = [startRow,startCol];
  phase = "stack-init";
  push(9,tr(`stack = [(${startRow},${startCol})]`,`stack = [(${startRow},${startCol})]`),tr("Đặt ô bắt đầu vào DFS stack.","Put the start cell on the DFS stack."),{current:[startRow,startCol]});
  image[startRow][startCol]=color; changed[startRow][startCol]=true;
  phase = "fill-start";
  push(10,tr(`image[${startRow}][${startCol}] = ${color}`,`image[${startRow}][${startCol}] = ${color}`),tr("Tô trước khi enqueue để không thêm trùng.","Recolor before traversal to prevent duplicate pushes."),{current:[startRow,startCol],discovered:[startRow,startCol]});
  while(stack.length){
    currentCell = null; neighborCell = null; activeDirection = null; insideGrid = null; matchesOriginal = null; canFillNeighbor = null; phase = "stack-check";
    push(11,tr("while stack → True","while stack → True"),tr("Stack còn ô cần mở rộng.","The stack still has a cell to expand."));
    const [row,col]=stack.pop();
    currentCell = [row,col]; phase = "pop";
    push(12,tr(`pop → (${row},${col})`,`pop → (${row},${col})`),tr("Lấy ô trên cùng của stack.","Pop the top stack cell."),{current:[row,col],vars:[{name:"row",value:row},{name:"col",value:col}]});
    for(const [deltaRow,deltaCol] of directions){
      activeDirection = [deltaRow,deltaCol]; neighborCell = null; insideGrid = null; matchesOriginal = null; canFillNeighbor = null; phase = "direction";
      push(13,tr(`Thử hướng (${deltaRow},${deltaCol})`,`Try direction (${deltaRow},${deltaCol})`),tr("Xét một neighbor.","Inspect one neighbor."),{current:[row,col],vars:[{name:"delta_row",value:deltaRow},{name:"delta_col",value:deltaCol}]});
      const nextRow=row+deltaRow,nextCol=col+deltaCol;
      neighborCell = [nextRow,nextCol]; phase = "neighbor";
      push(14,tr(`next = (${nextRow},${nextCol})`,`next = (${nextRow},${nextCol})`),tr("Tính tọa độ neighbor.","Compute neighbor coordinates."),{current:[row,col],vars:[{name:"next_row",value:nextRow},{name:"next_col",value:nextCol}]});
      insideGrid=nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols;
      matchesOriginal=insideGrid ? image[nextRow][nextCol]===originalColor : null;
      const canFill=insideGrid&&matchesOriginal;
      canFillNeighbor = canFill; phase = "neighbor-check";
      push(15,tr(`Neighbor có original_color → ${canFill}`,`Neighbor has original_color → ${canFill}`),canFill?tr("Neighbor thuộc component; sẽ tô màu.","The neighbor belongs to the component; recolor it."):tr("Ngoài biên hoặc màu khác/đã tô; bỏ qua.","Out of bounds or different/already filled; skip."),{current:nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols?[nextRow,nextCol]:[row,col],vars:[{name:"can fill?",value:canFill}]});
      if(!canFill) continue;
      image[nextRow][nextCol]=color; changed[nextRow][nextCol]=true;
      phase = "fill-neighbor";
      push(16,tr(`image[${nextRow}][${nextCol}] = ${color}`,`image[${nextRow}][${nextCol}] = ${color}`),tr("Tô neighbor ngay.","Recolor the neighbor immediately."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});
      stack.push([nextRow,nextCol]);
      phase = "push-neighbor";
      push(17,tr(`stack.append((${nextRow},${nextCol}))`,`stack.append((${nextRow},${nextCol}))`),tr("Đưa neighbor vào stack để tiếp tục lan.","Push the neighbor for further expansion."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});
    }
  }
  currentCell = null; neighborCell = null; activeDirection = null; insideGrid = null; matchesOriginal = null; canFillNeighbor = null; phase = "stack-empty";
  push(11,tr("while stack → False","while stack → False"),tr("Stack rỗng; component đã tô xong.","The stack is empty; the component is complete."));
  phase = "done";
  push(18,tr("return image","return image"),tr("Trả về image sau flood fill.","Return the flood-filled image."),{final:true,vars:[{name:"answer",value:JSON.stringify(image)}]});
  return {original,answer:image,steps};
}

function buildSteps200Detailed(input) {
  const parsed=parseBinary(input,true), original=parsed.grid.map((row)=>[...row]);
  if(!parsed.valid) return invalid(original,tr("Grid chỉ được chứa 0 và 1.","Grid may contain only 0 and 1."));
  const grid=parsed.grid.map((row)=>[...row]),rows=grid.length,cols=grid[0].length,directions=[[1,0],[-1,0],[0,1],[0,-1]];
  let stack=[],islands=0; const islandId=Array.from({length:rows},()=>Array(cols).fill(0));
  function cells(current,discovered){const queued=new Set(stack.map(([r,c])=>`${r},${c}`));return grid.map((matrixRow,r)=>matrixRow.map((value,c)=>{let cls=value==="0"?"wall":"empty",label=value;if(islandId[r][c]){cls="visited";label=String(islandId[r][c]);}if(queued.has(`${r},${c}`))cls="queued";if(discovered&&discovered[0]===r&&discovered[1]===c)cls="path";if(current&&current[0]===r&&current[1]===c)cls="current";return{label,cls};}));}
  const {steps,push}=recorder(rows,cols,cells,()=>stack);
  push(4,tr("Bắt đầu numIslands","Enter numIslands"),tr("Mỗi flood fill hoàn chỉnh tương ứng một đảo.","Each completed flood fill represents one island."));
  push(5,tr(`rows=${rows}, cols=${cols}`,`rows=${rows}, cols=${cols}`),tr("Lưu kích thước grid.","Store grid dimensions."),{vars:[{name:"rows",value:rows},{name:"cols",value:cols}]});
  push(6,tr("Khai báo 4 hướng","Define four directions"),tr("Đảo chỉ nối theo cạnh.","Islands connect only by edges."));
  push(7,tr("islands = 0","islands = 0"),tr("Chưa phát hiện đảo nào.","No island has been found yet."),{vars:[{name:"islands",value:islands}]});
  for(let row=0;row<rows;row++){push(8,tr(`Scan row = ${row}`,`Scan row = ${row}`),tr("Quét từng hàng.","Scan each row."),{vars:[{name:"row",value:row}]});for(let col=0;col<cols;col++){push(9,tr(`Scan (${row},${col})`,`Scan (${row},${col})`),tr("Xét ô hiện tại.","Inspect the current cell."),{current:[row,col],vars:[{name:"col",value:col},{name:"grid[row][col]",value:grid[row][col]}]});const land=grid[row][col]==="1";push(10,tr(`grid[${row}][${col}] != '1' → ${!land}`,`grid[${row}][${col}] != '1' → ${!land}`),land?tr("Đây là đất chưa thăm; bắt đầu đảo mới.","This is unvisited land; start a new island."):tr("Nước hoặc đất đã thăm; continue.","Water or visited land; continue."),{current:[row,col],vars:[{name:"unvisited land?",value:land}]});if(!land)continue;islands++;push(11,tr(`islands += 1 → ${islands}`,`islands += 1 → ${islands}`),tr("Tìm thấy điểm bắt đầu của một đảo mới.","Found the start of a new island."),{current:[row,col],vars:[{name:"islands",value:islands}]});stack=[[row,col]];push(12,tr(`stack = [(${row},${col})]`,`stack = [(${row},${col})]`),tr("Khởi tạo DFS stack cho đảo này.","Initialize the DFS stack for this island."),{current:[row,col]});grid[row][col]="0";islandId[row][col]=islands;push(13,tr(`grid[${row}][${col}] = '0'`,`grid[${row}][${col}] = '0'`),tr("Đánh dấu trước khi push để không thăm trùng.","Mark before traversal to avoid duplicate visits."),{current:[row,col],discovered:[row,col]});while(stack.length){push(14,tr("while stack → True","while stack → True"),tr("Stack còn đất của đảo hiện tại.","The stack still contains land from this island."));const[currentRow,currentCol]=stack.pop();push(15,tr(`pop → (${currentRow},${currentCol})`,`pop → (${currentRow},${currentCol})`),tr("Lấy một ô đất để mở rộng.","Pop one land cell to expand."),{current:[currentRow,currentCol],vars:[{name:"current_row",value:currentRow},{name:"current_col",value:currentCol}]});for(const[deltaRow,deltaCol]of directions){push(16,tr(`Thử hướng (${deltaRow},${deltaCol})`,`Try direction (${deltaRow},${deltaCol})`),tr("Xét neighbor.","Inspect a neighbor."),{current:[currentRow,currentCol],vars:[{name:"delta_row",value:deltaRow},{name:"delta_col",value:deltaCol}]});const nextRow=currentRow+deltaRow,nextCol=currentCol+deltaCol;push(17,tr(`next = (${nextRow},${nextCol})`,`next = (${nextRow},${nextCol})`),tr("Tính tọa độ neighbor.","Compute neighbor coordinates."),{current:[currentRow,currentCol],vars:[{name:"next_row",value:nextRow},{name:"next_col",value:nextCol}]});const nextLand=nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols&&grid[nextRow][nextCol]==="1";push(18,tr(`Neighbor là land → ${nextLand}`,`Neighbor is land → ${nextLand}`),nextLand?tr("Neighbor thuộc cùng đảo.","The neighbor belongs to the same island."):tr("Ngoài biên hoặc không còn là đất; bỏ qua.","Out of bounds or no longer land; skip."),{current:nextLand?[nextRow,nextCol]:[currentRow,currentCol],vars:[{name:"unvisited land?",value:nextLand}]});if(!nextLand)continue;grid[nextRow][nextCol]="0";islandId[nextRow][nextCol]=islands;push(19,tr(`grid[${nextRow}][${nextCol}] = '0'`,`grid[${nextRow}][${nextCol}] = '0'`),tr("Đánh dấu neighbor đã thăm.","Mark the neighbor visited."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});stack.push([nextRow,nextCol]);push(20,tr(`stack.append((${nextRow},${nextCol}))`,`stack.append((${nextRow},${nextCol}))`),tr("Đưa neighbor vào stack.","Push the neighbor onto the stack."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});}}push(14,tr("while stack → False","while stack → False"),tr(`Đã flood fill xong đảo #${islands}.`,`Island #${islands} is fully flood-filled.`));}}
  push(21,tr(`return ${islands}`,`return ${islands}`),tr("Trả về tổng số đảo.","Return the total island count."),{final:true,vars:[{name:"answer",value:islands}]});return{original,answer:islands,steps};
}

function buildSteps695Detailed(input) {
  const parsed=parseBinary(input),original=parsed.grid.map((row)=>[...row]);if(!parsed.valid)return invalid(original,tr("Grid chỉ được chứa 0 và 1.","Grid may contain only 0 and 1."));
  const grid=parsed.grid.map((row)=>[...row]),rows=grid.length,cols=grid[0].length,directions=[[1,0],[-1,0],[0,1],[0,-1]];let stack=[],maxArea=0,island=0;const owner=Array.from({length:rows},()=>Array(cols).fill(0)),best=new Set();
  function cells(current,discovered){const queued=new Set(stack.map(([r,c])=>`${r},${c}`));return grid.map((matrixRow,r)=>matrixRow.map((value,c)=>{let cls=value===0?"wall":"empty",label=owner[r][c]?String(owner[r][c]):String(value);if(owner[r][c])cls="visited";if(best.has(`${r},${c}`))cls="path";if(queued.has(`${r},${c}`))cls="queued";if(discovered&&discovered[0]===r&&discovered[1]===c)cls="path";if(current&&current[0]===r&&current[1]===c)cls="current";return{label,cls};}));}
  const{steps,push}=recorder(rows,cols,cells,()=>stack);push(4,tr("Bắt đầu maxAreaOfIsland","Enter maxAreaOfIsland"),tr("Flood fill từng đảo và giữ area lớn nhất.","Flood-fill each island and keep the largest area."));push(5,tr(`rows=${rows}, cols=${cols}`,`rows=${rows}, cols=${cols}`),tr("Lưu kích thước grid.","Store grid dimensions."),{vars:[{name:"rows",value:rows},{name:"cols",value:cols}]});push(6,tr("Khai báo 4 hướng","Define four directions"),tr("Đảo nối theo cạnh.","Islands connect by edges."));push(7,tr("max_area = 0","max_area = 0"),tr("Khởi tạo diện tích lớn nhất.","Initialize the largest area."),{vars:[{name:"max_area",value:0}]});
  for(let row=0;row<rows;row++){push(8,tr(`Scan row = ${row}`,`Scan row = ${row}`),tr("Quét hàng.","Scan a row."),{vars:[{name:"row",value:row}]});for(let col=0;col<cols;col++){push(9,tr(`Scan (${row},${col})`,`Scan (${row},${col})`),tr("Xét ô hiện tại.","Inspect the current cell."),{current:[row,col],vars:[{name:"col",value:col},{name:"grid[row][col]",value:grid[row][col]}]});const land=grid[row][col]===1;push(10,tr(`grid[${row}][${col}] != 1 → ${!land}`,`grid[${row}][${col}] != 1 → ${!land}`),land?tr("Bắt đầu đo một đảo mới.","Start measuring a new island."):tr("Không phải đất chưa thăm; continue.","Not unvisited land; continue."),{current:[row,col],vars:[{name:"unvisited land?",value:land}]});if(!land)continue;island++;stack=[[row,col]];push(11,tr(`stack = [(${row},${col})]`,`stack = [(${row},${col})]`),tr("Khởi tạo stack cho đảo.","Initialize the island stack."),{current:[row,col]});grid[row][col]=0;owner[row][col]=island;push(12,tr(`grid[${row}][${col}] = 0`,`grid[${row}][${col}] = 0`),tr("Đánh dấu ô đầu tiên đã thăm.","Mark the first cell visited."),{current:[row,col],discovered:[row,col]});let area=0,currentCells=[];push(13,tr("area = 0","area = 0"),tr("Bắt đầu đếm diện tích đảo.","Begin counting island area."),{vars:[{name:"area",value:area}]});while(stack.length){push(14,tr("while stack → True","while stack → True"),tr("Stack còn đất cần đếm.","The stack still has land to count."));const[currentRow,currentCol]=stack.pop();push(15,tr(`pop → (${currentRow},${currentCol})`,`pop → (${currentRow},${currentCol})`),tr("Lấy một ô đất khỏi stack.","Pop one land cell."),{current:[currentRow,currentCol],vars:[{name:"current_row",value:currentRow},{name:"current_col",value:currentCol}]});area++;currentCells.push(`${currentRow},${currentCol}`);push(16,tr(`area += 1 → ${area}`,`area += 1 → ${area}`),tr("Mỗi ô pop ra đóng góp một đơn vị diện tích.","Each popped cell contributes one area unit."),{current:[currentRow,currentCol],vars:[{name:"area",value:area}]});for(const[deltaRow,deltaCol]of directions){push(17,tr(`Thử hướng (${deltaRow},${deltaCol})`,`Try direction (${deltaRow},${deltaCol})`),tr("Xét neighbor.","Inspect a neighbor."),{current:[currentRow,currentCol],vars:[{name:"delta_row",value:deltaRow},{name:"delta_col",value:deltaCol}]});const nextRow=currentRow+deltaRow,nextCol=currentCol+deltaCol;push(18,tr(`next = (${nextRow},${nextCol})`,`next = (${nextRow},${nextCol})`),tr("Tính tọa độ neighbor.","Compute neighbor coordinates."),{current:[currentRow,currentCol],vars:[{name:"next_row",value:nextRow},{name:"next_col",value:nextCol}]});const nextLand=nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols&&grid[nextRow][nextCol]===1;push(19,tr(`Neighbor là land → ${nextLand}`,`Neighbor is land → ${nextLand}`),nextLand?tr("Neighbor thuộc đảo hiện tại.","The neighbor belongs to this island."):tr("Bỏ qua neighbor.","Skip the neighbor."),{current:nextLand?[nextRow,nextCol]:[currentRow,currentCol],vars:[{name:"unvisited land?",value:nextLand}]});if(!nextLand)continue;grid[nextRow][nextCol]=0;owner[nextRow][nextCol]=island;push(20,tr(`grid[${nextRow}][${nextCol}] = 0`,`grid[${nextRow}][${nextCol}] = 0`),tr("Đánh dấu neighbor đã thăm.","Mark the neighbor visited."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});stack.push([nextRow,nextCol]);push(21,tr(`stack.append((${nextRow},${nextCol}))`,`stack.append((${nextRow},${nextCol}))`),tr("Đưa neighbor vào stack.","Push the neighbor."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});}}push(14,tr("while stack → False","while stack → False"),tr(`Đảo có area = ${area}.`,`The island area is ${area}.`));if(area>maxArea){maxArea=area;best.clear();for(const cell of currentCells)best.add(cell);}push(22,tr(`max_area = max(max_area, ${area}) → ${maxArea}`,`max_area = max(max_area, ${area}) → ${maxArea}`),tr("Cập nhật diện tích lớn nhất sau đảo này.","Update the largest area after this island."),{vars:[{name:"area",value:area},{name:"max_area",value:maxArea}]});}}
  push(23,tr(`return ${maxArea}`,`return ${maxArea}`),tr("Trả về diện tích đảo lớn nhất.","Return the largest island area."),{final:true,vars:[{name:"answer",value:maxArea}]});return{original,answer:maxArea,steps};
}

function parseGridPair(input){const parts=String(input).split(";");if(parts.length!==2)return{valid:false,grid1:[],grid2:[]};const a=parseBinary(parts[0]),b=parseBinary(parts[1]);return{valid:a.valid&&b.valid&&a.grid.length===b.grid.length&&a.grid[0]?.length===b.grid[0]?.length,grid1:a.grid,grid2:b.grid};}

function buildSteps1905(input){
  const parsed=parseGridPair(input),original={grid1:parsed.grid1?.map((r)=>[...r])||[],grid2:parsed.grid2?.map((r)=>[...r])||[]};if(!parsed.valid)return invalid(original,tr("Nhập grid1;grid2, mỗi grid dùng '|' ngăn hàng và chỉ gồm 0/1.","Enter grid1;grid2, using '|' between rows; both grids must contain only 0/1."));
  const grid1=parsed.grid1.map((r)=>[...r]),grid2=parsed.grid2.map((r)=>[...r]),rows=grid1.length,cols=grid1[0].length,directions=[[1,0],[-1,0],[0,1],[0,-1]];let stack=[],count=0,island=0;const owner=Array.from({length:rows},()=>Array(cols).fill(0));
  function cells(current,discovered){const queued=new Set(stack.map(([r,c])=>`${r},${c}`));return grid2.map((row,r)=>row.map((value,c)=>{let label=value===1?(grid1[r][c]===1?"✓":"✕"):owner[r][c]?(grid1[r][c]===1?"✓":"✕"):"",cls=value===1?"empty":"wall";if(owner[r][c])cls=grid1[r][c]===1?"visited":"current";if(queued.has(`${r},${c}`))cls="queued";if(discovered&&discovered[0]===r&&discovered[1]===c)cls="path";if(current&&current[0]===r&&current[1]===c)cls="current";return{label,cls};}));}
  const{steps,push}=recorder(rows,cols,cells,()=>stack);push(4,tr("Bắt đầu countSubIslands","Enter countSubIslands"),tr("Flood fill từng đảo grid2 và kiểm tra mọi ô có nằm trên đất grid1 không.","Flood-fill each grid2 island and verify every cell lies on grid1 land."));push(5,tr(`rows=${rows}, cols=${cols}`,`rows=${rows}, cols=${cols}`),tr("Hai grid có cùng kích thước.","Both grids have the same dimensions."),{vars:[{name:"rows",value:rows},{name:"cols",value:cols}]});push(6,tr("Khai báo 4 hướng","Define four directions"),tr("Đảo nối theo cạnh.","Islands connect by edges."));push(7,tr("count = 0","count = 0"),tr("Chưa xác nhận sub-island nào.","No sub-island has been confirmed."),{vars:[{name:"count",value:count}]});
  for(let row=0;row<rows;row++){push(8,tr(`Scan row = ${row}`,`Scan row = ${row}`),tr("Quét grid2.","Scan grid2."),{vars:[{name:"row",value:row}]});for(let col=0;col<cols;col++){push(9,tr(`Scan (${row},${col})`,`Scan (${row},${col})`),tr("Tìm đất grid2 chưa thăm.","Find unvisited grid2 land."),{current:[row,col],vars:[{name:"col",value:col},{name:"grid2[row][col]",value:grid2[row][col]}]});const land=grid2[row][col]===1;push(10,tr(`grid2[${row}][${col}] != 1 → ${!land}`,`grid2[${row}][${col}] != 1 → ${!land}`),land?tr("Bắt đầu kiểm tra một đảo grid2.","Start checking a grid2 island."):tr("Không phải đất chưa thăm; continue.","Not unvisited land; continue."),{current:[row,col],vars:[{name:"unvisited land?",value:land}]});if(!land)continue;island++;stack=[[row,col]];push(11,tr(`stack = [(${row},${col})]`,`stack = [(${row},${col})]`),tr("Khởi tạo stack cho đảo grid2.","Initialize the stack for this grid2 island."),{current:[row,col]});grid2[row][col]=0;owner[row][col]=island;push(12,tr(`grid2[${row}][${col}] = 0`,`grid2[${row}][${col}] = 0`),tr("Đánh dấu ô bắt đầu đã thăm.","Mark the start cell visited."),{current:[row,col],discovered:[row,col]});let isSub=true;push(13,tr("is_sub = True","is_sub = True"),tr("Giả sử là sub-island cho tới khi gặp ô không thuộc grid1.","Assume it is a sub-island until a cell misses grid1 land."),{vars:[{name:"is_sub",value:isSub}]});while(stack.length){push(14,tr("while stack → True","while stack → True"),tr("Kiểm tra toàn bộ đảo grid2.","Inspect the entire grid2 island."));const[currentRow,currentCol]=stack.pop();push(15,tr(`pop → (${currentRow},${currentCol})`,`pop → (${currentRow},${currentCol})`),tr("Lấy một ô của đảo.","Pop one island cell."),{current:[currentRow,currentCol],vars:[{name:"current_row",value:currentRow},{name:"current_col",value:currentCol}]});if(grid1[currentRow][currentCol]===0)isSub=false;push(16,tr(`grid1[${currentRow}][${currentCol}] == 0 → ${grid1[currentRow][currentCol]===0}`,`grid1[${currentRow}][${currentCol}] == 0 → ${grid1[currentRow][currentCol]===0}`),grid1[currentRow][currentCol]===0?tr("Ô grid2 không nằm trên đất grid1; đảo này không phải sub-island.","This grid2 cell is not over grid1 land; the island is not a sub-island."):tr("Ô này hợp lệ trong grid1.","This cell is valid in grid1."),{current:[currentRow,currentCol],vars:[{name:"is_sub",value:isSub}]});for(const[deltaRow,deltaCol]of directions){push(17,tr(`Thử hướng (${deltaRow},${deltaCol})`,`Try direction (${deltaRow},${deltaCol})`),tr("Xét neighbor grid2.","Inspect a grid2 neighbor."),{current:[currentRow,currentCol],vars:[{name:"delta_row",value:deltaRow},{name:"delta_col",value:deltaCol}]});const nextRow=currentRow+deltaRow,nextCol=currentCol+deltaCol;push(18,tr(`next = (${nextRow},${nextCol})`,`next = (${nextRow},${nextCol})`),tr("Tính tọa độ neighbor.","Compute neighbor coordinates."),{current:[currentRow,currentCol],vars:[{name:"next_row",value:nextRow},{name:"next_col",value:nextCol}]});const nextLand=nextRow>=0&&nextRow<rows&&nextCol>=0&&nextCol<cols&&grid2[nextRow][nextCol]===1;push(19,tr(`Neighbor grid2 là land → ${nextLand}`,`grid2 neighbor is land → ${nextLand}`),nextLand?tr("Neighbor thuộc cùng đảo grid2.","The neighbor belongs to the same grid2 island."):tr("Bỏ qua neighbor.","Skip the neighbor."),{current:nextLand?[nextRow,nextCol]:[currentRow,currentCol],vars:[{name:"unvisited land?",value:nextLand}]});if(!nextLand)continue;grid2[nextRow][nextCol]=0;owner[nextRow][nextCol]=island;push(20,tr(`grid2[${nextRow}][${nextCol}] = 0`,`grid2[${nextRow}][${nextCol}] = 0`),tr("Đánh dấu neighbor đã thăm.","Mark the neighbor visited."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});stack.push([nextRow,nextCol]);push(21,tr(`stack.append((${nextRow},${nextCol}))`,`stack.append((${nextRow},${nextCol}))`),tr("Đưa neighbor vào stack.","Push the neighbor."),{current:[nextRow,nextCol],discovered:[nextRow,nextCol]});}}push(14,tr("while stack → False","while stack → False"),tr(`Đã kiểm tra xong đảo; is_sub = ${isSub}.`,`Island check complete; is_sub = ${isSub}.`),{vars:[{name:"is_sub",value:isSub}]});push(22,tr(`if is_sub → ${isSub}`,`if is_sub → ${isSub}`),isSub?tr("Toàn bộ đảo grid2 nằm trong grid1.","The whole grid2 island lies inside grid1."):tr("Đảo có ít nhất một ô ngoài đất grid1.","At least one island cell misses grid1 land."),{vars:[{name:"is_sub",value:isSub}]});if(isSub){count++;push(23,tr(`count += 1 → ${count}`,`count += 1 → ${count}`),tr("Xác nhận thêm một sub-island.","Confirm one more sub-island."),{vars:[{name:"count",value:count}]});}}}
  push(24,tr(`return ${count}`,`return ${count}`),tr("Trả về tổng số sub-islands.","Return the total sub-island count."),{final:true,vars:[{name:"answer",value:count}]});return{original,answer:count,steps};
}

const problems = {
  733: {
    id: 733, difficulty: "easy", slug: "flood-fill",
    category: { key: "dfs", vi: "DFS", en: "DFS" }, tags: [floodFillTag],
    title: tr("Flood Fill", "Flood Fill"), titleVi: tr("Tô màu một vùng liên thông", "Recolor a connected region"),
    statement: tr("Bắt đầu tại (start_row, start_col), đổi màu toàn bộ vùng 4 hướng có cùng màu ban đầu thành color.", "Starting at (start_row, start_col), recolor the entire 4-connected region sharing its original color."),
    defaultInput: "1,1,1|1,1,0|1,0,1", inputKind: "string",
    inputLabel: tr("Image (hàng cách '|')", "Image (rows separated by '|')"),
    extraParams: [
      { key: "start_row", label: tr("start_row", "start_row"), default: 1 },
      { key: "start_col", label: tr("start_col", "start_col"), default: 1 },
      { key: "color", label: tr("color mới", "new color"), default: 2 },
    ],
    approach: [tr("Lưu màu ban đầu; nếu đã bằng màu mới thì trả ngay.", "Store the original color; return immediately if it already equals the new color."),tr("Tô ô trước khi đưa vào stack để không thêm trùng.", "Recolor a cell before pushing it to prevent duplicates."),tr("DFS stack lan sang bốn neighbor còn mang màu ban đầu.", "The DFS stack expands to four neighbors still carrying the original color.")],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: tr("Mỗi ô trong component được push tối đa một lần.", "Each component cell is pushed at most once.") },
    code: [
      "from typing import List", "", "class Solution:",
      "    def floodFill(self, image: List[List[int]], start_row: int, start_col: int, color: int) -> List[List[int]]:",
      "        rows, cols = len(image), len(image[0])",
      "        original_color = image[start_row][start_col]",
      "        if original_color == color: return image",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        stack = [(start_row, start_col)]",
      "        image[start_row][start_col] = color",
      "        while stack:",
      "            row, col = stack.pop()",
      "            for delta_row, delta_col in directions:",
      "                next_row, next_col = row + delta_row, col + delta_col",
      "                if 0 <= next_row < rows and 0 <= next_col < cols and image[next_row][next_col] == original_color:",
      "                    image[next_row][next_col] = color",
      "                    stack.append((next_row, next_col))",
      "        return image",
    ], builder: buildSteps733,
  },
  200: {
    id: 200, difficulty: "medium", slug: "number-of-islands",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" }, tags: [floodFillTag],
    title: tr("Number of Islands", "Number of Islands"), titleVi: tr("Đếm số đảo bằng flood fill", "Count islands with flood fill"),
    statement: tr("Đếm số component đất '1' nối nhau theo bốn hướng trong grid.", "Count four-directionally connected components of land '1' in the grid."),
    defaultInput: "11000|11000|00100|00011", inputKind: "string", inputLabel: tr("Grid 0/1 (hàng cách '|')", "0/1 grid (rows separated by '|')"),
    approach: [tr("Quét grid; mỗi ô đất chưa thăm bắt đầu một đảo mới.", "Scan the grid; each unvisited land cell starts a new island."),tr("Đổi đất thành nước ngay khi phát hiện để đánh dấu visited.", "Turn land into water immediately when discovered to mark it visited."),tr("Flood fill toàn bộ đảo trước khi tiếp tục scan.", "Flood-fill the entire island before continuing the scan.")],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: tr("Mỗi ô đất vào stack tối đa một lần.", "Each land cell enters the stack at most once.") },
    code: [
      "from typing import List", "", "class Solution:",
      "    def numIslands(self, grid: List[List[str]]) -> int:",
      "        rows, cols = len(grid), len(grid[0])",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        islands = 0",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid[row][col] != '1': continue",
      "                islands += 1",
      "                stack = [(row, col)]",
      "                grid[row][col] = '0'",
      "                while stack:",
      "                    current_row, current_col = stack.pop()",
      "                    for delta_row, delta_col in directions:",
      "                        next_row, next_col = current_row + delta_row, current_col + delta_col",
      "                        if 0 <= next_row < rows and 0 <= next_col < cols and grid[next_row][next_col] == '1':",
      "                            grid[next_row][next_col] = '0'",
      "                            stack.append((next_row, next_col))",
      "        return islands",
    ], builder: buildSteps200Detailed,
  },
  695: {
    id: 695, difficulty: "medium", slug: "max-area-of-island",
    category: { key: "dfs", vi: "DFS", en: "DFS" }, tags: [floodFillTag],
    title: tr("Max Area of Island", "Max Area of Island"), titleVi: tr("Diện tích đảo lớn nhất", "Largest island area"),
    statement: tr("Trả về số ô đất trong đảo 4 hướng lớn nhất, hoặc 0 nếu không có đất.", "Return the number of land cells in the largest 4-connected island, or 0 if there is no land."),
    defaultInput: "00100|01110|00100|00011", inputKind: "string", inputLabel: tr("Grid 0/1 (hàng cách '|')", "0/1 grid (rows separated by '|')"),
    approach: [tr("Mỗi ô đất chưa thăm bắt đầu một flood fill.", "Each unvisited land cell starts a flood fill."),tr("Mỗi ô pop khỏi stack làm area += 1.", "Each cell popped from the stack increments area."),tr("Sau mỗi đảo, cập nhật max_area.", "After each island, update max_area.")],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: tr("Mỗi ô đất được xử lý tối đa một lần.", "Each land cell is processed at most once.") },
    code: [
      "from typing import List", "", "class Solution:",
      "    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:",
      "        rows, cols = len(grid), len(grid[0])",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        max_area = 0",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid[row][col] != 1: continue",
      "                stack = [(row, col)]",
      "                grid[row][col] = 0",
      "                area = 0",
      "                while stack:",
      "                    current_row, current_col = stack.pop()",
      "                    area += 1",
      "                    for delta_row, delta_col in directions:",
      "                        next_row, next_col = current_row + delta_row, current_col + delta_col",
      "                        if 0 <= next_row < rows and 0 <= next_col < cols and grid[next_row][next_col] == 1:",
      "                            grid[next_row][next_col] = 0",
      "                            stack.append((next_row, next_col))",
      "                max_area = max(max_area, area)",
      "        return max_area",
    ], builder: buildSteps695Detailed,
  },
  1905: {
    id: 1905, difficulty: "medium", slug: "count-sub-islands",
    category: { key: "dfs", vi: "DFS", en: "DFS" }, tags: [floodFillTag],
    title: tr("Count Sub Islands", "Count Sub Islands"), titleVi: tr("Đếm đảo con của grid1", "Count grid2 islands contained in grid1"),
    statement: tr("Đếm các đảo trong grid2 mà mọi ô đất đều nằm trên ô đất của grid1. Nhập grid1;grid2.", "Count grid2 islands whose every land cell lies on grid1 land. Enter grid1;grid2."),
    defaultInput: "1,1,1,0,0|0,1,1,1,1|0,0,0,0,0|1,0,0,0,0|1,1,0,1,1;1,1,1,0,0|0,0,1,1,1|0,1,0,0,0|1,0,1,1,0|0,1,0,1,0",
    inputKind: "string", inputLabel: tr("grid1;grid2 (hàng cách '|')", "grid1;grid2 (rows separated by '|')"),
    approach: [tr("Flood fill từng đảo chưa thăm trong grid2.", "Flood-fill each unvisited island in grid2."),tr("is_sub bắt đầu True và thành False nếu bất kỳ ô nào nằm trên nước grid1.", "is_sub starts True and becomes False if any cell lies over grid1 water."),tr("Chỉ tăng count sau khi đã duyệt toàn bộ đảo.", "Increment count only after traversing the entire island.")],
    complexity: { time: "O(rows·cols)", space: "O(rows·cols)", note: tr("Mỗi ô grid2 được xử lý tối đa một lần.", "Each grid2 cell is processed at most once.") },
    code: [
      "from typing import List", "", "class Solution:",
      "    def countSubIslands(self, grid1: List[List[int]], grid2: List[List[int]]) -> int:",
      "        rows, cols = len(grid1), len(grid1[0])",
      "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
      "        count = 0",
      "        for row in range(rows):",
      "            for col in range(cols):",
      "                if grid2[row][col] != 1: continue",
      "                stack = [(row, col)]",
      "                grid2[row][col] = 0",
      "                is_sub = True",
      "                while stack:",
      "                    current_row, current_col = stack.pop()",
      "                    if grid1[current_row][current_col] == 0: is_sub = False",
      "                    for delta_row, delta_col in directions:",
      "                        next_row, next_col = current_row + delta_row, current_col + delta_col",
      "                        if 0 <= next_row < rows and 0 <= next_col < cols and grid2[next_row][next_col] == 1:",
      "                            grid2[next_row][next_col] = 0",
      "                            stack.append((next_row, next_col))",
      "                if is_sub:",
      "                    count += 1",
      "        return count",
    ], builder: buildSteps1905,
  },
};

module.exports = problems;
