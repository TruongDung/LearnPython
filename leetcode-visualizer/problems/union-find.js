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
  const sentence = String((params && params.sentence) || "I am happy today but was sad yesterday").trim();
  const words = sentence.split(/\s+/).filter(Boolean);
  const pairs = String(input)
    .split(",")
    .map((raw) => raw.trim().split(":").map((word) => word.trim()))
    .filter((pair) => pair.length === 2 && pair[0] && pair[1]);
  const synonymWords = [...new Set(pairs.flat())].sort();
  const parent = new Map();
  const builtGroups = new Map();
  const results = [];
  const steps = [];

  function find(word) {
    if (!parent.has(word)) parent.set(word, word);
    if (parent.get(word) !== word) parent.set(word, find(parent.get(word)));
    return parent.get(word);
  }

  function rootForView(word) {
    let root = word;
    const seen = new Set();
    while (parent.has(root) && parent.get(root) !== root && !seen.has(root)) {
      seen.add(root);
      root = parent.get(root);
    }
    return root;
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    parent.set(rootA, rootB);
    return { rootA, rootB };
  }

  function unionGroups() {
    const grouped = new Map();
    for (const word of synonymWords) {
      const root = rootForView(word);
      if (!grouped.has(root)) grouped.set(root, []);
      grouped.get(root).push(word);
    }
    return [...grouped.entries()]
      .map(([root, members]) => ({ root, words: [...members].sort() }))
      .sort((a, b) => a.words[0].localeCompare(b.words[0]));
  }

  function builtGroupSnapshot() {
    return [...builtGroups.entries()]
      .map(([root, members]) => ({ root, words: [...members] }))
      .sort((a, b) => (a.words[0] || a.root).localeCompare(b.words[0] || b.root));
  }

  function optionsFor(word) {
    if (!synonymWords.includes(word)) return [word];
    const root = rootForView(word);
    return synonymWords.filter((candidate) => rootForView(candidate) === root).sort();
  }

  function optionsSnapshot() {
    return words.map((word) => optionsFor(word));
  }

  function parentSnapshot() {
    return [...parent.entries()].sort(([a], [b]) => a.localeCompare(b));
  }

  function pushStep({
    title, note, codeLines, phaseIndex, mode, action, activePair = -1,
    processedPairs = 0, groups, activeWords = [], activeWord = -1,
    prefix = [], currentChoice = null, dfsState = null, vars = [], final = false,
  }) {
    const step = {
      title,
      arr: [],
      highlight: [],
      mark: [],
      codeLines: codeLines || [],
      synonymSentenceView: {
        phaseIndex,
        mode,
        action,
        pairs: pairs.map(([a, b], index) => ({
          a,
          b,
          state: index < processedPairs ? "done" : index === activePair ? "current" : "pending",
        })),
        groups: (groups || unionGroups()).map((group) => ({ root: group.root, words: [...group.words] })),
        activeWords: [...activeWords],
        sentence: [...words],
        options: optionsSnapshot().map((choices) => [...choices]),
        activeWord,
        prefix: [...prefix],
        currentChoice,
        completed: [...results],
        expected: optionsSnapshot().reduce((count, choices) => count * choices.length, 1),
        parentLinks: parentSnapshot(),
        dfsState: dfsState ? {
          ...dfsState,
          callStack: [...dfsState.callStack],
          workingWords: [...dfsState.workingWords],
          choices: [...dfsState.choices],
          exploredChoices: [...dfsState.exploredChoices],
        } : null,
      },
      vars,
      note,
    };
    if (final) step.final = true;
    steps.push(step);
  }

  pushStep({
    title: { vi: "Nhận danh sách synonym và câu ban đầu", en: "Read synonym pairs and the original sentence" },
    note: {
      vi: `Có ${pairs.length} cặp synonym. Trước tiên nối các từ thành nhóm, sau đó mỗi vị trí trong câu lấy lựa chọn từ nhóm của nó.`,
      en: `There are ${pairs.length} synonym pairs. First connect words into groups, then give each sentence position the choices from its group.`,
    },
    codeLines: [22], phaseIndex: 0, mode: "union",
    action: { vi: `${pairs.length} cặp → Union-Find`, en: `${pairs.length} pairs → Union-Find` },
    vars: [{ name: "synonyms", value: pairs.map(([a, b]) => `[${a}, ${b}]`).join(", ") }, { name: "text", value: sentence }],
  });

  pushStep({
    title: { vi: "Khởi tạo UnionFind", en: "Initialize UnionFind" },
    note: { vi: "Tạo union_find với self.parent = {}. Hàm find sẽ tự thêm một từ khi gặp nó lần đầu.", en: "Create union_find with self.parent = {}. find inserts a word when first encountered." },
    codeLines: [23, 5, 6], phaseIndex: 0, mode: "union",
    action: { vi: "union_find.parent = {}", en: "union_find.parent = {}" },
    vars: [{ name: "union_find.parent", value: "{}" }],
  });

  pairs.forEach(([a, b], pairIndex) => {
    pushStep({
      title: { vi: `Đọc cặp ${pairIndex + 1}: ${a} ↔ ${b}`, en: `Read pair ${pairIndex + 1}: ${a} ↔ ${b}` },
      note: { vi: `Vòng for lấy a = "${a}", b = "${b}". Hai từ đang ở các nhóm được tô sáng.`, en: `The loop reads a = "${a}" and b = "${b}". Their current groups are highlighted.` },
      codeLines: [24], phaseIndex: 0, mode: "union", activePair: pairIndex,
      processedPairs: pairIndex, activeWords: [a, b],
      action: { vi: `Cặp đang xét: ${a} ↔ ${b}`, en: `Current pair: ${a} ↔ ${b}` },
      vars: [{ name: "a", value: a }, { name: "b", value: b }],
    });

    const beforeRootA = rootForView(a);
    const beforeRootB = rootForView(b);
    pushStep({
      title: { vi: `Gọi union("${a}", "${b}")`, en: `Call union("${a}", "${b}")` },
      note: { vi: `Đi vào hàm union. Root hiện tại: ${a} → ${beforeRootA}, ${b} → ${beforeRootB}.`, en: `Enter union. Current roots: ${a} → ${beforeRootA}, ${b} → ${beforeRootB}.` },
      codeLines: [25, 8, 9, 10], phaseIndex: 0, mode: "union", activePair: pairIndex,
      processedPairs: pairIndex, activeWords: [a, b],
      action: { vi: `find(${a}) và find(${b})`, en: `find(${a}) and find(${b})` },
      vars: [{ name: `find(${a})`, value: beforeRootA }, { name: `find(${b})`, value: beforeRootB }],
    });

    const { rootA, rootB } = union(a, b);
    pushStep({
      title: { vi: `Nối root "${rootA}" → "${rootB}"`, en: `Link root "${rootA}" → "${rootB}"` },
      note: {
        vi: `Dòng 12 gán self.parent["${rootA}"] = "${rootB}". Vì vậy mọi từ trong hai nhóm giờ là synonym gián tiếp của nhau.`,
        en: `Line 12 sets self.parent["${rootA}"] = "${rootB}". Every word in the two groups is now transitively synonymous.`,
      },
      codeLines: [11, 12], phaseIndex: 0, mode: "union", activePair: pairIndex,
      processedPairs: pairIndex + 1, activeWords: [a, b],
      action: { vi: `${rootA} → ${rootB} · đã gộp nhóm`, en: `${rootA} → ${rootB} · groups merged` },
      vars: [{ name: `parent[${rootA}]`, value: rootB }, { name: "parent", value: `{${parentSnapshot().map(([word, root]) => `${word}:${root}`).join(", ")}}` }],
    });
  });

  pushStep({
    title: { vi: "Tạo dictionary syn_map", en: "Create the syn_map dictionary" },
    note: { vi: "Union đã xong. Bây giờ tạo syn_map[root] để chứa danh sách từ của từng nhóm.", en: "Union is complete. Now create syn_map[root] to hold each component's words." },
    codeLines: [27], phaseIndex: 1, mode: "groups", processedPairs: pairs.length,
    groups: [], action: { vi: "syn_map = {}", en: "syn_map = {}" },
    vars: [{ name: "syn_map", value: "{}" }],
  });

  pushStep({
    title: { vi: `Duyệt ${synonymWords.length} key trong union_find.parent`, en: `Scan ${synonymWords.length} keys in union_find.parent` },
    note: { vi: `union_find.parent có các key {${synonymWords.join(", ")}}. Từ không có trong parent sẽ giữ nguyên trong câu.`, en: `union_find.parent has keys {${synonymWords.join(", ")}}. Words absent from parent stay unchanged in the sentence.` },
    codeLines: [28], phaseIndex: 1, mode: "groups", processedPairs: pairs.length,
    groups: [], action: { vi: `parent: ${synonymWords.length} key`, en: `parent: ${synonymWords.length} keys` },
    vars: [{ name: "union_find.parent.keys()", value: `{${synonymWords.join(", ")}}` }],
  });

  for (const word of synonymWords) {
    const root = find(word);
    pushStep({
      title: { vi: `key = "${word}"; par_key = "${root}"`, en: `key = "${word}"; par_key = "${root}"` },
      note: { vi: `Dòng 28-29 lấy key "${word}" và tìm root "${root}". Root quyết định bucket trong syn_map.`, en: `Lines 28-29 take key "${word}" and find root "${root}". The root selects its syn_map bucket.` },
      codeLines: [28, 29], phaseIndex: 1, mode: "groups", processedPairs: pairs.length,
      groups: builtGroupSnapshot(), activeWords: [word],
      action: { vi: `${word} → groups[${root}]`, en: `${word} → groups[${root}]` },
      vars: [{ name: "key", value: word }, { name: "par_key", value: root }],
    });

    if (!builtGroups.has(root)) builtGroups.set(root, []);
    builtGroups.get(root).push(word);
    pushStep({
      title: { vi: `Thêm "${word}" vào nhóm root "${root}"`, en: `Append "${word}" to root "${root}"` },
      note: { vi: `syn_map["${root}"].append("${word}"). Bucket được cập nhật ngay trên hình.`, en: `syn_map["${root}"].append("${word}"). The bucket is updated immediately.` },
      codeLines: [30], phaseIndex: 1, mode: "groups", processedPairs: pairs.length,
      groups: builtGroupSnapshot(), activeWords: [word],
      action: { vi: `syn_map[${root}] += ${word}`, en: `syn_map[${root}] += ${word}` },
      vars: [{ name: `syn_map[${root}]`, value: `[${builtGroups.get(root).join(", ")}]` }],
    });
  }

  for (const members of builtGroups.values()) members.sort();
  pushStep({
    title: { vi: "Sort từng nhóm theo thứ tự từ điển", en: "Sort every group lexicographically" },
    note: { vi: "Mỗi bucket được sort. Backtracking sẽ thử từ trái sang phải nên kết quả sinh ra đúng thứ tự từ điển.", en: "Each bucket is sorted. Backtracking tries choices left to right, producing lexicographic order." },
    codeLines: [31, 32], phaseIndex: 1, mode: "groups", processedPairs: pairs.length,
    groups: builtGroupSnapshot(), action: { vi: "Mỗi nhóm đã được sort", en: "Every group is sorted" },
    vars: [...builtGroups.entries()].map(([root, members]) => ({ name: `syn_map[${root}]`, value: `[${members.join(", ")}]` })),
  });

  const sentenceOptions = optionsSnapshot();
  const expected = sentenceOptions.reduce((count, choices) => count * choices.length, 1);
  const makeDfsState = (
    event,
    callStack,
    workingWords,
    currentIndex,
    choices = [],
    currentChoice = null,
    exploredChoices = [],
  ) => ({
    event,
    callStack,
    workingWords,
    currentIndex,
    choices,
    currentChoice,
    exploredChoices,
  });
  pushStep({
    title: { vi: "Gắn lựa chọn cho từng vị trí trong câu", en: "Map choices to every sentence position" },
    note: {
      vi: `Từ không có synonym chỉ có 1 lựa chọn. Các vị trí phân nhánh có ${sentenceOptions.filter((choices) => choices.length > 1).map((choices) => choices.length).join(" × ")} lựa chọn → tổng ${expected} câu.`,
      en: `A word without synonyms has one choice. Branching positions have ${sentenceOptions.filter((choices) => choices.length > 1).map((choices) => choices.length).join(" × ")} choices → ${expected} total sentences.`,
    },
    codeLines: [34, 35, 36], phaseIndex: 2, mode: "choices", processedPairs: pairs.length,
    groups: builtGroupSnapshot(), action: { vi: `Số câu = ${sentenceOptions.map((choices) => choices.length).join(" × ")} = ${expected}`, en: `Sentence count = ${sentenceOptions.map((choices) => choices.length).join(" × ")} = ${expected}` },
    vars: [{ name: "words", value: `[${words.join(", ")}]` }, { name: "n", value: words.length }, { name: "ans", value: "[]" }, { name: "total combinations", value: expected }],
  });

  pushStep({
    title: { vi: "Bắt đầu dfs từ vị trí 0", en: "Start dfs at position 0" },
    note: { vi: "dfs(0). Hàm thay words[ind] trực tiếp; từ không có synonym được đi qua bằng nhánh else.", en: "dfs(0). The function replaces words[ind] in place; words without synonyms advance through the else branch." },
    codeLines: [50, 38], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
    groups: builtGroupSnapshot(), activeWord: 0, prefix: [],
    action: { vi: "dfs(0)", en: "dfs(0)" },
    dfsState: makeDfsState("ready", [], words, 0),
    vars: [{ name: "ind", value: 0 }, { name: "words", value: `[${words.join(", ")}]` }, { name: "ans", value: "[]" }],
  });

  function generate(i, workingWords, stack) {
    const callStack = [...stack, i];
    const prefixBeforeIndex = workingWords.slice(0, Math.min(i, words.length));
    pushStep({
      title: { vi: `Vào dfs(${i})`, en: `Enter dfs(${i})` },
      note: { vi: `Tạo frame dfs(${i}) trên call stack. Hiện có ${callStack.length} frame đang hoạt động.`, en: `Push the dfs(${i}) frame onto the call stack. ${callStack.length} frames are now active.` },
      codeLines: [38], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
      groups: builtGroupSnapshot(), activeWord: i < words.length ? i : -1, prefix: prefixBeforeIndex,
      action: { vi: `Call stack + dfs(${i})`, en: `Call stack + dfs(${i})` },
      dfsState: makeDfsState("enter", callStack, workingWords, i),
      vars: [{ name: "ind", value: i }, { name: "call stack", value: callStack.map((value) => `dfs(${value})`).join(" → ") }],
    });

    pushStep({
      title: { vi: i === words.length ? `ind == n (${i}) → True` : `ind == n? ${i} == ${words.length} → False`, en: i === words.length ? `ind == n (${i}) → True` : `ind == n? ${i} == ${words.length} → False` },
      note: i === words.length
        ? { vi: "Đã chọn xong mọi vị trí, nên câu hiện tại là một kết quả hoàn chỉnh.", en: "Every position has been chosen, so the working sentence is complete." }
        : { vi: `Vẫn còn vị trí [${i}] cần xử lý, nên tiếp tục xuống dòng 42.`, en: `Position [${i}] still needs processing, so continue to line 42.` },
      codeLines: [39], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
      groups: builtGroupSnapshot(), activeWord: i < words.length ? i : -1, prefix: prefixBeforeIndex,
      action: { vi: `Kiểm tra base case: ${i === words.length}`, en: `Base-case check: ${i === words.length}` },
      dfsState: makeDfsState("checkBase", callStack, workingWords, i),
      vars: [{ name: "ind", value: i }, { name: "n", value: words.length }, { name: "ind == n", value: i === words.length }],
    });

    if (i === words.length) {
      const completedSentence = workingWords.join(" ");
      results.push(completedSentence);
      pushStep({
        title: { vi: `Hoàn thành câu #${results.length}`, en: `Complete sentence #${results.length}` },
        note: { vi: `Ghép words bằng khoảng trắng và append vào ans. Đã có ${results.length}/${expected} câu.`, en: `Join words with spaces and append the sentence to ans. ${results.length}/${expected} sentences are complete.` },
        codeLines: [40], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
        groups: builtGroupSnapshot(), activeWord: -1, prefix: workingWords,
        action: { vi: `ans.append câu #${results.length}`, en: `ans.append sentence #${results.length}` },
        dfsState: makeDfsState("append", callStack, workingWords, i),
        vars: [{ name: "ind", value: i }, { name: "sentence", value: completedSentence }, { name: "len(ans)", value: results.length }],
      });
      pushStep({
        title: { vi: `return khỏi dfs(${i})`, en: `Return from dfs(${i})` },
        note: { vi: `Frame dfs(${i}) kết thúc và được pop khỏi call stack. Quay lại dfs(${i - 1}).`, en: `The dfs(${i}) frame finishes and is popped. Control returns to dfs(${i - 1}).` },
        codeLines: [41], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
        groups: builtGroupSnapshot(), activeWord: -1, prefix: workingWords,
        action: { vi: `Pop dfs(${i}) → dfs(${i - 1})`, en: `Pop dfs(${i}) → dfs(${i - 1})` },
        dfsState: makeDfsState("return", callStack, workingWords, i),
        vars: [{ name: "return to", value: `dfs(${i - 1})` }, { name: "len(ans)", value: results.length }],
      });
      return;
    }

    const currentWord = workingWords[i];
    const isSynonym = parent.has(currentWord);
    const choices = isSynonym ? optionsFor(currentWord) : [currentWord];
    pushStep({
      title: {
        vi: `words[${i}] = "${currentWord}" ${isSynonym ? "có" : "không có"} trong parent`,
        en: `words[${i}] = "${currentWord}" is ${isSynonym ? "in" : "not in"} parent`,
      },
      note: isSynonym
        ? { vi: "Đi vào nhánh if để tìm nhóm synonym và thử từng lựa chọn.", en: "Take the if branch to find the synonym group and try each choice." }
        : { vi: "Không có synonym, nên đi vào else và giữ nguyên từ này.", en: "There is no synonym, so take the else branch and keep this word." },
      codeLines: [42], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
      groups: builtGroupSnapshot(), activeWord: i, prefix: prefixBeforeIndex,
      action: { vi: `Kiểm tra "${currentWord}" trong parent → ${isSynonym}`, en: `Check "${currentWord}" in parent → ${isSynonym}` },
      dfsState: makeDfsState("checkSynonym", callStack, workingWords, i, choices),
      vars: [{ name: "ind", value: i }, { name: `words[${i}]`, value: currentWord }, { name: "in parent", value: isSynonym }],
    });

    if (!isSynonym) {
      pushStep({
        title: { vi: `Giữ nguyên "${currentWord}" rồi gọi dfs(${i + 1})`, en: `Keep "${currentWord}" and call dfs(${i + 1})` },
        note: { vi: `Nhánh else không thay words[${i}]. Dòng 48 chuyển sang vị trí kế tiếp.`, en: `The else branch does not change words[${i}]. Line 48 advances to the next position.` },
        codeLines: [47, 48], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
        groups: builtGroupSnapshot(), activeWord: i, prefix: workingWords.slice(0, i + 1), currentChoice: currentWord,
        action: { vi: `Từ cố định: ${currentWord} → dfs(${i + 1})`, en: `Fixed word: ${currentWord} → dfs(${i + 1})` },
        dfsState: makeDfsState("fixed", callStack, workingWords, i, choices, currentWord),
        vars: [{ name: "ind", value: i }, { name: `words[${i}]`, value: currentWord }, { name: "next call", value: `dfs(${i + 1})` }],
      });
      generate(i + 1, workingWords, callStack);
      pushStep({
        title: { vi: `Quay lại dfs(${i}) sau dfs(${i + 1})`, en: `Resume dfs(${i}) after dfs(${i + 1})` },
        note: { vi: `Frame dfs(${i + 1}) đã được pop. dfs(${i}) không còn lệnh nào nên tiếp tục return.`, en: `The dfs(${i + 1}) frame has been popped. dfs(${i}) has no more statements and now returns.` },
        codeLines: [48], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
        groups: builtGroupSnapshot(), activeWord: i, prefix: workingWords.slice(0, i + 1),
        action: { vi: `Backtrack → dfs(${i})`, en: `Backtrack → dfs(${i})` },
        dfsState: makeDfsState("return", callStack, workingWords, i, choices),
        vars: [{ name: "active frame", value: `dfs(${i})` }, { name: "len(ans)", value: results.length }],
      });
      return;
    }

    const root = find(currentWord);
    pushStep({
      title: { vi: `Tìm các lựa chọn của "${currentWord}"`, en: `Find choices for "${currentWord}"` },
      note: { vi: `find("${currentWord}") = "${root}". syn_map["${root}"] có ${choices.length} lựa chọn theo thứ tự: ${choices.join(", ")}.`, en: `find("${currentWord}") = "${root}". syn_map["${root}"] has ${choices.length} sorted choices: ${choices.join(", ")}.` },
      codeLines: [43, 44], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
      groups: builtGroupSnapshot(), activeWord: i, prefix: prefixBeforeIndex,
      action: { vi: `for syn in [${choices.join(", ")}]`, en: `for syn in [${choices.join(", ")}]` },
      dfsState: makeDfsState("choices", callStack, workingWords, i, choices),
      vars: [{ name: "par_word", value: root }, { name: `syn_map[${root}]`, value: `[${choices.join(", ")}]` }],
    });

    const exploredChoices = [];
    for (const choice of choices) {
      pushStep({
        title: { vi: `for chọn syn = "${choice}"`, en: `for selects syn = "${choice}"` },
        note: { vi: `Các lựa chọn đã chạy: ${exploredChoices.length ? exploredChoices.join(", ") : "chưa có"}. Bây giờ vòng for lấy "${choice}".`, en: `Already explored: ${exploredChoices.length ? exploredChoices.join(", ") : "none"}. The loop now selects "${choice}".` },
        codeLines: [44], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
        groups: builtGroupSnapshot(), activeWord: i, prefix: prefixBeforeIndex, currentChoice: choice,
        action: { vi: `Nhánh hiện tại: ${choice}`, en: `Current branch: ${choice}` },
        dfsState: makeDfsState("iterate", callStack, workingWords, i, choices, choice, exploredChoices),
        vars: [{ name: "ind", value: i }, { name: "syn", value: choice }, { name: "đã duyệt / explored", value: `[${exploredChoices.join(", ")}]` }],
      });

      workingWords[i] = choice;
      pushStep({
        title: { vi: `Gán words[${i}] = "${choice}"`, en: `Assign words[${i}] = "${choice}"` },
        note: { vi: `Câu đang dựng được cập nhật tại vị trí [${i}]. Chưa thêm vào ans vì vẫn còn vị trí phía sau.`, en: `The working sentence changes at [${i}]. It is not appended yet because later positions remain.` },
        codeLines: [45], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
        groups: builtGroupSnapshot(), activeWord: i, prefix: workingWords.slice(0, i + 1), currentChoice: choice,
        action: { vi: `words[${i}] ← ${choice}`, en: `words[${i}] ← ${choice}` },
        dfsState: makeDfsState("assign", callStack, workingWords, i, choices, choice, exploredChoices),
        vars: [{ name: `words[${i}]`, value: choice }, { name: "words", value: `[${workingWords.join(", ")}]` }],
      });

      pushStep({
        title: { vi: `Gọi dfs(${i + 1})`, en: `Call dfs(${i + 1})` },
        note: { vi: `Tạm dừng dfs(${i}) tại nhánh "${choice}" và đẩy dfs(${i + 1}) lên call stack.`, en: `Pause dfs(${i}) on branch "${choice}" and push dfs(${i + 1}) onto the call stack.` },
        codeLines: [46], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
        groups: builtGroupSnapshot(), activeWord: i, prefix: workingWords.slice(0, i + 1), currentChoice: choice,
        action: { vi: `dfs(${i}) → dfs(${i + 1})`, en: `dfs(${i}) → dfs(${i + 1})` },
        dfsState: makeDfsState("recurse", callStack, workingWords, i, choices, choice, exploredChoices),
        vars: [{ name: "current call", value: `dfs(${i})` }, { name: "next call", value: `dfs(${i + 1})` }],
      });

      generate(i + 1, workingWords, callStack);
      exploredChoices.push(choice);
      pushStep({
        title: { vi: `Backtrack về vị trí ${i}`, en: `Backtrack to position ${i}` },
        note: { vi: `dfs(${i + 1}) đã return. Nhánh "${choice}" hoàn tất; vòng for tại dfs(${i}) sẽ thử lựa chọn kế tiếp nếu còn.`, en: `dfs(${i + 1}) returned. Branch "${choice}" is complete; the loop in dfs(${i}) will try the next choice if one remains.` },
        codeLines: [44, 46], phaseIndex: 3, mode: "backtrack", processedPairs: pairs.length,
        groups: builtGroupSnapshot(), activeWord: i, prefix: workingWords.slice(0, i + 1), currentChoice: choice,
        action: { vi: `Hoàn tất ${choice} → quay lại for`, en: `Finish ${choice} → resume for loop` },
        dfsState: makeDfsState("return", callStack, workingWords, i, choices, choice, exploredChoices),
        vars: [{ name: "active frame", value: `dfs(${i})` }, { name: "đã duyệt / explored", value: `[${exploredChoices.join(", ")}]` }, { name: "len(ans)", value: results.length }],
      });
    }
  }

  const workingWords = [...words];
  generate(0, workingWords, []);
  results.sort();
  pushStep({
    title: { vi: `Trả về ${results.length} câu theo thứ tự từ điển`, en: `Return ${results.length} sentences in lexicographic order` },
    note: { vi: `Có ${expected} tổ hợp và đã sinh đủ ${results.length} câu. syn_map được sort nên ans đã theo thứ tự từ điển.`, en: `There are ${expected} combinations and all ${results.length} sentences were generated. Sorted syn_map buckets keep ans lexicographic.` },
    codeLines: [51], phaseIndex: 3, mode: "result", processedPairs: pairs.length,
    groups: builtGroupSnapshot(), activeWord: -1, prefix: [],
    action: { vi: `return ans · ${results.length} câu`, en: `return ans · ${results.length} sentences` },
    dfsState: makeDfsState("done", [], workingWords, words.length),
    vars: [{ name: "answer count", value: results.length }, { name: "ans", value: results.join(" | ") }],
    final: true,
  });

  return { input, answer: results.join(" | "), steps };
}

// ─── 1631: Path With Minimum Effort ───
function buildSteps1631KruskalLegacy(input) {
  // Input: grid rows separated by ';', values by ','
  // e.g. "1,2,2;3,8,2;5,3,5"
  const grid = String(input)
    .split(/[;|]/)
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

function buildSteps1631Kruskal(input) {
  const heights = String(input)
    .split(/[;|]/)
    .map((row) => row.split(",").map((value) => Number(value.trim())));
  const rows = heights.length;
  const cols = heights[0].length;
  const cellCount = rows * cols;
  const start = 0;
  const target = cellCount - 1;
  const steps = [];
  const edges = [];
  const parent = Array.from({ length: cellCount }, (_, index) => index);
  const acceptedEdges = [];
  const skippedEdgeKeys = new Set();

  const id = (row, col) => row * cols + col;
  const coordinate = (cellId) => [Math.floor(cellId / cols), cellId % cols];
  const label = (cellId) => {
    const [row, col] = coordinate(cellId);
    return `(${row},${col})`;
  };
  const edgeKey = (u, v) => `${Math.min(u, v)}-${Math.max(u, v)}`;
  const copyEdge = (edge) => edge ? {
    key: edge.key,
    u: edge.u,
    v: edge.v,
    from: coordinate(edge.u),
    to: coordinate(edge.v),
    diff: edge.diff,
  } : null;

  function rootWithoutCompression(cellId) {
    let root = cellId;
    while (parent[root] !== root) root = parent[root];
    return root;
  }

  function find(cellId) {
    let node = cellId;
    while (parent[node] !== node) {
      parent[node] = parent[parent[node]];
      node = parent[node];
    }
    return node;
  }

  function union(u, v) {
    const rootU = find(u);
    const rootV = find(v);
    parent[rootU] = rootV;
    return { rootU, rootV, merged: rootU !== rootV };
  }

  function connected() {
    return find(start) === find(target);
  }

  function componentSnapshot() {
    const roots = parent.map((_, cellId) => rootWithoutCompression(cellId));
    const groups = new Map();
    roots.forEach((root, cellId) => {
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(coordinate(cellId));
    });
    return {
      roots,
      groups: [...groups.entries()].map(([root, cells]) => ({ root, cells })),
    };
  }

  function finalPathEdges() {
    if (start === target) return [];
    const adjacency = Array.from({ length: cellCount }, () => []);
    for (const edge of acceptedEdges) {
      adjacency[edge.u].push({ next: edge.v, edge });
      adjacency[edge.v].push({ next: edge.u, edge });
    }
    const previous = new Array(cellCount).fill(null);
    const queue = [start];
    previous[start] = { node: -1, edge: null };
    for (let head = 0; head < queue.length && previous[target] === null; head++) {
      const node = queue[head];
      for (const item of adjacency[node]) {
        if (previous[item.next] !== null) continue;
        previous[item.next] = { node, edge: item.edge };
        queue.push(item.next);
      }
    }
    if (previous[target] === null) return [];
    const path = [];
    let node = target;
    while (node !== start) {
      path.push(copyEdge(previous[node].edge));
      node = previous[node].node;
    }
    return path.reverse();
  }

  function pushStep({
    title,
    note,
    codeLines,
    event,
    phase,
    currentCell = null,
    currentEdge = null,
    edgeIndex = -1,
    processedCount = 0,
    rootsBefore = null,
    unionChanged = null,
    isConnected = null,
    answer = null,
    final = false,
    vars = [],
    edgeList = edges,
    sorted = false,
  }) {
    const components = componentSnapshot();
    const startRoot = rootWithoutCompression(start);
    const targetRoot = rootWithoutCompression(target);
    steps.push({
      title,
      note,
      codeLines,
      arr: [],
      highlight: [],
      mark: [],
      vars,
      final,
      kruskalEffortView: {
        event,
        phase,
        heights: heights.map((row) => [...row]),
        rows,
        cols,
        edges: edgeList.map(copyEdge),
        sorted,
        currentCell: currentCell ? [...currentCell] : null,
        currentEdge: copyEdge(currentEdge),
        edgeIndex,
        processedCount,
        acceptedEdges: acceptedEdges.map(copyEdge),
        skippedEdgeKeys: [...skippedEdgeKeys],
        parent: [...parent],
        roots: components.roots,
        groups: components.groups,
        rootsBefore: rootsBefore ? { ...rootsBefore } : null,
        unionChanged,
        start: coordinate(start),
        target: coordinate(target),
        startRoot,
        targetRoot,
        connected: isConnected === null ? startRoot === targetRoot : isConnected,
        threshold: currentEdge ? currentEdge.diff : null,
        pathEdges: final ? finalPathEdges() : [],
        answer,
      },
    });
  }

  pushStep({
    title: { vi: `Grid ${rows} × ${cols}: mỗi ô ban đầu là một component`, en: `Grid ${rows} × ${cols}: every cell starts as its own component` },
    note: {
      vi: "Kruskal tăng dần ngưỡng effort. Một cạnh có trọng số |heightA-heightB| và chỉ nối hai ô kề nhau.",
      en: "Kruskal gradually raises the effort threshold. An edge weighs |heightA-heightB| and only joins adjacent cells.",
    },
    codeLines: [3],
    event: "init",
    phase: "build",
    vars: [{ name: "rows, cols", value: `${rows}, ${cols}` }, { name: "cells", value: cellCount }],
  });

  pushStep({
    title: { vi: "Khởi tạo danh sách edges rỗng", en: "Initialize an empty edge list" },
    note: { vi: "Ta sẽ thêm đúng một cạnh cho mỗi cặp ô kề ngang hoặc dọc.", en: "We add exactly one edge for every horizontal or vertical adjacent pair." },
    codeLines: [4],
    event: "init-edges",
    phase: "build",
    vars: [{ name: "edges", value: "[]" }],
  });

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      pushStep({
        title: { vi: `Xét ô (${row},${col}), height = ${heights[row][col]}`, en: `Scan cell (${row},${col}), height = ${heights[row][col]}` },
        note: { vi: "Chỉ tạo cạnh xuống dưới và sang phải để không tạo trùng cạnh.", en: "Only create downward and rightward edges so no edge is duplicated." },
        codeLines: [5, 6],
        event: "scan-cell",
        phase: "build",
        currentCell: [row, col],
        vars: [{ name: "r, c", value: `${row}, ${col}` }],
      });

      if (row + 1 < rows) {
        const u = id(row, col);
        const v = id(row + 1, col);
        const edge = { key: edgeKey(u, v), u, v, diff: Math.abs(heights[row][col] - heights[row + 1][col]) };
        edges.push(edge);
        pushStep({
          title: { vi: `Thêm cạnh dọc ${label(u)} ↔ ${label(v)}, |diff| = ${edge.diff}`, en: `Add vertical edge ${label(u)} ↔ ${label(v)}, |diff| = ${edge.diff}` },
          note: { vi: `|${heights[row][col]} - ${heights[row + 1][col]}| = ${edge.diff}.`, en: `|${heights[row][col]} - ${heights[row + 1][col]}| = ${edge.diff}.` },
          codeLines: [7, 8],
          event: "build-edge",
          phase: "build",
          currentCell: [row, col],
          currentEdge: edge,
          edgeIndex: edges.length - 1,
          vars: [{ name: "edge", value: `${label(u)} ↔ ${label(v)}` }, { name: "diff", value: edge.diff }, { name: "len(edges)", value: edges.length }],
        });
      }

      if (col + 1 < cols) {
        const u = id(row, col);
        const v = id(row, col + 1);
        const edge = { key: edgeKey(u, v), u, v, diff: Math.abs(heights[row][col] - heights[row][col + 1]) };
        edges.push(edge);
        pushStep({
          title: { vi: `Thêm cạnh ngang ${label(u)} ↔ ${label(v)}, |diff| = ${edge.diff}`, en: `Add horizontal edge ${label(u)} ↔ ${label(v)}, |diff| = ${edge.diff}` },
          note: { vi: `|${heights[row][col]} - ${heights[row][col + 1]}| = ${edge.diff}.`, en: `|${heights[row][col]} - ${heights[row][col + 1]}| = ${edge.diff}.` },
          codeLines: [9, 10],
          event: "build-edge",
          phase: "build",
          currentCell: [row, col],
          currentEdge: edge,
          edgeIndex: edges.length - 1,
          vars: [{ name: "edge", value: `${label(u)} ↔ ${label(v)}` }, { name: "diff", value: edge.diff }, { name: "len(edges)", value: edges.length }],
        });
      }
    }
  }

  edges.sort((left, right) => left.diff - right.diff || left.u - right.u || left.v - right.v);
  pushStep({
    title: { vi: `Sắp xếp ${edges.length} cạnh theo |diff| tăng dần`, en: `Sort ${edges.length} edges by ascending |diff|` },
    note: {
      vi: "Từ đây, mỗi cạnh lấy ra là ngưỡng nhỏ nhất chưa thử. Ta không thể kết nối S với T ở một ngưỡng nhỏ hơn cạnh hiện tại.",
      en: "From now on, each selected edge is the smallest untried threshold. S and T cannot connect at a threshold below the current edge.",
    },
    codeLines: [11],
    event: "sort",
    phase: "sort",
    sorted: true,
    vars: [{ name: "sorted diffs", value: `[${edges.map((edge) => edge.diff).join(", ")}]` }],
  });

  pushStep({
    title: { vi: `Khởi tạo ${cellCount} component riêng biệt`, en: `Initialize ${cellCount} separate components` },
    note: { vi: "parent[i] = i nghĩa là mỗi ô đang là root của chính nó.", en: "parent[i] = i means every cell is currently its own root." },
    codeLines: [12],
    event: "init-dsu",
    phase: "sort",
    sorted: true,
    vars: [{ name: "parent", value: `[${parent.join(", ")}]` }, { name: "components", value: cellCount }],
  });

  if (start === target) {
    pushStep({
      title: { vi: "Start cũng chính là target → effort = 0", en: "Start is also the target → effort = 0" },
      note: { vi: "Không đi qua cạnh nào nên chênh lệch lớn nhất bằng 0.", en: "No edge is traversed, so the maximum difference is 0." },
      codeLines: [24],
      event: "done",
      phase: "done",
      sorted: true,
      isConnected: true,
      answer: 0,
      final: true,
      vars: [{ name: "answer", value: 0 }],
    });
    return { input, answer: 0, steps };
  }

  let answer = 0;
  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
    const edge = edges[edgeIndex];
    pushStep({
      title: { vi: `Lấy cạnh #${edgeIndex + 1}: ${label(edge.u)} ↔ ${label(edge.v)}, diff = ${edge.diff}`, en: `Take edge #${edgeIndex + 1}: ${label(edge.u)} ↔ ${label(edge.v)}, diff = ${edge.diff}` },
      note: { vi: `Ngưỡng hiện tại là ${edge.diff}. Mọi cạnh đã xử lý đều có diff ≤ ${edge.diff}.`, en: `The current threshold is ${edge.diff}. Every processed edge has diff ≤ ${edge.diff}.` },
      codeLines: [20],
      event: "choose-edge",
      phase: "find",
      currentEdge: edge,
      edgeIndex,
      processedCount: edgeIndex,
      sorted: true,
      vars: [{ name: "diff", value: edge.diff }, { name: "u, v", value: `${edge.u}, ${edge.v}` }],
    });

    const rootU = find(edge.u);
    const rootV = find(edge.v);
    pushStep({
      title: { vi: `find(${edge.u}) = ${rootU}, find(${edge.v}) = ${rootV}`, en: `find(${edge.u}) = ${rootU}, find(${edge.v}) = ${rootV}` },
      note: rootU === rootV
        ? { vi: "Hai đầu cạnh đã thuộc cùng component; cạnh này tạo chu trình và không giúp nối thêm ô.", en: "Both endpoints already belong to the same component; this edge creates a cycle and connects nothing new." }
        : { vi: `Hai root khác nhau, vì vậy Union sẽ gộp R${rootU} vào R${rootV}.`, en: `The roots differ, so Union will merge R${rootU} into R${rootV}.` },
      codeLines: [13, 14, 15, 16, 17],
      event: "find-roots",
      phase: "find",
      currentEdge: edge,
      edgeIndex,
      processedCount: edgeIndex,
      rootsBefore: { u: rootU, v: rootV },
      sorted: true,
      vars: [{ name: `find(${edge.u})`, value: rootU }, { name: `find(${edge.v})`, value: rootV }, { name: "same root?", value: rootU === rootV }],
    });

    const unionResult = union(edge.u, edge.v);
    if (unionResult.merged) acceptedEdges.push(edge);
    else skippedEdgeKeys.add(edge.key);
    pushStep({
      title: unionResult.merged
        ? { vi: `Union: R${unionResult.rootU} → R${unionResult.rootV}`, en: `Union: R${unionResult.rootU} → R${unionResult.rootV}` }
        : { vi: "Bỏ qua cạnh tạo chu trình", en: "Skip the cycle-forming edge" },
      note: unionResult.merged
        ? { vi: `parent[${unionResult.rootU}] = ${unionResult.rootV}; hai component trở thành một.`, en: `parent[${unionResult.rootU}] = ${unionResult.rootV}; the two components become one.` }
        : { vi: "Hai root giống nhau nên parent không thay đổi.", en: "The roots are identical, so parent does not change." },
      codeLines: [18, 19, 21],
      event: "union",
      phase: "union",
      currentEdge: edge,
      edgeIndex,
      processedCount: edgeIndex + 1,
      rootsBefore: { u: unionResult.rootU, v: unionResult.rootV },
      unionChanged: unionResult.merged,
      sorted: true,
      vars: [{ name: "merged?", value: unionResult.merged }, { name: "parent", value: `[${parent.join(", ")}]` }],
    });

    const isConnected = connected();
    pushStep({
      title: isConnected
        ? { vi: `S và T đã cùng root ${find(start)}`, en: `S and T now share root ${find(start)}` }
        : { vi: `S root=${find(start)}, T root=${find(target)} → chưa nối`, en: `S root=${find(start)}, T root=${find(target)} → not connected` },
      note: isConnected
        ? { vi: `Kết nối lần đầu xảy ra ở ngưỡng ${edge.diff}; đây là effort nhỏ nhất có thể.`, en: `The first connection happens at threshold ${edge.diff}; this is the minimum possible effort.` }
        : { vi: "Hai root còn khác nhau nên tiếp tục lấy cạnh nhỏ nhất kế tiếp.", en: "The roots still differ, so continue with the next-smallest edge." },
      codeLines: [22],
      event: "check",
      phase: "check",
      currentEdge: edge,
      edgeIndex,
      processedCount: edgeIndex + 1,
      unionChanged: unionResult.merged,
      isConnected,
      sorted: true,
      vars: [{ name: "start root", value: find(start) }, { name: "target root", value: find(target) }, { name: "connected?", value: isConnected }],
    });

    if (isConnected) {
      answer = edge.diff;
      pushStep({
        title: { vi: `Return ${answer}: bottleneck nhỏ nhất`, en: `Return ${answer}: the minimum bottleneck` },
        note: {
          vi: `Các cạnh xanh tạo một đường từ S đến T. Chênh lệch lớn nhất trên đường là ${answer}; cạnh màu cam là bottleneck quyết định đáp án.`,
          en: `The green edges form a path from S to T. Its largest difference is ${answer}; the orange edge is the bottleneck that determines the answer.`,
        },
        codeLines: [23],
        event: "done",
        phase: "done",
        currentEdge: edge,
        edgeIndex,
        processedCount: edgeIndex + 1,
        rootsBefore: { u: unionResult.rootU, v: unionResult.rootV },
        unionChanged: unionResult.merged,
        isConnected: true,
        answer,
        final: true,
        sorted: true,
        vars: [{ name: "answer", value: answer }, { name: "bottleneck", value: `${label(edge.u)} ↔ ${label(edge.v)}, diff=${edge.diff}` }],
      });
      break;
    }
  }

  return { input, answer, steps };
}

function buildSteps1631(input, params = {}) {
  if (String(params.approach || "1") === "2") {
    return require("./graph").__buildSteps1631Dijkstra(input, params);
  }
  return buildSteps1631Kruskal(input);
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

// ─── 323 Approach 2: build adjacency list + recursive DFS, fully line-by-line ───
function buildSteps323DFS(input, params) {
  const n = params.n !== undefined ? Number(params.n) : 5;
  const edgeList = String(input).split(";").map((s) => {
    const [a, b] = s.trim().split(",").map(Number);
    return { a, b };
  }).filter((e) => !isNaN(e.a) && !isNaN(e.b));

  const steps = [];
  const graph = Array.from({ length: n }, () => []);
  const visited = new Array(n).fill(false);
  let count = 0;

  const allEdges = edgeList.map(({ a, b }) => ({ u: a, v: b, w: "" }));

  function edgeKeys(node) {
    return graph[node].map((nb) => `${Math.min(node, nb)}-${Math.max(node, nb)}`);
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [...visited].map((v) => (v ? 1 : 0)),
      sub: Array.from({ length: n }, (_, i) => String(i)),
      graph: {
        nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: String(i) })),
        edges: allEdges,
        hlNodes: opts.hlNodes || [],
        hlEdges: opts.hlEdges || [],
        visitedNodes: Array.from({ length: n }, (_, i) => i).filter((i) => visited[i]),
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      codeBlock: 2,
      vars: [...(opts.vars || []), { name: "visited", value: `[${visited.map((v) => (v ? "T" : "F")).join(",")}]` }, { name: "count", value: count }],
      note: opts.note,
      final: opts.final || false,
    });
  }

  const edgesStr = edgeList.map((e) => `(${e.a},${e.b})`).join(", ");

  // Line 3: graph = [[] for _ in range(n)]
  snap({
    title: { vi: "graph = [[] for _ in range(n)]", en: "graph = [[] for _ in range(n)]" },
    codeLines: [3],
    vars: [{ name: "n", value: n }, { name: "edges", value: edgesStr }],
    note: {
      vi: `Tạo adjacency list rỗng cho ${n} nút. Sẽ chuyển danh sách cạnh thành đồ thị kề để DFS dễ hơn.`,
      en: `Create an empty adjacency list for ${n} nodes. The edge list will be converted into a graph for easier DFS.`,
    },
  });

  // Lines 4-6: for u, v in edges: graph[u].append(v); graph[v].append(u)
  for (const { a, b } of edgeList) {
    snap({
      title: { vi: `for u,v in edges: (${a},${b})`, en: `for u,v in edges: (${a},${b})` },
      hlNodes: [a, b],
      codeLines: [4],
      vars: [{ name: "u", value: a }, { name: "v", value: b }],
      note: {
        vi: `Xét cạnh (${a},${b}) tiếp theo trong danh sách edges.`,
        en: `Process the next edge (${a},${b}) from the edges list.`,
      },
    });
    graph[a].push(b);
    snap({
      title: { vi: `graph[${a}].append(${b})`, en: `graph[${a}].append(${b})` },
      hlNodes: [a, b],
      hlEdges: [`${Math.min(a, b)}-${Math.max(a, b)}`],
      codeLines: [5],
      vars: [{ name: `graph[${a}]`, value: `[${graph[a].join(",")}]` }],
      note: {
        vi: `Thêm ${b} vào danh sách kề của ${a}.`,
        en: `Add ${b} to node ${a}'s adjacency list.`,
      },
    });
    graph[b].push(a);
    snap({
      title: { vi: `graph[${b}].append(${a})`, en: `graph[${b}].append(${a})` },
      hlNodes: [a, b],
      hlEdges: [`${Math.min(a, b)}-${Math.max(a, b)}`],
      codeLines: [6],
      vars: [{ name: `graph[${b}]`, value: `[${graph[b].join(",")}]` }],
      note: {
        vi: `Thêm ${a} vào danh sách kề của ${b} (đồ thị vô hướng → thêm cả 2 chiều).`,
        en: `Add ${a} to node ${b}'s adjacency list (undirected graph → add both directions).`,
      },
    });
  }

  // Line 12: count = 0
  snap({
    title: { vi: "count = 0", en: "count = 0" },
    codeLines: [12],
    note: {
      vi: "count sẽ đếm số nhóm kết nối (connected components).",
      en: "count will tally the number of connected components.",
    },
  });

  // Line 13: visited = [False for _ in range(n)]
  snap({
    title: { vi: "visited = [False for _ in range(n)]", en: "visited = [False for _ in range(n)]" },
    codeLines: [13],
    note: {
      vi: `Khởi tạo visited toàn False cho ${n} nút.`,
      en: `Initialize visited to all False for ${n} nodes.`,
    },
  });

  function dfs(node, depth) {
    // Line 8: visited[node] = True
    visited[node] = true;
    snap({
      title: { vi: `dfs(${node}): visited[${node}] = True`, en: `dfs(${node}): visited[${node}] = True` },
      hlNodes: [node],
      codeLines: [8],
      vars: [{ name: "node", value: node }, { name: "depth", value: depth }],
      note: {
        vi: `Đánh dấu ${node} đã thăm.`,
        en: `Mark ${node} as visited.`,
      },
    });

    // Line 9: for neighbor in graph[node]:
    for (const neighbor of graph[node]) {
      snap({
        title: { vi: `dfs(${node}): for neighbor in graph[${node}] → xét ${neighbor}`, en: `dfs(${node}): for neighbor in graph[${node}] → check ${neighbor}` },
        hlNodes: [node, neighbor],
        hlEdges: [`${Math.min(node, neighbor)}-${Math.max(node, neighbor)}`],
        codeLines: [9],
        vars: [{ name: "node", value: node }, { name: "graph[node]", value: `[${graph[node].join(",")}]` }, { name: "neighbor", value: neighbor }],
        note: {
          vi: `Xét hàng xóm ${neighbor} của ${node}.`,
          en: `Check neighbor ${neighbor} of ${node}.`,
        },
      });

      // Line 10: if not visited[neighbor]:
      const notVisited = !visited[neighbor];
      snap({
        title: { vi: `dfs(${node}): if not visited[${neighbor}] → ${notVisited}`, en: `dfs(${node}): if not visited[${neighbor}] → ${notVisited}` },
        hlNodes: [node, neighbor],
        hlEdges: [`${Math.min(node, neighbor)}-${Math.max(node, neighbor)}`],
        codeLines: [10],
        vars: [{ name: "neighbor", value: neighbor }],
        note: notVisited
          ? { vi: `${neighbor} chưa thăm → sẽ đệ quy dfs(${neighbor}).`, en: `${neighbor} not visited yet → will recurse dfs(${neighbor}).` }
          : { vi: `${neighbor} đã thăm rồi → bỏ qua.`, en: `${neighbor} already visited → skip.` },
      });

      if (notVisited) {
        // Line 11: dfs(neighbor)
        snap({
          title: { vi: `dfs(${node}): dfs(${neighbor})`, en: `dfs(${node}): dfs(${neighbor})` },
          hlNodes: [node, neighbor],
          hlEdges: [`${Math.min(node, neighbor)}-${Math.max(node, neighbor)}`],
          codeLines: [11],
          vars: [{ name: "call", value: `dfs(${neighbor})` }],
          note: {
            vi: `Gọi đệ quy dfs(${neighbor}) để tiếp tục khám phá nhóm này.`,
            en: `Recurse into dfs(${neighbor}) to keep exploring this component.`,
          },
        });
        dfs(neighbor, depth + 1);
      }
    }
  }

  // Line 14: for node in range(n):
  for (let node = 0; node < n; node++) {
    snap({
      title: { vi: `for node in range(n) → node=${node}`, en: `for node in range(n) → node=${node}` },
      hlNodes: [node],
      codeLines: [14],
      vars: [{ name: "node", value: node }],
      note: {
        vi: `Xét nút ${node} trong vòng lặp chính.`,
        en: `Consider node ${node} in the main loop.`,
      },
    });

    // Line 15: if not visited[node]:
    const notVisited = !visited[node];
    snap({
      title: { vi: `if not visited[${node}] → ${notVisited}`, en: `if not visited[${node}] → ${notVisited}` },
      hlNodes: [node],
      codeLines: [15],
      note: notVisited
        ? { vi: `${node} chưa thăm → đây là gốc của 1 nhóm kết nối MỚI.`, en: `${node} not visited yet → this is the root of a NEW connected component.` }
        : { vi: `${node} đã thăm rồi (thuộc nhóm đã đếm) → bỏ qua.`, en: `${node} already visited (belongs to an already-counted component) → skip.` },
    });

    if (notVisited) {
      // Line 16: dfs(node)
      snap({
        title: { vi: `dfs(${node})`, en: `dfs(${node})` },
        hlNodes: [node],
        codeLines: [16],
        note: {
          vi: `Gọi dfs(${node}) để đánh dấu thăm toàn bộ nhóm chứa ${node}.`,
          en: `Call dfs(${node}) to mark the whole component containing ${node} as visited.`,
        },
      });
      dfs(node, 0);

      // Line 17: count += 1
      count++;
      snap({
        title: { vi: `count += 1 → ${count}`, en: `count += 1 → ${count}` },
        codeLines: [17],
        note: {
          vi: `Vừa khám phá xong 1 nhóm kết nối → count = ${count}.`,
          en: `Just finished discovering one connected component → count = ${count}.`,
        },
      });
    }
  }

  // Line 18: return count
  const fs = {
    title: { vi: `return count → ${count}`, en: `return count → ${count}` },
    arr: [...visited].map((v) => (v ? 1 : 0)),
    sub: Array.from({ length: n }, (_, i) => String(i)),
    graph: {
      nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: String(i) })),
      edges: allEdges,
      hlNodes: [],
      hlEdges: [],
      visitedNodes: Array.from({ length: n }, (_, i) => i),
    },
    highlight: [],
    mark: [],
    codeLines: [18],
    codeBlock: 2,
    vars: [{ name: "answer", value: count }, { name: "visited", value: `[${visited.map((v) => (v ? "T" : "F")).join(",")}]` }],
    note: {
      vi: `Đã xử lý hết ${n} nút. Số nhóm kết nối = ${count}.`,
      en: `Processed all ${n} nodes. Number of connected components = ${count}.`,
    },
  };
  fs.final = true;
  steps.push(fs);

  return { input, answer: count, steps };
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

// ─── 684: Redundant Connection ───
// Add edges one by one; the first edge connecting two already-connected nodes is redundant.
function buildSteps684(input) {
  const edges = String(input).split(";").map((s) => s.trim()).filter(Boolean)
    .map((s) => s.split(",").map((x) => Number(x.trim())));
  const n = edges.length; // nodes are 1..n
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const steps = [];
  const added = [];

  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }

  function gsnap(opts) {
    const gNodes = Array.from({ length: n }, (_, i) => ({ id: i + 1, label: String(i + 1) }));
    const gEdges = added.map(([u, v]) => ({ u, v, w: "" }));
    steps.push({
      title: opts.title,
      arr: [],
      graph: { nodes: gNodes, edges: gEdges, hlNodes: opts.hlNodes || [], hlEdges: opts.hlEdges || [], visitedNodes: [] },
      highlight: [], mark: [], final: opts.final || false,
      codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note,
    });
  }

  const parentStr = () => `[${parent.slice(1).map((p, i) => `${i + 1}→${p}`).join(", ")}]`;

  gsnap({
    title: { vi: "Union-Find: parent[i]=i", en: "Union-Find: parent[i]=i" },
    codeLines: [1, 2],
    vars: [{ name: "n nodes", value: n }, { name: "parent", value: parentStr() }],
    note: {
      vi: `Đồ thị có ${n} đỉnh và ${n} cạnh (thừa 1 cạnh tạo chu trình). Thêm từng cạnh; cạnh đầu tiên nối 2 đỉnh ĐÃ cùng nhóm chính là cạnh thừa.`,
      en: `The graph has ${n} nodes and ${n} edges (one extra creating a cycle). Add edges one by one; the first edge joining two ALREADY-connected nodes is redundant.`,
    },
  });

  let answer = [];
  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v);
    if (ru === rv) {
      answer = [u, v];
      gsnap({
        title: { vi: `Cạnh ${u}-${v}: ${u},${v} đã cùng nhóm → THỪA!`, en: `Edge ${u}-${v}: ${u},${v} already connected → REDUNDANT!` },
        hlNodes: [u, v], hlEdges: [[u, v]],
        final: true, codeLines: [3, 4],
        vars: [{ name: "edge", value: `${u}-${v}` }, { name: `find(${u})`, value: ru }, { name: `find(${v})`, value: rv }, { name: "answer", value: `[${u}, ${v}]` }],
        note: { vi: `find(${u})=${ru} == find(${v})=${rv} → ${u} và ${v} đã liên thông → thêm cạnh này tạo CHU TRÌNH → đây là cạnh thừa.`, en: `find(${u})=${ru} == find(${v})=${rv} → ${u} and ${v} are already connected → this edge forms a CYCLE → it's the redundant one.` },
      });
      break;
    }
    parent[ru] = rv;
    added.push([u, v]);
    gsnap({
      title: { vi: `Cạnh ${u}-${v}: union (nhóm khác nhau)`, en: `Edge ${u}-${v}: union (different groups)` },
      hlNodes: [u, v], hlEdges: [[u, v]],
      codeLines: [3],
      vars: [{ name: "edge", value: `${u}-${v}` }, { name: "parent", value: parentStr() }],
      note: { vi: `find(${u})=${ru} ≠ find(${v})=${rv} → hợp nhất hai nhóm (parent[${ru}]=${rv}). Cạnh này không thừa.`, en: `find(${u})=${ru} ≠ find(${v})=${rv} → union the two groups (parent[${ru}]=${rv}). Not redundant.` },
    });
  }

  return { original: edges, answer, steps };
}

// ─── 721: Accounts Merge ───
function buildSteps721(input, params) {
  // input: accounts as "Name:email1,email2;Name:email3" or via params.accounts
  const raw = params && params.accounts !== undefined ? String(params.accounts) : String(input);
  const accounts = raw.split(";").map((a) => a.trim()).filter(Boolean).map((a) => {
    const [name, emailsStr] = a.split(":");
    return [name.trim(), ...emailsStr.split(",").map((e) => e.trim())];
  });

  const steps = [];
  const parent = {};
  const emailName = {};
  const find = (x) => { parent[x] = parent[x] === undefined ? x : parent[x]; while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const union = (a, b) => { parent[find(a)] = find(b); };

  function snap(opts) {
    steps.push({
      title: opts.title, arr: [], highlight: [], mark: [], final: opts.final || false,
      codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note,
    });
  }

  snap({
    title: { vi: "Union-Find trên các email", en: "Union-Find over emails" },
    codeLines: [1, 2],
    vars: [{ name: "accounts", value: accounts.length }],
    note: {
      vi: `Mỗi email là 1 node. Trong cùng 1 account, union mọi email với email đầu tiên. Các account chia sẻ email → gộp chung.\nCuối cùng gom email theo root, sắp xếp, gắn tên.`,
      en: `Each email is a node. Within an account, union all emails with the first. Accounts sharing an email get merged.\nFinally group emails by root, sort, and attach the owner's name.`,
    },
  });

  for (const acc of accounts) {
    const name = acc[0];
    const emails = acc.slice(1);
    for (const e of emails) { emailName[e] = name; find(e); }
    for (let i = 1; i < emails.length; i++) union(emails[i], emails[0]);
    snap({
      title: { vi: `Account "${name}": union ${emails.length} email`, en: `Account "${name}": union ${emails.length} emails` },
      codeLines: [3, 4, 5],
      vars: [
        { name: "name", value: name },
        { name: "emails", value: emails.join(", ") },
      ],
      note: { vi: `Nối tất cả email của "${name}" về cùng nhóm (union với email đầu). Nếu email đã thuộc account khác → 2 account tự động gộp.`, en: `Union all of "${name}"'s emails into one group (with the first). If an email belongs to another account → those accounts merge automatically.` },
    });
  }

  // Group by root
  const groups = {};
  for (const e of Object.keys(emailName)) {
    const r = find(e);
    (groups[r] = groups[r] || []).push(e);
  }
  const result = Object.values(groups).map((emails) => [emailName[emails[0]], ...emails.sort()]);

  snap({
    title: { vi: `Gom nhóm: ${result.length} account sau khi gộp`, en: `Group: ${result.length} accounts after merge` },
    final: true, codeLines: [6, 7],
    vars: [{ name: "answer", value: JSON.stringify(result) }],
    note: {
      vi: `Gom email theo root, sắp xếp mỗi nhóm, gắn tên chủ. Kết quả ${result.length} account:\n${result.map((g) => `${g[0]}: ${g.slice(1).join(", ")}`).join("\n")}`,
      en: `Group emails by root, sort each group, attach the owner. ${result.length} merged accounts:\n${result.map((g) => `${g[0]}: ${g.slice(1).join(", ")}`).join("\n")}`,
    },
  });

  return { original: accounts, answer: result, steps };
}

module.exports = {
  684: {
    id: 684,
    difficulty: "medium",
    slug: "redundant-connection",
    category: { key: "union-find", vi: "Union Find", en: "Union Find" },
    title: { vi: "Redundant Connection", en: "Redundant Connection" },
    titleVi: { vi: "Cạnh thừa tạo chu trình (Union-Find)", en: "Redundant edge forming a cycle (Union-Find)" },
    statement: {
      vi: "Cho đồ thị n đỉnh và n cạnh (thừa 1 cạnh so với cây). Tìm cạnh thừa (xuất hiện sau cùng) mà bỏ đi được cây. Nhập cạnh dạng u,v cách nhau ';'.",
      en: "Given a graph with n nodes and n edges (one extra vs a tree), find the redundant edge (the last one) whose removal yields a tree. Enter edges as u,v separated by ';'.",
    },
    defaultInput: "1,2;1,3;2,3",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (u,v; cách bởi ;)", en: "Edges (u,v; separated by ;)" },
    extraParams: [],
    approach: [
      { vi: "Union-Find: mỗi đỉnh có parent, ban đầu là chính nó.", en: "Union-Find: each node has a parent, initially itself." },
      { vi: "Thêm từng cạnh: nếu 2 đầu KHÁC nhóm → union.", en: "Add each edge: if endpoints are in DIFFERENT groups → union." },
      { vi: "Nếu 2 đầu ĐÃ cùng nhóm → cạnh này tạo chu trình → cạnh thừa.", en: "If endpoints are ALREADY in the same group → this edge forms a cycle → redundant." },
    ],
    complexity: { time: "O(n·α(n))", space: "O(n)", note: { vi: "Union-Find với nén đường đi gần như O(1)/thao tác.", en: "Union-Find with path compression is near O(1)/op." } },
    code: [
      "class Solution:",
      "    def findRedundantConnection(self, edges):",
      "        parent = list(range(len(edges)+1))",
      "        def find(x):",
      "            while parent[x] != x: parent[x]=parent[parent[x]]; x=parent[x]",
      "            return x",
      "        for u, v in edges:",
      "            if find(u) == find(v): return [u, v]",
      "            parent[find(u)] = find(v)",
      "        return []",
    ],
    builder: buildSteps684,
  },
  721: {
    id: 721,
    difficulty: "medium",
    slug: "accounts-merge",
    category: { key: "union-find", vi: "Union Find", en: "Union Find" },
    title: { vi: "Accounts Merge", en: "Accounts Merge" },
    titleVi: { vi: "Gộp tài khoản theo email chung (Union-Find)", en: "Merge accounts by shared emails (Union-Find)" },
    statement: {
      vi: "Cho danh sách account [tên, email...]. Hai account cùng người nếu chia sẻ ít nhất 1 email. Gộp và trả về [tên, email đã sắp xếp]. Nhập dạng Tên:email1,email2;Tên:email3 (hoặc dùng tham số accounts).",
      en: "Given accounts [name, emails...]. Two accounts are the same person if they share any email. Merge and return [name, sorted emails]. Enter as Name:email1,email2;Name:email3 (or use the accounts param).",
    },
    defaultInput: "John:johnsmith@mail.com,john_newyork@mail.com;John:johnsmith@mail.com,john00@mail.com;Mary:mary@mail.com;John:johnnybravo@mail.com",
    inputKind: "string",
    inputLabel: { vi: "Accounts (Tên:emails; ...)", en: "Accounts (Name:emails; ...)" },
    extraParams: [],
    approach: [
      { vi: "Mỗi email là 1 node Union-Find. Trong 1 account, union mọi email với email đầu.", en: "Each email is a Union-Find node. Within an account, union all emails with the first." },
      { vi: "Account chia sẻ email → cùng root → tự động gộp.", en: "Accounts sharing an email → same root → merged automatically." },
      { vi: "Gom email theo root, sắp xếp, gắn tên chủ tài khoản.", en: "Group emails by root, sort, attach the owner's name." },
    ],
    complexity: { time: "O(N·α + sort)", space: "O(N)", note: { vi: "N = tổng số email. Chi phí chính là sắp xếp email mỗi nhóm.", en: "N = total emails. Dominated by sorting emails per group." } },
    code: [
      "class Solution:",
      "    def accountsMerge(self, accounts):",
      "        parent = {}; email_name = {}",
      "        # find/union with path compression",
      "        for acc in accounts:",
      "            for email in acc[1:]: email_name[email]=acc[0]; union(email, acc[1])",
      "        groups = defaultdict(list)",
      "        for email in email_name: groups[find(email)].append(email)",
      "        return [[email_name[g[0]]] + sorted(g) for g in groups.values()]",
    ],
    builder: buildSteps721,
  },
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
      { vi: "Union-Find dùng chính từ làm key trong parent. union(a, b) nối root của a sang root của b.", en: "Union-Find uses each word directly as a key in parent. union(a, b) links a's root to b's root." },
      { vi: "Duyệt mọi từ synonym, gom các từ có cùng find(word) vào một bucket rồi sort bucket.", en: "Scan every synonym word, bucket words sharing the same find(word), then sort each bucket." },
      { vi: "Mỗi vị trí trong câu nhận một danh sách lựa chọn; từ thường chỉ có chính nó. Backtracking thử tích Descartes của các danh sách này.", en: "Each sentence position receives a choice list; an ordinary word only has itself. Backtracking explores the Cartesian product of these lists." },
      { vi: "Các bucket đã sort nên backtracking sinh câu theo thứ tự từ điển.", en: "Sorted buckets make backtracking generate sentences in lexicographic order." },
    ],
    complexity: {
      time: "O(p·α(v) + C·w)",
      space: "O(v + C·w)",
      note: {
        vi: "p = số cặp, v = số từ synonym, w = số từ trong câu, C = số câu kết quả. C·w là chi phí bắt buộc để tạo output.",
        en: "p = pair count, v = synonym-word count, w = sentence length, and C = output sentence count. C·w is required to materialize the output.",
      },
    },
    code: [
      "from collections import defaultdict",
      "from typing import List",
      "",
      "class UnionFind:",
      "    def __init__(self):",
      "        self.parent = {}",
      "",
      "    def union(self, x, y):",
      "        par_x = self.find(x)",
      "        par_y = self.find(y)",
      "        if par_x != par_y:",
      "            self.parent[par_x] = par_y",
      "",
      "    def find(self, x):",
      "        self.parent.setdefault(x, x)",
      "        if self.parent[x] == x:",
      "            return x",
      "        self.parent[x] = self.find(self.parent[x])",
      "        return self.parent[x]",
      "",
      "class Solution:",
      "    def generateSentences(self, synonyms: List[List[str]], text: str) -> List[str]:",
      "        union_find = UnionFind()",
      "        for x, y in synonyms:",
      "            union_find.union(x, y)",
      "",
      "        syn_map = defaultdict(list)",
      "        for key in union_find.parent:",
      "            par_key = union_find.find(key)",
      "            syn_map[par_key].append(key)",
      "        for key, val in syn_map.items():",
      "            syn_map[key] = sorted(val)",
      "",
      "        words = text.split()",
      "        n = len(words)",
      "        ans = []",
      "",
      "        def dfs(ind):",
      "            if ind == n:",
      "                ans.append(\" \".join(words))",
      "                return",
      "            if words[ind] in union_find.parent:",
      "                par_word = union_find.find(words[ind])",
      "                for syn in syn_map[par_word]:",
      "                    words[ind] = syn",
      "                    dfs(ind + 1)",
      "            else:",
      "                dfs(ind + 1)",
      "",
      "        dfs(0)",
      "        return ans",
    ],
    builder: buildSteps1258,
  },
  1631: {
    id: 1631,
    difficulty: "medium",
    slug: "path-with-minimum-effort",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    tags: [{ key: "dijkstra", vi: "Dijkstra", en: "Dijkstra" }],
    title: { vi: "Path With Minimum Effort", en: "Path With Minimum Effort" },
    titleVi: { vi: "Đường đi với effort nhỏ nhất", en: "Path with minimum effort" },
    statement: {
      vi: "Cho grid m×n. Effort của một đường là |diff| lớn nhất giữa hai ô liên tiếp. Tìm đường từ (0,0) đến (m-1,n-1) có effort nhỏ nhất. Nhập hàng cách bởi ';' hoặc '|', giá trị cách bởi ','.",
      en: "Given an m×n grid, a path's effort is the maximum absolute difference between consecutive cells. Find the minimum-effort path from (0,0) to (m-1,n-1). Separate rows with ';' or '|' and values with ','.",
    },
    defaultInput: "1,2,2;3,8,2;5,3,5",
    inputKind: "string",
    inputLabel: { vi: "Grid (hàng cách ';' hoặc '|')", en: "Grid (rows by ';' or '|')" },
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Union-Find / Kruskal", en: "Approach 1: Union-Find / Kruskal" } },
          { value: "2", label: { vi: "Cách 2: Dijkstra minimax", en: "Approach 2: Minimax Dijkstra" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 — Kruskal: tạo các cạnh giữa ô kề, sắp theo |diff| tăng dần rồi Union cho tới khi start và target nối nhau.", en: "Approach 1 — Kruskal: build adjacent-cell edges, sort by |diff|, then union until start and target connect." },
      { vi: "Cạnh Kruskal cuối cùng vừa thêm là bottleneck, nên trọng số của nó chính là effort tối thiểu.", en: "The last Kruskal edge added is the bottleneck, so its weight is the minimum effort." },
      { vi: "Cách 2 — Dijkstra: effort[r][c] là effort nhỏ nhất đã biết; min-heap luôn pop trạng thái nhỏ nhất trước.", en: "Approach 2 — Dijkstra: effort[r][c] is the smallest known effort; the min-heap pops the smallest state first." },
      { vi: "Dijkstra minimax relax bằng new_effort = max(cur_effort, abs(height hiện tại - height hàng xóm)), không cộng trọng số.", en: "Minimax Dijkstra relaxes with new_effort = max(cur_effort, abs(current height - neighbor height)); weights are not added." },
      { vi: "Khi target được pop khỏi heap, effort đã tối ưu. Visualization Cách 2 debug đúng một dòng code mỗi step và tô xanh đường cuối.", en: "When the target is popped, its effort is optimal. Approach 2 debugs exactly one code line per step and highlights the final path." },
    ],
    complexity: {
      time: "O(R·C log(R·C))",
      space: "O(R·C)",
      note: {
        vi: "Cách 1 sắp E = O(R·C) cạnh; Cách 2 dùng heap trên R·C ô. Cả hai dùng O(R·C) bộ nhớ.",
        en: "Approach 1 sorts E = O(R·C) edges; Approach 2 uses a heap over R·C cells. Both use O(R·C) space.",
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
    code2: [
      "import heapq",
      "from typing import List",
      "",
      "class Solution:",
      "    def minimumEffortPath(self, heights: List[List[int]]) -> int:",
      "        rows, cols = len(heights), len(heights[0])",
      "        effort = [[float('inf')] * cols for _ in range(rows)]",
      "        effort[0][0] = 0",
      "        heap = [(0, 0, 0)]  # effort, row, col",
      "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
      "",
      "        while heap:",
      "            cur_effort, r, c = heapq.heappop(heap)",
      "            if cur_effort > effort[r][c]:",
      "                continue",
      "            if r == rows - 1 and c == cols - 1:",
      "                return cur_effort",
      "",
      "            for dr, dc in directions:",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < rows and 0 <= nc < cols:",
      "                    edge_effort = abs(heights[r][c] - heights[nr][nc])",
      "                    new_effort = max(cur_effort, edge_effort)",
      "                    if new_effort < effort[nr][nc]:",
      "                        effort[nr][nc] = new_effort",
      "                        heapq.heappush(heap, (new_effort, nr, nc))",
      "        return 0",
    ],
    codeLabel: { vi: "Cách 1: Union-Find / Kruskal", en: "Approach 1: Union-Find / Kruskal" },
    code2Label: { vi: "Cách 2: Dijkstra minimax", en: "Approach 2: Minimax Dijkstra" },
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
    extraParams: [
      { key: "n", label: { vi: "n (số nút)", en: "n (number of nodes)" }, default: 5 },
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: Union-Find", en: "Approach 1: Union-Find" } },
          { value: "2", label: { vi: "Cách 2: adjacency list + DFS", en: "Approach 2: adjacency list + DFS" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 (Union-Find): Khởi tạo parent[i]=i, components=n. Với mỗi cạnh (a,b): nếu khác nhóm → union, components--. Kết quả = components sau khi xử lý hết cạnh.", en: "Approach 1 (Union-Find): Initialize parent[i]=i, components=n. For each edge (a,b): if different groups → union, components--. Result = components after processing all edges." },
      { vi: "Cách 2 (DFS): Chuyển edges thành adjacency list. Với mỗi nút chưa thăm, DFS đánh dấu thăm toàn bộ nhóm chứa nó và tăng count. Kết quả = count sau khi xét hết n nút.", en: "Approach 2 (DFS): Convert edges into an adjacency list. For each unvisited node, DFS marks its whole component as visited and increments count. Result = count after checking all n nodes." },
    ],
    complexity: { time: "O((n+e)·α(n)) hoặc O(n+e)", space: "O(n+e)", note: { vi: "e = số cạnh. Union-Find gần O(n+e); DFS đúng O(n+e).", en: "e = number of edges. Union-Find is near O(n+e); DFS is exactly O(n+e)." } },
    codeLabel: { vi: "Cách 1: Union-Find", en: "Approach 1: Union-Find" },
    code2Label: { vi: "Cách 2: adjacency list + DFS", en: "Approach 2: adjacency list + DFS" },
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
    code2: [
      "class Solution:",
      "    def countComponents(self, n, edges):",
      "        graph = [[] for _ in range(n)]",
      "        for u, v in edges:",
      "            graph[u].append(v)",
      "            graph[v].append(u)",
      "        def dfs(node):",
      "            visited[node] = True",
      "            for neighbor in graph[node]:",
      "                if not visited[neighbor]:",
      "                    dfs(neighbor)",
      "        count = 0",
      "        visited = [False for _ in range(n)]",
      "        for node in range(n):",
      "            if not visited[node]:",
      "                dfs(node)",
      "                count += 1",
      "        return count",
    ],
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps323DFS(input, params) : buildSteps323(input, params);
    },
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
