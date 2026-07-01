// LeetCode Visualizer — Union-Find (Disjoint Set Union) problems.
// Visualization strategy:
//   - arr[]  = parent[] array (each bar = a node; bar height = parent id)
//   - sub[]  = rank[]/size[] array shown below
//   - highlight = nodes just merged (amber)
//   - mark      = nodes that are roots (green)

const UF_CAT = { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" };

// ─── 547: Number of Provinces ───
function buildSteps547(input) {
  // Input: adjacency matrix rows separated by ';', values by ','
  // e.g. "1,1,0;1,1,0;0,0,1"
  const matrix = String(input)
    .split(";")
    .map((row) => row.split(",").map((s) => Number(s.trim())));
  const n = matrix.length;
  const steps = [];

  // ── Union-Find with path compression + union by rank ──
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  let components = n;

  function roots() { return new Set(parent.map((_, i) => find(i))); }
  function find(x) {
    // Iterative path compression (no mutation during snapshot).
    let r = x;
    while (parent[r] !== r) r = parent[r];
    return r;
  }
  function findWithCompress(x) {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }

  // Helper: snapshot
  function snap(title, note, hlSet, extra) {
    const rootSet = roots();
    return {
      title,
      arr: [...parent],       // bar chart: bar[i] = parent[i]
      sub: [...rank],         // sub bars: rank[i]
      highlight: [...Array(n).keys()].filter((i) => hlSet && hlSet.has(i)),
      mark:      [...Array(n).keys()].filter((i) => rootSet.has(i) && parent[i] === i),
      codeLines: extra?.codeLines || [],
      vars: extra?.vars || [],
      note,
    };
  }

  // ── Step 0: intro ──
  steps.push(snap(
    { vi: "Khởi tạo Union-Find", en: "Initialize Union-Find" },
    {
      vi:
        `${n} thành phố (nodes 0‥${n - 1}). Ban đầu mỗi thành phố là 1 tỉnh riêng.\n` +
        `parent[i] = i (mỗi nút tự làm gốc), rank[i] = 0.\n` +
        `Thanh bar = parent[i]; nút tô XANH = root (gốc nhóm).`,
      en:
        `${n} cities (nodes 0‥${n - 1}). Initially every city is its own province.\n` +
        `parent[i] = i (each node is its own root), rank[i] = 0.\n` +
        `Bar height = parent[i]; GREEN nodes are roots.`,
    },
    new Set(),
    { codeLines: [2, 3, 4], vars: [{ name: "components", value: components }, { name: "parent", value: `[${parent.join(",")}]` }] }
  ));

  // ── Process each edge ──
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] !== 1) continue;

      const ri = find(i), rj = find(j);

      // Show the edge we are looking at.
      steps.push(snap(
        { vi: `Kiểm tra cạnh (${i}, ${j}): isConnected = 1`, en: `Check edge (${i}, ${j}): isConnected = 1` },
        {
          vi:
            `matrix[${i}][${j}] = 1 → thành phố ${i} và ${j} kết nối trực tiếp.\n` +
            `find(${i}) = ${ri},  find(${j}) = ${rj}.\n` +
            `${ri === rj ? `Cùng gốc ${ri} → đã cùng tỉnh, không cần union.` : `Khác gốc → cần UNION hai nhóm lại.`}`,
          en:
            `matrix[${i}][${j}] = 1 → city ${i} and city ${j} are directly connected.\n` +
            `find(${i}) = ${ri},  find(${j}) = ${rj}.\n` +
            `${ri === rj ? `Same root ${ri} → already in the same province, skip.` : `Different roots → need to UNION the two groups.`}`,
        },
        new Set([i, j]),
        { codeLines: [6, 7, 8], vars: [{ name: "i", value: i }, { name: "j", value: j }, { name: "find(i)", value: ri }, { name: "find(j)", value: rj }, { name: "same?", value: ri === rj }] }
      ));

      if (ri === rj) continue; // already same component

      // Union by rank.
      let from, to;
      if (rank[ri] < rank[rj]) { parent[ri] = rj; from = ri; to = rj; }
      else if (rank[ri] > rank[rj]) { parent[rj] = ri; from = rj; to = ri; }
      else { parent[rj] = ri; rank[ri]++; from = rj; to = ri; }
      components--;

      steps.push(snap(
        { vi: `Union(${i}, ${j}): gắn ${from} → ${to}`, en: `Union(${i}, ${j}): attach ${from} → ${to}` },
        {
          vi:
            `Gắn gốc ${from} vào gốc ${to} (union by rank).\n` +
            `parent[${from}] = ${to}.  rank[${to}] = ${rank[to]}.\n` +
            `Số tỉnh còn lại = ${components}.`,
          en:
            `Attach root ${from} under root ${to} (union by rank).\n` +
            `parent[${from}] = ${to}.  rank[${to}] = ${rank[to]}.\n` +
            `Provinces remaining = ${components}.`,
        },
        new Set([i, j, from, to]),
        { codeLines: [9, 10, 11], vars: [{ name: "from (attached)", value: from }, { name: "to (root)", value: to }, { name: "parent", value: `[${parent.join(",")}]` }, { name: "rank", value: `[${rank.join(",")}]` }, { name: "components", value: components }] }
      ));
    }
  }

  // ── Final step ──
  const finalRoots = [...roots()];
  const fs = snap(
    { vi: `Kết quả: ${components} tỉnh`, en: `Result: ${components} province(s)` },
    {
      vi:
        `Duyệt hết ma trận. Số gốc còn lại = số tỉnh = ${components}.\n` +
        `Các gốc: {${finalRoots.join(", ")}}.\n` +
        `Mỗi root (tô XANH) đại diện 1 tỉnh.`,
      en:
        `Matrix fully processed. Remaining roots = provinces = ${components}.\n` +
        `Roots: {${finalRoots.join(", ")}}.\n` +
        `Each green root represents one province.`,
    },
    new Set(),
    { codeLines: [12], vars: [{ name: "answer", value: components }] }
  );
  fs.final = true;
  steps.push(fs);

  return { input, answer: components, steps };
}

module.exports = {
  547: {
    id: 547,
    difficulty: "medium",
    slug: "number-of-provinces",
    category: UF_CAT,
    title: { vi: "Number of Provinces", en: "Number of Provinces" },
    titleVi: { vi: "Số lượng tỉnh (Union-Find)", en: "Number of connected components" },
    statement: {
      vi: "Cho ma trận kề isConnected[i][j]=1 nếu thành phố i và j kết nối trực tiếp. Tìm số TỈNH (nhóm kết nối). Nhập các hàng cách bởi ';', giá trị cách bởi ','.",
      en: "Given adjacency matrix isConnected where isConnected[i][j]=1 means city i and j are directly connected. Find the number of PROVINCES (connected components). Enter rows separated by ';', values by ','.",
    },
    defaultInput: "1,1,0;1,1,0;0,0,1",
    inputKind: "string",
    inputLabel: { vi: "Ma trận kề (hàng cách ';')", en: "Adjacency matrix (rows by ';')" },
    extraParams: [],
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
    builder: buildSteps547,
  },
};
