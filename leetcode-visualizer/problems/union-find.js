// LeetCode Visualizer — Union-Find (Disjoint Set Union) problems.
// Visualization strategy:
//   - arr[]  = parent[] array (each bar = a node; bar height = parent id)
//   - sub[]  = rank[]/size[] array shown below
//   - highlight = nodes just merged (amber)
//   - mark      = nodes that are roots (green)

const UF_CAT = { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" };

// ─── 547: Number of Provinces ───
function buildSteps547(input) {
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

  // ── Union-Find ──
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  let components = n;

  function find(x) {
    let r = x;
    while (parent[r] !== r) r = parent[r];
    return r;
  }
  function findWithCompress(x) {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }
  function roots() { return new Set(Array.from({length:n},(_,i)=>find(i))); }

  // ── Build edge list from upper triangle ──
  const allEdges = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (matrix[i][j] === 1) allEdges.push({ u: i, v: j });

  // ── Graph snapshot helper ──
  // addedEdges: Set of "u-v" strings already merged into graph
  // hlNodes: nodes to highlight amber (currently being processed)
  // hlEdges: edges to highlight amber
  // visitedNodes: nodes that are in a multi-node component (tô xanh nhạt)
  const addedSet = new Set(); // "u-v" added edges so far

  function graphSnap(hlNodes, hlEdges, title, note, vars, codeLines) {
    // Build graph nodes
    const gNodes = Array.from({length:n}, (_, i) => ({ id: i, label: String(i) }));

    // Build graph edges: only edges already unioned
    const gEdges = [];
    for (const key of addedSet) {
      const [u, v] = key.split("-").map(Number);
      gEdges.push({ u, v, w: "" });
    }

    // visitedNodes = nodes that share a component with at least 1 other node
    const compCount = new Map();
    for (let i = 0; i < n; i++) {
      const r = find(i);
      compCount.set(r, (compCount.get(r) || 0) + 1);
    }
    const visited = Array.from({length:n}, (_, i) => compCount.get(find(i)) > 1 ? i : -1).filter(x => x >= 0);

    return {
      title,
      arr: [...parent],
      sub: [...rank],
      highlight: (hlNodes || []),
      mark: Array.from({length:n}, (_, i) => i).filter(i => roots().has(i) && parent[i] === i),
      graph: {
        nodes: gNodes,
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

  // ── Step 0: intro — graph with no edges ──
  steps.push(graphSnap(
    [], [],
    { vi: "Khởi tạo: mỗi thành phố là 1 tỉnh riêng", en: "Init: each city is its own province" },
    {
      vi:
        `${n} thành phố, chưa có kết nối nào.\n` +
        `parent[i] = i, rank[i] = 0, components = ${n}.\n\n` +
        `Vòng tròn = thành phố; cạnh = kết nối trực tiếp (sẽ thêm dần).\n` +
        `Nút VÀNG = đang xét. Nút XANH = đã cùng tỉnh với ít nhất 1 nút khác.`,
      en:
        `${n} cities, no connections yet.\n` +
        `parent[i] = i, rank[i] = 0, components = ${n}.\n\n` +
        `Circle = city; edge = direct connection (added one by one).\n` +
        `AMBER node = being processed. BLUE node = already in a multi-city province.`,
    },
    [{ name: "components", value: components }, { name: "parent", value: `[${parent.join(",")}]` }],
    [2, 3, 4]
  ));

  // ── Process each edge in the upper triangle ──
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] !== 1) continue;

      const ri = find(i), rj = find(j);
      const alreadySame = ri === rj;

      // Step: check this edge
      steps.push(graphSnap(
        [i, j], [],
        { vi: `Kiểm tra (${i}, ${j}): connected = 1`, en: `Check (${i}, ${j}): connected = 1` },
        {
          vi:
            `matrix[${i}][${j}] = 1 → thành phố ${i} và ${j} kết nối trực tiếp.\n` +
            `find(${i}) = ${ri},  find(${j}) = ${rj}.\n` +
            (alreadySame
              ? `Cùng gốc ${ri} → đã cùng tỉnh, bỏ qua.`
              : `Khác gốc → cần UNION.`),
          en:
            `matrix[${i}][${j}] = 1 → cities ${i} and ${j} are directly connected.\n` +
            `find(${i}) = ${ri},  find(${j}) = ${rj}.\n` +
            (alreadySame
              ? `Same root ${ri} → already same province, skip.`
              : `Different roots → need to UNION.`),
        },
        [{ name: "edge", value: `(${i}, ${j})` }, { name: "find(i)", value: ri }, { name: "find(j)", value: rj }, { name: "same?", value: alreadySame }],
        [6, 7, 8]
      ));

      if (alreadySame) continue;

      // Union by rank
      let from, to;
      if (rank[ri] < rank[rj]) { parent[ri] = rj; from = ri; to = rj; }
      else if (rank[ri] > rank[rj]) { parent[rj] = ri; from = rj; to = ri; }
      else { parent[rj] = ri; rank[ri]++; from = rj; to = ri; }
      components--;

      // Add edge to graph
      addedSet.add(`${Math.min(i,j)}-${Math.max(i,j)}`);

      steps.push(graphSnap(
        [i, j], [`${Math.min(i,j)}-${Math.max(i,j)}`],
        { vi: `Union(${i}, ${j}) → ${components} tỉnh`, en: `Union(${i}, ${j}) → ${components} province(s)` },
        {
          vi:
            `Gắn gốc ${from} vào gốc ${to} (union by rank).\n` +
            `parent[${from}] = ${to}, rank[${to}] = ${rank[to]}.\n` +
            `Cạnh (${i}─${j}) xuất hiện trên đồ thị. Số tỉnh còn lại = ${components}.`,
          en:
            `Attach root ${from} under ${to} (union by rank).\n` +
            `parent[${from}] = ${to}, rank[${to}] = ${rank[to]}.\n` +
            `Edge (${i}─${j}) appears on the graph. Provinces remaining = ${components}.`,
        },
        [{ name: "from", value: from }, { name: "to (root)", value: to }, { name: "parent", value: `[${parent.join(",")}]` }, { name: "rank", value: `[${rank.join(",")}]` }, { name: "components", value: components }],
        [9, 10, 11]
      ));
    }
  }

  // ── Final ──
  const finalRoots = [...roots()];
  const fs = graphSnap(
    [], [],
    { vi: `Kết quả: ${components} tỉnh`, en: `Result: ${components} province(s)` },
    {
      vi:
        `Duyệt hết ma trận. ${components} nhóm kết nối = ${components} tỉnh.\n` +
        `Các gốc đại diện: {${finalRoots.join(", ")}}.\n` +
        `Trên đồ thị: mỗi tập nút nối nhau = 1 tỉnh.`,
      en:
        `Matrix fully processed. ${components} connected components = ${components} province(s).\n` +
        `Representative roots: {${finalRoots.join(", ")}}.\n` +
        `On the graph: each cluster of connected nodes = one province.`,
    },
    [{ name: "answer", value: components }],
    [12]
  );
  fs.final = true;
  steps.push(fs);

  return { input, answer: components, steps };
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
    defaultInput: "[[1,1,0],[1,1,0],[0,0,1]]",
    inputKind: "string",
    inputLabel: { vi: "Ma trận kề dạng [[1,1,0],[1,1,0],[0,0,1]]", en: "Adjacency matrix e.g. [[1,1,0],[1,1,0],[0,0,1]]" },
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
};
