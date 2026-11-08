'use strict';

const base = require('./graph')[1519];
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const clone = value => JSON.parse(JSON.stringify(value));
const CODE = `from typing import List

class Solution:
    def countSubTrees(self, n: int, edges: List[List[int]], labels: str) -> List[int]:
        graph = [[] for _ in range(n)]
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)
        answer = [0] * n

        def dfs(node: int, parent: int) -> List[int]:
            count = [0] * 26
            for child in graph[node]:
                if child == parent:
                    continue
                child_count = dfs(child, node)
                for i in range(26):
                    count[i] += child_count[i]
            index = ord(labels[node]) - ord('a')
            count[index] += 1
            answer[node] = count[index]
            return count

        dfs(0, -1)
        return answer`.split('\n');

function parse(input, params = {}) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new TypeError('Parameters must be an object');
  const raw = Array.isArray(input) && input.length === 1 ? input[0] : input;
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' && /^\d+$/.test(raw.trim()) ? Number(raw) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new RangeError('n must be an integer from 1 to 12');
  let edges = params.edges === undefined ? base.extraParams[0].default : params.edges;
  try { if (typeof edges === 'string') edges = JSON.parse(edges); }
  catch { throw new RangeError('edges must be a JSON array of pairs'); }
  if (!Array.isArray(edges) || edges.length !== n - 1 || !Array.from(edges).every(edge =>
    Array.isArray(edge) && edge.length === 2 && Array.from(edge).every(node => Number.isInteger(node) && node >= 0 && node < n)
      && edge[0] !== edge[1])) throw new RangeError('edges must contain n − 1 valid non-self pairs with node IDs in 0…n−1');
  edges = edges.map(edge => [...edge]);
  const unique = new Set(edges.map(([u,v]) => [Math.min(u,v),Math.max(u,v)].join(',')));
  if (unique.size !== edges.length) throw new RangeError('edges must not contain duplicate undirected edges');
  const graph = Array.from({ length:n }, () => []);
  for (const [u,v] of edges) { graph[u].push(v); graph[v].push(u); }
  const order = [0], seen = new Set(order), parent = Array(n).fill(-1), depth = Array(n).fill(0);
  const children = Array.from({ length:n }, () => []);
  for (let head = 0; head < order.length; head++) for (const child of graph[order[head]]) {
    if (seen.has(child)) continue;
    seen.add(child); parent[child] = order[head]; depth[child] = depth[order[head]] + 1;
    children[order[head]].push(child); order.push(child);
  }
  if (seen.size !== n) throw new RangeError('edges must form one connected tree rooted at 0');
  const labels = params.labels === undefined ? base.extraParams[1].default : params.labels;
  if (typeof labels !== 'string' || labels.length !== n || !/^[a-z]+$/.test(labels)) {
    throw new RangeError('labels must contain exactly n lowercase letters a–z');
  }
  let leaf = 0;
  const positions = Array(n), descendants = Array(n);
  const layout = node => {
    const xs = children[node].map(layout);
    const x = xs.length ? (xs[0] + xs.at(-1)) / 2 : leaf++;
    positions[node] = x;
    descendants[node] = [node, ...children[node].flatMap(child => descendants[child])];
    return x;
  };
  layout(0);
  const width = Math.max(350, leaf * 84 + 48), height = 120 + Math.max(...depth) * 90;
  const nodes = Array.from({length:n}, (_,id) => ({ id, label:labels[id], parent:parent[id], depth:depth[id],
    children:children[id], descendants:descendants[id], x:leaf === 1 ? width / 2 : 66 + positions[id] * 84, y:44 + depth[id] * 90 }));
  return { n, edges, labels, nodes, width, height, args:[n,edges,labels] };
}

function build(input, params) {
  const parsed = parse(input, params), {n,edges,labels,nodes,width,height} = parsed;
  const trace = runTrace({ code:CODE.join('\n'), method:'countSubTrees', args:parsed.args });
  const entered = new Set(), completed = new Set(), calls = new Map(), returned = new Map(), merges = new Map();
  // Witness IDs follow only real additions. They explain each frequency, including partially merged tables.
  const witnesses = Array.from({length:n}, () => Array.from({length:26}, () => new Set()));
  const ledger = [], checks = new Map(), previousCounts = new Map();
  const steps = trace.events.map((record, step) => {
    const x = record.locals, text = CODE[record.line - 1].trim(), inDfs = record.scope === 'dfs';
    const current = inDfs ? x.node : null, dfsFrames = record.frames.filter(f => f.name === 'dfs');
    const final = record.scope === 'countSubTrees' && record.returning;
    let change = null;
    if (inDfs && text === 'count = [0] * 26') {
      entered.add(current); calls.set(current, { node:current, parent:x.parent, enterStep:step, answerStep:null, returnStep:null });
      change = {kind:'enter',node:current};
    }
    if (inDfs && text === 'for child in graph[node]:') {
      checks.delete(current);
      if (record.branch) merges.delete(current);
    }
    if (inDfs && text === 'if child == parent:') checks.set(current,{child:x.child,parent:x.parent,skip:record.branch});
    if (inDfs && text === 'child_count = dfs(child, node)') {
      merges.set(current, { parent:current, child:x.child, childCount:x.child_count, cursor:null, progress:0, before:null, after:null });
      change = {kind:'receive',parent:current,child:x.child};
    }
    if (inDfs && text === 'for i in range(26):') {
      const merge = merges.get(current);
      merge.cursor = record.branch ? x.i : null;
      merge.before = record.branch ? x.count[x.i] : null;
      merge.after = null;
    }
    if (inDfs && text === 'count[i] += child_count[i]') {
      const merge = merges.get(current), before = previousCounts.get(current)[x.i];
      for (const id of witnesses[x.child][x.i]) witnesses[current][x.i].add(id);
      Object.assign(merge,{cursor:x.i,progress:x.i+1,before,after:x.count[x.i]});
      change = {kind:'merge',parent:current,child:x.child,index:x.i,letter:String.fromCharCode(97+x.i),before,addend:x.child_count[x.i],after:x.count[x.i]};
    }
    if (inDfs && text === 'count[index] += 1') {
      witnesses[current][x.index].add(current);
      change = {kind:'self',node:current,index:x.index,letter:labels[current],before:previousCounts.get(current)[x.index],after:x.count[x.index]};
    }
    if (inDfs && text === 'answer[node] = count[index]') {
      completed.add(current); calls.get(current).answerStep = step;
      ledger.push({node:current,label:labels[current],count:x.answer[current],matches:[...witnesses[current][x.index]],step});
      change = {kind:'answer',node:current,value:x.answer[current]};
    }
    if (inDfs && record.returning) {
      returned.set(current,record.returned); calls.get(current).returnStep = step;
      change = {kind:'return',node:current,parent:x.parent,value:record.returned};
    }
    if (!inDfs && text === 'graph[u].append(v)') change = {kind:'edge',from:x.u,to:x.v};
    if (!inDfs && text === 'graph[v].append(u)') change = {kind:'edge',from:x.v,to:x.u};
    const counts = {};
    for (const frame of dfsFrames) if (frame.locals.count) counts[frame.locals.node] = frame.locals.count;
    for (const [node,count] of returned) if (!Object.hasOwn(counts,node)) counts[node] = count;
    const merge = inDfs ? merges.get(current) ?? null : null;
    const focusIndex = inDfs ? merge?.cursor ?? x.index ?? labels.charCodeAt(current)-97 : labels.charCodeAt(0)-97;
    const view = {n,edges,labels,nodes,width,height,current,path:dfsFrames.map(f=>f.locals.node),
      graph:record.outer.graph??null,answer:record.outer.answer??null,counts,entered:[...entered],completed:[...completed],
      calls:clone([...calls.values()]),returns:clone([...returned].map(([node,count])=>({node,count}))),
      witnesses:witnesses.map(row=>row.map(ids=>[...ids])),ledger:clone(ledger),
      merge:clone(merge),childCount:merge?.childCount??null,check:inDfs?checks.get(current)??null:null,
      focusIndex,change,phase:final?'done':inDfs?'dfs':entered.size?'finish':'graph',
      source:{line:record.line,text,timing:'after'},locals:x,outer:record.outer,scope:record.scope,
      frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,trace:trace.trace,
      result:final?trace.answer:null};
    if (inDfs && x.count) previousCounts.set(current,x.count);
    return { arr:[],codeBlock:1,codeLines:[record.line],final,
      title:bi(`L${record.line} · ${text}`,`L${record.line} · ${text}`),note:bi('',''),
      vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),sameLabel1519View:view };
  });
  return {original:{n,edges,labels},answer:trace.answer,steps};
}

module.exports = {1519:{...base,code:CODE,debugMode:'line-by-line',builder:build,
  liveArgs:(input,params)=>parse(input,params).args,
  inputLabel:bi('n · 1–12 nút · cây có gốc 0','n · 1–12 nodes · rooted at 0'),
  statement:bi('Với mỗi nút, đếm các nút cùng nhãn trong cây con của nó, kể cả chính nút đó.',
    'For each node, count equal-label nodes in its subtree, including itself.'),
  approach:[bi('Con trả bảng đếm → cha cộng từng nhãn → cộng chính nó → ghi answer.',
    'Child returns counts → parent merges each label → add itself → write answer.')],
  complexity:{time:'O(26n)',space:'O(26n)',note:bi('Mỗi cạnh gộp đủ 26 nhãn; trace giữ toàn bộ vòng lặp.',
    'Each edge merges all 26 labels; every loop iteration is retained in the trace.')},
  visualizationLimits:{maxNodes:12,completeTrace:true},
}};
