"use strict";
const base = require("./node-sequence-score")[2242], { trace, bi } = require("./picture-trace");
const code = base.code.map((line,index)=>index===3?"        top = {}":index===6?"                top.setdefault(node, []).append(neighbor)":line);
function parse(input, params = {}) { return base.liveArgs(input, { edges: base.extraParams[0].default, ...params }); }
function builder(input, params) {
  const [scores, edges] = parse(input, params), T = trace(2242, code, scores.length <= 10 && edges.length <= 15);
  const l = { self: {}, scores, edges }; let best = null, candidate = null, valid = null;
  const view = () => {
    const ids = T.active ? scores.map((_, i) => i) : [...new Set([...scores.slice(0, 8).map((_, i) => i), ...(best || [])])];
    const visible = new Set(ids);
    const shownEdges = edges.filter(([a,b]) => visible.has(a) && visible.has(b)).slice(0, 25);
    if (best) for (let i = 1; i < best.length; i++) if (!shownEdges.some(([a,b]) => a === best[i-1] && b === best[i] || b === best[i-1] && a === best[i])) shownEdges.push([best[i-1], best[i]]);
    return { total: scores.length, edgeTotal: edges.length, nodes: ids.map(id => ({ id, value: scores[id] })), edges: shownEdges,
      top: l.top ? ids.filter(id => Object.hasOwn(l.top, id)).map(id => ({ id, neighbors: [...l.top[id]] })) : [], middle: l.b === undefined ? null : [l.b,l.c], candidate, valid,
      totalScore: candidate && valid && (lastLine === 17 || lastLine === 18) ? l.total : null, answer: l.answer ?? null, best };
  };
  let lastLine = 0;
  const E = (line, event) => { lastLine = line; T.emit(line, event, l, view); };
  l.n = scores.length; E(3, "n"); l.top = {}; E(4, "top-3");
  for (const [u,v] of edges) {
    l.u=u; l.v=v; E(5,"edge");
    for (const [node,neighbor] of [[u,v],[v,u]]) {
      l.node=node; l.neighbor=neighbor; E(6,"direction"); (l.top[node] ??= []).push(neighbor); E(7,"append");
      l.top[node].sort((a,b)=>scores[b]-scores[a] || a-b); E(8,"sort");
      E(9,l.top[node].length>3 ? "True" : "False"); if(l.top[node].length>3) { l.top[node].pop(); E(10,"trim"); }
    }
    E(6,"loop end");
  }
  E(5,"loop end"); l.answer=-1; E(11,"answer = -1");
  for (const [b,c] of edges) {
    l.b=b; l.c=c; candidate=null; valid=null; E(12,"middle edge");
    for (const a of l.top[b]) {
      l.a=a; candidate=null; valid=null; E(13,"left neighbor");
      for (const d of l.top[c]) {
        l.d=d; candidate=[a,b,c,d]; valid=null; E(14,"right neighbor");
        const repeated=a===c || d===b || a===d; valid=!repeated; E(15,repeated ? "repeated node" : "4 distinct nodes");
        if(repeated) { E(16,"continue"); continue; }
        l.total=scores[a]+scores[b]+scores[c]+scores[d]; E(17,"sum");
        if(l.total>l.answer) best=[...candidate]; l.answer=Math.max(l.answer,l.total); E(18,"max");
      }
      candidate=null; valid=null; E(14,"loop end");
    }
    E(13,"loop end");
  }
  candidate=null; valid=null; E(12,"loop end"); E(19,"return"); return T.finish(l.answer,view,scores);
}
module.exports = { 2242: { ...base, code, builder, liveArgs: parse, debugMode: "line-by-line",
  approach: [bi("a — b — c — d: 4 index khác nhau.", "a — b — c — d: four distinct indices."),bi("Mỗi đầu chỉ giữ 3 hàng xóm điểm cao nhất.", "Keep the three highest-scoring neighbors of each node.")],
  complexity: { ...base.complexity, note: bi("Debug ≤10 đỉnh và ≤15 cạnh; đồ thị lớn tính đủ, hình xem trước kèm đường tốt nhất.", "Line debug ≤10 nodes and ≤15 edges; larger graphs are fully solved, with a preview and the best path.") }
} };
