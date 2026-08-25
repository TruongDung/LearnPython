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

// ─── 1101 Approach 2: explicit UnionFind class + recursive path compression ───
function parse1101Data(input, params = {}) {
  const n = Number(params.n);
  if (!Number.isInteger(n) || n < 2) throw new Error("n must be an integer greater than or equal to 2");
  const raw = String(input).trim();
  if (!raw) throw new Error("logs must not be empty");
  const logs = raw.split(";").filter((part) => part.trim()).map((part) => {
    const values = part.split(",").map((value) => value.trim());
    if (values.length !== 3 || values.some((value) => value === "")) {
      throw new Error("every log must contain timestamp,u,v");
    }
    const parsed = values.map(Number);
    if (!parsed.every(Number.isInteger)) throw new Error("every log value must be an integer");
    return parsed;
  });
  logs.forEach(([time, u, v]) => {
    if (time < 0) throw new Error("timestamps must be non-negative");
    if (u < 0 || u >= n || v < 0 || v >= n) throw new Error(`friend pair (${u},${v}) is outside 0..${n - 1}`);
    if (u === v) throw new Error(`friend pair (${u},${v}) must contain two different people`);
  });
  return { n, logs };
}

function buildSteps1101ExplicitUnionFind(input, params = {}) {
  const parsed = parse1101Data(input, params);
  const n = parsed.n;
  const logs = parsed.logs.map((log) => [...log]);
  const root = Array.from({ length: n }, (_, index) => index);
  const rank = new Array(n).fill(1);
  const addedEdges = new Set();
  const steps = [];
  let count = n;
  let answer = -1;
  let currentLog = null;

  const edgeKey = (u, v) => `${Math.min(u, v)}-${Math.max(u, v)}`;
  function peekRoot(node) {
    let current = node;
    while (root[current] !== current) current = root[current];
    return current;
  }

  function snapshot({ title, note, codeLine, event, highlight = [], currentEdge = null,
    extraVars = [], final = false }) {
    const groups = new Map();
    for (let person = 0; person < n; person++) {
      const personRoot = peekRoot(person);
      if (!groups.has(personRoot)) groups.set(personRoot, []);
      groups.get(personRoot).push(person);
    }
    const graphEdges = [...addedEdges].map((key) => {
      const [u, v] = key.split("-").map(Number);
      return { u, v, w: "" };
    });
    if (currentEdge && !addedEdges.has(edgeKey(currentEdge[0], currentEdge[1]))) {
      graphEdges.push({ u: currentEdge[0], v: currentEdge[1], w: "?" });
    }
    const connectedNodes = [...groups.values()].filter((members) => members.length > 1).flat();
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      codeBlock: 2,
      arr: [...root],
      sub: [...rank],
      highlight: [...highlight],
      mark: Array.from({ length: n }, (_, person) => person).filter((person) => root[person] === person),
      graph: {
        nodes: Array.from({ length: n }, (_, person) => ({ id: person, label: String(person) })),
        edges: graphEdges,
        hlNodes: [...highlight],
        hlEdges: currentEdge ? [[currentEdge[0], currentEdge[1]]] : [],
        visitedNodes: connectedNodes,
      },
      vars: [
        { name: "root", value: `[${root.join(", ")}]` },
        { name: "rank", value: `[${rank.join(", ")}]` },
        { name: "count", value: count },
        ...extraVars,
      ],
      unionFind1101View: {
        event,
        n,
        logs: logs.map((log) => [...log]),
        currentLog: currentLog ? [...currentLog] : null,
        root: [...root],
        rank: [...rank],
        count,
        groups: [...groups.entries()].map(([groupRoot, members]) => ({ root: groupRoot, members: [...members] })),
        acceptedEdges: graphEdges.filter((edge) => edge.w !== "?").map((edge) => ({ ...edge })),
        currentEdge: currentEdge ? [...currentEdge] : null,
      },
      final,
    });
  }

  function findVisual(x, label, depth = 0) {
    const indent = "  ".repeat(depth);
    snapshot({
      title: { vi: `${indent}find(${x}): kiểm tra root[${x}]`, en: `${indent}find(${x}): check root[${x}]` },
      note: root[x] === x
        ? { vi: `${x} đang là root của chính nó.`, en: `${x} is currently its own root.` }
        : { vi: `root[${x}] = ${root[x]}, tiếp tục đệ quy để tìm root cuối.`, en: `root[${x}] = ${root[x]}; recurse to find the final root.` },
      codeLine: 10,
      event: "find-check",
      highlight: [x],
      currentEdge: currentLog ? [currentLog[1], currentLog[2]] : null,
      extraVars: [{ name: label, value: x }, { name: "find depth", value: depth }],
    });
    if (root[x] === x) {
      snapshot({
        title: { vi: `${indent}find(${x}) → ${x}`, en: `${indent}find(${x}) → ${x}` },
        note: { vi: "Điều kiện base case đúng, trả root hiện tại.", en: "The base case is true; return the current root." },
        codeLine: 11,
        event: "find-base",
        highlight: [x],
        currentEdge: currentLog ? [currentLog[1], currentLog[2]] : null,
        extraVars: [{ name: `find(${x})`, value: x }],
      });
      return x;
    }

    const parentBefore = root[x];
    snapshot({
      title: { vi: `${indent}Gọi find(root[${x}]) = find(${parentBefore})`, en: `${indent}Call find(root[${x}]) = find(${parentBefore})` },
      note: { vi: "Đi xuống parent trước, sau đó gán trực tiếp node hiện tại về root cuối.", en: "Follow the parent first, then point the current node directly to the final root." },
      codeLine: 12,
      event: "find-recurse",
      highlight: [x, parentBefore],
      currentEdge: currentLog ? [currentLog[1], currentLog[2]] : null,
      extraVars: [{ name: "x", value: x }, { name: "root[x] before", value: parentBefore }],
    });
    const foundRoot = findVisual(parentBefore, label, depth + 1);
    root[x] = foundRoot;
    snapshot({
      title: { vi: `Path compression: root[${x}] = ${foundRoot}`, en: `Path compression: root[${x}] = ${foundRoot}` },
      note: parentBefore === foundRoot
        ? { vi: `${x} đã trỏ trực tiếp tới root nên mảng root không đổi.`, en: `${x} already pointed directly to the root, so the root array is unchanged.` }
        : { vi: `Rút ngắn đường đi ${x} → ${parentBefore} → … → ${foundRoot} thành ${x} → ${foundRoot}.`, en: `Compress ${x} → ${parentBefore} → … → ${foundRoot} into ${x} → ${foundRoot}.` },
      codeLine: 13,
      event: "path-compress",
      highlight: [x, foundRoot],
      currentEdge: currentLog ? [currentLog[1], currentLog[2]] : null,
      extraVars: [{ name: "root_x", value: foundRoot }],
    });
    snapshot({
      title: { vi: `find(${x}) trả ${foundRoot}`, en: `find(${x}) returns ${foundRoot}` },
      note: { vi: "Trả root đã được cache sau path compression.", en: "Return the root cached by path compression." },
      codeLine: 14,
      event: "find-return",
      highlight: [x, foundRoot],
      currentEdge: currentLog ? [currentLog[1], currentLog[2]] : null,
      extraVars: [{ name: `find(${x})`, value: foundRoot }],
    });
    return foundRoot;
  }

  function unionVisual(x, y) {
    const rootX = findVisual(x, "x");
    snapshot({
      title: { vi: `root_x = ${rootX}`, en: `root_x = ${rootX}` },
      note: { vi: `Lưu kết quả find(${x}) vào root_x.`, en: `Store find(${x}) in root_x.` },
      codeLine: 17,
      event: "root-x",
      highlight: [x, rootX],
      currentEdge: [x, y],
      extraVars: [{ name: "root_x", value: rootX }],
    });
    const rootY = findVisual(y, "y");
    snapshot({
      title: { vi: `root_y = ${rootY}`, en: `root_y = ${rootY}` },
      note: { vi: `Lưu kết quả find(${y}) vào root_y.`, en: `Store find(${y}) in root_y.` },
      codeLine: 18,
      event: "root-y",
      highlight: [y, rootY],
      currentEdge: [x, y],
      extraVars: [{ name: "root_x", value: rootX }, { name: "root_y", value: rootY }],
    });
    snapshot({
      title: rootX === rootY
        ? { vi: `R${rootX} = R${rootY}: đã cùng nhóm`, en: `R${rootX} = R${rootY}: already one group` }
        : { vi: `R${rootX} ≠ R${rootY}: cần union`, en: `R${rootX} ≠ R${rootY}: union is needed` },
      note: rootX === rootY
        ? { vi: "Không merge và không giảm count.", en: "Do not merge or decrement count." }
        : { vi: "Hai root khác nhau, tiếp tục so sánh rank.", en: "The roots differ; compare their ranks next." },
      codeLine: 19,
      event: "compare-roots",
      highlight: [rootX, rootY],
      currentEdge: [x, y],
      extraVars: [{ name: "root_x", value: rootX }, { name: "root_y", value: rootY }],
    });
    if (rootX === rootY) {
      snapshot({
        title: { vi: "return: bỏ qua cạnh dư", en: "return: skip the redundant edge" },
        note: { vi: "Hai người đã kết nối gián tiếp nên trạng thái DSU giữ nguyên.", en: "The people are already indirectly connected, so the DSU remains unchanged." },
        codeLine: 20,
        event: "skip-union",
        highlight: [x, y],
        currentEdge: [x, y],
      });
      return false;
    }

    snapshot({
      title: { vi: `So sánh rank[${rootX}] > rank[${rootY}]`, en: `Compare rank[${rootX}] > rank[${rootY}]` },
      note: { vi: `${rank[rootX]} > ${rank[rootY]} là ${rank[rootX] > rank[rootY]}.`, en: `${rank[rootX]} > ${rank[rootY]} is ${rank[rootX] > rank[rootY]}.` },
      codeLine: 21,
      event: "rank-greater",
      highlight: [rootX, rootY],
      currentEdge: [x, y],
    });
    if (rank[rootX] > rank[rootY]) {
      root[rootY] = rootX;
      addedEdges.add(edgeKey(x, y));
      snapshot({
        title: { vi: `Gắn R${rootY} vào R${rootX}`, en: `Attach R${rootY} to R${rootX}` },
        note: { vi: "Tree rank thấp hơn nối dưới tree rank cao hơn.", en: "Attach the lower-rank tree below the higher-rank tree." },
        codeLine: 22,
        event: "attach-y-to-x",
        highlight: [rootX, rootY],
        currentEdge: [x, y],
      });
    } else {
      snapshot({
        title: { vi: `So sánh rank[${rootX}] < rank[${rootY}]`, en: `Compare rank[${rootX}] < rank[${rootY}]` },
        note: { vi: `${rank[rootX]} < ${rank[rootY]} là ${rank[rootX] < rank[rootY]}.`, en: `${rank[rootX]} < ${rank[rootY]} is ${rank[rootX] < rank[rootY]}.` },
        codeLine: 23,
        event: "rank-less",
        highlight: [rootX, rootY],
        currentEdge: [x, y],
      });
      if (rank[rootX] < rank[rootY]) {
        root[rootX] = rootY;
        addedEdges.add(edgeKey(x, y));
        snapshot({
          title: { vi: `Gắn R${rootX} vào R${rootY}`, en: `Attach R${rootX} to R${rootY}` },
          note: { vi: "Tree rank thấp hơn nối dưới tree rank cao hơn.", en: "Attach the lower-rank tree below the higher-rank tree." },
          codeLine: 24,
          event: "attach-x-to-y",
          highlight: [rootX, rootY],
          currentEdge: [x, y],
        });
      } else {
        snapshot({
          title: { vi: `Hai rank bằng ${rank[rootX]}`, en: `Both ranks equal ${rank[rootX]}` },
          note: { vi: "Có thể chọn một root; code giữ root_x làm root mới.", en: "Either root works; the code keeps root_x as the new root." },
          codeLine: 25,
          event: "equal-rank",
          highlight: [rootX, rootY],
          currentEdge: [x, y],
        });
        root[rootY] = rootX;
        addedEdges.add(edgeKey(x, y));
        snapshot({
          title: { vi: `root[${rootY}] = ${rootX}`, en: `root[${rootY}] = ${rootX}` },
          note: { vi: `Gắn R${rootY} vào R${rootX}.`, en: `Attach R${rootY} below R${rootX}.` },
          codeLine: 26,
          event: "attach-equal-rank",
          highlight: [rootX, rootY],
          currentEdge: [x, y],
        });
        rank[rootX] += 1;
        snapshot({
          title: { vi: `rank[${rootX}] tăng lên ${rank[rootX]}`, en: `rank[${rootX}] increases to ${rank[rootX]}` },
          note: { vi: "Chỉ tăng rank khi merge hai tree có cùng rank.", en: "Increase rank only when merging two equal-rank trees." },
          codeLine: 27,
          event: "increase-rank",
          highlight: [rootX],
          currentEdge: [x, y],
        });
      }
    }

    count -= 1;
    snapshot({
      title: { vi: `count giảm: ${count + 1} → ${count}`, en: `count decreases: ${count + 1} → ${count}` },
      note: { vi: "Một merge thành công luôn giảm số component đúng 1.", en: "Every successful merge decreases the component count by exactly one." },
      codeLine: 28,
      event: "decrement-count",
      highlight: [x, y],
      currentEdge: [x, y],
      extraVars: [{ name: "merged", value: true }],
    });
    return true;
  }

  snapshot({
    title: { vi: `Tạo UnionFind(${n})`, en: `Create UnionFind(${n})` },
    note: { vi: "Cách 2 đóng gói root, rank và count trong một class riêng.", en: "Approach 2 encapsulates root, rank, and count in a dedicated class." },
    codeLine: 38,
    event: "construct-call",
    extraVars: [{ name: "n", value: n }],
  });
  snapshot({ title: { vi: "Khởi tạo root", en: "Initialize root" }, note: { vi: "Ban đầu mỗi người là root riêng.", en: "Initially every person is a separate root." }, codeLine: 5, event: "init-root" });
  snapshot({ title: { vi: "Khởi tạo rank = 1", en: "Initialize rank = 1" }, note: { vi: "Mỗi component ban đầu có rank 1.", en: "Every initial component has rank 1." }, codeLine: 6, event: "init-rank" });
  snapshot({ title: { vi: `Khởi tạo count = ${n}`, en: `Initialize count = ${n}` }, note: { vi: "count theo dõi trực tiếp số component còn lại.", en: "count directly tracks the number of remaining components." }, codeLine: 7, event: "init-count" });

  logs.sort((a, b) => a[0] - b[0]);
  snapshot({
    title: { vi: "Sort logs theo timestamp", en: "Sort logs by timestamp" },
    note: { vi: logs.map(([time, u, v]) => `${time}:(${u},${v})`).join(" → "), en: logs.map(([time, u, v]) => `${time}:(${u},${v})`).join(" → ") },
    codeLine: 39,
    event: "sort-logs",
    extraVars: [{ name: "logs", value: JSON.stringify(logs) }],
  });

  for (let index = 0; index < logs.length; index++) {
    currentLog = logs[index];
    const [time, u, v] = currentLog;
    snapshot({
      title: { vi: `Log #${index}: timestamp ${time}`, en: `Log #${index}: timestamp ${time}` },
      note: { vi: `Lấy sự kiện tiếp theo theo thời gian: ${u} và ${v} trở thành bạn.`, en: `Read the next chronological event: ${u} and ${v} become friends.` },
      codeLine: 40,
      event: "loop-log",
      highlight: [u, v],
      currentEdge: [u, v],
      extraVars: [{ name: "log", value: `[${time}, ${u}, ${v}]` }],
    });
    snapshot({
      title: { vi: `time=${time}, u=${u}, v=${v}`, en: `time=${time}, u=${u}, v=${v}` },
      note: { vi: "Unpack timestamp và hai người từ log.", en: "Unpack the timestamp and two people from the log." },
      codeLine: 41,
      event: "unpack-log",
      highlight: [u, v],
      currentEdge: [u, v],
      extraVars: [{ name: "time", value: time }, { name: "u", value: u }, { name: "v", value: v }],
    });
    snapshot({
      title: { vi: `Gọi uf.union(${u}, ${v})`, en: `Call uf.union(${u}, ${v})` },
      note: { vi: "Union sẽ gọi recursive find cho cả hai đầu rồi merge theo rank nếu cần.", en: "Union recursively finds both roots, then merges by rank when needed." },
      codeLine: 42,
      event: "union-call",
      highlight: [u, v],
      currentEdge: [u, v],
    });
    unionVisual(u, v);
    snapshot({
      title: { vi: "Gọi uf.get_count()", en: "Call uf.get_count()" },
      note: { vi: "Đọc số component hiện tại từ object UnionFind.", en: "Read the current component count from the UnionFind object." },
      codeLine: 33,
      event: "get-count-call",
      highlight: [u, v],
      currentEdge: [u, v],
    });
    snapshot({
      title: { vi: `get_count() trả ${count}`, en: `get_count() returns ${count}` },
      note: { vi: "Không cần quét lại root; count đã được cập nhật sau mỗi merge.", en: "No root scan is needed; count is maintained after every merge." },
      codeLine: 34,
      event: "get-count-return",
      highlight: [u, v],
      currentEdge: [u, v],
    });
    snapshot({
      title: count === 1
        ? { vi: "count == 1 → tất cả đã kết nối", en: "count == 1 → everyone is connected" }
        : { vi: `count = ${count}, tiếp tục`, en: `count = ${count}; continue` },
      note: count === 1
        ? { vi: `Timestamp ${time} là thời điểm sớm nhất.`, en: `Timestamp ${time} is the earliest moment.` }
        : { vi: "Vẫn còn nhiều component nên xử lý log kế tiếp.", en: "Multiple components remain, so process the next log." },
      codeLine: 43,
      event: "check-count",
      highlight: [u, v],
      currentEdge: [u, v],
      extraVars: [{ name: "count == 1", value: count === 1 }],
    });
    if (count === 1) {
      answer = time;
      snapshot({
        title: { vi: `Trả timestamp ${time}`, en: `Return timestamp ${time}` },
        note: { vi: `Mọi người thuộc cùng một component tại thời điểm ${time}.`, en: `Everyone belongs to one component at timestamp ${time}.` },
        codeLine: 44,
        event: "return-time",
        highlight: Array.from({ length: n }, (_, person) => person),
        extraVars: [{ name: "answer", value: answer }],
        final: true,
      });
      break;
    }
  }

  if (answer === -1) {
    currentLog = null;
    snapshot({
      title: { vi: "Không thể kết nối tất cả → -1", en: "Everyone never connects → -1" },
      note: { vi: "Đã xử lý hết logs nhưng count vẫn lớn hơn 1.", en: "All logs were processed but count is still greater than one." },
      codeLine: 45,
      event: "return-negative-one",
      extraVars: [{ name: "answer", value: -1 }],
      final: true,
    });
  }

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
    [3, 9]
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
      alreadySame ? [10, 11, 12] : [10, 11, 12, 13, 14]
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
    [15]
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

// ─── 1697: Checking Existence of Edge Length Limited Paths (offline Union-Find) ───
function buildSteps1697(input, params) {
  const n = params && params.n !== undefined ? Number(params.n) : 3;
  const edgeList = String(input || "").split(";").map((s) => s.trim()).filter(Boolean)
    .map((s) => s.split(",").map((x) => Number(x.trim())))
    .filter((e) => e.length === 3 && !e.some(isNaN));
  const queries = String((params && params.queries) || "").split(";").map((s) => s.trim()).filter(Boolean)
    .map((s) => s.split(",").map((x) => Number(x.trim())))
    .filter((q) => q.length === 3 && !q.some(isNaN));
  const steps = [];

  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }

  const drawn = [];              // {u, v, w}
  const drawnKeys = new Set();
  function drawnEdges() { return drawn.map((e) => ({ u: e.u, v: e.v, w: e.w, undirected: true })); }

  function snap(o) {
    steps.push({
      title: o.title, arr: [],
      graph: {
        nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: String(i) })),
        edges: drawnEdges(),
        hlNodes: o.hlNodes || [], hlEdges: o.hlEdges || [], visitedNodes: o.visitedNodes || [], annotations: {},
      },
      highlight: [], mark: [], final: o.final || false,
      codeLines: o.codeLines || [],
      vars: o.vars || [], note: o.note,
    });
  }

  const edgesStr = (list) => `[${list.map((e) => `(${e[0]},${e[1]},d${e[2]})`).join(", ")}]`;
  const parentStr = () => `[${parent.join(",")}]`;

  // ── Intro (line 2) ──
  snap({
    title: { vi: `Bài toán: ${n} node, ${edgeList.length} cạnh, ${queries.length} query`, en: `Problem: ${n} nodes, ${edgeList.length} edges, ${queries.length} queries` },
    codeLines: [2],
    vars: [
      { name: "n", value: n },
      { name: "edgeList", value: edgesStr(edgeList) },
      { name: "queries", value: `[${queries.map((q) => `(${q[0]},${q[1]},lim${q[2]})`).join(", ")}]` },
    ],
    note: {
      vi: `Mỗi query (p,q,limit): tồn tại đường p→q chỉ dùng cạnh có dist < limit? Ý tưởng OFFLINE: sắp cạnh theo dist tăng, sắp query theo limit tăng, rồi Union-Find gộp dần.`,
      en: `Each query (p,q,limit): is there a path p→q using only edges with dist < limit? OFFLINE idea: sort edges by dist, sort queries by limit, then union incrementally.`,
    },
  });

  // ── Line 3: sort edges by dist ──
  const sortedEdges = edgeList.map((e) => [...e]).sort((a, b) => a[2] - b[2]);
  snap({
    title: { vi: "line 3: edgeList.sort theo dist", en: "line 3: edgeList.sort by dist" },
    codeLines: [3],
    vars: [{ name: "sorted edgeList", value: edgesStr(sortedEdges) }],
    note: { vi: `Sắp cạnh theo khoảng cách tăng dần: ${edgesStr(sortedEdges)}.`, en: `Sort edges by increasing distance: ${edgesStr(sortedEdges)}.` },
  });

  // ── Line 4: sort queries by limit ──
  const order = queries.map((_, i) => i).sort((a, b) => queries[a][2] - queries[b][2]);
  snap({
    title: { vi: "line 4: order = queries sắp theo limit", en: "line 4: order = queries sorted by limit" },
    codeLines: [4],
    vars: [{ name: "order", value: `[${order.join(", ")}]` }, { name: "limits", value: `[${order.map((i) => queries[i][2]).join(", ")}]` }],
    note: { vi: `Xử lý query theo limit tăng dần để chỉ cần gộp cạnh MỘT LƯỢT. Thứ tự query gốc: [${order.join(", ")}].`, en: `Process queries by increasing limit so edges are unioned in a SINGLE sweep. Original query indices in order: [${order.join(", ")}].` },
  });

  // ── Line 5: parent init ──
  snap({
    title: { vi: "line 5: parent = list(range(n))", en: "line 5: parent = list(range(n))" },
    codeLines: [5], vars: [{ name: "parent", value: parentStr() }],
    note: { vi: "Union-Find: ban đầu mỗi node là nhóm riêng.", en: "Union-Find: each node starts in its own group." },
  });

  // ── Line 11: answer init, Line 12: ei = 0 ──
  const answer = new Array(queries.length).fill(false);
  snap({
    title: { vi: "line 11-12: answer = [False]*q; ei = 0", en: "line 11-12: answer = [False]*q; ei = 0" },
    codeLines: [11, 12], vars: [{ name: "answer", value: `[${answer.join(", ")}]` }, { name: "ei", value: 0 }],
    note: { vi: "ei = con trỏ cạnh đã gộp (không lùi lại nhờ đã sắp xếp).", en: "ei = pointer to edges already unioned (never rewinds thanks to sorting)." },
  });

  let ei = 0;
  for (const qi of order) {
    const [p, q, limit] = queries[qi];
    snap({
      title: { vi: `line 13-14: i=${qi} → query (p=${p}, q=${q}, limit=${limit})`, en: `line 13-14: i=${qi} → query (p=${p}, q=${q}, limit=${limit})` },
      hlNodes: [p, q], codeLines: [13, 14],
      vars: [{ name: "i", value: qi }, { name: "p, q, limit", value: `${p}, ${q}, ${limit}` }, { name: "ei", value: ei }],
      note: { vi: `Xử lý query gốc #${qi}: có đường ${p}→${q} với mọi cạnh dist < ${limit} không?`, en: `Handle original query #${qi}: is there a path ${p}→${q} with every edge dist < ${limit}?` },
    });

    // while ei < len and sortedEdges[ei][2] < limit
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const has = ei < sortedEdges.length;
      const within = has && sortedEdges[ei][2] < limit;
      snap({
        title: { vi: `line 15: ei<${sortedEdges.length} và dist<${limit}? ${within}`, en: `line 15: ei<${sortedEdges.length} and dist<${limit}? ${within}` },
        hlNodes: [p, q], hlEdges: within ? [[sortedEdges[ei][0], sortedEdges[ei][1]]] : [], codeLines: [15],
        vars: [{ name: "ei", value: ei }, { name: has ? "edge[ei]" : "edge[ei]", value: has ? `(${sortedEdges[ei][0]},${sortedEdges[ei][1]},d${sortedEdges[ei][2]})` : "—" }, { name: "limit", value: limit }],
        note: {
          vi: within ? `Cạnh dist=${sortedEdges[ei][2]} < ${limit} → gộp cạnh này.` : has ? `Cạnh dist=${sortedEdges[ei][2]} ≥ ${limit} → dừng gộp cho query này.` : `Hết cạnh → dừng gộp.`,
          en: within ? `Edge dist=${sortedEdges[ei][2]} < ${limit} → union this edge.` : has ? `Edge dist=${sortedEdges[ei][2]} ≥ ${limit} → stop unioning for this query.` : `No more edges → stop.`,
        },
      });
      if (!within) break;

      const [eu, ev, ew] = sortedEdges[ei];
      parent[find(eu)] = find(ev);
      const k = eu < ev ? `${eu}-${ev}` : `${ev}-${eu}`;
      if (!drawnKeys.has(k)) { drawnKeys.add(k); drawn.push({ u: eu, v: ev, w: ew }); }
      snap({
        title: { vi: `line 16: union(${eu}, ${ev})`, en: `line 16: union(${eu}, ${ev})` },
        hlNodes: [eu, ev], hlEdges: [[eu, ev]], codeLines: [16],
        vars: [{ name: "edge", value: `(${eu},${ev},d${ew})` }, { name: "parent", value: parentStr() }],
        note: { vi: `Gộp nhóm chứa ${eu} và ${ev} (cạnh dist ${ew}).`, en: `Union the groups of ${eu} and ${ev} (edge dist ${ew}).` },
      });
      ei += 1;
      snap({
        title: { vi: `line 17: ei += 1 → ${ei}`, en: `line 17: ei += 1 → ${ei}` },
        hlNodes: [p, q], codeLines: [17], vars: [{ name: "ei", value: ei }],
        note: { vi: `Chuyển sang cạnh tiếp theo (con trỏ không lùi).`, en: `Advance to the next edge (pointer never rewinds).` },
      });
    }

    const rp = find(p), rq = find(q);
    answer[qi] = rp === rq;
    snap({
      title: { vi: `line 18: find(${p})=${rp}, find(${q})=${rq} → ${answer[qi]}`, en: `line 18: find(${p})=${rp}, find(${q})=${rq} → ${answer[qi]}` },
      hlNodes: [p, q], visitedNodes: answer[qi] ? [p, q] : [], codeLines: [18],
      vars: [{ name: "find(p)", value: rp }, { name: "find(q)", value: rq }, { name: `answer[${qi}]`, value: answer[qi] }, { name: "answer", value: `[${answer.join(", ")}]` }],
      note: {
        vi: answer[qi] ? `${p} và ${q} cùng nhóm → CÓ đường hợp lệ → answer[${qi}] = True.` : `${p} và ${q} khác nhóm → KHÔNG có đường → answer[${qi}] = False.`,
        en: answer[qi] ? `${p} and ${q} share a group → path exists → answer[${qi}] = True.` : `${p} and ${q} are in different groups → no path → answer[${qi}] = False.`,
      },
    });
  }

  snap({
    title: { vi: `line 19: return [${answer.join(", ")}]`, en: `line 19: return [${answer.join(", ")}]` },
    codeLines: [19], final: true,
    vars: [{ name: "answer", value: `[${answer.join(", ")}]` }],
    note: { vi: `Kết quả cuối: [${answer.join(", ")}].`, en: `Final result: [${answer.join(", ")}].` },
  });

  return { input, answer: `[${answer.join(", ")}]`, steps };
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

// ─── 685: Redundant Connection II ───
// A directed graph can fail in two different ways: one node may receive two
// parents, and/or an edge may close a directed cycle.  Detect the two-parent
// candidates first, then run DSU while skipping the later candidate edge.
function buildSteps685(input) {
  const raw = String(input ?? "").trim();
  let edges;
  try {
    edges = raw.startsWith("[")
      ? JSON.parse(raw)
      : raw.split(";").map((part) => part.trim()).filter(Boolean).map((part) => part.split(",").map((value) => Number(value.trim())));
  } catch (_error) {
    throw new Error("Enter directed edges as u,v;u,v or JSON [[u,v],[u,v]]");
  }
  if (!Array.isArray(edges) || edges.length < 2 || edges.some((edge) => !Array.isArray(edge) || edge.length !== 2 || edge.some((node) => !Number.isInteger(node) || node < 1))) {
    throw new Error("Each directed edge must contain two positive integer nodes");
  }

  const n = Math.max(...edges.flat());
  if (n > 12) throw new Error("Redundant Connection II visualization supports at most 12 nodes");
  const incoming = new Array(n + 1).fill(0);
  const uf = Array.from({ length: n + 1 }, (_, index) => index);
  const steps = [];
  let first = null;
  let second = null;
  let skippedIndex = -1;
  let cycle = null;
  const processed = new Set();

  const rootOf = (node) => {
    let root = node;
    while (uf[root] !== root) root = uf[root];
    return root;
  };
  const find = (node) => {
    if (uf[node] !== node) uf[node] = find(uf[node]);
    return uf[node];
  };
  const edgeText = (edge) => edge ? `[${edge[0]}, ${edge[1]}]` : "-";
  const incomingText = () => `[${Array.from({ length: n }, (_, index) => `${index + 1}<-${incoming[index + 1] || "-"}`).join(", ")}]`;
  const ufText = () => `[${Array.from({ length: n }, (_, index) => `${index + 1}->${uf[index + 1]}`).join(", ")}]`;

  function snapshot({ title, note, codeLine, phase, activeIndex = -1, roots = null, decision = null, final = false, answer = null }) {
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      arr: [],
      highlight: [],
      mark: [],
      final,
      vars: [
        { name: "first", value: edgeText(first) },
        { name: "second", value: edgeText(second) },
        { name: "cycle", value: edgeText(cycle) },
        { name: "incoming", value: incomingText() },
        { name: "uf", value: ufText() },
      ],
      directed685View: {
        n,
        nodes: Array.from({ length: n }, (_, index) => index + 1),
        edges: edges.map(([u, v], index) => ({ u, v, index })),
        incoming: incoming.slice(1),
        uf: uf.slice(1),
        roots: Array.from({ length: n }, (_, index) => rootOf(index + 1)),
        phase,
        activeIndex,
        processedIndexes: [...processed],
        skippedIndex,
        first: first ? [...first] : null,
        second: second ? [...second] : null,
        cycle: cycle ? [...cycle] : null,
        rootsCompared: roots ? { ...roots } : null,
        decision: decision ? { ...decision } : null,
        answer: answer ? [...answer] : null,
      },
    });
  }

  snapshot({
    title: { vi: `n = ${n}, ${edges.length} cạnh có hướng`, en: `n = ${n}, ${edges.length} directed edges` },
    note: { vi: "Một rooted tree phải có đúng một parent cho mỗi node (trừ root) và không có cycle. Ta kiểm tra cả hai điều kiện.", en: "A rooted tree gives every non-root exactly one parent and contains no cycle. Check both conditions." },
    codeLine: 3,
    phase: "init",
  });
  snapshot({
    title: { vi: "incoming[node] = 0; first = second = None", en: "incoming[node] = 0; first = second = None" },
    note: { vi: "incoming ghi nhận parent đầu tiên của từng node; first/second sẽ lưu hai cạnh cùng đi vào một node nếu có.", en: "incoming records each node's first parent; first/second will hold the two edges entering one node, if any." },
    codeLine: 4,
    phase: "scan",
  });

  for (let index = 0; index < edges.length; index++) {
    const [u, v] = edges[index];
    snapshot({
      title: { vi: `Quét edge #${index}: ${u} -> ${v}`, en: `Scan edge #${index}: ${u} -> ${v}` },
      note: { vi: `Kiểm tra node ${v} đã có parent trong incoming chưa.`, en: `Check whether node ${v} already has a parent in incoming.` },
      codeLine: 6,
      phase: "scan",
      activeIndex: index,
      decision: { kind: "scan", edge: [u, v] },
    });
    if (incoming[v] !== 0) {
      first = [incoming[v], v];
      second = [u, v];
      skippedIndex = index;
      snapshot({
        title: { vi: `Node ${v} có hai parent`, en: `Node ${v} has two parents` },
        note: { vi: `${incoming[v]} -> ${v} đến trước, ${u} -> ${v} đến sau. Tạm bỏ cạnh đến sau khi kiểm tra cycle.`, en: `${incoming[v]} -> ${v} arrived first and ${u} -> ${v} arrived later. Temporarily skip the later edge while checking cycles.` },
        codeLine: 7,
        phase: "two-parent",
        activeIndex: index,
        decision: { kind: "two-parent", node: v, first: [...first], second: [...second] },
      });
    } else {
      incoming[v] = u;
      snapshot({
        title: { vi: `incoming[${v}] = ${u}`, en: `incoming[${v}] = ${u}` },
        note: { vi: `Đây là parent đầu tiên của node ${v}; chưa có xung đột parent.`, en: `This is node ${v}'s first parent; there is no parent conflict yet.` },
        codeLine: 11,
        phase: "scan",
        activeIndex: index,
        decision: { kind: "set-parent", node: v, parent: u },
      });
    }
  }

  snapshot({
    title: { vi: "Khởi tạo Union-Find", en: "Initialize Union-Find" },
    note: { vi: "DSU sẽ thử thêm mọi cạnh, trừ second (nếu tồn tại), để phát hiện cycle.", en: "DSU will try every edge except second (when present) to detect a cycle." },
    codeLine: 12,
    phase: "union-init",
  });

  for (let index = 0; index < edges.length; index++) {
    const [u, v] = edges[index];
    if (index === skippedIndex) {
      snapshot({
        title: { vi: `Bỏ tạm edge #${index}: ${u} -> ${v}`, en: `Temporarily skip edge #${index}: ${u} -> ${v}` },
        note: { vi: "Đây là second, cạnh đến sau của node có hai parent. Nếu phần còn lại vẫn cycle thì first mới là cạnh cần xóa.", en: "This is second, the later edge into the two-parent node. If the rest still cycles, first is the edge to remove." },
        codeLine: 20,
        phase: "skip",
        activeIndex: index,
        decision: { kind: "skip", edge: [u, v] },
      });
      continue;
    }

    const ru = find(u);
    const rv = find(v);
    snapshot({
      title: { vi: `find(${u}) = ${ru}, find(${v}) = ${rv}`, en: `find(${u}) = ${ru}, find(${v}) = ${rv}` },
      note: ru === rv
        ? { vi: "Hai đầu đã cùng component: edge này đóng một cycle.", en: "The endpoints already share a component: this edge closes a cycle." }
        : { vi: "Hai đầu khác component: có thể union an toàn.", en: "The endpoints are in different components: union is safe." },
      codeLine: 21,
      phase: "union-check",
      activeIndex: index,
      roots: { u: ru, v: rv },
      decision: { kind: ru === rv ? "cycle" : "union", edge: [u, v], ru, rv },
    });
    if (ru === rv) {
      cycle = [u, v];
      snapshot({
        title: { vi: `Cycle tìm thấy tại ${u} -> ${v}`, en: `Cycle found at ${u} -> ${v}` },
        note: { vi: "Nếu không có xung đột hai parent, đây chính là cạnh cần xóa. Nếu có, nó quyết định chọn first.", en: "Without a two-parent conflict, this is the removal edge. With one, it decides that first must be removed." },
        codeLine: 22,
        phase: "cycle",
        activeIndex: index,
        roots: { u: ru, v: rv },
        decision: { kind: "cycle", edge: [u, v] },
      });
      break;
    }
    uf[ru] = rv;
    processed.add(index);
    snapshot({
      title: { vi: `Union ${ru} -> ${rv} bằng edge ${u} -> ${v}`, en: `Union ${ru} -> ${rv} via edge ${u} -> ${v}` },
      note: { vi: "Cạnh này được giữ trong cây tạm thời vì nó nối hai component khác nhau.", en: "Keep this edge in the temporary tree because it joins two different components." },
      codeLine: 23,
      phase: "union",
      activeIndex: index,
      roots: { u: ru, v: rv },
      decision: { kind: "union", edge: [u, v], ru, rv },
    });
  }

  let answer;
  if (!first) {
    answer = cycle || [];
    snapshot({
      title: { vi: `Không có node hai parent -> xóa ${edgeText(answer)}`, en: `No two-parent node -> remove ${edgeText(answer)}` },
      note: { vi: "Trường hợp chỉ có cycle: cạnh đóng cycle là cạnh dư.", en: "Cycle-only case: the edge closing that cycle is redundant." },
      codeLine: 24,
      phase: "done",
      decision: { kind: "cycle-only", answer },
      answer,
      final: true,
    });
  } else {
    answer = cycle ? first : second;
    snapshot({
      title: { vi: `Chọn xóa ${edgeText(answer)}`, en: `Choose to remove ${edgeText(answer)}` },
      note: cycle
        ? { vi: "Bỏ second mà cycle vẫn còn, nên first nằm trong cycle và phải bị xóa.", en: "Skipping second still left a cycle, so first lies on that cycle and must be removed." }
        : { vi: "Bỏ second làm đồ thị không cycle, nên second là cạnh dư gây hai parent.", en: "Skipping second leaves no cycle, so second is the redundant two-parent edge." },
      codeLine: 25,
      phase: "done",
      decision: { kind: cycle ? "remove-first" : "remove-second", answer },
      answer,
      final: true,
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

// ─── 990: Satisfiability of Equality Equations ───
// First merge every equality (==), then verify that each inequality (!=)
// still places its two letters in different DSU components.
function buildSteps990(input) {
  const equations = String(input).split(/[;,\n]/).map((value) => value.trim()).filter(Boolean);
  if (equations.length === 0) throw new Error("enter at least one equation, e.g. a==b,b!=c,c==a");
  if (equations.length > 60) throw new Error("visualization supports at most 60 equations");
  equations.forEach((equation) => {
    if (!/^[a-z](?:==|!=)[a-z]$/.test(equation)) {
      throw new Error(`invalid equation \"${equation}\"; use exactly a==b or a!=b`);
    }
  });

  const letters = [...new Set(equations.flatMap((equation) => [equation[0], equation[3]]))].sort();
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const parent = Array.from({ length: 26 }, (_, index) => index);
  const size = new Array(26).fill(1);
  const states = new Array(equations.length).fill("pending");
  const steps = [];
  let answer = null;

  const indexOf = (letter) => letter.charCodeAt(0) - 97;
  const letterOf = (index) => alphabet[index];
  const rootOf = (index) => {
    let root = index;
    while (parent[root] !== root) root = parent[root];
    return root;
  };
  const parentSummary = () => `[${letters.map((letter) => `${letter}→${letterOf(parent[indexOf(letter)])}`).join(", ")}]`;

  function components() {
    const groups = new Map();
    letters.forEach((letter) => {
      const root = rootOf(indexOf(letter));
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(letter);
    });
    return [...groups.entries()]
      .map(([root, members]) => ({ root: letterOf(root), members }))
      .sort((a, b) => a.root.localeCompare(b.root));
  }

  function snapshot({ title, note, codeLines, phase, activeEquation = null, activeLetters = [], event = "idle",
    union = null, comparison = null, final = false }) {
    steps.push({
      title,
      note,
      codeLines,
      arr: letters.map((letter) => parent[indexOf(letter)]),
      sub: letters.map((letter) => size[indexOf(letter)]),
      highlight: activeLetters.map(indexOf),
      mark: letters.filter((letter) => parent[indexOf(letter)] === indexOf(letter)).map(indexOf),
      vars: [
        { name: "pass", value: phase === "equalities" ? "1: merge ==" : phase === "inequalities" || phase === "conflict" ? "2: check !=" : phase },
        { name: "parent", value: parentSummary() },
        { name: "components", value: components().map((component) => `{${component.members.join(",")}}`).join(" ") },
      ],
      final,
      equalityEquationsView: {
        letters: [...letters],
        equations: [...equations],
        states: [...states],
        parentRows: letters.map((letter) => {
          const index = indexOf(letter);
          return {
            letter,
            parent: letterOf(parent[index]),
            root: letterOf(rootOf(index)),
            size: parent[index] === index ? size[index] : null,
          };
        }),
        components: components(),
        phase,
        event,
        activeEquation,
        activeLetters: [...activeLetters],
        union: union ? { ...union } : null,
        comparison: comparison ? { ...comparison } : null,
        answer,
      },
    });
  }

  function findWithSteps(start, label, activeEquation, phase) {
    let current = start;
    snapshot({
      title: { vi: `find(${label}) — bắt đầu tại ${label}`, en: `find(${label}) — start at ${label}` },
      note: { vi: `find() đi theo parent pointer cho đến khi gặp root. Root là đại diện của cả nhóm.`, en: `find() follows parent pointers until it reaches a root. That root represents the whole group.` },
      codeLines: [6, 7], phase, activeEquation, activeLetters: [label], event: "find-start",
    });
    while (parent[current] !== current) {
      const next = parent[current];
      const grandparent = parent[next];
      parent[current] = grandparent;
      snapshot({
        title: { vi: `Path compression: ${letterOf(current)} → ${letterOf(grandparent)}`, en: `Path compression: ${letterOf(current)} → ${letterOf(grandparent)}` },
        note: { vi: `${label} chưa là root: ${letterOf(current)} trỏ đến ${letterOf(next)}. Ta cho nó trỏ thẳng gần root hơn để lần sau nhanh hơn.`, en: `${label} is not a root: ${letterOf(current)} points to ${letterOf(next)}. Point it closer to the root so later lookups are faster.` },
        codeLines: [8, 9], phase, activeEquation, activeLetters: [label, letterOf(next), letterOf(grandparent)], event: "compress",
      });
      current = parent[current];
    }
    const root = letterOf(current);
    snapshot({
      title: { vi: `find(${label}) = ${root}`, en: `find(${label}) = ${root}` },
      note: { vi: `${root} tự trỏ về chính nó, nên đây là root (đại diện) của nhóm chứa ${label}.`, en: `${root} points to itself, so it is the root (representative) of ${label}'s group.` },
      codeLines: [7, 10], phase, activeEquation, activeLetters: [label, root], event: "find-result",
    });
    return current;
  }

  snapshot({
    title: { vi: "Ý tưởng: xử lý == trước, rồi kiểm tra !=", en: "Idea: process == first, then check !=" },
    note: { vi: "a==b bắt buộc a và b ở CÙNG nhóm. a!=b bắt buộc chúng ở KHÁC nhóm. Nếu một bất đẳng thức có hai đầu cùng root thì mâu thuẫn, đáp án False.", en: "a==b requires a and b to be in the SAME group. a!=b requires DIFFERENT groups. If an inequality's two letters have the same root, the rules contradict and the answer is False." },
    codeLines: [1, 2], phase: "intro", event: "intro",
  });
  snapshot({
    title: { vi: "Khởi tạo DSU: mỗi chữ là một nhóm", en: "Initialize DSU: each letter is its own group" },
    note: { vi: `Chỉ hiển thị các chữ xuất hiện trong input: ${letters.join(", ")}. Ban đầu parent[x] = x, nên chưa có hai chữ nào bị buộc bằng nhau.`, en: `Only letters used by the input are shown: ${letters.join(", ")}. Initially parent[x] = x, so no two letters are forced equal yet.` },
    codeLines: [3, 4], phase: "init", event: "init",
  });
  snapshot({
    title: { vi: "Pass 1: chỉ gộp các phương trình ==", en: "Pass 1: merge equality equations only" },
    note: { vi: "Không được kiểm tra != quá sớm: một == xuất hiện sau nó vẫn có thể nối hai nhóm lại. Vì vậy ta hoàn tất mọi == trước.", en: "Do not check != too early: a later == could still join its two groups. Finish every == first." },
    codeLines: [20, 21], phase: "equalities", event: "pass-start",
  });

  equations.forEach((equation, equationIndex) => {
    const left = equation[0];
    const operator = equation.slice(1, 3);
    const right = equation[3];
    if (operator === "!=") {
      states[equationIndex] = "waiting";
      snapshot({
        title: { vi: `Pass 1 bỏ qua ${equation}`, en: `Pass 1 skips ${equation}` },
        note: { vi: "Đây là !=; ta chỉ ghi nhớ nó cho pass 2, sau khi tất cả dấu == đã tạo xong các nhóm.", en: "This is !=; save it for pass 2, after all == equations have formed the groups." },
        codeLines: [21], phase: "equalities", activeEquation: equationIndex, activeLetters: [left, right], event: "wait-inequality",
      });
      return;
    }

    states[equationIndex] = "checking";
    snapshot({
      title: { vi: `Đọc ${equation}: phải cùng nhóm`, en: `Read ${equation}: they must share a group` },
      note: { vi: `${left}==${right} nghĩa là hai chữ này phải có cùng root. Ta gọi union(${left}, ${right}).`, en: `${left}==${right} means both letters must end with the same root. Call union(${left}, ${right}).` },
      codeLines: [21, 22], phase: "equalities", activeEquation: equationIndex, activeLetters: [left, right], event: "read-equality",
    });
    let rootLeft = findWithSteps(indexOf(left), left, equationIndex, "equalities");
    let rootRight = findWithSteps(indexOf(right), right, equationIndex, "equalities");
    if (rootLeft === rootRight) {
      states[equationIndex] = "merged";
      snapshot({
        title: { vi: `${equation}: đã cùng root ${letterOf(rootLeft)}`, en: `${equation}: already has root ${letterOf(rootLeft)}` },
        note: { vi: "Không cần thay đổi DSU: điều kiện == đã đúng nhờ các phương trình trước.", en: "No DSU change is needed: earlier equations already make this == condition true." },
        codeLines: [13, 14, 15], phase: "equalities", activeEquation: equationIndex, activeLetters: [left, right], event: "already-merged",
        union: { left, right, rootLeft: letterOf(rootLeft), rootRight: letterOf(rootRight), merged: false },
      });
      return;
    }
    if (size[rootLeft] < size[rootRight]) [rootLeft, rootRight] = [rootRight, rootLeft];
    parent[rootRight] = rootLeft;
    size[rootLeft] += size[rootRight];
    states[equationIndex] = "merged";
    snapshot({
      title: { vi: `Union: gộp ${equation}`, en: `Union: merge ${equation}` },
      note: { vi: `Gắn root ${letterOf(rootRight)} vào root ${letterOf(rootLeft)}. Hai nhóm trở thành một: mọi chữ bên trong bây giờ được xem là bằng nhau.`, en: `Attach root ${letterOf(rootRight)} to root ${letterOf(rootLeft)}. The two groups become one: every letter inside is now considered equal.` },
      codeLines: [16, 17, 18, 19], phase: "equalities", activeEquation: equationIndex, activeLetters: [left, right, letterOf(rootLeft), letterOf(rootRight)], event: "union",
      union: { left, right, rootLeft: letterOf(rootLeft), rootRight: letterOf(rootRight), merged: true },
    });
  });

  snapshot({
    title: { vi: "Pass 1 hoàn tất: các nhóm == đã cố định", en: "Pass 1 complete: == groups are now fixed" },
    note: { vi: "Bây giờ mới an toàn để kiểm tra !=. Nếu hai chữ có cùng root thì chúng đã bị các dấu == buộc bằng nhau.", en: "Now it is safe to check !=. If two letters have the same root, == equations have forced them to be equal." },
    codeLines: [20, 21, 22], phase: "equalities", event: "pass-complete",
  });
  snapshot({
    title: { vi: "Pass 2: mỗi != phải có hai root khác nhau", en: "Pass 2: every != must have two different roots" },
    note: { vi: "Ta duyệt lại danh sách. Dấu == không cần làm gì nữa; chỉ các dấu != mới có thể tạo ra mâu thuẫn.", en: "Scan the list again. == needs no more work; only != can create a contradiction." },
    codeLines: [23, 24], phase: "inequalities", event: "pass-start",
  });

  for (let equationIndex = 0; equationIndex < equations.length; equationIndex++) {
    const equation = equations[equationIndex];
    const left = equation[0];
    const operator = equation.slice(1, 3);
    const right = equation[3];
    if (operator === "==") {
      snapshot({
        title: { vi: `Pass 2 bỏ qua ${equation}`, en: `Pass 2 skips ${equation}` },
        note: { vi: "Dấu == đã được xử lý ở pass 1; nhóm của nó đã phản ánh điều kiện này.", en: "This == was handled in pass 1; the current groups already reflect it." },
        codeLines: [24], phase: "inequalities", activeEquation: equationIndex, activeLetters: [left, right], event: "skip-equality",
      });
      continue;
    }

    states[equationIndex] = "checking";
    snapshot({
      title: { vi: `Kiểm tra ${equation}: phải khác nhóm`, en: `Check ${equation}: they must be in different groups` },
      note: { vi: `Ta so sánh find(${left}) với find(${right}). Cùng root nghĩa là ${left} và ${right} bắt buộc bằng nhau, trái với !=.`, en: `Compare find(${left}) with find(${right}). The same root means ${left} and ${right} are forced equal, which contradicts !=.` },
      codeLines: [24, 25], phase: "inequalities", activeEquation: equationIndex, activeLetters: [left, right], event: "read-inequality",
    });
    const rootLeft = findWithSteps(indexOf(left), left, equationIndex, "inequalities");
    const rootRight = findWithSteps(indexOf(right), right, equationIndex, "inequalities");
    const conflict = rootLeft === rootRight;
    if (conflict) {
      states[equationIndex] = "conflict";
      answer = false;
      snapshot({
        title: { vi: `MÂU THUẪN: ${equation}`, en: `CONTRADICTION: ${equation}` },
        note: { vi: `find(${left}) = find(${right}) = ${letterOf(rootLeft)}. Các dấu == đã buộc ${left} bằng ${right}, nhưng ${equation} lại yêu cầu chúng khác nhau → False.`, en: `find(${left}) = find(${right}) = ${letterOf(rootLeft)}. The == equations force ${left} to equal ${right}, but ${equation} requires them to differ → False.` },
        codeLines: [25, 26], phase: "conflict", activeEquation: equationIndex, activeLetters: [left, right], event: "conflict", final: true,
        comparison: { left, right, rootLeft: letterOf(rootLeft), rootRight: letterOf(rootRight), conflict: true },
      });
      return { input, answer, steps };
    }
    states[equationIndex] = "safe";
    snapshot({
      title: { vi: `${equation} hợp lệ: ${letterOf(rootLeft)} ≠ ${letterOf(rootRight)}`, en: `${equation} is valid: ${letterOf(rootLeft)} ≠ ${letterOf(rootRight)}` },
      note: { vi: `${left} và ${right} ở hai nhóm khác nhau, nên điều kiện != này có thể cùng tồn tại với mọi dấu ==.`, en: `${left} and ${right} are in different groups, so this != condition can coexist with every == equation.` },
      codeLines: [25], phase: "inequalities", activeEquation: equationIndex, activeLetters: [left, right], event: "safe",
      comparison: { left, right, rootLeft: letterOf(rootLeft), rootRight: letterOf(rootRight), conflict: false },
    });
  }

  answer = true;
  snapshot({
    title: { vi: "Không có mâu thuẫn → True", en: "No contradictions → True" },
    note: { vi: "Mỗi != đều có hai root khác nhau. Vì vậy có thể gán giá trị cho các chữ mà không vi phạm điều kiện nào.", en: "Every != has two different roots. Therefore values can be assigned to the letters without violating any condition." },
    codeLines: [27], phase: "done", event: "success", final: true,
  });
  return { input, answer, steps };
}

// ─── 947: Most Stones Removed with Same Row or Column ───
function parse947Stones(input) {
  const raw = String(input || "").trim();
  if (!raw) throw new Error("enter at least one stone as row,col;row,col");
  let stones;
  try {
    stones = raw.startsWith("[")
      ? JSON.parse(raw)
      : raw.split(/[;|]/).filter(Boolean).map((part) => part.split(",").map((value) => Number(value.trim())));
  } catch (error) {
    throw new Error("stones must be coordinates such as 0,0;0,1;1,0");
  }
  if (!Array.isArray(stones) || !stones.length || !stones.every((stone) => Array.isArray(stone) && stone.length === 2 && stone.every(Number.isInteger))) {
    throw new Error("each stone must contain exactly two integer coordinates");
  }
  if (stones.length > 18) throw new Error("visualization supports at most 18 stones");
  const unique = new Set();
  stones.forEach(([row, col]) => {
    if (row < 0 || col < 0) throw new Error("stone coordinates must be non-negative");
    const key = `${row},${col}`;
    if (unique.has(key)) throw new Error(`duplicate stone at (${key})`);
    unique.add(key);
  });
  return stones.map(([row, col]) => [row, col]);
}

function buildSteps947(input) {
  const stones = parse947Stones(input);
  const rowKey = (row) => `row:${row}`;
  const colKey = (col) => `col:${col}`;
  const label = (node) => node.startsWith("row:") ? `R${node.slice(4)}` : `C${node.slice(4)}`;
  const nodes = [...new Set(stones.flatMap(([row, col]) => [rowKey(row), colKey(col)]))]
    .sort((left, right) => label(left).localeCompare(label(right), undefined, { numeric: true }));
  const parent = Object.fromEntries(nodes.map((node) => [node, node]));
  const size = Object.fromEntries(nodes.map((node) => [node, 1]));
  const stoneStates = new Array(stones.length).fill("pending");
  const steps = [];
  let answer = null;

  const rootOf = (node) => {
    let root = node;
    while (parent[root] !== root) root = parent[root];
    return root;
  };
  const find = (node) => {
    const root = rootOf(node);
    let current = node;
    while (parent[current] !== current) {
      const next = parent[current];
      parent[current] = root;
      current = next;
    }
    return root;
  };
  const componentSnapshot = () => {
    const buckets = new Map();
    nodes.forEach((node) => {
      const root = rootOf(node);
      if (!buckets.has(root)) buckets.set(root, []);
      buckets.get(root).push(node);
    });
    return [...buckets.entries()].map(([root, members]) => ({
      root: label(root),
      members: members.map(label),
      stones: stones.map(([row, col], index) => rootOf(rowKey(row)) === root ? index : -1).filter((index) => index >= 0),
    }));
  };
  const parentRows = () => nodes.map((node) => {
    const root = rootOf(node);
    return { node: label(node), parent: label(parent[node]), root: label(root), size: node === root ? size[node] : null };
  });
  const snapshot = ({ title, note, codeLines, phase, event, activeStone = null, union = null, final = false, vars = [] }) => {
    const components = componentSnapshot();
    steps.push({
      title, note, codeLines, vars, final, arr: [], sub: [], highlight: [], mark: [],
      stones947View: {
        phase, event, stones: stones.map(([row, col]) => [row, col]), stoneStates: [...stoneStates], activeStone,
        union: union ? { ...union } : null, components, parentRows: parentRows(), groupCount: components.length,
        removable: stones.length - components.length, answer,
      },
    });
  };

  snapshot({
    title: { vi: "Ý tưởng: biến hàng và cột thành node DSU", en: "Idea: turn rows and columns into DSU nodes" },
    note: { vi: "Mỗi hòn đá (r,c) là một cạnh nối node hàng Rr với node cột Cc. Những hòn đá trong cùng component có thể bị bỏ đi, chừa lại đúng 1 hòn.", en: "Each stone (r,c) is an edge from row node Rr to column node Cc. Stones in one component can be removed until exactly one remains." },
    codeLines: [1, 2], phase: "intro", event: "intro",
  });
  snapshot({
    title: { vi: "Khởi tạo parent cho mọi hàng / cột xuất hiện", en: "Initialize parent for every used row / column" },
    note: { vi: `Có ${nodes.length} node hàng/cột và ${stones.length} hòn đá. Ban đầu mỗi node là một component riêng.`, en: `There are ${nodes.length} row/column nodes and ${stones.length} stones. Each node starts in its own component.` },
    codeLines: [3, 4, 5, 6, 7, 8], phase: "init", event: "init",
    vars: [{ name: "DSU nodes", value: nodes.map(label).join(", ") }],
  });

  stones.forEach(([row, col], index) => {
    const left = rowKey(row);
    const right = colKey(col);
    stoneStates[index] = "active";
    snapshot({
      title: { vi: `Đọc đá #${index + 1}: (${row}, ${col})`, en: `Read stone #${index + 1}: (${row}, ${col})` },
      note: { vi: `Đá này tạo cạnh ${label(left)} ↔ ${label(right)}. Ta union hai đầu cạnh để cho DSU biết chúng thuộc cùng component.`, en: `This stone creates edge ${label(left)} ↔ ${label(right)}. Union its endpoints so DSU knows they share a component.` },
      codeLines: [11, 12], phase: "connect", event: "read-stone", activeStone: index,
    });
    const rootLeft = find(left);
    const rootRight = find(right);
    const merged = rootLeft !== rootRight;
    if (merged) {
      if (size[rootLeft] < size[rootRight]) {
        parent[rootLeft] = rootRight;
        size[rootRight] += size[rootLeft];
      } else {
        parent[rootRight] = rootLeft;
        size[rootLeft] += size[rootRight];
      }
    }
    stoneStates[index] = merged ? "merged" : "same";
    const finalRootLeft = rootOf(left);
    const finalRootRight = rootOf(right);
    snapshot({
      title: merged
        ? { vi: `Union ${label(rootLeft)} và ${label(rootRight)}`, en: `Union ${label(rootLeft)} and ${label(rootRight)}` }
        : { vi: `${label(left)} và ${label(right)} đã nối gián tiếp`, en: `${label(left)} and ${label(right)} are already indirectly connected` },
      note: merged
        ? { vi: `Gộp hai component. Từ nay các đá nối vào ${label(finalRootLeft)} và ${label(finalRootRight)} thuộc cùng một nhóm.`, en: `Merge the two components. Stones touching ${label(finalRootLeft)} and ${label(finalRootRight)} now belong to one group.` }
        : { vi: "Cạnh này đóng một chu trình trong component hiện có; nó không tạo thêm component mới.", en: "This edge closes a cycle in the existing component; it does not create a new component." },
      codeLines: [6, 7, 9, 10], phase: "connect", event: merged ? "union" : "cycle", activeStone: index,
      union: { left: label(left), right: label(right), rootLeft: label(rootLeft), rootRight: label(rootRight), merged },
      vars: [{ name: "components", value: componentSnapshot().length }],
    });
  });

  const groupCount = componentSnapshot().length;
  answer = stones.length - groupCount;
  snapshot({
    title: { vi: `Kết quả: ${stones.length} − ${groupCount} = ${answer}`, en: `Result: ${stones.length} − ${groupCount} = ${answer}` },
    note: { vi: `Mỗi component giữ lại 1 hòn đá để component không biến mất. Vì có ${groupCount} component, bỏ được tổng cộng ${answer} hòn.`, en: `Leave one stone in each component so it does not disappear. With ${groupCount} component(s), ${answer} stone(s) can be removed.` },
    codeLines: [13], phase: "done", event: "answer", final: true,
    vars: [{ name: "answer", value: answer }],
  });
  return { input, answer, steps };
}

// ─── 1061: Lexicographically Smallest Equivalent String ───
function parse1061Data(input) {
  const raw = String(input || "").trim();
  const parts = raw.split(/[;|\n]/).map((part) => part.trim()).filter(Boolean);
  const values = parts.length === 3 ? parts : raw.split(",").map((part) => part.trim());
  if (values.length !== 3) throw new Error("enter s1;s2;baseStr, for example parker;morris;parser");
  const [s1, s2, baseStr] = values;
  if (!/^[a-z]+$/.test(s1) || !/^[a-z]+$/.test(s2) || !/^[a-z]+$/.test(baseStr)) {
    throw new Error("s1, s2, and baseStr must contain lowercase English letters only");
  }
  if (s1.length !== s2.length) throw new Error("s1 and s2 must have the same length");
  if (s1.length > 20 || baseStr.length > 24) throw new Error("visualization supports s1/s2 up to 20 and baseStr up to 24 letters");
  return { s1, s2, baseStr };
}

function buildSteps1061(input) {
  const { s1, s2, baseStr } = parse1061Data(input);
  const letterIndex = (letter) => letter.charCodeAt(0) - 97;
  const letter = (index) => String.fromCharCode(97 + index);
  const letters = [...new Set(`${s1}${s2}${baseStr}`)].sort();
  const parent = Array.from({ length: 26 }, (_, index) => index);
  const pairStates = new Array(s1.length).fill("pending");
  const output = baseStr.split("").map((source) => ({ source, value: null }));
  const steps = [];
  let answer = null;

  const rootOf = (node) => {
    let root = node;
    while (parent[root] !== root) root = parent[root];
    return root;
  };
  const find = (node) => {
    const root = rootOf(node);
    let current = node;
    while (parent[current] !== current) {
      const next = parent[current];
      parent[current] = root;
      current = next;
    }
    return root;
  };
  const components = () => {
    const buckets = new Map();
    letters.forEach((value) => {
      const root = rootOf(letterIndex(value));
      if (!buckets.has(root)) buckets.set(root, []);
      buckets.get(root).push(value);
    });
    return [...buckets.entries()].map(([root, members]) => ({ root: letter(root), members }));
  };
  const parentRows = () => letters.map((value) => {
    const node = letterIndex(value);
    return { letter: value, parent: letter(parent[node]), root: letter(rootOf(node)) };
  });
  const snapshot = ({ title, note, codeLines, phase, event, activePair = null, activeBaseIndex = null, union = null, final = false, vars = [] }) => {
    steps.push({
      title, note, codeLines, vars, final, arr: [], sub: [], highlight: [], mark: [],
      equivalent1061View: {
        phase, event, s1, s2, baseStr, pairStates: [...pairStates], activePair, activeBaseIndex,
        output: output.map((item) => ({ ...item })), components: components(), parentRows: parentRows(),
        union: union ? { ...union } : null, answer,
      },
    });
  };

  snapshot({
    title: { vi: "Ý tưởng: root nhỏ nhất là đại diện của nhóm", en: "Idea: the smallest root represents each group" },
    note: { vi: "Một cặp tương đương cho phép thay thế qua lại. Khi union, luôn gắn root lớn hơn vào root nhỏ hơn; vì vậy find(ch) trả về chữ nhỏ nhất có thể thay thế cho ch.", en: "An equivalent pair allows substitution both ways. On union, attach the larger root to the smaller root; then find(ch) returns the smallest replacement for ch." },
    codeLines: [1, 2], phase: "intro", event: "intro",
  });
  snapshot({
    title: { vi: "Khởi tạo 26 chữ cái", en: "Initialize all 26 letters" },
    note: { vi: `Các chữ xuất hiện trong ví dụ: ${letters.join(", ")}. Ban đầu parent[x] = x, nên mỗi chữ là một nhóm riêng.`, en: `Letters used in this example: ${letters.join(", ")}. Initially parent[x] = x, so each letter has its own group.` },
    codeLines: [3, 4, 5, 6, 7], phase: "init", event: "init",
  });

  for (let index = 0; index < s1.length; index++) {
    const left = s1[index];
    const right = s2[index];
    pairStates[index] = "active";
    snapshot({
      title: { vi: `Đọc cặp #${index + 1}: ${left} ~ ${right}`, en: `Read pair #${index + 1}: ${left} ~ ${right}` },
      note: { vi: `Hai chữ này thuộc cùng nhóm tương đương. Ta tìm root của ${left} và ${right}, rồi giữ root nhỏ hơn.`, en: `These letters belong to one equivalence group. Find the roots of ${left} and ${right}, then keep the smaller root.` },
      codeLines: [8, 9], phase: "merge", event: "read-pair", activePair: index,
    });
    const rootLeft = find(letterIndex(left));
    const rootRight = find(letterIndex(right));
    const merged = rootLeft !== rootRight;
    if (merged) parent[Math.max(rootLeft, rootRight)] = Math.min(rootLeft, rootRight);
    pairStates[index] = merged ? "merged" : "same";
    snapshot({
      title: merged
        ? { vi: `Giữ ${letter(Math.min(rootLeft, rootRight))} làm root nhỏ nhất`, en: `Keep ${letter(Math.min(rootLeft, rootRight))} as the smallest root` }
        : { vi: `${left} và ${right} đã có cùng root`, en: `${left} and ${right} already share a root` },
      note: merged
        ? { vi: `parent[${letter(Math.max(rootLeft, rootRight))}] = ${letter(Math.min(rootLeft, rootRight))}. Từ đây mọi chữ trong nhóm sẽ ánh xạ về ${letter(Math.min(rootLeft, rootRight))}.`, en: `parent[${letter(Math.max(rootLeft, rootRight))}] = ${letter(Math.min(rootLeft, rootRight))}. Every letter in this group now maps to ${letter(Math.min(rootLeft, rootRight))}.` }
        : { vi: "Không cần đổi parent; cặp này chỉ xác nhận quan hệ đã có.", en: "No parent change is needed; this pair only confirms an existing relationship." },
      codeLines: [9, 10], phase: "merge", event: merged ? "union" : "already-equivalent", activePair: index,
      union: { left, right, rootLeft: letter(rootLeft), rootRight: letter(rootRight), merged },
    });
  }

  snapshot({
    title: { vi: `Đổi từng chữ của baseStr = “${baseStr}”`, en: `Translate each character of baseStr = “${baseStr}”` },
    note: { vi: "Các nhóm đã hoàn tất. Bây giờ find(ch) chính là lựa chọn nhỏ nhất theo thứ tự từ điển cho mỗi vị trí trong baseStr.", en: "The groups are complete. Now find(ch) is the lexicographically smallest choice for each baseStr position." },
    codeLines: [11], phase: "translate", event: "start-translate",
  });
  for (let index = 0; index < baseStr.length; index++) {
    const source = baseStr[index];
    const result = letter(find(letterIndex(source)));
    output[index].value = result;
    snapshot({
      title: { vi: `baseStr[${index}] = ${source} → ${result}`, en: `baseStr[${index}] = ${source} → ${result}` },
      note: { vi: `find(${source}) trả về root nhỏ nhất ${result}; đây là ký tự tối ưu ở vị trí ${index}.`, en: `find(${source}) returns smallest root ${result}; this is the optimal character at position ${index}.` },
      codeLines: [11], phase: "translate", event: "map-character", activeBaseIndex: index,
      vars: [{ name: "output so far", value: output.map((item) => item.value || "_").join("") }],
    });
  }
  answer = output.map((item) => item.value).join("");
  snapshot({
    title: { vi: `Kết quả nhỏ nhất: “${answer}”`, en: `Smallest result: “${answer}”` },
    note: { vi: "Mỗi vị trí đã được thay bằng root nhỏ nhất của component tương đương, nên toàn bộ chuỗi là nhỏ nhất theo thứ tự từ điển.", en: "Every position has been replaced by its equivalence component's smallest root, so the whole string is lexicographically smallest." },
    codeLines: [11], phase: "done", event: "answer", final: true,
    vars: [{ name: "answer", value: answer }],
  });
  return { input, answer, steps };
}

// ─── 305: Number of Islands II ───
function parse305Data(input) {
  const raw = String(input || "").trim();
  if (!raw) throw new Error("enter m,n followed by positions, for example 3,3;0,0;0,1");
  let rows, cols, positions;
  if (raw.startsWith("{")) {
    let data;
    try { data = JSON.parse(raw); } catch (error) { throw new Error("JSON input must contain m, n, and positions"); }
    rows = Number(data.m); cols = Number(data.n); positions = data.positions;
  } else {
    const parts = raw.split(/[;|]/).map((part) => part.trim()).filter(Boolean);
    const dimensions = (parts.shift() || "").split(",").map((value) => Number(value.trim()));
    [rows, cols] = dimensions;
    positions = parts.map((part) => part.split(",").map((value) => Number(value.trim())));
  }
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1 || rows > 8 || cols > 8) {
    throw new Error("m and n must be integers from 1 to 8 for this visualization");
  }
  if (!Array.isArray(positions) || !positions.every((position) => Array.isArray(position) && position.length === 2 && position.every(Number.isInteger))) {
    throw new Error("each position must be row,col");
  }
  if (positions.length > 24) throw new Error("visualization supports at most 24 positions");
  positions.forEach(([row, col]) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) throw new Error(`position (${row},${col}) is outside the grid`);
  });
  return { rows, cols, positions: positions.map(([row, col]) => [row, col]) };
}

function buildSteps305(input) {
  const { rows, cols, positions } = parse305Data(input);
  const total = rows * cols;
  const parent = new Array(total).fill(-1);
  const size = new Array(total).fill(0);
  const statuses = new Array(positions.length).fill("pending");
  const counts = new Array(positions.length).fill(null);
  const steps = [];
  let islands = 0;
  const id = (row, col) => row * cols + col;
  const coord = (node) => [Math.floor(node / cols), node % cols];
  const coordText = (node) => `(${coord(node).join(",")})`;

  const rootOf = (node) => {
    let root = node;
    while (parent[root] !== root) root = parent[root];
    return root;
  };
  const find = (node) => {
    const root = rootOf(node);
    let current = node;
    while (parent[current] !== current) {
      const next = parent[current];
      parent[current] = root;
      current = next;
    }
    return root;
  };
  const componentSnapshot = () => {
    const buckets = new Map();
    for (let node = 0; node < total; node++) {
      if (parent[node] === -1) continue;
      const root = rootOf(node);
      if (!buckets.has(root)) buckets.set(root, []);
      buckets.get(root).push(coord(node));
    }
    return [...buckets.entries()].map(([root, members]) => ({ root, members, size: size[root] }));
  };
  const parentRows = () => parent.map((value, node) => {
    if (value === -1) return null;
    const root = rootOf(node);
    return { node: coord(node), parent: coord(value), root: coord(root), size: node === root ? size[node] : null };
  }).filter(Boolean);
  const snapshot = ({ title, note, codeLines, phase, event, activeIndex = null, activeCell = null, activeNeighbor = null, union = null, final = false, vars = [] }) => {
    steps.push({
      title, note, codeLines, vars, final, arr: [...parent], sub: [...size], highlight: [], mark: [],
      islands305View: {
        phase, event, rows, cols, positions: positions.map((position) => [...position]), statuses: [...statuses], counts: [...counts],
        activeIndex, activeCell: activeCell ? [...activeCell] : null, activeNeighbor: activeNeighbor ? [...activeNeighbor] : null,
        union: union ? { ...union } : null, parent: [...parent], size: [...size], components: componentSnapshot(), parentRows: parentRows(), islands,
      },
    });
  };

  snapshot({
    title: { vi: "Ý tưởng: thêm đất trực tuyến", en: "Idea: add land online" },
    note: { vi: "Mỗi lần thêm đất bắt đầu bằng một đảo mới. Chỉ union với bốn hàng xóm đã là đất; mỗi union thành công giảm số đảo đi 1.", en: "Every new land cell starts as one island. Union only with its four land neighbors; every successful union reduces the island count by 1." },
    codeLines: [1, 2], phase: "intro", event: "intro",
  });
  snapshot({
    title: { vi: `Khởi tạo grid ${rows} × ${cols} và DSU rỗng`, en: `Initialize ${rows} × ${cols} grid and empty DSU` },
    note: { vi: "parent = −1 nghĩa là nước. Khi một ô trở thành đất, parent[id] = id và size = 1.", en: "parent = −1 means water. When a cell becomes land, parent[id] = id and size = 1." },
    codeLines: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], phase: "init", event: "init",
  });

  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  positions.forEach(([row, col], index) => {
    statuses[index] = "active";
    snapshot({
      title: { vi: `Thêm vị trí #${index + 1}: (${row},${col})`, en: `Add position #${index + 1}: (${row},${col})` },
      note: { vi: "Kiểm tra ô này có phải nước hay không. Nếu là nước, nó sẽ tạo một đảo mới trước khi nhìn các hàng xóm.", en: "Check whether this cell is water. If so, it creates a new island before looking at its neighbors." },
      codeLines: [18, 19], phase: "add", event: "read-position", activeIndex: index, activeCell: [row, col],
    });
    const node = id(row, col);
    if (parent[node] !== -1) {
      statuses[index] = "duplicate";
      counts[index] = islands;
      snapshot({
        title: { vi: `(${row},${col}) đã là đất → không đổi`, en: `(${row},${col}) is already land → no change` },
        note: { vi: "Vị trí lặp lại không tạo đảo mới. Ghi lại số đảo hiện tại vào đáp án.", en: "A duplicate position creates no new island. Record the current island count." },
        codeLines: [20, 21], phase: "add", event: "duplicate", activeIndex: index, activeCell: [row, col],
      });
      return;
    }
    parent[node] = node;
    size[node] = 1;
    islands++;
    statuses[index] = "land";
    snapshot({
      title: { vi: `Đặt (${row},${col}) thành đất: islands = ${islands}`, en: `Make (${row},${col}) land: islands = ${islands}` },
      note: { vi: "Tạm thời ô mới là một component riêng, nên biến đếm islands tăng 1.", en: "For now the new cell is its own component, so the islands counter increases by 1." },
      codeLines: [22, 23], phase: "add", event: "new-land", activeIndex: index, activeCell: [row, col],
      vars: [{ name: "islands", value: islands }],
    });

    directions.forEach(([dr, dc]) => {
      const nextRow = row + dr;
      const nextCol = col + dc;
      const inside = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
      const activeNeighbor = inside && parent[id(nextRow, nextCol)] !== -1;
      snapshot({
        title: { vi: `Xét hàng xóm (${nextRow},${nextCol})`, en: `Check neighbor (${nextRow},${nextCol})` },
        note: !inside
          ? { vi: "Ngoài grid → bỏ qua.", en: "Outside the grid → skip." }
          : activeNeighbor
            ? { vi: "Đây là đất; có thể cần union hai component.", en: "This is land; the two components may need a union." }
            : { vi: "Đây là nước; không có cạnh DSU để nối.", en: "This is water; there is no DSU edge to connect." },
        codeLines: [24, 25], phase: "merge", event: !inside ? "outside" : activeNeighbor ? "land-neighbor" : "water-neighbor", activeIndex: index, activeCell: [row, col], activeNeighbor: inside ? [nextRow, nextCol] : null,
      });
      if (!activeNeighbor) return;
      let rootA = find(node);
      let rootB = find(id(nextRow, nextCol));
      const merged = rootA !== rootB;
      if (merged) {
        if (size[rootA] < size[rootB]) [rootA, rootB] = [rootB, rootA];
        parent[rootB] = rootA;
        size[rootA] += size[rootB];
        islands--;
      }
      snapshot({
        title: merged
          ? { vi: `Union hai đảo → islands = ${islands}`, en: `Union the two islands → islands = ${islands}` }
          : { vi: "Hai ô đã thuộc cùng một đảo", en: "Both cells already belong to one island" },
        note: merged
          ? { vi: "Hai component nối liền qua cạnh kề nhau, nên chúng trở thành một đảo và counter giảm 1.", en: "The components touch through adjacent cells, so they become one island and the counter decreases by 1." }
          : { vi: "Union không đổi counter vì hai ô đã có chung root.", en: "The union does not change the counter because the cells already share a root." },
        codeLines: [26, 27, 28], phase: "merge", event: merged ? "union" : "same-component", activeIndex: index, activeCell: [row, col], activeNeighbor: [nextRow, nextCol],
        union: { from: [row, col], to: [nextRow, nextCol], merged }, vars: [{ name: "islands", value: islands }],
      });
    });
    statuses[index] = "done";
    counts[index] = islands;
    snapshot({
      title: { vi: `Ghi đáp án sau vị trí #${index + 1}: ${islands}`, en: `Record answer after position #${index + 1}: ${islands}` },
      note: { vi: "Danh sách kết quả giữ số đảo sau MỖI lần thêm đất.", en: "The result list stores the island count after EVERY land addition." },
      codeLines: [29], phase: "count", event: "record", activeIndex: index, activeCell: [row, col],
    });
  });

  snapshot({
    title: { vi: "Hoàn tất: trả về dãy số đảo", en: "Complete: return island counts" },
    note: { vi: "Đây là đáp án online: mỗi phần tử ứng với trạng thái ngay sau lần thêm đất cùng chỉ số.", en: "This is the online answer: each entry matches the state immediately after the addition at that index." },
    codeLines: [30], phase: "done", event: "answer", final: true,
    vars: [{ name: "answer", value: `[${counts.join(", ")}]` }],
  });
  return { input, answer: counts, steps };
}

// ─── 803: Bricks Falling When Hit ───
function parse803Grid(input) {
  const raw = String(input).trim();
  let grid;
  try {
    grid = raw.startsWith("[")
      ? JSON.parse(raw)
      : raw.split(/[;|]/).map((row) => {
        const values = row.split(",").map((value) => value.trim());
        if (values.some((value) => value === "")) throw new Error("empty grid value");
        return values.map(Number);
      });
  } catch (error) {
    throw new Error("grid must be a JSON matrix such as [[1,0],[1,1]]");
  }
  if (!Array.isArray(grid) || grid.length === 0 || !Array.isArray(grid[0]) || grid[0].length === 0) {
    throw new Error("grid must be a non-empty matrix");
  }
  const cols = grid[0].length;
  if (!grid.every((row) => Array.isArray(row) && row.length === cols && row.every((value) => value === 0 || value === 1))) {
    throw new Error("grid must be rectangular and contain only 0 or 1");
  }
  if (grid.length > 12 || cols > 12) throw new Error("visualization supports grids up to 12 x 12");
  return grid.map((row) => [...row]);
}

function parse803Hits(value) {
  const raw = String(value).trim();
  let hits;
  try {
    hits = raw.startsWith("[")
      ? JSON.parse(raw)
      : raw.split(/[;|]/).filter(Boolean).map((pair) => {
        const coordinates = pair.split(",").map((item) => item.trim());
        if (coordinates.some((item) => item === "")) throw new Error("empty hit coordinate");
        return coordinates.map(Number);
      });
  } catch (error) {
    throw new Error("hits must be JSON coordinates such as [[1,0],[2,1]]");
  }
  if (!Array.isArray(hits) || !hits.every((hit) => Array.isArray(hit) && hit.length === 2 && hit.every(Number.isInteger))) {
    throw new Error("every hit must contain exactly two integer coordinates");
  }
  if (hits.length > 50) throw new Error("visualization supports at most 50 hits");
  return hits.map((hit) => [...hit]);
}

function parse803Data(input, hitsValue) {
  const grid = parse803Grid(input);
  const hits = parse803Hits(hitsValue);
  const rows = grid.length;
  const cols = grid[0].length;
  hits.forEach(([row, col]) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      throw new Error(`hit (${row},${col}) is outside the grid`);
    }
  });
  return { grid, hits };
}

function buildSteps803(input, params = {}) {
  const { grid: originalGrid, hits } = parse803Data(input, params.hits || "");
  const rows = originalGrid.length;
  const cols = originalGrid[0].length;

  const work = originalGrid.map((row) => [...row]);
  const effective = new Array(hits.length).fill(false);
  const answers = new Array(hits.length).fill(null);
  const hitStatus = new Array(hits.length).fill("pending");
  const roof = rows * cols;
  const parent = Array.from({ length: roof + 1 }, (_, index) => index);
  const size = new Array(roof + 1).fill(1);
  const steps = [];
  const id = (row, col) => row * cols + col;
  const coord = (cellId) => cellId === roof ? "roof" : [Math.floor(cellId / cols), cellId % cols];

  function find(node) {
    while (parent[node] !== node) {
      parent[node] = parent[parent[node]];
      node = parent[node];
    }
    return node;
  }

  function union(a, b) {
    let rootA = find(a);
    let rootB = find(b);
    if (rootA === rootB) return { merged: false, rootA, rootB, root: rootA };
    if (size[rootA] < size[rootB]) [rootA, rootB] = [rootB, rootA];
    parent[rootB] = rootA;
    size[rootA] += size[rootB];
    return { merged: true, rootA, rootB, root: rootA };
  }

  function stableKeys() {
    const stable = new Set();
    const roofRoot = find(roof);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (work[row][col] === 1 && find(id(row, col)) === roofRoot) stable.add(`${row},${col}`);
      }
    }
    return stable;
  }

  function componentSnapshot() {
    const groups = new Map();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (work[row][col] !== 1) continue;
        const root = find(id(row, col));
        if (!groups.has(root)) groups.set(root, []);
        groups.get(root).push([row, col]);
      }
    }
    return [...groups.entries()].map(([root, cells]) => ({ root, cells, roofConnected: find(root) === find(roof) }));
  }

  function pushStep({ title, note, codeLines, phase, event, activeHit = null, activeCell = null,
    activeNeighbor = null, unionEdge = null, roofBefore = null, roofAfter = null,
    fallen = null, newlyStable = [], vars = [], final = false }) {
    const stable = stableKeys();
    const step = {
      title,
      note,
      codeLines,
      arr: [...parent],
      sub: [...size],
      highlight: [activeCell, activeNeighbor].filter(Boolean).map(([row, col]) => id(row, col)),
      mark: [find(roof)],
      vars,
      final,
      bricks803View: {
        phase,
        event,
        rows,
        cols,
        originalGrid: originalGrid.map((row) => [...row]),
        workingGrid: work.map((row) => [...row]),
        hits: hits.map((hit) => [...hit]),
        effective: [...effective],
        hitStatus: [...hitStatus],
        answers: [...answers],
        activeHit,
        activeCell: activeCell ? [...activeCell] : null,
        activeNeighbor: activeNeighbor ? [...activeNeighbor] : null,
        unionEdge: unionEdge ? { ...unionEdge } : null,
        stableCells: [...stable].map((key) => key.split(",").map(Number)),
        newlyStable: newlyStable.map((cell) => [...cell]),
        components: componentSnapshot(),
        parent: [...parent],
        size: [...size],
        roofNode: roof,
        roofSize: size[find(roof)],
        roofBefore,
        roofAfter,
        fallen,
      },
    };
    steps.push(step);
  }

  pushStep({
    title: { vi: `Sao chép grid ${rows} × ${cols}`, en: `Copy the ${rows} × ${cols} grid` },
    note: { vi: "Ta không mô phỏng brick rơi theo chiều xuôi. Trước tiên xóa mọi hit, sau đó khôi phục theo thứ tự ngược.", en: "Instead of simulating falling bricks forward, remove every hit first and restore them in reverse." },
    codeLines: [3, 4, 5], phase: "prepare", event: "copy",
    vars: [{ name: "rows, cols", value: `${rows}, ${cols}` }, { name: "hits", value: JSON.stringify(hits) }],
  });

  hits.forEach(([row, col], index) => {
    const removed = work[row][col] === 1;
    effective[index] = removed;
    hitStatus[index] = removed ? "removed" : "skipped";
    if (removed) work[row][col] = 0;
    pushStep({
      title: removed
        ? { vi: `Hit #${index}: xóa brick (${row},${col})`, en: `Hit #${index}: remove brick (${row},${col})` }
        : { vi: `Hit #${index}: (${row},${col}) đã rỗng`, en: `Hit #${index}: (${row},${col}) is already empty` },
      note: removed
        ? { vi: "Ghi nhớ hit này có hiệu lực để sau đó khôi phục trong reverse pass.", en: "Remember that this hit was effective so it can be restored during the reverse pass." }
        : { vi: "Hit vào ô rỗng không làm brick nào rơi; đáp án của hit này sẽ là 0.", en: "Hitting an empty cell drops no bricks; this hit's answer will be 0." },
      codeLines: [6, 7, 8, 9, 10], phase: "prepare", event: removed ? "remove" : "skip-remove",
      activeHit: index, activeCell: [row, col], vars: [{ name: "removed", value: removed }, { name: `effective[${index}]`, value: removed }],
    });
  });

  pushStep({
    title: { vi: "Tạo DSU và virtual roof", en: "Create the DSU and virtual roof" },
    note: { vi: `Node ${roof} là mái ảo. Component chứa roof đại diện cho mọi brick còn ổn định.`, en: `Node ${roof} is the virtual roof. Its component represents every currently stable brick.` },
    codeLines: [12, 13, 14], phase: "build", event: "init-dsu",
    vars: [{ name: "roof", value: roof }, { name: "DSU nodes", value: roof + 1 }],
  });

  function connectForBuild(a, b, cell, neighbor, codeLine, label) {
    const result = union(a, b);
    pushStep({
      title: { vi: `${label}: ${result.merged ? "gộp hai component" : "đã cùng component"}`, en: `${label}: ${result.merged ? "merge two components" : "already connected"}` },
      note: result.merged
        ? { vi: `Union by size: root ${result.rootB} nối vào root ${result.rootA}.`, en: `Union by size: root ${result.rootB} attaches to root ${result.rootA}.` }
        : { vi: "Hai node đã có cùng root nên DSU không thay đổi.", en: "Both nodes already share a root, so the DSU does not change." },
      codeLines: [codeLine, 22, 23, 24, 25, 26, 27, 28], phase: "build", event: "build-union",
      activeCell: cell, activeNeighbor: Array.isArray(neighbor) ? neighbor : null,
      unionEdge: { from: coord(a), to: coord(b), merged: result.merged },
      vars: [{ name: "merged", value: result.merged }, { name: "roof size", value: size[find(roof)] }],
    });
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (work[row][col] !== 1) continue;
      const cell = id(row, col);
      if (row === 0) connectForBuild(cell, roof, [row, col], "roof", 37, `(${row},${col}) ↔ roof`);
      if (row > 0 && work[row - 1][col] === 1) connectForBuild(cell, id(row - 1, col), [row, col], [row - 1, col], 38, `(${row},${col}) ↔ (${row - 1},${col})`);
      if (col > 0 && work[row][col - 1] === 1) connectForBuild(cell, id(row, col - 1), [row, col], [row, col - 1], 39, `(${row},${col}) ↔ (${row},${col - 1})`);
    }
  }

  for (let index = hits.length - 1; index >= 0; index--) {
    const [row, col] = hits[index];
    hitStatus[index] = "processing";
    if (!effective[index]) {
      answers[index] = 0;
      hitStatus[index] = "done";
      pushStep({
        title: { vi: `Reverse hit #${index}: bỏ qua ô rỗng`, en: `Reverse hit #${index}: skip the empty cell` },
        note: { vi: "Hit này không xóa brick ở lượt xuôi nên không có gì để khôi phục.", en: "This hit removed no brick in the forward pass, so there is nothing to restore." },
        codeLines: [42, 43, 44], phase: "reverse", event: "skip-restore", activeHit: index, activeCell: [row, col],
        vars: [{ name: `answer[${index}]`, value: 0 }],
      });
      continue;
    }

    const beforeStable = stableKeys();
    const before = size[find(roof)];
    pushStep({
      title: { vi: `Reverse hit #${index}: roof size trước = ${before}`, en: `Reverse hit #${index}: roof size before = ${before}` },
      note: { vi: "Kích thước này gồm virtual roof, vì vậy số brick ổn định hiện tại là roof size − 1.", en: "This size includes the virtual roof, so the current stable-brick count is roof size − 1." },
      codeLines: [42, 45, 46], phase: "reverse", event: "before", activeHit: index, activeCell: [row, col], roofBefore: before,
      vars: [{ name: "before", value: before }, { name: "stable bricks", value: before - 1 }],
    });

    work[row][col] = 1;
    hitStatus[index] = "restored";
    pushStep({
      title: { vi: `Khôi phục brick (${row},${col})`, en: `Restore brick (${row},${col})` },
      note: { vi: "Brick mới chưa chắc ổn định; phải union nó với roof hoặc các brick kề đang tồn tại.", en: "The restored brick is not necessarily stable yet; union it with the roof or existing neighbors." },
      codeLines: [47, 48], phase: "reverse", event: "restore", activeHit: index, activeCell: [row, col], roofBefore: before,
      vars: [{ name: `work[${row}][${col}]`, value: 1 }],
    });

    const cell = id(row, col);
    const neighbors = [];
    if (row === 0) neighbors.push({ node: roof, cell: "roof", line: 49 });
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols && work[nextRow][nextCol] === 1) {
        neighbors.push({ node: id(nextRow, nextCol), cell: [nextRow, nextCol], line: 53 });
      }
    }

    for (const neighbor of neighbors) {
      const stableBeforeUnion = stableKeys();
      const result = union(cell, neighbor.node);
      const stableAfterUnion = stableKeys();
      const gained = [...stableAfterUnion].filter((key) => !stableBeforeUnion.has(key)).map((key) => key.split(",").map(Number));
      pushStep({
        title: { vi: `Union (${row},${col}) với ${neighbor.cell === "roof" ? "roof" : `(${neighbor.cell[0]},${neighbor.cell[1]})`}`, en: `Union (${row},${col}) with ${neighbor.cell === "roof" ? "roof" : `(${neighbor.cell[0]},${neighbor.cell[1]})`}` },
        note: result.merged
          ? { vi: gained.length ? `${gained.length} brick vừa nối được với roof.` : "Hai component vừa được gộp; chưa nối tới roof.", en: gained.length ? `${gained.length} brick(s) just became roof-connected.` : "Two components merged but are not roof-connected yet." }
          : { vi: "Hai node đã cùng component.", en: "The nodes already share a component." },
        codeLines: [neighbor.line, 22, 23, 24, 25, 26, 27, 28], phase: "reverse", event: "restore-union",
        activeHit: index, activeCell: [row, col], activeNeighbor: Array.isArray(neighbor.cell) ? neighbor.cell : null,
        unionEdge: { from: [row, col], to: neighbor.cell, merged: result.merged }, roofBefore: before, newlyStable: gained,
        vars: [{ name: "merged", value: result.merged }, { name: "roof size", value: size[find(roof)] }],
      });
    }

    const after = size[find(roof)];
    const fallen = Math.max(0, after - before - 1);
    answers[index] = fallen;
    hitStatus[index] = "done";
    const afterStable = stableKeys();
    const newlyStable = [...afterStable].filter((key) => !beforeStable.has(key)).map((key) => key.split(",").map(Number));
    pushStep({
      title: { vi: `Hit #${index}: ${fallen} brick rơi`, en: `Hit #${index}: ${fallen} brick(s) fall` },
      note: { vi: `after − before − 1 = ${after} − ${before} − 1 = ${fallen}. Trừ 1 vì brick vừa khôi phục không được tính là brick đã rơi.`, en: `after − before − 1 = ${after} − ${before} − 1 = ${fallen}. Subtract 1 because the restored brick itself is not counted as fallen.` },
      codeLines: [54, 55], phase: "reverse", event: "count", activeHit: index, activeCell: [row, col],
      roofBefore: before, roofAfter: after, fallen, newlyStable,
      vars: [{ name: "before", value: before }, { name: "after", value: after }, { name: `answer[${index}]`, value: fallen }],
    });
  }

  pushStep({
    title: { vi: `Kết quả: [${answers.join(", ")}]`, en: `Result: [${answers.join(", ")}]` },
    note: { vi: "Đảo thời gian biến bài toán brick rơi thành bài toán chỉ thêm cạnh vào DSU.", en: "Reversing time turns falling-brick deletions into DSU edge additions." },
    codeLines: [57], phase: "done", event: "done", roofAfter: size[find(roof)], final: true,
    vars: [{ name: "answer", value: `[${answers.join(", ")}]` }],
  });

  return { input, answer: answers, steps };
}

// ─── 1168: Optimize Water Distribution in a Village ───
function parse1168Data(input, pipesValue) {
  if (!Array.isArray(input) || input.length === 0 || !input.every((cost) => Number.isInteger(cost) && cost > 0)) {
    throw new Error("wells must be a non-empty array of positive integers");
  }
  if (input.length > 12) throw new Error("visualization supports at most 12 houses");
  const raw = String(pipesValue ?? "").trim();
  if (!raw) throw new Error("pipes must be JSON or triples u,v,cost separated by semicolons");
  let pipes;
  try {
    pipes = raw.startsWith("[")
      ? JSON.parse(raw)
      : raw.split(/[;|]/).filter((part) => part.trim()).map((part) => {
        const values = part.split(",").map((value) => value.trim());
        if (values.some((value) => value === "")) throw new Error("empty pipe value");
        return values.map(Number);
      });
  } catch (error) {
    throw new Error("pipes must be JSON such as [[1,2,1]] or u,v,cost triples separated by semicolons");
  }
  if (!Array.isArray(pipes) || !pipes.every((pipe) => Array.isArray(pipe) && pipe.length === 3 && pipe.every(Number.isInteger))) {
    throw new Error("every pipe must contain exactly three integers: house1, house2, cost");
  }
  if (pipes.length > 50) throw new Error("visualization supports at most 50 pipes");
  const n = input.length;
  pipes.forEach(([u, v, cost]) => {
    if (u < 1 || u > n || v < 1 || v > n) throw new Error(`pipe (${u},${v}) has a house outside 1..${n}`);
    if (u === v) throw new Error(`pipe (${u},${v}) must connect two different houses`);
    if (cost <= 0) throw new Error(`pipe (${u},${v}) must have a positive cost`);
  });
  return { n, wells: [...input], pipes: pipes.map((pipe) => [...pipe]) };
}

function buildSteps1168(input, params = {}) {
  const { n, wells, pipes } = parse1168Data(input, params.pipes);
  const edges = [];
  const acceptedEdges = [];
  const rejectedEdgeKeys = new Set();
  const parent = Array.from({ length: n + 1 }, (_, node) => node);
  const size = new Array(n + 1).fill(1);
  const steps = [];
  let totalCost = 0;

  const copyEdge = (edge) => edge ? {
    key: edge.key,
    u: edge.u,
    v: edge.v,
    cost: edge.cost,
    kind: edge.kind,
    sourceIndex: edge.sourceIndex,
    sortedIndex: edge.sortedIndex ?? -1,
  } : null;

  function rootWithoutCompression(node) {
    let root = node;
    while (parent[root] !== root) root = parent[root];
    return root;
  }

  function find(node) {
    while (parent[node] !== node) {
      parent[node] = parent[parent[node]];
      node = parent[node];
    }
    return node;
  }

  function union(u, v) {
    let rootU = find(u);
    let rootV = find(v);
    if (rootU === rootV) return { merged: false, rootU, rootV };
    if (size[rootU] < size[rootV]) [rootU, rootV] = [rootV, rootU];
    parent[rootV] = rootU;
    size[rootU] += size[rootV];
    return { merged: true, rootU, rootV };
  }

  function componentSnapshot() {
    const roots = parent.map((_, node) => rootWithoutCompression(node));
    const groups = new Map();
    roots.forEach((root, node) => {
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(node);
    });
    return { roots, groups: [...groups.entries()].map(([root, nodes]) => ({ root, nodes })) };
  }

  function pushStep({ title, note, codeLines, phase, event, currentEdge = null, edgeIndex = -1,
    rootsBefore = null, unionChanged = null, sorted = false, final = false, vars = [] }) {
    const components = componentSnapshot();
    steps.push({
      title,
      note,
      codeLines,
      arr: [...parent],
      sub: [...size],
      highlight: currentEdge ? [currentEdge.u, currentEdge.v] : [],
      mark: acceptedEdges.flatMap((edge) => [edge.u, edge.v]),
      vars,
      final,
      waterDistributionView: {
        phase,
        event,
        n,
        wells: [...wells],
        pipes: pipes.map((pipe, index) => ({ u: pipe[0], v: pipe[1], cost: pipe[2], sourceIndex: index })),
        edges: edges.map(copyEdge),
        sorted,
        currentEdge: copyEdge(currentEdge),
        edgeIndex,
        processedCount: Math.max(0, edgeIndex + 1),
        acceptedEdges: acceptedEdges.map(copyEdge),
        rejectedEdgeKeys: [...rejectedEdgeKeys],
        parent: [...parent],
        size: [...size],
        roots: components.roots,
        groups: components.groups,
        rootsBefore: rootsBefore ? { ...rootsBefore } : null,
        unionChanged,
        acceptedCount: acceptedEdges.length,
        totalCost,
        complete: acceptedEdges.length === n,
        answer: final ? totalCost : null,
      },
    });
  }

  pushStep({
    title: { vi: `${n} ngôi nhà cần được cấp nước`, en: `${n} houses need a water supply` },
    note: { vi: "Mỗi nhà có thể tự xây giếng hoặc nhận nước qua các đường ống. Ta cần chọn tổ hợp có tổng chi phí nhỏ nhất.", en: "Each house can build its own well or receive water through pipes. We need the minimum-cost combination." },
    codeLines: [2, 3], phase: "transform", event: "init",
    vars: [{ name: "n", value: n }, { name: "wells", value: `[${wells.join(", ")}]` }],
  });

  wells.forEach((cost, index) => {
    const house = index + 1;
    const edge = { key: `well-${house}`, u: 0, v: house, cost, kind: "well", sourceIndex: index, sortedIndex: -1 };
    edges.push(edge);
    pushStep({
      title: { vi: `Giếng nhà ${house} → cạnh ảo (0,${house}) giá ${cost}`, en: `House ${house} well → virtual edge (0,${house}) costing ${cost}` },
      note: { vi: "Node 0 là nguồn nước vô hạn. Chọn cạnh này trong MST đồng nghĩa xây giếng tại nhà tương ứng.", en: "Node 0 is an unlimited water source. Selecting this MST edge means building a well at that house." },
      codeLines: [3], phase: "transform", event: "add-well", currentEdge: edge,
      vars: [{ name: `well[${index}]`, value: cost }, { name: "virtual edge", value: `(0, ${house}, ${cost})` }],
    });
  });

  pipes.forEach(([u, v, cost], index) => {
    const edge = { key: `pipe-${index}-${u}-${v}`, u, v, cost, kind: "pipe", sourceIndex: index, sortedIndex: -1 };
    edges.push(edge);
    pushStep({
      title: { vi: `Thêm ống P${index + 1}: ${u} ↔ ${v}, giá ${cost}`, en: `Add pipe P${index + 1}: ${u} ↔ ${v}, cost ${cost}` },
      note: { vi: "Cạnh ống là lựa chọn truyền nước giữa hai ngôi nhà.", en: "A pipe edge is the option to carry water between two houses." },
      codeLines: [4, 5], phase: "transform", event: "add-pipe", currentEdge: edge,
      vars: [{ name: `pipes[${index}]`, value: `[${u}, ${v}, ${cost}]` }],
    });
  });

  edges.sort((a, b) => a.cost - b.cost || a.u - b.u || a.v - b.v || a.sourceIndex - b.sourceIndex);
  edges.forEach((edge, index) => { edge.sortedIndex = index; });
  pushStep({
    title: { vi: `Sort ${edges.length} cạnh theo chi phí tăng dần`, en: `Sort ${edges.length} edges by increasing cost` },
    note: { vi: "Kruskal luôn thử lựa chọn rẻ nhất còn lại; cạnh giếng và cạnh ống được so sánh trong cùng một danh sách.", en: "Kruskal always tries the cheapest remaining option; well and pipe edges compete in one list." },
    codeLines: [6], phase: "sort", event: "sorted", sorted: true,
    vars: [{ name: "edges", value: edges.map((edge) => `${edge.kind === "well" ? "W" : "P"}${edge.sourceIndex + 1}:${edge.cost}`).join(" < ") }],
  });

  pushStep({
    title: { vi: `Khởi tạo DSU cho node 0..${n}`, en: `Initialize DSU for nodes 0..${n}` },
    note: { vi: "MST của n+1 node cần đúng n cạnh. Ban đầu mỗi node là một component riêng.", en: "An MST over n+1 nodes needs exactly n edges. Initially every node is its own component." },
    codeLines: [7, 8, 26, 27], phase: "kruskal", event: "init-dsu", sorted: true,
    vars: [{ name: "parent", value: `[${parent.join(", ")}]` }, { name: "needed edges", value: n }],
  });

  for (let index = 0; index < edges.length && acceptedEdges.length < n; index++) {
    const edge = edges[index];
    pushStep({
      title: { vi: `Xét ${edge.kind === "well" ? `giếng W${edge.sourceIndex + 1}` : `ống P${edge.sourceIndex + 1}`} · giá ${edge.cost}`, en: `Consider ${edge.kind === "well" ? `well W${edge.sourceIndex + 1}` : `pipe P${edge.sourceIndex + 1}`} · cost ${edge.cost}` },
      note: { vi: `Cạnh ${edge.u} ↔ ${edge.v} chỉ được chọn nếu hai đầu đang ở hai component khác nhau.`, en: `Edge ${edge.u} ↔ ${edge.v} is selected only when its endpoints belong to different components.` },
      codeLines: [28], phase: "kruskal", event: "consider", currentEdge: edge, edgeIndex: index, sorted: true,
      vars: [{ name: "cost, u, v", value: `${edge.cost}, ${edge.u}, ${edge.v}` }],
    });

    const rootU = find(edge.u);
    const rootV = find(edge.v);
    const rootsBefore = { u: rootU, v: rootV };
    pushStep({
      title: { vi: `find(${edge.u}) = R${rootU}, find(${edge.v}) = R${rootV}`, en: `find(${edge.u}) = R${rootU}, find(${edge.v}) = R${rootV}` },
      note: rootU === rootV
        ? { vi: "Hai đầu đã cùng component: chọn cạnh này sẽ tạo chu trình.", en: "Both endpoints already share a component: selecting this edge would create a cycle." }
        : { vi: "Hai root khác nhau nên cạnh này có thể mở rộng MST.", en: "The roots differ, so this edge can extend the MST." },
      codeLines: [10, 11, 12, 13, 14, 17, 18], phase: "kruskal", event: "find", currentEdge: edge, edgeIndex: index,
      rootsBefore, unionChanged: null, sorted: true,
      vars: [{ name: "root_u", value: rootU }, { name: "root_v", value: rootV }],
    });

    if (rootU === rootV) {
      rejectedEdgeKeys.add(edge.key);
      pushStep({
        title: { vi: `Bỏ ${edge.kind === "well" ? "giếng" : "ống"}: tránh chu trình`, en: `Reject ${edge.kind}: avoid a cycle` },
        note: { vi: `Không cộng chi phí ${edge.cost}; MST hiện tại vẫn có ${acceptedEdges.length}/${n} cạnh.`, en: `Do not add cost ${edge.cost}; the current MST still has ${acceptedEdges.length}/${n} edges.` },
        codeLines: [18, 19], phase: "kruskal", event: "reject", currentEdge: edge, edgeIndex: index,
        rootsBefore, unionChanged: false, sorted: true,
        vars: [{ name: "accepted", value: false }, { name: "total", value: totalCost }],
      });
      continue;
    }

    const result = union(edge.u, edge.v);
    acceptedEdges.push(edge);
    totalCost += edge.cost;
    pushStep({
      title: { vi: `Chọn ${edge.kind === "well" ? `giếng W${edge.sourceIndex + 1}` : `ống P${edge.sourceIndex + 1}`} · tổng = ${totalCost}`, en: `Accept ${edge.kind === "well" ? `well W${edge.sourceIndex + 1}` : `pipe P${edge.sourceIndex + 1}`} · total = ${totalCost}` },
      note: { vi: `Union by size: R${result.rootV} nối vào R${result.rootU}. MST có ${acceptedEdges.length}/${n} cạnh.`, en: `Union by size: R${result.rootV} attaches to R${result.rootU}. The MST has ${acceptedEdges.length}/${n} edges.` },
      codeLines: [20, 21, 22, 23, 24, 29, 30, 31, 32, 33], phase: "kruskal", event: "accept", currentEdge: edge, edgeIndex: index,
      rootsBefore, unionChanged: true, sorted: true,
      vars: [{ name: "used", value: acceptedEdges.length }, { name: "total", value: totalCost }],
    });
  }

  pushStep({
    title: { vi: `Chi phí nhỏ nhất = ${totalCost}`, en: `Minimum cost = ${totalCost}` },
    note: { vi: `Đã chọn ${acceptedEdges.filter((edge) => edge.kind === "well").length} giếng và ${acceptedEdges.filter((edge) => edge.kind === "pipe").length} ống để nối mọi nhà với nguồn nước ảo.`, en: `Selected ${acceptedEdges.filter((edge) => edge.kind === "well").length} well(s) and ${acceptedEdges.filter((edge) => edge.kind === "pipe").length} pipe(s) to connect every house to the virtual source.` },
    codeLines: [34], phase: "done", event: "done", sorted: true, final: true,
    vars: [{ name: "answer", value: totalCost }, { name: "MST edges", value: `${acceptedEdges.length}/${n}` }],
  });

  return { input, answer: totalCost, steps };
}

// ─── Shared helpers for MST / Union-Find graph visualizations ───
// Used by #1135, #1489, #1579, #1627. All render through the reusable
// `step.graph` circle-layout renderer in public/script.js.

// Parse a matrix of integer rows from JSON ("[[1,2,5]]") or "a,b,c;a,b,c" text.
function mstParseMatrix(raw, arity, label) {
  const s = String(raw ?? "").trim();
  if (!s) throw new Error(`${label} is required`);
  let arr;
  try {
    arr = s.startsWith("[")
      ? JSON.parse(s)
      : s.split(/[;|]/).filter((part) => part.trim())
        .map((part) => part.split(",").map((x) => Number(x.trim())));
  } catch (error) {
    throw new Error(`${label} must be JSON like [[...]] or rows separated by ";"`);
  }
  if (!Array.isArray(arr) || !arr.every((row) => Array.isArray(row) && row.length === arity && row.every(Number.isInteger))) {
    throw new Error(`each ${label} entry must be exactly ${arity} integers`);
  }
  return arr.map((row) => row.map(Number));
}

// Minimal DSU with union-by-rank + path compression.
function mstMakeDSU(size) {
  const parent = Array.from({ length: size }, (_, i) => i);
  const rank = new Array(size).fill(0);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  function union(x, y) {
    const rx = find(x);
    const ry = find(y);
    if (rx === ry) return false;
    if (rank[rx] < rank[ry]) parent[rx] = ry;
    else if (rank[rx] > rank[ry]) parent[ry] = rx;
    else { parent[ry] = rx; rank[rx] += 1; }
    return true;
  }
  // Root without mutating parent (safe for display snapshots).
  function rootOf(x) {
    let r = x;
    while (parent[r] !== r) r = parent[r];
    return r;
  }
  return { parent, rank, find, union, rootOf };
}

// Roots for a list of node ids, plus the set of nodes that sit in a
// component of size > 1 (used to color "connected" nodes green).
function mstComponentInfo(dsu, nodeIds) {
  const roots = {};
  const counts = {};
  nodeIds.forEach((id) => {
    const r = dsu.rootOf(id);
    roots[id] = r;
    counts[r] = (counts[r] || 0) + 1;
  });
  const connected = nodeIds.filter((id) => counts[roots[id]] > 1);
  const componentCount = new Set(nodeIds.map((id) => roots[id])).size;
  return { roots, connected, componentCount };
}

// ─── 1135: Connecting Cities With Minimum Cost (Kruskal + Union Find) ───
function buildSteps1135(input, params = {}) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  if (!Number.isInteger(n) || n < 1) throw new Error("n must be a positive integer");
  if (n > 12) throw new Error("visualization supports at most 12 cities");
  const connections = mstParseMatrix(params.connections, 3, "connections");
  if (connections.length > 40) throw new Error("visualization supports at most 40 connections");
  connections.forEach(([u, v], index) => {
    if (u < 1 || u > n || v < 1 || v > n) throw new Error(`connection ${index} references a city outside 1..${n}`);
    if (u === v) throw new Error(`connection ${index} must join two different cities`);
  });

  const nodeIds = Array.from({ length: n }, (_, i) => i + 1);
  const dsu = mstMakeDSU(n + 1);
  const steps = [];

  // Two orderings over the SAME edge objects: input order (before sort) and
  // cost-sorted order (Kruskal's queue). Mutating e.state is reflected in both.
  const edgeObjs = connections.map(([u, v, w], idx) => ({ key: `e${idx}`, u, v, w, idx, sortedIndex: -1, state: "pending" }));
  const sortedEdges = [...edgeObjs].sort((a, b) => a.w - b.w || a.u - b.u || a.v - b.v);
  sortedEdges.forEach((e, i) => { e.sortedIndex = i; });

  let total = 0;
  let used = 0;
  let answer = -1;

  function groupsFromRoots(roots) {
    const map = new Map();
    nodeIds.forEach((id) => {
      const r = roots[id];
      if (!map.has(r)) map.set(r, []);
      map.get(r).push(id);
    });
    return [...map.entries()].map(([root, nodes]) => ({ root, nodes }));
  }

  function makeView(o) {
    const info = mstComponentInfo(dsu, nodeIds);
    const list = o.order || sortedEdges;
    return {
      phase: o.phase,
      n,
      need: n - 1,
      sorted: o.sorted !== false,
      nodes: nodeIds.slice(),
      edges: list.map((e) => ({ key: e.key, u: e.u, v: e.v, w: e.w, sortedIndex: e.sortedIndex, state: e.state })),
      currentKey: o.currentKey || null,
      roots: info.roots,
      groups: groupsFromRoots(info.roots),
      rootsBefore: o.rootsBefore || null,
      decision: o.decision || null,
      total,
      used,
      answer: o.final ? answer : null,
      complete: used === n - 1,
    };
  }

  function push(o) {
    steps.push({
      title: o.title, note: o.note, codeLines: o.codeLines,
      arr: [...dsu.parent], highlight: [], mark: [], vars: o.vars || [], final: o.final || false,
      connectCitiesView: makeView(o),
    });
  }

  push({
    title: { vi: `${n} thành phố, ${connections.length} đường nối khả dĩ`, en: `${n} cities, ${connections.length} candidate roads` },
    note: { vi: "Cần nối tất cả thành phố với tổng chi phí nhỏ nhất — đúng bài Cây khung nhỏ nhất (MST) giải bằng Kruskal.", en: "Connect every city with minimum total cost — a Minimum Spanning Tree (MST) solved with Kruskal." },
    codeLines: [1, 2], phase: "build", order: edgeObjs, sorted: false,
    vars: [{ name: "n", value: n }, { name: "connections", value: connections.length }],
  });

  push({
    title: { vi: "Sort cạnh theo chi phí tăng dần", en: "Sort edges by increasing cost" },
    note: { vi: "Kruskal luôn thử cạnh rẻ nhất còn lại trước. Hàng đợi cạnh giờ đã xếp từ rẻ → đắt.", en: "Kruskal always tries the cheapest remaining edge first. The edge queue is now ordered cheap → expensive." },
    codeLines: [3], phase: "sort", sorted: true,
    vars: [{ name: "edges", value: sortedEdges.map((e) => `(${e.u}-${e.v}:${e.w})`).join(" ≤ ") }],
  });

  push({
    title: { vi: `Khởi tạo DSU cho ${n} thành phố`, en: `Initialize DSU for ${n} cities` },
    note: { vi: `Mỗi thành phố là một component riêng (màu khác nhau). MST cần đúng ${n - 1} cạnh.`, en: `Each city starts as its own component (distinct colors). An MST needs exactly ${n - 1} edges.` },
    codeLines: [4], phase: "kruskal",
    vars: [{ name: "parent", value: `[${nodeIds.join(", ")}]` }, { name: "need", value: `${n - 1} edges` }],
  });

  for (const e of sortedEdges) {
    const ru = dsu.rootOf(e.u);
    const rv = dsu.rootOf(e.v);
    push({
      title: { vi: `Xét cạnh ${e.u} — ${e.v} (chi phí ${e.w})`, en: `Consider edge ${e.u} — ${e.v} (cost ${e.w})` },
      note: {
        vi: `find(${e.u})=R${ru}, find(${e.v})=R${rv}. ${ru === rv ? "Cùng nhóm → sẽ tạo chu trình." : "Khác nhóm → an toàn để nối."}`,
        en: `find(${e.u})=R${ru}, find(${e.v})=R${rv}. ${ru === rv ? "Same group → would form a cycle." : "Different groups → safe to connect."}`,
      },
      codeLines: [12, 13], phase: "kruskal", currentKey: e.key,
      rootsBefore: { u: ru, v: rv }, decision: "consider",
      vars: [{ name: "u,v,w", value: `${e.u}, ${e.v}, ${e.w}` }, { name: "find(u)", value: `R${ru}` }, { name: "find(v)", value: `R${rv}` }],
    });

    if (ru !== rv) {
      dsu.union(e.u, e.v);
      e.state = "accept";
      total += e.w;
      used += 1;
      push({
        title: { vi: `✓ Chọn ${e.u} — ${e.v}: total=${total}`, en: `✓ Take ${e.u} — ${e.v}: total=${total}` },
        note: { vi: `Hai nhóm khác nhau → union và cộng ${e.w}. Đã dùng ${used}/${n - 1} cạnh.`, en: `Two different groups → union and add ${e.w}. Used ${used}/${n - 1} edges.` },
        codeLines: [14, 15, 16, 17], phase: "kruskal", currentKey: e.key,
        rootsBefore: { u: ru, v: rv }, decision: "accept",
        vars: [{ name: "total", value: total }, { name: "used", value: `${used}/${n - 1}` }],
      });
    } else {
      e.state = "reject";
      push({
        title: { vi: `✗ Bỏ ${e.u} — ${e.v} (chu trình)`, en: `✗ Skip ${e.u} — ${e.v} (cycle)` },
        note: { vi: `Cùng nhóm R${ru} → nối sẽ tạo chu trình, bỏ qua cạnh này.`, en: `Same group R${ru} → connecting would form a cycle, skip this edge.` },
        codeLines: [14], phase: "kruskal", currentKey: e.key,
        rootsBefore: { u: ru, v: rv }, decision: "reject",
        vars: [{ name: "decision", value: "cycle → skip" }],
      });
    }
    if (used === n - 1) break;
  }

  answer = used === n - 1 ? total : -1;
  push({
    title: answer === -1
      ? { vi: "Không thể nối tất cả thành phố → -1", en: "Cannot connect all cities → -1" }
      : { vi: `Chi phí nhỏ nhất = ${total}`, en: `Minimum cost = ${total}` },
    note: answer === -1
      ? { vi: `Chỉ dùng được ${used} cạnh (< ${n - 1}); đồ thị không liên thông.`, en: `Only ${used} edges usable (< ${n - 1}); the graph is disconnected.` }
      : { vi: `MST dùng ${used} cạnh (xanh) nối toàn bộ ${n} thành phố với tổng ${total}.`, en: `The MST uses ${used} edges (green) connecting all ${n} cities with total ${total}.` },
    codeLines: [18], phase: "done", final: true,
    vars: [{ name: "answer", value: answer }, { name: "MST edges", value: `${used}/${n - 1}` }],
  });

  return { input, answer, steps };
}

// ─── 1627: Graph Connectivity With Threshold (Union Find) ───
function buildSteps1627(input, params = {}) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  if (!Number.isInteger(n) || n < 1) throw new Error("n must be a positive integer");
  if (n > 24) throw new Error("visualization supports at most 24 nodes");
  const threshold = Number(params.threshold);
  if (!Number.isInteger(threshold) || threshold < 0) throw new Error("threshold must be a non-negative integer");
  const queries = mstParseMatrix(params.queries, 2, "queries");
  if (queries.length > 20) throw new Error("visualization supports at most 20 queries");
  queries.forEach(([a, b], index) => {
    if (a < 1 || a > n || b < 1 || b > n) throw new Error(`query ${index} references a node outside 1..${n}`);
  });

  const nodeIds = Array.from({ length: n }, (_, i) => i + 1);
  const dsu = mstMakeDSU(n + 1);
  const steps = [];
  const edges = [];
  const edgeKeys = new Set();

  function addEdge(u, v) {
    const key = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ u, v });
  }

  function makeGraph(hlEdges, hlNodes) {
    const info = mstComponentInfo(dsu, nodeIds);
    return {
      nodes: nodeIds.map((id) => ({ id, label: String(id), sub: `R${info.roots[id]}` })),
      edges: edges.map((e) => ({ u: e.u, v: e.v, undirected: true, kind: "accept" })),
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: info.connected,
    };
  }

  function push({ title, note, codeLines, hlEdges = [], hlNodes = [], vars = [], final = false }) {
    steps.push({
      title, note, codeLines,
      arr: [...dsu.parent], highlight: hlNodes, mark: [], vars, final,
      graph: makeGraph(hlEdges, hlNodes),
    });
  }

  push({
    title: { vi: `n=${n}, threshold=${threshold}, ${queries.length} truy vấn`, en: `n=${n}, threshold=${threshold}, ${queries.length} queries` },
    note: {
      vi: "Hai node x, y nối nhau nếu có ước chung z > threshold. Ta gom mọi node dùng Union-Find rồi trả lời từng truy vấn.",
      en: "Two nodes x, y are connected if they share a common divisor z > threshold. Group all nodes with Union-Find, then answer each query.",
    },
    codeLines: [1, 2],
    vars: [{ name: "n", value: n }, { name: "threshold", value: threshold }],
  });

  push({
    title: { vi: `Khởi tạo DSU cho node 1..${n}`, en: `Initialize DSU for nodes 1..${n}` },
    note: { vi: "Ban đầu mỗi node là một component riêng.", en: "Initially every node is its own component." },
    codeLines: [3],
    vars: [{ name: "parent", value: `[${nodeIds.join(", ")}]` }],
  });

  for (let z = threshold + 1; z <= n; z++) {
    const multiples = [];
    for (let m = 2 * z; m <= n; m += z) multiples.push(m);
    if (multiples.length === 0) continue;
    push({
      title: { vi: `z = ${z}: nối ${z} với các bội số ${multiples.join(", ")}`, en: `z = ${z}: connect ${z} with multiples ${multiples.join(", ")}` },
      note: { vi: `Mọi bội số của ${z} đều có ước chung ${z} (> ${threshold}) nên cùng một nhóm.`, en: `Every multiple of ${z} shares the divisor ${z} (> ${threshold}), so they belong to one group.` },
      codeLines: [9, 10],
      hlNodes: [z, ...multiples],
      vars: [{ name: "z", value: z }, { name: "multiples", value: multiples.join(", ") }],
    });
    for (const m of multiples) {
      const rz = dsu.rootOf(z);
      const rm = dsu.rootOf(m);
      const already = rz === rm;
      addEdge(z, m);
      dsu.union(z, m);
      push({
        title: { vi: `union(${z}, ${m})`, en: `union(${z}, ${m})` },
        note: already
          ? { vi: `${z} và ${m} đã cùng nhóm (R${rz}) — cạnh này chỉ củng cố liên thông.`, en: `${z} and ${m} were already in group R${rz} — this edge just reinforces connectivity.` }
          : { vi: `Gộp nhóm của ${z} (R${rz}) và ${m} (R${rm}).`, en: `Merge the groups of ${z} (R${rz}) and ${m} (R${rm}).` },
        codeLines: [11],
        hlEdges: [[z, m]], hlNodes: [z, m],
        vars: [{ name: "z, m", value: `${z}, ${m}` }, { name: "find(z), find(m)", value: `R${rz}, R${rm}` }],
      });
    }
  }

  const results = [];
  queries.forEach(([a, b], index) => {
    const ra = dsu.rootOf(a);
    const rb = dsu.rootOf(b);
    const connected = ra === rb;
    results.push(connected);
    push({
      title: { vi: `Truy vấn ${index + 1}: ${a} ↔ ${b}? ${connected ? "TRUE" : "FALSE"}`, en: `Query ${index + 1}: ${a} ↔ ${b}? ${connected ? "TRUE" : "FALSE"}` },
      note: {
        vi: `find(${a})=R${ra}, find(${b})=R${rb}. ${connected ? "Cùng root → có đường đi." : "Khác root → không nối được."}`,
        en: `find(${a})=R${ra}, find(${b})=R${rb}. ${connected ? "Same root → a path exists." : "Different roots → not connected."}`,
      },
      codeLines: [12], hlNodes: [a, b],
      vars: [{ name: "a, b", value: `${a}, ${b}` }, { name: "result", value: String(connected) }],
    });
  });

  push({
    title: { vi: "Kết quả các truy vấn", en: "Query results" },
    note: { vi: `answer = [${results.join(", ")}]`, en: `answer = [${results.join(", ")}]` },
    codeLines: [12], final: true,
    vars: [{ name: "answer", value: `[${results.join(", ")}]` }],
  });

  return { input, answer: results, steps };
}

// ─── 1579: Remove Max Number of Edges to Keep Graph Fully Traversable ───
function buildSteps1579(input, params = {}) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  if (!Number.isInteger(n) || n < 1) throw new Error("n must be a positive integer");
  if (n > 16) throw new Error("visualization supports at most 16 nodes");
  const raw = mstParseMatrix(params.edges, 3, "edges");
  if (raw.length > 40) throw new Error("visualization supports at most 40 edges");
  raw.forEach(([t, u, v], index) => {
    if (![1, 2, 3].includes(t)) throw new Error(`edge ${index} type must be 1, 2, or 3`);
    if (u < 1 || u > n || v < 1 || v > n) throw new Error(`edge ${index} references a node outside 1..${n}`);
    if (u === v) throw new Error(`edge ${index} must join two different nodes`);
  });

  const nodeIds = Array.from({ length: n }, (_, i) => i + 1);
  const edges = raw.map(([t, u, v], idx) => ({ t, u, v, idx, state: "pending" }));
  const alice = mstMakeDSU(n + 1);
  const bob = mstMakeDSU(n + 1);
  let aliceComp = n;
  let bobComp = n;
  let used = 0;
  const steps = [];

  function makeGraph(hlEdges, hlNodes) {
    return {
      nodes: nodeIds.map((id) => ({ id, label: String(id), sub: `A${alice.rootOf(id)}·B${bob.rootOf(id)}` })),
      edges: edges.map((e) => ({
        u: e.u, v: e.v, w: `T${e.t}`, undirected: true,
        kind: e.state === "accept" ? "accept" : e.state === "reject" ? "reject" : undefined,
      })),
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: [],
    };
  }

  function push({ title, note, codeLines, hlEdges = [], hlNodes = [], vars = [], final = false }) {
    steps.push({
      title, note, codeLines,
      arr: [...alice.parent], sub: [...bob.parent], highlight: hlNodes, mark: [], vars, final,
      graph: makeGraph(hlEdges, hlNodes),
    });
  }

  const typeCount = (type) => edges.filter((e) => e.t === type).length;
  push({
    title: { vi: `n=${n}, ${edges.length} cạnh (T3:${typeCount(3)} T1:${typeCount(1)} T2:${typeCount(2)})`, en: `n=${n}, ${edges.length} edges (T3:${typeCount(3)} T1:${typeCount(1)} T2:${typeCount(2)})` },
    note: {
      vi: "T3 = cả Alice và Bob đi được, T1 = chỉ Alice, T2 = chỉ Bob. Cần giữ ít cạnh nhất để CẢ HAI vẫn liên thông, phần còn lại là số cạnh xóa được.",
      en: "T3 = usable by both Alice and Bob, T1 = Alice only, T2 = Bob only. Keep the fewest edges so BOTH stay fully connected; the rest are removable.",
    },
    codeLines: [1, 2],
    vars: [{ name: "n", value: n }, { name: "edges", value: edges.length }],
  });

  push({
    title: { vi: "Hai DSU riêng cho Alice và Bob", en: "Two separate DSUs for Alice and Bob" },
    note: { vi: "Mỗi người có đồ thị riêng. Sub-label mỗi node hiển thị A(root Alice)·B(root Bob).", en: "Each person has their own graph. Each node's sub-label shows A(Alice root)·B(Bob root)." },
    codeLines: [3, 4],
    vars: [{ name: "aliceComp", value: aliceComp }, { name: "bobComp", value: bobComp }],
  });

  // Phase 1 — type-3 edges first (most valuable: help both).
  push({
    title: { vi: "Ưu tiên cạnh T3 (dùng chung)", en: "Prioritize T3 (shared) edges" },
    note: { vi: "Cạnh T3 nối cho cả hai cùng lúc nên xét trước để tận dụng tối đa.", en: "A T3 edge connects both at once, so process these first to maximize sharing." },
    codeLines: [17, 18],
  });

  for (const e of edges) {
    if (e.t !== 3) continue;
    const ra = alice.rootOf(e.u);
    const rb = alice.rootOf(e.v);
    if (ra !== rb) {
      alice.union(e.u, e.v);
      bob.union(e.u, e.v);
      aliceComp -= 1;
      bobComp -= 1;
      used += 1;
      e.state = "accept";
      push({
        title: { vi: `✓ Giữ T3 ${e.u}—${e.v}`, en: `✓ Keep T3 ${e.u}—${e.v}` },
        note: { vi: `${e.u},${e.v} chưa cùng nhóm → union trong CẢ Alice và Bob. used=${used}.`, en: `${e.u},${e.v} not yet joined → union in BOTH Alice and Bob. used=${used}.` },
        codeLines: [19, 20, 21], hlEdges: [[e.u, e.v]], hlNodes: [e.u, e.v],
        vars: [{ name: "used", value: used }, { name: "aliceComp", value: aliceComp }, { name: "bobComp", value: bobComp }],
      });
    } else {
      e.state = "reject";
      push({
        title: { vi: `✗ Xóa được T3 ${e.u}—${e.v}`, en: `✗ Removable T3 ${e.u}—${e.v}` },
        note: { vi: `${e.u},${e.v} đã cùng nhóm (R${ra}) → cạnh thừa, có thể xóa.`, en: `${e.u},${e.v} already joined (R${ra}) → redundant, can be removed.` },
        codeLines: [19], hlEdges: [[e.u, e.v]], hlNodes: [e.u, e.v],
        vars: [{ name: "decision", value: "redundant → removable" }],
      });
    }
  }

  // Phase 2 — exclusive edges.
  push({
    title: { vi: "Xét cạnh riêng T1 (Alice) và T2 (Bob)", en: "Process exclusive T1 (Alice) and T2 (Bob) edges" },
    note: { vi: "Chỉ giữ cạnh riêng nếu nó nối hai nhóm còn tách trong đồ thị của người đó.", en: "Keep an exclusive edge only if it joins two still-separate groups in that person's graph." },
    codeLines: [22],
  });

  for (const e of edges) {
    if (e.t === 3) continue;
    const who = e.t === 1 ? alice : bob;
    const label = e.t === 1 ? "Alice" : "Bob";
    const ra = who.rootOf(e.u);
    const rb = who.rootOf(e.v);
    if (ra !== rb) {
      who.union(e.u, e.v);
      if (e.t === 1) aliceComp -= 1; else bobComp -= 1;
      used += 1;
      e.state = "accept";
      push({
        title: { vi: `✓ Giữ T${e.t} ${e.u}—${e.v} (${label})`, en: `✓ Keep T${e.t} ${e.u}—${e.v} (${label})` },
        note: { vi: `Trong đồ thị ${label}, ${e.u},${e.v} khác nhóm → union. used=${used}.`, en: `In ${label}'s graph, ${e.u},${e.v} are in different groups → union. used=${used}.` },
        codeLines: e.t === 1 ? [23, 24] : [25, 26], hlEdges: [[e.u, e.v]], hlNodes: [e.u, e.v],
        vars: [{ name: "used", value: used }, { name: "aliceComp", value: aliceComp }, { name: "bobComp", value: bobComp }],
      });
    } else {
      e.state = "reject";
      push({
        title: { vi: `✗ Xóa được T${e.t} ${e.u}—${e.v} (${label})`, en: `✗ Removable T${e.t} ${e.u}—${e.v} (${label})` },
        note: { vi: `Trong đồ thị ${label}, ${e.u},${e.v} đã cùng nhóm → cạnh thừa.`, en: `In ${label}'s graph, ${e.u},${e.v} already joined → redundant.` },
        codeLines: e.t === 1 ? [23] : [25], hlEdges: [[e.u, e.v]], hlNodes: [e.u, e.v],
        vars: [{ name: "decision", value: "redundant → removable" }],
      });
    }
  }

  const aliceOk = aliceComp === 1;
  const bobOk = bobComp === 1;
  push({
    title: { vi: `Kiểm tra liên thông: Alice ${aliceOk ? "✓" : "✗"} · Bob ${bobOk ? "✓" : "✗"}`, en: `Connectivity check: Alice ${aliceOk ? "✓" : "✗"} · Bob ${bobOk ? "✓" : "✗"}` },
    note: {
      vi: `Alice còn ${aliceComp} component, Bob còn ${bobComp}. Cả hai phải bằng 1 thì đồ thị mới đi hết được.`,
      en: `Alice has ${aliceComp} component(s), Bob has ${bobComp}. Both must equal 1 for full traversability.`,
    },
    codeLines: [27, 28],
    vars: [{ name: "aliceComp", value: aliceComp }, { name: "bobComp", value: bobComp }],
  });

  const answer = aliceOk && bobOk ? edges.length - used : -1;
  push({
    title: answer === -1
      ? { vi: "Không thể đi hết → -1", en: "Not fully traversable → -1" }
      : { vi: `Số cạnh xóa được tối đa = ${answer}`, en: `Max removable edges = ${answer}` },
    note: answer === -1
      ? { vi: "Ít nhất một người không liên thông toàn bộ nên không có đáp án.", en: "At least one person is not fully connected, so there is no valid answer." }
      : { vi: `Giữ ${used} cạnh cần thiết, xóa ${edges.length} − ${used} = ${answer} cạnh thừa.`, en: `Keep ${used} necessary edges, remove ${edges.length} − ${used} = ${answer} redundant edges.` },
    codeLines: [29], final: true,
    vars: [{ name: "answer", value: answer }, { name: "used", value: used }],
  });

  return { input, answer, steps };
}

// ─── 1489: Find Critical and Pseudo-Critical Edges in MST (Kruskal, repeated) ───
function buildSteps1489(input, params = {}) {
  const n = Array.isArray(input) ? Number(input[0]) : Number(input);
  if (!Number.isInteger(n) || n < 1) throw new Error("n must be a positive integer");
  if (n > 12) throw new Error("visualization supports at most 12 nodes");
  const raw = mstParseMatrix(params.edges, 3, "edges");
  if (raw.length > 30) throw new Error("visualization supports at most 30 edges");
  raw.forEach(([u, v], index) => {
    if (u < 0 || u >= n || v < 0 || v >= n) throw new Error(`edge ${index} references a node outside 0..${n - 1}`);
    if (u === v) throw new Error(`edge ${index} must join two different nodes`);
  });

  const nodeIds = Array.from({ length: n }, (_, i) => i);
  const edges = raw.map(([u, v, w], idx) => ({ u, v, w, idx, state: "pending" }));
  const sorted = [...edges].sort((a, b) => a.w - b.w || a.u - b.u || a.v - b.v);
  const steps = [];

  // Run Kruskal, optionally excluding one edge index or force-including one first.
  function mstWeight(exclude, include) {
    const dsu = mstMakeDSU(n);
    let weight = 0;
    let count = 0;
    if (include !== undefined && include >= 0) {
      const e = edges[include];
      if (dsu.union(e.u, e.v)) { weight += e.w; count += 1; }
    }
    for (const e of sorted) {
      if (e.idx === exclude) continue;
      if (dsu.union(e.u, e.v)) { weight += e.w; count += 1; }
    }
    return count === n - 1 ? weight : Infinity;
  }

  function makeGraph(hlEdges, hlNodes) {
    return {
      nodes: nodeIds.map((id) => ({ id, label: String(id) })),
      edges: edges.map((e) => ({
        u: e.u, v: e.v, w: `#${e.idx}:${e.w}`, undirected: true,
        kind: e.state === "pending" ? undefined : e.state,
      })),
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: [],
    };
  }

  function push({ title, note, codeLines, hlEdges = [], hlNodes = [], vars = [], final = false }) {
    steps.push({
      title, note, codeLines,
      arr: [], highlight: hlNodes, mark: [], vars, final,
      graph: makeGraph(hlEdges, hlNodes),
    });
  }

  const base = mstWeight(undefined, undefined);

  push({
    title: { vi: `n=${n}, ${edges.length} cạnh — tìm cạnh then chốt & bán then chốt`, en: `n=${n}, ${edges.length} edges — find critical & pseudo-critical edges` },
    note: {
      vi: "Cạnh THEN CHỐT (critical): nếu bỏ đi thì MST nặng hơn hoặc không nối được. Cạnh BÁN THEN CHỐT (pseudo): có mặt trong MỘT MST nào đó nhưng không bắt buộc. Node đánh số từ 0. Đáp án là chỉ số cạnh.",
      en: "A CRITICAL edge: removing it makes the MST heavier or disconnected. A PSEUDO-CRITICAL edge: appears in SOME MST but is not mandatory. Nodes are 0-indexed. The answer is edge indices.",
    },
    codeLines: [1, 2],
    vars: [{ name: "n", value: n }, { name: "edges", value: edges.length }],
  });

  push({
    title: { vi: "Sort cạnh theo trọng số tăng dần", en: "Sort edges by increasing weight" },
    note: { vi: "Kruskal chuẩn để lấy trọng số MST cơ sở.", en: "Standard Kruskal to obtain the baseline MST weight." },
    codeLines: [3, 4],
    vars: [{ name: "sorted", value: sorted.map((e) => `#${e.idx}(${e.w})`).join(" ≤ ") }],
  });

  // Phase 1 — baseline MST (one step per sorted edge).
  const baseDSU = mstMakeDSU(n);
  let baseWeight = 0;
  for (const e of sorted) {
    const ru = baseDSU.rootOf(e.u);
    const rv = baseDSU.rootOf(e.v);
    if (ru !== rv) {
      baseDSU.union(e.u, e.v);
      baseWeight += e.w;
      e.state = "accept";
      push({
        title: { vi: `MST cơ sở: chọn #${e.idx} (${e.u}-${e.v}, w=${e.w})`, en: `Baseline MST: take #${e.idx} (${e.u}-${e.v}, w=${e.w})` },
        note: { vi: `Khác component → nhận. Trọng số cộng dồn = ${baseWeight}.`, en: `Different components → accept. Running weight = ${baseWeight}.` },
        codeLines: [5], hlEdges: [[e.u, e.v]], hlNodes: [e.u, e.v],
        vars: [{ name: "baseWeight", value: baseWeight }],
      });
    }
  }
  push({
    title: { vi: `Trọng số MST cơ sở = ${base}`, en: `Baseline MST weight = ${base}` },
    note: { vi: "Đây là mốc để so sánh khi bỏ/bắt buộc từng cạnh. Các cạnh xanh là MỘT MST hợp lệ.", en: "This is the reference for the exclude/include tests. Green edges form one valid MST." },
    codeLines: [17],
    vars: [{ name: "base", value: base }],
  });

  // Phase 2 — reset colours, then classify each original edge.
  edges.forEach((e) => { e.state = "pending"; });
  const critical = [];
  const pseudo = [];

  for (const e of edges) {
    const withoutEdge = mstWeight(e.idx, undefined);
    const isCritical = withoutEdge > base;
    let withEdge = null;
    if (!isCritical) withEdge = mstWeight(undefined, e.idx);

    if (isCritical) {
      e.state = "critical";
      critical.push(e.idx);
      push({
        title: { vi: `Cạnh #${e.idx} (${e.u}-${e.v}): THEN CHỐT`, en: `Edge #${e.idx} (${e.u}-${e.v}): CRITICAL` },
        note: {
          vi: withoutEdge === Infinity
            ? `Bỏ cạnh này → không thể nối hết đồ thị (MST = ∞ > ${base}). Bắt buộc phải giữ.`
            : `Bỏ cạnh này → MST = ${withoutEdge} > ${base}. Nó có trong MỌI MST nên là then chốt.`,
          en: withoutEdge === Infinity
            ? `Remove it → the graph can't be spanned (MST = ∞ > ${base}). It must be kept.`
            : `Remove it → MST = ${withoutEdge} > ${base}. It is in EVERY MST, so it is critical.`,
        },
        codeLines: [19, 20], hlEdges: [[e.u, e.v]], hlNodes: [e.u, e.v],
        vars: [{ name: "MST without #" + e.idx, value: withoutEdge === Infinity ? "∞" : withoutEdge }, { name: "base", value: base }],
      });
    } else if (withEdge === base) {
      e.state = "pseudo";
      pseudo.push(e.idx);
      push({
        title: { vi: `Cạnh #${e.idx} (${e.u}-${e.v}): BÁN THEN CHỐT`, en: `Edge #${e.idx} (${e.u}-${e.v}): PSEUDO-CRITICAL` },
        note: {
          vi: `Bỏ vẫn ra ${base} (không then chốt), nhưng bắt buộc dùng vẫn ra MST = ${base} → nó thuộc MỘT MST tối ưu.`,
          en: `Excluding it still gives ${base} (not critical), yet forcing it in also yields MST = ${base} → it belongs to SOME optimal MST.`,
        },
        codeLines: [21, 22], hlEdges: [[e.u, e.v]], hlNodes: [e.u, e.v],
        vars: [{ name: "MST forcing #" + e.idx, value: withEdge }, { name: "base", value: base }],
      });
    } else {
      e.state = "reject";
      push({
        title: { vi: `Cạnh #${e.idx} (${e.u}-${e.v}): không thuộc MST nào`, en: `Edge #${e.idx} (${e.u}-${e.v}): in no MST` },
        note: {
          vi: `Bỏ vẫn ra ${base}, nhưng bắt buộc dùng thì MST = ${withEdge} > ${base} → cạnh này quá đắt, không bao giờ tối ưu.`,
          en: `Excluding gives ${base}, but forcing it gives MST = ${withEdge} > ${base} → too expensive, never optimal.`,
        },
        codeLines: [21], hlEdges: [[e.u, e.v]], hlNodes: [e.u, e.v],
        vars: [{ name: "MST forcing #" + e.idx, value: withEdge }, { name: "base", value: base }],
      });
    }
  }

  push({
    title: { vi: `Kết quả: critical=[${critical.join(", ")}], pseudo=[${pseudo.join(", ")}]`, en: `Result: critical=[${critical.join(", ")}], pseudo=[${pseudo.join(", ")}]` },
    note: {
      vi: `Đỏ = then chốt (mọi MST đều có), tím = bán then chốt (một MST có), xám = không bao giờ dùng.`,
      en: `Red = critical (in every MST), purple = pseudo-critical (in some MST), gray = never used.`,
    },
    codeLines: [23], final: true,
    vars: [{ name: "critical", value: `[${critical.join(", ")}]` }, { name: "pseudo", value: `[${pseudo.join(", ")}]` }],
  });

  return { input, answer: [critical, pseudo], steps };
}

module.exports = {
  1489: {
    id: 1489,
    difficulty: "hard",
    slug: "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree",
    category: UF_CAT,
    tags: [
      { key: "mst", vi: "Cây khung nhỏ nhất (MST)", en: "Minimum Spanning Tree (MST)" },
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
    ],
    title: { vi: "Find Critical and Pseudo-Critical Edges in MST", en: "Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree" },
    titleVi: { vi: "Tìm cạnh then chốt & bán then chốt trong MST", en: "Find critical and pseudo-critical edges in the MST" },
    statement: {
      vi: "Cho đồ thị vô hướng n node (0..n-1) với edges[i] = [u, v, w]. Cạnh THEN CHỐT là cạnh có trong mọi MST (bỏ nó thì tổng MST tăng hoặc đồ thị đứt). Cạnh BÁN THEN CHỐT có trong một MST nào đó nhưng không phải mọi MST. Trả về [danh sách chỉ số then chốt, danh sách chỉ số bán then chốt].",
      en: "Given an undirected graph on n nodes (0..n-1) with edges[i] = [u, v, w]. A CRITICAL edge appears in every MST (removing it increases the MST weight or disconnects the graph). A PSEUDO-CRITICAL edge appears in some MST but not all. Return [critical indices, pseudo-critical indices].",
    },
    defaultInput: [5],
    inputKind: "positive",
    singleInput: true,
    inputLabel: { vi: "n — số node (nhập 1 số)", en: "n — number of nodes (one number)" },
    extraParams: [{
      key: "edges", type: "string",
      label: { vi: "edges: u,v,w;... hoặc JSON (node từ 0)", en: "edges: u,v,w;... or JSON (0-indexed)" },
      default: "0,1,1;1,2,1;2,3,2;0,3,2;0,4,3;3,4,3;1,4,6",
    }],
    approach: [
      { vi: "Tính trọng số MST cơ sở bằng Kruskal trên toàn bộ cạnh.", en: "Compute the baseline MST weight with Kruskal over all edges." },
      { vi: "Với mỗi cạnh: chạy Kruskal khi BỎ cạnh đó. Nếu MST nặng hơn cơ sở (hoặc không nối được) → cạnh THEN CHỐT.", en: "For each edge: run Kruskal EXCLUDING it. If the MST is heavier than the baseline (or disconnected) → CRITICAL." },
      { vi: "Nếu không then chốt: chạy Kruskal khi BẮT BUỘC dùng cạnh đó trước. Nếu vẫn ra đúng trọng số cơ sở → BÁN THEN CHỐT.", en: "If not critical: run Kruskal FORCING that edge first. If it still reaches the baseline weight → PSEUDO-CRITICAL." },
      { vi: "Cạnh không rơi vào cả hai loại thì không bao giờ nằm trong MST tối ưu.", en: "An edge in neither class never belongs to an optimal MST." },
    ],
    complexity: {
      time: "O(E² · α(n))",
      space: "O(n + E)",
      note: { vi: "Mỗi cạnh chạy Kruskal 1–2 lần (O(E)); tổng O(E²).", en: "Each edge runs Kruskal 1–2 times (O(E)); overall O(E²)." },
    },
    code: [
      "class Solution:",
      "    def findCriticalAndPseudoCriticalEdges(self, n, edges):",
      "        order = sorted(range(len(edges)), key=lambda i: edges[i][2])",
      "        def mst(skip=-1, force=-1):",
      "            parent = list(range(n)); weight = count = 0",
      "            def find(x):",
      "                while parent[x] != x:",
      "                    parent[x] = parent[parent[x]]; x = parent[x]",
      "                return x",
      "            if force >= 0:",
      "                u, v, w = edges[force]; parent[find(u)] = find(v)",
      "                weight += w; count += 1",
      "            for i in order:",
      "                if i == skip: continue",
      "                u, v, w = edges[i]; ru, rv = find(u), find(v)",
      "                if ru != rv:",
      "                    parent[ru] = rv; weight += w; count += 1",
      "            return weight if count == n - 1 else float('inf')",
      "        base = mst()",
      "        critical, pseudo = [], []",
      "        for i in range(len(edges)):",
      "            if mst(skip=i) > base:",
      "                critical.append(i)",
      "            elif mst(force=i) == base:",
      "                pseudo.append(i)",
      "        return [critical, pseudo]",
    ],
    builder: buildSteps1489,
    liveArgs(input, params = {}) {
      const n = Array.isArray(input) ? Number(input[0]) : Number(input);
      return [n, mstParseMatrix(params.edges, 3, "edges")];
    },
  },
  1579: {
    id: 1579,
    difficulty: "hard",
    slug: "remove-max-number-of-edges-to-keep-graph-fully-traversable",
    category: UF_CAT,
    tags: [
      { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: { vi: "Remove Max Number of Edges to Keep Graph Fully Traversable", en: "Remove Max Number of Edges to Keep Graph Fully Traversable" },
    titleVi: { vi: "Xóa nhiều cạnh nhất mà đồ thị vẫn đi hết (2 DSU)", en: "Remove max edges keeping the graph fully traversable (two DSUs)" },
    statement: {
      vi: "Đồ thị n node 1..n. edges[i] = [type, u, v]: type 1 = chỉ Alice đi, 2 = chỉ Bob đi, 3 = cả hai đi. Xóa nhiều cạnh nhất sao cho cả Alice và Bob vẫn đi được tới mọi node. Trả về số cạnh xóa được, hoặc -1 nếu không thể.",
      en: "Graph on n nodes 1..n. edges[i] = [type, u, v]: type 1 = Alice only, 2 = Bob only, 3 = both. Remove the maximum edges so both Alice and Bob can still reach every node. Return the number removed, or -1 if impossible.",
    },
    defaultInput: [4],
    inputKind: "positive",
    singleInput: true,
    inputLabel: { vi: "n — số node (nhập 1 số)", en: "n — number of nodes (one number)" },
    extraParams: [{
      key: "edges", type: "string",
      label: { vi: "edges: type,u,v;... hoặc JSON", en: "edges: type,u,v;... or JSON" },
      default: "3,1,2;3,2,3;3,3,4;1,1,4;2,2,4",
    }],
    approach: [
      { vi: "Cạnh loại 3 giúp cả hai nên xét trước: dùng chung một lần union cho cả Alice lẫn Bob.", en: "Type-3 edges help both, so process them first: a single union counts for both Alice and Bob." },
      { vi: "Sau đó xét cạnh riêng: T1 union trong DSU Alice, T2 union trong DSU Bob. Chỉ giữ cạnh nối hai nhóm còn tách.", en: "Then process exclusive edges: T1 unions in Alice's DSU, T2 in Bob's. Keep only edges that join still-separate groups." },
      { vi: "Cạnh không làm giảm số component là cạnh thừa → có thể xóa.", en: "Any edge that does not reduce the component count is redundant → removable." },
      { vi: "Cuối cùng nếu cả hai DSU đều còn đúng 1 component thì đáp án = tổng cạnh − số cạnh đã giữ; ngược lại trả -1.", en: "Finally, if both DSUs collapse to a single component, the answer = total edges − edges kept; otherwise return -1." },
    ],
    complexity: {
      time: "O(E · α(n))",
      space: "O(n)",
      note: { vi: "Mỗi cạnh được xử lý một lần với thao tác DSU gần O(1).", en: "Each edge is processed once with effectively O(1) DSU operations." },
    },
    code: [
      "class Solution:",
      "    def maxNumEdgesToRemove(self, n, edges):",
      "        alice = list(range(n + 1))",
      "        bob = list(range(n + 1))",
      "        def find(p, x):",
      "            while p[x] != x:",
      "                p[x] = p[p[x]]",
      "                x = p[x]",
      "            return x",
      "        def union(p, x, y):",
      "            rx, ry = find(p, x), find(p, y)",
      "            if rx == ry:",
      "                return False",
      "            p[rx] = ry",
      "            return True",
      "        used = 0",
      "        for t, u, v in edges:",
      "            if t == 3:",
      "                if union(alice, u, v):",
      "                    union(bob, u, v)",
      "                    used += 1",
      "        for t, u, v in edges:",
      "            if t == 1 and union(alice, u, v):",
      "                used += 1",
      "            elif t == 2 and union(bob, u, v):",
      "                used += 1",
      "        a_ok = all(find(alice, i) == find(alice, 1) for i in range(1, n + 1))",
      "        b_ok = all(find(bob, i) == find(bob, 1) for i in range(1, n + 1))",
      "        return len(edges) - used if a_ok and b_ok else -1",
    ],
    builder: buildSteps1579,
    liveArgs(input, params = {}) {
      const n = Array.isArray(input) ? Number(input[0]) : Number(input);
      return [n, mstParseMatrix(params.edges, 3, "edges")];
    },
  },
  1627: {
    id: 1627,
    difficulty: "hard",
    slug: "graph-connectivity-with-threshold",
    category: UF_CAT,
    tags: [
      { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "math", vi: "Toán/Số học", en: "Math" },
    ],
    title: { vi: "Graph Connectivity With Threshold", en: "Graph Connectivity With Threshold" },
    titleVi: { vi: "Liên thông đồ thị theo ngưỡng (Union-Find)", en: "Graph connectivity with threshold (Union-Find)" },
    statement: {
      vi: "Cho n thành phố 1..n. Hai thành phố x, y nối trực tiếp nếu có ước chung z với z > threshold. Với mỗi queries[i] = [a, b], cho biết a và b có liên thông không.",
      en: "Given n cities 1..n. Two cities x, y are directly connected if they share a common divisor z with z > threshold. For each queries[i] = [a, b], report whether a and b are connected.",
    },
    defaultInput: [6],
    inputKind: "positive",
    singleInput: true,
    inputLabel: { vi: "n — số node (nhập 1 số)", en: "n — number of nodes (one number)" },
    extraParams: [
      { key: "threshold", type: "number", label: { vi: "threshold", en: "threshold" }, default: 1, min: 0 },
      { key: "queries", type: "string", label: { vi: "queries: a,b;... hoặc JSON", en: "queries: a,b;... or JSON" }, default: "1,5;2,6;3,4;5,6" },
    ],
    approach: [
      { vi: "Không cần xét từng cặp. Với mỗi z từ threshold+1 tới n, mọi bội số của z đều chia hết cho z (> threshold) nên cùng một nhóm.", en: "No need to test each pair. For each z from threshold+1 to n, all multiples of z are divisible by z (> threshold), so they share a group." },
      { vi: "Dùng Union-Find: union(z, 2z), union(z, 3z), ... để gộp các bội số vào chung component.", en: "Use Union-Find: union(z, 2z), union(z, 3z), ... to merge multiples into one component." },
      { vi: "Sau khi gộp xong, mỗi truy vấn [a, b] chỉ cần kiểm tra find(a) == find(b).", en: "After merging, each query [a, b] just checks find(a) == find(b)." },
    ],
    complexity: {
      time: "O(n log n · α(n) + q)",
      space: "O(n)",
      note: { vi: "Tổng số lần union là O(n/2 + n/3 + …) ≈ O(n log n); mỗi truy vấn gần O(1).", en: "The union count is O(n/2 + n/3 + …) ≈ O(n log n); each query is effectively O(1)." },
    },
    code: [
      "class Solution:",
      "    def areConnected(self, n, threshold, queries):",
      "        parent = list(range(n + 1))",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "        for z in range(threshold + 1, n + 1):",
      "            for m in range(2 * z, n + 1, z):",
      "                parent[find(z)] = find(m)",
      "        return [find(a) == find(b) for a, b in queries]",
    ],
    builder: buildSteps1627,
    liveArgs(input, params = {}) {
      const n = Array.isArray(input) ? Number(input[0]) : Number(input);
      return [n, Number(params.threshold), mstParseMatrix(params.queries, 2, "queries")];
    },
  },
  1135: {
    id: 1135,
    difficulty: "medium",
    premium: true,
    slug: "connecting-cities-with-minimum-cost",
    category: UF_CAT,
    tags: [
      { key: "mst", vi: "Cây khung nhỏ nhất (MST)", en: "Minimum Spanning Tree (MST)" },
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
    ],
    title: { vi: "Connecting Cities With Minimum Cost", en: "Connecting Cities With Minimum Cost" },
    titleVi: { vi: "Nối các thành phố với chi phí nhỏ nhất (MST - Kruskal)", en: "Connecting cities with minimum cost (MST - Kruskal)" },
    statement: {
      vi: "Có n thành phố (1..n) và danh sách connections[i] = [u, v, cost] là chi phí nối trực tiếp hai thành phố. Tìm chi phí nhỏ nhất để mọi thành phố liên thông. Nếu không thể, trả về -1.",
      en: "There are n cities (1..n) and connections[i] = [u, v, cost] is the cost to directly connect two cities. Return the minimum cost so every city is connected; return -1 if impossible.",
    },
    defaultInput: [6],
    inputKind: "positive",
    singleInput: true,
    inputLabel: { vi: "n — số thành phố (nhập 1 số)", en: "n — number of cities (one number)" },
    extraParams: [{
      key: "connections", type: "string",
      label: { vi: "connections: u,v,cost;... hoặc JSON", en: "connections: u,v,cost;... or JSON" },
      default: "1,2,3;1,3,4;2,3,1;3,4,2;4,5,5;5,6,2;4,6,6;2,5,7",
    }],
    approach: [
      { vi: "Đây là bài Cây khung nhỏ nhất (MST): giữ toàn bộ thành phố liên thông với tổng trọng số nhỏ nhất.", en: "This is a Minimum Spanning Tree (MST): keep all cities connected with the least total weight." },
      { vi: "Kruskal: sort mọi cạnh theo chi phí tăng dần rồi duyệt từ rẻ đến đắt.", en: "Kruskal: sort every edge by increasing cost, then scan from cheapest to most expensive." },
      { vi: "Dùng Union-Find: chỉ chọn cạnh nối hai component khác nhau (find(u) ≠ find(v)); cạnh trong cùng component bị bỏ vì tạo chu trình.", en: "Use Union-Find: take an edge only when it joins two different components (find(u) ≠ find(v)); same-component edges are skipped as cycles." },
      { vi: "MST của n node cần đúng n-1 cạnh. Nếu chọn đủ n-1 cạnh → trả tổng chi phí; nếu không → -1.", en: "An MST over n nodes needs exactly n-1 edges. If n-1 edges are chosen → return the total; otherwise → -1." },
    ],
    complexity: {
      time: "O(E log E)",
      space: "O(n + E)",
      note: { vi: "Chi phí chính là sort E cạnh; các thao tác DSU gần O(1).", en: "The cost is dominated by sorting E edges; DSU operations are effectively O(1)." },
    },
    code: [
      "class Solution:",
      "    def minimumCost(self, n, connections):",
      "        connections.sort(key=lambda c: c[2])",
      "        parent = list(range(n + 1))",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "        total = 0",
      "        used = 0",
      "        for u, v, w in connections:",
      "            ru, rv = find(u), find(v)",
      "            if ru != rv:",
      "                parent[ru] = rv",
      "                total += w",
      "                used += 1",
      "        return total if used == n - 1 else -1",
    ],
    builder: buildSteps1135,
    liveArgs(input, params = {}) {
      const n = Array.isArray(input) ? Number(input[0]) : Number(input);
      return [n, mstParseMatrix(params.connections, 3, "connections")];
    },
  },
  1168: {
    id: 1168,
    difficulty: "hard",
    premium: true,
    slug: "optimize-water-distribution-in-a-village",
    category: UF_CAT,
    tags: [
      { key: "mst", vi: "Cây khung nhỏ nhất (MST)", en: "Minimum Spanning Tree (MST)" },
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: { vi: "Optimize Water Distribution in a Village", en: "Optimize Water Distribution in a Village" },
    titleVi: { vi: "Tối ưu phân phối nước trong làng", en: "Optimize water distribution in a village" },
    statement: {
      vi: "Có n ngôi nhà. wells[i] là chi phí xây giếng tại nhà i+1; pipes[j]=[u,v,cost] là chi phí nối ống giữa hai nhà. Mỗi nhà phải nhận được nước trực tiếp từ giếng hoặc qua một chuỗi ống. Tìm tổng chi phí nhỏ nhất.",
      en: "There are n houses. wells[i] is the cost to build a well at house i+1; pipes[j]=[u,v,cost] is the cost to connect two houses. Every house must receive water directly from a well or through pipes. Return the minimum total cost.",
    },
    defaultInput: [1, 2, 2],
    inputKind: "positive",
    inputLabel: { vi: "wells — chi phí giếng tại nhà 1..n", en: "wells — well cost for houses 1..n" },
    extraParams: [{ key: "pipes", type: "string", label: { vi: "pipes: u,v,cost;... hoặc JSON", en: "pipes: u,v,cost;... or JSON" }, default: "1,2,1;2,3,1" }],
    approach: [
      { vi: "Thêm node ảo 0 đại diện nguồn nước vô hạn. Xây giếng tại nhà i trở thành cạnh (0,i) có trọng số wells[i-1].", en: "Add virtual node 0 as an unlimited water source. Building a well at house i becomes edge (0,i) weighted wells[i-1]." },
      { vi: "Gộp cạnh giếng và cạnh ống, sort theo chi phí rồi chạy Kruskal. Chỉ chọn cạnh nối hai component khác nhau.", en: "Combine well and pipe edges, sort by cost, and run Kruskal. Select only edges joining different components." },
      { vi: "Đồ thị có n+1 node nên MST cần n cạnh. Khi đủ n cạnh, mọi nhà đều nối tới ít nhất một giếng qua node 0.", en: "The graph has n+1 nodes, so its MST needs n edges. Once n edges are selected, every house reaches at least one well through node 0." },
    ],
    complexity: {
      time: "O((n + p) log(n + p))",
      space: "O(n + p)",
      note: { vi: "Sort n cạnh giếng và p cạnh ống; các thao tác DSU gần O(1).", en: "Sort n well edges and p pipe edges; DSU operations are effectively O(1)." },
    },
    code: [
      "class Solution:",
      "    def minCostToSupplyWater(self, n, wells, pipes):",
      "        edges = [(cost, 0, house) for house, cost in enumerate(wells, 1)]",
      "        for u, v, cost in pipes:",
      "            edges.append((cost, u, v))",
      "        edges.sort()",
      "        parent = list(range(n + 1))",
      "        size = [1] * (n + 1)",
      "",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "",
      "        def union(x, y):",
      "            root_x, root_y = find(x), find(y)",
      "            if root_x == root_y:",
      "                return False",
      "            if size[root_x] < size[root_y]:",
      "                root_x, root_y = root_y, root_x",
      "            parent[root_y] = root_x",
      "            size[root_x] += size[root_y]",
      "            return True",
      "",
      "        total = 0",
      "        used = 0",
      "        for cost, u, v in edges:",
      "            if union(u, v):",
      "                total += cost",
      "                used += 1",
      "                if used == n:",
      "                    break",
      "        return total",
    ],
    builder: buildSteps1168,
    liveArgs(input, params = {}) {
      const { n, wells, pipes } = parse1168Data(input, params.pipes);
      return [n, wells, pipes];
    },
  },
  803: {
    id: 803,
    difficulty: "hard",
    slug: "bricks-falling-when-hit",
    category: UF_CAT,
    title: { vi: "Bricks Falling When Hit", en: "Bricks Falling When Hit" },
    titleVi: { vi: "Gạch rơi khi bị đập", en: "Bricks falling when hit" },
    statement: {
      vi: "Cho grid nhị phân và danh sách hits. Sau mỗi hit, xóa brick tại vị trí đó rồi đếm số brick không còn nối với hàng trên cùng và bị rơi.",
      en: "Given a binary grid and a list of hits, remove the hit brick and count how many bricks are no longer connected to the top row and fall after each hit.",
    },
    defaultInput: "[[1,0,0,0],[1,1,1,0]]",
    inputKind: "string",
    inputLabel: { vi: "Grid JSON, ví dụ [[1,0,0,0],[1,1,1,0]]", en: "JSON grid, e.g. [[1,0,0,0],[1,1,1,0]]" },
    extraParams: [{ key: "hits", type: "string", label: { vi: "hits JSON", en: "JSON hits" }, default: "[[1,0]]" }],
    approach: [
      { vi: "Xóa trước tất cả hit có hiệu lực trên bản sao grid; hit trùng hoặc hit ô rỗng được ghi nhận để trả 0.", en: "Remove every effective hit from a grid copy first; duplicate or empty-cell hits are tracked so they return 0." },
      { vi: "Xây DSU trên grid còn lại và nối brick hàng đầu với virtual roof. Size component của roof cho biết số brick ổn định + 1.", en: "Build a DSU over the remaining grid and connect top-row bricks to a virtual roof. The roof component size equals stable bricks + 1." },
      { vi: "Duyệt hits ngược, khôi phục từng brick và union 4 hướng. Số brick rơi = max(0, afterRoof − beforeRoof − 1).", en: "Process hits backward, restore each brick, and union four directions. Fallen bricks = max(0, afterRoof − beforeRoof − 1)." },
    ],
    complexity: {
      time: "O((R·C + H)·α(R·C))",
      space: "O(R·C + H)",
      note: { vi: "Mỗi brick/cạnh được union số lần hằng số; α là inverse Ackermann gần như O(1).", en: "Every brick/edge is unioned a constant number of times; inverse Ackermann α is effectively constant." },
    },
    code: [
      "class Solution:",
      "    def hitBricks(self, grid, hits):",
      "        rows, cols = len(grid), len(grid[0])",
      "        work = [row[:] for row in grid]",
      "        effective = []",
      "        for r, c in hits:",
      "            removed = work[r][c] == 1",
      "            effective.append(removed)",
      "            if removed:",
      "                work[r][c] = 0",
      "",
      "        roof = rows * cols",
      "        parent = list(range(roof + 1))",
      "        size = [1] * (roof + 1)",
      "",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "",
      "        def union(a, b):",
      "            root_a, root_b = find(a), find(b)",
      "            if root_a == root_b: return",
      "            if size[root_a] < size[root_b]:",
      "                root_a, root_b = root_b, root_a",
      "            parent[root_b] = root_a",
      "            size[root_a] += size[root_b]",
      "",
      "        def index(r, c):",
      "            return r * cols + c",
      "",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if work[r][c] == 1:",
      "                    cell = index(r, c)",
      "                    if r == 0: union(cell, roof)",
      "                    if r > 0 and work[r-1][c]: union(cell, index(r-1, c))",
      "                    if c > 0 and work[r][c-1]: union(cell, index(r, c-1))",
      "",
      "        answer = [0] * len(hits)",
      "        for i in range(len(hits)-1, -1, -1):",
      "            if not effective[i]:",
      "                continue",
      "            r, c = hits[i]",
      "            before = size[find(roof)]",
      "            work[r][c] = 1",
      "            cell = index(r, c)",
      "            if r == 0: union(cell, roof)",
      "            for dr, dc in ((-1,0),(1,0),(0,-1),(0,1)):",
      "                nr, nc = r + dr, c + dc",
      "                if 0 <= nr < rows and 0 <= nc < cols and work[nr][nc]:",
      "                    union(cell, index(nr, nc))",
      "            after = size[find(roof)]",
      "            answer[i] = max(0, after - before - 1)",
      "",
      "        return answer",
    ],
    builder: buildSteps803,
    liveArgs(input, params = {}) {
      const { grid, hits } = parse803Data(input, params.hits || "");
      return [grid, hits];
    },
  },
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
  685: {
    id: 685,
    difficulty: "hard",
    slug: "redundant-connection-ii",
    category: UF_CAT,
    tags: [
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
      { key: "directed-graph", vi: "Đồ thị có hướng", en: "Directed Graph" },
    ],
    title: { vi: "Redundant Connection II", en: "Redundant Connection II" },
    titleVi: { vi: "Cạnh dư trong đồ thị có hướng", en: "Redundant edge in a directed graph" },
    statement: {
      vi: "Cho đồ thị có hướng vốn là rooted tree nhưng được thêm đúng một cạnh. Tìm cạnh cần xóa để đồ thị trở lại rooted tree. Nhập các cạnh dạng u,v;u,v (u -> v).",
      en: "Given a directed graph that was a rooted tree with one extra edge, return the edge to remove so it becomes a rooted tree again. Enter edges as u,v;u,v (u -> v).",
    },
    defaultInput: "1,2;1,3;2,3",
    inputKind: "string",
    inputLabel: { vi: "Cạnh có hướng u,v;u,v (u -> v)", en: "Directed edges u,v;u,v (u -> v)" },
    extraParams: [],
    approach: [
      { vi: "Quét incoming parent: nếu một node nhận hai cạnh, lưu first (đến trước) và second (đến sau).", en: "Scan incoming parents: if a node receives two edges, save first (earlier) and second (later)." },
      { vi: "Dùng Union-Find thêm các cạnh, nhưng tạm bỏ second. Cạnh nối hai node đã cùng component tạo cycle.", en: "Use Union-Find to add edges, temporarily skipping second. An edge joining already-connected nodes forms a cycle." },
      { vi: "Không có hai parent: xóa cạnh cycle. Có hai parent: nếu vẫn cycle thì xóa first, nếu không thì xóa second.", en: "With no two-parent node, remove the cycle edge. With two parents, remove first if a cycle remains; otherwise remove second." },
    ],
    complexity: {
      time: "O(n * alpha(n))",
      space: "O(n)",
      note: { vi: "Hai lượt duyệt cạnh; thao tác Union-Find gần như O(1).", en: "Two passes over edges; Union-Find operations are effectively O(1)." },
    },
    code: [
      "class Solution:",
      "    def findRedundantDirectedConnection(self, edges):",
      "        n = len(edges)",
      "        incoming = [0] * (n + 1)",
      "        first = second = None; skip = -1",
      "        for i, (u, v) in enumerate(edges):",
      "            if incoming[v] != 0:",
      "                first = [incoming[v], v]",
      "                second = [u, v]; skip = i",
      "            else:",
      "                incoming[v] = u",
      "        uf = list(range(n + 1))",
      "        cycle = None",
      "        def find(x):",
      "            while uf[x] != x:",
      "                uf[x] = uf[uf[x]]",
      "                x = uf[x]",
      "            return x",
      "        for i, (u, v) in enumerate(edges):",
      "            if i == skip: continue",
      "            ru, rv = find(u), find(v)",
      "            if ru == rv: cycle = [u, v]; break",
      "            uf[ru] = rv",
      "        if first is None: return cycle",
      "        return first if cycle else second",
    ],
    builder: buildSteps685,
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
  947: {
    id: 947,
    difficulty: "medium",
    slug: "most-stones-removed-with-same-row-or-column",
    category: UF_CAT,
    tags: [
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
    ],
    title: { vi: "Most Stones Removed with Same Row or Column", en: "Most Stones Removed with Same Row or Column" },
    titleVi: { vi: "Bỏ tối đa đá cùng hàng hoặc cột", en: "Remove maximum stones sharing a row or column" },
    statement: {
      vi: "Mỗi đá nằm tại (row,col). Có thể bỏ một đá nếu còn ít nhất một đá khác cùng hàng hoặc cùng cột. Tìm số đá bỏ tối đa. Nhập tọa độ dạng row,col;row,col;...",
      en: "Each stone lies at (row,col). A stone can be removed if another stone remains in the same row or column. Find the maximum removals. Enter coordinates as row,col;row,col;...",
    },
    defaultInput: "0,0;0,1;1,0;1,2;2,1;2,2",
    inputKind: "string",
    inputLabel: { vi: "Stones (row,col; row,col; ...)", en: "Stones (row,col; row,col; ...)" },
    extraParams: [],
    approach: [
      { vi: "Không cần coi mỗi đá là node: coi MỖI HÀNG và MỖI CỘT xuất hiện là một node DSU.", en: "Do not make stones the DSU nodes: make every USED ROW and USED COLUMN a DSU node." },
      { vi: "Một đá (r,c) là cạnh nối row r với column c. Union hai node này cho mỗi đá.", en: "A stone (r,c) is an edge connecting row r to column c. Union these two nodes for each stone." },
      { vi: "Trong một component có k đá, luôn bỏ được k−1 đá: chỉ cần giữ một đá cuối để component không biến mất.", en: "A component with k stones always allows k−1 removals: keep one final stone so that component remains." },
      { vi: "Kết quả = số đá − số component DSU (chỉ tính các row/column có xuất hiện).", en: "Answer = stone count − DSU component count (among used rows/columns only)." },
    ],
    complexity: { time: "O(N · α(N))", space: "O(N)", note: { vi: "N là số đá; DSU chứa nhiều nhất 2N node hàng/cột.", en: "N is the number of stones; the DSU has at most 2N row/column nodes." } },
    code: [
      "class Solution:",
      "    def removeStones(self, stones):",
      "        parent = {}",
      "        def find(x):",
      "            parent.setdefault(x, x)",
      "            if parent[x] != x:",
      "                parent[x] = find(parent[x])",
      "            return parent[x]",
      "        def union(a, b):",
      "            parent[find(a)] = find(b)",
      "        for row, col in stones:",
      "            union((\"row\", row), (\"col\", col))",
      "        return len(stones) - len({find(node) for node in parent})",
    ],
    builder: buildSteps947,
  },
  1061: {
    id: 1061,
    difficulty: "medium",
    slug: "lexicographically-smallest-equivalent-string",
    category: UF_CAT,
    tags: [
      { key: "string", vi: "Chuỗi", en: "String" },
      { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
    ],
    title: { vi: "Lexicographically Smallest Equivalent String", en: "Lexicographically Smallest Equivalent String" },
    titleVi: { vi: "Chuỗi tương đương nhỏ nhất theo từ điển", en: "Lexicographically smallest equivalent string" },
    statement: {
      vi: "s1[i] và s2[i] là hai chữ tương đương. Thay mỗi chữ của baseStr bằng chữ nhỏ nhất trong nhóm tương đương của nó. Nhập theo thứ tự s1;s2;baseStr.",
      en: "s1[i] and s2[i] are equivalent letters. Replace every baseStr letter with the smallest letter in its equivalence group. Enter s1;s2;baseStr.",
    },
    defaultInput: "parker;morris;parser",
    inputKind: "string",
    inputLabel: { vi: "s1;s2;baseStr (vd: parker;morris;parser)", en: "s1;s2;baseStr (e.g. parker;morris;parser)" },
    extraParams: [],
    approach: [
      { vi: "Dùng 26 node cho a..z. Một cặp s1[i]~s2[i] nghĩa là hai node thuộc cùng component.", en: "Use 26 nodes for a..z. A pair s1[i]~s2[i] means the nodes belong to one component." },
      { vi: "Để root luôn là chữ nhỏ nhất, union gắn root lớn hơn vào root nhỏ hơn.", en: "To make the root always the smallest letter, union attaches the larger root to the smaller root." },
      { vi: "Sau khi gộp hết cặp, find(ch) trả về chính lựa chọn nhỏ nhất cho ch.", en: "After merging all pairs, find(ch) directly returns ch's smallest possible replacement." },
    ],
    complexity: { time: "O((|s1| + |baseStr|) · α(26))", space: "O(26)", note: { vi: "Chỉ có 26 chữ thường; find/union gần như hằng số.", en: "There are only 26 lowercase letters; find/union are effectively constant time." } },
    code: [
      "class Solution:",
      "    def smallestEquivalentString(self, s1, s2, baseStr):",
      "        parent = list(range(26))",
      "        def find(x):",
      "            if parent[x] != x:",
      "                parent[x] = find(parent[x])",
      "            return parent[x]",
      "        for a, b in zip(s1, s2):",
      "            ra, rb = find(ord(a)-97), find(ord(b)-97)",
      "            parent[max(ra, rb)] = min(ra, rb)",
      "        return ''.join(chr(find(ord(ch)-97)+97) for ch in baseStr)",
    ],
    builder: buildSteps1061,
  },
  305: {
    id: 305,
    difficulty: "hard",
    slug: "number-of-islands-ii",
    category: UF_CAT,
    tags: [
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
    ],
    title: { vi: "Number of Islands II", en: "Number of Islands II" },
    titleVi: { vi: "Đếm đảo khi thêm đất liên tiếp", en: "Count islands while adding land" },
    statement: {
      vi: "Ban đầu grid m×n toàn nước. Với mỗi position, đổi ô đó thành đất và trả về số đảo sau từng lần thêm. Nhập m,n;row,col;row,col;...",
      en: "An m×n grid starts as all water. For each position, change that cell to land and return the island count after each addition. Enter m,n;row,col;row,col;...",
    },
    defaultInput: "3,3;0,0;0,1;1,2;2,1;1,1",
    inputKind: "string",
    inputLabel: { vi: "m,n; positions row,col; ...", en: "m,n; positions row,col; ..." },
    extraParams: [],
    approach: [
      { vi: "DSU có m×n node; parent[id] = −1 nghĩa là ô vẫn là nước.", en: "The DSU has m×n nodes; parent[id] = −1 means the cell is still water." },
      { vi: "Mỗi ô đất mới tạm tạo một đảo, nên islands tăng 1.", en: "Every newly added land cell temporarily creates one island, so islands increases by 1." },
      { vi: "Kiểm tra bốn hàng xóm. Nếu hàng xóm là đất và union thành công, hai đảo gộp lại nên islands giảm 1.", en: "Check four neighbors. If a neighbor is land and union succeeds, two islands merge so islands decreases by 1." },
      { vi: "Ghi islands vào output sau mỗi position: đây là đáp án online.", en: "Append islands after every position: this is the online answer." },
    ],
    complexity: { time: "O(P · α(m·n))", space: "O(m·n)", note: { vi: "P là số lần thêm đất; mỗi lần chỉ kiểm tra tối đa bốn hàng xóm.", en: "P is the number of land additions; each checks at most four neighbors." } },
    code: [
      "class Solution:",
      "    def numIslands2(self, m, n, positions):",
      "        parent = [-1] * (m * n)",
      "        size = [0] * (m * n)",
      "        answer, islands = [], 0",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "        def union(a, b):",
      "            ra, rb = find(a), find(b)",
      "            if ra == rb: return False",
      "            if size[ra] < size[rb]: ra, rb = rb, ra",
      "            parent[rb] = ra",
      "            size[ra] += size[rb]",
      "            return True",
      "        for row, col in positions:",
      "            node = row * n + col",
      "            if parent[node] != -1:",
      "                answer.append(islands); continue",
      "            parent[node] = node; size[node] = 1",
      "            islands += 1",
      "            for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):",
      "                nr, nc = row + dr, col + dc",
      "                if 0 <= nr < m and 0 <= nc < n and parent[nr*n+nc] != -1:",
      "                    if union(node, nr*n+nc):",
      "                        islands -= 1",
      "            answer.append(islands)",
      "        return answer",
    ],
    builder: buildSteps305,
  },
  990: {
    id: 990,
    difficulty: "medium",
    slug: "satisfiability-of-equality-equations",
    category: UF_CAT,
    tags: [
      { key: "string", vi: "Chuỗi", en: "String" },
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
    ],
    title: { vi: "Satisfiability of Equality Equations", en: "Satisfiability of Equality Equations" },
    titleVi: { vi: "Kiểm tra các phương trình bằng / khác (Union-Find)", en: "Check equality / inequality equations (Union-Find)" },
    statement: {
      vi: "Cho danh sách phương trình dạng a==b hoặc a!=b. Hãy cho biết có thể gán giá trị cho các biến để TẤT CẢ phương trình cùng đúng không. Nhập các phương trình cách nhau bằng dấu phẩy hoặc chấm phẩy.",
      en: "Given equations of the form a==b or a!=b, determine whether values can be assigned so that ALL equations are true. Enter equations separated by commas or semicolons.",
    },
    defaultInput: "a==b,b!=c,c==a",
    inputKind: "string",
    inputLabel: { vi: "Phương trình: a==b,b!=c,c==a", en: "Equations: a==b,b!=c,c==a" },
    extraParams: [],
    approach: [
      { vi: "Mỗi chữ cái là một node. parent[x] cho biết node cha; root của một node là đại diện của nhóm các chữ buộc phải bằng nhau.", en: "Each letter is a node. parent[x] stores its parent; a node's root represents the group of letters forced to be equal." },
      { vi: "Pass 1: xử lý TẤT CẢ dấu == trước bằng union(a, b). Như vậy mọi hệ quả bắc cầu cũng nằm chung nhóm: a==b và b==c ⇒ a==c.", en: "Pass 1: process EVERY == first with union(a, b). This also captures transitive consequences: a==b and b==c ⇒ a==c." },
      { vi: "Pass 2: với mỗi a!=b, so sánh find(a) và find(b). Nếu cùng root thì các dấu == đã ép a và b bằng nhau → mâu thuẫn → False.", en: "Pass 2: for each a!=b, compare find(a) and find(b). If they share a root, == equations have forced a and b equal → contradiction → False." },
      { vi: "Nếu mọi dấu != có root khác nhau thì không có mâu thuẫn → True. Path compression và union by size giúp các lần find/union gần O(1).", en: "If every != has different roots, there is no contradiction → True. Path compression and union by size make find/union nearly O(1)." },
    ],
    complexity: {
      time: "O(E · α(26)) ≈ O(E)",
      space: "O(26) ≈ O(1)",
      note: { vi: "E là số phương trình. Mỗi phương trình được duyệt tối đa hai lần; α là inverse Ackermann, gần như hằng số.", en: "E is the number of equations. Each equation is scanned at most twice; α is inverse Ackermann, effectively constant." },
    },
    code: [
      "class Solution:",
      "    def equationsPossible(self, equations):",
      "        parent = list(range(26))",
      "        size = [1] * 26",
      "",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "",
      "        def union(a, b):",
      "            root_a, root_b = find(a), find(b)",
      "            if root_a == root_b:",
      "                return",
      "            if size[root_a] < size[root_b]:",
      "                root_a, root_b = root_b, root_a",
      "            parent[root_b] = root_a",
      "            size[root_a] += size[root_b]",
      "",
      "        for equation in equations:",
      "            if equation[1:3] == '==':",
      "                union(ord(equation[0]) - 97, ord(equation[3]) - 97)",
      "",
      "        for equation in equations:",
      "            if equation[1:3] == '!=' and find(ord(equation[0]) - 97) == find(ord(equation[3]) - 97):",
      "                return False",
      "        return True",
    ],
    builder: buildSteps990,
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
    extraParams: [
      { key: "n", label: { vi: "n (số người)", en: "n (number of people)" }, default: 5 },
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: parent inline + iterative find", en: "Approach 1: inline parent + iterative find" } },
          { value: "2", label: { vi: "Cách 2: class UnionFind + recursive find", en: "Approach 2: UnionFind class + recursive find" } },
        ],
      },
    ],
    approach: [
      { vi: "Cả hai cách đều sort logs theo timestamp tăng dần rồi thêm từng cạnh friendship vào DSU.", en: "Both approaches sort logs by timestamp and add friendship edges to the DSU one at a time." },
      { vi: "Cách 1: dùng parent/components trực tiếp trong Solution và iterative find với path halving.", en: "Approach 1: keep parent/components directly in Solution and use iterative find with path halving." },
      { vi: "Cách 2: đóng gói root, rank và count trong class UnionFind; recursive find thực hiện path compression rõ từng bước.", en: "Approach 2: encapsulate root, rank, and count in a UnionFind class; recursive find performs visible path compression." },
      { vi: "Mỗi union thành công giảm component count đi 1. Khi count = 1, timestamp hiện tại là đáp án sớm nhất.", en: "Every successful union decreases the component count by one. When count = 1, the current timestamp is the earliest answer." },
    ],
    complexity: {
      time: "O(m log m + m·α(n))",
      space: "O(n)",
      note: { vi: "m = số logs; sort tốn O(m log m), còn find/union có amortized α(n).", en: "m is the number of logs; sorting costs O(m log m), while find/union take amortized α(n)." },
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
    code2: [
      "from typing import List",
      "",
      "class UnionFind:",
      "    def __init__(self, n):",
      "        self.root = [i for i in range(n)]",
      "        self.rank = [1 for _ in range(n)]",
      "        self.count = n",
      "",
      "    def find(self, x):",
      "        if x == self.root[x]:",
      "            return x",
      "        root_x = self.find(self.root[x])",
      "        self.root[x] = root_x  # path compression",
      "        return root_x",
      "",
      "    def union(self, x, y):",
      "        root_x = self.find(x)",
      "        root_y = self.find(y)",
      "        if root_x == root_y:",
      "            return",
      "        if self.rank[root_x] > self.rank[root_y]:",
      "            self.root[root_y] = root_x",
      "        elif self.rank[root_x] < self.rank[root_y]:",
      "            self.root[root_x] = root_y",
      "        else:",
      "            self.root[root_y] = root_x",
      "            self.rank[root_x] += 1",
      "        self.count -= 1",
      "",
      "    def is_connected(self, x, y):",
      "        return self.find(x) == self.find(y)",
      "",
      "    def get_count(self):",
      "        return self.count",
      "",
      "class Solution:",
      "    def earliestAcq(self, logs: List[List[int]], n: int) -> int:",
      "        uf = UnionFind(n)",
      "        logs.sort(key=lambda x: x[0])",
      "        for log in logs:",
      "            time, u, v = log",
      "            uf.union(u, v)",
      "            if uf.get_count() == 1:",
      "                return time",
      "        return -1",
    ],
    codeLabel: { vi: "Cách 1: parent inline + iterative find", en: "Approach 1: inline parent + iterative find" },
    code2Label: { vi: "Cách 2: class UnionFind + recursive path compression", en: "Approach 2: UnionFind class + recursive path compression" },
    builder: buildSteps1101,
    builder2: buildSteps1101ExplicitUnionFind,
    liveArgs(input, params = {}) {
      const { n, logs } = parse1101Data(input, params);
      return [logs, n];
    },
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
  1697: {
    id: 1697,
    difficulty: "hard",
    slug: "checking-existence-of-edge-length-limited-paths",
    category: UF_CAT,
    title: { vi: "Checking Existence of Edge Length Limited Paths", en: "Checking Existence of Edge Length Limited Paths" },
    titleVi: { vi: "Kiểm tra đường đi giới hạn độ dài cạnh (offline Union-Find)", en: "Edge length limited paths (offline Union-Find)" },
    statement: {
      vi:
        "Cho n node và edgeList[i]=[u,v,dist]. Mỗi query [p,q,limit]: có đường p→q chỉ dùng các cạnh có dist < limit không? " +
        "Trả về mảng boolean. Nhập cạnh 'u,v,dist' cách bởi ';'; n và queries 'p,q,limit;...' trong tham số.",
      en:
        "Given n nodes and edgeList[i]=[u,v,dist]. Each query [p,q,limit]: is there a path p→q using only edges with dist < limit? " +
        "Return a boolean array. Enter edges as 'u,v,dist' separated by ';'; n and queries 'p,q,limit;...' as parameters.",
    },
    defaultInput: "0,1,2;1,2,4;2,0,8;1,0,16",
    inputKind: "string",
    inputLabel: { vi: "edges (u,v,dist; cách bởi ;)", en: "edges (u,v,dist; separated by ;)" },
    extraParams: [
      { key: "n", label: { vi: "n (số node)", en: "n (nodes)" }, default: 3 },
      { key: "queries", label: { vi: "queries (p,q,limit; cách bởi ;)", en: "queries (p,q,limit; separated by ;)" }, type: "string", default: "0,1,2;0,2,5" },
    ],
    approach: [
      { vi: "OFFLINE: sắp cạnh theo dist tăng dần, sắp query theo limit tăng dần.", en: "OFFLINE: sort edges by increasing dist, sort queries by increasing limit." },
      { vi: "Quét query theo limit tăng: gộp (union) mọi cạnh có dist < limit — con trỏ ei không bao giờ lùi.", en: "Sweep queries by increasing limit: union every edge with dist < limit — the pointer ei never rewinds." },
      { vi: "Sau khi gộp, query đúng khi find(p) == find(q) (p, q cùng nhóm).", en: "After unioning, a query is true when find(p) == find(q) (p and q share a group)." },
      { vi: "Ghi đáp án về đúng vị trí query gốc.", en: "Write the answer back to the original query index." },
    ],
    complexity: {
      time: "O(E log E + Q log Q + (E+Q)·α)",
      space: "O(n + Q)",
      note: {
        vi: "Sắp cạnh và query chiếm phần lớn; Union-Find gần như O(1) mỗi thao tác.",
        en: "Sorting edges and queries dominates; Union-Find is near O(1) per operation.",
      },
    },
    code: [
      "class Solution:",
      "    def distanceLimitedPathsExist(self, n, edgeList, queries):",
      "        edgeList.sort(key=lambda e: e[2])",
      "        order = sorted(range(len(queries)), key=lambda i: queries[i][2])",
      "        parent = list(range(n))",
      "        def find(x):",
      "            while parent[x] != x:",
      "                parent[x] = parent[parent[x]]",
      "                x = parent[x]",
      "            return x",
      "        answer = [False] * len(queries)",
      "        ei = 0",
      "        for i in order:",
      "            p, q, limit = queries[i]",
      "            while ei < len(edgeList) and edgeList[ei][2] < limit:",
      "                parent[find(edgeList[ei][0])] = find(edgeList[ei][1])",
      "                ei += 1",
      "            answer[i] = find(p) == find(q)",
      "        return answer",
    ],
    builder: buildSteps1697,
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

function buildSteps1970(input, params = {}) {
  const rows = Number(params.rows || params.row || 2);
  const cols = Number(params.cols || params.col || 2);
  const cells = String(input).split(/[;|]/).map((part) => part.trim()).filter(Boolean)
    .map((part) => part.split(",").map((value) => Number(value.trim()) - 1));
  const total = rows * cols;
  const top = total, bottom = total + 1;
  const parent = Array.from({ length: total + 2 }, (_, i) => i);
  const size = new Array(total + 2).fill(1);
  const open = Array.from({ length: rows }, () => Array(cols).fill(false));
  const steps = [];
  const id = (r, c) => r * cols + c;
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a, b) => {
    let ra = find(a), rb = find(b);
    if (ra === rb) return false;
    if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    size[ra] += size[rb];
    return true;
  };
  const connected = () => find(top) === find(bottom);
  const gridCells = (current = null) => open.map((row, r) => row.map((isOpen, c) => ({
    label: isOpen ? "O" : "X",
    cls: current && current[0] === r && current[1] === c ? "current" : isOpen ? "visited" : "wall",
  })));
  function push(day, title, codeLines, current, vars, note, final = false) {
    steps.push({
      title,
      arr: parent.slice(0, total),
      sub: parent.slice(0, total).map((p, i) => `p${i}=${p}`),
      highlight: current ? [id(current[0], current[1])] : [],
      mark: [],
      final,
      codeLines,
      vars: [{ name: "day", value: day }, { name: "connected", value: connected() }, ...vars],
      note,
      bfsGrid: { rows, cols, cells: gridCells(current) },
    });
  }

  push(cells.length, { vi: "Bắt đầu từ ngày cuối: toàn nước", en: "Start from final day: all water" }, [3, 4], null, [{ name: "rows,cols", value: `${rows},${cols}` }], { vi: "Đi ngược thời gian: thêm lại đất, union với hàng xóm đất.", en: "Go backward in time: add land back and union adjacent land cells." });
  for (let day = cells.length - 1; day >= 0; day--) {
    const [r, c] = cells[day];
    open[r][c] = true;
    const cur = id(r, c);
    if (r === 0) union(cur, top);
    if (r === rows - 1) union(cur, bottom);
    push(day, { vi: `Mở lại ô (${r},${c})`, en: `Open cell (${r},${c})` }, [5, 6, 7], [r, c], [{ name: "cell", value: `(${r},${c})` }], { vi: "Ô bị flood ở ngày này được thêm lại làm đất.", en: "The cell flooded on this day is added back as land." });
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || !open[nr][nc]) continue;
      union(cur, id(nr, nc));
      push(day, { vi: `Union với (${nr},${nc})`, en: `Union with (${nr},${nc})` }, [8, 9, 10], [nr, nc], [{ name: "neighbor", value: `(${nr},${nc})` }], { vi: "Kết nối hai ô đất kề nhau.", en: "Connect adjacent land cells." });
    }
    if (connected()) {
      push(day, { vi: `Ngày cuối còn crossing = ${day}`, en: `Latest crossing day = ${day}` }, [11, 12], [r, c], [{ name: "answer", value: day }], { vi: "Khi đi ngược, lần đầu top nối bottom chính là ngày cuối vẫn băng qua được.", en: "In reverse time, the first top-bottom connection is the latest day crossing is possible." }, true);
      return { original: cells, answer: day, steps };
    }
  }
  push(0, { vi: "Không có ngày crossing", en: "No crossing day" }, [13], null, [{ name: "answer", value: 0 }], { vi: "Không tạo được kết nối trên-dưới.", en: "No top-bottom connection was created." }, true);
  return { original: cells, answer: 0, steps };
}

Object.assign(module.exports, {
  1970: {
    id: 1970,
    difficulty: "hard",
    slug: "last-day-where-you-can-still-cross",
    category: UF_CAT,
    title: { vi: "Last Day Where You Can Still Cross", en: "Last Day Where You Can Still Cross" },
    titleVi: { vi: "Ngày cuối vẫn băng qua được", en: "Latest day where crossing is possible" },
    statement: { vi: "Các ô bị ngập theo từng ngày. Tìm ngày cuối còn đường đất từ hàng trên xuống hàng dưới. Nhập cells 1-based dạng r,c;r,c.", en: "Cells flood day by day. Find the latest day with a land path from top row to bottom row. Enter 1-based cells as r,c;r,c." },
    defaultInput: "1,1;2,1;1,2;2,2",
    inputKind: "string",
    inputLabel: { vi: "cells (1-based, cách ;)", en: "cells (1-based, separated by ;)" },
    extraParams: [
      { key: "rows", label: { vi: "rows", en: "rows" }, default: 2 },
      { key: "cols", label: { vi: "cols", en: "cols" }, default: 2 },
    ],
    approach: [
      { vi: "Đi ngược từ ngày cuối, thêm lại từng ô đất.", en: "Work backward from the final day, adding land cells back." },
      { vi: "Union ô đất mới với hàng xóm đất và virtual top/bottom.", en: "Union the new land cell with land neighbors and virtual top/bottom nodes." },
      { vi: "Lần đầu top nối bottom là đáp án.", en: "The first time top connects to bottom is the answer." },
    ],
    complexity: { time: "O(R·C·α(RC))", space: "O(R·C)", note: { vi: "Mỗi ô được thêm và union tối đa 4 lần.", en: "Each cell is added and unioned with at most 4 neighbors." } },
    code: ["class Solution:", "    def latestDayToCross(self, row, col, cells):", "        parent = list(range(row * col + 2))", "        land = [[False] * col for _ in range(row)]", "        for day in range(len(cells) - 1, -1, -1):", "            r, c = cells[day][0] - 1, cells[day][1] - 1", "            land[r][c] = True", "            union(cell, top/bottom/neighbors)", "            if find(top) == find(bottom):", "                return day", "        return 0"],
    builder: buildSteps1970,
  },
});
