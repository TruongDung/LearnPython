// Aggregator for all problem categories.
// Each category file exports problem entries as an object.
// Optional `__meta` key in the export carries category-wide metadata
// (recommended learning order, learning guide, etc.).
//
// Output:
//   SUPPORTED       — { [problemId]: problem }
//   CATEGORY_ORDER  — { [categoryKey]: meta }
//
// Note: use literal require() calls (not dynamic) so bundlers like Vercel
// can statically detect and include all category files.

const categories = {
  dp: Object.assign(require("./dp"), require("./good-subsequences"), require("./weighted-intervals"), require("./palindrome-dp"), require("./counting-dp"), require("./shelf-dp"), require("./longest-line-matrix"), require("./freedom-trail-514"), require("./race-car-818"), require("./k-inverse-pairs-629"), require("./strange-printer-664"), require("./count-different-palindromic-subsequences-730"), require("./cherry-pickup-741"), require("./maximum-value-k-coins-2218"), require("./longest-subsequence-target-2915"), require("./valid-parentheses-path-2267"), require("./hard-dp-visualizations"), require("./hard-dp-3117"), require("./increasing-paths-2328"), require("./increasing-cells-2713")),
  sliding: Object.assign(require("./sliding"), require("./sliding-advanced"), require("./sliding-missing"), require("./visible-points-1610"), require("./hard-range-visualizations"), require("./vowel-substrings-3306"), require("./distinct-triplets-1876")),
  graph: Object.assign(require("./graph"), require("./cracking-safe-753"), require("./number-bfs"), require("./node-sequence-score"), require("./hard-graph-visualizations"), require("./hard-graph-2699")),
  math: require("./math"),
  "two-pointer": Object.assign(require("./two-pointer"), require("./maximum-distance-1855"), require("./reverse-vowels-345"), require("./reverse-only-letters-917"), require("./backspace-compare-844"), require("./longest-dictionary-word-524"), require("./minimum-length-1750")),
  array: Object.assign(require("./array"), require("./calendar"), require("./calendar-two"), require("./adjacent-increasing"), require("./digit-sum-index"), require("./maximum-sum-permutation"), require("./disappeared-numbers-448")),
  trie: Object.assign(require("./trie"), require("./prefix-scores-2416"), require("./hard-trie-3045")),
  hashmap: require("./hashmap"),
  greedy: Object.assign(require("./greedy"), require("./hard-greedy-2589"), require("./hard-geometry-3027"), require("./valid-parenthesis-string-678"), require("./furthest-houses-2078")),
  string: Object.assign(require("./string"), require("./string-chunking"), require("./brace-expansion-ii"), require("./basic-calculator-iv-770"), require("./special-binary-string-761"), require("./text-justification-68"), require("./hard-string-1923"), require("./special-characters-3121"), require("./match-substring-replacement-2301"), require("./remove-outermost-parentheses-1021"), require("./score-parentheses-856"), require("./minimum-insertions-parentheses-1541"), require("./locked-parentheses-2116"), require("./minimize-expression-2232"), require("./different-parentheses-241"), require("./apply-substitutions-3481"), require("./to-lower-case-709"), require("./defanging-ip-1108"), require("./equivalent-string-arrays-1662"), require("./goal-parser-1678"), require("./reverse-string-ii-541"), require("./reverse-words-iii-557"), require("./reverse-words-151"), require("./valid-anagram-242"), require("./find-the-difference-389"), require("./longest-palindrome-409"), require("./word-pattern-290"), require("./frequency-sort-451"), require("./close-strings-1657")),
  backtracking: Object.assign(require("./backtracking"), require("./generate-parentheses-22")),
  bst: require("./bst"),
  "binary-tree": Object.assign(require("./tree"), require("./hard-tree-visualizations"), require("./hard-tree-2872")),
  heap: Object.assign(require("./heap"), require("./server-heap"), require("./meeting-rooms-iii")),
  "union-find": Object.assign(require("./union-find"), require("./hard-union-find-visualizations"), require("./number-of-good-paths-2421")),
  "linked-list": require("./linked-list"),
  "binary-lifting": Object.assign(require("./binary-lifting"), require("./minimum-edge-weight-equilibrium-queries-2846")),
  "binary-search": Object.assign(require("./binary-search"), require("./range-module")),
  "monotonic-stack": require("./monotonic-stack"),
  bitmask: Object.assign(require("./bitmask"), require("./hard-bitmask-visualizations"), require("./hard-bitmask-1723"), require("./wonderful-substrings-1915")),
  design: Object.assign(require("./music-player"), require("./sparse-vector"), require("./server-allocator-9018"), require("./lib-register-9019"), require("./smallest-infinite-set-2336"), require("./seat-manager-1845"), require("./phone-directory-379"), require("./number-containers-2349"), require("./log-system-635"), require("./prefix-suffix-search-745")),
  interview: Object.assign(require("./interview"), require("./requested-visualizations")),
};

const SUPPORTED = {};
const CATEGORY_ORDER = {};
const DP_TAG = { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" };
const MONOTONIC_STACK_TAG = { key: "monotonic-stack", vi: "Monotonic Stack", en: "Monotonic Stack" };
const MONOTONIC_STACK_IDS = new Set([
  496, 1475, 316, 402, 456, 503, 581, 654, 739, 769, 853, 901, 907, 962,
  1008, 1019, 1081, 1124, 1130, 1504, 1574, 1673, 1856, 1996, 2104, 2289,
  2487, 2865, 2866, 255, 1762, 1950, 2282, 2297, 2345, 2832, 2863, 42,
  84, 85, 321, 768, 975, 1526, 1776, 1793, 1944, 2281, 2334, 2454, 2617,
  2736, 2818, 2940, 2945, 1063, 2030, 2355,
  3113, 3205, 3221, 3359, 3430,
]);
const BITMASK_TAG = { key: "bitmask", vi: "Bitmask", en: "Bitmask" };
const BITMASK_IDS = new Set([
  78, 136, 191, 231, 268, 318, 338, 461, 476, 526, 693, 698, 868,
  1125, 1342, 1799, 1879, 2220,
]);
const KNAPSACK_TAG = { key: "0-1-knapsack", vi: "Balo 0/1", en: "0/1 Knapsack" };
// Problems with a built visualization that belong to the 0/1 Knapsack pattern.
// Add more IDs here as new visualizations are built.
const KNAPSACK_IDS = new Set([
  // Nhóm A — kinh điển
  416,  // Partition Equal Subset Sum
  494,  // Target Sum
  474,  // Ones and Zeroes
  1049, // Last Stone Weight II
  2915, // Length of the Longest Subsequence That Sums to Target
  // Nhóm B — Subset / Counting / Partition
  698,  // Partition to K Equal Sum Subsets
  879,  // Profitable Schemes
  // Nhóm C — biến thể nâng cao
  2218, // Maximum Value of K Coins From Piles
]);

// ─── Company tag ────────────────────────────────────────────────────────────
// One top-level "Company" group that the catalog renders with a sub-tab per
// company. Ids that are not implemented yet are simply skipped, so a list can
// be filled in ahead of the visualizations being built.
const COMPANY_TAG = { key: "company", vi: "Công ty", en: "Company" };
// Each roster entry is [id, title, difficulty]. Entries whose problem is not
// implemented yet are still listed — the catalog shows them greyed out so the
// full company list stays visible while visualizations are added over time.
const COMPANY_LISTS = {
  google: {
    key: "google",
    vi: "Google",
    en: "Google",
    roster: [
      [1293, "Shortest Path in a Grid with Obstacles Elimination", "hard"],
      [528, "Random Pick with Weight", "medium"],
      [1937, "Maximum Number of Points with Cost", "medium"],
      [777, "Swap Adjacent in LR String", "medium"],
      [778, "Swim in Rising Water", "hard"],
      [539, "Minimum Time Difference", "medium"],
      [1055, "Shortest Way to Form String", "medium"],
      [2101, "Detonate the Maximum Bombs", "medium"],
      [1554, "Strings Differ by One Character", "medium"],
      [418, "Sentence Screen Fitting", "medium"],
      [419, "Battleships in a Board", "medium"],
      [552, "Student Attendance Record II", "hard"],
      [792, "Number of Matching Subsequences", "medium"],
      [900, "RLE Iterator", "medium"],
      [2096, "Step-By-Step Directions From a Binary Tree Node to Another", "medium"],
      [1105, "Filling Bookcase Shelves", "medium"],
      [2115, "Find All Possible Recipes from Given Supplies", "medium"],
      [1606, "Find Servers That Handled Most Number of Requests", "hard"],
      [2402, "Meeting Rooms III", "hard"],
      [2242, "Maximum Score of a Node Sequence", "hard"],
      [562, "Longest Line of Consecutive One in Matrix", "medium"],
      [1101, "The Earliest Moment When Everyone Become Friends", "medium"],
      [2416, "Sum of Prefix Scores of Strings", "hard"],
      [68, "Text Justification", "hard"],
      [818, "Race Car", "hard"],
      [1610, "Maximum Number of Visible Points", "hard"],
      [329, "Longest Increasing Path in a Matrix", "hard"],
      [2421, "Number of Good Paths", "hard"],
      [715, "Range Module", "hard"],
      [1996, "The Number of Weak Characters in the Game", "medium"],
      [1387, "Sort Integers by The Power Value", "medium"],
      [2135, "Count Words Obtained After Adding a Letter", "medium"],
      [729, "My Calendar I", "medium"],
      [2162, "Minimum Cost to Set Cooking Time", "medium"],
      [2013, "Detect Squares", "medium"],
      [2128, "Remove All Ones With Row and Column Flips", "medium"],
      [833, "Find And Replace in String", "medium"],
      [489, "Robot Room Cleaner", "hard"],
      [1146, "Snapshot Array", "medium"],
      [2018, "Check if Word Can Be Placed In Crossword", "medium"],
      [839, "Similar String Groups", "hard"],
      [359, "Logger Rate Limiter", "easy"],
      [2178, "Maximum Split of Positive Even Integers", "medium"],
      [843, "Guess the Word", "hard"],
      [1048, "Longest String Chain", "medium"],
      [366, "Find Leaves of Binary Tree", "medium"],
      [2034, "Stock Price Fluctuation", "medium"],
      [2172, "Maximum AND Sum of Array", "hard"],
      [2158, "Amount of New Area Painted Each Day", "hard"],
      [253, "Meeting Rooms II", "medium"],
      [834, "Sum of Distances in Tree", "hard"],
      [2846, "Minimum Edge Weight Equilibrium Queries in a Tree", "hard"],
      [1915, "Number of Wonderful Substrings", "medium"],
      [2386, "Find the K-Sum of an Array", "hard"],
      [9005, "Next Word Predictor", "medium"],
      [9006, "Graph BFS Shortest Path", "medium"],
      [921, "Minimum Add to Make Parentheses Valid", "medium"],
    ],
  },
  microsoft: {
    key: "microsoft",
    vi: "Microsoft",
    en: "Microsoft",
    roster: [
      [1570, "Dot Product of Two Sparse Vectors", "medium"],
      [9006, "Graph BFS Shortest Path", "medium"],
      [1, "Two Sum", "easy"],
      [167, "Two Sum II - Input Array Is Sorted", "medium"],
    ],
  },
  apple: {
    key: "apple",
    vi: "Apple",
    en: "Apple",
    roster: [
      [208, "Implement Trie (Prefix Tree)", "medium"],
      [9011, "On-Disk Key-Value Store", "medium"],
      [9012, "Vending Machine Change", "medium"],
      [9013, "Perfect-Square Arrangement", "hard"],
    ],
  },
  netflix: {
    key: "netflix",
    vi: "Netflix",
    en: "Netflix",
    roster: [
      [9014, "Loyal Customers from Daily Logs", "medium"],
      [9015, "Interval Overlap Counter", "medium"],
      [9016, "Movie-History Friends", "hard"],
      [9017, "Ad Promotion Metrics System", "hard"],
    ],
  },
};

for (const [catKey, mod] of Object.entries(categories)) {
  const { __meta, ...problems } = mod;
  Object.assign(SUPPORTED, problems);
  if (__meta) {
    CATEGORY_ORDER[catKey] = __meta;
    if (__meta.extraCategories) {
      Object.assign(CATEGORY_ORDER, __meta.extraCategories);
    }
  }
}

for (const id of MONOTONIC_STACK_IDS) {
  const problem = SUPPORTED[id];
  if (!problem) continue;
  const tags = Array.isArray(problem.tags) ? problem.tags : [];
  if (!tags.some((tag) => tag && tag.key === MONOTONIC_STACK_TAG.key)) {
    problem.tags = [...tags, MONOTONIC_STACK_TAG];
  }
}

for (const id of BITMASK_IDS) {
  const problem = SUPPORTED[id];
  if (!problem) continue;
  const tags = Array.isArray(problem.tags) ? problem.tags : [];
  if (!tags.some((tag) => tag && tag.key === BITMASK_TAG.key)) {
    problem.tags = [...tags, BITMASK_TAG];
  }
}

for (const id of KNAPSACK_IDS) {
  const problem = SUPPORTED[id];
  if (!problem) continue;
  const tags = Array.isArray(problem.tags) ? problem.tags : [];
  if (!tags.some((tag) => tag && tag.key === KNAPSACK_TAG.key)) {
    problem.tags = [...tags, KNAPSACK_TAG];
  }
}

// Keep aliases from splitting one visible catalog label into multiple groups.
// `dp` and `0-1-knapsack` are the canonical keys for their respective topics.
for (const problem of Object.values(SUPPORTED)) {
  if (!problem || typeof problem !== "object") continue;
  if (problem.category && ["dp", "dynamic-programming"].includes(problem.category.key)) {
    problem.category = DP_TAG;
  }
  if (problem.category && ["knapsack", "0-1-knapsack"].includes(problem.category.key)) {
    problem.category = KNAPSACK_TAG;
  }
  if (!Array.isArray(problem.tags)) continue;
  const seenTagKeys = new Set();
  problem.tags = problem.tags
    .map((tag) => {
      if (tag && ["dp", "dynamic-programming"].includes(tag.key)) return DP_TAG;
      if (tag && ["knapsack", "0-1-knapsack"].includes(tag.key)) return KNAPSACK_TAG;
      return tag;
    })
    .filter((tag) => {
      if (!tag || !tag.key || seenTagKeys.has(tag.key)) return false;
      seenTagKeys.add(tag.key);
      return true;
    });
}

// COMPANY_SUBTABS carries the full roster (including not-yet-built problems) so
// the catalog can render the complete company list.
const COMPANY_SUBTABS = Object.values(COMPANY_LISTS).map((list) => ({
  key: list.key,
  vi: list.vi,
  en: list.en,
  roster: list.roster.map(([id, title, difficulty]) => ({
    id,
    title,
    difficulty,
    available: Boolean(SUPPORTED[id]),
  })),
}));

// Only a `companies` list is attached to each problem. The company axis is
// deliberately kept OUT of `problem.tags`: tags describe the algorithm, and
// mixing "Google" in there both pollutes the tag chips shown on a problem and
// makes every "these are this problem's tags" assertion depend on which company
// rosters happen to mention it. server.js builds the Company group from
// COMPANY_SUBTABS instead.
for (const list of Object.values(COMPANY_LISTS)) {
  for (const [id] of list.roster) {
    const problem = SUPPORTED[id];
    if (!problem) continue;
    const companies = Array.isArray(problem.companies) ? problem.companies : [];
    if (!companies.includes(list.key)) problem.companies = [...companies, list.key];
  }
}

// ─── 0/1 Knapsack learning path ──────────────────────────────────────────────
// 24 problems ordered from the core take/skip recurrence through counting,
// grouped choices, richer partition states, and advanced optimizations.
// Entries whose id is not in SUPPORTED still appear as dimmed catalog chips.
// Format: [id, title, difficulty]
const KNAPSACK_ROSTER_RAW = [
  // Stage 1 — Core one-dimensional take/skip
  [416,  "Partition Equal Subset Sum",                                      "medium"],
  [1049, "Last Stone Weight II",                                             "medium"],
  [494,  "Target Sum",                                                       "medium"],
  [2915, "Length of the Longest Subsequence That Sums to Target",           "medium"],
  // Stage 2 — Counting and extra dimensions
  [474,  "Ones and Zeroes",                                                  "medium"],
  [2787, "Ways to Express an Integer as Sum of Powers",                     "medium"],
  [879,  "Profitable Schemes",                                              "hard"],
  [2518, "Number of Great Partitions",                                      "hard"],
  [2585, "Number of Ways to Earn Points",                                   "hard"],
  // Stage 3 — Bounded and grouped choices
  [1774, "Closest Dessert Cost",                                            "medium"],
  [2291, "Maximum Profit From Trading Stocks",                              "medium"],
  [2218, "Maximum Value of K Coins From Piles",                            "hard"],
  [1981, "Minimize the Difference Between Target and Chosen Elements",      "medium"],
  [3333, "Find the Original Typed String II",                               "hard"],
  // Stage 4 — Richer partition state
  [473,  "Matchsticks to Square",                                           "medium"],
  [698,  "Partition to K Equal Sum Subsets",                                "medium"],
  [805,  "Split Array With Same Average",                                   "hard"],
  [956,  "Tallest Billboard",                                               "hard"],
  // Stage 5 — Advanced optimization
  [2742, "Painting the Walls",                                              "hard"],
  [3082, "Find the Sum of the Power of All Subsequences",                   "hard"],
  [3180, "Maximum Total Reward Using Operations I",                         "medium"],
  [3181, "Maximum Total Reward Using Operations II",                        "hard"],
  [1755, "Closest Subsequence Sum",                                         "hard"],
  [2035, "Partition Array Into Two Arrays to Minimize Sum Difference",      "hard"],
];

const KNAPSACK_ORDER_LABEL = {
  vi: "Lộ trình 0/1 Knapsack: nền tảng → đếm & nhiều chiều → lựa chọn theo nhóm → partition → tối ưu nâng cao",
  en: "0/1 Knapsack path: foundations → counting & dimensions → grouped choices → partition → advanced optimization",
};

const KNAPSACK_GUIDE = {
  vi: {
    intro:
      "Học theo 24 bài dưới đây. Trước tiên hãy thuộc invariant cốt lõi: mỗi món chỉ được dùng tối đa một lần, nên khi tối ưu DP theo capacity phải duyệt capacity từ lớn xuống nhỏ. Sau đó mới mở rộng state, số cách chọn và kỹ thuật tối ưu.",
    patterns: [
      { id: 416, name: "Partition Equal Subset Sum", pattern: "Boolean subset sum · nền tảng" },
      { id: 1049, name: "Last Stone Weight II", pattern: "Subset gần total / 2 nhất" },
      { id: 494, name: "Target Sum", pattern: "Biến đổi dấu ± thành đếm subset" },
      { id: 2915, name: "Longest Subsequence That Sums to Target", pattern: "Exact sum · tối đa số món" },
      { id: 474, name: "Ones and Zeroes", pattern: "0/1 Knapsack hai capacity" },
      { id: 2787, name: "Ways to Express an Integer as Sum of Powers", pattern: "Đếm subset với item sinh trước" },
      { id: 879, name: "Profitable Schemes", pattern: "Hai chiều · profit được cap" },
      { id: 2518, name: "Number of Great Partitions", pattern: "Đếm phần bù của partition xấu" },
      { id: 2585, name: "Number of Ways to Earn Points", pattern: "Bounded knapsack · đếm cách" },
      { id: 1774, name: "Closest Dessert Cost", pattern: "Mỗi item dùng 0/1/2 lần" },
      { id: 2291, name: "Maximum Profit From Trading Stocks", pattern: "Budget → tối đa profit" },
      { id: 2218, name: "Maximum Value of K Coins From Piles", pattern: "Group knapsack · chọn prefix" },
      { id: 1981, name: "Minimize the Difference", pattern: "Chọn đúng một item mỗi hàng" },
      { id: 3333, name: "Find the Original Typed String II", pattern: "Bounded choices + prefix sum" },
      { id: 473, name: "Matchsticks to Square", pattern: "Partition thành 4 bucket" },
      { id: 698, name: "Partition to K Equal Sum Subsets", pattern: "Partition k bucket · memo/bitmask" },
      { id: 805, name: "Split Array With Same Average", pattern: "Subset theo cả count và sum" },
      { id: 956, name: "Tallest Billboard", pattern: "DP theo hiệu hai phía" },
      { id: 2742, name: "Painting the Walls", pattern: "Đổi bài toán thành capacity được bù" },
      { id: 3082, name: "Sum of the Power of All Subsequences", pattern: "Contribution DP + combinatorics" },
      { id: 3180, name: "Maximum Total Reward I", pattern: "Reachability có điều kiện" },
      { id: 3181, name: "Maximum Total Reward II", pattern: "Bitset-optimized reachability" },
      { id: 1755, name: "Closest Subsequence Sum", pattern: "Meet-in-the-middle subset sums" },
      { id: 2035, name: "Partition Array Into Two Arrays", pattern: "Meet-in-the-middle theo cardinality" },
    ],
    stages: [
      {
        title: "Giai đoạn 1 — Thuộc công thức Take / Skip",
        description: "Tự viết được dp[s] dạng boolean, max và count; giải thích vì sao vòng capacity phải chạy giảm dần để không dùng lại cùng một item.",
        problems: [416, 1049, 494, 2915],
      },
      {
        title: "Giai đoạn 2 — Đếm cách và mở rộng chiều",
        description: "Thêm capacity thứ hai, state profit bị cap và số lượng mỗi loại; phân biệt boolean DP, optimization DP và counting DP.",
        problems: [474, 2787, 879, 2518, 2585],
      },
      {
        title: "Giai đoạn 3 — Bounded và Group Knapsack",
        description: "Mỗi nhóm có nhiều lựa chọn nhưng chỉ được chốt một phương án: 0/1/2 món, một giao dịch, một prefix hoặc đúng một phần tử mỗi hàng.",
        problems: [1774, 2291, 2218, 1981, 3333],
      },
      {
        title: "Giai đoạn 4 — Partition với state giàu hơn",
        description: "State không còn chỉ là một tổng: theo dõi bucket, số phần tử đã chọn hoặc chênh lệch giữa hai phía.",
        problems: [473, 698, 805, 956],
      },
      {
        title: "Giai đoạn 5 — Tối ưu hóa nâng cao",
        description: "Học biến đổi capacity, contribution DP, bitset và meet-in-the-middle khi tổng hoặc n vượt giới hạn của DP cổ điển.",
        problems: [2742, 3082, 3180, 3181, 1755, 2035],
      },
    ],
    conclusion:
      "Sau lộ trình này, bạn nên nhận ra bốn câu hỏi trước khi code: item dùng được mấy lần, state cần lưu gì, thứ tự duyệt capacity ra sao, và constraint có buộc dùng bitset hoặc meet-in-the-middle hay không.",
  },
  en: {
    intro:
      "Work through these 24 problems in order. First internalize the core invariant: each item may be used at most once, so a space-optimized capacity loop must run from high to low. Then extend the state, count choices, and learn the major optimizations.",
    patterns: [
      { id: 416, name: "Partition Equal Subset Sum", pattern: "Boolean subset sum · foundation" },
      { id: 1049, name: "Last Stone Weight II", pattern: "Subset closest to total / 2" },
      { id: 494, name: "Target Sum", pattern: "Transform ± signs into subset counting" },
      { id: 2915, name: "Longest Subsequence That Sums to Target", pattern: "Exact sum · maximize item count" },
      { id: 474, name: "Ones and Zeroes", pattern: "Two-capacity 0/1 Knapsack" },
      { id: 2787, name: "Ways to Express an Integer as Sum of Powers", pattern: "Count subsets of generated items" },
      { id: 879, name: "Profitable Schemes", pattern: "Two dimensions · capped profit" },
      { id: 2518, name: "Number of Great Partitions", pattern: "Count the complement of bad partitions" },
      { id: 2585, name: "Number of Ways to Earn Points", pattern: "Bounded knapsack · count ways" },
      { id: 1774, name: "Closest Dessert Cost", pattern: "Use each item zero, one, or two times" },
      { id: 2291, name: "Maximum Profit From Trading Stocks", pattern: "Budget → maximize profit" },
      { id: 2218, name: "Maximum Value of K Coins From Piles", pattern: "Group knapsack · choose a prefix" },
      { id: 1981, name: "Minimize the Difference", pattern: "Choose exactly one item per row" },
      { id: 3333, name: "Find the Original Typed String II", pattern: "Bounded choices + prefix sums" },
      { id: 473, name: "Matchsticks to Square", pattern: "Partition into four buckets" },
      { id: 698, name: "Partition to K Equal Sum Subsets", pattern: "K buckets · memo/bitmask" },
      { id: 805, name: "Split Array With Same Average", pattern: "Subset by both count and sum" },
      { id: 956, name: "Tallest Billboard", pattern: "DP on the difference between sides" },
      { id: 2742, name: "Painting the Walls", pattern: "Transform into compensated capacity" },
      { id: 3082, name: "Sum of the Power of All Subsequences", pattern: "Contribution DP + combinatorics" },
      { id: 3180, name: "Maximum Total Reward I", pattern: "Conditional reachability" },
      { id: 3181, name: "Maximum Total Reward II", pattern: "Bitset-optimized reachability" },
      { id: 1755, name: "Closest Subsequence Sum", pattern: "Meet-in-the-middle subset sums" },
      { id: 2035, name: "Partition Array Into Two Arrays", pattern: "Meet-in-the-middle by cardinality" },
    ],
    stages: [
      {
        title: "Stage 1 — Master the Take / Skip recurrence",
        description: "Write boolean, maximum, and counting forms of dp[s], and explain why capacity runs backward to avoid reusing the current item.",
        problems: [416, 1049, 494, 2915],
      },
      {
        title: "Stage 2 — Count ways and add dimensions",
        description: "Add a second capacity, capped profit, and bounded quantities; distinguish feasibility, optimization, and counting DP.",
        problems: [474, 2787, 879, 2518, 2585],
      },
      {
        title: "Stage 3 — Bounded and Group Knapsack",
        description: "A group offers several choices but only one decision is committed: zero/one/two items, one trade, one prefix, or one value per row.",
        problems: [1774, 2291, 2218, 1981, 3333],
      },
      {
        title: "Stage 4 — Partition with richer state",
        description: "The state is no longer only a sum: track buckets, selected cardinality, or the difference between two sides.",
        problems: [473, 698, 805, 956],
      },
      {
        title: "Stage 5 — Advanced optimization",
        description: "Learn capacity transformations, contribution DP, bitsets, and meet-in-the-middle when classic pseudo-polynomial DP no longer fits.",
        problems: [2742, 3082, 3180, 3181, 1755, 2035],
      },
    ],
    conclusion:
      "After this path, ask four questions before coding: how often may each item be used, what must the state remember, which direction should capacity iterate, and do the constraints require a bitset or meet-in-the-middle approach?",
  },
};

// Single "All" tab — same shape as COMPANY_SUBTABS so server.js / app-core.js
// can reuse the same subTabs rendering path.
const KNAPSACK_SUBTABS = [
  {
    key: "all",
    vi: "Tất cả",
    en: "All",
    roster: KNAPSACK_ROSTER_RAW.map(([id, title, difficulty]) => ({
      id,
      title,
      difficulty,
      available: Boolean(SUPPORTED[id]),
    })),
  },
];

module.exports = {
  SUPPORTED,
  CATEGORY_ORDER,
  COMPANY_SUBTABS,
  COMPANY_TAG,
  KNAPSACK_SUBTABS,
  KNAPSACK_TAG,
  KNAPSACK_ORDER_LABEL,
  KNAPSACK_GUIDE,
};
