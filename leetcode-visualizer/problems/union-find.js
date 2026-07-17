// LeetCode Visualizer — Union-Find (Disjoint Set Union) problems.
// Visualization strategy:
//   - arr[]  = parent[] array (each bar = a node; bar height = parent id)
//   - sub[]  = rank[]/size[] array shown below
//   - highlight = nodes just merged (amber)
//   - mark      = nodes that are roots (green)

const UF_CAT = { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" };
const DFS_CAT = { key: "dfs", vi: "DFS", en: "DFS" };

// ─── 547: Number of Provinces ───
// Line-by-line trace of the exact Python code shown to the user:
//  1  class UnionFind:
//  2      def __init__(self, n):
//  3          self.parent = list(range(n))
//  4          self.rank = [0] * n
//  5          self.components = n
//  6      def find(self, x):
//  7          while self.parent[x] != x:
//  8              self.parent[x] = self.parent[self.parent[x]]  # path compression
//  9              x = self.parent[x]
// 10          return x
// 11      def union(self, x, y):
// 12          rx, ry = self.find(x), self.find(y)
// 13          if rx == ry: return
// 14          if self.rank[rx] < self.rank[ry]: rx, ry = ry, rx
// 15          self.parent[ry] = rx
// 16          if self.rank[rx] == self.rank[ry]: self.rank[rx] += 1
// 17          self.components -= 1
// 18  class Solution:
// 19      def findCircleNum(self, isConnected):
// 20          n = len(isConnected)
// 21          uf = UnionFind(n)
// 22          for i in range(n):
// 23              for j in range(i + 1, n):
// 24                  if isConnected[i][j]:
// 25                      uf.union(i, j)
// 26          return uf.components
function buildSteps547(input, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps547DFS(input);
  return buildSteps547UnionFind(input);
}

function buildSteps547UnionFind(input) {
  // Accept both [[1,0],[0,1]] and "1,0;0,1" formats
  const raw = String(input).trim();
  let matrix;
  if (raw.startsWith("[")) {
    // JSON array format: [[1,1,0],[1,1,0],[0,0,1]]
    try {
      matrix = JSON.parse(raw);
    } catch (e) {
      // fallback: strip brackets and split by ],[
      matrix = raw
        .replace(/^\[|\]$/g, "")
        .split("],[")
        .map((row) => row.replace(/\[|\]/g, "").split(",").map(Number));
    }
  } else {
    // Legacy semicolon format: "1,1,0;1,1,0;0,0,1"
    matrix = raw.split(";").map((row) => row.split(",").map((s) => Number(s.trim())));
  }
  const n = matrix.length;
  const steps = [];

  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  let components = n;
  const addedSet = new Set(); // "u-v" edges already unioned, for the graph view

  function roots() {
    const rs = new Set();
    for (let i = 0; i < n; i++) {
      let x = i;
      while (parent[x] !== x) x = parent[x];
      rs.add(x);
    }
    return rs;
  }

  function graphSnap({ hlNodes = [], hlEdges = [], title, note, vars, codeLines }) {
    const gNodes = Array.from({ length: n }, (_, i) => ({ id: i, label: String(i) }));
    const gEdges = [];
    for (const key of addedSet) {
      const [u, v] = key.split("-").map(Number);
      gEdges.push({ u, v, w: "" });
    }

    // visitedNodes = nodes that share a component with at least one other node
    const rootOf = (x) => { let r = x; while (parent[r] !== r) r = parent[r]; return r; };
    const compCount = new Map();
    for (let i = 0; i < n; i++) {
      const r = rootOf(i);
      compCount.set(r, (compCount.get(r) || 0) + 1);
    }
    const visited = Array.from({ length: n }, (_, i) => (compCount.get(rootOf(i)) > 1 ? i : -1)).filter((x) => x >= 0);
    const rootSet = roots();

    return {
      title,
      arr: [...parent],
      sub: [...rank],
      highlight: hlNodes,
      mark: Array.from({ length: n }, (_, i) => i).filter((i) => rootSet.has(i)),
      graph: { nodes: gNodes, edges: gEdges, hlNodes, hlEdges, visitedNodes: visited },
      codeLines,
      vars: vars || [],
      note,
    };
  }

  function push(opts) { steps.push(graphSnap(opts)); }

  // Line 20: n = len(isConnected)
  push({
    title: { vi: "n = len(isConnected)", en: "n = len(isConnected)" },
    codeLines: [20],
    vars: [{ name: "n", value: n }],
    note: { vi: `Có ${n} thành phố.`, en: `There are ${n} cities.` },
  });

  // Line 21: uf = UnionFind(n)  → enters __init__ (lines 2-5)
  push({
    title: { vi: "uf = UnionFind(n)", en: "uf = UnionFind(n)" },
    codeLines: [21],
    vars: [{ name: "n", value: n }],
    note: { vi: "Khởi tạo Union-Find, gọi __init__.", en: "Initialize the Union-Find object, calling __init__." },
  });
  push({
    title: { vi: "self.parent = list(range(n))", en: "self.parent = list(range(n))" },
    codeLines: [3],
    vars: [{ name: "parent", value: `[${parent.join(",")}]` }],
    note: { vi: "Mỗi thành phố tự làm gốc của chính nó.", en: "Each city starts as its own root." },
  });
  push({
    title: { vi: "self.rank = [0] * n", en: "self.rank = [0] * n" },
    codeLines: [4],
    vars: [{ name: "rank", value: `[${rank.join(",")}]` }],
    note: { vi: "Rank (chiều cao cây) ban đầu = 0.", en: "Rank (tree height) starts at 0." },
  });
  push({
    title: { vi: "self.components = n", en: "self.components = n" },
    codeLines: [5],
    vars: [{ name: "components", value: components }],
    note: { vi: `Ban đầu có ${n} tỉnh riêng biệt.`, en: `Initially there are ${n} separate provinces.` },
  });

  // Recursive-ish find() with real path compression, one code line per step.
  function find(x, label) {
    while (true) {
      const done = parent[x] === x;
      push({
        hlNodes: [x],
        title: { vi: `find(${label}): while parent[${x}] != ${x}? ${done ? "False" : "True"}`, en: `find(${label}): while parent[${x}] != ${x}? ${done ? "False" : "True"}` },
        codeLines: [7],
        vars: [{ name: "x", value: x }, { name: "parent[x]", value: parent[x] }],
        note: {
          vi: done ? `${x} đã là gốc.` : `${x} chưa là gốc (parent[${x}]=${parent[x]}), tiếp tục đi lên.`,
          en: done ? `${x} is already a root.` : `${x} is not a root yet (parent[${x}]=${parent[x]}), keep climbing.`,
        },
      });
      if (done) {
        push({
          hlNodes: [x],
          title: { vi: `return ${x}`, en: `return ${x}` },
          codeLines: [10],
          vars: [{ name: "root", value: x }],
          note: { vi: `find(${label}) trả về gốc ${x}.`, en: `find(${label}) returns root ${x}.` },
        });
        return x;
      }
      const before = parent[x];
      const grand = parent[parent[x]];
      parent[x] = grand;
      push({
        hlNodes: [x],
        title: { vi: `parent[${x}] = parent[parent[${x}]] = ${grand}`, en: `parent[${x}] = parent[parent[${x}]] = ${grand}` },
        codeLines: [8],
        vars: [{ name: "parent[x] before", value: before }, { name: "parent[x] after", value: grand }, { name: "parent", value: `[${parent.join(",")}]` }],
        note: { vi: "Path compression: rút ngắn đường về gốc.", en: "Path compression: shortens the path to the root." },
      });
      const nx = parent[x];
      x = nx;
      push({
        hlNodes: [x],
        title: { vi: `x = parent[x] = ${x}`, en: `x = parent[x] = ${x}` },
        codeLines: [9],
        vars: [{ name: "x", value: x }],
        note: { vi: `Tiếp tục xét đỉnh ${x}.`, en: `Continue checking node ${x}.` },
      });
    }
  }

  // Line 22-25: nested loop calling uf.union(i, j)
  for (let i = 0; i < n; i++) {
    push({
      title: { vi: `for i in range(n): i = ${i}`, en: `for i in range(n): i = ${i}` },
      hlNodes: [i],
      codeLines: [22],
      vars: [{ name: "i", value: i }],
      note: { vi: `Xét thành phố ${i}.`, en: `Consider city ${i}.` },
    });
    for (let j = i + 1; j < n; j++) {
      push({
        title: { vi: `for j in range(i+1, n): j = ${j}`, en: `for j in range(i+1, n): j = ${j}` },
        hlNodes: [i, j],
        codeLines: [23],
        vars: [{ name: "i", value: i }, { name: "j", value: j }],
        note: { vi: `So với thành phố ${j}.`, en: `Compare with city ${j}.` },
      });

      const connected = matrix[i][j] === 1;
      push({
        title: { vi: `isConnected[${i}][${j}]? ${connected}`, en: `isConnected[${i}][${j}]? ${connected}` },
        hlNodes: [i, j],
        codeLines: [24],
        vars: [{ name: `isConnected[${i}][${j}]`, value: matrix[i][j] }],
        note: {
          vi: connected ? `${i} và ${j} kết nối trực tiếp → cần union.` : `${i} và ${j} không kết nối trực tiếp → bỏ qua.`,
          en: connected ? `${i} and ${j} are directly connected → need to union.` : `${i} and ${j} are not directly connected → skip.`,
        },
      });
      if (!connected) continue;

      // Line 25: uf.union(i, j) → enters union() body
      push({
        title: { vi: `uf.union(${i}, ${j})`, en: `uf.union(${i}, ${j})` },
        hlNodes: [i, j],
        codeLines: [25],
        vars: [{ name: "x", value: i }, { name: "y", value: j }],
        note: { vi: "Gọi union, bắt đầu bằng find(x) và find(y).", en: "Call union, starting with find(x) and find(y)." },
      });

      const rx0 = find(i, "x");
      const ry0 = find(j, "y");
      push({
        title: { vi: `rx, ry = ${rx0}, ${ry0}`, en: `rx, ry = ${rx0}, ${ry0}` },
        hlNodes: [rx0, ry0],
        codeLines: [12],
        vars: [{ name: "rx", value: rx0 }, { name: "ry", value: ry0 }],
        note: { vi: "Đã có gốc của x và y.", en: "Now have the roots of x and y." },
      });

      let rx = rx0, ry = ry0;
      const sameRoot = rx === ry;
      push({
        title: { vi: `rx == ry? ${sameRoot}`, en: `rx == ry? ${sameRoot}` },
        hlNodes: [rx, ry],
        codeLines: [13],
        vars: [{ name: "rx", value: rx }, { name: "ry", value: ry }],
        note: {
          vi: sameRoot ? "Cùng gốc → đã cùng tỉnh, return ngay." : "Khác gốc → tiếp tục union by rank.",
          en: sameRoot ? "Same root → already same province, return immediately." : "Different roots → proceed with union by rank.",
        },
      });
      if (sameRoot) continue;

      const swapNeeded = rank[rx] < rank[ry];
      push({
        title: { vi: `rank[rx] < rank[ry]? ${swapNeeded} (${rank[rx]} vs ${rank[ry]})`, en: `rank[rx] < rank[ry]? ${swapNeeded} (${rank[rx]} vs ${rank[ry]})` },
        hlNodes: [rx, ry],
        codeLines: [14],
        vars: [{ name: "rank[rx]", value: rank[rx] }, { name: "rank[ry]", value: rank[ry] }],
        note: {
          vi: swapNeeded ? "rank[rx] nhỏ hơn → đổi chỗ rx và ry để gắn cây thấp vào cây cao." : "Không cần đổi chỗ rx, ry.",
          en: swapNeeded ? "rank[rx] is smaller → swap rx and ry so the shorter tree attaches to the taller one." : "No need to swap rx, ry.",
        },
      });
      if (swapNeeded) { const t = rx; rx = ry; ry = t; }

      parent[ry] = rx;
      addedSet.add(`${Math.min(i, j)}-${Math.max(i, j)}`);
      push({
        title: { vi: `self.parent[ry] = rx → parent[${ry}] = ${rx}`, en: `self.parent[ry] = rx → parent[${ry}] = ${rx}` },
        hlNodes: [rx, ry],
        hlEdges: [[i, j]],
        codeLines: [15],
        vars: [{ name: "parent", value: `[${parent.join(",")}]` }],
        note: { vi: `Gắn gốc ${ry} vào gốc ${rx}. Cạnh (${i}─${j}) xuất hiện trên đồ thị.`, en: `Attach root ${ry} under root ${rx}. Edge (${i}─${j}) appears on the graph.` },
      });

      const rankTie = rank[rx] === rank[ry];
      if (rankTie) rank[rx]++;
      push({
        title: { vi: `rank[rx] == rank[ry]? ${rankTie}${rankTie ? ` → rank[${rx}] += 1` : ""}`, en: `rank[rx] == rank[ry]? ${rankTie}${rankTie ? ` → rank[${rx}] += 1` : ""}` },
        hlNodes: [rx],
        codeLines: [16],
        vars: [{ name: "rank", value: `[${rank.join(",")}]` }],
        note: {
          vi: rankTie ? `Hai rank bằng nhau → tăng rank[${rx}] để giữ cây thấp.` : "Rank khác nhau → không cần tăng.",
          en: rankTie ? `Ranks tied → increment rank[${rx}] to keep the tree shallow.` : "Ranks differ → no increment needed.",
        },
      });

      components--;
      push({
        title: { vi: `self.components -= 1 → ${components}`, en: `self.components -= 1 → ${components}` },
        codeLines: [17],
        vars: [{ name: "components", value: components }],
        note: { vi: `Hai tỉnh vừa gộp lại. Còn ${components} tỉnh.`, en: `Two provinces just merged. ${components} province(s) remain.` },
      });
    }
  }

  // Line 26: return uf.components
  const fs = graphSnap({
    title: { vi: `return uf.components → ${components}`, en: `return uf.components → ${components}` },
    codeLines: [26],
    vars: [{ name: "answer", value: components }],
    note: {
      vi: `Duyệt hết ma trận. Có ${components} tỉnh.`,
      en: `Matrix fully processed. There are ${components} province(s).`,
    },
  });
  fs.final = true;
  steps.push(fs);

  return { input, answer: components, steps };
}

// ─── 547, approach 2: recursive DFS ───
// Line-by-line trace of the exact Python code shown to the user:
//  1  class Solution:
//  2      def findCircleNum(self, isConnected):
//  3          n = len(isConnected)
//  4          count = 0
//  5          visited = [False for _ in range(n)]
//  6          def dfs(curr):
//  7              visited[curr] = True
//  8              for next in range(n):
//  9                  if isConnected[curr][next] == 1:
// 10                      if not visited[next]:
// 11                          dfs(next)
// 12          for i in range(n):
// 13              if not visited[i]:
// 14                  dfs(i)
// 15                  count += 1
// 16          return count
function buildSteps547DFS(input) {
  const raw = String(input).trim();
  let matrix;
  if (raw.startsWith("[")) {
    try {
      matrix = JSON.parse(raw);
    } catch (e) {
      matrix = raw.replace(/^\[|\]$/g, "").split("],[").map((row) => row.replace(/\[|\]/g, "").split(",").map(Number));
    }
  } else {
    matrix = raw.split(";").map((row) => row.split(",").map((s) => Number(s.trim())));
  }
  const n = matrix.length;
  const steps = [];

  const visited = new Array(n).fill(false);
  const componentId = new Array(n).fill(0);
  let count = 0;
  const addedSet = new Set(); // "u-v" edges revealed as we DFS

  function graphSnap({ hlNodes = [], hlEdges = [], title, note, vars, codeLines }) {
    const gNodes = Array.from({ length: n }, (_, i) => ({ id: i, label: String(i) }));
    const gEdges = [];
    for (const key of addedSet) {
      const [u, v] = key.split("-").map(Number);
      gEdges.push({ u, v, w: "" });
    }
    return {
      title,
      arr: [],
      graph: { nodes: gNodes, edges: gEdges, hlNodes, hlEdges, visitedNodes: visited.map((v, i) => (v ? i : -1)).filter((x) => x >= 0) },
      highlight: [],
      mark: [],
      codeBlock: 2,
      codeLines,
      vars: vars || [],
      note,
    };
  }
  function push(opts) { steps.push(graphSnap(opts)); }

  // Line 3: n = len(isConnected)
  push({
    title: { vi: "n = len(isConnected)", en: "n = len(isConnected)" },
    codeLines: [3],
    vars: [{ name: "n", value: n }],
    note: { vi: `Có ${n} thành phố.`, en: `There are ${n} cities.` },
  });

  // Line 4: count = 0
  push({
    title: { vi: "count = 0", en: "count = 0" },
    codeLines: [4],
    vars: [{ name: "count", value: count }],
    note: { vi: "Biến đếm số tỉnh.", en: "Counter for the number of provinces." },
  });

  // Line 5: visited = [False for _ in range(n)]
  push({
    title: { vi: "visited = [False] * n", en: "visited = [False] * n" },
    codeLines: [5],
    vars: [{ name: "visited", value: `[${visited.map(() => "F").join(", ")}]` }],
    note: { vi: "Chưa thăm thành phố nào.", en: "No city visited yet." },
  });

  push({
    title: { vi: "Định nghĩa dfs(curr)", en: "Define dfs(curr)" },
    codeLines: [6],
    vars: [],
    note: { vi: "Hàm DFS đệ quy sẽ quét hết 1 component chứa curr.", en: "The recursive DFS function will explore the whole component containing curr." },
  });

  function dfs(curr, comp) {
    // Line 7: visited[curr] = True
    visited[curr] = true;
    componentId[curr] = comp;
    push({
      title: { vi: `dfs(${curr}): visited[${curr}] = True`, en: `dfs(${curr}): visited[${curr}] = True` },
      hlNodes: [curr],
      codeLines: [7],
      vars: [{ name: "curr", value: curr }],
      note: { vi: `Đánh dấu ${curr} đã thăm, thuộc tỉnh #${comp}.`, en: `Mark ${curr} visited, part of province #${comp}.` },
    });

    for (let next = 0; next < n; next++) {
      // Line 8: for next in range(n)
      push({
        title: { vi: `dfs(${curr}): for next in range(n): next = ${next}`, en: `dfs(${curr}): for next in range(n): next = ${next}` },
        hlNodes: [curr, next],
        codeLines: [8],
        vars: [{ name: "curr", value: curr }, { name: "next", value: next }],
        note: { vi: `Xét thành phố ${next} như hàng xóm tiềm năng của ${curr}.`, en: `Check city ${next} as a potential neighbor of ${curr}.` },
      });

      // Line 9: if isConnected[curr][next] == 1
      const connected = matrix[curr][next] === 1;
      push({
        title: { vi: `isConnected[${curr}][${next}] == 1? ${connected}`, en: `isConnected[${curr}][${next}] == 1? ${connected}` },
        hlNodes: [curr, next],
        codeLines: [9],
        vars: [{ name: `isConnected[${curr}][${next}]`, value: matrix[curr][next] }],
        note: {
          vi: connected ? `${curr} và ${next} kết nối trực tiếp.` : `${curr} và ${next} không kết nối trực tiếp → bỏ qua.`,
          en: connected ? `${curr} and ${next} are directly connected.` : `${curr} and ${next} are not directly connected → skip.`,
        },
      });
      if (!connected) continue;

      // Line 10: if not visited[next]
      const already = visited[next];
      push({
        title: { vi: `not visited[${next}]? ${!already}`, en: `not visited[${next}]? ${!already}` },
        hlNodes: [curr, next],
        hlEdges: [[curr, next]],
        codeLines: [10],
        vars: [{ name: `visited[${next}]`, value: already }],
        note: {
          vi: already ? `${next} đã thăm → không đệ quy lại.` : `${next} chưa thăm → đệ quy vào ${next}.`,
          en: already ? `${next} already visited → do not recurse again.` : `${next} unvisited → recurse into ${next}.`,
        },
      });
      if (already) continue;

      addedSet.add(`${Math.min(curr, next)}-${Math.max(curr, next)}`);
      // Line 11: dfs(next)
      push({
        title: { vi: `dfs(${next})`, en: `dfs(${next})` },
        hlNodes: [curr, next],
        hlEdges: [[curr, next]],
        codeLines: [11],
        vars: [{ name: "calling", value: next }],
        note: { vi: `Tạm dừng dfs(${curr}), đi sâu vào dfs(${next}).`, en: `Pause dfs(${curr}), descend into dfs(${next}).` },
      });
      dfs(next, comp);
    }
  }

  // Line 12-15: for i in range(n)
  for (let i = 0; i < n; i++) {
    push({
      title: { vi: `for i in range(n): i = ${i}`, en: `for i in range(n): i = ${i}` },
      hlNodes: [i],
      codeLines: [12],
      vars: [{ name: "i", value: i }, { name: "count", value: count }],
      note: { vi: `Xét thành phố ${i}.`, en: `Consider city ${i}.` },
    });

    // Line 13: if not visited[i]
    const already = visited[i];
    push({
      title: { vi: `not visited[${i}]? ${!already}`, en: `not visited[${i}]? ${!already}` },
      hlNodes: [i],
      codeLines: [13],
      vars: [{ name: `visited[${i}]`, value: already }],
      note: {
        vi: already ? `${i} đã thuộc một tỉnh xử lý trước → bỏ qua.` : `${i} chưa thăm → bắt đầu tỉnh mới.`,
        en: already ? `${i} already belongs to a processed province → skip.` : `${i} unvisited → start a new province.`,
      },
    });
    if (already) continue;

    // Line 14: dfs(i)
    push({
      title: { vi: `dfs(${i})`, en: `dfs(${i})` },
      hlNodes: [i],
      codeLines: [14],
      vars: [{ name: "calling", value: i }],
      note: { vi: `Gọi DFS để quét hết tỉnh chứa ${i}.`, en: `Call DFS to explore the whole province containing ${i}.` },
    });
    dfs(i, count + 1);

    // Line 15: count += 1
    count++;
    push({
      title: { vi: `count += 1 → ${count}`, en: `count += 1 → ${count}` },
      codeLines: [15],
      vars: [{ name: "count", value: count }],
      note: { vi: `Vừa quét xong tỉnh #${count}.`, en: `Just finished exploring province #${count}.` },
    });
  }

  // Line 16: return count
  const fs = graphSnap({
    title: { vi: `return count → ${count}`, en: `return count → ${count}` },
    codeLines: [16],
    vars: [{ name: "answer", value: count }],
    note: { vi: `Duyệt hết ${n} thành phố. Có ${count} tỉnh.`, en: `Scanned all ${n} cities. There are ${count} province(s).` },
  });
  fs.final = true;
  steps.push(fs);

  return { input, answer: count, steps };
}

// ─── 1258: Synonymous Sentences ───
function buildSteps1258(input, params) {
  // input format: "synonyms" (comma-sep pairs "w1:w2"), sentence in params.sentence
  const sentence = String(params.sentence || "I am happy today but was sad yesterday");
  const words = sentence.split(" ");

  // Parse synonym pairs from input: "happy:joy,happy:cheerful,sad:sorrow"
  const pairs = String(input).split(",").map((s) => {
    const [a, b] = s.trim().split(":");
    return [a.trim(), b.trim()];
  });

  const steps = [];

  // ── Collect all unique words ──
  const wordSet = new Set();
  for (const [a, b] of pairs) { wordSet.add(a); wordSet.add(b); }
  for (const w of words) wordSet.add(w);
  const vocab = [...wordSet].sort();
  const idx = new Map(vocab.map((w, i) => [w, i]));
  const n = vocab.length;

  // ── Union-Find ──
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  function find(x) {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }
  function union(x, y) {
    let rx = find(x), ry = find(y);
    if (rx === ry) return false;
    if (rank[rx] < rank[ry]) [rx, ry] = [ry, rx];
    parent[ry] = rx;
    if (rank[rx] === rank[ry]) rank[rx]++;
    return true;
  }
  function groupOf(w) {
    const r = find(idx.get(w));
    return vocab.filter((v) => find(idx.get(v)) === r).sort();
  }

  // Helper: bar snapshot showing parent[] and rank[]
  function ufSnap(title, note, hlWords, codeLines, extraVars) {
    const hlIdxs = new Set((hlWords || []).map((w) => idx.get(w)).filter((x) => x !== undefined));
    const rootIdxs = new Set(vocab.map((_, i) => find(i)));
    return {
      title,
      arr: [...parent],
      sub: [...rank],
      highlight: [...hlIdxs],
      mark: [...Array(n).keys()].filter((i) => rootIdxs.has(i) && parent[i] === i),
      codeLines: codeLines || [],
      vars: [
        { name: "words (vocab)", value: vocab.join(", ") },
        ...(extraVars || []),
      ],
      note,
    };
  }

  // ── Step 0: intro ──
  steps.push(ufSnap(
    { vi: "Bài toán: Synonymous Sentences", en: "Problem: Synonymous Sentences" },
    {
      vi:
        `Câu: "${sentence}"\n` +
        `Pairs synonym: ${pairs.map(([a, b]) => `(${a}, ${b})`).join(", ")}\n` +
        `Vocab: [${vocab.join(", ")}]\n\n` +
        `Dùng Union-Find để gộp các từ đồng nghĩa vào cùng 1 nhóm.\n` +
        `Thanh bar[i] = parent[i]; nút XANH = root của nhóm.`,
      en:
        `Sentence: "${sentence}"\n` +
        `Synonym pairs: ${pairs.map(([a, b]) => `(${a}, ${b})`).join(", ")}\n` +
        `Vocab: [${vocab.join(", ")}]\n\n` +
        `Use Union-Find to group synonyms together.\n` +
        `Bar[i] = parent[i]; GREEN node = group root.`,
    },
    [],
    [2, 3],
    [{ name: "parent", value: `[${parent.join(",")}]` }]
  ));

  // ── Phase 1: union each synonym pair ──
  for (const [a, b] of pairs) {
    const ia = idx.get(a), ib = idx.get(b);
    const ra = find(ia), rb = find(ib);
    if (ra === rb) {
      steps.push(ufSnap(
        { vi: `Union("${a}", "${b}"): đã cùng nhóm`, en: `Union("${a}", "${b}"): already same group` },
        {
          vi: `find("${a}") = ${ra} = find("${b}") → đã cùng nhóm, bỏ qua.`,
          en: `find("${a}") = ${ra} = find("${b}") → same group already, skip.`,
        },
        [a, b], [5, 6],
        [{ name: "find(a)", value: ra }, { name: "find(b)", value: rb }]
      ));
      continue;
    }
    union(ia, ib);
    const newRoot = find(ia);
    steps.push(ufSnap(
      { vi: `Union("${a}", "${b}") → nhóm {${groupOf(a).join(", ")}}`, en: `Union("${a}", "${b}") → group {${groupOf(a).join(", ")}}` },
      {
        vi:
          `Gộp "${a}" và "${b}" vào cùng nhóm. Gốc mới = vocab[${newRoot}] = "${vocab[newRoot]}".\n` +
          `parent = [${parent.join(",")}],  rank = [${rank.join(",")}].`,
        en:
          `Merged "${a}" and "${b}" into one group. New root = vocab[${newRoot}] = "${vocab[newRoot]}".\n` +
          `parent = [${parent.join(",")}],  rank = [${rank.join(",")}].`,
      },
      [a, b], [7, 8, 9],
      [{ name: "group", value: `{${groupOf(a).join(", ")}}` }, { name: "parent", value: `[${parent.join(",")}]` }]
    ));
  }

  // ── Phase 2: show synonym group for each word in sentence ──
  steps.push(ufSnap(
    { vi: "Phase 2: Xác định nhóm cho từng từ trong câu", en: "Phase 2: Determine synonym group for each word" },
    {
      vi:
        `Union-Find hoàn tất. Giờ xét từng từ trong câu:\n` +
        words.map((w) => {
          const g = groupOf(w);
          return `  "${w}" → {${g.join(", ")}}`;
        }).join("\n"),
      en:
        `Union-Find done. Now check each word in the sentence:\n` +
        words.map((w) => {
          const g = groupOf(w);
          return `  "${w}" → {${g.join(", ")}}`;
        }).join("\n"),
    },
    words, [11, 12],
    words.map((w, i) => ({ name: `word[${i}] "${w}"`, value: `{${groupOf(w).join(", ")}}` }))
  ));

  // ── Phase 3: generate all sentences ──
  const groups = words.map((w) => groupOf(w));
  const results = [];
  function gen(i, cur) {
    if (i === words.length) { results.push(cur.join(" ")); return; }
    for (const syn of groups[i]) { cur.push(syn); gen(i + 1, cur); cur.pop(); }
  }
  gen(0, []);

  // Show generation step by step (one per word position)
  for (let i = 0; i < words.length; i++) {
    const g = groups[i];
    if (g.length > 1) {
      steps.push(ufSnap(
        { vi: `Từ[${i}] "${words[i]}" có ${g.length} lựa chọn`, en: `Word[${i}] "${words[i]}" has ${g.length} choices` },
        {
          vi:
            `Vị trí ${i}: "${words[i]}" thuộc nhóm {${g.join(", ")}}\n` +
            `Thay bằng bất kỳ từ nào → nhân số câu lên ${g.length} lần.\n` +
            `Sau vị trí này: ${results.filter((r) => r.split(" ").slice(0, i + 1).join(" ") === g.map((_, k) => k === 0 ? g[0] : "").join("") || true).length} câu tạm.`,
          en:
            `Position ${i}: "${words[i]}" belongs to group {${g.join(", ")}}\n` +
            `Substituting any member → multiplies sentence count by ${g.length}.\n` +
            `Each choice: ${g.map((syn) => `"${syn}"`).join(" or ")}.`,
        },
        [words[i]], [13, 14],
        [{ name: `group[${i}]`, value: `[${g.join(", ")}]` }, { name: "choices", value: g.length }]
      ));
    }
  }

  // ── Final: show all results ──
  const fs = ufSnap(
    { vi: `Kết quả: ${results.length} câu`, en: `Result: ${results.length} sentences` },
    {
      vi:
        `Tất cả ${results.length} câu theo thứ tự từ điển:\n` +
        results.map((s, i) => `  ${i + 1}. "${s}"`).join("\n"),
      en:
        `All ${results.length} sentences in lexicographic order:\n` +
        results.map((s, i) => `  ${i + 1}. "${s}"`).join("\n"),
    },
    [], [15],
    [{ name: "total", value: results.length }, { name: "sentences", value: results.join(" | ") }]
  );
  fs.final = true;
  steps.push(fs);

  return { input, answer: results.join(" | "), steps };
}

// ─── 1631: Path With Minimum Effort ───
function buildSteps1631(input) {
  // Input: grid rows separated by ';', values by ','
  // e.g. "1,2,2;3,8,2;5,3,5"
  const grid = String(input)
    .split(";")
    .map((row) => row.split(",").map((s) => Number(s.trim())));
  const rows = grid.length, cols = grid[0].length;
  const n = rows * cols;
  const steps = [];

  const id = (r, c) => r * cols + c;
  const label = (i) => `(${Math.floor(i / cols)},${i % cols})`;

  // ── Union-Find ──
  const parent = Array.from({ length: n }, (_, i) => i);
  const rnk = new Array(n).fill(0);
  function find(x) {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }
  function union(x, y) {
    const rx = find(x), ry = find(y);
    if (rx === ry) return false;
    if (rnk[rx] >= rnk[ry]) { parent[ry] = rx; if (rnk[rx] === rnk[ry]) rnk[rx]++; }
    else { parent[rx] = ry; }
    return true;
  }
  function connected() { return find(0) === find(n - 1); }

  // ── Build all edges sorted by |diff| ──
  const edges = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r + 1 < rows) edges.push({ u: id(r, c), v: id(r + 1, c), diff: Math.abs(grid[r][c] - grid[r + 1][c]), r1: r, c1: c, r2: r + 1, c2: c });
      if (c + 1 < cols) edges.push({ u: id(r, c), v: id(r, c + 1), diff: Math.abs(grid[r][c] - grid[r][c + 1]), r1: r, c1: c, r2: r, c2: c + 1 });
    }
  }
  edges.sort((a, b) => a.diff - b.diff);

  const gridStr = grid.map((row) => `[${row.join(",")}]`).join(" ");
  const edgesPreview = edges.slice(0, 6).map((e) => `${label(e.u)}↔${label(e.v)}:${e.diff}`).join(", ");

  // ── Snapshot helper using bar view ──
  function snap(title, note, hlNodes, vars, codeLines) {
    const rootSet = new Set(Array.from({ length: n }, (_, i) => find(i)));
    const start = 0, end = n - 1;
    return {
      title,
      arr: [...parent],
      sub: [...rnk],
      highlight: (hlNodes || []),
      mark: Array.from({ length: n }, (_, i) => i).filter((i) => rootSet.has(i) && parent[i] === i),
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    };
  }

  // ── Step 0: intro ──
  steps.push(snap(
    { vi: "Bài toán: Path With Minimum Effort", en: "Problem: Path With Minimum Effort" },
    {
      vi:
        `Grid ${rows}×${cols}: ${gridStr}\n` +
        `Tìm đường từ (0,0) đến (${rows - 1},${cols - 1}) sao cho EFFORT tối thiểu.\n` +
        `Effort = |diff| LỚN NHẤT trên đường đi.\n\n` +
        `Ý tưởng Union-Find (Kruskal-style):\n` +
        `• Tạo tất cả cạnh {(r1,c1)↔(r2,c2), |diff|} rồi SAP XẾP theo |diff| tăng dần.\n` +
        `• Lần lượt thêm cạnh vào DSU. Khi (0,0) và (${rows - 1},${cols - 1}) cùng nhóm → đáp án = |diff| của cạnh vừa thêm.\n` +
        `Bar chart: bar[i] = parent[i]; nút XANH = root nhóm.`,
      en:
        `Grid ${rows}×${cols}: ${gridStr}\n` +
        `Find a path from (0,0) to (${rows - 1},${cols - 1}) minimizing the EFFORT.\n` +
        `Effort = the MAXIMUM |diff| on the path.\n\n` +
        `Union-Find idea (Kruskal-style):\n` +
        `• Build all edges {(r1,c1)↔(r2,c2), |diff|} and SORT by |diff| ascending.\n` +
        `• Add edges one by one to the DSU. When (0,0) and (${rows - 1},${cols - 1}) are in the same group → answer = |diff| of that edge.\n` +
        `Bar chart: bar[i] = parent[i]; GREEN node = group root.`,
    },
    [],
    [{ name: "grid", value: gridStr }, { name: "edges (sorted, first 6)", value: edgesPreview }],
    [2, 3]
  ));

  // ── Step 1: show sorted edges ──
  steps.push(snap(
    { vi: `Sắp xếp ${edges.length} cạnh theo |diff|`, en: `Sort ${edges.length} edges by |diff|` },
    {
      vi:
        `Tất cả cạnh giữa ô kề nhau (ngang/dọc), sắp theo |diff| tăng dần:\n` +
        edges.map((e) => `  ${label(e.u)}↔${label(e.v)} diff=${e.diff}`).join("\n"),
      en:
        `All edges between adjacent cells (horizontal/vertical), sorted by |diff| ascending:\n` +
        edges.map((e) => `  ${label(e.u)}↔${label(e.v)} diff=${e.diff}`).join("\n"),
    },
    [],
    [{ name: "total edges", value: edges.length }],
    [4, 5]
  ));

  // ── Process edges ──
  let answer = 0;
  let added = 0;
  for (const e of edges) {
    const ru = find(e.u), rv = find(e.v);
    const alreadySame = ru === rv;
    union(e.u, e.v);
    added++;

    const isKey = connected();
    steps.push(snap(
      {
        vi: isKey
          ? `✓ Thêm cạnh ${label(e.u)}↔${label(e.v)} diff=${e.diff} → KẾT NỐI (0,0)↔(${rows-1},${cols-1})!`
          : `Thêm cạnh ${label(e.u)}↔${label(e.v)} diff=${e.diff}${alreadySame ? " (đã cùng nhóm)" : ""}`,
        en: isKey
          ? `✓ Add edge ${label(e.u)}↔${label(e.v)} diff=${e.diff} → (0,0)↔(${rows-1},${cols-1}) CONNECTED!`
          : `Add edge ${label(e.u)}↔${label(e.v)} diff=${e.diff}${alreadySame ? " (same group already)" : ""}`,
      },
      {
        vi:
          (alreadySame
            ? `${label(e.u)} và ${label(e.v)} đã cùng nhóm → bỏ qua.\n`
            : `Union(${label(e.u)}, ${label(e.v)}): gộp 2 nhóm, gắn gốc nhỏ hơn vào gốc lớn hơn.\n`) +
          `parent = [${parent.join(",")}]\n` +
          (isKey
            ? `🎯 (0,0) và (${rows-1},${cols-1}) cùng nhóm → EFFORT tối thiểu = ${e.diff}.`
            : `(0,0) root=${find(0)}, (${rows-1},${cols-1}) root=${find(n-1)} → chưa kết nối, tiếp tục.`),
        en:
          (alreadySame
            ? `${label(e.u)} and ${label(e.v)} already in the same group → skip.\n`
            : `Union(${label(e.u)}, ${label(e.v)}): merge two groups, attach smaller-rank root under larger.\n`) +
          `parent = [${parent.join(",")}]\n` +
          (isKey
            ? `🎯 (0,0) and (${rows-1},${cols-1}) are in the same group → minimum EFFORT = ${e.diff}.`
            : `(0,0) root=${find(0)}, (${rows-1},${cols-1}) root=${find(n-1)} → not connected yet, continue.`),
      },
      [e.u, e.v],
      [
        { name: "edge", value: `${label(e.u)}↔${label(e.v)}` },
        { name: "diff", value: e.diff },
        { name: "edges added", value: added },
        { name: "connected?", value: isKey },
        { name: "parent", value: `[${parent.join(",")}]` },
      ],
      [6, 7, 8, 9]
    ));

    if (isKey) { answer = e.diff; break; }
  }

  // ── Final ──
  const fs = snap(
    { vi: `Kết quả: effort = ${answer}`, en: `Result: effort = ${answer}` },
    {
      vi:
        `Minimum effort = ${answer}.\n` +
        `Sau khi thêm ${added} cạnh (trong tổng ${edges.length}), (0,0) và (${rows-1},${cols-1}) nằm cùng nhóm.\n` +
        `Cạnh cuối cùng thêm vào quyết định đáp án (bottleneck edge).`,
      en:
        `Minimum effort = ${answer}.\n` +
        `After adding ${added} edge(s) (out of ${edges.length} total), (0,0) and (${rows-1},${cols-1}) are in the same group.\n` +
        `The last added edge is the bottleneck edge that determines the answer.`,
    },
    [0, n - 1],
    [{ name: "answer", value: answer }],
    [10]
  );
  fs.final = true;
  steps.push(fs);

  return { input, answer, steps };
}

// ─── 1101: The Earliest Moment When Everyone Become Friends ───
function buildSteps1101(input, params) {
  // input: logs as "t1,a1,b1;t2,a2,b2;..."
  // n: number of people
  const n = params.n !== undefined ? Number(params.n) : 6;
  const logs = String(input).split(";").map((s) => {
    const [t, a, b] = s.trim().split(",").map(Number);
    return { t, a, b };
  }).sort((x, y) => x.t - y.t);

  const steps = [];
  const parent = Array.from({ length: n }, (_, i) => i);
  const rnk = new Array(n).fill(0);
  let components = n;
  const addedEdges = new Set(); // "a-b" keys already union-ed

  function find(x) {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }
  function union(x, y) {
    const rx = find(x), ry = find(y);
    if (rx === ry) return false;
    if (rnk[rx] >= rnk[ry]) { parent[ry] = rx; if (rnk[rx] === rnk[ry]) rnk[rx]++; }
    else { parent[rx] = ry; }
    return true;
  }
  function compCount() {
    const cnt = new Map();
    for (let i = 0; i < n; i++) { const r = find(i); cnt.set(r, (cnt.get(r) || 0) + 1); }
    return cnt;
  }

  function graphSnap(title, note, hlNodes, hlEdges, vars, codeLines) {
    const cnt = compCount();
    const visited = Array.from({ length: n }, (_, i) => cnt.get(find(i)) > 1 ? i : -1).filter(x => x >= 0);
    const gEdges = [];
    for (const key of addedEdges) {
      const [u, v] = key.split("-").map(Number);
      gEdges.push({ u, v, w: "" });
    }
    return {
      title,
      arr: [...parent],
      sub: [...rnk],
      highlight: hlNodes || [],
      mark: Array.from({ length: n }, (_, i) => i).filter(i => parent[i] === i),
      graph: {
        nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: String(i) })),
        edges: gEdges,
        hlNodes: hlNodes || [],
        hlEdges: hlEdges || [],
        visitedNodes: visited,
      },
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    };
  }

  const logsStr = logs.map((l) => `t=${l.t}:(${l.a},${l.b})`).join(", ");

  // ── Step 0: intro ──
  steps.push(graphSnap(
    { vi: "Khởi tạo: mọi người chưa quen ai", en: "Init: everyone is a stranger" },
    {
      vi:
        `${n} người (0‥${n-1}), ${logs.length} sự kiện.\n` +
        `Sắp logs theo timestamp tăng dần: ${logsStr}\n\n` +
        `Dùng Union-Find: lần lượt xử lý từng log.\n` +
        `Khi chỉ còn 1 nhóm (components = 1) → mọi người đã quen nhau → trả timestamp đó.`,
      en:
        `${n} people (0‥${n-1}), ${logs.length} events.\n` +
        `Sort logs by timestamp ascending: ${logsStr}\n\n` +
        `Union-Find approach: process each log in order.\n` +
        `When only 1 component remains → everyone knows each other → return that timestamp.`,
    },
    [], [],
    [{ name: "n", value: n }, { name: "components", value: components }, { name: "logs (sorted)", value: logsStr }],
    [2, 3]
  ));

  // ── Process each log ──
  let answer = -1;
  for (const log of logs) {
    const { t, a, b } = log;
    const ra = find(a), rb = find(b);
    const alreadySame = ra === rb;

    if (!alreadySame) {
      union(a, b);
      components--;
      addedEdges.add(`${Math.min(a,b)}-${Math.max(a,b)}`);
    }

    const done = components === 1;
    steps.push(graphSnap(
      {
        vi: done
          ? `✓ t=${t}: (${a},${b}) quen nhau → TẤT CẢ kết nối!`
          : alreadySame
            ? `t=${t}: (${a},${b}) đã quen nhau rồi`
            : `t=${t}: (${a},${b}) quen nhau → ${components} nhóm`,
        en: done
          ? `✓ t=${t}: (${a},${b}) become friends → EVERYONE connected!`
          : alreadySame
            ? `t=${t}: (${a},${b}) already friends, skip`
            : `t=${t}: (${a},${b}) become friends → ${components} group(s)`,
      },
      {
        vi:
          (alreadySame
            ? `${a} và ${b} đã cùng nhóm (find=${ra}) → bỏ qua.\n`
            : `Union(${a}, ${b}): gộp 2 nhóm. parent=[${parent.join(",")}]\n`) +
          (done
            ? `🎯 components = 1 → timestamp sớm nhất để mọi người quen = ${t}.`
            : `Còn ${components} nhóm, tiếp tục.`),
        en:
          (alreadySame
            ? `${a} and ${b} already in the same group (root=${ra}) → skip.\n`
            : `Union(${a}, ${b}): merged two groups. parent=[${parent.join(",")}]\n`) +
          (done
            ? `🎯 components = 1 → earliest moment everyone knows each other = ${t}.`
            : `${components} group(s) remain, continue.`),
      },
      [a, b],
      alreadySame ? [] : [`${Math.min(a,b)}-${Math.max(a,b)}`],
      [
        { name: "timestamp", value: t },
        { name: "pair", value: `(${a}, ${b})` },
        { name: "same group?", value: alreadySame },
        { name: "components", value: components },
        { name: "parent", value: `[${parent.join(",")}]` },
      ],
      [5, 6, 7, 8]
    ));

    if (done) { answer = t; break; }
  }

  const fs = graphSnap(
    { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    {
      vi: answer === -1
        ? `Không bao giờ tất cả kết nối → trả -1.`
        : `Timestamp ${answer} là thời điểm sớm nhất tất cả ${n} người đều quen nhau.`,
      en: answer === -1
        ? `Everyone never all connected → return -1.`
        : `Timestamp ${answer} is the earliest moment all ${n} people know each other.`,
    },
    [], [],
    [{ name: "answer", value: answer }],
    [9]
  );
  fs.final = true;
  steps.push(fs);

  return { input, answer, steps };
}

// ─── 1319 DFS: Number of Operations to Make Network Connected ───
// Line-by-line trace of the exact code2 shown to the user:
//  1  from collections import defaultdict
//  2  (blank)
//  3  class Solution:
//  4      def makeConnected(self, n, connections):
//  5          if len(connections) < n - 1:
//  6              return -1
//  7          graph = defaultdict(list)
//  8          for a, b in connections:
//  9              graph[a].append(b)
// 10              graph[b].append(a)
// 11          visited = set()
// 12          def dfs(node):
// 13              stack = [node]
// 14              while stack:
// 15                  cur = stack.pop()
// 16                  for nb in graph[cur]:
// 17                      if nb not in visited:
// 18                          visited.add(nb)
// 19                          stack.append(nb)
// 20          components = 0
// 21          for i in range(n):
// 22              if i not in visited:
// 23                  visited.add(i)
// 24                  dfs(i)
// 25                  components += 1
// 26          return components - 1
function buildSteps1319DFS(input, params) {
  const n = params.n !== undefined ? Number(params.n) : 4;
  const edgeList = String(input).split(";").map((s) => {
    const parts = s.trim().split(",").map(Number);
    return [parts[0], parts[1]];
  }).filter((e) => !isNaN(e[0]) && !isNaN(e[1]));

  const steps = [];
  const allNodes = Array.from({ length: n }, (_, i) => i);
  const allEdges = edgeList.map(([a, b]) => ({ u: a, v: b, w: "" }));

  function makeGraph(hlNodes, hlEdges, visitedNodes) {
    return {
      nodes: allNodes.map((id) => ({ id, label: String(id) })),
      edges: allEdges,
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: visitedNodes || [],
    };
  }

  function push({ title, hlNodes, hlEdges, visited, codeLines, vars, note, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: makeGraph(hlNodes, hlEdges, visited || []),
      highlight: [],
      mark: [],
      final,
      codeBlock: 2,
      codeLines,
      vars: vars || [],
      note,
    });
  }

  // Line 5: if len(connections) < n - 1
  const impossible = edgeList.length < n - 1;
  push({
    title: { vi: `len(connections) < n-1? ${impossible} (${edgeList.length} vs ${n - 1})`, en: `len(connections) < n-1? ${impossible} (${edgeList.length} vs ${n - 1})` },
    codeLines: [5],
    vars: [{ name: "len(connections)", value: edgeList.length }, { name: "n-1", value: n - 1 }],
    note: {
      vi: impossible ? "Không đủ cáp để nối tất cả máy tính." : "Đủ cáp (chưa chắc đúng vị trí) → tiếp tục.",
      en: impossible ? "Not enough cables to connect every computer." : "Enough cables (positions may still be wrong) → continue.",
    },
  });
  if (impossible) {
    push({
      title: { vi: "return -1", en: "return -1" },
      final: true,
      codeLines: [6],
      vars: [{ name: "answer", value: -1 }],
      note: { vi: "Không thể nối hết → trả -1.", en: "Cannot connect everything → return -1." },
    });
    return { input, answer: -1, steps };
  }

  // Line 7: graph = defaultdict(list)
  const adj = Array.from({ length: n }, () => []);
  push({
    title: { vi: "graph = defaultdict(list)", en: "graph = defaultdict(list)" },
    codeLines: [7],
    vars: [{ name: "graph", value: "{}" }],
    note: { vi: "Tạo adjacency list rỗng.", en: "Create an empty adjacency list." },
  });

  for (const [a, b] of edgeList) {
    push({
      title: { vi: `for a, b in connections: a,b = ${a},${b}`, en: `for a, b in connections: a,b = ${a},${b}` },
      hlNodes: [a, b],
      codeLines: [8],
      vars: [{ name: "a", value: a }, { name: "b", value: b }],
      note: { vi: `Xét cáp nối (${a}, ${b}).`, en: `Process cable (${a}, ${b}).` },
    });
    adj[a].push(b);
    push({
      title: { vi: `graph[${a}].append(${b})`, en: `graph[${a}].append(${b})` },
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      codeLines: [9],
      vars: [{ name: `graph[${a}]`, value: `[${adj[a].join(", ")}]` }],
      note: { vi: `Thêm ${b} vào danh sách kề của ${a}.`, en: `Add ${b} to ${a}'s adjacency list.` },
    });
    adj[b].push(a);
    push({
      title: { vi: `graph[${b}].append(${a})`, en: `graph[${b}].append(${a})` },
      hlNodes: [a, b],
      hlEdges: [[a, b]],
      codeLines: [10],
      vars: [{ name: `graph[${b}]`, value: `[${adj[b].join(", ")}]` }],
      note: { vi: `Thêm ${a} vào danh sách kề của ${b}.`, en: `Add ${a} to ${b}'s adjacency list.` },
    });
  }

  // Line 11: visited = set()
  const visited = new Set();
  push({
    title: { vi: "visited = set()", en: "visited = set()" },
    codeLines: [11],
    vars: [{ name: "visited", value: "{}" }],
    note: { vi: "Chưa thăm máy tính nào.", en: "No computer visited yet." },
  });

  push({
    title: { vi: "Định nghĩa dfs(node)", en: "Define dfs(node)" },
    codeLines: [12],
    vars: [],
    note: { vi: "Hàm DFS lặp (dùng stack) sẽ quét hết 1 component.", en: "The iterative DFS function (using a stack) explores one whole component." },
  });

  function dfs(node) {
    // Line 13: stack = [node]
    const stack = [node];
    push({
      title: { vi: `stack = [${node}]`, en: `stack = [${node}]` },
      hlNodes: [node],
      visited: [...visited],
      codeLines: [13],
      vars: [{ name: "stack", value: `[${node}]` }],
      note: { vi: `Đưa ${node} vào stack DFS.`, en: `Push ${node} onto the DFS stack.` },
    });

    while (stack.length) {
      // Line 14: while stack
      push({
        title: { vi: "while stack: stack không rỗng", en: "while stack: stack is non-empty" },
        visited: [...visited],
        codeLines: [14],
        vars: [{ name: "stack", value: `[${stack.join(", ")}]` }],
        note: { vi: "Còn đỉnh trong stack, tiếp tục DFS.", en: "Stack still has nodes, keep exploring." },
      });

      // Line 15: cur = stack.pop()
      const cur = stack.pop();
      push({
        title: { vi: `cur = stack.pop() = ${cur}`, en: `cur = stack.pop() = ${cur}` },
        hlNodes: [cur],
        visited: [...visited],
        codeLines: [15],
        vars: [{ name: "cur", value: cur }, { name: "stack", value: `[${stack.join(", ")}]` }],
        note: { vi: `Lấy ${cur} ra khỏi stack để xử lý.`, en: `Pop ${cur} from the stack to process.` },
      });

      // Line 16: for nb in graph[cur]
      push({
        title: { vi: `for nb in graph[${cur}]: [${adj[cur].join(", ")}]`, en: `for nb in graph[${cur}]: [${adj[cur].join(", ")}]` },
        hlNodes: [cur],
        hlEdges: adj[cur].map((nb) => [cur, nb]),
        visited: [...visited],
        codeLines: [16],
        vars: [{ name: "neighbors", value: `[${adj[cur].join(", ")}]` }],
        note: { vi: `Duyệt các máy tính nối trực tiếp với ${cur}.`, en: `Check computers directly wired to ${cur}.` },
      });

      for (const nb of adj[cur]) {
        // Line 17: if nb not in visited
        const already = visited.has(nb);
        push({
          title: { vi: `nb not in visited? ${!already} (nb=${nb})`, en: `nb not in visited? ${!already} (nb=${nb})` },
          hlNodes: [cur, nb],
          hlEdges: [[cur, nb]],
          visited: [...visited],
          codeLines: [17],
          vars: [{ name: "nb", value: nb }, { name: "in visited?", value: already }],
          note: {
            vi: already ? `${nb} đã thăm → bỏ qua.` : `${nb} chưa thăm → thêm vào visited và push vào stack.`,
            en: already ? `${nb} already visited → skip.` : `${nb} unvisited → mark visited and push onto the stack.`,
          },
        });
        if (already) continue;

        // Line 18: visited.add(nb)
        visited.add(nb);
        push({
          title: { vi: `visited.add(${nb})`, en: `visited.add(${nb})` },
          hlNodes: [nb],
          visited: [...visited],
          codeLines: [18],
          vars: [{ name: "visited", value: `{${[...visited].join(", ")}}` }],
          note: { vi: `Đánh dấu ${nb} đã thăm.`, en: `Mark ${nb} visited.` },
        });

        // Line 19: stack.append(nb)
        stack.push(nb);
        push({
          title: { vi: `stack.append(${nb})`, en: `stack.append(${nb})` },
          hlNodes: [nb],
          visited: [...visited],
          codeLines: [19],
          vars: [{ name: "stack", value: `[${stack.join(", ")}]` }],
          note: { vi: `Đưa ${nb} vào stack để xử lý sau.`, en: `Push ${nb} onto the stack to process later.` },
        });
      }
    }
    push({
      title: { vi: "while stack: stack rỗng → dfs kết thúc", en: "while stack: stack is empty → dfs finishes" },
      visited: [...visited],
      codeLines: [14],
      vars: [{ name: "stack", value: "[]" }],
      note: { vi: "Đã duyệt hết component chứa node xuất phát.", en: "The whole component containing the start node has been explored." },
    });
  }

  // Line 20: components = 0
  let components = 0;
  push({
    title: { vi: "components = 0", en: "components = 0" },
    codeLines: [20],
    vars: [{ name: "components", value: components }],
    note: { vi: "Biến đếm số nhóm máy tính rời rạc.", en: "Counter for disconnected computer groups." },
  });

  for (let i = 0; i < n; i++) {
    // Line 21: for i in range(n)
    push({
      title: { vi: `for i in range(n): i = ${i}`, en: `for i in range(n): i = ${i}` },
      hlNodes: [i],
      visited: [...visited],
      codeLines: [21],
      vars: [{ name: "i", value: i }, { name: "components", value: components }],
      note: { vi: `Xét máy tính ${i}.`, en: `Consider computer ${i}.` },
    });

    // Line 22: if i not in visited
    const already = visited.has(i);
    push({
      title: { vi: `i not in visited? ${!already}`, en: `i not in visited? ${!already}` },
      hlNodes: [i],
      visited: [...visited],
      codeLines: [22],
      vars: [{ name: "in visited?", value: already }],
      note: {
        vi: already ? `${i} đã thuộc nhóm xử lý trước → bỏ qua.` : `${i} chưa thăm → bắt đầu nhóm mới.`,
        en: already ? `${i} already belongs to a processed group → skip.` : `${i} unvisited → start a new group.`,
      },
    });
    if (already) continue;

    // Line 23: visited.add(i)
    visited.add(i);
    push({
      title: { vi: `visited.add(${i})`, en: `visited.add(${i})` },
      hlNodes: [i],
      visited: [...visited],
      codeLines: [23],
      vars: [{ name: "visited", value: `{${[...visited].join(", ")}}` }],
      note: { vi: `Đánh dấu ${i} đã thăm.`, en: `Mark ${i} visited.` },
    });

    // Line 24: dfs(i)
    push({
      title: { vi: `dfs(${i})`, en: `dfs(${i})` },
      hlNodes: [i],
      visited: [...visited],
      codeLines: [24],
      vars: [{ name: "calling", value: i }],
      note: { vi: `Gọi DFS để khám phá hết nhóm chứa ${i}.`, en: `Call DFS to explore the whole group containing ${i}.` },
    });
    dfs(i);

    // Line 25: components += 1
    components++;
    push({
      title: { vi: `components += 1 → ${components}`, en: `components += 1 → ${components}` },
      visited: [...visited],
      codeLines: [25],
      vars: [{ name: "components", value: components }],
      note: { vi: `Vừa khám phá xong 1 nhóm máy tính.`, en: `Just finished exploring one computer group.` },
    });
  }

  // Line 26: return components - 1
  const answer = components - 1;
  push({
    title: { vi: `return components - 1 → ${answer}`, en: `return components - 1 → ${answer}` },
    visited: [...visited],
    final: true,
    codeLines: [26],
    vars: [{ name: "components", value: components }, { name: "answer", value: answer }],
    note: {
      vi: `${components} nhóm riêng lẻ. Cần chuyển ${answer} cáp để nối tất cả thành 1 nhóm.`,
      en: `${components} disconnected group(s). Need ${answer} cable move(s) to merge them all into one.`,
    },
  });

  return { input, answer, steps };
}


// ─── 1319 Union-Find: Number of Operations to Make Network Connected ───
// Line-by-line trace of the exact code shown to the user:
//  1  class Solution:
//  2      def makeConnected(self, n, connections):
//  3          if len(connections) < n - 1:
//  4              return -1
//  5          parent = list(range(n))
//  6          def find(x):
//  7              while parent[x] != x:
//  8                  parent[x] = parent[parent[x]]
//  9                  x = parent[x]
// 10             return x
// 11         components, redundant = n, 0
// 12         for a, b in connections:
// 13             if find(a) == find(b):
// 14                 redundant += 1
// 15             else:
// 16                 parent[find(a)] = find(b)
// 17                 components -= 1
// 18         return components - 1
function buildSteps1319(input, params) {
  const n = params.n !== undefined ? Number(params.n) : 4;
  const edgeList = String(input).split(";").map((s) => {
    const parts = s.trim().split(",").map(Number);
    return { a: parts[0], b: parts[1] };
  }).filter((e) => !isNaN(e.a) && !isNaN(e.b));

  const steps = [];
  const parent = Array.from({ length: n }, (_, i) => i);
  const addedEdges = new Set();
  const redundantEdges = new Set();

  function graphSnap({ hlNodes = [], hlEdges = [], title, note, vars, codeLines, final = false }) {
    const rootOf = (x) => { let r = x; while (parent[r] !== r) r = parent[r]; return r; };
    const cnt = new Map();
    for (let i = 0; i < n; i++) { const r = rootOf(i); cnt.set(r, (cnt.get(r) || 0) + 1); }
    const visited = Array.from({ length: n }, (_, i) => (cnt.get(rootOf(i)) > 1 ? i : -1)).filter((x) => x >= 0);
    const gEdges = [];
    for (const key of addedEdges) {
      const [u, v] = key.split("-").map(Number);
      gEdges.push({ u, v, w: "" });
    }
    for (const key of redundantEdges) {
      const [u, v] = key.split("-").map(Number);
      gEdges.push({ u, v, w: "extra", style: "dashed" });
    }
    return {
      title,
      arr: [...parent],
      sub: parent.map((p, i) => (p === i ? "root" : `→${p}`)),
      highlight: hlNodes,
      mark: Array.from({ length: n }, (_, i) => i).filter((i) => parent[i] === i),
      graph: { nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: String(i) })), edges: gEdges, hlNodes, hlEdges, visitedNodes: visited },
      final,
      codeLines,
      vars: vars || [],
      note,
    };
  }
  function push(opts) { steps.push(graphSnap(opts)); }

  // Line 3: if len(connections) < n - 1
  const impossible = edgeList.length < n - 1;
  push({
    title: { vi: `len(connections) < n-1? ${impossible} (${edgeList.length} vs ${n - 1})`, en: `len(connections) < n-1? ${impossible} (${edgeList.length} vs ${n - 1})` },
    codeLines: [3],
    vars: [{ name: "len(connections)", value: edgeList.length }, { name: "n-1", value: n - 1 }],
    note: {
      vi: impossible ? "Không đủ cáp để nối tất cả máy tính." : "Đủ cáp (chưa chắc đúng vị trí) → tiếp tục.",
      en: impossible ? "Not enough cables to connect every computer." : "Enough cables (positions may still be wrong) → continue.",
    },
  });
  if (impossible) {
    push({
      title: { vi: "return -1", en: "return -1" },
      final: true,
      codeLines: [4],
      vars: [{ name: "answer", value: -1 }],
      note: { vi: "Không thể nối hết → trả -1.", en: "Cannot connect everything → return -1." },
    });
    return { input, answer: -1, steps };
  }

  // Line 5: parent = list(range(n))
  push({
    title: { vi: "parent = list(range(n))", en: "parent = list(range(n))" },
    codeLines: [5],
    vars: [{ name: "parent", value: `[${parent.join(",")}]` }],
    note: { vi: "Mỗi máy tính tự làm gốc của chính nó.", en: "Each computer starts as its own root." },
  });

  push({
    title: { vi: "Định nghĩa find(x)", en: "Define find(x)" },
    codeLines: [6],
    vars: [],
    note: { vi: "find(x) trả về gốc của x, có path compression.", en: "find(x) returns x's root, with path compression." },
  });

  // Line 11: components, redundant = n, 0
  let components = n;
  let redundant = 0;
  push({
    title: { vi: `components, redundant = ${n}, 0`, en: `components, redundant = ${n}, 0` },
    codeLines: [11],
    vars: [{ name: "components", value: components }, { name: "redundant", value: redundant }],
    note: { vi: `Ban đầu có ${n} nhóm riêng biệt, chưa có cáp dư.`, en: `Initially ${n} separate groups, no redundant cable yet.` },
  });

  function find(x, label) {
    while (true) {
      const done = parent[x] === x;
      push({
        hlNodes: [x],
        title: { vi: `find(${label}): while parent[${x}] != ${x}? ${done ? "False" : "True"}`, en: `find(${label}): while parent[${x}] != ${x}? ${done ? "False" : "True"}` },
        codeLines: [7],
        vars: [{ name: "x", value: x }, { name: "parent[x]", value: parent[x] }],
        note: {
          vi: done ? `${x} đã là gốc.` : `${x} chưa là gốc (parent[${x}]=${parent[x]}), tiếp tục đi lên.`,
          en: done ? `${x} is already a root.` : `${x} is not a root yet (parent[${x}]=${parent[x]}), keep climbing.`,
        },
      });
      if (done) {
        push({
          hlNodes: [x],
          title: { vi: `return ${x}`, en: `return ${x}` },
          codeLines: [10],
          vars: [{ name: "root", value: x }],
          note: { vi: `find(${label}) trả về gốc ${x}.`, en: `find(${label}) returns root ${x}.` },
        });
        return x;
      }
      const before = parent[x];
      const grand = parent[parent[x]];
      parent[x] = grand;
      push({
        hlNodes: [x],
        title: { vi: `parent[${x}] = parent[parent[${x}]] = ${grand}`, en: `parent[${x}] = parent[parent[${x}]] = ${grand}` },
        codeLines: [8],
        vars: [{ name: "parent[x] before", value: before }, { name: "parent[x] after", value: grand }, { name: "parent", value: `[${parent.join(",")}]` }],
        note: { vi: "Path compression: rút ngắn đường về gốc.", en: "Path compression: shortens the path to the root." },
      });
      x = parent[x];
      push({
        hlNodes: [x],
        title: { vi: `x = parent[x] = ${x}`, en: `x = parent[x] = ${x}` },
        codeLines: [9],
        vars: [{ name: "x", value: x }],
        note: { vi: `Tiếp tục xét đỉnh ${x}.`, en: `Continue checking node ${x}.` },
      });
    }
  }

  for (const { a, b } of edgeList) {
    // Line 12: for a, b in connections
    push({
      title: { vi: `for a, b in connections: a,b = ${a},${b}`, en: `for a, b in connections: a,b = ${a},${b}` },
      hlNodes: [a, b],
      codeLines: [12],
      vars: [{ name: "a", value: a }, { name: "b", value: b }],
      note: { vi: `Xét cáp (${a}, ${b}).`, en: `Process cable (${a}, ${b}).` },
    });

    const ra = find(a, "a");
    const rb = find(b, "b");

    // Line 13: if find(a) == find(b)
    const isCycle = ra === rb;
    push({
      title: { vi: `find(a) == find(b)? ${isCycle} (${ra} vs ${rb})`, en: `find(a) == find(b)? ${isCycle} (${ra} vs ${rb})` },
      hlNodes: [ra, rb],
      codeLines: [13],
      vars: [{ name: "find(a)", value: ra }, { name: "find(b)", value: rb }],
      note: {
        vi: isCycle ? "Cùng gốc → cáp này tạo vòng lặp, dư." : "Khác gốc → cáp hữu ích, cần gộp nhóm.",
        en: isCycle ? "Same root → this cable creates a cycle, redundant." : "Different roots → useful cable, merge groups.",
      },
    });

    const edgeKey = `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (isCycle) {
      // Line 14: redundant += 1
      redundant++;
      redundantEdges.add(edgeKey);
      push({
        title: { vi: `redundant += 1 → ${redundant}`, en: `redundant += 1 → ${redundant}` },
        hlNodes: [a, b],
        codeLines: [14],
        vars: [{ name: "redundant", value: redundant }],
        note: { vi: `Cáp (${a},${b}) dư, có thể tháo ra dùng lại chỗ khác.`, en: `Cable (${a},${b}) is redundant, can be reused elsewhere.` },
      });
    } else {
      // Line 16: parent[find(a)] = find(b)  (find(a), find(b) recomputed but return same roots since nothing changed since line 13)
      parent[ra] = rb;
      addedEdges.add(edgeKey);
      push({
        title: { vi: `parent[find(a)] = find(b) → parent[${ra}] = ${rb}`, en: `parent[find(a)] = find(b) → parent[${ra}] = ${rb}` },
        hlNodes: [ra, rb],
        hlEdges: [[a, b]],
        codeLines: [16],
        vars: [{ name: "parent", value: `[${parent.join(",")}]` }],
        note: { vi: `Gắn gốc ${ra} vào gốc ${rb}. Cáp (${a}─${b}) xuất hiện trên đồ thị.`, en: `Attach root ${ra} under root ${rb}. Cable (${a}─${b}) appears on the graph.` },
      });

      // Line 17: components -= 1
      components--;
      push({
        title: { vi: `components -= 1 → ${components}`, en: `components -= 1 → ${components}` },
        codeLines: [17],
        vars: [{ name: "components", value: components }],
        note: { vi: "Hai nhóm vừa được gộp lại.", en: "Two groups just merged." },
      });
    }
  }

  // Line 18: return components - 1
  const answer = components - 1;
  const fs = graphSnap({
    title: { vi: `return components - 1 → ${answer}`, en: `return components - 1 → ${answer}` },
    codeLines: [18],
    vars: [{ name: "components", value: components }, { name: "answer", value: answer }],
    note: {
      vi: `Còn ${components} nhóm chưa nối. Cần ${answer} thao tác chuyển cáp để nối tất cả.`,
      en: `${components} disconnected group(s) remain. Need ${answer} cable move(s) to connect them all.`,
    },
  });
  fs.final = true;
  steps.push(fs);

  return { input, answer, steps };
}

// ─── 323: Number of Connected Components in an Undirected Graph ───
function buildSteps323(input, params) {
  const n = params.n !== undefined ? Number(params.n) : 5;
  const edgeList = String(input).split(";").map((s) => {
    const [a, b] = s.trim().split(",").map(Number);
    return { a, b };
  }).filter((e) => !isNaN(e.a) && !isNaN(e.b));

  const steps = [];
  const parent = Array.from({ length: n }, (_, i) => i);
  const rnk = new Array(n).fill(0);
  let components = n;
  const addedEdges = new Set();

  function find(x) {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }
  function union(x, y) {
    const rx = find(x), ry = find(y);
    if (rx === ry) return false;
    if (rnk[rx] >= rnk[ry]) { parent[ry] = rx; if (rnk[rx] === rnk[ry]) rnk[rx]++; }
    else { parent[rx] = ry; }
    return true;
  }
  function compCount() {
    const cnt = new Map();
    for (let i = 0; i < n; i++) { const r = find(i); cnt.set(r, (cnt.get(r) || 0) + 1); }
    return cnt;
  }

  function graphSnap(title, note, hlNodes, hlEdges, vars, codeLines) {
    const cnt = compCount();
    const visited = Array.from({ length: n }, (_, i) => cnt.get(find(i)) > 1 ? i : -1).filter(x => x >= 0);
    const gEdges = [];
    for (const key of addedEdges) {
      const [u, v] = key.split("-").map(Number);
      gEdges.push({ u, v, w: "" });
    }
    return {
      title,
      arr: [...parent],
      sub: [...rnk],
      highlight: hlNodes || [],
      mark: Array.from({ length: n }, (_, i) => i).filter(i => parent[i] === i),
      graph: {
        nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: String(i) })),
        edges: gEdges,
        hlNodes: hlNodes || [],
        hlEdges: hlEdges || [],
        visitedNodes: visited,
      },
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    };
  }

  const edgesStr = edgeList.map((e) => `(${e.a},${e.b})`).join(", ");

  // ── Step 0: intro ──
  steps.push(graphSnap(
    { vi: "Khởi tạo: mỗi nút là 1 nhóm riêng", en: "Init: each node is its own component" },
    {
      vi:
        `${n} nút (0‥${n-1}), ${edgeList.length} cạnh: ${edgesStr}.\n` +
        `parent[i] = i, components = ${n}.\n\n` +
        `Dùng Union-Find: với mỗi cạnh (a,b), nếu a và b khác nhóm → gộp lại, components--.\n` +
        `Nút VÀNG = đang xét. Nút XANH = đã cùng nhóm với nút khác.`,
      en:
        `${n} nodes (0‥${n-1}), ${edgeList.length} edges: ${edgesStr}.\n` +
        `parent[i] = i, components = ${n}.\n\n` +
        `Union-Find: for each edge (a,b), if a and b are in different groups → merge, components--.\n` +
        `AMBER node = being processed. BLUE node = already in a multi-node component.`,
    },
    [], [],
    [{ name: "n", value: n }, { name: "components", value: components }, { name: "edges", value: edgesStr }],
    [2, 3]
  ));

  // ── Process each edge ──
  for (const { a, b } of edgeList) {
    const ra = find(a), rb = find(b);
    const alreadySame = ra === rb;

    if (!alreadySame) {
      union(a, b);
      components--;
      addedEdges.add(`${Math.min(a,b)}-${Math.max(a,b)}`);
    }

    steps.push(graphSnap(
      {
        vi: alreadySame
          ? `Cạnh (${a},${b}): đã cùng nhóm, bỏ qua`
          : `Union(${a},${b}) → ${components} nhóm`,
        en: alreadySame
          ? `Edge (${a},${b}): already same component, skip`
          : `Union(${a},${b}) → ${components} component(s)`,
      },
      {
        vi:
          alreadySame
            ? `find(${a}) = ${ra} = find(${b}) → cùng nhóm rồi, không cần union.`
            : `find(${a}) = ${ra} ≠ find(${b}) = ${rb} → gộp 2 nhóm.\nparent = [${parent.join(",")}], components = ${components}.`,
        en:
          alreadySame
            ? `find(${a}) = ${ra} = find(${b}) → already same group, skip.`
            : `find(${a}) = ${ra} ≠ find(${b}) = ${rb} → merge two groups.\nparent = [${parent.join(",")}], components = ${components}.`,
      },
      [a, b],
      alreadySame ? [] : [`${Math.min(a,b)}-${Math.max(a,b)}`],
      [
        { name: "edge", value: `(${a}, ${b})` },
        { name: "find(a)", value: ra },
        { name: "find(b)", value: rb },
        { name: "same?", value: alreadySame },
        { name: "components", value: components },
        { name: "parent", value: `[${parent.join(",")}]` },
      ],
      [5, 6, 7, 8]
    ));
  }

  // ── Final ──
  const fs = graphSnap(
    { vi: `Kết quả: ${components} nhóm`, en: `Result: ${components} component(s)` },
    {
      vi: `Đã xử lý hết ${edgeList.length} cạnh. Số nhóm kết nối = ${components}.`,
      en: `Processed all ${edgeList.length} edges. Number of connected components = ${components}.`,
    },
    [], [],
    [{ name: "answer", value: components }],
    [9]
  );
  fs.final = true;
  steps.push(fs);

  return { input, answer: components, steps };
}

// ─── 3532: Path Existence Queries in a Graph I ───
function buildSteps3532(input, params) {
  const approach = Number(params && params.approach) || 1;
  if (approach === 2) return buildSteps3532Prefix(input, params);
  return buildSteps3532UF(input, params);
}

function buildSteps3532UF(input, params) {
  const nums = String(input).split(",").map((s) => Number(s.trim()));
  const n = nums.length;
  const maxDiff = params.maxDiff !== undefined ? Number(params.maxDiff) : 1;
  const queries = String(params.queries || "").split(",").map((s) => { const [u, v] = s.trim().split(":").map(Number); return [u, v]; });
  const steps = [];

  const parent = Array.from({ length: n }, (_, i) => i);
  const rnk = new Array(n).fill(0);
  const addedEdges = new Set();

  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  function union(x, y) {
    const rx = find(x), ry = find(y);
    if (rx === ry) return false;
    if (rnk[rx] >= rnk[ry]) { parent[ry] = rx; if (rnk[rx] === rnk[ry]) rnk[rx]++; }
    else { parent[rx] = ry; }
    return true;
  }

  function graphSnap(title, note, hlNodes, hlEdges, visitedNodes, vars, codeLines) {
    const gEdges = [];
    for (const key of addedEdges) { const [u, v] = key.split("-").map(Number); gEdges.push({ u, v, w: "" }); }
    return {
      title, arr: [],
      graph: { nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: `${i}(${nums[i]})` })), edges: gEdges, hlNodes: hlNodes || [], hlEdges: hlEdges || [], visitedNodes: visitedNodes || [], annotations: {} },
      highlight: [], mark: [], codeLines: codeLines || [], vars: vars || [], note,
    };
  }

  steps.push(graphSnap(
    { vi: `Khởi tạo: ${n} nodes, maxDiff=${maxDiff}`, en: `Init: ${n} nodes, maxDiff=${maxDiff}` },
    { vi: `nums = [${nums.join(",")}]. maxDiff = ${maxDiff}.\nEdge giữa i và i+1 nếu |nums[i]-nums[i+1]| ≤ ${maxDiff}.\nDùng Union-Find gộp.`, en: `nums = [${nums.join(",")}]. maxDiff = ${maxDiff}.\nEdge between i and i+1 if |nums[i]-nums[i+1]| ≤ ${maxDiff}.\nUse Union-Find.` },
    [], [], [],
    [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "maxDiff", value: maxDiff }],
    [2, 3]
  ));

  // Build edges
  for (let i = 1; i < n; i++) {
    const diff = Math.abs(nums[i] - nums[i - 1]);
    const canConnect = diff <= maxDiff;
    if (canConnect) {
      union(i - 1, i);
      addedEdges.add(`${i - 1}-${i}`);
    }
    steps.push(graphSnap(
      { vi: `|nums[${i}]-nums[${i-1}]| = ${diff} ${canConnect ? "≤" : ">"} ${maxDiff} → ${canConnect ? "Union" : "Skip"}`, en: `|nums[${i}]-nums[${i-1}]| = ${diff} ${canConnect ? "≤" : ">"} ${maxDiff} → ${canConnect ? "Union" : "Skip"}` },
      { vi: `|${nums[i]} - ${nums[i-1]}| = ${diff}. ${canConnect ? `≤ ${maxDiff} → nối edge (${i-1},${i}).` : `> ${maxDiff} → không nối.`}`, en: `|${nums[i]} - ${nums[i-1]}| = ${diff}. ${canConnect ? `≤ ${maxDiff} → add edge (${i-1},${i}).` : `> ${maxDiff} → no edge.`}` },
      [i - 1, i], canConnect ? [`${i-1}-${i}`] : [], [],
      [{ name: "i", value: i }, { name: "diff", value: `|${nums[i]}-${nums[i-1]}| = ${diff}` }, { name: "connect?", value: canConnect }, { name: "parent", value: `[${parent.join(",")}]` }],
      [9, 10, 11]
    ));
  }

  // Answer queries
  const answers = [];
  for (const [u, v] of queries) {
    const ru = find(u), rv = find(v);
    const ans = ru === rv;
    answers.push(ans);
    steps.push(graphSnap(
      { vi: `Query (${u},${v}): find(${u})=${ru}, find(${v})=${rv} → ${ans}`, en: `Query (${u},${v}): find(${u})=${ru}, find(${v})=${rv} → ${ans}` },
      { vi: `${ans ? "✓ Cùng nhóm → có đường." : "✗ Khác nhóm → không có đường."}`, en: `${ans ? "✓ Same group → path exists." : "✗ Different groups → no path."}` },
      [u, v], [], [],
      [{ name: "query", value: `(${u}, ${v})` }, { name: "find(u)", value: ru }, { name: "find(v)", value: rv }, { name: "answer", value: ans }],
      [12]
    ));
  }

  const fs = graphSnap(
    { vi: `Kết quả: [${answers.join(",")}]`, en: `Result: [${answers.join(",")}]` },
    { vi: `Đáp án: [${answers.join(",")}].`, en: `Answers: [${answers.join(",")}].` },
    [], [], Array.from({ length: n }, (_, i) => i),
    [{ name: "answer", value: `[${answers.join(",")}]` }],
    [12]
  );
  fs.final = true;
  steps.push(fs);
  return { input, answer: `[${answers.join(",")}]`, steps };
}

// ─── 3532 Approach 2: Prefix Array O(n + q) ───
function buildSteps3532Prefix(input, params) {
  const nums = String(input).split(",").map((s) => Number(s.trim()));
  const n = nums.length;
  const maxDiff = params.maxDiff !== undefined ? Number(params.maxDiff) : 1;
  const queries = String(params.queries || "").split(",").map((s) => { const [u, v] = s.trim().split(":").map(Number); return [u, v]; });
  const steps = [];

  const pre = new Array(n).fill(0);

  steps.push({
    title: { vi: "Prefix Array: gán nhóm liên tiếp", en: "Prefix Array: assign consecutive groups" },
    arr: nums, sub: pre.map(String),
    highlight: [], mark: [], codeLines: [2, 3], codeBlock: 2,
    vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "maxDiff", value: maxDiff }, { name: "pre", value: `[${pre.join(",")}]` }],
    note: {
      vi: `pre[i] = ID nhóm kết nối của node i.\npre[0] = 0. Nếu |nums[i]-nums[i-1]| ≤ maxDiff → cùng nhóm (pre[i]=pre[i-1]).\nNgược lại → nhóm mới (pre[i]=pre[i-1]+1).`,
      en: `pre[i] = connected component ID of node i.\npre[0] = 0. If |nums[i]-nums[i-1]| ≤ maxDiff → same group (pre[i]=pre[i-1]).\nOtherwise → new group (pre[i]=pre[i-1]+1).`,
    },
  });

  for (let i = 1; i < n; i++) {
    const diff = Math.abs(nums[i] - nums[i - 1]);
    const same = diff <= maxDiff;
    pre[i] = same ? pre[i - 1] : pre[i - 1] + 1;

    steps.push({
      title: { vi: `i=${i}: |${nums[i]}-${nums[i-1]}|=${diff} ${same ? "≤" : ">"} ${maxDiff} → pre[${i}]=${pre[i]}`, en: `i=${i}: |${nums[i]}-${nums[i-1]}|=${diff} ${same ? "≤" : ">"} ${maxDiff} → pre[${i}]=${pre[i]}` },
      arr: nums, sub: pre.map(String),
      highlight: [i - 1, i], mark: [], codeLines: [4, 5, 6, 7], codeBlock: 2,
      vars: [{ name: "i", value: i }, { name: "diff", value: `|${nums[i]}-${nums[i-1]}| = ${diff}` }, { name: "same group?", value: same }, { name: "pre[i]", value: pre[i] }, { name: "pre", value: `[${pre.join(",")}]` }],
      note: { vi: same ? `Cùng nhóm: pre[${i}] = pre[${i-1}] = ${pre[i]}.` : `Nhóm mới: pre[${i}] = pre[${i-1}]+1 = ${pre[i]}.`, en: same ? `Same group: pre[${i}] = pre[${i-1}] = ${pre[i]}.` : `New group: pre[${i}] = pre[${i-1}]+1 = ${pre[i]}.` },
    });
  }

  // Queries
  const answers = [];
  for (const [u, v] of queries) {
    const ans = pre[u] === pre[v];
    answers.push(ans);
    steps.push({
      title: { vi: `Query (${u},${v}): pre[${u}]=${pre[u]}, pre[${v}]=${pre[v]} → ${ans}`, en: `Query (${u},${v}): pre[${u}]=${pre[u]}, pre[${v}]=${pre[v]} → ${ans}` },
      arr: nums, sub: pre.map(String),
      highlight: [u, v], mark: ans ? [u, v] : [], codeLines: [8, 9], codeBlock: 2,
      vars: [{ name: "query", value: `(${u},${v})` }, { name: "pre[u]", value: pre[u] }, { name: "pre[v]", value: pre[v] }, { name: "answer", value: ans }],
      note: { vi: ans ? `pre[${u}] == pre[${v}] → cùng nhóm → có đường.` : `pre[${u}] ≠ pre[${v}] → khác nhóm → không có đường.`, en: ans ? `pre[${u}] == pre[${v}] → same group → path exists.` : `pre[${u}] ≠ pre[${v}] → different groups → no path.` },
    });
  }

  const fs = {
    title: { vi: `Kết quả: [${answers.join(",")}]`, en: `Result: [${answers.join(",")}]` },
    arr: nums, sub: pre.map(String),
    highlight: [], mark: Array.from({ length: n }, (_, i) => i), final: true, codeLines: [9], codeBlock: 2,
    vars: [{ name: "answer", value: `[${answers.join(",")}]` }, { name: "pre", value: `[${pre.join(",")}]` }],
    note: { vi: `Prefix array O(n) + mỗi query O(1). Tổng O(n+q).`, en: `Prefix array O(n) + each query O(1). Total O(n+q).` },
  };
  steps.push(fs);
  return { input, answer: `[${answers.join(",")}]`, steps };
}

module.exports = {
  547: {
    id: 547,
    difficulty: "medium",
    slug: "number-of-provinces",
    category: DFS_CAT,
    title: { vi: "Number of Provinces", en: "Number of Provinces" },
    titleVi: { vi: "Số lượng tỉnh (Union-Find)", en: "Number of connected components" },
    statement: {
      vi: "Cho ma trận kề isConnected[i][j]=1 nếu thành phố i và j kết nối trực tiếp. Tìm số TỈNH (nhóm kết nối). Nhập các hàng cách bởi ';', giá trị cách bởi ','.",
      en: "Given adjacency matrix isConnected where isConnected[i][j]=1 means city i and j are directly connected. Find the number of PROVINCES (connected components). Enter rows separated by ';', values by ','.",
    },
    defaultInput: "[[1,1,0],[1,1,0],[0,0,1]]",
    inputKind: "string",
    inputLabel: { vi: "Ma trận kề dạng [[1,1,0],[1,1,0],[0,0,1]]", en: "Adjacency matrix e.g. [[1,1,0],[1,1,0],[0,0,1]]" },
    extraParams: [
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: Union-Find (DSU)", en: "Approach 1: Union-Find (DSU)" } },
        { value: "2", label: { vi: "Cách 2: DFS đệ quy", en: "Approach 2: Recursive DFS" } },
      ] },
    ],
    approach: [
      { vi: "Union-Find (DSU): mỗi thành phố bắt đầu là 1 tỉnh riêng (parent[i]=i).", en: "Union-Find (DSU): each city starts as its own province (parent[i]=i)." },
      { vi: "Duyệt ma trận: nếu isConnected[i][j]=1 → Union(i, j), gộp 2 nhóm lại, giảm đếm components.", en: "Scan matrix: if isConnected[i][j]=1 → Union(i,j), merge two groups, decrement component count." },
      { vi: "Union by rank: gắn gốc rank nhỏ hơn vào gốc rank lớn hơn → cây thấp, find() nhanh O(α(n)).", en: "Union by rank: attach the smaller-rank root under the larger-rank root → shallow tree, find() near O(α(n))." },
      { vi: "Path compression trong find(): rút ngắn đường đi về gốc → tăng tốc các lần sau.", en: "Path compression in find(): flatten the path to the root → speeds up subsequent calls." },
    ],
    complexity: {
      time: "O(n² · α(n))",
      space: "O(n)",
      note: {
        vi: "n² ô ma trận, mỗi union/find gần O(1) nhờ path compression + union by rank.",
        en: "n² matrix cells, each union/find nearly O(1) with path compression + union by rank.",
      },
    },
    code: [
      "class UnionFind:",
      "    def __init__(self, n):",
      "        self.parent = list(range(n))",
      "        self.rank = [0] * n",
      "        self.components = n",
      "    def find(self, x):",
      "        while self.parent[x] != x:",
      "            self.parent[x] = self.parent[self.parent[x]]  # path compression",
      "            x = self.parent[x]",
      "        return x",
      "    def union(self, x, y):",
      "        rx, ry = self.find(x), self.find(y)",
      "        if rx == ry: return",
      "        if self.rank[rx] < self.rank[ry]: rx, ry = ry, rx",
      "        self.parent[ry] = rx",
      "        if self.rank[rx] == self.rank[ry]: self.rank[rx] += 1",
      "        self.components -= 1",
      "class Solution:",
      "    def findCircleNum(self, isConnected):",
      "        n = len(isConnected)",
      "        uf = UnionFind(n)",
      "        for i in range(n):",
      "            for j in range(i + 1, n):",
      "                if isConnected[i][j]:",
      "                    uf.union(i, j)",
      "        return uf.components",
    ],
    code2: [
      "class Solution:",
      "    def findCircleNum(self, isConnected):",
      "        n = len(isConnected)",
      "        count = 0",
      "        visited = [False for _ in range(n)]",
      "        def dfs(curr):",
      "            visited[curr] = True",
      "            for next in range(n):",
      "                if isConnected[curr][next] == 1:",
      "                    if not visited[next]:",
      "                        dfs(next)",
      "        for i in range(n):",
      "            if not visited[i]:",
      "                dfs(i)",
      "                count += 1",
      "        return count",
    ],
    codeLabel: { vi: "Cách 1: Union-Find (DSU)", en: "Approach 1: Union-Find (DSU)" },
    code2Label: { vi: "Cách 2: DFS đệ quy", en: "Approach 2: Recursive DFS" },
    builder: buildSteps547,
  },
  1258: {
    id: 1258,
    difficulty: "medium",
    slug: "synonymous-sentences",
    category: UF_CAT,
    title: { vi: "Synonymous Sentences", en: "Synonymous Sentences" },
    titleVi: { vi: "Sinh câu đồng nghĩa (Union-Find)", en: "Generate all synonym sentences" },
    statement: {
      vi: "Cho danh sách cặp synonym và 1 câu. Sinh tất cả câu có thể bằng cách thay các từ bằng từ đồng nghĩa, theo thứ tự từ điển. Nhập cặp synonym dạng 'w1:w2' cách bởi ','. Nhập câu ở ô sentence.",
      en: "Given synonym pairs and a sentence, generate all possible sentences by replacing words with synonyms, in lexicographic order. Enter pairs as 'w1:w2' comma-separated. Enter the sentence in the sentence field.",
    },
    defaultInput: "happy:joy,happy:cheerful,sad:sorrow",
    inputKind: "string",
    inputLabel: { vi: "Cặp synonym (vd: happy:joy,sad:sorrow)", en: "Synonym pairs (e.g. happy:joy,sad:sorrow)" },
    extraParams: [
      {
        key: "sentence",
        label: { vi: "Câu", en: "Sentence" },
        type: "string",
        default: "I am happy today but was sad yesterday",
      },
    ],
    approach: [
      { vi: "Gán mỗi từ 1 index. Union-Find gộp các từ đồng nghĩa vào cùng nhóm.", en: "Assign each word an index. Union-Find groups synonyms together." },
      { vi: "Union by rank: gốc rank lớn hơn hấp thụ gốc nhỏ hơn → cây thấp.", en: "Union by rank: larger-rank root absorbs smaller → keeps tree shallow." },
      { vi: "Với mỗi từ trong câu, lấy nhóm synonym (sort). Dùng backtracking sinh mọi tổ hợp.", en: "For each word, get its synonym group (sorted). Backtrack to generate all combinations." },
      { vi: "Kết quả tự nhiên theo thứ tự từ điển vì nhóm đã được sort.", en: "Result is lexicographic since each group is pre-sorted." },
    ],
    complexity: {
      time: "O(p·α(v) + w·g^w)",
      space: "O(v)",
      note: {
        vi: "p = số cặp, v = vocab size, w = số từ trong câu, g = kích thước nhóm lớn nhất.",
        en: "p = pair count, v = vocab size, w = sentence words, g = max group size.",
      },
    },
    code: [
      "class Solution:",
      "    def generateSentences(self, synonyms, text):",
      "        parent = {}",
      "        def find(x):",
      "            parent.setdefault(x, x)",
      "            if parent[x] != x: parent[x] = find(parent[x])",
      "            return parent[x]",
      "        def union(x, y):",
      "            parent[find(x)] = find(y)",
      "        for a, b in synonyms:",
      "            union(a, b)",
      "        # Group synonyms by their root",
      "        from collections import defaultdict",
      "        groups = defaultdict(list)",
      "        all_words = set(w for pair in synonyms for w in pair)",
      "        for w in all_words:",
      "            groups[find(w)].append(w)",
      "        for g in groups.values(): g.sort()",
      "        # Backtrack to generate all sentences",
      "        res, words = [], text.split()",
      "        def backtrack(i, cur):",
      "            if i == len(words):",
      "                res.append(' '.join(cur)); return",
      "            for syn in groups.get(find(words[i]), [words[i]]):",
      "                backtrack(i + 1, cur + [syn])",
      "        backtrack(0, [])",
      "        return sorted(res)",
    ],
    builder: buildSteps1258,
  },
  1631: {
    id: 1631,
    difficulty: "medium",
    slug: "path-with-minimum-effort",
    category: UF_CAT,
    title: { vi: "Path With Minimum Effort", en: "Path With Minimum Effort" },
    titleVi: { vi: "Đường đi với effort tối thiểu (Union-Find)", en: "Minimum effort path (Union-Find / Kruskal)" },
    statement: {
      vi: "Cho grid m×n. Effort của 1 đường đi = |diff| LỚN NHẤT giữa 2 ô liền kề trên đường. Tìm đường từ (0,0) đến (m-1,n-1) có effort nhỏ nhất. Nhập grid: hàng cách bởi ';', giá trị cách bởi ','.",
      en: "Given an m×n grid. Effort of a path = the MAXIMUM absolute difference between adjacent cells on the path. Find the path from (0,0) to (m-1,n-1) with minimum effort. Enter grid rows by ';', values by ','.",
    },
    defaultInput: "1,2,2;3,8,2;5,3,5",
    inputKind: "string",
    inputLabel: { vi: "Grid (hàng cách ';')", en: "Grid (rows by ';')" },
    extraParams: [],
    approach: [
      { vi: "Tạo tất cả cạnh giữa các ô kề (ngang/dọc), gán trọng số = |diff| giữa 2 ô.", en: "Build all edges between adjacent cells (horizontal/vertical), weight = |diff|." },
      { vi: "Sắp cạnh theo |diff| tăng dần (Kruskal-style).", en: "Sort edges by |diff| ascending (Kruskal-style)." },
      { vi: "Lần lượt Union từng cạnh. Dừng ngay khi (0,0) và (m-1,n-1) cùng nhóm → |diff| của cạnh đó là đáp án (bottleneck edge).", en: "Union edges one by one. Stop as soon as (0,0) and (m-1,n-1) are in the same group → that edge's |diff| is the answer (bottleneck edge)." },
      { vi: "Correct vì: cạnh cuối cùng thêm vào luôn là cạnh \"nút thắt cổ chai\" quyết định effort của đường đi tốt nhất.", en: "Correct because: the last added edge is always the bottleneck that determines the effort of the optimal path." },
    ],
    complexity: {
      time: "O(m·n · log(m·n))",
      space: "O(m·n)",
      note: {
        vi: "Sắp xếp O(E log E), E = O(m·n). Mỗi union/find gần O(1).",
        en: "Sorting O(E log E), E = O(m·n). Each union/find near O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def minimumEffortPath(self, heights):",
      "        rows, cols = len(heights), len(heights[0])",
      "        edges = []",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if r + 1 < rows:",
      "                    edges.append((abs(heights[r][c]-heights[r+1][c]), r*cols+c, (r+1)*cols+c))",
      "                if c + 1 < cols:",
      "                    edges.append((abs(heights[r][c]-heights[r][c+1]), r*cols+c, r*cols+c+1))",
      "        edges.sort()",
      "        parent = list(range(rows * cols))",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "        def union(x, y):",
      "            parent[find(x)] = find(y)",
      "        for diff, u, v in edges:",
      "            union(u, v)",
      "            if find(0) == find(rows*cols - 1):",
      "                return diff",
      "        return 0",
    ],
    builder: buildSteps1631,
  },
  1101: {
    id: 1101,
    difficulty: "medium",
    slug: "the-earliest-moment-when-everyone-become-friends",
    category: UF_CAT,
    title: { vi: "The Earliest Moment When Everyone Become Friends", en: "The Earliest Moment When Everyone Become Friends" },
    titleVi: { vi: "Thời điểm sớm nhất mọi người quen nhau", en: "Earliest moment all friends" },
    statement: {
      vi: "Có n người (0‥n-1). Mỗi log [t, a, b] nghĩa là a và b quen nhau tại thời điểm t. Tìm timestamp SỚM NHẤT để mọi người đều kết nối (trực tiếp hoặc gián tiếp). Nhập logs: 't,a,b;t,a,b;...'.",
      en: "There are n people (0‥n-1). Each log [t, a, b] means a and b become friends at time t. Find the EARLIEST timestamp when everyone is connected (directly or indirectly). Enter logs as 't,a,b;t,a,b;...'.",
    },
    defaultInput: "20,0,2;50,1,3;10,0,1;80,3,4;70,2,3",
    inputKind: "string",
    inputLabel: { vi: "Logs (t,a,b cách bởi ';')", en: "Logs (t,a,b separated by ';')" },
    extraParams: [{ key: "n", label: { vi: "n (số người)", en: "n (number of people)" }, default: 5 }],
    approach: [
      { vi: "Sắp logs theo timestamp tăng dần.", en: "Sort logs by timestamp ascending." },
      { vi: "Union-Find: lần lượt union từng cặp (a, b). Mỗi union giảm components đi 1.", en: "Union-Find: union each pair (a, b). Each merge decreases component count by 1." },
      { vi: "Khi components = 1 → trả timestamp của log đó. Nếu không bao giờ về 1 → trả -1.", en: "When components = 1 → return that log's timestamp. If it never reaches 1 → return -1." },
    ],
    complexity: {
      time: "O(m log m + m·α(n))",
      space: "O(n)",
      note: { vi: "m = số logs, sắp xếp O(m log m). Mỗi union/find gần O(1).", en: "m = number of logs, sort O(m log m). Each union/find near O(1)." },
    },
    code: [
      "class Solution:",
      "    def earliestAcq(self, logs, n):",
      "        logs.sort()  # sort by timestamp",
      "        parent = list(range(n))",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "        components = n",
      "        for t, a, b in logs:",
      "            ra, rb = find(a), find(b)",
      "            if ra != rb:",
      "                parent[ra] = rb",
      "                components -= 1",
      "            if components == 1:",
      "                return t",
      "        return -1",
    ],
    builder: buildSteps1101,
  },
  1319: {
    id: 1319,
    difficulty: "medium",
    slug: "number-of-operations-to-make-network-connected",
    category: DFS_CAT,
    title: { vi: "Number of Operations to Make Network Connected", en: "Number of Operations to Make Network Connected" },
    titleVi: { vi: "Số thao tác để nối mạng", en: "Operations to connect all computers" },
    statement: {
      vi: "Có n máy tính (0..n-1) và connections[][2] là các cáp mạng. Mỗi thao tác: tháo 1 cáp và cắm lại nơi khác. Tìm số thao tác ít nhất để tất cả máy tính liên thông. Không được thì trả -1. Nhập cạnh: 'a,b' cách bởi ';'.",
      en: "There are n computers (0..n-1) and connections[][2] are cables. One operation: remove a cable and plug it elsewhere. Find the minimum operations to make all computers connected. Return -1 if impossible. Enter edges as 'a,b' separated by ';'.",
    },
    defaultInput: "0,1;0,2;1,2",
    inputKind: "string",
    inputLabel: { vi: "connections (a,b;a,b...)", en: "connections (a,b;a,b...)" },
    extraParams: [
      { key: "n", label: { vi: "n (số máy tính)", en: "n (computers)" }, default: 4 },
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Union-Find", en: "Approach 1: Union-Find" } },
          { value: "2", label: { vi: "Cách 2: DFS (đếm components)", en: "Approach 2: DFS (count components)" } },
        ],
      },
    ],
    approach: [
      { vi: "Nếu số cáp < n-1 → trả -1 ngay.", en: "If edges < n-1 → return -1 immediately." },
      { vi: "Cách 1 (Union-Find): cáp hữu ích gộp nhóm; cáp dư = vòng lặp. Đáp án = components-1.", en: "Approach 1 (Union-Find): useful cable merges groups; redundant = cycle. Answer = components-1." },
      { vi: "Cách 2 (DFS): DFS từ mỗi nút chưa thăm đếm số components. Đáp án = components-1.", en: "Approach 2 (DFS): DFS from each unvisited node counts components. Answer = components-1." },
    ],
    complexity: {
      time: "O(E · α(n)) / O(n + E)",
      space: "O(n)",
      note: {
        vi: "Cách 1: Union-Find O(E·α(n)). Cách 2: DFS O(n+E).",
        en: "Approach 1: Union-Find O(E·α(n)). Approach 2: DFS O(n+E).",
      },
    },
    code: [
      "class Solution:",
      "    def makeConnected(self, n, connections):",
      "        if len(connections) < n - 1:",
      "            return -1",
      "        parent = list(range(n))",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "        components, redundant = n, 0",
      "        for a, b in connections:",
      "            if find(a) == find(b):",
      "                redundant += 1",
      "            else:",
      "                parent[find(a)] = find(b)",
      "                components -= 1",
      "        return components - 1",
    ],
    code2: [
      "from collections import defaultdict",
      "",
      "class Solution:",
      "    def makeConnected(self, n, connections):",
      "        if len(connections) < n - 1:",
      "            return -1",
      "        graph = defaultdict(list)",
      "        for a, b in connections:",
      "            graph[a].append(b)",
      "            graph[b].append(a)",
      "        visited = set()",
      "        def dfs(node):",
      "            stack = [node]",
      "            while stack:",
      "                cur = stack.pop()",
      "                for nb in graph[cur]:",
      "                    if nb not in visited:",
      "                        visited.add(nb)",
      "                        stack.append(nb)",
      "        components = 0",
      "        for i in range(n):",
      "            if i not in visited:",
      "                visited.add(i)",
      "                dfs(i)",
      "                components += 1",
      "        return components - 1",
    ],
    codeLabel: { vi: "Cách 1: Union-Find", en: "Approach 1: Union-Find" },
    code2Label: { vi: "Cách 2: DFS", en: "Approach 2: DFS" },
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps1319DFS(input, params) : buildSteps1319(input, params);
    },
  },
  323: {
    id: 323,
    difficulty: "medium",
    slug: "number-of-connected-components-in-an-undirected-graph",
    category: UF_CAT,
    title: { vi: "Number of Connected Components in an Undirected Graph", en: "Number of Connected Components in an Undirected Graph" },
    titleVi: { vi: "Số nhóm kết nối (Union-Find)", en: "Count connected components (Union-Find)" },
    statement: {
      vi: "Cho n nút (0‥n-1) và danh sách cạnh vô hướng. Tìm số nhóm kết nối. Nhập cạnh dạng 'a,b;a,b;...'.",
      en: "Given n nodes (0‥n-1) and a list of undirected edges, find the number of connected components. Enter edges as 'a,b;a,b;...'.",
    },
    defaultInput: "0,1;1,2;3,4",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (a,b cách bởi ';')", en: "Edges (a,b separated by ';')" },
    extraParams: [{ key: "n", label: { vi: "n (số nút)", en: "n (number of nodes)" }, default: 5 }],
    approach: [
      { vi: "Khởi tạo parent[i]=i, components=n.", en: "Initialize parent[i]=i, components=n." },
      { vi: "Với mỗi cạnh (a,b): nếu khác nhóm → union, components--.", en: "For each edge (a,b): if different groups → union, components--." },
      { vi: "Kết quả = components sau khi xử lý hết cạnh.", en: "Result = components after processing all edges." },
    ],
    complexity: { time: "O((n+e)·α(n))", space: "O(n)", note: { vi: "e = số cạnh.", en: "e = number of edges." } },
    code: [
      "class Solution:",
      "    def countComponents(self, n, edges):",
      "        parent = list(range(n))",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "        components = n",
      "        for a, b in edges:",
      "            ra, rb = find(a), find(b)",
      "            if ra != rb:",
      "                parent[ra] = rb",
      "                components -= 1",
      "        return components",
    ],
    builder: buildSteps323,
  },
  3532: {
    id: 3532,
    difficulty: "medium",
    slug: "path-existence-queries-in-a-graph-i",
    category: UF_CAT,
    title: { vi: "Path Existence Queries in a Graph I", en: "Path Existence Queries in a Graph I" },
    titleVi: { vi: "Truy vấn đường đi (Union-Find)", en: "Path existence queries (Union-Find)" },
    statement: {
      vi: "Có n nodes, mỗi node i có giá trị nums[i]. Edge tồn tại giữa node liền kề i và i+1 nếu |nums[i]-nums[i+1]| ≤ maxDiff. Trả lời mỗi query [u,v]: có đường nối u-v không? Nhập: nums (dấu phẩy); maxDiff; queries (u:v cách bởi dấu phẩy).",
      en: "There are n nodes, each with value nums[i]. An edge exists between adjacent nodes i and i+1 if |nums[i]-nums[i+1]| ≤ maxDiff. Answer queries [u,v]: is there a path from u to v? Enter: nums (comma); maxDiff; queries (u:v comma-sep).",
    },
    defaultInput: "4,4,2,3",
    inputKind: "string",
    inputLabel: { vi: "nums (dấu phẩy)", en: "nums (comma-separated)" },
    extraParams: [
      { key: "maxDiff", label: { vi: "maxDiff", en: "maxDiff" }, default: 1 },
      { key: "queries", label: { vi: "queries (u:v,u:v)", en: "queries (u:v,u:v)" }, type: "string", default: "2:3,0:3" },
      { key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1", options: [
        { value: "1", label: { vi: "Cách 1: Union-Find", en: "Approach 1: Union-Find" } },
        { value: "2", label: { vi: "Cách 2: Prefix Array O(n+q)", en: "Approach 2: Prefix Array O(n+q)" } },
      ] },
    ],
    approach: [
      { vi: "Cách 1: Union-Find — union(i-1,i) nếu |nums[i]-nums[i-1]| ≤ maxDiff.", en: "Approach 1: Union-Find — union(i-1,i) if |nums[i]-nums[i-1]| ≤ maxDiff." },
      { vi: "Cách 2: Prefix Array — pre[i] = group ID. Cùng group ↔ có đường. O(n+q).", en: "Approach 2: Prefix Array — pre[i] = group ID. Same group ↔ path exists. O(n+q)." },
    ],
    complexity: { time: "O(n·α(n)+q) / O(n+q)", space: "O(n)", note: { vi: "UF: n unions + q finds. Prefix: 1 pass + O(1)/query.", en: "UF: n unions + q finds. Prefix: 1 pass + O(1)/query." } },
    code: [
      "class Solution:",
      "    def pathExistenceQueries(self, n, nums, maxDiff, queries):",
      "        parent = list(range(n))",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "        for i in range(1, n):",
      "            if abs(nums[i] - nums[i-1]) <= maxDiff:",
      "                parent[find(i)] = find(i-1)",
      "        return [find(u) == find(v) for u, v in queries]",
    ],
    code2: [
      "class Solution:",
      "    def pathExistenceQueries(self, n, nums, maxDiff, queries):",
      "        pre = [0] * n",
      "        for i in range(1, n):",
      "            if abs(nums[i] - nums[i-1]) <= maxDiff:",
      "                pre[i] = pre[i-1]",
      "            else:",
      "                pre[i] = pre[i-1] + 1",
      "        return [pre[u] == pre[v] for u, v in queries]",
    ],
    codeLabel: { vi: "Cách 1: Union-Find", en: "Approach 1: Union-Find" },
    code2Label: { vi: "Cách 2: Prefix Array", en: "Approach 2: Prefix Array" },
    builder: buildSteps3532,
  },
};
