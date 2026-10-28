"use strict";

// Each snapshot describes the state AFTER its highlighted Python line.
const bi = (vi, en) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));
const CODE = {
  1136: `from collections import deque
class Solution:
    def minimumSemesters(self, n, relations):
        graph = list([] for _ in range(n + 1))
        indegree = [0] * (n + 1)
        for u, v in relations:
            graph[u].append(v)
            indegree[v] += 1
        queue = deque(i for i in range(1, n + 1) if indegree[i] == 0)
        semester, count = 0, 0
        while queue:
            size = len(queue)
            semester += 1
            for _ in range(size):
                u = queue.popleft()
                count += 1
                for v in graph[u]:
                    indegree[v] -= 1
                    if indegree[v] == 0:
                        queue.append(v)
        return semester if count == n else -1`,
  2371: `class Solution:
    def minScore(self, grid):
        rows, cols = len(grid), len(grid[0])
        cells = sorted((grid[r][c], r, c) for r in range(rows) for c in range(cols))
        row_max = [0] * rows
        col_max = [0] * cols
        result = list([0] * cols for _ in range(rows))
        for value, r, c in cells:
            rank = 1 + max(row_max[r], col_max[c])
            result[r][c] = rank
            row_max[r] = rank
            col_max[c] = rank
        return result`,
  3530: `class Solution:
    def maxProfit(self, n, edges, score):
        pre = [0] * n
        for u, v in edges:
            pre[v] |= 1 << u
        dp = [-1] * (1 << n)
        path = list([] for _ in range(1 << n))
        dp[0] = 0
        for mask in range(1 << n):
            if dp[mask] < 0:
                continue
            pos = mask.bit_count() + 1
            for v in range(n):
                if mask & (1 << v) or (mask & pre[v]) != pre[v]:
                    continue
                nxt = mask | (1 << v)
                candidate = dp[mask] + pos * score[v]
                if candidate > dp[nxt]:
                    dp[nxt] = candidate
                    path[nxt] = path[mask] + [v]
        return dp[-1]`,
  3812: `class Solution:
    def minimumFlips(self, n, edges, start, target):
        graph = list([] for _ in range(n))
        for i, (u, v) in enumerate(edges):
            graph[u].append((v, i))
            graph[v].append((u, i))
        need = list(int(a) ^ int(b) for a, b in zip(start, target))
        answer = []
        def dfs(u, parent):
            for v, i in graph[u]:
                if v == parent:
                    continue
                dfs(v, u)
                if need[v]:
                    answer.append(i)
                    need[u], need[v] = need[u] ^ 1, need[v] ^ 1
        dfs(0, -1)
        if need[0]:
            return [-1]
        return sorted(answer)`,
  3620: `from collections import deque
class Solution:
    def findMaxPathScore(self, edges, online, k):
        n = len(online)
        graph = list([] for _ in range(n))
        indeg = [0] * n
        for u, v, c in edges:
            graph[u].append((v, c))
            indeg[v] += 1
        queue = deque(i for i in range(n) if indeg[i] == 0)
        topo = []
        while queue:
            u = queue.popleft()
            topo.append(u)
            for v, _ in graph[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    queue.append(v)
        def feasible(score):
            INF = 10 ** 18
            dist = [INF] * n
            dist[0] = 0
            for u in topo:
                if dist[u] == INF or not online[u]:
                    continue
                for v, c in graph[u]:
                    if c >= score and online[v]:
                        dist[v] = min(dist[v], dist[u] + c)
            return dist[n - 1] <= k
        vals = sorted(set(c for _, _, c in edges))
        ans, lo, hi = -1, 0, len(vals) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if feasible(vals[mid]):
                ans = vals[mid]
                lo = mid + 1
            else:
                hi = mid - 1
        return ans`,
};
for (const id of Object.keys(CODE)) CODE[id] = CODE[id].split('\n');

function recorder(id, initial, project) {
  const steps = []; let frame = 0, omitted = 0;
  function emit(line, locals, event = '', extra = {}, scope = 'main', final = false) {
    frame++;
    if (steps.length >= 6000 && !final) { omitted++; return; }
    const state = copy(locals);
    const view = copy({ id, frame, event, ...initial, ...project(), ...extra, omitted });
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final,
      title: bi(final ? 'Kết quả' : `Dòng ${line}`, final ? 'Result' : `Line ${line}`), note: bi('', ''),
      source: { line, text: CODE[id][line - 1], scope }, locals: state,
      vars: Object.entries(state).map(([name, value]) => ({ name, value })), topologyLessonView: view });
  }
  return { steps, emit };
}
function integer(value, min, max, name) {
  const x = Number(value); if (!Number.isSafeInteger(x) || x < min || x > max) throw new RangeError(`${name}: ${min}–${max}.`); return x;
}
function json(value, name) {
  if (Array.isArray(value)) return copy(value);
  try { return JSON.parse(value); } catch (_) { throw new RangeError(`${name}: JSON không hợp lệ / invalid JSON.`); }
}
function edgesInput(input, n, weighted = false, oneBased = false) {
  const text = String(input ?? '').trim();
  const edges = Array.isArray(input) ? copy(input) : !text ? [] : text.startsWith('[') ? json(text, 'edges') : text.split(/[,;\n]+/).map(s => s.trim().split(/\s*-\s*/).map(Number));
  const min = oneBased ? 1 : 0, max = oneBased ? n : n - 1;
  if (!Array.isArray(edges) || edges.length > 30 || edges.some(e => !Array.isArray(e) || e.length !== (weighted ? 3 : 2) || e.some(x => !Number.isSafeInteger(x)) || e[0] < min || e[0] > max || e[1] < min || e[1] > max || e[0] === e[1] || weighted && (e[2] < 0 || e[2] > 1e9)) || new Set(edges.map(e => `${e[0]},${e[1]}`)).size !== edges.length)
    throw new RangeError(`edges: tối đa 30 cạnh, đỉnh ${min}–${max}, không trùng / up to 30 unique edges.`);
  return edges;
}
function dag(n, edges) {
  const indeg = Array(n).fill(0), graph = Array.from({ length: n }, () => []), queue = [];
  edges.forEach(([u, v]) => { graph[u].push(v); indeg[v]++; });
  indeg.forEach((d, u) => { if (!d) queue.push(u); });
  for (let i = 0; i < queue.length; i++) for (const v of graph[queue[i]]) if (!--indeg[v]) queue.push(v);
  if (queue.length !== n) throw new RangeError('Cần DAG, không có chu trình / DAG required.');
}

function parse1136(input, p = {}) { const n = integer(p.n ?? 3, 1, 12, 'n'); return [n, edgesInput(input, n, false, true)]; }
function build1136(input, p) {
  const [n, relations] = parse1136(input, p), s = { n, relations }, terms = [];
  const { steps, emit: record } = recorder(1136, { n, edges: relations }, () => ({ terms, queue: s.queue ?? [], indegree: s.indegree ?? [], current: s.u ?? null, answer: s.count === n ? s.semester : -1 }));
  const emit = (line, event, final = false) => record(line, s, event, {}, 'minimumSemesters', final);
  s.graph = Array.from({ length: n + 1 }, () => []); emit(4);
  s.indegree = Array(n + 1).fill(0); emit(5);
  for (const [u, v] of relations) { Object.assign(s, { u, v }); emit(6); s.graph[u].push(v); emit(7); s.indegree[v]++; emit(8); } emit(6);
  s.queue = Array.from({ length: n }, (_, i) => i + 1).filter(i => !s.indegree[i]); emit(9);
  s.semester = 0; s.count = 0; emit(10);
  while (s.queue.length) {
    emit(11); s.size = s.queue.length; emit(12); s.semester++; terms.push([]); emit(13);
    for (let i = 0; i < s.size; i++) {
      s._ = i; emit(14); s.u = s.queue.shift(); terms.at(-1).push(s.u); emit(15, 'take'); s.count++; emit(16);
      for (const v of s.graph[s.u]) { s.v = v; emit(17); s.indegree[v]--; emit(18, 'unlock'); emit(19); if (!s.indegree[v]) { s.queue.push(v); emit(20, 'enqueue'); } } emit(17);
    } emit(14);
  } emit(11); emit(21, 'result', true);
  return { original: relations, n, answer: s.count === n ? s.semester : -1, steps };
}

function parse2371(input) {
  const grid = json(input, 'grid');
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 5 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 5 || grid.some(row => !Array.isArray(row) || row.length !== grid[0].length || row.some(x => !Number.isSafeInteger(x) || x < 1 || x > 1e9)) || new Set(grid.flat()).size !== grid.flat().length)
    throw new RangeError('grid: 1–5 hàng/cột, số nguyên dương khác nhau / 1–5 rows/columns, distinct positive integers.');
  return [grid];
}
function build2371(input) {
  const [grid] = parse2371(input), s = { grid }; let before = null;
  const { steps, emit: record } = recorder(2371, { grid }, () => ({ result: s.result ?? [], cells: s.cells ?? [], current: s.r === undefined ? null : [s.r, s.c], rowMax: s.row_max ?? [], colMax: s.col_max ?? [], rank: s.rank ?? null, before }));
  const emit = (line, event, final = false) => record(line, s, event, {}, 'minScore', final);
  s.rows = grid.length; s.cols = grid[0].length; emit(3);
  s.cells = grid.flatMap((row, r) => row.map((v, c) => [v, r, c])).sort((a, b) => a[0] - b[0]); emit(4);
  s.row_max = Array(s.rows).fill(0); emit(5); s.col_max = Array(s.cols).fill(0); emit(6); s.result = grid.map(row => row.map(() => 0)); emit(7);
  for (const [value, r, c] of s.cells) {
    Object.assign(s, { value, r, c }); before = [s.row_max[r], s.col_max[c]]; emit(8, 'cell');
    s.rank = 1 + Math.max(...before); emit(9, 'rank'); s.result[r][c] = s.rank; emit(10, 'write'); s.row_max[r] = s.rank; emit(11); s.col_max[c] = s.rank; emit(12);
  } emit(8); emit(13, 'result', true); return { original: grid, answer: s.result, steps };
}

function parse3530(input, p = {}) {
  let score; try { score = Array.isArray(p.score) ? copy(p.score) : JSON.parse(p.score ?? '[1,6,3]'); } catch (_) { score = String(p.score).split(',').map(Number); }
  if (!Array.isArray(score) || score.length < 1 || score.length > 8 || score.some(x => !Number.isSafeInteger(x) || x < 1 || x > 1e5)) throw new RangeError('score: 1–8 số nguyên, 1–100000 / 1–8 integers.');
  const n = score.length, edges = edgesInput(input, n); dag(n, edges); return [n, edges, score];
}
function build3530(input, p) {
  const [n, edges, score] = parse3530(input, p), s = { n, edges, score };
  const { steps, emit: record } = recorder(3530, { n, edges, score }, () => ({ mask: s.mask ?? 0, node: s.v ?? null, pre: s.pre ?? [], dp: s.dp ?? [], path: { [s.mask ?? 0]: s.path?.[s.mask ?? 0] ?? [], [(1 << n) - 1]: s.path?.at(-1) ?? [] }, pos: s.pos ?? null, next: s.nxt ?? null, candidate: s.candidate ?? null }));
  const emit = (line, event, final = false) => record(line, s, event, {}, 'maxProfit', final);
  s.pre = Array(n).fill(0); emit(3); for (const [u, v] of edges) { Object.assign(s, { u, v }); emit(4); s.pre[v] |= 1 << u; emit(5); } emit(4);
  s.dp = Array(1 << n).fill(-1); emit(6); s.path = Array.from({ length: 1 << n }, () => []); emit(7); s.dp[0] = 0; emit(8);
  for (s.mask = 0; s.mask < 1 << n; s.mask++) {
    emit(9); emit(10); if (s.dp[s.mask] < 0) { emit(11); continue; }
    s.pos = s.mask.toString(2).split('1').length; emit(12);
    for (s.v = 0; s.v < n; s.v++) {
      emit(13); const blocked = (s.mask & 1 << s.v) || (s.mask & s.pre[s.v]) !== s.pre[s.v]; emit(14);
      if (blocked) { emit(15); continue; }
      s.nxt = s.mask | 1 << s.v; emit(16); s.candidate = s.dp[s.mask] + s.pos * score[s.v]; emit(17, 'candidate'); emit(18);
      if (s.candidate > s.dp[s.nxt]) { s.dp[s.nxt] = s.candidate; emit(19, 'improve'); s.path[s.nxt] = [...s.path[s.mask], s.v]; emit(20, 'path'); }
    } s.v = n - 1; emit(13);
  } s.mask = (1 << n) - 1; emit(9); emit(21, 'result', true);
  return { original: edges, n, answer: s.dp.at(-1), steps };
}

function parse3812(input, p = {}) {
  const start = String(p.start ?? '0011000'), target = String(p.target ?? '0010001'), n = start.length;
  if (n < 2 || n > 12 || !/^[01]+$/.test(start) || !/^[01]+$/.test(target) || target.length !== n) throw new RangeError('start/target: cùng độ dài 2–12, chỉ gồm 0/1 / equal length 2–12 binary strings.');
  const edges = edgesInput(input, n), seen = new Set([0]);
  if (edges.length !== n - 1) throw new RangeError('Cây cần n−1 cạnh / a tree needs n−1 edges.');
  for (let i = 0; i < n; i++) for (const [u, v] of edges) { if (seen.has(u)) seen.add(v); if (seen.has(v)) seen.add(u); }
  if (seen.size !== n || new Set(edges.map(([u,v]) => [u,v].sort((a,b)=>a-b).join(','))).size !== edges.length) throw new RangeError('edges phải tạo thành cây / edges must form a tree.');
  return [n, edges, start, target];
}
function build3812(input, p) {
  const [n, edges, start, target] = parse3812(input, p), s = { n, edges, start, target }, stack = [];
  const { steps, emit: record } = recorder(3812, { n, edges, start, target }, () => ({ need: s.need ?? [], chosen: s.answer ?? [], stack, current: stack.at(-1)?.u ?? null }));
  const emit = (line, event, final = false) => { const f = stack.at(-1); record(line, f ? { ...f, graph: s.graph, need: s.need, answer: s.answer } : s, event, {}, f ? 'dfs' : 'minimumFlips', final); };
  s.graph = Array.from({ length: n }, () => []); emit(3);
  for (let i = 0; i < edges.length; i++) { s.i = i; [s.u, s.v] = edges[i]; emit(4); s.graph[s.u].push([s.v, i]); emit(5); s.graph[s.v].push([s.u, i]); emit(6); } emit(4);
  s.need = [...start].map((a, i) => Number(a) ^ Number(target[i])); emit(7); s.answer = []; emit(8); emit(9);
  function dfs(u, parent) {
    const f = { u, parent }; stack.push(f);
    for (const [v, i] of s.graph[u]) {
      Object.assign(f, { v, i }); emit(10); emit(11); if (v === parent) { emit(12); continue; }
      dfs(v, u); emit(13, 'return-child'); emit(14);
      if (s.need[v]) { s.answer.push(i); emit(15, 'choose'); s.need[u] ^= 1; s.need[v] ^= 1; emit(16, 'flip'); }
    } emit(10); stack.pop();
  }
  dfs(0, -1); emit(17); emit(18); const answer = s.need[0] ? [-1] : [...s.answer].sort((a, b) => a - b); emit(s.need[0] ? 19 : 20, 'result', true);
  return { original: edges, n, answer, steps };
}

function parse3620(input, p = {}) {
  const n = integer(p.n ?? 5, 2, 9, 'n'), edges = edgesInput(input, n, true); dag(n, edges);
  const raw = Array.isArray(p.online) ? p.online : String(p.online ?? 'true,true,true,false,true').replace(/[\[\]]/g, '').split(',').map(x => x.trim());
  if (raw.length !== n || raw.some(x => ![true, false, 1, 0, 'true', 'false', '1', '0'].includes(x))) throw new RangeError('online: cần n giá trị true/false / n boolean values required.');
  const online = raw.map(x => [true, 1, 'true', '1'].includes(x)), k = integer(p.k ?? 12, 0, 5e13, 'k');
  if (!online[0] || !online[n - 1]) throw new RangeError('0 và n−1 phải online / endpoints must be online.');
  return [edges, online, k];
}
function build3620(input, p) {
  const [edges, online, k] = parse3620(input, p), s = { edges, online, k }, stack = []; let probe = null, feasibleResult = null, witness = null, lastDist = [];
  const { steps, emit: record } = recorder(3620, { n: online.length, edges, online, k }, () => ({ topo: s.topo ?? [], queue: s.queue ?? [], vals: s.vals ?? [], lo: s.lo ?? null, hi: s.hi ?? null, mid: s.mid ?? null, ans: s.ans ?? -1, probe, feasibleResult, witness, dist: stack.at(-1)?.dist ?? lastDist, current: stack.at(-1)?.u ?? s.u ?? null, edge: stack.at(-1)?.v === undefined ? null : [stack.at(-1).u, stack.at(-1).v] }));
  const emit = (line, event, final = false) => { const f = stack.at(-1); record(line, f ? { ...f, graph: s.graph, k, n: s.n, online, topo: s.topo } : s, event, {}, f ? 'feasible' : 'findMaxPathScore', final); };
  s.n = online.length; emit(4); s.graph = Array.from({ length: s.n }, () => []); emit(5); s.indeg = Array(s.n).fill(0); emit(6);
  for (const [u,v,c] of edges) { Object.assign(s,{u,v,c}); emit(7); s.graph[u].push([v,c]); emit(8); s.indeg[v]++; emit(9); } emit(7);
  s.queue = Array.from({length:s.n},(_,i)=>i).filter(i=>!s.indeg[i]); emit(10); s.topo = []; emit(11);
  while(s.queue.length) { emit(12); s.u=s.queue.shift(); emit(13); s.topo.push(s.u); emit(14); for(const [v,c] of s.graph[s.u]) { s.v=v;s._=c;emit(15);s.indeg[v]--;emit(16);emit(17);if(!s.indeg[v]){s.queue.push(v);emit(18);} }emit(15); }emit(12);emit(19);
  function feasible(score) {
    const f={score}; stack.push(f); probe=score; feasibleResult=null;
    f.INF=1e18;emit(20);f.dist=Array(s.n).fill(f.INF);emit(21);f.dist[0]=0;emit(22);
    for(const u of s.topo) {f.u=u;emit(23);const skip=f.dist[u]===f.INF||!online[u];emit(24);if(skip){emit(25);continue;}
      for(const [v,c] of s.graph[u]){Object.assign(f,{v,c});emit(26);emit(27);if(c>=score&&online[v]){f.dist[v]=Math.min(f.dist[v],f.dist[u]+c);emit(28,'relax');}}emit(26);
    }emit(23);const ok=f.dist[s.n-1]<=k; feasibleResult=ok;lastDist=[...f.dist];emit(29,'check-budget');stack.pop();return ok;
  }
  s.vals=[...new Set(edges.map(e=>e[2]))].sort((a,b)=>a-b);emit(30);Object.assign(s,{ans:-1,lo:0,hi:s.vals.length-1});emit(31);
  while(s.lo<=s.hi){emit(32);s.mid=Math.floor((s.lo+s.hi)/2);emit(33);const ok=feasible(s.vals[s.mid]);emit(34);if(ok){s.ans=s.vals[s.mid];emit(35,'accept');s.lo=s.mid+1;emit(36);}else{s.hi=s.mid-1;emit(38,'reject');}}emit(32);
  // A final witness is presentation data, separate from the last binary-search probe.
  if(s.ans>=0){const dist=Array(s.n).fill(Infinity),paths=Array.from({length:s.n},()=>[]);dist[0]=0;paths[0]=[0];for(const u of s.topo)if(online[u]&&dist[u]<Infinity)for(const [v,c] of s.graph[u])if(online[v]&&c>=s.ans&&dist[v]>dist[u]+c){dist[v]=dist[u]+c;paths[v]=[...paths[u],v];}witness={path:paths.at(-1),cost:dist.at(-1),score:s.ans};}
  emit(39,'result',true);return{original:edges,n:s.n,answer:s.ans,steps};
}

const param = (key, value, type = 'string') => ({ key, type, label: bi(key, key), default: value });
function problem(id, title, vi, slug, input, params, builder, liveArgs, time, space, statement, approach, difficulty = 'hard') {
  return { id, title: bi(title,title), titleVi: bi(vi,title), slug, difficulty, category: {key:'graph',vi:'Đồ thị',en:'Graph'}, tags:[], inputKind:'string', allowEmptyInput:true, inputLabel:bi(id===2371?'grid — JSON':'edges — JSON hoặc 0-1,1-2',id===2371?'grid — JSON':'edges — JSON or 0-1,1-2'), defaultInput:input, extraParams:params, debugMode:'line-by-line', code:CODE[id], builder, liveArgs,
    statement:bi(...statement), approach:approach.map(([a,b])=>bi(a,b)), complexity:{time,space,note:bi('Giới hạn input minh họa được ghi ở các tham số; code Python dùng được cho input lớn hơn.','Illustration input limits are shown in the parameters; Python code also works for larger inputs.')} };
}
module.exports = {
  1136: {...require('./graph')[1136], code:CODE[1136], builder:build1136, liveArgs:parse1136, debugMode:'line-by-line',allowEmptyInput:true,
    extraParams:[{...param('n',3,'number'),min:1,max:12,label:bi('n · 1–12 môn','n · 1–12 courses')}],
    approach:[bi('Học cùng lúc các môn có indegree = 0.','Study all courses with indegree = 0 together.'),bi('Xóa cạnh → mở khóa môn cho kỳ sau.','Remove edges → unlock courses for the next semester.')]},
  2371: {...problem(2371,'Minimize Maximum Value in a Grid','Thu nhỏ giá trị trong lưới','minimize-maximum-value-in-a-grid','[[3,1],[2,5]]',[],build2371,parse2371,'O(mn log(mn))','O(mn)',
    ['Thay các số bằng số nguyên dương nhỏ nhất, giữ thứ tự lớn/nhỏ trong mỗi hàng và cột. Lưới tối đa 5×5, các số khác nhau.','Replace values with positive integers, preserving order within every row and column. Illustration: up to 5×5, distinct values.'],[['Từ nhỏ → lớn: rank = 1 + max(hàng, cột).','Smallest first: rank = 1 + max(row, column).']]),premium:true},
  3530: problem(3530,'Maximum Profit from Valid Topological Order in DAG','Lợi nhuận từ thứ tự topo','maximum-profit-from-valid-topological-order-in-dag','[[0,1],[0,2]]',[{...param('score','[1,6,3]'),label:bi('score · 1–8 đỉnh','score · 1–8 nodes')}],build3530,parse3530,'O(n · 2ⁿ)','O(n · 2ⁿ)',
    ['Chọn thứ tự topo để tổng score[đỉnh] × vị trí (từ 1) lớn nhất. Minh họa tối đa 8 đỉnh.','Choose a topological order maximizing sum(score[node] × 1-based position). Illustration: up to 8 nodes.'],[['Chỉ thêm đỉnh khi đã chọn đủ tiền nhiệm.','Append a node only after all its prerequisites.' ],['dp[mask] nhớ lợi nhuận lớn nhất của tập đã chọn.','dp[mask] stores the best profit for the selected set.']]),
  3812: problem(3812,'Minimum Edge Toggles on a Tree','Lật ít cạnh nhất trên cây','minimum-edge-toggles-on-a-tree','[[0,1],[1,2],[2,3],[3,4],[3,5],[1,6]]',[{...param('start','0011000'),label:bi('start · 2–12 bit','start · 2–12 bits')},param('target','0010001')],build3812,parse3812,'O(n log n)','O(n)',
    ['Lật một cạnh sẽ đổi cả hai bit ở hai đầu. Trả các chỉ số cạnh tăng dần, ít nhất để start thành target; không thể thì [-1]. Minh họa tối đa 12 đỉnh.','Toggling an edge flips both endpoint bits. Return the fewest edge indices in increasing order, or [-1] if impossible. Illustration: up to 12 nodes.'],[['DFS từ lá: con còn sai → bắt buộc lật cạnh nối cha.','DFS from leaves: a mismatched child forces its parent edge to flip.'],['Gốc còn sai → không có lời giải.','A remaining mismatch at the root means no solution.']],'medium'),
  3620: problem(3620,'Network Recovery Pathways','Đường phục hồi mạng','network-recovery-pathways','0-1-7,1-4-5,0-2-6,2-3-6,3-4-2,2-4-6',[{...param('n',5,'number'),min:2,max:9,label:bi('n · 2–9 đỉnh','n · 2–9 nodes')},param('online','true,true,true,false,true'),param('k',12,'number')],build3620,parse3620,'O((n + m) log m)','O(n + m)',
    ['Đi từ 0 đến n−1 qua các đỉnh online, tổng chi phí ≤ k. Tối đa hóa cạnh nhỏ nhất trên đường đi. Cần DAG; minh họa tối đa 9 đỉnh, 30 cạnh.','Travel from 0 to n−1 through online nodes, total cost ≤ k. Maximize the smallest edge cost on the path. DAG required; illustration up to 9 nodes, 30 edges.'],[['Thử ngưỡng: chỉ giữ cạnh có cost ≥ ngưỡng.','Test a threshold: retain edges with cost ≥ threshold.'],['Đường ngắn nhất trong DAG kiểm tra ngân sách; tìm nhị phân ngưỡng.','DAG shortest paths check the budget; binary-search the threshold.']]),
};
